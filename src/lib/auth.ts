// Accounts.
// - Cloud mode: VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (from Doppler, see README) give
//   real accounts (email + password, Google, password reset) and sync (sync.ts). Supabase is
//   only downloaded in this mode.
// - Preview mode (no keys): accounts live on this device, with the password stored as a
//   PBKDF2 hash. Good for trying the flow; nothing syncs between devices.
import { useSyncExternalStore } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { inNativeApp } from './install'
import { update } from './progress'

export type Account = { id: string; email: string; name: string }
type AuthState = { status: 'loading' | 'out' | 'in'; user: Account | null; recovering: boolean }

const URL = import.meta.env.VITE_SUPABASE_URL
// The publishable key is meant to be public; row level security protects the data. The older
// "anon" key works the same way. Never put the secret / service_role key here.
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
/** The public website. The Android app runs at https://localhost, so email links must point here instead. */
const SITE = import.meta.env.VITE_SITE_URL
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
export const authNow = () => state
/** Called on every sign-in, sign-out and account switch. */
export const onAuthChange = subscribe

// Sync hooks in here rather than auth importing sync, which would be a loop.
const beforeLeave = new Set<() => Promise<void>>()
/** Runs before logging out (e.g. upload unsent changes). Each gets a few seconds at most. */
export function beforeLogOut(fn: () => Promise<void>) {
  beforeLeave.add(fn)
}
const deleted = new Set<() => void>()
/** Runs after this account is deleted. */
export function onAccountDeleted(fn: () => void) {
  deleted.add(fn)
}
const leaving = () => Promise.race([Promise.allSettled([...beforeLeave].map((fn) => fn())), new Promise((r) => setTimeout(r, 3000))])

/** Give the progress store the account's name if it doesn't have one yet. */
function adoptName(a: Account) {
  if (a.name) update((p) => (p.name ? {} : { name: a.name }))
}

// ─── cloud (Supabase) ─────────────────────────────────────────
let sb: SupabaseClient | null = null
/** The Supabase client. Only call this in cloud mode. */
export async function client() {
  if (!sb) {
    const { createClient } = await import('@supabase/supabase-js')
    // PKCE puts the login code in ?code=…, which keeps our #/hash routes intact.
    sb = createClient(URL!, KEY!, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } })
  }
  return sb
}
const fromUser = (u: User): Account => ({ id: u.id, email: u.email ?? '', name: (u.user_metadata?.name as string | undefined) ?? (u.user_metadata?.full_name as string | undefined) ?? '' })
// Email confirmations and password resets open in the phone's browser, not in the app, so from the
// Android app they go to the website.
const redirectTo = () => (inNativeApp() && SITE ? SITE : `${window.location.origin}${window.location.pathname}`)

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

/** Google refuses to sign in inside apps' built-in browsers, so the Android app offers email only. */
export const googleAvailable = () => cloud && !inNativeApp()

export async function logInWithGoogle(): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Google sign-in turns on once accounts are connected.' }
  if (inNativeApp()) return { ok: false, error: 'Google sign-in works on the website. In the app, use email.' }
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
  await leaving()
  if (cloud) await (await client()).auth.signOut()
  else save(SESSION, null)
  set({ status: 'out', user: null, recovering: false })
}

/**
 * Deletes the account and everything synced to it. Things that only ever lived on this
 * phone (journal, cycle tracker, money…) stay here; "reset my progress" clears the rest.
 */
export async function deleteAccount(): Promise<Result> {
  if (cloud) {
    const c = await client()
    // public.delete_account() removes the login; the synced rows go with it (on delete cascade).
    const { error } = await c.rpc('delete_account')
    if (error) return { ok: false, error: friendly(error.message) }
    // The session died with the account, so only clear it locally.
    await c.auth.signOut({ scope: 'local' })
  } else {
    const email = state.user?.email
    const accounts = readAccounts()
    if (email) delete accounts[email]
    save(ACCOUNTS, JSON.stringify(accounts))
    save(SESSION, null)
  }
  deleted.forEach((fn) => fn())
  set({ status: 'out', user: null, recovering: false })
  return { ok: true }
}

void initAuth()
