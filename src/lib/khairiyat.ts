// The website's sign-up form for the Khairiyat test. See docs/KHAIRIYAT.md.
import { client, cloud, type Result } from './auth'

export type Signup = { name: string; phone: string; parentCity: string; lives: 'india' | 'abroad' }

const messages: Record<string, string> = {
  '23514': 'That number doesn’t look right. Please check it and try again.',
  '53400': 'A lot of people are signing up right now. Please try again in an hour.',
  '42P01': 'Sign-ups aren’t open yet.',
  PGRST205: 'Sign-ups aren’t open yet.',
}

export async function signUpForCalls(s: Signup): Promise<Result> {
  if (!cloud) return { ok: false, error: 'This is a preview, so nothing was saved.' }
  const name = s.name.trim()
  const phone = s.phone.trim()
  if (!name) return { ok: false, error: 'Please add your name.' }
  if (!/^\+?[0-9][0-9 ()-]{7,19}$/.test(phone)) return { ok: false, error: messages['23514'] }
  const c = await client()
  const { error } = await c.from('call_signups').insert({ name, phone, parent_city: s.parentCity.trim(), lives: s.lives })
  if (error) return { ok: false, error: messages[error.code] ?? 'Couldn’t save that. Check your connection and try again.' }
  return { ok: true }
}
