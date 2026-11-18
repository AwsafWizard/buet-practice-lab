// The CE 331 term finals in "CE-331 All Question Papers.pdf" (48 pages), newest first.
// Page map and dates from the transcription in `CE 331 (Envo-1)/Claude digests/papers.md`.
import type { EvPaper } from '../types'

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const ANY3 = '4 questions, answer any 3'

export const EV_PAPERS: EvPaper[] = [
  { id: '2023-24', label: '2023-24', held: '14 Sep 2025', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(43, 48), note: 'Latest paper (Batch 21). Section A: Tanvir sir (water chemistry, settling, filtration, softening, coagulation, adsorption, ion exchange) with Rowshan ma’am’s ecosystem, Bangladesh water supply, RWH and WSP. Section B: Snigdha ma’am (aquifers, DTW design, fire demand, distribution, population, wells) with Rowshan ma’am’s intake, pump and water hammer.' },
  { id: '2022-23', label: '2022-23', held: '26 May 2024', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(37, 42) },
  { id: '2021-22', label: '2021-22', held: '13 Apr 2023', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(34, 36) },
  { id: '2020-21', label: '2020-21', held: '19 Oct 2022', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(30, 33) },
  { id: 'jan-2021', label: 'Jan 2021', held: 'January 2021 session', marks: 210, time: '2 hours 30 minutes', format: { A: ANY3, B: ANY3 }, pages: range(27, 29), note: 'Held for the January 2021 session: 2 hours 30 minutes, set out as a table.' },
  { id: '2017-18', label: '2017-18', held: '17 Sep 2018', marks: 140, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(24, 26), note: 'The sheet prints Full Marks 140, but every question carries 35 marks (3 + 3 answered = 210).' },
  { id: '2016-17', label: '2016-17', held: '8 Aug 2017', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [22, 23] },
  { id: '2015-16', label: '2015-16', held: '24 Jan 2017', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: [20, 21] },
  { id: '2012-13', label: '2012-13', held: '17 May 2014', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(16, 19) },
  { id: '2011-12', label: '2011-12', held: '23 Sep 2013', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(13, 15) },
  { id: '2010-11', label: '2010-11', held: '22 Feb 2012', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(11, 12) },
  { id: '2009-10', label: '2009-10', held: '2010', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(7, 10), note: 'Header partly lost in the scan; parts of Q1 and Q2 are missing. Page 10 is the Hazen–Williams nomograph for Q2(b).' },
  { id: '2008-09', label: '2008-09', held: '30 Mar 2010', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(4, 6) },
  { id: '2007-08', label: '2007-08', held: '3 Feb 2009', marks: 210, time: '3 hours', format: { A: ANY3, B: ANY3 }, pages: range(1, 3) },
]

export const evPaperById = (id: string) => EV_PAPERS.find((p) => p.id === id)
export const evPaperLabel = (id: string) => evPaperById(id)?.label ?? id
