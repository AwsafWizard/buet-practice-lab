// 2010-11 term final (held 15 Feb 2012), scan pages 13–16. 210 marks; marks from the margins (21 each, Q14 = 20).
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { parabolicCable, stiffenedSuspension } from '../../engine/cable'
import { ssShearILD, trainExtremes, uniformPlusConcentrated, type Train } from '../../engine/moving'
import type { Model } from '../../engine/model'
import { beamOf, F, floorSystem, model, Mo, P, Pm, truss } from '../../kit/builders'
import { Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrussSolution } from '../../kit/solutions'
import { FnPlot, SuspensionSolution } from '../../kit/cables'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'
import { Md, Tex } from '../../components/ui'
import { suspensionModel } from './p2011'

const PAPER = '2010-11' as const
const PA = [13, 15]
const PB = [14, 16]

// ---------------------------------------------------------------- A1 beam with hinge
const b1 = beamOf('A:0 B:8:pin H*:20 C:26:roller D:36 E:46:roller F:54')
const p1 = { kind: 'members' as const, members: b1.members.map((m) => m.id) }
const R1 = {
  RC: { kind: 'reaction' as const, node: 'C', comp: 'y' as const },
  VD: { kind: 'shear' as const, member: 'CD', x: 10 },
  VCl: { kind: 'shear' as const, member: 'HC', x: 6, side: -1 as const },
  MD: { kind: 'moment' as const, member: 'CD', x: 10 },
  MC: { kind: 'moment' as const, member: 'CD', x: 0 },
}
const ild1 = (r: (typeof R1)[keyof typeof R1]) => influenceLine(b1, p1, r)

// ---------------------------------------------------------------- A2 girder with floor beams
const fs2 = floorSystem({
  floorBeams: [6, 16, 31, 43, 51],
  stringers: [
    [0, 16],
    [16, 37],
    [37, 51],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 51, type: 'roller' },
  ],
  names: { 0: '1', 6: '2', 16: '3', 31: '4', 37: '5', 43: '6', 51: '7' },
})
const ild2 = (r: ReturnType<typeof fs2.moment>) => influenceLine(fs2.model, fs2.path, r)

// ---------------------------------------------------------------- A3/A4 wheel train (Fig. 3)
const train3: Train = { P: [20, 20, 60, 60, 60, 40, 40, 40, 40, 30], gaps: [4, 10, 6, 6, 10, 4, 4, 4, 8], udl: { w: 5, gap: 4, length: 30 } }
const ild3 = ssShearILD(80, 30)

// ---------------------------------------------------------------- A4/A6 beam Fig. 4
const b4 = beamOf('B:0:roller C*:15 D:25:roller F:45 E:65:pin')
const p4 = { kind: 'members' as const, members: b4.members.map((m) => m.id) }
const ild4RD = () => influenceLine(b4, p4, { kind: 'reaction', node: 'D', comp: 'y' })
const ild6V = () => influenceLine(b4, p4, { kind: 'shear', member: 'DF', x: 20 })
const ild6M = () => influenceLine(b4, p4, { kind: 'moment', member: 'DF', x: 20 })

// ---------------------------------------------------------------- A5/A7 truss Fig. 5
const t5 = truss(
  'L1:0,0 L2:12,0 L3:24,0 L4:36,0 L5:52,0 L6:68,0 L7:76,0 U1:0,12 U2:12,15 U3:24,18 U4:36,21 U5:44,21 U6:60,21 U7:76,21',
  'L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L6-L7 U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 U1-L1 U2-L2 U3-L3 U4-L4 U7-L7 U1-L2 U2-L3 U3-L4 U5L4=L4-U5 U5-L5 L5-U6 U6-L6 L6-U7',
  'L1:pin L7:roller',
)
const p5 = { kind: 'panel' as const, nodes: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] }
const ild5 = (m: string) => influenceLine(t5, p5, { kind: 'force', member: m })

// ---------------------------------------------------------------- B8 bent with link
const f8 = model('A:0,15 J:6,15 B:26,15 C:6,0 D:30,12', 'A-J J-B C-J B-D', 'C:pin D:pin')
f8.members.find((m) => m.id === 'BD')!.truss = true
f8.nodes.find((n) => n.id === 'J')!.label = ''
const p8 = { kind: 'members' as const, members: ['AJ', 'JB'] }
const R8 = {
  Va: { kind: 'shear' as const, member: 'CJ', x: 4 },
  Ma: { kind: 'moment' as const, member: 'CJ', x: 4 },
  Vb: { kind: 'shear' as const, member: 'JB', x: 15 },
  Mb: { kind: 'moment' as const, member: 'JB', x: 15 },
}
const ild8 = (r: (typeof R8)[keyof typeof R8]) => influenceLine(f8, p8, r)

// ---------------------------------------------------------------- B9 frame, V_F given
const f9Loads = [Pm('DF', 4, 60, '60k'), Pm('FE', 3, 80, '80k'), Mo('M', 160, '160 k-ft')]
const f9Nodes = 'A:0,8 D*:0,16 F:7,16 E:16,16 M:24,16 C:28,16 B:16,0'
const f9Mem = 'A-D D-F F-E E-M M-C B-E'
/** true structure (indeterminate by one) — figure only */
const f9Fig = model(f9Nodes, f9Mem, 'A:pin B:pin C:roller@0', f9Loads)
f9Fig.members[0].truss = true
f9Fig.nodes.find((n) => n.id === 'M')!.label = ''
/** determinate equivalent: link force from V_F = −20 k applied as the vertical reaction at A */
const f9 = model(f9Nodes, f9Mem, 'B:pin C:roller@0', [...f9Loads, F('A', 0, 40, 'R_A = 40k (from V_F)')])
f9.members[0].truss = true
f9.nodes.find((n) => n.id === 'M')!.label = ''
f9.supports.push({ node: 'A', type: 'roller', dir: 0, hidden: true })
const r9 = () => solve(f9)
function jointE() {
  const r = r9()
  const rows = [
    { id: 'FE', end: 'j' as const, name: 'beam F–E (from the left)' },
    { id: 'EM', end: 'i' as const, name: 'beam E–C (to the right)' },
    { id: 'BE', end: 'j' as const, name: 'column B–E (below)' },
  ].map((q) => {
    const m = r.member(q.id)
    const [X, Y, Mz] = q.end === 'i' ? m.end.slice(0, 3) : m.end.slice(3, 6)
    // force ON the member at that end in global axes; the member pushes the joint with the opposite
    const fx = m.c * X - m.s * Y
    const fy = m.s * X + m.c * Y
    return { ...q, fx: -fx, fy: -fy, m: -Mz }
  })
  return rows
}

// ---------------------------------------------------------------- B10 subdivided truss
const t10 = truss(
  'U0:0,16 U1:6,16 U2:12,16 U3:18,16 U4:24,16 U5:30,16 U6:36,16 L0:0,0 L1:12,0 L2:24,0 L3:36,0 M1:6,8 M3:18,8 M5:30,8',
  'U0-U1 U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 L0-L1 L1-L2 L2-L3 U0-L0 U2-L1 U4-L2 U6-L3 U1-M1 U3-M3 U5-M5 U0-M1 M1-L1 M1-U2 U2-M3 M3-L2 M3-U4 U4-M5 M5-L3 M5-U6',
  'L0:pin L3:roller',
  [P('U1', 10, '10k'), P('U3', 20, '20k'), P('L1', 20, '20k'), P('L2', 25, '25k')],
)
const ASK10 = ['U2U3', 'U2M3', 'M3U4', 'M3L2']

// ---------------------------------------------------------------- B11 roof-shaped truss with counters
const n11 = 'O:0,0 A:12,0 B:24,0 A2:36,0 R:48,0 C:12,9 D:24,16 C2:36,9'
const m11 = 'O-A A-B B-A2 A2-R O-C C-D D-C2 C2-R C-A D-B C2-A2'
const t11main = truss(n11, `${m11} C-B B-C2`, 'O:pin R:roller')
const t11ctr = truss(n11, `${m11} A-D B-C2`, 'O:pin R:roller')
const t11fig: Model = {
  ...t11main,
  nodes: t11main.nodes.map((n) => (['O', 'R', 'A2', 'C2'].includes(n.id) ? { ...n, label: '' } : n)),
  members: [...t11main.members, { id: 'AD', i: 'A', j: 'D', truss: true, style: 'dashed' }, { id: 'DA2', i: 'D', j: 'A2', truss: true, style: 'dashed' }],
}
const p11 = { kind: 'panel' as const, nodes: ['O', 'A', 'B', 'A2', 'R'] }
const ild11main = () => influenceLine(t11main, p11, { kind: 'force', member: 'CB' })
const ild11ctr = () => influenceLine(t11ctr, p11, { kind: 'force', member: 'AD' })

// ---------------------------------------------------------------- B13 inclined parabolic cable
const cab13 = { L: 500, w: 1, h: 500 / 40, dh: 0.7 * 500 }
const c13 = () => parabolicCable(cab13)
function cableModel(): Model {
  const c = parabolicCable(cab13)
  const nodes: Model['nodes'] = []
  const members: Model['members'] = []
  const N = 10
  for (let i = 0; i <= N; i++) {
    const x = (cab13.L * i) / N
    nodes.push({ id: `c${i}`, x, y: c.y(x), label: i === 0 ? 'A' : i === N ? 'B' : i === 8 ? 'P (400 ft)' : '' })
    if (i) members.push({ id: `K${i}`, i: `c${i - 1}`, j: `c${i}`, truss: true, style: 'cable' })
  }
  nodes.push({ id: 'ch', x: 250, y: c.y(250), label: '' })
  return {
    nodes,
    members,
    supports: [
      { node: 'c0', type: 'pin' },
      { node: `c${N}`, type: 'pin' },
    ],
    loads: [],
  }
}

// ---------------------------------------------------------------- B14 suspension bridge
const sus14 = { L: 1000, h: 100, xh: 500, loads: [{ x: 300, P: 20 }, { x: 600, P: 20 }] }
const sm14 = suspensionModel(1000, 100, 10, sus14.loads)

export const Q2010: PYQ[] = [
  {
    id: '2010-11-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: 21,
    topics: ['ild'],
    title: 'Beam with an internal hinge: ILDs for R_C, V_D, V_C(left), M_D, M_C',
    pages: PA,
    text: `Draw the influence lines for (a) reaction at C, (b) shear force at D and at the left of C, (c) bending moment at D and C of the beam in Fig. 1.

A (free end) at 0; pin B at 8 ft; internal hinge (called H) at 20 ft; roller C at 26 ft; D at 36 ft; roller E at 46 ft; free end F at 54 ft.`,
    figure: () => <Figure model={b1} />,
    checks: () => [
      { key: 'rcH', label: '$R_C$ ordinate at the hinge', value: ildAt(ild1(R1.RC), 20) },
      { key: 'rcA', label: '$R_C$ ordinate at A', value: ildAt(ild1(R1.RC), 0) },
      { key: 'md', label: '$M_D$ peak ordinate (at D)', value: ildAt(ild1(R1.MD), 36), unit: 'ft' },
      { key: 'mcH', label: '$M_C$ ordinate at the hinge', value: ildAt(ild1(R1.MC), 20), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** H–C–D–E–F is a beam on rollers C and E with overhangs (6 ft to the hinge, 8 ft to F). A–B–H rests on pin B and hangs from the hinge H, so a load at x on A–H sends $\\dfrac{x-8}{12}$ to H. This is negative on the overhang A–B, so the hinge then pulls H up.

Draw every ILD first for the main beam H–F (statics or Müller-Breslau), then carry it onto A–H. On that part the ordinate is (ordinate at H) × $\\dfrac{x-8}{12}$: a straight line through 0 at B.
- $R_C$: $(46 - x)/20$ on H–F → 1.3 at H, 1 at C, 0 at E, −0.4 at F; on A–H through 0 at B → $1.3(-8/12) = -0.867$ at A.
- $V_D$: same as $-R_E$ left of D and $R_C$ right of D: jump of 1 at D.
- $V_{C^-}$ (just left of C): 0 for loads right of C (C and E react to them, nothing crosses the section); $-1$ for a load on H–C; on A–H it is $-(x-8)/12$ (the hinge share), so 0 at B and $+0.667$ at A.
- $M_D$: triangle on C–E with peak $10\\times10/20 = 5$ at D, extended over both overhangs.
- $M_C$: zero for loads right of C; $-(26-x)$ on H–C, i.e. −6 at H. A–H then follows through B.`}</Md>
        <ILDStack
          model={b1}
          path={p1}
          items={[
            { label: 'R_C', resp: R1.RC },
            { label: 'V_D', resp: R1.VD },
            { label: 'V just left of C', resp: R1.VCl },
            { label: 'M_D', resp: R1.MD },
            { label: 'M_C', resp: R1.MC },
          ]}
        />
      </div>
    ),
    notes: ['The hinge is not lettered in Fig. 1 and is called H here. B is read as a pin and C, E as rollers.'],
  },
  {
    id: '2010-11-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: 21,
    topics: ['floor'],
    title: 'Girder with floor beams and overhanging stringers: M₃, M₄, V₃₋₄',
    pages: PA,
    text: `Draw influence lines for (a) bending moment at panel points 3 and 4, and (b) shear force in panel 3–4 of the girder with floor beams in Fig. 2.

Points 1–7 at 0, 6, 16, 31, 37, 43, 51 ft. Girder simply supported at 1 (pin) and 7 (roller). Floor beams at 2, 3, 4, 6 and 7. Stringers: 1–3 (on floor beams 2, 3; overhang 1–2), 3–5 (on floor beams 3, 4; overhang 4–5), 5–7 (on floor beams 6, 7; overhang 5–6).`,
    figure: () => <StructureView model={fs2.model} showLoads={false} autoDimX={[0, 6, 16, 31, 37, 43, 51]} maxHeight={200} />,
    checks: () => [
      { key: 'm3', label: '$M_3$ peak ordinate (load at 3)', value: ildAt(ild2(fs2.moment(16)), 16), unit: 'ft' },
      { key: 'm4', label: '$M_4$ ordinate, load at 5 on stringer 3–5', value: ildAt(ild2(fs2.moment(31)), 37, -1), unit: 'ft' },
      { key: 'v34', label: '$V_{3-4}$ ordinate, load at 5 on stringer 3–5', value: ildAt(ild2(fs2.shear(20)), 37, -1) },
      { key: 'v34n', label: '$V_{3-4}$ most negative ordinate', value: ildExtremes(ild2(fs2.shear(20))).min.y },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The girder is loaded **only through the floor beams**. Find the girder ILD for a load at each floor beam (simple beam of 51 ft) and join the points by straight lines along each stringer, extending them over the stringer overhangs. Two stringers end at point 5 without a floor beam, so the ILDs **jump** at 5: a load just left of 5 sits on stringer 3–5, a load just right of 5 on stringer 5–7.
- $M_3$: girder ordinates $x(51-16)/51$ for floor beams left of 3 and $16(51-x)/51$ for those to the right. Every floor beam lies on that triangle, so the ILD is the triangle itself (peak $16\\times35/51 = 10.98$).
- $M_4$: peak $31\\times20/51 = 12.16$ at 4. The overhang 4–5 of stringer 3–5 carries it to **14.51** at 5⁻, while 5⁺ (stringer 5–7) gives 8.51.
- $V_{3-4}$: $-x/51$ for floor beams at or left of 3, $(51-x)/51$ at or right of 4, straight line in between and over the overhangs.`}</Md>
        <ILDStack
          model={fs2.model}
          path={fs2.path}
          items={[
            { label: 'M at panel point 3', resp: fs2.moment(16) },
            { label: 'M at panel point 4', resp: fs2.moment(31) },
            { label: 'V in panel 3–4', resp: fs2.shear(20) },
          ]}
        />
      </div>
    ),
    notes: [
      'Floor beams (I-symbols) read at points 2, 3, 4, 6 and 7. Points 1 and 5 are stringer ends with no floor beam: stringer 1–3 overhangs to 1, stringers 3–5 and 5–7 both overhang to 5.',
      'Panel 3–4 shear is evaluated in the girder between the floor beams at 3 and 4.',
    ],
  },
  {
    id: '2010-11-A3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: 21,
    topics: ['wheel'],
    title: 'Max shear 30 ft from the support of an 80 ft span (wheels + 30 ft UDL)',
    pages: PA,
    text: `Find the maximum shear force at 30 ft from the left support of a simply supported beam of 80 ft span due to the wheel loads in Fig. 3: 20, 20, 60, 60, 60, 40, 40, 40, 40, 30 k at spacings 4, 10, 6, 6, 10, 4, 4, 4, 8 ft, followed 4 ft behind by a 5 k/ft uniform load 30 ft long.`,
    checks: () => {
      const e = trainExtremes(ild3, train3)
      return [
        { key: 'vp', label: 'Maximum positive shear at 30 ft', value: e.max.value, unit: 'k' },
        { key: 'vn', label: 'Maximum negative shear at 30 ft', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at 30 ft: $-30/80 = -0.375$ just left, $+0.625$ just right of the section, straight to 0 at both supports. The train travels right → left (wheel 1 leads). For **maximum positive shear** a wheel sits just right of the section. Advancing the next wheel to the section changes the shear by $\\Delta V = -P_1 + \\dfrac{W\\,\\Delta x}{L}$ (wheel 1 drops onto the negative side). Keep advancing while $\\Delta V > 0$: moving the two 20 k wheels across pays off, so **wheel 3 (the first 60 k) just right of the section** governs.

The largest negative shear comes after the wheels have left the span: the 30 ft uniform tail then lies exactly on the negative part (0 to 30 ft), $V = -5 \\times \\tfrac12(30)(0.375) = -28.1$ k.`}</Md>
        <TrainOnILD ild={ild3} t={train3} span={[0, 80]} section={30} peak={{ x: 30, side: 1 }} what="shear at 30 ft" />
      </div>
    ),
  },
  {
    id: '2010-11-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: 21,
    topics: ['wheel'],
    title: 'Max reaction at D of a beam with a drop-in span (wheel loads of Fig. 3)',
    pages: PA,
    text: `Calculate the maximum reaction of support **D** of the beam in Fig. 4 due to the wheel loads in Fig. 3.

Fig. 4: roller B at 0; internal hinge C at 15 ft; roller D at 25 ft; F at 45 ft; pin E at 65 ft.`,
    figure: () => <Figure model={b4} />,
    checks: () => [
      { key: 'peak', label: '$R_D$ ILD ordinate at the hinge C', value: ildAt(ild4RD(), 15) },
      { key: 'rd', label: 'Maximum reaction at D', value: trainExtremes(ild4RD(), train3).max.value, unit: 'k' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**ILD of $R_D$.** C–D–E is a beam on D and E with a 10 ft overhang to the hinge C. A load on it gives $R_D = (65 - x)/40$, i.e. **1.25 at C**, 1 at D, 0 at E. The drop-in span B–C passes $x/15$ of a load to C, so the ILD falls linearly from 1.25 at C to 0 at B. The peak is at the hinge C. Try each heavy wheel at C, with the train travelling right → left (wheel 1 leads), and keep the best.`}</Md>
        <ILDStack model={b4} path={p4} items={[{ label: 'R_D', resp: { kind: 'reaction', node: 'D', comp: 'y' } }]} showTable={false} />
        <TrainOnILD ild={ild4RD()} t={train3} span={[0, 65]} section={15} peak={{ x: 15, side: 1 }} what="R_D" />
      </div>
    ),
    notes: ['Fig. 4 read as: roller at B, hinge at C (15 ft), roller at D (25 ft), pin at E (65 ft), F midway between D and E.'],
  },
  {
    id: '2010-11-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: 21,
    topics: ['floor'],
    title: 'Truss ILDs: U3L3, U4U5, U5U6, L5L6 (load on bottom chord)',
    pages: PA,
    text: `Draw influence lines for the bar forces in **U3L3, U4U5, U5U6 and L5L6** of the truss in Fig. 5 (load moves over the bottom chord).

Bottom chord L1…L7 at 0, 12, 24, 36, 52, 68, 76 ft (pin at L1, roller at L7). Top chord: U1 (12 ft high), U2, U3 on a straight line up to U4 (21 ft high, above L4), then flat at 21 ft through U5 (44 ft), U6 (60 ft) and U7 (above L7). Verticals U1L1, U2L2, U3L3, U4L4, U7L7; diagonals U1L2, U2L3, U3L4, then the Warren pattern L4U5, U5L5, L5U6, U6L6, L6U7.`,
    figure: () => <Figure model={t5} />,
    checks: () => [
      { key: 'u3l3', label: 'U3L3 ordinate with the unit load at L3', value: ildAt(ild5('U3L3'), 24) },
      { key: 'u5u6', label: 'U5U6 most negative ordinate', value: ildExtremes(ild5('U5U6')).min.y },
      { key: 'l5l6', label: 'L5L6 peak ordinate', value: ildExtremes(ild5('L5L6')).max.y },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Panel-point loading: compute each ordinate with the unit load at a bottom joint and join the points with straight lines.
- **U4U5, U5U6** (top chord, horizontal): section through the panel, moments about the bottom joint below the opposite end. U5U6: section through U5U6, U5L5/L5U6, L5L6 and moments about **L5** → $F = -M_{L5}/21$ (compression). U4U5: moments about **L4** → $-M_{L4}/21$.
- **L5L6** (bottom chord): moments about **U6**, the opposite top joint → $+M_{x=60}/21$. Because 60 ft falls between the panel points L5 (52) and L6 (68), the ILD peaks at those joints and is interpolated between them.
- **U3L3**: joint L3 also has the diagonal U2L3, so find U2L3 first. Section through U2U3, U2L3, L2L3 with moments about O, where the inclined top chord ($y = 12 + x/4$) meets the bottom chord, 48 ft left of L1. Then $\\sum F_y$ at joint L3 gives U3L3 = −(vertical component of U2L3), plus 1 when the unit load is at L3.`}</Md>
        <ILDStack
          model={t5}
          path={p5}
          items={[
            { label: 'F U3L3', resp: { kind: 'force', member: 'U3L3' } },
            { label: 'F U4U5', resp: { kind: 'force', member: 'U4U5' } },
            { label: 'F U5U6', resp: { kind: 'force', member: 'U5U6' } },
            { label: 'F L5L6', resp: { kind: 'force', member: 'L5L6' } },
          ]}
        />
      </div>
    ),
    notes: [
      'Panel lengths read from the dimension line: 3 @ 12 ft, then 5 @ 8 ft (U5 at 44, L5 at 52, U6 at 60, L6 at 68, L7/U7 at 76 ft).',
      'U2 and U3 are assumed to lie on the straight line from U1 (12 ft) to U4 (21 ft), giving heights of 15 and 18 ft. The paper gives no separate heights for them.',
    ],
  },
  {
    id: '2010-11-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: 21,
    topics: ['ild'],
    title: 'Max shear & moment at F: dead 3 k/ft + uniform 5 k/ft + roving 50 k',
    pages: PA,
    text: `Calculate the maximum value of the shear force and bending moment at **F** of the beam in Fig. 4 due to the combined effect of (a) self weight = 3 kip/ft, (b) moving uniform live load = 5 kip/ft, (c) roving concentrated live load = 50 kip. F is midway between D (25 ft) and E (65 ft).`,
    figure: () => <Figure model={b4} />,
    checks: () => {
      const v = uniformPlusConcentrated(ild6V(), 5, 50, 3)
      const m = uniformPlusConcentrated(ild6M(), 5, 50, 3)
      return [
        { key: 'vp', label: 'Max positive shear at F (incl. DL)', value: v.maxPos.total, unit: 'k' },
        { key: 'vn', label: 'Max negative shear at F (incl. DL)', value: v.maxNeg.total, unit: 'k' },
        { key: 'mp', label: 'Max positive moment at F (incl. DL)', value: m.maxPos.total, unit: 'k-ft' },
        { key: 'mn', label: 'Max negative moment at F (incl. DL)', value: m.maxNeg.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`ILDs at F from statics: for a load on D–E, simple-span values (shear −0.5 | +0.5 at F, moment peak $20\\times20/40 = 10$). Over the overhang D–C they extend linearly to the hinge: shear $V_F = -R_E = (25 - x)/40$ → **+0.25** at C, moment $M_F = 20R_E$ → −5 at C. Over the drop-in B–C they fall back to 0 at B. **Max effect** = dead load × net area + live UDL over the region of matching sign + 50 k at the largest ordinate of that sign.`}</Md>
        <ILDStack
          model={b4}
          path={p4}
          items={[
            { label: 'V_F', resp: { kind: 'shear', member: 'DF', x: 20 } },
            { label: 'M_F', resp: { kind: 'moment', member: 'DF', x: 20 } },
          ]}
        />
        <MaxEffect ild={ild6V()} w={5} P={50} wd={3} label="Shear at F" />
        <MaxEffect ild={ild6M()} w={5} P={50} wd={3} label="Moment at F" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2010-11-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: 21,
    topics: ['floor'],
    title: 'Max forces in U5L4 and L3L4: dead 3 k/ft + uniform 5 k/ft + roving 50 k',
    pages: PA,
    text: `Calculate the maximum bar force in **U5L4** and **L3L4** of the truss in Fig. 5 due to the combined effect of (a) self weight = 3 kips/ft, (b) moving uniform live load = 5 kips/ft, (c) roving concentrated live load = 50 kips.`,
    figure: () => <Figure model={t5} />,
    checks: () => {
      const d = uniformPlusConcentrated(ild5('U5L4'), 5, 50, 3)
      const c = uniformPlusConcentrated(ild5('L3L4'), 5, 50, 3)
      return [
        { key: 'dT', label: 'U5L4: max tension (incl. DL)', value: d.maxPos.total, unit: 'k' },
        { key: 'dC', label: 'U5L4: max compression (incl. DL, negative)', value: d.maxNeg.total, unit: 'k' },
        { key: 'c', label: 'L3L4: max tension (incl. DL)', value: c.maxPos.total, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Use the panel-point ILDs (straight between bottom joints). **L3L4**: section through U3U4, U3L4, L3L4 and moments about U3 → $F = M_{L3}/18$, always tension. **U5L4**: the section through U4U5, U5L4, L4L5 lies where the top chord is horizontal, so the diagonal carries the panel shear: $F\\sin\\theta = \\pm V_{panel}$. Its ILD changes sign inside panel L4–L5, so it can be either tension or compression. Load the + and − parts separately.`}</Md>
        <ILDStack
          model={t5}
          path={p5}
          items={[
            { label: 'F U5L4', resp: { kind: 'force', member: 'U5L4' } },
            { label: 'F L3L4', resp: { kind: 'force', member: 'L3L4' } },
          ]}
        />
        <MaxEffect ild={ild5('U5L4')} w={5} P={50} wd={3} label="Diagonal U5L4" />
        <MaxEffect ild={ild5('L3L4')} w={5} P={50} wd={3} label="Bottom chord L3L4" />
      </div>
    ),
    notes: ['Dead load taken as 3 k/ft along the bottom chord, delivered at the panel points like the live load.'],
  },
  // ---------------------------------------------------------------- Section B
  {
    id: '2010-11-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: 21,
    topics: ['ild'],
    title: 'ILDs for shear and moment at a-a (column) and b-b (beam) of a bent with a link',
    pages: PB,
    text: `Draw influence lines for both shear and moment at sections **a-a** and **b-b** of the structure in Fig. 6. The unit load moves from A to B.

Beam A–B at 15 ft height, 26 ft long; column from the beam (6 ft from A) down to a pin at C. At B the beam is pinned to an inclined link B–D going to a pin support D (4 ft right of and 3 ft below B). Section a-a is on the column 4 ft above C; section b-b is on the beam 5 ft left of B.`,
    figure: () => <Figure model={f8} />,
    checks: () => [
      { key: 'Va', label: 'Column shear at a-a, unit load at A', value: ildAt(ild8(R8.Va), 0) },
      { key: 'Ma', label: 'Column moment at a-a, unit load at A', value: ildAt(ild8(R8.Ma), 0), unit: 'ft' },
      { key: 'Mb', label: 'Moment at b-b, unit load at b-b', value: ildAt(ild8(R8.Mb), 21), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Statics.** BD is a two-force link. Let $T$ be its tension, acting on the beam at B along B→D, i.e. $T(0.8, -0.6)$. Moments about C for a unit load at x from A:
$$\\sum M_C = 0:\\ -(x - 6) - 0.6T(20) - 0.8T(15) = 0 \\Rightarrow T = \\frac{6 - x}{24}$$
so the link is in tension for loads on the cantilever A–J and in compression for loads beyond the column. Horizontal equilibrium: $C_x = -0.8T$.
- **a-a (column, 4 ft above C):** the column shear is the horizontal force below the section, $V_{aa} = -C_x = 0.8T = (6 - x)/30$, and $M_{aa} = 4V_{aa}$. Both are **linear in x** and vanish at x = 6 ft (load right over the column): +0.2 and +0.8 at A, −0.667 and −2.667 at B.
- **b-b (beam, 5 ft left of B, x = 21 ft):** take the free body to the right of b-b (5 ft of beam + the link force). Loads left of b-b: $V = 0.6T$, $M = -0.6T(5) = -3T$. Loads right of b-b add the unit load: $V = 0.6T + 1$ (a jump of 1 at b-b) and $M = -3T - (x - 21)$.`}</Md>
        <ILDStack
          model={f8}
          path={p8}
          items={[
            { label: 'V at a-a (column, read C→up)', resp: R8.Va },
            { label: 'M at a-a', resp: R8.Ma },
            { label: 'V at b-b', resp: R8.Vb },
            { label: 'M at b-b', resp: R8.Mb },
          ]}
        />
        <p className="text-xs text-faint">Column sign convention: the column is read from C upward. Shear is + when the force on the part below the section acts in the column's local +y direction (to the left). Moment is + with tension on the right face.</p>
      </div>
    ),
    notes: ['Link B–D read as a pin-ended inclined bar (4 ft horizontal, 3 ft vertical) to a pinned support at D. The joint between the beam and the column (6 ft from A) is rigid.'],
  },
  {
    id: '2010-11-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: 21,
    topics: ['frames'],
    title: 'Frame with a link column and wall roller: AFD, SFD, BMD and joint E (V_F = −20 k)',
    pages: PB,
    text: `Draw axial force, shear force and bending moment diagrams for the structure in Fig. 7. Also draw the free-body diagram of joint E. Given: shear at F = −20 k.

Beam D–E–C at 16 ft above B: D at 0, 60 k at 4 ft, F at 7 ft, 80 k at 10 ft, E at 16 ft, a 160 k-ft anticlockwise couple at 24 ft, C at 28 ft (roller against a vertical wall). D is a hinge on top of the link D–A (8 ft, pinned at A). Column E–B (16 ft) is rigidly joined at E and pinned at B.`,
    figure: () => <Figure model={f9Fig} dims={[0, 4, 7, 10, 16, 24, 28]} dimY={[0, 8, 16]} />,
    checks: () => {
      const r = r9()
      return [
        { key: 'By', label: 'Vertical reaction at B', value: r.reaction('B').ry, unit: 'k' },
        { key: 'Cx', label: 'Horizontal reaction at C (→ +)', value: r.reaction('C').rx, unit: 'k' },
        { key: 'ME', label: 'Moment in beam just left of E (sagging +)', value: r.member('FE').M(9 - 1e-6), unit: 'k-ft' },
        { key: 'MBE', label: 'Moment at the top of column BE (magnitude)', value: Math.abs(r.member('BE').M(16 - 1e-6)), unit: 'k-ft', magnitude: true },
      ]
    },
    solution: () => {
      const r = r9()
      const je = jointE()
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Determinacy.** Link DA (1) + pin B (2) + roller C (1) = 4 unknowns vs 3 equations, so it is indeterminate by one. The given shear removes the redundant: just right of D, only the link force acts to the left of F, so
$$V_F = R_A - 60 = -20 \\Rightarrow R_A = 40\\text{ k (link DA in compression)}$$
**Then statics:** $\\sum F_y$: $B_y = 60 + 80 - 40 = 100$ k. $\\sum M_B = 0$ (B at x = 16, beam 16 ft above B):
$-40(16) + 60(12) + 80(6) + 160 - C_x(16) = 0 \\Rightarrow C_x = 45$ k, and $\\sum F_x$: $B_x = -45$ k.`}</Md>
          <FrameSolution model={f9} kinds={['N', 'V', 'M']} />
          <div>
            <div className="font-semibold mb-1">Free body of joint E (forces exerted on the joint by each member)</div>
            <table className="tbl w-auto">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Horizontal (k)</th>
                  <th>Vertical (k)</th>
                  <th>Moment (k-ft)</th>
                </tr>
              </thead>
              <tbody>
                {je.map((q) => (
                  <tr key={q.id}>
                    <td className="txt">{q.name}</td>
                    <td>{`${fmt(Math.abs(q.fx))} ${q.fx > 1e-9 ? '→' : q.fx < -1e-9 ? '←' : ''}`}</td>
                    <td>{`${fmt(Math.abs(q.fy))} ${q.fy > 1e-9 ? '↑' : q.fy < -1e-9 ? '↓' : ''}`}</td>
                    <td>{`${fmt(Math.abs(q.m))} ${q.m > 1e-9 ? '↺' : q.m < -1e-9 ? '↻' : ''}`}</td>
                  </tr>
                ))}
                <tr>
                  <td className="txt font-bold">Σ (must be 0)</td>
                  <td>{fmt(je.reduce((s, q) => s + q.fx, 0))}</td>
                  <td>{fmt(je.reduce((s, q) => s + q.fy, 0))}</td>
                  <td>{fmt(je.reduce((s, q) => s + q.m, 0))}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-faint mt-1">At E the beam brings 100 k down (its end shear) and the column pushes 100 k up. The 45 k horizontal passes from beam E–C into the column. Moments: beam left 560, beam right 160, column 720 k-ft, which balance (560 + 160 = 720).</p>
          </div>
        </div>
      )
    },
    notes: [
      'The solver replaces the link reaction with the known 40 k at A (from V_F = −20 k). An auxiliary horizontal restraint at A, not drawn, only keeps the link from swinging and carries no force.',
      'Read from Fig. 7: the couple 160 k-ft at x = 24 ft is anticlockwise. C is a roller bearing on a vertical wall (horizontal reaction). F is midway between the 60 k and 80 k loads (x = 7 ft).',
    ],
  },
  {
    id: '2010-11-B10',
    paper: PAPER,
    sec: 'B',
    no: '10',
    marks: 21,
    topics: ['truss'],
    title: 'Subdivided (K-type) truss: forces in U2U3, U2M3, M3U4, M3L2',
    pages: PB,
    text: `Determine the bar forces in members **U2U3, U2M3, M3U4 and M3L2** of the truss in Fig. 8. Six top panels @ 6 ft = 36 ft, depth 16 ft; bottom joints L0, L1, L2, L3 at 12 ft spacing; mid-height joints M1, M3, M5 at 8 ft. Loads: 10 k at U1, 20 k at U3, 20 k at L1, 25 k at L2. Pin at L0, roller at L3.`,
    figure: () => <Figure model={t10} />,
    checks: () => {
      const r = solve(t10)
      return ASK10.map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => {
      const r = solve(t10)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Reactions:** $\\sum M_{L0}$: $R_{L3}(36) = 10(6) + 20(18) + 20(12) + 25(24)$ → $R_{L3} = ${fmt(r.reaction('L3').ry)}$ k, $R_{L0} = ${fmt(r.reaction('L0').ry)}$ k.

**Joint U3:** the short vertical U3M3 carries the 20 k load straight down: $F_{U3M3} = 20$ k (C), and $F_{U2U3} = F_{U3U4}$.
**Joint M3:** members U3M3, U2M3, M3U4, M3L2. Two diagonals go up (U2M3, M3U4) and one goes down (M3L2), so a single joint is not enough. Take the section through U2U3, U2M3, M3L2 and L1L2 and use moments about L2 for U2U3 (the 16 ft arm). Then joint M3 (horizontal and vertical) gives M3U4 and M3L2.`}</Md>
          <TrussSolution model={t10} asked={ASK10} />
        </div>
      )
    },
  },
  {
    id: '2010-11-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: 21,
    topics: ['floor'],
    title: 'Pitched truss with counters: force in counter AD',
    pages: PB,
    text: `Calculate the force in the counter **AD** of the truss in Fig. 9 due to a moving UDL of 10 kip/ft accompanied by a roving concentration of 90 kip. The dead load of the truss is 2 kip/ft.

Span 4 @ 12 ft = 48 ft. Bottom joints (left support), A, B, (A′), (right support). Top joints C (above A, 9 ft), D (above B, 16 ft), C′ (above A′, 9 ft). Main diagonals C–B and B–C′; counters A–D and D–A′ (dashed).`,
    figure: () => <Figure model={t11fig} />,
    checks: () => {
      const m = uniformPlusConcentrated(ild11main(), 10, 90, 2)
      const c = uniformPlusConcentrated(ild11ctr(), 10, 90, 2)
      return [
        { key: 'mDL', label: 'Main diagonal CB under dead load (T +)', value: m.dead, unit: 'k' },
        { key: 'mC', label: 'Main diagonal CB: max compression (DL + LL, negative)', value: m.maxNeg.total, unit: 'k' },
        { key: 'ctr', label: 'Force in counter AD (max tension)', value: c.maxPos.total, unit: 'k' },
      ]
    },
    solution: () => {
      const c = uniformPlusConcentrated(ild11ctr(), 10, 90, 2)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Counters act in tension only.** In panel A–B, either the main diagonal CB or the counter AD works, never both. (1) Find the main diagonal's ILD with the counter absent and show that it would be compressed. (2) Remove CB, find the ILD of AD and maximise its **tension**: dead load on the whole span + UDL over the positive part + 90 k at the peak.

Section through panel A–B (CD, diagonal, AB). The chords meet where the line of CD (slope 7/12) crosses the bottom chord, $12 - 9(12/7) = -3.43$ ft (left of the support). Moments about that point give the diagonal force for a unit load at each panel point.`}</Md>
          <ILDStack model={t11main} path={p11} items={[{ label: 'CB (main diagonal, counter absent)', resp: { kind: 'force', member: 'CB' } }]} />
          <ILDStack model={t11ctr} path={p11} items={[{ label: 'AD (counter, main diagonal removed)', resp: { kind: 'force', member: 'AD' } }]} />
          <MaxEffect ild={ild11main()} w={10} P={90} wd={2} label="Main diagonal CB" />
          <MaxEffect ild={ild11ctr()} w={10} P={90} wd={2} label="Counter AD" />
          <p className="text-base">
            Force in the counter AD = <b className="num">{fmt(c.maxPos.total)} k (tension)</b>: dead {fmt(c.dead)} k + uniform {fmt(10 * c.areas.pos)} k + concentrated {fmt(90 * c.extremes.max.y)} k (90 k at A).
          </p>
        </div>
      )
    },
    notes: [
      'All loads (dead and live) are taken at the bottom-chord panel points.',
      'With this steep top chord the main diagonal CB is compressed even under dead load. The counter procedure (remove the main diagonal, maximise counter tension) is applied as the question intends.',
    ],
  },
  {
    id: '2010-11-B12',
    paper: PAPER,
    sec: 'B',
    no: '12',
    marks: 21,
    topics: ['cable'],
    title: 'State and derive the General Cable Theorem',
    pages: [14],
    text: `State and derive the General Cable Theorem.`,
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Statement.** At any point of a cable carrying **vertical loads**, the horizontal component of the cable tension × the vertical distance from that point down to the cable chord = the bending moment at the same section of a simply supported beam with the same span and the same loads.
$$H\\,y_m = M_m$$
**Derivation.** Let the cable hang from A (left) and B (right) with span L, chord AB inclined so that B is $h$ above A. Loads $P_1, P_2, \\dots$ are vertical, so the horizontal component $H$ of the tension is the same everywhere (ΣFx = 0 on any segment). Let the support reactions be $V_A, V_B$ vertical plus $H$ horizontal at each end.

1. **Whole cable**, moments about B: $V_A L - H h - \\sum P_i (L - x_i) = 0$, so
$$V_A = \\frac{\\sum P_i (L - x_i)}{L} + \\frac{Hh}{L} = R_A + \\frac{Hh}{L}$$
where $R_A$ is the left reaction of a simple beam with the same loads.
2. **Left part** up to a point m at x (the cable is flexible, so the moment there is zero). Let $y$ be the depth of m below the level of A, so the chord is $hx/L$ above A at that x and the depth of m below the chord is $y_m = y + hx/L$. Moments about m:
$$V_A x - H y - \\sum_{left} P_i (x - x_i) = 0$$
3. Substitute $V_A$:
$$\\underbrace{R_A x - \\sum_{left} P_i(x - x_i)}_{M_m\\ (\\text{beam moment at } x)} + H\\frac{hx}{L} - Hy = 0 \\;\\Rightarrow\\; H\\left(y + \\frac{hx}{L}\\right) = M_m$$
$$\\boxed{H\\,y_m = M_m}$$
**Uses:** (i) cable shape = the beam BMD scaled by 1/H, so a uniform load per horizontal length gives a parabola; (ii) with the sag at one point known, $H = M_m/y_m$ there, and then every other sag follows. For a uniform load and midspan sag $h_c$: $H = wL^2/8h_c$.`}</Md>
        <FnPlot f={(x) => -(x * (100 - x)) / 100} x0={0} x1={100} title="Cable sag below the chord ∝ simple-beam BMD (uniform load)" color="var(--c-accent)" marks={[50]} height={140} />
      </div>
    ),
  },
  {
    id: '2010-11-B13',
    paper: PAPER,
    sec: 'B',
    no: '13',
    marks: 21,
    topics: ['cable'],
    title: 'Inclined parabolic cable: slope at 400 ft, max tension, length',
    pages: [14],
    text: `A cable has a span of 500 ft and a sag ratio of 1/40. The slope of the cable chord is $\\tan\\gamma = 0.7$. The load on the cable is 1 kip per horizontal ft. Find (a) the slope of the cable at 400 ft from the left support, (b) the maximum tension in the cable and (c) the length of the loaded cable.`,
    figure: () => <StructureView model={cableModel()} showLoads={false} autoDimX={[0, 400, 500]} maxHeight={260} />,
    checks: () => {
      const c = c13()
      return [
        { key: 'H', label: 'Horizontal tension H', value: c.H, unit: 'k' },
        { key: 's', label: 'Slope dy/dx at 400 ft', value: c.slope(400) },
        { key: 'T', label: 'Maximum tension', value: c.Tmax, unit: 'k' },
        { key: 'S', label: 'Length of the cable', value: c.length, unit: 'ft', tol: 0.001 },
      ]
    },
    solution: () => {
      const c = c13()
      const g = Math.atan(0.7)
      const approx = (500 / Math.cos(g)) * (1 + (8 / 3) * (1 / 40) ** 2 * Math.cos(g) ** 4)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Sag (measured vertically from the chord at midspan) $h = L/40 = 12.5$ ft; the right support is $0.7\\times500 = 350$ ft higher. By the general cable theorem, $H\\,y_m = M_m$ at midspan: $H = \\dfrac{wL^2}{8h} = \\dfrac{1(500)^2}{8(12.5)}$. The cable equation (y up from A):`}</Md>
          <Tex block>{`y = x\\tan\\gamma - \\frac{4h}{L^2}x(L - x),\\qquad \\frac{dy}{dx} = \\tan\\gamma - \\frac{4h}{L^2}(L - 2x),\\qquad H = ${fmt(c.H)}\\text{ k}`}</Tex>
          <Tex block>{`\\text{(a)}\\ \\left.\\frac{dy}{dx}\\right|_{400} = 0.7 - \\frac{4(12.5)}{500^2}(500 - 800) = \\mathbf{${fmt(c.slope(400), 4)}}\\ \\Rightarrow\\ \\theta = ${fmt((Math.atan(c.slope(400)) * 180) / Math.PI, 3)}^\\circ`}</Tex>
          <Tex block>{`\\text{(b)}\\ T_{max}\\ \\text{at the higher (right) support: slope} = 0.7 + \\frac{4h}{L} = ${fmt(c.slope(500), 3)},\\ T = H\\sqrt{1 + ${fmt(c.slope(500), 3)}^2} = \\mathbf{${fmt(c.Tmax)}}\\text{ k}`}</Tex>
          <Tex block>{`\\text{(c)}\\ S = \\int_0^L\\sqrt{1 + y'^2}\\,dx = \\mathbf{${fmt(c.length, 2)}}\\text{ ft}\\quad\\left(\\text{approx. } L\\sec\\gamma\\left[1 + \\tfrac83 n^2\\cos^4\\gamma\\right] = ${fmt(approx, 2)}\\text{ ft}\\right)`}</Tex>
          <p className="text-xs text-faint">The slope at the left support is {fmt(c.slope(0), 3)} {'>'} 0, so the cable rises all the way from A: the lowest point is the left support itself. Tension at A = {fmt(c.T(0))} k.</p>
        </div>
      )
    },
    notes: ['Sag ratio taken as n = h/L with h the vertical sag below the chord at midspan, and the right support taken as the higher one.'],
  },
  {
    id: '2010-11-B14',
    paper: PAPER,
    sec: 'B',
    no: '14',
    marks: 20,
    topics: ['cable'],
    title: 'Suspension bridge (3-hinged girder): girder SFD & BMD',
    pages: PB,
    text: `Draw shear force and bending moment diagrams for the stiffening girder of the suspension bridge in Fig. 10. Span 10 @ 100 ft = 1000 ft, sag 100 ft, girder hinged at the towers (C left, A right) and at midspan B. Loads: 20 k at 300 ft and 20 k at 600 ft from C.`,
    figure: () => <StructureView model={sm14} autoDimX={[0, 300, 500, 600, 1000]} maxHeight={260} />,
    checks: () => {
      const s = stiffenedSuspension(sus14)
      return [
        { key: 'H', label: 'Horizontal cable tension H', value: s.H, unit: 'k' },
        { key: 'q', label: 'Hanger force (100 ft spacing)', value: s.q * 100, unit: 'k' },
        { key: 'M300', label: 'Girder moment at 300 ft', value: s.M(300), unit: 'k-ft' },
        { key: 'M600', label: 'Girder moment at 600 ft', value: s.M(600), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Simple beam C–A: $R_C = 20(700)/1000 + 20(400)/1000 = 22$ k, $M_0(500) = 22(500) - 20(200) = 7000$ k-ft. Zero moment at the centre hinge: $H = M_0(500)/h = 7000/100$. The hangers then carry a uniform upward $q = 8Hh/L^2$ on the girder, and $M(x) = M_0(x) - H\\,y(x)$.`}</Md>
        <SuspensionSolution {...sus14} panel={100} />
      </div>
    ),
    notes: ['Load positions read from the hangers: 20 k at the 3rd hanger (300 ft) and at the 6th hanger (600 ft) from the left tower C.'],
  },
]
