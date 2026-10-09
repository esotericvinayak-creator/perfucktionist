import { useState, type MouseEvent } from 'react'
import { CopyButton } from '../components/ui'
import { PlusBadge } from '../components/Overlays'
import { confetti } from '../lib/confetti'
import { cloud } from '../lib/auth'
import { detectPlatform } from '../lib/install'
import { submitPayment, upiLink, usePayments, UPI, type Payment } from '../lib/payments'
import { endTrial, PRICES, startTrial, TRIAL_DAYS, usePlus, type Plan } from '../lib/plus'
import { toast } from '../lib/toast'

// Four reasons, one line each. Everything else stays free.
const PERKS = [
  { emoji: '🧊', title: 'streak freezes', body: 'miss a day and Plus covers it, twice a month.' },
  { emoji: '🧭', title: 'full programs', body: 'every day of calm-7, brave-14, unperfect-21 and the Gita in 18.' },
  { emoji: '📈', title: 'see yourself change', body: 'mood and focus patterns, monthly Wrapped, timetable, speaking coach.' },
  { emoji: '✨', title: 'make it yours', body: 'pet outfits, story cards with no watermark, unlimited habits, decks and sounds.' },
]

const FREE = ['the daily 5 minutes, streaks and your pet', 'every scripture', 'all safety and SOS tools', 'almost every tool', 'music, breathing, everything else']

const dateOf = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const STATUS: Record<Payment['status'], string> = {
  pending: 'checking — usually within a day',
  verified: 'verified ✓',
  rejected: 'couldn’t match it — check the reference',
}

function PayPanel({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const [utr, setUtr] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const phone = ['android', 'ios'].includes(detectPlatform())

  const send = async () => {
    setBusy(true)
    setError('')
    const r = await submitPayment(plan, utr)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    toast({ icon: '✦', title: 'Got it', sub: 'we’ll check the payment and unlock Plus', tone: 'badge' })
    setUtr('')
    onDone()
  }

  return (
    <div className="pl-pay">
      <p className="pl-step">
        <b>1</b> pay ₹{PRICES[plan]} on UPI
      </p>
      <div className="pl-qr">
        <img src={UPI.qr} alt={`UPI QR code for ${UPI.id}`} width={200} height={246} />
        <div className="pl-upi">
          <span>or pay to this UPI ID</span>
          <b>{UPI.id}</b>
          <CopyButton text={UPI.id} label="copy UPI ID" />
          {phone && (
            <a className="btn btn-sm btn-primary a-violet" href={upiLink(plan)}>
              open my UPI app
            </a>
          )}
        </div>
      </div>
      <p className="pl-step">
        <b>2</b> paste the 12-digit reference
      </p>
      <p className="pl-fine left">in PhonePe: History → the payment → “UTR” or “Transaction ID”. Google Pay and Paytm call it the UPI reference number.</p>
      <div className="pl-ref">
        <input
          className="act-input"
          inputMode="numeric"
          autoComplete="off"
          placeholder="123456789012"
          value={utr}
          maxLength={14}
          onChange={(e) => setUtr(e.target.value.replace(/[^\d\s]/g, ''))}
          aria-label="UPI reference number"
        />
        <button type="button" className="btn btn-primary a-lime" disabled={busy || utr.replace(/\s/g, '').length !== 12} onClick={send}>
          {busy ? 'sending…' : 'I’ve paid'}
        </button>
      </div>
      {error && (
        <p className="pl-error" role="alert">
          {error}
        </p>
      )}
      {!cloud && <p className="pl-fine left">preview mode: payments need a real account, so nothing is saved here.</p>}
    </div>
  )
}

export default function Plus() {
  const plus = usePlus()
  const { payments, reload } = usePayments()
  const [plan, setPlan] = useState<Plan>('yearly')
  const [paying, setPaying] = useState(false)
  const perMonth = Math.round(PRICES.yearly / 12)
  const save = Math.round((1 - PRICES.yearly / (PRICES.monthly * 12)) * 100)
  const waiting = payments.filter((p) => p.status === 'pending')

  const trial = (e: MouseEvent<HTMLButtonElement>) => {
    startTrial(plan)
    const r = e.currentTarget.getBoundingClientRect()
    confetti(r.left + r.width / 2, r.top)
    toast({ icon: '✦', title: 'Welcome to Plus', sub: `${TRIAL_DAYS} days unlocked`, tone: 'badge' })
  }

  const plans = (
    <div className="pl-plans" role="radiogroup" aria-label="Billing">
      <button type="button" role="radio" aria-checked={plan === 'yearly'} className={`pl-plan${plan === 'yearly' ? ' on' : ''}`} onClick={() => setPlan('yearly')}>
        <span className="pl-tag">best · save {save}%</span>
        <b>
          ₹{perMonth}
          <small>/month</small>
        </b>
        <span>₹{PRICES.yearly} for a year</span>
      </button>
      <button type="button" role="radio" aria-checked={plan === 'monthly'} className={`pl-plan${plan === 'monthly' ? ' on' : ''}`} onClick={() => setPlan('monthly')}>
        <b>
          ₹{PRICES.monthly}
          <small>/month</small>
        </b>
        <span>pay each month</span>
      </button>
    </div>
  )

  return (
    <div className="page plus-page pl">
      <header className="pl-top">
        <PlusBadge />
        <h1 className="pl-h">
          less perfect. <span className="serif">more you.</span>
        </h1>
      </header>

      <section className="pl-card" aria-label="Plus plans">
        {plus.source === 'paid' && (
          <div className="pl-on">
            <b>✦ you’re on Plus</b>
            <span>
              until {dateOf(plus.endsAt)} ({plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'}). thank you for backing this.
            </span>
            <a className="btn btn-primary a-lime" href="#/">
              back to today
            </a>
          </div>
        )}

        {plus.source === 'trial' && (
          <div className="pl-on">
            <b>✦ free trial · {plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left</b>
            <span>when it ends you go back to free. nothing you made is deleted.</span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={endTrial}>
              end trial
            </button>
          </div>
        )}

        {plus.source !== 'paid' && (
          <>
            {plans}
            {!paying && (
              <>
                {plus.source === null && !plus.trialUsed && (
                  <button type="button" className="btn btn-primary a-lime big-cta" onClick={trial}>
                    try free for {TRIAL_DAYS} days ✦
                  </button>
                )}
                <button type="button" className={`btn big-cta${plus.source === null && !plus.trialUsed ? ' btn-ghost' : ' btn-primary a-lime'}`} onClick={() => setPaying(true)}>
                  {plus.source === 'trial' ? 'keep Plus' : plus.trialUsed ? 'get Plus' : 'or get Plus now'} · ₹{PRICES[plan]} by UPI
                </button>
                <p className="pl-fine">
                  {plus.source === null && !plus.trialUsed ? `the trial needs no payment. after ${TRIAL_DAYS} days you simply go back to free.` : 'pay with any UPI app. no card, no auto-renew.'}
                </p>
              </>
            )}
            {paying && (
              <>
                <PayPanel plan={plan} onDone={() => (setPaying(false), void reload())} />
                <button type="button" className="linkish muted" onClick={() => setPaying(false)}>
                  ← back
                </button>
              </>
            )}
          </>
        )}
      </section>

      {payments.length > 0 && (
        <section className="pl-history" aria-label="Your payments">
          <p className="kicker">your payments</p>
          <ul>
            {payments.map((p) => (
              <li key={p.id} className={p.status}>
                <span>
                  ₹{p.amount} · {p.plan} · ref …{p.utr.slice(-4)}
                </span>
                <small>{STATUS[p.status]}</small>
              </li>
            ))}
          </ul>
          {waiting.length > 0 && (
            <button type="button" className="linkish muted" onClick={() => void reload()}>
              check again
            </button>
          )}
        </section>
      )}

      <ul className="pl-perks">
        {PERKS.map((r) => (
          <li key={r.title}>
            <span className="pl-ic" aria-hidden="true">
              {r.emoji}
            </span>
            <span>
              <b>{r.title}</b>
              <small>{r.body}</small>
            </span>
          </li>
        ))}
      </ul>

      <details className="fold">
        <summary>
          <span>always free, for everyone</span>
          <small>safety, scripture, the daily 5</small>
        </summary>
        <ul className="fold-body pl-free">
          {FREE.map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
