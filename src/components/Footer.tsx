import { helplines } from '../data/helplines'
import { motives, zones } from '../data/zones'
import { Logo } from './Nav'
import { Marquee } from './ui'

export function Footer() {
  return (
    <footer className="footer">
      <Marquee items={motives} accent="violet" tilt={-1.5} />
      <div className="page footer-inner">
        <div className="footer-brand">
          <a href="#/" className="footer-logo">
            <Logo />
          </a>
          <p>Built imperfectly, on purpose. Made with chaos, chai & a lot of love in India 🇮🇳</p>
        </div>
        <div>
          <p className="kicker">zones</p>
          <ul className="footer-links">
            {zones.map((z) => (
              <li key={z.path}>
                <a href={`#${z.path}`}>
                  {z.emoji} {z.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker">need help now?</p>
          <ul className="footer-links">
            {[helplines.emergency, helplines.women, helplines.child, helplines.cyber, helplines.mind].map((h) => (
              <li key={h.dial}>
                <a href={`tel:${h.dial}`}>
                  <strong>{h.number}</strong> · {h.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="page footer-fine">
        This site is a friend, not a doctor, lawyer or police officer. If you’re in danger, call 112. If you’re struggling, call Tele-MANAS on 14416 — free, 24×7.
      </p>
    </footer>
  )
}
