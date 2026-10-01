import { useState, type CSSProperties, type ReactNode } from 'react'
import type { Accent } from '../data/zones'
import type { Helpline } from '../data/helplines'
import { copyText } from '../lib/storage'

export function Marquee({ items, accent = 'lime', reverse = false, tilt = 0 }: { items: string[]; accent?: Accent; reverse?: boolean; tilt?: number }) {
  const row = items.map((t, i) => (
    <span key={i} className="marquee-item">
      {t}
      <span className="marquee-star">✶</span>
    </span>
  ))
  return (
    <div className={`marquee a-${accent}`} style={{ '--tilt': `${tilt}deg` } as CSSProperties} role="marquee" aria-label={items.join(' · ')}>
      <div className={`marquee-track${reverse ? ' reverse' : ''}`} aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  )
}

export function PageHero({ kicker, title, sub, emoji, accent, children }: { kicker: string; title: ReactNode; sub: ReactNode; emoji: string; accent: Accent; children?: ReactNode }) {
  return (
    <header className={`page-hero a-${accent}`}>
      <span className="sticker">{kicker}</span>
      <h1 className="display">{title}</h1>
      <p className="lede">{sub}</p>
      {children}
      <span className="hero-emoji" aria-hidden="true">
        {emoji}
      </span>
    </header>
  )
}

export function Section({ id, kicker, title, intro, children, accent }: { id?: string; kicker?: string; title: ReactNode; intro?: ReactNode; children: ReactNode; accent?: Accent }) {
  return (
    <section id={id} className={`section${accent ? ` a-${accent}` : ''}`}>
      <div className="section-head">
        {kicker && <span className="kicker">{kicker}</span>}
        <h2>{title}</h2>
        {intro && <p className="section-intro">{intro}</p>}
      </div>
      {children}
    </section>
  )
}

export function CopyButton({ text, label = 'copy', className = 'btn btn-ghost btn-sm' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        }
      }}
    >
      {done ? 'copied ✓' : label}
    </button>
  )
}

export function CallCard({ line, accent = 'pink', big = false }: { line: Helpline; accent?: Accent; big?: boolean }) {
  return (
    <a className={`call-card a-${accent}${big ? ' big' : ''}`} href={`tel:${line.dial}`}>
      <span className="call-number">{line.number}</span>
      <span className="call-name">{line.name}</span>
      <span className="call-what">{line.what}</span>
      <span className="call-cta">tap to call →</span>
    </a>
  )
}

/** Tiles show just an icon + headline; tap to reveal the detail. Keeps pages light to scan. */
export function TipGrid({ tips, accent }: { tips: { icon: string; title: string; body: ReactNode }[]; accent?: Accent }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  return (
    <div className="tip-grid">
      {tips.map((t) => {
        const on = !!open[t.title]
        return (
          <button key={t.title} type="button" className={`card tip reveal${on ? ' open' : ''}${accent ? ` a-${accent}` : ''}`} aria-expanded={on} onClick={() => setOpen((o) => ({ ...o, [t.title]: !o[t.title] }))}>
            <span className="tip-top">
              <span className="tip-icon" aria-hidden="true">
                {t.icon}
              </span>
              <span className="tip-plus" aria-hidden="true">
                {on ? '−' : '+'}
              </span>
            </span>
            <h3>{t.title}</h3>
            {on && <p>{t.body}</p>}
          </button>
        )
      })}
    </div>
  )
}

export function Checklist({ items, checked, onToggle, accent = 'lime' }: { items: string[]; checked: Record<string, boolean>; onToggle: (item: string) => void; accent?: Accent }) {
  return (
    <ul className={`checklist a-${accent}`}>
      {items.map((item) => (
        <li key={item}>
          <label className={checked[item] ? 'on' : ''}>
            <input type="checkbox" checked={!!checked[item]} onChange={() => onToggle(item)} />
            <span className="box" aria-hidden="true">
              {checked[item] ? '✓' : ''}
            </span>
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export function Callout({ children, accent = 'sun', icon = '⚠️' }: { children: ReactNode; accent?: Accent; icon?: string }) {
  return (
    <div className={`callout a-${accent}`}>
      <span className="callout-icon" aria-hidden="true">
        {icon}
      </span>
      <div>{children}</div>
    </div>
  )
}
