// Shared bits for every shelf: a book cover, a grid, and the in-app reader.
import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, Bookmark, Download, Headphones, Play, X } from 'lucide-react'
import { usePlayer } from '../context/Player'
import { chapters, onShelf, toggleShelf, useShelf, type Book } from '../lib/books'
import { log } from '../lib/progress'
import { WebLink } from './WebView'

export function Cover({ b, size = 'md' }: { b: Book; size?: 'md' | 'sm' }) {
  const [bad, setBad] = useState(false)
  const [ready, setReady] = useState(false)
  // The title sits underneath, so a slow or missing cover never leaves an empty rectangle.
  return (
    <span className={`bk-cover ${size}`}>
      <span className="bk-fallback" aria-hidden="true">
        {b.title}
      </span>
      {b.cover && !bad && <img className={ready ? 'on' : ''} src={b.cover} alt="" loading="lazy" onLoad={() => setReady(true)} onError={() => setBad(true)} />}
    </span>
  )
}

export function BookCard({ b, onOpen }: { b: Book; onOpen: (b: Book) => void }) {
  useShelf()
  const saved = onShelf(b)
  return (
    <article className="bk">
      <button type="button" className="bk-main" onClick={() => onOpen(b)}>
        <Cover b={b} />
        <b>{b.title}</b>
        <small>{b.author}</small>
        <span className="bk-src">
          {b.audio ? <Headphones size={12} /> : <BookOpen size={12} />} {b.source}
          {b.year ? ` · ${b.year}` : ''}
        </span>
      </button>
      <button type="button" className={`bk-save${saved ? ' on' : ''}`} onClick={() => toggleShelf(b)} aria-label={saved ? `Remove ${b.title} from your shelf` : `Save ${b.title} to your shelf`} aria-pressed={saved}>
        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}

export function BookGrid({ books, onOpen }: { books: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="bk-grid">
      {books.map((b) => (
        <BookCard key={b.id} b={b} onOpen={onOpen} />
      ))}
    </div>
  )
}

export function Skeletons({ n = 8 }: { n?: number }) {
  return (
    <div className="bk-grid" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="bk bk-skel">
          <span className="bk-cover md" />
          <span className="bk-line" />
          <span className="bk-line short" />
        </div>
      ))}
    </div>
  )
}

/** Opens a book: scans read inside the app, everything else opens where it lives. Audiobooks go to the player. */
export function BookSheet({ book, onClose }: { book: Book | null; onClose: () => void }) {
  const pl = usePlayer()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  useShelf()

  useEffect(() => {
    if (!book) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.body.classList.add('np-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('np-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [book, onClose])

  if (!book) return null
  const saved = onShelf(book)

  const listen = async () => {
    setLoading(true)
    setErr('')
    try {
      const list = await chapters(book)
      if (!list.length) throw new Error('no audio')
      pl.play(list[0], list)
      pl.setSheet(true)
      log('verse', { silent: true })
      onClose()
    } catch {
      setErr('Couldn’t load the chapters. You can still listen on the Internet Archive.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bk-sheet" role="dialog" aria-modal="true" aria-label={book.title}>
      <header className="bk-sheet-top">
        <button type="button" className="icon-btn ghost" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>
        <span className="kicker">{book.source}</span>
        <button type="button" className={`icon-btn ghost${saved ? ' liked' : ''}`} onClick={() => toggleShelf(book)} aria-label={saved ? 'Remove from shelf' : 'Save to shelf'} aria-pressed={saved}>
          <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </header>

      {book.read ? (
        <iframe className="bk-reader" src={book.read} title={book.title} allowFullScreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
      ) : (
        <div className="bk-sheet-body">
          <Cover b={book} />
          <h2>{book.title}</h2>
          <p className="muted">{book.author}</p>
          {book.audio && (
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={listen} disabled={loading}>
              {loading ? 'loading chapters…' : '▶ listen free'}
            </button>
          )}
          {err && <p className="error-text">{err}</p>}
        </div>
      )}

      <footer className="bk-sheet-foot">
        <b>{book.title}</b>
        <span className="row gap-sm wrap center">
          {book.audio && book.read && (
            <button type="button" className="btn btn-sm" onClick={listen} disabled={loading}>
              <Play size={14} /> listen
            </button>
          )}
          <WebLink className="btn btn-sm" url={book.page} title={book.title}>
            <ArrowUpRight size={14} /> open on {book.source}
          </WebLink>
          {book.download && (
            <WebLink className="btn btn-sm" url={book.download} title={`${book.title} — epub`}>
              <Download size={14} /> epub
            </WebLink>
          )}
        </span>
      </footer>
    </div>
  )
}
