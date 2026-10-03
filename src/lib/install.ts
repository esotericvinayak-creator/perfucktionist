// Which device is this, and what can they actually install?
import { useEffect, useState } from 'react'

export type Platform = 'android' | 'ios' | 'mac' | 'windows' | 'linux' | 'other'

/** Where the signed Android build lives. Served from our own site, no store needed. */
export const APK_URL = 'app/perfucktionist.apk'
export const APK_META_URL = 'app/apk.json'

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  const p = navigator.platform ?? ''
  if (/android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  // iPadOS 13+ claims to be a Mac in its user agent; a touch screen gives it away.
  if (/Macintosh|Mac OS X/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios'
  // The user agent is more specific than navigator.platform, so it decides first.
  if (/Windows/i.test(ua)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  if (/CrOS|Linux|X11/i.test(ua)) return 'linux'
  if (/Win/i.test(p)) return 'windows'
  if (/Mac/i.test(p)) return 'mac'
  if (/Linux/i.test(p)) return 'linux'
  return 'other'
}

export const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)

/** True inside the Android APK (Capacitor) — no point offering to install the app you're in. */
export const inNativeApp = () => typeof window !== 'undefined' && !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

export const alreadyInstalled = () => isStandalone() || inNativeApp()

/** Chrome and Edge fire this before showing their own install prompt; we save it and use our own button. */
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let deferred: InstallPrompt | null = null
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPrompt
    listeners.forEach((l) => l())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((l) => l())
  })
}

/** Re-renders when the browser offers (or withdraws) its install prompt. */
export function useCanInstall() {
  const [can, setCan] = useState(!!deferred)
  useEffect(() => {
    const l = () => setCan(!!deferred)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  return can
}

export async function promptInstall() {
  if (!deferred) return 'unavailable'
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  listeners.forEach((l) => l())
  return outcome
}

export type ApkMeta = { version: string; size: number; built: string; sha256: string; minAndroid: string }

/** Details of the APK we ship, written at build time. Missing file = no Android build published yet. */
export async function apkMeta(): Promise<ApkMeta | null> {
  try {
    const res = await fetch(APK_META_URL, { cache: 'no-cache' })
    if (!res.ok) return null
    return (await res.json()) as ApkMeta
  } catch {
    return null
  }
}

export const prettySize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
