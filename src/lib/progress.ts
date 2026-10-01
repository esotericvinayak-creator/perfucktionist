import { useSyncExternalStore } from 'react'
import { journeys } from '../data/journeys'
import { isPlus } from './plus'
import { todayKey } from './storage'
import { toast } from './toast'

// The glow-up engine: streaks, XP, levels, badges. Everything lives on this device.

export type Activity = 'breath' | 'verse' | 'dare' | 'gratitude' | 'pop' | 'yeet' | 'music' | 'tree' | 'journey' | 'checklist' | 'focus' | 'move' | 'journal' | 'habit' | 'tool'

/** The daily 4. Any one keeps your streak alive — we're not perfectionists here. */
export const RITUAL: { kind: Activity; emoji: string; label: string; how: string; path: string }[] = [
  { kind: 'breath', emoji: '🫁', label: 'Breathe', how: 'one round with the orb', path: '/breathe' },
  { kind: 'verse', emoji: '📖', label: 'Read', how: 'one verse, any faith', path: '/library' },
  { kind: 'dare', emoji: '🦁', label: 'Be brave', how: 'do one dare', path: '/brave' },
  { kind: 'gratitude', emoji: '🙏', label: 'Be grateful', how: 'one note in the jar', path: '/happy' },
]

const XP: Record<Activity, { xp: number; dailyCap: number; label: string }> = {
  breath: { xp: 20, dailyCap: 60, label: 'breathing' },
  verse: { xp: 10, dailyCap: 50, label: 'reading' },
  dare: { xp: 25, dailyCap: 75, label: 'being brave' },
  gratitude: { xp: 10, dailyCap: 30, label: 'gratitude' },
  pop: { xp: 1, dailyCap: 20, label: 'popping' },
  yeet: { xp: 5, dailyCap: 15, label: 'yeeting stress' },
  music: { xp: 2, dailyCap: 10, label: 'vibing' },
  tree: { xp: 2, dailyCap: 10, label: 'watering' },
  journey: { xp: 40, dailyCap: 40, label: 'your journey' },
  checklist: { xp: 5, dailyCap: 40, label: 'your checklist' },
  focus: { xp: 25, dailyCap: 100, label: 'deep focus' },
  move: { xp: 25, dailyCap: 50, label: 'moving your body' },
  journal: { xp: 10, dailyCap: 30, label: 'journaling' },
  habit: { xp: 5, dailyCap: 30, label: 'your habits' },
  tool: { xp: 5, dailyCap: 40, label: 'taking care of you' },
}

export const LEVELS = [
  { xp: 0, name: 'Seed', emoji: '🌰' },
  { xp: 60, name: 'Sprout', emoji: '🌱' },
  { xp: 180, name: 'Sapling', emoji: '🌿' },
  { xp: 400, name: 'Young tree', emoji: '🪴' },
  { xp: 750, name: 'Tree', emoji: '🌳' },
  { xp: 1250, name: 'Big tree', emoji: '🌳' },
  { xp: 2000, name: 'Banyan', emoji: '🌳' },
  { xp: 3000, name: 'Grove', emoji: '🌳' },
  { xp: 4500, name: 'Forest', emoji: '🌳' },
  { xp: 6500, name: 'Bodhi', emoji: '🌳' },
]

/** Plus cosmetic: what your companion turns into once it's a tree. */
export const SKINS = [
  { id: 'classic', emoji: '🌳', name: 'Classic', plus: false },
  { id: 'sakura', emoji: '🌸', name: 'Sakura', plus: true },
  { id: 'palm', emoji: '🌴', name: 'Beach palm', plus: true },
  { id: 'cactus', emoji: '🌵', name: 'Desert cactus', plus: true },
  { id: 'bamboo', emoji: '🎋', name: 'Bamboo', plus: true },
  { id: 'lotus', emoji: '🪷', name: 'Lotus', plus: true },
  { id: 'pine', emoji: '🌲', name: 'Mountain pine', plus: true },
  { id: 'mushroom', emoji: '🍄', name: 'Goblincore', plus: true },
]

export type Progress = {
  name: string
  pet: string
  skin: string
  xp: number
  days: Record<string, Partial<Record<Activity, number>>>
  dayXp: Record<string, Partial<Record<Activity, number>>>
  totals: Partial<Record<Activity, number>>
  books: string[]
  badges: Record<string, string>
  freezes: string[]
  journeys: Record<string, { startedAt: string; done: Record<number, string> }>
  goals: string[]
  onboarded: boolean
}

const KEY = 'pf:progress'
const empty: Progress = { name: '', pet: 'Bodhi', skin: 'classic', xp: 0, days: {}, dayXp: {}, totals: {}, books: [], badges: {}, freezes: [], journeys: {}, goals: [], onboarded: false }
const listeners = new Set<() => void>()
let state: Progress = load()

function load(): Progress {
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Progress>) }
  } catch {
    return { ...empty }
  }
}

function commit(next: Progress) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked — progress lasts for this session only
  }
  listeners.forEach((l) => l())
}

// Keep tabs in sync: another tab logging a breath shouldn't get overwritten by this one.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    listeners.forEach((l) => l())
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state)
}

export function update(fn: (p: Progress) => Partial<Progress>) {
  commit({ ...state, ...fn(state) })
}

// ─── date helpers ─────────────────────────────────────────────
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function shift(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + days))
}

export const showedUp = (p: Progress, key: string) => RITUAL.some((r) => (p.days[key]?.[r.kind] ?? 0) > 0) || p.freezes.includes(key)

export function streakOf(p: Progress) {
  const today = todayKey()
  let cursor = showedUp(p, today) ? today : shift(today, -1)
  let n = 0
  while (showedUp(p, cursor)) {
    n++
    cursor = shift(cursor, -1)
  }
  return n
}

export function levelOf(xp: number) {
  let i = 0
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++
  const cur = LEVELS[i]
  const next = LEVELS[i + 1]
  return { index: i, level: i + 1, ...cur, next, progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 }
}

/** Your buddy: a seed that grows into a tree (or a Plus skin) as you level up. */
export function buddyEmoji(p: Progress) {
  const level = levelOf(p.xp).level
  const stages = ['🌰', '🌱', '🌿', '🪴']
  if (level <= stages.length) return stages[level - 1]
  return SKINS.find((s) => s.id === p.skin)?.emoji ?? '🌳'
}

export const ritualToday = (p: Progress) => RITUAL.filter((r) => (p.days[todayKey()]?.[r.kind] ?? 0) > 0).map((r) => r.kind)

// ─── badges ───────────────────────────────────────────────────
export const BADGES: { id: string; emoji: string; name: string; how: string; test: (p: Progress, streak: number) => boolean }[] = [
  { id: 'first-breath', emoji: '🫁', name: 'First breath', how: 'Finish a breathing round', test: (p) => (p.totals.breath ?? 0) >= 1 },
  { id: 'full-send', emoji: '✨', name: 'Full send', how: 'Do all 4 rituals in one day', test: (p) => ritualToday(p).length === RITUAL.length },
  { id: 'streak-3', emoji: '🔥', name: 'Warming up', how: '3-day streak', test: (_, s) => s >= 3 },
  { id: 'streak-7', emoji: '⚡', name: 'One whole week', how: '7-day streak', test: (_, s) => s >= 7 },
  { id: 'streak-30', emoji: '👑', name: 'Unstoppable', how: '30-day streak', test: (_, s) => s >= 30 },
  { id: 'streak-100', emoji: '💎', name: 'Main character', how: '100-day streak', test: (_, s) => s >= 100 },
  { id: 'reader', emoji: '📖', name: 'Bookworm', how: 'Read 25 times', test: (p) => (p.totals.verse ?? 0) >= 25 },
  { id: 'world', emoji: '🌍', name: 'World citizen', how: 'Read from all 6 scriptures', test: (p) => p.books.length >= 6 },
  { id: 'brave-10', emoji: '🦁', name: 'Brave af', how: 'Complete 10 dares', test: (p) => (p.totals.dare ?? 0) >= 10 },
  { id: 'grateful-10', emoji: '🙏', name: 'Grateful', how: '10 gratitude notes', test: (p) => (p.totals.gratitude ?? 0) >= 10 },
  { id: 'pops-500', emoji: '🫧', name: 'Pop star', how: 'Pop 500 bubbles', test: (p) => (p.totals.pop ?? 0) >= 500 },
  { id: 'finisher', emoji: '🧭', name: 'Finisher', how: 'Complete a journey', test: (p) => journeys.some((j) => Object.keys(p.journeys[j.id]?.done ?? {}).length >= j.days.length) },
  { id: 'tree-mode', emoji: '🌳', name: 'Tree mode', how: 'Reach level 5', test: (p) => levelOf(p.xp).level >= 5 },
]

function awardBadges(p: Progress): Progress {
  const streak = streakOf(p)
  const fresh = BADGES.filter((b) => !p.badges[b.id] && b.test(p, streak))
  if (!fresh.length) return p
  const badges = { ...p.badges }
  for (const b of fresh) {
    badges[b.id] = todayKey()
    toast({ icon: b.emoji, title: `Badge unlocked: ${b.name}`, sub: b.how, tone: 'badge' })
  }
  return { ...p, badges }
}

// ─── logging ──────────────────────────────────────────────────
type LogOptions = { book?: string; silent?: boolean }

export function log(kind: Activity, opts: LogOptions = {}) {
  const day = todayKey()
  const before = state
  const wasShowedUp = showedUp(before, day)
  const gainedToday = before.dayXp[day]?.[kind] ?? 0
  const gain = Math.max(0, Math.min(XP[kind].xp, XP[kind].dailyCap - gainedToday))

  let next: Progress = {
    ...before,
    xp: before.xp + gain,
    days: { ...before.days, [day]: { ...before.days[day], [kind]: (before.days[day]?.[kind] ?? 0) + 1 } },
    dayXp: { ...before.dayXp, [day]: { ...before.dayXp[day], [kind]: gainedToday + gain } },
    totals: { ...before.totals, [kind]: (before.totals[kind] ?? 0) + 1 },
    books: opts.book && !before.books.includes(opts.book) ? [...before.books, opts.book] : before.books,
  }

  const lvlBefore = levelOf(before.xp)
  const lvlAfter = levelOf(next.xp)
  if (!opts.silent && gain >= 10) toast({ icon: '✶', title: `+${gain} XP`, sub: XP[kind].label, tone: 'xp' })
  if (!opts.silent && !wasShowedUp && showedUp(next, day)) toast({ icon: '🔥', title: `${streakOf(next)}-day streak`, sub: 'you showed up. that’s the whole thing.', tone: 'streak' })
  if (lvlAfter.level > lvlBefore.level) toast({ icon: lvlAfter.emoji, title: `Level ${lvlAfter.level}: ${lvlAfter.name}`, sub: 'your companion grew!', tone: 'badge' })

  next = awardBadges(next)
  commit(next)
}

/** Plus perk: up to 2 streak freezes a month quietly cover a missed day. */
export function applyStreakFreeze() {
  if (!isPlus()) return
  const today = todayKey()
  const yesterday = shift(today, -1)
  const dayBefore = shift(today, -2)
  if (showedUp(state, yesterday) || !showedUp(state, dayBefore)) return
  const month = today.slice(0, 7)
  if (state.freezes.filter((d) => d.startsWith(month)).length >= 2) return
  commit({ ...state, freezes: [...state.freezes, yesterday] })
  toast({ icon: '🧊', title: 'Streak freeze used', sub: 'you missed yesterday — Plus saved your streak', tone: 'info' })
}

export function journeyComplete(id: string, day: number) {
  update((p) => {
    const j = p.journeys[id] ?? { startedAt: todayKey(), done: {} }
    return { journeys: { ...p.journeys, [id]: { ...j, done: { ...j.done, [day]: todayKey() } } } }
  })
  log('journey')
}

export function monthStats(p: Progress, month = todayKey().slice(0, 7)) {
  const days = Object.entries(p.days).filter(([d]) => d.startsWith(month))
  const sum = (k: Activity) => days.reduce((s, [, v]) => s + (v[k] ?? 0), 0)
  const active = days.filter(([d]) => showedUp(p, d)).length
  const counts = RITUAL.map((r) => ({ ...r, count: sum(r.kind) })).sort((a, b) => b.count - a.count)
  return { month, activeDays: active, breaths: sum('breath'), verses: sum('verse'), dares: sum('dare'), gratitude: sum('gratitude'), pops: sum('pop'), top: counts[0] }
}
