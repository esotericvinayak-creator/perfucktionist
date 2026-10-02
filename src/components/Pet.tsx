import { useState } from 'react'
import { accessoryById } from '../data/profile'
import { petEmoji, showedUp, type Progress } from '../lib/progress'
import { pop } from '../lib/sound'
import { todayKey } from '../lib/storage'

/** Your pet. Happy (bouncing) once you've shown up today, a little sleepy otherwise. Tap for hearts. */
export function PetView({ p, size = 96, interactive = false }: { p: Progress; size?: number; interactive?: boolean }) {
  const happy = showedUp(p, todayKey())
  const hat = accessoryById(p.petHat)
  const [hearts, setHearts] = useState<number[]>([])
  const egg = petEmoji(p) === '🥚'
  const body = (
    <>
      {hat.emoji && !egg && (
        <span className="petv-hat" aria-hidden="true">
          {hat.emoji}
        </span>
      )}
      <span className="petv-body">{petEmoji(p)}</span>
      {hearts.map((id) => (
        <span key={id} className="petv-heart" aria-hidden="true">
          💗
        </span>
      ))}
    </>
  )
  const cls = `petv${happy ? ' happy' : ' sleepy'}${egg ? ' egg' : ''}`
  if (!interactive)
    return (
      <span className={cls} style={{ fontSize: size }} aria-hidden="true">
        {body}
      </span>
    )
  return (
    <button
      type="button"
      className={cls}
      style={{ fontSize: size }}
      aria-label={`Pet ${p.pet || 'your pet'}`}
      onClick={() => {
        pop()
        const id = Date.now()
        setHearts((h) => [...h, id])
        setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1200)
      }}
    >
      {body}
    </button>
  )
}
