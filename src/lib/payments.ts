// Paying for Plus by UPI, and finding out it worked.
//
// The flow: pay the UPI ID below (QR or app link) → send the 12-digit reference from the receipt →
// it's saved as a pending row in `payments` → you check it against your PhonePe history and run
// `npm run pay -- verify <reference>` → the person's `memberships` row says until when → this file
// copies that into plus.ts so the app unlocks. See supabase/migrations/…_plus_payments.sql.
import { useCallback, useEffect, useState } from 'react'
import { client, cloud, onAuthChange, authNow, useAuth, type Result } from './auth'
import { PRICES, setPaidUntil, type Plan } from './plus'

/** Where the money goes. Public on purpose: it's what the QR code shows. */
export const UPI = { id: 'techievinayak.wallet@phonepe', name: 'perfucktionist', qr: `${import.meta.env.BASE_URL}pay/phonepe-qr.png` } as const

/** `upi://pay` opens the person's UPI app with the amount filled in. Works on phones; desktops use the QR. */
export const upiLink = (plan: Plan) =>
  `upi://pay?pa=${encodeURIComponent(UPI.id)}&pn=${encodeURIComponent(UPI.name)}&am=${PRICES[plan]}.00&cu=INR&tn=${encodeURIComponent(`perfucktionist Plus ${plan}`)}`

export type Payment = { id: string; plan: Plan; amount: number; utr: string; status: 'pending' | 'verified' | 'rejected'; created_at: string }

const messages: Record<string, string> = {
  '23505': 'That reference was already sent. If it was you, it’s waiting to be checked.',
  '23514': 'That reference doesn’t look right. It’s 12 digits, on your payment receipt.',
  '53400': 'You already have 5 payments waiting. Give us a little time to check them.',
  '42P01': 'Payments aren’t switched on for this app yet.',
  PGRST205: 'Payments aren’t switched on for this app yet.',
}

/** Save "I paid" for the signed-in account. The amount is the plan's price, and the database checks it. */
export async function submitPayment(plan: Plan, utr: string): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Payments need a real account. This is a preview, so nothing is saved.' }
  const clean = utr.replace(/\s/g, '')
  if (!/^\d{12}$/.test(clean)) return { ok: false, error: 'That reference doesn’t look right. It’s 12 digits, on your payment receipt.' }
  const c = await client()
  const { error } = await c.from('payments').insert({ plan, amount: PRICES[plan], utr: clean })
  if (error) return { ok: false, error: messages[error.code] ?? 'Couldn’t save that. Check your connection and try again.' }
  void refreshMembership()
  return { ok: true }
}

/** Ask the database who has Plus until when, and tell plus.ts. Quietly does nothing when offline or logged out. */
export async function refreshMembership() {
  const u = authNow()
  if (!cloud || u.status !== 'in') return
  try {
    const c = await client()
    const { data, error } = await c.from('memberships').select('plan, until').maybeSingle()
    if (error) return // table missing or offline: keep what we have
    setPaidUntil(data ? new Date(data.until as string).getTime() : 0, (data?.plan as Plan | undefined) ?? undefined)
  } catch {
    // offline: keep what we have
  }
}

if (typeof window !== 'undefined') {
  // Checked at every login and whenever the app comes back to the foreground.
  onAuthChange(() => {
    // Paid time belongs to an account: signing out takes it off this device, signing in brings it back.
    if (authNow().status === 'out' && cloud) setPaidUntil(0)
    void refreshMembership()
  })
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void refreshMembership())
}

/** The signed-in person's payments, newest first, re-read whenever you ask (or a membership changes). */
export function usePayments() {
  const auth = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(cloud)
  const load = useCallback(async () => {
    if (!cloud || auth.status !== 'in') {
      setLoading(false)
      return
    }
    try {
      const c = await client()
      const { data } = await c.from('payments').select('id, plan, amount, utr, status, created_at').order('created_at', { ascending: false })
      setPayments((data as Payment[] | null) ?? [])
    } finally {
      setLoading(false)
    }
    void refreshMembership()
  }, [auth.status])
  useEffect(() => {
    void load()
  }, [load])
  return { payments, loading, reload: load }
}
