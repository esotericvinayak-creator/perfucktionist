// One reader, six scriptures. Gita + Ramayana are self-hosted (see scripts/build-library.mjs);
// the rest come from free, CORS-enabled public APIs.
import type { Accent } from '../data/zones'

export type ScriptureId = 'gita' | 'ramayana' | 'sggs' | 'quran' | 'bible' | 'dhammapada'

export type Verse = {
  /** Unique within the section — used to scroll to / highlight a verse. */
  n: number
  label: string
  /** Full citation, e.g. "Bhagavad Gita 2.47". */
  cite: string
  original?: string
  lang?: string
  rtl?: boolean
  roman?: string
  /** Devanagari transliteration, for readers who don't know the original script. */
  romanHi?: string
  en: string
  hi?: string
  audio?: string
}

export type Section = { title: string; subtitle?: string; verses: Verse[] }
export type TocGroup = { label: string; items: { key: string; label: string }[] }

export type Scripture = {
  id: ScriptureId
  name: string
  tradition: string
  emoji: string
  accent: Accent
  total: number
  unit: string
  langs: string
  blurb: string
  credit: { text: string; href: string }
  hasHindi: boolean
  toc: () => Promise<TocGroup[]>
  load: (key: string) => Promise<Section>
}

const BASE = import.meta.env.BASE_URL
const GITA_AUDIO = 'https://cdn.jsdelivr.net/gh/gita/gita@c6fce39595445768876ddbb8d1268a9c935e1d2b/data/verse_recitation'

const cache = new Map<string, Promise<unknown>>()
function getJson<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    p.catch(() => cache.delete(url))
    cache.set(url, p)
  }
  return cache.get(url) as Promise<T>
}

const once = <T,>(fn: () => Promise<T>) => {
  let p: Promise<T> | null = null
  return () => (p ??= fn().catch((e) => ((p = null), Promise.reject(e))))
}

// ─── Bhagavad Gita ────────────────────────────────────────────
type GitaIndex = { chapters: { n: number; name: string; translit: string; meaning: string; verses: number; summary: string }[] }
type GitaVerse = { n: number; sa: string; r: string; en: string; hi: string }
const gitaIndex = once(() => getJson<GitaIndex>(`${BASE}library/gita/index.json`))

const gita: Scripture = {
  id: 'gita',
  name: 'Bhagavad Gita',
  tradition: 'Hindu',
  emoji: '🕉️',
  accent: 'sun',
  total: 701,
  unit: 'verses',
  langs: 'Sanskrit · English · हिंदी · 🔊 audio',
  blurb: 'Krishna’s pep talk to Arjuna on a battlefield. 18 chapters on duty, fear, focus and letting go.',
  credit: { text: 'Text & recitations: gita/gita (public domain). Translations: Swami Sivananda (EN), Swami Tejomayananda (HI).', href: 'https://github.com/gita/gita' },
  hasHindi: true,
  toc: async () => {
    const { chapters } = await gitaIndex()
    return [{ label: 'Chapters', items: chapters.map((c) => ({ key: String(c.n), label: `${c.n}. ${c.translit} — ${c.meaning}` })) }]
  },
  load: async (key) => {
    const [{ chapters }, verses] = await Promise.all([gitaIndex(), getJson<GitaVerse[]>(`${BASE}library/gita/${key}.json`)])
    const ch = chapters.find((c) => String(c.n) === key)
    return {
      title: `Chapter ${key} · ${ch?.name ?? ''}`,
      subtitle: ch ? `${ch.translit} — ${ch.meaning}. ${ch.summary}` : undefined,
      verses: verses.map((v) => ({ n: v.n, label: `${key}.${v.n}`, cite: `Bhagavad Gita ${key}.${v.n}`, original: v.sa, lang: 'sa', roman: v.r, en: v.en, hi: v.hi, audio: `${GITA_AUDIO}/${key}/${v.n}.mp3` })),
    }
  },
}

// ─── Valmiki Ramayana ─────────────────────────────────────────
type RamIndex = { kandas: { n: number; name: string; sargas: number[] }[] }
type RamVerse = { n: number; sa: string; r: string; en: string }
const ramIndex = once(() => getJson<RamIndex>(`${BASE}library/ramayana/index.json`))

const ramayana: Scripture = {
  id: 'ramayana',
  name: 'Valmiki Ramayana',
  tradition: 'Hindu',
  emoji: '🏹',
  accent: 'orange',
  total: 23291,
  unit: 'shlokas',
  langs: 'Sanskrit · English',
  blurb: 'The original epic of Rama, Sita and Hanuman — all 7 kandas, 648 sargas, every shloka.',
  credit: { text: 'Valmiki Ramayan Dataset (MIT), compiled from IIT Kanpur’s Valmiki Ramayana project & M.N. Dutt.', href: 'https://github.com/Ashutosh-Vijay/Valmiki_Ramayan_Dataset' },
  hasHindi: false,
  toc: async () => {
    const { kandas } = await ramIndex()
    return kandas.map((k) => ({ label: `${k.n}. ${k.name}`, items: k.sargas.map((count, i) => ({ key: `${k.n}-${i + 1}`, label: `Sarga ${i + 1} · ${count} shlokas` })) }))
  },
  load: async (key) => {
    const [{ kandas }, verses] = await Promise.all([ramIndex(), getJson<RamVerse[]>(`${BASE}library/ramayana/${key}.json`)])
    const [k, s] = key.split('-').map(Number)
    return {
      title: `${kandas[k - 1]?.name ?? 'Kanda'} · Sarga ${s}`,
      verses: verses.map((v) => ({ n: v.n, label: `${k}.${s}.${v.n}`, cite: `Valmiki Ramayana ${k}.${s}.${v.n}`, original: v.sa, lang: 'sa', roman: v.r, en: v.en })),
    }
  },
}

// ─── Sri Guru Granth Sahib (BaniDB) ───────────────────────────
type BaniLine = {
  verseId: number
  lineNo: number
  verse: { unicode: string }
  transliteration: { en?: string; hi?: string }
  translation: { en?: { bdb?: string; ssk?: string; ms?: string }; hi?: { sts?: string; ss?: string } }
  writer?: { english?: string | null }
  raag?: { english?: string | null }
}

const sggs: Scripture = {
  id: 'sggs',
  name: 'Sri Guru Granth Sahib',
  tradition: 'Sikh',
  emoji: '☬',
  accent: 'cyan',
  total: 60403,
  unit: 'lines',
  langs: 'Gurmukhi · English · हिंदी',
  blurb: 'The living Guru of the Sikhs — 1,430 angs of Gurbani by Sikh Gurus, and Hindu & Muslim saints like Kabir and Farid.',
  credit: { text: 'BaniDB (Khalis Foundation). Translations: Dr. Sant Singh Khalsa / BaniDB (EN), Sahib Singh-based (HI).', href: 'https://www.banidb.com' },
  hasHindi: true,
  toc: async () =>
    Array.from({ length: 15 }, (_, g) => {
      const from = g * 100 + 1
      const to = Math.min(1430, from + 99)
      return { label: `Angs ${from}–${to}`, items: Array.from({ length: to - from + 1 }, (_, i) => ({ key: String(from + i), label: `Ang ${from + i}` })) }
    }),
  load: async (key) => {
    const data = await getJson<{ page: BaniLine[] }>(`https://api.banidb.com/v2/angs/${key}/G`)
    const first = data.page[0]
    const writers = [...new Set(data.page.map((l) => l.writer?.english).filter(Boolean))]
    return {
      title: `Ang ${key}`,
      subtitle: [first?.raag?.english, writers.join(', ')].filter(Boolean).join(' · ') || undefined,
      verses: data.page.map((l, i) => ({
        n: i + 1,
        label: `Ang ${key} · ${l.lineNo}`,
        cite: `Guru Granth Sahib, Ang ${key}`,
        original: l.verse.unicode,
        lang: 'pa',
        roman: l.transliteration.en,
        romanHi: l.transliteration.hi,
        en: l.translation.en?.bdb || l.translation.en?.ssk || l.translation.en?.ms || '',
        hi: l.translation.hi?.sts || l.translation.hi?.ss || undefined,
      })),
    }
  },
}

// ─── Quran (alquran.cloud) ────────────────────────────────────
type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number }
type Edition = { ayahs: { numberInSurah: number; text: string }[] }
const surahs = once(async () => (await getJson<{ data: Surah[] }>('https://api.alquran.cloud/v1/surah')).data)

const quran: Scripture = {
  id: 'quran',
  name: 'The Quran',
  tradition: 'Islam',
  emoji: '☪️',
  accent: 'lime',
  total: 6236,
  unit: 'ayahs',
  langs: 'Arabic · transliteration · English · हिंदी',
  blurb: 'All 114 surahs in Arabic, with transliteration, Saheeh International English and Hindi.',
  credit: { text: 'AlQuran Cloud API. Translations: Saheeh International (EN), Suhel Farooq Khan & Saifur Rahman Nadwi (HI).', href: 'https://alquran.cloud' },
  hasHindi: true,
  toc: async () => [{ label: 'Surahs', items: (await surahs()).map((s) => ({ key: String(s.number), label: `${s.number}. ${s.englishName} — ${s.englishNameTranslation}` })) }],
  load: async (key) => {
    const [list, res] = await Promise.all([surahs(), getJson<{ data: Edition[] }>(`https://api.alquran.cloud/v1/surah/${key}/editions/quran-uthmani,en.transliteration,en.sahih,hi.hindi`)])
    const s = list.find((x) => String(x.number) === key)
    const [ar, tr, en, hi] = res.data
    return {
      title: `Surah ${key} · ${s?.englishName ?? ''}`,
      subtitle: s ? `${s.name} — “${s.englishNameTranslation}”, ${s.numberOfAyahs} ayahs` : undefined,
      verses: ar.ayahs.map((a, i) => ({ n: a.numberInSurah, label: `${key}:${a.numberInSurah}`, cite: `Quran ${key}:${a.numberInSurah}`, original: a.text.replace(/^\uFEFF/, ''), lang: 'ar', rtl: true, roman: tr.ayahs[i]?.text, en: en.ayahs[i]?.text ?? '', hi: hi.ayahs[i]?.text })),
    }
  },
}

// ─── Bible (bible-api.com, KJV — public domain) ───────────────
const BIBLE_BOOKS: [string, string, number][] = [
  ['GEN', 'Genesis', 50], ['EXO', 'Exodus', 40], ['LEV', 'Leviticus', 27], ['NUM', 'Numbers', 36], ['DEU', 'Deuteronomy', 34],
  ['JOS', 'Joshua', 24], ['JDG', 'Judges', 21], ['RUT', 'Ruth', 4], ['1SA', '1 Samuel', 31], ['2SA', '2 Samuel', 24],
  ['1KI', '1 Kings', 22], ['2KI', '2 Kings', 25], ['1CH', '1 Chronicles', 29], ['2CH', '2 Chronicles', 36], ['EZR', 'Ezra', 10],
  ['NEH', 'Nehemiah', 13], ['EST', 'Esther', 10], ['JOB', 'Job', 42], ['PSA', 'Psalms', 150], ['PRO', 'Proverbs', 31],
  ['ECC', 'Ecclesiastes', 12], ['SNG', 'Song of Solomon', 8], ['ISA', 'Isaiah', 66], ['JER', 'Jeremiah', 52], ['LAM', 'Lamentations', 5],
  ['EZK', 'Ezekiel', 48], ['DAN', 'Daniel', 12], ['HOS', 'Hosea', 14], ['JOL', 'Joel', 3], ['AMO', 'Amos', 9],
  ['OBA', 'Obadiah', 1], ['JON', 'Jonah', 4], ['MIC', 'Micah', 7], ['NAM', 'Nahum', 3], ['HAB', 'Habakkuk', 3],
  ['ZEP', 'Zephaniah', 3], ['HAG', 'Haggai', 2], ['ZEC', 'Zechariah', 14], ['MAL', 'Malachi', 4], ['MAT', 'Matthew', 28],
  ['MRK', 'Mark', 16], ['LUK', 'Luke', 24], ['JHN', 'John', 21], ['ACT', 'Acts', 28], ['ROM', 'Romans', 16],
  ['1CO', '1 Corinthians', 16], ['2CO', '2 Corinthians', 13], ['GAL', 'Galatians', 6], ['EPH', 'Ephesians', 6], ['PHP', 'Philippians', 4],
  ['COL', 'Colossians', 4], ['1TH', '1 Thessalonians', 5], ['2TH', '2 Thessalonians', 3], ['1TI', '1 Timothy', 6], ['2TI', '2 Timothy', 4],
  ['TIT', 'Titus', 3], ['PHM', 'Philemon', 1], ['HEB', 'Hebrews', 13], ['JAS', 'James', 5], ['1PE', '1 Peter', 5],
  ['2PE', '2 Peter', 3], ['1JN', '1 John', 5], ['2JN', '2 John', 1], ['3JN', '3 John', 1], ['JUD', 'Jude', 1], ['REV', 'Revelation', 22],
]

const bible: Scripture = {
  id: 'bible',
  name: 'The Holy Bible',
  tradition: 'Christian & Jewish',
  emoji: '✝️',
  accent: 'violet',
  total: 31102,
  unit: 'verses',
  langs: 'English (King James Version)',
  blurb: 'All 66 books — the Torah, Psalms, Proverbs, the Gospels and more, in the classic King James Version.',
  credit: { text: 'bible-api.com. King James Version (public domain).', href: 'https://bible-api.com' },
  hasHindi: false,
  toc: async () => BIBLE_BOOKS.map(([id, name, chapters]) => ({ label: name, items: Array.from({ length: chapters }, (_, i) => ({ key: `${id}/${i + 1}`, label: `${name} ${i + 1}` })) })),
  load: async (key) => {
    const [id, ch] = key.split('/')
    const book = BIBLE_BOOKS.find((b) => b[0] === id)?.[1] ?? id
    const data = await getJson<{ verses: { verse: number; text: string }[] }>(`https://bible-api.com/data/kjv/${id}/${ch}`)
    return { title: `${book} ${ch}`, verses: data.verses.map((v) => ({ n: v.verse, label: `${book} ${ch}:${v.verse}`, cite: `${book} ${ch}:${v.verse}`, en: v.text.replace(/\s+/g, ' ').trim() })) }
  },
}

// ─── Dhammapada (SuttaCentral, Bhikkhu Sujato — CC0) ──────────
const DHP: [string, string][] = [
  ['dhp1-20', 'Pairs'], ['dhp21-32', 'Diligence'], ['dhp33-43', 'The Mind'], ['dhp44-59', 'Flowers'], ['dhp60-75', 'Fools'],
  ['dhp76-89', 'The Astute'], ['dhp90-99', 'The Perfected Ones'], ['dhp100-115', 'The Thousands'], ['dhp116-128', 'Wickedness'],
  ['dhp129-145', 'The Rod'], ['dhp146-156', 'Old Age'], ['dhp157-166', 'The Self'], ['dhp167-178', 'The World'], ['dhp179-196', 'The Buddhas'],
  ['dhp197-208', 'Happiness'], ['dhp209-220', 'The Beloved'], ['dhp221-234', 'Anger'], ['dhp235-255', 'Stains'], ['dhp256-272', 'The Just'],
  ['dhp273-289', 'The Path'], ['dhp290-305', 'Miscellaneous'], ['dhp306-319', 'Hell'], ['dhp320-333', 'Elephants'], ['dhp334-359', 'Craving'],
  ['dhp360-382', 'Mendicants'], ['dhp383-423', 'Brahmins'],
]

const dhammapada: Scripture = {
  id: 'dhammapada',
  name: 'Dhammapada',
  tradition: 'Buddhist',
  emoji: '☸️',
  accent: 'pink',
  total: 423,
  unit: 'verses',
  langs: 'Pali · English',
  blurb: 'The Buddha’s sayings in 423 short verses — on the mind, anger, happiness and freedom.',
  credit: { text: 'SuttaCentral. Translation: Bhikkhu Sujato (CC0).', href: 'https://suttacentral.net/dhp' },
  hasHindi: false,
  toc: async () => [{ label: 'Chapters', items: DHP.map(([uid, name], i) => ({ key: uid, label: `${i + 1}. ${name} (${uid.slice(3)})` })) }],
  load: async (key) => {
    const data = await getJson<{ keys_order: string[]; root_text: Record<string, string>; translation_text: Record<string, string> }>(`https://suttacentral.net/api/bilarasuttas/${key}/sujato?lang=en`)
    const byVerse = new Map<number, string[]>()
    for (const seg of data.keys_order) {
      const m = /^dhp(\d+):(\d+)/.exec(seg)
      if (!m || m[2] === '0') continue
      byVerse.set(Number(m[1]), [...(byVerse.get(Number(m[1])) ?? []), seg])
    }
    const name = DHP.find(([uid]) => uid === key)?.[1] ?? ''
    return {
      title: `${DHP.findIndex(([uid]) => uid === key) + 1}. ${name}`,
      verses: [...byVerse.entries()].map(([n, segs]) => ({
        n,
        label: `Dhp ${n}`,
        cite: `Dhammapada ${n}`,
        original: segs.map((s) => data.root_text[s]?.trim()).filter(Boolean).join('\n'),
        lang: 'pi',
        en: segs.map((s) => data.translation_text[s]?.trim()).filter(Boolean).join(' '),
      })),
    }
  },
}

export const scriptures: Scripture[] = [gita, ramayana, sggs, quran, bible, dhammapada]
export const scriptureById = (id: string) => scriptures.find((s) => s.id === id)
export const totalVerses = scriptures.reduce((sum, s) => sum + s.total, 0)

/** Pick a random section key for a scripture. */
export async function randomKey(s: Scripture) {
  const groups = await s.toc()
  // Weight by group size so big books (Psalms, Yuddha Kanda) come up proportionally.
  const all = groups.flatMap((g) => g.items)
  return all[Math.floor(Math.random() * all.length)].key
}

export function formatIndian(n: number) {
  return n.toLocaleString('en-IN')
}
