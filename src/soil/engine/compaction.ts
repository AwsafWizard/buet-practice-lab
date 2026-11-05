// Compaction and earthwork (SJMY sir, Lectures 4–6; Question Bank §2).
// Water contents are fractions (0.15 = 15 %). Unit weights / densities in any consistent unit:
// kN/m³ with gw = 9.81, t/m³ or g/cm³ with gw = 1, pcf with gw = 62.4.

import { GW } from './units'

export const gammaD = (gb: number, w: number) => gb / (1 + w)
/** dry unit weight at degree of saturation S: γd = Gsγw/(1 + wGs/S); S = 1 is the zero-air-void line */
export const gdAtS = (w: number, Gs: number, S = 1, gw = GW) => (Gs * gw) / (1 + (w * Gs) / S)
export const zav = (w: number, Gs: number, gw = GW) => gdAtS(w, Gs, 1, gw)
/** degree of saturation of a point (w, γd) */
export const satOf = (w: number, gd: number, Gs: number, gw = GW) => (w * Gs) / ((Gs * gw) / gd - 1)
export const voidRatio = (gd: number, Gs: number, gw = GW) => (Gs * gw) / gd - 1
export const gdFromE = (e: number, Gs: number, gw = GW) => (Gs * gw) / (1 + e)

// ---------------------------------------------------------------- Proctor test

export interface ProctorSpec {
  name: string
  astm: string
  blows: number
  layers: number
  /** hammer mass kg and drop m */
  massKg: number
  dropM: number
  /** mould volume cm³ */
  Vcm3: number
  lb: number
  dropIn: number
}
export const STANDARD: ProctorSpec = { name: 'Standard Proctor', astm: 'ASTM D-698 / AASHTO T-99', blows: 25, layers: 3, massKg: 2.495, dropM: 0.3048, Vcm3: 943.3, lb: 5.5, dropIn: 12 }
export const MODIFIED: ProctorSpec = { name: 'Modified Proctor', astm: 'ASTM D-1557 / AASHTO T-180', blows: 25, layers: 5, massKg: 4.536, dropM: 0.4572, Vcm3: 943.3, lb: 10, dropIn: 18 }

/** compactive energy per unit volume: kJ/m³ and ft-lb/ft³ */
export function energy(p: { blows: number; layers: number; massKg: number; dropM: number; Vcm3: number; lb?: number; dropIn?: number }) {
  const kJ = (p.blows * p.layers * p.massKg * 9.81 * p.dropM) / (p.Vcm3 * 1e-6) / 1000
  const ftlb = p.lb !== undefined && p.dropIn !== undefined ? (p.blows * p.layers * p.lb * (p.dropIn / 12)) / (p.Vcm3 / 28316.85) : kJ * 20.885
  return { kJ, ftlb }
}

export interface Pt {
  w: number
  gd: number
}

export interface Peak {
  omc: number
  mdd: number
  /** the three points the parabola went through */
  used: [Pt, Pt, Pt]
  /** false when the highest point is at an end of the data (the peak was not bracketed) */
  bracketed: boolean
  /** parabola coefficients gd = a w² + b w + c */
  a: number
  b: number
  c: number
}

/** peak of the compaction curve: parabola through the highest point and its two neighbours */
export function proctorPeak(data: Pt[]): Peak {
  const d = [...data].sort((p, q) => p.w - q.w)
  let m = 0
  d.forEach((p, k) => {
    if (p.gd > d[m].gd) m = k
  })
  const k = Math.min(Math.max(m, 1), d.length - 2)
  const [p1, p2, p3] = [d[k - 1], d[k], d[k + 1]]
  const den = (p1.w - p2.w) * (p1.w - p3.w) * (p2.w - p3.w)
  const a = (p3.w * (p2.gd - p1.gd) + p2.w * (p1.gd - p3.gd) + p1.w * (p3.gd - p2.gd)) / den
  const b = (p3.w * p3.w * (p1.gd - p2.gd) + p2.w * p2.w * (p3.gd - p1.gd) + p1.w * p1.w * (p2.gd - p3.gd)) / den
  const c = (p2.w * p3.w * (p2.w - p3.w) * p1.gd + p3.w * p1.w * (p3.w - p1.w) * p2.gd + p1.w * p2.w * (p1.w - p2.w) * p3.gd) / den
  const bracketed = m > 0 && m < d.length - 1 && a < 0
  if (!bracketed) return { omc: d[m].w, mdd: d[m].gd, used: [p1, p2, p3], bracketed, a, b, c }
  const omc = -b / (2 * a)
  return { omc, mdd: c - (b * b) / (4 * a), used: [p1, p2, p3], bracketed, a, b, c }
}

/** smooth plotted curve: monotone cubic (Fritsch–Carlson) through the data with the parabola peak as a knot,
 *  so the drawn curve peaks exactly at (OMC, MDD) and never overshoots between points */
export function proctorCurve(data: Pt[], n = 80): Pt[] {
  const pk = proctorPeak(data)
  let knots = [...data].sort((p, q) => p.w - q.w)
  if (pk.bracketed) {
    knots = knots.filter((p) => Math.abs(p.w - pk.omc) > 1e-6)
    knots.push({ w: pk.omc, gd: pk.mdd })
    knots.sort((p, q) => p.w - q.w)
  }
  return monotoneCubic(knots, n)
}

export function monotoneCubic(k: Pt[], n = 80): Pt[] {
  const N = k.length
  if (N < 2) return k
  const dx: number[] = []
  const sl: number[] = []
  for (let i = 0; i < N - 1; i++) {
    dx.push(k[i + 1].w - k[i].w)
    sl.push((k[i + 1].gd - k[i].gd) / dx[i])
  }
  const m: number[] = [sl[0]]
  for (let i = 1; i < N - 1; i++) m.push(sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2)
  m.push(sl[N - 2])
  for (let i = 0; i < N - 1; i++) {
    if (sl[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / sl[i]
    const b = m[i + 1] / sl[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * sl[i]
      m[i + 1] = t * b * sl[i]
    }
  }
  const out: Pt[] = []
  const w0 = k[0].w
  const w1 = k[N - 1].w
  for (let q = 0; q <= n; q++) {
    const w = w0 + ((w1 - w0) * q) / n
    let i = 0
    while (i < N - 2 && w > k[i + 1].w) i++
    const h = dx[i]
    const t = (w - k[i].w) / h
    const h00 = 2 * t ** 3 - 3 * t * t + 1
    const h10 = t ** 3 - 2 * t * t + t
    const h01 = -2 * t ** 3 + 3 * t * t
    const h11 = t ** 3 - t * t
    out.push({ w, gd: h00 * k[i].gd + h10 * h * m[i] + h01 * k[i + 1].gd + h11 * h * m[i + 1] })
  }
  // make sure the knots themselves are on the curve (exact peak)
  for (const p of k) if (!out.some((o) => Math.abs(o.w - p.w) < 1e-9)) out.push(p)
  return out.sort((p, q) => p.w - q.w)
}

/** degree of saturation along the line of optimums (from a known peak) */
export const optimumSaturation = (pk: { omc: number; mdd: number }, Gs: number, gw = GW) => satOf(pk.omc, pk.mdd, Gs, gw)

/** a model soil for the energy toggle: more energy → higher MDD, OMC on the same line of optimums (S constant).
 *  ΔMDD ≈ 9 % for Modified vs Standard (2017-18 Q5(a): 1.76 → 1.92 t/m³; OMC 15.5 → 11.6 %, data 11.7 %). */
export function shiftForEnergy(pk: { omc: number; mdd: number }, Gs: number, Eratio: number, gw = GW) {
  const S = optimumSaturation(pk, Gs, gw)
  const mdd = pk.mdd * (1 + (0.09 * Math.log10(Eratio)) / Math.log10(4.55))
  const e = (Gs * gw) / mdd - 1
  return { omc: (S * e) / Gs, mdd, S }
}

/** model compaction curve (parabolas on the dry and wet sides, kept below the S = 97 % line) */
export function modelCurve(pk: { omc: number; mdd: number }, Gs: number, w: number, gw = GW) {
  const dw = w - pk.omc
  const g = pk.mdd * (1 - (dw < 0 ? 11 : 14) * dw * dw)
  return Math.min(g, gdAtS(w, Gs, 0.97, gw))
}

// ---------------------------------------------------------------- field control

export interface FieldTest {
  /** either volume + wet + dry mass (consistent units, e.g. cm³ and g → g/cm³) */
  V?: number
  Wwet?: number
  Wdry?: number
  /** or bulk density / unit weight and water content */
  gb?: number
  w?: number
}

export function fieldTest(t: FieldTest) {
  if (t.V !== undefined && t.Wwet !== undefined && t.Wdry !== undefined) {
    const w = (t.Wwet - t.Wdry) / t.Wdry
    return { gb: t.Wwet / t.V, w, gd: t.Wdry / t.V }
  }
  const w = t.w ?? 0
  const gb = t.gb ?? NaN
  return { gb, w, gd: gb / (1 + w) }
}

export interface Spec {
  mdd: number
  omc: number
  /** minimum relative compaction (0.95) */
  rcMin: number
  /** allowed deviation from OMC (0.02 = ±2 %); undefined = no water-content limit */
  dw?: number
}

export function checkSpec(gd: number, w: number, s: Spec) {
  const rc = gd / s.mdd
  const okRC = rc >= s.rcMin - 1e-12
  const lo = s.dw !== undefined ? s.omc - s.dw : -Infinity
  const hi = s.dw !== undefined ? s.omc + s.dw : Infinity
  const okW = w >= lo - 1e-12 && w <= hi + 1e-12
  const why: string[] = []
  if (!okRC) why.push(`under-compacted: γd is ${(rc * 100).toFixed(1)} % of MDD, below ${(s.rcMin * 100).toFixed(0)} %`)
  if (w < lo - 1e-12) why.push(`too dry: w = ${(w * 100).toFixed(1)} % is below OMC − ${((s.dw ?? 0) * 100).toFixed(1)} % = ${(lo * 100).toFixed(1)} % (not enough water to lubricate the grains into a dense packing)`)
  if (w > hi + 1e-12) why.push(`too wet: w = ${(w * 100).toFixed(1)} % is above OMC + ${((s.dw ?? 0) * 100).toFixed(1)} % = ${(hi * 100).toFixed(1)} % (water fills the voids and holds the grains apart; dry it out and re-roll)`)
  return { rc, okRC, okW, pass: okRC && okW, lo, hi, gdReq: s.rcMin * s.mdd, why }
}

/** relative compaction from relative density: RC = A/[1 − Dr(1 − A)], A = γd,min/γd,max; Lee & Singh: RC = 80 + 0.2Dr (%) */
export const rcFromDr = (Dr: number, gdMin: number, gdMax: number) => {
  const A = gdMin / gdMax
  return A / (1 - Dr * (1 - A))
}
export const drFromGd = (gd: number, gdMin: number, gdMax: number) => ((gd - gdMin) / (gdMax - gdMin)) * (gdMax / gd)
export const leeSinghRC = (DrPct: number) => 80 + 0.2 * DrPct

// ---------------------------------------------------------------- field density tests

export interface SandCone {
  /** calibrated density of the test sand (same mass/volume units as the result) */
  rhoSand: number
  /** sand needed to fill the cone, Wcone = W1 − W2 (or give W1, W2) */
  Wcone?: number
  W1?: number
  W2?: number
  /** jar + cone + sand before (W3) and after (W5) the field test */
  W3: number
  W5: number
  /** soil from the hole: wet mass, and either its dry mass or w */
  Wwet: number
  Wdry?: number
  w?: number
}

export function sandCone(s: SandCone) {
  const Wcone = s.Wcone ?? (s.W1 ?? 0) - (s.W2 ?? 0)
  const W6 = s.W3 - s.W5 - Wcone
  const V = W6 / s.rhoSand
  const w = s.w ?? (s.Wdry !== undefined ? (s.Wwet - s.Wdry) / s.Wdry : 0)
  const Wdry = s.Wdry ?? s.Wwet / (1 + w)
  return { Wcone, W6, V, rhoB: s.Wwet / V, rhoD: Wdry / V, w, Wdry }
}

/** core cutter / undisturbed cylinder: diameter and length (cm) and masses (g) → g/cm³ */
export function coreCutter(o: { D: number; L: number; W: number; wWet?: number; wDry?: number; w?: number }) {
  const V = (Math.PI / 4) * o.D * o.D * o.L
  const w = o.w ?? (o.wWet !== undefined && o.wDry !== undefined ? (o.wWet - o.wDry) / o.wDry : 0)
  const rhoB = o.W / V
  return { V, rhoB, w, rhoD: rhoB / (1 + w) }
}

// ---------------------------------------------------------------- earthwork

/** dry unit weight of a state given any of: γd; γ and w; e and Gs; RC × MDD */
export type State = { gd: number; w?: number } | { gb: number; w: number } | { e: number; Gs: number; w?: number } | { rc: number; mdd: number; w?: number }
export function gdOf(s: State, gw = GW): number {
  if ('gd' in s) return s.gd
  if ('gb' in s) return s.gb / (1 + s.w)
  if ('e' in s) return (s.Gs * gw) / (1 + s.e)
  return s.rc * s.mdd
}
export const wOf = (s: State) => ('w' in s && s.w !== undefined ? s.w : NaN)

/** trapezoidal embankment section: top width b, height H, side slopes 1 V : n H → area per metre */
export function embankmentArea(top: number, H: number, n: number) {
  const bottom = top + 2 * n * H
  return { bottom, area: ((top + bottom) / 2) * H }
}

export interface SourcePlan {
  /** dry weight (or mass) of solids needed */
  Ws: number
  gdBank: number
  /** volume dug from the borrow pit (in-place) */
  Vbank: number
  /** loose (truck) volume and truck loads */
  Vloose: number
  trucks: number
  /** water to add (weight / mass) and its volume; negative = the soil must be dried */
  water: number
  waterVol: number
  waterTrucks: number
}

/**
 * solids are conserved: Ws = γd,fill × Vfill; Vbank = Ws/γd,bank; loose volume from a loose γd or a bulking factor;
 * water to add = (w_fill − w_bank) Ws. Units follow gw (9.81 → kN and m³ of water; 1 → t and m³).
 */
export function borrowPlan(o: { Vfill: number; fill: State; bank: State; loose?: State; bulking?: number; truck?: number; gw?: number }): SourcePlan {
  const gw = o.gw ?? GW
  const gdFill = gdOf(o.fill, gw)
  const Ws = gdFill * o.Vfill
  const gdBank = gdOf(o.bank, gw)
  const Vbank = Ws / gdBank
  const Vloose = o.loose ? Ws / gdOf(o.loose, gw) : Vbank * (1 + (o.bulking ?? 0))
  const cap = o.truck ?? 0
  const water = (wOf(o.fill) - wOf(o.bank)) * Ws
  const waterVol = water / gw
  return { Ws, gdBank, Vbank, Vloose, trucks: cap ? Math.ceil(Vloose / cap - 1e-9) : NaN, water, waterVol, waterTrucks: cap ? Math.ceil(Math.max(0, waterVol) / cap - 1e-9) : NaN }
}

/** water to bring a volume of soil (γd, w) to full saturation: (e/Gs − w)·Ws */
export function waterToSaturate(o: { V: number; e: number; Gs: number; w: number; gw?: number }) {
  const gw = o.gw ?? GW
  const Ws = (o.Gs * gw * o.V) / (1 + o.e)
  const wSat = o.e / o.Gs
  return { Ws, wSat, water: (wSat - o.w) * Ws, waterVol: ((wSat - o.w) * Ws) / gw }
}

/** fill volume from a borrowed volume (solids conserved) by void ratios */
export const fillFromBorrow = (Vborrow: number, eBorrow: number, eFill: number) => (Vborrow / (1 + eBorrow)) * (1 + eFill)

/** new void ratio after a settlement ΔH of a layer H: Δe = (1 + e0)ΔH/H */
export const eAfterSettlement = (e0: number, dH: number, H: number) => e0 - ((1 + e0) * dH) / H
