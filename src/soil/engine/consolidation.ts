// Consolidation & settlement (SJMY sir, Lectures 15–20; Question Bank §5).
// kN, m, kPa unless a function says otherwise (the US-unit papers pass pcf / psf / ft straight through).
// log = log10. Settlement formulas exactly as the handnote's formula sheet.

import { stressAt, type ProfileIn } from './stresses'
import { boussinesqRectCentre, circleCentre, stripAt } from './stressdist'
import { GW } from './units'

const lg = Math.log10

// ---------------------------------------------------------------- index properties

/** saturated soil: e0 = wGs (Se = wGs with S = 1) */
export const e0FromWGs = (w: number, Gs: number, S = 1) => (w * Gs) / S
export const gammaSatFromGsE = (Gs: number, e: number, gw = GW) => ((Gs + e) * gw) / (1 + e)

export type CcState = 'undisturbed' | 'remoulded'
/** Skempton (Terzaghi & Peck for undisturbed): Cc = 0.009(LL − 10) undisturbed, 0.007(LL − 10) remoulded */
export const ccSkempton = (LL: number, s: CcState = 'undisturbed') => (s === 'undisturbed' ? 0.009 : 0.007) * (LL - 10)

/** other Cc correlations (Das Table 11.6); `v` = the input they take */
export const CC_CORRELATIONS: { key: string; formula: string; who: string; on: 'LL' | 'e0' | 'w'; f: (v: number) => number }[] = [
  { key: 'tp', formula: '0.009(LL − 10)', who: 'Terzaghi & Peck / Skempton, undisturbed clay (the handnote formula)', on: 'LL', f: (LL) => 0.009 * (LL - 10) },
  { key: 'sk', formula: '0.007(LL − 10)', who: 'Skempton, remoulded clay', on: 'LL', f: (LL) => 0.007 * (LL - 10) },
  { key: 'ni', formula: '1.15(e0 − 0.27)', who: 'Nishida, all clays', on: 'e0', f: (e) => 1.15 * (e - 0.27) },
  { key: 'ho', formula: '0.30(e0 − 0.27)', who: 'Hough, inorganic cohesive soil (silt, silty clay, clay)', on: 'e0', f: (e) => 0.3 * (e - 0.27) },
  { key: 'or', formula: '0.0115wN', who: 'organic soils, peat, organic silt and clay (wN in %)', on: 'w', f: (w) => 0.0115 * w },
  { key: 'br', formula: '0.0046(LL − 9)', who: 'Brazilian clays', on: 'LL', f: (LL) => 0.0046 * (LL - 9) },
  { key: 'lp', formula: '0.75(e0 − 0.5)', who: 'soils with low plasticity', on: 'e0', f: (e) => 0.75 * (e - 0.5) },
  { key: 'ch', formula: '0.208e0 + 0.0083', who: 'Chicago clays', on: 'e0', f: (e) => 0.208 * e + 0.0083 },
  { key: 'al', formula: '0.156e0 + 0.0107', who: 'all clays', on: 'e0', f: (e) => 0.156 * e + 0.0107 },
]

/** swell (recompression) index when not given: Cs ≈ Cc/5 … Cc/10. Default Cc/6 = the handnote's choice in 2020-21 Q3(a). */
export const csFromCc = (Cc: number, div = 6) => Cc / div
/** Nagaraj & Murty: Cs = 0.0463(LL/100)Gs */
export const csNagaraj = (LL: number, Gs: number) => 0.0463 * (LL / 100) * Gs

/** av = Δe/Δp, mv = av/(1 + e1) (e1 = void ratio at the start of the increment) */
export function avMv(e1: number, e2: number, p1: number, p2: number) {
  const av = (e1 - e2) / (p2 - p1)
  return { av, mv: av / (1 + e1), Cc: (e1 - e2) / lg(p2 / p1) }
}

// ---------------------------------------------------------------- primary settlement

export type Branch = 'nc' | 'recomp' | 'cross'
export interface SettleTerm {
  /** the coefficient used (Cc or Cs) */
  C: number
  /** pressures in the log ratio, from → to */
  from: number
  to: number
  /** e at the start (1 + e in the denominator) */
  e: number
  S: number
}
export interface PrimaryOut {
  branch: Branch
  S: number
  terms: SettleTerm[]
  p1: number
}

/** NC: S = CcH/(1+e0) log((p0+Δp)/p0) */
export const settleNC = (Cc: number, H: number, e0: number, p0: number, dp: number) => ((Cc * H) / (1 + e0)) * lg((p0 + dp) / p0)

/**
 * NC / OC (both branches). pc = null or pc ≤ p0 → NC.
 * eAtPc: 'e0' uses 1 + e0 in the second term (handnote, most books); 'ec' uses ec = e0 − Cs log(pc/p0) (SJMY's exact form).
 */
export function settlePrimary(o: { Cc: number; Cs: number; H: number; e0: number; p0: number; dp: number; pc?: number | null; eAtPc?: 'e0' | 'ec' }): PrimaryOut {
  const { Cc, Cs, H, e0, p0, dp } = o
  const p1 = p0 + dp
  const pc = o.pc ?? null
  if (pc === null || pc <= p0 * (1 + 1e-9)) {
    const S = settleNC(Cc, H, e0, p0, dp)
    return { branch: 'nc', S, p1, terms: [{ C: Cc, from: p0, to: p1, e: e0, S }] }
  }
  if (p1 <= pc) {
    const S = ((Cs * H) / (1 + e0)) * lg(p1 / p0)
    return { branch: 'recomp', S, p1, terms: [{ C: Cs, from: p0, to: p1, e: e0, S }] }
  }
  const S1 = ((Cs * H) / (1 + e0)) * lg(pc / p0)
  const ec = o.eAtPc === 'ec' ? e0 - Cs * lg(pc / p0) : e0
  const S2 = ((Cc * H) / (1 + ec)) * lg(p1 / pc)
  return { branch: 'cross', S: S1 + S2, p1, terms: [{ C: Cs, from: p0, to: pc, e: e0, S: S1 }, { C: Cc, from: pc, to: p1, e: ec, S: S2 }] }
}

/** S = Δe·H/(1 + e0) */
export const settleDe = (de: number, H: number, e0: number) => (de * H) / (1 + e0)
/** S = mv Δp H */
export const settleMv = (mv: number, dp: number, H: number) => mv * dp * H

/** Simpson's rule average over a layer: (top + 4 mid + bottom)/6 */
export const simpson = (top: number, mid: number, bot: number) => (top + 4 * mid + bot) / 6

// ---------------------------------------------------------------- e–p table (log interpolation)

/**
 * e at pressure p from a lab table (loading points, increasing p), interpolated linearly in log p
 * between the neighbouring entries (extrapolated with the end slope outside the table).
 */
export function eFromTable(ps: number[], es: number[], p: number) {
  const n = ps.length
  let i = 0
  while (i < n - 2 && p > ps[i + 1]) i++
  const slope = (es[i + 1] - es[i]) / lg(ps[i + 1] / ps[i])
  return es[i] + slope * lg(p / ps[i])
}

// ---------------------------------------------------------------- oedometer data: pc′, Cc, Cs

export type Stage = 'load' | 'unload' | 'reload'
export interface OedPt {
  p: number
  e: number
  stage: Stage
}

/** the virgin envelope: first loading plus reload points beyond the earlier maximum */
export function envelope(pts: OedPt[]) {
  const out: OedPt[] = []
  let pmax = 0
  let unloaded = false
  for (const q of pts) {
    if (q.stage === 'unload') unloaded = true
    if (q.stage === 'load' && !unloaded) {
      out.push(q)
      pmax = Math.max(pmax, q.p)
    } else if (q.stage !== 'unload' && q.p > pmax * (1 + 1e-9)) {
      out.push(q)
      pmax = q.p
    }
  }
  return out
}

/** straight line e = a + b·log p by least squares */
export function fitLogLine(pts: { p: number; e: number }[]) {
  const xs = pts.map((q) => lg(q.p))
  const n = xs.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const me = pts.reduce((s, q) => s + q.e, 0) / n
  let sxy = 0
  let sxx = 0
  pts.forEach((q, i) => {
    sxy += (xs[i] - mx) * (q.e - me)
    sxx += (xs[i] - mx) ** 2
  })
  const b = sxx ? sxy / sxx : 0
  return { a: me - b * mx, b, at: (p: number) => me - b * mx + b * lg(p) }
}

/** Cc from the last two envelope points (the straight virgin part) */
export function ccFromData(pts: OedPt[]) {
  const env = envelope(pts)
  const a = env[env.length - 2]
  const b = env[env.length - 1]
  return { Cc: (a.e - b.e) / lg(b.p / a.p), a, b }
}

/** Cs from the unloading branch: from the peak load before unloading to the last unload point */
export function csFromData(pts: OedPt[]) {
  const iu = pts.findIndex((q) => q.stage === 'unload')
  if (iu < 1) return null
  const top = pts[iu - 1]
  let j = iu
  while (j + 1 < pts.length && pts[j + 1].stage === 'unload') j++
  const end = pts[j]
  return { Cs: (end.e - top.e) / lg(top.p / end.p), top, end }
}

/** pc′ as the intersection of the recompression line (least squares, first `nFirst` points) and the virgin line (last two envelope points) */
export function pcTwoLines(pts: OedPt[], nFirst = 3) {
  const env = envelope(pts)
  const re = fitLogLine(env.slice(0, Math.min(nFirst, env.length - 2)))
  const v = ccFromData(pts)
  // virgin: e = v.a.e − Cc log(p/v.a.p)
  const vb = -v.Cc
  const va = v.a.e - vb * lg(v.a.p)
  const x = (re.a - va) / (vb - re.b)
  return { pc: 10 ** x, e: re.a + re.b * x, Cr: -re.b, Cc: v.Cc, recomp: re, virgin: { a: va, b: vb } }
}

/**
 * Casagrande's construction as done on paper: the point of maximum curvature is the envelope point where the curve
 * turns most sharply (in plot units); tangent there (central slope), horizontal line, bisector; the bisector meets
 * the virgin line (extended back) at pc′. `aspect` = plot units per unit of e ÷ plot units per decade of p
 * (default: a square plot of the data).
 */
export function casagrande(pts: OedPt[], aspect?: number) {
  const env = envelope(pts)
  const xs = env.map((q) => lg(q.p))
  const es = env.map((q) => q.e)
  const k = aspect ?? (Math.max(...xs) - Math.min(...xs)) / Math.max(1e-9, Math.max(...es) - Math.min(...es))
  const ang = (i: number) => Math.atan2(k * (es[i + 1] - es[i]), xs[i + 1] - xs[i])
  let best = 1
  let bestTurn = -Infinity
  for (let i = 1; i < env.length - 2; i++) {
    const turn = ang(i - 1) - ang(i)
    if (turn > bestTurn) {
      bestTurn = turn
      best = i
    }
  }
  const i = best
  // tangent: central slope through the neighbours (plot units)
  const tSlope = (k * (es[i + 1] - es[i - 1])) / (xs[i + 1] - xs[i - 1])
  const tAng = Math.atan(tSlope)
  const bAng = tAng / 2
  const bSlope = Math.tan(bAng) / k // in e per decade
  const v = ccFromData(pts)
  const vb = -v.Cc
  const va = v.a.e - vb * lg(v.a.p)
  // bisector: e = es[i] + bSlope (x − xs[i])
  const x = (es[i] - bSlope * xs[i] - va) / (vb - bSlope)
  return {
    pc: 10 ** x,
    ePc: va + vb * x,
    /** the max-curvature point */
    m: env[i],
    tangentSlope: tSlope / k,
    bisectorSlope: bSlope,
    aspect: k,
    Cc: v.Cc,
  }
}

/** field curves (Schmertmann). NC: a = (p0, e0) → b at e = 0.42e0 on the lab virgin line. OC: a → b at pc′ along Cs → c at 0.42e0. */
export function fieldCurve(o: { e0: number; p0: number; pc: number; Cs: number; lab: { a: number; b: number } }) {
  const eL = 0.42 * o.e0
  // lab virgin line e = a + b log p → p at eL
  const pL = 10 ** ((eL - o.lab.a) / o.lab.b)
  if (o.pc <= o.p0 * 1.02) {
    const Ccf = (o.e0 - eL) / lg(pL / o.p0)
    return { kind: 'nc' as const, pts: [{ p: o.p0, e: o.e0 }, { p: pL, e: eL }], Ccf, eL, pL }
  }
  const eb = o.e0 - o.Cs * lg(o.pc / o.p0)
  const Ccf = (eb - eL) / lg(pL / o.pc)
  return { kind: 'oc' as const, pts: [{ p: o.p0, e: o.e0 }, { p: o.pc, e: eb }, { p: pL, e: eL }], Ccf, eL, pL, eb }
}

/** a smooth lab curve for the 🎲 generator: recompression Cr up to about pc′, virgin Cc beyond, rounding width w (decades) */
export function labCurve(o: { pc: number; ec: number; Cc: number; Cr: number; w?: number }) {
  const w = o.w ?? 0.12
  const xc = lg(o.pc)
  return (p: number) => {
    const t = (lg(p) - xc) / w
    const sp = t > 30 ? t : Math.log1p(Math.exp(t))
    return o.ec - o.Cr * (lg(p) - xc) - (o.Cc - o.Cr) * w * sp + (o.Cc - o.Cr) * w * Math.LN2
  }
}

// ---------------------------------------------------------------- time rate: Tv–U

export const TV_TABLE: [number, number][] = [
  [0, 0],
  [10, 0.008],
  [20, 0.031],
  [30, 0.071],
  [40, 0.126],
  [50, 0.197],
  [60, 0.287],
  [70, 0.403],
  [80, 0.567],
  [90, 0.848],
]

/** average degree of consolidation (0–1) from the exact series U = 1 − Σ 2/M² e^(−M²Tv), M = (2m+1)π/2 */
export function uFromTv(Tv: number) {
  if (Tv <= 0) return 0
  if (Tv < 1e-4) return Math.sqrt((4 * Tv) / Math.PI)
  let s = 0
  for (let m = 0; m < 400; m++) {
    const M = ((2 * m + 1) * Math.PI) / 2
    const t = (2 / (M * M)) * Math.exp(-M * M * Tv)
    s += t
    if (t < 1e-14) break
  }
  return Math.min(1, Math.max(0, 1 - s))
}

/** exact inverse (bisection on the series); U as a fraction 0–1 */
export function tvFromU(U: number) {
  if (U <= 0) return 0
  if (U >= 1) return Infinity
  let lo = 0
  let hi = 10
  while (uFromTv(hi) < U) hi *= 2
  for (let k = 0; k < 100; k++) {
    const m = (lo + hi) / 2
    if (uFromTv(m) < U) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

/** the two approximations (U in %, as taught): U < 60 → (π/4)U², else 1.781 − 0.933 log(100 − U) */
export function tvApprox(Upct: number) {
  if (Upct <= 0) return 0
  if (Upct >= 100) return Infinity
  return Upct < 60 ? (Math.PI / 4) * (Upct / 100) ** 2 : 1.781 - 0.933 * lg(100 - Upct)
}
/** inverse of the approximations: U % from Tv */
export function uApprox(Tv: number) {
  if (Tv <= 0) return 0
  const u1 = 100 * Math.sqrt((4 * Tv) / Math.PI)
  if (u1 < 60) return u1
  return Math.min(100, 100 - 10 ** ((1.781 - Tv) / 0.933))
}
/** linear interpolation in the printed table (U %) — what the handnote does for 65 % and 75 % */
export function tvFromTable(Upct: number) {
  if (Upct >= 90) return tvApprox(Upct)
  let i = 0
  while (i < TV_TABLE.length - 2 && Upct > TV_TABLE[i + 1][0]) i++
  const [u1, t1] = TV_TABLE[i]
  const [u2, t2] = TV_TABLE[i + 1]
  return t1 + ((t2 - t1) * (Upct - u1)) / (u2 - u1)
}
export function uFromTable(Tv: number) {
  if (Tv >= 0.848) return uApprox(Tv)
  let i = 0
  while (i < TV_TABLE.length - 2 && Tv > TV_TABLE[i + 1][1]) i++
  const [u1, t1] = TV_TABLE[i]
  const [u2, t2] = TV_TABLE[i + 1]
  return u1 + ((u2 - u1) * (Tv - t1)) / (t2 - t1)
}

export type TvMethod = 'exact' | 'approx' | 'table'
export const tvBy = (Upct: number, m: TvMethod) => (m === 'exact' ? tvFromU(Upct / 100) : m === 'approx' ? tvApprox(Upct) : tvFromTable(Upct))
/** U % from Tv by the chosen route */
export const uBy = (Tv: number, m: TvMethod) => (m === 'exact' ? 100 * uFromTv(Tv) : m === 'approx' ? uApprox(Tv) : uFromTable(Tv))

/** longest drainage path: two-way H/2, one-way H */
export const drainPath = (H: number, way: 'one' | 'two') => (way === 'two' ? H / 2 : H)
export const timeFactor = (cv: number, t: number, d: number) => (cv * t) / (d * d)
export const timeFor = (Tv: number, d: number, cv: number) => (Tv * d * d) / cv

/** same U: t2 = t1 (d2/d1)² (cv1/cv2) */
export const scaleTime = (t1: number, d1: number, d2: number, cv1 = 1, cv2 = 1) => t1 * (d2 / d1) ** 2 * (cv1 / cv2)

/** isochrone: degree of consolidation at depth z (Z = z/d, 0 … 2 for a doubly drained layer of thickness 2d) */
export function uz(Z: number, Tv: number) {
  if (Tv <= 0) return Z <= 0 || Z >= 2 ? 1 : 0
  let s = 0
  for (let m = 0; m < 3000; m++) {
    const M = ((2 * m + 1) * Math.PI) / 2
    const e = Math.exp(-M * M * Tv)
    s += (2 / M) * Math.sin(M * Z) * e
    if (e < 1e-12) break
  }
  return Math.min(1, Math.max(0, 1 - s))
}
/** excess pore pressure ratio u/u0 at Z = z/d */
export const uRatio = (Z: number, Tv: number) => 1 - uz(Z, Tv)

// ---------------------------------------------------------------- cv, k

/** k = cv mv γw */
export const kFromCv = (cv: number, mv: number, gw = GW) => cv * mv * gw
export const cvFromK = (k: number, mv: number, gw = GW) => k / (mv * gw)
/** Taylor: cv = 0.848 d²/t90; Casagrande: cv = 0.197 d²/t50 */
export const cvTaylor = (d: number, t90: number) => (0.848 * d * d) / t90
export const cvCasagrande = (d: number, t50: number) => (0.197 * d * d) / t50

/** kA/kB from two oedometer increments: mv ratio × cv ratio (cv ∝ d²/t for the same U) */
export function kRatio(o: { eA: [number, number]; eB: [number, number]; dp: number; dA: number; dB: number; tA: number; tB: number }) {
  const mvA = (o.eA[0] - o.eA[1]) / ((1 + o.eA[0]) * o.dp)
  const mvB = (o.eB[0] - o.eB[1]) / ((1 + o.eB[0]) * o.dp)
  const cvRatio = (o.dA / o.dB) ** 2 * (o.tB / o.tA)
  return { mvA, mvB, mvRatio: mvA / mvB, cvRatio, kRatio: cvRatio * (mvA / mvB) }
}

// ---------------------------------------------------------------- dial–time data (generator + fitting)

export interface DialPt {
  /** minutes */
  t: number
  /** compression (mm), increasing */
  d: number
}
export const DIAL_TIMES = [0.1, 0.25, 0.5, 1, 2, 4, 8, 15, 30, 45, 60, 90, 120, 180, 240, 360, 480, 960, 1440, 2880]

/** synthetic oedometer increment: initial compression di, primary dp × U(Tv), secondary ds per log cycle after ~t100 */
export function genDial(o: { cv: number; d: number; di: number; dp: number; ds: number; times?: number[]; noise?: (i: number) => number }) {
  // cv in mm²/min, d in mm
  const t100 = (1 * o.d * o.d) / o.cv
  return (o.times ?? DIAL_TIMES).map((t, i) => ({ t, d: o.di + o.dp * uFromTv((o.cv * t) / (o.d * o.d)) + (o.ds / 2) * lg(1 + (t / t100) ** 2) + (o.noise?.(i) ?? 0) }))
}

/** piecewise-linear crossing of the data (in x(t)) with a line d = a + b·x */
function crossing(pts: DialPt[], x: (t: number) => number, a: number, b: number) {
  for (let i = 1; i < pts.length; i++) {
    const x0 = x(pts[i - 1].t)
    const x1 = x(pts[i].t)
    const f0 = pts[i - 1].d - (a + b * x0)
    const f1 = pts[i].d - (a + b * x1)
    if (f0 >= 0 && f1 <= 0 && f1 !== f0) {
      const s = -f0 / (f1 - f0)
      return x0 + s * (x1 - x0)
    }
  }
  return NaN
}

/** Taylor's √t construction. Returns d0, the initial line, t90 (min) and cv for drainage path d (mm → mm²/min). */
export function taylorFit(pts: DialPt[], dPath: number) {
  const sq = (t: number) => Math.sqrt(t)
  // initial straight line: grow from the first two points while the next point stays within 1.5 % of the range
  const range = pts[pts.length - 1].d - pts[0].d
  let k = 2
  const fit = (n: number) => {
    const xs = pts.slice(0, n).map((q) => sq(q.t))
    const ys = pts.slice(0, n).map((q) => q.d)
    const mx = xs.reduce((s, v) => s + v, 0) / n
    const my = ys.reduce((s, v) => s + v, 0) / n
    let sxy = 0
    let sxx = 0
    xs.forEach((x, i) => {
      sxy += (x - mx) * (ys[i] - my)
      sxx += (x - mx) ** 2
    })
    const b = sxy / sxx
    return { a: my - b * mx, b }
  }
  let line = fit(2)
  while (k < pts.length - 2) {
    const nx = pts[k]
    if (Math.abs(nx.d - (line.a + line.b * sq(nx.t))) > 0.015 * range) break
    k++
    line = fit(k)
  }
  const x90 = crossing(pts, sq, line.a, line.b / 1.15)
  const t90 = x90 * x90
  return { d0: line.a, slope: line.b, nLine: k, x90, t90, d90: line.a + (line.b / 1.15) * x90, cv: cvTaylor(dPath, t90) }
}

/** Casagrande's log t construction: d0 by the t, 4t rule; d100 = tangents; d50 → t50; cv = 0.197d²/t50 */
export function casagrandeFit(pts: DialPt[], dPath: number) {
  const L = (t: number) => lg(t)
  // t, 4t: the first pair present in the data with both points early (before the steepest part)
  let d0 = NaN
  let t1 = NaN
  for (let i = 0; i < pts.length && Number.isNaN(d0); i++) {
    const j = pts.findIndex((q) => Math.abs(q.t - 4 * pts[i].t) < 1e-9)
    if (j > i) {
      d0 = 2 * pts[i].d - pts[j].d
      t1 = pts[i].t
    }
  }
  // steepest segment in log t
  let si = 0
  let sb = -Infinity
  for (let i = 0; i + 1 < pts.length; i++) {
    const b = (pts[i + 1].d - pts[i].d) / (L(pts[i + 1].t) - L(pts[i].t))
    if (b > sb) {
      sb = b
      si = i
    }
  }
  const ta = { a: pts[si].d - sb * L(pts[si].t), b: sb }
  const n = pts.length
  const sec = { b: (pts[n - 1].d - pts[n - 2].d) / (L(pts[n - 1].t) - L(pts[n - 2].t)), a: 0 }
  sec.a = pts[n - 1].d - sec.b * L(pts[n - 1].t)
  const x100 = (sec.a - ta.a) / (ta.b - sec.b)
  const d100 = ta.a + ta.b * x100
  const d50 = (d0 + d100) / 2
  let t50 = NaN
  for (let i = 1; i < n; i++)
    if (pts[i - 1].d <= d50 && pts[i].d >= d50) {
      const s = (d50 - pts[i - 1].d) / (pts[i].d - pts[i - 1].d)
      t50 = 10 ** (L(pts[i - 1].t) + s * (L(pts[i].t) - L(pts[i - 1].t)))
      break
    }
  return { d0, t1, d100, t100: 10 ** x100, d50, t50, tangent: ta, secondary: sec, cv: cvCasagrande(dPath, t50) }
}

// ---------------------------------------------------------------- secondary

/** Cα′ = Cα/(1 + ep); Ss = Cα′ H log(t2/t1) */
export function secondary(o: { Ca: number; ep: number; H: number; t1: number; t2: number }) {
  const Cap = o.Ca / (1 + o.ep)
  return { Cap, S: Cap * o.H * lg(o.t2 / o.t1) }
}

// ---------------------------------------------------------------- sand drains (Barron, equal strain, no smear)

export type DrainPattern = 'triangular' | 'square'
/** de = 1.05 s (triangular), 1.128 s (square). SJMY's slide writes 0.525s / 0.564s — those are re = de/2. */
export const deFromSpacing = (s: number, pat: DrainPattern) => (pat === 'triangular' ? 1.05 : 1.128) * s
/** F(n) = n²/(n² − 1) ln n − (3n² − 1)/(4n²) */
export const Fn = (n: number) => ((n * n) / (n * n - 1)) * Math.log(n) - (3 * n * n - 1) / (4 * n * n)
export const urBarron = (Tr: number, n: number) => 1 - Math.exp((-8 * Tr) / Fn(n))
export const trForUr = (Ur: number, n: number) => (-Math.log(1 - Ur) * Fn(n)) / 8
export const combinedU = (Uv: number, Ur: number) => 1 - (1 - Uv) * (1 - Ur)

export function sandDrain(o: { s: number; pattern: DrainPattern; rw: number; cv: number; cvr?: number; t: number; dv: number; tv?: TvMethod }) {
  const de = deFromSpacing(o.s, o.pattern)
  const re = de / 2
  const n = re / o.rw
  const cvr = o.cvr ?? o.cv
  const Tr = (cvr * o.t) / (de * de)
  const Ur = urBarron(Tr, n)
  const Tv = (o.cv * o.t) / (o.dv * o.dv)
  const Uv = uBy(Tv, o.tv ?? 'exact') / 100
  return { de, re, n, F: Fn(n), Tr, Ur, Tv, Uv, U: combinedU(Uv, Ur) }
}

// ---------------------------------------------------------------- a whole profile: σ′0, Δp, settlement of each clay layer

export interface CLayer {
  kind: 'sand' | 'clay'
  H: number
  gamma: number
  gammaSat: number
  /** clay only */
  e0?: number
  Cc?: number
  Cs?: number
  /** preconsolidation pressure; null/undefined = NC */
  pc?: number | null
  /** m²/yr */
  cv?: number
}
export type Footing = { shape: 'rect' | 'circle' | 'strip'; B: number; L: number; Q: number; Df: number; method: '21' | 'elastic' }
export type LoadIn = { kind: 'fill'; q: number } | ({ kind: 'footing' } & Footing)

export interface SettleIn {
  layers: CLayer[]
  wt: number
  load: LoadIn
  /** sub-layers per clay layer (1 = one layer at mid-depth) */
  nSub?: number
  /** Δp over each (sub)layer: at its middle, or Simpson's average of top/middle/bottom */
  avg?: 'mid' | 'simpson'
  eAtPc?: 'e0' | 'ec'
  /** bottom of the profile: drains or not (for the time rate) */
  baseDrains?: boolean
}

export function footingArea(f: Footing) {
  return f.shape === 'rect' ? f.B * f.L : f.shape === 'circle' ? (Math.PI * f.B * f.B) / 4 : f.B
}
/** contact pressure q = Q/A (strip: Q in kN/m) */
export const footingQ = (f: Footing) => f.Q / footingArea(f)

/** Δp at depth z below the footing base (z ≥ 0), below the centre */
export function footingDp(f: Footing, z: number) {
  const q = footingQ(f)
  if (z <= 1e-9) return q
  if (f.method === '21') return f.shape === 'rect' ? f.Q / ((f.B + z) * (f.L + z)) : f.shape === 'circle' ? f.Q / ((Math.PI * (f.B + z) ** 2) / 4) : f.Q / (f.B + z)
  return f.shape === 'rect' ? boussinesqRectCentre(q, f.B, f.L, z) : f.shape === 'circle' ? circleCentre(q, f.B / 2, z) : stripAt(q, f.B, 0, z)
}

/** Δp at depth zz below GL */
export function loadDp(load: LoadIn, zz: number) {
  if (load.kind === 'fill') return load.q
  return footingDp(load, zz - load.Df)
}

export const toProfile = (p: { layers: CLayer[]; wt: number }): ProfileIn => ({ layers: p.layers.map((l, i) => ({ name: `${l.kind} ${i + 1}`, H: l.H, gamma: l.gamma, gammaSat: l.gammaSat })), wt: p.wt })

export interface SubOut extends PrimaryOut {
  layer: number
  zTop: number
  zMid: number
  zBot: number
  H: number
  p0: number
  dp: number
  dpTop: number
  dpMid: number
  dpBot: number
  pc: number | null
}
export interface LayerOut {
  layer: number
  zTop: number
  zBot: number
  S: number
  subs: SubOut[]
  /** drainage: top / bottom free */
  top: boolean
  bot: boolean
  d: number
}

export function settleProfile(inp: SettleIn) {
  const prof = toProfile(inp)
  const nSub = Math.max(1, Math.round(inp.nSub ?? 1))
  const layers: LayerOut[] = []
  let z = 0
  inp.layers.forEach((l, i) => {
    const zTop = z
    z += l.H
    if (l.kind !== 'clay') return
    const subs: SubOut[] = []
    const h = l.H / nSub
    for (let k = 0; k < nSub; k++) {
      const a = zTop + k * h
      const b = a + h
      const m = (a + b) / 2
      const p0 = stressAt(prof, m).eff
      const dpTop = loadDp(inp.load, a)
      const dpMid = loadDp(inp.load, m)
      const dpBot = loadDp(inp.load, b)
      const dp = inp.avg === 'simpson' ? simpson(dpTop, dpMid, dpBot) : dpMid
      const r = settlePrimary({ Cc: l.Cc ?? 0, Cs: l.Cs ?? 0, H: h, e0: l.e0 ?? 1, p0, dp, pc: l.pc ?? null, eAtPc: inp.eAtPc })
      subs.push({ ...r, layer: i, zTop: a, zMid: m, zBot: b, H: h, p0, dp, dpTop, dpMid, dpBot, pc: l.pc ?? null })
    }
    const top = i === 0 || inp.layers[i - 1].kind === 'sand'
    const bot = i === inp.layers.length - 1 ? !!inp.baseDrains : inp.layers[i + 1].kind === 'sand'
    layers.push({ layer: i, zTop, zBot: z, S: subs.reduce((s, x) => s + x.S, 0), subs, top, bot, d: top && bot ? l.H / 2 : l.H })
  })
  return { layers, S: layers.reduce((s, x) => s + x.S, 0) }
}

/** settlement at time t (yr) for a solved profile: Σ U_i S_i with each layer's own cv and drainage */
export function settleAt(inp: SettleIn, out: ReturnType<typeof settleProfile>, t: number, m: TvMethod = 'exact') {
  return out.layers.reduce((s, L) => {
    const cv = inp.layers[L.layer].cv ?? 0
    if (!(L.top || L.bot) || cv <= 0) return s
    return s + (uBy(timeFactor(cv, t, L.d), m) / 100) * L.S
  }, 0)
}
