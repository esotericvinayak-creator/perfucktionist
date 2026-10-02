// Accounts.
// - Cloud mode: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY and users get real accounts
//   (email + password, Google, password reset). Supabase is only downloaded in this mode.
// - Preview mode (no keys): accounts live on this device, with the password stored as a
//   PBKDF2 hash. Good for trying the flow; nothing syncs between devices.
import { useSyncExternalStore } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { update } from './progress'

export type Account = { id: string; email: string; name: string }
type AuthState = { status: 'loading' | 'out' | 'in'; user: Account | null; recovering: boolean }

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const cloud = !!(URL && KEY)

let state: AuthState = { status: 'loading', user: null, recovering: false }
const listeners = new Set<() => void>()
function set(next: Partial<AuthState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
export const useAuth = () => useSyncExternalStore(subscribe, () => state)

/** Give the progress store the account's name if it doesn't have one yet. */
function adoptName(a: Account) {
  if (a.name) update((p) => (p.name ? {} : { name: a.name }))
}

// ─── cloud (Supabase) ─────────────────────────────────────────
let sb: SupabaseClient | null = null
async function client() {
  if (!sb) {
    const { createClient } = await import('@supabase/supabase-js')
    // PKCE puts the login code in ?code=…, which keeps our #/hash routes intact.
    sb = createClient(URL!, KEY!, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } })
  }
  return sb
}
const fromUser = (u: User): Account => ({ id: u.id, email: u.email ?? '', name: (u.user_metadata?.name as string | undefined) ?? (u.user_metadata?.full_name as string | undefined) ?? '' })
const redirectTo = () => `${window.location.origin}${window.location.pathname}`

// ─── preview (on-device) ──────────────────────────────────────
type LocalAccount = Account & { salt: string; hash: string }
const ACCOUNTS = 'pf:accounts'
const SESSION = 'pf:session'

function readAccounts(): Record<string, LocalAccount> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS) ?? '{}') as Record<string, LocalAccount>
  } catch {
    return {}
  }
}
function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // storage blocked — the session lasts until the tab closes
  }
}
const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
async function hashPassword(password: string, salt: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 150_000, hash: 'SHA-256' }, key, 256)
  return toB64(new Uint8Array(bits))
}

// ─── public API ───────────────────────────────────────────────
export async function initAuth() {
  if (cloud) {
    try {
      const c = await client()
      const { data } = await c.auth.getSession()
      const user = data.session ? fromUser(data.session.user) : null
      set({ status: user ? 'in' : 'out', user })
      if (user) adoptName(user)
      c.auth.onAuthStateChange((event, session) => {
        const u = session ? fromUser(session.user) : null
        set({ status: u ? 'in' : 'out', user: u, recovering: event === 'PASSWORD_RECOVERY' ? true : state.recovering })
        if (u) adoptName(u)
      })
    } catch {
      set({ status: 'out', user: null })
    }
    return
  }
  let email: string | null = null
  try {
    email = localStorage.getItem(SESSION)
  } catch {
    email = null
  }
  const acc = email ? readAccounts()[email] : undefined
  set(acc ? { status: 'in', user: { id: acc.id, email: acc.email, name: acc.name } } : { status: 'out', user: null })
}

export type Result = { ok: true; confirmEmail?: boolean } | { ok: false; error: string }

const friendly = (msg: string) =>
  /invalid login/i.test(msg) ? 'Wrong email or password.' : /already registered|already exists/i.test(msg) ? 'That email already has an account — log in instead.' : /rate limit/i.test(msg) ? 'Too many tries. Wait a minute and try again.' : msg

export async function signUp(name: string, email: string, password: string): Promise<Result> {
  email = email.trim().toLowerCase()
  if (cloud) {
    const c = await client()
    const { data, error } = await c.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirectTo() } })
    if (error) return { ok: false, error: friendly(error.message) }
    update(() => ({ name }))
    return { ok: true, confirmEmail: !data.session }
  }
  const accounts = readAccounts()
  if (accounts[email]) return { ok: false, error: 'That email already has an account on this device — log in instead.' }
  const salt = toB64(crypto.getRandomValues(new Uint8Array(16)))
  const acc: LocalAccount = { id: crypto.randomUUID(), email, name, salt, hash: await hashPassword(password, salt) }
  save(ACCOUNTS, JSON.stringify({ ...accounts, [email]: acc }))
  save(SESSION, email)
  update(() => ({ name }))
  set({ status: 'in', user: { id: acc.id, email, name } })
  return { ok: true }
}

export async function logIn(email: string, password: string): Promise<Result> {
  email = email.trim().toLowerCase()
  if (cloud) {
    const c = await client()
    const { error } = await c.auth.signInWithPassword({ email, password })
    return error ? { ok: false, error: friendly(error.message) } : { ok: true }
  }
  const acc = readAccounts()[email]
  if (!acc || (await hashPassword(password, acc.salt)) !== acc.hash) return { ok: false, error: 'Wrong email or password.' }
  save(SESSION, email)
  const user = { id: acc.id, email, name: acc.name }
  adoptName(user)
  set({ status: 'in', user })
  return { ok: true }
}

export async function logInWithGoogle(): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Google sign-in turns on once accounts are connected.' }
  const c = await client()
  const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })
  return error ? { ok: false, error: friendly(error.message) } : { ok: true }
}

export async function sendReset(email: string): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Preview accounts can’t reset passwords yet. Create a new account on this device instead.' }
  const c = await client()
  const { error } = await c.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectTo() })
  return error ? { ok: false, error: friendly(error.message) } : { ok: true }
}

export async function setNewPassword(password: string): Promise<Result> {
  const c = await client()
  const { error } = await c.auth.updateUser({ password })
  if (error) return { ok: false, error: friendly(error.message) }
  set({ recovering: false })
  return { ok: true }
}

export async function logOut() {
  if (cloud) await (await client()).auth.signOut()
  else save(SESSION, null)
  set({ status: 'out', user: null, recovering: false })
}

void initAuth()
