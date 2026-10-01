import { useState } from 'react'
import { themes, traditions, wisdomFor, type Theme, type Wisdom } from '../data/wisdom'
import { shareCard } from './Overlays'
import { CopyButton } from './ui'

export function WisdomCard({ w }: { w: Wisdom }) {
  const t = traditions[w.tradition]
  return (
    <article className={`card wisdom trad-${w.tradition}`}>
      <span className="trad-chip">
        <span aria-hidden="true">{t.emoji}</span> {t.label}
      </span>
      {w.original && (
        <p className={`orig lang-${w.lang ?? 'x'}`} lang={w.lang} dir={w.rtl ? 'rtl' : undefined}>
          {w.original}
        </p>
      )}
      {w.roman && <p className="roman">{w.roman}</p>}
      <p className="wisdom-text">“{w.text}”</p>
      <p className="wisdom-source">— {w.source}</p>
      <div className="row gap-sm">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => shareCard({ kicker: `${t.emoji} ${w.source}`, original: w.original, lang: w.lang, rtl: w.rtl, text: w.text })}>
          ↗ story
        </button>
        <CopyButton text={`${w.original ? `${w.original}\n\n` : ''}“${w.text}” — ${w.source}`} />
      </div>
    </article>
  )
}

/** "Same message, every faith" — a swipeable row of quotes on one theme. */
export function Voices({ theme, intro }: { theme: Theme; intro?: string }) {
  const list = wisdomFor(theme)
  const [all, setAll] = useState(false)
  const shown = all ? list : list.slice(0, 6)
  return (
    <div className="voices">
      <p className="voices-intro">
        <span className="sticker sticker-sm a-violet">every faith agrees</span> {intro ?? themes[theme].line}
      </p>
      <div className="voices-row">
        {shown.map((w) => (
          <WisdomCard key={w.id} w={w} />
        ))}
      </div>
      {list.length > 6 && !all && (
        <button type="button" className="btn btn-sm" onClick={() => setAll(true)}>
          + {list.length - 6} more voices
        </button>
      )}
    </div>
  )
}
