import { useMemo, useState } from 'react'
import { DiagramView, fmt, type DiagramKind } from '../../components/DiagramView'
import { StructureView } from '../../components/StructureView'
import { Answer, Callout, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { diagramsFromResult } from '../../engine/diagrams'
import { solve, UnstableError } from '../../engine/frame2d'
import type { Load, Model } from '../../engine/model'
import { beamOf, H, model, P, Pm, W } from '../../kit/builders'
import { FrameSolution, reactionOverlay } from '../../kit/solutions'
import { pick, randInt, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

// ---------------------------------------------------------------- templates
interface Tpl {
  name: string
  build: (p: { a: number; P: number; w: number; H: number }) => Model
  aMax: number
}
const TEMPLATES: Tpl[] = [
  { name: 'Simple beam', aMax: 20, build: ({ a, P: p, w }) => ({ ...beamOf('A:0:pin B:20:roller'), loads: [Pm('AB', a, p), ...(w ? [W('AB', w)] : [])] }) },
  { name: 'Overhanging beam', aMax: 26, build: ({ a, P: p, w }) => ({ ...beamOf('A:0:pin B:20:roller C:26'), loads: [a <= 20 ? Pm('AB', a, p) : Pm('BC', a - 20, p), ...(w ? [W('AB', w), W('BC', w)] : [])] }) },
  { name: 'Cantilever', aMax: 15, build: ({ a, P: p, w }) => ({ ...beamOf('A:0:fixed B:15'), loads: [Pm('AB', a, p), ...(w ? [W('AB', w)] : [])] }) },
  {
    name: 'Gerber beam (hinge)',
    aMax: 30,
    build: ({ a, P: p, w }) => {
      const m = beamOf('A:0:pin B:16:roller C*:20 D:30:roller')
      const seg = a <= 16 ? Pm('AB', a, p) : a <= 20 ? Pm('BC', a - 16, p) : Pm('CD', a - 20, p)
      return { ...m, loads: [seg, ...(w ? [W('AB', w), W('BC', w), W('CD', w)] : [])] }
    },
  },
  {
    name: 'Portal (pin + roller)',
    aMax: 20,
    build: ({ a, P: p, w, H: h }) => ({ ...model('A:0,0 B:0,12 C:20,12 D:20,0', 'A-B B-C D-C', 'A:pin D:roller'), loads: [Pm('BC', a, p), ...(w ? [W('BC', w)] : []), ...(h ? [H('B', h)] : [])] }),
  },
  {
    name: 'Three-hinged frame',
    aMax: 20,
    build: ({ a, P: p, w, H: h }) => {
      const m = model('A:0,0 B:0,12 C*:10,12 D:20,12 E:20,0', 'A-B B-C C-D E-D', 'A:pin E:pin')
      return { ...m, loads: [a <= 10 ? Pm('BC', a, p) : Pm('CD', a - 10, p), ...(w ? [W('BC', w), W('CD', w)] : []), ...(h ? [H('B', h)] : [])] }
    },
  },
  {
    name: 'L-frame (fixed base)',
    aMax: 12,
    build: ({ a, P: p, w, H: h }) => ({ ...model('A:0,0 B:0,10 C:12,10', 'A-B B-C', 'A:fixed'), loads: [Pm('BC', a, p), ...(w ? [W('BC', w)] : []), ...(h ? [H('B', h)] : [])] }),
  },
]

function Sandbox() {
  const [ti, setTi] = useState(5)
  const tpl = TEMPLATES[ti]
  const [a, setA] = useState(5)
  const [Pv, setP] = useState(20)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  const [kind, setKind] = useState<DiagramKind>('M')
  const m = useMemo(() => tpl.build({ a: Math.min(a, tpl.aMax), P: Pv, w, H: h }), [tpl, a, Pv, w, h])
  const res = useMemo(() => {
    try {
      const r = solve(m)
      return { r, d: diagramsFromResult(m, r) }
    } catch (e) {
      return { err: e instanceof UnstableError ? 'unstable' : String(e) }
    }
  }, [m])
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATES.map((t, i) => (
          <button key={t.name} className={'btn !py-1 !text-xs ' + (i === ti ? '!border-accent text-accent' : '')} onClick={() => setTi(i)}>
            {t.name}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
        <Slider label="Point load at x" value={Math.min(a, tpl.aMax)} min={0} max={tpl.aMax} step={0.5} onChange={setA} unit="′" />
        <Slider label="Point load P" value={Pv} min={0} max={50} onChange={setP} unit="k" />
        <Slider label="UDL w" value={w} min={0} max={5} step={0.5} onChange={setW} unit="k/ft" />
        {ti >= 4 && <Slider label="Lateral load H at B" value={h} min={-20} max={20} onChange={setH} unit="k" />}
      </div>
      {'err' in res ? (
        <div className="text-bad text-sm">Structure is unstable.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs text-mute font-semibold px-1">Loads & reactions</div>
            <StructureView model={m} autoDimX maxHeight={260}>
              {reactionOverlay(res.r!, m)}
            </StructureView>
          </div>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-mute font-semibold">Diagram updates live</span>
              <Seg size="xs" value={kind} onChange={setKind} items={[{ v: 'N', label: 'AFD' }, { v: 'V', label: 'SFD' }, { v: 'M', label: 'BMD' }]} />
            </div>
            <DiagramView model={m} members={res.d!} kind={kind} maxHeight={300} pad={60} />
          </div>
        </div>
      )}
      <Callout kind="tip">Watch what happens to the BMD of the three-hinged frame as the load crosses the hinge C: the moment at C stays exactly zero — that single condition is the extra equation that makes a 4-reaction frame solvable.</Callout>
    </div>
  )
}

// ---------------------------------------------------------------- challenge
function makeChallenge(seed: number) {
  const r = rng(seed)
  const t = pick(r, [0, 1, 3, 4, 5, 6])
  const tpl = TEMPLATES[t]
  const params = { a: randInt(r, 2, tpl.aMax - 2), P: randInt(r, 5, 40, 5), w: pick(r, [0, 1, 2, 3]), H: t >= 4 ? pick(r, [0, 5, 10, -10]) : 0 }
  const m = tpl.build(params)
  return { m, name: tpl.name }
}

function Challenge() {
  const { seed, next } = useSeed(7)
  const [show, setShow] = useState(false)
  const ch = useMemo(() => makeChallenge(seed), [seed])
  const r = useMemo(() => solve(ch.m), [ch])
  const d = useMemo(() => diagramsFromResult(ch.m, r), [ch, r])
  const Mabs = Math.max(...d.flatMap((x) => x.samples.map((s) => Math.abs(s.M))))
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="chip">{ch.name}</span>
        <button
          className="btn !py-1 ml-auto"
          onClick={() => {
            next()
            setShow(false)
          }}
        >
          ↻ New problem
        </button>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={ch.m} autoDimX autoDimY={ch.m.nodes.some((n) => n.y !== 0)} maxHeight={260} />
      </div>
      <div className="rounded-xl border border-line p-3">
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Step 1 — reactions (up / right positive)</div>
        {r.reactions.map((x) => (
          <div key={x.node}>
            {ch.m.supports.find((s) => s.node === x.node)?.type !== 'roller' && <Answer key={`${seed}x${x.node}`} id={`frames:lab:${seed}:${x.node}x`} label={`H at ${x.node}`} value={x.rx} unit="k" compact />}
            <Answer key={`${seed}y${x.node}`} id={`frames:lab:${seed}:${x.node}y`} label={`V at ${x.node}`} value={x.ry} unit="k" compact />
            {Math.abs(x.m) > 1e-9 && <Answer key={`${seed}m${x.node}`} id={`frames:lab:${seed}:${x.node}m`} label={`M at ${x.node} (ccw +)`} value={x.m} unit="k-ft" compact />}
          </div>
        ))}
        <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1 mt-3">Step 2 — the largest bending moment (magnitude)</div>
        <Answer key={`${seed}M`} id={`frames:lab:${seed}:Mmax`} label="|M|max" value={Mabs} unit="k-ft" magnitude />
      </div>
      <button className="btn" onClick={() => setShow(!show)}>
        {show ? 'Hide' : 'Reveal'} full solution & diagrams
      </button>
      {show && <FrameSolution model={ch.m} kinds={['N', 'V', 'M']} />}
    </div>
  )
}

// ---------------------------------------------------------------- approach (stepper)
const EX = (() => {
  const m = model('A:0,0 B:0,12 C*:10,12 D:20,12 E:20,0', 'A-B B-C C-D E-D', 'A:pin E:pin', [Pm('BC', 5, 20), W('CD', 2), H('B', 10)])
  return m
})()

function Stepper() {
  const [k, setK] = useState(0)
  const r = useMemo(() => solve(EX), [])
  const d = useMemo(() => diagramsFromResult(EX, r), [r])
  const A = r.reaction('A'),
    E = r.reaction('E')
  const steps = [
    {
      t: 'Draw the free body & count unknowns',
      body: <Md>{`Pins at A and E → 4 unknowns ($A_x, A_y, E_x, E_y$). Statics gives 3 equations; the internal hinge C gives the 4th: **$M_C = 0$ from either side**.`}</Md>,
    },
    {
      t: 'Global moment about A',
      body: <Tex block>{`\\sum M_A = 0:\\ E_y(20) - 20(5) - 2(10)(15) - 10(12) = 0 \\Rightarrow E_y = ${fmt(E.ry)}\\text{ k}`}</Tex>,
    },
    {
      t: 'Hinge condition on the right part (C–D–E)',
      body: <Tex block>{`\\sum M_C^{right} = 0:\\ E_y(10) - 2(10)(5) + E_x(12) = 0 \\Rightarrow E_x = ${fmt(E.rx)}\\text{ k}\\ (${E.rx < 0 ? '\\leftarrow' : '\\rightarrow'})`}</Tex>,
    },
    {
      t: 'Remaining equilibrium',
      body: <Tex block>{`\\sum F_x: A_x = ${fmt(A.rx)},\\qquad \\sum F_y: A_y = 20 + 20 - E_y = ${fmt(A.ry)}\\text{ k}`}</Tex>,
    },
    { t: 'Member by member: axial & shear', body: <Md>{`Cut each member, take the free body from the nearest support. Column AB: axial = $-A_y$ (compression), shear = horizontal force. Beam B–D: shear starts at the joint force, drops by 20 k at the point load, falls linearly under the UDL.`}</Md> },
    { t: 'Bending moment', body: <Md>{`M is the area of the shear diagram (dM/dx = V). It must be **zero at the hinge C** and at the pins A, E — use these as checks.`}</Md> },
  ]
  const kind: DiagramKind = k >= 5 ? 'M' : 'V'
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
      <div>
        <Steps>
          {steps.slice(0, k + 1).map((s, i) => (
            <Step key={i} n={i + 1} title={s.t}>
              {s.body}
            </Step>
          ))}
        </Steps>
        <div className="flex gap-2 mt-3">
          <button className="btn" disabled={k === 0} onClick={() => setK(k - 1)}>
            ← Back
          </button>
          <button className="btn btn-primary" disabled={k === steps.length - 1} onClick={() => setK(k + 1)}>
            Next step →
          </button>
        </div>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        {k < 4 ? (
          <StructureView model={EX} autoDimX maxHeight={280}>
            {k >= 1 ? reactionOverlay(r, EX) : undefined}
          </StructureView>
        ) : (
          <DiagramView model={EX} members={d} kind={kind} />
        )}
        <div className="text-xs text-faint px-2">{k < 4 ? 'Reactions appear as you solve for them.' : kind === 'V' ? 'Shear force diagram' : 'Bending moment diagram — note M = 0 at the hinge C.'}</div>
      </div>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="What this topic is" right={<div className="w-72 hidden md:block"><TopicFrequency topic="frames" /></div>}>
        <Md>{`A **statically determinate** frame or beam can be solved with equilibrium alone: reactions first, then the internal forces in every member — **axial force N, shear V and bending moment M** — drawn as AFD, SFD and BMD.

Exam questions add a twist to make the reactions interesting:
- **internal hinges** (Gerber beams, three-hinged frames) → each hinge gives one extra equation, $M = 0$;
- a **given internal value** (e.g. "shear at E = −16 k", "$M_A$ = 300 k-ft") → replaces a missing equation;
- **inclined members** with loads per horizontal length, links, and members meeting at odd angles.`}</Md>
      </Section>
      <Section title="Relations you use every time">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`\\frac{dV}{dx} = -w(x),\\qquad \\frac{dM}{dx} = V`}</Tex>
            <Tex block>{`M_2 - M_1 = \\int_1^2 V\\,dx\\ \\ (\\text{area of SFD}),\\qquad V_2 - V_1 = -\\int_1^2 w\\,dx`}</Tex>
            <Md>{`- Point load P → **jump** of P in the SFD, kink in the BMD.
- Couple $M_0$ → **jump** of $M_0$ in the BMD, no effect on the SFD.
- Max moment occurs where **V = 0** (or at a jump through zero).`}</Md>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Load on the segment</th>
                <th>SFD</th>
                <th>BMD</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['none', 'constant', 'straight line'],
                ['uniform w', 'straight (slope −w)', 'parabola (2nd degree)'],
                ['triangular', 'parabola', 'cubic'],
                ['point load', 'jump', 'kink (slope changes)'],
                ['couple', 'no change', 'jump'],
                ['internal hinge', '—', 'M = 0 there'],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="txt">{r[0]}</td>
                  <td className="txt">{r[1]}</td>
                  <td className="txt">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Sign conventions used here">
        <Md>{`- **Axial**: tension +.
- **Shear**: + when the part to the *left* of the cut is pushed *up* (members are read left→right; columns bottom→top).
- **Moment**: sagging + (tension at the bottom of a beam). Your teacher may ask you to draw the BMD **on the compression side** — that is the usual “positive above the axis” drawing for beams. Switch the side in the sidebar (*BMD drawn on*) and every diagram in the app follows.`}</Md>
        <Callout kind="exam">Recent papers: 2022-23 had two frame questions (one with an internal hinge), 2021-22 one; older papers ask for AFD + SFD + BMD of a frame with an inclined member or a given internal shear.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="The recipe" sub="Same five moves for every determinate frame">
        <Steps>
          <Step n={1} title="Free body + count">
            Unknown reactions r vs 3 equations + one per internal hinge (or per given internal value). If they match, it’s determinate.
          </Step>
          <Step n={2} title="Pick equations that isolate one unknown">
            Moments about a support or the hinge kill other unknowns. For a three-hinged frame: ΣM about A for the whole frame, then ΣM about the hinge for the part that contains the other support.
          </Step>
          <Step n={3} title="Joint forces">Walk from a support through each joint; resolve forces along/perpendicular to each member (inclined members!).</Step>
          <Step n={4} title="SFD then BMD">Use the shape rules. BMD from the SFD areas; mark peak values (where V = 0) and values at every joint.</Step>
          <Step n={5} title="Check">M = 0 at pins/hinges/free ends; moments balance at rigid joints; AFD jumps equal the transverse forces at bends.</Step>
        </Steps>
      </Section>
      <Section title="Worked example — step through it" sub="Three-hinged frame with a point load, a UDL and a lateral load">
        <Stepper />
      </Section>
      <Section title="Common traps">
        <Callout kind="trap">At a rigid corner the moment is continuous (column top moment = beam end moment) but the shear in one member becomes the axial force in the other.</Callout>
        <Callout kind="trap">Loads on an inclined member: per unit length *along* the member vs per unit *horizontal* length differ by cos θ. Read the figure.</Callout>
        <Callout kind="trap">For a beam with hinges, solve the “hanging” (drop-in) span first — its reactions are loads on the supporting part.</Callout>
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Sandbox — drag the loads" sub="Pick a structure; diagrams update instantly. Build intuition for shapes before you calculate.">
        <Sandbox />
      </Section>
      <Section title="Diagram challenge" sub="Random determinate structure: find the reactions and the peak moment, then reveal the full diagrams.">
        <Challenge />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const own = (id: string, level: PYQ['level'], title: string, text: string, m: Model, checks: (r: ReturnType<typeof solve>) => { key: string; label: string; value: number; unit?: string }[], kinds: DiagramKind[] = ['V', 'M'], dimY = false): PYQ => ({
  id: `own-frames-${id}`,
  paper: 'own',
  level,
  sec: 'B',
  no: id,
  marks: 0,
  topics: ['frames'],
  title,
  text,
  pages: [],
  figure: () => <StructureView model={m} autoDimX autoDimY={dimY} maxHeight={260} />,
  checks: () => checks(solve(m)),
  solution: () => <FrameSolution model={m} kinds={kinds} />,
})

const L1 = (loads: Load[]) => loads
const problems: PYQ[] = [
  own('1', 'warm-up', 'Overhanging beam', 'Draw SFD and BMD. Find the reactions and the maximum positive and negative moments.', { ...beamOf('A:0:pin B:20:roller C:28'), loads: L1([W('AB', 2), Pm('BC', 8, 10)]) }, (r) => [
    { key: 'B', label: 'Reaction at B', value: r.reaction('B').ry, unit: 'k' },
    { key: 'MB', label: 'Moment at B', value: r.member('BC').M(0), unit: 'k-ft' },
  ]),
  own('2', 'warm-up', 'Gerber beam with a drop-in span', 'A–B fixed-end cantilever carries a drop-in span B–D through the hinge B. Draw SFD and BMD.', { ...beamOf('A:0:fixed B*:10 C:20 D:25:roller'), loads: L1([Pm('BC', 5, 20), W('CD', 3)]) }, (r) => [
    { key: 'D', label: 'Reaction at D', value: r.reaction('D').ry, unit: 'k' },
    { key: 'MA', label: 'Fixed-end moment at A (ccw +)', value: r.reaction('A').m, unit: 'k-ft' },
  ]),
  own(
    '3',
    'exam',
    'Three-hinged frame with lateral load',
    'Frame with pins at A and E and an internal hinge at C. Find all reactions and draw AFD, SFD and BMD.',
    model('A:0,0 B:0,15 C*:12,15 D:24,15 E:24,0', 'A-B B-C C-D E-D', 'A:pin E:pin', [W('BC', 3), Pm('CD', 6, 24), H('B', 12)]),
    (r) => [
      { key: 'Ey', label: 'Vertical reaction at E', value: r.reaction('E').ry, unit: 'k' },
      { key: 'Ex', label: 'Horizontal reaction at E (→ +)', value: r.reaction('E').rx, unit: 'k' },
    ],
    ['N', 'V', 'M'],
    true,
  ),
  own(
    '4',
    'exam',
    'Frame with an inclined leg',
    'Pin at A, roller at D (vertical reaction). The inclined member CD carries 2 k/ft per horizontal foot. Draw SFD and BMD.',
    model('A:0,0 B:0,16 C:16,16 D:28,0', 'A-B B-C C-D', 'A:pin D:roller', [Pm('BC', 8, 20), { kind: 'dist', member: 'CD', w1: -2, dir: 'y', proj: true }]),
    (r) => [
      { key: 'Dy', label: 'Reaction at D', value: r.reaction('D').ry, unit: 'k' },
      { key: 'MC', label: 'Moment at C', value: r.member('BC').M(16), unit: 'k-ft' },
    ],
    ['N', 'V', 'M'],
    true,
  ),
  own(
    '5',
    'challenge',
    'Two hinges and an overhang',
    'Beam A (fixed) – B (hinge) – C (roller) – D (hinge) – E (roller) – F (free end). Find the reactions and draw SFD/BMD.',
    { ...beamOf('A:0:fixed B*:8 C:16:roller D*:22 E:32:roller F:36'), loads: L1([W('AB', 2), Pm('BC', 4, 12), W('DE', 3), Pm('EF', 4, 8)]) },
    (r) => [
      { key: 'E', label: 'Reaction at E', value: r.reaction('E').ry, unit: 'k' },
      { key: 'C', label: 'Reaction at C', value: r.reaction('C').ry, unit: 'k' },
      { key: 'A', label: 'Moment at A (ccw +)', value: r.reaction('A').m, unit: 'k-ft' },
    ],
  ),
  own(
    '6',
    'challenge',
    'Portal with a couple and an overhang',
    'Pin at A, roller at E. A 40 k-ft clockwise couple acts at C; the beam overhangs 6 ft past D. Draw AFD, SFD and BMD.',
    model('A:0,0 B:0,12 C:10,12 D:20,12 F:26,12 E:20,0', 'A-B B-C C-D D-F E-D', 'A:pin E:roller', [{ kind: 'node', node: 'C', m: -40 }, Pm('DF', 6, 10), Pm('BC', 5, 15)]),
    (r) => [
      { key: 'Ey', label: 'Reaction at E', value: r.reaction('E').ry, unit: 'k' },
      { key: 'MD', label: 'Moment in the beam at D (left)', value: r.member('CD').M(10), unit: 'k-ft' },
    ],
    ['N', 'V', 'M'],
    true,
  ),
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
