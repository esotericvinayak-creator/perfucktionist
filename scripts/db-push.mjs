// Applies supabase/migrations to the hosted Supabase project.
//
//   npm run db:push      (runs this with the Doppler `prd` secrets)
//
// Needs, from Doppler: SUPABASE_ACCESS_TOKEN (supabase.com → Account → Access tokens),
// SUPABASE_PROJECT_REF (the id in your project's URL) and SUPABASE_DB_PASSWORD.
import { execFileSync } from 'node:child_process'

const need = ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_REF', 'SUPABASE_DB_PASSWORD']
const missing = need.filter((n) => !process.env[n])
if (missing.length) {
  console.error(`Missing ${missing.join(', ')}. Add them to Doppler (config prd) — see README → Accounts, sync & secrets.`)
  process.exit(1)
}

// The CLI reads the token and the database password from the environment, so neither shows up in `ps`.
const supabase = (...args) => execFileSync('npx', ['supabase', ...args], { stdio: 'inherit' })
supabase('link', '--project-ref', process.env.SUPABASE_PROJECT_REF)
supabase('db', 'push')
