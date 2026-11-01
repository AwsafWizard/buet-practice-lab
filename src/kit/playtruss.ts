// Truss playground: parametric truss, a moving load on the deck chord (handed to the two nearest
// deck joints by simple stringers), optional dead load at every deck joint.

import { determinacy } from '../engine/determinacy'
import { influenceLine, systemFor, type ILD } from '../engine/ild'
import type { Load, Model } from '../engine/model'
import { buildTruss, type TrussType } from '../labs/trusses'

export interface PlayTruss {
  type: TrussType
  n: number
  w: number
  h: number
  /** chord the deck (and so the loads) sits on; roof trusses are always loaded on the top chord */
  deck: 'bottom' | 'top'
}

export function buildPlayTruss(c: PlayTruss) {
  const { model } = buildTruss({ type: c.type, n: c.n, w: c.w, h: c.h, loads: [] })
  const m: Model = { ...model, loads: [] }
  const top = c.type === 'roof' || c.deck === 'top'
  const deck = top ? ['L0', ...Array.from({ length: c.n - 1 }, (_, k) => `U${k + 1}`), `L${c.n}`] : Array.from({ length: c.n + 1 }, (_, k) => `L${k}`)
  const nm = new Map(m.nodes.map((q) => [q.id, q]))
  return { cfg: c, model: m, deck, deckXY: deck.map((id) => ({ id, x: nm.get(id)!.x, y: nm.get(id)!.y })), L: c.n * c.w, top, det: determinacy(m) }
}
export type BuiltTruss = ReturnType<typeof buildPlayTruss>

/** joint loads (down +) that a load P at x puts on the deck joints */
export function jointShares(t: BuiltTruss, x: number, P: number) {
  const d = t.deckXY
  const xc = Math.min(Math.max(x, d[0].x), d[d.length - 1].x)
  let k = d.findIndex((q, i) => i < d.length - 1 && xc <= d[i + 1].x + 1e-9)
  if (k < 0) k = d.length - 2
  const f = (xc - d[k].x) / (d[k + 1].x - d[k].x)
  return [
    { node: d[k].id, x: d[k].x, y: d[k].y, F: P * (1 - f) },
    { node: d[k + 1].id, x: d[k + 1].x, y: d[k + 1].y, F: P * f },
  ].filter((s) => Math.abs(s.F) > 1e-12)
}

/** height of the deck chord at x (for drawing the load) */
export function deckY(t: BuiltTruss, x: number) {
  const d = t.deckXY
  for (let i = 0; i < d.length - 1; i++) if (x <= d[i + 1].x + 1e-9) return d[i].y + ((d[i + 1].y - d[i].y) * (x - d[i].x)) / (d[i + 1].x - d[i].x)
  return d[d.length - 1].y
}

export interface TrussResult {
  forces: Map<string, number> // tension +
  reactions: { node: string; rx: number; ry: number }[]
}

export function analyseTruss(t: BuiltTruss, loadX: number, P: number, wd = 0): TrussResult {
  const sys = systemFor(t.model)
  const loads: Load[] = jointShares(t, loadX, P).map((s) => ({ kind: 'node', node: s.node, fy: -s.F }))
  if (wd) for (const id of t.deck) loads.push({ kind: 'node', node: id, fy: -wd })
  const r = sys.solve(loads)
  const forces = new Map<string, number>()
  for (const mem of t.model.members) {
    const v = r.member(mem.id).N(r.member(mem.id).L / 2)
    forces.set(mem.id, Math.abs(v) < 1e-9 ? 0 : v)
  }
  const reactions = t.model.supports.map((s) => {
    const rr = r.reaction(s.node)
    return { node: s.node, rx: rr.rx, ry: rr.ry }
  })
  return { forces, reactions }
}

export function memberILD(t: BuiltTruss, member: string): ILD {
  return influenceLine(t.model, { kind: 'panel', nodes: t.deck }, { kind: 'force', member })
}

export function reactionILDTruss(t: BuiltTruss, node: string): ILD {
  return influenceLine(t.model, { kind: 'panel', nodes: t.deck }, { kind: 'reaction', node, comp: 'y' })
}
