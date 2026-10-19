// 2023-24 term final (held 30 Aug 2025) — reference implementation for all papers.
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildAreas, ildExtremes } from '../../engine/ild'
import { harmonicN, sdc, siteFromN } from '../../engine/eq'
import { classifyEnclosure, kzt, storeyForces } from '../../engine/wind'
import { cantileverMethod, portalMethod, type GridFrame } from '../../engine/approx'
import { trainExtremes, absoluteMaxMoment, ssMomentILD, ssShearILD, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { beamOf, floorSystem, H, model, P, truss } from '../../kit/builders'
import { AbsMaxSolution, ApproxSolution, Figure, ILDStack, MaxEffect, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { buildingFloors, DeterminacyCard, EQSolution, eqResult, KztSolution, LLRSolution, WindAnalytical, WindLoadCases } from '../../kit/loads'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'
import { reducedLL } from '../../engine/llr'

const PG = { A1: [70], A2: [71], A3: [71, 72, 73], A4: [73, 74], B5: [74, 75], B6: [75], B7: [76], B8: [76, 77] }

// ---------------------------------------------------------------- Q1(a) girder on a jack
const E = 29000
const EIg = (E * 250) / 144 // k-ft²
const girder = beamOf('a:0:pin b:20 c:40 d:60:roller')
const q1a = (() => {
  // difference force system: remove Ra = 60 (down), jack J at b (up), change at d
  const J = (60 * 60) / 40
  const dRd = 60 - J
  const elastic = (90 * 20 ** 2 * 40 ** 2) / (3 * EIg * 60) // ft, upward at b on simple span a–d
  const rigid = (40 / 60) * 1 // in, a lifted 1 in, d fixed
  const db = elastic * 12 + rigid
  // live load 20 k at c with the girder now on b (locked jack) and d
  const m2 = { ...beamOf('a:0 b:20:pin c:40 d:60:roller'), EI: EIg }
  const r2 = solve(m2, [P('c', 20)])
  const aLive = r2.disp('a').uy * 12
  return { J, dRd, elastic, rigid, db, aLive }
})()

// ---------------------------------------------------------------- Q1(b) truss relative deflection
const t1b = truss(
  'a:0,0 b:25,0 c:50,0 d:75,0 e:100,0 B:25,30 C:50,30 D:75,30',
  'a-b b-c c-d d-e B-C C-D a-B B-b B-c C-c c-D D-d D-e',
  'a:pin e:roller',
  [P('b', 50), P('d', 80)],
)
const AREA: Record<string, number> = { ab: 10, bc: 10, cd: 10, de: 10, BC: 10, CD: 10, aB: 15, Bb: 5, Bc: 15, Cc: 5, cD: 15, Dd: 5, De: 15 }
t1b.members.forEach((m) => (m.label = `(${AREA[m.id]})`))
const bD = (() => {
  const L = Math.hypot(75 - 25, 30)
  const ux = 50 / L,
    uy = 30 / L
  return [
    { kind: 'node' as const, node: 'b', fx: ux, fy: uy },
    { kind: 'node' as const, node: 'D', fx: -ux, fy: -uy },
  ]
})()
const vw1b = () => virtualWork(t1b, t1b.loads, bD, { EA: (id) => AREA[id] * E })

// ---------------------------------------------------------------- Q2(a) column: axial + shear + bending
const col = model('c:0,0 b:0,10 a:0,20', 'c-b b-a', 'c:fixed', [
  { kind: 'node', node: 'a', fx: 8, fy: -6, label: '10k (3:4)' },
  H('b', 10, '10k'),
])
const I1 = 200,
  A1 = 50
const G = E / (2 * 1.3)
const colOpts = {
  EI: (id: string) => (E * (id === 'ba' ? I1 : 1.5 * I1)) / 144,
  EA: (id: string) => E * (id === 'ba' ? A1 : 1.2 * A1),
  GA: (id: string) => G * (id === 'ba' ? A1 : 1.2 * A1),
  K: 1.2,
  shear: true,
  axial: true,
}
const vw2a = () => virtualWork(col, col.loads, [H('a', 1)], colOpts)

// ---------------------------------------------------------------- Q2(b) wind, Mirpur
const w2b = { V: 65.7, exp: 'A' as const, occ: 2 as const, G: 0.85, B: 20, L: 20, levels: [3, 6, 9] }

// ---------------------------------------------------------------- Q3(a) EQ Sylhet shelter
const SPT = [7, 8, 8, 10, 12, 15, 25, 27, 31, 34, 36, 36, 37, 42, 38, 38, 39, 45, 48, 50]
const hN = harmonicN(SPT.map((N) => ({ d: 5, N })))
const site3 = siteFromN(hN.N)
const sdc3 = sdc(site3, 4, 4)
const floors3 = buildingFloors({ area: 2500, DL: 12, LL: 2, roofLL: 1, storeys: 3, h: 3, base: 1.5, pedestal: 100 })
const eq3 = { Z: 0.36, occ: 4 as const, site: site3, system: 'SMF_rc' as const, hn: 10.5, eta: 1.2, floors: floors3 }

// ---------------------------------------------------------------- Q3(c) determinacy
const tower = truss(
  'a:0,0 b:6,0 c:0,8 d:6,8 e:0,16 f:6,16',
  'a-b c-d e-f a-c c-e b-d d-f ad=a-d bc=b-c cf=c-f de=d-e',
  'a:roller b:pin',
)
const frame3c = model(
  'L0:0,0 M0:10,0 R0:20,0 L1:0,4 M1:10,4 R1:20,4 L2:0,8 M2:10,8 R2:20,8 L3:0,12 M3:10,12',
  'L0-L1 L1-L2 L2-L3 M0-M1 M1-M2 M2-M3 R0-R1 R1-R2 L1-M1 M1-R1 L2-M2 M2-R2 L3-M3',
  'L0:fixed M0:pin R0:pin',
)

// ---------------------------------------------------------------- Q4(c) Kzt per storey (ft)
const kztIn = (z: number) => ({ hill: 'escarpment' as const, exp: 'C' as const, H: 30, Lh: 30, x: 25, downwind: true, z })

// ---------------------------------------------------------------- Q4(d) enclosure
const encl = classifyEnclosure(
  [
    { wall: 'windward', gross: 400, open: 140 },
    { wall: 'leeward', gross: 400, open: 48.5 },
    { wall: 'side1', gross: 400, open: 48.5 },
    { wall: 'side2', gross: 400, open: 48.5 },
  ],
  4,
)

// ---------------------------------------------------------------- Q5(a) portal
const g5: GridFrame = { xs: [0, 4, 8, 12], heights: [4, 4], loads: [12, 6], loadSide: ['right', 'right'] }
// ---------------------------------------------------------------- Q5(b) shear at 25 ft, 100 ft span
const train5: Train = { P: [15, 30, 30, 30, 12, 12, 12], gaps: [12, 15, 15, 20, 12, 12] }
const ild5 = ssShearILD(100, 25)
// ---------------------------------------------------------------- Q6(a) cantilever
const g6: GridFrame = { xs: [0, 6, 10], heights: [4, 3], loads: [-16, -8], loadSide: ['left', 'left'], areas: [[1, 2, 1], [1, 2, 1]] }
// ---------------------------------------------------------------- Q6(b) roof-type bridge truss, dead load
const wDL = 0.6 + 0.64 + 3.0
const t6 = truss(
  'A:0,0 B:8,0 C:16,0 D:24,0 E:32,0 H:8,6 G:16,12 F:24,6',
  'A-B B-C C-D D-E A-H H-G G-F F-E H-B G-C F-D H-C C-F',
  'A:pin E:roller',
  [P('B', wDL * 8, `${fmt(wDL * 8)}k`), P('C', wDL * 8, `${fmt(wDL * 8)}k`), P('D', wDL * 8, `${fmt(wDL * 8)}k`)],
)
// ---------------------------------------------------------------- Q7(a) truss ILD
const t7 = truss(
  'A:0,0 B:10,0 C:20,0 D:30,0 E:40,0 H:10,10 G:20,10 F:30,10',
  'A-B B-C C-D D-E H-G G-F A-H F-E H-B G-C F-D H-C C-F',
  'A:pin E:roller',
)
const p7 = { kind: 'panel' as const, nodes: ['A', 'B', 'C', 'D', 'E'] }
const ild7 = (m: string) => influenceLine(t7, p7, { kind: 'force', member: m })
// ---------------------------------------------------------------- Q7(b)
const train7: Train = { P: [15, 30, 30, 30], gaps: [12, 15, 15] }
// ---------------------------------------------------------------- Q8(a) floor beam system
const fs8 = floorSystem({ floorBeams: [0, 8, 24, 32], stringers: [[0, 16], [16, 40]], supports: [{ x: 0, type: 'pin' }, { x: 32, type: 'roller' }], names: { 0: 'A', 8: 'B', 16: 'E', 24: 'C', 32: 'D' } })
const ild8 = (r: ReturnType<typeof fs8.fbr>) => influenceLine(fs8.model, fs8.path, r)
// ---------------------------------------------------------------- Q8(b) Müller-Breslau
const b8 = beamOf('A:0:fixed D:12 B*:24 E:39 C:54:roller')
const p8 = { kind: 'members' as const, members: b8.members.map((m) => m.id) }

export const Q2023: PYQ[] = [
  {
    id: '2023-24-A1a',
    paper: '2023-24',
    sec: 'A',
    no: '1(a)',
    marks: 23.33,
    topics: ['vw'],
    title: 'Girder lifted on a hydraulic jack',
    pages: PG.A1,
    text: `The left support of a girder **a–d** (Fig. 1) needs repair. The girder is supported temporarily at joint **b** on a hydraulic jack. The gross reaction due to self-weight at **a** is 60 kip and at **d** is 40 kip. Compute the vertical displacement at **b** caused by the jack to free the support at **a** and lift it (joint a) **1 in** above its normal position when there is only the girder’s self-weight. At this lift, if an additional downward load of 20 kip is applied at **c**, find the net vertical deflection at **b** after application of this live load. $E = 29000$ ksi, $I = 250$ in⁴, same for every section; deflection primarily due to bending.`,
    figure: () => <Figure model={girder} />,
    checks: () => [
      { key: 'J', label: 'Jack force at b', value: q1a.J, unit: 'k' },
      { key: 'db', label: 'Upward displacement of b caused by the jack', value: q1a.db, unit: 'in', tol: 0.02 },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Idea.** Self-weight is already acting and the girder already sits on a and d. What changes is the *support forces*: reaction $R_a = 60$ k is removed, the jack pushes up with $J$ at b and $R_d$ changes. These changes form a **self-equilibrated force set** on the girder — they bend it — plus a rigid-body motion that lifts a by 1 in while d stays put.`}</Md>
        <Tex block>{`\\sum M_d = 0:\\ -60(60) + J(40) = 0 \\Rightarrow J = ${fmt(q1a.J)}\\text{ k},\\qquad \\Delta R_d = 60 - J = ${fmt(q1a.dRd)}\\text{ k}`}</Tex>
        <Md>{`**Bending part** — measure deflections from the chord a–d. With respect to that chord the difference system is a simple beam a–d with ${fmt(q1a.J)} k upward at b (the 60 k and 30 k act as its "reactions"). Unit-load method (or the standard formula $Pa^2b^2/3EIL$):`}</Md>
        <Tex block>{`\\delta_{b,\\,elastic} = \\int \\frac{Mm}{EI}dx = \\frac{90(20)^2(40)^2}{3EI(60)} = \\frac{320{,}000}{EI},\\quad EI = \\frac{29000\\times250}{144} = ${fmt(EIg, 1)}\\text{ k-ft}^2`}</Tex>
        <Tex block>{`\\delta_{b,\\,elastic} = ${fmt(q1a.elastic, 4)}\\text{ ft} = ${fmt(q1a.elastic * 12, 3)}\\text{ in}\\ \\uparrow`}</Tex>
        <Md>{`**Rigid-body part** — the chord itself rotates about d so that a rises 1 in: at b (40 ft from d) $\\delta = \\tfrac{40}{60}(1) = ${fmt(q1a.rigid, 3)}$ in ↑.`}</Md>
        <Tex block>{`\\Delta_b = ${fmt(q1a.elastic * 12, 3)} + ${fmt(q1a.rigid, 3)} = \\mathbf{${fmt(q1a.db, 3)}}\\text{ in}\\ \\uparrow`}</Tex>
        <Md>{`**Live load 20 k at c.** Once lifted, the jack is locked, so b acts as a support and does **not** move further: net deflection at b stays ${fmt(q1a.db, 3)} in ↑. The free end a moves instead: girder on b (jack) and d, 20 k at c → a moves ${fmt(Math.abs(q1a.aLive), 3)} in ${q1a.aLive > 0 ? 'up' : 'down'} (overhang rotates).`}</Md>
        <p className="text-xs text-faint">I = 250 in⁴ makes the numbers large; the method is what earns the marks.</p>
      </div>
    ),
    notes: ['Assumed the jack is locked after lifting (acts as a support for the live load). If your teacher treats the jack force as constant, b would move instead — state your assumption in the exam.'],
  },
  {
    id: '2023-24-A1b',
    paper: '2023-24',
    sec: 'A',
    no: '1(b)',
    marks: 23,
    topics: ['vw'],
    title: 'Truss: relative deflection between b and D',
    pages: PG.A1,
    text: `Using the method of virtual work, determine the relative deflection between **b** and **D** along the line connecting b–D of the loaded truss in Fig. 2. Member areas (in²) are shown in brackets. $E = 29000$ ksi.`,
    figure: () => <Figure model={t1b} labels />,
    checks: () => [{ key: 'rel', label: 'Relative deflection b–D (in, + = closer)', value: vw1b().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Apply a **pair of equal and opposite unit loads** at b and D along line b–D (pointing toward each other). Solve the truss for the real loads (N) and for the unit pair (n); then $\\Delta_{rel} = \\sum \\frac{N n L}{AE}$ (× 12 to get inches with L in ft). Positive → b and D move **closer**.`}</Md>
        <VWSolution model={t1b} real={t1b.loads} virtual={bD} opts={{ EA: (id) => AREA[id] * E }} scale={12} resultUnit="in" what="Δ(b–D)" unitNote="N, n in kip; L in ft; A in in²; E = 29000 ksi; multiplied by 12 for inches." />
        <TrussSolution model={t1b} asked={[]} note="Real member forces (for reference)." />
      </div>
    ),
  },
  {
    id: '2023-24-A2a',
    paper: '2023-24',
    sec: 'A',
    no: '2(a)',
    marks: 23.33,
    topics: ['vw'],
    title: 'Cantilever column: axial + shear + bending energy',
    pages: PG.A2,
    text: `Using the method of virtual work, find the horizontal deflection of point **a** of the column in Fig. 3, considering axial, shear and bending strain energy. $E = 29000$ ksi, $\\vartheta = 0.3$, $K = 1.2$, $A_1 = 50$ in², $A_2 = 1.2A_1$, $I_1 = 200$ in⁴, $I_2 = 1.5I_1$ (a–b is segment 1, b–c is segment 2). Loads: 10 k at a with slope 3:4, 10 k horizontal at b.`,
    figure: () => <Figure model={col} dims={false} dimY />,
    checks: () => [{ key: 'dh', label: 'Horizontal deflection of a', value: vw2a().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Components of the inclined load: $10\\times\\tfrac45 = 8$ k → (horizontal), $10\\times\\tfrac35 = 6$ k ↓. Virtual system: unit horizontal load at a. Then
$$\\Delta_a = \\int\\frac{Mm}{EI}dx + K\\int\\frac{Vv}{GA}dx + \\sum\\frac{Nn L}{AE},\\qquad G = \\frac{E}{2(1+\\vartheta)} = ${fmt(G, 1)}\\text{ ksi}$$
The unit horizontal load produces **no axial force** (n = 0), so the 6 k vertical component does not contribute.`}</Md>
        <Md>{`Segment a–b (x from a): $M = 8x$, $m = x$ → $\\int_0^{10} 8x^2dx/EI_1 = 2666.7/EI_1$. Segment b–c: $M = 8(10+t) + 10t$, $m = 10+t$ → $27000/EI_2$. Shear: $V = 8$ and $18$ k, $v = 1$.`}</Md>
        <VWSolution model={col} real={col.loads} virtual={[H('a', 1)]} opts={colOpts} scale={12} resultUnit="in" what="Δa (horizontal)" unitNote="EI in k-ft² (I/144), GA and EA in kip; result ft × 12 = in. The shear term is tiny compared to bending — typical for slender members." />
      </div>
    ),
  },
  {
    id: '2023-24-A2b',
    paper: '2023-24',
    sec: 'A',
    no: '2(b)',
    marks: 23,
    topics: ['wind'],
    title: 'Wind: 3-storey office at Mirpur, design pressure & base reaction',
    pages: PG.A2,
    text: `A typical 3-storied RC office building is located at Mirpur, Dhaka. Plan 20 m × 20 m, storey height 3 m. Occupancy category II, exposure category **A**, basic wind speed 65.7 m/s, $G = 0.85$, enclosed. $K_z = 2.01(z/z_g)^{2/\\alpha}$ for $4.57 \\le z \\le z_g$, $K_z = 2.01(4.57/z_g)^{2/\\alpha}$ for $z < 4.57$ m. Determine the design wind pressure and the horizontal base reaction due to the design wind load (ignore parapet).`,
    checks: () => {
      const r = storeyForces({ ...w2b, I: 1, Kzt: 1, Kd: 0.85 })
      return [
        { key: 'qh', label: '$q_h$ at roof (9 m)', value: r.qh, unit: 'kN/m²' },
        { key: 'pl', label: 'Leeward pressure', value: r.pl, unit: 'kN/m²' },
        { key: 'V', label: 'Base reaction', value: r.base, unit: 'kN' },
      ]
    },
    solution: () => <WindAnalytical {...w2b} note={<p className="text-xs text-mute">Exposure A: α = 7.0, z_g = 365.76 m. Level 1 (z = 3 m, below 4.57 m) uses K_z at 4.57 m. Each level’s tributary height is half the storey below + half above (roof: half the top storey).</p>} />,
  },
  {
    id: '2023-24-A3a',
    paper: '2023-24',
    sec: 'A',
    no: '3(a)',
    marks: 30.67,
    topics: ['eq'],
    title: 'Earthquake: 3-storey shelter at Sylhet (SPT → site class → V, Fx)',
    pages: PG.A3,
    text: `A 3-storied RC building at Sylhet will be used as a hurricane / emergency shelter. Storey height 3 m, depth of base 1.5 m, plan 50 m × 50 m. $Z = 0.36$, damping correction factor $\\eta = 1.2$. Dead load incl. self-weight 12 kN/m², live load 2 kN/m² (typical floors), roof live load 1 kN/m². Pedestals below GF weigh 100 kN; GF has an RC floor with typical floor loads. SPT N-values for every 5 ft down to 100 ft: ${SPT.join(', ')}.

(i) Harmonic average SPT of the top 100 ft. (ii) Occupancy category, seismic design category, site class and frame system. (iii) Earthquake base shear and storey forces.`,
    checks: () => {
      const r = eqResult(eq3)
      return [
        { key: 'N', label: 'Harmonic average $\\bar N$', value: hN.N },
        { key: 'T', label: 'Period T', value: r.T, unit: 's' },
        { key: 'V', label: 'Base shear V', value: r.V, unit: 'kN' },
        { key: 'Froof', label: 'Roof force', value: r.rows.find((x) => x.name === 'Roof')!.F, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**(i)** 20 layers of 5 ft: $\\bar N = \\dfrac{\\sum d_i}{\\sum d_i/N_i} = \\dfrac{${fmt(hN.sumD)}}{${fmt(hN.sumDN, 4)}} = \\mathbf{${fmt(hN.N, 2)}}$ → 15 ≤ N̄ ≤ 50 → **site class ${site3}**.`}</Md>
        <Md>{`**(ii)** Emergency shelter → **Occupancy IV** (I = 1.5). Sylhet → Zone 4. Table 6.2.18 (Occupancy IV, ${site3}, Zone 4) → **SDC ${sdc3}**. In SDC D only special moment frames are permitted for RC → **SMRF, R = 8**.`}</Md>
        <Md>{`**(iii)** $h_n = 1.5 + 3\\times3 = 10.5$ m. Seismic weight per floor $= 2500(12 + 0.25\\times2) = 31{,}250$ kN; roof $= 2500(12 + 0.25\\times1) = 30{,}625$ kN; pedestals 100 kN at the base.`}</Md>
        <EQSolution {...eq3} />
      </div>
    ),
    notes: ['η = 1.2 is used as given (for 5 % damping η would be 1).', 'Each SPT value is taken to represent the 5 ft layer above it.'],
  },
  {
    id: '2023-24-A3b',
    paper: '2023-24',
    sec: 'A',
    no: '3(b)',
    marks: 10,
    topics: ['code'],
    title: 'Live load reduction for an interior column',
    pages: [72],
    text: `Column layout of a three-storied residential building is shown (grid spacings: 1–2 = 4 m, 2–3 = 8 m; A–B = 6 m, B–C = 3 m). Find the reduced live load for the column at **grid B-2** at Level-1 and Level-2. $L = L_0\\left(0.25 + \\dfrac{4.57}{\\sqrt{K_{LL}A_T}}\\right)$, $L_0 = 2.4$ kN/m², $K_{LL} = 4$ (interior column).`,
    figure: () => <GridPlan />,
    checks: () => [
      { key: 'L2', label: 'Reduced LL, Level-2 column', value: reducedLL({ L0: 2.4, KLL: 4, AT: 27, floorsSupported: 1 }).L, unit: 'kN/m²' },
      { key: 'L1', label: 'Reduced LL, Level-1 column', value: reducedLL({ L0: 2.4, KLL: 4, AT: 54, floorsSupported: 2 }).L, unit: 'kN/m²' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Tributary area of B-2 = (half of 4 m + half of 8 m) × (half of 6 m + half of 3 m) = 6 × 4.5 = **27 m²** per floor. A column at a lower level carries the floors above it, so its $A_T$ adds up.`}</Md>
        <LLRSolution
          L0={2.4}
          rows={[
            { label: 'Level-2 column (1 floor)', AT: 27, KLL: 4, floors: 1 },
            { label: 'Level-1 column (2 floors)', AT: 54, KLL: 4, floors: 2, ATnote: '2 × 27 m²' },
          ]}
        />
      </div>
    ),
    notes: ['Roof live load is not reduced by this formula (it has its own R₁R₂ rule), so the floors counted are the typical floors above each column, following the lecture example.'],
  },
  {
    id: '2023-24-A3c',
    paper: '2023-24',
    sec: 'A',
    no: '3(c)',
    marks: 6,
    topics: ['stability'],
    title: 'DOSI and DOKI of a braced tower and an irregular frame',
    pages: [73],
    text: `Determine the degree of static indeterminacy (DOSI) and degree of kinematic indeterminacy (DOKI) for the structures in Fig. 5.`,
    figure: () => (
      <div className="grid md:grid-cols-2 gap-2">
        <StructureView model={tower} nodeLabels={false} showLoads={false} maxHeight={220} />
        <StructureView model={frame3c} nodeLabels={false} showLoads={false} maxHeight={220} />
      </div>
    ),
    checks: () => [
      { key: 'd1', label: 'Tower truss: DOSI', value: 2 },
      { key: 'k1', label: 'Tower truss: DOKI', value: 9 },
      { key: 'd2', label: 'Frame: DOSI', value: 13 },
    ],
    solution: () => (
      <div className="grid md:grid-cols-2 gap-3">
        <DeterminacyCard m={tower} label="(1) X-braced tower (diagonals not connected at crossings)" />
        <DeterminacyCard m={frame3c} label="(2) Frame — fixed + 2 pins" />
      </div>
    ),
  },
  {
    id: '2023-24-A4a',
    paper: '2023-24',
    sec: 'A',
    no: '4(a)',
    marks: 5.67,
    topics: ['code'],
    title: 'Hammurabi’s code and the purpose of a building code',
    pages: [73],
    text: `Briefly answer: (i) What was Hammurabi’s Code, and how was it relevant to building design? (ii) What is the primary purpose of a building code?`,
    solution: () => (
      <Md>{`**(i)** The Code of Hammurabi (Babylon, ~1750–2000 BC) is the oldest known written law with building provisions. It made builders strictly liable: *“if a house collapses and kills the owner, the builder shall be put to death; if it kills the owner’s son, the builder’s son shall be put to death.”* It is relevant because it established the principle that builders are **responsible for structural safety** — the root idea behind every modern building code.

**(ii)** A building code sets the **minimum** requirements for design, construction, materials, use/occupancy, location and maintenance of buildings to **safeguard life, limb, health, property and public welfare** (BNBC 2020). It is written for professionals; designers may go beyond it when judgment demands. It works as prevention — "an ounce of prevention today vs. a pound of suffering later" — e.g. against fire (Chawkbazar 2019, FR Tower 2019), collapse and earthquakes.`}</Md>
    ),
  },
  {
    id: '2023-24-A4b',
    paper: '2023-24',
    sec: 'A',
    no: '4(b)',
    marks: 10,
    topics: ['wind'],
    title: 'The four wind load cases',
    pages: [73],
    text: `Illustrate the four wind load cases with diagrams.`,
    solution: () => (
      <div className="space-y-2 text-sm">
        <WindLoadCases />
        <Md>{`- **Case 1** — full design pressure on the windward and leeward walls, applied in each principal direction **separately**.
- **Case 2** — 75 % of Case 1 pressures applied with an **eccentricity of 15 %** of the building width → adds a torsional moment $M_T = 0.75(P_W + P_L)B_x(\\pm0.15B_x)$.
- **Case 3** — 75 % of Case 1 in **both principal directions simultaneously**.
- **Case 4** — 56.3 % of Case 1 in both directions simultaneously **plus torsion** (eccentricity 15 %).`}</Md>
      </div>
    ),
  },
  {
    id: '2023-24-A4c',
    paper: '2023-24',
    sec: 'A',
    no: '4(c)',
    marks: 15,
    topics: ['wind'],
    title: 'Topographic factor on a 2-D escarpment (Rangamati)',
    pages: [73],
    text: `A five-storied residential building (plan 75 ft × 100 ft, total height 50 ft) is on a 2-D escarpment (Fig. 6) at Rangamati: escarpment height 30 ft over a horizontal run of 60 ft, building set back 25 ft from the crest, wind blowing toward the building from the low side. Basic wind speed 56.7 m/s, enclosed, exposure C, first two speed-up conditions met. Determine $K_{zt}$ at each storey.`,
    figure: () => <EscarpmentFig />,
    checks: () => [10, 30, 50].map((z) => ({ key: `k${z}`, label: `$K_{zt}$ at z = ${z} ft`, value: kzt(kztIn(z)).Kzt, tol: 0.005 })),
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`$L_h$ = horizontal distance from the crest to where the ground is at H/2 = 15 ft → 30 ft. Building is **downwind** of the crest at x = 25 ft (to the windward face). Condition checks: H/L_h = 1 ≥ 0.2 ✓, H = 30 ft ≥ 15 ft (4.5 m) ✓, building near the crest ✓.`}</Md>
        <KztSolution {...kztIn(10)} unit="ft" />
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Storey level</th>
              <th>z (ft)</th>
              <th>K₃</th>
              <th>Kzt</th>
            </tr>
          </thead>
          <tbody>
            {[10, 20, 30, 40, 50].map((z, i) => {
              const r = kzt(kztIn(z))
              return (
                <tr key={z}>
                  <td>{i + 1}</td>
                  <td>{z}</td>
                  <td>{fmt(r.K3, 4)}</td>
                  <td className="font-bold">{fmt(r.Kzt, 4)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="text-xs text-faint">K₁ = {fmt(kzt(kztIn(10)).K1, 4)} and K₂ = {fmt(kzt(kztIn(10)).K2, 4)} are the same for all storeys; only K₃ decays with height.</p>
      </div>
    ),
  },
  {
    id: '2023-24-A4d',
    paper: '2023-24',
    sec: 'A',
    no: '4(d)',
    marks: 16,
    topics: ['wind'],
    title: 'Enclosure classification from wall openings',
    pages: [74],
    text: `A one-storied building is 40 ft × 40 ft with 10 ft high walls. Windward wall: one entry opening 20 ft × 7 ft. Leeward and both side walls: each has a door 3.5 ft × 7 ft and two windows 3 ft × 4 ft. Classify the building as ENCLOSED, PARTIALLY ENCLOSED or OPEN (BNBC 2020).

Open: every wall ≥ 80 % open. Partially enclosed: (i) $A_o \\ge 1.10A_{oi}$, (ii) $A_o > 4$ ft² or $> 0.01A_g$ (whichever is smaller), (iii) $A_{oi}/A_{gi} \\le 0.20$. Otherwise enclosed.`,
    checks: () => [
      { key: 'Ao', label: '$A_o$ (windward openings)', value: encl.Ao, unit: 'ft²' },
      { key: 'Aoi', label: '$A_{oi}$ (other openings)', value: encl.Aoi, unit: 'ft²' },
    ],
    solution: () => (
      <div className="text-sm space-y-1">
        <Md>{`$A_o = 20\\times7 = ${encl.Ao}$ ft², $A_g = 40\\times10 = ${encl.Ag}$ ft². Each other wall: $3.5\\times7 + 2(3\\times4) = 48.5$ ft² → $A_{oi} = 3\\times48.5 = ${encl.Aoi}$ ft², $A_{gi} = 3\\times400 = ${encl.Agi}$ ft² (walls only; adding the roof only lowers the ratio).`}</Md>
        <Md>{`- Open? No wall is 80 % open → **not open**.
- (i) $A_o = ${encl.Ao}$ vs $1.10A_{oi} = ${fmt(1.1 * encl.Aoi)}$ → ${encl.c1 ? '✓' : '✗ **fails**'}
- (ii) $A_o > \\min(4, 0.01A_g = ${fmt(0.01 * encl.Ag)})$ → ${encl.c2 ? '✓' : '✗'}
- (iii) $A_{oi}/A_{gi} = ${fmt(encl.ratio, 3)} \\le 0.20$ → ${encl.c3 ? '✓' : '✗'}`}</Md>
        <p className="text-base">
          All three must hold for partially enclosed → the building is <b className="text-accent">{encl.cls === 'enclosed' ? 'ENCLOSED' : encl.cls === 'partially' ? 'PARTIALLY ENCLOSED' : 'OPEN'}</b> (GC<sub>pi</sub> = ±0.18).
        </p>
      </div>
    ),
  },
  {
    id: '2023-24-B5a',
    paper: '2023-24',
    sec: 'B',
    no: '5(a)',
    marks: 30,
    topics: ['lateral'],
    title: 'Portal method: 3-bay, 2-storey frame',
    pages: [74],
    text: `Using the portal method, analyse the multi-storied frame for the lateral loads in Fig. 8 (3 bays of 4 m, 2 storeys of 4 m; 6 kN at the roof and 12 kN at the first floor, both acting to the right at the right end). Draw SFD, BMD and AFD for columns and beams.`,
    figure: () => <ApproxFig g={g5} unit="kN" />,
    checks: () => {
      const r = portalMethod(g5)
      return [
        { key: 'v1', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'kN' },
        { key: 'm1', label: 'Exterior column end moment, ground storey', value: r.columns[0][0].mTop, unit: 'kN-m' },
        { key: 'mb', label: 'First-floor beam end moment', value: r.beams[0][0].moment, unit: 'kN-m' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Assumptions: inflection points at mid-height of every column and mid-span of every beam; each interior column takes **twice** the shear of an exterior column (3 bays → 6 shares). Storey shears: top = 6 kN, ground = 18 kN.`}</Md>
        <ApproxSolution g={g5} method="portal" unit="kN" lenUnit="m" />
      </div>
    ),
  },
  {
    id: '2023-24-B5b',
    paper: '2023-24',
    sec: 'B',
    no: '5(b)',
    marks: 16.67,
    topics: ['wheel'],
    title: 'Max shear 25 ft from the support of a 100 ft span',
    pages: [75],
    text: `Calculate the maximum shear at a point 25 ft from the left support of a simply supported beam of 100 ft span for the series of concentrated loads in Fig. 9: 15, 30, 30, 30, 12, 12, 12 k at spacings 12, 15, 15, 20, 12, 12 ft.`,
    checks: () => [{ key: 'v', label: 'Maximum (positive) shear', value: trainExtremes(ild5, train5).max.value, unit: 'k' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at 25 ft: −0.25 just left, +0.75 just right of the section. For **maximum positive shear** put a wheel just right of the section with as much load as possible on the positive part (right of the section) and little on the negative part. Move the train wheel by wheel: the shear changes by $\\Delta V = -P_{passing} + \\dfrac{W\\,\\Delta x}{L}$ — keep going while ΔV > 0.`}</Md>
        <TrainOnILD ild={ild5} t={train5} span={[0, 100]} section={25} peak={{ x: 25, side: 1 }} what="shear at 25 ft" />
      </div>
    ),
  },
  {
    id: '2023-24-B6a',
    paper: '2023-24',
    sec: 'B',
    no: '6(a)',
    marks: 30,
    topics: ['lateral'],
    title: 'Cantilever method: 2-bay, 2-storey frame (A, 2A, A)',
    pages: [75],
    text: `Using the cantilever method, analyse the frame in Fig. 10 and draw SFD, BMD and AFD. Bays 6 m and 4 m; storeys 4 m (ground) and 3 m (top). Loads 16 kN (first floor) and 8 kN (roof), acting to the left at the left end. Relative column areas A, 2A, A in both storeys.`,
    figure: () => <ApproxFig g={g6} unit="kN" />,
    checks: () => {
      const r = cantileverMethod(g6)
      return [
        { key: 'xbar', label: 'Centroid of column areas from the left column', value: r.overturning![0].xbar, unit: 'm' },
        { key: 'n1', label: 'Axial force in left ground-storey column (T +)', value: r.columns[0][0].axial, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Assumptions: inflection points at mid-height of columns and mid-span of beams; **axial stress in each column ∝ its distance from the centroid** of the column areas. Centroid: $\\bar x = \\dfrac{1(0) + 2(6) + 1(10)}{4} = 5.5$ m. Loads act to the left, so the **right** side is the windward/tension side.`}</Md>
        <ApproxSolution g={g6} method="cantilever" unit="kN" lenUnit="m" />
      </div>
    ),
  },
  {
    id: '2023-24-B6b',
    paper: '2023-24',
    sec: 'B',
    no: '6(b)',
    marks: 16.67,
    topics: ['truss'],
    title: 'Bridge truss under dead load: GF, CD, FC',
    pages: [75],
    text: `The truss in Fig. 11 supports: track 600 lb/ft, floor 640 lb/ft, truss and bracings 3000 lb/ft. Calculate the axial force in members **GF, CD and FC** for the dead load. All members pin connected. Panels 4 @ 8 ft; H and F are 6 ft high, G is 12 ft high.`,
    figure: () => <Figure model={t6} />,
    checks: () => {
      const r = solve(t6)
      return ['GF', 'CD', 'CF'].map((id) => ({ key: id, label: `Force in ${id === 'CF' ? 'FC' : id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Total dead load $w = 0.60 + 0.64 + 3.00 = ${fmt(wDL)}$ k/ft, delivered to the bottom-chord panel points (floor system): interior joints get $w\\times8 = ${fmt(wDL * 8)}$ k; the halves at A and E go straight into the supports. Reactions $= 1.5\\times${fmt(wDL * 8)} = ${fmt(1.5 * wDL * 8)}$ k each.`}</Md>
        <Md>{`**Method of sections** through GF, FC, CD and moments about C (for GF) and F (for CD); FC from vertical equilibrium. The full solution:`}</Md>
        <TrussSolution model={t6} asked={['GF', 'CD', 'CF']} />
      </div>
    ),
    notes: ['All three load components are placed at the bottom-chord panel points (floor-beam level). Some teachers split the truss self-weight between top and bottom chords — the member forces here would change only slightly.'],
  },
  {
    id: '2023-24-B7a',
    paper: '2023-24',
    sec: 'B',
    no: '7(a)',
    marks: 30,
    topics: ['floor'],
    title: 'Truss ILDs for CF, GF, BC, FD + max forces',
    pages: PG.B7,
    text: `Draw influence lines for the forces in members **CF, GF, BC and FD** of the truss in Fig. 12 (4 panels @ 10 ft, height 10 ft, load on the bottom chord). Also calculate the maximum forces (tension or compression) in CF and GF for a concentrated live load of 24 k and a uniform live load of 6 k/ft.`,
    figure: () => <Figure model={t7} />,
    checks: () => {
      const cf = uniformPlusConcentrated(ild7('CF'), 6, 24)
      const gf = uniformPlusConcentrated(ild7('GF'), 6, 24)
      return [
        { key: 'cfT', label: 'Max tension in CF', value: cf.maxPos.live, unit: 'k' },
        { key: 'cfC', label: 'Max compression in CF (as a negative number)', value: cf.maxNeg.live, unit: 'k' },
        { key: 'gf', label: 'Max force in GF (compression −)', value: gf.maxNeg.live, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The load reaches the truss only at the bottom panel points A–E, so each ILD is **straight between panel points**. Unit load at a joint → solve the truss by sections. E.g. for diagonal CF (cut panel CD): vertical component of CF = shear in the panel = $R_E$ (load left of the panel) or $-R_A$ (load right).`}</Md>
        <ILDStack
          model={t7}
          path={p7}
          items={[
            { label: 'F_CF', resp: { kind: 'force', member: 'CF' } },
            { label: 'F_GF', resp: { kind: 'force', member: 'GF' } },
            { label: 'F_BC', resp: { kind: 'force', member: 'BC' } },
            { label: 'F_FD', resp: { kind: 'force', member: 'FD' } },
          ]}
        />
        <MaxEffect ild={ild7('CF')} w={6} P={24} label="Member CF (uniform 6 k/ft on the + or − part, 24 k at the peak)" />
        <MaxEffect ild={ild7('GF')} w={6} P={24} label="Member GF" />
      </div>
    ),
  },
  {
    id: '2023-24-B7b',
    paper: '2023-24',
    sec: 'B',
    no: '7(b)',
    marks: 16.67,
    topics: ['wheel'],
    title: 'Max moment at midspan / absolute max moment, 80 ft span',
    pages: PG.B7,
    text: `Calculate the absolute maximum moment at midspan of a simply supported beam of 80 ft span due to the series of wheel loads in Fig. 13: 15, 30, 30, 30 k at spacings 12, 15, 15 ft.`,
    checks: () => [
      { key: 'mid', label: 'Max moment at midspan', value: trainExtremes(ssMomentILD(80, 40), train7).max.value, unit: 'k-ft' },
      { key: 'abs', label: 'Absolute max moment (anywhere)', value: absoluteMaxMoment(80, train7).M, unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The wording mixes two classic questions, so both are shown. **(1) Max moment at midspan** — triangular ILD with peak $L/4 = 20$ at x = 40; try each wheel at the peak (criterion: the average load left of the section ≈ average on the whole span).`}</Md>
        <TrainOnILD ild={ssMomentILD(80, 40)} t={train7} span={[0, 80]} section={40} peak={{ x: 40, side: 1 }} what="moment at midspan" resUnit="k-ft" />
        <Md>{`**(2) Absolute maximum moment** — occurs under a wheel near the resultant when the midspan bisects that wheel and the resultant:`}</Md>
        <AbsMaxSolution L={80} t={train7} />
      </div>
    ),
  },
  {
    id: '2023-24-B8a',
    paper: '2023-24',
    sec: 'B',
    no: '8(a)',
    marks: 30,
    topics: ['floor'],
    title: 'Floor beam system with overhanging stringers',
    pages: PG.B8,
    text: `For the floor beam system in Fig. 14 (5 × 8 ft; floor beams at A, B, C, D; girder supported at A and D; stringers A–E (overhanging B) and E–end (overhanging C and D)), draw influence lines for (i) $FBR_A, FBR_B, FBR_C, FBR_D$, (ii) $V_{BC}, V_{CD}$, (iii) $M_B, M_E, M_C$. A uniform live load of 6 k/ft and a single concentrated live load of 25 k are placed on the floor beams; dead load 2 k/ft. Determine the maximum negative shear in panel CD and the maximum positive moment at E.`,
    figure: () => <StructureView model={fs8.model} showLoads={false} autoDimX={[0, 8, 16, 24, 32, 40]} maxHeight={200} />,
    checks: () => {
      const vcd = uniformPlusConcentrated(ild8(fs8.shear(28)), 6, 25, 2)
      const me = uniformPlusConcentrated(ild8(fs8.moment(16)), 6, 25, 2)
      return [
        { key: 'fbrc', label: '$FBR_C$ ordinate when the load is at x = 16 ft', value: ildAt(ild8(fs8.fbr(24)), 16) },
        { key: 'vcd', label: 'Max negative shear in panel CD (incl. DL)', value: vcd.maxNeg.total, unit: 'k' },
        { key: 'me', label: 'Max positive moment at E (incl. DL)', value: me.maxPos.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Each stringer is a simple beam with overhangs resting on two floor beams, so a floor-beam reaction ILD is a **straight line** over the stringer(s) it supports (value 1 at that floor beam, 0 at the other support of the same stringer, extended over the overhang). The girder sees only the floor-beam reactions, so girder ILDs = Σ(FBR ILD × girder effect of a unit load at that floor beam).`}</Md>
        <ILDStack
          model={fs8.model}
          path={fs8.path}
          items={[
            { label: 'FBR_A', resp: fs8.fbr(0) },
            { label: 'FBR_B', resp: fs8.fbr(8) },
            { label: 'FBR_C', resp: fs8.fbr(24) },
            { label: 'FBR_D', resp: fs8.fbr(32) },
            { label: 'V_BC (panel BC)', resp: fs8.shear(12) },
            { label: 'V_CD (panel CD)', resp: fs8.shear(28) },
            { label: 'M_B', resp: fs8.moment(8) },
            { label: 'M_E', resp: fs8.moment(16) },
            { label: 'M_C', resp: fs8.moment(24) },
          ]}
        />
        <MaxEffect ild={ild8(fs8.shear(28))} w={6} P={25} wd={2} label="Shear in panel CD (dead 2 k/ft on the full floor)" />
        <MaxEffect ild={ild8(fs8.moment(16))} w={6} P={25} wd={2} label="Moment at E" resUnit="k-ft" />
      </div>
    ),
    notes: ['Read from the figure: floor beams at x = 0 (A), 8 (B), 24 (C), 32 (D); stringer 1 spans 0–16 (on A, B), stringer 2 spans 16–40 (on C, D); girder supports at A and D; E at x = 16 on the girder.'],
  },
  {
    id: '2023-24-B8b',
    paper: '2023-24',
    sec: 'B',
    no: '8(b)',
    marks: 16.67,
    topics: ['ild'],
    title: 'Müller-Breslau: fixed–hinge–roller beam',
    pages: [77],
    text: `Using the Müller-Breslau principle, draw influence lines for (i) $R_A, R_C$, (ii) $V_{A^+}, V_D, V_E$, (iii) $M_A, M_D, M_E$ for the beam in Fig. 15: A fixed, D at 12 ft, internal hinge B at 24 ft, E at 39 ft, roller C at 54 ft.`,
    figure: () => <Figure model={b8} />,
    checks: () => [
      { key: 'ma', label: '$M_A$ ordinate under a unit load at B (hinge)', value: ildAt(influenceLine(b8, p8, { kind: 'reaction', node: 'A', comp: 'm' }), 24) },
      { key: 'me', label: '$M_E$ peak ordinate', value: ildExtremes(influenceLine(b8, p8, { kind: 'moment', member: 'BE', x: 15 })).max.y },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Müller-Breslau**: remove the restraint that carries the function, give the released structure a unit displacement in the positive sense — the deflected shape *is* the ILD. A–B is a cantilever (fixed at A) carrying the drop-in span B–C. So:
- $R_A$, $M_A$, $V_{A^+}$, $V_D$, $M_D$ → A–B rotates/moves as a rigid body about the fixed end, B–C follows as a straight line to 0 at C.
- $R_C$, $V_E$, $M_E$ → A–B is fixed (can't move), only B–C moves.
Sign convention: $M_A$ is reported as the support reaction moment (counter-clockwise +), so a load anywhere gives a positive ordinate (a cantilever reaction moment).`}</Md>
        <ILDStack
          model={b8}
          path={p8}
          items={[
            { label: 'R_A', resp: { kind: 'reaction', node: 'A', comp: 'y' } },
            { label: 'R_C', resp: { kind: 'reaction', node: 'C', comp: 'y' } },
            { label: 'V_A+', resp: { kind: 'shear', member: 'AD', x: 0 } },
            { label: 'V_D', resp: { kind: 'shear', member: 'DB', x: 0 } },
            { label: 'V_E', resp: { kind: 'shear', member: 'BE', x: 15 } },
            { label: 'M_A (reaction, ccw +)', resp: { kind: 'reaction', node: 'A', comp: 'm' } },
            { label: 'M_D', resp: { kind: 'moment', member: 'DB', x: 0 } },
            { label: 'M_E', resp: { kind: 'moment', member: 'BE', x: 15 } },
          ]}
        />
      </div>
    ),
  },
]

// ---------------------------------------------------------------- small custom figures
function GridPlan() {
  const X = (x: number) => 60 + x * 40
  const Y = (y: number) => 30 + y * 22
  const xs = [0, 4, 12],
    ys = [0, 6, 9]
  return (
    <svg viewBox="0 0 600 270" className="w-full max-w-xl h-auto">
      <rect x={X(2)} y={Y(3)} width={X(8) - X(2)} height={Y(7.5) - Y(3)} fill="var(--c-accent)" opacity={0.15} />
      {xs.map((x, i) => (
        <g key={'x' + i}>
          <line x1={X(x)} x2={X(x)} y1={Y(0) - 12} y2={Y(9) + 8} stroke="var(--c-faint)" strokeDasharray="5 4" />
          <text x={X(x)} y={Y(0) - 16} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-ink)">
            {i + 1}
          </text>
        </g>
      ))}
      {ys.map((y, i) => (
        <g key={'y' + i}>
          <line x1={X(0) - 12} x2={X(12) + 8} y1={Y(y)} y2={Y(y)} stroke="var(--c-faint)" strokeDasharray="5 4" />
          <text x={X(0) - 22} y={Y(y) + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-ink)">
            {'ABC'[i]}
          </text>
        </g>
      ))}
      {xs.flatMap((x) => ys.map((y) => <rect key={`${x}${y}`} x={X(x) - 6} y={Y(y) - 6} width={12} height={12} fill={x === 4 && y === 6 ? 'var(--c-load)' : 'var(--c-panel2)'} stroke="var(--c-mute)" />))}
      <text x={X(2)} y={Y(9) + 30} fontSize={11} fill="var(--c-mute)">
        4 m
      </text>
      <text x={X(8)} y={Y(9) + 30} fontSize={11} fill="var(--c-mute)">
        8 m
      </text>
      <text x={X(12) + 14} y={Y(3)} fontSize={11} fill="var(--c-mute)">
        6 m
      </text>
      <text x={X(12) + 14} y={Y(7.5)} fontSize={11} fill="var(--c-mute)">
        3 m
      </text>
      <text x={X(5)} y={Y(5.4)} fontSize={11} fill="var(--c-accent)">
        tributary area of B-2
      </text>
    </svg>
  )
}

function EscarpmentFig() {
  return (
    <svg viewBox="0 0 640 210" className="w-full max-w-2xl h-auto">
      <polyline points="10,150 300,150 420,190 630,190" fill="none" stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={100} y={60} width={150} height={90} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={175} y={108} textAnchor="middle" fontSize={12} fill="var(--c-ink)">
        5-storey, 50 ft
      </text>
      <text x={175} y={170} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        75 ft
      </text>
      <text x={275} y={170} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        x = 25 ft
      </text>
      <text x={360} y={208} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        60 ft
      </text>
      <text x={450} y={168} fontSize={11} fill="var(--c-mute)">
        H = 30 ft
      </text>
      <text x={480} y={90} fontSize={13} fill="var(--c-load)" fontWeight={700}>
        ⟵ Wind
      </text>
      <circle cx={300} cy={150} r={3} fill="var(--c-accent)" />
      <text x={300} y={140} textAnchor="middle" fontSize={10} fill="var(--c-accent)">
        crest
      </text>
    </svg>
  )
}

export function ApproxFig({ g, unit = 'k', loadLabels }: { g: GridFrame; unit?: string; loadLabels?: string[] }) {
  const base = gridModelLite(g)
  // optional custom labels per floor level (bottom first), e.g. unknown loads P1, P2
  const m = loadLabels ? { ...base, loads: base.loads.map((l, k) => ({ ...l, label: loadLabels[k] ?? (l as { label?: string }).label })) } : base
  return <StructureView model={m} forceUnit={unit === 'kN' ? ' kN' : 'k'} lenUnit={unit === 'kN' ? ' m' : '′'} autoDimX autoDimY memberLabels maxHeight={260} />
}

import { gridModel } from '../../engine/approx'
function gridModelLite(g: GridFrame) {
  return gridModel(g)
}

void ildAreas
