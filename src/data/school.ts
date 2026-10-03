// School shelf: every NCERT textbook, class 1–12, straight from ncert.nic.in.
// Generated from the official textbook page (www.ncert.nic.in/textbook.php) on 2026-10-03 — the codes are NCERT's own.

export type Edition = { title: string; code: string }
export type Subject = { subject: string; en: Edition[]; hi: Edition[] }
export type SchoolClass = { cls: number; subjects: Subject[] }

/** NCERT's own page for a book — it lists every chapter as a free PDF. */
export const ncertUrl = (code: string) => `https://www.ncert.nic.in/textbook.php?${code}`

export const SCHOOL: SchoolClass[] = [
  {
    cls: 1,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Joyful-Mathematics (English)', code: 'aejm1=0-13' }], hi: [{ title: 'Joyful-Mathematics (Hindi)', code: 'ahjm1=0-13' }] },
      { subject: 'English', en: [{ title: 'Mridang', code: 'aemr1=0-9' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Sarangi', code: 'ahsr1=0-19' }], hi: [] },
    ],
  },
  {
    cls: 2,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Joyful-Mathematics (English)', code: 'bejm1=0-11' }], hi: [{ title: 'Joyful-Mathematics (Hindi)', code: 'bhjm1=0-11' }] },
      { subject: 'English', en: [{ title: 'Mridang', code: 'bemr1=0-13' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Sarangi', code: 'bhsr1=0-26' }], hi: [] },
    ],
  },
  {
    cls: 3,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Mathematics', code: 'cemh1=0-14' },
          { title: 'Maths Mela', code: 'cemm1=0-14' },
        ],
        hi: [
          { title: 'Ganit', code: 'chmh1=0-14' },
          { title: 'Ganit Mela', code: 'chmm1=0-14' },
        ],
      },
      { subject: 'The World Around Us', en: [{ title: 'Our Wondrous World', code: 'ceev1=0-12' }], hi: [{ title: 'Hamara Adhbhut Sansar', code: 'chev1=0-12' }] },
      { subject: 'Environmental Studies', en: [{ title: 'Looking Around', code: 'ceap1=0-24' }], hi: [{ title: 'Aas-Pass', code: 'chap1=0-24' }] },
      {
        subject: 'English',
        en: [
          { title: 'Marigold', code: 'ceen1=0-10' },
          { title: 'Santoor', code: 'cesa1=0-12' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Rimjhim', code: 'chhn1=0-13' },
          { title: 'Veena', code: 'chve1=0-18' },
        ],
        hi: [],
      },
    ],
  },
  {
    cls: 4,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Math-Mela', code: 'demm1=0-14' }], hi: [{ title: 'Ganit Mela', code: 'dhmm1=0-14' }] },
      { subject: 'The World Around Us', en: [{ title: 'Our Wonderous World', code: 'deev1=0-10' }], hi: [{ title: 'Hamara Adhbhut Sansar', code: 'dhev1=0-10' }] },
      { subject: 'Environmental Studies', en: [{ title: 'Looking Around(EVS)', code: 'deap1=0-27' }], hi: [{ title: 'Aas Paas', code: 'dhap1=0-27' }] },
      { subject: 'English', en: [{ title: 'Santoor', code: 'desa1=0-12' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Veena', code: 'dhve1=0-13' }], hi: [] },
    ],
  },
  {
    cls: 5,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Math-Mela', code: 'eemm1=0-15' },
          { title: 'Math-Magic', code: 'eemh1=0-14' },
        ],
        hi: [
          { title: 'Ganit-Mela', code: 'ehmm1=0-15' },
          { title: 'Ganit', code: 'ehmh1=0-14' },
        ],
      },
      { subject: 'The World Around Us', en: [{ title: 'Our Wonderous World', code: 'eeev1=0-10' }], hi: [{ title: 'Hamara Adbhut Sansar', code: 'ehev1=0-10' }] },
      { subject: 'Environmental Studies', en: [{ title: 'Looking Around', code: 'eeap1=0-22' }], hi: [{ title: 'Aas-Pass', code: 'ehap1=0-22' }] },
      {
        subject: 'English',
        en: [
          { title: 'Santoor', code: 'eesa1=0-10' },
          { title: 'Marigold', code: 'eeen1=0-10' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Veena', code: 'ehve1=0-12' },
          { title: 'Rimjhim', code: 'ehhn1=0-18' },
        ],
        hi: [],
      },
    ],
  },
  {
    cls: 6,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Ganita Prakash', code: 'fegp1=0-10' }], hi: [{ title: 'Ganita Prakash (Hindi)', code: 'fhgp1=0-10' }] },
      { subject: 'Science', en: [{ title: 'Curiosity', code: 'fecu1=0-12' }], hi: [{ title: 'Jigyasa', code: 'fhcu1=0-12' }] },
      { subject: 'Social Science', en: [{ title: 'Exploring Society India and Beyond', code: 'fees1=0-14' }], hi: [{ title: 'Samaj Ka Aadhyan: Bharat or uske aage', code: 'fhes1=0-14' }] },
      { subject: 'English', en: [{ title: 'Poorvi', code: 'fepr1=0-5' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Malhar', code: 'fhml1=0-13' }], hi: [] },
      { subject: 'Sanskrit', en: [{ title: 'Deepakam', code: 'fsde1=0-16' }], hi: [] },
    ],
  },
  {
    cls: 7,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Ganita Prakash', code: 'gegp1=0-8' },
          { title: 'Ganita Prakash-II', code: 'gegp2=0-7' },
        ],
        hi: [
          { title: 'Ganita Prakash(Hindi)', code: 'ghgp1=0-8' },
          { title: 'Ganita Prakash-II (Hindi)', code: 'ghgp2=0-7' },
        ],
      },
      { subject: 'Science', en: [{ title: 'Curiosity', code: 'gecu1=0-12' }], hi: [{ title: 'Jigyasa', code: 'ghcu1=0-12' }] },
      {
        subject: 'Social Science',
        en: [
          { title: 'Exploring Society India and Beyond Part-I', code: 'gees1=0-12' },
          { title: 'Exploring Society India and Beyond Part-II', code: 'gees2=0-8' },
        ],
        hi: [
          { title: 'Samaj Ka Aadhyan: Bharat or uske aage Part-I', code: 'ghes1=0-12' },
          { title: 'Samaj Ka Aadhyan: Bharat or uske aage Part-II', code: 'ghes2=0-8' },
        ],
      },
      { subject: 'English', en: [{ title: 'Poorvi', code: 'gepr1=0-5' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Malhar', code: 'ghml1=0-10' }], hi: [] },
      { subject: 'Sanskrit', en: [{ title: 'Deepakam', code: 'gsde1=0-15' }], hi: [] },
    ],
  },
  {
    cls: 8,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Ganita Prakash Part-I', code: 'hegp1=0-7' },
          { title: 'Ganita Prakash Part-II', code: 'hegp2=0-7' },
          { title: 'Mathematics', code: 'hemh1=0-13' },
        ],
        hi: [
          { title: 'Ganita Prakash Part-I (Hindi)', code: 'hhgp1=0-7' },
          { title: 'Ganita Prakash Part-II (Hindi)', code: 'hhgp2=0-7' },
          { title: 'Ganit', code: 'hhmh1=0-13' },
        ],
      },
      {
        subject: 'Science',
        en: [
          { title: 'Curiosity', code: 'hecu1=0-13' },
          { title: 'Science', code: 'hesc1=0-13' },
        ],
        hi: [
          { title: 'Jigyasa', code: 'hhcu1=0-13' },
          { title: 'Vigyan', code: 'hhsc1=0-13' },
        ],
      },
      {
        subject: 'Social Science',
        en: [
          { title: 'Exploring Society India and Beyond Part-I', code: 'hees1=0-7' },
          { title: 'Exploring Society India and Beyond Part-II', code: 'hees2=0-8' },
          { title: 'Resource And Development(Geography)', code: 'hess4=0-5' },
          { title: 'Social And Political Life', code: 'hess3=0-8' },
          { title: 'Our-Pasts-III', code: 'hess2=0-8' },
        ],
        hi: [
          { title: 'Samaj Ka Aadhyan: Bharat or uske aage Part-I', code: 'hhes1=0-7' },
          { title: 'Sansadhan Avam Vikas(Bhugol)', code: 'hhss4=0-5' },
          { title: 'Samajik Avam Rajnatik Jeevan', code: 'hhss3=0-8' },
        ],
      },
      {
        subject: 'English',
        en: [
          { title: 'Poorvi', code: 'hepr1=0-5' },
          { title: 'Honeydew', code: 'hehd1=0-8' },
          { title: 'It So Happend', code: 'heih1=0-8' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Malhar', code: 'hhml1=0-10' },
          { title: 'Vasant', code: 'hhvs1=0-13' },
          { title: 'Durva', code: 'hhdv1=0-19' },
          { title: 'Bharat Ki Khoj', code: 'hhbk1=0-9' },
          { title: 'Sanshipt Budhcharit', code: 'hhsb1=0-5' },
        ],
        hi: [],
      },
      {
        subject: 'Sanskrit',
        en: [
          { title: 'Deepakam', code: 'hsde1=0-16' },
          { title: 'Ruchira', code: 'hhsk1=0-14' },
        ],
        hi: [],
      },
    ],
  },
  {
    cls: 9,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Ganita Manjari', code: 'iemh1=0-8' },
          { title: 'Ganita Manjari PART-II', code: 'iemh2=0-6' },
        ],
        hi: [{ title: 'Ganita Manjari (Hindi)', code: 'ihmh1=0-8' }],
      },
      { subject: 'Science', en: [{ title: 'Exploration', code: 'iesc1=0-13' }], hi: [{ title: 'Anveshan', code: 'ihsc1=0-13' }] },
      { subject: 'Social Science', en: [{ title: 'Understanding Society India and Beyond PART-I', code: 'iest1=0-9' }], hi: [] },
      { subject: 'English', en: [{ title: 'Kaveri', code: 'iebe1=0-8' }], hi: [] },
      { subject: 'Hindi', en: [{ title: 'Ganga', code: 'ihga1=0-12' }], hi: [] },
      {
        subject: 'Sanskrit',
        en: [
          { title: 'Sharada', code: 'ihsh1=0-16' },
          { title: 'Risikulya(R2)', code: 'isanskritr21=0-10' },
        ],
        hi: [],
      },
    ],
  },
  {
    cls: 10,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Mathematics', code: 'jemh1=0-14' }], hi: [{ title: 'Ganit', code: 'jhmh1=0-14' }] },
      { subject: 'Science', en: [{ title: 'Science', code: 'jesc1=0-13' }], hi: [{ title: 'Vigyan', code: 'jhsc1=0-13' }] },
      {
        subject: 'Social Science',
        en: [
          { title: 'Contemporary India', code: 'jess1=0-7' },
          { title: 'Understanding Economic Development', code: 'jess2=0-5' },
          { title: 'India and the Contemporary World-II', code: 'jess3=0-5' },
          { title: 'Democratic Politics', code: 'jess4=0-5' },
        ],
        hi: [
          { title: 'Samkalin Bharat', code: 'jhss1=0-7' },
          { title: 'Arthik Vikas ki Samajh', code: 'jhss2=0-5' },
          { title: 'Bharat Aur Samakalin Vishav-2', code: 'jhss3=0-5' },
          { title: 'Loktantrik Rajniti', code: 'jhss4=0-5' },
        ],
      },
      {
        subject: 'English',
        en: [
          { title: 'First Flight', code: 'jeff1=0-9' },
          { title: 'Foot Prints Without feet Supp. Reader', code: 'jefp1=0-9' },
          { title: 'Words and Expressions  2', code: 'jewe2=0-9' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Kshitij-2', code: 'jhks1=0-12' },
          { title: 'Sparsh', code: 'jhsp1=0-14' },
          { title: 'Sanchayan Bhag-2', code: 'jhsy1=0-3' },
          { title: 'Kritika', code: 'jhkr1=0-3' },
        ],
        hi: [],
      },
      {
        subject: 'Sanskrit',
        en: [
          { title: 'Shemushi', code: 'jhsk1=0-10' },
          { title: 'Vyakaranavithi', code: 'jhva1=0-12' },
          { title: 'Abhyaswaan Bhav-II', code: 'jsab1=0-14' },
        ],
        hi: [],
      },
    ],
  },
  {
    cls: 11,
    subjects: [
      { subject: 'Mathematics', en: [{ title: 'Mathematics', code: 'kemh1=0-14' }], hi: [{ title: 'Ganit', code: 'khmh1=0-14' }] },
      {
        subject: 'Physics',
        en: [
          { title: 'Physics Part-I', code: 'keph1=0-7' },
          { title: 'Physics Part-II', code: 'keph2=0-7' },
        ],
        hi: [
          { title: 'Bhautiki-I', code: 'khph1=0-7' },
          { title: 'Bhautiki-II', code: 'khph2=0-7' },
        ],
      },
      {
        subject: 'Chemistry',
        en: [
          { title: 'Chemistry Part-I', code: 'kech1=0-6' },
          { title: 'Chemistry Part II', code: 'kech2=0-3' },
        ],
        hi: [
          { title: 'Rasayan Vigyan bhag-I', code: 'khch1=0-6' },
          { title: 'Rasayan Vigyan bhag-II', code: 'khch2=0-3' },
        ],
      },
      { subject: 'Biology', en: [{ title: 'Biology', code: 'kebo1=0-19' }], hi: [{ title: 'Jeev Vigyan', code: 'khbo1=0-19' }] },
      { subject: 'History', en: [{ title: 'Themes in World History', code: 'kehs1=0-7' }], hi: [{ title: 'Vishwa Itihas Ke Kuch Vishay', code: 'khhs1=0-7' }] },
      {
        subject: 'Geography',
        en: [
          { title: 'Fundamental of Physical Geography', code: 'kegy2=0-14' },
          { title: 'Pratical Work in Geography', code: 'kegy3=0-6' },
          { title: 'India Physical Environment', code: 'kegy1=0-6' },
        ],
        hi: [
          { title: 'Bhautique Bhugol ke Mool Sidhant', code: 'khgy2=0-14' },
          { title: 'Bhugol Main Prayogatmak Karya', code: 'khgy3=0-6' },
          { title: 'Bhart Bhautik Paryabaran', code: 'khgy1=0-6' },
        ],
      },
      {
        subject: 'Political Science',
        en: [
          { title: 'Political Theory', code: 'keps1=0-8' },
          { title: 'India Constitution at Work', code: 'keps2=0-10' },
        ],
        hi: [
          { title: 'Raajneeti Sidhant', code: 'khps1=0-8' },
          { title: 'Bharat ka Samvidhan Sidhant aur Vyavhar', code: 'khps2=0-10' },
        ],
      },
      {
        subject: 'Economics',
        en: [
          { title: 'Indian Economic Development', code: 'keec1=0-8' },
          { title: 'Statistics for Economics', code: 'kest1=0-8' },
        ],
        hi: [
          { title: 'Sankhyiki', code: 'khst1=0-8' },
          { title: 'Bhartiya Airthryavstha Ka Vikas', code: 'khec1=0-8' },
        ],
      },
      {
        subject: 'English',
        en: [
          { title: 'Woven Words', code: 'keww1=0-27' },
          { title: 'Hornbill', code: 'kehb1=0-14' },
          { title: 'Snapshots Suppl.Reader English', code: 'kesp1=0-5' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Antra', code: 'khat1=0-16' },
          { title: 'Aroh', code: 'khar1=0-16' },
          { title: 'Vitan', code: 'khvt1=0-5' },
          { title: 'Antral', code: 'khan1=0-2' },
        ],
        hi: [],
      },
      {
        subject: 'Sanskrit',
        en: [
          { title: 'Bhaswati', code: 'khsk1=0-11' },
          { title: 'Shashwati', code: 'khsk2=0-11' },
        ],
        hi: [],
      },
      {
        subject: 'Accountancy',
        en: [
          { title: 'Financial Accounting-I', code: 'keac1=0-7' },
          { title: 'Accountancy-II', code: 'keac2=0-2' },
        ],
        hi: [
          { title: 'Lekhashastra-I', code: 'khac1=0-7' },
          { title: 'Lekhashastra-II', code: 'khac2=0-2' },
        ],
      },
      { subject: 'Business Studies', en: [{ title: 'Business Studies', code: 'kebs1=0-11' }], hi: [{ title: 'Vyavsay Adhyanan', code: 'khbs1=0-11' }] },
      { subject: 'Psychology', en: [{ title: 'Introduction to Psychology', code: 'kepy1=0-8' }], hi: [{ title: 'Manovigyan', code: 'khpy1=0-8' }] },
      {
        subject: 'Sociology',
        en: [
          { title: 'Introducing Sociology', code: 'kesy1=0-5' },
          { title: 'Understanding Society', code: 'kesy2=0-5' },
        ],
        hi: [
          { title: 'Samaj Shastra Parichay-I', code: 'khsy1=0-5' },
          { title: 'Samaj ka Bodh', code: 'khsy2=0-5' },
        ],
      },
      { subject: 'Computer Science', en: [{ title: 'Computer Science', code: 'kecs1=0-11' }], hi: [] },
      { subject: 'Informatics Practices', en: [{ title: 'Informatics Practices', code: 'keip1=0-8' }], hi: [] },
      {
        subject: 'Computers and Communication Technology',
        en: [
          { title: 'CCT Part-I', code: 'kect1=0-8' },
          { title: 'CCT Part-II', code: 'kect2=0-6' },
        ],
        hi: [
          { title: 'Computer aur Sanchar Prodhogiki Part-I', code: 'khct1=0-8' },
          { title: 'Computer aur Sanchar Prodhogiki Part-II', code: 'khct2=0-6' },
        ],
      },
      { subject: 'Biotechnology', en: [{ title: 'Biotechnology', code: 'kebt1=0-12' }], hi: [] },
    ],
  },
  {
    cls: 12,
    subjects: [
      {
        subject: 'Mathematics',
        en: [
          { title: 'Mathematics Part-I', code: 'lemh1=0-6' },
          { title: 'Mathematics Part-II', code: 'lemh2=0-7' },
        ],
        hi: [
          { title: 'Ganit-I', code: 'lhmh1=0-6' },
          { title: 'Ganit-II', code: 'lhmh2=0-7' },
        ],
      },
      {
        subject: 'Physics',
        en: [
          { title: 'Physics Part-I', code: 'leph1=0-8' },
          { title: 'Physics Part-II', code: 'leph2=0-6' },
        ],
        hi: [
          { title: 'Bhautiki-I', code: 'lhph1=0-8' },
          { title: 'Bhautiki-II', code: 'lhph2=0-6' },
        ],
      },
      {
        subject: 'Chemistry',
        en: [
          { title: 'Chemistry-I', code: 'lech1=0-5' },
          { title: 'Chemistry-II', code: 'lech2=0-5' },
        ],
        hi: [
          { title: 'Rasayan vigyan bhag I', code: 'lhch1=0-5' },
          { title: 'Rasayan vigyan bhag II', code: 'lhch2=0-5' },
        ],
      },
      { subject: 'Biology', en: [{ title: 'Biology', code: 'lebo1=0-13' }], hi: [{ title: 'Jeev Vigyan', code: 'lhbo1=0-13' }] },
      {
        subject: 'History',
        en: [
          { title: 'Themes in Indian History-I', code: 'lehs1=0-4' },
          { title: 'Themes in Indian History-II', code: 'lehs2=0-4' },
          { title: 'Themes in Indian History-III', code: 'lehs3=0-4' },
        ],
        hi: [
          { title: 'Bharatiya Itihas ke kuchh Vishay-I', code: 'lhhs1=0-4' },
          { title: 'Bharatiya Itihas ke kuchh Vishay-II', code: 'lhhs2=0-4' },
          { title: 'Bharatiya Itihas ke kuchh Vishay-III', code: 'lhhs3=0-4' },
        ],
      },
      {
        subject: 'Geography',
        en: [
          { title: 'Fundamentals of Human Geography', code: 'legy1=0-8' },
          { title: 'Practical Work in Geography Part II', code: 'legy3=0-4' },
          { title: 'India -People And Economy', code: 'legy2=0-9' },
        ],
        hi: [
          { title: 'Manav Bhugol Ke Mool Sidhant', code: 'lhgy1=0-8' },
          { title: 'Bhugol main peryojnatmak pryogatmak karye', code: 'lhgy3=0-4' },
          { title: 'Bharat log aur arthvyasastha(Bhugol)', code: 'lhgy2=0-9' },
        ],
      },
      {
        subject: 'Political Science',
        en: [
          { title: 'Contemporary World Politics', code: 'leps1=0-7' },
          { title: 'Politics in India Since Independence', code: 'leps2=0-8' },
        ],
        hi: [
          { title: 'Samkalin Vishwa Rajniti', code: 'lhps1=0-7' },
          { title: 'Swatantra Bharat Mein Rajniti-II', code: 'lhps2=0-8' },
        ],
      },
      {
        subject: 'Economics',
        en: [
          { title: 'Introductory Microeconomics', code: 'leec2=0-5' },
          { title: 'Introductory Macroeconomics', code: 'leec1=0-6' },
        ],
        hi: [
          { title: 'Vyashthi Arthshasrta', code: 'lhec2=0-5' },
          { title: 'Samashty Arthshastra Ek Parichay', code: 'lhec1=0-6' },
        ],
      },
      {
        subject: 'English',
        en: [
          { title: 'Kaliedoscope', code: 'lekl1=0-21' },
          { title: 'Flamingo', code: 'lefl1=0-13' },
          { title: 'Vistas', code: 'levt1=0-6' },
        ],
        hi: [],
      },
      {
        subject: 'Hindi',
        en: [
          { title: 'Antra', code: 'lhat1=0-21' },
          { title: 'Aroh', code: 'lhar1=0-15' },
          { title: 'Vitan', code: 'lhvt1=0-3' },
          { title: 'Antral Bhag 2', code: 'lhan1=0-3' },
        ],
        hi: [],
      },
      {
        subject: 'Sanskrit',
        en: [
          { title: 'Bhaswati', code: 'lhsk1=0-10' },
          { title: 'Shaswati', code: 'lhsk2=0-11' },
        ],
        hi: [],
      },
      {
        subject: 'Accountancy',
        en: [
          { title: 'Accountancy-I', code: 'leac1=0-4' },
          { title: 'Accountancy Part-II', code: 'leac2=0-6' },
          { title: 'Computerised Accounting System', code: 'leca1=0-4' },
        ],
        hi: [
          { title: 'Lekhashastra Part-I', code: 'lhac1=0-4' },
          { title: 'Lekhashastra Part-II', code: 'lhac2=0-5' },
        ],
      },
      {
        subject: 'Business Studies',
        en: [
          { title: 'Business Studies-I', code: 'lebs1=0-8' },
          { title: 'Business Studies-II', code: 'lebs2=0-3' },
        ],
        hi: [
          { title: 'Vyavasai Adhyan-I', code: 'lhbs1=0-8' },
          { title: 'Vyavasai Adhyan-II', code: 'lhbs2=0-3' },
        ],
      },
      { subject: 'Psychology', en: [{ title: 'Psychology', code: 'lepy1=0-7' }], hi: [{ title: 'Manovigyan', code: 'lhpy1=0-7' }] },
      {
        subject: 'Sociology',
        en: [
          { title: 'Indian Society', code: 'lesy1=0-7' },
          { title: 'Social Change and Development in India', code: 'lesy2=0-8' },
        ],
        hi: [
          { title: 'Bhartiya Samaj', code: 'lhsy1=0-7' },
          { title: 'Bharat main Samajik Parivartan aur Vikas', code: 'lhsy2=0-8' },
        ],
      },
      { subject: 'Computer Science', en: [{ title: 'Computer Science', code: 'lecs1=0-13' }], hi: [] },
      { subject: 'Informatics Practices', en: [{ title: 'Informatics Practices', code: 'leip1=0-7' }], hi: [] },
      { subject: 'Biotechnology', en: [{ title: 'Biotechnology', code: 'lebt1=0-13' }], hi: [] },
    ],
  },
]
