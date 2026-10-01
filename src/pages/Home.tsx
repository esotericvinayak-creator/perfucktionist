import { MoodCheck } from '../components/MoodCheck'
import { ShlokaCard } from '../components/ShlokaCard'
import { WisdomCard } from '../components/Voices'
import { Marquee, Section } from '../components/ui'
import { shlokas } from '../data/shlokas'
import { wisdom } from '../data/wisdom'
import { motives, zones } from '../data/zones'
import { RITUAL, levelOf, ritualToday, streakOf, useProgress } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { formatIndian, totalVerses } from '../lib/scripture'
import { NEEDS, TOOLS, toolById } from '../tools/registry'

const FEATURED = ['panic', 'focus', 'expenses', 'safe-walk', 'sleep-calc', 'period', 'scam-check', 'habits']
import { dayOfYear } from '../lib/storage'

function GlowUp() {
  const p = useProgress()
  const plus = usePlus()
  const streak = streakOf(p)
  const lvl = levelOf(p.xp)
  const done = ritualToday(p)
  return (
    <div className="glow-card card a-lime">
      <div className="glow-left">
        <p className="glow-streak">
          🔥 <b>{streak}</b> <span>day streak</span>
        </p>
        <p className="muted">
          level {lvl.level} · {lvl.name} · {formatIndian(p.xp)} XP
        </p>
        <div className="glow-dots" aria-label={`${done.length} of 4 rituals done today`}>
          {RITUAL.map((r) => (
            <a key={r.kind} href={`#${r.path}`} className={`glow-dot${done.includes(r.kind) ? ' on' : ''}`} title={r.label}>
              {done.includes(r.kind) ? '✓' : r.emoji}
            </a>
          ))}
        </div>
      </div>
      <div className="glow-right">
        <h3>{streak ? 'keep it alive — any one ritual counts.' : 'start a streak in 5 minutes a day.'}</h3>
        <p>Breathe, read a verse, do one brave thing, drop one gratitude. Grow a companion, unlock badges, get your monthly Wrapped.</p>
        <div className="row gap-sm wrap">
          <a className="btn btn-primary a-lime" href="#/me">
            {streak ? 'my glow-up →' : 'start my streak →'}
          </a>
          <a className="btn" href="#/journeys">
            🧭 journeys
          </a>
          {!plus.active && (
            <a className="btn btn-ghost" href="#/plus">
              ✦ plus
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const manifesto = [
  ['Done > perfect.', 'Ship it at 70%. The world gives feedback, not grades.'],
  ['Your mess is your story.', 'Nobody remembers the flawless ones. They remember the real ones.'],
  ['No secrets that hurt you.', 'Anyone who says “don’t tell your parents” is the red flag.'],
  ['God is free. Middlemen aren’t.', 'Real faith — any faith — never sends a QR code.'],
  ['Your body, your rules.', 'No means no. Silence means no. Only yes means yes.'],
  ['Breathe before you break.', 'Four seconds in. Four seconds hold. You’re back.'],
  ['Trees > tantrums.', 'Plant one every birthday. Future you will breathe easier.'],
  ['Brave ≠ fearless.', 'Brave is shaking and doing it anyway.'],
]

export default function Home() {
  const day = dayOfYear()
  const dailyShloka = shlokas[day % shlokas.length]
  const dailyWisdom = wisdom[day % wisdom.length]
  return (
    <>
      <section className="home-hero page">
        <div className="hero-stickers" aria-hidden="true">
          <span className="sticker a-pink s1">no filter ✶</span>
          <span className="sticker a-cyan s2">100% human</span>
          <span className="sticker a-sun s3">made in india 🇮🇳</span>
          <span className="sticker a-violet s4">chaos approved</span>
        </div>
        <p className="kicker">about perfucktionist</p>
        <h1 className="mega">
          <span className="strike">
            Perfection
            <svg className="scribble" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 26 C 60 8, 110 34, 170 18 S 280 6, 330 22 S 380 30, 396 14" />
            </svg>
          </span>
          <br />
          is a <span className="serif">scam.</span>
        </h1>
        <p className="lede">
          Stop polishing. Start living. Your toolkit to stay safe, be brave, breathe deep, vibe to any song on earth — and give <b>zero f*cks</b> about being perfect.
        </p>
        <div className="row gap wrap">
          <a className="btn btn-primary a-lime" href="#/">
            open my today →
          </a>
          <a className="btn" href="#/music">
            🎧 play music
          </a>
          <a className="btn" href="#/breathe">
            🫁 breathe
          </a>
        </div>
        <div className="spin-badge" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path id="circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#circle" textLength="486" lengthAdjust="spacing">
                give zero f*cks about perfect ✶
              </textPath>
            </text>
          </svg>
          <span>✶</span>
        </div>
      </section>

      <div className="marquee-cross">
        <Marquee items={motives} accent="lime" tilt={-2.5} />
        <Marquee items={motives.slice().reverse()} accent="pink" tilt={2} reverse />
      </div>

      <div className="page">
        <Section kicker="11 zones · zero judgement" title={<>pick your <span className="serif">vibe</span></>}>
          <div className="zone-grid">
            {zones.map((z, i) => (
              <a key={z.path} href={`#${z.path}`} className={`card zone-card a-${z.accent}`} style={{ animationDelay: `${i * 40}ms` }}>
                <span className="zone-emoji" aria-hidden="true">
                  {z.emoji}
                </span>
                <h3>
                  {z.title}
                  {z.tag && <span className="tag">{z.tag}</span>}
                </h3>
                <p>{z.blurb}</p>
                <span className="zone-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </Section>

        <Section kicker="glow-up mode" title={<>show up. <span className="serif">not perfect — just daily.</span></>}>
          <GlowUp />
        </Section>

        <Section kicker={`toolkit · ${TOOLS.length} tools`} title={<>tools for <span className="serif">real</span> life</>}>
          <div className="need-row home-needs">
            {NEEDS.map((n) => (
              <a key={n.id} className="need" href={`#/tools/for/${n.id}`}>
                <span>{n.emoji}</span>
                {n.label}
              </a>
            ))}
          </div>
          <div className="tile-grid">
            {FEATURED.map((id) => {
              const t = toolById(id)!
              return (
                <a key={id} href={`#/tools/${id}`} className={`tile cat-${t.cat}`}>
                  <span className="tile-emoji">{t.emoji}</span>
                  <b>{t.name}</b>
                  <small>{t.hook}</small>
                </a>
              )
            })}
          </div>
          <div className="center-row">
            <a className="btn btn-primary a-lime" href="#/tools">
              🧰 open all {TOOLS.length} tools →
            </a>
          </div>
        </Section>

        <Section kicker="check-in" title={<>how u feeling <span className="serif">rn?</span></>} intro="Tap one. No wrong answers, no tracking, no judgement.">
          <MoodCheck />
        </Section>

        <Section kicker="the manifesto" title={<>8 things we <span className="serif">actually</span> believe</>}>
          <ol className="manifesto">
            {manifesto.map(([big, small], i) => (
              <li key={big}>
                <span className="mf-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{big}</strong>
                  <p>{small}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section kicker="today's wisdom · every faith" title={<>thousands of years old. <span className="serif">still hits.</span></>}>
          <div className="grid grid-2">
            <ShlokaCard shloka={dailyShloka} accent="sun" />
            <WisdomCard w={dailyWisdom} />
          </div>
          <div className="center-row">
            <a className="btn btn-primary a-sun" href="#/library">
              📚 read {formatIndian(totalVerses)} verses from 6 scriptures →
            </a>
          </div>
        </Section>
      </div>
    </>
  )
}
