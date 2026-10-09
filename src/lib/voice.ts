// Which voice reads text aloud. One preference, used everywhere the app speaks (Listen, shlokas).
// Local to this device on purpose: voices differ per phone, so the choice must never sync.
import { useCallback, useEffect, useState } from 'react'
import { peek, useLocalState } from './storage'

export type VoicePref = { voiceURI?: string; rate: number }

/** Speed steps, as a multiplier on each screen's own base pace. */
export const RATES = [0.8, 0.9, 1, 1.1, 1.2] as const
export const RATE_NAMES = ['slower', 'slow', 'normal', 'quick', 'faster'] as const

const KEY = 'voice-pref'
const DEFAULT: VoicePref = { rate: 1 }

export const canSpeakAloud = () => typeof window !== 'undefined' && 'speechSynthesis' in window

// ─── labels ───────────────────────────────────────────────────
/** Android reports `en-IN` as `en_IN`; some engines use odd casing. */
const langOf = (v: Pick<SpeechSynthesisVoice, 'lang'>) => v.lang.replace('_', '-')
const primary = (lang: string) => lang.toLowerCase().split('-')[0]

/** "English (India)" for en-IN. Falls back to the raw code when Intl can't name it. */
export function langLabel(code: string): string {
  const c = code.replace('_', '-')
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'standard' } as Intl.DisplayNamesOptions)
    return names.of(c) ?? c
  } catch {
    return c
  }
}

/** Android names look like "en-in-x-ene-local": not for humans. Tidy those and "Microsoft X - English (India)". */
export function voiceName(v: SpeechSynthesisVoice): string {
  const android = /^[a-z]{2,3}[-_][a-z0-9]{2,4}-x-([a-z0-9]+)/i.exec(v.name)
  if (android) return `Voice ${android[1].toUpperCase()}`
  return v.name.replace(/^Microsoft\s+/, '').replace(/\s+-\s+.*$/, '').replace(/\s*\(.*?\)\s*$/, '') || v.name
}

// ─── the list ─────────────────────────────────────────────────
function rank(v: SpeechSynthesisVoice) {
  const l = langOf(v).toLowerCase()
  if (l === 'en-in') return 0
  if (l === 'hi-in') return 1
  if (l.startsWith('en')) return 2
  if (l.endsWith('-in')) return 3
  return 4
}

/** Sorted (your region and language first, offline before online) and de-duplicated. */
function organise(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const sorted = [...all].sort((a, b) => rank(a) - rank(b) || Number(b.localService) - Number(a.localService) || a.name.localeCompare(b.name))
  const seen = new Set<string>()
  return sorted.filter((v) => {
    const k = `${v.name.toLowerCase()}|${langOf(v).toLowerCase()}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Everything installed right now (empty before the browser has loaded its list). */
export function listVoices(): SpeechSynthesisVoice[] {
  if (!canSpeakAloud()) return []
  try {
    return organise(window.speechSynthesis.getVoices())
  } catch {
    return []
  }
}

/**
 * Installed voices. getVoices() starts empty and fills after `voiceschanged`; some Android WebViews
 * never fire it, so we also look again after ~1s. `ready` flips once we've waited long enough to
 * believe an empty list is real.
 */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => listVoices())
  const [ready, setReady] = useState(() => listVoices().length > 0)
  useEffect(() => {
    if (!canSpeakAloud()) return
    const synth = window.speechSynthesis
    const load = () => {
      const next = listVoices()
      // Keep the same array when nothing changed, so consumers don't re-render for nothing.
      setVoices((cur) => (cur.length === next.length && cur.every((v, i) => v.voiceURI === next[i].voiceURI) ? cur : next))
      if (next.length) setReady(true)
    }
    load()
    synth.addEventListener?.('voiceschanged', load)
    const retry = setTimeout(load, 1000)
    const settle = setTimeout(() => {
      load()
      setReady(true)
    }, 1800)
    return () => {
      synth.removeEventListener?.('voiceschanged', load)
      clearTimeout(retry)
      clearTimeout(settle)
    }
  }, [])
  return { voices, ready }
}

// ─── the preference ───────────────────────────────────────────
const clampRate = (r: unknown) => (typeof r === 'number' && Number.isFinite(r) ? Math.min(1.2, Math.max(0.8, r)) : 1)

function readPref(): VoicePref {
  const raw = peek<Partial<VoicePref>>(KEY)
  return { voiceURI: typeof raw?.voiceURI === 'string' ? raw.voiceURI : undefined, rate: clampRate(raw?.rate) }
}

export function useVoicePref() {
  const [raw, setRaw] = useLocalState<VoicePref>(KEY, DEFAULT)
  const pref: VoicePref = { voiceURI: typeof raw?.voiceURI === 'string' ? raw.voiceURI : undefined, rate: clampRate(raw?.rate) }
  const setVoice = useCallback((voiceURI?: string) => setRaw((p) => ({ ...p, voiceURI })), [setRaw])
  const setRate = useCallback((rate: number) => setRaw((p) => ({ ...p, rate: clampRate(rate) })), [setRaw])
  return { pref, setVoice, setRate }
}

// ─── choosing ─────────────────────────────────────────────────
/** Scripts an English-only voice would mangle. */
const INDIC = new Set(['hi', 'sa', 'mr', 'ne'])

/** Best voice for a language with no user choice: Hindi for Hindi/Sanskrit, else en-IN, else any English. */
export function autoVoice(lang = 'en', voices: SpeechSynthesisVoice[] = listVoices()): SpeechSynthesisVoice | undefined {
  const p = primary(lang)
  const by = (test: (l: string) => boolean) => voices.find((v) => test(langOf(v).toLowerCase()))
  if (INDIC.has(p)) {
    // No browser ships a Sanskrit voice; Hindi reads Devanagari well enough.
    return by((l) => l.startsWith('hi')) ?? by((l) => l.endsWith('-in') && !l.startsWith('en')) ?? by((l) => l.endsWith('-in')) ?? by((l) => l.startsWith('en'))
  }
  return by((l) => l.startsWith(p) && l.endsWith('-in')) ?? by((l) => l.startsWith(p)) ?? by((l) => l === 'en-in') ?? by((l) => l.startsWith('en'))
}

/**
 * The voice to use for text in `lang` (default English): the user's choice if it is still installed
 * and can actually speak that language, otherwise the best automatic match.
 */
export function pickVoice(lang = 'en'): SpeechSynthesisVoice | undefined {
  const voices = listVoices()
  const uri = readPref().voiceURI
  const chosen = uri ? voices.find((v) => v.voiceURI === uri) : undefined
  if (chosen) {
    const p = primary(lang)
    const vp = primary(langOf(chosen))
    // A Hindi voice reads English acceptably, but an English voice can't read Devanagari.
    if (!INDIC.has(p) || INDIC.has(vp) || vp === p) return chosen
  }
  return autoVoice(lang, voices)
}

/** A ready-to-speak utterance using the user's voice and speed. `baseRate` is the screen's own pace. */
export function makeUtterance(text: string, opts: { lang?: string; baseRate?: number; voice?: SpeechSynthesisVoice } = {}) {
  const lang = opts.lang ?? 'en'
  const u = new SpeechSynthesisUtterance(text)
  const voice = opts.voice ?? pickVoice(lang)
  if (voice) u.voice = voice
  u.lang = voice ? langOf(voice) : INDIC.has(primary(lang)) ? 'hi-IN' : 'en-IN'
  u.rate = (opts.baseRate ?? 1) * readPref().rate
  u.pitch = 1
  return u
}
