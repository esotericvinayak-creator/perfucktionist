// Is the database connected, and are people's entries arriving? Prints counts only, never anyone's data.
//
//   npm run db:check             the hosted project (Doppler prd)
//   npm run db:check -- --local  the local stack
import { local, sql } from './lib/query.mjs'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const line = (ok, text) => console.log(`${ok === null ? '·' : ok ? '✓' : '✗'} ${text}`)

// 1. What the browser sees: is the project reachable with the public key, and is the table locked to logged-in people?
if (url && key) {
  try {
    const auth = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    line(auth.ok, `auth reachable (${url}) — HTTP ${auth.status}`)
    if (auth.ok) {
      const s = await auth.json()
      line(null, `email sign-up ${s.disable_signup ? 'OFF' : 'on'}, email confirmation ${s.mailer_autoconfirm ? 'off (people are in at once)' : 'on (people must click the email link)'}, google ${s.external?.google ? 'on' : 'off'}`)
    }
    for (const t of ['user_state', 'payments', 'memberships']) {
      const r = await fetch(`${url}/rest/v1/${t}?select=*&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      // Logged out we expect "permission denied" (401/403). 404 means the table isn't there: db:push hasn't run.
      line(r.status === 401 || r.status === 403, `table ${t}: ${r.status === 404 ? 'MISSING — run npm run db:push' : r.status === 401 || r.status === 403 ? 'exists, closed to logged-out visitors' : `unexpected HTTP ${r.status}`}`)
    }
  } catch (e) {
    line(false, `couldn't reach ${url}: ${e.message}`)
  }
} else if (!local) {
  line(false, 'VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY aren’t set, so the app would run in preview mode. Run via: npm run db:check')
}

// 2. What's inside (needs the CLI link, or --local).
const one = (q) => sql(q)[0]
const users = one(`select count(*)::int n, max(created_at) latest, count(*) filter (where email_confirmed_at is null)::int unconfirmed from auth.users`)
line(users.n > 0, `${users.n} accounts${users.n ? `, newest ${new Date(users.latest).toLocaleString('en-IN')}` : ''}${users.unconfirmed ? `, ${users.unconfirmed} haven't confirmed their email` : ''}`)

const state = sql(`select key, count(*)::int n, max(updated_at) latest from public.user_state group by key order by key`)
const people = one(`select count(distinct user_id)::int n from public.user_state`)
line(people.n > 0 || users.n === 0, `${people.n} of ${users.n} accounts have synced something (progress, shelf, liked…)`)
for (const r of state) line(null, `  ${r.key.padEnd(12)} ${String(r.n).padStart(4)} rows, last write ${new Date(r.latest).toLocaleString('en-IN')}`)

const pay = sql(`select status, count(*)::int n from public.payments group by status`)
const members = one(`select count(*) filter (where until > now())::int active, count(*)::int ever from public.memberships`)
line(null, `payments: ${pay.length ? pay.map((p) => `${p.n} ${p.status}`).join(', ') : 'none yet'} · Plus members now: ${members.active} (${members.ever} ever)`)
if (pay.some((p) => p.status === 'pending')) line(false, 'payments are waiting for you: npm run pay')
