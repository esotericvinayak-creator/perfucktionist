# App flow

Four tabs: **Home · Scam Check · Get It Back · Leak Check**. Everything is open without an account. The person icon opens your account and settings. Every screen outside the tabs has a back button.

```mermaid
flowchart TD
    A([Open the app or website]) --> H[Home<br/>the three features · what you've saved · open claims]

    H --> S[Scam Check]
    S --> S1[Paste a message, offer or link] --> S2{Verdict}
    S2 -- looks like a scam --> S3[Each warning sign explained<br/>what to do · warn someone on WhatsApp]
    S2 -- be careful --> S3
    S2 -- no known signs --> S4[Says this doesn't prove it's safe]
    S3 -- already paid --> B

    H --> B[Get It Back]
    B --> B1[Pick what happened<br/>scam · failed UPI · wrong person · charged wrongly<br/>refund · coaching fees · deposit]
    B1 --> B2[A few questions]
    B2 --> B3[Your rights with sources · dated steps<br/>money owed for delays · letter to send]
    B3 --> B4[Save my dates] --> B5[Got it back?<br/>counts towards what you've saved]

    H --> L[Leak Check]
    L --> L1[Open a PDF statement, paste text,<br/>or see an example] --> L2[Read on the phone]
    L2 --> L3[Total leak · top 3 · where the money went]
    L3 -- the pass --> L4[Every leak · how to stop it<br/>double payments · one easy change]
    L4 -- double payment --> B1

    L3 --> P[The pass: ₹49 a month or ₹399 a year]
    P --> LI[Log in or sign up] --> PAY[Pay by UPI · send the 12-digit reference]
    PAY --> DB[(payments: pending)] --> VER[You match it in PhonePe history<br/>npm run pay -- verify ref]
    VER --> MEM[(memberships: until date)] --> ON[Pass unlocks on next open]
```

| Where | What lives there |
| --- | --- |
| Home `#/` | The three features, what you've saved, open claims, questions |
| Scam Check `#/scam` | Paste box, examples, verdict, what to do, warn someone |
| Get It Back `#/back` | Seven situations. `#/back/<id>` is one situation, `?claim=<id>` reopens a saved one |
| Leak Check `#/leak` | Statement reader and report |
| The pass `#/plus` | Pay by UPI, your payments |
| You `#/me` | Log in or out, theme, app version, delete account |
| Log in `#/login` | Sign up and log in. `?next=/plus` comes back to the pass |
| Shield `#/shield` | Safety: helplines, fake call, siren, send location, self-defence. Linked from the footer |
| Get the app `#/get` | APK and install help |
