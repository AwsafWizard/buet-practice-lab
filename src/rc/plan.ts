// CE 315 study plan: 1–4 Nov at 8 h a day, exam on the morning of 5 Nov.
import { isoDate, type PlanBlock, type PlannerState } from '../store'

export const RC_EXAM_DATE = '2026-11-05'
export const RC_DEFAULT_START = '2026-11-01'

const HOW = {
  learn: 'Approach (recipe + which-case chart) → Lab until the checkpoints go green → 2–3 past questions, newest first. Keep the code pane open (T).',
  practice: 'Past questions on paper with a timer (~35 min per question). Check the key numbers, then compare your steps with the solution.',
  revise: 'Theory tab: say each answer out loud before you open it, tick what you remembered. Then redo everything marked “review”.',
  mock: 'Full paper, 3 hours, only the attached tables (they open in the code pane). Mark yourself afterwards.',
}

let n = 0
const b = (topic: PlanBlock['topic'], title: string, hours: number, kind: PlanBlock['kind'] = 'learn'): PlanBlock => ({ id: `r${++n}`, topic, title, hours, kind, how: HOW[kind] })

/** heavy, every-paper topics first (Section A flexure, then stirrups and slabs), theory sweeps spread out, one mock day */
export function rcBlocks(): PlanBlock[] {
  n = 0
  return [
    // 1 Nov
    b('setup', 'Tour: course picker, code pane (T), labs', 0.25),
    b('rc-doubly', 'Doubly reinforced: does A′s yield? review + design', 2.5),
    b('rc-singly', 'Singly: ρ limits, φ from εt, review + design', 1.5),
    b('rc-elastic', 'Elastic & WSD: Mcr, cracked section, fc / fs, allowable M', 2.5),
    b('rc-tbeam', 'T- and L-beams: beff, true T, support section', 1.5),
    // 2 Nov
    b('rc-shear', 'Shear: Case A–D stirrup zones + layout sketch', 2.5),
    b('rc-oneway', 'One-way slab: ACI coefficients, cantilever patterns, bar layout', 2.5),
    b('rc-twoway', 'Two-way slab: Tables 12.3–12.6, corner steel, beam loads', 3),
    // 3 Nov
    b('rc-bond', 'Bond: ld factors, hooks, splices, cut-off sketch', 2.5),
    b('rc-torsion', 'Torsion: theory + threshold check', 0.75),
    b('rc-basics', 'Basics & safety theory (USD vs WSD, load factors, cover)', 0.75, 'revise'),
    b('mixed', 'Theory sweep: every topic’s Theory tab, most-asked first', 1.5, 'revise'),
    b('mixed', 'Mixed past questions: 2021-22 + 2020-21 numericals', 2.5, 'practice'),
    // 4 Nov (protected revision day)
    { ...b('mock', 'Mock: 2023-24 paper (3 h) + marking', 4, 'mock'), day: '2026-11-04' },
    { ...b('mixed', 'Revision: “review” questions + theory misses + code pane once through', 4, 'revise'), day: '2026-11-04' },
  ]
}

export function rcDefaultPlanner(): PlannerState {
  const now = isoDate(new Date())
  const start = now > RC_DEFAULT_START && now < RC_EXAM_DATE ? now : RC_DEFAULT_START
  return { startDate: start, examDate: RC_EXAM_DATE, defaultHours: 8, hoursByDay: {}, blocks: rcBlocks(), revisionDays: 1 }
}
