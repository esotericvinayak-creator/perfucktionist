import { useEffect, type ComponentType } from 'react'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { Toaster } from './components/Overlays'
import { TabBar } from './components/TabBar'
import { UpdatePrompt } from './components/UpdatePrompt'
import { WebView } from './components/WebView'
import { zoneByPath } from './data/zones'
import { appHandOver, useAuth } from './lib/auth'
import { useRoute } from './lib/router'
import { useSync } from './lib/sync'
import Auth, { EmailHandOver } from './pages/Auth'
import Get from './pages/Get'
import GetItBack from './pages/GetItBack'
import Home from './pages/Home'
import LeakCheck from './pages/LeakCheck'
import Me from './pages/Me'
import NotFound from './pages/NotFound'
import Plus from './pages/Plus'
import ScamCheck from './pages/ScamCheck'
import Shield from './pages/Shield'

// Everything is open to everyone. An account is only needed to buy the pass.
const pages: Record<string, ComponentType> = {
  '/': Home,
  '/scam': ScamCheck,
  '/back': GetItBack,
  '/leak': LeakCheck,
  '/plus': Plus,
  '/me': Me,
  '/shield': Shield,
  '/get': Get,
}

const TITLES: Record<string, string> = {
  '/scam': 'Scam Check',
  '/back': 'Get It Back',
  '/leak': 'Leak Check',
  '/plus': 'The pass',
}

// Old safety links and home-screen shortcuts still land somewhere that helps.
const OLD_SAFETY = ['/tools/panic', '/tools/safe-walk']

export default function App() {
  const route = useRoute()
  const auth = useAuth()
  const sync = useSync()
  // Only the first segment picks the page; the rest is for the page itself (e.g. #/back/scam).
  const base = `/${route.split(/[/?]/)[1] ?? ''}`
  const Page = pages[base] ?? NotFound

  useEffect(() => {
    const zone = zoneByPath(base)
    const name = TITLES[base] ?? zone?.title
    document.title = name ? `${name} — perfectish` : 'perfectish — stop losing money, get it back'
  }, [base])

  useEffect(() => {
    if (OLD_SAFETY.includes(route)) window.location.hash = '/shield'
  }, [route])

  // An email link the app asked for, opened in the browser: hand it back to the app.
  if (appHandOver) return <EmailHandOver />
  // First login on a phone: wait (a few seconds at most) for your account to arrive.
  if (auth.status === 'loading' || (auth.status === 'in' && !sync.ready))
    return (
      <div className="splash" aria-busy="true">
        <span className="logo-text">
          perfect<span className="logo-hl">ish</span>
        </span>
      </div>
    )
  if (base === '/login' || auth.recovering || (auth.notice && auth.status === 'out'))
    return (
      <>
        <UpdatePrompt safe={false} />
        <Auth />
      </>
    )

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        Skip to content
      </a>
      <Nav route={route} />
      <UpdatePrompt safe={base === '/shield'} />
      <main id="main" tabIndex={-1}>
        <Page key={route} />
      </main>
      <Footer />
      <TabBar route={route} />
      <Toaster />
      <WebView />
    </>
  )
}
