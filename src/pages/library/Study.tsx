// School (class 1–12) and college shelves — official free textbooks, nothing pirated.
import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { WebLink } from '../../components/WebView'
import { OPEN_LIBRARIES, SCHOOL_EXTRAS, STREAMS, type Link as L } from '../../data/college'
import { SCHOOL, chapterCount, ncertChapters, ncertUrl, totalSchoolBooks } from '../../data/school'
import { useLocalState } from '../../lib/storage'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function LinkRow({ l }: { l: L }) {
  return (
    <WebLink className="st-link" url={l.url} title={l.title}>
      <span className="grow">
        <b>{l.title}</b>
        <small>{l.by}</small>
      </span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </WebLink>
  )
}

export function School() {
  const [cls, setCls] = useLocalState('school-class', 10)
  const [lang, setLang] = useLocalState('school-lang', 'English')
  const [open, setOpen] = useState('')
  const row = SCHOOL.find((c) => c.cls === cls) ?? SCHOOL[9]
  // Every language NCERT prints this class in, English first.
  const langs = [...new Set(row.subjects.flatMap((s) => s.langs.map((l) => l.lang)))].sort((a, b) => {
    const order = ['English', 'Hindi', 'Urdu', 'Sanskrit']
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b)
  })
  const pick = langs.includes(lang) ? lang : langs[0]
  const subjects = row.subjects.map((s) => ({ subject: s.subject, books: s.langs.find((l) => l.lang === pick)?.books ?? [] })).filter((s) => s.books.length)
  const count = subjects.reduce((n, s) => n + s.books.length, 0)

  return (
    <>
      <p className="lb-note">All {totalSchoolBooks} NCERT textbooks, free, straight from NCERT. Pick your class and language — then tap a book to see its chapters — each one is a free PDF.</p>
      <div className="st-classes" role="group" aria-label="Pick your class">
        {SCHOOL.map((c) => (
          <button key={c.cls} type="button" className={`st-class${c.cls === cls ? ' on' : ''}`} onClick={() => setCls(c.cls)} aria-pressed={c.cls === cls}>
            <small>class</small>
            {ROMAN[c.cls]}
          </button>
        ))}
      </div>

      <div className="lb-chips" role="group" aria-label="Pick a language">
        <span className="lb-chips-label">language:</span>
        {langs.map((l) => (
          <button key={l} type="button" className={`chip${pick === l ? ' on' : ''}`} onClick={() => setLang(l)} aria-pressed={pick === l}>
            {l}
          </button>
        ))}
      </div>

      <p className="st-count">
        class {ROMAN[cls]} · {pick} · {count} book{count === 1 ? '' : 's'}
      </p>

      <div className="st-subjects">
        {subjects.map((s) => (
          <article key={s.subject} className="st-subject">
            <h3>{s.subject}</h3>
            <div className="st-books">
              {s.books.map((b) => (
                <button key={b.c} type="button" className={`st-book${open === b.c ? ' on' : ''}`} onClick={() => setOpen(open === b.c ? '' : b.c)} aria-expanded={open === b.c}>
                  📘 {b.t}
                  <small>{chapterCount(b.c)} ch</small>
                </button>
              ))}
            </div>
            {s.books
              .filter((b) => b.c === open)
              .map((b) => (
                <div key={b.c} className="st-chapters">
                  <p className="kicker">{b.t} · free chapters</p>
                  <div className="st-chapter-grid">
                    {ncertChapters(b.c).map((ch) => (
                      <WebLink key={ch.url} className="st-chapter" url={ch.url} title={`${b.t} — ${ch.label}`} note="This is NCERT’s own free PDF of the chapter.">
                        {ch.label}
                      </WebLink>
                    ))}
                  </div>
                  <WebLink className="linkish st-allch" url={ncertUrl(b.c)} title={`${b.t} on NCERT`}>
                    see this book on ncert.nic.in →
                  </WebLink>
                </div>
              ))}
          </article>
        ))}
      </div>

      <h3 className="st-h">more free school stuff</h3>
      <div className="st-links">
        {SCHOOL_EXTRAS.map((l) => (
          <LinkRow key={l.url} l={l} />
        ))}
      </div>
      <p className="lb-credit">
        textbooks from{' '}
        <WebLink className="linkish" url="https://www.ncert.nic.in/textbook.php" title="NCERT textbooks">
          NCERT
        </WebLink>
        . if a book ever moves, NCERT’s textbook page always has the current one.
      </p>
    </>
  )
}

export function College() {
  const [open, setOpen] = useState(STREAMS[0].id)
  return (
    <>
      <p className="lb-note">Openly licensed college textbooks and real university courses — free to read, free to keep. Pick your stream.</p>
      <div className="st-streams">
        {STREAMS.map((s) => {
          const on = open === s.id
          return (
            <section key={s.id} className={`st-stream a-${s.accent}${on ? ' on' : ''}`}>
              <button type="button" className="st-stream-top" onClick={() => setOpen(on ? '' : s.id)} aria-expanded={on}>
                <span className="st-emoji">{s.emoji}</span>
                <b>{s.label}</b>
                <small>
                  {s.books.length} books · {s.courses.length} course sets
                </small>
                <span className="st-chev">{on ? '–' : '+'}</span>
              </button>
              {on && (
                <div className="st-stream-body">
                  <p className="kicker">free textbooks</p>
                  <div className="st-links">
                    {s.books.map((l) => (
                      <LinkRow key={l.url} l={l} />
                    ))}
                  </div>
                  <p className="kicker">free courses</p>
                  <div className="st-links">
                    {s.courses.map((l) => (
                      <LinkRow key={l.url} l={l} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      <h3 className="st-h">the big free libraries</h3>
      <div className="st-links">
        {OPEN_LIBRARIES.map((l) => (
          <LinkRow key={l.url} l={l} />
        ))}
      </div>
    </>
  )
}
