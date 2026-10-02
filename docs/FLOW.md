# App flow

Four tabs once you're in: **Home · Explore · Library · Me**. Everything else is one or two taps from one of them.

```mermaid
flowchart TD
    A([Open the app]) --> S{Logged in?}
    S -- no --> W[Landing<br/>hero · real numbers · try-it demo · hatch an egg<br/>how it works · what's inside · FAQ]
    W --> SU[Sign up: name → email → password → consent]
    W --> LI[Log in / forgot password]
    W -. no account needed .-> PUB[Panic SOS · safe-walk · Shield]
    SU --> O1
    LI --> H
    S -- yes --> NEW{Onboarded?}
    NEW -- no --> O1[Name] --> O2[Gender · optional<br/>9 options] --> O3[Faith · optional<br/>15 options] --> O4[Up to 3 goals] --> O5[Pick + name your pet 🥚] --> F1
    NEW -- yes --> H[Home]

    subgraph HOME [Home tab]
      H --> F1[▶ Your 5 minutes]
      F1 --> F2[Mood: 1 tap] --> F3[One small thing<br/>from mood + goals] --> F4[Today's line<br/>from your faith] --> F5[Done 🔥 pet fed, XP up]
      F5 --> H
      H --> PET[Your pet · XP to hatch / grow]
      H --> SP[For you first<br/>spotlight by gender]
      H --> P[Your plan: journey day N]
      H --> FY[Tools for you<br/>gender priorities + goals]
      H --> L[Listen]
      H --> R[Read: 10 posts]
      H --> SOS[Need help now?]
    end

    subgraph LISTEN [Listen]
      L --> LQ[Quotes + music<br/>your tradition's mix first]
      L --> VR[Vibe room<br/>swipe right save · left skip · tap play]
    end

    MP[Mini player<br/>on every page] --> NP[Now Playing<br/>swipe art · seek · up next · credits · lyrics]
    VR --> NP

    subgraph EXPLORE [Explore tab]
      E[Search + I'm feeling… chips] --> Q[Quick picks, yours first]
      E --> AR[10 areas] --> G[Guides] & TL[60 tools]
    end

    subgraph LIB [Library tab]
      LB[Your faith's scripture opens first<br/>faith picker on the page] --> RD[Reader: original + EN/हिं + audio]
    end

    subgraph ME [Me tab]
      MB[Pet: type, name, outfits] --> BD[Streak · badges · insights · Wrapped]
      MB --> ST[Settings: account, theme, gender, faith, goals]
      MB --> PL[Plus: 4 reasons, 7-day trial]
    end

    H -. tab bar .-> E
    H -. tab bar .-> LB
    H -. tab bar .-> MB
```

| Where | What lives there |
|---|---|
| Landing (logged out) | Hero, real numbers, no-account demo, pet egg, how it works, what's inside, promises, FAQ, sign up / log in |
| **Home** `#/` | 5-minute daily flow, your pet, spotlight, plan, tools for you, Listen, Read, today's wisdom (your faith), SOS |
| **Explore** `#/explore` | Search, need chips, quick picks, 10 areas → guides + tools |
| **Library** `#/library` | Gita, Ramayana, Guru Granth Sahib, Quran, Bible, Dhammapada — your faith's book first |
| **Me** `#/me` | Pet, streak, badges, insights, settings, Plus |
| Listen `#/listen` | Hands-free mixes: quote → music → next quote |
| Vibe room `#/listen/vibe` | Swipe deck of songs; saved songs row |
| Now Playing | Opens from the mini player on any page |
| Read `#/read` | Blog posts; `#/read/<slug>` for one post |
| Tools `#/tools/<id>` | Any of the 60 tools, with "up next" handoffs |

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
