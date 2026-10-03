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
/** A one-off message for the welcome/login screens, e.g. after following an email link. */
export type Notice = { tone: 'ok' | 'error'; text: string }
type AuthState = { status: 'loading' | 'out' | 'in'; user: Account | null; recovering: boolean; notice: Notice | null }

const URL = import.meta.env.VITE_SUPABASE_URL
// The publishable key is meant to be public; row level security protects the data. The older
// "anon" key works the same way. Never put the secret / service_role key here.
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
/** The public website. The Android app runs at https://localhost, so email links must point here instead. */
const SITE = import.meta.env.VITE_SITE_URL?.replace(/\/+$/, '')
export const cloud = !!(URL && KEY)

// ─── email links ──────────────────────────────────────────────
// Confirmation and reset emails come back to the website as ?auth=signup|reset (&app=1 when
// they were asked for in the Android app) plus Supabase's ?code=… or an error.
// - Asked for on the website: supabase-js finishes it here, if this browser started it.
// - Asked for in the app: only the app can finish it (it holds the PKCE secret), so the website
//   shows "open the app", which hands the code over through the in.perfucktionist.app:// link.
export type LinkKind = 'signup' | 'reset'
export const APP_SCHEME = 'in.perfucktionist.app'
type Arrival = { kind: LinkKind; fromApp: boolean; code: string | null; flowId: string | null; error: string | null }

function readArrival(): Arrival | null {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  // Errors can also arrive in the hash, where they would look like a route.
  const h = window.location.hash.includes('error') ? new URLSearchParams(window.location.hash.replace(/^#\/?/, '')) : null
  const error = q.get('error_description') ?? h?.get('error_description') ?? null
  const kind = q.get('auth')
  if (!kind && !q.get('code') && !error) return null
  if (h) window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#/`)
  return { kind: kind === 'reset' ? 'reset' : 'signup', fromApp: q.get('app') === '1', code: q.get('code'), flowId: q.get('sb_flow_id'), error: error?.replace(/\+/g, ' ') ?? null }
}
/** What the email link brought, read once at load. */
export const arrival = readArrival()
/** An email link asked for in the app, opened in a browser: show the hand-over screen. */
export const appHandOver = arrival?.fromApp && !inNativeApp() ? arrival : null

/** Tidy ?auth=…&code=… off the address once it's been dealt with. */
function cleanAddress() {
  const url = new window.URL(window.location.href)
  for (const k of ['auth', 'app', 'code', 'sb_flow_id', 'error', 'error_code', 'error_description']) url.searchParams.delete(k)
  window.history.replaceState(window.history.state, '', url.toString())
}

let state: AuthState = { status: 'loading', user: null, recovering: false, notice: null }
const listeners = new Set<() => void>()
function set(next: Partial<AuthState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export const clearNotice = () => set({ notice: null })

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
    // PKCE puts the login code in ?code=…, which keeps our #/hash routes intact. An app's code
    // is left alone here: this browser doesn't hold its secret, so supabase-js skips it.
    sb = createClient(URL!, KEY!, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: !appHandOver } })
    // Listen straight away: a reset link fires PASSWORD_RECOVERY while the client is starting up.
    sb.auth.onAuthStateChange((event, session) => {
      const u = session ? fromUser(session.user) : null
      set({ status: u ? 'in' : 'out', user: u, recovering: event === 'PASSWORD_RECOVERY' ? true : event === 'SIGNED_OUT' ? false : state.recovering })
      if (u) adoptName(u)
    })
  }
  return sb
}
const fromUser = (u: User): Account => ({ id: u.id, email: u.email ?? '', name: (u.user_metadata?.name as string | undefined) ?? (u.user_metadata?.full_name as string | undefined) ?? '' })
// Where email links (and Google) send people back to. From the Android app that's the website,
// which hands the code back to the app; see "email links" above.
const redirectTo = (kind: LinkKind) => (inNativeApp() ? `${SITE ?? ''}/?auth=${kind}&app=1` : `${window.location.origin}${window.location.pathname}?auth=${kind}`)

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
      set({ status: user ? 'in' : 'out', user, notice: user || appHandOver ? null : arrivalNotice() })
      if (user) adoptName(user)
    } catch {
      set({ status: 'out', user: null })
    }
    if (arrival && !appHandOver) cleanAddress()
    if (inNativeApp()) void listenForAppLinks()
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
  /invalid login/i.test(msg)
    ? 'Wrong email or password.'
    : /email not confirmed/i.test(msg)
      ? 'Confirm your email first — the link is in your inbox (check spam too).'
      : /already registered|already exists/i.test(msg)
        ? 'That email already has an account — log in instead.'
        : /rate limit|security purposes/i.test(msg)
          ? 'Too many tries. Wait a minute and try again.'
          : msg

/** After an email link, when no one ended up logged in here: say what happened. */
function arrivalNotice(): Notice | null {
  if (!arrival) return null
  if (arrival.error) return { tone: 'error', text: `That link didn’t work: ${arrival.error}. ${arrival.kind === 'reset' ? 'Ask for a new one below.' : 'Log in — if your email still isn’t confirmed, we’ll send a fresh link.'}` }
  if (arrival.kind === 'reset') return { tone: 'error', text: 'That reset link opened in a different browser from the one you asked in. Ask for a new link here.' }
  return { tone: 'ok', text: '✓ Email confirmed. Log in to carry on.' }
}

// ─── links into the Android app ───────────────────────────────
// The website's "open the app" button opens in.perfucktionist.app://auth?code=…. The app holds
// the PKCE secret for that code, so it can finish the sign-up or password reset itself.
const handled = new Set<string>()
async function finishInApp(link: string) {
  let url: globalThis.URL
  try {
    url = new globalThis.URL(link)
  } catch {
    return
  }
  if (url.protocol !== `${APP_SCHEME}:`) return
  const code = url.searchParams.get('code')
  const kind = url.searchParams.get('type') === 'reset' ? 'reset' : 'signup'
  if (!code || handled.has(code)) return
  handled.add(code)
  const c = await client()
  const flowId = url.searchParams.get('sb_flow_id')
  const { error } = await c.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined)
  // Success fires SIGNED_IN, or PASSWORD_RECOVERY for a reset, through the listener in client().
  if (error)
    set({
      notice:
        kind === 'reset'
          ? { tone: 'error', text: 'That reset link has expired or was already used. Ask for a new one.' }
          : { tone: 'ok', text: '✓ Email confirmed. Log in to carry on.' },
    })
}

async function listenForAppLinks() {
  const { App } = await import('@capacitor/app')
  await App.addListener('appUrlOpen', ({ url }) => void finishInApp(url))
  const launch = await App.getLaunchUrl()
  if (launch?.url) await finishInApp(launch.url)
}

/** Send the confirmation email again (the login screen offers this when it's needed). */
export async function resendConfirmation(email: string): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Preview accounts don’t need confirming.' }
  const c = await client()
  const { error } = await c.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: redirectTo('signup') } })
  return error ? { ok: false, error: friendly(error.message) } : { ok: true }
}

export async function signUp(name: string, email: string, password: string): Promise<Result> {
  email = email.trim().toLowerCase()
  if (cloud) {
    const c = await client()
    const { data, error } = await c.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirectTo('signup') } })
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
  const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo('signup') } })
  return error ? { ok: false, error: friendly(error.message) } : { ok: true }
}

export async function sendReset(email: string): Promise<Result> {
  if (!cloud) return { ok: false, error: 'Preview accounts can’t reset passwords yet. Create a new account on this device instead.' }
  const c = await client()
  const { error } = await c.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectTo('reset') })
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
