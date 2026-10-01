import { useState } from 'react'
import { confetti } from '../lib/confetti'

const moods = [
  { emoji: '😭', label: 'sad', say: 'Cry it out — tears are literally stress leaving your body. Then let a song hold you for a bit.', go: [['/music', '🎧 play something'], ['/breathe', '🫁 breathe']] },
  { emoji: '😤', label: 'angry', say: 'Valid. Don’t text anyone yet. Yeet it into the void first, then do one round of box breathing.', go: [['/happy', '🔥 yeet it'], ['/breathe', '🫁 cool down']] },
  { emoji: '😰', label: 'anxious', say: 'Your brain is trying to protect you, just too loudly. Two inhales, one long exhale. Repeat 3 times.', go: [['/breathe', '🫁 calm in 60s'], ['/library', '📚 read a verse']] },
  { emoji: '🥱', label: 'bored', say: 'Boredom is a door. Do one thing you’re scared of, or pop some bubbles. No in-between.', go: [['/brave', '🦁 get a dare'], ['/happy', '🫧 pop bubbles']] },
  { emoji: '😔', label: 'not enough', say: 'You are not a rough draft of someone else. Done > perfect. Read the rules.', go: [['/unperfect', '🫠 unlearn perfect'], ['/fam', '🏠 talk to someone']] },
  { emoji: '🥳', label: 'happy', say: 'LET’S GOOO. Share it with someone — happiness doubles when you split it.', go: [['/music', '💃 dance break'], ['/green', '🌳 plant a tree']] },
] as const

export function MoodCheck() {
  const [mood, setMood] = useState<(typeof moods)[number] | null>(null)
  return (
    <div className="mood-check">
      <div className="mood-row" role="group" aria-label="How are you feeling?">
        {moods.map((m) => (
          <button
            key={m.label}
            type="button"
            className={`mood-btn${mood?.label === m.label ? ' on' : ''}`}
            onClick={(e) => {
              setMood(m)
              if (m.label === 'happy') {
                const r = e.currentTarget.getBoundingClientRect()
                confetti(r.left + r.width / 2, r.top)
              }
            }}
          >
            <span className="mood-emoji" aria-hidden="true">
              {m.emoji}
            </span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
      {mood && (
        <div className="mood-answer" aria-live="polite">
          <p>{mood.say}</p>
          <div className="row gap-sm wrap">
            {mood.go.map(([path, label]) => (
              <a key={path} className="btn btn-sm" href={`#${path}`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
