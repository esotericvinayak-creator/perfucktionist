// The app's simple shape: what people want help with (goals) and where everything lives (areas).
import type { Accent } from './zones'

export type ActionKind = 'breathe' | 'gratitude' | 'dare' | 'intent' | 'spend' | 'kind'

export type Goal = { id: string; emoji: string; label: string; tools: string[]; journey: string | null; action: ActionKind }

export const GOALS: Goal[] = [
  { id: 'calm', emoji: '😌', label: 'less stress', tools: ['panic', 'worry-box', 'sounds', 'checkin'], journey: 'calm-7', action: 'breathe' },
  { id: 'focus', emoji: '🎯', label: 'focus & study', tools: ['focus', 'flashcards', 'brain-dump', 'starter'], journey: 'unperfect-21', action: 'intent' },
  { id: 'sleep', emoji: '😴', label: 'better sleep', tools: ['sleep-calc', 'sounds', 'checkin'], journey: 'calm-7', action: 'breathe' },
  { id: 'confidence', emoji: '🦁', label: 'confidence', tools: ['affirm', 'interview', 'speak', 'wallpaper'], journey: 'brave-14', action: 'dare' },
  { id: 'money', emoji: '💸', label: 'money', tools: ['expenses', 'budget', 'split', 'sip'], journey: null, action: 'spend' },
  { id: 'safety', emoji: '🛡️', label: 'feel safe', tools: ['safe-walk', 'ice', 'privacy', 'safety-plan'], journey: null, action: 'gratitude' },
  { id: 'people', emoji: '💗', label: 'friends & family', tools: ['friends', 'convo', 'kindness', 'breakup'], journey: null, action: 'kind' },
  { id: 'faith', emoji: '🙏', label: 'faith & meaning', tools: ['journal', 'affirm', 'checkin'], journey: 'faiths-12', action: 'gratitude' },
  { id: 'habits', emoji: '🌱', label: 'good habits', tools: ['habits', 'quit', 'done-list', 'water'], journey: 'unperfect-21', action: 'intent' },
]

export const goalById = (id: string) => GOALS.find((g) => g.id === id)

// ─── your next scary thing ────────────────────────────────────
export type NextKind = 'exam' | 'interview' | 'talk'

/** What you're getting ready for. You enter the date yourself: exam dates move, and a stale one here could cost someone a year. An empty date means "not sure yet". */
export type NextUp = { kind: NextKind; name: string; date: string }

export const NEXT_KINDS: {
  id: NextKind
  icon: string
  label: string
  line: string
  ask: string
  placeholder: string
  picks: string[]
  /** Your first 5 minutes are built from these until you change them. */
  goals: string[]
  /** What to do today, most useful first. */
  steps: { label: string; path: string }[]
}[] = [
  {
    id: 'exam',
    icon: 'goal:focus',
    label: 'an exam',
    line: 'NEET, JEE, boards, UPSC, SSC, semester finals',
    ask: 'which exam?',
    placeholder: 'or type yours',
    picks: ['NEET', 'JEE', 'boards', 'UPSC', 'SSC', 'bank exam', 'semester exams'],
    goals: ['focus', 'calm'],
    steps: [
      { label: 'one 25-minute focus round', path: '/tools/focus' },
      { label: '10 practice questions', path: '/library/exams' },
    ],
  },
  {
    id: 'interview',
    icon: 'interview',
    label: 'an interview',
    line: 'placements, internships, your first job',
    ask: 'what’s the interview for?',
    placeholder: 'or type yours',
    picks: ['campus placement', 'internship', 'first job', 'job switch', 'bank job', 'govt job'],
    goals: ['confidence', 'calm'],
    steps: [
      { label: 'answer one question out loud', path: '/tools/interview' },
      { label: 'count my umms', path: '/tools/speak' },
    ],
  },
  {
    id: 'talk',
    icon: 'convo',
    label: 'a talk or hard conversation',
    line: 'a viva, a presentation, telling your parents',
    ask: 'what is it?',
    placeholder: 'or type yours',
    picks: ['viva', 'presentation', 'talking to my parents', 'asking for help'],
    goals: ['confidence', 'calm'],
    steps: [
      { label: 'say it out loud once', path: '/tools/speak' },
      { label: 'breathe for a minute first', path: '/breathe' },
    ],
  },
]

export const nextKind = (id: NextKind) => NEXT_KINDS.find((k) => k.id === id) ?? NEXT_KINDS[0]

export type Area = { id: string; emoji: string; name: string; line: string; accent: Accent; guides: string[]; toolCats: string[]; tools?: string[] }

/** Everything in the app, grouped into 8 places. Guides are the long-form pages; tools come from the registry. */
export const AREAS: Area[] = [
  { id: 'calm', emoji: '😌', name: 'Calm', line: 'stress, overthinking, low days', accent: 'violet', guides: ['/breathe', '/unperfect'], toolCats: ['mind'] },
  { id: 'focus', emoji: '🎯', name: 'Focus & study', line: 'exams, textbooks, procrastination', accent: 'lime', guides: ['/library/exams', '/library/school', '/library/college'], toolCats: ['focus'] },
  { id: 'body', emoji: '💪', name: 'Body', line: 'move, sleep, water, cycle', accent: 'orange', guides: [], toolCats: ['body'] },
  { id: 'money', emoji: '💸', name: 'Money', line: 'budget, UPI, salary, scams', accent: 'sun', guides: [], toolCats: ['money'] },
  { id: 'safety', emoji: '🛡️', name: 'Safety', line: 'self-defence, SOS, online', accent: 'pink', guides: ['/shield'], toolCats: ['safety'] },
  { id: 'people', emoji: '💗', name: 'Love & family', line: 'parents, friends, dating', accent: 'pink', guides: ['/fam', '/bro'], toolCats: ['people'] },
  { id: 'grow', emoji: '🌱', name: 'Grow', line: 'habits, courage, career', accent: 'cyan', guides: ['/journeys', '/brave', '/green'], toolCats: ['grow'] },
  { id: 'faith', emoji: '🙏', name: 'Faith', line: 'every scripture, no fake babas', accent: 'sun', guides: ['/library/faith', '/faith'], toolCats: [] },
  { id: 'read', emoji: '📖', name: 'Read', line: 'depression, pressure, starting over', accent: 'cyan', guides: ['/read'], toolCats: [] },
  { id: 'listen', emoji: '🎧', name: 'Listen', line: 'quotes + music, hands-free', accent: 'violet', guides: ['/listen', '/music'], toolCats: [] },
  // Handy utilities that don't belong to one need. Sound mixer lives in Calm too.
  { id: 'more', emoji: '🧰', name: 'More', line: 'sounds, quick maths, countdowns, wallpapers', accent: 'cyan', guides: [], toolCats: [], tools: ['sounds', 'maths', 'countdowns', 'wallpaper', 'capsule', 'eye-care'] },
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
