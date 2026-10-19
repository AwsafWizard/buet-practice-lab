// 2007-08 term final (held 26 Jan 2009), 210 marks — every question 21 marks, answer 5 of 7 per section.
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes, simplify, type ILD, type LoadPath } from '../../engine/ild'
import { absoluteMaxMoment, ssMomentILD, ssShearILD, trainExtremes, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { cablePointLoads, parabolicCable, simpleBeamM, stiffenedSuspension } from '../../engine/cable'
import type { Model } from '../../engine/model'
import { beamOf, F, floorSystem, model, P, pathOf, Pm, truss } from '../../kit/builders'
import { AbsMaxSolution, Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrainTable, TrussSolution, type ILDItem } from '../../kit/solutions'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'

const PA = [1, 3]
const PB = [2, 4]

/** ILD with stiffness-solver noise removed (|y| below 1e-5 → 0, collinear points dropped) — for display tables */
function cleanILD(d: ILD): ILD {
  const pts = d.pts.map((p) => ({ x: Math.round(p.x * 1e4) / 1e4, y: Math.round(p.y * 1e5) / 1e5 }))
  const out = pts.filter((p, i) => !(i > 0 && p.x === pts[i - 1].x && p.y === pts[i - 1].y))
  return simplify({ ...d, pts: out })
}
const ildsOf = (m: Model, path: LoadPath, items: ILDItem[]) => items.map((it) => cleanILD(influenceLine(m, it.path ?? path, it.resp)))

// ---------------------------------------------------------------- Q1 beam ILDs (Fig. 1)
const b1 = beamOf('A:0 B:7:roller C:17 D*:21 E:26 F:31:fixed')
const p1 = { kind: 'members' as const, members: pathOf(b1) }
const items1: ILDItem[] = [
  { label: 'V_C', resp: { kind: 'shear', member: 'CD', x: 0 } },
  { label: 'M_C', resp: { kind: 'moment', member: 'CD', x: 0 } },
  { label: 'V_B+ (just right of B)', resp: { kind: 'shear', member: 'BC', x: 0 } },
  { label: 'M_E', resp: { kind: 'moment', member: 'EF', x: 0 } },
  { label: 'R_F (vertical)', resp: { kind: 'reaction', node: 'F', comp: 'y' } },
]
const il1 = (k: number) => influenceLine(b1, p1, items1[k].resp)

// ---------------------------------------------------------------- Q2 beam with hinge (Fig. 2)
const b2 = beamOf('a:0 A:6:roller B*:18 C:22:roller D:27 E:32:pin b:38')
const p2 = { kind: 'members' as const, members: pathOf(b2) }
const ildVC2 = () => influenceLine(b2, p2, { kind: 'shear', member: 'CD', x: 0 })
const ildMD2 = () => influenceLine(b2, p2, { kind: 'moment', member: 'DE', x: 0 })

// ---------------------------------------------------------------- Q3 / Q4 wheel trains
const t3: Train = { P: [12, 12, 48, 48, 48, 48, 12, 12], gaps: [4, 8, 6, 6, 6, 8, 4] }
const t4: Train = { P: [12, 12, 12, 12, 24, 24, 24, 24, 48, 48, 48, 48], gaps: [4, 4, 4, 8, 6, 6, 6, 6, 6, 6, 6] }

// ---------------------------------------------------------------- Q5 curved-chord truss (Fig. 5)
const N5 = 'L0:0,0 L1:30,0 L2:60,0 L3:90,0 L4:120,0 L5:150,0 L6:180,0 U1:30,30 U2:60,37 U3:90,40 U4:120,37 U5:150,30'
const M5 = 'L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L0-U1 U1-U2 U2-U3 U3-U4 U4-U5 U5-L6 U1-L1 U2-L2 U3-L3 U4-L4 U5-L5 U1-L2 U2-L3 U4-L3 U5-L4'
const t5 = truss(N5, M5, 'L0:pin L6:roller')
t5.members.find((m) => m.id === 'U2L3')!.label = 'a'
const t5c = truss(N5, M5.replace('U2-L3', 'L2-U3'), 'L0:pin L6:roller') // 'a' slack, counter L2-U3 active
t5c.members.find((m) => m.id === 'L2U3')!.style = 'dashed'
const p5 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'] }
const ildA5 = () => influenceLine(t5, p5, { kind: 'force', member: 'U2L3' })
const ildC5 = () => influenceLine(t5c, p5, { kind: 'force', member: 'L2U3' })

// ---------------------------------------------------------------- Q6 floor system (Fig. 6)
const fs6 = floorSystem({
  floorBeams: [0, 15, 30, 45, 60, 75, 90],
  stringers: [
    [0, 22.5],
    [22.5, 45],
    [45, 67.5],
    [67.5, 90],
  ],
  supports: [
    { x: 15, type: 'pin' },
    { x: 75, type: 'roller' },
  ],
  names: { 0: '0', 15: '1', 30: '2', 45: '3', 60: '4', 75: '5', 90: '6' },
})
const items6: ILDItem[] = [
  { label: 'V in panel 1-2', resp: fs6.shear(20) },
  { label: 'M at panel point 3', resp: fs6.moment(45) },
  { label: 'FBR_0', resp: fs6.fbr(0) },
  { label: 'FBR_1', resp: fs6.fbr(15) },
  { label: 'FBR_2', resp: fs6.fbr(30) },
]
const ildV6 = () => influenceLine(fs6.model, fs6.path, fs6.shear(20))
const ildM6 = () => influenceLine(fs6.model, fs6.path, fs6.moment(45))

// ---------------------------------------------------------------- Q7 subdivided deck truss (Fig. 7)
const U7 = Array.from({ length: 13 }, (_, i) => `U${i}:${20 * i},50`).join(' ')
const L7 = [2, 4, 6, 8, 10].map((i) => `L${i}:${20 * i},0`).join(' ')
const Mid7 = [1, 3, 5, 7, 9, 11].map((i) => `M${i}:${20 * i},25`).join(' ')
const top7 = Array.from({ length: 12 }, (_, i) => `U${i}-U${i + 1}`).join(' ')
const t7 = truss(
  `${U7} ${L7} ${Mid7}`,
  `${top7} L2-L4 L4-L6 L6-L8 L8-L10 U1-M1 M3U3=U3-M3 U5-M5 U7-M7 U9-M9 U11-M11 L2-U2 L4-U4 L6-U6 L8-U8 L10-U10 ` +
    'U0-M1 M1-L2 M1-U2 U2-M3 M3-L4 M3-U4 U4-M5 M5-L6 M5-U6 L6-M7 M7-U8 U6-M7 L8-M9 M9-U10 U8-M9 L10-M11 M11-U12 U10-M11',
  'U0:pin U12:roller',
)
const p7 = { kind: 'panel' as const, nodes: Array.from({ length: 13 }, (_, i) => `U${i}`) }
const ild7 = (m: string) => influenceLine(t7, p7, { kind: 'force', member: m })

// ---------------------------------------------------------------- Q8 cable over a pulley (Fig. 8)
const q8 = (() => {
  const L = 80 // B to C horizontal
  const w = 1
  const dh = -15 // C is 15 ft below B
  const xD = 60 // D is 20 ft left of C
  const chordD = (15 * xD) / L // chord drop below B at D
  const sagD = 20 - chordD // D is 20 ft below B (15 + 5)
  const M0D = simpleBeamM(L, xD, [], w)
  const H = M0D / sagD
  const h = (w * L * L) / (8 * H) // sag from chord at mid-span
  const pc = parabolicCable({ L, w, h, dh })
  const VB = pc.Vleft
  const VC = pc.Vright
  const TB = pc.T(0)
  const TC = pc.T(L)
  // lowest point: slope = 0 → x = L/2 − dh·L/(8h) (= V_B / w). parabolicCable.xLow has the sign of dh reversed.
  const xLow = L / 2 - (dh * L) / (8 * h)
  const sagLow = (4 * h * xLow * (L - xLow)) / (L * L)
  const dropLow = -pc.y(xLow) // below B
  // pulley: T same on both sides; A-B rises 40 ft over 30 ft (3-4-5)
  const cx = H - 0.6 * TB
  const cy = -(VB + 0.8 * TB)
  const col = model('E:0,0 P:0,39.5', 'E-P', 'E:fixed', [F('P', cx, cy, 'cable resultant')])
  const rE = solve(col).reaction('E')
  return { L, w, dh, chordD, sagD, M0D, H, h, VB, VC, TB, TC, xLow, sagLow, dropLow, cx, cy, rE, xLowEngine: pc.xLow }
})()
const fig8 = (() => {
  const xs = [0, 10, 20, 30, 40, 50, 60, 70, 80]
  const yB = 40
  const pc = parabolicCable({ L: 80, w: 1, h: q8.h, dh: -15 })
  const cab = xs.map((x, k) => `${x === 0 ? 'B' : x === 60 ? 'D' : x === 80 ? 'C' : 'c' + k}:${30 + x},${yB + pc.y(x)}`).join(' ')
  const segs = xs.slice(1).map((x, k) => {
    const nm = (xx: number, kk: number) => (xx === 0 ? 'B' : xx === 60 ? 'D' : xx === 80 ? 'C' : 'c' + kk)
    return `${nm(xs[k], k)}-${nm(x, k + 1)}`
  })
  const m = model(`A:0,0 E:30,0 ${cab}`, `A-B E-B ${segs.join(' ')}`, 'A:pin C:pin E:fixed')
  m.nodes.forEach((n) => n.id.startsWith('c') && (n.label = ''))
  m.members.forEach((mm) => mm.id !== 'EB' && (mm.style = 'cable'))
  return m
})()

// ---------------------------------------------------------------- Q9 cable with point loads (Fig. 9)
const loads9 = [
  { x: 65, P: 100 },
  { x: 150, P: 50 },
  { x: 200, P: 450 },
]
const c9 = cablePointLoads({ L: 400, dh: 0, loads: loads9, sagAt: { x: 200, sag: 26 } })
const EA9 = 30000 * 10 // kip
const stretch9 = c9.segs.reduce((s, q) => s + (q.T * q.len) / EA9, 0)
const fig9 = (() => {
  const nm = ['A', 'B', 'C', 'D', 'E']
  const m = model(c9.pts.map((p, k) => `${nm[k]}:${p.x},${p.y}`).join(' '), 'A-B B-C C-D D-E', 'A:pin E:pin', [P('B', 100, '100k'), P('C', 50, '50k'), P('D', 450, '450k')])
  m.members.forEach((mm) => (mm.style = 'cable'))
  return m
})()

// ---------------------------------------------------------------- Q10 three-hinged inclined frame (Fig. 10)
const f10 = model('A:0,0 B*:60,80 C:124,32', 'A-B B-C', 'A:pin C:pin', [
  Pm('AB', 25, 40, '40k'),
  Pm('AB', 50, 80, '80k'),
  Pm('AB', 75, 60, '60k'),
  Pm('BC', 20, 80, '80k'),
  Pm('BC', 40, 40, '40k'),
  Pm('BC', 60, 60, '60k'),
])

// ---------------------------------------------------------------- Q11 deck Warren truss (Fig. 11)
const t11 = truss(
  'A:0,16 B:24,16 C:48,16 D:72,16 E:96,16 F:120,16 G:144,16 H:12,0 I:36,0 J:60,0 K:84,0 L:108,0 M:132,0',
  'A-B B-C C-D D-E E-F F-G H-I I-J J-K K-L L-M A-H H-B B-I CI=I-C C-J J-D D-K K-E E-L L-F F-M M-G',
  'A:pin G:roller',
)
const p11 = { kind: 'panel' as const, nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }
const ild11 = (m: string) => influenceLine(t11, p11, { kind: 'force', member: m })

// ---------------------------------------------------------------- Q12 truss (Fig. 12)
const t12 = truss(
  'A:0,0 B:12,0 C:24,0 D:36,0 E:48,0 F:12,18 G:24,25 H:36,32 I:48,39 J:12,9 K:24,9 L:36,9',
  'A-B B-C C-D D-E F-G G-H H-I A-F F-J J-B G-K K-C H-L L-D I-E J-G J-C K-H K-D L-I L-E',
  'A:pin E:roller',
  [P('F', 15, '15k'), P('G', 18, '18k'), P('H', 15, '15k')],
)

// ---------------------------------------------------------------- Q13 suspension bridge (Fig. 13)
const loads13 = [
  { x: 200, P: 80 },
  { x: 400, P: 60 },
]
const s13 = stiffenedSuspension({ L: 500, h: 55, xh: 250, loads: loads13 })
const fig13 = (() => {
  const xs = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
  const yc = (x: number) => 65 - (4 * 55 * x * (500 - x)) / 250000
  const gname = (x: number) => (x === 0 ? 'A' : x === 250 ? 'B*' : x === 500 ? 'C' : 'g' + x)
  const gid = (x: number) => gname(x).replace('*', '')
  const nodesS = [...xs.map((x) => `${gname(x)}:${x},0`), ...xs.map((x) => `k${x}:${x},${yc(x)}`), 'T0:0,-25', 'T1:500,-25', 'W0:-90,0', 'W1:590,0'].join(' ')
  const mem = [
    ...xs.slice(1).map((x, k) => `${gid(xs[k])}-${gid(x)}`),
    ...xs.slice(1).map((x, k) => `k${xs[k]}-k${x}`),
    ...xs.slice(1, -1).map((x) => `k${x}-${gid(x)}`),
    'T0-A A-k0 T1-C C-k500 W0-k0 W1-k500',
  ].join(' ')
  const m = model(nodesS, mem, 'T0:pin T1:pin W0:pin W1:pin', [P('g200', 80, '80k'), P('g400', 60, '60k')])
  m.nodes.forEach((n) => (n.id.startsWith('k') || n.id.startsWith('g') || n.id.startsWith('T') || n.id.startsWith('W')) && (n.label = ''))
  m.members.forEach((mm) => {
    if (mm.i.startsWith('k') && mm.j.startsWith('k')) mm.style = 'cable'
    else if (mm.i.startsWith('k') || mm.i.startsWith('W')) mm.style = 'thin'
  })
  return m
})()

// ---------------------------------------------------------------- Q14 frame ILDs (Fig. 14)
const f14 = model('E:0,0 A*:8,6 M:28,6 C:38,6 D:28,10 F:28,16', 'E-A A-M M-C M-D D-F', 'E:pin F:pin')
const p14 = { kind: 'members' as const, members: ['AM', 'MC'] }
const items14: ILDItem[] = [
  { label: 'V_M (just right)', resp: { kind: 'shear', member: 'MC', x: 0 } },
  { label: 'V_M (just left)', resp: { kind: 'shear', member: 'AM', x: 20 } },
  { label: 'V_D (column)', resp: { kind: 'shear', member: 'MD', x: 4 } },
  { label: 'M_D', resp: { kind: 'moment', member: 'MD', x: 4 } },
  { label: 'M_M (just left)', resp: { kind: 'moment', member: 'AM', x: 20 } },
  { label: 'Link force F_EA (T+)', resp: { kind: 'force', member: 'EA' } },
]
const il14 = (k: number) => influenceLine(f14, p14, items14[k].resp)

export const Q2007: PYQ[] = [
  {
    id: '2007-08-A1',
    paper: '2007-08',
    sec: 'A',
    no: '1',
    marks: 21,
    topics: ['ild'],
    title: 'ILDs: beam with overhang, hinge and fixed end',
    pages: PA,
    text: `Draw influence lines for (i) shear and moment at **C**, (ii) shear just right of support **B**, (iii) moment at **E** and (iv) reaction (vertical component) at **F** of the beam shown in Fig. 1.

Fig. 1: A (free end) — 7 ft — B (roller) — 10 ft — C — 4 ft — D (internal hinge) — 5 ft — E — 5 ft — F (fixed).`,
    figure: () => <Figure model={b1} />,
    checks: () => [
      { key: 'vc', label: '$V_C$ ordinate, unit load just left of C', value: ildAt(il1(0), 17, -1) },
      { key: 'mc', label: '$M_C$ ordinate, unit load at A (free end)', value: ildAt(il1(1), 0), unit: 'ft' },
      { key: 'me', label: '$M_E$ ordinate, unit load at the hinge D', value: ildAt(il1(3), 21), unit: 'ft' },
      { key: 'rf', label: '$R_F$ ordinate, unit load at A', value: ildAt(il1(4), 0) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** D–F is a cantilever fixed at F. A–D is a beam resting on the roller at B and on the hinge D, i.e. it hangs on the tip of the cantilever (a "drop-in" span with an overhang A–B). Every ILD is therefore made of straight lines (statically determinate), with kinks only at B, D and at the section.

**Unit load on A–D:** $\\sum M_D = 0$ on A–D gives $R_B = (21 - x)/14$, and the force passed to the cantilever at D is $R_D = (x - 7)/14$ (x from A). For a load at A: $R_B = 1.5$, $R_D = -0.5$ (D is pulled up).
**Unit load on D–F:** A–D carries nothing, so $V_C = M_C = V_{B^+} = 0$ there.

- $V_C$: load left of C → $V_C = -R_D$; load right of C (up to D) → $V_C = 1 - R_D$... equivalently $V_C = R_B - 1$ / $R_B$. Ordinates: $+0.5$ at A, $-0.714 \\mid +0.286$ at C, 0 at D.
- $M_C = R_D \\times 4$ (from the right of C) → $-2$ at A, $+40/14 = 2.857$ at C, 0 at D.
- $V_{B^+}$: like a simple beam B–D with overhang: 0.5 at A, 0 | 1 at B, 0 at D.
- $M_E$ (cantilever): load at D → $-5$ (hogging); load at A → $-5R_D = +2.5$; on D–E linear to 0 at E, zero on E–F.
- $R_F$: $= R_D$ for loads on A–D (−0.5 at A, 0 at B, 1 at D), $= 1$ on D–F.`}</Md>
        <ILDStack model={b1} path={p1} items={items1} ilds={ildsOf(b1, p1, items1)} />
      </div>
    ),
    notes: ['Read from Fig. 1: A at 0, roller B at 7 ft, C at 17 ft, hinge D at 21 ft, E at 26 ft, fixed F at 31 ft. A is a free end (no support).', 'Sign convention: shear + when the left part is pushed up; moment sagging +; R_F + upward.'],
  },
  {
    id: '2007-08-A2',
    paper: '2007-08',
    sec: 'A',
    no: '2',
    marks: 21,
    topics: ['ild'],
    title: 'Max shear right of C and max moment at D — hinged beam',
    pages: PA,
    text: `Calculate the maximum shear just right of support **C** and the maximum moment at **D** of the beam shown in Fig. 2 due to the following loading: moving live load = 3 kip/ft, self weight = 1.5 kip/ft and roving concentrated load = 50 k.

Fig. 2: left end — 6 ft — A (roller) — 12 ft — B (internal hinge) — 4 ft — C (roller) — 5 ft — D — 5 ft — E (hinge support) — 6 ft — right end.`,
    figure: () => <Figure model={b2} />,
    checks: () => {
      const v = uniformPlusConcentrated(ildVC2(), 3, 50, 1.5)
      const m = uniformPlusConcentrated(ildMD2(), 3, 50, 1.5)
      return [
        { key: 'vc', label: 'Max (positive) shear just right of C, incl. self weight', value: v.maxPos.total, unit: 'k' },
        { key: 'mdp', label: 'Max positive moment at D, incl. self weight', value: m.maxPos.total, unit: 'k-ft' },
        { key: 'mdn', label: 'Max negative moment at D, incl. self weight (as negative)', value: m.maxNeg.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** B–(right end) is a beam on C and E with overhangs (to the hinge B on the left, 6 ft past E on the right). The left part (left end)–B rests on A and on the hinge B, so it is carried by the right part.

**ILDs (statics / Müller-Breslau):**
- $V_{C^+}$: on the main beam the ILD is the simple-beam shear of span C–E extended over the overhangs: $+1$ just right of C, 0 at E, $-0.6$ at the right end, $+0.4$ at B (4 ft left of C). On the suspended part it goes linearly from 0.4 at B through 0 at A to $-0.2$ at the left end.
- $M_D$: simple-beam moment ILD of C–E with peak $5\\times5/10 = 2.5$ at D, extended to $-2$ at B and $-3$ at the right end; on the suspended part from $-2$ at B through 0 at A to $+1$ at the left end.

**Max effect:** live uniform load over all regions of the same sign + roving 50 k at the largest ordinate; self weight 1.5 k/ft on the full length (net area).`}</Md>
        <ILDStack
          model={b2}
          path={p2}
          items={[
            { label: 'V just right of C', resp: { kind: 'shear', member: 'CD', x: 0 } },
            { label: 'M_D', resp: { kind: 'moment', member: 'DE', x: 0 } },
          ]}
          ilds={[cleanILD(ildVC2()), cleanILD(ildMD2())]}
        />
        <MaxEffect ild={ildVC2()} w={3} P={50} wd={1.5} label="Shear just right of C (live 3 k/ft + 50 k, dead 1.5 k/ft)" />
        <MaxEffect ild={ildMD2()} w={3} P={50} wd={1.5} label="Moment at D" resUnit="k-ft" />
        <Md>{`**Answers:** max shear just right of C = **${fmt(uniformPlusConcentrated(ildVC2(), 3, 50, 1.5).maxPos.total)} k**; at D the max positive moment is **${fmt(uniformPlusConcentrated(ildMD2(), 3, 50, 1.5).maxPos.total)} k-ft** and the max negative moment is **${fmt(uniformPlusConcentrated(ildMD2(), 3, 50, 1.5).maxNeg.total)} k-ft** (numerically the larger — the design value).`}</Md>
      </div>
    ),
    notes: ['Read from Fig. 2: left end 0, roller A 6 ft, hinge B 18 ft, roller C 22 ft, D 27 ft, hinge support E 32 ft, right end 38 ft.', 'Self weight 1.5 k/ft acts on the full 38 ft length (dead effect = 1.5 × net ILD area).'],
  },
  {
    id: '2007-08-A3',
    paper: '2007-08',
    sec: 'A',
    no: '3',
    marks: 21,
    topics: ['wheel'],
    title: 'Absolute max moment and midspan moment, 50 ft span',
    pages: PA,
    text: `Using the loads shown in Fig. 3 calculate the absolute maximum moment on a 50 ft span. Also calculate the maximum moment at the mid point of the span due to these loads.

Fig. 3: 12, 12, 48, 48, 48, 48, 12, 12 k at spacings 4, 8, 6, 6, 6, 8, 4 ft.`,
    figure: () => <TrainTable t={t3} />,
    checks: () => [
      { key: 'abs', label: 'Absolute maximum moment', value: absoluteMaxMoment(50, t3).M, unit: 'k-ft' },
      { key: 'mid', label: 'Maximum moment at midspan', value: trainExtremes(ssMomentILD(50, 25), t3).max.value, unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Absolute maximum moment** occurs under a heavy wheel near the resultant, when the centreline of the span bisects the distance between that wheel and the resultant. Whole train (42 ft) fits on the span: $R = 240$ k at $\\bar x = 5040/240 = 21$ ft from the first wheel, so the 48 k wheel at 18 ft (e = 3 ft) is the candidate (by symmetry also the one at 24 ft).`}</Md>
        <AbsMaxSolution L={50} t={t3} />
        <Md>{`**Max moment at midspan** — triangular ILD with peak $L/4 = 12.5$ at 25 ft; put each wheel at the peak in turn (criterion: average load on the left ≈ average load on the span).`}</Md>
        <TrainOnILD ild={ssMomentILD(50, 25)} t={t3} span={[0, 50]} section={25} peak={{ x: 25, side: 1 }} what="moment at midspan" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2007-08-A4',
    paper: '2007-08',
    sec: 'A',
    no: '4',
    marks: 21,
    topics: ['wheel'],
    title: 'Max shear 20 ft from the support of an 80 ft span',
    pages: PA,
    text: `Compute the maximum shear at a section 20 ft from the left support of a simply supported beam of 80 ft span due to the series of moving loads shown in Fig. 4.

Fig. 4: 12, 12, 12, 12, 24, 24, 24, 24, 48, 48, 48, 48 k at spacings 4, 4, 4, 8, 6, 6, 6, 6, 6, 6, 6 ft.`,
    figure: () => <TrainTable t={t4} />,
    checks: () => {
      const e = trainExtremes(ssShearILD(80, 20), t4)
      return [
        { key: 'vp', label: 'Maximum positive shear at 20 ft', value: e.max.value, unit: 'k' },
        { key: 'vn', label: 'Maximum negative shear at 20 ft (as negative)', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Shear ILD at 20 ft: $-20/80 = -0.25$ just left, $+0.75$ just right. For maximum positive shear put a wheel just right of the section with the heavy part of the train on the long positive segment. Moving the train by one wheel spacing changes the shear by $\\Delta V = -P_{passing} + W\\Delta x/L$; stop when ΔV turns negative. With the 48 k wheels the train is best placed with its **heavy end at the section** (the 48 k group trailing the light wheels), so that no wheel lies on the negative part.`}</Md>
        <TrainOnILD ild={ssShearILD(80, 20)} t={t4} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="shear at 20 ft" />
        <Md>{`**Maximum shear = ${fmt(trainExtremes(ssShearILD(80, 20), t4).max.value)} k** (positive).`}</Md>
      </div>
    ),
    notes: ['The direction of travel is not fixed by the paper, so both directions were searched; the maximum has the 12 k wheels leading toward the right support and the last 48 k wheel just right of the section.'],
  },
  {
    id: '2007-08-A5',
    paper: '2007-08',
    sec: 'A',
    no: '5',
    marks: 21,
    topics: ['floor'],
    title: "Curved-chord truss: max force in 'a' and the counter",
    pages: PA,
    text: `Due to a moving live load of 2.5 kips per ft, combined with a roving concentrated live load of 60 kip, calculate the maximum stress in member **'a'** of the truss shown in Fig. 5. The dead load is 2.0 kips per ft. Is it required to provide a 'counter' in the panel? If so, show its location and calculate the force in the counter.

Fig. 5: 6 panels @ 30 ft = 180 ft; verticals 30, 37, 40, 37, 30 ft; member 'a' is the diagonal from the top of the 37 ft vertical down to the foot of the 40 ft centre vertical.`,
    figure: () => <Figure model={t5} labels={{ U2L3: 'a' }} dimY={false} />,
    checks: () => {
      const a = uniformPlusConcentrated(ildA5(), 2.5, 60, 2)
      const c = uniformPlusConcentrated(ildC5(), 2.5, 60, 2)
      return [
        { key: 'at', label: "Max tension in 'a' (DL + LL)", value: a.maxPos.total, unit: 'k' },
        { key: 'ac', label: "Max compression in 'a' (DL + LL, as negative)", value: a.maxNeg.total, unit: 'k' },
        { key: 'ctr', label: 'Max force in the counter L2U3', value: c.maxPos.total, unit: 'k' },
      ]
    },
    solution: () => {
      const a = uniformPlusConcentrated(ildA5(), 2.5, 60, 2)
      const c = uniformPlusConcentrated(ildC5(), 2.5, 60, 2)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**ILD of 'a' (= U2L3).** Load reaches the truss at the bottom-chord panel points, so the ILD is straight between panel points. Cut panel L2–L3 (members U2U3, U2L3, L2L3) and take moments about the point O where U2U3 produced meets the bottom chord: U2U3 rises 3 ft in 30 ft, so O is $37/0.1 = 370$ ft left of L2 (310 ft left of L0).
- Unit load right of the panel (e.g. at L3): left part, $R_{L0}(310) = F_a\\,\\times$ (lever arm of 'a' about O) → $F_a = +${fmt(ildAt(ildA5(), 90), 4)}$ (tension).
- Unit load at L2: right part with $R_{L6}$ → $F_a = ${fmt(ildAt(ildA5(), 60), 4)}$ (compression).`}</Md>
          <ILDStack model={t5} path={p5} items={[{ label: "F_a (U2L3)", resp: { kind: 'force', member: 'U2L3' } }]} ilds={[cleanILD(ildA5())]} />
          <MaxEffect ild={ildA5()} w={2.5} P={60} wd={2} label="Member 'a' (live 2.5 k/ft + 60 k, dead 2.0 k/ft on the full span)" />
          <Md>{`**Counter?** Dead load alone gives $2.0\\times${fmt(a.areas.net, 3)} = ${fmt(a.dead)}$ k (tension) in 'a', but the live load can produce $${fmt(a.maxNeg.live)}$ k, so the net force can be **${fmt(a.maxNeg.total)} k (compression)**. A slender diagonal cannot take compression, so **a counter is required** in this panel, running the other way: **L2–U3** (from the foot of the 37 ft vertical to the top of the 40 ft vertical).`}</Md>
          <Md>{`**Counter force.** When the counter acts, 'a' is slack — analyse the truss with L2U3 in place of 'a' and draw its ILD, then load it for maximum tension (dead load on the whole span):`}</Md>
          <ILDStack model={t5c} path={p5} items={[{ label: 'F_counter (L2U3)', resp: { kind: 'force', member: 'L2U3' } }]} ilds={[cleanILD(ildC5())]} />
          <MaxEffect ild={ildC5()} w={2.5} P={60} wd={2} label="Counter L2U3" />
          <Md>{`**Answers:** max force in 'a' = **${fmt(a.maxPos.total)} k tension** (and up to ${fmt(Math.abs(a.maxNeg.total))} k compression if no counter). Counter **L2U3** needed, max force **${fmt(c.maxPos.total)} k (tension)**.`}</Md>
        </div>
      )
    },
    notes: [
      'Through truss: loads (live and dead) are applied at the bottom-chord panel points L0–L6.',
      "Vertical heights read as 30, 37, 40, 37, 30 ft (symmetric); diagonals U1L2, U2L3 ('a'), U4L3, U5L4 slope down toward the centre.",
      'Diagonals are assumed unable to carry compression (classic counter assumption). No cross-sectional area is given, so "stress" is reported as member force in kips.',
    ],
  },
  {
    id: '2007-08-A6',
    paper: '2007-08',
    sec: 'A',
    no: '6',
    marks: 21,
    topics: ['floor'],
    title: 'Floor system with overhanging stringers: V(1-2), M(3)',
    pages: PA,
    text: `Draw influence lines for shear in panel 1-2 and moment at panel point 3 of the floor system shown in Fig. 6.

Fig. 6: girder 6 @ 15 ft = 90 ft with floor beams at panel points 0–6; girder supported by a hinge under panel point 1 and a roller under panel point 5. Stringers are broken 7.5 ft right of point 1 and 7.5 ft right of point 4 and are continuous over point 3 only as two separate stringers meeting there.`,
    figure: () => <StructureView model={fs6.model} showLoads={false} autoDimX={[0, 15, 22.5, 30, 45, 60, 67.5, 75, 90]} maxHeight={200} />,
    checks: () => [
      { key: 'v0', label: 'V(1-2) ordinate, unit load at panel point 0', value: ildAt(ildV6(), 0) },
      { key: 'vb', label: 'V(1-2) ordinate, unit load just right of the stringer break (x = 22.5 ft)', value: ildAt(ildV6(), 22.5, 1) },
      { key: 'm3', label: '$M_3$ ordinate, unit load at panel point 3', value: ildAt(ildM6(), 45), unit: 'ft' },
      { key: 'm0', label: '$M_3$ ordinate, unit load at panel point 0', value: ildAt(ildM6(), 0), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Load path.** Stringers: 0–22.5 (on floor beams 0 and 1, overhanging 7.5 ft past 1), 22.5–45 (on 2 and 3, overhanging 7.5 ft left of 2), 45–67.5 (on 3 and 4, overhang past 4), 67.5–90 (on 5 and 6, overhang left of 5). Each floor-beam reaction ILD is a straight line over the stringer(s) it supports. The girder (supports at 1 and 5, span 60 ft, overhangs 15 ft each side) feels only the floor-beam reactions, so

$$\\text{ILD}_{girder}(x) = \\sum_i FBR_i(x)\\times(\\text{girder ILD at floor beam } i).$$

**Girder ordinates at the floor beams** — shear in panel 1-2: 0.25 (at 0), 0 (at 1), 0.75, 0.5, 0.25, 0, −0.25 (at 2…6). Moment at 3: −7.5, 0, 7.5, 15, 7.5, 0, −7.5.

**At the stringer break x = 22.5:** load on the left stringer: $FBR_0 = -0.5$, $FBR_1 = 1.5$ → $V = -0.5(0.25) + 1.5(0) = -0.125$. Load on the right stringer: $FBR_2 = 1.5$, $FBR_3 = -0.5$ → $V = 1.5(0.75) - 0.5(0.5) = 0.875$. So the shear ILD **jumps at the break, not at a floor beam**. For $M_3$ both give $3.75$ — no jump, the ILD is a straight line from −7.5 at 0 to 15 at 3.`}</Md>
        <ILDStack model={fs6.model} path={fs6.path} items={items6} ilds={ildsOf(fs6.model, fs6.path, items6)} />
      </div>
    ),
    notes: [
      'Stringer breaks read at 22.5 ft (7.5 ft right of point 1) and 67.5 ft (7.5 ft right of point 4); at point 3 two stringers meet on the same floor beam.',
      'Girder supports read as hinge under point 1 (x = 15 ft) and roller under point 5 (x = 75 ft).',
    ],
  },
  {
    id: '2007-08-A7',
    paper: '2007-08',
    sec: 'A',
    no: '7',
    marks: 21,
    topics: ['floor'],
    title: 'Subdivided deck truss: ILDs for L4U4, M3U4, M3U3',
    pages: PA,
    text: `Draw influence lines for forces in members **L4U4, M3U4 and M3U3** of the truss shown in Fig. 7.

Fig. 7: deck truss, 12 panels @ 20 ft = 240 ft, depth 50 ft, supported at U0 (hinge) and U12 (roller) on the top chord; sub-diagonal joints M1, M3, …, M11 at mid-depth (25 ft).`,
    figure: () => <Figure model={t7} labels={{ L4U4: 'L4U4', M3U4: 'M3U4', M3U3: 'M3U3' }} dimY />,
    checks: () => [
      { key: 'l4u4', label: 'L4U4 ordinate, unit load at U4', value: ildAt(ild7('L4U4'), 80) },
      { key: 'l4u4b', label: 'L4U4 ordinate, unit load at U2', value: ildAt(ild7('L4U4'), 40) },
      { key: 'm3u4', label: 'M3U4 ordinate, unit load at U3', value: ildAt(ild7('M3U4'), 60) },
      { key: 'm3u3', label: 'M3U3 ordinate, unit load at U3', value: ildAt(ild7('M3U3'), 60) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Deck truss → the unit load moves along the **top chord** (panel points U0…U12); ILDs are straight between panel points.

- **M3U3** (hanger below U3): joint U3 → $F = -1$ when the load is at U3, 0 for any other panel point. ILD: triangle −1 at U3, 0 at U2 and U4.
- **M3U4** (sub-diagonal): with $F_{U3M3} = 0$, joint M3 has two collinear members (U2M3–M3L4) plus M3U4, so $F_{M3U4} = 0$. Only for the load at U3 is it non-zero: vertical equilibrium of M3 with the −1 hanger, split equally between the main diagonal and the sub-diagonal: $F = 1/(2\\sin\\theta) = ${fmt(ildAt(ild7('M3U4'), 60), 4)}$ (tension).
- **L4U4**: joint L4 → $F_{L4U4} = -F_{M3L4}\\sin\\theta$. $F_{M3L4}$ from a vertical section through panel U3–U4 (cutting U3U4, M3L4, L2L4): $F_{M3L4}\\sin\\theta = R_{U0}$ for loads right of U4 and $-R_{U12}$ for loads left of U3; at U3 the half of the load taken by the sub-diagonal must be included. Ordinates: +0.167 at U2, −0.667 at U4.`}</Md>
        <ILDStack
          model={t7}
          path={p7}
          items={[
            { label: 'F_L4U4', resp: { kind: 'force', member: 'L4U4' } },
            { label: 'F_M3U4', resp: { kind: 'force', member: 'M3U4' } },
            { label: 'F_M3U3', resp: { kind: 'force', member: 'M3U3' } },
          ]}
          ilds={['L4U4', 'M3U4', 'M3U3'].map((m) => cleanILD(ild7(m)))}
        />
      </div>
    ),
    notes: ['Load is taken on the top chord (deck truss — supports are at U0 and U12 on the top chord).', 'M-joints read at mid-depth (25 ft), so each main diagonal U(2k)–M–L passes straight through M.'],
  },
  {
    id: '2007-08-B8',
    paper: '2007-08',
    sec: 'B',
    no: '8',
    marks: 21,
    topics: ['cable'],
    title: 'Cable over a frictionless pulley: Tmax, sag, column reactions',
    pages: PB,
    text: `The left side of the weightless cable shown in Fig. 8 passes over a smooth, frictionless pulley at **B**, which is 15 ft higher than the right support hinged at **C**. The cable carries a uniform load of 1 kip per horizontal foot. **D** is a point of known elevation on the cable as shown. Determine (a) the maximum tension in the cable BC, (b) the sag of the cable at its lowest point measured from the cable chord and (c) the reactions at **E**.

Fig. 8: A (anchor) — 30 ft — E (base of the pulley column) — 60 ft — D — 20 ft — C. D is 20 ft above A/E level, C is 5 ft above D and B is 15 ft above C (40 ft above A). Pulley diameter 1 ft.`,
    figure: () => <Figure model={fig8} dims={[0, 30, 90, 110]} dimY={[0, 20, 25, 40]} />,
    checks: () => [
      { key: 'H', label: 'Horizontal tension H in BC', value: q8.H, unit: 'k' },
      { key: 'T', label: 'Maximum tension in BC (at B)', value: q8.TB, unit: 'k' },
      { key: 'sag', label: 'Sag at the lowest point, from the chord', value: q8.sagLow, unit: 'ft' },
      { key: 'Ey', label: 'Vertical reaction at E', value: q8.rE.ry, unit: 'k' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**(a) General cable theorem** $H\\,y = M_{beam}$ (y = sag below the chord B–C). Span B–C = 80 ft, chord falls 15 ft. At D (60 ft from B): chord is $15\\times60/80 = ${fmt(q8.chordD)}$ ft below B, the cable is 20 ft below B, so $y_D = ${fmt(q8.sagD)}$ ft. Beam moment: $M_D = \\tfrac{w x(L-x)}{2} = \\tfrac{1(60)(20)}{2} = ${fmt(q8.M0D)}$ k-ft.`}</Md>
        <Tex block>{`H = \\frac{${fmt(q8.M0D)}}{${fmt(q8.sagD)}} = ${fmt(q8.H, 4)}\\text{ k},\\qquad V_B = \\frac{wL}{2} + \\frac{H\\,(15)}{80} = 40 + ${fmt((q8.H * 15) / 80)} = ${fmt(q8.VB)}\\text{ k},\\quad V_C = ${fmt(q8.VC)}\\text{ k}`}</Tex>
        <Tex block>{`T_{max} = T_B = \\sqrt{H^2 + V_B^2} = \\sqrt{${fmt(q8.H)}^2 + ${fmt(q8.VB)}^2} = \\mathbf{${fmt(q8.TB)}}\\text{ k}\\quad(T_C = ${fmt(q8.TC)}\\text{ k})`}</Tex>
        <Md>{`**(b) Lowest point**: slope zero where the vertical component vanishes: $x_0 = V_B/w = ${fmt(q8.xLow)}$ ft from B (${fmt(80 - q8.xLow)} ft from C). Sag from the chord there:`}</Md>
        <Tex block>{`y_0 = \\frac{w\\,x_0(L - x_0)}{2H} = \\frac{${fmt(q8.xLow)}\\times${fmt(80 - q8.xLow)}}{2\\times${fmt(q8.H)}} = \\mathbf{${fmt(q8.sagLow)}}\\text{ ft}\\quad(\\text{lowest point is } ${fmt(q8.dropLow)}\\text{ ft below B, } ${fmt(q8.dropLow - 15)}\\text{ ft below C})`}</Tex>
        <Md>{`**(c) Reactions at E.** A frictionless pulley keeps the tension the same on both sides: $T_{AB} = T_B = ${fmt(q8.TB)}$ k. AB rises 40 ft over 30 ft (3-4-5) → components $0.6T = ${fmt(0.6 * q8.TB)}$ k ←, $0.8T = ${fmt(0.8 * q8.TB)}$ k ↓. BC pulls the pulley with H = ${fmt(q8.H)} k → and $V_B$ = ${fmt(q8.VB)} k ↓. The resultant on the pulley passes through its centre (equal tensions):`}</Md>
        <Tex block>{`R_x = ${fmt(q8.H)} - ${fmt(0.6 * q8.TB)} = ${fmt(q8.cx)}\\text{ k}\\rightarrow,\\qquad R_y = ${fmt(q8.VB)} + ${fmt(0.8 * q8.TB)} = ${fmt(-q8.cy)}\\text{ k}\\downarrow`}</Tex>
        <Tex block>{`E_x = \\mathbf{${fmt(Math.abs(q8.rE.rx))}}\\text{ k}\\ ${q8.rE.rx < 0 ? '\\leftarrow' : '\\rightarrow'},\\quad E_y = \\mathbf{${fmt(q8.rE.ry)}}\\text{ k}\\uparrow,\\quad M_E = ${fmt(q8.cx)}\\times39.5 = \\mathbf{${fmt(Math.abs(q8.rE.m))}}\\text{ k-ft}\\ ${q8.rE.m > 0 ? '(ccw)' : '(cw)'}`}</Tex>
      </div>
    ),
    notes: [
      'B (top of the pulley, where the 15 ft dimension starts) is taken 40 ft above A and E; the 1 ft pulley size is neglected for the cable geometry, so AB is a 30-40-50 line.',
      'The column at E is taken as fixed at its base (it must resist the unbalanced horizontal pull). The cable resultant acts through the pulley centre, 39.5 ft above E (use 40 ft if you ignore the pulley radius: M_E changes by ~1 %).',
    ],
  },
  {
    id: '2007-08-B9',
    paper: '2007-08',
    sec: 'B',
    no: '9',
    marks: 21,
    topics: ['cable'],
    title: 'Cable with point loads: loaded and unstretched length',
    pages: PB,
    text: `A cable with a horizontal cable chord is subjected to concentrated loads as shown in Fig. 9. If the maximum sag of the cable from the cable chord is 26 ft, find the length of the cable. What was the length of the cable before application of loads? Given: cross-sectional area of cable $A = 10$ in², $E = 30000$ ksi. Neglect weight of the cable.

Fig. 9: span A–E = 400 ft; 100 k at B (65 ft from A), 50 k at C (150 ft), 450 k at D (200 ft).`,
    figure: () => <Figure model={fig9} dims={[0, 65, 150, 200, 400]} />,
    checks: () => [
      { key: 'H', label: 'Horizontal tension H', value: c9.H, unit: 'k' },
      { key: 'L', label: 'Length of the loaded cable', value: c9.length, unit: 'ft' },
      { key: 'L0', label: 'Length before loading', value: c9.length - stretch9, unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Where is the max sag?** By the general cable theorem $H y = M_{beam}$, the sag is largest where the simple-beam moment is largest. $R_A = (100\\cdot335 + 50\\cdot250 + 450\\cdot200)/400 = 340$ k; $M_B = ${fmt(simpleBeamM(400, 65, loads9))}$, $M_C = ${fmt(simpleBeamM(400, 150, loads9))}$, $M_D = ${fmt(simpleBeamM(400, 200, loads9))}$ k-ft → max at **D**.`}</Md>
        <Tex block>{`H = \\frac{M_D}{26} = \\frac{${fmt(simpleBeamM(400, 200, loads9))}}{26} = \\mathbf{${fmt(c9.H)}}\\text{ k};\\quad y_B = ${fmt(c9.pts[1].sag, 4)},\\ y_C = ${fmt(c9.pts[2].sag, 4)},\\ y_D = 26\\text{ ft}`}</Tex>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Δx (ft)</th>
              <th>Δy (ft)</th>
              <th>Length (ft)</th>
              <th>T = H·L/Δx (k)</th>
              <th>T·L/EA (ft)</th>
            </tr>
          </thead>
          <tbody>
            {c9.segs.map((s, k) => (
              <tr key={k}>
                <td className="txt">{'ABCD'[k] + 'BCDE'[k]}</td>
                <td>{fmt(s.dx)}</td>
                <td>{fmt(s.dy, 4)}</td>
                <td>{fmt(s.len, 4)}</td>
                <td>{fmt(s.T)}</td>
                <td>{fmt((s.T * s.len) / EA9, 5)}</td>
              </tr>
            ))}
            <tr className="hl">
              <td className="txt">Σ</td>
              <td>400</td>
              <td></td>
              <td>{fmt(c9.length, 4)}</td>
              <td></td>
              <td>{fmt(stretch9, 4)}</td>
            </tr>
          </tbody>
        </table>
        <Md>{`**Loaded length** $= \\sum\\sqrt{\\Delta x^2 + \\Delta y^2} = \\mathbf{${fmt(c9.length, 4)}}$ ft.

**Elastic stretch** — each straight segment carries a constant tension: $\\Delta L = \\sum \\dfrac{T_i L_i}{AE}$ with $AE = 10\\times30000 = ${EA9}$ k → $\\Delta L = ${fmt(stretch9, 4)}$ ft.

**Length before loading** $= ${fmt(c9.length, 4)} - ${fmt(stretch9, 4)} = \\mathbf{${fmt(c9.length - stretch9, 4)}}$ ft.`}</Md>
      </div>
    ),
    notes: ['Load positions read from Fig. 9: 65, 85, 50 and 200 ft segments (span 400 ft), loads 100 k, 50 k, 450 k.', 'Unstretched length via L₀ = L − ΣTL/AE (small-strain; L/(1 + T/AE) changes the result by < 0.001 ft).'],
  },
  {
    id: '2007-08-B10',
    paper: '2007-08',
    sec: 'B',
    no: '10',
    marks: 21,
    topics: ['frames'],
    title: 'Three-hinged inclined frame: SFD and BMD',
    pages: PB,
    text: `Draw shear and moment diagrams for the structure shown in Fig. 10.

Fig. 10: two inclined members meeting at a crown hinge. Left member: pin support to crown, 4 @ 15 ft = 60 ft horizontally and 80 ft rise, with vertical loads 40 k, 80 k, 60 k at the quarter points (15, 30, 45 ft). Right member: crown to pin support, 4 @ 16 ft = 64 ft horizontally and 48 ft drop, with vertical loads 80 k, 40 k, 60 k at 16, 32, 48 ft from the crown. The right support is 32 ft higher than the left.`,
    figure: () => <Figure model={f10} dimY />,
    checks: () => {
      const r = solve(f10)
      const a = r.reaction('A')
      return [
        { key: 'Ax', label: 'Horizontal reaction at the left support (→ +)', value: a.rx, unit: 'k' },
        { key: 'Ay', label: 'Vertical reaction at the left support', value: a.ry, unit: 'k' },
        { key: 'Mab', label: 'Max moment in the left member', value: r.member('AB').M(50), unit: 'k-ft' },
        { key: 'Mbc', label: 'Moment in the right member under the 80 k load', value: r.member('BC').M(20), unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = solve(f10)
      const a = r.reaction('A')
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Reactions** (three-hinged, determinate): take moments about the right support for the whole frame and about the crown hinge B for the left member:
- $\\sum M_C$: $A_y(124) - A_x(32) = 40(109) + 80(94) + 60(79) + 80(48) + 40(32) + 60(16)$
- $\\sum M_B^{left} = 0$: $A_y(60) - A_x(80) - 40(45) - 80(30) - 60(15) = 0$
→ $A_x = ${fmt(a.rx)}$ k →, $A_y = ${fmt(a.ry)}$ k ↑; then $C_x = ${fmt(Math.abs(r.reaction('C').rx))}$ k ←, $C_y = ${fmt(r.reaction('C').ry)}$ k ↑.

**Member forces.** Resolve the end forces along / normal to each member. Left member: $\\cos\\theta = 0.6$, $\\sin\\theta = 0.8$ (3-4-5); right member: $\\cos\\phi = 0.8$, $\\sin\\phi = 0.6$. Each 40/80/60 k vertical load drops the shear by $P\\cos$ and changes the axial force by $P\\sin$. Moments are zero at both supports and at the crown hinge.`}</Md>
          <FrameSolution model={f10} kinds={['V', 'M', 'N']} />
        </div>
      )
    },
    notes: ['Loads read as vertical point loads at the horizontal quarter points of each member (distances along the members: 25, 50, 75 ft on the 100 ft left member; 20, 40, 60 ft on the 80 ft right member).', 'Right support level = 80 − 48 = 32 ft above the left support.'],
  },
  {
    id: '2007-08-B11',
    paper: '2007-08',
    sec: 'B',
    no: '11',
    marks: 21,
    topics: ['floor'],
    title: 'Deck Warren truss: ILDs for IJ, CI, BC + max force in BC',
    pages: PB,
    text: `Draw influence lines for bar forces **IJ, CI and BC** of the truss shown in Fig. 11. Calculate the maximum stress in bar BC due to a moving UDL of 3 k/ft accompanied by a roving concentration of 20 k. Load moves over the top chord.

Fig. 11: Warren deck truss, top chord A–G (6 @ 24 ft = 144 ft) supported at A (hinge) and G (roller), bottom chord H–M offset by half a panel, depth 16 ft.`,
    figure: () => <Figure model={t11} labels={{ IJ: 'IJ', CI: 'CI', BC: 'BC' }} dimY />,
    checks: () => {
      const bc = uniformPlusConcentrated(ild11('BC'), 3, 20)
      return [
        { key: 'ij', label: 'IJ ordinate, unit load at C', value: ildAt(ild11('IJ'), 48) },
        { key: 'ci', label: 'CI ordinate, unit load at C', value: ildAt(ild11('CI'), 48) },
        { key: 'bc', label: 'Max force in BC (compression −)', value: bc.maxNeg.live, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Load on the top chord → panel points A…G; ILDs straight between them. Method of sections:
- **IJ** (bottom chord): moments about C (opposite joint): $F_{IJ}\\cdot16 = M_C$ → ILD = $M_C/16$, a triangle with peak $\\frac{48\\cdot96}{144\\cdot16} = 2$ (tension).
- **BC** (top chord): moments about I (x = 36 ft): $F_{BC} = -M_I/16$; since I lies mid-panel, the ILD is a triangle-like line through panel points B and C: −1.125 at B, −1.5 at C (compression).
- **CI** (diagonal in panel B–C): vertical equilibrium — $F_{CI}\\sin\\theta = \\pm V_{BC}$, $\\sin\\theta = 16/20 = 0.8$ → $+R_G/0.8$ for load at B (0.208), $-R_A/0.8$ for load at C (−0.833).`}</Md>
        <ILDStack
          model={t11}
          path={p11}
          items={[
            { label: 'F_IJ', resp: { kind: 'force', member: 'IJ' } },
            { label: 'F_CI', resp: { kind: 'force', member: 'CI' } },
            { label: 'F_BC', resp: { kind: 'force', member: 'BC' } },
          ]}
          ilds={['IJ', 'CI', 'BC'].map((m) => cleanILD(ild11(m)))}
        />
        <MaxEffect ild={ild11('BC')} w={3} P={20} label="Bar BC (3 k/ft over the whole span, 20 k at C)" />
        <Md>{`The BC ILD is entirely negative, so the UDL covers the whole span: max force in BC = $3(${fmt(ildAreasNeg(ild11('BC')), 3)}) + 20(${fmt(ildExtremes(ild11('BC')).min.y, 3)}) = $ **${fmt(Math.abs(uniformPlusConcentrated(ild11('BC'), 3, 20).maxNeg.live))} k (compression)**.`}</Md>
      </div>
    ),
    notes: ['No dead load is given, so the maximum is for the live load only. No bar area is given, so "stress" is reported as force in kips.'],
  },
  {
    id: '2007-08-B12',
    paper: '2007-08',
    sec: 'B',
    no: '12',
    marks: 21,
    topics: ['truss'],
    title: 'Sloping-top truss: forces in JC, JG, BC, FG',
    pages: PB,
    text: `For the truss shown in Fig. 12, find the stresses in members **JC, JG, BC and FG**.

Fig. 12: bottom chord A–E, 4 @ 12 ft = 48 ft, hinge at A and roller at E. Top chord F–G–H–I is straight, rising from 18 ft at F (above B) to 39 ft at I (above E); J, K, L are at 9 ft on the verticals at B, C, D. Members: AF, F–J–B, G–K–C, H–L–D, I–E verticals; diagonals JG, JC, KH, KD, LI, LE. Loads: 15 k at F, 18 k at G, 15 k at H.`,
    figure: () => <Figure model={t12} dimY />,
    checks: () => {
      const r = solve(t12)
      return ['JC', 'JG', 'BC', 'FG'].map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Reactions:** $R_A = (15\\cdot36 + 18\\cdot24 + 15\\cdot12)/48 = 24$ k, $R_E = 48 - 24 = 24$ k.

**Joint A:** AF has slope 18:12 (length 21.63) → $F_{AF} = -24\\cdot21.63/18 = -28.84$ k, $F_{AB} = +16$ k. **Joint B:** JB is a zero-force member (B is unloaded with AB, BC collinear) → $F_{BC} = F_{AB} = 16$ k (T).

**Joint F:** FG slope 7:12 (length 13.89). Horizontal: $16 + F_{FG}(12/13.89) = 0$ → $F_{FG} = -18.52$ k. Vertical: $24 - 15 + F_{FG}(7/13.89) - F_{FJ} = 0$ → $F_{FJ} = -0.33$ k.

**Joint J:** JG along (12, 16)/20, JC along (12, −9)/15: $0.6F_{JG} + 0.8F_{JC} = 0$ and $0.8F_{JG} - 0.6F_{JC} = 0.333$ → $F_{JC} = -0.2$ k, $F_{JG} = +0.267$ k (both small: the first panel's shear is almost entirely taken by the inclined top chord).`}</Md>
        <TrussSolution model={t12} asked={['JC', 'JG', 'BC', 'FG']} />
      </div>
    ),
    notes: ['Read from Fig. 12: J, K, L are all at 9 ft (same level, mid-height of the 18 ft vertical at B); the top chord F–I is straight (21 ft rise over 36 ft), giving G at 25 ft and H at 32 ft.', 'No areas given — "stresses" reported as member forces in kips.'],
  },
  {
    id: '2007-08-B13',
    paper: '2007-08',
    sec: 'B',
    no: '13',
    marks: 21,
    topics: ['cable'],
    title: 'Suspension bridge, three-hinged stiffening girder: SFD & BMD',
    pages: PB,
    text: `Draw shear force and bending moment diagrams for the stiffening girders of the suspension bridge shown in Fig. 13.

Fig. 13: span 10 @ 50 ft = 500 ft, cable sag 55 ft, stiffening girder hinged at the towers (A, C) and at mid-span B. Loads: 80 k at 200 ft and 60 k at 400 ft from A.`,
    figure: () => <StructureView model={fig13} autoDimX={[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]} maxHeight={260} />,
    checks: () => [
      { key: 'H', label: 'Cable horizontal tension H', value: s13.H, unit: 'k' },
      { key: 'q', label: 'Uniform hanger load on the girder q', value: s13.q, unit: 'k/ft' },
      { key: 'M200', label: 'Girder moment under the 80 k load (x = 200 ft)', value: s13.M(200), unit: 'k-ft' },
      { key: 'M100', label: 'Girder moment at x = 100 ft', value: s13.M(100), unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Idea.** The parabolic cable delivers a uniform upward load $q$ through the hangers. Girder moment $M(x) = M_0(x) - H\\,y(x)$, where $M_0$ is the simple-beam moment of the loads and $y$ the cable sag. The central hinge gives $M(250) = 0$:

$R_A^0 = (80\\cdot300 + 60\\cdot100)/500 = 60$ k, $M_0(250) = 60(250) - 80(50) = 11000$ k-ft → $H = 11000/55 = 200$ k.`}</Md>
        <SuspensionSolution L={500} h={55} xh={250} loads={loads13} panel={50} />
        <Md>{`Girder reactions at the towers: $V(0) = R_A^0 - qL/2 = 60 - ${fmt((s13.q * 500) / 2)} = ${fmt(s13.V(0))}$ k; key moments: **${fmt(s13.M(200))} k-ft** under the 80 k load, **${fmt(s13.M(100))} k-ft** at 100 ft, **${fmt(s13.M(400))} k-ft** under the 60 k load.`}</Md>
      </div>
    ),
    notes: ['Load positions read from Fig. 13: 80 k at the 4th panel point (200 ft) and 60 k at the 8th (400 ft).', 'Girder ends A and C are hinged on the towers; hangers at every 50 ft are idealised as a uniform load (parabolic cable).'],
  },
  {
    id: '2007-08-B14',
    paper: '2007-08',
    sec: 'B',
    no: '14',
    marks: 21,
    topics: ['ild'],
    title: 'Frame with link: ILDs for shear and moment at M and D',
    pages: PB,
    text: `For the frame shown in Fig. 14, draw influence lines for (i) shear at **M** (just right), (ii) shear at **M** (just left), (iii) shear at **D**, (iv) moment at **D** and (v) moment at **M** (just left). Unit load moves from A to C.

Fig. 14: beam A–M–C (A to M 20 ft, M to C 10 ft) rigidly connected at M to a vertical member M–D–F (M to D 4 ft, D to F 6 ft) with a hinge support at F. End A is held by an inclined link E–A (hinge support at E, 8 ft left of A and 6 ft below it).`,
    figure: () => <Figure model={f14} dimY />,
    checks: () => [
      { key: 'vml', label: 'V at M (just left), unit load at A', value: ildAt(il14(1), 8) },
      { key: 'vd', label: 'V at D, unit load at A', value: ildAt(il14(2), 8) },
      { key: 'md', label: '$M_D$, unit load at A', value: ildAt(il14(3), 8), unit: 'ft' },
      { key: 'mml', label: 'M at M (just left), unit load at C', value: ildAt(il14(4), 38), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** E–A is a two-force link (hinged at both ends) along the 3-4-5 direction (8 ft, 6 ft, length 10 ft). The rigid body A–M–C–D–F rotates about the hinge F; the link stops it. Moment about F for a unit load at x (on A–C): the link line passes at a perpendicular distance of $|28(0.6) - 16(0.8)| = 4$ ft from F, so

$$F_{EA}\\times 4 = 1\\times(28 - x)\\ \\Rightarrow\\ F_{EA} = -\\frac{28 - x}{4}\\ \\text{(compression for loads left of M)}.$$

At A the link pushes with components $0.8|F|$ → and $0.6|F|$ ↑ (load at A: $|F| = 5$ → 4 k →, 3 k ↑).
- **Beam A–M** (cantilever-like from M): $V_{M^-} = 0.6|F_{EA}| - (\\text{load on } A\\!-\\!M)$, $M_{M^-} = 0.6|F_{EA}|\\cdot 20 - \\ldots$ → load at A: $V = 3 - 1 = 2$, $M = 2\\times20 = 40$.
- **Beam M–C** is a cantilever: $V_{M^+} = 1$ for the load on M–C, 0 otherwise.
- **Column at D**: only the horizontal force reaches it: $H = 0.8F_{EA}$ → $|V_D| = 4$ (load at A), 0 (at M), 2 (at C); $M_D = H\\times 6$ (distance D–F) → 24 at A, −12 at C.`}</Md>
        <ILDStack model={f14} path={p14} items={items14} ilds={ildsOf(f14, p14, items14)} />
        <p className="text-xs text-faint">Signs: beam shear + when the left part is pushed up, moment sagging +. The column is read bottom (M) → top (F), so its shear/moment signs follow that local axis (left side = the −x side of the column).</p>
      </div>
    ),
    notes: ['Read from Fig. 14: E (hinge) at (0, 0), A at (8, 6) is a hinge joint between the link and the beam, M at (28, 6), C at (38, 6), D at (28, 10), F (hinge support) at (28, 16).', 'E–A is treated as a pin-ended link (hinged at E and A), and M is a rigid joint.'],
  },
]

function ildAreasNeg(d: ILD) {
  return uniformPlusConcentrated(d, 1, 0).areas.neg
}
