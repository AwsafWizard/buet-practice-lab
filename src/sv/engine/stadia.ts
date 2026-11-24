// Stadia tacheometry with a fixed-hair theodolite, staff held vertical.
// D = K·s + C on a level sight; inclined sight: D = K·s·cos²θ + C·cosθ, V = K·s·sin2θ/2 + C·sinθ.

import { latDep, RAD } from './angle'

export interface ConstantShot {
  /** taped horizontal distance from the instrument to the staff */
  d: number
  /** stadia intercept s = upper − lower (same unit as d) */
  s: number
}

/**
 * Tacheometric constants K (multiplying) and C (additive) from two or more shots on level ground.
 * Two shots: K = (D₂ − D₁)/(s₂ − s₁), C = D₁ − K·s₁. More: least squares on D = K·s + C.
 */
export function stadiaConstants(shots: ConstantShot[]): { K: number; C: number; residuals: number[] } | null {
  const ok = shots.filter((p) => isFinite(p.d) && isFinite(p.s))
  if (ok.length < 2) return null
  const n = ok.length
  const sx = ok.reduce((a, p) => a + p.s, 0)
  const sy = ok.reduce((a, p) => a + p.d, 0)
  const sxx = ok.reduce((a, p) => a + p.s * p.s, 0)
  const sxy = ok.reduce((a, p) => a + p.s * p.d, 0)
  const den = n * sxx - sx * sx
  if (Math.abs(den) < 1e-12) return null
  const K = (n * sxy - sx * sy) / den
  const C = (sy - K * sx) / n
  return { K, C, residuals: ok.map((p) => p.d - (K * p.s + C)) }
}

export interface StadiaShot {
  label?: string
  /** whole-circle bearing (or the horizontal angle from the reference direction), degrees */
  bearing: number
  upper: number
  lower: number
  /** middle (axial) hair reading; defaults to the mean of upper and lower */
  mid?: number | null
  /** vertical angle, + elevation / − depression (degrees), 0 for a level sight */
  va?: number | null
}

export interface StadiaPoint extends StadiaShot {
  s: number
  hd: number
  v: number
  rl: number | null
  e: number
  n: number
}

/** horizontal distance and vertical component for one shot */
export function stadiaReduce(s: number, va: number, K: number, C: number) {
  const t = va * RAD
  return { hd: K * s * Math.cos(t) ** 2 + C * Math.cos(t), v: (K * s * Math.sin(2 * t)) / 2 + C * Math.sin(t) }
}

/**
 * Every staff point from one instrument station. RL of a point = RL(station) + h(instrument) + V − mid reading
 * (when the station RL and instrument height are given).
 */
export function stadiaPoints(shots: StadiaShot[], K: number, C: number, stn?: { rl?: number | null; hi?: number | null; e?: number; n?: number }): StadiaPoint[] {
  return shots.map((p) => {
    const s = Math.abs(p.upper - p.lower)
    const va = p.va ?? 0
    const { hd, v } = stadiaReduce(s, va, K, C)
    const mid = p.mid ?? (p.upper + p.lower) / 2
    const rl = stn && stn.rl != null && stn.hi != null && isFinite(stn.rl) && isFinite(stn.hi) ? stn.rl + stn.hi + v - mid : null
    const { lat, dep } = latDep(hd, p.bearing)
    return { ...p, mid, s, hd, v, rl, e: (stn?.e ?? 0) + dep, n: (stn?.n ?? 0) + lat }
  })
}
