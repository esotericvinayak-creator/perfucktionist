// The rest of the landing page: try it before you sign up, hatch a pet, see what's inside.
// Only real numbers and real promises here — no fake reviews, no made-up user counts.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { FAITHS, GENDERS, PETS, linesFor } from '../data/profile'
import { PRICES } from '../lib/plus'
import { formatIndian, scriptures, totalVerses } from '../lib/scripture'
import { pop } from '../lib/sound'
import { TOOLS } from '../tools/registry'
import { Icon } from './Icon'

const MOODS = [
  { emoji: '😵‍💫', label: 'stressed' },
  { emoji: '😔', label: 'low' },
  { emoji: '😤', label: 'angry' },
  { emoji: '😐', label: 'meh' },
  { emoji: '😊', label: 'good' },
] as const

const BOX = ['breathe in', 'hold', 'breathe out', 'hold']

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

const INSIDE = [
  { icon: 'safety', title: 'Shield', body: 'self-defence moves, SOS, safe-walk timer, your rights. free forever, no login.', accent: 'pink' },
  { icon: 'library', title: 'Every scripture', body: `${formatIndian(totalVerses)} verses — Gita, Gurbani, Quran, Bible, Dhammapada, Ramayana.`, accent: 'sun' },
  { icon: 'listen', title: 'Listen', body: 'quotes read aloud over lofi, plus music reels — songs that play themselves, swipe for the next.', accent: 'violet' },
  { icon: 'explore', title: `${TOOLS.length} tools`, body: 'focus timer, budget, sleep, journal, cycle tracker, breakup recovery…', accent: 'lime' },
  { icon: 'read', title: 'Read', body: 'honest posts on depression, results day, grief and getting back up.', accent: 'cyan' },
  { icon: 'faith', title: 'Real faith', body: 'spot fake babas, pastors and “pay to be blessed”. god is free.', accent: 'orange' },
]

const FAQ = [
  [
    'is it free?',
    `yes. the daily 5 minutes, every scripture, all safety tools and most of the ${TOOLS.length} tools are free, always. Plus (₹${PRICES.monthly}/month or ₹${PRICES.yearly}/year) adds streak freezes, full journeys, insights and outfits for your pet.`,
  ],
  ['do I have to be religious?', 'nope. tell us your faith, pick “every faith”, or say you’re atheist or agnostic — then you get philosophy instead. or skip the question entirely.'],
  ['why do you ask my gender?', 'only to decide what shows up first (like safety tools or the bro code). it’s optional, there are lots of options, and nothing is ever hidden from anyone.'],
  ['is my stuff private?', 'your journal, cycle tracker, money and notes are saved on your phone, not on our servers.'],
  ['is this therapy?', 'no — it’s daily support and tools. if things feel too heavy, please talk to someone: Tele-MANAS 14416 is free and open 24/7 in India.'],
] as const

/** `actions` replaces the sign-up buttons at the end (Android visitors get the download instead). */
export function LandingMore({ onSignup, onLogin, actions }: { onSignup: () => void; onLogin: () => void; actions?: ReactNode }) {
  return (
    <div className="landing page">
      <div className="ld-stats">
        <span>
          <b>{TOOLS.length}</b> tools
        </span>
        <span>
          <b>{formatIndian(totalVerses)}</b> verses
        </span>
        <span>
          <b>{scriptures.length}</b> full scriptures
        </span>
        <span>
          <b>₹0</b> to start
        </span>
      </div>

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
            <b>tell us a little</b>
            <span>your name, and — only if you want — your gender and faith.</span>
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
        <p className="kicker">what’s inside</p>
        <h2 className="ld-h">
          one app. <span className="serif">everything that helps.</span>
        </h2>
        <div className="ld-inside">
          {INSIDE.map((x) => (
            <div key={x.title} className={`ld-tile a-${x.accent}`}>
              <span className="ibub">
                <Icon name={x.icon} />
              </span>
              <b>{x.title}</b>
              <small>{x.body}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="ld-section ld-everyone">
        <p className="kicker">made for everyone</p>
        <h2 className="ld-h">
          your gender. your faith. <span className="serif">your pace.</span>
        </h2>
        <div className="ld-cloud" aria-label="Some of the options">
          {GENDERS.filter((g) => g.id !== 'self' && g.id !== 'none').map((g) => (
            <span key={g.id}>{g.label}</span>
          ))}
          {FAITHS.filter((f) => f.id !== 'other' && f.id !== 'none').map((f) => (
            <span key={f.id}>
              {f.emoji} {f.label}
            </span>
          ))}
        </div>
        <p className="muted">tell us, or don’t. it only changes what shows up first — nothing is ever locked away from anyone.</p>
      </section>

      <section className="ld-section">
        <p className="kicker">promises</p>
        <ul className="ld-promises">
          <li>🛡️ every safety tool is free forever. panic SOS, safe-walk and Shield work without even logging in.</li>
          <li>🔒 your journal, cycle and money stay on your phone.</li>
          <li>🙏 no gurus, no “donate for blessings”. wisdom from every faith, for free.</li>
          <li>🎵 no pirate sites: official 30s previews from iTunes, full songs from independent artists on Audius, and links to the real apps for the rest.</li>
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
