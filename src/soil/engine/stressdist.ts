// Stress distribution in soil (SJMY sir, Lectures 21–25; Question Bank §6). Elastic half-space (Boussinesq) unless named.
// Loads: Q (kN), line q′ (kN/m), pressure q (kPa); distances m. Any consistent units work (the papers also use t/m², ksf).

// ---------------------------------------------------------------- point loads

/** Boussinesq influence factor KB = (3/2π) / [1 + (r/z)²]^(5/2); σz = KB Q/z² */
export const KB = (rz: number) => 3 / (2 * Math.PI) / (1 + rz * rz) ** 2.5
/** Westergaard (μ = 0) influence factor KW = (1/π) / [1 + 2(r/z)²]^(3/2) */
export const KW = (rz: number) => 1 / Math.PI / (1 + 2 * rz * rz) ** 1.5
export const boussinesq = (Q: number, r: number, z: number) => (KB(r / z) * Q) / (z * z)
export const westergaard = (Q: number, r: number, z: number) => (KW(r / z) * Q) / (z * z)

/** on a vertical line at radius r the maximum is at r/z = √(2/3) = 0.8165 (β = 39.23° from the load axis): σmax = 0.0888 Q/r² */
export const RZ_MAX = Math.sqrt(2 / 3)
export const K_MAX = KB(RZ_MAX) * RZ_MAX * RZ_MAX
export function maxOnVertical(Q: number, r: number) {
  const z = r / RZ_MAX
  return { z, sigma: (K_MAX * Q) / (r * r), beta: (Math.atan(RZ_MAX) * 180) / Math.PI }
}

// ---------------------------------------------------------------- line loads

/** infinite line load q′ at horizontal offset x: σz = 2q′z³ / [π(x² + z²)²] */
export const lineInfinite = (q: number, x: number, z: number) => (2 * q * z ** 3) / (Math.PI * (x * x + z * z) ** 2)

/**
 * finite line load q′ along y from y1 to y2, point at horizontal offset x from the line (y = 0 at the point's foot):
 * σz = (q′z³/2π) [y(2y² + 3a²)/(a⁴(a² + y²)^(3/2))] from y1 to y2, a² = x² + z². Below one end (x = 0, 0 → L):
 * σz = q′L(3z² + 2L²) / [2πz(z² + L²)^(3/2)] (the handnote formula).
 */
export function lineFinite(q: number, x: number, y1: number, y2: number, z: number) {
  const a2 = x * x + z * z
  const F = (y: number) => (y * (2 * y * y + 3 * a2)) / (a2 * a2 * (a2 + y * y) ** 1.5)
  return ((q * z ** 3) / (2 * Math.PI)) * (F(y2) - F(y1))
}
export const lineEnd = (q: number, L: number, z: number) => (q * L * (3 * z * z + 2 * L * L)) / (2 * Math.PI * z * (z * z + L * L) ** 1.5)

// ---------------------------------------------------------------- strip loads (plane strain), any piecewise-linear pressure

/** ∫ z³/(u² + z²)² du and ∫ u z³/(u² + z²)² du */
const G0 = (u: number, z: number) => 0.5 * ((u * z) / (u * u + z * z) + Math.atan(u / z))
const G1 = (u: number, z: number) => -(z ** 3) / (2 * (u * u + z * z))

/**
 * vertical stress at (X, z) under a strip pressure that varies linearly from q1 at x1 to q2 at x2 (infinitely long).
 * Exact integral of the line-load formula, so it covers uniform strips, triangular strips and embankment pieces.
 */
export function linearStrip(x1: number, q1: number, x2: number, q2: number, X: number, z: number) {
  if (x2 <= x1) return 0
  const B = (q2 - q1) / (x2 - x1)
  const A = q1 - B * x1
  const u1 = x1 - X
  const u2 = x2 - X
  return (2 / Math.PI) * ((A + B * X) * (G0(u2, z) - G0(u1, z)) + B * (G1(u2, z) - G1(u1, z)))
}
/** piecewise-linear surface pressure through points (x, q) in order */
export function polyStrip(pts: [number, number][], X: number, z: number) {
  let s = 0
  for (let i = 1; i < pts.length; i++) s += linearStrip(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], X, z)
  return s
}

/** uniform strip of width B, point at x from the centre line: σz = (q/π)[α + sin α cos(α + 2δ)] */
export const stripAt = (q: number, B: number, x: number, z: number) => linearStrip(-B / 2, q, B / 2, q, x, z)
/** the angles of the textbook formula (α subtended, δ to the near edge from the vertical) */
export function stripAngles(B: number, x: number, z: number) {
  const a1 = Math.atan2(x + B / 2, z)
  const a2 = Math.atan2(x - B / 2, z)
  return { alpha: a1 - a2, delta: -a1 }
}
/** triangular strip, zero at x = 0 rising to q at x = B (point x measured from the zero edge) */
export const triStripAt = (q: number, B: number, x: number, z: number) => linearStrip(0, 0, B, q, x, z)

/**
 * triangular strip by the textbook (Das) angles: zero at x = 0, q at x = B, point at (x, z) with x from the zero edge.
 * α = angle subtended by the load at the point, δ = tan⁻¹((x − B)/z) = angle from the vertical to the line to the
 * high (q) edge, negative when that edge is to the right of the point. σz = (q/π)[(x/B)α − ½ sin 2δ] (= triStripAt).
 */
export function triStripDas(q: number, B: number, x: number, z: number) {
  const a1 = Math.atan(x / z)
  const delta = Math.atan((x - B) / z)
  const alpha = a1 - delta
  return { alpha, delta, I: ((x / B) * alpha - 0.5 * Math.sin(2 * delta)) / Math.PI, sigma: (q / Math.PI) * ((x / B) * alpha - 0.5 * Math.sin(2 * delta)) }
}

// ---------------------------------------------------------------- embankments (Osterberg)

/** Osterberg: Iz = (1/π)[((a + b)/a)(α1 + α2) − (b/a)α2], α1 + α2 = tan⁻¹((a + b)/z), α2 = tan⁻¹(b/z); point below the inner edge of the slope */
export function osterberg(a: number, b: number, z: number) {
  const t12 = Math.atan((a + b) / z)
  const t2 = Math.atan(b / z)
  if (a < 1e-9) return (t2 + (b * z) / (b * b + z * z)) / Math.PI
  return (((a + b) / a) * t12 - (b / a) * t2) / Math.PI
}
export const osterbergAngles = (a: number, b: number, z: number) => {
  const a12 = Math.atan((a + b) / z)
  const a2 = Math.atan(b / z)
  return { a12, a2, a1: a12 - a2 }
}

/** embankment cross-section: crest c, height h, unit weight γ, horizontal slope lengths aL (left), aR (right). x = 0 at the left toe. */
export interface Embankment {
  c: number
  h: number
  gamma: number
  aL: number
  aR: number
}
export const embQ = (e: Embankment) => e.h * e.gamma
export const embPts = (e: Embankment): [number, number][] => {
  const q = embQ(e)
  return [
    [0, 0],
    [e.aL, q],
    [e.aL + e.c, q],
    [e.aL + e.c + e.aR, 0],
  ]
}
/** exact σz at (X, z) for the whole section */
export const embankmentAt = (e: Embankment, X: number, z: number) => polyStrip(embPts(e), X, z)

/** Osterberg blocks for a point under the crest (split at the vertical through the point, as the papers expect) */
export function embankmentBlocks(e: Embankment, X: number, z: number) {
  if (X < e.aL - 1e-9 || X > e.aL + e.c + 1e-9) return null
  const left = { side: 'left' as const, a: e.aL, b: X - e.aL }
  const right = { side: 'right' as const, a: e.aR, b: e.aL + e.c - X }
  const blocks = [left, right].map((k) => ({ ...k, az: k.a / z, bz: k.b / z, I: osterberg(k.a, k.b, z) }))
  const I = blocks.reduce((s, k) => s + k.I, 0)
  return { blocks, I, sigma: I * embQ(e) }
}

// ---------------------------------------------------------------- circles

/** below the centre of a uniformly loaded circle of radius R: σz = q{1 − [1/(1 + (R/z)²)]^(3/2)} */
export const circleCentre = (q: number, R: number, z: number) => q * (1 - (1 / (1 + (R / z) ** 2)) ** 1.5)
/** annulus R1 … R2 (below the centre) */
export const annulusCentre = (q: number, R1: number, R2: number, z: number) => circleCentre(q, R2, z) - circleCentre(q, R1, z)
/** inverse: R/z for a given σz/q (the Newmark circle radii) */
export const rzForRatio = (s: number) => (s >= 1 ? Infinity : Math.sqrt((1 - s) ** (-2 / 3) - 1))

/** anywhere: numerical integration of Boussinesq over the circle (midpoint rule in polar coordinates about the centre) */
export function circleAt(q: number, R: number, r: number, z: number, nr = 40, nt = 72) {
  if (r < 1e-9) return circleCentre(q, R, z)
  let s = 0
  const dr = R / nr
  const dt = (2 * Math.PI) / nt
  for (let i = 0; i < nr; i++) {
    const rho = (i + 0.5) * dr
    for (let j = 0; j < nt; j++) {
      const th = (j + 0.5) * dt
      const dx = rho * Math.cos(th) - r
      const dy = rho * Math.sin(th)
      const R2 = dx * dx + dy * dy + z * z
      s += (rho * dr * dt * 3 * z ** 3) / (2 * Math.PI * R2 ** 2.5)
    }
  }
  return q * s
}

// ---------------------------------------------------------------- rectangles (Newmark / Fadum / Steinbrenner)

/**
 * below a corner: I(m, n), m = B/z, n = L/z (interchangeable)
 * I = (1/4π)[2mn√(m²+n²+1)/(m²+n²+1+m²n²) · (m²+n²+2)/(m²+n²+1) + tan⁻¹(2mn√(m²+n²+1)/(m²+n²+1−m²n²))],
 * adding π to the tan⁻¹ when its denominator is negative.
 */
export function Irect(m: number, n: number) {
  if (m <= 0 || n <= 0) return 0
  if (!Number.isFinite(m) && !Number.isFinite(n)) return 0.25
  if (!Number.isFinite(m)) return Irect(1e6, n)
  if (!Number.isFinite(n)) return Irect(m, 1e6)
  const s = m * m + n * n + 1
  const r = Math.sqrt(s)
  const den = s - m * m * n * n
  let at = Math.atan((2 * m * n * r) / den)
  if (den < 0) at += Math.PI
  return ((2 * m * n * r) / (s + m * m * n * n) * ((s + 1) / s) + at) / (4 * Math.PI)
}
/** whether the +π branch applies (m²n² > m² + n² + 1) */
export const piBranch = (m: number, n: number) => m * m * n * n > m * m + n * n + 1

/** signed corner term: rectangle from the point to (a, b) (either sign) */
const F = (a: number, b: number, z: number) => Math.sign(a) * Math.sign(b) * Irect(Math.abs(a) / z, Math.abs(b) / z)

export interface Rect {
  x1: number
  y1: number
  x2: number
  y2: number
}
/** influence of rectangle [x1, x2] × [y1, y2] at a point (X, Y), depth z — any point, inside or outside */
export function rectI(r: Rect, X: number, Y: number, z: number) {
  return F(r.x2 - X, r.y2 - Y, z) - F(r.x1 - X, r.y2 - Y, z) - F(r.x2 - X, r.y1 - Y, z) + F(r.x1 - X, r.y1 - Y, z)
}
/** σz below the centre of a B × L rectangle */
export const boussinesqRectCentre = (q: number, B: number, L: number, z: number) => 4 * q * Irect(B / (2 * z), L / (2 * z))
export const rectCorner = (q: number, B: number, L: number, z: number) => q * Irect(B / z, L / z)

/** the corner rectangles behind rectI, for showing the work: each has a corner at the point, sign +1 or −1 */
export interface CornerTerm {
  sign: 1 | -1
  B: number
  L: number
  m: number
  n: number
  I: number
  /** plan coordinates of the rectangle (from the point to the far corner) */
  ax: number
  ay: number
}
export function cornerTerms(r: Rect, X: number, Y: number, z: number): CornerTerm[] {
  const out: CornerTerm[] = []
  const add = (s: number, a: number, b: number) => {
    const sg = s * Math.sign(a) * Math.sign(b)
    if (!sg) return
    const B = Math.abs(a)
    const L = Math.abs(b)
    out.push({ sign: sg > 0 ? 1 : -1, B, L, m: B / z, n: L / z, I: Irect(B / z, L / z), ax: a, ay: b })
  }
  add(1, r.x2 - X, r.y2 - Y)
  add(-1, r.x1 - X, r.y2 - Y)
  add(-1, r.x2 - X, r.y1 - Y)
  add(1, r.x1 - X, r.y1 - Y)
  return out
}
/** merge equal-size terms with opposite signs (same rectangle added and removed) */
export function simplifyTerms(ts: CornerTerm[]) {
  const key = (t: CornerTerm) => `${t.ax.toFixed(6)}|${t.ay.toFixed(6)}`
  const acc = new Map<string, CornerTerm & { k: number }>()
  for (const t of ts) {
    const k = key(t)
    const prev = acc.get(k)
    if (prev) prev.k += t.sign
    else acc.set(k, { ...t, k: t.sign })
  }
  const out: CornerTerm[] = []
  for (const t of acc.values()) for (let i = 0; i < Math.abs(t.k); i++) out.push({ ...t, sign: t.k > 0 ? 1 : -1 })
  return out
}
export const shapeI = (rs: Rect[], X: number, Y: number, z: number) => rs.reduce((s, r) => s + rectI(r, X, Y, z), 0)

// ---------------------------------------------------------------- 2:1 method

export const twoToOneRect = (Q: number, B: number, L: number, z: number) => Q / ((B + z) * (L + z))
export const twoToOneCircle = (Q: number, D: number, z: number) => Q / ((Math.PI * (D + z) ** 2) / 4)
/** strip, Q in kN/m */
export const twoToOneStrip = (Q: number, B: number, z: number) => Q / (B + z)

// ---------------------------------------------------------------- Newmark chart

export const NEWMARK_RINGS = 10
export const NEWMARK_SECTORS = 20
export const NEWMARK_IF = 0.1 / NEWMARK_SECTORS
/** circle radii R/z for σ/q = 0.1 … 0.9 */
export const NEWMARK_RZ = Array.from({ length: 9 }, (_, i) => rzForRatio((i + 1) / 10))

/** point-in-polygon (even–odd) */
export function inPoly(poly: [number, number][], x: number, y: number) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/**
 * Newmark count for a loaded region (plan coordinates in m, the point at the origin), depth z.
 * Each mesh is sampled uniformly in influence (not in area): σ/q uniform across the ring, angle uniform across the
 * sector, so the covered fraction × 0.005 is exact as the sampling is refined. `inside(x, y)` tests the load.
 */
export function newmarkCount(inside: (x: number, y: number) => boolean, z: number, k = 8) {
  const meshes: number[][] = []
  let N = 0
  for (let ring = 0; ring < NEWMARK_RINGS; ring++) {
    const row: number[] = []
    for (let sec = 0; sec < NEWMARK_SECTORS; sec++) {
      let hit = 0
      for (let a = 0; a < k; a++) {
        const s = (ring + (a + 0.5) / k) / 10
        const rr = z * rzForRatio(s)
        for (let b = 0; b < k; b++) {
          const th = ((sec + (b + 0.5) / k) / NEWMARK_SECTORS) * 2 * Math.PI
          if (inside(rr * Math.cos(th), rr * Math.sin(th))) hit++
        }
      }
      const f = hit / (k * k)
      row.push(f)
      N += f
    }
    meshes.push(row)
  }
  return { N, meshes, I: N * NEWMARK_IF, perRing: meshes.map((r) => r.reduce((s, v) => s + v, 0)) }
}
export const rectsInside = (rs: Rect[]) => (x: number, y: number) => rs.some((r) => x >= Math.min(r.x1, r.x2) && x <= Math.max(r.x1, r.x2) && y >= Math.min(r.y1, r.y2) && y <= Math.max(r.y1, r.y2))

// ---------------------------------------------------------------- pressure bulbs

export type BulbShape = 'strip' | 'square' | 'circle'
/** σz/q at (x, z) for a footing of width B (point offset x from the centre line; square: along a centre line) */
export function bulbRatio(shape: BulbShape, B: number, x: number, z: number) {
  if (z <= 1e-9) return Math.abs(x) <= B / 2 ? 1 : 0
  if (shape === 'strip') return stripAt(1, B, x, z)
  if (shape === 'square') return rectI({ x1: -B / 2, y1: -B / 2, x2: B / 2, y2: B / 2 }, x, 0, z)
  return circleAt(1, B / 2, Math.abs(x), z, 24, 48)
}
/** depth below the centre where σz/q falls to `ratio` (bisection) */
export function bulbDepth(shape: BulbShape, B: number, ratio = 0.1) {
  let lo = 1e-6
  let hi = B
  while (bulbRatio(shape, B, 0, hi) > ratio && hi < 1e4 * B) hi *= 2
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2
    if (bulbRatio(shape, B, 0, m) > ratio) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

// ---------------------------------------------------------------- plan-coordinate helpers (calculators)

export type XY = [number, number]
/** point load Q at (x, y) in plan, stress below P = (X, Y) at depth z */
export function pointInPlan(Q: number, at: XY, P: XY, z: number) {
  const r = Math.hypot(at[0] - P[0], at[1] - P[1])
  return { r, rz: r / z, KB: KB(r / z), KW: KW(r / z), sB: boussinesq(Q, r, z), sW: westergaard(Q, r, z) }
}
/**
 * line load q′ along the segment a → b in plan (infinite: the whole line through a and b), stress below P at depth z.
 * d = perpendicular offset of P from the line; t1, t2 = positions of a and b along the line measured from the foot of
 * the perpendicular (so lineFinite(q′, d, t1, t2, z)).
 */
export function lineInPlan(q: number, a: XY, b: XY, P: XY, z: number, infinite = false) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1])
  if (L < 1e-12) return { L: 0, d: 0, t1: 0, t2: 0, sigma: 0 }
  const ux = (b[0] - a[0]) / L
  const uy = (b[1] - a[1]) / L
  const px = P[0] - a[0]
  const py = P[1] - a[1]
  const t0 = px * ux + py * uy
  const d = Math.abs(px * uy - py * ux)
  const t1 = -t0
  const t2 = L - t0
  return { L, d, t1, t2, sigma: infinite ? lineInfinite(q, d, z) : lineFinite(q, d, Math.min(t1, t2), Math.max(t1, t2), z) }
}

/** Newmark chart radii for a chart with `rings` equal σz/q steps (default 10 → 0.1 … 0.9): R/z and R at depth z */
export const newmarkRadii = (z: number, rings = 10) =>
  Array.from({ length: rings - 1 }, (_, i) => {
    const s = (i + 1) / rings
    const rz = rzForRatio(s)
    return { s, rz, R: rz * z }
  })
