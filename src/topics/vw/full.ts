// Random full virtual-work problems for the VW lab. Geometry, loads, section data and the asked
// displacement come from a seed (exam-style families: stepped beams, frames, trusses with
// fabrication / temperature errors, support settlement, columns with axial + shear + bending);
// every answer and intermediate check comes from the virtualWork engine.
// Units: ft, kip, E = 29000 ksi → EI in k-ft² (I/144), EA and GA in kip; deflections × 12 → in.

import { solve } from '../../engine/frame2d'
import type { Load, Model } from '../../engine/model'
import { rot, rotK, rotPos, rotTag } from '../../engine/sign'
import { virtualWork, type VWOptions } from '../../engine/vw'
import { beamOf, H, model, P, W } from '../../kit/builders'
import { pick, randInt, rng } from '../../labs/common'
import { buildTruss, type TrussType } from '../../labs/trusses'

export const E = 29000
const EIof = (I: number) => (E * I) / 144

export type Family = 'beam' | 'frame' | 'truss' | 'settle' | 'column'
export const FAMILIES: { v: Family; label: string }[] = [
  { v: 'beam', label: 'Stepped beams' },
  { v: 'frame', label: 'Frames' },
  { v: 'truss', label: 'Trusses' },
  { v: 'settle', label: 'Support settlement' },
  { v: 'column', label: 'Axial + shear + bending' },
]

export interface FullStep {
  key: string
  label: string
  value: number
  unit: string
  /** rotations are small — they need more digits and a tighter absolute floor */
  small?: boolean
}

export interface FullProblem {
  family: Family
  title: string
  /** markdown problem statement */
  text: string
  m: Model
  /** member labels on the figure (I ratios, areas in brackets) */
  labels: Record<string, string>
  virtual: Load[]
  opts: VWOptions
  unit: 'in' | 'rad'
  /** what is asked, with its sign convention */
  what: string
  /** checks in working order; the last one is the answer */
  steps: FullStep[]
  /** how the unit load / pair / couple is placed — one line for the solution */
  virtualNote: string
}

type Query = { what: string; virtual: Load[]; unit: 'in' | 'rad'; ask: string; note: string }
const down = (n: string): Query => ({ what: `Δ_${n} (+ = down)`, virtual: [{ kind: 'node', node: n, fy: -1 }], unit: 'in', ask: `the vertical deflection of **${n}**`, note: `unit load 1 k ↓ at ${n}` })
const right = (n: string): Query => ({ what: `Δ_${n} (+ = →)`, virtual: [H(n, 1)], unit: 'in', ask: `the horizontal deflection of **${n}**`, note: `unit load 1 k → at ${n}` })
const turn = (n: string): Query => ({ what: `θ_${n} (${rotTag()})`, virtual: [{ kind: 'node', node: n, m: rotK() }], unit: 'rad', ask: `the rotation (slope) at **${n}**`, note: `unit couple 1 k-ft ${rotPos()} at ${n}` })

const fmtI = (k: number) => (k === 1 ? 'I' : `${k}I`)
const kips = (x: number) => `${x} k`

// ---------------------------------------------------------------- families
function beam(r: () => number) {
  const I = pick(r, [200, 300, 400, 500, 600])
  const variant = pick(r, ['simple', 'overhang', 'cantilever'] as const)
  if (variant === 'cantilever') {
    const a = randInt(r, 6, 12, 2),
      b = randInt(r, 6, 12, 2)
    const m = beamOf(`A:0:fixed B:${a} C:${a + b}`)
    const k = pick(r, [[2, 1], [1.5, 1], [3, 1]])
    const Pc = randInt(r, 5, 20, 5),
      w = randInt(r, 1, 3)
    m.loads = [P('C', Pc), W('AB', w), ...(r() < 0.5 ? [P('B', randInt(r, 5, 15, 5))] : [])]
    m.members.forEach((x, i) => (x.EI = EIof(I * k[i])))
    const q = pick(r, [down('C'), turn('C'), down('B')])
    const loadTxt = loadList(m)
    return { title: 'Stepped cantilever', text: `Cantilever **A–C**, fixed at A. $I = ${I}$ in⁴; segment A–B is ${fmtI(k[0])}, B–C is ${fmtI(k[1])}. Loads: ${loadTxt}. Find ${q.ask}.`, m, q, labels: Object.fromEntries(m.members.map((x, i) => [x.id, fmtI(k[i])])) }
  }
  if (variant === 'overhang') {
    const a = randInt(r, 8, 14, 2),
      b = randInt(r, 6, 12, 2),
      c = randInt(r, 4, 10, 2)
    const m = beamOf(`A:0:pin B:${a} C:${a + b}:roller D:${a + b + c}`)
    const k = pick(r, [[1, 1, 2], [2, 2, 1], [1, 2, 1], [1.5, 1.5, 1]])
    const w = randInt(r, 1, 3),
      Pd = randInt(r, 5, 20, 5)
    m.loads = [W('AB', w), W('BC', w), P('D', Pd), ...(r() < 0.5 ? [P('B', randInt(r, 10, 30, 5))] : [])]
    m.members.forEach((x, i) => (x.EI = EIof(I * k[i])))
    const q = pick(r, [down('D'), turn('C'), down('B'), turn('A')])
    return { title: 'Stepped overhanging beam', text: `Beam **A–D**: pin at A, roller at C, overhang C–D. $I = ${I}$ in⁴; moments of inertia as marked (${m.members.map((x, i) => `${x.id} = ${fmtI(k[i])}`).join(', ')}). Loads: ${loadList(m)}. Find ${q.ask}.`, m, q, labels: Object.fromEntries(m.members.map((x, i) => [x.id, fmtI(k[i])])) }
  }
  const a = randInt(r, 6, 14, 2),
    b = randInt(r, 6, 14, 2),
    c = randInt(r, 6, 14, 2)
  const m = beamOf(`A:0:pin B:${a} C:${a + b} D:${a + b + c}:roller`)
  const k = pick(r, [[1, 2, 1], [1, 1.5, 1], [2, 1, 1], [1, 1, 2], [1, 2, 2]])
  m.loads = [P('B', randInt(r, 10, 30, 5)), ...(r() < 0.5 ? [P('C', randInt(r, 5, 20, 5))] : [W('BC', randInt(r, 1, 3))])]
  m.members.forEach((x, i) => (x.EI = EIof(I * k[i])))
  const q = pick(r, [down('B'), down('C'), turn('A'), turn('D')])
  return { title: 'Simple beam with a step in I', text: `Simply supported beam **A–D** (pin A, roller D). $I = ${I}$ in⁴; ${m.members.map((x, i) => `${x.id} = ${fmtI(k[i])}`).join(', ')}. Loads: ${loadList(m)}. Find ${q.ask}.`, m, q, labels: Object.fromEntries(m.members.map((x, i) => [x.id, fmtI(k[i])])) }
}

function frame(r: () => number) {
  const I = pick(r, [300, 400, 500, 600, 800])
  const kb = pick(r, [1, 1.5, 2])
  const h = randInt(r, 10, 16, 2)
  const variant = pick(r, ['portal', 'overhang', 'L'] as const)
  if (variant === 'L') {
    const L = randInt(r, 8, 16, 2)
    const m = model(`A:0,0 B:0,${h} C:${L},${h}`, 'A-B B-C', 'A:fixed')
    m.loads = [P('C', randInt(r, 5, 15, 5)), ...(r() < 0.6 ? [H('B', randInt(r, 4, 12, 2))] : [W('BC', randInt(r, 1, 2))])]
    m.members[0].EI = EIof(I)
    m.members[1].EI = EIof(I * kb)
    const q = pick(r, [down('C'), right('C'), turn('C')])
    return { title: 'L-shaped frame, fixed base', text: `Frame **A–B–C**: fixed at A, column A–B (${h} ft, I), beam B–C (${L} ft, ${fmtI(kb)}), $I = ${I}$ in⁴. Loads: ${loadList(m)}. Find ${q.ask}.`, m, q, labels: { AB: 'I', BC: fmtI(kb) } }
  }
  const a = randInt(r, 6, 12, 2),
    b = randInt(r, 6, 14, 2)
  const L = a + b
  const over = variant === 'overhang'
  const e = randInt(r, 4, 8, 2)
  const m = model(`A:0,0 B:0,${h} E:${a},${h} C:${L},${h} D:${L},0${over ? ` F:${L + e},${h}` : ''}`, `A-B B-E E-C D-C${over ? ' C-F' : ''}`, 'A:pin D:roller')
  const w = randInt(r, 1, 3)
  const beamLoad = r() < 0.5 ? [P('E', randInt(r, 10, 30, 5))] : [W('BE', w), W('EC', w)]
  m.loads = [H('B', randInt(r, 4, 16, 2)), ...beamLoad, ...(over ? [P('F', randInt(r, 5, 15, 5))] : [])]
  for (const x of m.members) x.EI = EIof(x.id === 'AB' || x.id === 'DC' ? I : I * kb)
  const q = pick(r, over ? [down('F'), right('C'), turn('C'), down('E')] : [right('C'), down('E'), turn('A'), turn('B')])
  const labels: Record<string, string> = Object.fromEntries(m.members.map((x) => [x.id, x.id === 'AB' || x.id === 'DC' ? 'I' : fmtI(kb)]))
  return {
    title: over ? 'Portal frame with an overhang' : 'Portal frame (pin + roller)',
    text: `Portal frame: pin at A, roller at D, columns ${h} ft high (I), beam B–C ${L} ft (${fmtI(kb)}) with point E ${a} ft from B${over ? `, overhang C–F ${e} ft (${fmtI(kb)})` : ''}; $I = ${I}$ in⁴. Loads: ${loadList(m)}. Find ${q.ask}.`,
    m,
    q,
    labels,
  }
}

function truss(r: () => number) {
  const type = pick(r, ['pratt', 'howe', 'warren'] as TrussType[])
  const w = pick(r, [10, 12, 15]),
    h = pick(r, [10, 12, 15])
  const loads = [0, 0, 0].map(() => pick(r, [0, 10, 20, 30]))
  if (!loads.some(Boolean)) loads[1] = 20
  const { model: m } = buildTruss({ type, n: 4, w, h, loads })
  if (r() < 0.4) m.loads.push(H('U1', randInt(r, 5, 15, 5)))
  const Ac = pick(r, [3, 4, 5]),
    Aw = pick(r, [2, 3])
  const area = (id: string) => (/^L\dL\d$|^U\dU\d$/.test(id) ? Ac : Aw)
  const labels = Object.fromEntries(m.members.map((x) => [x.id, `(${area(x.id)})`]))
  const opts: VWOptions = { EA: (id) => area(id) * E }
  const extra = pick(r, ['none', 'none', 'fab', 'temp'] as const)
  let extraTxt = ''
  if (extra === 'fab') {
    const bar = pick(r, m.members.filter((x) => !/^L\dL\d$/.test(x.id))).id
    const d = pick(r, [0.25, 0.5, 0.75, 1])
    opts.dL = { [bar]: d / 12 }
    extraTxt = ` Member **${bar}** was fabricated **${d} in too long**.`
  } else if (extra === 'temp') {
    const dT = randInt(r, 40, 80, 10)
    opts.dL = Object.fromEntries(m.members.filter((x) => /^L\dL\d$/.test(x.id)).map((x) => [x.id, 6.5e-6 * dT * w]))
    extraTxt = ` The bottom chord also warms up by **${dT} °F** ($\\alpha = 6.5\\times10^{-6}$ /°F).`
  }
  // relative deflection between two joints that no bar connects
  const linked = new Set(m.members.flatMap((x) => [x.i + x.j, x.j + x.i]))
  const free = m.nodes.filter((n) => n.id !== 'L0' && n.id !== 'L4')
  const pairs = free.flatMap((p, i) => free.slice(i + 1).filter((q) => !linked.has(p.id + q.id) && Math.abs(p.x - q.x) <= w + 1e-9 && p.y !== q.y).map((q) => [p, q] as const))
  const kind = pick(r, ['v', 'v', 'h', ...(pairs.length ? (['rel'] as const) : [])] as const)
  let q: Query
  if (kind === 'h') q = right('L4')
  else if (kind === 'rel') {
    const [p, s] = pick(r, pairs)
    const L = Math.hypot(s.x - p.x, s.y - p.y)
    const ux = (s.x - p.x) / L,
      uy = (s.y - p.y) / L
    q = { what: `Δ_${p.id}${s.id} (+ = closer)`, virtual: [{ kind: 'node', node: p.id, fx: ux, fy: uy }, { kind: 'node', node: s.id, fx: -ux, fy: -uy }], unit: 'in', ask: `the relative deflection between **${p.id}** and **${s.id}** along the line joining them`, note: `a pair of 1 k loads at ${p.id} and ${s.id}, pointing toward each other along ${p.id}–${s.id}` }
  } else q = down(pick(r, ['L1', 'L2', 'L3']))
  const NAME = { pratt: 'Pratt', howe: 'Howe', warren: 'Warren' } as Record<TrussType, string>
  return {
    title: `${NAME[type]} truss${extra === 'fab' ? ' with a fabrication error' : extra === 'temp' ? ' with a temperature change' : ''}`,
    text: `${NAME[type]} truss, 4 panels × ${w} ft, height ${h} ft; pin at L0, roller at L4. Areas (in²) in brackets: chords ${Ac}, web members ${Aw}; $E = ${E}$ ksi. Loads: ${loadList(m)}.${extraTxt} Find ${q.ask}.`,
    m,
    q,
    labels,
    opts,
  }
}

function settle(r: () => number) {
  const I = pick(r, [300, 400, 500, 600])
  const s = pick(r, [0.25, 0.5, 0.75, 1])
  if (r() < 0.5) {
    const a = randInt(r, 12, 24, 2),
      c = randInt(r, 4, 10, 2)
    const m = beamOf(`A:0:pin B:${a}:roller C:${a + c}`)
    m.loads = [W('AB', randInt(r, 1, 3)), P('C', randInt(r, 5, 15, 5))]
    const q = pick(r, [down('C'), turn('B')])
    return { title: 'Overhanging beam on a settling support', text: `Beam **A–C**: pin at A, roller at B, overhang B–C; $I = ${I}$ in⁴ throughout. Loads: ${loadList(m)}. Support **B settles ${s} in**. Find ${q.ask}, including the settlement.`, m, q, labels: {}, opts: { EI: () => EIof(I), settle: { B: { dy: -s / 12 } } } }
  }
  const a = randInt(r, 8, 14, 2),
    b = randInt(r, 8, 14, 2)
  const m = beamOf(`A:0:pin B:${a} C:${a + b}:roller`)
  m.loads = [P('B', randInt(r, 10, 30, 5)), ...(r() < 0.5 ? [W('AB', 2), W('BC', 2)] : [])]
  const q = pick(r, [down('B'), turn('A')])
  const who = pick(r, ['A', 'C'])
  return { title: 'Simple beam on a settling support', text: `Simple beam **A–C** (pin A, roller C); $I = ${I}$ in⁴ throughout. Loads: ${loadList(m)}. Support **${who} settles ${s} in**. Find ${q.ask}, including the settlement.`, m, q, labels: {}, opts: { EI: () => EIof(I), settle: { [who]: { dy: -s / 12 } } } }
}

function column(r: () => number) {
  const h1 = randInt(r, 8, 12, 2),
    h2 = randInt(r, 8, 12, 2)
  const m = model(`c:0,0 b:0,${h2} a:0,${h1 + h2}`, 'c-b b-a', 'c:fixed')
  const [sx, sy, sh] = pick(r, [[4, 3, 5], [3, 4, 5], [12, 5, 13]])
  const n = randInt(r, 1, 3)
  const Pa = sh * n * (sh === 5 ? 2 : 1)
  const Hb = randInt(r, 5, 15, 5)
  m.loads = [{ kind: 'node', node: 'a', fx: (Pa * sx) / sh, fy: (-Pa * sy) / sh, label: `${Pa}k (${sy}:${sx})` }, H('b', Hb, `${Hb}k`)]
  const A1 = pick(r, [30, 40, 50]),
    I1 = pick(r, [300, 400, 500])
  const kA = pick(r, [1.2, 1.5]),
    kI = pick(r, [1.5, 2])
  const G = E / (2 * 1.3)
  const seg = (id: string) => (id === 'ba' ? 1 : 2)
  const opts: VWOptions = {
    EI: (id) => EIof(seg(id) === 1 ? I1 : kI * I1),
    EA: (id) => E * (seg(id) === 1 ? A1 : kA * A1),
    GA: (id) => G * (seg(id) === 1 ? A1 : kA * A1),
    K: 1.2,
    shear: true,
    axial: true,
  }
  const q = pick(r, [right('a'), right('a'), right('b')])
  return {
    title: 'Cantilever column: axial + shear + bending',
    text: `Cantilever column fixed at **c**; a–b (${h1} ft) is segment 1, b–c (${h2} ft) is segment 2. $E = ${E}$ ksi, $\\nu = 0.3$, $K = 1.2$, $A_1 = ${A1}$ in², $A_2 = ${kA}A_1$, $I_1 = ${I1}$ in⁴, $I_2 = ${kI}I_1$. Loads: ${Pa} k at a with slope ${sy}:${sx} (down and to the right), ${Hb} k horizontal at b. Considering **axial, shear and bending** strain energy, find ${q.ask}.`,
    m,
    q,
    labels: { ba: '1', cb: '2' },
    opts,
  }
}

/** loads as text; equal UDLs on consecutive members read as one ("2 k/ft on B–C") */
function loadList(m: Model): string {
  const mem = new Map(m.members.map((x) => [x.id, x]))
  const out: string[] = []
  let run: { w: number; from: string; to: string } | null = null
  const flush = () => run && out.push(`${run.w} k/ft on ${run.from}–${run.to}`)
  for (const l of m.loads) {
    if (l.kind === 'dist') {
      const x = mem.get(l.member)!
      if (run && run.w === Math.abs(l.w1) && run.to === x.i) run.to = x.j
      else {
        flush()
        run = { w: Math.abs(l.w1), from: x.i, to: x.j }
      }
      continue
    }
    flush()
    run = null
    out.push(describeLoad(l))
  }
  flush()
  return out.join(', ')
}

function describeLoad(l: Load): string {
  if (l.kind === 'node') {
    const parts = []
    if (l.fy) parts.push(`${kips(Math.abs(l.fy))} ${l.fy < 0 ? '↓' : '↑'}`)
    if (l.fx) parts.push(`${kips(Math.abs(l.fx))} ${l.fx > 0 ? '→' : '←'}`)
    return `${parts.join(' + ')} at ${l.node}`
  }
  if (l.kind === 'dist') return `${Math.abs(l.w1)} k/ft on ${l.member}`
  return `${kips(Math.abs(l.fy ?? 0))} on ${l.member}`
}

// ---------------------------------------------------------------- assemble
const GEN: Record<Family, (r: () => number) => { title: string; text: string; m: Model; q: Query; labels: Record<string, string>; opts?: VWOptions }> = { beam, frame, truss, settle, column }

export function makeFull(seed: number, only?: Family): FullProblem {
  const r = rng(seed * 7919 + 13)
  const family = only ?? pick(r, FAMILIES.map((f) => f.v))
  const g = GEN[family](r)
  const opts = g.opts ?? {}
  const scale = g.q.unit === 'in' ? 12 : 1
  const res = virtualWork(g.m, g.m.loads, g.q.virtual, opts)
  const steps: FullStep[] = []
  const small = g.q.unit === 'rad'
  if (family === 'truss') {
    // a bar that carries both N and n, so the check means something
    const used = res.terms.filter((t) => Math.abs(t.n) > 1e-6 && Math.abs(t.N) > 1e-6)
    const t = used.reduce((b, x) => (Math.abs(x.axial) > Math.abs(b.axial) ? x : b), used[0] ?? res.terms[0])
    steps.push({ key: 'N', label: `Real force N in ${t.member} (+ tension)`, value: t.N, unit: 'k' })
    steps.push({ key: 'n', label: `Virtual force n in ${t.member} (+ tension)`, value: t.n, unit: 'k' })
    if (opts.dL) steps.push({ key: 'fab', label: 'Σ n·ΔL part', value: res.terms.reduce((s, x) => s + x.fab, 0) * 12, unit: 'in' })
  } else {
    const sup = g.m.supports[0].node
    const R = res.real.reaction(sup),
      U = res.virtual.reaction(sup)
    const fixed = g.m.supports[0].type === 'fixed'
    const comp = fixed ? 'm' : Math.abs(R.ry) > 1e-6 ? 'ry' : 'rx'
    const name = comp === 'm' ? `Real moment at ${sup} (${rotTag()})` : comp === 'ry' ? `Real vertical reaction at ${sup} (+ up)` : `Real horizontal reaction at ${sup} (+ →)`
    const vname = comp === 'm' ? `Virtual moment at ${sup} (${rotTag()})` : comp === 'ry' ? `Virtual vertical reaction at ${sup} (+ up)` : `Virtual horizontal reaction at ${sup} (+ →)`
    const val = (x: { rx: number; ry: number; m: number }) => (comp === 'm' ? rot(x.m) : x[comp])
    steps.push({ key: 'R', label: name, value: val(R), unit: comp === 'm' ? 'k-ft' : 'k' })
    steps.push({ key: 'r', label: vname, value: val(U), unit: comp === 'm' ? 'k-ft/k' : 'k/k' })
    if (family === 'column') {
      steps.push({ key: 'b', label: 'Bending part Σ∫Mm/EI', value: res.terms.reduce((s, x) => s + x.bending, 0) * scale, unit: g.q.unit })
      steps.push({ key: 's', label: 'Shear part Σ K∫Vv/GA', value: res.terms.reduce((s, x) => s + x.shear, 0) * scale, unit: g.q.unit, small: true })
      steps.push({ key: 'a', label: 'Axial part Σ NnL/AE', value: res.terms.reduce((s, x) => s + x.axial, 0) * scale, unit: g.q.unit, small: true })
    } else if (family === 'settle') {
      steps.push({ key: 'el', label: 'Elastic part Σ∫Mm/EI', value: res.terms.reduce((s, x) => s + x.bending, 0) * scale, unit: g.q.unit, small })
      steps.push({ key: 'st', label: 'Settlement part −Σ r·Δ', value: res.settle * scale, unit: g.q.unit, small })
    }
  }
  steps.push({ key: 'ans', label: g.q.what, value: res.total * scale, unit: g.q.unit, small })
  return { family, title: g.title, text: g.text, m: g.m, labels: g.labels, virtual: g.q.virtual, opts, unit: g.q.unit, what: g.q.what, steps, virtualNote: g.q.note }
}

/** the structure is stable under both systems (a guard for the generator tests) */
export function solvable(p: FullProblem) {
  solve(p.m, p.m.loads)
  solve(p.m, p.virtual)
  return true
}
