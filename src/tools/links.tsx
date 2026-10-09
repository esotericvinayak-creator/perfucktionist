import { resolveTool } from './registry'

/** A small tappable tile that opens another tool — how tools hand off to each other. */
export function ToolChip({ id, label }: { id: string; label?: string }) {
  // Parts of a collection open on their own tab (`stretch` → Move, Desk stretches). Removed tools render nothing.
  const r = resolveTool(id)
  if (!r) return null
  const part = r.tool.parts?.find((p) => p.id === id && p.id !== r.tool.id)
  return (
    <a className="tool-chip" href={`#/tools/${id}`}>
      <span>{r.tool.emoji}</span>
      {label ?? part?.label ?? r.tool.name}
    </a>
  )
}

export function ToolChips({ ids, title = 'try next' }: { ids: string[]; title?: string }) {
  return (
    <div className="tool-chips">
      <span className="kicker">{title}</span>
      <div className="row gap-sm wrap">
        {ids.map((id) => (
          <ToolChip key={id} id={id} />
        ))}
      </div>
    </div>
  )
}
