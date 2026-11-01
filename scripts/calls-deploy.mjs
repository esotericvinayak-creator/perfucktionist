// Puts Khairiyat live: the database tables, the two functions, their secrets, and the 5-minute
// schedule that rings the dialler. Safe to run again after a change.
//
//   npm run calls:deploy      (runs this with the Doppler `prd` secrets, see docs/KHAIRIYAT.md)
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { quote, sql } from './lib/query.mjs'

const secrets = [
  'SARVAM_API_KEY',
  'SARVAM_ORG_ID',
  'SARVAM_WORKSPACE_ID',
  'SARVAM_CONNECTION_ID',
  'SARVAM_AGENT_NUMBER',
  'SARVAM_DAILY_APP_ID',
  'SARVAM_DAILY_APP_VERSION',
  'SARVAM_ALERT_APP_ID',
  'SARVAM_ALERT_APP_VERSION',
  'ANTHROPIC_API_KEY',
  'CALL_CRON_SECRET',
  'CALL_WEBHOOK_TOKEN',
]
const optional = ['CALL_OWNER_PHONE', 'SUMMARY_MODEL']

const missing = [...secrets, 'SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_REF', 'SUPABASE_DB_PASSWORD'].filter((n) => !process.env[n])
if (missing.length) {
  console.error(`Missing from Doppler (config prd):\n  ${missing.join('\n  ')}\nSee docs/KHAIRIYAT.md, step 3.`)
  process.exit(1)
}
for (const n of ['SARVAM_DAILY_APP_VERSION', 'SARVAM_ALERT_APP_VERSION']) {
  if (!/^[0-9]+$/.test(process.env[n])) {
    console.error(`${n} must be a whole number, the agent's version in Sarvam.`)
    process.exit(1)
  }
}

const supabase = (...args) => execFileSync('npx', ['supabase', ...args], { stdio: 'inherit' })

console.log('→ database')
supabase('link', '--project-ref', process.env.SUPABASE_PROJECT_REF)
supabase('db', 'push')

// From a private temporary file, so the secrets never show up in `ps`.
console.log('→ secrets')
const dir = mkdtempSync(join(tmpdir(), 'khairiyat-'))
try {
  const file = join(dir, 'secrets.env')
  const lines = [...secrets, ...optional].filter((n) => process.env[n]).map((n) => `${n}=${process.env[n]}`)
  writeFileSync(file, `${lines.join('\n')}\n`, { mode: 0o600 })
  supabase('secrets', 'set', '--env-file', file)
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log('→ functions')
supabase('functions', 'deploy', 'call-dial', 'call-webhook', '--use-api')

// Scheduling a job with the same name replaces it, so this is safe to repeat.
console.log('→ schedule')
const url = `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/functions/v1/call-dial`
const headers = JSON.stringify({ 'x-call-secret': process.env.CALL_CRON_SECRET, 'content-type': 'application/json' })
const job = `select net.http_post(url := ${quote(url)}, headers := ${quote(headers)}::jsonb, body := '{}'::jsonb)`
sql(`select cron.schedule('khairiyat-dial', '*/5 * * * *', ${quote(job)})`)

console.log('✓ live. Next: npm run calls -- add …, then see docs/KHAIRIYAT.md, step 5.')
