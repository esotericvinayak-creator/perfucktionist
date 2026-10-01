import { FakeCall, ShareLocation, Siren } from '../components/SafetyTools'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { CallCard, Callout, PageHero, Section, TipGrid } from '../components/ui'
import { helplines } from '../data/helplines'
import { shlokaById } from '../data/shlokas'
import { scrollToId } from '../lib/router'

const moves = [
  {
    name: 'Voice + fence stance',
    when: 'Someone is getting too close',
    steps: ['Feet shoulder-width, one foot slightly back.', 'Hands up at chest height, palms open — like you’re saying “stop”. This protects your face and looks non-aggressive to witnesses.', 'YELL from your belly: “BACK OFF!” or “PEECHE HATO!” Loud is a weapon. It shocks them and pulls in help.'],
    tip: 'Most attackers want an easy, quiet target. Being loud already makes you neither.',
  },
  {
    name: 'Palm heel strike',
    when: 'They’re in front of you and won’t back off',
    steps: ['Bend your wrist back and keep fingers curled — you hit with the hard heel of your palm.', 'Drive it upward into the nose or under the chin, pushing off your back foot.', 'Strike, then immediately RUN toward people and light.'],
    tip: 'Safer than a punch — you won’t break your fingers.',
  },
  {
    name: 'Wrist grab escape',
    when: 'They grab your wrist',
    steps: ['Find their thumb — it’s the weakest part of any grip.', 'Rotate your wrist toward their thumb and rip your arm out sharply, pulling toward your own body.', 'If both hands are holding you, grab your own fist with your free hand and yank up through the thumbs.'],
    tip: 'Don’t pull against their four fingers. Always go through the thumb gap.',
  },
  {
    name: 'Knee to the groin',
    when: 'They’re close in front of you',
    steps: ['Grab their shoulders or shirt to pull them toward you.', 'Drive your knee straight up hard.', 'Shove them away and run.'],
    tip: 'Pulling them in while you knee doubles the force.',
  },
  {
    name: 'Bear hug from behind',
    when: 'Someone grabs you from behind',
    steps: ['Drop your weight — bend your knees so you’re heavy and hard to lift.', 'Stomp hard on their foot (the top of the foot / instep).', 'Throw elbows back into their ribs or face. Head-butt backward if your arms are pinned.', 'The second the grip loosens — turn, push, run.'],
    tip: 'Dead weight is surprisingly hard to carry away.',
  },
  {
    name: 'Hair grab',
    when: 'They grab your hair',
    steps: ['Clamp both your hands on top of their hand and press it to your head — this cuts the pain.', 'Step in toward them (not away) and strike with knee or kick.', 'Twist out toward their thumb side and run.'],
    tip: 'Pulling away rips your hair. Stepping in takes their leverage.',
  },
  {
    name: 'Pinned on the ground',
    when: 'You’ve been knocked down',
    steps: ['Stay on your back, knees up, feet between you and them.', 'Kick hard at knees and shins every time they come close.', 'Get up when there’s space: one hand on the ground behind you, one hand guarding your face, step back and rise.'],
    tip: 'From the ground your legs are stronger than their arms. Use them.',
  },
]

const streetSmart = [
  { icon: '🧠', title: 'Trust the gut feeling', body: 'That weird feeling is your brain spotting danger before you can explain it. You don’t owe anyone politeness. Leave.' },
  { icon: '📍', title: 'Live location on', body: 'Share live location with a parent or friend whenever you’re travelling alone, especially at night.' },
  { icon: '🚕', title: 'Cab check', body: 'Match the number plate before getting in. Sit in the back. Share the trip. Check that the child lock is off.' },
  { icon: '🎧', title: 'One earbud out', body: 'On empty roads keep one ear free. Walk like you know exactly where you’re going.' },
  { icon: '🍹', title: 'Guard your drink', body: 'Never leave it unattended. Never accept an open drink you didn’t watch being made.' },
  { icon: '🍍', title: 'Family code word', body: 'Pick a silly word with your parents. If you text it, they call you and come get you — no questions asked, no scolding.' },
  { icon: '🔋', title: 'Phone at 50%+', body: 'Carry a power bank. A dead phone is the worst kind of alone.' },
  { icon: '🌶️', title: 'Pepper spray', body: 'Legal to carry for self-defence in India. Keep it in your hand, not buried in your bag.' },
]

const online = [
  { icon: '🔐', title: 'OTP & passwords = nobody', body: 'Not your boyfriend, not your best friend, not “customer care”. Turn on two-step verification everywhere.' },
  { icon: '🕵️', title: 'Lock your profile', body: 'Private account, hide your school and location, and don’t post live where you are — post after you leave.' },
  { icon: '📸', title: 'Being blackmailed with pics?', body: 'Don’t pay. Don’t delete the chats. Screenshot everything, block, and report at cybercrime.gov.in or call 1930. Tell a parent today.' },
  { icon: '🧯', title: 'Get images taken down', body: 'StopNCII.org helps remove intimate images from Instagram, Facebook, TikTok, Reddit & more — without anyone seeing them.' },
  { icon: '🤖', title: 'Deepfakes are a crime too', body: 'Morphed or AI-made images of you? It’s not your fault and it is reportable. Same steps: screenshot, report, tell.' },
  { icon: '🚩', title: '“Don’t tell your parents”', body: 'The moment anyone online says this, you know exactly who the bad guy is. Tell them immediately.' },
]

export default function Shield() {
  return (
    <div className="page">
      <PageHero
        kicker="zone 02 · shield · for her"
        accent="pink"
        emoji="🛡️"
        title={
          <>
            your safety &gt; <span className="serif">everyone’s</span> comfort
          </>
        }
        sub="Self-defence moves, safety tools that live in your browser, and the rights nobody teaches you. Boys — read this too. Then be the reason she feels safe."
      >
        <div className="row gap wrap">
          <a className="btn btn-primary a-pink" href="tel:112">
            📞 call 112 now
          </a>
          <button type="button" className="btn" onClick={() => scrollToId('tools')}>
            SOS tools ↓
          </button>
        </div>
      </PageHero>

      <Section kicker="save these numbers" title={<>helplines that <span className="serif">actually</span> pick up</>} intro="All free. All 24×7. Tap to call.">
        <div className="call-grid">
          <CallCard line={helplines.emergency} accent="pink" big />
          <CallCard line={helplines.women} accent="pink" />
          <CallCard line={helplines.womenSupport} accent="violet" />
          <CallCard line={helplines.ncw} accent="violet" />
          <CallCard line={helplines.child} accent="cyan" />
          <CallCard line={helplines.cyber} accent="sun" />
        </div>
        <Callout accent="pink" icon="📱">
          Install the government <b>112 India</b> app — it has a SHOUT button that alerts nearby volunteers and police. On most phones, pressing the power button 5 times also triggers emergency SOS.
        </Callout>
      </Section>

      <Section id="tools" kicker="sos tools" title={<>three buttons that can <span className="serif">save</span> you</>} intro="They run right here in your browser. Bookmark this page.">
        <div className="grid">
          <FakeCall />
          <Siren />
          <ShareLocation />
        </div>
      </Section>

      <Section kicker="self-defence 101" title={<>the goal isn’t to win. <span className="serif">it’s to run.</span></>} intro="Every move here exists to buy you 3 seconds to escape. Read them, then practise them with a friend — slowly, safely.">
        <div className="moves">
          {moves.map((m, i) => (
            <details key={m.name} className="move" open={i === 0}>
              <summary>
                <span className="move-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="move-name">
                  {m.name}
                  <small>{m.when}</small>
                </span>
                <span className="move-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <ol>
                {m.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="move-tip">💡 {m.tip}</p>
            </details>
          ))}
        </div>
        <Callout accent="sun" icon="🥋">
          Reading isn’t training. Many state police departments and colleges run <b>free self-defence workshops for women</b> — ask at your local police station or college. Muscle memory is what works under panic.
        </Callout>
      </Section>

      <Section kicker="street smart" title={<>awareness is the <span className="serif">first</span> move</>}>
        <TipGrid tips={streetSmart} accent="pink" />
      </Section>

      <Section kicker="online safety" title={<>your phone is a <span className="serif">door</span>. lock it.</>}>
        <TipGrid tips={online} accent="violet" />
      </Section>

      <Section kicker="if something happened" title={<>it is <span className="hl">never</span> your fault.</>} accent="pink">
        <div className="card soft-card a-pink">
          <p className="big-line">Not your clothes. Not the time. Not where you were. Not who you were with. Never.</p>
          <ol className="rights">
            <li>
              <b>Get somewhere safe</b> and call 112 or someone you trust. You don’t have to be calm. You don’t have to have the words.
            </li>
            <li>
              <b>Zero FIR:</b> you can file a complaint at <i>any</i> police station, no matter where it happened. They cannot send you away.
            </li>
            <li>
              <b>Free medical care:</b> every hospital — government or private — must give survivors first aid and treatment for free. It’s the law.
            </li>
            <li>
              <b>Evidence, if you can:</b> try not to bathe or change clothes before the medical exam. But your wellbeing comes first — always.
            </li>
            <li>
              <b>A woman officer:</b> you can ask for your statement to be recorded by a woman officer.
            </li>
            <li>
              <b>Your identity is protected</b> by law. Nobody is allowed to publish your name.
            </li>
            <li>
              <b>One Stop Centre (Sakhi):</b> call 181 — medical, legal, police help and counselling under one roof.
            </li>
            <li>
              <b>Tell your parents.</b> They would rather know. They would rather help. <a href="#/fam">Here’s how to start that talk →</a>
            </li>
          </ol>
        </div>
      </Section>

      <Section kicker="for the younger ones" title={<>your body. <span className="serif">your rules.</span></>}>
        <TipGrid
          accent="cyan"
          tips={[
            { icon: '✋', title: 'You can say NO', body: 'To anyone. Even family. Even elders. Even if it feels rude. Your body belongs to you.' },
            { icon: '🙈', title: 'Safe vs unsafe touch', body: 'If a touch makes you feel scared, confused or yucky — it’s unsafe. Places covered by your swimsuit are private.' },
            { icon: '🤫', title: 'No secret touches', body: 'Surprises (like a birthday gift) are okay. Secrets about touching are NEVER okay. Tell mumma, papa or a teacher.' },
            { icon: '📞', title: 'Keep telling', body: 'If the first grown-up doesn’t listen, tell another one. And another. Or call 1098.' },
          ]}
        />
      </Section>

      <Section kicker="the shakti is yours" title={<>she was never <span className="serif">weak.</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('ya-devi')} accent="pink" />
          <ShlokaCard shloka={shlokaById('gita-6-5')} accent="violet" />
        </div>
        <Voices theme="women" />
      </Section>
    </div>
  )
}
