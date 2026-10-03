// Builds the Android app and publishes it on our own site.
//
//   npm run apk                                   (runs this with the Doppler `prd` secrets)
//   npm run apk -- --notes "what's new, one line"  shown in the in-app update offer
//   npm run apk -- --force                         everyone on an older build must update
//
// 1. builds the website, 2. copies it into the Android project, 3. builds a signed
// release APK, 4. puts it at public/app/perfucktionist.apk with a small apk.json
// (version, build number, size, SHA-256, notes) that the "Get the app" page and the in-app
// update check read (src/lib/update.ts).
//
// Every run gets the next build number (Android's versionCode), so phones see it as an update.
// The version name comes from package.json; bump it with `npm version minor` when it matters.
//
// Needs JDK 21 and the Android SDK. The signing key lives OUTSIDE the repo: in Doppler
// (ANDROID_KEYSTORE_BASE64 + passwords) or android/keystore.properties. See README.
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadEnv } from 'vite'

const root = new URL('..', import.meta.url).pathname
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const javaHome = process.env.JAVA_HOME || ['/opt/homebrew/opt/openjdk@21', '/usr/local/opt/openjdk@21'].find((p) => existsSync(join(p, 'bin/java')))
const androidHome = process.env.ANDROID_HOME || join(homedir(), 'Library/Android/sdk')
if (!javaHome) throw new Error('JDK 21 not found. Install it (brew install openjdk@21) or set JAVA_HOME.')
if (!existsSync(androidHome)) throw new Error(`Android SDK not found at ${androidHome}. Set ANDROID_HOME.`)

const env = { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: androidHome, PATH: `${join(javaHome, 'bin')}:${process.env.PATH}` }
const run = (cmd, cwd = root) => {
  console.log(`\n▸ ${cmd}`)
  execSync(cmd, { cwd, env, stdio: 'inherit' })
}

// The key from Doppler arrives as base64. Gradle needs a file, so it gets a private temp one
// that is deleted as soon as the build finishes.
let keyDir
if (env.ANDROID_KEYSTORE_BASE64 && !env.ANDROID_KEYSTORE_PATH) {
  keyDir = mkdtempSync(join(tmpdir(), 'pf-key-'))
  env.ANDROID_KEYSTORE_PATH = join(keyDir, 'release.jks')
  writeFileSync(env.ANDROID_KEYSTORE_PATH, Buffer.from(env.ANDROID_KEYSTORE_BASE64, 'base64'), { mode: 0o600 })
}
const fromEnv = ['ANDROID_KEYSTORE_PATH', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD'].every((n) => env[n])
const signed = fromEnv || existsSync(join(root, 'android/keystore.properties'))

// ── release details ──
const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  return i === -1 ? undefined : (args[i + 1] ?? '')
}
const previous = (() => {
  try {
    return JSON.parse(readFileSync(join(root, 'public/app/apk.json'), 'utf8'))
  } catch {
    return {}
  }
})()
// The first published APK predates build numbers and was versionCode 1.
const versionCode = (previous.versionCode ?? (previous.version ? 1 : 0)) + 1
const minVersionCode = args.includes('--force') ? versionCode : (previous.minVersionCode ?? 0)
const notes = (flag('--notes') ?? '').trim()
env.PF_APP_BUILD = String(versionCode)
console.log(`◦ Build ${versionCode} (version ${pkg.version})${minVersionCode === versionCode ? ' · required update' : ''}`)

// The site build also reads .env.local (e.g. from `vercel env pull`), so count it here too.
const fileEnv = loadEnv('production', root, '')
const has = (...names) => names.some((n) => env[n] || fileEnv[n])
if (!has('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')) console.log('◦ No Supabase keys: this APK uses preview accounts (saved on the phone, no sync).')
if (!has('VITE_SITE_URL'))
  console.warn('⚠ VITE_SITE_URL is not set: this APK can’t check for updates, and email links sent from it won’t open. Add your website address to Doppler (prd).')

try {
  run('npm run build')
  // public/app holds the previous APK. Keep it out of the new one, or every build would nest the last.
  rmSync(join(root, 'dist/app'), { recursive: true, force: true })
  run('npx cap sync android')
  run(`./gradlew ${signed ? 'assembleRelease' : 'assembleDebug'} -PpfVersionCode=${versionCode} -PpfVersionName=${pkg.version} --no-daemon -q`, join(root, 'android'))
} finally {
  if (keyDir) rmSync(keyDir, { recursive: true, force: true })
}

const built = signed ? 'android/app/build/outputs/apk/release/app-release.apk' : 'android/app/build/outputs/apk/debug/app-debug.apk'
const src = join(root, built)
if (!existsSync(src)) throw new Error(`Expected an APK at ${built}`)

const outDir = join(root, 'public/app')
mkdirSync(outDir, { recursive: true })
const dest = join(outDir, 'perfucktionist.apk')
copyFileSync(src, dest)

const bytes = readFileSync(dest)
const meta = {
  version: pkg.version,
  versionCode,
  minVersionCode,
  notes,
  size: statSync(dest).size,
  built: new Date().toISOString().slice(0, 10),
  sha256: createHash('sha256').update(bytes).digest('hex'),
  minAndroid: '7.0',
  signed: signed ? 'release' : 'debug',
}
writeFileSync(join(outDir, 'apk.json'), JSON.stringify(meta, null, 2) + '\n')

// The site build ran before the APK existed, so copy both files into dist as well.
mkdirSync(join(root, 'dist/app'), { recursive: true })
copyFileSync(dest, join(root, 'dist/app/perfucktionist.apk'))
copyFileSync(join(outDir, 'apk.json'), join(root, 'dist/app/apk.json'))

console.log(`\n✓ ${meta.signed} APK ${meta.version} (build ${versionCode}) · ${(meta.size / 1048576).toFixed(1)} MB · sha256 ${meta.sha256.slice(0, 16)}…`)
console.log('  → public/app/perfucktionist.apk (served at /app/perfucktionist.apk)')
console.log('  Deploy the site (commit public/app and push) and installed apps will offer the update.')
