import { Suspense, useEffect, useState } from 'react'
import { useLocalState } from '../lib/storage'
import { SHOW_FROM, trackTool, useToolUsage } from '../lib/toolStats'
import { TOOL_COMPONENTS } from '../tools/loaders'
import { Icon } from '../components/Icon'
import { moodOf, REMOVED, resolveTool, toolById } from '../tools/registry'
import Explore from './Explore'

const iconFor = (id: string) => (id === 'focus' ? 'focus-timer' : id)

function ToolView({ id }: { id: string }) {
  const found = resolveTool(id)
  const t = found?.tool
  const [part, setPart] = useState(found?.part ?? id)
  const [pins, setPins] = useLocalState<string[]>('tool-pins', [])
  const [, setRecent] = useLocalState<string[]>('tool-recent', [])
  const [opens, setOpens] = useLocalState<Record<string, number>>('tool-opens', {})
  const usage = useToolUsage(t?.id ?? id)

  useEffect(() => {
    if (!t) return
    setRecent((r) => [t.id, ...r.filter((x) => x !== t.id)].slice(0, 8))
    setOpens((o) => ({ ...o, [t.id]: (o[t.id] ?? 0) + 1 }))
    void trackTool(t.id)
    document.title = `${t.name} — perfucktionist`
  }, [t?.id])

  if (!t)
    return (
      <div className="page tool-page">
        <p className="big-q">That tool doesn’t exist (yet).</p>
        <a className="btn" href="#/explore">
          ← discover
        </a>
      </div>
    )

  const C = TOOL_COMPONENTS[part] ?? TOOL_COMPONENTS[t.id]
  const pinned = pins.includes(t.id)
  const current = t.parts?.find((p) => p.id === part)
  const mine = opens[t.id] ?? 0
  const related = (t.related ?? []).map(toolById).filter((x) => x && x.id !== t.id)
  const choose = (p: string) => {
    setPart(p)
    // Keep the address in step so a shared or reloaded link opens the same tab, without a new history entry.
    history.replaceState(history.state, '', `#/tools/${p}`)
  }

  return (
    <div className={`page tool-page cat-${t.cat}`} data-mood={moodOf(t)}>
      <header className="tool-head">
        <span className="ibub big">
          <Icon name={iconFor(t.id)} size={26} />
        </span>
        <div className="grow">
          <h1>{t.name}</h1>
          <p>{t.hook}</p>
        </div>
        <button
          type="button"
          className={`icon-btn${pinned ? ' pinned' : ''}`}
          aria-pressed={pinned}
          aria-label={pinned ? 'Unpin from dock' : 'Pin to dock'}
          onClick={() => setPins(pinned ? pins.filter((p) => p !== t.id) : [t.id, ...pins])}
        >
          {pinned ? '★' : '☆'}
        </button>
      </header>

      {/* Explained up front the first few times; folded away once you know it. */}
      <details className="tool-about" open={mine <= 3}>
        <summary>what it’s for</summary>
        <p>{t.why}</p>
        <p className="tool-stats">
          {usage && usage.people >= SHOW_FROM && (
            <span>
              <b>{usage.people.toLocaleString('en-IN')}</b> people have used this
            </span>
          )}
          {mine > 1 && (
            <span>
              you’ve opened it <b>{mine}</b> times
            </span>
          )}
          {t.parts && <span>{t.parts.length} parts in one place</span>}
        </p>
      </details>

      {t.parts && (
        <div className="tool-tabs" role="tablist" aria-label={`${t.name} parts`}>
          {t.parts.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={p.id === part} className={p.id === part ? 'on' : ''} onClick={() => choose(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      )}
      {current && <p className="tool-part-hook">{current.hook}</p>}

      <div className="tool-body" key={part}>
        <Suspense fallback={<div className="tool-loading" aria-busy="true" />}>{C ? <C /> : null}</Suspense>
      </div>

      {related.length > 0 && (
        <footer className="tool-next">
          <span className="kicker">goes well with this</span>
          <div className="next-row">
            {related.map((nt) => (
              <a key={nt!.id} href={`#/tools/${nt!.id}`} className="next-tile">
                <Icon name={iconFor(nt!.id)} size={18} />
                <span className="next-text">
                  <b>{nt!.name}</b>
                  <small>{nt!.hook}</small>
                </span>
              </a>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}

export default function Tools() {
  // #/tools/<id> opens a tool (or a part of a collection). The old hub (#/tools, #/tools/for/<need>) is now Discover.
  const [sub] = window.location.hash.replace(/^#\/tools\/?/, '').split('/')
  if (!sub || sub === 'for') return <Explore />
  return <ToolView id={REMOVED[sub] ?? sub} />
}
