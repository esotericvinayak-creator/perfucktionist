// Free books and audiobooks from the open web.
// - Open Library / Internet Archive: millions of scanned books; we only show editions marked free to read (public).
// - Project Gutenberg (via Gutendex): 75,000+ public-domain ebooks. Gutendex is a volunteer API, so it's best-effort.
// - LibriVox (hosted on Internet Archive): public-domain audiobooks read by volunteers.
import { useSyncExternalStore } from 'react'
import type { Track } from '../context/Player'

export type Book = {
  id: string
  title: string
  author: string
  year?: number
  cover?: string
  source: 'Open Library' | 'Project Gutenberg' | 'LibriVox'
  /** Read inside the app (an embeddable page), or open elsewhere. */
  read?: string
  page: string
  /** LibriVox / Internet Archive identifier for audiobooks. */
  audio?: string
  download?: string
}

const OL = 'https://openlibrary.org/search.json'
const IA = 'https://archive.org'

const withTimeout = async (url: string, ms = 12000) => {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

type OLDoc = {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
  editions?: { docs: { key: string; title?: string; ia?: string[]; ebook_access?: string }[] }
}

/**
 * Free-to-read books from Open Library. `query` uses Open Library's search syntax,
 * e.g. 'physics' or 'subject:poetry'. Only editions with a public scan are returned.
 */
export async function openLibrary(query: string, opts: { limit?: number; sort?: 'readinglog' | 'new' | 'old'; lang?: string } = {}): Promise<Book[]> {
  const q = `${query} AND ebook_access:public${opts.lang ? ` AND language:${opts.lang}` : ''}`
  const params = new URLSearchParams({
    q,
    limit: String(opts.limit ?? 30),
    fields: 'key,title,author_name,cover_i,first_publish_year,editions,editions.key,editions.title,editions.ia,editions.ebook_access',
  })
  if (opts.sort) params.set('sort', opts.sort)
  const data = (await withTimeout(`${OL}?${params}`)) as { docs: OLDoc[] }
  return data.docs.flatMap((d) => {
    const ed = d.editions?.docs.find((e) => e.ebook_access === 'public' && e.ia?.length)
    // Skip scans whose rights are unclear (Digital Library of India uploads) and anything without a public scan.
    const ia = ed?.ia?.find((i) => !i.startsWith('in.ernet.dli'))
    if (!ed || !ia) return []
    return [
      {
        id: `ol-${ia}`,
        title: ed.title || d.title,
        author: d.author_name?.[0] ?? 'Unknown',
        year: d.first_publish_year,
        cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : `${IA}/services/img/${ia}`,
        source: 'Open Library' as const,
        read: `${IA}/embed/${ia}`,
        page: `https://openlibrary.org${ed.key}`,
      },
    ]
  })
}

type GutBook = { id: number; title: string; authors: { name: string }[]; formats: Record<string, string> }

/** Project Gutenberg via Gutendex. Throws if the volunteer API is down — callers fall back to Open Library. */
export async function gutenberg(params: { search?: string; topic?: string; lang?: string }): Promise<Book[]> {
  const p = new URLSearchParams({ languages: params.lang ?? 'en' })
  if (params.search) p.set('search', params.search)
  if (params.topic) p.set('topic', params.topic)
  const data = (await withTimeout(`https://gutendex.com/books/?${p}`, 7000)) as { results: GutBook[] }
  return data.results.map((b) => {
    const name = b.authors[0]?.name ?? 'Unknown'
    // Gutenberg lists authors as "Austen, Jane" — flip it for humans.
    const author = name.includes(', ') ? name.split(', ').reverse().join(' ') : name
    return {
      id: `pg-${b.id}`,
      title: b.title,
      author,
      cover: b.formats['image/jpeg'],
      source: 'Project Gutenberg' as const,
      read: `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}-images.html`,
      page: `https://www.gutenberg.org/ebooks/${b.id}`,
      download: b.formats['application/epub+zip'],
    }
  })
}

type IADoc = { identifier: string; title: string; creator?: string | string[]; downloads?: number }

/** LibriVox audiobooks (public domain, read by volunteers), most-listened first. */
export async function audiobooks(query: string, rows = 30): Promise<Book[]> {
  const q = `collection:librivoxaudio${query ? ` AND (${query})` : ''}`
  const params = new URLSearchParams({ q, rows: String(rows), output: 'json', 'sort[]': 'downloads desc' })
  for (const f of ['identifier', 'title', 'creator', 'downloads']) params.append('fl[]', f)
  const data = (await withTimeout(`${IA}/advancedsearch.php?${params}`)) as { response: { docs: IADoc[] } }
  return data.response.docs.map((d) => ({
    id: `lv-${d.identifier}`,
    title: d.title.replace(/\s*\((version \d+|dramatic reading)\)\s*$/i, ''),
    author: (Array.isArray(d.creator) ? d.creator[0] : d.creator) ?? 'Unknown',
    cover: `${IA}/services/img/${d.identifier}`,
    source: 'LibriVox' as const,
    page: `${IA}/details/${d.identifier}`,
    audio: d.identifier,
  }))
}

type IAFile = { name: string; format?: string; title?: string; length?: string }

/** The chapters of a LibriVox audiobook, ready for the player (they auto-advance like an album). */
export async function chapters(book: Book): Promise<Track[]> {
  if (!book.audio) return []
  const data = (await withTimeout(`${IA}/metadata/${book.audio}/files`)) as { result: IAFile[] }
  const mp3 = data.result.filter((f) => f.format === '64Kbps MP3')
  const files = (mp3.length ? mp3 : data.result.filter((f) => f.name.endsWith('.mp3'))).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  return files.map((f, i) => ({
    id: `${book.id}-${i}`,
    title: f.title?.trim() || `Chapter ${i + 1}`,
    artist: `${book.title} · ${book.author}`,
    album: book.title,
    art: book.cover ?? '',
    src: `${IA}/download/${book.audio}/${encodeURIComponent(f.name)}`,
    kind: 'full' as const,
    link: book.page,
    source: 'LibriVox' as const,
  }))
}

// ─── your shelf (saved books, on this device) ─────────────────
const KEY = 'pf:shelf'
let shelf: Book[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Book[]
  } catch {
    return []
  }
})()
const listeners = new Set<() => void>()
function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(shelf))
  } catch {
    // storage blocked: keep it for this visit
  }
  listeners.forEach((l) => l())
}
export const useShelf = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => shelf,
  )
export const onShelf = (b: Book) => shelf.some((x) => x.id === b.id)
export function toggleShelf(b: Book) {
  shelf = onShelf(b) ? shelf.filter((x) => x.id !== b.id) : [b, ...shelf].slice(0, 200)
  emit()
}
