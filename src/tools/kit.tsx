// Shared building blocks for the toolkit. Tools stay short: one idea per screen, big taps, little text.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { PlusWall } from '../components/Overlays'
import { usePlus } from '../lib/plus'
import { todayKey, useLocalState } from '../lib/storage'

export const useTool = <T,>(key: string, init: T) => useLocalState<T>(`tool:${key}`, init)
export const today = todayKey

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
export const compact = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : inr(n)

export function addDays(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
export function daysBetween(a: string, b: string) {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}
export const lastDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(today(), i - n + 1))
export const shortDate = (key: string) => new Date(`${key}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
export const uid = () => Math.random().toString(36).slice(2, 9)
export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

// ─── flow: one step at a time ─────────────────────────────────
export type Step = { title: ReactNode; body: ReactNode; ready?: boolean; next?: string }

export function Flow({ steps, onDone, doneLabel = 'done ✓' }: { steps: Step[]; onDone?: () => void; doneLabel?: string }) {
  const [i, setI] = useState(0)
  const step = steps[i]
  const last = i === steps.length - 1
  return (
    <div className="flow">
      <div className="flow-dots" aria-label={`Step ${i + 1} of ${steps.length}`}>
        {steps.map((_, j) => (
          <span key={j} className={j < i ? 'past' : j === i ? 'now' : ''} />
        ))}
      </div>
      <h3 className="flow-title" key={`t${i}`}>
        {step.title}
      </h3>
      <div className="flow-body" key={`b${i}`}>
        {step.body}
      </div>
      <div className="flow-nav">
        {i > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setI(i - 1)}>
            ← back
          </button>
        )}
        <button type="button" className="btn btn-primary a-lime grow-btn" disabled={step.ready === false} onClick={() => (last ? onDone?.() : setI(i + 1))}>
          {last ? doneLabel : step.next ?? 'next →'}
        </button>
      </div>
    </div>
  )
}

// ─── inputs ───────────────────────────────────────────────────
export function Choice<T extends string | number>({ options, value, onChange, big = false }: { options: { value: T; label: ReactNode }[]; value: T | null | undefined; onChange: (v: T) => void; big?: boolean }) {
  return (
    <div className={big ? 'choice-big' : 'row gap-sm wrap'} role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} className={big ? `pick${value === o.value ? ' on' : ''}` : `chip${value === o.value ? ' on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Num({ label, value, onChange, prefix, suffix, step = 1, min = 0, max }: { label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; step?: number; min?: number; max?: number }) {
  return (
    <label className="num">
      <span>{label}</span>
      <span className="num-box">
        {prefix && <i>{prefix}</i>}
        <input type="number" inputMode="decimal" value={Number.isFinite(value) ? value : ''} step={step} min={min} max={max} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
        {suffix && <i>{suffix}</i>}
      </span>
    </label>
  )
}

export function Text({ label, value, onChange, placeholder, area = false, max = 280 }: { label?: string; value: string; onChange: (s: string) => void; placeholder?: string; area?: boolean; max?: number }) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      {area ? <textarea value={value} maxLength={max} placeholder={placeholder} rows={4} onChange={(e) => onChange(e.target.value)} /> : <input value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  )
}

export function QuickAdd({ placeholder, onAdd, button = '+ add', max = 120 }: { placeholder: string; onAdd: (s: string) => void; button?: string; max?: number }) {
  const [v, setV] = useState('')
  return (
    <form
      className="quick-add"
      onSubmit={(e) => {
        e.preventDefault()
        if (v.trim()) onAdd(v.trim())
        setV('')
      }}
    >
      <input value={v} maxLength={max} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <button type="submit" className="btn btn-primary a-lime">
        {button}
      </button>
    </form>
  )
}

// ─── display ──────────────────────────────────────────────────
export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

export function Stats({ children }: { children: ReactNode }) {
  return <div className="stats">{children}</div>
}

export function Empty({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="empty">
      <span>{emoji}</span>
      <p>{children}</p>
    </div>
  )
}

export function Done({ emoji = '🎉', title, children }: { emoji?: string; title: string; children?: ReactNode }) {
  return (
    <div className="done-card">
      <span className="done-emoji">{emoji}</span>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export function Ring({ progress, size = 240, children }: { progress: number; size?: number; children?: ReactNode }) {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="ring-track" />
        <circle cx="50" cy="50" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))} />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  )
}

export function PlusOnly({ title, children, why }: { title: string; why: string; children: ReactNode }) {
  const plus = usePlus()
  return plus.active ? <>{children}</> : <PlusWall title={title}>{why}</PlusWall>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`tcard ${className}`}>{children}</div>
}

// ─── timer that survives a sleeping tab ───────────────────────
export function useCountdown(onEnd?: () => void) {
  const [endAt, setEndAt] = useState<number | null>(null)
  const [pausedLeft, setPausedLeft] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [now, setNow] = useState(Date.now())
  const endRef = useRef(onEnd)
  endRef.current = onEnd

  useEffect(() => {
    if (endAt === null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= endAt) {
        setEndAt(null)
        endRef.current?.()
      }
    }, 250)
    return () => clearInterval(id)
  }, [endAt])

  const left = pausedLeft ?? (endAt ? Math.max(0, Math.ceil((endAt - now) / 1000)) : 0)
  const start = useCallback((secs: number) => {
    setTotal(secs)
    setPausedLeft(null)
    setNow(Date.now())
    setEndAt(Date.now() + secs * 1000)
  }, [])
  return {
    left,
    total,
    running: endAt !== null,
    paused: pausedLeft !== null,
    progress: total ? 1 - left / total : 0,
    start,
    pause: () => {
      if (endAt === null) return
      setPausedLeft(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)))
      setEndAt(null)
    },
    resume: () => {
      if (pausedLeft === null) return
      setNow(Date.now())
      setEndAt(Date.now() + pausedLeft * 1000)
      setPausedLeft(null)
    },
    stop: () => {
      setEndAt(null)
      setPausedLeft(null)
      setTotal(0)
    },
  }
}

// ─── charts (single-series columns, horizontal bars, 2-series stack) ─────
type Datum = { label: string; value: number }

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

function TableView({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="chart-table">
      <summary>show as table</summary>
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

/** Column chart. Labels only the max and the latest bar; everything else is on hover/focus or in the table. */
export function Columns({ data, format = String, height = 160, title }: { data: Datum[]; format?: (n: number) => string; height?: number; title: string }) {
  const [tip, setTip] = useState<number | null>(null)
  const top = niceMax(Math.max(...data.map((d) => d.value), 0))
  const maxI = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0)
  const labelEvery = Math.ceil(data.length / 6)
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="cols-wrap" style={{ height }} onPointerLeave={() => setTip(null)}>
        <span className="grid-line top">
          <i>{format(top)}</i>
        </span>
        <div className="cols">
          {data.map((d, i) => {
            const h = (d.value / top) * 100
            const show = d.value > 0 && (i === maxI || i === data.length - 1)
            return (
              <button
                key={d.label + i}
                type="button"
                className={`col${tip === i ? ' hot' : ''}`}
                aria-label={`${d.label}: ${format(d.value)}`}
                onPointerEnter={() => setTip(i)}
                onFocus={() => setTip(i)}
                onBlur={() => setTip(null)}
              >
                <span className="col-bar" style={{ height: `${h}%` }}>
                  {show && <em>{format(d.value)}</em>}
                </span>
                {tip === i && (
                  <span className="ctip" role="status">
                    <b>{format(d.value)}</b>
                    {d.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="col-labels">
        {data.map((d, i) => (
          <span key={d.label + i}>{i % labelEvery === 0 || i === data.length - 1 ? d.label : ''}</span>
        ))}
      </div>
      <TableView head={['', title]} rows={data.map((d) => [d.label, format(d.value)])} />
    </figure>
  )
}

/** Horizontal bars, value at the tip. */
export function HBars({ data, format = String, title }: { data: (Datum & { emoji?: string })[]; format?: (n: number) => string; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="hbars">
        {data.map((d) => (
          <div key={d.label} className="hbar" title={`${d.label}: ${format(d.value)}`}>
            <span className="hbar-label">
              {d.emoji} {d.label}
            </span>
            <span className="hbar-track">
              <span className="hbar-fill" style={{ width: `${(d.value / max) * 100}%` }} />
              <em>{format(d.value)}</em>
            </span>
          </div>
        ))}
      </div>
      <TableView head={['', title]} rows={data.map((d) => [d.label, format(d.value)])} />
    </figure>
  )
}

/** Two-part stacked columns (e.g. invested vs growth). Legend always shown; total labelled on the last column. */
export function StackedColumns({ data, names, format = String, title, height = 200 }: { data: { label: string; a: number; b: number }[]; names: [string, string]; format?: (n: number) => string; title: string; height?: number }) {
  const [tip, setTip] = useState<number | null>(null)
  const top = niceMax(Math.max(...data.map((d) => d.a + d.b), 0))
  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div className="legend">
        <span>
          <i className="sw s1" /> {names[0]}
        </span>
        <span>
          <i className="sw s2" /> {names[1]}
        </span>
      </div>
      <div className="cols-wrap" style={{ height }} onPointerLeave={() => setTip(null)}>
        <span className="grid-line top">
          <i>{format(top)}</i>
        </span>
        <div className="cols">
          {data.map((d, i) => (
            <button key={d.label} type="button" className={`col stack${tip === i ? ' hot' : ''}`} aria-label={`${d.label}: ${names[0]} ${format(d.a)}, ${names[1]} ${format(d.b)}`} onPointerEnter={() => setTip(i)} onFocus={() => setTip(i)} onBlur={() => setTip(null)}>
              <span className="stack-col" style={{ height: `${((d.a + d.b) / top) * 100}%` }}>
                {i === data.length - 1 && <em>{format(d.a + d.b)}</em>}
                <span className="seg s2" style={{ flexGrow: d.b }} />
                <span className="seg s1" style={{ flexGrow: d.a }} />
              </span>
              {tip === i && (
                <span className="ctip" role="status">
                  <b>{format(d.a + d.b)}</b>
                  {d.label}
                  <small>
                    <i className="ln s1" /> {format(d.a)} {names[0]}
                  </small>
                  <small>
                    <i className="ln s2" /> {format(d.b)} {names[1]}
                  </small>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="col-labels">
        {data.map((d, i) => (
          <span key={d.label}>{i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 ? d.label : ''}</span>
        ))}
      </div>
      <TableView head={['', names[0], names[1], 'total']} rows={data.map((d) => [d.label, format(d.a), format(d.b), format(d.a + d.b)])} />
    </figure>
  )
}

export function Meter({ value, max = 1, tone }: { value: number; max?: number; tone?: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className={`tmeter ${tone ?? ''}`} style={{ '--p': `${Math.min(100, (value / max) * 100)}%` } as CSSProperties}>
      <span />
    </div>
  )
}

export function List<T extends { id: string }>({ items, render, onRemove }: { items: T[]; render: (t: T) => ReactNode; onRemove?: (t: T) => void }) {
  return (
    <ul className="tlist">
      {items.map((t) => (
        <li key={t.id}>
          <div className="grow">{render(t)}</div>
          {onRemove && (
            <button type="button" className="x" aria-label="Remove" onClick={() => onRemove(t)}>
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
