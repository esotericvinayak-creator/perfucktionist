// Runs SQL against the local Supabase stack (--local) or the hosted project, through the Supabase CLI.
// Hosted needs, from Doppler `prd`: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD
// (the same three `npm run db:push` uses). Wrap with: node scripts/with-secrets.mjs prd node scripts/<name>.mjs
import { execFileSync } from 'node:child_process'

export const local = process.argv.includes('--local')
export const args = process.argv.slice(2).filter((a) => a !== '--local')

let linked = false
function link() {
  if (linked || local) return
  const need = ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_REF', 'SUPABASE_DB_PASSWORD']
  const missing = need.filter((n) => !process.env[n])
  if (missing.length) {
    console.error(`Missing ${missing.join(', ')}. Add them to Doppler (config prd), or add --local to use the local stack. See README → Accounts, sync & secrets.`)
    process.exit(1)
  }
  execFileSync('npx', ['supabase', 'link', '--project-ref', process.env.SUPABASE_PROJECT_REF], { stdio: ['ignore', 'ignore', 'inherit'] })
  linked = true
}

/** Rows of a query, as objects. */
export function sql(query) {
  link()
  const out = execFileSync('npx', ['supabase', 'db', 'query', local ? '--local' : '--linked', '-o', 'json', query], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 16 * 1024 * 1024,
  })
  const json = out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1)
  return JSON.parse(json).rows ?? []
}

export const quote = (s) => `'${String(s).replace(/'/g, "''")}'`
