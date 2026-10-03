// Runs a command with this project's secrets. Where they come from, first match wins:
//
//   node scripts/with-secrets.mjs <doppler config> <command> [args...]
//   e.g. node scripts/with-secrets.mjs prd vite build
//
// 1. Already in the environment (`doppler run -- …`, CI): used as they are.
// 2. Doppler: with a DOPPLER_TOKEN service token (the token picks the config), or when you're
//    logged in and ran `doppler setup` here (`--config <config>`).
// 3. Fallback, when the Doppler CLI isn't there or isn't set up (e.g. a Vercel build): the
//    command runs as-is and reads the host's env vars or .env.local. vite.config.ts says
//    which names it found, and falls back to preview mode if there are none.
import { spawnSync } from 'node:child_process'

const [config, ...cmd] = process.argv.slice(2)
if (!config || !cmd.length) {
  console.error('usage: node scripts/with-secrets.mjs <doppler config> <command> [args...]')
  process.exit(2)
}

const dopplerSetting = (name) => {
  const r = spawnSync('doppler', ['configure', 'get', name, '--plain', '--no-check-version'], { encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : ''
}
// Both are needed: `doppler setup` can record the project before you've logged in.
const dopplerReady = () => !!(dopplerSetting('project') && dopplerSetting('token'))

// Vercel's build image has no Doppler CLI. A DOPPLER_TOKEN there must not break the build.
const installed = () => spawnSync('doppler', ['--version', '--no-check-version'], { encoding: 'utf8' }).status === 0

let argv = cmd
if (process.env.VITE_SUPABASE_URL) {
  // already injected
} else if (!installed()) {
  if (process.env.DOPPLER_TOKEN) console.log('◦ DOPPLER_TOKEN is set but the Doppler CLI isn’t installed here — using this machine’s env vars instead.')
} else if (process.env.DOPPLER_TOKEN) {
  argv = ['doppler', 'run', '--', ...cmd]
} else if (dopplerReady()) {
  argv = ['doppler', 'run', '--config', config, '--', ...cmd]
} else if (!process.env.VERCEL && !process.env.CI) {
  console.log('◦ Doppler isn’t set up in this folder — using env vars / .env.local if there are any. To connect: doppler login && doppler setup')
}

const r = spawnSync(argv[0], argv.slice(1), { stdio: 'inherit' })
if (r.error) {
  console.error(r.error.message)
  process.exit(1)
}
process.exit(r.status ?? 1)
