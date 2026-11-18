// Pumps and pumping mains the way Rowshan ma'am teaches them (RM L8 p22-47, Math procedures M4-M7).
// Pure functions, no React. Units are the paper's own: SI (m, m3/s, kW) or FPS (ft, cfs / gpm, hp).
//
// Her conventions (digest "Math procedures as taught"):
//  - friction head  h_f = f L v^2 / (2 g d), f used directly (Darcy form, no factor 4)
//  - total head     H = h_s + h_f + h_v (+ sum K v^2/2g when minor losses are given)
//  - 1 British gallon = 0.16 ft3 (so Q[cfs] = Q[gpm] x 0.16 / 60); water hp = H Q[gpm] / 3960 as printed on the slide
//    (3960 is really the US-gallon constant; the exact British one is 3300, see `waterHpGpm`)
//  - brake (input) power = water power / efficiency

export const G_SI = 9.81
export const G_FPS = 32.2
/** her British gallon, in ft3 (slide: 1 British gallon = 0.16 cubic ft) */
export const GAL_FT3 = 0.16
export const FT3_L = 28.3168
/** her gallon in litres */
export const GAL_L = GAL_FT3 * FT3_L
export const FT_M = 0.3048
export const HP_KW = 0.7457
export const GAMMA_FPS = 62.4 // lb/ft3

// ------------------------------------------------------------------ discharge and pipe
/** discharge per second from a daily volume pumped in `hours` hours (any volume unit) */
export const flowFromDaily = (perDay: number, hours: number) => perDay / (hours * 3600)
/** gallons per minute from gallons per day pumped in `hours` hours */
export const gpmFromGpd = (gpd: number, hours: number) => gpd / (hours * 60)
/** British gpm to cfs (her 0.16 ft3 per gallon) */
export const cfsFromGpm = (gpm: number) => (gpm * GAL_FT3) / 60
export const cfsFromLps = (lps: number) => lps / FT3_L
export const lpsFromCfs = (cfs: number) => cfs * FT3_L
/** US gpm equivalent of a flow in cfs (7.4805 gal/ft3) */
export const usGpmFromCfs = (cfs: number) => (cfs * 60) / (1 / 7.4805)

export interface PipeSize {
  Q: number
  v: number
  A: number
  d: number
}
/** diameter from velocity: A = Q/v, d = sqrt(4A/pi) */
export function pipeFromVelocity(Q: number, v: number): PipeSize {
  const A = Q / v
  return { Q, v, A, d: Math.sqrt((4 * A) / Math.PI) }
}
/** velocity from diameter: v = Q/A */
export function pipeFromDiameter(Q: number, d: number): PipeSize {
  const A = (Math.PI * d * d) / 4
  return { Q, v: Q / A, A, d }
}

// ------------------------------------------------------------------ heads
/** Darcy friction loss as she prints it: h_f = f L v^2 / (2 g d), f used directly (no 4) */
export const frictionHead = (f: number, L: number, v: number, d: number, g: number) => (f * L * v * v) / (2 * g * d)
export const velocityHead = (v: number, g: number) => (v * v) / (2 * g)
export const minorHead = (sumK: number, v: number, g: number) => (sumK * v * v) / (2 * g)

export interface StaticHead {
  /** discharge water level minus suction water level */
  hs: number
  /** suction head Hs at the pump: + flooded (water above pump), - lift (water below pump) */
  Hs: number
  /** discharge head above the pump axis */
  Hd: number
  lift: boolean
}
/** static head from levels (RL / elevations). Pump centre-line is optional: it only fixes lift vs flooded suction. */
export function staticHead(o: { sourceWL: number; deliveryWL: number; pumpCL?: number }): StaticHead {
  const pump = o.pumpCL ?? o.sourceWL
  const Hs = o.sourceWL - pump
  const Hd = o.deliveryWL - pump
  return { hs: o.deliveryWL - o.sourceWL, Hs, Hd, lift: Hs < 0 }
}

export interface HeadOut {
  hs: number
  hf: number
  hv: number
  hm: number
  H: number
}
/** total head H = h_s + h_f + h_v (+ h_m) */
export function totalHead(o: { hs: number; f: number; L: number; v: number; d: number; g: number; sumK?: number; velocityHead?: boolean }): HeadOut {
  const hf = frictionHead(o.f, o.L, o.v, o.d, o.g)
  const hv = o.velocityHead === false ? 0 : velocityHead(o.v, o.g)
  const hm = minorHead(o.sumK ?? 0, o.v, o.g)
  return { hs: o.hs, hf, hv, hm, H: o.hs + hf + hv + hm }
}

// ------------------------------------------------------------------ power
export interface PowerOut {
  waterKW: number
  waterHp: number
  /** brake / input power to the pump shaft */
  inputKW: number
  inputHp: number
  /** electrical input to the motor when a motor efficiency is given */
  motorKW?: number
  motorHp?: number
  /** metric horsepower gamma h Q / 75 (her p40 SI formula) */
  waterHpMetric?: number
}
function finishPower(waterKW: number, eta: number, etaMotor?: number): PowerOut {
  const inputKW = waterKW / eta
  const o: PowerOut = { waterKW, waterHp: waterKW / HP_KW, inputKW, inputHp: inputKW / HP_KW }
  if (etaMotor) {
    o.motorKW = inputKW / etaMotor
    o.motorHp = o.motorKW / HP_KW
  }
  return o
}
/** SI: P_w = gamma Q H (kW, gamma in kN/m3). */
export function powerSI(Q: number, H: number, eta: number, o?: { etaMotor?: number; gamma?: number }): PowerOut {
  const gamma = o?.gamma ?? G_SI
  const out = finishPower(gamma * Q * H, eta, o?.etaMotor)
  out.waterHpMetric = (1000 * H * Q) / 75
  return out
}
/** FPS with the exact constants: P_w = 62.4 Q[cfs] H[ft] / 550 hp. Right for flows given in cusec, litres, or US gallons. */
export function powerFps(Qcfs: number, H: number, eta: number, o?: { etaMotor?: number }): PowerOut {
  const whp = (GAMMA_FPS * Qcfs * H) / 550
  return finishPower(whp * HP_KW, eta, o?.etaMotor)
}
/** Her slide formula: P_w = H Q[gpm] / k, k = 3960 as printed (3300 is the exact British-gallon constant). */
export function waterHpGpm(H: number, gpm: number, k = 3960) {
  return (H * gpm) / k
}
/** Her way with gallons: water hp = H Q[gpm]/3960, BHP = water hp / eta (Example 1 p41) */
export function powerGpm(H: number, gpm: number, eta: number, o?: { k?: number; etaMotor?: number }): PowerOut {
  const whp = waterHpGpm(H, gpm, o?.k ?? 3960)
  return finishPower(whp * HP_KW, eta, o?.etaMotor)
}

// ------------------------------------------------------------------ one-call design (M4)
export interface DesignIn {
  system: 'si' | 'fps'
  /** m3/s (si) or cfs (fps) */
  Q: number
  /** give velocity (diameter follows) ... */
  v?: number
  /** ... or diameter (velocity follows). `d` wins when both are given. */
  d?: number
  f: number
  L: number
  /** static head: discharge water level minus suction water level */
  hs: number
  sumK?: number
  /** false leaves out the velocity head (default true, as in Example 1) */
  velocityHead?: boolean
}
export interface DesignOut extends HeadOut {
  system: 'si' | 'fps'
  g: number
  pipe: PipeSize
  L: number
  f: number
}
export function design(i: DesignIn): DesignOut {
  const g = i.system === 'si' ? G_SI : G_FPS
  const pipe = i.d != null ? pipeFromDiameter(i.Q, i.d) : pipeFromVelocity(i.Q, i.v ?? 1)
  const h = totalHead({ hs: i.hs, f: i.f, L: i.L, v: pipe.v, d: pipe.d, g, sumK: i.sumK, velocityHead: i.velocityHead })
  return { ...h, system: i.system, g, pipe, L: i.L, f: i.f }
}

// ------------------------------------------------------------------ NPSH (M6)
/** NPSH_av = H_abs + H_S - h_L - H_vp (all in metres or feet of the liquid); H_S + flooded, - lift */
export const npshAvailable = (o: { Habs: number; Hs: number; hL: number; Hvp: number }) => o.Habs + o.Hs - o.hL - o.Hvp
/** pressure (kPa) to head (m) */
export const headFromKPa = (kPa: number, gammaNm3 = 9810) => (kPa * 1000) / gammaNm3

// ------------------------------------------------------------------ curves (M5 operating point, M7 combinations)
export type Curve = (Q: number) => number
/** piecewise-linear curve through points (sorted by Q); linear extrapolation beyond the ends */
export function interp(pts: [number, number][]): Curve {
  const p = [...pts].sort((a, b) => a[0] - b[0])
  return (Q) => {
    let i = 1
    while (i < p.length - 1 && Q > p[i][0]) i++
    const [x0, y0] = p[i - 1]
    const [x1, y1] = p[i]
    return y0 + ((y1 - y0) * (Q - x0)) / (x1 - x0)
  }
}
/** two pumps in parallel: discharges add at each head, so H(Q) = H1(Q/2) */
export const parallel = (p: Curve): Curve => (Q) => p(Q / 2)
/** two pumps in series: heads add at each discharge, so H(Q) = 2 H1(Q) */
export const series = (p: Curve): Curve => (Q) => 2 * p(Q)
/** system curve H = hs + k Q^2 */
export const systemCurve = (hs: number, k: number): Curve => (Q) => hs + k * Q * Q
/** k from a pipeline: (f L / d + sum K) / (2 g A^2) so that h_f + h_m = k Q^2 (velocity head left to `withVelocityHead`) */
export function systemK(o: { f: number; L: number; d: number; sumK?: number; g: number; velocityHead?: boolean }) {
  const A = (Math.PI * o.d * o.d) / 4
  return ((o.f * o.L) / o.d + (o.sumK ?? 0) + (o.velocityHead === false ? 0 : 1)) / (2 * o.g * A * A)
}
/** pump curve H = H0 (1 - (Q/Qr)^2): shut-off head H0, run-out discharge Qr (falls slowly at first, steeply later) */
export const quadPump = (H0: number, Qr: number): Curve => (Q) => H0 * (1 - (Q / Qr) ** 2)
/** efficiency curve eta = etaBep (2q - q^2), q = Q/Qbep: peak at the best-efficiency point, zero at 0 and 2 Qbep */
export const effCurve = (etaBep: number, Qbep: number): Curve => (Q) => Math.max(0, etaBep * (2 * (Q / Qbep) - (Q / Qbep) ** 2))
/** NPSH required rises with discharge: N0 + b Q^2 */
export const npshReqCurve = (N0: number, b: number): Curve => (Q) => N0 + b * Q * Q

export interface OpPoint {
  Q: number
  H: number
}
/** intersection of a falling pump curve with a rising system curve on [Qlo, Qhi] (bisection); null when they don't meet */
export function operatingPoint(pump: Curve, sys: Curve, Qlo: number, Qhi: number): OpPoint | null {
  let a = Qlo
  let b = Qhi
  let fa = pump(a) - sys(a)
  const fb = pump(b) - sys(b)
  if (fa < 0) return null
  if (fb > 0) return null
  for (let i = 0; i < 80; i++) {
    const m = (a + b) / 2
    const fm = pump(m) - sys(m)
    if (fm >= 0) {
      a = m
      fa = fm
    } else b = m
  }
  const Q = (a + b) / 2
  return { Q, H: sys(Q) }
}
