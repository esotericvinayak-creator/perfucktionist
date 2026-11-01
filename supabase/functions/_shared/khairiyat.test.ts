// npm run calls:test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  askedToStop,
  dailyVariables,
  dueCalls,
  india,
  mayCall,
  outboundBody,
  parseNote,
  readResult,
  sameSecret,
  scanUrgent,
  testCall,
  type Attempt,
  type Family,
  type Turn,
} from './khairiyat.ts'

const family = (over: Partial<Family> = {}): Family => ({
  id: 'f1',
  child_name: 'Neha',
  child_phone: '+14155550100',
  parent_name: 'Papa',
  parent_phone: '+919876543210',
  language: 'Hindi',
  call_time: '10:30:00',
  call_days: [0, 1, 2, 3, 4, 5, 6],
  talk_about: '',
  medicines: '',
  parent_consent_at: '2026-11-01T05:00:00Z',
  status: 'active',
  paid_until: null,
  ...over,
})

// 2026-11-02 is a Monday. 10:35 in India is 05:05 UTC.
const at = (hhmm: string, day = '2026-11-02') => new Date(`${day}T${hhmm}:00+05:30`)
const user = (en_text: string): Turn => ({ role: 'user', en_text })
const attempt = (over: Partial<Attempt>): Attempt => ({ family_id: 'f1', attempt: 1, status: 'no_answer', created_at: at('10:30').toISOString(), ...over })

test('india() gives the Indian day, even late in the UTC evening', () => {
  assert.deepEqual(india(new Date('2026-11-01T20:00:00Z')), { date: '2026-11-02', minutes: 90, weekday: 1 })
})

test('a family is due from their time, for 25 minutes, and not after', () => {
  assert.equal(dueCalls([family()], [], at('10:29')).length, 0)
  assert.equal(dueCalls([family()], [], at('10:30'))[0].attempt, 1)
  assert.equal(dueCalls([family()], [], at('10:54')).length, 1)
  assert.equal(dueCalls([family()], [], at('10:55')).length, 0)
})

test('nobody is rung without a yes, or once paused, stopped or lapsed', () => {
  assert.equal(dueCalls([family({ parent_consent_at: null })], [], at('10:35')).length, 0)
  assert.equal(dueCalls([family({ status: 'paused' })], [], at('10:35')).length, 0)
  assert.equal(dueCalls([family({ status: 'stopped' })], [], at('10:35')).length, 0)
  assert.equal(dueCalls([family({ paid_until: '2026-11-01' })], [], at('10:35')).length, 0)
  assert.equal(dueCalls([family({ paid_until: '2026-11-02' })], [], at('10:35')).length, 1)
})

test('only on the chosen days', () => {
  assert.equal(dueCalls([family({ call_days: [2, 4, 6] })], [], at('10:35')).length, 0)
  assert.equal(dueCalls([family({ call_days: [1, 3, 5] })], [], at('10:35')).length, 1)
})

test('one call a day, plus one retry after 30 minutes if nobody answered', () => {
  const missed = [attempt({ status: 'no_answer' })]
  assert.equal(dueCalls([family()], missed, at('10:59')).length, 0)
  assert.equal(dueCalls([family()], missed, at('11:00'))[0].attempt, 2)
  assert.equal(dueCalls([family()], [attempt({ status: 'busy' })], at('11:00'))[0].attempt, 2)
  assert.equal(dueCalls([family()], [...missed, attempt({ attempt: 2 })], at('11:30')).length, 0)
  assert.equal(dueCalls([family()], [attempt({ status: 'connected' })], at('11:30')).length, 0)
  assert.equal(dueCalls([family()], [attempt({ status: 'failed' })], at('11:30')).length, 0)
  assert.equal(dueCalls([family()], [attempt({ status: 'dialing' })], at('11:30')).length, 0)
})

test('never outside 9am to 8:30pm India time, even for a retry', () => {
  const late = family({ call_time: '20:00:00' })
  const missed = [attempt({ status: 'no_answer', created_at: at('20:00').toISOString() })]
  assert.equal(dueCalls([late], missed, at('20:29')).length, 0)
  assert.equal(dueCalls([late], missed, at('20:30')).length, 0)
  assert.equal(dueCalls([family({ call_time: '08:00:00' })], [], at('08:05')).length, 0)
})

test('a test call needs the same yes and the same hours', () => {
  assert.equal(testCall(family(), [], at('15:00'))?.attempt, 1)
  assert.equal(testCall(family(), [attempt({ attempt: 3 })], at('15:00'))?.attempt, 4)
  assert.equal(testCall(family({ parent_consent_at: null }), [], at('15:00')), null)
  assert.equal(testCall(family(), [], at('22:00')), null)
})

test('mayCall counts the last paid day as paid', () => {
  assert.equal(mayCall(family({ paid_until: '2026-11-02' }), '2026-11-02'), true)
  assert.equal(mayCall(family({ paid_until: '2026-11-02' }), '2026-11-03'), false)
})

test('worrying things are caught', () => {
  const said = [
    'I have had chest pain since morning',
    'There is a pain in my chest',
    'I am finding it hard to breathe',
    'I fell in the bathroom yesterday',
    'I slipped and hurt my leg',
    'I fainted after breakfast',
    'My left arm has gone numb',
    'I am vomiting blood',
    'I just want to die now',
    'I do not want to live like this'.replace('do not', "don't"),
    'Someone called and is asking for my OTP',
    'They said it was a digital arrest',
    'Please call an ambulance',
  ]
  for (const s of said) assert.ok(scanUrgent([user(s)]), s)
})

test('ordinary days are not', () => {
  const said = [
    'I am fine, I slept well',
    'No chest pain at all',
    'I am not bleeding, it was only a scratch',
    'The fall weather is nice',
    'I took my medicine and ate roti',
    'My knee hurts a little',
    'Neha called me yesterday',
  ]
  for (const s of said) assert.equal(scanUrgent([user(s)]), null, s)
})

test('only the parent’s words count, not the agent’s', () => {
  assert.equal(scanUrgent([{ role: 'agent', en_text: 'If you have chest pain call 112' }]), null)
  assert.equal(scanUrgent(null), null)
})

test('asking to stop is heard', () => {
  assert.ok(askedToStop([user("Please don't call me again")]))
  assert.ok(askedToStop([user('Stop calling me')]))
  assert.ok(!askedToStop([user('Neha will call me tonight')]))
})

test('a good call is read properly', () => {
  const r = readResult({ attempt_id: 'a', status: 'connected', duration: 151.2, interaction_transcript: [{ role: 'agent', en_text: 'Hello' }, user('I am well')] })
  assert.equal(r.save.status, 'connected')
  assert.equal(r.save.parent_spoke, true)
  assert.equal(r.urgent, null)
  assert.equal(r.stop, false)
  assert.equal(r.writeNote, true)
})

test('voicemail is connected, but not a pickup, and gets no note', () => {
  const r = readResult({ status: 'connected', duration: 20, interaction_transcript: [{ role: 'agent', en_text: 'Namaste' }] })
  assert.equal(r.save.parent_spoke, false)
  assert.equal(r.writeNote, false)
})

test('the agent’s own flags are honoured too', () => {
  const r = readResult({ status: 'connected', final_agent_variables: { urgent: 'yes', stop_calls: 'yes' }, interaction_transcript: [user('Theek hai')] })
  assert.equal(r.urgent, 'ek zaroori baat')
  assert.equal(r.stop, true)
})

test('an unanswered call raises nothing, and a blocked number says why', () => {
  const none = readResult({ status: 'no_answer', duration: null, interaction_transcript: null })
  assert.equal(none.urgent, null)
  assert.equal(none.writeNote, false)
  const blocked = readResult({ status: 'failed', failure_reason: 'vobiz: Phone number is registered under TRAI NDNC' })
  assert.match(blocked.save.failure_reason ?? '', /NDNC/)
})

test('a status we’ve never seen counts as failed rather than vanishing', () => {
  const r = readResult({ status: 'exploded' })
  assert.equal(r.save.status, 'failed')
  assert.match(r.save.failure_reason ?? '', /exploded/)
})

test('the outbound request matches Sarvam’s documented shape', () => {
  const body = outboundBody(
    { apiKey: 'k', org: 'o', workspace: 'w', connection: 'c', number: '+918000000000' },
    { id: 'app', version: 3 },
    '+919876543210',
    { parent_name: 'Papa' },
    'call-1',
    'https://x/hook',
    'Hindi',
  )
  assert.deepEqual(body, {
    app_config: {
      app_id: 'app',
      app_version: 3,
      connection_config: { connection_id: 'c', agent_phone_number: '+918000000000' },
      agent_variables: { parent_name: 'Papa' },
      app_overrides: { initial_language_name: 'Hindi' },
    },
    user_config: { user_phone_number: '+919876543210' },
    webhook_config: { url: 'https://x/hook', metadata: { call_id: 'call-1' } },
  })
})

test('the agent gets something to go on, even on day one', () => {
  const first = dailyVariables(family(), [])
  assert.equal(first.recent_notes, 'This is the first call.')
  assert.equal(first.medicines, 'None listed.')
  assert.ok(dailyVariables(family(), ['x'.repeat(2000)]).recent_notes.length <= 800)
})

test('a usable note parses and a broken one does not', () => {
  const good = { note: 'Papa theek hain.', reason_to_call: '', medicines: 'taken', urgent: false, urgent_reason: '' }
  assert.deepEqual(parseNote(JSON.stringify(good)), good)
  assert.equal(parseNote('not json'), null)
  assert.equal(parseNote(JSON.stringify({ ...good, note: ' ' })), null)
  assert.equal(parseNote(JSON.stringify({ ...good, medicines: 'maybe' })), null)
  assert.equal(parseNote(JSON.stringify({ note: 'x' })), null)
})

test('secrets must match exactly, and an empty one never does', () => {
  assert.ok(sameSecret('abc', 'abc'))
  assert.ok(!sameSecret('abc', 'abd'))
  assert.ok(!sameSecret('abc', 'abcd'))
  assert.ok(!sameSecret('', ''))
})
