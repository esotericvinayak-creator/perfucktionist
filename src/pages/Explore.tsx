import { useMemo, useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { Icon } from '../components/Icon'
import { PlusBadge } from '../components/Overlays'
import { AREAS, type Area } from '../data/app'
import { zoneByPath } from '../data/zones'
import { usePlus } from '../lib/plus'
import { NEEDS, TOOLS, toolById, type Need, type ToolMeta } from '../tools/registry'

// Long-form guide pages, named for people (not for the codebase).
const GUIDES: Record<string, { icon: string; title: string; blurb: string }> = {
  '/journeys': { icon: 'explore', title: 'Guided journeys', blurb: '5 minutes a day programs' },
  '/library': { icon: 'library', title: 'Sacred library', blurb: 'Gita, Gurbani, Quran, Bible & more' },
  '/read': { icon: 'read', title: 'Read', blurb: 'honest pieces on depression & adversity' },
  '/listen': { icon: 'listen', title: 'Listen', blurb: 'quotes read aloud with music' },
  '/music': { icon: 'listen', title: 'Vibe room', blurb: 'full songs, previews, playlists, lofi radio' },
  '/breathe': { icon: 'calm', title: 'Breathe', blurb: 'guided pranayama & meditation timer' },
  '/unperfect': { icon: 'mind', title: 'Unlearn perfect', blurb: 'quiz, rules & daily imperfection dares' },
  '/happy': { icon: 'bored', title: 'Happy zone', blurb: 'bubble wrap, yeet box, gratitude jar' },
  '/shield': { icon: 'safety', title: 'Shield (for her)', blurb: 'self-defence, SOS tools, your rights' },
  '/bro': { icon: 'people', title: 'Bro code (for him)', blurb: 'respect, feelings, warrior shlokas' },
  '/fam': { icon: 'friends', title: 'No secrets club', blurb: 'talking to your parents' },
  '/brave': { icon: 'goal:confidence', title: 'Be brave', blurb: 'dares, goal smasher, bystander guide' },
  '/green': { icon: 'grow', title: 'Save trees', blurb: 'grow a forest, green pledge' },
  '/faith': { icon: 'faith', title: 'Real faith', blurb: 'spot fake babas, pastors & peers' },
}
const guide = (path: string) => GUIDES[path] ?? (() => {
  const z = zoneByPath(path)
  return z ? { icon: 'explore', title: z.title, blurb: z.blurb } : null
})()

const QUICK = ['panic', 'focus', 'journal', 'sleep-calc', 'expenses', 'safe-walk']
const iconFor = (id: string) => (id === 'focus' ? 'focus-timer' : id)
const needIcon = (id: string) => (id === 'focus' ? 'need:focus' : id === 'money' ? 'need:money' : id)
const toolsIn = (a: Area) => TOOLS.filter((t) => a.toolCats.includes(t.cat))

function Tile({ t, plus }: { t: ToolMeta; plus: boolean }) {
  return (
    <a href={`#/tools/${t.id}`} className={`tile cat-${t.cat}`}>
      <span className="ibub">
        <Icon name={iconFor(t.id)} />
      </span>
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
      <span className="ibub">
        <Icon name={g.icon} />
      </span>
      <span className="grow">
        <b>{g.title}</b>
        <small>{g.blurb}</small>
      </span>
      <ArrowRight size={20} aria-hidden="true" />
    </a>
  )
}

function AreaPage({ area, plus }: { area: Area; plus: boolean }) {
  const tools = toolsIn(area)
  return (
    <div className={`page explore2 a-${area.accent}`}>
      <header className="area-hero">
        <a className="icon-btn" href="#/explore" aria-label="Back to explore">
          ←
        </a>
        <span className="area-hero-icon">
          <Icon name={area.id} size={40} />
        </span>
        <h1>{area.name}</h1>
        <p>{area.line}</p>
        <span className="area-count">
          {tools.length > 0 && `${tools.length} tools`}
          {tools.length > 0 && area.guides.length > 0 && ' · '}
          {area.guides.length > 0 && `${area.guides.length} guide${area.guides.length > 1 ? 's' : ''}`}
        </span>
        <span className="area-watermark" aria-hidden="true">
          <Icon name={area.id} size={180} />
        </span>
      </header>
      {area.guides.length > 0 && (
        <section className="ex-section">
          <p className="kicker">start here</p>
          <div className="guides">
            {area.guides.map((g) => (
              <GuideCard key={g} path={g} />
            ))}
          </div>
        </section>
      )}
      {tools.length > 0 && (
        <section className="ex-section">
          <p className="kicker">tools</p>
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
    const tools = TOOLS.filter((t) => (!need || t.needs.includes(need)) && (!s || `${t.name} ${t.hook} ${t.cat}`.toLowerCase().includes(s)))
    const guides = s ? Object.entries(GUIDES).filter(([, g]) => `${g.title} ${g.blurb}`.toLowerCase().includes(s)).map(([p]) => p) : []
    return { tools, guides }
  }, [q, need])

  if (area) return <AreaPage area={area} plus={plus} />

  return (
    <div className="page explore2">
      <header className="ex-hero">
        <span className="sticker a-lime">
          explore · {TOOLS.length} tools · {AREAS.length} areas
        </span>
        <h1 className="display">
          what do you <span className="serif">need</span> today?
        </h1>
        <label className="ex-search">
          <Search size={20} aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="sleep, budget, exams, breakup…" aria-label="Search" />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </label>
        <div className="need-row" role="group" aria-label="I'm feeling">
          {NEEDS.map((n) => (
            <button key={n.id} type="button" className={`need${need === n.id ? ' on' : ''}`} onClick={() => setNeed(need === n.id ? null : n.id)} aria-pressed={need === n.id}>
              <Icon name={needIcon(n.id)} size={16} />
              {n.label}
            </button>
          ))}
        </div>
      </header>

      {results ? (
        <section className="ex-section">
          <p className="kicker">{results.tools.length + results.guides.length ? `${results.tools.length + results.guides.length} things that help` : 'nothing matched — try another word'}</p>
          {results.guides.length > 0 && (
            <div className="guides">
              {results.guides.map((g) => (
                <GuideCard key={g} path={g} />
              ))}
            </div>
          )}
          <div className="tile-grid">
            {results.tools.map((t) => (
              <Tile key={t.id} t={t} plus={plus} />
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="ex-section">
            <p className="kicker">quick picks</p>
            <div className="quick-row">
              {QUICK.map((id) => {
                const t = toolById(id)!
                return (
                  <a key={id} href={`#/tools/${id}`} className={`quick cat-${t.cat}`}>
                    <span className="ibub">
                      <Icon name={iconFor(id)} />
                    </span>
                    {t.name}
                  </a>
                )
              })}
            </div>
          </section>

          <section className="ex-section">
            <p className="kicker">everything, sorted</p>
            <div className="bento">
              {AREAS.map((a, i) => {
                const n = toolsIn(a).length
                return (
                  <a key={a.id} className={`bento-card a-${a.accent}${i < 2 ? ' wide' : ''}`} href={`#/explore/${a.id}`}>
                    <span className="bento-icon">
                      <Icon name={a.id} size={26} />
                    </span>
                    <b>{a.name}</b>
                    <small>{a.line}</small>
                    <span className="bento-foot">
                      {n > 0 ? `${n} tools` : `${a.guides.length} guide${a.guides.length > 1 ? 's' : ''}`} <ArrowRight size={14} />
                    </span>
                    <span className="bento-mark" aria-hidden="true">
                      <Icon name={a.id} size={110} />
                    </span>
                  </a>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
