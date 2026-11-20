// Solids separation as Tanvir sir teaches it (CE 331 T05): terminal velocity of a sphere (Stokes, then the C_D iteration),
// Type I settling-column analysis (R = (1 − x0) + (1/v0)∫v dx, strips as the class notes do them), Type II iso-removal
// (R = r0 + Σ ΔR·Z_i/Z_0), overflow rate and tank sizing.

export const G = 9.81

// ---------------------------------------------------------------- terminal velocity
/** viscosity (Pa·s) and density (kg/m³) of water by temperature, °C */
export const WATER: { T: number; mu: number; rho: number }[] = [
  { T: 0, mu: 1.787e-3, rho: 999.8 },
  { T: 5, mu: 1.519e-3, rho: 1000.0 },
  { T: 10, mu: 1.307e-3, rho: 999.7 },
  { T: 15, mu: 1.139e-3, rho: 999.1 },
  { T: 20, mu: 1.002e-3, rho: 998.2 },
  { T: 25, mu: 0.89e-3, rho: 997.0 },
  { T: 30, mu: 0.798e-3, rho: 995.7 },
]
export function waterAt(T: number) {
  const i = Math.max(0, Math.min(WATER.length - 2, Math.floor(T / 5)))
  const a = WATER[i]
  const b = WATER[i + 1]
  const f = (T - a.T) / (b.T - a.T)
  return { mu: a.mu + (b.mu - a.mu) * f, rho: a.rho + (b.rho - a.rho) * f }
}

/** drag coefficient by Reynolds number (slide T05 p3) */
export function dragCoefficient(Re: number) {
  if (Re <= 1) return 24 / Re
  if (Re < 1e4) return 24 / Re + 3 / Math.sqrt(Re) + 0.34
  return 0.4
}

export interface Terminal {
  /** Stokes velocity (m/s) and its Reynolds number */
  vStokes: number
  reStokes: number
  stokesValid: boolean
  iterations: { v: number; Re: number; CD: number }[]
  v: number
  Re: number
  CD: number
  regime: 'laminar (Stokes)' | 'transition' | 'turbulent'
}
/** v_s = g(ρs−ρw)d²/18µ; if Re > 1 iterate v = √(4g(ρs−ρw)d / 3 C_D ρw) with C_D(Re) until it stops changing */
export function terminalVelocity(p: { d: number; sg?: number; rhoS?: number; rhoW?: number; mu?: number; g?: number }): Terminal {
  const g = p.g ?? G
  const rhoW = p.rhoW ?? 998.2
  const mu = p.mu ?? 1.002e-3
  const rhoS = p.rhoS ?? (p.sg ?? 2.65) * 1000
  const dr = rhoS - rhoW
  const vStokes = (g * dr * p.d * p.d) / (18 * mu)
  const reStokes = (rhoW * vStokes * p.d) / mu
  const iterations: Terminal['iterations'] = []
  if (reStokes <= 1) {
    return { vStokes, reStokes, stokesValid: true, iterations, v: vStokes, Re: reStokes, CD: 24 / reStokes, regime: 'laminar (Stokes)' }
  }
  let v = vStokes
  let Re = reStokes
  let CD = dragCoefficient(Re)
  for (let i = 0; i < 300; i++) {
    CD = dragCoefficient(Re)
    const vn = Math.sqrt((4 * g * dr * p.d) / (3 * CD * rhoW))
    const Ren = (rhoW * vn * p.d) / mu
    iterations.push({ v: vn, Re: Ren, CD })
    const done = Math.abs(vn - v) < 1e-10
    v = vn
    Re = Ren
    if (done) break
  }
  CD = dragCoefficient(Re)
  return { vStokes, reStokes, stokesValid: false, iterations, v, Re, CD, regime: Re <= 1 ? 'laminar (Stokes)' : Re < 1e4 ? 'transition' : 'turbulent' }
}

// ---------------------------------------------------------------- Type I column
export interface ColRow {
  t: number
  C: number
  /** fraction of particles settling slower than v */
  x: number
  /** settling velocity H/t */
  v: number
}
export interface Strip {
  x1: number
  x2: number
  dx: number
  v1: number
  v2: number
  vMean: number
  area: number
}
export interface TypeI {
  rows: ColRow[]
  v0: number
  x0: number
  /** v0 above the fastest recorded velocity: x0 had to be taken at the fastest row */
  clamped: boolean
  strips: Strip[]
  sum: number
  full: number
  partial: number
  R: number
}
/** `v` lets you pass the class's own velocity column (3, 2.5, 2 … ×10⁻² m/min) instead of H/t */
export function typeIColumn(p: { H: number; C0: number; data: { t: number; C: number }[]; v0: number; v?: number[] }): TypeI {
  const rows: ColRow[] = p.data
    .filter((d) => d.t > 0)
    .map((d, i) => ({ t: d.t, C: d.C, x: d.C / p.C0, v: p.v ? p.v[i] : p.H / d.t }))
    .sort((a, b) => a.x - b.x)
  const pts: [number, number][] = [[0, 0], ...rows.map((r) => [r.x, r.v] as [number, number])]
  let x0 = pts[pts.length - 1][0]
  let clamped = true
  for (let i = 1; i < pts.length; i++) {
    if (p.v0 <= pts[i][1]) {
      const [xa, va] = pts[i - 1]
      const [xb, vb] = pts[i]
      x0 = vb === va ? xb : xa + ((p.v0 - va) / (vb - va)) * (xb - xa)
      clamped = false
      break
    }
  }
  const strips: Strip[] = []
  for (let i = 1; i < pts.length; i++) {
    const [xa, va] = pts[i - 1]
    let [xb, vb] = pts[i]
    if (xa >= x0) break
    if (xb > x0) {
      vb = va + ((x0 - xa) / (xb - xa)) * (vb - va)
      xb = x0
    }
    const vMean = (va + vb) / 2
    strips.push({ x1: xa, x2: xb, dx: xb - xa, v1: va, v2: vb, vMean, area: (xb - xa) * vMean })
  }
  const sum = strips.reduce((s, r) => s + r.area, 0)
  const full = 1 - x0
  const partial = sum / p.v0
  return { rows, v0: p.v0, x0, clamped, strips, sum, full, partial, R: full + partial }
}

// ---------------------------------------------------------------- Type II iso-removal
/** an iso-removal curve: r % removal, points (t min, depth m) from the origin */
export interface IsoCurve {
  r: number
  pts: [number, number][]
}
/** slopes for a monotone cubic through the points (Fritsch–Butland): smooth like a hand-drawn curve, never overshooting a reading */
function hermiteSlopes(p: [number, number][]): number[] {
  const n = p.length
  const d = p.slice(1).map(([t, z], i) => (z - p[i][1]) / (t - p[i][0]))
  const h = p.slice(1).map(([t], i) => t - p[i][0])
  const m = new Array<number>(n).fill(0)
  if (n < 2) return m
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let k = 1; k < n - 1; k++) {
    const a = d[k - 1]
    const b = d[k]
    m[k] = a * b <= 0 ? 0 : (3 * (h[k - 1] + h[k])) / ((2 * h[k] + h[k - 1]) / a + (h[k] + 2 * h[k - 1]) / b)
  }
  // end slopes: keep them between 0 and 3× the end segment's slope (monotone)
  if (n > 2) {
    m[0] = Math.max(0, Math.min((3 * d[0] - m[1]) / 2, 3 * d[0])) || d[0]
    m[n - 1] = Math.max(0, Math.min((3 * d[n - 2] - m[n - 2]) / 2, 3 * d[n - 2])) || d[n - 2]
    if (d[0] <= 0) m[0] = d[0]
    if (d[n - 2] <= 0) m[n - 1] = d[n - 2]
  }
  return m
}
const slopeCache = new WeakMap<[number, number][], number[]>()
const slopesOf = (p: [number, number][]) => {
  let m = slopeCache.get(p)
  if (!m) slopeCache.set(p, (m = hermiteSlopes(p)))
  return m
}

/**
 * depth (m) of a curve at time t: a smooth monotone cubic through the read points (it passes through every reading,
 * so answers at a read time are exactly the reading); beyond the last point the last segment is extended straight (extrapolated = true)
 */
export function curveDepthAt(c: IsoCurve, t: number): { z: number; extrapolated: boolean } {
  const p = c.pts
  if (t <= p[0][0]) return { z: p[0][1], extrapolated: false }
  const m = slopesOf(p)
  for (let i = 1; i < p.length; i++) {
    if (t <= p[i][0]) {
      const [ta, za] = p[i - 1]
      const [tb, zb] = p[i]
      const h = tb - ta
      const s = (t - ta) / h
      const h00 = 2 * s ** 3 - 3 * s ** 2 + 1
      const h10 = s ** 3 - 2 * s ** 2 + s
      const h01 = -2 * s ** 3 + 3 * s ** 2
      const h11 = s ** 3 - s ** 2
      return { z: h00 * za + h10 * h * m[i - 1] + h01 * zb + h11 * h * m[i], extrapolated: false }
    }
  }
  const [ta, za] = p[p.length - 2]
  const [tb, zb] = p[p.length - 1]
  return { z: zb + ((t - tb) * (zb - za)) / (tb - ta), extrapolated: true }
}

/** points along a curve for drawing (smooth), from t = 0 to its last reading or tMax */
export function curveSamples(c: IsoCurve, tMax: number, n = 90): [number, number][] {
  const end = Math.min(c.pts[c.pts.length - 1][0], tMax)
  const out: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const t = (end * i) / n
    out.push([t, curveDepthAt(c, t).z])
  }
  return out
}

/** a curve that reaches the bottom H at time tb with z = H (t/tb)^p  (a convex curve through the origin) */
export function powerCurve(r: number, H: number, tb: number, p: number, tMax = Infinity, n = 8): IsoCurve {
  const pts: [number, number][] = [[0, 0]]
  for (let i = 1; i <= n; i++) {
    const t = (tb * i) / n
    if (t > tMax) break
    pts.push([t, H * Math.pow(t / tb, p)])
  }
  if (tb > tMax) pts.push([tMax, H * Math.pow(tMax / tb, p)])
  return { r, pts }
}

export interface IsoLevel {
  r: number
  z: number
  extrapolated?: boolean
}
export interface IsoStrip {
  r1: number
  r2: number
  dr: number
  z1: number
  z2: number
  /** mean depth of the strip, measured down from the surface */
  zMid: number
  /** ΔR·Z_i (% · m) */
  area: number
}
export interface IsoResult {
  H: number
  t0: number
  r0: number
  levels: IsoLevel[]
  strips: IsoStrip[]
  sum: number
  partial: number
  R: number
  extrapolated: boolean
}
/**
 * R = r0 + Σ ΔR·Z_i / Z_0.  `levels` are the curves that are above the bottom at t0 (ascending r, descending depth z);
 * r0 is the removal of the curve that reaches the bottom by t0. The last strip runs from the top curve to the surface (100 %).
 */
export function isoRemoval(p: { H: number; t0: number; r0: number; levels: IsoLevel[] }): IsoResult {
  const lv = [...p.levels].filter((l) => l.r > p.r0 && l.z < p.H).sort((a, b) => a.r - b.r)
  const pts: IsoLevel[] = [{ r: p.r0, z: p.H }, ...lv, { r: 100, z: 0 }]
  const strips: IsoStrip[] = []
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dr = b.r - a.r
    const zMid = (a.z + b.z) / 2
    strips.push({ r1: a.r, r2: b.r, dr, z1: a.z, z2: b.z, zMid, area: dr * zMid })
  }
  const sum = strips.reduce((s, r) => s + r.area, 0)
  const partial = sum / p.H
  return { H: p.H, t0: p.t0, r0: p.r0, levels: lv, strips, sum, partial, R: p.r0 + partial, extrapolated: lv.some((l) => l.extrapolated) }
}

/** overall removal from drawn curves at detention time t0 in a basin of depth H */
export function isoFromCurves(curves: IsoCurve[], H: number, t0: number): IsoResult {
  const cs = [...curves].sort((a, b) => a.r - b.r)
  let r0 = 0
  const levels: IsoLevel[] = []
  for (const c of cs) {
    const { z, extrapolated } = curveDepthAt(c, t0)
    if (z >= H - 1e-9) r0 = Math.max(r0, c.r)
    else levels.push({ r: c.r, z, extrapolated })
  }
  return isoRemoval({ H, t0, r0, levels })
}

/** smallest t at which the removal reaches `target` % (bisection; R(t) rises with t). null if it never does within tMax */
export function minTimeForRemoval(fn: (t: number) => number, target: number, tMax = 1000, tMin = 1): number | null {
  if (fn(tMax) < target) return null
  if (fn(tMin) >= target) return tMin
  let lo = tMin
  let hi = tMax
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (fn(mid) >= target) hi = mid
    else lo = mid
  }
  return hi
}

// ---- grid form (a table of SS at depths × times, like T05-C)
export interface IsoGrid {
  depths: number[]
  times: number[]
  /** % removal, R[i][j] at depths[i], times[j] */
  R: number[][]
}
export function gridFromConcentrations(C0: number, depths: number[], times: number[], C: number[][]): IsoGrid {
  return { depths, times, R: C.map((row) => row.map((c) => ((C0 - c) / C0) * 100)) }
}
/** % removal at (z, t): bilinear, with 100 % at the surface (z = 0) and 0 % at t = 0 */
export function gridRemoval(g: IsoGrid, z: number, t: number): number {
  const D = [0, ...g.depths]
  const T = [0, ...g.times]
  const Rr = [T.map(() => 100), ...g.R.map((row) => [0, ...row])]
  Rr[0][0] = 100
  const bracket = (arr: number[], v: number) => {
    let i = 0
    while (i < arr.length - 2 && v > arr[i + 1]) i++
    return i
  }
  const i = bracket(D, z)
  const j = bracket(T, t)
  const fz = (z - D[i]) / (D[i + 1] - D[i])
  const ft = (t - T[j]) / (T[j + 1] - T[j])
  const a = Rr[i][j] * (1 - ft) + Rr[i][j + 1] * ft
  const b = Rr[i + 1][j] * (1 - ft) + Rr[i + 1][j + 1] * ft
  return a * (1 - fz) + b * fz
}
/** the iso-removal levels at t0 read off a grid: depth of each r that lies above the bottom */
export function isoFromGrid(g: IsoGrid, H: number, t0: number, step = 10): IsoResult {
  const r0 = gridRemoval(g, H, t0)
  const levels: IsoLevel[] = []
  for (let r = (Math.floor(r0 / step) + 1) * step; r < 100; r += step) {
    let lo = 0
    let hi = H
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      if (gridRemoval(g, mid, t0) > r) lo = mid
      else hi = mid
    }
    levels.push({ r, z: (lo + hi) / 2 })
  }
  return isoRemoval({ H, t0, r0, levels })
}
/** the depth of a given removal level at time t0 (m), or null if it is below the bottom */
export function gridLevelDepth(g: IsoGrid, r: number, t0: number, H: number): number | null {
  if (gridRemoval(g, H, t0) >= r) return null
  let lo = 0
  let hi = H
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (gridRemoval(g, mid, t0) > r) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ---------------------------------------------------------------- SOR and tank sizing
export interface TankSize {
  A: number
  V: number
  /** detention time in hours */
  tHours: number
  /** area of each unit */
  Aunit: number
  /** length and width of a rectangular unit with L : W = ratio */
  L: number
  W: number
  overflowMh: number
}
/** v0 = Q/A; A = Q/v0; V = A·depth; t = depth/v0. Q in m³/d, v0 in m/d. */
export function tankSize(p: { Q: number; v0: number; depth: number; n?: number; LW?: number }): TankSize {
  const n = p.n ?? 2
  const A = p.Q / p.v0
  const Aunit = A / n
  const lw = p.LW ?? 3
  const W = Math.sqrt(Aunit / lw)
  return { A, V: A * p.depth, tHours: (p.depth / p.v0) * 24, Aunit, L: W * lw, W, overflowMh: p.v0 / 24 }
}
/** fraction of a particle class removed in an ideal basin: 1 if vs ≥ v0, else vs/v0 */
export const idealRemoval = (vs: number, v0: number) => Math.min(1, vs / v0)

// ---------------------------------------------------------------- the papers' iso-removal charts (read by eye from the transcriptions)
export interface IsoChart {
  id: string
  title: string
  /** depth of the basin / chart bottom (m) and the time axis length (min) */
  H: number
  tMax: number
  curves: IsoCurve[]
  /** where the numbers came from */
  note: string
  /** sampling grid (% removal at depth × time) when the paper prints one */
  grid?: IsoGrid
}
const c = (r: number, pts: [number, number][]): IsoCurve => ({ r, pts: [[0, 0], ...pts] })

/** the figure of 2023-24 Q1(c); 2021-22 Q2(b) is the same drawing without numbers (depth scale read as fractions of the bottom) */
export const CHART_2324: IsoChart = {
  id: '2023-24-1c',
  title: '2023-24 Q1(c): Type II test, 2.5 m column',
  H: 2.5,
  tMax: 150,
  note: 'Curves rebuilt from the transcription’s readings (±0.1 m, ±3 min): 30 % through (30, 1.5) to the bottom at 37 min; 40 % bottom at 61; 50 % through (76, 1.95), bottom at 88; 60 % bottom at 127; 70 % through (135, 1.85) ends (150, 2.2); 80 % through (88, 0.55), (120, 0.95) ends (150, 1.45). Shapes between the readings are smooth power curves.',
  curves: [
    powerCurve(30, 2.5, 37, 2.43),
    powerCurve(40, 2.5, 61, 2.0),
    powerCurve(50, 2.5, 88, 1.69),
    powerCurve(60, 2.5, 127, 1.75),
    powerCurve(70, 2.5, 162, 1.65, 150),
    powerCurve(80, 2.5, 201, 1.85, 150),
  ],
}

/** 2021-22 Q2(b): the same drawing as 2023-24 Q1(c) with no values printed; its bottom edge is read as the 3 m floor */
export const CHART_2122: IsoChart = {
  ...CHART_2324,
  id: '2021-22-2b',
  title: '2021-22 Q2(b): flocculating suspension, 250 mg/L, 3 m column',
  H: 3,
  curves: CHART_2324.curves.map((c) => ({ r: c.r, pts: c.pts.map(([t, z]) => [t, (z * 3) / 2.5] as [number, number]) })),
}

export const CHART_2021: IsoChart = {
  id: '2020-21-5a',
  title: '2020-21 Q5(a): flocculent suspension, 3 m basin',
  H: 3,
  tMax: 40,
  note: 'Readings from the transcription (±0.1 m, ±1 min); the curves are smooth monotone curves through the listed points from the origin.',
  curves: [
    c(10, [[5, 1.3], [6, 1.5], [7.5, 2.5], [8, 3.0]]),
    c(20, [[8.7, 1.0], [12.5, 1.5], [15, 1.95], [17.8, 2.5], [20, 3.0]]),
    c(30, [[13.6, 1.0], [15, 1.2], [18.3, 1.5], [20, 1.77], [27.5, 2.5], [31.3, 3.0]]),
    c(40, [[18.6, 1.0], [20, 1.15], [25, 1.5], [30, 1.88], [35, 2.3], [40, 2.85]]),
    c(50, [[15, 0.45], [20, 0.65], [25, 0.95], [30, 1.28], [35, 1.65], [40, 2.1]]),
    c(60, [[10, 0.18], [15, 0.28], [20, 0.38], [25, 0.5], [30, 0.68], [35, 1.0], [39.5, 1.5]]),
  ],
}

/** 2017-18 Q3(b): the % removal the paper prints at each sampling point (depth × time). The 1.5 m / 30 min value is half hidden
 *  ("3?"): 30 is the reading the drawn 40/45/50 % curves need (they cross 30 min at 1.33, 1.25, 1.15 m); 39 would put them 0.15 m lower. */
const GRID_2017: IsoGrid = {
  depths: [0.5, 1, 1.5, 2, 2.5, 3],
  times: [30, 60, 90, 120, 150, 180],
  R: [
    [60, 76, 85, 89, 92, 93],
    [58, 62, 70, 80, 83, 87],
    [30, 53, 63, 73, 80, 83],
    [28, 47, 56, 65, 70, 80],
    [23, 37, 48, 60, 66, 76],
    [20, 35, 45, 56, 62, 70],
  ],
}

/**
 * iso-removal curves from a printed grid, the way they are drawn by hand: at each sampling time the r % line crosses the
 * column at the depth found by straight-line interpolation (100 % at the surface); once the bottom row reaches r, the
 * curve meets the bottom at the time interpolated along that row. Drawn smooth through those points (see curveDepthAt).
 */
export function curvesFromGrid(g: IsoGrid, H: number, levels: number[]): IsoCurve[] {
  const D = [0, ...g.depths]
  const last = g.depths.length - 1
  return levels.map((r) => {
    const pts: [number, number][] = [[0, 0]]
    let prevT = 0
    let prevBottom = 0
    for (let j = 0; j < g.times.length; j++) {
      const t = g.times[j]
      const col = [100, ...g.R.map((row) => row[j])]
      const bottom = g.R[last][j]
      if (bottom >= r) {
        const tb = prevT + ((r - prevBottom) / (bottom - prevBottom)) * (t - prevT)
        if (tb > pts[pts.length - 1][0] + 1e-9) pts.push([tb, H])
        break
      }
      for (let i = 0; i < col.length - 1; i++)
        if (col[i] >= r && col[i + 1] < r) {
          pts.push([t, D[i] + ((col[i] - r) / (col[i] - col[i + 1])) * (D[i + 1] - D[i])])
          break
        }
      prevT = t
      prevBottom = bottom
    }
    return { r, pts }
  })
}

export const CHART_2017: IsoChart = {
  id: '2017-18-3b',
  title: '2017-18 Q3(b): flocculent suspension, 300 mg/L, 3 m column',
  H: 3,
  tMax: 180,
  note: 'Curves built from the % removal the paper prints at each sampling point (the small numbers): the depth of each level in every time column by straight-line interpolation, and where it meets the bottom along the 3 m row, drawn as smooth curves. They follow the paper’s drawn curves to within the ±0.1 m those can be read to.',
  curves: curvesFromGrid(GRID_2017, 3, [40, 45, 50, 60, 70, 80, 90]),
  grid: GRID_2017,
}

/** T05-C (slide p12): SS (mg/L) at depths × times, C0 = 250 */
export const GRID_T05C: IsoGrid = gridFromConcentrations(
  250,
  [0.5, 1, 1.5, 2, 2.5, 3],
  [30, 60, 90, 120, 150, 180],
  [
    [133, 83, 50, 38, 30, 23],
    [180, 125, 93, 65, 55, 43],
    [203, 150, 118, 93, 70, 58],
    [213, 168, 135, 110, 90, 70],
    [220, 180, 145, 125, 103, 80],
    [225, 188, 155, 133, 113, 95],
  ],
)

/** a made-up but realistic chart for the 🎲 problems: curves r = 30…80 reaching the bottom at geometrically spaced times */
export function randomChart(r: () => number): IsoChart {
  const H = [2.5, 3, 3.5][Math.floor(r() * 3)]
  const t30 = 25 + Math.round(r() * 20)
  const k = 1.45 + r() * 0.35
  const p = 1.5 + r() * 0.6
  const tMax = [120, 150, 180][Math.floor(r() * 3)]
  const levels = [30, 40, 50, 60, 70, 80]
  const curves = levels.map((lv, i) => powerCurve(lv, H, Math.round(t30 * Math.pow(k, i)), p, tMax))
  return { id: 'random', title: 'a generated column test', H, tMax, curves, note: 'Generated curves (smooth power laws): read them off the chart.' }
}
