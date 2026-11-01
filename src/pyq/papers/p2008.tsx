// 2008-09 term final (held 22 Mar 2010) — 14 questions × 21 marks (answer 5 + 5).
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { isCW, rot, rotTag } from '../../engine/sign'
import { influenceLine, ildAt, ildExtremes, type ILD, type Response } from '../../engine/ild'
import { trainExtremes, ssShearILD, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { cablePointLoads, hangerGirder, parabolicCable, stiffenedSuspension, simpleBeamM, type PointLoad } from '../../engine/cable'
import { beamOf, floorSystem, H, model, Mo, P, truss, Wv, Wx } from '../../kit/builders'
import { Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrainTable, TrussSolution } from '../../kit/solutions'
import { SuspensionSolution } from '../../kit/cables'
import { Md, Tex } from '../../components/ui'
import { StructureView } from '../../components/StructureView'
import { fmt } from '../../components/DiagramView'
import { bridgeModel, cableModel } from './p2009'

const PAPER = '2008-09' as const
const MK = 21
const PA = [5, 7]
const PB = [6, 8]

// ---------------------------------------------------------------- Q1 beam (Fig. 1)
const b1 = beamOf('C:0:fixed A:4 H*:10 B:15 D:20:roller E:26')
const p1 = { kind: 'members' as const, members: b1.members.map((m) => m.id) }
const R1 = {
  MA: { kind: 'moment' as const, member: 'AH', x: 0 },
  MB: { kind: 'moment' as const, member: 'BD', x: 0 },
  VA: { kind: 'shear' as const, member: 'AH', x: 0 },
  VB: { kind: 'shear' as const, member: 'BD', x: 0 },
  RD: { kind: 'reaction' as const, node: 'D', comp: 'y' as const },
}
const ild1 = (r: Response) => influenceLine(b1, p1, r)

// ---------------------------------------------------------------- Q2 floor beam system (Fig. 2)
const fs2 = floorSystem({
  floorBeams: [0, 12, 24, 36, 48, 60],
  stringers: [
    [0, 18],
    [18, 42],
    [42, 66],
  ],
  supports: [
    { x: 12, type: 'pin' },
    { x: 60, type: 'roller' },
  ],
  names: { 0: '1', 12: '2', 24: '3', 36: '4', 48: '5', 60: '6', 66: '7' },
})
const ild2 = (r: Response) => influenceLine(fs2.model, fs2.path, r)

// ---------------------------------------------------------------- Fig. 3 wheel loads
const T3: Train = {
  P: [12, 12, 48, 48, 48, 48, 48, 48, 12, 12],
  gaps: [4, 10, 6, 6, 12, 6, 6, 10, 4],
  udl: { w: 5, gap: 8 },
}
const T3_TEXT = '12, 12, 48, 48, 48, 48, 48, 48, 12, 12 k at spacings 4, 10, 6, 6, 12, 6, 6, 10, 4 ft, followed 8 ft behind the last wheel by a uniform load of 5 k/ft'
const ild3 = ssShearILD(80, 20)
const ild5: ILD = { pts: [{ x: 0, y: 0 }, { x: 40, y: 1 }, { x: 100, y: 0 }], xmin: 0, xmax: 100 }

function TrainFig({ span, note }: { span: ReturnType<typeof beamOf>; note?: string }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-mute font-semibold">Fig. 3 — wheel loads (wheel 1 at the left; 5 k/ft uniform load trailing 8 ft behind wheel 10)</div>
      <TrainTable t={T3} />
      <Figure model={span} />
      {note && <p className="text-xs text-faint">{note}</p>}
    </div>
  )
}

// ---------------------------------------------------------------- Fig. 4 truss (Q4, Q6)
const T4N = 'L0:0,0 L1:16,0 L2:32,0 L3:48,0 L4:64,0 L5:80,0 L6:96,0 L7:112,0 L8:128,0 L9:144,0 U1:16,10 U2:32,20 U3:48,20 U4:64,20 U5:80,18 U6:96,16 U7:104,16 U8:120,16 U9:136,16'
const T4M = 'L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L6-L7 L7-L8 L8-L9 L0-U1 U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 U7-U8 U8-U9 U1-L1 U2-L2 U3-L3 U4-L4 U5-L5 U6-L6 U1-L2 L2-U3 DIAG U4-L5 U5-L6 L6-U7 U7-L7 L7-U8 U8-L8 L8-U9 U9-L9'
const t4 = truss(T4N, T4M.replace('DIAG', 'L3-U4'), 'L0:pin L9:roller')
/** same truss with the counter U3L4 acting instead of the main diagonal L3U4 (tension-only diagonals) */
const t4c = truss(T4N, T4M.replace('DIAG', 'U3-L4'), 'L0:pin L9:roller')
const p4 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'] }
const ild4 = (m: string) => influenceLine(t4, p4, { kind: 'force', member: m })
const ild4c = () => influenceLine(t4c, p4, { kind: 'force', member: 'U3L4' })

// ---------------------------------------------------------------- Q7 beam (Fig. 6)
const b7 = beamOf('O:0 A:4:roller H*:10 B:20:roller C:30 D:40:pin')
const p7 = { kind: 'members' as const, members: b7.members.map((m) => m.id) }
const V7 = { kind: 'shear' as const, member: 'CD', x: 0 }
const M7 = { kind: 'moment' as const, member: 'CD', x: 0 }

// ---------------------------------------------------------------- Q8 cable with point loads
const loads8: PointLoad[] = [
  { x: 80, P: 100 },
  { x: 200, P: 200 },
  { x: 300, P: 80 },
]
const c8 = cablePointLoads({ L: 400, dh: 50, loads: loads8, sagAt: { x: 200, sag: 50 * (200 / 400) + 81 - 50 } })
const EA8 = 30000 * 10
const seg8 = c8.segs.map((s) => ({ ...s, dL: (s.T * s.len) / EA8 }))
const stretch8 = seg8.reduce((a, s) => a + s.dL, 0)
const fig8 = cableModel(c8.pts, loads8, ['A', 'B', 'C', 'D', 'E'])

// ---------------------------------------------------------------- Q9 inclined parabolic cable
const c9 = parabolicCable({ L: 500, w: 2, h: 25, dh: 50 })
/** lowest point: y' = 0 → x = L/2 − dh·L/(8h) (engine's xLow has the opposite sign) */
const xLow9 = 500 / 2 - (50 * 500) / (8 * 25)
const fig9 = (() => {
  const n = 10
  const pts = Array.from({ length: n + 1 }, (_, k) => ({ x: 50 * k, y: c9.y(50 * k) }))
  const m = cableModel(pts, [], pts.map((_, k) => (k === 0 ? 'A' : k === n ? 'B' : `p${k}`)))
  m.nodes.forEach((q) => (q.label = q.id.startsWith('p') ? '' : q.id))
  return m
})()

// ---------------------------------------------------------------- Q10 suspension bridge (Fig. 7)
const s10in = { L: 1000, h: 100, xh: 500, loads: [{ x: 300, P: 20 }, { x: 600, P: 20 }] }
const s10 = stiffenedSuspension(s10in)
const s10ext = hangerGirder({ L: 1000, panel: 100, q: s10.q, loads: s10in.loads })
const fig10 = bridgeModel(1000, 100, 10, [500], s10in.loads)

// ---------------------------------------------------------------- Q11 beam (Fig. 8)
const b11 = beamOf('A:0:pin X:6 M:10 B:20:roller C*:28 D:44:roller')
const p11 = { kind: 'members' as const, members: b11.members.map((m) => m.id) }
const R11 = {
  V6: { kind: 'shear' as const, member: 'XM', x: 0 },
  VBl: { kind: 'shear' as const, member: 'MB', x: 10, side: -1 as const },
  Mmid: { kind: 'moment' as const, member: 'MB', x: 0 },
}
const ild11 = (r: Response) => influenceLine(b11, p11, r)

// ---------------------------------------------------------------- Q12 frame (Fig. 9)
const f12 = model(
  'J:0,7 C:0,15 I:0,23 D:10,15 E:26,15 F*:36,15 G:46,15 H:58,15 A:10,0 K:46,10 B:46,5',
  'J-C C-I C-D D-E E-F F-G G-H A-D B-K K-G',
  'A:fixed B:roller',
  [Mo('I', -50, '50 k-ft'), Wx('JC', 10, undefined, { label: '10 k/ft' }), P('E', 70, '70k'), Wv('GH', 10, 0, { label: '10 k/ft' }), H('K', -20, '20k')],
)
const CH = ['CD', 'DE', 'EF', 'FG', 'GH']
const IJ = ['JC', 'CI']

// ---------------------------------------------------------------- Q13 truss (Fig. 10)
const t13 = truss(
  'L0:0,0 L1:20,0 L2:40,0 L3:60,0 L4:80,0 L5:100,0 L6:120,0 P1:20,15 P2:40,18 M40:40,10 T60:60,20 T70:70,20 T80:80,20 T90:90,20 T100:100,20 T110:110,20 T120:120,20 M70:70,10 M90:90,10 M110:110,10',
  'L0-L1 L1-L2 L2-L3 L3-L4 L4-L5 L5-L6 L0-P1 P1-P2 P2-T60 T60-T70 T70-T80 T80-T90 T90-T100 T100-T110 T110-T120 P1-L1 P1-L2 L2-M40 M40-P2 a=M40-T60 b=M40-L3 L3-T60 T60-M70 M70-T70 L3-M70 M70-T80 T80-L4 T80-M90 M90-T90 L4-M90 M90-T100 T100-L5 d=T100-M110 M110-T110 L5-M110 c=M110-T120 T120-L6',
  'L0:roller L6:pin',
  [P('P1', 20, '20k'), P('P2', 20, '20k'), P('T60', 15, '15k'), P('T70', 10, '10k'), P('T80', 10, '10k'), P('T90', 10, '10k'), P('T100', 10, '10k'), P('T110', 10, '10k'), P('T120', 5, '5k')],
)
t13.nodes.forEach((n) => {
  if (!['L0', 'L6'].includes(n.id)) n.label = ''
})
const lab13 = { a: 'a', b: 'b', c: 'c', d: 'd' }

// ---------------------------------------------------------------- Q14 frame with tie rod (Fig. 11)
const f14 = model('B:0,0 S:0,5 C:0,10 E:0,15 D:20,10 A:-15,0', 'B-S S-C C-E C-D AE=A-E', 'B:pin A:pin')
f14.members.find((m) => m.id === 'AE')!.truss = true
f14.nodes.find((n) => n.id === 'S')!.label = '1-1'
const p14 = { kind: 'members' as const, members: ['CD'] }
const R14 = {
  T: { kind: 'force' as const, member: 'AE' },
  RB: { kind: 'reaction' as const, node: 'B', comp: 'y' as const },
  M11: { kind: 'moment' as const, member: 'SC', x: 0 },
}
const ild14 = (r: Response) => influenceLine(f14, p14, r)

export const Q2008: PYQ[] = [
  // =============================================================== SECTION A
  {
    id: '2008-09-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: MK,
    topics: ['ild'],
    title: 'Cantilever + suspended span: ILDs for M_A, M_B, V_A, V_B, R_D',
    pages: PA,
    text: `Draw influence lines for (a) the bending moment at **A**, (b) the bending moment at **B**, (c) the shear force at **A**, (d) the shear force at **B**, and (e) the vertical reaction at **D** for the beam in Fig. 1.

Beam: fixed at C (x = 0), A at 4 ft, internal hinge at 10 ft, B at 15 ft, roller D at 20 ft, free end E at 26 ft.`,
    figure: () => <Figure model={b1} />,
    checks: () => [
      { key: 'mah', label: '$M_A$ ordinate, unit load at the hinge', value: ildAt(ild1(R1.MA), 10), unit: 'ft' },
      { key: 'mae', label: '$M_A$ ordinate, unit load at E', value: ildAt(ild1(R1.MA), 26), unit: 'ft' },
      { key: 'mb', label: '$M_B$ ordinate, unit load at B', value: ildAt(ild1(R1.MB), 15), unit: 'ft' },
      { key: 'rde', label: '$R_D$ ordinate, unit load at E', value: ildAt(ild1(R1.RD), 26) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** C–A–hinge is a cantilever fixed at C. Hinge–B–D–E is a beam resting on the hinge (the cantilever tip) and the roller D, overhanging 6 ft to E. A unit load at $x$ on hinge–E sends $\\tfrac{20-x}{10}$ to the hinge (1 at the hinge, 0 at D, $-0.6$ at E) and $R_D = \\tfrac{x-10}{10}$ (1.6 at E).

- $M_A$: load on C–A → 0; on A–hinge → $-(x-4)$ (−6 at the hinge); on hinge–E → $-6\\times\\tfrac{20-x}{10}$: 0 at D, **+3.6** at E.
- $V_A$ (just right of A, forces to the right): 0 for load on C–A; +1 on A–hinge; $\\tfrac{20-x}{10}$ on hinge–E (−0.6 at E).
- $M_B$, $V_B$: only the suspended span moves. Simple span hinge–D (10 ft) with B at mid-span: $M_B$ peak $5\\times5/10 = 2.5$ ft, $-3$ at E; $V_B$: $-\\tfrac{x-10}{10}$ left of B, $+\\tfrac{20-x}{10}$ right (jump 1 at B), $-0.6$ at E.
- $R_D$: 0 on the cantilever, straight line 0 → 1 (at D) → 1.6 (at E).`}</Md>
        <ILDStack
          model={b1}
          path={p1}
          items={[
            { label: 'M_A', resp: R1.MA },
            { label: 'M_B', resp: R1.MB },
            { label: 'V_A', resp: R1.VA },
            { label: 'V_B', resp: R1.VB },
            { label: 'R_D', resp: R1.RD },
          ]}
        />
      </div>
    ),
    notes: ['Read from Fig. 1: C–A 4 ft, A–hinge 6 ft, hinge–B 5 ft, B–D 5 ft, D–E 6 ft; C is fixed, D is a roller. Shears follow the textbook sign (left part pushed up = +).'],
  },
  {
    id: '2008-09-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: MK,
    topics: ['floor'],
    title: 'Girder with floor beams and overhanging stringers: V₄₋₅, M₅, M₂',
    pages: PA,
    text: `Draw influence lines for (a) the shear in panel **4–5**, (b) the bending moment at panel point **5**, (c) the bending moment at panel point **2** of the girder with floor-beam system in Fig. 2.

Floor beams at panel points 1–6 (x = 0, 12, 24, 36, 48, 60 ft); girder supported at 2 (pin) and 6 (roller), extending from 1 (x = 0) to 7 (x = 66). Stringers: 0 → 18 ft (on floor beams 1, 2), 18 → 42 ft (on 3, 4, overhanging 6 ft at each end) and 42 → 66 ft (on 5, 6, overhanging 6 ft past 6).`,
    figure: () => <StructureView model={fs2.model} showLoads={false} autoDimX={[0, 12, 18, 24, 36, 42, 48, 60, 66]} maxHeight={200} />,
    checks: () => [
      { key: 'v4', label: '$V_{4-5}$ ordinate, unit load at 4 (x = 36)', value: ildAt(ild2(fs2.shear(42)), 36) },
      { key: 'v5', label: '$V_{4-5}$ ordinate, unit load at 5 (x = 48)', value: ildAt(ild2(fs2.shear(42)), 48) },
      { key: 'm5', label: '$M_5$ ordinate, unit load at 5', value: ildAt(ild2(fs2.moment(48)), 48), unit: 'ft' },
      { key: 'm2', label: '$M_2$ ordinate, unit load at 1 (x = 0)', value: ildAt(ild2(fs2.moment(12)), 0), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`The girder is a beam on supports 2 (x = 12) and 6 (x = 60) — span 48 ft — with overhangs to 1 (12 ft) and 7 (6 ft). Loads reach it only at the floor beams, so: (1) find the girder ordinate for a unit load at each floor beam; (2) join them by straight lines **over each stringer**, extending the line over the stringer overhangs (12–18, 18–24, 36–42, 60–66).

- **$V_{4-5}$**: unit load at a floor beam left of the panel → $V = R_2 - 1$ (beam 1 at x = 0: $R_2 = 60/48$, $V = +0.25$); right of it → $V = R_2$. At 4: $R_2 - 1 = \\tfrac{24}{48} - 1 = -0.5$; at 5: $\\tfrac{12}{48} = 0.25$.
- **$M_5$**: unit load at a floor beam → $M_5 = R_6 \\times 12$ (load left of 5) or $R_2\\times36$; at 5: $\\tfrac{36\\times12}{48} = 9$ ft; at 1 (overhang): $-12\\times\\tfrac{36}{48} = -9$ ft.
- **$M_2$**: only a load at floor beam 1 (on the left overhang) bends the girder at support 2: $M_2 = -12\\,FBR_1$. $FBR_1 = \\tfrac{12-x}{12}$ on stringer 0–18, so $M_2 = -12$ at x = 0 and $+6$ at x = 18; zero elsewhere.`}</Md>
        <ILDStack
          model={fs2.model}
          path={fs2.path}
          items={[
            { label: 'V in panel 4–5', resp: fs2.shear(42) },
            { label: 'M at panel point 5', resp: fs2.moment(48) },
            { label: 'M at panel point 2', resp: fs2.moment(12) },
          ]}
        />
      </div>
    ),
    notes: ['Stringer breaks read at 18 ft (6 ft right of 2) and 42 ft (6 ft right of 4); no floor beam under point 7 — the last stringer overhangs 6 ft past floor beam 6.'],
  },
  {
    id: '2008-09-A3',
    paper: PAPER,
    sec: 'A',
    no: '3',
    marks: MK,
    topics: ['wheel'],
    title: 'Max shear at the quarter point of an 80 ft span (wheel loads)',
    pages: PA,
    text: `Find the maximum shear force at the **quarter point** of a simple beam of span **80 ft** due to the wheel loads in Fig. 3 (${T3_TEXT}).`,
    figure: () => <TrainFig span={beamOf('A:0:pin Q:20 B:80:roller')} note="Section Q at the quarter point, 20 ft from A." />,
    checks: () => {
      const e = trainExtremes(ild3, T3)
      return [
        { key: 'vmax', label: 'Maximum positive shear at the quarter point', value: e.max.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Shear ILD at 20 ft: $-0.25$ just left, $+0.75$ just right of the section. The train travels right → left (wheel 1 leads), so for max positive shear a wheel stops **just right of the section** with the rest of the train behind it on the long positive part. Advancing by one spacing $a$ changes the shear by $\\Delta V = W a/L - P_{crossing}$: with wheel 1 at the section, moving wheel 2 up gains $W(4)/80$ but loses 12 k; moving on to wheel 3 (the first 48 k) gains $W(10)/80$ and loses the second 12 k, etc. Compare the trials below (the 5 k/ft trailer enters the span when the train is far enough on). Wheel 3 at the section wins. With the light wheels leading, the shear never turns negative: by the time wheels sit on the short negative part, much more load is on the positive part behind them.`}</Md>
        <TrainOnILD ild={ild3} t={T3} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="shear at L/4" />
        <Md>{`**Answer:** $V_{max} = \\mathbf{${fmt(trainExtremes(ild3, T3).max.value)}}$ k.`}</Md>
      </div>
    ),
    notes: ['Fig. 3 read as wheels 12, 12, 48 ×6, 12, 12 k at spacings 4, 10, 6, 6, 12, 6, 6, 10, 4 ft, then an 8 ft gap to a uniform 5 k/ft load of unspecified (unlimited) length.', 'Train taken as travelling right to left (wheel 1 leads, the uniform load trails).'],
  },
  {
    id: '2008-09-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: MK,
    topics: ['floor'],
    title: 'Truss ILDs: U₃L₃, U₄L₄, U₄U₅, L₇L₈',
    pages: PA,
    text: `Draw influence lines for the bar forces in **U₃L₃, U₄L₄, U₄U₅ and L₇L₈** of the truss in Fig. 4.

Through truss, 9 @ 16 ft = 144 ft, pin at L₀, roller at L₉, loads on the bottom chord. Top joints: U₁ (16, 10), U₂ (32, 20), U₃ (48, 20), U₄ (64, 20), U₅ (80, 18), U₆ (96, 16), then U₇, U₈, U₉ at 104, 120, 136 ft (16 ft high). Verticals U₁L₁ … U₆L₆; diagonals U₁L₂, L₂U₃, L₃U₄, U₄L₅, U₅L₆, and a Warren web L₆U₇L₇U₈L₈U₉L₉.`,
    figure: () => <Figure model={t4} />,
    checks: () => [
      { key: 'u3l3', label: 'U₃L₃ ordinate, unit load at L₃ (T +)', value: ildAt(ild4('U3L3'), 48) },
      { key: 'u4l4', label: 'U₄L₄ ordinate, unit load at L₄ (T +)', value: ildAt(ild4('U4L4'), 64) },
      { key: 'u4u5', label: 'U₄U₅ ordinate, unit load at L₅ (T +)', value: ildAt(ild4('U4U5'), 80) },
      { key: 'l7l8', label: 'L₇L₈ ordinate, unit load at L₇ (T +)', value: ildAt(ild4('L7L8'), 112) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Loads enter at the bottom panel points, so each ILD is straight between panel points. Sections:
- **U₃L₃** (x = 48): joint U₃ — U₂U₃ and U₃U₄ are collinear (both horizontal), so ΣFy at U₃ gives $U_3L_3 = -(\\text{vertical comp. of } L_2U_3)$; the diagonal L₂U₃ carries the shear of panel 2–3 → shear-type ILD.
- **U₄L₄** (x = 64): at joint L₄ the only bars are the collinear chords L₃L₄, L₄L₅ and the vertical (the diagonals L₃U₄ and U₄L₅ do not meet at L₄). So ΣFy at L₄: $F_{U_4L_4}$ = load at L₄ → ILD is a triangle, **1 at L₄**, 0 at L₃ and L₅.
- **U₄U₅** (sloping chord): section through U₄U₅, U₄L₅, L₄L₅; moment about **L₅** (80, 0). The perpendicular distance from L₅ to line U₄U₅ is $\\dfrac{16\\times18}{\\sqrt{16^2+2^2}} = 17.86$ ft, so $F = -M_{80}/17.86$ → compression, triangle (unit load at L₅: $-\\tfrac{64\\times80}{144}/17.86 = -1.991$).
- **L₇L₈**: section between 112 and 120 ft through U₇U₈, L₇U₈, L₇L₈; moment about **U₈** (120, 16): $F = M_{120}/16$ → tension; unit load at L₇: $\\tfrac{112}{144}\\times24/16 = 1.167$, at L₈: $\\tfrac{120\\times24}{144}/16 = 1.25$.`}</Md>
        <ILDStack
          model={t4}
          path={p4}
          items={[
            { label: 'F U3L3', resp: { kind: 'force', member: 'U3L3' } },
            { label: 'F U4L4', resp: { kind: 'force', member: 'U4L4' } },
            { label: 'F U4U5', resp: { kind: 'force', member: 'U4U5' } },
            { label: 'F L7L8', resp: { kind: 'force', member: 'L7L8' } },
          ]}
        />
      </div>
    ),
    notes: [
      'U₁ is read on the straight end post L₀–U₂ (10 ft high) and U₅ on the straight chord U₄–U₆ (18 ft high).',
      'Upper dimension line "8, 16, 16, 8" read as U₇, U₈, U₉ at 104, 120, 136 ft (Warren web on the right).',
      'Loads assumed on the bottom chord (supports and the deck at L-level).',
    ],
  },
  {
    id: '2008-09-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: MK,
    topics: ['wheel'],
    title: 'Max pier reaction: two simple spans 40 ft + 60 ft',
    pages: PA,
    text: `Two simple bridge spans of 40 ft and 60 ft are supported on a common pier at **B** (Fig. 5). What position of the wheel loads of Fig. 3 produces the maximum reaction on the pier? Compute the maximum reaction.`,
    figure: () => <TrainFig span={beamOf('A:0:pin B:40:roller C:100:roller')} note="Fig. 5: span A–B = 40 ft, span B–C = 60 ft, both simply supported on the pier B." />,
    checks: () => {
      const e = trainExtremes(ild5, T3)
      const w1 = e.max.wheels.find((w) => Math.abs(w.x - 40) < 1e-4)
      return [
        { key: 'rb', label: 'Maximum pier reaction', value: e.max.value, unit: 'k' },
        { key: 'wh', label: 'Number of the wheel standing on the pier', value: w1 ? w1.k + 1 : 0 },
      ]
    },
    solution: () => {
      const e = trainExtremes(ild5, T3)
      const w1 = e.max.wheels.find((w) => Math.abs(w.x - 40) < 1e-4)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**ILD of the pier reaction** = sum of the two simple-span reactions at B: rises from 0 at A to **1 at B** (slope $1/40$), falls to 0 at C (slope $-1/60$).

**Criterion.** With a wheel at B, moving the train a small $\\delta$ to the right changes $R_B$ by $\\delta\\left(\\dfrac{W_1}{40} - \\dfrac{W_2}{60}\\right)$ ($W_1$, $W_2$ = loads on the 40 ft and 60 ft spans). The maximum is reached with a wheel $P_k$ at B such that
$$\\frac{W_1}{40} \\lt \\frac{W_2 + P_k}{60}\\quad\\text{and}\\quad \\frac{W_1 + P_k}{40} \\gt \\frac{W_2}{60}$$
i.e. the average load per foot on the left span changes sign relative to the right span as $P_k$ crosses B.`}</Md>
          <TrainOnILD ild={ild5} t={T3} span={[0, 100]} section={40} peak={{ x: 40, side: 1 }} what="pier reaction" />
          <Md>{`**Answer:** maximum pier reaction $= \\mathbf{${fmt(e.max.value)}}$ k, with ${w1 ? `wheel ${w1.k + 1} (${fmt(w1.P)} k) on the pier` : 'the position shown'}, train heading left (wheel 1 leading on the 40 ft span).`}</Md>
        </div>
      )
    },
  },
  {
    id: '2008-09-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: MK,
    topics: ['floor'],
    title: 'Max force in U₂U₃ and in the counter U₃L₄',
    pages: PA,
    text: `Compute the maximum bar force in **U₂U₃** and in the counter **U₃L₄** (consider that there is a counter diagonal U₃L₄) of the truss in Fig. 4, due to (a) self weight 2 k/ft, (b) moving live load 3 k/ft, (c) moving concentrated load 50 k.`,
    figure: () => <Figure model={t4c} />,
    checks: () => {
      const a = uniformPlusConcentrated(ild4('U2U3'), 3, 50, 2)
      const c = uniformPlusConcentrated(ild4c(), 3, 50, 2)
      return [
        { key: 'u23', label: 'U₂U₃: max force (compression −, incl. DL)', value: a.maxNeg.total, unit: 'k' },
        { key: 'ctr', label: 'Counter U₃L₄: max tension (incl. DL)', value: Math.max(0, c.maxPos.total), unit: 'k' },
        { key: 'ctrd', label: 'Counter U₃L₄: dead-load force alone (T +)', value: c.dead, unit: 'k' },
      ]
    },
    solution: () => {
      const c = uniformPlusConcentrated(ild4c(), 3, 50, 2)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**U₂U₃** (top chord, panel 2–3, horizontal): section through U₂U₃, L₂U₃, L₂L₃; moments about **L₂** (x = 32, depth 20 ft):
$$F_{U_2U_3} = -\\frac{M_{L_2}}{20}$$
so the ILD is the simple-span moment ILD at 32 ft divided by 20 (peak $-\\tfrac{32\\times112}{144\\times20} = -1.244$ at L₂) — always compression. Max = DL × area + LL × area + 50 k × peak.`}</Md>
          <MaxEffect ild={ild4('U2U3')} w={3} P={50} wd={2} label="U₂U₃ (tension +)" />
          <Md>{`**Counter U₃L₄.** Diagonals are taken as tension-only: in panel 3–4 either L₃U₄ (drawn) or the counter U₃L₄ acts, depending on the sign of the panel shear. With the counter acting, the truss is the same with L₃U₄ replaced by U₃L₄ (shown in the figure). The top and bottom chords are parallel in panel 3–4, so $F_{U_3L_4}\\sin\\theta = V_{3-4}$ and its ILD is the panel-shear ILD × $\\sqrt{16^2+20^2}/20$. The counter is needed when dead + live give tension in it:`}</Md>
          <ILDStack model={t4c} path={p4} items={[{ label: 'F U3L4 (counter)', resp: { kind: 'force', member: 'U3L4' } }]} />
          <MaxEffect ild={ild4c()} w={3} P={50} wd={2} label="Counter U₃L₄ (tension +)" />
          <Md>{`**Answers:** $F_{U_2U_3,max} = \\mathbf{${fmt(Math.abs(uniformPlusConcentrated(ild4('U2U3'), 3, 50, 2).maxNeg.total))}}$ k (compression); maximum tension in the counter U₃L₄ $= \\mathbf{${fmt(Math.max(0, c.maxPos.total))}}$ k. Note the dead load alone already gives ${fmt(c.dead)} k ${c.dead > 0 ? 'tension' : 'compression'} in U₃L₄ (panel 3–4 lies left of mid-span, so its dead-load shear is positive).`}</Md>
        </div>
      )
    },
    notes: ['Dead load 2 k/ft is applied through the bottom panel points over the full span. With the geometry read from Fig. 4 the counter U₃L₄ is the tension diagonal under positive panel shear, so it is stressed even under dead load; the drawn diagonal L₃U₄ would then be slack (tension-only diagonals).'],
  },
  {
    id: '2008-09-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: MK,
    topics: ['ild'],
    title: 'Max shear and moment at C (uniform + roving + dead load)',
    pages: PA,
    text: `Calculate the maximum shear and bending moment at **C** for the beam in Fig. 6 due to (a) a moving uniform live load of 5 k/ft, (b) a roving concentrated load of 60 k, (c) a uniform dead load of 2 k/ft.

Beam: free end (x = 0), roller A (4 ft), internal hinge (10 ft), roller B (20 ft), C (30 ft), pin D (40 ft).`,
    figure: () => <Figure model={b7} />,
    checks: () => {
      const v = uniformPlusConcentrated(influenceLine(b7, p7, V7), 5, 60, 2)
      const m = uniformPlusConcentrated(influenceLine(b7, p7, M7), 5, 60, 2)
      return [
        { key: 'vpos', label: 'Max positive shear at C (incl. DL)', value: v.maxPos.total, unit: 'k' },
        { key: 'vneg', label: 'Max negative shear at C (incl. DL)', value: v.maxNeg.total, unit: 'k' },
        { key: 'mpos', label: 'Max positive moment at C (incl. DL)', value: m.maxPos.total, unit: 'k-ft' },
        { key: 'mneg', label: 'Max negative moment at C (incl. DL)', value: m.maxNeg.total, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** Hinge–B–C–D is a simple span B–D (20 ft) overhanging 10 ft to the hinge; the left piece (free end, roller A, hinge) rests on A and the hinge. A unit load on the left piece at $x$ puts $\\tfrac{x-4}{6}$ on the hinge (−0.667 at the free end, 1 at the hinge).

**ILDs at C** (mid-span of B–D): on B–D, $M_C$ peaks at $10\\times10/20 = 5$ ft and $V_C$ jumps from $-0.5$ to $+0.5$. On the overhang (hinge → B) a unit load at distance $e$ left of B gives $R_D = -e/20$, so $M_C = -10e/20$ (−5 at the hinge) and $V_C = +e/20$ (+0.5 at the hinge); over the left piece both scale with the hinge force, crossing zero at A.`}</Md>
        <ILDStack
          model={b7}
          path={p7}
          items={[
            { label: 'V_C', resp: V7 },
            { label: 'M_C', resp: M7 },
          ]}
        />
        <MaxEffect ild={influenceLine(b7, p7, V7)} w={5} P={60} wd={2} label="Shear at C" />
        <MaxEffect ild={influenceLine(b7, p7, M7)} w={5} P={60} wd={2} label="Moment at C" resUnit="k-ft" />
      </div>
    ),
  },
  // =============================================================== SECTION B
  {
    id: '2008-09-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: MK,
    topics: ['cable'],
    title: 'Inclined cable with three loads: elastic stretch & unstressed length',
    pages: [6],
    text: `A cable with a span of **400 ft** carries concentrated loads of 100 k, 200 k and 80 k at horizontal distances 80 ft, 200 ft and 300 ft from the left end. The right end is **50 ft higher** than the left end. The point of application of the 200 k load is vertically **81 ft lower than the right end**. Find the elastic stretch and the unstressed length of the cable. $E = 30{,}000$ ksi, $A = 10$ in².`,
    figure: () => <Figure model={fig8} />,
    checks: () => [
      { key: 'H', label: 'Horizontal tension H', value: c8.H, unit: 'k' },
      { key: 'Tmax', label: 'Maximum segment tension', value: c8.Tmax, unit: 'k' },
      { key: 'dL', label: 'Elastic stretch', value: stretch8 * 12, unit: 'in', tol: 0.02 },
      { key: 'L0', label: 'Unstressed length', value: c8.length - stretch8, unit: 'ft', tol: 0.002 },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Sag below the chord at the 200 k load.** The chord rises 50 ft over 400 ft, so at x = 200 it is 25 ft above the left end; the load point is $50 - 81 = -31$ ft (31 ft below the left end) → sag below chord $= 25 + 31 = 56$ ft.

**Cable theorem** $H\\,y = M_{beam}$: simple-beam reaction $R_A = \\dfrac{100(320) + 200(200) + 80(100)}{400} = ${fmt((100 * 320 + 200 * 200 + 80 * 100) / 400)}$ k, $M_{200} = ${fmt(simpleBeamM(400, 200, loads8))}$ k-ft:
$$H = \\frac{${fmt(simpleBeamM(400, 200, loads8))}}{56} = \\mathbf{${fmt(c8.H, 3)}}\\ \\text{k}$$
Sags at 80 ft and 300 ft: $M/H$. Each segment: $T = H\\,\\ell/\\Delta x$, stretch $\\Delta\\ell = T\\ell/AE$ with $AE = 10 \\times 30000 = 300{,}000$ k.`}</Md>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Segment</th>
              <th>Δx (ft)</th>
              <th>Δy (ft)</th>
              <th>ℓ (ft)</th>
              <th>T (k)</th>
              <th>Tℓ/AE (in)</th>
            </tr>
          </thead>
          <tbody>
            {seg8.map((s, k) => (
              <tr key={k}>
                <td className="txt">{'ABCDE'[k] + 'ABCDE'[k + 1]}</td>
                <td>{fmt(s.dx)}</td>
                <td>{fmt(s.dy, 3)}</td>
                <td>{fmt(s.len, 3)}</td>
                <td>{fmt(s.T, 2)}</td>
                <td>{fmt(s.dL * 12, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Tex block>{`\\Delta L = \\sum\\frac{T\\ell}{AE} = \\mathbf{${fmt(stretch8 * 12, 3)}}\\text{ in} = ${fmt(stretch8, 4)}\\text{ ft},\\qquad S = \\sum \\ell = ${fmt(c8.length, 3)}\\text{ ft}`}</Tex>
        <Tex block>{`S_0 = S - \\Delta L = ${fmt(c8.length, 3)} - ${fmt(stretch8, 4)} = \\mathbf{${fmt(c8.length - stretch8, 3)}}\\text{ ft}`}</Tex>
      </div>
    ),
  },
  {
    id: '2008-09-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: MK,
    topics: ['cable'],
    title: 'Inclined parabolic cable: slope at 375 ft, T_max, length',
    pages: [6],
    text: `The right end of a cable of span **500 ft** is **50 ft higher** than the left end. The cable carries a uniformly distributed load of **2 k per horizontal foot** and the sag of the cable is **25 ft**. Determine (a) the slope of the cable at 375 ft horizontally from the left end, (b) the maximum cable tension, (c) the length of the loaded cable.`,
    figure: () => (
      <div>
        <StructureView model={fig9} showLoads={false} autoDimX={[0, 250, 375, 500]} maxHeight={220} />
        <p className="text-xs text-faint px-2">Sag 25 ft measured below the chord at mid-span; w = 2 k/ft (horizontal).</p>
      </div>
    ),
    checks: () => [
      { key: 'slope', label: 'Slope dy/dx at x = 375 ft (rising to the right +)', value: c9.slope(375), tol: 0.01 },
      { key: 'Tmax', label: 'Maximum tension (at the higher end)', value: c9.Tmax, unit: 'k' },
      { key: 'len', label: 'Length of the loaded cable', value: c9.length, unit: 'ft', tol: 0.002 },
    ],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Measure $y$ upward from the left support; the cable is the chord minus a parabola with mid-span sag $h = 25$ ft:
$$y(x) = \\frac{50x}{500} - \\frac{4(25)x(500-x)}{500^2},\\qquad H = \\frac{wL^2}{8h} = \\frac{2(500)^2}{8(25)} = ${fmt(c9.H)}\\ \\text{k}$$`}</Md>
        <Tex block>{`y'(x) = \\frac{50}{500} - \\frac{4(25)(500-2x)}{500^2}\\ \\Rightarrow\\ y'(375) = 0.1 + 0.1 = \\mathbf{${fmt(c9.slope(375), 4)}}\\ (\\theta = ${fmt((Math.atan(c9.slope(375)) * 180) / Math.PI, 2)}^\\circ)`}</Tex>
        <Md>{`Lowest point ($y' = 0$): $x = \\tfrac L2 - \\tfrac{h_d L}{8h} = 250 - 125 = ${fmt(xLow9)}$ ft from the left (lower) end. The steepest point is the higher (right) support: $y'(500) = ${fmt(c9.slope(500), 3)}$.`}</Md>
        <Tex block>{`T_{max} = H\\sqrt{1 + y'(500)^2} = ${fmt(c9.H)}\\sqrt{1 + ${fmt(c9.slope(500) ** 2, 4)}} = \\mathbf{${fmt(c9.Tmax)}}\\text{ k}\\quad(V_{right} = ${fmt(c9.Vright)}\\text{ k})`}</Tex>
        <Md>{`**Length.** Split at the lowest point into two half-parabolas of horizontal lengths $a = ${fmt(xLow9)}$ ft and $b = ${fmt(500 - xLow9)}$ ft, or integrate $\\int_0^{500}\\sqrt{1 + y'^2}\\,dx$ directly: $S = \\mathbf{${fmt(c9.length, 3)}}$ ft.`}</Md>
      </div>
    ),
    notes: [
      '"Sag 25 ft" is taken as the mid-span sag below the chord (standard for an inclined cable). The lowest point is then 125 ft from the left end, and at 375 ft the slope is 0.2 (rising).',
      'Engine issue: parabolicCable().xLow returns L/2 + dh·L/(8h) (= 375 ft here); the correct lowest point for a higher right end is L/2 − dh·L/(8h) (= 125 ft). Computed locally.',
    ],
  },
  {
    id: '2008-09-B10',
    paper: PAPER,
    sec: 'B',
    no: '10',
    marks: MK,
    topics: ['cable'],
    title: 'Suspension bridge (1000 ft, sag 100 ft): girder SFD & BMD',
    pages: [6, 8],
    text: `Draw the shear force and bending moment diagrams for the stiffening girder of the suspension bridge in Fig. 7.

Span 10 @ 100 ft = 1000 ft, cable sag 100 ft, girder hinged at both towers (C and A) and at mid-span B. Loads 20 k at 300 ft and 20 k at 600 ft from C.`,
    figure: () => <StructureView model={fig10} autoDimX={[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]} maxHeight={240} />,
    checks: () => [
      { key: 'H', label: 'Horizontal cable tension H', value: s10.H, unit: 'k' },
      { key: 'q', label: 'Hanger force (100 ft spacing)', value: s10.q * 100, unit: 'k' },
      { key: 'mmax', label: 'Max positive girder moment', value: s10ext.max.M, unit: 'k-ft' },
      { key: 'mmin', label: 'Max negative girder moment', value: s10ext.min.M, unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Hinge at B (mid-span) → $M(500) = 0$. Simple-beam reaction at C: $\\dfrac{20(700) + 20(400)}{1000} = ${fmt((20 * 700 + 20 * 400) / 1000)}$ k; $M_0(500) = ${fmt(s10.M0h)}$ k-ft, so $H = M_0(500)/100$. The hangers then load the girder upward with $q = 8Hh/L^2$; girder shear $V = V_0 - q\\,(L/2 - x)$ and moment $M = M_0 - Hy$.`}</Md>
        <SuspensionSolution L={1000} h={100} xh={500} loads={s10in.loads} panel={100} marks={[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]} />
        <Md>{`**Key values:** $H = ${fmt(s10.H)}$ k, $q = ${fmt(s10.q, 4)}$ k/ft (hanger force ${fmt(s10.q * 100)} k), girder moment between ${fmt(s10ext.min.M)} k-ft (x ≈ ${fmt(s10ext.min.x, 0)} ft) and ${fmt(s10ext.max.M)} k-ft (x ≈ ${fmt(s10ext.max.x, 0)} ft); zero at C, B and A.`}</Md>
      </div>
    ),
    notes: ['Load positions read from Fig. 7: the two 20 k loads hang under the 3rd and 6th hanger points (300 ft and 600 ft from C).'],
  },
  {
    id: '2008-09-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: MK,
    topics: ['ild'],
    title: 'Beam with hinge: max shear and moment (5 k/ft + 20 k roving)',
    pages: PB,
    text: `For a uniform load of **5 k/ft** combined with a roving concentrated load of **20 k** on the beam in Fig. 8, calculate (a) the maximum positive shear at a section **6 ft right of support A**, (b) the maximum negative shear **just left of support B**, (c) the maximum positive moment at the **centre of segment AB**.

Beam: pin A (x = 0), roller B (20 ft), internal hinge C (28 ft), roller D (44 ft).`,
    figure: () => <Figure model={b11} />,
    checks: () => [
      { key: 'v6', label: 'Max positive shear 6 ft right of A', value: uniformPlusConcentrated(ild11(R11.V6), 5, 20).maxPos.total, unit: 'k' },
      { key: 'vb', label: 'Max negative shear just left of B', value: uniformPlusConcentrated(ild11(R11.VBl), 5, 20).maxNeg.total, unit: 'k' },
      { key: 'm', label: 'Max positive moment at the centre of AB', value: uniformPlusConcentrated(ild11(R11.Mmid), 5, 20).maxPos.total, unit: 'k-ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure.** A–B–C is a beam on A and B overhanging 8 ft to the hinge C; C–D is a suspended span on the hinge and D. A unit load on C–D at $x$ puts $\\tfrac{44-x}{16}$ on the tip C.

- $V$ at 6 ft: $-x/20$ left of the section, $(20-x)/20$ right (+0.7 just right), $-\\tfrac{x-20}{20}$ on the overhang (−0.4 at C), back to 0 at D.
- $V$ just left of B $= R_A$ − (loads left of the section): $-x/20$ on A–B (−1 just left of B); for a load right of B, $V = R_A = -\\tfrac{x-20}{20}$ (−0.4 at C), back to 0 at D — **negative everywhere**, so the whole beam is loaded for (b).
- $M$ at 10 ft (centre of AB): peak $10\\times10/20 = 5$ ft; on the overhang $-\\tfrac{10(x-20)}{20}$ (−4 at C).

Max positive effect = $w\\times A^+ + P\\,y_{max}$ (load only the positive parts), max negative likewise.`}</Md>
        <ILDStack
          model={b11}
          path={p11}
          items={[
            { label: 'V at 6 ft', resp: R11.V6 },
            { label: 'V just left of B', resp: R11.VBl },
            { label: 'M at centre of AB', resp: R11.Mmid },
          ]}
        />
        <MaxEffect ild={ild11(R11.V6)} w={5} P={20} label="(a) Shear 6 ft right of A" />
        <MaxEffect ild={ild11(R11.VBl)} w={5} P={20} label="(b) Shear just left of B" />
        <MaxEffect ild={ild11(R11.Mmid)} w={5} P={20} label="(c) Moment at the centre of AB" resUnit="k-ft" />
      </div>
    ),
    notes: ['No dead load is specified, so only the live loads are combined.'],
  },
  {
    id: '2008-09-B12',
    paper: PAPER,
    sec: 'B',
    no: '12',
    marks: MK,
    topics: ['frames'],
    title: 'Frame with hinge: SFD/BMD of CH and IJ',
    pages: PB,
    text: `Draw the shear force and bending moment diagrams for the horizontal member **CH** and the vertical member **IJ** of the frame in Fig. 9.

Horizontal member C–D–E–F–G–H at 15 ft height: C (0), D (10), E (26), internal hinge F (36), G (46), H (58 ft). Column D–A fixed at A (ground). Column G–B on a roller at B (5 ft above ground). Vertical member I–C–J through C (I 8 ft above, J 8 ft below C). Loads: 50 k-ft clockwise couple at I; 10 k/ft horizontal (→) on C–J; 70 k at E; triangular load 10 k/ft at G to 0 at H; 20 k (←) on G–B, 5 ft below G.`,
    figure: () => <Figure model={f12} />,
    checks: () => {
      const r = solve(f12)
      return [
        { key: 'by', label: 'Vertical reaction at B (↑ +)', value: r.reaction('B').ry, unit: 'k' },
        { key: 'ay', label: 'Vertical reaction at A (↑ +)', value: r.reaction('A').ry, unit: 'k' },
        { key: 'ma', label: `Moment reaction at A (${rotTag()})`, value: rot(r.reaction('A').m), unit: 'k-ft' },
        { key: 'mc', label: 'Moment in IJ just below C (sagging +, member read J→C)', value: r.member('JC').M(8), unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = solve(f12)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Right part F–G–H + column G–B** (free body cut at the hinge F): unknowns hinge forces $F_x, F_y$ and $B_y$. $\\sum M_F = 0$ (${rotTag()}): $${isCW() ? '-B_y(10) + 60\\left(10 + \\tfrac{12}{3}\\right) + 20(5)' : 'B_y(10) - 60\\left(10 + \\tfrac{12}{3}\\right) - 20(5)'} = 0 \\Rightarrow B_y = ${fmt(r.reaction('B').ry)}$ k — the triangle resultant $\\tfrac12(10)(12) = 60$ k acts 4 ft right of G (14 ft from F), and the 20 k ← acts 5 ft below the hinge level (clockwise about F). $\\sum F_x$: the hinge pushes the right part 20 k →, so the left part receives 20 k ←; $\\sum F_y$: the hinge pushes the left part up with $${fmt(r.reaction('B').ry)} - 60 = ${fmt(r.reaction('B').ry - 60)}$ k.

**Left part**: hinge forces, 70 k at E, the 80 k horizontal load on CJ (resultant 4 ft below C), the 50 k-ft couple at I; the fixed support A balances everything.

**IJ** is a cantilever from C: I–C carries only the couple (constant M = 50 k-ft, zero shear); C–J carries the 10 k/ft load as a cantilever (shear 0 at J → 80 k at C, moment 0 → $10(8)^2/2 = 320$ k-ft at C).`}</Md>
          <FrameSolution model={f12} only={[...CH, ...IJ]} />
          <Md>{`**Reactions:** $B_y = ${fmt(r.reaction('B').ry)}$ k, $A_x = ${fmt(r.reaction('A').rx)}$ k, $A_y = ${fmt(r.reaction('A').ry)}$ k, $M_A = ${fmt(rot(r.reaction('A').m))}$ k-ft (${rotTag()}).`}</Md>
        </div>
      )
    },
    notes: [
      'The couple at I is read as 50 k-ft clockwise; the UDL on C–J as 10 k/ft acting to the right; the 20 k on G–B as acting to the left 5 ft below G; B is 5 ft above the base of A (10 ft below G).',
      'I–C–J is taken as rigidly connected to C–D at C.',
    ],
  },
  {
    id: '2008-09-B13',
    paper: PAPER,
    sec: 'B',
    no: '13',
    marks: MK,
    topics: ['truss'],
    title: 'Subdivided truss: forces in a, b, c, d',
    pages: PB,
    text: `Find the bar forces in members **a, b, c, d** of the truss in Fig. 10.

Span 120 ft (20, 20, 20, then 6 × 10 ft), roller at the left end, pin at the right end. Top joints: (20, 15), (40, 18), then a level top chord 20 ft high from 60 to 120 ft. Mid-height (10 ft) joints at 40, 70, 90, 110 ft. a = (40, 10)–(60, 20); b = (40, 10)–(60, 0); d = (100, 20)–(110, 10); c = (110, 10)–(120, 20). Loads: 20 k at (20, 15), 20 k at (40, 18), 15 k at (60, 20), 10 k at each top joint 70–110 ft, 5 k at (120, 20).`,
    figure: () => <Figure model={t13} labels={lab13} />,
    checks: () => {
      const r = solve(t13)
      return (['a', 'b', 'c', 'd'] as const).map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => {
      const r = solve(t13)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`Reactions: $\\sum M$ about the right pin → $R_{left} = ${fmt(r.reaction('L0').ry)}$ k ↑ (the 5 k at the right end goes straight into the pin).

- **c**: a vertical section between 110 and 120 ft cuts only the top chord, **c** and the bottom chord (both chords horizontal), so ΣFy: the vertical component of c equals the panel shear $= R_{right} - 5 = ${fmt(r.reaction('L6').ry - 5)}$ k → $|c| = ${fmt(r.reaction('L6').ry - 5)}\\sqrt2 = ${fmt(Math.abs(r.member('c').N(1)))}$ k.
- **d**: joint (110, 20) — two collinear chords, the vertical and the 10 k load → the vertical to (110, 10) carries 10 k (compression). Then joint (110, 10): known c and vertical, unknown **d** and the sub-strut from (100, 0); ΣFx and ΣFy give both.
- **a, b** meet at the mid-joint (40, 10), where the only other bars are verticals → ΣFx gives $a\\cos\\theta = -b\\cos\\theta$, i.e. $a = -b$ (equal slopes 10 : 20). A section between 40 and 60 ft (top chord (40, 18)–(60, 20), a, b, bottom chord) with ΣFy (or moments about (60, 20) and (60, 0)) then fixes the magnitude.`}</Md>
          <TrussSolution model={t13} asked={['a', 'b', 'c', 'd']} />
        </div>
      )
    },
    notes: ['Fig. 10 geometry: the 8 ft and 10 ft marks on the vertical at 40 ft are read as the mid-joint at 10 ft and the top joint at 18 ft; the left vertical at 20 ft is 15 ft high; the right panels are subdivided (K-type sub-struts) with mid-joints at 70, 90 and 110 ft.'],
  },
  {
    id: '2008-09-B14',
    paper: PAPER,
    sec: 'B',
    no: '14',
    marks: MK,
    topics: ['ild'],
    title: 'Frame with tie rod: ILDs for T_AE, R_B, M at 1-1',
    pages: PB,
    text: `For the frame in Fig. 11, draw influence lines for (i) the force in the tie rod **AE**, (ii) the vertical reaction at support **B**, (iii) the moment at section **1-1**. The unit load moves from C to D.

Column B–C–E (B pinned at the base, C 10 ft up, E 15 ft up, section 1-1 at 5 ft); arm C–D 20 ft long; tie rod from E to the pinned anchor A, 15 ft left of B at base level.`,
    figure: () => <Figure model={f14} dimY />,
    checks: () => [
      { key: 'T', label: 'Tie force with the unit load at D (T +)', value: ildAt(ild14(R14.T), 20) },
      { key: 'RB', label: '$R_B$ (↑) with the unit load at D', value: ildAt(ild14(R14.RB), 20) },
      { key: 'M', label: 'Moment at 1-1 with the unit load at D (+ = tension on the right face; tension on the tie side is −)', value: ildAt(ild14(R14.M11), 20), unit: 'ft' },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Unit load at distance $x$ from C on the arm. The tie AE is at 45° ($15/15$).
- $\\sum M_B = 0$: the tie force $T$ acts at E (0, 15) along E→A, its moment about B is $T\\cos45^\\circ \\times 15 = 10.607\\,T$; the load gives $1\\cdot x$. So $T = \\dfrac{x}{10.607} = 0.0943x$ (tension) → 0 at C, **1.886 at D**.
- $\\sum F_y$: $R_B = 1 + T\\sin45^\\circ = 1 + \\dfrac{x}{15}$ → 1 at C, **2.333 at D**.
- $\\sum F_x$: $B_x = T\\cos45^\\circ = x/15$ (→). Section 1-1 is 5 ft above B with nothing else below it, so $|M_{1-1}| = B_x \\times 5 = \\dfrac{x}{3}$ → **6.667 ft at D**, with tension on the **left** face (tie side) — the lower 5 ft of column acts as a cantilever pushed to the right at B. In the solver's convention (member read upward, + = tension on the right face) the ordinates are negative.`}</Md>
        <ILDStack
          model={f14}
          path={p14}
          items={[
            { label: 'T (tie AE)', resp: R14.T },
            { label: 'R_B (vertical)', resp: R14.RB },
            { label: 'M at 1-1', resp: R14.M11 },
          ]}
        />
      </div>
    ),
    notes: ['Read from Fig. 11: A–B 15 ft, B–(1-1) 5 ft, 1-1 to C 5 ft, C–E 5 ft, C–D 20 ft. The tie rod is a two-force member pinned at A and E.'],
  },
]

void ildExtremes
