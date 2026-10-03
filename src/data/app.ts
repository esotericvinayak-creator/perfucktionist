// The app's simple shape: what people want help with (goals) and where everything lives (areas).
import type { Accent } from './zones'

export type ActionKind = 'breathe' | 'gratitude' | 'dare' | 'intent' | 'spend' | 'kind'

export type Goal = { id: string; emoji: string; label: string; tools: string[]; journey: string | null; action: ActionKind }

export const GOALS: Goal[] = [
  { id: 'calm', emoji: '😌', label: 'less stress', tools: ['panic', 'thought-flip', 'sounds', 'worry-box'], journey: 'calm-7', action: 'breathe' },
  { id: 'focus', emoji: '🎯', label: 'focus & study', tools: ['focus', 'flashcards', 'brain-dump', 'starter'], journey: 'unperfect-21', action: 'intent' },
  { id: 'sleep', emoji: '😴', label: 'better sleep', tools: ['wind-down', 'sleep-calc', 'sounds', 'caffeine'], journey: 'calm-7', action: 'breathe' },
  { id: 'confidence', emoji: '🦁', label: 'confidence', tools: ['affirm', 'hype-file', 'interview', 'speak'], journey: 'brave-14', action: 'dare' },
  { id: 'money', emoji: '💸', label: 'money', tools: ['expenses', 'budget', 'split', 'sip'], journey: null, action: 'spend' },
  { id: 'safety', emoji: '🛡️', label: 'feel safe', tools: ['safe-walk', 'ice', 'scam-check', 'privacy'], journey: null, action: 'gratitude' },
  { id: 'people', emoji: '💗', label: 'friends & family', tools: ['friends', 'boundaries', 'convo', 'kindness'], journey: null, action: 'kind' },
  { id: 'faith', emoji: '🙏', label: 'faith & meaning', tools: ['journal', 'one-line', 'affirm', 'checkin'], journey: 'faiths-12', action: 'gratitude' },
  { id: 'habits', emoji: '🌱', label: 'good habits', tools: ['habits', 'quit', 'done-list', 'water'], journey: 'unperfect-21', action: 'intent' },
]

export const goalById = (id: string) => GOALS.find((g) => g.id === id)

export type Area = { id: string; emoji: string; name: string; line: string; accent: Accent; guides: string[]; toolCats: string[] }

/** Everything in the app, grouped into 8 places. Guides are the long-form pages; tools come from the registry. */
export const AREAS: Area[] = [
  { id: 'calm', emoji: '😌', name: 'Calm', line: 'stress, overthinking, low days', accent: 'violet', guides: ['/breathe', '/unperfect', '/happy'], toolCats: ['mind'] },
  { id: 'focus', emoji: '🎯', name: 'Focus & study', line: 'exams, textbooks, procrastination', accent: 'lime', guides: ['/library/exams', '/library/school', '/library/college'], toolCats: ['focus'] },
  { id: 'body', emoji: '💪', name: 'Body', line: 'move, sleep, water, cycle', accent: 'orange', guides: [], toolCats: ['body'] },
  { id: 'money', emoji: '💸', name: 'Money', line: 'budget, UPI, salary, scams', accent: 'sun', guides: [], toolCats: ['money'] },
  { id: 'safety', emoji: '🛡️', name: 'Safety', line: 'self-defence, SOS, online', accent: 'pink', guides: ['/shield'], toolCats: ['safety'] },
  { id: 'people', emoji: '💗', name: 'Love & family', line: 'parents, friends, dating', accent: 'pink', guides: ['/fam', '/bro'], toolCats: ['people'] },
  { id: 'grow', emoji: '🌱', name: 'Grow', line: 'habits, courage, career', accent: 'cyan', guides: ['/journeys', '/brave', '/green'], toolCats: ['grow'] },
  { id: 'faith', emoji: '🙏', name: 'Faith', line: 'every scripture, no fake babas', accent: 'sun', guides: ['/library/faith', '/faith'], toolCats: [] },
  { id: 'read', emoji: '📖', name: 'Read', line: 'depression, pressure, starting over', accent: 'cyan', guides: ['/read'], toolCats: [] },
  { id: 'listen', emoji: '🎧', name: 'Listen', line: 'quotes + music, hands-free', accent: 'violet', guides: ['/listen', '/music'], toolCats: [] },
]

export const DARES = [
  'Ask one question you’d normally keep to yourself.',
  'Say “no” to one thing today without explaining.',
  'Send the message you’ve been putting off.',
  'Compliment someone — out loud, for real.',
  'Do one thing badly on purpose. Notice nobody cares.',
  'Post or send something without editing it 5 times.',
  'Sit with someone new at lunch or in the group chat.',
  'Tell someone how you actually feel today.',
  'Wear the thing you think is “too much”.',
  'Apologise first, even if it was 50/50.',
]

export const KIND_DARES = [
  'Text a friend: “thinking of you, hope your day’s okay 🫶”.',
  'Call your grandparents or a relative you miss.',
  'Thank someone who usually gets ignored — guard, driver, cleaner.',
  'Hype a friend’s post with a real comment.',
  'Help someone at home without being asked.',
  'Leave a kind note for mom or dad.',
]
