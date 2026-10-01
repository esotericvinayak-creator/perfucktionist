import { useEffect, useMemo, useRef, useState } from 'react'
import { log } from '../lib/progress'
import { randomKey, type Scripture, type Section, type TocGroup } from '../lib/scripture'
import { useLocalState } from '../lib/storage'
import { shareCard } from './Overlays'
import { CopyButton } from './ui'

export type ReaderTarget = { key?: string; verse?: number | 'random'; nonce: number }

export function ScriptureReader({ book, target }: { book: Scripture; target: ReaderTarget }) {
  const [toc, setToc] = useState<TocGroup[] | null>(null)
  // The selected section is tagged with its book so a book switch never fetches the old book's key.
  const [sel, setSel] = useState<{ book: string; key: string; n: number } | null>(null)
  const key = sel?.book === book.id ? sel.key : null
  const [section, setSection] = useState<Section | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState<number | 'random' | null>(null)
  const [lang, setLang] = useLocalState<'en' | 'hi'>('reader-lang', 'en')
  const [playing, setPlaying] = useState<number | null>(null)
  const [reload, setReload] = useState(0)
  const audio = useRef<HTMLAudioElement | null>(null)
  const top = useRef<HTMLDivElement>(null)
  // Only count it as "read" once you actually navigate — just landing on the page isn't reading.
  const engaged = useRef(false)

  // Book (or an explicit jump) changed → load its table of contents and pick a section.
  useEffect(() => {
    let alive = true
    setToc(null)
    setSection(null)
    setError('')
    book
      .toc()
      .then(async (t) => {
        if (!alive) return
        setToc(t)
        const k = target.key ?? (target.verse === 'random' ? await randomKey(book) : t[0].items[0].key)
        if (!alive) return
        if (target.nonce > 0 || target.key) engaged.current = true
        setFocus(target.verse ?? null)
        setSel((s) => ({ book: book.id, key: k, n: (s?.n ?? 0) + 1 }))
      })
      .catch(() => alive && setError(`Couldn’t reach the ${book.name} library. Check your connection and try again.`))
    return () => {
      alive = false
    }
  }, [book, target])

  // Section changed → fetch verses.
  useEffect(() => {
    if (!sel || sel.book !== book.id) return
    let alive = true
    setLoading(true)
    setError('')
    book
      .load(sel.key)
      .then((s) => {
        if (!alive) return
        setSection(s)
        setLoading(false)
        if (engaged.current) log('verse', { book: book.id, silent: true })
      })
      .catch(() => {
        if (!alive) return
        setLoading(false)
        setError('That section didn’t load. The source might be busy — try again in a moment.')
      })
    return () => {
      alive = false
    }
  }, [book, sel, reload])

  // After a jump, scroll to (and flash) the requested verse.
  const focusN = useMemo(() => {
    if (!section || focus === null) return null
    if (focus === 'random') return section.verses[Math.floor(Math.random() * section.verses.length)]?.n ?? null
    return focus
  }, [section, focus])

  useEffect(() => {
    if (focusN === null) return
    const el = document.getElementById(`v-${focusN}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focusN])

  useEffect(() => () => audio.current?.pause(), [])

  const flat = useMemo(() => toc?.flatMap((g) => g.items) ?? [], [toc])
  const idx = flat.findIndex((i) => i.key === key)
  const group = toc?.find((g) => g.items.some((i) => i.key === key)) ?? toc?.[0]
  const pickKey = (k: string) => {
    engaged.current = true
    pick2(k)
  }
  const pick2 = (k: string) => setSel((s) => ({ book: book.id, key: k, n: (s?.n ?? 0) + 1 }))
  const go = (k: string) => {
    setFocus(null)
    pickKey(k)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const play = (n: number, src: string) => {
    if (playing === n) {
      audio.current?.pause()
      setPlaying(null)
      return
    }
    audio.current?.pause()
    const a = new Audio(src)
    audio.current = a
    a.onended = () => setPlaying(null)
    a.play().catch(() => setPlaying(null))
    setPlaying(n)
    log('verse', { book: book.id })
  }

  const useHindi = lang === 'hi' && book.hasHindi

  return (
    <div className={`reader a-${book.accent}`} ref={top}>
      <div className="reader-bar">
        {toc && toc.length > 1 && (
          <select aria-label="Part" value={group?.label} onChange={(e) => go(toc.find((g) => g.label === e.target.value)!.items[0].key)}>
            {toc.map((g) => (
              <option key={g.label}>{g.label}</option>
            ))}
          </select>
        )}
        {group && (
          <select aria-label="Section" value={key ?? ''} onChange={(e) => go(e.target.value)}>
            {group.items.map((i) => (
              <option key={i.key} value={i.key}>
                {i.label}
              </option>
            ))}
          </select>
        )}
        <div className="row gap-sm reader-actions">
          <button type="button" className="btn btn-sm" disabled={idx <= 0} onClick={() => go(flat[idx - 1].key)} aria-label="Previous section">
            ←
          </button>
          <button type="button" className="btn btn-sm" disabled={idx < 0 || idx >= flat.length - 1} onClick={() => go(flat[idx + 1].key)} aria-label="Next section">
            →
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={async () => {
              const k = await randomKey(book)
              setFocus('random')
              pickKey(k)
            }}
          >
            🎲 random
          </button>
          {book.hasHindi && (
            <div className="lang-toggle" role="group" aria-label="Translation language">
              <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'hi' ? 'on' : ''} onClick={() => setLang('hi')}>
                हिं
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="callout a-pink">
          <span className="callout-icon">⚠️</span>
          <div>
            {error}{' '}
            <button type="button" className="btn btn-sm" onClick={() => setReload((r) => r + 1)}>
              retry
            </button>
          </div>
        </div>
      )}

      {section && (
        <header className="reader-head">
          <h3>{section.title}</h3>
          {section.subtitle && <p>{section.subtitle}</p>}
        </header>
      )}

      {loading && !section && <div className="verse skeleton" style={{ height: 220 }} />}

      <div className={`verses${loading ? ' dim' : ''}`}>
        {section?.verses.map((v) => {
          const translation = (useHindi && v.hi) || v.en
          return (
            <article key={v.n} id={`v-${v.n}`} className={`verse${focusN === v.n ? ' flash' : ''}`}>
              <span className="verse-label">{v.label}</span>
              {v.original && (
                <p className={`orig lang-${v.lang}`} lang={v.lang} dir={v.rtl ? 'rtl' : undefined}>
                  {v.original}
                </p>
              )}
              {useHindi && v.romanHi ? (
                <p className="roman" lang="hi">
                  {v.romanHi}
                </p>
              ) : (
                v.roman && <p className="roman">{v.roman}</p>
              )}
              {translation && <p className="verse-text">{translation}</p>}
              <div className="row gap-sm verse-actions">
                {v.audio && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => play(v.n, v.audio!)}>
                    {playing === v.n ? '■ stop' : '🔊 recitation'}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => shareCard({ kicker: `${book.emoji} ${v.cite}`, original: v.original, lang: v.lang, rtl: v.rtl, text: translation })}
                >
                  ↗ story
                </button>
                <CopyButton text={`${v.original ? `${v.original}\n\n` : ''}${translation}\n— ${v.cite}`} />
              </div>
            </article>
          )
        })}
      </div>

      {section && (
        <div className="reader-foot">
          <button type="button" className="btn" disabled={idx <= 0} onClick={() => go(flat[idx - 1].key)}>
            ← previous
          </button>
          <button type="button" className="btn btn-primary" disabled={idx < 0 || idx >= flat.length - 1} onClick={() => go(flat[idx + 1].key)}>
            next →
          </button>
        </div>
      )}
      <p className="credit">
        Source:{' '}
        <a href={book.credit.href} target="_blank" rel="noreferrer">
          {book.credit.text}
        </a>
      </p>
    </div>
  )
}
