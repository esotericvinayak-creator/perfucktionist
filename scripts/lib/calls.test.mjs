// npm run calls:test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dayMessage, days, dayStatus, flags, idPrefix, phone, report, time, whatsappLink } from './calls.mjs'

const family = { child_name: 'Neha', parent_name: 'Papa', months_paid: 0 }
const call = (over = {}) => ({ family_id: 'f1', call_date: '2026-11-02', kind: 'daily', status: 'connected', parent_spoke: true, seconds: 150, note: 'Papa theek lag rahe the.', medicine_status: 'taken', reason_to_call: 'Sunday ko chacha aa rahe hain.', ...over })

test('flags reads pairs and refuses a missing value', () => {
  assert.deepEqual(flags(['--child', 'Neha', '--time', '10:30']), { child: 'Neha', time: '10:30' })
  assert.throws(() => flags(['--child']))
  assert.throws(() => flags(['--child', '--time', '10:30']))
})

test('phone keeps the country code and refuses a number without one', () => {
  assert.equal(phone('+91 98765-43210', 'x'), '+919876543210')
  assert.throws(() => phone('9876543210', 'x'))
})

test('time stays inside calling hours', () => {
  assert.equal(time('10:30'), '10:30')
  assert.throws(() => time('08:59'))
  assert.throws(() => time('20:01'))
  assert.throws(() => time('7pm'))
})

test('days understands the three plans', () => {
  assert.equal(days().length, 7)
  assert.deepEqual(days('mwf'), [1, 3, 5])
  assert.throws(() => days('weekends'))
})

test('idPrefix keeps quotes out of queries', () => {
  assert.equal(idPrefix('3f2a'), '3f2a')
  assert.throws(() => idPrefix("3f2a' or 1=1"))
  assert.throws(() => idPrefix(undefined))
})

test('a good day becomes a note that says it was written by AI', () => {
  const m = dayMessage(family, [call()])
  assert.match(m, /Neha ji, aaj Papa se baat hui/)
  assert.match(m, /Dawai: le li/)
  assert.match(m, /Aaj ki baat: Sunday/)
  assert.match(m, /AI ne likha/)
})

test('no reason to call means no empty line for it', () => {
  assert.doesNotMatch(dayMessage(family, [call({ reason_to_call: '' })]), /Aaj ki baat/)
})

test('a missed day says so, without alarm or false comfort', () => {
  const m = dayMessage(family, [call({ status: 'no_answer', parent_spoke: false }), call({ status: 'busy', parent_spoke: false })])
  assert.match(m, /call nahi uthaya/)
  assert.match(m, /ek baar khud call/)
})

test('nothing is sent while a call is still going, or when a note failed', () => {
  assert.equal(dayMessage(family, [call({ status: 'dialing', parent_spoke: false })]), null)
  assert.equal(dayMessage(family, [call({ note: null })]), null)
  assert.equal(dayMessage(family, []), null)
})

test('a blocked number is shown, not hidden', () => {
  assert.match(dayStatus([call({ status: 'failed', parent_spoke: false, failure_reason: 'registered under TRAI NDNC' })]), /NDNC/)
  assert.match(dayStatus([call({ note: null })]), /note failed/)
  assert.match(dayStatus([call({ parent_spoke: false })]), /voicemail/)
  assert.equal(dayStatus([]), 'no call yet')
})

test('the WhatsApp link has digits only and survives line breaks', () => {
  assert.equal(whatsappLink('+14155550100', 'a\nb'), 'https://wa.me/14155550100?text=a%0Ab')
})

test('a retry that gets through counts as one picked-up day', () => {
  const r = report([], [call({ status: 'no_answer', parent_spoke: false, seconds: null }), call()])
  assert.equal(r.callDays, 1)
  assert.equal(r.picked, 1)
  assert.equal(r.pickup, 1)
})

test('voicemail costs money but is not a pickup', () => {
  const r = report([], [call({ parent_spoke: false, seconds: 20 })])
  assert.equal(r.pickup, 0)
  assert.equal(r.billedMinutes, 1)
  assert.equal(r.averageMinutes, null)
})

test('each call is billed in whole minutes, alerts included', () => {
  const r = report([], [call({ seconds: 121 }), call({ call_date: '2026-11-03', seconds: 60 }), call({ kind: 'alert', seconds: 30 })])
  assert.equal(r.billedMinutes, 5)
  assert.equal(r.rupees, 20)
  assert.equal(r.alerts, 1)
})

test('calls still in progress are left out of the score', () => {
  assert.equal(report([], [call({ status: 'dialing', parent_spoke: false })]).callDays, 0)
})

test('the targets pass and fail where they should', () => {
  const families = Array.from({ length: 10 }, () => ({ months_paid: 1 }))
  const spoke = Array.from({ length: 7 }, (_, i) => call({ call_date: `2026-11-1${i}` }))
  const missed = Array.from({ length: 3 }, (_, i) => call({ call_date: `2026-11-2${i}`, status: 'no_answer', parent_spoke: false }))
  assert.deepEqual(report(families, [...spoke, ...missed]).passes, { pickup: true, minutes: true, paying: true })

  const poor = report(families.slice(1), [...spoke.slice(1), ...missed, call({ call_date: '2026-11-29', seconds: 240 })])
  assert.equal(poor.passes.paying, false)
  assert.equal(report([], []).passes.pickup, false)
  assert.equal(report([], [call({ seconds: 180 })]).passes.minutes, false)
})
