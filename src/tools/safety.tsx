import { useEffect, useRef, useState } from 'react'
import { shareCard } from '../components/Overlays'
import { log } from '../lib/progress'
import { startSiren, unlockAudio } from '../lib/sound'
import { Card, Choice, Done, Meter, Text, mmss, useCountdown, useTool } from './kit'

// ─── Safe-walk timer ──────────────────────────────────────────
type Contact = { name: string; phone: string }
const digits = (p: string) => p.replace(/[^\d+]/g, '')
const waNumber = (p: string) => {
  const d = p.replace(/\D/g, '')
  return d.length === 10 ? `91${d}` : d
}

export function SafeWalk() {
  const [contact, setContact] = useTool<Contact>('sos-contact', { name: '', phone: '' })
  const [mins, setMins] = useState(15)
  const [where, setWhere] = useState('')
  const [phase, setPhase] = useState<'set' | 'walk' | 'alarm' | 'safe'>('set')
  const [loc, setLoc] = useState('')
  const stopSiren = useRef<(() => void) | null>(null)
  const t = useCountdown(() => {
    setPhase('alarm')
    stopSiren.current = startSiren()
    navigator.vibrate?.([600, 200, 600, 200, 600])
    navigator.geolocation?.getCurrentPosition((p) => setLoc(`https://maps.google.com/?q=${p.coords.latitude.toFixed(6)},${p.coords.longitude.toFixed(6)}`))
  })
  useEffect(() => () => stopSiren.current?.(), [])
  const safe = () => {
    stopSiren.current?.()
    stopSiren.current = null
    t.stop()
    setPhase('safe')
    log('tool')
  }
  const sosText = `🚨 I didn’t check in from my walk${where ? ` to ${where}` : ''}. ${loc ? `My location: ${loc}` : ''} Please call me now.`
  const planText = `Heading ${where ? `to ${where}` : 'home'} — should reach in ${mins} min. If you don’t hear from me, please call. 🙏`
  const ok = contact.name && digits(contact.phone).length >= 10

  if (phase === 'set')
    return (
      <div className="stack">
        <div className="two-up">
          <Text label="trusted person" value={contact.name} onChange={(name) => setContact({ ...contact, name })} placeholder="Mumma" />
          <Text label="their number" value={contact.phone} onChange={(phone) => setContact({ ...contact, phone })} placeholder="98xxxxxxxx" />
        </div>
        <Text label="where are you going? (optional)" value={where} onChange={setWhere} placeholder="home, hostel, metro station" max={40} />
        <Choice big options={[10, 15, 20, 30, 45].map((m) => ({ value: m, label: `${m} min` }))} value={mins} onChange={setMins} />
        <button
          type="button"
          className="btn btn-primary a-pink big-cta"
          disabled={!ok}
          onClick={() => {
            unlockAudio()
            t.start(mins * 60)
            setPhase('walk')
          }}
        >
          🚶 start my walk
        </button>
        <p className="muted">If you don’t tap “I’m safe” in time, a loud alarm goes off and one tap sends {contact.name || 'them'} your location. Keep this page open with the screen on.</p>
      </div>
    )
  if (phase === 'walk')
    return (
      <div className="stack center-stack">
        <b className="big-num">{mmss(t.left)}</b>
        <p className="muted">until we check on you</p>
        <button type="button" className="btn btn-primary a-lime big-cta" onClick={safe}>
          ✅ I’m safe
        </button>
        <div className="row gap-sm wrap center">
          <button type="button" className="btn btn-sm" onClick={() => t.start(t.left + 300)}>
            +5 min
          </button>
          <a className="btn btn-sm" href={`https://wa.me/${waNumber(contact.phone)}?text=${encodeURIComponent(planText)}`} target="_blank" rel="noreferrer">
            tell {contact.name} my plan
          </a>
        </div>
      </div>
    )
  if (phase === 'alarm')
    return (
      <div className="alarm">
        <p className="big-q">⚠️ are you okay?</p>
        <button type="button" className="btn btn-primary a-lime big-cta" onClick={safe}>
          ✅ I’m safe — stop alarm
        </button>
        <div className="alarm-grid">
          <a className="btn btn-primary a-pink" href={`tel:${digits(contact.phone)}`}>
            📞 call {contact.name}
          </a>
          <a className="btn" href={`https://wa.me/${waNumber(contact.phone)}?text=${encodeURIComponent(sosText)}`} target="_blank" rel="noreferrer">
            WhatsApp location
          </a>
          <a className="btn" href={`sms:${digits(contact.phone)}?&body=${encodeURIComponent(sosText)}`}>
            SMS location
          </a>
          <a className="btn" href="tel:112">
            🚨 call 112
          </a>
        </div>
      </div>
    )
  return (
    <div className="stack">
      <Done emoji="🏠" title="made it. proud of you for planning." />
      <button type="button" className="btn btn-sm" onClick={() => setPhase('set')}>
        new walk
      </button>
    </div>
  )
}

// ─── Emergency (ICE) card ─────────────────────────────────────
type Ice = { name: string; blood: string; allergies: string; conditions: string; meds: string; c1: string; c2: string }
const BLOOD = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']

export function IceCard() {
  const [ice, setIce] = useTool<Ice>('ice', { name: '', blood: '', allergies: '', conditions: '', meds: '', c1: '', c2: '' })
  const set = (p: Partial<Ice>) => setIce({ ...ice, ...p })
  const lines = [
    ice.name && `👤 ${ice.name}`,
    ice.blood && `🩸 blood group ${ice.blood}`,
    ice.allergies && `⚠️ allergies: ${ice.allergies}`,
    ice.conditions && `🩺 conditions: ${ice.conditions}`,
    ice.meds && `💊 meds: ${ice.meds}`,
    ice.c1 && `📞 ${ice.c1}`,
    ice.c2 && `📞 ${ice.c2}`,
  ].filter(Boolean) as string[]
  return (
    <div className="stack">
      <Text label="your name" value={ice.name} onChange={(name) => set({ name })} />
      <Choice options={BLOOD.map((b) => ({ value: b, label: b }))} value={ice.blood} onChange={(blood) => set({ blood })} />
      <Text label="allergies" value={ice.allergies} onChange={(allergies) => set({ allergies })} placeholder="penicillin, peanuts" />
      <Text label="medical conditions" value={ice.conditions} onChange={(conditions) => set({ conditions })} placeholder="asthma, diabetes" />
      <Text label="regular medicines" value={ice.meds} onChange={(meds) => set({ meds })} />
      <div className="two-up">
        <Text label="emergency contact 1" value={ice.c1} onChange={(c1) => set({ c1 })} placeholder="Papa — 98xxxxxxxx" />
        <Text label="emergency contact 2" value={ice.c2} onChange={(c2) => set({ c2 })} />
      </div>
      {lines.length > 0 && (
        <Card className="ice-preview">
          <p className="kicker">🆘 in case of emergency</p>
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </Card>
      )}
      <button type="button" className="btn btn-primary a-pink big-cta" disabled={lines.length < 2} onClick={() => shareCard({ kicker: '🆘 in case of emergency', text: lines.join('\n'), clean: true })}>
        🔒 save as lock-screen wallpaper
      </button>
      <p className="muted">Paramedics and strangers can see it without unlocking your phone. Stored only on this device.</p>
    </div>
  )
}

// ─── Privacy checkup ──────────────────────────────────────────
const PRIVACY: Record<string, { emoji: string; steps: [string, string][] }> = {
  Instagram: {
    emoji: '📸',
    steps: [
      ['Make your account private', 'search “account privacy” in settings'],
      ['Turn off activity status', 'search “activity status”'],
      ['Only people you follow can tag & mention you', 'search “tags and mentions”'],
      ['Hide your story from people you don’t trust', 'search “hide story from”'],
      ['Turn on two-factor authentication', 'search “two-factor”'],
      ['Restrict or block anyone creepy — they won’t be told', 'open their profile → ⋯ → restrict'],
    ],
  },
  WhatsApp: {
    emoji: '💬',
    steps: [
      ['Turn on two-step verification', 'Settings → Account → Two-step verification'],
      ['Last seen & online → My contacts', 'Settings → Privacy'],
      ['Profile photo → My contacts', 'Settings → Privacy'],
      ['Groups → My contacts (stop random adds)', 'Settings → Privacy → Groups'],
      ['Silence unknown callers', 'Settings → Privacy → Calls'],
      ['Turn on app lock / fingerprint', 'Settings → Privacy → App lock'],
    ],
  },
  Snapchat: {
    emoji: '👻',
    steps: [
      ['Snap Map → Ghost Mode', 'open the map → ⚙️ → Ghost Mode'],
      ['Contact me → My Friends', 'Settings → Privacy Controls'],
      ['View my story → My Friends', 'Settings → Privacy Controls'],
      ['Turn off “show me in Quick Add”', 'Settings → Privacy Controls'],
      ['Turn on two-factor authentication', 'Settings → Two-factor authentication'],
    ],
  },
  Google: {
    emoji: '🔎',
    steps: [
      ['Turn on 2-step verification', 'myaccount.google.com → Security'],
      ['Run the Security Checkup', 'myaccount.google.com/security-checkup'],
      ['Remove apps you don’t use from account access', 'Security → Your connections to third-party apps'],
      ['Check recovery phone & email are yours', 'Security → How you sign in'],
      ['Review Location / Timeline', 'Data & privacy → Location'],
    ],
  },
}

export function Privacy() {
  const apps = Object.keys(PRIVACY)
  const [app, setApp] = useState(apps[0])
  const [done, setDone] = useTool<Record<string, boolean>>('privacy', {})
  const steps = PRIVACY[app].steps
  const n = steps.filter(([s]) => done[`${app}:${s}`]).length
  return (
    <div className="stack">
      <Choice options={apps.map((a) => ({ value: a, label: `${PRIVACY[a].emoji} ${a}` }))} value={app} onChange={setApp} />
      <Meter value={n} max={steps.length} tone={n === steps.length ? 'ok' : 'warn'} />
      <ul className="check-steps">
        {steps.map(([s, how]) => {
          const k = `${app}:${s}`
          return (
            <li key={k}>
              <label className={done[k] ? 'on' : ''}>
                <input
                  type="checkbox"
                  checked={!!done[k]}
                  onChange={() => {
                    setDone({ ...done, [k]: !done[k] })
                    if (!done[k]) log('tool', { silent: true })
                  }}
                />
                <span className="box">{done[k] ? '✓' : ''}</span>
                <span>
                  <b>{s}</b>
                  <small>{how}</small>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      {n === steps.length && <Done emoji="🔏" title={`${app}: locked down.`} />}
    </div>
  )
}
