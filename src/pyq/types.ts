import type { ReactNode } from 'react'
import type { TopicId } from '../store'

export type PaperId =
  | '2007-08'
  | '2008-09'
  | '2009-10'
  | '2010-11'
  | '2011-12'
  | '2012-13'
  | '2015-16'
  | '2016-17'
  | '2019-20'
  | '2020-21'
  | '2021-22'
  | '2022-23'
  | '2023-24'

export interface Paper {
  id: PaperId
  title: string
  held: string
  marks: number
  time: string
  /** instructions per section */
  format: { A: string; B: string }
  pages: number[]
}

export interface Check {
  key: string
  label: string
  value: number
  unit?: string
  tol?: number
  magnitude?: boolean
  hint?: string
}

export interface PYQ {
  id: string
  /** 'own' = practice problem written for this dashboard */
  paper: PaperId | 'own'
  level?: 'warm-up' | 'exam' | 'challenge'
  sec: 'A' | 'B'
  no: string
  marks: number
  topics: TopicId[]
  title: string
  text: string
  pages: number[]
  /** old-code (BNBC 1993) question re-cast to BNBC 2020 */
  legacy?: string
  figure?: () => ReactNode
  checks?: () => Check[]
  solution?: () => ReactNode
  notes?: string[]
}

export const PAPERS: Paper[] = [
  { id: '2007-08', title: 'L-3/T-1 B.Sc. Engg. Examinations 2007-2008', held: '26 Jan 2009', marks: 210, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [1, 2, 3, 4] },
  { id: '2008-09', title: 'L-3/T-1 B.Sc. Engg. Examinations 2008-2009', held: '22 Mar 2010', marks: 210, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [5, 6, 7, 8] },
  { id: '2009-10', title: 'L-3/T-1 B.Sc. Engg. Examinations 2009-2010', held: '13 Dec 2010', marks: 210, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [9, 10, 11, 12] },
  { id: '2010-11', title: 'L-3/T-1 B.Sc. Engg. Examinations 2010-2011', held: '15 Feb 2012', marks: 210, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [13, 14, 15, 16] },
  { id: '2011-12', title: 'L-3/T-1 B.Sc. Engg. Examinations 2011-2012', held: '25 Jul 2013', marks: 280, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [17, 18, 19, 20] },
  { id: '2012-13', title: 'L-3/T-1 B.Sc. Engg. Examinations 2012-2013', held: '10 May 2014', marks: 280, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [21, 22, 23, 24, 25] },
  { id: '2015-16', title: 'L-3/T-1 B.Sc. Engg. Examinations 2015-2016', held: '29 Jan 2017', marks: 280, time: '3 hours', format: { A: '7 questions, answer any 5', B: '7 questions, answer any 5' }, pages: [26, 27, 28, 29] },
  { id: '2016-17', title: 'L-3/T-1 B.Sc. Engg. Examinations 2016-2017', held: '13 Aug 2017', marks: 280, time: '3 hours', format: { A: '7 questions, answer any 5', B: '4 questions, answer any 3' }, pages: [30, 31, 32, 33] },
  { id: '2019-20', title: 'L-3/T-1 B.Sc. Engg. Examinations, Session January 2021', held: '2021', marks: 280, time: '2.5 hours', format: { A: '7 questions, answer any 5', B: 'Q11 compulsory + any 2 of Q8–Q10' }, pages: [34, 35, 36, 37, 38, 39, 40, 41] },
  { id: '2020-21', title: 'L-3/T-1 B.Sc. Engg. Examinations 2020-2021', held: '24 Sep 2022', marks: 280, time: '3 hours', format: { A: '4 questions, answer any 3', B: '7 questions, answer any 5' }, pages: [42, 43, 44, 45, 46, 47, 48, 49, 50] },
  { id: '2021-22', title: 'L-3/T-1 B.Sc. Engg. Examinations 2021-2022', held: '6 Apr 2023', marks: 280, time: '3 hours', format: { A: '4 questions, answer any 3', B: '7 questions, answer any 5' }, pages: [51, 52, 53, 54, 55, 56, 57] },
  { id: '2022-23', title: 'L-3/T-1 B.Sc. Engg. Examinations 2022-2023', held: '20 May 2024', marks: 280, time: '3 hours', format: { A: '4 questions, answer any 3', B: '4 questions, answer any 3' }, pages: [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69] },
  { id: '2023-24', title: 'L-3/T-1 B.Sc. Engg. Examinations 2023-2024', held: '30 Aug 2025', marks: 280, time: '3 hours', format: { A: '4 questions, answer any 3', B: '4 questions, answer any 3' }, pages: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
]

export const paperById = (id: string) => PAPERS.find((p) => p.id === id)!
