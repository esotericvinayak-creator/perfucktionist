import { useState } from 'react'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { Checklist, PageHero, Section, TipGrid } from '../components/ui'
import { shlokaById } from '../data/shlokas'
import { log } from '../lib/progress'
import { pick } from '../lib/storage'

const signs = [
  'I redo things that were already fine',
  'I don’t start because I can’t do it perfectly',
  'One mistake ruins my whole day',
  'I reread texts 5 times before sending',
  'I compare myself to people online a lot',
  'Compliments feel fake, criticism feels true',
  'I feel guilty when I rest',
  'I’d rather not try than try and fail',
]

const verdicts = [
  { max: 1, title: 'Chill human 😌', body: 'You’re already pretty free. Keep protecting that peace.' },
  { max: 3, title: 'Lowkey perfectionist 👀', body: 'A few habits are holding you back. Pick one rule below and try it this week.' },
  { max: 5, title: 'Certified perfectionist 😵‍💫', body: 'Your standards are running you, not the other way round. Time to unlearn — gently.' },
  { max: 8, title: 'Final boss perfectionist 🫠', body: 'You’ve been carrying way too much. Breathe. You are enough before you achieve anything.' },
]

const rules = [
  { n: '01', title: 'The 70% rule', body: 'If it’s 70% good, ship it. Feedback finishes the other 30. Perfect work that never ships helps nobody.' },
  { n: '02', title: 'Ugly first draft', body: 'Every masterpiece started as a mess. Give yourself permission to make the trash version first.' },
  { n: '03', title: 'Two-minute start', body: 'Can’t start? Promise yourself just 2 minutes. Momentum beats motivation every single time.' },
  { n: '04', title: 'Compare = despair', body: 'You’re comparing your behind-the-scenes to their highlight reel. Unfollow what makes you feel small.' },
  { n: '05', title: 'Mistakes are data', body: 'A mistake isn’t a verdict on your worth. It’s just information for the next attempt.' },
  { n: '06', title: 'Rest isn’t a reward', body: 'You don’t have to finish everything to deserve rest. Sleep is part of the work.' },
  { n: '07', title: 'Bestie voice only', body: 'Would you say that to your best friend? No? Then don’t say it to yourself.' },
  { n: '08', title: 'Good enough is a skill', body: 'Knowing when to stop is a superpower. Not everything deserves 100%. Choose where your 100% goes.' },
]

const flips = [
  ['I’m not good enough.', 'I’m still learning — that’s literally the point.'],
  ['Everyone will judge me.', 'Most people are too busy worrying about themselves.'],
  ['If it’s not perfect, it’s a failure.', 'If it exists, it beats the perfect thing that doesn’t.'],
  ['I should be further by now.', 'There’s no deadline on becoming yourself.'],
  ['I messed up, I’m so stupid.', 'I messed up. I’m human. What did I learn?'],
  ['They’re so much better than me.', 'They’re on chapter 20. I’m on chapter 3. Different books.'],
]

const dares = [
  'Post a pic with zero filters and zero retakes.',
  'Send a text without rereading it. Just hit send.',
  'Sing loudly and badly. In the shower counts.',
  'Submit something at 80% today.',
  'Ask a “dumb” question in class or at work.',
  'Wear the outfit you think is “too much”.',
  'Draw your best friend in 30 seconds and send it to them.',
  'Laugh out loud at your own mistake.',
  'Say “I don’t know” without apologising.',
  'Leave one thing unfinished on purpose today.',
  'Dance for one full song. Badly. Proudly.',
  'Tell someone a thing you’re bad at.',
]

export default function Unperfect() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [dare, setDare] = useState<string | null>(null)
  const [didIt, setDidIt] = useState(false)
  const score = Object.values(checked).filter(Boolean).length
  const verdict = verdicts.find((v) => score <= v.max) ?? verdicts[verdicts.length - 1]

  return (
    <div className="page">
      <PageHero
        kicker="zone 01 · unlearn perfect"
        accent="lime"
        emoji="🫠"
        title={
          <>
            how to stop giving a <span className="hl">f*ck</span> about <span className="serif">perfect</span>
          </>
        }
        sub="Perfectionism isn’t high standards. It’s fear wearing a nice outfit. Here’s how to take it off."
      />

      <Section kicker="quiz" title={<>the perfection-o-<span className="serif">meter</span></>} intro="Tick whatever sounds like you. Be honest — nobody’s watching.">
        <div className="two-col">
          <Checklist items={signs} checked={checked} onToggle={(s) => setChecked((c) => ({ ...c, [s]: !c[s] }))} />
          <div className="card meter a-lime" aria-live="polite">
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${(score / signs.length) * 100}%` }} />
            </div>
            <p className="meter-score">
              {score}/{signs.length}
            </p>
            <h3>{verdict.title}</h3>
            <p>{verdict.body}</p>
          </div>
        </div>
      </Section>

      <Section kicker="the rules" title={<>8 rules to <span className="serif">unlearn</span> perfect</>}>
        <TipGrid accent="lime" tips={rules.map((r) => ({ icon: r.n, title: r.title, body: r.body }))} />
      </Section>

      <Section kicker="tap to flip" title={<>mute the inner <span className="serif">critic</span></>} intro="Tap a mean thought to hear what your bestie would say instead.">
        <div className="grid flip-grid">
          {flips.map(([mean, kind], i) => (
            <button key={i} type="button" className={`flip${flipped[i] ? ' flipped' : ''}`} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))} aria-pressed={!!flipped[i]}>
              <span className="flip-inner">
                <span className="flip-face front">
                  <small>inner critic 👎</small>“{mean}”
                </span>
                <span className="flip-face back">
                  <small>bestie voice 💚</small>“{kind}”
                </span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section kicker="daily dare" title={<>do one <span className="serif">imperfect</span> thing</>}>
        <div className="card dare-card a-pink">
          <p className="dare-text" aria-live="polite">
            {dare ?? 'Hit the button. Do whatever it says. No overthinking allowed.'}
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
              {dare ? 'another one 🎲' : 'give me a dare 🎲'}
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
      </Section>

      <Section kicker="ancient cheat code" title={<>every faith said it <span className="serif">first</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('gita-2-48')} accent="lime" />
          <ShlokaCard shloka={shlokaById('gita-2-47')} accent="sun" />
        </div>
        <Voices theme="calm" />
      </Section>
    </div>
  )
}
