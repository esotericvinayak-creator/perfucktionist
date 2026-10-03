// The practice bank. Questions are written for this app and each answer is checked twice.
import { computer, english, maths, reasoning } from './part1'
import { biology, chemistry, physics, science } from './part3'
import type { Q } from './types'

export type SubjectId = 'maths' | 'reasoning' | 'english' | 'computer' | 'physics' | 'chemistry' | 'biology' | 'science'

export const SUBJECTS: { id: SubjectId; label: string; emoji: string; accent: string }[] = [
  { id: 'maths', label: 'Quant & maths', emoji: '➗', accent: 'lime' },
  { id: 'reasoning', label: 'Reasoning', emoji: '🧩', accent: 'violet' },
  { id: 'english', label: 'English', emoji: '🔤', accent: 'cyan' },
  { id: 'computer', label: 'Computer', emoji: '💻', accent: 'sun' },
  { id: 'physics', label: 'Physics', emoji: '🧲', accent: 'orange' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🧪', accent: 'pink' },
  { id: 'biology', label: 'Biology', emoji: '🧬', accent: 'lime' },
  { id: 'science', label: 'General science', emoji: '🔬', accent: 'cyan' },
]

export const bank: Record<SubjectId, Q[]> = { maths, reasoning, english, computer, physics, chemistry, biology, science }

export const totalQuestions = Object.values(bank).reduce((n, list) => n + list.length, 0)
