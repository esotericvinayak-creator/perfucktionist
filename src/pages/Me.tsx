import { useMemo, type ReactNode } from 'react'
import { PlusBadge, shareCard } from '../components/Overlays'
import { BADGES, RITUAL, dayKey, levelOf, monthStats, ritualToday, showedUp, streakOf, update, useProgress, type Progress } from '../lib/progress'
import { alreadyInstalled } from '../lib/install'
import { usePlus } from '../lib/plus'
import { pick, todayKey, useLocalState } from '../lib/storage'
import { useTheme } from '../lib/theme'
import { cloud, deleteAccount, logOut, useAuth } from '../lib/auth'
import { useSync, type SyncState } from '../lib/sync'
import { versionLabel } from '../lib/update'
import { CheckForUpdates } from '../components/UpdatePrompt'
import { toast } from '../lib/toast'
import { Icon } from '../components/Icon'
import { GOALS } from '../data/app'
import { ACCESSORIES, FAITHS, GENDERS, PETS } from '../data/profile'
import { PetView } from '../components/Pet'
import { sleepWeek, type SleepNight } from '../lib/sleep'

const ago = (t: number) => {
  const s = Math.round((Date.now() - t) / 1000)
  return s < 60 ? 'just now' : s < 3600 ? `${Math.round(s / 60)} min ago` : `${Math.round(s / 3600)} h ago`
}
const SYNC_LABEL: Record<SyncState, string> = {
  off: '',
  syncing: 'syncing…',
  synced: 'synced',
  offline: 'offline — syncs when you’re back',
  error: 'couldn’t sync — we’ll try again',
}

function SyncStatus() {
  const s = useSync()
  if (!cloud || s.state === 'off') return <>{!cloud && ' · saved on this device'}</>
  return (
    <>
      {' · '}☁ {SYNC_LABEL[s.state]}
      {s.state === 'synced' && s.at ? ` ${ago(s.at)}` : ''}
    </>
  )
}

/** A closed-by-default row: title, a hint of what's inside, and the content when you open it. */
function Fold({ title, hint, children, open }: { title: string; hint?: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <details className="fold" open={open}>
      <summary>
        <span>{title}</span>
        {hint && <small>{hint}</small>}
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  )
}

function Settings() {
  const p = useProgress()
  const [theme, setTheme] = useTheme()
  const auth = useAuth()
  const toggle = (id: string) => update((x) => ({ goals: x.goals.includes(id) ? x.goals.filter((g) => g !== id) : x.goals.length < 3 ? [...x.goals, id] : x.goals }))
  const gender = GENDERS.find((g) => g.id === p.gender)
  const faith = FAITHS.find((f) => f.id === p.faith)
  return (
    <div className="settings">
      <div className="set-row">
        <span>
          account
          <small className="set-sub">
            {auth.user?.email}
            <SyncStatus />
          </small>
        </span>
        <button type="button" className="btn btn-sm" onClick={() => confirm('Log out of perfucktionist?') && void logOut()}>
          log out
        </button>
      </div>
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
      <Fold title="I want help with" hint={p.goals.map((g) => GOALS.find((x) => x.id === g)?.label).filter(Boolean).join(', ') || 'pick up to 3'}>
        <div className="row gap-sm wrap">
          {GOALS.map((g) => (
            <button key={g.id} type="button" className={`chip${p.goals.includes(g.id) ? ' on' : ''}`} onClick={() => toggle(g.id)}>
              <Icon name={`goal:${g.id}`} size={14} /> {g.label}
            </button>
          ))}
        </div>
      </Fold>
      <Fold title="faith" hint={faith ? `${faith.emoji} ${faith.label}` : 'optional'}>
        <p className="set-sub">picks your scripture, daily line and Listen quotes. nothing is hidden from anyone.</p>
        <div className="row gap-sm wrap">
          {FAITHS.map((f) => (
            <button key={f.id} type="button" className={`chip${p.faith === f.id ? ' on' : ''}`} onClick={() => update(() => ({ faith: f.id }))}>
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      </Fold>
      <Fold title="gender" hint={p.gender === 'self' ? p.genderSelf || 'in your words' : gender?.label ?? 'optional'}>
        <p className="set-sub">changes what we suggest first, never what you can see.</p>
        <div className="row gap-sm wrap">
          {GENDERS.map((g) => (
            <button key={g.id} type="button" className={`chip${p.gender === g.id ? ' on' : ''}`} onClick={() => update(() => ({ gender: g.id }))}>
              {g.label}
            </button>
          ))}
        </div>
        {p.gender === 'self' && <input value={p.genderSelf ?? ''} maxLength={30} placeholder="in your words" onChange={(e) => update(() => ({ genderSelf: e.target.value }))} aria-label="Your gender, in your words" />}
      </Fold>
      <div className="set-row">
        <span>
          app version
          <small className="set-sub">{versionLabel()}</small>
        </span>
        <div className="row gap-sm">
          {!alreadyInstalled() && (
            <a className="btn btn-sm" href="#/get">
              📲 get the app
            </a>
          )}
          <CheckForUpdates />
        </div>
      </div>
    </div>
  )
}

const PET_LINES = {
  happy: ['we showed up today. proud of us. 🫶', 'look at me growing. that’s YOU doing that.', 'not perfect. just consistent. iconic.', 'full tummy, full heart. see you tomorrow?'],
  waiting: ['psst… one tiny thing today keeps our streak alive', 'I’m a little hungry. one breath? one verse? 🥺', 'any one thing counts. we’re not perfectionists here.', 'hey. I believe in you. also… snacks?'],
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

async function removeAccount() {
  const typed = prompt(
    `This deletes your account${cloud ? ' and everything synced to it — streak, XP, badges, saved books, liked songs' : ''}. It can’t be undone.\n\nAnything saved only on this phone (journal, cycle tracker, money) stays here.\n\nType delete to confirm.`,
  )
  if (typed?.trim().toLowerCase() !== 'delete') return
  const r = await deleteAccount()
  if (r.ok) toast({ icon: '👋', title: 'Account deleted', sub: 'everything in it is gone' })
  else toast({ icon: '⚠️', title: 'Couldn’t delete your account', sub: r.error })
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
  const earned = BADGES.filter((b) => p.badges[b.id])
  const [nights] = useLocalState<Record<string, SleepNight>>('tool:sleep-promise', {})
  const sleep = sleepWeek(nights)

  return (
    <div className="page me2">
      <header className="me2-head card">
        <PetView p={p} size={72} />
        <div className="me2-id">
          <h1 className="me2-name">
            hey <input className="name-input" value={p.name} placeholder="you" maxLength={16} aria-label="Your name" onChange={(e) => update(() => ({ name: e.target.value }))} size={Math.max(3, p.name.length || 3)} />
            <span className="serif">.</span>
          </h1>
          <p className="muted">
            level {lvl.level} · {lvl.name}
            {lvl.next && ` · ${lvl.next.xp - p.xp} XP to ${lvl.next.name}`}
          </p>
          <div className="meter-bar sm">
            <div className="meter-fill" style={{ width: `${lvl.progress * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="me2-stats">
        <div>
          <b>🔥 {streak}</b>
          <span>day streak</span>
        </div>
        <div>
          <b>{p.xp.toLocaleString('en-IN')}</b>
          <span>XP</span>
        </div>
        <div>
          <b>
            {earned.length}/{BADGES.length}
          </b>
          <span>badges</span>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() =>
            shareCard({
              kicker: `${p.name || 'my'} streak`,
              hero: `🔥${streak}`,
              text: streak === 1 ? 'day one. showing up > being perfect.' : `${streak} days of showing up. not perfect — just consistent.`,
              footer: `level ${lvl.level} · ${lvl.name}`,
            })
          }
        >
          ↗ share
        </button>
      </div>

      {plus.active ? (
        <a className="me2-plus on" href="#/plus">
          <PlusBadge /> <span>{plus.daysLeft} {plus.daysLeft === 1 ? 'day' : 'days'} left in your free trial</span>
        </a>
      ) : (
        <a className="me2-plus" href="#/plus">
          <span className="me2-plus-ic">🧊</span>
          <span className="grow">
            <b>{streak >= 3 ? `protect your ${streak}-day streak` : 'try Plus free for 7 days'}</b>
            <small>streak freezes, full journeys, pet outfits</small>
          </span>
          <span className="plan-go">→</span>
        </a>
      )}

      <section className="me2-sec">
        <p className="kicker">today</p>
        <div className="me2-chips">
          {RITUAL.map((r) => {
            const done = doneToday.includes(r.kind)
            return (
              <a key={r.kind} href={`#${r.path}`} className={`me2-chip${done ? ' done' : ''}`} title={r.how}>
                {done ? '✅' : r.emoji} {r.label}
              </a>
            )
          })}
        </div>
        <div className="me2-chips">
          <a className="me2-chip ghost" href="#/tools/checkin">
            🌡️ check-in
          </a>
          <a className="me2-chip ghost" href="#/tools/mood-insights">
            📈 mood insights
          </a>
          <a className="me2-chip ghost" href="#/tools/habits">
            📅 habits
          </a>
          {sleep.answered > 0 && (
            <a className={`me2-chip ghost${sleep.missed >= 3 ? ' warn' : ''}`} href="#/tools/wind-down">
              🌙 sleep promise {sleep.kept}/{sleep.answered}
              {sleep.streak > 1 ? ` · ${sleep.streak} in a row` : ''}
              {sleep.missed >= 3 ? ' · slipping' : ''}
            </a>
          )}
        </div>
      </section>

      <section className="me2-sec">
        <p className="kicker">last 16 weeks</p>
        <div className="card heat-card a-cyan">
          <Heatmap p={p} />
          <div className="row gap-sm wrap muted heat-legend">
            less <span className="hm hm-0" /> <span className="hm hm-1" /> <span className="hm hm-2" /> <span className="hm hm-3" /> <span className="hm hm-4" /> more · <span className="hm hm-f" /> freeze
          </div>
        </div>
      </section>

      <Fold title={`${p.pet || 'your pet'}`} hint={happy ? '😊 fed & happy' : '🥺 a little hungry'}>
        <div className="me2-pet">
          <div className="pet-stage sm">
            <PetView p={p} size={Math.round(70 + Math.min(lvl.index, 6) * 8)} interactive />
          </div>
          <p className="pet-bubble">“{line}”</p>
        </div>
        <label className="field">
          <span>name</span>
          <input value={p.pet} maxLength={16} placeholder="name your pet" onChange={(e) => update(() => ({ pet: e.target.value }))} />
        </label>
        <p className="kicker">pet</p>
        <div className="row gap-sm wrap skins">
          {PETS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`skin${(p.petType || 'cat') === t.id ? ' on' : ''}`}
              title={t.name}
              aria-label={t.name}
              aria-pressed={(p.petType || 'cat') === t.id}
              onClick={() => update(() => ({ petType: t.id }))}
            >
              {t.emoji}
            </button>
          ))}
        </div>
        <p className="kicker">wear {!plus.active && <PlusBadge small />}</p>
        <div className="row gap-sm wrap skins">
          {ACCESSORIES.map((a) => {
            const locked = a.plus && !plus.active
            return (
              <button
                key={a.id}
                type="button"
                className={`skin${p.petHat === a.id ? ' on' : ''}`}
                title={locked ? `${a.name} — Plus` : a.name}
                aria-label={`${a.name}${locked ? ' (Plus)' : ''}`}
                disabled={locked}
                onClick={() => update(() => ({ petHat: a.id }))}
              >
                {a.emoji || '∅'}
                {locked && <span className="lock">🔒</span>}
              </button>
            )
          })}
        </div>
      </Fold>

      <Fold title={`${monthName} wrapped`} hint={plus.active ? `${month.activeDays} ${month.activeDays === 1 ? 'day' : 'days'} showed up` : 'Plus'}>
        {plus.active ? (
          <div className="wrapped">
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
          <>
            <p className="muted">how many days you showed up, your top ritual, your brave count — as a story card made for posting.</p>
            <a className="btn btn-sm btn-primary a-violet" href="#/plus">
              ✦ try Plus free
            </a>
          </>
        )}
      </Fold>

      <Fold
        title="badges"
        hint={earned.length ? earned.slice(0, 8).map((b) => b.emoji).join(' ') : `${BADGES.length} to unlock`}
      >
        <div className="badge-grid sm">
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
      </Fold>

      <Fold title="settings" hint="account, theme, faith, goals">
        <Settings />
      </Fold>

      <p className="muted me-fine">
        {cloud ? 'Your streak, XP, badges, saved books and liked songs sync to your account. Your journal, cycle tracker, money, check-ins, gender and faith never leave this phone. ' : 'Saved only on this device — no account, nothing sent anywhere. '}
        <button
          type="button"
          className="linkish"
          onClick={() =>
            confirm(`Reset all your streaks, XP and badges?${cloud ? ' This resets them in your account too.' : ''} This can’t be undone.`) &&
            update(() => ({ xp: 0, days: {}, dayXp: {}, totals: {}, books: [], badges: {}, freezes: [], journeys: {} }))
          }
        >
          reset my progress
        </button>
        {' · '}
        <button type="button" className="linkish" onClick={() => void removeAccount()}>
          delete my account
        </button>
      </p>
    </div>
  )
}
