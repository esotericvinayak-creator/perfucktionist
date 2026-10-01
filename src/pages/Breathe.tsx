import { useEffect, useState } from 'react'
import { BreathOrb } from '../components/BreathOrb'
import { ShlokaCard } from '../components/ShlokaCard'
import { Callout, PageHero, Section, TipGrid } from '../components/ui'
import { shlokaById } from '../data/shlokas'
import { log } from '../lib/progress'
import { bell, unlockAudio } from '../lib/sound'

function MeditationTimer() {
  const [mins, setMins] = useState(5)
  const [left, setLeft] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (left === null || paused) return
    if (left <= 0) {
      log('breath')
      bell()
      setTimeout(bell, 1800)
      setLeft(null)
      return
    }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left, paused])

  const begin = () => {
    unlockAudio()
    bell()
    setPaused(false)
    setLeft(mins * 60)
  }

  const running = left !== null
  const shown = running ? left : mins * 60
  return (
    <div className="card timer a-violet">
      <p className="timer-digits" aria-live="off">
        {String(Math.floor(shown / 60)).padStart(2, '0')}:{String(shown % 60).padStart(2, '0')}
      </p>
      {!running && (
        <div className="row gap-sm wrap center" role="group" aria-label="Minutes">
          {[2, 5, 10, 15, 20].map((m) => (
            <button key={m} type="button" className={`chip${mins === m ? ' on' : ''}`} onClick={() => setMins(m)}>
              {m} min
            </button>
          ))}
        </div>
      )}
      <div className="row gap-sm center">
        {running ? (
          <>
            <button type="button" className="btn btn-primary a-violet" onClick={() => setPaused(!paused)}>
              {paused ? '▶ resume' : '❚❚ pause'}
            </button>
            <button type="button" className="btn" onClick={() => setLeft(null)}>
              end
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary a-violet" onClick={begin}>
            🔔 begin sitting
          </button>
        )}
      </div>
      <p className="timer-note">A bell rings at the start and the end. Close your eyes in between.</p>
    </div>
  )
}

const starter = [
  ['Sit like a king or queen.', 'Floor, chair, bed — anywhere. Spine tall, shoulders soft, hands on your knees.'],
  ['Close your eyes.', 'Or soften your gaze at the floor a metre ahead.'],
  ['Breathe normally.', 'Don’t control it. Just notice the air going in cool and coming out warm.'],
  ['Count 1 to 10.', 'One count per exhale. Lost count? Start again at 1. Totally fine.'],
  ['Your mind WILL wander.', 'Notice it, smile, come back to the breath. That coming-back is the actual workout.'],
  ['End with 3 deep breaths.', 'Then a small smile. Seriously — try it. You just meditated.'],
]

export default function Breathe() {
  return (
    <div className="page">
      <PageHero
        kicker="zone 05 · breathe"
        accent="violet"
        emoji="🫁"
        title={
          <>
            hold your breath. <span className="serif">then let it go.</span>
          </>
        }
        sub="Want to achieve anything in life? It starts with the next breath. Your breath is the only remote control for your nervous system you carry 24×7."
      />

      <Section kicker="guided" title={<>breathe <span className="serif">with</span> the orb</>} intro="Pick a pattern. Follow the circle — grow on the inhale, shrink on the exhale.">
        <BreathOrb />
        <Callout accent="violet" icon="🫶">
          Feeling dizzy or light-headed? Stop and breathe normally. Never practise breath-holds while driving, in water, or if you’re pregnant or have a heart condition without asking a doctor.
        </Callout>
      </Section>

      <Section kicker="first time?" title={<>meditate in <span className="serif">5 minutes</span></>}>
        <div className="two-col">
          <ol className="steps">
            {starter.map(([b, s]) => (
              <li key={b}>
                <strong>{b}</strong> {s}
              </li>
            ))}
          </ol>
          <MeditationTimer />
        </div>
      </Section>

      <Section kicker="more ways in" title={<>meditation isn’t <span className="serif">one thing</span></>}>
        <TipGrid
          accent="violet"
          tips={[
            { icon: '🖐️', title: '5-4-3-2-1 grounding', body: 'Panic attack? Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It drags your brain back to now.' },
            { icon: '🧘', title: 'Body scan', body: 'Lie down. Slowly move your attention from your toes to your head, relaxing each part. The best sleep hack nobody uses.' },
            { icon: '🕯️', title: 'Trataka', body: 'Gaze at a candle flame without blinking for as long as is comfortable, then close your eyes and watch the after-image. Builds insane focus.' },
            { icon: '🕉️', title: 'Om chanting', body: 'Breathe in deep, chant “Aaa-uuu-mmm” on the whole exhale. Feel the vibration move from belly to chest to head. 11 rounds.' },
            { icon: '🚶', title: 'Walking meditation', body: 'Walk slowly. Feel each foot lift, move, land. No phone. Ten minutes in a park beats an hour of scrolling.' },
            { icon: '📓', title: 'Brain dump', body: 'Mind won’t shut up? Write everything in it for 5 minutes, no editing. Then meditate. Paper holds what your head can’t.' },
          ]}
        />
      </Section>

      <Section kicker="ancient instructions" title={<>the original <span className="serif">mindfulness</span> manual</>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('gita-6-35')} accent="violet" />
          <ShlokaCard shloka={shlokaById('yoga-sutra-1-2')} accent="cyan" />
        </div>
      </Section>
    </div>
  )
}
