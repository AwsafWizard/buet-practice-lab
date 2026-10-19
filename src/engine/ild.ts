// Influence lines by unit-load sweep on the real structure (one factorisation, many RHS).
// Works for any statically determinate or indeterminate model built with ./model.

import { assemble, type Result, type System } from './frame2d'
import type { Load, Model } from './model'

export type Response =
  | { kind: 'reaction'; node: string; comp: 'x' | 'y' | 'm' }
  | { kind: 'shear' | 'moment' | 'axial'; member: string; x: number; side?: -1 | 1 }
  | { kind: 'force'; member: string } // truss bar force (tension +)
  | { kind: 'custom'; fn: (r: Result) => number }

export interface Pt {
  x: number
  y: number
}

/** A load path: either direct loading along members, or panel-point loading (floor beams). */
export type LoadPath =
  | {
      kind: 'members'
      /** members along which the unit load rolls, in order; x positions are global x of the point */
      members: string[]
    }
  | {
      kind: 'panel'
      /** panel point nodes in order of global x */
      nodes: string[]
      /** optional stringer overhang beyond the first / last panel point (load still carried) */
      extendLeft?: number
      extendRight?: number
    }

export interface ILD {
  pts: Pt[] // sorted by x; a jump is two points with the same x
  xmin: number
  xmax: number
}

export function evaluate(r: Result, resp: Response): number {
  switch (resp.kind) {
    case 'reaction': {
      const rr = r.reaction(resp.node)
      return resp.comp === 'x' ? rr.rx : resp.comp === 'y' ? rr.ry : rr.m
    }
    case 'shear':
      return r.member(resp.member).V(resp.x, resp.side ?? 1)
    case 'moment':
      return r.member(resp.member).M(resp.x, resp.side ?? 1)
    case 'axial':
      return r.member(resp.member).N(resp.x, resp.side ?? 1)
    case 'force': {
      const m = r.member(resp.member)
      return m.N(m.L / 2)
    }
    case 'custom':
      return resp.fn(r)
  }
}

/** Where on the structure a section response sits (global x) — used to split the sweep for jumps */
function responseX(model: Model, resp: Response): number | null {
  if (resp.kind === 'shear' || resp.kind === 'moment' || resp.kind === 'axial') {
    const mem = model.members.find((m) => m.id === resp.member)!
    const ni = model.nodes.find((n) => n.id === mem.i)!
    const nj = model.nodes.find((n) => n.id === mem.j)!
    const L = Math.hypot(nj.x - ni.x, nj.y - ni.y)
    return ni.x + ((nj.x - ni.x) * resp.x) / L
  }
  return null
}

export interface ILDOptions {
  /** extra sample points per member (only matters for indeterminate structures) */
  samples?: number
  /** load magnitude & direction, default unit downward */
  fy?: number
}

const sysCache = new WeakMap<Model, System>()
export function systemFor(model: Model): System {
  let s = sysCache.get(model)
  if (!s) {
    s = assemble({ ...model, loads: [] })
    sysCache.set(model, s)
  }
  return s
}

export function influenceLine(model: Model, path: LoadPath, resp: Response, opts: ILDOptions = {}): ILD {
  const sys = systemFor(model)
  const fy = opts.fy ?? -1
  const sign = -fy // unit load magnitude 1 => sign 1
  const nodes = new Map(model.nodes.map((n) => [n.id, n]))
  const pts: Pt[] = []
  const solveAt = (load: Load) => evaluate(sys.solve([load]), resp) / sign

  if (path.kind === 'panel') {
    const xs = path.nodes.map((id) => nodes.get(id)!.x)
    const ys = path.nodes.map((id) => solveAt({ kind: 'node', node: id, fy }))
    if (path.extendLeft && path.nodes.length > 1) {
      // stringer overhang: linear extrapolation of first panel
      const x0 = xs[0] - path.extendLeft
      const slope = (ys[1] - ys[0]) / (xs[1] - xs[0])
      pts.push({ x: x0, y: ys[0] - slope * path.extendLeft })
    }
    xs.forEach((x, k) => pts.push({ x, y: ys[k] }))
    if (path.extendRight && path.nodes.length > 1) {
      const n = xs.length
      const slope = (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2])
      pts.push({ x: xs[n - 1] + path.extendRight, y: ys[n - 1] + slope * path.extendRight })
    }
    return finish(pts)
  }

  // direct loading along members
  const xs = responseX(model, resp)
  const samples = opts.samples ?? 24
  for (const mid of path.members) {
    const mem = model.members.find((m) => m.id === mid)!
    const ni = nodes.get(mem.i)!
    const nj = nodes.get(mem.j)!
    const L = Math.hypot(nj.x - ni.x, nj.y - ni.y)
    const local: number[] = []
    for (let k = 0; k <= samples; k++) local.push((L * k) / samples)
    // section inside this member: sample both sides
    if (xs !== null) {
      const t = (xs - ni.x) / (nj.x - ni.x || 1)
      if (t > -1e-9 && t < 1 + 1e-9) {
        const a = t * L
        const d = Math.max(L * 1e-7, 1e-7)
        local.push(Math.max(0, a - d), Math.min(L, a + d))
      }
    }
    local.sort((p, q) => p - q)
    for (const a of local) {
      const x = ni.x + ((nj.x - ni.x) * a) / L
      const y = solveAt({ kind: 'point', member: mid, a, fy })
      pts.push({ x, y })
    }
  }
  return finish(pts)
}

function finish(raw: Pt[]): ILD {
  const pts = raw.map((p) => ({ x: p.x, y: Math.abs(p.y) < 1e-8 ? 0 : Math.round(p.y * 1e9) / 1e9 })).sort((a, b) => a.x - b.x)
  // cluster samples taken a hair either side of a section into one x (keeps the jump)
  const out: Pt[] = []
  let k = 0
  while (k < pts.length) {
    let e = k
    while (e + 1 < pts.length && pts[e + 1].x - pts[k].x < 1e-5) e++
    const cx = e > k ? Math.round(pts[k].x * 1e4) / 1e4 : pts[k].x
    for (let i = k; i <= e; i++) {
      const last = out[out.length - 1]
      if (last && last.x === cx && Math.abs(last.y - pts[i].y) < 1e-7) continue
      out.push({ x: cx, y: pts[i].y })
    }
    k = e + 1
  }
  return simplify({ pts: out, xmin: out[0].x, xmax: out[out.length - 1].x })
}

function round(x: number) {
  return Math.round(x * 1e6) / 1e6
}

/** drop collinear interior points (keeps kinks and jumps) */
export function simplify(ild: ILD): ILD {
  const p = ild.pts
  if (p.length < 3) return ild
  const out: Pt[] = [p[0]]
  for (let i = 1; i < p.length - 1; i++) {
    const a = out[out.length - 1]
    const b = p[i]
    const c = p[i + 1]
    if (Math.abs(b.x - a.x) < 1e-9 || Math.abs(c.x - b.x) < 1e-9) {
      out.push(b)
      continue
    }
    const s1 = (b.y - a.y) / (b.x - a.x)
    const s2 = (c.y - b.y) / (c.x - b.x)
    const scale = Math.max(1, Math.abs(s1), Math.abs(s2))
    if (Math.abs(s1 - s2) > 1e-6 * scale) out.push(b)
  }
  out.push(p[p.length - 1])
  return { ...ild, pts: out }
}

/** value of the ILD at x. side -1 = limit from the left, +1 from the right. 0 outside the domain. */
export function ildAt(ild: ILD, x: number, side: -1 | 1 = 1): number {
  const p = ild.pts
  if (x < ild.xmin - 1e-9 || x > ild.xmax + 1e-9) return 0
  // find all points at this x (jump)
  const same = p.filter((q) => Math.abs(q.x - x) < 1e-9)
  if (same.length) return side < 0 ? same[0].y : same[same.length - 1].y
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i]
    const b = p[i + 1]
    if (x >= a.x && x <= b.x && b.x > a.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x)
  }
  return 0
}

/** ∫ ILD dx over [x1, x2] (exact for the polyline) */
export function ildIntegral(ild: ILD, x1: number, x2: number): number {
  const lo = Math.max(Math.min(x1, x2), ild.xmin)
  const hi = Math.min(Math.max(x1, x2), ild.xmax)
  if (hi <= lo) return 0
  let s = 0
  const p = ild.pts
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i]
    const b = p[i + 1]
    if (b.x <= a.x) continue
    const l = Math.max(lo, a.x)
    const h = Math.min(hi, b.x)
    if (h <= l) continue
    const yl = a.y + ((b.y - a.y) * (l - a.x)) / (b.x - a.x)
    const yh = a.y + ((b.y - a.y) * (h - a.x)) / (b.x - a.x)
    s += ((yl + yh) / 2) * (h - l)
  }
  return s
}

/** positive and negative areas (split at zero crossings) */
export function ildAreas(ild: ILD) {
  let pos = 0
  let neg = 0
  const p = ild.pts
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i]
    const b = p[i + 1]
    const w = b.x - a.x
    if (w <= 0) continue
    if (a.y >= 0 && b.y >= 0) pos += ((a.y + b.y) / 2) * w
    else if (a.y <= 0 && b.y <= 0) neg += ((a.y + b.y) / 2) * w
    else {
      const x0 = (a.y / (a.y - b.y)) * w
      const t1 = (a.y / 2) * x0
      const t2 = (b.y / 2) * (w - x0)
      if (a.y > 0) {
        pos += t1
        neg += t2
      } else {
        neg += t1
        pos += t2
      }
    }
  }
  return { pos, neg, net: pos + neg }
}

export function ildExtremes(ild: ILD) {
  let max = { x: ild.xmin, y: 0 }
  let min = { x: ild.xmin, y: 0 }
  for (const q of ild.pts) {
    if (q.y > max.y) max = q
    if (q.y < min.y) min = q
  }
  return { max, min }
}

/** Key ordinates at given x's (both sides at jumps) for solution tables. */
export function ordinates(ild: ILD, xs: number[]) {
  return xs.map((x) => {
    const l = ildAt(ild, x, -1)
    const r = ildAt(ild, x, 1)
    return { x, left: l, right: r, jump: Math.abs(l - r) > 1e-9 }
  })
}
