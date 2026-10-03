// Cloud sync: the parts of you that should follow you to a new phone.
//
// What syncs: streak, XP and badges, saved books, liked songs, practice scores and a few
// preferences — the keys in SYNCED. Nothing else leaves the device. Journal, cycle tracker,
// money, check-ins and every other tool stay local, and the database refuses any other key.
// Gender and faith are taken out of progress before upload too: they only change the order
// we show things in, so they stay on the phone.
//
// How: one row per key in public.user_state (supabase/migrations). The server stamps every
// write, so a phone with the wrong time can't win or lose. Each key remembers the server time
// it last matched and whether it has unsent edits:
//   cloud changed, phone didn't  → take the cloud copy
//   phone changed, cloud didn't  → upload
//   both changed, or the first login on a phone that was already in use → merge, then upload
// Merges only add (books joined, the higher score kept), so nothing you earned gets lost.
import { useSyncExternalStore } from 'react'
import type { Progress } from './progress'
import { authNow, beforeLogOut, client, cloud, onAccountDeleted, onAuthChange } from './auth'
import { onEdit, peek, replace } from './storage'

// ─── what syncs, and how two copies combine ───────────────────
type Rec<T> = Record<string, T>

/** Lists of things with an id: keep this phone's order, add what only the cloud has. */
const joinById =
  (cap: number) =>
  (mine: unknown, theirs: unknown): unknown[] => {
    const a = Array.isArray(mine) ? (mine as { id?: string }[]) : []
    const b = Array.isArray(theirs) ? (theirs as { id?: string }[]) : []
    const have = new Set(a.map((x) => x?.id))
    return [...a, ...b.filter((x) => !have.has(x?.id))].slice(0, cap)
  }

const higher = (a: Rec<number> = {}, b: Rec<number> = {}) => {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v ?? 0)
  return out
}
const higherByDay = (a: Rec<Rec<number>> = {}, b: Rec<Rec<number>> = {}) => {
  const out = { ...a }
  for (const [day, counts] of Object.entries(b)) out[day] = higher(out[day], counts)
  return out
}
const both = <T>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])]

/** Two progress records → one, without losing a streak day, XP, badge or journey step from either. */
function mergeProgress(mine: Partial<Progress>, theirs: Partial<Progress>): Partial<Progress> {
  const dayXp = higherByDay(mine.dayXp as Rec<Rec<number>>, theirs.dayXp as Rec<Rec<number>>)
  const earned = Object.values(dayXp).reduce((sum, day) => sum + Object.values(day).reduce((s, n) => s + n, 0), 0)
  const badges = { ...theirs.badges }
  for (const [id, at] of Object.entries(mine.badges ?? {})) if (!badges[id] || at < badges[id]) badges[id] = at
  const journeys = { ...theirs.journeys }
  for (const [id, j] of Object.entries(mine.journeys ?? {})) {
    const other = journeys[id]
    journeys[id] = other ? { startedAt: other.startedAt < j.startedAt ? other.startedAt : j.startedAt, done: { ...other.done, ...j.done } } : j
  }
  return {
    ...theirs,
    ...mine,
    name: mine.name || theirs.name || '',
    pet: mine.pet || theirs.pet || '',
    petType: mine.petType || theirs.petType || '',
    skin: mine.skin && mine.skin !== 'classic' ? mine.skin : (theirs.skin ?? mine.skin),
    petHat: mine.petHat && mine.petHat !== 'none' ? mine.petHat : (theirs.petHat ?? mine.petHat),
    goals: mine.goals?.length ? mine.goals : (theirs.goals ?? []),
    onboarded: !!(mine.onboarded || theirs.onboarded),
    xp: Math.max(mine.xp ?? 0, theirs.xp ?? 0, earned),
    days: higherByDay(mine.days as Rec<Rec<number>>, theirs.days as Rec<Rec<number>>),
    dayXp,
    totals: higher(mine.totals as Rec<number>, theirs.totals as Rec<number>),
    books: both(mine.books, theirs.books),
    freezes: both(mine.freezes, theirs.freezes),
    badges,
    journeys,
  }
}

/** Never uploaded: they only reorder suggestions. */
const LOCAL_ONLY = ['gender', 'genderSelf', 'faith'] as const
const withoutLocalOnly = (p: Rec<unknown>) => Object.fromEntries(Object.entries(p).filter(([k]) => !(LOCAL_ONLY as readonly string[]).includes(k)))
const keepLocalOnly = (cloudCopy: Rec<unknown>, mine: Rec<unknown> | undefined) => {
  const out = { ...cloudCopy }
  for (const k of LOCAL_ONLY) if (mine?.[k] !== undefined) out[k] = mine[k]
  return out
}

type Practice = Rec<{ done: number; right: number }>
function mergePractice(mine: Practice = {}, theirs: Practice = {}) {
  const out = { ...theirs }
  for (const [subject, s] of Object.entries(mine)) {
    const o = out[subject]
    out[subject] = o ? { done: Math.max(o.done, s.done), right: Math.max(o.right, s.right) } : s
  }
  return out
}

type Rule = {
  /** Both copies changed: combine them. Preferences just keep this phone's choice. */
  merge: (mine: never, theirs: never) => unknown
  /** What actually goes up. */
  up?: (value: never) => unknown
  /** Cloud copy → what we store, given what's on the phone now. */
  down?: (cloudCopy: never, mine: never) => unknown
}
const keepMine = (mine: unknown) => mine

/** Keep in step with the key check in supabase/migrations/*_user_state.sql. */
const SYNCED: Rec<Rule> = {
  progress: { merge: mergeProgress, up: withoutLocalOnly, down: keepLocalOnly },
  shelf: { merge: joinById(200) },
  liked: { merge: joinById(100) },
  practice: { merge: mergePractice },
  theme: { merge: keepMine },
  'reader-lang': { merge: keepMine },
  'school-class': { merge: keepMine },
  'school-lang': { merge: keepMine },
  'tool-pins': { merge: keepMine },
}
const KEYS = Object.keys(SYNCED)
const up = (key: string, v: unknown) => (SYNCED[key].up ? SYNCED[key].up(v as never) : v)
const down = (key: string, cloudCopy: unknown, mine: unknown) => (SYNCED[key].down ? SYNCED[key].down(cloudCopy as never, mine as never) : cloudCopy)

// ─── bookkeeping (pf:sync, never synced itself) ───────────────
type Meta = { user?: string; keys: Rec<{ synced: string | null; dirty: boolean }> }
const META = 'pf:sync'
function readMeta(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem(META) ?? '{}') as Partial<Meta>
    return { user: m.user, keys: m.keys ?? {} }
  } catch {
    return { keys: {} }
  }
}
function saveMeta(m: Meta) {
  try {
    localStorage.setItem(META, JSON.stringify(m))
  } catch {
    // storage blocked: nothing is stored locally either, so there's nothing to sync
  }
}

// ─── status, for the Me page and the first-login splash ───────
export type SyncState = 'off' | 'syncing' | 'synced' | 'offline' | 'error'
type Status = { state: SyncState; at: number | null; ready: boolean }
let status: Status = { state: 'off', at: null, ready: true }
const subs = new Set<() => void>()
function setStatus(next: Partial<Status>) {
  status = { ...status, ...next }
  subs.forEach((l) => l())
}
export const useSync = () =>
  useSyncExternalStore(
    (l) => {
      subs.add(l)
      return () => subs.delete(l)
    },
    () => status,
  )

// ─── the engine ───────────────────────────────────────────────
let user: string | null = null
/** The account whose cloud copy has been read this session. Nothing uploads before that. */
let pulledFor: string | null = null
let lastPull = 0
let timer: ReturnType<typeof setTimeout> | undefined
const version: Rec<number> = {}

// One job at a time, so an upload never races a download.
let queue: Promise<void> = Promise.resolve()
const serial = (job: () => Promise<void>) => (queue = queue.then(job).catch((e: unknown) => failed(e)))

function failed(e: unknown) {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String(e.message) : String(e)
  const offline = (typeof navigator !== 'undefined' && !navigator.onLine) || /fetch|network|load failed/i.test(msg)
  setStatus({ state: offline ? 'offline' : 'error' })
  if (!offline) console.warn('[sync]', msg, /user_state|schema cache|PGRST2/i.test(msg) ? '— has the migration been applied? npm run db:push' : '')
}

async function pull() {
  const me = user
  if (!me) return
  setStatus({ state: 'syncing' })
  const sb = await client()
  const { data, error } = await sb.from('user_state').select('key, value, updated_at')
  if (user !== me) return
  if (error) return failed(error)
  lastPull = Date.now()

  const remote = new Map((data as { key: string; value: unknown; updated_at: string }[]).map((r) => [r.key, r]))
  const meta = readMeta()
  for (const key of KEYS) {
    const theirs = remote.get(key)
    const m = meta.keys[key] ?? { synced: null, dirty: false }
    const mine = peek(key)
    // Data that was here before this phone ever synced counts as a change too.
    const changedHere = mine !== undefined && (m.dirty || m.synced === null)
    if (!theirs) {
      if (changedHere) meta.keys[key] = { synced: null, dirty: true }
      continue
    }
    if (theirs.updated_at === m.synced) continue // cloud unchanged; any edit here uploads below
    if (!changedHere) {
      replace(key, down(key, theirs.value, mine))
      meta.keys[key] = { synced: theirs.updated_at, dirty: false }
    } else {
      replace(key, SYNCED[key].merge(mine as never, down(key, theirs.value, mine) as never))
      meta.keys[key] = { synced: theirs.updated_at, dirty: true }
    }
  }
  saveMeta(meta)
  pulledFor = me
  await push()
  if (status.state === 'syncing') setStatus({ state: 'synced', at: Date.now() })
}

async function push() {
  const me = user
  if (!me) return
  if (pulledFor !== me) return pull() // first read the cloud copy, so we merge instead of overwrite
  const meta = readMeta()
  const keys = KEYS.filter((k) => meta.keys[k]?.dirty && peek(k) !== undefined)
  if (!keys.length) return
  const sent = Object.fromEntries(keys.map((k) => [k, version[k] ?? 0]))
  setStatus({ state: 'syncing' })
  const sb = await client()
  const rows = keys.map((key) => ({ user_id: me, key, value: up(key, peek(key)) }))
  const { data, error } = await sb.from('user_state').upsert(rows, { onConflict: 'user_id,key' }).select('key, updated_at')
  if (user !== me) return
  if (error) return failed(error)
  const after = readMeta() // edits may have landed while this was in flight
  for (const row of data as { key: string; updated_at: string }[]) after.keys[row.key] = { synced: row.updated_at, dirty: (version[row.key] ?? 0) !== sent[row.key] }
  saveMeta(after)
  setStatus({ state: 'synced', at: Date.now() })
  if (keys.some((k) => after.keys[k]?.dirty)) schedule()
}

function schedule(ms = 1500) {
  clearTimeout(timer)
  timer = setTimeout(() => void serial(push), ms)
}

function start(id: string) {
  const meta = readMeta()
  if (meta.user !== id) {
    // Someone else used this phone before: their synced data is safe in their account and
    // must not merge into this one. (A phone that was never linked keeps its data and merges.)
    if (meta.user) for (const key of KEYS) replace(key, undefined)
    saveMeta({ user: id, keys: meta.user ? {} : meta.keys })
    // First login on this phone: hold the splash until the cloud copy lands, so a returning
    // person doesn't see onboarding again. Never longer than a few seconds.
    setStatus({ ready: false })
    setTimeout(() => setStatus({ ready: true }), 6000)
  }
  void serial(pull).then(() => setStatus({ ready: true }))
}

function follow() {
  const s = authNow()
  const id = cloud && s.status === 'in' && s.user ? s.user.id : null
  if (id === user) return
  user = id
  pulledFor = null
  clearTimeout(timer)
  if (id) start(id)
  else setStatus({ state: 'off', ready: true })
}

if (cloud && typeof window !== 'undefined') {
  onEdit((key) => {
    if (!(key in SYNCED)) return
    version[key] = (version[key] ?? 0) + 1
    const meta = readMeta()
    meta.keys[key] = { synced: meta.keys[key]?.synced ?? null, dirty: true }
    saveMeta(meta)
    if (user) schedule()
  })
  onAuthChange(follow)
  follow()

  // Upload before the app goes to the background; check for news when it comes back.
  document.addEventListener('visibilitychange', () => {
    if (!user) return
    if (document.visibilityState === 'hidden') {
      clearTimeout(timer)
      void serial(push)
    } else if (Date.now() - lastPull > 30_000) void serial(pull)
  })
  window.addEventListener('online', () => user && void serial(pull))

  beforeLogOut(async () => {
    clearTimeout(timer)
    await serial(push)
  })
  // A deleted account's data is gone; whatever is left on this phone can join the next account.
  onAccountDeleted(() => saveMeta({ keys: {} }))
}
