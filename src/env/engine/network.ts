// Water distribution networks as Snigdha ma'am teaches them (CE 331 L5): dead-end (branched) design, Hardy Cross for loops,
// service-reservoir storage, and the economic dimensions of an elevated tank (older papers).
// Core units are SI inside (m, m³/s, m/s); helpers convert from the class's lph / lps / cusec / gpm, ft, fps and psi.

export const PI = Math.PI
export const FT = 0.3048
export const INCH = 0.0254
export const G = 9.81
/** psi per ft of water: 62.4 lb/ft³ / 144 (she also writes 1 psi = 2.31 ft) */
export const PSI_PER_FT = 62.4 / 144
export const ftToM = (ft: number) => ft * FT
export const mToFt = (m: number) => m / FT
export const lphToM3s = (lph: number) => lph / 1000 / 3600
export const lpsToM3s = (lps: number) => lps / 1000
export const cfsToM3s = (cfs: number) => cfs * FT ** 3
export const m3sToCfs = (q: number) => q / FT ** 3
export const gpmToM3s = (gpm: number) => gpm * 0.00378541 / 60
export const m3sToLps = (q: number) => q * 1000
export const fpsToMs = (fps: number) => fps * FT
export const mHeadToPsi = (m: number) => mToFt(m) * PSI_PER_FT
export const psiToFtHead = (psi: number) => psi / PSI_PER_FT

/** design flow of a node: average demand x peak factor x (1 + losses and wastage) */
export function designDemand(avg: number, peakFactor = 1, losses = 0) {
  return avg * peakFactor * (1 + losses)
}

// ------------------------------------------------------------------ branched (dead-end) network
export const COMMERCIAL_IN = [2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 36, 42, 48]

export interface TreePipe {
  id: string
  from: string
  to: string
  /** metres */
  L: number
}
export interface TreeInput {
  pipes: TreePipe[]
  /** design demand at each node, m³/s (after the peak factor and losses) */
  demand: Record<string, number>
  root: string
  /** design velocity, m/s (the class fixes 1 m/s = 3 fps) */
  V?: number
  /** Fanning friction factor (0.01) */
  f?: number
  /** smallest pipe, inch (BNBC distribution main 4 in) */
  Dmin?: number
  /** how the calculated diameter is rounded up: to the commercial list, or to the next whole inch */
  rounding?: 'commercial' | 'inch'
  sizes?: number[]
  /** h_f from the velocity in the adopted pipe (Q/A), or from the design velocity (her handwritten solution) */
  hfVelocity?: 'actual' | 'design'
  /** pressure at the reservoir / start node, psi */
  startPsi: number
  /** required terminal pressure, psi */
  minPsi: number
  /** node elevations, ft above the root (optional; adds the static change to the pressure) */
  elev?: Record<string, number>
  /** raise the size of the pipe that loses most on a failing path until all terminals pass */
  autoEnlarge?: boolean
  /** overrides: adopt this size (inch) for a pipe */
  force?: Record<string, number>
}
export interface TreePipeResult {
  id: string
  from: string
  to: string
  Lm: number
  Lft: number
  /** flow, m³/s */
  Q: number
  Qlps: number
  Qlph: number
  Qcfs: number
  Dcalc: number
  DcalcIn: number
  rule: 'calc' | 'min' | 'forced'
  Din: number
  Dm: number
  v: number
  vfps: number
  hfM: number
  hfFt: number
  hfPsi: number
  /** pressure at the downstream end, psi */
  pEnd: number
}
export interface TreeResult {
  pipes: TreePipeResult[]
  pressure: Record<string, number>
  /** terminal nodes (no pipe leaves them) and whether they meet the requirement */
  terminals: { node: string; path: string[]; sumHfPsi: number; p: number; ok: boolean }[]
  ok: boolean
  /** pipes enlarged by the auto step, in order */
  enlarged: { id: string; from: number; to: number }[]
  startPsi: number
  minPsi: number
}

export function nextSize(inch: number, sizes: number[], rounding: 'commercial' | 'inch' = 'commercial') {
  if (rounding === 'inch') return Math.ceil(inch - 1e-9)
  const s = [...sizes].sort((a, b) => a - b)
  return s.find((x) => x >= inch - 1e-9) ?? Math.ceil(inch)
}

export function designTree(inp: TreeInput): TreeResult {
  const V = inp.V ?? 1
  const f = inp.f ?? 0.01
  const Dmin = inp.Dmin ?? 4
  const sizes = inp.sizes ?? COMMERCIAL_IN
  const rounding = inp.rounding ?? 'commercial'
  const mode = inp.hfVelocity ?? 'actual'
  const kids: Record<string, TreePipe[]> = {}
  for (const p of inp.pipes) (kids[p.from] ??= []).push(p)
  const flow: Record<string, number> = {}
  const down = (id: string, node: string): number => {
    // flow in the pipe entering `node` = demand there + flows of the pipes leaving it
    const q = (inp.demand[node] ?? 0) + (kids[node] ?? []).reduce((s, p) => s + down(p.id, p.to), 0)
    flow[id] = q
    return q
  }
  for (const p of kids[inp.root] ?? []) down(p.id, p.to)

  const size: Record<string, number> = {}
  const rule: Record<string, 'calc' | 'min' | 'forced'> = {}
  const dcalc: Record<string, number> = {}
  for (const p of inp.pipes) {
    const Dc = Math.sqrt((4 * flow[p.id]) / (PI * V))
    dcalc[p.id] = Dc
    const inch = Dc / INCH
    if (inp.force?.[p.id] !== undefined) {
      size[p.id] = inp.force[p.id]
      rule[p.id] = 'forced'
    } else if (inch < Dmin) {
      size[p.id] = Dmin
      rule[p.id] = 'min'
    } else {
      size[p.id] = nextSize(inch, sizes, rounding)
      rule[p.id] = 'calc'
    }
  }

  const enlarged: TreeResult['enlarged'] = []
  const build = (): TreeResult => {
    const pr: Record<string, number> = { [inp.root]: inp.startPsi }
    const out: TreePipeResult[] = []
    const walk = (node: string) => {
      for (const p of kids[node] ?? []) {
        const Dm = size[p.id] * INCH
        const A = (PI * Dm * Dm) / 4
        const v = flow[p.id] / A
        const vh = mode === 'design' ? V : v
        const hfM = (4 * f * vh * vh * p.L) / (2 * G * Dm)
        const hfFt = mToFt(hfM)
        const hfPsi = hfFt * PSI_PER_FT
        const dz = inp.elev ? (inp.elev[p.to] ?? 0) - (inp.elev[p.from] ?? 0) : 0
        pr[p.to] = pr[p.from] - hfPsi - dz * PSI_PER_FT
        out.push({
          id: p.id, from: p.from, to: p.to, Lm: p.L, Lft: mToFt(p.L), Q: flow[p.id], Qlps: flow[p.id] * 1000, Qlph: flow[p.id] * 3.6e6, Qcfs: m3sToCfs(flow[p.id]),
          Dcalc: dcalc[p.id], DcalcIn: dcalc[p.id] / INCH, rule: rule[p.id], Din: size[p.id], Dm, v, vfps: v / FT, hfM, hfFt, hfPsi, pEnd: pr[p.to],
        })
        walk(p.to)
      }
    }
    walk(inp.root)
    const parent: Record<string, TreePipe> = {}
    for (const p of inp.pipes) parent[p.to] = p
    const terminals: TreeResult['terminals'] = []
    for (const p of inp.pipes) {
      if ((kids[p.to] ?? []).length) continue
      const path: string[] = []
      let n = p.to
      while (n !== inp.root) {
        path.unshift(n)
        n = parent[n].from
      }
      path.unshift(inp.root)
      terminals.push({ node: p.to, path, sumHfPsi: inp.startPsi - pr[p.to], p: pr[p.to], ok: pr[p.to] >= inp.minPsi - 1e-9 })
    }
    return { pipes: out, pressure: pr, terminals, ok: terminals.every((t) => t.ok), enlarged, startPsi: inp.startPsi, minPsi: inp.minPsi }
  }

  let res = build()
  if (inp.autoEnlarge) {
    for (let guard = 0; guard < 60 && !res.ok; guard++) {
      const failing = res.terminals.filter((t) => !t.ok)
      const ids = new Set<string>()
      for (const t of failing) for (let i = 1; i < t.path.length; i++) ids.add(parent2(inp.pipes, t.path[i]).id)
      const cand = res.pipes.filter((p) => ids.has(p.id)).sort((a, b) => b.hfPsi - a.hfPsi)[0]
      if (!cand) break
      const s = [...sizes].sort((a, b) => a - b)
      const nxt = rounding === 'inch' ? size[cand.id] + 1 : (s.find((x) => x > size[cand.id]) ?? size[cand.id] + 2)
      enlarged.push({ id: cand.id, from: size[cand.id], to: nxt })
      size[cand.id] = nxt
      res = build()
    }
  }
  return res
}
const parent2 = (pipes: TreePipe[], node: string) => pipes.find((p) => p.to === node)!

/** path of node ids from the root to `node` with the pressure at each (for a chart) */
export function pressureProfile(res: TreeResult, node: string) {
  const t = res.terminals.find((x) => x.node === node) ?? res.terminals[0]
  let dist = 0
  const pts = [{ node: t.path[0], dist: 0, p: res.startPsi }]
  for (let i = 1; i < t.path.length; i++) {
    const pp = res.pipes.find((q) => q.to === t.path[i])!
    dist += pp.Lft
    pts.push({ node: t.path[i], dist, p: pp.pEnd })
  }
  return pts
}

// ------------------------------------------------------------------ Hardy Cross
export interface HcPipe {
  id: string
  from: string
  to: string
  /** assumed flow, lps, positive from -> to */
  Q0: number
  /** length m, diameter mm, C (when the law needs them) */
  L?: number
  D?: number
  C?: number
  /** k of H = k Q^x directly (the class sets k = 1) */
  k?: number
}
export interface HcLoop {
  id: string
  /** pipes in the clockwise traversal; dir = +1 if the traversal runs from -> to, -1 if against */
  pipes: { id: string; dir: 1 | -1 }[]
}
export type HcLaw =
  | { kind: 'k'; x?: number }
  /** h/L = coef x Q^1.85 x D^-4.87, Q in lps, D in mm, result m/m  (2012-13: coef 1.59e6) */
  | { kind: 'hw-lps-mm'; coef: number }
  /** Hazen-Williams SI: H = 10.67 L Q^1.85 / (C^1.85 D^4.87), Q in m³/s, D in m (flows still entered in lps) */
  | { kind: 'hw-si'; C?: number }

export const hcExponent = (law: HcLaw) => (law.kind === 'k' ? (law.x ?? 1.85) : 1.85)
export function hcK(p: HcPipe, law: HcLaw): number {
  if (law.kind === 'k') return p.k ?? 1
  if (law.kind === 'hw-lps-mm') return law.coef * (p.D as number) ** -4.87 * (p.L as number)
  const C = p.C ?? law.C ?? 130
  return ((10.67 * (p.L as number)) / (C ** 1.85 * ((p.D as number) / 1000) ** 4.87)) * 1e-3 ** 1.85
}

export interface HcRow {
  pipe: string
  /** flow in the direction of travel round the loop, lps */
  q: number
  /** head loss with sign (positive when the traversal and the flow agree), m */
  H: number
  /** |H/q| */
  Hq: number
}
export interface HcIter {
  n: number
  /** flows (pipe orientation) at the start of the iteration */
  start: Record<string, number>
  loops: { id: string; rows: HcRow[]; sumH: number; sumHq: number; delta: number }[]
  /** correction applied to each pipe (sum over the loops that contain it) */
  pipeDelta: Record<string, number>
  end: Record<string, number>
  maxDelta: number
}
export interface HcResult {
  iters: HcIter[]
  flows: Record<string, number>
  /** head loss with the final flows (signed along from -> to), m */
  headLoss: Record<string, number>
  converged: boolean
}

/** Hardy Cross, all loops corrected at the same time each trial (as in her steps file) */
export function hardyCross(pipes: HcPipe[], loops: HcLoop[], law: HcLaw, opts: { iterations?: number; tol?: number } = {}): HcResult {
  const x = hcExponent(law)
  const k: Record<string, number> = {}
  for (const p of pipes) k[p.id] = hcK(p, law)
  let Q: Record<string, number> = {}
  for (const p of pipes) Q[p.id] = p.Q0
  const iters: HcIter[] = []
  const maxIt = opts.iterations ?? 50
  const tol = opts.tol ?? 0.01
  let converged = false
  for (let n = 1; n <= maxIt; n++) {
    const start = { ...Q }
    const pd: Record<string, number> = {}
    const lr: HcIter['loops'] = []
    for (const lp of loops) {
      const rows: HcRow[] = lp.pipes.map(({ id, dir }) => {
        const q = dir * Q[id]
        const H = k[id] * Math.abs(q) ** x * Math.sign(q)
        return { pipe: id, q, H, Hq: q === 0 ? 0 : Math.abs(H / q) }
      })
      const sumH = rows.reduce((s, r) => s + r.H, 0)
      const sumHq = rows.reduce((s, r) => s + r.Hq, 0)
      const delta = -sumH / (x * sumHq)
      lr.push({ id: lp.id, rows, sumH, sumHq, delta })
      for (const { id, dir } of lp.pipes) pd[id] = (pd[id] ?? 0) + dir * delta
    }
    const end = { ...Q }
    for (const [id, d] of Object.entries(pd)) end[id] += d
    const maxDelta = Math.max(...lr.map((l) => Math.abs(l.delta)))
    iters.push({ n, start, loops: lr, pipeDelta: pd, end, maxDelta })
    Q = end
    if (maxDelta < tol) {
      converged = true
      break
    }
  }
  const headLoss: Record<string, number> = {}
  for (const p of pipes) headLoss[p.id] = k[p.id] * Math.abs(Q[p.id]) ** x * Math.sign(Q[p.id])
  return { iters, flows: Q, headLoss, converged }
}

/** continuity check of a flow set: net outflow at each node (lps) minus the external demand there */
export function nodeBalance(pipes: HcPipe[], flows: Record<string, number>, external: Record<string, number>) {
  const out: Record<string, number> = {}
  for (const p of pipes) {
    out[p.from] = (out[p.from] ?? 0) + flows[p.id]
    out[p.to] = (out[p.to] ?? 0) - flows[p.id]
  }
  const nodes = new Set([...Object.keys(out), ...Object.keys(external)])
  const res: Record<string, number> = {}
  for (const n of nodes) res[n] = (out[n] ?? 0) - (external[n] ?? 0)
  return res
}

/** the head-loss-chart sizes (mm) of her Hardy Cross chart */
export const CHART_MM = [12, 18, 25, 38, 50, 62, 75, 100, 150, 200, 300, 450, 600, 750, 900, 1200, 1500]
/** D = [10.67 Q^1.85 / (C^1.85 S)]^(1/4.87) in mm, Q in lps, S head loss per metre (0.005 in her steps file) */
export function hwDiameterMm(Qlps: number, S = 0.005, C = 130) {
  const q = Qlps / 1000
  return ((10.67 * q ** 1.85) / (C ** 1.85 * S)) ** (1 / 4.87) * 1000
}
/** H = 10.67 L Q^1.85 / (C^1.85 D^4.87), metres (Q lps, D mm, L m) */
export function hwHeadLoss(Qlps: number, Dmm: number, L: number, C = 130) {
  return (10.67 * L * (Qlps / 1000) ** 1.85) / (C ** 1.85 * (Dmm / 1000) ** 4.87)
}
export const nextChartMm = (d: number, sizes = CHART_MM) => sizes.find((s) => s >= d - 1e-9) ?? Math.ceil(d)

export interface LoopSizing {
  pipe: string
  L: number
  Qlps: number
  Dreq: number
  Dadopt: number
  v: number
  H: number
}
/** pipe sizes of a solved loop network (flows from Hardy Cross), Hazen-Williams C, S = 0.005 m/m */
export function sizeLoopPipes(pipes: HcPipe[], flows: Record<string, number>, S = 0.005, C = 130): LoopSizing[] {
  return pipes.map((p) => {
    const q = Math.abs(flows[p.id])
    const Dreq = hwDiameterMm(q, S, C)
    const Dadopt = nextChartMm(Dreq)
    const A = (PI * (Dadopt / 1000) ** 2) / 4
    return { pipe: p.id, L: p.L ?? 0, Qlps: q, Dreq, Dadopt, v: q / 1000 / A, H: hwHeadLoss(q, Dadopt, p.L ?? 0, C) }
  })
}

// ------------------------------------------------------------------ service reservoir
export interface StorageResult {
  hours: { demand: number; supply: number; storage: number }[]
  max: number
  maxAt: number
}
/** cumulative storage = previous + supply - demand (start empty); the balancing storage is its maximum */
export function balancingStorage(demand: number[], supply: number[]): StorageResult {
  let s = 0
  const hours = demand.map((d, i) => {
    s += supply[i] - d
    return { demand: d, supply: supply[i], storage: s }
  })
  const max = Math.max(...hours.map((h) => h.storage))
  return { hours, max, maxAt: hours.findIndex((h) => h.storage === max) }
}
export function reservoirSize(opts: { daily: number; balancing: number; emergencyFactor?: number }) {
  const avgHourly = opts.daily / 24
  const emergency = (opts.emergencyFactor ?? 1.5) * avgHourly
  return { avgHourly, emergency, total: opts.balancing + emergency }
}
export const pumpHours = (daily: number, pumpLph: number) => daily / pumpLph

// ------------------------------------------------------------------ economic dimensions of a cylindrical tank (older papers)
export const US_GAL_FT3 = 0.133681
export const IMP_GAL_FT3 = 0.160544
/**
 * Cheapest open-top cylinder of volume V (floor cost cF per area, wall cost cW per area):
 * C = cF (πD²/4) + cW π D H with V = πD²H/4  ->  dC/dD = 0  ->  D³ = 8 cW V / (π cF), H = 4V/(πD²).
 */
export function economicTank(V: number, cF: number, cW: number) {
  const D = ((8 * cW * V) / (PI * cF)) ** (1 / 3)
  const H = (4 * V) / (PI * D * D)
  const floor = (PI * D * D) / 4
  const wall = PI * D * H
  return { V, D, H, floorArea: floor, wallArea: wall, floorCost: cF * floor, wallCost: cW * wall, cost: cF * floor + cW * wall, ratio: H / D }
}
