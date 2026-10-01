import { useSyncExternalStore } from 'react'

// perfucktionist+ membership. Payments aren't wired up yet, so "starting a trial" unlocks Plus
// on this device for TRIAL_DAYS. Swap startTrial() for a real checkout (Razorpay / Stripe) later.
export const TRIAL_DAYS = 7
export const PRICES = { monthly: 49, yearly: 399 } as const
export type Plan = keyof typeof PRICES

type PlusState = { plan?: Plan; startedAt?: number }

const KEY = 'pf:plus'
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
  const endsAt = s.startedAt ? s.startedAt + TRIAL_DAYS * 86_400_000 : 0
  const active = endsAt > Date.now()
  return { active, plan: s.plan, daysLeft: active ? Math.ceil((endsAt - Date.now()) / 86_400_000) : 0 }
}

export const isPlus = () => plusStatus().active

export function startTrial(plan: Plan) {
  set({ plan, startedAt: Date.now() })
}

export function endPlus() {
  set({})
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
