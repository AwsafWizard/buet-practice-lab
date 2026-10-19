// L-3/T-1 term final, Session January 2021 (paper id 2019-20). Scan pages 34–41.
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { cantileverMethod, gridModel, portalMethod, type GridFrame } from '../../engine/approx'
import { absoluteMaxMoment, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { baseShear, Cs, period, sdc, SOIL } from '../../engine/eq'
import { gustRigid, isLowRise, storeyForces } from '../../engine/wind'
import { cablePointLoads, parabolicCable } from '../../engine/cable'
import { determinacy } from '../../engine/determinacy'
import type { Model } from '../../engine/model'
import { beamOf, floorSystem, model, P, Pm, truss } from '../../kit/builders'
import { AbsMaxSolution, ApproxSolution, ApproxTables, Figure, FrameSolution, ILDStack, MaxEffect, VWSolution } from '../../kit/solutions'
import { DeterminacyCard, WindAnalytical } from '../../kit/loads'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { DiagramView, fmt } from '../../components/DiagramView'

const PAPER = '2019-20' as const

// ---------------------------------------------------------------- Q1 portal
const g1: GridFrame = { xs: [0, 20, 40], heights: [12, 10], loads: [40, 20], loadSide: ['left', 'left'] }

// ---------------------------------------------------------------- Q2 beam with hinges B, F
const b2 = beamOf('A:0:roller B*:20 C:40:roller D:80 E:120:pin F*:160 G:200:roller')
const p2 = { kind: 'members' as const, members: b2.members.map((m) => m.id) }
const ild2V = () => influenceLine(b2, p2, { kind: 'shear', member: 'DE', x: 0 })
const ild2M = () => influenceLine(b2, p2, { kind: 'moment', member: 'DE', x: 0 })

// ---------------------------------------------------------------- Q3 cantilever (column ABC)
const g3: GridFrame = {
  xs: [0, 20, 40],
  heights: [16, 12],
  loads: [20, 10],
  loadSide: ['left', 'left'],
  areas: [
    [1, 2, 1],
    [1, 2, 1],
  ],
  names: ['A', 'H', 'I', 'B', 'F', 'G', 'C', 'D', 'E'],
}

// ---------------------------------------------------------------- Q4 floor beam system
const fs4 = floorSystem({
  floorBeams: [0, 30, 60, 90, 120],
  stringers: [
    [0, 30],
    [30, 60],
    [60, 90],
    [90, 120],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 120, type: 'roller' },
  ],
  names: { 0: 'A', 30: 'B', 60: 'C', 90: 'D', 120: 'E' },
})
const ild4 = (r: ReturnType<typeof fs4.fbr>) => influenceLine(fs4.model, fs4.path, r)
// alternative reading: stringers continuous A–C and C–E (break drawn at C)
const fs4c = floorSystem({
  floorBeams: [0, 30, 60, 90, 120],
  stringers: [
    [0, 60],
    [60, 120],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 120, type: 'roller' },
  ],
  names: { 0: 'A', 30: 'B', 60: 'C', 90: 'D', 120: 'E' },
})

// ---------------------------------------------------------------- Q5 absolute max moment
const train5: Train = { P: [10, 20, 20], gaps: [12, 4] }

// ---------------------------------------------------------------- Q6 compound beam
const b6 = beamOf('A:0:roller B:40:roller C*:65 D*:115 E:140:pin F:220:roller', [Pm('AB', 20, 50, '50k'), Pm('CD', 25, 40, '40k'), Pm('EF', 40, 80, '80k')])

// ---------------------------------------------------------------- Q7 trusses hung from a parabolic cable
const q7 = (() => {
  // left truss A–B (0..48), hangers at 12, 24, 36 (and 48 on pin B); 10 k at G (24)
  // right truss B–C (48..96), hangers at 60, 72, 84; 8 k at x = 60
  // ΣM_B (left):  −48Ay − F(36+24+12) + 10(24) = 0 → Ay = (240 − 72F)/48
  // ΣM_B (right):  48Cy + F(12+24+36) − 8(12) = 0 → Cy = (96 − 72F)/48
  // ΣFy:  Ay + Cy + 7F = 18
  const F = (18 - (240 + 96) / 48) / (7 - (2 * 72) / 48)
  const Ay = (240 - 72 * F) / 48
  const Cy = (96 - 72 * F) / 48
  const w = F / 12
  const par = parabolicCable({ L: 96, w, h: 14 })
  const disc = cablePointLoads({ L: 96, dh: 0, loads: [12, 24, 36, 48, 60, 72, 84].map((x) => ({ x, P: F })), sagAt: { x: 48, sag: 14 } })
  return { F, Ay, Cy, w, par, disc }
})()
const m7 = (() => {
  const cy = (x: number) => 22 + 14 * ((x - 48) / 48) ** 2
  const n = [
    'A:0,0 F:12,0 G:24,0 H:36,0 B:48,0 K:12,16 J:24,16 I:36,16',
    'b1:60,0 b2:72,0 b3:84,0 C:96,0 t1:60,16 t2:72,16 t3:84,16',
    ...[0, 12, 24, 36, 48, 60, 72, 84, 96].map((x, k) => `${k === 0 ? 'D' : k === 8 ? 'E' : 'c' + k}:${x},${cy(x)}`),
  ].join(' ')
  const bars = 'A-F F-G G-H H-B K-J J-I A-K K-F K-G J-G G-I I-H I-B B-b1 b1-b2 b2-b3 b3-C t1-t2 t2-t3 B-t1 t1-b1 t1-b2 t2-b2 b2-t3 t3-b3 t3-C'
  const cable = 'D-c1 c1-c2 c2-c3 c3-c4 c4-c5 c5-c6 c6-c7 c7-E'
  const hang = 'K-c1 J-c2 I-c3 B-c4 t1-c5 t2-c6 t3-c7'
  const m = truss(n, `${bars} ${cable} ${hang}`, 'A:pin C:pin D:pin E:pin', [P('G', 10, '10 kip'), P('b1', 8, '8 kip')])
  m.nodes.forEach((q) => {
    if (/^(c\d|b\d|t\d)$/.test(q.id)) q.label = ''
  })
  const cs = new Set(cable.split(' ').map((s) => s.replace('-', '')))
  const hs = new Set(hang.split(' ').map((s) => s.replace('-', '')))
  m.members.forEach((mm) => {
    if (cs.has(mm.id)) mm.style = 'cable'
    if (hs.has(mm.id)) mm.style = 'thin'
  })
  return m
})()

// ---------------------------------------------------------------- Q8 three-hinged portal frame
const E = 29000
const EI8 = (E * 2000) / 144
const f8 = model('a:0,0 b:0,10 e*:6,10 c:12,10 d:12,0', 'a-b b-e e-c c-d', 'a:pin d:pin', [P('e', 100, '100 k')], { EI: EI8 })
const vw8 = () => virtualWork(f8, f8.loads, [P('e', 1)], { EI: () => EI8 })

// ---------------------------------------------------------------- Q9 beam with two I's
const I9 = 800
const EI9 = (id: string) => (E * (id === 'bc' || id === 'cd' ? 1.5 * I9 : I9)) / 144
const b9 = beamOf('a:0:roller b:8 c:14 d:20 e:28:pin', [P('b', 6, '6 k'), P('c', 12, '12 k'), P('d', 6, '6 k')])
b9.members.forEach((m) => (m.label = m.id === 'bc' || m.id === 'cd' ? 'I₂' : 'I₁'))
const vw9 = () => virtualWork(b9, b9.loads, [P('c', 1)], { EI: EI9 })

// ---------------------------------------------------------------- Q10(a) DOSI
const d10a = model('T:0,10 J:0,5 Bt:0,0 M:5,5 Pb:5,0 R:10,5', 'T-J J-Bt J-M M-R M-Pb', 'T:fixed Bt:fixed Pb:pin R:pin')
const d10b = model(
  'a0:0,0 b0:10,0 c0:20,0 d0:30,0 a1:0,4 b1:10,4 c1:20,4 d1:30,4 a2:0,8 b2:10,8 c2:20,8 d2:30,8',
  'a0-a1 a1-a2 b0-b1 b1-b2 c0-c1 c1-c2 d0-d1 d1-d2 a1-b1 b1-c1 c1-d1 a2-b2 b2-c2 c2-d2',
  'a0:fixed b0:pin c0:pin d0:fixed',
)
const d10d = truss('p:0,10 q:10,10 r:20,10 s:0,0 t:10,0 u:20,0', 'p-q q-r s-t t-u p-s q-t r-u s-q q-u t-r', 'r:pin u:roller@0')
// (c) is a space frame: 6 columns, 4 longitudinal + 3 transverse roof beams, 6 pinned bases
const sp = { m: 13, j: 12, r: 6 * 3 }
const dosiC = 6 * sp.m + sp.r - 6 * sp.j

// ---------------------------------------------------------------- Q10(b) EQ, Comilla
const eq10 = (() => {
  const hn = 2 + 5 * 3
  const per = period('rc_mrf', hn)
  const c = Cs(per.T, 'SB', 1.2)
  const r = baseShear({ Z: 0.2, I: 1.25, R: 5, site: 'SB', T: per.T, eta: 1.2, floors: [{ name: 'W', h: hn, w: 1 }] })
  return { hn, per, c, r, sdc: sdc('SB', 2, 3) }
})()

// ---------------------------------------------------------------- Q11 wind, Cox's Bazar
const w11 = { V: 80, exp: 'C' as const, occ: 2 as const, G: 0.85, B: 60, L: 60, levels: [3, 6, 9, 12, 15, 18], enclosure: 'open' as const, parapet: { height: 1, GCpnWindward: 1.5, GCpnLeeward: -1.0 } }
const r11 = () => storeyForces({ ...w11, I: 1, Kzt: 1, Kd: 0.85 })

export const Q2019: PYQ[] = [
  {
    id: '2019-20-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method: 2-bay, 2-storey frame (40 k + 20 k)',
    pages: [34],
    text: `Using the portal method, draw the shear force diagram and bending moment diagram for all **columns** and the bending moment diagram for all **beams** of the frame in Fig. 1: two bays of 20 ft, ground storey 12 ft, top storey 10 ft, fixed bases; lateral loads 40 k at the first floor and 20 k at the roof, both acting to the right at the left end.`,
    figure: () => <ApproxFig g={g1} />,
    checks: () => {
      const r = portalMethod(g1)
      return [
        { key: 'vi', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'me', label: 'Exterior column end moment, ground storey', value: r.columns[0][0].mTop, unit: 'k-ft' },
        { key: 'mb1', label: 'First-floor beam end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'mb2', label: 'Roof beam end moment', value: r.beams[1][0].moment, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`**Portal method assumptions:** inflection points at mid-height of every column and mid-span of every beam; an interior column carries **twice** the shear of an exterior column (2 bays → 4 shares). Storey shears: top $= 20$ k, ground $= 20 + 40 = 60$ k → ground storey: exterior $60/4 = 15$ k, interior $30$ k; top storey: $5$ k and $10$ k.

Column end moment $= V\\times h/2$; beam end moments come from joint equilibrium, working left → right (beam moment = column moments at the joint − moment of the beam on the other side); beam shear $= 2M/L$.`}</Md>
        <ApproxSolution g={g1} method="portal" kinds={['M', 'V']} />
      </div>
    ),
  },
  {
    id: '2019-20-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: 28,
    topics: ['ild'],
    title: 'Hinged beam: max shear and moment at D, 6 k/ft + 40 k',
    pages: [34],
    text: `For the beam in Fig. 2 (A roller at 0, internal hinge B at 20 ft, C roller at 40 ft, D at 80 ft, E pin at 120 ft, internal hinge F at 160 ft, G roller at 200 ft), calculate the **maximum negative shear**, **maximum negative moment** and **maximum positive moment** at D due to a moving uniform load of 6 k/ft and a roving concentrated load of 40 kip.`,
    figure: () => <Figure model={b2} />,
    checks: () => {
      const v = uniformPlusConcentrated(ild2V(), 6, 40)
      const m = uniformPlusConcentrated(ild2M(), 6, 40)
      return [
        { key: 'vneg', label: 'Max negative shear at D', value: v.maxNeg.live, unit: 'k' },
        { key: 'mneg', label: 'Max negative moment at D', value: m.maxNeg.live, unit: 'k-ft' },
        { key: 'mpos', label: 'Max positive moment at D', value: m.maxPos.live, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Draw the ILDs by **Müller-Breslau**. The main span B–C–E–F (with overhangs to the hinges B and F) carries the hanging spans A–B and F–G.
- $V_D$: cut at D and give a unit relative shear with parallel branches. Span C–E: $-0.5$ just left of D, $+0.5$ just right. The left branch continues over the overhang to $+0.25$ at the hinge B and drops to 0 at A; the right branch continues through E to $-0.5$ at the hinge F and returns to 0 at G.
- $M_D$: hinge at D, unit relative rotation: peak $\\dfrac{40\\times40}{80} = 20$ at D; the overhangs go **negative** ($-10$ at B, $-20$ at F) and return to zero at A and G.

For a **maximum** effect put the uniform load over every part of the ILD with the required sign and the 40 k at the largest ordinate of that sign.`}</Md>
        <ILDStack
          model={b2}
          path={p2}
          items={[
            { label: 'V_D', resp: { kind: 'shear', member: 'DE', x: 0 } },
            { label: 'M_D', resp: { kind: 'moment', member: 'DE', x: 0 } },
          ]}
        />
        <MaxEffect ild={ild2V()} w={6} P={40} label="Shear at D (use the negative result)" />
        <MaxEffect ild={ild2M()} w={6} P={40} label="Moment at D" resUnit="k-ft" />
      </div>
    ),
    notes: ['Supports read from Fig. 2: A roller, C roller, E pin, G roller; B and F are internal hinges (stated). Spans 20, 20, 40, 40, 40, 40 ft.', 'Only live loads are asked (no dead load).'],
  },
  {
    id: '2019-20-A3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: 28,
    topics: ['lateral'],
    title: 'Cantilever method: AFD, SFD, BMD of column ABC',
    pages: [35],
    text: `Using the cantilever method, draw the axial force, shear force and bending moment diagrams for the column **ABC** of the frame in Fig. 3. Two bays of 20 ft; ground storey 16 ft, top storey 12 ft; fixed bases. Lateral loads 20 k at B (first floor) and 10 k at C (roof), acting to the right. Relative column areas: A (left), 2A (middle), A (right) in both storeys.`,
    figure: () => <ApproxFig g={g3} />,
    checks: () => {
      const r = cantileverMethod(g3)
      return [
        { key: 'nab', label: 'Axial force in AB (tension +)', value: r.columns[0][0].axial, unit: 'k' },
        { key: 'nbc', label: 'Axial force in BC (tension +)', value: r.columns[1][0].axial, unit: 'k' },
        { key: 'vab', label: 'Shear in AB', value: r.columns[0][0].shear, unit: 'k' },
        { key: 'mab', label: 'Moment at the ends of AB', value: r.columns[0][0].mTop, unit: 'k-ft' },
      ]
    },
    solution: () => <Q3Solution />,
  },
  {
    id: '2019-20-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: 28,
    topics: ['floor'],
    title: 'Floor beam system 4 @ 30 ft: FBR_A, R_A, V_AB, M_B',
    pages: [35],
    text: `For the floor beam system in Fig. 4 (girder A–E, 4 panels @ 30 ft = 120 ft, floor beams at A, B, C, D, E; girder pinned at A and on a roller at E), draw influence lines for (a) the floor beam reaction at A, $FBR_A$; (b) the support reaction at A, $R_A$; (c) the panel shear $V_{AB}$; (d) the moment at B, $M_B$.`,
    figure: () => <StructureView model={fs4.model} showLoads={false} autoDimX={[0, 30, 60, 90, 120]} maxHeight={200} />,
    checks: () => [
      { key: 'ra', label: '$R_A$ ordinate for a unit load at B', value: ildAt(ild4(fs4.reaction(0)), 30) },
      { key: 'vab', label: 'Max ordinate of $V_{AB}$', value: ildExtremes(ild4(fs4.shear(15))).max.y },
      { key: 'mb', label: 'Max ordinate of $M_B$', value: ildExtremes(ild4(fs4.moment(30))).max.y, unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The load reaches the girder only through the floor beams, so every girder ILD is **straight between floor beams**.
- $FBR_A$: only stringer A–B rests on floor beam A → 1 at A falling linearly to 0 at B, zero elsewhere.
- $R_A$: floor beam A sits directly over support A, so the girder behaves like a simple beam: $R_A = 1 - x/120$.
- $V_{AB}$ (girder shear in panel AB) $= R_A - FBR_A$: 0 at A, $+0.75$ at B, then $R_A$ down to 0 at E.
- $M_B = 30R_A - 30\\,FBR_A$: simple-beam triangle, peak $30\\times90/120 = 22.5$ at B.`}</Md>
        <ILDStack
          model={fs4.model}
          path={fs4.path}
          items={[
            { label: 'FBR_A', resp: fs4.fbr(0) },
            { label: 'R_A', resp: fs4.reaction(0) },
            { label: 'V_AB (panel AB)', resp: fs4.shear(15) },
            { label: 'M_B', resp: fs4.moment(30) },
          ]}
        />
        <details>
          <summary className="cursor-pointer text-mute font-semibold">Alternative reading: stringers continuous A–C and C–E</summary>
          <Md>{`The figure draws the stringer line with a break only at C. If the two stringers are taken as continuous over B and D (two-span beams), $FBR_A$ becomes curved and slightly negative in panel BC; $R_A$, $V_{AB}$ and $M_B$ change too. The standard (exam) assumption is simply supported stringers between floor beams, used above.`}</Md>
          <ILDStack model={fs4c.model} path={fs4c.path} items={[{ label: 'FBR_A (continuous stringers)', resp: fs4c.fbr(0) }]} showTable={false} />
        </details>
      </div>
    ),
    notes: ['Floor beams at all five panel points A–E (hand-drawn spacing ≈ 30 ft as stated). Girder supports: pin at A, roller at E.', 'Stringers taken as simple spans between adjacent floor beams (the usual assumption). The drawing shows the stringer line broken only at C; the continuous-stringer variant is shown for comparison.'],
  },
  {
    id: '2019-20-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: 28,
    topics: ['wheel'],
    title: 'Absolute max moment, 60 ft span, 10-20-20 k',
    pages: [36],
    text: `Find the absolute (greatest) moment in a simply supported beam of 60 ft span for the wheel loads in Fig. 5: 10 k, 20 k, 20 k at spacings 12 ft and 4 ft.`,
    checks: () => {
      const r = absoluteMaxMoment(60, train5)
      return [
        { key: 'M', label: 'Absolute maximum moment', value: r.M, unit: 'k-ft' },
        { key: 'R', label: 'Resultant of the loads on the span', value: r.R, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`The absolute maximum moment occurs **under a wheel** when the midspan bisects the distance between that wheel and the resultant of the loads on the span. Resultant $R = 50$ k at $\\bar x = (20\\times12 + 20\\times16)/50 = 11.2$ ft from wheel 1 — i.e. 0.8 ft left of wheel 2. Try the heavy wheels next to the resultant (wheels 2 and 3) and keep the larger moment.`}</Md>
        <AbsMaxSolution L={60} t={train5} />
      </div>
    ),
  },
  {
    id: '2019-20-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: 28,
    topics: ['frames'],
    title: 'SFD & BMD of a compound beam with hinges C and D',
    pages: [36],
    text: `Draw the shear force and bending moment diagrams of the beam in Fig. 6. A roller (0), 50 k at 20 ft, B roller (40 ft), internal hinge C (65 ft), 40 k at 90 ft, internal hinge D (115 ft), E pin (140 ft), 80 k at 180 ft, F roller (220 ft).`,
    figure: () => <Figure model={b6} />,
    checks: () => {
      const r = solve(b6)
      return [
        { key: 'rb', label: 'Reaction at B', value: r.reaction('B').ry, unit: 'k' },
        { key: 're', label: 'Reaction at E', value: r.reaction('E').ry, unit: 'k' },
        { key: 'mb', label: 'Moment at B (sagging +)', value: r.member('BC').M(0), unit: 'k-ft' },
        { key: 'm80', label: 'Moment under the 80 k load', value: r.member('EF').M(40), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Split at the hinges. **C–D** is a drop-in span (simply supported on the cantilever tips): $R_C = R_D = 40/2 = 20$ k. These 20 k act **down** on the tips C (of A–B–C) and D (of D–E–F).

- A–B–C: $\\sum M_A = 0$: $40R_B = 50(20) + 20(65)$ → $R_B = 57.5$ k, $R_A = 12.5$ k.
- D–E–F: $\\sum M_E = 0$: $80R_F + 20(25) = 80(40)$ → $R_F = 33.75$ k, $R_E = 66.25$ k.`}</Md>
        <FrameSolution model={b6} />
      </div>
    ),
  },
  {
    id: '2019-20-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: 28,
    topics: ['cable'],
    title: 'Two trusses hung from a parabolic cable: max cable force',
    pages: [37],
    text: `The trusses in Fig. 7 are pin connected (at B) and suspended from the parabolic cable D–E. Determine the maximum force in the cable for the loading shown: 10 kip at G (24 ft from A) and 8 kip at the first bottom joint right of B (60 ft from A). Each truss: 4 panels @ 12 ft = 48 ft, depth 16 ft; supports A and C; cable sag 14 ft, lowest point 6 ft above the top chord; hangers at every 12 ft (7 hangers, the middle one on pin B).`,
    figure: () => <Figure model={m7} dims={[0, 12, 24, 36, 48, 60, 72, 84, 96]} />,
    checks: () => [
      { key: 'F', label: 'Hanger force', value: q7.F, unit: 'k' },
      { key: 'H', label: 'Horizontal cable force H', value: q7.par.H, unit: 'k' },
      { key: 'T', label: 'Maximum cable force', value: q7.par.Tmax, unit: 'k' },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`A parabolic cable carries a **uniform** load, so all hangers (equal spacing 12 ft) carry the **same** force $F$. Unknowns: $A_y$, $C_y$ and $F$ (the pin force at B is internal). Take moments about the pin B for each truss, then vertical equilibrium of the whole:`}</Md>
        <Tex block>{`\\text{Truss AB: } \\sum M_B = 0:\\ -48A_y - F(36 + 24 + 12) + 10(24) = 0 \\Rightarrow A_y = 5 - 1.5F`}</Tex>
        <Tex block>{`\\text{Truss BC: } \\sum M_B = 0:\\ 48C_y + F(12 + 24 + 36) - 8(12) = 0 \\Rightarrow C_y = 2 - 1.5F`}</Tex>
        <Tex block>{`\\sum F_y = 0:\\ A_y + C_y + 7F = 18 \\Rightarrow 7 + 4F = 18 \\Rightarrow F = \\mathbf{${fmt(q7.F, 3)}}\\text{ k},\\quad A_y = ${fmt(q7.Ay, 3)}\\text{ k},\\ C_y = ${fmt(q7.Cy, 3)}\\text{ k}`}</Tex>
        <Md>{`(The hanger on pin B takes moment about B as zero, which is why it does not appear in the moment equations.) Cable load per foot $w = F/12 = ${fmt(q7.w, 4)}$ k/ft:`}</Md>
        <Tex block>{`H = \\frac{wL^2}{8h} = \\frac{${fmt(q7.w, 4)}(96)^2}{8(14)} = ${fmt(q7.par.H, 3)}\\text{ k},\\qquad T_{max} = \\sqrt{H^2 + \\left(\\tfrac{wL}{2}\\right)^2} = \\sqrt{${fmt(q7.par.H, 3)}^2 + ${fmt((q7.w * 96) / 2, 3)}^2} = \\mathbf{${fmt(q7.par.Tmax, 2)}}\\text{ k}`}</Tex>
        <Md>{`Treating the 7 hangers as discrete point loads on the cable instead: $H = M_{mid}/h = (3.5F\\cdot48 - F(36+24+12))/14 = ${fmt(q7.disc.H, 3)}$ k (same), end-segment tension $= ${fmt(q7.disc.Tmax, 2)}$ k. The textbook answer uses the uniform-load idealisation above.`}</Md>
      </div>
    ),
    notes: ['Read from the figure: hangers at x = 12, 24, …, 84 ft (the middle hanger at pin B); the 8 kip load at the first bottom-chord joint of the right truss (x = 60 ft).', 'C_y comes out negative (C is pulled down): the cable lifts the lightly loaded right truss.', 'Max cable force reported with the standard uniform-load idealisation (w = F/12 over the whole 96 ft); the discrete-hanger value is given for comparison.'],
  },
  {
    id: '2019-20-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: 40,
    topics: ['vw'],
    title: 'Three-hinged portal: vertical deflection of hinge e',
    pages: [38, 40],
    text: `Using the method of virtual work, find the vertical deflection of point **e** of the frame in Fig. 8: columns a–b and d–c 10 ft high (pinned at a and d), beam b–c 12 ft long with an internal hinge e at midspan carrying 100 k. Deflection primarily due to bending; $E = 29000$ ksi, $I = 2000$ in⁴, $\\vartheta = 0.3$, same for all members.`,
    figure: () => <Figure model={f8} dimY />,
    checks: () => [{ key: 'de', label: 'Vertical deflection of e (down)', value: vw8().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`The frame is three-hinged (a, d and the hinge at e) → determinate. By symmetry $A_y = D_y = 50$ k; moment at the hinge e from the left part: $50(6) - H(10) = 0$ → $H = 30$ k (inward). Real moments: columns $M = 30y$ (outside tension, 300 k-ft at b and c), beam linear from 300 k-ft at b to 0 at e.
Virtual unit load at e: everything is $1/100$ of the real system → $m = M/100$. So
$$\\Delta_e = \\int\\frac{Mm}{EI}dx = \\frac{2}{EI}\\left[\\int_0^{10}30y(0.3y)dy + \\tfrac13(300)(3)(6)\\right] = \\frac{2(3000 + 1800)}{EI} = \\frac{9600}{EI}$$
with $EI = 29000\\times2000/144 = ${fmt(EI8, 1)}$ k-ft².`}</Md>
        <VWSolution model={f8} real={f8.loads} virtual={[P('e', 1)]} opts={{ EI: () => EI8 }} scale={12} resultUnit="in" what="Δe (vertical, + down)" unitNote="EI in k-ft², lengths in ft; ×12 for inches." />
      </div>
    ),
    notes: ['The filled dot at e is read as an internal hinge (otherwise the two-pinned frame would be indeterminate and the question would not be a plain virtual-work problem). ϑ is not needed for bending-only deflection.'],
  },
  {
    id: '2019-20-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: 40,
    topics: ['vw'],
    title: 'Beam with stepped I: vertical deflection at c',
    pages: [38, 40],
    text: `Using the method of virtual work, determine the vertical deflection of point **c** of the beam in Fig. 9: a (roller) – b – c – d – e (pin), spans 8, 6, 6, 8 ft; loads 6 k at b, 12 k at c, 6 k at d. Segments a–b and d–e have $I_1 = 800$ in⁴, b–d has $I_2 = 1.5I_1$; $E = 29000$ ksi. Deflection due to bending only.`,
    figure: () => <Figure model={b9} labels />,
    checks: () => [{ key: 'dc', label: 'Vertical deflection of c (down)', value: vw9().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Symmetric loading: $R_a = R_e = 12$ k. $M_b = 12(8) = 96$ k-ft, $M_c = 12(14) - 6(6) = 132$ k-ft. Unit load at c: $r = 0.5$, $m_b = 4$, $m_c = 7$. Using symmetry (twice the left half):
$$\\Delta_c = 2\\left[\\frac{\\int_0^8 (12x)(0.5x)dx}{EI_1} + \\frac{\\int_0^6 (96 + 6t)(4 + 0.5t)dt}{EI_2}\\right] = 2\\left[\\frac{1024}{EI_1} + \\frac{3816}{1.5EI_1}\\right]$$`}</Md>
        <VWSolution model={b9} real={b9.loads} virtual={[P('c', 1)]} opts={{ EI: EI9 }} scale={12} resultUnit="in" what="Δc (vertical, + down)" unitNote={`EI₁ = 29000×800/144 = ${fmt(EI9('ab'), 1)} k-ft², EI₂ = 1.5 EI₁; ×12 for inches.`} />
      </div>
    ),
    notes: ['Supports read from Fig. 9: roller at a, pin at e.'],
  },
  {
    id: '2019-20-B10a',
    paper: PAPER,
    sec: 'B',
    no: '10(a)',
    marks: 8,
    topics: ['stability'],
    title: 'DOSI of four structures (frames, space frame, truss)',
    pages: [38, 39],
    text: `Determine the degree of static indeterminacy (DOSI) of the structures in Fig. 10: (a) a column fixed at top and bottom with a beam from its mid-height to a pin, propped by a pinned vertical; (b) a 3-bay, 2-storey frame with fixed outer bases and pinned inner bases; (c) a space frame of 6 pinned columns with a rigid roof grid; (d) a truss with crossing (unconnected) diagonals, pinned and roller-supported at the right wall.`,
    figure: () => (
      <div className="grid md:grid-cols-2 gap-2">
        <StructureView model={d10a} nodeLabels={false} showLoads={false} maxHeight={200} />
        <StructureView model={d10b} nodeLabels={false} showLoads={false} maxHeight={200} />
        <SpaceFrameFig />
        <StructureView model={d10d} nodeLabels={false} showLoads={false} maxHeight={200} />
      </div>
    ),
    checks: () => [
      { key: 'a', label: '(a) DOSI', value: determinacy(d10a).dosi },
      { key: 'b', label: '(b) DOSI', value: determinacy(d10b).dosi },
      { key: 'c', label: '(c) DOSI (space frame)', value: dosiC },
      { key: 'd', label: '(d) DOSI', value: determinacy(d10d).dosi },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <div className="grid md:grid-cols-2 gap-3">
          <DeterminacyCard m={d10a} label="(a) Frame: two fixed ends + two pins" />
          <DeterminacyCard m={d10b} label="(b) 3-bay, 2-storey frame" />
          <div className="rounded-xl border border-line p-3">
            <div className="font-bold mb-1">(c) Space frame (3-D)</div>
            <SpaceFrameFig />
            <Md>{`Rigid-jointed space frame: $\\text{DOSI} = 6m + r - 6j$. Members: 6 columns + 4 longitudinal + 3 transverse beams → $m = ${sp.m}$; joints $j = ${sp.j}$ (6 roof + 6 base); each 3-D pin gives 3 reactions → $r = ${sp.r}$.
$$\\text{DOSI} = 6(${sp.m}) + ${sp.r} - 6(${sp.j}) = \\mathbf{${dosiC}}$$
Check with closed loops: 7 independent loops (ground as one node) × 6 = 42, minus 3 released rotations at each of the 6 pins = 18 → 24 ✓.`}</Md>
          </div>
          <DeterminacyCard m={d10d} label="(d) Truss, diagonals cross without a joint" />
        </div>
      </div>
    ),
    notes: [
      'Fig. 10(c) is a 3-D frame; its supports are read as pins (ball-and-socket, 3 reactions each) and all roof joints as rigid. The 2-D engine cannot check it, so it is counted by formula.',
      'Fig. 10(d): the crossing diagonals of the right panel are drawn with a jog, i.e. not connected; the bottom-right support (rollers against the wall) gives one horizontal reaction, the top-right one is a pin.',
      'Dimensions in (a), (b), (d) are only for drawing (DOSI does not depend on them).',
    ],
  },
  {
    id: '2019-20-B10b',
    paper: PAPER,
    sec: 'B',
    no: '10(b)',
    marks: 32,
    topics: ['eq'],
    title: 'EQ base shear as % of W: 5-storey commercial at Comilla',
    pages: [39, 41],
    text: `Calculate the earthquake base shear as a percentage of the seismic dead load of a 5-storied RC commercial building with an assembly hall at Comilla (BNBC 2020). Occupancy category III, structural system IMF, storey height 3 m, GF height 2 m, site class SB, plan 20 m × 20 m. $Z = 0.2$, $I = 1.25$, $R = 5$, damping correction factor $\\eta = 1.2$. (Seismic dead load need not be calculated.) Use Table 1 (site factors) and the normalised spectrum $C_s$ equations.`,
    checks: () => [
      { key: 'T', label: 'Period T', value: eq10.per.T, unit: 's', tol: 0.01 },
      { key: 'Cs', label: 'Normalised spectrum $C_s$', value: eq10.c.Cs },
      { key: 'pct', label: 'Base shear as % of W', value: eq10.r.Sa * 100, unit: '%' },
    ],
    solution: () => {
      const s = SOIL.SB
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Height:** $h_n = 2 + 5\\times3 = ${eq10.hn}$ m (GF slab 2 m above the base, then five 3 m storeys). Comilla is in zone 2 ($Z = 0.2$); with Occupancy III and site SB the SDC is **${eq10.sdc}**, where an intermediate RC moment frame (R = 5) is permitted ✓.`}</Md>
          <Tex block>{`T = C_t h_n^m = 0.0466(${eq10.hn})^{0.9} = ${fmt(eq10.per.T, 4)}\\text{ s}`}</Tex>
          <Md>{`Site SB: $S = ${s.S}$, $T_B = ${s.TB}$, $T_C = ${s.TC}$, $T_D = ${s.TD}$ s → $T_C \\le T \\le T_D$ (branch ${eq10.c.branch}):`}</Md>
          <Tex block>{`C_s = 2.5S\\eta\\frac{T_C}{T} = 2.5(${s.S})(1.2)\\frac{${s.TC}}{${fmt(eq10.per.T, 4)}} = ${fmt(eq10.c.Cs, 4)}`}</Tex>
          <Tex block>{`S_a = \\frac23\\frac{ZI}{R}C_s = \\frac23\\cdot\\frac{0.2\\times1.25}{5}\\times${fmt(eq10.c.Cs, 4)} = ${fmt(eq10.r.SaRaw, 5)}\\ \\ (\\ge 0.67\\beta ZIS = ${fmt(eq10.r.SaMin, 5)}\\ ✓)`}</Tex>
          <Tex block>{`V = S_aW = ${fmt(eq10.r.Sa, 4)}W \\Rightarrow V = \\mathbf{${fmt(eq10.r.Sa * 100, 2)}\\%}\\text{ of the seismic weight}`}</Tex>
        </div>
      )
    },
    notes: ['h_n taken as 2 m (GF) + 5 × 3 m = 17 m, i.e. the 5 storeys sit above a 2 m GF/plinth level as in other BUET papers. If GF is read as the first of the five storeys (h_n = 2 + 4×3 = 14 m) T = 0.50 s and Cs = 2.5Sη → 12 %.', 'Z, I, R and η are given, so they are used directly.'],
  },
  {
    id: '2019-20-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: 60,
    topics: ['wind'],
    title: "Wind: 6-storey open building at Cox's Bazar (parapet, storey forces, base shear)",
    pages: [39, 40],
    text: `A typical 6-storied residential RC building stands on flat terrain at Cox's Bazar. Plan 60 m × 60 m, storey height 3 m, height excluding parapet 18 m, parapet 1 m. Occupancy II, exposure C, basic wind speed 80 m/s, $G = 0.85$. $C_p = 0.8$ (windward wall), $-0.5$ (leeward wall); combined net parapet coefficient $GC_{pn} = 1.5$ (windward), $-1.0$ (leeward). Assume the building is classified as **OPEN**. $K_z = 2.01(z/z_g)^{2/\\alpha}$ for $4.57 \\le z \\le z_g$, $K_z = 2.01(4.57/z_g)^{2/\\alpha}$ for $z < 4.57$ m; $z_g = 213.36$ m, $\\alpha = 11.5$.

(a) Low-rise or high-rise? (2) (b) Which method of wind load calculation can be used? Justify. (5) (c) Rigid or flexible, given $T = 0.6$ s? (3) (d) Topographic factor $K_{zt}$. (10) (e) Design wind pressure on the windward and leeward parapet. (10) (f) Storey forces for wind along X (overall forces only). (25) (g) Total base shear for wind along X. (5)`,
    checks: () => {
      const r = r11()
      return [
        { key: 'kzt', label: '(d) $K_{zt}$', value: 1 },
        { key: 'ppw', label: '(e) Windward parapet pressure', value: r.parapet!.pw, unit: 'kN/m²' },
        { key: 'ppl', label: '(e) Leeward parapet pressure', value: r.parapet!.pl, unit: 'kN/m²' },
        { key: 'froof', label: '(f) Storey force at the roof (18 m), walls only', value: r.rows[r.rows.length - 1].F, unit: 'kN' },
        { key: 'V', label: '(g) Base shear (incl. parapet)', value: r.base, unit: 'kN' },
      ]
    },
    solution: () => {
      const lr = isLowRise(18, 60)
      const r = r11()
      const g = gustRigid({ h: 18, B: 60, exp: 'C' })
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**(a)** Low-rise building (BNBC 2020): mean roof height $h \\le 18$ m and $h \\le$ least horizontal dimension. Here $h = 18$ m and the least dimension is 60 m → by geometry it is **low-rise**${lr.ok ? '' : ' (check)'}. (Strictly the code's low-rise definition is written for enclosed / partially enclosed buildings.)

**(b)** The **simplified procedure (Method 1)** is limited to *enclosed*, simple-diaphragm, regular low-rise buildings. This building is **open**, so Method 1 is not allowed → use the **analytical procedure (Method 2)**: the building is regular in shape and (see c) rigid, so Method 2 applies.

**(c)** Natural frequency $n_1 = 1/T = 1/0.6 = ${fmt(1 / 0.6, 3)}$ Hz $\\ge 1$ Hz → **rigid** structure; the given $G = 0.85$ is consistent (the rigid formula would give $G = ${fmt(g.G, 3)}$).

**(d)** The site is **flat terrain** — no isolated hill, ridge or escarpment, so the topographic speed-up conditions are not met → $K_1 = 0$ and $K_{zt} = (1 + K_1K_2K_3)^2 = \\mathbf{1.0}$.

**(e) & (f)** $q_z = 0.000613K_zK_{zt}K_dV^2I$ with $K_d = 0.85$, $I = 1.0$ (Occupancy II). Open building → $GC_{pi} = 0$. Wind along X: $B = 60$ m, $L = 60$ m ($L/B = 1$ → $C_p = -0.5$ leeward, as given). Parapet: $p_p = q_p(GC_{pn})$ with $q_p$ at the top of the parapet (19 m). Each storey force = (windward + |leeward|) pressure × tributary height × B.`}</Md>
          <WindAnalytical {...w11} />
          <Md>{`**(g)** Base shear = Σ storey forces + parapet force $= ${fmt(r.base - r.parapet!.F)} + ${fmt(r.parapet!.F)} = \\mathbf{${fmt(r.base)}}$ kN (wind along X). The parapet force (${fmt(r.parapet!.net, 3)} kN/m² × 1 m × 60 m) is applied at roof level.`}</Md>
        </div>
      )
    },
    notes: ['Level 1 (z = 3 m, below 4.57 m) uses K_z at 4.57 m. Tributary heights: 3 m for levels 1–5 and 1.5 m for the roof (parapet added separately).', 'Base shear in (g) includes the parapet force; without it the sum of the six storey forces is shown in the table.'],
  },
]

// ---------------------------------------------------------------- local helpers
function ApproxFig({ g, unit = 'k' }: { g: GridFrame; unit?: string }) {
  return <StructureView model={gridModel(g)} forceUnit={unit === 'kN' ? ' kN' : 'k'} lenUnit={unit === 'kN' ? ' m' : '′'} autoDimX autoDimY memberLabels maxHeight={260} />
}

function Q3Solution() {
  const r = cantileverMethod(g3)
  const m = gridModel(g3)
  const only = ['AB', 'BC']
  return (
    <div className="space-y-3 text-sm">
      <Md>{`**Cantilever method assumptions:** inflection points at mid-height of columns and mid-span of beams; the axial stress in a column is proportional to its distance from the **centroid of the column areas**. Centroid $\\bar x = \\dfrac{1(0) + 2(20) + 1(40)}{4} = 20$ ft → the middle column carries no axial force. Loads act to the right, so the left column ABC is in **tension**.

- Plane at mid-height of the ground storey (8 ft): $M = 20(16-8) + 10(28-8) = 360$ k-ft; $\\sum Ad^2 = 2(20^2)A = 800A$ → $N_{AB} = 360(20)/800 = 9$ k (T).
- Plane at mid-height of the top storey (22 ft): $M = 10(28-22) = 60$ k-ft → $N_{BC} = 60(20)/800 = 1.5$ k (T).
- Beam shears from joint equilibrium (C: $V_{CD} = N_{BC}$; B: $V_{BF} = N_{AB} - N_{BC}$), beam end moments $= V L/2$, then column moments from the joints, top down, and column shear $= M/(h/2)$.`}</Md>
      <ApproxTables r={r} />
      <div className="grid md:grid-cols-3 gap-2">
        {(['N', 'V', 'M'] as const).map((k) => (
          <div key={k} className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs font-semibold text-mute">{k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD'} — column ABC</div>
            <DiagramView model={m} members={r.diagrams} kind={k} only={only} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SpaceFrameFig() {
  // oblique sketch of Fig. 10(c)
  const dx = 50,
    dy = -50
  const xs = [30, 150, 270]
  const top = 70,
    bot = 200
  const line = (x1: number, y1: number, x2: number, y2: number, dash = false, k = '') => <line key={k || `${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-member)" strokeWidth={2} strokeDasharray={dash ? '5 4' : undefined} />
  const pin = (x: number, y: number) => <path key={`p${x}${y}`} d={`M${x},${y} l-7,11 h14 z`} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeWidth={1.5} />
  return (
    <svg viewBox="0 0 360 230" className="w-full max-w-sm h-auto">
      {xs.map((x) => line(x + dx, top + dy, x + dx, bot + dy, true, `b${x}`))}
      {xs.map((x) => line(x, top, x, bot, false, `f${x}`))}
      {line(xs[0], top, xs[2], top)}
      {line(xs[0] + dx, top + dy, xs[2] + dx, top + dy)}
      {xs.map((x) => line(x, top, x + dx, top + dy, false, `t${x}`))}
      {xs.map((x) => pin(x, bot))}
      {xs.map((x) => pin(x + dx, bot + dy))}
    </svg>
  )
}

void ([] as Model[])
