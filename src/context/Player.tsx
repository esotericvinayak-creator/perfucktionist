import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { log } from '../lib/progress'

export type Track = {
  id: string
  title: string
  artist: string
  album: string
  art: string
  /** Audio stream: a 30-second preview (Apple) or a full track (Audius). */
  src: string
  /** 'preview' = 30-second clip, 'full' = whole song. */
  kind: 'preview' | 'full'
  /** Where the song lives (Apple Music page, Audius page) — shown as attribution. */
  link?: string
  source: 'Apple Music' | 'Audius'
}

type Player = {
  track: Track | null
  playing: boolean
  progress: number
  /** Seconds into the track, and its length. */
  time: number
  duration: number
  queue: Track[]
  index: number
  play: (track: Track, queue?: Track[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
  jump: (index: number) => void
  seek: (seconds: number) => void
  close: () => void
  /** The full-screen Now Playing sheet. */
  sheet: boolean
  setSheet: (open: boolean) => void
  liked: Track[]
  isLiked: (t: Track) => boolean
  toggleLike: (t: Track) => void
}

const LIKED_KEY = 'pf:liked'
function readLiked(): Track[] {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]') as Track[]
  } catch {
    return []
  }
}

const PlayerContext = createContext<Player | null>(null)

// The player lives above the router so music keeps going while you browse the rest of the site.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sheet, setSheet] = useState(false)
  const [liked, setLiked] = useState<Track[]>(readLiked)
  const track = queue[index] ?? null

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked))
    } catch {
      // storage blocked — likes live in memory for this visit
    }
  }, [liked])

  if (!audio.current && typeof Audio !== 'undefined') audio.current = new Audio()

  const load = useCallback((t: Track) => {
    const el = audio.current
    if (!el) return
    el.src = t.src
    setProgress(0)
    setTime(0)
    setDuration(0)
    el.play().catch(() => setPlaying(false))
  }, [])

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!queue.length) return
      const i = (index + dir + queue.length) % queue.length
      setIndex(i)
      load(queue[i])
    },
    [queue, index, load],
  )

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => {
      const d = Number.isFinite(el.duration) ? el.duration : 0
      setProgress(d ? el.currentTime / d : 0)
      setTime(el.currentTime)
      setDuration(d)
    }
    // Apple's preview rules: previews are samples, not a radio — only full tracks auto-advance.
    const onEnd = () => {
      if (track?.kind === 'full') step(1)
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onTime)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [step, track])

  const value = useMemo<Player>(
    () => ({
      track,
      playing,
      progress,
      time,
      duration,
      queue,
      index,
      play: (t, list) => {
        const q = list?.length ? list : [t]
        setQueue(q)
        setIndex(
          Math.max(
            0,
            q.findIndex((x) => x.id === t.id),
          ),
        )
        load(t)
        log('music', { silent: true })
      },
      toggle: () => {
        const el = audio.current
        if (!el || !track) return
        if (el.paused) void el.play()
        else el.pause()
      },
      next: () => step(1),
      prev: () => {
        // Like every music app: "previous" restarts the song unless you're right at the start.
        const el = audio.current
        if (el && el.currentTime > 3) el.currentTime = 0
        else step(-1)
      },
      jump: (i) => {
        if (!queue[i]) return
        setIndex(i)
        load(queue[i])
      },
      seek: (sec) => {
        const el = audio.current
        if (el && Number.isFinite(sec)) el.currentTime = sec
      },
      close: () => {
        audio.current?.pause()
        setQueue([])
        setIndex(-1)
        setSheet(false)
      },
      sheet,
      setSheet,
      liked,
      isLiked: (t) => liked.some((x) => x.id === t.id),
      toggleLike: (t) => setLiked((l) => (l.some((x) => x.id === t.id) ? l.filter((x) => x.id !== t.id) : [t, ...l].slice(0, 100))),
    }),
    [track, playing, progress, time, duration, queue, index, load, step, sheet, liked],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return ctx
}

/** Where to hear the full song — previews are only 30 seconds. */
export function fullSongLinks(title: string, artist: string, appleUrl?: string) {
  const q = encodeURIComponent(`${title} ${artist}`)
  return [
    // Apple first: the preview comes from Apple, and its terms ask for the store link up front.
    ...(appleUrl ? [{ label: 'Apple Music', href: appleUrl }] : []),
    { label: 'YouTube', href: `https://www.youtube.com/results?search_query=${q}` },
    { label: 'Spotify', href: `https://open.spotify.com/search/${q}` },
    { label: 'JioSaavn', href: `https://www.jiosaavn.com/search/song/${q}` },
  ]
}
