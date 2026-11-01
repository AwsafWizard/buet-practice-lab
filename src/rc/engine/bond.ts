// CE 315 bond, anchorage & detailing engine (Nilson / ACI 318, US units: in, kip, psi for f'c and fy).
// Follows the class Bond & Anchorage handnote: simplified Table 6.1, general Eq. 6.4, hooks by Eq. 6.6
// (ldh = fy ψe ψc ψr db / (50 λ √f'c), the ACI 318-11/14 form used in the slides), compression Eq. 6.10,
// Class A / B splices, compression laps, and bar cut-off from a moment diagram.

import { BARS, MM_BARS, phiFlex, beta1 } from './materials'

// ---------------------------------------------------------------- bars
export interface Bar {
  /** '#6' or '20mm' */
  id: string
  label: string
  /** nominal diameter, in */
  db: number
  /** area, in² */
  Ab: number
  /** US size, or the nearest US size for a metric bar (decides #6-and-smaller and hook bend diameter) */
  no: number
  mm?: number
  /** No. 6 and smaller (ψs = 0.8, the 1/25 and 3/50 columns of Table 6.1) */
  small: boolean
}

export const US_BAR_IDS = ['#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11']
export const MM_BAR_IDS = ['10mm', '12mm', '16mm', '20mm', '22mm', '25mm', '28mm', '32mm']

const US_NOS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 18]
/** nearest US bar size by diameter (20 mm = 0.79 in → No. 6, 25 mm → No. 8) */
export function nearestUS(db: number) {
  return US_NOS.reduce((best, n) => (Math.abs(BARS[n].d - db) < Math.abs(BARS[best].d - db) ? n : best), 3)
}

export function bar(id: string): Bar {
  const mm = id.match(/^(\d+)\s*mm$/i)
  if (mm) {
    const m = +mm[1]
    const d = m / 25.4
    const A = MM_BARS[m]?.A ?? (Math.PI * d * d) / 4
    const no = nearestUS(d)
    return { id, label: `${m} mm`, db: d, Ab: A, no, mm: m, small: no <= 6 }
  }
  const no = +id.replace('#', '')
  const b = BARS[no]
  if (!b) throw new Error(`unknown bar ${id}`)
  return { id, label: `No. ${no}`, db: b.d, Ab: b.A, no, small: no <= 6 }
}

/** √f'c in psi, capped at 100 psi (ACI 25.4.1.4) */
export const sqrtFc = (fc: number) => Math.min(Math.sqrt(fc), 100)

/** the class rounds required lengths UP to the next whole inch */
export const upIn = (v: number) => Math.ceil(v - 1e-6)

// ---------------------------------------------------------------- ψ factors (straight bars in tension)
export interface PsiIn {
  db: number
  small: boolean
  /** more than 12 in of fresh concrete cast below the bar */
  top?: boolean
  epoxy?: boolean
  /** clear cover and clear spacing (in) — decide ψe = 1.5 vs 1.2 for epoxy bars */
  clearCover?: number
  clearSpacing?: number
  lightweight?: boolean
}
export interface Psi {
  psiT: number
  psiE: number
  /** ψt·ψe before the 1.7 cap */
  psiTEraw: number
  /** ψt·ψe used (≤ 1.7) */
  psiTE: number
  capped: boolean
  psiS: number
  lambda: number
  eNote: string
}
export function psiFactors(i: PsiIn): Psi {
  const psiT = i.top ? 1.3 : 1.0
  let psiE = 1.0
  let eNote = 'uncoated → ψe = 1.0'
  if (i.epoxy) {
    const cc = i.clearCover ?? 0
    const cs = i.clearSpacing ?? 0
    const tight = cc < 3 * i.db || cs < 6 * i.db
    psiE = tight ? 1.5 : 1.2
    eNote = tight ? `epoxy with clear cover < 3db (${(3 * i.db).toFixed(2)} in) or clear spacing < 6db → ψe = 1.5` : 'epoxy, cover ≥ 3db and spacing ≥ 6db → ψe = 1.2'
  }
  const psiTEraw = psiT * psiE
  const psiTE = Math.min(psiTEraw, 1.7)
  return { psiT, psiE, psiTEraw, psiTE, capped: psiTEraw > 1.7, psiS: i.small ? 0.8 : 1.0, lambda: i.lightweight ? 0.75 : 1.0, eNote }
}

// ---------------------------------------------------------------- beam cross-section geometry
export interface BeamGeoIn {
  /** beam width, in */
  b: number
  /** clear cover to the stirrup, in (1.5 for beams) */
  cover: number
  /** stirrup diameter, in (0 if none) */
  ds: number
  db: number
  /** bars in the layer being developed */
  n: number
  /** bar centre to the top/bottom face, in (default cover + ds + db/2; Ex 6.1 uses h − d) */
  faceCenter?: number
}
export interface BeamGeo {
  /** centre-to-centre bar spacing */
  spacingCC: number
  clearSpacing: number
  clearSide: number
  clearFace: number
  /** smaller clear cover (side or top/bottom) — the one Table 6.1 checks */
  clearCover: number
  cSide: number
  cFace: number
  halfSpacing: number
  /** cb = smallest of the centre distances */
  cb: number
  governs: 'spacing' | 'side' | 'face'
  /** stirrup legs crossing the splitting plane: horizontal plane (half-spacing governs) cuts every leg, else one */
  legs: 1 | 2
}
export function beamBarGeometry(g: BeamGeoIn): BeamGeo {
  const edge = g.cover + g.ds
  const cSide = edge + g.db / 2
  const spacingCC = g.n > 1 ? (g.b - 2 * cSide) / (g.n - 1) : Infinity
  const clearSpacing = spacingCC - g.db
  const cFace = g.faceCenter ?? cSide
  const clearSide = edge
  const clearFace = cFace - g.db / 2
  const halfSpacing = spacingCC / 2
  const cb = Math.min(cSide, cFace, halfSpacing)
  const governs = cb === halfSpacing ? 'spacing' : cb === cSide ? 'side' : 'face'
  return { spacingCC, clearSpacing, clearSide, clearFace, clearCover: Math.min(clearSide, clearFace), cSide, cFace, halfSpacing, cb, governs, legs: governs === 'spacing' ? 2 : 1 }
}

// ---------------------------------------------------------------- simplified ld (Table 6.1 / ACI Table 25.4.2.3)
export interface SimpleCaseIn {
  db: number
  clearSpacing: number
  clearCover: number
  /** code-minimum stirrups or ties throughout ld */
  stirrupsMin: boolean
}
/** row of Table 6.1: case (a) spacing ≥ db, cover ≥ db, min stirrups; case (b) spacing ≥ 2db, cover ≥ db; else "other cases" */
export function simplifiedCase(i: SimpleCaseIn): { met: boolean; which: 'a' | 'b' | 'other'; why: string } {
  const s = i.clearSpacing / i.db
  const c = i.clearCover / i.db
  const f = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '∞')
  const base = `clear spacing = ${f(s)} db, clear cover = ${f(c)} db`
  if (c >= 1 && s >= 2) return { met: true, which: 'b', why: `${base}: spacing ≥ 2db and cover ≥ db → first row (case b)` }
  if (c >= 1 && s >= 1 && i.stirrupsMin) return { met: true, which: 'a', why: `${base} with code-minimum stirrups: spacing ≥ db, cover ≥ db → first row (case a)` }
  return { met: false, which: 'other', why: `${base}${i.stirrupsMin ? '' : ', no minimum stirrups'} → "other cases" row` }
}

export interface LdSimpleIn {
  db: number
  small: boolean
  fc: number
  fy: number
  /** Table 6.1 first row applies */
  met: boolean
  psiT?: number
  psiE?: number
  lambda?: number
  /** As,req / As,prov (≤ 1); 1 for splices */
  excess?: number
}
export interface LdResult {
  /** ld/db before the excess-steel factor */
  ratio: number
  /** ld before the excess-steel factor, in */
  ld0: number
  excess: number
  /** ld × excess */
  ld: number
  /** max(ld, 12 in) */
  final: number
  minGoverns: boolean
  psiTE: number
  sqrtFc: number
}
/** coefficient of Table 6.1 as a fraction (1/25, 1/20, 3/50, 3/40) */
export const simpleCoef = (small: boolean, met: boolean) => (met ? (small ? 1 / 25 : 1 / 20) : small ? 3 / 50 : 3 / 40)
export const simpleCoefTex = (small: boolean, met: boolean) => (met ? (small ? '\\frac{1}{25}' : '\\frac{1}{20}') : small ? '\\frac{3}{50}' : '\\frac{3}{40}')

export function ldSimplified(i: LdSimpleIn): LdResult {
  const psiTE = Math.min((i.psiT ?? 1) * (i.psiE ?? 1), 1.7)
  const lam = i.lambda ?? 1
  const sf = sqrtFc(i.fc)
  const ratio = (simpleCoef(i.small, i.met) * i.fy * psiTE) / (lam * sf)
  const ld0 = ratio * i.db
  const excess = Math.min(i.excess ?? 1, 1)
  const ld = ld0 * excess
  return { ratio, ld0, excess, ld, final: Math.max(ld, 12), minGoverns: ld < 12, psiTE, sqrtFc: sf }
}

// ---------------------------------------------------------------- general ld (Eq. 6.4 / ACI 25.4.2.4)
/** Ktr = 40 Atr / (s n) */
export const ktr = (Atr: number, s: number, n: number) => (s > 0 && n > 0 ? (40 * Atr) / (s * n) : 0)

export interface LdGeneralIn {
  db: number
  fc: number
  fy: number
  psiT?: number
  psiE?: number
  psiS?: number
  lambda?: number
  cb: number
  Ktr: number
  excess?: number
}
export interface LdGeneral extends LdResult {
  /** (cb + Ktr)/db before the cap */
  conf: number
  /** used (≤ 2.5) */
  confUsed: number
  capped: boolean
  psiS: number
}
export function ldGeneral(i: LdGeneralIn): LdGeneral {
  const psiTE = Math.min((i.psiT ?? 1) * (i.psiE ?? 1), 1.7)
  const psiS = i.psiS ?? 1
  const lam = i.lambda ?? 1
  const sf = sqrtFc(i.fc)
  const conf = (i.cb + i.Ktr) / i.db
  const confUsed = Math.min(conf, 2.5)
  const ratio = (3 / 40) * (i.fy / (lam * sf)) * ((psiTE * psiS) / confUsed)
  const ld0 = ratio * i.db
  const excess = Math.min(i.excess ?? 1, 1)
  const ld = ld0 * excess
  return { ratio, ld0, excess, ld, final: Math.max(ld, 12), minGoverns: ld < 12, psiTE, sqrtFc: sf, conf, confUsed, capped: conf > 2.5, psiS }
}

// ---------------------------------------------------------------- hooks (Eq. 6.6)
export interface HookFactorIn {
  /** US size (or nearest) */
  no: number
  epoxy?: boolean
  lightweight?: boolean
  hook?: 90 | 180
  /** side cover normal to the plane of the hook, in */
  sideCover?: number
  /** cover on the bar extension (tail) beyond a 90° hook, in */
  tailCover?: number
  /** hook enclosed by ties/stirrups at s ≤ 3db */
  confined?: boolean
  /** discontinuous end with side AND top cover < 2.5 in (Fig. 6.11): ties are mandatory and ψr = 0.8 does not apply */
  discontinuousSmallCover?: boolean
}
export interface HookFactors {
  psiE: number
  psiC: number
  psiR: number
  lambda: number
  cNote: string
  rNote: string
}
export function hookFactors(i: HookFactorIn): HookFactors {
  const hook = i.hook ?? 90
  const big = i.no > 11
  const sideOK = (i.sideCover ?? 0) >= 2.5
  const tailOK = hook === 180 || (i.tailCover ?? 0) >= 2
  const psiC = !big && sideOK && tailOK ? 0.7 : 1.0
  const cNote =
    psiC === 0.7
      ? `side cover ${i.sideCover} in ≥ 2.5 in${hook === 90 ? `, tail cover ${i.tailCover} in ≥ 2 in` : ''}, bar ≤ No. 11 → ψc = 0.7`
      : big
        ? 'bar larger than No. 11 → ψc = 1.0'
        : !sideOK
          ? `side cover ${i.sideCover ?? '?'} in < 2.5 in → ψc = 1.0`
          : `tail cover ${i.tailCover ?? '?'} in < 2 in → ψc = 1.0`
  const psiR = !big && i.confined && !i.discontinuousSmallCover ? 0.8 : 1.0
  const rNote = psiR === 0.8 ? 'hook enclosed by ties at s ≤ 3db → ψr = 0.8' : i.discontinuousSmallCover ? 'discontinuous end with side and top cover < 2.5 in: ties required, but ψr = 0.8 does NOT apply' : 'no ties at ≤ 3db along the hook → ψr = 1.0'
  return { psiE: i.epoxy ? 1.2 : 1.0, psiC, psiR, lambda: i.lightweight ? 0.75 : 1.0, cNote, rNote }
}

export interface LdhIn {
  db: number
  fc: number
  fy: number
  psiE?: number
  psiC?: number
  psiR?: number
  lambda?: number
  excess?: number
}
export interface LdhResult {
  /** fy db / (50 λ √f'c) with ψe only (the "basic" hook length the papers compare) */
  basic: number
  /** with ψe ψc ψr */
  ld0: number
  excess: number
  /** ld0 × excess */
  ld: number
  /** max(8db, 6 in) */
  min: number
  final: number
  minGoverns: boolean
  factor: number
}
export function ldhCalc(i: LdhIn): LdhResult {
  const lam = i.lambda ?? 1
  const sf = sqrtFc(i.fc)
  const psiE = i.psiE ?? 1
  const basic = ((i.fy * psiE) / (50 * lam * sf)) * i.db
  const factor = (i.psiC ?? 1) * (i.psiR ?? 1)
  const ld0 = basic * factor
  const excess = Math.min(i.excess ?? 1, 1)
  const ld = ld0 * excess
  const min = Math.max(8 * i.db, 6)
  return { basic, ld0, excess, ld, min, final: Math.max(ld, min), minGoverns: ld < min, factor }
}

/** standard hook geometry (ACI 25.3): inside bend diameter and the straight extension */
export function hookGeometry(no: number, db: number, hook: 90 | 180 = 90, stirrup = false) {
  const Dk = stirrup && no <= 5 ? 4 : no <= 8 ? 6 : no <= 11 ? 8 : 10
  const D = Dk * db
  let tail: number
  let tailText: string
  if (stirrup) {
    if (hook === 90) {
      tail = no <= 5 ? Math.max(6 * db, 3) : 12 * db
      tailText = no <= 5 ? '6db ≥ 3 in' : '12db'
    } else {
      tail = Math.max(hook === 180 ? 4 * db : 6 * db, hook === 180 ? 2.5 : 3)
      tailText = hook === 180 ? '4db ≥ 2.5 in' : '6db ≥ 3 in'
    }
  } else if (hook === 90) {
    tail = 12 * db
    tailText = '12db'
  } else {
    tail = Math.max(4 * db, 2.5)
    tailText = '4db ≥ 2.5 in'
  }
  return { Dk, D, tail, tailText, /** outside radius of the bend */ rOut: D / 2 + db }
}

/** anchorage of beam bars into a column: available = column depth − clear cover at the far face */
export function columnAnchorage(i: { colDepth: number; backCover: number; ldStraight: number; ldh: number }) {
  const available = i.colDepth - i.backCover
  return {
    available,
    straightOK: i.ldStraight <= available + 1e-9,
    hookOK: i.ldh <= available + 1e-9,
    /** least column depth that takes the hook */
    minColumn: i.ldh + i.backCover,
  }
}

// ---------------------------------------------------------------- headed bars, stirrup anchorage, flexural bond
/** ldt = 0.016 fy ψe db / √f'c (≥ 8db, 6 in) */
export const ldtHeaded = (db: number, fc: number, fy: number, psiE = 1) => Math.max(((0.016 * fy * psiE) / sqrtFc(fc)) * db, 8 * db, 6)
/** stirrup No. 6–8 with fyt > 40 ksi: embedment from mid-depth to outside of hook ≥ 0.014 db fyt / (λ √f'c) */
export const stirrupAnchor = (db: number, fc: number, fyt: number, lambda = 1) => (0.014 * db * fyt) / (lambda * sqrtFc(fc))
/** flexural bond force per unit length U = V / jd (kip/in) and average bond stress on Σo (ksi) */
export function flexuralBond(V: number, d: number, j = 0.9, perimeter?: number) {
  const U = V / (j * d)
  return { jd: j * d, U, u: perimeter ? U / perimeter : NaN }
}

// ---------------------------------------------------------------- compression development (Eq. 6.10)
export interface LdcIn {
  db: number
  fc: number
  fy: number
  lambda?: number
  /** spiral ≥ ¼ in at pitch ≤ 4 in, or No. 4 ties at ≤ 4 in → ψr = 0.75 */
  confined?: boolean
  excess?: number
}
export function ldcCalc(i: LdcIn) {
  const lam = i.lambda ?? 1
  const a = (i.fy / (50 * lam * sqrtFc(i.fc))) * i.db
  const b = 0.0003 * i.fy * i.db
  const basic = Math.max(a, b)
  const psiR = i.confined ? 0.75 : 1
  const excess = Math.min(i.excess ?? 1, 1)
  const ld = basic * psiR * excess
  return { a, b, basic, governs: a >= b ? ('a' as const) : ('b' as const), psiR, excess, ld, final: Math.max(ld, 8), minGoverns: ld < 8 }
}

// ---------------------------------------------------------------- bundled bars
export const bundleFactor = (n: number) => (n >= 4 ? 1.33 : n === 3 ? 1.2 : 1.0)
export const dbEquivalent = (n: number, Ab: number) => Math.sqrt((4 * n * Ab) / Math.PI)

// ---------------------------------------------------------------- tension lap splices (ACI 25.5.2)
/** Class A only if As,prov/As,req ≥ 2 over the splice AND ≤ 50 % of the bars spliced within the lap; else Class B */
export function spliceClass(provOverReq: number, pctSpliced: number): { cls: 'A' | 'B'; why: string } {
  const r = provOverReq >= 2
  const p = pctSpliced <= 50
  if (r && p) return { cls: 'A', why: `As,prov/As,req = ${provOverReq.toFixed(2)} ≥ 2 and ${pctSpliced}% ≤ 50% spliced → Class A` }
  const bad = [!r ? `As,prov/As,req = ${provOverReq.toFixed(2)} < 2` : '', !p ? `${pctSpliced}% > 50% of bars spliced` : ''].filter(Boolean).join(' and ')
  return { cls: 'B', why: `${bad} → Class B` }
}
/** lst = 1.0 ld (A) or 1.3 ld (B), ≥ 12 in; ld WITHOUT the excess-steel factor */
export function tensionLap(ld: number, cls: 'A' | 'B') {
  const k = cls === 'A' ? 1.0 : 1.3
  const lst = k * ld
  return { k, lst, final: Math.max(lst, 12), minGoverns: lst < 12 }
}

// ---------------------------------------------------------------- compression lap splices (ACI 25.5.5)
/** effective tie area ≥ 0.0015 h s (both directions) lets a tied column use × 0.83 */
export function tieAreaCheck(h: number, s: number, Atie: number) {
  const req = 0.0015 * h * s
  return { req, prov: Atie, ok: Atie >= req - 1e-9, sMax: Atie / (0.0015 * h) }
}
export interface CompLapIn {
  /** bar from above (smaller), its lsc is used */
  db: number
  fy: number
  fc: number
  lambda?: number
  /** larger bar from below when sizes differ: its ldc also governs */
  dbLarge?: number
  /** tied column whose ties pass the 0.0015hs check → × 0.83 */
  tiedOK?: boolean
  /** spiral column → × 0.75 */
  spiral?: boolean
}
export function compressionLap(i: CompLapIn) {
  const base = i.fy <= 60000 ? 0.0005 * i.fy * i.db : (0.0009 * i.fy - 24) * i.db
  const formula = i.fy <= 60000 ? '0.0005 f_y d_b' : '(0.0009 f_y - 24) d_b'
  const low = i.fc < 3000
  const lsc0 = base * (low ? 4 / 3 : 1)
  const factor = i.spiral ? 0.75 : i.tiedOK ? 0.83 : 1
  const lsc = Math.max(lsc0 * factor, 12)
  const ldcLarge = i.dbLarge ? ldcCalc({ db: i.dbLarge, fc: i.fc, fy: i.fy, lambda: i.lambda }).basic : 0
  const final = Math.max(lsc, ldcLarge)
  return { base, formula, low, lsc0, factor, lsc, ldcLarge, final, governs: ldcLarge > lsc ? ('ldc' as const) : ('lsc' as const) }
}

// ---------------------------------------------------------------- flexural capacity of a bar group (for cut-off)
/** rectangular section, tension steel only: φMn in k-ft */
export function phiMnRect(As: number, b: number, d: number, fc: number, fy: number) {
  const a = (As * fy) / (0.85 * fc * b)
  const c = a / beta1(fc)
  const epsT = (0.003 * (d - c)) / c
  const phi = phiFlex(epsT, fy)
  const Mn = (As * fy * (d - a / 2)) / 12000
  return { a, c, epsT, phi, Mn, phiMn: phi * Mn }
}

// ---------------------------------------------------------------- moment diagrams for cut-off
export type Diagram =
  /** simply supported, UDL wu (k/ft), span L (ft) — positive bars */
  | { kind: 'ss'; L: number; wu: number }
  /** cantilever from a fixed face, UDL wu (k/ft) + tip load P (k), length L (ft) — top bars */
  | { kind: 'cant'; L: number; wu: number; P: number }
  /** continuous span, full UDL with ACI end moments wu ln²/cl (left) and wu ln²/cr (right) — top bars at the left support */
  | { kind: 'cont'; L: number; wu: number; cl: number; cr: number }

/** moment carried by the bars considered (k-ft, ≥ 0 where those bars are in tension), x in ft from the support face */
export function momentAt(dg: Diagram, x: number): number {
  if (dg.kind === 'ss') return (dg.wu * x * (dg.L - x)) / 2
  if (dg.kind === 'cant') {
    const a = dg.L - x
    return (dg.wu * a * a) / 2 + dg.P * a
  }
  const Ml = (dg.wu * dg.L * dg.L) / dg.cl
  const Mr = (dg.wu * dg.L * dg.L) / dg.cr
  const R = (dg.wu * dg.L) / 2 + (Ml - Mr) / dg.L
  return Ml - R * x + (dg.wu * x * x) / 2 // hogging positive
}
export function maxMoment(dg: Diagram) {
  return dg.kind === 'ss' ? (dg.wu * dg.L * dg.L) / 8 : momentAt(dg, 0)
}
/** point of inflection of the hogging curve (cont) — first zero from the left face */
export function inflectionPoint(dg: Diagram & { kind: 'cont' }) {
  const Ml = (dg.wu * dg.L * dg.L) / dg.cl
  const Mr = (dg.wu * dg.L * dg.L) / dg.cr
  const R = (dg.wu * dg.L) / 2 + (Ml - Mr) / dg.L
  // wu/2 x² − R x + Ml = 0
  const disc = R * R - 2 * dg.wu * Ml
  return disc < 0 ? NaN : (R - Math.sqrt(disc)) / dg.wu
}
/** x (ft from the support face) where the moment drops/rises to M: ss → nearer the left support; cant/cont → from the face */
export function xWhereMoment(dg: Diagram, M: number): number {
  if (dg.kind === 'ss') {
    const disc = (dg.L * dg.L) / 4 - (2 * M) / dg.wu
    return disc <= 0 ? dg.L / 2 : dg.L / 2 - Math.sqrt(disc)
  }
  if (dg.kind === 'cant') {
    // wu a²/2 + P a − M = 0, a = distance from the free end
    const a = dg.wu > 0 ? (-dg.P + Math.sqrt(dg.P * dg.P + 2 * dg.wu * M)) / dg.wu : M / dg.P
    return Math.max(0, dg.L - a)
  }
  const Ml = (dg.wu * dg.L * dg.L) / dg.cl
  const Mr = (dg.wu * dg.L * dg.L) / dg.cr
  const R = (dg.wu * dg.L) / 2 + (Ml - Mr) / dg.L
  const disc = R * R - 2 * dg.wu * (Ml - M)
  return Math.max(0, (R - Math.sqrt(Math.max(0, disc))) / dg.wu)
}

// ---------------------------------------------------------------- bar cut-off
export interface CutoffIn {
  dg: Diagram
  /** section */
  b: number
  d: number
  fc: number
  fy: number
  bar: Bar
  nTotal: number
  nCut: number
  /** development length of these bars (in), from ldSimplified / ldGeneral with the right ψt */
  ld: number
  /** ss: embedment of the continuing bars past the support face (in, ≥ 6); cant: clear cover at the free end (in) */
  endEmbed?: number
}
export interface CutoffOut {
  Mmax: number
  all: ReturnType<typeof phiMnRect>
  remain: ReturnType<typeof phiMnRect>
  /** section adequate with all bars */
  adequate: boolean
  /** theoretical cut-off point, ft from the support face */
  xTheo: number
  /** extension max(d, 12db), in */
  ext: number
  extGov: 'd' | '12db'
  /** cut point from the extension rule alone, ft from the face */
  xExt: number
  /** distance from the point of max stress of the cut bars to the cut point needed: ld */
  /** final cut point (ft from the face) satisfying both the extension and ld from max stress */
  xCut: number
  ldGoverns: boolean
  /** length from the max-stress point of the cut bars to xExt, in */
  availCut: number
  /** continuing bars: length available beyond xTheo (in) vs ld */
  availCont: number
  contOK: boolean
  fracRemain: number
  /** ss: ≥ ⅓ of +As into the support; cont: ≥ ⅓ of −As past the inflection point */
  fracOK: boolean
  /** cont only: inflection point (ft) and required extension of continuing top bars past it (in) */
  ip?: number
  ipExt?: number
  /** ss only: ACI 9.7.3.8.3 ld ≤ 1.3 Mn/Vu + la at the simple support (Mn of the continuing bars) */
  ssCheck?: { Mn: number; Vu: number; la: number; limit: number; ok: boolean }
}

export function cutoff(i: CutoffIn): CutoffOut {
  const { dg, bar: br } = i
  const all = phiMnRect(i.nTotal * br.Ab, i.b, i.d, i.fc, i.fy)
  const nRem = i.nTotal - i.nCut
  const remain = phiMnRect(nRem * br.Ab, i.b, i.d, i.fc, i.fy)
  const Mmax = maxMoment(dg)
  const ext = Math.max(i.d, 12 * br.db)
  const extGov = i.d >= 12 * br.db ? 'd' : '12db'
  const fracRemain = nRem / i.nTotal
  const L = dg.L
  if (dg.kind === 'ss') {
    const xTheo = xWhereMoment(dg, remain.phiMn)
    const xExt = Math.max(0, xTheo - ext / 12)
    const mid = L / 2
    const availCut = (mid - xExt) * 12
    const xLd = mid - i.ld / 12
    const xCut = Math.max(0, Math.min(xExt, xLd))
    const embed = i.endEmbed ?? 6
    const availCont = xTheo * 12 + embed
    const Vu = (dg.wu * L) / 2
    const Mn = remain.Mn
    const limit = (1.3 * Mn * 12) / Vu + embed
    return {
      Mmax, all, remain, adequate: all.phiMn >= Mmax - 1e-9, xTheo, ext, extGov, xExt, xCut, ldGoverns: xLd < xExt, availCut,
      availCont, contOK: availCont >= i.ld - 1e-9, fracRemain, fracOK: fracRemain >= 1 / 3 - 1e-9,
      ssCheck: { Mn, Vu, la: embed, limit, ok: i.ld <= limit + 1e-9 },
    }
  }
  // cantilever / continuous: the cut bars are most stressed at the face (x = 0)
  const xTheo = xWhereMoment(dg, remain.phiMn)
  const xExt = xTheo + ext / 12
  const availCut = xExt * 12
  const xCut = Math.max(xExt, i.ld / 12)
  if (dg.kind === 'cant') {
    const endCover = i.endEmbed ?? 2
    const availCont = (L - xTheo) * 12 - endCover
    return { Mmax, all, remain, adequate: all.phiMn >= Mmax - 1e-9, xTheo, ext, extGov, xExt, xCut, ldGoverns: i.ld / 12 > xExt, availCut, availCont, contOK: availCont >= i.ld - 1e-9, fracRemain, fracOK: true }
  }
  const ip = inflectionPoint(dg)
  const ipExt = Math.max(i.d, 12 * br.db, (L * 12) / 16)
  const availCont = (ip - xTheo) * 12 + ipExt
  return {
    Mmax, all, remain, adequate: all.phiMn >= Mmax - 1e-9, xTheo, ext, extGov, xExt, xCut, ldGoverns: i.ld / 12 > xExt, availCut,
    availCont, contOK: availCont >= i.ld - 1e-9, fracRemain, fracOK: fracRemain >= 1 / 3 - 1e-9, ip, ipExt,
  }
}

// ---------------------------------------------------------------- standard cut-off / bend points (Fig. 5.20 / 6.21)
/** distances (ft) from the support faces for approximately equal spans with UDL, L = clear span (ft) */
export function standardCutoffs(L: number) {
  return {
    /** straight bars: top bars at an interior support extend L/3 past the face */
    topInterior: L / 3,
    /** straight bars: top bars at the exterior (spandrel) support extend L/4 */
    topExterior: L / 4,
    /** straight bars: half the bottom bars stop L/8 from each face; the rest run 6 in into the support */
    bottomCut: L / 8,
    /** bent bars: bend-down point L/4 from an interior face, L/7 from the exterior face */
    bendInterior: L / 4,
    bendExterior: L / 7,
    into: 0.5,
  }
}

// ---------------------------------------------------------------- Nilson Tables A.10 / A.11
/** Table A.10 cell: ld/db for uncoated bars, normalweight concrete (rounded to the nearest whole number as printed) */
export function tableA10(fc: number, fyKsi: number, small: boolean, top: boolean, met: boolean) {
  return Math.round(ldSimplified({ db: 1, small, fc, fy: fyKsi * 1000, met, psiT: top ? 1.3 : 1 }).ratio)
}
/** Table A.11 cell: compression ld in inches, basic and confined (× 0.75), min 8 in, rounded as printed */
export function tableA11(no: number, fc: number, fyKsi: number) {
  const r = ldcCalc({ db: BARS[no].d, fc, fy: fyKsi * 1000 })
  return { basic: Math.max(8, Math.round(r.basic)), confined: Math.max(8, Math.round(r.basic * 0.75)) }
}
