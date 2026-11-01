// 2015-16 term final (held 29 Jan 2017) — scan pages 26–29.
import { useState } from 'react'
import { isCW, rotK, rotPos, rotTag, rotWord } from '../../engine/sign'
import type { PYQ } from '../types'
import { solve } from '../../engine/frame2d'
import { influenceLine, ildAt, ildExtremes } from '../../engine/ild'
import { portalMethod, xBraced, type GridFrame } from '../../engine/approx'
import { trainExtremes, ssMomentILD, ssShearILD, type Train } from '../../engine/moving'
import { virtualWork } from '../../engine/vw'
import { linearMember, type DiagramMember } from '../../engine/diagrams'
import type { Model } from '../../engine/model'
import { beamOf, F as Fxy, H, members, model, Mo, P, Pm, truss, W } from '../../kit/builders'
import { ApproxSolution, Figure, FrameSolution, ILDStack, ReactionsTable, TrainOnILD, TrussSolution, VWSolution } from '../../kit/solutions'
import { buildingFloors, EQSolution, eqResult } from '../../kit/loads'
import { Md, Seg, Tex } from '../../components/ui'
import { DiagramView, fmt } from '../../components/DiagramView'
import { ApproxFig } from './p2023'

const PG = { A1: [26], A2: [26], A3: [26], A4: [27], A5: [27], A6: [27], A7: [28], B8: [28, 29], B9: [28, 29], B10: [28, 29], B11: [28, 29], B12: [28, 29], B13: [28, 29], B14: [28, 29] }

// ============================================================================ shared helpers (also used by p2012)

/**
 * Approximate analysis of a building frame for vertical loads (CE 311 "0.1L" method):
 * inflection points at 0.1L from each beam end → end moment 0.045wL², midspan 0.08wL², end shear wL/2;
 * the unbalanced beam moment at a joint is shared by the columns above/below in proportion to I/h.
 * Works for irregular frames (partial storeys, beams spanning past a missing column).
 * beams: 'D-E E-F' built left→right; cols: 'A-D B-E' built bottom→top.
 */
export function verticalFrame(o: { nodes: string; beams: string; cols: string; supports: string; w: number | Record<string, number>; wLabel?: string }) {
  const bm = members(o.beams)
  const cm = members(o.cols)
  const m: Model = model(o.nodes, `${o.beams} ${o.cols}`, o.supports)
  const nm = new Map(m.nodes.map((n) => [n.id, n]))
  const wOf = (id: string) => (typeof o.w === 'number' ? o.w : o.w[id] ?? 0)
  m.loads = bm.map((b) => W(b.id, wOf(b.id), { label: o.wLabel ?? `${fmt(wOf(b.id))} k/ft` }))
  const beams = bm.map((b) => {
    const L = Math.abs(nm.get(b.j)!.x - nm.get(b.i)!.x)
    const w = wOf(b.id)
    return { id: b.id, i: b.i, j: b.j, L, w, Me: 0.045 * w * L * L, Mmid: 0.08 * w * L * L, V: (w * L) / 2 }
  })
  const supported = new Set(m.supports.map((s) => s.node))
  const fixedBase = new Set(m.supports.filter((s) => s.type === 'fixed').map((s) => s.node))
  const cols = cm.map((c) => ({ id: c.id, i: c.i, j: c.j, h: nm.get(c.j)!.y - nm.get(c.i)!.y, M0: 0, ML: 0, N: 0 }))
  const ids = [...new Set([...beams.flatMap((b) => [b.i, b.j]), ...cols.flatMap((c) => [c.i, c.j])])].filter((id) => !supported.has(id))
  const joints = ids.map((id) => {
    const left = beams.filter((b) => b.j === id).reduce((s, b) => s + b.Me, 0)
    const right = beams.filter((b) => b.i === id).reduce((s, b) => s + b.Me, 0)
    const U = left - right // net ccw moment of the beam ends on the joint
    const below = cols.filter((c) => c.j === id)
    const above = cols.filter((c) => c.i === id)
    const sumK = [...below, ...above].reduce((s, c) => s + 1 / c.h, 0)
    const parts = [...below.map((c) => ({ c, pos: 'below' as const })), ...above.map((c) => ({ c, pos: 'above' as const }))].map(({ c, pos }) => {
      const share = 1 / c.h / sumK
      const M = U * share
      if (pos === 'below') c.ML = M
      else c.M0 = -M
      return { col: c.id, pos, share, M }
    })
    return { id, left, right, U, parts }
  })
  for (const c of cols) if (fixedBase.has(c.i)) c.M0 = -c.ML / 2
  // column axial (compression +), top storey first
  const sorted = [...cols].sort((a, b) => nm.get(b.j)!.y - nm.get(a.j)!.y)
  for (const c of sorted) {
    const sh = beams.filter((b) => b.i === c.j || b.j === c.j).reduce((s, b) => s + b.V, 0)
    const ab = cols.filter((a) => a.i === c.j).reduce((s, a) => s + a.N, 0)
    c.N = sh + ab
  }
  const diagrams: DiagramMember[] = []
  for (const b of beams) {
    const ni = nm.get(b.i)!
    const nj = nm.get(b.j)!
    const samples = Array.from({ length: 41 }, (_, k) => {
      const t = (b.L * k) / 40
      return { t, N: 0, V: b.w * (b.L / 2 - t), M: (b.w * t * (b.L - t)) / 2 - b.Me }
    })
    diagrams.push({ id: b.id, x1: ni.x, y1: ni.y, x2: nj.x, y2: nj.y, L: b.L, truss: false, samples })
  }
  for (const c of cols) {
    const ni = nm.get(c.i)!
    const nj = nm.get(c.j)!
    diagrams.push(linearMember(c.id, [ni.x, ni.y], [nj.x, nj.y], { N: -c.N, V: (c.ML - c.M0) / c.h, Mi: c.M0, Mj: c.ML }))
  }
  return { model: m, beams, cols, joints, diagrams }
}
export type VerticalFrame = ReturnType<typeof verticalFrame>

export function VerticalSolution({ f, unit = 'k', lenUnit = 'ft' }: { f: VerticalFrame; unit?: string; lenUnit?: string }) {
  const [kind, setKind] = useState<'M' | 'N'>('M')
  const mu = `${unit}-${lenUnit}`
  return (
    <div className="space-y-3 text-sm">
      <div className="overflow-x-auto">
        <div className="font-semibold mb-1">1 · Beams (inflection points at 0.1L from each end)</div>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Beam</th>
              <th>L</th>
              <th>w</th>
              <th>End moment −0.045wL² ({mu})</th>
              <th>Midspan +0.08wL²</th>
              <th>End shear wL/2 ({unit})</th>
            </tr>
          </thead>
          <tbody>
            {f.beams.map((b) => (
              <tr key={b.id}>
                <td className="txt font-semibold">{b.id}</td>
                <td>{fmt(b.L)}</td>
                <td>{fmt(b.w)}</td>
                <td>−{fmt(b.Me)}</td>
                <td>+{fmt(b.Mmid)}</td>
                <td>{fmt(b.V)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <div className="font-semibold mb-1">2 · Unbalanced moment at each joint → columns (∝ I/h)</div>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Joint</th>
              <th>Beam on left</th>
              <th>Beam on right</th>
              <th>Unbalanced</th>
              <th>Column share (DF)</th>
            </tr>
          </thead>
          <tbody>
            {f.joints.map((j) => (
              <tr key={j.id}>
                <td className="txt font-semibold">{j.id}</td>
                <td>{fmt(j.left)}</td>
                <td>{fmt(j.right)}</td>
                <td>{fmt(Math.abs(j.U))}</td>
                <td className="txt">{j.parts.map((p) => `${p.col} (${p.pos}): ${fmt(p.share, 3)} → ${fmt(Math.abs(p.M))}`).join(';  ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <div className="font-semibold mb-1">3 · Columns</div>
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>Column</th>
              <th>h</th>
              <th>M bottom ({mu})</th>
              <th>M top</th>
              <th>Axial ({unit}, compression)</th>
            </tr>
          </thead>
          <tbody>
            {f.cols.map((c) => (
              <tr key={c.id}>
                <td className="txt font-semibold">{c.id}</td>
                <td>{fmt(c.h)}</td>
                <td>{fmt(Math.abs(c.M0))}</td>
                <td>{fmt(Math.abs(c.ML))}</td>
                <td>{fmt(c.N)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint">Axial force in a column = sum of the end shears (wL/2) of the beams framing into its top joint + the axial force of the column above.</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold">Diagrams</div>
          <Seg value={kind} onChange={setKind} items={[{ v: 'M', label: 'BMD' }, { v: 'N', label: 'AFD' }]} />
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <DiagramView model={f.model} members={f.diagrams} kind={kind} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================ Q1 vertical loads, 0.1L method
const vf1 = verticalFrame({
  nodes: 'A:0,0 B:30,0 C:50,0 D:0,20 E:30,20 F:50,20 G:0,30 H:30,30',
  beams: 'D-E E-F G-H',
  cols: 'A-D B-E C-F D-G E-H',
  supports: 'A:pin B:pin C:pin',
  w: 4,
})

// ============================================================================ Q2 earthquake, BNBC 1993 (and 2020 recast)
const eq93 = (() => {
  const Z = 0.25,
    I = 1.25,
    R = 8,
    S = 1.2,
    Ct = 0.073,
    hn = 18
  const T = Ct * Math.pow(hn, 0.75)
  const Craw = (1.25 * S) / Math.pow(T, 2 / 3)
  const C = Math.min(Craw, 2.75)
  const CR = Math.max(C / R, 0.075)
  const wFloor = 20 * 20 * 10
  const levels = [1, 2, 3, 4, 5, 6].map((i) => ({ name: i === 6 ? 'Roof' : `L${i}`, h: 3 * i, w: wFloor }))
  const W = levels.reduce((s, l) => s + l.w, 0)
  const V = Z * I * CR * W
  const Ft = T > 0.7 ? Math.min(0.07 * T * V, 0.25 * V) : 0
  const sumWh = levels.reduce((s, l) => s + l.w * l.h, 0)
  let acc = 0
  const rows = levels.map((l) => ({ ...l, wh: l.w * l.h, F: ((V - Ft) * l.w * l.h) / sumWh + (l.name === 'Roof' ? Ft : 0) }))
  const shear = [...rows].reverse().map((r) => ((acc += r.F), { name: r.name, Vx: acc }))
  return { Z, I, R, S, Ct, hn, T, Craw, C, CR, W, V, Ft, sumWh, rows, shear, wFloor }
})()
const floors2 = buildingFloors({ area: 400, DL: 10, LL: 0, roofLL: 0, storeys: 6, h: 3, base: 0 })
const eq20 = { Z: 0.36, occ: 4 as const, site: 'SC' as const, system: 'IMF_rc' as const, hn: 18, floors: floors2 }

// ============================================================================ Q3 frame, shear at E = −16 k
const VE = -16 // given shear just right of E
const RA = VE + 60 // V_E = R_A − 60
const loads3 = [Pm('AE', 10, 60, '60 kip'), Pm('ED', 5, 80, '80 kip'), W('DC', 8, { label: '8 k/ft' }), Mo('F', -120, '120 k-ft'), H('F', 20, '20 kip')]
const fig3 = model('A:0,16 E:15,16 D:28,16 C:58,16 F:70,16 B:28,0', 'A-E E-D D-C C-F B-D', 'A:roller B:pin C:roller', loads3)
const m3 = model('A:0,16 E:15,16 D:28,16 C:58,16 F:70,16 B:28,0', 'A-E E-D D-C C-F B-D', 'B:pin C:roller', [Fxy('A', 0, RA, `R_A = ${RA} k`), ...loads3])
m3.nodes.find((n) => n.id === 'F')!.label = ''
fig3.nodes.find((n) => n.id === 'F')!.label = ''

// ============================================================================ Q4 subdivided truss
const t4 = truss(
  'A:0,0 B:24,0 C:48,0 D:72,0 E:96,0 F:0,32 G:12,32 H:24,32 J:36,32 K:48,32 L:60,32 M:72,32 N:84,32 P:96,32 Q:12,16 R:36,16 S:60,16 T:84,16',
  'A-B B-C C-D D-E F-G G-H H-J J-K K-L L-M M-N N-P A-F B-H C-K D-M E-P F-Q Q-B G-Q Q-H H-R R-C J-R R-K K-S S-C L-S S-M M-T N-T T-P D-T',
  'A:pin E:roller',
  [P('F', 20), ...['G', 'H', 'J', 'K', 'L', 'M', 'N'].map((n) => P(n, 40)), P('P', 20)],
)

// ============================================================================ Q5 X-braced truss
const t5 = truss(
  'A:0,0 B:12,0 C:24,0 D:36,0 E:48,0 F:0,16 G:12,16 H:24,16 I:36,16 J:48,16',
  'A-B B-C C-D D-E F-G G-H H-I I-J A-F B-G C-H D-I E-J A-G B-F B-H C-G C-I D-H D-J E-I',
  'A:pin E:roller',
  [P('F', 8, '8k'), P('H', 48, '48k'), P('J', 12, '12k'), P('B', 16, '16k'), P('D', -16, '16k ↑')],
)
const pairs5: [string, string][] = [
  ['AG', 'BF'],
  ['BH', 'CG'],
  ['CI', 'DH'],
  ['DJ', 'EI'],
]
const x5 = () => xBraced(t5, pairs5, 'both')
const reac5 = () => solve({ ...t5, members: t5.members.filter((m) => !['BF', 'CG', 'DH', 'EI'].includes(m.id)) })

// ============================================================================ Q6 roof truss
const t6 = truss('A:0,0 B:12,0 C:24,0 D:36,0 E:48,0 J:12,9 F:12,16 G:24,25 H:36,16 K:36,9', 'A-B B-C C-D D-E A-F F-G G-H H-E B-J J-F D-K K-H J-G J-C K-G K-C C-G', 'A:pin E:roller', [P('F', 24), P('G', 80), P('H', 24)])

// ============================================================================ Q7 portal
const g7: GridFrame = { xs: [0, 15, 25, 40], heights: [12, 10, 10], loads: [6, 12, 18], loadSide: ['left', 'left', 'left'] }

// ============================================================================ Q8 compound beam ILD
const b8 = beamOf('A:0 B:10:roller C*:15 D:20:pin E:30 F:35:roller G:43')
const p8 = { kind: 'members' as const, members: b8.members.map((m) => m.id) }
const ild8 = {
  RD: { kind: 'reaction' as const, node: 'D', comp: 'y' as const },
  VD: { kind: 'shear' as const, member: 'CD', x: 5, side: -1 as const },
  ME: { kind: 'moment' as const, member: 'EF', x: 0 },
  MD: { kind: 'moment' as const, member: 'DE', x: 0 },
}

// ============================================================================ Q9 / Q14 Pratt truss with raised centre panel point
const t9 = truss(
  'L0:0,0 L1:20,0 L2:40,0 L3:60,0 L4:80,0 L5:100,0 L6:120,0 L7:140,0 L8:160,0 U1:20,25 U2:40,25 U3:60,25 U4:80,30 U5:100,25 U6:120,25 U7:140,25',
  'L0-L1 L1-L2 L2-L3 b=L3-L4 L4-L5 L5-L6 L6-L7 L7-L8 U1-U2 U2-U3 c=U3-U4 U4-U5 U5-U6 U6-U7 L0-U1 U7-L8 U1-L1 U2-L2 U3-L3 U4-L4 U5-L5 U6-L6 d=U7-L7 U1-L2 a=U2-L3 U3-L4 L4-U5 L5-U6 L6-U7',
  'L0:pin L8:roller',
)
for (const id of ['a', 'b', 'c', 'd']) t9.members.find((m) => m.id === id)!.label = id
const p9 = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'] }
const ild9 = (id: string) => influenceLine(t9, p9, { kind: 'force', member: id })

// ============================================================================ Q10 slope at D
const E = 30000
const b10 = beamOf('A:0:pin B:15 C:20:roller D:26', [W('AB', 3, { label: '3 k/ft' }), P('B', 10, '10k')])
const EI10 = (id: string) => (E * (id === 'AB' ? 200 : 100)) / 144
const vw10 = () => virtualWork(b10, b10.loads, [Mo('D', rotK())], { EI: EI10 }) // unit couple in the positive rotation sense

// ============================================================================ Q11 frame deflection at F
const f11 = model('C:-9,12 D:-4,12 E:0,12 F:8,12 G:16,12 A:0,0 B:16,0', 'C-D D-E E-F F-G A-E B-G', 'A:pin B:roller', [Mo('C', 50, '50 k-ft'), P('D', 20, '20k'), W('EF', 5, { label: '5 k/ft' })])
const opt11 = { EI: () => (E * 300) / 144, EA: () => E * 10, axial: true }
const vw11 = () => virtualWork(f11, f11.loads, [P('F', 1)], opt11)

// ============================================================================ Q12–Q14 wheel loads
const train11: Train = { P: [15, 60, 60, 60, 60, 60, 70, 70, 70, 70], gaps: [10, 5, 5, 5, 5, 15, 5, 5, 5], udl: { w: 4, gap: 7 } }
const train12: Train = { P: [10, 40, 40, 40, 40, 35, 35, 35, 35], gaps: [12, 5, 5, 5, 10, 5, 5, 5] }
const ild12 = ssShearILD(66, 22)
const ild13 = ssMomentILD(80, 20)

export const Q2015: PYQ[] = [
  {
    id: '2015-16-A1',
    paper: '2015-16',
    sec: 'A',
    no: '1',
    marks: 28,
    topics: ['vertical'],
    title: 'Vertical loads 4 k/ft: approximate BMD & AFD of a 2-storey irregular frame',
    pages: PG.A1,
    text: `The beams of the frame in Fig. 1 are subjected to vertical loads of **4 kip/ft**. Using the approximate method, draw bending moment diagrams for all the beams and columns of the frame. EI is constant and same for all columns. Also draw axial force diagrams for the columns.

Frame: hinged bases A, B, C; first-floor beams D–E (30 ft) and E–F (20 ft) at 20 ft; a second storey (10 ft) over the left bay only, beam G–H above D–E.`,
    figure: () => <Figure model={vf1.model} dimY />,
    checks: () => {
      const de = vf1.beams.find((b) => b.id === 'DE')!
      const be = vf1.cols.find((c) => c.id === 'BE')!
      return [
        { key: 'me', label: 'Beam DE end moment (hogging magnitude)', value: de.Me, unit: 'k-ft' },
        { key: 'mm', label: 'Beam DE midspan moment', value: de.Mmid, unit: 'k-ft' },
        { key: 'mbe', label: 'Moment at top of column BE (magnitude)', value: Math.abs(be.ML), unit: 'k-ft' },
        { key: 'nbe', label: 'Axial compression in column BE', value: be.N, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Assumptions (0.1L method).** In every beam the points of inflection are 0.1L from each end and the axial force is zero. The central 0.8L is a simple beam, so
$$M_{mid} = \\frac{w(0.8L)^2}{8} = 0.08wL^2,\\qquad M_{end} = \\frac{w(0.1L)^2}{2} + \\frac{w(0.8L)}{2}(0.1L) = 0.045wL^2,\\qquad V_{end} = \\frac{wL}{2}$$
At each joint the beam end moments do not balance (different spans); the **unbalanced moment** is resisted by the columns, shared in proportion to their stiffness $I/h$ (EI constant → $1/h$). The bases are hinged, so column moments are zero at A, B, C.`}</Md>
        <Md>{`E.g. joint E: $0.045(4)(30^2) - 0.045(4)(20^2) = 162 - 72 = 90$ k-ft, shared by BE (h = 20, DF = 1/3) and EH (h = 10, DF = 2/3) → 30 and 60 k-ft.`}</Md>
        <VerticalSolution f={vf1} />
      </div>
    ),
    notes: ['Column distribution uses I/h with I equal for all columns (as stated); a refined version would use 3EI/4h for the hinged-base columns.', 'Beam end shears are taken as wL/2 (the approximate method ignores the small shear from unequal end moments).'],
  },
  {
    id: '2015-16-A2',
    paper: '2015-16',
    sec: 'A',
    no: '2',
    marks: 28,
    topics: ['eq'],
    title: 'Earthquake: 6-storey fire brigade building, Sylhet (BNBC 1993)',
    pages: PG.A2,
    legacy: 'Asked with the BNBC 1993 equivalent static method (V = ZICW/R). Solved here as intended, then re-done with BNBC 2020 for comparison.',
    text: `Calculate the vertical distribution of earthquake forces on an **18 m** high 6-storied fire brigade building with storey height 3 m each, located in Sylhet town. The concrete building has a square plan **20 m × 20 m**, and the structural system is Intermediate Moment Resisting Frames in Concrete (**R = 8**). Soil boring revealed a dense, stiff soil condition up to 70 m depth ($S = S_2 = 1.2$). Dead load including partitions = **10 kN/m²**. $Z = 0.25$ for Sylhet. Given: $C_t = 0.073$, $I = 1.25$, $C \\le 2.75$ and $C/R \\ge 0.075$. Use the equivalent static force method of BNBC.`,
    checks: () => [
      { key: 'T', label: 'Period T (BNBC 1993)', value: eq93.T, unit: 's', tol: 0.01 },
      { key: 'C', label: 'Coefficient C', value: eq93.C, tol: 0.01 },
      { key: 'V', label: 'Base shear V (BNBC 1993)', value: eq93.V, unit: 'kN' },
      { key: 'Fr', label: 'Roof force (BNBC 1993)', value: eq93.rows[5].F, unit: 'kN' },
    ],
    solution: () => {
      const r20 = eqResult(eq20)
      const r20s = eqResult({ ...eq20, system: 'SMF_rc' })
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**Old code (BNBC 1993) — what the paper asks.** Equivalent static force method:
$$V = \\frac{ZIC}{R}W,\\qquad C = \\frac{1.25S}{T^{2/3}},\\qquad T = C_t h_n^{3/4}$$
with the force at the top $F_t = 0.07TV$ only if $T > 0.7$ s, and $F_x = (V - F_t)\\dfrac{w_xh_x}{\\sum w_ih_i}$.`}</Md>
          <Tex block>{`T = 0.073(18)^{3/4} = ${fmt(eq93.T, 4)}\\text{ s},\\quad C = \\frac{1.25(1.2)}{${fmt(eq93.T, 4)}^{2/3}} = ${fmt(eq93.Craw, 4)}\\ (\\le 2.75\\ ✓),\\quad \\frac{C}{R} = ${fmt(eq93.C / eq93.R, 4)}\\ (\\ge 0.075\\ ✓)`}</Tex>
          <Tex block>{`W = 6\\times(20\\times20)\\times10 = ${fmt(eq93.W)}\\text{ kN},\\qquad V = \\frac{0.25(1.25)(${fmt(eq93.C, 4)})}{8}(${fmt(eq93.W)}) = \\mathbf{${fmt(eq93.V)}}\\text{ kN}`}</Tex>
          <Md>{`$T = ${fmt(eq93.T, 3)}$ s ≤ 0.7 s → $F_t = 0$. With equal floor weights the forces are proportional to height ($\\sum w_ih_i = ${fmt(eq93.sumWh)}$ kN·m):`}</Md>
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
              {[...eq93.rows].reverse().map((r) => (
                <tr key={r.name}>
                  <td className="txt">{r.name}</td>
                  <td>{fmt(r.h)}</td>
                  <td>{fmt(r.w)}</td>
                  <td>{fmt(r.wh)}</td>
                  <td className="font-bold">{fmt(r.F)}</td>
                  <td>{fmt(eq93.shear.find((s) => s.name === r.name)!.Vx)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Md>{`**Same building with BNBC 2020.** Sylhet → Zone 4, $Z = 0.36$. Fire brigade = essential facility → **Occupancy IV**, $I = 1.5$. Dense stiff soil (old $S_2$) → assumed **site class SC**. Keeping an intermediate RC moment frame, $R = 5$ (note: Zone 4 + Occupancy IV gives SDC D, where BNBC 2020 actually requires a special moment frame, $R = 8$ → V = ${fmt(r20s.V)} kN). $T = 0.0466h_n^{0.9}$.`}</Md>
          <EQSolution {...eq20} />
          <p className="text-xs text-faint">
            BNBC 2020 gives V = {fmt(r20.V)} kN vs {fmt(eq93.V)} kN by the 1993 code — the higher zone coefficient (0.36 vs 0.25) and importance factor (1.5 vs 1.25) drive the increase.
          </p>
        </div>
      )
    },
    notes: ['Seismic weight W = dead load only (10 kN/m² on every floor including the roof); no live load is given, and BNBC 1993 adds 25 % LL only for storage-type occupancies.', 'h_n = 18 m measured from the base; each floor level carries 20 × 20 × 10 = 4000 kN.', 'BNBC 2020 recast: site class SC and IMF (R = 5) are assumptions standing in for the old S₂ and "intermediate frame" data.'],
  },
  {
    id: '2015-16-A3',
    paper: '2015-16',
    sec: 'A',
    no: '3',
    marks: 28,
    topics: ['frames'],
    title: 'SFD & BMD of a beam–column frame (shear at E = −16 k given)',
    pages: PG.A3,
    text: `Draw the shear and bending moment diagrams for the frame shown in Fig. 2. Given: shear at E = −16 kip.

Beam A–C–tip at the top: roller at A, 60 kip at 10 ft, E at 15 ft, 80 kip at 20 ft, rigid joint D at 28 ft with a 16 ft column D–B pinned at B, 8 k/ft on D–C (30 ft), roller at C, 12 ft overhang with a 120 k-ft clockwise couple and a 20 kip horizontal load (→) at the tip.`,
    figure: () => <Figure model={fig3} dimY />,
    checks: () => {
      const r = solve(m3)
      return [
        { key: 'ra', label: 'Reaction at A (from V_E = −16 k)', value: RA, unit: 'k' },
        { key: 'cy', label: 'Vertical reaction at C', value: r.reaction('C').ry, unit: 'k' },
        { key: 'by', label: 'Vertical reaction at B', value: r.reaction('B').ry, unit: 'k' },
        { key: 'md', label: 'Beam moment just right of D (sagging +)', value: r.member('DC').M(0), unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Why the extra data?** Supports: rollers at A and C (1 reaction each) + pin at B (2) = 4 unknowns, but only 3 equations — the frame is indeterminate to degree 1. The given shear supplies the 4th equation: just right of E only $R_A$ and the 60 k load are on the left, so
$$V_E = R_A - 60 = -16 \\Rightarrow R_A = ${RA}\\text{ k}\\uparrow$$
Now treat $R_A$ as a known load and the rest is determinate: $\\sum F_x = 0 \\Rightarrow B_x = 20$ k ←; $\\sum M_B = 0$ gives $C_y$; $\\sum F_y = 0$ gives $B_y$. The column carries only the horizontal 20 k shear, so its moment grows linearly to $20\\times16 = 320$ k-ft at D.`}</Md>
        <FrameSolution model={m3} kinds={['V', 'M', 'N']} />
      </div>
    ),
    notes: ['Read from Fig. 2: E is midway between the 60 k and 80 k loads (x = 15 ft); the 120 k-ft couple is clockwise; joint D is rigid.', 'The roller at A is replaced by its known reaction R_A = 44 k ↑ for the solution.'],
  },
  {
    id: '2015-16-A4',
    paper: '2015-16',
    sec: 'A',
    no: '4',
    marks: 28,
    topics: ['truss'],
    title: 'Subdivided truss: forces in HJ, HR, RC, RK',
    pages: PG.A4,
    text: `For the truss shown in Fig. 3, find the forces in members **HJ, HR, RC and RK**. Eight panels of 12 ft on the top chord (F … P), bottom chord A–B–C–D–E at 24 ft, height 32 ft, sub-joints Q, R, S, T at mid-height. Loads: 20 kip at F and P, 40 kip at each of G, H, J, K, L, M, N.`,
    figure: () => <Figure model={t4} />,
    checks: () => {
      const r = solve(t4)
      return ['HJ', 'HR', 'RC', 'RK'].map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Symmetric loading: total = 2(20) + 7(40) = 320 k → $R_A = R_E = 160$ k.
- **HJ** (top chord): section through HJ, HR (line H–C) and BC. HR and BC both pass through **C**, so $\\sum M_C = 0$ for the left part isolates HJ (lever arm 32 ft).
- **Joint J**: J–R is a vertical with 40 k at J → $F_{JR} = -40$ k.
- **Joint R** (members HR, RC, RK, JR): HR and RC are collinear (line H–C), so perpendicular to that line only RK and JR act → RK; then along the line → RC − HR.
- **HR**: from the section through HJ, HR, BC use $\\sum F_y$ for the left part.`}</Md>
        <TrussSolution model={t4} asked={['HJ', 'HR', 'RC', 'RK']} />
      </div>
    ),
    notes: ['Panel geometry read from Fig. 3: diagonals F–Q–B and H–R–C slope down toward mid-span, C–S–M and D–T–P mirror them; sub-diagonals Q–H, R–K, K–S, M–T; sub-verticals G–Q, J–R, L–S, N–T.'],
  },
  {
    id: '2015-16-A5',
    paper: '2015-16',
    sec: 'A',
    no: '5',
    marks: 28,
    topics: ['truss'],
    title: 'X-braced truss: approximate bar forces (diagonals take T and C)',
    pages: PG.A5,
    text: `Using the approximate method, determine bar forces in all members of the X-braced truss in Fig. 4 (4 panels @ 12 ft, height 16 ft; A pinned, E on rollers). Loads: 8 k ↓ at F, 48 k ↓ at H, 12 k ↓ at J, 16 k ↓ at B, 16 k ↑ at D. Diagonals can carry both tension and compression.`,
    figure: () => <Figure model={t5} />,
    checks: () => {
      const f = x5().forces
      return [
        { key: 'ag', label: 'Diagonal AG (T +, C −)', value: f.get('AG')!, unit: 'k' },
        { key: 'ch', label: 'Diagonal CG (T +, C −)', value: f.get('CG')!, unit: 'k' },
        { key: 'gh', label: 'Top chord GH', value: f.get('GH')!, unit: 'k' },
        { key: 'ch2', label: 'Vertical CH', value: f.get('CH')!, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Each X-panel adds one redundant (4 panels → 4 degrees). **Assumption:** the two diagonals of a panel share the panel shear **equally** — one in tension, the other in equal compression. Each diagonal: $F = \\pm\\dfrac{V_{panel}}{2}\\cdot\\dfrac{20}{16}$ (length 20 ft, rise 16 ft). Then chords and verticals follow from sections / joints.

Reactions: $\\sum M_A = 0$: $R_E(48) = 16(12) + 48(24) - 16(36) + 12(48)$ → $R_E$; the 8 k at F goes straight down the end post AF.`}</Md>
        <ReactionsTable r={reac5()} />
        <TrussSolution model={t5} forces={x5().forces} note="Forces = average of the determinate trusses obtained by removing one diagonal per panel — identical to the equal-shear assumption." />
      </div>
    ),
  },
  {
    id: '2015-16-A6',
    paper: '2015-16',
    sec: 'A',
    no: '6',
    marks: 28,
    topics: ['truss'],
    title: 'Roof truss: forces in BC, JC, JG, FG',
    pages: PG.A6,
    text: `For the truss shown in Fig. 5, find the stresses in members **BC, JC, JG and FG**. Span 4 @ 12 ft = 48 ft; F and H at 16 ft, apex G at 25 ft, J and K at 9 ft on the verticals B–F and D–H. Loads: 24 kip at F and H, 80 kip at G.`,
    figure: () => <Figure model={t6} dimY />,
    checks: () => {
      const r = solve(t6)
      return ['BC', 'JC', 'JG', 'FG'].map((id) => ({ key: id, label: `Force in ${id} (T +, C −)`, value: r.member(id).N(1), unit: 'k' }))
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Symmetric: $R_A = R_E = (24 + 80 + 24)/2 = 64$ k. Zero-force member: at **B** only AB, BC (collinear) and BJ meet with no load → $F_{BJ} = 0$, $F_{AB} = F_{BC}$.
- **Joint A**: AF (slope 16:12) and AB → AF, AB = BC.
- **Joint F**: AF, FG, FJ and the 24 k load → FG and FJ.
- **Joint J**: FJ, BJ (= 0), JG, JC → two unknowns JG, JC.`}</Md>
        <TrussSolution model={t6} asked={['BC', 'JC', 'JG', 'FG']} />
      </div>
    ),
  },
  {
    id: '2015-16-A7',
    paper: '2015-16',
    sec: 'A',
    no: '7',
    marks: 28,
    topics: ['lateral'],
    title: 'Portal method: 3-bay, 3-storey frame',
    pages: PG.A7,
    text: `Using the portal method, draw bending moment diagrams for all the beams and columns of the frame in Fig. 6. Bays 15 ft, 10 ft, 15 ft; storeys 12 ft (ground) and 2 @ 10 ft; lateral loads 6 k, 12 k and 18 k (→) at the first floor, second floor and roof (left side). Fixed bases.`,
    figure: () => <ApproxFig g={g7} />,
    checks: () => {
      const r = portalMethod(g7)
      return [
        { key: 'v1', label: 'Interior column shear, ground storey', value: r.columns[0][1].shear, unit: 'k' },
        { key: 'm1', label: 'Exterior column end moment, ground storey', value: r.columns[0][0].mTop, unit: 'k-ft' },
        { key: 'mb', label: 'First-floor beam EF end moment', value: r.beams[0][0].moment, unit: 'k-ft' },
      ]
    },
    solution: () => (
      <div className="space-y-2">
        <Md>{`Portal assumptions: inflection points at mid-height of all columns and mid-span of all beams; interior columns take **twice** the shear of exterior columns (3 bays → 6 shares). Storey shears: top 18 k, middle 30 k, ground 36 k. Column end moment = shear × h/2; beam end moments from joint equilibrium, working left to right.`}</Md>
        <ApproxSolution g={g7} method="portal" />
      </div>
    ),
  },
  {
    id: '2015-16-B8',
    paper: '2015-16',
    sec: 'B',
    no: '8',
    marks: 28,
    topics: ['ild'],
    title: 'ILDs of a compound beam: R_D, V just left of D, M_E, M_D',
    pages: PG.B8,
    text: `Draw influence line diagrams for (a) reaction at D, (b) shear just left of D, (c) moment at E and (d) moment at D of the beam in Fig. 7. A (free end) at 0, roller B at 10 ft, internal hinge C at 15 ft, pin D at 20 ft, E at 30 ft, roller F at 35 ft, free end G at 43 ft.`,
    figure: () => <Figure model={b8} />,
    checks: () => [
      { key: 'rdA', label: '$R_D$ ordinate with the unit load at A', value: ildAt(influenceLine(b8, p8, ild8.RD), 0) },
      { key: 'rdG', label: '$R_D$ ordinate with the unit load at G', value: ildAt(influenceLine(b8, p8, ild8.RD), 43) },
      { key: 'me', label: '$M_E$ ordinate at E', value: ildAt(influenceLine(b8, p8, ild8.ME), 30) },
      { key: 'md', label: '$M_D$ ordinate with the unit load at G', value: ildAt(influenceLine(b8, p8, ild8.MD), 43) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**Structure:** A–B–C is a simple beam on the roller B, hung from the main beam C–D–F–G at the hinge C (C–G is supported by D and F). So
- a load on **C–G** acts on the main beam only — the A–C part does not move;
- a load on **A–C** reaches the main beam as a hinge force at C: unit load at A gives $R_B = 15/5 = 3$ and a hinge force of 2 **upward** on the main beam (A–C pivots about B).

Müller-Breslau shapes: release the function, give a unit displacement; segments stay straight. All ILDs are linear between A, B, C, D, F, G with kinks at the hinge and supports.`}</Md>
        <ILDStack
          model={b8}
          path={p8}
          items={[
            { label: 'R_D', resp: ild8.RD },
            { label: 'V just left of D', resp: ild8.VD },
            { label: 'M_E', resp: ild8.ME },
            { label: 'M_D', resp: ild8.MD },
          ]}
        />
      </div>
    ),
  },
  {
    id: '2015-16-B9',
    paper: '2015-16',
    sec: 'B',
    no: '9',
    marks: 28,
    topics: ['floor'],
    title: 'Truss ILDs for bars a, b, c, d',
    pages: PG.B9,
    text: `For the truss in Fig. 8 (8 panels @ 20 ft = 160 ft, height 25 ft, centre top joint raised 5 ft to 30 ft), draw the influence line diagrams for the bar forces in members "a", "b", "c" and "d". a = diagonal of the 3rd panel, b = bottom chord of the 4th panel, c = inclined top chord of the 4th panel, d = vertical at the 7th panel point.`,
    figure: () => <Figure model={t9} labels />,
    checks: () => [
      { key: 'a', label: 'Max ordinate of ILD "a"', value: ildExtremes(ild9('a')).max.y },
      { key: 'b', label: 'ILD "b" ordinate at L4', value: ildAt(ild9('b'), 80) },
      { key: 'c', label: 'ILD "c" ordinate at L4', value: ildAt(ild9('c'), 80) },
      { key: 'd', label: 'ILD "d" ordinate at L7', value: ildAt(ild9('d'), 140) },
    ],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`Loads reach the truss at the bottom panel points L0 … L8, so every ILD is straight between panel points.
- **a** (diagonal U2–L3): section through panel 3; vertical component of a = panel shear → ILD of shear in panel L2–L3 × (√(20²+25²)/25), sign reverses across the panel (tension when the load is to the right).
- **b** (bottom chord L3–L4): moments about U3 (25 ft above L3)… but U3–U4 is inclined, so take the section through U3–U4, U3–L4, L3–L4 and moments about **U3**: $F_b = M_{L3}/25$.
- **c** (inclined top chord U3–U4): moments about **L4**; lever arm = perpendicular distance from L4 to line U3–U4.
- **d** (vertical U7–L7): joint L7 has only the chords (collinear) and d → $F_d$ = load at L7 → triangle 0–1–0 between L6 and L8.`}</Md>
        <ILDStack
          model={t9}
          path={p9}
          items={[
            { label: 'F_a (U2L3)', resp: { kind: 'force', member: 'a' } },
            { label: 'F_b (L3L4)', resp: { kind: 'force', member: 'b' } },
            { label: 'F_c (U3U4)', resp: { kind: 'force', member: 'c' } },
            { label: 'F_d (U7L7)', resp: { kind: 'force', member: 'd' } },
          ]}
        />
      </div>
    ),
    notes: ['Hand sketch read as a Pratt truss: diagonals U1–L2, U2–L3, U3–L4 on the left and L4–U5, L5–U6, L6–U7 on the right; U4 is 5 ft above the other top joints.', 'Members: a = U2–L3, b = L3–L4, c = U3–U4, d = U7–L7 (from the tick marks). Load applied at the bottom-chord panel points.'],
  },
  {
    id: '2015-16-B10',
    paper: '2015-16',
    sec: 'B',
    no: '10',
    marks: 28,
    topics: ['vw'],
    title: 'Slope at the overhang end D of a stepped beam',
    pages: PG.B10,
    text: `Calculate the change in slope at "D" of the beam in Fig. 9. A pinned, roller at C; AB = 15 ft with $I_1 = 200$ in⁴ carrying 3 k/ft, 10 k at B; BC = 5 ft and overhang CD = 6 ft with $I_2 = 100$ in⁴. $E = 30{,}000$ ksi.`,
    figure: () => <Figure model={b10} />,
    checks: () => [{ key: 'th', label: `Rotation at D (rad, ${rotTag()})`, value: vw10().total, unit: 'rad', tol: 0.03 }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Virtual system: a **unit couple at D** (${rotPos()}). Its moment diagram: reactions $\\mp 1/20$ at A and C, so $m$ grows linearly from 0 at A to ${isCW() ? '−1' : '1'} at C and stays ${isCW() ? '−1' : '1'} on the overhang (CD carries no real moment — free end, no load). Hence only A–C contributes:
$$\\theta_D = \\int_A^C \\frac{Mm}{EI}dx,\\qquad EI_1 = \\frac{30000(200)}{144},\\ EI_2 = \\frac{30000(100)}{144}\\ \\text{k-ft}^2$$`}</Md>
        <VWSolution model={b10} real={b10.loads} virtual={[Mo('D', rotK())]} opts={{ EI: EI10 }} resultUnit="rad" what="θ_D" unitNote={`+ = ${rotPos()} (same sense as the virtual couple).`} />
        <p>
          θ<sub>D</sub> = <b className="num">{fmt(Math.abs(vw10().total), 5)} rad</b> {rotWord(vw10().total)} (the sagging span A–C rotates the overhang upward).
        </p>
      </div>
    ),
    notes: ['"Change in slope at D" read as the rotation of the free end D relative to its unloaded position.'],
  },
  {
    id: '2015-16-B11',
    paper: '2015-16',
    sec: 'B',
    no: '11',
    marks: 28,
    topics: ['vw'],
    title: 'Vertical deflection at F of a portal with an overhang',
    pages: PG.B11,
    text: `Compute the vertical deflection at "F" of the frame in Fig. 10. Beam C–D–E–F–G at 12 ft: overhang C–D 5 ft, D–E 4 ft (20 k at D, 50 k-ft couple at C), E–F 8 ft carrying 5 k/ft, F–G 8 ft. Columns E–A (pinned at A) and G–B (roller at B). $A = 10$ in², $I = 300$ in⁴ for all members, $E = 30{,}000$ ksi.`,
    figure: () => <Figure model={f11} dimY />,
    checks: () => {
      const r = vw11()
      const bend = r.terms.reduce((s, t) => s + t.bending, 0)
      return [
        { key: 'dF', label: 'Vertical deflection at F (in, + = down)', value: r.total * 12, unit: 'in', tol: 0.03 },
        { key: 'bend', label: 'Bending part only', value: bend * 12, unit: 'in', tol: 0.03 },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Unit vertical load at F. Since A is pinned and B a roller (vertical reaction only), both systems are determinate: the columns carry only axial force (no horizontal reactions), so the column terms are axial only. With A and I given, include both:
$$\\Delta_F = \\sum\\int\\frac{Mm}{EI}dx + \\sum\\frac{NnL}{AE}$$`}</Md>
        <VWSolution model={f11} real={f11.loads} virtual={[P('F', 1)]} opts={opt11} scale={12} resultUnit="in" what="Δ_F (down +)" unitNote="EI = 30000 × 300 / 144 = 62 500 k-ft², EA = 300 000 k; ×12 for inches. Because the beam is short and stiff, the column axial term is of the same order as the bending term here — that is why A is given." />
      </div>
    ),
    notes: ['Couple at C read as 50 k-ft counter-clockwise from the hand sketch.'],
  },
  {
    id: '2015-16-B12',
    paper: '2015-16',
    sec: 'B',
    no: '12',
    marks: 28,
    topics: ['wheel'],
    title: 'Max shear at the one-third point of a 66 ft span',
    pages: PG.B12,
    text: `Determine the maximum shear at the one-third point of a simply supported beam of 66 ft due to the wheel loads in Fig. 11: 15, 60, 60, 60, 60, 60, 70, 70, 70, 70 k at spacings 10, 5, 5, 5, 5, 15, 5, 5, 5 ft, followed after 7 ft by a uniform load of 4 k/ft.`,
    checks: () => {
      const e = trainExtremes(ild12, train11)
      return [
        { key: 'vp', label: 'Max positive shear at 22 ft', value: e.max.value, unit: 'k' },
        { key: 'vn', label: 'Max negative shear at 22 ft (as negative)', value: e.min.value, unit: 'k' },
      ]
    },
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Section at $L/3 = 22$ ft: shear ILD $-1/3$ just left, $+2/3$ just right. The train travels right → left, so the 15 k wheel leads. For maximum positive shear a wheel sits just right of the section. Moving the train forward by one wheel spacing changes the shear by $\\Delta V = \\dfrac{W\\,\\Delta x}{L} - P_{passing}$ (W = load on the span) — stop when ΔV turns negative. Letting the 15 k wheel cross (10 ft move) pays off; letting the first 60 k wheel cross (5 ft) does not, so **wheel 2 just right of the section** governs. The first 70 k wheel at the section (wheel 7) comes close but is smaller.

The largest negative shear occurs late, with the four 70 k wheels on the short negative part (wheel 10 just left of the section) and the uniform tail starting on the positive part.`}</Md>
        <TrainOnILD ild={ild12} t={train11} span={[0, 66]} section={22} peak={{ x: 22, side: 1 }} what="shear at 22 ft" />
      </div>
    ),
  },
  {
    id: '2015-16-B13',
    paper: '2015-16',
    sec: 'B',
    no: '13',
    marks: 28,
    topics: ['wheel'],
    title: 'Max moment at the quarter point of an 80 ft span',
    pages: PG.B13,
    text: `Find the maximum moment at the quarter point of a simply supported beam of 80 ft for the wheel loads of Fig. 11 (15, 5 × 60, 4 × 70 k at 10, 5, 5, 5, 5, 15, 5, 5, 5 ft, then 4 k/ft after 7 ft).`,
    checks: () => [{ key: 'm', label: 'Max moment at 20 ft', value: trainExtremes(ild13, train11).max.value, unit: 'k-ft' }],
    solution: () => (
      <div className="space-y-2 text-sm">
        <Md>{`Moment ILD at $a = 20$ ft: triangle, peak $a(L-a)/L = 15$. **Criterion:** a wheel sits at the section when the average load on the left part (20 ft) equals the average load on the whole span: $W_{left}/a \\approx W/L$, i.e. the load on the left 20 ft ≈ W/4 as the critical wheel crosses the section. With the train travelling right → left (wheel 1 leads), **wheel 4** at the section governs.`}</Md>
        <TrainOnILD ild={ild13} t={train11} span={[0, 80]} section={20} peak={{ x: 20, side: 1 }} what="moment at 20 ft" resUnit="k-ft" />
      </div>
    ),
  },
  {
    id: '2015-16-B14',
    paper: '2015-16',
    sec: 'B',
    no: '14',
    marks: 28,
    topics: ['wheel'],
    title: 'Max tension in truss member "a" under a wheel train',
    pages: PG.B14,
    text: `Compute the maximum tension in member "a" of the truss in Fig. 8 for the wheel loads in Fig. 12: 10, 40, 40, 40, 40, 35, 35, 35, 35 k at spacings 12, 5, 5, 5, 10, 5, 5, 5 ft.`,
    figure: () => <Figure model={t9} labels />,
    checks: () => {
      const e = trainExtremes(ild9('a'), train12)
      return [
        { key: 'peak', label: 'Peak ordinate of ILD "a"', value: ildExtremes(ild9('a')).max.y },
        { key: 'T', label: 'Max tension in "a"', value: e.max.value, unit: 'k' },
      ]
    },
    solution: () => {
      const ild = ild9('a')
      const pk = ildExtremes(ild).max
      return (
        <div className="space-y-2 text-sm">
          <Md>{`ILD of "a" (from Q9): negative from L0 to L2, positive from L3 to L8 with the peak ${fmt(pk.y, 4)} at x = ${fmt(pk.x)} ft (L3), switching sign inside panel L2–L3. For maximum tension put the heavy group of wheels on the positive part with one wheel at L3 and the train heading toward L0; keep the light leading wheel off (or barely on) the negative part. Try each wheel at L3:`}</Md>
          <TrainOnILD ild={ild} t={train12} span={[0, 160]} section={pk.x} peak={{ x: pk.x, side: 1 }} what='force in "a"' />
        </div>
      )
    },
  },
]

