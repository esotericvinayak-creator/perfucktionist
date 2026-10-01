import { useEffect, useState, type CSSProperties } from 'react'
import { log } from '../lib/progress'
import { chime, unlockAudio } from '../lib/sound'

type Phase = { label: string; secs: number; size: 'big' | 'small'; hint?: string }
type Pattern = { id: string; name: string; tag: string; about: string; phases: Phase[] }

export const patterns: Pattern[] = [
  {
    id: 'box',
    name: 'Box breathing',
    tag: 'focus · exams · interviews',
    about: 'Used by athletes and soldiers to stay ice-cold under pressure. Four equal sides, like a box.',
    phases: [
      { label: 'breathe in', secs: 4, size: 'big' },
      { label: 'hold', secs: 4, size: 'big' },
      { label: 'breathe out', secs: 4, size: 'small' },
      { label: 'hold', secs: 4, size: 'small' },
    ],
  },
  {
    id: 'sigh',
    name: 'Physiological sigh',
    tag: 'instant calm · panic',
    about: 'The fastest way to calm down. A double inhale pops open your lungs, the long exhale flips your body into rest mode.',
    phases: [
      { label: 'inhale (nose)', secs: 2, size: 'big' },
      { label: 'sip a little more', secs: 1, size: 'big' },
      { label: 'long exhale (mouth)', secs: 6, size: 'small' },
    ],
  },
  {
    id: '478',
    name: '4 · 7 · 8',
    tag: 'sleep · anxiety',
    about: 'Long hold, longer exhale. Do 4 rounds in bed and see how far you get.',
    phases: [
      { label: 'breathe in', secs: 4, size: 'big' },
      { label: 'hold', secs: 7, size: 'big' },
      { label: 'whoosh out', secs: 8, size: 'small' },
    ],
  },
  {
    id: 'anulom',
    name: 'Anulom Vilom',
    tag: 'pranayama · balance',
    about: 'Alternate-nostril breathing. Right thumb closes the right nostril, ring finger closes the left.',
    phases: [
      { label: 'in · left nostril', secs: 4, size: 'big', hint: 'thumb closes right' },
      { label: 'hold', secs: 4, size: 'big', hint: 'both closed' },
      { label: 'out · right nostril', secs: 6, size: 'small', hint: 'finger closes left' },
      { label: 'in · right nostril', secs: 4, size: 'big', hint: 'finger closes left' },
      { label: 'hold', secs: 4, size: 'big', hint: 'both closed' },
      { label: 'out · left nostril', secs: 6, size: 'small', hint: 'thumb closes right' },
    ],
  },
  {
    id: 'bhramari',
    name: 'Bhramari',
    tag: 'humming bee · stress',
    about: 'Close your ears with your thumbs, eyes closed, and hum like a bee on the exhale. Feel your head buzz.',
    phases: [
      { label: 'breathe in', secs: 4, size: 'big' },
      { label: 'hmmmmm 🐝', secs: 8, size: 'small', hint: 'hum the whole exhale' },
    ],
  },
  {
    id: 'power',
    name: 'Power hold',
    tag: 'before a big move',
    about: 'Hold your breath, then let it go. Do 3 rounds right before the exam, the stage, the hard conversation.',
    phases: [
      { label: 'breathe in', secs: 4, size: 'big' },
      { label: 'HOLD 💪', secs: 8, size: 'big', hint: 'shoulders soft, face relaxed' },
      { label: 'let it go', secs: 8, size: 'small' },
    ],
  },
]

export function BreathOrb() {
  const [pattern, setPattern] = useState(patterns[0])
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [left, setLeft] = useState(pattern.phases[0].secs)
  const [sound, setSound] = useState(true)

  const phase = pattern.phases[step % pattern.phases.length]
  const rounds = Math.floor(step / pattern.phases.length)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running || left > 0) return
    const next = step + 1
    const nextPhase = pattern.phases[next % pattern.phases.length]
    setStep(next)
    setLeft(nextPhase.secs)
    if (next % pattern.phases.length === 0) log('breath')
    if (sound) chime(nextPhase.size === 'big')
  }, [left, running, step, pattern, sound])

  const start = () => {
    unlockAudio()
    setStep(0)
    setLeft(pattern.phases[0].secs)
    setRunning(true)
    if (sound) chime(true)
  }

  const choose = (p: Pattern) => {
    setPattern(p)
    setRunning(false)
    setStep(0)
    setLeft(p.phases[0].secs)
  }

  const size = !running ? 'idle' : phase.size
  return (
    <div className="breath">
      <div className="row gap-sm wrap filter-row" role="group" aria-label="Breathing pattern">
        {patterns.map((p) => (
          <button key={p.id} type="button" className={`chip${p.id === pattern.id ? ' on' : ''}`} onClick={() => choose(p)}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="breath-stage">
        <div className={`orb ${size}`} style={{ '--d': `${running ? phase.secs : 4}s` } as CSSProperties}>
          <div className="orb-ring r1" />
          <div className="orb-ring r2" />
          <div className="orb-core">
            {running ? (
              <>
                <span className="orb-label" aria-live="polite">
                  {phase.label}
                </span>
                <span className="orb-count">{left}</span>
                {phase.hint && <span className="orb-hint">{phase.hint}</span>}
              </>
            ) : (
              <span className="orb-label">ready when you are</span>
            )}
          </div>
        </div>
      </div>

      <div className="breath-info">
        <div>
          <span className="sticker sticker-sm a-violet">{pattern.tag}</span>
          <h3>{pattern.name}</h3>
          <p>{pattern.about}</p>
          <p className="breath-seq">{pattern.phases.map((p) => `${p.label} ${p.secs}s`).join('  →  ')}</p>
        </div>
        <div className="breath-controls">
          {running ? (
            <button type="button" className="btn btn-primary a-violet" onClick={() => setRunning(false)}>
              ■ stop · {rounds} {rounds === 1 ? 'round' : 'rounds'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary a-violet" onClick={start}>
              ▶ start breathing
            </button>
          )}
          <label className="toggle">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
            <span>soft chime on each phase</span>
          </label>
        </div>
      </div>
    </div>
  )
}
