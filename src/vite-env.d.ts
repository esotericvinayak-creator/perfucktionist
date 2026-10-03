/// <reference types="vite/client" />

// All of these come from Doppler (see README). Only VITE_* names reach the browser, so only
// public values belong here — vite.config.ts refuses to build with a secret key in one.
interface ImportMetaEnv {
  /** Supabase project URL — set it (with the publishable key) to turn on real cloud accounts. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase publishable key (sb_publishable_…). Public by design; row level security guards the data. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  /** Older projects: the legacy "anon" key works the same way. */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** The public website, e.g. https://perfucktionist.in — where email links from the Android app land. */
  readonly VITE_SITE_URL?: string
}

/** package.json version, e.g. "0.1.0". */
declare const __APP_VERSION__: string
/** The Android versionCode this bundle shipped in; 0 on the website. */
declare const __APP_BUILD__: number
/** Unique per build; the service worker carries the same id. */
declare const __BUILD_ID__: string
