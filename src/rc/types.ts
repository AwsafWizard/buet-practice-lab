// CE 315 (Design of Concrete Structures I) — papers, question and topic types.

import type { FC, ReactNode } from 'react'
import type { Check } from '../pyq/types'
import type { RcTopicId } from '../store'

export type { Check, RcTopicId }

export type RcPaperId =
  | '2023-24'
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
  | '2010-11'
  | '2009-10'
  | '2008-09'
  | '2007-08'
  | '2006-07'
  | '2005-06'
  | '2004-05'
  | '2002-03'

export interface RcPaper {
  id: RcPaperId
  /** short label shown on chips */
  label: string
  held: string
  marks: number
  time: string
  format: { A: string; B: string }
  /** pages of CE315_Term_Final_Questions.pdf (scans315/p-NNN.jpg) */
  pages: number[]
  /** current syllabus style (8 × 35, answer 3 + 3) */
  modern: boolean
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const NEW = { A: '4 questions, answer any 3 (35 marks each)', B: '4 questions, answer any 3 (35 marks each)' }

export const RC_PAPERS: RcPaper[] = [
  { id: '2023-24', label: '2023-24', held: '9 Sep 2025', marks: 210, time: '3 hours', format: NEW, pages: range(2, 10), modern: true },
  { id: '2021-22', label: '2021-22', held: '7 May 2023', marks: 210, time: '3 hours', format: NEW, pages: range(11, 18), modern: true },
  { id: '2020-21', label: '2020-21', held: '25 Oct 2022', marks: 210, time: '3 hours', format: NEW, pages: range(19, 24), modern: true },
  { id: 'jan-2021', label: 'Jan 2021', held: '2021', marks: 210, time: '2.5 hours', format: NEW, pages: range(25, 30), modern: true },
  { id: '2017-18', label: '2017-18', held: 'Sep 2018', marks: 210, time: '3 hours', format: NEW, pages: range(31, 35), modern: true },
  { id: '2016-17', label: '2016-17', held: 'Aug 2017', marks: 210, time: '3 hours', format: NEW, pages: range(36, 43), modern: true },
  { id: '2015-16', label: '2015-16', held: 'Feb 2017', marks: 210, time: '3 hours', format: NEW, pages: range(44, 52), modern: true },
  { id: '2014-15', label: '2014-15', held: 'Feb 2016', marks: 210, time: '3 hours', format: NEW, pages: range(53, 57), modern: true },
  { id: '2013-14', label: '2013-14', held: 'Jul 2015', marks: 210, time: '3 hours', format: NEW, pages: range(58, 62), modern: true },
  { id: '2012-13', label: '2012-13', held: '31 May 2014', marks: 210, time: '3 hours', format: NEW, pages: range(63, 69), modern: false },
  { id: '2011-12', label: '2011-12', held: '6 Oct 2013', marks: 210, time: '3 hours', format: NEW, pages: range(70, 73), modern: false },
  { id: '2010-11', label: '2010-11', held: '29 Feb 2012', marks: 210, time: '3 hours', format: NEW, pages: range(74, 79), modern: false },
  { id: '2009-10', label: '2009-10', held: '13 Jan 2011', marks: 210, time: '3 hours', format: NEW, pages: range(80, 83), modern: false },
  { id: '2008-09', label: '2008-09', held: '6 Apr 2010', marks: 210, time: '3 hours', format: NEW, pages: range(84, 87), modern: false },
  { id: '2007-08', label: '2007-08', held: '10 Feb 2009', marks: 210, time: '3 hours', format: NEW, pages: range(88, 92), modern: false },
  { id: '2006-07', label: '2006-07', held: 'Nov 2007', marks: 210, time: '3 hours', format: NEW, pages: range(93, 100), modern: false },
  { id: '2005-06', label: '2005-06', held: 'Apr 2007', marks: 210, time: '3 hours', format: NEW, pages: range(101, 106), modern: false },
  { id: '2004-05', label: '2004-05', held: 'May 2005', marks: 210, time: '3 hours', format: NEW, pages: range(107, 111), modern: false },
  { id: '2002-03', label: '2002-03', held: 'Aug 2004', marks: 210, time: '3 hours', format: NEW, pages: range(112, 116), modern: false },
]

export const rcPaperById = (id: string) => RC_PAPERS.find((p) => p.id === id)
export const rcPaperLabel = (id: string) => rcPaperById(id)?.label ?? id

/** something the paper printed with a question; `ref` = code-pane item id */
export interface RcGiven {
  label: string
  what?: string
  ref?: string
  formula?: boolean
}

export interface RcQ {
  /** 'rc-<paper>-<no>' for past questions, 'rc-own-…' for practice problems */
  id: string
  paper: RcPaperId | 'own'
  level?: 'warm-up' | 'exam' | 'challenge'
  sec: 'A' | 'B'
  /** e.g. '2(c)' or '5(b)(ii)' */
  no: string
  marks: number
  topics: RcTopicId[]
  title: string
  /** markdown + $tex$ */
  text: string
  pages: number[]
  /** theory part: model answer goes in `solution`, no checks */
  theory?: boolean
  /** older method or outside the slides (WSD design, old load factors, DDM …) */
  flag?: string
  given?: RcGiven[]
  figure?: () => ReactNode
  checks?: () => Check[]
  solution?: () => ReactNode
  notes?: string[]
}

export interface RcTheoryItem {
  id: string
  topic: RcTopicId
  q: string
  /** papers it appeared in (labels) */
  seen: string[]
  /** markdown model answer */
  a: string
  /** optional sketch */
  Fig?: FC
}

export interface RcTopicModule {
  Overview: FC
  Approach: FC
  Lab: FC
  problems: RcQ[]
  theory: RcTheoryItem[]
}
