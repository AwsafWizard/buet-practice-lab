// Bond / detailing design problems from the physical beam (as the papers ask): choose the bars for the
// beam, then ld, bar cut-off (simply supported bottom bars or cantilever top bars), anchorage of cantilever
// top bars in the column (straight or hook, minimum column depth), and lap splice class + length at a
// given location. Every number from engine/bond.ts (+ designRect from engine/tbeam.ts for As).
// Units: in, ft, kip; f'c and fy in psi for the bond engine, ksi for designRect.

import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import {
  bar as barOf,
  beamBarGeometry,
  columnAnchorage,
  cutoff,
  hookFactors,
  hookGeometry,
  ktr,
  ldGeneral,
  ldhCalc,
  ldSimplified,
  psiFactors,
  simplifiedCase,
  spliceClass,
  tensionLap,
  type Bar,
  type BeamGeo,
  type CutoffOut,
  type Diagram,
  type HookFactors,
  type LdGeneral,
  type LdhResult,
  type LdResult,
} from '../../engine/bond'
import { wu as wuOf } from '../../engine/materials'
import { barFit } from '../../engine/singly'
import { designRect, type RectDesign } from '../../engine/tbeam'
import { COUNT, type DProblem, type DStep, type Level } from '../tbeam/designShell'

export type BFamily = 'ssCutoff' | 'cantilever' | 'splice'
export const B_FAMILIES: { v: BFamily; label: string }[] = [
  { v: 'ssCutoff', label: 'Simple beam: bars + cut-off' },
  { v: 'cantilever', label: 'Cantilever: hook in column + cut-off' },
  { v: 'splice', label: 'Lap splice at a location' },
]

export interface LdCalc {
  method: 'simplified' | 'general'
  geo: BeamGeo
  top: boolean
  psiT: number
  /** simplified: Table 6.1 row */
  met?: boolean
  why?: string
  /** general */
  Ktr?: number
  sStir?: number
  r: LdResult | LdGeneral
}

export interface BProblem extends DProblem<BFamily> {
  L: number
  b: number
  h: number
  d: number
  fc: number
  fy: number
  wD: number
  wL: number
  wu: number
  PD: number
  PL: number
  Pu: number
  Mu: number
  br: Bar
  des: RectDesign
  n: number
  ld: LdCalc
  // cut-off
  nCut?: number
  dg?: Diagram
  co?: CutoffOut
  // cantilever anchorage
  col?: number
  backCover?: number
  sideCover?: number
  hf?: HookFactors
  ldh?: LdhResult
  anch?: ReturnType<typeof columnAnchorage>
  hookGeo?: ReturnType<typeof hookGeometry>
  // splice
  xs?: number
  Mx?: number
  AsX?: number
  ratio?: number
  pct?: number
  cls?: ReturnType<typeof spliceClass>
  lap?: ReturnType<typeof tensionLap>
}

function ldFor(br: Bar, n: number, b: number, top: boolean, fc: number, fy: number, general: boolean, sStir: number): LdCalc {
  const geo = beamBarGeometry({ b, cover: 1.5, ds: 0.375, db: br.db, n })
  const psi = psiFactors({ db: br.db, small: br.small, top })
  if (general) {
    const K = ktr(0.22, sStir, n)
    const r = ldGeneral({ db: br.db, fc, fy, psiT: psi.psiT, psiE: psi.psiE, psiS: psi.psiS, cb: geo.cb, Ktr: K })
    return { method: 'general', geo, top, psiT: psi.psiT, Ktr: K, sStir, r }
  }
  const cs = simplifiedCase({ db: br.db, clearSpacing: geo.clearSpacing, clearCover: geo.clearCover, stirrupsMin: true })
  const r = ldSimplified({ db: br.db, small: br.small, fc, fy, met: cs.met, psiT: psi.psiT })
  return { method: 'simplified', geo, top, psiT: psi.psiT, met: cs.met, why: cs.why, r }
}

function attempt(r: () => number, family: BFamily, level: Level): BProblem | null {
  const fc = pick(r, [3000, 3000, 4000, 4000, 5000])
  const fy = 60000
  const b = pick(r, [10, 12, 12, 14, 16])
  const no = pick(r, [6, 7, 8, 9])
  const br = barOf(`#${no}`)
  const general = level === 'tough'
  const sStir = randInt(r, 6, 10)
  const cant = family === 'cantilever'
  const L = cant ? randInt(r, 6, 12) : randInt(r, 16, 30, 2)
  const h = cant ? randInt(r, 20, 28, 2) : randInt(r, 18, 30, 2)
  const d = h - 2.5
  const wD = randInt(r, 10, 25) / 10
  const wL = randInt(r, 8, 30) / 10
  const wu = wuOf(wD, wL)
  const PD = cant && r() < 0.5 ? randInt(r, 2, 8) : 0
  const PL = PD ? randInt(r, 2, 8) : 0
  const Pu = PD ? wuOf(PD, PL) : 0
  const Mu = cant ? (wu * L * L) / 2 + Pu * L : (wu * L * L) / 8
  const des = designRect(Mu, b, d, d, fc / 1000, fy / 1000)
  if (!des.possible || des.tooHeavy) return null
  const n = Math.max(family === 'splice' ? 2 : 3, Math.ceil(Math.max(des.As, des.AsMin) / br.Ab - 1e-9))
  if (n > 6 || !barFit(n, no, b).fits) return null
  const ld = ldFor(br, n, b, cant, fc, fy, general, sStir)
  const base: BProblem = { family, level, title: '', text: '', hash: '', steps: [], L, b, h, d, fc, fy, wD, wL, wu, PD, PL, Pu, Mu, br, des, n, ld }
  if (family === 'splice') {
    const xs = Math.round(pick(r, [L / 2, L / 3, L / 4, L / 6, L / 8]) * 2) / 2
    const Mx = (wu * xs * (L - xs)) / 2
    const AsX = designRect(Mx, b, d, d, fc / 1000, fy / 1000).As
    const ratio = (n * br.Ab) / AsX
    const pct = level === 'basic' ? 100 : pick(r, [100, 50])
    if (pct === 50 && n % 2 === 1 && n < 4) return null
    const cls = spliceClass(ratio, pct)
    const lap = tensionLap(ld.r.ld0, cls.cls)
    return { ...base, xs, Mx, AsX, ratio, pct, cls, lap }
  }
  const nCut = n === 3 ? 1 : Math.floor(n / 2)
  if (cant) {
    const col = pick(r, [14, 16, 18, 20, 24])
    const backCover = 2
    const sideCover = pick(r, [2, 2.5, 3])
    const hf = hookFactors({ no, hook: 90, sideCover, tailCover: backCover, confined: false })
    const ldh = ldhCalc({ db: br.db, fc, fy, psiE: hf.psiE, psiC: hf.psiC, psiR: hf.psiR })
    const anch = columnAnchorage({ colDepth: col, backCover, ldStraight: ld.r.final, ldh: ldh.final })
    const dg: Diagram = { kind: 'cant', L, wu, P: Pu }
    const co = cutoff({ dg, b, d, fc, fy, bar: br, nTotal: n, nCut, ld: ld.r.final, endEmbed: 2 })
    if (!co.adequate || co.xTheo < 0.3 || co.xCut > L - 0.5) return null
    return { ...base, nCut, dg, co, col, backCover, sideCover, hf, ldh, anch, hookGeo: hookGeometry(no, br.db, 90) }
  }
  const dg: Diagram = { kind: 'ss', L, wu }
  const co = cutoff({ dg, b, d, fc, fy, bar: br, nTotal: n, nCut, ld: ld.r.final, endEmbed: 6 })
  if (!co.adequate || co.xTheo < 0.5 || co.xCut < 0.25) return null
  return { ...base, nCut, dg, co }
}

export function makeBDesign(seed: number, only?: BFamily, level: Level = 'exam'): BProblem {
  const r = rng(seed * 7919 + 303)
  const family = only ?? pick(r, B_FAMILIES.map((f) => f.v))
  let p: BProblem | null = null
  for (let i = 0; i < 2000 && !p; i++) p = attempt(r, family, level)
  return describe(p!)
}

const yn = [
  { v: 'yes', label: 'yes' },
  { v: 'no', label: 'no' },
]
const LD = { unit: 'in', tol: 0.05 }

function describe(p: BProblem): BProblem {
  const mat = `$f'_c = ${p.fc}$ psi, $f_y = ${p.fy}$ psi, normal-weight concrete, uncoated bars, 1.5 in clear cover to No. 3 stirrups${p.ld.method === 'general' ? ` at ${p.ld.sStir} in` : ' (at least the code minimum)'}. Load factors 1.2D + 1.6L.`
  const ldHow = p.ld.method === 'general' ? 'Use the **general equation** (cb, Ktr) for ld.' : 'Use the **simplified** ld expressions (Table 6.1).'
  const loads = `${p.wD} k/ft dead (incl. self-weight) + ${p.wL} k/ft live`
  const sec = `$b = ${p.b}$ in, $h = ${p.h}$ in ($d = h - 2.5$ in)`
  p.hash = hashKey(JSON.stringify([p.family, p.level, p.L, p.b, p.h, p.fc, p.wD, p.wL, p.PD, p.PL, p.br.id, p.ld.sStir, p.col, p.sideCover, p.xs, p.pct]))
  const st: DStep[] = []
  const G1 = '1 — Design the bars',
    G2 = `2 — Development length (${p.ld.top ? 'top' : 'bottom'} bars)`
  st.push({ key: 'wu', group: G1, label: 'wu', value: p.wu, unit: 'k/ft' })
  if (p.Pu) st.push({ key: 'Pu', group: G1, label: 'Pu at the tip', value: p.Pu, unit: 'k' })
  st.push({ key: 'Mu', group: G1, label: p.family === 'cantilever' ? 'Mu at the column face' : 'Mu at midspan', value: p.Mu, unit: 'k-ft' })
  st.push({ key: 'As', group: G1, label: 'As required', value: p.des.As, unit: 'in²' })
  st.push({ key: 'n', group: G1, label: `number of ${p.br.label} bars`, value: p.n, ...COUNT })
  st.push({ key: 'cs', group: G2, label: 'clear spacing between bars', value: p.ld.geo.clearSpacing, unit: 'in' })
  if (p.ld.method === 'simplified') st.push({ key: 'row', group: G2, label: 'Table 6.1 row', options: [{ v: 'met', label: 'first row (spacing/cover OK)' }, { v: 'other', label: 'other cases' }], answer: p.ld.met ? 'met' : 'other' })
  else {
    st.push({ key: 'cb', group: G2, label: 'cb', value: p.ld.geo.cb, unit: 'in' })
    st.push({ key: 'ktr', group: G2, label: 'Ktr = 40Atr/(sn)', value: p.ld.Ktr!, unit: 'in' })
  }
  st.push({ key: 'ld', group: G2, label: 'ld', value: p.ld.r.final, ...LD })

  if (p.family === 'splice') {
    p.title = 'Lap splice of bottom bars'
    p.text = `A simply supported beam of ${p.L} ft span carries ${loads}. Section ${sec}. ${mat}\n\nDesign the bottom bars at midspan using ${p.br.label} bars. Because of the bar lengths available, the bottom bars must be lap-spliced **${p.xs} ft from the support**, with **${p.pct === 100 ? 'all the bars spliced at that section' : 'alternate bars spliced (50 %), the others staggered'}**. Find the splice class and the lap length. ${ldHow}`
    const G3 = '3 — Splice'
    st.push({ key: 'Mx', group: G3, label: 'Mu at the splice', value: p.Mx!, unit: 'k-ft' })
    st.push({ key: 'AsX', group: G3, label: 'As required at the splice', value: p.AsX!, unit: 'in²' })
    st.push({ key: 'ratio', group: G3, label: 'As,prov / As,req', value: p.ratio!, tol: 0.03 })
    st.push({ key: 'cls', group: G3, label: 'Splice class', options: [{ v: 'A', label: 'Class A' }, { v: 'B', label: 'Class B' }], answer: p.cls!.cls })
    st.push({ key: 'lst', group: G3, label: 'lap length lst', value: p.lap!.final, ...LD })
  } else if (p.family === 'cantilever') {
    p.title = 'Cantilever top bars: anchorage + cut-off'
    p.text = `A cantilever projects ${p.L} ft from the face of a ${p.col} in deep column and carries ${loads}${p.PD ? `, plus a tip load of ${p.PD} k dead + ${p.PL} k live` : ''}. Section ${sec}. ${mat}\n\nDesign the top bars using ${p.br.label} bars. Can the bars be anchored **straight** in the column (clear cover ${p.backCover} in at the far face)? If not, use 90° standard hooks (side cover ${p.sideCover} in, tail cover ${p.backCover} in, no ties along the hook): find ldh, check it, and give the least column depth. Then **discontinue ${p.nCut} bar${p.nCut! > 1 ? 's' : ''}** and find the cut-off point. ${ldHow}`
    const G3 = '3 — Anchorage in the column',
      G4 = '4 — Cut-off'
    st.push({ key: 'str', group: G3, label: `straight ld fits in ${p.anch!.available} in?`, options: yn, answer: p.anch!.straightOK ? 'yes' : 'no' })
    st.push({ key: 'ldh', group: G3, label: 'ldh', value: p.ldh!.final, ...LD })
    st.push({ key: 'hk', group: G3, label: 'hook fits?', options: yn, answer: p.anch!.hookOK ? 'yes' : 'no' })
    st.push({ key: 'minc', group: G3, label: 'least column depth for the hook', value: p.anch!.minColumn, ...LD })
    st.push({ key: 'tail', group: G3, label: '90° hook tail (12db)', value: p.hookGeo!.tail, unit: 'in' })
    st.push({ key: 'pmr', group: G4, label: `φMn of the ${p.n - p.nCut!} continuing bars`, value: p.co!.remain.phiMn, unit: 'k-ft' })
    st.push({ key: 'xt', group: G4, label: 'theoretical cut-off (ft from the face)', value: p.co!.xTheo, unit: 'ft', abs: 0.05 })
    st.push({ key: 'ext', group: G4, label: 'extension max(d, 12db)', value: p.co!.ext, unit: 'in' })
    st.push({ key: 'xc', group: G4, label: 'actual cut-off (ft from the face)', value: p.co!.xCut, unit: 'ft', abs: 0.05 })
    st.push({ key: 'cont', group: G4, label: 'continuing bars develop ld beyond the theoretical point?', options: yn, answer: p.co!.contOK ? 'yes' : 'no' })
  } else {
    p.title = 'Simple beam: bottom bars and cut-off'
    p.text = `A simply supported beam of ${p.L} ft clear span carries ${loads}. Section ${sec}. ${mat}\n\nDesign the bottom bars at midspan using ${p.br.label} bars. **${p.nCut} bar${p.nCut! > 1 ? 's are' : ' is'} to be cut off**; the rest run 6 in past the support face. Find the cut-off points and check the development of the continuing bars at the support (ld ≤ 1.3Mn/Vu + la). ${ldHow}`
    const G3 = '3 — Cut-off'
    const ss = p.co!.ssCheck!
    st.push({ key: 'pmr', group: G3, label: `φMn of the ${p.n - p.nCut!} continuing bars`, value: p.co!.remain.phiMn, unit: 'k-ft' })
    st.push({ key: 'xt', group: G3, label: 'theoretical cut-off (ft from the support face)', value: p.co!.xTheo, unit: 'ft', abs: 0.05 })
    st.push({ key: 'ext', group: G3, label: 'extension max(d, 12db)', value: p.co!.ext, unit: 'in' })
    st.push({ key: 'xc', group: G3, label: 'actual cut-off (ft from the support face)', value: p.co!.xCut, unit: 'ft', abs: 0.05 })
    st.push({ key: 'lim', group: G3, label: '1.3Mn/Vu + la at the support', value: ss.limit, unit: 'in' })
    st.push({ key: 'ssok', group: G3, label: 'ld ≤ 1.3Mn/Vu + la?', options: yn, answer: ss.ok ? 'yes' : 'no' })
  }
  p.steps = st
  return p
}
