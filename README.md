# perfucktionist ✶

> Perfection is a scam.

A Gen Z toolkit for living, not polishing.

## How the app flows

Four tabs, nothing else: **Home · Explore · Library · Me**. Full flowchart: [docs/FLOW.md](docs/FLOW.md).

1. **Landing** → hero, real numbers (60 tools · 1,22,156 verses · 6 scriptures · ₹0), a no-account demo (pick a mood → box breathing, a line of wisdom or a tiny dare), tap-to-hatch pet egg, how it works, what's inside, "made for everyone", promises, FAQ. Panic SOS, safe-walk and Shield work without an account.
2. **Sign up / log in** → then a short onboarding: name → gender (optional, 9 options incl. self-describe) → faith (optional, 15 options incl. atheist, agnostic, spiritual, every faith) → up to 3 goals → pick and name a pet → day 1.
3. **Home** (`#/`) → "▶ start my 5 minutes" (mood → one small thing → one line of wisdom → done 🔥), your pet and how close it is to hatching/growing, a "for you first" spotlight, your plan, tools for you, Listen, Read, today's wisdom from your faith, SOS.
4. **Explore** (`#/explore`) → search, "I'm feeling…" chips, quick picks (yours first), 10 areas.
5. **Library** (`#/library`) → six shelves: **School** (every NCERT textbook, class 1–12), **College** (open textbooks + free university courses), **Exams** (28 competitive exams + 360 practice questions), **Scripture** (your faith's book opens first), **Free books** (millions, free to read) and **Audiobooks** (free, read aloud). Save anything to **your shelf**.
6. **Me** (`#/me`) → your pet (type, name, outfits), streak, badges, insights, settings (account, theme, gender, faith, goals).
7. **Listen** (`#/listen`) → *quotes + music* (a mix from your own tradition when you've set one) and **music reels** (`#/listen/reels`): a feed that plays itself — swipe right to save, left to skip, tap to pause. Tapping the mini player anywhere opens **Now Playing**: big art (swipe to change), a seek bar, up next, credits, and lyrics.

**Gender and faith only change order and defaults — nothing is hidden from anyone.** Gender picks the spotlight and the first quick tools (`priorities()` in `src/data/profile.ts`); faith picks which quotes, Listen mix and scripture come first (`linesFor()`, `FAITHS`). Atheist and agnostic get philosophy (Stoic, Taoist, Confucian) instead of scripture on Home. Both are stored on the device only; if you ever sync them to accounts, treat them as sensitive (religion is special-category data under GDPR): keep them optional and ask for explicit consent.

### The library

| Shelf | What's in it | Where it comes from |
| --- | --- | --- |
| School `#/library/school` | All **1,141** NCERT textbooks, class 1–12, in every language NCERT publishes (English, Hindi, Urdu, Sanskrit and 19 more). Tap a book for its chapter list | generated from NCERT's own textbook page — `src/data/school.ts` |
| College `#/library/college` | 8 streams of openly licensed textbooks + free courses | OpenStax, LibreTexts, Open Textbook Library, MIT OpenCourseWare, NPTEL, SWAYAM — `src/data/college.ts` |
| Exams `#/library/exams` | 28 exams across 12 groups, each with its official site and free official prep, plus practice in the subjects it tests | `src/data/exams.ts` |
| Scripture `#/library/faith` | 1,22,156 verses from 6 scriptures, quotes by theme and tradition, shlokas | `src/lib/scripture.ts`, `src/data/wisdom.ts` |
| Free books `#/library/read` | search millions of free-to-read books; read scans inside the app | Open Library (Internet Archive) + Project Gutenberg |
| Audiobooks `#/library/listen` | free public-domain audiobooks with chapters and 0.75×–2× speed | LibriVox, hosted by the Internet Archive |

**Practice** (`src/data/questions/`) is 360 original multiple-choice questions across 12 subjects — quant, reasoning, English, computer, physics, chemistry, biology, general science, polity, history, geography and economy. Every answer was worked out twice, independently; the general-studies set sticks to settled facts and names no current office-holder, figure or scheme. Ten per round, with the reasoning shown after every answer. Scores stay on the device.

### Links open inside the app

Nothing opens in a surprise new tab. Every external link goes through `src/components/WebView.tsx`, a full-screen in-app viewer: the site loads in an iframe, the phone's back gesture closes it, and the hash route never changes.

Some sites refuse to be embedded — they send `X-Frame-Options` or a `frame-ancestors` policy, which is their security setting and not something to work around. `NO_FRAME` in that file lists the ones checked (with a GET carrying iframe fetch headers, 2026-10-03): NCERT, UPSC, SWAYAM, the NTA exam portals, the banks, the defence boards, College Board, ETS, IELTS, DIKSHA, LibreTexts, NDLI and the music stores. For those the viewer shows a card that says plainly why, and leaving is the user's own tap.

**NCERT in particular** can't be framed, so the School shelf keeps the browsing in the app: pick class → language → book → chapter list, all local, and only the chapter PDF itself opens in the phone's PDF reader. The chapter URLs are derived from NCERT's own codes (`jemh1=0-14` → `jemh101.pdf` … `jemh114.pdf`), verified against their server.

**Back button:** every screen that isn't one of the four tabs shows one in the top bar (`BackButton` in `src/components/Nav.tsx`). It uses real history when there is any, else walks one level up the hash route.

**On exam facts:** `src/data/exams.ts` deliberately carries no question counts, marks, dates or eligibility rules. Those change with every notification and a stale number could cost a student a year — so each exam links to its official site, and the UI says so plainly. Only the stable things (what the exam is for, the rounds, roughly when) are stored here. Every URL in the library data files returned HTTP 200 when they were written.

**Your pet** starts as an egg, hatches at 60 XP (a day or two of showing up) and grows through 10 levels. It's happy when you've shown up today and just sleepy when you haven't — it never dies or runs away. 12 animals; outfits (bow and cap free, 5 more with Plus).

**Lyrics:** song lyrics are licensed separately from audio, and we don't have a lyrics licence. Instrumental tracks show a visualizer; songs with words link to Apple Music, Spotify and YouTube, which show licensed synced lyrics. Real in-app lyrics need a licensed provider (for example Musixmatch's commercial API or LyricFind), not a scraped database.

Icons come from [Lucide](https://lucide.dev) (ISC licence) via `src/components/Icon.tsx`; the pet and casual copy keep emojis.

Original intro: Eleven zones, a 1.2-lakh-verse library of every major faith, and a glow-up layer people can pay for.

| Zone | What's in it |
| --- | --- |
| 🫠 **Unlearn Perfect** `#/unperfect` | Perfection-o-meter quiz, 8 rules, inner-critic flip cards, imperfection dares |
| 🛡️ **Shield** `#/shield` | India helplines (tap to call), **fake call**, **panic siren**, **send-my-location**, 7 self-defence moves, street & online safety, legal rights after an assault |
| 🔱 **Bro Code** `#/bro` | Consent, mental health, respect, a daily checklist that resets at midnight, warrior shlokas |
| 📚 **Library** `#/library` | **1,22,156 verses** from 6 complete scriptures (table below) in the original script + English (+ Hindi for Gita, Quran, Gurbani), Gita audio recitations, "surprise me" across all faiths, the Golden Rule in 11 traditions, 60+ hand-picked cross-faith quotes, and the Sanskrit shloka stack. Deep links: `#/library/gita/2`, `#/library/bible/JHN/3` |
| 🫁 **Breathe** `#/breathe` | Animated breathing orb (box, physiological sigh, 4-7-8, Anulom Vilom, Bhramari, power hold), meditation timer with bells |
| 🎧 **Music search** `#/music` | Search any song on earth (Apple's catalogue, 30s previews; full songs for Lofi from Audius), 16 genre/mood chips, 18 Spotify playlists, Lofi Girl 24/7 radio. Music reels live in Listen (`#/listen/reels`). A mini player follows you across the site and opens Now Playing |
| 🫧 **Happy Zone** `#/happy` | Dopamine button, bubble wrap, stress yeeter, gratitude jar, instant dance break |
| 🦁 **Be Brave** `#/brave` | 5-second launch countdown, brave dares, goal smasher, the 5 D's of bystander intervention, desi legends |
| 🏠 **No Secrets Club** `#/fam` | What to always tell your parents, copy-paste conversation starters, a tab for parents, help if home isn't safe |
| 🙏 **Real Faith** `#/faith` | Baba-meter red-flag quiz, common religious scams, real vs fake guru, Kabir's dohas |
| 🌳 **Save Trees** `#/green` | Grow a virtual forest, why trees matter, Bishnoi & Chipko history, a 10-habit green pledge |

Every zone also has an **"every faith agrees"** row — the same idea (courage, parents, respecting women, protecting the earth, no religious middlemen…) from Hindu, Sikh, Muslim, Christian, Jewish, Buddhist, Jain, Taoist, Confucian, Stoic, Zoroastrian and Baháʼí sources.

## Toolkit — 60 tools (`#/tools`)

An app-style hub: search, "what do you need?" chips (anxious, low, can't focus, exams, can't sleep, broke, heartbroken, unsafe, stuck, bored), a dock of pinned + recent tools, and a phone tab bar. Every tool is one focused screen, mostly step-by-step, and hands off to the next useful tool ("up next"). Deep links: `#/tools/focus`, `#/tools/for/anxious`.

| | Tools |
| --- | --- |
| 🧠 Mind | daily check-in · mood insights ✦ · panic SOS · safety plan · thought flipper (CBT) · worry box · journal (prompt packs, PIN) · one line a day · hype file · bad-day kit · affirmations · urge surfer |
| 🎯 Focus | focus timer · focus stats ✦ · ambient sound mixer · brain dump → priority sort · done list · 5-minute starter · countdowns · flashcards (spaced repetition) · study timetable ✦ · 20-20-20 eyes · phone-down mode |
| 💪 Body | 7-minute workout · desk stretches · water · sleep-cycle calculator · wind-down + sleep log · cycle tracker · caffeine cutoff |
| 💸 Money | expense tracker · 50/30/20 · split the bill (UPI links) · subscriptions · savings goal · SIP calculator · CTC → in-hand · "is it worth it?" · EMI & credit-card truth · scam detector |
| 🛡️ Safety | safe-walk timer · emergency lock-screen card · password breach check · privacy checkup · relationship check |
| 💗 People | boundary scripts · breakup recovery · friend check-ins · kindness dares · conversation starters |
| 🌱 Grow | habit tracker · quit tracker · time capsule · bucket list · wallpaper maker · dopamine menu · career compass (RIASEC) · interview prep (STAR) · decision maker · speaking coach ✦ |

✦ = Plus. Free limits elsewhere: 3 habits, 1 flashcard deck, 2 layered sounds, 2 journal packs. Code lives in `src/tools/` (one file per category, each lazy-loaded); metadata in `src/tools/registry.ts`.

Notes: the password check sends only the first 5 characters of the SHA-1 hash to Have I Been Pwned (k-anonymity). CTC → in-hand uses FY 2025-26 new-regime slabs — update `newRegimeTax()` when budgets change. Timers/alarms (safe-walk, 20-20-20) only run while the page is open.

## Glow-up mode & perfucktionist+

| | Free | Plus (₹49/mo · ₹399/yr) |
| --- | --- | --- |
| `#/me` daily ritual (breathe · read · dare · gratitude — any one keeps the streak), XP, 10 levels, 13 badges, 16-week heatmap, a pet that hatches and grows | ✓ | ✓ |
| `#/tools` 60-tool toolkit | 56 tools | all 60 |
| `#/journeys` 5 guided programs (21 days unperfect, 7 days calm, 14 days brave, 18 days of the Gita, every faith in 12 days), one step unlocks per day | first 3 days each | all days |
| Streak freezes | — | 2 a month, automatic |
| Story cards (1080×1920 PNG for IG/WhatsApp/Snap) from any verse, streak or month | 2 styles + watermark | 5 styles, no watermark |
| Monthly Wrapped | — | ✓ |
| Pet outfits | bow, cap | + shades, crown, top hat, flower, headphones |

Safety tools and scripture are **never** paywalled — the Plus page says so.

**Payments are not wired up yet.** `src/lib/plus.ts` → `startTrial()` currently unlocks Plus on the device for 7 days. Replace it with a real checkout (Razorpay / Stripe) plus a server-side entitlement check before launch. The Plus page also promises *"every yearly member = one real tree planted"* — only ship that line once a planting partner is in place.

## Accounts (login & signup)

Everyone signs up or logs in before reaching Home. Panic SOS, the safe-walk timer and the Shield page stay open without an account.

- **Preview mode (default, no setup):** accounts live on the device; passwords are stored as PBKDF2 hashes. Nothing syncs between devices, and password reset isn't available.
- **Cloud mode:** create a [Supabase](https://supabase.com) project, then add to `.env.local` (and your host's env vars):
  ```
  VITE_SUPABASE_URL=https://<project>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon public key>
  ```
  In Supabase → Authentication: turn on Email (and Google if you want the button), and add your site URL to the allowed redirect URLs. Users then get real accounts, email confirmation, Google sign-in and password reset. The Supabase library only downloads in this mode.
- Streaks, journal and other progress are still stored on the device in both modes; syncing them to the account is the next step.
- Before launch you need a **privacy policy and terms** (signup collects emails; YouTube's developer policy also requires one for the embedded players), and a proper **parental-consent** flow for under-18s under India's DPDP Act — the signup checkbox is a placeholder.

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
