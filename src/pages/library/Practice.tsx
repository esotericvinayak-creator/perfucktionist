// Practice: 10 questions at a time, instant feedback, and your score kept on this device.
import { useMemo, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { SUBJECTS, bank, type SubjectId } from '../../data/questions'
import type { Q } from '../../data/questions/types'
import { confetti } from '../../lib/confetti'
import { log } from '../../lib/progress'
import { useLocalState } from '../../lib/storage'

const ROUND = 10
type Stats = Record<string, { done: number; right: number }>

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Round({ qs, subject, onDone }: { qs: Q[]; subject: SubjectId; onDone: (right: number) => void }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [right, setRight] = useState(0)
  const q = qs[i]

  const choose = (n: number) => {
    if (picked !== null) return
    setPicked(n)
    if (n === q.answer) setRight(right + 1)
    log('tool', { silent: true })
  }
  const next = () => {
    if (i + 1 >= qs.length) return onDone(right)
    setI(i + 1)
    setPicked(null)
  }

  return (
    <div className="pr-round">
      <div className="pr-top">
        <span className="kicker">
          {SUBJECTS.find((s) => s.id === subject)?.label} · {i + 1} / {qs.length}
        </span>
        <span className="pr-score">✓ {right}</span>
      </div>
      <div className="pr-bar" aria-hidden="true">
        <i style={{ width: `${((i + (picked !== null ? 1 : 0)) / qs.length) * 100}%` }} />
      </div>

      <p className="pr-q" key={i}>
        {q.q}
      </p>
      <div className="pr-opts">
        {q.options.map((o, n) => {
          const state = picked === null ? '' : n === q.answer ? ' right' : n === picked ? ' wrong' : ' dim'
          return (
            <button key={n} type="button" className={`pr-opt${state}`} onClick={() => choose(n)} disabled={picked !== null}>
              <span className="pr-letter">{'ABCD'[n]}</span>
              <span className="grow">{o}</span>
              {picked !== null && n === q.answer && <Check size={18} />}
              {picked !== null && n === picked && n !== q.answer && <X size={18} />}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="pr-why">
          <b>{picked === q.answer ? 'correct ✦' : 'not quite'}</b>
          <p>{q.why}</p>
          <button type="button" className="btn btn-primary a-lime big-cta" onClick={next} autoFocus>
            {i + 1 >= qs.length ? 'see my score →' : 'next question →'}
          </button>
        </div>
      )}
    </div>
  )
}

export function Practice({ only }: { only?: SubjectId[] }) {
  const subjects = useMemo(() => SUBJECTS.filter((s) => (only?.length ? only.includes(s.id) : true) && bank[s.id]?.length), [only])
  const [stats, setStats] = useLocalState<Stats>('practice', {})
  const [subject, setSubject] = useState<SubjectId | null>(null)
  const [qs, setQs] = useState<Q[]>([])
  const [result, setResult] = useState<number | null>(null)

  const start = (id: SubjectId) => {
    setSubject(id)
    setQs(shuffle(bank[id]).slice(0, ROUND))
    setResult(null)
  }

  if (subject && result === null)
    return (
      <Round
        qs={qs}
        subject={subject}
        onDone={(right) => {
          setResult(right)
          setStats({ ...stats, [subject]: { done: (stats[subject]?.done ?? 0) + qs.length, right: (stats[subject]?.right ?? 0) + right } })
          if (right >= qs.length - 2) confetti(window.innerWidth / 2, window.innerHeight / 3)
        }}
      />
    )

  if (subject && result !== null) {
    const pct = Math.round((result / qs.length) * 100)
    return (
      <div className="pr-result">
        <span className="pr-big">{pct}%</span>
        <p className="act-q">
          {result} out of {qs.length}
        </p>
        <p className="muted">{pct >= 80 ? 'you’re cooking. keep this pace.' : pct >= 50 ? 'solid base. the explanations are where the marks are.' : 'rough round — that’s information, not a verdict. go again.'}</p>
        <div className="row gap-sm wrap center">
          <button type="button" className="btn btn-primary a-lime" onClick={() => start(subject)}>
            <RotateCcw size={16} /> 10 more
          </button>
          <button type="button" className="btn" onClick={() => setSubject(null)}>
            pick another subject
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="lb-note">10 questions, instant answers with the reason. No timer, no leaderboard — just reps. Your score stays on this phone.</p>
      <div className="pr-grid">
        {subjects.map((s) => {
          const st = stats[s.id]
          return (
            <button key={s.id} type="button" className={`pr-sub a-${s.accent}`} onClick={() => start(s.id)}>
              <span className="pr-emoji">{s.emoji}</span>
              <b>{s.label}</b>
              <small>{bank[s.id].length} questions</small>
              {st?.done ? (
                <span className="pr-stat">
                  {Math.round((st.right / st.done) * 100)}% · {st.done} done
                </span>
              ) : (
                <span className="pr-stat new">start →</span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}
