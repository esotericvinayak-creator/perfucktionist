// A small service worker so the app opens instantly and the shell still works offline.
// It caches our own files only. Scripture, books and music are fetched live and never cached here.
//
// Updates: the build stamps BUILD (vite.config.ts), so each deploy is a new worker. A new worker
// waits instead of taking over mid-session; the app shows "refresh", and only then do we switch.
const BUILD = '__BUILD__'
const CACHE = `pf-shell-${BUILD}`
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icons/icon-192.png', './icons/icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => undefined),
  )
})

self.addEventListener('message', (e) => {
  // The app sends this when the person taps "refresh".
  if (e.data === 'skip-waiting') self.skipWaiting()
  // "Which build are you?" — lets a page that already loaded this build switch without asking.
  if (e.data === 'build?') e.ports[0]?.postMessage(BUILD)
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Only our own origin. Other people's sites are always fetched fresh.
  if (url.origin !== self.location.origin) return

  // Navigations: serve the app shell so a reload works offline and on any route.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html').then((r) => r ?? Response.error())))
    return
  }

  // Built assets are content-hashed, so cache-first is safe and fast.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ??
        fetch(req)
          .then((res) => {
            if (res.ok && (url.pathname.includes('/assets/') || url.pathname.startsWith('/icons/'))) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => caches.match('./index.html').then((r) => r ?? Response.error())),
    ),
  )
})
