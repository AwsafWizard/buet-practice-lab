// Random full two-way slab design problems for the Lab tab, as the papers ask them: a floor plan with
// several panels on stiff beams (or brick walls); the student designs panel S1 (corner / edge / interior).
// Case from the neighbours, then every number from the twoway engine.

import { pick, randInt, rng } from '../../../labs/common'
import { twoWay, type Edges, type SlabCase, type TwoWayInput, type TwoWayResult } from '../../engine/twoway'
import { djb2, ftIn, type DesignBase, type Diff, type DStep, type GridFig } from '../oneway/design'

export type Family = 'corner' | 'edge' | 'interior' | 'walls'
export const FAMILIES: { v: Family; label: string }[] = [
  { v: 'corner', label: 'Corner panel' },
  { v: 'edge', label: 'Edge panel' },
  { v: 'interior', label: 'Interior panel' },
  { v: 'walls', label: 'Panels on brick walls' },
]

export interface TwoWayProblem extends DesignBase {
  input: TwoWayInput
  r: TwoWayResult
  fig: GridFig
}

const ksi = (v: number) => `${v / 1000} ksi`

interface Layout {
  cols: number[]
  rows: number[]
  mask?: boolean[][]
  target: [number, number]
}

function layout(r: () => number, family: Family, tricky: boolean): Layout {
  const la = randInt(r, 16, 22)
  const lb = la + randInt(r, 2, 8)
  const land = r() < 0.5
  const X = land ? lb : la
  const Y = land ? la : lb
  const vary = (v: number) => (tricky && r() < 0.5 ? v + pick(r, [-2, 2, 3]) : v)
  if (family === 'walls') {
    if (r() < 0.5) {
      // L-shaped group of three panels (2014-15)
      const mask = [
        [true, false],
        [true, true],
      ]
      const t = pick(r, [
        [0, 1],
        [0, 0],
        [1, 1],
      ] as [number, number][])
      return { cols: [X, X], rows: [Y, Y], mask, target: t }
    }
    return { cols: [X, X], rows: [Y, Y], target: [pick(r, [0, 1]), pick(r, [0, 1])] }
  }
  if (family === 'interior') {
    const cols = [X, vary(X), X]
    const rows = [Y, Y, Y]
    return { cols, rows, target: [1, 1] }
  }
  if (family === 'edge') {
    const nx = pick(r, [3, 3, 4])
    const ny = pick(r, [2, 3])
    const cols = Array.from({ length: nx }, (_, i) => (i === 1 ? vary(X) : X))
    const rows = Array(ny).fill(Y)
    return { cols, rows, target: [1, pick(r, [0, ny - 1])] }
  }
  const nx = pick(r, [2, 3, 3])
  const ny = pick(r, [2, 2, 3])
  const cols = Array.from({ length: nx }, (_, i) => (i === 0 || i === nx - 1 ? vary(X) : X))
  const rows = Array(ny).fill(Y)
  return { cols, rows, target: [pick(r, [0, nx - 1]), pick(r, [0, ny - 1])] }
}

const G = { cls: 'Step 1 — classify', h: 'Step 2 — thickness & load', m: 'Step 3 — moments (Tables 12.3–12.5)', as: 'Step 4 — depth & steel', bar: 'Step 5 — bars: middle strips, column strips, corners', b: 'Step 6 — beams (Table 12.6) & shear' }
const mT = { abs: 0.03, digits: 2 }
const aT = { abs: 0.003, digits: 3 }

function steps(r: TwoWayResult, cc: boolean): DStep[] {
  const out: DStep[] = []
  if (cc) out.push({ key: 'la', group: G.cls, label: 'la = short clear span (ft)', value: r.geo.la, abs: 0.01 })
  else out.push({ key: 'ratio', group: G.cls, label: 'lb/la', value: r.geo.ratio, abs: 0.005 })
  out.push({ key: 'm', group: G.cls, label: 'm = la/lb', value: r.m, abs: 0.002, digits: 3 })
  out.push({ key: 'case', group: G.cls, label: 'Case (Tables 12.3–12.6)', options: ([1, 2, 3, 4, 5, 6, 7, 8, 9] as SlabCase[]).map((c) => ({ v: String(c), label: String(c) })), answer: String(r.case) })
  if (!r.hGiven) out.push({ key: 'hraw', group: G.h, label: 'h from ln(0.8 + fy/200 000)/(36 + 9β) (in)', value: r.th.raw, abs: 0.02 })
  out.push({ key: 'h', group: G.h, label: 'h used (in)', value: r.h })
  out.push({ key: 'wu', group: G.h, label: 'wu (psf)', value: r.loads.wu, abs: 0.6 })
  if (r.M.aNeg !== null) out.push({ key: 'an', group: G.m, label: 'Ma,neg at the continuous long edge(s) (k-ft/ft)', value: r.M.aNeg, ...mT })
  if (r.M.bNeg !== null) out.push({ key: 'bn', group: G.m, label: 'Mb,neg at the continuous short edge(s) (k-ft/ft)', value: r.M.bNeg, ...mT })
  out.push({ key: 'ap', group: G.m, label: 'Ma,pos = DL part + LL part (k-ft/ft)', value: r.M.aPos, ...mT })
  out.push({ key: 'bp', group: G.m, label: 'Mb,pos (k-ft/ft)', value: r.M.bPos, ...mT })
  if (r.M.aDisc !== null) out.push({ key: 'ad', group: G.m, label: 'Ma at a discontinuous long edge = ⅓ Ma,pos (k-ft/ft)', value: r.M.aDisc, ...mT })
  if (r.M.bDisc !== null) out.push({ key: 'bd', group: G.m, label: 'Mb at a discontinuous short edge (k-ft/ft)', value: r.M.bDisc, ...mT })
  out.push({ key: 'dreq', group: G.as, label: 'd required for ρ0.005 (in)', value: r.depth.dreq, abs: 0.03 })
  out.push({ key: 'asmin', group: G.as, label: 'As,min (in²/ft)', value: r.AsMin, ...aT })
  out.push({ key: 'asa', group: G.as, label: 'As, short direction midspan (in²/ft)', value: r.st.aPos.as.As, ...aT })
  out.push({ key: 'asb', group: G.as, label: `As, long direction midspan (d = ${r.d.long} in) (in²/ft)`, value: r.st.bPos.as.As, ...aT })
  if (r.st.aNeg) out.push({ key: 'asan', group: G.as, label: 'As, short direction at the continuous edge (in²/ft)', value: r.st.aNeg.as.As, ...aT })
  if (r.st.bNeg) out.push({ key: 'asbn', group: G.as, label: 'As, long direction at the continuous edge (in²/ft)', value: r.st.bNeg.as.As, ...aT })
  out.push({ key: 'sa', group: G.bar, label: `middle strip, short-way bottom bars #${r.bar} spacing (in)`, value: r.midA.s })
  out.push({ key: 'sb', group: G.bar, label: 'middle strip, long-way bottom bars spacing (in)', value: r.midB.s })
  if (r.extra.aNeg) out.push({ key: 'xa', group: G.bar, label: 'extra top bars per 2s, short dir at the continuous edge', value: r.extra.aNeg.n })
  if (r.extra.bNeg) out.push({ key: 'xb', group: G.bar, label: 'extra top bars per 2s, long dir at the continuous edge', value: r.extra.bNeg.n })
  out.push({ key: 'ca', group: G.bar, label: 'column strip spacing, short-way bars (in)', value: r.col.a.s })
  out.push({ key: 'cb', group: G.bar, label: 'column strip spacing, long-way bars (in)', value: r.col.b.s })
  if (r.corner.corners.length) {
    out.push({ key: 'cz', group: G.bar, label: 'corner reinforcement zone, each way (ft)', value: r.corner.zone, abs: 0.02 })
    out.push({ key: 'cs', group: G.bar, label: 'corner bars spacing, top & bottom (in)', value: r.corner.sp.s })
  }
  out.push({ key: 'wa', group: G.b, label: 'Wa (Table 12.6)', value: r.beams.Wa, abs: 0.004, digits: 3 })
  out.push({ key: 'wl', group: G.b, label: 'load on each long beam (k/ft)', value: r.beams.wLongBeam, abs: 0.03 })
  out.push({ key: 'ws', group: G.b, label: 'load on each short beam (k/ft)', value: r.beams.wShortBeam, abs: 0.03 })
  out.push({ key: 'vc', group: G.b, label: 'φVc of the slab (k/ft)', value: r.shear.phiVc, abs: 0.03 })
  return out
}

export function makeTwoWay(seed: number, only: Family | undefined, diff: Diff): TwoWayProblem {
  const r = rng(seed * 7919 + 211)
  const tricky = diff === 'tricky'
  const family = only ?? pick(r, ['corner', 'corner', 'edge', 'interior', 'walls'] as Family[])
  const L = layout(r, family, tricky)
  const [ti, tj] = L.target
  const has = (i: number, j: number) => i >= 0 && j >= 0 && i < L.cols.length && j < L.rows.length && (L.mask ? L.mask[j][i] : true)
  const edges: Edges = { top: has(ti, tj - 1), bottom: has(ti, tj + 1), left: has(ti - 1, tj), right: has(ti + 1, tj) }
  const walls = family === 'walls'
  // beams: tricky → c/c of bw-wide beams; paper → clear dims; walls: clear between 10 in walls
  const bw = !walls && tricky ? pick(r, [12, 15, 18, 24]) : 0
  const ll = pick(r, [40, 60, 80, 100])
  const ff = pick(r, [25, 30, 35, 40])
  const pw = pick(r, [0, 40, 50, 60])
  const fc = pick(r, [3000, 3000, 3500, 4000])
  const fy = tricky ? pick(r, [60000, 40000, 50000]) : 60000
  const h = walls && !tricky && r() < 0.4 ? 6 : undefined
  const X = L.cols[ti]
  const Y = L.rows[tj]
  let input: TwoWayInput = { lx: X - bw / 12, ly: Y - bw / 12, edges, ll, ff, pw, fc, fy, h, bar: 3 }
  let res = twoWay(input)
  // the class uses #3 unless that needs s below ≈ 4.5 in
  for (const bar of [4, 5]) {
    if (Math.min(res.midA.s, res.midB.s) >= 4.5) break
    input = { ...input, bar }
    res = twoWay(input)
  }
  const n = L.mask ? L.mask.flat().filter(Boolean).length : L.cols.length * L.rows.length
  const dimTxt = (v: number) => (bw ? `${v}′-0″` : `${v}′-0″`)
  const sup = walls ? '10 in brick walls (all panel dimensions are clear)' : bw ? `stiff beams ${bw} in wide (αm > 2); dimensions are centre-to-centre of beams` : 'stiff beams (αm > 2); panel dimensions are clear spans'
  const text = `Fig. 1 shows the plan of a ${walls ? 'roof' : 'floor'} slab of ${n} panels supported on ${sup}. Design panel **S1** (${ftIn(X)} × ${ftIn(Y)}${bw ? ' c/c' : ''}) by the **moment coefficient method** (Tables 12.3–12.6). ${h ? `Slab thickness = ${h} in. ` : ''}Service LL = ${ll} psf, floor finish = ${ff} psf${pw ? `, partition wall = ${pw} psf` : ''} + self-weight. f'c = ${ksi(fc)}, fy = ${ksi(fy)}. Show all reinforcement (middle strips, column strips, corner steel) in neat sketches and find the load on the supporting beams.`
  const fig: GridFig = {
    cols: L.cols,
    rows: L.rows,
    mask: L.mask,
    support: walls ? 'wall' : 'beam',
    tb: true,
    colTxt: L.cols.map(dimTxt),
    rowTxt: L.rows.map(dimTxt),
    target: L.target,
    labels: { [`${ti},${tj}`]: 'S1' },
    note: walls ? 'hatched = 10 in brick walls' : 'dashed = beams below the slab · panel beyond the outer beams: none',
  }
  const title = family === 'walls' ? 'Panel on brick walls' : family === 'corner' ? 'Corner panel of a floor' : family === 'edge' ? 'Edge panel of a floor' : 'Interior panel of a floor'
  return { family, title, text, input, r: res, fig, hash: djb2(JSON.stringify(['tw', family, input])), steps: steps(res, bw > 0) }
}
