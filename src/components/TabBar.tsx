import { Icon } from './Icon'
import { TABS, tabFor } from './Nav'

/** App-style bottom bar on phones — the same 4 places as the top nav on desktop. */
export function TabBar({ route }: { route: string }) {
  const tab = tabFor(route)
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <a key={t.path} href={`#${t.path}`} className={tab === t.path ? 'on' : ''} aria-current={tab === t.path ? 'page' : undefined}>
          <Icon name={t.label.toLowerCase()} size={22} />
          {t.label}
        </a>
      ))}
    </nav>
  )
}
