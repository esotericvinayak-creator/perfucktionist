// Real Faith polls: your Yes/No answers, and everyone's totals.
//
// - Cloud mode, signed in: answers are rows in `faith_votes` (own rows only), totals come from the
//   `faith_tally()` function, which returns counts and never who answered.
//   See supabase/migrations/…_faith_polls.sql.
// - Preview mode (no keys) or signed out: answers stay on this device and there are no totals.
// - The statements themselves are in src/data/faithPolls.ts.
import { useCallback, useEffect, useRef, useState } from 'react'
import { client, cloud, useAuth } from './auth'
import { statementIds } from '../data/faithPolls'
import { useLocalState } from './storage'

/** Below this many answers a result is too noisy (and too easy to push around) to show as a percentage. */
export const MIN_ANSWERS = 20

export type Tally = { yes: number; no: number }
export type PollMode =
  /** Answers and totals live in the database. */
  | 'cloud'
  /** Preview app: answers stay on this device. */
  | 'preview'
  /** Real app but not signed in: answers stay on this device. */
  | 'signed-out'

export type PollStatus = 'loading' | 'ready' | 'off' | 'error'

const messages: Record<string, string> = {
  '23514': 'That question isn’t part of the polls.',
  '42P01': 'Polls aren’t switched on for this app yet.',
  PGRST205: 'Polls aren’t switched on for this app yet.',
  PGRST202: 'Polls aren’t switched on for this app yet.',
}
const missing = (code?: string) => code === '42P01' || code === 'PGRST205' || code === 'PGRST202'

/** Yes / No as whole percentages that always add up to 100. */
export function split({ yes, no }: Tally) {
  const total = yes + no
  if (!total) return { yesPct: 0, noPct: 0, total }
  const yesPct = Math.round((yes / total) * 100)
  return { yesPct, noPct: 100 - yesPct, total }
}

export function useFaithPolls() {
  const auth = useAuth()
  const mode: PollMode = !cloud ? 'preview' : auth.status === 'in' ? 'cloud' : 'signed-out'
  const [local, setLocal] = useLocalState<Record<string, boolean>>('faith-polls', {})
  const [remote, setRemote] = useState<Record<string, boolean>>({})
  const [tally, setTally] = useState<Record<string, Tally>>({})
  const [status, setStatus] = useState<PollStatus>(mode === 'cloud' ? 'loading' : 'ready')
  // Answers are applied in the order they were tapped; a late reply must not undo a newer tap.
  const version = useRef(0)

  const load = useCallback(async () => {
    if (mode !== 'cloud') {
      setStatus('ready')
      return
    }
    try {
      const c = await client()
      const [mine, totals] = await Promise.all([c.from('faith_votes').select('statement_id, answer'), c.rpc('faith_tally')])
      const err = mine.error ?? totals.error
      if (err) {
        setStatus(missing(err.code) ? 'off' : 'error')
        return
      }
      const seen = version.current
      const mineMap: Record<string, boolean> = {}
      for (const r of (mine.data ?? []) as { statement_id: string; answer: boolean }[]) mineMap[r.statement_id] = r.answer
      const tallyMap: Record<string, Tally> = {}
      for (const r of (totals.data ?? []) as { statement_id: string; yes: number | string; no: number | string }[]) tallyMap[r.statement_id] = { yes: Number(r.yes), no: Number(r.no) }
      if (seen !== version.current) return // answered while loading: the next refresh has it
      setRemote(mineMap)
      setTally(tallyMap)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [mode])

  useEffect(() => {
    if (mode === 'cloud') setStatus('loading')
    void load()
  }, [load, mode])

  /** Save an answer (or change it). Returns an error message to show, or null. */
  const answer = useCallback(
    async (id: string, yes: boolean): Promise<string | null> => {
      if (!statementIds.has(id)) return messages['23514']
      if (mode !== 'cloud') {
        setLocal((m) => ({ ...m, [id]: yes }))
        return null
      }
      const before = remote[id]
      const beforeTally = tally[id]
      version.current++
      // Show it straight away: your own answer counts in the totals you see.
      setRemote((m) => ({ ...m, [id]: yes }))
      setTally((t) => {
        const cur = t[id] ?? { yes: 0, no: 0 }
        const next = { yes: cur.yes - (before === true ? 1 : 0) + (yes ? 1 : 0), no: cur.no - (before === false ? 1 : 0) + (yes ? 0 : 1) }
        return { ...t, [id]: next }
      })
      const rollback = () => {
        setRemote((m) => {
          const { [id]: _drop, ...rest } = m
          return before === undefined ? rest : { ...rest, [id]: before }
        })
        setTally((t) => {
          const { [id]: _drop, ...rest } = t
          return beforeTally ? { ...rest, [id]: beforeTally } : rest
        })
      }
      try {
        const c = await client()
        const { error } = await c.from('faith_votes').upsert({ statement_id: id, answer: yes }, { onConflict: 'user_id,statement_id' })
        if (error) {
          rollback()
          return messages[error.code] ?? 'Couldn’t save that. Check your connection and try again.'
        }
        void load()
        return null
      } catch {
        rollback()
        return 'Couldn’t save that. Check your connection and try again.'
      }
    },
    [mode, remote, tally, load, setLocal],
  )

  return { mode, status, mine: mode === 'cloud' ? remote : local, tally, answer, reload: load }
}
