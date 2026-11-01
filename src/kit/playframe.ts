// Lateral-load playground: a building frame analysed by the portal / cantilever method and by the
// stiffness solver, side by side, so the assumptions can be judged.

import { cantileverMethod, gridModel, portalMethod, type ApproxResult, type GridFrame } from '../engine/approx'
import { diagramsFromResult } from '../engine/diagrams'
import { solve, type Result } from '../engine/frame2d'
import { DEFAULT_EI, type Model } from '../engine/model'

export interface PlayFrame {
  xs: number[]
  heights: number[]
  /** lateral load at each floor level, bottom first (+ = to the right) */
  loads: number[]
  base: 'fixed' | 'pinned'
  /** relative column areas per column line (same in every storey) */
  areas: number[]
  /** beam EI / column EI */
  beamStiff: number
}

export const gridOf = (f: PlayFrame): GridFrame => ({ xs: f.xs, heights: f.heights, loads: f.loads, base: f.base, areas: f.heights.map(() => f.areas) })

/** A/I of a ~12″×12″ column in ft⁻² — keeps axial shortening realistic in the exact solve */
const A_OVER_I = 12

export function exactModel(f: PlayFrame): Model {
  const m = gridModel(gridOf(f))
  const g = gridOf(f)
  const names = m.nodes.map((n) => n.id)
  const ncol = g.xs.length
  const colLine = (id: string) => names.indexOf(id) % ncol
  for (const mem of m.members) {
    const a = m.nodes.find((n) => n.id === mem.i)!
    const b = m.nodes.find((n) => n.id === mem.j)!
    const isCol = Math.abs(a.x - b.x) < 1e-9
    if (isCol) {
      const area = f.areas[colLine(mem.i)] ?? 1
      mem.EI = DEFAULT_EI * area
      mem.EA = DEFAULT_EI * area * A_OVER_I
    } else {
      mem.EI = DEFAULT_EI * f.beamStiff
      mem.EA = DEFAULT_EI * A_OVER_I * 4
    }
  }
  return m
}

export interface ColCompare {
  name: string
  storey: number
  col: number
  h: number
  approx: { V: number; Mtop: number; Mbot: number; N: number }
  exact: { V: number; Mtop: number; Mbot: number; N: number; z: number | null }
  /** assumed inflection height */
  z0: number
}
export interface BeamCompare {
  name: string
  approx: { V: number; M: number }
  exact: { V: number; M: number }
}

export function analyseFrame(f: PlayFrame, method: 'portal' | 'cantilever') {
  const g = gridOf(f)
  const approx: ApproxResult = method === 'portal' ? portalMethod(g) : cantileverMethod(g)
  const model = exactModel(f)
  const r: Result = solve(model)
  const dir = approx.dir
  const cols: ColCompare[] = []
  for (const row of approx.columns)
    for (const c of row) {
      const mr = r.member(c.name)
      const Mb = mr.M(0, 1)
      const Mt = mr.M(c.h, -1)
      // linear moment: zero crossing inside the column = exact inflection point
      const z = Mb * Mt < 0 ? (Mb / (Mb - Mt)) * c.h : Math.abs(Mb) < 1e-9 ? 0 : Math.abs(Mt) < 1e-9 ? c.h : null
      cols.push({
        name: c.name,
        storey: c.storey,
        col: c.col,
        h: c.h,
        approx: { V: c.shear, Mtop: c.mTop, Mbot: c.mBot, N: c.axial },
        exact: { V: mr.V(c.h / 2) * dir, Mtop: Math.abs(Mt), Mbot: Math.abs(Mb), N: mr.N(c.h / 2), z },
        z0: approx.inflection[c.storey],
      })
    }
  const beams: BeamCompare[] = []
  for (const row of approx.beams)
    for (const b of row) {
      const mr = r.member(b.name)
      beams.push({ name: b.name, approx: { V: Math.abs(b.shear), M: Math.abs(b.moment) }, exact: { V: Math.abs(mr.V(b.L / 2)), M: Math.max(Math.abs(mr.M(0, 1)), Math.abs(mr.M(b.L, -1))) } })
    }
  return { grid: g, approx, model, exact: r, exactDiagrams: diagramsFromResult(model, r), cols, beams }
}
export type FrameAnalysis = ReturnType<typeof analyseFrame>

/** % error of an approximate value against the exact one (relative to the largest exact value of its kind) */
export function pctErr(approx: number, exact: number, scale: number) {
  return scale < 1e-9 ? 0 : (100 * (approx - exact)) / scale
}
