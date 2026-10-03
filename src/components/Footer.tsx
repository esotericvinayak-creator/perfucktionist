import { alreadyInstalled, appOnly } from '../lib/install'
import { Logo } from './Nav'

export function Footer() {
  return (
    <footer className="footer slim">
      <div className="page footer-slim">
        <a href="#/" className="footer-logo-sm">
          <Logo />
        </a>
        <p className="footer-help">
          need help now? <a href="tel:112">112</a> emergency · <a href="tel:1091">1091</a> women · <a href="tel:1098">1098</a> child · <a href="tel:1930">1930</a> cyber · <a href="tel:14416">14416</a> mental health
        </p>
        {(!alreadyInstalled() || appOnly()) && !window.location.hash.startsWith('#/get') && (
          <a className="get-chip" href="#/get">
            📲 get the app
          </a>
        )}
        <p className="footer-fine">A friend, not a doctor, lawyer or police officer. Made imperfectly in India 🇮🇳</p>
      </div>
    </footer>
  )
}
