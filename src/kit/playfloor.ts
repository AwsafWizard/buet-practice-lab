// Floor-system playground: a girder (supports + hinges anywhere) carrying floor beams, with simply
// supported stringers between floor beams. One moving point load on the deck.

import { sampleMember } from '../engine/diagrams'
import { evaluate, influenceLine, systemFor, type ILD, type Pt } from '../engine/ild'
import { buildBeam, sectionILDs, type BuiltBeam, type PlayBeam, type PlaySupportType } from '../engine/playbeam'
import { floorSystem } from './builders'

export interface PlayFloor {
  girder: PlayBeam
  /** floor-beam positions on the girder */
  floorBeams: number[]
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRTUVWXYZ' // no S: that's the section
const key = (x: number) => Math.round(x * 1e6) / 1e6

export function buildFloor(f: PlayFloor) {
  const L = f.girder.L
  const fbs = [...new Set(f.floorBeams.map(key))].filter((x) => x >= 0 && x <= L).sort((a, b) => a - b)
  const hinges = f.girder.hinges.map((h) => key(h.x))
  const stations = [...new Set([0, L, ...fbs, ...f.girder.supports.map((s) => key(s.x)), ...hinges])].sort((a, b) => a - b)
  const names: Record<number, string> = {}
  stations.forEach((x, k) => (names[x] = LETTERS[k] ?? `N${k}`))
  const nameAt = (x: number) => names[key(x)] ?? '?'
  const girder = buildBeam(f.girder) // stability of the girder on its own + "direct loading" comparison
  const ok = girder.det.stable && fbs.length >= 2
  const rise = Math.max(1.5, L * 0.09)
  const fs = ok
    ? floorSystem({
        floorBeams: fbs,
        stringers: fbs.slice(0, -1).map((x, k) => [x, fbs[k + 1]] as [number, number]),
        supports: f.girder.supports.map((s) => ({ x: key(s.x), type: s.type })),
        names,
        extra: stations,
        rise,
      })
    : null
  if (fs) {
    for (const n of fs.model.nodes) if (hinges.includes(key(n.x)) && n.y === 0 && n.x > 0 && n.x < L) n.hinge = true
    if (girder.hiddenX) {
      const first = [...f.girder.supports].sort((a, b) => a.x - b.x)[0]
      fs.model.supports.push({ node: nameAt(first.x), type: 'roller', dir: 0, hidden: true })
    }
  }
  return { cfg: f, L, fbs, stations, nameAt, girder, fs, rise, deck: [fbs[0] ?? 0, fbs[fbs.length - 1] ?? L] as [number, number] }
}
export type BuiltFloor = ReturnType<typeof buildFloor>

/** stringer member carrying the deck at x */
function stringerAt(b: BuiltFloor, x: number) {
  const k = Math.max(0, Math.min(b.fbs.length - 2, b.fbs.findIndex((f, i) => i < b.fbs.length - 1 && x <= b.fbs[i + 1] + 1e-9)))
  return { id: b.fs!.path.members[k], a: Math.min(Math.max(x - b.fbs[k], 0), b.fbs[k + 1] - b.fbs[k]) }
}

const sideOf = (b: BuiltFloor, x: number): -1 | 1 => (x >= b.L - 1e-9 ? -1 : 1)

export interface FloorResult {
  /** load each floor beam delivers to the girder (+ down) */
  fbLoads: { x: number; name: string; F: number }[]
  reactions: { x: number; name: string; type: PlaySupportType; R: number; M: number }[]
  V: Pt[]
  M: Pt[]
  VS: number
  MS: number
}

export function analyseFloor(b: BuiltFloor, loadX: number, P: number, secX: number): FloorResult {
  const fs = b.fs!
  const sys = systemFor(fs.model)
  const at = stringerAt(b, Math.min(Math.max(loadX, b.deck[0]), b.deck[1]))
  const r = sys.solve([{ kind: 'point', member: at.id, a: at.a, fy: -P }])
  const fbLoads = b.fbs.map((x) => ({ x, name: b.nameAt(x), F: clean(evaluate(r, fs.fbr(x))) }))
  const reactions = [...b.cfg.girder.supports]
    .sort((p, q) => p.x - q.x)
    .map((s) => {
      const rr = r.reaction(b.nameAt(s.x))
      return { x: s.x, name: b.nameAt(s.x), type: s.type, R: clean(rr.ry), M: s.type === 'fixed' ? clean(rr.m) : 0 }
    })
  const V: Pt[] = []
  const M: Pt[] = []
  for (const mem of fs.model.members.filter((m) => m.id.startsWith('G:'))) {
    const d = sampleMember(fs.model, r.member(mem.id), 2)
    for (const s of d.samples) {
      V.push({ x: d.x1 + s.t, y: clean(s.V) })
      M.push({ x: d.x1 + s.t, y: clean(s.M) })
    }
  }
  const side = sideOf(b, secX)
  return { fbLoads, reactions, V, M, VS: clean(evaluate(r, fs.shear(secX, side))), MS: clean(evaluate(r, fs.moment(secX))) }
}

export function floorILDs(b: BuiltFloor, secX: number) {
  const fs = b.fs!
  const side = sideOf(b, secX)
  const direct = sectionILDs(b.girder as BuiltBeam, secX)
  return {
    V: influenceLine(fs.model, fs.path, fs.shear(secX, side)),
    M: influenceLine(fs.model, fs.path, fs.moment(secX)),
    directV: direct.V,
    directM: direct.M,
  }
}

export type FloorPick = { kind: 'fb'; x: number } | { kind: 'R'; x: number }

export function floorPickILD(b: BuiltFloor, p: FloorPick): ILD {
  const fs = b.fs!
  return influenceLine(fs.model, fs.path, p.kind === 'fb' ? fs.fbr(p.x) : fs.reaction(p.x))
}

function clean(v: number) {
  return Math.abs(v) < 1e-9 ? 0 : v
}
