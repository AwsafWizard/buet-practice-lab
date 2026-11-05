// Classification (AJK sir's Topic 3, Das Ch. 5 exactly as on the slides): grading curve from sieve data,
// D10/D30/D60 by log interpolation, Cu and Cc, % gravel / sand / fines by USCS (4.75 / 0.075 mm) and by
// AASHTO (2.0 / 0.075 mm); USCS group symbol (Table 5.2, dual symbols, organic check) and group name
// (Figs 5.4–5.6); AASHTO group by left-to-right elimination (Table 5.1) and group index (eq. 5.1/5.2);
// USDA textural class with the gravel correction (modified percentages).

import { aLine, chartZone } from './plasticity'

// ---------------------------------------------------------------- sieves and the grading curve
export const SIEVES: { no: string; d: number }[] = [
  { no: '3 in', d: 76.2 },
  { no: '1½ in', d: 38.1 },
  { no: '¾ in', d: 19.0 },
  { no: '⅜ in', d: 9.5 },
  { no: '#4', d: 4.75 },
  { no: '#10', d: 2.0 },
  { no: '#16', d: 1.18 },
  { no: '#20', d: 0.85 },
  { no: '#30', d: 0.6 },
  { no: '#40', d: 0.425 },
  { no: '#50', d: 0.3 },
  { no: '#60', d: 0.25 },
  { no: '#80', d: 0.18 },
  { no: '#100', d: 0.15 },
  { no: '#140', d: 0.106 },
  { no: '#200', d: 0.075 },
  { no: '#270', d: 0.053 },
]
export const sieveName = (d: number) => SIEVES.find((s) => Math.abs(s.d - d) < 1e-3 * Math.max(1, d))?.no ?? `${d} mm`

/** a point of the grading curve: size (mm) and % finer */
export interface GradPt {
  d: number
  pf: number
}
export interface SieveRow {
  d: number
  /** mass retained on this sieve */
  ret: number
}
export interface SieveLine extends SieveRow {
  pctRet: number
  cumRet: number
  pf: number
}
/** cumulative % finer from masses retained (pan included in the total) */
export function sieveAnalysis(rows: SieveRow[], pan: number) {
  const s = [...rows].sort((a, b) => b.d - a.d)
  const total = s.reduce((t, r) => t + r.ret, 0) + pan
  let cum = 0
  const lines: SieveLine[] = s.map((r) => {
    cum += r.ret
    return { ...r, pctRet: (100 * r.ret) / total, cumRet: (100 * cum) / total, pf: 100 - (100 * cum) / total }
  })
  return { total, lines, pts: lines.map((l) => ({ d: l.d, pf: l.pf })) }
}

const sortPts = (pts: GradPt[]) => [...pts].filter((p) => p.d > 0 && Number.isFinite(p.pf)).sort((a, b) => b.d - a.d)

/** % finer at a size, by interpolation on the semi-log curve; 100 above a 100 % point, 0 below a 0 % point */
export function pctFinerAt(pts: GradPt[], d: number, mode: 'log' | 'linear' = 'log'): number {
  const s = sortPts(pts)
  if (!s.length) return NaN
  const X = (v: number) => (mode === 'log' ? Math.log10(v) : v)
  for (const p of s) if (Math.abs(p.d - d) < 1e-9) return p.pf
  if (d > s[0].d) return s[0].pf >= 100 - 1e-9 ? 100 : NaN
  if (d < s[s.length - 1].d) return s[s.length - 1].pf <= 1e-9 ? 0 : NaN
  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i]
    const b = s[i + 1]
    if (d <= a.d && d >= b.d) return b.pf + ((X(d) - X(b.d)) / (X(a.d) - X(b.d))) * (a.pf - b.pf)
  }
  return NaN
}

/** size at which p % is finer (D_p), by log interpolation between the bracketing points */
export function dAt(pts: GradPt[], p: number, mode: 'log' | 'linear' = 'log'): number {
  const s = sortPts(pts)
  for (const q of s) if (Math.abs(q.pf - p) < 1e-9) return q.d
  for (let i = 0; i + 1 < s.length; i++) {
    const a = s[i]
    const b = s[i + 1]
    if (p <= a.pf && p >= b.pf && a.pf > b.pf) {
      const t = (p - b.pf) / (a.pf - b.pf)
      return mode === 'log' ? 10 ** (Math.log10(b.d) + t * (Math.log10(a.d) - Math.log10(b.d))) : b.d + t * (a.d - b.d)
    }
  }
  return NaN
}

export const cuOf = (D60: number, D10: number) => D60 / D10
export const ccOf = (D10: number, D30: number, D60: number) => (D30 * D30) / (D60 * D10)
/** back-calculate D10 and D30 from D60, Cu and Cc (2009-10 Q2(a)) */
export function fromCuCc(D60: number, Cu: number, Cc: number) {
  const D10 = D60 / Cu
  return { D10, D30: Math.sqrt(Cc * D60 * D10), D60 }
}

export interface Grading {
  D10: number
  D30: number
  D60: number
  Cu: number
  Cc: number
  P4: number
  P10: number
  P40: number
  P200: number
  uscs: { gravel: number; sand: number; fines: number }
  aashto: { gravel: number; sand: number; siltClay: number }
}
export function grading(pts: GradPt[], mode: 'log' | 'linear' = 'log'): Grading {
  const D10 = dAt(pts, 10, mode)
  const D30 = dAt(pts, 30, mode)
  const D60 = dAt(pts, 60, mode)
  const P4 = pctFinerAt(pts, 4.75, mode)
  const P10 = pctFinerAt(pts, 2.0, mode)
  const P40 = pctFinerAt(pts, 0.425, mode)
  const P200 = pctFinerAt(pts, 0.075, mode)
  return {
    D10,
    D30,
    D60,
    Cu: cuOf(D60, D10),
    Cc: ccOf(D10, D30, D60),
    P4,
    P10,
    P40,
    P200,
    uscs: { gravel: 100 - P4, sand: P4 - P200, fines: P200 },
    aashto: { gravel: 100 - P10, sand: P10 - P200, siltClay: P200 },
  }
}

/** grading word: well graded needs Cu ≥ 4 (gravel) / 6 (sand) and 1 ≤ Cc ≤ 3 */
export function gradeOf(Cu: number, Cc: number, kind: 'G' | 'S') {
  const cuMin = kind === 'G' ? 4 : 6
  const well = Cu >= cuMin && Cc >= 1 && Cc <= 3
  let comment: string
  if (well) comment = `well graded (Cu = ${Cu.toFixed(2)} ≥ ${cuMin} and 1 ≤ Cc = ${Cc.toFixed(2)} ≤ 3): sizes spread over a wide range`
  else if (Cu < cuMin && Cu < 4) comment = `poorly graded, uniform (Cu = ${Cu.toFixed(2)} small): most grains about the same size`
  else if (Cc < 1 || Cc > 3) comment = `poorly graded (Cc = ${Cc.toFixed(2)} outside 1–3${Cu >= cuMin ? '; a wide range with some sizes missing suggests gap grading' : ''})`
  else comment = `poorly graded (Cu = ${Cu.toFixed(2)} below ${cuMin})`
  return { well, letter: well ? 'W' : 'P', comment }
}

// ---------------------------------------------------------------- USCS (Table 5.2 + Figs 5.4–5.6)
export interface UscsIn {
  /** % passing No. 200 */
  F200: number
  /** % passing No. 4 (NaN if not given) */
  F4?: number
  /** lower bound for % passing No. 4 when only a finer sieve is given (e.g. % passing No. 10) */
  F4min?: number
  LL?: number
  PL?: number
  /** non-plastic fines */
  NP?: boolean
  Cu?: number
  Cc?: number
  /** LL of the oven-dried sample (organic check) */
  LLoven?: number
  /** primarily organic matter, dark, organic odour */
  peat?: boolean
}
export interface UscsStep {
  /** short tag used by the lab to highlight the step */
  tag: 'split' | 'gs' | 'fines' | 'grade' | 'plast' | 'organic' | 'symbol' | 'name'
  text: string
}
export type FinesType = 'M' | 'C' | 'CM'
export interface UscsOut {
  kind: 'coarse' | 'fine' | 'Pt'
  symbol: string
  name: string
  /** the name chart needs data the question did not give */
  nameNote?: string
  /** Table 5.2 rows used (group symbols) */
  rows: string[]
  chart: '5.4' | '5.5' | '5.6' | null
  /** which branch of the name chart: 'lt15' | 'ge15' | 'lt30' … */
  branch: string
  gravel: number
  sand: number
  fines: number
  PI: number
  steps: UscsStep[]
  flags: string[]
}

const f1 = (v: number) => (Number.isFinite(v) ? (Math.round(v * 100) / 100).toString() : '—')

/** fines type from the plasticity chart: M (PI < 4 or below A), C (PI > 7 on/above A), CM (4–7 on/above A, hatched) */
export function finesType(LL: number, PI: number, NP?: boolean): FinesType {
  if (NP || !Number.isFinite(PI) || PI <= 0 || !Number.isFinite(LL)) return 'M'
  const above = PI >= aLine(LL)
  if (!above || PI < 4) return 'M'
  if (PI <= 7) return 'CM'
  return 'C'
}

function fineName(base: string, plus200: number, sand: number, gravel: number): { name: string; branch: string; note?: string } {
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
  if (plus200 < 15) return { name: cap(base), branch: 'lt15' }
  if (!Number.isFinite(sand) || !Number.isFinite(gravel)) return { name: cap(base), branch: '?', note: `${f1(plus200)} % is coarser than No. 200, so the name needs the sand / gravel split (with sand / with gravel / sandy / gravelly ${base}), which is not given.` }
  const sandy = sand >= gravel
  if (plus200 < 30) return sandy ? { name: `${cap(base)} with sand`, branch: '15-29s' } : { name: `${cap(base)} with gravel`, branch: '15-29g' }
  if (sandy) return gravel < 15 ? { name: `Sandy ${base}`, branch: 'ge30s-lt15g' } : { name: `Sandy ${base} with gravel`, branch: 'ge30s-ge15g' }
  return sand < 15 ? { name: `Gravelly ${base}`, branch: 'ge30g-lt15s' } : { name: `Gravelly ${base} with sand`, branch: 'ge30g-ge15s' }
}

const FINES_WORD: Record<FinesType, string> = { M: 'silt', C: 'clay', CM: 'silty clay' }

export function uscs(inp: UscsIn): UscsOut {
  const steps: UscsStep[] = []
  const flags: string[] = []
  const F = inp.F200
  const PI = inp.NP ? 0 : (inp.LL ?? NaN) - (inp.PL ?? NaN)
  const LL = inp.LL ?? NaN
  const F4 = inp.F4 ?? NaN
  const gravel = 100 - F4
  const sand = F4 - F
  const base = { gravel, sand, fines: F, PI, flags }
  if (inp.peat) {
    steps.push({ tag: 'split', text: 'Primarily organic matter, dark in colour, organic odour → highly organic soil.' })
    return { ...base, kind: 'Pt', symbol: 'Pt', name: 'Peat', rows: ['Pt'], chart: null, branch: '', steps }
  }
  if (F >= 50) {
    steps.push({ tag: 'split', text: `${f1(F)} % passes No. 200 (≥ 50 %) → fine-grained soil.` })
    const hi = LL >= 50
    let organic = false
    if (inp.LLoven !== undefined && Number.isFinite(inp.LLoven)) {
      const r = inp.LLoven / LL
      organic = r < 0.75
      steps.push({ tag: 'organic', text: `LL(oven dried)/LL(not dried) = ${f1(inp.LLoven)}/${f1(LL)} = ${r.toFixed(3)} ${organic ? '< 0.75 → organic' : '≥ 0.75 → inorganic'}.` })
    }
    const z = chartZone(LL, PI)
    steps.push({ tag: 'plast', text: `LL = ${f1(LL)} (${hi ? '≥ 50: H' : '< 50: L'}), PI = ${f1(PI)}; A-line PI at this LL = 0.73(${f1(LL)} − 20) = ${f1(z.aPI)} → ${z.aboveA ? 'on or above' : 'below'} the A-line${!hi && z.aboveA && PI >= 4 && PI <= 7 ? ' and 4 ≤ PI ≤ 7 (hatched CL-ML band)' : ''}.` })
    if (z.aboveU) flags.push(`PI = ${f1(PI)} is above the U-line (${f1(z.uPI)}): check the data — no natural soil plots there.`)
    let symbol: string
    let baseName: string
    let chart: UscsOut['chart']
    if (organic) {
      symbol = hi ? 'OH' : 'OL'
      const clayish = hi ? z.aboveA : PI >= 4 && z.aboveA
      baseName = clayish ? 'organic clay' : 'organic silt'
      chart = '5.6'
    } else {
      symbol = z.zone
      baseName = { CL: 'lean clay', 'CL-ML': 'silty clay', ML: 'silt', CH: 'fat clay', MH: 'elastic silt' }[z.zone]
      chart = '5.5'
    }
    steps.push({ tag: 'symbol', text: `Group symbol **${symbol}** (Table 5.2${organic ? ', organic row' : ''}).` })
    const plus = 100 - F
    const nm = fineName(baseName, plus, sand, gravel)
    steps.push({
      tag: 'name',
      text: `Fig. ${chart}: plus No. 200 = 100 − ${f1(F)} = ${f1(plus)} %${Number.isFinite(sand) ? `, sand = ${f1(sand)} %, gravel = ${f1(gravel)} %` : ''} → **${nm.name}**.`,
    })
    return { ...base, kind: 'fine', symbol, name: nm.name, nameNote: nm.note, rows: [symbol.split('-')[0], ...(symbol === 'CL-ML' ? ['ML'] : [])], chart, branch: nm.branch, steps }
  }
  // coarse-grained
  const coarse = 100 - F
  steps.push({ tag: 'split', text: `${f1(F)} % passes No. 200 (< 50 %) → coarse-grained; coarse fraction = ${f1(coarse)} %.` })
  let G: boolean
  if (Number.isFinite(F4)) {
    G = gravel > sand
    steps.push({ tag: 'gs', text: `Gravel (retained on No. 4) = 100 − ${f1(F4)} = ${f1(gravel)} %, sand = ${f1(F4)} − ${f1(F)} = ${f1(sand)} % → ${f1((100 * sand) / coarse)} % of the coarse fraction passes No. 4 → ${G ? 'more than half is gravel → **G**' : '50 % or more is sand → **S**'}.` })
  } else if (inp.F4min !== undefined) {
    const sandMin = inp.F4min - F
    G = !(sandMin >= coarse / 2)
    steps.push({ tag: 'gs', text: `% passing No. 4 not given; at least ${f1(inp.F4min)} % passes a finer sieve, so sand ≥ ${f1(sandMin)} % ${sandMin >= coarse / 2 ? `≥ half the coarse fraction (${f1(coarse / 2)} %) → **S**` : '— not enough to decide; assumed G'}.` })
    if (G) flags.push('Gravel / sand split undecided: give % passing No. 4.')
  } else {
    G = false
    flags.push('% passing No. 4 not given: assumed sand.')
    steps.push({ tag: 'gs', text: '% passing No. 4 not given — assumed sand (S).' })
  }
  const L = G ? 'G' : 'S'
  const other = G ? sand : gravel // the 15 % split of Fig. 5.4
  const otherWord = G ? 'sand' : 'gravel'
  const ft = finesType(LL, PI, inp.NP)
  const grade = () => {
    const Cu = inp.Cu ?? NaN
    const Cc = inp.Cc ?? NaN
    if (!Number.isFinite(Cu) || !Number.isFinite(Cc)) {
      flags.push('Cu and Cc needed for the W/P letter.')
      steps.push({ tag: 'grade', text: 'Cu, Cc not available → grading letter undetermined (P assumed).' })
      return 'P'
    }
    const g = gradeOf(Cu, Cc, L as 'G' | 'S')
    steps.push({ tag: 'grade', text: `Cu = ${f1(Cu)}, Cc = ${f1(Cc)}: ${L === 'G' ? 'GW needs Cu ≥ 4' : 'SW needs Cu ≥ 6'} and 1 ≤ Cc ≤ 3 → **${L}${g.letter}** (${g.well ? 'well graded' : 'poorly graded'}).` })
    return g.letter
  }
  const plastText = () => {
    if (inp.NP) return 'fines non-plastic → M (silt)'
    const a = aLine(LL)
    return `fines LL = ${f1(LL)}, PI = ${f1(PI)}, A-line ${f1(a)} → ${ft === 'M' ? 'PI < 4 or below the A-line → M' : ft === 'C' ? 'PI > 7 and on/above the A-line → C' : '4 ≤ PI ≤ 7 and on/above the A-line (hatched)'}`
  }
  const withOther = (s: string, joiner: 'with' | 'and') => (other >= 15 ? `${s} ${joiner} ${otherWord}` : s)
  const gName = G ? 'gravel' : 'sand'
  const gradeWord = (w: string) => (w === 'W' ? 'Well-graded' : 'Poorly graded')
  let symbol: string
  let name: string
  let rows: string[]
  if (F < 5) {
    steps.push({ tag: 'fines', text: `Fines ${f1(F)} % < 5 % → clean ${gName}.` })
    const w = grade()
    symbol = L + w
    name = withOther(`${gradeWord(w)} ${gName}`, 'with')
    rows = [symbol]
  } else if (F <= 12) {
    steps.push({ tag: 'fines', text: `Fines ${f1(F)} % between 5 and 12 % → dual symbol (footnote ${G ? 'a' : 'b'}).` })
    const w = grade()
    const f2 = ft === 'M' ? 'M' : 'C'
    steps.push({ tag: 'plast', text: `${plastText()}${ft === 'CM' ? ' → C (fines are CL-ML: "with silty clay")' : ''}.` })
    symbol = `${L}${w}-${L}${f2}`
    const fw = ft === 'M' ? 'silt' : ft === 'CM' ? 'silty clay' : 'clay'
    name = other >= 15 ? `${gradeWord(w)} ${gName} with ${fw} and ${otherWord}` : `${gradeWord(w)} ${gName} with ${fw}`
    rows = [L + w, L + f2]
  } else {
    steps.push({ tag: 'fines', text: `Fines ${f1(F)} % > 12 % → ${gName} with fines (footnote d for the hatched band).` })
    steps.push({ tag: 'plast', text: `${plastText()}.` })
    symbol = ft === 'M' ? `${L}M` : ft === 'C' ? `${L}C` : `${L}C-${L}M`
    const adj = ft === 'M' ? 'Silty' : ft === 'C' ? 'Clayey' : 'Silty clayey'
    name = withOther(`${adj} ${gName}`, 'with')
    rows = ft === 'CM' ? [L + 'C', L + 'M'] : [symbol]
  }
  steps.push({ tag: 'symbol', text: `Group symbol **${symbol}**.` })
  const nameNote = !Number.isFinite(other) ? `% ${otherWord} not known: add "${F >= 5 && F <= 12 ? `and ${otherWord}` : `with ${otherWord}`}" if it is 15 % or more.` : undefined
  steps.push({ tag: 'name', text: `Fig. 5.4 (${gName}s): ${otherWord} = ${f1(other)} % ${Number.isFinite(other) ? (other >= 15 ? '≥ 15 %' : '< 15 %') : ''} → **${name}**.` })
  void FINES_WORD
  return { ...base, kind: 'coarse', symbol, name, nameNote, rows, chart: '5.4', branch: other >= 15 ? 'ge15' : 'lt15', steps }
}

// ---------------------------------------------------------------- AASHTO (Table 5.1 / M 145 Table 2)
export type AKey = 'P10' | 'P40' | 'P200' | 'LL' | 'PI'
export interface ACrit {
  k: AKey
  min?: number
  max?: number
  /** A-3: non-plastic */
  np?: boolean
}
export interface AGroup {
  id: string
  crit: ACrit[]
  material: string
  rating: string
  /** lecturer's red GI row on slides 9–10 */
  giRow: string
}
export const AASHTO_GROUPS: AGroup[] = [
  { id: 'A-1-a', crit: [{ k: 'P10', max: 50 }, { k: 'P40', max: 30 }, { k: 'P200', max: 15 }, { k: 'PI', max: 6 }], material: 'Stone fragments, gravel and sand', rating: 'Excellent to good', giRow: '0-3 (Excellent)' },
  { id: 'A-1-b', crit: [{ k: 'P40', max: 50 }, { k: 'P200', max: 25 }, { k: 'PI', max: 6 }], material: 'Stone fragments, gravel and sand', rating: 'Excellent to good', giRow: '0-3 (Excellent)' },
  { id: 'A-3', crit: [{ k: 'P40', min: 51 }, { k: 'P200', max: 10 }, { k: 'PI', np: true }], material: 'Fine sand', rating: 'Excellent to good', giRow: '0-4 (Good)' },
  { id: 'A-2-4', crit: [{ k: 'P200', max: 35 }, { k: 'LL', max: 40 }, { k: 'PI', max: 10 }], material: 'Silty or clayey gravel and sand', rating: 'Excellent to good', giRow: '0-10 (Good to fair)' },
  { id: 'A-2-5', crit: [{ k: 'P200', max: 35 }, { k: 'LL', min: 41 }, { k: 'PI', max: 10 }], material: 'Silty or clayey gravel and sand', rating: 'Excellent to good', giRow: '0-10 (Good to fair)' },
  { id: 'A-2-6', crit: [{ k: 'P200', max: 35 }, { k: 'LL', max: 40 }, { k: 'PI', min: 11 }], material: 'Silty or clayey gravel and sand', rating: 'Excellent to good', giRow: '0-10 (Fair to poor)' },
  { id: 'A-2-7', crit: [{ k: 'P200', max: 35 }, { k: 'LL', min: 41 }, { k: 'PI', min: 11 }], material: 'Silty or clayey gravel and sand', rating: 'Excellent to good', giRow: '0-10 (Fair to poor)' },
  { id: 'A-4', crit: [{ k: 'P200', min: 36 }, { k: 'LL', max: 40 }, { k: 'PI', max: 10 }], material: 'Silty soils', rating: 'Fair to poor', giRow: '0-20 (Fair to poor)' },
  { id: 'A-5', crit: [{ k: 'P200', min: 36 }, { k: 'LL', min: 41 }, { k: 'PI', max: 10 }], material: 'Silty soils', rating: 'Fair to poor', giRow: '0-20+ (Poor)' },
  { id: 'A-6', crit: [{ k: 'P200', min: 36 }, { k: 'LL', max: 40 }, { k: 'PI', min: 11 }], material: 'Clayey soils', rating: 'Fair to poor', giRow: '0-30+ (Poor to very poor)' },
  { id: 'A-7', crit: [{ k: 'P200', min: 36 }, { k: 'LL', min: 41 }, { k: 'PI', min: 11 }], material: 'Clayey soils', rating: 'Fair to poor', giRow: '0-40+ (Unsuitable w.o. improvement)' },
]

export interface AashtoIn {
  P10?: number
  P40?: number
  P200: number
  LL?: number
  PI?: number
  /** non-plastic */
  NP?: boolean
}
export interface CritCheck {
  crit: ACrit
  value: number
  /** true pass, false fail, null not given */
  pass: boolean | null
  text: string
}
export interface GroupCheck {
  group: AGroup
  checks: CritCheck[]
  pass: boolean
  /** some criterion could not be checked */
  unknown: boolean
}

const KEY_LABEL: Record<AKey, string> = { P10: '% passing No. 10', P40: '% passing No. 40', P200: '% passing No. 200', LL: 'LL', PI: 'PI' }

function checkCrit(c: ACrit, v: Record<AKey, number>, NP: boolean): CritCheck {
  const raw = v[c.k]
  if (c.np) {
    const pass = NP || raw === 0
    return { crit: c, value: raw, pass: NP || Number.isFinite(raw) ? pass : null, text: `PI = ${NP ? 'NP' : f1(raw)} must be NP` }
  }
  if (!Number.isFinite(raw)) {
    if (NP && (c.k === 'PI' || c.k === 'LL')) {
      // non-plastic: PI = 0 satisfies any "max", fails any "min"; LL not determinable
      const pass = c.max !== undefined
      return { crit: c, value: 0, pass, text: `${KEY_LABEL[c.k]} NP ${pass ? 'passes' : 'fails'} ${c.max !== undefined ? `${c.max} max` : `${c.min} min`}` }
    }
    return { crit: c, value: NaN, pass: null, text: `${KEY_LABEL[c.k]} not given (${c.max !== undefined ? `${c.max} max` : `${c.min} min`})` }
  }
  const r = Math.round(raw) // M 145 §3.2: limits are whole numbers; round the test value
  const pass = c.max !== undefined ? r <= c.max : r >= c.min!
  return { crit: c, value: raw, pass, text: `${KEY_LABEL[c.k]} = ${f1(raw)}${r !== raw ? ` (→ ${r})` : ''} ${c.max !== undefined ? `≤ ${c.max} max` : `≥ ${c.min} min`} ${pass ? '✓' : '✗'}` }
}

export interface GI {
  /** partial GI from LL: (F − 35)[0.2 + 0.005(LL − 40)] */
  t1: number
  /** partial GI from PI: 0.01(F − 15)(PI − 10) */
  t2: number
  raw: number
  gi: number
  rule: 'formula' | 'zero-group' | 'pi-only' | 'np'
}
/** Das eq. 5.1 / 5.2 and the slide-13 rules: negative → 0, round to a whole number, A-1/A-3/A-2-4/A-2-5 → 0, A-2-6/A-2-7 PI part only */
export function groupIndex(F: number, LL: number, PI: number, group?: string): GI {
  const t1 = (F - 35) * (0.2 + 0.005 * (LL - 40))
  const t2 = 0.01 * (F - 15) * (PI - 10)
  const rnd = (x: number) => Math.max(0, Math.floor(x + 0.5))
  if (group && ['A-1-a', 'A-1-b', 'A-3', 'A-2-4', 'A-2-5'].includes(group)) return { t1, t2, raw: t1 + t2, gi: 0, rule: 'zero-group' }
  if (group === 'A-2-6' || group === 'A-2-7') return { t1, t2, raw: t2, gi: rnd(t2), rule: 'pi-only' }
  if (!Number.isFinite(LL) || !Number.isFinite(PI)) return { t1, t2, raw: NaN, gi: 0, rule: 'np' }
  return { t1, t2, raw: t1 + t2, gi: rnd(t1 + t2), rule: 'formula' }
}

export interface AashtoOut {
  /** subgroup, e.g. 'A-7-6' */
  group: string
  /** e.g. 'A-7-6(42)' */
  label: string
  gi: GI
  checks: GroupCheck[]
  /** index into AASHTO_GROUPS of the first fitting group (-1 none) */
  idx: number
  part: 'granular' | 'silt-clay'
  material: string
  rating: string
  a7?: { LLm30: number; sub: 'A-7-5' | 'A-7-6' }
  steps: string[]
  /** groups still possible when some data are missing */
  possible: string[]
}

export function aashto(inp: AashtoIn): AashtoOut {
  const NP = !!inp.NP
  const v: Record<AKey, number> = { P10: inp.P10 ?? NaN, P40: inp.P40 ?? NaN, P200: inp.P200, LL: inp.LL ?? NaN, PI: NP ? 0 : (inp.PI ?? NaN) }
  const checks: GroupCheck[] = AASHTO_GROUPS.map((g) => {
    const cs = g.crit.map((c) => checkCrit(c, v, NP))
    return { group: g, checks: cs, pass: cs.every((c) => c.pass === true), unknown: cs.some((c) => c.pass === null) }
  })
  const possible = checks.filter((c) => !c.checks.some((x) => x.pass === false)).map((c) => c.group.id)
  const idx = checks.findIndex((c) => c.pass)
  const part: AashtoOut['part'] = Math.round(inp.P200) <= 35 ? 'granular' : 'silt-clay'
  const steps: string[] = []
  steps.push(`${f1(inp.P200)} % passes No. 200 → ${part === 'granular' ? '35 % or less: granular materials (Part 1); cross out Part 2' : 'more than 35 %: silt-clay materials (Part 2); cross out Part 1'}.`)
  if (idx < 0) {
    steps.push('No group fits all its limits — check the data.')
    return { group: '—', label: '—', gi: groupIndex(inp.P200, v.LL, v.PI), checks, idx, part, material: '—', rating: '—', steps, possible }
  }
  for (const c of checks.slice(0, idx + 1)) {
    if (c.group.crit.some((x) => x.k === 'P200' && (part === 'granular' ? x.min !== undefined : x.max !== undefined))) continue
    const failed = c.checks.find((x) => x.pass === false)
    steps.push(`${c.group.id}: ${c.pass ? c.checks.map((x) => x.text).join('; ') + ' → **fits**' : `${failed ? failed.text : 'not checkable'} → no`}.`)
  }
  let group = checks[idx].group.id
  let a7: AashtoOut['a7']
  if (group === 'A-7') {
    const LLm30 = v.LL - 30
    const sub = v.PI <= LLm30 ? 'A-7-5' : 'A-7-6'
    a7 = { LLm30, sub }
    steps.push(`A-7 subgroup: LL − 30 = ${f1(LLm30)}; PI = ${f1(v.PI)} ${sub === 'A-7-5' ? '≤' : '>'} LL − 30 → **${sub}**.`)
    group = sub
  }
  const gi = groupIndex(inp.P200, v.LL, v.PI, group)
  if (gi.rule === 'zero-group') steps.push(`GI of ${group} is always 0 (rule 4).`)
  else if (gi.rule === 'pi-only') steps.push(`${group}: PI part only (eq. 5.2): GI = 0.01(${f1(inp.P200)} − 15)(${f1(v.PI)} − 10) = ${gi.raw.toFixed(2)} → ${gi.gi}.`)
  else if (gi.rule === 'np') steps.push('Non-plastic / LL not determinable: GI = 0.')
  else steps.push(`GI = (${f1(inp.P200)} − 35)[0.2 + 0.005(${f1(v.LL)} − 40)] + 0.01(${f1(inp.P200)} − 15)(${f1(v.PI)} − 10) = ${gi.t1.toFixed(2)} + ${gi.t2.toFixed(2)} = ${gi.raw.toFixed(2)}${gi.raw < 0 ? ' < 0 → 0' : ` → ${gi.gi}`}.`)
  const g = checks[idx].group
  return { group, label: `${group}(${gi.gi})`, gi, checks, idx, part, material: g.material, rating: g.rating, a7, steps, possible }
}

/** Das Fig. 5.2 region of an (LL, PI) point */
export function fig52(LL: number, PI: number, F200?: number) {
  const a2 = F200 !== undefined && F200 <= 35
  if (PI <= 10) return LL <= 40 ? (a2 ? 'A-2-4' : 'A-4') : a2 ? 'A-2-5' : 'A-5'
  if (LL <= 40) return a2 ? 'A-2-6' : 'A-6'
  if (PI <= LL - 30) return a2 ? 'A-2-7' : 'A-7-5'
  return a2 ? 'A-2-7' : 'A-7-6'
}

// ---------------------------------------------------------------- USDA textural triangle (Das Fig. 5.1)
export type UsdaClass = 'Sand' | 'Loamy sand' | 'Sandy loam' | 'Loam' | 'Silt loam' | 'Silt' | 'Sandy clay loam' | 'Clay loam' | 'Silty clay loam' | 'Sandy clay' | 'Silty clay' | 'Clay'
/** class polygons as (sand %, clay %) vertices (silt = 100 − sand − clay) */
export const USDA_POLY: Record<UsdaClass, [number, number][]> = {
  Sand: [
    [100, 0],
    [85, 0],
    [90, 10],
  ],
  'Loamy sand': [
    [85, 0],
    [70, 0],
    [85, 15],
    [90, 10],
  ],
  'Sandy loam': [
    [70, 0],
    [50, 0],
    [43, 7],
    [52, 7],
    [52, 20],
    [80, 20],
    [85, 15],
  ],
  Loam: [
    [43, 7],
    [52, 7],
    [52, 20],
    [45, 27],
    [23, 27],
  ],
  'Silt loam': [
    [50, 0],
    [20, 0],
    [8, 12],
    [0, 12],
    [0, 27],
    [23, 27],
  ],
  Silt: [
    [20, 0],
    [0, 0],
    [0, 12],
    [8, 12],
  ],
  'Sandy clay loam': [
    [80, 20],
    [52, 20],
    [45, 27],
    [45, 35],
    [65, 35],
  ],
  'Clay loam': [
    [45, 27],
    [20, 27],
    [20, 40],
    [45, 40],
  ],
  'Silty clay loam': [
    [20, 27],
    [0, 27],
    [0, 40],
    [20, 40],
  ],
  'Sandy clay': [
    [65, 35],
    [45, 35],
    [45, 55],
  ],
  'Silty clay': [
    [20, 40],
    [0, 40],
    [0, 60],
  ],
  Clay: [
    [20, 40],
    [45, 40],
    [45, 55],
    [0, 100],
    [0, 60],
  ],
}

/** class from sand, silt, clay (%, summing to 100) */
export function usdaClass(sand: number, silt: number, clay: number): UsdaClass {
  if (silt + 1.5 * clay < 15) return 'Sand'
  if (silt + 2 * clay < 30) return 'Loamy sand'
  if (clay >= 40) return silt >= 40 ? 'Silty clay' : sand > 45 ? 'Sandy clay' : 'Clay'
  if (clay >= 35 && sand > 45) return 'Sandy clay'
  if (clay >= 27) return sand <= 20 ? 'Silty clay loam' : sand <= 45 ? 'Clay loam' : 'Sandy clay loam'
  if (clay >= 20 && silt < 28 && sand > 45) return 'Sandy clay loam'
  if (silt >= 80 && clay < 12) return 'Silt'
  if (silt >= 50) return 'Silt loam'
  if (clay >= 7 && sand <= 52 && silt >= 28) return 'Loam'
  return 'Sandy loam'
}

/** gravel correction (slide 6): modified % = % × 100/(100 − %gravel); "gravelly" added for a large gravel content */
export function usda(p: { gravel?: number; sand: number; silt: number; clay: number }, gravellyAt = 10) {
  const g = p.gravel ?? 0
  const k = 100 / (100 - g)
  const sand = p.sand * k
  const silt = p.silt * k
  const clay = p.clay * k
  const cls = usdaClass(sand, silt, clay)
  const gravelly = g >= gravellyAt
  return { sand, silt, clay, cls, gravelly, name: gravelly ? `Gravelly ${cls.toLowerCase()}` : cls }
}
/** triangle coordinates (base 100): sand corner bottom-left, silt bottom-right, clay top */
export const usdaXY = (silt: number, clay: number) => ({ x: silt + clay / 2, y: (clay * Math.sqrt(3)) / 2 })
