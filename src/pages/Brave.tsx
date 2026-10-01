import { useEffect, useState } from 'react'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { PageHero, Section, TipGrid } from '../components/ui'
import { shlokaById } from '../data/shlokas'
import { confetti } from '../lib/confetti'
import { tone, unlockAudio } from '../lib/sound'
import { log } from '../lib/progress'
import { pick, useLocalState } from '../lib/storage'

const dares = [
  'Raise your hand and ask the question everyone else is too scared to ask.',
  'Say “no” to something today without explaining why.',
  'Apologise first in a fight you’ve been dragging.',
  'Try something you’ll definitely be bad at. Skateboarding, singing, chess — anything.',
  'Ask for help with something you’ve been pretending to understand.',
  'Introduce yourself to someone new.',
  'Tell someone how you actually feel. Not “I’m fine”. The real thing.',
  'Wear the outfit you’ve been saving for “someday”.',
  'Stand up for someone being teased — even just “bro, chill”.',
  'Eat alone at a café without your phone. Main character moment.',
  'Send the message you’ve been drafting for weeks.',
  'Tell your parents one thing you’ve been hiding. Start small.',
]

const icons = [
  { icon: '🏔️', title: 'Arunima Sinha', body: 'Lost her leg after being pushed from a moving train in 2011. Two years later she became the first female amputee to summit Mount Everest.' },
  { icon: '⛏️', title: 'Dashrath Manjhi', body: 'The “Mountain Man”. With just a hammer and chisel, he carved a road through a hill for 22 years so his village could reach a hospital.' },
  { icon: '🚀', title: 'Kalpana Chawla', body: 'From a small town in Karnal to space. The first woman of Indian origin to fly to space. Dream size: unlimited.' },
  { icon: '🥊', title: 'Mary Kom', body: 'Six-time world boxing champion and an Olympic medallist — after becoming a mom. People said stop. She said watch.' },
]

const fiveDs = [
  { icon: '🎭', title: 'Distract', body: 'Interrupt the moment. Ask the target for directions, “accidentally” spill something, start a random convo. Break the vibe.' },
  { icon: '📢', title: 'Delegate', body: 'Get help — a guard, a conductor, a teacher, another adult, or call 112. You don’t have to do it alone.' },
  { icon: '📹', title: 'Document', body: 'Record from a safe distance — but only if someone is already helping. Give the video to the person it happened to, never post it without them.' },
  { icon: '⏳', title: 'Delay', body: 'After it’s over, go to the person: “Are you okay? Can I sit with you? Do you want help reporting?” It matters more than you think.' },
  { icon: '🗣️', title: 'Direct', body: 'If it’s safe, speak up: “That’s not okay. Leave her alone.” Short, loud, don’t argue.' },
]

function LaunchButton() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    if (count === null) return
    if (count === 0) {
      tone(880, 0.6, 'square', 0.12)
      confetti()
      const t = setTimeout(() => setCount(null), 1800)
      return () => clearTimeout(t)
    }
    tone(440, 0.15, 'square', 0.08)
    const t = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return (
    <div className="card launch a-sun">
      <p className="launch-num" aria-live="assertive">
        {count === null ? '5' : count === 0 ? 'GO!' : count}
      </p>
      <p>
        Your brain needs about 5 seconds to talk you out of anything. So count backwards — <b>5, 4, 3, 2, 1</b> — and move before it can.
      </p>
      <button
        type="button"
        className="btn btn-primary a-sun"
        onClick={() => {
          unlockAudio()
          setCount(5)
        }}
        disabled={count !== null}
      >
        🚀 launch me
      </button>
    </div>
  )
}

function GoalSmasher() {
  const [goal, setGoal] = useLocalState('goal', '')
  const [steps, setSteps] = useLocalState<{ text: string; done: boolean }[]>('goal-steps', [])
  const [draft, setDraft] = useState('')
  const done = steps.filter((s) => s.done).length

  return (
    <div className="card goal a-sun">
      <label className="field">
        <span>the big scary goal</span>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="crack JEE, start a channel, run 5k, learn guitar…" maxLength={80} />
      </label>
      <form
        className="row gap-sm"
        onSubmit={(e) => {
          e.preventDefault()
          if (draft.trim()) setSteps([...steps, { text: draft.trim(), done: false }])
          setDraft('')
        }}
      >
        <input className="grow" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="a tiny step you can do this week" aria-label="Add a step" maxLength={80} />
        <button type="submit" className="btn btn-primary a-sun">
          + add
        </button>
      </form>
      {steps.length > 0 && (
        <>
          <div className="meter-bar">
            <div className="meter-fill" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <ul className="goal-steps">
            {steps.map((s, i) => (
              <li key={i} className={s.done ? 'done' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => {
                      const next = steps.map((x, j) => (j === i ? { ...x, done: !x.done } : x))
                      setSteps(next)
                      if (!s.done) log('checklist')
                      if (next.every((x) => x.done)) confetti()
                    }}
                  />
                  <span>{s.text}</span>
                </label>
                <button type="button" aria-label="Remove step" onClick={() => setSteps(steps.filter((_, j) => j !== i))}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="muted">Hold your breath. Do step one. Exhale. Repeat. Saved on this device only.</p>
    </div>
  )
}

export default function Brave() {
  const [dare, setDare] = useState<string | null>(null)
  const [didIt, setDidIt] = useState(false)
  return (
    <div className="page">
      <PageHero
        kicker="zone 08 · be brave"
        accent="sun"
        emoji="🦁"
        title={
          <>
            scared? good. <span className="serif">do it anyway.</span>
          </>
        }
        sub="Courage isn’t the absence of fear. It’s fear + action. Every brave person you admire was shaking too — they just didn’t let it drive."
      />

      <Section kicker="the 5-second rule" title={<>count down. <span className="serif">launch.</span></>}>
        <div className="two-col">
          <LaunchButton />
          <div className="card dare-card a-pink">
            <p className="kicker">today’s brave dare</p>
            <p className="dare-text" aria-live="polite">
              {dare ?? 'Small brave acts every day build the big brave you. Get your dare.'}
            </p>
            <div className="row gap-sm wrap">
              <button
                type="button"
                className="btn btn-primary a-pink"
                onClick={() => {
                  setDare(pick(dares, dare ?? undefined))
                  setDidIt(false)
                }}
              >
                {dare ? 'another one 🎲' : 'dare me 🎲'}
              </button>
              {dare && (
                <button
                  type="button"
                  className="btn"
                  disabled={didIt}
                  onClick={() => {
                    log('dare')
                    setDidIt(true)
                  }}
                >
                  {didIt ? 'legend ✓' : '✓ I did it'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>

      <Section kicker="achieve anything" title={<>smash a big goal into <span className="serif">tiny</span> ones</>} intro="Big goals are scary because they’re vague. Tiny steps aren’t. Write the goal, then the smallest possible next move.">
        <GoalSmasher />
      </Section>

      <Section kicker="when you see something wrong" title={<>the 5 D’s of being a <span className="serif">bystander</span></>} intro="Harassment happens in public because people freeze. You don’t have to be a hero. Pick one D.">
        <TipGrid tips={fiveDs} accent="sun" />
      </Section>

      <Section kicker="desi legends" title={<>they were scared <span className="serif">too</span></>}>
        <TipGrid tips={icons} accent="orange" />
      </Section>

      <Section kicker="fuel" title={<>rise, <span className="serif">warrior</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('gita-2-3')} accent="sun" />
          <ShlokaCard shloka={shlokaById('hitopadesha-udyamena')} accent="orange" />
        </div>
        <Voices theme="action" />
      </Section>
    </div>
  )
}
