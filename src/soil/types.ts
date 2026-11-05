// CE 341 (Principles of Soil Mechanics) — papers, question and topic types.

import type { FC, ReactNode } from 'react'
import type { Check } from '../pyq/types'
import type { SmTopicId } from '../store'

export type { Check, SmTopicId }

export type SmPaperId =
  | '2023-24'
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

export interface SmPaper {
  id: SmPaperId
  /** short label shown on chips */
  label: string
  held: string
  marks: number
  time: string
  format: { A: string; B: string }
  /** pages of "CE-341 All Question Papers.pdf" (scans341/p-NNN.jpg) */
  pages: number[]
  /** which printed section holds AJK sir's half (W–V, plasticity, classification, structure, shear, earth pressure) */
  ajk: 'A' | 'B'
  /** set by this term's teachers' predecessors with the current topic split (2020-21 on) */
  modern: boolean
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const ANY3 = '4 questions, answer any 3 (46⅔ marks each)'
const ANY6 = '8 questions, answer any 6 (23⅓ marks each)'
const Q1PLUS2 = 'Q1 compulsory + any 2 of Q2–Q4'

export const SM_PAPERS: SmPaper[] = [
  { id: '2023-24', label: '2023-24', held: '24 Aug 2025', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(70, 76), ajk: 'A', modern: true },
  { id: '2021-22', label: '2021-22', held: '2 May 2023', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(61, 69), ajk: 'B', modern: true },
  { id: '2020-21', label: '2020-21', held: '15 Oct 2022', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(53, 60), ajk: 'B', modern: true },
  { id: 'jan-2021', label: 'Jan 2021', held: '2021', marks: 280, time: '2.5 hours', format: { A: ANY3, B: ANY3 }, pages: range(47, 52), ajk: 'B', modern: true },
  { id: '2017-18', label: '2017-18', held: '1 Sep 2018', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(39, 46), ajk: 'A', modern: false },
  { id: '2016-17', label: '2016-17', held: '15 Jul 2017', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY6 }, pages: range(34, 38), ajk: 'B', modern: false },
  { id: '2015-16', label: '2015-16', held: '14 Jan 2017', marks: 280, time: '3 hours', format: { A: ANY6, B: ANY3 }, pages: range(30, 33), ajk: 'A', modern: false },
  { id: '2012-13', label: '2012-13', held: '7 Jun 2014', marks: 280, time: '3 hours', format: { A: ANY6, B: ANY3 }, pages: range(25, 29), ajk: 'A', modern: false },
  { id: '2011-12', label: '2011-12', held: '8 Jul 2013', marks: 280, time: '3 hours', format: { A: Q1PLUS2, B: ANY3 }, pages: range(20, 24), ajk: 'A', modern: false },
  { id: '2010-11', label: '2010-11', held: '1 Feb 2012', marks: 280, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(15, 19), ajk: 'A', modern: false },
  { id: '2009-10', label: '2009-10', held: '6 Dec 2010', marks: 280, time: '3 hours', format: { A: Q1PLUS2, B: ANY3 }, pages: range(10, 14), ajk: 'A', modern: false },
  { id: '2008-09', label: '2008-09', held: '1 Mar 2010', marks: 280, time: '3 hours', format: { A: Q1PLUS2, B: ANY3 }, pages: range(5, 9), ajk: 'A', modern: false },
  { id: '2007-08', label: '2007-08', held: '19 Jan 2009', marks: 280, time: '3 hours', format: { A: Q1PLUS2, B: ANY3 }, pages: range(1, 4), ajk: 'A', modern: false },
]

export const smPaperById = (id: string) => SM_PAPERS.find((p) => p.id === id)
export const smPaperLabel = (id: string) => smPaperById(id)?.label ?? id

/** something the paper printed with a question; `ref` = code-pane item id */
export interface SmGiven {
  label: string
  what?: string
  ref?: string
  formula?: boolean
}

export interface SmQ {
  /** 'sm-<paper>-<no>' for past questions, 'sm-own-…' for practice problems */
  id: string
  paper: SmPaperId | 'own'
  level?: 'warm-up' | 'exam' | 'challenge'
  sec: 'A' | 'B'
  /** e.g. '2(c)' or '5(b)(ii)' */
  no: string
  marks: number
  topics: SmTopicId[]
  title: string
  /** markdown + $tex$ */
  text: string
  pages: number[]
  /** theory part: model answer goes in `solution`, no checks */
  theory?: boolean
  /** outside this term's slides (Coulomb/Culmann, sloping backfill, wall loads, vane, Skempton A/B …) or a print problem */
  flag?: string
  given?: SmGiven[]
  figure?: () => ReactNode
  checks?: () => Check[]
  solution?: () => ReactNode
  notes?: string[]
}

export interface SmTheoryItem {
  id: string
  topic: SmTopicId
  q: string
  /** papers it appeared in (labels) */
  seen: string[]
  /** markdown model answer */
  a: string
  /** optional sketch */
  Fig?: FC
}

export interface SmTopicModule {
  Overview: FC
  Approach: FC
  Lab: FC
  problems: SmQ[]
  theory: SmTheoryItem[]
}
