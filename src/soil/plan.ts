// CE 341 study plan: 6–11 Nov at 8 h a day (Section A first), exam on 12 Nov.
import { isoDate, type PlanBlock, type PlannerState } from '../store'

export const SM_EXAM_DATE = '2026-11-12'
export const SM_DEFAULT_START = '2026-11-06'

const HOW = {
  learn: 'Approach (recipe + which-case chart) → Lab until the checkpoints go green → 2–3 past questions, newest first. Keep the chart pane open (T).',
  practice: 'Past questions on paper with a timer (~25 min per 23⅓ marks, ~45 min per full question). Check the key numbers, then compare your steps.',
  revise: 'Theory tab: say each answer out loud (or sketch it) before you open it, tick what you remembered. Then redo everything marked “review”.',
  mock: 'Full paper, 3 hours, answer 3 + 3, only the attached charts (they open in the chart pane). Mark yourself afterwards.',
}

let n = 0
const b = (topic: PlanBlock['topic'], title: string, hours: number, kind: PlanBlock['kind'] = 'learn'): PlanBlock => ({ id: `s${++n}`, topic, title, hours, kind, how: HOW[kind] })

/** Section A (AJK sir) first — it has no worked handnote apart from earth pressure — then Section B, one mock day */
export function smBlocks(): PlanBlock[] {
  n = 0
  return [
    // 6 Nov
    b('setup', 'Tour: course picker, chart pane (T), labs', 0.25),
    b('sm-wv', 'Weight–volume: phase diagram the AJK way, Se = wGs, Dr', 1.75),
    b('sm-plast', 'Plasticity: flow curve → LL, PL, PI, LI, shrinkage limit', 2),
    b('sm-class', 'Classification: grading curve, USCS name, AASHTO group + GI', 3),
    b('sm-struct', 'Structure, clay minerals, soil deposits (theory)', 1, 'revise'),
    // 7 Nov
    b('sm-shear', 'Shear strength: Mohr + pole, direct shear, CD / CU / UU, unconfined', 5),
    b('sm-lep', 'Earth pressure: at-rest, Rankine, crack, WT + surcharge, passive', 3),
    // 8 Nov
    b('sm-lep', 'Earth pressure: layered walls + the older (Coulomb, sloped) questions', 1, 'practice'),
    b('mixed', 'Section A theory sweep (every A topic’s Theory tab)', 1, 'revise'),
    b('sm-comp', 'Compaction: Proctor + ZAV, spec checks, borrow-pit problems', 2.5),
    b('sm-perm', 'Permeability: constant / falling head, layers, pumping, capillarity', 1.5),
    b('sm-seep', 'Effective stress profiles, quick condition, excavation heave', 2),
    // 9 Nov
    b('sm-seep', 'Flow nets: q, heads, exit gradient, heave and piping FS, uplift', 2.5),
    b('sm-consol', 'Consolidation magnitude: NC / OC, layers, Δp, pc′ and field curves', 3),
    b('sm-consol', 'Consolidation rate: Tv–U, cv fitting, secondary, sand drains', 2.5),
    // 10 Nov
    b('sm-stress', 'Stress distribution: point, strip, embankment, Fadum, Newmark', 3.5),
    b('mixed', 'Section B theory sweep (every B topic’s Theory tab)', 2, 'revise'),
    b('mixed', 'Mixed past questions: 2021-22 + 2020-21 numericals', 2.5, 'practice'),
    // 11 Nov (protected revision day)
    { ...b('mock', 'Mock: 2023-24 paper (3 h) + marking', 4, 'mock'), day: '2026-11-11' },
    { ...b('mixed', 'Revision: “review” questions + theory misses + chart pane once through', 4, 'revise'), day: '2026-11-11' },
  ]
}

export function smDefaultPlanner(): PlannerState {
  const now = isoDate(new Date())
  const start = now > SM_DEFAULT_START && now < SM_EXAM_DATE ? now : SM_DEFAULT_START
  return { startDate: start, examDate: SM_EXAM_DATE, defaultHours: 8, hoursByDay: {}, blocks: smBlocks(), revisionDays: 1 }
}
