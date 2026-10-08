import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { PetView } from '../components/Pet'
import { shareCard } from '../components/Overlays'
import { DARES, GOALS, KIND_DARES, goalById, type ActionKind } from '../data/app'
import { journeys } from '../data/journeys'
import { FAITHS, GENDERS, PETS, faithById, linesFor, type Line } from '../data/profile'
import { confetti } from '../lib/confetti'
import { levelOf, log, streakOf, update, useProgress, type Progress } from '../lib/progress'
import { dayOfYear, todayKey, useLocalState } from '../lib/storage'

type CheckIn = { mood: number; energy: number; sleep: number; note: string; after?: number }
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
  const [after, setAfter] = useState(checkins[todayKey()]?.after ?? 0)
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
            <div className="after">
              <p className="muted">{after ? (after > mood ? 'that’s the 5 minutes working 💜' : 'that’s okay. showing up counts.') : 'and now, how are you?'}</p>
              <div className="mood-pick sm">
                {MOODS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={after === i + 1 ? 'on' : ''}
                    onClick={() => {
                      setAfter(i + 1)
                      setCheckins((c) => ({ ...c, [todayKey()]: { ...(c[todayKey()] ?? { mood, energy: 0, sleep: 0, note: '' }), after: i + 1 } }))
                    }}
                    aria-label={`Now: ${i + 1} of 5`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
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
// Two steps: 0 what you want help with · 1 pick and name your pet. Then straight into day 1.
// Name, faith and gender are asked later (see MakeItYours) — they only reorder things, so they can wait.
function Onboarding({ onFinish }: { onFinish: () => void }) {
  const p = useProgress()
  // Full focus while onboarding: no tab bar or footer.
  useEffect(() => {
    document.body.classList.add('onboarding')
    return () => document.body.classList.remove('onboarding')
  }, [])
  const [step, setStep] = useState(0)
  const [goals, setGoals] = useState<string[]>(p.goals)
  const [petType, setPetType] = useState(p.petType || 'cat')
  const [pet, setPet] = useState(p.pet || '')
  const toggle = (id: string) => setGoals(goals.includes(id) ? goals.filter((g) => g !== id) : goals.length < 3 ? [...goals, id] : goals)
  const chosen = PETS.find((x) => x.id === petType) ?? PETS[0]

  return (
    <div className="onboard">
      <div className="fs-dots">
        {[0, 1].map((d) => (
          <span key={d} className={d < step ? 'past' : d === step ? 'now' : ''} />
        ))}
      </div>
      <div className="ob-body" key={step}>
        {step === 0 && (
          <>
            {p.name && <p className="kicker">welcome, {p.name} 🌱</p>}
            <p className="act-q">what do you want help with?</p>
            <p className="muted">pick up to 3. this decides what your 5 minutes look like.</p>
            <div className="goal-grid">
              {GOALS.map((g) => (
                <button key={g.id} type="button" className={`goal${goals.includes(g.id) ? ' on' : ''}`} onClick={() => toggle(g.id)} aria-pressed={goals.includes(g.id)}>
                  <span className="ibub">
                    <Icon name={`goal:${g.id}`} />
                  </span>
                  {g.label}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary a-lime big-cta" disabled={!goals.length} onClick={() => setStep(1)}>
              next →
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <p className="act-q">pick a pet to show up for</p>
            <p className="muted">it hatches in a day or two, then grows with you. skip a day? it just gets sleepy. no guilt.</p>
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
                update(() => ({ goals, petType, pet: pet.trim() || chosen.name, onboarded: true }))
                onFinish()
              }}
            >
              🥚 start day 1
            </button>
          </>
        )}
      </div>
      {step > 0 && (
        <button type="button" className="linkish muted ob-back" onClick={() => setStep(0)}>
          ← back
        </button>
      )}
    </div>
  )
}

// ─── home ─────────────────────────────────────────────────────
/** After your first finished day: one optional question at a time (name → faith → gender). Each can be skipped; none is asked twice. */
function MakeItYours() {
  const p = useProgress()
  const [asked, setAsked] = useLocalState<string[]>('home:asked', [])
  const [name, setName] = useState('')
  const next = (['name', 'faith', 'gender'] as const).find((k) => !asked.includes(k) && !(k === 'name' ? p.name : k === 'faith' ? p.faith : p.gender))
  if (!next) return null
  const skip = () => setAsked([...asked, next])
  const pick = (patch: Partial<Progress>) => {
    update(() => patch)
    skip()
  }
  return (
    <section className="h2-card h2-yours" aria-label="Make it yours">
      <p className="kicker">make it yours · optional</p>
      {next === 'name' && (
        <>
          <p className="h2-q">what should we call you?</p>
          <div className="h2-inline">
            <input className="act-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="name or nickname" maxLength={16} aria-label="Your name" />
            <button type="button" className="btn btn-primary a-lime" disabled={!name.trim()} onClick={() => pick({ name: name.trim() })}>
              save
            </button>
          </div>
        </>
      )}
      {next === 'faith' && (
        <>
          <p className="h2-q">your faith?</p>
          <p className="muted">we’ll put your scripture and quotes first. every faith stays open to everyone.</p>
          <div className="chip-scroll">
            {FAITHS.map((f) => (
              <button key={f.id} type="button" className="chip" onClick={() => pick({ faith: f.id })}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        </>
      )}
      {next === 'gender' && (
        <>
          <p className="h2-q">how do you identify?</p>
          <p className="muted">it only changes what we suggest first, never what you can see.</p>
          <div className="chip-scroll">
            {GENDERS.filter((g) => g.id !== 'self').map((g) => (
              <button key={g.id} type="button" className="chip" onClick={() => pick({ gender: g.id })}>
                {g.label}
              </button>
            ))}
          </div>
        </>
      )}
      <button type="button" className="linkish muted" onClick={skip}>
        not now
      </button>
    </section>
  )
}

function Home({ onStart }: { onStart: () => void }) {
  const p = useProgress()
  const [flows] = useLocalState<Record<string, boolean>>('tool:flow', {})
  const [intent, setIntent] = useLocalState<Intent | null>('tool:intent', null)
  const done = !!flows[todayKey()]
  const streak = streakOf(p)
  const lvl = levelOf(p.xp)
  const todaysIntent = intent?.date === todayKey() ? intent : null

  // A plan shows up only once you've started one — no pitching.
  const plan = journeys.find((j) => {
    const n = Object.keys(p.journeys[j.id]?.done ?? {}).length
    return n > 0 && n < j.days.length
  })
  const planDay = plan ? Object.keys(p.journeys[plan.id]?.done ?? {}).length + 1 : 0
  const faith = faithById(p.faith)
  const line = dailyLine(p.faith)

  const petLine =
    lvl.level <= 1 ? `still an egg · ${Math.max(0, (lvl.next?.xp ?? 0) - p.xp)} XP to hatch` : done ? 'fed and happy 💗' : 'hungry · your 5 minutes feed them'

  return (
    <div className="page home2">
      <header className="h2-top">
        <p className="kicker">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        <h1 className="h2-greet">hey {p.name || 'you'} 👋</h1>
      </header>

      <section className={`h2-card h2-main${done ? ' done' : ''}`}>
        <a className="h2-pet" href="#/me" aria-label={`${p.pet || 'Your pet'} — open Me`}>
          <PetView p={p} size={64} />
          <span className="h2-pet-text">
            <span className="h2-pet-name">
              <b>{p.pet || 'your pet'}</b> · lvl {lvl.level}
            </span>
            <span className="h2-pet-line">{petLine}</span>
          </span>
          <span className="home-pet-bar" aria-hidden="true">
            <i style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
          </span>
        </a>
        {done ? (
          <div className="h2-done">
            <b>✓ done today · 🔥 {streak}</b>
            <span>you showed up. that’s the whole thing. see you tomorrow.</span>
          </div>
        ) : (
          <>
            <button type="button" className="btn btn-primary a-lime big-cta" onClick={onStart}>
              ▶ start my 5 minutes
            </button>
            <p className="h2-hint">{streak ? `🔥 ${streak}-day streak · ` : ''}how you feel → one small thing → one line of wisdom</p>
          </>
        )}
      </section>

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

      {plan && (
        <a className="h2-plan" href={`#/journeys/${plan.id}`}>
          <span className="grow">
            <small>your plan · day {Math.min(planDay, plan.days.length)} of {plan.days.length}</small>
            <b>{plan.title}</b>
          </span>
          <span className="plan-go">→</span>
        </a>
      )}

      <article className="h2-card h2-line">
        <p className="kicker">{faith?.secular ? 'today’s philosophy' : faith && faith.traditions !== 'all' ? `today’s line · ${faith.label}` : 'today’s line'}</p>
        <span className="trad-chip">{line.badge}</span>
        <p className="wisdom-text">“{line.text}”</p>
        {line.extra && <p className="wis-extra">💬 {line.extra}</p>}
        <div className="h2-line-foot">
          {line.original && (
            <details className="h2-orig">
              <summary>original</summary>
              <p className={`orig lang-${line.lang}`} lang={line.lang} dir={line.rtl ? 'rtl' : undefined}>
                {line.original}
              </p>
            </details>
          )}
          <a className="linkish" href="#/library/faith">
            more →
          </a>
        </div>
      </article>

      {Object.values(flows).some(Boolean) && <MakeItYours />}

      <section className="h2-help" aria-label="Need help right now?">
        <span className="h2-help-l">need help?</span>
        <div className="help-row">
          <a href="#/tools/panic">
            <Icon name="panic" size={16} /> panic
          </a>
          <a href="#/tools/safe-walk">
            <Icon name="safe-walk" size={16} /> safe walk
          </a>
          <a href="#/shield">
            <Icon name="safety" size={16} /> SOS
          </a>
          <a href="tel:14416">
            <Icon name="people" size={16} /> 14416
          </a>
        </div>
      </section>

    </div>
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
