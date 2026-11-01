// Moving loads on influence lines: wheel trains, uniform + roving loads, absolute max moment.

import { ildAreas, ildAt, ildExtremes, ildIntegral, type ILD } from './ild'

export interface Train {
  /** wheel loads in order (wheel 1 first) */
  P: number[]
  /** spacing between wheel k and k+1 (length = P.length - 1) */
  gaps: number[]
  /** optional uniform load that trails the last wheel */
  udl?: { w: number; gap: number; length?: number }
  labels?: string[]
}

/**
 * Direction of travel used everywhere: trains move from RIGHT to LEFT. Wheel 1 (the leftmost wheel
 * as drawn) leads and the rest of the train, plus any uniform tail, trails to its right (o = -1).
 */
export const TRAVEL = -1 as const

export interface Placement {
  value: number
  /** x of wheel 1 */
  s: number
  /** +1: train extends to the LEFT of wheel 1 (wheel 1 leads moving right); -1 extends to the right */
  o: 1 | -1
  wheels: { k: number; x: number; P: number; y: number; on: boolean }[]
  udl?: { x1: number; x2: number; w: number; area: number }
}

export function offsets(t: Train): number[] {
  const d = [0]
  for (const g of t.gaps) d.push(d[d.length - 1] + g)
  return d
}

export function trainLength(t: Train) {
  const d = offsets(t)
  return d[d.length - 1]
}

export function place(ild: ILD, t: Train, s: number, o: 1 | -1, side: -1 | 1 = 1): Placement {
  const d = offsets(t)
  let value = 0
  const wheels = t.P.map((P, k) => {
    const x = s - o * d[k]
    const on = x >= ild.xmin - 1e-9 && x <= ild.xmax + 1e-9
    const y = on ? ildAt(ild, x, side) : 0
    value += P * y
    return { k, x, P, y, on }
  })
  let udl: Placement['udl']
  if (t.udl) {
    const start = d[d.length - 1] + t.udl.gap
    const end = start + (t.udl.length ?? 1e6)
    const xa = s - o * start
    const xb = s - o * end
    const x1 = Math.min(xa, xb)
    const x2 = Math.max(xa, xb)
    const area = ildIntegral(ild, x1, x2)
    value += t.udl.w * area
    udl = { x1, x2, w: t.udl.w, area }
  }
  return { value, s, o, wheels, udl }
}

/** Global max and min of the response over all positions (train travelling right to left by default). */
export function trainExtremes(ild: ILD, t: Train, directions: (1 | -1)[] = [TRAVEL]) {
  const d = offsets(t)
  const xb = [...new Set(ild.pts.map((p) => p.x))]
  const cands: { s: number; o: 1 | -1 }[] = []
  const eps = 1e-6
  for (const o of directions) {
    for (const x of xb)
      for (const dk of d) for (const e of [-eps, 0, eps]) cands.push({ s: x + o * dk + e, o })
    if (t.udl) {
      const start = d[d.length - 1] + t.udl.gap
      // an unending tail (no length) never has its far end on the span
      const ends = t.udl.length === undefined ? [start] : [start, start + t.udl.length]
      for (const x of xb) for (const de of ends) cands.push({ s: x + o * de, o })
    }
  }
  let max: Placement | null = null
  let min: Placement | null = null
  for (const c of cands) {
    for (const side of [-1, 1] as const) {
      const p = place(ild, t, c.s, c.o, side)
      if (!max || p.value > max.value + 1e-9) max = p
      if (!min || p.value < min.value - 1e-9) min = p
    }
  }
  return { max: max!, min: min! }
}

/**
 * Trial table used in hand solutions: put each wheel in turn at the ILD peak (x, side)
 * and evaluate. Mirrors how the problem is solved on paper.
 */
export function trialsAtPeak(ild: ILD, t: Train, peakX: number, side: -1 | 1, o: 1 | -1 = TRAVEL) {
  const d = offsets(t)
  return t.P.map((_, k) => {
    // wheel k exactly at the peak; for jumps use the given side
    const s = peakX + o * d[k]
    const p = place(ild, t, s, o, side)
    return { k, placement: p }
  })
}

/** Max effect of a uniform live load w (any length) + roving concentrated P, plus dead load wd. */
export function uniformPlusConcentrated(ild: ILD, w: number, P: number, wd = 0) {
  const a = ildAreas(ild)
  const e = ildExtremes(ild)
  const dead = wd * a.net
  return {
    areas: a,
    extremes: e,
    dead,
    maxPos: { live: w * a.pos + P * e.max.y, total: w * a.pos + P * e.max.y + dead, at: e.max.x },
    maxNeg: { live: w * a.neg + P * e.min.y, total: w * a.neg + P * e.min.y + dead, at: e.min.x },
  }
}

// ---------------- simple span helpers ----------------

/** ILD for a simple span of length L */
export function ssMomentILD(L: number, a: number): ILD {
  return { pts: [{ x: 0, y: 0 }, { x: a, y: (a * (L - a)) / L }, { x: L, y: 0 }], xmin: 0, xmax: L }
}
export function ssShearILD(L: number, a: number): ILD {
  return {
    pts: [
      { x: 0, y: 0 },
      { x: a, y: -a / L },
      { x: a, y: 1 - a / L },
      { x: L, y: 0 },
    ],
    xmin: 0,
    xmax: L,
  }
}

export interface AbsMaxResult {
  M: number
  k: number // critical wheel
  s: number
  o: 1 | -1
  positions: number[] // x of each wheel
  onSpan: boolean[]
  R: number // resultant of loads on span
  xbar: number // x of resultant
  e: number // distance between critical wheel and resultant
  RA: number
  candidates: { k: number; M: number; R: number; e: number; valid: boolean }[]
}

/** Absolute maximum moment in a simple span (resultant/centreline rule, verified by search), train travelling right to left. */
export function absoluteMaxMoment(L: number, t: Train): AbsMaxResult {
  const d = offsets(t)
  const n = t.P.length
  const momentUnder = (k: number, s: number, o: 1 | -1) => {
    const xs = d.map((dk) => s - o * dk)
    const on = xs.map((x) => x >= -1e-9 && x <= L + 1e-9)
    if (!on[k]) return null
    let W = 0,
      Wm = 0
    xs.forEach((x, i) => {
      if (on[i]) {
        W += t.P[i]
        Wm += t.P[i] * x
      }
    })
    const RA = (W * L - Wm) / L
    let M = RA * xs[k]
    xs.forEach((x, i) => {
      if (on[i] && x < xs[k] - 1e-12) M -= t.P[i] * (xs[k] - x)
    })
    return { M, xs, on, RA, W, xbar: W ? Wm / W : 0 }
  }
  let best: AbsMaxResult | null = null
  const candidates: AbsMaxResult['candidates'] = []
  for (const o of [TRAVEL] as const) {
    for (let k = 0; k < n; k++) {
      // resultant rule with iteration on the set of wheels on the span
      let set = new Array(n).fill(true)
      for (let it = 0; it < 12; it++) {
        let W = 0,
          Wd = 0
        set.forEach((on, i) => {
          if (on) {
            W += t.P[i]
            Wd += t.P[i] * d[i]
          }
        })
        if (!W) break
        const dbar = Wd / W // resultant offset from wheel 1 (in train coords)
        // midspan bisects wheel k and resultant: x_k + x_R = L
        // x_k = s - o d_k, x_R = s - o dbar
        const s = (L + o * (d[k] + dbar)) / 2
        const r = momentUnder(k, s, o)
        if (!r) break
        const same = r.on.every((v, i) => v === set[i])
        if (same) {
          const e = Math.abs(d[k] - dbar)
          candidates.push({ k, M: r.M, R: W, e, valid: true })
          if (!best || r.M > best.M) {
            best = { M: r.M, k, s, o, positions: r.xs, onSpan: r.on, R: W, xbar: r.xbar, e, RA: r.RA, candidates }
          }
          break
        }
        set = r.on
      }
    }
  }
  // brute-force verification (piecewise quadratic, fine search)
  let brute = -Infinity
  const total = d[n - 1]
  for (const o of [TRAVEL] as const)
    for (let k = 0; k < n; k++) {
      const N = 4000
      for (let i = 0; i <= N; i++) {
        const s = -total - 1 + ((L + 2 * total + 2) * i) / N
        const r = momentUnder(k, s, o)
        if (r && r.M > brute) brute = r.M
      }
    }
  if (!best || brute > best.M * (1 + 2e-3) + 1e-6) {
    // resultant rule missed (e.g. a heavy wheel alone) — fall back to search result
    let b: AbsMaxResult | null = null
    for (const o of [TRAVEL] as const)
      for (let k = 0; k < n; k++) {
        const N = 20000
        for (let i = 0; i <= N; i++) {
          const s = -total - 1 + ((L + 2 * total + 2) * i) / N
          const r = momentUnder(k, s, o)
          if (r && (!b || r.M > b.M))
            b = { M: r.M, k, s, o, positions: r.xs, onSpan: r.on, R: r.W, xbar: r.xbar, e: 0, RA: r.RA, candidates }
        }
      }
    return b!
  }
  return best
}

/** moment under each wheel when it is at a section x=a of a simple span (hand trial table) */
export function ssMomentTrials(L: number, a: number, t: Train) {
  const ild = ssMomentILD(L, a)
  return t.P.map((_, k) => ({ k, o: TRAVEL, placement: place(ild, t, a + TRAVEL * offsets(t)[k], TRAVEL) }))
}
