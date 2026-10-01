import { useState } from 'react'
import { PlusBadge, PlusWall } from '../components/Overlays'
import { WisdomCard } from '../components/Voices'
import { PageHero, Section } from '../components/ui'
import { FREE_DAYS, journeys, type Journey } from '../data/journeys'
import { wisdom } from '../data/wisdom'
import { confetti } from '../lib/confetti'
import { journeyComplete, update, useProgress } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { todayKey } from '../lib/storage'

type DayState = 'done' | 'today' | 'tomorrow' | 'locked' | 'plus'

function dayStates(j: Journey, done: Record<number, string>, plus: boolean): DayState[] {
  const today = todayKey()
  return j.days.map((_, i) => {
    const d = i + 1
    if (done[d]) return 'done'
    if (d > FREE_DAYS && !plus) return 'plus'
    if (d === 1) return 'today'
    const prev = done[d - 1]
    if (!prev) return 'locked'
    // One day at a time — tomorrow's step unlocks tomorrow. That's how habits stick.
    return prev < today ? 'today' : 'tomorrow'
  })
}

function JourneyView({ j, onBack }: { j: Journey; onBack: () => void }) {
  const progress = useProgress()
  const plus = usePlus()
  const done = progress.journeys[j.id]?.done ?? {}
  const states = dayStates(j, done, plus.active)
  const count = Object.keys(done).length

  return (
    <div className={`journey-view a-${j.accent}`}>
      <button type="button" className="btn btn-sm" onClick={onBack}>
        ← all journeys
      </button>
      <div className="journey-head">
        <span className="journey-emoji">{j.emoji}</span>
        <div>
          <h2>{j.title}</h2>
          <p>{j.pitch}</p>
        </div>
      </div>
      <div className="meter-bar">
        <div className="meter-fill" style={{ width: `${(count / j.days.length) * 100}%` }} />
      </div>
      <p className="muted">
        {count}/{j.days.length} days · one step unlocks each day
      </p>

      <ol className="timeline">
        {j.days.map((day, i) => {
          const d = i + 1
          const st = states[i]
          const w = day.wisdomId ? wisdom.find((x) => x.id === day.wisdomId) : undefined
          return (
            <li key={d} className={`tl tl-${st}`}>
              <span className="tl-dot">{st === 'done' ? '✓' : d}</span>
              <div className="tl-body">
                <p className="tl-title">
                  Day {d} · {day.title} {st === 'plus' && <PlusBadge small />}
                </p>
                {st === 'today' && (
                  <div className="tl-task">
                    <p>{day.task}</p>
                    {w && <WisdomCard w={w} />}
                    <div className="row gap-sm wrap">
                      {day.path && (
                        <a className="btn btn-sm" href={`#${day.path}`}>
                          go do it →
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={(e) => {
                          journeyComplete(j.id, d)
                          const r = e.currentTarget.getBoundingClientRect()
                          confetti(r.left + r.width / 2, r.top)
                        }}
                      >
                        ✓ done · +40 XP
                      </button>
                    </div>
                  </div>
                )}
                {st === 'done' && <p className="muted">{day.task}</p>}
                {st === 'tomorrow' && <p className="muted">Unlocks tomorrow. Rest is part of it. 🌙</p>}
                {st === 'locked' && <p className="muted">Finish the day before first.</p>}
              </div>
            </li>
          )
        })}
      </ol>
      {!plus.active && j.days.length > FREE_DAYS && <PlusWall title={`Unlock all ${j.days.length} days`}>Days 1–{FREE_DAYS} of every journey are free. Plus unlocks every day of every journey.</PlusWall>}
      {count > 0 && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => confirm('Restart this journey from day 1?') && update((p) => ({ journeys: { ...p.journeys, [j.id]: { startedAt: todayKey(), done: {} } } }))}>
          ↺ restart journey
        </button>
      )}
    </div>
  )
}

export default function Journeys() {
  const progress = useProgress()
  const [open, setOpen] = useState<string | null>(null)
  const current = journeys.find((j) => j.id === open)

  return (
    <div className="page">
      <PageHero
        kicker="glow-up mode · journeys"
        accent="violet"
        emoji="🧭"
        title={
          <>
            small steps. <span className="serif">every day.</span>
          </>
        }
        sub="Guided programs that take 5 minutes a day. One step unlocks each day — because real change is boring and daily, not perfect and once."
      />
      {current ? (
        <div className="section">
          <JourneyView j={current} onBack={() => setOpen(null)} />
        </div>
      ) : (
        <Section kicker={`${journeys.length} journeys`} title={<>pick your <span className="serif">path</span></>}>
          <div className="grid">
            {journeys.map((j) => {
              const n = Object.keys(progress.journeys[j.id]?.done ?? {}).length
              return (
                <button key={j.id} type="button" className={`card journey-card a-${j.accent}`} onClick={() => setOpen(j.id)}>
                  <span className="journey-emoji">{j.emoji}</span>
                  <h3>{j.title}</h3>
                  <p>{j.pitch}</p>
                  <div className="meter-bar">
                    <div className="meter-fill" style={{ width: `${(n / j.days.length) * 100}%` }} />
                  </div>
                  <span className="muted">
                    {n ? `${n}/${j.days.length} days done` : `${j.days.length} days · first ${FREE_DAYS} free`}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
