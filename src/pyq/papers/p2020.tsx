// 2020-21 term final (held 24 Sep 2022) — scan pages 42–50.
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { isCW, rotK, rotPos, rotTag, rotWord } from '../../engine/sign'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { sdc } from '../../engine/eq'
import { gustFlexible, gustRigid, MS_TO_MPH, PSF_TO_KPA, storeyForces, TERRAIN } from '../../engine/wind'
import { cantileverMethod, portalMethod, xBraced, type GridFrame } from '../../engine/approx'
import { trainExtremes, ssMomentILD, ssShearILD, type Train } from '../../engine/moving'
import { hangerGirder, stiffenedSuspension, type PointLoad } from '../../engine/cable'
import { virtualWork } from '../../engine/vw'
import type { Model } from '../../engine/model'
import { beamOf, H, members, model, Mo, nodes, P, supports, truss, Wx } from '../../kit/builders'
import { ApproxSolution, Figure, FrameSolution, ILDStack, TrainOnILD, TrainTable, TrussSolution, VWSolution } from '../../kit/solutions'
import { buildingFloors, EQSolution, eqResult, GustRigidSolution, WindAnalytical } from '../../kit/loads'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'
import { gridModel } from '../../engine/approx'

const PAPER = '2020-21' as const
const E = 29000

// ---------------------------------------------------------------- Q1(a) frame rotation at a
const f1a = model('a:0,0 b:0,10 c:12,10 d:12,0', 'a-b b-c c-d', 'a:pin d:roller', [H('b', -5, '5k')])
const EI1a = (E * 6000) / 144 // k-ft²
const vw1aOpts = { EI: () => EI1a }
const vw1a = () => virtualWork(f1a, f1a.loads, [Mo('a', rotK())], vw1aOpts) // unit couple in the positive rotation sense

// ---------------------------------------------------------------- Q1(b) truss horizontal deflection of C
const t1b = truss('A:0,0 B:0,16 C:20,16 D:20,0', 'A-B B-C C-D A-D A-C', 'A:pin D:roller', [H('B', 5, '5k')])
const AREA1b: Record<string, number> = { AB: 10, BC: 8, CD: 10, AD: 8, AC: 12 }
t1b.members.forEach((m) => (m.label = `(${AREA1b[m.id]})`))
const vw1bOpts = { EA: (id: string) => AREA1b[id] * E }
const vw1b = () => virtualWork(t1b, t1b.loads, [H('C', 1)], vw1bOpts)

// ---------------------------------------------------------------- Q2(a) beam, bending + shear
const b2a = beamOf('A:0:roller D:10 B:15:pin C:21', [P('D', 5, '5k'), P('C', 5, '5k')])
b2a.members.forEach((m) => (m.label = m.id === 'BC' ? 'I₂, A₂' : 'I₁, A₁'))
const I1 = 200,
  A1 = 20
const G2a = E / (2 * 1.3)
const seg2 = (id: string) => id === 'BC'
const vw2aOpts = {
  EI: (id: string) => (E * (seg2(id) ? 1.2 * I1 : I1)) / 144,
  GA: (id: string) => G2a * (seg2(id) ? 1.2 * A1 : A1),
  K: 1.2,
  shear: true,
}
const vw2a = () => virtualWork(b2a, b2a.loads, [P('D', 1)], vw2aOpts)
const vw2aBend = () => {
  const r = vw2a()
  return { bend: r.terms.reduce((s, t) => s + t.bending, 0), shear: r.terms.reduce((s, t) => s + t.shear, 0), total: r.total }
}

// ---------------------------------------------------------------- Q2(b) stiffened suspension girder
const susp = { L: 120, h: 100, xh: 60, loads: [{ x: 36, P: 12 }, { x: 72, P: 10 }] as PointLoad[] }
const sus2b = () => stiffenedSuspension(susp)
/** class-note girder: 9 hanger pulls of q × 12 ft */
const girder2b = () => hangerGirder({ L: 120, panel: 12, q: sus2b().q, loads: susp.loads })

// ---------------------------------------------------------------- Q3(a) ILD beam with overhangs
const b3a = beamOf('A:0 B:10:pin C:15 D:30:roller E:42')
const p3a = { kind: 'members' as const, members: b3a.members.map((m) => m.id) }
const ild3 = {
  RB: () => influenceLine(b3a, p3a, { kind: 'reaction', node: 'B', comp: 'y' }),
  VD: () => influenceLine(b3a, p3a, { kind: 'shear', member: 'CD', x: 15, side: -1 }),
  MC: () => influenceLine(b3a, p3a, { kind: 'moment', member: 'CD', x: 0 }),
}

// ---------------------------------------------------------------- Q3(b) EQ, 6-storey Sylhet office
const floors3b = buildingFloors({ area: 625, DL: 8, LL: 2.4, roofLL: 2.4, storeys: 6, h: 3, base: 0, pedestal: 100 })
const eq3b = { Z: 0.36, occ: 2 as const, site: 'SC' as const, system: 'SMF_rc' as const, hn: 18, eta: 1.2, floors: floors3b }
const sdc3b = sdc('SC', 4, 2)

// ---------------------------------------------------------------- Q4(a) simplified procedure (Table 4, roof 0–5°)
const T4: Record<130 | 140, number[]> = { 130: [26.8, -13.9, 17.8, -8.2], 140: [31.1, -16.1, 20.6, -9.6] }
const w4a = (() => {
  const Vmph = 61.1 * MS_TO_MPH
  const f = (Vmph - 130) / 10
  const ps30 = T4[130].map((v, i) => v + (T4[140][i] - v) * f)
  const lam = 1.4,
    Kzt = 1,
    I = 1.15
  const ps = ps30.map((v) => lam * Kzt * I * v)
  const a = Math.max(Math.min(0.1 * 50, 0.4 * 30), 0.04 * 50, 3)
  const FA = ps[0] * 2 * a * 30
  const FC = ps[2] * (50 - 2 * a) * 30
  return { Vmph, f, ps30, lam, Kzt, I, ps, kpa: ps.map((v) => v * PSF_TO_KPA), a, FA, FC, F: (FA + FC) / 1000 }
})()

// ---------------------------------------------------------------- Q4(b) 20-storey Cox's Bazar, flexible gust
const T4b = 0.0466 * Math.pow(60, 0.9)
const n1 = 1 / T4b
const BETA = 0.02
const gust4b = () => gustFlexible({ h: 60, B: 50, L: 50, exp: 'C', V: 80, n1, beta: BETA })
const levels4b = Array.from({ length: 20 }, (_, k) => 3 * (k + 1))
const wind4b = () => storeyForces({ V: 80, exp: 'C', I: 1, Kzt: 1, Kd: 0.85, G: gust4b().Gf, B: 50, L: 50, levels: levels4b })

// ---------------------------------------------------------------- Section B wheel train (Fig. 6)
const train6: Train = { P: [20, 40, 40, 40, 40, 50, 50, 50, 50], gaps: [10, 6, 6, 6, 12, 6, 6, 6], udl: { w: 6, gap: 4 } }
const ild5 = ssShearILD(80, 20)
const ild6 = ssMomentILD(90, 30)
// Fig. 7 truss (through truss, load on the bottom chord)
const t7 = truss(
  'L0:0,0 L1:20,0 L2:40,0 L3:60,0 L4:80,0 L5:100,0 L6:120,0 L7:140,0 L8:160,0 U1:20,30 U2:40,30 U3:60,30 U4:80,35 U5:100,30 U6:120,30 U7:140,30',
  'L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L6-L7 L7-L8 U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 L0-U1 U1-L1 U1-L2 U2-L2 a=U2-L3 U3-L3 U3-L4 U4-L4 L4-U5 U5-L5 L5-U6 U6-L6 L6-U7 U7-L7 U7-L8',
  'L0:pin L8:roller',
)
t7.members.find((m) => m.id === 'a')!.label = 'a'
const p7 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'] }
const ild7 = () => influenceLine(t7, p7, { kind: 'force', member: 'a' })

// ---------------------------------------------------------------- Q8 portal, Q9 cantilever
const g8: GridFrame = { xs: [0, 15, 30], heights: [10, 10], loads: [20, 12], loadSide: ['right', 'right'] }
const g9: GridFrame = { xs: [0, 18, 36], heights: [12, 10], loads: [-30, -20], loadSide: ['left', 'left'], areas: [[1, 2, 1], [1, 2, 1]] }

// ---------------------------------------------------------------- Q10 X-braced truss
const t10 = truss(
  'A:0,0 G:16,0 B:0,12 F:16,12 C:0,24 E:16,24 D:16,36',
  'A-B B-C GF=G-F EF=F-E DE=E-D A-G B-F C-E C-D A-F B-G B-E C-F',
  'A:pin G:roller',
  [H('D', -10, '10k'), H('E', -20, '20k'), H('F', -24, '24k')],
)
const pairs10: [string, string][] = [
  ['AF', 'BG'],
  ['BE', 'CF'],
]
const asked10 = ['AB', 'BC', 'CD', 'DE', 'CE', 'BE', 'EF', 'AG']
const x10 = () => xBraced(t10, pairs10, 'both')

// ---------------------------------------------------------------- Q11 truss on two fixed columns
const Vinf11 = (5 + 10 + 2 * 9) / 2 // shear at each inflection point (6 ft above the bases)
const m11: Model = {
  nodes: nodes('A:0,0 a*:0,6 J:0,12 I:0,15 H:10,15.5 G:20,16 F:30,16.5 P:40,16 E:50,15.5 D:60,15 K:10,12 L:20,12 M:30,12 N:40,12 O:50,12 C:60,12 b:60,6'),
  members: [
    ...members('A-a a-J J-I b-C C-D'),
    ...members('I-H H-G G-F F-P P-E E-D J-K K-L L-M M-N N-O O-C J-H H-K H-L G-L G-M F-M PM=P-M P-N N-E E-O E-C', { truss: true }),
  ],
  supports: supports('A:fixed b:roller'),
  loads: [H('I', 5, '5k'), H('J', 10, '10k'), Wx('Aa', 2), Wx('aJ', 2), Wx('JI', 2, undefined, { label: '2 k/ft' }), H('b', -Vinf11, `${fmt(Vinf11)}k (assumed)`)],
}
const r11 = () => solve(m11)
const N11 = (id: string) => {
  const m = r11().member(id)
  return m.N(m.L / 2)
}

const TF = (v: number) => `${fmt(Math.abs(v))} k ${Math.abs(v) < 1e-6 ? '' : v > 0 ? '(T)' : '(C)'}`

export const Q2020: PYQ[] = [
  {
    id: '2020-21-A1a',
    paper: PAPER,
    sec: 'A',
    no: '1(a)',
    marks: 23.67,
    topics: ['vw'],
    title: 'Portal frame: rotation at the pinned support a',
    pages: [42],
    text: `Using the method of virtual work, find the **rotation of point a** of the frame in Fig. 1. Deflection of each member is primarily caused by bending strain energy. $E = 29000$ ksi, $I = 6000$ in⁴, $A = 50$ in², $\\vartheta = 0.3$, $K = 1.2$ (same for all members).

Frame: a (pin) at the bottom-left, b directly above a, c at the top-right, d (roller) below c. Height 10 ft, span 12 ft. A 5 k horizontal load acts at b towards the **left**.`,
    figure: () => <Figure model={f1a} dimY />,
    checks: () => [{ key: 'th', label: `Rotation of a (rad, ${rotTag()})`, value: vw1a().total, tol: 0.03 }],
    solution: () => {
      const r = vw1a()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Virtual system:** a unit couple at a. The frame is determinate (pin a + roller d), so $\\theta_a = \\int \\dfrac{Mm}{EI}dx$ over all members (bending only — A, ϑ, K are not needed).

**Real system:** $\\sum F_x$: $H_a = 5$ k →. $\\sum M_a = 0$: $5(10) + R_d(12) = 0 \\Rightarrow R_d = 4.17$ k ↓, $R_a = 4.17$ k ↑. Column ab: $M = 5y$ (0 → 50 k-ft); beam bc: 50 → 0; column cd: no moment (roller gives only a vertical force).

**Virtual system (1 k-ft ${isCW() ? 'clockwise' : 'counter-clockwise'} at a):** ${isCW() ? '$R_d = 1/12$ ↑, $R_a = 1/12$ ↓, $H_a = 0$ → ab: $m = -1$ (constant); bc: −1 → 0; cd: 0.' : '$R_d = 1/12$ ↓, $R_a = 1/12$ ↑, $H_a = 0$ → ab: $m = 1$ (constant); bc: 1 → 0; cd: 0.'}

Product integrals: ab — triangle × rectangle $= \\tfrac12(50)(1)(10) = 250$; bc — triangle × triangle (same side) $= \\tfrac13(50)(1)(12) = 200$. So $\\theta_a = 450/EI$ in magnitude, $EI = 29000\\times6000/144 = ${fmt(EI1a, 0)}$ k-ft².`}</Md>
          <VWSolution model={f1a} real={f1a.loads} virtual={[Mo('a', rotK())]} opts={vw1aOpts} what="θa" resultUnit="rad" unitNote={`EI in k-ft²; result in radians. Sign: + means the joint turns the same way as the unit couple (${rotPos()}).`} />
          <p className="text-base">
            θ<sub>a</sub> = <b className="num">{fmt(Math.abs(r.total) * 1e4, 3)} × 10⁻⁴ rad</b> {rotWord(r.total)} ({fmt((Math.abs(r.total) * 180) / Math.PI, 4)}°).
          </p>
        </div>
      )
    },
    notes: ['Support a read as a pin and d as a roller (vertical reaction) from the figure. The 5 k load acts to the left at b.'],
  },
  {
    id: '2020-21-A1b',
    paper: PAPER,
    sec: 'A',
    no: '1(b)',
    marks: 23,
    topics: ['vw'],
    title: 'Single-panel truss: horizontal deflection of C',
    pages: [42],
    text: `Calculate the **horizontal deflection at joint C** of the truss in Fig. 2 due to the load shown. $E = 29000$ ksi; member areas (in²) are in brackets. Use the virtual work method.

Truss: A (pin) and D (roller) 20 ft apart at the base, B above A and C above D at 16 ft. Members AB (10), BC (8), CD (10), AD (8) and diagonal AC (12). Load 5 k horizontal (→) at B.`,
    figure: () => <Figure model={t1b} labels dimY />,
    checks: () => {
      const r = vw1b()
      return [
        { key: 'NAC', label: 'Real force in AC (T +)', value: r.real.member('AC').N(1), unit: 'k' },
        { key: 'nAC', label: 'Virtual force n in AC (unit load → at C)', value: r.virtual.member('AC').N(1) },
        { key: 'dh', label: 'Horizontal deflection of C (+ = →)', value: r.total * 12, unit: 'in' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`$\\Delta_{C,h} = \\sum \\dfrac{N\\,n\\,L}{AE}$ with N from the 5 k load and n from a unit horizontal load at C.

**Real:** $\\sum M_A$: $R_D(20) = 5(16) \\Rightarrow R_D = 4$ k ↑, $R_A = 4$ k ↓, $H_A = 5$ k ←. Joint B: AB = 0, BC = 5 k (C). Joint C: $F_{AC}\\cdot\\tfrac{20}{25.61} = 5 \\Rightarrow F_{AC} = 6.40$ k (T), CD = 4 k (C). Joint D: AD = 0.

**Virtual (1 k → at C):** $R_D = 16/20 = 0.8$ ↑, BC = AB = AD = 0, $n_{AC} = 1.281$ (T), $n_{CD} = 0.8$ (C).

Only AC and CD contribute:`}</Md>
        <VWSolution model={t1b} real={t1b.loads} virtual={[H('C', 1)]} opts={vw1bOpts} scale={12} resultUnit="in" what="Δ_C (horizontal, + →)" unitNote="N, n in kip; L in ft; A in in²; E = 29000 ksi; × 12 for inches." />
        <TrussSolution model={t1b} asked={[]} note="Real member forces (for reference)." />
      </div>
    ),
  },
  {
    id: '2020-21-A2a',
    paper: PAPER,
    sec: 'A',
    no: '2(a)',
    marks: 23,
    topics: ['vw'],
    title: 'Overhanging beam: deflection of D with bending + shear energy',
    pages: [43],
    text: `Using virtual work, determine the **vertical deflection of point D** of the beam in Fig. 3, considering **bending and shear** strain energy. $E = 29000$ ksi, $I_1 = 200$ in⁴, $I_2 = 1.2I_1$, $A_1 = 20$ in², $A_2 = 1.2A_1$, $\\vartheta = 0.3$, $K = 1.2$.

Beam: roller A at x = 0, D at 10 ft (5 k ↓), pin B at 15 ft, free end C at 21 ft (5 k ↓). A–B has $I_1, A_1$; the overhang B–C has $I_2, A_2$.`,
    figure: () => <Figure model={b2a} labels />,
    checks: () => {
      const r = vw2aBend()
      return [
        { key: 'RA', label: 'Reaction at A (+ up)', value: vw2a().real.reaction('A').ry, unit: 'k' },
        { key: 'b', label: 'Bending part of Δ_D (+ down)', value: r.bend * 12, unit: 'in', tol: 0.03 },
        { key: 'd', label: 'Total vertical deflection of D (+ down)', value: r.total * 12, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = vw2aBend()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`$$\\Delta_D = \\int\\frac{Mm}{EI}dx + K\\int\\frac{Vv}{GA}dx,\\qquad G = \\frac{E}{2(1+\\vartheta)} = ${fmt(G2a, 1)}\\text{ ksi}$$
**Real:** $\\sum M_B$: $R_A(15) - 5(5) + 5(6) = 0 \\Rightarrow R_A = -0.333$ k (acts **down**), $R_B = 10.33$ k ↑. A–D: $M = -0.333x$; D–B: $-3.33 \\to -30$ k-ft; B–C: $-30 \\to 0$ (hogging everywhere — the overhang load dominates).

**Virtual (1 k ↓ at D):** $r_A = 0.333$, $m$ = triangle with peak 3.33 at D, zero on B–C; $v = +0.333$ on A–D, $-0.667$ on D–B, 0 on B–C. So the overhang B–C contributes nothing.

Bending: $\\int_{AD} = -\\tfrac13(3.33)(3.33)(10) = -37.04$, $\\int_{DB} = \\tfrac{5}{6}(3.33)[2(-3.33) - 30] = -101.85$ → $-138.9/EI_1$.
Shear: $(-0.333)(0.333)(10) + (-5.333)(-0.667)(5) = 16.67$ → $K(16.67)/GA_1$.`}</Md>
          <VWSolution model={b2a} real={b2a.loads} virtual={[P('D', 1)]} opts={vw2aOpts} scale={12} resultUnit="in" what="Δ_D (+ = down)" unitNote="EI in k-ft² (I/144), GA in kip; result in ft × 12 = in." />
          <p className="text-base">
            Bending {fmt(r.bend * 12, 4)} in + shear {fmt(r.shear * 12, 5)} in → <b className="num">Δ_D = {fmt(Math.abs(r.total) * 12, 4)} in {r.total > 0 ? '↓' : '↑ (upward)'}</b>. D rises because the overhang load lifts span A–B.
          </p>
        </div>
      )
    },
    notes: ['Fig. 3: A drawn as a roller and B as a pin; D is 10 ft from A, B 5 ft further, C 6 ft beyond B. I₁, A₁ apply to A–B and I₂, A₂ to the overhang B–C.'],
  },
  {
    id: '2020-21-A2b',
    paper: PAPER,
    sec: 'A',
    no: '2(b)',
    marks: 23.67,
    topics: ['cable'],
    title: 'Girder hung from a parabolic cable (hinge at midspan): SFD & BMD',
    pages: [43],
    text: `The girder in Fig. 4 is suspended from a parabolic cable. Draw the shear force and bending moment diagrams of the girder for the loading shown.

Span between towers 10 @ 12 ft = 120 ft, cable sag 100 ft, internal hinge in the girder at midspan (60 ft). Loads: **12 T** at 36 ft and **10 T** at 72 ft from the left tower.`,
    figure: () => <SuspFig />,
    checks: () => {
      const s = sus2b()
      const g = girder2b()
      return [
        { key: 'H', label: 'Cable horizontal tension H', value: s.H, unit: 'T' },
        { key: 'q', label: 'Uniform hanger load on girder q', value: s.q, unit: 'T/ft', tol: 0.03 },
        { key: 'M36', label: 'Girder moment under the 12 T load', value: s.M(36), unit: 'T-ft' },
        { key: 'Mmin', label: 'Largest negative girder moment', value: g.min.M, unit: 'T-ft' },
      ]
    },
    solution: () => {
      const g = girder2b()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Idea.** A parabolic cable exerts a **uniform** upward load $q$ on the girder through the closely spaced hangers. The girder (simply supported on the towers) then feels the wheel loads down and $q$ up. Since $q = 8Hh/L^2$, the girder moment is $M(x) = M_0(x) - H\\,y(x)$ (simple-beam moment minus H × cable sag). The **internal hinge** gives the extra equation $M = 0$ at 60 ft, which fixes H.

$M_0(60)$: $R_0 = 12(84)/120 + 10(48)/120 = 12.4$ T, $M_0(60) = 12.4(60) - 12(24) = 456$ T-ft; $y(60) = 100$ ft.`}</Md>
          <SuspensionSolution L={120} h={100} xh={60} loads={susp.loads} unit="T" lenUnit="ft" panel={12} marks={[0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]} />
          <Md>{`The 9 hangers lift $9 \\times ${fmt(g.F, 2)} = ${fmt(9 * g.F, 2)}$ T against the 22 T applied, so both girder end reactions are **downward**: $R_{left} = ${fmt(g.RA, 2)}$ T, $R_{right} = ${fmt(g.RB, 2)}$ T. Moment under the loads: $M(36) = ${fmt(g.M(36), 2)}$, $M(72) = ${fmt(g.M(72), 2)}$ T-ft; extreme moments $+${fmt(g.max.M, 2)}$ T-ft at ${fmt(g.max.x)} ft and $${fmt(g.min.M, 2)}$ T-ft at ${fmt(g.min.x)} ft.`}</Md>
        </div>
      )
    },
    notes: [
      'Load positions read from the sketch: the 12 T load sits at the 3rd hanger (36 ft) and the 10 T load at the 6th hanger (72 ft); the hinge is at the 5th hanger (60 ft). "T" = tons.',
      'Classical stiffening-girder theory: girder pinned at both towers, hangers inextensible, cable parabolic → equal hanger forces q × 12 ft; SFD/BMD drawn hanger by hanger as in the class notes.',
    ],
  },
  {
    id: '2020-21-A3a',
    paper: PAPER,
    sec: 'A',
    no: '3(a)',
    marks: 12.67,
    topics: ['ild'],
    title: 'ILDs for a double-overhang beam: R_B, V_D−, M_C',
    pages: [43],
    text: `For the beam in Fig. 5, draw influence lines for (i) reaction at **B**, (ii) shear **just left of D**, (iii) moment at **C**.

A (free end) at 0, B (pin) at 10 ft, C at 15 ft, D (roller) at 30 ft, E (free end) at 42 ft.`,
    figure: () => <Figure model={b3a} />,
    checks: () => [
      { key: 'rbA', label: '$R_B$ ordinate with the unit load at A', value: ildAt(ild3.RB(), 0) },
      { key: 'vdE', label: '$V_{D^-}$ ordinate with the load at E', value: ildAt(ild3.VD(), 42) },
      { key: 'mc', label: '$M_C$ peak ordinate (at C)', value: ildExtremes(ild3.MC()).max.y },
      { key: 'mcA', label: '$M_C$ ordinate with the load at A', value: ildAt(ild3.MC(), 0) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Statics with a unit load at distance x from A (span B–D = 20 ft):
- $R_B = (30 - x)/20$: 1 at B, 0 at D, **1.5** at A, **−0.6** at E (straight line over the whole beam).
- $V_{D^-}$: load left of D → $V = R_B - 1 = -R_D$ ⇒ $-(x-10)/20$ (0 at B, −1 just left of D, +0.5 at A). Load right of D → $V = R_B = (30-x)/20$ (0 at D, −0.6 at E). The jump of +1 is **right** of D, so just left of D the ordinate is −1.
- $M_C$ (5 ft right of B): Müller-Breslau — a hinge at C, unit relative rotation: peak $\\dfrac{5\\times15}{20} = 3.75$ at C, zero at B and D. Extending the line C→B past B to A: $-3.75\\times10/5 = -7.5$; extending C→D past D to E: $-3.75\\times12/15 = -3.0$.`}</Md>
        <ILDStack
          model={b3a}
          path={p3a}
          items={[
            { label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } },
            { label: 'V just left of D', resp: { kind: 'shear', member: 'CD', x: 15, side: -1 } },
            { label: 'M_C', resp: { kind: 'moment', member: 'CD', x: 0 } },
          ]}
        />
      </div>
    ),
  },
  {
    id: '2020-21-A3b',
    paper: PAPER,
    sec: 'A',
    no: '3(b)',
    marks: 34,
    topics: ['eq'],
    title: 'Earthquake: storey force at level 4, 6-storey office at Sylhet',
    pages: [43, 44, 46],
    text: `Calculate the earthquake **storey force at level 4** of a 6-storied RC office building at Sylhet. Occupancy category II, site class SC, seismic zone 4, storey height 3 m, concrete moment-resisting frame, plan 25 m × 25 m. $Z = 0.36$, damping correction factor $\\eta = 1.2$. Dead load (incl. self-weight) 8 kN/m², live load 2.4 kN/m² for all floors; self-weight of all pedestals 100 kN. Follow BNBC 2020; use Tables 1–2 for the seismic design category and R, Table 3 and the normalized response spectrum
$C_s = S(1 + \\tfrac{T}{T_B}(2.5\\eta - 1))$ for $0 \\le T \\le T_B$; $2.5S\\eta$ for $T_B \\le T \\le T_C$; $2.5S\\eta\\,T_C/T$ for $T_C \\le T \\le T_D$; $2.5S\\eta\\,T_CT_D/T^2$ for $T_D \\le T \\le 4$ s.`,
    checks: () => {
      const r = eqResult(eq3b)
      return [
        { key: 'T', label: 'Period T', value: r.T, unit: 's' },
        { key: 'V', label: 'Base shear V', value: r.V, unit: 'kN' },
        { key: 'F4', label: 'Storey force at level 4 (12 m)', value: r.rows.find((x) => x.name === 'L4')!.F, unit: 'kN' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Category & system.** Table 2: site SC, zone 4, occupancy II → **SDC ${sdc3b}**. Table 1: in SDC D an ordinary RC moment frame is NP and an intermediate one is NP → must be a **special RC moment frame, R = 8**. Occupancy II → I = 1.0.

**Period.** $h_n = 6\\times3 = 18$ m, $T = 0.0466(18)^{0.9}$. Since $T_C = 0.6 \\lt T \\lt T_D = 2.0$ s the third branch of the spectrum applies.

**Weights.** LL = 2.4 kN/m² ≤ 3 → 25 % of LL is included: each floor (roof too, same loads) $= 625(8 + 0.25\\times2.4) = 5375$ kN; pedestals 100 kN at the base (h = 0, they take no storey force).`}</Md>
        <EQSolution {...eq3b} levels={['L4']} />
        <p className="text-base">
          Storey force at level 4 (h = 12 m): <b className="num">{fmt(eqResult(eq3b).rows.find((x) => x.name === 'L4')!.F)} kN</b>
        </p>
      </div>
    ),
    notes: ['Level 4 taken as the 4th floor slab above the base, h = 12 m (base = ground, no basement/GF offset given).', 'The roof is taken with the same 8 + 2.4 kN/m² loads ("for all floors").', 'η = 1.2 used as given.'],
  },
  {
    id: '2020-21-A4a',
    paper: PAPER,
    sec: 'A',
    no: '4(a)',
    marks: 12.67,
    topics: ['wind'],
    title: 'Simplified procedure: MWFRS horizontal pressures (Narayanganj)',
    pages: [44, 47],
    text: `An RC office building in flat open country at Narayanganj: plan 50 ft × 50 ft, overall height 30 ft, flat roof, enclosed, $I = 1.15$, adjustment factor $\\lambda = 1.4$, 3-s gust speed 61.1 m/s. Determine the **horizontal design wind pressure of the MWFRS** by the simplified procedure of BNBC 2020 using Table 4 ($p_{s30}$ in psf; roof 0–5°: 130 mph → A 26.8, B −13.9, C 17.8, D −8.2; 140 mph → A 31.1, B −16.1, C 20.6, D −9.6).`,
    checks: () => [
      { key: 'V', label: 'Basic wind speed', value: w4a.Vmph, unit: 'mph' },
      { key: 'psA', label: '$p_s$ zone A (end zone of walls)', value: w4a.ps[0], unit: 'psf' },
      { key: 'psC', label: '$p_s$ zone C (interior zone of walls)', value: w4a.ps[2], unit: 'psf' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`**Simplified procedure** (low-rise, h = 30 ft ≤ 60 ft and ≤ least width, flat roof, enclosed, regular): $p_s = \\lambda K_{zt} I\\, p_{s30}$.

$V = 61.1\\times2.237 = ${fmt(w4a.Vmph, 2)}$ mph → between the 130 and 140 mph rows; linear interpolation factor $(${fmt(w4a.Vmph, 2)} - 130)/10 = ${fmt(w4a.f, 4)}$. Flat roof → use the "0 to 5°" rows. Flat open terrain → $K_{zt} = 1$.`}</Md>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Zone</th>
              <th>ps30 @130</th>
              <th>ps30 @140</th>
              <th>ps30 @ {fmt(w4a.Vmph, 1)} mph</th>
              <th>ps = λKztI·ps30 (psf)</th>
              <th>kN/m²</th>
            </tr>
          </thead>
          <tbody>
            {['A', 'B', 'C', 'D'].map((z, i) => (
              <tr key={z} className={i % 2 === 0 ? 'hl' : ''}>
                <td className="txt font-semibold">{z}</td>
                <td>{T4[130][i]}</td>
                <td>{T4[140][i]}</td>
                <td>{fmt(w4a.ps30[i], 3)}</td>
                <td className="font-bold">{fmt(w4a.ps[i], 2)}</td>
                <td>{fmt(w4a.kpa[i], 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Md>{`$\\lambda K_{zt} I = 1.4\\times1\\times1.15 = ${fmt(w4a.lam * w4a.I, 3)}$.
- **Zone A** (wall end zone, width $2a$) and **zone C** (wall interior) are the horizontal pressures on the vertical projection of the walls (windward + leeward combined). Zones B and D act on the vertical projection of the roof — zero for a flat roof, listed for completeness.
- End-zone dimension $a = \\min(0.1\\times50,\\ 0.4\\times30) = 5$ ft (≥ 0.04 × 50 = 2 ft and ≥ 3 ft) → zone A is $2a = ${fmt(2 * w4a.a)}$ ft wide at each corner of the wall.
- Minimum load check: A and C ≥ 16 psf (0.77 kN/m²) ✓.

Resulting horizontal MWFRS force (one direction): $${fmt(w4a.ps[0], 2)}(10\\times30) + ${fmt(w4a.ps[2], 2)}(40\\times30) = ${fmt(w4a.F, 1)}$ kips.`}</Md>
      </div>
    ),
    notes: ['Table 4 values for 130 and 140 mph (roof 0–5°) encoded exactly as printed and linearly interpolated at 136.7 mph.', 'The total horizontal force line is an extra (not asked) assuming zone A spans 2a = 10 ft and zone C the remaining 40 ft of the 50 ft wall.'],
  },
  {
    id: '2020-21-A4b',
    paper: PAPER,
    sec: 'A',
    no: '4(b)',
    marks: 34,
    topics: ['wind'],
    title: "Wind: 20-storey open RC building at Cox's Bazar — Gf and wall pressures",
    pages: [44, 47, 48],
    text: `A typical 20-storied RC residential building in flat terrain at Cox's Bazar: plan 50 m × 50 m, storey height 3 m, overall height 60 m, occupancy II, exposure C, basic wind speed 80 m/s, building classified as **OPEN**. Use $K_z = 2.01(z/z_g)^{2/\\alpha}$ for $4.57 \\le z \\le z_g$ and $K_z = 2.01(4.57/z_g)^{2/\\alpha}$ for $z \\lt 4.57$ m.

Determine (i) the gust effect factor G, and (ii) the design wind pressure for wind in the X direction (windward and leeward). Use Tables 5–6 and Appendix A.`,
    checks: () => {
      const g = gust4b()
      const w = wind4b()
      return [
        { key: 'n1', label: 'Natural frequency used, n₁ = 1/T', value: n1, unit: 'Hz' },
        { key: 'G', label: 'Gust effect factor $G_f$ (flexible)', value: g.Gf, tol: 0.03 },
        { key: 'pw', label: 'Windward pressure at roof (z = 60 m)', value: w.rows[w.rows.length - 1].pw, unit: 'kN/m²', tol: 0.03 },
        { key: 'pl', label: 'Leeward pressure (uniform)', value: w.pl, unit: 'kN/m²', tol: 0.03 },
      ]
    },
    solution: () => {
      const g = gust4b()
      const t = TERRAIN.C
      const gr = gustRigid({ h: 60, B: 50, exp: 'C' })
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**(i) Rigid or flexible?** Approximate period (BNBC Eq. 6.2.34, RC moment frame): $T = 0.0466(60)^{0.9} = ${fmt(T4b, 3)}$ s **> 1 s** → the building is **flexible** (dynamically sensitive), so $G_f$ (Eq. 6.2.10) is required with $n_1 = 1/T = ${fmt(n1, 4)}$ Hz. Damping ratio $\\beta = ${BETA}$ (RC building).

Background part (same as for a rigid building), exposure C: $c = ${t.c}$, $l = ${t.l}$ m, $\\bar\\epsilon = 1/8$, $z_{min} = ${t.zmin}$ m, $\\bar b = ${t.bbar}$, $\\bar\\alpha = 1/9$:`}</Md>
          <GustRigidSolution h={60} B={50} exp="C" />
          <p className="text-xs text-faint">(The last line is the rigid G = {fmt(gr.G, 4)} — not used here because the building is flexible.)</p>
          <Tex block>{`\\bar V_{\\bar z} = \\bar b\\left(\\tfrac{\\bar z}{10}\\right)^{\\bar\\alpha}V = 0.8\\left(\\tfrac{${fmt(g.zbar)}}{10}\\right)^{1/9}(80) = ${fmt(g.Vz, 3)}\\text{ m/s},\\qquad N_1 = \\frac{n_1L_{\\bar z}}{\\bar V_{\\bar z}} = ${fmt(g.N1, 4)}`}</Tex>
          <Tex block>{`R_n = \\frac{7.47N_1}{(1+10.3N_1)^{5/3}} = ${fmt(g.Rn, 4)}`}</Tex>
          <Tex block>{`\\eta_h = \\frac{4.6n_1h}{\\bar V} = ${fmt(g.etaH, 3)},\\ R_h = ${fmt(g.Rh, 4)};\\quad \\eta_B = ${fmt(g.etaB, 3)},\\ R_B = ${fmt(g.RB, 4)};\\quad \\eta_L = \\frac{15.4n_1L}{\\bar V} = ${fmt(g.etaL, 3)},\\ R_L = ${fmt(g.RL, 4)}`}</Tex>
          <Tex block>{`R = \\sqrt{\\tfrac{1}{\\beta}R_nR_hR_B(0.53+0.47R_L)} = ${fmt(g.R, 4)},\\qquad g_R = \\sqrt{2\\ln(3600n_1)} + \\frac{0.577}{\\sqrt{2\\ln(3600n_1)}} = ${fmt(g.gR, 4)}`}</Tex>
          <Tex block>{`G_f = 0.925\\left(\\frac{1+1.7I_{\\bar z}\\sqrt{g_Q^2Q^2+g_R^2R^2}}{1+1.7g_vI_{\\bar z}}\\right) = \\mathbf{${fmt(g.Gf, 4)}}`}</Tex>
          <Md>{`**(ii) Design pressures.** $q_z = 0.000613K_zK_{zt}K_dV^2I$ with $K_{zt} = 1$, $K_d = 0.85$, $I = 1.0$ (occupancy II). Open building → $GC_{pi} = 0$, so $p = q\\,G_f\\,C_p$. Table 5: windward $C_p = 0.8$ (with $q_z$), leeward $C_p = -0.5$ (L/B = 1, with $q_h$).`}</Md>
          <WindAnalytical V={80} exp="C" occ={2} G={g.Gf} B={50} L={50} levels={levels4b} enclosure="open" forces={false} />
          <p className="text-base">
            Windward pressure grows from <b className="num">{fmt(wind4b().rows[0].pw, 3)}</b> kN/m² (z ≤ 4.57 m) to <b className="num">{fmt(wind4b().rows[19].pw, 3)}</b> kN/m² at the roof; leeward suction <b className="num">{fmt(wind4b().pl, 3)}</b> kN/m² (uniform over the height).
          </p>
        </div>
      )
    },
    notes: [
      `n₁ taken as 1/T with T = Ct·hⁿ = 0.0466(60)^0.9 = ${fmt(T4b, 3)} s (the BNBC approximate period). β = 0.02 assumed for an RC building; with β = 0.05 Gf would be ${fmt(gustFlexible({ h: 60, B: 50, L: 50, exp: 'C', V: 80, n1, beta: 0.05 }).Gf, 3)}.`,
      'An open building has GCpi = 0; the wall Cp of Table 5 is used as the question instructs.',
    ],
  },
  {
    id: '2020-21-B5',
    paper: PAPER,
    sec: 'B',
    no: '5',
    marks: 28,
    topics: ['wheel'],
    title: 'Max shear at the quarter point of an 80 ft span (9 wheels + 6 k/ft)',
    pages: [45, 49],
    text: `Compute the **maximum shear at the quarter point** of a simply supported beam of 80 ft span due to the wheel loads in Fig. 6: 20, 40, 40, 40, 40, 50, 50, 50, 50 k at spacings 10, 6, 6, 6, 12, 6, 6, 6 ft, followed 4 ft behind wheel 9 by a uniform load of 6 k/ft.`,
    figure: () => <TrainTable t={train6} />,
    checks: () => {
      const e = trainExtremes(ild5, train6)
      return [
        { key: 'vmax', label: 'Maximum positive shear at x = 20 ft', value: e.max.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at the quarter point (x = 20 ft): $-0.25$ just left, $+0.75$ just right, zero at the supports. For the maximum (positive) shear the train enters from the right (travelling right → left, wheel 1 leads) with a wheel **just right** of the section and its tail (heavy wheels and the 6 k/ft) over the long positive part. Moving the train one wheel forward changes the shear by $\\Delta V = -P_{passing} + W\\Delta x/L$ — keep advancing while ΔV > 0. The uniform load is included in every trial (it adds $w\\times$ area under the ILD it covers). Wheel 2 at the section is a local peak, but the 12 ft gap in front of **wheel 6 (the first 50 k)** brings much more load on, and that position governs.`}</Md>
        <TrainOnILD ild={ild5} t={train6} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="shear at quarter point" />
      </div>
    ),
    notes: ['The 6 k/ft uniform load is taken to follow wheel 9 (4 ft behind) for an unlimited length.'],
  },
  {
    id: '2020-21-B6',
    paper: PAPER,
    sec: 'B',
    no: '6',
    marks: 28,
    topics: ['wheel'],
    title: 'Max moment at the one-third point of a 90 ft span',
    pages: [45, 49],
    text: `Find the **maximum moment at the one-third point** of a simply supported beam of 90 ft span for the loads in Fig. 6 (20, 40, 40, 40, 40, 50, 50, 50, 50 k at 10, 6, 6, 6, 12, 6, 6, 6 ft; 6 k/ft uniform load starting 4 ft behind the last wheel).`,
    figure: () => <TrainTable t={train6} />,
    checks: () => [{ key: 'm', label: 'Maximum moment at x = 30 ft', value: trainExtremes(ild6, train6).max.value, unit: 'k-ft' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Moment ILD at x = 30 ft: triangle with peak $\\dfrac{30\\times60}{90} = 20$ ft. Criterion for the critical wheel: when a wheel is at the section, the average load per foot on the left part ($W_L/30$) should change from less to more than the average on the whole span ($W/90$) as that wheel crosses — i.e. $W_L \\approx W/3$. With the train travelling right → left (wheel 1 leads), **wheel 8** at the section governs. Each trial below includes the uniform load lying on the span.`}</Md>
        <TrainOnILD ild={ild6} t={train6} span={[0, 90]} section={30} peak={{ x: 30, side: 1 }} what="moment at L/3" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2020-21-B7',
    paper: PAPER,
    sec: 'B',
    no: '7',
    marks: 28,
    topics: ['wheel'],
    title: 'Max force in diagonal "a" of a 160 ft through truss',
    pages: [45, 49],
    text: `Determine the **maximum force in member "a"** of the truss in Fig. 7 for the loads of Fig. 6. Truss: 8 panels @ 20 ft = 160 ft, height 30 ft (centre vertical 35 ft), loads on the bottom chord. Member "a" is the diagonal of the third panel (from the top of the 40 ft vertical down to the bottom chord at 60 ft).`,
    figure: () => <Figure model={t7} labels={{ a: 'a' }} dimY />,
    checks: () => {
      const e = trainExtremes(ild7(), train6)
      return [
        { key: 'y3', label: 'ILD ordinate of "a" with the unit load at L3 (60 ft)', value: ildAt(ild7(), 60) },
        { key: 'T', label: 'Maximum tension in "a"', value: e.max.value, unit: 'k' },
      ]
    },
    solution: () => {
      const L = Math.hypot(20, 30)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**ILD of "a".** Cut panel L2–L3 (chords horizontal there). The vertical component of "a" carries the panel shear: $F_a\\,\\tfrac{30}{${fmt(L, 2)}} = V_{panel}$, so $F_a = ${fmt(L / 30, 4)}V$. Unit load right of L3 → $V = R_{L0}$ (tension); left of L2 → $V = -R_{L8}$ (compression); straight line between L2 and L3 (load reaches the truss only at panel points). Peaks: at L3 $${fmt(L / 30, 4)}\\times\\tfrac{100}{160}$, at L2 $-${fmt(L / 30, 4)}\\times\\tfrac{40}{160}$.`}</Md>
          <ILDStack model={t7} path={p7} items={[{ label: 'F_a (T +)', resp: { kind: 'force', member: 'a' } }]} />
          <TrainOnILD ild={ild7()} t={train6} span={[0, 160]} peak={{ x: 60, side: 1 }} what={'force in "a"'} />
          <p className="text-base">
            Maximum force in "a" = <b className="num">{fmt(trainExtremes(ild7(), train6).max.value)} k (tension)</b>. With the train travelling right → left, "a" never goes into compression: by the time wheels reach the compression part (left of L3), the rest of the train and the unending 6 k/ft tail are on the larger tension part.
          </p>
        </div>
      )
    },
    notes: ['Through truss: the deck (and the wheel loads) is on the bottom chord. The 6 k/ft trailing load is unlimited in length.', 'Train taken as travelling right to left (wheel 1 leads).'],
  },
  {
    id: '2020-21-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method: 2-bay, 2-storey frame (20 k, 12 k)',
    pages: [45, 49],
    text: `Using the portal method, analyse the frame in Fig. 8 and draw (a) axial force, (b) shear force and (c) bending moment diagrams of all columns and beams. Two bays of 15 ft, two storeys of 10 ft, fixed bases; lateral loads 20 k at the first floor and 12 k at the roof (→).`,
    figure: () => <StructureView model={gridModel(g8)} autoDimX autoDimY maxHeight={260} />,
    checks: () => {
      const r = portalMethod(g8)
      return [
        { key: 'v1i', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'm1e', label: 'Exterior column end moment, ground storey', value: r.columns[0][0].mTop, unit: 'k-ft' },
        { key: 'mb1', label: 'First-floor beam end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'n1', label: 'Axial force in left ground column (T +)', value: r.columns[0][0].axial, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Assumptions: inflection points at mid-height of every column and mid-span of every beam; interior column shear = 2 × exterior (2 bays → 4 shares). Storey shears: top 12 k (exterior 3, interior 6), ground 32 k (exterior 8, interior 16). Column end moments = shear × 5 ft; beam end moments from joint equilibrium (left to right); beam shear = 2M/L; column axial forces from beam shears.`}</Md>
        <ApproxSolution g={g8} method="portal" unit="k" lenUnit="ft" />
      </div>
    ),
    notes: ['Bases read as fixed; both loads applied at the right-hand joints (arrows drawn to the right of the frame) — this only changes beam axial forces.'],
  },
  {
    id: '2020-21-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: 28,
    topics: ['lateral'],
    title: 'Cantilever method: 2-bay frame, column areas 100–200–100 in²',
    pages: [45, 49],
    text: `Using the cantilever method, analyse the frame in Fig. 9 and draw (a) AFD of columns, (b) BMD of columns, (c) BMD of beams, (d) SFD of beams. Two bays of 18 ft; ground storey 12 ft, top storey 10 ft; fixed bases. Loads 30 k (first floor) and 20 k (roof) acting to the **left** at the left end. Column areas: 100, 200, 100 in² in both storeys.`,
    figure: () => <StructureView model={gridModel(g9)} autoDimX autoDimY memberLabels maxHeight={260} />,
    checks: () => {
      const r = cantileverMethod(g9)
      return [
        { key: 'n1', label: 'Axial force, right ground column (T +)', value: r.columns[0][2].axial, unit: 'k' },
        { key: 'vb1', label: 'Shear in first-floor beams', value: r.beams[0][0].shear, unit: 'k' },
        { key: 'mb1', label: 'First-floor beam end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'mc', label: 'Interior ground column end moment', value: r.columns[0][1].mTop, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Assumptions: inflection points at mid-height of columns and mid-span of beams; column axial stress ∝ distance from the centroid of column areas. Centroid at the middle column (symmetric areas), so the middle column carries **no** axial force; exterior columns carry $\\pm M/(2\\times18)$ where M is the overturning moment about the inflection plane. Loads act to the left → the **right** column is in tension. Areas are used in the ratio 1 : 2 : 1 (only ratios matter).

Top storey (plane at 5 ft below roof): $M = 20(5) = 100$ k-ft. Ground storey (plane 6 ft above base): $M = 20(16) + 30(6) = 500$ k-ft.`}</Md>
        <ApproxSolution g={g9} method="cantilever" unit="k" lenUnit="ft" />
      </div>
    ),
    notes: ['Column areas 100/200/100 in² entered as 1A/2A/1A — identical results.'],
  },
  {
    id: '2020-21-B10',
    paper: PAPER,
    sec: 'B',
    no: '10',
    marks: 28,
    topics: ['truss'],
    title: 'X-braced tower truss: forces AB, BC, CD, DE, CE, BE, EF, AG',
    pages: [45, 50],
    text: `Determine the member forces **AB, BC, CD, DE, CE, BE, EF and AG** of the indeterminate truss in Fig. 10. The diagonals can support both tension and compression.

Geometry: A (pin) and G (roller) 16 ft apart at the base; B, F at 12 ft; C, E at 24 ft; D above E at 36 ft; CD inclined from C to D. Panels ABFG and BCEF are X-braced. Horizontal loads (←): 10 k at D, 20 k at E, 24 k at F.`,
    figure: () => <Figure model={t10} dimY />,
    checks: () => {
      const f = x10().forces
      return [
        { key: 'CD', label: 'Force in CD (T +)', value: f.get('CD')!, unit: 'k' },
        { key: 'BE', label: 'Force in BE (T +)', value: f.get('BE')!, unit: 'k' },
        { key: 'AB', label: 'Force in AB (T +)', value: f.get('AB')!, unit: 'k' },
        { key: 'AG', label: 'Force in AG (T +)', value: f.get('AG')!, unit: 'k' },
      ]
    },
    solution: () => {
      const f = x10().forces
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Each X-braced panel has one redundant. Since both diagonals act (T and C), assume they **share the panel shear equally**: in each panel one diagonal is in tension and the other in compression with the same magnitude. Diagonal length $\\sqrt{16^2+12^2} = 20$ ft → horizontal component $= 0.8F$.

- Joint D: $F_{CD}(0.8) = 10$ → CD = 12.5 k (C); DE = $12.5\\times0.6 = 7.5$ k (T).
- Panel BCEF (cut between the 12 ft and 24 ft levels through BC, BE, CF, EF): horizontal shear = 10 + 20 = 30 k, all carried by the two diagonals → 15 k each: $F = 15/0.8 = 18.75$ k (one T, one C).
- Panel ABFG: shear = 54 k → 27 k each → 33.75 k per diagonal.
- Verticals and horizontals then follow from joint equilibrium. Reactions: $H_A = 54$ k →; $\\sum M_A$: $R_G(16) + 10(36) + 20(24) + 24(12) = 0 \\Rightarrow R_G = 70.5$ k **↓** (hold-down), $R_A = 70.5$ k ↑ — the leftward loads overturn the tower about A.`}</Md>
          <TrussSolution model={t10} asked={asked10} forces={f} note="Forces from the equal-shear assumption (average of the four statically determinate choices = each diagonal takes half the panel shear)." />
          <table className="tbl w-auto">
            <tbody>
              {asked10.map((id) => (
                <tr key={id}>
                  <td className="txt font-semibold">{id}</td>
                  <td className="font-bold">{TF(f.get(id)!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    notes: ['BF and CE are drawn slightly sloped in the sketch; taken as horizontal (all levels at 12 ft spacing as dimensioned).'],
  },
  {
    id: '2020-21-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: 28,
    topics: ['lateral'],
    title: 'Roof truss on two fixed columns: GM, MN, FP and column AJI',
    pages: [45, 50],
    text: `Analyse the truss in Fig. 11 and determine the member forces **GM, MN and FP**, applying the necessary assumptions. Also draw (a) the shear force and (b) the bending moment diagram of the column **AJI**.

Bent: columns at A (x = 0) and B (x = 60 ft), fixed bases. Bottom chord J–K–L–M–N–O–C at 12 ft (6 @ 10 ft); top chord I–H–G–F–P–E–D rises from 15 ft at the eaves to 16.5 ft at the ridge F. Web: J–H, H–K, H–L, G–L, **G–M**, F–M, M–P, P–N, N–E, E–O, E–C. Loads (→): 5 k at I, 10 k at J and 2 k/ft on the full height of column A–J–I.`,
    figure: () => <Figure model={{ ...m11, loads: m11.loads.slice(0, 5), supports: supports('A:fixed') }} dimY={[0, 12, 15, 16.5]} />,
    checks: () => [
      { key: 'GM', label: 'Force in GM (T +)', value: N11('GM'), unit: 'k' },
      { key: 'MN', label: 'Force in MN (T +)', value: N11('MN'), unit: 'k' },
      { key: 'FP', label: 'Force in FP (T +)', value: N11('FP'), unit: 'k' },
      { key: 'MA', label: 'Base moment of column A (magnitude)', value: Math.abs(r11().reaction('A').m), unit: 'k-ft' },
    ],
    solution: () => {
      const r = r11()
      const RA = r.reaction('A')
      const Rb = r.reaction('b')
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Assumptions** (fixed-base bent): (1) inflection points in both columns at **mid-height of the part below the truss**, 6 ft above the bases; (2) the horizontal shear at the two inflection points is **equal**. Cut through both inflection points; the load above the cut is $5 + 10 + 2(15 - 6) = 33$ k → each inflection point carries $${fmt(Vinf11)}$ k (←). Moments about the left inflection point give the vertical forces (column A in tension, B in compression).

**Base reactions.** Column A: $H_A = 16.5 + 2(6) = ${fmt(Math.abs(RA.rx))}$ k ←, $M_A = 16.5(6) + 2(6)(3) = ${fmt(Math.abs(RA.m))}$ k-ft. Column B: $H_B = 16.5$ k ←, $M_B = 16.5(6) = 99$ k-ft, vertical $= ${fmt(Math.abs(Rb.ry))}$ k ${Rb.ry > 0 ? '↑' : '↓'} (= ${fmt(Math.abs(RA.ry))} k ${RA.ry > 0 ? '↑' : '↓'} at A).

The upper structure (truss + column tops) is now determinate. The columns are continuous through J and I, so they bend; the truss bars are pin-ended. Use the free body to the **right** of each cut (only the known forces at B's inflection point act on it):
- Section through **GF, GM, LM** (panel 20–30 ft): $\\sum F_y$ gives **GM** (once GF is known — GF = FP by joint F, since FM is vertical).
- Section through **FP, PM, MN** (panel 30–40 ft): moments about M give **FP**, moments about P give **MN**.`}</Md>
          <div className="grid cq-sm:grid-cols-3 gap-2">
            {[
              ['GM', 'GM (diagonal)'],
              ['MN', 'MN (bottom chord)'],
              ['FP', 'FP (top chord)'],
            ].map(([id, l]) => (
              <div key={id} className="rounded-lg border border-line p-2">
                {l}: <b className="num">{TF(N11(id))}</b>
              </div>
            ))}
          </div>
          <TrussSolution model={m11} asked={['GM', 'MN', 'FP']} note="Truss bar forces with the inflection-point assumptions (column members shown in grey are beam-columns)." />
          <h4 className="font-bold">Column A–I: SFD and BMD</h4>
          <FrameSolution model={m11} kinds={['V', 'M', 'N']} only={['Aa', 'aJ', 'JI']} />
        </div>
      )
    },
    notes: [
      'The paper asks for GM, MN and FP. GM is the diagonal from G (20 ft, top chord) down to M (30 ft, bottom chord), as drawn in Fig. 11.',
      'Column AJI = the left column A–J–I. Bases read as fixed (hatching as in Figs. 8–9). Eaves I and D at 12 + 3 = 15 ft, ridge F 1.5 ft higher; intermediate top-chord joints on straight lines.',
      'Inflection points at 6 ft (half of the 12 ft column below the bottom chord) with equal shears 16.5 k; the right lower column B–(6 ft) is a cantilever carrying that shear and is not drawn in the model.',
    ],
  },
]

// ---------------------------------------------------------------- figure: Fig. 4 suspension girder
function SuspFig() {
  const X = (x: number) => 60 + x * 4.5
  const yc = (x: number) => 40 + (100 * 4 * x * (120 - x)) / 14400 * 1.1
  const gy = 175
  const pts = Array.from({ length: 61 }, (_, i) => `${X(i * 2)},${yc(i * 2)}`).join(' ')
  return (
    <svg viewBox="0 0 660 250" className="w-full max-w-2xl h-auto">
      <polyline points={pts} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <line x1={X(0)} y1={40} x2={X(0)} y2={230} stroke="var(--c-member)" strokeWidth={3} />
      <line x1={X(120)} y1={40} x2={X(120)} y2={230} stroke="var(--c-member)" strokeWidth={3} />
      <line x1={X(0)} y1={40} x2={X(0) - 45} y2={150} stroke="var(--c-accent)" strokeWidth={1.5} />
      <line x1={X(120)} y1={40} x2={X(120) + 45} y2={150} stroke="var(--c-accent)" strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, k) => 12 * (k + 1)).map((x) => (
        <line key={x} x1={X(x)} y1={yc(x)} x2={X(x)} y2={gy} stroke="var(--c-faint)" strokeWidth={1.2} />
      ))}
      <line x1={X(0)} y1={gy} x2={X(120)} y2={gy} stroke="var(--c-member)" strokeWidth={4} />
      <circle cx={X(60)} cy={gy} r={5} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth={1.5} />
      {[
        [36, '12 T'],
        [72, '10 T'],
      ].map(([x, l]) => (
        <g key={x as number}>
          <line x1={X(x as number)} y1={gy + 4} x2={X(x as number)} y2={gy + 34} stroke="var(--c-load)" strokeWidth={2} />
          <path d={`M${X(x as number)},${gy + 38} l-4,-8 h8 z`} fill="var(--c-load)" />
          <text x={X(x as number) + 6} y={gy + 32} fontSize={12} fill="var(--c-load)" fontWeight={700}>
            {l}
          </text>
        </g>
      ))}
      <text x={X(60) + 8} y={110} fontSize={11} fill="var(--c-mute)">
        sag 100′
      </text>
      <text x={X(60) - 22} y={gy - 8} fontSize={10} fill="var(--c-mute)">
        hinge
      </text>
      <text x={X(60)} y={246} fontSize={11} textAnchor="middle" fill="var(--c-mute)">
        10 @ 12′ = 120′ (loads at 36′ and 72′)
      </text>
    </svg>
  )
}

void ildExtremes
