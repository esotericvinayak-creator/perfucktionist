// Leak Check: turns a UPI or bank statement into a list of what's quietly draining your money.
// Everything here runs on the device. The statement is never uploaded or saved.
//
// Statements differ a lot, so this reads patterns instead of one fixed layout:
//   PhonePe / Google Pay / Paytm: "Mar 30, 2025  Paid to SWIGGY  DEBIT  ₹250"
//   Banks:                        "30/03/2025  UPI-SWIGGY-swiggy@axis-...  250.00  12,340.50"
// A row starts at a date. The amount comes from a ₹ sign, or from the amount and balance columns.

export type Tx = { date: string; minutes: number | null; name: string; key: string; amount: number; dir: 'out' | 'in'; cat: Cat; fee: boolean }

export type Cat = 'food' | 'quick' | 'cabs' | 'shopping' | 'subs' | 'recharge' | 'credit' | 'other'

export const CATS: Record<Cat, string> = {
  food: 'food delivery',
  quick: 'quick commerce',
  cabs: 'cabs and rides',
  shopping: 'online shopping',
  subs: 'subscriptions',
  recharge: 'recharges',
  credit: 'pay later and EMIs',
  other: 'everything else',
}

export type LeakItem = { key: string; name: string; kind: 'sub' | 'repeat' | 'fee'; monthly: number; total: number; count: number; last: string }
export type Double = { key: string; name: string; amount: number; date: string }
export type Report = {
  from: string
  to: string
  months: number
  txCount: number
  spent: number
  received: number
  items: LeakItem[]
  doubles: Double[]
  cats: { id: Cat; label: string; total: number; count: number }[]
  credit: { name: string; total: number; count: number }[]
  /** The one change that saves the most, if there is one worth suggesting. */
  tip: { label: string; perOrder: number; perYear: number } | null
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const MON = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?'
const DATE_FORMS: { re: RegExp; read: (m: RegExpExecArray) => [number, number, number] }[] = [
  { re: new RegExp(`\\b(${MON})[ .-]+(\\d{1,2}),?[ .-]+(\\d{4})\\b`, 'i'), read: (m) => [Number(m[3]), monthOf(m[1]), Number(m[2])] },
  { re: new RegExp(`\\b(\\d{1,2})[ ./-]+(${MON})[ .,/-]+(\\d{2,4})\\b`, 'i'), read: (m) => [fullYear(m[3]), monthOf(m[2]), Number(m[1])] },
  { re: /\b(\d{4})-(\d{2})-(\d{2})\b/, read: (m) => [Number(m[1]), Number(m[2]), Number(m[3])] },
  { re: /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/, read: (m) => [fullYear(m[3]), Number(m[2]), Number(m[1])] },
]

function monthOf(s: string) {
  return MONTHS.indexOf(s.slice(0, 3).toLowerCase()) + 1
}
function fullYear(s: string) {
  const n = Number(s)
  return n < 100 ? 2000 + n : n
}
const pad = (n: number) => String(n).padStart(2, '0')

/** The first date in a line of text. */
function findDate(line: string): { iso: string; index: number; end: number } | null {
  let best: { iso: string; index: number; end: number } | null = null
  for (const form of DATE_FORMS) {
    const m = form.re.exec(line)
    if (!m) continue
    const [y, mo, d] = form.read(m)
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) continue
    if (!best || m.index < best.index) best = { iso: `${y}-${pad(mo)}-${pad(d)}`, index: m.index, end: m.index + m[0].length }
  }
  return best
}

// ─── who got the money ────────────────────────────────────────
const KNOWN: [RegExp, string, Cat][] = [
  [/swiggy\s*(instamart)|instamart/i, 'Swiggy Instamart', 'quick'],
  [/swiggy/i, 'Swiggy', 'food'],
  [/zomato/i, 'Zomato', 'food'],
  [/eatsure|domino|pizza ?hut|\bkfc\b|mcdonald/i, 'Food order', 'food'],
  [/blinkit|grofers/i, 'Blinkit', 'quick'],
  [/zepto/i, 'Zepto', 'quick'],
  [/bigbasket|bbnow/i, 'BigBasket', 'quick'],
  [/\buber\b/i, 'Uber', 'cabs'],
  [/\bola\b|olacabs|ani technologies/i, 'Ola', 'cabs'],
  [/rapido|roppen/i, 'Rapido', 'cabs'],
  [/amazon ?prime|prime ?video|primevideo/i, 'Amazon Prime', 'subs'],
  [/amazon/i, 'Amazon', 'shopping'],
  [/flipkart/i, 'Flipkart', 'shopping'],
  [/myntra/i, 'Myntra', 'shopping'],
  [/ajio/i, 'Ajio', 'shopping'],
  [/meesho/i, 'Meesho', 'shopping'],
  [/nykaa/i, 'Nykaa', 'shopping'],
  [/netflix/i, 'Netflix', 'subs'],
  [/spotify/i, 'Spotify', 'subs'],
  [/youtube/i, 'YouTube Premium', 'subs'],
  [/hotstar|jiostar|jio ?hotstar/i, 'JioHotstar', 'subs'],
  [/sony ?liv/i, 'SonyLIV', 'subs'],
  [/zee ?5/i, 'ZEE5', 'subs'],
  [/apple\.?com|apple services|itunes/i, 'Apple', 'subs'],
  [/google ?play|googleplay/i, 'Google Play', 'subs'],
  [/linkedin/i, 'LinkedIn', 'subs'],
  [/canva/i, 'Canva', 'subs'],
  [/openai|chatgpt/i, 'ChatGPT', 'subs'],
  [/cult\.?fit|curefit/i, 'Cult.fit', 'subs'],
  [/audible/i, 'Audible', 'subs'],
  [/adobe/i, 'Adobe', 'subs'],
  [/times ?prime/i, 'Times Prime', 'subs'],
  [/\bjio\b|reliance jio/i, 'Jio', 'recharge'],
  [/airtel/i, 'Airtel', 'recharge'],
  [/\bvi\b|vodafone/i, 'Vi', 'recharge'],
  [/\bbsnl\b/i, 'BSNL', 'recharge'],
  [/simpl\b/i, 'Simpl', 'credit'],
  [/lazypay/i, 'LazyPay', 'credit'],
  [/\bslice\b/i, 'Slice', 'credit'],
  [/kreditbee/i, 'KreditBee', 'credit'],
  [/money ?view/i, 'Moneyview', 'credit'],
  [/\bnavi\b/i, 'Navi', 'credit'],
  [/kissht/i, 'Kissht', 'credit'],
  [/bajaj ?(finance|finserv)/i, 'Bajaj Finance', 'credit'],
  [/\bemi\b/i, 'EMI', 'credit'],
  [/pay ?later/i, 'Pay Later', 'credit'],
]

const FEE = /\b(charges?|chrgs?|chg|fees?|penalty|late pay|overdue|bounce|ecs return|nach return|return charges|min(imum)? bal|non[- ]?maint|amc|sms alert|annual|gst on|convenience)\b/i
const NOISE = /\b(pvt|private|ltd|limited|llp|inc|india|technologies|technology|solutions|services|service|retail|internet|online|payments?|bank|the)\b/gi

function tidy(name: string) {
  const clean = name
    .replace(/[_*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[-/.,:]+$/, '')
  return clean.length > 40 ? `${clean.slice(0, 38).trim()}…` : clean
}

function identify(raw: string, text: string): { name: string; key: string; cat: Cat } {
  for (const [re, name, cat] of KNOWN) if (re.test(raw) || re.test(text)) return { name, key: name.toLowerCase(), cat }
  const name = tidy(raw) || 'Unknown'
  const key =
    name
      .toLowerCase()
      .replace(NOISE, ' ')
      .replace(/[^a-z ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || name.toLowerCase()
  return { name, key, cat: 'other' }
}

function nameFrom(first: string, text: string, before: string) {
  const stop = '(?=\\s{2,}|\\s+(?:debit|credit|₹|rs\\.?\\s|inr|upi\\b|transaction|utr|paid by|\\d{1,2}:\\d{2})|$)'
  const tries = [
    new RegExp(`(?:paid to|sent to|transfer(?:red)? to|payment to|money sent to)\\s+(.+?)${stop}`, 'i'),
    new RegExp(`(?:received from|refund from|credit from|money received from)\\s+(.+?)${stop}`, 'i'),
    /\bUPI[/-](?:(?:DR|CR|P2A|P2M)[/-])?(?:\d{6,}[/-])?(?:(?:DR|CR|P2A|P2M)[/-])?([A-Za-z][A-Za-z0-9 .&_]+?)[/-]/i,
    /\b(?:ACH|NACH|ECS)[ -]*(?:D|DR|DEBIT)?[ -]+([A-Za-z][A-Za-z0-9 .&]+?)(?:[-/]|\s{2,}|\d{4,}|$)/i,
    /\bPOS\s+(?:[\dX*]+\s+)?([A-Za-z][A-Za-z0-9 .&]+?)(?:\s{2,}|\d{3,}|$)/i,
    /\b(?:IMPS|NEFT|RTGS)[-/ ](?:[A-Z0-9]+[-/ ])?([A-Za-z][A-Za-z .&]+?)(?:[-/]|\s{2,}|\d{3,}|$)/i,
  ]
  for (const re of tries) {
    const m = re.exec(first) ?? re.exec(text)
    if (m?.[1]) return m[1]
  }
  return before.replace(/\b\d{6,}\b/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── reading rows ─────────────────────────────────────────────
const CASH = /(?:₹|\bRs\.?|\bINR)\s*([\d,]+(?:\.\d{1,2})?)/i
const DECIMAL = /(?<![\d,.])\d{1,3}(?:,\d{2,3})*\.\d{2}(?![\d])|(?<![\d,.])\d+\.\d{2}(?![\d])/g
const number = (s: string) => Number(s.replace(/,/g, ''))

function directionOf(first: string, text: string): 'out' | 'in' | null {
  if (/\bDEBIT\b|paid to|sent to|money sent|payment to|transfer(red)? to|-\s*(?:₹|rs)/i.test(first)) return 'out'
  if (/\bCREDIT\b|received from|money received|refund from|\+\s*(?:₹|rs)/i.test(first)) return 'in'
  if (/\bDr\b\.?|\/DR\//.test(first)) return 'out'
  if (/\bCr\b\.?|\/CR\/|\bsalary\b|\brefund\b|\binterest\b/i.test(first)) return 'in'
  if (/\bDEBIT\b|paid to|sent to/i.test(text)) return 'out'
  if (/\bCREDIT\b|received from/i.test(text)) return 'in'
  return null
}

function timeOf(text: string) {
  const m = /\b(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?\b/i.exec(text)
  if (!m) return null
  let h = Number(m[1])
  if (m[3]?.toLowerCase() === 'pm' && h < 12) h += 12
  if (m[3]?.toLowerCase() === 'am' && h === 12) h = 0
  return h * 60 + Number(m[2])
}

/** Read every transaction out of a statement's text. */
export function parseStatement(text: string): Tx[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/ /g, ' ').trimEnd())
    .filter((l) => l.trim())
  const blocks: string[][] = []
  for (const line of lines) {
    const d = findDate(line)
    if (d && d.index <= 10) blocks.push([line])
    else blocks.at(-1)?.push(line)
  }

  const out: Tx[] = []
  let balance: number | null = null
  for (const block of blocks) {
    const first = block[0]
    const date = findDate(first)
    if (!date) continue
    // Statement headers like "Jan 01, 2025 - Mar 31, 2025" are a date range, not a payment.
    if (/^\W*(?:\d+\s+)?\S.{0,14}\s[-–to]+\s/.test(first.slice(date.index)) && findDate(first.slice(date.end)) && !CASH.test(first) && !first.match(DECIMAL)) continue
    const near = block.slice(0, 3).join('  ')
    const afterDate = first.slice(date.end)

    let amount = 0
    let amountAt = -1
    let dir: 'out' | 'in' | null = directionOf(first, near)
    const cash = CASH.exec(afterDate) ?? CASH.exec(near)
    if (cash) {
      amount = number(cash[1])
      amountAt = afterDate.indexOf(cash[0])
    } else {
      const nums = [...afterDate.matchAll(DECIMAL)]
      if (!nums.length) continue
      if (nums.length >= 2) {
        const hit = nums[nums.length - 2]
        amount = number(hit[0])
        amountAt = hit.index ?? -1
        const now = number(nums[nums.length - 1][0])
        // The balance is the most reliable sign of direction on a bank statement.
        if (balance !== null) dir = now < balance ? 'out' : 'in'
        balance = now
      } else {
        amount = number(nums[0][0])
        amountAt = nums[0].index ?? -1
      }
    }
    if (!amount || !Number.isFinite(amount)) continue

    const before = amountAt > 0 ? afterDate.slice(0, amountAt) : afterDate
    const raw = nameFrom(first, near, before)
    const who = identify(raw, near)
    out.push({
      date: date.iso,
      minutes: timeOf(near),
      name: who.name,
      key: who.key,
      amount,
      dir: dir ?? 'out',
      cat: who.cat,
      fee: FEE.test(near) && who.cat === 'other',
    })
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.minutes ?? 0) - (b.minutes ?? 0)))
}

// ─── finding the leaks ────────────────────────────────────────
const dayNumber = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)] ?? 0
}

export function analyse(txs: Tx[]): Report | null {
  if (!txs.length) return null
  const from = txs[0].date
  const to = txs[txs.length - 1].date
  // Whole months: a statement of 85 days is three months of bills, not 2.8.
  const months = Math.max(1, Math.round((dayNumber(to) - dayNumber(from) + 1) / 30.4))
  const debits = txs.filter((t) => t.dir === 'out')
  const groups = new Map<string, Tx[]>()
  for (const t of debits) groups.set(t.key, [...(groups.get(t.key) ?? []), t])

  const items: LeakItem[] = []
  for (const [key, list] of groups) {
    const total = list.reduce((n, t) => n + t.amount, 0)
    // What it costs in a month it's paid. Dividing by the statement's length would double a bill paid
    // twice in a 37-day statement, and halve one that started last month.
    const paidMonths = new Set(list.map((t) => t.date.slice(0, 7))).size
    const row = { key, name: list[0].name, total, count: list.length, last: list[list.length - 1].date, monthly: list.length > 1 ? total / paidMonths : total / months }
    if (list.every((t) => t.fee)) {
      items.push({ ...row, kind: 'fee' })
      continue
    }
    if (list[0].cat === 'subs') {
      items.push({ ...row, kind: 'sub' })
      continue
    }
    if (list[0].cat !== 'other') continue
    // The same amount, about once a month, across different months.
    const mid = median(list.map((t) => t.amount))
    const same = list.filter((t) => Math.abs(t.amount - mid) <= mid * 0.1)
    const distinctMonths = new Set(same.map((t) => t.date.slice(0, 7))).size
    const gaps = same.slice(1).map((t, i) => dayNumber(t.date) - dayNumber(same[i].date))
    if (same.length >= 2 && distinctMonths >= 2 && gaps.length && median(gaps) >= 20 && median(gaps) <= 40) {
      const sum = same.reduce((n, t) => n + t.amount, 0)
      items.push({ ...row, kind: 'repeat', total: sum, count: same.length, monthly: sum / distinctMonths })
    }
  }
  items.sort((a, b) => b.monthly - a.monthly)

  // Two identical payments minutes apart are usually a retry that went through twice.
  const doubles: Double[] = []
  for (const list of groups.values()) {
    for (let i = 1; i < list.length; i++) {
      const [a, b] = [list[i - 1], list[i]]
      if (a.amount !== b.amount || a.date !== b.date || a.amount < 50) continue
      if (a.minutes !== null && b.minutes !== null ? b.minutes - a.minutes <= 10 : a.amount >= 100) doubles.push({ key: b.key, name: b.name, amount: b.amount, date: b.date })
    }
  }

  const byCat = new Map<Cat, { total: number; count: number }>()
  for (const t of debits) {
    const c = byCat.get(t.cat) ?? { total: 0, count: 0 }
    byCat.set(t.cat, { total: c.total + t.amount, count: c.count + 1 })
  }
  const cats = [...byCat.entries()].map(([id, c]) => ({ id, label: CATS[id], ...c })).sort((a, b) => b.total - a.total)

  const credit = [...groups.values()].filter((l) => l[0].cat === 'credit').map((l) => ({ name: l[0].name, total: l.reduce((n, t) => n + t.amount, 0), count: l.length }))

  // One honest suggestion: skip one order a week from your biggest habit.
  const habit = cats.find((c) => ['food', 'quick', 'cabs', 'shopping'].includes(c.id) && c.count / months >= 2)
  const tip = habit ? { label: habit.label, perOrder: habit.total / habit.count, perYear: (habit.total / habit.count) * 52 } : null

  return {
    from,
    to,
    months,
    txCount: txs.length,
    spent: debits.reduce((n, t) => n + t.amount, 0),
    received: txs.filter((t) => t.dir === 'in').reduce((n, t) => n + t.amount, 0),
    items,
    doubles,
    cats,
    credit,
    tip,
  }
}

/** The headline: what repeats every month, leaving out anything you've marked as fine or already cancelled. A double payment happened once, so it's shown on its own. */
export function leakPerMonth(r: Report, skip: string[] = []) {
  return r.items.filter((i) => !skip.includes(i.key)).reduce((n, i) => n + i.monthly, 0)
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

/** How to stop a subscription. Menu names change, so these stay general on purpose. */
export const CANCEL: Record<string, string> = {
  netflix: 'Netflix: Account → Cancel membership.',
  spotify: 'Spotify: Account → Manage your plan → Cancel.',
  'youtube premium': 'YouTube: Your profile → Purchases and memberships → Cancel.',
  'amazon prime': 'Amazon: Account → Prime → End membership.',
  jiohotstar: 'JioHotstar: My Space → Subscription → Cancel.',
  apple: 'iPhone: Settings → your name → Subscriptions → Cancel.',
  'google play': 'Play Store: Profile → Payments and subscriptions → Subscriptions → Cancel.',
}
export const CANCEL_GENERAL = 'If it’s UPI AutoPay, open the UPI app that set it up and cancel the AutoPay there. Only that app can stop it.'

/** A made-up statement in PhonePe's shape, so you can see a report before using your own. */
export const SAMPLE = `Transaction Statement for 98XXXXXX10
Aug 01, 2026 - Oct 31, 2026
Date Transaction Details Type Amount
Aug 02, 2026 Paid to NETFLIX ENTERTAINMENT DEBIT ₹649
10:12 AM Transaction ID T2608021012
Aug 03, 2026 Paid to SPOTIFY INDIA DEBIT ₹119
09:02 AM Transaction ID T2608030902
Aug 05, 2026 Received from RAHUL SHARMA CREDIT ₹5,000
06:30 PM Transaction ID T2608051830
Aug 06, 2026 Paid to SWIGGY DEBIT ₹342
08:41 PM Transaction ID T2608062041
Aug 09, 2026 Paid to ZOMATO DEBIT ₹289
09:15 PM Transaction ID T2608092115
Aug 11, 2026 Paid to FITNESS PLUS GYM DEBIT ₹1,200
07:30 AM Transaction ID T2608110730
Aug 13, 2026 Paid to BLINKIT DEBIT ₹410
11:05 PM Transaction ID T2608132305
Aug 19, 2026 Paid to UBER INDIA DEBIT ₹236
08:20 AM Transaction ID T2608190820
Aug 24, 2026 Paid to SWIGGY DEBIT ₹385
09:40 PM Transaction ID T2608242140
Sep 02, 2026 Paid to NETFLIX ENTERTAINMENT DEBIT ₹649
10:12 AM Transaction ID T2609021012
Sep 03, 2026 Paid to SPOTIFY INDIA DEBIT ₹119
09:02 AM Transaction ID T2609030902
Sep 05, 2026 Paid to SWIGGY DEBIT ₹298
08:15 PM Transaction ID T2609052015
Sep 11, 2026 Paid to FITNESS PLUS GYM DEBIT ₹1,200
07:30 AM Transaction ID T2609110730
Sep 14, 2026 Paid to ZEPTO DEBIT ₹355
10:45 PM Transaction ID T2609142245
Sep 15, 2026 Paid to AMAZON DEBIT ₹1,499
12:30 PM Transaction ID T2609151230
Sep 15, 2026 Paid to AMAZON DEBIT ₹1,499
12:33 PM Transaction ID T2609151233
Sep 20, 2026 Paid to ZOMATO DEBIT ₹412
09:02 PM Transaction ID T2609202102
Sep 28, 2026 Paid to SBI SMS ALERT CHARGES DEBIT ₹35
06:00 AM Transaction ID T2609280600
Oct 02, 2026 Paid to NETFLIX ENTERTAINMENT DEBIT ₹649
10:12 AM Transaction ID T2610021012
Oct 03, 2026 Paid to SPOTIFY INDIA DEBIT ₹119
09:02 AM Transaction ID T2610030902
Oct 08, 2026 Paid to SWIGGY DEBIT ₹356
08:50 PM Transaction ID T2610082050
Oct 11, 2026 Paid to FITNESS PLUS GYM DEBIT ₹1,200
07:30 AM Transaction ID T2610110730
Oct 12, 2026 Paid to BLINKIT DEBIT ₹268
10:20 PM Transaction ID T2610122220
Oct 18, 2026 Paid to SWIGGY DEBIT ₹441
09:33 PM Transaction ID T2610182133
Oct 25, 2026 Paid to SIMPL PAY LATER DEBIT ₹1,850
04:10 PM Transaction ID T2610251610`
