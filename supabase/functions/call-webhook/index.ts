// Sarvam posts here when a call ends. Saves what happened, raises the alarm if the parent mentioned
// something worrying, stops calling anyone who asked us to, then writes the note for their child.
//
// Sarvam doesn't sign these posts, so two things protect this door: the secret token in the URL
// we gave Sarvam, and the call id, which has to match a call we actually placed.
import Anthropic from 'npm:@anthropic-ai/sdk@1.3.0'
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2'
import {
  alertVariables,
  NOTE_SCHEMA,
  NOTE_SYSTEM,
  notePrompt,
  ownerAlertVariables,
  parseNote,
  readResult,
  sameSecret,
  type CallResult,
  type Family,
  type Turn,
} from '../_shared/khairiyat.ts'
import { alertAgent, db, env, json, placeCall } from '../_shared/server.ts'

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void }

type Call = { id: string; family_id: string; call_date: string; kind: 'daily' | 'alert'; attempt: number }

/** Rings the child. Only once a day: the database refuses a second alert. */
const alertChild = (sb: SupabaseClient, family: Family, day: string, what: string) =>
  placeCall(sb, { family, day, kind: 'alert', attempt: 1, to: family.child_phone, agent: alertAgent(), variables: alertVariables(family, what) })

async function writeNote(sb: SupabaseClient, call: Call, family: Family, transcript: Turn[], alreadyAlerted: boolean) {
  const claude = new Anthropic({ apiKey: env('ANTHROPIC_API_KEY') })
  const reply = await claude.messages.create({
    model: Deno.env.get('SUMMARY_MODEL') ?? 'claude-opus-5-5',
    max_tokens: 4000,
    system: NOTE_SYSTEM,
    output_config: { format: { type: 'json_schema', schema: NOTE_SCHEMA } },
    messages: [{ role: 'user', content: notePrompt(family, transcript) }],
  })
  if (reply.stop_reason !== 'end_turn') throw new Error(`no note: stopped with ${reply.stop_reason}`)
  const text = reply.content.find((b) => b.type === 'text')
  const note = text?.type === 'text' ? parseNote(text.text) : null
  if (!note) throw new Error('no note: the reply was not usable')

  await sb
    .from('call_attempts')
    .update({
      note: note.note,
      reason_to_call: note.reason_to_call,
      medicine_status: note.medicines,
      ...(note.urgent && !alreadyAlerted ? { urgent: note.urgent_reason } : {}),
    })
    .eq('id', call.id)
  // A second reader of the same call: catches what the word list missed.
  if (note.urgent && !alreadyAlerted) await alertChild(sb, family, call.call_date, note.urgent_reason || 'ek zaroori baat')
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token') ?? ''
  if (req.method !== 'POST' || !sameSecret(token, env('CALL_WEBHOOK_TOKEN'))) return json({ error: 'not allowed' }, 401)

  const result = (await req.json().catch(() => null)) as CallResult | null
  const callId = result?.webhook_config?.metadata?.call_id
  if (typeof callId !== 'string' || !/^[0-9a-f-]{36}$/.test(callId)) return json({ error: 'not one of our calls' }, 400)

  const sb = db()
  const { save, urgent, stop, writeNote: wantNote } = readResult(result!)

  // Only the row still marked 'dialing' is taken, so a repeated post from Sarvam does nothing twice.
  const { data: call, error } = await sb
    .from('call_attempts')
    .update({ ...save, finished_at: new Date().toISOString() })
    .eq('id', callId)
    .eq('status', 'dialing')
    .select('id, family_id, call_date, kind, attempt')
    .maybeSingle()
  if (error) return json({ error: error.message }, 500)
  if (!call) return json({ ok: true, note: 'already handled' })

  const { data: family } = await sb.from('call_families').select('*').eq('id', call.family_id).single()
  if (!family) return json({ ok: true })

  if (call.kind === 'alert') {
    // The child missed the alert. The person running the test is the last line.
    const owner = Deno.env.get('CALL_OWNER_PHONE')
    if (save.status !== 'connected' && call.attempt === 1 && owner) {
      const { data: first } = await sb.from('call_attempts').select('urgent').eq('family_id', family.id).eq('call_date', call.call_date).eq('kind', 'daily').not('urgent', 'is', null).limit(1).maybeSingle()
      await placeCall(sb, {
        family,
        day: call.call_date,
        kind: 'alert',
        attempt: 2,
        to: owner,
        agent: alertAgent(),
        variables: ownerAlertVariables(family, first?.urgent ?? 'ek zaroori baat'),
      })
    }
    return json({ ok: true })
  }

  if (stop) await sb.from('call_families').update({ status: 'paused' }).eq('id', family.id)
  if (urgent) await alertChild(sb, family, call.call_date, urgent)

  // Answer Sarvam now. The note can take a few seconds, and nothing waits on it.
  if (wantNote) {
    EdgeRuntime.waitUntil(
      writeNote(sb, call, family, save.transcript ?? [], !!urgent).catch((e) => console.error(`note for ${call.id}:`, String(e))),
    )
  }
  return json({ ok: true })
})
