// CE 331 study plan: 18–22 Nov at 8 h a day, Tanvir sir first (most marks, most maths), then Snigdha ma'am,
// then Rowshan ma'am, the 22nd kept for the 2023-24 mock and a Memory Well sweep. Exam Mon 23 Nov.
import { isoDate, type PlanBlock, type PlannerState } from '../store'

export const EV_EXAM_DATE = '2026-11-23'
export const EV_DEFAULT_START = '2026-11-18'

const HOW = {
  learn: 'Learn tab first (model answers, figures), then the Lab if the topic has one: play with it until the numbers make sense, then solve its exam-style problems. Finish with the Recall tab.',
  practice: 'Past questions: numbers on paper first, then check against the worked solution; theory parts blurted against the timer (≈ 0.85 min per mark).',
  revise: 'Memory Well: everything due, then the lists you missed. Say each list out loud before flipping.',
  mock: 'Full paper, 3 hours, 3 + 3 questions, written on paper. Then self-mark with the worked solutions and keyword checks and redo what you missed.',
}

let n = 0
const b = (day: string, topic: PlanBlock['topic'], title: string, hours: number, kind: PlanBlock['kind'] = 'learn'): PlanBlock => ({ id: `p${++n}`, topic, title, hours, kind, how: HOW[kind], day })

export function evBlocks(): PlanBlock[] {
  n = 0
  const d1 = '2026-11-18'
  const d2 = '2026-11-19'
  const d3 = '2026-11-20'
  const d4 = '2026-11-21'
  const d5 = '2026-11-22'
  return [
    // 18 Nov — Tanvir sir, the maths half
    b(d1, 'setup', 'Tour: topic tabs, labs, Memory Well', 0.25),
    b(d1, 'ev-wq', 'Impurities and their significance, hardness / alkalinity, carbonate system, Henry’s law', 2),
    b(d1, 'ev-sed', 'Type I column and Type II iso-removal problems, SOR, plate settlers', 2),
    b(d1, 'ev-soft', 'Lime–soda doses, bar diagrams, split treatment, recarbonation', 2),
    b(d1, 'ev-ix', 'Ion-exchange bypass, resin volume, regeneration cycle', 1),
    b(d1, 'ev-coag', 'Double layer, destabilisation mechanisms, dose vs colloid, alum and alkalinity', 0.75),
    // 19 Nov — Tanvir sir, the recall half + Rowshan ma'am's Section A topics
    b(d2, 'mixed', 'Memory Well: yesterday’s cards and missed lists', 0.75, 'revise'),
    b(d2, 'ev-coag', 'Coagulation: finish (jar test, G, CAMP number, sweep coagulation)', 0.75),
    b(d2, 'ev-filt', 'SSF vs RSF, mechanisms, dual/mixed media, backwash, roughing filter', 1.5),
    b(d2, 'ev-dis', 'Chlorine chemistry, breakpoint, THMs, ideal disinfectant', 1),
    b(d2, 'ev-fe', 'Fe–Mn–As removal and the flow diagrams; SW vs GW treatment trains', 1.25),
    b(d2, 'ev-att', 'RO vs ED, activated carbon (GAC vs PAC), adsorption mechanisms', 1),
    b(d2, 'ev-aer', 'Aeration objectives, aerators, gas transfer', 0.75),
    b(d2, 'ev-wsp', 'Water safety plan: activities, steps, risk matrix', 1),
    // 20 Nov — Snigdha ma'am
    b(d3, 'mixed', 'Memory Well: Tanvir sir’s cards due today', 0.75, 'revise'),
    b(d3, 'ev-ws', 'Elements of a water supply system (sketch), sources, hydrologic cycle', 0.75),
    b(d3, 'ev-demand', 'Per-capita factors, fire demand and fire streams, NRW', 1),
    b(d3, 'ev-pop', 'Population forecasting: every method, least-squares parabola', 1),
    b(d3, 'ev-gw', 'Aquifers, storativity, Thiem / Dupuit derivations, interference', 2),
    b(d3, 'ev-well', 'DTW design from the gradation curve + well log; hand pumps; tubewell failure', 1.75),
    b(d3, 'ev-dist', 'Layouts, methods, dead-end design', 0.75),
    // 21 Nov — Rowshan ma'am
    b(d4, 'mixed', 'Memory Well: Snigdha ma’am’s cards due today', 0.75, 'revise'),
    b(d4, 'ev-pump', 'Pump capacity and power problems, curves, priming, cavitation, NPSH', 1.5),
    b(d4, 'ev-rwh', 'RWH importance, BNBC rules, tank sizing (demand, supply, dry months)', 1.25),
    b(d4, 'ev-trans', 'Water hammer, corrosion, laying pipes', 1),
    b(d4, 'ev-intake', 'Dry vs wet intake, site selection', 0.75),
    b(d4, 'ev-bdws', 'SDG 6.1, service ladder, coverage gaps, problem areas and options', 1.25),
    b(d4, 'ev-climate', 'Water vapour and global warming, energy–environment nexus, environmental engineer', 1),
    b(d4, 'ev-eco', 'Ecosystem, ecosystem services, biodiversity', 0.5),
    // 22 Nov — protected: mock + sweep
    b(d5, 'mock', 'Mock: 2023-24 paper (3 h) + self-marking', 3.5, 'mock'),
    b(d5, 'mixed', 'Redo every number type you missed (Labs → exam-style problems)', 2, 'practice'),
    b(d5, 'mixed', 'Memory Well: every card due + every missed list', 2.5, 'revise'),
  ]
}

export function evDefaultPlanner(): PlannerState {
  const now = isoDate(new Date())
  const start = now > EV_DEFAULT_START && now < EV_EXAM_DATE ? now : EV_DEFAULT_START
  return { startDate: start, examDate: EV_EXAM_DATE, defaultHours: 8, hoursByDay: {}, blocks: evBlocks(), revisionDays: 1 }
}
