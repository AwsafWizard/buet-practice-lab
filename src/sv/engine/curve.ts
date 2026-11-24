// Combined curve (transition + circular + transition) by deflection angles, one-theodolite method,
// following the CE 104 curve-setting sheet (lecture sheet p27):
//   centrifugal ratio v²/(gR) = P (the sheet gives it as h/b)  ⇒  R = v²/(gP), rounded to the nearest 5 ft
//   super-elevation h = b·v²/(gR) = P·b (b = width of pavement; the seniors' sheet takes h = 0.15 × 9 = 1.35 ft)
//   transition length L = h·N (rate of change of super-elevation 1 in N)
//   spiral angle φs = L/(2R) rad,  shift S = L²/(24R)
//   tangent length T = (R + S)·tan(Δ/2) + L/2
//   circular length Lc = πR(Δ − 2φs)/180
//   transition deflection δ = 1800·l²/(πRL) minutes (l from the tangent point)
//   circular deflection δ = 1718.9·c/R minutes per chord c (cumulative)
//   chainages: A = PI − T, B = A + L, C = B + Lc, D = C + L
// Chords: full peg intervals, the odd length added to the LAST chord ("add undivided length with the last cord").
// The field task sets the curve up to the MID-POINT of the circular curve, so the circular table covers Lc/2.
// Checks: last transition deflection = φs/3; cumulative deflection at mid-curve = (Δ − 2φs)/4.
// Field checks: apex distance E = R(sec Δ/2 − 1) (class form), offset at the end of the transition = 4S.
// Worked example (18-batch sheet): Δ 29.33°, 32 mph, h/b 0.15, b 9 ft, 1 in 50, pegs 10 ft, PI 1662 ft
//   → R 455, h 1.35, L 67.5, φs 4.25°, Lc 165.4, S 0.42, T 152.9.

import { RAD } from './angle'

export interface CurveInput {
  /** deflection angle of the two straights Δ, degrees */
  delta: number
  /** design speed in length-unit per second (ft/s or m/s) */
  v: number
  /** allowable centrifugal ratio P/W (¼ roads, ⅛ railways) */
  ratio: number
  /** width of pavement b */
  b: number
  /** super-elevation is run out at 1 in N */
  N: number
  /** maximum peg interval (chord) */
  peg: number
  /** chainage of the point of intersection */
  chPI: number
  /** g in the same units (32.2 ft/s² or 9.81 m/s²) */
  g: number
  /** round R to the nearest multiple of this (5 on the sheet); 0 = keep exact */
  roundR?: number
  /** use this radius instead of computing it */
  R?: number | null
}

export interface TransitionPeg {
  peg: number
  /** distance from the start of the transition */
  l: number
  chord: number
  /** deflection from the tangent, minutes */
  defMin: number
  /** super-elevation of the outer edge above the inner edge at this peg */
  sup: number
}

export interface CircularPeg {
  peg: number
  chord: number
  /** deflection of this chord (minutes) */
  defMin: number
  /** cumulative deflection from the common tangent (minutes) */
  cumMin: number
}

export interface CurveResult {
  Rexact: number
  R: number
  h: number
  L: number
  phiS: number
  shift: number
  T: number
  Lc: number
  ch: { A: number; B: number; C: number; D: number }
  trans: TransitionPeg[]
  circ: CircularPeg[]
  checks: {
    lastTransDefMin: number
    phiSover3Min: number
    /** cumulative deflection at the last peg (mid-point of the circular curve) */
    totalCircMin: number
    /** (Δ − 2φs)/4 in minutes */
    quarterMin: number
    /** apex distance R(sec Δ/2 − 1), class form */
    E: number
    /** apex distance of the shifted curve (R + S)sec Δ/2 − R, exact form */
    Eexact: number
    /** offset from the tangent at the end of the transition, L²/6R = 4S */
    endOffset: number
  }
}

/**
 * split a length into chords: full peg intervals, with the odd length added to the last one
 * (the sheet: "add undivided length with the last cord" — 67.5 ft by 10 ft pegs → 10,10,10,10,10,17.5).
 * `separate` keeps the odd length as its own short chord instead.
 */
export function chords(len: number, peg: number, separate = false): number[] {
  const n = Math.floor(len / peg + 1e-9)
  const rest = len - n * peg
  const out = Array.from({ length: n }, () => peg)
  if (rest > 1e-6) {
    if (separate || n === 0) out.push(rest)
    else out[n - 1] += rest
  }
  return out
}

export function solveCurve(p: CurveInput): CurveResult {
  const Rexact = (p.v * p.v) / (p.g * p.ratio)
  const step = p.roundR ?? 5
  const R = p.R && p.R > 0 ? p.R : step > 0 ? Math.round(Rexact / step) * step : Rexact
  // h/b is the given ratio, so h = ratio × b (what the seniors' sheet does; b·v²/gR with the rounded R differs in the 3rd decimal)
  const h = p.ratio * p.b
  const L = h * p.N
  const phiSrad = L / (2 * R)
  const phiS = phiSrad / RAD
  const shift = (L * L) / (24 * R)
  const T = (R + shift) * Math.tan((p.delta / 2) * RAD) + L / 2
  const Lc = (Math.PI * R * (p.delta - 2 * phiS)) / 180
  const A = p.chPI - T
  const B = A + L
  const C = B + Lc
  const D = C + L

  let l = 0
  const trans: TransitionPeg[] = chords(L, p.peg).map((c, i) => {
    l += c
    return { peg: i + 1, l, chord: c, defMin: (1800 * l * l) / (Math.PI * R * L), sup: (h * l) / L }
  })
  let cum = 0
  const circ: CircularPeg[] = chords(Lc / 2, p.peg).map((c, i) => {
    const d = (1718.9 * c) / R
    cum += d
    return { peg: i + 1, chord: c, defMin: d, cumMin: cum }
  })
  return {
    Rexact,
    R,
    h,
    L,
    phiS,
    shift,
    T,
    Lc,
    ch: { A, B, C, D },
    trans,
    circ,
    checks: {
      lastTransDefMin: trans.length ? trans[trans.length - 1].defMin : 0,
      phiSover3Min: (phiS / 3) * 60,
      totalCircMin: cum,
      quarterMin: ((p.delta - 2 * phiS) / 4) * 60,
      E: R * (1 / Math.cos((p.delta / 2) * RAD) - 1),
      Eexact: (R + shift) / Math.cos((p.delta / 2) * RAD) - R,
      endOffset: 4 * shift,
    },
  }
}

/** a simple circular curve by Rankine's deflection angles (drill use) */
export function simpleCurve(R: number, delta: number, chPI: number, peg: number) {
  const T = R * Math.tan((delta / 2) * RAD)
  const len = (Math.PI * R * delta) / 180
  const chT1 = chPI - T
  const first = Math.ceil(chT1 / peg - 1e-9) * peg - chT1
  const E = R * (1 / Math.cos((delta / 2) * RAD) - 1)
  const M = R * (1 - Math.cos((delta / 2) * RAD))
  const LC = 2 * R * Math.sin((delta / 2) * RAD)
  return { T, len, chT1, chT2: chT1 + len, first, E, M, LC, defFirstMin: (1718.9 * first) / R }
}
