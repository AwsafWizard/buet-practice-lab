// CE 104 (Practical Surveying) content types. No past papers here: the course is graded on the
// instruments quiz (25 Nov), the field works + drawings, and the final quiz + viva + practical (3 Dec).
// So the content is a question bank (MCQ / fill-in-the-blank / true-false), viva cards, and per-topic notes.

import type { FC } from 'react'
import type { SvTopicId } from '../store'
import type { FigId } from './figs/instFigs'

export type { SvTopicId }

/**
 * One quiz question.
 *  - kind 'mcq': `opts` (3–5 options, plain markdown) and `a` = index of the correct one
 *  - kind 'tf' : a statement; `a` = true / false
 *  - kind 'blank': `q` holds one or more `___`; `a` = accepted answers for the (single) blank,
 *    the first one is shown as the answer. Matching ignores case, spaces, dots and hyphens.
 */
export type SvQuestion = {
  /** unique across the course, starts with 'q-<topic short>-', e.g. 'q-inst-12' */
  id: string
  topic: SvTopicId
  /** markdown; may use $TeX$ */
  q: string
  /** one or two sentences: why the answer is right (shown after answering) */
  why: string
  /** where it comes from: 'lecture sheet p7', 'class notes (Quiz p4)', '18-batch report', 'textbook' */
  src: string
  /** also belongs to the instruments quiz (25 Nov) pool even though its topic is a field work */
  inst?: boolean
  /** 1 = basic recall, 2 = needs understanding, 3 = tricky / numerical */
  lvl?: 1 | 2 | 3
  /** a labelled instrument drawing shown with the question; `hi` is the part pointed at, shown as "?" when `ask` */
  fig?: { id: FigId; hi: number; ask?: boolean }
} & ({ kind: 'mcq'; opts: string[]; a: number } | { kind: 'tf'; a: boolean } | { kind: 'blank'; a: string[] })

/** a viva / oral card: what an examiner might ask at the instrument or the sheet, with a short spoken answer */
export interface SvCard {
  /** unique, starts with 'v-<topic short>-' */
  id: string
  topic: SvTopicId
  /** the question as asked, markdown */
  front: string
  /** the answer you'd say, markdown, ≤ 60 words */
  back: string
  src?: string
}

/** everything one topic's content file exports */
export interface SvTopicContent {
  questions: SvQuestion[]
  cards: SvCard[]
}

/** a topic's Learn tab: notes, field procedure and submission checklist */
export interface SvLearn {
  /** markdown sections, in order; headings `###` */
  notes: { title: string; md: string; Fig?: FC }[]
  /** field procedure, one step per line (markdown) */
  steps?: string[]
  /** what to hand in and how the sheet must look */
  submit?: string[]
  /** mistakes that cost marks */
  traps?: string[]
  /** what to carry to the field */
  carry?: string[]
}
