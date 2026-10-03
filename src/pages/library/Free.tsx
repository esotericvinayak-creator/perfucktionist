// Free books and free audiobooks: search the open web, browse by shelf, read or listen in the app.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { BookGrid, BookSheet, Skeletons } from '../../components/BookGrid'
import { WebLink } from '../../components/WebView'
import { audiobooks, gutenberg, openLibrary, type Book } from '../../lib/books'

type Shelf = { id: string; label: string; q?: string; audio?: string }

const READ_SHELVES: Shelf[] = [
  { id: 'classics', label: '📜 classics', q: 'subject:"fiction classics"' },
  { id: 'indian', label: '🇮🇳 indian writing', q: 'subject:"Indic literature"' },
  { id: 'stories', label: '📚 novels', q: 'subject:fiction' },
  { id: 'kids', label: '🧸 for kids', q: 'subject:"children\'s stories"' },
  { id: 'poetry', label: '🕊️ poetry', q: 'subject:poetry' },
  { id: 'mystery', label: '🔎 mystery', q: 'subject:"detective and mystery stories"' },
  { id: 'scifi', label: '🚀 sci-fi & fantasy', q: 'subject:"science fiction"' },
  { id: 'history', label: '🏛️ history', q: 'subject:history' },
  { id: 'science', label: '🔬 science', q: 'subject:science' },
  { id: 'maths', label: '➗ maths', q: 'subject:mathematics' },
  { id: 'philosophy', label: '💭 philosophy', q: 'subject:philosophy' },
  { id: 'business', label: '💼 business & money', q: 'subject:"business and economics"' },
  { id: 'health', label: '🧠 mind & health', q: 'subject:psychology' },
  { id: 'art', label: '🎨 art & music', q: 'subject:art' },
  { id: 'bio', label: '👤 biography', q: 'subject:biography' },
  { id: 'lang', label: '🗣️ languages', q: 'subject:"language and languages"' },
]

const LISTEN_SHELVES: Shelf[] = [
  { id: 'a-classics', label: '📜 classics', audio: 'subject:(fiction)' },
  { id: 'a-short', label: '⏱️ short reads', audio: 'subject:("short stories")' },
  { id: 'a-kids', label: '🧸 for kids', audio: 'subject:(children)' },
  { id: 'a-mystery', label: '🔎 mystery', audio: 'subject:(detective OR mystery)' },
  { id: 'a-scifi', label: '🚀 sci-fi', audio: 'subject:("science fiction")' },
  { id: 'a-poetry', label: '🕊️ poetry', audio: 'subject:(poetry)' },
  { id: 'a-history', label: '🏛️ history', audio: 'subject:(history)' },
  { id: 'a-philosophy', label: '💭 philosophy', audio: 'subject:(philosophy)' },
  { id: 'a-nonfic', label: '📖 non-fiction', audio: 'subject:(biography OR science)' },
]

export function Free({ mode }: { mode: 'read' | 'listen' }) {
  const shelves = mode === 'read' ? READ_SHELVES : LISTEN_SHELVES
  const [shelf, setShelf] = useState(shelves[0])
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [open, setOpen] = useState<Book | null>(null)
  const req = useRef(0)

  const run = useCallback(
    async (search: string, s: Shelf) => {
      const id = ++req.current
      setState('loading')
      setBooks([])
      try {
        let list: Book[]
        if (mode === 'listen') {
          list = await audiobooks(search ? `title:(${search}) OR creator:(${search})` : (s.audio ?? ''), 36)
        } else if (search) {
          // Gutenberg is tidier for famous titles; Open Library has far more. Try both, Gutenberg first.
          const [pg, ol] = await Promise.allSettled([gutenberg({ search }), openLibrary(search, { limit: 36 })])
          const a = pg.status === 'fulfilled' ? pg.value : []
          const b = ol.status === 'fulfilled' ? ol.value : []
          if (!a.length && !b.length && (pg.status === 'rejected' || ol.status === 'rejected')) throw new Error('both failed')
          const seen = new Set<string>()
          list = [...a, ...b].filter((x) => {
            const k = `${x.title}|${x.author}`.toLowerCase()
            return seen.has(k) ? false : (seen.add(k), true)
          })
        } else {
          list = await openLibrary(s.q ?? '*', { limit: 36, sort: 'readinglog' })
        }
        if (id !== req.current) return
        setBooks(list)
        setState('ready')
      } catch {
        if (id !== req.current) return
        setState('error')
      }
    },
    [mode],
  )

  useEffect(() => {
    void run(term, shelf)
  }, [term, shelf, run])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTerm(q.trim())
  }

  return (
    <>
      <form className="lb-search" onSubmit={submit}>
        <Search size={20} aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={mode === 'read' ? 'search any free book…' : 'search free audiobooks…'} aria-label="Search books" />
        {(q || term) && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setTerm('')
            }}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {!term && (
        <div className="lb-chips" role="group" aria-label="Shelves">
          {shelves.map((s) => (
            <button key={s.id} type="button" className={`chip${shelf.id === s.id ? ' on' : ''}`} onClick={() => setShelf(s)} aria-pressed={shelf.id === s.id}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {state === 'loading' && <Skeletons n={12} />}
      {state === 'error' && (
        <p className="lb-empty">
          couldn’t reach the free book libraries. check your internet —{' '}
          <button type="button" className="linkish" onClick={() => void run(term, shelf)}>
            try again
          </button>
        </p>
      )}
      {state === 'ready' && (books.length ? <BookGrid books={books} onOpen={setOpen} /> : <p className="lb-empty">nothing here. try another word.</p>)}

      <p className="lb-credit">
        {mode === 'read' ? (
          <>
            books from{' '}
            <WebLink className="linkish" url="https://openlibrary.org" title="Open Library">
              Open Library
            </WebLink>{' '}
            (Internet Archive) and{' '}
            <WebLink className="linkish" url="https://www.gutenberg.org" title="Project Gutenberg">
              Project Gutenberg
            </WebLink>
            . only free-to-read editions are shown.
          </>
        ) : (
          <>
            audiobooks read by volunteers at{' '}
            <WebLink className="linkish" url="https://librivox.org" title="LibriVox">
              LibriVox
            </WebLink>
            , hosted by the Internet Archive. all public domain, all free.
          </>
        )}
      </p>

      <BookSheet book={open} onClose={() => setOpen(null)} />
    </>
  )
}
