// Turns what you already logged across the app into "gold": patterns about you, from your own data,
// computed on this device. Nothing here is sent anywhere.
//
// Every insight compares days WITH something to days WITHOUT it, and only speaks when both sides have
// at least MIN days, so one weird Tuesday can't become a "pattern".
import { peek, todayKey } from './storage'
import type { Progress } from './progress'

const MIN = 3
type Rec<T> = Record<string, T>
type CheckIn = { mood: number; energy: number; sleep: number }
type Session = { date: string; minutes: number }
type Expense = { date: string; amt: number; cat: string }
type Entry = { date: string; text: string; title?: string }

export type Insight = { id: string; emoji: string; title: string; detail: string; lift: number }
export type Gap = { id: string; emoji: string; need: string; path: string }
export type KanakReport = {
  sample: boolean
  score: number
  scoreParts: { label: string; value: number }[]
  days30: number
  bestStreak: number
  checkins: number
  moodAvg: number | null
  moodTrend: number | null
  bestWeekday: string | null
  focusHours: number
  sleepAvg: number | null
  screenAvg: number | null
  words: number
  topWords: string[]
  topSpend: { cat: string; amt: number } | null
  insights: Insight[]
  gaps: Gap[]
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
const lastDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(todayKey(), i - n + 1))
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const STOP = new Set('the a an and or but i im i’m me my to of in on for with it its is was were be been am are at so that this just not no yes too very really like you your we our they them he she his her have has had do did done get got go went can cant could would will from about all out up then than there what when how why who also as if one more some much feel felt today day'.split(' '))

/** Mood on days with X vs days without X → an insight, or null when there isn't enough to say. */
function compare(mood: Rec<number>, has: (d: string) => boolean | null, make: (withAvg: number, withoutAvg: number) => Omit<Insight, 'lift'>): Insight | null {
  const yes: number[] = []
  const no: number[] = []
  for (const [d, m] of Object.entries(mood)) {
    const h = has(d)
    if (h === null) continue
    ;(h ? yes : no).push(m)
  }
  if (yes.length < MIN || no.length < MIN) return null
  const a = avg(yes)!
  const b = avg(no)!
  if (Math.abs(a - b) < 0.3) return null
  return { ...make(a, b), lift: a - b }
}

export function buildReport(p: Progress, sample = false): KanakReport {
  const src = sample ? SAMPLE : null
  const checkins = src?.checkins ?? peek<Rec<CheckIn>>('tool:checkins') ?? {}
  const sleepLog = src?.sleepLog ?? peek<Rec<{ bed: string; wake: string }>>('tool:sleep-log') ?? {}
  const screen = src?.screen ?? peek<Rec<{ total: number }>>('tool:screen-time') ?? {}
  const focus = src?.focus ?? peek<Session[]>('tool:focus-log') ?? []
  const expenses = src?.expenses ?? peek<Expense[]>('tool:expenses') ?? []
  const journal = src?.journal ?? peek<Entry[]>('tool:journal') ?? []
  const lines = src?.lines ?? peek<Rec<string>>('tool:one-line') ?? {}
  const days = src?.days ?? p.days

  const mood: Rec<number> = {}
  for (const [d, c] of Object.entries(checkins)) if (c?.mood) mood[d] = c.mood

  // sleep hours per night, from the sleep log (night before) or the check-in
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  const sleepH: Rec<number> = {}
  for (const [d, c] of Object.entries(checkins)) if (c?.sleep) sleepH[d] = c.sleep
  for (const [d, s] of Object.entries(sleepLog)) sleepH[addDays(d, 1)] = ((((toMin(s.wake) - toMin(s.bed)) % 1440) + 1440) % 1440) / 60
  const screenM: Rec<number> = {}
  for (const [d, s] of Object.entries(screen)) if (s?.total) screenM[d] = s.total
  const focusM: Rec<number> = {}
  for (const s of focus) focusM[s.date] = (focusM[s.date] ?? 0) + s.minutes
  const showed = (d: string) => Object.values(days[d] ?? {}).some((n) => (n ?? 0) > 0)
  const moved = (d: string) => (days[d]?.move ?? 0) > 0

  const insights = [
    compare(mood, (d) => (d in sleepH ? sleepH[d] >= 7 : null), (a, b) => ({ id: 'sleep', emoji: '🌙', title: a > b ? 'Sleep is your superpower' : 'More sleep isn’t lifting you (yet)', detail: `After 7h+ of sleep your mood averages ${a.toFixed(1)}/5. After less, ${b.toFixed(1)}.` })),
    compare(mood, (d) => (d in screenM ? screenM[d] <= 180 : null), (a, b) => ({ id: 'screen', emoji: '📱', title: a > b ? 'Less scrolling, better days' : 'Screen time isn’t your mood problem', detail: `Under 3 hours of screen time: mood ${a.toFixed(1)}. Over: ${b.toFixed(1)}.` })),
    compare(mood, (d) => (focusM[d] ?? 0) >= 25, (a, b) => ({ id: 'focus', emoji: '⏱️', title: a > b ? 'Getting things done makes you happier' : 'Your mood dips on heavy work days', detail: `Days with a focus round: mood ${a.toFixed(1)}. Days without: ${b.toFixed(1)}.` })),
    compare(mood, (d) => moved(d), (a, b) => ({ id: 'move', emoji: '🏃', title: a > b ? 'Moving your body works' : 'Workouts aren’t moving your mood', detail: `Days you moved: mood ${a.toFixed(1)}. Days you didn’t: ${b.toFixed(1)}.` })),
    compare(mood, (d) => showed(d), (a, b) => ({ id: 'show', emoji: '🔥', title: a > b ? 'Showing up pays off' : 'You show up even on hard days', detail: `Days you did your 5 minutes: mood ${a.toFixed(1)}. Days you skipped: ${b.toFixed(1)}.` })),
  ]
    .filter((x): x is Insight => !!x)
    .sort((x, y) => Math.abs(y.lift) - Math.abs(x.lift))

  // weekday with the best average mood
  const byDay: number[][] = Array.from({ length: 7 }, () => [])
  for (const [d, m] of Object.entries(mood)) byDay[new Date(`${d}T00:00`).getDay()].push(m)
  const ranked = byDay.map((xs, i) => ({ i, a: xs.length >= 2 ? avg(xs)! : -1 })).sort((a, b) => b.a - a.a)
  const bestWeekday = ranked[0].a > 0 ? WEEKDAYS[ranked[0].i] : null

  // mood trend: last 14 days vs the 14 before
  const recent = avg(lastDays(14).filter((d) => mood[d]).map((d) => mood[d]))
  const before = avg(Array.from({ length: 14 }, (_, i) => addDays(todayKey(), -27 + i)).filter((d) => mood[d]).map((d) => mood[d]))
  const moodTrend = recent !== null && before !== null ? recent - before : null

  // streaks and consistency
  const all = lastDays(120)
  let best = 0
  let run = 0
  for (const d of all) {
    run = showed(d) ? run + 1 : 0
    best = Math.max(best, run)
  }
  const days30 = lastDays(30).filter(showed).length

  // words you wrote, and the ones you use most (stop-words removed)
  const texts = [...journal.map((e) => `${e.title ?? ''} ${e.text}`), ...Object.values(lines)]
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length
  const freq: Rec<number> = {}
  for (const w of texts.join(' ').toLowerCase().match(/[a-zऀ-ॿ’']{3,}/g) ?? []) if (!STOP.has(w)) freq[w] = (freq[w] ?? 0) + 1
  const topWords = Object.entries(freq)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)

  const month = todayKey().slice(0, 7)
  const spend: Rec<number> = {}
  for (const e of expenses) if (e.date.startsWith(month)) spend[e.cat] = (spend[e.cat] ?? 0) + e.amt
  const top = Object.entries(spend).sort((a, b) => b[1] - a[1])[0]

  const sleepAvg = avg(lastDays(14).filter((d) => d in sleepH).map((d) => sleepH[d]))
  const screenAvg = avg(lastDays(14).filter((d) => d in screenM).map((d) => screenM[d]))
  const focusHours = Object.entries(focusM).filter(([d]) => d >= addDays(todayKey(), -29)).reduce((a, [, m]) => a + m, 0) / 60

  // Kanak score: 0–100 from four things you control. Each part is shown, so it's never a mystery number.
  const parts = [
    { label: 'showing up', value: Math.round((days30 / 30) * 100) },
    { label: 'sleep', value: sleepAvg === null ? 0 : Math.round(Math.max(0, Math.min(1, (sleepAvg - 5) / 3)) * 100) },
    { label: 'focus', value: Math.round(Math.min(1, focusHours / 20) * 100) },
    { label: 'checking in', value: Math.round((lastDays(30).filter((d) => mood[d]).length / 30) * 100) },
  ]
  const score = Math.round(parts.reduce((a, x) => a + x.value, 0) / parts.length)

  const gaps: Gap[] = []
  if (Object.keys(mood).length < 6) gaps.push({ id: 'checkin', emoji: '🌡️', need: `${6 - Object.keys(mood).length} more mood check-ins`, path: '/tools/checkin' })
  if (Object.keys(sleepH).length < 6) gaps.push({ id: 'sleep', emoji: '🌙', need: 'log your sleep a few nights', path: '/tools/sleep-calc' })
  if (Object.keys(screenM).length < 6) gaps.push({ id: 'screen', emoji: '📱', need: 'log screen time a few days', path: '/tools/screen-time' })
  if (!focus.length) gaps.push({ id: 'focus', emoji: '⏱️', need: 'do one focus round', path: '/tools/focus' })

  return {
    sample,
    score,
    scoreParts: parts,
    days30,
    bestStreak: best,
    checkins: Object.keys(mood).length,
    moodAvg: avg(Object.values(mood)),
    moodTrend,
    bestWeekday,
    focusHours,
    sleepAvg,
    screenAvg,
    words,
    topWords,
    topSpend: top ? { cat: top[0], amt: top[1] } : null,
    insights,
    gaps: sample ? [] : gaps,
  }
}

// ─── sample data: shows what Kanak does before you've logged enough (always labelled "sample") ───
const SAMPLE = (() => {
  const checkins: Rec<CheckIn> = {}
  const sleepLog: Rec<{ bed: string; wake: string }> = {}
  const screen: Rec<{ total: number }> = {}
  const focus: Session[] = []
  const days: Progress['days'] = {}
  lastDays(42).forEach((d, i) => {
    const slept = [6, 7.5, 8, 5.5, 7, 8, 6.5][i % 7]
    const scr = [240, 150, 120, 300, 160, 110, 260][i % 7]
    const worked = i % 3 !== 0
    const mood = Math.max(1, Math.min(5, Math.round(2.2 + (slept >= 7 ? 1.1 : 0) + (scr <= 180 ? 0.6 : 0) + (worked ? 0.4 : 0))))
    checkins[d] = { mood, energy: 2, sleep: slept }
    screen[d] = { total: scr }
    if (worked) focus.push({ date: d, minutes: 50 })
    if (i % 5 !== 0) days[d] = { breath: 1, ...(i % 2 ? { move: 1 } : {}) }
    if (i === 3) sleepLog[d] = { bed: '23:30', wake: '07:00' }
  })
  const journal: Entry[] = [
    { date: addDays(todayKey(), -2), title: 'exam week', text: 'tired but finished the chapter. mom made rajma, small win. tomorrow revise maths early.' },
    { date: addDays(todayKey(), -6), text: 'walked with Riya after class, felt lighter. maths still scary but less than before.' },
  ]
  const lines: Rec<string> = { [addDays(todayKey(), -1)]: 'finished maths revision early, walked in the evening.' }
  const expenses: Expense[] = [
    { date: todayKey(), amt: 1240, cat: 'food' },
    { date: todayKey(), amt: 420, cat: 'travel' },
  ]
  return { checkins, sleepLog, screen, focus, days, journal, lines, expenses }
})()
