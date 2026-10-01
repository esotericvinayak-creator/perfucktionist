// Renders 1080×1920 story cards on a canvas — for Instagram stories, WhatsApp status, Snap.

export type CardContent = {
  kicker: string
  /** Big number/emoji line, e.g. "🔥 12" for a streak card. */
  hero?: string
  original?: string
  lang?: string
  rtl?: boolean
  text: string
  footer?: string
  /** Utility cards (emergency info) never get a watermark. */
  clean?: boolean
}

export type Template = { id: string; name: string; plus: boolean; bg: (g: CanvasRenderingContext2D) => void; ink: string; dim: string; sticker: string; stickerInk: string; serifText?: boolean }

const W = 1080
const H = 1920

function blob(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'transparent')
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)
}

export const templates: Template[] = [
  {
    id: 'neon',
    name: 'Neon',
    plus: false,
    ink: '#f7f3ff',
    dim: '#bcb5cf',
    sticker: '#c6ff3a',
    stickerInk: '#0d0c12',
    bg: (g) => {
      g.fillStyle = '#0d0c12'
      g.fillRect(0, 0, W, H)
      blob(g, 980, 180, 700, 'rgba(157,125,255,0.45)')
      blob(g, 60, 1500, 760, 'rgba(255,79,163,0.35)')
    },
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    plus: false,
    ink: '#15111c',
    dim: '#4b4458',
    sticker: '#ff6ab2',
    stickerInk: '#15111c',
    bg: (g) => {
      g.fillStyle = '#fff4e4'
      g.fillRect(0, 0, W, H)
      blob(g, 1000, 120, 640, 'rgba(255,207,46,0.55)')
      blob(g, 80, 1700, 700, 'rgba(255,106,178,0.32)')
    },
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    plus: true,
    ink: '#ffffff',
    dim: '#e2dcff',
    sticker: '#3fe0ff',
    stickerInk: '#0d0c12',
    bg: (g) => {
      const lin = g.createLinearGradient(0, 0, W, H)
      lin.addColorStop(0, '#2b1a6b')
      lin.addColorStop(0.55, '#6a2c91')
      lin.addColorStop(1, '#0f5f86')
      g.fillStyle = lin
      g.fillRect(0, 0, W, H)
      blob(g, 900, 300, 500, 'rgba(63,224,255,0.35)')
      g.fillStyle = 'rgba(255,255,255,0.8)'
      for (let i = 0; i < 90; i++) {
        const x = (i * 397) % W
        const y = (i * 911) % H
        g.fillRect(x, y, i % 3 === 0 ? 4 : 2, i % 3 === 0 ? 4 : 2)
      }
    },
  },
  {
    id: 'lime',
    name: 'Acid',
    plus: true,
    ink: '#0d0c12',
    dim: '#2b3a05',
    sticker: '#0d0c12',
    stickerInk: '#c6ff3a',
    bg: (g) => {
      g.fillStyle = '#c6ff3a'
      g.fillRect(0, 0, W, H)
      blob(g, 120, 200, 600, 'rgba(255,255,255,0.45)')
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    plus: true,
    ink: '#ffffff',
    dim: '#a7a7a7',
    sticker: '#ffffff',
    stickerInk: '#000000',
    serifText: true,
    bg: (g) => {
      g.fillStyle = '#000000'
      g.fillRect(0, 0, W, H)
    },
  },
]

const FONT_DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif'
const FONT_SERIF = '"Instrument Serif", Georgia, serif'
const FONT_MONO = '"Space Mono", monospace'
const scriptFont = (lang?: string) =>
  lang === 'ar' ? '"Amiri", "Noto Naskh Arabic", serif' : lang === 'pa' ? '"Noto Serif Gurmukhi", "Mukta Mahee", serif' : lang === 'sa' || lang === 'hi' ? '"Tiro Devanagari Sanskrit", serif' : FONT_SERIF

function wrap(g: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const tryLine = line ? `${line} ${word}` : word
      if (g.measureText(tryLine).width > max && line) {
        out.push(line)
        line = word
      } else line = tryLine
    }
    if (line) out.push(line)
  }
  return out
}

/** Fit text into a box by shrinking the font. Returns lines + size used. */
function fit(g: CanvasRenderingContext2D, text: string, family: string, weight: string, max: number, maxH: number, start: number, min: number, lh: number) {
  for (let size = start; size >= min; size -= 2) {
    g.font = `${weight} ${size}px ${family}`
    const lines = wrap(g, text, max)
    if (lines.length * size * lh <= maxH) return { lines, size }
  }
  g.font = `${weight} ${min}px ${family}`
  return { lines: wrap(g, text, max), size: min }
}

export async function renderCard(canvas: HTMLCanvasElement, c: CardContent, t: Template, watermark: boolean) {
  await Promise.all(
    [`800 60px ${FONT_DISPLAY}`, `italic 400 60px ${FONT_SERIF}`, `700 30px ${FONT_MONO}`, `400 60px ${scriptFont(c.lang)}`].map((f) => document.fonts.load(f).catch(() => undefined)),
  )
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')
  if (!g) return
  t.bg(g)
  g.textAlign = 'center'
  g.textBaseline = 'top'
  const pad = 110
  const max = W - pad * 2

  // sticker kicker
  g.font = `700 34px ${FONT_MONO}`
  const kick = c.kicker.toUpperCase()
  const kw = Math.min(max, g.measureText(kick).width + 64)
  g.save()
  g.translate(W / 2, 250)
  g.rotate((-3 * Math.PI) / 180)
  g.fillStyle = t.sticker
  g.beginPath()
  g.roundRect(-kw / 2, -36, kw, 72, 36)
  g.fill()
  g.fillStyle = t.stickerInk
  g.textBaseline = 'middle'
  g.fillText(kick, 0, 2, max - 40)
  g.restore()
  g.textBaseline = 'top'

  let y = 380
  if (c.hero) {
    g.font = `800 230px ${FONT_DISPLAY}`
    g.fillStyle = t.ink
    g.fillText(c.hero, W / 2, y, max)
    y += 290
  }

  if (c.original) {
    g.direction = c.rtl ? 'rtl' : 'ltr'
    const o = fit(g, c.original, scriptFont(c.lang), '400', max, 520, 78, 40, 1.55)
    g.fillStyle = t.ink
    o.lines.forEach((l, i) => g.fillText(l, W / 2, y + i * o.size * 1.55))
    y += o.lines.length * o.size * 1.55 + 70
    g.direction = 'ltr'
  }

  const remaining = H - y - 330
  const family = t.serifText || !c.original ? FONT_SERIF : FONT_DISPLAY
  const weight = family === FONT_SERIF ? 'italic 400' : '600'
  const body = fit(g, c.text, family, weight, max, remaining, c.original ? 58 : 92, 30, 1.3)
  g.fillStyle = c.original ? t.dim : t.ink
  body.lines.forEach((l, i) => g.fillText(l, W / 2, y + i * body.size * 1.3))

  if (c.footer) {
    g.font = `700 32px ${FONT_MONO}`
    g.fillStyle = t.dim
    g.fillText(c.footer, W / 2, H - 290, max)
  }
  if (watermark) {
    g.font = `800 52px ${FONT_DISPLAY}`
    g.fillStyle = t.ink
    g.fillText('perfucktionist ✶', W / 2, H - 190)
    g.font = `400 28px ${FONT_MONO}`
    g.fillStyle = t.dim
    g.fillText('perfection is a scam', W / 2, H - 120)
  }
}

export async function cardFile(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
  if (!blob) throw new Error('Could not export image')
  return new File([blob], 'perfucktionist.png', { type: 'image/png' })
}
