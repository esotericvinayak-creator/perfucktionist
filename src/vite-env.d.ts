/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — set it (with the anon key) to turn on real cloud accounts. */
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}
