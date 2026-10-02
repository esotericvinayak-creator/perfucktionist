import { useMemo } from 'react'
import { PlusBadge, PlusWall, shareCard } from '../components/Overlays'
import { Section } from '../components/ui'
import { BADGES, RITUAL, SKINS, dayKey, levelOf, monthStats, ritualToday, showedUp, streakOf, update, useProgress, type Progress } from '../lib/progress'
import { usePlus } from '../lib/plus'
import { pick, todayKey } from '../lib/storage'
import { useTheme } from '../lib/theme'
import { Icon } from '../components/Icon'
import { GOALS } from '../data/app'

function Settings() {
  const p = useProgress()
  const [theme, setTheme] = useTheme()
  const toggle = (id: string) => update((x) => ({ goals: x.goals.includes(id) ? x.goals.filter((g) => g !== id) : x.goals.length < 3 ? [...x.goals, id] : x.goals }))
  return (
    <div className="settings">
      <div className="set-row">
        <span>theme</span>
        <div className="row gap-sm">
          <button type="button" className={`chip${theme === 'dark' ? ' on' : ''}`} onClick={() => setTheme('dark')}>
            ☾ dark
          </button>
          <button type="button" className={`chip${theme === 'light' ? ' on' : ''}`} onClick={() => setTheme('light')}>
            ☀︎ light
          </button>
        </div>
      </div>
      <div className="set-row col">
        <span>I want help with (up to 3)</span>
        <div className="row gap-sm wrap">
          {GOALS.map((g) => (
            <button key={g.id} type="button" className={`chip${p.goals.includes(g.id) ? ' on' : ''}`} onClick={() => toggle(g.id)}>
              <Icon name={`goal:${g.id}`} size={14} /> {g.label}
            </button>
          ))}
        </div>
      </div>
      <div className="set-row">
        <span>about the app</span>
        <a className="btn btn-sm" href="#/about">
          what is perfucktionist?
        </a>
      </div>
    </div>
  )
}

const PET_LINES = {
  happy: ['we showed up today. proud of us. 🫶', 'look at me growing. that’s YOU doing that.', 'not perfect. just consistent. iconic.', 'one more breath and I sprout a new leaf 🌿'],
  waiting: ['psst… one tiny thing today keeps our streak alive', 'I’m a little thirsty. one breath? one verse? 🥺', 'any one ritual counts. we’re not perfectionists here.', 'hey. I believe in you. also please water me.'],
}

function companionEmoji(p: Progress, level: number) {
  const stages = ['🌰', '🌱', '🌿', '🪴']
  if (level <= stages.length) return stages[level - 1]
  return SKINS.find((s) => s.id === p.skin)?.emoji ?? '🌳'
}

function Heatmap({ p }: { p: Progress }) {
  const weeks = 16
  const cells = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - (weeks * 7 - 1) - end.getDay())
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = dayKey(d)
      const n = RITUAL.filter((r) => (p.days[key]?.[r.kind] ?? 0) > 0).length
      return { key, n, future: d > end, frozen: p.freezes.includes(key) }
    })
  }, [p])
  return (
    <div className="heatmap" role="img" aria-label="Activity over the last 16 weeks">
      {cells.map((c) => (
        <span key={c.key} className={`hm hm-${c.future ? 'x' : c.frozen ? 'f' : c.n}`} title={`${c.key}: ${c.frozen ? 'streak freeze' : `${c.n}/4 rituals`}`} />
      ))}
    </div>
  )
}

export default function Me() {
  const p = useProgress()
  const plus = usePlus()
  const streak = streakOf(p)
  const lvl = levelOf(p.xp)
  const doneToday = ritualToday(p)
  const happy = showedUp(p, todayKey())
  const line = useMemo(() => pick(happy ? PET_LINES.happy : PET_LINES.waiting), [happy])
  const month = monthStats(p)
  const monthName = new Date().toLocaleString('en-IN', { month: 'long' })

  return (
    <div className="page">
      <header className="me-hero">
        <div className="me-id">
          <span className="sticker a-lime">your glow-up</span>
          <h1 className="display">
            hey{' '}
            <input
              className="name-input"
              value={p.name}
              placeholder="you"
              maxLength={16}
              aria-label="Your name"
              onChange={(e) => update(() => ({ name: e.target.value }))}
              size={Math.max(3, p.name.length || 3)}
            />
            <span className="serif">.</span>
          </h1>
          <p className="lede">Nobody’s grading this. It’s just proof that you keep showing up.</p>
          <div className="row gap-sm wrap">
            {plus.active ? (
              <span className="plus-status">
                <PlusBadge /> {plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left in your trial
              </span>
            ) : (
              <a className="btn btn-sm btn-primary a-violet" href="#/plus">
                ✦ get Plus
              </a>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => shareCard({ kicker: `${p.name || 'my'} streak`, hero: `🔥${streak}`, text: streak === 1 ? 'day one. showing up > being perfect.' : `${streak} days of showing up. not perfect — just consistent.`, footer: `level ${lvl.level} · ${lvl.name}` })}
            >
              ↗ share my streak
            </button>
          </div>
        </div>
        <div className="me-stats">
          <div className="stat-tile a-orange">
            <span className="stat-num">🔥 {streak}</span>
            <span className="stat-label">day streak</span>
          </div>
          <div className="stat-tile a-lime">
            <span className="stat-num">{p.xp.toLocaleString('en-IN')}</span>
            <span className="stat-label">XP</span>
          </div>
          <div className="stat-tile a-violet stat-wide">
            <span className="stat-label">
              level {lvl.level} · {lvl.name}
              {lvl.next && ` → ${lvl.next.name}`}
            </span>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
            <span className="muted">{lvl.next ? `${lvl.next.xp - p.xp} XP to go` : 'max level. you are the forest now.'}</span>
          </div>
        </div>
      </header>

      <Section kicker="today’s ritual · ~5 minutes" title={<>any <span className="serif">one</span> keeps your streak.</>} intro="All four = a “full send” day. One = still a win.">
        <div className="row gap-sm wrap me-quick">
          <a className="btn btn-sm btn-primary a-violet" href="#/tools/checkin">
            🌡️ 3-tap check-in
          </a>
          <a className="btn btn-sm" href="#/tools/mood-insights">
            📈 mood insights
          </a>
          <a className="btn btn-sm" href="#/tools/habits">
            📅 my habits
          </a>
        </div>
        <div className="ritual-grid">
          {RITUAL.map((r) => {
            const done = doneToday.includes(r.kind)
            return (
              <a key={r.kind} href={`#${r.path}`} className={`ritual${done ? ' done' : ''}`}>
                <span className="ritual-emoji">{done ? '✅' : r.emoji}</span>
                <strong>{r.label}</strong>
                <span>{done ? 'done today' : r.how}</span>
              </a>
            )
          })}
        </div>
      </Section>

      <Section kicker="your companion" title={<>meet <span className="serif">{p.pet || 'Bodhi'}</span></>} intro="It grows with every XP you earn. Skip a day and it gets thirsty — never dies though. We don’t do guilt here.">
        <div className="pet-card card a-lime">
          <div className={`pet ${happy ? 'happy' : 'waiting'}`}>
            <span className="pet-body">
              <span className="pet-emoji" style={{ fontSize: `${4.5 + Math.min(lvl.index, 6) * 0.6}rem` }}>
                {companionEmoji(p, lvl.level)}
              </span>
              <span className="pet-face">{happy ? '😊' : '🥺'}</span>
            </span>
            <span className="pet-ground" />
          </div>
          <div className="pet-side">
            <p className="pet-bubble">“{line}”</p>
            <label className="field">
              <span>companion name</span>
              <input value={p.pet} maxLength={16} onChange={(e) => update(() => ({ pet: e.target.value }))} />
            </label>
            <div>
              <p className="kicker">tree skins {!plus.active && <PlusBadge small />}</p>
              <div className="row gap-sm wrap skins">
                {SKINS.map((s) => {
                  const locked = s.plus && !plus.active
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`skin${p.skin === s.id ? ' on' : ''}`}
                      title={locked ? `${s.name} — Plus` : s.name}
                      aria-label={`${s.name}${locked ? ' (Plus)' : ''}`}
                      disabled={locked}
                      onClick={() => update(() => ({ skin: s.id }))}
                    >
                      {s.emoji}
                      {locked && <span className="lock">🔒</span>}
                    </button>
                  )
                })}
              </div>
              <p className="muted">Skins show once your companion reaches level 5.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section kicker="last 16 weeks" title={<>your <span className="serif">glow-up</span> map</>}>
        <div className="card heat-card a-cyan">
          <Heatmap p={p} />
          <div className="row gap-sm wrap muted heat-legend">
            less <span className="hm hm-0" /> <span className="hm hm-1" /> <span className="hm hm-2" /> <span className="hm hm-3" /> <span className="hm hm-4" /> more · <span className="hm hm-f" /> streak freeze
          </div>
        </div>
      </Section>

      <Section kicker={`${monthName} wrapped`} title={<>your month, <span className="serif">wrapped</span></>}>
        {plus.active ? (
          <div className="card wrapped a-pink">
            <div className="wrapped-grid">
              <div>
                <b>{month.activeDays}</b>
                <span>days you showed up</span>
              </div>
              <div>
                <b>{month.breaths}</b>
                <span>breathing sessions</span>
              </div>
              <div>
                <b>{month.verses}</b>
                <span>times you read</span>
              </div>
              <div>
                <b>{month.dares}</b>
                <span>brave dares</span>
              </div>
              <div>
                <b>{month.gratitude}</b>
                <span>grateful moments</span>
              </div>
              <div>
                <b>{month.pops}</b>
                <span>bubbles popped</span>
              </div>
            </div>
            <p className="wrapped-top">
              your top ritual: {month.top.emoji} <b>{month.top.label}</b>
            </p>
            <button
              type="button"
              className="btn btn-primary a-pink"
              onClick={() =>
                shareCard({
                  kicker: `${monthName} wrapped`,
                  hero: `${month.activeDays}d`,
                  text: `showed up ${month.activeDays} days · ${month.breaths} breaths · ${month.verses} reads · ${month.dares} brave dares · ${month.gratitude} gratitudes. top vibe: ${month.top.label.toLowerCase()} ${month.top.emoji}`,
                  footer: `level ${lvl.level} · ${lvl.name}`,
                })
              }
            >
              ↗ share my wrapped
            </button>
          </div>
        ) : (
          <PlusWall title="Your monthly Wrapped">Every month: how many days you showed up, your top ritual, your brave count — as a story card made for posting.</PlusWall>
        )}
      </Section>

      <Section kicker={`${Object.keys(p.badges).length}/${BADGES.length} unlocked`} title={<>badges</>}>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const got = p.badges[b.id]
            return (
              <div key={b.id} className={`badge${got ? ' got' : ''}`}>
                <span className="badge-emoji">{got ? b.emoji : '🔒'}</span>
                <strong>{b.name}</strong>
                <span>{got ? `unlocked ${got}` : b.how}</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section kicker="settings" title={<>your way</>}>
        <Settings />
      </Section>

      <p className="muted me-fine">
        All of this is saved only on this device — no account, nothing sent anywhere.{' '}
        <button
          type="button"
          className="linkish"
          onClick={() => confirm('Reset all your streaks, XP and badges? This can’t be undone.') && update(() => ({ xp: 0, days: {}, dayXp: {}, totals: {}, books: [], badges: {}, freezes: [], journeys: {} }))}
        >
          reset my progress
        </button>
      </p>
    </div>
  )
}
