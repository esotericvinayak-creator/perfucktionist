// Vibe room: a deck of songs. Swipe right to save, left to skip — every swipe plays the next one.
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronUp, Heart, Pause, Play, X } from 'lucide-react'
import { usePlayer, type Track } from '../context/Player'
import { moods, searchFull, searchSongs, type Mood } from '../lib/music'
import { pick, useLocalState } from '../lib/storage'
import { useSwipe } from './NowPlaying'

// Lofi first: it's the one with full songs.
const ROOM = [...moods.filter((m) => m.full), ...moods.filter((m) => !m.full)]
const shuffle = <T,>(list: T[]) => [...list].sort(() => Math.random() - 0.5)

export function VibeRoom() {
  const pl = usePlayer()
  const [store] = useLocalState('music-store', 'IN')
  const [mood, setMood] = useState<Mood>(ROOM[0])
  const [deck, setDeck] = useState<Track[]>([])
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [fly, setFly] = useState<'left' | 'right' | null>(null)
  const req = useRef(0)

  const load = useCallback(
    async (m: Mood, autoplay = false) => {
      const id = ++req.current
      setState('loading')
      const [previews, full] = await Promise.allSettled([searchSongs(pick(m.terms), store, 25), m.full ? searchFull(m.full, 20) : Promise.resolve([])])
      if (id !== req.current) return
      const a = full.status === 'fulfilled' ? shuffle(full.value) : []
      const b = previews.status === 'fulfilled' ? shuffle(previews.value.filter((t) => t.src)) : []
      // Interleave full songs and previews so the deck never feels samey.
      const list: Track[] = []
      for (let i = 0; i < Math.max(a.length, b.length); i++) list.push(...(a[i] ? [a[i]] : []), ...(b[i] ? [b[i]] : []))
      if (!list.length) return setState('error')
      setDeck(list)
      setIdx(0)
      setState('ready')
      if (autoplay) pl.play(list[0], list)
    },
    // pl.play is safe to capture: it only calls setters and the shared audio element.
    [store],
  )

  useEffect(() => {
    void load(mood)
  }, [mood, load])

  // The deck is the player here, so the mini player steps aside (the sheet still opens from "lyrics & player").
  useEffect(() => {
    document.body.classList.add('vr-on')
    return () => document.body.classList.remove('vr-on')
  }, [])

  // Stay in sync when the song changes from the mini player or a full track ends on its own.
  useEffect(() => {
    if (!pl.track) return
    const i = deck.findIndex((t) => t.id === pl.track!.id)
    if (i >= 0) setIdx(i)
  }, [pl.track, deck])

  const card = deck[idx]
  const current = !!card && pl.track?.id === card.id
  const go = (dir: 'left' | 'right') => {
    if (!card || fly) return
    if (dir === 'right' && !pl.isLiked(card)) pl.toggleLike(card)
    setFly(dir)
    setTimeout(() => {
      setFly(null)
      const n = idx + 1
      if (n >= deck.length) return void load(mood, true)
      setIdx(n)
      pl.play(deck[n], deck)
    }, 260)
  }
  const playPause = () => {
    if (!card) return
    if (current) pl.toggle()
    else pl.play(card, deck)
  }
  const swipe = useSwipe(
    () => go('left'),
    () => go('right'),
    playPause,
  )

  return (
    <div className="vibe-room">
      <div className="vr-moods" role="group" aria-label="Pick a vibe">
        {ROOM.map((m) => (
          <button key={m.label} type="button" className={`chip${m === mood ? ' on' : ''}`} onClick={() => setMood(m)} aria-pressed={m === mood}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="vr-deck" aria-live="polite">
        {state === 'loading' && <div className="vr-card vr-ghost">shuffling the deck…</div>}
        {state === 'error' && (
          <div className="vr-card vr-ghost">
            couldn’t reach the music catalogues.
            <button type="button" className="btn btn-sm" onClick={() => void load(mood)}>
              try again
            </button>
          </div>
        )}
        {state === 'ready' &&
          deck
            .slice(idx, idx + 3)
            .map((t, i) => {
              const top = i === 0
              const dx = top ? swipe.dx : 0
              return (
                <div
                  key={`${t.id}-${idx + i}`}
                  className={`vr-card${top ? ' top' : ''}${top && fly ? ` fly-${fly}` : ''}`}
                  style={{ zIndex: 3 - i, transform: top ? `translateX(${dx}px) rotate(${dx / 16}deg)` : `translateY(${i * 12}px) scale(${1 - i * 0.05})` }}
                  {...(top ? swipe.handlers : {})}
                  aria-hidden={!top}
                >
                  <span className="vr-noart">🎵</span>
                  {t.art && <img src={t.art.replace('300x300', '600x600')} alt="" draggable={false} onError={(e) => (e.currentTarget.style.display = 'none')} />}
                  {top && (
                    <>
                      <span className="vr-stamp like" style={{ opacity: Math.max(0, Math.min(1, dx / 80)) }}>
                        SAVE ♥
                      </span>
                      <span className="vr-stamp nope" style={{ opacity: Math.max(0, Math.min(1, -dx / 80)) }}>
                        SKIP
                      </span>
                    </>
                  )}
                  <div className="vr-info">
                    <span className={`len-badge ${t.kind}`}>{t.kind === 'full' ? 'FULL' : '30s'}</span>
                    <b>{t.title}</b>
                    <small>{t.artist}</small>
                  </div>
                  {top && (
                    <span className="vr-tap" aria-hidden="true">
                      {current && pl.playing ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
                    </span>
                  )}
                </div>
              )
            })
            .reverse()}
      </div>

      <div className="vr-actions">
        <button type="button" className="vr-btn nope" onClick={() => go('left')} aria-label="Skip song" disabled={!card}>
          <X size={28} />
        </button>
        <button type="button" className="vr-btn play" onClick={playPause} aria-label={current && pl.playing ? 'Pause' : 'Play'} disabled={!card}>
          {current && pl.playing ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" />}
        </button>
        <button type="button" className="vr-btn like" onClick={() => go('right')} aria-label="Save song" disabled={!card}>
          <Heart size={28} fill={card && pl.isLiked(card) ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="vr-hint">
        swipe right to save ♥ · left to skip · tap to play
        {current && (
          <>
            {' · '}
            <button type="button" className="linkish" onClick={() => pl.setSheet(true)}>
              <ChevronUp size={14} /> lyrics & player
            </button>
          </>
        )}
      </p>

      {pl.liked.length > 0 && (
        <section className="vr-liked">
          <p className="kicker">your saved songs · {pl.liked.length}</p>
          <div className="vr-liked-row">
            {pl.liked.map((t) => (
              <button key={t.id} type="button" className={pl.track?.id === t.id ? 'on' : ''} onClick={() => pl.play(t, pl.liked)} aria-label={`Play ${t.title}`}>
                {t.art ? <img src={t.art} alt="" width={84} height={84} loading="lazy" /> : <span>🎵</span>}
                <small>{t.title}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="itunes-credit">
        30s previews courtesy of iTunes · full songs by independent artists on Audius · <a href="#/music">search any song →</a>
      </p>
    </div>
  )
}
