import { useState, type MouseEvent } from 'react'
import { PlusBadge } from '../components/Overlays'
import { confetti } from '../lib/confetti'
import { endPlus, PRICES, startTrial, TRIAL_DAYS, usePlus, type Plan } from '../lib/plus'
import { toast } from '../lib/toast'

// Four reasons, in plain words. Everything else stays free.
const REASONS = [
  { emoji: '🧊', title: 'Your streak is safe', body: 'Miss a day? Plus quietly covers it — 2 times a month. No more starting from zero.' },
  { emoji: '🧭', title: 'Full programs', body: 'Every day of every journey: calm in 7 days, brave in 14, unperfect in 21, the whole Gita in 18.' },
  { emoji: '📈', title: 'See yourself change', body: 'Mood & focus patterns, your monthly Wrapped, study timetable and a speaking coach.' },
  { emoji: '✨', title: 'Make it yours', body: '8 buddy skins, aesthetic story cards with no watermark, unlimited habits, decks and sounds.' },
]

const FREE = ['Daily 5 minutes, streaks & your buddy', 'Sacred library — every scripture', 'All safety & SOS tools', '56 of 60 tools', 'Music, breathing, everything else']

export default function Plus() {
  const plus = usePlus()
  const [plan, setPlan] = useState<Plan>('yearly')

  const start = (e: MouseEvent<HTMLButtonElement>) => {
    startTrial(plan)
    const r = e.currentTarget.getBoundingClientRect()
    confetti(r.left + r.width / 2, r.top)
    toast({ icon: '✦', title: 'Welcome to Plus', sub: `${TRIAL_DAYS} days unlocked on this device`, tone: 'badge' })
    setTimeout(() => (window.location.hash = '/'), 1200)
  }

  return (
    <div className="page plus-page">
      <header className="plus-top">
        <PlusBadge />
        <h1 className="display">
          less perfect. <span className="serif">more you.</span>
        </h1>
      </header>

      <div className="reasons">
        {REASONS.map((r) => (
          <div key={r.title} className="reason">
            <span>{r.emoji}</span>
            <b>{r.title}</b>
            <p>{r.body}</p>
          </div>
        ))}
      </div>

      <div className="price-card card a-violet">
        <div className="plan-toggle" role="radiogroup" aria-label="Billing">
          {(['monthly', 'yearly'] as Plan[]).map((p) => (
            <button key={p} type="button" role="radio" aria-checked={plan === p} className={plan === p ? 'on' : ''} onClick={() => setPlan(p)}>
              {p}
              {p === 'yearly' && <span className="save">save 32%</span>}
            </button>
          ))}
        </div>
        <p className="price">
          ₹{plan === 'yearly' ? Math.round(PRICES.yearly / 12) : PRICES.monthly}
          <small>/month</small>
        </p>
        <p className="muted">{plan === 'yearly' ? `₹${PRICES.yearly} once a year` : 'cancel anytime'} · less than one coffee</p>
        {plus.active ? (
          <>
            <p className="plus-on">
              ✦ You’re on Plus — {plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left
            </p>
            <button type="button" className="btn btn-sm btn-ghost" onClick={endPlus}>
              end trial
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary a-lime big-cta" onClick={start}>
            try free for {TRIAL_DAYS} days ✦
          </button>
        )}
        <p className="fine">Preview: payments aren’t live yet — this unlocks Plus on this device only. No card needed.</p>
      </div>

      <div className="free-box">
        <p className="kicker">always free, for everyone</p>
        <ul>
          {FREE.map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
