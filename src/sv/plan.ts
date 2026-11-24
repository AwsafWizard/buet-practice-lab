// CE 104 field schedule (Class program, Nov 2026) and the marks. Dates are ISO, local time.
import type { SvTopicId } from '../store'

/** the final quiz, practical and viva */
export const SV_EXAM_DATE = '2026-12-03'
export const SV_INST_QUIZ = '2026-11-25'

export interface SvDay {
  date: string
  time: string
  items: string[]
  place: string
  topics: SvTopicId[]
  /** an assessment happens this day */
  test?: string
}

export const SV_SCHEDULE: SvDay[] = [
  { date: '2026-11-24', time: '7:00 – 13:00', items: ['Registration', 'Issue of instruments', 'Instruction & handling of all instruments'], place: 'Gallery Room CE-306; Building Room 606 & 619 (5th floor CE building)', topics: ['sv-inst'] },
  { date: '2026-11-25', time: '7:00 – 13:00', items: ['Quiz on instruments', 'Chain survey & levelling'], place: 'BUET playground & inside BUET campus', topics: ['sv-inst', 'sv-chain', 'sv-level'], test: 'Quiz on instruments (15 marks)' },
  { date: '2026-11-26', time: '7:00 – 13:00 · 15:00 – 17:00', items: ['Closed traverse & stadia survey', 'Introduction to EDM, total station, drone, TLS & RTK GPS (15:00 – 17:00, Gallery Room 306)'], place: 'BUET playground & inside BUET campus', topics: ['sv-traverse', 'sv-stadia', 'sv-modern'] },
  { date: '2026-11-27', time: '—', items: ['Break'], place: '—', topics: [] },
  { date: '2026-11-28', time: '7:00 – 13:00', items: ['House setting', 'Height & distance problem', 'Operation of the total station simulator'], place: 'BUET playground & inside BUET campus; Gallery Room 306', topics: ['sv-house', 'sv-height', 'sv-modern'] },
  { date: '2026-11-29', time: '7:00 – 11:00 · 11:00 – 13:00', items: ['Curve setting', 'Data collection using total station'], place: 'BUET playground & inside BUET campus', topics: ['sv-curve', 'sv-modern'] },
  { date: '2026-11-30', time: '7:00 – 13:00', items: ['Contouring using level (groups 1 – 10)', 'Project surveying: reconnaissance, traverse, topographical and levelling (groups 11 – 20)'], place: 'BUET playground & inside BUET campus', topics: ['sv-contour', 'sv-route'] },
  { date: '2026-12-01', time: '7:00 – 13:00', items: ['Contouring using level (groups 11 – 20)', 'Project surveying (groups 1 – 10)'], place: 'BUET playground & inside BUET campus', topics: ['sv-contour', 'sv-route'] },
  { date: '2026-12-02', time: '7:00 – 13:00', items: ['Total station data processing & drawing preparation', 'Drone data processing & drawing preparation'], place: 'Gallery Room 306', topics: ['sv-modern'] },
  { date: '2026-12-03', time: '6:30 – 18:00', items: ['Final quiz & instrument collection (6:30 – 8:30)', 'Odd groups practical & oral (8:30 – 10:30)', 'Even groups practical & oral (10:30 – 12:30)', 'Return of instruments (14:00 – 18:00)'], place: 'BUET playground; Building Room 606 & 619', topics: [], test: 'Final quiz, practical & oral (90 marks)' },
]

export const SV_MARKS: { item: string; marks: number }[] = [
  { item: 'Attendance', marks: 15 },
  { item: 'Quiz on instruments', marks: 15 },
  { item: 'Field works', marks: 30 },
  { item: 'Submission of drawings', marks: 30 },
  { item: 'Final quiz & oral examination', marks: 30 },
  { item: 'Practical examination', marks: 30 },
]

/** the next assessment from a given day (for the header countdown) */
export function nextTest(today: string): { date: string; label: string; short: string } {
  if (today <= SV_INST_QUIZ) return { date: SV_INST_QUIZ, label: 'instruments quiz 25 Nov', short: '25 Nov (quiz)' }
  return { date: SV_EXAM_DATE, label: 'final quiz & viva 3 Dec', short: '3 Dec' }
}
