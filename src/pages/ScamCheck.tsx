// Scam Check: paste it, see what's wrong with it. Runs on the phone; nothing is sent anywhere.
import { useMemo, useState } from 'react'
import { WebLink } from '../components/WebView'
import { CopyButton } from '../components/ui'
import { checkScam, EXAMPLES, type Level } from '../lib/scam'

const VERDICT: Record<Level, { title: string; line: string }> = {
  danger: { title: 'This looks like a scam', line: 'Don’t pay, don’t tap the link and don’t share any code.' },
  careful: { title: 'Be careful with this one', line: 'Something here is a known warning sign. Check before you act.' },
  clear: { title: 'No known scam signs', line: 'That doesn’t prove it’s safe. New scams appear all the time.' },
}

const AFTER: Record<Level, string[]> = {
  danger: ['Don’t reply, and don’t call any number in the message.', 'Check on the official app or website by typing the address yourself.', 'Block the sender.'],
  careful: ['Don’t pay or share anything until you’ve checked.', 'Contact the company through its official app or website.'],
  clear: ['Never share an OTP or PIN, whoever asks.', 'If they ask for money or a code later, check again.'],
}

export default function ScamCheck() {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState('')
  const verdict = useMemo(() => (checked ? checkScam(checked) : null), [checked])
  const warn = verdict ? `I checked this on perfectish. ${VERDICT[verdict.level].title}${verdict.flags[0] ? `: ${verdict.flags[0].title.toLowerCase()}` : ''}.\n\n“${checked.slice(0, 200)}”` : ''

  return (
    <div className="page mk">
      <header className="mk-head">
        <p className="kicker">free, always</p>
        <h1>
          Scam Check <span className="serif">before you pay.</span>
        </h1>
        <p className="lede">India lost over ₹22,000 crore to cyber fraud in 2025. Paste any message, job offer or link here. It’s checked on your phone and never sent anywhere.</p>
      </header>

      <form
        className="sc-form"
        onSubmit={(e) => {
          e.preventDefault()
          setChecked(text.trim())
        }}
      >
        <label className="sr-only" htmlFor="sc-text">
          Message to check
        </label>
        <textarea id="sc-text" className="act-input" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="paste the message, offer or link…" />
        <button type="submit" className="btn btn-primary a-pink big-cta" disabled={!text.trim()}>
          check it
        </button>
      </form>

      {!verdict && (
        <div className="sc-examples">
          <p className="muted">or try an example:</p>
          <div className="row gap-sm wrap">
            {EXAMPLES.map((x) => (
              <button
                key={x.label}
                type="button"
                className="chip"
                onClick={() => {
                  setText(x.text)
                  setChecked(x.text)
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {verdict && (
        <section className={`sc-result ${verdict.level}`} aria-live="polite">
          <h2>{VERDICT[verdict.level].title}</h2>
          <p>{VERDICT[verdict.level].line}</p>
          {verdict.flags.length > 0 && (
            <ul className="sc-flags">
              {verdict.flags.map((f) => (
                <li key={f.id}>
                  <b>{f.title}</b>
                  <small>{f.why}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {verdict && (
        <>
          <section className="mk-card">
            <h3>what to do now</h3>
            <ul className="mk-list">
              {AFTER[verdict.level].map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="row gap-sm wrap">
              <a className="btn btn-sm" href={`https://wa.me/?text=${encodeURIComponent(warn)}`} target="_blank" rel="noreferrer">
                warn someone on WhatsApp
              </a>
              <CopyButton text={warn} label="copy" />
            </div>
          </section>

          {verdict.level !== 'clear' && (
            <section className="mk-card">
              <h3>already paid or shared a code?</h3>
              <p className="muted">Every minute counts. Call 1930, India’s cyber fraud helpline, then follow the steps.</p>
              <div className="row gap-sm wrap">
                <a className="btn btn-primary a-pink" href="tel:1930">
                  call 1930
                </a>
                <a className="btn" href="#/back/scam">
                  get help now
                </a>
              </div>
            </section>
          )}

          <p className="muted">
            Got a scam call or message and lost nothing? You can report it on{' '}
            <WebLink className="linkish" url="https://sancharsaathi.gov.in/" title="Sanchar Saathi">
              Sanchar Saathi
            </WebLink>
            .
          </p>
        </>
      )}
    </div>
  )
}
