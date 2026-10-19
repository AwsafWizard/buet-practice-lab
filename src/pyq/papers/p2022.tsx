// 2022-23 term final (held 20 May 2024). Scan pages 58–69.
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { cantileverMethod, gridModel, portalMethod, xBraced, type GridFrame } from '../../engine/approx'
import { absoluteMaxMoment, offsets, ssShearILD, trainExtremes, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { stiffenedSuspension } from '../../engine/cable'
import { gustRigid, kzt, MS_TO_MPH, PSF_TO_KPA, storeyForces, TERRAIN, type KztInput } from '../../engine/wind'
import { sdc, siteFromN } from '../../engine/eq'
import { beamOf, H, Mo, model, P, Pm, truss, Wn } from '../../kit/builders'
import { AbsMaxSolution, ApproxSolution, Figure, FrameSolution, ILDStack, TrainOnILD, TrainTable, TrussSolution, VWSolution } from '../../kit/solutions'
import { buildingFloors, EQSolution, eqResult, GustRigidSolution, KztSolution } from '../../kit/loads'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { fmt } from '../../components/DiagramView'

const PG = { A1: [58, 59], A2: [58, 59, 60], A3: [58, 60], A4: [58, 61], B5: [62], B6: [63], B7a: [63, 64, 66, 67], B7b: [64, 67, 68], B8: [64], B8c: [64, 65, 67, 68, 69] }
const E = 29000

// ---------------------------------------------------------------- Q1(a) portal, Fig 1
const g1: GridFrame = { xs: [0, 12, 28], heights: [12, 10], loads: [-30, -20], loadSide: ['right', 'right'] }
const m1 = gridModel(g1)
// ---------------------------------------------------------------- Q1(b) absolute max moment, 90 ft
const train1: Train = { P: [12, 12, 20, 20, 10], gaps: [12, 20, 20, 20] }
// ---------------------------------------------------------------- Q2(a) cantilever, Fig 3
const g2: GridFrame = { xs: [0, 20, 36], heights: [12, 12], loads: [-40, -20], loadSide: ['left', 'left'], areas: [[100, 200, 100], [100, 200, 100]] }
const m2 = gridModel(g2)
const lab2: Record<string, string> = { AD: '(100)', BE: '(200)', CF: '(100)', DG: '(100)', EH: '(200)', FI: '(100)' }
// ---------------------------------------------------------------- Q2(b) frame, Fig 4
const f4 = model('A:0,20 B:8,20 C:24,20 D:8,0 E:34,0', 'A-B B-C D-B E-C', 'D:pin E:roller', [P('A', 16, '16k'), Pm('BC', 8, 20, '20k'), Wn('EC', 4, undefined, { label: '4 k/ft ⟂' })])
// ---------------------------------------------------------------- Q3(a) X-braced truss, Fig 5
const t5 = truss('A:0,0 B:16,0 C:32,0 D:48,0 E:0,20 F:16,20 G:32,20 H:48,20', 'A-B B-C C-D E-F F-G G-H A-E B-F C-G D-H A-F E-B B-G F-C C-H G-D', 'A:pin D:roller', [P('B', 40, '40k'), P('C', 80, '80k')])
const pairs5: [string, string][] = [
  ['AF', 'EB'],
  ['BG', 'FC'],
  ['CH', 'GD'],
]
const x5 = xBraced(t5, pairs5, 'tension')
const f5 = (id: string) => x5.forces.get(id) ?? 0
const RA5 = (40 * 32 + 80 * 16) / 48
// ---------------------------------------------------------------- Q3(b) shear at L/4, 100 ft
const train3: Train = { P: [12, 12, 20, 20, 30, 30, 30, 20], gaps: [12, 12, 15, 10, 10, 10, 12] }
const ild3 = ssShearILD(100, 25)
// ---------------------------------------------------------------- Q4(a) truss ILDs, Fig 7
const t7 = truss('A:0,0 B:16,0 C:32,0 D:48,0 E:64,0 F:16,20 G:32,20 H:48,20', 'A-F A-B B-C C-D D-E GF=G-F G-H H-E BF=B-F CF=C-F G-C C-H H-D', 'A:pin E:roller')
const p7 = { kind: 'panel' as const, nodes: ['A', 'B', 'C', 'D', 'E'] }
const ild7 = (m: string) => influenceLine(t7, p7, { kind: 'force', member: m })
// ---------------------------------------------------------------- Q4(b) frame with hinge C, Fig 8
const f8 = model('A:0,6 D:0,16 C*:16,16 E:32,16 B:32,0', 'A-D D-C C-E B-E', 'A:pin B:pin', [Pm('DC', 8, 20, '20k'), Pm('CE', 8, 20, '20k'), H('E', -25, '25k')])

// ---------------------------------------------------------------- Q5(a) VW rotation of b, Fig 9
const f9 = model('a:0,0 b:0,20 c:20,20 d:20,-10', 'a-b b-c d-c', 'a:pin d:roller', [H('b', 15, '15k'), P('c', 15, '15k'), H('c', 10, '10k')])
const EI9 = (id: string) => (E * (id === 'ab' ? 600 : 900)) / 144
const vw5 = () => virtualWork(f9, f9.loads, [Mo('b', 1)], { EI: EI9 })
// ---------------------------------------------------------------- Q5(b) suspension bridge, Fig 10
const loads5b = [
  { x: 120, P: 150 },
  { x: 240, P: 150 },
  { x: 420, P: 150 },
]
const sus = stiffenedSuspension({ L: 600, h: 40, xh: 300, loads: loads5b })
const susExt = (() => {
  let max = { x: 0, M: -Infinity },
    min = { x: 0, M: Infinity }
  for (let i = 0; i <= 6000; i++) {
    const x = i / 10
    const M = sus.M(x)
    if (M > max.M) max = { x, M }
    if (M < min.M) min = { x, M }
  }
  return { max, min }
})()
// ---------------------------------------------------------------- Q6(a) VW beam deflection, Fig 11
const b11 = beamOf('a:0:pin b:7 c:12 d:17 e:24:roller', [P('b', 5, '5k'), P('c', 10, '10k'), P('d', 5, '5k')])
const EI11 = (id: string) => (E * (id === 'ab' || id === 'de' ? 750 : 1125)) / 144
const vw6a = () => virtualWork(b11, b11.loads, [P('b', 1)], { EI: EI11 })
// ---------------------------------------------------------------- Q6(b) truss with fabrication error, Fig 12
const t12 = truss('a:0,0 b:15,0 c:30,0 d:0,15 e:15,15 f:0,30', 'a-b b-c a-d d-f d-e b-e d-b e-f e-c', 'a:pin c:roller', [H('e', -15, '15k')])
const A12: Record<string, number> = { ab: 10, bc: 10, ad: 5, df: 5, de: 10, be: 5, db: 10, ef: 10, ec: 10 }
t12.members.forEach((m) => (m.label = `(${A12[m.id]})`))
const opts12 = { EA: (id: string) => A12[id] * E, dL: { ef: 1 / 12 } }
const vw6b = () => virtualWork(t12, t12.loads, [H('f', 1)], opts12)
const vw6bPinned = () => virtualWork({ ...t12, supports: [{ node: 'a', type: 'pin' as const }, { node: 'c', type: 'pin' as const }] }, t12.loads, [H('f', 1)], opts12)
const vw6bLoadOnly = () => virtualWork(t12, t12.loads, [H('f', 1)], { EA: opts12.EA })

// ---------------------------------------------------------------- Q7(a) EQ, Dhaka 6-storey
const site7 = siteFromN(13)
const sdc7 = sdc(site7, 2, 2)
const floors7 = buildingFloors({ area: 900, DL: 10, LL: 2, roofLL: 1, storeys: 6, h: 3, base: 2, pedestal: 150 })
const eq7 = { Z: 0.2, occ: 2 as const, site: site7, system: 'SMF_rc' as const, hn: 20, eta: 1.2, floors: floors7 }
const eq7r = () => eqResult(eq7)
// ---------------------------------------------------------------- Q7(b) simplified wind on escarpment, Tangail
const kzt7In: KztInput = { hill: 'escarpment', exp: 'B', H: 10, Lh: 11, x: 3, downwind: true, z: 11 }
const kzt7 = kzt(kzt7In)
/** Table 6 of the paper (ps30, psf, load case 1), zones A B C D E F G H — only the rows bracketing θ = 11.3° */
const PS30_TBL: Record<110 | 120, Record<10 | 15, number[]>> = {
  110: { 10: [21.6, -9.0, 14.4, -5.2, -23.1, -14.1, -16.0, -10.8], 15: [24.1, -8.0, 16.0, -4.6, -23.1, -15.1, -16.0, -11.5] },
  120: { 10: [25.8, -10.7, 17.1, -6.2, -27.4, -16.8, -19.1, -12.9], 15: [28.7, -9.5, 19.1, -5.4, -27.4, -17.9, -19.1, -13.7] },
}
/** Table 5 of the paper, exposure B column (mean roof height in ft) */
const LAMBDA_B_FT: [number, number][] = [
  [15, 1.21],
  [20, 1.29],
  [25, 1.35],
  [30, 1.4],
  [35, 1.45],
  [40, 1.49],
  [45, 1.53],
  [50, 1.56],
  [55, 1.59],
  [60, 1.62],
]
const simp7 = (() => {
  const Vmph = 50.6 * MS_TO_MPH
  const theta = (Math.atan(2 / 10) * 180) / Math.PI
  const ft = (theta - 10) / 5
  const fv = (Vmph - 110) / 10
  const atV = (v: 110 | 120) => PS30_TBL[v][10].map((p, i) => p + (PS30_TBL[v][15][i] - p) * ft)
  const p110 = atV(110)
  const p120 = atV(120)
  const ps30 = p110.map((p, i) => p + (p120[i] - p) * fv)
  const h = 11
  const hft = h / 0.3048
  let lam = LAMBDA_B_FT[LAMBDA_B_FT.length - 1][1]
  for (let i = 0; i < LAMBDA_B_FT.length - 1; i++) {
    const [h0, l0] = LAMBDA_B_FT[i]
    const [h1, l1] = LAMBDA_B_FT[i + 1]
    if (hft >= h0 && hft <= h1) lam = l0 + ((l1 - l0) * (hft - h0)) / (h1 - h0)
  }
  const I = 1
  const ps = ps30.map((p) => lam * kzt7.Kzt * I * p)
  const a = Math.max(Math.min(0.1 * 20, 0.4 * h), 0.04 * 20, 0.9)
  return { Vmph, theta, ft, fv, p110, p120, ps30, h, hft, lam, I, ps, psKPa: ps.map((p) => p * PSF_TO_KPA), a }
})()
// ---------------------------------------------------------------- Q8(c) 4-storey office on a 3-D hill, Mymensingh
const kzt8In = (z: number): KztInput => ({ hill: 'hill3d', exp: 'B', H: 50, Lh: 37.5, x: 0, downwind: true, z })
const kzt8 = (z: number) => kzt(kzt8In(z)).Kzt
const n1 = 100 / (12 / 0.3048)
const gust8 = gustRigid({ h: 12, B: 15, exp: 'B' })
const wind8 = () => storeyForces({ V: 67.4, exp: 'B', I: 1, Kzt: kzt8, Kd: 0.85, G: gust8.G, B: 15, L: 15, levels: [3, 6, 9, 12], parapet: { height: 0.75, GCpnWindward: 1.5, GCpnLeeward: -1.0 } })

export const Q2022: PYQ[] = [
  {
    id: '2022-23-A1a',
    paper: '2022-23',
    sec: 'A',
    no: '1(a)',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method: 2-bay (12 ft, 16 ft), 2-storey frame',
    pages: PG.A1,
    text: `Using the **portal method**, analyse the multi-storied frame for the lateral loads shown in Fig. 1. Furthermore, draw the shear force diagram, bending moment diagram and axial force diagram for columns and beams.

Fig. 1: two bays of 12 ft and 16 ft; ground storey 12 ft, top storey 10 ft; fixed bases. Lateral loads act **to the left** at the right-hand joints: 30 k at the first floor and 20 k at the roof.`,
    figure: () => <Figure model={m1} dimY />,
    checks: () => {
      const r = portalMethod(g1)
      return [
        { key: 'v', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'mc', label: 'Interior column end moment, ground storey', value: r.columns[0][1].mTop, unit: 'k-ft' },
        { key: 'mb', label: 'First-floor beam end moment (each beam)', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'n', label: 'Axial force in left ground-storey column (T +, C −)', value: r.columns[0][0].axial, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`**Assumptions (portal method):** (1) inflection point at mid-height of every column, (2) inflection point at mid-span of every beam, (3) each interior column carries **twice** the shear of an exterior column → 2 bays = 4 shares (exterior 1/4, interior 1/2 of the storey shear).

Storey shears (loads act to the left): top storey $V = 20$ k, ground storey $V = 20 + 30 = 50$ k. Column end moment $= V_{col}\\,h/2$; beam end moments come from joint equilibrium working left → right, beam shear $= 2M/L$, and column axial forces from the beam shears. Because the loads act to the **left**, the **right** columns go into tension and the left column into compression.`}</Md>
        <ApproxSolution g={g1} method="portal" unit="k" lenUnit="ft" />
      </div>
    ),
    notes: ['Load arrows in Fig. 1 point to the left at the right-hand joints (20 k roof, 30 k first floor).', 'Node letters follow the app convention: A, B, C at the bases (left → right), D, E, F at the first floor, G, H, I at the roof.'],
  },
  {
    id: '2022-23-A1b',
    paper: '2022-23',
    sec: 'A',
    no: '1(b)',
    marks: 18.67,
    topics: ['wheel'],
    title: 'Absolute max moment, 90 ft span, 5-wheel train',
    pages: PG.A1,
    text: `Compute the **absolute maximum moment** within a simply supported beam of **90 ft** span for the series of wheel loads shown in Fig. 2: 12 k, 12 k, 20 k, 20 k, 10 k at spacings 12 ft, 20 ft, 20 ft, 20 ft.`,
    figure: () => <TrainFig t={train1} />,
    checks: () => {
      const r = absoluteMaxMoment(90, train1)
      return [
        { key: 'R', label: 'Resultant of the loads on the span', value: r.R, unit: 'k' },
        { key: 'M', label: 'Absolute maximum moment', value: r.M, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = absoluteMaxMoment(90, train1)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`The whole train (72 ft long) fits on the 90 ft span, so $R = 12+12+20+20+10 = ${fmt(r.R)}$ k. Its position from wheel 1: $\\bar x = \\dfrac{12(12) + 20(32) + 20(52) + 10(72)}{74} = ${fmt(offsets(train1).reduce((s, d, i) => s + d * train1.P[i], 0) / r.R, 3)}$ ft.

**Rule:** the absolute maximum moment occurs under a heavy wheel next to the resultant, when the beam centre line lies **midway between that wheel and R**. Try the wheels on either side of R (here the two 20 k wheels) and keep the larger moment.`}</Md>
          <AbsMaxSolution L={90} t={train1} />
          <p>
            <b>Absolute maximum moment = {fmt(r.M)} k-ft</b>, under wheel {r.k + 1} ({fmt(train1.P[r.k])} k).
          </p>
        </div>
      )
    },
  },
  {
    id: '2022-23-A2a',
    paper: '2022-23',
    sec: 'A',
    no: '2(a)',
    marks: 28,
    topics: ['lateral'],
    title: 'Cantilever method: 2-bay (20 ft, 16 ft) frame, areas 100/200/100',
    pages: PG.A2,
    text: `Using the **cantilever method**, analyse the indeterminate frame for the lateral loads shown in Fig. 3 and draw (i) axial force diagram, (ii) shear force diagram and (iii) bending moment diagram of all beams and columns. Numbers beside the columns are their cross-sectional areas (in²).

Fig. 3: bays 20 ft and 16 ft; two storeys of 12 ft; fixed bases. Loads act **to the left** at the left-hand joints: 40 k at the first floor, 20 k at the roof. Column areas (left → right): 100, 200, 100 in² in both storeys.`,
    figure: () => <Figure model={m2} dimY labels={lab2} />,
    checks: () => {
      const r = cantileverMethod(g2)
      return [
        { key: 'xbar', label: 'Centroid of column areas from the left column', value: r.overturning![0].xbar, unit: 'ft' },
        { key: 'n1', label: 'Axial force, left ground-storey column (T +, C −)', value: r.columns[0][0].axial, unit: 'k' },
        { key: 'vb', label: 'Shear in first-floor beam of the 20 ft bay', value: r.beams[0][0].shear, unit: 'k' },
        { key: 'mc', label: 'Moment at top of left ground-storey column', value: r.columns[0][0].mTop, unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = cantileverMethod(g2)
      return (
        <div className="space-y-2">
          <Md>{`**Assumptions (cantilever method):** inflection points at mid-height of columns and mid-span of beams; the axial **stress** in a column is proportional to its distance from the centroid of all column areas, so $N_i \\propto A_i d_i$.

Centroid: $\\bar x = \\dfrac{100(0) + 200(20) + 100(36)}{400} = ${fmt(r.overturning![0].xbar)}$ ft → distances $-19, +1, +17$ ft; $\\sum A d^2 = ${fmt(r.overturning![0].sumAd2)}$.

Overturning moment about the inflection plane of the top storey (6 ft below the roof): $20\\times6 = ${fmt(r.overturning![1].M)}$ k-ft; of the ground storey (6 ft above the base): $20(18) + 40(6) = ${fmt(r.overturning![0].M)}$ k-ft. $N_i = M A_i d_i/\\sum A d^2$. Loads act to the **left**, so the right side of the frame goes into tension and the left column into compression.

Beam shears follow from vertical equilibrium of the cut-off frame part at each joint (left → right), beam end moments $= V_b L/2$, column moments from joint moment equilibrium and column shears $= M/(h/2)$.`}</Md>
          <ApproxSolution g={g2} method="cantilever" unit="k" lenUnit="ft" />
          <p className="text-xs text-faint">Check: Σ column shears in each storey = storey shear (20 k top, 60 k ground).</p>
        </div>
      )
    },
    notes: ['Load arrows in Fig. 3 are drawn at the left end pointing left (20 k roof, 40 k first floor).'],
  },
  {
    id: '2022-23-A2b',
    paper: '2022-23',
    sec: 'A',
    no: '2(b)',
    marks: 18.67,
    topics: ['frames'],
    title: 'Frame with overhang and inclined leg under normal pressure',
    pages: PG.A2,
    text: `Analyse the frame shown in Fig. 4 and draw the shear force and bending moment diagrams of the frame.

Fig. 4: horizontal beam A–C at 20 ft height (A is a free overhang end, 8 ft left of the column); vertical column B–D, 20 ft, **pinned** at D; 20 k downward at 16 ft from A; 16 k downward at A; inclined member C–E from the right end of the beam down to a **roller** at E (10 ft horizontal × 20 ft vertical), carrying a uniform load of **4 k/ft normal to the member** acting toward the frame.`,
    figure: () => <Figure model={f4} dimY />,
    checks: () => {
      const r = solve(f4)
      return [
        { key: 'Dx', label: 'Horizontal reaction at pin D', value: Math.abs(r.reaction('D').rx), unit: 'k' },
        { key: 'Ey', label: 'Vertical reaction at roller E', value: r.reaction('E').ry, unit: 'k' },
        { key: 'MB', label: 'Beam moment just right of B (hogging −)', value: r.member('BC').M(0), unit: 'k-ft' },
        { key: 'MC', label: 'Moment at the knee C (magnitude)', value: Math.abs(r.member('BC').M(16)), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Determinacy:** pin (2) + roller (1) = 3 reactions, rigid frame → determinate.

**Normal load on C–E:** length $\\sqrt{10^2 + 20^2} = 22.36$ ft, resultant $4\\times22.36 = 89.44$ k at mid-length, perpendicular to the leg. Its components: horizontal $89.44\\times\\tfrac{20}{22.36} = 80$ k (←) and vertical $89.44\\times\\tfrac{10}{22.36} = 40$ k (↓). (Trick: a normal pressure on an inclined member = the same intensity on its horizontal and vertical projections.)

**Reactions:** $\\sum F_x = 0$ → $D_x = 80$ k (→). Moments about D, then $\\sum F_y = 0$ → $D_y + E_y = 16 + 20 + 40 = 76$ k. Then cut the frame member by member: overhang A–B is a cantilever (−16 × 8 = −128 k-ft at B); column moment at B = $D_x \\times 20$; joint B balances the beam.`}</Md>
        <FrameSolution model={f4} />
      </div>
    ),
    notes: ['Read from Fig. 4: free end A at x = 0, column at x = 8 ft (pinned base D), 20 k at x = 16 ft, knee C at x = 24 ft, roller E at x = 34 ft; all joints rigid.', 'The 4 k/ft load is taken per unit length of the inclined member, acting perpendicular to it toward the inside of the frame (as drawn).'],
  },
  {
    id: '2022-23-A3a',
    paper: '2022-23',
    sec: 'A',
    no: '3(a)',
    marks: 28,
    topics: ['truss'],
    title: 'Double-diagonal truss, slender (tension-only) diagonals',
    pages: PG.A3,
    text: `Determine the member forces of **AB, AF, BF, BG, FG, FC and EF** of the indeterminate truss shown in Fig. 5, using appropriate assumptions. Assume the diagonals are slender.

Fig. 5: 3 panels @ 16 ft, height 20 ft; bottom chord A–B–C–D, top chord E–F–G–H; both diagonals in every panel (AF/EB, BG/FC, CH/GD). A pinned, D on rollers; 40 k at B and 80 k at C.`,
    figure: () => <Figure model={t5} />,
    checks: () => [
      { key: 'FC', label: 'Force in FC (T +, C −)', value: f5('FC'), unit: 'k' },
      { key: 'BF', label: 'Force in BF', value: f5('BF'), unit: 'k' },
      { key: 'FG', label: 'Force in FG', value: f5('FG'), unit: 'k' },
      { key: 'EF', label: 'Force in EF', value: f5('EF'), unit: 'k' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Assumption:** slender diagonals buckle under the smallest compression, so in each panel **only the diagonal that would be in tension works**; the other is taken as zero. With one diagonal per panel the truss becomes determinate.

**Which diagonal?** Reactions: $R_A = \\dfrac{40(32) + 80(16)}{48} = ${fmt(RA5)}$ k, $R_D = ${fmt(120 - RA5)}$ k. Panel shears (left part): panel AB $= +${fmt(RA5)}$ (up), panel BC $= ${fmt(RA5)} - 40 = +${fmt(RA5 - 40)}$, panel CD $= ${fmt(RA5)} - 120 = ${fmt(RA5 - 120)}$. Positive shear must be carried downward by the diagonal on the left part → diagonals sloping **down to the right** (E–B, F–C) are in tension; negative shear in panel CD → **C–H** is in tension. So AF, BG and GD = 0.

**Forces:** diagonal: $F\\sin\\theta = V_{panel}$ with $\\sin\\theta = 20/\\sqrt{16^2+20^2} = 0.781$: $F_{FC} = ${fmt(RA5 - 40)}/0.781 = ${fmt(f5('FC'))}$ k (T). Chords by moments, e.g. $F_{FG}$: moments about C on the left part: $F_{FG}(20) = -(${fmt(RA5)}\\times32 - 40\\times16)$ → $F_{FG} = ${fmt(f5('FG'))}$ k. Verticals from joint equilibrium.`}</Md>
        <TrussSolution model={t5} asked={['AB', 'AF', 'BF', 'BG', 'FG', 'FC', 'EF']} forces={x5.forces} note={<>Diagonals assumed inactive (compression, buckled): {x5.removed.join(', ')}. Forces computed on the remaining determinate truss.</>} />
        <p>
          <b>
            AB = {fmt(f5('AB'))}, AF = {fmt(f5('AF'))}, BF = {fmt(Math.abs(f5('BF')))} k (C), BG = {fmt(f5('BG'))}, FG = {fmt(Math.abs(f5('FG')))} k (C), FC = {fmt(f5('FC'))} k (T), EF = {fmt(Math.abs(f5('EF')))} k (C).
          </b>
        </p>
      </div>
    ),
    notes: [
      'The 40 k and 80 k arrows in the scan are drawn as lines hanging below B and C with the arrowheads at the joints; they are read as downward (gravity) loads. If they were meant upward, every force reverses and the other diagonal of each panel becomes the active one.',
      'AB = 0: with no horizontal load, the pin at A gives no horizontal reaction and joint A has only AE, AB and the inactive AF.',
    ],
  },
  {
    id: '2022-23-A3b',
    paper: '2022-23',
    sec: 'A',
    no: '3(b)',
    marks: 18.67,
    topics: ['wheel'],
    title: 'Max shear at the quarter point of a 100 ft span, 8-wheel train',
    pages: PG.A3,
    text: `Calculate the **maximum shear at the one-fourth point** from the left support of a simply supported beam of **100 ft** span, due to the wheel loads shown in Fig. 6: 12, 12, 20, 20, 30, 30, 30, 20 k at spacings 12, 12, 15, 10, 10, 10, 12 ft.`,
    figure: () => <TrainFig t={train3} />,
    checks: () => {
      const e = trainExtremes(ild3, train3)
      return [
        { key: 'vmax', label: 'Maximum (positive) shear at x = 25 ft', value: e.max.value, unit: 'k' },
        { key: 'vmin', label: 'Maximum negative shear at x = 25 ft', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => {
      const e = trainExtremes(ild3, train3)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Shear ILD at 25 ft: −0.25 just left and +0.75 just right of the section, linear to 0 at both supports. For **maximum positive shear** the train should sit mostly on the long positive part with a wheel just right of the section. Bring wheels across one by one; moving the next wheel up to the section changes the shear by $\\Delta V = -P_{\\text{passing}} + \\dfrac{W\\,\\Delta x}{L}$ (W = load on the span). Keep advancing while ΔV is positive.`}</Md>
          <TrainOnILD ild={ild3} t={train3} span={[0, 100]} section={25} peak={{ x: 25, side: 1 }} what="shear at 25 ft" />
          <p>
            <b>Maximum shear at the quarter point = {fmt(e.max.value)} k</b> (the largest negative shear is only {fmt(e.min.value)} k).
          </p>
        </div>
      )
    },
    notes: ['The train may enter from either end; both directions are checked exhaustively.'],
  },
  {
    id: '2022-23-A4a',
    paper: '2022-23',
    sec: 'A',
    no: '4(a)',
    marks: 28,
    topics: ['floor'],
    title: 'Truss ILDs: AF, AB, BF, CF, GF + max compression in CF',
    pages: PG.A4,
    text: `For the truss shown in Fig. 7, draw influence lines for the axial force in members **AF, AB, BF, CF, GF**. Determine the **maximum compressive force in CF** if it is subjected to a moving concentrated load of **20 kips**.

Fig. 7: 4 panels @ 16 ft (A, B, C, D, E on the bottom chord), height 20 ft; top chord F–G–H over B, C, D; end diagonals AF and HE; verticals BF, CG, DH; diagonals FC and CH. A pinned, E on rollers.`,
    figure: () => <Figure model={t7} />,
    checks: () => {
      const cf = ildExtremes(ild7('CF'))
      return [
        { key: 'cfC', label: 'CF ordinate with the unit load at C', value: ildAt(ild7('CF'), 32) },
        { key: 'cfB', label: 'CF ordinate with the unit load at B', value: ildAt(ild7('CF'), 16) },
        { key: 'gf', label: 'GF ordinate with the unit load at C', value: ildAt(ild7('GF'), 32) },
        { key: 'cmax', label: 'Max compression in CF under 20 k (magnitude)', value: -20 * cf.min.y, unit: 'k' },
      ]
    },
    solution: () => {
      const cf = ildExtremes(ild7('CF'))
      return (
        <div className="space-y-3 text-sm">
          <Md>{`The load moves along the bottom chord and reaches the truss at panel points A–E, so every ILD is **straight between panel points**. Use a unit load and sections:
- **AF** (joint A): $F_{AF}\\sin\\theta = -R_A$ while the load is right of A → ILD = $-R_A/0.781$ (compression).
- **AB** (joint A): $F_{AB} = -F_{AF}\\cos\\theta = 0.75R_A$ → tension.
- **BF** (joint B): equals the load when it is at B (1.0), zero elsewhere.
- **CF** (section through FG, FC, BC — panel BC): vertical component of CF = panel shear; unit load left of B → $F_{CF} = -R_E/0.781$, right of C → $F_{CF} = +R_A/0.781$; straight line in between.
- **GF** (moments about C): $F_{GF} = -M_C/20$ (compression).`}</Md>
          <ILDStack
            model={t7}
            path={p7}
            items={[
              { label: 'F_AF', resp: { kind: 'force', member: 'AF' } },
              { label: 'F_AB', resp: { kind: 'force', member: 'AB' } },
              { label: 'F_BF', resp: { kind: 'force', member: 'BF' } },
              { label: 'F_CF', resp: { kind: 'force', member: 'CF' } },
              { label: 'F_GF', resp: { kind: 'force', member: 'GF' } },
            ]}
          />
          <Md>{`**Max compression in CF:** the negative part of the CF ILD peaks at B (x = 16 ft) with ordinate ${fmt(cf.min.y, 4)}. Place the 20 k load at B:
$$F_{CF,\\max(C)} = 20\\times${fmt(Math.abs(cf.min.y), 4)} = \\mathbf{${fmt(-20 * cf.min.y)}}\\text{ k (compression)}$$
(For reference, the max tension is $20\\times${fmt(cf.max.y, 4)} = ${fmt(20 * cf.max.y)}$ k with the load at C.)`}</Md>
        </div>
      )
    },
    notes: ['The moving load is taken on the bottom chord (deck at the support level), i.e. panel-point loading at A–E.'],
  },
  {
    id: '2022-23-A4b',
    paper: '2022-23',
    sec: 'A',
    no: '4(b)',
    marks: 18.67,
    topics: ['frames'],
    title: 'Three-hinged frame with unequal legs (hinge at C)',
    pages: PG.A4,
    text: `Analyse the frame shown in Fig. 8 and draw the shear force and bending moment diagrams, considering the **internal hinge at C**.

Fig. 8: beam D–E, 32 ft long (4 @ 8 ft), with the hinge C at mid-span; left leg A–D 10 ft (pinned at A), right leg B–E 16 ft (pinned at B, so A is 6 ft higher than B). Loads: 20 k downward at 8 ft and at 24 ft from D; 25 k horizontal to the left at E.`,
    figure: () => <Figure model={f8} dimY />,
    checks: () => {
      const r = solve(f8)
      return [
        { key: 'Ax', label: 'Horizontal reaction at A (→ +)', value: r.reaction('A').rx, unit: 'k' },
        { key: 'Ay', label: 'Vertical reaction at A', value: r.reaction('A').ry, unit: 'k' },
        { key: 'By', label: 'Vertical reaction at B', value: r.reaction('B').ry, unit: 'k' },
        { key: 'MD', label: 'Moment at knee D (magnitude)', value: Math.abs(r.member('DC').M(0)), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Four reaction components ($A_x, A_y, B_x, B_y$) with three equilibrium equations + one condition $M_C = 0$ → determinate (three-hinged frame).

1. $\\sum M_B = 0$ for the whole frame (A is 32 ft left and 6 ft above B).
2. $\\sum M_C = 0$ for the **left part** A–D–C: $A_y(16) - A_x(10) - 20(8) = 0$.
3. Solve 1 & 2 simultaneously for $A_x, A_y$; then $B_x = 25 - A_x$ (←/→ by sign) and $B_y = 40 - A_y$.

Then draw member by member: column moments $= A_x\\times$ height (left) and $B_x\\times$ height (right); the beam moment is zero at C.`}</Md>
        <FrameSolution model={f8} />
      </div>
    ),
    notes: ['Read from Fig. 8: A is 10 ft below the beam, B is 16 ft below it; the 25 k arrow at E points to the left.'],
  },
  {
    id: '2022-23-B5a',
    paper: '2022-23',
    sec: 'B',
    no: '5(a)',
    marks: 23.67,
    topics: ['vw'],
    title: 'Virtual work: rotation of joint b of a pin–roller frame',
    pages: PG.B5,
    text: `Using the method of virtual work, find the **rotation of joint b** of the frame shown in Fig. 9. Consider deflection caused by bending strain energy only. $E = 29000$ ksi, $I_1 = 600$ in⁴, $I_2 = 1.5I_1$; E same for all sections.

Fig. 9: column a–b, 20 ft ($I_1$), pinned at a; beam b–c, 20 ft ($I_2$); column c–d, 30 ft ($I_2$), roller at d (d is 10 ft below a). Loads: 15 k horizontal (→) at b; 15 k downward and 10 k horizontal (→) at c.`,
    figure: () => <Figure model={f9} dimY labels={{ ab: 'I₁', bc: 'I₂', dc: 'I₂' }} />,
    checks: () => {
      const v = vw5()
      return [
        { key: 'th', label: 'Rotation of joint b (magnitude)', value: Math.abs(v.total), unit: 'rad' },
        { key: 'ax', label: 'Horizontal reaction at a (magnitude)', value: Math.abs(v.real.reaction('a').rx), unit: 'k' },
      ]
    },
    solution: () => {
      const v = vw5()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Real system.** The roller at d gives only a vertical reaction, so the pin at a takes all horizontal load: $a_x = 15 + 10 = 25$ k (←). Moments about a: $d_y(20) = 15(20) + 10(20) + 15(20)$ → $d_y = 40$ k ↑, $a_y = 25$ k ↓.
Moments: column a–b: $M = 25y$ (0 → 500 k-ft at b); beam b–c: $M = 500 - 25x$ (500 → 0); column c–d: only axial force → $M = 0$.

**Virtual system.** Unit couple at b. It produces only a vertical reaction couple $\\pm 1/20$ at a and d, so $m = 0$ in both columns and $m$ in b–c goes linearly from 1 (at b) to 0 (at c).

$$\\theta_b = \\int\\frac{Mm}{EI}dx = \\frac{1}{EI_2}\\cdot\\frac{1}{3}(500)(1)(20) = \\frac{3333.3}{29000\\times900/144} = ${fmt(Math.abs(v.total), 5)}\\text{ rad}$$`}</Md>
          <VWSolution model={f9} real={f9.loads} virtual={[Mo('b', 1)]} opts={{ EI: EI9 }} what="θb" resultUnit="rad" unitNote="EI in k-ft² (E·I/144); virtual load = unit counter-clockwise couple at b, so a negative result means clockwise." />
          <p>
            <b>
              θ<sub>b</sub> = {fmt(Math.abs(v.total), 5)} rad ({fmt((Math.abs(v.total) * 180) / Math.PI, 3)}°) {v.total < 0 ? 'clockwise' : 'counter-clockwise'}
            </b>
          </p>
        </div>
      )
    },
    notes: ['Support d drawn as a roller (circle) on horizontal ground → vertical reaction only; a is a pin.'],
  },
  {
    id: '2022-23-B5b',
    paper: '2022-23',
    sec: 'B',
    no: '5(b)',
    marks: 23,
    topics: ['cable'],
    title: 'Suspension bridge girder with central hinge: BMD',
    pages: PG.B5,
    text: `A girder shown in Fig. 10 is suspended from a parabolic cable of a suspension bridge. Draw the bending moment diagram of the girder for the loading shown.

Fig. 10: span 10 @ 60 m = 600 m, cable sag 40 m, hangers at every panel point, girder simply supported at the towers with an **internal hinge at mid-span**. Loads: 150 kN at 120 m, 150 kN at 240 m and 150 kN at 420 m from the left tower.`,
    figure: () => <SuspensionFig />,
    checks: () => [
      { key: 'H', label: 'Cable horizontal tension H', value: sus.H, unit: 'kN' },
      { key: 'q', label: 'Uniform hanger load on the girder q', value: sus.q, unit: 'kN/m' },
      { key: 'Mmax', label: 'Maximum positive girder moment', value: susExt.max.M, unit: 'kN-m' },
      { key: 'Mmin', label: 'Maximum negative girder moment', value: susExt.min.M, unit: 'kN-m' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Since the cable is parabolic, the hangers pull **up** on the girder with a uniform load $q = 8Hh/L^2$. The girder therefore behaves as a simple beam carrying the 150 kN loads (moment $M_0$) plus $q$ upward (moment $-Hy$):
$$M(x) = M_0(x) - H\\,y(x),\\qquad y(x) = \\frac{4h}{L^2}x(L-x)$$
The hinge at mid-span gives $M(300) = 0$ → $H = M_0(300)/h$. Simple-beam reaction: $R_A = 150(480 + 360 + 180)/600 = 255$ kN; $M_0(300) = 255(300) - 150(180) - 150(60) = 40{,}500$ kN-m → $H = 40500/40 = ${fmt(sus.H)}$ kN.`}</Md>
        <SuspensionSolution L={600} h={40} xh={300} loads={loads5b} unit="kN" lenUnit="m" panel={60} marks={[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600]} />
        <p>
          <b>
            H = {fmt(sus.H)} kN, q = {fmt(sus.q, 3)} kN/m (each hanger {fmt(sus.q * 60)} kN). Max positive moment {fmt(susExt.max.M)} kN-m at x = {fmt(susExt.max.x)} m; max negative {fmt(susExt.min.M)} kN-m at x = {fmt(susExt.min.x)} m.
          </b>
        </p>
      </div>
    ),
    notes: ['Load positions read from the hanger count in Fig. 10: loads under hangers 2, 4 and 7 (x = 120, 240, 420 m).'],
  },
  {
    id: '2022-23-B6a',
    paper: '2022-23',
    sec: 'B',
    no: '6(a)',
    marks: 23,
    topics: ['vw'],
    title: 'Virtual work: deflection of a stepped simple beam',
    pages: PG.B6,
    text: `Using the method of virtual work, determine the **vertical deflection of point b** of the beam shown in Fig. 11 (bending strain energy only). $E = 29000$ ksi, $I_1 = 750$ in⁴, $I_2 = 1.5I_1$.

Fig. 11: simple beam a–e, 24 ft (a pin, e roller); b at 7 ft, c at 12 ft, d at 17 ft. a–b and d–e have $I_1$; b–c and c–d have $I_2$. Loads 5 k at b, 10 k at c, 5 k at d.`,
    figure: () => <Figure model={b11} labels={{ ab: 'I₁', bc: 'I₂', cd: 'I₂', de: 'I₁' }} />,
    checks: () => [{ key: 'db', label: 'Vertical deflection of b (↓ +)', value: vw6a().total * 12, unit: 'in', tol: 0.005 }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Real loads:** symmetric, $R_a = R_e = 10$ k. $M_b = 10(7) = 70$, $M_c = 10(12) - 5(5) = 95$, $M_d = 70$ k-ft (linear between loads).
**Virtual unit load at b:** $r_a = 17/24$, $r_e = 7/24$; $m_b = 7(17/24) = 4.958$, $m_c = 12(7/24) = 3.5$, $m_d = 7(7/24) = 2.042$.
Each segment has trapezoidal M and m, so use $\\int Mm\\,dx = \\tfrac{L}{6}[m_1(2M_1 + M_2) + m_2(M_1 + 2M_2)]$ and divide by the segment’s EI: $EI_1 = 29000(750)/144 = ${fmt(EI11('ab'), 1)}$, $EI_2 = ${fmt(EI11('bc'), 1)}$ k-ft².`}</Md>
        <VWSolution model={b11} real={b11.loads} virtual={[P('b', 1)]} opts={{ EI: EI11 }} scale={12} resultUnit="in" what="Δb (↓)" unitNote="Each term ∫Mm/EI is in ft; × 12 for inches." />
        <p>
          <b>Δ<sub>b</sub> = {fmt(vw6a().total * 12, 4)} in ↓</b>
        </p>
      </div>
    ),
  },
  {
    id: '2022-23-B6b',
    paper: '2022-23',
    sec: 'B',
    no: '6(b)',
    marks: 23.67,
    topics: ['vw'],
    title: 'Virtual work: truss with member ef 1 in too long',
    pages: PG.B6,
    text: `A truss member **ef** in Fig. 12 is fabricated **1.0 in longer** than specified. Using the method of virtual work, determine the **horizontal deflection of joint f** of this loaded truss. Member areas (in²) are shown in brackets; $E = 29000$ ksi.

Fig. 12: a (0, 0), b (15, 0), c (30, 0), d (0, 15), e (15, 15), f (0, 30) ft; members ab, bc, ad, df, de, be, db, ef, ec (f–e–c is one straight line). Areas: ab 10, bc 10, ad 5, df 5, de 10, be 5, ef 10, ec 10. Load: 15 k horizontal (←) at e. Supports at a and c.`,
    figure: () => <Figure model={t12} labels dimY />,
    checks: () => {
      const v = vw6b()
      return [
        { key: 'dh', label: 'Horizontal deflection of f (→ +)', value: v.total * 12, unit: 'in', tol: 0.005 },
        { key: 'load', label: 'Part due to the 15 k load only (→ +)', value: vw6bLoadOnly().total * 12, unit: 'in', tol: 0.002 },
        { key: 'nef', label: 'Virtual force n in ef', value: v.virtual.member('ef').N(1) },
      ]
    },
    solution: () => {
      const v = vw6b()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Apply a **unit horizontal load at f** (→). Then
$$\\Delta_f = \\sum \\frac{N\\,n\\,L}{AE} + \\sum n\\,\\Delta L$$
where N = real forces from the 15 k load and $\\Delta L_{ef} = +1$ in (longer). Joint f: a unit load → is balanced only by ef (compression $n_{ef} = -\\sqrt2 = ${fmt(v.virtual.member('ef').N(1), 4)}$) and df (tension 1). A member that is too long while $n$ is compressive pushes f the **opposite** way: fabrication part $= n\\,\\Delta L = -1.414$ in.`}</Md>
          <VWSolution model={t12} real={t12.loads} virtual={[H('f', 1)]} opts={opts12} scale={12} resultUnit="in" what="Δf (horizontal, → +)" unitNote="N, n in kip; L in ft; A in in²; E = 29000 ksi; ΔL(ef) = 1/12 ft; results × 12 → in." />
          <p>
            <b>
              Δ<sub>f</sub> = {fmt(Math.abs(v.total * 12), 4)} in {v.total < 0 ? '← (to the left)' : '→ (to the right)'}
            </b>{' '}
            — almost entirely from the fabrication error; the 15 k load alone gives {fmt(vw6bLoadOnly().total * 12, 4)} in.
          </p>
          <p className="text-xs text-faint">
            If both a and c are taken as pins (as literally drawn) the truss is indeterminate to one degree; the exact compatible solution then gives {fmt(vw6bPinned().total * 12, 4)} in — practically the same answer.
          </p>
        </div>
      )
    },
    notes: [
      'Both supports in Fig. 12 are drawn as pin symbols, which would make the truss (m = 9, r = 4, j = 6) indeterminate to degree 1. Treated as pin at a and roller at c (the usual exam intent for a virtual-work problem); the both-pinned exact value is shown for comparison.',
      'Only eight area labels are legible for nine members; the label between de and db is read as de = 10 in², and the diagonal db is also taken as 10 in² (db carries no virtual force, so its area does not affect the answer).',
    ],
  },
  {
    id: '2022-23-B7a',
    paper: '2022-23',
    sec: 'B',
    no: '7(a)',
    marks: 26.67,
    topics: ['eq'],
    title: 'Earthquake: 6-storey residential building at Dhaka (N̄ = 13)',
    pages: PG.B7a,
    text: `A 6-storied RC residential building is located at Dhaka. Storey height 3 m, depth of base 2 m, plan 30 m × 30 m. $Z = 0.20$, damping correction factor $\\eta = 1.2$. Dead load incl. self-weight 10 kN/m², live load 2 kN/m² (typical floors), roof live load 1 kN/m². Self-weight of all pedestals 150 kN. GF has an RC floor carrying typical floor loads. Harmonic average SPT of the top 30 m = 13. Following BNBC 2020 (Tables 1–3 given), determine the **earthquake base shear** and the **storey forces at Level 3 and Level 4**.

$C_s = S\\left(1 + \\frac{T}{T_B}(2.5\\eta - 1)\\right)$ for $0 \\le T \\le T_B$; $C_s = 2.5S\\eta$ for $T_B \\le T \\le T_C$; $C_s = 2.5S\\eta\\frac{T_C}{T}$ for $T_C \\le T \\le T_D$; $C_s = 2.5S\\eta\\frac{T_CT_D}{T^2}$ for $T_D \\le T \\le 4$ s.`,
    checks: () => {
      const r = eq7r()
      return [
        { key: 'T', label: 'Period T', value: r.T, unit: 's', tol: 0.005 },
        { key: 'V', label: 'Base shear V', value: r.V, unit: 'kN' },
        { key: 'F3', label: 'Storey force at Level 3 (8 m)', value: r.rows.find((x) => x.name === 'L3')!.F, unit: 'kN' },
        { key: 'F4', label: 'Storey force at Level 4 (11 m)', value: r.rows.find((x) => x.name === 'L4')!.F, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Site class:** $\\bar N = 13 < 15$ → **${site7}** (S = 1.35, $T_B = 0.2$, $T_C = 0.8$, $T_D = 2.0$ s).
**Occupancy:** residential → **II**, I = 1.0. Dhaka, Z = 0.20 → **Zone 2**. Table 2 (Occ. I–III, ${site7}, Zone 2) → **SDC ${sdc7}** → only special moment frames are permitted for RC → **SMRF, R = 8**.
**Height:** $h_n = 2 + 6\\times3 = 20$ m; $T = 0.0466(20)^{0.9}$.
**Seismic weight:** typical floor (GF, L2–L6) $= 900(10 + 0.25\\times2) = 9450$ kN each; roof $= 900(10 + 0.25\\times1) = 9225$ kN; pedestals 150 kN at the base (h = 0, so they add to W but get no storey force).`}</Md>
        <EQSolution {...eq7} levels={['L3', 'L4']} />
        <p>
          <b>
            V = {fmt(eq7r().V)} kN; F(Level 3) = {fmt(eq7r().rows.find((x) => x.name === 'L3')!.F)} kN; F(Level 4) = {fmt(eq7r().rows.find((x) => x.name === 'L4')!.F)} kN.
          </b>
        </p>
      </div>
    ),
    notes: [
      'Level numbering: Level 1 = GF slab (2 m above the base), Level 2 at 5 m, Level 3 at 8 m, Level 4 at 11 m, …, roof at 20 m. If your class numbers Level 1 as the first suspended floor, read the forces for 11 m and 14 m from the table instead.',
      '25 % of the live load is included in the seismic weight (LL ≤ 3 kN/m²).',
    ],
  },
  {
    id: '2022-23-B7b',
    paper: '2022-23',
    sec: 'B',
    no: '7(b)',
    marks: 20,
    topics: ['wind'],
    title: 'Simplified procedure: shed on a 2-D escarpment (Tangail)',
    pages: PG.B7b,
    text: `A single-storied shed building is located on a 2-D escarpment (Fig. 13) at Tangail. Plan 20 m × 80 m; total height 12 m with an eave height of 10 m (gable roof, 2 m rise over the 20 m width). The site meets the first two conditions of wind speed-up. Enclosed; surface roughness B upwind and downwind. Basic wind speed 50.6 m/s. Determine the **horizontal and vertical design wind pressures in the transverse direction** of the MWFRS considering the **maximum value of the topographic factor**. Follow the simplified procedure of BNBC 2020 (Tables 4–6).

Fig. 13: escarpment height 10 m over a horizontal run of 22 m; building windward face 3 m from the crest on the upper level; wind blows from the low side toward the building.`,
    figure: () => <EscarpFig />,
    checks: () => [
      { key: 'kzt', label: '$K_{zt}$ (maximum, at x = 3 m, z = h)', value: kzt7.Kzt, tol: 0.005 },
      { key: 'lam', label: 'Adjustment factor λ', value: simp7.lam, tol: 0.003 },
      { key: 'pA', label: 'Zone A horizontal pressure $p_s$', value: simp7.psKPa[0], unit: 'kN/m²', tol: 0.02 },
      { key: 'pE', label: 'Zone E vertical pressure $p_s$', value: simp7.psKPa[4], unit: 'kN/m²', tol: 0.02 },
    ],
    solution: () => {
      const s = simp7
      const k = kzt7
      const Z = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Simplified procedure:** $p_s = \\lambda K_{zt} I\\,p_{s30}$.

**Mean roof height** $h = (10 + 12)/2 = 11$ m = ${fmt(s.hft)} ft; roof angle $\\theta = \\tan^{-1}(2/10) = ${fmt(s.theta)}^\\circ$; $V = 50.6$ m/s $= ${fmt(s.Vmph)}$ mph. Occupancy II assumed → I = 1.0.

**Topographic factor.** $L_h$ = horizontal distance from the crest to where the ground is H/2 = 5 m below it → $22/2 = 11$ m; $H/L_h = 10/11 = 0.91 > 0.5$ → use $H/L_h = 0.5$ and $L_h = 2H = 20$ m. The building is **downwind** of the crest (μ = 4). $K_{zt}$ is largest at the face nearest the crest (x = 3 m); the simplified procedure evaluates it at the mean roof height z = h = 11 m:`}</Md>
          <KztSolution {...kzt7In} />
          <Md>{`**λ** (Table 5, exposure B): between 35 ft (1.45) and 40 ft (1.49) → $\\lambda = ${fmt(s.lam, 4)}$.

**$p_{s30}$** (Table 6, load case 1): interpolate between 10° and 15° (factor ${fmt(s.ft, 3)}), then between 110 and 120 mph (factor ${fmt(s.fv, 3)}). Then $p_s = ${fmt(s.lam, 4)}\\times${fmt(k.Kzt, 4)}\\times1.0\\times p_{s30}$.`}</Md>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>110 mph, 10°</th>
                  <th>110 mph, 15°</th>
                  <th>120 mph, 10°</th>
                  <th>120 mph, 15°</th>
                  <th>p_s30 (psf)</th>
                  <th>p_s (psf)</th>
                  <th>p_s (kN/m²)</th>
                </tr>
              </thead>
              <tbody>
                {Z.map((z, i) => (
                  <tr key={z} className={i === 4 ? 'hl' : ''}>
                    <td className="txt font-semibold">
                      {z} {i < 4 ? '(horizontal)' : '(vertical)'}
                    </td>
                    <td>{fmt(PS30_TBL[110][10][i], 1)}</td>
                    <td>{fmt(PS30_TBL[110][15][i], 1)}</td>
                    <td>{fmt(PS30_TBL[120][10][i], 1)}</td>
                    <td>{fmt(PS30_TBL[120][15][i], 1)}</td>
                    <td>{fmt(s.ps30[i], 3)}</td>
                    <td>{fmt(s.ps[i], 3)}</td>
                    <td className="font-bold">{fmt(s.psKPa[i], 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Md>{`Zones A, B (end zones) and C, D (interior) are the horizontal pressures on the windward + leeward wall and roof projections; E, F (end) and G, H (interior) are the vertical pressures on the windward and leeward roof surfaces (− = suction/uplift). End-zone width $2a$: $a = \\min(0.1\\times20, 0.4\\times11) = ${fmt(s.a)}$ m (≥ 0.04×20 and 0.9 m) → **2a = ${fmt(2 * s.a)} m** at each end of the 80 m long building. Minimum check: zones A + C ≥ 0.47 kN/m² (10 psf) — satisfied.`}</Md>
        </div>
      )
    },
    notes: [
      'Kzt is taken at x = 3 m (closest point to the crest → maximum K₂) and at z = mean roof height 11 m, as the simplified procedure prescribes. If "maximum Kzt" is read as z = 0 (ground level at the windward face) then K₃ = 1 and Kzt = ' + fmt(kzt({ ...kzt7In, z: 0 }).Kzt, 4) + '; all pressures scale by that ratio.',
      'ps30 is interpolated linearly in roof angle and in basic wind speed between the 110 and 120 mph rows printed in the paper (Table 6). Occupancy category is not given — category II (I = 1.0) assumed.',
    ],
  },
  {
    id: '2022-23-B8a',
    paper: '2022-23',
    sec: 'B',
    no: '8(a)',
    marks: 5,
    topics: ['wind'],
    title: 'Enclosure classification (internal pressure)',
    pages: PG.B8,
    text: `Briefly discuss the enclosure classification for determining the internal wind pressure of a building as per BNBC 2020.`,
    solution: () => (
      <Md>{`For internal pressure every building is classified as **open, partially enclosed or enclosed** (BNBC 2020 Sec 2.4.x / ASCE 7-05 6.5.9). With $A_o$ = total openings in the wall receiving positive external pressure, $A_g$ = its gross area, $A_{oi}, A_{gi}$ = openings and gross area of all the **other** surfaces (walls + roof):

- **Open building:** each wall is at least **80 % open** ($A_o \\ge 0.8A_g$ on every wall) → $GC_{pi} = 0$.
- **Partially enclosed building:** all three hold — (i) $A_o \\ge 1.10A_{oi}$ (the windward wall is much more open than the rest), (ii) $A_o > 0.37$ m² (4 ft²) or $> 0.01A_g$, whichever is smaller, and (iii) $A_{oi}/A_{gi} \\le 0.20$ (the rest of the envelope is mostly closed) → $GC_{pi} = \\pm0.55$ (wind blows in and inflates the building).
- **Enclosed building:** neither open nor partially enclosed → $GC_{pi} = \\pm0.18$.

Internal pressure $q_i(GC_{pi})$ acts on all inside surfaces at once; both signs (+ and −) must be checked and combined with external pressures for the worst case.`}</Md>
    ),
  },
  {
    id: '2022-23-B8b',
    paper: '2022-23',
    sec: 'B',
    no: '8(b)',
    marks: 5,
    topics: ['wind'],
    title: 'Conditions for the simplified procedure (MWFRS)',
    pages: PG.B8,
    text: `Write down the conditions that must be satisfied for the **simplified procedure** of wind load calculation (for MWFRS) following BNBC 2020.`,
    solution: () => (
      <Md>{`A building may use the simplified procedure for its MWFRS only if **all** of the following hold:

1. It is a **simple diaphragm building** (wind on walls and roof is transferred through floor/roof diaphragms to the vertical MWFRS).
2. It is a **low-rise building**: mean roof height $h \\le 18$ m (60 ft) and $h$ does not exceed the least horizontal dimension.
3. It is **enclosed** and conforms to the wind-borne debris provisions.
4. It is **regular-shaped** (no unusual geometric irregularity).
5. It is **not flexible** — rigid, natural frequency $n_1 \\ge 1$ Hz.
6. It has no unusual response characteristics (across-wind loading, vortex shedding, galloping or flutter) and is not sited where channelling or buffeting in the wake of upwind obstructions needs special consideration.
7. It has an approximately **symmetrical cross-section** in each direction with a **flat roof or a gable/hip roof with θ ≤ 45°**.
8. It is exempt from the torsional load cases (or the torsional case does not control the MWFRS design).

Then $p_s = \\lambda K_{zt} I p_{s30}$ (zones A–H) with λ from the height/exposure table.`}</Md>
    ),
  },
  {
    id: '2022-23-B8c',
    paper: '2022-23',
    sec: 'B',
    no: '8(c)',
    marks: 36.67,
    topics: ['wind'],
    title: 'Analytical wind: 4-storey office on a 3-D hill (Mymensingh) with parapet',
    pages: PG.B8c,
    text: `A typical 4-storied RC office building is located on top of a **3-D axisymmetric hill** at Mymensingh (Fig. 14: hill height H = 50 m, base width 150 m, building at the crest). Plan 15 m × 15 m, storey height 3 m, parapet 750 mm. Occupancy category II, exposure B, basic wind speed 67.4 m/s, enclosed. $K_z = 2.01(z/z_g)^{2/\\alpha}$ for $4.57 \\le z \\le z_g$, $K_z = 2.01(4.57/z_g)^{2/\\alpha}$ for $z < 4.57$ m. Approximate fundamental frequency $n_1 = 100/H$ (H in ft).

Determine (i) the topographic factor, (ii) the gust effect factor G, (iii) the design wind pressure, (iv) the horizontal base reaction due to the design wind pressure, (v) the design wind pressure on the windward and leeward parapet ($GC_{pn} = +1.5$ windward, $-1.0$ leeward). Use Tables 4, 7, 8 and Appendix A.`,
    figure: () => <HillFig />,
    checks: () => {
      const r = wind8()
      return [
        { key: 'kzt', label: '$K_{zt}$ at roof level (z = 12 m)', value: kzt8(12), tol: 0.005 },
        { key: 'G', label: 'Gust effect factor G', value: gust8.G, tol: 0.003 },
        { key: 'V', label: 'Horizontal base reaction (walls + parapet)', value: r.base, unit: 'kN' },
        { key: 'pp', label: 'Windward parapet pressure', value: r.parapet!.pw, unit: 'kN/m²', tol: 0.02 },
      ]
    },
    solution: () => {
      const r = wind8()
      const walls = r.rows.reduce((s, x) => s + x.F, 0)
      const k = kzt(kzt8In(12))
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**(i) Topographic factor.** Crest to foot = 150/2 = 75 m, so the ground is at H/2 at $L_h = 37.5$ m from the crest. $H/L_h = 50/37.5 = 1.33 > 0.5$ → use $H/L_h = 0.5$, $L_h = 2H = 100$ m. Building at the crest → x = 0, $K_2 = 1$. 3-D hill, exposure B: $K_1 = 1.05\\times0.5 = ${fmt(k.K1, 3)}$, γ = 4. $K_3$ (and so $K_{zt}$) decreases with height — at the roof:`}</Md>
          <KztSolution {...kzt8In(12)} />
          <Md>{`**(ii) Gust factor.** $h = 4\\times3 = 12$ m = ${fmt(12 / 0.3048)} ft → $n_1 = 100/${fmt(12 / 0.3048)} = ${fmt(n1, 3)}$ Hz ≥ 1 Hz → **rigid** building; use Eq. 6.2.6 (exposure B: c = 0.20, ℓ = 152.4 m, ε̄ = 1/5, $z_{min} = 4.57$ m):`}</Md>
          <GustRigidSolution h={12} B={15} exp="B" />
          <Md>{`**(iii)–(iv) Design pressures and base reaction.** Occupancy II → I = 1.0, $K_d = 0.85$, exposure B (α = ${TERRAIN.B.alpha}, $z_g$ = ${TERRAIN.B.zg} m). $q_z = 0.000613K_zK_{zt}K_dV^2I$ with $K_{zt}$ at each level; windward $p = q_zGC_p$ (C_p = 0.8), leeward $p = q_hGC_p$ with L/B = 1 → $C_p = -0.5$. Internal pressure (enclosed, $GC_{pi} = \\pm0.18$) cancels in the overall force.`}</Md>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>z (m)</th>
                  <th>Kz</th>
                  <th>Kzt</th>
                  <th>qz (kN/m²)</th>
                  <th>p windward</th>
                  <th>p leeward</th>
                  <th>net</th>
                  <th>trib. h (m)</th>
                  <th>Force (kN)</th>
                </tr>
              </thead>
              <tbody>
                {r.rows.map((x) => (
                  <tr key={x.level}>
                    <td>{x.level}</td>
                    <td>{fmt(x.z)}</td>
                    <td>{fmt(x.Kz, 4)}</td>
                    <td>{fmt(x.Kzt, 4)}</td>
                    <td>{fmt(x.qz, 4)}</td>
                    <td>{fmt(x.pw, 4)}</td>
                    <td>{fmt(x.pl, 4)}</td>
                    <td>{fmt(x.net, 4)}</td>
                    <td>{fmt(x.trib)}</td>
                    <td>{fmt(x.F)}</td>
                  </tr>
                ))}
                {r.parapet && (
                  <tr className="hl">
                    <td className="txt">Parapet</td>
                    <td>{fmt(r.parapet.zp)}</td>
                    <td>{fmt(r.parapet.Kz, 4)}</td>
                    <td>{fmt(kzt8(r.parapet.zp), 4)}</td>
                    <td>{fmt(r.parapet.qp, 4)}</td>
                    <td>{fmt(r.parapet.pw, 4)}</td>
                    <td>{fmt(r.parapet.pl, 4)}</td>
                    <td>{fmt(r.parapet.net, 4)}</td>
                    <td>0.75</td>
                    <td>{fmt(r.parapet.F)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Md>{`$q_h = ${fmt(r.qh, 4)}$ kN/m² (z = 12 m), leeward wall $p = ${fmt(r.qh, 4)}\\times${fmt(gust8.G, 4)}\\times(-0.5) = ${fmt(r.pl, 4)}$ kN/m². Wall forces = net pressure × tributary height × 15 m.

**Base reaction:** walls ${fmt(walls)} kN + parapet ${fmt(r.parapet!.F)} kN = **${fmt(r.base)} kN**.

**(v) Parapet:** $q_p$ at the parapet top (z = 12.75 m, $K_{zt} = ${fmt(kzt8(12.75), 4)}$) $= ${fmt(r.parapet!.qp, 4)}$ kN/m²; windward $p_p = ${fmt(r.parapet!.qp, 4)}(1.5) = \\mathbf{${fmt(r.parapet!.pw, 3)}}$ kN/m², leeward $p_p = ${fmt(r.parapet!.qp, 4)}(-1.0) = \\mathbf{${fmt(r.parapet!.pl, 3)}}$ kN/m².`}</Md>
        </div>
      )
    },
    notes: [
      'Hill base width 150 m read as the full base (crest to foot = 75 m, linear slopes) → Lh = 37.5 m; capped at H/Lh = 0.5 (Lh = 2H = 100 m).',
      'Kzt is evaluated at each floor height (z above the local ground at the crest); the leeward pressure uses qh with Kzt(12 m).',
      'n₁ uses the building height without the parapet (12 m = 39.4 ft). The base reaction includes the parapet force; without it the walls alone give the "walls" figure in the solution.',
    ],
  },
]

// ---------------------------------------------------------------- small custom figures
function TrainFig({ t }: { t: Train }) {
  const d = offsets(t)
  const Ltot = d[d.length - 1]
  const W = 640
  const pad = 40
  const X = (x: number) => pad + (x / Ltot) * (W - 2 * pad)
  return (
    <svg viewBox={`0 0 ${W} 120`} className="w-full max-w-2xl h-auto">
      <line x1={X(0)} x2={X(Ltot)} y1={70} y2={70} stroke="var(--c-mute)" strokeWidth={2} />
      {t.P.map((p, i) => (
        <g key={i}>
          <circle cx={X(d[i])} cy={60} r={9} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
          <line x1={X(d[i])} x2={X(d[i])} y1={16} y2={44} stroke="var(--c-load)" strokeWidth={2} />
          <path d={`M${X(d[i])},${50} l-4,-8 h8 z`} fill="var(--c-load)" />
          <text x={X(d[i])} y={12} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-load)">
            {fmt(p)}k
          </text>
        </g>
      ))}
      {t.gaps.map((g, i) => (
        <g key={'g' + i}>
          <line x1={X(d[i])} x2={X(d[i + 1])} y1={92} y2={92} stroke="var(--c-faint)" />
          <text x={(X(d[i]) + X(d[i + 1])) / 2} y={108} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
            {fmt(g)}′
          </text>
        </g>
      ))}
    </svg>
  )
}

function SuspensionFig() {
  const X = (x: number) => 40 + x * 0.9
  const Yc = (x: number) => 40 + (100 * 4 * x * (600 - x)) / 360000
  const pts = Array.from({ length: 61 }, (_, i) => `${X(i * 10)},${Yc(i * 10)}`).join(' ')
  return (
    <svg viewBox="0 0 620 230" className="w-full max-w-2xl h-auto">
      <polyline points={pts} fill="none" stroke="var(--c-ink)" strokeWidth={2} />
      <line x1={X(0)} x2={X(600)} y1={40} y2={40} stroke="var(--c-faint)" strokeDasharray="5 4" />
      {Array.from({ length: 9 }, (_, i) => (i + 1) * 60).map((x) => (
        <line key={x} x1={X(x)} x2={X(x)} y1={Yc(x)} y2={170} stroke="var(--c-mute)" strokeWidth={1} />
      ))}
      <line x1={X(0)} x2={X(600)} y1={170} y2={170} stroke="var(--c-member)" strokeWidth={4} />
      <line x1={X(0)} x2={X(0)} y1={30} y2={215} stroke="var(--c-ink)" strokeWidth={2.5} />
      <line x1={X(600)} x2={X(600)} y1={30} y2={215} stroke="var(--c-ink)" strokeWidth={2.5} />
      <circle cx={X(300)} cy={170} r={5} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth={1.5} />
      {loads5b.map((l) => (
        <g key={l.x}>
          <line x1={X(l.x)} x2={X(l.x)} y1={176} y2={198} stroke="var(--c-load)" strokeWidth={2} />
          <path d={`M${X(l.x)},${202} l-4,-8 h8 z`} fill="var(--c-load)" />
          <text x={X(l.x)} y={218} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--c-load)">
            150 kN
          </text>
        </g>
      ))}
      <text x={X(300)} y={34} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        sag 40 m
      </text>
      <text x={X(300) + 8} y={162} fontSize={10} fill="var(--c-mute)">
        hinge
      </text>
      <text x={X(450)} y={228} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        10 @ 60 m = 600 m
      </text>
    </svg>
  )
}

function EscarpFig() {
  return (
    <svg viewBox="0 0 640 220" className="w-full max-w-2xl h-auto">
      <polyline points="10,120 330,120 450,175 630,175" fill="none" stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={140} y={50} width={160} height={70} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      <polygon points="140,50 220,34 300,50" fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={220} y={90} textAnchor="middle" fontSize={11.5} fill="var(--c-ink)">
        shed 20 m × 80 m
      </text>
      <text x={220} y={140} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        20 m (eave 10 m, ridge 12 m)
      </text>
      <text x={315} y={112} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        3 m
      </text>
      <text x={390} y={200} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        22 m
      </text>
      <text x={470} y={150} fontSize={11} fill="var(--c-mute)">
        H = 10 m
      </text>
      <text x={500} y={70} fontSize={13} fill="var(--c-load)" fontWeight={700}>
        ⟵ Wind
      </text>
      <circle cx={330} cy={120} r={3} fill="var(--c-accent)" />
      <text x={330} y={110} textAnchor="middle" fontSize={10} fill="var(--c-accent)">
        crest
      </text>
    </svg>
  )
}

function HillFig() {
  return (
    <svg viewBox="0 0 640 220" className="w-full max-w-2xl h-auto">
      <polyline points="10,180 170,180 320,80 470,180 630,180" fill="none" stroke="var(--c-mute)" strokeWidth={2} />
      <rect x={305} y={44} width={30} height={36} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.5} />
      <text x={345} y={60} fontSize={11} fill="var(--c-ink)">
        4-storey, 15 m × 15 m, h = 12 m (+0.75 m parapet)
      </text>
      <line x1={170} x2={470} y1={200} y2={200} stroke="var(--c-faint)" />
      <text x={320} y={214} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        150 m
      </text>
      <text x={480} y={130} fontSize={11} fill="var(--c-mute)">
        H = 50 m
      </text>
      <line x1={245} x2={320} y1={130} y2={130} stroke="var(--c-accent)" strokeDasharray="4 3" />
      <text x={282} y={124} textAnchor="middle" fontSize={10} fill="var(--c-accent)">
        Lh = 37.5 m
      </text>
      <text x={40} y={90} fontSize={13} fill="var(--c-load)" fontWeight={700}>
        Wind ⟶
      </text>
    </svg>
  )
}

void TrainTable
void Tex
