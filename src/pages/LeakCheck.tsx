// Leak Check: open a statement and see what's quietly costing you money.
// The total and the first three leaks are free. The pass unlocks the rest.
import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { analyse, CANCEL, CANCEL_GENERAL, inr, leakPerMonth, parseStatement, SAMPLE, type LeakItem, type Report } from '../lib/leak'
import { niceDate } from '../data/claims'
import { NeedsPassword, readPdf } from '../lib/pdfText'
import { PRICES, usePlus } from '../lib/plus'
import { useCancelled, useFine } from '../lib/saved'
import { toast } from '../lib/toast'

const FREE_ROWS = 3
const KIND: Record<LeakItem['kind'], string> = { sub: 'subscription', repeat: 'repeats monthly', fee: 'bank fee' }

/** The report lives only in memory, so buying the pass and coming back doesn't lose it. */
let kept: { report: Report; sample: boolean } | null = null

function Row({ item, onFine, onCancelled }: { item: LeakItem; onFine: () => void; onCancelled: () => void }) {
  const guide = CANCEL[item.key]
  return (
    <li className="lk-row">
      <div className="lk-row-top">
        <span className="grow">
          <b>{item.name}</b>
          <small>
            {KIND[item.kind]} · paid {item.count} {item.count === 1 ? 'time' : 'times'}
          </small>
        </span>
        <span className="lk-amount">
          <b>{inr(item.monthly)}</b>
          <small>a month</small>
        </span>
      </div>
      <details className="lk-more">
        <summary>{item.kind === 'fee' ? 'what can I do?' : 'how do I stop this?'}</summary>
        <p>{item.kind === 'fee' ? 'Ask your bank why this was charged. If it’s wrong, ask for a reversal in writing. If you get SMS or card charges you don’t use, ask to switch them off.' : `${guide ? `${guide} ` : ''}${CANCEL_GENERAL}`}</p>
      </details>
      <div className="lk-actions">
        <button type="button" className="btn btn-sm btn-primary a-sun" onClick={onCancelled}>
          {item.kind === 'fee' ? 'I sorted this' : 'I stopped this'}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onFine}>
          this is fine
        </button>
      </div>
    </li>
  )
}

function Results({ report, sample, onReset }: { report: Report; sample: boolean; onReset: () => void }) {
  const plus = usePlus()
  const [fine, setFine] = useFine()
  const [cancelled, setCancelled] = useCancelled()
  const done = [...fine, ...cancelled.map((c) => c.key)]
  const items = report.items.filter((i) => !done.includes(i.key))
  const monthly = leakPerMonth(report, done)
  const shown = plus.active ? items : items.slice(0, FREE_ROWS)
  const hidden = items.length - shown.length
  const top = report.cats[0]?.total ?? 1

  return (
    <>
      <section className="lk-total" aria-live="polite">
        {sample && <span className="lk-sample">example, made-up statement</span>}
        <small>
          {niceDate(report.from)} to {niceDate(report.to)} · {report.txCount} payments read
        </small>
        <b>{inr(monthly)}</b>
        <span>leaking every month, about {inr(monthly * 12)} a year</span>
      </section>

      {report.doubles.length > 0 && (
        <section className="mk-card lk-doubles">
          <h3>
            {plus.active ? inr(report.doubles.reduce((n, d) => n + d.amount, 0)) : `${report.doubles.length} ${report.doubles.length === 1 ? 'payment' : 'payments'}`} you may be able to get back
          </h3>
          {plus.active ? (
            <ul className="lk-list">
              {report.doubles.map((d) => (
                <li key={`${d.key}${d.date}`}>
                  <span className="grow">
                    <b>{d.name}</b>
                    <small>paid twice on {niceDate(d.date)}?</small>
                  </span>
                  <a className="btn btn-sm" href={`#/back/wrong-charge?amount=${d.amount}&date=${d.date}&other=${encodeURIComponent(d.name)}`}>
                    claim {inr(d.amount)}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">It looks like you paid the same amount twice within minutes. Unlock to see where.</p>
          )}
        </section>
      )}

      <section className="mk-card">
        <h3>what’s leaking</h3>
        {items.length === 0 ? (
          <p className="muted">Nothing repeating or suspicious found here. Nice.</p>
        ) : (
          <ul className="lk-rows">
            {shown.map((i) => (
              <Row
                key={i.key}
                item={i}
                onFine={() => setFine([...fine, i.key])}
                onCancelled={() => {
                  setCancelled([...cancelled, { key: i.key, name: i.name, monthly: i.monthly }])
                  toast({ icon: '✦', title: `${inr(i.monthly * 12)} a year saved`, sub: `${i.name} stopped`, tone: 'badge' })
                }}
              />
            ))}
          </ul>
        )}
        {hidden > 0 && (
          <a className="lk-unlock" href="#/plus">
            <b>
              {hidden} more {hidden === 1 ? 'leak' : 'leaks'} found
            </b>
            <span>
              see them all for ₹{PRICES.monthly} <ArrowRight size={16} aria-hidden="true" />
            </span>
          </a>
        )}
      </section>

      {plus.active && report.tip && (
        <section className="mk-card">
          <h3>one easy change</h3>
          <p>
            One less {report.tip.label} order a week saves about <b>{inr(report.tip.perYear)}</b> a year. Your average order is {inr(report.tip.perOrder)}.
          </p>
        </section>
      )}

      <section className="mk-card">
        <h3>where your money went</h3>
        <ul className="lk-bars">
          {report.cats.slice(0, 6).map((c) => (
            <li key={c.id}>
              <span>{c.label}</span>
              <b>{inr(c.total)}</b>
              <i aria-hidden="true">
                <em style={{ width: `${Math.max(3, (c.total / top) * 100)}%` }} />
              </i>
            </li>
          ))}
        </ul>
        {report.credit.length > 0 && <p className="muted">Pay later and EMIs aren’t counted as leaks, but check you’re not paying fees on them.</p>}
      </section>

      <button type="button" className="btn big-cta" onClick={onReset}>
        check another statement
      </button>
    </>
  )
}

export default function LeakCheck() {
  const [result, setResult] = useState(kept)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [locked, setLocked] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [wrong, setWrong] = useState(false)
  const [pasting, setPasting] = useState(false)
  const [pasted, setPasted] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const show = (text: string, sample = false) => {
    const report = analyse(parseStatement(text))
    if (!report) return setError('We couldn’t find any payments in that. Try a PDF statement from PhonePe, Google Pay, Paytm or your bank, or paste the text below.')
    kept = { report, sample }
    setResult(kept)
    setError('')
    setLocked(null)
    window.scrollTo(0, 0)
  }

  const open = async (file: File, pass?: string) => {
    setBusy(true)
    setError('')
    try {
      show(file.name.toLowerCase().endsWith('.pdf') ? await readPdf(file, pass) : await file.text())
    } catch (e) {
      if (e instanceof NeedsPassword) {
        setLocked(file)
        setWrong(e.wrong)
      } else setError('We couldn’t open that file. Try downloading the statement again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page mk">
      <header className="mk-head">
        <p className="kicker">your statement stays on your phone</p>
        <h1>
          Leak Check. <span className="serif">Where’s it going?</span>
        </h1>
        {!result && <p className="lede">Open a statement and we’ll find subscriptions, repeat payments, bank fees and double payments. No bank login. No SMS access.</p>}
      </header>

      {result ? (
        <Results
          report={result.report}
          sample={result.sample}
          onReset={() => {
            kept = null
            setResult(null)
          }}
        />
      ) : (
        <>
          <section className="mk-card lk-open">
            <input
              ref={input}
              hidden
              id="lk-file"
              type="file"
              accept=".pdf,.csv,.txt,application/pdf,text/csv,text/plain"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void open(f)
                e.target.value = ''
              }}
            />
            <button type="button" className="btn btn-primary a-sun big-cta" disabled={busy} onClick={() => input.current?.click()}>
              {busy ? 'reading…' : 'open my statement'}
            </button>
            <p className="muted">Use a PDF from PhonePe, Google Pay, Paytm or your bank. Three months works best.</p>
            {locked && (
              <form
                className="lk-pass"
                onSubmit={(e) => {
                  e.preventDefault()
                  void open(locked, password)
                }}
              >
                <label htmlFor="lk-pass">{wrong ? 'That password didn’t work. Try again.' : 'This statement has a password. Your bank’s email or app says what it is.'}</label>
                <div className="row gap-sm">
                  <input id="lk-pass" className="act-input" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="submit" className="btn btn-primary a-sun" disabled={!password || busy}>
                    open
                  </button>
                </div>
              </form>
            )}
            {error && (
              <p className="pl-error" role="alert">
                {error}
              </p>
            )}
            <div className="row gap-sm wrap center">
              <button type="button" className="btn btn-sm" onClick={() => show(SAMPLE, true)}>
                see an example
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setPasting(!pasting)}>
                paste text instead
              </button>
            </div>
            {pasting && (
              <>
                <label className="sr-only" htmlFor="lk-paste">
                  Statement text
                </label>
                <textarea id="lk-paste" className="act-input" rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="paste your statement here…" />
                <button type="button" className="btn btn-primary a-sun" disabled={!pasted.trim()} onClick={() => show(pasted)}>
                  check it
                </button>
              </>
            )}
          </section>
          <section className="mk-card">
            <h3>what you get</h3>
            <ul className="mk-list">
              <li>Free: your total leak, the top three, and where your money went.</li>
              <li>₹{PRICES.monthly} for a month: every leak, how to stop each one, double payments you can claim back, and one easy change.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
