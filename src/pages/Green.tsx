import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { Checklist, PageHero, Section, TipGrid } from '../components/ui'
import { shlokaById } from '../data/shlokas'
import { confettiFrom } from '../lib/confetti'
import { pop } from '../lib/sound'
import { log } from '../lib/progress'
import { useLocalState } from '../lib/storage'

const stages = [
  { emoji: '🌰', name: 'seed' },
  { emoji: '🌱', name: 'sprout' },
  { emoji: '🌿', name: 'sapling' },
  { emoji: '🪴', name: 'young plant' },
  { emoji: '🌳', name: 'tree' },
]
const DROPS_PER_STAGE = 3

const habits = [
  'Carry my own water bottle',
  'Carry a cloth bag, say no to plastic',
  'Plant a tree on every birthday',
  'Switch off fans & lights when leaving',
  'Take bus / metro / cycle when I can',
  'Separate wet & dry waste',
  'Fix leaking taps, take shorter showers',
  'Thrift, repair, reuse before buying new',
  'Never burn leaves or garbage',
  'Adopt one tree near home & water it',
]

function TreeGrower() {
  const [drops, setDrops] = useLocalState('tree-drops', 0)
  const [forest, setForest] = useLocalState('forest', 0)
  const stage = Math.min(stages.length - 1, Math.floor(drops / DROPS_PER_STAGE))
  const grown = stage === stages.length - 1
  const pct = grown ? 100 : ((drops % DROPS_PER_STAGE) / DROPS_PER_STAGE) * 100

  return (
    <div className="card grower a-lime">
      <div className="grower-stage">
        <span className="grower-emoji" key={stage} style={{ fontSize: `${4 + stage * 1.4}rem` }}>
          {stages[stage].emoji}
        </span>
        <span className="grower-ground" aria-hidden="true" />
      </div>
      <p className="grower-name">
        your {stages[stage].name} {grown ? 'is fully grown! 🎉' : ''}
      </p>
      {!grown && (
        <div className="meter-bar">
          <div className="meter-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="row gap-sm center wrap">
        {grown ? (
          <button
            type="button"
            className="btn btn-primary a-lime"
            onClick={(e) => {
              confettiFrom(e.currentTarget)
              setForest(forest + 1)
              setDrops(0)
            }}
          >
            🌳 add to my forest & plant another
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary a-cyan"
            onClick={() => {
              pop()
              setDrops(drops + 1)
              log('tree', { silent: true })
            }}
          >
            💧 water it
          </button>
        )}
      </div>
      <div className="forest" aria-label={`${forest} trees in your forest`}>
        {forest === 0 ? <span className="muted">your forest is empty — for now</span> : Array.from({ length: Math.min(forest, 60) }, (_, i) => <span key={i}>🌳</span>)}
        {forest > 60 && <span className="muted"> +{forest - 60}</span>}
      </div>
      <p className="muted">Virtual trees are cute. Real ones are cuter. Every 5 here = go plant 1 for real. 😉</p>
    </div>
  )
}

export default function Green() {
  const [pledged, setPledged] = useLocalState<Record<string, boolean>>('green-pledge', {})
  const count = habits.filter((h) => pledged[h]).length

  return (
    <div className="page">
      <PageHero
        kicker="zone 11 · save trees"
        accent="lime"
        emoji="🌳"
        title={
          <>
            trees &gt; <span className="serif">tantrums.</span>
          </>
        }
        sub="We’re the first generation to feel climate change and the last that can do something about it. No pressure. (Okay, some pressure.)"
      />

      <Section kicker="grow one" title={<>plant a tree, <span className="serif">right here</span></>}>
        <TreeGrower />
      </Section>

      <Section kicker="why trees" title={<>the planet’s <span className="serif">best</span> employees</>}>
        <TipGrid
          accent="lime"
          tips={[
            { icon: '💨', title: 'Free air purifiers', body: 'A mature tree soaks up around 20 kg of CO₂ every year and breathes out the oxygen you’re using right now.' },
            { icon: '🌡️', title: 'Natural AC', body: 'Tree-lined streets can be several degrees cooler in summer. Shade is the cheapest cooling on earth.' },
            { icon: '💧', title: 'Water savers', body: 'Roots hold soil together and help rainwater sink into the ground instead of flooding your street.' },
            { icon: '🐦', title: 'Housing for everyone', body: 'One big tree can be home to hundreds of birds, insects and squirrels. It’s a whole society.' },
            { icon: '🧠', title: 'Mental health boost', body: 'Time around trees and greenery is linked to less stress and better mood. Touch grass, literally.' },
            { icon: '🪔', title: 'We’ve always worshipped them', body: 'Peepal, banyan, tulsi, neem — Indian culture treated trees as sacred long before “eco-friendly” was a hashtag.' },
          ]}
        />
      </Section>

      <Section kicker="desi tree-huggers" title={<>they gave <span className="serif">everything</span> for trees</>}>
        <div className="grid grid-2">
          <article className="card story a-lime">
            <span className="sticker sticker-sm">1730 · Khejarli, Rajasthan</span>
            <h3>Amrita Devi Bishnoi</h3>
            <p>
              When soldiers came to cut the sacred Khejri trees, Amrita Devi hugged one and refused to move. She and <b>363 Bishnois</b> gave their lives protecting the forest. Her words: <i>“A chopped head is cheaper than a felled tree.”</i>
            </p>
          </article>
          <article className="card story a-sun">
            <span className="sticker sticker-sm">1973 · Uttarakhand</span>
            <h3>The Chipko Movement</h3>
            <p>
              “Chipko” means “to hug”. Village women led by people like <b>Gaura Devi</b> wrapped their arms around trees so contractors couldn’t cut them. It changed forest policy in India — and inspired the world.
            </p>
          </article>
        </div>
      </Section>

      <Section kicker="the pledge" title={<>10 tiny <span className="serif">green</span> habits</>} intro="Tick the ones you promise to do. Your pledge is saved on this device.">
        <div className="two-col">
          <Checklist items={habits} checked={pledged} onToggle={(h) => setPledged((p) => ({ ...p, [h]: !p[h] }))} accent="lime" />
          <div className="card meter a-lime" aria-live="polite">
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${(count / habits.length) * 100}%` }} />
            </div>
            <p className="meter-score">
              {count}/{habits.length}
            </p>
            <h3>{count === 0 ? 'Start with one 🌱' : count < 5 ? 'Sprouting nicely 🌿' : count < habits.length ? 'Certified tree-hugger 🌳' : 'Earth’s favourite child 🌍💚'}</h3>
            <p>
              Bonus: join <b>Ek Ped Maa Ke Naam</b> — plant a tree in your mother’s name. Two moms honoured, one move.
            </p>
          </div>
        </div>
      </Section>

      <Section kicker="the vedas called it" title={<>earth is <span className="serif">mom.</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('bhumi-mata')} accent="lime" />
          <ShlokaCard shloka={shlokaById('vasudhaiva')} accent="cyan" />
        </div>
        <Voices theme="earth" />
      </Section>
    </div>
  )
}
