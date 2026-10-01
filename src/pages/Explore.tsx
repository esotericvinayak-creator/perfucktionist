import { useMemo, useState } from 'react'
import { PlusBadge } from '../components/Overlays'
import { AREAS } from '../data/app'
import { zoneByPath } from '../data/zones'
import { usePlus } from '../lib/plus'
import { NEEDS, TOOLS, type Need, type ToolMeta } from '../tools/registry'

// Long-form guide pages, named for people (not for the codebase).
const GUIDES: Record<string, { emoji: string; title: string; blurb: string }> = {
  '/journeys': { emoji: '🧭', title: 'Guided journeys', blurb: '5 min a day programs' },
  '/library': { emoji: '📚', title: 'Sacred library', blurb: 'Gita, Gurbani, Quran, Bible & more' },
}
const guide = (path: string) => GUIDES[path] ?? (() => {
  const z = zoneByPath(path)
  return z ? { emoji: z.emoji, title: z.title + (z.tag ? ` (${z.tag})` : ''), blurb: z.blurb } : null
})()

function Tile({ t, plus }: { t: ToolMeta; plus: boolean }) {
  return (
    <a href={`#/tools/${t.id}`} className={`tile cat-${t.cat}`}>
      <span className="tile-emoji">{t.emoji}</span>
      <b>{t.name}</b>
      <small>{t.hook}</small>
      {t.plus && !plus && <PlusBadge small />}
    </a>
  )
}

function GuideCard({ path }: { path: string }) {
  const g = guide(path)
  if (!g) return null
  return (
    <a className="guide" href={`#${path}`}>
      <span className="guide-emoji">{g.emoji}</span>
      <span className="grow">
        <b>{g.title}</b>
        <small>{g.blurb}</small>
      </span>
      <span aria-hidden="true">→</span>
    </a>
  )
}

export default function Explore() {
  // #/explore, #/explore/<area>, #/explore/for/<need>  (old #/tools and #/tools/for/<need> land here too)
  const parts = window.location.hash.replace(/^#\/(explore|tools)\/?/, '').split('/')
  const plus = usePlus().active
  const [q, setQ] = useState('')
  const [need, setNeed] = useState<Need | null>(parts[0] === 'for' && NEEDS.some((n) => n.id === parts[1]) ? (parts[1] as Need) : null)
  const area = AREAS.find((a) => a.id === parts[0])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s && !need) return null
    return TOOLS.filter((t) => (!need || t.needs.includes(need)) && (!s || `${t.name} ${t.hook} ${t.cat}`.toLowerCase().includes(s)))
  }, [q, need])

  if (area) {
    const tools = TOOLS.filter((t) => area.toolCats.includes(t.cat))
    return (
      <div className={`page explore a-${area.accent}`}>
        <header className="area-head">
          <a className="icon-btn" href="#/explore" aria-label="Back to explore">
            ←
          </a>
          <span className="area-emoji">{area.emoji}</span>
          <div>
            <h1>{area.name}</h1>
            <p className="muted">{area.line}</p>
          </div>
        </header>
        {area.guides.length > 0 && (
          <section className="ex-section">
            <p className="kicker">guides</p>
            <div className="guides">
              {area.guides.map((g) => (
                <GuideCard key={g} path={g} />
              ))}
            </div>
          </section>
        )}
        {tools.length > 0 && (
          <section className="ex-section">
            <p className="kicker">{tools.length} tools</p>
            <div className="tile-grid">
              {tools.map((t) => (
                <Tile key={t.id} t={t} plus={plus} />
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="page explore">
      <header className="ex-head">
        <h1 className="ex-title">explore</h1>
        <input className="hub-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 search anything: sleep, budget, exams…" aria-label="Search" />
        <div className="need-row" role="group" aria-label="I'm feeling">
          {NEEDS.map((n) => (
            <button key={n.id} type="button" className={`need${need === n.id ? ' on' : ''}`} onClick={() => setNeed(need === n.id ? null : n.id)}>
              <span>{n.emoji}</span>
              {n.label}
            </button>
          ))}
        </div>
      </header>

      {results ? (
        <section className="ex-section">
          <p className="kicker">{results.length ? `${results.length} things that help` : 'nothing matched — try another word'}</p>
          <div className="tile-grid">
            {results.map((t) => (
              <Tile key={t.id} t={t} plus={plus} />
            ))}
          </div>
        </section>
      ) : (
        <div className="areas">
          {AREAS.map((a) => (
            <a key={a.id} className={`area a-${a.accent}`} href={`#/explore/${a.id}`}>
              <span className="area-emoji">{a.emoji}</span>
              <b>{a.name}</b>
              <small>{a.line}</small>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
