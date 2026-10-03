// Keeping the app up to date.
//
// Website and installed web app: every deploy ships a new service worker (vite.config.ts stamps
// it). The new one waits; we show "refresh", and only switch when the person says so — nothing
// reloads under someone mid-journal.
//
// Android app: its pages live inside the APK, so an update means a new APK. We read apk.json on
// the website (written by `npm run apk`) and compare its versionCode with the one this app was
// built with. Newer → offer the download. Older than minVersionCode → the update is required,
// though the safety tools stay open.
import { useSyncExternalStore } from 'react'
import { inNativeApp } from './install'

export const APP_VERSION = __APP_VERSION__
/** Android versionCode this bundle shipped in. 0 on the website. */
export const APP_BUILD = __APP_BUILD__
export const BUILD_ID = __BUILD_ID__

// Inside the APK, relative URLs point at the copy on the phone, so the update lives at the website.
const SITE = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '')

export type AppUpdate = { version: string; versionCode: number; size: number; notes: string; url: string; required: boolean }
type ApkJson = { version: string; versionCode?: number; minVersionCode?: number; size: number; notes?: string }
type State = { web: boolean; app: AppUpdate | null; checking: boolean; snoozedUntil: number }

const LATER = 'pf:update-later'
function readSnooze(): number {
  try {
    const s = JSON.parse(localStorage.getItem(LATER) ?? '{}') as { key?: string; until?: number }
    return s.key === snoozeKey() ? (s.until ?? 0) : 0
  } catch {
    return 0
  }
}

let state: State = { web: false, app: null, checking: false, snoozedUntil: 0 }
const subs = new Set<() => void>()
function set(next: Partial<State>) {
  state = { ...state, ...next }
  subs.forEach((l) => l())
}
export const useUpdate = () =>
  useSyncExternalStore(
    (l) => {
      subs.add(l)
      return () => subs.delete(l)
    },
    () => state,
  )

/** What "later" applies to: this particular offer, so a newer one still shows. */
const snoozeKey = () => (state.app ? `app-${state.app.versionCode}` : 'web')

/** Hide the offer for a day. Required updates ignore this. */
export function later() {
  const until = Date.now() + 24 * 3600_000
  try {
    localStorage.setItem(LATER, JSON.stringify({ key: snoozeKey(), until }))
  } catch {
    // storage blocked: hidden for this visit only
  }
  set({ snoozedUntil: until })
}

// ─── website / installed web app ──────────────────────────────
let registration: ServiceWorkerRegistration | null = null
let switching = false

/** The build a worker carries (it answers 'build?'), or '' if it doesn't say in time. */
function buildOf(worker: ServiceWorker) {
  return new Promise<string>((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = (e) => resolve(String(e.data))
    worker.postMessage('build?', [channel.port2])
    setTimeout(() => resolve(''), 2000)
  })
}

async function offer(worker: ServiceWorker | null) {
  // No controller means this is the very first install, not an update.
  if (!worker || !navigator.serviceWorker.controller) return
  // A plain reload already fetches the newest pages, so this page may *be* the waiting build.
  // Then there's nothing to offer: let the new worker take over quietly.
  if ((await buildOf(worker)) === BUILD_ID) return worker.postMessage('skip-waiting')
  set({ web: true, snoozedUntil: readSnooze() })
}

async function watchServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  try {
    registration = await navigator.serviceWorker.register('sw.js')
  } catch {
    return
  }
  const reg = registration
  void offer(reg.waiting)
  reg.addEventListener('updatefound', () => {
    const w = reg.installing
    w?.addEventListener('statechange', () => w.state === 'installed' && void offer(w))
  })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (switching) window.location.reload()
  })
  const look = () => void reg.update().catch(() => undefined)
  setInterval(look, 30 * 60_000)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && look())
}

// ─── Android app ──────────────────────────────────────────────
let lastAppCheck = 0

async function checkApp(): Promise<AppUpdate | null | 'offline'> {
  if (!SITE) return null
  set({ checking: true })
  try {
    const res = await fetch(`${SITE}/app/apk.json`, { cache: 'no-store' })
    if (!res.ok) return 'offline'
    const meta = (await res.json()) as ApkJson
    lastAppCheck = Date.now()
    const code = meta.versionCode ?? 0
    const app: AppUpdate | null =
      code > APP_BUILD
        ? { version: meta.version, versionCode: code, size: meta.size, notes: meta.notes ?? '', url: `${SITE}/app/perfucktionist.apk`, required: APP_BUILD < (meta.minVersionCode ?? 0) }
        : null
    set({ app })
    set({ snoozedUntil: readSnooze() }) // the snooze belongs to a particular version, so read it after
    return app
  } catch {
    return 'offline'
  } finally {
    set({ checking: false })
  }
}

// ─── both ─────────────────────────────────────────────────────
/** Switch to the waiting version of the website. */
export function refresh() {
  const waiting = registration?.waiting
  if (!waiting) return window.location.reload()
  switching = true
  waiting.postMessage('skip-waiting')
}

export type CheckResult = 'update' | 'latest' | 'offline'

/** The "check for updates" button. */
export async function checkNow(): Promise<CheckResult> {
  if (inNativeApp()) {
    const r = await checkApp()
    if (r === 'offline') return 'offline'
    if (!r) return 'latest'
    set({ snoozedUntil: 0 }) // asked on purpose, so show it even after "later"
    return 'update'
  }
  if (!registration) return navigator.onLine ? 'latest' : 'offline'
  set({ checking: true })
  try {
    await registration.update()
    // A new worker takes a moment to download and install.
    for (let i = 0; i < 20 && registration.installing; i++) await new Promise((r) => setTimeout(r, 250))
    if (!registration.waiting || !navigator.serviceWorker.controller) return 'latest'
    await offer(registration.waiting)
    if (!state.web) return 'latest' // this page already is the newest build
    set({ snoozedUntil: 0 }) // asked on purpose, so show it even after "later"
    return 'update'
  } catch {
    return 'offline'
  } finally {
    set({ checking: false })
  }
}

/** Shown in settings: "0.2.0 (build 4)" in the Android app, "0.2.0 · <build id>" on the web. */
export const versionLabel = () => (APP_BUILD ? `${APP_VERSION} (build ${APP_BUILD})` : `${APP_VERSION} · ${BUILD_ID.split('-').pop()}`)

if (typeof window !== 'undefined') {
  if (inNativeApp()) {
    // A few seconds after opening, then whenever the app comes back after six hours or more.
    setTimeout(() => void checkApp(), 4000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAppCheck > 6 * 3600_000) void checkApp()
    })
  } else if (document.readyState === 'complete') void watchServiceWorker()
  else window.addEventListener('load', () => void watchServiceWorker())
}
