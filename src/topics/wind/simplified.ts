// Random simplified-procedure (BNBC 2020 Method 1, MWFRS) problems for the wind lab, set the way the
// papers ask them: a low-rise building, V in m/s, exposure, occupancy and roof geometry, with the
// p_s30 table printed at the two bracketing speeds (and roof angles) to interpolate.
// About one problem in four fails a condition of the method, so the eligibility check matters.

import { pick, randInt, rng } from '../../labs/common'
import { CITY_V, importanceWind, lambdaFactor, MS_TO_MPH, ps30, PSF_TO_KPA, type Exposure } from '../../engine/wind'

/** speeds (mph) with a printed p_s30 row (Fig 6.2.10) */
export const PS30_SPEEDS = [85, 90, 100, 110, 120, 130, 140, 150, 170]
/** roof-angle rows used here (the "0 to 5°" row is taken at 5° for interpolation) */
const ANGLE_ROWS: { a: number; key: '0-5' | '10' | '15' | '20'; label: string }[] = [
  { a: 5, key: '0-5', label: '0 to 5°' },
  { a: 10, key: '10', label: '10°' },
  { a: 15, key: '15', label: '15°' },
  { a: 20, key: '20', label: '20°' },
]
export const SIMP_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export interface SimpProblem {
  city: string
  V: number // m/s
  exp: Exposure
  occ: 1 | 2 | 3 | 4
  use: string
  B: number // least plan dimension, across the ridge (m)
  L: number
  eave: number // m
  rise: number // ridge rise above the eave, 0 = flat roof (m)
  enclosed: boolean
}

const USES: Record<1 | 2 | 3 | 4, string[]> = {
  1: ['farm storage shed', 'temporary storage building'],
  2: ['single-storey factory shed', 'warehouse', 'two-storey office building', 'residential building'],
  3: ['school building', 'community centre for 400 people'],
  4: ['hospital wing with emergency units', 'fire station', 'designated cyclone shelter'],
}

export function randomSimp(seed: number): SimpProblem {
  const r = rng(seed)
  // cities above 170 mph (Cox's Bazar, Chittagong) are off the printed table
  const city = pick(
    r,
    Object.keys(CITY_V).filter((c) => CITY_V[c] * MS_TO_MPH < 170),
  )
  const occ = pick(r, [1, 2, 2, 2, 3, 4, 4]) as 1
  const B = randInt(r, 12, 40, 2)
  const p: SimpProblem = {
    city,
    V: CITY_V[city],
    exp: pick(r, ['A', 'B', 'C'] as Exposure[]),
    occ,
    use: pick(r, USES[occ]),
    B,
    L: B + randInt(r, 0, 40, 4),
    eave: pick(r, [4, 5, 6, 7.5, 8, 9, 10, 12]),
    rise: 0,
    enclosed: true,
  }
  if (r() < 0.6) {
    // gable: θ about 6°–20° across the span B
    const t = (randInt(r, 6, 20) * Math.PI) / 180
    p.rise = Math.max(0.5, Math.round(((B / 2) * Math.tan(t)) * 2) / 2)
    while ((Math.atan(p.rise / (B / 2)) * 180) / Math.PI > 20) p.rise -= 0.5
  }
  // force a failed condition one time in four
  if (r() < 0.25) {
    const why = pick(r, ['open', 'tall', 'slender'])
    if (why === 'open') p.enclosed = false
    else if (why === 'tall') p.eave = pick(r, [18, 19.5, 21])
    else {
      p.B = pick(r, [8, 10])
      p.L = p.B + randInt(r, 10, 30, 2)
      p.eave = Math.max(p.eave, p.B + 1.5)
      p.rise = Math.min(p.rise, 1)
    }
  }
  return p
}

/** bracketing rows: [lo, hi] (same twice when the value falls on a row) */
function bracket<T>(rows: T[], v: number, at: (t: T) => number): [T, T] {
  if (v <= at(rows[0])) return [rows[0], rows[0]]
  for (let i = 0; i < rows.length - 1; i++) {
    if (Math.abs(v - at(rows[i + 1])) < 1e-9) return [rows[i + 1], rows[i + 1]]
    if (v < at(rows[i + 1])) return [rows[i], rows[i + 1]]
  }
  return [rows[rows.length - 1], rows[rows.length - 1]]
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function solveSimp(p: SimpProblem) {
  const Vmph = p.V * MS_TO_MPH
  const theta = p.rise > 0 ? (Math.atan(p.rise / (p.B / 2)) * 180) / Math.PI : 0
  const h = p.eave + p.rise / 2
  const least = Math.min(p.B, p.L)
  const conds = [
    { ok: p.enclosed, text: 'enclosed' },
    { ok: h <= 18.3, text: 'mean roof height ≤ 18.3 m (60 ft)' },
    { ok: h <= least, text: 'mean roof height ≤ least horizontal dimension' },
  ]
  const allowed = conds.every((c) => c.ok)
  const [vLo, vHi] = bracket(PS30_SPEEDS, Vmph, (v) => v)
  const [aLo, aHi] = bracket(ANGLE_ROWS, Math.max(theta, 5), (a) => a.a)
  // printed table rows (rounded to 0.1 psf like the code figure)
  const table = (V: number, row: (typeof ANGLE_ROWS)[number]) => ps30(V, row.key).slice(0, 8)
  const given = [vLo, vHi]
    .filter((v, i, a) => a.indexOf(v) === i)
    .flatMap((V) => [aLo, aHi].filter((a, i, arr) => arr.indexOf(a) === i).map((a) => ({ V, angle: a.label, p: table(V, a) })))
  const ft = aHi.a === aLo.a ? 0 : (Math.max(theta, 5) - aLo.a) / (aHi.a - aLo.a)
  const fv = vHi === vLo ? 0 : (Vmph - vLo) / (vHi - vLo)
  const atV = (V: number) => table(V, aLo).map((x, i) => lerp(x, table(V, aHi)[i], ft))
  const lo = atV(vLo),
    hi = atV(vHi)
  const p30 = lo.map((x, i) => lerp(x, hi[i], fv))
  const lam = lambdaFactor(h, p.exp)
  const I = importanceWind(p.occ, p.V)
  const Kzt = 1
  const ps = p30.map((x) => lam * Kzt * I * x)
  const a = Math.max(Math.min(0.1 * least, 0.4 * h), 0.04 * least, 0.9)
  return {
    Vmph,
    theta,
    h,
    least,
    conds,
    allowed,
    vLo,
    vHi,
    angLo: aLo.label,
    angHi: aHi.label,
    ft,
    fv,
    given,
    atLo: lo,
    atHi: hi,
    p30,
    lam,
    I,
    Kzt,
    ps,
    kpa: ps.map((x) => x * PSF_TO_KPA),
    a,
  }
}
