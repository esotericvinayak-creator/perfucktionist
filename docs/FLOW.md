# App flow

Four tabs, always visible: **Today · Explore · Library · Me**. Everything else is one or two taps from one of them.

```mermaid
flowchart TD
    A([Open the app]) --> B{First visit?}
    B -- yes --> O1[Welcome: perfection is a scam] --> O2[Your name] --> O3[Pick up to 3 goals] --> O4[Name your buddy] --> F1
    B -- no --> T[Today]

    subgraph TODAY [Today tab]
      T --> F1[▶ Your 5 minutes]
      F1 --> F2[Mood: 1 tap] --> F3[One small thing<br/>picked from mood + goals] --> F4[Today's line<br/>any faith] --> F5[Done 🔥 streak +1, buddy grows]
      F5 --> T
      T --> L[Listen<br/>quotes read aloud + music, auto-advance]
      T --> R[Read<br/>10 posts on depression & adversity]
      T --> P[Your plan<br/>guided journey, day N]
      T --> FY[For you<br/>tools for your goals]
      T --> SOS[Need help now?<br/>panic · safe walk · SOS · 14416]
      T --> WHY[Why this app exists<br/>8 beliefs]
    end

    subgraph EXPLORE [Explore tab]
      E[Search + I'm feeling… chips] --> AR[10 areas]
      AR --> Calm & Focus & Body & Money & Safety & People & Grow & Faith & ReadA[Read] & ListenA[Listen]
      Calm --> G[Guides: long pages] 
      Calm --> TL[Tools: 60 one-screen tools]
      ListenA --> M[Vibe room: FULL songs + 30s previews + playlists]
    end

    subgraph LIB [Library tab]
      LB[6 scriptures, 1.2 lakh verses] --> RD[Reader: original + EN/हिं + audio]
    end

    subgraph ME [Me tab]
      MB[Buddy · streak · XP] --> BD[Badges · heatmap · Wrapped]
      MB --> ST[Settings: theme, goals]
      MB --> PL[Plus: 4 reasons, 7-day trial]
    end

    T -. tab bar .-> E
    T -. tab bar .-> LB
    T -. tab bar .-> MB
    TL -- up next --> TL
    P --> J[Journey day screen]
```

| Where | What lives there |
|---|---|
| **Today** `#/` | 5-minute daily flow, today's one task, Listen, Read, your plan, tools for your goals, SOS, why this app exists |
| **Explore** `#/explore` | Search, need chips, 10 areas → guides + tools |
| **Library** `#/library` | Gita, Ramayana, Guru Granth Sahib, Quran, Bible, Dhammapada |
| **Me** `#/me` | Buddy, streak, badges, insights, settings, Plus |
| Listen `#/listen` | Hands-free mixes: quote → music → next quote |
| Read `#/read` | Blog posts; `#/read/<slug>` for one post |
| Tools `#/tools/<id>` | Any of the 60 tools, with "up next" handoffs |
