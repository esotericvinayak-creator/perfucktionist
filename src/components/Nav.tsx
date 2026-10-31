import { ArrowLeft } from 'lucide-react'
import { Icon } from './Icon'

export const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/scam', icon: 'scam', label: 'Scam Check' },
  { path: '/back', icon: 'back', label: 'Get It Back' },
  { path: '/leak', icon: 'leak', label: 'Leak Check' },
]

/** Which tab a route belongs to. Screens that aren't a tab (Me, the pass, the app download) have none. */
export function tabFor(route: string) {
  const base = `/${route.split(/[/?]/)[1] ?? ''}`
  return TABS.some((t) => t.path === base) ? base : ''
}

const ROOTS = TABS.map((t) => t.path)

/** Back button for every screen that isn't one of the tabs. */
export function BackButton({ route, className = '' }: { route: string; className?: string }) {
  if (ROOTS.includes(route)) return null
  const go = () => {
    // Use real history when we have some, so back feels like the phone's own back.
    if (window.history.length > 1) window.history.back()
    else window.location.hash = '/'
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
      perfect<span className="logo-hl">ish</span>
    </span>
  )
}

export function Nav({ route }: { route: string }) {
  const tab = tabFor(route)
  return (
    <header className="nav">
      <BackButton route={route} className="nav-back" />
      <a href="#/" className="logo" aria-label="perfectish — home">
        <Logo />
      </a>
      <nav className="nav-tabs" aria-label="Main">
        {TABS.map((t) => (
          <a key={t.path} href={`#${t.path}`} className={tab === t.path ? 'on' : ''} aria-current={tab === t.path ? 'page' : undefined}>
            <Icon name={t.icon} size={16} /> {t.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <a className="me-chip" href="#/me" aria-label="Your account">
          <Icon name="user" size={18} />
        </a>
        <a className="sos-chip" href="tel:112" title="Call 112 — India emergency">
          <span className="sos-dot" aria-hidden="true" />
          <span className="sos-label">SOS </span>112
        </a>
      </div>
    </header>
  )
}
