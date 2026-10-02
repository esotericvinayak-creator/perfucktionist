import { ChevronUp } from 'lucide-react'
import { usePlayer } from '../context/Player'
import { NowPlaying } from './NowPlaying'

export function MiniPlayer() {
  const { track, playing, progress, toggle, next, prev, close, setSheet } = usePlayer()
  if (!track) return null
  return (
    <>
      <aside className="mini-player" aria-label="Now playing">
        <div className="mp-progress" style={{ width: `${progress * 100}%` }} />
        <button type="button" className="mp-open" onClick={() => setSheet(true)} aria-label={`Open player: ${track.title} by ${track.artist}`}>
          {track.art ? <img className={`mp-art${playing ? ' spinning' : ''}`} src={track.art} alt="" width={52} height={52} /> : <span className="mp-art">🎵</span>}
          <span className="mp-meta">
            <strong>
              <span className={`len-badge ${track.kind}`}>{track.kind === 'full' ? 'FULL' : '30s'}</span> {track.title}
            </strong>
            <span>{track.artist}</span>
            <span className="mp-links">{track.kind === 'full' ? `full song · on ${track.source}` : 'preview courtesy of iTunes · tap for full song & lyrics'}</span>
          </span>
          <ChevronUp className="mp-up" size={18} aria-hidden="true" />
        </button>
        <div className="mp-controls">
          <button type="button" className="icon-btn" onClick={prev} aria-label="Previous">
            ⏮
          </button>
          <button type="button" className="icon-btn play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button type="button" className="icon-btn" onClick={next} aria-label="Next">
            ⏭
          </button>
          <button type="button" className="icon-btn ghost" onClick={close} aria-label="Close player">
            ✕
          </button>
        </div>
      </aside>
      <NowPlaying />
    </>
  )
}
