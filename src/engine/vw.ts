// Unit-load (virtual work) method: Δ = Σ∫ M m / EI dx + Σ N n L / EA + Σ∫ K V v / GA dx (+ fabrication / settlement terms)

import { solve, type MemberResult } from './frame2d'
import type { Load, Model } from './model'

export interface VWOptions {
  bending?: boolean
  axial?: boolean
  shear?: boolean
  /** stiffness per member (consistent units). default from member/model */
  EI?: (id: string) => number
  EA?: (id: string) => number
  GA?: (id: string) => number
  /** form factor for shear (1.2 rectangular) */
  K?: number
  /** member length errors (fabrication / temperature) ΔL, + = longer */
  dL?: Record<string, number>
  /** support settlements: node -> {dx, dy, rz} (real movement) */
  settle?: Record<string, { dx?: number; dy?: number; rz?: number }>
}

export interface VWTerm {
  member: string
  L: number
  bending: number
  axial: number
  shear: number
  fab: number
  N: number
  n: number
}

export function virtualWork(model: Model, real: Load[], virtual: Load[], o: VWOptions = {}) {
  const R = solve(model, real)
  const U = solve(model, virtual)
  const terms: VWTerm[] = []
  const memDef = new Map(model.members.map((m) => [m.id, m]))
  for (const mr of R.members) {
    const mv = U.member(mr.id)
    const mem = memDef.get(mr.id)!
    const EI = o.EI ? o.EI(mr.id) : mem.EI ?? model.EI ?? 1
    const EA = o.EA ? o.EA(mr.id) : mem.EA ?? model.EA ?? 1
    const GA = o.GA ? o.GA(mr.id) : 1
    const K = o.K ?? 1.2
    const t: VWTerm = { member: mr.id, L: mr.L, bending: 0, axial: 0, shear: 0, fab: 0, N: mr.N(mr.L / 2), n: mv.N(mv.L / 2) }
    if (!mr.truss && o.bending !== false) t.bending = integrate(mr, mv, (a, b, x) => a.M(x) * b.M(x)) / EI
    if (o.shear && !mr.truss) t.shear = (K * integrate(mr, mv, (a, b, x) => a.V(x) * b.V(x))) / GA
    if (o.axial || mr.truss) t.axial = integrate(mr, mv, (a, b, x) => a.N(x) * b.N(x)) / EA
    if (o.dL?.[mr.id]) t.fab = mv.N(mv.L / 2) * o.dL[mr.id]
    terms.push(t)
  }
  let settle = 0
  if (o.settle)
    for (const [node, s] of Object.entries(o.settle)) {
      const rv = U.reaction(node)
      settle -= rv.rx * (s.dx ?? 0) + rv.ry * (s.dy ?? 0) + rv.m * (s.rz ?? 0)
    }
  const total = terms.reduce((s, t) => s + t.bending + t.axial + t.shear + t.fab, 0) + settle
  return { real: R, virtual: U, terms, settle, total }
}

/** Simpson integration between all breaks of both members (piecewise smooth) */
function integrate(a: MemberResult, b: MemberResult, f: (a: MemberResult, b: MemberResult, x: number) => number) {
  const br = [...new Set([...a.breaks, ...b.breaks])].sort((p, q) => p - q)
  let s = 0
  for (let k = 0; k < br.length - 1; k++) {
    const x0 = br[k]
    const x1 = br[k + 1]
    if (x1 - x0 < 1e-12) continue
    const n = 16
    const h = (x1 - x0) / n
    let acc = 0
    for (let i = 0; i <= n; i++) {
      // evaluate just inside the segment at its ends to avoid jump ambiguity
      const x = i === 0 ? x0 + 1e-9 * h : i === n ? x1 - 1e-9 * h : x0 + i * h
      const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2
      acc += w * f(a, b, x)
    }
    s += (acc * h) / 3
  }
  return s
}

/** product integrals table used in class (∫ m m' dx for common shapes) */
export const PRODUCT_TABLE = [
  { m: 'rectangle m', mp: 'rectangle m′', val: 'm m′ L' },
  { m: 'rectangle m', mp: 'triangle m′', val: '½ m m′ L' },
  { m: 'triangle m', mp: 'triangle m′ (same side)', val: '⅓ m m′ L' },
  { m: 'triangle m', mp: 'triangle m′ (opposite)', val: '⅙ m m′ L' },
  { m: 'trapezoid m1,m2', mp: 'rectangle m′', val: '½ m′(m1+m2) L' },
  { m: 'trapezoid m1,m2', mp: 'triangle m′', val: '⅙ m′(m1+2m2) L' },
  { m: 'trapezoid m1,m2', mp: 'trapezoid m′1,m′2', val: '⅙[m′1(2m1+m2)+m′2(m1+2m2)] L' },
  { m: 'parabola m (max mid)', mp: 'rectangle m′', val: '⅔ m m′ L' },
  { m: 'parabola m (max mid)', mp: 'triangle m′', val: '⅓ m m′ L' },
]
