import { useEffect, useMemo, useState } from 'react'
import { shareCard } from '../components/Overlays'
import { WebLink } from '../components/WebView'
import { log } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { pick } from '../lib/storage'
import { Card, Choice, Columns, Done, Empty, Flow, List, QuickAdd, Stat, Stats, Text, addDays, lastDays, shortDate, today, uid, useTool, PlusOnly } from './kit'
import { ToolChip, ToolChips } from './links'

// ─── Daily check-in ───────────────────────────────────────────
export type CheckIn = { mood: number; energy: number; sleep: number; note: string }
const MOODS = [
  { value: 1, label: '😭' },
  { value: 2, label: '😔' },
  { value: 3, label: '😐' },
  { value: 4, label: '🙂' },
  { value: 5, label: '🤩' },
]

export function CheckInTool() {
  const [all, setAll] = useTool<Record<string, CheckIn>>('checkins', {})
  const existing = all[today()]
  const [draft, setDraft] = useState<CheckIn>(existing ?? { mood: 0, energy: 0, sleep: 0, note: '' })
  const [saved, setSaved] = useState(!!existing)
  const set = (p: Partial<CheckIn>) => setDraft((d) => ({ ...d, ...p }))

  if (saved && existing) {
    const s = existing
    const tips =
      s.mood <= 1
        ? ['bad-day', 'safety-plan']
        : s.mood === 2
          ? ['worry-box', 'journal']
          : s.sleep && s.sleep < 6
            ? ['wind-down', 'sleep-calc']
            : s.energy === 1
              ? ['stretch', 'water']
              : s.mood >= 4
                ? ['kindness', 'focus']
                : ['journal', 'sounds']
    return (
      <div className="stack">
        <Done emoji={MOODS[s.mood - 1]?.label ?? '✓'} title="checked in for today">
          <p className="muted">
            energy {['', 'low', 'okay', 'high'][s.energy]} · {s.sleep ? `${s.sleep}h sleep` : 'sleep skipped'}
            {s.note && ` · “${s.note}”`}
          </p>
        </Done>
        {s.mood <= 1 && (
          <Card className="soft">
            Rough day. You don’t have to handle it alone — <a href="tel:14416">call Tele-MANAS 14416</a> (free, 24×7) or text someone you trust.
          </Card>
        )}
        <ToolChips ids={tips} title="this might help right now" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSaved(false)}>
          edit today
        </button>
      </div>
    )
  }

  return (
    <Flow
      doneLabel="save ✓"
      onDone={() => {
        setAll({ ...all, [today()]: draft })
        setSaved(true)
        log('tool')
      }}
      steps={[
        { title: 'how are you, really?', body: <Choice big options={MOODS} value={draft.mood} onChange={(mood) => set({ mood })} />, ready: draft.mood > 0 },
        {
          title: 'energy?',
          body: (
            <Choice
              big
              options={[
                { value: 1, label: '🪫 low' },
                { value: 2, label: '🔋 okay' },
                { value: 3, label: '⚡ high' },
              ]}
              value={draft.energy}
              onChange={(energy) => set({ energy })}
            />
          ),
          ready: draft.energy > 0,
        },
        {
          title: 'sleep last night?',
          body: <Choice big options={[4, 5, 6, 7, 8, 9].map((h) => ({ value: h, label: h === 4 ? '≤4h' : h === 9 ? '9h+' : `${h}h` }))} value={draft.sleep} onChange={(sleep) => set({ sleep })} />,
        },
        { title: 'one word for today? (optional)', body: <Text value={draft.note} onChange={(note) => set({ note })} placeholder="exams, chill, lonely, proud…" max={40} /> },
      ]}
    />
  )
}

// ─── Mood insights (Plus) ─────────────────────────────────────
export function MoodInsights() {
  const [all] = useTool<Record<string, CheckIn>>('checkins', {})
  const days = lastDays(30)
  const entries = Object.entries(all).filter(([d]) => days.includes(d))
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
  const goodSleep = avg(entries.filter(([, c]) => c.sleep >= 7).map(([, c]) => c.mood))
  const lowSleep = avg(entries.filter(([, c]) => c.sleep && c.sleep < 7).map(([, c]) => c.mood))
  const byDow = useMemo(() => {
    const m = new Map<number, number[]>()
    entries.forEach(([d, c]) => m.set(new Date(`${d}T00:00`).getDay(), [...(m.get(new Date(`${d}T00:00`).getDay()) ?? []), c.mood]))
    return [...m.entries()].map(([dow, xs]) => ({ dow, v: avg(xs) })).sort((a, b) => b.v - a.v)
  }, [entries])
  const dayName = (n: number) => ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][n]

  return (
    <PlusOnly title="See your mood patterns" why="30-day mood chart, your best day of the week, and how sleep changes your mood — from your own check-ins.">
      {entries.length < 3 ? (
        <Empty emoji="🌡️">
          Check in on 3 days to unlock your patterns. <ToolChip id="checkin" />
        </Empty>
      ) : (
        <div className="stack">
          <Stats>
            <Stat value={avg(entries.map(([, c]) => c.mood)).toFixed(1)} label="avg mood / 5" />
            <Stat value={entries.length} label="check-ins (30d)" />
            {byDow[0] && <Stat value={dayName(byDow[0].dow).slice(0, 3)} label="your best day" />}
          </Stats>
          <Columns title="mood, last 30 days (1–5)" data={days.map((d) => ({ label: shortDate(d), value: all[d]?.mood ?? 0 }))} format={(n) => (n ? String(n) : '—')} />
          {goodSleep > 0 && lowSleep > 0 && (
            <Card>
              💤 On <b>7h+ sleep</b> your mood averages <b>{goodSleep.toFixed(1)}</b>. Under 7h it’s <b>{lowSleep.toFixed(1)}</b>.{' '}
              {goodSleep > lowSleep ? 'Sleep is literally a mood booster for you.' : 'Interesting — sleep isn’t your main mood driver.'}
            </Card>
          )}
        </div>
      )}
    </PlusOnly>
  )
}

// ─── Panic SOS ────────────────────────────────────────────────
function SighOrb() {
  const phases = [
    ['inhale', 2000, 'big'],
    ['one more sip', 1000, 'big'],
    ['long exhale…', 6000, 'small'],
  ] as const
  const [i, setI] = useState(0)
  const [rounds, setRounds] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      setI((i + 1) % 3)
      if (i === 2) setRounds((r) => r + 1)
    }, phases[i][1])
    return () => clearTimeout(t)
  })
  return (
    <div className="mini-orb-wrap">
      <div className={`mini-orb ${phases[i][2]}`} style={{ transitionDuration: `${phases[i][1]}ms` }}>
        <span>{phases[i][0]}</span>
      </div>
      <p className="muted">{rounds} of 3 breaths</p>
    </div>
  )
}

const SENSES: [number, string, string][] = [
  [5, '👀', 'things you can see'],
  [4, '✋', 'things you can touch'],
  [3, '👂', 'things you can hear'],
  [2, '👃', 'things you can smell'],
  [1, '👅', 'thing you can taste'],
]

function Grounding({ onDone }: { onDone: () => void }) {
  const [s, setS] = useState(0)
  const [n, setN] = useState(0)
  if (s >= SENSES.length) return <Done emoji="🌍" title="you’re here. right now." />
  const [count, emoji, label] = SENSES[s]
  const tap = () => {
    if (n + 1 >= count) {
      setN(0)
      setS(s + 1)
      if (s + 1 >= SENSES.length) onDone()
    } else setN(n + 1)
  }
  return (
    <div className="ground">
      <p className="ground-ask">
        {emoji} name <b>{count}</b> {label}
      </p>
      <button type="button" className="tap-dots" onClick={tap} aria-label={`Tap after each one. ${n} of ${count}`}>
        {Array.from({ length: count }, (_, j) => (
          <span key={j} className={j < n ? 'on' : ''} />
        ))}
      </button>
      <p className="muted">tap once for each one, out loud or in your head</p>
    </div>
  )
}

export function Panic() {
  const [grounded, setGrounded] = useState(false)
  const [reset, setReset] = useState('')
  const [after, setAfter] = useState(5)
  const [done, setDone] = useState(false)
  if (done)
    return after >= 6 ? (
      <div className="stack">
        <Done emoji="💜" title="still heavy? that’s okay. reach out.">
          <div className="row gap-sm wrap center">
            <a className="btn btn-primary a-violet" href="tel:14416">
              📞 Tele-MANAS 14416
            </a>
            <a className="btn" href="tel:112">
              🚨 112
            </a>
          </div>
        </Done>
        <ToolChips ids={['safety-plan', 'bad-day']} />
      </div>
    ) : (
      <div className="stack">
        <Done emoji="🌤️" title="you rode it out. that took strength." />
        <ToolChips ids={['worry-box', 'journal']} />
      </div>
    )
  return (
    <Flow
      doneLabel="I’m done ✓"
      onDone={() => {
        log('breath')
        setDone(true)
      }}
      steps={[
        { title: 'you’re safe. this will pass.', body: <SighOrb />, next: 'next →' },
        { title: 'come back to the room', body: <Grounding onDone={() => setGrounded(true)} />, ready: grounded },
        {
          title: 'quick body reset',
          body: <Choice big options={['🧊 hold something cold', '💦 splash cold water', '🚶 step outside', '🤲 press palms together hard'].map((v) => ({ value: v, label: v }))} value={reset} onChange={setReset} />,
          ready: !!reset,
        },
        {
          title: 'how strong is it now?',
          body: (
            <div className="slider-q">
              <b className="big-num">{after}</b>
              <input type="range" min={0} max={10} value={after} onChange={(e) => setAfter(Number(e.target.value))} aria-label="Panic level 0 to 10" />
              <div className="row space-between muted">
                <span>calm</span>
                <span>max</span>
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}

// ─── Crisis plan (was "safety plan") ─────────────────────────────────────
const PLAN = [
  { key: 'signs', emoji: '⚠️', title: 'my warning signs', hint: 'not sleeping, skipping meals, “nothing matters” thoughts…' },
  { key: 'calm', emoji: '🫧', title: 'things that calm me', hint: 'shower, music, walk, breathing…' },
  { key: 'places', emoji: '📍', title: 'places & people that distract me', hint: 'café, cousin’s house, the gym…' },
  { key: 'people', emoji: '🤝', title: 'people I can ask for help', hint: 'name — number' },
  { key: 'safe', emoji: '🔒', title: 'making my space safer', hint: 'give pills to mom, stay with someone…' },
  { key: 'reasons', emoji: '🌅', title: 'my reasons to keep going', hint: 'my sister, my dog, the trip I want…' },
] as const

export function SafetyPlan() {
  const [plan, setPlan] = useTool<Record<string, string[]>>('safety-plan', {})
  const [editing, setEditing] = useState(Object.keys(plan).length === 0)
  const add = (k: string, v: string) => setPlan({ ...plan, [k]: [...(plan[k] ?? []), v] })
  const remove = (k: string, i: number) => setPlan({ ...plan, [k]: (plan[k] ?? []).filter((_, j) => j !== i) })

  if (editing)
    return (
      <Flow
        doneLabel="save my plan ✓"
        onDone={() => {
          setEditing(false)
          log('tool')
        }}
        steps={PLAN.map((p) => ({
          title: `${p.emoji} ${p.title}`,
          body: (
            <div className="stack">
              <QuickAdd placeholder={p.hint} onAdd={(v) => add(p.key, v)} />
              <div className="row gap-sm wrap">
                {(plan[p.key] ?? []).map((v, i) => (
                  <button key={i} type="button" className="chip on" onClick={() => remove(p.key, i)}>
                    {v} ×
                  </button>
                ))}
              </div>
            </div>
          ),
        }))}
      />
    )

  return (
    <div className="stack">
      <div className="plan-grid">
        {PLAN.map((p) => (
          <Card key={p.key}>
            <p className="kicker">
              {p.emoji} {p.title}
            </p>
            {(plan[p.key] ?? []).length ? (
              <ul className="dot-list">
                {plan[p.key].map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">—</p>
            )}
          </Card>
        ))}
        <Card className="soft">
          <p className="kicker">📞 professionals, 24×7</p>
          <div className="row gap-sm wrap">
            <a className="btn btn-sm btn-primary a-violet" href="tel:14416">
              Tele-MANAS 14416
            </a>
            <a className="btn btn-sm" href="tel:112">
              Emergency 112
            </a>
          </div>
        </Card>
      </div>
      <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
        ✏️ edit plan
      </button>
    </div>
  )
}

// ─── Worry box ────────────────────────────────────────────────
type Worry = { id: string; text: string; status: 'open' | 'action' | 'released'; action?: string }

export function WorryBox() {
  const [worries, setWorries] = useTool<Worry[]>('worries', [])
  const [actionText, setActionText] = useState('')
  const [floating, setFloating] = useState<string | null>(null)
  const open = worries.find((w) => w.status === 'open')
  const update = (id: string, p: Partial<Worry>) => setWorries(worries.map((w) => (w.id === id ? { ...w, ...p } : w)))
  const actions = worries.filter((w) => w.status === 'action')
  const released = worries.filter((w) => w.status === 'released').length

  return (
    <div className="stack">
      <ol className="wb-how" aria-label="How the worry box works">
        <li className={!open ? 'now' : ''}>
          <b>1. write it</b>
          <span>the thing looping in your head</span>
        </li>
        <li className={open ? 'now' : ''}>
          <b>2. sort it</b>
          <span>can you do anything about it?</span>
        </li>
        <li>
          <b>3. done</b>
          <span>a small step, or let it go</span>
        </li>
      </ol>

      {!open && <QuickAdd placeholder="e.g. what if I fail the maths test" onAdd={(text) => setWorries([{ id: uid(), text, status: 'open' }, ...worries])} button="put it in 📦" />}
      {floating && <p className="float-away">{floating}</p>}

      {open && (
        <Card className="focus-card">
          <p className="kicker">your worry</p>
          <p className="big-q">“{open.text}”</p>
          <p>
            <b>Is there anything you can do about it?</b> Even something tiny.
          </p>
          <label className="field">
            <span>yes: the smallest next step</span>
            <input value={actionText} onChange={(e) => setActionText(e.target.value)} placeholder="e.g. do 10 practice questions tonight" />
          </label>
          <div className="row gap-sm wrap">
            <button
              type="button"
              className="btn btn-primary a-lime"
              disabled={!actionText.trim()}
              onClick={() => {
                update(open.id, { status: 'action', action: actionText.trim() })
                setActionText('')
                log('tool')
              }}
            >
              save the step
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setFloating(open.text)
                setTimeout(() => setFloating(null), 1800)
                update(open.id, { status: 'released' })
                log('tool')
              }}
            >
              no, it’s out of my hands → let it go 🎈
            </button>
          </div>
          <p className="muted">Out of your hands means worrying won’t change it. Letting go isn’t pretending it doesn’t matter; it’s choosing not to carry it right now.</p>
        </Card>
      )}

      {actions.length > 0 && (
        <>
          <p className="kicker">your next steps · tick them off when done</p>
          <List
            items={actions}
            onRemove={(w) => update(w.id, { status: 'released' })}
            render={(w) => (
              <>
                <b>{w.action}</b>
                <small className="muted"> — for “{w.text}”</small>
              </>
            )}
          />
        </>
      )}
      {!open && !actions.length && <Empty emoji="📦">Nothing in the box. When a worry keeps looping, write it here and sort it: act on it, or let it go.</Empty>}
      {released > 0 && <p className="muted">🎈 {released} {released === 1 ? 'worry' : 'worries'} let go</p>}
    </div>
  )
}

// ─── Journal ──────────────────────────────────────────────────
const PACKS: { id: string; emoji: string; name: string; plus: boolean; prompts: string[] }[] = [
  {
    id: 'self',
    emoji: '🪞',
    name: 'Self',
    plus: false,
    prompts: [
      'What’s taking up most space in your head today?',
      'When did you feel most like yourself this week?',
      'What are you pretending not to know?',
      'What would you do if nobody would judge you?',
      'What did you need to hear today? Write it to yourself.',
      'What drained you this week, and what filled you up?',
      'Describe a version of you from 5 years ago. What would they be proud of?',
      'What’s one thing you can forgive yourself for?',
    ],
  },
  {
    id: 'gratitude',
    emoji: '🙏',
    name: 'Gratitude',
    plus: false,
    prompts: [
      '3 tiny things that went right today.',
      'Who made your life easier this week? How?',
      'What’s something you have now that you once wished for?',
      'A smell, song or place that makes you feel safe.',
      'Something your body did for you today.',
      'A person you’re grateful for but never told.',
    ],
  },
  {
    id: 'heartbreak',
    emoji: '💔',
    name: 'Heartbreak',
    plus: true,
    prompts: [
      'Write everything you wish you could say to them. You won’t send it.',
      'What did this relationship teach you about what you need?',
      'List 5 red flags you ignored. No shame — just data.',
      'What parts of yourself did you put on hold?',
      'What does your life look like 6 months from now, on a good day?',
      'Who were you before them? Who are you becoming?',
    ],
  },
  {
    id: 'future',
    emoji: '🔭',
    name: 'Future',
    plus: true,
    prompts: [
      'Describe a normal Tuesday in your dream life.',
      'What skill would change everything if you learned it this year?',
      'What are you scared to want?',
      'What does “enough” look like for you?',
      'If this year had a title, what would you want it to be?',
      'What’s one door you can knock on this month?',
    ],
  },
  {
    id: 'family',
    emoji: '🏠',
    name: 'Family',
    plus: true,
    prompts: [
      'What’s something you wish your parents understood about you?',
      'A family moment you want to remember forever.',
      'What pattern from your family do you want to keep — and break?',
      'If you could ask your parent one honest question, what would it be?',
      'How do the people at home show love, even badly?',
      'What boundary would make home feel lighter?',
    ],
  },
  {
    id: 'anxiety',
    emoji: '🌀',
    name: 'Anxiety',
    plus: true,
    prompts: [
      'What’s the worst case — and how would you cope if it happened?',
      'What’s actually in your control right now?',
      'When did a worry not come true?',
      'What does your anxiety want to protect you from?',
      'Write the scary thought. Now write it as a question.',
      'What would calm-you do in the next hour?',
    ],
  },
]

/** `title` and `updatedAt` came later: older entries only have a prompt, which doubles as their title. */
type Entry = { id: string; date: string; prompt: string; text: string; title?: string; updatedAt?: number }
type Draft = { id?: string; title: string; prompt: string; text: string }
type Hype = { id: string; text: string; date: string }

const EMPTY_DRAFT: Draft = { title: '', prompt: '', text: '' }
const titleOf = (e: Entry) => e.title || e.prompt || 'untitled'

function Editor({ draft, setDraft, onSave, onClose }: { draft: Draft; setDraft: (d: Draft) => void; onSave: () => void; onClose: () => void }) {
  const plus = usePlus()
  const [pack, setPack] = useState<(typeof PACKS)[number] | null>(null)
  return (
    <div className="jr-editor">
      <input className="jr-title" value={draft.title} maxLength={80} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={draft.prompt ? 'title (optional)' : 'title'} aria-label="Title" />
      {draft.prompt ? (
        <p className="jr-prompt">
          {draft.prompt}{' '}
          <button type="button" className="linkish muted" onClick={() => setDraft({ ...draft, prompt: pack ? pick(pack.prompts, draft.prompt) : '' })}>
            {pack ? 'another' : 'remove'}
          </button>
          {pack && (
            <>
              {' · '}
              <button type="button" className="linkish muted" onClick={() => setDraft({ ...draft, prompt: '' })}>
                no prompt
              </button>
            </>
          )}
        </p>
      ) : (
        <details className="jr-prompts">
          <summary>need a prompt?</summary>
          <div className="row gap-sm wrap">
            {PACKS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                disabled={p.plus && !plus.active}
                onClick={() => {
                  setPack(p)
                  setDraft({ ...draft, prompt: pick(p.prompts) })
                }}
              >
                {p.emoji} {p.name} {p.plus && !plus.active && '🔒'}
              </button>
            ))}
          </div>
        </details>
      )}
      <textarea
        className="jr-text"
        value={draft.text}
        autoFocus
        onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        placeholder="no grammar. no audience. just you."
        rows={10}
        aria-label="Entry"
      />
      <div className="row gap-sm wrap">
        <button type="button" className="btn btn-primary a-lime" disabled={!draft.text.trim()} onClick={onSave}>
          {draft.id ? 'save changes' : 'save entry'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          {draft.text.trim() ? 'close (draft kept)' : 'close'}
        </button>
        <span className="muted jr-count">{draft.text.trim() ? `${draft.text.trim().split(/\s+/).length} words` : ''}</span>
      </div>
    </div>
  )
}

export function Journal() {
  const [entries, setEntries] = useTool<Entry[]>('journal', [])
  const [lines] = useTool<Record<string, string>>('one-line', {})
  const [, setHype] = useTool<Hype[]>('hype', [])
  const [pin, setPin] = useTool<string>('journal-pin', '')
  const [welcomed, setWelcomed] = useTool<boolean>('journal-welcomed', false)
  const [draft, setDraft] = useTool<Draft | null>('journal-draft', null)
  const [unlocked, setUnlocked] = useState(false)
  const [tryPin, setTryPin] = useState('')
  const [hyped, setHyped] = useState<string | null>(null)

  if (pin && !unlocked)
    return (
      <Card className="focus-card">
        <p className="big-q">🔒 journal locked</p>
        <form
          className="row gap-sm"
          onSubmit={(e) => {
            e.preventDefault()
            if (tryPin === pin) setUnlocked(true)
            setTryPin('')
          }}
        >
          <input className="grow" type="password" inputMode="numeric" maxLength={4} value={tryPin} onChange={(e) => setTryPin(e.target.value)} placeholder="4-digit PIN" aria-label="PIN" />
          <button type="submit" className="btn btn-primary a-lime">
            open
          </button>
        </form>
      </Card>
    )

  // First visit with nothing written anywhere: point beginners at the easiest start.
  if (!welcomed && !entries.length && !Object.keys(lines).length)
    return (
      <Card className="jr-welcome">
        <p className="big-q">New to journaling?</p>
        <p>Start with One Line a Day: one sentence about today, nothing more. It takes ten seconds and it’s how most people build the habit.</p>
        <div className="row gap-sm wrap">
          <a className="btn btn-primary a-lime" href="#/tools/one-line" onClick={() => setWelcomed(true)}>
            start with one line
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setWelcomed(true)
              setDraft({ ...EMPTY_DRAFT })
            }}
          >
            I’ll write a full entry
          </button>
        </div>
      </Card>
    )

  if (draft)
    return (
      <Editor
        draft={draft}
        setDraft={setDraft}
        onClose={() => setDraft(draft.text.trim() ? draft : null)}
        onSave={() => {
          const now = Date.now()
          const base = { title: draft.title.trim(), prompt: draft.prompt, text: draft.text.trim(), updatedAt: now }
          if (draft.id) setEntries(entries.map((e) => (e.id === draft.id ? { ...e, ...base } : e)))
          else {
            setEntries([{ id: uid(), date: today(), ...base }, ...entries])
            log('journal')
          }
          setDraft(null)
        }}
      />
    )

  const toHype = (e: Entry) => {
    const text = e.text.length > 220 ? `${e.text.slice(0, 217)}…` : e.text
    setHype((h) => [{ id: uid(), text: e.title ? `${e.title}: ${text}` : text, date: e.date }, ...h])
    setHyped(e.id)
    log('tool', { silent: true })
  }

  return (
    <div className="stack">
      <button type="button" className="btn btn-primary a-lime big-cta jr-new" onClick={() => setDraft({ ...EMPTY_DRAFT })}>
        ✍️ new entry
      </button>
      {entries.length ? (
        <ul className="jr-list">
          {entries.map((e) => (
            <li key={e.id}>
              <button type="button" className="jr-open" onClick={() => setDraft({ id: e.id, title: e.title ?? '', prompt: e.prompt, text: e.text })}>
                <small>{shortDate(e.date)}</small>
                <b>{titleOf(e)}</b>
                <span>{e.text}</span>
              </button>
              <div className="jr-actions">
                {hyped === e.id ? (
                    <span className="muted">added to your hype file ✓</span>
                  ) : (
                    <span className="hint">
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => toHype(e)} aria-describedby={`hype-why-${e.id}`}>
                        🏆 turn into hype file
                      </button>
                      <span className="hint-tip" role="tooltip" id={`hype-why-${e.id}`}>
                        Your hype file is a stash of wins and kind words. On a bad day, open it and read proof that you’re doing better than you think.
                      </span>
                    </span>
                  )}
                <button type="button" className="linkish muted" onClick={() => confirm('Delete this entry?') && setEntries(entries.filter((x) => x.id !== e.id))}>
                  delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty emoji="📓">No entries yet. Tap “new entry”, add a title or a prompt, and write.</Empty>
      )}
      <details className="pin-set">
        <summary>{pin ? '🔒 PIN is on' : '🔓 add a PIN'}</summary>
        <div className="row gap-sm">
          <input className="grow" type="password" inputMode="numeric" maxLength={4} placeholder="new 4-digit PIN (empty = off)" onBlur={(e) => setPin(e.target.value.trim())} />
        </div>
        <p className="muted">Keeps casual snoopers out on this device. It isn’t encryption.</p>
      </details>
    </div>
  )
}

// ─── One line a day ───────────────────────────────────────────
export function OneLine() {
  const [lines, setLines] = useTool<Record<string, string>>('one-line', {})
  const [v, setV] = useState(lines[today()] ?? '')
  const past = Object.entries(lines)
    .filter(([d]) => d !== today())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7)
  const month = lines[addDays(today(), -30)]
  const year = lines[addDays(today(), -365)]
  return (
    <div className="stack">
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          if (!v.trim()) return
          if (!lines[today()]) {
            log('journal')
            log('gratitude', { silent: true })
          }
          setLines({ ...lines, [today()]: v.trim() })
        }}
      >
        <input className="one-line" value={v} maxLength={140} onChange={(e) => setV(e.target.value)} placeholder="today in one sentence…" aria-label="Today in one sentence" />
        <button type="submit" className="btn btn-primary a-lime" disabled={!v.trim()}>
          {lines[today()] ? 'update ✓' : 'save today ✓'}
        </button>
      </form>
      {(month || year) && (
        <Card className="soft">
          <p className="kicker">on this day</p>
          {month && <p>1 month ago: “{month}”</p>}
          {year && <p>1 year ago: “{year}”</p>}
        </Card>
      )}
      {past.length > 0 && (
        <ul className="lines">
          {past.map(([d, l]) => (
            <li key={d}>
              <span>{shortDate(d)}</span> {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Hype file ────────────────────────────────────────────────

export function HypeFile() {
  const [items, setItems] = useTool<Hype[]>('hype', [])
  const [shown, setShown] = useState<Hype | null>(null)
  return (
    <div className="stack">
      <QuickAdd placeholder="a compliment, a win, a nice message…" onAdd={(text) => setItems([{ id: uid(), text, date: today() }, ...items])} button="save 🏆" />
      {items.length > 0 && (
        <button type="button" className="btn btn-primary a-pink" onClick={() => setShown(pick(items, shown ?? undefined))}>
          😔 bad day? read one
        </button>
      )}
      {shown && (
        <Card className="focus-card">
          <p className="big-q">“{shown.text}”</p>
          <p className="muted">saved {shortDate(shown.date)} — this is still true.</p>
        </Card>
      )}
      {items.length ? (
        <List items={items} onRemove={(h) => setItems(items.filter((x) => x.id !== h.id))} render={(h) => h.text} />
      ) : (
        <Empty emoji="🏆">Save compliments, wins and kind messages here, or turn a journal entry into one. On a bad day, tap “read one”.</Empty>
      )}
    </div>
  )
}

// ─── Bad day kit ──────────────────────────────────────────────
const COMFORT = ['🚿 hot shower', '🚶 10-min walk', '🍜 eat something warm', '😴 20-min nap', '😭 cry it out', '🐶 cuddle a pet', '📺 comfort show', '🧹 clean one tiny thing', '💧 glass of water', '🌞 sit in sunlight']
type Kit = { actions: string[]; songs: string[]; people: string[] }

export function BadDay() {
  const [kit, setKit] = useTool<Kit>('bad-day', { actions: [], songs: [], people: [] })
  const [run, setRun] = useState<number | null>(null)
  const ready = kit.actions.length + kit.songs.length + kit.people.length > 0
  const toggleAction = (a: string) => setKit({ ...kit, actions: kit.actions.includes(a) ? kit.actions.filter((x) => x !== a) : [...kit.actions, a] })

  if (run !== null) {
    const steps = [
      kit.actions.length ? { emoji: '🫶', title: 'first, do this', body: pick(kit.actions) } : null,
      kit.songs.length ? { emoji: '🎧', title: 'now play', body: pick(kit.songs), href: `https://www.youtube.com/results?search_query=${encodeURIComponent(pick(kit.songs))}` } : null,
      kit.people.length ? { emoji: '📱', title: 'then text', body: `${pick(kit.people)} — “having a rough day. can we talk?”` } : null,
    ].filter(Boolean) as { emoji: string; title: string; body: string; href?: string }[]
    const s = steps[run]
    if (!s)
      return (
        <div className="stack">
          <Done emoji="🧸" title="you took care of you. that counts." />
          <button type="button" className="btn btn-sm" onClick={() => setRun(null)}>
            back to my kit
          </button>
        </div>
      )
    return (
      <Card className="focus-card">
        <span className="done-emoji">{s.emoji}</span>
        <p className="kicker">{s.title}</p>
        <p className="big-q">{s.body}</p>
        <div className="row gap-sm wrap center">
          {s.href && (
            <WebLink className="btn" url={s.href} title="Your comfort song">
              ▶ play
            </WebLink>
          )}
          <button type="button" className="btn btn-primary a-lime" onClick={() => setRun(run + 1)}>
            done → next
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="stack">
      {ready && (
        <button
          type="button"
          className="btn btn-primary a-pink big-cta"
          onClick={() => {
            setRun(0)
            log('tool')
          }}
        >
          🧸 I’m having a bad day
        </button>
      )}
      <p className="kicker">things that help me</p>
      <div className="row gap-sm wrap">
        {COMFORT.map((c) => (
          <button key={c} type="button" className={`chip${kit.actions.includes(c) ? ' on' : ''}`} onClick={() => toggleAction(c)}>
            {c}
          </button>
        ))}
      </div>
      <p className="kicker">comfort songs</p>
      <QuickAdd placeholder="song or artist" onAdd={(s) => setKit({ ...kit, songs: [...kit.songs, s] })} />
      <div className="row gap-sm wrap">
        {kit.songs.map((s) => (
          <button key={s} type="button" className="chip on" onClick={() => setKit({ ...kit, songs: kit.songs.filter((x) => x !== s) })}>
            🎵 {s} ×
          </button>
        ))}
      </div>
      <p className="kicker">my people</p>
      <QuickAdd placeholder="who can you text?" onAdd={(s) => setKit({ ...kit, people: [...kit.people, s] })} />
      <div className="row gap-sm wrap">
        {kit.people.map((s) => (
          <button key={s} type="button" className="chip on" onClick={() => setKit({ ...kit, people: kit.people.filter((x) => x !== s) })}>
            💗 {s} ×
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Affirmations ─────────────────────────────────────────────
const AFFIRM: Record<string, string[]> = {
  '💖 self-worth': [
    'I am enough before I achieve anything.',
    'I don’t have to earn rest.',
    'My worth isn’t my marks, my followers or my body.',
    'I’m allowed to take up space.',
    'I am becoming, not behind.',
    'I talk to myself like someone I love.',
  ],
  '🪞 body': [
    'My body is a home, not a project.',
    'I eat to fuel, not to punish.',
    'Bodies change. That’s what living looks like.',
    'I move because it feels good.',
    'Filters are fake. My face is real and enough.',
    'I’m grateful for what my body did today.',
  ],
  '📚 exams': [
    'I prepared, and I’ll do my best.',
    'One exam doesn’t write my whole story.',
    'My brain works better calm. I breathe first.',
    'I’ve survived every hard day so far.',
    'Done is better than perfect.',
    'I am more than a rank.',
  ],
  '💌 love': [
    'I deserve love that doesn’t confuse me.',
    'Their silence is an answer, and I accept it.',
    'I don’t chase. I attract what I’m ready for.',
    'Being alone isn’t being lonely.',
    'My standards aren’t too high. They’re just right.',
    'I can love someone and still leave.',
  ],
  '💸 money': [
    'I can learn money. It’s a skill, not a gift.',
    'Every rupee saved is future-me saying thanks.',
    'I don’t buy things to impress people I don’t like.',
    'Small and steady beats big and scared.',
    'I am building, slowly. That counts.',
    'I am worthy of financial peace.',
  ],
  '🌀 anxiety': [
    'This feeling is temporary.',
    'I’ve felt this before and I got through it.',
    'Thoughts are not facts.',
    'I can do hard things while feeling scared.',
    'Right now, in this moment, I am safe.',
    'I don’t need to solve everything today.',
  ],
}

export function Affirm() {
  const areas = Object.keys(AFFIRM)
  const [area, setArea] = useState(areas[0])
  const [i, setI] = useState(0)
  const [favs, setFavs] = useTool<string[]>('affirm-favs', [])
  const line = AFFIRM[area][i % AFFIRM[area].length]
  const fav = favs.includes(line)
  return (
    <div className="stack">
      <div className="row gap-sm wrap">
        {areas.map((a) => (
          <button
            key={a}
            type="button"
            className={`chip${area === a ? ' on' : ''}`}
            onClick={() => {
              setArea(a)
              setI(0)
            }}
          >
            {a}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="affirm-card"
        onClick={() => {
          setI(i + 1)
          log('tool', { silent: true })
        }}
      >
        <span>{line}</span>
        <small>tap for the next one →</small>
      </button>
      <div className="row gap-sm wrap center">
        <button type="button" className="btn" onClick={() => setFavs(fav ? favs.filter((f) => f !== line) : [...favs, line])}>
          {fav ? '💖 saved' : '🤍 save'}
        </button>
        <button type="button" className="btn btn-primary a-violet" onClick={() => shareCard({ kicker: 'my affirmation', text: line })}>
          🖼️ make it my wallpaper
        </button>
      </div>
      {favs.length > 0 && (
        <details>
          <summary className="kicker">my favourites ({favs.length})</summary>
          <ul className="dot-list">
            {favs.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
