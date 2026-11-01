// 2011-12 term final (held 25 Jul 2013), scan pages 17–20. 280 marks, 28 per question (5 of 7 per section).
import { useMemo, useState } from 'react'
import { isCW, rotK, rotPos, rotTag, rotWord } from '../../engine/sign'
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { portalMethod, xBraced, type GridFrame } from '../../engine/approx'
import { hangerGirder, stiffenedSuspension } from '../../engine/cable'
import { linearMember, normalise, type DiagramMember } from '../../engine/diagrams'
import { ssMomentILD, trainExtremes, uniformPlusConcentrated, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import type { Model } from '../../engine/model'
import { beamOf, F, H, Hm, Mo, model, P, truss, W } from '../../kit/builders'
import { ApproxSolution, Figure, FrameSolution, ILDStack, MaxEffect, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { SuspensionSolution } from '../../kit/cables'
import { EQSolution, eqResult } from '../../kit/loads'
import { DiagramView, fmt } from '../../components/DiagramView'
import { StructureView } from '../../components/StructureView'
import { Md, Seg, Tex } from '../../components/ui'

const PAPER = '2011-12' as const
const PA = [17, 19]
const PB = [18, 20]
const E30 = 30000

// ---------------------------------------------------------------- A1 truss
const t1 = truss(
  'A:0,0 B:20,0 C:40,0 D:60,0 E:0,20 F:20,20 G:40,20 M:40,10 H:60,30',
  'A-B B-C C-D E-F F-G A-E B-F A-F F-C G-M M-C G-H M-H M-D D-H',
  'A:roller D:pin',
  [P('F', 20, '20k'), P('G', 30, '30k')],
)
const r1 = () => solve(t1)

// ---------------------------------------------------------------- A2 frame with given M_A
const f2Loads = [Mo('C', 100, '100 k-ft'), Hm('AD', 5, 20, '20k'), Hm('AD', 10, 20, '20k'), P('E', 50, '50k'), W('EF', 2, { label: '2 k/ft' })]
/** true structure (A fixed) — for the figure only */
const f2Fig = model('A:0,0 D:0,15 C:-5,15 E:10,15 F*:20,15 B:25,0', 'A-D C-D D-E E-F F-B', 'A:fixed B:pin', f2Loads)
/** statically determinate equivalent: A pinned + the given reaction moment M_A = 300 k-ft (ccw) applied at A */
const f2 = model('A:0,0 D:0,15 C:-5,15 E:10,15 F*:20,15 B:25,0', 'A-D C-D D-E E-F F-B', 'A:pin B:pin', [...f2Loads, Mo('A', 300, 'M_A = 300 k-ft (given)')])
const r2 = () => solve(f2)

// ---------------------------------------------------------------- A3 suspension bridge
const sus3 = { L: 1000, h: 60, xh: 500, loads: [{ x: 400, P: 30 }, { x: 700, P: 50 }] }
const s3 = () => stiffenedSuspension(sus3)
export function suspensionModel(L: number, h: number, n: number, loads: { x: number; P: number }[]): Model {
  const top = h + 20
  const nodes: Model['nodes'] = []
  const members: Model['members'] = []
  for (let i = 0; i <= n; i++) {
    const x = (L * i) / n
    nodes.push({ id: `g${i}`, x, y: 0, label: i === 0 ? 'A' : i === n ? 'B' : i === n / 2 ? 'C' : '', hinge: i === n / 2 || undefined })
    nodes.push({ id: `c${i}`, x, y: top - (4 * h * x * (L - x)) / (L * L), label: '' })
    if (i > 0) {
      members.push({ id: `G${i}`, i: `g${i - 1}`, j: `g${i}` })
      members.push({ id: `K${i}`, i: `c${i - 1}`, j: `c${i}`, truss: true, style: 'cable' })
    }
    if (i > 0 && i < n) members.push({ id: `h${i}`, i: `c${i}`, j: `g${i}`, truss: true, style: 'thin' })
  }
  return {
    nodes,
    members,
    supports: [
      { node: 'g0', type: 'pin' },
      { node: `g${n}`, type: 'roller' },
      { node: 'c0', type: 'pin' },
      { node: `c${n}`, type: 'pin' },
    ],
    loads: loads.map((l) => P(`g${Math.round((l.x / L) * n)}`, l.P, `${l.P}k`)),
  }
}
const sm3 = suspensionModel(1000, 60, 10, sus3.loads)

// ---------------------------------------------------------------- A4 truss deflection
const t4 = truss('A:0,0 B:10,0 C:20,0 D:0,10 E:10,10 F:0,20', 'A-B B-C A-D D-F D-E A-E B-E E-C F-E', 'A:pin C:roller', [P('E', 20, '20k')])
const A4: Record<string, number> = { AB: 10, BC: 10, DE: 10, AD: 15, DF: 15, AE: 15, BE: 15, EC: 15, FE: 15 }
t4.members.forEach((m) => (m.label = `(${A4[m.id]})`))
const vw4opts = { EA: (id: string) => A4[id] * E30 }
const vw4 = () => virtualWork(t4, t4.loads, [H('F', 1)], vw4opts)

// ---------------------------------------------------------------- A5 beam deflection
const b5 = beamOf('A:0:pin B:10 C:25:roller', [P('B', 30, '30k'), W('AB', 2, { label: '2 k/ft' }), W('BC', 2, { label: '2 k/ft' })])
const vw5opts = { EI: (id: string) => (E30 * (id === 'AB' ? 200 : 300)) / 144 }
const vw5 = () => virtualWork(b5, b5.loads, [P('B', 1)], vw5opts)

// ---------------------------------------------------------------- A6 cantilever slope
const b6 = beamOf('A:0:fixed B:10 C:20 D:25', [P('B', 20, '20k'), P('C', 10, '10k'), H('D', 5, '5k')])
const vw6opts = { EI: (id: string) => (E30 * (id === 'AB' ? 400 : 200)) / 144, EA: (id: string) => E30 * (id === 'AB' ? 15 : 10), axial: true }
const vw6 = () => virtualWork(b6, b6.loads, [Mo('D', rotK())], vw6opts) // unit couple in the positive rotation sense

// ---------------------------------------------------------------- A7 frame deflection
const f7 = model('A:0,0 C:0,12 D:10,12 E:15,12 B:15,0', 'A-C C-D D-E B-E', 'A:pin B:roller', [H('C', 10, '10k')])
const col7 = (id: string) => id === 'AC' || id === 'BE'
const vw7opts = { EI: (id: string) => (E30 * (col7(id) ? 400 : 600)) / 144, EA: (id: string) => E30 * (col7(id) ? 15 : 20), axial: true }
const vw7 = () => virtualWork(f7, f7.loads, [P('D', 1)], vw7opts)

// ---------------------------------------------------------------- B8 vertical loads, 0.1L method on an irregular frame
const f8 = model(
  'A:0,0 B:30,0 C:50,0 D:60,0 E:0,20 F:30,20 G:50,20 H:0,30 I:30,30 J:50,25 K:60,25',
  'A-E E-H B-F F-I C-G G-J D-K H-I E-F F-G J-K',
  'A:pin B:pin C:pin D:pin',
)
const BEAMS8 = [
  { id: 'HI', i: 'H', j: 'I', L: 30 },
  { id: 'EF', i: 'E', j: 'F', L: 30 },
  { id: 'FG', i: 'F', j: 'G', L: 20 },
  { id: 'JK', i: 'J', j: 'K', L: 10 },
]
/** columns: bottom node → top node */
const COLS8 = [
  { id: 'AE', i: 'A', j: 'E' },
  { id: 'EH', i: 'E', j: 'H' },
  { id: 'BF', i: 'B', j: 'F' },
  { id: 'FI', i: 'F', j: 'I' },
  { id: 'CG', i: 'C', j: 'G' },
  { id: 'GJ', i: 'G', j: 'J' },
  { id: 'DK', i: 'D', j: 'K' },
]
function vertical8(w: Record<string, number>) {
  const nd = new Map(f8.nodes.map((n) => [n.id, n]))
  const len = (c: { i: string; j: string }) => nd.get(c.j)!.y - nd.get(c.i)!.y
  const beams = BEAMS8.map((b) => ({ ...b, w: w[b.id], Mend: 0.045 * w[b.id] * b.L * b.L, Mmid: 0.08 * w[b.id] * b.L * b.L, V: 0.5 * w[b.id] * b.L }))
  // internal (sagging +) moments at column bottom / top
  const cm = new Map(COLS8.map((c) => [c.id, { bot: 0, top: 0, L: len(c) }]))
  const joints: { node: string; S: number; shares: { col: string; k: number; share: number; M: number }[] }[] = []
  for (const n of ['H', 'I', 'E', 'F', 'G', 'J', 'K']) {
    // ccw moment exerted on the joint by the beams = M_end(beam on the left) − M_end(beam on the right)
    const S = beams.filter((b) => b.j === n).reduce((s, b) => s + b.Mend, 0) - beams.filter((b) => b.i === n).reduce((s, b) => s + b.Mend, 0)
    const cols = COLS8.filter((c) => c.i === n || c.j === n)
    const ksum = cols.reduce((s, c) => s + 1 / len(c), 0)
    const shares = cols.map((c) => {
      const k = 1 / len(c)
      const share = k / ksum
      const M = share * S // ccw end moment on the column
      const r = cm.get(c.id)!
      if (c.j === n) r.top = M // M_int(j) = +M_j
      else r.bot = -M // M_int(i) = −M_i
      return { col: c.id, k, share, M }
    })
    joints.push({ node: n, S, shares })
  }
  return { beams, cm, joints }
}
const W_FULL = { HI: 10, EF: 10, FG: 10, JK: 10 }
const W_BF = { HI: 10, EF: 10, FG: 6, JK: 10 }
function diagrams8(w: Record<string, number>): DiagramMember[] {
  const v = vertical8(w)
  const nd = new Map(f8.nodes.map((n) => [n.id, n]))
  const out: DiagramMember[] = []
  for (const b of v.beams) {
    const a = nd.get(b.i)!,
      c = nd.get(b.j)!
    const samples = Array.from({ length: 41 }, (_, k) => {
      const t = (b.L * k) / 40
      return { t, N: 0, V: b.w * (b.L / 2 - t), M: (b.w * t * (b.L - t)) / 2 - b.Mend }
    })
    out.push(normalise({ id: b.id, x1: a.x, y1: a.y, x2: c.x, y2: c.y, L: b.L, truss: false, samples }))
  }
  for (const c of COLS8) {
    const a = nd.get(c.i)!,
      d = nd.get(c.j)!
    const r = v.cm.get(c.id)!
    out.push(linearMember(c.id, [a.x, a.y], [d.x, d.y], { N: 0, V: (r.top - r.bot) / r.L, Mi: r.bot, Mj: r.top }))
  }
  return out
}
const bfMax = () => Math.abs(vertical8(W_BF).cm.get('BF')!.top)

// ---------------------------------------------------------------- B9 earthquake (BNBC 1993)
const eq9 = (() => {
  const Z = 0.15,
    I = 1.25,
    R = 12,
    S = 1.5,
    Ct = 0.083,
    hn = 24,
    n = 8,
    hs = 3,
    A = 30 * 30
  const T = Ct * Math.pow(hn, 0.75)
  const Craw = (1.25 * S) / Math.pow(T, 2 / 3)
  const C = Math.min(Craw, 2.75)
  const CR = Math.max(C / R, 0.075)
  const wf = A * (7 + 3)
  const Wt = n * wf
  const V = Z * I * CR * Wt
  const Ft = T > 0.7 ? Math.min(0.07 * T * V, 0.25 * V) : 0
  const levels = Array.from({ length: n }, (_, k) => ({ name: k === n - 1 ? 'Roof' : `Floor ${k + 1}`, h: hs * (k + 1), w: wf }))
  const sumWh = levels.reduce((s, l) => s + l.w * l.h, 0)
  let acc = 0
  const rows = levels
    .map((l) => ({ ...l, wh: l.w * l.h, F: ((V - Ft) * l.w * l.h) / sumWh + (l.name === 'Roof' ? Ft : 0) }))
    .reverse()
    .map((r) => ((acc += r.F), { ...r, Vx: acc }))
  return { Z, I, R, S, Ct, hn, T, Craw, C, CR, wf, Wt, V, Ft, sumWh, rows }
})()
const eq9new = {
  zone: 2 as const,
  occ: 4 as const,
  site: 'SD' as const,
  system: 'SMF_steel' as const,
  hn: 24,
  floors: Array.from({ length: 8 }, (_, k) => ({ name: k === 7 ? 'Roof' : `L${k + 1}`, h: 3 * (k + 1), w: 900 * (7 + 3) })),
}

// ---------------------------------------------------------------- B10 portal
const g10: GridFrame = { xs: [0, 20, 30], heights: [16, 12, 10], loads: [-8, -12, -16], loadSide: ['right', 'right', 'right'] }

// ---------------------------------------------------------------- B11 X-braced truss
const t11 = (() => {
  const xs = [0, 3, 6, 9, 12, 15]
  const nodes = xs.map((x, i) => `L${i}:${x},0 U${i}:${x},4`).join(' ')
  const chords = [0, 1, 2, 3, 4].map((i) => `L${i}-L${i + 1} U${i}-U${i + 1}`).join(' ')
  const verts = xs.map((_, i) => `L${i}-U${i}`).join(' ')
  const diags = [0, 1, 2, 3, 4].map((i) => `L${i}-U${i + 1} U${i}-L${i + 1}`).join(' ')
  return truss(nodes, `${chords} ${verts} ${diags}`, 'L1:roller L5:pin', [P('L0', 8, '8k'), F('U2', 0, 8, '8k'), P('L3', 24, '24k')])
})()
const pairs11: [string, string][] = [0, 1, 2, 3, 4].map((i) => [`L${i}U${i + 1}`, `U${i}L${i + 1}`])
const x11 = () => xBraced(t11, pairs11, 'both')

// ---------------------------------------------------------------- B12 beam ILD
const b12 = beamOf('O:0:pin A:20 B:100:roller C*:140 D:200:roller')
const p12 = { kind: 'members' as const, members: b12.members.map((m) => m.id) }
const R12 = {
  MA: { kind: 'moment' as const, member: 'AB', x: 0 },
  VBr: { kind: 'shear' as const, member: 'BC', x: 0, side: 1 as const },
  VBl: { kind: 'shear' as const, member: 'AB', x: 80, side: -1 as const },
  RB: { kind: 'reaction' as const, node: 'B', comp: 'y' as const },
}
const ild12 = (r: (typeof R12)[keyof typeof R12]) => influenceLine(b12, p12, r)

// ---------------------------------------------------------------- B13 counter in a curved-chord truss
const HT13 = [0, 31, 36, 39, 40, 39, 36, 31, 0]
function truss13(withCounter: boolean) {
  const nodes = HT13.map((_, i) => `L${i}:${30 * i},0`).join(' ') + ' ' + HT13.slice(1, 8).map((h, i) => `U${i + 1}:${30 * (i + 1)},${h}`).join(' ')
  const bot = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `L${i}-L${i + 1}`).join(' ')
  const top = 'L0-U1 U1-U2 U2-U3 U3-U4 U4-U5 U5-U6 U6-U7 U7-L8'
  const vert = [1, 2, 3, 4, 5, 6, 7].map((i) => `U${i}-L${i}`).join(' ')
  const diag = `U1-L2 ${withCounter ? 'U2-L3' : 'L2-U3'} U3-L4 L4-U5 U5-L6 L6-U7`
  return truss(nodes, `${bot} ${top} ${vert} ${diag}`, 'L0:pin L8:roller')
}
const t13main = truss13(false)
const t13ctr = truss13(true)
const t13fig: Model = { ...t13main, members: [...t13main.members, { id: 'U2L3', i: 'U2', j: 'L3', truss: true, style: 'dashed' }] }
const p13 = { kind: 'panel' as const, nodes: HT13.map((_, i) => `L${i}`) }
const ild13main = () => influenceLine(t13main, p13, { kind: 'force', member: 'L2U3' })
const ild13ctr = () => influenceLine(t13ctr, p13, { kind: 'force', member: 'U2L3' })

// ---------------------------------------------------------------- B14 wheel loads
const train14: Train = { P: [20, 20, 80, 80, 80, 80, 80, 80, 20, 20], gaps: [4, 10, 6, 6, 12, 6, 6, 10, 4], udl: { w: 8, gap: 8 } }
const ild14 = ssMomentILD(80, 20)

export const Q2011: PYQ[] = [
  {
    id: '2011-12-A1',
    paper: PAPER,
    sec: 'A',
    no: '1',
    marks: 28,
    topics: ['truss'],
    title: 'Truss with a raised end panel: forces in AF, MD, MH, DH',
    pages: PA,
    text: `Find the axial force in members **AF, MD, MH and DH** of the truss in Fig. 1. Bottom chord A–B–C–D, 3 @ 20 ft = 60 ft; top chord E–F–G at 20 ft; M is midway up the vertical G–C (10 ft); H is 30 ft above D. Loads: 20 k at F and 30 k at G (downward). Roller at A, pin at D.`,
    figure: () => <Figure model={t1} />,
    checks: () => {
      const r = r1()
      return ['AF', 'MD', 'MH', 'DH'].map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => {
      const r = r1()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Reactions.** $\\sum M_D = 0$: $R_A(60) = 20(40) + 30(20)$ → $R_A = ${fmt(r.reaction('A').ry)}$ k ↑, so $R_D = ${fmt(r.reaction('D').ry)}$ k ↑ (no horizontal load → $D_x = 0$).

**Zero-force members.** Joint E has only EA and EF (not collinear, no load) → both zero. Joint B: BF is the only vertical member → BF = 0.

**Joint A** (now AB, AF only, AE = 0): vertical equilibrium $R_A + F_{AF}\\sin45° = 0$ → AF is compression, $|F_{AF}| = R_A\\sqrt2 = ${fmt(Math.abs(r.member('AF').N(1)))}$ k.

**Section through GH, MH, MD and CD** (right part: joints H and D). Take moments about D: only GH has an arm, so you get $F_{GH}$. Then go to **joint H** (GH, HM, HD) and **joint D** (DC, DM, DH, $R_D$) and use $\\tan\\alpha = 10/20$ for MD and $\\tan\\beta = 20/20$ for MH. The full solution:`}</Md>
          <TrussSolution model={t1} asked={['AF', 'MD', 'MH', 'DH']} />
          <Md>{`**Answers:** AF = **${fmt(Math.abs(r.member('AF').N(1)))} k (${r.member('AF').N(1) > 0 ? 'T' : 'C'})**, MD = **${fmt(Math.abs(r.member('MD').N(1)))} k (${r.member('MD').N(1) > 0 ? 'T' : 'C'})**, MH = **${fmt(Math.abs(r.member('MH').N(1)))} k (${r.member('MH').N(1) > 0 ? 'T' : 'C'})**, DH = **${fmt(Math.abs(r.member('DH').N(1)))} k (${r.member('DH').N(1) > 0 ? 'T' : 'C'})**.`}</Md>
        </div>
      )
    },
    notes: [
      'Marks are not printed for Section A ("questions of equal value"): 280/10 answered questions = 28 each.',
      'Support at A read as a roller and at D as a pin (from the support symbols). The node at the bottom of G–M (labelled "e"/"C" in the scan) is taken as C at x = 40 ft.',
      'The double tick marks on AF, MH, MD and DH in the figure just flag the members asked.',
    ],
  },
  {
    id: '2011-12-A2',
    paper: PAPER,
    sec: 'A',
    no: '2',
    marks: 28,
    topics: ['frames'],
    title: 'Frame with fixed base, hinge and inclined link — given M_A = 300 k-ft',
    pages: PA,
    text: `Draw shear force and bending moment diagrams for the members of the frame in Fig. 2. Given: $M_A = 300$ k-ft (anti-clockwise).

Column A–D (fixed at A) is 15 ft high with 20 k horizontal loads (→) at 5 ft and 10 ft above A. Beam C–D–E–F at the top: cantilever C 5 ft left of D carrying a 100 k-ft anticlockwise couple at C; E 10 ft right of D carries 50 k; 2 k/ft on E–F (10 ft). F is a **hinge**, from which member F–B goes down to a pin at B (5 ft right of F, 15 ft lower).`,
    figure: () => <Figure model={f2Fig} dims={[-5, 0, 10, 20, 25]} dimY={[0, 5, 10, 15]} />,
    checks: () => {
      const r = r2()
      const fb = r.member('FB').N(1)
      return [
        { key: 'Ay', label: 'Vertical reaction at A (↑ +)', value: r.reaction('A').ry, unit: 'k' },
        { key: 'Ax', label: 'Horizontal reaction at A (→ +)', value: r.reaction('A').rx, unit: 'k' },
        { key: 'FB', label: 'Axial force in FB (T +, C −)', value: fb, unit: 'k' },
        { key: 'MD', label: 'Moment at the top of column AD (sagging +, member read A→D)', value: r.member('AD').M(15 - 1e-6), unit: 'k-ft' },
      ]
    },
    solution: () => {
      const r = r2()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Why $M_A$ is given.** Unknowns: fixed A (3) + pin B (2) = 5; equations: 3 + 1 (hinge F) = 4 → indeterminate to degree 1. Supplying $M_A = 300$ k-ft makes it determinate. Because F is a hinge and FB carries no load, **FB is a two-force member** (force along FB, slope 15 : 5).

**Free body of the whole frame** (A pinned + known couple 300 k-ft ↺ at A):
- $\\sum M_A = 0$ gives the link force $F_{FB}$ (only unknown with a moment arm about A).
- Then $\\sum F_x$ and $\\sum F_y$ give $A_x, A_y$.
Check with the hinge: moment at F from the right part (just the link) is zero ✓.`}</Md>
          <FrameSolution model={f2} kinds={['V', 'M', 'N']} />
          <Md>{`Results: $A_x = ${fmt(Math.abs(r.reaction('A').rx))}$ k ${r.reaction('A').rx < 0 ? '←' : '→'}, $A_y = ${fmt(r.reaction('A').ry)}$ k ↑, link FB = **${fmt(Math.abs(r.member('FB').N(1)))} k (${r.member('FB').N(1) > 0 ? 'tension' : 'compression'})** with components ${fmt(Math.abs(r.reaction('B').rx))} k horizontal and ${fmt(Math.abs(r.reaction('B').ry))} k vertical at B.`}</Md>
        </div>
      )
    },
    notes: [
      'The given M_A = 300 k-ft (anticlockwise) is taken as the support reaction moment acting on the frame. The solver therefore pins A and applies this couple; the reactions table shows it as a load, not as a reaction.',
      'For reference, an elastic analysis with constant EI would give a different M_A. The paper supplies the value, so the answer depends only on statics with that value.',
      'Couple at C read as anticlockwise (arrow sweeps from the top round to the left).',
    ],
  },
  {
    id: '2011-12-A3',
    paper: PAPER,
    sec: 'A',
    no: '3(a, b)',
    marks: 28,
    topics: ['cable'],
    title: 'Suspension bridge (3-hinged girder): hanger force, girder SFD & BMD',
    pages: PA,
    text: `(a) Determine the hanger force of the suspension bridge in Fig. 3. (b) Draw shear force and bending moment diagrams for the stiffening girders.

Span 10 @ 100 ft = 1000 ft, cable sag 60 ft, stiffening girders hinged at the towers and at midspan. Loads: 30 k at 400 ft and 50 k at 700 ft from the left tower.`,
    figure: () => <StructureView model={sm3} autoDimX={[0, 400, 500, 700, 1000]} maxHeight={260} />,
    checks: () => {
      const s = s3()
      const g = hangerGirder({ L: 1000, panel: 100, q: s.q, loads: sus3.loads })
      const mx = Math.max(g.max.M, -g.min.M)
      return [
        { key: 'H', label: 'Horizontal cable tension H', value: s.H, unit: 'k' },
        { key: 'hg', label: 'Hanger force (spacing 100 ft)', value: s.q * 100, unit: 'k' },
        { key: 'M400', label: 'Girder moment under the 30 k load (x = 400 ft)', value: s.M(400), unit: 'k-ft' },
        { key: 'Mmax', label: 'Largest girder moment magnitude', value: mx, unit: 'k-ft', magnitude: true },
      ]
    },
    solution: () => {
      const s = s3()
      const g = hangerGirder({ L: 1000, panel: 100, q: s.q, loads: sus3.loads })
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Treat girder + cable as one system. A parabolic cable puts a **uniform** upward hanger load $q$ on the girder, and $q = 8Hh/L^2$. The central hinge (zero girder moment) gives the extra equation for $H$: the girder moment there equals the simple-beam moment minus $H$ × cable sag.

Simple beam: $R_{left} = 30(600)/1000 + 50(300)/1000 = 33$ k; $M_0(500) = 33(500) - 30(100) = 13{,}500$ k-ft.`}</Md>
          <SuspensionSolution {...sus3} panel={100} />
          <Md>{`Each hanger carries **${fmt(g.F)} k** (all 9 hangers equal). They lift ${fmt(9 * g.F)} k in all against the 80 k applied, so the girder reactions at the towers come out ${g.RA < 0 ? 'downward' : 'upward'} at the left (${fmt(g.RA)} k) and ${g.RB < 0 ? 'downward' : 'upward'} at the right (${fmt(g.RB)} k); the end half-panels go straight into the towers.`}</Md>
        </div>
      )
    },
    notes: ['Load positions read from the hangers: 30 k at the 4th hanger (400 ft), 50 k at the 7th hanger (700 ft). The 60 ft sag is measured at midspan.'],
  },
  {
    id: '2011-12-A4',
    paper: PAPER,
    sec: 'A',
    no: '4',
    marks: 28,
    topics: ['vw'],
    title: 'Truss: horizontal deflection of joint F',
    pages: PA,
    text: `For the truss in Fig. 4, compute the horizontal component of the deflection of joint **F**. $E = 30{,}000$ ksi, $A_1 = 10$ in² for horizontal members and $A_2 = 15$ in² for vertical and diagonal members. Geometry: A(0,0) pin, B(10,0), C(20,0) roller, D(0,10), E(10,10), F(0,20) (ft); 20 k at E downward.`,
    figure: () => <Figure model={t4} labels />,
    checks: () => [{ key: 'dF', label: 'Horizontal deflection of F (→ +)', value: vw4().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Real system: 20 k at E → forces $N$. Virtual system: **unit horizontal load at F** (→) → forces $n$. Then $\\Delta_F = \\sum \\dfrac{N n L}{AE}$. Joint F has only FD and FE (no load), so $N_{FD} = N_{FE} = 0$, but the unit load at F does stress them; F still moves because the joints below it move.`}</Md>
        <VWSolution model={t4} real={t4.loads} virtual={[H('F', 1)]} opts={vw4opts} scale={12} resultUnit="in" what="Δ_F (horizontal)" unitNote="N, n in kip; L in ft; A in in²; E = 30000 ksi; × 12 to get inches. + = in the direction of the unit load (to the right)." />
      </div>
    ),
  },
  {
    id: '2011-12-A5',
    paper: PAPER,
    sec: 'A',
    no: '5',
    marks: 28,
    topics: ['vw'],
    title: 'Simple beam with step in I: deflection under the point load',
    pages: PA,
    text: `Compute the vertical deflection at **B** (point of the concentrated load) for the beam in Fig. 5: simply supported A–C, span 25 ft, 30 k at B (10 ft from A), uniform 2 k/ft over the whole span. $E = 30{,}000$ ksi, $I = 200$ in⁴ for AB and $I_2 = 300$ in⁴ for BC.`,
    figure: () => <Figure model={b5} />,
    checks: () => [{ key: 'dB', label: 'Vertical deflection at B (↓ +)', value: vw5().total * 12, unit: 'in' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Reactions: $R_A = 30(15)/25 + 2(25)/2 = 43$ k, $R_C = 30(10)/25 + 25 = 37$ k. With x from A on AB: $M = 43x - x^2$, $m = 0.6x$; with x′ from C on CB: $M = 37x' - x'^2$, $m = 0.4x'$.
$$\\Delta_B = \\int_0^{10}\\frac{(43x - x^2)(0.6x)}{EI_1}dx + \\int_0^{15}\\frac{(37x' - x'^2)(0.4x')}{EI_2}dx'$$`}</Md>
        <VWSolution model={b5} real={b5.loads} virtual={[P('B', 1)]} opts={vw5opts} scale={12} resultUnit="in" what="Δ_B (downward)" unitNote="EI = E·I/144 in k-ft²; result in ft × 12 = in." />
      </div>
    ),
  },
  {
    id: '2011-12-A6',
    paper: PAPER,
    sec: 'A',
    no: '6',
    marks: 28,
    topics: ['vw'],
    title: 'Cantilever with step in section: slope at the free end D',
    pages: PA,
    text: `Calculate the change in slope at point **D** for the loads in Fig. 6: cantilever fixed at A, B at 10 ft, C at 20 ft, free end D at 25 ft; 20 k at B and 10 k at C (downward), 5 k horizontal (→) at D. $E = 30\\times10^3$ ksi, $A_1 = 15$ in² (AB), $A_2 = 10$ in² (BD), $I_1 = 400$ in⁴ (AB), $I_2 = 200$ in⁴ (BD).`,
    figure: () => <Figure model={b6} />,
    checks: () => [{ key: 'th', label: 'Rotation at D (radians, magnitude)', value: Math.abs(vw6().total), tol: 0.03, magnitude: true }],
    solution: () => {
      const th = vw6().total
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Virtual system: **unit ${rotPos()} couple at D**. Its moment is $m = ${isCW() ? '-1' : '1'}$ everywhere and it causes no axial force ($n = 0$), so the 5 k axial load (and the areas) do not affect the slope. With x from D: $M = 0$ on DC, $M = -10(x-5)$ on CB, $M = -10(x-5) - 20(x-15)$ on BA.
$$\\theta_D = \\int\\frac{Mm}{EI}dx = \\frac{1}{EI_2}\\int_5^{15}10(x-5)dx + \\frac{1}{EI_1}\\int_{15}^{25}[10(x-5) + 20(x-15)]dx$$`}</Md>
          <VWSolution model={b6} real={b6.loads} virtual={[Mo('D', rotK())]} opts={vw6opts} what={`θ_D (${rotTag()})`} resultUnit="rad" unitNote="EI in k-ft², EA in k; the axial column is zero because the unit couple gives n = 0." />
          <Md>{`$\\theta_D = ${fmt(Math.abs(th), 5)}$ rad **${rotWord(th)}** $= ${fmt((Math.abs(th) * 180) / Math.PI, 3)}°$. The fixed end does not rotate, so this is also the change in slope from A to D.`}</Md>
        </div>
      )
    },
    notes: ['The I values are read from Fig. 6: I₁ = 400 in⁴ for AB and I₂ = 200 in⁴ for BD.'],
  },
  {
    id: '2011-12-A7',
    paper: PAPER,
    sec: 'A',
    no: '7',
    marks: 28,
    topics: ['vw'],
    title: 'Portal frame (pin + roller): vertical deflection of D',
    pages: PA,
    text: `Determine the vertical deflection of point **D** of the frame in Fig. 7. Columns AC and BE are 12 ft high; beam C–D–E with CD = 10 ft, DE = 5 ft; 10 k horizontal (→) at C; A pinned, B on rollers. $E = 30000$ ksi, $I_1 = 400$ in⁴ and $A_1 = 15$ in² for the columns, $I_2 = 600$ in⁴ and $A_2 = 20$ in² for the beam.`,
    figure: () => <Figure model={f7} />,
    checks: () => [{ key: 'dD', label: 'Vertical deflection of D (↓ +)', value: vw7().total * 12, unit: 'in' }],
    solution: () => {
      const v = vw7()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Real: $\\sum M_A = 0$ → $R_B = 10(12)/15 = 8$ k ↑, $A_y = 8$ k ↓, $A_x = 10$ k ←. Column BE has no moment (roller, vertical reaction). Virtual: unit load ↓ at D → $r_B = 10/15$, $r_A = 5/15$ ↑, $a_x = 0$.
Moments: column AC $M = 10y$ (real), $m = 0$; beam CE: real $M$ goes linearly from 120 k-ft at C to 0 at E, virtual $m$ is a triangle with peak $\\tfrac{10\\times5}{15} = 3.33$ k-ft at D. Axial forces are included because they are asked for (A₁, A₂ given).`}</Md>
          <VWSolution model={f7} real={f7.loads} virtual={[P('D', 1)]} opts={vw7opts} scale={12} resultUnit="in" what="Δ_D (downward)" unitNote="EI = E·I/144 k-ft², EA = E·A k; result ft × 12 = in." />
          <p className="text-xs text-faint">Bending gives {fmt(v.terms.reduce((s, t) => s + t.bending, 0) * 12, 4)} in; the axial terms add {fmt(v.terms.reduce((s, t) => s + t.axial, 0) * 12, 5)} in.</p>
        </div>
      )
    },
  },
  // ---------------------------------------------------------------- Section B
  {
    id: '2011-12-B8',
    paper: PAPER,
    sec: 'B',
    no: '8',
    marks: 28,
    topics: ['vertical'],
    title: 'Irregular frame under gravity: 0.1L method + max moment in column BF',
    pages: PB,
    text: `The beams of the building frame in Fig. 8 carry a uniform dead load of 6 kip/ft and live load of 4 kip/ft. Using the approximate method, draw bending moment diagrams for all beams and columns. Also determine the **maximum possible bending moment in column BF**. EI is constant and the same for all columns. Draw diagrams on the compression side.

Geometry: pinned bases A(0), B(30), C(50), D(60) ft. Beams: H–I (30 ft) at 30 ft; E–F (30 ft) and F–G (20 ft) at 20 ft; J–K (10 ft) at 25 ft. Columns A–E–H, B–F–I, C–G–J, D–K.`,
    figure: () => <Figure model={f8} />,
    checks: () => {
      const v = vertical8(W_FULL)
      return [
        { key: 'mEF', label: 'Beam EF (and HI) end moment, full load', value: v.beams[1].Mend, unit: 'k-ft' },
        { key: 'mFG', label: 'Beam FG end moment, full load', value: v.beams[2].Mend, unit: 'k-ft' },
        { key: 'bf', label: 'Column BF top moment, full load on all beams', value: Math.abs(v.cm.get('BF')!.top), unit: 'k-ft', magnitude: true },
        { key: 'bfmax', label: 'Max possible moment in column BF', value: bfMax(), unit: 'k-ft', magnitude: true },
      ]
    },
    solution: () => <Sol8 />,
    notes: [
      'Approximate method used: the 0.1L rule. Inflection points sit 0.1L from each beam end, giving a hogging end moment of 0.045wL², sagging midspan moment of 0.08wL² and end shear of 0.5wL.',
      'The unbalanced beam moment at a joint is shared by the columns above and below in proportion to I/L (EI constant, so 1/L). Pinned bases take no moment. Some teachers use the modified 3EI/L stiffness for a column with a pinned far end. That would raise the share going to BF.',
      'Maximum moment in BF: dead + live on EF, dead only on FG (pattern loading). Loading is checked at joint F only, since in this method only F feeds BF.',
    ],
  },
  {
    id: '2011-12-B9',
    paper: PAPER,
    sec: 'B',
    no: '9',
    marks: 28,
    topics: ['eq'],
    title: 'EQ vertical distribution: 8-storey steel hospital in Dhaka (BNBC 1993)',
    pages: [18],
    text: `Calculate the vertical distribution of earthquake forces for a 24 m high, 8-storied hospital building (equal storey heights) in Dhaka. Structural system: special moment resisting frame in steel ($R = 12$). Plan 30 m × 30 m. Use the equivalent static force method of BNBC.

Given: dead load 7 kN/m² and partition wall load 3 kN/m² for each floor; $Z = 0.15$, $I = 1.25$, site coefficient $S = 1.5$, $C_t = 0.083$; $C \\le 2.75$ and $C/R \\ge 0.075$.`,
    legacy: 'Set under BNBC 1993: V = ZICW/R, C = 1.25S/T^(2/3), T = Ct·h^(3/4), Ft = 0.07TV. The solution follows that code as intended, then repeats the problem under BNBC 2020 (Dhaka zone 2, Z = 0.20, hospital → occupancy IV, I = 1.5, site class SD assumed for S = 1.5, special steel MRF R = 8).',
    checks: () => [
      { key: 'T', label: 'Period T (BNBC 1993)', value: eq9.T, unit: 's' },
      { key: 'C', label: 'Coefficient C', value: eq9.C },
      { key: 'V', label: 'Base shear V (BNBC 1993)', value: eq9.V, unit: 'kN' },
      { key: 'Fr', label: 'Roof force incl. Ft (BNBC 1993)', value: eq9.rows[0].F, unit: 'kN' },
    ],
    solution: () => <Sol9 />,
    notes: [
      'Each of the 8 levels (roof included) is taken to weigh (7 + 3) × 900 = 9000 kN, since the loads are given "for each floor". Hospital live load is not part of the seismic weight here: the code adds 25 % of LL only for storage/warehouse occupancies.',
      'For the BNBC 2020 version, S = 1.5 (soft soil) is mapped to site class SD, which is an assumption.',
    ],
  },
  {
    id: '2011-12-B10',
    paper: PAPER,
    sec: 'B',
    no: '10',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method: 2-bay (20 ft, 10 ft), 3-storey frame',
    pages: PB,
    text: `Using the portal method, draw the bending moment diagram of the frame in Fig. 9 and the shear force diagrams for the girders (BMD on the compression side). Bays 20 ft and 10 ft; storey heights 16 ft (ground), 12 ft, 10 ft (top); fixed bases. Lateral loads acting **to the left** at the right end: 8 k at the first floor, 12 k at the second floor, 16 k at the roof.`,
    figure: () => <StructureView model={{ ...portalModel10() }} autoDimX autoDimY maxHeight={300} />,
    checks: () => {
      const r = portalMethod(g10)
      return [
        { key: 'v1', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'm1', label: 'Exterior column end moment, ground storey', value: r.columns[0][0].mTop, unit: 'k-ft' },
        { key: 'mb1', label: 'Left (20 ft) girder end moment, first floor', value: r.beams[0][0].moment, unit: 'k-ft' },
        { key: 'vb1', label: 'Left (20 ft) girder shear, first floor', value: r.beams[0][0].shear, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Portal assumptions: hinges at mid-height of all columns and midspan of all girders; interior column takes **twice** the shear of an exterior column (2 bays → 4 shares). Storey shears: top 16 k, middle 28 k, ground 36 k. Girder end moment = sum of column moments at the joint minus the girder moment on the other side; girder shear = 2M/L (so the short 10 ft girder has the larger shear).`}</Md>
        <ApproxSolution g={g10} method="portal" />
      </div>
    ),
  },
  {
    id: '2011-12-B11',
    paper: PAPER,
    sec: 'B',
    no: '11',
    marks: 28,
    topics: ['truss'],
    title: 'X-braced truss (diagonals take compression): approximate bar forces',
    pages: PB,
    text: `Using the approximate method, determine the bar forces in the truss in Fig. 10. Diagonals can carry compression. Five panels @ 3 ft = 15 ft, depth 4 ft, crossed diagonals in every panel. Roller at the second bottom joint (x = 3 ft), pin at the right end (x = 15 ft). Loads: 8 k down at the bottom-left joint, 8 k **up** at the top joint at x = 6 ft, 24 k down at the bottom joint at x = 9 ft.`,
    figure: () => <Figure model={t11} />,
    checks: () => {
      const f = x11().forces
      return [
        { key: 'd2', label: 'Diagonal L1U2 (panel 2) force (T +)', value: f.get('L1U2')!, unit: 'k' },
        { key: 'd4', label: 'Diagonal L3U4 (panel 4) force (T +)', value: f.get('L3U4')!, unit: 'k' },
        { key: 'c', label: 'Top chord U3U4 force (T +)', value: f.get('U3U4')!, unit: 'k' },
      ]
    },
    solution: () => {
      const r = solve(t11)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Each panel has two diagonals, so the truss is indeterminate to the 5th degree. **Approximation:** the two diagonals of a panel share the panel shear **equally**, one in tension and one in compression (diagonals can take compression). Each diagonal's vertical component is therefore $V/2$, and its force is $\\pm\\dfrac{V}{2}\\cdot\\dfrac{5}{4}$ (diagonal length 5 ft for a 3 × 4 panel). The chords and verticals then follow from joint equilibrium / sections.

Reactions: $R_{L1} = ${fmt(r.reaction('L1').ry)}$ k ↑, $R_{L5} = ${fmt(r.reaction('L5').ry)}$ k ↑ (statics). Panel shears (left of the cut): panel 1: −8; panel 2: $−8 + ${fmt(r.reaction('L1').ry)} = ${fmt(-8 + r.reaction('L1').ry)}$; panel 3: $${fmt(-8 + r.reaction('L1').ry + 8)}$; panels 4–5: $${fmt(-8 + r.reaction('L1').ry + 8 - 24)}$ k.`}</Md>
          <TrussSolution model={t11} forces={x11().forces} note="Forces from the equal-shear assumption (average of the determinate cases with one diagonal per panel removed — identical to splitting each panel shear 50/50)." />
        </div>
      )
    },
    notes: ['Support symbols read as a roller at x = 3 ft and a pin at x = 15 ft. Diagonals are assumed not connected where they cross.'],
  },
  {
    id: '2011-12-B12',
    paper: PAPER,
    sec: 'B',
    no: '12',
    marks: 28,
    topics: ['ild'],
    title: 'ILDs for an overhanging beam with a suspended span',
    pages: PB,
    text: `For the beam in Fig. 11, draw influence lines for (a) moment at A, (b) shear just right of support B, (c) shear just left of support B and (d) reaction at B.

Left support (pin, called O here) at 0; A at 20 ft; roller B at 100 ft; internal hinge (called C) at 140 ft; roller (called D) at 200 ft.`,
    figure: () => <Figure model={b12} />,
    checks: () => [
      { key: 'ma', label: '$M_A$ peak ordinate (unit load at A)', value: ildAt(ild12(R12.MA), 20), unit: 'ft' },
      { key: 'mac', label: '$M_A$ ordinate with the unit load at the hinge', value: ildAt(ild12(R12.MA), 140), unit: 'ft' },
      { key: 'vbl', label: '$V_{B^-}$ ordinate at the hinge', value: ildAt(ild12(R12.VBl), 140) },
      { key: 'rb', label: '$R_B$ ordinate at the hinge', value: ildAt(ild12(R12.RB), 140) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`O–B–C is a simple beam (span 100 ft) with a 40 ft overhang; C–D (60 ft) is a suspended span hanging from C. For any function on O–C: draw the ILD of the overhanging beam, then join its ordinate at the hinge C **linearly to zero at D** (a load on C–D sends only the fraction $(200 - x)/60$ to C).
- $M_A$: triangle with peak $\\dfrac{20\\times80}{100} = 16$ at A, extended over the overhang to $-\\dfrac{20\\times40}{100} = -8$ at C.
- $V_{B^+}$: 0 on O–B, **+1** over B–C, then to 0 at D.
- $V_{B^-}$: $-x/100$ on O–B (−1 just left of B), $-0.4$ at C.
- $R_B$: $x/100$ on O–B, 1.4 at C, 0 at D.`}</Md>
        <ILDStack
          model={b12}
          path={p12}
          items={[
            { label: 'M_A', resp: R12.MA },
            { label: 'V just right of B', resp: R12.VBr },
            { label: 'V just left of B', resp: R12.VBl },
            { label: 'R_B', resp: R12.RB },
          ]}
        />
      </div>
    ),
    notes: ['The figure names only A, B and the hinge. The left support, hinge and right support are called O, C and D here.'],
  },
  {
    id: '2011-12-B13',
    paper: PAPER,
    sec: 'B',
    no: '13',
    marks: 28,
    topics: ['floor'],
    title: 'Curved-chord truss: force in the counter U2L3',
    pages: PB,
    text: `Calculate the force in the counter **U2L3** of the truss in Fig. 12 due to a moving UDL of 3 kip/ft accompanied by a roving concentration of 60 kip. The dead load of the truss is 1.5 kip/ft.

8 panels @ 30 ft = 240 ft; verticals U1L1…U7L7 = 31, 36, 39, 40, 39, 36, 31 ft; diagonals L0U1 (end post), U1L2, **L2U3** (main diagonal of panel 2–3), U3L4, L4U5, U5L6, L6U7, U7L8; counter U2L3 (dashed) in panel 2–3. Loads applied at the bottom-chord panel points.`,
    figure: () => <Figure model={t13fig} />,
    checks: () => {
      const m = uniformPlusConcentrated(ild13main(), 3, 60, 1.5)
      const c = uniformPlusConcentrated(ild13ctr(), 3, 60, 1.5)
      return [
        { key: 'mDL', label: 'Main diagonal L2U3 under dead load alone (T +)', value: m.dead, unit: 'k' },
        { key: 'cDL', label: 'Counter U2L3 under dead load alone (main inactive, T +)', value: c.dead, unit: 'k' },
        { key: 'ctr', label: 'Maximum tension in the counter U2L3', value: c.maxPos.total, unit: 'k' },
      ]
    },
    solution: () => {
      const m = uniformPlusConcentrated(ild13main(), 3, 60, 1.5)
      const c = uniformPlusConcentrated(ild13ctr(), 3, 60, 1.5)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Procedure for a counter.** Counters (and the diagonals they pair with) are slender and act only in **tension**. In panel 2–3 only one of L2U3 and U2L3 works at a time. (1) Find the force in the main diagonal L2U3 with the counter absent. (2) With the main diagonal out, the force in the counter is dead load + live load placed to give the counter its **maximum tension**.

Because the chords are not parallel, each ILD comes from a section through panel 2–3 with moments about the point where chords U2U3 and L2L3 meet. The ILD is straight between panel points, with its two peaks at L2 and L3.`}</Md>
          <ILDStack model={t13main} path={p13} items={[{ label: 'L2U3 (main diagonal, counter absent)', resp: { kind: 'force', member: 'L2U3' } }]} />
          <ILDStack model={t13ctr} path={p13} items={[{ label: 'U2L3 (counter, main diagonal removed)', resp: { kind: 'force', member: 'U2L3' } }]} />
          <MaxEffect ild={ild13main()} w={3} P={60} wd={1.5} label="Main diagonal L2U3 (counter absent)" />
          <Md>{`In this geometry the main diagonal L2U3 is already **${m.dead < 0 ? 'compressed' : 'stretched'}** by the dead load (${fmt(m.dead)} k) and reaches ${fmt(m.maxNeg.total)} k under live load. A tension-only diagonal cannot do that, so the counter U2L3 takes over:`}</Md>
          <MaxEffect ild={ild13ctr()} w={3} P={60} wd={1.5} label="Counter U2L3 (main diagonal inactive)" />
          <p className="text-base">
            Force in the counter U2L3 = <b className="num">{fmt(c.maxPos.total)} k (tension)</b> — dead {fmt(c.dead)} k + live {fmt(c.maxPos.live)} k (3 k/ft over the positive part of the ILD, 60 k at L3).
          </p>
        </div>
      )
    },
    notes: [
      'All loads are taken at the bottom-chord panel points (deck truss loaded through floor beams).',
      'With these heights the main diagonal L2U3 is in compression even under dead load alone. The textbook counter procedure still applies: drop the main diagonal and maximise counter tension (DL + LL on the positive part + roving load at the peak). That is the answer given.',
    ],
  },
  {
    id: '2011-12-B14',
    paper: PAPER,
    sec: 'B',
    no: '14',
    marks: 28,
    topics: ['wheel'],
    title: 'Wheel train + trailing UDL: max moment 20 ft from the support of an 80 ft span',
    pages: PB,
    text: `Due to the wheel loading in Fig. 13, calculate the maximum moment at a distance 20 ft from the left support of a simply supported beam of 80 ft span. Wheels 1–10: 20, 20, 80, 80, 80, 80, 80, 80, 20, 20 k at spacings 4, 10, 6, 6, 12, 6, 6, 10, 4 ft, followed 8 ft behind wheel 10 by a uniform load of 8 k/ft.`,
    checks: () => [{ key: 'm', label: 'Maximum moment at 20 ft', value: trainExtremes(ild14, train14).max.value, unit: 'k-ft' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Moment ILD at a = 20 ft: triangle with peak $\\dfrac{20\\times60}{80} = 15$ at x = 20. **Criterion:** the moment is maximum with a wheel at the section when the average load to the left of the section equals the average load on the whole span. Moving the train left by $\\delta$ changes M by $\\delta\\left(\\dfrac{W a}{L} - W_L\\right)$, so keep moving while $W_L/a < W/L$. In practice put each heavy wheel at the peak in turn and compare, with the train travelling right → left (wheel 1 leads); wheel 4 at the section governs. The trailing 8 k/ft adds to the response when it is on the span.`}</Md>
        <TrainOnILD ild={ild14} t={train14} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="moment at 20 ft" resUnit="k-ft" />
      </div>
    ),
    notes: ['The 8 k/ft uniform load is taken to follow wheel 10 at 8 ft and to be long enough to cover the rest of the span.'],
  },
]

// ---------------------------------------------------------------- helper renderers
function portalModel10(): Model {
  const m = solveModelForPortal()
  return m
}
function solveModelForPortal(): Model {
  // drawing only
  const names = [
    ['A', 'B', 'C'],
    ['D', 'E', 'F'],
    ['G', 'H', 'I'],
    ['J', 'K', 'L'],
  ]
  const Y = [0, 16, 28, 38]
  const xs = g10.xs
  const nodes = names.flatMap((row, l) => row.map((n, j) => ({ id: n, x: xs[j], y: Y[l] })))
  const members: Model['members'] = []
  for (let s = 0; s < 3; s++) for (let j = 0; j < 3; j++) members.push({ id: names[s][j] + names[s + 1][j], i: names[s][j], j: names[s + 1][j] })
  for (let l = 1; l < 4; l++) for (let j = 0; j < 2; j++) members.push({ id: names[l][j] + names[l][j + 1], i: names[l][j], j: names[l][j + 1] })
  return {
    nodes,
    members,
    supports: names[0].map((n) => ({ node: n, type: 'fixed' as const })),
    loads: [H('F', -8, '8k'), H('I', -12, '12k'), H('L', -16, '16k')],
  }
}

function Sol8() {
  const [mode, setMode] = useState<'full' | 'bf'>('full')
  const w = mode === 'full' ? W_FULL : W_BF
  const v = useMemo(() => vertical8(w), [w])
  const d = useMemo(() => diagrams8(w), [w])
  const bf = vertical8(W_BF)
  const fJ = bf.joints.find((j) => j.node === 'F')!
  return (
    <div className="space-y-3 text-sm">
      <Md>{`**0.1L method.** Put inflection points at 0.1L from both ends of every beam. The middle 0.8L is then a simple beam: $M_{mid} = w(0.8L)^2/8 = 0.08wL^2$. Each 0.1L end piece is a cantilever carrying its own load plus the $0.4wL$ reaction of the middle part: $M_{end} = 0.045wL^2$ (hogging). Columns take the **unbalanced** beam moment at each joint, shared between the column above and the column below in proportion to $I/L$ (EI constant → $1/L$). The pinned bases have zero moment.

With $w = 6 + 4 = 10$ k/ft on every beam: HI, EF (L = 30): $M_{end} = 0.045(10)(900) = 405$, $M_{mid} = 720$ k-ft; FG (L = 20): 180 / 320 k-ft; JK (L = 10): 45 / 80 k-ft.`}</Md>
      <table className="tbl w-auto">
        <thead>
          <tr>
            <th>Joint</th>
            <th>Unbalanced beam moment (k-ft)</th>
            <th>Columns: k = 1/L → share → end moment</th>
          </tr>
        </thead>
        <tbody>
          {v.joints.map((j) => (
            <tr key={j.node}>
              <td className="txt font-semibold">{j.node}</td>
              <td>{fmt(Math.abs(j.S))}</td>
              <td className="txt">{j.shares.map((s) => `${s.col}: ${fmt(s.k, 3)} → ${fmt(s.share, 3)} → ${fmt(Math.abs(s.M))}`).join(';  ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <div className="font-semibold">Bending moment diagram</div>
        <Seg value={mode} onChange={setMode} items={[{ v: 'full', label: 'DL + LL on all beams' }, { v: 'bf', label: 'Pattern for max M in BF' }]} />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <DiagramView model={f8} members={d} kind="M" side="compression" />
      </div>
      <Md>{`**Maximum moment in column BF.** Only joint F feeds BF. Its unbalanced moment is largest with **DL + LL on EF and DL only on FG**:
$$M_{unb} = 0.045[10(30)^2 - 6(20)^2] = ${fmt(Math.abs(fJ.S))}\\text{ k-ft}$$
Share of BF $= \\dfrac{1/20}{1/10 + 1/20} = \\dfrac13$ → $M_{BF,max} = \\mathbf{${fmt(bfMax())}}$ k-ft at F (zero at the pinned base B). The opposite pattern (LL on FG only) gives just $0.045[6(900) - 10(400)]/3 = ${fmt((0.045 * (6 * 900 - 10 * 400)) / 3)}$ k-ft.`}</Md>
    </div>
  )
}

function Sol9() {
  const e = eq9
  const r20 = eqResult(eq9new)
  return (
    <div className="space-y-3 text-sm">
      <Md>{`**BNBC 1993 (as set).** Storey height = 24/8 = 3 m. Seismic weight per level $w = 30\\times30\\times(7 + 3) = ${fmt(e.wf)}$ kN, $W = 8w = ${fmt(e.Wt)}$ kN.`}</Md>
      <Tex block>{`T = C_t h_n^{3/4} = 0.083(24)^{3/4} = ${fmt(e.T, 4)}\\text{ s},\\qquad C = \\frac{1.25S}{T^{2/3}} = \\frac{1.25(1.5)}{${fmt(e.T, 4)}^{2/3}} = ${fmt(e.Craw, 4)}\\ (\\le 2.75\\ ✓)`}</Tex>
      <Tex block>{`\\frac{C}{R} = \\frac{${fmt(e.C, 4)}}{12} = ${fmt(e.C / 12, 4)}\\ (\\ge 0.075\\ ✓),\\qquad V = \\frac{ZIC}{R}W = 0.15(1.25)(${fmt(e.CR, 4)})(${fmt(e.Wt)}) = \\mathbf{${fmt(e.V)}}\\text{ kN}`}</Tex>
      <Tex block>{`T = ${fmt(e.T, 3)} > 0.7\\text{ s} \\Rightarrow F_t = 0.07TV = ${fmt(e.Ft)}\\text{ kN}\\ (\\le 0.25V = ${fmt(0.25 * e.V)}),\\qquad F_x = \\frac{(V - F_t)w_xh_x}{\\sum w_ih_i}`}</Tex>
      <table className="tbl w-auto">
        <thead>
          <tr>
            <th>Level</th>
            <th>h (m)</th>
            <th>w (kN)</th>
            <th>w·h</th>
            <th>Fx (kN)</th>
            <th>Storey shear (kN)</th>
          </tr>
        </thead>
        <tbody>
          {e.rows.map((r) => (
            <tr key={r.name}>
              <td className="txt">{r.name}</td>
              <td>{fmt(r.h)}</td>
              <td>{fmt(r.w)}</td>
              <td>{fmt(r.wh)}</td>
              <td className="font-semibold">{fmt(r.F)}</td>
              <td>{fmt(r.Vx)}</td>
            </tr>
          ))}
          <tr>
            <td className="txt font-bold">Σ</td>
            <td />
            <td>{fmt(e.Wt)}</td>
            <td>{fmt(e.sumWh)}</td>
            <td>{fmt(e.V)}</td>
            <td />
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-faint">Roof force includes F_t = {fmt(e.Ft)} kN.</p>
      <Md>{`**Same building under BNBC 2020.** Dhaka → zone 2 ($Z = 0.20$); hospital → occupancy IV ($I = 1.5$); soft soil → site class SD (assumed); SD + zone 2 + occupancy IV → SDC D → special steel moment frame, $R = 8$; $T = 0.0724h_n^{0.8}$. Result: $V = ${fmt(r20.V)}$ kN, compared with ${fmt(e.V)} kN under the 1993 code.`}</Md>
      <EQSolution {...eq9new} />
    </div>
  )
}

void ildExtremes
