// Kanak (कनक) — gold. A premium section that turns everything you've logged in the app into
// patterns about you: what actually lifts your mood, your Kanak score, a golden plan for the week,
// and a cinematic story of your month you can post. Locked behind Plus or an access code (src/lib/kanak.ts).
import { useEffect, useMemo, useState } from 'react'
import { shareCard } from '../components/Overlays'
import { confetti } from '../lib/confetti'
import { useKanak } from '../lib/kanak'
import { buildReport, type KanakReport } from '../lib/kanakInsights'
import { PRICES } from '../lib/plus'
import { log, useProgress } from '../lib/progress'

const fmtH = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`)

/** Three concrete things to try this week, picked from your strongest patterns. */
function goldenPlan(r: KanakReport) {
  const plan: string[] = []
  for (const i of r.insights) {
    if (i.lift <= 0) continue
    if (i.id === 'sleep') plan.push('Sleep 7h+ on at least 4 nights. Set a bedtime in Sleep → Wind-down.')
    if (i.id === 'screen') plan.push('Keep screen time under 3 hours on 3 days. Phone-down mode helps.')
    if (i.id === 'focus') plan.push('Do one 25-minute focus round a day, first thing.')
    if (i.id === 'move') plan.push('Move for 7 minutes on 4 days. Even a walk counts.')
    if (i.id === 'show') plan.push('Do your 5 minutes every day. Missing one is fine; missing two isn’t the plan.')
  }
  if (r.bestWeekday) plan.push(`Put your hardest task on a ${r.bestWeekday}: that’s when you’re usually at your best.`)
  if (plan.length < 3) plan.push('Check in every evening this week so next week’s gold is sharper.')
  return plan.slice(0, 3)
}

function Ring({ value }: { value: number }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200)
      setShown(Math.round(value * (1 - (1 - k) ** 3)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  const c = 2 * Math.PI * 52
  return (
    <div className="kn-ring" role="img" aria-label={`Kanak score ${value} out of 100`}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" className="kn-ring-bg" />
        <circle cx="60" cy="60" r="52" className="kn-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} />
      </svg>
      <b>{shown}</b>
      <small>kanak score</small>
    </div>
  )
}

// ─── the story: full-screen slides of your month, like a Wrapped ───
type Slide = { kicker: string; big: string; line: string }

function slidesFor(r: KanakReport, name: string): Slide[] {
  const s: Slide[] = [{ kicker: 'kanak · your month in gold', big: `${name || 'you'}.`, line: 'Not perfect. Something better: consistent. Let’s look.' }]
  s.push({ kicker: 'you showed up', big: `${r.days30} / 30`, line: r.days30 >= 20 ? 'Days you showed up. That’s rare. Most people quit in week one.' : 'Days you showed up. Every one of them counts.' })
  if (r.bestStreak > 1) s.push({ kicker: 'longest run', big: `🔥 ${r.bestStreak}`, line: 'Days in a row. Proof you can.' })
  if (r.insights[0]) s.push({ kicker: 'your biggest pattern', big: r.insights[0].emoji, line: `${r.insights[0].title}. ${r.insights[0].detail}` })
  if (r.bestWeekday) s.push({ kicker: 'your golden day', big: r.bestWeekday, line: 'Your mood is usually highest on this day. Plan big things for it.' })
  if (r.focusHours >= 1) s.push({ kicker: 'deep work', big: `${r.focusHours.toFixed(1)}h`, line: 'Focused time in the last 30 days.' })
  if (r.sleepAvg) s.push({ kicker: 'sleep, last 2 weeks', big: `${r.sleepAvg.toFixed(1)}h`, line: r.sleepAvg >= 7 ? 'A night. Your body says thanks.' : 'A night. Thirty more minutes would show.' })
  if (r.topWords.length) s.push({ kicker: 'what you wrote about most', big: r.topWords[0], line: r.topWords.slice(1).length ? `then: ${r.topWords.slice(1).join(', ')}` : 'Your own words, from your journal.' })
  s.push({ kicker: 'your kanak score', big: String(r.score), line: r.scoreParts.map((p) => `${p.label} ${p.value}`).join(' · ') })
  return s
}

function Story({ r, name, onClose }: { r: KanakReport; name: string; onClose: () => void }) {
  const slides = useMemo(() => slidesFor(r, name), [r, name])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((x) => Math.min(slides.length - 1, x + 1))
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', key)
    }
  }, [slides.length, onClose])
  useEffect(() => {
    if (paused || i >= slides.length - 1) return
    const t = setTimeout(() => setI(i + 1), 4500)
    return () => clearTimeout(t)
  }, [i, paused, slides.length])
  useEffect(() => {
    if (i === slides.length - 1) confetti(window.innerWidth / 2, window.innerHeight / 3, 120)
  }, [i, slides.length])
  const sl = slides[i]
  const last = i === slides.length - 1
  return (
    <div className="kn-story" role="dialog" aria-modal="true" aria-label="Your Kanak story">
      <div className="kn-bars">
        {slides.map((_, j) => (
          <span key={j} className={j < i ? 'past' : j === i ? (paused ? 'now paused' : 'now') : ''} />
        ))}
      </div>
      <button type="button" className="kn-x" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <button type="button" className="kn-tap left" aria-label="Previous" onClick={() => setI(Math.max(0, i - 1))} />
      <button type="button" className="kn-tap right" aria-label={last ? 'Hold to pause' : 'Next'} onClick={() => setI(Math.min(slides.length - 1, i + 1))} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)} />
      <div className="kn-slide" key={i}>
        <small>{sl.kicker}</small>
        <b>{sl.big}</b>
        <p>{sl.line}</p>
        {r.sample && <em>sample data</em>}
      </div>
      {last && (
        <div className="kn-story-foot">
          <button
            type="button"
            className="btn kn-btn"
            onClick={() =>
              shareCard({ kicker: 'my kanak · कनक', hero: `${r.score}`, text: r.insights[0] ? `${r.insights[0].title}.` : `showed up ${r.days30} of 30 days.`, footer: r.scoreParts.map((p) => `${p.label} ${p.value}`).join(' · ') })
            }
          >
            ↗ share my gold
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setI(0)}>
            watch again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── locked ───
function Locked({ onRedeem }: { onRedeem: (code: string) => boolean }) {
  const [code, setCode] = useState('')
  const [bad, setBad] = useState(false)
  return (
    <div className="kn-locked">
      <div className="kn-tease" aria-hidden="true">
        <div className="kn-card blur">
          <small>your biggest pattern</small>
          <b>Sleep is your superpower</b>
          <p>After 7h+ your mood averages 4.1/5. After less, 2.9.</p>
        </div>
        <div className="kn-card blur">
          <small>your golden day</small>
          <b>Thursday</b>
        </div>
        <span className="kn-lock">🔒</span>
      </div>
      <ul className="kn-perks">
        <li>
          <b>✨ Gold insights</b> what actually lifts your mood, from your own check-ins, sleep, screen time and focus.
        </li>
        <li>
          <b>🏅 Kanak score</b> one number for how you’re really doing, with every part shown.
        </li>
        <li>
          <b>🗺️ Golden plan</b> three things to try this week, picked from your patterns.
        </li>
        <li>
          <b>🎬 Your gold story</b> a full-screen recap of your month, made for posting.
        </li>
      </ul>
      <a className="btn kn-btn big-cta" href="#/plus">
        unlock with Plus · ₹{Math.round(PRICES.yearly / 12)}/month
      </a>
      <form
        className="kn-code"
        onSubmit={(e) => {
          e.preventDefault()
          const ok = onRedeem(code)
          setBad(!ok)
          if (ok) setCode('')
        }}
      >
        <label htmlFor="kn-code">have an access code?</label>
        <div className="row gap-sm">
          <input id="kn-code" value={code} onChange={(e) => (setCode(e.target.value), setBad(false))} placeholder="enter code" autoCapitalize="characters" autoComplete="off" maxLength={24} />
          <button type="submit" className="btn" disabled={!code.trim()}>
            unlock
          </button>
        </div>
        {bad && (
          <p className="kn-bad" role="alert">
            That code doesn’t work. Check the spelling.
          </p>
        )}
      </form>
    </div>
  )
}

export default function Kanak() {
  const p = useProgress()
  const kanak = useKanak()
  const real = useMemo(() => buildReport(p), [p])
  const thin = real.insights.length === 0 && real.checkins < 6
  const [sample, setSample] = useState(false)
  const r = useMemo(() => (sample ? buildReport(p, true) : real), [sample, p, real])
  const [story, setStory] = useState(false)
  const plan = goldenPlan(r)

  return (
    <div className="page kanak">
      <header className="kn-hero">
        <span className="kn-badge">कनक · KANAK</span>
        <h1>
          your life, <span className="serif">in gold.</span>
        </h1>
        <p>Everything you log in the app, turned into patterns about you. Worked out on your phone, never uploaded.</p>
      </header>

      {!kanak.unlocked ? (
        <Locked
          onRedeem={(c) => {
            const ok = kanak.redeem(c)
            if (ok) {
              confetti(window.innerWidth / 2, window.innerHeight / 3, 160)
              log('tool', { silent: true })
            }
            return ok
          }}
        />
      ) : (
        <>
          <p className="kn-via">{kanak.via === 'plus' ? '✦ unlocked with Plus' : '🔑 unlocked with an access code'}</p>

          {thin && (
            <div className="kn-card kn-gaps">
              <b>Your gold needs a little more to work with.</b>
              <p>Insights appear once you have a few days on each side to compare. Add:</p>
              <div className="row gap-sm wrap">
                {real.gaps.map((g) => (
                  <a key={g.id} className="chip" href={`#${g.path}`}>
                    {g.emoji} {g.need}
                  </a>
                ))}
              </div>
              <button type="button" className="linkish" onClick={() => setSample(!sample)}>
                {sample ? 'back to my data' : 'preview with sample data'}
              </button>
            </div>
          )}
          {sample && <p className="kn-sample">showing sample data, not yours</p>}

          <section className="kn-top">
            <Ring value={r.score} />
            <div className="kn-parts">
              {r.scoreParts.map((x) => (
                <div key={x.label}>
                  <span>{x.label}</span>
                  <i>
                    <em style={{ width: `${x.value}%` }} />
                  </i>
                  <b>{x.value}</b>
                </div>
              ))}
            </div>
          </section>

          <button type="button" className="btn kn-btn big-cta" onClick={() => (setStory(true), log('tool', { silent: true }))}>
            ▶ play my gold story
          </button>

          <section className="kn-sec">
            <p className="kicker">gold insights</p>
            {r.insights.length ? (
              <div className="kn-list">
                {r.insights.map((x) => (
                  <div key={x.id} className="kn-card">
                    <span className="kn-emoji">{x.emoji}</span>
                    <div>
                      <b>{x.title}</b>
                      <p>{x.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No strong patterns yet. That’s an answer too: keep logging and they’ll show.</p>
            )}
          </section>

          <section className="kn-sec">
            <p className="kicker">your numbers</p>
            <div className="kn-stats">
              <div>
                <b>{r.days30}/30</b>
                <span>days showed up</span>
              </div>
              <div>
                <b>🔥 {r.bestStreak}</b>
                <span>best streak</span>
              </div>
              <div>
                <b>{r.moodAvg ? r.moodAvg.toFixed(1) : '–'}</b>
                <span>
                  average mood{r.moodTrend !== null && Math.abs(r.moodTrend) >= 0.2 ? (r.moodTrend > 0 ? ' · rising' : ' · dipping') : ''}
                </span>
              </div>
              <div>
                <b>{r.bestWeekday ?? '–'}</b>
                <span>your golden day</span>
              </div>
              <div>
                <b>{r.sleepAvg ? `${r.sleepAvg.toFixed(1)}h` : '–'}</b>
                <span>sleep, 2 weeks</span>
              </div>
              <div>
                <b>{r.screenAvg ? fmtH(r.screenAvg) : '–'}</b>
                <span>screen a day</span>
              </div>
              <div>
                <b>{r.focusHours ? `${r.focusHours.toFixed(1)}h` : '–'}</b>
                <span>deep work, 30 days</span>
              </div>
              <div>
                <b>{r.words.toLocaleString('en-IN')}</b>
                <span>words written</span>
              </div>
            </div>
            {r.topSpend && (
              <p className="muted">
                This month most of your money went to <b>{r.topSpend.cat}</b> (₹{Math.round(r.topSpend.amt).toLocaleString('en-IN')}).
              </p>
            )}
          </section>

          <section className="kn-sec">
            <p className="kicker">your golden plan · this week</p>
            <ol className="kn-plan">
              {plan.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </section>

          {kanak.via === 'code' && (
            <button type="button" className="linkish muted kn-lockagain" onClick={() => confirm('Remove the access code from this device?') && kanak.lock()}>
              remove access code
            </button>
          )}
        </>
      )}

      {story && <Story r={r} name={p.name} onClose={() => setStory(false)} />}
    </div>
  )
}
