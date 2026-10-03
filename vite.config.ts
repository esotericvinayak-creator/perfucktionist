import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// The public settings the site is built with, and every name each one may arrive under.
// First match wins:
//   1. VITE_*: Doppler (scripts/with-secrets.mjs), env vars set on the host (Vercel, Netlify…) or .env.local
//   2. the names Vercel's Supabase integration creates for you
//   3. Vercel's own production domain, for the site URL
// Nothing found → preview mode: accounts stay on the device and nothing syncs.
const SOURCES = {
  VITE_SUPABASE_URL: ['VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'],
  VITE_SUPABASE_PUBLISHABLE_KEY: [
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  ],
  VITE_SITE_URL: ['VITE_SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL'],
}
type Found = Record<string, { value: string; from: string }>

function resolvePublicEnv(env: Record<string, string>): Found {
  const found: Found = {}
  for (const [target, names] of Object.entries(SOURCES)) {
    const from = names.find((n) => env[n]?.trim())
    if (!from) continue
    let value = env[from].trim()
    // Vercel gives the bare domain.
    if (target === 'VITE_SITE_URL' && !/^https?:\/\//.test(value)) value = `https://${value}`
    found[target] = { value, from }
  }
  return found
}

/** The role inside a legacy Supabase JWT key, if the value is one. */
function jwtRole(value: string) {
  const part = value.split('.')[1]
  if (!part) return undefined
  try {
    return (JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { role?: string }).role
  } catch {
    return undefined
  }
}

// Doppler and Vercel put server secrets in the environment too. Only what ends up in a VITE_*
// variable is bundled into the site — and anyone can read the bundle — so refuse to build if
// one of those is a server key.
function refuseServerKeys(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    if (value.startsWith('sb_secret_') || jwtRole(value) === 'service_role')
      throw new Error(`${name} holds a Supabase secret (service role) key. Only the publishable key may reach the site — the browser can read it.`)
  }
}

function report(found: Found) {
  const url = found.VITE_SUPABASE_URL
  const key = found.VITE_SUPABASE_PUBLISHABLE_KEY
  if (url && key) console.log(`◦ Supabase: cloud accounts on (URL from ${url.from}, key from ${key.from})`)
  else if (url || key) console.warn(`⚠ Supabase: found ${url ? 'the URL' : 'the key'} but not ${url ? 'the publishable key' : 'the URL'} — building in preview mode`)
  else console.log('◦ Supabase: no keys (Doppler, VITE_* or Vercel env) — preview mode, accounts stay on the device')
}

/**
 * Stamps dist/sw.js with this build's id. A byte-different worker file is how browsers notice a
 * new deploy, so every build gets one and the app can offer "refresh" (see src/lib/update.ts).
 */
function stampServiceWorker(buildId: string): Plugin {
  let outDir = 'dist'
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
    },
    writeBundle() {
      const file = join(outDir, 'sw.js')
      writeFileSync(file, readFileSync(file, 'utf8').replace('__BUILD__', buildId))
    },
  }
}

// Relative base so the build works from any sub-path (GitHub Pages, Netlify, a plain folder).
export default defineConfig(({ mode }) => {
  // .env files plus the real environment, every name (not just VITE_*).
  const env = loadEnv(mode, process.cwd(), '')
  const found = resolvePublicEnv(env)
  const bundled = Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith('VITE_')))
  for (const [k, v] of Object.entries(found)) bundled[`${k} (from ${v.from})`] = v.value
  refuseServerKeys(bundled)
  // Hand the result to Vite as ordinary VITE_* variables; it reads them after this config.
  for (const [k, v] of Object.entries(found)) process.env[k] = v.value
  report(found)
  // PF_APP_BUILD is the Android versionCode, set by `npm run apk`. The website has none (0).
  const appBuild = Number(process.env.PF_APP_BUILD) || 0
  const buildId = `${pkg.version}-${Date.now().toString(36)}`
  return {
    base: './',
    plugins: [react(), stampServiceWorker(buildId)],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_BUILD__: JSON.stringify(appBuild),
      __BUILD_ID__: JSON.stringify(buildId),
    },
  }
})
