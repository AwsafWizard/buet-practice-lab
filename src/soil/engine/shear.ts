// Shear strength solvers (AJK sir, Lecture 5; flagged extras from the past papers).
// Units: kPa, kN, m unless a function says otherwise.

import { circle, failurePlane, type Circle, type Envelope } from './mohr'
import { deg, GW, rad } from './units'

const sin = (d: number) => Math.sin(rad(d))
const cos = (d: number) => Math.cos(rad(d))
const tan = (d: number) => Math.tan(rad(d))

// ---------------------------------------------------------------- straight-line fits
export interface LineFit {
  /** intercept */
  a: number
  /** slope */
  b: number
  r2: number
  n: number
}

/** least squares y = a + b x (or y = b x when through0) */
export function fitLine(xs: number[], ys: number[], through0 = false): LineFit {
  const n = xs.length
  if (!n) return { a: NaN, b: NaN, r2: NaN, n }
  let a: number, b: number
  if (through0) {
    const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0)
    const sxx = xs.reduce((s, x) => s + x * x, 0)
    b = sxy / sxx
    a = 0
  } else if (n === 1) {
    b = ys[0] / xs[0]
    a = 0
  } else {
    const mx = xs.reduce((s, x) => s + x, 0) / n
    const my = ys.reduce((s, y) => s + y, 0) / n
    const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
    const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0)
    b = sxy / sxx
    a = my - b * mx
  }
  const my = ys.reduce((s, y) => s + y, 0) / n
  const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0)
  const ssRes = ys.reduce((s, y, i) => s + (y - (a + b * xs[i])) ** 2, 0)
  return { a, b, r2: ssTot > 0 ? 1 - ssRes / ssTot : 1, n }
}

/** where two lines y = a1 + b1 x and y = a2 + b2 x meet */
export function intersect(l1: { a: number; b: number }, l2: { a: number; b: number }) {
  const x = (l2.a - l1.a) / (l1.b - l2.b)
  return { x, y: l1.a + l1.b * x }
}

// ---------------------------------------------------------------- direct shear
export interface DSTest {
  /** normal force (kN) */
  N: number
  /** shear force at failure (kN) */
  T: number
}

/** direct shear: σ = N/A, τf = T/A, envelope by regression (Excel trend line as on the slides) */
export function directShear(tests: DSTest[], area: number, opts: { through0?: boolean } = {}) {
  const pts = tests.map((t) => ({ sigma: t.N / area, tau: t.T / area }))
  const fit = fitLine(
    pts.map((p) => p.sigma),
    pts.map((p) => p.tau),
    opts.through0,
  )
  return { pts, fit, env: { c: fit.a, phi: deg(Math.atan(fit.b)) } as Envelope }
}

/** envelope through two (σ, τf) points exactly */
export function envelopeTwoPoints(p1: { sigma: number; tau: number }, p2: { sigma: number; tau: number }): Envelope {
  const b = (p2.tau - p1.tau) / (p2.sigma - p1.sigma)
  return { c: p1.tau - b * p1.sigma, phi: deg(Math.atan(b)) }
}

export const squareArea = (side_mm: number) => (side_mm / 1000) ** 2
export const circleArea = (dia_mm: number) => (Math.PI / 4) * (dia_mm / 1000) ** 2

// ---------------------------------------------------------------- triaxial
export interface TriaxTest {
  /** cell pressure σ3 (kPa) */
  s3: number
  /** deviator stress at failure (σ1 − σ3)f (kPa) */
  dev: number
  /** pore pressure at failure (kPa), CU only */
  u?: number
}

export interface TriaxCircles {
  total: Circle[]
  eff: Circle[] | null
  /** Af = Δuf / Δσf (needs u) */
  Af: (number | null)[]
}

export function triaxCircles(tests: TriaxTest[]): TriaxCircles {
  const total = tests.map((t) => circle(t.s3 + t.dev, t.s3))
  const hasU = tests.every((t) => t.u !== undefined && Number.isFinite(t.u))
  const eff = hasU ? tests.map((t) => circle(t.s3 + t.dev - t.u!, t.s3 - t.u!)) : null
  return { total, eff, Af: tests.map((t) => (t.u !== undefined && Number.isFinite(t.u) ? t.u / t.dev : null)) }
}

export type FitMethod = 'one' | 'tangent' | 'pq' | 'c0'

export interface CircleFit extends Envelope {
  method: FitMethod
  /** p–q (Kf) line: q = a + p tanα */
  a: number
  alpha: number
  /** sin φ out of range → the circles cannot share a straight envelope with c ≥ 0 / any envelope */
  ok: boolean
  note?: string
}

/** envelope through Mohr circles:
 *  one circle → through the origin (c = 0), sinφ = R/C;
 *  two circles → exact common tangent sinφ = (R2 − R1)/(C2 − C1), c = (R1 − C1 sinφ)/cosφ;
 *  three or more → least squares on the p–q (Kf) line q = a + p tanα, sinφ = tanα, c = a/cosφ;
 *  forceC0 → q = p tanα through the origin. */
export function fitCircles(cs: Circle[], opts: { forceC0?: boolean } = {}): CircleFit {
  const p = cs.map((c) => c.C),
    q = cs.map((c) => c.R)
  const method: FitMethod = opts.forceC0 ? 'c0' : cs.length === 1 ? 'one' : cs.length === 2 ? 'tangent' : 'pq'
  const line = method === 'c0' || method === 'one' ? fitLine(p, q, true) : fitLine(p, q)
  const tanA = line.b
  const ok = tanA > -1 && tanA < 1
  const sp = Math.max(-1, Math.min(1, tanA))
  const phi = deg(Math.asin(sp))
  const c = line.a / Math.cos(Math.asin(sp))
  let note: string | undefined
  if (!ok) note = 'sin φ out of range: the circles cannot share a straight envelope (data inconsistent).'
  else if (phi < 0) note = 'The larger circle is too small: the fitted envelope slopes downward (data inconsistent).'
  else if (c < -0.5) note = 'Negative cohesion intercept: no envelope with c ≥ 0 fits; report it or force c = 0.'
  return { method, c, phi, a: line.a, alpha: deg(Math.atan(tanA)), ok: ok && phi >= 0, note }
}

/** σ1 at failure for a given σ3 (Mohr–Coulomb): σ1 = σ3 tan²(45 + φ/2) + 2c tan(45 + φ/2) */
export const sigma1f = (s3: number, env: Envelope) => s3 * tan(45 + env.phi / 2) ** 2 + 2 * env.c * tan(45 + env.phi / 2)
/** σ3 at failure for a given σ1 */
export const sigma3f = (s1: number, env: Envelope) => s1 * tan(45 - env.phi / 2) ** 2 - 2 * env.c * tan(45 - env.phi / 2)
/** σ3 at failure for a given deviator (c = 0: AJK CD Problem 2, σ3 = R/sinφ − R) */
export function sigma3ForDeviator(dev: number, env: Envelope) {
  const R = dev / 2
  return (R - env.c * cos(env.phi)) / sin(env.phi) - R
}
/** φ from a single circle through the origin: sinφ = R/(σ3 + R) */
export const phiFromCircle = (s3: number, dev: number) => deg(Math.asin(dev / 2 / (s3 + dev / 2)))
/** failure-plane angle from the major principal plane: 45 + φ/2 */
export const failureAngle = (phi: number) => 45 + phi / 2
/** φ back from a measured failure-plane angle (2016-17 Q7) */
export const phiFromAngle = (theta: number) => 2 * (theta - 45)

/** full CD / CU single-test answer as on AJK sir's slides */
export function triaxOne(t: TriaxTest, env?: Envelope) {
  const tot = circle(t.s3 + t.dev, t.s3)
  const eff = t.u !== undefined ? circle(t.s3 + t.dev - t.u, t.s3 - t.u) : tot
  const e = env ?? { c: 0, phi: phiFromCircle(eff.s3, t.dev) }
  const fp = failurePlane(eff, e.phi)
  return { tot, eff, env: e, fp, phiTotal: phiFromCircle(t.s3, t.dev), Af: t.u !== undefined ? t.u / t.dev : null }
}

/** UU / unconfined: cu = (σ1 − σ3)/2, φu = 0 */
export const cuFromDeviator = (dev: number) => dev / 2

// ---------------------------------------------------------------- unconfined compression
export interface UCResult {
  eps: number
  A0: number
  A: number
  qu: number
  cu: number
  consistency: string
}

/** Das Table 12.4: consistency from qu (kPa) */
export const QU_CLASSES: [string, number, number][] = [
  ['Very soft', 0, 25],
  ['Soft', 25, 50],
  ['Medium', 50, 100],
  ['Stiff', 100, 200],
  ['Very stiff', 200, 400],
  ['Hard', 400, Infinity],
]
export const consistencyFromQu = (qu: number) => (QU_CLASSES.find(([, lo, hi]) => qu >= lo && qu < hi) ?? QU_CLASSES[5])[0]

/** unconfined test: load P (kN), ΔH and H0 and D in mm; A = A0/(1 − ε) */
export function unconfined(P: number, dH: number, H0: number, D: number): UCResult {
  const eps = dH / H0
  const A0 = circleArea(D)
  const A = A0 / (1 - eps)
  const qu = P / A
  return { eps, A0, A, qu, cu: qu / 2, consistency: consistencyFromQu(qu) }
}

// ---------------------------------------------------------------- stress at a point (horizontal plane)
export interface Profile {
  /** depth of the point below ground */
  z: number
  /** water-table depth below ground (≥ z → dry); may be negative (water above ground) */
  zw: number
  /** unit weight above the WT */
  gamma: number
  /** saturated unit weight below the WT */
  gammaSat: number
  gw?: number
  /** surcharge / added vertical stress */
  q?: number
}

export function stressAt(p: Profile) {
  const gw = p.gw ?? GW
  const above = Math.max(0, Math.min(p.z, p.zw))
  const below = p.z - above
  const pond = p.zw < 0 ? -p.zw : 0
  const sigma = p.gamma * above + p.gammaSat * below + (p.q ?? 0) + pond * gw
  const u = gw * Math.max(0, p.z - Math.max(0, p.zw)) + pond * gw
  return { sigma, u, sigmaP: sigma - u }
}

/** strength on the horizontal plane at depth: τf = c + σ′ tanφ (AJK Problem 3) — and FS against an applied τ */
export function strengthAt(p: Profile, env: Envelope, tauApplied?: number) {
  const s = stressAt(p)
  const tauf = env.c + s.sigmaP * tan(env.phi)
  return { ...s, tauf, FS: tauApplied ? tauf / tauApplied : null }
}

// ---------------------------------------------------------------- Skempton A and B (not in AJK sir's slides)
/** Δu = B[Δσ3 + A(Δσ1 − Δσ3)] */
export const skemptonDu = (B: number, A: number, dS3: number, dS1: number) => B * (dS3 + A * (dS1 - dS3))
export const skemptonB = (du: number, dS3: number) => du / dS3

/** undrained cell-pressure change then shear to failure with given B, Af, effective envelope (2020-21 Q7(d)) */
export function deviatorWithAB(o: { s3c: number; s3: number; B: number; Af: number; env: Envelope }) {
  const du1 = o.B * (o.s3 - o.s3c)
  // σ3′ = s3 − du1 − B·Af·D ; σ1′ = σ3′ + D ; σ1′ = σ3′Kp + 2c√Kp
  const Kp = tan(45 + o.env.phi / 2) ** 2
  const k2 = 2 * o.env.c * Math.sqrt(Kp)
  const base = o.s3 - du1
  // D = σ3′(Kp − 1) + k2 with σ3′ = base − B Af D
  const D = (base * (Kp - 1) + k2) / (1 + o.B * o.Af * (Kp - 1))
  const uf = du1 + o.B * o.Af * D
  return { du1, D, uf, s3f: o.s3 - uf, s1f: o.s3 + D - uf }
}

/** pore pressure at failure so that a circle of deviator D touches the effective envelope (CU from CD, 2017-18 Q4(b)) */
export function ufFromEnvelope(s3: number, dev: number, env: Envelope) {
  const s3p = sigma3ForDeviator(dev, env)
  const uf = s3 - s3p
  return { s3p, s1p: s3p + dev, uf, Af: uf / dev }
}

/** total-stress (CU) failure and the pore pressure from the effective envelope at a new cell pressure (2016-17 Q9) */
export function cuPredict(s3: number, total: Envelope, eff: Envelope) {
  const s1 = sigma1f(s3, total)
  const dev = s1 - s3
  const r = ufFromEnvelope(s3, dev, eff)
  return { s1, dev, ...r }
}

// ---------------------------------------------------------------- sampling and the triaxial cell (B = 1)
/** saturated sample, no change in w or e: σ′ stays; returns σ, u, σ′ for each stage */
export function samplingStages(sigmaP: number, cell: number, cell2?: number) {
  const out = [
    { stage: 'after sampling (σ removed)', sigma: 0, u: -sigmaP, sigmaP },
    { stage: `cell pressure ${cell} kPa, undrained`, sigma: cell, u: cell - sigmaP, sigmaP },
  ]
  if (cell2 !== undefined) {
    out.push({ stage: `cell raised to ${cell2} kPa, valves closed`, sigma: cell2, u: cell2 - sigmaP, sigmaP })
    out.push({ stage: `valves opened, consolidated under ${cell2} kPa`, sigma: cell2, u: 0, sigmaP: cell2 })
  }
  return out
}

// ---------------------------------------------------------------- vane shear (not in AJK sir's slides)
export type VaneEnds = 2 | 1 | 0
export type VaneDist = 'uniform' | 'triangular'

/** T = cu πD²(H/2 + kD): both ends uniform k = 1/6, one end 1/12; triangular both 1/8, one 1/16. D, H in m, T in kN·m */
export function vaneCu(T: number, D: number, H: number, ends: VaneEnds = 2, dist: VaneDist = 'uniform') {
  const per = dist === 'uniform' ? 1 / 12 : 1 / 16
  const k = per * ends
  const lever = Math.PI * D * D * (H / 2 + k * D)
  return { cu: T / lever, lever, side: (Math.PI * D * D * H) / 2, end: Math.PI * D * D * k * D }
}
/** Bjerrum (1972) correction λ = 1.7 − 0.54 log PI (PI in %) */
export const bjerrum = (PI: number) => 1.7 - 0.54 * Math.log10(PI)

// ---------------------------------------------------------------- cu correlations (not in AJK sir's slides)
/** Skempton (1957): (cu/σ′0)NC = 0.11 + 0.0037 PI */
export const skemptonNC = (PI: number) => 0.11 + 0.0037 * PI
/** su from c′, φ′, K0 and Af (2017-18 Q2(c)) */
export function suFromK0Af(o: { c: number; phi: number; K0: number; Af: number; sv: number }) {
  return (o.c * cos(o.phi) + o.sv * sin(o.phi) * (o.K0 + o.Af * (1 - o.K0))) / (1 + (2 * o.Af - 1) * sin(o.phi))
}

/** β vs OCR chart (as printed in 2017-18, Jan 2021, 2021-22), digitised (papers_P2 2017-18 header) */
export const BETA_CHART = {
  ocr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10.6],
  upper: [1.0, 1.73, 2.45, 3.13, 3.71, 4.2, 4.62, 5.08, 5.36, 5.58, 5.72],
  average: [1.0, 1.57, 2.2, 2.72, 3.22, 3.63, 4.04, 4.4, 4.71, 4.99, 5.15],
  lower: [1.0, 1.41, 1.87, 2.29, 2.7, 3.1, 3.45, 3.73, 3.96, 4.17, 4.3],
}
export type BetaCurve = 'average' | 'upper' | 'lower'

export function betaOCR(ocr: number, curve: BetaCurve = 'average') {
  const xs = BETA_CHART.ocr,
    ys = BETA_CHART[curve]
  if (ocr <= xs[0]) return ys[0]
  for (let i = 1; i < xs.length; i++)
    if (ocr <= xs[i]) {
      const t = (ocr - xs[i - 1]) / (xs[i] - xs[i - 1])
      return ys[i - 1] + t * (ys[i] - ys[i - 1])
    }
  return NaN
}

/** full OC-clay estimate (2021-22 Q8(a), Jan 2021 Q5(c), 2017-18 Q1(d)) */
export function cuOC(o: { z: number; gammaSat: number; zw?: number; gamma?: number; pc: number; ratioNC: number; curve?: BetaCurve; gw?: number }) {
  const s = stressAt({ z: o.z, zw: o.zw ?? 0, gamma: o.gamma ?? o.gammaSat, gammaSat: o.gammaSat, gw: o.gw })
  const OCR = o.pc / s.sigmaP
  const beta = betaOCR(OCR, o.curve)
  const cuNC = o.ratioNC * s.sigmaP
  return { sv: s.sigmaP, OCR, beta, cuNC, cu: beta * cuNC, ladd: cuNC * OCR ** 0.8 }
}

/** sensitivity St = qu(undisturbed)/qu(remoulded) and Rosenqvist's class (Das Fig. 12.36) */
export function sensitivity(quU: number, quR: number) {
  const St = quU / quR
  const cls = St <= 1 ? 'insensitive' : St <= 2 ? 'slightly sensitive' : St <= 4 ? 'medium sensitive' : St <= 8 ? 'very sensitive' : St <= 16 ? 'slightly quick' : St <= 32 ? 'medium quick' : St <= 64 ? 'very quick' : 'extra quick'
  return { St, cls }
}

// ---------------------------------------------------------------- the helpers below are re-exported for labs
export { circle, failurePlane }
