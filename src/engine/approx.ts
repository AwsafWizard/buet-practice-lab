// Approximate analysis of building frames and X-braced trusses.
// Portal & cantilever methods for lateral loads; 0.1L method for vertical loads;
// equal-shear / tension-only assumptions for double-diagonal trusses.

import { linearMember, type DiagramMember } from './diagrams'
import { solve, type Result } from './frame2d'
import type { Model } from './model'

export interface GridFrame {
  /** x of each column line */
  xs: number[]
  /** storey heights, bottom storey first */
  heights: number[]
  /** lateral load at each floor level (index 0 = top of storey 1). + = to the right */
  loads: number[]
  base?: 'fixed' | 'pinned'
  /** relative column areas per storey [storey][column] (cantilever method) */
  areas?: number[][]
  /** node letters, rows bottom→top, left→right (default A, B, C, ...) */
  names?: string[]
  /** side where each level's load is applied (default: left if load > 0, else right) */
  loadSide?: ('left' | 'right')[]
}

export function gridNames(g: GridFrame): string[][] {
  const ncol = g.xs.length
  const nlev = g.heights.length + 1
  const out: string[][] = []
  let k = 0
  for (let l = 0; l < nlev; l++) {
    const row: string[] = []
    for (let j = 0; j < ncol; j++) row.push(g.names?.[k] ?? letter(k)), k++
    out.push(row)
  }
  return out
}

function letter(k: number) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return k < 26 ? A[k] : A[Math.floor(k / 26) - 1] + A[k % 26]
}

export interface ApproxColumn {
  storey: number
  col: number
  name: string // e.g. 'AE'
  h: number
  shear: number // magnitude, same sense as storey shear
  mTop: number // magnitude at top
  mBot: number // magnitude at bottom
  axial: number // tension +
  share?: number // portal: portion of storey shear
  dist?: number // cantilever: distance from centroid
  area?: number
}

export interface ApproxBeam {
  level: number // 1..m
  bay: number
  name: string
  L: number
  shear: number // magnitude
  moment: number // end moment magnitude (both ends)
  axial: number // tension +
}

export interface ApproxResult {
  method: 'portal' | 'cantilever'
  dir: 1 | -1
  storeyShear: number[]
  inflection: number[] // height above storey bottom of column inflection point
  columns: ApproxColumn[][] // [storey][col]
  beams: ApproxBeam[][] // [level-1][bay]
  overturning?: { storey: number; z: number; M: number; xbar: number; sumAd2: number }[]
  diagrams: DiagramMember[]
  names: string[][]
  levelsY: number[]
}

function levelY(g: GridFrame) {
  const y = [0]
  for (const h of g.heights) y.push(y[y.length - 1] + h)
  return y
}

function storeyShears(g: GridFrame) {
  const m = g.heights.length
  const V: number[] = []
  for (let s = 0; s < m; s++) {
    let sum = 0
    for (let k = s; k < m; k++) sum += g.loads[k] ?? 0
    V.push(sum)
  }
  return V
}

function inflections(g: GridFrame) {
  return g.heights.map((h, s) => (s === 0 && g.base === 'pinned' ? 0 : h / 2))
}

export function portalMethod(g: GridFrame): ApproxResult {
  const ncol = g.xs.length
  const nb = ncol - 1
  const m = g.heights.length
  const names = gridNames(g)
  const Vs = storeyShears(g)
  const total = Vs[0]
  const dir: 1 | -1 = total >= 0 ? 1 : -1
  const absV = Vs.map((v) => Math.abs(v))
  const z0 = inflections(g)
  const cols: ApproxColumn[][] = []
  for (let s = 0; s < m; s++) {
    const row: ApproxColumn[] = []
    for (let j = 0; j < ncol; j++) {
      const share = j === 0 || j === ncol - 1 ? 1 / (2 * nb) : 1 / nb
      const shear = absV[s] * share
      const h = g.heights[s]
      row.push({
        storey: s,
        col: j,
        name: names[s][j] + names[s + 1][j],
        h,
        shear,
        share,
        mTop: shear * (h - z0[s]),
        mBot: shear * z0[s],
        axial: 0,
      })
    }
    cols.push(row)
  }
  const beams = beamsFromColumns(g, cols, names)
  // column axial from beam shears, top down
  axialFromBeams(cols, beams, m, ncol)
  return finishApprox('portal', g, dir, absV, z0, cols, beams, names)
}

export function cantileverMethod(g: GridFrame): ApproxResult {
  const ncol = g.xs.length
  const m = g.heights.length
  const names = gridNames(g)
  const Y = levelY(g)
  const Vs = storeyShears(g)
  const dir: 1 | -1 = Vs[0] >= 0 ? 1 : -1
  const absLoads = g.loads.map((p) => p * dir)
  const z0 = inflections(g)
  const cols: ApproxColumn[][] = []
  const overturning: NonNullable<ApproxResult['overturning']> = []
  for (let s = 0; s < m; s++) {
    const A = g.areas?.[s] ?? g.areas?.[0] ?? new Array(ncol).fill(1)
    const sumA = A.reduce((a, b) => a + b, 0)
    const xbar = A.reduce((acc, a, j) => acc + a * g.xs[j], 0) / sumA
    const zc = Y[s] + z0[s]
    let M = 0
    for (let k = s; k < m; k++) M += absLoads[k] * (Y[k + 1] - zc)
    const sumAd2 = A.reduce((acc, a, j) => acc + a * (g.xs[j] - xbar) ** 2, 0)
    overturning.push({ storey: s, z: zc, M, xbar, sumAd2 })
    const row: ApproxColumn[] = []
    for (let j = 0; j < ncol; j++) {
      const d = g.xs[j] - xbar
      // load to the right: columns left of centroid in tension
      const axial = (-M * A[j] * d) / sumAd2
      row.push({ storey: s, col: j, name: names[s][j] + names[s + 1][j], h: g.heights[s], shear: 0, mTop: 0, mBot: 0, axial, dist: d, area: A[j] })
    }
    cols.push(row)
  }
  // beam shears from joint vertical equilibrium, each level left→right:
  // T_below = T_above + Vb_right - Vb_left  =>  Vb_right = T_below - T_above + Vb_left
  const beams: ApproxBeam[][] = []
  for (let l = 1; l <= m; l++) {
    const row: ApproxBeam[] = []
    let vLeft = 0
    for (let b = 0; b < ncol - 1; b++) {
      const j = b
      const below = cols[l - 1][j].axial
      const above = l < m ? cols[l][j].axial : 0
      const vRight = below - above + vLeft
      const L = g.xs[b + 1] - g.xs[b]
      row.push({ level: l, bay: b, name: names[l][b] + names[l][b + 1], L, shear: vRight, moment: (vRight * L) / 2, axial: 0 })
      vLeft = vRight
    }
    beams.push(row)
  }
  // column moments from joints, top storey down: M_colBelow_top = sum beam moments - M_colAbove_bottom
  for (let s = m - 1; s >= 0; s--) {
    const l = s + 1
    for (let j = 0; j < ncol; j++) {
      const mb = (j > 0 ? beams[l - 1][j - 1].moment : 0) + (j < ncol - 1 ? beams[l - 1][j].moment : 0)
      const above = s < m - 1 ? cols[s + 1][j].mBot : 0
      const mTop = mb - above
      const c = cols[s][j]
      const hTop = c.h - z0[s]
      c.mTop = mTop
      c.shear = hTop > 0 ? mTop / hTop : 0
      c.mBot = c.shear * z0[s]
    }
  }
  const r = finishApprox('cantilever', g, dir, Vs.map(Math.abs), z0, cols, beams, names)
  r.overturning = overturning
  return r
}

function beamsFromColumns(g: GridFrame, cols: ApproxColumn[][], names: string[][]): ApproxBeam[][] {
  const m = g.heights.length
  const ncol = g.xs.length
  const beams: ApproxBeam[][] = []
  for (let l = 1; l <= m; l++) {
    const row: ApproxBeam[] = []
    let mLeft = 0
    for (let j = 0; j < ncol - 1; j++) {
      const below = cols[l - 1][j].mTop
      const above = l < m ? cols[l][j].mBot : 0
      const mRight = below + above - mLeft
      const L = g.xs[j + 1] - g.xs[j]
      row.push({ level: l, bay: j, name: names[l][j] + names[l][j + 1], L, moment: mRight, shear: (2 * mRight) / L, axial: 0 })
      mLeft = mRight
    }
    beams.push(row)
  }
  return beams
}

function axialFromBeams(cols: ApproxColumn[][], beams: ApproxBeam[][], m: number, ncol: number) {
  for (let s = m - 1; s >= 0; s--) {
    const l = s + 1
    for (let j = 0; j < ncol; j++) {
      const above = s < m - 1 ? cols[s + 1][j].axial : 0
      const vR = j < ncol - 1 ? beams[l - 1][j].shear : 0
      const vL = j > 0 ? beams[l - 1][j - 1].shear : 0
      cols[s][j].axial = above + vR - vL
    }
  }
}

function beamAxials(g: GridFrame, cols: ApproxColumn[][], beams: ApproxBeam[][], dir: 1 | -1) {
  // signed horizontal equilibrium of each joint, left → right (tension +):
  // P_j + N_right - N_left - dir·V_below + dir·V_above = 0
  const m = g.heights.length
  const ncol = g.xs.length
  for (let l = 1; l <= m; l++) {
    const load = g.loads[l - 1] ?? 0
    const side = g.loadSide?.[l - 1] ?? (load >= 0 ? 'left' : 'right')
    const jl = side === 'left' ? 0 : ncol - 1
    let NL = 0
    for (let j = 0; j < ncol - 1; j++) {
      const Vb = cols[l - 1][j].shear
      const Va = l < m ? cols[l][j].shear : 0
      const Pj = j === jl ? load : 0
      const NR = NL + dir * (Vb - Va) - Pj
      beams[l - 1][j].axial = NR
      NL = NR
    }
  }
}

function finishApprox(
  method: 'portal' | 'cantilever',
  g: GridFrame,
  dir: 1 | -1,
  storeyShear: number[],
  z0: number[],
  cols: ApproxColumn[][],
  beams: ApproxBeam[][],
  names: string[][],
): ApproxResult {
  beamAxials(g, cols, beams, dir)
  const Y = levelY(g)
  const diagrams: DiagramMember[] = []
  for (const row of cols)
    for (const c of row) {
      const x = g.xs[c.col]
      // load to the right: column sagging-convention moment M(t) = V (t - z0), local axis upward
      diagrams.push(
        linearMember(c.name, [x, Y[c.storey]], [x, Y[c.storey + 1]], {
          N: c.axial * dir,
          V: c.shear * dir,
          Mi: -c.mBot * dir,
          Mj: c.mTop * dir,
        }),
      )
    }
  for (const row of beams)
    for (const b of row) {
      const y = Y[b.level]
      diagrams.push(
        linearMember(b.name, [g.xs[b.bay], y], [g.xs[b.bay + 1], y], {
          N: b.axial,
          V: -b.shear * dir,
          Mi: b.moment * dir,
          Mj: -b.moment * dir,
        }),
      )
    }
  // report axial with physical sign for the actual load direction
  for (const row of cols) for (const c of row) c.axial *= dir
  return { method, dir, storeyShear, inflection: z0, columns: cols, beams, diagrams, names, levelsY: Y }
}

/** Model of a grid frame (for drawing and for exact comparison). */
export function gridModel(g: GridFrame): Model {
  const names = gridNames(g)
  const Y = levelY(g)
  const nodes = names.flatMap((row, l) => row.map((n, j) => ({ id: n, x: g.xs[j], y: Y[l] })))
  const members = [] as Model['members']
  for (let s = 0; s < g.heights.length; s++)
    for (let j = 0; j < g.xs.length; j++) members.push({ id: names[s][j] + names[s + 1][j], i: names[s][j], j: names[s + 1][j], label: g.areas ? areaLabel(g.areas[s]?.[j]) : undefined })
  for (let l = 1; l < Y.length; l++)
    for (let j = 0; j < g.xs.length - 1; j++) members.push({ id: names[l][j] + names[l][j + 1], i: names[l][j], j: names[l][j + 1] })
  const supports = names[0].map((n) => ({ node: n, type: (g.base === 'pinned' ? 'pin' : 'fixed') as 'pin' | 'fixed' }))
  const loads = g.loads
    .map((p, k) => {
      const side = g.loadSide?.[k] ?? (p >= 0 ? 'left' : 'right')
      return { kind: 'node' as const, node: names[k + 1][side === 'left' ? 0 : g.xs.length - 1], fx: p }
    })
    .filter((l) => l.fx !== 0)
  return { nodes, members, supports, loads }
}

function areaLabel(a?: number) {
  if (a === undefined) return undefined
  return a === 1 ? 'A' : `${a}A`
}

// ---------------- vertical loads (0.1L inflection points) ----------------

export interface VerticalBeam {
  level: number
  bay: number
  name: string
  L: number
  w: number
  endMoment: number // hogging magnitude 0.045 wL^2
  midMoment: number // sagging 0.08 wL^2
  endShear: number // 0.5 wL
}

export function verticalApprox(g: GridFrame, w: number[][] /* [level-1][bay] */) {
  const names = gridNames(g)
  const m = g.heights.length
  const ncol = g.xs.length
  const beams: VerticalBeam[][] = []
  for (let l = 1; l <= m; l++) {
    const row: VerticalBeam[] = []
    for (let b = 0; b < ncol - 1; b++) {
      const L = g.xs[b + 1] - g.xs[b]
      const ww = w[l - 1]?.[b] ?? 0
      row.push({ level: l, bay: b, name: names[l][b] + names[l][b + 1], L, w: ww, endMoment: 0.045 * ww * L * L, midMoment: 0.08 * ww * L * L, endShear: 0.5 * ww * L })
    }
    beams.push(row)
  }
  // columns: unbalanced girder moment at each joint shared by columns above/below in proportion to 1/h
  const cols = [] as { storey: number; col: number; name: string; mTop: number; mBot: number; axial: number }[][]
  for (let s = 0; s < m; s++) cols.push(g.xs.map((_, j) => ({ storey: s, col: j, name: names[s][j] + names[s + 1][j], mTop: 0, mBot: 0, axial: 0 })))
  const joint = [] as { level: number; col: number; unbalanced: number; above: number; below: number }[]
  for (let l = 1; l <= m; l++)
    for (let j = 0; j < ncol; j++) {
      const left = j > 0 ? beams[l - 1][j - 1].endMoment : 0
      const right = j < ncol - 1 ? beams[l - 1][j].endMoment : 0
      const unb = left - right // + : left girder pulls harder (clockwise demand on joint from the left)
      const kb = 1 / g.heights[l - 1]
      const ka = l < m ? 1 / g.heights[l] : 0
      const below = (unb * kb) / (kb + ka)
      const above = (unb * ka) / (kb + ka)
      cols[l - 1][j].mTop = below
      if (l < m) cols[l][j].mBot = above
      joint.push({ level: l, col: j, unbalanced: unb, above, below })
    }
  if (g.base !== 'pinned') for (const c of cols[0]) c.mBot = c.mTop / 2
  // axial: sum of girder end shears above
  for (let s = m - 1; s >= 0; s--)
    for (let j = 0; j < ncol; j++) {
      const l = s + 1
      const v = (j > 0 ? beams[l - 1][j - 1].endShear : 0) + (j < ncol - 1 ? beams[l - 1][j].endShear : 0)
      cols[s][j].axial = -(v + (s < m - 1 ? -cols[s + 1][j].axial : 0))
    }
  return { beams, cols, joint, names }
}

// ---------------- double-diagonal (X-braced) trusses ----------------

export type XMode = 'both' | 'tension'

/**
 * pairs: crossing diagonals of each panel. 'both' = each diagonal takes half the panel shear
 * (average of all determinate choices); 'tension' = compression diagonals buckle, carry 0.
 */
export function xBraced(model: Model, pairs: [string, string][], mode: XMode) {
  const without = (removed: Set<string>): Result =>
    solve({ ...model, members: model.members.filter((m) => !removed.has(m.id)) })
  if (mode === 'tension') {
    let keep = pairs.map(() => 0)
    for (let it = 0; it < 20; it++) {
      const removed = new Set(pairs.map((p, k) => p[1 - keep[k]]))
      const r = without(removed)
      let changed = false
      keep = keep.map((kk, k) => {
        const id = pairs[k][kk]
        const N = r.member(id).N(0.1)
        if (N < -1e-9) {
          changed = true
          return 1 - kk
        }
        return kk
      })
      if (!changed) {
        const forces = new Map<string, number>()
        for (const m of model.members) forces.set(m.id, removed.has(m.id) ? 0 : r.member(m.id).N(0.1))
        return { forces, result: r, removed: [...removed] }
      }
    }
    throw new Error('tension-only iteration did not converge')
  }
  const n = pairs.length
  const forces = new Map<string, number>()
  for (const m of model.members) forces.set(m.id, 0)
  const combos = 1 << n
  for (let c = 0; c < combos; c++) {
    const removed = new Set(pairs.map((p, k) => p[(c >> k) & 1]))
    const r = without(removed)
    for (const m of model.members) if (!removed.has(m.id)) forces.set(m.id, forces.get(m.id)! + r.member(m.id).N(0.1) / combos)
  }
  return { forces, result: null, removed: [] as string[] }
}
