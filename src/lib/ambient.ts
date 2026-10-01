// Ambient sounds synthesised live with WebAudio — rain, noise colours, ocean, wind, fire.
// One global mixer so sounds keep playing while you move between pages.
import { useSyncExternalStore } from 'react'

export type Layer = 'rain' | 'brown' | 'pink' | 'white' | 'ocean' | 'wind' | 'fire'

export const LAYERS: { id: Layer; emoji: string; name: string }[] = [
  { id: 'rain', emoji: '🌧️', name: 'Rain' },
  { id: 'brown', emoji: '🟤', name: 'Brown noise' },
  { id: 'ocean', emoji: '🌊', name: 'Ocean' },
  { id: 'wind', emoji: '🍃', name: 'Wind' },
  { id: 'fire', emoji: '🔥', name: 'Fireplace' },
  { id: 'pink', emoji: '🩷', name: 'Pink noise' },
  { id: 'white', emoji: '⚪', name: 'White noise' },
]

type Running = { gain: GainNode; stop: () => void }

let ctx: AudioContext | null = null
let master: GainNode | null = null
const running = new Map<Layer, Running>()
const volumes = new Map<Layer, number>()
let fadeTimer: number | null = null
let fadeEndsAt: number | null = null
const listeners = new Set<() => void>()
let snapshot = { on: [] as Layer[], volumes: {} as Partial<Record<Layer, number>>, fadeEndsAt: null as number | null }

function emit() {
  snapshot = { on: [...running.keys()], volumes: Object.fromEntries(volumes), fadeEndsAt }
  listeners.forEach((l) => l())
}

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { c: ctx, out: master! }
}

function noiseBuffer(c: AudioContext, kind: 'white' | 'pink' | 'brown') {
  const len = c.sampleRate * 4
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (kind === 'white') d[i] = w * 0.5
    else if (kind === 'pink') {
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.969 * b2 + w * 0.153852
      b3 = 0.8665 * b3 + w * 0.3104856
      b4 = 0.55 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.016898
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    } else {
      last = (last + 0.02 * w) / 1.02
      d[i] = last * 3.5
    }
  }
  return buf
}

function loop(c: AudioContext, kind: 'white' | 'pink' | 'brown') {
  const src = c.createBufferSource()
  src.buffer = noiseBuffer(c, kind)
  src.loop = true
  return src
}

function lfo(c: AudioContext, freq: number, depth: number, target: AudioParam) {
  const o = c.createOscillator()
  o.frequency.value = freq
  const g = c.createGain()
  g.gain.value = depth
  o.connect(g).connect(target)
  o.start()
  return o
}

function build(layer: Layer, c: AudioContext, gain: GainNode): () => void {
  const stops: (() => void)[] = []
  const filter = (type: BiquadFilterType, f: number, q = 0.7) => {
    const b = c.createBiquadFilter()
    b.type = type
    b.frequency.value = f
    b.Q.value = q
    return b
  }
  const startSrc = (src: AudioBufferSourceNode, ...chain: AudioNode[]) => {
    let node: AudioNode = src
    for (const n of chain) node = node.connect(n)
    node.connect(gain)
    src.start()
    stops.push(() => src.stop())
  }

  if (layer === 'white' || layer === 'pink' || layer === 'brown') startSrc(loop(c, layer), filter('lowpass', layer === 'white' ? 9000 : 6000))
  if (layer === 'rain') {
    startSrc(loop(c, 'pink'), filter('highpass', 500), filter('lowpass', 5000))
    const patter = c.createGain()
    patter.gain.value = 0.6
    const o = lfo(c, 0.23, 0.25, patter.gain)
    startSrc(loop(c, 'white'), filter('bandpass', 2600, 0.6), patter)
    stops.push(() => o.stop())
  }
  if (layer === 'ocean') {
    const swell = c.createGain()
    swell.gain.value = 0.55
    const o = lfo(c, 0.085, 0.45, swell.gain)
    startSrc(loop(c, 'brown'), filter('lowpass', 900), swell)
    stops.push(() => o.stop())
  }
  if (layer === 'wind') {
    const bp = filter('bandpass', 600, 1.2)
    const o = lfo(c, 0.11, 350, bp.frequency)
    startSrc(loop(c, 'pink'), bp)
    stops.push(() => o.stop())
  }
  if (layer === 'fire') {
    startSrc(loop(c, 'brown'), filter('lowpass', 350))
    const crackleBuf = noiseBuffer(c, 'white')
    let alive = true
    const crackle = () => {
      if (!alive) return
      const s = c.createBufferSource()
      s.buffer = crackleBuf
      const g = c.createGain()
      const t = c.currentTime
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.35 + Math.random() * 0.5, t + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.05)
      s.connect(filter('highpass', 1800 + Math.random() * 2500)).connect(g).connect(gain)
      s.start(t, Math.random() * 3, 0.1)
      setTimeout(crackle, 40 + Math.random() * (Math.random() > 0.8 ? 900 : 260))
    }
    crackle()
    stops.push(() => (alive = false))
  }
  return () => stops.forEach((s) => s())
}

export const ambient = {
  isOn: (l: Layer) => running.has(l),
  toggle(l: Layer) {
    if (running.has(l)) return this.stop(l)
    this.start(l)
  },
  start(l: Layer, volume?: number) {
    if (running.has(l)) return
    const { c, out } = audio()
    const gain = c.createGain()
    const v = volume ?? volumes.get(l) ?? 0.6
    volumes.set(l, v)
    gain.gain.setValueAtTime(0.0001, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), c.currentTime + 1.2)
    gain.connect(out)
    running.set(l, { gain, stop: build(l, c, gain) })
    if (master) master.gain.setValueAtTime(0.9, c.currentTime)
    emit()
  },
  stop(l: Layer) {
    const r = running.get(l)
    if (!r || !ctx) return
    r.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3)
    setTimeout(() => {
      r.stop()
      r.gain.disconnect()
    }, 1200)
    running.delete(l)
    emit()
  },
  setVolume(l: Layer, v: number) {
    volumes.set(l, v)
    const r = running.get(l)
    if (r && ctx) r.gain.gain.setTargetAtTime(Math.max(0.0001, v), ctx.currentTime, 0.1)
    emit()
  },
  stopAll() {
    ;[...running.keys()].forEach((l) => this.stop(l))
    this.cancelFade()
  },
  /** Slowly fade everything out over `minutes`, then stop. */
  fadeOut(minutes: number) {
    this.cancelFade()
    if (!ctx || !master) return
    const secs = minutes * 60
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + secs)
    fadeEndsAt = Date.now() + secs * 1000
    fadeTimer = window.setTimeout(() => {
      ;[...running.keys()].forEach((l) => this.stop(l))
      fadeEndsAt = null
      emit()
    }, secs * 1000)
    emit()
  },
  cancelFade() {
    if (fadeTimer) clearTimeout(fadeTimer)
    fadeTimer = null
    fadeEndsAt = null
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(0.9, ctx.currentTime)
    }
    emit()
  },
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useAmbient() {
  return useSyncExternalStore(subscribe, () => snapshot)
}
