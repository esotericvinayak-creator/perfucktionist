import { useEffect, useRef, useState } from 'react'
import { shareCard } from '../components/Overlays'
import { log } from '../lib/progress'
import { startSiren, unlockAudio } from '../lib/sound'
import { Card, Choice, Done, Meter, Text, mmss, useCountdown, useTool } from './kit'
import { ToolChips } from './links'

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

// ─── Password check (Have I Been Pwned, k-anonymity) ──────────
async function sha1(s: string) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function strength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (p.length >= 16) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (/(password|1234|qwerty|abcd|iloveyou|india|admin|0000)/i.test(p) || /(19|20)\d\d$/.test(p)) s -= 2
  return Math.max(0, Math.min(5, s))
}

export function Password() {
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [result, setResult] = useState<{ count: number } | 'error' | 'loading' | null>(null)
  const s = strength(pw)
  const label = ['very weak', 'weak', 'okay', 'good', 'strong', 'very strong'][s]
  const check = async () => {
    setResult('loading')
    try {
      const h = await sha1(pw)
      const res = await fetch(`https://api.pwnedpasswords.com/range/${h.slice(0, 5)}`, { headers: { 'Add-Padding': 'true' } })
      const text = await res.text()
      const line = text.split('\n').find((l) => l.startsWith(h.slice(5)))
      setResult({ count: line ? Number(line.split(':')[1]) : 0 })
      log('tool')
    } catch {
      setResult('error')
    }
  }
  return (
    <div className="stack">
      <div className="row gap-sm">
        <input
          className="grow"
          type={show ? 'text' : 'password'}
          value={pw}
          onChange={(e) => {
            setPw(e.target.value)
            setResult(null)
          }}
          placeholder="type a password to test"
          autoComplete="off"
          aria-label="Password"
        />
        <button type="button" className="btn btn-sm" onClick={() => setShow(!show)}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {pw && (
        <>
          <Meter value={s} max={5} tone={s <= 1 ? 'bad' : s <= 3 ? 'warn' : 'ok'} />
          <p className="muted">strength: {label}</p>
          <button type="button" className="btn btn-primary a-pink" onClick={check} disabled={result === 'loading'}>
            {result === 'loading' ? 'checking…' : '🔍 has it been leaked?'}
          </button>
        </>
      )}
      {result && typeof result === 'object' && (
        <div className={`verdict ${result.count ? 'bad' : 'ok'}`}>
          <b>{result.count ? `seen ${result.count.toLocaleString('en-IN')} times` : 'not found in known leaks'}</b>
          <span>{result.count ? 'in real data breaches. change it everywhere you use it.' : 'nice. still: one password per app.'}</span>
        </div>
      )}
      {result === 'error' && <p className="error-text">Couldn’t reach the breach database. Try again.</p>}
      <Card className="soft">
        🔒 Your password never leaves this device — only the first 5 characters of its SHA-1 hash are sent (k-anonymity, via Have I Been Pwned). Best setup: long passphrase + password manager + 2-step verification.
      </Card>
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

// ─── Relationship check ───────────────────────────────────────
const RQ: [string, number][] = [
  ['Checks your phone or demands your passwords', 1],
  ['Gets angry when you see your friends or family', 1],
  ['Tells you what to wear or who to talk to', 1],
  ['You feel scared to say no to them', 2],
  ['Pressures you for pics or sex', 2],
  ['Threatens to hurt you, themselves, or leak things if you leave', 3],
  ['Puts you down, then says “just joking”', 1],
  ['Blames you for their moods or anger', 1],
  ['Tracks your location without asking', 1],
  ['Uses silent treatment to punish you', 1],
  ['Makes you feel “crazy” or “too much” for reacting', 1],
  ['Has pushed, grabbed, slapped or hit you', 3],
]

export function RedFlags() {
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [serious, setSerious] = useState(false)
  const answer = (yes: boolean) => {
    if (yes) {
      setScore(score + RQ[i][1])
      if (RQ[i][1] >= 3) setSerious(true)
    }
    setI(i + 1)
  }
  if (i < RQ.length)
    return (
      <div className="stack center-stack">
        <p className="kicker">
          {i + 1} / {RQ.length} · does your partner…
        </p>
        <p className="big-q">{RQ[i][0]}</p>
        <div className="row gap-sm">
          <button type="button" className="btn big-cta" onClick={() => answer(false)}>
            no
          </button>
          <button type="button" className="btn btn-primary a-pink big-cta" onClick={() => answer(true)}>
            yes / sometimes
          </button>
        </div>
      </div>
    )
  const level = serious || score >= 5 ? 'bad' : score >= 2 ? 'warn' : 'ok'
  return (
    <div className="stack">
      <div className={`verdict ${level}`}>
        <b>{level === 'ok' ? '💚 mostly healthy' : level === 'warn' ? '🟠 some red flags' : '🔴 this is not okay'}</b>
        <span>{level === 'ok' ? 'keep talking openly. healthy love feels safe.' : level === 'warn' ? 'talk about it. if it doesn’t change, that’s your answer.' : 'control, threats and violence are abuse — not love. it is not your fault.'}</span>
      </div>
      {level !== 'ok' && (
        <Card className="soft">
          <p className="kicker">talk to someone</p>
          <div className="row gap-sm wrap">
            <a className="btn btn-sm btn-primary a-pink" href="tel:181">
              181 women helpline
            </a>
            <a className="btn btn-sm" href="tel:1091">
              1091 police
            </a>
            <a className="btn btn-sm" href="tel:14416">
              14416 Tele-MANAS
            </a>
          </div>
        </Card>
      )}
      <ToolChips ids={['boundaries', 'safe-walk']} />
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => {
          setI(0)
          setScore(0)
          setSerious(false)
        }}
      >
        retake
      </button>
    </div>
  )
}
