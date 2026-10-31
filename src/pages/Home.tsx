// The whole product on one page: open to everyone, no account needed.
import { ArrowRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { claimById, niceDate } from '../data/claims'
import { inr } from '../lib/leak'
import { PRICES } from '../lib/plus'
import { useCancelled, useClaims } from '../lib/saved'

const FAQ = [
  ['do I need to sign up?', 'no. Scam Check, Get It Back and the Leak Check total work straight away. You only need an account to buy the pass.'],
  ['do you see my statement or messages?', 'no. Everything is worked out on your phone. Nothing you paste or open is uploaded or saved.'],
  ['what’s free?', `Scam Check and Get It Back are free for everyone, always, including the letters. The pass is ₹${PRICES.monthly} for a month or ₹${PRICES.yearly} for a year and unlocks the full Leak Check report.`],
  ['can it tell me a message is safe?', 'no, and be careful of anything that says it can. It spots the signs scams use. New scams appear all the time, so if something feels wrong, don’t pay.'],
  ['is this legal advice?', 'no. We explain the rule in plain words, show where it comes from, and help you write to the right people. For a big or complicated case, talk to a lawyer.'],
] as const

export default function Home() {
  const [claims] = useClaims()
  const [cancelled] = useCancelled()
  const open = claims.filter((c) => c.status === 'open')
  const recovered = claims.reduce((n, c) => n + c.recovered, 0)
  const yearly = cancelled.reduce((n, c) => n + c.monthly * 12, 0)

  return (
    <div className="page hub">
      <header className="hm-hero">
        <p className="kicker">perfection is a scam. so are these.</p>
        <h1>
          Stop losing money. <span className="serif">Get it back.</span>
        </h1>
        <p className="lede">Spot scams before you pay, claim what you’re owed, and find what’s quietly draining your account. No sign-up. Nothing leaves your phone.</p>
      </header>

      {(recovered > 0 || yearly > 0) && (
        <section className="hm-saved" aria-label="What you’ve saved">
          {recovered > 0 && (
            <div>
              <b>{inr(recovered)}</b>
              <span>got back</span>
            </div>
          )}
          {yearly > 0 && (
            <div>
              <b>{inr(yearly)}</b>
              <span>a year saved</span>
            </div>
          )}
        </section>
      )}

      {open.length > 0 && (
        <section className="hm-open" aria-label="Your open claims">
          <p className="kicker">your open claims</p>
          {open.map((c) => (
            <a key={c.id} className="hm-claim" href={`#/back/${c.type}?claim=${c.id}`}>
              <span className="grow">
                <b>{claimById(c.type)?.title}</b>
                <small>started {niceDate(c.started)}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ))}
        </section>
      )}

      <section className="hm-cards" aria-label="What you can do">
        <a className="hm-card a-pink" href="#/scam">
          <span className="hm-tag">free</span>
          <h2>
            <Icon name="scam" /> Scam Check
          </h2>
          <p>Weird message, job offer or link? Paste it and know in two seconds.</p>
          <span className="hm-eg" aria-hidden="true">
            <b>looks like a scam</b>
            <small>asks you to pay to get a job</small>
          </span>
          <span className="hm-go">
            check a message <ArrowRight size={18} aria-hidden="true" />
          </span>
        </a>
        <a className="hm-card a-lime" href="#/back">
          <span className="hm-tag">free</span>
          <h2>
            <Icon name="back" /> Get It Back
          </h2>
          <p>UPI failed, refund stuck, scammed? Get the rule, the deadline and the letter to send.</p>
          <span className="hm-eg" aria-hidden="true">
            <b>₹100 for each day it’s late</b>
            <small>what banks owe on a failed UPI payment</small>
          </span>
          <span className="hm-go">
            claim your money <ArrowRight size={18} aria-hidden="true" />
          </span>
        </a>
        <a className="hm-card a-sun" href="#/leak">
          <span className="hm-tag">₹{PRICES.monthly}</span>
          <h2>
            <Icon name="leak" /> Leak Check
          </h2>
          <p>Open your statement and see every subscription, fee and double payment.</p>
          <span className="hm-eg" aria-hidden="true">
            <b>₹1,980 a month leaking</b>
            <small>an example, from a sample statement</small>
          </span>
          <span className="hm-go">
            find my leaks <ArrowRight size={18} aria-hidden="true" />
          </span>
        </a>
      </section>

      <section className="hm-promise" aria-label="Our promises">
        <div>
          <b>no sign-up</b>
          <span>open it and use it</span>
        </div>
        <div>
          <b>stays on your phone</b>
          <span>no uploads, no bank login, no SMS access</span>
        </div>
        <div>
          <b>real rules</b>
          <span>from RBI and the government, with sources</span>
        </div>
      </section>

      <section className="hm-faq" aria-label="Questions">
        <p className="kicker">questions</p>
        {FAQ.map(([q, a]) => (
          <details key={q} className="fold">
            <summary>
              <span>{q}</span>
            </summary>
            <p className="fold-body">{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
