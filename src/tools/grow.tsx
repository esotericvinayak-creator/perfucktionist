import { useEffect, useMemo, useRef, useState } from 'react'
import { PlusBadge, shareCard } from '../components/Overlays'
import { CopyButton } from '../components/ui'
import { confetti } from '../lib/confetti'
import { log } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { pick } from '../lib/storage'
import { Card, Choice, Empty, List, PlusOnly, QuickAdd, Ring, Stat, Stats, Text, addDays, compact, daysBetween, lastDays, mmss, shortDate, today, uid, useCountdown, useTool } from './kit'
import { ToolChips } from './links'

// ─── Habit tracker ────────────────────────────────────────────
type Habit = { id: string; name: string; emoji: string; done: string[] }
const HABIT_EMOJI = ['💧', '📖', '🏃', '🧘', '🥗', '😴', '📵', '✍️', '🎸', '💊']

const habitStreak = (h: Habit) => {
  let d = h.done.includes(today()) ? today() : addDays(today(), -1)
  let n = 0
  while (h.done.includes(d)) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export function Habits() {
  const plus = usePlus()
  const [habits, setHabits] = useTool<Habit[]>('habits', [])
  const [emoji, setEmoji] = useState('💧')
  const week = lastDays(7)
  const canAdd = plus.active || habits.length < 3
  const toggle = (h: Habit, d: string) => {
    const on = h.done.includes(d)
    setHabits(habits.map((x) => (x.id === h.id ? { ...x, done: on ? x.done.filter((y) => y !== d) : [...x.done, d] } : x)))
    if (!on) log('habit')
  }
  return (
    <div className="stack">
      {canAdd ? (
        <>
          <div className="row gap-sm wrap">
            {HABIT_EMOJI.map((e) => (
              <button key={e} type="button" className={`chip${emoji === e ? ' on' : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
          <QuickAdd placeholder="new habit: drink water, read 10 pages…" onAdd={(name) => setHabits([...habits, { id: uid(), name, emoji, done: [] }])} />
        </>
      ) : (
        <p className="muted">
          <PlusBadge small /> Free tracks 3 habits. <a href="#/plus">Plus</a> = unlimited.
        </p>
      )}
      {habits.length ? (
        <div className="habit-grid">
          <span />
          {week.map((d) => (
            <span key={d} className="hg-day">
              {new Date(`${d}T00:00`).toLocaleDateString('en-IN', { weekday: 'narrow' })}
            </span>
          ))}
          <span />
          {habits.map((h) => (
            <div key={h.id} className="hg-row">
              <span className="hg-name">
                {h.emoji} {h.name}
              </span>
              {week.map((d) => (
                <button key={d} type="button" className={`hg-cell${h.done.includes(d) ? ' on' : ''}${d === today() ? ' today' : ''}`} onClick={() => toggle(h, d)} aria-label={`${h.name} on ${shortDate(d)}`} aria-pressed={h.done.includes(d)} />
              ))}
              <span className="hg-streak">🔥{habitStreak(h)}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty emoji="📅">Start with one tiny habit. Tiny is the point.</Empty>
      )}
      {habits.length > 0 && (
        <details>
          <summary className="muted">edit habits</summary>
          <List items={habits} onRemove={(h) => setHabits(habits.filter((x) => x.id !== h.id))} render={(h) => `${h.emoji} ${h.name} · ${h.done.length} days total`} />
        </details>
      )}
    </div>
  )
}

// ─── Quit tracker ─────────────────────────────────────────────
type Quit = { id: string; what: string; since: string; perDay: number; best: number }
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]

export function QuitTool() {
  const [quits, setQuits] = useTool<Quit[]>('quits', [])
  const [what, setWhat] = useState('')
  const [perDay, setPerDay] = useState(100)
  return (
    <div className="stack">
      <div className="row gap-sm wrap">
        {['💨 vaping', '🚬 smoking', '🍺 drinking', '📱 reels', '🔞 porn', '🥤 cold drinks', '🎰 betting apps'].map((w) => (
          <button key={w} type="button" className={`chip${what === w ? ' on' : ''}`} onClick={() => setWhat(w)}>
            {w}
          </button>
        ))}
      </div>
      <form
        className="row gap-sm wrap"
        onSubmit={(e) => {
          e.preventDefault()
          if (!what.trim()) return
          setQuits([...quits, { id: uid(), what: what.trim(), since: today(), perDay, best: 0 }])
          setWhat('')
          log('tool')
        }}
      >
        <input className="grow" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="what are you quitting?" aria-label="Habit to quit" />
        <label className="num">
          <span>₹ per day it cost</span>
          <span className="num-box">
            <i>₹</i>
            <input type="number" value={perDay} onChange={(e) => setPerDay(Number(e.target.value))} />
          </span>
        </label>
        <button type="submit" className="btn btn-primary a-cyan">
          start
        </button>
      </form>
      {quits.length ? (
        quits.map((q) => {
          const days = daysBetween(q.since, today())
          const next = MILESTONES.find((m) => m > days) ?? days + 30
          return (
            <Card key={q.id} className="quit-card">
              <div className="row space-between">
                <b>{q.what}</b>
                <button type="button" className="x" aria-label="Remove" onClick={() => setQuits(quits.filter((x) => x.id !== q.id))}>
                  ×
                </button>
              </div>
              <Stats>
                <Stat value={days} label="days free" />
                <Stat value={compact(days * q.perDay)} label="money saved" />
                <Stat value={Math.max(q.best, days)} label="best streak" />
              </Stats>
              <p className="muted">next milestone: {next} days ({next - days} to go)</p>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setQuits(quits.map((x) => (x.id === q.id ? { ...x, best: Math.max(x.best, days), since: today() } : x)))}>
                I slipped — restart (a slip isn’t failure)
              </button>
            </Card>
          )
        })
      ) : (
        <Empty emoji="🚭">Pick the thing. Watch the days and the money stack up.</Empty>
      )}
      <ToolChips ids={['urge']} title="craving hit?" />
    </div>
  )
}

// ─── Time capsule ─────────────────────────────────────────────
type Letter = { id: string; written: string; openOn: string; text: string; opened?: boolean }

export function Capsule() {
  const [letters, setLetters] = useTool<Letter[]>('capsule', [])
  const [text, setText] = useState('')
  const [when, setWhen] = useState(180)
  const [reading, setReading] = useState<Letter | null>(null)
  if (reading)
    return (
      <div className="stack">
        <Card className="letter">
          <p className="kicker">written {shortDate(reading.written)} · to you</p>
          <p className="letter-text">{reading.text}</p>
        </Card>
        <button type="button" className="btn btn-sm" onClick={() => setReading(null)}>
          close
        </button>
      </div>
    )
  return (
    <div className="stack">
      <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Dear future me… what are you worried about right now? what do you hope has changed?" aria-label="Letter" />
      <Choice options={[30, 180, 365, 730].map((d) => ({ value: d, label: d === 30 ? '1 month' : d === 180 ? '6 months' : d === 365 ? '1 year' : '2 years' }))} value={when} onChange={setWhen} />
      <button
        type="button"
        className="btn btn-primary a-violet"
        disabled={!text.trim()}
        onClick={() => {
          setLetters([...letters, { id: uid(), written: today(), openOn: addDays(today(), when), text: text.trim() }])
          setText('')
          log('journal')
        }}
      >
        💌 seal it
      </button>
      {letters.length > 0 && (
        <ul className="tlist">
          {letters.map((l) => {
            const left = daysBetween(today(), l.openOn)
            return (
              <li key={l.id}>
                <span className="grow">
                  {left > 0 ? '🔒' : '💌'} from {shortDate(l.written)}
                </span>
                {left > 0 ? (
                  <span className="muted">opens in {left}d</span>
                ) : (
                  <button type="button" className="btn btn-sm btn-primary a-violet" onClick={() => (setReading(l), setLetters(letters.map((x) => (x.id === l.id ? { ...x, opened: true } : x))))}>
                    open
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Bucket list ──────────────────────────────────────────────
type Bucket = { id: string; text: string; done: boolean }
const IDEAS = ['🌄 sunrise trek', '🎒 solo trip', '🏊 learn to swim', '🩸 donate blood', '🎸 learn an instrument', '🏃 run a 5k', '🎤 go to a concert alone', '🛕 Varanasi ghats at dawn', '💡 start a side hustle', '🧑‍🍳 cook for my family', '🐢 volunteer for a week', '🗣️ learn a new language']

export function BucketList() {
  const [items, setItems] = useTool<Bucket[]>('bucket', [])
  const done = items.filter((i) => i.done).length
  return (
    <div className="stack">
      <QuickAdd placeholder="something before 30…" onAdd={(text) => setItems([...items, { id: uid(), text, done: false }])} />
      <div className="row gap-sm wrap">
        {IDEAS.filter((i) => !items.some((x) => x.text === i)).slice(0, 6).map((i) => (
          <button key={i} type="button" className="chip" onClick={() => setItems([...items, { id: uid(), text: i, done: false }])}>
            + {i}
          </button>
        ))}
      </div>
      {items.length > 0 && <p className="muted">{done} / {items.length} done</p>}
      <ul className="check-steps">
        {items.map((i) => (
          <li key={i.id}>
            <label className={i.done ? 'on' : ''}>
              <input
                type="checkbox"
                checked={i.done}
                onChange={(e) => {
                  setItems(items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))
                  if (!i.done) {
                    const r = e.currentTarget.getBoundingClientRect()
                    confetti(r.left, r.top)
                    log('tool')
                  }
                }}
              />
              <span className="box">{i.done ? '✓' : ''}</span>
              <span>{i.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Wallpaper maker ──────────────────────────────────────────
const WALL_IDEAS = ['done > perfect.', 'I am becoming, not behind.', 'not my problem today.', 'hydrate. breathe. go.', 'small steps still move me.', 'main character energy only.']

export function Wallpaper() {
  const [text, setText] = useState(WALL_IDEAS[0])
  const [kicker, setKicker] = useState('reminder')
  return (
    <div className="stack">
      <div className="row gap-sm wrap">
        {WALL_IDEAS.map((w) => (
          <button key={w} type="button" className={`chip${text === w ? ' on' : ''}`} onClick={() => setText(w)}>
            {w}
          </button>
        ))}
      </div>
      <Text label="your words" value={text} onChange={setText} max={120} />
      <Text label="small label on top" value={kicker} onChange={setKicker} max={30} />
      <button type="button" className="btn btn-primary a-violet big-cta" disabled={!text.trim()} onClick={() => (shareCard({ kicker, text }), log('tool', { silent: true }))}>
        🖼️ design my wallpaper
      </button>
    </div>
  )
}

// ─── Dopamine menu ────────────────────────────────────────────
const MENU_DEFAULT: Record<string, string[]> = {
  '🥗 starters · 5 min': ['dance to one song', 'walk around the block', 'splash cold water on face', 'make a cup of chai', 'stretch for 3 min', 'step into sunlight'],
  '🍛 mains · 30+ min': ['workout', 'cook something new', 'call a friend', 'read a chapter', 'make something (draw, write, edit)', 'go for a long walk'],
  '🎧 sides · while doing chores': ['a podcast', 'favourite playlist', 'an audiobook', 'rain sounds'],
  '🍰 desserts · small portions': ['reels (set a 10-min timer)', 'one gaming match', 'one episode', 'window shopping (no buying)'],
}

export function Dopamine() {
  const [menu, setMenu] = useTool<Record<string, string[]>>('dopamine', MENU_DEFAULT)
  const [order, setOrder] = useState<string | null>(null)
  const sections = Object.keys(menu)
  return (
    <div className="stack">
      <div className="row gap-sm wrap center">
        <button type="button" className="btn btn-primary a-lime" onClick={() => (setOrder(pick(menu[sections[0]])), log('tool', { silent: true }))}>
          🎲 quick hit
        </button>
        <button type="button" className="btn" onClick={() => setOrder(pick(menu[sections[1]]))}>
          🎲 something real
        </button>
      </div>
      {order && (
        <Card className="focus-card">
          <p className="kicker">your order</p>
          <p className="big-q">{order}</p>
        </Card>
      )}
      {sections.map((s) => (
        <details key={s} open={s === sections[0]}>
          <summary className="kicker">{s}</summary>
          <div className="row gap-sm wrap">
            {menu[s].map((item) => (
              <button key={item} type="button" className="chip" title="tap to remove" onClick={() => setMenu({ ...menu, [s]: menu[s].filter((x) => x !== item) })}>
                {item} ×
              </button>
            ))}
          </div>
          <QuickAdd placeholder="add your own" onAdd={(v) => setMenu({ ...menu, [s]: [...menu[s], v] })} />
        </details>
      ))}
    </div>
  )
}

// ─── Career compass (RIASEC) ──────────────────────────────────
const TYPES: Record<string, { emoji: string; name: string; careers: string[] }> = {
  R: { emoji: '🔧', name: 'Builder', careers: ['mechanical / civil engineer', 'pilot', 'chef', 'physiotherapist', 'EV technician', 'agri-tech'] },
  I: { emoji: '🔬', name: 'Thinker', careers: ['data scientist', 'doctor / researcher', 'software engineer', 'psychologist', 'economist', 'cybersecurity analyst'] },
  A: { emoji: '🎨', name: 'Creator', careers: ['UX / graphic designer', 'content creator', 'architect', 'writer / journalist', 'filmmaker', 'fashion designer'] },
  S: { emoji: '🤝', name: 'Helper', careers: ['teacher', 'counsellor / therapist', 'nurse', 'HR', 'NGO / social work', 'sports coach'] },
  E: { emoji: '🚀', name: 'Persuader', careers: ['founder', 'marketer', 'lawyer', 'business development', 'product manager', 'civil services'] },
  C: { emoji: '📋', name: 'Organizer', careers: ['chartered accountant', 'banker', 'data analyst', 'operations manager', 'actuary', 'govt exams (SSC / banking)'] },
}
const CQ: [string, string][] = [
  ['R', 'Fixing or building things with your hands'],
  ['I', 'Figuring out how things work, solving puzzles'],
  ['A', 'Designing, drawing, writing or making videos'],
  ['S', 'Helping friends with their problems'],
  ['E', 'Leading a team or convincing people'],
  ['C', 'Planning, organising, making neat spreadsheets'],
  ['R', 'Working outdoors or with machines and tools'],
  ['I', 'Science, data, research, deep-diving a topic'],
  ['A', 'Expressing ideas in your own style'],
  ['S', 'Teaching or explaining things to people'],
  ['E', 'Starting your own thing, selling an idea'],
  ['C', 'Clear rules and getting details exactly right'],
]

export function Career() {
  const [i, setI] = useState(0)
  const [score, setScore] = useState<Record<string, number>>({})
  if (i < CQ.length)
    return (
      <div className="stack center-stack">
        <p className="kicker">
          {i + 1} / {CQ.length} · would you enjoy…
        </p>
        <p className="big-q">{CQ[i][1]}</p>
        <div className="row gap-sm">
          {[
            ['😐 meh', 0],
            ['🙂 kinda', 1],
            ['😍 love it', 2],
          ].map(([l, v]) => (
            <button key={l} type="button" className="btn" onClick={() => (setScore({ ...score, [CQ[i][0]]: (score[CQ[i][0]] ?? 0) + Number(v) }), setI(i + 1))}>
              {l}
            </button>
          ))}
        </div>
      </div>
    )
  const top = Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k)
  return (
    <div className="stack">
      <p className="big-q center">you’re a {top.map((k) => `${TYPES[k].emoji} ${TYPES[k].name}`).join(' + ')}</p>
      <div className="two-up">
        {top.map((k) => (
          <Card key={k}>
            <p className="kicker">
              {TYPES[k].emoji} {TYPES[k].name} paths
            </p>
            <ul className="dot-list">
              {TYPES[k].careers.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="muted">Based on the Holland (RIASEC) interest model. A starting point for exploring — not your destiny. Talk to people actually doing these jobs.</p>
      <ToolChips ids={['interview', 'decide']} />
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => (setI(0), setScore({}))}>
        retake
      </button>
    </div>
  )
}

// ─── Interview prep ───────────────────────────────────────────
const IQ = ['Tell me about yourself.', 'Why do you want this role?', 'What’s your greatest strength?', 'What’s a real weakness, and how are you working on it?', 'Tell me about a time you failed.', 'Tell me about a conflict with a teammate.', 'Tell me about a time you led something.', 'Where do you see yourself in 5 years?', 'Why should we hire you?', 'What project are you proudest of?', 'How do you handle pressure and deadlines?', 'How do you learn something new fast?', 'Explain a gap or low marks on your resume.', 'What are your salary expectations?', 'Do you have any questions for us?']

export function Interview() {
  const [mode, setMode] = useState<'practice' | 'star'>('practice')
  const [q, setQ] = useState(IQ[0])
  const t = useCountdown()
  const [star, setStar] = useState({ s: '', t: '', a: '', r: '' })
  const answer = `${star.s} ${star.t} ${star.a} ${star.r}`.trim()
  return (
    <div className="stack">
      <Choice
        options={[
          { value: 'practice', label: '🎤 practice out loud' },
          { value: 'star', label: '⭐ STAR answer builder' },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'practice' ? (
        <div className="stack center-stack">
          <Card className="focus-card">
            <p className="big-q">{q}</p>
          </Card>
          <Ring progress={t.progress} size={170}>
            <b className="ring-time">{t.running ? mmss(t.left) : '2:00'}</b>
            <span>answer out loud</span>
          </Ring>
          <div className="row gap-sm">
            <button type="button" className="btn btn-primary a-lime" onClick={() => (t.start(120), log('tool', { silent: true }))}>
              ▶ start 2 min
            </button>
            <button type="button" className="btn" onClick={() => (t.stop(), setQ(pick(IQ, q)))}>
              next question
            </button>
          </div>
          <p className="muted">Aim for 60–90 seconds. Record yourself once — it’s cringe and it works.</p>
        </div>
      ) : (
        <div className="stack">
          <Text label="S · situation — where were you?" value={star.s} onChange={(s) => setStar({ ...star, s })} placeholder="In my 3rd year, our college fest sponsor dropped out a week before." area />
          <Text label="T · task — what needed doing?" value={star.t} onChange={(v) => setStar({ ...star, t: v })} placeholder="I had to find ₹50,000 in 7 days." area />
          <Text label="A · action — what did YOU do?" value={star.a} onChange={(a) => setStar({ ...star, a })} placeholder="I made a 1-page pitch and called 40 local businesses." area />
          <Text label="R · result — what happened? numbers help" value={star.r} onChange={(r) => setStar({ ...star, r })} placeholder="We raised ₹62,000 from 6 sponsors and the fest ran on time." area />
          {answer && (
            <Card>
              <p className="kicker">your answer</p>
              <p>{answer}</p>
              <CopyButton text={answer} />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Decision maker ───────────────────────────────────────────
type Factor = { id: string; name: string; weight: number }

export function Decide() {
  const [options, setOptions] = useState<string[]>([])
  const [factors, setFactors] = useState<Factor[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [flip, setFlip] = useState<string | null>(null)
  const total = (o: string) => factors.reduce((a, f) => a + (scores[`${o}|${f.id}`] ?? 3) * f.weight, 0)
  const ranked = useMemo(() => [...options].sort((a, b) => total(b) - total(a)), [options, factors, scores])
  return (
    <div className="stack">
      <QuickAdd placeholder="an option (e.g. BCom, BBA, gap year)" onAdd={(o) => !options.includes(o) && options.length < 4 && setOptions([...options, o])} button="+ option" />
      <QuickAdd placeholder="what matters (money, interest, location…)" onAdd={(name) => setFactors([...factors, { id: uid(), name, weight: 2 }])} button="+ factor" />
      {options.length > 1 && factors.length > 0 && (
        <div className="decide-grid" style={{ gridTemplateColumns: `minmax(110px, 1.2fr) repeat(${options.length}, 1fr)` }}>
          <span />
          {options.map((o) => (
            <b key={o}>{o}</b>
          ))}
          {factors.map((f) => (
            <div key={f.id} className="dg-row">
              <span>
                {f.name}
                <button type="button" className="weight" onClick={() => setFactors(factors.map((x) => (x.id === f.id ? { ...x, weight: (x.weight % 3) + 1 } : x)))}>
                  {'★'.repeat(f.weight)}
                </button>
              </span>
              {options.map((o) => {
                const k = `${o}|${f.id}`
                const v = scores[k] ?? 3
                return (
                  <button key={k} type="button" className={`score s${v}`} onClick={() => setScores({ ...scores, [k]: (v % 5) + 1 })} aria-label={`${o} ${f.name}: ${v} of 5`}>
                    {v}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
      {options.length > 1 && factors.length > 0 && (
        <>
          <p className="muted">tap a score to change it (1–5) · tap ★ to set how much a factor matters</p>
          <div className="verdict ok">
            <b>{ranked[0]}</b>
            <span>wins on what you said matters ({total(ranked[0])} pts vs {total(ranked[1])})</span>
          </div>
        </>
      )}
      {options.length > 1 && (
        <Card>
          <p className="kicker">gut check</p>
          <button type="button" className="btn btn-sm" onClick={() => (setFlip(pick(options, flip ?? undefined)), log('tool', { silent: true }))}>
            🪙 flip a coin
          </button>
          {flip && (
            <p className="big-q">
              it says: <b>{flip}</b>. relieved, or disappointed? that feeling is your answer.
            </p>
          )}
        </Card>
      )}
      {options.length > 0 && (
        <div className="row gap-sm wrap">
          {options.map((o) => (
            <button key={o} type="button" className="chip on" onClick={() => setOptions(options.filter((x) => x !== o))}>
              {o} ×
            </button>
          ))}
        </div>
      )}
      {options.length < 2 && <Empty emoji="⚖️">Add 2–4 options and what matters to you.</Empty>}
    </div>
  )
}

// ─── Speaking coach (Plus) ────────────────────────────────────
type SR = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
}
const FILLERS = /\b(um+|uh+|er+|like|basically|actually|literally|you know|i mean|kind of|sort of|matlab)\b/gi

export function Speak() {
  const Ctor = (window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition
  const [on, setOn] = useState(false)
  const [text, setText] = useState('')
  const [startAt, setStartAt] = useState(0)
  const [secs, setSecs] = useState(0)
  const rec = useRef<SR | null>(null)
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => setSecs(Math.round((Date.now() - startAt) / 1000)), 500)
    return () => clearInterval(id)
  }, [on, startAt])
  useEffect(() => () => rec.current?.stop(), [])
  const fillers = (text.match(FILLERS) ?? []).reduce<Record<string, number>>((m, f) => ({ ...m, [f.toLowerCase()]: (m[f.toLowerCase()] ?? 0) + 1 }), {})
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const wpm = secs > 5 ? Math.round(words / (secs / 60)) : 0
  const start = () => {
    if (!Ctor) return
    const r = new Ctor()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-IN'
    let finalText = ''
    r.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finalText += `${res[0].transcript} `
        else interim += res[0].transcript
      }
      setText(finalText + interim)
    }
    r.onend = () => setOn(false)
    rec.current = r
    setText('')
    setStartAt(Date.now())
    setSecs(0)
    r.start()
    setOn(true)
  }
  return (
    <PlusOnly title="Count your “umm”s" why="Talk for a minute — it live-transcribes you, counts filler words and measures your pace. The fastest way to sound confident.">
      {!Ctor ? (
        <Empty emoji="🎙️">Your browser doesn’t support speech recognition. Try Chrome or Edge.</Empty>
      ) : (
        <div className="stack center-stack">
          <button
            type="button"
            className={`mic${on ? ' on' : ''}`}
            onClick={() => {
              if (on) {
                rec.current?.stop()
                setOn(false)
                log('tool')
              } else start()
            }}
          >
            {on ? '■' : '🎙️'}
          </button>
          <p className="muted">{on ? `listening… ${mmss(secs)}` : 'tap and talk about anything for a minute'}</p>
          {text && (
            <>
              <Stats>
                <Stat value={Object.values(fillers).reduce((a, b) => a + b, 0)} label="filler words" />
                <Stat value={wpm || '—'} label="words / min" />
                <Stat value={words} label="words" />
              </Stats>
              {Object.keys(fillers).length > 0 && (
                <div className="row gap-sm wrap">
                  {Object.entries(fillers).map(([f, n]) => (
                    <span key={f} className="chip on">
                      “{f}” ×{n}
                    </span>
                  ))}
                </div>
              )}
              <Card>
                <p className="transcript">
                  {text}
                </p>
              </Card>
              <p className="muted">{wpm > 170 ? 'a bit fast — pause between ideas.' : wpm && wpm < 110 ? 'a bit slow — keep the energy up.' : wpm ? 'great pace.' : ''}</p>
            </>
          )}
        </div>
      )}
    </PlusOnly>
  )
}

