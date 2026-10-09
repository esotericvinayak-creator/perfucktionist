// Bucket list: broad goals, each with its own sub-list of smaller steps.
// Stored under `tool:bucket`. v1 was a flat array of {id, text, done}; it is converted to goals the first time it loads.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { confetti } from '../lib/confetti'
import { log } from '../lib/progress'
import { Empty, Meter, QuickAdd, Text, uid, useTool } from './kit'

type Tone = 'lime' | 'pink' | 'violet' | 'cyan' | 'sun' | 'orange'
type Sub = { id: string; text: string; done: boolean }
type Goal = { id: string; title: string; emoji: string; tone: Tone; target: string; subs: Sub[]; achieved: boolean; achievedAt?: number }
type Store = { v: 2; goals: Goal[] }

const TONES: Tone[] = ['lime', 'pink', 'violet', 'cyan', 'sun', 'orange']
const EMOJIS = ['🌄', '✈️', '💪', '🎸', '💰', '📚', '🎓', '🏠', '❤️', '🧘', '🎤', '✨']

type Idea = { emoji: string; title: string; target: string; tone: Tone; subs: string[] }
const IDEAS: Idea[] = [
  { emoji: '🌌', title: 'See the Northern Lights', target: '2028', tone: 'cyan', subs: ['save ₹80k', 'pick a month and book flights', 'sort passport and visa'] },
  { emoji: '🌄', title: 'Do a Himalayan trek', target: 'before 25', tone: 'orange', subs: ['pick Kedarkantha or Hampta Pass', 'walk 3 times a week to get fit', 'book the group and gear'] },
  { emoji: '🎸', title: 'Learn the guitar', target: 'this year', tone: 'violet', subs: ['buy or borrow a guitar', 'learn 4 basic chords', 'play one full song for a friend'] },
  { emoji: '💪', title: 'Get fit', target: '', tone: 'lime', subs: ['pick a workout I actually enjoy', 'go 3 times a week for a month', 'run a 5k'] },
  { emoji: '🎒', title: 'Take a solo trip', target: 'before 30', tone: 'sun', subs: ['pick a place (Hampi? Pondicherry?)', 'book the train and a stay', 'go, with notifications off'] },
  { emoji: '🛕', title: 'Varanasi ghats at dawn', target: '', tone: 'orange', subs: ['book the train', 'stay near Assi Ghat', 'catch the Ganga aarti'] },
  { emoji: '🩸', title: 'Donate blood', target: 'this month', tone: 'pink', subs: ['find a nearby centre', 'check that I am eligible', 'book a slot'] },
  { emoji: '💡', title: 'Start a side hustle', target: '2027', tone: 'sun', subs: ['write down 3 ideas', 'test one for a week', 'get the first paying customer'] },
  { emoji: '🗣️', title: 'Learn a new language', target: '', tone: 'cyan', subs: ['pick the language', '15 minutes a day for 30 days', 'have one real conversation'] },
  { emoji: '🧑‍🍳', title: 'Cook for my family', target: '', tone: 'pink', subs: ['choose the menu', 'practise it once', 'host the dinner'] },
]

// ─── data shape + migration ───────────────────────────────────
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const str = (x: unknown, fallback = '') => (typeof x === 'string' ? x : fallback)

/** "🌄 sunrise trek" (how the old list stored things) becomes emoji 🌄 + title "sunrise trek". */
function splitEmoji(text: string) {
  const m = text.match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)\s+(.+)$/u)
  return m ? { emoji: m[1], title: m[2] } : { emoji: '', title: text }
}

function goalFrom(x: unknown, i: number): Goal | null {
  if (!isObj(x)) return null
  const subs = Array.isArray(x.subs) ? x.subs.filter(isObj).map((s) => ({ id: str(s.id) || uid(), text: str(s.text), done: s.done === true })) : []
  const title = str(x.title) || str(x.text)
  if (!title) return null
  const legacy = !('subs' in x) // a v1 item: {id, text, done}
  const split = legacy ? splitEmoji(title) : { emoji: str(x.emoji), title }
  return {
    id: str(x.id) || uid(),
    title: split.title,
    emoji: split.emoji || (legacy ? '🪣' : EMOJIS[i % EMOJIS.length]),
    tone: TONES.includes(x.tone as Tone) ? (x.tone as Tone) : TONES[i % TONES.length],
    target: str(x.target),
    subs,
    achieved: legacy ? x.done === true : x.achieved === true,
    achievedAt: typeof x.achievedAt === 'number' ? x.achievedAt : undefined,
  }
}

function normalise(raw: unknown): Store {
  const list = Array.isArray(raw) ? raw : isObj(raw) && Array.isArray(raw.goals) ? raw.goals : []
  return { v: 2, goals: list.map(goalFrom).filter((g): g is Goal => g !== null) }
}
const isStore = (raw: unknown) => isObj(raw) && raw.v === 2 && Array.isArray(raw.goals)

// ─── small pieces ─────────────────────────────────────────────
function Pill({ children }: { children: ReactNode }) {
  return <span className="bk-pill">{children}</span>
}

function Swatches({ value, onChange }: { value: Tone; onChange: (t: Tone) => void }) {
  return (
    <div className="bk-swatches" role="radiogroup" aria-label="Colour">
      {TONES.map((t) => (
        <button key={t} type="button" role="radio" aria-checked={value === t} aria-label={t} className={`bk-swatch a-${t}${value === t ? ' on' : ''}`} onClick={() => onChange(t)} />
      ))}
    </div>
  )
}

function Emojis({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div className="row gap-sm wrap" role="radiogroup" aria-label="Emoji">
      {EMOJIS.map((e) => (
        <button key={e} type="button" role="radio" aria-checked={value === e} className={`bk-emo${value === e ? ' on' : ''}`} onClick={() => onChange(e)}>
          {e}
        </button>
      ))}
    </div>
  )
}

function SubRow({ sub, onToggle, onRename, onDelete }: { sub: Sub; onToggle: (el: HTMLElement) => void; onRename: (t: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(sub.text)
  if (editing)
    return (
      <li>
        <form
          className="bk-edit-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) onRename(draft.trim())
            setEditing(false)
          }}
        >
          <input value={draft} maxLength={120} autoFocus aria-label="Rename step" onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="btn btn-sm btn-primary a-lime">
            save
          </button>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>
            cancel
          </button>
        </form>
      </li>
    )
  return (
    <li className="bk-sub">
      <label className={sub.done ? 'on' : ''}>
        <input type="checkbox" checked={sub.done} onChange={(e) => onToggle(e.currentTarget)} />
        <span className="box">{sub.done ? '✓' : ''}</span>
        <span className="bk-sub-text">{sub.text}</span>
      </label>
      <button type="button" className="bk-icon" aria-label={`Rename ${sub.text}`} onClick={() => (setDraft(sub.text), setEditing(true))}>
        ✎
      </button>
      <button type="button" className="bk-icon" aria-label={`Delete ${sub.text}`} onClick={onDelete}>
        ×
      </button>
    </li>
  )
}

function GoalCard({
  goal,
  open,
  first,
  last,
  onOpen,
  onChange,
  onMove,
  onDelete,
}: {
  goal: Goal
  open: boolean
  first: boolean
  last: boolean
  onOpen: () => void
  onChange: (g: Goal) => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const done = goal.subs.filter((s) => s.done).length
  const all = goal.subs.length > 0 && done === goal.subs.length
  const canAchieve = goal.subs.length === 0 || all
  const bodyId = `bk-${goal.id}`

  const toggle = (id: string, el: HTMLElement) => {
    const sub = goal.subs.find((s) => s.id === id)
    if (!sub) return
    onChange({ ...goal, subs: goal.subs.map((s) => (s.id === id ? { ...s, done: !s.done } : s)) })
    if (!sub.done) {
      const r = el.getBoundingClientRect()
      confetti(r.left + r.width / 2, r.top + r.height / 2, 60)
      log('tool')
    }
  }
  const achieve = () => {
    onChange({ ...goal, achieved: true, achievedAt: Date.now() })
    confetti(undefined, undefined, 220)
    log('tool')
  }
  const remove = () => {
    if (window.confirm(`Delete "${goal.title}" and its ${goal.subs.length} step${goal.subs.length === 1 ? '' : 's'}?`)) onDelete()
  }

  return (
    <li className={`bk-goal a-${goal.tone}${open ? ' open' : ''}${all ? ' ready' : ''}`}>
      <button type="button" className="bk-head" aria-expanded={open} aria-controls={bodyId} onClick={onOpen}>
        <span className="bk-emoji" aria-hidden="true">
          {goal.emoji}
        </span>
        <span className="bk-main">
          <span className="bk-title">{goal.title}</span>
          <span className="bk-meta">
            {goal.subs.length > 0 ? (
              <span>
                {done} of {goal.subs.length} done
              </span>
            ) : (
              <span>no steps yet</span>
            )}
            {goal.target && <Pill>⏳ {goal.target}</Pill>}
          </span>
          {goal.subs.length > 0 && <Meter value={done} max={goal.subs.length} />}
        </span>
        <span className="bk-chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="bk-body" id={bodyId}>
          {editing ? (
            <div className="stack bk-editor">
              <Text label="goal" value={goal.title} onChange={(title) => onChange({ ...goal, title })} max={80} />
              <Text label="by when (optional)" value={goal.target} onChange={(target) => onChange({ ...goal, target })} placeholder="before 30, or 2027" max={24} />
              <Emojis value={goal.emoji} onChange={(emoji) => onChange({ ...goal, emoji })} />
              <Swatches value={goal.tone} onChange={(tone) => onChange({ ...goal, tone })} />
              <button type="button" className="btn btn-sm btn-primary a-lime" onClick={() => setEditing(false)} disabled={!goal.title.trim()}>
                done editing
              </button>
            </div>
          ) : (
            <>
              {goal.subs.length > 0 && (
                <ul className="check-steps bk-subs">
                  {goal.subs.map((s) => (
                    <SubRow
                      key={s.id}
                      sub={s}
                      onToggle={(el) => toggle(s.id, el)}
                      onRename={(text) => onChange({ ...goal, subs: goal.subs.map((x) => (x.id === s.id ? { ...x, text } : x)) })}
                      onDelete={() => window.confirm(`Delete the step "${s.text}"?`) && onChange({ ...goal, subs: goal.subs.filter((x) => x.id !== s.id) })}
                    />
                  ))}
                </ul>
              )}
              <QuickAdd placeholder={goal.subs.length ? 'add another small step…' : 'first small step…'} button="+" onAdd={(text) => onChange({ ...goal, subs: [...goal.subs, { id: uid(), text, done: false }] })} />
              {canAchieve && (
                <button type="button" className="btn btn-primary a-lime bk-achieve" onClick={achieve}>
                  🏆 {goal.subs.length ? 'every step done: mark achieved' : 'mark achieved'}
                </button>
              )}
              <div className="bk-tools">
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => onMove(-1)} disabled={first} aria-label="Move goal up">
                  ↑ up
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => onMove(1)} disabled={last} aria-label="Move goal down">
                  ↓ down
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(true)}>
                  ✎ edit
                </button>
                <button type="button" className="btn btn-sm btn-ghost bk-danger" onClick={remove}>
                  delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </li>
  )
}

// ─── the tool ─────────────────────────────────────────────────
export function BucketList() {
  const [raw, setRaw] = useTool<unknown>('bucket', { v: 2, goals: [] })
  const data = useMemo(() => normalise(raw), [raw])
  const goals = data.goals
  const [open, setOpen] = useState<string[]>([])
  const [title, setTitle] = useState('')

  // v1 (flat list) → v2, written back the first time it is seen (also when it arrives from another device)
  useEffect(() => {
    if (!isStore(raw)) setRaw(data)
  }, [raw, data, setRaw])

  const save = (next: Goal[]) => setRaw({ v: 2, goals: next } satisfies Store)
  const change = (g: Goal) => save(goals.map((x) => (x.id === g.id ? g : x)))
  const toggleOpen = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]))

  const add = (g: Omit<Goal, 'id' | 'achieved'>) => {
    const goal: Goal = { ...g, id: uid(), achieved: false }
    save([goal, ...goals])
    setOpen((o) => [...o, goal.id])
  }
  const addTitle = (t: string) => add({ title: t, emoji: EMOJIS[goals.length % EMOJIS.length], tone: TONES[goals.length % TONES.length], target: '', subs: [] })
  const addIdea = (i: Idea) => add({ title: i.title, emoji: i.emoji, tone: i.tone, target: i.target, subs: i.subs.map((text) => ({ id: uid(), text, done: false })) })

  const active = goals.filter((g) => !g.achieved)
  const won = goals.filter((g) => g.achieved).sort((a, b) => (b.achievedAt ?? 0) - (a.achievedAt ?? 0))
  const steps = active.reduce((n, g) => n + g.subs.length, 0)
  const stepsDone = active.reduce((n, g) => n + g.subs.filter((s) => s.done).length, 0)
  const unused = IDEAS.filter((i) => !goals.some((g) => g.title === i.title))

  // moving only swaps among goals still in progress, so achieved ones never get in the way
  const move = (id: string, dir: -1 | 1) => {
    const i = active.findIndex((g) => g.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= active.length) return
    const order = [...active]
    ;[order[i], order[j]] = [order[j], order[i]]
    save([...order, ...goals.filter((g) => g.achieved)])
  }

  return (
    <div className="stack bk">
      <form
        className="bk-new"
        onSubmit={(e) => {
          e.preventDefault()
          if (title.trim()) addTitle(title.trim())
          setTitle('')
        }}
      >
        <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="a big dream, e.g. see the Northern Lights" aria-label="New goal" />
        <button type="submit" className="btn btn-primary a-lime">
          + goal
        </button>
      </form>

      {goals.length === 0 ? (
        <Empty emoji="🪣">
          Big dream first, then the small steps.
          <br />
          <small className="muted">Tap an idea to start with 3 steps you can edit.</small>
        </Empty>
      ) : (
        active.length > 0 && (
          <p className="muted">
            {active.length} goal{active.length === 1 ? '' : 's'} in progress
            {steps > 0 && ` · ${stepsDone} of ${steps} small steps done`}
          </p>
        )
      )}

      {unused.length > 0 && (
        <div className="bk-ideas" role="group" aria-label="Ideas">
          {unused.slice(0, goals.length === 0 ? 6 : 4).map((i) => (
            <button key={i.title} type="button" className="chip" onClick={() => addIdea(i)}>
              + {i.emoji} {i.title}
            </button>
          ))}
        </div>
      )}

      {active.length > 0 && (
        <ul className="bk-list">
          {active.map((g, i) => (
            <GoalCard key={g.id} goal={g} open={open.includes(g.id)} first={i === 0} last={i === active.length - 1} onOpen={() => toggleOpen(g.id)} onChange={change} onMove={(d) => move(g.id, d)} onDelete={() => save(goals.filter((x) => x.id !== g.id))} />
          ))}
        </ul>
      )}

      {won.length > 0 && (
        <details className="bk-won">
          <summary className="kicker">🏆 achieved · {won.length}</summary>
          <ul className="bk-won-list">
            {won.map((g) => (
              <li key={g.id} className={`a-${g.tone}`}>
                <span className="bk-emoji sm" aria-hidden="true">
                  {g.emoji}
                </span>
                <span className="grow">
                  <b>{g.title}</b>
                  <small className="muted">
                    {g.subs.length > 0 && `${g.subs.filter((s) => s.done).length} of ${g.subs.length} steps · `}
                    {g.achievedAt ? new Date(g.achievedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'ticked off'}
                  </small>
                </span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => change({ ...g, achieved: false, achievedAt: undefined })}>
                  undo
                </button>
                <button type="button" className="bk-icon" aria-label={`Delete ${g.title}`} onClick={() => window.confirm(`Delete "${g.title}"?`) && save(goals.filter((x) => x.id !== g.id))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
