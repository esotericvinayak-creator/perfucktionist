// Competitive exams: pick yours, see what it actually is, then practise.
import { useState } from 'react'
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import { EXAMS, EXAM_GROUPS, examById, examsIn } from '../../data/exams'
import { SUBJECTS } from '../../data/questions'
import { Practice } from './Practice'

function ExamPage({ id, onBack }: { id: string; onBack: () => void }) {
  const e = examById(id)
  if (!e) return null
  const group = EXAM_GROUPS.find((g) => g.id === e.group)
  return (
    <div className="ex-page">
      <button type="button" className="linkish ex-back" onClick={onBack}>
        <ArrowLeft size={16} /> all exams
      </button>
      <header className="ex-head">
        <span className="kicker">
          {group?.emoji} {group?.label} · {e.body}
        </span>
        <h2>{e.name}</h2>
        <p className="muted">{e.full}</p>
      </header>

      <p className="ex-for">{e.forWhom}</p>

      <div className="ex-facts">
        <div>
          <p className="kicker">the rounds</p>
          <ol className="ex-stages">
            {e.stages.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <div>
          <p className="kicker">roughly when</p>
          <p>{e.season}</p>
        </div>
      </div>

      <a className="ex-official" href={e.site} target="_blank" rel="noreferrer">
        <ShieldCheck size={22} aria-hidden="true" />
        <span className="grow">
          <b>official website</b>
          <small>the only place to trust for the pattern, marks, dates and eligibility</small>
        </span>
        <ExternalLink size={16} aria-hidden="true" />
      </a>
      <p className="ex-warn">
        ⚠️ we deliberately don’t print question counts, marks or dates here — they change with every notification, and a stale number could cost you a year. always read the latest bulletin on the official site.
      </p>

      <p className="kicker">free, official prep</p>
      <div className="st-links">
        {e.free.map((f) => (
          <a key={f.url} className="st-link" href={f.url} target="_blank" rel="noreferrer">
            <span className="grow">
              <b>{f.label}</b>
              <small>free · official</small>
            </span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        ))}
      </div>

      <p className="kicker">practise what it tests</p>
      <Practice only={e.subjects} />
    </div>
  )
}

export function Exams() {
  const [open, setOpen] = useState<string | null>(null)
  const [tab, setTab] = useState<'exams' | 'practice'>('exams')

  if (open) return <ExamPage id={open} onBack={() => setOpen(null)} />

  return (
    <>
      <div className="lb-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'exams'} className={tab === 'exams' ? 'on' : ''} onClick={() => setTab('exams')}>
          {EXAMS.length} exams
        </button>
        <button type="button" role="tab" aria-selected={tab === 'practice'} className={tab === 'practice' ? 'on' : ''} onClick={() => setTab('practice')}>
          practice
        </button>
      </div>

      {tab === 'practice' ? (
        <Practice />
      ) : (
        <>
          <p className="lb-note">What each exam is, who runs it, and the free official prep. Then practise the subjects it tests — {SUBJECTS.length} subjects, free, no sign-up.</p>
          {EXAM_GROUPS.map((g) => {
            const list = examsIn(g.id)
            if (!list.length) return null
            return (
              <section key={g.id} className="ex-group">
                <p className="kicker">
                  {g.emoji} {g.label}
                </p>
                <div className="ex-cards">
                  {list.map((e) => (
                    <button key={e.id} type="button" className="ex-card" onClick={() => setOpen(e.id)}>
                      <b>{e.name}</b>
                      <small>{e.forWhom}</small>
                      <span className="ex-body">{e.body}</span>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}
    </>
  )
}
