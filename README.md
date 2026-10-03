# perfucktionist ✶

> Perfection is a scam.

A Gen Z toolkit for living, not polishing.

## How the app flows

Four tabs, nothing else: **Home · Explore · Library · Me**. Full flowchart: [docs/FLOW.md](docs/FLOW.md).

**Where the app runs:** on **Android** the app *is* the APK. Android visitors on the website get only the landing page, with **download the app** buttons, plus the safety pages (Panic SOS, safe-walk, Shield) and `#/get`. Every other link shows the landing page (`appOnly()` in `src/lib/install.ts`). **iPhone and computers** can't install an APK, so they keep the full web app (sign up in the browser, or Add to Home Screen). Email links still work on Android: password resets open in the browser and are completed there.

1. **Landing** → hero, real numbers (60 tools · 1,22,156 verses · 6 scriptures · ₹0), a no-account demo (pick a mood → box breathing, a line of wisdom or a tiny dare), tap-to-hatch pet egg, how it works, what's inside, "made for everyone", promises, FAQ. Panic SOS, safe-walk and Shield work without an account.
2. **Sign up / log in** → then a short onboarding: name → gender (optional, 9 options incl. self-describe) → faith (optional, 15 options incl. atheist, agnostic, spiritual, every faith) → up to 3 goals → pick and name a pet → day 1.
3. **Home** (`#/`) → "▶ start my 5 minutes" (mood → one small thing → one line of wisdom → done 🔥), your pet and how close it is to hatching/growing, a "for you first" spotlight, your plan, tools for you, Listen, Read, today's wisdom from your faith, SOS.
4. **Explore** (`#/explore`) → search, "I'm feeling…" chips, quick picks (yours first), 10 areas.
5. **Library** (`#/library`) → six shelves: **School** (every NCERT textbook, class 1–12), **College** (open textbooks + free university courses), **Exams** (28 competitive exams + 360 practice questions), **Scripture** (your faith's book opens first), **Free books** (millions, free to read) and **Audiobooks** (free, read aloud). Save anything to **your shelf**.
6. **Me** (`#/me`) → your pet (type, name, outfits), streak, badges, insights, settings (account, theme, gender, faith, goals).
7. **Listen** (`#/listen`) → *quotes + music* (a mix from your own tradition when you've set one) and **music reels** (`#/listen/reels`): a feed that plays itself — swipe right to save, left to skip, tap to pause. Tapping the mini player anywhere opens **Now Playing**: big art (swipe to change), a seek bar, up next, credits, and lyrics.

**Gender and faith only change order and defaults — nothing is hidden from anyone.** Gender picks the spotlight and the first quick tools (`priorities()` in `src/data/profile.ts`); faith picks which quotes, Listen mix and scripture come first (`linesFor()`, `FAITHS`). Atheist and agnostic get philosophy (Stoic, Taoist, Confucian) instead of scripture on Home. Both stay on the device even with cloud accounts: sync strips them before upload. If you ever do sync them, treat them as sensitive (religion is special-category data under GDPR): keep them optional and ask for explicit consent.

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

## Accounts, sync & secrets

Everyone signs up or logs in before reaching Home. Panic SOS, the safe-walk timer and the Shield page stay open without an account.

- **Preview mode (no keys):** accounts live on the device; passwords are stored as PBKDF2 hashes. Nothing syncs, and password reset isn't available. This is what you get without Doppler.
- **Cloud mode (Supabase):** real accounts (email + password, Google on the website, password reset) and sync between phones.

### What syncs, and what never leaves the phone

| Synced to your account | Only ever on the phone |
| --- | --- |
| streak, XP, badges, pet, journeys · saved books · liked songs · practice scores · theme, reading language, school class, pinned tools | journal, cycle tracker, money, check-ins, gratitude jar, goals, every other tool · **gender and faith** (they only reorder suggestions, so they're stripped before upload) |

The rule is enforced twice: `src/lib/sync.ts` only uploads the keys in its `SYNCED` list, and the database rejects any other key (a check constraint in `supabase/migrations/…_user_state.sql`). Row level security means each person can only read and write their own rows. **Me → delete my account** removes the login and every synced row. Anything that only lived on the phone stays there until "reset my progress" clears it.

How it syncs: one row per key in `public.user_state`. The server stamps every write, so a phone with the wrong clock can't win. If only one side changed, that side wins. If both changed (two phones offline, or the first login on a phone that was already in use), they merge: books are joined, the higher score is kept, every streak day and badge is kept. Nothing earned is lost. Logging in as a *different* person on the same phone clears the previous person's synced data from that phone (it's safe in their account) instead of merging it.

### Secrets live in Doppler

Nothing secret goes in the repo. `npm run dev` uses the Doppler config `dev`; `npm run build`, `npm run apk` and `npm run db:push` use `prd` (`scripts/with-secrets.mjs`).

**Where the build looks, first match wins:** Doppler → the host's environment variables (Vercel, Netlify…) or a gitignored `.env.local` → preview mode. `vite.config.ts` prints which names it used, never the values. Without the Doppler CLI (Vercel's build machines don't have it) the build reads the host's variables instead and doesn't fail, even if a `DOPPLER_TOKEN` is set.

| Secret | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | the site | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the site | `sb_publishable_…`. Public by design; row level security guards the data. The legacy `VITE_SUPABASE_ANON_KEY` also works |
| `VITE_SITE_URL` | the site, the APK | your public website. Email links sent from the Android app open here, because the app itself runs at `https://localhost` |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` | `npm run db:push` | never `VITE_`-prefixed, never bundled |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | `npm run apk` | the release signing key; `npm run secrets:android` uploads it |

Only `VITE_*` values reach the browser, and anyone can read them. The build refuses to run if one of them holds a Supabase secret or service-role key (`vite.config.ts`).

### One-time setup

1. **Doppler.** Log in and link this folder (`doppler.yaml` picks project `perfucktionist`, config `dev`):
   ```bash
   doppler login
   doppler projects create perfucktionist      # creates the dev, stg and prd configs
   doppler setup --no-interactive
   ```
2. **Supabase.** Create a project at [supabase.com](https://supabase.com). Under *Project Settings → API keys*, copy the URL and the publishable key into Doppler. Do this for `prd`, and for `dev` too: either the same project or a second free one.
   ```bash
   doppler secrets set --config prd VITE_SUPABASE_URL=https://<ref>.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_… VITE_SITE_URL=https://<your site>
   doppler secrets set --config prd SUPABASE_PROJECT_REF=<ref> SUPABASE_ACCESS_TOKEN=<supabase.com → Account → Access tokens> SUPABASE_DB_PASSWORD=<the database password>
   ```
3. **Create the table:** `npm run db:push` applies `supabase/migrations/` to the project.
4. **Auth settings** in the Supabase dashboard → *Authentication*:
   - *URL Configuration*: **Site URL** = your website (`https://perfucktionist.vercel.app`). **Redirect URLs**: `https://perfucktionist.vercel.app/**`, plus `http://localhost:5173/**` if `dev` uses this project. Supabase ignores any return address not on this list and falls back to the Site URL, which is `http://localhost:3000` until you change it.
   - *Sign In / Providers*: Email on with "Confirm email" on, and minimum password length 8 (the app asks for 8). Google is optional and only shows on the website: Google blocks sign-in inside app web views.
5. **Android key into Doppler:** `npm run secrets:android` copies the existing release key and passwords into `prd`. It shows names, never values. After `npm run apk` signs fine from Doppler, `android/keystore.properties` can go. Still keep an offline copy of the `.jks`.
6. **Hosting.** `VITE_*` values are baked in at build time, so the host's build needs them. For Vercel, see below. Elsewhere, set the same two variables in the host's settings, or build locally with `npm run build` and upload `dist/`.
7. **Rebuild the APK** with `npm run apk` so the app has the cloud keys. The current APK is a preview-mode build.

### Deploying on Vercel

`vercel.json` sets the build to `npm run build`, which also fetches the scripture library and type-checks; plain `vite build` would skip both. Output is `dist/`. It also sets the APK download headers.

**Environment variables.** Add these under *Project → Settings → Environment Variables* for **Production** and **Preview**:

| Name | Value | Secret? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` | No, it's public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (or the legacy anon key) | No, public by design; row level security guards the data |

That's all the website needs. Leave the rest out of Vercel:

- **`VITE_SITE_URL`** is only for the Android app, which is built on your machine. On Vercel it falls back to the project's production domain.
- **`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF`** are only for `npm run db:push` on your machine.
- **`ANDROID_*`** is only for `npm run apk` on your machine.
- **Never add the Supabase secret / `service_role` key.** The site has no server code that needs it, and the build refuses to put one in the bundle.

**Fallbacks.** You don't have to use the `VITE_` names:

- If you connect Supabase through **Vercel's Supabase integration**, it creates `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also `SUPABASE_URL`, `SUPABASE_ANON_KEY` / `SUPABASE_PUBLISHABLE_KEY`). The build picks those up on its own, so nothing needs renaming.
- The secret keys that integration also adds are ignored.
- For local work without Doppler, `vercel env pull .env.local` works too. That file is gitignored.

**Doppler → Vercel.** Doppler's Vercel integration syncs a *whole* config. If you use it, point it at a config holding only the two public values, for example a branch config `prd_web` that references `${prd.VITE_SUPABASE_URL}`. That keeps the database password and the signing key off Vercel.

**Supabase redirect URLs.** In *Authentication → URL Configuration*, set the Site URL to `https://perfucktionist.vercel.app` and add `https://perfucktionist.vercel.app/**`, plus `https://*-per-fuck-tionist.vercel.app/**` for preview deployments. Without them, email links land on `localhost:3000`.

### Email links and the Android app

Confirmation and password-reset emails always return to the website, as `?auth=signup|reset`, with `&app=1` when the app asked for them.

- **Asked for on the website:** the website finishes it. You're logged in, or reset your password.
- **Opened in a different browser:** "✓ Email confirmed. Log in".
- **Asked for in the app:** only the app can finish it, because it holds the sign-in secret (PKCE). On Android, the website shows **open the app**: an `intent://` link with the `in.perfucktionist.app` scheme, which logs you in or opens "new password" inside the app. If the app isn't installed, the link goes to the download page instead. On a computer, it says to log in on your phone.
- **Expired or used links** say so.
- **Logging in before confirming** offers to send the link again.

Google sign-in stays website-only for now, because Google blocks sign-in inside app web views.

### Local Supabase (optional, needs Docker)

```bash
npm run db:start   # Postgres + Auth + REST in Docker, with the migration applied (prints the local URL and keys)
npm run db:test    # row level security tests: supabase/tests/database/
npm run db:reset   # wipe and re-apply migrations
npm run db:stop
```

To point the app at it, put the printed `API_URL` and `PUBLISHABLE_KEY` in Doppler `dev` (or run `VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… npm run dev`). Local email confirmation is off. Free Supabase projects pause after a week without traffic.

Before launch you still need a **privacy policy and terms** (signup collects emails; YouTube's developer policy also requires one for the embedded players), and a proper **parental-consent** flow for under-18s under India's DPDP Act. The signup checkbox is a placeholder.

## Get the app (`#/get`)

One "get the app" page that detects the device and offers what actually works on it. It needs no account, and it's linked from the landing page, the footer and Me → settings. Those links hide themselves once you're already in the app.

| Device | What it gets | Why |
| --- | --- | --- |
| **Android** | The signed APK, with version, size and SHA-256 shown, plus plain steps for the "unknown developer" warning. This is the only way in on Android | An APK is the Android app format |
| **iPhone / iPad** | Safari's *Add to Home Screen*, in three steps | iOS can't install APKs at all; native iOS apps only come through the App Store |
| **Windows / Mac / Linux** | The browser's own install button (Chrome, Edge) or the menu steps | APKs are Android-only |

The browser install is a proper PWA: `public/manifest.webmanifest`, icons in `public/icons/`, and a small service worker (`public/sw.js`). The service worker caches only our own app shell, so the app opens offline. It never caches scripture, books or music, and it's skipped inside the APK.

### Building the APK

```
npm run apk
```

`scripts/build-apk.mjs` runs four steps:

1. builds the site;
2. copies it into the Capacitor Android project (`android/`);
3. builds a **signed release APK**;
4. publishes it at `public/app/perfucktionist.apk` with `public/app/apk.json` (version, build number, size, SHA-256, notes), which the Get page and the in-app update check read.

The build needs **JDK 21** (`brew install openjdk@21`) and the **Android SDK**. The only permission the app asks for is internet access.

### Updates

**Android app.** About 4 seconds after opening, and again whenever it comes back after 6+ hours, the app reads `<VITE_SITE_URL>/app/apk.json` and compares its `versionCode` with the build it was made from:

- **Newer build:** a banner says *update ready · v0.2.0*, with your notes and the size. Tapping **update** downloads the APK in the browser. The person opens it and taps *Update*; Android keeps all their data, because the same key signed both builds. **×** hides the offer for a day.
- **Below `minVersionCode`:** a full-screen *time to update*, which "later" can't dismiss. Calling 112 and the safety pages still work past it.
- Me → settings shows *app version 0.1.0 (build 2)* with a **check for updates** button.

The app can only check if it was built with `VITE_SITE_URL`, and the website must send `Access-Control-Allow-Origin` on `apk.json`, because the app runs at `https://localhost`. `vercel.json` and `public/_headers` already do.

**Website / iPhone / computers.** Every deploy stamps a new build id into `sw.js`. The new worker waits and the page shows *a fresh version is ready · refresh*. Nothing reloads while someone is mid-journal. A plain reload also picks up the new version.

**Shipping an update:**

```bash
npm version minor --no-git-tag-version          # optional: the version name people see
npm run apk -- --notes "Sync between phones"    # build number goes up by itself (versionCode 2, 3, 4…)
npm run apk -- --notes "Important fix" --force  # everyone on an older build must update
git add public/app && git commit -m "Android build N" && git push   # Vercel deploys → apps see it
```

The first published APK (build 1) predates the update check. Anyone who has it needs to download the next build once by hand; after that, updates are offered automatically.

**⚠️ The signing key — back it up.** **Every future update must be signed with the same key.** If it's lost, phones that installed this APK can't update to a new one and people have to uninstall first. The key is read from Doppler first (`ANDROID_KEYSTORE_*`, see *Accounts, sync & secrets*; the script decodes it to a private temp file and deletes it after the build), then from `android/keystore.properties`. That file points at `~/.perfucktionist/release.jks`, deliberately outside the repo, and is gitignored along with every `*.jks` and `*.keystore` file. Keep an offline copy of the `.jks` even once it's in Doppler. With neither source, the script builds a debug APK instead.

**Committing the APK:** `public/app/perfucktionist.apk` (~8 MB) isn't gitignored, so a static host deployed from git can serve it. Every release you commit adds about 8 MB to git history. If that becomes a problem, upload it to a GitHub Release instead and change `APK_URL` in `src/lib/install.ts`.

**Hosting:** `public/_headers` sets the right `Content-Type` for `.apk` downloads on Netlify and Cloudflare Pages. On other hosts, map `.apk` to `application/vnd.android.package-archive`.

**Not done yet:** Google Play (one-time $25 developer fee, then review) and the iOS App Store ($99/year Apple Developer account, plus Xcode on a Mac, which isn't installed on this machine). The Capacitor project is already set up for Play. For iOS, it's `npx cap add ios`.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173, with Doppler `dev` secrets if set up (first run downloads the scripture data, ~30 MB → 15 MB of JSON)
npm run build     # builds the library if missing, type-checks, builds to dist/
npm run preview   # serve the production build
npm run library   # force a fresh download of the Gita + Ramayana data
npm run apk       # signed Android APK → public/app/ (see "Building the APK")
npm run db:push   # apply supabase/migrations to the hosted project (Doppler prd)
```

## How it's built

- **React 19 + TypeScript + Vite**, no UI library, no backend. Plain CSS with design tokens (`src/styles/base.css`), dark + light themes.
- **Hash routing** (`#/music`) so `dist/` can be dropped on any static host — Netlify, Vercel, GitHub Pages, S3 — with no rewrite rules. `base: './'` makes it work from a sub-path too.
- **All sounds are synthesised** with WebAudio (`src/lib/sound.ts`) — siren, ringtone, bells, bubble pops. No audio files.
- **Scripture library**: Gita and Ramayana are self-hosted — `scripts/build-library.mjs` downloads them (pinned to a commit) and splits them into one small JSON file per chapter in `public/library/` (git-ignored, rebuilt on `predev`/`prebuild`). The other four are read live from free, CORS-enabled APIs. See `src/lib/scripture.ts`.
- **Progress** (streaks, XP, badges, journeys) is a tiny store in `src/lib/progress.ts`; features call `log('breath' | 'verse' | 'dare' | …)`.
- **Music search** uses the public iTunes Search API (no key, CORS-enabled). Full songs are linked out to YouTube / Spotify / JioSaavn.
- **Private things never leave the device.** Quiz answers aren't stored; journal, cycle tracker, money, gratitude notes, pledges, goals and Plus status live in `localStorage` only (prefixed `pf:`). With cloud accounts on, only streak/XP/badges, saved books, liked songs, practice scores and a few preferences sync (see *Accounts, sync & secrets*).

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
