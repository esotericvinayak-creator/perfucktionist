import { useCallback, useEffect, useRef, useState } from 'react'
import { Callout, PageHero, Section } from '../components/ui'
import { fullSongLinks, usePlayer, type Track } from '../context/Player'
import { moods, playlists, radios, searchFull, searchSongs, stores } from '../lib/music'
import { pick, useLocalState } from '../lib/storage'

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; msg: string } | { kind: 'done' }

function TrackCard({ t, list }: { t: Track; list: Track[] }) {
  const player = usePlayer()
  const isCurrent = player.track?.id === t.id
  return (
    <li className={`track${isCurrent ? ' current' : ''}`}>
      <button type="button" className="track-play" onClick={() => (isCurrent ? player.toggle() : player.play(t, list))} aria-label={`${isCurrent && player.playing ? 'Pause' : 'Play'} ${t.title} by ${t.artist}${t.kind === 'full' ? ', full song' : ', 30 second preview'}`}>
        {t.art ? <img src={t.art} alt="" loading="lazy" width={300} height={300} /> : <span className="track-noart">🎵</span>}
        <span className={`len-badge on-art ${t.kind}`}>{t.kind === 'full' ? 'FULL' : '30s'}</span>
        <span className="track-btn" aria-hidden="true">
          {isCurrent && player.playing ? '❚❚' : '▶'}
        </span>
        {isCurrent && player.playing && (
          <span className="eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
      </button>
      <div className="track-meta">
        <strong title={t.title}>{t.title}</strong>
        <span title={t.artist}>{t.artist}</span>
      </div>
      <div className="track-links">
        {t.kind === 'full' ? (
          <a href={t.link} target="_blank" rel="noreferrer">
            on Audius ↗
          </a>
        ) : (
          fullSongLinks(t.title, t.artist, t.link).map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))
        )}
      </div>
    </li>
  )
}

export default function Music() {
  const player = usePlayer()
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState('')
  const [store, setStore] = useLocalState('music-store', 'IN')
  const [tracks, setTracks] = useState<Track[]>([])
  const [fulls, setFulls] = useState<Track[]>([])
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [playlist, setPlaylist] = useState(playlists[0].id)
  const [radio, setRadio] = useState<string | null>(null)
  const latest = useRef(0)

  // Both catalogues are searched together: Apple = every song (30s), Audius = full songs by independent artists.
  const run = useCallback(
    async (term: string, heading: string, fullTerm?: string) => {
      const id = ++latest.current
      setLabel(heading)
      setStatus({ kind: 'loading' })
      const [previews, full] = await Promise.allSettled([searchSongs(term, store), fullTerm ? searchFull(fullTerm) : Promise.resolve([])])
      if (id !== latest.current) return
      setTracks(previews.status === 'fulfilled' ? previews.value : [])
      setFulls(full.status === 'fulfilled' ? full.value : [])
      if (previews.status === 'rejected' && full.status === 'rejected') setStatus({ kind: 'error', msg: 'Couldn’t reach the music catalogues. Check your internet and try again.' })
      else setStatus({ kind: 'done' })
    },
    [store],
  )

  useEffect(() => {
    const seed = pick(moods[0].terms)
    void run(seed, `🎬 Bollywood · ${seed}`, moods[0].full)
    // Only on first visit — afterwards the user drives.
  }, [])

  const searchMood = (i: number) => {
    const seed = pick(moods[i].terms)
    void run(seed, `${moods[i].label} · ${seed}`, moods[i].full)
  }

  return (
    <div className="page">
      <PageHero
        kicker="zone 06 · vibe room"
        accent="orange"
        emoji="🎧"
        title={
          <>
            any song. any language. <span className="serif">any mood.</span>
          </>
        }
        sub="Bollywood, Hollywood, Punjabi, K-pop, bhajans, ghazals, lofi — search basically every song on earth and play it right here. Keep browsing; the music follows you."
      />

      <Section kicker="search the planet" title={<>what are we <span className="serif">playing?</span></>}>
        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault()
            const q = query.trim()
            if (q) void run(q, `🔎 “${q}”`)
          }}
        >
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="song, artist, movie… try “kesariya” or “blinding lights”" aria-label="Search songs" />
          <select value={store} onChange={(e) => setStore(e.target.value)} aria-label="Music store region">
            {stores.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary a-orange">
            search
          </button>
        </form>

        <div className="row gap-sm wrap filter-row" role="group" aria-label="Moods and genres">
          {moods.map((m, i) => (
            <button key={m.label} type="button" className={`chip${label.startsWith(m.label) ? ' on' : ''}`} onClick={() => searchMood(i)}>
              {m.label}
            </button>
          ))}
        </div>

        {status.kind === 'loading' && (
          <div className="track-grid" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="track skeleton" />
            ))}
          </div>
        )}
        {status.kind === 'error' && <p className="error-text">{status.msg}</p>}

        {status.kind === 'done' && fulls.length > 0 && (
          <div className="music-block">
            <div className="results-head">
              <p className="kicker">
                <span className="len-badge full">FULL</span> full tracks · independent artists on Audius
              </p>
              <button type="button" className="btn btn-sm btn-primary a-lime" onClick={() => player.play(fulls[0], fulls)}>
                ▶ play all
              </button>
            </div>
            <ul className="track-row">
              {fulls.map((t) => (
                <TrackCard key={t.id} t={t} list={fulls} />
              ))}
            </ul>
          </div>
        )}

        {status.kind === 'done' && (
          <div className="music-block">
            <div className="results-head">
              <p className="kicker">
                <span className="len-badge preview">30s</span> {label || 'every song'} · previews
              </p>
              <span className="muted itunes-credit">previews courtesy of iTunes</span>
            </div>
            {tracks.length === 0 ? (
              <p className="muted">Nothing found. Try a different spelling, or switch the region.</p>
            ) : (
              <ul className="track-grid">
                {tracks.map((t) => (
                  <TrackCard key={t.id} t={t} list={tracks} />
                ))}
              </ul>
            )}
          </div>
        )}
        <Callout accent="orange" icon="ℹ️">
          <b>FULL</b> tracks are original instrumental and lofi music by independent artists on Audius (shown for Lofi only). <b>30s</b> previews come from Apple Music — tap Apple Music, YouTube, Spotify or JioSaavn under a song for the full version.
        </Callout>
      </Section>

      <Section kicker="full playlists" title={<>press play, <span className="serif">forget the world</span></>} intro="Full songs on a laptop or desktop (Chrome, Edge, Firefox) when you’re logged in to Spotify. Phones and iPhones get 30-second previews.">
        <div className="row gap-sm wrap filter-row" role="group" aria-label="Playlists">
          {playlists.map((p) => (
            <button key={p.id} type="button" className={`chip${playlist === p.id ? ' on' : ''}`} onClick={() => setPlaylist(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="embed-frame">
          <iframe
            key={playlist}
            title="Spotify playlist"
            src={`https://open.spotify.com/embed/playlist/${playlist}?utm_source=generator`}
            width="100%"
            height="420"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>
      </Section>

      <Section kicker="24/7 radio" title={<>study, chill, <span className="serif">repeat</span></>}>
        <div className="grid grid-2">
          {radios.map((r) => (
            <div key={r.id} className="card radio a-orange">
              {radio === r.id ? (
                <div className="video-frame">
                  <iframe title={r.name} src={`https://www.youtube-nocookie.com/embed/${r.id}?autoplay=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                </div>
              ) : (
                <button type="button" className={`radio-cover a-${r.accent}`} onClick={() => setRadio(r.id)} aria-label={`Play ${r.name}`}>
                  <span className="radio-live">● live 24/7</span>
                  <span className="radio-emoji" aria-hidden="true">
                    {r.emoji}
                  </span>
                  <span className="track-btn" aria-hidden="true">
                    ▶
                  </span>
                </button>
              )}
              <h3>
                {r.emoji} {r.name}
              </h3>
              <p className="muted">{r.note} · Lofi Girl</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
