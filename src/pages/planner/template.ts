import { isoDate, type PlanBlock, type PlannerState } from '../../store'

export const EXAM_DATE = '2026-10-31'
export const DEFAULT_START = '2026-10-19'

const HOW = {
  learn: 'Overview → Approach (watch the animation) → Lab until it feels easy → 2–3 past questions, newest first. Try before you expand the solution.',
  practice: 'Past questions under time pressure (~30 min per 46-mark part). Write the full working on paper, then check.',
  revise: 'Formula sheet + re-do every question you marked “review”.',
  mock: 'Full paper, 3 hours, closed book except the provided charts. Mark yourself honestly afterwards.',
}

let n = 0
const b = (topic: PlanBlock['topic'], title: string, hours: number, kind: PlanBlock['kind'] = 'learn'): PlanBlock => ({
  id: `b${++n}`,
  topic,
  title,
  hours,
  kind,
  how: HOW[kind],
})

/** default order: heavy analysis topic + a lighter code topic each day; revision at the end */
export function defaultBlocks(): PlanBlock[] {
  n = 0
  return [
    // D1
    b('setup', 'Set up your plan & tour the dashboard', 0.5, 'learn'),
    b('frames', 'Determinate frames: reactions, SFD/BMD/AFD, internal hinges', 4),
    b('stability', 'Stability & determinacy: DOSI, DOKI, unstable cases', 2),
    // D2
    b('truss', 'Trusses: joints, sections, zero-force members, K-trusses', 3.5),
    b('truss', 'X-braced trusses by approximation (T&C vs tension-only)', 1.5),
    b('code', 'Building code, loads, live-load reduction', 2),
    // D3
    b('ild', 'Influence lines: beams with hinges, Müller-Breslau, frames', 4.5),
    b('wind', 'Wind I: V, exposure, Kz, Kzt, enclosure classification', 2.5),
    // D4
    b('ild', 'Max effects: moving UDL + roving load', 1.5, 'practice'),
    b('floor', 'Floor beam & girder systems', 3),
    b('wind', 'Wind II: simplified procedure (ps = λ Kzt I ps30)', 2.5),
    // D5
    b('floor', 'Truss influence lines, counters, max bar force', 4),
    b('wind', 'Wind III: analytical — G, pressures, parapet, storey forces', 3),
    // D6
    b('wheel', 'Wheel loads: max V & M at a section, abs. max moment, reactions', 4.5),
    b('eq', 'Earthquake I: Z, I, site class, SDC, R, T, Cs, Sa', 2.5),
    // D7
    b('lateral', 'Lateral loads: portal method + cantilever method', 5),
    b('eq', 'Earthquake II: seismic weight, base shear, storey forces', 2),
    // D8
    b('vertical', 'Vertical loads (0.1L method)', 1.5),
    b('lateral', 'Lateral extras: reverse problems, truss bents', 1),
    b('vw', 'Virtual work I: beams & frames (bending + shear)', 4.5),
    // D9
    b('vw', 'Virtual work II: trusses, jacks, fabrication errors', 3),
    b('cable', 'Cables, suspension bridges, three-hinged arch', 3),
    b('mixed', 'Mixed wind + earthquake past questions', 1, 'practice'),
    // D10
    b('mixed', 'Weak-topic past questions (pick from your stats)', 7, 'practice'),
    // D11
    b('mock', 'Mock exam: 2023-24 paper (3 h) + review', 7, 'mock'),
    // D12
    b('mock', 'Mock exam: 2022-23 paper (3 h) + formula sheet', 5, 'mock'),
  ]
}

export function defaultPlanner(): PlannerState {
  const now = isoDate(new Date())
  const start = now > DEFAULT_START && now < EXAM_DATE ? now : DEFAULT_START
  return { startDate: start, examDate: EXAM_DATE, defaultHours: 7, hoursByDay: {}, blocks: defaultBlocks(), revisionDays: 2 }
}

export function daysBetween(start: string, end: string): string[] {
  const out: string[] = []
  const d = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  while (d < e) {
    out.push(isoDate(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/** Pack blocks into days. Manually pinned blocks stay; mocks/revision fill the protected last days. */
export function pack(p: PlannerState): Map<string, PlanBlock[]> {
  const days = daysBetween(p.startDate, p.examDate)
  const map = new Map<string, PlanBlock[]>(days.map((d) => [d, []]))
  const cap = (d: string) => p.hoursByDay[d] ?? p.defaultHours
  const used = new Map<string, number>(days.map((d) => [d, 0]))
  const add = (d: string, blk: PlanBlock) => {
    map.get(d)!.push(blk)
    used.set(d, used.get(d)! + blk.hours)
  }
  const pinned = p.blocks.filter((b) => b.day && map.has(b.day))
  for (const blk of pinned) add(blk.day!, blk)
  const free = p.blocks.filter((b) => !(b.day && map.has(b.day)))
  const protectedN = Math.min(p.revisionDays, Math.max(0, days.length - 1))
  const studyDays = days.slice(0, days.length - protectedN)
  const revDays = days.slice(days.length - protectedN)
  const mocks = free.filter((b) => b.kind === 'mock')
  const rest = free.filter((b) => b.kind !== 'mock')
  // mocks: one per protected day, from the end backwards
  mocks.forEach((blk, i) => {
    const d = revDays[i] ?? days[days.length - 1 - i] ?? days[days.length - 1]
    add(d, blk)
  })
  let k = 0
  for (const blk of rest) {
    while (k < studyDays.length - 1 && used.get(studyDays[k])! + blk.hours > cap(studyDays[k]) + 0.26) k++
    add(studyDays[Math.min(k, studyDays.length - 1)] ?? days[0], blk)
  }
  return map
}
