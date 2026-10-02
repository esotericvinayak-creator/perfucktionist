import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { PetView } from '../components/Pet'
import { Marquee, Section } from '../components/ui'
import { shareCard } from '../components/Overlays'
import { AREAS, DARES, GOALS, KIND_DARES, goalById, type ActionKind } from '../data/app'
import { journeyById, journeys } from '../data/journeys'
import { posts } from '../data/posts'
import { FAITHS, GENDERS, PETS, faithById, linesFor, priorities, type Line } from '../data/profile'
import { motives } from '../data/zones'
import { confetti } from '../lib/confetti'
import { levelOf, log, petEmoji, streakOf, update, useProgress } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { dayOfYear, todayKey, useLocalState } from '../lib/storage'
import { TOOLS, toolById } from '../tools/registry'
import { MIXES } from './Listen'

type CheckIn = { mood: number; energy: number; sleep: number; note: string }
type Intent = { date: string; text: string; done: boolean }
const MOODS = ['😭', '😔', '😐', '🙂', '🤩']

// ─── what today's action is ───────────────────────────────────
function pickAction(mood: number, goals: string[]): ActionKind {
  if (mood && mood <= 2) return 'breathe' // rough day → care first
  const kinds = [...new Set(goals.map((g) => goalById(g)?.action).filter(Boolean) as ActionKind[])]
  if (!kinds.length) kinds.push('gratitude', 'dare', 'breathe')
  return kinds[dayOfYear() % kinds.length]
}

/** Today's line, from your own faith first (or philosophy, if you'd rather skip religion). `second` picks a different one. */
function dailyLine(faith: string | undefined, second = false): Line {
  const lines = linesFor(faith)
  const offset = second ? Math.max(1, Math.floor(lines.length / 2)) : 0
  return lines[(dayOfYear() + offset) % lines.length]
}

// ─── actions (each is one tiny thing) ─────────────────────────
function MiniBreath({ onDone }: { onDone: () => void }) {
  const phases = [
    ['breathe in', 2000, 'big'],
    ['a little more', 1000, 'big'],
    ['slowly out…', 6000, 'small'],
  ] as const
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= 3) return
    const t = setTimeout(() => {
      if (i === 2) {
        if (n + 1 >= 3) {
          log('breath', { silent: true })
          onDone()
        }
        setN(n + 1)
      }
      setI((i + 1) % 3)
    }, phases[i][1])
    return () => clearTimeout(t)
  })
  return (
    <div className="act">
      <p className="act-q">breathe with the circle</p>
      <div className={`mini-orb ${n >= 3 ? 'small' : phases[i][2]}`} style={{ transitionDuration: `${phases[i][1]}ms` }}>
        <span>{n >= 3 ? 'nice ✓' : phases[i][0]}</span>
      </div>
      <p className="muted">{Math.min(n + 1, 3)} of 3</p>
    </div>
  )
}

function Gratitude({ onDone }: { onDone: () => void }) {
  const [jar, setJar] = useLocalState<{ text: string; at: number }[]>('gratitude', [])
  const [v, setV] = useState('')
  const [saved, setSaved] = useState(false)
  return (
    <div className="act">
      <p className="act-q">one good thing today?</p>
      <input className="act-input" value={v} onChange={(e) => setV(e.target.value)} placeholder="the chai was good. that counts." maxLength={100} disabled={saved} />
      <button
        type="button"
        className="btn btn-primary a-lime"
        disabled={!v.trim() || saved}
        onClick={() => {
          setJar([{ text: v.trim(), at: Date.now() }, ...jar])
          setSaved(true)
          log('gratitude', { silent: true })
          onDone()
        }}
      >
        {saved ? 'saved to your jar ✓' : 'drop it in the jar 🫙'}
      </button>
    </div>
  )
}

function Dare({ list, onDone, kind }: { list: string[]; onDone: () => void; kind: 'dare' | 'kind' }) {
  const [i, setI] = useState(dayOfYear() % list.length)
  const [took, setTook] = useState(false)
  return (
    <div className="act">
      <p className="act-q">{kind === 'kind' ? 'today’s kindness' : 'today’s tiny brave thing'}</p>
      <p className="act-card">{list[i % list.length]}</p>
      <div className="row gap-sm center wrap">
        {!took && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setI(i + 1)}>
            🔀 another
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary a-lime"
          disabled={took}
          onClick={() => {
            setTook(true)
            log('dare', { silent: true })
            onDone()
          }}
        >
          {took ? 'deal ✓' : 'I’ll do it today 🤝'}
        </button>
      </div>
    </div>
  )
}

function IntentAct({ onDone }: { onDone: () => void }) {
  const [intent, setIntent] = useLocalState<Intent | null>('tool:intent', null)
  const [v, setV] = useState(intent?.date === todayKey() ? intent.text : '')
  const saved = intent?.date === todayKey()
  return (
    <div className="act">
      <p className="act-q">one thing you’ll finish today?</p>
      <input className="act-input" value={v} onChange={(e) => setV(e.target.value)} placeholder="revise chapter 3, reply to that email…" maxLength={80} />
      <button
        type="button"
        className="btn btn-primary a-lime"
        disabled={!v.trim()}
        onClick={() => {
          setIntent({ date: todayKey(), text: v.trim(), done: false })
          if (!saved) log('tool', { silent: true })
          onDone()
        }}
      >
        {saved ? 'update ✓' : 'lock it in 🔒'}
      </button>
    </div>
  )
}

function Spend({ onDone }: { onDone: () => void }) {
  const [list, setList] = useLocalState<{ id: string; date: string; amt: number; cat: string; note: string }[]>('tool:expenses', [])
  const [amt, setAmt] = useState('')
  const [cat, setCat] = useState('food')
  const [saved, setSaved] = useState(false)
  const add = (n: number) => {
    if (n > 0) setList([{ id: Math.random().toString(36).slice(2, 9), date: todayKey(), amt: n, cat, note: '' }, ...list])
    setSaved(true)
    log('tool', { silent: true })
    onDone()
  }
  return (
    <div className="act">
      <p className="act-q">spent anything today?</p>
      <div className="amount-in">
        <span>₹</span>
        <input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" aria-label="Amount" disabled={saved} />
      </div>
      <div className="row gap-sm wrap center">
        {['🍔 food', '🚕 travel', '🛍️ shopping', '🎉 fun', '📦 other'].map((c) => (
          <button key={c} type="button" className={`chip${cat === c.split(' ')[1] ? ' on' : ''}`} onClick={() => setCat(c.split(' ')[1])} disabled={saved}>
            {c}
          </button>
        ))}
      </div>
      <div className="row gap-sm wrap center">
        <button type="button" className="btn btn-primary a-sun" disabled={!Number(amt) || saved} onClick={() => add(Number(amt))}>
          {saved ? 'logged ✓' : 'log it'}
        </button>
        {!saved && (
          <button type="button" className="btn btn-ghost" onClick={() => add(0)}>
            ₹0 today 🎉
          </button>
        )}
      </div>
    </div>
  )
}

// ─── the 5-minute flow ────────────────────────────────────────
export function DailyFlow({ onClose }: { onClose: () => void }) {
  const p = useProgress()
  const [checkins, setCheckins] = useLocalState<Record<string, CheckIn>>('tool:checkins', {})
  const [, setFlows] = useLocalState<Record<string, boolean>>('tool:flow', {})
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState(checkins[todayKey()]?.mood ?? 0)
  const [acted, setActed] = useState(false)
  const action = pickAction(mood, p.goals)
  const w = dailyLine(p.faith)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const finish = () => {
    setFlows((f) => ({ ...f, [todayKey()]: true }))
    setStep(3)
    setTimeout(() => confetti(), 150)
  }

  return (
    <div className="flow-screen" role="dialog" aria-modal="true" aria-label="Your 5 minutes">
      <div className="fs-top">
        <div className="fs-dots">
          {[0, 1, 2, 3].map((d) => (
            <span key={d} className={d < step ? 'past' : d === step ? 'now' : ''} />
          ))}
        </div>
        <button type="button" className="icon-btn ghost" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="fs-body" key={step}>
        {step === 0 && (
          <div className="act">
            <p className="act-q">how are you, really?</p>
            <div className="mood-pick">
              {MOODS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className={mood === i + 1 ? 'on' : ''}
                  onClick={() => {
                    setMood(i + 1)
                    setCheckins({ ...checkins, [todayKey()]: { ...(checkins[todayKey()] ?? { energy: 0, sleep: 0, note: '' }), mood: i + 1 } })
                    setTimeout(() => setStep(1), 250)
                  }}
                  aria-label={`Mood ${i + 1} of 5`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mood > 0 && mood <= 2 && <p className="muted">rough one. let’s go gentle today. 💜</p>}
          </div>
        )}
        {step === 1 && (
          <>
            {action === 'breathe' && <MiniBreath onDone={() => setActed(true)} />}
            {action === 'gratitude' && <Gratitude onDone={() => setActed(true)} />}
            {action === 'dare' && <Dare list={DARES} kind="dare" onDone={() => setActed(true)} />}
            {action === 'kind' && <Dare list={KIND_DARES} kind="kind" onDone={() => setActed(true)} />}
            {action === 'intent' && <IntentAct onDone={() => setActed(true)} />}
            {action === 'spend' && <Spend onDone={() => setActed(true)} />}
          </>
        )}
        {step === 2 && (
          <div className="act">
            <p className="act-q">today’s line</p>
            <div className="wis-card">
              <span className="trad-chip">{w.badge}</span>
              {w.original && (
                <p className={`orig lang-${w.lang}`} lang={w.lang} dir={w.rtl ? 'rtl' : undefined}>
                  {w.original}
                </p>
              )}
              <p className="wis-text">{w.text}</p>
              {w.extra && <p className="wis-extra">💬 {w.extra}</p>}
            </div>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => shareCard({ kicker: w.badge, original: w.original, lang: w.lang, rtl: w.rtl, text: w.text })}>
              ↗ share as story
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="act">
            <span className="fs-pet">
              <PetView p={p} size={110} />
            </span>
            <p className="fs-streak">🔥 {streakOf(p)}</p>
            <p className="act-q">done. that’s the whole thing.</p>
            <p className="muted">{p.pet || 'your pet'} is fed and happy. see you tomorrow.</p>
          </div>
        )}
      </div>

      <div className="fs-foot">
        {step === 1 && (
          <button type="button" className="btn btn-primary a-lime big-cta" disabled={!acted} onClick={() => setStep(2)}>
            next →
          </button>
        )}
        {step === 1 && !acted && (
          <button type="button" className="linkish muted" onClick={() => setStep(2)}>
            skip this one
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            className="btn btn-primary a-lime big-cta"
            onClick={() => {
              log('verse', { silent: true })
              finish()
            }}
          >
            finish ✓
          </button>
        )}
        {step === 3 && (
          <div className="row gap-sm center wrap">
            <button
              type="button"
              className="btn"
              onClick={() => shareCard({ kicker: `${p.name || 'my'} streak`, hero: `🔥${streakOf(p)}`, text: 'showing up > being perfect.', footer: `level ${levelOf(p.xp).level} · ${levelOf(p.xp).name}` })}
            >
              ↗ share streak
            </button>
            <button type="button" className="btn btn-primary a-lime" onClick={onClose}>
              back to today
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── first run ────────────────────────────────────────────────
// Steps: 0 welcome · 1 name · 2 gender · 3 faith · 4 goals · 5 pet. Signed-up users start at 2.
function Onboarding({ onFinish }: { onFinish: () => void }) {
  const p = useProgress()
  // Full focus while onboarding: no tab bar or footer.
  useEffect(() => {
    document.body.classList.add('onboarding')
    return () => document.body.classList.remove('onboarding')
  }, [])
  const first = p.name ? 2 : 0
  const [step, setStep] = useState(first)
  const [name, setName] = useState(p.name)
  const [gender, setGender] = useState(p.gender ?? '')
  const [genderSelf, setGenderSelf] = useState(p.genderSelf ?? '')
  const [faith, setFaith] = useState(p.faith ?? '')
  const [goals, setGoals] = useState<string[]>(p.goals)
  const [petType, setPetType] = useState(p.petType || 'cat')
  const [pet, setPet] = useState(p.pet || '')
  const toggle = (id: string) => setGoals(goals.includes(id) ? goals.filter((g) => g !== id) : goals.length < 3 ? [...goals, id] : goals)
  const next = () => setStep(step + 1)
  const chosen = PETS.find((x) => x.id === petType) ?? PETS[0]

  return (
    <div className="onboard">
      <div className="fs-dots">
        {[0, 1, 2, 3, 4, 5].slice(first).map((d) => (
          <span key={d} className={d < step ? 'past' : d === step ? 'now' : ''} />
        ))}
      </div>
      <div className="ob-body" key={step}>
        {step === 0 && (
          <>
            <h1 className="ob-mega">
              perfection is a <span className="serif">scam.</span>
            </h1>
            <p className="ob-sub">5 minutes a day to feel okay, get stuff done and grow — at your own pace.</p>
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={next}>
              let’s go →
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <p className="act-q">what should we call you?</p>
            <input className="act-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name or nickname" maxLength={16} autoFocus />
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={next}>
              {name.trim() ? 'next →' : 'skip →'}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            {p.name && <p className="kicker">welcome, {p.name} 🌱</p>}
            <p className="act-q">how do you identify?</p>
            <p className="muted">optional. it only changes what we suggest first — you can always see everything.</p>
            <div className="opt-grid">
              {GENDERS.map((g) => (
                <button key={g.id} type="button" className={`opt${gender === g.id ? ' on' : ''}`} onClick={() => setGender(g.id)} aria-pressed={gender === g.id}>
                  {g.label}
                </button>
              ))}
            </div>
            {gender === 'self' && <input className="act-input" value={genderSelf} onChange={(e) => setGenderSelf(e.target.value)} placeholder="in your words" maxLength={30} autoFocus />}
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={next}>
              {gender ? 'next →' : 'skip →'}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <p className="act-q">your faith?</p>
            <p className="muted">optional. we’ll show your scripture and quotes first. every faith stays open to everyone.</p>
            <div className="opt-grid faith">
              {FAITHS.map((f) => (
                <button key={f.id} type="button" className={`opt${faith === f.id ? ' on' : ''}`} onClick={() => setFaith(f.id)} aria-pressed={faith === f.id}>
                  <span>{f.emoji}</span> {f.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={next}>
              {faith ? 'next →' : 'skip →'}
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <p className="act-q">what do you want help with?</p>
            <p className="muted">pick up to 3</p>
            <div className="goal-grid">
              {GOALS.map((g) => (
                <button key={g.id} type="button" className={`goal${goals.includes(g.id) ? ' on' : ''}`} onClick={() => toggle(g.id)}>
                  <span className="ibub">
                    <Icon name={`goal:${g.id}`} />
                  </span>
                  {g.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary a-lime big-cta" disabled={!goals.length} onClick={next}>
              next →
            </button>
          </>
        )}
        {step === 5 && (
          <>
            <p className="act-q">pick your pet</p>
            <p className="muted">show up a day or two and it hatches, then it grows with you. skip a day? it just gets sleepy. no guilt.</p>
            <div className="pet-pick">
              {PETS.map((x) => (
                <button key={x.id} type="button" className={`pet-opt${petType === x.id ? ' on' : ''}`} onClick={() => setPetType(x.id)} aria-label={x.name} aria-pressed={petType === x.id}>
                  {x.emoji}
                </button>
              ))}
            </div>
            <input className="act-input center" value={pet} onChange={(e) => setPet(e.target.value)} maxLength={16} placeholder={`name your ${chosen.name.toLowerCase()}`} aria-label="Pet name" />
            <button
              type="button"
              className="btn btn-primary a-lime big-cta"
              onClick={() => {
                update(() => ({
                  name: name.trim(),
                  gender: gender || undefined,
                  genderSelf: gender === 'self' ? genderSelf.trim() : undefined,
                  faith: faith || undefined,
                  goals,
                  petType,
                  pet: pet.trim() || chosen.name,
                  onboarded: true,
                }))
                onFinish()
              }}
            >
              🥚 start day 1
            </button>
          </>
        )}
      </div>
      {step > first && (
        <button type="button" className="linkish muted ob-back" onClick={() => setStep(step - 1)}>
          ← back
        </button>
      )}
    </div>
  )
}

// ─── home ─────────────────────────────────────────────────────
const BELIEFS = [
  ['Done > perfect.', 'Ship it at 70%. The world gives feedback, not grades.'],
  ['Your mess is your story.', 'Nobody remembers the flawless ones. They remember the real ones.'],
  ['No secrets that hurt you.', 'Anyone who says “don’t tell your parents” is the red flag.'],
  ['God is free. Middlemen aren’t.', 'Real faith — any faith — never sends a QR code.'],
  ['Your body, your rules.', 'No means no. Silence means no. Only yes means yes.'],
  ['Breathe before you break.', 'Four seconds in. Four seconds hold. You’re back.'],
  ['Brave ≠ fearless.', 'Brave is shaking and doing it anyway.'],
  ['Trees > tantrums.', 'Plant one every birthday. Future you will breathe easier.'],
]

function Home({ onStart }: { onStart: () => void }) {
  const p = useProgress()
  const plus = usePlus()
  const [flows] = useLocalState<Record<string, boolean>>('tool:flow', {})
  const [intent, setIntent] = useLocalState<Intent | null>('tool:intent', null)
  const done = !!flows[todayKey()]
  const streak = streakOf(p)
  const lvl = levelOf(p.xp)
  const todaysIntent = intent?.date === todayKey() ? intent : null

  const active = journeys.find((j) => {
    const n = Object.keys(p.journeys[j.id]?.done ?? {}).length
    return n > 0 && n < j.days.length
  })
  const suggested = journeyById(p.goals.map((g) => goalById(g)?.journey).find(Boolean) ?? 'unperfect-21')
  const plan = active ?? suggested
  const planDay = plan ? Object.keys(p.journeys[plan.id]?.done ?? {}).length + 1 : 1
  const pri = priorities(p.gender)
  // Gender priorities first, then goals — never hiding anything, just ordering it.
  const forYou = [...new Set([...pri.tools.slice(0, 2), ...p.goals.flatMap((g) => goalById(g)?.tools.slice(0, 2) ?? [])])].slice(0, 6)
  const tools = (forYou.length ? forYou : ['focus', 'panic', 'expenses', 'sleep-calc']).map(toolById).filter(Boolean)
  const faith = faithById(p.faith)
  const mixId = p.goals.includes('sleep') ? 'night' : p.goals.includes('focus') ? 'focus' : p.goals.includes('confidence') ? 'brave' : 'morning'
  const mix = MIXES.find((m) => m.id === mixId) ?? MIXES[0]
  const day = dayOfYear()
  const post = posts[day % Math.max(1, posts.length)]
  const lineA = dailyLine(p.faith)
  const lineB = dailyLine(p.faith, true)

  return (
    <>
      <section className="home-hero page">
        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker a-pink s1">no filter ✶</span>
          <span className="sticker a-orange s2">🔥 {streak}-day streak</span>
          <span className="sticker a-sun s3">made in india 🇮🇳</span>
          <span className="sticker a-cyan s4">
            {petEmoji(p)} {p.pet || 'your pet'} · lvl {lvl.level}
          </span>
        </div>
        <p className="kicker">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · hey {p.name || 'you'} 👋
        </p>
        <h1 className="mega">
          <span className="strike">
            Perfection
            <svg className="scribble" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 26 C 60 8, 110 34, 170 18 S 280 6, 330 22 S 380 30, 396 14" />
            </svg>
          </span>
          <br />
          is a <span className="serif">scam.</span>
        </h1>
        <p className="lede">{done ? 'today’s done. you showed up — that’s the whole thing. see you tomorrow.' : 'your 5 minutes are waiting: one mood, one small thing, one line of wisdom. no pressure, no perfect.'}</p>
        <div className="row gap wrap">
          {done ? (
            <span className="btn btn-primary a-lime done-pill">✓ done today · 🔥 {streak}</span>
          ) : (
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={onStart}>
              ▶ start my 5 minutes
            </button>
          )}
          <a className="btn" href="#/listen">
            <Icon name="listen" size={18} /> listen
          </a>
          <a className="btn" href="#/read">
            <Icon name="read" size={18} /> read
          </a>
        </div>
        <a className="home-pet" href="#/me">
          <PetView p={p} size={46} />
          <span>
            <b>{p.pet || 'your pet'}</b> {lvl.level <= 1 ? `is still an egg — ${Math.max(0, (lvl.next?.xp ?? 0) - p.xp)} XP to hatch` : done ? 'is fed & happy 💗' : 'is hungry — your 5 minutes feed them'}
          </span>
          <span className="home-pet-bar" aria-hidden="true">
            <i style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
          </span>
        </a>
        <div className="spin-badge" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path id="home-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#home-circle" textLength="486" lengthAdjust="spacing">
                give zero f*cks about perfect ✶
              </textPath>
            </text>
          </svg>
          <span>✶</span>
        </div>
      </section>

      <div className="marquee-cross">
        <Marquee items={motives} accent="lime" tilt={-2.5} />
        <Marquee items={motives.slice().reverse()} accent="pink" tilt={2} reverse />
      </div>

      <div className="page home-body">
        {todaysIntent && (
          <button
            type="button"
            className={`intent${todaysIntent.done ? ' done' : ''}`}
            onClick={() => {
              if (!todaysIntent.done) {
                log('tool')
                confetti()
              }
              setIntent({ ...todaysIntent, done: !todaysIntent.done })
            }}
          >
            <span className="intent-box">{todaysIntent.done ? '✓' : ''}</span>
            <span>
              <small>today’s one thing</small>
              {todaysIntent.text}
            </span>
          </button>
        )}

        {(!p.gender || !p.faith) && (
          <a className="nudge make-yours" href="#/me">
            ✨ <b>make it yours:</b> add your gender and faith (both optional) so we can put the right stuff first →
          </a>
        )}

        {pri.spotlight && (
          <a className="spotlight" href={`#${pri.spotlight.path}`}>
            <span className="ibub big">
              <Icon name={pri.spotlight.icon} size={28} />
            </span>
            <span className="grow">
              <small>for you first</small>
              <b>{pri.spotlight.title}</b>
              <span>{pri.spotlight.why}</span>
            </span>
            <span className="plan-go">→</span>
          </a>
        )}

        <Section
          kicker="your day"
          title={
            <>
              made for <span className="serif">you</span>
            </>
          }
        >
          <div className="day-grid">
            {plan && (
              <a className="feature-card a-cyan" href={`#/journeys/${plan.id}`}>
                <span className="ibub">
                  <Icon name="explore" />
                </span>
                <b>{active ? 'your plan' : 'try a plan'}</b>
                <small>
                  {plan.title} · day {Math.min(planDay, plan.days.length)}
                </small>
                <span className="feature-go">continue →</span>
              </a>
            )}
            <a className={`feature-card a-${mix.accent}`} href="#/listen">
              <span className="ibub">
                <Icon name="listen" />
              </span>
              <b>listen</b>
              <small>{mix.name} · quotes + music, hands-free</small>
              <span className="feature-go">
                <Icon name="play" size={14} /> play
              </span>
            </a>
            {post && (
              <a className={`feature-card a-${post.accent}`} href={`#/read/${post.slug}`}>
                <span className="ibub">
                  <Icon name="read" />
                </span>
                <b>read</b>
                <small>{post.title}</small>
                <span className="feature-go">{post.minutes} min →</span>
              </a>
            )}
          </div>
          <div className="t-tools home-tools">
            {tools.map((t) => (
              <a key={t!.id} className="t-tool" href={`#/tools/${t!.id}`}>
                <Icon name={t!.id === 'focus' ? 'focus-timer' : t!.id} />
                {t!.name}
              </a>
            ))}
          </div>
        </Section>

        <Section
          kicker={`${AREAS.length} areas · ${TOOLS.length} tools`}
          title={
            <>
              pick your <span className="serif">vibe</span>
            </>
          }
        >
          <div className="zone-grid">
            {AREAS.map((a, i) => (
              <a key={a.id} href={`#/explore/${a.id}`} className={`card zone-card a-${a.accent}`} style={{ animationDelay: `${i * 40}ms` }}>
                <span className="ibub">
                  <Icon name={a.id} />
                </span>
                <h3>{a.name}</h3>
                <p>{a.line}</p>
                <span className="zone-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </Section>

        <Section
          kicker="the manifesto"
          title={
            <>
              8 things we <span className="serif">actually</span> believe
            </>
          }
        >
          <ol className="manifesto">
            {BELIEFS.map(([big, small], i) => (
              <li key={big}>
                <span className="mf-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{big}</strong>
                  <p>{small}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          kicker={faith?.secular ? 'today’s philosophy' : faith && faith.traditions !== 'all' ? `today’s wisdom · ${faith.label}` : 'today’s wisdom · every faith'}
          title={
            <>
              thousands of years old. <span className="serif">still hits.</span>
            </>
          }
        >
          <div className="grid grid-2">
            {[lineA, lineB].map((l, i) => (
              <article key={i} className={`card line-card a-${i ? 'violet' : 'sun'}`}>
                <span className="trad-chip">{l.badge}</span>
                {l.original && (
                  <p className={`orig lang-${l.lang}`} lang={l.lang} dir={l.rtl ? 'rtl' : undefined}>
                    {l.original}
                  </p>
                )}
                <p className="wisdom-text">“{l.text}”</p>
                {l.extra && <p className="wis-extra">💬 {l.extra}</p>}
              </article>
            ))}
          </div>
          <div className="center-row">
            <a className="btn" href="#/library">
              <Icon name="library" size={18} /> open the library
            </a>
          </div>
        </Section>

        <section className="section">
          <p className="kicker">need help right now?</p>
          <div className="help-row">
            <a href="#/tools/panic">
              <Icon name="panic" size={16} /> panic
            </a>
            <a href="#/tools/safe-walk">
              <Icon name="safe-walk" size={16} /> safe walk
            </a>
            <a href="#/shield">
              <Icon name="safety" size={16} /> SOS tools
            </a>
            <a href="tel:14416">
              <Icon name="people" size={16} /> talk · 14416
            </a>
          </div>
          {!plus.active && streak >= 3 && (
            <a className="nudge" href="#/plus">
              🧊 <b>{streak}-day streak.</b> Plus protects it if you miss a day →
            </a>
          )}
        </section>
      </div>
    </>
  )
}

export default function Today() {
  const p = useProgress()
  const [flowOpen, setFlowOpen] = useState(false)
  const [k, setK] = useState(0)
  if (!p.onboarded)
    return (
      <Onboarding
        onFinish={() => {
          window.scrollTo(0, 0)
          setFlowOpen(true)
        }}
      />
    )
  return (
    <>
      <Home key={k} onStart={() => setFlowOpen(true)} />
      {flowOpen && (
        <DailyFlow
          onClose={() => {
            setFlowOpen(false)
            setK(k + 1)
            window.scrollTo(0, 0)
          }}
        />
      )}
    </>
  )
}
