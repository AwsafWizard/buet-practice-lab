// 2009-10 term final (held 13 Dec 2010) — 14 questions, all of equal value (210 / 10 answered = 21 marks each).
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { rot, rotTag } from '../../engine/sign'
import { influenceLine, ildAt, ildExtremes, type ILD } from '../../engine/ild'
import { trainExtremes, ssShearILD, uniformPlusConcentrated, offsets, place, type Train } from '../../engine/moving'
import { cablePointLoads, hangerGirder, parabolicCable, stiffenedSuspension, simpleBeamM, type PointLoad } from '../../engine/cable'
import type { Model } from '../../engine/model'
import { beamOf, F, floorSystem, Mo, P, truss, Wv, model } from '../../kit/builders'
import { Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrainTable, TrussSolution } from '../../kit/solutions'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'

const PAPER = '2009-10' as const
const MK = 21 // "The questions are of equal value": 210 / 10
const PA = [9, 11] // Section A text + figures
const PB = [10, 12] // Section B text + figures

// ---------------------------------------------------------------- Fig. 1 wheel loads
const T1: Train = {
  P: [12, 12, 50, 50, 50, 50, 40, 40, 40, 40, 10, 10],
  gaps: [4, 12, 6, 6, 6, 12, 6, 6, 6, 12, 4],
  udl: { w: 5, gap: 8, length: 24 },
}
const T1_TEXT = '12, 12, 50, 50, 50, 50, 40, 40, 40, 40, 10, 10 k at spacings 4, 12, 6, 6, 6, 12, 6, 6, 6, 12, 4 ft, followed (after an 8 ft gap) by a 24 ft long uniform load of 5 k/ft'

function TrainFig({ span, extra }: { span: Model; extra?: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-mute font-semibold">Fig. 1 — wheel loads (wheel 1 at the left; the 5 k/ft, 24 ft long load trails 8 ft behind wheel 12)</div>
      <TrainTable t={T1} />
      <Figure model={span} />
      {extra && <p className="text-xs text-faint">{extra}</p>}
    </div>
  )
}

// ---------------------------------------------------------------- Q1 shear at 20 ft, 70 ft span
const ild1 = ssShearILD(70, 20)
const span70 = beamOf('A:0:pin X:20 B:70:roller')

// ---------------------------------------------------------------- Q2 girder with floor beams
const fs2 = floorSystem({
  floorBeams: [6, 18, 34, 46, 62],
  stringers: [
    [0, 26],
    [26, 46],
    [46, 62],
  ],
  supports: [
    { x: 0, type: 'pin' },
    { x: 46, type: 'roller' },
  ],
  names: { 0: '1', 6: '2', 18: '3', 34: '4', 46: '5', 62: '6' },
})
const ild2 = (r: ReturnType<typeof fs2.moment>) => influenceLine(fs2.model, fs2.path, r)

// ---------------------------------------------------------------- Q3 reaction at B
const b3 = beamOf('A:0:roller D*:10 B:20:roller C:40:pin')
const p3 = { kind: 'members' as const, members: b3.members.map((m) => m.id) }
const ild3 = () => influenceLine(b3, p3, { kind: 'reaction', node: 'B', comp: 'y' })

// ---------------------------------------------------------------- Q4 beam ILDs
const b4 = beamOf('A:0 B:8:roller C:16 D:24:roller E*:32 F:44:pin G:50')
const p4 = { kind: 'members' as const, members: b4.members.map((m) => m.id) }
const R4 = {
  RD: { kind: 'reaction' as const, node: 'D', comp: 'y' as const },
  VC: { kind: 'shear' as const, member: 'CD', x: 0 },
  VDl: { kind: 'shear' as const, member: 'CD', x: 8, side: -1 as const },
  MC: { kind: 'moment' as const, member: 'CD', x: 0 },
  MD: { kind: 'moment' as const, member: 'DE', x: 0 },
}
const ild4 = (r: (typeof R4)[keyof typeof R4]) => influenceLine(b4, p4, r)

// ---------------------------------------------------------------- Fig. 5 truss (Q5, Q7)
const t5 = truss(
  'U1:0,12 U2:12,12 U3:24,12 U4:36,12 U5:48,12 U6:60,12 U7:72,12 L0:0,0 L1:6,0 L2:18,0 L3:30,0 L4:36,0 L5:48,0 L6:60,-3 L7:72,-6',
  'U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L6-L7 U1L0=U1-L0 U1-L1 L1-U2 U2-L2 L2-U3 U3-L3 L3-U4 U4-L4 L4-U5 U5-L5 U6L5=U6-L5 U6-L6 U7L6=U7-L6 U7-L7',
  'L0:pin L7:roller',
)
const p5 = { kind: 'panel' as const, nodes: ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7'] }
const ild5 = (m: string) => influenceLine(t5, p5, { kind: 'force', member: m })

// ---------------------------------------------------------------- Q6 beam (Fig. 6)
const b6 = beamOf('A:0 B:20:roller H*:30 E:40 F:50:fixed')
const p6 = { kind: 'members' as const, members: b6.members.map((m) => m.id) }
const V6 = { kind: 'shear' as const, member: 'EF', x: 0 }
const M6 = { kind: 'moment' as const, member: 'EF', x: 0 }

// ---------------------------------------------------------------- Q8 frame (Fig. 7)
const f8 = model(
  'C:0,20 D:10,20 E:22,20 F*:34,20 G:44,20 H:54,20 A:10,0 B:44,12',
  'C-D D-E E-F F-G G-H A-D',
  'A:fixed B:pin',
  [Wv('CD', 0, 10, { label: '10 k/ft' }), Mo('E', -100, '100 k-ft'), F('H', -15, -20, '25 k (3:4)')],
)
f8.members.push({ id: 'GB', i: 'G', j: 'B', truss: true, label: 'link' })
const CH = ['CD', 'DE', 'EF', 'FG', 'GH']

// ---------------------------------------------------------------- Q9 truss (Fig. 8)
const t9 = truss(
  'L0:0,0 L1:15,0 L2:30,0 L3:45,0 L4:60,0 U1:15,10 U2:30,15 U3:45,15 U4:60,15 M2:30,10 M3:45,10',
  'L0-L1 L1-L2 L2-L3 L3-L4 L0-U1 U1-L1 a=U1-L2 b=U1-U2 U2-U3 U3-U4 L2-M2 M2-U2 d=M2-U3 c=M2-L3 L3-M3 M3-U3 M3-U4 M3-L4 U4-L4',
  'L0:roller L4:pin',
  [P('U1', 30, '30k'), P('U2', 30, '30k'), P('U3', 30, '30k'), P('U4', 15, '15k')],
)
const lab9 = { a: 'a', b: 'b', c: 'c', d: 'd' }

// ---------------------------------------------------------------- Q10 beam (Fig. 9)
const b10 = beamOf('A:0:pin B*:10 C:15:roller D:20 E:30:roller F:35')
const p10 = { kind: 'members' as const, members: b10.members.map((m) => m.id) }
const V10 = { kind: 'shear' as const, member: 'DE', x: 0 }
const M10 = { kind: 'moment' as const, member: 'DE', x: 0 }

// ---------------------------------------------------------------- Q11 max reaction theory
const ild11: ILD = { pts: [{ x: 0, y: 1 }, { x: 70, y: 0 }], xmin: 0, xmax: 70 }

// ---------------------------------------------------------------- Q12 cable (Fig. 10)
const loads12: PointLoad[] = [
  { x: 60, P: 3 },
  { x: 160, P: 10 },
  { x: 360, P: 6 },
]
const sagPt12 = (() => {
  // maximum sag is where the simple-beam moment is largest (always under a load)
  const best = loads12.reduce((a, b) => (simpleBeamM(460, b.x, loads12) > simpleBeamM(460, a.x, loads12) ? b : a))
  return best.x
})()
const c12 = cablePointLoads({ L: 460, dh: 0, loads: loads12, sagAt: { x: sagPt12, sag: 70 } })
const EA12 = 30000 * 10
const stretch12 = c12.segs.reduce((s, q) => s + (q.T * q.len) / EA12, 0)

// ---------------------------------------------------------------- Q13 suspension bridge (Fig. 11)
const s13in = { L: 800, h: 60, xh: 400, loads: [{ x: 200, P: 20 }, { x: 300, P: 20 }, { x: 600, P: 40 }] }
const s13 = stiffenedSuspension(s13in)
const s13ext = hangerGirder({ L: 800, panel: 100, q: s13.q, loads: s13in.loads })

// ---------------------------------------------------------------- Q14 suspension cable
const c14 = parabolicCable({ L: 1000, w: 1, h: 1000 / 30, E: 29000, A: 30 })

// ---------------------------------------------------------------- figure helpers
/** polyline cable drawn as pin-ended members between the given points */
export function cableModel(pts: { x: number; y: number }[], loads: PointLoad[], names: string[]): Model {
  const nodes = pts.map((p, k) => ({ id: names[k], x: p.x, y: p.y }))
  const members = pts.slice(1).map((_, k) => ({ id: names[k] + names[k + 1], i: names[k], j: names[k + 1], truss: true, style: 'cable' as const }))
  return {
    nodes,
    members,
    supports: [
      { node: names[0], type: 'pin' },
      { node: names[names.length - 1], type: 'pin' },
    ],
    loads: loads.map((l) => P(names[pts.findIndex((p) => Math.abs(p.x - l.x) < 1e-6)], l.P, `${fmt(l.P)}k`)),
  }
}
const fig12 = cableModel(c12.pts, loads12, ['A', 'B', 'C', 'D', 'E'])

/** suspension bridge sketch: girder (hinged) + hangers + parabolic cable */
export function bridgeModel(L: number, h: number, panels: number, xh: number[], loads: PointLoad[]): Model {
  const lift = h * 0.25
  const xs = Array.from({ length: panels + 1 }, (_, k) => (L * k) / panels)
  const ys = (x: number) => (4 * h * x * (L - x)) / (L * L)
  const g = (x: number) => `g${x}`
  const c = (x: number) => `c${x}`
  const nodes = [
    ...xs.map((x) => ({ id: g(x), x, y: 0, label: '', hinge: xh.includes(x) || undefined })),
    ...xs.map((x) => ({ id: c(x), x, y: lift + h - ys(x), label: '' })),
  ]
  const members = [
    ...xs.slice(1).map((x, k) => ({ id: `G${k}`, i: g(xs[k]), j: g(x) })),
    ...xs.slice(1).map((x, k) => ({ id: `C${k}`, i: c(xs[k]), j: c(x), truss: true, style: 'cable' as const })),
    ...xs.slice(1, -1).map((x) => ({ id: `h${x}`, i: g(x), j: c(x), truss: true, style: 'thin' as const })),
  ]
  return {
    nodes,
    members,
    supports: [
      { node: g(0), type: 'pin' },
      { node: g(L), type: 'roller' },
      { node: c(0), type: 'pin' },
      { node: c(L), type: 'pin' },
    ],
    loads: loads.map((l) => P(g(l.x), l.P, `${fmt(l.P)}k`)),
  }
}
const fig13 = bridgeModel(800, 60, 8, [400], s13in.loads)

function ParabolaFig({ L, h, label }: { L: number; h: number; label: string }) {
  const n = 10
  const pts = Array.from({ length: n + 1 }, (_, k) => ({ x: (L * k) / n, y: -(4 * h * ((L * k) / n) * (L - (L * k) / n)) / (L * L) }))
  const m = cableModel(pts, [], pts.map((_, k) => (k === 0 ? 'A' : k === n ? 'B' : `p${k}`)))
  m.nodes.forEach((q) => (q.label = q.id.startsWith('p') ? '' : q.id))
  return (
    <div>
      <StructureView model={m} showLoads={false} autoDimX={[0, L / 2, L]} maxHeight={200} />
      <p className="text-xs text-faint px-2">{label}</p>
    </div>
  )
}

// ---------------------------------------------------------------- helpers for checks
const ext = (d: ILD) => ildExtremes(d)

export const Q2009: PYQ[] = [
  // =============================================================== SECTION A
  {
    id: '2009-10-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: MK,
    topics: ['wheel'],
    title: 'Max shear 20 ft from the support of a 70 ft span (wheel loads)',
    pages: PA,
    text: `Find the maximum shear force at **20 ft** from the left support of a simply supported beam of **70 ft** span due to the wheel loads shown in Fig. 1 (${T1_TEXT}).`,
    figure: () => <TrainFig span={span70} extra="Section X at 20 ft from A." />,
    checks: () => {
      const e = trainExtremes(ild1, T1)
      return [
        { key: 'vmax', label: 'Maximum positive shear at 20 ft', value: e.max.value, unit: 'k' },
        { key: 'vmin', label: 'Maximum negative shear at 20 ft (as a negative number)', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at 20 ft of a 70 ft simple span: $-\\tfrac{20}{70} = -0.286$ just left, $+\\tfrac{50}{70} = +0.714$ just right of the section, straight lines to zero at the supports.

**Maximum positive shear** → bring the train in from the right (heading left) and stop with a wheel **just right of the section**: as much load as possible on the long positive part, as little as possible on the short negative part. Moving the train one wheel spacing $a$ further left changes the shear by
$$\\Delta V = \\frac{W\\,a}{L} - P_{\\text{crossing}}$$
($W$ = load on the span, $P_{crossing}$ = wheel that jumps from +0.714 to −0.286, losing a full unit). Keep advancing while $\\Delta V > 0$. The heavy 50 k wheels are preceded by two light 12 k wheels, so it pays to let the 12 k wheels cross the section and put the first 50 k wheel at it.`}</Md>
        <TrainOnILD ild={ild1} t={T1} span={[0, 70]} section={20} peak={{ x: 20, side: 1 }} what="shear at 20 ft" />
        <Md>{`**Answer:** $V_{max} = \\mathbf{${fmt(trainExtremes(ild1, T1).max.value)}}$ k (positive). The uniform 5 k/ft trailer is included automatically whenever it reaches the span.`}</Md>
      </div>
    ),
    notes: ['Read from Fig. 1: wheel spacing 4, 12, 6, 6, 6, 12, 6, 6, 6, 12, 4 ft; an 8 ft gap, then a 24 ft long uniform load of 5 k/ft. Train taken as travelling right to left (wheel 1 leads).'],
  },
  {
    id: '2009-10-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: MK,
    topics: ['floor'],
    title: 'Girder with floor beams: ILDs for M₃, M₄ and V in panel 3–4',
    pages: PA,
    text: `Draw influence lines for (a) the bending moment at panel points **3** and **4**, and (b) the shear force in panel **3–4** of the girder with floor beams in Fig. 2.

Girder: pin at 1 (x = 0), roller at 5 (x = 46 ft), overhang to 6 (x = 62 ft). Floor beams at 2 (6 ft), 3 (18 ft), 4 (34 ft), 5 (46 ft), 6 (62 ft). Stringers: 1→26 ft (on floor beams 2, 3, overhanging both ends), 26→46 ft (on 4, 5, overhanging left) and 46→62 ft (on 5, 6).`,
    figure: () => <StructureView model={fs2.model} showLoads={false} autoDimX={[0, 6, 18, 26, 34, 46, 62]} maxHeight={200} />,
    checks: () => [
      { key: 'm3', label: '$M_3$ ordinate, unit load at panel point 3 (x = 18)', value: ildAt(ild2(fs2.moment(18)), 18), unit: 'ft' },
      { key: 'm4', label: '$M_4$ ordinate, unit load at panel point 4 (x = 34)', value: ildAt(ild2(fs2.moment(34)), 34), unit: 'ft' },
      { key: 'v34a', label: '$V_{3-4}$ ordinate, unit load at panel point 4', value: ildAt(ild2(fs2.shear(26)), 34) },
      { key: 'v34b', label: '$V_{3-4}$ ordinate, unit load at the stringer end x = 0', value: ildAt(ild2(fs2.shear(26)), 0) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Loads reach the girder **only through the floor beams**. Each stringer is a simple beam (with overhangs) on two floor beams, so each floor-beam reaction is a **straight line** over the stringer(s) it supports. Procedure: (1) compute the girder effect for a unit load at each floor beam (girder = simple beam 1–5 with overhang 5–6); (2) join those ordinates with straight lines over each stringer, **extending the line over the stringer overhangs** (x = 0–6, 18–26 and 26–34).

E.g. unit load at floor beam 3 (x = 18): $R_1 = 28/46$, so $M_3 = R_1\\cdot18 = ${fmt((28 / 46) * 18, 3)}$ ft and $V_{3-4} = R_1 - 1 = ${fmt(28 / 46 - 1, 4)}$. Panel 3–4 contains no floor beam, so its shear is constant along the panel and the ILD has no jump inside the panel — it changes sign between the floor beams.`}</Md>
        <ILDStack
          model={fs2.model}
          path={fs2.path}
          items={[
            { label: 'M at panel point 3', resp: fs2.moment(18) },
            { label: 'M at panel point 4', resp: fs2.moment(34) },
            { label: 'V in panel 3–4', resp: fs2.shear(26) },
          ]}
        />
      </div>
    ),
    notes: [
      'Fig. 2 shows no floor beam (I-section) under panel point 1 — the first stringer simply overhangs 6 ft to the left of floor beam 2. Panel point 1 is taken as the girder pin support only.',
      'Stringer breaks read at x = 26 ft (8 ft right of panel point 3) and at x = 46 ft (over floor beam 5).',
    ],
  },
  {
    id: '2009-10-A3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: MK,
    topics: ['wheel'],
    title: 'Max reaction at B of a beam with an internal hinge (wheel loads)',
    pages: PA,
    text: `Compute the maximum reaction at support **B** of the beam in Fig. 3 due to the wheel loads of Fig. 1. Beam: roller at A (x = 0), internal hinge D (10 ft), roller B (20 ft), pin C (40 ft).`,
    figure: () => <Figure model={b3} />,
    checks: () => {
      const e = trainExtremes(ild3(), T1)
      return [
        { key: 'peak', label: '$R_B$ ILD ordinate at the hinge D', value: ildAt(ild3(), 10) },
        { key: 'rb', label: 'Maximum reaction at B', value: e.max.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**ILD for $R_B$ (Müller-Breslau).** Lift B by a unit: D–B–C rotates about C, so the ordinate at D (10 ft beyond B, 30 ft from C) is $30/20 = 1.5$; the drop-in span A–D rotates about A, giving a straight line from 0 at A to 1.5 at D. So the ILD is a "tent" with its peak **1.5 at the hinge D**, 1.0 at B and 0 at C.

**Wheel loads.** Put each wheel in turn at the peak (D) and evaluate $\\sum P y$. The slopes are $+1.5/10$ on A–D and $-1.5/30$ on D–C, so the criterion is: moving the train a little to the right increases $R_B$ while $\\tfrac{0.15}{1}W_{AD} > 0.05\\,W_{DC}$, i.e. load on A–D $> \\tfrac13$ of load on D–C.`}</Md>
        <ILDStack model={b3} path={{ kind: 'members', members: b3.members.map((m) => m.id) }} items={[{ label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } }]} />
        <TrainOnILD ild={ild3()} t={T1} span={[0, 40]} peak={{ x: 10, side: 1 }} what="R_B" />
        <Md>{`**Answer:** $R_{B,max} = \\mathbf{${fmt(trainExtremes(ild3(), T1).max.value)}}$ k.`}</Md>
      </div>
    ),
    notes: ['A is drawn as a roller and C as a hinged (pin) support; the result does not depend on which end takes the horizontal reaction.'],
  },
  {
    id: '2009-10-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: MK,
    topics: ['ild'],
    title: 'Beam with overhangs and a hinge: ILDs for R_D, V_C, V_D(left), M_C, M_D',
    pages: PA,
    text: `Draw influence lines for (a) the reaction at **D**, (b) the shear force at **C** and just to the **left of D**, (c) the bending moment at **C** and **D** of the beam in Fig. 4.

Beam: free end A (x = 0), roller B (8 ft), C (16 ft), roller D (24 ft), internal hinge E (32 ft), pin F (44 ft), free end G (50 ft).`,
    figure: () => <Figure model={b4} />,
    checks: () => [
      { key: 'rdA', label: '$R_D$ ordinate with the unit load at A', value: ildAt(ild4(R4.RD), 0) },
      { key: 'rdE', label: '$R_D$ ordinate with the unit load at the hinge E', value: ildAt(ild4(R4.RD), 32) },
      { key: 'mc', label: '$M_C$ ordinate with the unit load at C', value: ildAt(ild4(R4.MC), 16), unit: 'ft' },
      { key: 'mdE', label: '$M_D$ ordinate with the unit load at E', value: ildAt(ild4(R4.MD), 32), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** A–B–C–D–E is a beam on two rollers (B, D) with overhangs A–B and D–E; E–F–G hangs on it at the hinge E and on the pin F. A load on E–G sends $\\tfrac{44-x}{12}$ to E (1 at E, 0 at F, $-0.5$ at G).

**Müller-Breslau sketches.**
- $R_D$: lift D by 1 → A–E rotates about B: 0 at B, 1 at D, $-\\tfrac{8}{16} = -0.5$ at A, $\\tfrac{24}{16} = 1.5$ at E; E–F–G follows to 0 at F and $-0.75$ at G.
- $V_C$: cut at C, unit relative slide with parallel segments: $-\\tfrac{x-8}{16}$ left of C, $+\\tfrac{24-x}{16}$ right (jump 1 at C), extended over the overhangs and through the hinge.
- $V_{D}^{left}$ (section in C–D): load left of the section → $V = R_B - 1 = -\\tfrac{x-8}{16}$ ($+0.5$ at A, $-1$ just left of D); load right of D → $V = R_B = \\tfrac{24-x}{16}$ (0 at D, $-0.5$ at E), then back to 0 at F and $+0.25$ at G through the hinge.
- $M_C$: unit kink at C → peak $\\tfrac{8\\cdot8}{16} = 4$ ft at C.
- $M_D$: hinge at D → only the overhang D–E and the drop-in E–G move: $-(x-24)$ on D–E, $-8$ at E, back to 0 at F.`}</Md>
        <ILDStack
          model={b4}
          path={p4}
          items={[
            { label: 'R_D', resp: R4.RD },
            { label: 'V_C', resp: R4.VC },
            { label: 'V just left of D', resp: R4.VDl },
            { label: 'M_C', resp: R4.MC },
            { label: 'M_D', resp: R4.MD },
          ]}
        />
      </div>
    ),
    notes: ['Read from Fig. 4: all panels 8 ft except E–F = 12 ft and F–G = 6 ft; B and D are rollers, F is a pin.'],
  },
  {
    id: '2009-10-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: MK,
    topics: ['floor'],
    title: 'Truss ILDs: U₂U₃, L₂L₃, U₄U₅, U₆L₅',
    pages: PA,
    text: `Draw influence lines for the bar forces in **U₂U₃, L₂L₃, U₄U₅ and U₆L₅** of the truss in Fig. 5.

Truss: top chord U₁…U₇, 6 @ 12 ft = 72 ft, 12 ft above L₀ (pin under U₁). Bottom chord L₀ (0), L₁ (6), L₂ (18), L₃ (30), L₄ (36), L₅ (48 ft) level; then it slopes down through L₆ to L₇ (72 ft, roller), 18 ft below U₇. Warren web U₁–L₁–U₂–L₂–U₃–L₃–U₄; verticals U₁L₀, U₄L₄, U₅L₅, U₆L₆, U₇L₇; diagonals L₄U₅, L₅U₆, L₆U₇.`,
    figure: () => <Figure model={t5} />,
    checks: () => [
      { key: 'u23', label: 'U₂U₃ ordinate, unit load at U₃ (T +)', value: ildAt(ild5('U2U3'), 24) },
      { key: 'l23', label: 'L₂L₃ ordinate, unit load at U₃ (T +)', value: ildAt(ild5('L2L3'), 24) },
      { key: 'u45', label: 'U₄U₅ ordinate, unit load at U₅ (T +)', value: ildAt(ild5('U4U5'), 48) },
      { key: 'u6l5', label: 'U₆L₅ ordinate, unit load at U₅ (T +)', value: ildAt(ild5('U6L5'), 48) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The deck is on the **top chord**, so loads enter at U₁…U₇ and every ILD is straight between consecutive top panel points. For each bar, cut a section and take moments about the intersection of the other two cut bars (or ΣFy for a diagonal in a parallel-chord panel), once for the unit load left of the cut and once for it right of the cut.

- **U₂U₃**: cut between U₂ and U₃ through U₂U₃, L₂U₃ and L₂L₃; moment about **L₂** (x = 18, 12 ft below): $F = -M_{18}/12$ → always compression (e.g. unit load at U₃: $R_{L_0} = 48/72$, $M_{18} = 12$, $F = -1$).
- **L₂L₃**: same cut, moment about **U₃** (x = 24): $F = +M_{24}/12$ (tension; unit load at U₃ → $16/12 = 1.333$).
- **U₄U₅**: cut U₄U₅, L₄U₅, L₄L₅; moment about **L₄** (x = 36, depth 12): compression.
- **U₆L₅** (diagonal in the sloping-bottom panel): cut U₅U₆, L₅U₆, L₅L₆; chords are not parallel, so take moments about the point where U₅U₆ and L₅L₆ (extended) meet.`}</Md>
        <ILDStack
          model={t5}
          path={p5}
          items={[
            { label: 'F U2U3', resp: { kind: 'force', member: 'U2U3' } },
            { label: 'F L2L3', resp: { kind: 'force', member: 'L2L3' } },
            { label: 'F U4U5', resp: { kind: 'force', member: 'U4U5' } },
            { label: 'F U6L5', resp: { kind: 'force', member: 'U6L5' } },
          ]}
        />
      </div>
    ),
    notes: [
      'The third member in the scan is blurred ("U?U₅"); it is read as U₄U₅.',
      'Loaded chord: the paper does not say "deck" or "through" and Fig. 5 draws no loads or roadway. Loads are taken at the top-chord panel points U₁–U₇ (deck truss) because the top chord is the only straight, level, regularly panelled chord (6 @ 12 ft, the dimension line is drawn along it), while the bottom chord has irregular panels (6, 12, 12, 6, 12 ft) and slopes down from L₅ to L₇ — it cannot carry a level floor. Supports L₀/L₇ are on the bottom chord, as usual for a deck truss.',
      'For reference, if the loads were applied at the bottom-chord points L₀…L₇ instead, the ordinates would be U₂U₃ −1.125 (at L₂), L₂L₃ +1.167 (at L₃), U₄U₅ −1.5 (at L₄), U₆L₅ +1.131 (at L₅).',
      'Geometry: L₆ is taken on the straight line L₅–L₇, i.e. 3 ft below L₅.',
    ],
  },
  {
    id: '2009-10-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: MK,
    topics: ['ild'],
    title: 'Max shear and moment at E (dead + moving uniform + roving load)',
    pages: PA,
    text: `Compute the maximum values of the shear force and bending moment at **E** of the beam in Fig. 6 due to the combined effect of (a) self weight 2 k/ft, (b) a moving uniform live load 5 k/ft, (c) a roving concentrated live load 60 k.

Beam: free end A (x = 0), roller B (20 ft), internal hinge (30 ft), E (40 ft), fixed support F (50 ft).`,
    figure: () => <Figure model={b6} />,
    checks: () => {
      const v = uniformPlusConcentrated(influenceLine(b6, p6, V6), 5, 60, 2)
      const m = uniformPlusConcentrated(influenceLine(b6, p6, M6), 5, 60, 2)
      return [
        { key: 'vpos', label: 'Max positive shear at E (incl. DL)', value: v.maxPos.total, unit: 'k' },
        { key: 'vneg', label: 'Max negative shear at E (incl. DL)', value: v.maxNeg.total, unit: 'k' },
        { key: 'mneg', label: 'Max negative moment at E (incl. DL)', value: m.maxNeg.total, unit: 'k-ft' },
        { key: 'mpos', label: 'Max positive moment at E (incl. DL)', value: m.maxPos.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** The hinge–E–F part is a cantilever from F; A–B–hinge is a beam on the roller B, hung from the cantilever tip at the hinge (30 ft). A unit load at A (20 ft left of B) **lifts** the hinge: hinge force $= -20/10 = -2$ (upward on the cantilever).

**ILDs (look to the left of E):**
- Load on A–hinge: $R_B = \\tfrac{30-x}{10}$, so $V_E = R_B - 1 = \\tfrac{20-x}{10}$ (+2 at A, 0 at B, −1 at the hinge) and $M_E = R_B(20) - 1(40-x) = -(x-20)$ (+20 at A, −10 at the hinge).
- Load between the hinge and E: $V_E = -1$, $M_E = -(40-x)$.
- Load between E and F: nothing acts left of E → $V_E = M_E = 0$.

**Max effect** = dead load × **net** area + live uniform over the area of one sign + 60 k at the largest ordinate of that sign.`}</Md>
        <ILDStack
          model={b6}
          path={p6}
          items={[
            { label: 'V_E', resp: V6 },
            { label: 'M_E', resp: M6 },
          ]}
        />
        <MaxEffect ild={influenceLine(b6, p6, V6)} w={5} P={60} wd={2} label="Shear at E (DL 2 k/ft everywhere)" />
        <MaxEffect ild={influenceLine(b6, p6, M6)} w={5} P={60} wd={2} label="Moment at E" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2009-10-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: MK,
    topics: ['floor'],
    title: 'Max bar force in U₄L₄ and L₃L₄ (dead + uniform + roving load)',
    pages: PA,
    text: `Compute the maximum bar force in **U₄L₄** and **L₃L₄** of the truss in Fig. 5 due to the combined effect of (a) self weight 2 k/ft, (b) moving live load 5 k/ft, (c) roving concentrated live load 60 k.`,
    figure: () => <Figure model={t5} />,
    checks: () => {
      const a = uniformPlusConcentrated(ild5('U4L4'), 5, 60, 2)
      const b = uniformPlusConcentrated(ild5('L3L4'), 5, 60, 2)
      return [
        { key: 'u4l4T', label: 'U₄L₄: max tension (incl. DL)', value: a.maxPos.total, unit: 'k' },
        { key: 'u4l4C', label: 'U₄L₄: max compression (incl. DL, negative)', value: a.maxNeg.total, unit: 'k' },
        { key: 'l34T', label: 'L₃L₄: max tension (incl. DL)', value: b.maxPos.total, unit: 'k' },
        { key: 'l34min', label: 'L₃L₄: minimum force (DL only — the ILD has no negative part, so the bar is never in compression)', value: b.maxNeg.total, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**U₄L₄** (vertical at x = 36): joint L₄ has only U₄L₄ and the diagonal L₄U₅ with vertical components, and the diagonal carries the shear of panel 4–5 (section through U₄U₅, L₄U₅, L₄L₅, chords horizontal). Hence $F_{U_4L_4} = +V_{4-5}$: $-0.5$ with the unit load at U₄, $+\\tfrac{24}{72} = 0.333$ at U₅ — a shear-type ILD that changes sign at x = 43.2 ft.

**L₃L₄** (bottom chord, x = 30–36): section through U₃U₄, L₃U₄, L₃L₄; moments about **U₄** (x = 36, 12 ft up): $F = M_{36}/12$ → tension everywhere (triangle).

Dead load 2 k/ft acts over the whole deck (net area), live 5 k/ft over the part of the ILD with the sign wanted, and 60 k at the peak of that part.`}</Md>
        <ILDStack
          model={t5}
          path={p5}
          items={[
            { label: 'F U4L4', resp: { kind: 'force', member: 'U4L4' } },
            { label: 'F L3L4', resp: { kind: 'force', member: 'L3L4' } },
          ]}
        />
        <MaxEffect ild={ild5('U4L4')} w={5} P={60} wd={2} label="U₄L₄ (tension +)" />
        <MaxEffect ild={ild5('L3L4')} w={5} P={60} wd={2} label="L₃L₄ (tension +)" />
      </div>
    ),
    notes: [
      'Same reading of Fig. 5 as Q5: loads at the top-chord panel points (deck truss) — the top chord is the only level, regularly panelled chord; the bottom chord has irregular panels and slopes from L₅ to L₇. The paper itself does not say deck/through. Dead load is treated as uniform on the deck and delivered through the same panel points.',
      'The second bar is printed blurred ("L?L₄"); read as L₃L₄ (the bottom-chord bar ending at L₄ that the figure dimensions, 6 ft).',
      'For reference, with the loads on the bottom chord (L-points) the answers would be U₄L₄ +85.1 / −53.1 k and L₃L₄ +468 k (unchanged).',
    ],
  },
  // =============================================================== SECTION B
  {
    id: '2009-10-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: MK,
    topics: ['frames'],
    title: 'Frame with hinge and link: reactions, SFD/BMD of CH',
    pages: PB,
    text: `For the frame in Fig. 7, (i) calculate the reactions at the supports, (ii) draw the shear force and bending moment diagrams for member **CH**.

Horizontal member C–D–E–F–G–H at 20 ft height: C (0), D (10 ft), E (22 ft), internal hinge F (34 ft), G (44 ft), H (54 ft). Column D–A fixed at A (20 ft high). G is supported by a vertical link G–B. Loads: triangular load on CD (0 at C to 10 k/ft at D), clockwise couple 100 k-ft at E, 25 k inclined (slope 4 : 3, i.e. 15 k ← and 20 k ↓) at H.`,
    figure: () => <Figure model={f8} />,
    checks: () => {
      const r = solve(f8)
      return [
        { key: 'ay', label: 'Vertical reaction at A (↑ +)', value: r.reaction('A').ry, unit: 'k' },
        { key: 'ax', label: 'Horizontal reaction at A (→ +)', value: r.reaction('A').rx, unit: 'k' },
        { key: 'ma', label: `Moment reaction at A (${rotTag()})`, value: rot(r.reaction('A').m), unit: 'k-ft' },
        { key: 'link', label: 'Link force at G (↑ on the beam +)', value: r.reaction('B').ry, unit: 'k' },
      ]
    },
    solution: () => {
      const r = solve(f8)
      const link = r.reaction('B').ry
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Start at the hinge.** Part F–G–H is free-body with the hinge force at F, the link at G (vertical only) and the 25 k at H. $\\sum M_F = 0$: $R_G(10) - 20(20) = 0 \\Rightarrow R_G = ${fmt(link)}$ k ↑. $\\sum F_y$: the hinge pushes F–G–H **down** with $${fmt(link)} - 20 = ${fmt(link - 20)}$ k, so it pushes the left part **up** with ${fmt(link - 20)} k; $\\sum F_x$: the left part receives 15 k ←.

**Left part** C–D–E–F + column D–A (fixed at A): the triangular load $\\tfrac12(10)(10) = 50$ k acts $\\tfrac{10}{3}$ ft left of D, the couple 100 k-ft (clockwise) at E, and the hinge force at F. Three equilibrium equations give the fixed-end reactions at A.`}</Md>
          <FrameSolution model={f8} only={CH} />
          <Md>{`**Answers:** $A_x = ${fmt(Math.abs(r.reaction('A').rx))}$ k ${r.reaction('A').rx > 0 ? '→' : '←'}, $A_y = ${fmt(Math.abs(r.reaction('A').ry))}$ k ${r.reaction('A').ry > 0 ? '↑' : '↓'}, $M_A = ${fmt(Math.abs(r.reaction('A').m))}$ k-ft ${r.reaction('A').m > 0 ? '(ccw)' : '(cw)'}, link force $= ${fmt(link)}$ k. The BMD of CH is zero at C, at the hinge F and at H; the couple at E causes a jump of 100 k-ft.`}</Md>
        </div>
      )
    },
    notes: ['The couple at E is read as clockwise and the 25 k force at H as pointing down-and-left (arrowhead at H).', 'The link G–B is a two-force member: it gives only a vertical force at G.'],
  },
  {
    id: '2009-10-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: MK,
    topics: ['truss'],
    title: 'Truss with K-type panels: forces in a, b, c, d',
    pages: PB,
    text: `Determine the bar forces in members **a, b, c, d** of the truss in Fig. 8.

Span 4 @ 15 ft = 60 ft, roller at the left end, pin at the right end. Top joints: 10 ft high at 15 ft, 15 ft high at 30, 45 and 60 ft. The verticals at 30 ft and 45 ft have a mid-joint at 10 ft height. Loads 30, 30, 30 k at the top joints at 15, 30, 45 ft and 15 k at the top joint at 60 ft. a = diagonal from (15, 10) to (30, 0); b = top chord (15, 10)–(30, 15); c = (30, 10)–(45, 0); d = (30, 10)–(45, 15).`,
    figure: () => <Figure model={t9} labels={lab9} />,
    checks: () => {
      const r = solve(t9)
      return (['a', 'b', 'c', 'd'] as const).map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Reactions: the 15 k at the right top joint goes straight into the pin. $\\sum M_{right} = 0$ → $R_{left} = \\dfrac{30(45) + 30(30) + 30(15)}{60} = 45$ k.

- **a, b**: section through b, a and the bottom chord L₁L₂ — moments about L₂ (30, 0) give b (only b and the reaction/load have arms), then about U₁ for the bottom chord and ΣFy for a.
- **c, d**: the K-panel 30–45 (chords parallel there). A vertical section cuts the top chord U₂U₃, d, c and L₂L₃ — four bars, so combine it with **joint M₂** (30, 10): the vertical M₂U₂/L₂M₂ carry no horizontal force, so ΣFx at M₂ gives $d\\cos\\theta_d + c\\cos\\theta_c = 0$ (equal and opposite horizontal components); ΣFy of the section gives the vertical components summing to the panel shear $45 - 30 - 30 = -15$ k.`}</Md>
        <TrussSolution model={t9} asked={['a', 'b', 'c', 'd']} />
      </div>
    ),
    notes: ['Geometry read from Fig. 8: right-hand height 15 ft split 10 + 5 ft; the left top chord rises from the support to (15, 10) and then to (30, 15).'],
  },
  {
    id: '2009-10-B10',
    paper: PAPER,
    sec: 'B',
    no: '10',
    marks: MK,
    topics: ['ild'],
    title: 'Max shear and moment at D (DL 3 k/ft, LL 5 k/ft + 90 k)',
    pages: PB,
    text: `Compute the maximum shear and moment at section **D** of the beam in Fig. 9 due to a dead load of 3 k/ft and a moving uniform load of 5 k/ft combined with a roving concentrated load of 90 k.

Beam: pin A (x = 0), internal hinge B (10 ft), roller C (15 ft), D (20 ft), roller E (30 ft), free end F (35 ft).`,
    figure: () => <Figure model={b10} />,
    checks: () => {
      const v = uniformPlusConcentrated(influenceLine(b10, p10, V10), 5, 90, 3)
      const m = uniformPlusConcentrated(influenceLine(b10, p10, M10), 5, 90, 3)
      return [
        { key: 'vpos', label: 'Max positive shear at D (incl. DL)', value: v.maxPos.total, unit: 'k' },
        { key: 'vneg', label: 'Max negative shear at D (incl. DL)', value: v.maxNeg.total, unit: 'k' },
        { key: 'mpos', label: 'Max positive moment at D (incl. DL)', value: m.maxPos.total, unit: 'k-ft' },
        { key: 'mneg', label: 'Max negative moment at D (incl. DL)', value: m.maxNeg.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** B–C–D–E–F is a beam on rollers C and E (span 15 ft) with overhangs 5 ft each side; A–B is a drop-in span pinned at A and hung on the overhang tip B.

**ILDs at D** (5 ft right of C, 10 ft left of E): for a load on C–E, $V_D$ and $M_D$ are the simple-span values ($+\\tfrac{30-x}{15}$ / $-\\tfrac{x-15}{15}$; peak $M = 5\\times10/15 = 3.33$ ft). Over the overhangs the lines extend; on A–B the load reaches B as $x/10$, so the ordinates fall linearly to zero at A.`}</Md>
        <ILDStack
          model={b10}
          path={p10}
          items={[
            { label: 'V_D', resp: V10 },
            { label: 'M_D', resp: M10 },
          ]}
        />
        <MaxEffect ild={influenceLine(b10, p10, V10)} w={5} P={90} wd={3} label="Shear at D" />
        <MaxEffect ild={influenceLine(b10, p10, M10)} w={5} P={90} wd={3} label="Moment at D" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2009-10-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: MK,
    topics: ['wheel'],
    title: 'Criterion for maximum reaction under moving concentrated loads',
    pages: [10],
    text: `Derive the criterion for "maximum reaction" of a simply supported beam of span **L** due to a set of moving concentrated loads.`,
    figure: () => <Figure model={beamOf('A:0:pin B:70:roller')} />,
    checks: () => [{ key: 'ra', label: 'Worked check: max left reaction of a 70 ft span under the Fig. 1 train', value: trainExtremes(ild11, T1).max.value, unit: 'k' }],
    solution: () => {
      const d = offsets(T1)
      const rows = T1.P.slice(0, 6).map((_, k) => ({ k, v: place(ild11, T1, -d[k], -1).value }))
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**ILD.** For the left reaction $R_A$ of a simple span, the ILD is a straight line from 1 at A to 0 at B: $y(x) = (L-x)/L$. For loads $P_i$ at $x_i$:
$$R_A = \\sum P_i \\frac{L - x_i}{L}$$

**Move the train.** Let the train move a distance $\\Delta x$ **toward A** with no wheel entering or leaving. Each ordinate grows by $\\Delta x/L$, so
$$\\Delta R_A = \\frac{W\\,\\Delta x}{L}\\quad (W = \\text{total load on the span}) > 0.$$
$R_A$ therefore keeps increasing as long as wheels stay on — the maximum must occur with **a wheel at the support A** (just before it leaves the span).

**Compare consecutive wheels at A.** Let wheel 1 ($P_1$) be at A. Move the train a distance $a$ (= spacing of wheels 1 and 2) so that wheel 2 comes to A. Wheel 1 leaves the span (its ordinate drops from 1 to 0 — loss $P_1$), every other wheel gains $a/L$ (plus any load $\\Delta W$ that enters at B, gaining less):
$$\\Delta R_A = \\frac{W' a}{L} - P_1$$
where $W'$ = load on the span **after** the move (excluding the wheel that left, including new wheels — conservative to count them with the full gain).

**Criterion:** put wheel 2 at A instead of wheel 1 if $\\dfrac{W'}{L} > \\dfrac{P_1}{a}$; continue with wheel 3, 4, … and stop at the first wheel for which $\\dfrac{W'\\,a}{L} < P_{\\text{leaving}}$. In words: **the maximum reaction occurs with a wheel at the support such that the average load per foot on the span is less than the load of the wheel that would leave divided by the distance it would have to move.** In practice the first heavy wheel of a group usually governs.`}</Md>
          <Md>{`**Worked check** (Fig. 1 train on a 70 ft span, train heading left, wheel k at A):`}</Md>
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Wheel at A</th>
                <th>R_A (k)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.k}>
                  <td className="txt">Wheel {r.k + 1}</td>
                  <td>{fmt(r.v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TrainOnILD ild={ild11} t={T1} span={[0, 70]} peak={{ x: 0, side: 1 }} what="R_A" />
        </div>
      )
    },
    notes: ['The question is theoretical; the worked check (70 ft span, Fig. 1 loads) is added only to illustrate the criterion.'],
  },
  {
    id: '2009-10-B12',
    paper: PAPER,
    sec: 'B',
    no: '12',
    marks: MK,
    topics: ['cable'],
    title: 'Cable with three point loads: segment stresses and length',
    pages: PB,
    text: `For the cable in Fig. 10, compute (i) the cable stresses in the various segments, (ii) the cable length. Given: maximum sag = 70 ft, $E = 30{,}000$ ksi, $A = 10$ in².

Supports A and E at the same level, 460 ft apart; loads 3 k at B (60 ft from A), 10 k at C (160 ft) and 6 k at D (360 ft).`,
    figure: () => <Figure model={fig12} />,
    checks: () => [
      { key: 'H', label: 'Horizontal tension H', value: c12.H, unit: 'k' },
      { key: 'smax', label: 'Largest segment stress', value: c12.Tmax / 10, unit: 'ksi', tol: 0.02 },
      { key: 'len', label: 'Cable length A→E', value: c12.length, unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**General cable theorem:** at any point, $H\\cdot y = M_{beam}$, where $y$ is the sag below the chord and $M_{beam}$ the moment of the same loads on a simple beam of the same span. The maximum sag occurs where $M_{beam}$ is maximum (under a load).

Simple-beam reaction at A: $R_A = \\dfrac{3(400) + 10(300) + 6(100)}{460} = ${fmt((3 * 400 + 10 * 300 + 6 * 100) / 460, 4)}$ k.
$M_B = ${fmt(simpleBeamM(460, 60, loads12))}$, $M_C = ${fmt(simpleBeamM(460, 160, loads12))}$, $M_D = ${fmt(simpleBeamM(460, 360, loads12))}$ k-ft → maximum at **${sagPt12 === 160 ? 'C' : sagPt12 === 60 ? 'B' : 'D'}**, so the 70 ft sag is there:
$$H = \\frac{${fmt(simpleBeamM(460, sagPt12, loads12))}}{70} = \\mathbf{${fmt(c12.H, 3)}}\\ \\text{k}$$
Sags at the other loads: $y = M/H$. Segment tension $T = H\\sqrt{1 + (\\Delta y/\\Delta x)^2} = H\\,\\ell/\\Delta x$; stress $= T/A$.`}</Md>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Δx (ft)</th>
              <th>Δy (ft)</th>
              <th>Length (ft)</th>
              <th>T (k)</th>
              <th>Stress T/A (ksi)</th>
            </tr>
          </thead>
          <tbody>
            {c12.segs.map((s, k) => (
              <tr key={k}>
                <td className="txt">{'ABCDE'[k] + 'ABCDE'[k + 1]}</td>
                <td>{fmt(s.dx)}</td>
                <td>{fmt(s.dy, 3)}</td>
                <td>{fmt(s.len, 3)}</td>
                <td>{fmt(s.T, 3)}</td>
                <td>{fmt(s.T / 10, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Md>{`**Cable length** $= \\sum \\ell = \\mathbf{${fmt(c12.length, 3)}}$ ft. (With the given E and A the elastic stretch is $\\sum T\\ell/EA = ${fmt(stretch12 * 12, 4)}$ in — negligible, so the unstressed length is ${fmt(c12.length - stretch12, 3)} ft.)`}</Md>
      </div>
    ),
    notes: ['Fig. 10 dimensions read as 60, 100, 200, 100 ft (span 460 ft) with the supports at the same level (dashed chord A–E horizontal).'],
  },
  {
    id: '2009-10-B13',
    paper: PAPER,
    sec: 'B',
    no: '13',
    marks: MK,
    topics: ['cable'],
    title: 'Suspension bridge with 3-hinged stiffening girder: hanger force & BMD',
    pages: PB,
    text: `Find the hanger force and draw the bending moment diagram for the stiffening girders of the bridge in Fig. 11.

Span 8 @ 100 ft = 800 ft, cable sag 60 ft, stiffening girder hinged at both towers and at mid-span. Loads 20 k at 200 ft, 20 k at 300 ft and 40 k at 600 ft from the left tower.`,
    figure: () => <StructureView model={fig13} autoDimX={[0, 100, 200, 300, 400, 500, 600, 700, 800]} maxHeight={240} />,
    checks: () => [
      { key: 'H', label: 'Horizontal cable tension H', value: s13.H, unit: 'k' },
      { key: 'hang', label: 'Hanger force (100 ft spacing)', value: s13.q * 100, unit: 'k' },
      { key: 'mmax', label: 'Max positive girder moment', value: s13ext.max.M, unit: 'k-ft' },
      { key: 'mmin', label: 'Max negative girder moment', value: s13ext.min.M, unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`A parabolic cable carries a **uniform** hanger load $q$ (per ft) on the girder: $q = 8Hh/L^2$. The girder moment is the simple-beam moment of the applied loads minus the effect of $q$, i.e. $M(x) = M_0(x) - H\\,y(x)$. The central hinge gives $M(400) = 0$:
$$R_{left} = \\frac{20(600) + 20(500) + 40(200)}{800} = ${fmt((20 * 600 + 20 * 500 + 40 * 200) / 800)}\\ \\text{k},\\quad M_0(400) = ${fmt(s13.M0h)}\\ \\text{k-ft}$$`}</Md>
        <SuspensionSolution L={800} h={60} xh={400} loads={s13in.loads} panel={100} marks={[0, 100, 200, 300, 400, 500, 600, 700, 800]} />
        <Md>{`**Answers:** hanger force $= q \\times 100 = \\mathbf{${fmt(s13.q * 100, 3)}}$ k each; girder moments range from ${fmt(s13ext.min.M)} k-ft (at x ≈ ${fmt(s13ext.min.x, 0)} ft) to ${fmt(s13ext.max.M)} k-ft (at x ≈ ${fmt(s13ext.max.x, 0)} ft), with zero at both towers and at the central hinge. Girder reactions at the towers (7 hangers; each end half-panel goes straight to its tower): ${fmt(s13ext.RA, 3)} k at the left and ${fmt(s13ext.RB, 3)} k at the right (minus = downward, so that end must be anchored).`}</Md>
      </div>
    ),
    notes: ['Load positions read from Fig. 11: the 20 k loads hang under the 2nd and 3rd hangers (200, 300 ft) and the 40 k under the 6th (600 ft). The girder is hinged at the towers and at mid-span (circles in the figure).'],
  },
  {
    id: '2009-10-B14',
    paper: PAPER,
    sec: 'B',
    no: '14',
    marks: MK,
    topics: ['cable'],
    title: 'Suspension cable 1000 ft, sag 1/30: T_max, stretch, unstressed length',
    pages: [10],
    text: `The cable of a suspension bridge with a main span of **1000 ft** and sag ratio **1/30** carries a uniformly distributed load of **1000 lb per horizontal foot**. Calculate (i) the maximum cable tension, (ii) the cable stretch, (iii) the unstressed length of the cable. $E = 29{,}000$ ksi, $A = 30$ in².`,
    figure: () => <ParabolaFig L={1000} h={1000 / 30} label="Parabolic cable, span 1000 ft, sag h = 33.33 ft, w = 1 k/ft (supports level)." />,
    checks: () => [
      { key: 'H', label: 'Horizontal tension H', value: c14.H, unit: 'k' },
      { key: 'T', label: 'Maximum cable tension', value: c14.Tmax, unit: 'k' },
      { key: 'dL', label: 'Elastic stretch', value: c14.stretch, unit: 'ft', tol: 0.02 },
      { key: 'L0', label: 'Unstressed length', value: c14.length - c14.stretch, unit: 'ft', tol: 0.005 },
    ],
    solution: () => {
      const n = 1 / 30
      const Lser = 1000 * (1 + (8 / 3) * n * n - (32 / 5) * n ** 4)
      const dLf = ((c14.H * 1000) / (29000 * 30)) * (1 + (16 / 3) * n * n)
      return (
        <div className="space-y-2 text-sm">
          <Tex block>{`h = \\frac{1000}{30} = 33.33\\text{ ft},\\quad H = \\frac{wL^2}{8h} = \\frac{1(1000)^2}{8(33.33)} = ${fmt(c14.H)}\\text{ k},\\quad V = \\frac{wL}{2} = 500\\text{ k}`}</Tex>
          <Tex block>{`T_{max} = \\sqrt{H^2 + V^2} = \\sqrt{${fmt(c14.H)}^2 + 500^2} = \\mathbf{${fmt(c14.Tmax)}}\\text{ k}`}</Tex>
          <Md>{`**Length** (series, $n = h/L = 1/30$): $S = L\\left(1 + \\tfrac83n^2 - \\tfrac{32}{5}n^4\\right) = ${fmt(Lser, 3)}$ ft (exact integration: ${fmt(c14.length, 3)} ft).`}</Md>
          <Tex block>{`\\Delta L = \\int\\frac{T\\,ds}{AE} = \\frac{HL}{AE}\\left(1 + \\frac{16}{3}n^2\\right) = \\frac{${fmt(c14.H)}(1000)}{30(29000)}\\left(1 + \\frac{16}{3}\\cdot\\frac{1}{900}\\right) = \\mathbf{${fmt(dLf, 4)}}\\text{ ft} = ${fmt(dLf * 12, 3)}\\text{ in}`}</Tex>
          <Tex block>{`S_0 = S - \\Delta L = ${fmt(c14.length, 3)} - ${fmt(c14.stretch, 4)} = \\mathbf{${fmt(c14.length - c14.stretch, 3)}}\\text{ ft}`}</Tex>
        </div>
      )
    },
    notes: ['"Mid-span of 1000 ft" is read as the main (centre) span of 1000 ft; supports at the same level.'],
  },
]

void ext
