import { todayKey } from './storage'

// The sleep promise (Sleep → Wind-down / Caffeine cut-off): one entry per night, answered the next morning.
// Lives here, not in the tool, so Me can show it without loading the tools.
export type SleepNight = { wind?: boolean; caf?: boolean }

const addDays = (key: string, days: number) => {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** The last 7 nights (not tonight): how many were answered and kept, and the current run of kept nights. */
export function sleepWeek(nights: Record<string, SleepNight>) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayKey(), i - 7))
  const answered = days.filter((d) => nights[d] && (nights[d].wind !== undefined || nights[d].caf !== undefined))
  const kept = answered.filter((d) => nights[d].wind !== false && nights[d].caf !== false).length
  let streak = 0
  for (const d of [...days].reverse()) {
    const n = nights[d]
    if (!n || n.wind === false || n.caf === false) break
    streak++
  }
  return { answered: answered.length, kept, missed: answered.length - kept, streak }
}
