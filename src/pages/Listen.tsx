// Listen: quotes read aloud with music under them, auto-advancing like a playlist. Hands-free.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { shareCard } from '../components/Overlays'
import { shlokas } from '../data/shlokas'
import { traditions, wisdom, type Theme } from '../data/wisdom'
import { searchFull } from '../lib/music'
import { log } from '../lib/progress'
import { unlockAudio } from '../lib/sound'
import type { Track } from '../context/Player'

type Item = { badge: string; original?: string; lang?: string; rtl?: boolean; text: string; speak: string }

const MIXES: { id: string; name: string; line: string; music: string; themes: Theme[]; shlokaVibes: string[]; accent: string }[] = [
  { id: 'morning', name: 'Morning calm', line: 'start soft', music: 'lofi', themes: ['calm', 'golden'], shlokaVibes: ['peace'], accent: 'violet' },
  { id: 'focus', name: 'Exam focus', line: 'lock in', music: 'lofi study', themes: ['action'], shlokaVibes: ['focus', 'strength'], accent: 'lime' },
  { id: 'brave', name: 'Hype me up', line: 'courage, every faith', music: 'desi hip hop', themes: ['courage', 'action'], shlokaVibes: ['strength'], accent: 'sun' },
  { id: 'heart', name: 'Heavy heart', line: 'for the hard days', music: 'ambient piano', themes: ['calm', 'oneness'], shlokaVibes: ['peace', 'love'], accent: 'pink' },
  { id: 'faith', name: 'Every faith', line: 'one message, many voices', music: 'meditation', themes: ['golden', 'oneness', 'truth'], shlokaVibes: ['faith', 'truth'], accent: 'cyan' },
  { id: 'night', name: 'Wind down', line: 'before sleep', music: 'ambient sleep', themes: ['calm'], shlokaVibes: ['peace'], accent: 'orange' },
]

const INTERLUDE = 18 // seconds of music between quotes

function buildQueue(mix: (typeof MIXES)[number]): Item[] {
  const w = wisdom.filter((x) => x.themes.some((t) => mix.themes.includes(t))).map((x) => ({ badge: `${traditions[x.tradition].emoji} ${x.source}`, original: x.original, lang: x.lang, rtl: x.rtl, text: x.text, speak: x.text }))
  const s = shlokas.filter((x) => x.vibes.some((v) => mix.shlokaVibes.includes(v as never))).map((x) => ({ badge: `🕉️ ${x.source}`, original: x.devanagari, lang: 'sa', text: x.meaning, speak: `${x.meaning}. ${x.genz}` }))
  return [...w, ...s].sort(() => Math.random() - 0.5)
}

function speak(text: string, onEnd: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voices = synth.getVoices()
  u.voice = voices.find((v) => v.lang === 'en-IN') ?? voices.find((v) => v.lang.startsWith('en')) ?? null
  u.rate = 0.92
  u.pitch = 1
  u.onend = u.onerror = onEnd
  synth.speak(u)
  return u
}

export default function Listen() {
  const [mix, setMix] = useState<(typeof MIXES)[number] | null>(null)
  const [queue, setQueue] = useState<Item[]>([])
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'music'>('idle')
  const [paused, setPaused] = useState(false)
  const [left, setLeft] = useState(INTERLUDE)
  const [withMusic, setWithMusic] = useState(true)
  const [tracks, setTracks] = useState<Track[]>([])
  const music = useRef<HTMLAudioElement | null>(null)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  const item = queue[i]

  // load music for the mix
  useEffect(() => {
    if (!mix) return
    setTracks([])
    searchFull(mix.music, 30).then((t) => setTracks(t.sort(() => Math.random() - 0.5))).catch(() => setTracks([]))
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

  const start = (m: (typeof MIXES)[number]) => {
    unlockAudio()
    setMix(m)
    setQueue(buildQueue(m))
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

  if (!mix || !item)
    return (
      <div className="page listen">
        <header className="listen-head">
          <span className="ibub big">
            <Icon name="listen" size={30} />
          </span>
          <h1>listen</h1>
          <p className="muted">quotes from every faith, read to you, with music in between. hands-free — like a podcast you don’t have to think about.</p>
        </header>
        <div className="mix-grid">
          {MIXES.map((m) => (
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
      {musicTrack && (
        <p className="lp-credit">
          music:{' '}
          <a href={musicTrack.link} target="_blank" rel="noreferrer">
            {musicTrack.title} — {musicTrack.artist} on Audius
          </a>
        </p>
      )}
    </div>
  )
}

export { MIXES }
