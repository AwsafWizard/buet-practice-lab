// 2012-13 term final (held 10 May 2014) — scan pages 21–25 (figures hand-drawn; read from images).
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { cantileverMethod, type GridFrame } from '../../engine/approx'
import { trainExtremes, ssMomentILD, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { storeyForces, importanceWind } from '../../engine/wind'
import { stiffenedSuspension, type PointLoad } from '../../engine/cable'
import type { Load, Model } from '../../engine/model'
import { beamOf, F as Fxy, floorSystem, H, model, Mo, P, truss } from '../../kit/builders'
import { ApproxSolution, Figure, ILDStack, MaxEffect, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { WindAnalytical } from '../../kit/loads'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'
import { ApproxFig } from './p2023'
import { verticalFrame, VerticalSolution } from './p2015'

const PG = { A1: [21, 23], A2: [21, 23], A3: [21, 23], A4: [21, 23], A5: [21, 23], A6: [21, 23], A7: [21, 23], B8: [22, 25], B9: [22, 24], B10: [22, 24], B11: [22, 24], B12: [22, 24], B13: [22, 24], B14: [22, 24] }

// ============================================================================ Q1 floor beam system
const fs1 = floorSystem({
  floorBeams: [16, 28, 40, 52],
  stringers: [
    [0, 34],
    [34, 52],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 52, type: 'roller' },
  ],
  names: { 0: '0', 16: '1', 28: '2', 40: '3', 52: '4' },
})
const ild1 = (r: ReturnType<typeof fs1.fbr>) => influenceLine(fs1.model, fs1.path, r)
const r1 = { V12: fs1.shear(22), M2: fs1.moment(28), M3: fs1.moment(40), F2: fs1.fbr(28) }

// ============================================================================ Q2 frame ILD
const f2 = model('A:0,10 B:18,10 C:34,10 D:18,0 E:34,0 Q:18,6', 'A-B B-C C-E D-Q Q-B', 'D:pin E:roller@135')
const p2 = { kind: 'members' as const, members: ['AB', 'BC'] }
const r2 = {
  VP: { kind: 'shear' as const, member: 'BC', x: 7 },
  MP: { kind: 'moment' as const, member: 'BC', x: 7 },
  MQ: { kind: 'moment' as const, member: 'DQ', x: 6, side: -1 as const },
}

// ============================================================================ Q3 / Q6 truss
const T3N =
  'L0:0,0 L1:20,0 L2:40,0 L3:60,0 L4:80,0 L5:100,0 L6:120,0 L7:140,0 L8:160,0 L9:180,0 U0:0,40 U1:20,40 U2:40,40 U3:60,40 U4:80,40 U5:100,45 U6:120,50 U7:140,45 U8:160,40 M3:60,20 M4:80,20'
const T3M =
  'B1=L0-L1 L1-L2 D2=L2-L3 L3-L4 L4-L5 E1=L5-L6 E2=L6-L7 L7-L8 B2=L8-L9 ' +
  'U0-U1 U1-U2 D1=U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 U7-U8 A2=U8-L9 ' +
  'U0-L0 U1-L1 U2-L2 U3-M3 M3-L3 U4-M4 M4-L4 U5-L5 U6-L6 U7-L7 U8-L8 ' +
  'A1=L0-U1 C1=L1-U2 C2=L2-U3 U4-M3 K1=M3-L4 M4-U5 M4-L5 F1=U5-L6 F2=L6-U7 L7-U8'
const t3 = truss(T3N, T3M, 'L0:pin L9:roller', [P('U0', 90), P('U1', 50), P('U4', 40), P('L4', 60), P('U6', 40), H('U6', 20), H('U8', 60)])
for (const m of t3.members) if (/^[A-F][12]$|^K1$/.test(m.id)) m.label = m.id
const t6 = truss(T3N, T3M, 'L0:pin L9:roller')
for (const m of t6.members) if (/^[A-F][12]$|^K1$/.test(m.id)) m.label = m.id
const p6 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'] }
const ild6 = (id: string) => influenceLine(t6, p6, { kind: 'force', member: id })

// ============================================================================ Q4 / Q7 compound beam
const b4 = beamOf('1:0 2:8:roller 3:14 4*:19 A:22 5:25:roller 6:31 7:37:pin 8:45')
const p4 = { kind: 'members' as const, members: b4.members.map((m) => m.id) }
const r4 = {
  R5: { kind: 'reaction' as const, node: '5', comp: 'y' as const },
  VA: { kind: 'shear' as const, member: 'A5', x: 0 },
  M3: { kind: 'moment' as const, member: '34', x: 0 },
  M5: { kind: 'moment' as const, member: '56', x: 0 },
  M6: { kind: 'moment' as const, member: '67', x: 0 },
  V5r: { kind: 'shear' as const, member: '56', x: 0, side: 1 as const },
}
const ild4 = (r: (typeof r4)[keyof typeof r4]) => influenceLine(b4, p4, r)

// ============================================================================ Q5 wheel loads
const train5: Train = { P: [20, 20, 80, 80, 80, 80, 80, 80, 20, 20], gaps: [4, 10, 6, 6, 12, 6, 6, 10, 4], udl: { w: 8, gap: 8 } }
const ild5 = ssMomentILD(80, 20)

// ============================================================================ Q8 wind (BNBC 1993 projected area method)
const CZ_A: [number, number][] = [
  [4.5, 0.368],
  [6, 0.415],
  [9, 0.497],
  [12, 0.565],
  [15, 0.624],
]
const czA = (z: number) => {
  if (z <= 4.5) return 0.368
  for (let i = 0; i < CZ_A.length - 1; i++) {
    const [z0, c0] = CZ_A[i]
    const [z1, c1] = CZ_A[i + 1]
    if (z <= z1) return c0 + ((c1 - c0) * (z - z0)) / (z1 - z0)
  }
  return CZ_A[CZ_A.length - 1][1]
}
const w93 = (() => {
  const Vb = 210,
    Cc = 47.2e-6,
    CI = 1.25,
    Gh = 1.418,
    Cp = 1.45,
    B = 60
  const levels = [3, 6, 9, 12, 15]
  const rows = levels.map((z, k) => {
    const trib = k === levels.length - 1 ? 1.5 : 3
    const Cz = czA(z)
    const q = Cc * CI * Cz * Vb * Vb
    const p = Gh * Cp * q
    return { level: k + 1, z, Cz, q, p, trib, A: trib * B, F: p * trib * B }
  })
  const base = rows.reduce((s, r) => s + r.F, 0)
  return { Vb, Cc, CI, Gh, Cp, B, rows, base, k: Cc * CI * Vb * Vb }
})()
const w20 = { V: 65.7, exp: 'A' as const, occ: 4 as const, G: 0.85, B: 60, L: 30, levels: [3, 6, 9, 12, 15] }

// ============================================================================ Q9 suspension bridge
const loads9: PointLoad[] = [
  { x: 300, P: 20 },
  { x: 600, P: 20 },
]
const s9 = stiffenedSuspension({ L: 1000, h: 100, xh: 500, loads: loads9 })

// ============================================================================ Q10 truss relative displacement
const E = 30000
const t10 = truss('A:0,0 D:4,0 B:0,3 C:4,3', 'A-B B-C C-D A-D A-C', 'A:roller D:pin', [Fxy('B', 80, -60, '100k (4:3)')])
const EA10 = (id: string) => E * (id === 'AC' ? 0.5 : 1)
t10.members.forEach((m) => (m.label = m.id === 'AC' ? '0.5 in²' : '1 in²'))
const pair10: Load[] = [
  { kind: 'node', node: 'B', fx: 0.8, fy: -0.6 },
  { kind: 'node', node: 'D', fx: -0.8, fy: 0.6 },
]
const vw10 = () => virtualWork(t10, t10.loads, pair10, { EA: EA10 })

// ============================================================================ Q11 cantilever method
const g11: GridFrame = {
  xs: [0, 10, 30, 60],
  heights: [20, 10],
  loads: [23, 46],
  loadSide: ['left', 'left'],
  areas: [
    [4, 3, 2, 1],
    [4, 3, 2, 1],
  ],
}

// ============================================================================ Q12 braced tower (one redundant)
const tw = truss(
  'A:0,0 B:12,0 C:0,16 D:12,16 E:0,25 F:12,25 G:0,34 H:12,34',
  'A-C C-E E-G B-D D-F F-H A-B G-H A-D C-B C-F E-D E-H G-F',
  'A:pin H:roller@0',
  [H('G', 16, '16k'), H('E', 32, '32k'), H('C', -32, '32k'), H('F', 20, '20k'), H('D', 30, '30k'), P('B', 36, '36k')],
)
const tower = (() => {
  const base: Model = { ...tw, members: tw.members.filter((m) => m.id !== 'CB') }
  const r0 = solve(base)
  const r1 = solve(base, [
    { kind: 'node', node: 'C', fx: 0.6, fy: -0.8 },
    { kind: 'node', node: 'B', fx: -0.6, fy: 0.8 },
  ])
  // equal share in the bottom panel: N_AD = −N_CB
  const n0 = r0.member('AD').N(1)
  const n1 = r1.member('AD').N(1)
  const X = -n0 / (1 + n1)
  const forces = new Map<string, number>()
  for (const m of tw.members) forces.set(m.id, m.id === 'CB' ? X : r0.member(m.id).N(1) + X * r1.member(m.id).N(1))
  const exact = solve(tw)
  const exactF = new Map<string, number>(tw.members.map((m) => [m.id, exact.member(m.id).N(1)]))
  return { forces, X, r0, exact, exactF }
})()

// ============================================================================ Q13 rotation at E
const f13 = model('A:0,0 B:18,0 D:28,0 E:38,0 C:28,-8', 'A-B B-D D-E C-D', 'A:fixed', [P('B', 5, '5k'), Mo('C', -60, '60 k-ft')])
const EI13 = (E * 72) / 144
const vw13 = () => virtualWork(f13, f13.loads, [Mo('E', 1)], { EI: () => EI13 })

// ============================================================================ Q14 vertical loads
const vf14 = verticalFrame({
  nodes: 'A:0,0 B:20,0 C:30,0 D:55,0 E:0,20 F:20,20 G:30,20 H:55,20 I:0,30 J:30,30',
  beams: 'E-F F-G G-H I-J',
  cols: 'A-E B-F C-G D-H E-I G-J',
  supports: 'A:pin B:pin C:pin D:pin',
  w: 8,
  wLabel: '5 + 3 k/ft',
})

export const Q2012: PYQ[] = [
  {
    id: '2012-13-A1',
    paper: '2012-13',
    sec: 'A',
    no: '1',
    marks: 28,
    topics: ['floor'],
    title: 'Girder with floor beams and overhanging stringers: V₁₋₂, M₂, M₃, FBR₂',
    pages: PG.A1,
    text: `Draw influence lines for (a) shear force in panel 1–2, (b) bending moment at panel points 2 and 3 and (c) floor beam reaction at panel point 2 of the girder with floor beam system in Fig. 1.

Girder 0–4 (52 ft) on a hinge at 0 and a roller at 4. Panel points 0, 1, 2, 3, 4 at 0, 16, 28, 40, 52 ft; floor beams at 1, 2, 3, 4. Stringer 1 runs from 0 to 34 ft (on floor beams 1 and 2), stringer 2 from 34 ft to 4 (on floor beams 3 and 4).`,
    figure: () => <StructureView model={fs1.model} showLoads={false} autoDimX={[0, 16, 28, 34, 40, 52]} maxHeight={200} />,
    checks: () => [
      { key: 'v0', label: 'Shear in panel 1–2 with the unit load at 0', value: ildAt(ild1(r1.V12), 0) },
      { key: 'm2', label: '$M_2$ ordinate at panel point 2', value: ildAt(ild1(r1.M2), 28) },
      { key: 'm3', label: '$M_3$ ordinate at x = 34 ft (stringer joint)', value: ildAt(ild1(r1.M3), 34) },
      { key: 'f2', label: '$FBR_2$ ordinate at x = 0', value: ildAt(ild1(r1.F2), 0) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Each stringer is a simple beam with overhangs: stringer 1 rests on floor beams 1 and 2 (overhangs 0–16 ft and 28–34 ft), stringer 2 on floor beams 3 and 4 (overhang 34–40 ft). A unit load anywhere reaches the girder only as floor-beam reactions, so
- **FBR₂** is non-zero only on stringer 1: straight line $(x-16)/12$ through 0 at FB 1 and 1 at FB 2, extended over both overhangs → $-4/3$ at x = 0 and $+1.5$ at the stringer end x = 34 ft.
- Any girder function = Σ (FBR ILD) × (girder value for a unit load at that floor beam). The girder ILDs are straight between the stringer ends and floor beams — with kinks at 16, 28, 40 and at the stringer joint 34 ft.
- Shear in panel 1–2 (girder between 16 and 28): left part carries $R_0$ and the FB 1 force.`}</Md>
        <ILDStack
          model={fs1.model}
          path={fs1.path}
          items={[
            { label: 'V panel 1–2', resp: r1.V12 },
            { label: 'M at 2', resp: r1.M2 },
            { label: 'M at 3', resp: r1.M3 },
            { label: 'FBR at 2', resp: r1.F2 },
          ]}
        />
      </div>
    ),
    notes: [
      'Read from Fig. 1: no floor beam is drawn at panel point 0, so stringer 1 is taken as a simple beam on floor beams 1 and 2 overhanging 16 ft to the left (if a floor beam existed at 0 the 0–34 ft stringer would be continuous over three supports — statically indeterminate, not intended).',
      'Stringers break at x = 34 ft (6 ft right of panel point 2).',
    ],
  },
  {
    id: '2012-13-A2',
    paper: '2012-13',
    sec: 'A',
    no: '2',
    marks: 28,
    topics: ['ild'],
    title: 'Frame ILDs: shear at P, moments at P and Q (inclined roller)',
    pages: PG.A2,
    text: `Draw influence lines for shear force at P and bending moment at P and Q of the frame in Fig. 2. Beam A–B–C at 10 ft above the supports: overhang A–B = 18 ft, B–C = 16 ft, P is 9 ft left of C. Column B–D (pinned at D), Q is 6 ft above D. Column C–E rests on a roller at E on a 1:1 incline. The unit load moves on A–B–C.`,
    figure: () => <Figure model={f2} dimY />,
    checks: () => [
      { key: 'vp', label: '$V_P$ ordinate with the load at A', value: ildAt(influenceLine(f2, p2, r2.VP), 0) },
      { key: 'mp', label: '$M_P$ ordinate with the load at P', value: ildAt(influenceLine(f2, p2, r2.MP), 25) },
      { key: 'mq', label: '$M_Q$ ordinate with the load at A', value: ildAt(influenceLine(f2, p2, r2.MQ), 0) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Reactions first.** The roller at E pushes normal to the 1:1 incline, i.e. at 45°: $R_E$ has equal horizontal (←) and vertical (↑) components $R_E/\\sqrt2$. D is a pin. Moments about D for a unit load at distance $x$ from A ($x - 18$ from D):
$$\\frac{R_E}{\\sqrt2}(16) + \\frac{R_E}{\\sqrt2}(0) = 1\\,(x - 18)\\ \\Rightarrow\\ \\frac{R_E}{\\sqrt2} = \\frac{x-18}{16}$$
(the horizontal component acts along the line D–E, so it has no lever arm about D).
- **V_P, M_P**: free body P–C–E (right of P): only $R_E$ and the load (if it is right of P). Both components of $R_E$ have lever arms about P (9 ft horizontally, 10 ft vertically), so $M_P = 9R_{E,y} - 10|R_{E,x}|$ (+ the load's own moment when it is right of P).
- **M_Q**: free body Q–D (below Q): $M_Q = D_x \\times 6$, with $D_x = R_{E,x}$ from $\\sum F_x = 0$.
All ILDs are straight lines (statically determinate) with a jump of 1 in $V_P$ at P.`}</Md>
        <ILDStack
          model={f2}
          path={p2}
          items={[
            { label: 'V_P', resp: r2.VP },
            { label: 'M_P', resp: r2.MP },
            { label: 'M_Q (column, sagging + = tension on right face)', resp: r2.MQ },
          ]}
        />
      </div>
    ),
    notes: ['The incline at E rises to the right (1:1), so the roller reaction points up and to the left at 45°.', 'Joint C is a rigid corner; Q is 6 ft above D on column B–D.'],
  },
  {
    id: '2012-13-A3',
    paper: '2012-13',
    sec: 'A',
    no: '3',
    marks: 28,
    topics: ['truss'],
    title: 'Composite bridge truss: forces in C2, D1, E2, K1, F1',
    pages: PG.A3,
    text: `Find the bar forces in bars **C2, D1, E2, K1 and F1** of the truss in Fig. 3. Span 9 @ 20 ft = 180 ft. Left part: rectangular panels 40 ft high (panel points 0–60 ft); a K-type panel at 60–100 ft (mid-height joints at 60 and 80 ft); curved top chord 80–160 ft rising to 50 ft at 120 ft; end member from the 160 ft top joint to the right support. Loads: 90 k and 50 k down at the top joints at 0 and 20 ft, 40 k down at the top joint at 80 ft, 60 k down at the bottom joint at 80 ft, 40 k down and 20 k (→) at the apex (120 ft), 60 k (→) at the top joint at 160 ft. Left support hinged, right support on rollers.`,
    figure: () => <Figure model={t3} labels />,
    checks: () => {
      const r = solve(t3)
      return ['C2', 'D1', 'E2', 'K1', 'F1'].map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Reactions from the whole truss: $\\sum M_{L0} = 0$ (horizontal loads 20 k at 50 ft and 60 k at 40 ft count too), $\\sum F_x = 0 \\Rightarrow H_{L0} = 80$ k ←.
- **C2, D1** — section through panel 40–60 ft (D1, C2, D2): $\\sum M_{L2}$ → D1, $\\sum F_y$ → C2.
- **K1** — the K-joint at (60, 20): the two collinear verticals and the two inclined members; cut through panel 60–80 and use the joint at mid-height of the 60 ft vertical (the horizontal components of the two inclined members must balance).
- **F1** — section through panel 100–120 (U5–U6, F1, E1): U5–U6 and E1 are not parallel, so take moments about their intersection, or use joint L6 after E1 (moments about U5) is known.
- **E2** — section through panel 120–140 (U6–U7, F2, E2): U6–U7 and F2 meet at **U7** → $\\sum M_{U7}$ gives E2 directly.`}</Md>
        <TrussSolution model={t3} asked={['C2', 'D1', 'E2', 'K1', 'F1']} />
      </div>
    ),
    notes: [
      'Geometry read from the hand sketch: bottom chord L0–L9 at 20 ft; top joints at 40 ft except U5, U7 at 45 ft and apex U6 at 50 ft (U4–U6–U8 drawn as straight lines); mid-height joints M3 (60, 20) and M4 (80, 20).',
      'Labels: A1 = L0–U1, C1 = L1–U2, C2 = L2–U3, D1 = U2–U3, D2 = L2–L3, K1 = M3–L4, E1 = L5–L6, E2 = L6–L7, F1 = U5–L6, F2 = L6–U7, A2 = U8–L9, B1 = L0–L1, B2 = L8–L9. Curved members are taken as straight bars between joints.',
    ],
  },
  {
    id: '2012-13-A4',
    paper: '2012-13',
    sec: 'A',
    no: '4',
    marks: 28,
    topics: ['ild'],
    title: 'Compound beam ILDs: R₅, V_A, M₃, M₅, M₆',
    pages: PG.A4,
    text: `Draw influence lines for reaction at 5, shear force at A, bending moments at 3, 5 and 6 of the beam in Fig. 4. Stations: 1 (free end) at 0, roller 2 at 8 ft, 3 at 14 ft, internal hinge 4 at 19 ft, A at 22 ft, roller 5 at 25 ft, 6 at 31 ft, hinge support 7 at 37 ft, free end 8 at 45 ft.`,
    figure: () => <Figure model={b4} />,
    checks: () => [
      { key: 'r5', label: '$R_5$ ordinate with the load at 1', value: ildAt(ild4(r4.R5), 0) },
      { key: 'va', label: '$V_A$ ordinate with the load at the hinge 4', value: ildAt(ild4(r4.VA), 19) },
      { key: 'm3', label: '$M_3$ ordinate at 3', value: ildAt(ild4(r4.M3), 14) },
      { key: 'm6', label: '$M_6$ ordinate at 6', value: ildAt(ild4(r4.M6), 31) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure:** 1–2–4 sits on the roller at 2 and hangs on the main beam 4–8 at the hinge 4; the main beam is supported by 5 (roller) and 7 (hinge). A load on 1–4 pivots that part about 2: the hinge force passed down onto the main beam is $(x - 8)/11$ (x measured from 1) — negative, i.e. **upward** on the main beam, when the load is on the overhang 1–2.
Müller-Breslau: every ILD is piecewise straight with kinks at 2, 4, 5, 7.`}</Md>
        <ILDStack
          model={b4}
          path={p4}
          items={[
            { label: 'R_5', resp: r4.R5 },
            { label: 'V_A', resp: r4.VA },
            { label: 'M_3', resp: r4.M3 },
            { label: 'M_5', resp: r4.M5 },
            { label: 'M_6', resp: r4.M6 },
          ]}
        />
      </div>
    ),
  },
  {
    id: '2012-13-A5',
    paper: '2012-13',
    sec: 'A',
    no: '5',
    marks: 28,
    topics: ['wheel'],
    title: 'Max moment 20 ft from the end of an 80 ft span (wheels + uniform tail)',
    pages: PG.A5,
    text: `Due to the wheel loading in Fig. 5 — 20, 20, 80, 80, 80, 80, 80, 80, 20, 20 k at spacings 4, 10, 6, 6, 12, 6, 6, 10, 4 ft, followed after 8 ft by a uniform load of 8 k/ft — calculate the maximum moment at the point 20 ft from the left end of a simply supported beam of 80 ft.`,
    checks: () => [{ key: 'm', label: 'Max moment at 20 ft', value: trainExtremes(ild5, train5).max.value, unit: 'k-ft' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Moment ILD at 20 ft: triangle with peak $20(60)/80 = 15$. **Criterion:** the critical wheel at the section makes the average load on the left 20 ft ≈ average on the whole 80 ft, i.e. $W_{left} \\approx W/4$ as that wheel crosses. The uniform tail (8 k/ft) adds $w\\times$(area of the ILD it covers). Both directions of travel are checked.`}</Md>
        <TrainOnILD ild={ild5} t={train5} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="moment at 20 ft" resUnit="k-ft" />
      </div>
    ),
    notes: ['Third wheel read as 80 k (the scan shows "30k" but the axle groups are symmetric 20-20 / 80×3 / 80×3 / 20-20).', 'Trailing uniform load read as 8 k/ft starting 8 ft behind the last wheel, extending indefinitely.'],
  },
  {
    id: '2012-13-A6',
    paper: '2012-13',
    sec: 'A',
    no: '6',
    marks: 28,
    topics: ['floor'],
    title: 'Max forces in E1 and F2: 4 k/ft + 60 k roving load',
    pages: PG.A6,
    text: `Due to a moving uniform load of 4 kips per ft combined with a moving concentrated load of 60 kips, calculate the maximum force in bars **E1 and F2** of the truss in Fig. 3. (Ignore all the external loads applied on the truss.) Loads travel on the bottom-chord panel points.`,
    figure: () => <Figure model={t6} labels />,
    checks: () => {
      const e1 = uniformPlusConcentrated(ild6('E1'), 4, 60)
      const f2 = uniformPlusConcentrated(ild6('F2'), 4, 60)
      return [
        { key: 'e1', label: 'Max tension in E1', value: e1.maxPos.live, unit: 'k' },
        { key: 'f2t', label: 'Max tension in F2', value: f2.maxPos.live, unit: 'k' },
        { key: 'f2c', label: 'Max compression in F2 (as negative)', value: f2.maxNeg.live, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`ILDs by sections (load at the bottom panel points):
- **E1** (bottom chord L5–L6): section through U5–U6, F1, E1 and moments about the joint where the other two meet; E1 is the "tension chord" — positive everywhere.
- **F2** (diagonal L6–U7): section through U6–U7, F2, E2; the ILD changes sign within panel L6–L7 → both tension and compression must be checked.
Maximum = $w\\times$(area of one sign) + $P\\times$(peak ordinate of that sign).`}</Md>
        <ILDStack
          model={t6}
          path={p6}
          items={[
            { label: 'F_E1', resp: { kind: 'force', member: 'E1' } },
            { label: 'F_F2', resp: { kind: 'force', member: 'F2' } },
          ]}
        />
        <MaxEffect ild={ild6('E1')} w={4} P={60} label="Bar E1" />
        <MaxEffect ild={ild6('F2')} w={4} P={60} label="Bar F2" />
      </div>
    ),
  },
  {
    id: '2012-13-A7',
    paper: '2012-13',
    sec: 'A',
    no: '7',
    marks: 28,
    topics: ['ild'],
    title: 'Max shear just right of 5 and max moment at 5: 5 k/ft + 80 k',
    pages: PG.A7,
    text: `Due to a moving uniform load of 5 kips per ft combined with a moving concentrated load of 80 kips calculate (a) maximum shear force at the section just right of 5, and (b) maximum bending moment at 5 of the beam in Fig. 4.`,
    figure: () => <Figure model={b4} />,
    checks: () => {
      const v = uniformPlusConcentrated(ild4(r4.V5r), 5, 80)
      const m = uniformPlusConcentrated(ild4(r4.M5), 5, 80)
      return [
        { key: 'vp', label: 'Max positive shear just right of 5', value: v.maxPos.live, unit: 'k' },
        { key: 'vn', label: 'Max negative shear just right of 5 (as negative)', value: v.maxNeg.live, unit: 'k' },
        { key: 'mp', label: 'Max positive moment at 5', value: m.maxPos.live, unit: 'k-ft' },
        { key: 'mn', label: 'Max negative moment at 5 (as negative)', value: m.maxNeg.live, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Use the ILDs of Q4. For each sign: cover every part of the ILD with that sign by the uniform load (it can be broken) and put the 80 k at the largest ordinate of that sign.`}</Md>
        <ILDStack
          model={b4}
          path={p4}
          items={[
            { label: 'V just right of 5', resp: r4.V5r },
            { label: 'M_5', resp: r4.M5 },
          ]}
        />
        <MaxEffect ild={ild4(r4.V5r)} w={5} P={80} label="Shear just right of 5" />
        <MaxEffect ild={ild4(r4.M5)} w={5} P={80} label="Moment at 5" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2012-13-B8',
    paper: '2012-13',
    sec: 'B',
    no: '8',
    marks: 28,
    topics: ['wind'],
    title: 'Wind: 5-storey hospital in Dhaka, projected area method (BNBC 1993)',
    pages: PG.B8,
    legacy: 'Asked with the BNBC 1993 projected-area method (q = Cc·CI·Cz·Vb², p = Gh·Cp·q). Solved as intended, then recast with the BNBC 2020 analytical procedure.',
    text: `Calculate the wind load at different floor levels perpendicular to the long side of a **15 m** high 5-storied hospital building with storey height 3 m each, located in Dhaka city. The building is rectangular, **60 m × 30 m** in plan. Use the projected area method. Given: basic wind speed for Dhaka = **210 kph**, importance coefficient = **1.25**, exposure **A**, $C_c = 47.2\\times10^{-6}$. See Annexure-1 for tables ($C_z$, $G_h$, overall $\\bar C_p$).`,
    checks: () => {
      const r = w93.rows[w93.rows.length - 1]
      const r20 = storeyForces({ ...w20, I: importanceWind(4, 65.7), Kzt: 1, Kd: 0.85 })
      return [
        { key: 'q15', label: '$q_z$ at 15 m (BNBC 1993)', value: r.q, unit: 'kN/m²' },
        { key: 'p15', label: 'Design pressure at 15 m (BNBC 1993)', value: r.p, unit: 'kN/m²' },
        { key: 'V93', label: 'Total wind force (BNBC 1993)', value: w93.base, unit: 'kN' },
        { key: 'V20', label: 'Total wind force (BNBC 2020 recast)', value: r20.base, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Old code (BNBC 1993), as asked.** Sustained wind pressure and design pressure on the projected area:
$$q_z = C_c C_I C_z V_b^2\\ (\\text{kN/m}^2,\\ V_b\\text{ in km/h}),\\qquad p_z = \\bar C_p\\,G_h\\,q_z,\\qquad F_z = p_z A_z$$
- $C_cC_IV_b^2 = 47.2\\times10^{-6}(1.25)(210^2) = ${fmt(w93.k, 4)}$
- Wind ⟂ long side: $B = 60$ m (face), $L = 30$ m → $L/B = 0.5$, $h/B = 15/60 = 0.25 \\le 0.5$ → $\\bar C_p = ${w93.Cp}$ (Table 6.2.15).
- Gust response factor for the MWFRS at the building height (h = 15 m, exposure A): $G_h = ${w93.Gh}$.
- $C_z$ (exposure A): 0–4.5 m 0.368, 6 m 0.415, 9 m 0.497, 12 m 0.565, 15 m 0.624.
Each floor takes the wind on half the storey above and below (roof: half the top storey) over the 60 m face.`}</Md>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Level</th>
              <th>z (m)</th>
              <th>Cz</th>
              <th>qz (kN/m²)</th>
              <th>pz (kN/m²)</th>
              <th>Trib. h (m)</th>
              <th>Area (m²)</th>
              <th>F (kN)</th>
            </tr>
          </thead>
          <tbody>
            {w93.rows.map((r) => (
              <tr key={r.level}>
                <td>{r.level === 5 ? 'Roof' : r.level}</td>
                <td>{fmt(r.z)}</td>
                <td>{fmt(r.Cz, 3)}</td>
                <td>{fmt(r.q, 4)}</td>
                <td>{fmt(r.p, 4)}</td>
                <td>{fmt(r.trib)}</td>
                <td>{fmt(r.A)}</td>
                <td className="font-bold">{fmt(r.F)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-base">
          Total = <b className="num">{fmt(w93.base)} kN</b>
        </div>
        <Md>{`**Recast with BNBC 2020 (analytical procedure).** Assumptions: Dhaka $V = 65.7$ m/s, exposure A, hospital → **Occupancy IV**, $I = 1.15$, $K_d = 0.85$, $K_{zt} = 1$, rigid building $G = 0.85$, enclosed. Wind ⟂ the 60 m face: $B = 60$, $L = 30$.`}</Md>
        <WindAnalytical {...w20} />
      </div>
    ),
    notes: ['Floor forces use the pressure at each floor level times its tributary area (3 m strips, 1.5 m at the roof); some solutions average the pressure over each strip — the difference is small.', 'Parapet ignored.'],
  },
  {
    id: '2012-13-B9',
    paper: '2012-13',
    sec: 'B',
    no: '9',
    marks: 28,
    topics: ['cable'],
    title: 'Suspension bridge with a hinged stiffening girder: SFD & BMD',
    pages: PG.B9,
    text: `Draw shear force and bending moment diagrams for the stiffening girder of the suspension bridge in Fig. 6. Span 10 @ 100 ft = 1000 ft, cable sag 100 ft, stiffening girder hinged at the centre B and pinned at the towers C and A. Two 20 k loads act at 300 ft and 600 ft from C.`,
    figure: () => <SuspFig />,
    checks: () => [
      { key: 'H', label: 'Cable horizontal tension H', value: s9.H, unit: 'k' },
      { key: 'q', label: 'Hanger load per ft q', value: s9.q, unit: 'k/ft', tol: 0.01 },
      { key: 'm300', label: 'Girder moment at 300 ft', value: s9.M(300), unit: 'k-ft' },
      { key: 'm600', label: 'Girder moment at 600 ft', value: s9.M(600), unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`The parabolic cable pulls the girder up with a uniform $q = 8Hh/L^2$. The girder is a simple span C–A with point loads, the uniform uplift q, and a hinge at B where $M = 0$:
$$M_B = M_{0,B} - H\\,y_B = 0,\\quad y_B = h = 100\\text{ ft}$$
$R_C$ of the simple beam for the two 20 k loads: $20(700) + 20(400) = 1000R_C$ → $R_C = 22$ k; $M_{0,B} = 22(500) - 20(200) = 7000$ k-ft → $H = 70$ k.`}</Md>
        <SuspensionSolution L={1000} h={100} xh={500} loads={loads9} marks={[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]} panel={100} />
      </div>
    ),
    notes: ['Load positions read from the sketch: the 20 k loads hang at the 3rd hanger from C (300 ft) and the 1st hanger right of B (600 ft).'],
  },
  {
    id: '2012-13-B10',
    paper: '2012-13',
    sec: 'B',
    no: '10',
    marks: 28,
    topics: ['vw'],
    title: 'Truss: how close do B and D come?',
    pages: PG.B10,
    text: `Calculate how close B and D come along BD after application of a **100 k** load at B of the truss in Fig. 7 (4 ft × 3 ft panel, diagonal A–C; A on rollers, D hinged; the load acts at B pointing down-right with slope 3:4). Area of diagonal AC = 0.5 in², all other members 1 in². $E = 30000$ ksi.`,
    figure: () => <Figure model={t10} labels />,
    checks: () => [{ key: 'd', label: 'Approach of B and D along BD (in, + = closer)', value: vw10().total * 12, unit: 'in', tol: 0.02 }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Load components: $100\\times\\tfrac45 = 80$ k → and $100\\times\\tfrac35 = 60$ k ↓. Virtual system: a pair of unit loads at B and D along B–D pointing toward each other (BD = 5 ft, direction cosines 0.8, 0.6). Note BD is **not** a member — the pair is self-equilibrating, so the virtual reactions are zero.
$$\\delta_{BD} = \\sum\\frac{NnL}{AE}\\times12\\ \\text{(in)}$$`}</Md>
        <VWSolution model={t10} real={t10.loads} virtual={pair10} opts={{ EA: EA10 }} scale={12} resultUnit="in" what="δ(B→D)" unitNote="L in ft, A in in², E = 30 000 ksi; + means B and D move closer." />
        <TrussSolution model={t10} asked={[]} note="Real member forces." />
      </div>
    ),
    notes: ['The 100 k at B is read as acting toward the joint from the upper left (down-right, 3 vertical : 4 horizontal).'],
  },
  {
    id: '2012-13-B11',
    paper: '2012-13',
    sec: 'B',
    no: '11',
    marks: 28,
    topics: ['lateral'],
    title: 'Cantilever method: 3-bay, 2-storey frame with column areas 4A, 3A, 2A, A',
    pages: PG.B11,
    text: `Using the cantilever method draw bending moment diagrams on the compression side for all the columns and girders and also the shear force diagrams for the girders of the building frame in Fig. 8. Bays 10, 20, 30 ft; storeys 20 ft (ground) and 10 ft; lateral loads 23 k at the first floor and 46 k at the roof (→, left side). Column areas 4A, 3A, 2A, A (left to right). Fixed bases.`,
    figure: () => <ApproxFig g={g11} />,
    checks: () => {
      const r = cantileverMethod(g11)
      return [
        { key: 'xbar', label: 'Centroid of column areas from the left column', value: r.overturning![0].xbar, unit: 'ft' },
        { key: 'n1', label: 'Axial force in left ground-storey column (T +)', value: r.columns[0][0].axial, unit: 'k' },
        { key: 'vb', label: 'Shear in first-floor girder, left bay', value: r.beams[0][0].shear, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Assumptions: inflection points at mid-height of columns and mid-span of girders; column axial stress ∝ distance from the centroid of the column areas. Centroid $\\bar x = \\dfrac{4(0) + 3(10) + 2(30) + 1(60)}{10} = 15$ ft. Overturning moment about each inflection plane → axial forces $N_i = M A_i d_i / \\sum A d^2$; girder shears from joint vertical equilibrium; girder moments = shear × L/2; column moments from joint moment equilibrium. Set the BMD side to "compression" in the sidebar to match the question.`}</Md>
        <ApproxSolution g={g11} method="cantilever" />
      </div>
    ),
    notes: ['Column areas are shown only for the ground storey; the same relative areas are assumed in the top storey.'],
  },
  {
    id: '2012-13-B12',
    paper: '2012-13',
    sec: 'B',
    no: '12',
    marks: 28,
    topics: ['truss'],
    title: 'Approximate analysis of a double-diagonal tower truss',
    pages: PG.B12,
    text: `By approximate analysis, calculate the bar forces in the truss in Fig. 9: a 12 ft wide tower, joints at 0, 16, 25 and 34 ft on both legs (A, C, E, G left; B, D, F, H right), crossing diagonals in each of the three panels, horizontal members only at the bottom (A–B) and top (G–H). A hinged, H held horizontally by a roller against a wall. Loads: 16 k → at G, 32 k → at E, 32 k ← at C, 20 k → at F, 30 k → at D, 36 k ↓ at B.`,
    figure: () => <Figure model={tw} />,
    checks: () => [
      { key: 'hx', label: 'Horizontal reaction at H (→ +)', value: tower.r0.reaction('H').rx, unit: 'k' },
      { key: 'cf', label: 'Force in CF (T +, C −)', value: tower.forces.get('CF')!, unit: 'k' },
      { key: 'eh', label: 'Force in EH (T +, C −)', value: tower.forces.get('EH')!, unit: 'k' },
      { key: 'ac', label: 'Force in leg AC (T +, C −)', value: tower.forces.get('AC')!, unit: 'k' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Degree of indeterminacy.** j = 8 → 2j = 16; b = 14 bars + r = 3 → 17 → **one** redundant (the reactions are determinate: $\\sum M_A$ gives $H_x$, then $A_x$, $A_y$). Because there are no struts at C–D and E–F, the horizontal equilibrium of joints C, D, E, F ties the diagonals of neighbouring panels together, so we may make only **one** assumption.

**Assumption:** in the bottom panel the two diagonals share the panel shear equally (AD = −CB). Here the bottom-panel shear is $A_x = ${fmt(Math.abs(tower.r0.reaction('A').rx))}$ k, so both bottom diagonals are ${Math.abs(tower.X) < 1e-6 ? 'zero' : `±${fmt(Math.abs(tower.X))} k`}; everything else follows from the joints C, D, E, F, G (method of joints going upward).`}</Md>
        <TrussSolution model={tw} forces={tower.forces} note="Approximate forces (one assumption: equal shear in the diagonals of panel A–B–C–D)." />
        <details>
          <summary className="cursor-pointer text-mute font-semibold">Compare: exact elastic solution (all bars equal AE)</summary>
          <table className="tbl w-auto mt-1">
            <thead>
              <tr>
                <th>Member</th>
                <th>Approximate</th>
                <th>Exact (equal AE)</th>
              </tr>
            </thead>
            <tbody>
              {tw.members.map((m) => (
                <tr key={m.id}>
                  <td className="txt">{m.id}</td>
                  <td>{fmt(tower.forces.get(m.id)!)}</td>
                  <td>{fmt(tower.exactF.get(m.id)!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    ),
    notes: ['No horizontal members are drawn at the C–D and E–F levels, so the truss is indeterminate to degree 1 (not 3); equal sharing is assumed only in the bottom panel. Assuming equal sharing in every panel would violate horizontal equilibrium at joints C–F.', 'H is read as a roller bearing on a vertical wall (horizontal reaction).'],
  },
  {
    id: '2012-13-B13',
    paper: '2012-13',
    sec: 'B',
    no: '13',
    marks: 28,
    topics: ['vw'],
    title: 'Rotation at the free end E of a cantilever with a bracket couple',
    pages: PG.B13,
    text: `Find the rotation at end E of the structure in Fig. 10. Cantilever A–E fixed at A: 5 k at B (18 ft from A), D at 28 ft, free end E at 38 ft; an 8 ft bracket hangs below D with a 60 k-ft couple at its end C. $I = 72$ in⁴, $E = 30000$ ksi.`,
    figure: () => <Figure model={f13} dimY />,
    checks: () => [{ key: 'th', label: 'Rotation at E (rad, + = counter-clockwise)', value: vw13().total, unit: 'rad', tol: 0.02 }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Unit couple at E (ccw): $m = 1$ (constant, hogging sign per convention) on A–E, zero in the bracket. Real moments: the bracket transmits the 60 k-ft couple to D unchanged, so A–D carries the couple; A–B also carries the 5 k cantilever moment. D–E is unloaded. Then $\\theta_E = \\int Mm/EI\\,dx$, $EI = 30000(72)/144 = ${fmt(EI13)}$ k-ft².`}</Md>
        <VWSolution model={f13} real={f13.loads} virtual={[Mo('E', 1)]} opts={{ EI: () => EI13 }} resultUnit="rad" what="θ_E" unitNote="+ = counter-clockwise." />
      </div>
    ),
    notes: ['Couple at C read as 60 k-ft clockwise from the sketch; AB read as 18 ft (blurred).', 'Bending only (no A given).'],
  },
  {
    id: '2012-13-B14',
    paper: '2012-13',
    sec: 'B',
    no: '14',
    marks: 28,
    topics: ['vertical'],
    title: 'Vertical loads (DL 5 + LL 3 k/ft): approximate BMD & AFD',
    pages: PG.B14,
    text: `A uniform vertical dead load of 5 kip/ft and live load of 3 kip/ft act on all the beams of the frame in Fig. 11. Draw bending moment diagrams (compression side) for all the beams and columns by approximate analysis. Also draw axial force diagrams for the columns. EI is constant and same for all the columns.

Frame: hinged bases A, B, C, D at 0, 20, 30, 55 ft; first-floor beam E–F–G–H at 20 ft; second storey (10 ft) with columns E–I and G–J only and beam I–J spanning 30 ft (no column above F).`,
    figure: () => <Figure model={vf14.model} dimY />,
    checks: () => {
      const gh = vf14.beams.find((b) => b.id === 'GH')!
      const ij = vf14.beams.find((b) => b.id === 'IJ')!
      const cg = vf14.cols.find((c) => c.id === 'CG')!
      return [
        { key: 'gh', label: 'Beam GH end moment (hogging magnitude)', value: gh.Me, unit: 'k-ft' },
        { key: 'ij', label: 'Beam IJ midspan moment', value: ij.Mmid, unit: 'k-ft' },
        { key: 'cg', label: 'Moment at top of column CG (magnitude)', value: Math.abs(cg.ML), unit: 'k-ft' },
        { key: 'ncg', label: 'Axial compression in column CG', value: cg.N, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Total load $w = 5 + 3 = 8$ k/ft on every beam (approximate analysis with full DL + LL). **0.1L method:** inflection points at 0.1L from the beam ends → end moments $0.045wL^2$, midspan $0.08wL^2$, end shears $wL/2$; unbalanced joint moments go to the columns in proportion to $I/h$ (bases hinged → zero moment at A–D).
E.g. joint G: beams FG (10 ft) and GH (25 ft): $0.045(8)(25^2 - 10^2) = 189$ k-ft, shared by CG (h = 20, DF 1/3) and GJ (h = 10, DF 2/3) → 63 and 126 k-ft. Beam I–J spans 30 ft over F (no column), so F only gets moment from E–F and F–G.`}</Md>
        <VerticalSolution f={vf14} />
      </div>
    ),
    notes: ['DL and LL are combined (8 k/ft on all beams); pattern live loading is not considered in the approximate method.', 'Column distribution in proportion to I/h (EI constant), hinged bases; beam end shears taken as wL/2.'],
  },
]

function SuspFig() {
  const X = (x: number) => 40 + x * 0.6
  const Y = (y: number) => 40 + y * 0.9
  const pts = Array.from({ length: 41 }, (_, k) => {
    const x = (1000 * k) / 40
    return `${X(x)},${Y(100 - (400 * x * (1000 - x)) / 1e6)}`
  })
  return (
    <svg viewBox="0 0 700 220" className="w-full max-w-2xl h-auto">
      <line x1={X(0)} y1={Y(0) - 10} x2={X(0)} y2={Y(130)} stroke="var(--c-member)" strokeWidth={4} />
      <line x1={X(1000)} y1={Y(0) - 10} x2={X(1000)} y2={Y(130)} stroke="var(--c-member)" strokeWidth={4} />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      {[100, 200, 300, 400, 600, 700, 800, 900].map((x) => (
        <line key={x} x1={X(x)} x2={X(x)} y1={Y(100 - (400 * x * (1000 - x)) / 1e6)} y2={Y(110)} stroke="var(--c-faint)" />
      ))}
      <line x1={X(0)} y1={Y(110)} x2={X(1000)} y2={Y(110)} stroke="var(--c-member)" strokeWidth={4} />
      <circle cx={X(500)} cy={Y(110)} r={5} fill="var(--c-panel)" stroke="var(--c-ink)" />
      {[300, 600].map((x) => (
        <g key={x}>
          <line x1={X(x)} x2={X(x)} y1={Y(115)} y2={Y(145)} stroke="var(--c-load)" strokeWidth={2} />
          <text x={X(x) + 6} y={Y(145)} fontSize={12} fill="var(--c-load)" fontWeight={700}>
            20 k
          </text>
        </g>
      ))}
      <text x={X(0) - 4} y={Y(110) + 18} fontSize={12} fill="var(--c-ink)" textAnchor="end">
        C
      </text>
      <text x={X(500)} y={Y(110) + 22} fontSize={12} fill="var(--c-ink)" textAnchor="middle">
        B (hinge)
      </text>
      <text x={X(1000) + 4} y={Y(110) + 18} fontSize={12} fill="var(--c-ink)">
        A
      </text>
      <text x={X(500) + 8} y={Y(50)} fontSize={11} fill="var(--c-mute)">
        sag 100 ft
      </text>
      <text x={X(500)} y={215} fontSize={11} fill="var(--c-mute)" textAnchor="middle">
        10 @ 100 ft = 1000 ft
      </text>
    </svg>
  )
}
