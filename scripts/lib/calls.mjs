// Khairiyat's day-to-day helpers: reading the command line, wording the WhatsApp note, and
// scoring the test. No database here, so `npm run calls:test` can check it all.

// Sarvam's pay-as-you-go rate plus its phone line (₹0.20 per 30 seconds). Each call rounds up to a whole minute.
export const RUPEES_PER_MINUTE = 3.9

// Families get a free first week, so paying at all means the calls were worth it.
export const FREE_DAYS = 7
export const TARGETS = { pickup: 0.7, minutes: 3, paying: 10 }

/** `--child Neha --time 10:30` → { child: 'Neha', time: '10:30' } */
export function flags(args) {
  const out = {}
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) continue
    const value = args[i + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`${args[i]} needs a value`)
    out[args[i].slice(2)] = value
    i++
  }
  return out
}

const DAYS = { all: [0, 1, 2, 3, 4, 5, 6], mwf: [1, 3, 5], tts: [2, 4, 6] }

/** How often: every day, Mon/Wed/Fri, or Tue/Thu/Sat. */
export function days(word = 'all') {
  const list = DAYS[word]
  if (!list) throw new Error('--days must be all, mwf or tts')
  return list
}

/** A phone number in the only shape the database and Sarvam accept. */
export function phone(raw, label) {
  const n = String(raw ?? '').replace(/[\s()-]/g, '')
  if (!/^\+[1-9][0-9]{9,14}$/.test(n)) throw new Error(`${label} must include the country code, like +919876543210`)
  return n
}

export function time(raw = '10:30') {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(raw)) throw new Error('--time must look like 10:30')
  if (raw < '09:00' || raw > '20:00') throw new Error('--time must be between 09:00 and 20:00, India time')
  return raw
}

/** Enough of a family's id to pick it out. Only hex, so it's safe in a query. */
export function idPrefix(raw) {
  if (!/^[0-9a-f-]{4,36}$/.test(raw ?? '')) throw new Error('Give the family id from `npm run calls`, e.g. npm run calls -- pause 3f2a')
  return raw
}

const MEDICINES = { taken: 'Dawai: le li.', not_taken: 'Dawai: abhi nahi li.', not_discussed: 'Dawai: baat nahi hui.' }

/** Today's calls for one family come down to one message, or null if there's nothing to send. */
export function dayMessage(family, calls) {
  const daily = calls.filter((c) => c.kind === 'daily')
  const spoke = daily.find((c) => c.parent_spoke)
  if (spoke) {
    if (!spoke.note) return null
    const lines = [`${family.child_name} ji, aaj ${family.parent_name} se baat hui.`, '', spoke.note, '', MEDICINES[spoke.medicine_status] ?? MEDICINES.not_discussed]
    if (spoke.reason_to_call) lines.push(`Aaj ki baat: ${spoke.reason_to_call}`)
    lines.push('', 'Yeh note AI ne likha hai. Zaroori baat ke liye seedha unse baat kijiye.')
    return lines.join('\n')
  }
  if (daily.length && daily.every((c) => c.status === 'no_answer' || c.status === 'busy')) {
    return `${family.child_name} ji, aaj ${family.parent_name} ne call nahi uthaya. Iska matlab yeh nahi ki kuch galat hai, par ek baar khud call kar lijiye.`
  }
  return null
}

/** Opens WhatsApp with the message typed in. You still press send. */
export const whatsappLink = (number, text) => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

/** One line on how today went, for the person running the test. */
export function dayStatus(calls) {
  const daily = calls.filter((c) => c.kind === 'daily')
  if (!daily.length) return 'no call yet'
  const spoke = daily.find((c) => c.parent_spoke)
  if (spoke) return `spoke for ${Math.round(Number(spoke.seconds ?? 0))} sec${spoke.note ? '' : ', but the note failed (read the transcript)'}`
  const last = daily.at(-1)
  if (last.status === 'dialing') return 'no result yet'
  if (last.status === 'failed') return `failed: ${last.failure_reason ?? 'no reason given'}`
  if (last.status === 'connected') return 'answered, but the parent said nothing (maybe voicemail)'
  return `${last.status.replace('_', ' ')} after ${daily.length} ${daily.length === 1 ? 'try' : 'tries'}`
}

/** The numbers that decide the test. See docs/KHAIRIYAT.md. */
export function report(families, attempts) {
  const finished = attempts.filter((a) => a.kind === 'daily' && a.status !== 'dialing')
  const days = new Map()
  for (const a of finished) {
    const key = `${a.family_id} ${a.call_date}`
    days.set(key, (days.get(key) ?? false) || a.parent_spoke)
  }
  const picked = [...days.values()].filter(Boolean).length
  const spoke = finished.filter((a) => a.parent_spoke)
  const minutes = spoke.reduce((sum, a) => sum + Number(a.seconds ?? 0) / 60, 0)
  const billed = attempts.reduce((sum, a) => sum + (a.status === 'connected' ? Math.ceil(Number(a.seconds ?? 0) / 60) : 0), 0)
  const pickup = days.size ? picked / days.size : null
  const averageMinutes = spoke.length ? minutes / spoke.length : null
  const paying = families.filter((f) => f.months_paid >= 1).length
  return {
    callDays: days.size,
    picked,
    pickup,
    averageMinutes,
    billedMinutes: billed,
    rupees: Math.round(billed * RUPEES_PER_MINUTE),
    alerts: attempts.filter((a) => a.kind === 'alert').length,
    paying,
    passes: {
      pickup: pickup !== null && pickup >= TARGETS.pickup,
      minutes: averageMinutes !== null && averageMinutes < TARGETS.minutes,
      paying: paying >= TARGETS.paying,
    },
  }
}
