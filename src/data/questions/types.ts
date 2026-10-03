/** One multiple-choice practice question. `answer` is the index of the correct option. */
export type Q = { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; why: string; level: 1 | 2 | 3 }
