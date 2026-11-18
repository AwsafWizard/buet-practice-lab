// Population forecasting as Snigdha ma'am teaches it (CE22 L2 + her worked maths). Pure functions.
// Every method returns a fitted curve `at(year)` so the lab can plot it, and the numbers a solution shows.

export interface Census {
  year: number
  pop: number
}

export interface Method {
  id: MethodId
  label: string
  /** the fitted curve (valid for any year; for stepwise methods it interpolates smoothly between decades) */
  at: (year: number) => number
  /** numbers a worked solution quotes (K, r, a, b, c, Ps …) */
  params: Record<string, number>
}

export type MethodId = 'arith' | 'expo' | 'geom' | 'decr' | 'incr' | 'line' | 'parab' | 'logi'

const sorted = (c: Census[]) => [...c].sort((a, b) => a.year - b.year)

/** annual growth rate between two censuses (three conventions the papers/teachers use) */
export function annualGrowth(p1: number, t1: number, p2: number, t2: number) {
  const n = t2 - t1
  return {
    n,
    /** geometric: r = (P2/P1)^(1/n) − 1 (her "uniform percentage"/Hardenberg, fraction per year) */
    geometric: Math.pow(p2 / p1, 1 / n) - 1,
    /** arithmetic: ΔP / (P1 n), simple percentage per year */
    arithmetic: (p2 - p1) / (p1 * n),
    /** constant-percentage K = ln(P2/P1)/n */
    continuous: Math.log(p2 / p1) / n,
    /** absolute increase per year */
    perYear: (p2 - p1) / n,
  }
}

/** arithmetic: constant absolute increase K = (Pn − P1)/(Tn − T1) (mean of the decade rates = end-to-end slope) */
export function arithmetic(c0: Census[]): Method {
  const c = sorted(c0)
  const a = c[0]
  const z = c[c.length - 1]
  const K = (z.pop - a.pop) / (z.year - a.year)
  return { id: 'arith', label: 'Arithmetic', params: { K }, at: (t) => z.pop + K * (t - z.year) }
}

/** uniform / constant percentage: ln P = ln P2 + K (T − T2), K = ln(P2/P1)/(T2 − T1) */
export function expo(c0: Census[]): Method {
  const c = sorted(c0)
  const a = c[0]
  const z = c[c.length - 1]
  const K = Math.log(z.pop / a.pop) / (z.year - a.year)
  return { id: 'expo', label: 'Constant percentage (e^Kt)', params: { K }, at: (t) => z.pop * Math.exp(K * (t - z.year)) }
}

export type GeomMode = 'end' | 'mean' | 'last'
/**
 * geometric increase P = Pp (1 + r)^n.
 * 'end'  = geometric mean, first to last census (her slide answers: skip the middle data);
 * 'mean' = arithmetic mean of the per-interval rates (her handwritten alternative);
 * 'last' = last two censuses only (the seniors' note).
 */
export function geometric(c0: Census[], mode: GeomMode = 'end'): Method {
  const c = sorted(c0)
  const z = c[c.length - 1]
  let r: number
  if (mode === 'end') r = annualGrowth(c[0].pop, c[0].year, z.pop, z.year).geometric
  else if (mode === 'last') r = annualGrowth(c[c.length - 2].pop, c[c.length - 2].year, z.pop, z.year).geometric
  else {
    const rs = c.slice(1).map((p, i) => annualGrowth(c[i].pop, c[i].year, p.pop, p.year).geometric)
    r = rs.reduce((s, v) => s + v, 0) / rs.length
  }
  return { id: 'geom', label: 'Geometric', params: { r }, at: (t) => z.pop * Math.pow(1 + r, t - z.year) }
}

/** per-interval growth rate in % per interval and the decreases between them (her sign convention: decrease positive) */
export function growthRates(c0: Census[]) {
  const c = sorted(c0)
  const rates = c.slice(1).map((p, i) => ((p.pop - c[i].pop) / c[i].pop) * 100)
  const dec = rates.slice(1).map((r, i) => rates[i] - r)
  const s = dec.length ? dec.reduce((a, b) => a + b, 0) / dec.length : 0
  return { rates, dec, s }
}

/**
 * decreasing growth rate: P_n = P_{n−1} + (r_{n−1} − s)/100 · P_{n−1}, decade by decade from the last census.
 * `s` = average decrease in growth rate (negative when the rates have been rising). Fractional decades are interpolated geometrically.
 */
export function decreasing(c0: Census[]): Method & { steps: (year: number) => { year: number; r: number; pop: number }[] } {
  const c = sorted(c0)
  const z = c[c.length - 1]
  const h = z.year - c[c.length - 2].year
  const { rates, s } = growthRates(c)
  const rLast = rates[rates.length - 1]
  const steps = (year: number) => {
    const out: { year: number; r: number; pop: number }[] = []
    let p = z.pop
    let r = rLast
    let y = z.year
    while (y + h <= year + 1e-9) {
      const rNew = r - s
      p = p * (1 + rNew / 100)
      y += h
      out.push({ year: y, r: rNew, pop: p })
      r = rNew
    }
    return out
  }
  const at = (t: number) => {
    if (t <= z.year) return interp(c, t)
    const st = steps(t)
    const last = st.length ? st[st.length - 1] : { year: z.year, r: rLast, pop: z.pop }
    const frac = (t - last.year) / h
    return last.pop * Math.pow(1 + (last.r - s) / 100, frac)
  }
  return { id: 'decr', label: 'Decreasing rate of growth', params: { s, rLast }, at, steps }
}

/** incremental increase (textbook): P = Pn + n·X + n(n+1)/2·Y, X mean increase per interval, Y mean of the increments of increase */
export function incremental(c0: Census[]): Method {
  const c = sorted(c0)
  const z = c[c.length - 1]
  const h = z.year - c[c.length - 2].year
  const inc = c.slice(1).map((p, i) => p.pop - c[i].pop)
  const X = inc.reduce((a, b) => a + b, 0) / inc.length
  const dd = inc.slice(1).map((v, i) => v - inc[i])
  const Y = dd.length ? dd.reduce((a, b) => a + b, 0) / dd.length : 0
  return { id: 'incr', label: 'Incremental increase', params: { X, Y }, at: (t) => { const n = (t - z.year) / h; return z.pop + n * X + (n * (n + 1) / 2) * Y } }
}

function interp(c: Census[], t: number) {
  if (t <= c[0].year) return c[0].pop
  for (let i = 1; i < c.length; i++) if (t <= c[i].year) return c[i - 1].pop + ((c[i].pop - c[i - 1].pop) * (t - c[i - 1].year)) / (c[i].year - c[i - 1].year)
  return c[c.length - 1].pop
}

/** polynomial least squares of degree m on the coded variable x = (year − x0)/h (as the papers do: x = …−2, −1, 0, 1, 2…) */
export interface PolyFit {
  /** coefficients a0 + a1 x + a2 x² … in the coded x */
  coef: number[]
  x0: number
  h: number
  /** the sums the normal equations use: ΣX^k and ΣX^k·Y */
  sums: { sx: number[]; sxy: number[]; n: number }
  at: (year: number) => number
}

export function polyFit(c0: Census[], degree: 1 | 2): PolyFit {
  const c = sorted(c0)
  const n = c.length
  const x0 = c.reduce((s, p) => s + p.year, 0) / n
  const h = n > 1 ? (c[n - 1].year - c[0].year) / (n - 1) : 10
  const xs = c.map((p) => (p.year - x0) / h)
  const m = degree + 1
  const sx: number[] = []
  for (let k = 0; k <= 2 * degree; k++) sx.push(xs.reduce((s, x) => s + Math.pow(x, k), 0))
  const sxy: number[] = []
  for (let k = 0; k <= degree; k++) sxy.push(xs.reduce((s, x, i) => s + Math.pow(x, k) * c[i].pop, 0))
  // normal equations  Σ_j a_j Σx^(i+j) = Σ x^i y
  const A = Array.from({ length: m }, (_, i) => [...Array.from({ length: m }, (_, j) => sx[i + j]), sxy[i]])
  for (let i = 0; i < m; i++) {
    let p = i
    for (let r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r
    ;[A[i], A[p]] = [A[p], A[i]]
    for (let r = 0; r < m; r++) {
      if (r === i) continue
      const f = A[r][i] / A[i][i]
      for (let k = i; k <= m; k++) A[r][k] -= f * A[i][k]
    }
  }
  const coef = A.map((row, i) => row[m] / row[i])
  return { coef, x0, h, sums: { sx, sxy, n }, at: (t) => { const x = (t - x0) / h; return coef.reduce((s, a, k) => s + a * Math.pow(x, k), 0) } }
}

export const leastSquaresLine = (c: Census[]): Method => { const f = polyFit(c, 1); return { id: 'line', label: 'Least-squares line', params: { a: f.coef[0], b: f.coef[1] }, at: f.at } }
export const leastSquaresParabola = (c: Census[]): Method => { const f = polyFit(c, 2); return { id: 'parab', label: 'Least-squares parabola', params: { a: f.coef[0], b: f.coef[1], c: f.coef[2] }, at: f.at } }

/**
 * logistic P = Ps / (1 + e^(a + b t)), t from the first census used. Uses three equally spaced censuses (first, middle, last of the
 * longest equally spaced triple). Returns null if the data have no saturation (denominator ≤ 0).
 * Textbook method: the CE22 slides give only the S-curve sketch (her class notes have no worked example).
 */
export function logistic(c0: Census[]): (Method & { Ps: number }) | null {
  const c = sorted(c0)
  const n = c.length
  if (n < 3) return null
  const k = Math.floor((n - 1) / 2)
  const [p0, p1, p2] = [c[0], c[k], c[2 * k]]
  const dt = p1.year - p0.year
  const den = p0.pop * p2.pop - p1.pop * p1.pop
  if (Math.abs(den) < 1e-12 || Math.abs(p2.year - p1.year - dt) > 1e-9) return null
  const Ps = (2 * p0.pop * p1.pop * p2.pop - p1.pop * p1.pop * (p0.pop + p2.pop)) / den
  if (!(Ps > p2.pop)) return null
  const a = Math.log((Ps - p0.pop) / p0.pop)
  const b = (1 / dt) * Math.log((p0.pop * (Ps - p1.pop)) / (p1.pop * (Ps - p0.pop)))
  return { id: 'logi', label: 'Logistic', Ps, params: { Ps, a, b }, at: (t) => Ps / (1 + Math.exp(a + b * (t - p0.year))) }
}

/** ratio method: district pop = national pop(year) × (local/national ratio at the base census) */
export function ratioMethod(localBase: number, nationalBase: number, nationalFuture: number[], round = 4) {
  const raw = localBase / nationalBase
  const X = +raw.toFixed(round)
  return { ratio: X, projections: nationalFuture.map((n) => n * X) }
}

export const ALL_METHODS: { id: MethodId; label: string; short: string }[] = [
  { id: 'arith', label: 'Arithmetic', short: 'constant ΔP per year' },
  { id: 'expo', label: 'Constant percentage', short: 'dP/dt = K P' },
  { id: 'geom', label: 'Geometric', short: 'P (1+r)^n' },
  { id: 'decr', label: 'Decreasing rate', short: 'town near saturation' },
  { id: 'incr', label: 'Incremental increase', short: 'ΔP itself grows' },
  { id: 'line', label: 'LS line', short: 'least-squares straight line' },
  { id: 'parab', label: 'LS parabola', short: 'least-squares curve' },
  { id: 'logi', label: 'Logistic', short: 'S-curve to P_S' },
]

export function runAll(c: Census[]): Method[] {
  const out: Method[] = [arithmetic(c), expo(c), geometric(c, 'end')]
  if (c.length >= 3) out.push(decreasing(c), incremental(c))
  out.push(leastSquaresLine(c))
  if (c.length >= 3) out.push(leastSquaresParabola(c))
  const lg = logistic(c)
  if (lg) out.push(lg)
  return out
}

/** advice sentence per method for the lab */
export const SUITS: Record<MethodId, string> = {
  arith: 'Large, old, established cities with steady development. For a small or new town it under-estimates.',
  expo: 'Cities with unlimited room to expand, over a short horizon. Over-estimates once growth slows.',
  geom: 'A new industrial township at the start of its growth, for only a few decades. Her "most widely used" method; tends high.',
  decr: 'A town approaching saturation: the growth rate itself is falling, so each decade is damped.',
  incr: 'Cities whose yearly increase is changing steadily (textbook method, not worked in her slides).',
  line: 'Roughly straight census history; a smoothed arithmetic method.',
  parab: 'Census history that curves up or down; fits all points but can run away far beyond the data.',
  logi: 'Long-term (10–50 yr) forecasts of a city that will level off at a saturation population P_S.',
}
