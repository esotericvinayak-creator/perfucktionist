// The parts of Khairiyat that touch the outside world: secrets, the database, and placing a call.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2'
import { outboundBody, outboundUrl, type Agent, type Family, type Sarvam } from './khairiyat.ts'

export function env(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing secret ${name}. See docs/KHAIRIYAT.md.`)
  return value
}

export const db = () => createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

export const sarvam = (): Sarvam => ({
  apiKey: env('SARVAM_API_KEY'),
  org: env('SARVAM_ORG_ID'),
  workspace: env('SARVAM_WORKSPACE_ID'),
  connection: env('SARVAM_CONNECTION_ID'),
  number: env('SARVAM_AGENT_NUMBER'),
})

const agent = (kind: 'DAILY' | 'ALERT'): Agent => ({ id: env(`SARVAM_${kind}_APP_ID`), version: Number(env(`SARVAM_${kind}_APP_VERSION`)) })
export const dailyAgent = () => agent('DAILY')
export const alertAgent = () => agent('ALERT')

export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/**
 * Rings someone. The database row goes in first, so two overlapping runs can't both ring the same
 * person, and a call that can't be placed still leaves a record of why.
 */
export async function placeCall(
  sb: SupabaseClient,
  call: { family: Family; day: string; kind: 'daily' | 'alert'; attempt: number; to: string; agent: Agent; variables: Record<string, string> },
) {
  const { data, error } = await sb
    .from('call_attempts')
    .insert({ family_id: call.family.id, call_date: call.day, kind: call.kind, attempt: call.attempt })
    .select('id')
    .single()
  if (error?.code === '23505') return 'already placed'
  if (error) throw new Error(`could not record the call: ${error.message}`)

  const s = sarvam()
  const webhook = `${env('SUPABASE_URL')}/functions/v1/call-webhook?token=${encodeURIComponent(env('CALL_WEBHOOK_TOKEN'))}`
  try {
    const res = await fetch(outboundUrl(s), {
      method: 'POST',
      headers: { 'X-API-Key': s.apiKey, 'content-type': 'application/json' },
      body: JSON.stringify(outboundBody(s, call.agent, call.to, call.variables, data.id, webhook, call.family.language)),
    })
    if (!res.ok) throw new Error(`Sarvam said ${res.status}: ${(await res.text()).slice(0, 300)}`)
    const { attempt_id } = await res.json()
    await sb.from('call_attempts').update({ sarvam_id: attempt_id }).eq('id', data.id)
    return 'placed'
  } catch (e) {
    await sb
      .from('call_attempts')
      .update({ status: 'failed', failure_reason: String(e), finished_at: new Date().toISOString() })
      .eq('id', data.id)
    return 'failed'
  }
}
