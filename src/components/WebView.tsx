// Everything opens here, inside the app — never a surprise new tab.
//
// Some sites (UPSC, the banks, the exam boards) send an X-Frame-Options or frame-ancestors
// header that forbids being shown inside another site. We can't and shouldn't work around
// that, so for those we show an honest card instead, and leaving is the user's own choice.
import { useEffect, useRef, useState, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ExternalLink, FileText, RotateCw, ShieldAlert, X } from 'lucide-react'

type Target = { url: string; title: string; note?: string } | null

let current: Target = null
// True while the viewer owns a history entry, so the phone's back gesture closes it.
let pushed = false
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Open any link inside the app. */
export function openWeb(url: string, title: string, note?: string) {
  current = { url, title, note }
  if (!pushed) {
    history.pushState({ wv: true }, '')
    pushed = true
  }
  emit()
}

/** Close the viewer. Going back in history does the same thing. */
export function closeWeb() {
  if (pushed) {
    pushed = false
    history.back()
  }
  current = null
  emit()
}
const useTarget = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )

// Hosts that send X-Frame-Options or frame-ancestors, so they refuse to be shown inside
// another site. Checked with a GET carrying iframe fetch headers on 2026-10-03.
const NO_FRAME = [
  'ncert.nic.in',
  'upsc.gov.in',
  'swayam.gov.in',
  'jeemain.nta.nic.in',
  'neet.nta.nic.in',
  'cuet.nta.nic.in',
  'ctet.nic.in',
  'nta.ac.in',
  'gate2026.iitg.ac.in',
  'gate.nptel.ac.in',
  'nbe.edu.in',
  'ibps.in',
  'sbi.co.in',
  'rbi.org.in',
  'cdac.in',
  'indianairforce.nic.in',
  'rrbapply.gov.in',
  'collegeboard.org',
  'ets.org',
  'ielts.org',
  'ieltsidpindia.com',
  'diksha.gov.in',
  'storyweaver.org.in',
  'libretexts.org',
  'open.umn.edu',
  'ndl.iitkgp.ac.in',
  'joinindianarmy.nic.in',
  'apple.com',
  'spotify.com',
  'youtube.com',
  'jiosaavn.com',
  'audius.co',
]

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
const blocked = (url: string) => {
  const h = hostOf(url)
  return NO_FRAME.some((n) => h === n || h.endsWith('.' + n))
}
const isPdf = (url: string) => /\.pdf(\?|#|$)/i.test(url)

export function WebView() {
  const target = useTarget()
  const [state, setState] = useState<'loading' | 'ok' | 'refused'>('loading')
  const [nonce, setNonce] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!target) return
    setState(blocked(target.url) ? 'refused' : 'loading')
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeWeb()
    // Back gesture / back button closes the viewer instead of leaving the page.
    const onPop = () => {
      pushed = false
      current = null
      emit()
    }
    document.body.classList.add('np-open')
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    return () => {
      document.body.classList.remove('np-open')
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      window.clearTimeout(timer.current)
    }
  }, [target, nonce])

  // A frame that never fires `load` is almost always one the site refused to render.
  useEffect(() => {
    if (!target || state !== 'loading') return
    timer.current = window.setTimeout(() => setState((s) => (s === 'loading' ? 'refused' : s)), 9000)
    return () => window.clearTimeout(timer.current)
  }, [target, state, nonce])

  if (!target) return null
  const host = hostOf(target.url)

  return (
    <div className="wv" role="dialog" aria-modal="true" aria-label={target.title}>
      <header className="wv-top">
        <button type="button" className="icon-btn ghost" onClick={closeWeb} aria-label="Close">
          <X size={22} />
        </button>
        <span className="wv-title">
          <b>{target.title}</b>
          <small>{host}</small>
        </span>
        <button
          type="button"
          className="icon-btn ghost"
          onClick={() => {
            setNonce(nonce + 1)
            setState(blocked(target.url) ? 'refused' : 'loading')
          }}
          aria-label="Reload"
        >
          <RotateCw size={18} />
        </button>
      </header>

      {state === 'refused' ? (
        <div className="wv-refused">
          <span className="ibub big">{isPdf(target.url) ? <FileText size={28} /> : <ShieldAlert size={28} />}</span>
          <h2>{target.title}</h2>
          {isPdf(target.url) ? (
            <p className="muted">
              This is a PDF on <b>{host}</b>. They don’t allow it to be shown inside another site, so it opens in your own PDF reader — where you can save it and read it offline.
            </p>
          ) : (
            <p className="muted">
              <b>{host}</b> doesn’t allow its pages to be shown inside another site — that’s their security setting, and we won’t try to get around it.
            </p>
          )}
          {target.note && <p className="muted">{target.note}</p>}
          <a className="btn btn-primary a-lime big-cta" href={target.url} target="_blank" rel="noreferrer" onClick={closeWeb}>
            {isPdf(target.url) ? 'open the PDF' : `open ${host}`} <ExternalLink size={16} />
          </a>
          <button type="button" className="linkish muted" onClick={closeWeb}>
            stay here instead
          </button>
        </div>
      ) : (
        <>
          {state === 'loading' && (
            <div className="wv-loading" aria-live="polite">
              <span className="wv-spin" aria-hidden="true" />
              opening {host}…
            </div>
          )}
          <iframe
            key={nonce}
            className="wv-frame"
            src={target.url}
            title={target.title}
            onLoad={() => window.setTimeout(() => setState('ok'), 700)}
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
          />
        </>
      )}
    </div>
  )
}

/** A link that opens inside the app. Use this instead of `<a target="_blank">`. */
export function WebLink({
  url,
  title,
  note,
  className,
  children,
  ...rest
}: { url: string; title: string; note?: string; className?: string; children: ReactNode } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'>) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault()
        openWeb(url, title, note)
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
