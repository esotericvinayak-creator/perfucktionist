// Kanak (कनक, "gold"): the premium section. Locked unless you have Plus, or you redeem an access code.
//
// The code is checked here, in the browser, so treat it as a promo code, not a secret: anyone who reads
// the bundle can find it. For codes that must stay private or run out, redeem them on the server instead.
import { useLocalState } from './storage'
import { usePlus } from './plus'

const CODES: Record<string, string> = { KANU: 'free access' }

type KanakState = { code?: string; at?: number }

export function useKanak() {
  const plus = usePlus()
  const [s, setS] = useLocalState<KanakState>('kanak', {})
  const viaCode = !!(s.code && CODES[s.code])
  return {
    unlocked: plus.active || viaCode,
    via: plus.active ? ('plus' as const) : viaCode ? ('code' as const) : null,
    /** Try a code. Case and spaces don't matter. Returns false if it isn't one. */
    redeem(input: string) {
      const code = input.trim().toUpperCase().replace(/\s+/g, '')
      if (!CODES[code]) return false
      setS({ code, at: Date.now() })
      return true
    },
    lock: () => setS({}),
  }
}
