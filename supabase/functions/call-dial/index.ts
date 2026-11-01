// Rings whoever is due. Supabase's scheduler calls this every 5 minutes (npm run calls:deploy sets
// that up), and `npm run calls -- call <family>` calls it for a test call.
import { dailyVariables, dueCalls, india, KEEP_TRANSCRIPT_DAYS, sameSecret, testCall, type Attempt, type Family } from '../_shared/khairiyat.ts'
import { dailyAgent, db, env, json, placeCall } from '../_shared/server.ts'

Deno.serve(async (req) => {
  if (!sameSecret(req.headers.get('x-call-secret') ?? '', env('CALL_CRON_SECRET'))) return json({ error: 'not allowed' }, 401)

  const sb = db()
  const now = new Date()
  const day = india(now).date
  const { test } = (await req.json().catch(() => ({}))) as { test?: string }

  const families = await sb.from('call_families').select('*').eq('status', 'active').not('parent_consent_at', 'is', null)
  const attempts = await sb.from('call_attempts').select('family_id, attempt, status, created_at').eq('call_date', day).eq('kind', 'daily')
  if (families.error || attempts.error) return json({ error: (families.error ?? attempts.error)?.message }, 500)
  const all = (families.data ?? []) as Family[]
  const today = (attempts.data ?? []) as Attempt[]

  let due = dueCalls(all, today, now)
  if (test) {
    const family = all.find((f) => f.id === test)
    const call = family && testCall(family, today, now)
    if (!call) return json({ error: 'That family can’t be called right now. Check their consent, status and the hours (9am to 8:30pm India time).' }, 409)
    due = [call]
  }

  const results = []
  for (const { family, attempt } of due) {
    // The last few notes let the agent pick up where it left off.
    const { data: recent } = await sb
      .from('call_attempts')
      .select('note')
      .eq('family_id', family.id)
      .not('note', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3)
    const outcome = await placeCall(sb, {
      family,
      day,
      kind: 'daily',
      attempt,
      to: family.parent_phone,
      agent: dailyAgent(),
      variables: dailyVariables(family, (recent ?? []).map((r) => r.note as string)),
    })
    results.push({ family: family.id, attempt, outcome })
  }

  // We promise families that transcripts go after 30 days. Failing here must not stop tomorrow's calls.
  const cutoff = new Date(now.getTime() - KEEP_TRANSCRIPT_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const purge = await sb.from('call_attempts').update({ transcript: null }).lt('created_at', cutoff).not('transcript', 'is', null)
  if (purge.error) console.error('could not clear old transcripts', purge.error.message)

  return json({ day, results })
})
