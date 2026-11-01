// Run the Khairiyat test by hand. See docs/KHAIRIYAT.md.
//
//   npm run calls                          every family
//   npm run calls -- add --child Neha --child-phone +14155550100 --parent "Papa" --parent-phone +919876543210
//        optional: --time 10:30 --days all|mwf|tts --lang Hindi --about "..." --medicines "..."
//   npm run calls -- consent <id> "Spoke to him on 2 Nov, he said yes"     nobody is rung before this
//   npm run calls -- call <id>             a test call, now
//   npm run calls -- today                 today's calls, with a WhatsApp link for each note
//   npm run calls -- transcript <id>       what was said in their latest call
//   npm run calls -- pause <id>  |  resume <id>
//   npm run calls -- halt                  stop ringing everyone, now
//   npm run calls -- paid <id> [days]      they paid (30 days by default)
//   npm run calls -- forget <id>           delete the family and everything about them
//   npm run calls -- signups               people who asked to join
//   npm run calls -- report                how the test is going
//   add --local to use the local Supabase stack instead of the hosted project
import { args, quote, sql } from './lib/query.mjs'
import { dayMessage, days, dayStatus, flags, FREE_DAYS, idPrefix, phone, report, TARGETS, time, whatsappLink } from './lib/calls.mjs'

const [cmd = 'list', id, extra] = args
const indiaDay = `(now() at time zone 'Asia/Kolkata')::date`

/** The one family an id prefix points to. */
function family(prefix) {
  const rows = sql(`select * from public.call_families where id::text like ${quote(`${idPrefix(prefix)}%`)}`)
  if (rows.length !== 1) throw new Error(rows.length ? 'That matches more than one family. Use more of the id.' : 'No family with that id.')
  return rows[0]
}

const mark = (ok) => (ok ? '✓' : '·')

function list() {
  const rows = sql(`
    select f.*, (select count(*) from public.call_attempts a where a.family_id = f.id and a.kind = 'daily') as calls
    from public.call_families f order by f.created_at`)
  if (!rows.length) return console.log('No families yet. Add one with: npm run calls -- add --child … (see docs/KHAIRIYAT.md)')
  for (const f of rows) {
    const consent = f.parent_consent_at ? 'parent said yes' : 'NOT YET ASKED, will not be called'
    const until = f.paid_until ? `, calls run until ${String(f.paid_until).slice(0, 10)}` : ''
    console.log(`${f.id.slice(0, 8)}  ${f.parent_name} (${f.parent_phone}), child ${f.child_name}, ${f.call_time.slice(0, 5)}, ${f.status}, ${consent}, ${f.calls} calls, paid ${f.months_paid} months${until}`)
  }
}

function add() {
  const f = flags(args.slice(1))
  if (!f.child || !f.parent) throw new Error('Give at least --child, --child-phone, --parent and --parent-phone')
  const language = f.lang ?? 'Hindi'
  const [row] = sql(`
    insert into public.call_families (child_name, child_phone, parent_name, parent_phone, language, call_time, call_days, talk_about, medicines)
    values (${quote(f.child)}, ${quote(phone(f['child-phone'], '--child-phone'))}, ${quote(f.parent)}, ${quote(phone(f['parent-phone'], '--parent-phone'))},
            ${quote(language)}, ${quote(time(f.time))}, ${quote(`{${days(f.days).join(',')}}`)}, ${quote(f.about ?? '')}, ${quote(f.medicines ?? '')})
    returning id`)
  console.log(`✓ added ${row.id.slice(0, 8)}. Nobody is called until you speak to ${f.parent} yourself and run: npm run calls -- consent ${row.id.slice(0, 8)} "how they said yes"`)
}

function consent() {
  if (!extra?.trim()) throw new Error('Say how they agreed, e.g. npm run calls -- consent 3f2a "Spoke to him on 2 Nov, he said yes"')
  const f = family(id)
  // The free week starts here. When it ends the calls stop by themselves, until `paid`.
  const [row] = sql(`
    update public.call_families
    set parent_consent_at = now(), consent_note = ${quote(extra)}, paid_until = coalesce(paid_until, ${indiaDay} + ${FREE_DAYS})
    where id = ${quote(f.id)} returning paid_until`)
  console.log(`✓ ${f.parent_name} said yes. Calls start at ${f.call_time.slice(0, 5)} India time and run until ${String(row.paid_until).slice(0, 10)}, the end of the free week.`)
}

async function call() {
  const f = family(id)
  const url = process.env.VITE_SUPABASE_URL
  if (!url || !process.env.CALL_CRON_SECRET) throw new Error('Needs VITE_SUPABASE_URL and CALL_CRON_SECRET from Doppler.')
  const res = await fetch(`${url}/functions/v1/call-dial`, {
    method: 'POST',
    headers: { 'x-call-secret': process.env.CALL_CRON_SECRET, 'content-type': 'application/json' },
    body: JSON.stringify({ test: f.id }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `The dialler said ${res.status}`)
  console.log(`✓ ${body.results?.[0]?.outcome ?? 'no call'}: ringing ${f.parent_phone}. See how it went with: npm run calls -- today`)
}

function today() {
  const families = sql(`select * from public.call_families where status <> 'stopped' order by created_at`)
  const calls = sql(`select * from public.call_attempts where call_date = ${indiaDay} order by created_at`)
  if (!families.length) return console.log('No families yet.')
  for (const f of families) {
    const mine = calls.filter((c) => c.family_id === f.id)
    console.log(`\n${f.parent_name} (${f.child_name}): ${dayStatus(mine)}${f.status === 'paused' ? ', PAUSED' : ''}`)
    const urgent = mine.find((c) => c.urgent)
    if (urgent) console.log(`  ⚠ URGENT: ${urgent.urgent}. Alert: ${mine.find((c) => c.kind === 'alert')?.status ?? 'not placed'}`)
    const message = dayMessage(f, mine)
    if (message) console.log(`${message.replace(/^/gm, '  ')}\n  Send: ${whatsappLink(f.child_phone, message)}`)
  }
}

function transcript() {
  const f = family(id)
  const [c] = sql(`select * from public.call_attempts where family_id = ${quote(f.id)} and transcript is not null order by created_at desc limit 1`)
  if (!c) return console.log('No transcript. Nothing connected yet, or it is over 30 days old.')
  console.log(`${c.call_date}, ${Math.round(Number(c.seconds ?? 0))} sec`)
  for (const t of c.transcript) console.log(`${t.role === 'agent' ? 'Asha' : f.parent_name}: ${t.en_text}`)
}

function setStatus(status) {
  const f = family(id)
  sql(`update public.call_families set status = ${quote(status)} where id = ${quote(f.id)} returning id`)
  console.log(`✓ ${f.parent_name}: ${status}`)
}

function halt() {
  const rows = sql(`update public.call_families set status = 'paused' where status = 'active' returning id`)
  console.log(`✓ paused ${rows.length} families. Nobody will be rung. Calls already under way finish by themselves. Bring one back with: npm run calls -- resume <id>`)
}

function paid() {
  const f = family(id)
  const length = Number(extra ?? 30)
  if (!Number.isInteger(length) || length < 1 || length > 400) throw new Error('Days must be a whole number, like 30')
  const [row] = sql(`
    update public.call_families
    set paid_until = greatest(coalesce(paid_until, ${indiaDay}), ${indiaDay}) + ${length}, months_paid = months_paid + 1
    where id = ${quote(f.id)} returning paid_until, months_paid`)
  console.log(`✓ paid until ${String(row.paid_until).slice(0, 10)}, month ${row.months_paid}`)
}

function forget() {
  const f = family(id)
  sql(`delete from public.call_families where id = ${quote(f.id)} returning id`)
  console.log(`✓ deleted ${f.parent_name}'s family and all their calls from our database. Sarvam and Anthropic keep their own copies under their own terms.`)
}

function signups() {
  const rows = sql(`select * from public.call_signups order by created_at desc limit 200`)
  if (!rows.length) return console.log('No sign-ups yet.')
  for (const s of rows) console.log(`${new Date(s.created_at).toLocaleString('en-IN')}  ${s.name}, ${s.phone}, parents in ${s.parent_city || '?'}, lives ${s.lives}`)
}

function score() {
  const families = sql(`select * from public.call_families`)
  const attempts = sql(`select family_id, call_date, kind, status, parent_spoke, seconds from public.call_attempts`)
  const r = report(families, attempts)
  console.log(`Families: ${families.length}. Alerts: ${r.alerts}. Spent on calls: about ₹${r.rupees} (${r.billedMinutes} billed minutes).\n`)
  console.log(`${mark(r.passes.pickup)} Parents picked up: ${r.pickup === null ? 'no calls yet' : `${Math.round(r.pickup * 100)}% of days (${r.picked} of ${r.callDays})`}. Target: ${TARGETS.pickup * 100}% or more.`)
  console.log(`${mark(r.passes.minutes)} Average call: ${r.averageMinutes === null ? 'no calls yet' : `${r.averageMinutes.toFixed(1)} min`}. Target: under ${TARGETS.minutes} min.`)
  console.log(`${mark(r.passes.paying)} Families who paid after the free week: ${r.paying}. Target: ${TARGETS.paying} or more.`)
}

const run = { list, add, consent, call, today, transcript, pause: () => setStatus('paused'), resume: () => setStatus('active'), halt, paid, forget, signups, report: score }[cmd]

try {
  if (!run) throw new Error(`Unknown command "${cmd}". See the top of scripts/calls.mjs.`)
  await run()
} catch (e) {
  console.error(`✗ ${e.message}`)
  process.exit(1)
}
