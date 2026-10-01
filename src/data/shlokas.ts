export type Vibe = 'strength' | 'peace' | 'focus' | 'truth' | 'earth' | 'faith' | 'love' | 'respect'

export type Shloka = {
  id: string
  devanagari: string
  roman: string
  meaning: string
  /** Same idea, said the way you'd text it. */
  genz: string
  source: string
  vibes: Vibe[]
}

export const vibeLabels: Record<Vibe, string> = {
  strength: '💪 strength',
  peace: '🕊️ peace',
  focus: '🎯 focus',
  truth: '🔥 truth',
  earth: '🌍 earth',
  faith: '🙏 faith',
  love: '💗 love',
  respect: '🤝 respect',
}

export const shlokas: Shloka[] = [
  {
    id: 'gita-2-47',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    roman: 'karmaṇy-evādhikāras te mā phaleṣhu kadāchana\nmā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi',
    meaning: 'You have a right to your work, never to its results. Don’t make results your motive — and don’t get attached to doing nothing either.',
    genz: 'Do the work. Let go of the likes. Not posting at all isn’t the answer either.',
    source: 'Bhagavad Gita 2.47',
    vibes: ['focus', 'strength'],
  },
  {
    id: 'gita-2-48',
    devanagari: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥',
    roman: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga uchyate',
    meaning: 'Act from a steady centre, free of clinging. Stay the same in success and failure — that evenness is called yoga.',
    genz: 'Win or flop, stay level. That’s the whole cheat code against perfectionism.',
    source: 'Bhagavad Gita 2.48',
    vibes: ['peace', 'focus'],
  },
  {
    id: 'gita-2-3',
    devanagari: 'क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते ।\nक्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप ॥',
    roman: 'klaibyaṁ mā sma gamaḥ pārtha naitat tvayy upapadyate\nkṣhudraṁ hṛidaya-daurbalyaṁ tyaktvottiṣhṭha parantapa',
    meaning: 'Don’t give in to this weakness, Arjuna — it doesn’t suit you. Shake off this small faint-heartedness and stand up, warrior.',
    genz: 'Get up. You’re literally built for this.',
    source: 'Bhagavad Gita 2.3',
    vibes: ['strength'],
  },
  {
    id: 'gita-6-5',
    devanagari: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥',
    roman: 'uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hyātmano bandhur ātmaiva ripur ātmanaḥ',
    meaning: 'Lift yourself up by your own effort; never pull yourself down. You are your own best friend — and your own worst enemy.',
    genz: 'Be your own hype-person, not your own hater.',
    source: 'Bhagavad Gita 6.5',
    vibes: ['strength', 'love'],
  },
  {
    id: 'gita-2-14',
    devanagari: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः ।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥',
    roman: 'mātrā-sparśhās tu kaunteya śhītoṣhṇa-sukha-duḥkha-dāḥ\nāgamāpāyino ’nityās tāns titikṣhasva bhārata',
    meaning: 'Heat and cold, pleasure and pain — they come and they go. They don’t last. Learn to bear them with patience.',
    genz: 'Bad days are temporary. So are good ones. Ride the wave.',
    source: 'Bhagavad Gita 2.14',
    vibes: ['peace', 'strength'],
  },
  {
    id: 'gita-6-35',
    devanagari: 'असंशयं महाबाहो मनो दुर्निग्रहं चलम् ।\nअभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते ॥',
    roman: 'asaṁśhayaṁ mahā-bāho mano durnigrahaṁ chalam\nabhyāsena tu kaunteya vairāgyeṇa cha gṛihyate',
    meaning: 'No doubt the mind is restless and hard to control. But with practice and letting go, it can be trained.',
    genz: 'Your brain has 47 tabs open. Practice closes them. One breath at a time.',
    source: 'Bhagavad Gita 6.35',
    vibes: ['focus', 'peace'],
  },
  {
    id: 'gita-9-26',
    devanagari: 'पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।\nतदहं भक्त्युपहृतमश्नामि प्रयतात्मनः ॥',
    roman: 'patraṁ puṣhpaṁ phalaṁ toyaṁ yo me bhaktyā prayachchhati\ntad ahaṁ bhakty-upahṛitam aśhnāmi prayatātmanaḥ',
    meaning: 'A leaf, a flower, a fruit, a little water — whatever is offered to me with love, I accept.',
    genz: 'God said a leaf is enough. So why is that baba asking for ₹51,000?',
    source: 'Bhagavad Gita 9.26',
    vibes: ['faith', 'love'],
  },
  {
    id: 'gita-2-50',
    devanagari: 'योगः कर्मसु कौशलम् ॥',
    roman: 'yogaḥ karmasu kauśhalam',
    meaning: 'Yoga is skill in action.',
    genz: 'Being good at what you do, with a calm mind — that’s the real flex.',
    source: 'Bhagavad Gita 2.50',
    vibes: ['focus'],
  },
  {
    id: 'katha-uttishthata',
    devanagari: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत ।\nक्षुरस्य धारा निशिता दुरत्यया दुर्गं पथस्तत्कवयो वदन्ति ॥',
    roman: 'uttiṣhṭhata jāgrata prāpya varān nibodhata\nkṣhurasya dhārā niśhitā duratyayā durgaṁ pathas tat kavayo vadanti',
    meaning: 'Arise! Awake! Find the wise and learn. The path is sharp as a razor’s edge, hard to walk — so say the sages.',
    genz: 'Wake up. Find your mentors. It’s gonna be hard — that’s how you know it’s real.',
    source: 'Katha Upanishad 1.3.14',
    vibes: ['strength', 'focus'],
  },
  {
    id: 'hitopadesha-udyamena',
    devanagari: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः ।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः ॥',
    roman: 'udyamena hi sidhyanti kāryāṇi na manorathaiḥ\nna hi suptasya siṁhasya praviśhanti mukhe mṛigāḥ',
    meaning: 'Work gets done through effort, not wishes. Deer don’t walk into the mouth of a sleeping lion.',
    genz: 'Manifesting is cute. Grinding is cuter. Even lions have to hunt.',
    source: 'Hitopadesha',
    vibes: ['strength', 'focus'],
  },
  {
    id: 'mundaka-satyameva',
    devanagari: 'सत्यमेव जयते ॥',
    roman: 'satyam eva jayate',
    meaning: 'Truth alone triumphs.',
    genz: 'Lies need a sequel. Truth doesn’t. Tell it early.',
    source: 'Mundaka Upanishad 3.1.6',
    vibes: ['truth'],
  },
  {
    id: 'brihad-asato',
    devanagari: 'असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।\nमृत्योर्मा अमृतं गमय ॥',
    roman: 'asato mā sad gamaya, tamaso mā jyotir gamaya\nmṛityor mā amṛitaṁ gamaya',
    meaning: 'Lead me from the unreal to the real, from darkness to light, from death to immortality.',
    genz: 'From fake to real. From dark to lit. Glow-up, but for the soul.',
    source: 'Brihadaranyaka Upanishad 1.3.28',
    vibes: ['truth', 'peace', 'faith'],
  },
  {
    id: 'sarve-bhavantu',
    devanagari: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।\nसर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥',
    roman: 'sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ\nsarve bhadrāṇi paśhyantu mā kaśhchid duḥkha-bhāg bhavet',
    meaning: 'May everyone be happy. May everyone be healthy. May everyone see goodness. May no one suffer.',
    genz: 'Good vibes for literally everyone. No exceptions, no gatekeeping.',
    source: 'Shanti Mantra',
    vibes: ['peace', 'love'],
  },
  {
    id: 'vasudhaiva',
    devanagari: 'अयं निजः परो वेति गणना लघुचेतसाम् ।\nउदारचरितानां तु वसुधैव कुटुम्बकम् ॥',
    roman: 'ayaṁ nijaḥ paro veti gaṇanā laghu-chetasām\nudāra-charitānāṁ tu vasudhaiva kuṭumbakam',
    meaning: '“This one is mine, that one is a stranger” — only small minds count like that. For the big-hearted, the whole earth is one family.',
    genz: 'Gatekeeping who counts as “ours” is small-minded. The planet is the group chat.',
    source: 'Maha Upanishad 6.71–72',
    vibes: ['love', 'earth', 'respect'],
  },
  {
    id: 'bhumi-mata',
    devanagari: 'माता भूमिः पुत्रो अहं पृथिव्याः ॥',
    roman: 'mātā bhūmiḥ putro ahaṁ pṛithivyāḥ',
    meaning: 'The Earth is my mother, and I am her child.',
    genz: 'Mother Earth is literally your mom. Don’t trash your mom’s house.',
    source: 'Atharva Veda 12.1.12 (Bhumi Sukta)',
    vibes: ['earth'],
  },
  {
    id: 'ya-devi',
    devanagari: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥',
    roman: 'yā devī sarva-bhūteṣhu śhakti-rūpeṇa saṁsthitā\nnamas tasyai namas tasyai namas tasyai namo namaḥ',
    meaning: 'To the Goddess who lives in every being as power — salutations, again and again.',
    genz: 'The Shakti isn’t up there somewhere. She’s in you. Act like it.',
    source: 'Devi Mahatmya, ch. 5',
    vibes: ['strength', 'respect', 'faith'],
  },
  {
    id: 'yatra-naryastu',
    devanagari: 'यत्र नार्यस्तु पूज्यन्ते रमन्ते तत्र देवताः ।\nयत्रैतास्तु न पूज्यन्ते सर्वास्तत्राफलाः क्रियाः ॥',
    roman: 'yatra nāryas tu pūjyante ramante tatra devatāḥ\nyatraitās tu na pūjyante sarvās tatrāphalāḥ kriyāḥ',
    meaning: 'Where women are honoured, the divine rejoices. Where they are not, every ritual is useless.',
    genz: 'No amount of puja cancels out disrespecting women. Period.',
    source: 'Manusmriti 3.56',
    vibes: ['respect'],
  },
  {
    id: 'taittiriya-matru',
    devanagari: 'मातृदेवो भव । पितृदेवो भव ।\nआचार्यदेवो भव । अतिथिदेवो भव ॥',
    roman: 'mātṛi-devo bhava, pitṛi-devo bhava\nāchārya-devo bhava, atithi-devo bhava',
    meaning: 'Treat your mother as divine. Treat your father as divine. Your teacher, and even your guest — as divine.',
    genz: 'Your parents are your OG team. Keep them in the loop.',
    source: 'Taittiriya Upanishad 1.11.2',
    vibes: ['respect', 'love', 'truth'],
  },
  {
    id: 'yoga-sutra-1-2',
    devanagari: 'योगश्चित्तवृत्तिनिरोधः ॥',
    roman: 'yogaśh chitta-vṛitti-nirodhaḥ',
    meaning: 'Yoga is the stilling of the movements of the mind.',
    genz: 'Yoga isn’t the stretchy pose. It’s muting the noise in your head.',
    source: 'Yoga Sutras of Patanjali 1.2',
    vibes: ['peace', 'focus'],
  },
]

export const shlokaById = (id: string) => {
  const s = shlokas.find((x) => x.id === id)
  if (!s) throw new Error(`Unknown shloka ${id}`)
  return s
}
