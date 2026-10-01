import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { CallCard, Checklist, PageHero, Section, TipGrid } from '../components/ui'
import { helplines } from '../data/helplines'
import { shlokaById } from '../data/shlokas'
import { confetti } from '../lib/confetti'
import { log } from '../lib/progress'
import { todayKey, useLocalState } from '../lib/storage'

const code = [
  { icon: '🤝', title: 'Consent is the whole deal', body: 'No means no. Silence means no. Drunk means no. “Maybe” means no. Only an enthusiastic, sober YES is a yes — and it can be taken back anytime.' },
  { icon: '💧', title: 'Real men cry', body: 'Bottling it up isn’t strength, it’s a pressure cooker. Talk to a friend, your parents, or Tele-MANAS (14416). Feelings aren’t a weakness — ignoring them is.' },
  { icon: '🚫', title: 'Don’t forward. Don’t share.', body: 'Sharing someone’s private pics or videos is a crime under the IT Act — and a deeply sh*tty move. Got one in a group? Delete it and say why.' },
  { icon: '📣', title: 'Be the bro who steps in', body: 'Friend being creepy, catcalling, pushing a girl who said no? Call it out. Staying silent is co-signing.' },
  { icon: '🏋️', title: 'Discipline > motivation', body: 'Gym, sleep, study, prayer — show up even when you don’t feel like it. Motivation is a mood. Discipline is an identity.' },
  { icon: '🫶', title: 'Protect, don’t possess', body: 'Your sister, your girlfriend, your friend — none of them are your property. Respect her choices, her clothes, her phone, her “no”.' },
  { icon: '🧃', title: '“Nah, I’m good” is a full sentence', body: 'Drugs, vapes, betting apps, peer pressure — real friends don’t need you to prove anything. Walk away, no explanation needed.' },
  { icon: '🏠', title: 'Tell your parents first', body: 'Took a wrong turn? Debt, fight, scam, trouble? Tell them before someone else does. They’ve handled worse than you think.' },
  { icon: '👑', title: 'Respect every woman', body: 'Not just the ones related to you. The way you treat a stranger is who you really are.' },
]

const daily = [
  '20 push-ups 💪',
  'Drink 3 litres of water 💧',
  'Call or hug your mom / dad ❤️',
  '1 hour, no doom-scrolling 📵',
  'Read 10 pages 📖',
  'Give someone a genuine compliment 🫶',
  'Sleep before midnight 😴',
  '5 minutes of breathing 🫁',
]

export default function Bro() {
  const [state, setState] = useLocalState<{ day: string; done: Record<string, boolean> }>('bro-daily', { day: todayKey(), done: {} })
  const done = state.day === todayKey() ? state.done : {}
  const count = daily.filter((d) => done[d]).length

  const toggle = (item: string) => {
    const next = { ...done, [item]: !done[item] }
    setState({ day: todayKey(), done: next })
    if (next[item]) log('checklist')
    if (daily.every((d) => next[d])) confetti()
  }

  return (
    <div className="page">
      <PageHero
        kicker="zone 03 · bro code · for him"
        accent="cyan"
        emoji="🔱"
        title={
          <>
            strong is <span className="serif">respectful.</span> strong is soft too.
          </>
        }
        sub="Being a man isn’t about never being scared. It’s about being someone people feel safe around — including you."
      />

      <Section kicker="the code" title={<>9 rules. <span className="serif">no loopholes.</span></>}>
        <TipGrid accent="cyan" tips={code} />
      </Section>

      <Section kicker="resets every midnight" title={<>today’s <span className="serif">main character</span> checklist</>} intro="Small wins, every day. That’s the whole secret.">
        <div className="two-col">
          <Checklist items={daily} checked={done} onToggle={toggle} accent="cyan" />
          <div className="card meter a-cyan" aria-live="polite">
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${(count / daily.length) * 100}%` }} />
            </div>
            <p className="meter-score">
              {count}/{daily.length}
            </p>
            <h3>{count === daily.length ? 'Full send. Legend. 👑' : count >= 4 ? 'Halfway there, keep going 🔥' : 'Start with one. Any one. 🫡'}</h3>
            <p>Progress isn’t a straight line. Missed a day? Doesn’t matter. Show up tomorrow.</p>
          </div>
        </div>
      </Section>

      <Section kicker="warrior shlokas" title={<>what Krishna told <span className="serif">Arjuna</span></>} intro="Arjuna — the greatest warrior of his time — broke down before the war. Krishna didn’t tell him to stop feeling. He told him to rise.">
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('gita-2-3')} accent="cyan" />
          <ShlokaCard shloka={shlokaById('gita-6-5')} accent="violet" />
          <ShlokaCard shloka={shlokaById('katha-uttishthata')} accent="sun" />
          <ShlokaCard shloka={shlokaById('hitopadesha-udyamena')} accent="orange" />
          <ShlokaCard shloka={shlokaById('gita-2-14')} accent="lime" />
          <ShlokaCard shloka={shlokaById('yatra-naryastu')} accent="pink" />
        </div>
        <Voices theme="courage" intro="Not a Hindu thing, not a Muslim thing, not a Sikh thing — a human thing. Every book tells a scared young man the same: rise." />
        <Voices theme="women" />
        <div className="center-row">
          <a className="btn" href="#/library">
            open the sacred library →
          </a>
        </div>
      </Section>

      <Section kicker="talk to someone" title={<>heavy head? <span className="serif">call.</span></>}>
        <div className="call-grid">
          <CallCard line={helplines.mind} accent="cyan" big />
          <CallCard line={helplines.cyber} accent="sun" />
          <CallCard line={helplines.emergency} accent="pink" />
        </div>
      </Section>
    </div>
  )
}
