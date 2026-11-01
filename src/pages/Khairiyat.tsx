// Khairiyat's page. It stands alone, without the app's menus, so it can be sent to someone
// on WhatsApp and make sense by itself. Everything it promises is also in docs/KHAIRIYAT.md.
import { useState, type FormEvent } from 'react'
import { signUpForCalls, type Signup } from '../lib/khairiyat'
import '../styles/khairiyat.css'

const STEPS = [
  { title: 'Tell us about them', body: 'What you call them, when they’re free, and what they like talking about.' },
  { title: 'We ask them first', body: 'We speak to your parent ourselves before the first call. If they say no, there are no calls.' },
  { title: 'The call comes', body: 'Same number, same time, about three minutes, in Hindi. It always says it’s an AI.' },
  { title: 'You get a note', body: 'A short WhatsApp note on how they are, and something to ask when you ring them.' },
]

const LIMITS = [
  { title: 'It doesn’t replace you', body: 'The note is there so your call is better, not so you can skip it.' },
  {
    title: 'It’s not an emergency service',
    body: 'If they mention something worrying, it tells them to call 112 and tries to reach you. A missed call doesn’t mean something is wrong, and an answered call doesn’t mean all is well.',
  },
  { title: 'It’s not a doctor', body: 'It asks if they’ve taken their medicines. It never tells them what to take.' },
  { title: 'It never asks for money', body: 'No OTPs, no bank details, nothing. If someone calling as us asks, it’s a scam.' },
]

function Form() {
  const [form, setForm] = useState<Signup>({ name: '', phone: '', parentCity: '', lives: 'india' })
  const [state, setState] = useState<{ status: 'idle' | 'busy' | 'done' } | { status: 'error'; message: string }>({ status: 'idle' })
  const set = <K extends keyof Signup>(key: K, value: Signup[K]) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setState({ status: 'busy' })
    const r = await signUpForCalls(form)
    setState(r.ok ? { status: 'done' } : { status: 'error', message: r.error })
  }

  if (state.status === 'done')
    return (
      <div className="kh-done" role="status">
        <strong>Thank you, {form.name.trim().split(' ')[0]}.</strong>
        <p>We’ll message you on WhatsApp to talk about your parents. Nothing starts until they’ve said yes.</p>
      </div>
    )

  return (
    <form className="kh-form" onSubmit={submit}>
      <label>
        Your name
        <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" required maxLength={80} />
      </label>
      <label>
        Your WhatsApp number
        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" required maxLength={24} />
      </label>
      <label>
        City your parents live in
        <input value={form.parentCity} onChange={(e) => set('parentCity', e.target.value)} maxLength={80} />
      </label>
      <fieldset>
        <legend>Where do you live?</legend>
        <div className="kh-choice">
          <label className={form.lives === 'india' ? 'on' : ''}>
            <input type="radio" name="lives" checked={form.lives === 'india'} onChange={() => set('lives', 'india')} />
            In India
          </label>
          <label className={form.lives === 'abroad' ? 'on' : ''}>
            <input type="radio" name="lives" checked={form.lives === 'abroad'} onChange={() => set('lives', 'abroad')} />
            Abroad
          </label>
        </div>
      </fieldset>
      {state.status === 'error' && (
        <p className="kh-error" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={state.status === 'busy'}>
        {state.status === 'busy' ? 'Sending…' : 'Ask to join'}
      </button>
      <p className="kh-fine">You won’t pay anything now. We’ll only use this number to talk about Khairiyat.</p>
    </form>
  )
}

export default function Khairiyat() {
  return (
    <div className="kh">
      <header className="kh-top">
        <span className="kh-mark">Khairiyat</span>
        <a href="#join" onClick={(e) => (e.preventDefault(), document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' }))}>
          Join the test
        </a>
      </header>

      <main>
        <section className="kh-hero">
          <div>
            <p className="kh-eyebrow">A daily call for your parents</p>
            <h1>
              So you always know
              <br />
              what to ask them.
            </h1>
            <p className="kh-lead">
              A friendly AI assistant rings Mummy or Papa in Hindi, asks about their day, and sends you a short note on WhatsApp. Then when you call tonight, you already know what to talk about.
            </p>
          </div>
          <figure className="kh-note" aria-label="A sample of the WhatsApp note">
            <figcaption>Sample note</figcaption>
            <div className="kh-bubble">
              <p>Neha ji, aaj Papa se baat hui.</p>
              <p>Ghutne ka dard kal se kam hai, aur subah park tak gaye the. Khana time par kha liya.</p>
              <p>Dawai: le li.</p>
              <p>
                <b>Aaj ki baat:</b> Sunday ko Ramesh chacha aa rahe hain. Poochhiyega kya banwa rahe hain.
              </p>
              <time>10:34 am</time>
            </div>
          </figure>
        </section>

        <section className="kh-section" aria-labelledby="how">
          <h2 id="how">How it works</h2>
          <ol className="kh-steps">
            {STEPS.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="kh-section kh-limits" aria-labelledby="limits">
          <h2 id="limits">What it won’t do</h2>
          <div className="kh-grid">
            {LIMITS.map((l) => (
              <div key={l.title}>
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="kh-section kh-join" id="join" aria-labelledby="join-title">
          <div>
            <p className="kh-eyebrow">The first 20 families</p>
            <h2 id="join-title">We’re testing this with a small group.</h2>
            <p className="kh-price">
              First week free<span>Then ₹799 a month, or $19 if you live abroad</span>
            </p>
            <p>The free week starts once your parent has said yes. Stop whenever you like, and we delete what we hold about your family when you ask.</p>
          </div>
          <Form />
        </section>

        <section className="kh-section kh-privacy" aria-labelledby="privacy">
          <h2 id="privacy">Your family’s privacy</h2>
          <p>
            Calls run on Sarvam’s voice service in India, and notes are written by Anthropic’s Claude, so both see what’s said on the call. Your parent is told this before they agree. The note goes to you and
            nobody else. We clear call transcripts after 30 days.
          </p>
        </section>
      </main>

      <footer className="kh-foot">Khairiyat is an early test by the team behind Perfectish.</footer>
    </div>
  )
}
