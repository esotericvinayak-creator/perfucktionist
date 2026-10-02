// Who you are (optional): gender, faith and your pet. These only change ORDER and DEFAULTS —
// nothing is ever hidden from anyone.
import { shlokas } from './shlokas'
import { traditions, wisdom, type Tradition } from './wisdom'

// ─── gender ───────────────────────────────────────────────────
export const GENDERS = [
  { id: 'woman', label: 'Woman / girl' },
  { id: 'man', label: 'Man / boy' },
  { id: 'non-binary', label: 'Non-binary' },
  { id: 'trans-woman', label: 'Trans woman' },
  { id: 'trans-man', label: 'Trans man' },
  { id: 'transgender', label: 'Transgender / third gender' },
  { id: 'genderfluid', label: 'Genderfluid / queer' },
  { id: 'self', label: 'Let me describe it' },
  { id: 'none', label: 'Prefer not to say' },
] as const
export type Gender = (typeof GENDERS)[number]['id']

type Spotlight = { path: string; icon: string; title: string; why: string }
/** What we put first for you. Everything else is still one tap away in Explore. */
export function priorities(gender?: string): { tools: string[]; spotlight: Spotlight | null } {
  switch (gender) {
    case 'woman':
      return { tools: ['safe-walk', 'period', 'ice', 'red-flags'], spotlight: { path: '/shield', icon: 'safety', title: 'Shield', why: 'self-defence moves, SOS tools and your legal rights' } }
    case 'trans-woman':
      return { tools: ['safe-walk', 'ice', 'red-flags', 'boundaries'], spotlight: { path: '/shield', icon: 'safety', title: 'Shield', why: 'self-defence moves, SOS tools and your rights' } }
    case 'man':
      return { tools: ['workout', 'boundaries', 'friends', 'urge'], spotlight: { path: '/bro', icon: 'people', title: 'Bro code', why: 'respect, real feelings, discipline' } }
    case 'trans-man':
      return { tools: ['workout', 'period', 'safe-walk', 'boundaries'], spotlight: { path: '/bro', icon: 'people', title: 'Bro code', why: 'respect, real feelings, discipline' } }
    case 'non-binary':
    case 'transgender':
    case 'genderfluid':
    case 'self':
      return { tools: ['safe-walk', 'ice', 'journal', 'boundaries'], spotlight: { path: '/shield', icon: 'safety', title: 'Safety, your way', why: 'SOS tools, self-defence and your rights — for everyone' } }
    default:
      return { tools: [], spotlight: null }
  }
}

// ─── faith ────────────────────────────────────────────────────
export type Faith = {
  id: string
  label: string
  emoji: string
  /** Which quote traditions to prefer; 'all' = every faith. */
  traditions: Tradition[] | 'all'
  /** Scripture the Library opens first, with an optional section key. */
  book: { id: string; key?: string } | null
  /** No scripture pushed on Home — philosophy instead. */
  secular?: boolean
  shlokas?: boolean
}

export const FAITHS: Faith[] = [
  { id: 'hindu', label: 'Hindu', emoji: '🕉️', traditions: ['hindu'], book: { id: 'gita' }, shlokas: true },
  { id: 'muslim', label: 'Muslim', emoji: '☪️', traditions: ['islam'], book: { id: 'quran' } },
  { id: 'sikh', label: 'Sikh', emoji: '☬', traditions: ['sikh'], book: { id: 'sggs' } },
  { id: 'christian', label: 'Christian', emoji: '✝️', traditions: ['christian', 'jewish'], book: { id: 'bible', key: 'MAT/5' } },
  { id: 'buddhist', label: 'Buddhist', emoji: '☸️', traditions: ['buddhist'], book: { id: 'dhammapada' } },
  { id: 'jain', label: 'Jain', emoji: '🤚', traditions: ['jain'], book: null },
  { id: 'jewish', label: 'Jewish', emoji: '✡️', traditions: ['jewish'], book: { id: 'bible', key: 'GEN/1' } },
  { id: 'parsi', label: 'Parsi / Zoroastrian', emoji: '🔥', traditions: ['zoroastrian'], book: null },
  { id: 'bahai', label: 'Baháʼí', emoji: '🌍', traditions: ['bahai'], book: null },
  { id: 'spiritual', label: 'Spiritual, not religious', emoji: '✨', traditions: 'all', book: null, shlokas: true },
  { id: 'atheist', label: 'Atheist', emoji: '🔬', traditions: ['stoic', 'confucian', 'taoist'], book: null, secular: true },
  { id: 'agnostic', label: 'Agnostic', emoji: '🤔', traditions: ['stoic', 'taoist', 'confucian', 'buddhist'], book: null, secular: true },
  { id: 'all', label: 'Every faith, please', emoji: '🌈', traditions: 'all', book: null, shlokas: true },
  { id: 'other', label: 'Something else', emoji: '💫', traditions: 'all', book: null, shlokas: true },
  { id: 'none', label: 'Prefer not to say', emoji: '🤐', traditions: 'all', book: null, shlokas: true },
]
export const faithById = (id?: string) => FAITHS.find((f) => f.id === id)

/** A line of wisdom, ready to show or read aloud. */
export type Line = { badge: string; original?: string; lang?: string; rtl?: boolean; text: string; extra: string; speak: string }

/** Quotes for this person, their own tradition first; topped up with the golden rule so the pool never runs dry. */
export function linesFor(faithId?: string): Line[] {
  const f = faithById(faithId)
  const all = !f || f.traditions === 'all'
  const own = wisdom.filter((w) => all || (f!.traditions as Tradition[]).includes(w.tradition))
  const topUp = own.length < 8 && !f?.secular ? wisdom.filter((w) => w.themes.includes('golden') && !own.includes(w)) : []
  const lines: Line[] = [...own, ...topUp].map((w) => ({ badge: `${traditions[w.tradition].emoji} ${w.source}`, original: w.original, lang: w.lang, rtl: w.rtl, text: w.text, extra: '', speak: w.text }))
  if (!f || f.shlokas) lines.push(...shlokas.map((s) => ({ badge: `🕉️ ${s.source}`, original: s.devanagari, lang: 'sa', text: s.meaning, extra: s.genz, speak: `${s.meaning}. ${s.genz}` })))
  return lines
}

// ─── pets ─────────────────────────────────────────────────────
export const PETS = [
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'otter', emoji: '🦦', name: 'Otter' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'chick', emoji: '🐥', name: 'Chick' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
] as const

/** Plus cosmetic: something for your pet to wear. */
export const ACCESSORIES = [
  { id: 'none', emoji: '', name: 'Nothing', plus: false },
  { id: 'bow', emoji: '🎀', name: 'Bow', plus: false },
  { id: 'cap', emoji: '🧢', name: 'Cap', plus: false },
  { id: 'shades', emoji: '🕶️', name: 'Shades', plus: true },
  { id: 'crown', emoji: '👑', name: 'Crown', plus: true },
  { id: 'tophat', emoji: '🎩', name: 'Top hat', plus: true },
  { id: 'flower', emoji: '🌸', name: 'Flower', plus: true },
  { id: 'headphones', emoji: '🎧', name: 'Headphones', plus: true },
] as const

export const petById = (id?: string) => PETS.find((p) => p.id === id) ?? PETS[0]
export const accessoryById = (id?: string) => ACCESSORIES.find((a) => a.id === id) ?? ACCESSORIES[0]
