// Wallpaper maker: a live 9:16 lock-screen preview drawn on a 1080×1920 canvas (the same canvas is what gets exported).
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlus } from '../lib/plus'
import { log } from '../lib/progress'
import { Choice, Text, useTool } from './kit'

const W = 1080
const H = 1920
const MARGIN = 120
/** Nothing but the clock lives in the top 28% of a lock screen. */
const SAFE_TOP = Math.round(H * 0.28)
const BOTTOM_LIMIT = 1560

// ─── ideas ────────────────────────────────────────────────────
const IDEAS = [
  'done > perfect.',
  'I am becoming, not behind.',
  'not my problem today.',
  'hydrate. breathe. go.',
  'small steps still move me.',
  'main character energy only.',
  'rest is also progress.',
  'my pace is the right pace.',
  'chai first, panic later.',
  'be gentle, I am still learning.',
  'one thing at a time.',
  'future me says thanks.',
  'no one is watching, so bloom.',
  'proud of me, quietly.',
]

// ─── drawing helpers ──────────────────────────────────────────
type RGB = [number, number, number]
const hex = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]

/** Soft blob: radial gradient with an eased falloff so the edge never shows. Optionally squashed + rotated. */
function glow(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number, squash = 1, rot = 0) {
  const [R, G, B] = hex(color)
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, r)
  for (const [t, k] of [[0, 1], [0.2, 0.86], [0.4, 0.58], [0.6, 0.3], [0.8, 0.1], [1, 0]] as const) grad.addColorStop(t, `rgba(${R},${G},${B},${(a * k).toFixed(3)})`)
  g.save()
  g.translate(x, y)
  g.rotate(rot)
  g.scale(1, squash)
  g.fillStyle = grad
  g.fillRect(-r, -r, r * 2, r * 2)
  g.restore()
}

function linear(g: CanvasRenderingContext2D, stops: [number, string][], angleDeg = 180) {
  const a = (angleDeg * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const len = Math.abs(W * dx) + Math.abs(H * dy)
  const cx = W / 2
  const cy = H / 2
  const grad = g.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2)
  stops.forEach(([t, c]) => grad.addColorStop(t, c))
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sparkle(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  g.fillStyle = fill
  g.beginPath()
  g.moveTo(x, y - r)
  g.quadraticCurveTo(x, y, x + r, y)
  g.quadraticCurveTo(x, y, x, y + r)
  g.quadraticCurveTo(x, y, x - r, y)
  g.quadraticCurveTo(x, y, x, y - r)
  g.fill()
}

// film grain: one pre-rendered noise tile, tiled as a pattern
let grainTile: HTMLCanvasElement | null = null
function grainPattern(g: CanvasRenderingContext2D) {
  if (!grainTile) {
    grainTile = document.createElement('canvas')
    grainTile.width = grainTile.height = 256
    const t = grainTile.getContext('2d')
    if (t) {
      const img = t.createImageData(256, 256)
      const r = rng(7)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 90 + Math.floor(r() * 120)
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      t.putImageData(img, 0, 0)
    }
  }
  return g.createPattern(grainTile, 'repeat')
}

// ─── designs ──────────────────────────────────────────────────
type Design = {
  id: string
  name: string
  /** Text colour, the dimmer label colour, and the colour used for the little label pill fill. */
  ink: string
  dim: string
  pill: string
  pillInk: string
  grain: number
  paint: (g: CanvasRenderingContext2D) => void
}

const DESIGNS: Design[] = [
  {
    id: 'peach',
    name: 'Peach',
    ink: '#4a1f1d',
    dim: '#7a403b',
    pill: '#ffffff',
    pillInk: '#4a1f1d',
    grain: 0.09,
    paint: (g) => {
      linear(g, [[0, '#ffe8da'], [1, '#ffd8cf']], 160)
      glow(g, 930, 180, 980, '#ffab8f', 0.9)
      glow(g, 40, 760, 860, '#ffcfe0', 0.95)
      glow(g, 980, 1380, 900, '#ffc09b', 0.75)
      glow(g, 120, 1820, 1000, '#f79bb0', 0.8)
      glow(g, 560, 1020, 620, '#fff2d4', 0.75, 0.8, -0.4)
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    ink: '#2a1b63',
    dim: '#53428f',
    pill: '#ffffff',
    pillInk: '#2a1b63',
    grain: 0.09,
    paint: (g) => {
      linear(g, [[0, '#efe9ff'], [1, '#e2d9ff']], 170)
      glow(g, 150, 220, 980, '#bda7ff', 0.95)
      glow(g, 1000, 820, 880, '#ffc4e8', 0.9)
      glow(g, 140, 1380, 940, '#b4d0ff', 0.9)
      glow(g, 940, 1800, 1000, '#d3aeff', 0.85)
      glow(g, 560, 1060, 560, '#ffffff', 0.7, 0.7, 0.5)
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    ink: '#1b3223',
    dim: '#41624b',
    pill: '#ffffff',
    pillInk: '#1b3223',
    grain: 0.1,
    paint: (g) => {
      linear(g, [[0, '#eaf1df'], [1, '#d9e7d0']], 165)
      glow(g, 950, 160, 960, '#b4d3ab', 0.95)
      glow(g, 60, 900, 860, '#f6f0c0', 0.9)
      glow(g, 990, 1420, 920, '#9fcdbf', 0.85)
      glow(g, 160, 1850, 960, '#cfe59b', 0.85)
      glow(g, 520, 1200, 520, '#ffffff', 0.55, 0.8, 0.3)
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    ink: '#0f2c4b',
    dim: '#37597d',
    pill: '#ffffff',
    pillInk: '#0f2c4b',
    grain: 0.08,
    paint: (g) => {
      linear(g, [[0, '#e6f4ff'], [1, '#d6ebff']], 180)
      glow(g, 90, 180, 1000, '#94c8ff', 0.95)
      glow(g, 1020, 900, 900, '#e0d2ff', 0.95)
      glow(g, 120, 1500, 900, '#fff0cc', 0.9)
      glow(g, 960, 1860, 980, '#b3dcff', 0.9)
      glow(g, 600, 1000, 500, '#ffffff', 0.7, 0.7, -0.5)
    },
  },
  {
    id: 'butter',
    name: 'Butter',
    ink: '#3c2806',
    dim: '#6b5320',
    pill: '#ffffff',
    pillInk: '#3c2806',
    grain: 0.1,
    paint: (g) => {
      linear(g, [[0, '#fff3c4'], [1, '#ffe9a8']], 170)
      glow(g, 960, 200, 950, '#ffd067', 0.9)
      glow(g, 60, 820, 820, '#ffb9a2', 0.8)
      glow(g, 980, 1450, 900, '#cfe8b4', 0.75)
      glow(g, 140, 1840, 980, '#ffc77a', 0.85)
      glow(g, 540, 1080, 540, '#fffbe8', 0.8, 0.8, 0.3)
    },
  },
  {
    id: 'paper',
    name: 'Paper',
    ink: '#2a2118',
    dim: '#6e5f4a',
    pill: '#2a2118',
    pillInk: '#f4ebd9',
    grain: 0.22,
    paint: (g) => {
      linear(g, [[0, '#f6eddb'], [0.5, '#f3e9d5'], [1, '#eadfc7']], 180)
      const v = g.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1250)
      v.addColorStop(0, 'rgba(120,90,40,0)')
      v.addColorStop(1, 'rgba(120,90,40,0.16)')
      g.fillStyle = v
      g.fillRect(0, 0, W, H)
      g.strokeStyle = 'rgba(42,33,24,0.32)'
      g.lineWidth = 3
      g.beginPath()
      g.roundRect(56, 56, W - 112, H - 112, 40)
      g.stroke()
      g.strokeStyle = 'rgba(42,33,24,0.14)'
      g.lineWidth = 2
      g.beginPath()
      g.roundRect(76, 76, W - 152, H - 152, 28)
      g.stroke()
      sparkle(g, W - 150, 150, 26, 'rgba(42,33,24,0.35)')
    },
  },
  {
    id: 'brutal',
    name: 'Brutal',
    ink: '#f7f3ff',
    dim: '#c8c0dd',
    pill: '#c6ff3a',
    pillInk: '#0d0c12',
    grain: 0.16,
    paint: (g) => {
      g.fillStyle = '#0d0c12'
      g.fillRect(0, 0, W, H)
      glow(g, 980, 260, 900, '#9d7dff', 0.5)
      glow(g, 40, 1450, 1000, '#ff4fa3', 0.38)
      // hard-edged shapes: the app's own look
      g.strokeStyle = '#ff4fa3'
      g.lineWidth = 14
      g.beginPath()
      g.arc(20, 360, 230, 0, Math.PI * 2)
      g.stroke()
      g.fillStyle = '#ff4fa3'
      g.beginPath()
      g.arc(1000, 1830, 290, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#c6ff3a'
      g.beginPath()
      g.arc(1040, 1860, 270, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#f7f3ff'
      g.lineWidth = 8
      g.stroke()
      sparkle(g, 930, 600, 46, '#c6ff3a')
      sparkle(g, 110, 1730, 30, '#9d7dff')
    },
  },
  {
    id: 'acid',
    name: 'Acid',
    ink: '#0d0c12',
    dim: '#2c3a07',
    pill: '#0d0c12',
    pillInk: '#c6ff3a',
    grain: 0.14,
    paint: (g) => {
      linear(g, [[0, '#d2ff5e'], [1, '#bcf52a']], 170)
      glow(g, 140, 220, 900, '#ffffff', 0.55)
      glow(g, 980, 1200, 800, '#8dff6a', 0.4)
      g.fillStyle = '#0d0c12'
      g.beginPath()
      g.arc(1000, 1870, 300, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#ff4fa3'
      g.beginPath()
      g.arc(1030, 1840, 270, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#0d0c12'
      g.lineWidth = 12
      g.stroke()
      g.fillStyle = '#9d7dff'
      g.beginPath()
      g.roundRect(-60, 1560, 220, 220, 36)
      g.fill()
      g.stroke()
      sparkle(g, 940, 620, 52, '#0d0c12')
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    ink: '#fff7f0',
    dim: '#4a1646',
    pill: '#fff7f0',
    pillInk: '#5a1d57',
    grain: 0.11,
    paint: (g) => {
      linear(g, [[0, '#170c3a'], [0.3, '#40206f'], [0.58, '#8f2b7c'], [0.8, '#df5273'], [1, '#ff9a62']], 180)
      glow(g, 540, 1960, 1000, '#ffd08a', 0.85, 0.7)
      glow(g, 930, 620, 700, '#7a4bd6', 0.35)
      glow(g, 80, 1200, 700, '#ff6f91', 0.3)
      // a calm sun sitting on the horizon
      g.fillStyle = 'rgba(255,225,170,0.9)'
      g.beginPath()
      g.arc(540, 1930, 190, Math.PI, 0)
      g.fill()
    },
  },
  {
    id: 'night',
    name: 'Night',
    ink: '#eef1ff',
    dim: '#aeb8e6',
    pill: '#eef1ff',
    pillInk: '#0b1030',
    grain: 0.1,
    paint: (g) => {
      linear(g, [[0, '#04061a'], [0.55, '#0b1440'], [1, '#13265a']], 180)
      glow(g, 160, 1750, 950, '#2fc4b2', 0.26)
      glow(g, 960, 1250, 850, '#7a5cff', 0.3)
      glow(g, 700, 300, 800, '#3a4cc7', 0.25)
      const r = rng(11)
      for (let i = 0; i < 230; i++) {
        const x = r() * W
        const y = r() * H
        const s = 0.7 + r() ** 3 * 3.2
        const quiet = y > 1050 && y < 1620 ? 0.45 : 1 // keep the words area calm
        g.fillStyle = `rgba(255,255,255,${((0.25 + r() * 0.75) * quiet).toFixed(2)})`
        g.beginPath()
        g.arc(x, y, s, 0, Math.PI * 2)
        g.fill()
      }
      for (let i = 0; i < 12; i++) {
        const x = r() * W
        const y = r() * H
        const k = 14 + r() * 14
        if (y < 1040 || y > 1700) sparkle(g, x, y, k, 'rgba(255,255,255,0.85)')
      }
      glow(g, 890, 470, 220, '#cfd8ff', 0.4)
      g.fillStyle = '#f3efe0'
      g.beginPath()
      g.arc(890, 470, 58, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#0d1647'
      g.beginPath()
      g.arc(912, 456, 52, 0, Math.PI * 2)
      g.fill()
    },
  },
]

// ─── typography ───────────────────────────────────────────────
type FaceId = 'lora' | 'bricolage' | 'nunito' | 'instrument'
const FACES: Record<FaceId, { label: string; family: string; style: string; weight: number; lh: number; scale: number; spacing: number }> = {
  lora: { label: 'Editorial', family: '"Lora", Georgia, serif', style: 'italic', weight: 500, lh: 1.24, scale: 0.96, spacing: 0 },
  bricolage: { label: 'Bold', family: '"Bricolage Grotesque", system-ui, sans-serif', style: 'normal', weight: 800, lh: 1.02, scale: 0.98, spacing: -0.025 },
  nunito: { label: 'Soft', family: '"Nunito", system-ui, sans-serif', style: 'normal', weight: 800, lh: 1.2, scale: 0.94, spacing: -0.005 },
  instrument: { label: 'Elegant', family: '"Instrument Serif", Georgia, serif', style: 'normal', weight: 400, lh: 1.04, scale: 1.34, spacing: -0.01 },
}
const SIZES = [88, 124, 172]
const MONO = '"Space Mono", ui-monospace, monospace'

let fontsReady: Promise<unknown> | null = null
function loadFonts() {
  fontsReady ??= Promise.all(
    ['italic 500 64px "Lora"', '500 64px "Lora"', '800 64px "Bricolage Grotesque"', '800 64px "Nunito"', '400 64px "Instrument Serif"', '700 30px "Space Mono"', '600 64px "Inter"'].map((f) => document.fonts.load(f).catch(() => undefined)),
  )
  return fontsReady
}

type Opts = { design: string; face: FaceId; size: number; align: 'left' | 'center'; pos: 'low' | 'mid'; text: string; kicker: string; mark: boolean }

function setSpacing(g: CanvasRenderingContext2D, px: number) {
  if ('letterSpacing' in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${px}px`
}

/** Greedy word wrap that also hard-breaks a single word that is wider than the line. */
function wrap(g: CanvasRenderingContext2D, text: string, max: number) {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const raw of para.split(/\s+/).filter(Boolean)) {
      let word = raw
      while (g.measureText(word).width > max && word.length > 1) {
        let cut = word.length - 1
        while (cut > 1 && g.measureText(word.slice(0, cut)).width > max) cut--
        if (line) {
          out.push(line)
          line = ''
        }
        out.push(word.slice(0, cut))
        word = word.slice(cut)
      }
      const tryLine = line ? `${line} ${word}` : word
      if (line && g.measureText(tryLine).width > max) {
        out.push(line)
        line = word
      } else line = tryLine
    }
    if (line) out.push(line)
  }
  return out
}

/** Narrow the measure while the line count stays put, so lines come out evenly (like text-wrap: balance). */
function balance(g: CanvasRenderingContext2D, text: string, max: number, lines: string[]) {
  if (lines.length < 2) return lines
  let lo = max * 0.45
  let hi = max
  let best = lines
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2
    const t = wrap(g, text, mid)
    if (t.length === lines.length) {
      best = t
      hi = mid
    } else lo = mid
  }
  return best
}

export function drawWallpaper(canvas: HTMLCanvasElement, o: Opts, opts: { grain?: boolean } = {}) {
  const g = canvas.getContext('2d')
  if (!g) return
  const d = DESIGNS.find((x) => x.id === o.design) ?? DESIGNS[0]
  const f = FACES[o.face]
  canvas.width = W
  canvas.height = H
  g.clearRect(0, 0, W, H)
  d.paint(g)
  if (opts.grain !== false) {
    const p = grainPattern(g)
    if (p) {
      g.save()
      g.globalCompositeOperation = 'overlay'
      g.globalAlpha = d.grain
      g.fillStyle = p
      g.fillRect(0, 0, W, H)
      g.restore()
    }
  }

  const text = o.text.trim()
  const left = o.align === 'left'
  const x = left ? MARGIN : W / 2
  const max = W - MARGIN * 2
  g.textAlign = left ? 'left' : 'center'
  g.textBaseline = 'alphabetic'

  // text block: label pill + wrapped, auto-shrunk words
  const kick = o.kicker.trim().toUpperCase()
  const pillH = 76
  const pillGap = 70
  const head = kick ? pillH + pillGap : 0
  const bottom = o.pos === 'low' ? BOTTOM_LIMIT : 1360
  const top = o.pos === 'low' ? SAFE_TOP + 40 : SAFE_TOP + 90
  const maxH = bottom - top - head

  let size = Math.round(SIZES[o.size] * f.scale)
  let lines: string[] = []
  const minSize = 34
  const font = (s: number) => `${f.style} ${f.weight} ${s}px ${f.family}`
  for (; size >= minSize; size -= 2) {
    g.font = font(size)
    setSpacing(g, f.spacing * size)
    lines = wrap(g, text, max)
    if (lines.length * size * f.lh <= maxH) break
  }
  size = Math.max(size, minSize)
  g.font = font(size)
  setSpacing(g, f.spacing * size)
  lines = balance(g, text, max, wrap(g, text, max))
  const blockH = lines.length * size * f.lh
  const total = head + (text ? blockH : 0)
  // low: anchored to the bottom. mid: centred in the space below the clock.
  const startY = o.pos === 'low' ? bottom - total : Math.max(top, (top + bottom) / 2 + 60 - total / 2)

  g.fillStyle = d.ink
  if (text) {
    lines.forEach((l, i) => g.fillText(l, x, startY + head + (i + 0.5) * size * f.lh + size * 0.32))
  }
  setSpacing(g, 0)

  if (kick) {
    g.font = `700 30px ${MONO}`
    setSpacing(g, 5)
    const tw = g.measureText(kick).width
    const pw = Math.min(max, tw + 80)
    const px = left ? MARGIN : (W - pw) / 2
    g.fillStyle = d.pill
    g.beginPath()
    g.roundRect(px, startY, pw, pillH, pillH / 2)
    g.fill()
    g.fillStyle = d.pillInk
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(kick, px + pw / 2 + 2, startY + pillH / 2 + 2, pw - 40)
    setSpacing(g, 0)
    g.textBaseline = 'alphabetic'
  }

  if (o.mark) {
    g.textAlign = 'center'
    g.font = `700 26px ${MONO}`
    setSpacing(g, 4)
    g.fillStyle = d.dim
    g.globalAlpha = 0.8
    g.fillText('perfucktionist', W / 2, 1650)
    g.globalAlpha = 1
    setSpacing(g, 0)
  }
}

// ─── components ───────────────────────────────────────────────
type Saved = { text: string; kicker: string; design: string; face: FaceId; size: number; align: 'left' | 'center'; pos: 'low' | 'mid' }
const DEFAULTS: Saved = { text: IDEAS[0], kicker: 'reminder', design: 'peach', face: 'lora', size: 1, align: 'left', pos: 'low' }

function Thumb({ design, active, onPick }: { design: Design; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    const g = c?.getContext('2d')
    if (!c || !g) return
    c.width = 108
    c.height = 192
    g.save()
    g.scale(0.1, 0.1)
    design.paint(g)
    g.restore()
  }, [design])
  return (
    <button type="button" className={`wp-thumb${active ? ' on' : ''}`} aria-pressed={active} onClick={onPick}>
      <canvas ref={ref} aria-hidden="true" />
      <span>{design.name}</span>
    </button>
  )
}

export function Wallpaper() {
  const plus = usePlus()
  const [saved, setSaved] = useTool<Saved>('wallpaper', DEFAULTS)
  const s: Saved = useMemo(() => ({ ...DEFAULTS, ...saved }), [saved])
  const set = (patch: Partial<Saved>) => setSaved({ ...s, ...patch })
  const design = DESIGNS.find((d) => d.id === s.design) ?? DESIGNS[0]
  const canvas = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('')
  const mark = !plus.active

  useEffect(() => {
    let live = true
    const id = requestAnimationFrame(async () => {
      await loadFonts()
      const c = canvas.current
      if (live && c) drawWallpaper(c, { ...s, mark })
    })
    return () => {
      live = false
      cancelAnimationFrame(id)
    }
  }, [s, mark])

  const date = useMemo(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }), [])

  async function file() {
    const c = canvas.current
    if (!c) return null
    await loadFonts()
    drawWallpaper(c, { ...s, mark })
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/png'))
    return blob ? new File([blob], 'perfucktionist-wallpaper.png', { type: 'image/png' }) : null
  }
  function save(f: File) {
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }
  async function download() {
    const f = await file()
    if (!f) return setStatus('Could not make the image. Try again.')
    save(f)
    setStatus('saved ✓ set it as your lock screen')
    log('tool')
  }
  async function share() {
    const f = await file()
    if (!f) return setStatus('Could not make the image. Try again.')
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [f] })) {
      try {
        await navigator.share({ files: [f], text: 'made on perfucktionist' })
        setStatus('shared ✓')
        log('tool')
      } catch {
        // cancelled
      }
    } else {
      save(f)
      setStatus('saved ✓ (sharing is not available here)')
      log('tool')
    }
  }

  return (
    <div className="wp">
      <div className="wp-stage">
        <div className="wp-phone">
          <div className="wp-screen">
            <canvas ref={canvas} width={W} height={H} aria-label="Wallpaper preview" />
            <div className="wp-island" aria-hidden="true" />
            <div className="wp-clock" aria-hidden="true" style={{ color: design.ink }}>
              <span>{date}</span>
              <b>9:41</b>
            </div>
            <div className="wp-dock" aria-hidden="true" style={{ color: design.ink }}>
              <i />
              <i />
            </div>
          </div>
        </div>
        <div className="wp-actions">
          <button type="button" className="btn btn-primary a-lime" onClick={download} disabled={!s.text.trim()}>
            ↓ download PNG
          </button>
          <button type="button" className="btn" onClick={share} disabled={!s.text.trim()}>
            ↗ share
          </button>
        </div>
        <p className="muted wp-note" role="status">
          {status || (mark ? '1080×1920 · remove the small mark with Plus' : '1080×1920 · no watermark')}
        </p>
      </div>

      <div className="wp-controls stack">
        <div className="stack wp-block">
          <Text label="your words" value={s.text} onChange={(text) => set({ text })} max={120} placeholder="a line you need to see every day" />
          <div className="wp-ideas" role="group" aria-label="Quick ideas">
            {IDEAS.map((w) => (
              <button key={w} type="button" className={`chip${s.text === w ? ' on' : ''}`} onClick={() => set({ text: w })}>
                {w}
              </button>
            ))}
          </div>
          <Text label="small label on top" value={s.kicker} onChange={(kicker) => set({ kicker })} max={24} placeholder="optional" />
        </div>

        <div className="wp-block">
          <p className="kicker">design</p>
          <div className="wp-designs" role="group" aria-label="Design">
            {DESIGNS.map((d) => (
              <Thumb key={d.id} design={d} active={d.id === design.id} onPick={() => set({ design: d.id })} />
            ))}
          </div>
        </div>

        <div className="wp-block stack">
          <div className="stack wp-sub">
            <p className="kicker">typeface</p>
            <div className="wp-faces" role="radiogroup" aria-label="Typeface">
              {(Object.keys(FACES) as FaceId[]).map((id) => (
                <button key={id} type="button" role="radio" aria-checked={s.face === id} className={`chip wp-face${s.face === id ? ' on' : ''}`} style={{ fontFamily: FACES[id].family, fontStyle: FACES[id].style, fontWeight: FACES[id].weight === 800 ? 800 : FACES[id].weight }} onClick={() => set({ face: id })}>
                  {FACES[id].label}
                </button>
              ))}
            </div>
          </div>
          <div className="wp-row">
            <div className="stack wp-sub">
              <p className="kicker">size</p>
              <Choice value={s.size} onChange={(size) => set({ size })} options={[{ value: 0, label: 'S' }, { value: 1, label: 'M' }, { value: 2, label: 'L' }]} />
            </div>
            <div className="stack wp-sub">
              <p className="kicker">align</p>
              <Choice value={s.align} onChange={(align) => set({ align })} options={[{ value: 'left', label: 'left' }, { value: 'center', label: 'centre' }]} />
            </div>
            <div className="stack wp-sub">
              <p className="kicker">position</p>
              <Choice value={s.pos} onChange={(pos) => set({ pos })} options={[{ value: 'low', label: 'lower third' }, { value: 'mid', label: 'centre' }]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
