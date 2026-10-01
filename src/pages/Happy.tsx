import { useState, type CSSProperties } from 'react'
import { MoodCheck } from '../components/MoodCheck'
import { PageHero, Section } from '../components/ui'
import { usePlayer } from '../context/Player'
import { confetti, confettiFrom } from '../lib/confetti'
import { moods, searchSongs } from '../lib/music'
import { log } from '../lib/progress'
import { pop, whoosh } from '../lib/sound'
import { pick, useLocalState } from '../lib/storage'

const dopamine = [
  '🫶 Compliment: your laugh is someone’s favourite sound. Probably several people’s.',
  '🫶 Compliment: you’ve survived 100% of your worst days so far. Undefeated.',
  '🫶 Compliment: the fact that you care about getting better? That’s already rare.',
  '🫶 Compliment: you’re somebody’s “I’m so glad I met them”.',
  '🫶 Compliment: you have main character energy and side character humility. Iconic.',
  '🎯 Mission: drink a full glass of water right now. Your brain is 75% water. Refill it.',
  '🎯 Mission: text someone “thinking of you” with zero context. Watch them smile.',
  '🎯 Mission: step outside for 2 minutes and look at the sky. That’s it.',
  '🎯 Mission: put on one song and dance like the neighbours aren’t watching.',
  '🎯 Mission: tell your mom or dad one thing you appreciate about them. Today.',
  '🎯 Mission: stretch your arms up as high as they go. Hold. Exhale. Better, right?',
  '🎯 Mission: delete one app that makes you feel bad about yourself.',
  '🤓 Fact: sea otters hold hands while they sleep so they don’t drift apart.',
  '🤓 Fact: cows have best friends and get stressed when they’re separated.',
  '🤓 Fact: smiling — even a fake one — can nudge your mood up a little.',
  '🤓 Fact: honey basically never spoils. Archaeologists found edible honey in ancient Egyptian tombs.',
  '🤓 Fact: a group of flamingos is called a “flamboyance”. Be the flamboyance.',
  '🤓 Fact: octopuses have three hearts. You only need one, and yours is doing great.',
  '😂 Joke: why did the scarecrow win an award? He was outstanding in his field.',
  '😂 Joke: I told my phone I needed a break. It gave me a KitKat ad.',
  '😂 Joke: my perfectionism and my procrastination are best friends. They never finish anything together.',
  '😂 Joke: why don’t skeletons fight each other? They don’t have the guts.',
  '😂 Joke: parallel lines have so much in common. It’s a shame they’ll never meet.',
]

const ROWS = 5
const COLS = 8

function BubbleWrap() {
  const [popped, setPopped] = useState<boolean[]>(() => Array(ROWS * COLS).fill(false))
  const [total, setTotal] = useLocalState('bubbles-popped', 0)
  const left = popped.filter((p) => !p).length

  const popAt = (i: number, el: HTMLElement) => {
    if (popped[i]) return
    pop()
    navigator.vibrate?.(8)
    const next = popped.slice()
    next[i] = true
    setPopped(next)
    setTotal((t) => t + 1)
    log('pop', { silent: true })
    if (next.every(Boolean)) confettiFrom(el)
  }

  return (
    <div className="card bubble-card a-pink">
      <div className="bubble-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {popped.map((p, i) => (
          <button key={i} type="button" className={`bubble${p ? ' popped' : ''}`} onPointerDown={(e) => popAt(i, e.currentTarget)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && popAt(i, e.currentTarget)} aria-label={p ? 'popped' : 'pop bubble'} />
        ))}
      </div>
      <div className="row space-between wrap gap-sm">
        <span className="muted">
          {left} left · {total.toLocaleString()} popped all-time
        </span>
        <button type="button" className="btn btn-sm" onClick={() => setPopped(Array(ROWS * COLS).fill(false))}>
          ↻ new sheet
        </button>
      </div>
    </div>
  )
}

function YeetBox() {
  const [text, setText] = useState('')
  const [flying, setFlying] = useState<{ w: string; style: CSSProperties }[] | null>(null)
  const [count, setCount] = useLocalState('yeeted', 0)

  const yeet = () => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return
    whoosh()
    setFlying(
      words.map((w, i) => ({
        w,
        style: { '--x': `${(Math.random() - 0.5) * 600}px`, '--y': `${-200 - Math.random() * 400}px`, '--r': `${(Math.random() - 0.5) * 720}deg`, animationDelay: `${i * 25}ms` } as CSSProperties,
      })),
    )
    setText('')
    setCount((c) => c + 1)
    log('yeet')
    setTimeout(() => setFlying(null), 1600)
  }

  return (
    <div className="card yeet-card a-orange">
      <label className="field">
        <span>type the thing that’s bugging you</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="the exam, that one person, the group chat, the pressure, all of it…" />
      </label>
      {flying && (
        <div className="yeet-fly" aria-hidden="true">
          {flying.map((f, i) => (
            <span key={i} style={f.style}>
              {f.w}
            </span>
          ))}
        </div>
      )}
      <div className="row space-between wrap gap-sm">
        <span className="muted">Nothing is saved. Ever. {count > 0 && `${count} things yeeted so far.`}</span>
        <button type="button" className="btn btn-primary a-orange" onClick={yeet} disabled={!text.trim()}>
          yeet it 🔥
        </button>
      </div>
      {flying && <p className="yeet-done">gone. it’s not your problem for the next 5 minutes. 🫡</p>}
    </div>
  )
}

function GratitudeJar() {
  const [notes, setNotes] = useLocalState<{ text: string; at: number }[]>('gratitude', [])
  const [draft, setDraft] = useState('')
  const [memory, setMemory] = useState<string | null>(null)
  const colors = ['lime', 'pink', 'sun', 'cyan', 'violet', 'orange']

  return (
    <div className="card jar-card a-sun">
      <form
        className="row gap-sm"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          setNotes([{ text: draft.trim(), at: Date.now() }, ...notes].slice(0, 60))
          setDraft('')
          log('gratitude')
        }}
      >
        <input className="grow" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="one good thing today…" maxLength={120} aria-label="Something you’re grateful for" />
        <button type="submit" className="btn btn-primary a-sun">
          drop it in
        </button>
      </form>
      <div className="jar">
        {notes.length === 0 && <p className="muted jar-empty">Your jar is empty. Even “the chai was good” counts.</p>}
        {notes.map((n, i) => (
          <span key={n.at} className={`slip a-${colors[i % colors.length]}`} style={{ rotate: `${((n.at % 13) - 6) * 1.2}deg` }}>
            {n.text}
            <button type="button" aria-label="Remove" onClick={() => setNotes(notes.filter((x) => x.at !== n.at))}>
              ×
            </button>
          </span>
        ))}
      </div>
      {notes.length > 0 && (
        <div className="row space-between wrap gap-sm">
          <button type="button" className="btn btn-sm" onClick={() => setMemory(pick(notes).text)}>
            🫙 shake the jar
          </button>
          <span className="muted">Saved only on this device.</span>
        </div>
      )}
      {memory && <p className="jar-memory">“{memory}” — remember this one? 💛</p>}
    </div>
  )
}

export default function Happy() {
  const [hit, setHit] = useState<string | null>(null)
  const [dancing, setDancing] = useState(false)
  const player = usePlayer()

  const danceBreak = async (el: HTMLElement) => {
    setDancing(true)
    confettiFrom(el)
    try {
      const pool = [...moods[0].terms, ...moods[2].terms, ...moods[1].terms]
      const tracks = await searchSongs(pick(pool), 'IN', 20)
      if (tracks.length) {
        const shuffled = tracks.sort(() => Math.random() - 0.5)
        player.play(shuffled[0], shuffled)
      }
    } finally {
      setDancing(false)
    }
  }

  return (
    <div className="page">
      <PageHero
        kicker="zone 07 · happy zone"
        accent="pink"
        emoji="🫧"
        title={
          <>
            do whatever makes you <span className="serif">happy</span>
          </>
        }
        sub="(legally, lol.) Pop bubbles. Yeet your stress into the void. Collect tiny good things. No productivity required."
      />

      <Section kicker="the button" title={<>press for <span className="serif">dopamine</span></>}>
        <div className="card happy-card a-lime">
          <p className="happy-text" aria-live="polite">
            {hit ?? 'One press = one compliment, mission, fact or bad joke. Unlimited refills.'}
          </p>
          <div className="row gap-sm wrap center">
            <button
              type="button"
              className="big-button"
              onClick={(e) => {
                setHit(pick(dopamine, hit ?? undefined))
                confettiFrom(e.currentTarget)
              }}
            >
              <span>press me</span>
            </button>
            <button type="button" className="btn btn-primary a-pink" onClick={(e) => danceBreak(e.currentTarget)} disabled={dancing}>
              {dancing ? 'loading the beat…' : '💃 instant dance break'}
            </button>
          </div>
        </div>
      </Section>

      <Section kicker="satisfying af" title={<>infinite <span className="serif">bubble wrap</span></>}>
        <BubbleWrap />
      </Section>

      <Section kicker="scream into the void" title={<>yeet the <span className="serif">stress</span></>} intro="Type it out. Hit the button. Watch it disappear. Your feelings are valid — they just don’t need to live in your head rent-free.">
        <YeetBox />
      </Section>

      <Section kicker="tiny good things" title={<>the gratitude <span className="serif">jar</span></>} intro="Three small good things a day literally rewires your brain to notice more good things. Science said so.">
        <GratitudeJar />
      </Section>

      <Section kicker="check-in" title={<>still not feeling it?</>}>
        <MoodCheck />
        <div className="center-row">
          <button type="button" className="btn" onClick={() => confetti()}>
            🎉 just give me confetti
          </button>
        </div>
      </Section>
    </div>
  )
}
