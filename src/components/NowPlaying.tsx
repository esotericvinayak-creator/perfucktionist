// Full-screen Now Playing: big art you can swipe, a real scrubber, lyrics, up next and credits.
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ChevronDown, ExternalLink, Heart, ListMusic, Mic2, Pause, Play, SkipBack, SkipForward, Info } from 'lucide-react'
import { fullSongLinks, usePlayer, type Track } from '../context/Player'

const fmt = (s: number) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

/** Swipe left/right on an element. Returns handlers + the live drag offset for a tilt effect. */
export function useSwipe(onLeft: () => void, onRight: () => void, onTap?: () => void, threshold = 80) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const [dx, setDx] = useState(0)
  return {
    dx,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        start.current = { x: e.clientX, y: e.clientY }
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      },
      onPointerMove: (e: PointerEvent) => {
        if (!start.current) return
        const x = e.clientX - start.current.x
        if (Math.abs(x) > Math.abs(e.clientY - start.current.y)) setDx(x)
      },
      onPointerUp: () => {
        if (dx > threshold) onRight()
        else if (dx < -threshold) onLeft()
        else if (Math.abs(dx) < 6 && start.current) onTap?.()
        start.current = null
        setDx(0)
      },
      onPointerCancel: () => {
        start.current = null
        setDx(0)
      },
    },
  }
}

function Lyrics({ track, playing }: { track: Track; playing: boolean }) {
  // We only show words we're licensed to show. Audius tracks here are instrumental lofi;
  // for label songs, synced lyrics live with the services that license them.
  const bars = Array.from({ length: 24 }, (_, i) => i)
  return (
    <div className="np-lyrics">
      <div className={`np-viz${playing ? ' on' : ''}`} aria-hidden="true">
        {bars.map((i) => (
          <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${700 + ((i * 53) % 500)}ms` }} />
        ))}
      </div>
      {track.kind === 'full' ? (
        <>
          <p className="np-lyric-big">♪ instrumental ♪</p>
          <p className="muted">no words — just vibes. breathe with the beat.</p>
        </>
      ) : (
        <>
          <p className="np-lyric-big">sing along 🎤</p>
          <p className="muted">lyrics belong to the songwriters and need their own licence, which we don’t have yet — so we won’t copy them. these apps show them synced, word by word:</p>
          <div className="np-links">
            {fullSongLinks(track.title, track.artist, track.link)
              .slice(0, 3)
              .map((l) => (
                <a key={l.label} className="btn btn-sm" href={l.href} target="_blank" rel="noreferrer">
                  <Mic2 size={14} /> {l.label}
                </a>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

export function NowPlaying() {
  const pl = usePlayer()
  const { track, playing, time, duration, queue, index, sheet, setSheet } = pl
  const [tab, setTab] = useState<'lyrics' | 'next' | 'about'>('lyrics')
  const [scrub, setScrub] = useState<number | null>(null)
  const [broken, setBroken] = useState<Set<string>>(() => new Set())
  const swipe = useSwipe(pl.next, pl.prev)

  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet(false)
    }
    document.body.classList.add('np-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('np-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [sheet, setSheet])

  if (!sheet || !track) return null
  const liked = pl.isLiked(track)
  const len = duration || (track.kind === 'preview' ? 30 : 0)
  const at = scrub ?? time

  return (
    <div className="np" role="dialog" aria-modal="true" aria-label="Now playing">
      <div className="np-bg" style={{ backgroundImage: track.art ? `url("${track.art}")` : undefined }} aria-hidden="true" />
      <header className="np-top">
        <button type="button" className="icon-btn ghost" onClick={() => setSheet(false)} aria-label="Close now playing">
          <ChevronDown size={24} />
        </button>
        <span className="np-from">
          {track.kind === 'full' ? 'full song · Audius' : '30s preview · iTunes'}
          <small>
            {index + 1} / {queue.length}
          </small>
        </span>
        <button type="button" className={`icon-btn ghost${liked ? ' liked' : ''}`} onClick={() => pl.toggleLike(track)} aria-label={liked ? 'Unlike' : 'Like'} aria-pressed={liked}>
          <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="np-art-wrap" {...swipe.handlers} style={{ transform: `translateX(${swipe.dx}px) rotate(${swipe.dx / 25}deg)` }}>
        {track.art && !broken.has(track.art) ? (
          <img className={`np-art${playing ? ' playing' : ''}`} src={track.art} alt="" draggable={false} onError={() => setBroken((b) => new Set(b).add(track.art))} />
        ) : (
          <span className="np-art np-noart">🎵</span>
        )}
        <span className="np-swipe-hint" aria-hidden="true">
          ← swipe to change →
        </span>
      </div>

      <div className="np-meta">
        <h2>
          <span className={`len-badge ${track.kind}`}>{track.kind === 'full' ? 'FULL' : '30s'}</span> {track.title}
        </h2>
        <p>{track.artist}</p>
      </div>

      <div className="np-scrub">
        <input
          type="range"
          min={0}
          max={len || 1}
          step={0.1}
          value={Math.min(at, len || 1)}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={() => {
            if (scrub !== null) pl.seek(scrub)
            setScrub(null)
          }}
          onKeyUp={() => {
            if (scrub !== null) pl.seek(scrub)
            setScrub(null)
          }}
          aria-label="Seek"
          style={{ '--pct': `${len ? (Math.min(at, len) / len) * 100 : 0}%` } as CSSProperties}
        />
        <div className="np-times">
          <span>{fmt(at)}</span>
          <span>{fmt(len)}</span>
        </div>
      </div>

      <div className="np-controls">
        <button type="button" className="icon-btn ghost" onClick={pl.prev} aria-label="Previous">
          <SkipBack size={26} />
        </button>
        <button type="button" className="icon-btn np-play" onClick={pl.toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
        </button>
        <button type="button" className="icon-btn ghost" onClick={pl.next} aria-label="Next">
          <SkipForward size={26} />
        </button>
      </div>

      <div className="np-tabs" role="tablist">
        {(
          [
            ['lyrics', <Mic2 key="i" size={16} />, 'lyrics'],
            ['next', <ListMusic key="i" size={16} />, 'up next'],
            ['about', <Info key="i" size={16} />, 'credits'],
          ] as const
        ).map(([id, icon, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="np-panel">
        {tab === 'lyrics' && <Lyrics track={track} playing={playing} />}
        {tab === 'next' && (
          <ol className="np-queue">
            {queue.map((t, i) => (
              <li key={`${t.id}-${i}`}>
                <button type="button" className={i === index ? 'on' : ''} onClick={() => pl.jump(i)}>
                  {t.art ? <img src={t.art} alt="" width={40} height={40} loading="lazy" /> : <span>🎵</span>}
                  <span className="grow">
                    <b>{t.title}</b>
                    <small>
                      {t.kind === 'full' ? 'FULL' : '30s'} · {t.artist}
                    </small>
                  </span>
                  {i === index && playing && (
                    <span className="eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>
        )}
        {tab === 'about' && (
          <div className="np-about">
            {track.kind === 'full' ? (
              <>
                <p>
                  A full track by an independent artist, streamed from <b>Audius</b>. Show them some love:
                </p>
                <a className="btn btn-sm" href={track.link} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} /> {track.artist} on Audius
                </a>
              </>
            ) : (
              <>
                <p>
                  A 30-second preview, courtesy of <b>iTunes</b>. Hear the whole song here:
                </p>
                <div className="np-links">
                  {fullSongLinks(track.title, track.artist, track.link).map((l) => (
                    <a key={l.label} className="btn btn-sm" href={l.href} target="_blank" rel="noreferrer">
                      <ExternalLink size={14} /> {l.label}
                    </a>
                  ))}
                </div>
              </>
            )}
            {track.album && <p className="muted">album · {track.album}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
