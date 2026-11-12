// CE 301 (Professional Practice and Communication) — content, paper and question types.
// The course is recall, so the content is data: lists (the backbone of every drill), flashcards,
// model answers with their examiner keywords, and past-paper parts that point at the answers.

import type { FC } from 'react'
import type { PcTopicId } from '../store'

export type { PcTopicId }

export type PcPaperId =
  | '2023-24'
  | 'may-2024'
  | '2021-22'
  | '2020-21'
  | 'jan-2021'
  | '2017-18'
  | '2016-17'
  | '2015-16'
  | '2014-15'
  | '2013-14'
  | '2012-13'
  | '2011-12'

export interface PcPaper {
  id: PcPaperId
  label: string
  held: string
  marks: number
  time: string
  format: { A: string; B: string }
  /** pages of "CE-301 All Question Papers.pdf" (scans301/p-NNN.jpg) */
  pages: number[]
  note?: string
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const ANY3 = '4 questions, answer any 3'
const ANY5 = '7 questions, answer any 5'

export const PC_PAPERS: PcPaper[] = [
  { id: '2023-24', label: '2023-24', held: '4 Sep 2025', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [133, 134], note: 'Latest paper, set by this term’s teachers’ group: Section A = communication, ethics, contracts and risk; Section B = procurement, ASCE definition and pre-design.' },
  { id: 'may-2024', label: 'May 2024', held: 'May 2024', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [131, 132], note: 'Printed “2021-2022” but held in May 2024 with the other 2022-23 L-3/T-1 finals (a second 2021-22 sitting or the 2022-23 paper).' },
  { id: '2021-22', label: '2021-22', held: '30 Mar 2023', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [129, 130] },
  { id: '2020-21', label: '2020-21', held: '29 Sep 2022', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [127, 128] },
  { id: 'jan-2021', label: 'Jan 2021', held: '2021', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [125, 126] },
  { id: '2017-18', label: '2017-18', held: '29 Sep 2018', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [123, 124] },
  { id: '2016-17', label: '2016-17', held: '2 Aug 2017', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [121, 122] },
  { id: '2015-16', label: '2015-16', held: '18 Jan 2017', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(116, 120) },
  { id: '2014-15', label: '2014-15', held: '30 Jan 2016', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [109, 110] },
  { id: '2013-14', label: '2013-14', held: '4 Aug 2015', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [81, 82] },
  { id: '2012-13', label: '2012-13', held: '24 May 2014', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [64, 65] },
  { id: '2011-12', label: '2011-12', held: '29 Sep 2013', marks: 210, time: '3 hours', format: { A: ANY5, B: ANY5 }, pages: [36, 37] },
]

export const pcPaperById = (id: string) => PC_PAPERS.find((p) => p.id === id)
export const pcPaperLabel = (id: string) => pcPaperById(id)?.label ?? id

/** one point of a list, written the way you'd write it in the script */
export interface PcPoint {
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
export interface PcList {
  /** unique across the course, starts with 'l-', e.g. 'l-contract-risk' */
  id: string
  topic: PcTopicId
  /** what the list is, e.g. 'Ways of dealing with contract risk' */
  title: string
  /** the question as an examiner words it (optional) */
  ask?: string
  points: PcPoint[]
  /** the order is examined (flow chart, priority of documents, steps, life-cycle phases) */
  ordered?: boolean
  /** memory hook: first-letter mnemonic or a short picture story; hidden until asked for */
  hook?: string
  /** paper labels it was asked in, e.g. ['2023-24', 'May 2024'] (see PC_PAPERS labels) */
  seen: string[]
  /** where it comes from: 'Tanvir sir L5 p3', 'PPR 2008 r.98', 'Kabirul sir note', 'question bank only' */
  src: string
  /** disagreements between sources, or anything to know */
  note?: string
}

/** a flashcard that is not a list: a definition, a distinction, a number, who does what */
export interface PcCard {
  /** unique across the course, starts with 'c-' */
  id: string
  topic: PcTopicId
  /** markdown */
  front: string
  /** markdown, short (≤ 60 words) */
  back: string
  seen?: string[]
  src?: string
}

/** model answer for a theory question; past-paper parts point at these, so a repeated question shares one answer */
export interface PcAnswer {
  /** unique across the course, starts with 'a-' */
  id: string
  topic: PcTopicId
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
export interface PcTopicContent {
  lists: PcList[]
  cards: PcCard[]
  answers: PcAnswer[]
}

/** a past-paper part as printed (generated skeleton) */
export interface PcPart {
  /** 'pc-<paper>-<no>' e.g. 'pc-2023-24-5c', 'pc-2011-12-7' */
  id: string
  paper: PcPaperId
  sec: 'A' | 'B'
  /** '5(c)' or '7' for an undivided question */
  no: string
  marks: number
  /** markdown, as printed */
  text: string
}

/** numbers-type parts get a calculator-backed solution */
export type PcCalc =
  | { kind: 'qcbs'; techWeight: number; qualify: number; firms: { name: string; tech: number; price?: number }[]; unit?: string }
  | { kind: 'tds'; storeys?: number; costCrore: number; months: number; items: string[] }

/** how a past-paper part is answered (keyed by PcPart id in the block maps) */
export interface PcPartMap {
  topics: PcTopicId[]
  /** answer ids, in the order you'd write them */
  ans: string[]
  /** markdown specific to this paper (its numbers, its wording, the extra sub-part) */
  extra?: string
  calc?: PcCalc
  /** outside this term's material, or a print problem */
  flag?: string
  notes?: string[]
}

/** a past-paper part with its answer map, as the pages use it */
export interface PcQ extends PcPart, PcPartMap {}
