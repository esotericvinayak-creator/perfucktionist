// Check and confirm Plus payments. People pay your UPI ID and send the 12-digit reference;
// you compare it with your own PhonePe history, then confirm it here and they get Plus.
//
//   npm run pay                       payments waiting to be checked
//   npm run pay -- all                every payment
//   npm run pay -- verify <reference> confirm one (gives Plus: 31 days monthly, 366 days yearly)
//   npm run pay -- reject <reference> say it didn't match
//   add --local to use the local Supabase stack instead of the hosted project
import { args, quote, sql } from './lib/query.mjs'

const [cmd = 'list', utr] = args
const clean = (u) => {
  if (!/^\d{12}$/.test(u ?? '')) {
    console.error('Give the 12-digit reference, e.g. npm run pay -- verify 123456789012')
    process.exit(2)
  }
  return u
}

if (cmd === 'verify') {
  const [{ until }] = sql(`select public.verify_payment(${quote(clean(utr))}) as until`)
  console.log(`✓ verified ${utr}. Plus runs until ${new Date(until).toLocaleString('en-IN')}.`)
} else if (cmd === 'reject') {
  sql(`select public.reject_payment(${quote(clean(utr))})`)
  console.log(`✗ rejected ${utr}.`)
} else {
  const rows = sql(`
    select p.created_at, p.status, p.plan, p.amount, p.utr, u.email
    from public.payments p join auth.users u on u.id = p.user_id
    ${cmd === 'all' ? '' : "where p.status = 'pending'"}
    order by p.created_at desc limit 100`)
  if (!rows.length) console.log(cmd === 'all' ? 'No payments yet.' : 'Nothing waiting. 🎉')
  for (const r of rows) console.log(`${new Date(r.created_at).toLocaleString('en-IN')}  ${r.status.padEnd(8)} ₹${String(r.amount).padEnd(4)} ${r.plan.padEnd(7)} ref ${r.utr}  ${r.email}`)
  if (cmd !== 'all' && rows.length) console.log('\nMatch the reference and amount in PhonePe, then: npm run pay -- verify <reference>')
}
