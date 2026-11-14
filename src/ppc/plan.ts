// CE 301 study plan: 13–16 Nov at 8 h a day, one teacher's block per day, 16 Nov kept for a mock. Exam Tue 17 Nov.
import { isoDate, type PlanBlock, type PlannerState } from '../store'

export const PC_EXAM_DATE = '2026-11-17'
export const PC_DEFAULT_START = '2026-11-13'

const HOW = {
  learn: 'Lab: flashcards until the deck is empty → keyword recall on every list → order drills → blurt the two most-asked answers. Then skim the Answers tab.',
  practice: 'Past questions: blurt each one against the timer (≈ 0.85 min per mark), check which keywords you hit, then read the model answer.',
  revise: 'Memory gym: everything due, then the lists you missed. Say each list out loud before flipping.',
  mock: 'Full paper, 3 hours, 3 + 3 questions, written on paper. Then self-mark with the keyword check and redo what you missed.',
}

let n = 0
const b = (day: string, topic: PlanBlock['topic'], title: string, hours: number, kind: PlanBlock['kind'] = 'learn'): PlanBlock => ({ id: `p${++n}`, topic, title, hours, kind, how: HOW[kind], day })

export function pcBlocks(): PlanBlock[] {
  n = 0
  const d1 = '2026-11-13'
  const d2 = '2026-11-14'
  const d3 = '2026-11-15'
  const d4 = '2026-11-16'
  return [
    // 13 Nov — IA sir (procurement)
    b(d1, 'setup', 'Tour: Lab drills, Memory gym, keyword sheets', 0.25),
    b(d1, 'pc-process', 'Tender process flow chart + evaluation steps + forfeiture', 1.5),
    b(d1, 'pc-law', 'Act vs Regulation, PPA / PPR scope, procurement plan', 0.75),
    b(d1, 'pc-methods', 'Tendering methods (PPA s.31–32) and why OTM is preferred', 1),
    b(d1, 'pc-docs', 'Tender document sections, contract documents in order, TDS', 1.5),
    b(d1, 'pc-gcc', 'GCC ↔ PCC clause pairs, FIDIC selection', 1),
    b(d1, 'pc-spec', 'Specification writing + standard BoQ', 0.75),
    b(d1, 'pc-services', 'Intellectual services methods + QCBS score sheet', 1.25),
    // 14 Nov — OIA Ma'am (project & legal)
    b(d2, 'mixed', 'Memory gym: yesterday’s procurement cards and missed lists', 1, 'revise'),
    b(d2, 'pc-ce', 'ASCE definition word for word + attributes of the profession', 1),
    b(d2, 'pc-project', 'Project, characteristics, triangle, flow of work, brief, client concerns', 2),
    b(d2, 'pc-contract', 'Six elements, contract formats, delivery systems, think-twice clauses', 2),
    b(d2, 'pc-risk', 'Contract risk, PLI concerns, bonds and surety, fiduciary risk', 2),
    // 15 Nov — AAN sir (communication & ethics)
    b(d3, 'mixed', 'Memory gym: procurement + project cards due today', 1, 'revise'),
    b(d3, 'pc-comm', 'Communication process, non-verbal, barriers, abstracting & inferring', 1.5),
    b(d3, 'pc-7cs', 'The seven C’s and each one’s guidelines', 1.5),
    b(d3, 'pc-writing', 'Reports, short-report formats, slanted abstract, proposals', 1.25),
    b(d3, 'pc-msg', 'Business messages: planning steps, audience, direct vs indirect, composing', 0.5),
    b(d3, 'pc-oral', 'Oral presentation steps, meetings and leadership styles', 0.75),
    b(d3, 'pc-ethics', 'Code of ethics sections, conflict of interest, duties to peers', 1.5),
    // 16 Nov — protected: mock + sweep
    b(d4, 'mock', 'Mock: 2023-24 paper (3 h) + keyword self-marking', 3.5, 'mock'),
    b(d4, 'mixed', 'Memory gym: every card due + every missed list', 2.5, 'revise'),
    b(d4, 'mixed', 'Blurt the 15 most-asked answers (Answers tab, most-asked first)', 2, 'practice'),
  ]
}

export function pcDefaultPlanner(): PlannerState {
  const now = isoDate(new Date())
  const start = now > PC_DEFAULT_START && now < PC_EXAM_DATE ? now : PC_DEFAULT_START
  return { startDate: start, examDate: PC_EXAM_DATE, defaultHours: 8, hoursByDay: {}, blocks: pcBlocks(), revisionDays: 1 }
}
