// Turns off "Confirm email" on the hosted Supabase project, so new accounts are in straight away.
//
//   npm run auth:no-confirm     (runs with the Doppler `prd` secrets)
//
// Needs SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF (the same ones `npm run db:push` uses).
// Changes only this one auth setting, through the Management API; nothing else in the project.
// Same as: Supabase dashboard → Authentication → Sign In / Providers → Email → "Confirm email" off.
const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF
if (!token || !ref) {
  console.error('Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF. Add them to Doppler (config prd), or switch it off in the dashboard.')
  process.exit(1)
}
const url = `https://api.supabase.com/v1/projects/${ref}/config/auth`
const r = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ mailer_autoconfirm: true }) })
if (!r.ok) {
  console.error(`Supabase said ${r.status}: ${await r.text()}`)
  process.exit(1)
}
const after = await (await fetch(url, { headers: { Authorization: `Bearer ${token}` } })).json()
console.log(after.mailer_autoconfirm ? '✓ email confirmation is off: new accounts sign in straight away.' : '✗ the setting did not change — check it in the dashboard.')
