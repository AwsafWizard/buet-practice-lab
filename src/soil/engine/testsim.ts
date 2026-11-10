// A small soil model for the shear "test bench" lab: it runs UU, CU and CD tests in a triaxial cell or a
// shear box and returns the readings against strain, so the apparatus drawing and every chart share one source.
//
// The curve SHAPES are qualitative (they are the textbook sketches); the failure values are exact Mohr–Coulomb:
//   drained    Δσf = σ′3 (Kp − 1) + 2c′√Kp,  Kp = tan²(45 + φ′/2)
//   undrained  Δuf = Af Δσf  →  Δσf = [σ′3c (Kp − 1) + 2c′√Kp] / [1 + Af (Kp − 1)]
//   UU         the specimen keeps the effective stress it arrived with (B = 1), so Δσf does not depend on σ3
// so the circles of several specimens are tangent to one effective envelope, as in a real set of tests.
import { circle, type Circle, type Envelope } from './mohr'
import { deg, rad } from './units'

export type SimSoil = 'nc' | 'oc' | 'loose' | 'dense'
export type SimTest = 'uu' | 'cu' | 'cd'

export interface SimSoilModel {
  name: string
  clay: boolean
  /** soil that dilates when sheared (dense sand, heavily OC clay) */
  dilative: boolean
  /** effective envelope at peak */
  peak: Envelope
  /** effective envelope at large strain (critical state) */
  ult: Envelope
  /** Skempton's A at failure (undrained) */
  Af: number
  /** drained volumetric strain at the end of the run, % (+ = expansion) */
  evEnd: number
  /** the soil it is usually sketched against */
  partner: SimSoil
}

/** one clay in two stress histories, one sand in two densities */
export const SIM_SOILS: Record<SimSoil, SimSoilModel> = {
  nc: { name: 'NC clay', clay: true, dilative: false, peak: { c: 0, phi: 24 }, ult: { c: 0, phi: 24 }, Af: 0.9, evEnd: -4, partner: 'oc' },
  oc: { name: 'Heavily OC clay', clay: true, dilative: true, peak: { c: 30, phi: 24 }, ult: { c: 0, phi: 24 }, Af: -0.3, evEnd: 2, partner: 'nc' },
  loose: { name: 'Loose sand', clay: false, dilative: false, peak: { c: 0, phi: 30 }, ult: { c: 0, phi: 30 }, Af: 0, evEnd: -2.5, partner: 'dense' },
  dense: { name: 'Dense sand', clay: false, dilative: true, peak: { c: 0, phi: 38 }, ult: { c: 0, phi: 30 }, Af: 0, evEnd: 3, partner: 'loose' },
}

/** axial strain at the end of a triaxial run (%), shear displacement at the end of a shear-box run (mm) */
export const EPS_MAX = 20
export const DISP_MAX = 10
/** shear-box specimen height (mm), for ΔH */
export const DS_H0 = 20
/** effective stress a UU specimen carries from the field (kPa) */
export const SIGMA0 = 100
/** run fraction at which a dilative soil peaks in a drained test */
export const U_PEAK = 0.25

const Kp = (phi: number) => Math.tan(rad(45 + phi / 2)) ** 2

/** sand drains at once, so only clay can be tested undrained */
export const effTest = (soil: SimSoil, test: SimTest): SimTest => (SIM_SOILS[soil].clay ? test : 'cd')

/** deviator at failure for an effective minor stress σ′3 */
export const drainedDev = (s3p: number, env: Envelope) => s3p * (Kp(env.phi) - 1) + 2 * env.c * Math.sqrt(Kp(env.phi))

/** undrained deviator at failure for a specimen consolidated to σ′3c, with Δuf = Af Δσf */
export const undrainedDev = (s3c: number, env: Envelope, Af: number) => drainedDev(s3c, env) / (1 + Af * (Kp(env.phi) - 1))

/** the total-stress (CU) envelope the model implies: the same line the total circles are tangent to */
export function totalEnvelope(soil: SimSoil): Envelope {
  const m = SIM_SOILS[soil]
  const k = Kp(m.peak.phi)
  const den = 1 + m.Af * (k - 1)
  const kt = 1 + (k - 1) / den
  return { c: (m.peak.c * Math.sqrt(k)) / (den * Math.sqrt(kt)), phi: deg(Math.asin((kt - 1) / (kt + 1))) }
}

// ---------------------------------------------------------------- shapes (u = fraction of the run, 0…1)

/** smooth rise that reaches exactly 1 at the end of the run */
export const rise = (u: number, k = 6) => (1 - Math.exp(-k * Math.max(0, Math.min(1, u)))) / (1 - Math.exp(-k))

/** mobilised strength / peak strength. r = ultimate / peak: r = 1 → no peak; r < 1 → peak at U_PEAK, then down to r */
export function mobilised(u: number, r: number) {
  const x = Math.max(0, Math.min(1, u))
  if (r > 0.999) return rise(x)
  if (x <= U_PEAK) return 1 - (1 - x / U_PEAK) ** 2.2
  return r + (1 - r) * Math.exp(-(((x - U_PEAK) / 0.22) ** 2))
}

// dilation: a small compression first, then expansion that is fastest at the peak and dies out at the critical state
const N = 400
const BUMP = (s: number) => Math.exp(-(((s - U_PEAK) / 0.2) ** 2))
const SIG: number[] = (() => {
  const a = [0]
  for (let i = 1; i <= N; i++) a.push(a[i - 1] + (BUMP((i - 1) / N) + BUMP(i / N)) / 2 / N)
  return a.map((v) => v / a[N])
})()
const sig = (u: number) => {
  const x = Math.max(0, Math.min(1, u)) * N
  const i = Math.min(N - 1, Math.floor(x))
  return SIG[i] + (SIG[i + 1] - SIG[i]) * (x - i)
}
const DIP = 0.15

/** drained volume change / its final value. Contractive soil: a plain rise. Dilative: dip, then the S-curve. */
export const volShape = (u: number, dilative: boolean) => (dilative ? -DIP * (1 - Math.exp(-Math.max(0, u) / 0.04)) + (1 + DIP) * sig(u) : rise(u, 5))

/** shear-induced pore pressure / Δσf. Af > 0: rises with the load. Af < 0: a small rise, then down to Af. */
export function duShape(u: number, Af: number) {
  if (Af >= 0) return Af * rise(u, 5)
  const p = 0.25
  return p * rise(u, 15) - (p - Af) * rise(u, 3)
}

// ---------------------------------------------------------------- triaxial

export interface TxState {
  /** axial strain, % */
  eps: number
  /** deviator stress σ1 − σ3 */
  dev: number
  /** pore pressure caused by shearing */
  du: number
  /** total pore pressure (UU: includes what the cell pressure left in the water) */
  u: number
  s3: number
  s1: number
  s3p: number
  s1p: number
  /** volumetric strain, % (+ = expansion); 0 when undrained */
  ev: number
}

/** pore pressure left by the cell pressure before shearing starts (UU only; CU and CD consolidate it away) */
export const uBeforeShear = (soil: SimSoil, test: SimTest, s3: number) => (effTest(soil, test) === 'uu' ? s3 - SIGMA0 : 0)

/** run fraction at which the specimen is taken to have failed */
export const failAt = (soil: SimSoil, test: SimTest) => (effTest(soil, test) === 'cd' && SIM_SOILS[soil].dilative ? U_PEAK : 1)

export function txState(soil: SimSoil, test: SimTest, s3: number, u01: number): TxState {
  const m = SIM_SOILS[soil]
  const t = effTest(soil, test)
  const x = Math.max(0, Math.min(1, u01))
  const eps = x * EPS_MAX
  if (t === 'cd') {
    const peak = drainedDev(s3, m.peak)
    const dev = peak * mobilised(x, drainedDev(s3, m.ult) / peak)
    return { eps, dev, du: 0, u: 0, s3, s1: s3 + dev, s3p: s3, s1p: s3 + dev, ev: m.evEnd * volShape(x, m.dilative) }
  }
  const s3c = t === 'uu' ? SIGMA0 : s3 // effective stress before shearing
  const u0 = s3 - s3c
  const du = undrainedDev(s3c, m.peak, m.Af) * duShape(x, m.Af)
  const dev = rise(x) * drainedDev(s3c - du, m.peak) // a fraction of the strength available at the current σ′3
  const u = u0 + du
  return { eps, dev, du, u, s3, s1: s3 + dev, s3p: s3 - u, s1p: s3 + dev - u, ev: 0 }
}

export const txFailure = (soil: SimSoil, test: SimTest, s3: number) => txState(soil, test, s3, failAt(soil, test))

export const txCircles = (s: TxState): { total: Circle; eff: Circle } => ({ total: circle(s.s1, s.s3), eff: circle(s.s1p, s.s3p) })

// ---------------------------------------------------------------- shear box

export interface DsState {
  /** shear displacement, mm */
  disp: number
  /** shear stress on the forced (horizontal) plane */
  tau: number
  /** change in specimen height, mm (+ = expansion); 0 in a quick test */
  dH: number
}

/** the line the shear box reports for this test: effective for the slow test, total for the quick ones */
export function dsEnvelope(soil: SimSoil, test: SimTest): Envelope {
  const m = SIM_SOILS[soil]
  const t = effTest(soil, test)
  if (t === 'cd') return m.peak
  if (t === 'cu') return totalEnvelope(soil)
  return { c: undrainedDev(SIGMA0, m.peak, m.Af) / 2, phi: 0 }
}

const onLine = (e: Envelope, sn: number) => e.c + sn * Math.tan(rad(e.phi))

export const dsPeak = (soil: SimSoil, test: SimTest, sn: number) => onLine(dsEnvelope(soil, test), sn)

/** shear stress at large displacement (drained: the critical-state line; quick tests: no drop is modelled) */
export const dsUltimate = (soil: SimSoil, test: SimTest, sn: number) => (effTest(soil, test) === 'cd' ? onLine(SIM_SOILS[soil].ult, sn) : dsPeak(soil, test, sn))

export function dsState(soil: SimSoil, test: SimTest, sn: number, u01: number): DsState {
  const m = SIM_SOILS[soil]
  const x = Math.max(0, Math.min(1, u01))
  const peak = dsPeak(soil, test, sn)
  if (effTest(soil, test) !== 'cd') return { disp: x * DISP_MAX, tau: peak * rise(x), dH: 0 }
  return { disp: x * DISP_MAX, tau: peak * mobilised(x, dsUltimate(soil, test, sn) / peak), dH: (m.evEnd / 100) * DS_H0 * volShape(x, m.dilative) }
}
