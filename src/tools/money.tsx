import { useMemo, useState } from 'react'
import { CopyButton } from '../components/ui'
import { log } from '../lib/progress'
import { Card, Choice, Done, Empty, HBars, List, Meter, Num, QuickAdd, Stat, Stats, StackedColumns, compact, inr, shortDate, today, uid, useTool } from './kit'
import { ToolChips } from './links'

// ─── Expense tracker ──────────────────────────────────────────
type Expense = { id: string; date: string; amt: number; cat: string; note: string }
const CATS = [
  { id: 'food', emoji: '🍔', label: 'food' },
  { id: 'travel', emoji: '🚕', label: 'travel' },
  { id: 'shopping', emoji: '🛍️', label: 'shopping' },
  { id: 'bills', emoji: '🧾', label: 'bills' },
  { id: 'fun', emoji: '🎉', label: 'fun' },
  { id: 'health', emoji: '💊', label: 'health' },
  { id: 'study', emoji: '📚', label: 'study' },
  { id: 'other', emoji: '📦', label: 'other' },
]

export function Expenses() {
  const [list, setList] = useTool<Expense[]>('expenses', [])
  const [amt, setAmt] = useState('')
  const [cat, setCat] = useState('food')
  const [note, setNote] = useState('')
  const [month, setMonth] = useState(today().slice(0, 7))
  const inMonth = list.filter((e) => e.date.startsWith(month))
  const total = inMonth.reduce((a, e) => a + e.amt, 0)
  const byCat = CATS.map((c) => ({ label: c.label, emoji: c.emoji, value: inMonth.filter((e) => e.cat === c.id).reduce((a, e) => a + e.amt, 0) }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
  const shiftMonth = (d: number) => {
    const [y, m] = month.split('-').map(Number)
    const dt = new Date(y, m - 1 + d, 1)
    setMonth(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`)
  }
  return (
    <div className="stack">
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          const n = Number(amt)
          if (!n) return
          setList([{ id: uid(), date: today(), amt: n, cat, note: note.trim() }, ...list])
          setAmt('')
          setNote('')
          log('tool', { silent: true })
        }}
      >
        <div className="amount-in">
          <span>₹</span>
          <input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" aria-label="Amount" />
        </div>
        <Choice options={CATS.map((c) => ({ value: c.id, label: `${c.emoji} ${c.label}` }))} value={cat} onChange={setCat} />
        <div className="row gap-sm">
          <input className="grow" value={note} onChange={(e) => setNote(e.target.value)} placeholder="note (optional)" maxLength={40} aria-label="Note" />
          <button type="submit" className="btn btn-primary a-sun" disabled={!Number(amt)}>
            + add
          </button>
        </div>
      </form>
      <div className="row space-between">
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => shiftMonth(-1)}>
          ←
        </button>
        <b>{new Date(`${month}-01T00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => shiftMonth(1)} disabled={month >= today().slice(0, 7)}>
          →
        </button>
      </div>
      <Stats>
        <Stat value={inr(total)} label="spent" />
        <Stat value={inMonth.length} label="expenses" />
      </Stats>
      {byCat.length ? <HBars title="by category" data={byCat} format={inr} /> : <Empty emoji="🧾">Nothing tracked this month.</Empty>}
      {inMonth.length > 0 && <List items={inMonth.slice(0, 12)} onRemove={(x) => setList(list.filter((e) => e.id !== x.id))} render={(e) => `${CATS.find((c) => c.id === e.cat)?.emoji} ${inr(e.amt)} ${e.note && `· ${e.note}`} · ${shortDate(e.date)}`} />}
    </div>
  )
}

// ─── 50/30/20 ─────────────────────────────────────────────────
export function Budget() {
  const [income, setIncome] = useTool('income', 30000)
  const split = [
    { emoji: '🏠', label: 'needs', pct: 50, hint: 'rent, food, travel, bills' },
    { emoji: '🎉', label: 'wants', pct: 30, hint: 'eating out, shopping, fun' },
    { emoji: '🐷', label: 'save / invest', pct: 20, hint: 'pay yourself first' },
  ]
  return (
    <div className="stack">
      <Num label="monthly income / pocket money" value={income} onChange={setIncome} prefix="₹" step={1000} />
      <div className="split-tiles">
        {split.map((s) => (
          <div key={s.label} className="split-tile">
            <span>{s.emoji}</span>
            <b>{inr((income * s.pct) / 100)}</b>
            <small>
              {s.pct}% · {s.label}
            </small>
            <em>{s.hint}</em>
          </div>
        ))}
      </div>
      <Card className="soft">💡 Move the 20% on payday — before you can spend it. Automate it if you can.</Card>
      <ToolChips ids={['expenses', 'sip', 'savings']} />
    </div>
  )
}

// ─── Split the bill ───────────────────────────────────────────
export function Split() {
  const [total, setTotal] = useState(1200)
  const [people, setPeople] = useState<string[]>(['me'])
  const [payer, setPayer] = useState('me')
  const [extra, setExtra] = useState(0)
  const [note, setNote] = useState('dinner')
  const [upi, setUpi] = useTool('my-upi', '')
  const [payerName, setPayerName] = useTool('my-name', '')
  const each = people.length ? (total * (1 + extra / 100)) / people.length : 0
  const owe = people.filter((p) => p !== payer)
  const upiLink = (amount: number) => `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(payerName || payer)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`
  return (
    <div className="stack">
      <div className="two-up">
        <Num label="total bill" value={total} onChange={setTotal} prefix="₹" step={50} />
        <label className="field">
          <span>for</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={30} />
        </label>
      </div>
      <QuickAdd placeholder="add a friend" onAdd={(n) => !people.includes(n) && setPeople([...people, n])} />
      <div className="row gap-sm wrap">
        {people.map((p) => (
          <button key={p} type="button" className={`chip${payer === p ? ' on' : ''}`} onClick={() => setPayer(p)} title="tap to set who paid">
            {payer === p ? '💳 ' : ''}
            {p}
          </button>
        ))}
      </div>
      <p className="muted">tap who paid · {people.length} people</p>
      <Choice options={[0, 5, 10, 18].map((n) => ({ value: n, label: n ? `+${n}% tip/tax` : 'no extra' }))} value={extra} onChange={setExtra} />
      {people.length > 1 && (
        <>
          <div className="verdict ok">
            <b>{inr(each)}</b>
            <span>each</span>
          </div>
          {payer === 'me' && (
            <div className="two-up">
              <label className="field">
                <span>your UPI ID</span>
                <input value={upi} onChange={(e) => setUpi(e.target.value.trim())} placeholder="name@okhdfc" />
              </label>
              <label className="field">
                <span>your name</span>
                <input value={payerName} onChange={(e) => setPayerName(e.target.value)} />
              </label>
            </div>
          )}
          <ul className="tlist">
            {owe.map((p) => {
              const msg = `Hey ${p}! Your share for ${note} is ${inr(each)}.${upi && payer === 'me' ? ` UPI: ${upi}` : ''}`
              return (
                <li key={p}>
                  <span className="grow">
                    <b>{p}</b> owes {payer} {inr(each)}
                  </span>
                  {upi && payer === 'me' && (
                    <a className="btn btn-sm btn-primary a-sun" href={upiLink(each)}>
                      UPI
                    </a>
                  )}
                  <a className="btn btn-sm" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                  <CopyButton text={msg} className="btn btn-sm btn-ghost" />
                </li>
              )
            })}
          </ul>
          <p className="muted">UPI buttons open your UPI app on a phone.</p>
        </>
      )}
    </div>
  )
}

// ─── Subscriptions ────────────────────────────────────────────
type Sub = { id: string; name: string; price: number; cycle: 'm' | 'y'; unused: boolean }
const COMMON = ['Netflix', 'Prime', 'JioHotstar', 'Spotify', 'YouTube Premium', 'iCloud', 'ChatGPT', 'Gym', 'Swiggy One', 'Zomato Gold']

export function Subs() {
  const [subs, setSubs] = useTool<Sub[]>('subs', [])
  const [name, setName] = useState('')
  const [price, setPrice] = useState(199)
  const [cycle, setCycle] = useState<'m' | 'y'>('m')
  const monthly = (s: Sub) => (s.cycle === 'm' ? s.price : s.price / 12)
  const perMonth = subs.reduce((a, s) => a + monthly(s), 0)
  const waste = subs.filter((s) => s.unused).reduce((a, s) => a + monthly(s), 0)
  return (
    <div className="stack">
      <div className="row gap-sm wrap">
        {COMMON.map((c) => (
          <button key={c} type="button" className={`chip${name === c ? ' on' : ''}`} onClick={() => setName(c)}>
            {c}
          </button>
        ))}
      </div>
      <form
        className="row gap-sm wrap"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || !price) return
          setSubs([...subs, { id: uid(), name: name.trim(), price, cycle, unused: false }])
          setName('')
        }}
      >
        <input className="grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="subscription" aria-label="Subscription" />
        <Num label="" value={price} onChange={setPrice} prefix="₹" />
        <Choice
          options={[
            { value: 'm', label: '/month' },
            { value: 'y', label: '/year' },
          ]}
          value={cycle}
          onChange={setCycle}
        />
        <button type="submit" className="btn btn-primary a-sun">
          + add
        </button>
      </form>
      <Stats>
        <Stat value={inr(perMonth)} label="per month" />
        <Stat value={inr(perMonth * 12)} label="per year" />
      </Stats>
      {subs.length ? (
        <List
          items={subs}
          onRemove={(s) => setSubs(subs.filter((x) => x.id !== s.id))}
          render={(s) => (
            <span className="row gap-sm space-between">
              <span>
                <b>{s.name}</b> {inr(s.price)}/{s.cycle === 'm' ? 'mo' : 'yr'}
              </span>
              <button type="button" className={`chip${s.unused ? ' on' : ''}`} onClick={() => setSubs(subs.map((x) => (x.id === s.id ? { ...x, unused: !x.unused } : x)))}>
                {s.unused ? '😴 barely use it' : 'use it?'}
              </button>
            </span>
          )}
        />
      ) : (
        <Empty emoji="🔁">Add every app that charges you. The total is usually a shock.</Empty>
      )}
      {waste > 0 && (
        <div className="verdict warn">
          <b>{inr(waste * 12)}/yr</b>
          <span>on stuff you barely use. cancel = instant raise.</span>
        </div>
      )}
    </div>
  )
}

// ─── Savings goal ─────────────────────────────────────────────
type Goal = { name: string; target: number; deposits: { date: string; amt: number }[] }

export function Savings() {
  const [g, setG] = useTool<Goal | null>('savings-goal', null)
  const [name, setName] = useState('')
  const [target, setTarget] = useState(20000)
  const [dep, setDep] = useState(500)
  if (!g)
    return (
      <div className="stack">
        <input className="task-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="saving for… (new phone, goa trip, laptop)" aria-label="Goal" />
        <Num label="target" value={target} onChange={setTarget} prefix="₹" step={1000} />
        <button type="button" className="btn btn-primary a-sun big-cta" disabled={!name.trim() || !target} onClick={() => setG({ name: name.trim(), target, deposits: [] })}>
          🐷 start saving
        </button>
      </div>
    )
  const saved = g.deposits.reduce((a, d) => a + d.amt, 0)
  const first = g.deposits[g.deposits.length - 1]?.date
  const months = first ? Math.max(1, (Date.now() - new Date(`${first}T00:00`).getTime()) / (30 * 86_400_000)) : 1
  const rate = saved / months
  const eta = rate > 0 ? Math.ceil((g.target - saved) / rate) : null
  return (
    <div className="stack">
      <div className="jar-hero">
        <span>🐷</span>
        <b>{inr(saved)}</b>
        <small>of {inr(g.target)} for {g.name}</small>
      </div>
      <Meter value={saved} max={g.target} />
      {saved >= g.target ? (
        <Done emoji="🎉" title="goal reached! treat yourself (responsibly)." />
      ) : (
        <div className="row gap-sm wrap center">
          <Num label="" value={dep} onChange={setDep} prefix="₹" step={100} />
          <button type="button" className="btn btn-primary a-sun" onClick={() => (setG({ ...g, deposits: [{ date: today(), amt: dep }, ...g.deposits] }), log('tool'))}>
            + add to jar
          </button>
        </div>
      )}
      {eta !== null && saved < g.target && <p className="muted center">at this pace: ~{eta} month{eta === 1 ? '' : 's'} to go</p>}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => confirm('Start a new goal? This one will be cleared.') && setG(null)}>
        new goal
      </button>
    </div>
  )
}

// ─── SIP calculator ───────────────────────────────────────────
const sipValue = (monthly: number, years: number, annual: number) => {
  const r = annual / 12 / 100
  const n = years * 12
  return r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
}

export function Sip() {
  const [monthly, setMonthly] = useTool('sip-amt', 2000)
  const [years, setYears] = useTool('sip-years', 15)
  const [rate, setRate] = useTool('sip-rate', 12)
  const value = sipValue(monthly, years, rate)
  const invested = monthly * years * 12
  const late = sipValue(monthly, Math.max(0, years - 5), rate)
  const data = useMemo(() => Array.from({ length: years }, (_, i) => ({ label: `y${i + 1}`, a: monthly * 12 * (i + 1), b: sipValue(monthly, i + 1, rate) - monthly * 12 * (i + 1) })), [monthly, years, rate])
  return (
    <div className="stack">
      <div className="three-up">
        <Num label="every month" value={monthly} onChange={setMonthly} prefix="₹" step={500} />
        <Num label="for" value={years} onChange={(n) => setYears(Math.min(40, Math.max(1, n)))} suffix="years" />
        <Num label="expected return" value={rate} onChange={(n) => setRate(Math.min(30, n))} suffix="% / yr" step={0.5} />
      </div>
      <Stats>
        <Stat value={compact(invested)} label="you put in" />
        <Stat value={compact(value)} label="it could become" />
        <Stat value={compact(value - invested)} label="growth" />
      </Stats>
      <StackedColumns title="your money, year by year" data={data} names={['invested', 'growth']} format={compact} />
      {years > 5 && (
        <Card className="soft">
          ⏰ Start <b>5 years later</b> and the same SIP becomes <b>{compact(late)}</b> — that’s <b>{compact(value - late)}</b> less. Time beats amount.
        </Card>
      )}
      <p className="muted">Illustration only — market returns aren’t guaranteed and can be negative. Not investment advice.</p>
    </div>
  )
}

// ─── CTC → in-hand ────────────────────────────────────────────
// New tax regime, FY 2025-26 slabs (Budget 2025). Estimate only.
function newRegimeTax(taxable: number) {
  const slabs: [number, number][] = [
    [400000, 0],
    [800000, 0.05],
    [1200000, 0.1],
    [1600000, 0.15],
    [2000000, 0.2],
    [2400000, 0.25],
    [Infinity, 0.3],
  ]
  let tax = 0
  let prev = 0
  for (const [upto, rate] of slabs) {
    if (taxable > prev) tax += (Math.min(taxable, upto) - prev) * rate
    prev = upto
  }
  if (taxable <= 1200000) tax = 0 // section 87A rebate
  else tax = Math.min(tax, taxable - 1200000) // marginal relief just above ₹12L
  return tax * 1.04 // 4% health & education cess
}

export function Salary() {
  const [ctc, setCtc] = useTool('ctc', 800000)
  const [basicPct, setBasicPct] = useTool('basic-pct', 50)
  const [gratuity, setGratuity] = useTool('gratuity-in-ctc', true)
  const basic = (ctc * basicPct) / 100
  const pf = basic * 0.12
  const grat = gratuity ? basic * 0.0481 : 0
  const gross = ctc - pf - grat
  const taxable = Math.max(0, gross - 75000)
  const tax = newRegimeTax(taxable)
  const pt = 2400
  const inHand = gross - pf - pt - tax
  const rows = [
    ['CTC', ctc],
    ['− employer PF (12% of basic)', -pf],
    ...(gratuity ? [['− gratuity (4.81% of basic)', -grat] as [string, number]] : []),
    ['− your PF (12% of basic)', -pf],
    ['− professional tax (approx)', -pt],
    ['− income tax (new regime)', -tax],
  ] as [string, number][]
  return (
    <div className="stack">
      <Num label="annual CTC" value={ctc} onChange={setCtc} prefix="₹" step={50000} />
      <Choice options={[40, 50].map((p) => ({ value: p, label: `basic = ${p}% of CTC` }))} value={basicPct} onChange={setBasicPct} />
      <label className="toggle">
        <input type="checkbox" checked={gratuity} onChange={(e) => setGratuity(e.target.checked)} />
        <span>gratuity is part of my CTC</span>
      </label>
      <div className="verdict ok">
        <b>{inr(inHand / 12)}</b>
        <span>per month in your bank (approx)</span>
      </div>
      <ul className="tlist calc">
        {rows.map(([k, v]) => (
          <li key={k}>
            <span className="grow">{k}</span>
            <b>{inr(v)}</b>
          </li>
        ))}
        <li>
          <span className="grow">
            <b>= in-hand per year</b>
          </span>
          <b>{inr(inHand)}</b>
        </li>
      </ul>
      <p className="muted">Estimate using FY 2025-26 new-regime slabs, ₹75k standard deduction and the ₹12L rebate. Excludes surcharge, bonuses and variable pay. Check your offer letter’s breakup.</p>
    </div>
  )
}

// ─── Is it worth it? ──────────────────────────────────────────
export function WorthIt() {
  const [price, setPrice] = useState(4999)
  const [income, setIncome] = useTool('income', 30000)
  const [hoursWk, setHoursWk] = useTool('hours-week', 45)
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null)
  const hourly = income / (hoursWk * 4.33)
  const hours = hourly > 0 ? price / hourly : 0
  const later = price * Math.pow(1.12, 10)
  return (
    <div className="stack">
      <Num label="the price" value={price} onChange={setPrice} prefix="₹" step={100} />
      <div className="two-up">
        <Num label="monthly income" value={income} onChange={setIncome} prefix="₹" step={1000} />
        <Num label="hours you work / week" value={hoursWk} onChange={setHoursWk} suffix="h" />
      </div>
      <div className="verdict warn">
        <b>{hours < 1 ? `${Math.round(hours * 60)} min` : `${hours.toFixed(1)} hours`}</b>
        <span>of your life{hours >= 8 ? ` · ${(hours / 8).toFixed(1)} full work days` : ''}</span>
      </div>
      <p className="muted center">invested for 10 years at ~12%, it could be {inr(later)}</p>
      <p className="big-q center">still worth {hours < 1 ? 'that' : 'those hours'}?</p>
      <Choice
        big
        options={[
          { value: 'yes', label: '😍 yes, I’ll use it a lot' },
          { value: 'no', label: '🙅 nah, skip' },
        ]}
        value={answer}
        onChange={setAnswer}
      />
      {answer === 'yes' && <Card className="soft">Then buy it guilt-free. Money is for living. Try waiting 48 hours first if it’s over a day’s pay.</Card>}
      {answer === 'no' && (
        <Card className="soft">
          🎉 You just saved {inr(price)}. <ToolChips ids={['savings']} title="put it somewhere" />
        </Card>
      )}
    </div>
  )
}
