// Real Faith polls: curated statements about practices, claims and red flags.
//
// Rules for adding one (the database only stores ids and answers, so wording lives here):
// - About a practice or a pattern, never a named person, group, temple, church, dargah or organisation.
// - Respectful of every faith. Critical only of exploitation: money, fear, secrecy, isolation, fake cures.
// - `id` is kebab-case, 3 to 40 characters. It is stored in the database, so never rename one.
// - `kind: 'seen'` asks "Has this happened to you or someone you know?", `kind: 'agree'` asks "Do you agree?".

export type PollKind = 'seen' | 'agree'
export type PollCategory = 'money' | 'family' | 'health' | 'online' | 'helps'
export type Statement = { id: string; category: PollCategory; kind: PollKind; text: string }

export const pollCategories: { id: PollCategory; label: string; emoji: string }[] = [
  { id: 'money', label: 'money & miracles', emoji: '💸' },
  { id: 'family', label: 'family & secrecy', emoji: '🏠' },
  { id: 'health', label: 'health', emoji: '🩺' },
  { id: 'online', label: 'online scams', emoji: '📲' },
  { id: 'helps', label: 'what helps', emoji: '🕯️' },
]

export const questionFor = (kind: PollKind) => (kind === 'seen' ? 'Has this happened to you or someone you know?' : 'Do you agree?')

export const statements: Statement[] = [
  // money & miracles
  { id: 'paid-to-remove-curse', category: 'money', kind: 'seen', text: 'Someone asked for money to “remove a curse” or guarantee a miracle.' },
  { id: 'fear-package-price', category: 'money', kind: 'seen', text: 'I was told something terrible would happen unless I paid for a special puja, ritual or prayer.' },
  { id: 'give-gold-to-double', category: 'money', kind: 'seen', text: 'A religious figure asked for gold, cash or property to be “blessed” or “multiplied”.' },
  { id: 'donation-pressure', category: 'money', kind: 'seen', text: 'I felt pressured to give more than I could afford to a religious cause.' },
  { id: 'faith-should-be-free', category: 'money', kind: 'agree', text: 'Real faith should be free to practise. A leaf, a flower, a prayer.' },

  // family & secrecy
  { id: 'told-to-keep-secret', category: 'family', kind: 'seen', text: 'A religious figure told me to keep something secret from my family.' },
  { id: 'cut-off-from-family', category: 'family', kind: 'seen', text: 'Someone said my family was “cursed” or “against God” to pull me away from them.' },
  { id: 'private-blessing-alone', category: 'family', kind: 'seen', text: 'I was asked to meet a religious figure alone for a “special blessing”.' },
  { id: 'anger-at-questions', category: 'family', kind: 'seen', text: 'Someone got angry or offended when I asked a respectful question about their claims.' },
  { id: 'questions-are-welcome', category: 'family', kind: 'agree', text: 'A good teacher welcomes questions, in any faith.' },

  // health
  { id: 'stop-medicine-for-ritual', category: 'health', kind: 'seen', text: 'I was told to stop medical treatment because of a ritual or prayer.' },
  { id: 'miracle-cure-claim', category: 'health', kind: 'seen', text: 'I heard someone claim holy water, ash or a taweez cured a serious illness.' },
  { id: 'prayer-with-doctor', category: 'health', kind: 'agree', text: 'Prayer can sit alongside medicine, but never replace it.' },
  { id: 'mental-health-as-possession', category: 'health', kind: 'seen', text: 'Anxiety, depression or panic was explained as “possession” or a curse instead of getting help.' },

  // online scams
  { id: 'love-problem-ad', category: 'online', kind: 'seen', text: 'I’ve seen a “love problem solution” or vashikaran ad and wondered if it was real.' },
  { id: 'fake-donation-link', category: 'online', kind: 'seen', text: 'I’ve seen a fake donation page, QR code or “prasad delivery” offer.' },
  { id: 'asked-for-otp-blessing', category: 'online', kind: 'seen', text: 'Someone asked for my photos, OTP or UPI details for a ritual or blessing.' },
  { id: 'astrologer-whatsapp-pitch', category: 'online', kind: 'seen', text: 'An “astrologer” messaged me out of the blue with a scary prediction and a fee to fix it.' },
  { id: 'check-official-site', category: 'online', kind: 'agree', text: 'Before donating online, I should check that it’s the place’s official website or counter.' },

  // what helps
  { id: 'prayer-calms-me', category: 'helps', kind: 'agree', text: 'A prayer or faith practice helps me feel calmer.' },
  { id: 'faith-brings-family-closer', category: 'helps', kind: 'agree', text: 'My faith brings me closer to my family and community.' },
  { id: 'faith-and-doubt-coexist', category: 'helps', kind: 'agree', text: 'It’s okay to have faith and doubts at the same time.' },
  { id: 'serving-others-is-worship', category: 'helps', kind: 'agree', text: 'Helping someone in need counts as worship, whatever your religion.' },
  { id: 'telling-family-helps', category: 'helps', kind: 'agree', text: 'Telling a trusted adult or friend is the first thing to do when something feels off.' },
  { id: 'no-middleman-needed', category: 'helps', kind: 'agree', text: 'You don’t need a middleman to connect with the divine.' },
]

export const statementIds = new Set(statements.map((s) => s.id))
