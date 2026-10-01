import { useEffect, useMemo, useState } from 'react'
import { PlusBadge } from '../components/Overlays'
import { ambient, LAYERS, useAmbient, type Layer } from '../lib/ambient'
import { confetti } from '../lib/confetti'
import { log } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { bell, chime, unlockAudio } from '../lib/sound'
import { Card, Choice, Columns, Done, Empty, List, PlusOnly, QuickAdd, Ring, Stat, Stats, addDays, daysBetween, lastDays, mmss, shortDate, today, uid, useCountdown, useTool } from './kit'
import { ToolChips } from './links'

// ─── Focus timer ──────────────────────────────────────────────
export type Session = { date: string; minutes: number; task: string }
const PRESETS = [
  { value: '25/5', label: '🍅 25 / 5' },
  { value: '50/10', label: '🔥 50 / 10' },
  { value: '90/20', label: '🧠 90 / 20' },
  { value: '15/3', label: '⚡ 15 / 3' },
]

export function FocusTimer() {
  const [log_, setLog] = useTool<Session[]>('focus-log', [])
  const [preset, setPreset] = useTool('focus-preset', '25/5')
  const [task, setTask] = useState('')
  const [noise, setNoise] = useTool('focus-noise', true)
  const [phase, setPhase] = useState<'idle' | 'focus' | 'break' | 'between'>('idle')
  const [work, rest] = preset.split('/').map(Number)
  const t = useCountdown(() => {
    bell()
    if (phase === 'focus') {
      setLog([...log_, { date: today(), minutes: work, task: task.trim() || 'focus' }])
      log('focus')
      confetti()
      setPhase('between')
    } else setPhase('idle')
  })

  useEffect(() => {
    if (!t.running) return
    const prev = document.title
    document.title = `${mmss(t.left)} · ${phase === 'focus' ? 'focus' : 'break'}`
    return () => {
      document.title = prev
    }
  }, [t.left, t.running, phase])

  const todayMin = log_.filter((s) => s.date === today()).reduce((a, s) => a + s.minutes, 0)
  const start = (kind: 'focus' | 'break') => {
    unlockAudio()
    chime(true)
    if (kind === 'focus' && noise && !ambient.isOn('brown')) ambient.start('brown', 0.35)
    setPhase(kind)
    t.start((kind === 'focus' ? work : rest) * 60)
  }

  return (
    <div className="stack center-stack">
      {phase === 'idle' && (
        <>
          <Choice options={PRESETS} value={preset} onChange={setPreset} />
          <input className="task-input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="what are you working on?" maxLength={60} aria-label="Task" />
          <label className="toggle">
            <input type="checkbox" checked={noise} onChange={(e) => setNoise(e.target.checked)} />
            <span>brown noise while I focus</span>
          </label>
        </>
      )}
      <Ring progress={phase === 'idle' || phase === 'between' ? 0 : t.progress}>
        <b className="ring-time">{phase === 'idle' || phase === 'between' ? `${work}:00` : mmss(t.left)}</b>
        <span>{phase === 'focus' ? task || 'focus' : phase === 'break' ? 'break ☕' : phase === 'between' ? 'round done!' : 'ready'}</span>
      </Ring>
      {phase === 'idle' && (
        <button type="button" className="btn btn-primary a-lime big-cta" onClick={() => start('focus')}>
          ▶ start focus
        </button>
      )}
      {(phase === 'focus' || phase === 'break') && (
        <div className="row gap-sm">
          <button type="button" className="btn" onClick={() => (t.paused ? t.resume() : t.pause())}>
            {t.paused ? '▶ resume' : '❚❚ pause'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              t.stop()
              setPhase('idle')
            }}
          >
            ■ end
          </button>
        </div>
      )}
      {phase === 'between' && (
        <>
          <div className="row gap-sm wrap center">
            <button type="button" className="btn btn-primary a-cyan" onClick={() => start('break')}>
              ☕ {rest}-min break
            </button>
            <button type="button" className="btn" onClick={() => start('focus')}>
              🔁 another round
            </button>
          </div>
          <ToolChips ids={['stretch', 'water', 'eye-care']} title="on your break" />
        </>
      )}
      <p className="muted">
        today: <b>{todayMin} min</b> focused · {log_.filter((s) => s.date === today()).length} rounds
      </p>
    </div>
  )
}

// ─── Focus stats (Plus) ───────────────────────────────────────
export function FocusStats() {
  const [sessions] = useTool<Session[]>('focus-log', [])
  const days = lastDays(14)
  const perDay = days.map((d) => ({ label: shortDate(d), value: sessions.filter((s) => s.date === d).reduce((a, s) => a + s.minutes, 0) }))
  const week = perDay.slice(-7).reduce((a, d) => a + d.value, 0)
  const best = perDay.reduce((m, d) => (d.value > m.value ? d : m), perDay[0])
  const tasks = useMemo(() => {
    const m = new Map<string, number>()
    sessions.forEach((s) => m.set(s.task, (m.get(s.task) ?? 0) + s.minutes))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [sessions])
  return (
    <PlusOnly title="Your deep-work receipts" why="Minutes focused per day, your best day, and what you actually spent your focus on.">
      {sessions.length === 0 ? (
        <Empty emoji="⏱️">Finish one focus round to see stats.</Empty>
      ) : (
        <div className="stack">
          <Stats>
            <Stat value={`${(week / 60).toFixed(1)}h`} label="this week" />
            <Stat value={sessions.length} label="rounds all-time" />
            <Stat value={best.value ? best.label : '—'} label="best day (14d)" />
          </Stats>
          <Columns title="minutes focused, last 14 days" data={perDay} format={(n) => `${n}m`} />
          {tasks.length > 0 && (
            <Card>
              <p className="kicker">where your focus went</p>
              <ul className="dot-list">
                {tasks.map(([name, m]) => (
                  <li key={name}>
                    {name} — <b>{m} min</b>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </PlusOnly>
  )
}

// ─── Sound mixer ──────────────────────────────────────────────
export function Sounds() {
  const plus = usePlus()
  const s = useAmbient()
  const [nudge, setNudge] = useState(false)
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!s.fadeEndsAt) return setLeft(0)
    const id = setInterval(() => setLeft(Math.max(0, Math.round((s.fadeEndsAt! - Date.now()) / 1000))), 1000)
    return () => clearInterval(id)
  }, [s.fadeEndsAt])
  const toggle = (l: Layer) => {
    if (!s.on.includes(l) && s.on.length >= 2 && !plus.active) return setNudge(true)
    unlockAudio()
    ambient.toggle(l)
    log('tool', { silent: true })
  }
  return (
    <div className="stack">
      <div className="sound-grid">
        {LAYERS.map((l) => {
          const on = s.on.includes(l.id)
          return (
            <div key={l.id} className={`sound${on ? ' on' : ''}`}>
              <button type="button" onClick={() => toggle(l.id)} aria-pressed={on}>
                <span className="sound-emoji">{l.emoji}</span>
                {l.name}
              </button>
              {on && <input type="range" min={0.05} max={1} step={0.05} value={s.volumes[l.id] ?? 0.6} onChange={(e) => ambient.setVolume(l.id, Number(e.target.value))} aria-label={`${l.name} volume`} />}
            </div>
          )
        })}
      </div>
      {nudge && !plus.active && (
        <p className="muted">
          <PlusBadge small /> Free mixes up to 2 sounds. <a href="#/plus">Plus</a> layers them all.
        </p>
      )}
      {s.on.length > 0 && (
        <div className="row gap-sm wrap center">
          {s.fadeEndsAt ? (
            <button type="button" className="chip on" onClick={() => ambient.cancelFade()}>
              🌙 fading in {mmss(left)} · cancel
            </button>
          ) : (
            [15, 30, 60].map((m) => (
              <button key={m} type="button" className="chip" onClick={() => ambient.fadeOut(m)}>
                🌙 stop in {m}m
              </button>
            ))
          )}
          <button type="button" className="chip" onClick={() => ambient.stopAll()}>
            ■ stop all
          </button>
        </div>
      )}
      <p className="muted center">Sounds keep playing while you use the rest of the site.</p>
    </div>
  )
}

// ─── Brain dump → sort ────────────────────────────────────────
type Dump = { id: string; text: string; bucket?: 'do' | 'plan' | 'pass' | 'drop' }
const BUCKETS = [
  { id: 'do', emoji: '🔥', label: 'do now', hint: 'urgent + important' },
  { id: 'plan', emoji: '📅', label: 'schedule', hint: 'important, not urgent' },
  { id: 'pass', emoji: '🤝', label: 'ask for help', hint: 'urgent, not yours' },
  { id: 'drop', emoji: '🗑️', label: 'drop it', hint: 'neither. let it go' },
] as const

export function BrainDump() {
  const [items, setItems] = useTool<Dump[]>('dump', [])
  const unsorted = items.filter((i) => !i.bucket)
  const next = unsorted[0]
  return (
    <div className="stack">
      <QuickAdd placeholder="type it, hit enter, keep going…" onAdd={(text) => setItems([...items, { id: uid(), text }])} button="dump" />
      {next ? (
        <Card className="focus-card">
          <p className="kicker">{unsorted.length} to sort</p>
          <p className="big-q">{next.text}</p>
          <div className="bucket-btns">
            {BUCKETS.map((b) => (
              <button key={b.id} type="button" className="pick sm" onClick={() => (setItems(items.map((i) => (i.id === next.id ? { ...i, bucket: b.id } : i))), log('tool', { silent: true }))}>
                <b>
                  {b.emoji} {b.label}
                </b>
                <small>{b.hint}</small>
              </button>
            ))}
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Empty emoji="🧠">Dump every task, worry and random thought. Sort after.</Empty>
      ) : null}
      {items.some((i) => i.bucket) && (
        <div className="quad">
          {BUCKETS.filter((b) => b.id !== 'drop').map((b) => (
            <Card key={b.id}>
              <p className="kicker">
                {b.emoji} {b.label}
              </p>
              <List items={items.filter((i) => i.bucket === b.id)} onRemove={(i) => setItems(items.filter((x) => x.id !== i.id))} render={(i) => i.text} />
            </Card>
          ))}
        </div>
      )}
      {items.some((i) => i.bucket === 'drop') && (
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setItems(items.filter((i) => i.bucket !== 'drop'))}>
          🗑️ clear {items.filter((i) => i.bucket === 'drop').length} dropped
        </button>
      )}
      {items.some((i) => i.bucket === 'do') && <ToolChips ids={['starter', 'focus']} />}
    </div>
  )
}

// ─── Done list ────────────────────────────────────────────────
export function DoneList() {
  const [days, setDays] = useTool<Record<string, { id: string; text: string }[]>>('done-list', {})
  const list = days[today()] ?? []
  let streak = 0
  for (let d = (days[today()]?.length ? today() : addDays(today(), -1)); days[d]?.length; d = addDays(d, -1)) streak++
  const past = Object.entries(days)
    .filter(([d, l]) => d !== today() && l.length)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 5)
  return (
    <div className="stack">
      <QuickAdd
        placeholder="something you did today (even small)"
        onAdd={(text) => {
          setDays({ ...days, [today()]: [...list, { id: uid(), text }] })
          log('tool', { silent: true })
        }}
        button="done ✓"
      />
      <Stats>
        <Stat value={list.length} label="done today" />
        <Stat value={`🔥 ${streak}`} label="day streak" />
      </Stats>
      {list.length ? <List items={list} onRemove={(i) => setDays({ ...days, [today()]: list.filter((x) => x.id !== i.id) })} render={(i) => `✅ ${i.text}`} /> : <Empty emoji="✅">Made your bed? Replied to that email? It counts.</Empty>}
      {past.map(([d, l]) => (
        <details key={d}>
          <summary className="muted">
            {shortDate(d)} · {l.length} wins
          </summary>
          <ul className="dot-list">
            {l.map((i) => (
              <li key={i.id}>{i.text}</li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}

// ─── 5-minute starter ─────────────────────────────────────────
const TINY = ['open the file', 'write just the title', 'read one page', 'put the materials on the desk', 'reply to one message', 'write one ugly sentence']

export function Starter() {
  const [task, setTask] = useState('')
  const [step, setStep] = useState('')
  const [phase, setPhase] = useState<'set' | 'go' | 'check' | 'done'>('set')
  const t = useCountdown(() => {
    bell()
    setPhase('check')
  })
  if (phase === 'set')
    return (
      <div className="stack">
        <input className="task-input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="the thing you’re avoiding" aria-label="Task" />
        {task && (
          <>
            <p className="kicker">smallest possible first step</p>
            <div className="row gap-sm wrap">
              {TINY.map((s) => (
                <button key={s} type="button" className={`chip${step === s ? ' on' : ''}`} onClick={() => setStep(s)}>
                  {s}
                </button>
              ))}
            </div>
            <input value={step} onChange={(e) => setStep(e.target.value)} placeholder="or type your own" aria-label="First step" />
          </>
        )}
        <button
          type="button"
          className="btn btn-primary a-lime big-cta"
          disabled={!task || !step}
          onClick={() => {
            unlockAudio()
            t.start(300)
            setPhase('go')
          }}
        >
          🚀 just 5 minutes
        </button>
      </div>
    )
  if (phase === 'go')
    return (
      <div className="stack center-stack">
        <Ring progress={t.progress}>
          <b className="ring-time">{mmss(t.left)}</b>
          <span>{step}</span>
        </Ring>
        <p className="muted">only this. nothing else counts right now.</p>
      </div>
    )
  if (phase === 'check')
    return (
      <div className="stack center-stack">
        <Done emoji="🚀" title="you started. that was the hard part." />
        <div className="row gap-sm wrap center">
          <button type="button" className="btn btn-primary a-lime" onClick={() => (t.start(600), setPhase('go'))}>
            keep going 10 min
          </button>
          <button type="button" className="btn" onClick={() => (log('focus'), setPhase('done'))}>
            I’m done for now
          </button>
        </div>
      </div>
    )
  return (
    <div className="stack">
      <Done emoji="🏁" title={`“${task}” — started. proud of you.`} />
      <ToolChips ids={['focus', 'done-list']} />
    </div>
  )
}

// ─── Countdowns ───────────────────────────────────────────────
type Countdown = { id: string; name: string; date: string; emoji: string }
const EV = ['📚', '✈️', '🎂', '🎉', '💼', '🎬', '🏏', '💍']

export function Countdowns() {
  const [list, setList] = useTool<Countdown[]>('countdowns', [])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [emoji, setEmoji] = useState('📚')
  const upcoming = list.filter((c) => daysBetween(today(), c.date) >= 0).sort((a, b) => (a.date < b.date ? -1 : 1))
  return (
    <div className="stack">
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || !date) return
          setList([...list, { id: uid(), name: name.trim(), date, emoji }])
          setName('')
          setDate('')
        }}
      >
        <div className="row gap-sm wrap">
          {EV.map((e) => (
            <button key={e} type="button" className={`chip${emoji === e ? ' on' : ''}`} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
        <div className="row gap-sm wrap">
          <input className="grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="board exams, goa trip, mom’s bday…" aria-label="Event" />
          <input type="date" value={date} min={today()} onChange={(e) => setDate(e.target.value)} aria-label="Date" style={{ width: 'auto' }} />
          <button type="submit" className="btn btn-primary a-lime">
            + add
          </button>
        </div>
      </form>
      {upcoming.length ? (
        <div className="cd-grid">
          {upcoming.map((c) => {
            const d = daysBetween(today(), c.date)
            return (
              <div key={c.id} className="cd">
                <button type="button" className="x" aria-label="Remove" onClick={() => setList(list.filter((x) => x.id !== c.id))}>
                  ×
                </button>
                <span className="cd-emoji">{c.emoji}</span>
                <b>{d === 0 ? 'today!' : d}</b>
                <span>{d === 0 ? '' : d === 1 ? 'day' : 'days'}</span>
                <p>{c.name}</p>
                <small>{shortDate(c.date)}</small>
              </div>
            )
          })}
        </div>
      ) : (
        <Empty emoji="⏳">Add your next exam, trip or birthday.</Empty>
      )}
    </div>
  )
}

// ─── Flashcards (Leitner) ─────────────────────────────────────
type FCard = { id: string; front: string; back: string; box: number; due: string }
type Deck = { id: string; name: string; cards: FCard[] }
const INTERVAL = [0, 1, 2, 4, 7, 14]

export function Flashcards() {
  const plus = usePlus()
  const [decks, setDecks] = useTool<Deck[]>('decks', [])
  const [open, setOpen] = useState<string | null>(null)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [studying, setStudying] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const deck = decks.find((d) => d.id === open)
  const saveDeck = (d: Deck) => setDecks(decks.map((x) => (x.id === d.id ? d : x)))
  const canAdd = plus.active || decks.length < 1

  if (!deck)
    return (
      <div className="stack">
        {canAdd ? (
          <QuickAdd placeholder="new deck: biology ch 3, spanish verbs…" onAdd={(name) => setDecks([...decks, { id: uid(), name, cards: [] }])} button="+ deck" />
        ) : (
          <p className="muted">
            <PlusBadge small /> Free includes 1 deck. <a href="#/plus">Plus</a> = unlimited decks.
          </p>
        )}
        {decks.length ? (
          <div className="deck-grid">
            {decks.map((d) => {
              const due = d.cards.filter((c) => c.due <= today()).length
              return (
                <button key={d.id} type="button" className="deck" onClick={() => setOpen(d.id)}>
                  <b>{d.name}</b>
                  <span>
                    {d.cards.length} cards · <em>{due} due</em>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <Empty emoji="🗂️">Make a deck. Review a little every day — the app decides what you’re about to forget.</Empty>
        )}
      </div>
    )

  const due = deck.cards.filter((c) => c.due <= today())
  const card = due[0]
  if (studying)
    return card ? (
      <div className="stack center-stack">
        <p className="kicker">{due.length} left today</p>
        <button type="button" className={`fc${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <span className="fc-face">{flipped ? card.back : card.front}</span>
          <small>{flipped ? 'answer' : 'tap to flip'}</small>
        </button>
        {flipped && (
          <div className="row gap-sm">
            {(['again', 'got it'] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={k === 'got it' ? 'btn btn-primary a-lime' : 'btn'}
                onClick={() => {
                  // Got it → next box, seen again later. Again → back to box 1 and to the end of today's pile.
                  const rest = deck.cards.filter((c) => c.id !== card.id)
                  const updated = k === 'got it' ? { ...card, box: Math.min(5, card.box + 1), due: addDays(today(), INTERVAL[Math.min(5, card.box + 1)]) } : { ...card, box: 1, due: today() }
                  saveDeck({ ...deck, cards: [...rest, updated] })
                  setFlipped(false)
                  log('tool', { silent: true })
                }}
              >
                {k === 'again' ? '🔁 again' : '✅ got it'}
              </button>
            ))}
          </div>
        )}
      </div>
    ) : (
      <div className="stack">
        <Done emoji="🧠" title="all caught up for today" />
        <button type="button" className="btn btn-sm" onClick={() => setStudying(false)}>
          back to deck
        </button>
      </div>
    )

  return (
    <div className="stack">
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(null)}>
          ← decks
        </button>
        <b className="grow">{deck.name}</b>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => confirm('Delete this deck?') && (setDecks(decks.filter((d) => d.id !== deck.id)), setOpen(null))}>
          delete
        </button>
      </div>
      <button type="button" className="btn btn-primary a-lime big-cta" disabled={!due.length} onClick={() => setStudying(true)}>
        {due.length ? `▶ study ${due.length} due` : 'nothing due — come back tomorrow'}
      </button>
      <form
        className="two-up"
        onSubmit={(e) => {
          e.preventDefault()
          if (!front.trim() || !back.trim()) return
          saveDeck({ ...deck, cards: [...deck.cards, { id: uid(), front: front.trim(), back: back.trim(), box: 1, due: today() }] })
          setFront('')
          setBack('')
        }}
      >
        <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="question" aria-label="Front" />
        <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="answer" aria-label="Back" />
        <button type="submit" className="btn">
          + card
        </button>
      </form>
      <List items={deck.cards} onRemove={(c) => saveDeck({ ...deck, cards: deck.cards.filter((x) => x.id !== c.id) })} render={(c) => `${c.front} → ${c.back}  · box ${c.box}`} />
    </div>
  )
}

// ─── Study timetable (Plus) ───────────────────────────────────
type Subj = { id: string; name: string; level: 1 | 2 | 3 }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function planWeek(subjects: Subj[], hours: number, days: string[]) {
  const slots = hours * days.length
  const weight = subjects.reduce((a, s) => a + s.level, 0) || 1
  const pool: string[] = []
  subjects.forEach((s) => {
    const n = Math.max(1, Math.round((s.level / weight) * slots))
    for (let i = 0; i < n; i++) pool.push(s.name)
  })
  while (pool.length > slots) pool.splice(pool.lastIndexOf(subjects[subjects.length - 1].name), 1)
  // Interleave so the same subject rarely sits back to back.
  const counts = new Map<string, number>()
  pool.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1))
  const out: string[] = []
  while (out.length < pool.length) {
    const [name] = [...counts.entries()].filter(([n, c]) => c > 0 && n !== out[out.length - 1]).sort((a, b) => b[1] - a[1])[0] ?? [...counts.entries()].filter(([, c]) => c > 0)[0]
    out.push(name)
    counts.set(name, (counts.get(name) ?? 1) - 1)
  }
  return days.map((d, i) => ({ day: d, slots: out.slice(i * hours, i * hours + hours) }))
}

export function Timetable() {
  const [subjects, setSubjects] = useTool<Subj[]>('tt-subjects', [])
  const [hours, setHours] = useTool('tt-hours', 3)
  const [days, setDays] = useTool<string[]>('tt-days', DAYS.slice(0, 6))
  const plan = subjects.length && days.length ? planWeek(subjects, hours, days) : []
  return (
    <PlusOnly title="Auto-plan your study week" why="Add subjects and how hard they feel. It spreads them across your week, harder ones more often, never the same one back to back.">
      <div className="stack">
        <QuickAdd placeholder="subject" onAdd={(name) => setSubjects([...subjects, { id: uid(), name, level: 2 }])} />
        {subjects.map((s) => (
          <div key={s.id} className="row gap-sm wrap">
            <b className="grow">{s.name}</b>
            <Choice
              options={[
                { value: 1, label: '😌 easy' },
                { value: 2, label: '😐 okay' },
                { value: 3, label: '😵 hard' },
              ]}
              value={s.level}
              onChange={(level) => setSubjects(subjects.map((x) => (x.id === s.id ? { ...x, level } : x)))}
            />
            <button type="button" className="x" aria-label="Remove" onClick={() => setSubjects(subjects.filter((x) => x.id !== s.id))}>
              ×
            </button>
          </div>
        ))}
        <div className="row gap-sm wrap">
          {DAYS.map((d) => (
            <button key={d} type="button" className={`chip${days.includes(d) ? ' on' : ''}`} onClick={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : DAYS.filter((x) => days.includes(x) || x === d))}>
              {d}
            </button>
          ))}
        </div>
        <Choice options={[1, 2, 3, 4, 5, 6].map((h) => ({ value: h, label: `${h}h/day` }))} value={hours} onChange={setHours} />
        {plan.length > 0 && (
          <div className="tt">
            {plan.map((d) => (
              <div key={d.day} className="tt-day">
                <b>{d.day}</b>
                {d.slots.map((s, i) => (
                  <span key={i} className={`tt-slot l${subjects.find((x) => x.name === s)?.level ?? 2}`}>
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        {plan.length > 0 && (
          <button type="button" className="btn btn-sm" onClick={() => window.print()}>
            🖨️ print / save PDF
          </button>
        )}
      </div>
    </PlusOnly>
  )
}

// ─── 20-20-20 eye care ────────────────────────────────────────
export function EyeCare() {
  const [count, setCount] = useTool<Record<string, number>>('eye-breaks', {})
  const [on, setOn] = useState(false)
  const [resting, setResting] = useState(false)
  const rest = useCountdown(() => {
    chime(true)
    setResting(false)
    setCount((c) => ({ ...c, [today()]: (c[today()] ?? 0) + 1 }))
    log('tool', { silent: true })
    work.start(20 * 60)
  })
  const work = useCountdown(() => {
    bell()
    setResting(true)
    rest.start(20)
  })
  return (
    <div className="stack center-stack">
      {resting ? (
        <div className="eye-rest">
          <span>👀</span>
          <p className="big-q">look at something 20 feet away</p>
          <b className="big-num">{rest.left}</b>
        </div>
      ) : (
        <Ring progress={on ? work.progress : 0}>
          <b className="ring-time">{on ? mmss(work.left) : '20:00'}</b>
          <span>{on ? 'until eye break' : 'every 20 min'}</span>
        </Ring>
      )}
      <button
        type="button"
        className={`btn big-cta ${on ? '' : 'btn-primary a-lime'}`}
        onClick={() => {
          if (on) {
            work.stop()
            rest.stop()
            setResting(false)
          } else {
            unlockAudio()
            work.start(20 * 60)
          }
          setOn(!on)
        }}
      >
        {on ? '■ stop reminders' : '▶ start 20-20-20'}
      </button>
      <p className="muted">
        {count[today()] ?? 0} eye breaks today · keep this tab open in the background
      </p>
    </div>
  )
}

// ─── Phone-down mode ──────────────────────────────────────────
export function PhoneDown() {
  const [best, setBest] = useTool<number>('phone-down-best', 0)
  const [mins, setMins] = useState(30)
  const [phase, setPhase] = useState<'set' | 'on' | 'done'>('set')
  const [slips, setSlips] = useState(0)
  const t = useCountdown(() => {
    bell()
    setPhase('done')
    setBest(Math.max(best, mins))
    log('focus')
  })
  useEffect(() => {
    if (phase !== 'on') return
    const onVis = () => document.hidden && setSlips((s) => s + 1)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [phase])

  if (phase === 'set')
    return (
      <div className="stack center-stack">
        <Choice big options={[15, 30, 45, 60].map((m) => ({ value: m, label: `${m} min` }))} value={mins} onChange={setMins} />
        <button
          type="button"
          className="btn btn-primary a-lime big-cta"
          onClick={() => {
            unlockAudio()
            setSlips(0)
            t.start(mins * 60)
            setPhase('on')
          }}
        >
          📵 phone down
        </button>
        <p className="muted">Flip your phone over, or leave this screen open. If you switch apps, we’ll count it.</p>
        {best > 0 && <p className="muted">longest phone-down: {best} min</p>}
      </div>
    )
  if (phase === 'on')
    return (
      <div className="phone-down">
        <p className="kicker">phone down</p>
        <b className="pd-time">{mmss(t.left)}</b>
        <div className="mini-orb big breathing" />
        <p className="muted">{slips ? `${slips} slip${slips > 1 ? 's' : ''}. it’s okay — come back.` : 'look up. breathe. be where you are.'}</p>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => (t.stop(), setPhase('set'))}>
          give up
        </button>
      </div>
    )
  return (
    <div className="stack">
      <Done emoji={slips ? '🙂' : '🏆'} title={slips ? `${mins} min done, ${slips} slip${slips > 1 ? 's' : ''}` : `${mins} min. zero slips. legend.`} />
      <ToolChips ids={['dopamine', 'workout']} title="now do something real" />
      <button type="button" className="btn btn-sm" onClick={() => setPhase('set')}>
        again
      </button>
    </div>
  )
}
