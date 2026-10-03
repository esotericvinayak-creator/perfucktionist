// School (class 1–12) and college shelves — official free textbooks, nothing pirated.
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { OPEN_LIBRARIES, SCHOOL_EXTRAS, STREAMS, type Link as L } from '../../data/college'
import { SCHOOL, ncertUrl } from '../../data/school'
import { useLocalState } from '../../lib/storage'

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function LinkRow({ l }: { l: L }) {
  return (
    <a className="st-link" href={l.url} target="_blank" rel="noreferrer">
      <span className="grow">
        <b>{l.title}</b>
        <small>{l.by}</small>
      </span>
      <ExternalLink size={16} aria-hidden="true" />
    </a>
  )
}

export function School() {
  const [cls, setCls] = useLocalState('school-class', 10)
  const row = SCHOOL.find((c) => c.cls === cls) ?? SCHOOL[9]
  return (
    <>
      <p className="lb-note">Every NCERT textbook, free, from NCERT’s own site. Pick your class — each book opens on the official page where the chapters are free PDFs.</p>
      <div className="st-classes" role="group" aria-label="Pick your class">
        {SCHOOL.map((c) => (
          <button key={c.cls} type="button" className={`st-class${c.cls === cls ? ' on' : ''}`} onClick={() => setCls(c.cls)} aria-pressed={c.cls === cls}>
            <small>class</small>
            {ROMAN[c.cls]}
          </button>
        ))}
      </div>

      <div className="st-subjects">
        {row.subjects.map((s) => (
          <article key={s.subject} className="st-subject">
            <h3>{s.subject}</h3>
            <div className="st-books">
              {s.en.map((b) => (
                <a key={b.code} className="st-book" href={ncertUrl(b.code)} target="_blank" rel="noreferrer">
                  📘 {b.title}
                </a>
              ))}
              {s.hi.map((b) => (
                <a key={b.code} className="st-book hi" href={ncertUrl(b.code)} target="_blank" rel="noreferrer">
                  📙 {b.title}
                </a>
              ))}
            </div>
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
        <a href="https://www.ncert.nic.in/textbook.php" target="_blank" rel="noreferrer">
          NCERT
        </a>
        . if a link ever 404s, NCERT has reorganised that book — their textbook page always has the current one.
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
