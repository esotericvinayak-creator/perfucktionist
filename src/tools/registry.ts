export type Cat = 'mind' | 'focus' | 'body' | 'money' | 'safety' | 'people' | 'grow'
export type Need = 'anxious' | 'focus' | 'sleep' | 'money' | 'sad' | 'heartbreak' | 'unsafe' | 'stuck' | 'exam' | 'bored'

export const CATS: { id: Cat; emoji: string; label: string; accent: string }[] = [
  { id: 'mind', emoji: '🧠', label: 'Mind', accent: 'violet' },
  { id: 'focus', emoji: '🎯', label: 'Focus', accent: 'lime' },
  { id: 'body', emoji: '💪', label: 'Body', accent: 'orange' },
  { id: 'money', emoji: '💸', label: 'Money', accent: 'sun' },
  { id: 'safety', emoji: '🛡️', label: 'Safety', accent: 'pink' },
  { id: 'people', emoji: '💗', label: 'People', accent: 'pink' },
  { id: 'grow', emoji: '🌱', label: 'Grow', accent: 'cyan' },
]

export const NEEDS: { id: Need; emoji: string; label: string }[] = [
  { id: 'anxious', emoji: '😰', label: 'anxious' },
  { id: 'sad', emoji: '😔', label: 'low' },
  { id: 'focus', emoji: '🌀', label: 'can’t focus' },
  { id: 'exam', emoji: '📚', label: 'exams' },
  { id: 'sleep', emoji: '😴', label: 'can’t sleep' },
  { id: 'money', emoji: '💸', label: 'broke' },
  { id: 'heartbreak', emoji: '💔', label: 'heartbroken' },
  { id: 'unsafe', emoji: '🛡️', label: 'unsafe' },
  { id: 'stuck', emoji: '🧱', label: 'stuck' },
  { id: 'bored', emoji: '🥱', label: 'bored' },
]

export type ToolMeta = { id: string; emoji: string; name: string; hook: string; cat: Cat; needs: Need[]; plus?: boolean; next?: string[] }

export const TOOLS: ToolMeta[] = [
  // 🧠 mind
  { id: 'checkin', emoji: '🌡️', name: 'Daily check-in', hook: '3 taps. how’s today?', cat: 'mind', needs: ['sad', 'anxious'], next: ['mood-insights', 'journal'] },
  { id: 'mood-insights', emoji: '📈', name: 'Mood insights', hook: 'see your patterns', cat: 'mind', needs: ['sad'], plus: true, next: ['checkin'] },
  { id: 'panic', emoji: '🆘', name: 'Panic SOS', hook: 'calm down in 3 min', cat: 'mind', needs: ['anxious'], next: ['thought-flip', 'safety-plan'] },
  { id: 'safety-plan', emoji: '🛟', name: 'My safety plan', hook: 'for the darkest days', cat: 'mind', needs: ['sad'], next: ['bad-day', 'hype-file'] },
  { id: 'thought-flip', emoji: '🔄', name: 'Thought flipper', hook: 'argue back with your brain', cat: 'mind', needs: ['anxious', 'sad'], next: ['worry-box', 'journal'] },
  { id: 'worry-box', emoji: '📦', name: 'Worry box', hook: 'park it, don’t carry it', cat: 'mind', needs: ['anxious'], next: ['brain-dump', 'sounds'] },
  { id: 'journal', emoji: '📓', name: 'Journal', hook: 'prompts that actually hit', cat: 'mind', needs: ['sad', 'heartbreak'], next: ['one-line', 'hype-file'] },
  { id: 'one-line', emoji: '✍️', name: 'One line a day', hook: 'one sentence. every day.', cat: 'mind', needs: ['bored'], next: ['journal'] },
  { id: 'hype-file', emoji: '🏆', name: 'Hype file', hook: 'receipts for bad days', cat: 'mind', needs: ['sad'], next: ['affirm'] },
  { id: 'bad-day', emoji: '🧸', name: 'Bad day kit', hook: 'your personal first aid', cat: 'mind', needs: ['sad', 'heartbreak'], next: ['hype-file', 'sounds'] },
  { id: 'affirm', emoji: '💫', name: 'Affirmations', hook: 'say it till you believe it', cat: 'mind', needs: ['sad', 'exam'], next: ['wallpaper'] },
  { id: 'urge', emoji: '🌊', name: 'Urge surfer', hook: 'ride out a craving', cat: 'mind', needs: ['stuck', 'heartbreak'], next: ['quit', 'phone-down'] },

  // 🎯 focus
  { id: 'focus', emoji: '⏱️', name: 'Focus timer', hook: 'pomodoro, but cute', cat: 'focus', needs: ['focus', 'exam'], next: ['stretch', 'water'] },
  { id: 'focus-stats', emoji: '📊', name: 'Focus stats', hook: 'your deep-work receipts', cat: 'focus', needs: ['focus'], plus: true, next: ['focus'] },
  { id: 'sounds', emoji: '🎚️', name: 'Sound mixer', hook: 'rain, brown noise & more', cat: 'focus', needs: ['focus', 'sleep', 'anxious'], next: ['focus', 'wind-down'] },
  { id: 'brain-dump', emoji: '🧠', name: 'Brain dump', hook: 'empty your head in 60s', cat: 'focus', needs: ['focus', 'anxious', 'stuck'], next: ['starter', 'focus'] },
  { id: 'done-list', emoji: '✅', name: 'Done list', hook: 'track wins, not tasks', cat: 'focus', needs: ['stuck', 'sad'], next: ['hype-file'] },
  { id: 'starter', emoji: '🚀', name: '5-minute starter', hook: 'when you just can’t start', cat: 'focus', needs: ['stuck', 'focus', 'exam'], next: ['focus'] },
  { id: 'countdowns', emoji: '⏳', name: 'Countdowns', hook: 'exams, trips, birthdays', cat: 'focus', needs: ['exam'], next: ['timetable'] },
  { id: 'flashcards', emoji: '🗂️', name: 'Flashcards', hook: 'spaced repetition that works', cat: 'focus', needs: ['exam'], next: ['focus'] },
  { id: 'timetable', emoji: '🗓️', name: 'Study timetable', hook: 'auto-plan your week', cat: 'focus', needs: ['exam'], plus: true, next: ['focus', 'countdowns'] },
  { id: 'eye-care', emoji: '👀', name: '20-20-20 eyes', hook: 'screen breaks for your eyes', cat: 'focus', needs: ['focus'], next: ['stretch'] },
  { id: 'phone-down', emoji: '📵', name: 'Phone-down mode', hook: 'beat the doomscroll', cat: 'focus', needs: ['focus', 'stuck'], next: ['dopamine'] },

  // 💪 body
  { id: 'workout', emoji: '🏃', name: '7-minute workout', hook: 'no gym, no excuses', cat: 'body', needs: ['stuck', 'bored'], next: ['water', 'stretch'] },
  { id: 'stretch', emoji: '🧘', name: 'Desk stretches', hook: '5 min for your back', cat: 'body', needs: ['focus'], next: ['water'] },
  { id: 'water', emoji: '💧', name: 'Water', hook: 'drink up, bestie', cat: 'body', needs: ['focus'], next: ['stretch'] },
  { id: 'sleep-calc', emoji: '🌙', name: 'Sleep calculator', hook: 'wake up not like a zombie', cat: 'body', needs: ['sleep'], next: ['wind-down', 'caffeine'] },
  { id: 'wind-down', emoji: '🛌', name: 'Wind-down', hook: 'fall asleep faster', cat: 'body', needs: ['sleep', 'anxious'], next: ['sleep-calc'] },
  { id: 'period', emoji: '🩸', name: 'Cycle tracker', hook: 'private. stays on your phone.', cat: 'body', needs: [], next: ['water'] },
  { id: 'caffeine', emoji: '☕', name: 'Caffeine cutoff', hook: 'chai at 9pm? let’s see', cat: 'body', needs: ['sleep'], next: ['sleep-calc'] },

  // 💸 money
  { id: 'expenses', emoji: '🧾', name: 'Expense tracker', hook: 'where did it all go?', cat: 'money', needs: ['money'], next: ['budget', 'subs'] },
  { id: 'budget', emoji: '🥧', name: '50/30/20 budget', hook: 'split your money smart', cat: 'money', needs: ['money'], next: ['savings', 'sip'] },
  { id: 'split', emoji: '🍕', name: 'Split the bill', hook: 'UPI links for everyone', cat: 'money', needs: ['money'], next: ['expenses'] },
  { id: 'subs', emoji: '🔁', name: 'Subscriptions', hook: 'find the money leaks', cat: 'money', needs: ['money'], next: ['savings'] },
  { id: 'savings', emoji: '🐷', name: 'Savings goal', hook: 'save for the thing', cat: 'money', needs: ['money'], next: ['sip'] },
  { id: 'sip', emoji: '📈', name: 'SIP calculator', hook: 'start at 20 vs 30', cat: 'money', needs: ['money'], next: ['salary'] },
  { id: 'salary', emoji: '💼', name: 'CTC → in-hand', hook: 'what you’ll actually get', cat: 'money', needs: ['money'], next: ['budget'] },
  { id: 'worth-it', emoji: '🤔', name: 'Is it worth it?', hook: 'price in hours of your life', cat: 'money', needs: ['money'], next: ['savings'] },
  { id: 'emi', emoji: '💳', name: 'EMI & card truth', hook: 'see the real cost', cat: 'money', needs: ['money'], next: ['budget'] },
  { id: 'scam-check', emoji: '🕵️', name: 'Scam detector', hook: 'paste the sus message', cat: 'money', needs: ['unsafe', 'money'], next: ['password'] },

  // 🛡️ safety
  { id: 'safe-walk', emoji: '🚶‍♀️', name: 'Safe-walk timer', hook: 'if I don’t check in…', cat: 'safety', needs: ['unsafe'], next: ['ice'] },
  { id: 'ice', emoji: '🪪', name: 'Emergency card', hook: 'for your lock screen', cat: 'safety', needs: ['unsafe'], next: ['safe-walk'] },
  { id: 'password', emoji: '🔐', name: 'Password check', hook: 'has it been leaked?', cat: 'safety', needs: ['unsafe'], next: ['privacy'] },
  { id: 'privacy', emoji: '🔏', name: 'Privacy checkup', hook: 'lock down your socials', cat: 'safety', needs: ['unsafe'], next: ['password'] },
  { id: 'red-flags', emoji: '🚩', name: 'Relationship check', hook: 'healthy or toxic?', cat: 'safety', needs: ['heartbreak', 'unsafe'], next: ['boundaries'] },

  // 💗 people
  { id: 'boundaries', emoji: '🗣️', name: 'Boundary scripts', hook: 'say no without drama', cat: 'people', needs: ['stuck', 'heartbreak'], next: ['red-flags'] },
  { id: 'breakup', emoji: '💔', name: 'Breakup recovery', hook: 'no-contact, day by day', cat: 'people', needs: ['heartbreak'], next: ['urge', 'journal'] },
  { id: 'friends', emoji: '🤙', name: 'Friend check-ins', hook: 'don’t let them fade', cat: 'people', needs: ['sad', 'bored'], next: ['convo'] },
  { id: 'kindness', emoji: '🌻', name: 'Kindness dares', hook: 'be someone’s good day', cat: 'people', needs: ['bored', 'sad'], next: ['friends'] },
  { id: 'convo', emoji: '💬', name: 'Conversation starters', hook: 'never awkward again', cat: 'people', needs: ['bored'], next: ['friends'] },

  // 🌱 grow
  { id: 'habits', emoji: '📅', name: 'Habit tracker', hook: 'tiny habits, big you', cat: 'grow', needs: ['stuck'], next: ['done-list'] },
  { id: 'quit', emoji: '🚭', name: 'Quit tracker', hook: 'days clean & money saved', cat: 'grow', needs: ['stuck'], next: ['urge'] },
  { id: 'capsule', emoji: '💌', name: 'Time capsule', hook: 'a letter to future you', cat: 'grow', needs: ['bored'], next: ['bucket'] },
  { id: 'bucket', emoji: '🪣', name: 'Bucket list', hook: 'things before 30', cat: 'grow', needs: ['bored'], next: ['savings'] },
  { id: 'wallpaper', emoji: '🖼️', name: 'Wallpaper maker', hook: 'aesthetic lock screens', cat: 'grow', needs: ['bored'], next: ['affirm'] },
  { id: 'dopamine', emoji: '🍱', name: 'Dopamine menu', hook: 'healthy hits, on order', cat: 'grow', needs: ['bored', 'stuck'], next: ['phone-down'] },
  { id: 'career', emoji: '🧭', name: 'Career compass', hook: 'what fits you?', cat: 'grow', needs: ['stuck'], next: ['interview'] },
  { id: 'interview', emoji: '🎤', name: 'Interview prep', hook: 'practice out loud', cat: 'grow', needs: ['stuck'], next: ['speak'] },
  { id: 'decide', emoji: '⚖️', name: 'Decision maker', hook: 'stop overthinking', cat: 'grow', needs: ['stuck', 'anxious'], next: ['starter'] },
  { id: 'speak', emoji: '🎙️', name: 'Speaking coach', hook: 'count your “umm”s', cat: 'grow', needs: ['stuck'], plus: true, next: ['interview'] },
]

export const toolById = (id: string) => TOOLS.find((t) => t.id === id)
