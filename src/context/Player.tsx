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
  play: (track: Track, queue?: Track[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
  close: () => void
}

const PlayerContext = createContext<Player | null>(null)

// The player lives above the router so music keeps going while you browse the rest of the site.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const track = queue[index] ?? null

  if (!audio.current && typeof Audio !== 'undefined') audio.current = new Audio()

  const load = useCallback((t: Track) => {
    const el = audio.current
    if (!el) return
    el.src = t.src
    setProgress(0)
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
    const onTime = () => setProgress(el.duration ? el.currentTime / el.duration : 0)
    // Apple's preview rules: previews are samples, not a radio — only full tracks auto-advance.
    const onEnd = () => {
      if (track?.kind === 'full') step(1)
    }
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [step, track])

  const value = useMemo<Player>(
    () => ({
      track,
      playing,
      progress,
      play: (t, list) => {
        const q = list?.length ? list : [t]
        setQueue(q)
        setIndex(Math.max(0, q.findIndex((x) => x.id === t.id)))
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
      prev: () => step(-1),
      close: () => {
        audio.current?.pause()
        setQueue([])
        setIndex(-1)
      },
    }),
    [track, playing, progress, load, step],
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
