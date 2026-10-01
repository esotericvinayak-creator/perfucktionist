const COLORS = ['#c6ff3a', '#ff4fa3', '#9b7bff', '#3fe0ff', '#ffd23f', '#ff7b39']

/** Fire a burst of confetti from a point (defaults to screen centre). Self-cleaning canvas. */
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 140) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) count = 24
  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' })
  document.body.appendChild(canvas)
  const g = canvas.getContext('2d')
  if (!g) return canvas.remove()
  g.scale(dpr, dpr)

  const bits = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() > 0.6,
    }
  })

  const startedAt = performance.now()
  const frame = (now: number) => {
    const t = now - startedAt
    g.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const b of bits) {
      b.vy += 0.28
      b.vx *= 0.99
      b.x += b.vx
      b.y += b.vy
      b.rot += b.spin
      g.save()
      g.globalAlpha = Math.max(0, 1 - t / 2600)
      g.translate(b.x, b.y)
      g.rotate(b.rot)
      g.fillStyle = b.color
      if (b.round) {
        g.beginPath()
        g.arc(0, 0, b.size / 2, 0, Math.PI * 2)
        g.fill()
      } else g.fillRect(-b.size / 2, -b.size / 4, b.size, b.size / 2)
      g.restore()
    }
    if (t < 2600) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

export function confettiFrom(el: Element) {
  const r = el.getBoundingClientRect()
  confetti(r.left + r.width / 2, r.top + r.height / 2)
}
