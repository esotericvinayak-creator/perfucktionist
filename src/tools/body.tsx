import { useEffect, useState } from 'react'
import { ambient } from '../lib/ambient'
import { log } from '../lib/progress'
import { bell, chime, unlockAudio } from '../lib/sound'
import { Card, Choice, Columns, Done, Ring, Stat, Stats, addDays, daysBetween, lastDays, shortDate, today, useCountdown, useTool } from './kit'
import { ToolChips } from './links'

const say = (text: string) => {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1.05
  window.speechSynthesis.speak(u)
}

// ─── Guided routine (workout + stretches) ─────────────────────
type Move = { emoji: string; name: string; tip: string }

function Routine({ moves, work, rest, kind }: { moves: Move[]; work: number; rest: number; kind: 'move' | 'tool' }) {
  const [voice, setVoice] = useTool('routine-voice', true)
  const [i, setI] = useState(-1)
  const [phase, setPhase] = useState<'idle' | 'ready' | 'work' | 'rest' | 'done'>('idle')
  const t = useCountdown(() => {
    if (phase === 'ready' || phase === 'rest') {
      chime(true)
      setPhase('work')
      t.start(work)
      if (voice) say(`${moves[i].name}. go!`)
    } else if (phase === 'work') {
      if (i >= moves.length - 1) {
        bell()
        setPhase('done')
        log(kind)
        if (voice) say('Done. Amazing work.')
        return
      }
      chime(false)
      setI(i + 1)
      setPhase('rest')
      t.start(rest)
      if (voice) say(`Rest. Next: ${moves[i + 1].name}`)
    }
  })
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (phase === 'idle')
    return (
      <div className="stack">
        <ol className="move-list">
          {moves.map((m) => (
            <li key={m.name}>
              <span>{m.emoji}</span> {m.name}
            </li>
          ))}
        </ol>
        <label className="toggle">
          <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
          <span>voice coach</span>
        </label>
        <button
          type="button"
          className="btn btn-primary a-orange big-cta"
          onClick={() => {
            unlockAudio()
            setI(0)
            setPhase('ready')
            t.start(5)
            if (voice) say(`Get ready. First: ${moves[0].name}`)
          }}
        >
          ▶ start · {Math.round((moves.length * (work + rest)) / 60)} min
        </button>
      </div>
    )
  if (phase === 'done')
    return (
      <div className="stack">
        <Done emoji="💪" title="done. your body says thanks." />
        <ToolChips ids={['water', 'stretch']} />
      </div>
    )
  const m = moves[i]
  return (
    <div className="stack center-stack">
      <p className="kicker">
        {phase === 'work' ? `${i + 1} / ${moves.length}` : phase === 'ready' ? 'get ready' : 'rest · up next'}
      </p>
      <Ring progress={t.progress}>
        <span className="routine-emoji">{m.emoji}</span>
        <b className="ring-time">{t.left}</b>
      </Ring>
      <h3 className="routine-name">{m.name}</h3>
      <p className="muted">{m.tip}</p>
      <div className="row gap-sm">
        <button type="button" className="btn" onClick={() => (t.paused ? t.resume() : t.pause())}>
          {t.paused ? '▶' : '❚❚'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => (t.stop(), setPhase('idle'))}>
          ■ stop
        </button>
      </div>
    </div>
  )
}

const WORKOUT: Move[] = [
  { emoji: '⭐', name: 'Jumping jacks', tip: 'Light on your feet. Arms all the way up.' },
  { emoji: '🧱', name: 'Wall sit', tip: 'Back flat on the wall, knees at 90°.' },
  { emoji: '💪', name: 'Push-ups', tip: 'Knees down is totally fine.' },
  { emoji: '🌀', name: 'Crunches', tip: 'Lift with your abs, not your neck.' },
  { emoji: '🪜', name: 'Step-ups on a chair', tip: 'Use a sturdy chair. Alternate legs.' },
  { emoji: '🍑', name: 'Squats', tip: 'Sit back like there’s a chair behind you.' },
  { emoji: '🪑', name: 'Triceps dips on a chair', tip: 'Elbows point back, not out.' },
  { emoji: '📏', name: 'Plank', tip: 'Straight line, head to heels. Breathe.' },
  { emoji: '🏃', name: 'High knees', tip: 'Run in place, knees to hip height.' },
  { emoji: '🦵', name: 'Lunges', tip: 'Alternate legs. Front knee over ankle.' },
  { emoji: '🔄', name: 'Push-up + rotation', tip: 'Push-up, then twist into a side plank.' },
  { emoji: '📐', name: 'Side plank', tip: 'Switch sides halfway.' },
]

const STRETCHES: Move[] = [
  { emoji: '🙆', name: 'Neck tilts', tip: 'Ear to shoulder, slow. Switch sides halfway.' },
  { emoji: '🔃', name: 'Shoulder rolls', tip: 'Big slow circles, then reverse.' },
  { emoji: '🫶', name: 'Chest opener', tip: 'Clasp hands behind you, lift gently.' },
  { emoji: '🌪️', name: 'Seated twist', tip: 'Hold the chair back, look over your shoulder. Switch.' },
  { emoji: '🤲', name: 'Wrist stretch', tip: 'Arm out, gently pull fingers back. Switch.' },
  { emoji: '🙇', name: 'Hamstring reach', tip: 'Stand, soft knees, reach toward the floor.' },
  { emoji: '🧎', name: 'Hip flexor lunge', tip: 'Back knee down, push hips forward. Switch.' },
  { emoji: '🙈', name: 'Eye palming', tip: 'Rub palms warm, cup them over closed eyes.' },
]

export const Workout = () => <Routine moves={WORKOUT} work={30} rest={10} kind="move" />
export const Stretch = () => <Routine moves={STRETCHES} work={30} rest={5} kind="tool" />

// ─── Water ────────────────────────────────────────────────────
export function Water() {
  const [days, setDays] = useTool<Record<string, number>>('water', {})
  const [goal, setGoal] = useTool('water-goal', 8)
  const n = days[today()] ?? 0
  const add = (d: number) => {
    const v = Math.max(0, n + d)
    setDays({ ...days, [today()]: v })
    if (d > 0) log('tool', { silent: true })
  }
  return (
    <div className="stack center-stack">
      <Ring progress={n / goal}>
        <b className="ring-time">{n}</b>
        <span>of {goal} glasses</span>
      </Ring>
      <div className="row gap-sm">
        <button type="button" className="btn" onClick={() => add(-1)} aria-label="Remove a glass">
          −
        </button>
        <button type="button" className="btn btn-primary a-cyan big-cta" onClick={() => add(1)}>
          💧 +1 glass
        </button>
      </div>
      {n >= goal && <p className="big-q">hydrated queen/king 👑</p>}
      <Choice options={[6, 8, 10, 12].map((g) => ({ value: g, label: `goal ${g}` }))} value={goal} onChange={setGoal} />
      <Columns title="glasses, last 7 days" data={lastDays(7).map((d) => ({ label: shortDate(d), value: days[d] ?? 0 }))} height={110} />
    </div>
  )
}

// ─── Sleep calculator ─────────────────────────────────────────
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const fmt12 = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

export function SleepCalc() {
  const [mode, setMode] = useState<'wake' | 'now'>('wake')
  const [wake, setWake] = useTool('wake-time', '07:00')
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const rows =
    mode === 'wake'
      ? [6, 5, 4].map((c) => ({ c, time: fmt12(toMin(wake) - c * 90 - 15), label: 'go to bed' }))
      : [4, 5, 6].map((c) => ({ c, time: fmt12(nowMin + 15 + c * 90), label: 'set alarm' }))
  return (
    <div className="stack">
      <Choice
        options={[
          { value: 'wake', label: '⏰ I need to wake at' },
          { value: 'now', label: '😴 I’m sleeping now' },
        ]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'wake' && <input type="time" className="time-big" value={wake} onChange={(e) => setWake(e.target.value)} aria-label="Wake time" />}
      <div className="sleep-rows">
        {rows.map((r) => (
          <div key={r.c} className={`sleep-row${r.c === 5 || r.c === 6 ? ' best' : ''}`}>
            <b>{r.time}</b>
            <span>
              {r.label} · {r.c} cycles · {(r.c * 1.5).toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
      <p className="muted">Waking between 90-minute sleep cycles feels less groggy. Includes ~15 min to fall asleep.</p>
    </div>
  )
}

// ─── Wind-down + sleep log ────────────────────────────────────
function Breather({ rounds, onDone }: { rounds: number; onDone: () => void }) {
  const phases = [
    ['breathe in', 4, 'big'],
    ['hold', 7, 'big'],
    ['whoosh out', 8, 'small'],
  ] as const
  const [i, setI] = useState(0)
  const [r, setR] = useState(0)
  const [left, setLeft] = useState(4)
  useEffect(() => {
    if (r >= rounds) return
    const id = setTimeout(() => {
      if (left > 1) return setLeft(left - 1)
      const ni = (i + 1) % 3
      if (ni === 0) {
        setR(r + 1)
        if (r + 1 >= rounds) return onDone()
      }
      setI(ni)
      setLeft(phases[ni][1])
    }, 1000)
    return () => clearTimeout(id)
  })
  return (
    <div className="mini-orb-wrap">
      <div className={`mini-orb ${phases[i][2]}`} style={{ transitionDuration: `${phases[i][1]}s` }}>
        <span>
          {r >= rounds ? 'done' : phases[i][0]}
          <br />
          {r < rounds && left}
        </span>
      </div>
      <p className="muted">
        round {Math.min(r + 1, rounds)} of {rounds}
      </p>
    </div>
  )
}

export function WindDown() {
  const [logs, setLogs] = useTool<Record<string, { bed: string; wake: string }>>('sleep-log', {})
  const [step, setStep] = useState(0)
  const [checks, setChecks] = useState<string[]>([])
  const [bed, setBed] = useState('23:30')
  const [wake, setWake] = useState('07:00')
  const hours = (b: string, w: string) => (((toMin(w) - toMin(b)) % 1440) + 1440) % 1440 / 60
  const week = lastDays(7).filter((d) => logs[d])
  const avg = week.length ? week.reduce((a, d) => a + hours(logs[d].bed, logs[d].wake), 0) / week.length : 0
  const CHECKS = ['📵 phone on Do Not Disturb', '💡 lights dimmed', '⏰ alarm set', '🌡️ room a little cool']

  return (
    <div className="stack">
      {step === 0 && (
        <>
          <p className="big-q">set the scene</p>
          <div className="choice-big">
            {CHECKS.map((c) => (
              <button key={c} type="button" className={`pick${checks.includes(c) ? ' on' : ''}`} onClick={() => setChecks(checks.includes(c) ? checks.filter((x) => x !== c) : [...checks, c])}>
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary a-violet big-cta" onClick={() => setStep(1)}>
            next: breathe →
          </button>
        </>
      )}
      {step === 1 && (
        <>
          <p className="big-q">4 · 7 · 8, four times</p>
          <Breather rounds={4} onDone={() => (log('breath'), setStep(2))} />
        </>
      )}
      {step === 2 && (
        <div className="stack center-stack">
          <p className="big-q">rain on, eyes closed 🌧️</p>
          <button
            type="button"
            className="btn btn-primary a-violet big-cta"
            onClick={() => {
              unlockAudio()
              ambient.start('rain', 0.45)
              ambient.fadeOut(30)
              setStep(3)
            }}
          >
            ▶ rain for 30 min, then fade
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(3)}>
            skip sounds
          </button>
        </div>
      )}
      {step === 3 && <Done emoji="🌙" title="goodnight. phone down now." />}

      <details className="sleep-log">
        <summary className="kicker">📝 log last night {avg > 0 && `· avg ${avg.toFixed(1)}h this week`}</summary>
        <div className="row gap-sm wrap">
          <label className="field">
            <span>slept at</span>
            <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} />
          </label>
          <label className="field">
            <span>woke at</span>
            <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
          </label>
          <button type="button" className="btn btn-sm" onClick={() => setLogs({ ...logs, [addDays(today(), -1)]: { bed, wake } })}>
            save · {hours(bed, wake).toFixed(1)}h
          </button>
        </div>
        {week.length > 0 && <Columns title="hours slept, last 7 nights" data={lastDays(7).map((d) => ({ label: shortDate(d), value: logs[d] ? Math.round(hours(logs[d].bed, logs[d].wake) * 10) / 10 : 0 }))} format={(n) => `${n}h`} height={110} />}
      </details>
    </div>
  )
}

// ─── Cycle tracker ────────────────────────────────────────────
type Cycle = { starts: string[]; length: number; symptoms: Record<string, string[]> }
const SYMPTOMS = ['😣 cramps', '😤 mood swings', '🫃 bloating', '🤕 headache', '😴 tired', '🍫 cravings', '🔴 acne', '😌 feeling good']

export function Period() {
  const [c, setC] = useTool<Cycle>('cycle', { starts: [], length: 5, symptoms: {} })
  const [pickDate, setPickDate] = useState(today())
  const starts = [...c.starts].sort()
  const diffs = starts.slice(1).map((d, i) => daysBetween(starts[i], d)).filter((n) => n >= 18 && n <= 45).slice(-6)
  const cycle = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : 28
  const last = starts[starts.length - 1]
  const next = last ? addDays(last, cycle) : null
  const ovulation = next ? addDays(next, -14) : null
  const dayIn = last ? daysBetween(last, today()) : -1
  const onPeriod = last && dayIn >= 0 && dayIn < c.length
  const until = next ? daysBetween(today(), next) : null
  const todaySym = c.symptoms[today()] ?? []

  // current month calendar
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const key = (d: number) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const isPeriod = (k: string) => starts.some((s) => daysBetween(s, k) >= 0 && daysBetween(s, k) < c.length)
  const isPredicted = (k: string) => !!next && daysBetween(next, k) >= 0 && daysBetween(next, k) < c.length
  const isFertile = (k: string) => !!ovulation && daysBetween(ovulation, k) >= -5 && daysBetween(ovulation, k) <= 1

  return (
    <div className="stack">
      <div className="cycle-hero">
        {onPeriod ? (
          <>
            <b>day {dayIn + 1}</b>
            <span>of your period</span>
          </>
        ) : until !== null ? (
          <>
            <b>{until <= 0 ? 'due' : until}</b>
            <span>{until <= 0 ? 'any day now' : `day${until === 1 ? '' : 's'} until next period`}</span>
          </>
        ) : (
          <>
            <b>🩸</b>
            <span>log your last period to start</span>
          </>
        )}
      </div>
      <div className="row gap-sm wrap center">
        <button type="button" className="btn btn-primary a-pink" onClick={() => !c.starts.includes(today()) && (setC({ ...c, starts: [...c.starts, today()] }), log('tool'))}>
          🩸 period started today
        </button>
        <input type="date" value={pickDate} max={today()} onChange={(e) => setPickDate(e.target.value)} aria-label="Past period start" style={{ width: 'auto' }} />
        <button type="button" className="btn btn-sm" onClick={() => !c.starts.includes(pickDate) && setC({ ...c, starts: [...c.starts, pickDate] })}>
          + log past start
        </button>
      </div>
      <Stats>
        <Stat value={`${cycle}d`} label={diffs.length ? 'your avg cycle' : 'default cycle'} />
        <Stat value={next ? shortDate(next) : '—'} label="next period" />
        <Stat value={ovulation ? shortDate(ovulation) : '—'} label="est. ovulation" />
      </Stats>
      <div className="cal">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="cal-h">
            {d}
          </span>
        ))}
        {Array.from({ length: first.getDay() }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const k = key(i + 1)
          const cls = isPeriod(k) ? 'p' : isPredicted(k) ? 'pp' : isFertile(k) ? 'f' : ''
          return (
            <span key={k} className={`cal-d ${cls}${k === today() ? ' today' : ''}`}>
              {i + 1}
            </span>
          )
        })}
      </div>
      <div className="row gap-sm wrap muted cal-legend">
        <span>
          <i className="cal-d p" /> period
        </span>
        <span>
          <i className="cal-d pp" /> predicted
        </span>
        <span>
          <i className="cal-d f" /> fertile window (est.)
        </span>
      </div>
      <p className="kicker">today I feel</p>
      <div className="row gap-sm wrap">
        {SYMPTOMS.map((s) => (
          <button key={s} type="button" className={`chip${todaySym.includes(s) ? ' on' : ''}`} onClick={() => setC({ ...c, symptoms: { ...c.symptoms, [today()]: todaySym.includes(s) ? todaySym.filter((x) => x !== s) : [...todaySym, s] } })}>
            {s}
          </button>
        ))}
      </div>
      <Choice options={[3, 4, 5, 6, 7].map((n) => ({ value: n, label: `${n}-day periods` }))} value={c.length} onChange={(length) => setC({ ...c, length })} />
      <Card className="soft">🔒 Stored only on this phone. Predictions are estimates — not birth control. Very irregular or painful periods? See a gynaecologist.</Card>
    </div>
  )
}

// ─── Caffeine cutoff ──────────────────────────────────────────
const DRINKS = [
  { id: 'chai', emoji: '🫖', name: 'Chai', mg: 40 },
  { id: 'coffee', emoji: '☕', name: 'Filter / brewed coffee', mg: 100 },
  { id: 'instant', emoji: '🥤', name: 'Instant coffee', mg: 65 },
  { id: 'cold', emoji: '🧋', name: 'Café cold coffee', mg: 150 },
  { id: 'energy', emoji: '⚡', name: 'Energy drink (250ml)', mg: 80 },
  { id: 'cola', emoji: '🥤', name: 'Cola (300ml)', mg: 30 },
  { id: 'green', emoji: '🍵', name: 'Green tea', mg: 30 },
]

export function Caffeine() {
  const [bed, setBed] = useTool('bedtime', '23:30')
  const [had, setHad] = useState<{ id: string; time: string }[]>([])
  const [time, setTime] = useState(() => `${String(new Date().getHours()).padStart(2, '0')}:00`)
  const bedMin = toMin(bed)
  const remaining = had.reduce((sum, h) => {
    const d = DRINKS.find((x) => x.id === h.id)!
    const gap = ((bedMin - toMin(h.time)) % 1440 + 1440) % 1440
    return sum + d.mg * 0.5 ** (gap / 60 / 5)
  }, 0)
  const cutoff = (mg: number) => fmt12(bedMin - 5 * 60 * Math.log2(mg / 25))
  const tone = remaining < 50 ? 'ok' : remaining < 100 ? 'warn' : 'bad'
  return (
    <div className="stack">
      <label className="field">
        <span>bedtime</span>
        <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} />
      </label>
      <p className="kicker">what did you drink today?</p>
      <div className="row gap-sm wrap">
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" style={{ width: 'auto' }} />
        {DRINKS.map((d) => (
          <button key={d.id} type="button" className="chip" onClick={() => setHad([...had, { id: d.id, time }])}>
            {d.emoji} {d.name}
          </button>
        ))}
      </div>
      {had.length > 0 && (
        <>
          <div className="row gap-sm wrap">
            {had.map((h, i) => (
              <button key={i} type="button" className="chip on" onClick={() => setHad(had.filter((_, j) => j !== i))}>
                {DRINKS.find((d) => d.id === h.id)!.emoji} {fmt12(toMin(h.time))} ×
              </button>
            ))}
          </div>
          <div className={`verdict ${tone}`}>
            <b>~{Math.round(remaining)} mg</b>
            <span>{tone === 'ok' ? '😴 still in your system at bedtime — sleep-safe' : tone === 'warn' ? '🤔 might delay your sleep a bit' : '👀 you’ll be staring at the ceiling'}</span>
          </div>
        </>
      )}
      <Card>
        <p className="kicker">for a {fmt12(bedMin)} bedtime, last…</p>
        <p>
          ☕ coffee by <b>{cutoff(100)}</b> · 🫖 chai by <b>{cutoff(40)}</b> · ⚡ energy drink by <b>{cutoff(80)}</b>
        </p>
      </Card>
      <p className="muted">Rough estimates: caffeine’s half-life is ~5 hours, but it varies a lot from person to person.</p>
    </div>
  )
}

