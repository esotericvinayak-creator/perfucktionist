// Every sound on the site is synthesised with WebAudio — no audio files to ship.

let ctx: AudioContext | null = null

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Call from a click handler so sounds scheduled later (timers) are allowed to play. */
export function unlockAudio() {
  audio()
}

function envelope(c: AudioContext, peak: number, attack: number, release: number, start: number) {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(peak, start + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release)
  g.connect(c.destination)
  return g
}

export function tone(freq: number, length = 0.2, type: OscillatorType = 'sine', peak = 0.15, delay = 0) {
  const c = audio()
  const start = c.currentTime + delay
  const osc = c.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  osc.connect(envelope(c, peak, 0.01, length, start))
  osc.start(start)
  osc.stop(start + length + 0.05)
}

/** Soft cue used when a breathing phase changes. */
export function chime(high = false) {
  tone(high ? 660 : 440, 0.6, 'sine', 0.08)
}

/** Singing-bowl-ish bell for meditation start/end. */
export function bell() {
  const base = 264
  ;[1, 2.01, 3.03, 4.2].forEach((m, i) => tone(base * m, 3.2 - i * 0.6, 'sine', 0.12 / (i + 1)))
}

/** Bubble-wrap pop. */
export function pop() {
  const c = audio()
  const start = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(900 + Math.random() * 500, start)
  osc.frequency.exponentialRampToValueAtTime(120, start + 0.08)
  osc.connect(envelope(c, 0.25, 0.002, 0.08, start))
  osc.start(start)
  osc.stop(start + 0.12)
}

export function whoosh() {
  const c = audio()
  const start = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, start)
  osc.frequency.exponentialRampToValueAtTime(1600, start + 0.5)
  osc.connect(envelope(c, 0.05, 0.05, 0.5, start))
  osc.start(start)
  osc.stop(start + 0.6)
}

/** Loud wailing siren. Returns a stop function. */
export function startSiren() {
  const c = audio()
  const gain = c.createGain()
  gain.gain.value = 0.6
  gain.connect(c.destination)
  const osc = c.createOscillator()
  osc.type = 'square'
  osc.frequency.value = 900
  const lfo = c.createOscillator()
  lfo.frequency.value = 1.6
  const lfoGain = c.createGain()
  lfoGain.gain.value = 450
  lfo.connect(lfoGain).connect(osc.frequency)
  osc.connect(gain)
  osc.start()
  lfo.start()
  return () => {
    gain.gain.setTargetAtTime(0, c.currentTime, 0.05)
    osc.stop(c.currentTime + 0.2)
    lfo.stop(c.currentTime + 0.2)
  }
}

/** Classic phone ring pattern. Returns a stop function. */
export function startRingtone() {
  const ring = () => {
    for (let i = 0; i < 2; i++) {
      tone(1400, 0.35, 'sine', 0.18, i * 0.45)
      tone(1750, 0.35, 'sine', 0.12, i * 0.45)
    }
    navigator.vibrate?.([400, 100, 400])
  }
  ring()
  const id = window.setInterval(ring, 2600)
  return () => {
    window.clearInterval(id)
    navigator.vibrate?.(0)
  }
}
