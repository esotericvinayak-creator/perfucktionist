import { useEffect, type ComponentType } from 'react'
import { Footer } from './components/Footer'
import { MiniPlayer } from './components/MiniPlayer'
import { Nav } from './components/Nav'
import { ShareHost, Toaster } from './components/Overlays'
import { TabBar } from './components/TabBar'
import { WebView } from './components/WebView'
import { PlayerProvider } from './context/Player'
import { zoneByPath } from './data/zones'
import { useAuth } from './lib/auth'
import { applyStreakFreeze } from './lib/progress'
import { useRoute } from './lib/router'
import Auth from './pages/Auth'
import Brave from './pages/Brave'
import Breathe from './pages/Breathe'
import Bro from './pages/Bro'
import Faith from './pages/Faith'
import Get from './pages/Get'
import Fam from './pages/Fam'
import Green from './pages/Green'
import Happy from './pages/Happy'
import Explore from './pages/Explore'
import Journeys from './pages/Journeys'
import Library from './pages/Library'
import Listen from './pages/Listen'
import Me from './pages/Me'
import Music from './pages/Music'
import NotFound from './pages/NotFound'
import Plus from './pages/Plus'
import Read from './pages/Read'
import Shield from './pages/Shield'
import Today from './pages/Today'
import Tools from './pages/Tools'
import Unperfect from './pages/Unperfect'

const pages: Record<string, ComponentType> = {
  '/': Today,
  '/about': Today,
  '/listen': Listen,
  '/read': Read,
  '/explore': Explore,
  '/unperfect': Unperfect,
  '/shield': Shield,
  '/bro': Bro,
  '/library': Library,
  '/shlokas': Library,
  '/breathe': Breathe,
  '/music': Music,
  '/happy': Happy,
  '/brave': Brave,
  '/fam': Fam,
  '/faith': Faith,
  '/green': Green,
  '/me': Me,
  '/journeys': Journeys,
  '/plus': Plus,
  '/get': Get,
  '/tools': Tools,
}

// Safety comes before sign-up: these stay open even when logged out.
const PUBLIC = ['/shield', '/tools/panic', '/tools/safe-walk', '/get']

export default function App() {
  const route = useRoute()
  const auth = useAuth()
  // Only the first segment picks the page; the rest is for the page itself (e.g. #/library/gita/2).
  const base = `/${route.split('/')[1] ?? ''}`
  const Page = pages[base] ?? NotFound

  useEffect(() => {
    const zone = zoneByPath(base)
    document.title = zone ? `${zone.title} — perfucktionist` : 'perfucktionist — perfection is a scam'
  }, [base])

  useEffect(() => {
    applyStreakFreeze()
  }, [])

  if (auth.status === 'loading')
    return (
      <div className="splash" aria-busy="true">
        <span className="logo-text">
          per<span className="logo-hl">fuck</span>tionist
        </span>
      </div>
    )
  if ((auth.status === 'out' && !PUBLIC.includes(route)) || auth.recovering) return <Auth />

  return (
    <PlayerProvider>
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        Skip to content
      </a>
      <Nav route={route} />
      <main id="main" tabIndex={-1}>
        <Page key={route} />
      </main>
      <Footer />
      <MiniPlayer />
      <TabBar route={route} />
      <Toaster />
      <ShareHost />
      <WebView />
    </PlayerProvider>
  )
}
