# App flow

Three tabs once you're in: **Today · Discover · Me**. The Library and Listen/Read live under Discover. Everything else is one or two taps from one of them.

```mermaid
flowchart TD
    A([Open the app or website]) --> AW{Android browser?}
    AW -- yes --> DL[Landing + download the app<br/>APK via #/get · safety pages still open]
    AW -- no: APK, iPhone, computer --> S{Logged in?}
    S -- no --> W[Landing<br/>hero · try-it demo · how it works · hatch an egg<br/>promises · FAQ]
    W --> SU[Sign up: name → email → password → consent]
    W --> LI[Log in / forgot password]
    W -. no account needed .-> PUB[Panic SOS · safe-walk · Shield]
    SU --> O1
    LI --> H
    S -- yes --> NEW{Onboarded?}
    NEW -- no --> O1[Up to 3 goals] --> O2[Pick + name your pet 🥚] --> F1
    NEW -- yes --> H[Today]

    subgraph HOME [Today tab]
      H --> F1[▶ Your 5 minutes]
      F1 --> F2[Mood: 1 tap] --> F3[One small thing<br/>from mood + goals] --> F4[Today's line<br/>from your faith] --> F5[Done 🔥 pet fed, XP up<br/>optional: how are you now?]
      F5 --> H
      H --> PET[Your pet · XP to hatch / grow]
      H --> P[Your plan, once started]
      H --> TL1[Today's line]
      H --> MY[After day 1, one optional question at a time:<br/>name · faith · gender]
      H --> SOS[Need help now?]
    end

    subgraph LISTEN [Listen]
      L --> LQ[Quotes + music<br/>your tradition's mix first]
      L --> VR[Music reels<br/>autoplays · swipe right save · left skip]
    end

    MP[Mini player<br/>on every page] --> NP[Now Playing<br/>swipe art · seek · up next · credits · lyrics]
    VR --> NP

    subgraph EXPLORE [Discover tab]
      E[Search + I'm feeling… chips] --> HB[Feel better · Study · Listen · Read · Books & scripture]
      E --> Q[Quick tools, yours first]
      E --> AR[Everything else: 10 areas] --> G[Guides] & TL[44 tools, some are collections]
      HB --> L[Listen]
      HB --> R[Read: 10 posts]
      HB --> LB
    end

    subgraph LIB [Library, under Discover]
      LB[Library hub: 6 shelves] --> SC[School<br/>NCERT class 1–12]
      LB --> CO[College<br/>open textbooks + free courses]
      LB --> EX[Exams<br/>28 exams + practice]
      LB --> FA[Scripture<br/>your faith opens first] --> RD[Reader: original + EN/हिं + audio]
      LB --> FB[Free books<br/>search, read in-app]
      LB --> AB[Audiobooks<br/>chapters, speed control] --> NP
      LB --> SH[Your shelf<br/>saved books]
      EX --> PR[Practice: 10 questions<br/>answer + reason]
    end

    subgraph ME [Me tab]
      MB[Pet: type, name, outfits] --> BD[Streak · badges · insights · Wrapped]
      MB --> ST[Settings: account + sync status, app version + check for updates, theme, gender, faith, goals]
      ST --> DEL[Delete my account<br/>login + synced data gone]
      MB --> PL[Plus: price first]
    end

    subgraph PLUS [Plus: free trial or UPI]
      PL --> TR[Free trial: 7 days, once per device, no payment]
      PL --> PAY[Pay ₹399 / ₹49 on UPI<br/>QR code, UPI ID, or open-my-UPI-app link]
      PAY --> REF[Paste the 12-digit reference from the receipt]
      REF --> DB[(payments: pending)]
      DB --> VER[You match it in PhonePe history<br/>npm run pay -- verify ref]
      VER --> MEM[(memberships: until date)]
      MEM --> ON[App unlocks Plus on next open]
    end

    H -. tab bar .-> E
    H -. tab bar .-> MB
```

| Where | What lives there |
|---|---|
| Landing (logged out) | Hero, no-account demo, how it works, pet egg, promises, FAQ, sign up / log in |
| **Today** `#/` | Your pet, the 5-minute daily flow, today's line (your faith), your plan once started, SOS |
| **Discover** `#/explore` | Search, need chips, five hub cards (Feel better, Study, Listen, Read, Books & scripture), quick tools, 10 areas → guides + tools |
| Library `#/library` (under Discover) | Hub of six shelves: school, college, exams, scripture, free books, audiobooks |
| School `#/library/school` | 1,141 NCERT textbooks, class 1–12, 23 languages, with chapter lists |
| College `#/library/college` | 8 streams: OpenStax, LibreTexts, MIT OCW, NPTEL, SWAYAM |
| Exams `#/library/exams` | 28 exams + 360 practice questions across 12 subjects |
| Scripture `#/library/faith` | Gita, Ramayana, Guru Granth Sahib, Quran, Bible, Dhammapada — your faith's book first |
| Free books `#/library/read` | Open Library + Project Gutenberg, read inside the app |
| Audiobooks `#/library/listen` | LibriVox, with chapters and 0.75×–2× speed |
| **Me** `#/me` | Pet, streak, badges, insights, settings (with sync status), Plus, delete my account |
| Listen `#/listen` | Hands-free mixes: quote → music → next quote |
| Music reels `#/listen/reels` | A feed of songs that plays itself; saved songs row |
| Now Playing | Opens from the mini player on any page |
| Read `#/read` | Blog posts; `#/read/<slug>` for one post |
| Tools `#/tools/<id>` | Any tool; collections open on a tab (`#/tools/one-line`); "goes well with this" footer |

Every external link opens in the in-app viewer, never a new tab. Every screen outside the three tabs has a back button in the top bar.

## What gender and faith change

Only the **order** and **defaults**. Nothing is ever hidden.

| You picked | What comes first |
|---|---|
| Woman / girl | Shield spotlight; safe-walk, cycle tracker, emergency card, relationship check |
| Trans woman | Shield spotlight; safe-walk, emergency card, relationship check, boundary scripts |
| Man / boy | Bro code spotlight; workout, boundary scripts, friend check-ins, urge surfer |
| Trans man | Bro code spotlight; workout, cycle tracker, safe-walk, boundary scripts |
| Non-binary, transgender / third gender, genderfluid / queer, self-described | "Safety, your way" spotlight; safe-walk, emergency card, journal, boundary scripts |
| Prefer not to say / skipped | Your goals decide |
| A faith | Its quotes on Home and in a Listen mix, its scripture opens first in the Library |
| Atheist / agnostic | Philosophy (Stoic, Taoist, Confucian) instead of scripture on Home |
| Every faith / spiritual / something else / prefer not to say | Every tradition, mixed |
