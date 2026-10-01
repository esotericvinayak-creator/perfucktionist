import { useState } from 'react'
import { PlusBadge } from '../components/Overlays'
import { Section } from '../components/ui'
import { confetti } from '../lib/confetti'
import { endPlus, PRICES, startTrial, TRIAL_DAYS, usePlus, type Plan } from '../lib/plus'
import { toast } from '../lib/toast'

const rows: [string, string, string][] = [
  ['📚 Sacred Library — 1.2 lakh+ verses, 6 scriptures', '✓', '✓'],
  ['🛡️ Safety tools, helplines & self-defence', '✓ free forever', '✓'],
  ['🫁 Breathing, 🎧 music, 🫧 happy zone', '✓', '✓'],
  ['🔥 Daily ritual, streaks, XP & badges', '✓', '✓'],
  ['🧭 Guided journeys', 'first 3 days of each', 'every day, every journey'],
  ['🧊 Streak freezes', '—', '2 every month'],
  ['↗ Story cards', '2 styles + watermark', '5 styles, no watermark'],
  ['🎁 Monthly Wrapped', '—', '✓'],
  ['🌸 Companion skins', 'classic', '8 skins'],
  ['🤖 AI Bestie · Safety Circle · Study rooms', '—', 'early access'],
]

const soon = [
  { icon: '🤖', title: 'AI Bestie', body: 'Vent at 2 a.m. Get a reply that actually helps — plus the verse from any faith that fits your situation.' },
  { icon: '📍', title: 'Safety Circle', body: '“Reached home?” check-ins. If you don’t tap “I’m safe” by your time, your people get your live location.' },
  { icon: '📚', title: 'Study rooms', body: 'Lofi, pomodoro and a room full of people grinding with you. Camera off, vibes on.' },
]

const faqs: [string, string][] = [
  ['Will scripture or safety stuff ever be paywalled?', 'Never. The library, helplines, SOS tools and self-defence guides are free forever. Plus pays for the extras so those can stay free.'],
  ['Can I cancel anytime?', 'Yes. No lock-in, no guilt trips, no “are you sure?” maze.'],
  ['Where is my data?', 'Right now everything — streaks, journals, badges — lives only on your device. We don’t sell data. Ever.'],
  ['Why does it cost money at all?', 'Servers, the AI Bestie, and keeping the free stuff free. ₹49 is less than one coffee a month.'],
]

export default function Plus() {
  const plus = usePlus()
  const [plan, setPlan] = useState<Plan>('yearly')

  const start = (e: React.MouseEvent<HTMLButtonElement>) => {
    startTrial(plan)
    const r = e.currentTarget.getBoundingClientRect()
    confetti(r.left + r.width / 2, r.top)
    toast({ icon: '✦', title: 'Welcome to Plus', sub: `${TRIAL_DAYS} days unlocked on this device`, tone: 'badge' })
    setTimeout(() => (window.location.hash = '/me'), 1200)
  }

  return (
    <div className="page">
      <header className="plus-hero">
        <PlusBadge />
        <h1 className="display">
          less perfect.
          <br />
          <span className="serif">more you.</span>
        </h1>
        <p className="lede">Streak freezes, every guided journey, your monthly Wrapped, aesthetic story cards, companion skins — and first dibs on the AI Bestie. For less than one coffee a month.</p>

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
            ₹{PRICES[plan]}
            <small>/{plan === 'monthly' ? 'month' : 'year'}</small>
          </p>
          <p className="muted">{plan === 'yearly' ? `that’s ₹${Math.round(PRICES.yearly / 12)}/month · billed once a year` : 'billed monthly · cancel anytime'}</p>
          {plus.active ? (
            <>
              <p className="plus-on">
                ✦ You’re on Plus — {plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left
              </p>
              <div className="row gap-sm wrap">
                <a className="btn btn-primary a-lime" href="#/me">
                  go to my glow-up →
                </a>
                <button type="button" className="btn btn-sm btn-ghost" onClick={endPlus}>
                  end trial
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={start}>
              start {TRIAL_DAYS}-day free trial ✦
            </button>
          )}
          <p className="fine">Preview: payments aren’t live yet. Starting a trial unlocks Plus on this device for {TRIAL_DAYS} days — no card, no account.</p>
          <p className="tree-promise">🌳 Every yearly member = one real tree planted.</p>
        </div>
      </header>

      <Section kicker="free vs plus" title={<>what you <span className="serif">get</span></>}>
        <div className="compare plus-compare">
          <div className="compare-head a-lime">feature</div>
          <div className="compare-head a-lime">free</div>
          <div className="compare-head a-violet">plus ✦</div>
          {rows.map(([f, free, pro]) => (
            <div key={f} className="compare-row">
              <span>{f}</span>
              <span>{free}</span>
              <span>{pro}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="coming to plus first" title={<>the stuff we’re <span className="serif">building</span></>}>
        <div className="grid">
          {soon.map((s) => (
            <article key={s.title} className="card tip a-violet">
              <span className="tip-icon">{s.icon}</span>
              <h3>
                {s.title} <span className="soon">soon</span>
              </h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="faq" title={<>real <span className="serif">questions</span></>}>
        <div className="moves">
          {faqs.map(([q, a]) => (
            <details key={q} className="move faq">
              <summary>
                <span className="move-name">{q}</span>
                <span className="move-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="faq-a">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  )
}
