// Get It Back: what to do when your money is stuck, who has to answer, and by when.
//
// People act on these dates, so every rule needs a source and nothing is written from memory.
// RBI rules come from RBI's own pages; the rest are marked in `Rule.source`. Secondary sources are
// named as such in the README. Rules change: re-check them before each release (last read: CHECKED).
export const CHECKED = 'November 2026'

export type Answers = { name: string; amount: string; date: string; ref: string; other: string; details: string; choice: string }
export type Source = { label: string; url: string }
export type Rule = { text: string; source?: Source }
export type Step = { title: string; body: string; due?: string; call?: string; link?: { label: string; url: string } }
export type Letter = { subject: string; body: string }

export type ClaimType = {
  id: string
  icon: string
  title: string
  line: string
  /** Time matters more than anything else on this one. */
  urgent?: boolean
  dateLabel: string
  refLabel: string
  otherLabel: string
  choice?: { ask: string; options: { id: string; label: string }[] }
  rules: (a: Answers) => Rule[]
  /** Money the rules say you're owed on top of your own, so far. */
  owed?: (a: Answers, today: string) => number
  steps: (a: Answers, started: string, today: string) => Step[]
  letter: (a: Answers, today: string) => Letter
}

const DAY = 86_400_000
export const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10)
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY)
export const niceDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

const RBI_TAT: Source = { label: 'RBI circular on failed transactions, 2019', url: 'https://www.rbi.org.in/commonman/English/scripts/Notification.aspx?Id=3074' }
const RBI_OMB: Source = { label: 'RBI Ombudsman Scheme 2026 FAQ', url: 'https://www.rbi.org.in/commonperson/english/scripts/FAQs.aspx?Id=3407' }
const RBI_FRAUD: Source = { label: 'RBI circular on unauthorised transactions, 2017', url: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11040' }
const ECOM: Source = { label: 'Consumer Protection (E-Commerce) Rules 2020', url: 'https://livelaw.in/news-updates/consumer-protection-e-commerce-rules-2020-160398' }
const COACHING: Source = { label: 'Coaching centre guidelines 2024, summary', url: 'https://vajiramandravi.com/current-affairs/coaching-centre/' }

const CMS = { label: 'open cms.rbi.org.in', url: 'https://cms.rbi.org.in' }
const NCH = { label: 'open consumerhelpline.gov.in', url: 'https://consumerhelpline.gov.in/' }
const JAGRITI = { label: 'open e-jagriti.gov.in', url: 'https://e-jagriti.gov.in/' }
const CYBER = { label: 'open cybercrime.gov.in', url: 'https://cybercrime.gov.in/' }

const rupees = (a: Answers) => (a.amount ? `₹${Number(a.amount).toLocaleString('en-IN')}` : 'the amount')
const when = (a: Answers) => (a.date ? niceDate(a.date) : '[date]')
const ref = (a: Answers) => a.ref || '[reference number]'
const who = (a: Answers, fallback: string) => a.other || fallback
const sign = (a: Answers) => `Thank you,\n${a.name || '[your name]'}`
const extra = (a: Answers) => (a.details ? `\n\nMore detail: ${a.details}` : '')

function ombudsman(started: string, today: string): Step[] {
  const replyBy = addDays(started, 30)
  return [
    {
      title: 'no answer in 30 days? go to the RBI Ombudsman',
      body: `If your bank hasn’t replied by ${niceDate(replyBy)}, or you’re unhappy with its reply, complain to the RBI Ombudsman. It’s free and there’s no limit on the amount. Use the portal or email crpc@rbi.org.in. You can’t file by phone, but 14448 helps with questions.`,
      due: replyBy,
      link: CMS,
    },
    {
      title: 'don’t miss the last date',
      body: `The 2026 scheme gives you 90 days. If the bank never replies, that means ${niceDate(addDays(replyBy, 90))}. If it does reply, you have 90 days from its last message.`,
      due: addDays(replyBy, 90),
    },
  ].filter((s) => today <= (s.due ?? today) || s.title.startsWith('no answer'))
}

function consumerLadder(started: string): Step[] {
  return [
    {
      title: 'no fix? call the National Consumer Helpline',
      body: 'Call 1915 (8am to 8pm), message +91 88000 01915 on WhatsApp, or register online. It’s the government’s step before going to court, and you get a docket number to track.',
      due: addDays(started, 30),
      call: '1915',
      link: NCH,
    },
    {
      title: 'still stuck? file a consumer complaint',
      body: 'e-Jagriti is the government’s portal for formal consumer complaints. You don’t need a lawyer to file. Check the fee on the portal first, because it depends on the amount.',
      link: JAGRITI,
    },
  ]
}

export const CLAIMS: ClaimType[] = [
  {
    id: 'scam',
    icon: 'sos',
    title: 'I was scammed, or money left without me',
    line: 'Act now. The first hour matters most.',
    urgent: true,
    dateLabel: 'when did it happen?',
    refLabel: 'transaction or UTR number',
    otherLabel: 'your bank',
    choice: {
      ask: 'what happened?',
      options: [
        { id: 'unknown', label: 'money left and I did nothing' },
        { id: 'shared', label: 'I shared an OTP or tapped a link' },
        { id: 'paid', label: 'I was tricked into paying' },
      ],
    },
    rules: (a) => {
      if (a.choice === 'unknown')
        return [
          { text: 'If someone else broke in and you tell your bank within 3 working days of its alert, you lose nothing.', source: RBI_FRAUD },
          { text: 'Tell them in 4 to 7 working days and your loss is capped at ₹10,000 on a normal savings account, or ₹5,000 on a basic account.', source: RBI_FRAUD },
          { text: 'Your bank must put the money back in your account within 10 working days of your report while it checks, and finish within 90 days. It has to prove you were at fault, not the other way around.', source: RBI_FRAUD },
        ]
      if (a.choice === 'shared')
        return [
          { text: 'If a bank decides you were careless, for example by sharing an OTP, you carry the loss until you report it. Anything after your report is on the bank. So report right now.', source: RBI_FRAUD },
          { text: 'Report it even if you feel embarrassed. The cyber helpline may still freeze the money before it moves on.' },
        ]
      return [
        { text: 'If you approved the payment yourself, the bank’s protection for unauthorised payments may not cover you. That’s why the cyber helpline matters most here: it can try to freeze the money before it’s moved on.' },
      ]
    },
    steps: (_, started, today) => [
      { title: 'call 1930 now', body: 'This is India’s cyber fraud helpline. The sooner you call, the better the chance of freezing the money. Keep the transaction number ready.', call: '1930', due: today },
      { title: 'report it at cybercrime.gov.in', body: 'File the complaint online as well and save the acknowledgement number.', link: CYBER, due: today },
      { title: 'call your bank and block everything', body: 'Ask them to block your UPI, card and net banking. Then send the letter below so your report is in writing.', due: today },
      ...ombudsman(started, today),
    ],
    letter: (a, today) => ({
      subject: `Unauthorised transaction of ${rupees(a)} on ${when(a)}: immediate action needed`,
      body: `To the Grievance Officer, ${who(a, '[your bank]')}\nDate: ${niceDate(today)}\n\nI am reporting a fraudulent transaction on my account.\n\nAmount: ${rupees(a)}\nDate: ${when(a)}\nTransaction or UTR number: ${ref(a)}\n\nPlease block further transactions, raise a fraud case, and credit this amount under RBI's circular on limiting customer liability in unauthorised electronic banking transactions (6 July 2017). Please send me the complaint number in writing.${extra(a)}\n\n${sign(a)}`,
    }),
  },
  {
    id: 'failed-upi',
    icon: 'money',
    title: 'UPI failed, but my money was taken',
    line: 'Banks must return it on time, or pay you for the delay.',
    dateLabel: 'date of the payment',
    refLabel: 'UPI reference (UTR)',
    otherLabel: 'your bank',
    choice: {
      ask: 'who were you paying?',
      options: [
        { id: 'person', label: 'a person' },
        { id: 'merchant', label: 'a shop or app' },
      ],
    },
    rules: (a) => [
      {
        text:
          a.choice === 'merchant'
            ? 'For a payment to a shop or app, the money must come back within 5 days of the payment.'
            : 'For a payment to a person, the money must come back by the day after the payment.',
        source: RBI_TAT,
      },
      { text: 'If it’s late, the rule is ₹100 for every day of delay. The bank should pay this on its own, without you asking.', source: RBI_TAT },
      { text: 'If the bank doesn’t fix it, the RBI Ombudsman can. It’s free.', source: RBI_OMB },
    ],
    owed: (a, today) => {
      if (!a.date) return 0
      const late = daysBetween(addDays(a.date, a.choice === 'merchant' ? 5 : 1), today)
      return late > 0 ? late * 100 : 0
    },
    steps: (a, started, today) => {
      const by = a.date ? addDays(a.date, a.choice === 'merchant' ? 5 : 1) : ''
      const waiting: Step[] = by && today <= by ? [{ title: `wait until ${niceDate(by)}`, body: 'It often comes back by itself. Check your statement that day, and start the next step if it hasn’t.', due: by }] : []
      return [
        ...waiting,
        { title: 'complain to your bank', body: 'Raise it in your UPI app under help or report a problem, then send the letter below through your bank’s complaint page or email. Save the complaint number.', due: by && today <= by ? by : today },
        ...ombudsman(by && today <= by ? by : started, today),
      ]
    },
    letter: (a, today) => {
      const by = a.date ? niceDate(addDays(a.date, a.choice === 'merchant' ? 5 : 1)) : '[reversal date]'
      return {
        subject: `Failed UPI transaction of ${rupees(a)} not reversed (UTR ${ref(a)})`,
        body: `To the Grievance Officer, ${who(a, '[your bank]')}\nDate: ${niceDate(today)}\n\nMy account was debited but the payment did not complete.\n\nAmount: ${rupees(a)}\nDate: ${when(a)}\nUPI reference (UTR): ${ref(a)}\n\nUnder RBI's circular DPSS.CO.PD No.629/02.01.014/2019-20 dated 20 September 2019, this should have been reversed by ${by}, with compensation of ₹100 per day for any delay after that, paid without a claim from me.\n\nPlease reverse the amount, pay the compensation due, and confirm in writing. If this is not resolved within 30 days, I will approach the RBI Ombudsman.${extra(a)}\n\n${sign(a)}`,
      }
    },
  },
  {
    id: 'wrong-upi',
    icon: 'money',
    title: 'I sent money to the wrong person',
    line: 'Move fast. This one depends on the other side.',
    dateLabel: 'date of the payment',
    refLabel: 'UPI reference (UTR)',
    otherLabel: 'your bank',
    rules: () => [
      { text: 'You approved this payment, so the bank doesn’t have to refund it the way it must for a failed payment. Banks usually need the other person or their bank to agree. Speed helps, so try today.' },
      { text: 'Be careful of “refund agents”. Nobody can reverse a payment for a fee, and nobody needs your PIN to do it.' },
    ],
    steps: (_, started, today) => [
      { title: 'ask the person politely', body: 'If you can reach them, message them with the amount and time. Many people return it.', due: today },
      { title: 'report it in your UPI app', body: 'Open the payment, tap help or report a problem, and choose wrong transfer. Save the reference it gives you.', due: today },
      { title: 'write to your bank', body: 'Send the letter below and ask them to contact the receiving bank.', due: today },
      ...ombudsman(started, today).slice(0, 1),
    ],
    letter: (a, today) => ({
      subject: `Payment of ${rupees(a)} sent to the wrong person by mistake (UTR ${ref(a)})`,
      body: `To the Grievance Officer, ${who(a, '[your bank]')}\nDate: ${niceDate(today)}\n\nI sent a UPI payment to the wrong person by mistake.\n\nAmount: ${rupees(a)}\nDate: ${when(a)}\nUPI reference (UTR): ${ref(a)}\n\nPlease contact the receiving bank and ask it to reach the account holder for a return of this amount. Please send me the complaint number and keep me informed.${extra(a)}\n\n${sign(a)}`,
    }),
  },
  {
    id: 'wrong-charge',
    icon: 'subs',
    title: 'I was charged twice, or after cancelling',
    line: 'Double payments and surprise renewals.',
    dateLabel: 'date of the charge',
    refLabel: 'transaction or UTR number',
    otherLabel: 'company that charged you',
    rules: () => [
      { text: 'Online sellers must have a grievance officer. They must acknowledge your complaint within 48 hours and fix it within one month.', source: ECOM },
    ],
    steps: (_, started) => [
      { title: 'email the company', body: 'Send the letter below to their support and grievance officer. The officer’s contact must be shown on their website or app.', due: started },
      { title: 'no reply in 48 hours? ask your bank', body: 'Raise a dispute with your bank or card issuer for the same transaction, with your proof attached.', due: addDays(started, 2) },
      ...consumerLadder(started),
    ],
    letter: (a, today) => ({
      subject: `Refund request: ${rupees(a)} charged wrongly on ${when(a)}`,
      body: `To the Grievance Officer, ${who(a, '[company]')}\nDate: ${niceDate(today)}\n\nI was charged wrongly and I am asking for a refund.\n\nAmount: ${rupees(a)}\nDate: ${when(a)}\nReference: ${ref(a)}\n\nThis was either a duplicate charge or a charge after I cancelled. Please refund it to my original payment method and stop any further charges.\n\nUnder the Consumer Protection (E-Commerce) Rules, 2020, please acknowledge this within 48 hours and resolve it within one month. If it isn't resolved, I will contact the National Consumer Helpline.${extra(a)}\n\n${sign(a)}`,
    }),
  },
  {
    id: 'refund',
    icon: 'expenses',
    title: 'My online refund never came',
    line: 'Returned orders, cancelled services, missing refunds.',
    dateLabel: 'date of the order or return',
    refLabel: 'order number',
    otherLabel: 'company or app',
    rules: () => [
      { text: 'Online sellers must have a grievance officer. They must acknowledge your complaint within 48 hours and fix it within one month.', source: ECOM },
    ],
    steps: (_, started) => [
      { title: 'email the grievance officer', body: 'Don’t stop at the chatbot. Send the letter below to the grievance officer, whose contact must be shown on the website or app.', due: started },
      { title: 'check for their reply', body: 'They should acknowledge it within 48 hours. Keep every email and screenshot.', due: addDays(started, 2) },
      ...consumerLadder(started),
    ],
    letter: (a, today) => ({
      subject: `Refund of ${rupees(a)} not received: order ${ref(a)}`,
      body: `To the Grievance Officer, ${who(a, '[company]')}\nDate: ${niceDate(today)}\n\nI have not received a refund that is due to me.\n\nOrder number: ${ref(a)}\nDate: ${when(a)}\nAmount: ${rupees(a)}\n\nPlease refund this amount to my original payment method. Under the Consumer Protection (E-Commerce) Rules, 2020, please acknowledge this within 48 hours and resolve it within one month. If it isn't resolved, I will contact the National Consumer Helpline.${extra(a)}\n\n${sign(a)}`,
    }),
  },
  {
    id: 'coaching',
    icon: 'exam',
    title: 'My coaching or course won’t refund me',
    line: 'Left midway, and they’re keeping your fees.',
    dateLabel: 'date you left or asked to leave',
    refLabel: 'student ID or receipt number',
    otherLabel: 'coaching centre or course',
    rules: () => [
      { text: 'The Education Ministry’s 2024 guidelines say a coaching centre should refund you pro rata within 10 days if you leave midway.', source: COACHING },
      { text: 'States enforce these guidelines, so it depends on where you are. Even so, your letter can cite them, and consumer forums hear fee disputes.' },
    ],
    steps: (_, started) => [
      { title: 'ask in writing', body: 'Send the letter below by email and keep the receipt, the fee rules and any promises they made.', due: started },
      { title: 'check for the refund', body: 'The guidelines say 10 days, so that’s the date to hold them to.', due: addDays(started, 10) },
      ...consumerLadder(started),
    ],
    letter: (a, today) => ({
      subject: `Refund request for unused course fees: ${rupees(a)}`,
      body: `To the Director, ${who(a, '[coaching centre]')}\nDate: ${niceDate(today)}\n\nI have left the course and I am asking for a refund of the unused fees.\n\nStudent ID or receipt number: ${ref(a)}\nDate I left: ${when(a)}\nAmount I am claiming: ${rupees(a)}\n\nThe Ministry of Education's Guidelines for Regulation of Coaching Centres (2024) say fees should be refunded pro rata within 10 days when a student leaves midway. Please refund this amount within 10 days of this letter. If it isn't resolved, I will contact the National Consumer Helpline.${extra(a)}\n\n${sign(a)}`,
    }),
  },
  {
    id: 'deposit',
    icon: 'friends',
    title: 'My PG or landlord kept my deposit',
    line: 'The hardest one, but a written demand often works.',
    dateLabel: 'date you moved out',
    refLabel: 'agreement date or room number',
    otherLabel: 'owner or PG name',
    rules: () => [
      { text: 'No helpline can force a private landlord to pay. Rules differ by state, so your written agreement and proof of payment matter most. A clear written demand with a date is your best first step.' },
    ],
    steps: (_, started) => [
      { title: 'collect your proof', body: 'Your agreement, deposit payment screenshots, rent receipts, and move-out photos.', due: started },
      { title: 'send a written demand', body: 'Send the letter below on WhatsApp and email, so it has a date. Give them 15 days.', due: started },
      { title: 'still nothing? talk to a lawyer', body: 'A lawyer’s notice often settles this. If the amount is worth it, the next step is a civil case in your city.', due: addDays(started, 15) },
    ],
    letter: (a, today) => ({
      subject: `Return of security deposit: ${rupees(a)}`,
      body: `To ${who(a, '[owner or PG name]')}\nDate: ${niceDate(today)}\n\nI moved out on ${when(a)} and my security deposit of ${rupees(a)} has not been returned.\n\nAgreement or room: ${ref(a)}\n\nPlease return the full amount within 15 days of this message. If you are deducting anything, please send the reason in writing. If this is not resolved, I will take legal advice.${extra(a)}\n\n${sign(a)}`,
    }),
  },
]

export const claimById = (id: string) => CLAIMS.find((c) => c.id === id)
