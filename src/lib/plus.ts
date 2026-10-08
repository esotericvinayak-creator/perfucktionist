import { useSyncExternalStore } from 'react'

// perfucktionist+ membership. Two ways in:
//  - a free trial: one per device, TRIAL_DAYS long, no payment (stored here);
//  - a paid period: you pay by UPI, the payment is verified in the database, and `memberships`
//    says until when (src/lib/payments.ts copies that into `paidUntil`).
export const TRIAL_DAYS = 7
export const PRICES = { monthly: 49, yearly: 399 } as const
export type Plan = keyof typeof PRICES

type PlusState = { plan?: Plan; startedAt?: number; paidUntil?: number }

const KEY = 'pf:plus'
const DAY = 86_400_000
const listeners = new Set<() => void>()
let state: PlusState = load()

function load(): PlusState {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as PlusState
  } catch {
    return {}
  }
}

function set(next: PlusState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked — Plus lasts for this session only
  }
  listeners.forEach((l) => l())
}

export function plusStatus(s: PlusState = state) {
  const trialEnds = s.startedAt ? s.startedAt + TRIAL_DAYS * DAY : 0
  const trial = trialEnds > Date.now()
  const paid = (s.paidUntil ?? 0) > Date.now()
  const endsAt = Math.max(trial ? trialEnds : 0, paid ? (s.paidUntil ?? 0) : 0)
  return {
    active: trial || paid,
    /** Where it comes from: a paid period wins over a trial. */
    source: paid ? ('paid' as const) : trial ? ('trial' as const) : null,
    plan: s.plan,
    endsAt,
    daysLeft: trial || paid ? Math.ceil((endsAt - Date.now()) / DAY) : 0,
    /** The one free trial on this device is gone (running or finished). */
    trialUsed: !!s.startedAt,
  }
}

export const isPlus = () => plusStatus().active

export function startTrial(plan: Plan) {
  if (state.startedAt) return
  set({ ...state, plan, startedAt: Date.now() })
}

/** Ends the trial now. It stays used: a second one isn't available. A paid period is left alone. */
export function endTrial() {
  if (state.startedAt) set({ ...state, startedAt: Date.now() - TRIAL_DAYS * DAY - 1 })
}

/** What the database says about the signed-in account (0 = no paid period). */
export function setPaidUntil(until: number, plan?: Plan) {
  if ((state.paidUntil ?? 0) === until) return
  set({ ...state, paidUntil: until || undefined, plan: plan ?? state.plan })
}

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

export function usePlus() {
  const s = useSyncExternalStore(subscribe, () => state)
  return plusStatus(s)
}
