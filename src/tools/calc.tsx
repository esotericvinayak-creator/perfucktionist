// General-purpose tools: Quick maths, ROI & growth, Screen time.
// Number tools lead with one big result + a plain sentence; styles are the `calc-*` block at the end of home.css.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { log } from '../lib/progress'
import { Choice, Columns, Meter, Num, StackedColumns, Text, addDays, lastDays, today, useTool } from './kit'

// ─── formatting (Indian grouping, never NaN / Infinity) ──────────────
function fnum(n: number, d = 2) {
  if (!Number.isFinite(n)) return '0'
  const v = Math.abs(n) < 0.5 * 10 ** -d ? 0 : n
  return v.toLocaleString('en-IN', { maximumFractionDigits: d }).replace('-', '−')
}
const rs = (n: number, d = 2) => `${n < 0 ? '−' : ''}₹${fnum(Math.abs(n), d)}`
/** ₹ with lakh / crore shorthand, sign-safe. */
function rsc(n: number) {
  if (!Number.isFinite(n)) return '₹0'
  const a = Math.abs(n)
  const s = n < 0 ? '−' : ''
  if (a >= 1e7) return `${s}₹${fnum(a / 1e7, 2)} Cr`
  if (a >= 1e5) return `${s}₹${fnum(a / 1e5, 2)} L`
  return rs(n, 0)
}
const pc = (n: number, d = 1, plus = false) => {
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 100000) return `${n < 0 ? '−' : '+'}100,000%+`
  return `${plus && n > 0 ? '+' : ''}${fnum(n, d)}%`
}
const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo)

/** Logs one 'tool' activity the first time the user does something that produces a result each day. */
function useLogOnce(id: string, ready: boolean) {
  const [last, setLast] = useTool(`${id}-logged`, '')
  const touched = useRef(false)
  useEffect(() => {
    if (touched.current && ready && last !== today()) {
      setLast(today())
      log('tool')
    }
  })
  return () => {
    touched.current = true
  }
}

type Row = [string, string]
function Result({ label, value, sentence, rows, children }: { label: string; value: string; sentence?: ReactNode; rows?: Row[]; children?: ReactNode }) {
  return (
    <div className="calc-result" aria-live="polite">
      <span className="calc-label">{label}</span>
      <b className={`calc-big${value.length > 11 ? ' long' : ''}`}>{value}</b>
      {sentence && <p className="calc-line">{sentence}</p>}
      {children}
      {rows && rows.length > 0 && (
        <div className="calc-rows">
          {rows.map(([k, v]) => (
            <div className="calc-row" key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Waiting({ children }: { children: ReactNode }) {
  return (
    <div className="calc-result calc-waiting">
      <p className="calc-line">{children}</p>
    </div>
  )
}

// ═════════════════════════ Quick maths ═════════════════════════
type MathMode = 'of' | 'is' | 'change' | 'price' | 'split'
type PriceSub = 'discount' | 'gst' | 'ungst' | 'tip'
type SplitSub = 'split' | 'avg'
type MathState = { pct: number; base: number; x: number; y: number; a: number; b: number; price: number; disc: number; rate: number; tip: number; amount: number; people: number; splitTip: number; text: string }
const MATH_INIT: MathState = { pct: 15, base: 1200, x: 30, y: 120, a: 800, b: 1000, price: 1200, disc: 15, rate: 18, tip: 10, amount: 1500, people: 4, splitTip: 0, text: '120, 80, 95, 110' }

const parseNums = (s: string) => (s.match(/-?\d*\.?\d+/g) ?? []).map(Number).filter(Number.isFinite)

export function QuickMaths() {
  const [mode, setMode] = useTool<MathMode>('maths-mode', 'of')
  const [psub, setPsub] = useTool<PriceSub>('maths-price-sub', 'discount')
  const [ssub, setSsub] = useTool<SplitSub>('maths-split-sub', 'split')
  const [s, setS] = useState<MathState>(MATH_INIT)

  const [ready, setReady] = useState(false)
  const mark = useLogOnce('maths', ready)
  const num = (k: keyof MathState) => (n: number) => {
    mark()
    setS((p) => ({ ...p, [k]: n }))
  }

  let inputs: ReactNode = null
  let result: ReactNode = null
  let ok = false

  if (mode === 'of') {
    inputs = (
      <div className="three-up">
        <Num label="percent" value={s.pct} onChange={num('pct')} suffix="%" step={0.5} />
        <Num label="of" value={s.base} onChange={num('base')} step={10} />
      </div>
    )
    const r = (s.pct * s.base) / 100
    ok = true
    result = <Result label={`${fnum(s.pct)}% of ${fnum(s.base)}`} value={fnum(r)} sentence={`${fnum(s.pct)}% of ${fnum(s.base)} is ${fnum(r)}.`} />
  } else if (mode === 'is') {
    inputs = (
      <div className="three-up">
        <Num label="this number" value={s.x} onChange={num('x')} step={1} />
        <Num label="out of" value={s.y} onChange={num('y')} step={1} />
      </div>
    )
    if (s.y === 0) result = <Waiting>Put a number above zero in “out of” to see the percent.</Waiting>
    else {
      const r = (s.x / s.y) * 100
      ok = true
      result = <Result label={`${fnum(s.x)} is what % of ${fnum(s.y)}`} value={pc(r, 2)} sentence={`${fnum(s.x)} is ${pc(r, 2)} of ${fnum(s.y)}.`} />
    }
  } else if (mode === 'change') {
    inputs = (
      <div className="three-up">
        <Num label="from" value={s.a} onChange={num('a')} step={10} />
        <Num label="to" value={s.b} onChange={num('b')} step={10} />
      </div>
    )
    const diff = s.b - s.a
    const word = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'change'
    if (s.a === 0) {
      ok = diff !== 0
      result = diff === 0 ? <Waiting>Both numbers are zero, so nothing changed.</Waiting> : <Result label="change" value={`${diff > 0 ? '+' : '−'}${fnum(Math.abs(diff))}`} sentence="Starting from zero there’s no percentage to show, only the difference." />
    } else {
      const r = (diff / Math.abs(s.a)) * 100
      ok = true
      result = (
        <Result
          label={diff === 0 ? 'no change' : `${word} of`}
          value={pc(r, 2, true)}
          sentence={diff === 0 ? `${fnum(s.a)} to ${fnum(s.b)} is no change.` : `Going from ${fnum(s.a)} to ${fnum(s.b)} is ${article(word)} ${word} of ${fnum(Math.abs(diff))} (${pc(Math.abs(r), 2)}).`}
          rows={[
            ['difference', `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${fnum(Math.abs(diff))}`],
            ['to get back', diff === 0 ? '0%' : pc((-diff / Math.abs(s.b || 1)) * 100, 1, true)],
          ]}
        />
      )
    }
  } else if (mode === 'price') {
    const pick = (
      <Choice
        value={psub}
        onChange={setPsub}
        options={[
          { value: 'discount', label: 'discount' },
          { value: 'gst', label: 'add GST' },
          { value: 'ungst', label: 'remove GST' },
          { value: 'tip', label: 'tip' },
        ]}
      />
    )
    if (psub === 'discount') {
      inputs = (
        <>
          {pick}
          <div className="three-up">
            <Num label="price" value={s.price} onChange={num('price')} prefix="₹" step={50} />
            <Num label="discount" value={s.disc} onChange={num('disc')} suffix="%" step={5} />
          </div>
        </>
      )
      if (s.disc > 100) result = <Waiting>A discount can’t be more than 100%.</Waiting>
      else {
        const fin = s.price * (1 - s.disc / 100)
        const saved = s.price - fin
        ok = s.price > 0
        result = <Result label="you pay" value={rs(fin)} sentence={`${rs(s.price)} − ${fnum(s.disc)}% = ${rs(fin)}, you save ${rs(saved)}.`} rows={[['you save', rs(saved)]]} />
      }
    } else if (psub === 'gst' || psub === 'ungst') {
      inputs = (
        <>
          {pick}
          <Num label={psub === 'gst' ? 'price before GST' : 'price with GST included'} value={s.price} onChange={num('price')} prefix="₹" step={50} />
          <Choice value={s.rate} onChange={num('rate')} options={[5, 18, 40].map((r) => ({ value: r, label: `${r}%` }))} />
          <Num label="or your own GST rate" value={s.rate} onChange={num('rate')} suffix="%" step={0.5} />
        </>
      )
      ok = s.price > 0
      if (psub === 'gst') {
        const tax = (s.price * s.rate) / 100
        result = (
          <Result
            label="price with GST"
            value={rs(s.price + tax)}
            sentence={`${rs(s.price)} + ${fnum(s.rate)}% GST = ${rs(s.price + tax)}. The GST part is ${rs(tax)}.`}
            rows={[
              ['GST', rs(tax)],
              ['CGST + SGST, each', rs(tax / 2)],
            ]}
          />
        )
      } else {
        const base = s.price / (1 + s.rate / 100)
        const tax = s.price - base
        result = (
          <Result
            label="price before GST"
            value={rs(base)}
            sentence={`Of ${rs(s.price)}, ${rs(base)} is the real price and ${rs(tax)} is ${fnum(s.rate)}% GST.`}
            rows={[
              ['GST inside the price', rs(tax)],
              ['CGST + SGST, each', rs(tax / 2)],
            ]}
          />
        )
      }
    } else {
      inputs = (
        <>
          {pick}
          <Num label="bill" value={s.price} onChange={num('price')} prefix="₹" step={50} />
          <Choice value={s.tip} onChange={num('tip')} options={[5, 10, 15, 20].map((r) => ({ value: r, label: `${r}%` }))} />
          <Num label="or your own tip" value={s.tip} onChange={num('tip')} suffix="%" step={1} />
        </>
      )
      const tip = (s.price * s.tip) / 100
      ok = s.price > 0
      result = <Result label="total with tip" value={rs(s.price + tip)} sentence={`A ${fnum(s.tip)}% tip on ${rs(s.price)} is ${rs(tip)}, so you pay ${rs(s.price + tip)}.`} rows={[['tip', rs(tip)]]} />
    }
  } else {
    const pick = (
      <Choice
        value={ssub}
        onChange={setSsub}
        options={[
          { value: 'split', label: 'split a bill' },
          { value: 'avg', label: 'average' },
        ]}
      />
    )
    if (ssub === 'split') {
      inputs = (
        <>
          {pick}
          <div className="three-up">
            <Num label="amount" value={s.amount} onChange={num('amount')} prefix="₹" step={100} />
            <Num label="people" value={s.people} onChange={(n) => num('people')(clamp(Math.round(n), 1, 999))} min={1} />
            <Num label="tip (optional)" value={s.splitTip} onChange={num('splitTip')} suffix="%" step={5} />
          </div>
        </>
      )
      const people = clamp(Math.round(s.people), 1, 999)
      const total = s.amount * (1 + s.splitTip / 100)
      ok = s.amount > 0
      result = (
        <Result
          label="each person pays"
          value={rs(total / people)}
          sentence={`${rs(s.amount)}${s.splitTip > 0 ? ` + ${fnum(s.splitTip)}% tip` : ''} split ${people} ${people === 1 ? 'way' : 'ways'} is ${rs(total / people)} each.`}
          rows={s.splitTip > 0 ? [['total with tip', rs(total)], ['tip', rs(total - s.amount)]] : [['total', rs(total)]]}
        />
      )
    } else {
      inputs = (
        <>
          {pick}
          <Text label="numbers, separated by commas or spaces" value={s.text} onChange={(t) => (mark(), setS((p) => ({ ...p, text: t })))} placeholder="e.g. 72, 85, 91, 64" max={800} />
        </>
      )
      const list = parseNums(s.text)
      if (list.length === 0) result = <Waiting>Type a few numbers above, like 72, 85, 91.</Waiting>
      else {
        const sum = list.reduce((x, y) => x + y, 0)
        const avg = sum / list.length
        ok = true
        result = (
          <Result
            label={`average of ${list.length} ${list.length === 1 ? 'number' : 'numbers'}`}
            value={fnum(avg)}
            sentence={`${fnum(sum)} divided by ${list.length} is ${fnum(avg)}.`}
            rows={[
              ['total', fnum(sum)],
              ['lowest', fnum(Math.min(...list))],
              ['highest', fnum(Math.max(...list))],
            ]}
          />
        )
      }
    }
  }

  if (ok !== ready) setReady(ok)

  return (
    <div className="calc-wrap">
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { value: 'of', label: '% of' },
          { value: 'is', label: 'is what %' },
          { value: 'change', label: '% change' },
          { value: 'price', label: 'discount / GST' },
          { value: 'split', label: 'split & average' },
        ]}
      />
      <div className="calc-inputs">{inputs}</div>
      {result}
    </div>
  )
}
const article = (w: string) => (/^[aeiou]/.test(w) ? 'an' : 'a')

// ═════════════════════════ ROI & growth ═════════════════════════
type RoiMode = 'paid' | 'grow'

function project(start: number, monthly: number, rate: number, years: number) {
  const r = rate / 1200
  let v = start
  const rows: { label: string; a: number; b: number }[] = []
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) v = v * (1 + r) + monthly
    const invested = start + monthly * 12 * y
    rows.push({ label: `y${y}`, a: invested, b: Math.max(0, v - invested) })
  }
  return { final: v, rows }
}

export function Roi() {
  const [mode, setMode] = useTool<RoiMode>('roi-mode', 'paid')
  const [inAmt, setIn] = useTool('roi-in', 100000)
  const [outAmt, setOut] = useTool('roi-out', 135000)
  const [fees, setFees] = useTool('roi-fees', 0)
  const [years, setYears] = useTool('roi-years', 3)
  const [infl, setInfl] = useTool('roi-infl', 6)
  const [start, setStart] = useTool('roi-grow-start', 50000)
  const [monthly, setMonthly] = useTool('roi-grow-monthly', 5000)
  const [rate, setRate] = useTool('roi-grow-rate', 12)
  const [gyears, setGyears] = useTool('roi-grow-years', 10)

  const cost = Math.max(0, inAmt) + Math.max(0, fees)
  const paidOk = cost > 0
  const growOk = start + monthly > 0
  const mark = useLogOnce('roi', mode === 'paid' ? paidOk : growOk)
  const set = (f: (n: number) => void) => (n: number) => {
    mark()
    f(n)
  }

  const g = useMemo(() => {
    const y = clamp(Math.round(gyears), 1, 60)
    const r = clamp(rate, 0, 40)
    return { y, r, ...project(Math.max(0, start), Math.max(0, monthly), r, y) }
  }, [start, monthly, rate, gyears])

  let body: ReactNode
  if (mode === 'paid') {
    const gain = outAmt - cost
    const roi = paidOk ? (gain / cost) * 100 : 0
    const y = years > 0 ? years : 0
    const cagr = paidOk && y > 0 ? (outAmt <= 0 ? -100 : (Math.pow(outAmt / cost, 1 / y) - 1) * 100) : null
    const real = cagr === null ? null : ((1 + cagr / 100) / (1 + clamp(infl, 0, 100) / 100) - 1) * 100
    const verdictWord = gain > 0 ? 'you made' : gain < 0 ? 'you lost' : 'you broke even'
    let sentence: string
    if (!paidOk) sentence = ''
    else if (gain === 0) sentence = `You got back exactly what you put in${fees > 0 ? ', fees included' : ''}.`
    else {
      sentence = `You ${gain > 0 ? 'made' : 'lost'} ${rs(Math.abs(gain), 0)} on ${rs(cost, 0)}`
      if (cagr !== null && real !== null) {
        sentence += ` — about ${pc(Math.abs(cagr))} a year${cagr < 0 ? ' down' : ''}, roughly ${pc(real, 1)} after inflation`
        if (gain > 0 && real < 0) sentence += `, so prices rose faster than your money did`
      } else sentence += ` — ${pc(Math.abs(roi))} ${gain > 0 ? 'up' : 'down'} overall`
      sentence += '.'
    }
    body = (
      <>
        <div className="three-up">
          <Num label="you put in" value={inAmt} onChange={set(setIn)} prefix="₹" step={5000} />
          <Num label="worth now / sold for" value={outAmt} onChange={set(setOut)} prefix="₹" step={5000} />
          <Num label="extra costs or fees" value={fees} onChange={set(setFees)} prefix="₹" step={500} />
        </div>
        <div className="three-up">
          <Num label="years held (optional)" value={years} onChange={set(setYears)} suffix="yrs" step={0.5} />
          <Num label="inflation a year" value={infl} onChange={set(setInfl)} suffix="%" step={0.5} />
        </div>
        {!paidOk ? (
          <Waiting>Enter what you put in and we’ll work out how it went.</Waiting>
        ) : (
          <Result
            label={verdictWord}
            value={gain === 0 ? '₹0' : `${gain > 0 ? '+' : '−'}${rs(Math.abs(gain), 0)}`}
            sentence={sentence}
            rows={[
              ['return on what you put in', pc(roi, 1, true)],
              ['per year (CAGR)', cagr === null ? 'add years held' : pc(cagr, 1, true)],
              ['after inflation, per year', real === null ? 'add years held' : pc(real, 1, true)],
              ...(fees > 0 ? ([['total cost incl. fees', rs(cost, 0)]] as Row[]) : []),
            ]}
          >
            {cagr !== null && y < 1 && <p className="muted">Under a year, “per year” numbers can look dramatic. Treat them with a pinch of salt.</p>}
          </Result>
        )}
      </>
    )
  } else {
    const invested = Math.max(0, start) + Math.max(0, monthly) * 12 * g.y
    const growth = Math.max(0, g.final - invested)
    const double = g.r > 0 ? 72 / g.r : null
    body = (
      <>
        <div className="three-up">
          <Num label="starting amount" value={start} onChange={set(setStart)} prefix="₹" step={5000} />
          <Num label="add every month" value={monthly} onChange={set(setMonthly)} prefix="₹" step={500} />
          <Num label="return a year" value={rate} onChange={set(setRate)} suffix="%" step={0.5} max={40} />
          <Num label="for" value={gyears} onChange={set(setGyears)} suffix="yrs" min={1} max={60} />
        </div>
        {!growOk ? (
          <Waiting>Add a starting amount or a monthly amount to see where it could go.</Waiting>
        ) : (
          <>
            <Result
              label={`it could become, in ${g.y} ${g.y === 1 ? 'year' : 'years'}`}
              value={rsc(g.final)}
              sentence={`Put in ${rsc(invested)} over ${g.y} ${g.y === 1 ? 'year' : 'years'} and, at ${fnum(g.r)}% a year, it could grow to about ${rsc(g.final)} — ${rsc(growth)} of that is growth.`}
              rows={[
                ['you put in', rsc(invested)],
                ['growth', rsc(growth)],
                ['doubles roughly every', double === null ? 'never at 0%' : `${fnum(double, 1)} years`],
              ]}
            >
              <p className="muted">{double === null ? 'At 0% a year your money stays as it is.' : `Rule of 72: 72 ÷ ${fnum(g.r)} ≈ ${fnum(double, 1)} years to double.`}</p>
            </Result>
            <StackedColumns title="year by year" data={g.rows} names={['you put in', 'growth']} format={rsc} />
          </>
        )}
        <p className="muted">Illustration only — returns aren’t guaranteed, this isn’t advice.</p>
      </>
    )
  }

  return (
    <div className="calc-wrap">
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { value: 'paid', label: 'Did it pay off?' },
          { value: 'grow', label: 'Grow it' },
        ]}
      />
      {body}
    </div>
  )
}

// ═════════════════════════ Screen time ═════════════════════════
type Entry = { total: number; parts?: Record<string, number> }
const CATS: { id: string; emoji: string; label: string }[] = [
  { id: 'social', emoji: '💬', label: 'social' },
  { id: 'video', emoji: '📺', label: 'video' },
  { id: 'games', emoji: '🎮', label: 'games' },
  { id: 'work', emoji: '📚', label: 'work / study' },
]

function dur(min: number) {
  const m = Math.max(0, Math.round(min))
  const h = Math.floor(m / 60)
  const r = m % 60
  return h === 0 ? `${r}m` : r === 0 ? `${h}h` : `${h}h ${r}m`
}
const weekday = (key: string) => new Date(`${key}T00:00`).toLocaleDateString('en-IN', { weekday: 'short' })

function Stepper({ emoji, label, value, onChange }: { emoji: string; label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="calc-cat">
      <span>
        <i aria-hidden="true">{emoji}</i> {label}
      </span>
      <span className="calc-stepper">
        <button type="button" aria-label={`less ${label}`} disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 15))}>
          −
        </button>
        <b>{dur(value)}</b>
        <button type="button" aria-label={`more ${label}`} disabled={value >= 1440} onClick={() => onChange(Math.min(1440, value + 15))}>
          +
        </button>
      </span>
    </div>
  )
}

export function ScreenTime() {
  const [data, setData] = useTool<Record<string, Entry>>('screen-time', {})
  const [goalRaw, setGoal] = useTool('screen-time-goal', 180)
  const goal = clamp(Math.round(goalRaw), 15, 1440)
  const t = today()
  const entry = data[t]
  const mark = useLogOnce('screen-time', !!entry)

  const save = (e: Entry | null) => {
    mark()
    const next = { ...data }
    if (e) next[t] = e
    else delete next[t]
    setData(next)
  }
  const total = entry?.total ?? 0
  const parts = entry?.parts ?? {}
  const partsSum = Object.values(parts).reduce((x, y) => x + y, 0)
  const setTotal = (h: number, m: number) => save({ ...entry, total: clamp(Math.round(h) * 60 + Math.round(m), 0, 1440) })
  const setPart = (id: string, v: number) => {
    const np = { ...parts, [id]: v }
    const sum = Object.values(np).reduce((x, y) => x + y, 0)
    save({ total: Math.max(total, sum), parts: np })
  }

  const week = lastDays(7)
  const prev = lastDays(14).slice(0, 7)
  const avgOf = (days: string[]) => {
    const xs = days.map((d) => data[d]?.total).filter((v): v is number => typeof v === 'number' && v > 0)
    return xs.length ? { avg: xs.reduce((x, y) => x + y, 0) / xs.length, n: xs.length } : null
  }
  const thisW = avgOf(week)
  const lastW = avgOf(prev)

  const catTotals = CATS.map((c) => ({ ...c, min: week.reduce((s, d) => s + (data[d]?.parts?.[c.id] ?? 0), 0) }))
  const catSum = catTotals.reduce((s, c) => s + c.min, 0)
  const top = catSum > 0 ? catTotals.reduce((m, c) => (c.min > m.min ? c : m)) : null

  let streak = 0
  for (let d = entry ? t : week[5]; data[d] && data[d].total <= goal; d = addDays(d, -1)) streak++

  const left = goal - total
  const chart = week.map((d) => ({ label: d === t ? 'today' : weekday(d), value: data[d]?.total ?? 0 }))

  let weekLine: string | null = null
  if (thisW && lastW) {
    const diff = thisW.avg - lastW.avg
    weekLine = Math.abs(diff) < 5 ? `You’re averaging about the same as the week before (${dur(thisW.avg)} a day).` : `You’re averaging ${dur(thisW.avg)} a day, ${diff < 0 ? 'down' : 'up'} ${dur(Math.abs(diff))} a day from the week before (${dur(lastW.avg)}).`
  } else if (thisW) weekLine = `You’re averaging ${dur(thisW.avg)} a day over ${thisW.n} logged ${thisW.n === 1 ? 'day' : 'days'}. Log a few more days to see how it compares week to week.`

  return (
    <div className="calc-wrap">
      <div className="calc-note">
        <p>
          <b>Your phone already counts this. Check it, then log it here.</b> This app can’t see your other apps, so everything below is what you type in.
        </p>
        <details className="calc-how">
          <summary>Android</summary>
          <p>Settings → Digital Wellbeing &amp; parental controls</p>
        </details>
        <details className="calc-how">
          <summary>iPhone</summary>
          <p>Settings → Screen Time</p>
        </details>
      </div>

      <div className="stack">
        <span className="calc-label">today’s total (you can edit this all day)</span>
        <div className="three-up">
          <Num label="hours" value={Math.floor(total / 60)} onChange={(h) => setTotal(h, total % 60)} suffix="h" max={24} />
          <Num label="minutes" value={total % 60} onChange={(m) => setTotal(Math.floor(total / 60), m)} suffix="min" max={59} step={5} />
        </div>
        <details className="calc-how" open={!!entry?.parts}>
          <summary>Split it up (optional)</summary>
          <div className="calc-cats">
            {CATS.map((c) => (
              <Stepper key={c.id} emoji={c.emoji} label={c.label} value={parts[c.id] ?? 0} onChange={(v) => setPart(c.id, v)} />
            ))}
            {partsSum > total && <p className="muted">Your split adds up to more than the total — raise the total to match.</p>}
          </div>
        </details>
        {entry && (
          <button type="button" className="btn btn-ghost calc-clear" onClick={() => save(null)}>
            clear today
          </button>
        )}
      </div>

      {entry ? (
        <Result
          label="today so far"
          value={dur(total)}
          sentence={total <= goal ? `That’s ${dur(Math.max(0, left))} under your ${dur(goal)} goal. Nice one — that counts.` : `${dur(total - goal)} over your ${dur(goal)} goal today, and that’s okay. One small thing that can help: try phone-down mode in this app for an hour tonight.`}
        >
          <Meter value={total} max={goal} tone={total <= goal ? 'ok' : 'warn'} />
          <div className="calc-meter-scale">
            <span>0</span>
            <span>goal {dur(goal)}</span>
          </div>
          {streak >= 2 && <p className="muted">{streak} days in a row at or under your goal.</p>}
        </Result>
      ) : (
        <Waiting>Nothing logged for today yet. Pop in your total from Screen Time above and it shows up here.</Waiting>
      )}

      <div className="stack">
        <span className="calc-label">your daily goal</span>
        <Choice value={goal} onChange={setGoal} options={[60, 120, 180, 240].map((m) => ({ value: m, label: dur(m) }))} />
        <Num label="or set it in minutes" value={goal} onChange={(n) => setGoal(clamp(Math.round(n), 15, 1440))} suffix="min" step={15} min={15} max={1440} />
      </div>

      <Columns title={`last 7 days (goal ${dur(goal)})`} data={chart} format={dur} />
      {weekLine && <p className="calc-line">{weekLine}</p>}
      {top && (
        <p className="calc-line">
          Biggest slice this week: <b>{top.emoji} {top.label}</b>, {dur(top.min)} ({fnum((top.min / catSum) * 100, 0)}% of what you split up).
        </p>
      )}
      {thisW && (
        <div className="tcard soft">
          At about {dur(thisW.avg)} a day, that’s roughly <b>{fnum((thisW.avg * 365) / 1440, 0)} days a year</b> on screens. Just a number to know, not a reason to panic.
        </div>
      )}
    </div>
  )
}
