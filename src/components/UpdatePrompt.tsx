// "A new version is ready." How updates are found lives in src/lib/update.ts.
import { useState } from 'react'
import { Download, Phone, RefreshCw, Shield, X } from 'lucide-react'
import { prettySize } from '../lib/install'
import { toast } from '../lib/toast'
import { checkNow, later, refresh, useUpdate } from '../lib/update'

/** What happens after tapping update in the Android app: the browser takes over the download. */
function AppSteps() {
  return (
    <p className="upd-steps">
      Your browser is downloading it. Open the file when it’s done and tap <b>Update</b>. Your streak, notes and saved stuff stay put.
    </p>
  )
}

/** `safe` is true on the safety pages, which a required update must never block. */
export function UpdatePrompt({ safe }: { safe: boolean }) {
  const u = useUpdate()
  const [started, setStarted] = useState(false)

  if (u.app?.required && !safe)
    return (
      <div className="upd-force" role="alertdialog" aria-modal="true" aria-labelledby="upd-force-title">
        <span className="ibub big">
          <Download size={28} />
        </span>
        <h1 id="upd-force-title">time to update ✦</h1>
        <p className="muted">This version of the app is too old to keep working properly. Version {u.app.version} fixes that. Your streak, notes and saved stuff stay put.</p>
        {u.app.notes && <p className="upd-notes">{u.app.notes}</p>}
        <a className="btn btn-primary a-lime big-cta" href={u.app.url} onClick={() => setStarted(true)}>
          <Download size={18} /> update now · {prettySize(u.app.size)}
        </a>
        {started && <AppSteps />}
        <div className="upd-safe">
          <span className="muted">need help right now?</span>
          <a className="btn btn-sm" href="tel:112">
            <Phone size={16} /> call 112
          </a>
          <a className="btn btn-sm" href="#/shield">
            <Shield size={16} /> safety tools
          </a>
        </div>
      </div>
    )

  if (u.snoozedUntil > Date.now()) return null

  if (u.app)
    return (
      <div className="upd-banner" role="status">
        <span className="upd-icon" aria-hidden="true">
          ✦
        </span>
        <div className="upd-text">
          <strong>update ready · v{u.app.version}</strong>
          <small>
            {u.app.notes || 'fixes and new stuff'} · {prettySize(u.app.size)}
          </small>
          {started && <AppSteps />}
        </div>
        <a className="btn btn-sm btn-primary a-lime" href={u.app.url} onClick={() => setStarted(true)}>
          update
        </a>
        <button type="button" className="icon-btn ghost" aria-label="Remind me tomorrow" onClick={later}>
          <X size={18} />
        </button>
      </div>
    )

  if (u.web)
    return (
      <div className="upd-banner" role="status">
        <span className="upd-icon" aria-hidden="true">
          ✦
        </span>
        <div className="upd-text">
          <strong>a fresh version is ready</strong>
          <small>takes a second · everything you’ve saved stays</small>
        </div>
        <button type="button" className="btn btn-sm btn-primary a-lime" onClick={refresh}>
          <RefreshCw size={15} /> refresh
        </button>
        <button type="button" className="icon-btn ghost" aria-label="Remind me tomorrow" onClick={later}>
          <X size={18} />
        </button>
      </div>
    )

  return null
}

/** The "check for updates" button in settings. */
export function CheckForUpdates() {
  const u = useUpdate()
  const check = async () => {
    const r = await checkNow()
    if (r === 'update') toast({ icon: '✦', title: 'Update ready', sub: 'tap update at the top of the page', tone: 'badge' })
    else if (r === 'latest') toast({ icon: '✓', title: 'You’re on the latest version' })
    else toast({ icon: '📡', title: 'Can’t check right now', sub: 'you seem to be offline' })
  }
  return (
    <button type="button" className="btn btn-sm" onClick={() => void check()} disabled={u.checking}>
      {u.checking ? 'checking…' : 'check for updates'}
    </button>
  )
}
