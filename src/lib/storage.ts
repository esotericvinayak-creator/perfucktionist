import { useEffect, useRef, useState } from 'react'

const PREFIX = 'pf:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/** The stored value, or undefined if there isn't one. */
export const peek = <T = unknown>(key: string): T | undefined => read<T | undefined>(key, undefined)

function stored(key: string) {
  try {
    return localStorage.getItem(PREFIX + key) !== null
  } catch {
    return false
  }
}

// ─── change feed ──────────────────────────────────────────────
// Two kinds of change. Edits made here (sync uploads them), and values that arrive
// from elsewhere (sync downloads them), which everything showing that key must reload.
type KeyListener = (key: string) => void
const edits = new Set<KeyListener>()
const arrivals = new Set<KeyListener>()

/** Save a value. Saving exactly what's already stored is not an edit, so it never triggers an upload. */
export function persist(key: string, value: unknown) {
  const raw = JSON.stringify(value)
  try {
    if (localStorage.getItem(PREFIX + key) === raw) return
    localStorage.setItem(PREFIX + key, raw)
  } catch {
    return // storage blocked — the caller keeps it in memory
  }
  edits.forEach((l) => l(key))
}

/** Store a value that came from somewhere else (undefined removes it) and tell everything showing it. */
export function replace(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    return
  }
  arrivals.forEach((l) => l(key))
}

export function onEdit(l: KeyListener) {
  edits.add(l)
  return () => {
    edits.delete(l)
  }
}

export function onArrival(key: string, l: () => void) {
  const listener: KeyListener = (k) => k === key && l()
  arrivals.add(listener)
  return () => {
    arrivals.delete(listener)
  }
}

/** useState that survives reloads. Storage can be blocked (private mode), so it silently degrades to memory. */
export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  const initial = useRef(fallback)
  useEffect(() => onArrival(key, () => setValue(read(key, initial.current))), [key])
  useEffect(() => {
    // Opening a page isn't an edit: the default only gets stored once something actually changes.
    if (!stored(key) && JSON.stringify(value) === JSON.stringify(initial.current)) return
    persist(key, value)
  }, [key, value])
  return [value, setValue] as const
}

/** Today's date as YYYY-MM-DD in local time — used for things that reset daily. */
export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function dayOfYear() {
  const now = new Date()
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
}

export function pick<T>(list: readonly T[], avoid?: T): T {
  if (list.length < 2) return list[0]
  let item = list[Math.floor(Math.random() * list.length)]
  while (item === avoid) item = list[Math.floor(Math.random() * list.length)]
  return item
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
