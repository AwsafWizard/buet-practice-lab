// Cables, suspension bridges with stiffening girders, three-hinged arches.

export interface PointLoad {
  x: number
  P: number // downward +
}

/** simple-beam moment at x for point loads + uniform w on span L */
export function simpleBeamM(L: number, x: number, loads: PointLoad[], w = 0) {
  let RA = (w * L) / 2
  for (const p of loads) RA += (p.P * (L - p.x)) / L
  let M = RA * x - (w * x * x) / 2
  for (const p of loads) if (p.x < x) M -= p.P * (x - p.x)
  return M
}
export function simpleBeamV(L: number, x: number, loads: PointLoad[], w = 0) {
  let RA = (w * L) / 2
  for (const p of loads) RA += (p.P * (L - p.x)) / L
  let V = RA - w * x
  for (const p of loads) if (p.x < x) V -= p.P
  return V
}

/**
 * General cable theorem: at any point, H · y = M_beam, y = sag measured from the chord.
 * Cable with supports at heights 0 (left) and dh (right, + higher), point loads.
 * Given the sag (below chord) at one point xs, returns H, sags, tensions, segment lengths.
 */
export function cablePointLoads(p: { L: number; dh: number; loads: PointLoad[]; sagAt: { x: number; sag: number } }) {
  const { L, dh, loads } = p
  const H = simpleBeamM(L, p.sagAt.x, loads) / p.sagAt.sag
  const xs = [0, ...loads.map((l) => l.x).sort((a, b) => a - b), L]
  const pts = xs.map((x) => {
    const chord = (dh * x) / L
    const sag = x === 0 || x === L ? 0 : simpleBeamM(L, x, loads) / H
    return { x, y: chord - sag, sag }
  })
  const segs = pts.slice(1).map((b, k) => {
    const a = pts[k]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const T = (H * len) / dx
    return { from: a.x, to: b.x, dx, dy, len, T, slope: dy / dx }
  })
  const Tmax = Math.max(...segs.map((s) => s.T))
  const length = segs.reduce((s, q) => s + q.len, 0)
  return { H, pts, segs, Tmax, length }
}

/** parabolic cable under uniform w per horizontal length, level or inclined chord, sag h below chord at midspan */
export function parabolicCable(p: { L: number; w: number; h: number; dh?: number; E?: number; A?: number }) {
  const { L, w, h } = p
  const dh = p.dh ?? 0
  const H = (w * L * L) / (8 * h)
  // y(x) measured upward from left support: chord - sag
  const y = (x: number) => (dh * x) / L - (4 * h * x * (L - x)) / (L * L)
  const slope = (x: number) => dh / L - (4 * h * (L - 2 * x)) / (L * L)
  const T = (x: number) => H * Math.sqrt(1 + slope(x) ** 2)
  const Tmax = Math.max(T(0), T(L))
  // length by numerical integration (exact for any shape)
  let len = 0
  const n = 2000
  for (let i = 0; i < n; i++) {
    const xa = (L * i) / n
    const xb = (L * (i + 1)) / n
    len += Math.hypot(xb - xa, y(xb) - y(xa))
  }
  const nratio = h / L
  const approxLen = dh === 0 ? L * (1 + (8 / 3) * nratio * nratio - (32 / 5) * nratio ** 4) : len
  // elastic stretch ΔL = ∫ T ds / EA = H/(EA) ∫ (1 + y'^2) dx
  let stretch = 0
  if (p.E && p.A) {
    let s = 0
    for (let i = 0; i < n; i++) {
      const x = (L * (i + 0.5)) / n
      s += (1 + slope(x) ** 2) * (L / n)
    }
    stretch = (H * s) / (p.E * p.A)
  }
  // lowest point (where slope = 0)
  const xLow = Math.min(Math.max(L / 2 - (dh * L) / (8 * h), 0), L)
  return { H, y, slope, T, Tmax, length: len, approxLen, stretch, xLow, Vleft: -H * slope(0), Vright: H * slope(L) }
}

/**
 * Suspension bridge with a stiffening girder hinged at xh (one or more hinges at the
 * centre / quarter points), parabolic cable with sag h. Hangers carry a uniform upward
 * load q = 8 H h / L² on the girder. Girder simply supported at the towers.
 * M(x) = M0(x) - H·y(x), y = parabola sag. Hinge condition M(xh) = 0 → H.
 */
export function stiffenedSuspension(p: { L: number; h: number; xh: number; loads: PointLoad[]; w?: number }) {
  const { L, h, loads } = p
  const w = p.w ?? 0
  const ys = (x: number) => (4 * h * x * (L - x)) / (L * L)
  const M0h = simpleBeamM(L, p.xh, loads, w)
  const H = M0h / ys(p.xh)
  const q = (8 * H * h) / (L * L) // hanger force per unit length on girder
  const M = (x: number) => simpleBeamM(L, x, loads, w) - H * ys(x)
  const V = (x: number) => simpleBeamV(L, x, loads, w) - (H * 4 * h * (L - 2 * x)) / (L * L)
  const Tmax = Math.sqrt(H * H + ((q * L) / 2) ** 2)
  return { H, q, M, V, Tmax, ys, M0h }
}

/** Three-hinged parabolic arch (supports level), crown hinge at xc, rise h, loads vertical */
export function threeHingedArch(p: { L: number; h: number; xc?: number; loads: PointLoad[]; udl?: { w: number; a: number; b: number } }) {
  const { L, h, loads } = p
  const xc = p.xc ?? L / 2
  const y = (x: number) => (4 * h * x * (L - x)) / (L * L)
  const dy = (x: number) => (4 * h * (L - 2 * x)) / (L * L)
  const udlPoint = (x: number) => {
    // moment at x of udl portion on simple beam
    if (!p.udl) return { M: 0, V: 0, RA: 0 }
    const { w, a, b } = p.udl
    const W = w * (b - a)
    const xb = (a + b) / 2
    const RA = (W * (L - xb)) / L
    const cov = Math.max(0, Math.min(x, b) - a)
    const M = RA * x - w * cov * (x - a - cov / 2)
    const V = RA - w * cov
    return { M, V, RA }
  }
  const M0 = (x: number) => simpleBeamM(L, x, loads) + udlPoint(x).M
  const V0 = (x: number) => simpleBeamV(L, x, loads) + udlPoint(x).V
  const H = M0(xc) / y(xc)
  const at = (x: number) => {
    const th = Math.atan(dy(x))
    const Mx = M0(x) - H * y(x)
    const Vb = V0(x)
    // normal (compression +) and radial shear
    const Nc = Vb * Math.sin(th) + H * Math.cos(th)
    const Q = Vb * Math.cos(th) - H * Math.sin(th)
    return { x, y: y(x), theta: th, M: Mx, N: Nc, Q }
  }
  const RA = simpleBeamV(L, 0, loads) + udlPoint(0).RA
  return { H, RA, at, y }
}
