// Structure description used by every solver, drawing and question in the app.
// Coordinates: x to the right, y UP. Forces positive in +x / +y, moments counter-clockwise.
// Units are whatever the problem uses (kip-ft, kN-m ...) — solvers are unit-agnostic.

export interface SNode {
  id: string
  x: number
  y: number
  /** draw label (defaults to id) — '' hides it */
  label?: string
  /** internal hinge: every member end meeting here is released for moment */
  hinge?: boolean
}

export type SupportType = 'fixed' | 'pin' | 'roller' | 'link' | 'guide'

export interface Support {
  node: string
  type: SupportType
  /**
   * roller/link: direction (deg) of the single reaction (90 = vertical reaction).
   * guide: direction (deg) of the restrained translation (rotation also restrained).
   */
  dir?: number
  /** auxiliary restraint (e.g. stringer stability) — not drawn */
  hidden?: boolean
}

export interface Member {
  id: string
  i: string
  j: string
  /** pin-ended axial member (truss bar / link / hanger) */
  truss?: boolean
  /** moment release at end i / j (internal hinge on this member only) */
  relI?: boolean
  relJ?: boolean
  EA?: number
  EI?: number
  /** optional label shown on the member (e.g. 'a', 'U2U3', 'I1') */
  label?: string
  /** drawing style */
  style?: 'normal' | 'dashed' | 'cable' | 'stringer' | 'thin'
}

export type Load =
  | { kind: 'node'; node: string; fx?: number; fy?: number; m?: number; label?: string }
  | {
      kind: 'point'
      member: string
      /** distance from end i along the member */
      a: number
      fx?: number
      fy?: number
      /** local=true: fx along member, fy along member's left normal */
      local?: boolean
      m?: number
      label?: string
    }
  | {
      kind: 'dist'
      member: string
      /** start / end distance along member from end i (default whole member) */
      a?: number
      b?: number
      /** intensities at a and b, force per unit length */
      w1: number
      w2?: number
      /** 'y' global vertical (negative = downward), 'x' global horizontal, 'perp' local left normal */
      dir: 'x' | 'y' | 'perp'
      /** intensity given per unit horizontal (dir y) / vertical (dir x) projection */
      proj?: boolean
      label?: string
    }

export interface Model {
  nodes: SNode[]
  members: Member[]
  supports: Support[]
  loads: Load[]
  /** default stiffness when members omit them */
  EA?: number
  EI?: number
}

export const DEFAULT_EA = 1e8
export const DEFAULT_EI = 1e6

export function nodeMap(m: Model) {
  const map = new Map<string, SNode>()
  for (const n of m.nodes) map.set(n.id, n)
  return map
}

export function memberGeom(model: Model, mem: Member) {
  const nm = nodeMap(model)
  const ni = nm.get(mem.i)
  const nj = nm.get(mem.j)
  if (!ni || !nj) throw new Error(`member ${mem.id}: unknown node`)
  const dx = nj.x - ni.x
  const dy = nj.y - ni.y
  const L = Math.hypot(dx, dy)
  return { ni, nj, L, c: dx / L, s: dy / L }
}

// ---------- small builders to keep question data compact ----------

/** Build a straight beam along x from a list of stations. */
export function beam(
  stations: { id: string; x: number; support?: SupportType; hinge?: boolean; label?: string; dir?: number }[],
  opts: { EI?: number; idPrefix?: string } = {},
): Model {
  const nodes: SNode[] = stations.map((s) => ({ id: s.id, x: s.x, y: 0, hinge: s.hinge, label: s.label }))
  const members: Member[] = []
  for (let k = 0; k < stations.length - 1; k++) {
    const a = stations[k]
    const b = stations[k + 1]
    members.push({ id: `${opts.idPrefix ?? ''}${a.id}${b.id}`, i: a.id, j: b.id, EI: opts.EI })
  }
  const supports: Support[] = stations
    .filter((s) => s.support)
    .map((s) => ({ node: s.id, type: s.support!, dir: s.dir }))
  return { nodes, members, supports, loads: [] }
}
