import type { Response } from '../engine/ild'
// Compact builders for question data.

import type { Load, Member, Model, SNode, Support, SupportType } from '../engine/model'

/** nodes: "A:0,0 B:10,0 C:10,8" (append '*' to mark an internal hinge, e.g. "D*:20,0") */
export function nodes(spec: string): SNode[] {
  return spec
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [name, xy] = tok.split(':')
      const [x, y] = xy.split(',').map(Number)
      const hinge = name.endsWith('*')
      const id = hinge ? name.slice(0, -1) : name
      return { id, x, y, hinge: hinge || undefined }
    })
}

/** members: "A-B B-C C-D" ; id = 'AB' unless given as "AB=A-B". prefix 't:' for truss bars applies to all when truss=true */
export function members(spec: string, opts: { truss?: boolean } = {}): Member[] {
  return spec
    .trim()
    .split(/\s+/)
    .map((tok) => {
      let id: string | undefined
      let body = tok
      if (tok.includes('=')) [id, body] = tok.split('=')
      const relI = body.startsWith('o')
      const relJ = body.endsWith('o')
      body = body.replace(/^o/, '').replace(/o$/, '')
      const [i, j] = body.split('-')
      return { id: id ?? i + j, i, j, truss: opts.truss || undefined, relI: relI || undefined, relJ: relJ || undefined }
    })
}

/** supports: "A:pin B:roller C:fixed D:roller@0" (roller@deg = reaction direction) */
export function supports(spec: string): Support[] {
  return spec
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [node, t] = tok.split(':')
      const [type, dir] = t.split('@')
      return { node, type: type as SupportType, dir: dir !== undefined ? Number(dir) : undefined }
    })
}

export function model(n: string, m: string, s: string, loads: Load[] = [], opts: { truss?: boolean; EI?: number; EA?: number } = {}): Model {
  return { nodes: nodes(n), members: members(m, opts), supports: supports(s), loads, EI: opts.EI, EA: opts.EA }
}

/** truss with member list; returns model with truss bars */
export function truss(n: string, m: string, s: string, loads: Load[] = []): Model {
  return model(n, m, s, loads, { truss: true })
}

// load shorthands (downward = negative y)
export const P = (node: string, down: number, label?: string): Load => ({ kind: 'node', node, fy: -down, label })
export const H = (node: string, right: number, label?: string): Load => ({ kind: 'node', node, fx: right, label })
export const F = (node: string, fx: number, fy: number, label?: string): Load => ({ kind: 'node', node, fx, fy, label })
export const Mo = (node: string, ccw: number, label?: string): Load => ({ kind: 'node', node, m: ccw, label })
export const Pm = (member: string, a: number, down: number, label?: string): Load => ({ kind: 'point', member, a, fy: -down, label })
export const Hm = (member: string, a: number, right: number, label?: string): Load => ({ kind: 'point', member, a, fx: right, label })
export const Mm = (member: string, a: number, ccw: number, label?: string): Load => ({ kind: 'point', member, a, m: ccw, label })
/** uniform downward load (per length along member; proj=true per horizontal length) */
export const W = (member: string, down: number, o: { a?: number; b?: number; proj?: boolean; label?: string } = {}): Load => ({
  kind: 'dist',
  member,
  w1: -down,
  dir: 'y',
  ...o,
})
/** linearly varying downward load */
export const Wv = (member: string, down1: number, down2: number, o: { a?: number; b?: number; proj?: boolean; label?: string } = {}): Load => ({
  kind: 'dist',
  member,
  w1: -down1,
  w2: -down2,
  dir: 'y',
  ...o,
})
/** horizontal distributed load (+ = to the right) */
export const Wx = (member: string, right1: number, right2?: number, o: { a?: number; b?: number; label?: string } = {}): Load => ({
  kind: 'dist',
  member,
  w1: right1,
  w2: right2,
  dir: 'x',
  ...o,
})
/** load normal to member (positive along member's left normal) */
export const Wn = (member: string, w1: number, w2?: number, o: { a?: number; b?: number; label?: string } = {}): Load => ({
  kind: 'dist',
  member,
  w1,
  w2,
  dir: 'perp',
  ...o,
})

/** straight beam from stations string "A:0:pin B:10 C*:15 D:25:roller" (C* = hinge) */
export function beamOf(spec: string, loads: Load[] = []): Model {
  const st = spec
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [nm, x, sup] = tok.split(':')
      const hinge = nm.endsWith('*')
      const id = hinge ? nm.slice(0, -1) : nm
      let type: SupportType | undefined
      let dir: number | undefined
      if (sup) {
        const [t, d] = sup.split('@')
        type = t as SupportType
        if (d !== undefined) dir = Number(d)
      }
      return { id, x: Number(x), hinge, type, dir }
    })
  const ns: SNode[] = st.map((s) => ({ id: s.id, x: s.x, y: 0, hinge: s.hinge || undefined }))
  const ms: Member[] = []
  for (let k = 0; k < st.length - 1; k++) ms.push({ id: st[k].id + st[k + 1].id, i: st[k].id, j: st[k + 1].id })
  const ss: Support[] = st.filter((s) => s.type).map((s) => ({ node: s.id, type: s.type!, dir: s.dir }))
  return { nodes: ns, members: ms, supports: ss, loads }
}

/** member ids along a beam model, in order */
export function pathOf(m: Model): string[] {
  return m.members.map((x) => x.id)
}

/** find member and local position for a global x on a straight horizontal beam */
export function atX(m: Model, x: number, prefer: 'left' | 'right' = 'right'): { member: string; a: number } {
  const nm = new Map(m.nodes.map((n) => [n.id, n]))
  const cands = m.members
    .map((mem) => {
      const a = nm.get(mem.i)!
      const b = nm.get(mem.j)!
      const lo = Math.min(a.x, b.x)
      const hi = Math.max(a.x, b.x)
      return { mem, a, b, lo, hi }
    })
    .filter((c) => Math.abs(c.a.y - c.b.y) < 1e-9 && x >= c.lo - 1e-9 && x <= c.hi + 1e-9)
  if (!cands.length) throw new Error(`no horizontal member at x=${x}`)
  let c = cands[0]
  if (cands.length > 1) {
    // at a node shared by two members: 'right' picks the member starting here
    c = prefer === 'right' ? cands.find((q) => Math.abs(q.lo - x) < 1e-9) ?? cands[0] : cands.find((q) => Math.abs(q.hi - x) < 1e-9) ?? cands[0]
  }
  const a = c.a.x <= c.b.x ? x - c.a.x : c.a.x - x
  return { member: c.mem.id, a }
}

// ---------------------------------------------------------------- floor beam systems

/**
 * Girder + floor beams + stringers, modelled as a real structure:
 * stringers (beams) sit on vertical floor-beam links that bear on the girder.
 * stringers: [x0, x1] spans of each separate stringer (overhangs allowed).
 */
export function floorSystem(o: {
  floorBeams: number[]
  stringers: [number, number][]
  supports: { x: number; type: SupportType }[]
  /** names for girder points, e.g. {0:'A', 8:'B'} */
  names?: Record<number, string>
  extra?: number[]
  rise?: number
}) {
  const rise = o.rise ?? 2.5
  const gx = [...new Set([...o.floorBeams, ...o.supports.map((s) => s.x), ...(o.extra ?? []), ...Object.keys(o.names ?? {}).map(Number)])].sort((a, b) => a - b)
  const gname = (x: number) => o.names?.[x] ?? `g${x}`
  const nodesL: SNode[] = gx.map((x) => ({ id: gname(x), x, y: 0 }))
  const membersL: Member[] = []
  for (let k = 0; k < gx.length - 1; k++) membersL.push({ id: `G:${gname(gx[k])}${gname(gx[k + 1])}`, i: gname(gx[k]), j: gname(gx[k + 1]) })
  const sup: Support[] = o.supports.map((s) => ({ node: gname(s.x), type: s.type }))
  const path: string[] = []
  o.stringers.forEach(([x0, x1], si) => {
    const xs = [...new Set([x0, x1, ...o.floorBeams.filter((x) => x > x0 - 1e-9 && x < x1 + 1e-9)])].sort((a, b) => a - b)
    const sid = (x: number) => `s${si}_${x}`
    xs.forEach((x) => nodesL.push({ id: sid(x), x, y: rise, label: '' }))
    for (let k = 0; k < xs.length - 1; k++) {
      const id = `S${si}:${xs[k]}-${xs[k + 1]}`
      membersL.push({ id, i: sid(xs[k]), j: sid(xs[k + 1]), style: 'stringer' })
      path.push(id)
    }
    xs.filter((x) => o.floorBeams.includes(x)).forEach((x, k) => {
      membersL.push({ id: `FB:${gname(x)}:${si}`, i: gname(x), j: sid(x), truss: true, style: 'thin' })
      if (k === 0) sup.push({ node: sid(x), type: 'roller', dir: 0, hidden: true })
    })
  })
  const model: Model = { nodes: nodesL, members: membersL, supports: sup, loads: [] }
  const girderAt = (x: number, side: -1 | 1) => {
    for (let k = 0; k < gx.length - 1; k++) {
      const a = gx[k],
        b = gx[k + 1]
      if ((side > 0 && x >= a - 1e-9 && x < b - 1e-9) || (side < 0 && x > a + 1e-9 && x <= b + 1e-9)) return { id: `G:${gname(a)}${gname(b)}`, a: x - a }
    }
    const k = side > 0 ? gx.length - 2 : 0
    return { id: `G:${gname(gx[k])}${gname(gx[k + 1])}`, a: x - gx[k] }
  }
  const fbIds = (x: number) => membersL.filter((m) => m.id.startsWith(`FB:${gname(x)}:`)).map((m) => m.id)
  return {
    model,
    path: { kind: 'members' as const, members: path },
    /** floor beam reaction (load delivered to the girder) at x, + downward on girder */
    fbr: (x: number): Response => ({ kind: 'custom', fn: (r) => fbIds(x).reduce((s, id) => s - r.member(id).N(0.1), 0) }),
    shear: (x: number, side: -1 | 1 = 1): Response => {
      const g = girderAt(x, side)
      return { kind: 'shear', member: g.id, x: g.a, side }
    },
    moment: (x: number): Response => {
      const g = girderAt(x, 1)
      return { kind: 'moment', member: g.id, x: g.a }
    },
    reaction: (x: number): Response => ({ kind: 'reaction', node: gname(x), comp: 'y' }),
    xs: gx,
  }
}
