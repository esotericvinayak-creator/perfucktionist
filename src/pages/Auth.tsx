import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import { Logo } from '../components/Nav'
import { APP_SCHEME, appHandOver, clearNotice, googleAvailable, logIn, logInWithGoogle, resendConfirmation, sendReset, setNewPassword, signUp, useAuth } from '../lib/auth'
import { detectPlatform, inNativeApp } from '../lib/install'

type Screen = 'signup' | 'login' | 'forgot' | 'sent' | 'confirm'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Where to go after logging in: #/login?next=/plus comes back to the pass. */
function leave() {
  const next = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('next')
  window.location.hash = next?.startsWith('/') ? next : '/'
}

function strength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++
  return s
}

function PasswordInput({ value, onChange, placeholder, autoComplete }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="pw">
      <input className="act-input" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} aria-label="Password" />
      <button type="button" className="pw-eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}

function GoogleButton({ onError }: { onError: (e: string) => void }) {
  if (!googleAvailable()) return null
  return (
    <>
      <button
        type="button"
        className="btn google-btn"
        onClick={async () => {
          const r = await logInWithGoogle()
          if (!r.ok) onError(r.error)
        }}
      >
        <span className="g">G</span> continue with Google
      </button>
      <div className="or">
        <span>or</span>
      </div>
    </>
  )
}

/** One-off message after an email link ("✓ email confirmed", "that link expired"). */
function NoticeBar() {
  const { notice } = useAuth()
  if (!notice) return null
  return (
    <p className={`auth-notice ${notice.tone}`} role="status">
      {notice.text}
    </p>
  )
}

function Shell({ children, onBack, step, steps }: { children: ReactNode; onBack?: () => void; step?: number; steps?: number }) {
  return (
    <div className="auth-shell">
      <div className="auth-top">
        {onBack ? (
          <button type="button" className="icon-btn ghost" onClick={onBack} aria-label="Back">
            ←
          </button>
        ) : (
          <span />
        )}
        {steps ? (
          <div className="fs-dots">
            {Array.from({ length: steps }, (_, d) => (
              <span key={d} className={d < (step ?? 0) ? 'past' : d === step ? 'now' : ''} />
            ))}
          </div>
        ) : (
          <Logo />
        )}
        <span />
      </div>
      <div className="auth-body">{children}</div>
      <p className="auth-sos">
        need help right now? <a href="tel:112">112</a> · <a href="#/shield">safety tools</a> · <a href="tel:14416">14416</a>
      </p>
    </div>
  )
}

function Signup({ onBack, onLogin, onConfirm }: { onBack: () => void; onLogin: () => void; onConfirm: (email: string) => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const s = strength(pw)
  const valid = [name.trim().length >= 1 && EMAIL.test(email.trim()), pw.length >= 8 && ok][step]

  const next = async (e: FormEvent) => {
    e.preventDefault()
    if (!valid || busy) return
    setError('')
    if (step < 1) return setStep(step + 1)
    setBusy(true)
    const r = await signUp(name.trim(), email, pw)
    setBusy(false)
    if (!r.ok) {
      setError(r.error)
      if (/already/.test(r.error)) setStep(0)
      return
    }
    if (r.confirmEmail) onConfirm(email.trim())
    else leave()
  }

  return (
    <Shell onBack={step ? () => setStep(step - 1) : onBack} step={step} steps={2}>
      <form className="auth-form" onSubmit={next} key={step}>
        {step === 0 && (
          <>
            <GoogleButton onError={setError} />
            <p className="act-q">let’s get you in</p>
            <input className="act-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name or nickname" maxLength={24} autoComplete="given-name" aria-label="Your name" autoFocus />
            <input className="act-input" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" aria-label="Your email" />
            <p className="muted">your email is only for logging in. no spam, ever.</p>
          </>
        )}
        {step === 1 && (
          <>
            <p className="act-q">make a password</p>
            <PasswordInput value={pw} onChange={setPw} placeholder="at least 8 characters" autoComplete="new-password" />
            <div className="pw-meter" aria-label={`Password strength ${s} of 4`}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < s ? `on s${s}` : ''} />
              ))}
            </div>
            <p className="muted">{pw.length < 8 ? `${8 - pw.length} more character${8 - pw.length === 1 ? '' : 's'}` : s >= 3 ? 'strong 💪' : 'okay — a number or symbol makes it stronger'}</p>
            <label className={`consent${ok ? ' on' : ''}`}>
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
              <span className="box">{ok ? '✓' : ''}</span>
              <span>I’m 18 or older, or my parent or guardian knows I’m using perfectish and is okay with it.</span>
            </label>
            <p className="muted">your account is only for the pass. what you check stays on your phone.</p>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary a-lime big-cta" disabled={!valid || busy}>
          {busy ? 'creating…' : step < 1 ? 'next →' : 'create my account'}
        </button>
        {step === 0 && (
          <button type="button" className="linkish muted" onClick={onLogin}>
            already have an account? log in
          </button>
        )}
      </form>
    </Shell>
  )
}

function Login({ onBack, onSignup, onForgot }: { onBack: () => void; onSignup: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const unconfirmed = /confirm your email/i.test(error)
  return (
    <Shell onBack={onBack}>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault()
          if (busy) return
          setBusy(true)
          setError('')
          const r = await logIn(email, pw)
          setBusy(false)
          if (!r.ok) setError(r.error)
          else (clearNotice(), leave())
        }}
      >
        <NoticeBar />
        <p className="act-q">welcome back 👋</p>
        <GoogleButton onError={setError} />
        <input className="act-input" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="email" autoFocus />
        <PasswordInput value={pw} onChange={setPw} placeholder="password" autoComplete="current-password" />
        {error && <p className="error-text">{error}</p>}
        {unconfirmed && (
          <button
            type="button"
            className="btn btn-sm"
            disabled={resent}
            onClick={async () => {
              const r = await resendConfirmation(email)
              if (r.ok) setResent(true)
              else setError(r.error)
            }}
          >
            <Mail size={16} /> {resent ? 'sent — check your inbox' : 'send the confirmation link again'}
          </button>
        )}
        <button type="submit" className="btn btn-primary a-lime big-cta" disabled={!EMAIL.test(email.trim()) || !pw || busy}>
          <LogIn size={18} /> {busy ? 'logging in…' : 'log in'}
        </button>
        <div className="row space-between wrap gap-sm">
          <button type="button" className="linkish muted" onClick={onForgot}>
            forgot password?
          </button>
          <button type="button" className="linkish muted" onClick={onSignup}>
            new here? create account
          </button>
        </div>
      </form>
    </Shell>
  )
}

function Forgot({ onBack, onSent }: { onBack: () => void; onSent: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  return (
    <Shell onBack={onBack}>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await sendReset(email)
          if (r.ok) onSent(email.trim())
          else setError(r.error)
        }}
      >
        <NoticeBar />
        <p className="act-q">reset your password</p>
        <input className="act-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your email" autoComplete="email" autoFocus />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary a-lime big-cta" disabled={!EMAIL.test(email.trim())}>
          <Mail size={18} /> send reset link
        </button>
      </form>
    </Shell>
  )
}

/** Shown after a password-reset link brings the user back. */
export function NewPassword() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  return (
    <Shell>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault()
          const r = await setNewPassword(pw)
          if (!r.ok) setError(r.error)
        }}
      >
        <p className="act-q">pick a new password</p>
        <PasswordInput value={pw} onChange={setPw} placeholder="at least 8 characters" autoComplete="new-password" />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary a-lime big-cta" disabled={pw.length < 8}>
          save password
        </button>
      </form>
    </Shell>
  )
}

export default function Auth() {
  const auth = useAuth()
  const [screen, setScreen] = useState<Screen>('signup')
  // Back from an email link: go straight to logging in (or asking for a new reset link).
  const notice = auth.notice?.text
  useEffect(() => {
    if (notice) setScreen(/reset link/i.test(notice) ? 'forgot' : 'login')
  }, [notice])
  const [email, setEmail] = useState('')
  useEffect(() => {
    document.body.classList.add('onboarding')
    return () => document.body.classList.remove('onboarding')
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  if (auth.recovering) return <NewPassword />
  if (screen === 'signup') return <Signup onBack={leave} onLogin={() => setScreen('login')} onConfirm={(e) => (setEmail(e), setScreen('confirm'))} />
  if (screen === 'login') return <Login onBack={() => setScreen('signup')} onSignup={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />
  if (screen === 'forgot') return <Forgot onBack={() => setScreen('login')} onSent={(e) => (setEmail(e), setScreen('sent'))} />
  if (screen === 'sent' || screen === 'confirm')
    return (
      <Shell onBack={() => setScreen('login')}>
        <div className="auth-form">
          <span className="ob-seed">📬</span>
          <p className="act-q">check your inbox</p>
          <p className="muted">
            we sent a link to <b>{email}</b>. {screen === 'confirm' ? 'tap it to confirm your account, then log in.' : 'tap it to set a new password.'}
            {inNativeApp() && ' The link opens our website in your browser — then come back to the app.'}
          </p>
          <button type="button" className="btn btn-primary a-lime big-cta" onClick={() => setScreen('login')}>
            go to log in
          </button>
        </div>
      </Shell>
    )
  return null
}

/**
 * An email link the app asked for, opened in a browser. Only the app can finish it (it holds
 * the sign-in secret), so on Android this hands the code over; anywhere else it says where to go.
 */
export function EmailHandOver() {
  const link = appHandOver
  if (!link) return null
  const android = detectPlatform() === 'android'
  const reset = link.kind === 'reset'
  const params = new URLSearchParams({ type: link.kind, ...(link.code ? { code: link.code } : {}), ...(link.flowId ? { sb_flow_id: link.flowId } : {}) })
  // Chrome opens the app from an intent: link, or the fallback (the download page) if it isn't installed.
  const fallback = encodeURIComponent(`${window.location.origin}${window.location.pathname}#/get`)
  const open = `intent://auth?${params.toString()}#Intent;scheme=${APP_SCHEME};package=${APP_SCHEME};S.browser_fallback_url=${fallback};end`
  return (
    <div className="auth-shell">
      <div className="auth-top">
        <Logo />
      </div>
      <div className="auth-form handover">
        <span className="ob-seed">{link.error ? '⏳' : reset ? '🔑' : '✅'}</span>
        {link.error ? (
          <>
            <p className="act-q">that link didn’t work</p>
            <p className="muted">
              {link.error}. {reset ? 'Open the app and ask for a new reset link.' : 'Open the app and log in — if your email still isn’t confirmed, it can send a fresh link.'}
            </p>
          </>
        ) : reset ? (
          <>
            <p className="act-q">choose a new password in the app</p>
            <p className="muted">{android ? 'Tap below and the app opens, ready for your new password.' : 'Open this email on the phone that has the app — the reset finishes there.'}</p>
          </>
        ) : (
          <>
            <p className="act-q">email confirmed ✦</p>
            <p className="muted">{android ? 'Tap below to jump back into the app — you’ll be logged in.' : 'Now open perfectish on your phone and log in.'}</p>
          </>
        )}
        {android && !link.error && link.code && (
          <a className="btn btn-primary a-lime big-cta" href={open}>
            open the app
          </a>
        )}
        {android && (
          <p className="aw-note">
            Don’t have the app yet? <a href="#/get">Download it</a>.
          </p>
        )}
      </div>
    </div>
  )
}
