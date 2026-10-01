import type { Accent } from './zones'
import { traditions, wisdom, type Tradition } from './wisdom'

export type JourneyDay = { title: string; task: string; path?: string; wisdomId?: string }
export type Journey = { id: string; emoji: string; title: string; pitch: string; accent: Accent; days: JourneyDay[] }

/** Free members get the first FREE_DAYS of every journey. */
export const FREE_DAYS = 3

const GITA_CHAPTERS: [string, string][] = [
  ['Arjun Viṣhād Yog', 'Arjuna’s Dilemma'],
  ['Sānkhya Yog', 'Transcendental Knowledge'],
  ['Karm Yog', 'Path of Selfless Service'],
  ['Jñāna Karm Sanyās Yog', 'Knowledge and the Discipline of Action'],
  ['Karm Sanyās Yog', 'Path of Renunciation'],
  ['Dhyān Yog', 'Path of Meditation'],
  ['Jñāna Vijñāna Yog', 'Self-Knowledge and Enlightenment'],
  ['Akṣhar Brahma Yog', 'Path of the Eternal'],
  ['Rāja Vidyā Yog', 'The King of Sciences'],
  ['Vibhūti Yog', 'The Infinite Glories of God'],
  ['Viśhwarūp Darśhan Yog', 'The Cosmic Form'],
  ['Bhakti Yog', 'The Yoga of Devotion'],
  ['Kṣhetra Kṣhetrajña Vibhāg Yog', 'The Field and the Knower'],
  ['Guṇa Traya Vibhāg Yog', 'The Three Modes of Nature'],
  ['Puruṣhottam Yog', 'The Supreme Person'],
  ['Daivāsura Sampad Vibhāg Yog', 'Divine and Demonic Natures'],
  ['Śhraddhā Traya Vibhāg Yog', 'The Three Kinds of Faith'],
  ['Mokṣha Sanyās Yog', 'Freedom through Letting Go'],
]

const FAITH_ORDER: Tradition[] = ['hindu', 'sikh', 'islam', 'christian', 'jewish', 'buddhist', 'jain', 'taoist', 'confucian', 'stoic', 'zoroastrian', 'bahai']
const REFLECT = [
  'Where did you see this idea in your own life this week?',
  'Who is someone who lives like this? Text them.',
  'What would change if you believed this for one day?',
  'Write one sentence about it in your notes app.',
]

export const journeys: Journey[] = [
  {
    id: 'unperfect-21',
    emoji: '🫠',
    title: '21 days unperfect',
    pitch: 'Unlearn perfectionism one tiny, slightly-scary action at a time.',
    accent: 'lime',
    days: [
      { title: 'Send it raw', task: 'Send one text today without rereading it. Just hit send.' },
      { title: 'No filter', task: 'Post (or send a friend) a photo with zero filters and zero retakes.' },
      { title: 'The 70% rule', task: 'Finish one thing at 70% and submit it. Homework, a reel, a sketch — anything.', path: '/unperfect' },
      { title: 'Ugly first draft', task: 'Spend 10 minutes on the thing you’ve been avoiding. You’re not allowed to delete anything.' },
      { title: '“I don’t know”', task: 'Say “I don’t know” in a conversation today without apologising for it.' },
      { title: 'Clean the feed', task: 'Unfollow 3 accounts that make you feel like you’re not enough.' },
      { title: 'Unearned rest', task: 'Rest for 20 minutes without finishing anything first. Zero guilt.', path: '/breathe' },
      { title: 'Dumb question', task: 'Ask one “dumb” question out loud — in class, at work, at home.' },
      { title: 'Too much', task: 'Wear the outfit you usually think is “too much”.' },
      { title: 'Mismatched socks', task: 'Make one harmless mistake on purpose. Notice that nobody actually cares.' },
      { title: 'No “but”', task: 'Write 3 things you did well this week. You are not allowed to add a “but”.' },
      { title: 'Leave it', task: 'Leave one small task unfinished on purpose. Watch the world not end.' },
      { title: 'Be bad at it', task: 'Try something new for 15 minutes that you will definitely be bad at.' },
      { title: 'Show the draft', task: 'Show a friend something you’re working on before it’s “ready”.' },
      { title: 'Could, not should', task: 'Replace every “I should” with “I could” today. Feel the pressure drop.' },
      { title: 'Two minutes', task: 'Do 2 minutes of the thing you’ve procrastinated longest. Only 2.' },
      { title: 'Mirror hype', task: 'Compliment yourself in the mirror. Out loud. Cringe is allowed.' },
      { title: 'No disclaimer', task: 'Share something you made without saying “it’s not that good but…”.' },
      { title: 'Bestie voice', task: 'Every time your inner critic talks today, ask: would I say this to my best friend?', path: '/unperfect' },
      { title: 'Full-sentence no', task: 'Say no to one thing without explaining yourself.' },
      { title: 'Letter to you', task: 'Write a note to future you: “You don’t have to be perfect to be loved.” Keep it somewhere you’ll see.' },
    ],
  },
  {
    id: 'calm-7',
    emoji: '🫁',
    title: '7 days of calm',
    pitch: 'A week of breathwork and tiny meditations. Your nervous system will thank you.',
    accent: 'violet',
    days: [
      { title: 'Box it', task: 'Do 3 rounds of box breathing with the orb.', path: '/breathe' },
      { title: 'The sigh', task: 'Every time you feel stressed today, do 5 physiological sighs.', path: '/breathe' },
      { title: 'Sleep switch', task: 'Do 4 rounds of 4·7·8 in bed tonight. See how far you get.', path: '/breathe' },
      { title: 'Just sit', task: 'Sit for 5 minutes with the meditation timer. Count breaths 1 to 10.', path: '/breathe' },
      { title: 'Left, right', task: 'Do 5 rounds of Anulom Vilom (alternate-nostril breathing).', path: '/breathe' },
      { title: 'Bee mode', task: 'Do 5 rounds of Bhramari. Notice the buzz in your head.', path: '/breathe' },
      { title: 'Phone-free walk', task: 'Sit for 10 minutes, then take a 10-minute walk without your phone.', path: '/breathe' },
    ],
  },
  {
    id: 'brave-14',
    emoji: '🦁',
    title: '14 days brave',
    pitch: 'A dare a day. Small brave acts build the big brave you.',
    accent: 'sun',
    days: [
      { title: 'Hand up', task: 'Ask the question everyone else is too scared to ask.' },
      { title: 'Just no', task: 'Say “no” to something without explaining why.' },
      { title: 'Go first', task: 'Apologise first in a fight you’ve been dragging.' },
      { title: 'Ask for help', task: 'Ask for help with something you’ve been pretending to understand.' },
      { title: 'New face', task: 'Introduce yourself to someone new.' },
      { title: 'Real answer', task: 'When someone asks “how are you?”, give the real answer.' },
      { title: 'Solo date', task: 'Eat alone at a café without your phone. Main character moment.' },
      { title: 'Send it', task: 'Send the message you’ve been drafting for weeks.' },
      { title: 'Bro, chill', task: 'Stand up for someone being teased — even a simple “bro, chill” counts.', path: '/brave' },
      { title: 'Tell the fam', task: 'Tell your parents one thing you’ve been hiding. Start small.', path: '/fam' },
      { title: 'Learn the moves', task: 'Read the self-defence moves and practise one slowly with a friend.', path: '/shield' },
      { title: 'Big goal', task: 'Write your scariest goal and 3 tiny steps in the goal smasher.', path: '/brave' },
      { title: 'Do step one', task: 'Hold your breath. Do step one of that goal. Exhale.', path: '/brave' },
      { title: 'Pay it forward', task: 'Dare someone else to do something brave. Be their hype-person.' },
    ],
  },
  {
    id: 'gita-18',
    emoji: '🕉️',
    title: '18 days of the Gita',
    pitch: 'One chapter a day. The whole Bhagavad Gita in under three weeks.',
    accent: 'orange',
    days: GITA_CHAPTERS.map(([name, meaning], i) => ({
      title: `Ch ${i + 1} · ${meaning}`,
      task: `Read chapter ${i + 1} (${name}) in the Library. Pick the one verse that hits hardest and make it a story card.`,
      path: `/library/gita/${i + 1}`,
    })),
  },
  {
    id: 'faiths-12',
    emoji: '🌍',
    title: 'Every faith in 12 days',
    pitch: 'Twelve traditions, twelve days. Find out how much humanity agrees on.',
    accent: 'cyan',
    days: FAITH_ORDER.map((t, i) => {
      const w = wisdom.find((x) => x.tradition === t && !x.themes.includes('golden')) ?? wisdom.find((x) => x.tradition === t)!
      return { title: `${traditions[t].emoji} ${traditions[t].label}`, task: `Read today’s voice below. ${REFLECT[i % REFLECT.length]}`, wisdomId: w.id }
    }),
  },
]

export const journeyById = (id: string) => journeys.find((j) => j.id === id)
