import { streakOf, useProgress } from '../lib/progress'
import { Icon } from './Icon'

export const TABS = [
  { path: '/', emoji: '🏠', label: 'Home' },
  { path: '/explore', emoji: '🧭', label: 'Explore' },
  { path: '/library', emoji: '📚', label: 'Library' },
  { path: '/me', emoji: '🔥', label: 'Me' },
]

/** Which of the 4 tabs a route belongs to. Everything that isn't Today, Library or Me lives under Explore. */
export function tabFor(route: string) {
  const base = `/${route.split('/')[1] ?? ''}`
  if (base === '/') return '/'
  if (base === '/library' || base === '/shlokas') return '/library'
  if (base === '/me' || base === '/plus') return '/me'
  return '/explore'
}

export function Logo() {
  return (
    <span className="logo-text">
      per<span className="logo-hl">fuck</span>tionist
    </span>
  )
}

export function Nav({ route }: { route: string }) {
  const streak = streakOf(useProgress())
  const tab = tabFor(route)
  return (
    <header className="nav">
      <a href="#/" className="logo" aria-label="perfucktionist — home">
        <Logo />
      </a>
      <nav className="nav-tabs" aria-label="Main">
        {TABS.map((t) => (
          <a key={t.path} href={`#${t.path}`} className={tab === t.path ? 'on' : ''} aria-current={tab === t.path ? 'page' : undefined}>
            <Icon name={t.label.toLowerCase()} size={16} /> {t.label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <a className={`streak-chip${streak ? ' lit' : ''}`} href="#/me" title="Your streak">
          🔥 <span>{streak}</span>
        </a>
        <a className="sos-chip" href="tel:112" title="Call 112 — India emergency">
          <span className="sos-dot" aria-hidden="true" />
          <span className="sos-label">SOS </span>112
        </a>
      </div>
    </header>
  )
}
