// "Get the app" — one button that does the right thing for whatever you're holding.
// Android gets the real APK. iOS can't install APKs at all, so it gets Add to Home Screen.
// Everything else installs straight from the browser.
import { useEffect, useState } from 'react'
import { Apple, Check, Download, Monitor, Share, Smartphone, SquarePlus } from 'lucide-react'
import { APK_URL, alreadyInstalled, apkMeta, appOnly, detectPlatform, prettySize, promptInstall, useCanInstall, type ApkMeta, type Platform } from '../lib/install'
import { toast } from '../lib/toast'
import { versionLabel } from '../lib/update'
import { CheckForUpdates } from '../components/UpdatePrompt'

const LABEL: Record<Platform, string> = {
  android: 'Android',
  ios: 'iPhone or iPad',
  mac: 'Mac',
  windows: 'Windows',
  linux: 'Linux',
  other: 'this device',
}

/** Installing from outside the Play Store needs one permission; say so plainly. */
function AndroidSteps() {
  return (
    <ol className="get-steps">
      <li>
        Tap download. If your browser warns about the file, choose <b>Download anyway</b>.
      </li>
      <li>
        Open it and allow installs from your browser when Android asks.
      </li>
      <li>
        Tap <b>Install</b>. “Unknown developer” just means it isn’t from Google Play.
      </li>
    </ol>
  )
}

function IosSteps() {
  return (
    <ol className="get-steps">
      <li>
        Tap the <b>Share</b> button <Share size={15} className="inline-ic" /> at the bottom of Safari.
      </li>
      <li>
        Scroll down and tap <b>Add to Home Screen</b> <SquarePlus size={15} className="inline-ic" />.
      </li>
      <li>
        Tap <b>Add</b>. It appears on your home screen like any other app.
      </li>
    </ol>
  )
}

export default function Get() {
  const [platform, setPlatform] = useState<Platform>('other')
  const [apk, setApk] = useState<ApkMeta | null>(null)
  const [checked, setChecked] = useState(false)
  const [installed, setInstalled] = useState(false)
  const canInstall = useCanInstall()

  useEffect(() => {
    setPlatform(detectPlatform())
    // An Android home-screen shortcut to the website isn't the app any more; the APK is.
    setInstalled(alreadyInstalled() && !appOnly())
    void apkMeta().then((m) => {
      setApk(m)
      setChecked(true)
    })
  }, [])

  const install = async () => {
    const r = await promptInstall()
    if (r === 'accepted') toast({ icon: '✦', title: 'Installing…', sub: 'check your home screen', tone: 'badge' })
    else if (r === 'unavailable') toast({ icon: '🤔', title: 'Your browser handles this itself', sub: 'look for “Install” or “Add to Home Screen” in its menu' })
  }

  if (installed)
    return (
      <div className="page get-page">
        <div className="get-done">
          <span className="ibub big">
            <Check size={28} />
          </span>
          <h1>you’re already in the app ✦</h1>
          <p className="muted">You opened this from your home screen. Nothing left to install. You’re on version {versionLabel()}.</p>
          <CheckForUpdates />
          <a className="btn btn-primary a-lime big-cta" href="#/">
            back to my 5 minutes
          </a>
        </div>
      </div>
    )

  return (
    <div className="page get-page">
      <header className="get-hero">
        <h1 className="display">
          get the <span className="serif">app.</span>
        </h1>
        <p className="lede">Free, no ads. Here’s the way that works for {LABEL[platform]}.</p>
      </header>

      {/* ── Android: the real APK ───────────────────────────── */}
      {platform === 'android' && (
        <section className="get-card a-lime">
          <span className="ibub big">
            <Smartphone size={26} />
          </span>
          <h2>Android app (.apk)</h2>
          {checked && apk ? (
            <>
              <p className="muted">
                Version {apk.version} · {prettySize(apk.size)} · needs Android {apk.minAndroid} or newer
              </p>
              <a className="btn btn-primary a-lime big-cta" href={APK_URL} download>
                <Download size={18} /> download the APK
              </a>
              <AndroidSteps />
              <details className="get-sha">
                <summary>is it safe?</summary>
                <p className="muted">
                  It’s the same website, wrapped so Android can run it. It only asks for internet access, has no ads and no trackers. Not being on Google Play is why Android shows a warning. To check the file is exactly ours,
                  compare its SHA-256 after downloading:
                </p>
                <code>{apk.sha256}</code>
                <p className="muted">Built {apk.built}.</p>
              </details>
            </>
          ) : (
            <p className="muted">{checked ? 'The Android build isn’t published yet. Install it from your browser below — it works the same.' : 'checking for the latest build…'}</p>
          )}
        </section>
      )}

      {/* ── iOS: an APK is an Android file and cannot be installed here ── */}
      {platform === 'ios' && (
        <section className="get-card a-cyan">
          <span className="ibub big">
            <Apple size={26} />
          </span>
          <h2>iPhone & iPad</h2>
          <p className="muted">
            <b>An APK is an Android file — iPhones can’t open one.</b> Apple only installs apps through the App Store, and we’re not on it yet. The good news: Safari can add this to your home screen in three taps, and it
            behaves like an app.
          </p>
          <IosSteps />
          <p className="get-note">Use Safari for this. Chrome on iPhone can’t add to the home screen.</p>
        </section>
      )}

      {/* ── Desktop & anything else ─────────────────────────── */}
      {(platform === 'mac' || platform === 'windows' || platform === 'linux' || platform === 'other') && (
        <section className="get-card a-violet">
          <span className="ibub big">
            <Monitor size={26} />
          </span>
          <h2>Install on {LABEL[platform]}</h2>
          {canInstall ? (
            <>
              <p className="muted">Your browser can install it as a proper app window, no store involved.</p>
              <button type="button" className="btn btn-primary a-lime big-cta" onClick={install}>
                <Download size={18} /> install the app
              </button>
            </>
          ) : (
            <p className="muted">
              In Chrome or Edge, open the menu and choose <b>Install perfucktionist</b> (or the install icon in the address bar). In Safari on Mac, use <b>File → Add to Dock</b>. Firefox doesn’t install web apps — the
              site works the same in a tab.
            </p>
          )}
          <p className="get-note">APK files are Android-only, so there’s nothing to download here.</p>
        </section>
      )}
    </div>
  )
}
