// Mohr circle and pole (AJK sir, Lecture 5 slides 16, 19, 40; Das §10.2–10.3).
// Sign convention (Das): compression positive. sz = normal stress on the HORIZONTAL plane (vertical stress),
// sx = normal stress on the VERTICAL plane, txz = Das's τxy. Plane angle θ is measured counter-clockwise
// from the horizontal. τ is plotted upward when positive by Das eq. 10.4, so a line drawn through the
// pole at the plane's true angle meets the circle at the stresses on that plane.

import { deg, rad } from './units'

export interface Stress2D {
  /** normal stress on the vertical plane (horizontal stress), kPa */
  sx: number
  /** normal stress on the horizontal plane (vertical stress), kPa */
  sz: number
  /** shear stress (Das τxy), kPa */
  txz: number
}

export interface Circle {
  /** centre (σ1 + σ3)/2 */
  C: number
  /** radius (σ1 − σ3)/2 */
  R: number
  s1: number
  s3: number
}

export interface Envelope {
  /** cohesion intercept c (kPa) */
  c: number
  /** friction angle φ (deg) */
  phi: number
}

export const circle = (s1: number, s3: number): Circle => {
  const hi = Math.max(s1, s3),
    lo = Math.min(s1, s3)
  return { C: (hi + lo) / 2, R: (hi - lo) / 2, s1: hi, s3: lo }
}

/** stresses on the plane at θ (deg, counter-clockwise from the horizontal) — Das eqs 10.3–10.4 */
export function onPlane(st: Stress2D, thetaDeg: number) {
  const t = rad(2 * thetaDeg)
  const a = (st.sz - st.sx) / 2
  const sigma = (st.sz + st.sx) / 2 + a * Math.cos(t) + st.txz * Math.sin(t)
  const tau = a * Math.sin(t) - st.txz * Math.cos(t)
  return { sigma, tau }
}

/** principal case: σ1 on the major principal plane, plane at θ from it — Das eqs 10.8–10.9 */
export function onPlaneFromPrincipal(s1: number, s3: number, thetaDeg: number) {
  const { C, R } = circle(s1, s3)
  const t = rad(2 * thetaDeg)
  return { sigma: C + R * Math.cos(t), tau: R * Math.sin(t) }
}

export interface MohrState extends Circle {
  /** pole (origin of planes): (σx, −τxy) */
  pole: { sigma: number; tau: number }
  /** angle of the major principal plane (the plane σ1 acts on), deg ccw from horizontal, in (−90, 90] */
  thMajor: number
  /** angle of the minor principal plane */
  thMinor: number
  /** τmax = R, on planes at 45° to the principal planes */
  tauMax: number
  thTauMax: [number, number]
}

const norm90 = (a: number) => {
  let x = a % 180
  if (x <= -90) x += 180
  if (x > 90) x -= 180
  return x
}

export function mohr(st: Stress2D): MohrState {
  const a = (st.sz - st.sx) / 2
  const R = Math.hypot(a, st.txz)
  const C = (st.sz + st.sx) / 2
  const thMajor = R < 1e-12 ? 0 : norm90(deg(Math.atan2(st.txz, a)) / 2)
  return {
    C,
    R,
    s1: C + R,
    s3: C - R,
    pole: { sigma: st.sx, tau: -st.txz },
    thMajor,
    thMinor: norm90(thMajor + 90),
    tauMax: R,
    thTauMax: [norm90(thMajor + 45), norm90(thMajor - 45)],
  }
}

/** element with σ1 acting on a plane at thMajor (deg from horizontal) → σx, σz, τ */
export function elementFromPrincipal(s1: number, s3: number, thMajor = 0): Stress2D {
  const C = (s1 + s3) / 2,
    R = (s1 - s3) / 2
  const t = rad(2 * thMajor)
  return { sz: C + R * Math.cos(t), sx: C - R * Math.cos(t), txz: R * Math.sin(t) }
}

/** does the circle reach the envelope? margin = R − (C sinφ + c cosφ) (≥ 0 → failure) */
export function touches(c: Circle, env: Envelope) {
  const p = rad(env.phi)
  const need = c.C * Math.sin(p) + env.c * Math.cos(p)
  return { need, margin: c.R - need, fails: c.R >= need - 1e-9 }
}

/** failure plane of a circle tangent to the envelope: θf = 45 + φ/2 from the major principal plane, and the stresses there */
export function failurePlane(c: Circle, phiDeg: number) {
  const p = rad(phiDeg)
  const theta = 45 + phiDeg / 2
  return {
    theta,
    /** 2θ = 90 + φ */
    twoTheta: 90 + phiDeg,
    sigma: c.C - c.R * Math.sin(p),
    tau: c.R * Math.cos(p),
    /** AJK sir's construction: x = R cos(180 − 2θ) */
    x: c.R * Math.cos(rad(180 - 2 * theta)),
  }
}

/** obliquity of the resultant on a plane: tan⁻¹(|τ|/σ) */
export const obliquity = (sigma: number, tau: number) => deg(Math.atan2(Math.abs(tau), sigma))
/** maximum obliquity of a circle (envelope through the origin): sin⁻¹(R/C) */
export const maxObliquity = (c: Circle) => deg(Math.asin(Math.min(1, c.R / c.C)))

/** factor of safety on a plane: (c + σ tanφ)/|τ| */
export const fsOnPlane = (sigma: number, tau: number, env: Envelope) => (env.c + sigma * Math.tan(rad(env.phi))) / Math.abs(tau)

/** point where the circle is tangent to an envelope (σ, τ) — valid when touching */
export function tangentPoint(c: Circle, phiDeg: number) {
  const p = rad(phiDeg)
  return { sigma: c.C - c.R * Math.sin(p), tau: c.R * Math.cos(p) }
}

/** circle through a direct-shear failure point (σ, τ) tangent to the envelope with angle φ (2012-13 Q5) */
export function circleFromTangentPoint(sigma: number, tau: number, phiDeg: number): Circle {
  const p = rad(phiDeg)
  const C = sigma + tau * Math.tan(p)
  const R = tau / Math.cos(p)
  return { C, R, s1: C + R, s3: C - R }
}
