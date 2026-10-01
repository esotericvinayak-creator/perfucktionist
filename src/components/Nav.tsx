import { useEffect, useState } from 'react'
import { glowUp, zones } from '../data/zones'
import { streakOf, useProgress } from '../lib/progress'
import { useLocalState } from '../lib/storage'

export function Logo() {
  return (
    <span className="logo-text">
      per<span className="logo-hl">fuck</span>tionist
    </span>
  )
}

export function Nav({ route }: { route: string }) {
  const [open, setOpen] = useState(false)
  const streak = streakOf(useProgress())
  const [theme, setTheme] = useLocalState<'dark' | 'light'>('theme', (document.documentElement.dataset.theme as 'dark' | 'light') ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => setOpen(false), [route])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="nav">
        <a href="#/" className="logo" aria-label="perfucktionist home">
          <Logo />
          <span className="logo-star" aria-hidden="true">
            ✶
          </span>
        </a>
        <div className="nav-actions">
          <a className={`streak-chip${streak ? ' lit' : ''}`} href="#/me" title="My glow-up: streak, XP & badges">
            🔥 <span>{streak}</span>
          </a>
          <a className="sos-chip" href="tel:112" title="Call 112 — India emergency">
            <span className="sos-dot" aria-hidden="true" />
            <span className="sos-label">SOS </span>112
          </a>
          <button
            type="button"
            className="icon-btn theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀︎' : '☾'}
          </button>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="zone-menu" onClick={() => setOpen(!open)}>
            {open ? 'close ✕' : 'menu ✦'}
          </button>
        </div>
      </header>

      {open && (
        <nav id="zone-menu" className="menu-overlay" aria-label="All zones">
          <div className="menu-inner">
            <p className="kicker">pick your vibe</p>
            <div className="menu-grid">
              <a href="#/" className={`menu-link a-violet${route === '/' ? ' current' : ''}`}>
                <span className="menu-emoji">✶</span>
                <span>Home</span>
              </a>
              {zones.map((z) => (
                <a key={z.path} href={`#${z.path}`} className={`menu-link a-${z.accent}${route === z.path ? ' current' : ''}`}>
                  <span className="menu-emoji">{z.emoji}</span>
                  <span>
                    {z.title}
                    {z.tag && <em> {z.tag}</em>}
                  </span>
                </a>
              ))}
            </div>
            <button type="button" className="btn btn-sm menu-theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '☀︎ light mode' : '☾ dark mode'}
            </button>
            <p className="kicker">glow-up mode</p>
            <div className="menu-grid">
              {glowUp.map((z) => (
                <a key={z.path} href={`#${z.path}`} className={`menu-link a-${z.accent}${route === z.path ? ' current' : ''}`}>
                  <span className="menu-emoji">{z.emoji}</span>
                  <span>{z.title}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  )
}
