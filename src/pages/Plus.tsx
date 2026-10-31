// The pass: one thing to buy. Scam Check and Get It Back stay free.
import { useState } from 'react'
import { CopyButton } from '../components/ui'
import { cloud, useAuth } from '../lib/auth'
import { detectPlatform } from '../lib/install'
import { submitPayment, upiLink, usePayments, UPI, type Payment } from '../lib/payments'
import { endTrial, PRICES, usePlus, type Plan } from '../lib/plus'
import { toast } from '../lib/toast'

const PERKS = ['every leak in your statement, not just the top three', 'how to stop each one', 'double payments you can claim back', 'one easy change that saves the most']

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
    toast({ icon: '✦', title: 'Got it', sub: 'we’ll check the payment and unlock your pass', tone: 'badge' })
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
        <input className="act-input" inputMode="numeric" autoComplete="off" placeholder="123456789012" value={utr} maxLength={14} onChange={(e) => setUtr(e.target.value.replace(/[^\d\s]/g, ''))} aria-label="UPI reference number" />
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
  const auth = useAuth()
  const { payments, reload } = usePayments()
  const [plan, setPlan] = useState<Plan>('monthly')
  const [paying, setPaying] = useState(false)
  const waiting = payments.filter((p) => p.status === 'pending')
  const signedIn = auth.status === 'in'

  return (
    <div className="page plus-page pl">
      <header className="pl-top">
        <p className="kicker">the pass</p>
        <h1 className="pl-h">
          See every leak. <span className="serif">Keep your money.</span>
        </h1>
      </header>

      <section className="pl-card" aria-label="The pass">
        {plus.source === 'paid' && (
          <div className="pl-on">
            <b>✦ your pass is active</b>
            <span>
              until {dateOf(plus.endsAt)} ({plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'}). thank you for backing this.
            </span>
            <a className="btn btn-primary a-sun" href="#/leak">
              open Leak Check
            </a>
          </div>
        )}

        {plus.source === 'trial' && (
          <div className="pl-on">
            <b>✦ free trial · {plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left</b>
            <button type="button" className="btn btn-sm btn-ghost" onClick={endTrial}>
              end trial
            </button>
          </div>
        )}

        {plus.source !== 'paid' && !paying && (
          <>
            <ul className="pl-perks">
              {PERKS.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
            <div className="pl-plans" role="radiogroup" aria-label="Choose your pass">
              <button type="button" role="radio" aria-checked={plan === 'monthly'} className={`pl-plan${plan === 'monthly' ? ' on' : ''}`} onClick={() => setPlan('monthly')}>
                <b>₹{PRICES.monthly}</b>
                <span>for a month</span>
              </button>
              <button type="button" role="radio" aria-checked={plan === 'yearly'} className={`pl-plan${plan === 'yearly' ? ' on' : ''}`} onClick={() => setPlan('yearly')}>
                <b>₹{PRICES.yearly}</b>
                <span>for a year</span>
              </button>
            </div>
            {signedIn || !cloud ? (
              <button type="button" className="btn btn-primary a-sun big-cta" onClick={() => setPaying(true)}>
                get the pass · ₹{PRICES[plan]} by UPI
              </button>
            ) : (
              <a className="btn btn-primary a-sun big-cta" href="#/login?next=/plus">
                log in to get the pass
              </a>
            )}
            <p className="pl-fine">pay once with any UPI app. no card, no auto-renew.</p>
          </>
        )}

        {plus.source !== 'paid' && paying && (
          <>
            <PayPanel plan={plan} onDone={() => (setPaying(false), void reload())} />
            <button type="button" className="linkish muted" onClick={() => setPaying(false)}>
              ← back
            </button>
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

      <p className="muted">Scam Check and Get It Back stay free for everyone, always.</p>
    </div>
  )
}
