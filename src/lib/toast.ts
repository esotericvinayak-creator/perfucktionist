export type Toast = { id: number; icon: string; title: string; sub?: string; tone?: 'xp' | 'badge' | 'streak' | 'info' }

type Listener = (t: Toast) => void
const listeners = new Set<Listener>()
let nextId = 1

export function toast(t: Omit<Toast, 'id'>) {
  const full = { ...t, id: nextId++ }
  listeners.forEach((l) => l(full))
}

export function onToast(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
