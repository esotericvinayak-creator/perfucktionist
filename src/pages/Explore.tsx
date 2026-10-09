import { useMemo, useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { Icon } from '../components/Icon'
import { PlusBadge } from '../components/Overlays'
import { AREAS, type Area } from '../data/app'
import { priorities } from '../data/profile'
import { zoneByPath } from '../data/zones'
import { usePlus } from '../lib/plus'
import { useProgress } from '../lib/progress'
import { NEEDS, TOOLS, toolById, type Need, type ToolMeta } from '../tools/registry'

// Long-form guide pages, named for people (not for the codebase).
const GUIDES: Record<string, { icon: string; title: string; blurb: string }> = {
  '/journeys': { icon: 'explore', title: 'Guided journeys', blurb: '5 minutes a day programs' },
  '/library': { icon: 'library', title: 'The library', blurb: 'school, college, exams, scripture, free books' },
  '/library/school': { icon: 'library', title: 'School books', blurb: 'every NCERT textbook, class 1–12, free' },
  '/library/college': { icon: 'explore', title: 'College & beyond', blurb: 'open textbooks + free university courses' },
  '/library/exams': { icon: 'goal:focus', title: 'Exam prep', blurb: 'JEE, NEET, UPSC, SSC, banking + practice' },
  '/library/listen': { icon: 'listen', title: 'Audiobooks', blurb: 'free, read aloud by real people' },
  '/library/faith': { icon: 'faith', title: 'Scripture', blurb: 'Gita, Gurbani, Quran, Bible & more' },
  '/read': { icon: 'read', title: 'Read', blurb: 'honest pieces on depression & adversity' },
  '/listen': { icon: 'listen', title: 'Listen', blurb: 'quotes read aloud with music' },
  '/music': { icon: 'listen', title: 'Music search', blurb: 'any song: full tracks, previews, playlists, radio' },
  '/listen/reels': { icon: 'play', title: 'Music reels', blurb: 'songs that play themselves — swipe for the next' },
  '/breathe': { icon: 'calm', title: 'Breathe', blurb: 'guided pranayama & meditation timer' },
  '/unperfect': { icon: 'mind', title: 'Unlearn perfect', blurb: 'quiz, rules & daily imperfection dares' },
  '/shield': { icon: 'safety', title: 'Shield (for her)', blurb: 'self-defence, SOS tools, your rights' },
  '/bro': { icon: 'people', title: 'Bro code (for him)', blurb: 'respect, feelings, warrior shlokas' },
  '/fam': { icon: 'friends', title: 'No secrets club', blurb: 'talking to your parents' },
  '/brave': { icon: 'goal:confidence', title: 'Be brave', blurb: 'dares, goal smasher, bystander guide' },
  '/green': { icon: 'grow', title: 'Save trees', blurb: 'grow a forest, green pledge' },
  '/faith': { icon: 'faith', title: 'Real faith', blurb: 'spot fake babas, pastors & peers' },
}
const guide = (path: string) =>
  GUIDES[path] ??
  (() => {
    const z = zoneByPath(path)
    return z ? { icon: 'explore', title: z.title, blurb: z.blurb } : null
  })()

// The few places most people start from. Everything else is search, a feeling chip or "everything else".
const HUBS: { path: string; icon: string; title: string; line: string; accent: string }[] = [
  { path: '/explore/calm', icon: 'calm', title: 'Feel better', line: 'stress, low days, overthinking', accent: 'violet' },
  { path: '/explore/focus', icon: 'goal:focus', title: 'Study', line: 'NCERT books, exams, focus', accent: 'lime' },
  { path: '/listen', icon: 'listen', title: 'Listen', line: 'quotes and music, hands-free', accent: 'cyan' },
  { path: '/read', icon: 'read', title: 'Read', line: 'honest pieces on hard stuff', accent: 'orange' },
  { path: '/library', icon: 'library', title: 'Books & scripture', line: 'free books, audiobooks, every faith', accent: 'sun' },
]

/** What you'd typed or picked on Discover, for when you come back from a tool. Session only. */
const kept: { q: string; need: Need | null } = { q: '', need: null }

const QUICK = ['panic', 'focus', 'journal', 'sleep-calc', 'expenses', 'safe-walk']
const iconFor = (id: string) => (id === 'focus' ? 'focus-timer' : id)
const needIcon = (id: string) => (id === 'focus' ? 'need:focus' : id === 'money' ? 'need:money' : id)
const toolsIn = (a: Area) => TOOLS.filter((t) => a.toolCats.includes(t.cat) || a.tools?.includes(t.id))

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
  const gender = useProgress().gender
  // Your priorities first (by gender, if you told us), then the usual quick picks.
  const quick = [...new Set([...priorities(gender).tools, ...QUICK])].filter((id) => toolById(id)).slice(0, 6)
  const linked = parts[0] === 'for' && NEEDS.some((n) => n.id === parts[1]) ? (parts[1] as Need) : null
  // Search and the feeling chip survive opening a tool and coming back (see `kept`).
  const [q, setQ] = useState(linked ? '' : kept.q)
  const [need, setNeed] = useState<Need | null>(linked ?? kept.need)
  kept.q = q
  kept.need = need
  const area = AREAS.find((a) => a.id === parts[0])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s && !need) return null
    const tools = TOOLS.filter((t) => (!need || t.needs.includes(need)) && (!s || `${t.name} ${t.hook} ${t.cat}`.toLowerCase().includes(s)))
    const guides = s
      ? Object.entries(GUIDES)
          .filter(([, g]) => `${g.title} ${g.blurb}`.toLowerCase().includes(s))
          .map(([p]) => p)
      : []
    return { tools, guides }
  }, [q, need])

  if (area) return <AreaPage area={area} plus={plus} />

  const spot = priorities(gender).spotlight
  return (
    <div className="page explore2 disc">
      <header className="ex-hero">
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
          <div className="disc-cards">
            {spot && (
              <a className="disc-card first" style={{ ['--a' as string]: 'var(--pink)' }} href={`#${spot.path}`}>
                <span className="ibub">
                  <Icon name={spot.icon} />
                </span>
                <b>{spot.title}</b>
                <small>for you first · {spot.why}</small>
              </a>
            )}
            {HUBS.map((h) => (
              <a key={h.path} className="disc-card" style={{ ['--a' as string]: `var(--${h.accent})` }} href={`#${h.path}`}>
                <span className="ibub" style={{ ['--a' as string]: `var(--${h.accent})` }}>
                  <Icon name={h.icon} />
                </span>
                <b>{h.title}</b>
                <small>{h.line}</small>
              </a>
            ))}
          </div>

          <section className="ex-section">
            <p className="kicker">{gender && priorities(gender).tools.length ? 'quick tools · for you' : 'quick tools'}</p>
            <div className="quick-row">
              {quick.map((id) => {
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

          <details className="disc-more">
            <summary>
              everything else · {TOOLS.length} tools in {AREAS.length} areas
            </summary>
            <div className="disc-links">
              {AREAS.map((a) => (
                <a key={a.id} href={`#/explore/${a.id}`}>
                  {a.name}
                </a>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  )
}
