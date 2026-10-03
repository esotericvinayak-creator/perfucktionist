// One-time: copies the Android release key into Doppler, so it's backed up and every
// machine (or CI) can sign updates with the same key.
//
//   npm run secrets:android
//
// Reads android/keystore.properties and the keystore it points to, then sets in Doppler (config prd):
//   ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
// Values go through stdin, so they never appear on screen, in shell history or in `ps`.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const propsFile = join(root, 'android/keystore.properties')
if (!existsSync(propsFile)) {
  console.error('No android/keystore.properties here, so there is no local key to copy.')
  process.exit(1)
}

const props = Object.fromEntries(
  readFileSync(propsFile, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)
const storeFile = String(props.storeFile ?? '').replace(/^~(?=\/)/, homedir())
if (!storeFile || !existsSync(storeFile)) {
  console.error(`The keystore in keystore.properties (${storeFile || 'storeFile missing'}) wasn't found.`)
  process.exit(1)
}

const config = process.argv[2] ?? 'prd'
const secrets = {
  ANDROID_KEYSTORE_BASE64: readFileSync(storeFile).toString('base64'),
  ANDROID_KEYSTORE_PASSWORD: props.storePassword,
  ANDROID_KEY_ALIAS: props.keyAlias,
  ANDROID_KEY_PASSWORD: props.keyPassword,
}

for (const [name, value] of Object.entries(secrets)) {
  if (!value) {
    console.error(`${name} is empty in keystore.properties — nothing uploaded for it.`)
    process.exit(1)
  }
  // `doppler secrets set` prints the values it set, so its output is swallowed.
  const r = spawnSync('doppler', ['secrets', 'set', name, '--config', config, '--silent'], { input: value, encoding: 'utf8', stdio: ['pipe', 'ignore', 'pipe'] })
  if (r.status !== 0) {
    console.error(`Couldn't set ${name}: ${(r.stderr || r.error?.message || '').trim()}`)
    console.error('Logged in and set up? Run: doppler login && doppler setup')
    process.exit(1)
  }
  console.log(`✓ ${name}`)
}
console.log(`\nThe release key is in Doppler (${config}). Keep an offline copy of ${storeFile} as well.`)
console.log('Once `npm run apk` signs fine without it, you can delete android/keystore.properties.')
