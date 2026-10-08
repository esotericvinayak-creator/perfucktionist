import { ArrowLeft } from 'lucide-react'
import { streakOf, useProgress } from '../lib/progress'
import { Icon } from './Icon'

export const TABS = [
  { path: '/', icon: 'today', label: 'Today' },
  { path: '/explore', icon: 'discover', label: 'Discover' },
  { path: '/me', icon: 'me', label: 'Me' },
]

/** Which of the 3 tabs a route belongs to. Everything that isn't Today or Me (tools, library, listen, read, guides) lives under Discover. */
export function tabFor(route: string) {
  const base = `/${route.split('/')[1] ?? ''}`
  if (base === '/') return '/'
  if (base === '/me' || base === '/plus') return '/me'
  return '/explore'
}

const ROOTS = ['/', '/explore', '/me']

/** Where "back" goes when there's no history to go back to: one level up the hash route. */
export function parentOf(route: string) {
  const parts = route.split('/').filter(Boolean)
  if (parts.length <= 1) return tabFor(route) === '/' ? null : tabFor(route)
  return '/' + parts.slice(0, -1).join('/')
}

/** Back button for every screen that isn't one of the three tabs. */
export function BackButton({ route, className = '' }: { route: string; className?: string }) {
  if (ROOTS.includes(route)) return null
  const go = () => {
    // Use real history when we have some, so back feels like the phone's own back.
    if (window.history.length > 1) window.history.back()
    else window.location.hash = parentOf(route) ?? '/'
  }
  return (
    <button type="button" className={`back-btn ${className}`.trim()} onClick={go} aria-label="Go back">
      <ArrowLeft size={20} />
      <span className="back-label">back</span>
    </button>
  )
}

export function Logo() {
  return (
    <span className="logo-text">
      per<span className="logo-hl">fuck</span>tionist
    </span>
  )
}

export function Nav({ route, bare = false }: { route: string; bare?: boolean }) {
  const streak = streakOf(useProgress())
  const tab = tabFor(route)
  return (
    <header className="nav">
      <BackButton route={route} className="nav-back" />
      <a href="#/" className="logo" aria-label="perfucktionist — home">
        <Logo />
      </a>
      {!bare && (
        <nav className="nav-tabs" aria-label="Main">
          {TABS.map((t) => (
            <a key={t.path} href={`#${t.path}`} className={tab === t.path ? 'on' : ''} aria-current={tab === t.path ? 'page' : undefined}>
              <Icon name={t.icon} size={16} /> {t.label}
            </a>
          ))}
        </nav>
      )}
      <div className="nav-actions">
        {!bare && (
          <a className={`streak-chip${streak ? ' lit' : ''}`} href="#/me" title="Your streak">
            🔥 <span>{streak}</span>
          </a>
        )}
        <a className="sos-chip" href="tel:112" title="Call 112 — India emergency">
          <span className="sos-dot" aria-hidden="true" />
          <span className="sos-label">SOS </span>112
        </a>
      </div>
    </header>
  )
}
