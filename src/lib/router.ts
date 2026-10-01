import { useEffect, useState } from 'react'

// Hash routing (#/music) so the site works on any static host without rewrite rules.
function current() {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith('/') ? hash : '/'
}

export function useRoute() {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const onChange = () => {
      // Plain in-page anchors (#something) aren't routes — leave the page alone.
      if (window.location.hash && !window.location.hash.startsWith('#/')) return
      setRoute(current())
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
