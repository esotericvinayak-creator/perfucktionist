// School shelf: every NCERT textbook, class 1–12, in every language NCERT publishes.
// Generated from NCERT's own textbook page (www.ncert.nic.in/textbook.php) on 2026-10-03 — the codes are theirs.

export type Edition = { t: string; c: string }
/** One subject, with its books grouped by language. English first, then Hindi, Urdu, Sanskrit, then the rest. */
export type Subject = { subject: string; langs: { lang: string; books: Edition[] }[] }
export type SchoolClass = { cls: number; subjects: Subject[] }

/** NCERT's own page for a book — it lists every chapter as a free PDF. */
export const ncertUrl = (code: string) => `https://www.ncert.nic.in/textbook.php?${code}`

// A code looks like `jemh1=0-14`: the book is `jemh1` and it has 14 chapters,
// published as jemh101.pdf … jemh114.pdf, with jemh1ps.pdf for the opening pages.
const parse = (code: string) => {
  const [book, range] = code.split('=')
  const n = Number(range?.split('-')[1] ?? 0)
  return { book, chapters: Number.isFinite(n) ? n : 0 }
}

export const chapterCount = (code: string) => parse(code).chapters

/** Every chapter of a book, as a direct link to NCERT's free PDF. */
export function ncertChapters(code: string) {
  const { book, chapters } = parse(code)
  const pdf = (name: string) => `https://www.ncert.nic.in/textbook/pdf/${name}.pdf`
  return [{ label: 'Opening pages', url: pdf(`${book}ps`) }, ...Array.from({ length: chapters }, (_, i) => ({ label: `Chapter ${i + 1}`, url: pdf(`${book}${String(i + 1).padStart(2, '0')}`) }))]
}

export const SCHOOL: SchoolClass[] = [
  {
    cls: 1,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Joyful-Mathematics', c: 'aejm1=0-13' }] },
          { lang: 'Hindi', books: [{ t: 'Joyful-Mathematics', c: 'ahjm1=0-13' }] },
          { lang: 'Urdu', books: [{ t: 'Joyful-Mathematics', c: 'aujm1=0-13' }] },
          { lang: 'Sanskrit', books: [{ t: 'Joyful-Mathematics', c: 'askjm1=0-13' }] },
          { lang: 'Assamese', books: [{ t: 'Joyful-Mathematics', c: 'aajm1=0-13' }] },
          { lang: 'Bengali', books: [{ t: 'Joyful-Mathematics', c: 'abnjm1=0-13' }] },
          { lang: 'Bodo', books: [{ t: 'Joyful-Mathematics', c: 'aojm1=0-13' }] },
          { lang: 'Dogri', books: [{ t: 'Joyful-Mathematics', c: 'adgjm1=0-13' }] },
          { lang: 'Gujarati', books: [{ t: 'Joyful-Mathematics', c: 'agjm1=0-13' }] },
          { lang: 'Kannada', books: [{ t: 'Joyful-Mathematics', c: 'aknjm1=0-13' }] },
          { lang: 'Kashmiri', books: [{ t: 'Joyful-Mathematics', c: 'aksjm1=0-13' }] },
          { lang: 'Konkani', books: [{ t: 'Joyful-Mathematics', c: 'akjm1=0-13' }] },
          { lang: 'Maithili', books: [{ t: 'Joyful-Mathematics', c: 'aijm1=0-13' }] },
          { lang: 'Malayalam', books: [{ t: 'Joyful-Mathematics', c: 'ayjm1=0-13' }] },
          { lang: 'Manipuri', books: [{ t: 'Joyful-Mathematics', c: 'amnjm1=0-13' }] },
          { lang: 'Marathi', books: [{ t: 'Joyful-Mathematics', c: 'amrjm1=0-13' }] },
          { lang: 'Nepali', books: [{ t: 'Joyful-Mathematics', c: 'anpjm1=0-13' }] },
          { lang: 'Odia', books: [{ t: 'Joyful-Mathematics', c: 'aorjm1=0-13' }] },
          { lang: 'Punjabi', books: [{ t: 'Joyful-Mathematics', c: 'apjm1=0-13' }] },
          { lang: 'Santali', books: [{ t: 'Joyful-Mathematics', c: 'asnjm1=0-13' }] },
          { lang: 'Sindhi', books: [{ t: 'Joyful-Mathematics', c: 'asijm1=0-13' }] },
          { lang: 'Tamil', books: [{ t: 'Joyful-Mathematics', c: 'atmjm1=0-13' }] },
          { lang: 'Telugu', books: [{ t: 'Joyful-Mathematics', c: 'atljm1=0-13' }] },
        ],
      },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Mridang', c: 'aemr1=0-9' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Sarangi', c: 'ahsr1=0-19' }] }] },
      { subject: 'Urdu', langs: [{ lang: 'Urdu', books: [{ t: 'Shahnai', c: 'aush1=0-18' }] }] },
    ],
  },
  {
    cls: 2,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Joyful-Mathematics', c: 'bejm1=0-11' }] },
          { lang: 'Hindi', books: [{ t: 'Joyful-Mathematics', c: 'bhjm1=0-11' }] },
          { lang: 'Urdu', books: [{ t: 'Joyful-Mathematics', c: 'bujm1=0-11' }] },
          { lang: 'Sanskrit', books: [{ t: 'Joyful-Mathematics', c: 'bskjm1=0-11' }] },
          { lang: 'Assamese', books: [{ t: 'Joyful-Mathematics', c: 'basjm1=0-11' }] },
          { lang: 'Bengali', books: [{ t: 'Joyful-Mathematics', c: 'bbnjm1=0-11' }] },
          { lang: 'Bodo', books: [{ t: 'Joyful-Mathematics', c: 'bbdjm1=0-11' }] },
          { lang: 'Dogri', books: [{ t: 'Joyful-Mathematics', c: 'bdgjm1=0-11' }] },
          { lang: 'Gujarati', books: [{ t: 'Joyful-Mathematics', c: 'bgjjm1=0-11' }] },
          { lang: 'Kannada', books: [{ t: 'Joyful-Mathematics', c: 'bknjm1=0-11' }] },
          { lang: 'Kashmiri', books: [{ t: 'Joyful-Mathematics', c: 'bksjm1=0-11' }] },
          { lang: 'Konkani', books: [{ t: 'Joyful-Mathematics', c: 'bkojm1=0-11' }] },
          { lang: 'Malayalam', books: [{ t: 'Joyful-Mathematics', c: 'bmljm1=0-11' }] },
          { lang: 'Manipuri', books: [{ t: 'Joyful-Mathematics', c: 'bmnjm1=0-11' }] },
          { lang: 'Marathi', books: [{ t: 'Joyful-Mathematics', c: 'bmrjm1=0-11' }] },
          { lang: 'Nepali', books: [{ t: 'Joyful-Mathematics', c: 'bnpjm1=0-11' }] },
          { lang: 'Odia', books: [{ t: 'Joyful-Mathematics', c: 'borjm1=0-11' }] },
          { lang: 'Other', books: [{ t: 'Joyful-Mathematics (Maithli)', c: 'bmtjm1=0-11' }] },
          { lang: 'Punjabi', books: [{ t: 'Joyful-Mathematics', c: 'bpnjm1=0-11' }] },
          { lang: 'Santali', books: [{ t: 'Joyful-Mathematics', c: 'bsnjm1=0-11' }] },
          { lang: 'Sindhi', books: [{ t: 'Joyful-Mathematics', c: 'bsijm1=0-11' }] },
          { lang: 'Tamil', books: [{ t: 'Joyful-Mathematics', c: 'btmjm1=0-11' }] },
          { lang: 'Telugu', books: [{ t: 'Joyful-Mathematics', c: 'btljm1=0-11' }] },
        ],
      },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Mridang', c: 'bemr1=0-13' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Sarangi', c: 'bhsr1=0-26' }] }] },
      { subject: 'Urdu', langs: [{ lang: 'Urdu', books: [{ t: 'Shahnai', c: 'bush1=0-19' }] }] },
    ],
  },
  {
    cls: 3,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Mathematics', c: 'cemh1=0-14' },
              { t: 'Maths Mela', c: 'cemm1=0-14' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Ganit', c: 'chmh1=0-14' },
              { t: 'Ganit Mela', c: 'chmm1=0-14' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Riyazi Ka Jadoo-III', c: 'curi1=0-14' },
              { t: 'Riyazi Mela', c: 'cumm1=0-14' },
            ],
          },
          { lang: 'Sanskrit', books: [{ t: 'Maths Mela', c: 'cskmm1=0-14' }] },
          { lang: 'Assamese', books: [{ t: 'Maths Mela', c: 'casmm1=0-14' }] },
          { lang: 'Bengali', books: [{ t: 'Maths Mela', c: 'cbnmm1=0-14' }] },
          { lang: 'Bodo', books: [{ t: 'Maths Mela', c: 'cbdmm1=0-14' }] },
          { lang: 'Dogri', books: [{ t: 'Maths Mela', c: 'cdgmm1=0-14' }] },
          { lang: 'Gujarati', books: [{ t: 'Maths Mela', c: 'cgjmm1=0-14' }] },
          { lang: 'Kannada', books: [{ t: 'Maths Mela', c: 'cknmm1=0-14' }] },
          { lang: 'Kashmiri', books: [{ t: 'Maths Mela', c: 'cksmm1=0-14' }] },
          { lang: 'Konkani', books: [{ t: 'Maths Mela', c: 'ckomm1=0-14' }] },
          { lang: 'Maithili', books: [{ t: 'Maths Mela', c: 'cmtmm1=0-14' }] },
          { lang: 'Malayalam', books: [{ t: 'Maths Mela', c: 'cmlmm1=0-14' }] },
          { lang: 'Manipuri', books: [{ t: 'Maths Mela', c: 'cmnmm1=0-14' }] },
          { lang: 'Marathi', books: [{ t: 'Maths Mela', c: 'cmrmm1=0-14' }] },
          { lang: 'Nepali', books: [{ t: 'Maths Mela', c: 'cnpmm1=0-14' }] },
          { lang: 'Odia', books: [{ t: 'Maths Mela', c: 'cormm1=0-14' }] },
          { lang: 'Punjabi', books: [{ t: 'Maths Mela', c: 'cpnmm1=0-14' }] },
          { lang: 'Santali', books: [{ t: 'Maths Mela', c: 'csnmm1=0-14' }] },
          { lang: 'Sindhi', books: [{ t: 'Maths Mela', c: 'csimm1=0-14' }] },
          { lang: 'Tamil', books: [{ t: 'Maths Mela', c: 'ctmmm1=0-14' }] },
          { lang: 'Telugu', books: [{ t: 'Maths Mela', c: 'ctlmm1=0-14' }] },
        ],
      },
      {
        subject: 'The World Around Us',
        langs: [
          { lang: 'English', books: [{ t: 'Our Wondrous World', c: 'ceev1=0-12' }] },
          { lang: 'Hindi', books: [{ t: 'Hamara Adhbhut Sansar', c: 'chev1=0-12' }] },
          { lang: 'Urdu', books: [{ t: 'Hamari Hairat Angez Duniya', c: 'cuev1=0-12' }] },
          { lang: 'Sanskrit', books: [{ t: 'Our Wondrous World', c: 'cskev1=0-12' }] },
          { lang: 'Assamese', books: [{ t: 'Our Wondrous World', c: 'casev1=0-12' }] },
          { lang: 'Bengali', books: [{ t: 'Our Wondrous World', c: 'cbnev1=0-12' }] },
          { lang: 'Bodo', books: [{ t: 'Our Wondrous World', c: 'cbdev1=0-12' }] },
          { lang: 'Dogri', books: [{ t: 'Our Wondrous World', c: 'cdgev1=0-12' }] },
          { lang: 'Kannada', books: [{ t: 'Our Wondrous World', c: 'cknev1=0-12' }] },
          { lang: 'Kashmiri', books: [{ t: 'Our Wondrous World', c: 'cksev1=0-12' }] },
          { lang: 'Konkani', books: [{ t: 'Our Wondrous World', c: 'ckoev1=0-12' }] },
          { lang: 'Maithili', books: [{ t: 'Our Wondrous World', c: 'cmtev1=0-12' }] },
          { lang: 'Malayalam', books: [{ t: 'Our Wondrous World', c: 'cmlev1=0-12' }] },
          { lang: 'Manipuri', books: [{ t: 'Our Wondrous World', c: 'cmnev1=0-12' }] },
          { lang: 'Marathi', books: [{ t: 'Our Wondrous World', c: 'cmrev1=0-12' }] },
          { lang: 'Nepali', books: [{ t: 'Our Wondrous World', c: 'cnpev1=0-12' }] },
          { lang: 'Odia', books: [{ t: 'Our Wondrous World', c: 'corev1=0-12' }] },
          { lang: 'Other', books: [{ t: 'Our Wondrous World (Gujrati)', c: 'cgjev1=0-12' }] },
          { lang: 'Punjabi', books: [{ t: 'Our Wondrous World', c: 'cpnev1=0-12' }] },
          { lang: 'Santali', books: [{ t: 'Our Wondrous World', c: 'csnev1=0-12' }] },
          { lang: 'Sindhi', books: [{ t: 'Our Wondrous World', c: 'csiev1=0-12' }] },
          { lang: 'Tamil', books: [{ t: 'Our Wondrous World', c: 'ctmev1=0-12' }] },
          { lang: 'Telugu', books: [{ t: 'Our Wondrous World', c: 'ctlev1=0-12' }] },
        ],
      },
      {
        subject: 'Environmental Studies',
        langs: [
          { lang: 'English', books: [{ t: 'Looking Around', c: 'ceap1=0-24' }] },
          { lang: 'Hindi', books: [{ t: 'Aas-Pass', c: 'chap1=0-24' }] },
          { lang: 'Urdu', books: [{ t: 'Aas-Pass', c: 'cuap1=0-24' }] },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Marigold', c: 'ceen1=0-10' },
              { t: 'Santoor', c: 'cesa1=0-12' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Rimjhim', c: 'chhn1=0-13' },
              { t: 'Veena', c: 'chve1=0-18' },
            ],
          },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Ibtedai Urdu', c: 'culb1=0-20' },
              { t: 'Sitar', c: 'cust1=0-19' },
            ],
          },
        ],
      },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Bansuri - I', c: 'cebu1=0-20' }] },
          { lang: 'Hindi', books: [{ t: 'Bansuri - I', c: 'chbu1=0-20' }] },
          { lang: 'Urdu', books: [{ t: 'Bansuri - I', c: 'cubu1=0-20' }] },
          { lang: 'Sanskrit', books: [{ t: 'Bansuri - I', c: 'cskbu1=0-20' }] },
          { lang: 'Assamese', books: [{ t: 'Bansuri - I', c: 'casbu1=0-20' }] },
          { lang: 'Bengali', books: [{ t: 'Bansuri - I', c: 'cbnbu1=0-20' }] },
          { lang: 'Bodo', books: [{ t: 'Bansuri - I', c: 'cbdbu1=0-20' }] },
          { lang: 'Dogri', books: [{ t: 'Bansuri - I', c: 'cdgbu1=0-20' }] },
          { lang: 'Gujarati', books: [{ t: 'Bansuri - I', c: 'cgjbu1=0-20' }] },
          { lang: 'Kannada', books: [{ t: 'Bansuri - I', c: 'cknbu1=0-20' }] },
          { lang: 'Kashmiri', books: [{ t: 'Bansuri - I', c: 'cksbu1=0-20' }] },
          { lang: 'Konkani', books: [{ t: 'Bansuri - I', c: 'ckobu1=0-20' }] },
          { lang: 'Maithili', books: [{ t: 'Bansuri - I', c: 'cmtbu1=0-20' }] },
          { lang: 'Malayalam', books: [{ t: 'Bansuri - I', c: 'cmlbu1=0-20' }] },
          { lang: 'Manipuri', books: [{ t: 'Bansuri - I', c: 'cmnbu1=0-20' }] },
          { lang: 'Marathi', books: [{ t: 'Bansuri - I', c: 'cmrbu1=0-20' }] },
          { lang: 'Nepali', books: [{ t: 'Bansuri - I', c: 'cnpbu1=0-20' }] },
          { lang: 'Odia', books: [{ t: 'Bansuri - I', c: 'corbu1=0-20' }] },
          { lang: 'Punjabi', books: [{ t: 'Bansuri - I', c: 'cpnbu1=0-20' }] },
          { lang: 'Santali', books: [{ t: 'Bansuri - I', c: 'csnbu1=0-20' }] },
          { lang: 'Sindhi', books: [{ t: 'Bansuri - I', c: 'csibu1=0-20' }] },
          { lang: 'Tamil', books: [{ t: 'Bansuri - I', c: 'ctmbu1=0-20' }] },
          { lang: 'Telugu', books: [{ t: 'Bansuri - I', c: 'ctlbu1=0-20' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yoga', c: 'ceky1=0-7' }] },
          { lang: 'Hindi', books: [{ t: 'Khel Yoga', c: 'chky1=0-7' }] },
          { lang: 'Urdu', books: [{ t: 'Khel Yoga', c: 'cuky1=0-7' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yoga', c: 'cskky1=0-7' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yoga', c: 'casky1=0-7' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yoga', c: 'cbnky1=0-7' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yoga', c: 'cbdky1=0-7' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yoga', c: 'cdgky1=0-7' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yoga', c: 'cgjky1=0-7' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yoga', c: 'cknky1=0-7' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yoga', c: 'cksky1=0-7' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yoga', c: 'ckoky1=0-7' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yoga', c: 'cmtky1=0-7' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yoga', c: 'cmlky1=0-7' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yoga', c: 'cmnky1=0-7' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yoga', c: 'cmrky1=0-7' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yoga', c: 'cnpky1=0-7' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yoga', c: 'corky1=0-7' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yoga', c: 'cpnky1=0-7' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yoga', c: 'csnky1=0-7' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yoga', c: 'csiky1=0-7' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yoga', c: 'ctmky1=0-7' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yoga', c: 'ctlky1=0-7' }] },
        ],
      },
    ],
  },
  {
    cls: 4,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Math-Mela', c: 'demm1=0-14' }] },
          { lang: 'Hindi', books: [{ t: 'Ganit Mela', c: 'dhmm1=0-14' }] },
          { lang: 'Urdu', books: [{ t: 'Riyazi Mela', c: 'dumm1=0-14' }] },
          { lang: 'Sanskrit', books: [{ t: 'Math-Mela', c: 'dskmm1=0-14' }] },
          { lang: 'Assamese', books: [{ t: 'Math-Mela', c: 'dasmm1=0-14' }] },
          { lang: 'Bengali', books: [{ t: 'Math-Mela', c: 'dbnmm1=0-14' }] },
          { lang: 'Bodo', books: [{ t: 'Math-Mela', c: 'dbdmm1=0-14' }] },
          { lang: 'Dogri', books: [{ t: 'Math-Mela', c: 'ddgmm1=0-14' }] },
          { lang: 'Gujarati', books: [{ t: 'Math-Mela', c: 'dgjmm1=0-14' }] },
          { lang: 'Kannada', books: [{ t: 'Math-Mela', c: 'dknmm1=0-14' }] },
          { lang: 'Kashmiri', books: [{ t: 'Math-Mela', c: 'dksmm1=0-14' }] },
          { lang: 'Konkani', books: [{ t: 'Math-Mela', c: 'dkomm1=0-14' }] },
          { lang: 'Maithili', books: [{ t: 'Math-Mela', c: 'dmtmm1=0-14' }] },
          { lang: 'Malayalam', books: [{ t: 'Math-Mela', c: 'dmlmm1=0-14' }] },
          { lang: 'Manipuri', books: [{ t: 'Math-Mela', c: 'dmnmm1=0-14' }] },
          { lang: 'Marathi', books: [{ t: 'Math-Mela', c: 'dmrmm1=0-14' }] },
          { lang: 'Nepali', books: [{ t: 'Math-Mela', c: 'dnpmm1=0-14' }] },
          { lang: 'Odia', books: [{ t: 'Math-Mela', c: 'dormm1=0-14' }] },
          { lang: 'Punjabi', books: [{ t: 'Math-Mela', c: 'dpnmm1=0-14' }] },
          { lang: 'Santali', books: [{ t: 'Math-Mela', c: 'dsnmm1=0-14' }] },
          { lang: 'Sindhi', books: [{ t: 'Math-Mela', c: 'dsimm1=0-14' }] },
          { lang: 'Tamil', books: [{ t: 'Math-Mela', c: 'dtmmm1=0-14' }] },
          { lang: 'Telugu', books: [{ t: 'Math-Mela', c: 'dtlmm1=0-14' }] },
        ],
      },
      {
        subject: 'The World Around Us',
        langs: [
          { lang: 'English', books: [{ t: 'Our Wonderous World', c: 'deev1=0-10' }] },
          { lang: 'Hindi', books: [{ t: 'Hamara Adhbhut Sansar', c: 'dhev1=0-10' }] },
          { lang: 'Urdu', books: [{ t: 'Hamari Hairatangez Duniya', c: 'duev1=0-10' }] },
          { lang: 'Sanskrit', books: [{ t: 'Our Wondrous World', c: 'dskev1=0-10' }] },
          { lang: 'Assamese', books: [{ t: 'Our Wondrous World', c: 'dasev1=0-10' }] },
          { lang: 'Bengali', books: [{ t: 'Our Wondrous World', c: 'dbnev1=0-10' }] },
          { lang: 'Bodo', books: [{ t: 'Our Wondrous World', c: 'dbdev1=0-10' }] },
          { lang: 'Dogri', books: [{ t: 'Our Wondrous World', c: 'ddgev1=0-10' }] },
          { lang: 'Gujarati', books: [{ t: 'Our Wonderous World', c: 'dgjev1=0-10' }] },
          { lang: 'Kannada', books: [{ t: 'Our Wondrous World', c: 'dknev1=0-10' }] },
          { lang: 'Kashmiri', books: [{ t: 'Our Wondrous World', c: 'dksev1=0-10' }] },
          { lang: 'Konkani', books: [{ t: 'Our Wondrous World', c: 'dkoev1=0-10' }] },
          { lang: 'Maithili', books: [{ t: 'Our Wondrous World', c: 'dmtev1=0-10' }] },
          { lang: 'Malayalam', books: [{ t: 'Our Wondrous World', c: 'dmlev1=0-10' }] },
          { lang: 'Manipuri', books: [{ t: 'Our Wondrous World', c: 'dmnev1=0-10' }] },
          { lang: 'Marathi', books: [{ t: 'Our Wondrous World', c: 'dmrev1=0-10' }] },
          { lang: 'Nepali', books: [{ t: 'Our Wondrous World', c: 'dnpev1=0-10' }] },
          { lang: 'Odia', books: [{ t: 'Our Wondrous World', c: 'dorev1=0-10' }] },
          { lang: 'Punjabi', books: [{ t: 'Our Wonderous World', c: 'dpev1=0-10' }] },
          { lang: 'Santali', books: [{ t: 'Our Wondrous World', c: 'dsnev1=0-10' }] },
          { lang: 'Sindhi', books: [{ t: 'Our Wondrous World', c: 'dsiev1=0-10' }] },
          { lang: 'Tamil', books: [{ t: 'Our Wondrous World', c: 'dtmev1=0-10' }] },
          { lang: 'Telugu', books: [{ t: 'Our Wondrous World', c: 'dtlev1=0-10' }] },
        ],
      },
      {
        subject: 'Environmental Studies',
        langs: [
          { lang: 'English', books: [{ t: 'Looking Around(EVS)', c: 'deap1=0-27' }] },
          { lang: 'Hindi', books: [{ t: 'Aas Paas', c: 'dhap1=0-27' }] },
          { lang: 'Urdu', books: [{ t: 'Aas-Paas', c: 'duap1=0-27' }] },
        ],
      },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Santoor', c: 'desa1=0-12' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Veena', c: 'dhve1=0-13' }] }] },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Ibtedai Urdu-IV', c: 'dulb1=0-22' },
              { t: 'Sitaar', c: 'dust1=0-14' },
            ],
          },
        ],
      },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Bansuri', c: 'debu1=0-18' }] },
          { lang: 'Hindi', books: [{ t: 'Bansuri - I', c: 'dhbu1=0-18' }] },
          { lang: 'Urdu', books: [{ t: 'Bansuri - I', c: 'dubu1=0-18' }] },
          { lang: 'Sanskrit', books: [{ t: 'Bansuri - I', c: 'dskbu1=0-18' }] },
          { lang: 'Assamese', books: [{ t: 'Bansuri - I', c: 'dasbu1=0-18' }] },
          { lang: 'Bengali', books: [{ t: 'Bansuri - I', c: 'dbnbu1=0-18' }] },
          { lang: 'Bodo', books: [{ t: 'Bansuri - I', c: 'dbdbu1=0-18' }] },
          { lang: 'Dogri', books: [{ t: 'Bansuri - I', c: 'ddgbu1=0-18' }] },
          { lang: 'Gujarati', books: [{ t: 'Bansuri - I', c: 'dgjbu1=0-18' }] },
          { lang: 'Kannada', books: [{ t: 'Bansuri - I', c: 'dknbu1=0-18' }] },
          { lang: 'Kashmiri', books: [{ t: 'Bansuri - I', c: 'dksbu1=0-18' }] },
          { lang: 'Konkani', books: [{ t: 'Bansuri - I', c: 'dkobu1=0-18' }] },
          { lang: 'Maithili', books: [{ t: 'Bansuri - I', c: 'dmtbu1=0-18' }] },
          { lang: 'Malayalam', books: [{ t: 'Bansuri - I', c: 'dmlbu1=0-18' }] },
          { lang: 'Manipuri', books: [{ t: 'Bansuri - I', c: 'dmnbu1=0-18' }] },
          { lang: 'Marathi', books: [{ t: 'Bansuri - I', c: 'dmrbu1=0-18' }] },
          { lang: 'Nepali', books: [{ t: 'Bansuri - I', c: 'dnpbu1=0-18' }] },
          { lang: 'Odia', books: [{ t: 'Bansuri - I', c: 'dorbu1=0-18' }] },
          { lang: 'Punjabi', books: [{ t: 'Bansuri - I', c: 'dpnbu1=0-18' }] },
          { lang: 'Santali', books: [{ t: 'Bansuri - I', c: 'dsnbu1=0-18' }] },
          { lang: 'Sindhi', books: [{ t: 'Bansuri - I', c: 'dsibu1=0-18' }] },
          { lang: 'Tamil', books: [{ t: 'Bansuri - I', c: 'dtmbu1=0-18' }] },
          { lang: 'Telugu', books: [{ t: 'Bansuri - I', c: 'dtlbu1=0-18' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yoga', c: 'deky1=0-3' }] },
          { lang: 'Hindi', books: [{ t: 'Khel Yoga', c: 'dhky1=0-3' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yoga', c: 'dskky1=0-3' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yoga', c: 'dasky1=0-3' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yoga', c: 'dbnky1=0-3' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yoga', c: 'dbdky1=0-3' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yoga', c: 'ddgky1=0-3' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yoga', c: 'dgjky1=0-3' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yoga', c: 'dknky1=0-3' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yoga', c: 'dksky1=0-3' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yoga', c: 'dkoky1=0-3' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yoga', c: 'dmtky1=0-3' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yoga', c: 'dmlky1=0-3' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yoga', c: 'dmnky1=0-3' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yoga', c: 'dmrky1=0-3' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yoga', c: 'dnpky1=0-3' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yoga', c: 'dorky1=0-3' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yoga', c: 'dpnky1=0-3' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yoga', c: 'dsnky1=0-3' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yoga', c: 'dsiky1=0-3' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yoga', c: 'dtmky1=0-3' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yoga', c: 'dtlky1=0-3' }] },
        ],
      },
    ],
  },
  {
    cls: 5,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Math-Mela', c: 'eemm1=0-15' },
              { t: 'Math-Magic', c: 'eemh1=0-14' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Ganit-Mela', c: 'ehmm1=0-15' },
              { t: 'Ganit', c: 'ehmh1=0-14' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Riyazi Mela', c: 'eumm1=0-15' },
              { t: 'Riyazi Ka Jadoo', c: 'euma1=0-14' },
            ],
          },
          { lang: 'Sanskrit', books: [{ t: 'Math-Mela', c: 'eskmm1=0-15' }] },
          { lang: 'Assamese', books: [{ t: 'Math-Mela', c: 'easmm1=0-15' }] },
          { lang: 'Bengali', books: [{ t: 'Math-Mela', c: 'ebnmm1=0-15' }] },
          { lang: 'Bodo', books: [{ t: 'Math-Mela', c: 'ebdmm1=0-15' }] },
          { lang: 'Dogri', books: [{ t: 'Math-Mela', c: 'edgmm1=0-15' }] },
          { lang: 'Gujarati', books: [{ t: 'Math-Mela', c: 'egjmm1=0-15' }] },
          { lang: 'Kannada', books: [{ t: 'Math-Mela', c: 'eknmm1=0-15' }] },
          { lang: 'Kashmiri', books: [{ t: 'Math-Mela', c: 'eksmm1=0-15' }] },
          { lang: 'Konkani', books: [{ t: 'Math-Mela', c: 'ekomm1=0-15' }] },
          { lang: 'Maithili', books: [{ t: 'Math-Mela', c: 'emtmm1=0-15' }] },
          { lang: 'Malayalam', books: [{ t: 'Math-Mela', c: 'emlmm1=0-15' }] },
          { lang: 'Manipuri', books: [{ t: 'Math-Mela', c: 'emnmm1=0-15' }] },
          { lang: 'Marathi', books: [{ t: 'Math-Mela', c: 'emrmm1=0-15' }] },
          { lang: 'Nepali', books: [{ t: 'Math-Mela', c: 'enpmm1=0-15' }] },
          { lang: 'Odia', books: [{ t: 'Math-Mela', c: 'eormm1=0-15' }] },
          { lang: 'Punjabi', books: [{ t: 'Math-Mela', c: 'epnmm1=0-15' }] },
          { lang: 'Santali', books: [{ t: 'Math-Mela', c: 'esnmm1=0-15' }] },
          { lang: 'Sindhi', books: [{ t: 'Math-Mela', c: 'esimm1=0-15' }] },
          { lang: 'Tamil', books: [{ t: 'Math-Mela', c: 'etmmm1=0-15' }] },
          { lang: 'Telugu', books: [{ t: 'Math-Mela', c: 'etlmm1=0-15' }] },
        ],
      },
      {
        subject: 'The World Around Us',
        langs: [
          { lang: 'English', books: [{ t: 'Our Wonderous World', c: 'eeev1=0-10' }] },
          { lang: 'Hindi', books: [{ t: 'Hamara Adbhut Sansar', c: 'ehev1=0-10' }] },
          { lang: 'Urdu', books: [{ t: 'Hamari Hairatangez Duniya', c: 'euev1=0-10' }] },
          { lang: 'Sanskrit', books: [{ t: 'Our Wonderous World', c: 'eskev1=0-10' }] },
          { lang: 'Assamese', books: [{ t: 'Our Wonderous World', c: 'easev1=0-10' }] },
          { lang: 'Bengali', books: [{ t: 'Our Wonderous World', c: 'ebnev1=0-10' }] },
          { lang: 'Bodo', books: [{ t: 'Our Wonderous World', c: 'ebdev1=0-10' }] },
          { lang: 'Dogri', books: [{ t: 'Our Wonderous World', c: 'edgev1=0-10' }] },
          { lang: 'Gujarati', books: [{ t: 'Our Wonderous World', c: 'egjev1=0-10' }] },
          { lang: 'Kannada', books: [{ t: 'Our Wonderous World', c: 'eknev1=0-10' }] },
          { lang: 'Kashmiri', books: [{ t: 'Our Wonderous World', c: 'eksev1=0-10' }] },
          { lang: 'Konkani', books: [{ t: 'Our Wonderous World', c: 'ekoev1=0-10' }] },
          { lang: 'Maithili', books: [{ t: 'Our Wonderous World', c: 'emtev1=0-10' }] },
          { lang: 'Malayalam', books: [{ t: 'Our Wonderous World', c: 'emlev1=0-10' }] },
          { lang: 'Manipuri', books: [{ t: 'Our Wonderous World', c: 'emnev1=0-10' }] },
          { lang: 'Marathi', books: [{ t: 'Our Wonderous World', c: 'emrev1=0-10' }] },
          { lang: 'Nepali', books: [{ t: 'Our Wonderous World', c: 'enpev1=0-10' }] },
          { lang: 'Odia', books: [{ t: 'Our Wonderous World', c: 'eorev1=0-10' }] },
          { lang: 'Punjabi', books: [{ t: 'Our Wonderous World', c: 'epnev1=0-10' }] },
          { lang: 'Santali', books: [{ t: 'Our Wonderous World', c: 'esnev1=0-10' }] },
          { lang: 'Sindhi', books: [{ t: 'Our Wonderous World', c: 'esiev1=0-10' }] },
          { lang: 'Tamil', books: [{ t: 'Our Wonderous World', c: 'etmev1=0-10' }] },
          { lang: 'Telugu', books: [{ t: 'Our Wonderous World', c: 'etlev1=0-10' }] },
        ],
      },
      {
        subject: 'Environmental Studies',
        langs: [
          { lang: 'English', books: [{ t: 'Looking Around', c: 'eeap1=0-22' }] },
          { lang: 'Hindi', books: [{ t: 'Aas-Pass', c: 'ehap1=0-22' }] },
          { lang: 'Urdu', books: [{ t: 'Ass Pass', c: 'euev1=0-22' }] },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Santoor', c: 'eesa1=0-10' },
              { t: 'Marigold', c: 'eeen1=0-10' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Veena', c: 'ehve1=0-12' },
              { t: 'Rimjhim', c: 'ehhn1=0-18' },
            ],
          },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Sitaar', c: 'eust1=0-18' },
              { t: 'Ibtedai Urdu Class-V', c: 'eulb1=0-22' },
            ],
          },
        ],
      },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Bansuri', c: 'eebu1=0-19' }] },
          { lang: 'Hindi', books: [{ t: 'Bansuri', c: 'ehbu1=0-19' }] },
          { lang: 'Urdu', books: [{ t: 'Bansuri', c: 'eubu1=0-19' }] },
          { lang: 'Sanskrit', books: [{ t: 'Bansuri', c: 'eskbu1=0-19' }] },
          { lang: 'Assamese', books: [{ t: 'Bansuri', c: 'easbu1=0-19' }] },
          { lang: 'Bengali', books: [{ t: 'Bansuri', c: 'ebnbu1=0-19' }] },
          { lang: 'Bodo', books: [{ t: 'Bansuri', c: 'ebdbu1=0-19' }] },
          { lang: 'Dogri', books: [{ t: 'Bansuri', c: 'edgbu1=0-19' }] },
          { lang: 'Gujarati', books: [{ t: 'Bansuri', c: 'egjbu1=0-19' }] },
          { lang: 'Kannada', books: [{ t: 'Bansuri', c: 'eknbu1=0-19' }] },
          { lang: 'Kashmiri', books: [{ t: 'Bansuri', c: 'eksbu1=0-19' }] },
          { lang: 'Konkani', books: [{ t: 'Bansuri', c: 'ekobu1=0-19' }] },
          { lang: 'Maithili', books: [{ t: 'Bansuri', c: 'emtbu1=0-19' }] },
          { lang: 'Malayalam', books: [{ t: 'Bansuri', c: 'emlbu1=0-19' }] },
          { lang: 'Manipuri', books: [{ t: 'Bansuri', c: 'emnbu1=0-19' }] },
          { lang: 'Marathi', books: [{ t: 'Bansuri', c: 'emrbu1=0-19' }] },
          { lang: 'Nepali', books: [{ t: 'Bansuri', c: 'enpbu1=0-19' }] },
          { lang: 'Odia', books: [{ t: 'Bansuri', c: 'eorbu1=0-19' }] },
          { lang: 'Punjabi', books: [{ t: 'Bansuri', c: 'epnbu1=0-19' }] },
          { lang: 'Santali', books: [{ t: 'Bansuri', c: 'esnbu1=0-19' }] },
          { lang: 'Sindhi', books: [{ t: 'Bansuri', c: 'esibu1=0-19' }] },
          { lang: 'Tamil', books: [{ t: 'Bansuri', c: 'etmbu1=0-19' }] },
          { lang: 'Telugu', books: [{ t: 'Bansuri', c: 'etlbu1=0-19' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yoga', c: 'eeky1=0-3' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yoga', c: 'eskky1=0-3' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yoga', c: 'easky1=0-3' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yoga', c: 'ebnky1=0-3' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yoga', c: 'ebdky1=0-3' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yoga', c: 'edgky1=0-3' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yoga', c: 'egjky1=0-3' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yoga', c: 'eknky1=0-3' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yoga', c: 'eksky1=0-3' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yoga', c: 'ekoky1=0-3' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yoga', c: 'emtky1=0-3' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yoga', c: 'emlky1=0-3' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yoga', c: 'emnky1=0-3' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yoga', c: 'emrky1=0-3' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yoga', c: 'enpky1=0-3' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yoga', c: 'eorky1=0-3' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yoga', c: 'epnky1=0-3' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yoga', c: 'esnky1=0-3' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yoga', c: 'esiky1=0-3' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yoga', c: 'etmky1=0-3' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yoga', c: 'etlky1=0-3' }] },
        ],
      },
    ],
  },
  {
    cls: 6,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Ganita Prakash', c: 'fegp1=0-10' }] },
          { lang: 'Hindi', books: [{ t: 'Ganita Prakash', c: 'fhgp1=0-10' }] },
          { lang: 'Urdu', books: [{ t: 'Ganita Prakash', c: 'fugp1=0-10' }] },
          { lang: 'Sanskrit', books: [{ t: 'Ganita Prakash', c: 'fskgp1=0-10' }] },
          { lang: 'Assamese', books: [{ t: 'Ganita Prakash', c: 'fasgp1=0-10' }] },
          { lang: 'Bengali', books: [{ t: 'Ganita Prakash', c: 'fbngp1=0-10' }] },
          { lang: 'Bodo', books: [{ t: 'Ganita Prakash', c: 'fbdgp1=0-10' }] },
          { lang: 'Dogri', books: [{ t: 'Ganita Prakash', c: 'fdggp1=0-10' }] },
          { lang: 'Gujarati', books: [{ t: 'Ganita Prakash', c: 'fgjgp1=0-10' }] },
          { lang: 'Kannada', books: [{ t: 'Ganita Prakash', c: 'fkngp1=0-10' }] },
          { lang: 'Kashmiri', books: [{ t: 'Ganita Prakash', c: 'fksgp1=0-10' }] },
          { lang: 'Konkani', books: [{ t: 'Ganita Prakash', c: 'fkogp1=0-10' }] },
          { lang: 'Maithili', books: [{ t: 'Ganita Prakash', c: 'fmtgp1=0-10' }] },
          { lang: 'Malayalam', books: [{ t: 'Ganita Prakash', c: 'fmlgp1=0-10' }] },
          { lang: 'Manipuri', books: [{ t: 'Ganita Prakash', c: 'fmngp1=0-10' }] },
          { lang: 'Marathi', books: [{ t: 'Ganita Prakash', c: 'fmrgp1=0-10' }] },
          { lang: 'Nepali', books: [{ t: 'Ganita Prakash', c: 'fnpgp1=0-10' }] },
          { lang: 'Odia', books: [{ t: 'Ganita Prakash', c: 'forgp1=0-10' }] },
          { lang: 'Punjabi', books: [{ t: 'Ganita Prakash', c: 'fpngp1=0-10' }] },
          { lang: 'Santali', books: [{ t: 'Ganita Prakash', c: 'fsngp1=0-10' }] },
          { lang: 'Sindhi', books: [{ t: 'Ganita Prakash', c: 'fsigp1=0-10' }] },
          { lang: 'Tamil', books: [{ t: 'Ganita Prakash', c: 'ftmgp1=0-10' }] },
          { lang: 'Telugu', books: [{ t: 'Ganita Prakash', c: 'ftlgp1=0-10' }] },
        ],
      },
      {
        subject: 'Science',
        langs: [
          { lang: 'English', books: [{ t: 'Curiosity', c: 'fecu1=0-12' }] },
          { lang: 'Hindi', books: [{ t: 'Jigyasa', c: 'fhcu1=0-12' }] },
          { lang: 'Urdu', books: [{ t: 'Tajassus', c: 'fucu1=0-12' }] },
          { lang: 'Sanskrit', books: [{ t: 'Curiosity', c: 'fskcu1=0-12' }] },
          { lang: 'Assamese', books: [{ t: 'Curiosity', c: 'fascu1=0-12' }] },
          { lang: 'Bengali', books: [{ t: 'Curiosity', c: 'fbncu1=0-12' }] },
          { lang: 'Bodo', books: [{ t: 'Curiosity', c: 'fbdcu1=0-12' }] },
          { lang: 'Dogri', books: [{ t: 'Curiosity', c: 'fdgcu1=0-12' }] },
          { lang: 'Gujarati', books: [{ t: 'Curiosity', c: 'fgjcu1=0-12' }] },
          { lang: 'Kannada', books: [{ t: 'Curiosity', c: 'fkncu1=0-12' }] },
          { lang: 'Kashmiri', books: [{ t: 'Curiosity', c: 'fkscu1=0-12' }] },
          { lang: 'Konkani', books: [{ t: 'Curiosity', c: 'fkocu1=0-12' }] },
          { lang: 'Maithili', books: [{ t: 'Curiosity', c: 'fmtcu1=0-12' }] },
          { lang: 'Malayalam', books: [{ t: 'Curiosity', c: 'fmlcu1=0-12' }] },
          { lang: 'Manipuri', books: [{ t: 'Curiosity', c: 'fmncu1=0-12' }] },
          { lang: 'Marathi', books: [{ t: 'Curiosity', c: 'fmrcu1=0-12' }] },
          { lang: 'Nepali', books: [{ t: 'Curiosity', c: 'fnpcu1=0-12' }] },
          { lang: 'Odia', books: [{ t: 'Curiosity', c: 'forcu1=0-12' }] },
          { lang: 'Punjabi', books: [{ t: 'Curiosity', c: 'fpncu1=0-12' }] },
          { lang: 'Santali', books: [{ t: 'Curiosity', c: 'fsncu1=0-12' }] },
          { lang: 'Sindhi', books: [{ t: 'Curiosity', c: 'fsicu1=0-12' }] },
          { lang: 'Tamil', books: [{ t: 'Curiosity', c: 'ftmcu1=0-12' }] },
          { lang: 'Telugu', books: [{ t: 'Curiosity', c: 'ftlcu1=0-12' }] },
        ],
      },
      {
        subject: 'Social Science',
        langs: [
          { lang: 'English', books: [{ t: 'Exploring Society India and Beyond', c: 'fees1=0-14' }] },
          { lang: 'Hindi', books: [{ t: 'Samaj Ka Aadhyan: Bharat or uske aage', c: 'fhes1=0-14' }] },
          { lang: 'Urdu', books: [{ t: 'Muashre Ki Daryaft Hindustan aur Us Se Aage', c: 'fues1=0-14' }] },
          { lang: 'Sanskrit', books: [{ t: 'Exploring Society India and Beyond', c: 'fskes1=0-14' }] },
          { lang: 'Assamese', books: [{ t: 'Exploring Society India and Beyond', c: 'fases1=0-14' }] },
          { lang: 'Bengali', books: [{ t: 'Exploring Society India and Beyond', c: 'fbnes1=0-14' }] },
          { lang: 'Bodo', books: [{ t: 'Exploring Society India and Beyond', c: 'fbdes1=0-14' }] },
          { lang: 'Dogri', books: [{ t: 'Exploring Society India and Beyond', c: 'fdges1=0-14' }] },
          { lang: 'Kannada', books: [{ t: 'Exploring Society India and Beyond', c: 'fknes1=0-14' }] },
          { lang: 'Kashmiri', books: [{ t: 'Exploring Society India and Beyond', c: 'fkses1=0-14' }] },
          { lang: 'Konkani', books: [{ t: 'Exploring Society India and Beyond', c: 'fkoes1=0-14' }] },
          { lang: 'Maithili', books: [{ t: 'Exploring Society India and Beyond', c: 'fmtes1=0-14' }] },
          { lang: 'Malayalam', books: [{ t: 'Exploring Society India and Beyond', c: 'fmles1=0-14' }] },
          { lang: 'Manipuri', books: [{ t: 'Exploring Society India and Beyond', c: 'fmnes1=0-14' }] },
          { lang: 'Marathi', books: [{ t: 'Exploring Society India and Beyond', c: 'fmres1=0-14' }] },
          { lang: 'Nepali', books: [{ t: 'Exploring Society India and Beyond', c: 'fnpes1=0-14' }] },
          { lang: 'Odia', books: [{ t: 'Exploring Society India and Beyond', c: 'fores1=0-14' }] },
          { lang: 'Other', books: [{ t: 'Exploring Society India and Beyond (Gujrati)', c: 'fgjes1=0-14' }] },
          { lang: 'Punjabi', books: [{ t: 'Exploring Society India and Beyond', c: 'fpnes1=0-14' }] },
          { lang: 'Santali', books: [{ t: 'Exploring Society India and Beyond', c: 'fsnes1=0-14' }] },
          { lang: 'Sindhi', books: [{ t: 'Exploring Society India and Beyond', c: 'fsies1=0-14' }] },
          { lang: 'Tamil', books: [{ t: 'Exploring Society India and Beyond', c: 'ftmes1=0-14' }] },
          { lang: 'Telugu', books: [{ t: 'Exploring Society India and Beyond', c: 'ftles1=0-14' }] },
        ],
      },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Poorvi', c: 'fepr1=0-5' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Malhar', c: 'fhml1=0-13' }] }] },
      { subject: 'Sanskrit', langs: [{ lang: 'Sanskrit', books: [{ t: 'Deepakam', c: 'fsde1=0-16' }] }] },
      { subject: 'Urdu', langs: [{ lang: 'Urdu', books: [{ t: 'Khayal', c: 'fuky1=0-14' }] }] },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Kriti-I', c: 'fekr1=0-22' }] },
          { lang: 'Hindi', books: [{ t: 'Kriti-I', c: 'fhkr1=0-22' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kriti-I', c: 'fskkr1=0-22' }] },
          { lang: 'Assamese', books: [{ t: 'Kriti-I', c: 'faskr1=0-22' }] },
          { lang: 'Bengali', books: [{ t: 'Kriti-I', c: 'fbnkr1=0-22' }] },
          { lang: 'Bodo', books: [{ t: 'Kriti-I', c: 'fbdkr1=0-22' }] },
          { lang: 'Dogri', books: [{ t: 'Kriti-I', c: 'fdgkr1=0-22' }] },
          { lang: 'Gujarati', books: [{ t: 'Kriti-I', c: 'fgjkr1=0-22' }] },
          { lang: 'Kannada', books: [{ t: 'Kriti-I', c: 'fknkr1=0-22' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kriti-I', c: 'fkskr1=0-22' }] },
          { lang: 'Konkani', books: [{ t: 'Kriti-I', c: 'fkokr1=0-22' }] },
          { lang: 'Maithili', books: [{ t: 'Kriti-I', c: 'fmtkr1=0-22' }] },
          { lang: 'Malayalam', books: [{ t: 'Kriti-I', c: 'fmlkr1=0-22' }] },
          { lang: 'Manipuri', books: [{ t: 'Kriti-I', c: 'fmnkr1=0-22' }] },
          { lang: 'Marathi', books: [{ t: 'Kriti-I', c: 'fmrkr1=0-22' }] },
          { lang: 'Nepali', books: [{ t: 'Kriti-I', c: 'fnpkr1=0-22' }] },
          { lang: 'Odia', books: [{ t: 'Kriti-I', c: 'forkr1=0-22' }] },
          { lang: 'Punjabi', books: [{ t: 'Kriti-I', c: 'fpnkr1=0-22' }] },
          { lang: 'Santali', books: [{ t: 'Kriti-I', c: 'fsnkr1=0-22' }] },
          { lang: 'Sindhi', books: [{ t: 'Kriti-I', c: 'fsikr1=0-22' }] },
          { lang: 'Tamil', books: [{ t: 'Kriti-I', c: 'ftmkr1=0-22' }] },
          { lang: 'Telugu', books: [{ t: 'Kriti-I', c: 'ftlkr1=0-22' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yatra', c: 'feky1=0-5' }] },
          { lang: 'Hindi', books: [{ t: 'Khel Yatra', c: 'fhky1=0-5' }] },
          { lang: 'Urdu', books: [{ t: 'Jismani Taleem aur Tandurusti', c: 'fukl1=0-5' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yatra', c: 'fskky1=0-5' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yatra', c: 'fasky1=0-5' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yatra', c: 'fbnky1=0-5' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yatra', c: 'fbdky1=0-5' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yatra', c: 'fdgky1=0-5' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yatra', c: 'fgjky1=0-5' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yatra', c: 'fknky1=0-5' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yatra', c: 'fksky1=0-5' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yatra', c: 'fkoky1=0-5' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yatra', c: 'fmtky1=0-5' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yatra', c: 'fmlky1=0-5' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yatra', c: 'fmnky1=0-5' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yatra', c: 'fmrky1=0-5' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yatra', c: 'fnpky1=0-5' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yatra', c: 'forky1=0-5' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yatra', c: 'fpnky1=0-5' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yatra', c: 'fsnky1=0-5' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yatra', c: 'fsiky1=0-5' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yatra', c: 'ftmky1=0-5' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yatra', c: 'ftlky1=0-5' }] },
        ],
      },
      {
        subject: 'Vocational Education',
        langs: [
          { lang: 'English', books: [{ t: 'Kaushal Bodh', c: 'fekb1=0-6' }] },
          { lang: 'Hindi', books: [{ t: 'Kaushal Bodh', c: 'fhkb1=0-6' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kaushal Bodh', c: 'fskkb1=0-6' }] },
          { lang: 'Assamese', books: [{ t: 'Kaushal Bodh', c: 'faskb1=0-6' }] },
          { lang: 'Bengali', books: [{ t: 'Kaushal Bodh', c: 'fbnkb1=0-6' }] },
          { lang: 'Bodo', books: [{ t: 'Kaushal Bodh', c: 'fbdkb1=0-6' }] },
          { lang: 'Dogri', books: [{ t: 'Kaushal Bodh', c: 'fdgkb1=0-6' }] },
          { lang: 'Gujarati', books: [{ t: 'Kaushal Bodh', c: 'fgjkb1=0-6' }] },
          { lang: 'Kannada', books: [{ t: 'Kaushal Bodh', c: 'fknkb1=0-6' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kaushal Bodh', c: 'fkskb1=0-6' }] },
          { lang: 'Konkani', books: [{ t: 'Kaushal Bodh', c: 'fkokb1=0-6' }] },
          { lang: 'Maithili', books: [{ t: 'Kaushal Bodh', c: 'fmtkb1=0-6' }] },
          { lang: 'Malayalam', books: [{ t: 'Kaushal Bodh', c: 'fmlkb1=0-6' }] },
          { lang: 'Manipuri', books: [{ t: 'Kaushal Bodh', c: 'fmnkb1=0-6' }] },
          { lang: 'Marathi', books: [{ t: 'Kaushal Bodh', c: 'fmrkb1=0-6' }] },
          { lang: 'Nepali', books: [{ t: 'Kaushal Bodh', c: 'fnpkb1=0-6' }] },
          { lang: 'Odia', books: [{ t: 'Kaushal Bodh', c: 'forkb1=0-6' }] },
          { lang: 'Punjabi', books: [{ t: 'Kaushal Bodh', c: 'fpnkb1=0-6' }] },
          { lang: 'Santali', books: [{ t: 'Kaushal Bodh', c: 'fsnkb1=0-6' }] },
          { lang: 'Sindhi', books: [{ t: 'Kaushal Bodh', c: 'fsikb1=0-6' }] },
          { lang: 'Tamil', books: [{ t: 'Kaushal Bodh', c: 'ftmkb1=0-6' }] },
          { lang: 'Telugu', books: [{ t: 'Kaushal Bodh', c: 'ftlkb1=0-6' }] },
        ],
      },
      { subject: 'Punjabi', langs: [{ lang: 'Other', books: [{ t: 'Satluj', c: 'fpunjabi1=0-19' }] }] },
      { subject: 'Santhali', langs: [{ lang: 'Sanskrit', books: [{ t: 'Sobornakha', c: 'fsanthali1=0-11' }] }] },
      { subject: 'Tamil', langs: [{ lang: 'Other', books: [{ t: 'Tamil', c: 'ftami1=0-13' }] }] },
      { subject: 'Malayalam', langs: [{ lang: 'Other', books: [{ t: 'Malayalam', c: 'fmaly1=0-10' }] }] },
      { subject: 'Nepali', langs: [{ lang: 'Other', books: [{ t: 'Nepali', c: 'fnepa1=0-13' }] }] },
      { subject: 'Kannada', langs: [{ lang: 'Other', books: [{ t: 'Kannada', c: 'fkannada1=0-11' }] }] },
      { subject: 'Marathi', langs: [{ lang: 'Other', books: [{ t: 'Marathi', c: 'fmargod1=0-10' }] }] },
    ],
  },
  {
    cls: 7,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Ganita Prakash', c: 'gegp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gegp2=0-7' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Ganita Prakash', c: 'ghgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'ghgp2=0-7' },
            ],
          },
          { lang: 'Urdu', books: [{ t: 'Ganita Prakash', c: 'gugp1=0-8' }] },
          {
            lang: 'Sanskrit',
            books: [
              { t: 'Ganita Prakash', c: 'gskgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gskgp2=0-7' },
            ],
          },
          {
            lang: 'Assamese',
            books: [
              { t: 'Ganita Prakash', c: 'gasgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gasgp2=0-7' },
            ],
          },
          {
            lang: 'Bengali',
            books: [
              { t: 'Ganita Prakash', c: 'gbngp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gbngp2=0-7' },
            ],
          },
          {
            lang: 'Bodo',
            books: [
              { t: 'Ganita Prakash', c: 'gbdgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gbdgp2=0-7' },
            ],
          },
          {
            lang: 'Dogri',
            books: [
              { t: 'Ganita Prakash', c: 'gdggp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gdggp2=0-7' },
            ],
          },
          {
            lang: 'Gujarati',
            books: [
              { t: 'Ganita Prakash', c: 'ggjgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'ggjgp2=0-7' },
            ],
          },
          {
            lang: 'Kannada',
            books: [
              { t: 'Ganita Prakash', c: 'gkngp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gkngp2=0-7' },
            ],
          },
          { lang: 'Kashmiri', books: [{ t: 'Ganita Prakash', c: 'gksgp1=0-8' }] },
          {
            lang: 'Konkani',
            books: [
              { t: 'Ganita Prakash', c: 'gkogp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gkogp2=0-7' },
            ],
          },
          {
            lang: 'Maithili',
            books: [
              { t: 'Ganita Prakash', c: 'gmtgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gmtgp2=0-7' },
            ],
          },
          {
            lang: 'Malayalam',
            books: [
              { t: 'Ganita Prakash', c: 'gmlgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gmlgp2=0-7' },
            ],
          },
          {
            lang: 'Manipuri',
            books: [
              { t: 'Ganita Prakash', c: 'gmngp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gmngp2=0-7' },
            ],
          },
          {
            lang: 'Marathi',
            books: [
              { t: 'Ganita Prakash', c: 'gmrgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gmrgp2=0-7' },
            ],
          },
          {
            lang: 'Nepali',
            books: [
              { t: 'Ganita Prakash', c: 'gnpgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gnpgp2=0-7' },
            ],
          },
          {
            lang: 'Odia',
            books: [
              { t: 'Ganita Prakash', c: 'gorgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gorgp2=0-7' },
            ],
          },
          {
            lang: 'Punjabi',
            books: [
              { t: 'Ganita Prakash', c: 'gpngp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gpngp2=0-7' },
            ],
          },
          { lang: 'Santali', books: [{ t: 'Ganita Prakash-II', c: 'gsngp2=0-7' }] },
          {
            lang: 'Sindhi',
            books: [
              { t: 'Ganita Prakash', c: 'gsigp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gsigp2=0-7' },
            ],
          },
          {
            lang: 'Tamil',
            books: [
              { t: 'Ganita Prakash', c: 'gtmgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gtmgp2=0-7' },
            ],
          },
          {
            lang: 'Telugu',
            books: [
              { t: 'Ganita Prakash', c: 'gtlgp1=0-8' },
              { t: 'Ganita Prakash-II', c: 'gtlgp2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Science',
        langs: [
          { lang: 'English', books: [{ t: 'Curiosity', c: 'gecu1=0-12' }] },
          { lang: 'Hindi', books: [{ t: 'Jigyasa', c: 'ghcu1=0-12' }] },
          { lang: 'Urdu', books: [{ t: 'Tajassus', c: 'gucu1=0-12' }] },
          { lang: 'Sanskrit', books: [{ t: 'Curiosity', c: 'gskcu1=0-12' }] },
          { lang: 'Assamese', books: [{ t: 'Curiosity', c: 'gascu1=0-12' }] },
          { lang: 'Bengali', books: [{ t: 'Curiosity', c: 'gbncu1=0-12' }] },
          { lang: 'Bodo', books: [{ t: 'Curiosity', c: 'gbdcu1=0-12' }] },
          { lang: 'Dogri', books: [{ t: 'Curiosity', c: 'gdgcu1=0-12' }] },
          { lang: 'Gujarati', books: [{ t: 'Curiosity', c: 'ggjcu1=0-12' }] },
          { lang: 'Kannada', books: [{ t: 'Curiosity', c: 'gkncu1=0-12' }] },
          { lang: 'Kashmiri', books: [{ t: 'Curiosity', c: 'gkscu1=0-12' }] },
          { lang: 'Konkani', books: [{ t: 'Curiosity', c: 'gkocu1=0-12' }] },
          { lang: 'Maithili', books: [{ t: 'Curiosity', c: 'gmtcu1=0-12' }] },
          { lang: 'Malayalam', books: [{ t: 'Curiosity', c: 'gmlcu1=0-12' }] },
          { lang: 'Manipuri', books: [{ t: 'Curiosity', c: 'gmncu1=0-12' }] },
          { lang: 'Marathi', books: [{ t: 'Curiosity', c: 'gmrcu1=0-12' }] },
          { lang: 'Nepali', books: [{ t: 'Curiosity', c: 'gnpcu1=0-12' }] },
          { lang: 'Odia', books: [{ t: 'Curiosity', c: 'gorcu1=0-12' }] },
          { lang: 'Punjabi', books: [{ t: 'Curiosity', c: 'gpncu1=0-12' }] },
          { lang: 'Santali', books: [{ t: 'Curiosity', c: 'gsncu1=0-12' }] },
          { lang: 'Sindhi', books: [{ t: 'Curiosity', c: 'gsicu1=0-12' }] },
          { lang: 'Tamil', books: [{ t: 'Curiosity', c: 'gtmcu1=0-12' }] },
          { lang: 'Telugu', books: [{ t: 'Curiosity', c: 'gtlcu1=0-12' }] },
        ],
      },
      {
        subject: 'Social Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gees1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gees2=0-8' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Samaj Ka Aadhyan: Bharat or uske aage Part-I', c: 'ghes1=0-12' },
              { t: 'Samaj Ka Aadhyan: Bharat or uske aage Part-II', c: 'ghes2=0-8' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Muashrey ki Daryaft - Hindustan aur Uske age Part-I', c: 'gues1=0-12' },
              { t: 'Muashrey ki Daryaft - Hindustan aur Uske age Part-II', c: 'gues2=0-8' },
            ],
          },
          {
            lang: 'Sanskrit',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gskes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gskes2=0-8' },
            ],
          },
          {
            lang: 'Assamese',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gases1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gases2=0-8' },
            ],
          },
          {
            lang: 'Bengali',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gbnes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gbnes2=0-8' },
            ],
          },
          {
            lang: 'Bodo',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gbdes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gbdes2=0-8' },
            ],
          },
          { lang: 'Dogri', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'gdges1=0-12' }] },
          {
            lang: 'Gujarati',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'ggjes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'ggjes2=0-8' },
            ],
          },
          {
            lang: 'Kannada',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gknes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gknes2=0-8' },
            ],
          },
          {
            lang: 'Kashmiri',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gkses1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gkses2=0-8' },
            ],
          },
          {
            lang: 'Konkani',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gkoes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gkoes2=0-8' },
            ],
          },
          { lang: 'Maithili', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'gmtes1=0-12' }] },
          {
            lang: 'Malayalam',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gmles1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gmles2=0-8' },
            ],
          },
          {
            lang: 'Manipuri',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gmnes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gmnes2=0-8' },
            ],
          },
          {
            lang: 'Marathi',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gmres1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gmres2=0-8' },
            ],
          },
          {
            lang: 'Nepali',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gnpes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gnpes2=0-8' },
            ],
          },
          {
            lang: 'Odia',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gores1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gores2=0-8' },
            ],
          },
          {
            lang: 'Punjabi',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gpnes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gpnes2=0-8' },
            ],
          },
          {
            lang: 'Santali',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gsnes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gsnes2=0-8' },
            ],
          },
          {
            lang: 'Sindhi',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gsies1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gsies2=0-8' },
            ],
          },
          {
            lang: 'Tamil',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gtmes1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gtmes2=0-8' },
            ],
          },
          {
            lang: 'Telugu',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'gtles1=0-12' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'gmres2=0-8' },
            ],
          },
        ],
      },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Poorvi', c: 'gepr1=0-5' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Malhar', c: 'ghml1=0-10' }] }] },
      { subject: 'Sanskrit', langs: [{ lang: 'Sanskrit', books: [{ t: 'Deepakam', c: 'gsde1=0-15' }] }] },
      { subject: 'Urdu', langs: [{ lang: 'Urdu', books: [{ t: 'Khayal', c: 'guky1=0-14' }] }] },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Kriti', c: 'gekr1=0-20' }] },
          { lang: 'Hindi', books: [{ t: 'Kriti-I', c: 'ghkr1=0-20' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kriti-I', c: 'gskkr1=0-20' }] },
          { lang: 'Assamese', books: [{ t: 'Kriti-I', c: 'gaskr1=0-20' }] },
          { lang: 'Bengali', books: [{ t: 'Kriti-I', c: 'gbnkr1=0-20' }] },
          { lang: 'Bodo', books: [{ t: 'Kriti-I', c: 'gbdkr1=0-20' }] },
          { lang: 'Dogri', books: [{ t: 'Kriti-I', c: 'gdgkr1=0-20' }] },
          { lang: 'Gujarati', books: [{ t: 'Kriti-I', c: 'ggjkr1=0-20' }] },
          { lang: 'Kannada', books: [{ t: 'Kriti-I', c: 'gknkr1=0-20' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kriti-I', c: 'gkskr1=0-20' }] },
          { lang: 'Konkani', books: [{ t: 'Kriti-I', c: 'gkokr1=0-20' }] },
          { lang: 'Maithili', books: [{ t: 'Kriti-I', c: 'gmtkr1=0-20' }] },
          { lang: 'Malayalam', books: [{ t: 'Kriti-I', c: 'gmlkr1=0-20' }] },
          { lang: 'Manipuri', books: [{ t: 'Kriti-I', c: 'gmnkr1=0-20' }] },
          { lang: 'Marathi', books: [{ t: 'Kriti-I', c: 'gmrkr1=0-20' }] },
          { lang: 'Nepali', books: [{ t: 'Kriti-I', c: 'gnpkr1=0-20' }] },
          { lang: 'Odia', books: [{ t: 'Kriti-I', c: 'gorkr1=0-20' }] },
          { lang: 'Punjabi', books: [{ t: 'Kriti-I', c: 'gpnkr1=0-20' }] },
          { lang: 'Santali', books: [{ t: 'Kriti-I', c: 'gsnkr1=0-20' }] },
          { lang: 'Sindhi', books: [{ t: 'Kriti-I', c: 'gsikr1=0-20' }] },
          { lang: 'Tamil', books: [{ t: 'Kriti-I', c: 'gtmkr1=0-20' }] },
          { lang: 'Telugu', books: [{ t: 'Kriti-I', c: 'gsikr1=0-20' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yatra', c: 'geky1=0-6' }] },
          { lang: 'Hindi', books: [{ t: 'Khel Yatra', c: 'ghky1=0-6' }] },
          { lang: 'Urdu', books: [{ t: 'Khel Yatra', c: 'gukl1=0-6' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yatra', c: 'gskky1=0-6' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yatra', c: 'gasky1=0-6' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yatra', c: 'gbnky1=0-6' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yatra', c: 'gbdky1=0-6' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yatra', c: 'gdgky1=0-6' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yatra', c: 'ggjky1=0-6' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yatra', c: 'gknky1=0-6' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yatra', c: 'gksky1=0-6' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yatra', c: 'gkoky1=0-6' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yatra', c: 'gmtky1=0-6' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yatra', c: 'gmlky1=0-6' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yatra', c: 'gmnky1=0-6' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yatra', c: 'gmrky1=0-6' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yatra', c: 'gnpky1=0-6' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yatra', c: 'gorky1=0-6' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yatra', c: 'gpnky1=0-6' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yatra', c: 'gsnky1=0-6' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yatra', c: 'gsiky1=0-6' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yatra', c: 'gtmky1=0-6' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yatra', c: 'gtlky1=0-6' }] },
        ],
      },
      {
        subject: 'Vocational Education',
        langs: [
          { lang: 'English', books: [{ t: 'Kaushal Bodh', c: 'gekb1=0-7' }] },
          { lang: 'Hindi', books: [{ t: 'Kaushal Bodh', c: 'ghkb1=0-7' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kaushal Bodh', c: 'gskkb1=0-7' }] },
          { lang: 'Assamese', books: [{ t: 'Kaushal Bodh', c: 'gaskb1=0-7' }] },
          { lang: 'Bengali', books: [{ t: 'Kaushal Bodh', c: 'gbnkb1=0-7' }] },
          { lang: 'Bodo', books: [{ t: 'Kaushal Bodh', c: 'gbdkb1=0-7' }] },
          { lang: 'Dogri', books: [{ t: 'Kaushal Bodh', c: 'gdgkb1=0-7' }] },
          { lang: 'Gujarati', books: [{ t: 'Kaushal Bodh', c: 'ggjkb1=0-7' }] },
          { lang: 'Kannada', books: [{ t: 'Kaushal Bodh', c: 'gknkb1=0-7' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kaushal Bodh', c: 'gkskb1=0-7' }] },
          { lang: 'Konkani', books: [{ t: 'Kaushal Bodh', c: 'gkokb1=0-7' }] },
          { lang: 'Maithili', books: [{ t: 'Kaushal Bodh', c: 'gmtkb1=0-7' }] },
          { lang: 'Malayalam', books: [{ t: 'Kaushal Bodh', c: 'gmlkb1=0-7' }] },
          { lang: 'Manipuri', books: [{ t: 'Kaushal Bodh', c: 'gmnkb1=0-7' }] },
          { lang: 'Marathi', books: [{ t: 'Kaushal Bodh', c: 'gmrkb1=0-7' }] },
          { lang: 'Nepali', books: [{ t: 'Kaushal Bodh', c: 'gnpkb1=0-7' }] },
          { lang: 'Odia', books: [{ t: 'Kaushal Bodh', c: 'gorkb1=0-7' }] },
          { lang: 'Punjabi', books: [{ t: 'Kaushal Bodh', c: 'gpnkb1=0-7' }] },
          { lang: 'Santali', books: [{ t: 'Kaushal Bodh', c: 'gsnkb1=0-7' }] },
          { lang: 'Sindhi', books: [{ t: 'Kaushal Bodh', c: 'gsikb1=0-7' }] },
          { lang: 'Tamil', books: [{ t: 'Kaushal Bodh', c: 'gtmkb1=0-7' }] },
          { lang: 'Telugu', books: [{ t: 'Kaushal Bodh', c: 'gtlkb1=0-7' }] },
        ],
      },
    ],
  },
  {
    cls: 8,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hegp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hegp2=0-7' },
              { t: 'Mathematics', c: 'hemh1=0-13' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hhgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hhgp2=0-7' },
              { t: 'Ganit', c: 'hhmh1=0-13' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hugp1=0-7' },
              { t: 'Riyazi', c: 'huhi1=0-16' },
            ],
          },
          {
            lang: 'Sanskrit',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hskgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hskgp2=0-7' },
            ],
          },
          {
            lang: 'Assamese',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hasgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hasgp2=0-7' },
            ],
          },
          {
            lang: 'Bengali',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hbngp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hbngp2=0-7' },
            ],
          },
          {
            lang: 'Bodo',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hbdgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hbdgp2=0-7' },
            ],
          },
          {
            lang: 'Dogri',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hdggp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hdggp2=0-7' },
            ],
          },
          {
            lang: 'Gujarati',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hgjgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hgjgp2=0-7' },
            ],
          },
          {
            lang: 'Kannada',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hkngp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hkngp2=0-7' },
            ],
          },
          { lang: 'Kashmiri', books: [{ t: 'Ganita Prakash Part-I', c: 'hksgp1=0-7' }] },
          {
            lang: 'Konkani',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hkogp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hkogp2=0-7' },
            ],
          },
          { lang: 'Maithili', books: [{ t: 'Ganita Prakash Part-I', c: 'hmtgp1=0-7' }] },
          {
            lang: 'Malayalam',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hmlgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hmlgp2=0-7' },
            ],
          },
          {
            lang: 'Manipuri',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hmngp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hmngp2=0-7' },
            ],
          },
          {
            lang: 'Marathi',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hmrgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hmrgp2=0-7' },
            ],
          },
          {
            lang: 'Nepali',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hnpgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hnpgp2=0-7' },
            ],
          },
          {
            lang: 'Odia',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'horgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'horgp2=0-7' },
            ],
          },
          {
            lang: 'Punjabi',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hpngp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hpngp2=0-7' },
            ],
          },
          {
            lang: 'Santali',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hsngp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hsngp2=0-7' },
            ],
          },
          {
            lang: 'Sindhi',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'hsigp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'hsigp2=0-7' },
            ],
          },
          {
            lang: 'Tamil',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'htmgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'htmgp2=0-7' },
            ],
          },
          {
            lang: 'Telugu',
            books: [
              { t: 'Ganita Prakash Part-I', c: 'htlgp1=0-7' },
              { t: 'Ganita Prakash Part-II', c: 'htlgp2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Curiosity', c: 'hecu1=0-13' },
              { t: 'Science', c: 'hesc1=0-13' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Jigyasa', c: 'hhcu1=0-13' },
              { t: 'Vigyan', c: 'hhsc1=0-13' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Tajassus', c: 'hucu1=0-13' },
              { t: 'Science', c: 'huse1=0-18' },
            ],
          },
          { lang: 'Sanskrit', books: [{ t: 'Curiosity', c: 'hskcu1=0-13' }] },
          { lang: 'Assamese', books: [{ t: 'Curiosity', c: 'hascu1=0-13' }] },
          { lang: 'Bengali', books: [{ t: 'Curiosity', c: 'hbncu1=0-13' }] },
          { lang: 'Bodo', books: [{ t: 'Curiosity', c: 'hbdcu1=0-13' }] },
          { lang: 'Dogri', books: [{ t: 'Curiosity', c: 'hdgcu1=0-13' }] },
          { lang: 'Gujarati', books: [{ t: 'Curiosity', c: 'hgjcu1=0-13' }] },
          { lang: 'Kannada', books: [{ t: 'Curiosity', c: 'hkncu1=0-13' }] },
          { lang: 'Kashmiri', books: [{ t: 'Curiosity', c: 'hkscu1=0-13' }] },
          { lang: 'Konkani', books: [{ t: 'Curiosity', c: 'hkocu1=0-13' }] },
          { lang: 'Maithili', books: [{ t: 'Curiosity', c: 'hmtcu1=0-13' }] },
          { lang: 'Malayalam', books: [{ t: 'Curiosity', c: 'hmlcu1=0-13' }] },
          { lang: 'Manipuri', books: [{ t: 'Curiosity', c: 'hmncu1=0-13' }] },
          { lang: 'Marathi', books: [{ t: 'Curiosity', c: 'hmrcu1=0-13' }] },
          { lang: 'Nepali', books: [{ t: 'Curiosity', c: 'hnpcu1=0-13' }] },
          { lang: 'Odia', books: [{ t: 'Curiosity', c: 'horcu1=0-13' }] },
          { lang: 'Punjabi', books: [{ t: 'Curiosity', c: 'hpncu1=0-13' }] },
          { lang: 'Santali', books: [{ t: 'Curiosity', c: 'hsncu1=0-13' }] },
          { lang: 'Sindhi', books: [{ t: 'Curiosity', c: 'hsicu1=0-13' }] },
          { lang: 'Tamil', books: [{ t: 'Curiosity', c: 'htmcu1=0-13' }] },
          { lang: 'Telugu', books: [{ t: 'Curiosity', c: 'htlcu1=0-13' }] },
        ],
      },
      {
        subject: 'Social Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Exploring Society India and Beyond Part-I', c: 'hees1=0-7' },
              { t: 'Exploring Society India and Beyond Part-II', c: 'hees2=0-8' },
              { t: 'Resource And Development(Geography)', c: 'hess4=0-5' },
              { t: 'Social And Political Life', c: 'hess3=0-8' },
              { t: 'Our-Pasts-III', c: 'hess2=0-8' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Samaj Ka Aadhyan: Bharat or uske aage Part-I', c: 'hhes1=0-7' },
              { t: 'Sansadhan Avam Vikas(Bhugol)', c: 'hhss4=0-5' },
              { t: 'Samajik Avam Rajnatik Jeevan', c: 'hhss3=0-8' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Muashrey ki Daryaft - Hindustan Aur Uske Age Part-I', c: 'hues1=0-7' },
              { t: 'Wasayel aur Taraqqui', c: 'hugy1=0-6' },
              { t: 'Samaji Aur Siyasi Zindagi', c: 'huss1=0-10' },
              { t: 'Hamare Maazi-III', c: 'huhm1=0-8' },
            ],
          },
          { lang: 'Sanskrit', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hskes1=0-7' }] },
          { lang: 'Assamese', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hases1=0-7' }] },
          { lang: 'Bengali', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hbnes1=0-7' }] },
          { lang: 'Bodo', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hbdes1=0-7' }] },
          { lang: 'Dogri', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hdges1=0-7' }] },
          { lang: 'Gujarati', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hgjes1=0-7' }] },
          { lang: 'Kannada', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hknes1=0-7' }] },
          { lang: 'Kashmiri', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hkses1=0-7' }] },
          { lang: 'Konkani', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hkoes1=0-7' }] },
          { lang: 'Maithili', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hmtes1=0-7' }] },
          { lang: 'Malayalam', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hmles1=0-7' }] },
          { lang: 'Manipuri', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hmnes1=0-7' }] },
          { lang: 'Marathi', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hmres1=0-7' }] },
          { lang: 'Nepali', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hnpes1=0-7' }] },
          { lang: 'Odia', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hores1=0-7' }] },
          { lang: 'Punjabi', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hpnes1=0-7' }] },
          { lang: 'Santali', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hsnes1=0-7' }] },
          { lang: 'Sindhi', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'hsies1=0-7' }] },
          { lang: 'Tamil', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'htmes1=0-7' }] },
          { lang: 'Telugu', books: [{ t: 'Exploring Society India and Beyond Part-I', c: 'htles1=0-7' }] },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Poorvi', c: 'hepr1=0-5' },
              { t: 'Honeydew', c: 'hehd1=0-8' },
              { t: 'It So Happend', c: 'heih1=0-8' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Malhar', c: 'hhml1=0-10' },
              { t: 'Vasant', c: 'hhvs1=0-13' },
              { t: 'Durva', c: 'hhdv1=0-19' },
              { t: 'Bharat Ki Khoj', c: 'hhbk1=0-9' },
              { t: 'Sanshipt Budhcharit', c: 'hhsb1=0-5' },
            ],
          },
        ],
      },
      {
        subject: 'Sanskrit',
        langs: [
          { lang: 'Hindi', books: [{ t: 'Ruchira', c: 'hhsk1=0-14' }] },
          { lang: 'Sanskrit', books: [{ t: 'Deepakam', c: 'hsde1=0-16' }] },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Khayal', c: 'hukl1=0-21' },
              { t: 'Apni Zaban', c: 'huaz1=0-22' },
              { t: 'Urdu Guldasta (Supl)', c: 'huug1=0-9' },
              { t: 'Door-Pass', c: 'hudp1=0-20' },
              { t: 'Jaan Pahechan', c: 'hujp1=0-20' },
            ],
          },
        ],
      },
      {
        subject: 'Arts',
        langs: [
          { lang: 'English', books: [{ t: 'Kriti', c: 'hekr1=0-19' }] },
          { lang: 'Hindi', books: [{ t: 'Kriti', c: 'hhkr1=0-19' }] },
          { lang: 'Urdu', books: [{ t: 'Kriti', c: 'hukr1=0-19' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kriti', c: 'hskkr1=0-19' }] },
          { lang: 'Assamese', books: [{ t: 'Kriti', c: 'haskr1=0-19' }] },
          { lang: 'Bengali', books: [{ t: 'Kriti', c: 'hbnkr1=0-19' }] },
          { lang: 'Bodo', books: [{ t: 'Kriti', c: 'hbdkr1=0-19' }] },
          { lang: 'Dogri', books: [{ t: 'Kriti', c: 'hdgkr1=0-19' }] },
          { lang: 'Gujarati', books: [{ t: 'Kriti', c: 'hgjkr1=0-19' }] },
          { lang: 'Kannada', books: [{ t: 'Kriti', c: 'hknkr1=0-19' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kriti', c: 'hkskr1=0-19' }] },
          { lang: 'Konkani', books: [{ t: 'Kriti', c: 'hkokr1=0-19' }] },
          { lang: 'Maithili', books: [{ t: 'Kriti', c: 'hmtkr1=0-19' }] },
          { lang: 'Malayalam', books: [{ t: 'Kriti', c: 'hmlkr1=0-19' }] },
          { lang: 'Manipuri', books: [{ t: 'Kriti', c: 'hmnkr1=0-19' }] },
          { lang: 'Marathi', books: [{ t: 'Kriti', c: 'hmrkr1=0-19' }] },
          { lang: 'Nepali', books: [{ t: 'Kriti', c: 'hnpkr1=0-19' }] },
          { lang: 'Odia', books: [{ t: 'Kriti', c: 'horkr1=0-19' }] },
          { lang: 'Punjabi', books: [{ t: 'Kriti', c: 'hpnkr1=0-19' }] },
          { lang: 'Santali', books: [{ t: 'Kriti', c: 'hsnkr1=0-19' }] },
          { lang: 'Sindhi', books: [{ t: 'Kriti', c: 'hsikr1=0-19' }] },
          { lang: 'Tamil', books: [{ t: 'Kriti', c: 'htmkr1=0-19' }] },
          { lang: 'Telugu', books: [{ t: 'Kriti', c: 'htlkr1=0-19' }] },
        ],
      },
      {
        subject: 'Physical Education and Well Being',
        langs: [
          { lang: 'English', books: [{ t: 'Khel Yatra', c: 'heky1=0-6' }] },
          { lang: 'Hindi', books: [{ t: 'Khel Yatra', c: 'hhky1=0-6' }] },
          { lang: 'Urdu', books: [{ t: 'Khel Yatra', c: 'huky1=0-6' }] },
          { lang: 'Sanskrit', books: [{ t: 'Khel Yatra', c: 'hskky1=0-6' }] },
          { lang: 'Assamese', books: [{ t: 'Khel Yatra', c: 'hasky1=0-6' }] },
          { lang: 'Bengali', books: [{ t: 'Khel Yatra', c: 'hbnky1=0-6' }] },
          { lang: 'Bodo', books: [{ t: 'Khel Yatra', c: 'hbdky1=0-6' }] },
          { lang: 'Dogri', books: [{ t: 'Khel Yatra', c: 'hdgky1=0-6' }] },
          { lang: 'Gujarati', books: [{ t: 'Khel Yatra', c: 'hgjky1=0-6' }] },
          { lang: 'Kannada', books: [{ t: 'Khel Yatra', c: 'hknky1=0-6' }] },
          { lang: 'Kashmiri', books: [{ t: 'Khel Yatra', c: 'hksky1=0-6' }] },
          { lang: 'Konkani', books: [{ t: 'Khel Yatra', c: 'hkoky1=0-6' }] },
          { lang: 'Maithili', books: [{ t: 'Khel Yatra', c: 'hmtky1=0-6' }] },
          { lang: 'Malayalam', books: [{ t: 'Khel Yatra', c: 'hmlky1=0-6' }] },
          { lang: 'Manipuri', books: [{ t: 'Khel Yatra', c: 'hmnky1=0-6' }] },
          { lang: 'Marathi', books: [{ t: 'Khel Yatra', c: 'hmrky1=0-6' }] },
          { lang: 'Nepali', books: [{ t: 'Khel Yatra', c: 'hnpky1=0-6' }] },
          { lang: 'Odia', books: [{ t: 'Khel Yatra', c: 'horky1=0-6' }] },
          { lang: 'Punjabi', books: [{ t: 'Khel Yatra', c: 'hpnky1=0-6' }] },
          { lang: 'Santali', books: [{ t: 'Khel Yatra', c: 'hsnky1=0-6' }] },
          { lang: 'Sindhi', books: [{ t: 'Khel Yatra', c: 'hsiky1=0-6' }] },
          { lang: 'Tamil', books: [{ t: 'Khel Yatra', c: 'htmky1=0-6' }] },
          { lang: 'Telugu', books: [{ t: 'Khel Yatra', c: 'htlky1=0-6' }] },
        ],
      },
      {
        subject: 'Vocational Education',
        langs: [
          { lang: 'English', books: [{ t: 'Kaushal Bodh', c: 'hekb1=0-7' }] },
          { lang: 'Hindi', books: [{ t: 'Kaushal Bodh', c: 'hhkb1=0-7' }] },
          { lang: 'Sanskrit', books: [{ t: 'Kaushal Bodh', c: 'hskkb1=0-7' }] },
          { lang: 'Assamese', books: [{ t: 'Kaushal Bodh', c: 'haskb1=0-7' }] },
          { lang: 'Bengali', books: [{ t: 'Kaushal Bodh', c: 'hbnkb1=0-7' }] },
          { lang: 'Bodo', books: [{ t: 'Kaushal Bodh', c: 'hbdkb1=0-7' }] },
          { lang: 'Dogri', books: [{ t: 'Kaushal Bodh', c: 'hdgkb1=0-7' }] },
          { lang: 'Gujarati', books: [{ t: 'Kaushal Bodh', c: 'hgjkb1=0-7' }] },
          { lang: 'Kannada', books: [{ t: 'Kaushal Bodh', c: 'hknkb1=0-7' }] },
          { lang: 'Kashmiri', books: [{ t: 'Kaushal Bodh', c: 'hkskb1=0-7' }] },
          { lang: 'Konkani', books: [{ t: 'Kaushal Bodh', c: 'hkokb1=0-7' }] },
          { lang: 'Maithili', books: [{ t: 'Kaushal Bodh', c: 'hmtkb1=0-7' }] },
          { lang: 'Malayalam', books: [{ t: 'Kaushal Bodh', c: 'hmlkb1=0-7' }] },
          { lang: 'Manipuri', books: [{ t: 'Kaushal Bodh', c: 'hmnkb1=0-7' }] },
          { lang: 'Marathi', books: [{ t: 'Kaushal Bodh', c: 'hmrkb1=0-7' }] },
          { lang: 'Nepali', books: [{ t: 'Kaushal Bodh', c: 'hnpkb1=0-7' }] },
          { lang: 'Odia', books: [{ t: 'Kaushal Bodh', c: 'horkb1=0-7' }] },
          { lang: 'Punjabi', books: [{ t: 'Kaushal Bodh', c: 'hpnkb1=0-7' }] },
          { lang: 'Santali', books: [{ t: 'Kaushal Bodh', c: 'hsnkb1=0-7' }] },
          { lang: 'Sindhi', books: [{ t: 'Kaushal Bodh', c: 'hsikb1=0-7' }] },
          { lang: 'Tamil', books: [{ t: 'Kaushal Bodh', c: 'htmkb1=0-7' }] },
          { lang: 'Telugu', books: [{ t: 'Kaushal Bodh', c: 'htlkb1=0-7' }] },
        ],
      },
    ],
  },
  {
    cls: 9,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Ganita Manjari', c: 'iemh1=0-8' },
              { t: 'Ganita Manjari PART-II', c: 'iemh2=0-6' },
            ],
          },
          { lang: 'Hindi', books: [{ t: 'Ganita Manjari', c: 'ihmh1=0-8' }] },
          { lang: 'Urdu', books: [{ t: 'Ganit Manjari', c: 'iumh1=0-8' }] },
        ],
      },
      {
        subject: 'Science',
        langs: [
          { lang: 'English', books: [{ t: 'Exploration', c: 'iesc1=0-13' }] },
          { lang: 'Hindi', books: [{ t: 'Anveshan', c: 'ihsc1=0-13' }] },
        ],
      },
      { subject: 'Social Science', langs: [{ lang: 'English', books: [{ t: 'Understanding Society India and Beyond PART-I', c: 'iest1=0-9' }] }] },
      { subject: 'English', langs: [{ lang: 'English', books: [{ t: 'Kaveri', c: 'iebe1=0-8' }] }] },
      { subject: 'Hindi', langs: [{ lang: 'Hindi', books: [{ t: 'Ganga', c: 'ihga1=0-12' }] }] },
      {
        subject: 'Sanskrit',
        langs: [
          { lang: 'Hindi', books: [{ t: 'Sharada', c: 'ihsh1=0-16' }] },
          { lang: 'Sanskrit', books: [{ t: 'Risikulya(R2)', c: 'isanskritr21=0-10' }] },
        ],
      },
      { subject: 'Urdu', langs: [{ lang: 'Urdu', books: [{ t: 'Jamuna', c: 'iuju1=0-15' }] }] },
      { subject: 'Arts', langs: [{ lang: 'English', books: [{ t: 'Madhurima', c: 'iemr1=0-17' }] }] },
      { subject: 'Physical Education and Well Being', langs: [{ lang: 'English', books: [{ t: 'Khel Praveen', c: 'iehp1=0-6' }] }] },
      {
        subject: 'Vocational',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Cashier', c: 'ievc1=0-5' },
              { t: 'Store Operations Assistant', c: 'ieva1=0-4' },
              { t: 'Solanceous Crop Cultivator', c: 'ievs1=0-5' },
              { t: 'Assistant Beauty Therapist', c: 'ievt1=0-3' },
              { t: 'Animal Health Workers (Agriculture)', c: 'ievw1=0-4' },
              { t: 'Hand Embroiderer (Addawala)', c: 'ieve1=0-5' },
              { t: 'Hand Embroiderer', c: 'ievh1=0-5' },
              { t: 'Plumber General', c: 'iepg1=0-5' },
              { t: 'IT Domestic Data Entry Operator', c: 'ieeo1=0-5' },
              { t: 'Employability Skill', c: 'iees1=0-5' },
            ],
          },
        ],
      },
      { subject: 'Skill Education', langs: [{ lang: 'English', books: [{ t: 'Kaushal Vikas', c: 'iekv1=0-12' }] }] },
      { subject: 'Environmental Education', langs: [{ lang: 'English', books: [{ t: 'Project Books', c: 'iepb1=pp-0' }] }] },
    ],
  },
  {
    cls: 10,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Mathematics', c: 'jemh1=0-14' }] },
          { lang: 'Hindi', books: [{ t: 'Ganit', c: 'jhmh1=0-14' }] },
          { lang: 'Urdu', books: [{ t: 'Riyazi', c: 'jumh1=0-15' }] },
        ],
      },
      {
        subject: 'Science',
        langs: [
          { lang: 'English', books: [{ t: 'Science', c: 'jesc1=0-13' }] },
          { lang: 'Hindi', books: [{ t: 'Vigyan', c: 'jhsc1=0-13' }] },
          { lang: 'Urdu', books: [{ t: 'Science', c: 'jusc1=0-16' }] },
        ],
      },
      {
        subject: 'Social Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Contemporary India', c: 'jess1=0-7' },
              { t: 'Understanding Economic Development', c: 'jess2=0-5' },
              { t: 'India and the Contemporary World-II', c: 'jess3=0-5' },
              { t: 'Democratic Politics', c: 'jess4=0-5' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Samkalin Bharat', c: 'jhss1=0-7' },
              { t: 'Arthik Vikas ki Samajh', c: 'jhss2=0-5' },
              { t: 'Bharat Aur Samakalin Vishav-2', c: 'jhss3=0-5' },
              { t: 'Loktantrik Rajniti', c: 'jhss4=0-5' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Aasri Hindustan-II', c: 'juss1=0-7' },
              { t: 'Maashi Taraqqui Ki Samajh', c: 'juss2=0-5' },
              { t: 'Hindustan Aur Asri Duniya', c: 'juss3=0-5' },
              { t: 'Jamhuri Siyasat-II', c: 'juss4=0-8' },
            ],
          },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'First Flight', c: 'jeff1=0-9' },
              { t: 'Foot Prints Without feet Supp. Reader', c: 'jefp1=0-9' },
              { t: 'Words and Expressions  2', c: 'jewe2=0-9' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Kshitij-2', c: 'jhks1=0-12' },
              { t: 'Sparsh', c: 'jhsp1=0-14' },
              { t: 'Sanchayan Bhag-2', c: 'jhsy1=0-3' },
              { t: 'Kritika', c: 'jhkr1=0-3' },
            ],
          },
        ],
      },
      {
        subject: 'Sanskrit',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Shemushi', c: 'jhsk1=0-10' },
              { t: 'Vyakaranavithi', c: 'jhva1=0-12' },
            ],
          },
          { lang: 'Sanskrit', books: [{ t: 'Abhyaswaan Bhav-II', c: 'jsab1=0-14' }] },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Gulzar-e-Urdu', c: 'juge1=0-12' },
              { t: 'Nawa-e-Urdu', c: 'june1=0-14' },
              { t: 'Jaan Pahechan', c: 'jujp1=0-22' },
              { t: 'Door-Paas', c: 'judp1=0-19' },
              { t: 'Sab Rang', c: 'jusr1=0-9' },
            ],
          },
        ],
      },
      { subject: 'Health and Physical Education', langs: [{ lang: 'English', books: [{ t: 'Health and Physical Education', c: 'jehp1=0-13' }] }] },
    ],
  },
  {
    cls: 11,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          { lang: 'English', books: [{ t: 'Mathematics', c: 'kemh1=0-14' }] },
          { lang: 'Hindi', books: [{ t: 'Ganit', c: 'khmh1=0-14' }] },
          { lang: 'Urdu', books: [{ t: 'Riyazi I', c: 'kumh1=0-16' }] },
        ],
      },
      {
        subject: 'Physics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Physics Part-I', c: 'keph1=0-7' },
              { t: 'Physics Part-II', c: 'keph2=0-7' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhautiki-I', c: 'khph1=0-7' },
              { t: 'Bhautiki-II', c: 'khph2=0-7' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Tabiyaat-I', c: 'kuph1=0-8' },
              { t: 'Tabiyaat-II', c: 'kuph2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Chemistry',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Chemistry Part-I', c: 'kech1=0-6' },
              { t: 'Chemistry Part II', c: 'kech2=0-3' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Rasayan Vigyan bhag-I', c: 'khch1=0-6' },
              { t: 'Rasayan Vigyan bhag-II', c: 'khch2=0-3' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Keemiya I', c: 'kuch1=0-7' },
              { t: 'Keemiya II', c: 'kuch2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Biology',
        langs: [
          { lang: 'English', books: [{ t: 'Biology', c: 'kebo1=0-19' }] },
          { lang: 'Hindi', books: [{ t: 'Jeev Vigyan', c: 'khbo1=0-19' }] },
          { lang: 'Urdu', books: [{ t: 'Hayatiyaat', c: 'kubo1=0-22' }] },
        ],
      },
      { subject: 'Biotechnology', langs: [{ lang: 'English', books: [{ t: 'Biotechnology', c: 'kebt1=0-12' }] }] },
      {
        subject: 'History',
        langs: [
          { lang: 'English', books: [{ t: 'Themes in World History', c: 'kehs1=0-7' }] },
          { lang: 'Hindi', books: [{ t: 'Vishwa Itihas Ke Kuch Vishay', c: 'khhs1=0-7' }] },
          { lang: 'Urdu', books: [{ t: 'Tareekh-e-Alam per Mabni Mauzuaat Part I', c: 'kuta1=0-11' }] },
        ],
      },
      {
        subject: 'Geography',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Fundamental of Physical Geography', c: 'kegy2=0-14' },
              { t: 'Pratical Work in Geography', c: 'kegy3=0-6' },
              { t: 'India Physical Environment', c: 'kegy1=0-6' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhautique Bhugol ke Mool Sidhant', c: 'khgy2=0-14' },
              { t: 'Bhugol Main Prayogatmak Karya', c: 'khgy3=0-6' },
              { t: 'Bhart Bhautik Paryabaran', c: 'khgy1=0-6' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: "Hindustan Tabi'i Mahaul", c: 'kugy1=0-7' },
              { t: 'Jughrafia Mein Aamli Kam', c: 'kugy3=0-8' },
              { t: "Tabi'i Jughraiya Ka Mubadiyat", c: 'kugm1=0-16' },
            ],
          },
        ],
      },
      {
        subject: 'Political Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Political Theory', c: 'keps1=0-8' },
              { t: 'India Constitution at Work', c: 'keps2=0-10' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Raajneeti Sidhant', c: 'khps1=0-8' },
              { t: 'Bharat ka Samvidhan Sidhant aur Vyavhar', c: 'khps2=0-10' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Hindustani Aain aur Kaam', c: 'kups1=0-10' },
              { t: 'Siyasi Nazaria', c: 'kups2=0-10' },
            ],
          },
        ],
      },
      {
        subject: 'Economics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Indian Economic Development', c: 'keec1=0-8' },
              { t: 'Statistics for Economics', c: 'kest1=0-8' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Sankhyiki', c: 'khst1=0-8' },
              { t: 'Bhartiya Airthryavstha Ka Vikas', c: 'khec1=0-8' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Hindustan Ki Moaashi Tarraqqi', c: 'kuec1=0-10' },
              { t: 'Shumariyaat Bar-e-Mushiyat', c: 'kusc1=0-9' },
            ],
          },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Woven Words', c: 'keww1=0-27' },
              { t: 'Hornbill', c: 'kehb1=0-14' },
              { t: 'Snapshots Suppl.Reader English', c: 'kesp1=0-5' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Antra', c: 'khat1=0-16' },
              { t: 'Aroh', c: 'khar1=0-16' },
              { t: 'Vitan', c: 'khvt1=0-5' },
              { t: 'Antral', c: 'khan1=0-2' },
            ],
          },
        ],
      },
      {
        subject: 'Sanskrit',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhaswati', c: 'khsk1=0-11' },
              { t: 'Shashwati', c: 'khsk2=0-11' },
            ],
          },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Nai Awaz', c: 'kuna1=0-20' },
              { t: 'Dhanak', c: 'kudh1=0-27' },
              { t: 'Gulistan e Adab', c: 'kuga1=0-22' },
              { t: 'Khyabane Urdu', c: 'kuku1=0-15' },
            ],
          },
        ],
      },
      {
        subject: 'Accountancy',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Financial Accounting-I', c: 'keac1=0-7' },
              { t: 'Accountancy-II', c: 'keac2=0-2' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Lekhashastra-I', c: 'khac1=0-7' },
              { t: 'Lekhashastra-II', c: 'khac2=0-2' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Khatadari-I', c: 'kuac1=0-8' },
              { t: 'Khatadari-II', c: 'kuac2=0-5' },
            ],
          },
        ],
      },
      {
        subject: 'Business Studies',
        langs: [
          { lang: 'English', books: [{ t: 'Business Studies', c: 'kebs1=0-11' }] },
          { lang: 'Hindi', books: [{ t: 'Vyavsay Adhyanan', c: 'khbs1=0-11' }] },
          { lang: 'Urdu', books: [{ t: 'Karobari Mutalah I', c: 'kubs1=0-11' }] },
        ],
      },
      {
        subject: 'Psychology',
        langs: [
          { lang: 'English', books: [{ t: 'Introduction to Psychology', c: 'kepy1=0-8' }] },
          { lang: 'Hindi', books: [{ t: 'Manovigyan', c: 'khpy1=0-8' }] },
          { lang: 'Urdu', books: [{ t: 'Nafsiyaat', c: 'kupy1=0-9' }] },
        ],
      },
      {
        subject: 'Sociology',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Introducing Sociology', c: 'kesy1=0-5' },
              { t: 'Understanding Society', c: 'kesy2=0-5' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Samaj Shastra Parichay-I', c: 'khsy1=0-5' },
              { t: 'Samaj ka Bodh', c: 'khsy2=0-5' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Samajiyaat Ka Tarf', c: 'kusy1=0-5' },
              { t: 'Mutala-e-Muashira', c: 'kusy2=0-5' },
            ],
          },
        ],
      },
      {
        subject: 'Home Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Human Ecology and Family Sciences Part I', c: 'kehe1=0-7' },
              { t: 'Human Ecology and Family Sciences Part II', c: 'kehe2=0-4' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Manav Paristhitiki evm pariwar vigyan Bhag-I', c: 'khhe1=0-7' },
              { t: 'Manav Paristhitiki evm pariwar vigyan Bhag-II', c: 'khhe2=0-5' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Insani Mahauliyat aur Uloom e Khandandari-I', c: 'kuim1=0-10' },
              { t: 'Insani Mahauliyat aur Uloom e Khandandari Part-II', c: 'kuim2=0-9' },
            ],
          },
        ],
      },
      {
        subject: 'Computer Science',
        langs: [
          { lang: 'English', books: [{ t: 'Computer Science', c: 'kecs1=0-11' }] },
          { lang: 'Urdu', books: [{ t: 'Computer Science - Urdu', c: 'kucs1=0-11' }] },
        ],
      },
      { subject: 'Informatics Practices', langs: [{ lang: 'English', books: [{ t: 'Informatics Practices', c: 'keip1=0-8' }] }] },
      {
        subject: 'Computers and Communication Technology',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'CCT Part-I', c: 'kect1=0-8' },
              { t: 'CCT Part-II', c: 'kect2=0-6' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Computer aur Sanchar Prodhogiki Part-I', c: 'khct1=0-8' },
              { t: 'Computer aur Sanchar Prodhogiki Part-II', c: 'khct2=0-6' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Computer Aur Muwaslati Technology I', c: 'kuct1=0-8' },
              { t: 'Computer Aur Muwaslati Technology II', c: 'kuct2=0-6' },
            ],
          },
        ],
      },
      { subject: 'Health and Physical Education', langs: [{ lang: 'English', books: [{ t: 'Health and Physical Education', c: 'kehp1=0-11' }] }] },
      {
        subject: 'Vocational',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Floriculturist- Protected Cultivation', c: 'kepc1=0-5' },
              { t: 'Vision Technician', c: 'kevt1=0-7' },
              { t: 'Floriculturist', c: 'keoc1=0-6' },
              { t: 'General Duty Assistant', c: 'keda1=0-5' },
              { t: 'Dairy Farmer Enterpreneur', c: 'kedf1=0-4' },
              { t: 'Floriculturist', c: 'kefc1=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'Heritage Crafts',
        langs: [
          { lang: 'English', books: [{ t: 'Living Craft Traditions of India', c: 'kehc1=0-10' }] },
          { lang: 'Urdu', books: [{ t: 'Hindustan me Dastkari Ki Riwayat', c: 'kuhc1=0-10' }] },
        ],
      },
      {
        subject: 'Fine Art',
        langs: [
          { lang: 'English', books: [{ t: 'An Introduction to Indian Art Part-I', c: 'kefa1=0-8' }] },
          { lang: 'Hindi', books: [{ t: 'Bhartiya Kala ka parichay', c: 'khfa1=0-8' }] },
        ],
      },
      {
        subject: 'Graphics design',
        langs: [
          { lang: 'English', books: [{ t: 'The story of graphic design', c: 'kegd1=0-8' }] },
          { lang: 'Hindi', books: [{ t: 'graphic design ek kahani', c: 'khgd1=0-8' }] },
        ],
      },
      {
        subject: 'Creative Writing and Translation',
        langs: [
          { lang: 'Hindi', books: [{ t: 'Srijan', c: 'khsr1=0-4' }] },
          { lang: 'Urdu', books: [{ t: 'Takhleequi Jauhar', c: 'kucw1=0-4' }] },
        ],
      },
      {
        subject: 'Sangeet',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Tabla evam Pakhawaj', c: 'khtp1=0-8' },
              { t: 'Hindustani Sangeet Gayan Evam Vadan', c: 'khgv1=0-10' },
            ],
          },
        ],
      },
      { subject: 'Knowledge Traditions Practices of India', langs: [{ lang: 'English', books: [{ t: 'Knowledge Traditions Practices of India', c: 'keks1=0-9' }] }] },
    ],
  },
  {
    cls: 12,
    subjects: [
      {
        subject: 'Mathematics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Mathematics Part-I', c: 'lemh1=0-6' },
              { t: 'Mathematics Part-II', c: 'lemh2=0-7' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Ganit-I', c: 'lhmh1=0-6' },
              { t: 'Ganit-II', c: 'lhmh2=0-7' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Riyazi-I', c: 'lumh1=0-6' },
              { t: 'Riyazi-II', c: 'lumh2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Physics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Physics Part-I', c: 'leph1=0-8' },
              { t: 'Physics Part-II', c: 'leph2=0-6' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhautiki-I', c: 'lhph1=0-8' },
              { t: 'Bhautiki-II', c: 'lhph2=0-6' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Tabiyaat-I', c: 'luph1=0-8' },
              { t: 'Tabiyaat-II', c: 'luph2=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'Chemistry',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Chemistry-I', c: 'lech1=0-5' },
              { t: 'Chemistry-II', c: 'lech2=0-5' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Rasayan vigyan bhag I', c: 'lhch1=0-5' },
              { t: 'Rasayan vigyan bhag II', c: 'lhch2=0-5' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Keemiya-I', c: 'luch1=0-9' },
              { t: 'Keemiya-II', c: 'luch2=0-7' },
            ],
          },
        ],
      },
      {
        subject: 'Biology',
        langs: [
          { lang: 'English', books: [{ t: 'Biology', c: 'lebo1=0-13' }] },
          { lang: 'Hindi', books: [{ t: 'Jeev Vigyan', c: 'lhbo1=0-13' }] },
          { lang: 'Urdu', books: [{ t: 'Hayatiyaat', c: 'lubo1=0-16' }] },
        ],
      },
      { subject: 'Biotechnology', langs: [{ lang: 'English', books: [{ t: 'Biotechnology', c: 'lebt1=0-13' }] }] },
      {
        subject: 'History',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Themes in Indian History-I', c: 'lehs1=0-4' },
              { t: 'Themes in Indian History-II', c: 'lehs2=0-4' },
              { t: 'Themes in Indian History-III', c: 'lehs3=0-4' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Bharatiya Itihas ke kuchh Vishay-I', c: 'lhhs1=0-4' },
              { t: 'Bharatiya Itihas ke kuchh Vishay-II', c: 'lhhs2=0-4' },
              { t: 'Bharatiya Itihas ke kuchh Vishay-III', c: 'lhhs3=0-4' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Tareekh-e-Hind ke Mauzuaat-I', c: 'luth1=0-4' },
              { t: 'Tareekh-e-Hind ke Mauzuaat-II', c: 'luth2=0-4' },
              { t: 'Tareekh-e-Hind ke Mauzuaat-III', c: 'luth3=0-4' },
            ],
          },
        ],
      },
      {
        subject: 'Geography',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Fundamentals of Human Geography', c: 'legy1=0-8' },
              { t: 'Practical Work in Geography Part II', c: 'legy3=0-4' },
              { t: 'India -People And Economy', c: 'legy2=0-9' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Manav Bhugol Ke Mool Sidhant', c: 'lhgy1=0-8' },
              { t: 'Bhugol main peryojnatmak pryogatmak karye', c: 'lhgy3=0-4' },
              { t: 'Bharat log aur arthvyasastha(Bhugol)', c: 'lhgy2=0-9' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Insani Jughrafia Ke Buniyadi Usool', c: 'lufh1=0-10' },
              { t: 'Hindustan Awam Aur Maishat', c: 'lugy1=0-12' },
              { t: 'Jughrafia Mein Aamli Kam', c: 'lugy3=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'Political Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Contemporary World Politics', c: 'leps1=0-7' },
              { t: 'Politics in India Since Independence', c: 'leps2=0-8' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Samkalin Vishwa Rajniti', c: 'lhps1=0-7' },
              { t: 'Swatantra Bharat Mein Rajniti-II', c: 'lhps2=0-8' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Aasri Alami Siyasat', c: 'lups1=0-9' },
              { t: 'Azadi Ke Baad Hindustan Ki Siyasat', c: 'luab1=0-9' },
            ],
          },
        ],
      },
      {
        subject: 'Economics',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Introductory Microeconomics', c: 'leec2=0-5' },
              { t: 'Introductory Macroeconomics', c: 'leec1=0-6' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Vyashthi Arthshasrta', c: 'lhec2=0-5' },
              { t: 'Samashty Arthshastra Ek Parichay', c: 'lhec1=0-6' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Juzvi Maashiyat ka Taruf', c: 'lume1=0-6' },
              { t: 'Kulli Maashiyat Ka Taruf', c: 'lume2=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'English',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Kaliedoscope', c: 'lekl1=0-21' },
              { t: 'Flamingo', c: 'lefl1=0-13' },
              { t: 'Vistas', c: 'levt1=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'Hindi',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Antra', c: 'lhat1=0-21' },
              { t: 'Aroh', c: 'lhar1=0-15' },
              { t: 'Vitan', c: 'lhvt1=0-3' },
              { t: 'Antral Bhag 2', c: 'lhan1=0-3' },
            ],
          },
        ],
      },
      {
        subject: 'Sanskrit',
        langs: [
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhaswati', c: 'lhsk1=0-10' },
              { t: 'Shaswati', c: 'lhsk2=0-11' },
            ],
          },
        ],
      },
      {
        subject: 'Urdu',
        langs: [
          {
            lang: 'Urdu',
            books: [
              { t: 'Gulistan-e- Adab', c: 'luga1=0-12' },
              { t: 'Khayaban-e-Urdu', c: 'luku1=0-6' },
              { t: 'Nai Awaz', c: 'luna1=0-16' },
              { t: 'Dhanak', c: 'ludh1=0-12' },
            ],
          },
        ],
      },
      {
        subject: 'Accountancy',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Accountancy-I', c: 'leac1=0-4' },
              { t: 'Accountancy Part-II', c: 'leac2=0-6' },
              { t: 'Computerised Accounting System', c: 'leca1=0-4' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Lekhashastra Part-I', c: 'lhac1=0-4' },
              { t: 'Lekhashastra Part-II', c: 'lhac2=0-5' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Khatadari-I', c: 'luac1=0-5' },
              { t: 'Khatadari-II', c: 'luac2=0-6' },
            ],
          },
        ],
      },
      {
        subject: 'Business Studies',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Business Studies-I', c: 'lebs1=0-8' },
              { t: 'Business Studies-II', c: 'lebs2=0-3' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Vyavasai Adhyan-I', c: 'lhbs1=0-8' },
              { t: 'Vyavasai Adhyan-II', c: 'lhbs2=0-3' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Karobari Uloom I', c: 'lubs1=0-8' },
              { t: 'Karobari Uloom II', c: 'lubs2=0-4' },
            ],
          },
        ],
      },
      {
        subject: 'Psychology',
        langs: [
          { lang: 'English', books: [{ t: 'Psychology', c: 'lepy1=0-7' }] },
          { lang: 'Hindi', books: [{ t: 'Manovigyan', c: 'lhpy1=0-7' }] },
          { lang: 'Urdu', books: [{ t: 'Nafsiat', c: 'lupy1=0-9' }] },
        ],
      },
      {
        subject: 'Sociology',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Indian Society', c: 'lesy1=0-7' },
              { t: 'Social Change and Development in India', c: 'lesy2=0-8' },
            ],
          },
          {
            lang: 'Hindi',
            books: [
              { t: 'Bhartiya Samaj', c: 'lhsy1=0-7' },
              { t: 'Bharat main Samajik Parivartan aur Vikas', c: 'lhsy2=0-8' },
            ],
          },
          {
            lang: 'Urdu',
            books: [
              { t: 'Hindustani Samaj', c: 'luis1=0-7' },
              { t: 'Hindustan Mein Samaji Tabdili Aur Taraqqi', c: 'lusy2=0-8' },
            ],
          },
        ],
      },
      {
        subject: 'Home Science',
        langs: [
          {
            lang: 'English',
            books: [
              { t: 'Human Ecology and Family Sciences Part I', c: 'lehe1=0-7' },
              { t: 'Human Ecology and Family Sciences Part II', c: 'lehe2=0-7' },
              { t: 'Manav Paristhitik avam Parivar Vigyan Bhag 1', c: 'lehh1=0-7' },
              { t: 'Manav Paristhitiki avam Parivar Vigyan Bhag 2', c: 'lehh2=0-7' },
            ],
          },
        ],
      },
      { subject: 'Computer Science', langs: [{ lang: 'English', books: [{ t: 'Computer Science', c: 'lecs1=0-13' }] }] },
      { subject: 'Informatics Practices', langs: [{ lang: 'English', books: [{ t: 'Informatics Practices', c: 'leip1=0-7' }] }] },
      {
        subject: 'Heritage Crafts',
        langs: [
          { lang: 'English', books: [{ t: 'Craft Tradition of India', c: 'lehc1=0-9' }] },
          { lang: 'Hindi', books: [{ t: 'Bharatiya Hastkla Ki Paramparayen', c: 'lhhc1=0-9' }] },
          { lang: 'Urdu', books: [{ t: 'Hindustan me Dastkari Ki Riwayat', c: 'luhc1=0-9' }] },
        ],
      },
      {
        subject: 'Fine Art',
        langs: [
          { lang: 'English', books: [{ t: 'An Introduction to Indian Art Part-II', c: 'lefa1=0-8' }] },
          { lang: 'Hindi', books: [{ t: 'Bhartiya Kala ka Itihaas Bhag 2', c: 'lhfa1=0-8' }] },
        ],
      },
      { subject: 'New Age Graphics Design', langs: [{ lang: 'English', books: [{ t: 'New Age Graphics Design', c: 'legd1=0-12' }] }] },
      {
        subject: 'Creative Writing & Translation',
        langs: [
          { lang: 'Hindi', books: [{ t: 'Srijan-II', c: 'khsr2=0-4' }] },
          { lang: 'Urdu', books: [{ t: 'Takhleequi Jauhar', c: 'lucw1=0-11' }] },
        ],
      },
      {
        subject: 'Sangeet',
        langs: [
          {
            lang: 'Sanskrit',
            books: [
              { t: 'Tabla evam Pakhawaj', c: 'lstp1=0-7' },
              { t: 'Hindustani Sangeet Gayan Evam Vaadan', c: 'lsgv1=0-9' },
            ],
          },
        ],
      },
    ],
  },
]

export const totalSchoolBooks = SCHOOL.reduce((n, c) => n + c.subjects.reduce((m, s) => m + s.langs.reduce((k, l) => k + l.books.length, 0), 0), 0)
