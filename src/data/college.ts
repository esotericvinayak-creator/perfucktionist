// College & beyond: openly licensed textbooks and free university courses.
// Every link was checked (HTTP 200) on 2026-10-03. OpenStax books are peer-reviewed and
// Creative Commons licensed; NPTEL and SWAYAM are run by the Government of India; MIT
// OpenCourseWare publishes real MIT course material for free.

export type Link = { title: string; by: string; url: string }

export type Stream = { id: string; label: string; emoji: string; accent: string; books: Link[]; courses: Link[] }

const NPTEL: Link = { title: 'NPTEL — thousands of courses by IIT & IISc faculty', by: 'Govt. of India', url: 'https://nptel.ac.in/courses' }
const SWAYAM: Link = { title: 'SWAYAM — free courses, with optional certification', by: 'Ministry of Education', url: 'https://swayam.gov.in/explorer' }

export const STREAMS: Stream[] = [
  {
    id: 'science',
    label: 'Science & maths',
    emoji: '🔬',
    accent: 'cyan',
    books: [
      { title: 'University Physics (Vol. 1)', by: 'OpenStax', url: 'https://openstax.org/details/books/university-physics-volume-1' },
      { title: 'Chemistry 2e', by: 'OpenStax', url: 'https://openstax.org/details/books/chemistry-2e' },
      { title: 'Organic Chemistry', by: 'OpenStax', url: 'https://openstax.org/details/books/organic-chemistry' },
      { title: 'Biology 2e', by: 'OpenStax', url: 'https://openstax.org/details/books/biology-2e' },
      { title: 'Calculus (Vol. 1)', by: 'OpenStax', url: 'https://openstax.org/details/books/calculus-volume-1' },
      { title: 'Statistics', by: 'OpenStax', url: 'https://openstax.org/details/books/statistics' },
    ],
    courses: [
      { title: 'Classical Mechanics (8.01)', by: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/' },
      { title: 'Single Variable Calculus (18.01)', by: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
      NPTEL,
      SWAYAM,
    ],
  },
  {
    id: 'cs',
    label: 'Computer science & IT',
    emoji: '💻',
    accent: 'violet',
    books: [
      { title: 'Introduction to Computer Science', by: 'OpenStax', url: 'https://openstax.org/details/books/introduction-computer-science' },
      { title: 'Precalculus 2e (for DSA maths)', by: 'OpenStax', url: 'https://openstax.org/details/books/precalculus-2e' },
      { title: 'LibreTexts Computer Science library', by: 'LibreTexts', url: 'https://libretexts.org' },
    ],
    courses: [
      { title: 'Introduction to CS & Programming in Python (6.0001)', by: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/' },
      NPTEL,
      SWAYAM,
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    emoji: '⚙️',
    accent: 'lime',
    books: [
      { title: 'University Physics (Vol. 1)', by: 'OpenStax', url: 'https://openstax.org/details/books/university-physics-volume-1' },
      { title: 'Calculus (Vol. 1)', by: 'OpenStax', url: 'https://openstax.org/details/books/calculus-volume-1' },
      { title: 'Open Textbook Library — engineering shelf', by: 'University of Minnesota', url: 'https://open.umn.edu/opentextbooks' },
    ],
    courses: [
      NPTEL,
      { title: 'NPTEL GATE prep — lectures & mock tests', by: 'NPTEL', url: 'https://gate.nptel.ac.in/' },
      { title: 'MIT OpenCourseWare — browse every course', by: 'MIT', url: 'https://ocw.mit.edu/search/' },
    ],
  },
  {
    id: 'medical',
    label: 'Medicine & health',
    emoji: '🩺',
    accent: 'pink',
    books: [
      { title: 'Anatomy and Physiology 2e', by: 'OpenStax', url: 'https://openstax.org/details/books/anatomy-and-physiology-2e' },
      { title: 'Microbiology', by: 'OpenStax', url: 'https://openstax.org/details/books/microbiology' },
      { title: 'Biology 2e', by: 'OpenStax', url: 'https://openstax.org/details/books/biology-2e' },
    ],
    courses: [NPTEL, SWAYAM],
  },
  {
    id: 'commerce',
    label: 'Commerce & business',
    emoji: '💼',
    accent: 'sun',
    books: [
      { title: 'Principles of Financial Accounting', by: 'OpenStax', url: 'https://openstax.org/details/books/principles-financial-accounting' },
      { title: 'Principles of Economics 3e', by: 'OpenStax', url: 'https://openstax.org/details/books/principles-economics-3e' },
      { title: 'Principles of Management', by: 'OpenStax', url: 'https://openstax.org/details/books/principles-management' },
      { title: 'Business Law I Essentials', by: 'OpenStax', url: 'https://openstax.org/details/books/business-law-i-essentials' },
    ],
    courses: [NPTEL, SWAYAM],
  },
  {
    id: 'arts',
    label: 'Arts & humanities',
    emoji: '🏛️',
    accent: 'orange',
    books: [
      { title: 'Psychology 2e', by: 'OpenStax', url: 'https://openstax.org/details/books/psychology-2e' },
      { title: 'Introduction to Sociology 3e', by: 'OpenStax', url: 'https://openstax.org/details/books/introduction-sociology-3e' },
      { title: 'Introduction to Political Science', by: 'OpenStax', url: 'https://openstax.org/details/books/introduction-political-science' },
      { title: 'Introduction to Philosophy', by: 'OpenStax', url: 'https://openstax.org/details/books/introduction-philosophy' },
      { title: 'World History (Vol. 1)', by: 'OpenStax', url: 'https://openstax.org/details/books/world-history-volume-1' },
    ],
    courses: [NPTEL, SWAYAM],
  },
  {
    id: 'law',
    label: 'Law',
    emoji: '⚖️',
    accent: 'violet',
    books: [
      { title: 'Business Law I Essentials', by: 'OpenStax', url: 'https://openstax.org/details/books/business-law-i-essentials' },
      { title: 'Introduction to Intellectual Property', by: 'OpenStax', url: 'https://openstax.org/details/books/introduction-intellectual-property' },
      { title: 'National Digital Library of India — law collection', by: 'IIT Kharagpur', url: 'https://ndl.iitkgp.ac.in' },
    ],
    courses: [NPTEL, SWAYAM],
  },
  {
    id: 'skills',
    label: 'Writing & study skills',
    emoji: '✍️',
    accent: 'lime',
    books: [
      { title: 'Writing Guide with Handbook', by: 'OpenStax', url: 'https://openstax.org/details/books/writing-guide' },
      { title: 'College Success', by: 'OpenStax', url: 'https://openstax.org/details/books/college-success' },
    ],
    courses: [
      { title: 'Khan Academy — maths, from counting to calculus', by: 'Khan Academy', url: 'https://www.khanacademy.org/math' },
      { title: 'Khan Academy — science', by: 'Khan Academy', url: 'https://www.khanacademy.org/science' },
      SWAYAM,
    ],
  },
]

/** Big free libraries, for anything the shelves above don't cover. */
export const OPEN_LIBRARIES: Link[] = [
  { title: 'National Digital Library of India — crores of items, free for students', by: 'IIT Kharagpur', url: 'https://ndl.iitkgp.ac.in' },
  { title: 'Open Textbook Library — peer-reviewed, openly licensed textbooks', by: 'University of Minnesota', url: 'https://open.umn.edu/opentextbooks' },
  { title: 'LibreTexts — free textbooks across every subject', by: 'LibreTexts', url: 'https://libretexts.org' },
  { title: 'OpenStax — free, peer-reviewed college textbooks', by: 'Rice University', url: 'https://openstax.org/subjects' },
  { title: 'MIT OpenCourseWare — real MIT course material', by: 'MIT', url: 'https://ocw.mit.edu/search/' },
  { title: 'Project Gutenberg — 75,000+ free ebooks', by: 'Project Gutenberg', url: 'https://www.gutenberg.org' },
]

/** Free beyond-NCERT material for school students. */
export const SCHOOL_EXTRAS: Link[] = [
  { title: 'DIKSHA — the government’s school learning platform', by: 'Ministry of Education', url: 'https://diksha.gov.in/explore' },
  { title: 'NIOS — free open-schooling course material', by: 'NIOS', url: 'https://www.nios.ac.in/online-course-material.aspx' },
  { title: 'Khan Academy — maths, explained step by step', by: 'Khan Academy', url: 'https://www.khanacademy.org/math' },
  { title: 'StoryWeaver — thousands of free children’s books, many Indian languages', by: 'Pratham Books', url: 'https://storyweaver.org.in/en/stories' },
]
