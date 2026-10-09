import { useEffect, useState } from 'react'

// Hash routing (#/music) so the site works on any static host without rewrite rules.
function current() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : '/'
}

// Browsing screens remember where you were: open a tool from halfway down Discover, come back,
// and you're halfway down Discover again. Everything else (a tool, a reader, a form) opens at the top.
const REMEMBERS = /^\/(explore|library|listen|read|journeys|music)(\/|$)/
const positions = new Map<string, number>()
let shown = current()

/** Scroll to `y` once the page is tall enough (lists render a frame or two after the route changes). */
function restore(y: number) {
  let tries = 0
  const tick = () => {
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
    if (Math.abs(window.scrollY - y) > 2 && tries++ < 40) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function useRoute() {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const onChange = () => {
      // Plain in-page anchors (#something) aren't routes — leave the page alone.
      if (window.location.hash && !window.location.hash.startsWith('#/')) return
      const next = current()
      if (REMEMBERS.test(shown)) positions.set(shown, window.scrollY)
      shown = next
      setRoute(next)
      const saved = REMEMBERS.test(next) ? positions.get(next) : undefined
      if (saved) restore(saved)
      else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
