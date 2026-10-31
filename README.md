# perfectish ✶

> Perfection is a scam. So are these.

Stop losing money, and get it back. For India, ages 14 to 30.

**About the name.** This app was called perfucktionist. The public name is now perfectish, because the old word got in the way of search, ads and network filters. A few technical names keep the old word on purpose: the Android app ID and deep link (`in.perfucktionist.app`, changing it would make a separate app and installed copies would stop updating), the Doppler project, the Supabase `project_id`, the Vercel host, and a redirect from the old APK address for apps that already have it built in.

## The product

Three things, one loop: spot the scam, get your money back, find the leaks. Full flowchart: [docs/FLOW.md](docs/FLOW.md).

No sign-up for anything free, no bank login, no SMS access, and nothing a person pastes or opens leaves the phone. An account is only needed to buy the pass.

| | What it does | Price | Code |
| --- | --- | --- | --- |
| **Scam Check** `#/scam` | Paste a message, offer or link. It looks for the patterns scams use and explains each one. Works in English, Hinglish and some Hindi. | Free, always | `src/lib/scam.ts` |
| **Get It Back** `#/back` | Pick what happened. Get the rule in plain words with its source, dated steps, money owed for delays, and a letter ready to send. Saves your dates on the phone. | Free, always | `src/data/claims.ts` |
| **Leak Check** `#/leak` | Open a PDF statement from PhonePe, Google Pay, Paytm or a bank. It finds subscriptions, monthly repeats, bank fees and double payments. | Total and top 3 free. Everything else with the pass | `src/lib/leak.ts`, `src/lib/pdfText.ts` |

**The pass:** ₹49 for 31 days or ₹399 for a year, paid once by UPI (`#/plus`). There's one paywall, on purpose: nobody should hit one while trying to recover their own money.

**Rules for changing these features:**

- **Scam Check can never say something is safe.** The calmest verdict is "no known scam signs", with a warning that this doesn't prove anything.
- **Every rule in `src/data/claims.ts` needs a source, and people act on those dates.** Check them before each release (`CHECKED` in that file). Don't copy from blogs: when this was built, several still gave the Ombudsman's old one-year limit, but the 2026 scheme says 90 days. RBI rules were read on RBI's own pages. The e-commerce and coaching rules came from summaries, because the official PDFs couldn't be opened, so re-check those against the originals.
- **No statement or message is stored.** A Leak Check report lives in memory only, and it's gone when the app closes.
- **Leak Check's parser reads patterns, not one fixed layout.** It was tested on generated statements shaped like the real ones. Test it on real statements before relying on it.

**Still in the repo but out of the app:** the old Library, scripture reader, music, Listen, Read, journeys, pet and the zones (Unperfect, Brave, Bro, Fam, Faith, Green, Breathe). Nothing links to them, and they aren't in the bundle. The 44 tools, Today, Discover and Kanak were deleted; they're in git history at `c158d20`. Shield stays, because people in danger need it, along with the helplines in the footer and the 112 button. Old panic and safe-walk links land on Shield.

## Accounts, sync & secrets

Everything is open without an account. You only need one to buy the pass (`#/login`).

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
   - *Sign In / Providers*: Email on with "Confirm email" **off** (people are in straight after sign-up; `npm run auth:no-confirm` switches it off for you), and minimum password length 8 (the app asks for 8). Google is optional and only shows on the website: Google blocks sign-in inside app web views.
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

### Plus payments (UPI) and the database check

Plus is paid by UPI to `techievinayak.wallet@phonepe` (QR in `public/pay/phonepe-qr.png`; the ID and plan prices are in `src/lib/payments.ts` and `src/lib/plus.ts`). There is no payment provider, so you confirm each payment yourself:

1. Someone pays, then pastes the 12-digit UPI reference from their receipt on **Plus**. It's saved in `public.payments` as `pending` (the database checks the amount against the plan and refuses a reused reference).
2. `npm run pay` lists what's waiting. Find the same reference and amount in your PhonePe history, then `npm run pay -- verify <reference>` (or `reject`). Verifying writes `public.memberships`, and the app unlocks Plus the next time they open it. 31 days for monthly, 366 for yearly, added on top of any time left.
3. People can add and read their own payments only. They can't verify one or edit `memberships`, so nobody can unlock Plus themselves. `npm run db:test` proves it.

The free trial (7 days) is separate: one per device, no payment, kept on the phone.

**Is Supabase connected and are entries arriving?** `npm run db:check` (Doppler `prd`) prints, without showing anyone's data: whether the project answers with the public key; whether `user_state`, `payments` and `memberships` exist and are closed to logged-out visitors; how many accounts there are and whether they confirmed their email; how many have synced progress, with the last write per key; payments by status and active Plus members. Add `-- --local` for the local stack. The two new tables arrive with `npm run db:push`, which applies `supabase/migrations/20261008000000_plus_payments.sql`.

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
4. publishes it at `public/app/perfectish.apk` with `public/app/apk.json` (version, build number, size, SHA-256, notes), which the Get page and the in-app update check read.

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

**Committing the APK:** `public/app/perfectish.apk` (~8 MB) isn't gitignored, so a static host deployed from git can serve it. Every release you commit adds about 8 MB to git history. If that becomes a problem, upload it to a GitHub Release instead and change `APK_URL` in `src/lib/install.ts`.

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

- **React 19 + TypeScript + Vite**, no UI library, no backend beyond Supabase for accounts and payments. Plain CSS with design tokens (`src/styles/base.css`), dark + light themes.
- **Hash routing** (`#/scam`) so `dist/` can be dropped on any static host — Netlify, Vercel, GitHub Pages, S3 — with no rewrite rules. `base: './'` makes it work from a sub-path too.
- **All sounds are synthesised** with WebAudio (`src/lib/sound.ts`) — siren, ringtone, bells, bubble pops. No audio files.
- **Scripture library**: Gita and Ramayana are self-hosted — `scripts/build-library.mjs` downloads them (pinned to a commit) and splits them into one small JSON file per chapter in `public/library/` (git-ignored, rebuilt on `predev`/`prebuild`). The other four are read live from free, CORS-enabled APIs. See `src/lib/scripture.ts`.
- **Progress** (streaks, XP, badges, journeys) is a tiny store in `src/lib/progress.ts`; features call `log('breath' | 'verse' | 'dare' | …)`.
- **Music search** uses the public iTunes Search API (no key, CORS-enabled). Full songs are linked out to YouTube / Spotify / JioSaavn.
- **Private things never leave the device.** Quiz answers aren't stored; journal, cycle tracker, money, gratitude notes, pledges, goals and Plus status live in `localStorage` only (prefixed `pf:`). With cloud accounts on, only streak/XP/badges, saved books, liked songs, practice scores and a few preferences sync (see *Accounts, sync & secrets*).

```
src/
  App.tsx              routes
  components/          Nav, Footer, TabBar, WebView, Overlays (toasts), …
  data/claims.ts       the rules, steps and letters for Get It Back   ← people act on this, keep it right
  lib/                 scam, leak, pdfText, saved, plus, payments, auth, sync, router, storage
  pages/               Home, ScamCheck, GetItBack, LeakCheck, Plus, Me, Auth, Shield, Get
  styles/              base (tokens), components, core (the product)
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
