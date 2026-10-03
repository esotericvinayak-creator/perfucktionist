// The library: scripture, school, college, exams, free books and free audiobooks.
// One hub, then one screen per shelf — instead of one endless page of cards.
import { ArrowLeft } from 'lucide-react'
import { Icon } from '../components/Icon'
import { BookSheet } from '../components/BookGrid'
import { BookGrid } from '../components/BookGrid'
import { useShelf } from '../lib/books'
import { EXAMS } from '../data/exams'
import { totalQuestions } from '../data/questions'
import { formatIndian, scriptures, totalVerses } from '../lib/scripture'
import { useState } from 'react'
import { Exams } from './library/Exams'
import { Free } from './library/Free'
import { Scripture } from './library/Scripture'
import { College, School } from './library/Study'

type SectionId = 'school' | 'college' | 'exams' | 'faith' | 'read' | 'listen' | 'shelf'

const SECTIONS: { id: SectionId; icon: string; title: string; line: string; accent: string }[] = [
  { id: 'school', icon: 'library', title: 'School', line: 'class 1–12 · every NCERT textbook, free', accent: 'lime' },
  { id: 'college', icon: 'explore', title: 'College', line: 'open textbooks & free university courses', accent: 'cyan' },
  { id: 'exams', icon: 'goal:focus', title: 'Exams', line: `${EXAMS.length} exams + ${totalQuestions} practice questions`, accent: 'violet' },
  { id: 'faith', icon: 'faith', title: 'Scripture', line: `${formatIndian(totalVerses)} verses · every faith`, accent: 'sun' },
  { id: 'read', icon: 'read', title: 'Free books', line: 'millions, free to read — classics to science', accent: 'pink' },
  { id: 'listen', icon: 'listen', title: 'Audiobooks', line: 'free, read aloud by real people', accent: 'orange' },
]

function Hub({ go }: { go: (id: SectionId) => void }) {
  const shelf = useShelf()
  return (
    <>
      <header className="lb-hero">
        <span className="sticker a-sun">the library · all free</span>
        <h1 className="display">
          every book you need. <span className="serif">zero rupees.</span>
        </h1>
        <p className="lede">school textbooks, college material, exam prep, scripture, novels and audiobooks — legally free, no sign-up walls, no pirated PDFs.</p>
      </header>

      <div className="lb-sections">
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" className={`lb-sec a-${s.accent}`} onClick={() => go(s.id)}>
            <span className="ibub">
              <Icon name={s.icon} />
            </span>
            <b>{s.title}</b>
            <small>{s.line}</small>
          </button>
        ))}
      </div>

      {shelf.length > 0 && (
        <button type="button" className="lb-shelf-row" onClick={() => go('shelf')}>
          <span className="lb-shelf-covers" aria-hidden="true">
            {shelf.slice(0, 5).map((b) => (
              <img key={b.id} src={b.cover} alt="" loading="lazy" />
            ))}
          </span>
          <span className="grow">
            <b>your shelf</b>
            <small>{shelf.length} saved</small>
          </span>
          <span className="plan-go">→</span>
        </button>
      )}
    </>
  )
}

function Shelf() {
  const shelf = useShelf()
  const [open, setOpen] = useState<(typeof shelf)[number] | null>(null)
  if (!shelf.length)
    return (
      <p className="lb-empty">
        nothing saved yet. tap the 🔖 on any book and it lands here. <br />
        saved books stay on this phone.
      </p>
    )
  return (
    <>
      <BookGrid books={shelf} onOpen={setOpen} />
      <BookSheet book={open} onClose={() => setOpen(null)} />
    </>
  )
}

const TITLES: Record<SectionId, string> = {
  school: 'School · class 1–12',
  college: 'College & beyond',
  exams: 'Competitive exams',
  faith: 'Scripture',
  read: 'Free books',
  listen: 'Free audiobooks',
  shelf: 'Your shelf',
}

export default function Library() {
  // #/library · #/library/<section> · #/library/<scriptureId>/<key> (old deep links keep working)
  const parts = window.location.hash
    .replace(/^#\/(library|shlokas)\/?/, '')
    .split('/')
    .filter(Boolean)
  const first = parts[0]
  const deepBook = scriptures.find((s) => s.id === first)
  const section = (deepBook ? 'faith' : (first as SectionId)) || null
  const go = (id: SectionId) => {
    window.location.hash = `/library/${id}`
  }

  if (!section || !TITLES[section])
    return (
      <div className="page library2">
        <Hub go={go} />
      </div>
    )

  return (
    <div className="page library2">
      <header className="lb-head">
        <a className="icon-btn" href="#/library" aria-label="Back to the library">
          <ArrowLeft size={20} />
        </a>
        <h1>{TITLES[section]}</h1>
      </header>
      {section === 'school' && <School />}
      {section === 'college' && <College />}
      {section === 'exams' && <Exams />}
      {section === 'faith' && <Scripture deep={deepBook ? { bookId: deepBook.id, key: parts.slice(1).join('/') || undefined } : null} />}
      {section === 'read' && <Free mode="read" />}
      {section === 'listen' && <Free mode="listen" />}
      {section === 'shelf' && <Shelf />}
    </div>
  )
}
