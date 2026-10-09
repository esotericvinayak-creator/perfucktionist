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

/**
 * How a tool feels. Each mood sets its own typeface, colours, corner radius and wording tone
 * (see the "tool moods" block in src/styles/home.css). A tool picks one; otherwise its category's default applies.
 *  - calm:    soft pastel, Nunito + Lora headings, round corners, gentle copy. Mind, sleep, people.
 *  - journal: cream paper, Lora throughout, editorial and personal. Journal and notes.
 *  - precise: neutral and high-contrast, Inter with tabular numbers, big figures. Money, maths, stats.
 *  - plain:   clean and direct, Inter, short imperative copy. Focus, safety, decisions.
 *  - playful: the brand's own look: Bricolage Grotesque, bold, bright. Habits, fun, making things.
 */
export type Mood = 'calm' | 'journal' | 'precise' | 'plain' | 'playful'

export const CAT_MOOD: Record<Cat, Mood> = { mind: 'calm', focus: 'plain', body: 'calm', money: 'precise', safety: 'plain', people: 'calm', grow: 'playful' }

/** One tab inside a collection. The first part is the tool's own screen. */
export type Part = { id: string; label: string; hook: string }

export type ToolMeta = {
  id: string
  emoji: string
  name: string
  /** What it does, in one line. Shown on tiles and under the title, so you know before you open it. */
  hook: string
  /** Why you'd use it, one or two lines. Shown on the tool's own page. */
  why: string
  cat: Cat
  needs: Need[]
  plus?: boolean
  mood?: Mood
  /** Other tools that go well with this one (not its own parts). */
  related?: string[]
  /** A collection: several small experiences that belong together, shown as tabs on one page. */
  parts?: Part[]
}

export const TOOLS: ToolMeta[] = [
  // 🧠 mind
  {
    id: 'checkin', emoji: '🌡️', name: 'Mood check-in', hook: 'Log your mood, energy and sleep in three taps.', why: 'A few seconds a day builds a record of how you actually feel, so patterns stop being guesses.',
    cat: 'mind', needs: ['sad', 'anxious'], related: ['journal', 'panic'],
    parts: [
      { id: 'checkin', label: 'Check in', hook: 'Three taps: mood, energy, sleep.' },
      { id: 'mood-insights', label: 'Patterns', hook: 'What your check-ins say about your weeks.' },
    ],
  },
  { id: 'panic', emoji: '🆘', name: 'Panic SOS', hook: 'A 3-minute guided way to come down from panic.', why: 'When your chest is tight and thoughts race, follow the steps: breathe, ground yourself, then decide what next.', cat: 'mind', needs: ['anxious'], related: ['worry-box', 'safety-plan'] },
  { id: 'safety-plan', emoji: '🛟', name: 'Crisis plan', hook: 'Write down who to call and what helps, for when it’s really bad.', why: 'In a dark moment it’s hard to think. Make the plan while you’re okay: your warning signs, things that help, people to reach, numbers to call.', cat: 'mind', needs: ['sad'], related: ['bad-day', 'ice'] },
  { id: 'worry-box', emoji: '📦', name: 'Worry box', hook: 'Write a worry, sort it: can I act on it, or let it go?', why: 'Worries loop because they’re vague. Writing one down and sorting it into “I can do something” or “I can’t” gives your mind permission to stop carrying it.', cat: 'mind', needs: ['anxious'], related: ['brain-dump', 'sounds'] },
  {
    id: 'journal', emoji: '📓', name: 'Journal', hook: 'Write with a prompt or a blank page. Keep it private.', why: 'Getting thoughts out of your head and onto a page makes them smaller. Start with one line a day; build a stash of wins for bad days.', cat: 'mind', needs: ['sad', 'heartbreak'], mood: 'journal', related: ['checkin', 'bad-day'],
    parts: [
      { id: 'journal', label: 'Write', hook: 'Pick a prompt or a blank page, give it a title, write.' },
      { id: 'one-line', label: 'One line a day', hook: 'Just one sentence about today. The easiest way to start.' },
      { id: 'hype-file', label: 'Hype file', hook: 'Kind words and wins you saved, to read on a bad day.' },
    ],
  },
  { id: 'bad-day', emoji: '🧸', name: 'Bad day kit', hook: 'Your own list of things, songs and people that help.', why: 'Build it on a good day, use it on a bad one: a short plan you made for yourself so you don’t have to decide when you’re low.', cat: 'mind', needs: ['sad', 'heartbreak'], related: ['sounds', 'safety-plan'] },
  { id: 'affirm', emoji: '💫', name: 'Affirmations', hook: 'Short lines to say to yourself, in your own words.', why: 'Said out loud, the right sentence changes the tone in your head before an exam, interview or hard day.', cat: 'mind', needs: ['sad', 'exam'], related: ['wallpaper'] },
  { id: 'sounds', emoji: '🎚️', name: 'Sound mixer', hook: 'Layer rain, brown noise and more into one background sound.', why: 'The right background noise helps you relax, focus or sleep. Mix it your way and let it run.', cat: 'mind', needs: ['focus', 'sleep', 'anxious'], related: ['sleep-calc', 'focus'] },

  // 🎯 focus
  {
    id: 'focus', emoji: '⏱️', name: 'Focus timer', hook: 'Work in timed rounds with short breaks (pomodoro).', why: 'Starting is the hard part. A 25-minute round is small enough to begin, and the breaks keep you going.', cat: 'focus', needs: ['focus', 'exam'], related: ['sounds', 'water'],
    parts: [
      { id: 'focus', label: 'Timer', hook: 'Pick a round length and start.' },
      { id: 'focus-stats', label: 'Stats', hook: 'How much deep work you’ve really done.' },
    ],
  },
  { id: 'brain-dump', emoji: '🧠', name: 'Brain dump', hook: 'Empty everything on your mind onto the screen in 60 seconds.', why: 'When your head is full, nothing starts. Dump it all, then pick the one thing that matters.', cat: 'focus', needs: ['focus', 'anxious', 'stuck'], related: ['starter', 'focus'] },
  { id: 'done-list', emoji: '✅', name: 'Done list', hook: 'Write what you did today, not what’s left.', why: 'To-do lists only show what’s missing. A done list shows progress, which is what keeps you going.', cat: 'focus', needs: ['stuck', 'sad'], related: ['habits'] },
  { id: 'starter', emoji: '🚀', name: '5-minute starter', hook: 'Pick a task and just do the first 5 minutes.', why: 'You can’t start because the task feels huge. Five minutes is a promise you can keep, and starting is most of the work.', cat: 'focus', needs: ['stuck', 'focus', 'exam'], related: ['focus', 'brain-dump'] },
  { id: 'countdowns', emoji: '⏳', name: 'Countdowns', hook: 'Days left to your exam, trip or birthday.', why: 'Seeing the number of days left turns a vague “soon” into a plan you can work back from.', cat: 'focus', needs: ['exam'], related: ['timetable'] },
  { id: 'flashcards', emoji: '🗂️', name: 'Flashcards', hook: 'Make cards and review them on a spaced schedule.', why: 'Seeing a card right before you’d forget it is the fastest way to remember. The app schedules it for you.', cat: 'focus', needs: ['exam'], related: ['focus', 'timetable'] },
  { id: 'timetable', emoji: '🗓️', name: 'Study timetable', hook: 'Turn subjects and free hours into a weekly plan.', why: 'Tell it your subjects and hours; it splits your week so you don’t spend the time deciding what to study.', cat: 'focus', needs: ['exam'], plus: true, related: ['focus', 'countdowns'] },
  { id: 'eye-care', emoji: '👀', name: '20-20-20 eyes', hook: 'A reminder every 20 minutes to look far away for 20 seconds.', why: 'Long screen hours strain your eyes. This small habit keeps headaches and dry eyes away.', cat: 'focus', needs: ['focus'], related: ['screen-time', 'water'] },
  { id: 'phone-down', emoji: '📵', name: 'Phone-down mode', hook: 'A timer that gently keeps you off your phone.', why: 'Set how long you want to stay off it. The screen holds you accountable and shows what you got back.', cat: 'focus', needs: ['focus', 'stuck'], related: ['screen-time', 'focus'] },
  { id: 'screen-time', emoji: '📱', name: 'Screen time', hook: 'Log your daily screen time against a goal and see your week.', why: 'You can’t change what you don’t see. Copy the number from your phone’s own screen-time page and watch your week and goal here.', cat: 'focus', needs: ['focus', 'stuck'], mood: 'precise', related: ['phone-down', 'eye-care'] },

  // 💪 body
  {
    id: 'workout', emoji: '🏃', name: 'Move', hook: 'Short workouts and stretches with a guided timer.', why: 'Seven minutes is enough to wake your body up. No equipment, no gym, and you can do it in your room.', cat: 'body', needs: ['stuck', 'bored'], mood: 'playful', related: ['water', 'sleep-calc'],
    parts: [
      { id: 'workout', label: '7-minute workout', hook: 'Twelve moves, 30 seconds each.' },
      { id: 'stretch', label: 'Desk stretches', hook: 'Five minutes for your back, neck and wrists.' },
    ],
  },
  { id: 'water', emoji: '💧', name: 'Water', hook: 'Count your glasses and get a nudge to drink.', why: 'Mild dehydration makes you tired and foggy. A simple counter makes it easy to remember.', cat: 'body', needs: ['focus'], mood: 'playful', related: ['workout'] },
  {
    id: 'sleep-calc', emoji: '🌙', name: 'Sleep', hook: 'Find your bedtime, wind down properly, and cut caffeine in time.', why: 'Good sleep is built from small habits done in order. Pick a wake-up time, follow a short wind-down, and track how well you stick to it.', cat: 'body', needs: ['sleep'], related: ['sounds', 'checkin'],
    parts: [
      { id: 'sleep-calc', label: 'Bedtime', hook: 'When to sleep to wake up refreshed.' },
      { id: 'wind-down', label: 'Wind-down', hook: 'A short routine, with a nightly check on whether you did it.' },
      { id: 'caffeine', label: 'Caffeine cut-off', hook: 'The last time to have tea or coffee for your bedtime.' },
    ],
  },
  { id: 'period', emoji: '🩸', name: 'Cycle tracker', hook: 'Track your period and see what’s coming. Private to your phone.', why: 'Knowing your cycle helps you plan around it. Everything stays on your device.', cat: 'body', needs: [], related: ['water', 'checkin'] },

  // 💸 money
  {
    id: 'expenses', emoji: '🧾', name: 'Spending', hook: 'Track what you spend, your subscriptions and your savings goal.', why: 'Most people don’t know where their money goes. Track it for a month and you’ll see where to save without feeling it.', cat: 'money', needs: ['money'], related: ['budget', 'split'],
    parts: [
      { id: 'expenses', label: 'Expenses', hook: 'Log what you spend, see where it goes.' },
      { id: 'subs', label: 'Subscriptions', hook: 'Everything that charges you every month.' },
      { id: 'savings', label: 'Savings goal', hook: 'Save for one thing, track how close you are.' },
    ],
  },
  { id: 'budget', emoji: '🥧', name: '50/30/20 budget', hook: 'Split your income into needs, wants and savings.', why: 'A simple rule so you always know what’s safe to spend and what to put aside.', cat: 'money', needs: ['money'], related: ['expenses', 'sip'] },
  { id: 'split', emoji: '🍕', name: 'Split the bill', hook: 'Divide a bill fairly and send UPI requests.', why: 'No more awkward maths after dinner. Add who had what and get everyone’s share.', cat: 'money', needs: ['money'], related: ['expenses', 'maths'] },
  { id: 'sip', emoji: '📈', name: 'SIP calculator', hook: 'See what a monthly investment could grow to.', why: 'Seeing the numbers shows why starting early matters more than starting big.', cat: 'money', needs: ['money'], related: ['roi', 'salary'] },
  { id: 'salary', emoji: '💼', name: 'CTC → in-hand', hook: 'Turn a job offer’s CTC into your monthly take-home.', why: 'CTC isn’t what lands in your account. See the real number before you say yes.', cat: 'money', needs: ['money'], related: ['budget', 'roi'] },
  { id: 'worth-it', emoji: '🤔', name: 'Is it worth it?', hook: 'Price a purchase in hours of your own work.', why: 'A ₹4,000 jacket looks different when it’s 10 hours of your time. Decide with the real cost.', cat: 'money', needs: ['money'], related: ['expenses', 'savings'] },
  { id: 'roi', emoji: '💹', name: 'ROI & growth', hook: 'Check what an investment earned, or project how money grows.', why: 'Works for anything: stocks, a course, a business, a gadget. See the return, the yearly rate and what inflation took.', cat: 'money', needs: ['money'], mood: 'precise', related: ['sip', 'maths'] },
  { id: 'maths', emoji: '🧮', name: 'Quick maths', hook: 'Percentages, discounts, GST, tips, splits and averages.', why: 'The everyday sums you keep doing in your head, done right and explained in a line.', cat: 'money', needs: ['money'], mood: 'precise', related: ['split', 'roi'] },

  // 🛡️ safety
  { id: 'safe-walk', emoji: '🚶‍♀️', name: 'Safe-walk timer', hook: 'Set a timer for your trip; if you don’t check in, it alerts someone.', why: 'Walking home late or taking a new cab? Share your trip and your contact knows if you don’t arrive.', cat: 'safety', needs: ['unsafe'], related: ['ice', 'privacy'] },
  { id: 'ice', emoji: '🪪', name: 'Emergency card', hook: 'A card with your emergency contacts and medical info, for your lock screen.', why: 'If something happens, people helping you need your details fast. Make the card once and set it as your wallpaper.', cat: 'safety', needs: ['unsafe'], related: ['safe-walk', 'safety-plan'] },
  { id: 'privacy', emoji: '🔏', name: 'Privacy checkup', hook: 'A checklist to lock down your social accounts.', why: 'Most privacy leaks come from settings you never changed. Go through them in ten minutes.', cat: 'safety', needs: ['unsafe'], related: ['safe-walk'] },

  // 💗 people
  { id: 'breakup', emoji: '💔', name: 'Breakup recovery', hook: 'A day-by-day no-contact plan with daily steps.', why: 'The first weeks are the hardest. Daily small steps and a place to put the urge to text.', cat: 'people', needs: ['heartbreak'], related: ['journal', 'bad-day'] },
  { id: 'friends', emoji: '🤙', name: 'Friend check-ins', hook: 'Remember to reach out to friends before they drift.', why: 'Friendships fade quietly. A small nudge to message someone is enough to keep them alive.', cat: 'people', needs: ['sad', 'bored'], related: ['convo', 'kindness'] },
  { id: 'kindness', emoji: '🌻', name: 'Kindness dares', hook: 'One small kind thing to do today.', why: 'Doing something kind for someone else is one of the fastest ways to feel better yourself.', cat: 'people', needs: ['bored', 'sad'], related: ['friends'] },
  { id: 'convo', emoji: '💬', name: 'Conversation starters', hook: 'Questions that make talking easy.', why: 'For the quiet moments with new people, family or a date: good questions beat small talk.', cat: 'people', needs: ['bored'], related: ['friends'] },

  // 🌱 grow
  { id: 'habits', emoji: '📅', name: 'Habit tracker', hook: 'Track up to a few small daily habits and keep the chain going.', why: 'Tiny habits done daily add up. Seeing an unbroken chain is surprisingly motivating.', cat: 'grow', needs: ['stuck'], related: ['done-list', 'starter'] },
  { id: 'quit', emoji: '🚭', name: 'Quit tracker', hook: 'Count days since you quit something and the money saved.', why: 'Seeing the days and rupees add up helps you protect the streak.', cat: 'grow', needs: ['stuck'], related: ['habits', 'phone-down'] },
  { id: 'capsule', emoji: '💌', name: 'Time capsule', hook: 'Write a letter to your future self, opened on a date you pick.', why: 'It’s a gift to who you’ll be, and a way to see how much you changed.', cat: 'grow', needs: ['bored'], mood: 'journal', related: ['bucket', 'journal'] },
  { id: 'bucket', emoji: '🪣', name: 'Bucket list', hook: 'Big goals, each with its own list of smaller steps.', why: 'A dream is easier to chase when it’s broken into steps you can tick off.', cat: 'grow', needs: ['bored'], related: ['savings', 'capsule'] },
  { id: 'wallpaper', emoji: '🖼️', name: 'Wallpaper maker', hook: 'Turn a line you need to remember into a lock screen.', why: 'Put your reminder where you’ll see it fifty times a day, in a design you actually like.', cat: 'grow', needs: ['bored'], related: ['affirm'] },
  { id: 'interview', emoji: '🎤', name: 'Interview prep', hook: 'Practise common interview questions out loud.', why: 'Answering aloud is a different skill from knowing the answer. Practise until it flows.', cat: 'grow', needs: ['stuck'], related: ['speak'] },
  { id: 'speak', emoji: '🎙️', name: 'Speaking coach', hook: 'Record yourself and count filler words like “umm”.', why: 'Hearing yourself shows habits you can’t notice while talking. Fix one at a time.', cat: 'grow', needs: ['stuck'], plus: true, related: ['interview'] },
]

export const toolById = (id: string) => TOOLS.find((t) => t.id === id)

/** Any id from a tool page URL → the tool that owns it, and which part to show. `one-line` → the Journal, part `one-line`. */
export function resolveTool(id: string): { tool: ToolMeta; part: string } | null {
  const direct = toolById(id)
  if (direct) return { tool: direct, part: direct.id }
  const owner = TOOLS.find((t) => t.parts?.some((p) => p.id === id))
  return owner ? { tool: owner, part: id } : null
}

export const moodOf = (t: ToolMeta): Mood => t.mood ?? CAT_MOOD[t.cat]

/** Old links (and saved pins) to removed tools still land somewhere sensible. */
export const REMOVED: Record<string, string> = {
  urge: 'quit',
  'scam-check': 'privacy',
  password: 'privacy',
  'red-flags': 'friends',
  'thought-flip': 'worry-box',
  boundaries: 'convo',
  decide: 'starter',
  career: 'interview',
  dopamine: 'phone-down',
  emi: 'roi',
}
