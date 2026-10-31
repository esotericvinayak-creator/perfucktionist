// The rest of the landing page: what you get, try it before you sign up, what it costs.
// Only real numbers and real promises here — no fake reviews, no made-up user counts. The screens
// drawn below are examples, and anything not built yet says when it arrives.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { PETS, linesFor } from '../data/profile'
import { FOUNDING } from '../lib/plus'
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
      <div className="ld-phone-next">
        <span className="ld-phone-count">
          <b>18</b>
          <small>days left</small>
        </span>
        <div>
          <small>NEXT SCARY THING</small>
          <b>campus placement</b>
          <em>answer one question →</em>
        </div>
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

/** The three things people pay for, each with an example of what it looks like. */
const FEATURES = [
  {
    id: 'sprint',
    role: 'prepare',
    name: 'Sprint',
    line: 'Enter your date and daily hours, and get a plan for every day. Miss one and it fixes itself. Sleep badly and today gets lighter.',
    soon: true,
    accent: 'lime',
    example: (
      <div className="fx-mini" aria-hidden="true">
        <small>NEET · 184 DAYS LEFT</small>
        <ul className="fx-plan">
          <li className="done">biology, chapter 5</li>
          <li>physics, chapter 2</li>
          <li className="moved">
            chemistry revision <em>moved to tomorrow</em>
          </li>
        </ul>
        <span className="fx-note">slept 5 hours, so today is lighter</span>
      </div>
    ),
  },
  {
    id: 'mock',
    role: 'practise',
    name: 'Mock Room',
    line: 'Answer real interview questions out loud. See your umms and your pace, then get one clear fix for the next try.',
    soon: true,
    accent: 'pink',
    example: (
      <div className="fx-mini" aria-hidden="true">
        <small>HR ROUND · QUESTION 2 OF 5</small>
        <b>“Tell me about yourself.”</b>
        <p>
          so <mark>basically</mark> I’m a final-year student and <mark>umm</mark> I built an app for our college fest…
        </p>
        <span className="fx-note">one fix: start with the app, not the college</span>
      </div>
    ),
  },
  {
    id: 'kanak',
    role: 'see proof',
    name: 'Kanak',
    line: 'Your own logs, turned into proof of what lifts your mood and your output. Worked out on your phone, and it stays there.',
    soon: false,
    accent: 'sun',
    example: (
      <div className="fx-mini gold" aria-hidden="true">
        <small>EXAMPLE PATTERN</small>
        <b className="fx-big">+1.2</b>
        <p>mood points on days with 7+ hours of sleep</p>
        <span className="fx-note">your golden day: tuesday</span>
      </div>
    ),
  },
]

const FAQ = [
  [
    'is it free?',
    `yes. the daily 5 minutes, your pet, every scripture, all safety tools and most of the ${TOOLS.length} tools are free, always. the founding pass is ₹${FOUNDING.price} for a year, paid once by UPI, with no auto-renew.`,
  ],
  ['what do I get with the founding pass?', `Kanak and every full program today, then Sprint and Mock Room by ${FOUNDING.by}. if they aren’t live by then, we refund you. after launch the same year costs ₹${FOUNDING.after}.`],
  ['who is this for?', 'students and freshers with an exam, interview or hard conversation coming up. anyone who keeps waiting to feel ready is welcome.'],
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
        <p className="kicker">what you get</p>
        <h2 className="ld-h">
          three things for the days that <span className="serif">scare you.</span>
        </h2>
        <div className="fx-list">
          {FEATURES.map((f) => (
            <article key={f.id} className={`fx a-${f.accent}`}>
              <div className="fx-copy">
                <span className={`fx-status${f.soon ? '' : ' live'}`}>{f.soon ? `arrives by ${FOUNDING.by}` : 'live now'}</span>
                <h3>{f.name}</h3>
                <p>{f.line}</p>
              </div>
              {f.example}
            </article>
          ))}
        </div>
      </section>

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
        <ol className="ld-steps ill">
          <li>
            <span className="ld-ill i1" aria-hidden="true">
              <i>📚</i>
              <i>🎤</i>
              <i>🗣️</i>
            </span>
            <b>tell us what’s coming</b>
            <span>an exam, an interview, a hard talk.</span>
          </li>
          <li>
            <span className="ld-ill i2" aria-hidden="true">
              <i />
            </span>
            <b>do a little every day</b>
            <span>five minutes for you, one step towards it.</span>
          </li>
          <li>
            <span className="ld-ill i3" aria-hidden="true">
              <i>🥚</i>
              <i>🐣</i>
              <i>🐥</i>
            </span>
            <b>walk in anyway</b>
            <span>ready enough beats perfect.</span>
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
        <p className="kicker">what it costs</p>
        <h2 className="ld-h">
          start free. <span className="serif">stay if it helps.</span>
        </h2>
        <div className="ld-plans">
          <div className="ld-plan">
            <b>free, always</b>
            <small>daily 5 minutes, your pet, focus timer, flashcards, NCERT books, practice questions, every scripture, all safety tools</small>
          </div>
          <div className="ld-plan plus">
            <b>
              founding pass · ₹{FOUNDING.price}/year <em>₹{FOUNDING.after} after launch</em>
            </b>
            <small>Kanak and full programs now, Sprint and Mock Room by {FOUNDING.by} or your money back. pay once by UPI, no auto-renew</small>
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
          you’re ready enough. <span className="serif">start.</span>
        </h2>
        {actions ?? (
          <div className="aw-actions">
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={onSignup}>
              start free <ArrowRight size={18} />
            </button>
            <button type="button" className="linkish aw-login" onClick={onLogin}>
              I already have an account
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
