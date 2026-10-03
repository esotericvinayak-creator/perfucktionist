// Builds the Android app and publishes it on our own site.
//
//   npm run apk
//
// 1. builds the website, 2. copies it into the Android project, 3. builds a signed
// release APK, 4. puts it at public/app/perfucktionist.apk with a small apk.json
// (version, size, SHA-256) that the "Get the app" page reads.
//
// Needs JDK 21 and the Android SDK. The signing key lives OUTSIDE the repo; see README.
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

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

const signed = existsSync(join(root, 'android/keystore.properties'))
run('npm run build')
// public/app holds the previous APK. Keep it out of the new one, or every build would nest the last.
rmSync(join(root, 'dist/app'), { recursive: true, force: true })
run('npx cap sync android')
run(`./gradlew ${signed ? 'assembleRelease' : 'assembleDebug'} --no-daemon -q`, join(root, 'android'))

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

console.log(`\n✓ ${meta.signed} APK ${meta.version} · ${(meta.size / 1048576).toFixed(1)} MB · sha256 ${meta.sha256.slice(0, 16)}…`)
console.log('  → public/app/perfucktionist.apk (served at /app/perfucktionist.apk)')
