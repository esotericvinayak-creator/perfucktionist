// Real usage numbers for tool pages: "N people have used this". Counts only, from public.tool_usage
// (supabase/migrations/…_tool_usage.sql). Nothing is shown until the number is worth showing.
import { useEffect, useState } from 'react'
import { authNow, client, cloud } from './auth'

export type Usage = { opens: number; people: number }

/** Below this, a count reads as "nobody uses this" — so we don't show it. */
export const SHOW_FROM = 10

const cache = new Map<string, Usage | null>()
const tracked = new Set<string>()

/** Count this person's visit once per app session. Signed-in people only; silent on failure. */
export async function trackTool(id: string) {
  if (!cloud || tracked.has(id) || authNow().status !== 'in') return
  tracked.add(id)
  try {
    const c = await client()
    await c.rpc('track_tool', { p_tool: id })
  } catch {
    // offline or table missing: the count just doesn't move
  }
}

export function useToolUsage(id: string) {
  const [usage, setUsage] = useState<Usage | null>(cache.get(id) ?? null)
  useEffect(() => {
    if (!cloud || cache.has(id)) return
    let live = true
    void (async () => {
      try {
        const c = await client()
        const { data, error } = await c.from('tool_usage').select('opens, people').eq('tool_id', id).maybeSingle()
        const u = error || !data ? null : { opens: Number(data.opens), people: Number(data.people) }
        cache.set(id, u)
        if (live) setUsage(u)
      } catch {
        cache.set(id, null)
      }
    })()
    return () => {
      live = false
    }
  }, [id])
  return usage
}
