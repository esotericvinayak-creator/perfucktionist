// Scripture: the six full books, plus quotes by theme and tradition. One screen, four tabs — no endless scroll.
import { useMemo, useRef, useState } from 'react'
import { ScriptureReader, type ReaderTarget } from '../../components/ScriptureReader'
import { ShlokaCard } from '../../components/ShlokaCard'
import { Voices, WisdomCard } from '../../components/Voices'
import { FAITHS } from '../../data/profile'
import { shlokas, vibeLabels, type Vibe } from '../../data/shlokas'
import { themes, traditions, wisdom, type Theme, type Tradition } from '../../data/wisdom'
import type { Accent } from '../../data/zones'
import { update, useProgress } from '../../lib/progress'
import { formatIndian, scriptures, totalVerses } from '../../lib/scripture'
import { faithById } from '../../data/profile'

const accents: Accent[] = ['sun', 'violet', 'lime', 'pink', 'cyan', 'orange']
const TABS = [
  { id: 'books', label: 'the books' },
  { id: 'golden', label: 'one rule' },
  { id: 'themes', label: 'by theme' },
  { id: 'shlokas', label: 'shlokas' },
] as const
type Tab = (typeof TABS)[number]['id']

const bookOf = (faithId?: string) => {
  const b = faithById(faithId)?.book
  return b ? { book: scriptures.find((s) => s.id === b.id) ?? scriptures[0], key: b.key } : null
}
const tradOf = (faithId?: string): Tradition | 'all' => {
  const t = faithById(faithId)?.traditions
  return t && t !== 'all' ? t[0] : 'all'
}

/** `deep` comes from #/library/<book>/<key> — it opens that book straight away. */
export function Scripture({ deep }: { deep: { bookId: string; key?: string } | null }) {
  const p = useProgress()
  const [start] = useState(() => (deep ? { book: scriptures.find((s) => s.id === deep.bookId) ?? scriptures[0], key: deep.key } : bookOf(p.faith)))
  const [tab, setTab] = useState<Tab>('books')
  const [book, setBook] = useState(start?.book ?? scriptures[0])
  const [target, setTarget] = useState<ReaderTarget>({ key: start?.key, nonce: 0 })
  const [theme, setTheme] = useState<Theme>('courage')
  const [trad, setTrad] = useState<Tradition | 'all'>(() => tradOf(p.faith))
  const [vibe, setVibe] = useState<Vibe | 'all'>('all')
  const readerRef = useRef<HTMLDivElement>(null)

  const open = (id: string, random = false, key?: string) => {
    setBook(scriptures.find((s) => s.id === id) ?? scriptures[0])
    setTarget((t) => ({ key, verse: random ? 'random' : undefined, nonce: t.nonce + 1 }))
    setTab('books')
    setTimeout(() => readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const surprise = () => open(scriptures[Math.floor(Math.random() * scriptures.length)].id, true)
  const pickFaith = (id: string) => {
    const next = p.faith === id ? undefined : id
    update(() => ({ faith: next }))
    setTrad(tradOf(next))
    const b = bookOf(next)
    if (b) open(b.book.id, false, b.key)
  }

  const mine = bookOf(p.faith)?.book
  const shelf = mine ? [mine, ...scriptures.filter((s) => s.id !== mine.id)] : scriptures
  const golden = wisdom.filter((w) => w.themes.includes('golden'))
  const browse = useMemo(() => wisdom.filter((w) => trad === 'all' || w.tradition === trad), [trad])
  const stack = shlokas.filter((s) => vibe === 'all' || s.vibes.includes(vibe))

  return (
    <>
      <div className="lb-sub">
        <p>
          <b>{formatIndian(totalVerses)} verses</b> from 6 complete scriptures, in the original script with English (and Hindi where we have it). Free forever — wisdom was never one religion’s property.
        </p>
        <div className="row gap-sm wrap">
          <button type="button" className="btn btn-sm btn-primary a-sun" onClick={surprise}>
            🎲 surprise me — any faith
          </button>
          {mine && (
            <button type="button" className="btn btn-sm" onClick={() => open(mine.id, false, bookOf(p.faith)?.key)}>
              {mine.emoji} open the {mine.name}
            </button>
          )}
        </div>
      </div>

      <div className="lb-chips" role="group" aria-label="Your faith">
        <span className="lb-chips-label">your faith:</span>
        {FAITHS.map((f) => (
          <button key={f.id} type="button" className={`chip${p.faith === f.id ? ' on' : ''}`} onClick={() => pickFaith(f.id)} aria-pressed={p.faith === f.id}>
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      <div className="lb-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'books' && (
        <>
          <div className="shelf">
            {shelf.map((s) => (
              <button key={s.id} type="button" className={`card book a-${s.accent}${book.id === s.id ? ' on' : ''}`} onClick={() => open(s.id)}>
                {mine?.id === s.id && <span className="book-yours">your faith</span>}
                <span className="book-emoji" aria-hidden="true">
                  {s.emoji}
                </span>
                <span className="book-trad">{s.tradition}</span>
                <h3>{s.name}</h3>
                <p>{s.blurb}</p>
                <span className="book-count">
                  <b>{formatIndian(s.total)}</b> {s.unit}
                </span>
                <span className="book-langs">{s.langs}</span>
              </button>
            ))}
          </div>
          <div ref={readerRef} className="reader-section">
            <p className="kicker">
              now reading · {book.emoji} {book.tradition}
            </p>
            <h2 className="lb-h2">{book.name}</h2>
            <ScriptureReader book={book} target={target} />
          </div>
        </>
      )}

      {tab === 'golden' && (
        <>
          <p className="lb-note">Eleven traditions, thousands of years apart, all landing on the same idea. Before anyone tells you religions are enemies — read this.</p>
          <div className="golden-grid">
            {golden.map((w) => (
              <WisdomCard key={w.id} w={w} />
            ))}
          </div>
        </>
      )}

      {tab === 'themes' && (
        <>
          <div className="lb-chips" role="group" aria-label="Theme">
            {(Object.keys(themes) as Theme[])
              .filter((t) => t !== 'golden')
              .map((t) => (
                <button key={t} type="button" className={`chip${theme === t ? ' on' : ''}`} onClick={() => setTheme(t)} aria-pressed={theme === t}>
                  {themes[t].title}
                </button>
              ))}
          </div>
          <Voices key={theme} theme={theme} />
          <div className="lb-chips" role="group" aria-label="Tradition">
            <span className="lb-chips-label">or by tradition:</span>
            <button type="button" className={`chip${trad === 'all' ? ' on' : ''}`} onClick={() => setTrad('all')}>
              ✶ all
            </button>
            {(Object.keys(traditions) as Tradition[]).map((t) => (
              <button key={t} type="button" className={`chip${trad === t ? ' on' : ''}`} onClick={() => setTrad(t)} aria-pressed={trad === t}>
                {traditions[t].emoji} {traditions[t].label}
              </button>
            ))}
          </div>
          <div className="shloka-masonry">
            {browse.map((w) => (
              <WisdomCard key={w.id} w={w} />
            ))}
          </div>
        </>
      )}

      {tab === 'shlokas' && (
        <>
          <p className="lb-note">Hand-picked Sanskrit shlokas with a Gen Z translation. Tap 🔊 to hear them.</p>
          <div className="lb-chips" role="group" aria-label="Filter shlokas by vibe">
            <button type="button" className={`chip${vibe === 'all' ? ' on' : ''}`} onClick={() => setVibe('all')}>
              ✶ all
            </button>
            {(Object.keys(vibeLabels) as Vibe[]).map((v) => (
              <button key={v} type="button" className={`chip${vibe === v ? ' on' : ''}`} onClick={() => setVibe(v)} aria-pressed={vibe === v}>
                {vibeLabels[v]}
              </button>
            ))}
          </div>
          <div className="shloka-masonry">
            {stack.map((s, i) => (
              <ShlokaCard key={s.id} shloka={s} accent={accents[i % accents.length]} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
