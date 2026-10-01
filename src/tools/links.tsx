import { toolById } from './registry'

/** A small tappable tile that opens another tool — how tools hand off to each other. */
export function ToolChip({ id, label }: { id: string; label?: string }) {
  const t = toolById(id)
  if (!t) return null
  return (
    <a className="tool-chip" href={`#/tools/${t.id}`}>
      <span>{t.emoji}</span>
      {label ?? t.name}
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
