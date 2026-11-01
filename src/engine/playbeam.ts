// Customisable straight beam for the ILD playground: supports and hinges anywhere, one point load.
// Built on the real stiffness solver, so indeterminate set-ups work too (their ILDs come out curved).

import { determinacy, type Determinacy } from './determinacy'
import { sampleMember } from './diagrams'
import { influenceLine, systemFor, type ILD, type Pt, type Response } from './ild'
import type { Member, Model, SNode, Support } from './model'

export type PlaySupportType = 'pin' | 'roller' | 'fixed'
export interface PlaySupport {
  id: number
  x: number
  type: PlaySupportType
}
export interface PlayHinge {
  id: number
  x: number
}
export interface PlayBeam {
  L: number
  supports: PlaySupport[]
  hinges: PlayHinge[]
}

export interface BuiltBeam {
  beam: PlayBeam
  model: Model
  /** station x's in order (ends, supports, hinges) */
  xs: number[]
  /** letter of the station at x */
  nameAt: (x: number) => string
  /** no pin / fixed: a hidden horizontal restraint was added so vertical loads can be solved */
  hiddenX: boolean
  det: Determinacy
}

const key = (x: number) => Math.round(x * 1e6) / 1e6
const LETTERS = 'ABCDEFGHIJKLMNOPQRTUVWXYZ' // no S: that's the section

export function buildBeam(b: PlayBeam): BuiltBeam {
  const xs = [...new Set([0, b.L, ...b.supports.map((s) => s.x), ...b.hinges.map((h) => h.x)].map(key))].sort((p, q) => p - q)
  const names = new Map(xs.map((x, k) => [x, LETTERS[k] ?? `N${k}`]))
  const nameAt = (x: number) => names.get(key(x)) ?? '?'
  const hingeAt = new Set(b.hinges.map((h) => key(h.x)))
  const nodes: SNode[] = xs.map((x) => ({ id: nameAt(x), x, y: 0, hinge: hingeAt.has(x) && x > 0 && x < b.L ? true : undefined }))
  const members: Member[] = []
  for (let k = 0; k < xs.length - 1; k++) members.push({ id: nameAt(xs[k]) + nameAt(xs[k + 1]), i: nameAt(xs[k]), j: nameAt(xs[k + 1]) })
  const sorted = [...b.supports].sort((p, q) => p.x - q.x)
  const supports: Support[] = sorted.map((s) => ({ node: nameAt(s.x), type: s.type }))
  const hiddenX = sorted.length > 0 && !sorted.some((s) => s.type !== 'roller')
  if (hiddenX) supports.push({ node: nameAt(sorted[0].x), type: 'roller', dir: 0, hidden: true })
  const model: Model = { nodes, members, supports, loads: [] }
  return { beam: b, model, xs, nameAt, hiddenX, det: determinacy(model) }
}

/** member and local distance at global x. prefer +1 = the member starting at a station, -1 = the one ending there */
export function locate(bb: BuiltBeam, x: number, prefer: -1 | 1 = 1): { member: string; a: number } {
  const xs = bb.xs
  const L = xs[xs.length - 1]
  const xc = Math.min(Math.max(x, 0), L)
  let k = xs.findIndex((s, i) => i < xs.length - 1 && xc >= s - 1e-9 && xc <= xs[i + 1] + 1e-9)
  if (prefer > 0 && k < xs.length - 2 && Math.abs(xc - xs[k + 1]) < 1e-9) k++
  if (prefer < 0 && k > 0 && Math.abs(xc - xs[k]) < 1e-9) k--
  const m = bb.model.members[k]
  return { member: m.id, a: Math.min(Math.max(xc - xs[k], 0), xs[k + 1] - xs[k]) }
}

/** shear / moment response at section x (just right of x; just left at the right end) */
export function sectionResponse(bb: BuiltBeam, x: number, kind: 'shear' | 'moment'): Response {
  const side: -1 | 1 = x >= bb.beam.L - 1e-9 ? -1 : 1
  const at = locate(bb, x, side)
  return { kind, member: at.member, x: at.a, side }
}

export interface PlayReaction {
  name: string
  x: number
  type: PlaySupportType
  /** vertical reaction, + up */
  R: number
  /** fixed-end moment reaction, + counter-clockwise */
  M: number
}

export interface PlayResult {
  reactions: PlayReaction[]
  /** SFD and BMD under the load (a jump = two points at one x) */
  V: Pt[]
  M: Pt[]
  VS: number
  MS: number
}

/** solve for one downward point load P at loadX and read the section at secX */
export function analyse(bb: BuiltBeam, loadX: number, P: number, secX: number): PlayResult {
  const sys = systemFor(bb.model)
  const at = locate(bb, loadX, 1)
  const r = sys.solve([{ kind: 'point', member: at.member, a: at.a, fy: -P }])
  const reactions = [...bb.beam.supports]
    .sort((p, q) => p.x - q.x)
    .map((s) => {
      const rr = r.reaction(bb.nameAt(s.x))
      return { name: bb.nameAt(s.x), x: s.x, type: s.type, R: clean(rr.ry), M: s.type === 'fixed' ? clean(rr.m) : 0 }
    })
  const V: Pt[] = []
  const M: Pt[] = []
  for (const mem of bb.model.members) {
    const d = sampleMember(bb.model, r.member(mem.id), 2)
    for (const s of d.samples) {
      V.push({ x: d.x1 + s.t, y: clean(s.V) })
      M.push({ x: d.x1 + s.t, y: clean(s.M) })
    }
  }
  const sv = sectionResponse(bb, secX, 'shear')
  const sm = sectionResponse(bb, secX, 'moment')
  const VS = sv.kind === 'shear' ? r.member(sv.member).V(sv.x, sv.side) : 0
  const MS = sm.kind === 'moment' ? r.member(sm.member).M(sm.x, sm.side) : 0
  return { reactions, V: dedupe(V), M: dedupe(M), VS: clean(VS), MS: clean(MS) }
}

export interface PlayILDs {
  V: ILD
  M: ILD
}

export function sectionILDs(bb: BuiltBeam, secX: number): PlayILDs {
  const path = { kind: 'members' as const, members: bb.model.members.map((m) => m.id) }
  return {
    V: influenceLine(bb.model, path, sectionResponse(bb, secX, 'shear')),
    M: influenceLine(bb.model, path, sectionResponse(bb, secX, 'moment')),
  }
}

export function reactionILD(bb: BuiltBeam, x: number, comp: 'y' | 'm'): ILD {
  const path = { kind: 'members' as const, members: bb.model.members.map((m) => m.id) }
  return influenceLine(bb.model, path, { kind: 'reaction', node: bb.nameAt(x), comp })
}

function clean(v: number) {
  return Math.abs(v) < 1e-9 ? 0 : v
}

/** drop repeated points (member ends meeting with equal values) */
function dedupe(p: Pt[]): Pt[] {
  const out: Pt[] = []
  for (const q of p) {
    const last = out[out.length - 1]
    if (last && Math.abs(last.x - q.x) < 1e-9 && Math.abs(last.y - q.y) < 1e-9) continue
    out.push(q)
  }
  return out
}
