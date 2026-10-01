import { useEffect, useRef, useState } from 'react'
import { log } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { cardFile, renderCard, templates, type CardContent } from '../lib/shareCard'
import { onToast, type Toast } from '../lib/toast'

// ─── toasts ───────────────────────────────────────────────────
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([])
  useEffect(
    () =>
      onToast((t) => {
        setItems((list) => [...list.slice(-2), t])
        setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), t.tone === 'xp' ? 1800 : 3600)
      }),
    [],
  )
  return (
    <div className="toaster" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone ?? 'info'}`}>
          <span className="toast-icon">{t.icon}</span>
          <span>
            <strong>{t.title}</strong>
            {t.sub && <small>{t.sub}</small>}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── share cards ──────────────────────────────────────────────
type ShareListener = (c: CardContent) => void
const shareListeners = new Set<ShareListener>()

/** Open the story-card maker from anywhere. */
export function shareCard(c: CardContent) {
  shareListeners.forEach((l) => l(c))
}

export function ShareHost() {
  const [content, setContent] = useState<CardContent | null>(null)
  useEffect(() => {
    const l: ShareListener = (c) => setContent(c)
    shareListeners.add(l)
    return () => {
      shareListeners.delete(l)
    }
  }, [])
  if (!content) return null
  return <ShareModal content={content} onClose={() => setContent(null)} />
}

function ShareModal({ content, onClose }: { content: CardContent; onClose: () => void }) {
  const plus = usePlus()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [tpl, setTpl] = useState(templates[0])
  const [mark, setMark] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let alive = true
    setFile(null)
    const el = canvas.current
    if (!el) return
    void renderCard(el, content, tpl, mark || !plus.active).then(async () => {
      // Prepare the file up front so the Share tap can hand it over instantly (keeps the user gesture).
      const f = await cardFile(el)
      if (alive) setFile(f)
    })
    return () => {
      alive = false
    }
  }, [content, tpl, mark, plus.active])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const download = () => {
    if (!file) return
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    setStatus('saved to your downloads ✓')
  }

  const share = async () => {
    if (!file) return
    log('verse', { silent: true })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: 'made on perfucktionist ✶' })
        setStatus('shared ✓')
      } catch {
        // user cancelled
      }
    } else download()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal share-modal" role="dialog" aria-modal="true" aria-label="Make a story card" onClick={(e) => e.stopPropagation()}>
        <div className="share-preview">
          <canvas ref={canvas} aria-label="Story card preview" />
        </div>
        <div className="share-side">
          <div className="row space-between">
            <p className="kicker">story card · 1080×1920</p>
            <button type="button" className="icon-btn ghost" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <h3>Post it. Status it. Send it to the group chat.</h3>
          <div className="row gap-sm wrap" role="group" aria-label="Card style">
            {templates.map((t) => {
              const locked = t.plus && !plus.active
              return (
                <button key={t.id} type="button" className={`chip${tpl.id === t.id ? ' on' : ''}`} onClick={() => (locked ? undefined : setTpl(t))} disabled={locked} title={locked ? 'Plus template' : undefined}>
                  {t.name}
                  {locked && ' 🔒'}
                </button>
              )
            })}
          </div>
          <label className="toggle">
            <input type="checkbox" checked={mark || !plus.active} disabled={!plus.active} onChange={(e) => setMark(e.target.checked)} />
            <span>perfucktionist watermark {!plus.active && '· remove with Plus'}</span>
          </label>
          {!plus.active && (
            <a className="plus-nudge" href="#/plus" onClick={onClose}>
              ✦ 3 more styles + no watermark with <b>Plus</b> →
            </a>
          )}
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-primary a-lime" onClick={share} disabled={!file}>
              {file ? '↗ share' : 'rendering…'}
            </button>
            <button type="button" className="btn" onClick={download} disabled={!file}>
              ↓ save image
            </button>
          </div>
          {status && <p className="muted">{status}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── plus bits ────────────────────────────────────────────────
export function PlusBadge({ small = false }: { small?: boolean }) {
  return <span className={`plus-badge${small ? ' sm' : ''}`}>plus ✦</span>
}

export function PlusWall({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="plus-wall">
      <PlusBadge />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      <a className="btn btn-primary a-violet" href="#/plus">
        try Plus free for 7 days →
      </a>
    </div>
  )
}
