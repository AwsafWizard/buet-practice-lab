// CE 315 two-way edge-supported slabs — Moment Coefficient Method (ACI 1963, Nilson Tables 12.3–12.6).
// Class conventions (slab handnote, Recipe 3): la = short CLEAR span, m = la/lb; h = ln(0.8 + fy/200 000)/(36 + 9β) ≥ 3.5 in;
// d = h − 1 (short way, lower layer), long-way positive bars sit on top (d − ½ in); −M at a discontinuous edge = ⅓ (+M);
// middle strip = central half, column strips at 1.5 s (≤ 2h, ≥ As,min); corner steel top & bottom over l_long/5.
// Also: Direct Design Method helpers for the one old paper that prints Table 13.4.

import { BARS } from './materials'
import { barSpacing, depthCheck, extraTop, floorHalf, phiVcSlab, roundSlabH, slabAs, slabLoads, tsAs, type AsResult, type ExtraTop, type Spacing } from './oneway'

// ---------------------------------------------------------------- tables (verified cell by cell against the slides)
export const M_ROWS = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5]
type Cell = [number | null, number | null]

function parse2(raw: string): Cell[][] {
  return raw
    .trim()
    .split('\n')
    .map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((c) => c.split('/').map((v) => (v === '-' ? null : +v)) as Cell),
    )
}
const T123_RAW = `
-/- .045/.045 -/.076 .050/.050 .075/- .071/- -/.071 .033/.061 .061/.033
-/- .050/.041 -/.072 .055/.045 .079/- .075/- -/.067 .038/.056 .065/.029
-/- .055/.037 -/.070 .060/.040 .080/- .079/- -/.062 .043/.052 .068/.025
-/- .060/.031 -/.065 .066/.034 .082/- .083/- -/.057 .049/.046 .072/.021
-/- .065/.027 -/.061 .071/.029 .083/- .086/- -/.051 .055/.041 .075/.017
-/- .069/.022 -/.056 .076/.024 .085/- .088/- -/.044 .061/.036 .078/.014
-/- .074/.017 -/.050 .081/.019 .086/- .091/- -/.038 .068/.029 .081/.011
-/- .077/.014 -/.043 .085/.015 .087/- .093/- -/.031 .074/.024 .083/.008
-/- .081/.010 -/.035 .089/.011 .088/- .095/- -/.024 .080/.018 .085/.006
-/- .084/.007 -/.028 .092/.008 .089/- .096/- -/.019 .085/.014 .086/.005
-/- .086/.006 -/.022 .094/.006 .090/- .097/- -/.014 .089/.010 .088/.003`
const T124_RAW = `
.036/.036 .018/.018 .018/.027 .027/.027 .027/.018 .033/.027 .027/.033 .020/.023 .023/.020
.040/.033 .020/.016 .021/.025 .030/.024 .028/.015 .036/.024 .031/.031 .022/.021 .024/.017
.045/.029 .022/.014 .025/.024 .033/.022 .029/.013 .039/.021 .035/.028 .025/.019 .026/.015
.050/.026 .024/.012 .029/.022 .036/.019 .031/.011 .042/.017 .040/.025 .029/.017 .028/.013
.056/.023 .026/.011 .034/.020 .039/.016 .032/.009 .045/.015 .045/.022 .032/.015 .029/.010
.061/.019 .028/.009 .040/.018 .043/.013 .033/.007 .048/.012 .051/.020 .036/.013 .031/.007
.068/.016 .030/.007 .046/.016 .046/.011 .035/.005 .051/.009 .058/.017 .040/.011 .033/.006
.074/.013 .032/.006 .054/.014 .050/.009 .036/.004 .054/.007 .065/.014 .044/.009 .034/.005
.081/.010 .034/.004 .062/.011 .053/.007 .037/.003 .056/.006 .073/.012 .048/.007 .036/.004
.088/.008 .035/.003 .071/.009 .056/.005 .038/.002 .058/.004 .081/.009 .052/.005 .037/.003
.095/.006 .037/.002 .080/.007 .059/.004 .039/.001 .061/.003 .089/.007 .056/.004 .038/.002`
const T125_RAW = `
.036/.036 .027/.027 .027/.032 .032/.032 .032/.027 .035/.032 .032/.035 .028/.030 .030/.028
.040/.033 .030/.025 .031/.029 .035/.029 .034/.024 .038/.029 .036/.032 .031/.027 .032/.025
.045/.029 .034/.022 .035/.027 .039/.026 .037/.021 .042/.025 .040/.029 .035/.024 .036/.022
.050/.026 .037/.019 .040/.024 .043/.023 .041/.019 .046/.022 .045/.026 .040/.022 .039/.020
.056/.023 .041/.017 .045/.022 .048/.020 .044/.016 .051/.019 .051/.023 .044/.019 .042/.017
.061/.019 .045/.014 .051/.019 .052/.016 .047/.013 .055/.016 .056/.020 .049/.016 .046/.013
.068/.016 .049/.012 .057/.016 .057/.014 .051/.011 .060/.013 .063/.017 .054/.014 .050/.011
.074/.013 .053/.010 .064/.014 .062/.011 .055/.009 .064/.010 .070/.014 .059/.011 .054/.009
.081/.010 .058/.007 .071/.011 .067/.009 .059/.007 .068/.008 .077/.011 .065/.009 .059/.007
.088/.008 .062/.006 .080/.009 .072/.007 .063/.005 .073/.006 .085/.009 .070/.007 .063/.006
.095/.006 .066/.004 .088/.007 .077/.005 .067/.004 .078/.005 .092/.007 .076/.005 .067/.004`
const T126_RAW = `
0.50 0.50 0.17 0.50 0.83 0.71 0.29 0.33 0.67
0.55 0.55 0.20 0.55 0.86 0.75 0.33 0.38 0.71
0.60 0.60 0.23 0.60 0.88 0.79 0.38 0.43 0.75
0.66 0.66 0.28 0.66 0.90 0.83 0.43 0.49 0.79
0.71 0.71 0.33 0.71 0.92 0.86 0.49 0.55 0.83
0.76 0.76 0.39 0.76 0.94 0.88 0.56 0.61 0.86
0.81 0.81 0.45 0.81 0.95 0.91 0.62 0.68 0.89
0.85 0.85 0.53 0.85 0.96 0.93 0.69 0.74 0.92
0.89 0.89 0.61 0.89 0.97 0.95 0.76 0.80 0.94
0.92 0.92 0.69 0.92 0.98 0.96 0.81 0.85 0.95
0.94 0.94 0.76 0.94 0.99 0.97 0.86 0.89 0.97`

/** [m row][case − 1] → [Ca, Cb] (null = "–") */
export const T123 = parse2(T123_RAW)
export const T124 = parse2(T124_RAW)
export const T125 = parse2(T125_RAW)
/** [m row][case − 1] → Wa (Wb = 1 − Wa) */
export const T126 = T126_RAW.trim()
  .split('\n')
  .map((l) => l.trim().split(/\s+/).map(Number))

export type TableId = 't123' | 't124' | 't125'
const TABLES: Record<TableId, Cell[][]> = { t123: T123, t124: T124, t125: T125 }

export type SlabCase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export const CASE_TEXT: Record<SlabCase, string> = {
  1: 'all four edges discontinuous',
  2: 'all four edges continuous',
  3: 'both short edges continuous',
  4: 'one long + one short edge continuous (corner panel)',
  5: 'both long edges continuous',
  6: 'one long edge continuous',
  7: 'one short edge continuous',
  8: 'three edges continuous, one LONG edge discontinuous',
  9: 'three edges continuous, one SHORT edge discontinuous',
}
/** number of continuous [long, short] edges for each case (the pictograms) */
export const CASE_COUNTS: Record<SlabCase, [number, number]> = { 1: [0, 0], 2: [2, 2], 3: [0, 2], 4: [1, 1], 5: [2, 0], 6: [1, 0], 7: [0, 1], 8: [1, 2], 9: [2, 1] }
export function caseFromCounts(nLong: number, nShort: number): SlabCase {
  const c = (Object.keys(CASE_COUNTS) as unknown as SlabCase[]).find((k) => CASE_COUNTS[k][0] === nLong && CASE_COUNTS[k][1] === nShort)
  return +c! as SlabCase
}

/** row position of m (0 = 1.00 … 10 = 0.50), clamped */
const rowPos = (m: number) => Math.min(10, Math.max(0, (1 - m) / 0.05))

/** linear interpolation in Table 12.3 / 12.4 / 12.5 */
export function coef(t: TableId, cs: SlabCase, m: number): { a: number | null; b: number | null } {
  const T = TABLES[t]
  const p = rowPos(m)
  const i = Math.min(9, Math.floor(p + 1e-9))
  const f = p - i
  const lerp = (k: 0 | 1) => {
    const v0 = T[i][cs - 1][k]
    const v1 = T[i + 1][cs - 1][k]
    if (v0 === null || v1 === null) return null
    return v0 + f * (v1 - v0)
  }
  return { a: lerp(0), b: lerp(1) }
}
/** Table 12.6: Wa (share of load carried in the short direction), Wb = 1 − Wa */
export function loadShare(cs: SlabCase, m: number) {
  const p = rowPos(m)
  const i = Math.min(9, Math.floor(p + 1e-9))
  const f = p - i
  const Wa = T126[i][cs - 1] + f * (T126[i + 1][cs - 1] - T126[i][cs - 1])
  return { Wa, Wb: 1 - Wa }
}
/** the table rows bracketing m (for highlighting) */
export function bracketRows(m: number): number[] {
  const p = rowPos(m)
  const i = Math.floor(p + 1e-9)
  return Math.abs(p - i) < 1e-9 ? [i] : [i, i + 1]
}

// ---------------------------------------------------------------- panel geometry → case
export type EdgeName = 'top' | 'right' | 'bottom' | 'left'
export type Edges = Record<EdgeName, boolean>
export const EDGE_NAMES: EdgeName[] = ['top', 'right', 'bottom', 'left']

export function panelCase(lx: number, ly: number, e: Edges) {
  const hTB = e.top ? 1 : 0
  const nTB = hTB + (e.bottom ? 1 : 0)
  const nLR = (e.left ? 1 : 0) + (e.right ? 1 : 0)
  // top/bottom edges have length lx; they are the LONG edges when lx is the long span
  let horizLong: boolean
  if (Math.abs(lx - ly) < 1e-9) horizLong = nTB >= nLR // square: put the continuous edges on the "long" side (handnote F10)
  else horizLong = lx > ly
  const la = Math.min(lx, ly)
  const lb = Math.max(lx, ly)
  const longEdges: EdgeName[] = horizLong ? ['top', 'bottom'] : ['left', 'right']
  const shortEdges: EdgeName[] = horizLong ? ['left', 'right'] : ['top', 'bottom']
  const nLong = longEdges.filter((k) => e[k]).length
  const nShort = shortEdges.filter((k) => e[k]).length
  const cs = caseFromCounts(nLong, nShort)
  const corners: [EdgeName, EdgeName][] = (
    [
      ['top', 'left'],
      ['top', 'right'],
      ['bottom', 'left'],
      ['bottom', 'right'],
    ] as [EdgeName, EdgeName][]
  ).filter(([a, b]) => !e[a] && !e[b])
  return { la, lb, m: la / lb, ratio: lb / la, oneWay: lb / la >= 2, horizLong, longEdges, shortEdges, nLong, nShort, case: cs, corners }
}

// ---------------------------------------------------------------- thickness
/** h = ln(0.8 + fy/200 000)/(36 + 9β) ≥ 3.5 in (αm > 2); ln = long clear span (ft → in), β = long/short */
export function hTwoWay(la: number, lb: number, fy: number) {
  const beta = lb / la
  const raw = (lb * 12 * (0.8 + fy / 200000)) / (36 + 9 * beta)
  const perim = (2 * (la + lb) * 12) / 180
  return { beta, raw, perim, min: Math.max(raw, 3.5), use: roundSlabH(Math.max(raw, 3.5)) }
}

// ---------------------------------------------------------------- design
export interface TwoWayInput {
  /** clear span drawn horizontally / vertically, ft */
  lx: number
  ly: number
  /** true = continuous edge */
  edges: Edges
  ll: number
  ff?: number
  pw?: number
  other?: number
  dlTotal?: number
  fc: number
  fy: number
  h?: number
  bar?: number
  fD?: number
  fL?: number
  /** how much lower the long-way positive bars sit (in); class: ½ in */
  dLongDrop?: number
}

export interface TwSteel {
  key: 'aPos' | 'aNeg' | 'aDisc' | 'bPos' | 'bNeg' | 'bDisc'
  label: string
  Mu: number
  d: number
  as: AsResult
  AsD: number
  usesMin: boolean
}

export function twoWay(p: TwoWayInput) {
  const geo = panelCase(p.lx, p.ly, p.edges)
  const { la, lb, m } = geo
  const cs = geo.case
  const th = hTwoWay(la, lb, p.fy)
  const h = p.h ?? th.use
  const dS = h - 1
  const dL = h - 1 - (p.dLongDrop ?? 0.5)
  const dTop = h - 1
  const loads = slabLoads({ h, ll: p.ll, ff: p.ff, pw: p.pw, other: p.other, dlTotal: p.dlTotal, fD: p.fD, fL: p.fL })
  const cN = coef('t123', cs, m)
  const cD = coef('t124', cs, m)
  const cL = coef('t125', cs, m)
  const { Wa, Wb } = loadShare(cs, m)
  const { wuk, wDk, wLk } = loads
  const aPosDL = cD.a! * wDk * la * la
  const aPosLL = cL.a! * wLk * la * la
  const bPosDL = cD.b! * wDk * lb * lb
  const bPosLL = cL.b! * wLk * lb * lb
  const M = {
    aNeg: cN.a !== null && geo.nLong > 0 ? cN.a * wuk * la * la : null,
    bNeg: cN.b !== null && geo.nShort > 0 ? cN.b * wuk * lb * lb : null,
    aPos: aPosDL + aPosLL,
    bPos: bPosDL + bPosLL,
    aPosDL,
    aPosLL,
    bPosDL,
    bPosLL,
    aDisc: geo.nLong < 2 ? (aPosDL + aPosLL) / 3 : null,
    bDisc: geo.nShort < 2 ? (bPosDL + bPosLL) / 3 : null,
  }
  const AsMin = tsAs(p.fy, h)
  const smax = Math.min(2 * h, 18)
  const bar = p.bar ?? 3
  const Ab = BARS[bar].A
  const mk = (key: TwSteel['key'], label: string, Mu: number | null, d: number): TwSteel | null => {
    if (Mu === null) return null
    const as = slabAs(Mu, d, p.fc, p.fy)
    return { key, label, Mu, d, as, AsD: Math.max(as.As, AsMin), usesMin: as.As < AsMin }
  }
  const st = {
    aPos: mk('aPos', 'Short dir, midspan (bottom)', M.aPos, dS)!,
    aNeg: mk('aNeg', 'Short dir, continuous edge (top)', M.aNeg, dTop),
    aDisc: mk('aDisc', 'Short dir, discontinuous edge (top)', M.aDisc, dTop),
    bPos: mk('bPos', 'Long dir, midspan (bottom)', M.bPos, dL)!,
    bNeg: mk('bNeg', 'Long dir, continuous edge (top)', M.bNeg, dTop),
    bDisc: mk('bDisc', 'Long dir, discontinuous edge (top)', M.bDisc, dTop),
  }
  const steel = Object.values(st).filter((x): x is TwSteel => x !== null)
  const Mmax = Math.max(...steel.map((x) => x.Mu))
  const depth = depthCheck(Mmax, p.fc, p.fy)
  // middle strip bottom bars, alternate cranked; extra top at the edges
  const midA = barSpacing(st.aPos.AsD, bar, smax)
  const midB = barSpacing(st.bPos.AsD, bar, smax)
  const ex = (s: TwSteel | null, sp: Spacing): ExtraTop | null => (s ? extraTop(s.AsD, sp.s, bar) : null)
  const extra = { aNeg: ex(st.aNeg, midA), aDisc: ex(st.aDisc, midA), bNeg: ex(st.bNeg, midB), bDisc: ex(st.bDisc, midB) }
  // column strips: 1.5 × middle-strip spacing, ≤ 2h, and not less steel than As,min
  const sMinRaw = (Ab * 12) / AsMin
  const colOf = (mid: Spacing) => {
    const s15 = 1.5 * mid.s
    return { s15, sMin: sMinRaw, s2h: smax, s: floorHalf(Math.min(s15, sMinRaw, smax)) }
  }
  const col = { a: colOf(midA), b: colOf(midB) }
  // column-strip top steel at continuous edges: ⅔ of the middle-strip steel, ≥ As,min (class slides)
  const colTopOf = (s: TwSteel | null, sc: number) => {
    if (!s) return null
    const As = Math.max((2 / 3) * s.as.As, AsMin)
    return { As23: (2 / 3) * s.as.As, As, extra: extraTop(As, sc, bar) }
  }
  const colTop = { a: colTopOf(st.aNeg, col.a.s), b: colTopOf(st.bNeg, col.b.s) }
  // corner reinforcement = steel for the maximum positive moment, top & bottom, both ways, over lb/5
  const cornerSrc = M.bPos > M.aPos + 1e-9 ? st.bPos : st.aPos
  const corner = { from: cornerSrc.key, As: cornerSrc.AsD, sp: barSpacing(cornerSrc.AsD, bar, smax), zone: lb / 5, corners: geo.corners }
  // Table 12.6: load to the supporting beams and slab shear
  const W = wuk * la * lb
  const wLongBeam = (Wa * W) / (2 * lb)
  const wShortBeam = (Wb * W) / (2 * la)
  const phiVc = phiVcSlab(p.fc, dS)
  const Vu = Math.max(wLongBeam, wShortBeam)
  // straight-bar alternative: top bars at their own spacing
  const straight = {
    aNeg: st.aNeg ? barSpacing(st.aNeg.AsD, bar, smax) : null,
    aDisc: st.aDisc ? barSpacing(st.aDisc.AsD, bar, smax) : null,
    bNeg: st.bNeg ? barSpacing(st.bNeg.AsD, bar, smax) : null,
    bDisc: st.bDisc ? barSpacing(st.bDisc.AsD, bar, smax) : null,
  }
  // bend / cut-off (slides): bend l/4 from a continuous edge, l/7 from a discontinuous one; top bars l/3 past the face
  const cutoffs = { a: { bendCont: la / 4, bendDisc: la / 7, topExt: la / 3 }, b: { bendCont: lb / 4, bendDisc: lb / 7, topExt: lb / 3 } }
  // strips: short-way bars have middle strip lb/2 and column strips lb/4; long-way bars la/2 and la/4
  const strips = { aMid: lb / 2, aCol: lb / 4, bMid: la / 2, bCol: la / 4 }
  return {
    input: p,
    geo,
    case: cs,
    m,
    th,
    h,
    hGiven: p.h !== undefined,
    d: { short: dS, long: dL, top: dTop },
    loads,
    C: { aNeg: cN.a, bNeg: cN.b, aDL: cD.a!, bDL: cD.b!, aLL: cL.a!, bLL: cL.b!, Wa, Wb },
    M,
    Mmax,
    depth,
    AsMin,
    smax,
    bar,
    st,
    steel,
    midA,
    midB,
    extra,
    col,
    colTop,
    corner,
    beams: { W, Wa, Wb, wLongBeam, wShortBeam },
    shear: { Vu, phiVc, ok: phiVc >= Vu, d: dS, phiVc65: phiVcSlab(p.fc, h - 0.5) },
    straight,
    cutoffs,
    strips,
  }
}
export type TwoWayResult = ReturnType<typeof twoWay>

// ---------------------------------------------------------------- Direct Design Method (Table 13.4) — old-paper helper
export type DdmKind = 'intNeg' | 'extNeg' | 'pos'
const L2L1 = [0.5, 1, 2]
const lerp3 = (vals: number[], r: number) => {
  const x = Math.min(2, Math.max(0.5, r))
  const i = x <= 1 ? 0 : 1
  const t = (x - L2L1[i]) / (L2L1[i + 1] - L2L1[i])
  return vals[i] + t * (vals[i + 1] - vals[i])
}
/** column-strip % of the total moment at the critical section (ACI / Nilson Table 13.4), interpolated in l2/l1, αf1·l2/l1 (0 → 1) and βt (0 → 2.5) */
export function ddmColumnStrip(kind: DdmKind, l2l1: number, alphaL: number, betaT = 0) {
  const ta = Math.min(1, Math.max(0, alphaL))
  const stiff = lerp3([90, 75, 45], l2l1)
  if (kind === 'intNeg') return 75 + ta * (stiff - 75)
  if (kind === 'pos') return 60 + ta * (stiff - 60)
  const tb = Math.min(1, Math.max(0, betaT / 2.5))
  const at0 = 100 + tb * (75 - 100)
  const at1 = 100 + tb * (stiff - 100)
  return at0 + ta * (at1 - at0)
}
/** total static moment Mo = wu l2 ln² / 8 (k-ft) with wu in k/ft² */
export const ddmMo = (wuKsf: number, l2: number, ln: number) => (wuKsf * l2 * ln * ln) / 8
