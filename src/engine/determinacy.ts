// Degree of static & kinematic indeterminacy, with an independent stability check
// via the rank of the equilibrium matrix (catches geometric instability too).

import { rank } from './linalg'
import type { Model } from './model'

export interface Determinacy {
  kind: 'truss' | 'frame'
  m: number // members (b for trusses)
  r: number // reaction components
  j: number // joints
  c: number // equations of condition (releases)
  formula: string
  dosiFormula: number
  unknowns: number
  equations: number
  rankA: number
  dosi: number // unknowns - rank(A)
  stable: boolean
  geometricallyUnstable: boolean
  doki: number
  dokiNoAxial: number
  dokiParts: { free: number; support: number; special: number }
  label: 'unstable' | 'determinate' | 'indeterminate'
}

export function determinacy(model: Model): Determinacy {
  const allTruss = model.members.every((m) => m.truss)
  const nodeIdx = new Map(model.nodes.map((n, i) => [n.id, i]))
  const memAt = new Map<string, typeof model.members>()
  for (const n of model.nodes) memAt.set(n.id, [])
  for (const m of model.members) {
    memAt.get(m.i)!.push(m)
    memAt.get(m.j)!.push(m)
  }
  const released = (m: (typeof model.members)[number], end: 'i' | 'j') => {
    if (m.truss) return true
    const node = model.nodes[nodeIdx.get(end === 'i' ? m.i : m.j)!]
    return !!(end === 'i' ? m.relI : m.relJ) || !!node.hinge
  }

  // reactions
  let r = 0
  const restraintRows: { node: string; vec: [number, number, number] }[] = []
  for (const s of model.supports) {
    const a = ((s.dir ?? 90) * Math.PI) / 180
    const v: [number, number, number] = [Math.cos(a), Math.sin(a), 0]
    const add = (vec: [number, number, number]) => {
      restraintRows.push({ node: s.node, vec })
      r++
    }
    if (s.type === 'fixed') {
      add([1, 0, 0])
      add([0, 1, 0])
      add([0, 0, 1])
    } else if (s.type === 'pin') {
      add([1, 0, 0])
      add([0, 1, 0])
    } else if (s.type === 'guide') {
      add(v)
      add([0, 0, 1])
    } else add(v)
  }

  // equations of condition: at each node, (number of frame member ends meeting) - 1 released ends count
  let c = 0
  for (const n of model.nodes) {
    const ms = memAt.get(n.id)!.filter((m) => !m.truss)
    if (!ms.length) continue
    const rel = ms.filter((m) => released(m, m.i === n.id ? 'i' : 'j')).length
    const rotRestrained = model.supports.some((s) => s.node === n.id && (s.type === 'fixed' || s.type === 'guide'))
    if (n.hinge) c += rotRestrained ? ms.length : ms.length - 1
    else c += rel // individual member releases at a rigid joint
  }

  const m = model.members.length
  const j = model.nodes.length
  const dosiFormula = allTruss ? m + r - 2 * j : 3 * m + r - 3 * j - c
  const formula = allTruss ? 'b + r − 2j' : '3m + r − (3j + c)'

  // equilibrium matrix: rows = node dofs (x, y, θ), cols = basic member forces + reactions
  const cols: { entries: [number, number][] }[] = []
  const rowOf = (node: string, k: number) => nodeIdx.get(node)! * 3 + k
  for (const mem of model.members) {
    const ni = model.nodes[nodeIdx.get(mem.i)!]
    const nj = model.nodes[nodeIdx.get(mem.j)!]
    const L = Math.hypot(nj.x - ni.x, nj.y - ni.y)
    const cx = (nj.x - ni.x) / L
    const sy = (nj.y - ni.y) / L
    // axial (tension): pulls node i toward j, node j toward i
    cols.push({ entries: [[rowOf(mem.i, 0), cx], [rowOf(mem.i, 1), sy], [rowOf(mem.j, 0), -cx], [rowOf(mem.j, 1), -sy]] })
    // end moments (if not released): moment + equal & opposite shears (M/L) on both ends
    for (const end of ['i', 'j'] as const) {
      if (released(mem, end)) continue
      const node = end === 'i' ? mem.i : mem.j
      const nx = -sy,
        ny = cx // member left normal
      cols.push({
        entries: [
          [rowOf(node, 2), 1],
          [rowOf(mem.i, 0), nx / L],
          [rowOf(mem.i, 1), ny / L],
          [rowOf(mem.j, 0), -nx / L],
          [rowOf(mem.j, 1), -ny / L],
        ],
      })
    }
  }
  for (const rr of restraintRows) {
    const e: [number, number][] = []
    rr.vec.forEach((v, k) => {
      if (Math.abs(v) > 1e-12) e.push([rowOf(rr.node, k), v])
    })
    cols.push({ entries: e })
  }
  const nrows = model.nodes.length * 3
  const A: number[][] = Array.from({ length: nrows }, () => new Array(cols.length).fill(0))
  cols.forEach((col, k) => col.entries.forEach(([row, v]) => (A[row][k] += v)))
  // drop rotation rows that are identically zero (truss joints / pure hinges): those rotations are free by nature
  const keep = A.filter((row, i) => !(i % 3 === 2 && row.every((v) => Math.abs(v) < 1e-12)))
  const rk = rank(keep)
  const equations = keep.length
  const unknowns = cols.length
  const dosi = unknowns - rk
  const stable = rk === equations
  const geometricallyUnstable = !stable && dosiFormula >= 0

  // DOKI (counting as in the lectures): translations + rotations (+ extra rotations at hinges) - restraints
  let rot = 0
  let special = 0
  for (const n of model.nodes) {
    const ms = memAt.get(n.id)!.filter((mm) => !mm.truss)
    if (!ms.length) continue
    const relEnds = ms.filter((mm) => released(mm, mm.i === n.id ? 'i' : 'j')).length
    const rigidEnds = ms.length - relEnds
    const nrot = (rigidEnds > 0 ? 1 : 0) + relEnds
    const rotRestrained = model.supports.some((s) => s.node === n.id && (s.type === 'fixed' || s.type === 'guide'))
    const free = rotRestrained ? Math.max(0, nrot - 1) : nrot
    rot += free
    if (nrot > 1) special += nrot - 1
  }
  const transRestr = restraintRows.filter((rr) => Math.abs(rr.vec[2]) < 1e-12)
  const nTrans = model.nodes.length * 2
  const trans = nTrans - rank(transRestr.map((rr) => rowVec(rr, nodeIdx, nTrans)))
  const doki = trans + rot
  // ignoring axial deformation of frame members
  const inext = model.members
    .filter((mm) => !mm.truss)
    .map((mm) => {
      const ni = model.nodes[nodeIdx.get(mm.i)!]
      const nj = model.nodes[nodeIdx.get(mm.j)!]
      const L = Math.hypot(nj.x - ni.x, nj.y - ni.y)
      const row = new Array(nTrans).fill(0)
      const a = nodeIdx.get(mm.i)! * 2
      const b = nodeIdx.get(mm.j)! * 2
      row[a] -= (nj.x - ni.x) / L
      row[a + 1] -= (nj.y - ni.y) / L
      row[b] += (nj.x - ni.x) / L
      row[b + 1] += (nj.y - ni.y) / L
      return row
    })
  const transNA = nTrans - rank([...transRestr.map((rr) => rowVec(rr, nodeIdx, nTrans)), ...inext])
  const dokiNoAxial = transNA + rot
  const supportNodes = new Set(model.supports.map((s) => s.node))
  const freeJ = model.nodes.filter((n) => !supportNodes.has(n.id)).length
  return {
    kind: allTruss ? 'truss' : 'frame',
    m,
    r,
    j,
    c,
    formula,
    dosiFormula,
    unknowns,
    equations,
    rankA: rk,
    dosi: stable ? dosi : dosiFormula,
    stable,
    geometricallyUnstable,
    doki,
    dokiNoAxial,
    dokiParts: { free: freeJ, support: model.supports.length, special },
    label: !stable ? 'unstable' : dosi === 0 ? 'determinate' : 'indeterminate',
  }
}

function rowVec(rr: { node: string; vec: [number, number, number] }, idx: Map<string, number>, n: number) {
  const row = new Array(n).fill(0)
  const k = idx.get(rr.node)! * 2
  row[k] = rr.vec[0]
  row[k + 1] = rr.vec[1]
  return row
}
