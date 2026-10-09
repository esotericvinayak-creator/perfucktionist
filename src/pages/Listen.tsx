// Listen: quotes read aloud with music under them, auto-advancing like a playlist. Hands-free.
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { shareCard } from '../components/Overlays'
import { MusicReels } from '../components/MusicReels'
import { WebLink } from '../components/WebView'
import { faithById, linesFor } from '../data/profile'
import { shlokas } from '../data/shlokas'
import { traditions, wisdom, type Theme } from '../data/wisdom'
import { searchFull } from '../lib/music'
import { log, useProgress } from '../lib/progress'
import { unlockAudio } from '../lib/sound'
import { RATES, RATE_NAMES, autoVoice, canSpeakAloud, langLabel, makeUtterance, useVoicePref, useVoices, voiceName } from '../lib/voice'
import type { Track } from '../context/Player'

type Item = { badge: string; original?: string; lang?: string; rtl?: boolean; text: string; speak: string }

type Mix = { id: string; name: string; line: string; music: string; themes: Theme[]; shlokaVibes: string[]; accent: string }

const MIXES: Mix[] = [
  { id: 'morning', name: 'Morning calm', line: 'start soft', music: 'lofi', themes: ['calm', 'golden'], shlokaVibes: ['peace'], accent: 'violet' },
  { id: 'focus', name: 'Exam focus', line: 'lock in', music: 'lofi study', themes: ['action'], shlokaVibes: ['focus', 'strength'], accent: 'lime' },
  { id: 'brave', name: 'Hype me up', line: 'courage, every faith', music: 'lofi hip hop instrumental', themes: ['courage', 'action'], shlokaVibes: ['strength'], accent: 'sun' },
  { id: 'heart', name: 'Heavy heart', line: 'for the hard days', music: 'ambient piano', themes: ['calm', 'oneness'], shlokaVibes: ['peace', 'love'], accent: 'pink' },
  { id: 'faith', name: 'Every faith', line: 'one message, many voices', music: 'meditation', themes: ['golden', 'oneness', 'truth'], shlokaVibes: ['faith', 'truth'], accent: 'cyan' },
  { id: 'night', name: 'Wind down', line: 'before sleep', music: 'ambient sleep', themes: ['calm'], shlokaVibes: ['peace'], accent: 'orange' },
]

const INTERLUDE = 18 // seconds of music between quotes

/** A mix made from your own tradition (if you told us your faith). */
function mineFor(faithId?: string): Mix | null {
  const f = faithById(faithId)
  if (!f || f.traditions === 'all') return null
  return { id: 'mine', name: f.secular ? 'Philosophy' : `${f.label} wisdom`, line: f.secular ? 'stoic, taoist & more' : 'your tradition, read aloud', music: 'meditation', themes: [], shlokaVibes: [], accent: 'lime' }
}

function buildQueue(mix: Mix, faithId?: string): Item[] {
  if (mix.id === 'mine') return linesFor(faithId).sort(() => Math.random() - 0.5)
  const w = wisdom
    .filter((x) => x.themes.some((t) => mix.themes.includes(t)))
    .map((x) => ({ badge: `${traditions[x.tradition].emoji} ${x.source}`, original: x.original, lang: x.lang, rtl: x.rtl, text: x.text, speak: x.text }))
  const s = shlokas
    .filter((x) => x.vibes.some((v) => mix.shlokaVibes.includes(v as never)))
    .map((x) => ({ badge: `🕉️ ${x.source}`, original: x.devanagari, lang: 'sa', text: x.meaning, speak: `${x.meaning}. ${x.genz}` }))
  return [...w, ...s].sort(() => Math.random() - 0.5)
}

const LISTEN_RATE = 0.92 // Listen's own pace; the voice sheet's speed scales it
const SAMPLE_LINE = 'Perfection is a scam. Showing up is enough.'

function speak(text: string, onEnd: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()
  // Items are read in English (shloka items speak their English meaning), so no per-item language here.
  const u = makeUtterance(text, { lang: 'en', baseRate: LISTEN_RATE })
  u.onend = u.onerror = onEnd
  synth.speak(u)
  return u
}

type VoiceSheetProps = {
  voices: SpeechSynthesisVoice[]
  ready: boolean
  chosen?: SpeechSynthesisVoice
  rate: number
  midQuote: boolean
  onVoice: (uri?: string) => void
  onRate: (r: number) => void
  onClose: () => void
}

/** Bottom sheet (centred card on desktop) for choosing who reads aloud, and how fast. */
function VoiceSheet({ voices, ready, chosen, rate, midQuote, onVoice, onRate, onClose }: VoiceSheetProps) {
  const uid = useId()
  const panel = useRef<HTMLDivElement>(null)
  const [sampling, setSampling] = useState<string | null>(null)
  const samplingRef = useRef<string | null>(null)
  samplingRef.current = sampling
  const selected = chosen?.voiceURI ?? ''

  // focus in on open, back to the opener on close; a sample in progress never outlives the sheet
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    ;(panel.current?.querySelector<HTMLElement>('input[type=radio]:checked') ?? panel.current)?.focus()
    return () => {
      if (samplingRef.current) window.speechSynthesis.cancel()
      opener?.focus?.()
    }
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panel.current) return
    const f = [...panel.current.querySelectorAll<HTMLElement>('button:not(:disabled), input[type=radio]:checked')]
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const sample = (id: string, voice?: SpeechSynthesisVoice) => {
    const synth = window.speechSynthesis
    if (sampling === id) {
      synth.cancel()
      setSampling(null)
      return
    }
    synth.cancel()
    const u = makeUtterance(SAMPLE_LINE, { lang: 'en', baseRate: LISTEN_RATE, voice: voice ?? autoVoice('en', voices) })
    u.onend = u.onerror = () => setSampling((k) => (k === id ? null : k))
    setSampling(id)
    synth.speak(u)
  }

  const rows: { id: string; uri: string; name: string; sub: string; voice?: SpeechSynthesisVoice }[] = [
    { id: 'auto', uri: '', name: 'auto (best match)', sub: 'picks the right voice for each quote' },
    ...voices.map((v) => ({ id: v.voiceURI, uri: v.voiceURI, name: voiceName(v), sub: `${langLabel(v.lang)} · ${v.localService ? 'offline' : 'online'}`, voice: v })),
  ]

  return (
    <div className="vx-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className="vx-sheet" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`} tabIndex={-1} onKeyDown={onKey}>
        <header className="vx-head">
          <h2 id={`${uid}-t`}>choose a voice</h2>
          <button type="button" className="icon-btn ghost" onClick={onClose} aria-label="Close voice picker">
            ✕
          </button>
        </header>

        <div className="vx-body">
          {midQuote ? (
            <p className="vx-note" role="status">
              A quote is being read right now. Your pick starts from the next one, and samples wait for the music break (or pause first).
            </p>
          ) : (
            <p className="vx-note">Your pick starts from the next quote and is used everywhere the app reads aloud.</p>
          )}

          {!ready && !voices.length ? (
            <p className="vx-empty" role="status">
              loading voices…
            </p>
          ) : !voices.length ? (
            <p className="vx-empty" role="status">
              Your phone hasn’t loaded any voices. On Android: Settings → System → Languages → Text-to-speech output.
            </p>
          ) : (
            <div role="radiogroup" aria-label="Voice" className="vx-list">
              {rows.map((r) => (
                <div key={r.id} className={`vx-row${selected === r.uri ? ' on' : ''}`}>
                  <label className="vx-pick">
                    <input type="radio" name={`${uid}-voice`} checked={selected === r.uri} onChange={() => onVoice(r.uri || undefined)} />
                    <span className="vx-meta">
                      <b>{r.name}</b>
                      <small>{r.sub}</small>
                    </span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm vx-hear"
                    onClick={() => sample(r.id, r.voice)}
                    disabled={midQuote && sampling !== r.id}
                    aria-label={sampling === r.id ? `Stop sample of ${r.name}` : `Hear a sample of ${r.name}`}
                  >
                    {sampling === r.id ? '■ stop' : '▶ hear'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="vx-foot">
          <span className="kicker" id={`${uid}-speed`}>
            speed
          </span>
          <div className="vx-speed" role="group" aria-labelledby={`${uid}-speed`}>
            {RATES.map((r, n) => (
              <button key={r} type="button" className={`chip${Math.abs(rate - r) < 0.05 ? ' on' : ''}`} aria-pressed={Math.abs(rate - r) < 0.05} onClick={() => onRate(r)}>
                {RATE_NAMES[n]}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function Listen() {
  const p = useProgress()
  const mixes = useMemo(() => [...(mineFor(p.faith) ? [mineFor(p.faith)!] : []), ...MIXES], [p.faith])
  // #/listen/reels (and the old #/listen/vibe) open the reels straight away.
  const [tab, setTab] = useState<'quotes' | 'reels'>(() => (/^#\/listen\/(reels|vibe)/.test(window.location.hash) ? 'reels' : 'quotes'))
  const switchTab = (t: 'quotes' | 'reels') => {
    setTab(t)
    history.replaceState(null, '', t === 'reels' ? '#/listen/reels' : '#/listen')
  }
  const [mix, setMix] = useState<Mix | null>(null)
  const [queue, setQueue] = useState<Item[]>([])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'music'>('idle')
  const [paused, setPaused] = useState(false)
  const [left, setLeft] = useState(INTERLUDE)
  const [withMusic, setWithMusic] = useState(true)
  const [tracks, setTracks] = useState<Track[]>([])
  const music = useRef<HTMLAudioElement | null>(null)
  const canSpeak = canSpeakAloud()
  const { voices, ready } = useVoices()
  const { pref, setVoice, setRate } = useVoicePref()
  const [voiceOpen, setVoiceOpen] = useState(false)
  // a saved voice that's no longer installed quietly counts as "auto"
  const chosen = voices.find((v) => v.voiceURI === pref.voiceURI)

  const item = queue[i]

  // load music for the mix
  useEffect(() => {
    if (!mix) return
    setTracks([])
    searchFull(mix.music, 30)
      .then((t) => setTracks(t.sort(() => Math.random() - 0.5)))
      .catch(() => setTracks([]))
  }, [mix])

  const musicTrack = useMemo(() => (tracks.length ? tracks[i % tracks.length] : null), [tracks, i])

  useEffect(() => {
    if (!music.current) music.current = new Audio()
    const el = music.current
    el.loop = true
    return () => {
      el.pause()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // keep music playing under speech (ducked) and up during interludes
  useEffect(() => {
    const el = music.current
    if (!el) return
    if (!withMusic || phase === 'idle' || !musicTrack) {
      el.pause()
      return
    }
    if (el.src !== musicTrack.src) {
      el.src = musicTrack.src
      el.currentTime = 0
    }
    el.volume = phase === 'speaking' ? 0.22 : 0.75
    if (!paused) el.play().catch(() => undefined)
    else el.pause()
  }, [phase, musicTrack, withMusic, paused])

  // speaking phase
  useEffect(() => {
    if (phase !== 'speaking' || !item || paused) return
    if (!canSpeak) {
      const t = setTimeout(() => setPhase('music'), 9000)
      return () => clearTimeout(t)
    }
    speak(item.speak, () => setPhase('music'))
    return () => window.speechSynthesis.cancel()
  }, [phase, item, paused, canSpeak])

  // music interlude countdown → next quote
  useEffect(() => {
    if (phase !== 'music' || paused) return
    if (left <= 0) {
      setI((x) => x + 1)
      setLeft(INTERLUDE)
      setPhase('speaking')
      log('verse', { silent: true })
      return
    }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, paused, left])

  const start = (m: Mix) => {
    unlockAudio()
    setMix(m)
    setQueue(buildQueue(m, p.faith))
    setI(0)
    setLeft(INTERLUDE)
    setPaused(false)
    setPhase('speaking')
  }
  const next = () => {
    window.speechSynthesis?.cancel()
    setI(i + 1)
    setLeft(INTERLUDE)
    setPhase('speaking')
  }
  const stop = () => {
    window.speechSynthesis?.cancel()
    music.current?.pause()
    setPhase('idle')
    setMix(null)
  }

  const voiceButton = canSpeak && (
    <button type="button" className="btn btn-ghost btn-sm vx-btn" onClick={() => setVoiceOpen(true)} aria-haspopup="dialog">
      <span aria-hidden="true">🗣️</span> voice: <b>{chosen ? voiceName(chosen) : 'auto'}</b>
    </button>
  )
  const voiceSheet = voiceOpen && canSpeak && (
    <VoiceSheet
      voices={voices}
      ready={ready}
      chosen={chosen}
      rate={pref.rate}
      midQuote={!!mix && phase === 'speaking' && !paused}
      onVoice={setVoice}
      onRate={setRate}
      onClose={() => setVoiceOpen(false)}
    />
  )

  if (!mix || !item)
    return (
      <div className="page listen">
        <header className="listen-head">
          <span className="ibub big">
            <Icon name="listen" size={30} />
          </span>
          <h1>listen</h1>
          <p className="muted">
            {tab === 'quotes'
              ? 'quotes from every faith, read to you, with music in between. hands-free — like a podcast you don’t have to think about.'
              : 'songs that play themselves. swipe for the next one, save the ones that hit.'}
          </p>
        </header>
        <div className="listen-tabs" role="tablist" aria-label="Listen">
          <button type="button" role="tab" aria-selected={tab === 'quotes'} className={tab === 'quotes' ? 'on' : ''} onClick={() => switchTab('quotes')}>
            <Icon name="listen" size={16} /> quotes + music
          </button>
          <button type="button" role="tab" aria-selected={tab === 'reels'} className={tab === 'reels' ? 'on' : ''} onClick={() => switchTab('reels')}>
            <Icon name="play" size={16} /> music reels
          </button>
        </div>
        {tab === 'reels' ? (
          <MusicReels />
        ) : (
          <>
            {voiceButton && <div className="vx-bar">{voiceButton}</div>}
            <div className="mix-grid">
              {mixes.map((m) => (
                <button key={m.id} type="button" className={`mix a-${m.accent}`} onClick={() => start(m)}>
                  <span className="mix-play">
                    <Icon name="play" size={20} />
                  </span>
                  <b>{m.name}</b>
                  <small>{m.line}</small>
                </button>
              ))}
            </div>
            {!canSpeak && <p className="muted center">Your browser can’t read aloud — quotes will show on screen with music.</p>}
          </>
        )}
        {voiceSheet}
      </div>
    )

  return (
    <div className={`listen-player a-${mix.accent}`}>
      <div className="lp-top">
        <button type="button" className="icon-btn ghost" onClick={stop} aria-label="Stop">
          ✕
        </button>
        <span className="kicker">
          {mix.name} · {i + 1} / {queue.length}
        </span>
        <label className="toggle">
          <input type="checkbox" checked={withMusic} onChange={(e) => setWithMusic(e.target.checked)} />
          <span>music</span>
        </label>
      </div>

      <div className="lp-body" key={i}>
        <span className="trad-chip">{item.badge}</span>
        {item.original && (
          <p className={`orig lang-${item.lang}`} lang={item.lang} dir={item.rtl ? 'rtl' : undefined}>
            {item.original}
          </p>
        )}
        <p className="lp-text">{item.text}</p>
      </div>

      <div className="lp-status">
        {phase === 'speaking' ? (
          <span className="lp-wave" aria-label="Reading aloud">
            <i />
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span className="muted">
            <Icon name="listen" size={14} /> {musicTrack ? `${musicTrack.title} · ${musicTrack.artist}` : 'music'} · next in {left}s
          </span>
        )}
      </div>

      <div className="lp-controls">
        <button type="button" className="btn" onClick={() => shareCard({ kicker: item.badge, original: item.original, lang: item.lang, rtl: item.rtl, text: item.text })}>
          ↗ share
        </button>
        <button type="button" className="icon-btn play big-play" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play' : 'Pause'}>
          {paused ? '▶' : '❚❚'}
        </button>
        <button type="button" className="btn" onClick={next}>
          next →
        </button>
      </div>
      {voiceButton && <div className="vx-bar">{voiceButton}</div>}
      {musicTrack && (
        <p className="lp-credit">
          music:{' '}
          <WebLink className="linkish" url={musicTrack.link ?? ''} title={`${musicTrack.title} on Audius`}>
            {musicTrack.title} — {musicTrack.artist} on Audius
          </WebLink>
        </p>
      )}
      {voiceSheet}
    </div>
  )
}

export { MIXES }
