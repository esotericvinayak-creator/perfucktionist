import { Suspense, useEffect } from 'react'
import { useLocalState } from '../lib/storage'
import { TOOL_COMPONENTS } from '../tools/loaders'
import { Icon } from '../components/Icon'
import { toolById } from '../tools/registry'
import Explore from './Explore'

const AREA_OF: Record<string, string> = { mind: 'calm', focus: 'focus', body: 'body', money: 'money', safety: 'safety', people: 'people', grow: 'grow' }

function ToolView({ id }: { id: string }) {
  const t = toolById(id)
  const C = TOOL_COMPONENTS[id]
  const [pins, setPins] = useLocalState<string[]>('tool-pins', [])
  const [, setRecent] = useLocalState<string[]>('tool-recent', [])
  useEffect(() => {
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8))
    document.title = t ? `${t.name} — perfucktionist` : document.title
  }, [id])
  if (!t || !C)
    return (
      <div className="page tool-page">
        <p className="big-q">That tool doesn’t exist (yet).</p>
        <a className="btn" href="#/explore">
          ← explore
        </a>
      </div>
    )
  const pinned = pins.includes(id)
  return (
    <div className={`page tool-page cat-${t.cat}`}>
      <header className="tool-head">
        <a className="icon-btn" href={`#/explore/${AREA_OF[t.cat] ?? ''}`} aria-label="Back">
          ←
        </a>
        <span className="ibub big">
          <Icon name={t.id === 'focus' ? 'focus-timer' : t.id} size={26} />
        </span>
        <div className="grow">
          <h1>{t.name}</h1>
          <p>
            {t.hook}
          </p>
        </div>
        <button type="button" className={`icon-btn${pinned ? ' pinned' : ''}`} aria-pressed={pinned} aria-label={pinned ? 'Unpin from dock' : 'Pin to dock'} onClick={() => setPins(pinned ? pins.filter((p) => p !== id) : [id, ...pins])}>
          {pinned ? '★' : '☆'}
        </button>
      </header>
      <div className="tool-body">
        <Suspense fallback={<div className="tool-loading" aria-busy="true" />}>
          <C />
        </Suspense>
      </div>
      {t.next && t.next.length > 0 && (
        <footer className="tool-next">
          <span className="kicker">up next</span>
          <div className="next-row">
            {t.next.map((n) => {
              const nt = toolById(n)
              return nt ? (
                <a key={n} href={`#/tools/${n}`} className="next-tile">
                  <Icon name={n === 'focus' ? 'focus-timer' : n} size={18} />
                  {nt.name}
                </a>
              ) : null
            })}
          </div>
        </footer>
      )}
    </div>
  )
}

export default function Tools() {
  // #/tools/<id> opens a tool. The old hub (#/tools, #/tools/for/<need>) is now Explore.
  const [sub] = window.location.hash.replace(/^#\/tools\/?/, '').split('/')
  if (!sub || sub === 'for') return <Explore />
  return <ToolView id={sub} />
}
