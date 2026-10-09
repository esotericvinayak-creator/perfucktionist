import { useMemo, useState } from 'react'
import { Voices } from '../components/Voices'
import { CallCard, Callout, PageHero, Section, TipGrid } from '../components/ui'
import { helplines } from '../data/helplines'
import { pollCategories, questionFor, statements, type PollCategory, type Statement } from '../data/faithPolls'
import { MIN_ANSWERS, split, useFaithPolls, type PollMode, type Tally } from '../lib/faithVotes'

const redFlags = [
  'Asks for big money, gold or property to “remove dosh” or bring a miracle',
  'Says a puja or ritual will cure a disease, or tells you to stop medicines',
  'Asks you to keep it secret from your family',
  'Wants to meet you alone for a “special blessing”',
  'Scares you: “something terrible will happen if you don’t…”',
  'Gets angry when you ask questions or want proof',
  'Asks for your photos, OTP, bank or UPI details',
]

const scams = [
  { icon: '💍', title: '“Love problem” specialists', body: 'Vashikaran babas, amils, “love spell” ads. Advance money, then “one final ritual”, then blackmail.' },
  { icon: '🧿', title: 'Fear packages', body: 'Kaal sarp dosh, “nazar”, generational curses: “just ₹51,000 to fix it”. Fear is the product, in every religion’s costume.' },
  { icon: '💊', title: 'Miracle cures', body: 'Holy water, taweez, ash, “healing crusades”. Never stop medical treatment for any ritual or prayer meeting.' },
  { icon: '🌱', title: '“Sow a seed” & money doubling', body: '“Give ₹10,000 and God returns it 100×”. The only thing that multiplies is their bank balance.' },
]

const realVsFake = [
  ['Makes you calmer, kinder, braver', 'Makes you scared and anxious'],
  ['Welcomes your questions', 'Gets angry at questions'],
  ['Free: a leaf, a flower, water', 'Has a price list'],
  ['Brings you closer to family', 'Pulls you away from family'],
]

const modeNote: Record<PollMode, string | null> = {
  cloud: null,
  preview: 'Preview: answers stay on this device. Results appear when accounts are live.',
  'signed-out': 'You’re not logged in, so answers stay on this device. Log in to add yours to the totals and see what others say.',
}

export default function Faith() {
  const polls = useFaithPolls()
  const [cat, setCat] = useState<'all' | PollCategory>('all')
  const [pick, setPick] = useState<string | null>(null)
  const [view, setView] = useState<'card' | 'mine'>('card')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const list = useMemo(() => (cat === 'all' ? statements : statements.filter((s) => s.category === cat)), [cat])
  const answered = statements.filter((s) => polls.mine[s.id] !== undefined).length
  const current: Statement | undefined = list.find((s) => s.id === pick) ?? list.find((s) => polls.mine[s.id] === undefined) ?? list[0]

  function go(id: string | null) {
    setPick(id)
    setDone(false)
    setError(null)
    setView('card')
  }
  function pickCategory(next: 'all' | PollCategory) {
    setCat(next)
    go(null)
  }
  /** The next question you haven't answered, wrapping round. When there's none left, say so. */
  function advance(skipping: boolean) {
    if (!current) return
    const at = list.indexOf(current)
    const order = [...list.slice(at + 1), ...list.slice(0, at)]
    const next = order.find((s) => polls.mine[s.id] === undefined) ?? (skipping ? order[0] : undefined)
    if (next) go(next.id)
    else {
      setDone(true)
      setError(null)
    }
  }
  async function reply(yes: boolean) {
    if (!current) return
    setPick(current.id) // stay on this card; otherwise "first unanswered" would jump ahead
    setError(null)
    setError(await polls.answer(current.id, yes))
  }

  return (
    <div className="page fp-page">
      <PageHero
        kicker="zone 10 · real faith"
        accent="orange"
        emoji="🙏"
        title={
          <>
            real faith, <span className="serif">real talk.</span>
          </>
        }
        sub="Quick yes/no questions about faith, money and fear. About patterns, never people."
      />

      <section className="section" aria-label="the poll">
        <p className="fp-note fp-intro">Answers from people on this app: what they say and have seen, not proof that anything is true or fake.</p>
        {polls.status === 'off' ? (
          <div className="card fp-card">
            <p className="fp-text">Polls aren’t switched on yet.</p>
            <p className="fp-note">Check back soon. The tips below are ready to read.</p>
          </div>
        ) : polls.status === 'error' ? (
          <div className="card fp-card">
            <p className="fp-text">Couldn’t reach the polls.</p>
            <p className="fp-note">Check your connection and try again.</p>
            <button type="button" className="btn btn-sm" onClick={() => void polls.reload()}>
              try again
            </button>
          </div>
        ) : (
          <div className="fp">
            {modeNote[polls.mode] && <p className="fp-note fp-mode">{modeNote[polls.mode]}</p>}

            <div className="fp-top">
              <p className="fp-progress" aria-live="polite">
                <b>{answered}</b> of {statements.length} answered
              </p>
              <button type="button" className="btn btn-ghost btn-sm" aria-pressed={view === 'mine'} onClick={() => setView(view === 'mine' ? 'card' : 'mine')}>
                {view === 'mine' ? 'back to questions' : 'your answers'}
              </button>
            </div>

            <div className="fp-chips" role="group" aria-label="pick a topic">
              <button type="button" className={`chip${cat === 'all' ? ' on' : ''}`} aria-pressed={cat === 'all'} onClick={() => pickCategory('all')}>
                all
              </button>
              {pollCategories.map((c) => {
                const items = statements.filter((s) => s.category === c.id)
                const n = items.filter((s) => polls.mine[s.id] !== undefined).length
                return (
                  <button key={c.id} type="button" className={`chip${cat === c.id ? ' on' : ''}`} aria-pressed={cat === c.id} onClick={() => pickCategory(c.id)}>
                    {c.emoji} {c.label} <span className="fp-count">{n}/{items.length}</span>
                  </button>
                )
              })}
            </div>

            {polls.status === 'loading' ? (
              <div className="card fp-card" aria-busy="true">
                <p className="fp-note">Loading…</p>
              </div>
            ) : view === 'mine' ? (
              <MyAnswers mine={polls.mine} onOpen={(s) => { setCat('all'); go(s.id) }} />
            ) : done ? (
              <div className="card fp-card a-lime">
                <p className="fp-text">That’s all of these 🙌</p>
                <p className="fp-note">You can change any answer, or pick another topic above.</p>
                <div className="fp-actions">
                  <button type="button" className="btn btn-sm" onClick={() => setView('mine')}>
                    see your answers
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(list[0]?.id ?? null)}>
                    start again
                  </button>
                </div>
              </div>
            ) : current ? (
              <Card statement={current} mode={polls.mode} mine={polls.mine[current.id]} tally={polls.tally[current.id]} error={error} onAnswer={reply} onNext={() => advance(false)} onSkip={() => advance(true)} />
            ) : null}
          </div>
        )}
      </section>

      <details className="fp-more">
        <summary>how to spot exploitation</summary>
        <div className="fp-more-body">
          <p className="fp-lede">Faith is personal and most people who guide others mean well. These are the patterns that show up when it turns into a con, in every religion’s costume.</p>

          <h3 className="fp-h">Red flags</h3>
          <ul className="fp-flags">
            {redFlags.map((f) => (
              <li key={f}>🚩 {f}</li>
            ))}
          </ul>

          <h3 className="fp-h">Scripts to know</h3>
          <TipGrid tips={scams} accent="orange" />

          <h3 className="fp-h">Real vs fake</h3>
          <div className="compare">
            <div className="compare-head a-lime">✅ real spirituality</div>
            <div className="compare-head a-pink">🚩 exploitation</div>
            {realVsFake.map(([real, fake]) => (
              <div key={real} className="compare-row">
                <span>{real}</span>
                <span>{fake}</span>
              </div>
            ))}
          </div>

          <Voices theme="middlemen" intro="Krishna, Guru Nanak, the Quran, Jesus and the Buddha all warned about the same thing: no middlemen, no fees." />

          <article className="card shloka a-violet">
            <span className="sticker sticker-sm">Sant Kabir</span>
            <p className="deva" lang="hi">
              {'कस्तूरी कुंडल बसै, मृग ढूँढै बन माहि ।\nऐसे घटि घटि राम हैं, दुनिया देखै नाहि ॥'}
            </p>
            <p className="roman">{'kastūrī kunḍal basai, mṛig ḍhūnḍhai ban māhi\naise ghaṭi ghaṭi rām haiṁ, duniyā dekhai nāhi'}</p>
            <p className="meaning">The musk is inside the deer, but it runs around the forest searching for the smell. God is inside every heart, but the world never looks there.</p>
          </article>
        </div>
      </details>

      <Section kicker="already caught in something?" title={<>it’s not your fault. <span className="serif">talk to someone.</span></>}>
        <Callout accent="pink" icon="🛑">
          Stop paying, keep screenshots and receipts, and tell someone you trust. If money or blackmail is involved, you can report it.
        </Callout>
        <div className="call-grid">
          <CallCard line={helplines.cyber} accent="orange" big />
          <CallCard line={helplines.emergency} accent="pink" />
        </div>
      </Section>
    </div>
  )
}

function Card({
  statement,
  mode,
  mine,
  tally,
  error,
  onAnswer,
  onNext,
  onSkip,
}: {
  statement: Statement
  mode: PollMode
  mine: boolean | undefined
  tally: Tally | undefined
  error: string | null
  onAnswer: (yes: boolean) => void
  onNext: () => void
  onSkip: () => void
}) {
  const category = pollCategories.find((c) => c.id === statement.category)
  const has = mine !== undefined
  return (
    <div className="card fp-card" key={statement.id}>
      <span className="fp-cat">
        {category?.emoji} {category?.label}
      </span>
      <p className="fp-text">{statement.text}</p>
      <p className="fp-q">{questionFor(statement.kind)}</p>
      <div className="fp-answers">
        <button type="button" className={`btn fp-btn fp-yes${mine === true ? ' on' : ''}`} aria-pressed={mine === true} onClick={() => onAnswer(true)}>
          Yes
        </button>
        <button type="button" className={`btn fp-btn fp-no${mine === false ? ' on' : ''}`} aria-pressed={mine === false} onClick={() => onAnswer(false)}>
          No
        </button>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {has ? (
        <>
          <Result mode={mode} tally={tally} mine={mine} />
          <div className="fp-actions">
            <button type="button" className="btn btn-primary" onClick={onNext}>
              next →
            </button>
            <span className="fp-note">Tap the other button to change your answer.</span>
          </div>
        </>
      ) : (
        <button type="button" className="fp-skip" onClick={onSkip}>
          skip
        </button>
      )}
    </div>
  )
}

function Result({ mode, tally, mine }: { mode: PollMode; tally: Tally | undefined; mine: boolean }) {
  if (mode !== 'cloud') return <p className="fp-note">Saved on this device. {mode === 'preview' ? 'Results appear when accounts are live.' : 'Log in to see what others say.'}</p>
  const { yesPct, noPct, total } = split(tally ?? { yes: 0, no: 0 })
  if (total < MIN_ANSWERS) {
    return (
      <p className="fp-note" aria-live="polite">
        Not enough answers yet. You’re one of the first. {total} so far, and results show from {MIN_ANSWERS}.
      </p>
    )
  }
  return (
    <div className="fp-result" aria-live="polite">
      <div className="fp-bar" role="img" aria-label={`${yesPct} percent said yes, ${noPct} percent said no, out of ${total} answers`}>
        <span className="fp-bar-yes" style={{ width: `${yesPct}%` }} />
      </div>
      <div className="fp-legend">
        <span className={mine ? 'me' : ''}>
          <b>{yesPct}%</b> yes
        </span>
        <span className={mine ? '' : 'me'}>
          <b>{noPct}%</b> no
        </span>
      </div>
      <p className="fp-note">{total} answers from people here. Not a verdict, just what people say.</p>
    </div>
  )
}

function MyAnswers({ mine, onOpen }: { mine: Record<string, boolean>; onOpen: (s: Statement) => void }) {
  const rows = statements.filter((s) => mine[s.id] !== undefined)
  if (!rows.length) {
    return (
      <div className="card fp-card">
        <p className="fp-note">Nothing yet. Answer a question and it shows up here, only for you.</p>
      </div>
    )
  }
  return (
    <ul className="fp-mine">
      {rows.map((s) => (
        <li key={s.id}>
          <button type="button" className="card fp-row" onClick={() => onOpen(s)}>
            <span className={`fp-pill ${mine[s.id] ? 'yes' : 'no'}`}>{mine[s.id] ? 'Yes' : 'No'}</span>
            <span>{s.text}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
