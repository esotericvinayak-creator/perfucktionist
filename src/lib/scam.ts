// Scam Check: reads a message, link or offer on this device and looks for the patterns scams use.
//
// It can say a message looks dangerous. It can never say one is safe: new scams appear every week,
// so the calmest verdict is "no known signs", and the page says what that doesn't mean.
// Nothing here leaves the phone.

export type Flag = { id: string; title: string; why: string; weight: 1 | 2 | 3 }
export type Level = 'danger' | 'careful' | 'clear'
export type Verdict = { level: Level; flags: Flag[]; links: string[] }

type Rule = Flag & { re: RegExp }

const RULES: Rule[] = [
  {
    id: 'secret',
    weight: 3,
    title: 'It asks for your OTP, PIN or password',
    why: 'No bank, app or government office needs these. Anyone who has them can empty your account.',
    re: /(share|send|tell|give|enter|provide|confirm|forward|bata|bhej|de do|dedo|बताएं|भेजें).{0,30}\b(otp|upi pin|atm pin|mpin|cvv|net ?banking password|password|ओटीपी)\b|\b(otp|upi pin|atm pin|mpin|cvv|ओटीपी)\b.{0,30}(share|send|tell|give|enter|provide|confirm|bata|bhej|de do|dedo|बताएं|भेजें)/i,
  },
  {
    id: 'receive-pin',
    weight: 3,
    title: 'It says you need a PIN or QR code to receive money',
    why: 'You only ever enter a UPI PIN to send money. Scanning a code or entering a PIN to “receive” takes money from you.',
    re: /(scan|qr|pin|approve|accept).{0,40}(receive|get|credit|claim|refund|cashback|paisa milega)|(receive|get|credit|claim|refund|cashback).{0,40}(scan|qr code|upi pin|approve the request)/i,
  },
  {
    id: 'kyc',
    weight: 3,
    title: 'It threatens your account or KYC',
    why: 'Fake “update KYC or your account closes” messages are one of the oldest bank scams. Banks don’t close accounts through a link.',
    re: /\bkyc\b.{0,50}(update|expire|expired|expiring|pending|block|suspend|complete|verify)|(account|a\/c|khata|खाता|wallet|sim|card).{0,40}(block|blocked|suspend|deactivat|freeze|frozen|band ho|बंद)|केवाईसी/i,
  },
  {
    id: 'job-fee',
    weight: 3,
    title: 'It asks you to pay to get a job or income',
    why: 'Real employers pay you. Asking for registration, training, laptop or security money first is the signature of a job scam.',
    re: /(registration|security|processing|training|joining|laptop|uniform|verification|onboarding|document|interview|caution)\s*(fee|fees|deposit|charge|charges|amount)/i,
  },
  {
    id: 'task',
    weight: 3,
    title: 'It looks like a task or part-time job scam',
    why: 'Easy money for liking videos or rating hotels starts with small real payouts, then asks you to “prepay” bigger tasks and takes it all.',
    re: /(like|subscribe|rate|rating|review|follow).{0,40}(youtube|video|videos|hotel|hotels|google map|product|products|channel|instagram).{0,60}(earn|paid|payment|₹|rs\.?|income|commission)|(earn|income|kamaye|kamao|कमाएं).{0,40}(per day|daily|per task|per hour|per like|ghar baithe|घर बैठे|from home)|\bprepaid task\b|\btask\b.{0,30}(commission|reward|merchant)|part[- ]?time.{0,40}(job|work).{0,50}(₹|rs\.?|earn|daily|income)/i,
  },
  {
    id: 'investment',
    weight: 3,
    title: 'It promises guaranteed or very high returns',
    why: 'No real investment can guarantee profit. Investment scams are the biggest source of money lost to fraud in India.',
    re: /guarantee[d]?.{0,20}(return|returns|profit|income)|(double|triple).{0,12}(your )?(money|paisa|investment)|paisa double|\d+\s*%.{0,20}(daily|weekly|monthly|per day|per week|per month|returns?)|(trading|stock|crypto|forex|ipo).{0,30}(tips|group|profit|signals|allotment)|(telegram|whatsapp) group.{0,40}\b(profit|profits|trading|invest|investment|earnings?)\b/i,
  },
  {
    id: 'arrest',
    weight: 3,
    title: 'It threatens arrest, police or a seized parcel',
    why: '“Digital arrest” is a scam. Police, CBI and customs never arrest anyone on a video call or ask you to transfer money to clear your name.',
    re: /digital arrest|arrest warrant|money laundering|narcotics|drug.{0,20}parcel|parcel.{0,50}(seized|illegal|drugs|customs|held)|customs.{0,40}(parcel|pay|clearance)|(cbi|ed officer|crime branch|cyber police|trai).{0,50}(call|case|arrest|video|verify|disconnect)|गिरफ्तार/i,
  },
  {
    id: 'prize',
    weight: 3,
    title: 'It says you won something you never entered',
    why: 'Lottery, KBC and lucky draw wins always end with a “tax” or “fee” you must pay first. The prize doesn’t exist.',
    re: /lottery|lucky draw|\bkbc\b|you (have )?won|congratulations.{0,40}(won|selected|winner|prize)|prize money|inaam|इनाम|लॉटरी/i,
  },
  {
    id: 'bill',
    weight: 3,
    title: 'It threatens to cut your electricity or service tonight',
    why: 'Fake disconnection notices push you to call a number or install an app. Real notices don’t come from a personal mobile number.',
    re: /(electricity|power|bijli|बिजली|connection|gas).{0,40}(disconnect|cut|kat|cancel|कट|बंद).{0,40}(tonight|today|aaj|आज|\d+\s*(pm|am|baje))|(disconnect|cut off).{0,40}(tonight|today)/i,
  },
  {
    id: 'remote',
    weight: 3,
    title: 'It asks you to install a screen-sharing app',
    why: 'Apps like AnyDesk or TeamViewer let a stranger see your screen, including your OTPs. RBI warns about exactly this trick.',
    re: /any ?desk|team ?viewer|rust ?desk|quick ?support|screen ?shar/i,
  },
  {
    id: 'apk',
    weight: 3,
    title: 'It wants you to install an app from a file or link',
    why: 'APK files sent over WhatsApp or SMS can read your messages and OTPs. Fake wedding cards, challans and bank apps all work this way.',
    re: /\.apk\b|(install|download).{0,30}(apk|this app|the app from|from (this|the|below) link)/i,
  },
  {
    id: 'loan',
    weight: 2,
    title: 'It offers an instant loan with no checks',
    why: 'Real lenders check your credit. “No CIBIL” loan offers often come from illegal apps that charge huge fees or harass you.',
    re: /(instant|pre-?approved|without documents|no documents|no cibil|low cibil).{0,30}loan|loan.{0,30}(no cibil|without cibil|instant|without documents|in 5 minutes)/i,
  },
  {
    id: 'challan',
    weight: 2,
    title: 'It’s a traffic challan or delivery notice with a link',
    why: 'Fake challans and “delivery failed” texts send you to look-alike payment pages. Check on the official site instead.',
    re: /(rto|traffic|e-?challan|challan).{0,40}(pay|link|click|pending|due)|(delivery|courier|package|india post).{0,40}(failed|held|pending|update|address).{0,40}(click|link|pay|http)/i,
  },
  {
    id: 'pay-first',
    weight: 2,
    title: 'It asks you to pay first to get paid',
    why: 'If money must go out before any comes in, stop. A “refundable deposit” or “tax to release funds” is how advance-fee scams work.',
    re: /refundable.{0,12}(deposit|amount|fee)|pay.{0,20}(first|advance|upfront)|advance (payment|fee|amount)|(tax|gst|fee).{0,20}(to release|to unlock|before withdraw|to withdraw|clearance)/i,
  },
  {
    id: 'stranger-offer',
    weight: 2,
    title: 'It offers a job you never applied for',
    why: 'Real offers follow an application and an interview. Fake foreign jobs have even trapped people abroad.',
    re: /(you (are|have been) selected|selected for|shortlisted|hr (team|manager|from)|job offer|offer letter|work from home|wfh|abroad|overseas|cambodia|laos|myanmar|thailand).{0,60}(job|salary|position|role|data entry|₹|rs\.?|per month|lakh)/i,
  },
  {
    id: 'hurry',
    weight: 1,
    title: 'It rushes you',
    why: 'Pressure stops you from checking. Real organisations give you time.',
    re: /urgent|immediately|right now|last chance|act now|within \d+\s*(min|mins|minutes|hour|hours|hrs)|expires? today|only today|turant|abhi|तुरंत|अभी/i,
  },
  {
    id: 'click',
    weight: 1,
    title: 'It pushes you to tap a link',
    why: 'A link in an unexpected message is how most phishing starts. Type the official address yourself instead.',
    re: /click (here|the link|below|on the link)|tap (here|the link)|visit the link|link par click|लिंक पर क्लिक/i,
  },
]

// Sentences that warn you about scams use the same words as scams. Take them out before matching,
// so "Never share your OTP" from a real bank doesn't count against it.
const WARNINGS = /(do not|don't|dont|never|won't|will not|will never|nobody|no one|not)\s+(?:\w+\s+){0,3}(share|ask|tell|give|disclose|call)[^.\n!]*/gi

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.ly', 'cutt.ly', 'rb.gy', 'is.gd', 'goo.gl', 'ow.ly', 't.co', 'shorturl.at', 'tiny.cc', 'rebrand.ly', 'wa.link']
const RISKY_ENDINGS = ['xyz', 'top', 'click', 'icu', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'cam', 'rest', 'sbs', 'cyou', 'monster', 'lol', 'loan', 'win', 'bid']

/** Brands people impersonate, and the addresses that really belong to them. */
const BRANDS: [string, string[]][] = [
  ['sbi', ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'sbi.bank.in', 'sbicard.com', 'sbi']],
  ['hdfc', ['hdfcbank.com', 'hdfc.bank.in', 'hdfc.com', 'hdfclife.com']],
  ['icici', ['icicibank.com', 'icici.bank.in', 'icicidirect.com']],
  ['axis', ['axisbank.com', 'axis.bank.in']],
  ['kotak', ['kotak.com', 'kotak.bank.in']],
  ['paytm', ['paytm.com', 'paytm.in', 'paytmbank.com']],
  ['phonepe', ['phonepe.com']],
  ['gpay', ['google.com', 'gpay.app.goo.gl']],
  ['amazon', ['amazon.in', 'amazon.com', 'amazonpay.in']],
  ['flipkart', ['flipkart.com']],
  ['irctc', ['irctc.co.in']],
  ['npci', ['npci.org.in']],
  ['uidai', ['uidai.gov.in']],
  ['aadhaar', ['uidai.gov.in']],
  ['indiapost', ['indiapost.gov.in']],
  ['incometax', ['incometax.gov.in']],
  ['epfo', ['epfindia.gov.in']],
]

const LINK = /((?:https?:\/\/|www\.)[^\s<>"')]+|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|info|co|app|site|online|shop|live|link|xyz|top|click|icu|tk|ml|ga|cf|gq|buzz|cam|rest|sbs|cyou|ly|gl|gd|cc|me|bank)(?:\/[^\s<>"')]*)?)/gi

function hostOf(link: string) {
  const bare = link.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  return bare.split(/[/?#]/)[0].split('@').pop()!.split(':')[0].toLowerCase()
}

const owns = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`)

function linkFlags(links: string[]): Flag[] {
  const flags: Flag[] = []
  const add = (id: string, title: string, why: string, weight: Flag['weight']) => {
    if (!flags.some((f) => f.id === id)) flags.push({ id, title, why, weight })
  }
  for (const link of links) {
    const host = hostOf(link)
    const official = host.endsWith('.gov.in') || host.endsWith('.nic.in') || host.endsWith('.bank.in')
    if (SHORTENERS.some((s) => owns(host, s))) add('short', 'It hides the real address behind a short link', 'Short links hide where you’re really going. Banks and government offices don’t use them for payments or KYC.', 2)
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add('ip', 'The link is just a number, not a website name', 'Real services use a proper name. A bare number address is a strong warning sign.', 3)
    if (host.includes('xn--')) add('punycode', 'The address uses look-alike letters', 'Some letters can look identical to normal ones. This address is pretending to be something else.', 3)
    if (RISKY_ENDINGS.includes(host.split('.').pop() ?? '')) add('tld', `The address ends in .${host.split('.').pop()}`, 'Cheap web addresses like this are common in phishing. Banks and government offices don’t use them.', 2)
    if (/@/.test(link.split('/')[2] ?? '')) add('at', 'The link has an @ sign to hide its real address', 'Everything before the @ is ignored. It’s a trick to make a link look like a trusted site.', 3)
    if (!official) {
      for (const [brand, domains] of BRANDS) {
        if (host.replace(/[-.]/g, '').includes(brand) && !domains.some((d) => owns(host, d))) {
          add('lookalike', `It pretends to be ${brand.toUpperCase()}, but the address isn’t theirs`, `The real ${brand.toUpperCase()} doesn’t use ${host}. Scammers copy the name to look official.`, 3)
          break
        }
      }
    }
  }
  return flags
}

/** Read a message and say what's wrong with it. */
export function checkScam(input: string): Verdict {
  const text = input.replace(/[’‘]/g, "'").trim()
  if (!text) return { level: 'clear', flags: [], links: [] }
  const links = [...new Set(text.match(LINK) ?? [])]
  const body = text.replace(WARNINGS, ' ')
  const flags: Flag[] = RULES.filter((r) => r.re.test(body)).map(({ id, title, why, weight }) => ({ id, title, why, weight }))
  flags.push(...linkFlags(links))
  flags.sort((a, b) => b.weight - a.weight)
  const score = flags.reduce((n, f) => n + f.weight, 0)
  const level: Level = flags.some((f) => f.weight === 3) || score >= 4 ? 'danger' : score >= 2 ? 'careful' : 'clear'
  return { level, flags, links }
}

/** Real-looking examples, so people can see what it does before pasting anything. */
export const EXAMPLES = [
  { label: 'job offer', text: 'Hi, I am Priya from HR. You are selected for a part time job. Like YouTube videos and earn ₹3000 daily from home. Pay ₹999 registration fee to start. Join our Telegram group: t.ly/earnnow' },
  { label: 'bank KYC', text: 'Dear customer, your SBI account will be blocked today. Update KYC immediately: http://sbi-kyc-update.xyz/login' },
  { label: 'parcel', text: 'This is CBI cyber police. A parcel in your name has been seized with drugs. You are under digital arrest. Stay on this video call and transfer money to verify your account.' },
  { label: 'real bank alert', text: '123456 is your OTP for a transaction of Rs 500 at Amazon. Valid for 10 minutes. Never share your OTP with anyone.' },
]
