// Blog posts on depression & adversity. Written for Gen Z India, each safety-reviewed (no methods, no diagnoses, India helplines).
// Each post is plain data; src/pages/Read.tsx renders it.
export type Post = {
  slug: string
  title: string
  hook: string
  tags: string[]
  minutes: number
  cover: string // Icon name
  accent: string
  sections: { heading: string; paragraphs: string[] }[]
  actions: string[]
  tools: string[]
  helplineNote: string
}

export const posts: Post[] = [
  {
    "slug": "its-not-laziness-it-might-be-depression",
    "title": "it's not laziness. it might be depression",
    "hook": "what depression actually feels like at 17-24, how it's different from a bad week, and where to get free help in india.",
    "tags": [
      "depression",
      "mental-health",
      "students",
      "getting-help",
      "india"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "the word nobody says out loud",
        "paragraphs": [
          "you've been lying in bed for two hours with your phone. not scrolling, exactly. just holding it. the assignment is due, the laptop is right there, and your body simply won't get up.",
          "and the story in your head is: i'm lazy. i'm wasting my parents' money. everyone else is managing.",
          "here's the thing a lot of 17-24 year olds in india never get told: that might not be laziness. it might be depression. and the difference matters, because you can't 'discipline' your way out of something that isn't a willpower problem."
        ]
      },
      {
        "heading": "it doesn't always look like sadness",
        "paragraphs": [
          "movies show depression as crying in the rain. for a lot of people it's much quieter and much weirder than that.",
          "numbness. you don't feel sad, you feel nothing. your favourite song plays and it's just sound. friends make plans and you can't find the part of you that used to want to go.",
          "irritability. small things make you snap. your mom asks 'khaana khaya?' and you're suddenly furious. then guilty. then more tired.",
          "sleep goes strange. some people can't sleep. a lot of young people sleep 11, 12 hours and still wake up exhausted, like sleep is a place to hide rather than rest.",
          "can't start anything. not 'don't want to'. can't. opening a textbook feels like lifting a cupboard. even replying to a text sits there for three days.",
          "and the body joins in: headaches, heaviness, no appetite or only junk, everything feels slow."
        ]
      },
      {
        "heading": "bad week vs. something more",
        "paragraphs": [
          "everyone has rough patches. a breakup, a bad result, hostel drama, a fight at home. that's not depression, that's being alive.",
          "a bad week has a shape. something caused it, it hurts, and slowly it loosens. you still laugh at a reel. you still want things, even if you're sad.",
          "depression tends to be flatter and longer. weeks, not days, where most days feel like this, where nothing is really 'causing' it anymore, where things you loved stopped mattering, where you feel like a burden to people.",
          "this isn't a checklist to diagnose yourself with, and we're not going to pretend it is. a doctor or psychologist can tell you what's actually going on. but if you read that and felt a small 'oh', that's worth taking seriously."
        ]
      },
      {
        "heading": "why 'bas thoda effort daal' doesn't work",
        "paragraphs": [
          "if you broke your leg, nobody would say 'just walk it off'. but when the thing that's hurt is your motivation and energy, everyone, including you, treats it like a character flaw.",
          "depression goes after the exact parts of you that would usually fix the problem: energy, hope, the ability to plan. telling someone to try harder is asking them to use the tool that's broken.",
          "so if you've been calling yourself lazy for months, try this reframe: lazy people enjoy not doing things. you're not enjoying any of this. that's a different situation."
        ]
      },
      {
        "heading": "what to do first",
        "paragraphs": [
          "you don't need a diagnosis to start. you need one small move.",
          "tell one human. not a family whatsapp group announcement. one friend, one cousin, one teacher. 'i've been feeling off for a while and i don't know why.' that's the whole sentence.",
          "shrink the day. not 'fix my life'. just: water, something to eat, five minutes outside, one message replied. a brain running on empty needs tiny, finishable things.",
          "stop measuring yourself against the version of you from before this started. that person had a full battery. you're on 15%. the plan has to change, not you.",
          "and please don't go searching for ways to 'test' if you're depressed online at 3am. go to a person instead."
        ]
      },
      {
        "heading": "getting help in india (yes, free options exist)",
        "paragraphs": [
          "money and 'log kya kahenge' are the two biggest walls. let's deal with both.",
          "tele-manas 14416 is a free government helpline, 24x7, in 20+ languages. you call, say you've been feeling low for weeks, and a trained counsellor talks to you. no referral, no cost, no one at home needs to know.",
          "icall (9152987821) and vandrevala foundation (1860 2662 345) are other free counselling lines run by trained people.",
          "if you're in college, check if there's a counsellor; many colleges have one and it's usually free. government hospitals have psychiatry OPDs too, and the cost is usually very low.",
          "if you can see a doctor, say exactly what's happening: sleep, energy, mood, how long. they've heard it before. they can tell you whether it's depression or something else, and what actually helps.",
          "therapy, medication, both, neither right now: that's a decision you make with a professional, not something a blog decides for you."
        ]
      },
      {
        "heading": "if it's gotten darker than this",
        "paragraphs": [
          "sometimes depression goes past 'nothing matters' to 'i don't want to be here'. if that's where you are, please know: that thought is something depression can do to a person's thinking. it is not a fact about your future, and it does not have to be carried alone.",
          "call tele-manas 14416 right now, or 112 if you're in immediate danger. if you're under 18, childline 1098. tell someone tonight, not next week.",
          "people get through this. not by being stronger, but by getting help and letting other people carry some of it. you're allowed to do that too."
        ]
      }
    ],
    "actions": [
      "send one person this exact message: 'been feeling off for a while, can we talk this week?'",
      "do the smallest version of one task (open the doc, don't write it) and log it in your done list",
      "save tele-manas 14416 in your phone contacts right now, so it's there if you ever need it"
    ],
    "tools": [
      "checkin",
      "done-list",
      "safety-plan"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7) | emergency 112 | under 18: Childline 1098 | iCall 9152987821",
    "cover": "bad-day",
    "accent": "violet"
  },
  {
    "slug": "how-to-tell-your-parents-you-are-not-okay",
    "title": "how to tell your parents you're not okay",
    "hook": "exact sentences to start with, what to do when they say \"sab ko hota hai\", and who else to tell if home isn't safe.",
    "tags": [
      "parents",
      "family",
      "talking about it",
      "depression",
      "indian homes",
      "asking for help"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "why this is so hard in an indian house",
        "paragraphs": [
          "In a lot of our homes, feelings are not a topic. Marks are. Rishtedaar are. \"I have been feeling empty for two months\" is not something anyone was taught to say or hear.",
          "Your parents probably grew up where \"mental health\" meant something scary and shameful, and \"log kya kahenge\" was a survival rule. So their first reaction often comes from fear, not from not caring.",
          "You also know what they spent on coaching, hostel, the EMI. Saying \"I'm not okay\" can feel like wasting their sacrifices. It is not, but it feels like it, so we say \"theek hoon\" and go back to our room.",
          "Bas, knowing this does not make it easy. It just means the awkwardness is not your fault, and not a reason to stay quiet."
        ]
      },
      {
        "heading": "pick the moment, not the perfect moment",
        "paragraphs": [
          "Do not try this at 11 pm after a result, mid-fight, or at the family dinner table. Pick a low-stakes, side-by-side moment: chai in the kitchen, a car ride, folding clothes. Side-by-side is easier than face-to-face.",
          "Start with one parent, usually the calmer one or the one who already noticed. You do not need to tell both at once.",
          "Decide what you want. To be heard? Permission to see a counsellor? A break from tuition? Knowing your ask means you will not freeze at \"toh ab kya karein?\"",
          "And lower the bar. The first conversation does not need them to fully understand. It just needs the topic to exist in the house now."
        ]
      },
      {
        "heading": "exact sentences to start with",
        "paragraphs": [
          "You do not need a speech, just one opening line and a little awkwardness. Steal these, mix them.",
          "\"Mummy, mujhe kuch baat karni hai, aur main chahta/chahti hoon ki aap pehle bas sun lo, solution baad mein.\" (Mom, I need to talk. Please just listen first, solutions later.)",
          "\"Papa, kaafi time se mujhe theek nahi lag raha. Sirf padhai ka stress nahi hai, andar se kuch heavy lagta hai.\" (Dad, I haven't felt okay for a while. It's not just study stress, something feels heavy inside.)",
          "\"I'm not telling you this to worry you. I'm telling you because I don't want to handle it alone anymore.\"",
          "\"Mujhe lagta hai mujhe kisi se baat karni chahiye, jaise counsellor ya doctor. Kya aap mere saath yeh dekh sakte ho?\" (I think I should talk to a counsellor or doctor. Can you look into it with me?)",
          "If saying it out loud feels impossible, write it. A WhatsApp message to your mom at 9 am counts."
        ]
      },
      {
        "heading": "when they say \"sab ko hota hai\"",
        "paragraphs": [
          "The first reaction is usually not the real reaction. \"Sab ko hota hai\", \"phone kam chalao\", \"bas padhai pe dhyaan do\", these are reflexes. Parents say them because they are scared and do not have other words yet.",
          "Do not argue in that moment. It turns into a debate about whether your feelings are valid, which you will lose even when you are right. Say something small and calm instead: \"Ho sakta hai sab ko hota ho. Mujhe abhi bhi help chahiye.\" (Maybe everyone goes through it. I still need help.)",
          "Then give it a day or two. Many parents dismiss it at 7 pm and knock on your door at 11 pm. The seed got planted.",
          "If it is still a flat no after a second try, that is useful information: you need another adult in the loop. It does not mean you were wrong to ask.",
          "One more thing, yaar: \"sab ko hota hai\" is not a diagnosis. Whether this is normal stress or something that needs treatment, a doctor or psychologist can tell you. Not an uncle, not a reel, not this post."
        ]
      },
      {
        "heading": "if home is not a safe place to say this",
        "paragraphs": [
          "Some homes are not just awkward, they are harmful. If telling your parents would mean being hit, locked in, humiliated, or losing your phone and freedom, you are allowed to skip them. Protecting yourself first is not betrayal.",
          "Other adults who can be your first person: a school counsellor, a teacher you trust, a warden, the family doctor, a cousin or mausi who has always been on your side.",
          "You can also talk to someone outside your life entirely. Tele-MANAS 14416 is free, 24x7, in 20+ languages, no permission needed. iCall is 9152987821. Vandrevala Foundation is 1860 2662 345. If you are under 18 and home is unsafe, Childline is 1098.",
          "If you are in immediate danger, or having thoughts of ending your life, please do not sit with it alone tonight. Call 112 or 14416, or go to the nearest hospital emergency. It can get better with help, even if it does not feel that way tonight."
        ]
      },
      {
        "heading": "after you've said it",
        "paragraphs": [
          "You might feel weird, exposed, even regretful. That is normal. You moved something that was stuck for a long time.",
          "Say thank you if they listened even a little. It teaches them this conversation is allowed. \"Thank you for listening, yeh mere liye mushkil tha\" goes a long way.",
          "And if they did not get it, you still did the brave thing. The conversation is paused, not over. Perfection is a scam, including the perfect family talk. A messy first attempt still counts."
        ]
      }
    ],
    "actions": [
      "Write your opening line in the journal tool, so it exists outside your head.",
      "Pick your person and your moment: one parent or one other adult, one low-stakes time in the next 3 days. Put it in your calendar.",
      "Save Tele-MANAS 14416 in your contacts right now, and add it to your crisis plan in the app."
    ],
    "tools": [
      "journal",
      "safety-plan",
      "friends"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7) | emergency 112 | Childline 1098 | iCall 9152987821 | Vandrevala 1860 2662 345",
    "cover": "friends",
    "accent": "cyan"
  },
  {
    "slug": "failed-an-exam-the-next-7-days",
    "title": "failed an exam? here's what the next 7 days look like",
    "hook": "the result is out, the spiral is loud, and nobody tells you what to actually do on day one.",
    "tags": [
      "exam",
      "results",
      "adversity",
      "family",
      "jee",
      "neet",
      "boards"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "the first hour after the result",
        "paragraphs": [
          "you refresh the page three times because the number can't be right. then it is right. then your stomach drops and your brain goes quiet in a weird way.",
          "the phone starts buzzing. a cousin's screenshot in the family group. a friend asking \"kitna aaya?\" with a smiley. you want to throw the phone into the sea.",
          "first thing: you don't have to reply to anyone right now. put the phone face down. drink water. that's it, that's the whole task for the next hour."
        ]
      },
      {
        "heading": "the spiral, and why it lies",
        "paragraphs": [
          "the spiral goes like this: bad rank, so no good college, so no good job, so everyone was right about me, so my whole life is over. it takes about ninety seconds to run and it feels like a prophecy.",
          "it isn't. it's your brain doing what brains do under shock: taking one data point and drawing a straight line to the worst possible ending. that line is not a plan. it's panic wearing a lab coat.",
          "notice the jump. \"i did badly on this exam\" is a fact. \"i am a failure\" is a story. you get to argue with the story, and the thought-flip tool is literally built for that."
        ]
      },
      {
        "heading": "one result is one result",
        "paragraphs": [
          "nobody's saying it doesn't matter. it matters. you worked for it, you lost sleep for it, maybe your family rearranged money for it. the sadness is earned. let it be there.",
          "but think about the adults you actually respect. the ones who are kind, who are good at their thing, who you'd call at 2am. do you know their 12th percentage? their JEE rank? you probably don't, because by thirty it stopped being a thing anyone asks.",
          "there are repeat years, state colleges, lateral entries, different streams, open universities, skills that no entrance exam measures. you don't need to pick the path today. you only need to know the map is bigger than the one page you were shown."
        ]
      },
      {
        "heading": "talking to family without it becoming a fight",
        "paragraphs": [
          "this is the part most people dread more than the result itself. so a few things.",
          "tell them early, yourself, before the group chat does it for you. it hurts less when it's your words. keep it simple: \"result aa gaya, achha nahi hua. i'm upset. i need a day or two before we talk about what's next.\"",
          "if they get angry, remember that a lot of parent-anger is fear with a loud voice. \"log kya kahenge\" is their spiral, not your verdict. you don't have to fix their fear tonight. you can say \"i know you're scared too\" and leave the room.",
          "if home feels unsafe, not just tense but unsafe, that's different. reach out to Childline 1098 if you're under 18, or Tele-MANAS 14416 any time. you deserve an adult in your corner."
        ]
      },
      {
        "heading": "if it goes darker than sad",
        "paragraphs": [
          "sometimes the spiral doesn't stay in the \"my future is ruined\" lane. sometimes it starts whispering that there's no point in anything, or that people would be better off without you.",
          "if that's happening, please treat it as an emergency, not as a mood. call Tele-MANAS 14416 (free, 24x7, in your language) or 112 if you're in immediate danger. tell one real person, even if it's just \"i'm not okay and i don't want to be alone right now.\"",
          "these thoughts tend to show up when the brain is completely overloaded. they can pass, and they are a lot easier to get through when you're not carrying them alone. a doctor or psychologist can tell you what's going on; you don't have to diagnose yourself at 1am.",
          "when you have a calmer ten minutes, open the safety-plan tool and write down who you'd call and what helps, so future-you doesn't have to figure it out mid-spiral."
        ]
      },
      {
        "heading": "the next 7 days, roughly",
        "paragraphs": [
          "day 1-2: survive. sleep, eat, shower. no decisions, no coaching brochures, no comparing. mute the family group if you need to. use the bad-day tool if you can't think straight.",
          "day 3-4: let one person in. a friend, a sibling, a teacher who was decent to you. say the number out loud to someone who won't flinch. shame shrinks when it's spoken.",
          "day 5-6: look at options, not verdicts. write down three paths, even stupid-sounding ones. no committing. just proof that the map has more than one road.",
          "day 7: do one small thing that is yours. a walk, a song, a chai with someone who likes you for no reason connected to marks. you're still a person. the person comes first, the plan comes after."
        ]
      }
    ],
    "actions": [
      "drink a glass of water and put your phone face down for 20 minutes",
      "text one person: \"result bura aaya, i'm not okay, can we talk later today?\"",
      "write down the spiral sentence (\"i'm a failure\") and next to it, one fact-only version (\"i scored X on this exam\")"
    ],
    "tools": [
      "thought-flip",
      "bad-day",
      "safety-plan"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7) | emergency 112 | Childline 1098 if under 18 | iCall 9152987821 | Vandrevala Foundation 1860 2662 345",
    "cover": "exam",
    "accent": "sun"
  },
  {
    "slug": "heartbreak-at-19-survival-guide",
    "title": "heartbreak at 19: a survival guide",
    "hook": "why it hurts in your chest, how to do no-contact without hating yourself, and when sad has become something more.",
    "tags": [
      "heartbreak",
      "breakup",
      "relationships",
      "depression",
      "no-contact",
      "gen z"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "first, you're not being dramatic",
        "paragraphs": [
          "Someone will tell you it was \"just a college thing\" or \"tum abhi bacche ho, aage bahut milenge.\" Ignore them. At 19 this might be the first person you built a whole future with, and losing that future hurts like losing a real thing. Because it was a real thing.",
          "Your friends will get bored of it before you do. That's normal. You're allowed to still be sad on day 40 when everyone else has moved on to the next gossip."
        ]
      },
      {
        "heading": "why it physically hurts",
        "paragraphs": [
          "That tightness in your chest, the no-appetite, the 3 hours of sleep. It's not in your head. Your body got used to this person as a daily dose of comfort, and now the dose is gone. Think of it like a withdrawal, not a weakness.",
          "Some research suggests social pain and physical pain overlap in the brain. So \"it hurts\" isn't a metaphor. It's a report.",
          "Treat it like a fever. Eat something, even if it's just dal chawal. Drink water. Sleep when you can. Your body is doing repair work and needs raw material."
        ]
      },
      {
        "heading": "no-contact is a bandage, not a punishment",
        "paragraphs": [
          "No-contact means: no texting, no calling, no watching their story, no \"accidentally\" checking their Spotify. At least 30 days, ideally more. Not to hurt them. To let your brain stop expecting them.",
          "Every time you check their profile, you're ripping the bandage off to see if it's healed. It hasn't. It won't, if you keep checking.",
          "Mute, don't block, if blocking feels too aggressive. Archive the chat. Hide the photos somewhere you can't open without effort. The point is friction between you and the urge, not performing strength.",
          "Share a class, a hostel floor, or a friend group? Go for minimum contact instead: polite, short, no late-night conversations. You don't owe anyone a dramatic announcement."
        ]
      },
      {
        "heading": "the 2am urge to text",
        "paragraphs": [
          "It hits at 2am. You're tired, your defences are down, and your brain plays a highlight reel of only the good parts. Then you draft a message that starts with \"hey, i know this is random but.\"",
          "Here's the thing about that urge: it peaks and then it passes, usually faster than it feels like it will. Your job isn't to never feel it. Your job is to outlast it.",
          "Type it somewhere that can't send: the journal here, notes app, a draft to yourself. Write everything. Then put the phone across the room. Read it in the morning. You'll almost always be relieved it didn't go.",
          "If you do send it, bas, it happened. Don't spiral into \"i ruined everything.\" Go back to no-contact the next morning. One text doesn't undo your progress; giving up does."
        ]
      },
      {
        "heading": "stuff that feels like healing but isn't",
        "paragraphs": [
          "Asking for \"closure\" conversations. You want them to say something that makes it not hurt. They can't. Closure is something you give yourself, slowly, boringly.",
          "Rebound scrolling on dating apps at 1am. Fine if you genuinely want it, but if it's to feel chosen again, it usually leaves you emptier.",
          "Reading old chats like evidence. You won't find the one line that explains everything. You'll just feel it fresh.",
          "Building a whole personality around being over it. You don't have to post the gym selfie and the \"glow-up\" caption. Healing quietly is still healing."
        ]
      },
      {
        "heading": "when sad has tipped into something more",
        "paragraphs": [
          "Heartbreak is supposed to hurt and then, unevenly, hurt less. Bad days mixed with okay ones. If after a few weeks there are no okay days at all, pay attention.",
          "Signs it might be more than heartbreak: you've stopped doing basic things like eating, bathing, or going to class. You feel nothing instead of sad. You're sleeping all day or not at all. Or thoughts like \"everyone would be better off without me\" have started showing up.",
          "That last one matters most. If any part of you is thinking that way, please tell someone today. A friend, a sibling, a warden, anyone. And call Tele-MANAS at 14416. It's free, 24x7, and works in 20+ languages. If you're in immediate danger, call 112. You won't be judged, and you won't be the first 19-year-old who called about a breakup.",
          "Only a doctor or psychologist can tell you if what you're feeling is depression. But you don't need a diagnosis to deserve help. \"It's just a breakup\" is not a reason to suffer alone. Log kya kahenge is also not a reason."
        ]
      },
      {
        "heading": "what the next few weeks actually look like",
        "paragraphs": [
          "Not a straight line. More like a staircase you keep tripping on. Week 2 might be worse than week 1. A song in an auto might wreck you on day 50. That's not going backward. That's grief.",
          "One day you'll realise you went a whole afternoon without thinking about them. Then a whole day. You won't notice the moment it stops hurting, only afterwards that it did.",
          "Until then: eat, sleep, don't text, and talk to one human who isn't them. That's the whole plan. Perfection is a scam, and healing perfectly is too."
        ]
      }
    ],
    "actions": [
      "Mute their profile and archive the chat right now. Takes 30 seconds.",
      "Write the text you want to send them in the journal instead. Everything, unfiltered. Then close the app.",
      "Message one friend: \"rough day, can we get chai?\" You don't have to talk about the breakup. You just have to not be alone with it."
    ],
    "tools": [
      "breakup",
      "urge",
      "journal"
    ],
    "helplineNote": "If it's getting heavy: Tele-MANAS 14416 (free, 24x7), iCall 9152987821, or 112 in an emergency.",
    "cover": "heartbreak",
    "accent": "pink"
  },
  {
    "slug": "when-a-friend-says-they-want-to-die",
    "title": "when a friend says they want to die",
    "hook": "exactly what to say, what not to say, how to ask straight, and how to bring in help without losing them.",
    "tags": [
      "friends",
      "suicide-prevention",
      "helping-someone",
      "mental-health",
      "india",
      "helplines"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "first: caring will not make it worse",
        "paragraphs": [
          "someone you love just said something that made your stomach drop. maybe it was direct. maybe it was \"i'm so tired of everything\", or \"you'd all be fine without me\", or a joke that didn't land like a joke.",
          "if they are in danger right now, skip the reading: call 112, stay with them, and get an adult there. Tele-MANAS 14416 is free and 24x7 if you need a calm voice on the line while you do that.",
          "your brain is probably screaming \"say the right thing\". there is no perfect script. there is only being there, asking honestly, and not leaving them alone with it.",
          "and no, asking about it directly does not put the idea in their head. crisis counsellors and doctors say this consistently. what hurts is silence and changing the subject."
        ]
      },
      {
        "heading": "ask the actual question",
        "paragraphs": [
          "hints are easy to wave away, for both of you. so don't. ask clearly and calmly, the way you'd ask about anything serious.",
          "\"when you say that, do you mean you're thinking about killing yourself?\" or \"are you having thoughts of ending your life?\" use the real words. it tells them you can handle the truth.",
          "if they say yes, your job is to not panic on the outside. \"thank you for telling me. i'm here. i'm not going anywhere.\" that's enough for the first thirty seconds.",
          "then: \"what's been going on?\" not \"why\". just let them talk. let the silences sit. you don't have to fill them."
        ]
      },
      {
        "heading": "say this, not that",
        "paragraphs": [
          "say: \"i'm really glad you told me.\" \"that sounds unbearable right now.\" \"you don't have to figure this out alone.\" \"i'm staying.\"",
          "don't say: \"don't be dramatic.\" \"think about your parents.\" \"others have it worse.\" \"but you have so much going for you.\" \"it's a phase.\" every one of these tells them you didn't hear them.",
          "don't argue about whether their reasons are valid. don't try to fix their life in one conversation. don't lecture. you are not their therapist, you are their friend, and that's the thing they need right now.",
          "and don't promise to keep it a secret. you might need to break that promise to keep them safe. say it honestly: \"i care about you too much to keep this only between us.\""
        ]
      },
      {
        "heading": "stay. then widen the circle",
        "paragraphs": [
          "if they tell you they have a plan, or you feel they are in danger right now, do not leave them alone, and do not carry this alone either. call 112 and get a trusted adult physically there: a parent, hostel warden, teacher, older cousin, a neighbour you trust. yes, even if your friend gets upset about it. an upset friend who is alive is the whole goal.",
          "if they mention having something they could hurt themselves with, help put distance between them and it, and get an adult involved in that. you don't need to know the details, and you don't need to ask. you need another person in the room.",
          "if it isn't an emergency but it's clearly heavy, help them call a helpline together, right now, while you're sitting next to them. Tele-MANAS 14416 is free, 24x7, in 20+ languages. iCall 9152987821. Vandrevala Foundation 1860 2662 345. if they're under 18, Childline 1098. put it on speaker if that helps. offer to sit outside the door if they want privacy.",
          "\"log kya kahenge\" will come up, for them and maybe for you. a counsellor or a doctor is not gossip, it's healthcare. a doctor or psychologist can tell them what's actually going on and what helps. you can't, and you're not supposed to."
        ]
      },
      {
        "heading": "the next day, and the day after",
        "paragraphs": [
          "the hardest part of this isn't the big conversation. it's tuesday, when everything looks normal again and it's tempting to assume it's sorted.",
          "check in. one text is enough: \"thinking of you. no pressure to reply.\" keep doing that. consistency says \"i meant it\" louder than any speech.",
          "help them build a safety plan while things are calm: who to call, where to go, what helps a little. the app has a tool for exactly this, and doing it together is less awkward than doing it alone.",
          "and if they're still in a bad place, or you're worried at all, that is the moment to push gently toward a professional, not a sign you failed. you did the thing friends can do. the rest needs people trained for it, and you are there to support that, not to replace it."
        ]
      },
      {
        "heading": "after: look after you too",
        "paragraphs": [
          "you'll probably feel shaky afterwards. maybe guilty, maybe angry, maybe weirdly numb. all of that is normal. you just held something heavy.",
          "you can love someone and still not be their only lifeline. tell one adult, or one other trusted person, so the weight isn't only on you. and yes, you can call Tele-MANAS yourself. helplines are for the people around the person too.",
          "it's okay to set a boundary: \"i'm here for you, and i can't be awake at 3am every night. let's make sure you have more people.\" that isn't abandoning them. that's making sure the help lasts longer than you can on your own.",
          "you don't need to be perfect at this. perfection is a scam, remember? show up, ask straight, bring more people in. that's the whole job, yaar. and you can do it."
        ]
      }
    ],
    "actions": [
      "save Tele-MANAS 14416 and 112 in your phone contacts right now, so you're not googling in a panic later",
      "send your friend one line today: \"thinking of you. no need to reply. i'm around.\"",
      "open the crisis plan tool, with them or for yourself, and fill in just the first box: who to call"
    ],
    "tools": [
      "safety-plan",
      "friends",
      "panic"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7, 20+ languages) · emergency 112 · under 18: Childline 1098 · iCall 9152987821 · Vandrevala Foundation 1860 2662 345",
    "cover": "safety-plan",
    "accent": "pink"
  },
  {
    "slug": "burnout-is-not-a-badge",
    "title": "burnout is not a badge",
    "hook": "14-hour days don't make you serious, they make you tired. here's how to tell the difference and come back.",
    "tags": [
      "burnout",
      "hustle-culture",
      "rest",
      "study-pressure",
      "work-stress"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "the flex that isn't one",
        "paragraphs": [
          "\"bro i slept 3 hours.\" said like a trophy. in the hostel mess, in the coaching batch group, in the office standup. everyone counting hours like they're marks.",
          "hustle culture sold us a simple story: the person who suffers the most wins. so we started wearing exhaustion like a uniform.",
          "but tired is not a result. nobody gets a rank for being the most burnt-out person in the batch. the exam doesn't know how little you slept. the client doesn't care that you skipped lunch.",
          "and the part nobody says out loud: a lot of the 14-hour day is for show. for parents, for the group chat, for the voice in your head that says you're not doing enough."
        ]
      },
      {
        "heading": "tired vs burnt out",
        "paragraphs": [
          "tired has an end. one proper sleep, one lazy sunday, one plate of maggi with friends, and you're mostly back. your body is asking for a break and it takes one.",
          "burnout is when you take the break and wake up still empty.",
          "it looks like this: things you used to like feel like chores. you read the same page four times and nothing goes in.",
          "you're snapping at your mom over nothing in the family group. you feel a flat \"what's even the point\" about the thing you chose yourself.",
          "that cynicism is the tell. tired people want to rest. burnt-out people stop wanting anything.",
          "one honest note: if this has been going on for weeks and comes with feeling hopeless or numb most days, it may be more than burnout. a doctor or psychologist can tell you what's actually going on. that's not failure, that's information."
        ]
      },
      {
        "heading": "why the 14-hour day doesn't work",
        "paragraphs": [
          "your brain is not a factory shift. after a certain point you're not studying, you're sitting near books. you're not working, you're refreshing slack with a tired face.",
          "ask yourself honestly: out of those 14 hours, how many were real, focused, actually-doing-the-thing hours? be honest. it's usually a lot less than 14. the rest is guilt-scrolling with the laptop open so it \"counts\".",
          "so the 14-hour day isn't getting you more. it's getting you the same few real hours of work plus many hours of feeling bad about yourself. that's a terrible deal, yaar."
        ]
      },
      {
        "heading": "rest is part of the work",
        "paragraphs": [
          "athletes don't train 14 hours a day. the rest day is where the muscle actually builds. the training only creates the need for it.",
          "sleep is when your brain files what you studied. pulling an all-nighter before an exam is like downloading a file and closing the laptop before it finishes saving.",
          "so flip the frame. rest isn't the reward you get after the work. rest is what makes the work possible tomorrow.",
          "a chai break is not cheating. a walk is not wasted time. an evening where you do nothing \"productive\" is not a sin you have to make up for on sunday."
        ]
      },
      {
        "heading": "recovering without quitting everything",
        "paragraphs": [
          "burnout makes you want to drop everything. drop the exam. quit the job. run away to the mountains.",
          "sometimes that is genuinely the right call. but mostly, it's the exhaustion talking, and big decisions on an empty tank are bad decisions.",
          "so don't decide anything huge this week. first, refuel.",
          "subtract before you add. don't make a new timetable with a 5am wake-up and gym and meditation.",
          "cut one thing instead. one extra class, one side project, one commitment you said yes to because \"log kya kahenge\".",
          "fix sleep first. not perfectly. just a hard stop time at night that you actually keep, even if it's only 30 minutes earlier than now.",
          "then one off-block a day. an hour where nothing is allowed to be useful. music, a walk, a call with the one friend who doesn't ask about marks.",
          "lower the bar on purpose. for the next two weeks, aim for a done day, not a perfect day. did the thing, closed the book, ate food. that's a win.",
          "and tell one person. the family group will have opinions, so skip them.",
          "pick the one friend or cousin who gets it and say \"i've been running on empty.\" you don't have to explain further."
        ]
      },
      {
        "heading": "the honest version",
        "paragraphs": [
          "you will not do this perfectly. you'll have a day where you slip back into the 14-hour grind and feel like you failed at resting too. that's fine. perfection is a scam, remember?",
          "burnout took a while to build. it won't unbuild in one weekend. the goal isn't to feel amazing by friday. it's to feel slightly less empty than last week.",
          "and if you've tried the small stuff and still can't see a way through, or the \"what's the point\" feeling is getting louder, that's your cue to talk to someone trained for this, not a sign you're weak. Tele-MANAS at 14416 is free, 24x7, and works in 20+ languages. you can call just to talk, bas."
        ]
      }
    ],
    "actions": [
      "pick a hard stop time for tonight and actually close the book or laptop at it, even if it's just 30 minutes earlier than usual",
      "write down three things you did today, not the ten you didn't; keep it in the done-list",
      "text one person: \"i've been running on empty lately.\" send it. no further explanation needed"
    ],
    "tools": [
      "done-list",
      "wind-down",
      "bad-day"
    ],
    "helplineNote": "feeling empty or hopeless and can't shake it? call Tele-MANAS 14416 (free, 24x7) or iCall 9152987821. in an emergency, call 112.",
    "cover": "focus-stats",
    "accent": "orange"
  },
  {
    "slug": "the-comparison-trap-highlight-reels-vs-real-life",
    "title": "the comparison trap: their highlight reel vs your tuesday",
    "hook": "your feed is built to make you feel behind. here's how it does it, and how to reset it.",
    "tags": [
      "instagram",
      "comparison",
      "social media",
      "self-worth",
      "doomscrolling",
      "feed reset"
    ],
    "minutes": 3,
    "sections": [
      {
        "heading": "the 11pm scroll",
        "paragraphs": [
          "you know the one. you opened instagram to check one message. twenty minutes later you've seen a batchmate's goa trip, a cousin's new job in bangalore, a school friend's engagement, and someone your age who apparently runs a startup.",
          "you close the app. somehow you feel worse than before you opened it. nothing in your life changed in those twenty minutes, but your mood did.",
          "that's not a you problem. that's the product working exactly as designed."
        ]
      },
      {
        "heading": "you are comparing your bts to their final cut",
        "paragraphs": [
          "here's the thing nobody says out loud: a post is not a life. it's a cropped, filtered, chosen moment, picked out of hundreds of ordinary ones.",
          "the goa trip had a fight on day two nobody posted. the bangalore job comes with a 1.5 hour commute and a flatmate who never washes dishes. the startup is three friends and a canva logo.",
          "you see their best five seconds. you live your full 24 hours, including the boring, messy, chai-at-3pm-staring-at-the-wall parts. of course the comparison feels unfair. it is unfair."
        ]
      },
      {
        "heading": "the feed is not neutral",
        "paragraphs": [
          "the app doesn't just show you what your friends posted. it shows you what keeps you scrolling.",
          "and what keeps people scrolling? stuff that creates a tiny ache. a little \"i should be doing that\". a small jolt of \"wait, they got it before me?\" that ache makes you keep going, looking for the post that will make it stop.",
          "so if you lingered on a jee-toppers reel last week, expect more of them. if you paused on a gym transformation, your feed slowly becomes a gym. the algorithm isn't evil. it's a mirror that reflects your insecurities back at you, bigger."
        ]
      },
      {
        "heading": "why it hits harder here",
        "paragraphs": [
          "in india, comparison isn't just online. it's the whatsapp family group where chachi forwards a cousin's convocation photo. it's \"sharma ji ka beta\". it's log kya kahenge.",
          "instagram just took that pressure and made it 24x7, global, and personalised. now it's not one sharma ji's son, it's ten thousand of them, all at once, all seemingly ahead.",
          "no human brain was built to measure itself against ten thousand highlight reels a day. feeling behind in that setup isn't weakness. it's just maths."
        ]
      },
      {
        "heading": "reset the feed",
        "paragraphs": [
          "you can't fix the algorithm, but you can starve it. three moves that actually help:",
          "one: mute, don't unfollow. that cousin, that one classmate, that influencer who makes you feel small. mute them. no drama, no notification, they'll never know. your feed usually gets quieter within a week or so.",
          "two: feed it something boring on purpose. follow five accounts about things that don't trigger you. birds. street food. old hindi film trivia. tap, pause, like. the algorithm learns fast. soon your feed is less \"everyone is winning\" and more \"here's a pigeon\".",
          "three: move the app. put instagram in a folder on your last screen, log out, or set a 20 minute limit in your phone settings. friction is your friend. the goal is not to quit, bas to stop opening it on autopilot."
        ]
      },
      {
        "heading": "reset the brain",
        "paragraphs": [
          "the feed is only half of it. the other half is the voice in your head that says \"everyone except me\".",
          "when you catch that thought, try this: name what you're actually seeing. \"i am looking at one photo of one good day of one person\". say it flatly. it sounds silly. it helps, because it pulls your brain out of story-mode and back into fact-mode.",
          "then ask the real question underneath. usually \"they got the job\" is actually \"am i going to be okay?\". that's a question worth sitting with, journaling about, or talking to a friend about. a stranger's reel can't answer it.",
          "and if the scroll leaves you feeling low most days, not just one bad night, that's worth telling someone. a doctor or psychologist can tell you what's going on. yaar, you don't have to figure it out from a feed."
        ]
      },
      {
        "heading": "you're not behind. you're just on a different page.",
        "paragraphs": [
          "there is no universal timeline where everyone gets the job at 22, the trip at 23, the ring at 25. that's a fiction, and instagram is the most convincing version of it ever built.",
          "your real life, the one with the unposted parts, is the only one you actually get to live. it deserves more of your attention than someone else's cropped version of theirs."
        ]
      }
    ],
    "actions": [
      "mute three accounts that made you feel small this week. right now, takes 30 seconds.",
      "follow two accounts about something random you like (food, trains, memes about cats). like one post each so the algorithm notices.",
      "next time you close instagram feeling worse, write one line in the journal: what did i actually see, and what did i tell myself about it?"
    ],
    "tools": [
      "thought-flip",
      "journal",
      "hype-file"
    ],
    "helplineNote": "if the scrolling is covering something heavier, talk to someone. Tele-MANAS 14416 is free, 24x7, in 20+ languages. iCall 9152987821. emergency 112.",
    "cover": "phone-down",
    "accent": "lime"
  },
  {
    "slug": "starting-over-when-everything-broke-at-once",
    "title": "starting over when everything broke at once",
    "hook": "nobody rebuilds in a montage. they rebuild on boring tuesdays. here's what that actually looks like.",
    "tags": [
      "adversity",
      "resilience",
      "grief",
      "starting-over",
      "failure",
      "family"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "first, the part nobody says out loud",
        "paragraphs": [
          "sometimes it isn't one bad thing. it's a pile-up. you dropped out, or a parent died, or the family money collapsed, or the breakup and the failed exam landed in the same week. it doesn't feel like a chapter ending. it feels like the whole book got burned.",
          "and the internet keeps serving you comeback stories. montage, music, glow-up, 'she went from zero to...'. that's not what rebuilding looks like. that's the trailer.",
          "the real thing is slower, duller, and much more survivable than it feels right now. that's the honest version, and it's actually the good news."
        ]
      },
      {
        "heading": "you're not behind, you're on a different road",
        "paragraphs": [
          "your batchmates are posting placement offers and goa trips. your cousin cleared NEET. the family whatsapp group has opinions, and so does the aunty next door.",
          "but the timeline you're measuring yourself against was written for someone whose life didn't just get rearranged. it's a map for a different city. of course it doesn't match where you are.",
          "'log kya kahenge' is loud, but it's noise. people talk for a week, then move on to someone else's drama. you'll still be here, living your actual life. build it for you, not for the group chat."
        ]
      },
      {
        "heading": "shrink the day until it's possible",
        "paragraphs": [
          "when everything is broken, 'fix your life' is not a task. it's a weight. nobody can lift it, and trying just proves to your brain that you're failing again.",
          "so you don't lift it. you shrink the day until it becomes possible. brush teeth. drink water. one phone call. one chapter. one job application. bas. that's the whole plan for today.",
          "grief and shock eat energy you can't see. a day where you ate two meals and stood in the sun for ten minutes is not a wasted day. it's a brick. the done-list tool exists for exactly this: write down what you did, not what you didn't."
        ]
      },
      {
        "heading": "boring is the whole strategy",
        "paragraphs": [
          "rebuilding is mostly repetition. same alarm. same walk to the same chai stall. same forty minutes of study, or the same form filled again after a rejection email.",
          "people who've restarted after serious loss, whether it's dropping out and coming back, or losing a parent as a teenager and still finishing college, will often tell you something similar: it wasn't one big brave decision. it was a hundred small ones that were too small to feel brave at the time.",
          "boring days compound. a bad week doesn't cancel them. you're not back to zero when you slip; you're just at tuesday again. the habits tool is built for exactly this kind of unglamorous streak."
        ]
      },
      {
        "heading": "let two or three people in",
        "paragraphs": [
          "pride says handle it alone, don't be a burden, everyone has their own problems. pride is wrong here.",
          "you don't need twenty people. you need two or three. the friend who texts 'khana khaya?', the chacha who quietly sends a UPI transfer and never mentions it, the teacher who still thinks you can resit.",
          "tell them the one specific thing you need. 'sit with me while i fill this form.' 'remind me to eat.' 'don't give advice, just listen for ten minutes.' specific asks are much easier for people to say yes to. the friends tool can help you figure out who to text and what to say."
        ]
      },
      {
        "heading": "when it gets heavier than tired",
        "paragraphs": [
          "some days there's a thought: what's even the point. if that thought has shown up after a loss like this, it doesn't mean you're broken, and it's not a verdict on you or your future. it usually means you're carrying too much alone.",
          "if it's getting louder, or you're thinking about not being here, or about hurting yourself, that's a signal to talk to someone today, not next week. Tele-MANAS 14416 is free, 24x7, in 20+ languages. iCall is at 9152987821. if you're in immediate danger, call 112. you don't need to be 'bad enough' to call. you just need to be having a hard time.",
          "a doctor or psychologist can tell you whether what you're feeling is grief doing its normal thing or something that needs more support. both are okay. asking is not weakness; it's one more boring, brave step. the safety-plan tool helps you write down who to call and what helps, before you need it."
        ]
      },
      {
        "heading": "what 'better' actually looks like",
        "paragraphs": [
          "not a glow-up. better looks like: you laughed at a reel and didn't feel guilty. you finished the form. you slept through the night. you told someone the truth about how it's going.",
          "the new life you're building won't look like the old plan, and it might fit who you are now better than the old plan ever did. some people who've been through the worst say the small stuff scares them less afterwards. not a rule, not a silver lining you owe anyone. just something that sometimes happens.",
          "perfection is a scam. rebuilt lives are patched together, and patched is strong. one boring day at a time, yaar. that's the whole secret."
        ]
      }
    ],
    "actions": [
      "write down three things you did today, however small (making chai counts). put them in the done-list tool.",
      "text one person the single specific thing you need this week. one sentence is enough.",
      "pick one 10-minute task for tomorrow and set an alarm for it. just one. nothing else."
    ],
    "tools": [
      "done-list",
      "friends",
      "safety-plan"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7, 20+ languages) · iCall 9152987821 · emergency 112",
    "cover": "grow",
    "accent": "cyan"
  },
  {
    "slug": "therapy-in-india-honestly",
    "title": "therapy in india, honestly: cost, free doors, first session",
    "hook": "what it actually costs, where to go when you're broke, and how to tell a good therapist from a bad one.",
    "tags": [
      "therapy",
      "mental-health",
      "india",
      "money",
      "getting-help",
      "tele-manas"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "first, the thing nobody says out loud",
        "paragraphs": [
          "therapy in india has a reputation problem. a lot of people think it's for \"pagal log\". a lot of others think it's a ₹3000-per-hour luxury for south delhi aunties.",
          "both are wrong. therapy is just a trained person helping you untangle your own head, and there are more cheap and free doors into it than most people know.",
          "this post is the stuff i wish someone had told me before i spent two years googling \"am i okay\" at 2am instead of just asking someone."
        ]
      },
      {
        "heading": "what it actually costs",
        "paragraphs": [
          "private therapy in a metro city usually lands somewhere between a few hundred rupees and a few thousand per session. it varies a lot by city, by experience, and by whether it's online or in person.",
          "yes, that adds up fast if you're a student living on hostel mess food and a monthly upi transfer from home. that's real. don't let anyone shame you for doing the math.",
          "but \"i can't afford therapy\" usually means \"i can't afford the therapists on instagram\". the free and low-cost options below are not second-class. many have the same kind of trained people."
        ]
      },
      {
        "heading": "free and low-cost: where to actually go",
        "paragraphs": [
          "tele-manas (14416): a government helpline, free, 24x7, in 20+ languages. you call, you talk to a trained counsellor, and if needed they connect you to further care. no appointment, no cost, no one in your family finds out.",
          "your college counsellor: most colleges and universities have one, and most students never go. it's free, it's on campus, and they've heard every version of \"i'm failing and my parents don't know\" already. check your student portal or ask at the admin office.",
          "government hospitals: district hospitals and medical colleges have psychiatry opds. you pay a small registration fee and wait in a queue like everyone else. not glamorous, but real doctors, real help.",
          "icall (9152987821): a counselling service run by a reputed institute. free, phone and email based, trained counsellors. good for when you want more than one conversation.",
          "ngos and sliding-scale clinics: many cities have organisations that charge based on what you can pay. ask the tele-manas counsellor or your college counsellor to point you to one near you.",
          "vandrevala foundation (1860 2662 345): another free helpline, available round the clock, for when you need to talk right now."
        ]
      },
      {
        "heading": "what a first session is actually like",
        "paragraphs": [
          "it's mostly talking about why you're there. the therapist asks questions, you answer as much or as little as you want. nobody lies you down on a couch. nobody reads your mind.",
          "you will probably feel awkward. you might cry, you might go blank. all normal. the first session is them getting to know you, not fixing you.",
          "you don't need a \"big enough\" problem. \"i feel stuck and i don't know why\" is a complete reason to show up.",
          "it's confidential. what you say stays between you and the therapist, not your parents, your college, or the whatsapp family group. the main exception is if they believe you're in immediate danger, and even then it's about keeping you safe, not getting you in trouble. under 18? ask upfront how confidentiality works for you."
        ]
      },
      {
        "heading": "good therapist vs bad therapist",
        "paragraphs": [
          "a good one listens more than they talk. they ask what you want out of this. they don't flinch when you say something you've never said out loud. you leave feeling heard, even if nothing is solved yet.",
          "a bad one lectures. gives you \"just think positive\" or \"log kya kahenge, settle down\" advice. pushes religion or marriage or \"adjust kar lo\" as treatment. makes you feel judged, rushed, or like a problem to be managed.",
          "red flags to walk away from: they share other clients' stories, they comment on your body or looks, they get angry when you disagree, they promise to \"cure\" you in a fixed number of sessions.",
          "and here's the part nobody tells you: it's okay to not click with the first one. that's not therapy failing. that's like a bad first date. you're allowed to try someone else.",
          "ask about their qualifications and training. counsellors and clinical psychologists usually have a master's or higher in psychology; psychiatrists are medical doctors. it's a normal question, and a good therapist won't be offended."
        ]
      },
      {
        "heading": "when you might need a psychiatrist too",
        "paragraphs": [
          "a psychologist or counsellor does talk therapy. a psychiatrist is a medical doctor who can also prescribe medication. they often work together, and neither one is \"more serious\" than the other.",
          "worth mentioning to a doctor: sleep that's been off for weeks, not being able to eat or function, therapy alone not moving the needle, or thoughts of hurting yourself. none of that makes you a lost cause.",
          "medication is not a failure. whether you need it, and for how long, is a decision a doctor makes with you. a doctor or psychologist can tell you what's actually going on. that's their job, not google's, not mine.",
          "if you're having thoughts of ending your life right now, please don't sit with that alone. call tele-manas at 14416 or 112 for emergencies. if you're under 18, childline 1098 is there. you deserve to be here, and this feeling can change."
        ]
      },
      {
        "heading": "bas, one last thing",
        "paragraphs": [
          "you don't have to be broken to go. you don't have to have the money for the fancy option. you don't have to tell anyone.",
          "you just have to make one call, or walk into one office, once. the rest can be figured out from there.",
          "perfection is a scam. so is suffering quietly because getting help feels like admitting something. yaar, it's just a conversation."
        ]
      }
    ],
    "actions": [
      "save 14416 (tele-manas) in your phone contacts right now, even if you don't call today.",
      "find out your college counsellor's name and room number. just the info, no appointment needed yet.",
      "write down one sentence about why you'd want to talk to someone. that sentence is your first session opener."
    ],
    "tools": [
      "safety-plan",
      "checkin",
      "journal"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7) | emergency 112 | Childline 1098 | iCall 9152987821 | Vandrevala Foundation 1860 2662 345",
    "cover": "mind",
    "accent": "violet"
  },
  {
    "slug": "results-day-anxiety-survival-guide",
    "title": "results day, interview day: a survival guide for your body",
    "hook": "your heart is racing because your body thinks a tiger is coming. here is how to tell it there is no tiger.",
    "tags": [
      "anxiety",
      "exams",
      "results",
      "interview",
      "breathing",
      "family"
    ],
    "minutes": 4,
    "sections": [
      {
        "heading": "first, what is actually happening to you",
        "paragraphs": [
          "the night before results or a big interview, your body does something very old. it reads \"tomorrow matters a lot\" as \"danger\" and switches on the same system it would use if a street dog chased you.",
          "so your heart goes fast, your hands get cold or sweaty, your stomach feels like it is in a lift, and your brain plays the worst case on loop. that is not something wrong with you. that is your alarm system working, just pointed at the wrong thing.",
          "the goal for the next 24 hours is not to feel calm. that is a scam. the goal is to get through it with your body on your side."
        ]
      },
      {
        "heading": "the night before",
        "paragraphs": [
          "you will not sleep perfectly. accept that now so you stop fighting it at 1am. one rough night does not ruin a result or an interview.",
          "put the phone somewhere you cannot reach from the bed. the \"kya lagta hai, kitna aayega\" messages and the coaching institute's hype reels are other people's anxiety looking for a place to land.",
          "do something boring with your hands before bed: fold clothes, wash your cup, lay out tomorrow's shirt. boring tells your nervous system that nothing is on fire.",
          "if the thoughts will not stop, write them on paper, one line each, and close the notebook. you are not solving them tonight. you are parking them."
        ]
      },
      {
        "heading": "the morning of",
        "paragraphs": [
          "eat something, even if your stomach says no. half a paratha, a banana, chai with biscuit. an empty stomach plus adrenaline makes the shakiness worse, and then you read the shakiness as a sign. it is hunger wearing a costume.",
          "move your body for five minutes. walk to the gate and back, do ten squats, climb a floor of stairs. anxiety is energy with nowhere to go. give it somewhere to go.",
          "for results: decide in advance where and with whom you will open it. alone, or with one person you trust. not on the family group, not in front of a crowd.",
          "for interviews: pick one thing you want them to know about you and say it in your head three times. not the whole pitch. just one thing."
        ]
      },
      {
        "heading": "what to do with your hands",
        "paragraphs": [
          "shaky hands are the most visible part of anxiety and the one people feel most ashamed of. so give them a job.",
          "press your thumb and index finger together hard for five seconds, release, repeat. hold a cold water bottle. in an interview, rest your hands in your lap with one hand lightly holding the other wrist. it looks composed, and the tremor stops being the main thing on your mind.",
          "in a waiting area, trace the edge of your phone or your ID card with one finger. slowly. nobody can tell you are doing it."
        ]
      },
      {
        "heading": "the family whatsapp group",
        "paragraphs": [
          "nobody says this out loud: your relatives' messages are mostly about them. their worry, their pride, their \"log kya kahenge\". you do not have to hold all of that before you have even seen a number.",
          "mute the group for 48 hours. nobody will know. if someone messages you directly asking \"result aa gaya?\", one line is enough: \"will share once i have processed it, love you.\" you do not owe real-time updates.",
          "if the result is not what you hoped, tell one person first. let them absorb the first wave with you. then decide together when to tell the wider family. you control the timing of your own news.",
          "and if someone says something harsh, their panic is not a verdict on your future. a bad number is information, not identity."
        ]
      },
      {
        "heading": "breathing you can do in the waiting room or interview chair",
        "paragraphs": [
          "a long, slow out-breath is a signal to your body that the danger is passing. so we make the out-breath longer.",
          "breathe in through your nose for a count of four. hold for two. breathe out slowly through your mouth, like you are cooling chai, for a count of six. do this four times. it takes under a minute and nobody around you will notice.",
          "if counting is too much, just make every exhale a bit longer than the inhale. it will not make you calm, but it usually buys enough room to hear the interviewer.",
          "if the panic spikes past what breathing can handle, that is what the panic tool in the app is for. open it, follow it, come back. you have not failed by needing it."
        ]
      },
      {
        "heading": "when it is more than a bad day",
        "paragraphs": [
          "if the anxiety has been there for weeks, not just around this one event, or if you are having thoughts of not wanting to be here, please do not carry that alone. tell someone today. a doctor or psychologist can tell you what is going on and what helps; a blog post cannot.",
          "Tele-MANAS is free, 24x7, in 20+ languages: call 14416. you do not need a crisis to call, just a hard time. if you feel unsafe right now, call 112. under 18? Childline 1098.",
          "and after results, whatever they are: you did a hard thing by showing up. perfection was never the deal. bas, you were supposed to try, and you did."
        ]
      }
    ],
    "actions": [
      "mute the family group for 48 hours. set a reminder to unmute.",
      "do the 4-2-6 breath four times tonight, phone in another room.",
      "text one person: \"can i call you tomorrow after the result / interview?\""
    ],
    "tools": [
      "panic",
      "worry-box",
      "wind-down"
    ],
    "helplineNote": "Tele-MANAS 14416 (free, 24x7, 20+ languages). Emergency: 112. Under 18: Childline 1098.",
    "cover": "anxious",
    "accent": "sun"
  }
]

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug)
