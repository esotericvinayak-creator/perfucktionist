import { useEffect, useMemo, useRef, useState } from 'react'
import { ScriptureReader, type ReaderTarget } from '../components/ScriptureReader'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices, WisdomCard } from '../components/Voices'
import { PageHero, Section } from '../components/ui'
import { shlokas, vibeLabels, type Vibe } from '../data/shlokas'
import { themes, traditions, wisdom, type Theme, type Tradition } from '../data/wisdom'
import type { Accent } from '../data/zones'
import { formatIndian, scriptures, totalVerses } from '../lib/scripture'

const accents: Accent[] = ['sun', 'violet', 'lime', 'pink', 'cyan', 'orange']

// Deep links like #/library/gita/2 open a book at a section.
function fromHash() {
  const [, , id, ...rest] = window.location.hash.replace(/^#/, '').split('/')
  const book = scriptures.find((s) => s.id === id)
  return book ? { book, key: rest.join('/') || undefined } : null
}

export default function Library() {
  const [deep] = useState(fromHash)
  const [book, setBook] = useState(deep?.book ?? scriptures[0])
  const [target, setTarget] = useState<ReaderTarget>({ key: deep?.key, nonce: 0 })
  const readerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (deep) setTimeout(() => readerRef.current?.scrollIntoView({ block: 'start' }), 100)
  }, [deep])
  const [theme, setTheme] = useState<Theme>('courage')
  const [trad, setTrad] = useState<Tradition | 'all'>('all')
  const [vibe, setVibe] = useState<Vibe | 'all'>('all')

  const open = (id: string, random = false) => {
    setBook(scriptures.find((s) => s.id === id) ?? scriptures[0])
    setTarget((t) => ({ verse: random ? 'random' : undefined, nonce: t.nonce + 1 }))
    setTimeout(() => readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }
  const surprise = () => open(scriptures[Math.floor(Math.random() * scriptures.length)].id, true)

  const golden = wisdom.filter((w) => w.themes.includes('golden'))
  const browse = useMemo(() => wisdom.filter((w) => trad === 'all' || w.tradition === trad), [trad])
  const stack = shlokas.filter((s) => vibe === 'all' || s.vibes.includes(vibe))

  return (
    <div className="page">
      <PageHero
        kicker="zone 04 · sacred library · every faith"
        accent="sun"
        emoji="📚"
        title={
          <>
            {formatIndian(totalVerses)} verses. <span className="serif">every faith.</span> one vibe.
          </>
        }
        sub="The Bhagavad Gita, Valmiki Ramayana, Guru Granth Sahib, Quran, Bible and Dhammapada — complete, in the original script with English (and Hindi where we have it). Free forever. Because wisdom was never one religion’s property."
      >
        <div className="row gap wrap">
          <button type="button" className="btn btn-primary a-sun" onClick={surprise}>
            🎲 surprise me — any faith
          </button>
          <button type="button" className="btn" onClick={() => open('gita')}>
            🕉️ start with the Gita
          </button>
        </div>
      </PageHero>

      <Section kicker="the one rule every religion agrees on" title={<>different books. <span className="serif">same rule.</span></>} intro="Before anyone tells you religions are enemies — read this. Eleven traditions, thousands of years apart, all landing on the same idea.">
        <div className="golden-grid">
          {golden.map((w) => (
            <WisdomCard key={w.id} w={w} />
          ))}
        </div>
      </Section>

      <Section kicker="the shelf" title={<>pick a book. <span className="serif">read the whole thing.</span></>}>
        <div className="shelf">
          {scriptures.map((s) => (
            <button key={s.id} type="button" className={`card book a-${s.accent}${book.id === s.id ? ' on' : ''}`} onClick={() => open(s.id)}>
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
      </Section>

      <div ref={readerRef} className="section reader-section">
        <div className="section-head">
          <span className="kicker">
            now reading · {book.emoji} {book.tradition}
          </span>
          <h2>{book.name}</h2>
        </div>
        <ScriptureReader book={book} target={target} />
      </div>

      <Section kicker="same message, every faith" title={<>what do they <span className="serif">all</span> say about…</>}>
        <div className="row gap-sm wrap filter-row" role="group" aria-label="Theme">
          {(Object.keys(themes) as Theme[])
            .filter((t) => t !== 'golden')
            .map((t) => (
              <button key={t} type="button" className={`chip${theme === t ? ' on' : ''}`} onClick={() => setTheme(t)}>
                {themes[t].title}
              </button>
            ))}
        </div>
        <Voices key={theme} theme={theme} />
      </Section>

      <Section kicker={`${browse.length} hand-picked quotes`} title={<>browse by <span className="serif">tradition</span></>}>
        <div className="row gap-sm wrap filter-row" role="group" aria-label="Tradition">
          <button type="button" className={`chip${trad === 'all' ? ' on' : ''}`} onClick={() => setTrad('all')}>
            ✶ all
          </button>
          {(Object.keys(traditions) as Tradition[]).map((t) => (
            <button key={t} type="button" className={`chip${trad === t ? ' on' : ''}`} onClick={() => setTrad(t)}>
              {traditions[t].emoji} {traditions[t].label}
            </button>
          ))}
        </div>
        <div className="shloka-masonry">
          {browse.map((w) => (
            <WisdomCard key={w.id} w={w} />
          ))}
        </div>
      </Section>

      <Section kicker="shloka stack" title={<>Sanskrit gems, <span className="serif">translated</span> for your era</>} intro="Hand-picked shlokas with a Gen Z translation. Tap 🔊 to hear them.">
        <div className="row gap-sm wrap filter-row" role="group" aria-label="Filter shlokas by vibe">
          <button type="button" className={`chip${vibe === 'all' ? ' on' : ''}`} onClick={() => setVibe('all')}>
            ✶ all
          </button>
          {(Object.keys(vibeLabels) as Vibe[]).map((v) => (
            <button key={v} type="button" className={`chip${vibe === v ? ' on' : ''}`} onClick={() => setVibe(v)}>
              {vibeLabels[v]}
            </button>
          ))}
        </div>
        <div className="shloka-masonry">
          {stack.map((s, i) => (
            <ShlokaCard key={s.id} shloka={s} accent={accents[i % accents.length]} />
          ))}
        </div>
      </Section>
    </div>
  )
}
