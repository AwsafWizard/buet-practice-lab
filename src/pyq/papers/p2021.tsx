// 2021-22 term final (held 6 Apr 2023) — scan pages 51–57.
import type { PYQ } from '../types'
import type { Load, Model } from '../../engine/model'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { sdc } from '../../engine/eq'
import { classifyEnclosure, kzt, storeyForces } from '../../engine/wind'
import { cantileverMethod, gridModel, portalMethod, xBraced, type GridFrame } from '../../engine/approx'
import { trainExtremes, ssShearILD, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { stiffenedSuspension } from '../../engine/cable'
import { virtualWork } from '../../engine/vw'
import { beamOf, floorSystem, H, Mo, model, P, Pm, truss, W, Wn } from '../../kit/builders'
import { ApproxSolution, Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { buildingFloors, EQSolution, eqResult, KztSolution, WindAnalytical } from '../../kit/loads'
import { FnPlot, SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'

const PG = { A1: [51], A2: [52], A3a: [52], A3b: [53], A4a: [53, 56], A4bc: [54], B: [54, 55, 57] }
const E = 29000

// ---------------------------------------------------------------- Q1(a) truss lifted on a jack at b
const t1a = truss('a:0,0 b:40,0 c:80,0 d:20,25 e:60,25', 'a-b b-c a-d d-e e-c d-b b-e', 'a:pin c:roller')
const EA1 = 4 * E // kip (A = 4 in²)
const q1a = (() => {
  // difference force system: Rc = 40 removed (40 k down at c), jack J up at b, ΔRa at a
  const J = (40 * 80) / 40
  const dRa = 40 - J // change of Ra (negative = Ra decreases)
  const real: Load[] = [{ kind: 'node', node: 'b', fy: J, label: `J = ${J}k` }]
  const virt: Load[] = [{ kind: 'node', node: 'b', fy: 1, label: '1' }]
  const vw = virtualWork(t1a, real, virt, { EA: () => EA1 })
  const elastic = vw.total * 12 // in, upward, relative to chord a–c
  const rigid = (40 / 80) * 1 // in, c lifted 1 in about the pin at a
  return { J, dRa, real, virt, vw, elastic, rigid, db: elastic + rigid }
})()

// ---------------------------------------------------------------- Q1(b) overhanging beam, deflected shape
const EI1b = (E * 200) / 144 // k-ft²
const b1b = beamOf('a:0 b:4:roller c:12 d:20:pin', [P('a', 5, '5k'), W('bc', 1, { label: '1 k/ft' }), W('cd', 1)])
const vw1b = (node: string) => virtualWork(b1b, b1b.loads, [P(node, 1)], { EI: () => EI1b })
// fine model (1-ft stations) for the elastic curve plot
const b1bFine = (() => {
  const st: string[] = []
  for (let x = 0; x <= 20; x++) st.push(`n${x}:${x}${x === 4 ? ':roller' : x === 20 ? ':pin' : ''}`)
  const m = beamOf(st.join(' '))
  const loads: Load[] = [P('n0', 5)]
  for (let x = 4; x < 20; x++) loads.push(W(`n${x}n${x + 1}`, 1))
  return { ...m, loads, EI: EI1b } as Model
})()
const curve1b = () => {
  const r = solve(b1bFine)
  const uy = Array.from({ length: 21 }, (_, x) => r.disp(`n${x}`).uy * 12)
  return (x: number) => {
    const i = Math.min(19, Math.max(0, Math.floor(x)))
    return uy[i] + (uy[i + 1] - uy[i]) * (x - i)
  }
}

// ---------------------------------------------------------------- Q2(a) three-hinged frame, rotation just left of e
const EI2a = (E * 3000) / 144
// hinge at e modelled as a release on the e-end of member e–c only, so node e carries the rotation of b–e
const f2a = model('a:0,0 b:0,12 e:8,12 c:16,12 d:16,0', 'a-b b-e oe-c c-d', 'a:pin d:pin', [P('e', 50, '50k')], { EI: EI2a })
const vw2a = () => virtualWork(f2a, f2a.loads, [Mo('e', 1, '1 k-ft')], { EI: () => EI2a })

// ---------------------------------------------------------------- Q2(b) stiffening truss under a parabolic cable
const L2b = 360,
  h2b = 30,
  Pl2b = { x: 210, P: 50 }
const s2b = () => stiffenedSuspension({ L: L2b, h: h2b, xh: 180, loads: [Pl2b] })
const t2bSpec = (() => {
  const ns: string[] = []
  for (let k = 0; k <= 12; k++) ns.push(`L${k}:${30 * k},0`)
  for (const k of [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]) ns.push(`U${k}:${30 * k},20`)
  const ms: string[] = []
  for (let k = 0; k < 12; k++) ms.push(`L${k}-L${k + 1}`)
  for (const k of [1, 2, 3, 4, 7, 8, 9, 10]) ms.push(`U${k}-U${k + 1}`)
  for (const k of [1, 2, 3, 4, 5, 7, 8, 9, 10, 11]) ms.push(`U${k}-L${k}`)
  ms.push('ac=L0-U1', 'U1-L2', 'L2-U3', 'U3-L4', 'L4-U5', 'U5-L6', 'L6-U7', 'U7-L8', 'L8-U9', 'U9-L10', 'L10-U11', 'U11-L12')
  return { ns: ns.join(' '), ms: ms.join(' ') }
})()
const HANGERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => (k === 6 ? 'L6' : `U${k}`))
/** truss loaded by 50 k and the (equal) hanger pulls; a dummy top chord U5–U7 makes it solvable — its force must come out zero (hinge) */
const t2b = () => {
  const T = s2b().q * 30
  const loads: Load[] = [P('L7', 50, '50k'), ...HANGERS.map((n) => ({ kind: 'node' as const, node: n, fy: T }))]
  const m = truss(t2bSpec.ns, t2bSpec.ms + ' dummy=U5-U7', 'L0:pin L12:roller', loads)
  return { m, T, r: solve(m) }
}
const t2bFig = (() => {
  const m = truss(t2bSpec.ns, t2bSpec.ms, 'L0:pin L12:roller', [P('L7', 50, '50k')])
  const cy = (x: number) => 50 - (4 * h2b * x * (L2b - x)) / (L2b * L2b)
  for (let k = 0; k <= 12; k++) m.nodes.push({ id: `K${k}`, x: 30 * k, y: cy(30 * k), label: '' })
  for (let k = 0; k < 12; k++) m.members.push({ id: `K${k}K${k + 1}`, i: `K${k}`, j: `K${k + 1}`, style: 'cable' })
  HANGERS.forEach((n, i) => m.members.push({ id: `h${i}`, i: `K${i + 1}`, j: n, style: 'thin' }))
  m.supports.push({ node: 'K0', type: 'pin' }, { node: 'K12', type: 'pin' })
  for (const n of m.nodes) if (n.id !== 'L0' && n.id !== 'U1' && n.id !== 'L6' && !n.id.startsWith('K')) n.label = ''
  m.nodes.find((n) => n.id === 'L0')!.label = 'a'
  m.nodes.find((n) => n.id === 'U1')!.label = 'c'
  m.nodes.find((n) => n.id === 'L6')!.label = 'hinge'
  return m
})()

// ---------------------------------------------------------------- Q3(a) EQ, Chittagong office
const floors3 = buildingFloors({ area: 400, DL: 6, LL: 2.4, roofLL: 1, storeys: 3, h: 3, base: 1.5, pedestal: 100 })
const eq3 = { Z: 0.28, I: 1, occ: 2 as const, site: 'SB' as const, system: 'SMF_rc' as const, hn: 10.5, eta: 1.2, floors: floors3 }
const sdc3 = sdc('SB', 3, 2)

// ---------------------------------------------------------------- Q3(b) enclosure
const encl = classifyEnclosure(
  [
    { wall: 'windward', gross: 400, open: 30 * 7 },
    { wall: 'leeward', gross: 400, open: 3 * 7 + 2 * (2 * 4) },
    { wall: 'side1', gross: 400, open: 3 * 7 + 2 * (2 * 4) },
    { wall: 'side2', gross: 400, open: 3 * 7 + 2 * (2 * 4) },
  ],
  4,
)

// ---------------------------------------------------------------- Q4(a) Kzt at the top of a 6-storey building
const kzt4a = { hill: 'escarpment' as const, exp: 'C' as const, H: 30, Lh: 35, x: 25, downwind: true, z: 60 }

// ---------------------------------------------------------------- Q4(b) beam with hinges at C and D
const b4b = beamOf('A:0:roller B:40:pin C*:60 H:90 D*:120 E:150:roller F:210:roller')
const p4b = { kind: 'members' as const, members: b4b.members.map((m) => m.id) }
const r4b = {
  RE: { kind: 'reaction' as const, node: 'E', comp: 'y' as const },
  VB: { kind: 'shear' as const, member: 'AB', x: 40, side: -1 as const },
  MH: { kind: 'moment' as const, member: 'HD', x: 0 },
}

// ---------------------------------------------------------------- Q4(c) velocity pressure, Comilla
const w4c = { V: 61.4, exp: 'B' as const, occ: 2 as const, G: 0.85, B: 40, L: 40, levels: [4, 8, 12] }

// ---------------------------------------------------------------- Q5 frame with internal hinge at C
const f5 = model('A:0,0 B:0,16 C*:24,16 D:36,0', 'A-B B-C D-C', 'A:pin D:pin', [Pm('BC', 8, 10, '10k'), Pm('BC', 16, 10, '10k'), Wn('DC', 4, undefined, { label: '4 k/ft' })])

// ---------------------------------------------------------------- Q6 portal method, reverse problem
const SH6 = { top: [4, 8, 4], bot: [9, 18, 9] }
const P1 = SH6.top.reduce((a, b) => a + b, 0)
const P2 = SH6.bot.reduce((a, b) => a + b, 0) - P1
const g6: GridFrame = { xs: [0, 16, 36], heights: [12, 10], loads: [P2, P1], loadSide: ['right', 'right'] }

// ---------------------------------------------------------------- Q7 X-braced truss (diagonals share the panel shear)
const t7 = truss(
  'A:0,0 B:10,0 C:0,10 D:10,10 E:0,20 F:10,20 G:0,30',
  'A-B A-C B-D C-D C-E D-F E-F E-G G-F A-D B-C C-F D-E',
  'A:pin B:roller',
  [H('G', 16, '16k'), H('E', 20, '20k'), H('C', 20, '20k')],
)
const x7 = () => xBraced(t7, [['AD', 'BC'], ['CF', 'DE']], 'both').forces
const ASK7 = ['AC', 'AD', 'CD', 'DE', 'CE', 'DF', 'EG', 'GF']

// ---------------------------------------------------------------- Q8 roof truss ILDs (load on the bottom chord)
const t8 = truss(
  'L1:0,0 L2:12,0 L3:24,0 L4:36,0 L5:48,0 U2:12,12 U3:24,20 U4:36,12',
  'L1-L2 L2-L3 L3-L4 L4-L5 L1-U2 U2-U3 U3-U4 U4-L5 U2-L2 U3-L3 U4-L4 U2-L3 L3-U4',
  'L1:pin L5:roller',
)
const p8 = { kind: 'panel' as const, nodes: ['L1', 'L2', 'L3', 'L4', 'L5'] }
const ild8 = (m: string) => influenceLine(t8, p8, { kind: 'force', member: m })

// ---------------------------------------------------------------- Q9 floor-beam system
const fs9 = floorSystem({
  floorBeams: [0, 20, 55, 85],
  stringers: [
    [-10, 35],
    [35, 85],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 85, type: 'roller' },
  ],
  names: { 0: 'a', 20: 'b', 55: 'c', 85: 'd' },
})
const ild9 = (r: ReturnType<typeof fs9.fbr>) => influenceLine(fs9.model, fs9.path, r)

// ---------------------------------------------------------------- Q10 wheel loads, shear at L/3 of a 72 ft span
const train10: Train = { P: [10, 10, 20, 20, 20, 20, 35, 35], gaps: [10, 12, 15, 12, 12, 12, 12] }
const ild10 = ssShearILD(72, 24)

// ---------------------------------------------------------------- Q11 cantilever method
const g11: GridFrame = { xs: [0, 15, 35], heights: [12, 10], loads: [-30, -20], loadSide: ['left', 'left'], areas: [[1, 2, 1], [1, 2, 1]] }

export const Q2021: PYQ[] = [
  {
    id: '2021-22-A1a',
    paper: '2021-22',
    sec: 'A',
    no: '1(a)',
    marks: 23.67,
    topics: ['vw'],
    title: 'Truss lifted on a hydraulic jack at b',
    pages: PG.A1,
    text: `For the repair of the right abutment of a truss bridge, the truss in Fig. 1 had to be supported temporarily at joint **b** on a hydraulic jack. The gross reaction at **a** is 60 kip and at **c** is 40 kip. Compute the displacement at **b** caused by the jack to free the support at **c** and lift it (joint c) **1 inch** above its normal position. Each member: $A = 4$ in², $E = 29000$ ksi.

Geometry (Fig. 1): bottom chord a–b–c, 2 panels of 40 ft; top chord d–e = 40 ft at a height of 25 ft (d above x = 20 ft, e above x = 60 ft); members a-d, d-e, e-c, d-b, b-e. a = pin, c = roller.`,
    figure: () => <Figure model={t1a} />,
    checks: () => [
      { key: 'J', label: 'Jack force at b', value: q1a.J, unit: 'k' },
      { key: 'el', label: 'Elastic part of the lift at b (relative to chord a–c)', value: q1a.elastic, unit: 'in', tol: 0.02 },
      { key: 'db', label: 'Total upward displacement of b', value: q1a.db, unit: 'in', tol: 0.02 },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Idea.** The self-weight already acts and is already carried by a and c — it causes no *new* deformation. What changes are the **support forces**: $R_c = 40$ k is removed, the jack pushes up with $J$ at b and $R_a$ changes. These changes form a self-equilibrated force set that strains the truss, plus a rigid-body rotation about the pin at a that lifts c by 1 in.`}</Md>
        <Tex block>{`\\sum M_a = 0:\\ J(40) - 40(80) = 0 \\Rightarrow J = ${fmt(q1a.J)}\\text{ k},\\qquad \\Delta R_a = 40 - J = ${fmt(q1a.dRa)}\\text{ k (}R_a\\text{ drops from 60 to ${fmt(60 + q1a.dRa)} k)}`}</Tex>
        <Md>{`**Elastic part.** Relative to the chord a–c the difference system is a simple truss a–c with **${fmt(q1a.J)} k upward at b** (the 40 k at a and 40 k at c act as its reactions). Apply a virtual unit load upward at b: $n = N/${fmt(q1a.J)}$, so $\\delta = \\sum \\dfrac{N n L}{AE}$, $AE = 4\\times29000 = ${fmt(EA1)}$ k.`}</Md>
        <VWSolution model={t1a} real={q1a.real} virtual={q1a.virt} opts={{ EA: () => EA1 }} scale={12} resultUnit="in" what="δ_b (elastic, ↑)" unitNote="N, n in kip; L in ft; result in ft × 12 = in." />
        <Md>{`**Rigid-body part.** a stays on its pin and c is raised 1 in, so the chord rotates about a: at b (40 ft of 80 ft) $\\delta = \\tfrac{40}{80}(1) = ${fmt(q1a.rigid, 3)}$ in ↑.`}</Md>
        <Tex block>{`\\Delta_b = ${fmt(q1a.elastic, 4)} + ${fmt(q1a.rigid, 3)} = \\mathbf{${fmt(q1a.db, 3)}}\\text{ in}\\ \\uparrow`}</Tex>
      </div>
    ),
    notes: ['Top-chord joints d and e read at x = 20 ft and 60 ft (top chord 40 ft centred on the 80 ft span), height 25 ft.', 'The deformation due to self-weight already existed before jacking, so only the change in support forces is applied.'],
  },
  {
    id: '2021-22-A1b',
    paper: '2021-22',
    sec: 'A',
    no: '1(b)',
    marks: 23,
    topics: ['vw'],
    title: 'Overhanging beam: deflections at a and c, deflected shape',
    pages: PG.A1,
    text: `Plot the deflected shape of the loaded beam in Fig. 2 with the deflection values determined at points **a** and **c**, using the virtual work method (bending strain energy only). $E = 29000$ ksi, $I = 200$ in⁴, $\\vartheta = 0.3$.

Fig. 2: free end **a** carries 5 k; roller at **b** (4 ft from a); **c** is 8 ft right of b; pin at **d** 8 ft right of c. Uniform load 1 k/ft on b–d.`,
    figure: () => <Figure model={b1b} />,
    checks: () => [
      { key: 'a', label: 'Deflection at a (+ down, − up)', value: vw1b('a').total * 12, unit: 'in', tol: 0.03 },
      { key: 'c', label: 'Deflection at c (+ down)', value: vw1b('c').total * 12, unit: 'in', tol: 0.03 },
    ],
    solution: () => {
      const da = vw1b('a').total * 12
      const dc = vw1b('c').total * 12
      const f = curve1b()
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Real system.** $\\sum M_d = 0$: $R_b(16) = 16(8) + 5(20) \\Rightarrow R_b = 14.25$ k, $R_d = 21 - 14.25 = 6.75$ k. $M_b = -5(4) = -20$ k-ft (hogging), $M_c = 6.75(8) - 1(8)^2/2 = 22$ k-ft (sagging). $EI = 29000(200)/144 = ${fmt(EI1b, 1)}$ k-ft².`}</Md>
          <Md>{`**Deflection at a** — unit load ↓ at a: $m$ goes from 0 at a to −4 at b and back to 0 at d.
$$\\int\\frac{Mm}{EI} = \\frac{1}{EI}\\left[\\int_0^4 (-5x)(-x)dx + \\int_0^{16}\\left(6.75s - \\tfrac{s^2}{2}\\right)\\left(-\\tfrac{s}{4}\\right)ds\\right] = \\frac{106.67 - 256}{EI} = -\\frac{149.33}{EI}$$
Negative → a moves **up**.`}</Md>
          <VWSolution model={b1b} real={b1b.loads} virtual={[P('a', 1)]} opts={{ EI: () => EI1b }} scale={12} resultUnit="in" what="Δa (+ down)" unitNote="EI in k-ft²; ft × 12 = in." />
          <Md>{`**Deflection at c** — unit load ↓ at c (midspan of b–d, $m = s/2$ from either support, zero on the overhang): $\\int Mm/EI = (213.33 + 320)/EI = 533.33/EI$ → **down**.`}</Md>
          <VWSolution model={b1b} real={b1b.loads} virtual={[P('c', 1)]} opts={{ EI: () => EI1b }} scale={12} resultUnit="in" what="Δc (+ down)" />
          <div className="rounded-xl bg-bg/60 border border-line">
            <FnPlot f={(x) => -f(x)} x0={0} x1={20} title="Deflected shape (in, + = downward), from the stiffness solution" color="var(--c-accent)" marks={[0, 4, 12, 20]} />
          </div>
          <p>
            Final: <b>a moves {fmt(Math.abs(da), 4)} in {da > 0 ? '↓' : '↑'}</b>, <b>c moves {fmt(Math.abs(dc), 4)} in {dc > 0 ? '↓' : '↑'}</b>. The overhang kicks up because the span sags (the 1 k/ft span load dominates the 5 k tip load); there is an inflection point where M changes sign between b and c.
          </p>
        </div>
      )
    },
    notes: ['Read from Fig. 2: a at 0 (free, 5 k), b roller at 4 ft, c at 12 ft, d pin at 20 ft; 1 k/ft over b–d only.'],
  },
  {
    id: '2021-22-A2a',
    paper: '2021-22',
    sec: 'A',
    no: '2(a)',
    marks: 23,
    topics: ['vw'],
    title: 'Three-hinged frame: rotation just left of hinge e',
    pages: PG.A2,
    text: `Using the method of virtual work, find the rotation **just left of the internal hinge e** of the frame in Fig. 3 (bending only). $E = 29000$ ksi, $I = 3000$ in⁴, $A = 30$ in², $\\vartheta = 0.3$, same for all members.

Fig. 3: pinned supports a and d, columns a–b and d–c 12 ft high, beam b–c 16 ft with an internal hinge **e** at mid-span carrying **50 k**.`,
    figure: () => <Figure model={f2a} dimY />,
    checks: () => {
      const t = vw2a().total
      return [
        { key: 'th', label: 'Rotation of b–e at e (rad, + ccw)', value: t, tol: 0.03 },
        { key: 'H', label: 'Horizontal reaction at a (real)', value: Math.abs(solve(f2a).reaction('a').rx), unit: 'k' },
      ]
    },
    solution: () => {
      const r = solve(f2a)
      const t = vw2a().total
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Real system** (three-hinged frame, symmetric): $V_a = V_d = 25$ k. Left part about e: $25(8) - H(12) = 0 \\Rightarrow H = ${fmt(Math.abs(r.reaction('a').rx))}$ k. Column moments grow to $H\\cdot12 = 200$ k-ft at b and c, falling linearly to 0 at e.`}</Md>
          <Md>{`**Virtual system**: a unit couple applied to the **end of member b–e** at e (left side of the hinge only). Right part about e: $8V_d + 12H_d = 0$; overall $\\sum M_a$: $16V_d + 1 = 0 \\Rightarrow V_d = -1/16$, $H_d = 1/24$. Then $\\theta_{e,left} = \\sum\\int \\dfrac{Mm}{EI}dx$ with $EI = 29000(3000)/144 = ${fmt(EI2a, 0)}$ k-ft².`}</Md>
          <VWSolution model={f2a} real={f2a.loads} virtual={[Mo('e', 1)]} opts={{ EI: () => EI2a }} what="θ (just left of e), rad, + ccw" />
          <p className="text-xs text-faint">Check with the stiffness solver: rotation of the b–e end at e = {fmt(r.disp('e').rz, 6)} rad.</p>
          <p>
            <b>
              θ = {fmt(Math.abs(t), 6)} rad ({t > 0 ? 'counter-clockwise' : 'clockwise'}) = {fmt((Math.abs(t) * 180) / Math.PI, 4)}°
            </b>
          </p>
        </div>
      )
    },
    notes: ['The hinge is modelled as a moment release on the e-end of member e–c, so the unit couple acts on member b–e only (the "just left" side).'],
  },
  {
    id: '2021-22-A2b',
    paper: '2021-22',
    sec: 'A',
    no: '2(b)',
    marks: 23.67,
    topics: ['cable'],
    title: 'Suspension bridge: force in stiffening-truss member a–c',
    pages: PG.A2,
    text: `The stiffening truss in Fig. 4 is suspended from the parabolic cable of a suspension bridge. Determine the force in member **a–c** of the truss (marked) for the loading shown.

Fig. 4: span 12 @ 30 ft = 360 ft between towers, cable sag 30 ft, truss depth 20 ft, hangers at every panel point; the truss is hinged at mid-span (top chord interrupted, the two halves meet at the bottom-chord centre joint). A **50 k** load acts at the bottom-chord joint 210 ft from the left tower. a–c is the end diagonal from the left support a (bottom) to the first top-chord joint c.`,
    figure: () => <Figure model={t2bFig} dims={[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]} maxHeight={260} />,
    checks: () => {
      const s = s2b()
      const t = t2b()
      return [
        { key: 'H', label: 'Cable horizontal tension H', value: s.H, unit: 'k' },
        { key: 'T', label: 'Hanger force (each)', value: t.T, unit: 'k' },
        { key: 'ac', label: 'Force in a–c (T +, C −)', value: t.r.member('ac').N(1), unit: 'k' },
      ]
    },
    solution: () => {
      const s = s2b()
      const t = t2b()
      const Ra = t.r.reaction('L0').ry
      const Fac = t.r.member('ac').N(1)
      const Lac = Math.hypot(30, 20)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Idea.** A parabolic cable pulls the truss up with **equal hanger forces** $T$ (a uniform $q = 8Hh/L^2$). The mid-span hinge gives the extra equation: $M = 0$ at x = 180 ft. Treat the truss as a girder: $M(x) = M_0(x) - H\\,y(x)$.`}</Md>
          <SuspensionSolution L={L2b} h={h2b} xh={180} loads={[Pl2b]} panel={30} marks={[0, 90, 180, 210, 270, 360]} />
          <Md>{`Panel-point check (11 hangers of $T$ each): left half about the hinge $R_a(180) + T(150+120+90+60+30) = 0 \\Rightarrow R_a = -2.5T$; whole truss $\\sum M$ about the right support: $360R_a + T(11\\times180) = 50(150) \\Rightarrow T = 7500/1080 = ${fmt(t.T, 4)}$ k — the same as $q\\times30$.`}</Md>
          <Md>{`**Truss support at a**: $R_a = ${fmt(Ra, 4)}$ k (${Ra < 0 ? 'downward — the cable lifts the unloaded half' : 'upward'}). **Joint a** (only a–b and a–c meet there): $\\sum F_y = 0$: $R_a + F_{ac}\\dfrac{20}{${fmt(Lac, 3)}} = 0$.`}</Md>
          <Tex block>{`F_{ac} = -R_a\\frac{${fmt(Lac, 3)}}{20} = \\mathbf{${fmt(Math.abs(Fac))}}\\text{ k (${Fac > 0 ? 'tension' : 'compression'})}`}</Tex>
          <p className="text-xs text-faint">Engine check: whole truss solved with the 50 k load and the 11 hanger pulls ({fmt(t.T, 3)} k each); a dummy top-chord bar across the hinge carries {fmt(Math.abs(t.r.member('dummy').N(1)), 6)} k, confirming the hinge condition. H = {fmt(s.H)} k.</p>
          <TrussSolution model={t.m} asked={['ac']} note="Hanger pulls shown as upward joint loads." />
        </div>
      )
    },
    notes: [
      'The question text says "member a-c"; the brief listed "3-C" — the scan clearly marks the end diagonal a–c.',
      'Load position read from the hand sketch: the 50 k arrow is under the first bottom-chord joint right of mid-span (x = 210 ft).',
      'Truss hinge at mid-span read from the sketch (top chord broken at the centre, diagonals meet at the bottom centre joint). Without it the system would be indeterminate.',
      'Truss supported vertically at both towers; hangers assumed equally loaded (parabolic cable).',
    ],
  },
  {
    id: '2021-22-A3a',
    paper: '2021-22',
    sec: 'A',
    no: '3(a)',
    marks: 30.67,
    topics: ['eq'],
    title: 'Earthquake: 3-storey office at Chittagong (SDC, V, F at Level 2)',
    pages: PG.A3a,
    text: `A 3-storied RC office building is at Chittagong (Zone 3). Storey height 3 m, base to GF 1.5 m, site class **SB**, plan 20 m × 20 m. $Z = 0.28$, $I = 1.00$, $\\eta = 1.2$. Dead load incl. self-weight 6 kN/m², live load 2.4 kN/m² (typical floors), roof live load 1 kN/m². Self-weight of all pedestals 100 kN. GF has an RC floor carrying typical floor loads. Determine the appropriate structural system, seismic design category (SDC), earthquake base shear and the storey force at **Level 2** (BNBC 2020, Tables 1–3).`,
    checks: () => {
      const r = eqResult(eq3)
      return [
        { key: 'T', label: 'Period T', value: r.T, unit: 's' },
        { key: 'W', label: 'Seismic weight W', value: r.W, unit: 'kN' },
        { key: 'V', label: 'Base shear V', value: r.V, unit: 'kN' },
        { key: 'F2', label: 'Storey force at Level 2 (h = 4.5 m)', value: r.rows.find((x) => x.name === 'L2')!.F, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**SDC.** Office → Occupancy **II** (I = 1). Table 6.2.18: site SB, Zone 3, Occupancy I–III → **SDC ${sdc3}**. In SDC D, Table 1 permits only **special RC moment frames** (IMRF and OMRF are NP) → **SMRF, R = 8**, $\\Omega_0 = 3$, $C_d = 5.5$.`}</Md>
        <Md>{`$h_n = 1.5 + 3\\times3 = 10.5$ m. Seismic weight (25 % LL since LL ≤ 3 kN/m²): typical floor (incl. GF) $= 400(6 + 0.25\\times2.4) = 2640$ kN; roof $= 400(6 + 0.25\\times1) = 2500$ kN; pedestals 100 kN at the base.`}</Md>
        <EQSolution {...eq3} levels={['L2']} />
        <p>
          <b>
            V = {fmt(eqResult(eq3).V)} kN; F at Level 2 = {fmt(eqResult(eq3).rows.find((x) => x.name === 'L2')!.F)} kN
          </b>
        </p>
      </div>
    ),
    notes: [
      'Levels counted from the GF slab: GF = Level 1 (1.5 m), Level 2 = 4.5 m, Level 3 = 7.5 m, roof = 10.5 m above the base. If your teacher counts the first floor above GF as Level 1, "Level 2" is the 7.5 m level (see table).',
      'Pedestal weight (100 kN) is lumped at the base (h = 0): it adds to W and V but attracts no storey force.',
      'η = 1.2 used as given.',
    ],
  },
  {
    id: '2021-22-A3b',
    paper: '2021-22',
    sec: 'A',
    no: '3(b)',
    marks: 16,
    topics: ['wind'],
    title: 'Enclosure classification from wall openings',
    pages: PG.A3b,
    text: `A one-storied RC office building has a plan of 40 ft × 40 ft (walls 10 ft high). Openings (Fig. 5): windward wall — one opening **30 ft × 7 ft**; leeward and both side walls — each has a door **3 ft × 7 ft** and two windows **2 ft × 4 ft**. Determine whether the building is ENCLOSED, PARTIALLY ENCLOSED or OPEN (BNBC 2020).`,
    figure: () => <OpeningsFig />,
    checks: () => [
      { key: 'Ao', label: '$A_o$ (windward openings)', value: encl.Ao, unit: 'ft²' },
      { key: 'Aoi', label: '$A_{oi}$ (openings in the other walls)', value: encl.Aoi, unit: 'ft²' },
      { key: 'r', label: '$A_{oi}/A_{gi}$', value: encl.ratio },
    ],
    solution: () => (
      <div className="text-sm space-y-2">
        <Md>{`$A_o = 30\\times7 = ${encl.Ao}$ ft², $A_g = 40\\times10 = ${encl.Ag}$ ft². Each other wall: $3\\times7 + 2(2\\times4) = 37$ ft² → $A_{oi} = 3\\times37 = ${encl.Aoi}$ ft², $A_{gi} = 3\\times400 = ${encl.Agi}$ ft² (walls only; including the roof would only lower the ratio).`}</Md>
        <Md>{`- **Open?** Each wall must be ≥ 80 % open: windward $210/400 = 52.5\\%$ → **not open**.
- (i) $A_o \\ge 1.10A_{oi}$: $${encl.Ao} \\ge ${fmt(1.1 * encl.Aoi)}$ → ${encl.c1 ? '✓' : '✗'}
- (ii) $A_o > \\min(4\\text{ ft}^2,\\ 0.01A_g = ${fmt(0.01 * encl.Ag)}\\text{ ft}^2)$ → ${encl.c2 ? '✓' : '✗'}
- (iii) $A_{oi}/A_{gi} = ${fmt(encl.ratio, 4)} \\le 0.20$ → ${encl.c3 ? '✓' : '✗'}`}</Md>
        <p className="text-base">
          All three conditions {encl.cls === 'partially' ? 'hold' : 'do not all hold'} → <b className="text-accent">{encl.cls === 'enclosed' ? 'ENCLOSED' : encl.cls === 'partially' ? 'PARTIALLY ENCLOSED' : 'OPEN'}</b>
          {encl.cls === 'partially' ? ' (GCpi = ±0.55).' : '.'}
        </p>
      </div>
    ),
  },
  {
    id: '2021-22-A4a',
    paper: '2021-22',
    sec: 'A',
    no: '4(a)',
    marks: 16.67,
    topics: ['wind'],
    title: 'Topographic factor at the top of a building on an escarpment',
    pages: PG.A4a,
    text: `A six-storied RC residential building (Fig. 6) is on a 2-D escarpment. Find the topographic factor at the **top of the building**. Exposure C, occupancy category II; the first two speed-up conditions are met. Use Table 4; $K_2 = 1 - \\dfrac{|x|}{\\mu L_h}$, $K_3 = e^{-\\gamma z/L_h}$.

Fig. 6: building 75 ft wide, 60 ft tall, its leeward... windward face 25 ft behind the crest; escarpment height 30 ft over a horizontal run of 70 ft; wind blows from the low side toward the building.`,
    figure: () => <EscarpmentFig />,
    checks: () => {
      const r = kzt(kzt4a)
      return [
        { key: 'K1', label: '$K_1$', value: r.K1, tol: 0.005 },
        { key: 'K2', label: '$K_2$', value: r.K2, tol: 0.005 },
        { key: 'K3', label: '$K_3$', value: r.K3, tol: 0.01 },
        { key: 'Kzt', label: '$K_{zt}$ at z = 60 ft', value: r.Kzt, tol: 0.005 },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`$H = 30$ ft. $L_h$ = horizontal distance from the crest to where the ground is at $H/2$ = half of the 70 ft run = **35 ft**. The building is **downwind** of the crest (wind comes up the slope), $x = 25$ ft (crest to the near face), and the top of the building is at $z = 60$ ft.`}</Md>
        <KztSolution {...kzt4a} unit="ft" />
        <p>
          <b>K<sub>zt</sub> = {fmt(kzt(kzt4a).Kzt, 4)}</b> at the roof (z = 60 ft). The speed-up decays quickly with height because L<sub>h</sub> is short (γ z / L<sub>h</sub> = 2.5).
        </p>
      </div>
    ),
    notes: ['H/Lh = 30/35 = 0.86 exceeds 0.5, so the code caps it: H/Lh = 0.5 and Lh = 2H = 60 ft for K2 and K3.', 'Units cancel in every ratio, so feet are used directly.'],
  },
  {
    id: '2021-22-A4b',
    paper: '2021-22',
    sec: 'A',
    no: '4(b)',
    marks: 12,
    topics: ['ild'],
    title: 'ILDs for a beam with hinges at C and D: R_E, V_B−, M_H',
    pages: PG.A4bc,
    text: `For the beam with internal hinges at **C** and **D** in Fig. 7, draw influence lines for (i) the reaction at **E**, (ii) the shear just left of **B**, (iii) the moment at **H**.

Fig. 7: A roller (x = 0), B pin (40 ft), hinge C (60 ft), H (90 ft), hinge D (120 ft), E roller (150 ft), F roller (210 ft).`,
    figure: () => <Figure model={b4b} />,
    checks: () => [
      { key: 'RE', label: '$R_E$ ordinate at D (hinge)', value: ildAt(influenceLine(b4b, p4b, r4b.RE), 120) },
      { key: 'VB', label: '$V_{B^-}$ ordinate at C', value: ildAt(influenceLine(b4b, p4b, r4b.VB), 60) },
      { key: 'MH', label: '$M_H$ peak ordinate', value: ildExtremes(influenceLine(b4b, p4b, r4b.MH)).max.y, unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** A–B–C is a simple beam with an overhang to the hinge C; **C–D is a drop-in span** carried by C and D; D–E–F is a simple beam E–F with an overhang to D. Unit load at x (statics):
- $R_E$: zero on A–C. On C–D the hinge force at D is $(x-60)/60$ and the overhang lever gives $R_E = 1.5\\times$ that → 1.5 at D, then straight to 1 at E and 0 at F.
- $V_{B^-}$: on A–B, $V = R_A - 1 = -x/40$ (−1 just left of B, 0 at B itself); on B–C, $V = R_A = -(x-40)/40$ → −0.5 at C; on C–D it goes linearly to 0 at D; zero beyond.
- $M_H$: only loads on the drop-in span bend H: triangle with peak $\\dfrac{30\\times30}{60} = 15$ ft at H, zero elsewhere (Müller-Breslau: a kink at H moves only C–D).`}</Md>
        <ILDStack
          model={b4b}
          path={p4b}
          items={[
            { label: 'R_E', resp: r4b.RE },
            { label: 'V just left of B', resp: r4b.VB },
            { label: 'M_H', resp: r4b.MH },
          ]}
        />
      </div>
    ),
  },
  {
    id: '2021-22-A4c',
    paper: '2021-22',
    sec: 'A',
    no: '4(c)',
    marks: 18,
    topics: ['wind'],
    title: 'Velocity pressure at each floor, 3-storey building at Comilla',
    pages: PG.A4bc,
    text: `A typical three-storied RC residential building is in flat open country at Comilla. Plan 40 m × 40 m, overall height 12 m, flat roof, enclosed, occupancy category II, basic wind speed 61.4 m/s. Determine the velocity pressure for each floor (analytical procedure, BNBC 2020).

$K_z = 2.01(z/z_g)^{2/\\alpha}$ for $4.57 \\le z \\le z_g$, $K_z = 2.01(4.57/z_g)^{2/\\alpha}$ for $z < 4.57$ m; $z_g = 274.32$ m.`,
    checks: () => {
      const r = storeyForces({ ...w4c, I: 1, Kzt: 1, Kd: 0.85 })
      return r.rows.map((x) => ({ key: `q${x.z}`, label: `$q_z$ at z = ${x.z} m`, value: x.qz, unit: 'kN/m²' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Flat open country → **Exposure B** ($\\alpha = 9.5$, $z_g = 274.32$ m, matching the given $z_g$). Occupancy II → $I = 1.0$; flat site → $K_{zt} = 1$; buildings → $K_d = 0.85$. Three storeys of 12/3 = 4 m → floors at z = 4, 8, 12 m. At z = 4 m (below 4.57 m) $K_z$ is taken at 4.57 m.`}</Md>
        <Tex block>{`q_z = 0.000613\\,K_zK_{zt}K_dV^2I = 0.000613(K_z)(1)(0.85)(61.4)^2(1)`}</Tex>
        <WindAnalytical {...w4c} forces={false} />
        <p>
          <b>
            q = {storeyForces({ ...w4c, I: 1, Kzt: 1, Kd: 0.85 })
              .rows.map((x) => `${fmt(x.qz, 3)} kN/m² (z = ${x.z} m)`)
              .join(', ')}
          </b>
        </p>
      </div>
    ),
    notes: ['Equal storey heights of 4 m assumed (12 m / 3 storeys).', 'BNBC 2020 Exposure B ("open terrain … includes flat open country") — consistent with the z_g = 274.32 m given in the question.'],
  },
  {
    id: '2021-22-B5',
    paper: '2021-22',
    sec: 'B',
    no: '5',
    marks: 28,
    topics: ['frames'],
    title: 'Frame with an inclined leg and hinge at C: SFD & BMD',
    pages: PG.B,
    text: `Analyse the frame in Fig. 8 and draw the shear force and bending moment diagrams. Consider an internal hinge at **C**.

Fig. 8: pin A at the base of the 16 ft column A–B; beam B–C 24 ft with 10 k loads at 8 ft and 16 ft from B; hinge C; inclined member C–D down to pin D (12 ft horizontally, 16 ft vertically, length 20 ft) carrying **4 k/ft normal to the member**.`,
    figure: () => <Figure model={f5} dimY />,
    checks: () => {
      const r = solve(f5)
      return [
        { key: 'Dy', label: 'Vertical reaction at D', value: r.reaction('D').ry, unit: 'k' },
        { key: 'Dx', label: 'Horizontal reaction at D (+ →)', value: r.reaction('D').rx, unit: 'k' },
        { key: 'Ax', label: 'Horizontal reaction at A (+ →)', value: r.reaction('A').rx, unit: 'k' },
        { key: 'MB', label: 'Moment at B (magnitude)', value: Math.abs(r.member('AB').M(16)), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The normal load on C–D has resultant $4\\times20 = 80$ k at mid-length (30, 8), acting perpendicular to C–D toward the frame: components **64 k ←** and **48 k ↓**.
- $\\sum M_A = 0$: $36D_y - 10(8) - 10(16) - 48(30) + 64(8) = 0 \\Rightarrow D_y = 1168/36 = 32.44$ k
- Part C–D, $\\sum M_C = 0$: $12D_y + 16D_x - 80(10) = 0 \\Rightarrow D_x = 25.67$ k →
- $A_x = 64 - 25.67 = 38.33$ k →, $A_y = 68 - 32.44 = 35.56$ k ↑`}</Md>
        <FrameSolution model={f5} kinds={['V', 'M', 'N']} />
      </div>
    ),
    notes: ['The 4 k/ft load is drawn perpendicular to C–D (arrows square to the member), pointing toward the inside of the frame.', 'C at (24, 16), D at (36, 0) from the dimension chain 8 + 8 + 8 + 12 ft.'],
  },
  {
    id: '2021-22-B6',
    paper: '2021-22',
    sec: 'B',
    no: '6',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method in reverse: find P₁, P₂ from column shears',
    pages: PG.B,
    text: `The shear force diagram of the columns of a frame for lateral loads $P_1$ and $P_2$ is shown in Fig. 9. Evaluate $P_1$ and $P_2$ using the portal method. Then draw the bending moment and axial force diagrams of the columns, and the bending moment, shear force and axial force diagrams of the beams.

Fig. 9: 2 bays (16 ft, 20 ft), storeys 12 ft (ground) and 10 ft (top), fixed bases. Column shears: top storey 4 k, 8 k, 4 k; ground storey 9 k, 18 k, 9 k. $P_1$ at the roof, $P_2$ at the first floor, both acting to the right.`,
    figure: () => <ApproxFig g={g6} loadLabels={['P₂', 'P₁']} />,
    checks: () => {
      const r = portalMethod(g6)
      return [
        { key: 'P1', label: '$P_1$', value: P1, unit: 'k' },
        { key: 'P2', label: '$P_2$', value: P2, unit: 'k' },
        { key: 'mb1', label: 'First-floor beam end moment, 16 ft bay', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'n1', label: 'Axial force, left ground column (T +)', value: r.columns[0][0].axial, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Reverse step.** The column shears in a storey add up to the storey shear: top storey $4 + 8 + 4 = 16$ k $= P_1$ → **$P_1 = ${P1}$ k**; ground storey $9 + 18 + 9 = 36$ k $= P_1 + P_2$ → **$P_2 = ${P2}$ k**. The 1 : 2 : 1 split confirms the portal assumption (interior column takes twice an exterior one).`}</Md>
        <Md>{`Then the usual portal steps: inflection points at mid-height of columns and mid-span of beams; column end moment $= V h/2$; beam end moments from joint equilibrium (left to right); beam shear $= 2M/L$; column axial forces from beam shears; beam axial forces from horizontal joint equilibrium.`}</Md>
        <ApproxSolution g={g6} method="portal" />
      </div>
    ),
    notes: ['The P₁, P₂ arrows start at the right-hand joints and point right (to the right of the frame), so they are applied at the right end of each floor — this only affects the beam axial forces.'],
  },
  {
    id: '2021-22-B7',
    paper: '2021-22',
    sec: 'B',
    no: '7',
    marks: 28,
    topics: ['truss'],
    title: 'X-braced tower truss: diagonals share the panel shear',
    pages: PG.B,
    text: `Determine the forces in members **AC, AD, CD, DE, CE, FD, EG and GF** of the indeterminate truss in Fig. 10. Assume the diagonals can carry either tension or compression.

Fig. 10: 10 ft wide, three 10 ft panels; A (pin) and B (roller) at the base; C–D, E–F at 10 ft and 20 ft; G at 30 ft above A, connected to F by an inclined bar. Both lower panels have crossing diagonals (AD/BC and CF/DE). Horizontal loads to the right: 16 k at G, 20 k at E, 20 k at C.`,
    figure: () => <Figure model={t7} dimY />,
    checks: () => {
      const f = x7()
      return [
        { key: 'GF', label: 'GF (T +, C −)', value: f.get('GF')!, unit: 'k' },
        { key: 'DE', label: 'DE (T +, C −)', value: f.get('DE')!, unit: 'k' },
        { key: 'AD', label: 'AD (T +, C −)', value: f.get('AD')!, unit: 'k' },
        { key: 'AC', label: 'AC (T +, C −)', value: f.get('AC')!, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Degree of indeterminacy: $b + r - 2j = 13 + 3 - 14 = 2$ (one redundant per X-braced panel). Since the diagonals can take tension *or* compression, assume **each diagonal carries half the panel shear** (one in tension, the other in compression). Then each panel is solved by sections / joints.
- Top: joint G — $16 + 0.707F_{GF} = 0 \\Rightarrow F_{GF} = -22.63$ k (C), $F_{EG} = 16$ k (T).
- Panel C–E (shear 16 + 20 = 36 k): each diagonal horizontal component 18 k → $F = 18\\sqrt2 = 25.46$ k.
- Panel A–C (shear 56 k): each diagonal $28\\sqrt2 = 39.6$ k.
- Verticals and horizontals follow from joint equilibrium (or moments about the panel corners).`}</Md>
        <TrussSolution model={t7} forces={x7()} asked={ASK7} note="Approximate analysis: each crossing diagonal takes ½ the panel shear. FD = member DF." />
      </div>
    ),
    notes: ['The 20 k load at C has arrowheads at both ends in the sketch; taken as acting to the right like the other two loads.', 'Diagonals are assumed not connected at their crossing.'],
  },
  {
    id: '2021-22-B8',
    paper: '2021-22',
    sec: 'B',
    no: '8',
    marks: 28,
    topics: ['floor'],
    title: 'Roof truss ILDs: U₃U₄ and L₃U₄ (load on the bottom chord)',
    pages: PG.B,
    text: `For the truss in Fig. 11, draw influence lines for the forces in members **U₃U₄** and **L₃U₄**. Floor beams are over the bottom chord.

Fig. 11: 4 panels @ 12 ft (L₁…L₅), L₁ pin, L₅ roller; U₂ and U₄ 12 ft high, U₃ 20 ft high; verticals U₂L₂, U₃L₃, U₄L₄; diagonals U₂L₃ and L₃U₄.`,
    figure: () => <Figure model={t8} dimY />,
    checks: () => [
      { key: 'u34', label: 'U₃U₄ ordinate, unit load at L₃', value: ildAt(ild8('U3U4'), 24) },
      { key: 'l3u4', label: 'L₃U₄ ordinate, unit load at L₄', value: ildAt(ild8('L3U4'), 36) },
      { key: 'l3u4b', label: 'L₃U₄ ordinate, unit load at L₂', value: ildAt(ild8('L3U4'), 12) },
    ],
    solution: () => {
      const Lu = Math.hypot(12, 8)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`Loads reach the truss only at L₁–L₅ (floor beams), so each ILD is **straight between panel points**. Section through U₃U₄, L₃U₄ and L₃L₄:
- **U₃U₄** — moments about L₃ (where the other two cut members meet). U₃U₄ (length ${fmt(Lu, 3)} ft, slope 8:12) has lever arm $24\\times\\dfrac{8}{${fmt(Lu, 3)}}$... easier: resolve its force at U₄ into components and take moments about L₃: $F_x(12) + F_y(12)$. With the unit load left of the section use the right part ($R_5\\times24$), otherwise the left part ($R_1\\times24$). Compression throughout.
- **L₃U₄** — moments about L₁? Its line passes through L₃; take moments about the intersection of U₃U₄ and L₃L₄ — or simply use joint L₄ (vertical U₄L₄ = load at L₄) and joint U₄. The ILD changes sign within panel L₃–L₄.`}</Md>
          <ILDStack
            model={t8}
            path={p8}
            items={[
              { label: 'F U3U4', resp: { kind: 'force', member: 'U3U4' } },
              { label: 'F L3U4', resp: { kind: 'force', member: 'L3U4' } },
            ]}
          />
          <p className="text-xs text-faint">Tension positive. Ordinates at L₁ and L₅ are zero (load goes straight into the supports).</p>
        </div>
      )
    },
    notes: ['Geometry from Fig. 11: U₂ and U₄ at 12 ft, U₃ at 12 + 8 = 20 ft above the bottom chord.'],
  },
  {
    id: '2021-22-B9',
    paper: '2021-22',
    sec: 'B',
    no: '9',
    marks: 28,
    topics: ['floor'],
    title: 'Floor-beam system with overhanging stringers: ILDs, max V_bc and M_c',
    pages: PG.B,
    text: `A uniform live load of 2 k/ft and a single concentrated live load of 10 k are placed on the floor-beam system in Fig. 12. Draw influence lines for (i) $FBR_a$, $FBR_b$; (ii) $R_a$; (iii) $V_{ab}$, $V_{bc}$; (iv) $M_c$. Also calculate the maximum positive shear $V_{bc}$ and the maximum positive moment $M_c$.

Fig. 12: girder a–d (pin a, roller d) with floor beams at a (0), b (20 ft), c (55 ft), d (85 ft). Stringer 1 runs from 10 ft left of a to 15 ft right of b (on a and b); stringer 2 runs from there (x = 35 ft) to d (on c and d), overhanging 20 ft left of c.`,
    figure: () => <StructureView model={fs9.model} showLoads={false} autoDimX={[-10, 0, 20, 35, 55, 85]} maxHeight={200} />,
    checks: () => {
      const v = uniformPlusConcentrated(ild9(fs9.shear(30)), 2, 10)
      const m = uniformPlusConcentrated(ild9(fs9.moment(55)), 2, 10)
      return [
        { key: 'fbrb', label: '$FBR_b$ ordinate at the stringer tip x = 35 ft', value: ildAt(ild9(fs9.fbr(20)), 35, -1) },
        { key: 'vbc', label: 'Max positive $V_{bc}$', value: v.maxPos.live, unit: 'k' },
        { key: 'mc', label: 'Max positive $M_c$', value: m.maxPos.live, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Each stringer is a simple beam with overhangs on two floor beams, so each $FBR$ ILD is a **straight line** over its stringer (1 at its floor beam, 0 at the other support of that stringer, extended over the overhangs) and zero elsewhere. The girder feels only floor-beam reactions, so a girder ILD = Σ (FBR ILD × girder ordinate for a load at that floor beam). Girder ordinates at the floor beams:
- $V_{bc}$: $R_a - 1$ for a load at b $= 65/85 - 1 = -0.235$; for a load at c $= 30/85 = 0.353$.
- $M_c$: load at b $= 20(30)/85 = 7.06$; load at c $= 55(30)/85 = 19.41$.
Because stringer 2 overhangs c by 20 ft, its tip (x = 35 ft) gives $FBR_c = 50/30 = 1.67$ → the largest ordinates sit at x = 35 ft (right side of the joint): $V_{bc} = 0.588$, $M_c = 32.35$.`}</Md>
        <ILDStack
          model={fs9.model}
          path={fs9.path}
          items={[
            { label: 'FBR_a', resp: fs9.fbr(0) },
            { label: 'FBR_b', resp: fs9.fbr(20) },
            { label: 'R_a (girder)', resp: fs9.reaction(0) },
            { label: 'V_ab', resp: fs9.shear(10) },
            { label: 'V_bc', resp: fs9.shear(30) },
            { label: 'M_c', resp: fs9.moment(55) },
          ]}
        />
        <MaxEffect ild={ild9(fs9.shear(30))} w={2} P={10} label="Shear in panel bc (2 k/ft on the positive parts, 10 k at the peak)" />
        <MaxEffect ild={ild9(fs9.moment(55))} w={2} P={10} label="Moment at c" resUnit="k-ft" />
      </div>
    ),
    notes: ['Read from Fig. 12: dimension chain 10, 20, 15, 20, 30 ft; the stringer joint is the gap 15 ft right of b.', 'No dead load is given, so the maxima are live-load only.'],
  },
  {
    id: '2021-22-B10',
    paper: '2021-22',
    sec: 'B',
    no: '10',
    marks: 28,
    topics: ['wheel'],
    title: 'Max shear at the third-point of a 72 ft span (8-wheel train)',
    pages: PG.B,
    text: `Compute the maximum shear at the one-third point from the left support of a simply supported beam of 72 ft span due to the wheel loads in Fig. 13: **10, 10, 20, 20, 20, 20, 35, 35 k** at spacings **10, 12, 15, 12, 12, 12, 12 ft**.`,
    checks: () => {
      const e = trainExtremes(ild10, train10)
      return [
        { key: 'vp', label: 'Maximum positive shear at 24 ft', value: e.max.value, unit: 'k' },
        { key: 'vn', label: 'Maximum negative shear at 24 ft', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => {
      const e = trainExtremes(ild10, train10)
      const big = Math.abs(e.max.value) >= Math.abs(e.min.value) ? e.max.value : e.min.value
      return (
        <div className="space-y-3 text-sm">
          <Md>{`Shear ILD at x = 24 ft: $-24/72 = -1/3$ just left, $+2/3$ just right, straight to 0 at the supports. For **maximum positive shear**, put a wheel just right of the section with the train heading so that most load lies on the positive part. Moving the next wheel up to the section changes the shear by $\\Delta V = -P_{\\text{passing}} + \\dfrac{W\\,\\Delta x}{L}$ (W = load on span): keep advancing while ΔV is positive. The heavy 35 k wheels make it worth trying the train in both directions.`}</Md>
          <TrainOnILD ild={ild10} t={train10} span={[0, 72]} section={24} peak={{ x: 24, side: 1 }} what="shear at 24 ft" />
          <p>
            <b>Maximum shear at the third-point = {fmt(Math.abs(big))} k</b> ({big > 0 ? 'positive' : 'negative'}); the other sense peaks at {fmt(big > 0 ? e.min.value : e.max.value)} k.
          </p>
        </div>
      )
    },
    notes: ['The train (85 ft) is longer than the span, so only some wheels are on the beam at a time; the exhaustive search covers both directions of travel.'],
  },
  {
    id: '2021-22-B11',
    paper: '2021-22',
    sec: 'B',
    no: '11',
    marks: 28,
    topics: ['lateral'],
    title: 'Cantilever method: 2-bay, 2-storey frame (areas 100, 200, 100 in²)',
    pages: PG.B,
    text: `Using the cantilever method, analyse the frame in Fig. 14 and draw (a) the axial force diagram of columns, (b) the bending moment diagram of columns, (c) the bending moment diagram of beams, (d) the shear force diagram of beams. Numbers beside the columns are their areas (in²).

Fig. 14: bays 15 ft and 20 ft, storeys 12 ft (ground) and 10 ft (top), fixed bases. Loads to the **left** at the left end: 30 k at the first floor, 20 k at the roof. Column areas (100), (200), (100) in both storeys.`,
    figure: () => <ApproxFig g={g11} />,
    checks: () => {
      const r = cantileverMethod(g11)
      return [
        { key: 'xbar', label: 'Centroid of column areas from the left column', value: r.overturning![0].xbar, unit: 'ft' },
        { key: 'n1', label: 'Axial force, left ground column (T +)', value: r.columns[0][0].axial, unit: 'k' },
        { key: 'mb', label: 'First-floor beam end moment, 15 ft bay', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'vb', label: 'Roof beam shear, 20 ft bay', value: r.beams[1][1].shear, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Assumptions: inflection points at mid-height of every column and mid-span of every beam; **column axial stress ∝ distance from the centroid** of the column areas. Centroid: $\\bar x = \\dfrac{100(0) + 200(15) + 100(35)}{400} = 16.25$ ft. Loads act to the left, so columns to the **right** of the centroid are in tension. Overturning moment at each storey's inflection plane → column axial forces → beam shears from joint vertical equilibrium → beam moments $= V L/2$ → column moments and shears from joint moment equilibrium.`}</Md>
        <ApproxSolution g={g11} method="cantilever" />
      </div>
    ),
    notes: ['Relative areas 1 : 2 : 1 are used (100 : 200 : 100 in²) — only the ratios matter.'],
  },
]

// ---------------------------------------------------------------- small custom figures
function ApproxFig({ g, loadLabels }: { g: GridFrame; loadLabels?: string[] }) {
  const base = gridModel(g)
  const m = loadLabels ? { ...base, loads: base.loads.map((l, k) => ({ ...l, label: loadLabels[k] })) } : base
  return <StructureView model={m} autoDimX autoDimY memberLabels maxHeight={260} />
}

function OpeningsFig() {
  const wall = (y: number, title: string, openings: { x: number; w: number; h: number; y0: number }[]) => (
    <g transform={`translate(20,${y})`}>
      <rect x={0} y={0} width={400} height={100} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeWidth={1.5} />
      {openings.map((o, i) => (
        <g key={i}>
          <rect x={o.x * 10} y={100 - (o.y0 + o.h) * 10} width={o.w * 10} height={o.h * 10} fill="var(--c-bg)" stroke="var(--c-ink)" />
          <text x={o.x * 10 + (o.w * 10) / 2} y={100 - (o.y0 + o.h / 2) * 10 + 4} fontSize={11} textAnchor="middle" fill="var(--c-ink)">
            {o.w}×{o.h}
          </text>
        </g>
      ))}
      <text x={200} y={118} textAnchor="middle" fontSize={11.5} fill="var(--c-mute)">
        {title}
      </text>
      <text x={410} y={55} fontSize={11} fill="var(--c-mute)">
        10 ft
      </text>
      <text x={200} y={-6} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        40 ft
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 480 290" className="w-full max-w-xl h-auto">
      {wall(20, '(a) Windward wall: opening 30 ft × 7 ft', [{ x: 5, w: 30, h: 7, y0: 0 }])}
      {wall(165, '(b) Leeward and both side walls (each)', [
        { x: 5, w: 2, h: 4, y0: 3 },
        { x: 18.5, w: 3, h: 7, y0: 0 },
        { x: 33, w: 2, h: 4, y0: 3 },
      ])}
    </svg>
  )
}

function EscarpmentFig() {
  // 1 ft = 3 px; building left, crest at x = 100 ft, toe at 170 ft
  const X = (x: number) => 20 + x * 3
  const Y = (y: number) => 200 - y * 2.2
  return (
    <svg viewBox="0 0 680 240" className="w-full max-w-2xl h-auto">
      <polyline points={`${X(-5)},${Y(30)} ${X(100)},${Y(30)} ${X(170)},${Y(0)} ${X(215)},${Y(0)}`} fill="none" stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={X(0)} y={Y(90)} width={X(75) - X(0)} height={Y(30) - Y(90)} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={X(37.5)} y={Y(60)} textAnchor="middle" fontSize={12} fill="var(--c-ink)">
        6-storey, 60 ft
      </text>
      <text x={X(37.5)} y={Y(30) + 16} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        75 ft
      </text>
      <text x={X(87.5)} y={Y(30) + 16} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        x = 25 ft
      </text>
      <text x={X(135)} y={Y(0) + 18} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        70 ft
      </text>
      <text x={X(178)} y={Y(15)} fontSize={11} fill="var(--c-mute)">
        H = 30 ft
      </text>
      <text x={X(140)} y={Y(80)} fontSize={13} fill="var(--c-load)" fontWeight={700}>
        ⟵ Wind
      </text>
      <circle cx={X(100)} cy={Y(30)} r={3} fill="var(--c-accent)" />
      <text x={X(100)} y={Y(30) - 8} textAnchor="middle" fontSize={10} fill="var(--c-accent)">
        crest
      </text>
    </svg>
  )
}
