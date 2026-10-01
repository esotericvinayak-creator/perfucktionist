import { useState } from 'react'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { CallCard, Checklist, PageHero, Section, TipGrid } from '../components/ui'
import { helplines } from '../data/helplines'
import { shlokaById } from '../data/shlokas'

const redFlags = [
  'Asks for big money, gold or property to “remove dosh” or bring a miracle',
  'Says a puja or ritual will cure a disease — or tells you to stop medicines',
  'Asks you to keep it secret from your family',
  'Wants to meet you alone for a “special blessing”',
  'Scares you: “something terrible will happen if you don’t…”',
  'Claims to be God, or to have direct powers no one can question',
  'Gets angry when you ask questions or want proof',
  'Asks for your photos, OTP, bank or UPI details',
  'Found you through an Instagram / WhatsApp ad for “love problem solution”',
  'Their lifestyle is luxury, paid for by “devotees”',
]

const scams = [
  { icon: '💍', title: '“Love problem” specialists', body: 'Vashikaran babas, amils, “love spell” ads — all promise to get your ex back or control someone. Advance money, then “one final ritual”, then blackmail.' },
  { icon: '🧿', title: 'Fear packages', body: 'Kaal sarp dosh, “nazar”, generational curses — “just ₹51,000 to fix it”. Fear is the product, in every religion’s costume.' },
  { icon: '💊', title: 'Miracle cures', body: 'Holy water, taweez, ash, “healing crusades” that cure cancer or infertility. Never, ever stop medical treatment for any ritual or prayer meeting.' },
  { icon: '🌱', title: '“Sow a seed” & money doubling', body: '“Give ₹10,000 and God returns it 100×” or “bring your gold, we’ll double it”. The only thing that multiplies is their bank balance.' },
  { icon: '📲', title: 'Fake online puja, chadar & donations', body: 'Fake temple, dargah and church donation pages, QR codes and “prasad delivery”. Only give through the official website or counter.' },
  { icon: '🌑', title: '“Black magic” & “possession”', body: 'Tantriks, amils and “deliverance” scammers say a relative cursed you. The goal is to cut you off from the people who could warn you.' },
]

const realVsFake = [
  ['Makes you calmer, kinder, braver', 'Makes you scared and anxious'],
  ['Welcomes your questions', 'Gets angry at questions'],
  ['Free — a leaf, a flower, water', 'Has a price list'],
  ['Brings you closer to family', 'Pulls you away from family'],
  ['Teaches you to stand on your own', 'Makes you dependent on them'],
  ['Says “the divine is within you”', 'Says “only I can reach God for you”'],
]

const dohas = [
  {
    hindi: 'कस्तूरी कुंडल बसै, मृग ढूँढै बन माहि ।\nऐसे घटि घटि राम हैं, दुनिया देखै नाहि ॥',
    roman: 'kastūrī kunḍal basai, mṛig ḍhūnḍhai ban māhi\naise ghaṭi ghaṭi rām haiṁ, duniyā dekhai nāhi',
    meaning: 'The musk is inside the deer, but it runs around the forest searching for the smell. God is inside every heart — but the world never looks there.',
  },
  {
    hindi: 'मोको कहाँ ढूँढे रे बन्दे, मैं तो तेरे पास में ।\nना मैं देवल ना मैं मसजिद, ना काबे कैलास में ॥',
    roman: 'moko kahāṁ ḍhūnḍhe re bande, maiṁ to tere pās meṁ\nnā maiṁ deval nā maiṁ masjid, nā kābe kailās meṁ',
    meaning: 'Where are you searching for me, friend? I’m right beside you. Not in the temple, not in the mosque, not in Kaaba or Kailash.',
  },
  {
    hindi: 'पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय ।\nढाई आखर प्रेम का, पढ़े सो पंडित होय ॥',
    roman: 'pothī paṛhi paṛhi jag muā, paṇḍit bhayā na koy\nḍhāī ākhar prem kā, paṛhe so paṇḍit hoy',
    meaning: 'The world died reading holy books and no one became wise. Whoever reads the two-and-a-half letters of “love” (प्रेम) — they are the true scholar.',
  },
]

export default function Faith() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const score = Object.values(checked).filter(Boolean).length
  const verdict =
    score === 0
      ? { title: 'No flags ticked ✅', body: 'Looks okay so far. Keep your brain switched on and your family in the loop.' }
      : score <= 2
        ? { title: 'Sus 👀', body: 'Something’s off. Ask hard questions, don’t pay anything yet, and talk to your family before going back.' }
        : { title: 'RUN 🚩🚩🚩', body: 'This matches a scam pattern. Stop contact, don’t pay, keep screenshots, tell your family and report it.' }

  return (
    <div className="page">
      <PageHero
        kicker="zone 10 · real faith"
        accent="orange"
        emoji="🙏"
        title={
          <>
            god doesn’t need your <span className="serif">UPI.</span>
          </>
        }
        sub="This isn’t anti-religion — any religion. It’s anti-scam. Babas, peers, pastors, tantriks: the costume changes, the con doesn’t. Real faith makes you free, fearless and kind. Fake gurus make you scared, dependent and broke."
      />

      <Section kicker="quick check" title={<>the <span className="serif">baba-meter</span></>} intro="Thinking about someone who claims spiritual powers? Tick what applies.">
        <div className="two-col">
          <Checklist items={redFlags} checked={checked} onToggle={(s) => setChecked((c) => ({ ...c, [s]: !c[s] }))} accent="orange" />
          <div className={`card meter a-${score > 2 ? 'pink' : 'orange'}`} aria-live="polite">
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${Math.min(100, (score / 3) * 100)}%` }} />
            </div>
            <p className="meter-score">{score} 🚩</p>
            <h3>{verdict.title}</h3>
            <p>{verdict.body}</p>
          </div>
        </div>
      </Section>

      <Section kicker="know the scripts" title={<>same scam, <span className="serif">different robes</span></>}>
        <TipGrid tips={scams} accent="orange" />
      </Section>

      <Section kicker="spot the difference" title={<>real faith vs <span className="serif">fake guru</span></>}>
        <div className="compare">
          <div className="compare-head a-lime">✅ real spirituality</div>
          <div className="compare-head a-pink">🚩 fake guru</div>
          {realVsFake.map(([real, fake]) => (
            <div key={real} className="compare-row">
              <span>{real}</span>
              <span>{fake}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="what every scripture actually says" title={<>no middlemen. <span className="serif">no fees.</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('gita-9-26')} accent="orange" />
          <ShlokaCard shloka={shlokaById('brihad-asato')} accent="sun" />
        </div>
        <Voices theme="middlemen" intro="Krishna, Guru Nanak, the Quran, Jesus and the Buddha all warned you about the same people." />
      </Section>

      <Section kicker="kabir said it 600 years ago" title={<>the divine is <span className="serif">inside</span> you</>} intro="Sant Kabir roasted fake religion harder than any meme page. These dohas are in old Hindi.">
        <div className="grid">
          {dohas.map((d) => (
            <article key={d.roman} className="card shloka a-violet">
              <span className="sticker sticker-sm">Sant Kabir</span>
              <p className="deva" lang="hi">
                {d.hindi}
              </p>
              <p className="roman">{d.roman}</p>
              <p className="meaning">{d.meaning}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="already caught in one?" title={<>it’s not your fault. <span className="serif">get out.</span></>}>
        <TipGrid
          accent="pink"
          tips={[
            { icon: '🛑', title: 'Stop paying', body: 'Every “final” payment is followed by another. There is no last ritual.' },
            { icon: '📸', title: 'Keep evidence', body: 'Screenshots of chats, payment receipts, numbers, ads. Don’t delete anything.' },
            { icon: '🏠', title: 'Tell your family', body: 'Scammers need you isolated. Telling family breaks the spell instantly.' },
            { icon: '🚔', title: 'Report it', body: 'Call 112, or 1930 for online fraud. Maharashtra and Karnataka even have special anti-superstition laws.' },
          ]}
        />
        <div className="call-grid">
          <CallCard line={helplines.cyber} accent="orange" big />
          <CallCard line={helplines.emergency} accent="pink" />
        </div>
      </Section>
    </div>
  )
}
