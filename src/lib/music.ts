import type { Track } from '../context/Player'
import type { Accent } from '../data/zones'

type ItunesSong = {
  trackId: number
  trackName: string
  artistName: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string
  trackViewUrl: string
}

// Apple's public search API: no key, CORS-enabled, covers basically every song on earth (with 30s previews).
export async function searchSongs(term: string, country = 'IN', limit = 30): Promise<Track[]> {
  const params = new URLSearchParams({ term, country, media: 'music', entity: 'song', limit: String(limit) })
  const res = await fetch(`https://itunes.apple.com/search?${params}`)
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  const data = (await res.json()) as { results: ItunesSong[] }
  const seen = new Set<string>()
  return data.results
    .filter((s) => s.previewUrl)
    .filter((s) => {
      const key = `${s.trackName}|${s.artistName}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((s) => ({
      id: String(s.trackId),
      title: s.trackName,
      artist: s.artistName,
      album: s.collectionName ?? '',
      art: (s.artworkUrl100 ?? '').replace('100x100bb', '300x300bb'),
      src: s.previewUrl as string,
      kind: 'preview' as const,
      link: s.trackViewUrl,
      source: 'Apple Music' as const,
    }))
}

type AudiusTrack = {
  id: string
  title: string
  duration: number
  permalink: string
  is_streamable?: boolean
  is_stream_gated?: boolean
  artwork?: Record<string, string> | null
  user: { name: string }
}

const AUDIUS = 'https://api.audius.co/v1'
const APP = 'perfucktionist'

// Audius: a free, legal music platform where independent artists upload their own tracks.
// Its public API streams FULL songs with no key — but the catalogue is indie, not label releases.
export async function searchFull(term: string, limit = 24): Promise<Track[]> {
  const res = await fetch(`${AUDIUS}/tracks/search?${new URLSearchParams({ query: term, app_name: APP })}`)
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  const data = (await res.json()) as { data: AudiusTrack[] }
  return data.data
    .filter((t) => t.is_streamable !== false && !t.is_stream_gated && t.duration > 60)
    .slice(0, limit)
    .map((t) => ({
      id: `au-${t.id}`,
      title: t.title,
      artist: t.user.name,
      album: '',
      art: t.artwork?.['480x480'] ?? t.artwork?.['150x150'] ?? '',
      src: `${AUDIUS}/tracks/${t.id}/stream?app_name=${APP}`,
      kind: 'full' as const,
      link: `https://audius.co${t.permalink}`,
      source: 'Audius' as const,
    }))
}

/** `full` is the matching search on Audius (independent artists), which works better with genre words. */
export type Mood = { label: string; terms: string[]; full: string }

/** Each click picks a random seed so the same chip gives fresh results. */
export const moods: Mood[] = [
  { label: '🎬 Bollywood', full: 'bollywood', terms: ['arijit singh', 'shreya ghoshal', 'pritam', 'a r rahman', 'atif aslam', 'sonu nigam', 'vishal shekhar', 'jubin nautiyal'] },
  { label: '🌎 Hollywood / Pop', full: 'pop', terms: ['taylor swift', 'the weeknd', 'dua lipa', 'ed sheeran', 'billie eilish', 'bruno mars', 'sabrina carpenter', 'olivia rodrigo'] },
  { label: '🥁 Punjabi', full: 'punjabi', terms: ['diljit dosanjh', 'ap dhillon', 'karan aujla', 'sidhu moose wala', 'shubh', 'guru randhawa'] },
  { label: '☕ Lofi', full: 'lofi', terms: ['lofi hip hop', 'lofi chill beats', 'lofi study', 'bollywood lofi'] },
  { label: '🌙 Sufi', full: 'sufi', terms: ['nusrat fateh ali khan', 'rahat fateh ali khan', 'abida parveen', 'kailash kher'] },
  { label: '🪔 Bhajan', full: 'bhajan', terms: ['anup jalota bhajan', 'hari om sharan', 'hanuman chalisa', 'shiv tandav stotram', 'krishna das kirtan', 'jagjit singh bhajan'] },
  { label: '💜 K-Pop', full: 'kpop', terms: ['bts', 'blackpink', 'newjeans', 'stray kids', 'twice', 'seventeen'] },
  { label: '🌴 South', full: 'tamil', terms: ['anirudh ravichander', 'sid sriram', 'devi sri prasad', 'yuvan shankar raja', 'ilaiyaraaja'] },
  { label: '🎤 Rap / Hip-Hop', full: 'desi hip hop', terms: ['divine', 'seedhe maut', 'krsna', 'raftaar', 'drake', 'kendrick lamar', 'eminem', 'travis scott'] },
  { label: '🎸 Rock', full: 'indie rock', terms: ['queen', 'coldplay', 'linkin park', 'imagine dragons', 'arctic monkeys', 'the local train', 'indian ocean'] },
  { label: '📻 Retro', full: 'retro', terms: ['kishore kumar', 'lata mangeshkar', 'mohammed rafi', 'r d burman', 'asha bhosle', 'mukesh'] },
  { label: '🥀 Ghazal', full: 'ghazal', terms: ['jagjit singh', 'ghulam ali', 'mehdi hassan', 'pankaj udhas'] },
  { label: '🌻 Indie', full: 'indian indie', terms: ['prateek kuhad', 'anuv jain', 'when chai met toast', 'ritviz', 'the yellow diary', 'lifafa'] },
  { label: '⚡ EDM', full: 'edm', terms: ['avicii', 'martin garrix', 'calvin harris', 'nucleya', 'alan walker', 'david guetta'] },
  { label: '🎻 Classical', full: 'indian classical', terms: ['ravi shankar', 'zakir hussain', 'hariprasad chaurasia', 'bhimsen joshi', 'ludovico einaudi', 'mozart'] },
  { label: '💃 Latin', full: 'reggaeton', terms: ['bad bunny', 'shakira', 'j balvin', 'karol g', 'daddy yankee'] },
]

export const stores = [
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'US', label: '🇺🇸 US' },
  { code: 'GB', label: '🇬🇧 UK' },
  { code: 'KR', label: '🇰🇷 Korea' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'BR', label: '🇧🇷 Brazil' },
]

/** Spotify editorial playlists — full tracks if you're logged in to Spotify, previews otherwise. */
export const playlists = [
  { id: '37i9dQZEVXbLZ52XmnySJg', name: 'Top 50 India' },
  { id: '37i9dQZF1DX0XUfTFmNBRM', name: 'Hot Hits Hindi' },
  { id: '37i9dQZF1DXdpQPPZq3F7n', name: 'Bollywood Mush' },
  { id: '37i9dQZF1DX8xfQRRX1PDm', name: 'Bollywood Dance' },
  { id: '37i9dQZF1DX5cZuAHLNjGz', name: 'Punjabi 101' },
  { id: '37i9dQZF1DX1i3hvzHpcQV', name: 'Hot Hits Tamil' },
  { id: '37i9dQZF1DX5q67ZpWyRrZ', name: 'Indie India' },
  { id: '37i9dQZF1DXcBWIGoYBM5M', name: 'Today’s Top Hits' },
  { id: '37i9dQZEVXbMDoHDwVN2tF', name: 'Top 50 Global' },
  { id: '37i9dQZF1DX0XUsuxWHRQd', name: 'RapCaviar' },
  { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
  { id: '37i9dQZF1DX9tPFwDMOaN1', name: 'K-Pop ON!' },
  { id: '37i9dQZF1DX10zKzsJ2jva', name: 'Viva Latino' },
  { id: '37i9dQZF1DWTwbZHrJRIgD', name: 'Happy Vibes' },
  { id: '37i9dQZF1DX3wwp27Epwn5', name: 'Bollywood Workout' },
  { id: '37i9dQZF1DWWQRwui0ExPn', name: 'lofi beats' },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus' },
]

/** Lofi Girl's 24/7 YouTube streams. */
export const radios: { id: string; emoji: string; name: string; note: string; accent: Accent }[] = [
  { id: 'jfKfPfyJRdk', emoji: '📚', name: 'lofi hip hop radio', note: 'beats to relax / study to', accent: 'violet' },
  { id: '4xDzrJKXOOY', emoji: '🌌', name: 'synthwave radio', note: 'beats to chill / game to', accent: 'cyan' },
]
