export type Accent = 'lime' | 'pink' | 'violet' | 'cyan' | 'sun' | 'orange'

export type Zone = {
  path: string
  emoji: string
  title: string
  tag?: string
  blurb: string
  accent: Accent
}

export const zones: Zone[] = [
  { path: '/unperfect', emoji: '🫠', title: 'Unlearn Perfect', blurb: 'how to stop giving a f*ck about being perfect', accent: 'lime' },
  { path: '/shield', emoji: '🛡️', title: 'Shield', tag: 'for her', blurb: 'self-defence moves, safety hacks, SOS tools & your legal rights', accent: 'pink' },
  { path: '/bro', emoji: '🔱', title: 'Bro Code', tag: 'for him', blurb: 'respect, discipline, real feelings & warrior shlokas', accent: 'cyan' },
  { path: '/library', emoji: '📚', title: 'Sacred Library', tag: 'every faith', blurb: '1.2 lakh+ verses — Gita, Ramayana, Gurbani, Quran, Bible, Dhammapada', accent: 'sun' },
  { path: '/breathe', emoji: '🫁', title: 'Breathe', blurb: 'hold your breath, find your calm — guided pranayama & meditation', accent: 'violet' },
  { path: '/music', emoji: '🎧', title: 'Vibe Room', blurb: 'any song on earth. bollywood, hollywood, k-pop, bhajans, lofi', accent: 'orange' },
  { path: '/happy', emoji: '🫧', title: 'Happy Zone', blurb: 'pop bubbles, yeet your stress, fill a gratitude jar', accent: 'pink' },
  { path: '/brave', emoji: '🦁', title: 'Be Brave', blurb: 'scared? good. now do it anyway', accent: 'sun' },
  { path: '/fam', emoji: '🏠', title: 'No Secrets Club', blurb: "talk to your parents — they've handled worse", accent: 'cyan' },
  { path: '/faith', emoji: '🙏', title: 'Real Faith', blurb: "god doesn't need your UPI. spot fake babas, pastors & peers", accent: 'orange' },
  { path: '/green', emoji: '🌳', title: 'Save Trees', blurb: 'trees > tantrums. plant, protect, repeat', accent: 'lime' },
]

/** The paid-ish glow-up layer: progress, guided journeys, membership. */
export const glowUp: Zone[] = [
  { path: '/me', emoji: '🔥', title: 'My Glow-up', blurb: 'streaks, XP, badges & your companion', accent: 'lime' },
  { path: '/journeys', emoji: '🧭', title: 'Journeys', blurb: '5-minute daily guided programs', accent: 'violet' },
  { path: '/plus', emoji: '✦', title: 'Plus', blurb: 'less perfect. more you.', accent: 'pink' },
]

export const zoneByPath = (path: string) => [...zones, ...glowUp].find((z) => z.path === path)

export const motives = [
  'perfection is a scam',
  'save trees 🌳',
  'be brave 🦁',
  'god is free, babas are not 🙏',
  'no secrets from your parents 🏠',
  'breathe before you break 🫁',
  'consent is non-negotiable',
  'done > perfect',
  'your body, your rules 🛡️',
  'real men cry 💧',
  'play music, loud 🎧',
]
