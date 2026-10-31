// Your account, kept short: you only need one to buy the pass.
import { CheckForUpdates } from '../components/UpdatePrompt'
import { cloud, deleteAccount, logOut, useAuth } from '../lib/auth'
import { alreadyInstalled } from '../lib/install'
import { usePlus } from '../lib/plus'
import { useTheme } from '../lib/theme'
import { toast } from '../lib/toast'
import { versionLabel } from '../lib/update'

async function removeAccount() {
  const typed = prompt(`This deletes your account${cloud ? ' and anything synced to it' : ''}. It can’t be undone.\n\nAnything saved on this phone stays here until you clear it.\n\nType delete to confirm.`)
  if (typed?.trim().toLowerCase() !== 'delete') return
  const r = await deleteAccount()
  if (r.ok) toast({ icon: '👋', title: 'Account deleted', sub: 'everything in it is gone' })
  else toast({ icon: '⚠️', title: 'Couldn’t delete your account', sub: r.error })
}

export default function Me() {
  const auth = useAuth()
  const plus = usePlus()
  const [theme, setTheme] = useTheme()
  const signedIn = auth.status === 'in'

  return (
    <div className="page mk">
      <header className="mk-head">
        <p className="kicker">you</p>
        <h1>{signedIn ? `hey ${auth.user?.name || 'you'}` : 'no account needed'}</h1>
        {!signedIn && <p className="lede">Everything free works without one. You only need an account to buy the pass.</p>}
      </header>

      <section className="settings">
        <div className="set-row">
          <span>
            account
            <small className="set-sub">{signedIn ? auth.user?.email : 'not logged in'}</small>
          </span>
          {signedIn ? (
            <button type="button" className="btn btn-sm" onClick={() => confirm('Log out of perfectish?') && void logOut()}>
              log out
            </button>
          ) : (
            <a className="btn btn-sm btn-primary a-lime" href="#/login">
              log in
            </a>
          )}
        </div>
        <div className="set-row">
          <span>
            the pass
            <small className="set-sub">{plus.active ? `${plus.daysLeft} ${plus.daysLeft === 1 ? 'day' : 'days'} left` : 'unlocks the full Leak Check'}</small>
          </span>
          <a className="btn btn-sm" href="#/plus">
            {plus.active ? 'view' : 'get it'}
          </a>
        </div>
        <div className="set-row">
          <span>theme</span>
          <div className="row gap-sm">
            <button type="button" className={`chip${theme === 'dark' ? ' on' : ''}`} onClick={() => setTheme('dark')}>
              ☾ dark
            </button>
            <button type="button" className={`chip${theme === 'light' ? ' on' : ''}`} onClick={() => setTheme('light')}>
              ☀︎ light
            </button>
          </div>
        </div>
        <div className="set-row">
          <span>
            app version
            <small className="set-sub">{versionLabel()}</small>
          </span>
          <div className="row gap-sm">
            {!alreadyInstalled() && (
              <a className="btn btn-sm" href="#/get">
                get the app
              </a>
            )}
            <CheckForUpdates />
          </div>
        </div>
        {signedIn && (
          <div className="set-row">
            <span>
              delete my account
              <small className="set-sub">this can’t be undone</small>
            </span>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => void removeAccount()}>
              delete
            </button>
          </div>
        )}
      </section>

      <p className="muted">Your claims and leak notes are saved on this phone only. Your messages and statements are never saved.</p>
    </div>
  )
}
