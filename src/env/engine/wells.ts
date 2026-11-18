// Groundwater hydraulics for wells as Snigdha ma'am teaches it (SN L3). Units are whatever you feed in, consistently
// (K in [length]/[time], Q in [length]³/[time]); ratios of lengths (R/r, r2/r1) are dimensionless.
// Interference uses her version: unconfined π K (D² − d²) / ln(R²/(r a)) (the slide's printed 2π is a typo), confined 2π K b (D − d) / ln(R²/(r a)).

const PI = Math.PI
const ln = Math.log

// ---------------------------------------------------------------- single well
/** confined (Thiem): Q = 2π K b s / ln(R/rw) = 2π T s / ln(R/rw) */
export const thiemQ = (p: { K: number; b: number; s: number; rw: number; R: number }) => (2 * PI * p.K * p.b * p.s) / ln(p.R / p.rw)
/** confined: K from the pumped well's own drawdown */
export const thiemK = (p: { Q: number; b: number; s: number; rw: number; R: number }) => (p.Q * ln(p.R / p.rw)) / (2 * PI * p.b * p.s)
/** confined: drawdown at the well for a given Q */
export const thiemS = (p: { Q: number; K: number; b: number; rw: number; R: number }) => (p.Q * ln(p.R / p.rw)) / (2 * PI * p.K * p.b)
/** unconfined (Dupuit): Q = π K (D² − d²) / ln(R/rw) with d = D − s */
export const dupuitQ = (p: { K: number; D: number; s: number; rw: number; R: number }) => (PI * p.K * (p.D * p.D - (p.D - p.s) ** 2)) / ln(p.R / p.rw)
export const dupuitK = (p: { Q: number; D: number; s: number; rw: number; R: number }) => (p.Q * ln(p.R / p.rw)) / (PI * (p.D * p.D - (p.D - p.s) ** 2))
/** unconfined: radius of influence from Q = π K (D² − d²)/ln(R/rw) */
export const dupuitR = (p: { Q: number; K: number; D: number; s: number; rw: number }) => p.rw * Math.exp((PI * p.K * (p.D * p.D - (p.D - p.s) ** 2)) / p.Q)
export const thiemR = (p: { Q: number; K: number; b: number; s: number; rw: number }) => p.rw * Math.exp((2 * PI * p.K * p.b * p.s) / p.Q)

/** specific capacity = Q / s */
export const specificCapacity = (Q: number, s: number) => Q / s

// ---------------------------------------------------------------- observation wells
/** unconfined: K = Q ln(r2/r1) / [π (h2² − h1²)]; h = depth of water (pumping) at distance r */
export const kObsUnconfined = (p: { Q: number; r1: number; h1: number; r2: number; h2: number }) => (p.Q * ln(p.r2 / p.r1)) / (PI * (p.h2 * p.h2 - p.h1 * p.h1))
/** confined: K = Q ln(r2/r1) / [2π b (h2 − h1)] */
export const kObsConfined = (p: { Q: number; b: number; r1: number; h1: number; r2: number; h2: number }) => (p.Q * ln(p.r2 / p.r1)) / (2 * PI * p.b * (p.h2 - p.h1))
/** confined: Q from two observation drawdowns s1 (at r1) and s2 (at r2), s1 > s2 */
export const qObsConfined = (p: { K: number; b: number; r1: number; s1: number; r2: number; s2: number }) => (2 * PI * p.K * p.b * (p.s1 - p.s2)) / ln(p.r2 / p.r1)
/** unconfined: the water depth at the pumped well from one observation well: d² = h1² − Q ln(r1/rw)/(πK) */
export const dAtWell = (p: { Q: number; K: number; h1: number; r1: number; rw: number }) => Math.sqrt(p.h1 * p.h1 - (p.Q * ln(p.r1 / p.rw)) / (PI * p.K))

// ---------------------------------------------------------------- interference of two identical wells a apart
/** each well's discharge when both pump together with the same drawdown s (confined) */
export const interferenceConfinedQ = (p: { K: number; b: number; s: number; rw: number; R: number; a: number }) => (2 * PI * p.K * p.b * p.s) / ln((p.R * p.R) / (p.rw * p.a))
/** each well's discharge when both pump together with the same drawdown s (unconfined, π not 2π) */
export const interferenceUnconfinedQ = (p: { K: number; D: number; s: number; rw: number; R: number; a: number }) => (PI * p.K * (p.D * p.D - (p.D - p.s) ** 2)) / ln((p.R * p.R) / (p.rw * p.a))

/**
 * The paper's standard chain (2007-08 Q1(b), 2009-10 Q5(c), 2011-12 Q1(b), 2012-13 Q6(b), 2017-18 Q2(b), slide Ex-3):
 * one well pumped at Q with drawdown s (so d = D − s) and a similar well at distance a not pumped, its water depth h;
 * find K, R, then the yield of each well when both pump with drawdown s2.
 */
export function unconfinedInterferenceChain(p: { Q: number; D: number; s: number; rw: number; a: number; h: number; s2: number }) {
  const d = p.D - p.s
  const K = kObsUnconfined({ Q: p.Q, r1: p.rw, h1: d, r2: p.a, h2: p.h })
  const lnRr = (PI * K * (p.D * p.D - d * d)) / p.Q
  const R = p.rw * Math.exp(lnRr)
  const d2 = p.D - p.s2
  const num = PI * K * (p.D * p.D - d2 * d2)
  const lnTerm = ln((R * R) / (p.rw * p.a))
  const each = num / lnTerm
  return { d, K, lnRr, R, d2, D2d2: p.D * p.D - d2 * d2, num, lnTerm, each, total: 2 * each, single: (PI * K * (p.D * p.D - d2 * d2)) / ln(R / p.rw) }
}

// ---------------------------------------------------------------- storage
/** volume released = S (or Sy) × A × Δh */
export const storageVolume = (S: number, area: number, dh: number) => S * area * dh
/** transmissivity T = K b */
export const transmissivity = (K: number, b: number) => K * b

// ---------------------------------------------------------------- drawdown curves for plotting
export type AquiferKind = 'confined' | 'unconfined'
export interface Well {
  /** position along the section (m), Q in same volumetric units as K·length */
  x: number
  Q: number
}
export interface Aquifer {
  kind: AquiferKind
  K: number
  /** confined thickness b, or unconfined static saturated thickness H */
  thick: number
  /** confined only: static piezometric head above the aquifer base (≥ thick); default = thick */
  D?: number
  rw: number
  R: number
}

/** drawdown contribution of one well at distance r (≥ rw; 0 beyond R). Confined: s; unconfined: the D² − h² term (so contributions add) */
export function wellEffect(a: Aquifer, Q: number, r: number) {
  const rr = Math.max(r, a.rw)
  if (rr >= a.R) return 0
  const t = (Q * ln(a.R / rr)) / (a.kind === 'confined' ? 2 * PI * a.K * a.thick : PI * a.K)
  return t
}

/** water level (head above the aquifer base) at x for a set of wells: superposition of drawdowns (confined) / of D² − h² (unconfined) */
export function headAt(a: Aquifer, wells: Well[], x: number) {
  const sum = wells.reduce((s, w) => s + wellEffect(a, w.Q, Math.abs(x - w.x)), 0)
  return a.kind === 'confined' ? staticHead(a) - sum : Math.sqrt(Math.max(0, a.thick * a.thick - sum))
}
/** static level above the aquifer base */
export const staticHead = (a: Aquifer) => (a.kind === 'confined' ? (a.D ?? a.thick) : a.thick)
/** drawdown = static − head, along x */
export function drawdownAt(a: Aquifer, wells: Well[], x: number) {
  return staticHead(a) - headAt(a, wells, x)
}

/** the curve s(r) of one well, r from rw to R (log spaced so the steep part near the well is smooth) */
export function drawdownCurve(a: Aquifer, Q: number, n = 80) {
  const out: { r: number; s: number; head: number }[] = []
  for (let i = 0; i <= n; i++) {
    const r = a.rw * Math.pow(a.R / a.rw, i / n)
    const head = headAt(a, [{ x: 0, Q }], r)
    out.push({ r, s: staticHead(a) - head, head })
  }
  return out
}

/** Q for a chosen drawdown s_w at the well (single well), either aquifer */
export function yieldFor(a: Aquifer, s: number) {
  return a.kind === 'confined' ? thiemQ({ K: a.K, b: a.thick, s, rw: a.rw, R: a.R }) : dupuitQ({ K: a.K, D: a.thick, s, rw: a.rw, R: a.R })
}
