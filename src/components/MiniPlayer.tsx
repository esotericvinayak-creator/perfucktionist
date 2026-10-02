import { fullSongLinks, usePlayer } from '../context/Player'

export function MiniPlayer() {
  const { track, playing, progress, toggle, next, prev, close } = usePlayer()
  if (!track) return null
  return (
    <aside className="mini-player" aria-label="Now playing">
      <div className="mp-progress" style={{ width: `${progress * 100}%` }} />
      <img className={`mp-art${playing ? ' spinning' : ''}`} src={track.art} alt="" width={52} height={52} />
      <div className="mp-meta">
        <strong>
          <span className={`len-badge ${track.kind}`}>{track.kind === 'full' ? 'FULL' : '30s'}</span> {track.title}
        </strong>
        <span>{track.artist}</span>
        <span className="mp-links">
          {track.kind === 'full' ? (
            <a href={track.link} target="_blank" rel="noreferrer">
              on {track.source} ↗
            </a>
          ) : (
            <>
              iTunes preview · full song →{' '}
              {fullSongLinks(track.title, track.artist, track.link)
                .slice(0, 3)
                .map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
            </>
          )}
        </span>
      </div>
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
  )
}
