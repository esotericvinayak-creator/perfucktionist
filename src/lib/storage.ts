import { useEffect, useState } from 'react'

const PREFIX = 'pf:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/** useState that survives reloads. Storage can be blocked (private mode), so it silently degrades to memory. */
export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // storage unavailable — keep it in memory only
    }
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
