// CE 331 (Environmental Engineering I) — content, paper and question types.
// Half recall, half numbers: lists, flashcards and model answers drive the Memory Well drills;
// number-type past-paper parts carry a worked solution computed by the engines in ../engine.

import type { FC } from 'react'
import type { EvTopicId } from '../store'

export type { EvTopicId }

export type EvPaperId =
  | '2023-24'
  | '2022-23'
  | '2021-22'
  | '2020-21'
  | 'jan-2021'
  | '2017-18'
  | '2016-17'
  | '2015-16'
  | '2012-13'
  | '2011-12'
  | '2010-11'
  | '2009-10'
  | '2008-09'
  | '2007-08'

export interface EvPaper {
  id: EvPaperId
  label: string
  held: string
  marks: number
  time: string
  format: { A: string; B: string }
  /** pages of "CE-331 All Question Papers.pdf" (scans331/p-NNN.jpg) */
  pages: number[]
  note?: string
}

/** filled in from the transcription (`CE 331 (Envo-1)/Claude digests/papers.md`); see pyq/papers.ts */
export { EV_PAPERS, evPaperById, evPaperLabel } from './pyq/papers'

/** one point of a list, written the way you'd write it in the script */
export interface EvPoint {
  /** the keyword / short phrase (1–7 words), e.g. 'Indemnification' or 'Execute the contract professionally' */
  k: string
  /** other words that count when typed in a drill: synonyms, abbreviations, the teacher's alternative wording */
  alt?: string[]
  /** one line of explanation (shown after a drill, in the keyword sheet and the flashcard back) */
  d?: string
}

/**
 * A list the examiner asks you to name / list / describe.
 * Every list becomes a flashcard, a keyword-recall drill, and (when `ordered`) a put-in-order drill.
 */
export interface EvList {
  /** unique across the course, starts with 'l-', e.g. 'l-contract-risk' */
  id: string
  topic: EvTopicId
  /** what the list is, e.g. 'Ways of dealing with contract risk' */
  title: string
  /** the question as an examiner words it (optional) */
  ask?: string
  points: EvPoint[]
  /** the order is examined (flow chart, priority of documents, steps, life-cycle phases) */
  ordered?: boolean
  /** memory hook: first-letter mnemonic or a short picture story; hidden until asked for */
  hook?: string
  /** paper labels it was asked in, e.g. ['2023-24', '2022-23'] (see EV_PAPERS labels) */
  seen: string[]
  /** where it comes from: 'Tanvir sir L5 p3', 'PPR 2008 r.98', 'Kabirul sir note', 'question bank only' */
  src: string
  /** disagreements between sources, or anything to know */
  note?: string
}

/** a flashcard that is not a list: a definition, a distinction, a number, who does what */
export interface EvCard {
  /** unique across the course, starts with 'c-' */
  id: string
  topic: EvTopicId
  /** markdown */
  front: string
  /** markdown, short (≤ 60 words) */
  back: string
  seen?: string[]
  src?: string
}

/** model answer for a theory question; past-paper parts point at these, so a repeated question shares one answer */
export interface EvAnswer {
  /** unique across the course, starts with 'a-' */
  id: string
  topic: EvTopicId
  /** the canonical wording */
  q: string
  seen: string[]
  /** markdown answer that would score full marks (headings ###, lists, **bold**, tables with | pipes |) */
  a: string
  /** the keywords an examiner looks for; each must appear (case-insensitive) in `a` — used by cloze and blurt */
  keys: string[]
  /** list ids this answer is built on */
  lists?: string[]
  src: string
  /** optional sketch (flow chart, triangle, diagram) drawn with theme tokens */
  Fig?: FC
}

/** everything one topic file exports */
export interface EvTopicContent {
  lists: EvList[]
  cards: EvCard[]
  answers: EvAnswer[]
}

/** a past-paper part as printed (generated skeleton) */
export interface EvPart {
  /** 'ev-<paper>-<no>' e.g. 'ev-2023-24-5c', 'ev-2011-12-7' */
  id: string
  paper: EvPaperId
  sec: 'A' | 'B'
  /** '5(c)' or '7' for an undivided question */
  no: string
  marks: number
  /** the printed split, e.g. '4+6=10' */
  split?: string
  /** markdown, as printed */
  text: string
  /** the transcriber's topic guess (used until a teacher map gives `topics`) */
  tags?: EvTopicId[]
  /** 'theory', 'math', 'design', 'sketch', 'derivation', 'list' (may be combined with +) */
  kind?: string
}

/**
 * Where a part's answer comes from. The user asked for every past question whose solution is not in the
 * sources to be marked, so each part says this and the Papers page can filter by it.
 */
export type EvSource =
  | 'ce22' // this term's (CE22) slides
  | 'notes' // this batch's class notes (Simanto / Imtiaz) or the teacher's own worked maths
  | 'old-slides' // CE21 / CE19 slides
  | 'seniors' // Nafee vai's notes
  | 'textbook' // standard textbook answer, not in this term's material
  | 'none' // no solution can be built from the sources (missing figure, unreadable scan…)

export const EV_SOURCE_LABEL: Record<EvSource, string> = {
  ce22: 'CE22 slides',
  notes: 'class notes',
  'old-slides': 'older slides',
  seniors: 'seniors’ notes',
  textbook: 'textbook — not in this term’s slides',
  none: '⚠ no source solution',
}

/** how a past-paper part is answered (keyed by EvPart id in the block maps) */
export interface EvPartMap {
  topics: EvTopicId[]
  /** answer ids, in the order you'd write them */
  ans: string[]
  /** markdown specific to this paper (its numbers, its wording, the extra sub-part) */
  extra?: string
  /** worked solution for a number-type part: a component that computes every value with the engines */
  Sol?: FC
  /** one-line final answer(s), shown under the question for self-checking, e.g. 'Q = 1.23 cusec, 45 hp' */
  final?: string
  /** the key numbers to try before opening the worked solution, computed by the same engine calls as `Sol` */
  checks?: () => EvCheck[]
  /** where the answer comes from (first = main source); missing → 'ce22' when it has answers */
  from?: EvSource[]
  /** outside this term's material, or a print problem */
  flag?: string
  notes?: string[]
}

/** one number the student enters before opening the worked solution (same shape as CE 311's `Check`) */
export interface EvCheck {
  /** unique within the part */
  key: string
  /** markdown, may use $TeX$ */
  label: string
  value: number
  unit?: string
  /** relative tolerance (default 0.02); widen it for values read off a chart */
  tol?: number
  /** absolute tolerance floor, for values that can be near zero */
  abs?: number
  magnitude?: boolean
  hint?: string
}

/** a past-paper part with its answer map, as the pages use it */
export interface EvQ extends EvPart, EvPartMap {}
