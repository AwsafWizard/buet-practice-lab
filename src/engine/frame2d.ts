// 2D direct-stiffness solver for beams, frames and trusses with internal hinges.
// Supports are imposed with Lagrange multipliers, so inclined rollers / links work and
// reactions come straight out of the solve. One factorisation serves many load cases
// (used for influence lines and moving loads).

import { luFactor, luSolve, zeros, type LU } from './linalg'
import { DEFAULT_EA, DEFAULT_EI, type Load, type Model, type Member, type SNode } from './model'

const GAUSS3 = [
  { x: -Math.sqrt(3 / 5), w: 5 / 9 },
  { x: 0, w: 8 / 9 },
  { x: Math.sqrt(3 / 5), w: 5 / 9 },
]

/** loads expressed in a member's local axes */
export interface LocalLoads {
  /** distributed: linear qx, qy on [a,b] */
  dist: { a: number; b: number; qx1: number; qx2: number; qy1: number; qy2: number }[]
  /** point: px along member, py along left normal, m ccw */
  point: { a: number; px: number; py: number; m: number }[]
}

interface MemberInfo {
  mem: Member
  ni: SNode
  nj: SNode
  L: number
  c: number
  s: number
  EA: number
  EI: number
  dofs: number[] // 6 global dof indices (rotation entries -1 for truss)
}

export interface MemberResult {
  id: string
  L: number
  c: number
  s: number
  truss: boolean
  /** end forces ON the member, local axes: [Ni_x, Vi_y, Mi, Nj_x, Vj_y, Mj] */
  end: number[]
  loads: LocalLoads
  /** axial (tension +) at distance x from end i; side -1 = just before x, +1 = just after */
  N(x: number, side?: -1 | 1): number
  /** shear: sum of left-part forces along local +y */
  V(x: number, side?: -1 | 1): number
  /** bending moment, sagging (tension on local -y side) positive */
  M(x: number, side?: -1 | 1): number
  /** points where diagrams have kinks / jumps (member ends, load points, load limits) */
  breaks: number[]
}

export interface Reaction {
  node: string
  rx: number
  ry: number
  m: number
}

export interface Result {
  model: Model
  u: number[]
  disp(node: string): { ux: number; uy: number; rz: number }
  reactions: Reaction[]
  reaction(node: string): Reaction
  member(id: string): MemberResult
  members: MemberResult[]
}

export class UnstableError extends Error {
  constructor(msg = 'Structure is unstable (mechanism) — check supports and hinges') {
    super(msg)
  }
}

export interface System {
  model: Model
  ndof: number
  info: MemberInfo[]
  infoById: Map<string, MemberInfo>
  nodeDof: Map<string, [number, number, number]>
  lu: LU
  /** constraint rows: list of {dofs, coef, node, comp} */
  cons: { node: string; vec: [number, number, number]; idx: [number, number, number] }[]
  pinned: Set<number>
  solve(loads: Load[]): Result
}

export function assemble(model: Model): System {
  const EAdef = model.EA ?? DEFAULT_EA
  const EIdef = model.EI ?? DEFAULT_EI
  const nodeById = new Map(model.nodes.map((n) => [n.id, n]))
  const nodeDof = new Map<string, [number, number, number]>()
  let nd = 0
  for (const n of model.nodes) nodeDof.set(n.id, [nd++, nd++, nd++])

  const info: MemberInfo[] = []
  for (const mem of model.members) {
    const ni = nodeById.get(mem.i)
    const nj = nodeById.get(mem.j)
    if (!ni || !nj) throw new Error(`member ${mem.id}: unknown node ${!ni ? mem.i : mem.j}`)
    const dx = nj.x - ni.x
    const dy = nj.y - ni.y
    const L = Math.hypot(dx, dy)
    if (L < 1e-12) throw new Error(`member ${mem.id} has zero length`)
    const di = nodeDof.get(mem.i)!
    const dj = nodeDof.get(mem.j)!
    let ri = di[2]
    let rj = dj[2]
    if (mem.truss) {
      ri = -1
      rj = -1
    } else {
      if (mem.relI || ni.hinge) ri = nd++
      if (mem.relJ || nj.hinge) rj = nd++
    }
    info.push({
      mem,
      ni,
      nj,
      L,
      c: dx / L,
      s: dy / L,
      EA: mem.EA ?? EAdef,
      EI: mem.EI ?? EIdef,
      dofs: [di[0], di[1], ri, dj[0], dj[1], rj],
    })
  }

  // constraints from supports
  const cons: System['cons'] = []
  const conRows: { dofs: number[]; coef: number[] }[] = []
  for (const sup of model.supports) {
    const d = nodeDof.get(sup.node)
    if (!d) throw new Error(`support at unknown node ${sup.node}`)
    const add = (vec: [number, number, number]) => {
      cons.push({ node: sup.node, vec, idx: d })
      conRows.push({ dofs: [d[0], d[1], d[2]], coef: vec })
    }
    const ang = ((sup.dir ?? 90) * Math.PI) / 180
    const cx = Math.abs(Math.cos(ang)) < 1e-12 ? 0 : Math.cos(ang)
    const cy = Math.abs(Math.sin(ang)) < 1e-12 ? 0 : Math.sin(ang)
    switch (sup.type) {
      case 'fixed':
        add([1, 0, 0])
        add([0, 1, 0])
        add([0, 0, 1])
        break
      case 'pin':
        add([1, 0, 0])
        add([0, 1, 0])
        break
      case 'roller':
      case 'link':
        add([cx, cy, 0])
        break
      case 'guide':
        add([cx, cy, 0])
        add([0, 0, 1])
        break
    }
  }

  // stiffness
  const K = zeros(nd)
  for (const mi of info) {
    const kg = memberGlobalK(mi)
    for (let a = 0; a < 6; a++) {
      const A = mi.dofs[a]
      if (A < 0) continue
      for (let b = 0; b < 6; b++) {
        const B = mi.dofs[b]
        if (B < 0) continue
        K[A][B] += kg[a][b]
      }
    }
  }
  // dofs with no stiffness (rotation of truss-only joints, unused node rotations at hinges)
  const pinned = new Set<number>()
  for (let d = 0; d < nd; d++) {
    let any = false
    for (let e = 0; e < nd; e++)
      if (K[d][e] !== 0) {
        any = true
        break
      }
    // rotation dofs referenced by a constraint keep a unit stiffness too (reaction = 0)
    if (!any) {
      K[d][d] = 1
      pinned.add(d)
    }
  }
  // augmented system
  const nc = conRows.length
  const A = zeros(nd + nc)
  let scale = 0
  for (let i = 0; i < nd; i++) {
    for (let j = 0; j < nd; j++) A[i][j] = K[i][j]
    scale = Math.max(scale, Math.abs(K[i][i]))
  }
  conRows.forEach((r, k) => {
    r.dofs.forEach((dof, t) => {
      const v = r.coef[t] * scale
      if (v === 0) return
      A[nd + k][dof] += v
      A[dof][nd + k] += v
    })
  })
  let lu: LU
  try {
    lu = luFactor(A, 1e-11)
  } catch {
    throw new UnstableError()
  }

  const infoById = new Map(info.map((m) => [m.mem.id, m]))

  const sys: System = {
    model,
    ndof: nd,
    info,
    infoById,
    nodeDof,
    lu,
    cons,
    pinned,
    solve(loads: Load[]) {
      const F = new Array(nd + nc).fill(0)
      const local = new Map<string, LocalLoads>()
      for (const mi of info) local.set(mi.mem.id, { dist: [], point: [] })
      for (const ld of loads) {
        if (ld.kind === 'node') {
          const d = nodeDof.get(ld.node)
          if (!d) throw new Error(`load on unknown node ${ld.node}`)
          F[d[0]] += ld.fx ?? 0
          F[d[1]] += ld.fy ?? 0
          if (ld.m) {
            if (pinned.has(d[2])) throw new UnstableError(`moment applied at a hinge (${ld.node})`)
            F[d[2]] += ld.m
          }
          continue
        }
        const mi = infoById.get(ld.member)
        if (!mi) throw new Error(`load on unknown member ${ld.member}`)
        const ll = local.get(ld.member)!
        toLocal(mi, ld, ll)
      }
      // equivalent nodal loads
      const peq = new Map<string, number[]>()
      for (const mi of info) {
        const ll = local.get(mi.mem.id)!
        const p = equivalentLocal(mi, ll)
        peq.set(mi.mem.id, p)
        const pg = toGlobalVec(mi, p)
        for (let a = 0; a < 6; a++) {
          const A = mi.dofs[a]
          if (A >= 0) F[A] += pg[a]
          else if (Math.abs(pg[a]) > 1e-12) throw new UnstableError('moment load on a pin-ended member end')
        }
      }
      for (const d of pinned) if (Math.abs(F[d]) > 1e-12) throw new UnstableError()
      const scaledF = F.map((v, i) => (i < nd ? v : 0))
      const sol = luSolve(lu, scaledF)
      const u = sol.slice(0, nd)
      const lam = sol.slice(nd).map((v) => v * scale)

      // reactions
      const rmap = new Map<string, Reaction>()
      cons.forEach((c, k) => {
        let r = rmap.get(c.node)
        if (!r) {
          r = { node: c.node, rx: 0, ry: 0, m: 0 }
          rmap.set(c.node, r)
        }
        // K u + C^T lam = F  => support force on structure = -C^T lam
        r.rx += -lam[k] * c.vec[0]
        r.ry += -lam[k] * c.vec[1]
        r.m += -lam[k] * c.vec[2]
      })
      const reactions = model.supports.map((s) => rmap.get(s.node)!).filter((r, i, arr) => arr.indexOf(r) === i)
      clean(reactions)

      const mres = new Map<string, MemberResult>()
      for (const mi of info) {
        const ul = localDisp(mi, u)
        const kl = memberLocalK(mi)
        const p = peq.get(mi.mem.id)!
        const end = new Array(6).fill(0)
        for (let a = 0; a < 6; a++) {
          let sum = 0
          for (let b = 0; b < 6; b++) sum += kl[a][b] * ul[b]
          end[a] = sum - p[a]
        }
        for (let a = 0; a < 6; a++) if (Math.abs(end[a]) < 1e-9) end[a] = 0
        mres.set(mi.mem.id, makeMemberResult(mi, end, local.get(mi.mem.id)!))
      }
      return {
        model,
        u,
        disp(node: string) {
          const d = nodeDof.get(node)!
          return { ux: u[d[0]], uy: u[d[1]], rz: u[d[2]] }
        },
        reactions,
        reaction(node: string) {
          return rmap.get(node) ?? { node, rx: 0, ry: 0, m: 0 }
        },
        member(id: string) {
          const r = mres.get(id)
          if (!r) throw new Error(`no member ${id}`)
          return r
        },
        members: [...mres.values()],
      }
    },
  }
  return sys
}

export function solve(model: Model, loads: Load[] = model.loads): Result {
  return assemble(model).solve(loads)
}

function clean(rs: Reaction[]) {
  for (const r of rs) {
    if (Math.abs(r.rx) < 1e-9) r.rx = 0
    if (Math.abs(r.ry) < 1e-9) r.ry = 0
    if (Math.abs(r.m) < 1e-9) r.m = 0
  }
}

function memberLocalK(mi: MemberInfo): number[][] {
  const { L, EA } = mi
  const k = zeros(6)
  const a = EA / L
  k[0][0] = a
  k[0][3] = -a
  k[3][0] = -a
  k[3][3] = a
  if (mi.mem.truss) return k
  const EI = mi.EI
  const L2 = L * L
  const L3 = L2 * L
  const b = (12 * EI) / L3
  const c = (6 * EI) / L2
  const d = (4 * EI) / L
  const e = (2 * EI) / L
  k[1][1] = b
  k[1][2] = c
  k[1][4] = -b
  k[1][5] = c
  k[2][1] = c
  k[2][2] = d
  k[2][4] = -c
  k[2][5] = e
  k[4][1] = -b
  k[4][2] = -c
  k[4][4] = b
  k[4][5] = -c
  k[5][1] = c
  k[5][2] = e
  k[5][4] = -c
  k[5][5] = d
  return k
}

function T(mi: MemberInfo): number[][] {
  const { c, s } = mi
  const t = zeros(6)
  t[0][0] = c
  t[0][1] = s
  t[1][0] = -s
  t[1][1] = c
  t[2][2] = 1
  t[3][3] = c
  t[3][4] = s
  t[4][3] = -s
  t[4][4] = c
  t[5][5] = 1
  return t
}

function memberGlobalK(mi: MemberInfo): number[][] {
  const kl = memberLocalK(mi)
  const t = T(mi)
  // kg = T^T kl T
  const kt = zeros(6)
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 6; j++) {
      let s = 0
      for (let k = 0; k < 6; k++) s += kl[i][k] * t[k][j]
      kt[i][j] = s
    }
  const kg = zeros(6)
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 6; j++) {
      let s = 0
      for (let k = 0; k < 6; k++) s += t[k][i] * kt[k][j]
      kg[i][j] = s
    }
  return kg
}

function localDisp(mi: MemberInfo, u: number[]): number[] {
  const g = mi.dofs.map((d) => (d >= 0 ? u[d] : 0))
  const t = T(mi)
  return t.map((row) => row.reduce((s, v, k) => s + v * g[k], 0))
}

function toGlobalVec(mi: MemberInfo, p: number[]): number[] {
  const t = T(mi)
  const g = new Array(6).fill(0)
  for (let i = 0; i < 6; i++) for (let k = 0; k < 6; k++) g[i] += t[k][i] * p[k]
  return g
}

function toLocal(mi: MemberInfo, ld: Load, ll: LocalLoads) {
  const { c, s, L } = mi
  if (ld.kind === 'point') {
    if (ld.a < -1e-9 || ld.a > L + 1e-9) throw new Error(`point load outside member ${mi.mem.id}`)
    let px: number, py: number
    const fx = ld.fx ?? 0
    const fy = ld.fy ?? 0
    if (ld.local) {
      px = fx
      py = fy
    } else {
      px = c * fx + s * fy
      py = -s * fx + c * fy
    }
    ll.point.push({ a: Math.min(Math.max(ld.a, 0), L), px, py, m: ld.m ?? 0 })
  } else if (ld.kind === 'dist') {
    const a = ld.a ?? 0
    const b = ld.b ?? L
    let w1 = ld.w1
    let w2 = ld.w2 ?? ld.w1
    if (ld.proj) {
      const f = ld.dir === 'y' ? Math.abs(c) : ld.dir === 'x' ? Math.abs(s) : 1
      w1 *= f
      w2 *= f
    }
    let qx1 = 0,
      qx2 = 0,
      qy1 = 0,
      qy2 = 0
    if (ld.dir === 'y') {
      qx1 = s * w1
      qx2 = s * w2
      qy1 = c * w1
      qy2 = c * w2
    } else if (ld.dir === 'x') {
      qx1 = c * w1
      qx2 = c * w2
      qy1 = -s * w1
      qy2 = -s * w2
    } else {
      qy1 = w1
      qy2 = w2
    }
    ll.dist.push({ a, b, qx1, qx2, qy1, qy2 })
  }
}

function hermite(xi: number, L: number) {
  return [1 - 3 * xi * xi + 2 * xi ** 3, L * (xi - 2 * xi * xi + xi ** 3), 3 * xi * xi - 2 * xi ** 3, L * (-xi * xi + xi ** 3)]
}
function hermiteD(xi: number, L: number) {
  return [(-6 * xi + 6 * xi * xi) / L, 1 - 4 * xi + 3 * xi * xi, (6 * xi - 6 * xi * xi) / L, -2 * xi + 3 * xi * xi]
}

/** consistent equivalent nodal loads in local axes [px_i, py_i, m_i, px_j, py_j, m_j] */
function equivalentLocal(mi: MemberInfo, ll: LocalLoads): number[] {
  const p = new Array(6).fill(0)
  const L = mi.L
  const truss = !!mi.mem.truss
  const addAt = (x: number, px: number, py: number, m: number) => {
    const xi = x / L
    p[0] += px * (1 - xi)
    p[3] += px * xi
    if (truss) {
      p[1] += py * (1 - xi)
      p[4] += py * xi
      if (m) {
        p[1] += -m / L
        p[4] += m / L
      }
      return
    }
    const H = hermite(xi, L)
    p[1] += py * H[0]
    p[2] += py * H[1]
    p[4] += py * H[2]
    p[5] += py * H[3]
    if (m) {
      const D = hermiteD(xi, L)
      p[1] += m * D[0]
      p[2] += m * D[1]
      p[4] += m * D[2]
      p[5] += m * D[3]
    }
  }
  for (const pt of ll.point) addAt(pt.a, pt.px, pt.py, pt.m)
  for (const d of ll.dist) {
    // split into 4 sub-intervals x 3 gauss points (exact for these polynomial degrees)
    const n = 4
    const h = (d.b - d.a) / n
    for (let k = 0; k < n; k++) {
      const x0 = d.a + k * h
      for (const g of GAUSS3) {
        const x = x0 + h / 2 + (g.x * h) / 2
        const t = (x - d.a) / (d.b - d.a)
        const qx = d.qx1 + (d.qx2 - d.qx1) * t
        const qy = d.qy1 + (d.qy2 - d.qy1) * t
        addAt(x, qx * g.w * h * 0.5, qy * g.w * h * 0.5, 0)
      }
    }
  }
  return p
}

function makeMemberResult(mi: MemberInfo, end: number[], ll: LocalLoads): MemberResult {
  const L = mi.L
  const eps = 1e-9
  const inc = (a: number, x: number, side: -1 | 1) => (side < 0 ? a < x - eps : a < x + eps)
  // integrals of a linear distributed load clipped to [a, min(x,b)]
  const distInt = (x: number) => {
    let Qx = 0,
      Qy = 0,
      Mq = 0
    for (const d of ll.dist) {
      const e = Math.min(x, d.b)
      if (e <= d.a) continue
      const h = e - d.a
      for (const g of GAUSS3) {
        const t = d.a + h / 2 + (g.x * h) / 2
        const r = d.b === d.a ? 0 : (t - d.a) / (d.b - d.a)
        const qx = d.qx1 + (d.qx2 - d.qx1) * r
        const qy = d.qy1 + (d.qy2 - d.qy1) * r
        const w = g.w * h * 0.5
        Qx += qx * w
        Qy += qy * w
        Mq += qy * (x - t) * w
      }
    }
    return { Qx, Qy, Mq }
  }
  const [Fxi, Fyi, Mi] = end
  const breaks = new Set<number>([0, L])
  for (const p of ll.point) breaks.add(p.a)
  for (const d of ll.dist) {
    breaks.add(d.a)
    breaks.add(d.b)
  }
  const r: MemberResult = {
    id: mi.mem.id,
    L,
    c: mi.c,
    s: mi.s,
    truss: !!mi.mem.truss,
    end,
    loads: ll,
    breaks: [...breaks].sort((a, b) => a - b),
    N(x, side = 1) {
      const { Qx } = distInt(x)
      let s = Fxi + Qx
      for (const p of ll.point) if (inc(p.a, x, side)) s += p.px
      return snap(-s)
    },
    V(x, side = 1) {
      const { Qy } = distInt(x)
      let s = Fyi + Qy
      for (const p of ll.point) if (inc(p.a, x, side)) s += p.py
      return snap(s)
    },
    M(x, side = 1) {
      const { Mq } = distInt(x)
      let s = -Mi + Fyi * x + Mq
      for (const p of ll.point) if (inc(p.a, x, side)) s += p.py * (x - p.a) - p.m
      return snap(s)
    },
  }
  return r
}

function snap(v: number) {
  return Math.abs(v) < 1e-9 ? 0 : v
}
