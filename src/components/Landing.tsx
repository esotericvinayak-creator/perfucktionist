// The rest of the landing page: try it before you sign up, hatch a pet, see what's inside.
// Only real numbers and real promises here — no fake reviews, no made-up user counts.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { PETS, linesFor } from '../data/profile'
import { PRICES, TRIAL_DAYS } from '../lib/plus'
import { pop } from '../lib/sound'
import { TOOLS } from '../tools/registry'

const MOODS = [
  { emoji: '😵‍💫', label: 'stressed' },
  { emoji: '😔', label: 'low' },
  { emoji: '😤', label: 'angry' },
  { emoji: '😐', label: 'meh' },
  { emoji: '😊', label: 'good' },
] as const

const BOX = ['breathe in', 'hold', 'breathe out', 'hold']

/** A picture of the app's one screen, drawn in markup — not a screenshot, and not a real person. */
export function HeroPreview() {
  return (
    <div className="ld-phone" aria-hidden="true">
      <div className="ld-phone-bar">
        <b>hey you 👋</b>
        <span>🔥 12</span>
      </div>
      <div className="ld-phone-card">
        <div className="ld-phone-pet">
          <span>🐣</span>
          <div>
            <b>Mochi · lvl 3</b>
            <small>hungry · your 5 minutes feed them</small>
          </div>
        </div>
        <i />
        <div className="ld-phone-cta">▶ start my 5 minutes</div>
        <small>how you feel → one small thing → one line of wisdom</small>
      </div>
      <div className="ld-phone-line">
        <small>TODAY’S LINE</small>
        <p>“You have the right to the work, but never to its fruits.”</p>
      </div>
      <div className="ld-phone-help">
        <span>panic</span>
        <span>safe walk</span>
        <span>SOS</span>
        <span>14416</span>
      </div>
    </div>
  )
}

function BoxBreath() {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= 8) return
    const t = setTimeout(() => setN(n + 1), 4000)
    return () => clearTimeout(t)
  }, [n])
  const done = n >= 8
  return (
    <div className="ld-breath">
      <span className={`ld-orb p${n % 4}${done ? ' done' : ''}`} aria-hidden="true" />
      <b aria-live="polite">{done ? 'better? that was 32 seconds.' : BOX[n % 4]}</b>
      {done && (
        <button type="button" className="linkish" onClick={() => setN(0)}>
          again
        </button>
      )}
    </div>
  )
}

function Demo() {
  const [mood, setMood] = useState<number | null>(null)
  const lines = useMemo(() => linesFor().filter((l) => l.text.length < 160), [])
  const [line, setLine] = useState(() => lines[Math.floor(Math.random() * lines.length)])
  const another = () => setLine(lines[Math.floor(Math.random() * lines.length)])

  return (
    <div className="ld-demo card">
      <p className="act-q">how are you, really?</p>
      <div className="mood-pick" role="group" aria-label="Pick your mood">
        {MOODS.map((m, i) => (
          <button key={m.label} type="button" className={mood === i ? 'on' : ''} onClick={() => setMood(i)} aria-label={m.label} aria-pressed={mood === i}>
            {m.emoji}
          </button>
        ))}
      </div>
      {mood !== null && (
        <div className="ld-answer" key={mood}>
          {(mood === 0 || mood === 2) && (
            <>
              <p className="muted">{mood === 0 ? 'okay. one thing at a time. follow the square:' : 'valid. before you text anything — 32 seconds:'}</p>
              <BoxBreath />
            </>
          )}
          {mood === 1 && (
            <>
              <p className="muted">heavy days happen. here’s something people have held onto for centuries:</p>
              <blockquote className="ld-quote">
                <span className="trad-chip">{line.badge}</span>
                <p>“{line.text}”</p>
              </blockquote>
              <button type="button" className="linkish" onClick={another}>
                another one
              </button>
            </>
          )}
          {mood === 3 && (
            <>
              <p className="muted">meh is fine. tiny dare for today:</p>
              <p className="ld-dare">text one friend you miss. just “thought of you 🙂”. that’s it.</p>
            </>
          )}
          {mood === 4 && (
            <>
              <p className="muted">love that. bank it for the bad days:</p>
              <p className="ld-dare">write one line about why today was good. future you will read it.</p>
            </>
          )}
          <p className="ld-small">that’s the daily 5 minutes, in miniature. inside, it remembers you and picks what helps.</p>
        </div>
      )}
    </div>
  )
}

function Egg() {
  const [taps, setTaps] = useState(0)
  const [pet] = useState(() => PETS[Math.floor(Math.random() * PETS.length)])
  const hatched = taps >= 3
  return (
    <div className="ld-egg card a-lime">
      <button
        type="button"
        className={`ld-egg-btn${hatched ? ' hatched' : ''} t${Math.min(taps, 3)}`}
        onClick={() => {
          pop()
          setTaps(taps + 1)
        }}
        aria-label={hatched ? pet.name : 'Tap the egg'}
      >
        {hatched ? pet.emoji : '🥚'}
      </button>
      <div>
        <p className="act-q">{hatched ? `meet your ${pet.name.toLowerCase()}.` : 'tap the egg.'}</p>
        <p className="muted">
          {hatched
            ? 'inside, you pick your own (12 to choose from), name it, and it grows as you show up. skip a day and it just gets sleepy — it never runs away.'
            : `${3 - taps} more ${3 - taps === 1 ? 'tap' : 'taps'}…`}
        </p>
        {hatched && (
          <div className="ld-pets" aria-hidden="true">
            {PETS.map((p) => (
              <span key={p.id}>{p.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const FAQ = [
  [
    'is it free?',
    `yes. the daily 5 minutes, every scripture, all safety tools and most of the ${TOOLS.length} tools are free, always. Plus (₹${PRICES.monthly}/month or ₹${PRICES.yearly}/year, paid by UPI, no auto-renew) adds streak freezes, full journeys, insights and outfits for your pet. the first ${TRIAL_DAYS} days are free.`,
  ],
  ['do I have to be religious?', 'nope. tell us your faith, pick “every faith”, or say you’re atheist or agnostic — then you get philosophy instead. or never answer at all.'],
  ['do you ask my gender or faith?', 'only later, and only if you want to answer. they just decide what shows up first (your scripture, safety tools). nothing is ever hidden from anyone.'],
  ['is my stuff private?', 'your journal, cycle tracker, money and notes are saved on your phone, not on our servers.'],
  ['is this therapy?', 'no — it’s daily support and tools. if things feel too heavy, please talk to someone: Tele-MANAS 14416 is free and open 24/7 in India.'],
] as const

/** `actions` replaces the sign-up buttons at the end (Android visitors get the download instead). */
export function LandingMore({ onSignup, onLogin, actions }: { onSignup: () => void; onLogin: () => void; actions?: ReactNode }) {
  return (
    <div className="landing page">
      <section className="ld-section">
        <p className="kicker">try it — no account needed</p>
        <h2 className="ld-h">
          30 seconds. <span className="serif">right now.</span>
        </h2>
        <Demo />
      </section>

      <section className="ld-section">
        <p className="kicker">how it works</p>
        <h2 className="ld-h">
          three steps. <span className="serif">zero pressure.</span>
        </h2>
        <ol className="ld-steps">
          <li>
            <b>pick what you need</b>
            <span>up to 3 goals, and a pet to show up for. that’s the whole setup.</span>
          </li>
          <li>
            <b>do your 5 minutes</b>
            <span>how you feel → one small action → one line of wisdom. done.</span>
          </li>
          <li>
            <b>watch things grow</b>
            <span>your pet, your streak, and honestly, you.</span>
          </li>
        </ol>
      </section>

      <section className="ld-section">
        <p className="kicker">your pet</p>
        <h2 className="ld-h">
          a tiny friend that <span className="serif">grows with you.</span>
        </h2>
        <Egg />
      </section>

      <section className="ld-section">
        <p className="kicker">free, and a little extra</p>
        <h2 className="ld-h">
          the good stuff is <span className="serif">free.</span>
        </h2>
        <div className="ld-plans">
          <div className="ld-plan">
            <b>free, always</b>
            <small>daily 5 minutes, your pet, every scripture, all safety tools, 56 of 60 tools</small>
          </div>
          <div className="ld-plan plus">
            <b>
              Plus · ₹{Math.round(PRICES.yearly / 12)}/month <em>{TRIAL_DAYS} days free</em>
            </b>
            <small>streak freezes, full programs, mood patterns, pet outfits. pay by UPI, no card, no auto-renew</small>
          </div>
        </div>
      </section>

      <section className="ld-section">
        <p className="kicker">promises</p>
        <ul className="ld-promises">
          <li>🛡️ every safety tool is free forever. panic SOS, safe-walk and Shield work without even logging in.</li>
          <li>🔒 your journal, cycle and money stay on your phone.</li>
          <li>🙏 no gurus, no “donate for blessings”. wisdom from every faith, free.</li>
        </ul>
      </section>

      <section className="ld-section">
        <p className="kicker">questions</p>
        <div className="ld-faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ld-final">
        <h2 className="ld-h">
          ready to be <span className="serif">imperfect?</span>
        </h2>
        {actions ?? (
          <div className="aw-actions">
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={onSignup}>
              create my free account <ArrowRight size={18} />
            </button>
            <button type="button" className="btn big-cta" onClick={onLogin}>
              I already have one
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
