// "Get the app" — one button that does the right thing for whatever you're holding.
// Android gets the real APK. iOS can't install APKs at all, so it gets Add to Home Screen.
// Everything else installs straight from the browser.
import { useEffect, useState } from 'react'
import { Apple, Check, Download, Monitor, Share, Shield, Smartphone, SquarePlus, Wifi } from 'lucide-react'
import { Icon } from '../components/Icon'
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

function Perks() {
  return (
    <ul className="get-perks">
      <li>
        <span className="ibub">
          <Icon name="home" size={18} />
        </span>
        Its own icon on your home screen — no browser bar.
      </li>
      <li>
        <span className="ibub">
          <Wifi size={18} />
        </span>
        Opens instantly, and the app still loads without signal.
      </li>
      <li>
        <span className="ibub">
          <Shield size={18} />
        </span>
        Panic SOS and the 112 button are always one tap away.
      </li>
    </ul>
  )
}

/** Installing from outside the Play Store needs one permission; say so plainly. */
function AndroidSteps() {
  return (
    <ol className="get-steps">
      <li>
        <b>Tap download.</b> Your browser may warn you that this kind of file can harm your device — that warning shows for every APK, including this one. Choose <b>Download anyway</b>.
      </li>
      <li>
        <b>Open the file.</b> Android will ask to allow installs from your browser. Turn it on, then come back and tap <b>Install</b>.
      </li>
      <li>
        <b>It says “unknown developer”.</b> That’s honest — this build isn’t from Google Play. The check below shows the file is exactly the one we built.
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
        <span className="sticker a-lime">free · no store · no ads</span>
        <h1 className="display">
          put it on your <span className="serif">home screen.</span>
        </h1>
        <p className="lede">
          We spotted <b>{LABEL[platform]}</b>. Here’s the way that works for it.
        </p>
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
                <summary>check the file is really ours</summary>
                <p className="muted">SHA-256 of this build — compare it after downloading if you want to be sure nothing changed in transit:</p>
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

      <Perks />

      <section className="get-card">
        <h2>Straight answers</h2>
        <details>
          <summary>Is the APK safe?</summary>
          <p className="muted">
            It’s the same website, wrapped so Android can run it. The only permission it asks for is internet access. It has no ads, and we add no trackers. Because it isn’t distributed through Play, Android shows an
            “unknown developer” warning, which is Android doing its job. The SHA-256 on the Android card lets you check the file is exactly the one we built.
          </p>
        </details>
        <details>
          <summary>Why isn’t it on the Play Store or App Store?</summary>
          <p className="muted">Both need a paid developer account and a review process. Until that’s set up, the APK and the browser install are the honest ways to get it.</p>
        </details>
        <details>
          <summary>Will it work offline?</summary>
          <p className="muted">
            The app itself opens offline, along with anything you’ve already saved on your phone — journal, cycle tracker, money notes, streak. Scripture, books, music and the web viewer all need a connection.
          </p>
        </details>
        <details>
          <summary>Does it cost anything?</summary>
          <p className="muted">No. Same free app either way. Plus is optional and never touches safety tools or scripture.</p>
        </details>
      </section>
    </div>
  )
}
