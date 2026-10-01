# perfucktionist ✶

> Perfection is a scam.

A Gen Z toolkit for living, not polishing. Eleven zones, a 1.2-lakh-verse library of every major faith, and a glow-up layer people can pay for.

| Zone | What's in it |
| --- | --- |
| 🫠 **Unlearn Perfect** `#/unperfect` | Perfection-o-meter quiz, 8 rules, inner-critic flip cards, imperfection dares |
| 🛡️ **Shield** `#/shield` | India helplines (tap to call), **fake call**, **panic siren**, **send-my-location**, 7 self-defence moves, street & online safety, legal rights after an assault |
| 🔱 **Bro Code** `#/bro` | Consent, mental health, respect, a daily checklist that resets at midnight, warrior shlokas |
| 📚 **Sacred Library** `#/library` | **1,22,156 verses** from 6 complete scriptures (table below) in the original script + English (+ Hindi for Gita, Quran, Gurbani), Gita audio recitations, "surprise me" across all faiths, the Golden Rule in 11 traditions, 60+ hand-picked cross-faith quotes, and the Sanskrit shloka stack. Deep links: `#/library/gita/2`, `#/library/bible/JHN/3` |
| 🫁 **Breathe** `#/breathe` | Animated breathing orb (box, physiological sigh, 4-7-8, Anulom Vilom, Bhramari, power hold), meditation timer with bells |
| 🎧 **Vibe Room** `#/music` | Search any song on earth (Apple's catalogue, 30s previews), 16 genre/mood chips, 18 Spotify playlists, Lofi Girl 24/7 radio. A mini player follows you across the site |
| 🫧 **Happy Zone** `#/happy` | Dopamine button, bubble wrap, stress yeeter, gratitude jar, instant dance break |
| 🦁 **Be Brave** `#/brave` | 5-second launch countdown, brave dares, goal smasher, the 5 D's of bystander intervention, desi legends |
| 🏠 **No Secrets Club** `#/fam` | What to always tell your parents, copy-paste conversation starters, a tab for parents, help if home isn't safe |
| 🙏 **Real Faith** `#/faith` | Baba-meter red-flag quiz, common religious scams, real vs fake guru, Kabir's dohas |
| 🌳 **Save Trees** `#/green` | Grow a virtual forest, why trees matter, Bishnoi & Chipko history, a 10-habit green pledge |

Every zone also has an **"every faith agrees"** row — the same idea (courage, parents, respecting women, protecting the earth, no religious middlemen…) from Hindu, Sikh, Muslim, Christian, Jewish, Buddhist, Jain, Taoist, Confucian, Stoic, Zoroastrian and Baháʼí sources.

## Glow-up mode & perfucktionist+

| | Free | Plus (₹49/mo · ₹399/yr) |
| --- | --- | --- |
| `#/me` daily ritual (breathe · read · dare · gratitude — any one keeps the streak), XP, 10 levels, 13 badges, 16-week heatmap, a companion tree that grows | ✓ | ✓ |
| `#/journeys` 5 guided programs (21 days unperfect, 7 days calm, 14 days brave, 18 days of the Gita, every faith in 12 days), one step unlocks per day | first 3 days each | all days |
| Streak freezes | — | 2 a month, automatic |
| Story cards (1080×1920 PNG for IG/WhatsApp/Snap) from any verse, streak or month | 2 styles + watermark | 5 styles, no watermark |
| Monthly Wrapped | — | ✓ |
| Companion skins | classic | 8 |

Safety tools and scripture are **never** paywalled — the Plus page says so.

**Payments are not wired up yet.** `src/lib/plus.ts` → `startTrial()` currently unlocks Plus on the device for 7 days. Replace it with a real checkout (Razorpay / Stripe) plus a server-side entitlement check before launch. The Plus page also promises *"every yearly member = one real tree planted"* — only ship that line once a planting partner is in place.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173 (first run downloads the scripture data, ~30 MB → 15 MB of JSON)
npm run build     # builds the library if missing, type-checks, builds to dist/
npm run preview   # serve the production build
npm run library   # force a fresh download of the Gita + Ramayana data
```

## How it's built

- **React 19 + TypeScript + Vite**, no UI library, no backend. Plain CSS with design tokens (`src/styles/base.css`), dark + light themes.
- **Hash routing** (`#/music`) so `dist/` can be dropped on any static host — Netlify, Vercel, GitHub Pages, S3 — with no rewrite rules. `base: './'` makes it work from a sub-path too.
- **All sounds are synthesised** with WebAudio (`src/lib/sound.ts`) — siren, ringtone, bells, bubble pops. No audio files.
- **Scripture library**: Gita and Ramayana are self-hosted — `scripts/build-library.mjs` downloads them (pinned to a commit) and splits them into one small JSON file per chapter in `public/library/` (git-ignored, rebuilt on `predev`/`prebuild`). The other four are read live from free, CORS-enabled APIs. See `src/lib/scripture.ts`.
- **Progress** (streaks, XP, badges, journeys) is a tiny store in `src/lib/progress.ts`; features call `log('breath' | 'verse' | 'dare' | …)`.
- **Music search** uses the public iTunes Search API (no key, CORS-enabled). Full songs are linked out to YouTube / Spotify / JioSaavn.
- **Nothing leaves the device.** Quiz answers aren't stored; gratitude notes, pledges, goals, streaks and Plus status live in `localStorage` only (prefixed `pf:`). There are no accounts yet, so progress doesn't sync between devices.

```
src/
  App.tsx              routes + global player
  context/Player.tsx   audio queue shared across pages
  components/          Nav, Footer, MiniPlayer, ScriptureReader, Voices, Overlays (toasts, share cards, Plus walls), …
  data/                zones, shlokas, wisdom (cross-faith), journeys, helplines   ← edit content here
  lib/                 router, storage, sound, confetti, music, scripture, progress, plus, shareCard
  pages/               one file per zone
  styles/              base (tokens), components, pages
```

## Scripture sources & licences

| Scripture | Verses | Source | Licence / translation |
| --- | --- | --- | --- |
| Bhagavad Gita | 701 | [gita/gita](https://github.com/gita/gita) (self-hosted) + verse recitations via jsDelivr | Unlicense · Swami Sivananda (EN), Swami Tejomayananda (HI) |
| Valmiki Ramayana | 23,291 | [Valmiki_Ramayan_Dataset](https://github.com/Ashutosh-Vijay/Valmiki_Ramayan_Dataset) (self-hosted) | MIT · from IIT Kanpur's Valmiki Ramayana project & M.N. Dutt |
| Sri Guru Granth Sahib | 60,403 lines | [BaniDB API](https://www.banidb.com) | Khalis Foundation |
| Quran | 6,236 | [AlQuran Cloud API](https://alquran.cloud) | Saheeh International (EN), Suhel Farooq Khan & Saifur Rahman Nadwi (HI) |
| Bible | 31,102 | [bible-api.com](https://bible-api.com) | King James Version (public domain) |
| Dhammapada | 423 | [SuttaCentral API](https://suttacentral.net) | Bhikkhu Sujato (CC0) |

## Content notes

- Helplines are for **India** (`src/data/helplines.ts`). Swap them if you deploy for another country.
- Self-defence and legal-rights content is general awareness, not legal or medical advice — the footer says so on every page.
