import { useEffect, useRef, useState } from 'react'
import { startRingtone, startSiren, unlockAudio } from '../lib/sound'
import { CopyButton } from './ui'

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
  </svg>
)

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/** Rings your phone with a fake call so you have an excuse to leave. */
export function FakeCall() {
  const [caller, setCaller] = useState('Mumma ❤️')
  const [delay, setDelay] = useState(5)
  const [state, setState] = useState<'idle' | 'waiting' | 'ringing' | 'live'>('idle')
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (state !== 'waiting') return
    if (secs <= 0) return setState('ringing')
    const t = setTimeout(() => setSecs((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [state, secs])

  useEffect(() => {
    if (state === 'ringing') return startRingtone()
    if (state === 'live') {
      const id = setInterval(() => setSecs((s) => s + 1), 1000)
      return () => clearInterval(id)
    }
  }, [state])

  const schedule = () => {
    unlockAudio()
    setSecs(delay)
    setState(delay === 0 ? 'ringing' : 'waiting')
  }

  return (
    <div className="card tool a-pink">
      <span className="tool-icon" aria-hidden="true">
        📞
      </span>
      <h3>Fake call</h3>
      <p>Creepy situation? Your phone “rings” and you have the perfect excuse to leave. Works best with the screen on full brightness.</p>
      <label className="field">
        <span>who’s calling</span>
        <input value={caller} onChange={(e) => setCaller(e.target.value)} maxLength={24} />
      </label>
      <div className="row gap-sm wrap" role="group" aria-label="Ring after">
        {[0, 5, 15, 30, 60].map((d) => (
          <button key={d} type="button" className={`chip${delay === d ? ' on' : ''}`} onClick={() => setDelay(d)}>
            {d === 0 ? 'now' : d < 60 ? `${d}s` : '1 min'}
          </button>
        ))}
      </div>
      {state === 'waiting' ? (
        <button type="button" className="btn btn-sm" onClick={() => setState('idle')}>
          ringing in {secs}s · cancel
        </button>
      ) : (
        <button type="button" className="btn btn-primary a-pink" onClick={schedule}>
          call me {delay ? `in ${delay < 60 ? `${delay}s` : '1 min'}` : 'now'}
        </button>
      )}

      {(state === 'ringing' || state === 'live') && (
        <div className="fake-call" role="dialog" aria-modal="true" aria-label={`Call from ${caller}`}>
          <div className="fc-top">
            <span className="fc-status">{state === 'ringing' ? 'incoming call…' : fmt(secs)}</span>
            <strong className="fc-name">{caller || 'Mumma'}</strong>
            <span className="fc-sub">mobile · India</span>
          </div>
          <div className={`fc-avatar${state === 'ringing' ? ' ringing' : ''}`}>{(caller || 'M').trim().charAt(0).toUpperCase()}</div>
          {state === 'live' && <p className="fc-hint">say it out loud: “Haan, I’m leaving right now. Stay on the line.”</p>}
          <div className="fc-actions">
            <button type="button" className="fc-btn decline" onClick={() => setState('idle')} aria-label="End call">
              <PhoneIcon />
            </button>
            {state === 'ringing' && (
              <button
                type="button"
                className="fc-btn accept"
                onClick={() => {
                  setSecs(0)
                  setState('live')
                }}
                aria-label="Accept call"
              >
                <PhoneIcon />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** A very loud alarm to draw attention. */
export function Siren() {
  const [on, setOn] = useState(false)
  const stop = useRef<(() => void) | null>(null)

  useEffect(() => () => stop.current?.(), [])

  const toggle = () => {
    if (on) {
      stop.current?.()
      stop.current = null
    } else stop.current = startSiren()
    setOn(!on)
  }

  return (
    <div className="card tool a-orange">
      <span className="tool-icon" aria-hidden="true">
        🚨
      </span>
      <h3>Panic siren</h3>
      <p>Max out your volume first. A loud alarm draws people in and scares most attackers off. Turn it on, then move toward people and light.</p>
      <button type="button" className={`btn btn-primary a-orange siren-btn${on ? ' on' : ''}`} onClick={toggle} aria-pressed={on}>
        {on ? '■ stop siren' : '▶ sound the siren'}
      </button>
    </div>
  )
}

/** Gets GPS and builds a ready-to-send "come find me" message. */
export function ShareLocation() {
  const [state, setState] = useState<{ kind: 'idle' } | { kind: 'locating' } | { kind: 'ready'; text: string } | { kind: 'error'; msg: string }>({ kind: 'idle' })

  const locate = () => {
    if (!('geolocation' in navigator)) return setState({ kind: 'error', msg: 'Location isn’t available on this device. Call 112 and describe a landmark.' })
    setState({ kind: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setState({ kind: 'ready', text: `🚨 I might need help. This is where I am right now (${time}): https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)} — please call me.` })
      },
      () => setState({ kind: 'error', msg: 'Couldn’t get your location. Check that location access is allowed for this site, or call 112.' }),
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  return (
    <div className="card tool a-cyan">
      <span className="tool-icon" aria-hidden="true">
        📍
      </span>
      <h3>Send my location</h3>
      <p>One tap grabs your GPS and writes the message. You choose who gets it. Nothing is stored or sent anywhere by this site.</p>
      {state.kind === 'ready' ? (
        <>
          <p className="loc-preview">{state.text}</p>
          <div className="row gap-sm wrap">
            <a className="btn btn-primary a-cyan btn-sm" href={`https://wa.me/?text=${encodeURIComponent(state.text)}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="btn btn-sm" href={`sms:?&body=${encodeURIComponent(state.text)}`}>
              SMS
            </a>
            <CopyButton text={state.text} className="btn btn-sm" />
          </div>
        </>
      ) : (
        <button type="button" className="btn btn-primary a-cyan" onClick={locate} disabled={state.kind === 'locating'}>
          {state.kind === 'locating' ? 'finding you…' : 'get my location'}
        </button>
      )}
      {state.kind === 'error' && <p className="error-text">{state.msg}</p>}
    </div>
  )
}
