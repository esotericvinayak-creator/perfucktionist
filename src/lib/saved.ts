// What you've saved so far. All of this stays on the device.
import type { Answers } from '../data/claims'
import { useLocalState } from './storage'

export type SavedClaim = {
  id: string
  type: string
  answers: Answers
  /** The day you started: the deadlines count from here. */
  started: string
  status: 'open' | 'won'
  recovered: number
}

export type Cancelled = { key: string; name: string; monthly: number }

export const useClaims = () => useLocalState<SavedClaim[]>('claims', [])
export const useCancelled = () => useLocalState<Cancelled[]>('leak:cancelled', [])
/** Things Leak Check found that you said are fine, like rent. */
export const useFine = () => useLocalState<string[]>('leak:fine', [])
