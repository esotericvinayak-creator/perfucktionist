import { useState } from 'react'
import { CopyButton } from '../components/ui'
import { log } from '../lib/progress'
import { pick } from '../lib/storage'
import { Card, Choice, Empty, QuickAdd, Stat, Stats, daysBetween, today, uid, useTool } from './kit'
import { ToolChips } from './links'

// ─── Boundary scripts ─────────────────────────────────────────
const SCRIPTS: Record<string, Record<string, string[]>> = {
  '👵 relatives': {
    'marks / career questions': ['I’m working on it and I’ll share when there’s news. How have you been, aunty?', 'It’s going at my pace, and I’m okay with that. Anyway — how’s your health?'],
    'marriage questions': ['When it happens, you’ll be the first to know. Till then, I’m focusing on me.', 'Not on my mind right now. Let’s talk about something else — how was your trip?'],
    'comments on my body': ['I’d rather we didn’t comment on my body. I’m healthy and happy.', 'Please don’t say things like that about my weight. It really affects me.'],
  },
  '👨‍👩‍👧 parents': {
    'I need more privacy': ['I love you and I’m not hiding anything bad. I just need some space that’s mine. Can we agree on knocking first?', 'I’ll always tell you the important stuff — I promise. But I need some privacy to grow up properly.'],
    'my career choice': ['I know you want me to be secure. Can I show you my plan for this path, and we decide together?', 'Give me one year to prove this can work. If it doesn’t, we’ll talk again.'],
    'I’m burnt out': ['I’m not being lazy — I’m exhausted. I need a proper break this weekend so I can study better after.', 'I’ve been feeling really low and tired. Can we talk without it becoming a lecture?'],
  },
  '👯 friends': {
    'borrowing money again': ['I can’t lend money right now — it’s a rule I’ve made for myself. Hope you understand.', 'I’m saving for something, so I have to say no this time.'],
    'jokes that hurt': ['Hey, that joke about me actually stung. Can we not do that one anymore?', 'I know you didn’t mean it, but it hurt. Just letting you know.'],
    'pressure to drink / smoke': ['Nah, I’m good. Still in for the plan though!', 'Not for me — and that’s not a judgement on you.'],
  },
  '💑 partner': {
    'checking my phone': ['I don’t check yours and I need the same trust from you. My phone is mine.', 'If you’re feeling insecure, let’s talk about that — but checking my phone isn’t okay with me.'],
    'I need space': ['I need a few days to myself. It’s not about you — I’ll reach out on Sunday.', 'I care about us, and I need some alone time to recharge.'],
    'I’m not ready': ['I’m not ready for that, and I need you to respect it without pressure.', 'No — and if that changes, I’ll be the one to bring it up.'],
  },
  '💼 boss / teacher': {
    'messages after hours': ['I saw this — I’ll pick it up first thing tomorrow morning.', 'I’m logged off for the day. Is this urgent, or can it wait till tomorrow?'],
    'too much work': ['I want to do this well. Which of my current tasks should I pause to take it on?', 'I’m at capacity this week. Can we push the deadline to Monday?'],
    'an unfair comment': ['Can I share my side of it? I think there’s context missing.', 'I’d appreciate feedback in private next time.'],
  },
}

export function Boundaries() {
  const whos = Object.keys(SCRIPTS)
  const [who, setWho] = useState(whos[0])
  const [sit, setSit] = useState<string | null>(null)
  const [v, setV] = useState(0)
  const script = sit ? SCRIPTS[who][sit][v % SCRIPTS[who][sit].length] : ''
  return (
    <div className="stack">
      <Choice
        options={whos.map((w) => ({ value: w, label: w }))}
        value={who}
        onChange={(w) => {
          setWho(w)
          setSit(null)
        }}
      />
      <Choice big options={Object.keys(SCRIPTS[who]).map((s) => ({ value: s, label: s }))} value={sit} onChange={(s) => (setSit(s), setV(0), log('tool', { silent: true }))} />
      {sit && (
        <Card className="focus-card">
          <p className="big-q">“{script}”</p>
          <div className="row gap-sm center">
            <button type="button" className="btn btn-sm" onClick={() => setV(v + 1)}>
              🔀 another way
            </button>
            <CopyButton text={script} className="btn btn-sm btn-primary a-lime" />
          </div>
          <p className="muted">Calm tone. No over-explaining. Then change the topic.</p>
        </Card>
      )}
    </div>
  )
}

// ─── Breakup recovery ─────────────────────────────────────────
const HEAL = [
  'Mute or archive their chat. Out of sight, out of thumb.',
  'Eat a proper meal. Yes, really.',
  'Tell one friend the full story. Don’t carry it alone.',
  'Delete or hide the photos you keep re-opening.',
  'Go outside for 20 minutes. Sunlight is free therapy.',
  'Write the unsent letter (in the box below). Don’t send it.',
  'Do one thing they never liked you doing.',
  'Make a “why it didn’t work” list. Read it when you miss them.',
  'Move your body until you’re out of breath.',
  'Make a new playlist. No songs that remind you of them.',
  'Plan something for next weekend that’s just for you.',
  'Write 3 things you want in your next relationship.',
  'Notice a whole hour you didn’t think of them. That’s healing.',
  'Day 14. You’re still here. Look how far you came.',
]

export function Breakup() {
  const [start, setStart] = useTool<string | null>('nc-start', null)
  const [best, setBest] = useTool('nc-best', 0)
  const [urge, setUrge] = useState(false)
  const [letter, setLetter] = useState('')
  const days = start ? daysBetween(start, today()) : 0
  if (!start)
    return (
      <div className="stack center-stack">
        <p className="big-q">no contact starts now. you’ve got this.</p>
        <button type="button" className="btn btn-primary a-pink big-cta" onClick={() => (setStart(today()), log('tool'))}>
          💔 start day 1
        </button>
        <p className="muted">No texting, no stalking their stories, no “just checking in”. One day at a time.</p>
      </div>
    )
  return (
    <div className="stack">
      <Stats>
        <Stat value={days} label={`day${days === 1 ? '' : 's'} no contact`} />
        <Stat value={Math.max(best, days)} label="longest" />
      </Stats>
      <Card className="focus-card">
        <p className="kicker">today’s step</p>
        <p className="big-q">{HEAL[Math.min(days, HEAL.length - 1)]}</p>
      </Card>
      <button type="button" className="btn btn-primary a-pink" onClick={() => setUrge(true)}>
        😩 I want to text them
      </button>
      {urge && (
        <Card>
          <p className="kicker">write it here instead. it won’t be saved or sent.</p>
          <textarea rows={4} value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="everything you want to say…" />
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-sm" onClick={() => (setLetter(''), setUrge(false))}>
              🔥 delete it. feel lighter.
            </button>
          </div>
          <ToolChips ids={['urge', 'bad-day']} title="still strong?" />
        </Card>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setBest(Math.max(best, days))
          setStart(today())
        }}
      >
        I texted them — restart (no shame)
      </button>
    </div>
  )
}

// ─── Friend check-ins ─────────────────────────────────────────
type Friend = { id: string; name: string; every: number; last: string }

export function Friends() {
  const [friends, setFriends] = useTool<Friend[]>('friends', [])
  const [every, setEvery] = useState(14)
  const sorted = [...friends].sort((a, b) => daysBetween(b.last, today()) / b.every - daysBetween(a.last, today()) / a.every)
  return (
    <div className="stack">
      <Choice options={[7, 14, 30].map((d) => ({ value: d, label: d === 7 ? 'weekly' : d === 14 ? 'every 2 weeks' : 'monthly' }))} value={every} onChange={setEvery} />
      <QuickAdd placeholder="a friend you don’t want to lose" onAdd={(name) => setFriends([...friends, { id: uid(), name, every, last: today() }])} />
      {sorted.length ? (
        <ul className="tlist">
          {sorted.map((f) => {
            const ago = daysBetween(f.last, today())
            const due = ago >= f.every
            return (
              <li key={f.id} className={due ? 'due' : ''}>
                <span className="grow">
                  <b>{f.name}</b> <small className="muted">{ago === 0 ? 'talked today' : `${ago}d ago`}</small>
                  {due && <em className="due-tag">due</em>}
                </span>
                <a className="btn btn-sm" href={`https://wa.me/?text=${encodeURIComponent(`hey ${f.name}! was just thinking about you 🫶 how are you?`)}`} target="_blank" rel="noreferrer">
                  text
                </a>
                <button type="button" className="btn btn-sm btn-primary a-lime" onClick={() => (setFriends(friends.map((x) => (x.id === f.id ? { ...x, last: today() } : x))), log('tool'))}>
                  talked ✓
                </button>
                <button type="button" className="x" aria-label="Remove" onClick={() => setFriends(friends.filter((x) => x.id !== f.id))}>
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <Empty emoji="🤙">Friendships fade from silence, not fights. Add the people you miss.</Empty>
      )}
    </div>
  )
}

// ─── Kindness dares ───────────────────────────────────────────
const KIND = [
  'Text a teacher who helped you and say thanks.',
  'Leave a 5-star review for a small local shop you love.',
  'Compliment a stranger’s outfit (genuinely).',
  'Buy chai for the watchman or delivery person.',
  'Hype a friend’s post with a real comment, not just a like.',
  'Help someone with their bags or directions.',
  'Call your grandparents. Ask them a question about their youth.',
  'Share someone’s small business on your story.',
  'Leave a kind note for your mom or dad to find.',
  'Fill a water bowl for street animals.',
  'Let someone go ahead of you in a queue.',
  'Forgive someone in your head. You don’t have to tell them.',
  'Donate clothes you haven’t worn in a year.',
  'Teach someone something you’re good at.',
  'Say thank you to the bus or auto driver.',
  'Check on the quiet friend in the group chat.',
]

export function Kindness() {
  const [count, setCount] = useTool('kind-count', 0)
  const [dare, setDare] = useState(() => pick(KIND))
  const [did, setDid] = useState(false)
  return (
    <div className="stack center-stack">
      <Card className="focus-card">
        <span className="done-emoji">🌻</span>
        <p className="big-q">{dare}</p>
      </Card>
      <div className="row gap-sm">
        <button type="button" className="btn" onClick={() => (setDare(pick(KIND, dare)), setDid(false))}>
          🔀 another
        </button>
        <button type="button" className="btn btn-primary a-lime" disabled={did} onClick={() => (setCount(count + 1), setDid(true), log('dare'))}>
          {did ? 'you’re lovely ✓' : '✓ did it'}
        </button>
      </div>
      <p className="muted">🌻 {count} kind things done</p>
    </div>
  )
}

// ─── Conversation starters ────────────────────────────────────
const CONVO: Record<string, string[]> = {
  '🆕 new friends': ['What’s something you’re weirdly good at?', 'What’s the best thing you’ve eaten this month?', 'What are you obsessed with right now?', 'Mountains or beaches — and why?', 'What’s a show you could rewatch forever?', 'What did you want to be when you were 8?', 'What’s your most controversial food opinion?', 'Best trip you’ve ever taken?'],
  '🍽️ family dinner': ['What was the hardest thing about being my age when you were young?', 'How did you two actually meet?', 'What’s a family story I’ve never heard?', 'What was your first salary and what did you buy?', 'What’s one thing you wish you’d learned earlier?', 'What were you scared of at my age?', 'Which of your friends from school do you still miss?', 'What makes you proud of our family?'],
  '💘 date': ['What’s your idea of a perfect Sunday?', 'What are you looking forward to this year?', 'What’s something that instantly makes your day better?', 'What’s a small thing people do that you find really attractive?', 'What’s your love language — honestly?', 'What’s a song that defines your life right now?', 'Green flag you always look for?', 'Most spontaneous thing you’ve done?'],
  '🌌 deep talk': ['What’s something you believed for a long time and then changed your mind about?', 'When do you feel most like yourself?', 'What are you healing from right now?', 'What does a good life look like to you?', 'What’s a fear you’ve never said out loud?', 'Who shaped you the most, and how?', 'What would you do if you knew you couldn’t fail?', 'What do you need more of right now?'],
  '💼 networking': ['What got you into this field?', 'What does a normal day in your job actually look like?', 'What’s a skill you wish you’d learned earlier in your career?', 'What’s the best advice you got starting out?', 'What’s exciting in your work right now?', 'What would you do differently if you were starting today?', 'Is there anyone you think I should talk to?', 'How can I be useful to you?'],
}

export function Convo() {
  const ctx = Object.keys(CONVO)
  const [c, setC] = useState(ctx[0])
  const [i, setI] = useState(0)
  return (
    <div className="stack center-stack">
      <Choice options={ctx.map((x) => ({ value: x, label: x }))} value={c} onChange={(x) => (setC(x), setI(0))} />
      <button type="button" className="affirm-card" onClick={() => setI(i + 1)}>
        <span>{CONVO[c][i % CONVO[c].length]}</span>
        <small>tap for the next one →</small>
      </button>
      <p className="muted">pro tip: ask a follow-up. people love being asked “and then what?”</p>
    </div>
  )
}

