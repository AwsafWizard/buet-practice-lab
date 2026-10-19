import { useMemo, useState } from 'react'
import { DiagramView, fmt } from '../../components/DiagramView'
import { StructureView } from '../../components/StructureView'
import { Answer, Callout, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { diagramsFromResult } from '../../engine/diagrams'
import type { Load, Model } from '../../engine/model'
import { virtualWork } from '../../engine/vw'
import { beamOf, H, model, P, Pm, truss, W } from '../../kit/builders'
import { VWSolution } from '../../kit/solutions'
import { pick, randInt, rng, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

const E = 29000
const EIof = (I: number) => (E * I) / 144

// ---------------------------------------------------------------- product integral drill
type Shape = 'rect' | 'tri0' | 'tri1' | 'trap' | 'para'
const SHAPE_NAME: Record<Shape, string> = { rect: 'rectangle', tri0: 'triangle (0 → m at right)', tri1: 'triangle (m at left → 0)', trap: 'trapezoid', para: 'parabola (max mid, 0 ends)' }
function fShape(s: Shape, a: number, b: number) {
  return (x: number) => (s === 'rect' ? a : s === 'tri0' ? a * x : s === 'tri1' ? a * (1 - x) : s === 'trap' ? a + (b - a) * x : 4 * a * x * (1 - x))
}
function ShapeIcon({ s, a, b }: { s: Shape; a: number; b: number }) {
  const f = fShape(s, a, b)
  const mx = Math.max(Math.abs(a), Math.abs(b), 1)
  const pts = Array.from({ length: 41 }, (_, i) => `${10 + i * 3},${45 - (f(i / 40) / mx) * 32}`)
  return (
    <svg viewBox="0 0 140 60" className="w-36">
      <polygon points={`10,45 ${pts.join(' ')} 130,45`} fill="var(--c-accent)" fillOpacity={0.2} stroke="var(--c-accent)" />
      <line x1={10} x2={130} y1={45} y2={45} stroke="var(--c-faint)" />
    </svg>
  )
}
function ProductDrill() {
  const { seed, next } = useSeed(19)
  const g = useMemo(() => {
    const r = rng(seed)
    const shapes: Shape[] = ['rect', 'tri0', 'tri1', 'trap', 'para']
    const s1 = pick(r, shapes)
    const s2 = pick(r, ['rect', 'tri0', 'tri1', 'trap'] as Shape[])
    const L = randInt(r, 4, 20)
    const a1 = randInt(r, 2, 40),
      b1 = randInt(r, 2, 40),
      a2 = randInt(r, 1, 10),
      b2 = randInt(r, 1, 10)
    const f1 = fShape(s1, a1, b1),
      f2 = fShape(s2, a2, b2)
    let I = 0
    const N = 2000
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / N
      I += f1(x) * f2(x) * (L / N)
    }
    return { s1, s2, L, a1, b1, a2, b2, I }
  }, [seed])
  const desc = (s: Shape, a: number, b: number) => (s === 'trap' ? `${SHAPE_NAME[s]} ${a} → ${b}` : `${SHAPE_NAME[s]}, m = ${a}`)
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-center">
          <ShapeIcon s={g.s1} a={g.a1} b={g.b1} />
          <div className="text-xs text-mute">M: {desc(g.s1, g.a1, g.b1)}</div>
        </div>
        <span className="text-2xl text-faint">×</span>
        <div className="text-center">
          <ShapeIcon s={g.s2} a={g.a2} b={g.b2} />
          <div className="text-xs text-mute">m: {desc(g.s2, g.a2, g.b2)}</div>
        </div>
        <div>
          length L = <b>{g.L}</b>
        </div>
        <button className="btn ml-auto" onClick={next}>
          ↻ New pair
        </button>
      </div>
      <Answer key={seed} id={`vw:prod:${seed}`} label="∫₀ᴸ M m dx" value={g.I} />
      <p className="text-xs text-faint">Use the product-integral chart (Formulas tab) — exactly the chart attached to the question paper.</p>
    </div>
  )
}

// ---------------------------------------------------------------- deflection explorer
const EXPLORE: { name: string; m: Model; EI: number }[] = [
  { name: 'Simple beam, point load', m: { ...beamOf('A:0:pin B:10 C:25:roller'), loads: [Pm('BC', 5, 20)] }, EI: EIof(400) },
  { name: 'Overhanging beam with UDL', m: { ...beamOf('A:0:pin B:20:roller C:28'), loads: [W('AB', 2), Pm('BC', 8, 10)] }, EI: EIof(300) },
  { name: 'Portal frame (pin + roller)', m: { ...model('A:0,0 B:0,12 C:16,12 D:16,0', 'A-B B-C D-C', 'A:pin D:roller'), loads: [H('B', 10), Pm('BC', 8, 20)] }, EI: EIof(600) },
  { name: 'L-frame (fixed)', m: { ...model('A:0,0 B:0,10 C:12,10', 'A-B B-C', 'A:fixed'), loads: [P('C', 5), H('B', 4)] }, EI: EIof(500) },
]
function Explorer() {
  const [k, setK] = useState(0)
  const ex = EXPLORE[k]
  const [node, setNode] = useState('B')
  const [dir, setDir] = useState<'v' | 'h' | 'r'>('v')
  const nodeOk = ex.m.nodes.some((n) => n.id === node) ? node : ex.m.nodes[1].id
  const virt: Load[] = [{ kind: 'node', node: nodeOk, ...(dir === 'v' ? { fy: -1 } : dir === 'h' ? { fx: 1 } : { m: -1 }) }]
  const res = useMemo(() => {
    try {
      return virtualWork({ ...ex.m, EI: ex.EI }, ex.m.loads, virt)
    } catch (e) {
      return null
    }
  }, [ex, nodeOk, dir])
  const dR = useMemo(() => (res ? diagramsFromResult(ex.m, res.real) : []), [res])
  const dU = useMemo(() => (res ? diagramsFromResult(ex.m, res.virtual) : []), [res])
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {EXPLORE.map((e, i) => (
          <button key={e.name} className={'btn !py-1 !text-xs ' + (i === k ? '!border-accent text-accent' : '')} onClick={() => setK(i)}>
            {e.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Unit load at</span>
        <Seg size="xs" value={nodeOk} onChange={setNode} items={ex.m.nodes.map((n) => ({ v: n.id, label: n.id }))} />
        <Seg size="xs" value={dir} onChange={setDir} items={[{ v: 'v', label: 'vertical ↓' }, { v: 'h', label: 'horizontal →' }, { v: 'r', label: 'unit couple ↻' }]} />
      </div>
      {res ? (
        <>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <div className="text-xs text-mute font-semibold">Real loads — M</div>
              <DiagramView model={ex.m} members={dR} kind="M" showLoads maxHeight={240} />
            </div>
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <div className="text-xs text-mute font-semibold">Virtual unit load — m</div>
              <DiagramView model={{ ...ex.m, loads: virt }} members={dU} kind="M" showLoads maxHeight={240} />
            </div>
          </div>
          <div className="text-sm">
            <Tex>{`\\Delta = \\sum\\int\\frac{Mm}{EI}dx = `}</Tex> <b className="num">{fmt(res.total * (dir === 'r' ? 1 : 12), 5)}</b> {dir === 'r' ? 'rad' : 'in'} {dir === 'r' ? '(+ = clockwise)' : dir === 'v' ? '(+ = downward)' : '(+ = to the right)'} · EI = {fmt(ex.EI, 0)} k-ft² (E = 29000 ksi)
          </div>
        </>
      ) : (
        <div className="text-bad text-sm">That point is a support restraint — pick a free joint.</div>
      )}
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Unit-load (virtual work) method" right={<div className="w-72 hidden md:block"><TopicFrequency topic="vw" /></div>}>
        <Md>{`To find a displacement Δ at a point, apply a **unit virtual load** there in the direction of Δ (a unit **couple** for a rotation, a **pair** of opposite unit loads for a relative displacement), find the internal forces it causes (m, n, v), then
$$1\\cdot\\Delta = \\sum\\int\\frac{Mm}{EI}dx + \\sum\\frac{NnL}{AE} + \\sum\\int\\frac{K\\,Vv}{GA}dx + \\sum n\\,\\Delta L_{fab} - \\sum r\\,\\Delta_{support}$$
- beams & frames: bending term (add axial / shear when asked — K = 1.2 rectangular, $G = E/2(1+\\nu)$);
- trusses: $\\sum NnL/AE$; fabrication error or temperature: $\\sum n\\,\\Delta L$ ($\\Delta L = \\alpha\\Delta T L$);
- positive result → displacement in the direction of the unit load.`}</Md>
        <Callout kind="exam">Virtual work has been in every paper since 2011-12 — 3 parts of Section A in 2023-24 (girder on a jack, truss relative deflection, column with axial + shear + bending). The product-integral chart is attached to the paper.</Callout>
      </Section>
      <Section title="Units — where marks are lost">
        <Md>{`E in ksi and I in in⁴ with lengths in ft: $EI = E\\cdot I/144$ k-ft², ∫Mm dx in k-ft³ → Δ in ft (× 12 for inches). Trusses: L in ft, A in in², E in ksi → $\\sum NnL/AE$ in ft (× 12 → in). Rotations come out in radians directly.`}</Md>
      </Section>
    </div>
  )
}

function Approach() {
  const m = { ...beamOf('A:0:pin B:10 C:25:roller'), loads: [Pm('BC', 5, 20)] }
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Real system">Reactions and M(x) for each member/segment (keep the same x origin for both systems).</Step>
          <Step n={2} title="Virtual system">Remove real loads, put the unit load/couple at the point, find m(x) (and n, v if needed).</Step>
          <Step n={3} title="Integrate segment by segment">Change segment wherever M, m or EI changes; use the product-integral chart for standard shapes.</Step>
          <Step n={4} title="Sum and convert units">Sign tells the direction.</Step>
          <Step n={5} title="Special cases">Jack / support movement: rigid-body part + elastic part. Fabrication: add Σ n·ΔL. Relative displacement: unit pair.</Step>
        </Steps>
      </Section>
      <Section title="Worked: deflection under the load of a simple beam" sub="EI from I = 400 in⁴">
        <VWSolution model={{ ...m, EI: EIof(400) }} real={m.loads} virtual={[{ kind: 'node', node: 'B', fy: -1 }]} scale={12} resultUnit="in" what="Δ_B (down)" unitNote="EI in k-ft²; × 12 for inches." />
      </Section>
      <Section title="Explore: pick the point and the direction">
        <Explorer />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Product-integral drill" sub="The single most repeated calculation in VW questions.">
        <ProductDrill />
      </Section>
      <Section title="Deflection explorer">
        <Explorer />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const vwP = (id: string, level: PYQ['level'], title: string, text: string, m: Model, virt: Load[], opts: Parameters<typeof virtualWork>[3], unit: 'in' | 'rad', what: string): PYQ => ({
  id: `own-vw-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 0,
  topics: ['vw'],
  title,
  text,
  pages: [],
  figure: () => <StructureView model={m} autoDimX autoDimY={m.nodes.some((n) => n.y !== 0)} memberLabels maxHeight={240} />,
  checks: () => [{ key: 'd', label: what, value: virtualWork(m, m.loads, virt, opts).total * (unit === 'in' ? 12 : 1), unit }],
  solution: () => <VWSolution model={m} real={m.loads} virtual={virt} opts={opts} scale={unit === 'in' ? 12 : 1} resultUnit={unit} what={what} />,
})
const tr = truss('A:0,0 B:15,0 C:30,0 D:15,12', 'A-B B-C A-D D-C D-B', 'A:pin C:roller', [P('B', 30), { kind: 'node', node: 'D', fx: 10 }])
tr.members.forEach((x) => (x.label = x.id === 'DB' ? '(2)' : '(4)'))
const step = { ...beamOf('A:0:fixed B:10 C:20'), loads: [P('C', 8), W('AB', 1)] }
step.members[0].EI = EIof(600)
step.members[1].EI = EIof(300)
const fr = { ...model('A:0,0 B:0,12 C:15,12 D:15,0', 'A-B B-C D-C', 'A:pin D:roller'), loads: [H('B', 8), W('BC', 2)], EI: EIof(800) }
const problems: PYQ[] = [
  vwP('1', 'warm-up', 'Stepped cantilever', 'Cantilever A–C, I = 600 in⁴ on A–B and 300 in⁴ on B–C (E = 29000 ksi), 1 k/ft on A–B and 8 k at C. Tip deflection.', step, [{ kind: 'node', node: 'C', fy: -1 }], {}, 'in', 'Δ_C (down)'),
  vwP('2', 'exam', 'Truss joint deflection', 'Truss areas in brackets (in²), E = 29000 ksi; 30 k down at B and 10 k horizontal at D. Vertical deflection of B.', tr, [{ kind: 'node', node: 'B', fy: -1 }], { EA: (id) => (id === 'DB' ? 2 : 4) * E }, 'in', 'Δ_B (down)'),
  vwP('3', 'exam', 'Portal frame sway', 'Pin at A, roller at D, EI = const (I = 800 in⁴). 8 k at B and 2 k/ft on the beam. Horizontal deflection of C.', fr, [H('C', 1)], {}, 'in', 'Δ_C (→)'),
  vwP('4', 'challenge', 'Rotation at a roller', 'Same frame: rotation of joint C (unit couple).', fr, [{ kind: 'node', node: 'C', m: -1 }], {}, 'rad', 'θ_C (clockwise +)'),
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
