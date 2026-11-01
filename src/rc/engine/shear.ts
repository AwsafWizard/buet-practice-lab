// CE 315 shear & diagonal tension (Nilson Ch 5, ACI 318, the class's Case A–D method).
// Units: ft for positions along the beam, in for section and stirrup spacing, kip for forces,
// f'c and fy in psi (as in materials.ts). √f'c is in psi and capped at 100 psi (ACI 22.5.3.1).

import { BARS } from './materials'

// ---------------------------------------------------------------- loads and the shear diagram
export interface PointLoad {
  /** ft from the LEFT END of the beam (for a cantilever: from the fixed end) */
  x: number
  /** dead (or already-factored) part, kip */
  P: number
  /** live part, kip (unfactored) */
  PL?: number
}

export interface ShearBeam {
  /** 'ss' = two supports (overhangs allowed); 'cant' = fixed at x = 0, free at x = L */
  kind: 'ss' | 'cant'
  /** span between supports, or the cantilever length (ft) */
  L: number
  /** left / right overhang beyond the support centreline (ft, ss only) */
  ohL?: number
  ohR?: number
  /** uniform dead and live load over the whole length (k/ft) */
  wD?: number
  wL?: number
  P?: PointLoad[]
  /** loads are already factored: used as given (self-weight is still multiplied by swFactor) */
  factored?: boolean
  /** default 1.2 / 1.6; 1.4D is also checked when the loads are not factored */
  fD?: number
  fL?: number
  /** add the self-weight of a bw × h rectangle (in) at 150 pcf as dead load */
  selfWeight?: { b: number; h: number }
  /** load factor on the self-weight when `factored` (default 1.2) */
  swFactor?: number
  /** live load on any combination of segments (span / overhangs): envelope */
  patterns?: boolean
  /** support width (in): the support face is at centreline ± width/2 */
  supportWidth?: number
}

interface DistLoad {
  a: number
  b: number
  w: number
}
interface LoadCase {
  name: string
  /** max factors with live load everywhere */
  full: boolean
  dist: DistLoad[]
  pts: { x: number; P: number }[]
}

export interface ShearDiagram {
  Ltot: number
  /** support centrelines (ft from the left end) */
  supports: number[]
  fixed: boolean
  /** support face positions [left face, right face] for each support */
  faces: [number, number][]
  /** self-weight (unfactored, k/ft) */
  wsw: number
  /** factored UDL of the full-load case (k/ft) */
  wu: number
  /** factored point loads of the full-load case */
  Pu: { x: number; P: number }[]
  /** reactions of the full-load case (kip), in support order */
  R: number[]
  cases: string[]
  /** V just right (side 'R') or just left (side 'L') of x, for every load case */
  Vcase: (x: number, side?: 'L' | 'R') => number[]
  /** full-load case (max factors, live everywhere) */
  V: (x: number, side?: 'L' | 'R') => number
  /** envelope of all cases */
  Vmax: (x: number, side?: 'L' | 'R') => number
  Vmin: (x: number, side?: 'L' | 'R') => number
  /** |V| design envelope */
  Vabs: (x: number, side?: 'L' | 'R') => number
  /** polyline of the full-load case (duplicate x at jumps) */
  pts: { x: number; V: number }[]
  /** sampled envelope */
  env: { x: number; Vmax: number; Vmin: number }[]
  /** x of every point load, support and segment end */
  breaks: number[]
  /** segments that can carry live load independently */
  segments: { name: string; a: number; b: number }[]
}

const EPS = 1e-9
const GAMMA = 0.15 // k/ft³

export function selfWeight(b: number, h: number) {
  return ((b * h) / 144) * GAMMA
}

export function beamGeometry(bm: ShearBeam) {
  if (bm.kind === 'cant') return { Ltot: bm.L, supports: [0], segments: [{ name: 'cantilever', a: 0, b: bm.L }] }
  const ohL = bm.ohL ?? 0,
    ohR = bm.ohR ?? 0
  const A = ohL,
    B = ohL + bm.L
  const segments = [
    ...(ohL > EPS ? [{ name: 'left overhang', a: 0, b: A }] : []),
    { name: 'span', a: A, b: B },
    ...(ohR > EPS ? [{ name: 'right overhang', a: B, b: B + ohR }] : []),
  ]
  return { Ltot: B + ohR, supports: [A, B], segments }
}

function buildCases(bm: ShearBeam): LoadCase[] {
  const { Ltot, segments } = beamGeometry(bm)
  const wsw = bm.selfWeight ? selfWeight(bm.selfWeight.b, bm.selfWeight.h) : 0
  const P = bm.P ?? []
  const wD = bm.wD ?? 0,
    wL = bm.wL ?? 0
  const combos: { name: string; fD: number; fL: number; fsw: number }[] = bm.factored
    ? [{ name: 'factored', fD: 1, fL: 1, fsw: bm.swFactor ?? 1.2 }]
    : [
        { name: `${bm.fD ?? 1.2}D + ${bm.fL ?? 1.6}L`, fD: bm.fD ?? 1.2, fL: bm.fL ?? 1.6, fsw: bm.fD ?? 1.2 },
        ...((bm.fD ?? 1.2) < 1.4 ? [{ name: '1.4D', fD: 1.4, fL: 0, fsw: 1.4 }] : []),
      ]
  const hasLive = wL > 0 || P.some((p) => (p.PL ?? 0) !== 0)
  const pats: boolean[][] = []
  const nseg = segments.length
  if (bm.patterns && hasLive && nseg > 1) {
    for (let m = 1; m < 1 << nseg; m++) pats.push(segments.map((_, i) => !!(m & (1 << i))))
  } else pats.push(segments.map(() => true))
  const segOf = (x: number) => Math.max(0, segments.findIndex((s) => x >= s.a - EPS && x <= s.b + EPS))
  const out: LoadCase[] = []
  for (const [ci, c] of combos.entries()) {
    const live = c.fL > 0 && hasLive ? pats : [pats[pats.length - 1]]
    for (const pat of live) {
      const dist: DistLoad[] = []
      const wd = c.fD * wD + c.fsw * wsw
      if (wd) dist.push({ a: 0, b: Ltot, w: wd })
      if (wL && c.fL) segments.forEach((s, i) => pat[i] && dist.push({ a: s.a, b: s.b, w: c.fL * wL }))
      const pts = P.map((p) => ({ x: p.x, P: c.fD * p.P + (pat[segOf(p.x)] ? c.fL * (p.PL ?? 0) : 0) })).filter((p) => p.P !== 0)
      const name = live.length > 1 ? `${c.name}, LL on ${segments.filter((_, i) => pat[i]).map((s) => s.name).join(' + ')}` : c.name
      out.push({ name, full: ci === 0 && pat.every(Boolean), dist, pts })
    }
  }
  return out
}

function reactions(bm: ShearBeam, lc: LoadCase, supports: number[]): number[] {
  const tot = lc.dist.reduce((s, d) => s + d.w * (d.b - d.a), 0) + lc.pts.reduce((s, p) => s + p.P, 0)
  if (bm.kind === 'cant') return [tot]
  const [A, B] = supports
  const mA = lc.dist.reduce((s, d) => s + d.w * (d.b - d.a) * ((d.a + d.b) / 2 - A), 0) + lc.pts.reduce((s, p) => s + p.P * (p.x - A), 0)
  const RB = mA / (B - A)
  return [tot - RB, RB]
}

function shearOf(lc: LoadCase, R: number[], supports: number[], x: number, side: 'L' | 'R') {
  // V just right of x (side R) includes everything at x; side L excludes it
  const inc = (p: number) => (side === 'R' ? p <= x + EPS : p < x - EPS)
  let V = 0
  supports.forEach((s, i) => inc(s) && (V += R[i]))
  for (const p of lc.pts) if (inc(p.x)) V -= p.P
  for (const d of lc.dist) {
    const e = Math.min(d.b, x)
    if (e > d.a) V -= d.w * (e - d.a)
  }
  return V
}

export function shearDiagram(bm: ShearBeam): ShearDiagram {
  const { Ltot, supports, segments } = beamGeometry(bm)
  const cases = buildCases(bm)
  const Rs = cases.map((lc) => reactions(bm, lc, supports))
  const Vcase = (x: number, side: 'L' | 'R' = 'R') => cases.map((lc, i) => shearOf(lc, Rs[i], supports, x, side))
  // full-load case = the first case with live everywhere (patterns list ends with "all")
  const fi = Math.max(0, cases.findIndex((c) => c.full))
  const V = (x: number, side: 'L' | 'R' = 'R') => shearOf(cases[fi], Rs[fi], supports, x, side)
  const Vmax = (x: number, side: 'L' | 'R' = 'R') => Math.max(...Vcase(x, side))
  const Vmin = (x: number, side: 'L' | 'R' = 'R') => Math.min(...Vcase(x, side))
  const Vabs = (x: number, side: 'L' | 'R' = 'R') => Math.max(Math.abs(Vmax(x, side)), Math.abs(Vmin(x, side)))
  const breaks = [...new Set([0, Ltot, ...supports, ...segments.flatMap((s) => [s.a, s.b]), ...(bm.P ?? []).map((p) => p.x)].map((v) => +v.toFixed(6)))].sort((a, b) => a - b)
  const pts: { x: number; V: number }[] = []
  for (const b of breaks) {
    if (b > 0) pts.push({ x: b, V: V(b, 'L') })
    if (b < Ltot) pts.push({ x: b, V: V(b, 'R') })
  }
  const N = 240
  const xs = [...new Set([...breaks, ...Array.from({ length: N + 1 }, (_, i) => (i / N) * Ltot)])].sort((a, b) => a - b)
  const env: ShearDiagram['env'] = []
  for (const x of xs) {
    if (x > 0) env.push({ x, Vmax: Vmax(x, 'L'), Vmin: Vmin(x, 'L') })
    if (x < Ltot) env.push({ x, Vmax: Vmax(x, 'R'), Vmin: Vmin(x, 'R') })
  }
  const w = (bm.supportWidth ?? 0) / 12 / 2
  const faces: [number, number][] = supports.map((s) => [s - w, s + w])
  if (bm.kind === 'cant') faces[0] = [0, 0]
  const fc = cases[fi]
  const midX = bm.kind === 'cant' ? bm.L / 2 : (supports[0] + supports[1]) / 2
  return {
    Ltot,
    supports,
    fixed: bm.kind === 'cant',
    faces,
    wsw: bm.selfWeight ? selfWeight(bm.selfWeight.b, bm.selfWeight.h) : 0,
    wu: fc.dist.filter((d) => d.a <= midX + EPS && d.b >= midX - EPS).reduce((s, d) => s + d.w, 0),
    Pu: fc.pts,
    R: Rs[fi],
    cases: cases.map((c) => c.name),
    Vcase,
    V,
    Vmax,
    Vmin,
    Vabs,
    pts,
    env,
    breaks,
    segments,
  }
}

// ---------------------------------------------------------------- section capacity and the Case A–D method
export interface ShearSection {
  bw: number
  d: number
  /** psi */
  fc: number
  /** stirrup yield strength fyt, psi (≤ 60 000) */
  fy: number
  lambda?: number
  /** 0.75 (ACI 318-02 onward); papers before 2013 used 0.85 */
  phi?: number
  /** stirrup area Av of all legs, in² (default #3 two-legged = 0.22) */
  Av?: number
}

export const stirrupAv = (bar: number, legs: number) => legs * BARS[bar].A

export type ShearCase = 'A' | 'B' | 'C' | 'D' | 'redesign'

export interface ShearLimits {
  phi: number
  lambda: number
  /** √f'c in psi (≤ 100) */
  sqrtFc: number
  /** kip */
  Vc: number
  phiVc: number
  halfPhiVc: number
  /** 4√f'c bw d and 8√f'c bw d (kip) */
  Vs4: number
  Vs8: number
  phiVs4: number
  phiVs8: number
  /** Vu above which the section must be enlarged: φVc + φ8√f'c bw d (= φ10√f'c bw d for λ = 1) */
  VuMax: number
  /** minimum Av/s terms (in²/in) */
  avsMin1: number
  avsMin2: number
  avsMin: number
  Av: number
  /** max spacings (in) */
  smaxC: number
  smaxD: number
  /** spacing given by Av,min (in) */
  sMinSteel: number
}

export function shearLimits(sec: ShearSection): ShearLimits {
  const phi = sec.phi ?? 0.75
  const lambda = sec.lambda ?? 1
  const sqrtFc = Math.min(Math.sqrt(sec.fc), 100)
  const { bw, d, fy } = sec
  const Vc = (2 * lambda * sqrtFc * bw * d) / 1000
  const Vs4 = (4 * sqrtFc * bw * d) / 1000
  const Vs8 = (8 * sqrtFc * bw * d) / 1000
  const avsMin1 = (0.75 * Math.sqrt(sec.fc) * bw) / fy
  const avsMin2 = (50 * bw) / fy
  const avsMin = Math.max(avsMin1, avsMin2)
  const Av = sec.Av ?? 0.22
  return {
    phi,
    lambda,
    sqrtFc,
    Vc,
    phiVc: phi * Vc,
    halfPhiVc: (phi * Vc) / 2,
    Vs4,
    Vs8,
    phiVs4: phi * Vs4,
    phiVs8: phi * Vs8,
    VuMax: phi * (Vc + Vs8),
    avsMin1,
    avsMin2,
    avsMin,
    Av,
    smaxC: Math.min(d / 2, 24),
    smaxD: Math.min(d / 4, 12),
    sMinSteel: Av / avsMin,
  }
}

export interface ShearAt {
  Vu: number
  case: ShearCase
  /** φVs = Vu − φVc (kip, 0 if negative) */
  phiVs: number
  Vs: number
  /** (Vu − φVc)/(φ fy d), in²/in */
  avsExcess: number
  avsMin1: number
  avsMin2: number
  /** governing Av/s (in²/in), 0 in Case A */
  avs: number
  /** Av / (Av/s), in (Infinity in Case A) */
  sCalc: number
  /** d/2 & 24 in (B, C) or d/4 & 12 in (D) */
  sMax: number
  /** min(sCalc, sMax) */
  s: number
  /** which term governed s */
  gov: 'excess' | 'minimum' | 'smax' | 'none'
}

/** classify Vu and get the required stirrup spacing (class Case method, slides 47–50) */
export function shearAt(Vu: number, sec: ShearSection): ShearAt {
  const k = shearLimits(sec)
  Vu = Math.abs(Vu)
  const phiVs = Math.max(0, Vu - k.phiVc)
  const Vs = phiVs / k.phi
  const avsExcess = (phiVs * 1000) / (k.phi * sec.fy * sec.d)
  let cs: ShearCase
  if (Vu <= k.halfPhiVc + EPS) cs = 'A'
  else if (Vu <= k.phiVc + EPS) cs = 'B'
  else if (Vs <= k.Vs4 + EPS) cs = 'C'
  else if (Vs <= k.Vs8 + EPS) cs = 'D'
  else cs = 'redesign'
  if (cs === 'A' || cs === 'redesign')
    return { Vu, case: cs, phiVs, Vs, avsExcess, avsMin1: k.avsMin1, avsMin2: k.avsMin2, avs: 0, sCalc: Infinity, sMax: cs === 'A' ? Infinity : k.smaxD, s: cs === 'A' ? Infinity : 0, gov: 'none' }
  const avs = cs === 'B' ? k.avsMin : Math.max(avsExcess, k.avsMin)
  const sCalc = k.Av / avs
  const sMax = cs === 'D' ? k.smaxD : k.smaxC
  const s = Math.min(sCalc, sMax)
  const gov = sMax <= sCalc ? 'smax' : cs !== 'B' && avsExcess >= k.avsMin ? 'excess' : 'minimum'
  return { Vu, case: cs, phiVs, Vs, avsExcess, avsMin1: k.avsMin1, avsMin2: k.avsMin2, avs, sCalc, sMax, s, gov }
}

/** inclined stirrups / bent bars (Eq 5.14b, lecture only): s = φAv fy d (sin α + cos α)/(Vu − φVc); s_max = (3/8)d(1 + cot α) */
export function sInclined(Vu: number, sec: ShearSection, alphaDeg: number) {
  const k = shearLimits(sec)
  const a = (alphaDeg * Math.PI) / 180
  const s = (k.phi * k.Av * sec.fy * sec.d * (Math.sin(a) + Math.cos(a))) / ((Vu - k.phiVc) * 1000)
  const sMax = (3 / 8) * sec.d * (1 + 1 / Math.tan(a))
  return { s, sMax }
}

/** no web steel: Vu ≤ ½φVc ⇒ bw d ≥ Vu/(½φ2λ√f'c); with Av,min: Vu ≤ φVc (Ex 5.1) */
export function bwdRequired(Vu: number, fc: number, opts: { phi?: number; lambda?: number; withMin?: boolean } = {}) {
  const phi = opts.phi ?? 0.75
  const lam = opts.lambda ?? 1
  const k = opts.withMin ? 1 : 0.5
  return (Vu * 1000) / (k * phi * 2 * lam * Math.min(Math.sqrt(fc), 100))
}

export const roundDown = (v: number, step = 0.5) => Math.floor(v / step + 1e-9) * step

// ---------------------------------------------------------------- runs, required spacing and zones
/** a stretch laid out from one support face toward the point of least shear (or the free end) */
export interface ShearRun {
  id: string
  label: string
  /** x of the support face (ft) */
  face: number
  dir: 1 | -1
  /** length from the face to the run end (in) */
  len: number
  /** the run ends at the zero-shear point of a span (meets the run from the other support) */
  toSplit: boolean
  /** critical-section shear (at d, or at the face if a point load is within d) */
  Vface: number
  Vd: number
  critAtFace: boolean
  /** design shear at u (in from the face), with Vu held at Vd inside d */
  VuAt: (u: number) => number
  /** raw |V| at u */
  VrawAt: (u: number) => number
  /** required spacing at u (in), Infinity where no stirrups are required */
  sReq: (u: number) => number
  /** stirrups required up to here (in from the face) */
  uReqEnd: number
  /** distances (in from the face) where Vu crosses φVc, φVc/2 and where s_max starts to govern; null if not in the run */
  uPhiVc: number | null
  uHalf: number | null
  uSmax: number | null
  /** point loads inside the run (in from the face) */
  uLoads: number[]
  /** smallest required spacing in the run */
  sMin: number
  /** cases present (in order from the face) */
  cases: ShearCase[]
  redesign: boolean
  /** sReq sampled every 0.05 in from the face (cache for the layout search) */
  sSamples: Float64Array
}

export interface ShearDesignOpts {
  /** provide nominal stirrups at s_max where Case A (good practice, slides p60); default false = class "none" */
  nominal?: boolean
}

const STEP = 0.05 // in

function x2u(face: number, dir: 1 | -1, x: number) {
  return dir * (x - face) * 12
}

export function shearRuns(dg: ShearDiagram, bm: ShearBeam, sec: ShearSection, opts: ShearDesignOpts = {}): ShearRun[] {
  const k = shearLimits(sec)
  const runs: { id: string; label: string; face: number; dir: 1 | -1; end: number; toSplit: boolean }[] = []
  if (dg.fixed) runs.push({ id: 'c', label: 'Cantilever (from the fixed end)', face: 0, dir: 1, end: dg.Ltot, toSplit: false })
  else {
    const [A, B] = dg.supports
    const [aL, aR] = dg.faces[0]
    const [bL, bR] = dg.faces[1]
    if (A > EPS) runs.push({ id: 'ohL', label: 'Left overhang', face: aL, dir: -1, end: 0, toSplit: false })
    // split of the span at the zero-shear point of the full-load case
    let split = (A + B) / 2
    const N = 400
    let found = false
    for (let i = 0; i <= N && !found; i++) {
      const x = aR + ((bL - aR) * i) / N
      const vl = dg.V(x, 'L'),
        vr = dg.V(x, 'R')
      if (i > 0 && vl >= -EPS && vr <= EPS) {
        // zero inside [prev, x] or a jump at x
        if (vl > EPS && vr < -EPS) split = x
        else {
          const x0 = aR + ((bL - aR) * (i - 1)) / N
          const v0 = dg.V(x0, 'R')
          split = Math.abs(v0 - vl) < EPS ? x : x0 + ((x - x0) * v0) / (v0 - vl)
          if (Math.abs(vr) < EPS && Math.abs(vl) < EPS) split = x
        }
        found = true
      }
    }
    if (!found) split = Math.abs(dg.V(aR, 'R')) < Math.abs(dg.V(bL, 'L')) ? aR : bL
    runs.push({ id: 'sL', label: 'Span, from the left support', face: aR, dir: 1, end: split, toSplit: true })
    runs.push({ id: 'sR', label: 'Span, from the right support', face: bL, dir: -1, end: split, toSplit: true })
    if (dg.Ltot - B > EPS) runs.push({ id: 'ohR', label: 'Right overhang', face: bR, dir: 1, end: dg.Ltot, toSplit: false })
  }
  const loads = (bm.P ?? []).map((p) => p.x)
  return runs
    .map((r) => {
      const len = Math.max(0, x2u(r.face, r.dir, r.end))
      // |V| at u, side nearer the face
      const VrawAt = (u: number) => {
        const x = r.face + (r.dir * u) / 12
        return dg.Vabs(x, r.dir === 1 ? 'L' : 'R')
      }
      const Vface = dg.Vabs(r.face, r.dir === 1 ? 'R' : 'L')
      const uLoads = loads.map((x) => x2u(r.face, r.dir, x)).filter((u) => u > EPS && u < len - EPS)
      const critAtFace = uLoads.some((u) => u <= sec.d + EPS) || len < sec.d
      const Vd = critAtFace ? Vface : VrawAt(sec.d)
      const VuAt = (u: number) => (u <= sec.d ? (critAtFace ? Vface : Vd) : VrawAt(u))
      const sReq = (u: number) => {
        const a = shearAt(VuAt(u), sec)
        if (a.case === 'A') return opts.nominal ? k.smaxC : Infinity
        if (a.case === 'redesign') return 0
        return a.s
      }
      // scan
      let uReqEnd = 0,
        uPhiVc: number | null = null,
        uHalf: number | null = null,
        uSmax: number | null = null,
        sMin = Infinity,
        redesign = false
      const cases: ShearCase[] = []
      // Vu at which the excess-shear spacing reaches s_max (Case C limits)
      const VsmaxStar = k.phiVc + (k.phi * k.Av * sec.fy * sec.d) / (Math.min(k.smaxC, k.sMinSteel) * 1000)
      const n = Math.ceil(len / STEP)
      let prev: { u: number; V: number; s: number } | null = null
      const sSamples = new Float64Array(n + 1)
      for (let i = 0; i <= n; i++) {
        const u = Math.min(len, i * STEP)
        const V = VuAt(u)
        const a = shearAt(V, sec)
        if (!cases.includes(a.case)) cases.push(a.case)
        if (a.case === 'redesign') redesign = true
        const s = sReq(u)
        sSamples[i] = s
        if (Number.isFinite(s)) {
          uReqEnd = u
          sMin = Math.min(sMin, s)
        }
        if (prev) {
          const cross = (lvl: number) => prev!.V > lvl + EPS && V <= lvl + EPS
          const at = (lvl: number) => (Math.abs(prev!.V - V) < 1e-6 ? u : prev!.u + ((u - prev!.u) * (prev!.V - lvl)) / (prev!.V - V))
          if (uPhiVc === null && cross(k.phiVc)) uPhiVc = at(k.phiVc)
          if (uHalf === null && cross(k.halfPhiVc)) uHalf = at(k.halfPhiVc)
          if (uSmax === null && cross(VsmaxStar)) uSmax = at(VsmaxStar)
        }
        prev = { u, V, s }
      }
      if (opts.nominal) uReqEnd = len
      else if (Number.isFinite(sReq(uReqEnd)) && uReqEnd < len - STEP) {
        // refine to the φVc/2 crossing
        uReqEnd = uHalf !== null && uHalf >= uReqEnd - STEP ? uHalf : uReqEnd
      }
      return { ...r, len, Vface, Vd, critAtFace, VuAt, VrawAt, sReq, uReqEnd, uPhiVc, uHalf, uSmax, uLoads, sMin, cases, redesign, sSamples } as ShearRun & { end: number }
    })
    .filter((r) => r.len > EPS)
}

/** first u from which spacing s satisfies the requirement everywhere to the end of the run */
export function validFrom(run: ShearRun, s: number) {
  const ss = run.sSamples
  for (let i = ss.length - 1; i >= 0; i--) if (ss[i] < s - 1e-6) return Math.min(run.len, (i + 1) * STEP)
  return 0
}

export interface Zone {
  s: number
  /** number of spaces at s */
  n: number
  /** from / to (in from the face) */
  from: number
  to: number
}

export interface RunLayout {
  /** first stirrup from the face (in) */
  first: number
  zones: Zone[]
  /** stirrup positions (in from the face) */
  pos: number[]
  count: number
  /** last stirrup (in from the face) */
  last: number
}

/** practical first stirrup: s/2 rounded down to the inch, but not less than 2 in (book: 2 in for s = 5, 3 in for s = 7) */
export const firstSpace = (s1: number) => Math.min(s1, Math.max(2, Math.floor(s1 / 2 + 1e-9)))

/**
 * Lay out zones with the given spacings (ascending): each zone runs until the next spacing becomes adequate
 * (the space centred on that point), the last one until the end of the required region (last stirrup within s/2 of it).
 * Reproduces Nilson Ex 5.3: [5, 7, 11] → 2 in + 7 @ 5 + 2 @ 7 + 4 @ 11 = 95 in.
 */
export function layoutRun(run: ShearRun, spacings: number[], first?: number): RunLayout {
  const sp = [...spacings].filter((s) => s > 0).sort((a, b) => a - b)
  if (!sp.length || run.uReqEnd <= EPS) return { first: 0, zones: [], pos: [], count: 0, last: 0 }
  const f = first ?? firstSpace(sp[0])
  let pos = f
  const out: number[] = [f]
  const zones: Zone[] = []
  const cap = run.toSplit ? run.len : Infinity
  for (let k = 0; k < sp.length; k++) {
    const s = sp[k]
    let n: number
    if (k < sp.length - 1) {
      const B = validFrom(run, sp[k + 1])
      n = Math.max(0, Math.ceil((Math.min(B - sp[k + 1] / 2, run.uReqEnd - s / 2) - pos) / s - 1e-6))
    } else {
      n = Math.max(0, Math.ceil((run.uReqEnd - s / 2 - pos) / s - 1e-6))
    }
    n = Math.max(0, Math.min(n, Math.floor((cap - pos) / s + 1e-6)))
    if (n > 0) {
      zones.push({ s, n, from: pos, to: pos + n * s })
      for (let i = 1; i <= n; i++) out.push(pos + i * s)
      pos += n * s
    }
  }
  return { first: f, zones, pos: out, count: out.length, last: pos }
}

/** stirrup positions for a user layout (first + zones as {s, n}) */
export function positionsOf(first: number, zones: { s: number; n: number }[]): RunLayout {
  let pos = first
  const out = [first]
  const zs: Zone[] = []
  for (const z of zones) {
    if (!(z.n > 0 && z.s > 0)) continue
    zs.push({ s: z.s, n: z.n, from: pos, to: pos + z.n * z.s })
    for (let i = 1; i <= z.n; i++) out.push(pos + i * z.s)
    pos += z.n * z.s
  }
  return { first, zones: zs, pos: out, count: out.length, last: pos }
}

export interface SpaceCheck {
  from: number
  to: number
  s: number
  /** required spacing at the middle of the space */
  req: number
  ok: boolean
}

export interface LayoutCheck {
  spaces: SpaceCheck[]
  firstOk: boolean
  /** last stirrup within s/2 of the end of the required region */
  coverOk: boolean
  /** smallest spacing below the practical 3 in */
  tooClose: boolean
  ok: boolean
}

/** check a layout: each space ≤ the required spacing at its middle; first stirrup ≤ max(2 in, s/2); coverage to the end of the required region */
export function checkLayout(run: ShearRun, lay: RunLayout, tol = 0.02): LayoutCheck {
  const spaces: SpaceCheck[] = []
  const ps = lay.pos
  for (let i = 1; i < ps.length; i++) {
    const a = ps[i - 1],
      b = ps[i]
    const s = b - a
    const req = run.sReq(Math.min(run.len, (a + b) / 2))
    spaces.push({ from: a, to: b, s, req, ok: s <= req + tol })
  }
  const s1 = spaces[0]?.s ?? lay.first * 2
  const firstOk = run.uReqEnd <= EPS || (ps.length > 0 && lay.first <= Math.max(2, s1 / 2) + tol && lay.first <= run.sReq(0) + tol)
  const sLast = spaces.length ? spaces[spaces.length - 1].s : run.sReq(0)
  const coverOk = run.uReqEnd <= EPS || (ps.length > 0 && lay.last >= run.uReqEnd - sLast / 2 - tol) || (run.toSplit && lay.last >= run.len - sLast / 2 - tol)
  const tooClose = spaces.some((x) => x.s < 3 - tol)
  return { spaces, firstOk, coverOk, tooClose, ok: spaces.every((x) => x.ok) && firstOk && coverOk }
}

/** choose up to `nSets` spacings (rounded down to `step`) giving the fewest stirrups; the smallest is the required s at the critical section, the largest the largest needed; a middle spacing is kept only if it saves stirrups */
export function autoSpacings(run: ShearRun, nSets = 3, step = 0.5): number[] {
  if (run.uReqEnd <= EPS || !Number.isFinite(run.sMin) || run.sMin <= 0) return []
  const s1 = roundDown(run.sMin, step)
  // largest spacing ever required within the required region
  let sHi = 0
  const n = Math.min(run.sSamples.length - 1, Math.floor(run.uReqEnd / STEP + 1e-9))
  for (let i = 0; i <= n; i++) {
    const s = run.sSamples[i]
    if (Number.isFinite(s)) sHi = Math.max(sHi, s)
  }
  const sN = roundDown(sHi, step)
  if (sN <= s1 + EPS || nSets <= 1) return [s1]
  if (nSets === 2) return [s1, sN]
  // brute force the middle spacings (whole inches look like the book; fall back to `step`)
  const cand: number[] = []
  for (let s = Math.ceil(s1 + EPS); s < sN - EPS; s += 1) cand.push(s)
  if (!cand.length) for (let s = s1 + step; s < sN - EPS; s += step) cand.push(s)
  const mids = nSets - 2
  let best: number[] = [s1, sN],
    bestCount = layoutRun(run, best).count,
    bestScore = Infinity
  const combos = (start: number, left: number, acc: number[]) => {
    if (left === 0) {
      const sp = [s1, ...acc, sN]
      const c = layoutRun(run, sp).count
      // fewest stirrups; tie → spacings spread evenly
      const ideal = (sN - s1) / (mids + 1)
      const score = acc.reduce((t, v, i) => t + Math.abs(v - (s1 + ideal * (i + 1))), 0)
      // a middle spacing must save stirrups; among equal counts prefer evenly spread spacings
      if (c < bestCount || (c === bestCount && best.length === sp.length && score < bestScore)) {
        best = sp
        bestCount = c
        bestScore = score
      }
      return
    }
    for (let i = start; i < cand.length; i++) combos(i + 1, left - 1, [...acc, cand[i]])
  }
  combos(0, Math.min(mids, cand.length), [])
  return best
}

// ---------------------------------------------------------------- one-call design
export interface ShearDesign {
  dg: ShearDiagram
  lim: ShearLimits
  runs: ShearRun[]
  layouts: Record<string, RunLayout>
  spacings: Record<string, number[]>
  /** total stirrups along the beam */
  total: number
  /** stirrup at midspan added where the two span runs leave a gap larger than their last spacing */
  midStirrup: boolean
  flags: string[]
}

export function designShear(bm: ShearBeam, sec: ShearSection, opts: ShearDesignOpts & { nSets?: number; step?: number } = {}): ShearDesign {
  const dg = shearDiagram(bm)
  const lim = shearLimits(sec)
  const runs = shearRuns(dg, bm, sec, opts)
  const layouts: Record<string, RunLayout> = {}
  const spacings: Record<string, number[]> = {}
  for (const r of runs) {
    spacings[r.id] = autoSpacings(r, opts.nSets ?? 3, opts.step ?? 0.5)
    layouts[r.id] = layoutRun(r, spacings[r.id])
  }
  let total = runs.reduce((s, r) => s + layouts[r.id].count, 0)
  const L = runs.find((r) => r.id === 'sL'),
    R = runs.find((r) => r.id === 'sR')
  let midStirrup = false
  if (L && R && layouts.sL.count && layouts.sR.count) {
    const gap = L.len - layouts.sL.last + (R.len - layouts.sR.last)
    const sl = Math.max(layouts.sL.zones.at(-1)?.s ?? 0, layouts.sR.zones.at(-1)?.s ?? 0)
    if (L.uReqEnd >= L.len - STEP && gap > sl + 0.01) {
      midStirrup = true
      total += 1
    }
  }
  const flags: string[] = []
  if ((sec.phi ?? 0.75) !== 0.75) flags.push(`φ = ${sec.phi} for shear (pre-2002 ACI, older papers); current ACI uses 0.75.`)
  if (runs.some((r) => r.redesign)) flags.push(`Vu exceeds φVc + φ8√f'c·bw·d = ${lim.VuMax.toFixed(1)} kip: enlarge the section (redesign).`)
  if (runs.some((r) => r.sMin < 3 && r.sMin > 0)) flags.push('Required spacing is below the practical 3 in: use #4 stirrups or 4 legs.')
  if (runs.some((r) => r.critAtFace && r.uLoads.some((u) => u <= sec.d))) flags.push('A point load acts within d of a support face: design for Vu at the face.')
  if (Math.sqrt(sec.fc) > 100) flags.push("√f'c capped at 100 psi.")
  if (sec.fy > 60000) flags.push('fyt is limited to 60 ksi for stirrups.')
  return { dg, lim, runs, layouts, spacings, total, midStirrup, flags }
}
