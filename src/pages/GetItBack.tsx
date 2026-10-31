// Get It Back: pick what happened, answer a few questions, and get the rule, the dates and the letter.
// Free for everyone, always: nobody should hit a paywall while trying to recover their own money.
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { WebLink } from '../components/WebView'
import { CopyButton } from '../components/ui'
import { CHECKED, CLAIMS, claimById, niceDate, type Answers, type ClaimType } from '../data/claims'
import { confetti } from '../lib/confetti'
import { inr } from '../lib/leak'
import { useClaims } from '../lib/saved'
import { todayKey } from '../lib/storage'
import { toast } from '../lib/toast'

const BLANK: Answers = { name: '', amount: '', date: '', ref: '', other: '', details: '', choice: '' }

function Plan({ type, answers, started, savedId }: { type: ClaimType; answers: Answers; started: string; savedId?: string }) {
  const today = todayKey()
  const [claims, setClaims] = useClaims()
  const saved = claims.find((c) => c.id === savedId)
  const [id, setId] = useState(savedId)
  const tracked = id ? claims.find((c) => c.id === id) : saved
  const [won, setWon] = useState(answers.amount)
  const owed = type.owed?.(answers, today) ?? 0
  const steps = type.steps(answers, started, today)
  const letter = type.letter(answers, today)
  const [body, setBody] = useState(letter.body)
  const full = `Subject: ${letter.subject}\n\n${body}`

  const track = () => {
    const newId = Math.random().toString(36).slice(2, 10)
    setClaims([{ id: newId, type: type.id, answers, started, status: 'open', recovered: 0 }, ...claims])
    setId(newId)
    toast({ icon: '📌', title: 'Saved', sub: 'we’ll keep your dates here' })
  }

  return (
    <div className="gb-plan">
      {owed > 0 && (
        <section className="gb-owed">
          <small>the bank may owe you, on top of your money</small>
          <b>about {inr(owed)}</b>
          <span>₹100 for each day it’s late so far</span>
        </section>
      )}

      <section className="mk-card">
        <h3>your rights</h3>
        <ul className="gb-rules">
          {type.rules(answers).map((r) => (
            <li key={r.text}>
              {r.text}
              {r.source && (
                <>
                  {' '}
                  <WebLink className="linkish gb-source" url={r.source.url} title={r.source.label}>
                    source
                  </WebLink>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mk-card">
        <h3>what to do</h3>
        <ol className="gb-steps">
          {steps.map((s) => (
            <li key={s.title}>
              <b>{s.title}</b>
              {s.due && <em>{s.due <= today ? 'today' : `by ${niceDate(s.due)}`}</em>}
              <p>{s.body}</p>
              {(s.call || s.link) && (
                <div className="row gap-sm wrap">
                  {s.call && (
                    <a className="btn btn-sm btn-primary a-pink" href={`tel:${s.call}`}>
                      call {s.call}
                    </a>
                  )}
                  {s.link && (
                    <WebLink className="btn btn-sm" url={s.link.url} title={s.title}>
                      {s.link.label}
                    </WebLink>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mk-card">
        <h3>your letter</h3>
        <p className="gb-subject">
          <small>subject</small> {letter.subject}
        </p>
        <label className="sr-only" htmlFor="gb-letter">
          Letter
        </label>
        <textarea id="gb-letter" className="gb-letter" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="row gap-sm wrap">
          <CopyButton text={full} label="copy letter" className="btn btn-sm btn-primary a-lime" />
          <a className="btn btn-sm" href={`mailto:?subject=${encodeURIComponent(letter.subject)}&body=${encodeURIComponent(body)}`}>
            open in email
          </a>
          <a className="btn btn-sm" href={`https://wa.me/?text=${encodeURIComponent(full)}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </section>

      {!tracked && (
        <button type="button" className="btn btn-primary a-lime big-cta" onClick={track}>
          save my dates
        </button>
      )}

      {tracked?.status === 'open' && (
        <section className="mk-card">
          <h3>got your money back?</h3>
          <div className="gb-won">
            <label className="sr-only" htmlFor="gb-won">
              Amount you got back
            </label>
            <span>₹</span>
            <input id="gb-won" className="act-input" inputMode="numeric" value={won} onChange={(e) => setWon(e.target.value.replace(/\D/g, ''))} placeholder="amount" />
            <button
              type="button"
              className="btn btn-primary a-lime"
              disabled={!Number(won)}
              onClick={() => {
                setClaims(claims.map((c) => (c.id === tracked.id ? { ...c, status: 'won', recovered: Number(won) } : c)))
                confetti()
              }}
            >
              I got it back
            </button>
          </div>
          <button type="button" className="linkish muted" onClick={() => (setClaims(claims.filter((c) => c.id !== tracked.id)), (window.location.hash = '/back'))}>
            remove this claim
          </button>
        </section>
      )}

      {tracked?.status === 'won' && (
        <section className="gb-owed">
          <small>you did it</small>
          <b>{inr(tracked.recovered)} back</b>
          <span>tell a friend who’s stuck with the same thing</span>
        </section>
      )}

      <p className="muted">
        General information, not legal advice. Rules last checked in {CHECKED}. They can change, so check the source for anything big.
      </p>
    </div>
  )
}

function Claim({ type, query }: { type: ClaimType; query: URLSearchParams }) {
  const [claims] = useClaims()
  const saved = claims.find((c) => c.id === query.get('claim'))
  const [a, setA] = useState<Answers>(saved?.answers ?? { ...BLANK, amount: query.get('amount') ?? '', date: query.get('date') ?? '', other: query.get('other') ?? '', choice: type.choice?.options[0].id ?? '' })
  const [show, setShow] = useState(!!saved || !!type.urgent)
  const set = (patch: Partial<Answers>) => setA({ ...a, ...patch })
  const started = saved?.started ?? todayKey()

  return (
    <div className="page mk">
      <header className="mk-head">
        <p className="kicker">get it back</p>
        <h1 className="gb-title">{type.title}</h1>
        {type.urgent ? <p className="lede">Call 1930 first. Fill the rest in after.</p> : <p className="lede">{type.line}</p>}
      </header>

      {type.urgent && (
        <a className="btn btn-primary a-pink big-cta" href="tel:1930">
          call 1930 now
        </a>
      )}

      <form
        className="mk-card gb-form"
        onSubmit={(e) => {
          e.preventDefault()
          setShow(true)
        }}
      >
        {type.choice && (
          <fieldset>
            <legend>{type.choice.ask}</legend>
            <div className="row gap-sm wrap">
              {type.choice.options.map((o) => (
                <button key={o.id} type="button" className={`chip${a.choice === o.id ? ' on' : ''}`} aria-pressed={a.choice === o.id} onClick={() => set({ choice: o.id })}>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="gb-grid">
          <label>
            <span>{type.dateLabel}</span>
            <input className="act-input" type="date" max={todayKey()} value={a.date} onChange={(e) => set({ date: e.target.value })} />
          </label>
          <label>
            <span>amount (₹)</span>
            <input className="act-input" inputMode="numeric" value={a.amount} onChange={(e) => set({ amount: e.target.value.replace(/\D/g, '') })} placeholder="1000" />
          </label>
          <label>
            <span>{type.refLabel}</span>
            <input className="act-input" value={a.ref} onChange={(e) => set({ ref: e.target.value })} placeholder="optional for now" />
          </label>
          <label>
            <span>{type.otherLabel}</span>
            <input className="act-input" value={a.other} onChange={(e) => set({ other: e.target.value })} placeholder="optional for now" />
          </label>
          <label>
            <span>your name</span>
            <input className="act-input" value={a.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" placeholder="for the letter" />
          </label>
        </div>
        {!show && (
          <button type="submit" className="btn btn-primary a-lime big-cta">
            show my plan
          </button>
        )}
      </form>

      {show && <Plan key={JSON.stringify(a)} type={type} answers={a} started={started} savedId={saved?.id} />}
    </div>
  )
}

export default function GetItBack() {
  const [claims] = useClaims()
  const [path, search] = window.location.hash.replace(/^#\/back\/?/, '').split('?')
  const type = claimById(path)
  if (type) return <Claim type={type} query={new URLSearchParams(search)} />
  const open = claims.filter((c) => c.status === 'open')

  return (
    <div className="page mk">
      <header className="mk-head">
        <p className="kicker">free, always</p>
        <h1>
          Get It Back. <span className="serif">What happened?</span>
        </h1>
        <p className="lede">Pick one. You’ll get the rule in plain words, the dates that matter and a letter ready to send.</p>
      </header>

      {open.length > 0 && (
        <section className="gb-list" aria-label="Your claims">
          <p className="kicker">your claims</p>
          {open.map((c) => (
            <a key={c.id} className="gb-pick" href={`#/back/${c.type}?claim=${c.id}`}>
              <span className="grow">
                <b>{claimById(c.type)?.title}</b>
                <small>started {niceDate(c.started)}</small>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          ))}
        </section>
      )}

      <section className="gb-list" aria-label="What happened">
        {CLAIMS.map((c) => (
          <a key={c.id} className={`gb-pick${c.urgent ? ' urgent' : ''}`} href={`#/back/${c.id}`}>
            <span className="ibub">
              <Icon name={c.icon} />
            </span>
            <span className="grow">
              <b>{c.title}</b>
              <small>{c.line}</small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        ))}
      </section>
    </div>
  )
}
