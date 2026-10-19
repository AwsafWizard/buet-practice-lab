// L-3/T-1 term final 2016-17 (held 13 Aug 2017). Scan pages 30–33 (phone photos, figures on 32–33).
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { cantileverMethod, gridModel, portalMethod, xBraced, type ApproxResult, type GridFrame } from '../../engine/approx'
import { linearMember, type DiagramMember } from '../../engine/diagrams'
import { ssMomentILD, ssShearILD, trainExtremes, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { threeHingedArch } from '../../engine/cable'
import type { Load, Model } from '../../engine/model'
import { beamOf, F, H, Mo, model, P, truss, W } from '../../kit/builders'
import { ApproxSolution, ApproxTables, Figure, FrameSolution, ILDStack, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { ArchSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { DiagramView, fmt } from '../../components/DiagramView'

const PAPER = '2016-17' as const
const E = 30000

// ---------------------------------------------------------------- Q1 truss deflection at b
const t1 = truss('A:0,10 B:15,10 C:30,10 a:0,0 b:15,0 c:30,0', 'A-B B-C a-A B-b C-c a-b b-c a-B B-c', 'a:pin c:roller', [P('b', 20, '20k')])
const EA1 = E * 10
const vw1 = () => virtualWork(t1, t1.loads, [P('b', 1)], { EA: () => EA1 })

// ---------------------------------------------------------------- Q2 slope at A
const b2 = beamOf('A:0:pin B:10 C:20 D:30:roller', [P('B', 30, '30k')])
b2.members.forEach((m) => (m.label = m.id === 'CD' ? 'I₂ = 100' : 'I₁ = 200'))
const EI2 = (id: string) => (E * (id === 'CD' ? 100 : 200)) / 144
const vw2 = () => virtualWork(b2, b2.loads, [Mo('A', -1)], { EI: EI2 }) // unit clockwise couple at A

// ---------------------------------------------------------------- Q3 frame, deflection at B
const f3 = model('B:0,10 C:10,10 D:25,10 A:10,0', 'B-C C-D A-C', 'A:roller D:pin', [W('CD', 3, { label: '3 k/ft' })])
const o3 = { EI: () => (E * 400) / 144, EA: () => E * 10, axial: true }
const vw3 = () => virtualWork(f3, f3.loads, [P('B', 1)], o3)

// ---------------------------------------------------------------- Q4 suspension bridge with hinged girder
const q4 = (() => {
  // hangers at 100..500 carry equal force Fh (parabolic cable). Girder pinned at 0 and 600, hinge at 300.
  // left half, ΣM_hinge: 300Ay − 50(200) + Fh(200 + 100) = 0 → Ay = (10000 − 300Fh)/300
  // right half, ΣM_hinge: 300Cy − 40(100) + Fh(100 + 200) = 0 → Cy = (4000 − 300Fh)/300
  // ΣFy: Ay + Cy + 5Fh = 90
  const Fh = (90 - (10000 + 4000) / 300) / (5 - 600 / 300)
  const Ay = (10000 - 300 * Fh) / 300
  const Cy = (4000 - 300 * Fh) / 300
  // cable: 5 equal loads, sag 30 ft at midspan → H = M_mid/30
  const Hc = (2.5 * Fh * 300 - Fh * (200 + 100)) / 30
  const Tmax = Math.hypot(Hc, 2.5 * Fh)
  return { Fh, Ay, Cy, Hc, Tmax }
})()
const g4 = beamOf('A:0:pin h1:100 h2:200 M:300 h4:400 h5:500 C:600:roller', [
  P('h1', 50, '50k'),
  P('h4', 40, '40k'),
  ...['h1', 'h2', 'M', 'h4', 'h5'].map((n) => F(n, 0, q4.Fh, 'F')),
])
const m4 = (() => {
  const cy = (x: number) => 30 + 30 * ((x - 300) / 300) ** 2
  const xs = [0, 100, 200, 300, 400, 500, 600]
  const n = [...xs.map((x, k) => `${k === 3 ? 'M*' : 'g' + k}:${x},0`), ...xs.map((x, k) => `c${k}:${x},${cy(x)}`), 'T0:0,-50 T6:600,-50 K0:-120,-50 K6:720,-50'].join(' ')
  const girder = 'g0-g1 g1-g2 g2-M M-g4 g4-g5 g5-g6'
  const cable = 'c0-c1 c1-c2 c2-c3 c3-c4 c4-c5 c5-c6 K0-c0 c6-K6'
  const hang = 'g1-c1 g2-c2 M-c3 g4-c4 g5-c5'
  const m = model(n, `${girder} ${cable} ${hang} T0-c0 T6-c6`, 'g0:pin g6:roller T0:fixed T6:fixed K0:pin K6:pin', [P('g1', 50, '50k'), P('g4', 40, '40k')])
  const cs = new Set(cable.split(' ').map((s) => s.replace('-', '')))
  const hs = new Set(hang.split(' ').map((s) => s.replace('-', '')))
  m.members.forEach((mm) => {
    if (cs.has(mm.id)) Object.assign(mm, { truss: true, style: 'cable' })
    if (hs.has(mm.id)) Object.assign(mm, { truss: true, style: 'thin' })
  })
  m.nodes.forEach((q) => (q.label = q.id === 'M' ? 'hinge' : ''))
  return m
})()

// ---------------------------------------------------------------- Q5–Q6 wheel loads of Fig. 5
const train5: Train = { P: [10, 10, 60, 60, 60, 60, 75, 75, 75, 75], gaps: [5, 10, 5, 5, 5, 15, 5, 5, 5], udl: { w: 5, gap: 5 } }
const ild5 = ssMomentILD(80, 20)
const ild6 = ssShearILD(72, 24)

// ---------------------------------------------------------------- Q7 truss member a, Fig. 6 loads
const t7 = truss(
  'L0:0,0 L1:25,0 L2:50,0 L3:75,0 L4:100,0 L5:125,0 L6:150,0 U1:25,20 U2:50,20 U3:75,20 U4:100,20 U5:125,20',
  'L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 U1-U2 U2-U3 U3-U4 U4-U5 L0-U1 U5-L6 U1-L1 U2-L2 U3-L3 U4-L4 U5-L5 U1-L2 a=L2-U3 U3-L4 L4-U5',
  'L0:pin L6:roller',
)
t7.members.forEach((m) => m.id === 'a' && (m.label = 'a'))
const p7 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'] }
const ild7 = () => influenceLine(t7, p7, { kind: 'force', member: 'a' })
const train7: Train = { P: [20, 50, 50, 50, 50, 60, 60, 60], gaps: [12, 6, 6, 6, 12, 6, 6], udl: { w: 4, gap: 6 } }

// ---------------------------------------------------------------- Q8(a) truss Fig. 7
const t8 = truss('1:0,0 2:10,0 3:20,0 8:0,10 7:5,10 6:10,10 5:15,10 4:20,10', '1-8 8-7 7-6 5-6 5-4 4-3 1-7 7-2 2-6 2-5 3-5 1-2 2-3', '1:pin 3:roller', [H('8', 10, '10k'), P('7', 12, '12k'), P('5', 12, '12k'), P('2', 30, '30k')])

// ---------------------------------------------------------------- Q8(b) three-hinged arch
const arch = { L: 16, h: 4, loads: [] as { x: number; P: number }[], udl: { w: 12, a: 0, b: 8 } }
const a8 = () => threeHingedArch(arch).at(6)
const m8 = (() => {
  const xs = Array.from({ length: 9 }, (_, k) => 2 * k)
  const y = (x: number) => (4 * 4 * x * (16 - x)) / 256
  const n = xs.map((x, k) => `${k === 4 ? 'C*' : k === 0 ? 'A' : k === 8 ? 'B' : k === 3 ? 'D' : 'p' + k}:${x},${y(x)}`).join(' ')
  const ids = xs.map((_, k) => (k === 4 ? 'C' : k === 0 ? 'A' : k === 8 ? 'B' : k === 3 ? 'D' : 'p' + k))
  const mem = ids.slice(1).map((id, k) => `${ids[k]}-${id}`).join(' ')
  const m = model(n, mem, 'A:pin B:pin')
  m.loads = m.members.slice(0, 4).map((mm, k) => W(mm.id, 12, { proj: true, label: k === 0 ? '12 kN/m' : '' }))
  m.nodes.forEach((q) => /^p/.test(q.id) && (q.label = ''))
  return m
})()

// ---------------------------------------------------------------- Q9(a) vertical loads, irregular frame (0.1L method)
interface VBeam { id: string; i: string; j: string; w: number }
interface VCol { id: string; i: string; j: string; base?: 'fixed' | 'pin' }
const v9 = (() => {
  const nodesS = 'A:0,0 B:12,0 C:22,0 D:32,0 E:0,12 F:12,12 G:22,12 H:32,12 I:0,22 J:12,22 K:22,22 L:0,32 M:12,32 N:22,32'
  const beams: VBeam[] = [
    { id: 'EF', i: 'E', j: 'F', w: 2 },
    { id: 'FG', i: 'F', j: 'G', w: 2 },
    { id: 'GH', i: 'G', j: 'H', w: 1 },
    { id: 'IJ', i: 'I', j: 'J', w: 2 },
    { id: 'JK', i: 'J', j: 'K', w: 2 },
    { id: 'LM', i: 'L', j: 'M', w: 1 },
    { id: 'MN', i: 'M', j: 'N', w: 1 },
  ]
  const cols: VCol[] = [
    { id: 'AE', i: 'A', j: 'E', base: 'fixed' },
    { id: 'BF', i: 'B', j: 'F', base: 'fixed' },
    { id: 'CG', i: 'C', j: 'G', base: 'fixed' },
    { id: 'DH', i: 'D', j: 'H', base: 'pin' },
    { id: 'EI', i: 'E', j: 'I' },
    { id: 'FJ', i: 'F', j: 'J' },
    { id: 'GK', i: 'G', j: 'K' },
    { id: 'IL', i: 'I', j: 'L' },
    { id: 'JM', i: 'J', j: 'M' },
    { id: 'KN', i: 'K', j: 'N' },
  ]
  const loads: Load[] = beams.map((b) => W(b.id, b.w, { label: `${b.w} k/ft` }))
  const m = model(nodesS, [...cols, ...beams].map((x) => `${x.i}-${x.j}`).join(' '), 'A:fixed B:fixed C:fixed D:pin', loads)
  const xy = new Map(m.nodes.map((q) => [q.id, [q.x, q.y] as [number, number]]))
  const L = (b: VBeam) => xy.get(b.j)![0] - xy.get(b.i)![0]
  const hgt = (c: VCol) => xy.get(c.j)![1] - xy.get(c.i)![1]
  const beamRes = beams.map((b) => ({ ...b, L: L(b), Mend: 0.045 * b.w * L(b) ** 2, Mmid: 0.08 * b.w * L(b) ** 2, V: 0.5 * b.w * L(b) }))
  const colRes = cols.map((c) => ({ ...c, h: hgt(c), Mtop: 0, Mbot: 0, N: 0, V: 0 }))
  const joints = [...new Set(beams.flatMap((b) => [b.i, b.j]))].map((n) => {
    const left = beamRes.find((b) => b.j === n)
    const right = beamRes.find((b) => b.i === n)
    const unb = (left?.Mend ?? 0) - (right?.Mend ?? 0) // net ccw moment of the girders on the joint
    const below = colRes.find((c) => c.j === n)
    const above = colRes.find((c) => c.i === n)
    const kb = below ? 1 / below.h : 0
    const ka = above ? 1 / above.h : 0
    const cb = (unb * kb) / (kb + ka)
    const ca = (unb * ka) / (kb + ka)
    if (below) below.Mtop = cb // ccw on the top end → sagging (+) in bottom→top axis
    if (above) above.Mbot = -ca // ccw on the bottom end → −
    return { n, left: left?.Mend ?? 0, right: right?.Mend ?? 0, unb, cb, ca, below: below?.id, above: above?.id }
  })
  for (const c of colRes) if (c.base === 'fixed') c.Mbot = -0.5 * c.Mtop // carry-over ½ to a fixed base
  // axial: girder end shears accumulated from the top down
  const order = [...colRes].sort((a, b) => xy.get(b.i)![1] - xy.get(a.i)![1])
  for (const c of order) {
    const sh = beamRes.filter((b) => b.i === c.j || b.j === c.j).reduce((s, b) => s + b.V, 0)
    const up = colRes.find((q) => q.i === c.j)
    c.N = -(sh + (up ? -up.N : 0))
    c.V = (c.Mtop - c.Mbot) / c.h
  }
  const dms: DiagramMember[] = [
    ...colRes.map((c) => linearMember(c.id, xy.get(c.i)!, xy.get(c.j)!, { N: c.N, V: c.V, Mi: c.Mbot, Mj: c.Mtop })),
    ...beamRes.map((b) => {
      const [x1, y1] = xy.get(b.i)!
      const samples = Array.from({ length: 41 }, (_, k) => {
        const t = (b.L * k) / 40
        return { t, N: 0, V: 0.5 * b.w * b.L - b.w * t, M: 0.5 * b.w * b.L * t - 0.5 * b.w * t * t - b.Mend }
      })
      return { id: b.id, x1, y1, x2: x1 + b.L, y2: y1, L: b.L, truss: false, samples }
    }),
  ]
  return { m, beamRes, colRes, joints, dms }
})()

// ---------------------------------------------------------------- Q9(b) X-braced truss, tension diagonals
const t9 = truss(
  'a:0,0 b:10,0 c:20,0 d:30,0 A:0,10 B:10,10 C:20,10 D:30,10',
  'a-b b-c c-d A-B y=B-C C-D z=a-A B-b C-c D-d a-B A-b b-C B-c x=c-D C-d',
  'a:roller d:pin',
  [P('A', 10, '10k'), P('B', 10, '10k'), P('C', 10, '10k'), P('D', 10, '10k'), H('D', 20, '20k')],
)
t9.members.forEach((m) => ['x', 'y', 'z'].includes(m.id) && (m.label = m.id))
const pairs9: [string, string][] = [
  ['aB', 'Ab'],
  ['bC', 'Bc'],
  ['x', 'Cd'],
]
const xb9 = () => xBraced(t9, pairs9, 'tension')

// ---------------------------------------------------------------- Q10(a) overhanging beam ILDs
const b10 = beamOf('A:0 B:8:pin C:18 D:23:roller E:29')
const p10 = { kind: 'members' as const, members: b10.members.map((m) => m.id) }
const ild10 = {
  RB: () => influenceLine(b10, p10, { kind: 'reaction', node: 'B', comp: 'y' }),
  VD: () => influenceLine(b10, p10, { kind: 'shear', member: 'CD', x: 5, side: -1 }),
  MC: () => influenceLine(b10, p10, { kind: 'moment', member: 'CD', x: 0 }),
}

// ---------------------------------------------------------------- Q10(b) portal
const g10: GridFrame = { xs: [0, 20, 30], heights: [12, 10], loads: [20, 10], loadSide: ['left', 'left'] }

// ---------------------------------------------------------------- Q11(a) cantilever, set-back frame
// top storey has only two columns: modelled as a 3-column grid whose top-right column has zero area (carries nothing)
const g11: GridFrame = {
  xs: [0, 15, 25],
  heights: [12, 10, 10],
  loads: [20, 20, 10],
  loadSide: ['left', 'left', 'left'],
  areas: [
    [1, 2, 1],
    [1, 2, 1],
    [1, 1, 0],
  ],
  names: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'X'],
}
const PHANTOM = ['IX', 'KX']
const m11 = (() => {
  const m = gridModel(g11)
  return { ...m, nodes: m.nodes.filter((n) => n.id !== 'X'), members: m.members.filter((x) => !PHANTOM.includes(x.id)) }
})()
const c11 = (): ApproxResult => {
  const r = cantileverMethod(g11)
  return {
    ...r,
    columns: r.columns.map((row) => row.filter((c) => !PHANTOM.includes(c.name))),
    beams: r.beams.map((row) => row.filter((b) => !PHANTOM.includes(b.name))),
    diagrams: r.diagrams.filter((d) => !PHANTOM.includes(d.id)),
  }
}

// ---------------------------------------------------------------- Q11(b) Warren truss ILD
const hW = 20 * Math.sin(Math.PI / 3)
const t11 = truss(`L0:0,0 L1:20,0 L2:40,0 L3:60,0 U1:10,${hW} U2:30,${hW} U3:50,${hW}`, 'L0-L1 a=L1-L2 L2-L3 b=U1-U2 U2-U3 L0-U1 U1-L1 L1-U2 U2-L2 L2-U3 U3-L3', 'L0:pin L3:roller')
t11.members.forEach((m) => ['a', 'b'].includes(m.id) && (m.label = m.id))
const p11 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3'] }

export const Q2016: PYQ[] = [
  {
    id: '2016-17-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: 28,
    topics: ['vw'],
    title: 'Truss: vertical deflection of joint b',
    pages: [30, 32],
    text: `Calculate the vertical deflection at joint **b** of the truss in Fig. 1 (two panels of 15 ft, height 10 ft; top chord A–B–C, bottom chord a–b–c, verticals at every joint, diagonals a–B and B–c; pin at a, roller at c; 20 k at b). $A = 10$ in² for all members, $E = 30{,}000$ ksi.`,
    figure: () => <Figure model={t1} />,
    checks: () => [{ key: 'db', label: 'Vertical deflection of b (down)', value: vw1().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Unit-load method: $\\Delta_b = \\sum \\dfrac{N n L}{AE}$, with N from the real 20 k and n from a unit load at b. Here the virtual system is the real one divided by 20 ($n = N/20$). Reactions 10 k each. Joints A and C have two non-collinear unloaded bars → **AA, AB, BC, Cc are zero**. Joint a: $F_{aB}(10/18.03) = -10$ → $F_{aB} = -18.03$ k (C), $F_{ab} = +15$ k (T); Bb carries the 20 k (T).`}</Md>
        <VWSolution model={t1} real={t1.loads} virtual={[P('b', 1)]} opts={{ EA: () => EA1 }} scale={12} resultUnit="in" what="Δb (vertical, + down)" unitNote="L in ft, EA = 30000 × 10 = 300,000 k; ×12 for inches." />
      </div>
    ),
    notes: ['Fig. 1 read as: A, B, C top joints, a, b, c bottom joints; pin at a, roller at c; diagonals a–B and B–c only.'],
  },
  {
    id: '2016-17-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: 28,
    topics: ['vw'],
    title: 'Change in slope at support A of a stepped beam',
    pages: [30, 32],
    text: `Determine the change in slope at support **A** of the beam in Fig. 2: simply supported at A (pin) and D (roller), span 30 ft; 30 k at B (10 ft from A). $I_1 = 200$ in⁴ for A–C (20 ft), $I_2 = 100$ in⁴ for C–D (10 ft), $E = 30{,}000$ ksi.`,
    figure: () => <Figure model={b2} labels />,
    checks: () => [{ key: 'th', label: 'Rotation at A (clockwise)', value: vw2().total, unit: 'rad', tol: 0.02 }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Apply a **unit couple** (clockwise) at A: reactions $\\mp 1/30$, $m = 1 - x/30$. Real: $R_A = 20$, $R_D = 10$ k → $M = 20x$ (A–B), $300 - 10x$ (B–C), $10(30-x)$ (C–D).
$$\\theta_A = \\int\\frac{Mm}{EI}dx = \\frac{777.8 + 777.8}{EI_1} + \\frac{111.1}{EI_2},\\quad EI_1 = \\frac{30000\\times200}{144},\\ EI_2 = \\frac{EI_1}{2}$$
Positive result → A rotates clockwise (the beam sags toward B).`}</Md>
        <VWSolution model={b2} real={b2.loads} virtual={[Mo('A', -1)]} opts={{ EI: EI2 }} resultUnit="rad" what="θA (clockwise +)" unitNote="EI in k-ft²; the result is in radians." />
      </div>
    ),
  },
  {
    id: '2016-17-A3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: 28,
    topics: ['vw'],
    title: 'Frame with overhang: vertical deflection at B (bending + axial)',
    pages: [30, 32],
    text: `For the frame in Fig. 3 find the vertical deflection at **B**. Beam B–C–D at 10 ft height: overhang B–C 10 ft, span C–D 15 ft carrying 3 k/ft; column C–A 10 ft on a roller at A; pin at D. $A = 10$ in², $I = 400$ in⁴ for all members, $E = 30{,}000$ ksi.`,
    figure: () => <Figure model={f3} dimY />,
    checks: () => [{ key: 'db', label: 'Vertical deflection of B (+ down, − up)', value: vw3().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Real: $\\sum M_D = 0$ → $R_A = 45(7.5)/15 = 22.5$ k ↑, $R_D = 22.5$ k ↑, no horizontal reaction. Span C–D: $M = 22.5x - 1.5x^2$; overhang B–C carries no real moment; the column carries 22.5 k compression.
Virtual unit load ↓ at B: $R_A = 25/15 = 5/3$ ↑, $R_D = 2/3$ ↓; $m = -x$ on B–C, $m = -10(1 - x/15)$ on C–D, column $n = -5/3$.
$$\\Delta_B = \\frac{1}{EI}\\int_0^{15}(22.5x - 1.5x^2)\\left(-10 + \\tfrac{2}{3}x\\right)dx + \\frac{(-22.5)(-5/3)(10)}{EA} = \\frac{-4218.75}{EI} + \\frac{375}{EA}$$
Negative → **B moves up**: the load on C–D rotates joint C so that the cantilever tip lifts.`}</Md>
        <VWSolution model={f3} real={f3.loads} virtual={[P('B', 1)]} opts={o3} scale={12} resultUnit="in" what="ΔB (vertical, + down)" unitNote="EI = 30000×400/144 k-ft², EA = 300,000 k; ×12 for inches." />
      </div>
    ),
    notes: ['The small arrow drawn above B in the scan has no value — it is read as the (student) mark of the unit load, not a real load. Only the 3 k/ft on C–D is applied.', 'Supports read as: roller at A (vertical reaction), pin at D. Pencil numbers (22.5) on the scan agree with these reactions.'],
  },
  {
    id: '2016-17-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: 28,
    topics: ['cable'],
    title: 'Suspension bridge with hinged girder: hanger force, SFD & BMD',
    pages: [30, 32],
    text: `Determine the hanger force and draw the shear force and bending moment diagrams for the girders of the suspension bridge in Fig. 4: span 6 @ 100 ft = 600 ft between towers, cable sag 30 ft, five equally spaced hangers, stiffening girder pinned at the towers with a central hinge; 50 k at 100 ft and 40 k at 400 ft from the left tower.`,
    figure: () => <Figure model={m4} dims={[0, 100, 200, 300, 400, 500, 600]} />,
    checks: () => [
      { key: 'F', label: 'Hanger force', value: q4.Fh, unit: 'k' },
      { key: 'H', label: 'Horizontal cable tension', value: q4.Hc, unit: 'k' },
      { key: 'M100', label: 'Girder moment under the 50 k load', value: solve(g4).member('h1h2').M(0), unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`The cable is parabolic → the hangers (equal spacing) all carry the **same force** $F$ upward on the girder. Unknowns $A_y$, $C_y$, $F$: moment about the girder hinge for each half, plus vertical equilibrium.`}</Md>
        <Tex block>{`\\text{Left half: } 300A_y - 50(200) + F(200 + 100) = 0,\\qquad \\text{Right half: } 300C_y - 40(100) + F(100 + 200) = 0`}</Tex>
        <Tex block>{`A_y + C_y + 5F = 90 \\Rightarrow \\tfrac{14000}{300} + 3F = 90 \\Rightarrow F = \\mathbf{${fmt(q4.Fh, 3)}}\\text{ k},\\quad A_y = ${fmt(q4.Ay, 3)}\\text{ k},\\ C_y = ${fmt(q4.Cy, 3)}\\text{ k}`}</Tex>
        <Tex block>{`\\text{Cable: } H = \\frac{M_{mid}}{h} = \\frac{2.5F(300) - F(200+100)}{30} = ${fmt(q4.Hc, 2)}\\text{ k},\\quad T_{max} = \\sqrt{H^2 + (2.5F)^2} = ${fmt(q4.Tmax, 2)}\\text{ k}`}</Tex>
        <Md>{`The girder is now a beam on A and C with known loads (50 k, 40 k down; five hanger forces F up). The moment at the hinge (x = 300 ft) comes out zero — the check that F is right. (Same H as the uniform-load formula $H = M_0(\\text{hinge})/y = 6500/30$.)`}</Md>
        <FrameSolution model={g4} />
      </div>
    ),
    notes: ['Load positions read from the photo: 50 k at the first hanger (100 ft), 40 k at the fourth hanger (400 ft).', 'The girder is solved as a beam on the tower supports with the hanger forces applied; the central hinge condition (M = 0 at 300 ft) is what fixes F, and it is satisfied by the result.'],
  },
  {
    id: '2016-17-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: 28,
    topics: ['wheel'],
    title: 'Max moment at the quarter point of an 80 ft span (Fig. 5 train)',
    pages: [30, 32],
    text: `For the wheel loads in Fig. 5, find the maximum moment at the quarter point of a simply supported beam of 80 ft span. Wheels: 10, 10, 60, 60, 60, 60, 75, 75, 75, 75 k at spacings 5, 10, 5, 5, 5, 15, 5, 5, 5 ft, followed (5 ft behind the last wheel) by a uniform load of 5 k/ft.`,
    checks: () => [{ key: 'M', label: 'Max moment at 20 ft', value: trainExtremes(ild5, train5).max.value, unit: 'k-ft' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Moment ILD at a = 20 ft: triangle with peak $a(L-a)/L = 20(60)/80 = 15$ at the section. Criterion for the critical wheel: the average load on the left segment ≥ average load on the whole span when the wheel moves just past the section, i.e. $\\dfrac{W_{left}}{a} \\approx \\dfrac{W}{L}$. Try each wheel at the section (both directions) and keep the largest $\\sum P y$ (+ $w\\times$ ILD area under the uniform load).`}</Md>
        <TrainOnILD ild={ild5} t={train5} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="moment at quarter point" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2016-17-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: 28,
    topics: ['wheel'],
    title: 'Max shear at the third point of a 72 ft span (Fig. 5 train)',
    pages: [30, 32],
    text: `Compute the maximum shear at a one-third point of a simply supported beam of 72 ft span due to the wheel loads of Fig. 5 (10, 10, 60×4, 75×4 k + 5 k/ft trailing uniform load).`,
    checks: () => {
      const r = trainExtremes(ild6, train5)
      return [
        { key: 'vp', label: 'Max positive shear at 24 ft', value: r.max.value, unit: 'k' },
        { key: 'vn', label: 'Max negative shear at 24 ft', value: r.min.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at 24 ft: $-1/3$ just left, $+2/3$ just right of the section. For **max positive shear** bring the heavy part of the train onto the long (right) segment with a wheel just right of the section; each further step changes the shear by $\\Delta V = -P_{passing} + W\\,\\Delta x/L$ — stop when it turns negative. The negative maximum (train on the short segment) is also listed.`}</Md>
        <TrainOnILD ild={ild6} t={train5} span={[0, 72]} section={24} peak={{ x: 24, side: 1 }} what="shear at 24 ft" />
      </div>
    ),
    notes: ['"One-third point" taken as 24 ft from the left support (the other third point gives the same values by symmetry with the train reversed).'],
  },
  {
    id: '2016-17-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: 28,
    topics: ['wheel'],
    title: 'Max compression in truss diagonal "a" under a wheel train',
    pages: [30, 32],
    text: `Calculate the maximum compression in member **a** of the truss in Fig. 6 (6 panels @ 25 ft = 150 ft, height 20 ft; a is the diagonal of the third panel rising from the bottom chord to the top chord) for the wheel loads shown: 20, 50, 50, 50, 50, 60, 60, 60 k at spacings 12, 6, 6, 6, 12, 6, 6 ft followed 6 ft behind by 4 k/ft.`,
    figure: () => <Figure model={t7} labels />,
    checks: () => [{ key: 'c', label: 'Max force in a (compression −)', value: trainExtremes(ild7(), train7).min.value, unit: 'k' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Loads reach the truss at the bottom panel points. Cut panel L2–L3: the vertical component of $a$ balances the panel shear, $F_a\\sin\\theta = -V_{panel}$ ($\\sin\\theta = 20/32.02$). So the ILD of $F_a$ is the panel-shear ILD scaled by $-1/\\sin\\theta$: **compression** while the load is right of the panel, a small tension part when it is left, with a straight line across the panel. Run the train over the compression part.`}</Md>
        <ILDStack model={t7} path={p7} items={[{ label: 'F_a', resp: { kind: 'force', member: 'a' } }]} />
        <TrainOnILD ild={ild7()} t={train7} span={[0, 150]} what="force in a" />
      </div>
    ),
    notes: ['Through truss with loads on the bottom-chord panel points (floor system).', 'Diagonal pattern read from the photo: U1–L2, L2–U3 (= a), U3–L4, L4–U5, verticals at every panel point.'],
  },
  {
    id: '2016-17-B8a',
    paper: PAPER,
    sec: 'B',
    no: '8(a)',
    marks: 24,
    topics: ['truss'],
    title: 'Pin-jointed truss: forces in 18, 26, 35, 56',
    pages: [30, 32],
    text: `For the pin-jointed truss in Fig. 7 determine the forces in members **18, 26, 35 and 56**. Bottom joints 1 (pin), 2, 3 (roller) at 0, 10, 20 ft; top joints 8, 7, 6, 5, 4 at 0, 5, 10, 15, 20 ft, height 10 ft. Members: 1–8, 8–7–6–5–4, 4–3, 1–7, 7–2, 2–6, 2–5, 5–3, 1–2–3. Loads: 10 k → at 8, 12 k ↓ at 7 and 5, 30 k ↓ at 2.`,
    figure: () => <Figure model={t8} />,
    checks: () => {
      const r = solve(t8)
      return ['18', '26', '35', '56'].map((id) => ({ key: 'f' + id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Reactions: $\\sum M_1 = 0$: $20R_3 = 12(5) + 30(10) + 12(15) + 10(10)$ → $R_3 = 32$ k; $R_{1y} = 54 - 32 = 22$ k, $R_{1x} = 10$ k ←.
- Joint 8 (bars 8–1 vertical, 8–7 horizontal): $F_{18} = 0$ by vertical equilibrium, $F_{87} = -10$ k.
- Joint 4: bars 4–5 and 4–3 are zero-force.
- Joint 3: vertical $F_{35}\\sin\\theta + 32 = 0$ with $\\sin\\theta = 10/11.18$ → $F_{35}$; then joint 5 gives $F_{56}$, joint 6 gives $F_{26}$ (vertical bar, only member with a vertical component at 6).`}</Md>
        <TrussSolution model={t8} asked={['18', '26', '35', '56']} />
      </div>
    ),
    notes: ['The 10 k horizontal load is read as acting at the top-left joint 8 (arrow drawn at that level).'],
  },
  {
    id: '2016-17-B8b',
    paper: PAPER,
    sec: 'B',
    no: '8(b)',
    marks: 22.67,
    topics: ['cable'],
    title: 'Three-hinged parabolic arch: N, V, M at D (UDL on the left half)',
    pages: [31, 33],
    text: `A three-hinged parabolic arch has span 16 m and rise 4 m; $y = 4h(Lx - x^2)/L^2$ with the origin at the left support. A uniformly distributed load of 12 kN/m acts on the left half (Fig. 8). Calculate the normal force, shear force and bending moment at point D, 6 m from the left support.`,
    figure: () => <Figure model={m8} lenUnit=" m" forceUnit=" kN" dims={[0, 6, 8, 16]} />,
    checks: () => {
      const r = a8()
      return [
        { key: 'N', label: 'Normal force at D (compression +)', value: r.N, unit: 'kN' },
        { key: 'V', label: 'Radial shear at D', value: r.Q, unit: 'kN', magnitude: true },
        { key: 'M', label: 'Bending moment at D', value: r.M, unit: 'kN-m' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Vertical reactions as for a simple beam: $V_A = 96(12)/16 = 72$ kN, $V_B = 24$ kN. Crown hinge C (x = 8): $M_C = 0$ → $V_B(8) - H(4) = 0$ → $H = 48$ kN. At D: $y_D = 3.75$ m, $\\tan\\theta = 4h(L-2x)/L^2 = 0.25$. Beam shear at D $= 72 - 12(6) = 0$, beam moment $= 72(6) - 12(6^2)/2 = 216$ kN-m. Then
$$M_D = 216 - 48(3.75),\\quad N = V\\sin\\theta + H\\cos\\theta,\\quad Q = V\\cos\\theta - H\\sin\\theta$$`}</Md>
        <ArchSolution {...arch} at={6} />
      </div>
    ),
  },
  {
    id: '2016-17-B9a',
    paper: PAPER,
    sec: 'B',
    no: '9(a)',
    marks: 28.67,
    topics: ['vertical'],
    title: 'Approximate analysis for vertical loads: set-back building frame',
    pages: [31, 33],
    text: `Draw the axial force, shear force and bending moment diagrams for the building frame of Fig. 9 under vertical loads (approximate method). Column lines at 0, 12, 22, 32 ft. Ground storey 12 ft with four columns (three fixed bases, the right one pinned); two upper storeys of 10 ft with three columns. First-floor girders: 2 k/ft (12 ft and 10 ft bays) and 1 k/ft (right 10 ft bay); second floor: 2 k/ft; roof: 1 k/ft.`,
    figure: () => <Figure model={v9.m} dimY />,
    checks: () => {
      const ef = v9.beamRes.find((b) => b.id === 'EF')!
      const bf = v9.colRes.find((c) => c.id === 'BF')!
      const ae = v9.colRes.find((c) => c.id === 'AE')!
      return [
        { key: 'mend', label: 'Girder EF end moment (hogging)', value: ef.Mend, unit: 'k-ft' },
        { key: 'mmid', label: 'Girder EF midspan moment', value: ef.Mmid, unit: 'k-ft' },
        { key: 'nbf', label: 'Axial force in ground column BF (C −)', value: bf.N, unit: 'k' },
        { key: 'mae', label: 'Moment at top of column AE (magnitude)', value: Math.abs(ae.Mtop), unit: 'k-ft' },
      ]
    },
    solution: () => <V9Solution />,
    notes: [
      'Approximate assumptions used: inflection points at 0.1L from each girder end (→ end moment 0.045wL², midspan 0.08wL²), zero girder axial force; the unbalanced girder moment at a joint is shared by the columns above and below in proportion to I/h (equal I); a fixed base receives half of the column-top moment (carry-over), a pinned base zero. This is the same rule set as the dashboard’s vertical-load engine, applied here by hand because the frame is irregular (set-back).',
      'Figure read: right column (x = 32 ft) exists only in the ground storey and has a pinned base; the 1 k/ft load is on the right first-floor bay.',
    ],
  },
  {
    id: '2016-17-B9b',
    paper: PAPER,
    sec: 'B',
    no: '9(b)',
    marks: 18,
    topics: ['truss'],
    title: 'X-braced truss, tension-only diagonals: x, y, z',
    pages: [31, 33],
    text: `Determine the bar forces in members **x, y and z** of the truss in Fig. 10, assuming the diagonals cannot support compression. Three panels of 10 ft, height 10 ft, crossed diagonals in every panel; roller at the bottom-left, pin at the bottom-right. Loads 10 k ↓ at each top joint and 20 k → at the top-right joint. z = left end vertical, y = top chord of the middle panel, x = the diagonal of the right panel rising to the top-right joint.`,
    figure: () => <Figure model={t9} labels />,
    checks: () => {
      const f = xb9().forces
      return [
        { key: 'x', label: 'Force in x (T +)', value: f.get('x')!, unit: 'k' },
        { key: 'y', label: 'Force in y (T +, C −)', value: f.get('y')!, unit: 'k' },
        { key: 'z', label: 'Force in z (T +, C −)', value: f.get('z')!, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`With compression diagonals buckling out, each panel has **one active diagonal** — the one that would be in tension — and the truss becomes determinate. Reactions: $\\sum M_a$: $30R_d = 10(10 + 20 + 30) + 20(10)$ → $R_d = 26.67$ k, $R_a = 13.33$ k, $H_d = 20$ k ←. Panel shears decide the active diagonal (the one whose vertical component opposes the shear in tension); then the method of sections / joints gives the chord and vertical forces.`}</Md>
        <TrussSolution model={t9} forces={xb9().forces} asked={['x', 'y', 'z']} note={`Inactive (compression) diagonals set to zero: ${xb9().removed.join(', ')}.`} />
      </div>
    ),
    notes: ['Supports read from the photo: roller (circle) at bottom-left, pin at bottom-right.'],
  },
  {
    id: '2016-17-B10a',
    paper: PAPER,
    sec: 'B',
    no: '10(a)',
    marks: 18,
    topics: ['ild'],
    title: 'Overhanging beam ILDs: R_B, V just left of D, M_C',
    pages: [31, 33],
    text: `Draw influence lines for (a) the reaction at B, (b) the shear just left of D and (c) the moment at C of the beam in Fig. 11: A (free end) – 8 ft – B (pin) – 10 ft – C – 5 ft – D (roller) – 6 ft – E (free end).`,
    figure: () => <Figure model={b10} />,
    checks: () => [
      { key: 'rbA', label: '$R_B$ ordinate at A', value: ildAt(ild10.RB(), 0) },
      { key: 'vdE', label: '$V_{D^-}$ ordinate at E', value: ildAt(ild10.VD(), 29) },
      { key: 'mc', label: '$M_C$ peak ordinate', value: ildExtremes(ild10.MC()).max.y, unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Simple span B–D = 15 ft with overhangs 8 ft (A) and 6 ft (E). With x from A:
- $R_B = (23 - x)/15$: 1 at B, 0 at D, extended straight over both overhangs ($23/15 = 1.533$ at A, $-6/15 = -0.4$ at E).
- $V_{D^-}$: load left of the section: $V = R_B - 1 = -R_D$; load right of D: $V = R_B$. So $-x'/15$-type line from 0 at B to $-1$ just left of D, then a jump to 0 and $R_B$ on the overhang D–E; on A–B it is $R_B - 1$ (positive).
- $M_C$ (C 10 ft from B, 5 ft from D): triangle with peak $10\\times5/15 = 3.33$ at C, extended linearly to negative values on both overhangs.`}</Md>
        <ILDStack
          model={b10}
          path={p10}
          items={[
            { label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } },
            { label: 'V just left of D', resp: { kind: 'shear', member: 'CD', x: 5, side: -1 } },
            { label: 'M_C', resp: { kind: 'moment', member: 'CD', x: 0 } },
          ]}
        />
      </div>
    ),
    notes: ['Supports read from the photo: pin at B, roller at D; A and E are free overhang ends.'],
  },
  {
    id: '2016-17-B10b',
    paper: PAPER,
    sec: 'B',
    no: '10(b)',
    marks: 28.67,
    topics: ['lateral'],
    title: 'Portal method: unequal bays 20 ft + 10 ft',
    pages: [31, 33],
    text: `Draw the shear force and bending moment diagrams of the beams and columns of the building frame in Fig. 12 using the portal method. Bays 20 ft and 10 ft; ground storey 12 ft, top storey 10 ft; fixed bases. 20 k at the first floor and 10 k at the roof, both acting to the right at the left end.`,
    figure: () => <ApproxFig g={g10} />,
    checks: () => {
      const r = portalMethod(g10)
      return [
        { key: 'vi', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'mb1', label: 'First-floor left beam end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'vb1', label: 'First-floor left beam shear', value: r.beams[0][0].shear, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Portal method: hinges at mid-height of columns and mid-span of beams; interior column shear = 2 × exterior. Storey shears: top 10 k (2.5, 5, 2.5), ground 30 k (7.5, 15, 7.5). Beam end moments from joint equilibrium (left → right); beam shear $= 2M/L$, so the short 10 ft bay has a larger shear for the same moment. Unequal bays do not change the column-shear split in the portal method.`}</Md>
        <ApproxSolution g={g10} method="portal" kinds={['M', 'V']} />
      </div>
    ),
  },
  {
    id: '2016-17-B11a',
    paper: PAPER,
    sec: 'B',
    no: '11(a)',
    marks: 30.67,
    topics: ['lateral'],
    title: 'Cantilever method: 3-storey set-back frame (A, 2A, A)',
    pages: [31, 33],
    text: `Using the cantilever method, draw the bending moment diagrams of the beams and columns of the building frame in Fig. 13. Column lines at 0, 15, 25 ft; storey heights 12 ft (ground), 10 ft, 10 ft. The two lower storeys have three columns with relative areas A, 2A, A; the top storey has only the two left columns (A, A) and one 15 ft roof beam. Loads 20 k at the first floor, 20 k at the second floor and 10 k at the roof, acting to the right at the left end. Fixed bases.`,
    figure: () => <StructureView model={m11} autoDimX autoDimY memberLabels maxHeight={280} />,
    checks: () => {
      const r = cantileverMethod(g11)
      return [
        { key: 'xbar1', label: 'Centroid of column areas, lower storeys (from left)', value: r.overturning![0].xbar, unit: 'ft' },
        { key: 'n1', label: 'Axial force, left ground column AD (T +)', value: r.columns[0][0].axial, unit: 'k' },
        { key: 'mb1', label: 'First-floor beam DE end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'mc1', label: 'Moment at top of left ground column', value: r.columns[0][0].mTop, unit: 'k-ft' },
      ]
    },
    solution: () => <C11Solution />,
    notes: ['The set-back top storey is handled by giving the missing top-right column zero area: it then takes no axial force, and the missing roof beam no shear, so the results equal those of the real two-column top storey.', 'Relative areas read from the photo: A, 2A, A in the two lower storeys; A, A in the top storey.'],
  },
  {
    id: '2016-17-B11b',
    paper: PAPER,
    sec: 'B',
    no: '11(b)',
    marks: 16,
    topics: ['floor'],
    title: 'Warren truss: ILDs for bar forces a and b',
    pages: [31, 33],
    text: `For the truss in Fig. 14 (Warren truss of equilateral triangles, three bottom panels of 20 ft, pin at left, roller at right), draw influence line diagrams for the bar forces in **a** (middle bottom-chord panel) and **b** (left top-chord member).`,
    figure: () => <Figure model={t11} labels />,
    checks: () => {
      const a = influenceLine(t11, p11, { kind: 'force', member: 'a' })
      const b = influenceLine(t11, p11, { kind: 'force', member: 'b' })
      return [
        { key: 'a', label: 'Max ordinate of $F_a$ (tension)', value: ildExtremes(a).max.y },
        { key: 'b', label: 'Min ordinate of $F_b$ (compression)', value: ildExtremes(b).min.y },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Height $h = 20\\sin60° = ${fmt(hW, 3)}$ ft. Loads at the bottom panel points, so the ILDs are straight between panel points.
- **a** (bottom chord L1–L2): moment centre = top joint U2 (x = 30 ft): $F_a = M_{30}/h$ (tension). Unit load at L1 or L2 gives $M_{30} = 10$ → $F_a = 10/${fmt(hW, 3)} = ${fmt(10 / hW, 4)}$.
- **b** (top chord U1–U2): moment centre = bottom joint L1 (x = 20 ft): $F_b = -M_{20}/h$ (compression). Unit load at L1: $M_{20} = 13.33$ → $${fmt(-13.333 / hW, 4)}$; at L2: $M_{20} = 6.67$.`}</Md>
        <ILDStack
          model={t11}
          path={p11}
          items={[
            { label: 'F_a', resp: { kind: 'force', member: 'a' } },
            { label: 'F_b', resp: { kind: 'force', member: 'b' } },
          ]}
        />
      </div>
    ),
    notes: ['Loading assumed on the bottom-chord panel points (deck truss loading is not stated).'],
  },
]

// ---------------------------------------------------------------- local components
function ApproxFig({ g }: { g: GridFrame }) {
  return <StructureView model={gridModel(g)} forceUnit="k" lenUnit="′" autoDimX autoDimY memberLabels maxHeight={260} />
}

function C11Solution() {
  const r = c11()
  return (
    <div className="space-y-3 text-sm">
      <Md>{`Cantilever method: inflection points at mid-height of columns and mid-span of beams; column axial stress ∝ distance from the centroid of the column areas in that storey.
- Lower two storeys (A, 2A, A at 0, 15, 25 ft): $\\bar x = (0 + 30 + 25)/4 = 13.75$ ft.
- Top storey (A, A at 0, 15 ft): $\\bar x = 7.5$ ft.
At each inflection plane: overturning moment of the loads above → $N_j = M A_j d_j/\\sum A d^2$ (left columns in tension); beam shears from vertical equilibrium of the joints, beam moments $= VL/2$, column moments from the joints from the top down.`}</Md>
      <ApproxTables r={r} />
      <div className="grid md:grid-cols-2 gap-2">
        {(['M', 'N'] as const).map((k) => (
          <div key={k} className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs font-semibold text-mute">{k === 'M' ? 'BMD (beams and columns)' : 'AFD'}</div>
            <DiagramView model={m11} members={r.diagrams} kind={k} />
          </div>
        ))}
      </div>
    </div>
  )
}

function V9Solution() {
  const { m, beamRes, colRes, joints, dms } = v9
  return (
    <div className="space-y-3 text-sm">
      <Md>{`**Approximate method for vertical loads.** Each girder is assumed to have inflection points at $0.1L$ from both ends and no axial force, so the middle $0.8L$ is a simple beam:
$$M_{mid} = \\frac{w(0.8L)^2}{8} = 0.08wL^2,\\qquad M_{end} = 0.4wL(0.1L) + \\frac{w(0.1L)^2}{2} = 0.045wL^2,\\qquad V_{end} = 0.5wL$$
At every joint the **unbalanced** girder end moment is resisted by the columns, shared in proportion to their stiffness $I/h$ (equal I). A fixed base receives half of the column-top moment, a pinned base none. Column axial force = sum of the girder end shears above.`}</Md>
      <div className="overflow-x-auto">
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Girder</th>
              <th>w (k/ft)</th>
              <th>L (ft)</th>
              <th>M end = 0.045wL²</th>
              <th>M mid = 0.08wL²</th>
              <th>V end = 0.5wL</th>
            </tr>
          </thead>
          <tbody>
            {beamRes.map((b) => (
              <tr key={b.id}>
                <td className="txt font-semibold">{b.id}</td>
                <td>{fmt(b.w)}</td>
                <td>{fmt(b.L)}</td>
                <td>{fmt(b.Mend)}</td>
                <td>{fmt(b.Mmid)}</td>
                <td>{fmt(b.V)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Joint</th>
              <th>M girder left</th>
              <th>M girder right</th>
              <th>Unbalanced</th>
              <th>to column below</th>
              <th>to column above</th>
            </tr>
          </thead>
          <tbody>
            {joints.map((j) => (
              <tr key={j.n}>
                <td className="txt font-semibold">{j.n}</td>
                <td>{fmt(j.left)}</td>
                <td>{fmt(j.right)}</td>
                <td>{fmt(Math.abs(j.unb))}</td>
                <td>{j.below ? `${fmt(Math.abs(j.cb))} (${j.below})` : '—'}</td>
                <td>{j.above ? `${fmt(Math.abs(j.ca))} (${j.above})` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Column</th>
              <th>h</th>
              <th>M bottom (k-ft)</th>
              <th>M top</th>
              <th>Shear (k)</th>
              <th>Axial (k, C −)</th>
            </tr>
          </thead>
          <tbody>
            {colRes.map((c) => (
              <tr key={c.id}>
                <td className="txt font-semibold">{c.id}</td>
                <td>{fmt(c.h)}</td>
                <td>{fmt(c.Mbot)}</td>
                <td>{fmt(c.Mtop)}</td>
                <td>{fmt(c.V)}</td>
                <td>{fmt(c.N)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint">Column moments in the bottom→top member axis, sagging (+) = tension on the right face.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        {(['N', 'V', 'M'] as const).map((k) => (
          <div key={k} className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs font-semibold text-mute">{k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD'}</div>
            <DiagramView model={m} members={dms} kind={k} />
          </div>
        ))}
      </div>
    </div>
  )
}

void ([] as Model[])
