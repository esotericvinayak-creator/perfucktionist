import { useEffect, useState } from 'react'
import type { Shloka } from '../data/shlokas'
import type { Accent } from '../data/zones'
import { log } from '../lib/progress'
import { shareCard } from './Overlays'
import { CopyButton } from './ui'

function speak(text: string) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  // No browser ships a Sanskrit voice; Hindi reads Devanagari well enough.
  const voice = synth.getVoices().find((v) => v.lang.startsWith('hi')) ?? synth.getVoices().find((v) => v.lang.endsWith('-IN'))
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'hi-IN'
  u.rate = 0.75
  synth.speak(u)
  return u
}

export function ShlokaCard({ shloka, accent = 'sun', compact = false }: { shloka: Shloka; accent?: Accent; compact?: boolean }) {
  const [speaking, setSpeaking] = useState(false)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => {
    if (canSpeak) window.speechSynthesis.cancel()
  }, [canSpeak])

  const listen = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const u = speak(shloka.devanagari.replace(/[।॥]/g, ', '))
    setSpeaking(true)
    log('verse')
    u.onend = u.onerror = () => setSpeaking(false)
  }

  return (
    <article className={`card shloka a-${accent}${compact ? ' compact' : ''}`}>
      <span className="sticker sticker-sm">{shloka.source}</span>
      <p className="deva" lang="sa">
        {shloka.devanagari}
      </p>
      <p className="roman" lang="sa-Latn">
        {shloka.roman}
      </p>
      <p className="meaning">{shloka.meaning}</p>
      <p className="genz">
        <span aria-hidden="true">💬</span> {shloka.genz}
      </p>
      <div className="row gap-sm">
        {canSpeak && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={listen}>
            {speaking ? '■ stop' : '🔊 listen'}
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => shareCard({ kicker: `🕉️ ${shloka.source}`, original: shloka.devanagari, lang: 'sa', text: shloka.genz })}>
          ↗ story
        </button>
        <CopyButton text={`${shloka.devanagari}\n\n${shloka.roman}\n\n${shloka.meaning}\n— ${shloka.source}`} />
      </div>
    </article>
  )
}
