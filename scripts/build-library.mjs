#!/usr/bin/env node
// Downloads the self-hosted scripture data and splits it into small per-chapter JSON files
// under public/library/, so the browser only fetches the chapter you're reading.
//
//   Bhagavad Gita   — github.com/gita/gita (Unlicense)          → public/library/gita/
//   Valmiki Ramayana — github.com/Ashutosh-Vijay/Valmiki_Ramayan_Dataset (MIT) → public/library/ramayana/
//
// The other scriptures (Guru Granth Sahib, Quran, Bible, Dhammapada) are read live from free public APIs.
// Runs automatically before `npm run dev` / `npm run build`; skips work when the data is already there.
// Pass --force to rebuild.

import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const VERSION = 2
const GITA_SHA = 'c6fce39595445768876ddbb8d1268a9c935e1d2b'
const RAMAYANA_SHA = '3c7b5d91b3e31d8cf1b561a6366f8999ef0a29ad'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'library')
const stampFile = join(out, 'manifest.json')

async function upToDate() {
  if (process.argv.includes('--force') || !existsSync(stampFile)) return false
  try {
    return JSON.parse(await readFile(stampFile, 'utf8')).version === VERSION
  } catch {
    return false
  }
}

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return await res.json()
    } catch (err) {
      if (attempt >= 3) throw new Error(`Could not download ${url}: ${err.message}`)
      await new Promise((r) => setTimeout(r, 1500 * attempt))
    }
  }
}

const write = (file, data) => writeFile(file, JSON.stringify(data))

const clean = (s) =>
  String(s ?? '')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()

async function buildGita() {
  const base = `https://cdn.jsdelivr.net/gh/gita/gita@${GITA_SHA}/data`
  const [verses, translations, chapters] = await Promise.all([getJson(`${base}/verse.json`), getJson(`${base}/translation.json`), getJson(`${base}/chapters.json`)])

  const pickTranslation = (author) => {
    const map = new Map()
    for (const t of translations) if (t.authorName === author) map.set(t.verse_id, t.description)
    return map
  }
  const en = pickTranslation('Swami Sivananda')
  const hi = pickTranslation('Swami Tejomayananda')
  // Translations often start with their own "।।2.47।।" or "2.47" label — drop it, we show our own.
  const stripLabel = (s) => clean(s).replace(/^[।|]*\s*\d+\.\d+\s*[।|]*\s*/, '')

  const dir = join(out, 'gita')
  await mkdir(dir, { recursive: true })
  const index = []
  for (const ch of chapters.sort((a, b) => a.chapter_number - b.chapter_number)) {
    const n = ch.chapter_number
    const list = verses
      .filter((v) => v.chapter_number === n)
      .sort((a, b) => a.verse_number - b.verse_number)
      .map((v) => ({
        n: v.verse_number,
        sa: clean(v.text).replace(/[।|]{2}\s*\d+\.\d+\s*[।|]{2}/g, '॥').replace(/\s*\n\s*/g, '\n'),
        r: clean(v.transliteration),
        en: stripLabel(en.get(v.id)),
        hi: stripLabel(hi.get(v.id)),
      }))
    await write(join(dir, `${n}.json`), list)
    index.push({ n, name: ch.name, translit: ch.name_transliterated, meaning: ch.name_meaning, verses: list.length, summary: clean(ch.chapter_summary).split('\n')[0] })
  }
  await write(join(dir, 'index.json'), { sha: GITA_SHA, chapters: index })
  return index.reduce((sum, c) => sum + c.verses, 0)
}

async function buildRamayana() {
  const data = await getJson(`https://raw.githubusercontent.com/Ashutosh-Vijay/Valmiki_Ramayan_Dataset/${RAMAYANA_SHA}/data/Valmiki_Ramayan_Shlokas.json`)
  const kandaOrder = ['Bala Kanda', 'Ayodhya Kanda', 'Aranya Kanda', 'Kishkindha Kanda', 'Sundara Kanda', 'Yuddha Kanda', 'Uttara Kanda']
  // "…वरम् । नारदं … ।।1.1.1।।" → one half-verse per line, verse number removed.
  const lines = (s) =>
    clean(s)
      .replace(/[।|]{2}\s*[\d.\s]*[।|]{2}\s*$/u, '')
      .replace(/[।|]{2}\s*$/u, '')
      .split(/\s*[।|]\s*/u)
      .map((x) => x.trim())
      .filter(Boolean)
      .join('\n')

  const dir = join(out, 'ramayana')
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  const kandas = []
  for (const [ki, name] of kandaOrder.entries()) {
    const rows = data.filter((x) => x.kanda === name)
    const sargas = [...new Set(rows.map((x) => x.sarga))].sort((a, b) => a - b)
    const counts = []
    for (const s of sargas) {
      const list = rows
        .filter((x) => x.sarga === s)
        .sort((a, b) => a.shloka - b.shloka)
        .map((x) => ({ n: x.shloka, sa: lines(x.shloka_text), r: lines(x.transliteration), en: clean(x.explanation) }))
      await write(join(dir, `${ki + 1}-${s}.json`), list)
      counts.push(list.length)
    }
    kandas.push({ n: ki + 1, name, sargas: counts })
  }
  await write(join(dir, 'index.json'), { sha: RAMAYANA_SHA, kandas })
  return data.length
}

if (await upToDate()) {
  console.log('📚 scripture library already built (use --force to rebuild)')
} else {
  console.log('📚 building scripture library…')
  await mkdir(out, { recursive: true })
  const [gita, ramayana] = await Promise.all([buildGita(), buildRamayana()])
  await write(stampFile, { version: VERSION, builtAt: new Date().toISOString(), counts: { gita, ramayana } })
  console.log(`📚 done — Gita: ${gita} verses, Ramayana: ${ramayana} shlokas`)
}
