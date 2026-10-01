// The same ideas, in the words of every major tradition.
// Quran: Saheeh International · Bible: King James Version · Gurbani: BaniDB (Sant Singh Khalsa) ·
// Dhammapada & Kalama Sutta: Bhikkhu Sujato (CC0) · Tao Te Ching & Analects: James Legge.

export type Tradition = 'hindu' | 'sikh' | 'islam' | 'christian' | 'jewish' | 'buddhist' | 'jain' | 'taoist' | 'confucian' | 'stoic' | 'zoroastrian' | 'bahai'

export const traditions: Record<Tradition, { label: string; emoji: string }> = {
  hindu: { label: 'Hindu', emoji: '🕉️' },
  sikh: { label: 'Sikh', emoji: '☬' },
  islam: { label: 'Islam', emoji: '☪️' },
  christian: { label: 'Christian', emoji: '✝️' },
  jewish: { label: 'Jewish', emoji: '✡️' },
  buddhist: { label: 'Buddhist', emoji: '☸️' },
  jain: { label: 'Jain', emoji: '🤚' },
  taoist: { label: 'Taoist', emoji: '☯️' },
  confucian: { label: 'Confucian', emoji: '📜' },
  stoic: { label: 'Stoic', emoji: '🏛️' },
  zoroastrian: { label: 'Zoroastrian', emoji: '🔥' },
  bahai: { label: 'Baháʼí', emoji: '🌍' },
}

export type Theme = 'golden' | 'courage' | 'action' | 'calm' | 'truth' | 'oneness' | 'earth' | 'women' | 'parents' | 'middlemen'

export const themes: Record<Theme, { title: string; line: string }> = {
  golden: { title: 'the golden rule', line: 'Treat people the way you want to be treated. Every single tradition said it.' },
  courage: { title: 'don’t be afraid', line: 'Every book says the same thing to a scared kid: you’re stronger than this.' },
  action: { title: 'you do the work', line: 'Wishing isn’t a plan. Every tradition agrees: change starts with you.' },
  calm: { title: 'you don’t have to be perfect', line: 'Do your part, let go of the rest. Perfection was never the assignment.' },
  truth: { title: 'truth wins', line: 'No religion on earth tells you to lie your way out.' },
  oneness: { title: 'we’re one family', line: 'Different names for God. Same humans.' },
  earth: { title: 'protect the earth', line: 'Every faith calls the planet sacred. Act like it.' },
  women: { title: 'respect her', line: 'Disrespecting women isn’t “culture”. Every scripture rejects it.' },
  parents: { title: 'honour your parents', line: 'The OG team, across every tradition.' },
  middlemen: { title: 'no middlemen needed', line: 'God doesn’t need a broker, a fee or your OTP.' },
}

export type Wisdom = {
  id: string
  tradition: Tradition
  themes: Theme[]
  text: string
  original?: string
  lang?: string
  rtl?: boolean
  roman?: string
  source: string
}

export const wisdom: Wisdom[] = [
  // ── golden rule ──
  { id: 'luke-6-31', tradition: 'christian', themes: ['golden'], text: 'And as ye would that men should do to you, do ye also to them likewise.', source: 'Luke 6:31' },
  { id: 'bukhari-13', tradition: 'islam', themes: ['golden'], text: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'Hadith · Sahih al-Bukhari 13' },
  { id: 'hillel', tradition: 'jewish', themes: ['golden'], text: 'What is hateful to you, do not do to your fellow. That is the whole Torah; the rest is commentary — go and learn it.', source: 'Rabbi Hillel · Talmud, Shabbat 31a' },
  { id: 'mbh-13-113-8', tradition: 'hindu', themes: ['golden'], text: 'One should never do that to another which one regards as injurious to one’s own self. This, in brief, is the rule of dharma.', source: 'Mahabharata · Anushasana Parva 113.8' },
  { id: 'udanavarga-5-18', tradition: 'buddhist', themes: ['golden'], text: 'Hurt not others in ways that you yourself would find hurtful.', source: 'Udanavarga 5.18' },
  { id: 'sggs-1299', tradition: 'sikh', themes: ['golden', 'oneness'], original: 'ਨਾ ਕੋ ਬੈਰੀ ਨਹੀ ਬਿਗਾਨਾ ਸਗਲ ਸੰਗਿ ਹਮ ਕਉ ਬਨਿ ਆਈ ॥', lang: 'pa', roman: 'naa ko bairee nahee bigaanaa sagal sang ham kau ban aaiee', text: 'No one is my enemy, and no one is a stranger. I get along with everyone.', source: 'Guru Arjan Dev Ji · Guru Granth Sahib, Ang 1299' },
  { id: 'sutrakritanga', tradition: 'jain', themes: ['golden'], text: 'A man should wander about treating all creatures as he himself would be treated.', source: 'Sutrakritanga 1.11.33' },
  { id: 'kan-ying', tradition: 'taoist', themes: ['golden'], text: 'Regard your neighbour’s gain as your own gain, and your neighbour’s loss as your own loss.', source: 'Tai Shang Kan Ying Pian' },
  { id: 'analects-15-24', tradition: 'confucian', themes: ['golden'], text: 'What you do not want done to yourself, do not do to others.', source: 'Confucius · Analects 15.24' },
  { id: 'dadistan', tradition: 'zoroastrian', themes: ['golden'], text: 'That nature alone is good which refrains from doing unto another whatsoever is not good for itself.', source: 'Dadistan-i-Dinik 94.5' },
  { id: 'gleanings-66', tradition: 'bahai', themes: ['golden'], text: 'Lay not on any soul a load that ye would not wish to be laid upon you, and desire not for anyone the things ye would not desire for yourselves.', source: 'Baháʼuʼlláh · Gleanings 66' },

  // ── courage ──
  { id: '2-tim-1-7', tradition: 'christian', themes: ['courage'], text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', source: '2 Timothy 1:7' },
  { id: 'joshua-1-9', tradition: 'jewish', themes: ['courage'], text: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', source: 'Joshua 1:9' },
  { id: 'quran-94-5', tradition: 'islam', themes: ['courage', 'calm'], original: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا\nإِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا', lang: 'ar', rtl: true, roman: "Fa inna ma'al usri yusra. Inna ma'al 'usri yusra.", text: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.', source: 'Quran 94:5–6' },
  { id: 'sggs-1427', tradition: 'sikh', themes: ['courage'], original: 'ਭੈ ਕਾਹੂ ਕਉ ਦੇਤ ਨਹਿ ਨਹਿ ਭੈ ਮਾਨਤ ਆਨ ॥', lang: 'pa', roman: 'bhai kaahoo kau dhet neh neh bhai maanat aan', text: 'One who does not frighten anyone, and who is not afraid of anyone else — says Nanak, listen, mind: call him spiritually wise.', source: 'Guru Tegh Bahadur Ji · Guru Granth Sahib, Ang 1427' },
  { id: 'dhp-103', tradition: 'buddhist', themes: ['courage'], original: 'Yo sahassaṁ sahassena, saṅgāme mānuse jine;\nEkañca jeyyamattānaṁ, sa ve saṅgāmajuttamo.', lang: 'pi', text: 'The supreme conqueror is not he who conquers a million men in battle, but he who conquers a single man: himself.', source: 'Dhammapada 103' },
  { id: 'gita-2-3-w', tradition: 'hindu', themes: ['courage'], original: 'क्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप ॥', lang: 'sa', roman: 'kṣhudraṁ hṛidaya-daurbalyaṁ tyaktvottiṣhṭha parantapa', text: 'Shake off this petty weakness of heart and stand up, O scorcher of enemies.', source: 'Bhagavad Gita 2.3' },
  { id: 'seneca-13', tradition: 'stoic', themes: ['courage', 'calm'], text: 'There are more things, Lucilius, likely to frighten us than there are to crush us; we suffer more often in imagination than in reality.', source: 'Seneca · Letters to Lucilius, 13' },
  { id: 'ttc-33', tradition: 'taoist', themes: ['courage'], text: 'He who overcomes others is strong; he who overcomes himself is mighty.', source: 'Tao Te Ching 33' },

  // ── action ──
  { id: 'quran-13-11', tradition: 'islam', themes: ['action'], original: 'إِنَّ ٱللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا۟ مَا بِأَنفُسِهِمْ', lang: 'ar', rtl: true, text: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', source: 'Quran 13:11' },
  { id: 'dhp-276', tradition: 'buddhist', themes: ['action', 'middlemen'], original: 'Tumhehi kiccamātappaṁ, akkhātāro tathāgatā;', lang: 'pi', text: 'You yourselves must do the work, the Realized Ones just show the way.', source: 'Dhammapada 276' },
  { id: 'ttc-64', tradition: 'taoist', themes: ['action'], text: 'The journey of a thousand li commences with a single step.', source: 'Tao Te Ching 64' },
  { id: 'udyamena-w', tradition: 'hindu', themes: ['action'], original: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः ।', lang: 'sa', roman: 'udyamena hi sidhyanti kāryāṇi na manorathaiḥ', text: 'Work gets done through effort, not through wishes.', source: 'Hitopadesha' },
  { id: 'sggs-1245-work', tradition: 'sikh', themes: ['action'], original: 'ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ ॥ ਨਾਨਕ ਰਾਹੁ ਪਛਾਣਹਿ ਸੇਇ ॥', lang: 'pa', roman: 'ghaal khai kichh hathahu dhei, naanak raahu pachhaaneh sei', text: 'One who works for what he eats, and gives some of what he has — O Nanak, he knows the Path.', source: 'Guru Nanak Dev Ji · Guru Granth Sahib, Ang 1245' },

  // ── calm / anti-perfection ──
  { id: 'gita-2-48-w', tradition: 'hindu', themes: ['calm'], original: 'सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥', lang: 'sa', roman: 'siddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga uchyate', text: 'Stay the same in success and failure — that evenness is called yoga.', source: 'Bhagavad Gita 2.48' },
  { id: 'matthew-6-34', tradition: 'christian', themes: ['calm'], text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.', source: 'Matthew 6:34' },
  { id: 'quran-2-286', tradition: 'islam', themes: ['calm'], original: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا', lang: 'ar', rtl: true, roman: "Laa yukalliful-laahu nafsan illaa wus'ahaa", text: 'Allah does not charge a soul except [with that within] its capacity.', source: 'Quran 2:286' },
  { id: 'avot-2-16', tradition: 'jewish', themes: ['calm', 'action'], text: 'It is not your duty to finish the work, but neither are you free to desist from it.', source: 'Rabbi Tarfon · Pirkei Avot 2:16' },
  { id: 'ttc-9', tradition: 'taoist', themes: ['calm'], text: 'It is better to leave a vessel unfilled, than to attempt to carry it when it is full.', source: 'Tao Te Ching 9' },
  { id: 'epictetus-1', tradition: 'stoic', themes: ['calm'], text: 'There are things which are within our power, and there are things which are beyond our power.', source: 'Epictetus · Enchiridion 1' },

  // ── truth ──
  { id: 'satyameva-w', tradition: 'hindu', themes: ['truth'], original: 'सत्यमेव जयते ॥', lang: 'sa', roman: 'satyam eva jayate', text: 'Truth alone triumphs.', source: 'Mundaka Upanishad 3.1.6' },
  { id: 'john-8-32', tradition: 'christian', themes: ['truth'], text: 'And ye shall know the truth, and the truth shall make you free.', source: 'John 8:32' },
  { id: 'sggs-62', tradition: 'sikh', themes: ['truth'], original: 'ਸਚਹੁ ਓਰੈ ਸਭੁ ਕੋ ਉਪਰਿ ਸਚੁ ਆਚਾਰੁ ॥', lang: 'pa', roman: 'sachahu orai sabh ko upar sach aachaar', text: 'Truth is higher than everything; but higher still is truthful living.', source: 'Guru Nanak Dev Ji · Guru Granth Sahib, Ang 62' },
  { id: 'dhp-223', tradition: 'buddhist', themes: ['truth'], original: 'Akkodhena jine kodhaṁ, asādhuṁ sādhunā jine;\nJine kadariyaṁ dānena, saccenālikavādinaṁ.', lang: 'pi', text: 'Defeat anger with kindness, villainy with virtue, stinginess with giving, and lies with truth.', source: 'Dhammapada 223' },
  { id: 'humata', tradition: 'zoroastrian', themes: ['truth'], original: 'Humata, Hukhta, Hvarshta', text: 'Good thoughts, good words, good deeds.', source: 'Zoroastrian maxim' },

  // ── oneness ──
  { id: 'quran-49-13', tradition: 'islam', themes: ['oneness'], original: 'يَٰٓأَيُّهَا ٱلنَّاسُ إِنَّا خَلَقْنَٰكُم مِّن ذَكَرٍۢ وَأُنثَىٰ وَجَعَلْنَٰكُمْ شُعُوبًۭا وَقَبَآئِلَ لِتَعَارَفُوٓا۟', lang: 'ar', rtl: true, text: 'O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.', source: 'Quran 49:13' },
  { id: 'akal-ustat', tradition: 'sikh', themes: ['oneness'], original: 'ਮਾਨਸ ਕੀ ਜਾਤਿ ਸਬੈ ਏਕੈ ਪਹਿਚਾਨਬੋ ॥', lang: 'pa', roman: 'maanas kee jaat sabai ekai pahichaanabo', text: 'Someone is Hindu and someone a Muslim, someone Shia and someone Sunni — but recognise all human beings as one and the same.', source: 'Guru Gobind Singh Ji · Akal Ustat, Dasam Granth' },
  { id: 'vasudhaiva-w', tradition: 'hindu', themes: ['oneness'], original: 'उदारचरितानां तु वसुधैव कुटुम्बकम् ॥', lang: 'sa', roman: 'udāra-charitānāṁ tu vasudhaiva kuṭumbakam', text: 'For the big-hearted, the whole earth is one family.', source: 'Maha Upanishad 6.72' },
  { id: '1-john-4-8', tradition: 'christian', themes: ['oneness'], text: 'He that loveth not knoweth not God; for God is love.', source: '1 John 4:8' },
  { id: 'lev-19-18', tradition: 'jewish', themes: ['oneness', 'golden'], text: 'Thou shalt not avenge, nor bear any grudge against the children of thy people, but thou shalt love thy neighbour as thyself.', source: 'Leviticus 19:18' },
  { id: 'dhp-5', tradition: 'buddhist', themes: ['oneness'], original: 'Na hi verena verāni, sammantīdha kudācanaṁ;\nAverena ca sammanti, esa dhammo sanantano.', lang: 'pi', text: 'For never is hatred laid to rest by hate, it’s laid to rest by love: this is an ancient teaching.', source: 'Dhammapada 5' },
  { id: 'one-country', tradition: 'bahai', themes: ['oneness'], text: 'The earth is but one country, and mankind its citizens.', source: 'Baháʼuʼlláh · Gleanings 117' },
  { id: 'parasparopagraho', tradition: 'jain', themes: ['oneness'], original: 'परस्परोपग्रहो जीवानाम्', lang: 'sa', roman: 'parasparopagraho jīvānām', text: 'Souls render service to one another.', source: 'Tattvartha Sutra 5.21' },

  // ── earth ──
  { id: 'bhumi-w', tradition: 'hindu', themes: ['earth'], original: 'माता भूमिः पुत्रो अहं पृथिव्याः ॥', lang: 'sa', roman: 'mātā bhūmiḥ putro ahaṁ pṛithivyāḥ', text: 'The Earth is my mother, and I am her child.', source: 'Atharva Veda 12.1.12' },
  { id: 'sggs-8', tradition: 'sikh', themes: ['earth'], original: 'ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥', lang: 'pa', roman: 'pavan guroo paanee pitaa maataa dharat mahat', text: 'Air is the Guru, Water is the Father, and Earth is the Great Mother of all.', source: 'Guru Nanak Dev Ji · Japji Sahib, Ang 8' },
  { id: 'sapling', tradition: 'islam', themes: ['earth'], text: 'If the Final Hour comes while you have a palm cutting in your hands and it is possible to plant it before the Hour comes, you should plant it.', source: 'Hadith · Al-Adab al-Mufrad 479' },
  { id: 'quran-7-31', tradition: 'islam', themes: ['earth'], original: 'وَكُلُوا۟ وَٱشْرَبُوا۟ وَلَا تُسْرِفُوٓا۟', lang: 'ar', rtl: true, text: 'Eat and drink, but be not excessive. Indeed, He likes not those who commit excess.', source: 'Quran 7:31' },
  { id: 'gen-2-15', tradition: 'jewish', themes: ['earth'], text: 'And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it.', source: 'Genesis 2:15' },
  { id: 'acaranga', tradition: 'jain', themes: ['earth'], text: 'All beings are fond of life; they like pleasure and hate pain, shun destruction and like to live, they long to live. To all life is dear.', source: 'Acaranga Sutra 1.2.3' },

  // ── women ──
  { id: 'yatra-w', tradition: 'hindu', themes: ['women'], original: 'यत्र नार्यस्तु पूज्यन्ते रमन्ते तत्र देवताः ।', lang: 'sa', roman: 'yatra nāryas tu pūjyante ramante tatra devatāḥ', text: 'Where women are honoured, the divine rejoices.', source: 'Manusmriti 3.56' },
  { id: 'sggs-473', tradition: 'sikh', themes: ['women'], original: 'ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥', lang: 'pa', roman: 'so kiau mandhaa aakheeaai jit jameh raajaan', text: 'So why call her bad? From her, kings are born.', source: 'Guru Nanak Dev Ji · Guru Granth Sahib, Ang 473' },
  { id: 'tirmidhi-1162', tradition: 'islam', themes: ['women'], text: 'The most complete of the believers in faith is the one with the best character. And the best of you are those who are best to your women.', source: 'Hadith · Jami at-Tirmidhi 1162' },
  { id: 'gal-3-28', tradition: 'christian', themes: ['women', 'oneness'], text: 'There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for ye are all one in Christ Jesus.', source: 'Galatians 3:28' },

  // ── parents ──
  { id: 'matru-w', tradition: 'hindu', themes: ['parents'], original: 'मातृदेवो भव । पितृदेवो भव ।', lang: 'sa', roman: 'mātṛi-devo bhava, pitṛi-devo bhava', text: 'Treat your mother as divine. Treat your father as divine.', source: 'Taittiriya Upanishad 1.11.2' },
  { id: 'quran-17-23', tradition: 'islam', themes: ['parents'], original: 'فَلَا تَقُل لَّهُمَآ أُفٍّۢ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًۭا كَرِيمًۭا', lang: 'ar', rtl: true, text: 'Say not to them [so much as], “uff,” and do not repel them but speak to them a noble word.', source: 'Quran 17:23' },
  { id: 'exodus-20-12', tradition: 'jewish', themes: ['parents'], text: 'Honour thy father and thy mother: that thy days may be long upon the land which the LORD thy God giveth thee.', source: 'Exodus 20:12' },
  { id: 'nasai-3104', tradition: 'islam', themes: ['parents'], text: 'Stay with her, for Paradise is beneath her feet.', source: 'Hadith · Sunan an-Nasa’i 3104' },

  // ── no middlemen ──
  { id: 'gita-9-26-w', tradition: 'hindu', themes: ['middlemen'], original: 'पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति ।', lang: 'sa', roman: 'patraṁ puṣhpaṁ phalaṁ toyaṁ yo me bhaktyā prayachchhati', text: 'A leaf, a flower, a fruit, a little water — whatever is offered with love, I accept.', source: 'Bhagavad Gita 9.26' },
  { id: 'sggs-1245', tradition: 'sikh', themes: ['middlemen'], original: 'ਗੁਰੁ ਪੀਰੁ ਸਦਾਏ ਮੰਗਣ ਜਾਇ ॥ ਤਾ ਕੈ ਮੂਲਿ ਨ ਲਗੀਐ ਪਾਇ ॥', lang: 'pa', roman: 'gur peer sadhaae mangan jai, taa kai mool na lageeaai pai', text: 'One who calls himself a guru or a spiritual teacher, while he goes around begging — don’t ever touch his feet.', source: 'Guru Nanak Dev Ji · Guru Granth Sahib, Ang 1245' },
  { id: 'quran-2-186', tradition: 'islam', themes: ['middlemen'], original: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ', lang: 'ar', rtl: true, text: 'And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.', source: 'Quran 2:186' },
  { id: 'matthew-7-15', tradition: 'christian', themes: ['middlemen'], text: 'Beware of false prophets, which come to you in sheep’s clothing, but inwardly they are ravening wolves.', source: 'Matthew 7:15' },
  { id: 'matthew-6-6', tradition: 'christian', themes: ['middlemen'], text: 'But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret.', source: 'Matthew 6:6' },
  { id: 'kalama', tradition: 'buddhist', themes: ['middlemen', 'truth'], text: 'Don’t go by oral transmission, don’t go by lineage… and don’t think “The ascetic is our respected teacher.” But when you know for yourselves: “These things are unskillful, blameworthy… they lead to harm and suffering”, then you should give them up.', source: 'Kalama Sutta · Anguttara Nikaya 3.65' },
]

export const wisdomFor = (theme: Theme) => wisdom.filter((w) => w.themes.includes(theme))
