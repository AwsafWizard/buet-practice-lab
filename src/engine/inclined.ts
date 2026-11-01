// Hand-calculation walk-through for an inclined frame member: resolve the start-end forces along /
// across the member, then cut at every load point and sum forces & moments of the part behind the cut.
// Uses the same orientation as the diagrams (bottom → top), so the signs match the plotted AFD/SFD/BMD.

import type { MemberResult, Result } from './frame2d'
import type { Model } from './model'

const GAUSS3 = [
  { x: -Math.sqrt(3 / 5), w: 5 / 9 },
  { x: 0, w: 8 / 9 },
  { x: Math.sqrt(3 / 5), w: 5 / 9 },
]
const EPS = 1e-9

/** a force (global components) or couple acting on the part of the member behind a cut */
export interface Force {
  what: 'end' | 'point' | 'dist'
  /** distance from the start node along the member (for a distributed load: its resultant's position) */
  t: number
  x: number
  y: number
  fx: number
  fy: number
  /** ccw couple */
  m: number
  /** distributed load: the stretch it covers behind the cut */
  from?: number
  to?: number
}

export interface Cut {
  t: number
  x: number
  y: number
  /** -1 = just before t, +1 = just after */
  side: -1 | 1
  forces: Force[]
  H: number
  V: number
  N: number
  Vs: number
  M: number
}

export interface InclinedWork {
  id: string
  start: string
  end: string
  x0: number
  y0: number
  dx: number
  dy: number
  L: number
  c: number
  s: number
  deg: number
  /** forces on the member at the start node (global, ccw couple) */
  F0: { fx: number; fy: number; m: number }
  /** start node is a support that only this member meets → F0 equals the reactions */
  fromSupport: boolean
  loads: Force[]
  /** sections: start, each load point (before/after), each load limit, end */
  cuts: Cut[]
  /** where the shear changes sign inside a distributed stretch → local moment peak */
  peaks: Cut[]
}

export const isInclined = (model: Model, id: string) => {
  const mem = model.members.find((m) => m.id === id)!
  if (mem.truss) return false
  const ni = model.nodes.find((n) => n.id === mem.i)!
  const nj = model.nodes.find((n) => n.id === mem.j)!
  return Math.abs(nj.x - ni.x) > 1e-6 && Math.abs(nj.y - ni.y) > 1e-6
}

export function inclinedWork(model: Model, r: Result, id: string): InclinedWork {
  const mr = r.members.find((m) => m.id === id)!
  const mem = model.members.find((m) => m.id === id)!
  const ni = model.nodes.find((n) => n.id === mem.i)!
  const nj = model.nodes.find((n) => n.id === mem.j)!
  // diagrams read members bottom → top
  const flip = nj.y < ni.y
  const S = flip ? nj : ni
  const E = flip ? ni : nj
  const { L, c: ci, s: si } = mr
  const c = flip ? -ci : ci
  const s = flip ? -si : si
  const toT = (a: number) => (flip ? L - a : a)
  const at = (t: number) => ({ x: S.x + c * t, y: S.y + s * t })
  // local (original axes) → global
  const glob = (px: number, py: number) => ({ fx: ci * px - si * py, fy: si * px + ci * py })

  const e = flip ? mr.end.slice(3) : mr.end.slice(0, 3)
  const g0 = glob(e[0], e[1])
  const F0 = { fx: snap(g0.fx), fy: snap(g0.fy), m: snap(e[2]) }
  const sup = model.supports.find((q) => q.node === S.id)
  const meets = model.members.filter((m) => m.i === S.id || m.j === S.id).length
  const nodeLoad = model.loads.some((l) => l.kind === 'node' && l.node === S.id)
  const fromSupport = !!sup && meets === 1 && !nodeLoad

  const points: Force[] = mr.loads.point.map((p) => {
    const t = toT(p.a)
    const g = glob(p.px, p.py)
    return { what: 'point', t, ...at(t), fx: snap(g.fx), fy: snap(g.fy), m: snap(p.m) }
  })

  /** resultant of the distributed loads lying between the start and t */
  const distBehind = (t: number): Force[] => {
    const out: Force[] = []
    for (const d of mr.loads.dist) {
      const lo = Math.max(Math.min(toT(d.a), toT(d.b)), 0)
      const hi = Math.min(Math.max(toT(d.a), toT(d.b)), t)
      if (hi - lo < EPS) continue
      let Qx = 0,
        Qy = 0,
        Q = 0,
        Qt = 0
      const h = hi - lo
      for (const g of GAUSS3) {
        const tt = lo + h / 2 + (g.x * h) / 2
        const a = toT(tt)
        const f = d.b === d.a ? 0 : (a - d.a) / (d.b - d.a)
        const qx = d.qx1 + (d.qx2 - d.qx1) * f
        const qy = d.qy1 + (d.qy2 - d.qy1) * f
        const w = (g.w * h) / 2
        Qx += qx * w
        Qy += qy * w
        const mag = Math.hypot(qx, qy) * w
        Q += mag
        Qt += mag * tt
      }
      const tc = Q > EPS ? Qt / Q : (lo + hi) / 2
      const gl = glob(Qx, Qy)
      out.push({ what: 'dist', t: tc, ...at(tc), fx: snap(gl.fx), fy: snap(gl.fy), m: 0, from: lo, to: hi })
    }
    return out
  }

  const cutAt = (t: number, side: -1 | 1): Cut => {
    const P = at(t)
    const forces: Force[] = [
      { what: 'end', t: 0, x: S.x, y: S.y, ...F0 },
      ...points.filter((p) => (side < 0 ? p.t < t - EPS : p.t < t + EPS)),
      ...distBehind(t),
    ]
    let H = 0,
      V = 0,
      M = 0
    for (const f of forces) {
      H += f.fx
      V += f.fy
      M += (P.x - f.x) * f.fy - (P.y - f.y) * f.fx - f.m
    }
    return { t, ...P, side, forces, H: snap(H), V: snap(V), N: snap(-(H * c + V * s)), Vs: snap(-H * s + V * c), M: snap(M) }
  }

  const stops = new Set<number>([0, L])
  for (const p of points) stops.add(p.t)
  for (const d of mr.loads.dist) {
    stops.add(Math.min(Math.max(toT(d.a), 0), L))
    stops.add(Math.min(Math.max(toT(d.b), 0), L))
  }
  const ts = [...stops].sort((a, b) => a - b)
  const cuts: Cut[] = []
  for (const t of ts) {
    const jump = points.some((p) => Math.abs(p.t - t) < EPS)
    if (t > EPS && (jump || t > L - EPS)) cuts.push(cutAt(t, -1))
    if (t < L - EPS) cuts.push(cutAt(t, 1))
  }

  const peaks: Cut[] = []
  for (let k = 0; k < ts.length - 1; k++) {
    const a = ts[k],
      b = ts[k + 1]
    const loaded = mr.loads.dist.some((d) => Math.min(toT(d.a), toT(d.b)) < b - EPS && Math.max(toT(d.a), toT(d.b)) > a + EPS)
    if (!loaded) continue
    let va = cutAt(a, 1).Vs
    const vb = cutAt(b, -1).Vs
    if (va * vb >= 0 || Math.abs(va) < 1e-6 || Math.abs(vb) < 1e-6) continue
    let lo = a,
      hi = b
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      const vm = cutAt(mid, 1).Vs
      if (vm * va > 0) {
        lo = mid
        va = vm
      } else hi = mid
    }
    peaks.push(cutAt((lo + hi) / 2, 1))
  }

  return {
    id,
    start: S.id,
    end: E.id,
    x0: S.x,
    y0: S.y,
    dx: E.x - S.x,
    dy: E.y - S.y,
    L,
    c,
    s,
    deg: (Math.atan2(Math.abs(s), Math.abs(c)) * 180) / Math.PI,
    F0,
    fromSupport,
    loads: [...points, ...distBehind(L)],
    cuts,
    peaks,
  }
}

/** engine values at the same section, in the diagram orientation (for tests) */
export function engineAt(mr: MemberResult, flip: boolean, t: number, side: -1 | 1) {
  const a = flip ? mr.L - t : t
  const sd = (flip ? -side : side) as -1 | 1
  return { N: mr.N(a, sd), V: mr.V(a, sd), M: flip ? -mr.M(a, sd) : mr.M(a, sd) }
}

function snap(v: number) {
  return Math.abs(v) < 1e-9 ? 0 : v
}
