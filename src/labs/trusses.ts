// Parametric truss library for labs.
import type { Load, Member, Model, SNode } from '../engine/model'

export type TrussType = 'pratt' | 'howe' | 'warren' | 'roof' | 'parker' | 'xbraced'

export const TRUSS_NAMES: Record<TrussType, string> = {
  pratt: 'Pratt',
  howe: 'Howe',
  warren: 'Warren (with verticals)',
  roof: 'Fink-type roof truss',
  parker: 'Parker (curved top chord)',
  xbraced: 'X-braced (indeterminate)',
}

export interface TrussSpec {
  type: TrussType
  n: number // panels (even)
  w: number // panel width
  h: number // height
  loads: number[] // load at bottom joints L1..L(n-1) (or top joints for roof)
}

export function buildTruss(s: TrussSpec): { model: Model; pairs: [string, string][] } {
  const { n, w, h } = s
  const nodes: SNode[] = []
  const members: Member[] = []
  const pairs: [string, string][] = []
  const bar = (i: string, j: string) => members.push({ id: i + j, i, j, truss: true })
  const L = (k: number) => `L${k}`
  const U = (k: number) => `U${k}`
  for (let k = 0; k <= n; k++) nodes.push({ id: L(k), x: k * w, y: 0 })
  for (let k = 0; k < n; k++) bar(L(k), L(k + 1))
  const loads: Load[] = []
  if (s.type === 'roof') {
    // top joints rise linearly to the middle
    const top = (k: number) => (h * Math.min(k, n - k)) / (n / 2)
    for (let k = 1; k < n; k++) nodes.push({ id: U(k), x: k * w, y: top(k) })
    bar(L(0), U(1))
    for (let k = 1; k < n - 1; k++) bar(U(k), U(k + 1))
    bar(U(n - 1), L(n))
    for (let k = 1; k < n; k++) bar(L(k), U(k))
    for (let k = 1; k < n / 2; k++) bar(U(k), L(k + 1))
    for (let k = n / 2 + 1; k < n; k++) bar(L(k - 1), U(k))
    for (let k = 1; k < n; k++) if (s.loads[k - 1]) loads.push({ kind: 'node', node: U(k), fy: -s.loads[k - 1] })
    return { model: { nodes, members, supports: [{ node: L(0), type: 'pin' }, { node: L(n), type: 'roller' }], loads }, pairs }
  }
  const topH = (k: number) => (s.type === 'parker' ? h * (0.65 + 0.35 * Math.sin((Math.PI * k) / n)) : h)
  if (s.type === 'warren') {
    for (let k = 1; k < n; k++) nodes.push({ id: U(k), x: k * w, y: h })
    bar(L(0), U(1))
    for (let k = 1; k < n - 1; k++) bar(U(k), U(k + 1))
    bar(U(n - 1), L(n))
    for (let k = 1; k < n; k++) bar(L(k), U(k))
    for (let k = 1; k < n - 1; k++) (k % 2 ? bar(U(k), L(k + 1)) : bar(L(k), U(k + 1)))
  } else {
    for (let k = 1; k < n; k++) nodes.push({ id: U(k), x: k * w, y: topH(k) })
    bar(L(0), U(1))
    for (let k = 1; k < n - 1; k++) bar(U(k), U(k + 1))
    bar(U(n - 1), L(n))
    for (let k = 1; k < n; k++) bar(L(k), U(k))
    for (let k = 1; k < n - 1; k++) {
      const left = k < n / 2
      if (s.type === 'xbraced') {
        bar(U(k), L(k + 1))
        bar(L(k), U(k + 1))
        pairs.push([U(k) + L(k + 1), L(k) + U(k + 1)])
      } else if ((s.type === 'pratt' || s.type === 'parker') === left) bar(U(k), L(k + 1))
      else bar(L(k), U(k + 1))
    }
  }
  for (let k = 1; k < n; k++) if (s.loads[k - 1]) loads.push({ kind: 'node', node: L(k), fy: -s.loads[k - 1] })
  return { model: { nodes, members, supports: [{ node: L(0), type: 'pin' }, { node: L(n), type: 'roller' }], loads }, pairs }
}

/** members crossing a vertical line x = xc */
export function cutMembers(m: Model, xc: number) {
  const nm = new Map(m.nodes.map((n) => [n.id, n]))
  return m.members.filter((mem) => {
    const a = nm.get(mem.i)!.x
    const b = nm.get(mem.j)!.x
    return Math.min(a, b) < xc - 1e-9 && Math.max(a, b) > xc + 1e-9
  })
}

/** intersection of the lines of two members (null if parallel) */
export function intersect(m: Model, a: Member, b: Member): { x: number; y: number } | null {
  const nm = new Map(m.nodes.map((n) => [n.id, n]))
  const p1 = nm.get(a.i)!,
    p2 = nm.get(a.j)!,
    p3 = nm.get(b.i)!,
    p4 = nm.get(b.j)!
  const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(d) < 1e-9) return null
  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d
  return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }
}

/** zero-force members by the two classic rules applied repeatedly (unloaded joints only) */
export function zeroForceByRules(m: Model) {
  const loaded = new Set(m.loads.filter((l) => l.kind === 'node').map((l) => (l as { node: string }).node))
  const supported = new Set(m.supports.map((s) => s.node))
  const nm = new Map(m.nodes.map((n) => [n.id, n]))
  const zero = new Set<string>()
  let changed = true
  while (changed) {
    changed = false
    for (const n of m.nodes) {
      if (loaded.has(n.id) || supported.has(n.id)) continue
      const ms = m.members.filter((x) => (x.i === n.id || x.j === n.id) && !zero.has(x.id))
      const dir = (x: Member) => {
        const o = nm.get(x.i === n.id ? x.j : x.i)!
        const L = Math.hypot(o.x - n.x, o.y - n.y)
        return [(o.x - n.x) / L, (o.y - n.y) / L]
      }
      const colinear = (a: Member, b: Member) => {
        const da = dir(a),
          db = dir(b)
        return Math.abs(da[0] * db[1] - da[1] * db[0]) < 1e-6
      }
      if (ms.length === 2 && !colinear(ms[0], ms[1])) {
        ms.forEach((x) => zero.add(x.id))
        changed = true
      } else if (ms.length === 3) {
        for (let i = 0; i < 3; i++) {
          const others = ms.filter((_, k) => k !== i)
          if (colinear(others[0], others[1]) && !colinear(ms[i], others[0])) {
            zero.add(ms[i].id)
            changed = true
          }
        }
      }
    }
  }
  return zero
}
