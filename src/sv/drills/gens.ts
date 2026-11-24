// Short field sums for the daily assessments and the quizzes: every call makes a fresh problem (seeded),
// with the answer(s) and the worked steps. Numbers go through the same engines as the field-book sheets.
import { fmtDMS, latDep, norm360, RAD, reducedBearing, wcbOf } from '../engine/angle'
import { reduceLevels } from '../engine/level'
import { stadiaReduce } from '../engine/stadia'
import { towerSameLevel, heron } from '../engine/height'
import { acres } from '../engine/traverse'
import type { SvTopicId } from '../../store'

export interface DrillAnswer {
  label: string
  value: number
  unit?: string
  /** relative tolerance (default 0.5 %) */
  tol?: number
  /** absolute tolerance floor */
  abs?: number
  /** an angle typed as d m s is accepted */
  angle?: boolean
}

export interface Drill {
  q: string
  answers: DrillAnswer[]
  steps: string
}

export interface DrillGen {
  id: string
  topic: SvTopicId
  title: string
  make: (rnd: () => number) => Drill
}

/** mulberry32 */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)]
const between = (r: () => number, lo: number, hi: number, dp = 0) => +(lo + r() * (hi - lo)).toFixed(dp)
const f = (v: number, dp = 3) => v.toFixed(dp)
/** a whole-minute angle in degrees */
const angleMin = (r: () => number, lo: number, hi: number) => Math.round((lo + r() * (hi - lo)) * 60) / 60

export const DRILLS: DrillGen[] = [
  // ───────────── instruments / chain
  {
    id: 'chainage',
    topic: 'sv-chain',
    title: 'Chainage notation',
    make: (r) => {
      const ft = between(r, 30, 480, 0) + pick(r, [0, 0.5])
      const notation = `${Math.floor(ft / 100)}+${String(+(ft % 100).toFixed(1)).padStart(2, '0')}`
      return {
        q: `With a 100 ft engineer’s chain, a point is booked at chainage **${notation}**. How far is it from the start of the line? And how many arrows has the follower collected when the leader reaches it (one arrow per full chain)?`,
        answers: [
          { label: 'Distance', value: ft, unit: 'ft' },
          { label: 'Arrows with the follower', value: Math.floor(ft / 100), abs: 0 },
        ],
        steps: `“a+b” = a chains + b ft → ${Math.floor(ft / 100)} × 100 + ${+(ft % 100).toFixed(1)} = **${ft} ft**. Each completed chain length hands one arrow back → **${Math.floor(ft / 100)}**.`,
      }
    },
  },
  {
    id: 'tape-length',
    topic: 'sv-chain',
    title: 'Wrong tape length',
    make: (r) => {
      const L = pick(r, [20, 30])
      const err = pick(r, [-1, 1]) * between(r, 3, 12, 0)
      const Lp = L + err / 100
      const meas = between(r, 120, 480, 1)
      const tru = (meas * Lp) / L
      return {
        q: `A ${L} m chain was found to be **${Math.abs(err)} cm too ${err > 0 ? 'long' : 'short'}**. A line measured with it reads **${meas} m**. What is its true length?`,
        answers: [{ label: 'True length', value: tru, unit: 'm', tol: 0.0002 }],
        steps: `True length = measured × L′/L = ${meas} × ${f(Lp, 2)}/${L} = **${f(tru, 2)} m**. A chain that is too ${err > 0 ? 'long gives readings that are too small' : 'short gives readings that are too large'}.`,
      }
    },
  },
  {
    id: 'tape-area',
    topic: 'sv-chain',
    title: 'Area with a wrong chain',
    make: (r) => {
      const L = 20
      const err = pick(r, [-1, 1]) * between(r, 5, 15, 0)
      const Lp = L + err / 100
      const A = between(r, 1200, 6000, 0)
      const tru = A * (Lp / L) ** 2
      return {
        q: `A plot measured with a 20 m chain that was **${Math.abs(err)} cm too ${err > 0 ? 'long' : 'short'}** came out as **${A} m²**. True area?`,
        answers: [{ label: 'True area', value: tru, unit: 'm²', tol: 0.0003 }],
        steps: `True area = measured × (L′/L)² = ${A} × (${f(Lp, 2)}/20)² = **${f(tru, 1)} m²**.`,
      }
    },
  },
  {
    id: 'scale',
    topic: 'sv-chain',
    title: 'Scales',
    make: (r) => {
      const rf = pick(r, [100, 200, 250, 500, 1000])
      const field = between(r, 12, 140, 1)
      const plan = (field * 1000) / rf
      return {
        q: `Scale **1 : ${rf}**. A line of **${field} m** in the field is drawn how long on the sheet? (And 1 cm on the sheet stands for how many metres?)`,
        answers: [
          { label: 'On the sheet', value: plan / 10, unit: 'cm', tol: 0.002 },
          { label: '1 cm represents', value: rf / 100, unit: 'm' },
        ],
        steps: `${field} m = ${field * 1000} mm → ÷ ${rf} = ${f(plan, 1)} mm = **${f(plan / 10, 2)} cm**. 1 cm = ${rf} cm = **${rf / 100} m**.`,
      }
    },
  },
  {
    id: 'slope',
    topic: 'sv-chain',
    title: 'Slope correction',
    make: (r) => {
      const L = between(r, 20, 30, 1)
      const h = between(r, 0.8, 3.2, 2)
      const H = Math.sqrt(L * L - h * h)
      return {
        q: `A tape length of **${L} m** is laid along a slope; the far end is **${h} m** higher. Horizontal distance? (and the slope correction)`,
        answers: [
          { label: 'Horizontal distance', value: H, unit: 'm', tol: 0.0001 },
          { label: 'Correction', value: L - H, unit: 'm', tol: 0.01 },
        ],
        steps: `D = √(L² − h²) = √(${L}² − ${h}²) = **${f(H, 3)} m**; correction = L − D = ${f(L - H, 4)} m ≈ h²/2L = ${f((h * h) / (2 * L), 4)} m (always subtracted).`,
      }
    },
  },
  // ───────────── compass / bearings
  {
    id: 'wcb-rb',
    topic: 'sv-compass',
    title: 'WCB ↔ reduced bearing',
    make: (r) => {
      const wcb = angleMin(r, 5, 355)
      const rb = reducedBearing(wcb)
      return {
        q: `Convert the whole-circle bearing **${fmtDMS(wcb)}** to a reduced (quadrantal) bearing. Give the angle, then name the quadrant (e.g. S … W). Also the back bearing (WCB).`,
        answers: [
          { label: 'Reduced bearing angle', value: rb.angle, unit: '°', angle: true, abs: 0.01 },
          { label: 'Back bearing (WCB)', value: norm360(wcb + 180), unit: '°', angle: true, abs: 0.01 },
        ],
        steps: `${fmtDMS(wcb)} lies in the ${rb.ns}${rb.ew} quadrant → **${rb.text}**. Back bearing = ${fmtDMS(wcb)} ${wcb < 180 ? '+' : '−'} 180° = **${fmtDMS(norm360(wcb + 180))}**.`,
      }
    },
  },
  {
    id: 'rb-wcb',
    topic: 'sv-compass',
    title: 'Reduced bearing → WCB',
    make: (r) => {
      const ns = pick(r, ['N', 'S'] as const)
      const ew = pick(r, ['E', 'W'] as const)
      const a = angleMin(r, 3, 87)
      const w = wcbOf(ns, a, ew)
      return {
        q: `A line has the reduced bearing **${ns} ${fmtDMS(a)} ${ew}**. Its whole-circle bearing?`,
        answers: [{ label: 'WCB', value: w, unit: '°', angle: true, abs: 0.01 }],
        steps: `${ns}E: WCB = θ · SE: 180° − θ · SW: 180° + θ · NW: 360° − θ → **${fmtDMS(w)}**.`,
      }
    },
  },
  {
    id: 'included',
    topic: 'sv-compass',
    title: 'Included angle from bearings',
    make: (r) => {
      const ab = angleMin(r, 20, 160)
      const bc = norm360(ab + angleMin(r, 40, 140))
      const ba = norm360(ab + 180)
      const ang = norm360(ba - bc)
      return {
        q: `Bearing of AB = **${fmtDMS(ab)}**, bearing of BC = **${fmtDMS(bc)}**. Find the angle ABC (measured clockwise from BC to BA), and the deflection angle at B.`,
        answers: [
          { label: '∠ABC', value: ang, unit: '°', angle: true, abs: 0.01 },
          { label: 'Deflection at B', value: 180 - ang, unit: '°', angle: true, abs: 0.01 },
        ],
        steps: `Back bearing of AB (= bearing of BA) = ${fmtDMS(ba)}. ∠ABC = bearing BA − bearing BC = ${fmtDMS(ba)} − ${fmtDMS(bc)} = **${fmtDMS(ang)}**. Deflection = 180° − ∠ABC = **${fmtDMS(180 - ang)}** (${bc > ab ? 'right' : 'left'}).`,
      }
    },
  },
  // ───────────── levelling
  {
    id: 'rise-fall',
    topic: 'sv-level',
    title: 'Rise & fall',
    make: (r) => {
      const bm = pick(r, [100, 10, 50])
      const bs = between(r, 1.1, 1.9, 3)
      const is1 = between(r, 0.8, 2.6, 3)
      const is2 = between(r, 0.8, 2.6, 3)
      const fs = between(r, 1.0, 2.8, 3)
      const res = reduceLevels([{ bs }, { is: is1 }, { is: is2 }, { fs }], bm)
      const rl = res.rows.map((x) => x.rl!)
      return {
        q: `BS on BM (RL ${bm}.000) = **${bs}**, then IS **${is1}**, IS **${is2}**, FS **${fs}** from one set-up. By rise & fall find the RL of the 2nd intermediate point and of the last point.`,
        answers: [
          { label: 'RL of the 2nd IS point', value: rl[2], unit: 'm', abs: 0.0015 },
          { label: 'RL of the FS point', value: rl[3], unit: 'm', abs: 0.0015 },
        ],
        steps: `${bs} − ${is1} = ${f(bs - is1)} (${bs - is1 >= 0 ? 'rise' : 'fall'}) → ${f(rl[1])}; ${is1} − ${is2} = ${f(is1 - is2)} → **${f(rl[2])}**; ${is2} − ${fs} = ${f(is2 - fs)} → **${f(rl[3])}**. Check: ΣBS − ΣFS = ${f(bs - fs)} = last − first RL = ${f(rl[3] - bm)}.`,
      }
    },
  },
  {
    id: 'hi',
    topic: 'sv-level',
    title: 'HI method across a change point',
    make: (r) => {
      const bm = 100
      const bs1 = between(r, 1.2, 2.0, 3)
      const fs1 = between(r, 0.6, 2.4, 3)
      const bs2 = between(r, 1.0, 2.2, 3)
      const fs2 = between(r, 0.6, 2.6, 3)
      const hi1 = bm + bs1
      const cp = hi1 - fs1
      const hi2 = cp + bs2
      const end = hi2 - fs2
      return {
        q: `BS ${bs1} on a BM of RL ${bm}.000; FS ${fs1} on CP1; BS ${bs2} on CP1; FS ${fs2} on point P. Find HI of the 2nd set-up and the RL of P.`,
        answers: [
          { label: 'HI₂', value: hi2, unit: 'm', abs: 0.0015 },
          { label: 'RL of P', value: end, unit: 'm', abs: 0.0015 },
        ],
        steps: `HI₁ = ${bm} + ${bs1} = ${f(hi1)}; RL(CP1) = ${f(hi1)} − ${fs1} = ${f(cp)}; HI₂ = ${f(cp)} + ${bs2} = **${f(hi2)}**; RL(P) = ${f(hi2)} − ${fs2} = **${f(end)}**. Check ΣBS − ΣFS = ${f(bs1 + bs2 - fs1 - fs2)} = ${f(end - bm)}.`,
      }
    },
  },
  {
    id: 'curv',
    topic: 'sv-level',
    title: 'Curvature & refraction',
    make: (r) => {
      const d = between(r, 0.2, 2.5, 2)
      const c = 0.0785 * d * d
      const cr = 0.0673 * d * d
      return {
        q: `A staff is read **${d * 1000} m** from the level. Find the curvature correction and the combined curvature + refraction correction (in mm).`,
        answers: [
          { label: 'Curvature', value: c * 1000, unit: 'mm', tol: 0.01 },
          { label: 'Combined', value: cr * 1000, unit: 'mm', tol: 0.01 },
        ],
        steps: `C꜀ = 0.0785 d² (d in km, m) = 0.0785 × ${d}² = ${f(c, 4)} m = **${f(c * 1000, 1)} mm** (subtract). Refraction = 1/7 of it, added. Combined = 0.0673 d² = **${f(cr * 1000, 1)} mm** (subtract). That’s why sights are kept short (≈ 70 m in class).`,
      }
    },
  },
  // ───────────── traverse
  {
    id: 'latdep',
    topic: 'sv-traverse',
    title: 'Latitude & departure',
    make: (r) => {
      const L = between(r, 15, 60, 2)
      const b = angleMin(r, 2, 358)
      const { lat, dep } = latDep(L, b)
      return {
        q: `Line AB: length **${L} m**, WCB **${fmtDMS(b)}**. Latitude and departure (with signs)?`,
        answers: [
          { label: 'Latitude', value: lat, unit: 'm', abs: 0.005 },
          { label: 'Departure', value: dep, unit: 'm', abs: 0.005 },
        ],
        steps: `Lat = L cos θ = ${L} × cos ${fmtDMS(b)} = **${f(lat)}** (${lat >= 0 ? 'N' : 'S'}); Dep = L sin θ = **${f(dep)}** (${dep >= 0 ? 'E' : 'W'}). Reduced bearing ${reducedBearing(b).text} gives the signs.`,
      }
    },
  },
  {
    id: 'angle-sum',
    topic: 'sv-traverse',
    title: 'Angular misclosure',
    make: (r) => {
      const n = pick(r, [4, 5, 5, 6])
      const theory = (n - 2) * 180
      const errSec = pick(r, [-1, 1]) * between(r, 30, 300, 0)
      const obs = theory + errSec / 3600
      return {
        q: `A closed traverse has **${n}** stations; the measured included angles add up to **${fmtDMS(obs)}**. What is the angular error, and the correction to each angle (in seconds, with sign)?`,
        answers: [
          { label: 'Error (″)', value: errSec, unit: '″', abs: 0.5 },
          { label: 'Correction per angle (″)', value: -errSec / n, unit: '″', abs: 0.5 },
        ],
        steps: `Σ should be (n − 2) × 180° = **${theory}°**. Error = ${fmtDMS(obs)} − ${theory}° = **${errSec}″**. Each angle gets −error/n = **${f(-errSec / n, 1)}″**.`,
      }
    },
  },
  {
    id: 'closing',
    topic: 'sv-traverse',
    title: 'Closing error & precision',
    make: (r) => {
      const sL = pick(r, [-1, 1]) * between(r, 0.02, 0.25, 3)
      const sD = pick(r, [-1, 1]) * between(r, 0.02, 0.25, 3)
      const P = between(r, 80, 320, 1)
      const e = Math.hypot(sL, sD)
      return {
        q: `For a closed traverse ΣL = **${sL}** m, ΣD = **${sD}** m and the perimeter is **${P} m**. Closing error and the relative precision (1 in …)?`,
        answers: [
          { label: 'Closing error', value: e, unit: 'm', tol: 0.002 },
          { label: 'Precision 1 in', value: P / e, tol: 0.01 },
        ],
        steps: `e = √(${sL}² + ${sD}²) = **${f(e, 4)} m**; precision = e / perimeter = 1 in ${P}/${f(e, 4)} = **1 in ${Math.round(P / e)}**.`,
      }
    },
  },
  {
    id: 'bowditch',
    topic: 'sv-traverse',
    title: 'Bowditch correction',
    make: (r) => {
      const sL = pick(r, [-1, 1]) * between(r, 0.05, 0.3, 3)
      const sD = pick(r, [-1, 1]) * between(r, 0.05, 0.3, 3)
      const P = between(r, 90, 250, 1)
      const l = between(r, 15, 50, 2)
      return {
        q: `ΣL = ${sL} m, ΣD = ${sD} m, perimeter ${P} m. Bowditch corrections to the latitude and departure of a side **${l} m** long?`,
        answers: [
          { label: 'Correction to lat', value: (-sL * l) / P, unit: 'm', abs: 0.0006 },
          { label: 'Correction to dep', value: (-sD * l) / P, unit: 'm', abs: 0.0006 },
        ],
        steps: `C_L = −ΣL × l/ΣL_sides = −(${sL}) × ${l}/${P} = **${f((-sL * l) / P, 4)} m**; C_D = −(${sD}) × ${l}/${P} = **${f((-sD * l) / P, 4)} m**.`,
      }
    },
  },
  {
    id: 'acres',
    topic: 'sv-traverse',
    title: 'Area in acres and decimals',
    make: (r) => {
      const ft = r() < 0.5
      const A = ft ? between(r, 3000, 30000, 0) : between(r, 300, 3000, 1)
      const a = acres(A, ft ? 'ft' : 'm')
      return {
        q: `The traverse encloses **${A} ${ft ? 'ft²' : 'm²'}**. Give the area in acres and in decimals.`,
        answers: [
          { label: 'Acres', value: a.acres, unit: 'acre', tol: 0.002 },
          { label: 'Decimals', value: a.decimals, unit: 'decimal', tol: 0.002 },
        ],
        steps: `1 acre = ${ft ? '43 560 ft²' : '4046.86 m²'} = 100 decimals. ${A} ÷ ${ft ? 43560 : 4046.86} = **${f(a.acres, 4)} acre** = **${f(a.decimals, 2)} decimals**.`,
      }
    },
  },
  // ───────────── stadia
  {
    id: 'stadia-kc',
    topic: 'sv-stadia',
    title: 'Tacheometric constants',
    make: (r) => {
      const K = pick(r, [100, 100, 99.5, 100.5])
      const C = pick(r, [0, 0, 0.3, 0.15])
      const d1 = pick(r, [10, 15, 20])
      const d2 = d1 + pick(r, [10, 20, 30])
      const s1 = +((d1 - C) / K).toFixed(3)
      const s2 = +((d2 - C) / K).toFixed(3)
      const K2 = (d2 - d1) / (s2 - s1)
      const C2 = d1 - K2 * s1
      return {
        q: `On level ground the staff was held at taped distances **${d1} m** and **${d2} m**; the stadia intercepts were **${s1}** and **${s2}** m. Find K and C.`,
        answers: [
          { label: 'K', value: K2, tol: 0.005 },
          { label: 'C (m)', value: C2, unit: 'm', abs: 0.05 },
        ],
        steps: `${d1} = K(${s1}) + C and ${d2} = K(${s2}) + C. Subtract: ${d2 - d1} = K(${f(s2 - s1)}) → **K = ${f(K2, 2)}**; C = ${d1} − ${f(K2, 2)} × ${s1} = **${f(C2, 3)} m**.`,
      }
    },
  },
  {
    id: 'stadia-inclined',
    topic: 'sv-stadia',
    title: 'Inclined stadia sight',
    make: (r) => {
      const K = 100,
        C = 0
      const up = between(r, 1.6, 2.6, 3)
      const lo = +(up - between(r, 0.3, 1.2, 3)).toFixed(3)
      const mid = +((up + lo) / 2).toFixed(3)
      const th = angleMin(r, 2, 12) * pick(r, [1, -1])
      const s = up - lo
      const { hd, v } = stadiaReduce(s, th, K, C)
      const rlStn = 100,
        hi = 1.45
      return {
        q: `K = 100, C = 0. Staff readings ${up} / ${mid} / ${lo}, vertical angle **${th > 0 ? '+' : '−'}${fmtDMS(Math.abs(th))}**. Instrument at a station of RL ${rlStn}.000, height of instrument ${hi} m. Horizontal distance and RL of the staff station?`,
        answers: [
          { label: 'Horizontal distance', value: hd, unit: 'm', tol: 0.002 },
          { label: 'RL of staff station', value: rlStn + hi + v - mid, unit: 'm', abs: 0.01 },
        ],
        steps: `s = ${up} − ${lo} = ${f(s)}; D = Ks cos²θ = 100 × ${f(s)} × cos²(${fmtDMS(th)}) = **${f(hd, 2)} m**; V = ½Ks sin2θ = ${f(v)} m; RL = ${rlStn} + ${hi} ${v >= 0 ? '+' : '−'} ${f(Math.abs(v))} − ${mid} = **${f(rlStn + hi + v - mid)}**.`,
      }
    },
  },
  // ───────────── height & distance
  {
    id: 'tower',
    topic: 'sv-height',
    title: 'Inaccessible tower',
    make: (r) => {
      const H = between(r, 15, 45, 1)
      const x = between(r, 20, 60, 1)
      const a = between(r, 10, 30, 1)
      const h = 1.5
      const th1 = Math.round((Math.atan((H - h) / (x + a)) / RAD) * 60) / 60
      const th2 = Math.round((Math.atan((H - h) / x) / RAD) * 60) / 60
      const res = towerSameLevel(a, th1, th2, h)
      return {
        q: `Two stations in line with a tower, **${a} m** apart, instrument axis ${h} m above the same level at both. Angles of elevation to the top: **${fmtDMS(th1)}** from the far station, **${fmtDMS(th2)}** from the near one. Distance of the near station from the tower, and the height of the tower?`,
        answers: [
          { label: 'x (near station → tower)', value: res.x, unit: 'm', tol: 0.005 },
          { label: 'Height H', value: res.H, unit: 'm', tol: 0.005 },
        ],
        steps: `H − h = (a + x) tanθ₁ = x tanθ₂ ⇒ x = a tanθ₁/(tanθ₂ − tanθ₁) = ${a} × ${f(res.t1, 4)}/(${f(res.t2, 4)} − ${f(res.t1, 4)}) = **${f(res.x, 2)} m**; H = ${h} + x tanθ₂ = **${f(res.H, 2)} m**.`,
      }
    },
  },
  {
    id: 'heron',
    topic: 'sv-height',
    title: 'Space triangle (Heron)',
    make: (r) => {
      const a = between(r, 40, 160, 1),
        b = between(r, 40, 160, 1)
      const c = between(r, Math.abs(a - b) + 10, a + b - 10, 1)
      const h = heron(a, b, c)
      return {
        q: `The three aerial distances of a space triangle are **${a}**, **${b}** and **${c}** m. Its area?`,
        answers: [{ label: 'Area', value: h.area, unit: 'm²', tol: 0.002 }],
        steps: `s = (a + b + c)/2 = ${f(h.s, 2)}; A = √(s(s−a)(s−b)(s−c)) = √(${f(h.s, 2)} × ${f(h.s - a, 2)} × ${f(h.s - b, 2)} × ${f(h.s - c, 2)}) = **${f(h.area, 1)} m²**.`,
      }
    },
  },
  // ───────────── curve
  {
    id: 'curve-r',
    topic: 'sv-curve',
    title: 'Radius, super-elevation, transition length',
    make: (r) => {
      const mph = pick(r, [25, 28, 30, 32, 35, 40])
      const v = (mph * 5280) / 3600
      const ratio = pick(r, [0.15, 0.2, 0.25])
      const b = pick(r, [8, 9, 10, 12])
      const N = pick(r, [40, 50, 60])
      const Rx = (v * v) / (32.2 * ratio)
      const R = Math.round(Rx / 5) * 5
      const h = ratio * b
      return {
        q: `Design speed **${mph} mph**, allowable centrifugal ratio (h/b) **${ratio}**, pavement **${b} ft**, super-elevation run out at **1 in ${N}**, g = 32.2 ft/s². Find R (to the nearest 5 ft), h and Lₜ.`,
        answers: [
          { label: 'R', value: R, unit: 'ft', abs: 0.5 },
          { label: 'h', value: h, unit: 'ft', abs: 0.005 },
          { label: 'Lₜ', value: h * N, unit: 'ft', abs: 0.05 },
        ],
        steps: `v = ${mph} × 5280/3600 = ${f(v, 2)} ft/s; R = v²/(g × ratio) = ${f(v, 2)}²/(32.2 × ${ratio}) = ${f(Rx, 1)} → **${R} ft**; h = ratio × b = **${f(h, 2)} ft**; Lₜ = hN = **${f(h * N, 1)} ft**.`,
      }
    },
  },
  {
    id: 'curve-t',
    topic: 'sv-curve',
    title: 'Spiral angle, shift, tangent length',
    make: (r) => {
      const R = pick(r, [300, 350, 400, 455, 500, 600])
      const L = pick(r, [50, 60, 67.5, 75, 90])
      const D = angleMin(r, 22, 48)
      const Sa = (L / (2 * R)) / RAD
      const S = (L * L) / (24 * R)
      const T = (R + S) * Math.tan((D / 2) * RAD) + L / 2
      const Lc = (Math.PI * R * (D - 2 * Sa)) / 180
      return {
        q: `R = **${R} ft**, Lₜ = **${L} ft**, deflection angle Δ = **${fmtDMS(D)}**. Find the spiral angle Sₐ, shift S, tangent length and the length of the circular curve.`,
        answers: [
          { label: 'Sₐ', value: Sa, unit: '°', angle: true, abs: 0.005 },
          { label: 'Shift S', value: S, unit: 'ft', abs: 0.005 },
          { label: 'Tangent length', value: T, unit: 'ft', tol: 0.001 },
          { label: 'L꜀', value: Lc, unit: 'ft', tol: 0.002 },
        ],
        steps: `Sₐ = Lₜ/(2R) × 180/π = **${f(Sa, 3)}°**; S = Lₜ²/24R = **${f(S, 3)} ft**; T = (R + S)tan(Δ/2) + Lₜ/2 = **${f(T, 2)} ft**; L꜀ = πR(Δ − 2Sₐ)/180 = **${f(Lc, 2)} ft**.`,
      }
    },
  },
  {
    id: 'curve-def',
    topic: 'sv-curve',
    title: 'Deflection angles',
    make: (r) => {
      const R = pick(r, [300, 400, 455, 500])
      const L = pick(r, [60, 67.5, 75])
      const l = pick(r, [10, 20, 30, 40])
      const c = pick(r, [10, 20])
      const dt = (1800 * l * l) / (Math.PI * R * L)
      const dc = (1718.9 * c) / R
      return {
        q: `R = ${R} ft, Lₜ = ${L} ft. Deflection angle (minutes) of the transition peg **${l} ft** from the tangent point, and the chord angle of a **${c} ft** chord on the circular curve.`,
        answers: [
          { label: 'Transition δ (′)', value: dt, unit: '′', tol: 0.005 },
          { label: 'Circular chord angle (′)', value: dc, unit: '′', tol: 0.005 },
        ],
        steps: `δ = 1800 l²/(πRLₜ) = 1800 × ${l}²/(π × ${R} × ${L}) = **${f(dt, 2)}′**; chord angle = 1718.9 c/R = 1718.9 × ${c}/${R} = **${f(dc, 2)}′**.`,
      }
    },
  },
  // ───────────── contour
  {
    id: 'interp',
    topic: 'sv-contour',
    title: 'Contour interpolation',
    make: (r) => {
      const z1 = between(r, 99.6, 100.0, 3)
      const z2 = +(z1 + between(r, 0.12, 0.45, 3)).toFixed(3)
      const ci = pick(r, [0.05, 0.1])
      const L = Math.ceil(z1 / ci + 1e-9) * ci
      const a = 5
      const x = ((L - z1) / (z2 - z1)) * a
      return {
        q: `Two grid points **${a} m** apart have RLs **${z1}** and **${z2}**. Contour interval ${ci} m. How far from the lower point does the **${f(L, 2)}** contour cross the line?`,
        answers: [{ label: 'Distance from the lower point', value: x, unit: 'm', abs: 0.01 }],
        steps: `x = (L − z₁)/(z₂ − z₁) × a = (${f(L, 2)} − ${z1})/(${z2} − ${z1}) × ${a} = **${f(x, 2)} m**.`,
      }
    },
  },
  // ───────────── house
  {
    id: 'diag',
    topic: 'sv-house',
    title: 'Squaring by diagonals',
    make: (r) => {
      const a = between(r, 10, 34, 0) + pick(r, [0, 4, 6, 10]) / 12
      const b = between(r, 10, 30, 0) + pick(r, [0, 2, 8, 10]) / 12
      const d = Math.hypot(a, b)
      const ftin = (x: number) => `${Math.floor(x)}′-${Math.round((x - Math.floor(x)) * 12)}″`
      return {
        q: `Centre lines of a room: **${ftin(a)}** × **${ftin(b)}**. What must each diagonal measure (in feet, decimal) when the corners are square?`,
        answers: [{ label: 'Diagonal', value: d, unit: 'ft', abs: 0.01 }],
        steps: `d = √(${f(a, 3)}² + ${f(b, 3)}²) = **${f(d, 3)} ft** (= ${Math.floor(d)}′-${f((d - Math.floor(d)) * 12, 1)}″). Both diagonals equal ⇒ the rectangle is square.`,
      }
    },
  },
]

export const drillsFor = (topic?: string) => DRILLS.filter((d) => !topic || d.topic === topic)

