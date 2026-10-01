import { useState } from 'react'
import { ShlokaCard } from '../components/ShlokaCard'
import { Voices } from '../components/Voices'
import { CallCard, CopyButton, PageHero, Section, TipGrid } from '../components/ui'
import { helplines } from '../data/helplines'
import { shlokaById } from '../data/shlokas'

const alwaysTell = [
  { icon: '📸', title: 'Someone asked for pics', body: 'Or sent you some. Or is threatening to leak some. Tell. Today.' },
  { icon: '✋', title: 'A touch felt wrong', body: 'Even if it was someone you know. Even if they’re family. Especially then.' },
  { icon: '😶', title: 'You’re being bullied', body: 'At school, online, in the group chat. It’s not “just a joke” if you’re not laughing.' },
  { icon: '💸', title: 'Money trouble', body: 'Got scammed, lost money gaming or betting, owe someone? It only gets bigger in the dark.' },
  { icon: '😈', title: 'Someone is threatening you', body: 'Blackmail only works while it’s a secret. The moment your parents know, the threat loses its power.' },
  { icon: '🌧️', title: 'You feel really low', body: 'Like nothing matters, or you think about hurting yourself. That’s not weakness — it’s a signal to get help.' },
  { icon: '🌀', title: 'A mistake is snowballing', body: 'Bad grade, broke something, crashed the scooty. Telling early = smaller fallout. Always.' },
  { icon: '🚩', title: 'Anyone says “don’t tell”', body: 'Safe people never ask you to keep secrets from your parents. That sentence IS the red flag.' },
]

const scripts = [
  { when: 'starting a hard talk', text: 'Mumma / Papa, I need to tell you something important. Can you promise to listen till the end before reacting?' },
  { when: 'you messed up', text: 'I made a mistake and I’m scared. I need your help more than a lecture right now — we can do the lecture later 😅' },
  { when: 'someone hurt you', text: 'Something happened that made me really uncomfortable and I don’t know what to do. Can we talk somewhere private?' },
  { when: 'you’re not okay', text: 'I haven’t been feeling okay for a while. I don’t need you to fix it, I just need you to know.' },
  { when: 'too scared to say it', text: 'I’m texting because saying it out loud is hard. Please read this when you’re calm, and then come talk to me.' },
]

const forParents = [
  { icon: '👂', title: 'Listen first', body: 'Don’t interrupt. Don’t react. Let them finish. The first 60 seconds decide if they ever tell you anything again.' },
  { icon: '🙏', title: 'Say “thank you for telling me”', body: 'Before anything else. Even if what they said scares you. Especially then.' },
  { icon: '🧯', title: 'Fix first, scold later (or never)', body: 'If they’re in danger, sort the danger. A punishment teaches them to hide it next time.' },
  { icon: '🫂', title: '“I’m on your side”', body: 'Say it out loud. Kids assume you’re angry unless you tell them otherwise.' },
]

export default function Fam() {
  const [tab, setTab] = useState<'kids' | 'parents'>('kids')
  return (
    <div className="page">
      <PageHero
        kicker="zone 09 · no secrets club"
        accent="cyan"
        emoji="🏠"
        title={
          <>
            no secrets that <span className="serif">hurt</span> you.
          </>
        }
        sub="Scammers, blackmailers, creeps and fake gurus all run on one thing: your silence. The moment you tell your parents, their power dies."
      >
        <div className="row gap-sm wrap" role="tablist" aria-label="Who are you?">
          <button type="button" role="tab" aria-selected={tab === 'kids'} className={`chip${tab === 'kids' ? ' on' : ''}`} onClick={() => setTab('kids')}>
            🧑 i’m the kid
          </button>
          <button type="button" role="tab" aria-selected={tab === 'parents'} className={`chip${tab === 'parents' ? ' on' : ''}`} onClick={() => setTab('parents')}>
            🧓 i’m the parent
          </button>
        </div>
      </PageHero>

      {tab === 'kids' ? (
        <>
          <Section kicker="always, always tell" title={<>8 things you should <span className="serif">never</span> hide</>}>
            <TipGrid tips={alwaysTell} accent="cyan" />
          </Section>

          <Section kicker="copy · paste · send" title={<>don’t know how to <span className="serif">start?</span></>} intro="Steal these. Say them out loud, or just send them as a text — that totally counts.">
            <div className="grid">
              {scripts.map((s) => (
                <article key={s.when} className="card script a-cyan">
                  <span className="sticker sticker-sm">{s.when}</span>
                  <p className="script-text">“{s.text}”</p>
                  <CopyButton text={s.text} label="copy text" />
                </article>
              ))}
            </div>
          </Section>

          <Section kicker="real talk" title={<>“but they’ll be <span className="serif">so</span> angry”</>}>
            <div className="card soft-card a-cyan">
              <p className="big-line">Maybe for an hour. Then they’ll help. That’s the deal.</p>
              <p>
                Parents get angry because they get scared. Underneath the shouting is “what if something happened to my child?” Your parents have dealt with exams, bosses, bills, heartbreak and relatives. Whatever you’re carrying — they can carry it with you. Hiding it means you’re carrying it alone.
              </p>
            </div>
          </Section>
        </>
      ) : (
        <Section kicker="for parents" title={<>how to be the parent they <span className="serif">tell</span></>} intro="Kids don’t hide things from parents they trust. They hide things from parents they fear. Here’s the difference.">
          <TipGrid tips={forParents} accent="cyan" />
        </Section>
      )}

      <Section kicker="if home isn’t safe" title={<>tell <span className="serif">someone</span> safe.</>} intro="Not every home is safe, and that’s never your fault. Tell a teacher, a school counsellor, a relative you trust — or call.">
        <div className="call-grid">
          <CallCard line={helplines.child} accent="cyan" big />
          <CallCard line={helplines.mind} accent="violet" />
          <CallCard line={helplines.womenSupport} accent="pink" />
          <CallCard line={helplines.emergency} accent="orange" />
        </div>
      </Section>

      <Section kicker="old wisdom" title={<>truth wins. <span className="serif">always has.</span></>}>
        <div className="grid grid-2">
          <ShlokaCard shloka={shlokaById('mundaka-satyameva')} accent="cyan" />
          <ShlokaCard shloka={shlokaById('taittiriya-matru')} accent="sun" />
        </div>
        <Voices theme="parents" />
        <Voices theme="truth" />
      </Section>
    </div>
  )
}
