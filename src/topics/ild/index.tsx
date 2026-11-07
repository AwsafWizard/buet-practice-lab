import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { BeamPlayground } from './BeamPlayground'
import { checkILD, ILDChart, ILDEditor, type Handle } from '../../components/ILDChart'
import { makeTransform, StructureView } from '../../components/StructureView'
import { Callout, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { ildAt, influenceLine, type ILD, type Response } from '../../engine/ild'
import type { Model } from '../../engine/model'
import { uniformPlusConcentrated } from '../../engine/moving'
import { rotTag } from '../../engine/sign'
import { beamOf, pathOf } from '../../kit/builders'
import { ILDStack, MaxEffect } from '../../kit/solutions'
import { pick, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import type { Check, PYQ } from '../../pyq/types'
import { useStore } from '../../store'
import type { TopicModule } from '../modules'

// ---------------------------------------------------------------- beam templates for games
const BEAMS = [
  'A:0:pin S:8 B:20:roller',
  'A:0 B:6:pin S:14 C:22:roller D:28',
  'A:0:fixed S:6 B:14',
  'A:0:pin S:6 B:12:roller C*:18 D:30:roller',
  'A:0:fixed D:10 B*:20 E:30 C:40:roller',
  'A:0:pin B:10:roller C*:15 S:20 D:25:roller E*:30 F:40:roller',
  'A:0:fixed B*:10 S:16 C:22:roller D:28',
  'A:0 B:5:pin S:15 C*:20 D:30:roller E:35',
]

interface Fn {
  label: string
  resp: Response
}

function functionsFor(m: Model): Fn[] {
  const out: Fn[] = []
  const nodes = [...m.nodes].sort((a, b) => a.x - b.x)
  for (const s of m.supports) {
    out.push({ label: `Reaction R_${s.node}`, resp: { kind: 'reaction', node: s.node, comp: 'y' } })
    if (s.type === 'fixed') out.push({ label: `Moment M_${s.node} (reaction, ${rotTag()})`, resp: { kind: 'reaction', node: s.node, comp: 'm' } })
  }
  for (const n of nodes) {
    const right = m.members.find((x) => x.i === n.id)
    const left = m.members.find((x) => x.j === n.id)
    const isSup = m.supports.some((s) => s.node === n.id)
    if (n.hinge) {
      if (right) out.push({ label: `Shear at hinge ${n.id}`, resp: { kind: 'shear', member: right.id, x: 0, side: 1 } })
      continue
    }
    if (!isSup && right && left) {
      out.push({ label: `Moment M_${n.id}`, resp: { kind: 'moment', member: right.id, x: 0 } })
      out.push({ label: `Shear V_${n.id}`, resp: { kind: 'shear', member: right.id, x: 0, side: 1 } })
    }
    if (isSup && right && left) {
      out.push({ label: `Shear just right of ${n.id}`, resp: { kind: 'shear', member: right.id, x: 0, side: 1 } })
      out.push({ label: `Shear just left of ${n.id}`, resp: { kind: 'shear', member: left.id, x: m.members.find((x) => x.id === left.id) ? lengthOf(m, left.id) : 0, side: -1 } })
      out.push({ label: `Moment at support ${n.id}`, resp: { kind: 'moment', member: right.id, x: 0 } })
    }
  }
  return out
}

function lengthOf(m: Model, id: string) {
  const mem = m.members.find((x) => x.id === id)!
  const a = m.nodes.find((n) => n.id === mem.i)!
  const b = m.nodes.find((n) => n.id === mem.j)!
  return Math.abs(b.x - a.x)
}

function GuessGame() {
  const { seed, next } = useSeed(21)
  const g = useMemo(() => {
    const r = rng(seed)
    const m = beamOf(pick(r, BEAMS))
    const fns = functionsFor(m)
    const fn = pick(r, fns)
    const truth = influenceLine(m, { kind: 'members', members: pathOf(m) }, fn.resp)
    const xs = [...new Set(m.nodes.map((n) => n.x))].sort((a, b) => a - b)
    const handles: Handle[] = []
    for (const x of xs) {
      const jump = Math.abs(ildAt(truth, x, -1) - ildAt(truth, x, 1)) > 1e-9
      if (jump) handles.push({ x, side: -1 }, { x, side: 1 })
      else handles.push({ x })
    }
    return { m, fn, truth, handles }
  }, [seed])
  const [values, setValues] = useState<number[]>([])
  const [results, setResults] = useState<boolean[] | null>(null)
  const [revealed, setRevealed] = useState(false)
  const record = useStore((s) => s.record)
  useEffect(() => {
    setValues(g.handles.map(() => 0))
    setResults(null)
    setRevealed(false)
  }, [g])
  const t = useMemo(() => makeTransform(g.m.nodes.map((n) => [n.x, n.y]), 820, 300, 70), [g])
  const check = () => {
    const c = checkILD(g.truth, g.handles, values)
    setResults(c.details.map((d) => d.ok))
    record(`ild:guess:${seed}`, c.ok)
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-lg font-bold">
          Draw the ILD for: <span className="text-accent">{g.fn.label}</span>
        </div>
        <button className="btn ml-auto" onClick={next}>
          ↻ New beam / function
        </button>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={g.m} showLoads={false} autoDimX maxWidth={820} maxHeight={300} />
        <div className="border-t border-line/60">
          <ILDEditor truth={g.truth} handles={g.handles} values={values} setValues={setValues} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} revealed={revealed} results={results} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Drag each dot up/down to the ordinate (unit load at that point). Two dots at one x = a jump.</span>
        <button className="btn btn-primary ml-auto" onClick={check}>
          Check shape
        </button>
        <button className="btn" onClick={() => setRevealed(!revealed)}>
          {revealed ? 'Hide' : 'Reveal'} answer
        </button>
      </div>
      {results && (
        <div className={'text-sm font-semibold ' + (results.every(Boolean) ? 'text-good' : 'text-bad')}>
          {results.every(Boolean) ? '✓ Perfect shape!' : `${results.filter(Boolean).length}/${results.length} points right — red dots are off. Think Müller-Breslau: what moves when you release this restraint?`}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Müller-Breslau animation
const MB_BEAM = beamOf('A:0:pin S:8 B:16:roller C*:22 D:32:roller')
const MB_FNS: Fn[] = [
  { label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } },
  { label: 'M at S', resp: { kind: 'moment', member: 'SB', x: 0 } },
  { label: 'V at S', resp: { kind: 'shear', member: 'SB', x: 0, side: 1 } },
  { label: 'R_D', resp: { kind: 'reaction', node: 'D', comp: 'y' } },
  { label: 'M at B', resp: { kind: 'moment', member: 'BC', x: 0 } },
  { label: 'Shear just right of B', resp: { kind: 'shear', member: 'BC', x: 0, side: 1 } },
]
function MullerBreslau() {
  const [k, setK] = useState(0)
  const [rep, setRep] = useState(0)
  const [amp, setAmp] = useState(0)
  const fn = MB_FNS[k]
  const ild = useMemo(() => influenceLine(MB_BEAM, { kind: 'members', members: pathOf(MB_BEAM) }, fn.resp), [fn])
  useEffect(() => {
    setAmp(0)
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const f = Math.min(1, (t - t0) / 1200)
      setAmp(1 - Math.pow(1 - f, 3))
      if (f < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [k, rep])
  const t = makeTransform([...MB_BEAM.nodes.map((n) => [n.x, n.y] as [number, number]), [0, 3], [0, -3]], 820, 300, 70)
  const yMax = Math.max(...ild.pts.map((p) => Math.abs(p.y)), 1e-6)
  const scale = 55 / yMax
  const path = ild.pts.map((p, i) => `${i ? 'L' : 'M'}${t.x(p.x)},${t.y(0) - p.y * scale * amp}`).join(' ')
  const what = fn.resp.kind === 'reaction' ? 'Remove the support, push it up by 1' : fn.resp.kind === 'moment' ? 'Insert a hinge at the section, rotate the two sides by a unit relative angle' : 'Cut the beam with a slider (keeps the sides parallel), separate the sides by a unit relative displacement'
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {MB_FNS.map((f, i) => (
          <button key={f.label} className={'btn !py-1 !text-xs ' + (i === k ? '!border-accent text-accent' : '')} onClick={() => setK(i)}>
            {f.label}
          </button>
        ))}
        <button className="btn !py-1 !text-xs ml-auto" onClick={() => setRep((x) => x + 1)}>
          ▶ replay
        </button>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={MB_BEAM} showLoads={false} autoDimX maxWidth={820} maxHeight={300} extra={[[0, 3], [0, -3]]}>
          {() => (
            <g>
              <path d={path} fill="none" stroke="var(--c-accent2)" strokeWidth={3} strokeLinejoin="round" />
              {ild.pts.map((p, i) => (
                <circle key={i} cx={t.x(p.x)} cy={t.y(0) - p.y * scale * amp} r={2.5} fill="var(--c-accent2)" data-tip={`x = ${fmt(p.x, 3)}, ordinate = ${fmt(p.y, 4)}`} />
              ))}
            </g>
          )}
        </StructureView>
      </div>
      <div className="text-sm">
        <b>{what}.</b> The rest of the beam follows as rigid bodies (it is determinate, so it can only move as straight pieces, pivoting at supports and hinges). That deflected shape <i>is</i> the influence line for {fn.label}.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- moving unit load
function MovingLoad() {
  const m = useMemo(() => beamOf('A:0:pin S:10 B:24:roller C:32'), [])
  const [fnK, setFnK] = useState<'M' | 'V' | 'R'>('M')
  const resp: Response = fnK === 'M' ? { kind: 'moment', member: 'SB', x: 0 } : fnK === 'V' ? { kind: 'shear', member: 'SB', x: 0, side: 1 } : { kind: 'reaction', node: 'B', comp: 'y' }
  const ild = useMemo(() => influenceLine(m, { kind: 'members', members: pathOf(m) }, resp), [m, fnK])
  const [x, setX] = useState(4)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (!play) return
    const id = setInterval(() => setX((v) => (v >= 32 ? 0 : +(v + 0.25).toFixed(2))), 40)
    return () => clearInterval(id)
  }, [play])
  const t = makeTransform(m.nodes.map((n) => [n.x, n.y]), 820, 300, 70)
  const loadM: Model = { ...m, loads: [] }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Seg value={fnK} onChange={setFnK} items={[{ v: 'M', label: 'M at S' }, { v: 'V', label: 'V at S' }, { v: 'R', label: 'R_B' }]} />
        <button className="btn ml-auto" onClick={() => setPlay(!play)}>
          {play ? '❚❚ pause' : '▶ play'}
        </button>
      </div>
      <Slider label="Unit load at x" value={x} min={0} max={32} step={0.25} onChange={setX} unit="′" />
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={loadM} showLoads={false} autoDimX maxWidth={820} maxHeight={300}>
          {(tt) => (
            <g>
              <line x1={tt.x(x)} y1={tt.y(0) - 50} x2={tt.x(x)} y2={tt.y(0) - 6} stroke="var(--c-load)" strokeWidth={2.5} markerEnd="url(#arw)" />
              <text x={tt.x(x)} y={tt.y(0) - 56} textAnchor="middle" fontSize={12} fill="var(--c-load)" fontWeight={700}>
                1
              </text>
            </g>
          )}
        </StructureView>
        <ILDChart ild={ild} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} marker={x} title={`Value with the unit load at x = ${x}: ${fmt(ildAt(ild, x, 1), 3)}`} labelXs={[0, 10, 24, 32]} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- max effect explorer
function MaxExplorer() {
  const m = useMemo(() => beamOf('A:0 B:8:pin S:20 C:32:roller D:40'), [])
  const [w, setW] = useState(3)
  const [P, setP] = useState(30)
  const [wd, setWd] = useState(1)
  const [fn, setFn] = useState<'M' | 'V'>('M')
  const ild = useMemo(() => influenceLine(m, { kind: 'members', members: pathOf(m) }, fn === 'M' ? { kind: 'moment', member: 'SC', x: 0 } : { kind: 'shear', member: 'SC', x: 0, side: 1 }), [m, fn])
  const r = uniformPlusConcentrated(ild, w, P, wd)
  const t = makeTransform(m.nodes.map((n) => [n.x, n.y]), 820, 300, 70)
  return (
    <div className="space-y-2">
      <Seg value={fn} onChange={setFn} items={[{ v: 'M', label: 'Moment at S' }, { v: 'V', label: 'Shear at S' }]} />
      <div className="grid cq-md:grid-cols-3 gap-x-4">
        <Slider label="moving w" value={w} min={0} max={6} step={0.5} onChange={setW} unit=" k/ft" />
        <Slider label="roving P" value={P} min={0} max={60} step={5} onChange={setP} unit=" k" />
        <Slider label="dead w_d" value={wd} min={0} max={4} step={0.5} onChange={setWd} unit=" k/ft" />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={m} showLoads={false} autoDimX maxWidth={820} maxHeight={300} />
        <ILDChart ild={ild} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} title="Green = where to put the live load for max (+), red for max (−)" labelXs={ild.pts.map((p) => p.x)} />
      </div>
      <MaxEffect ild={ild} w={w} P={P} wd={wd} label={fn === 'M' ? 'Moment at S (k-ft)' : 'Shear at S (k)'} />
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="What an influence line is" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="ild" /></div>}>
        <Md>{`An **influence line** for a function (a reaction, the shear or moment at one fixed section) is a graph whose **ordinate at x = value of that function when a unit load stands at x**. Don't confuse it with a BMD: the BMD shows the moment *everywhere* for *one* load case; an ILD shows the moment at *one* point for a load *anywhere*.

For **statically determinate** structures every ILD is made of **straight lines**, with kinks only at supports, hinges and the section (shear jumps by 1 at the section).`}</Md>
        <div className="grid cq-md:grid-cols-3 gap-3 mt-2 text-sm">
          <div className="card p-3">
            <b>Reaction R_A (simple span)</b>
            <br />1 at A → 0 at B; extends linearly over overhangs.
          </div>
          <div className="card p-3">
            <b>Shear at a section a from A</b>
            <br />−a/L just left, +(L−a)/L just right; two parallel lines.
          </div>
          <div className="card p-3">
            <b>Moment at a section</b>
            <br />Triangle with peak a(L−a)/L at the section.
          </div>
        </div>
      </Section>
      <Section title="Using ILDs for maximum effects">
        <Tex block>{`\\text{concentrated } P: \\ P\\cdot y,\\qquad \\text{uniform } w \\text{ over a region: } w\\cdot(\\text{area under the ILD there})`}</Tex>
        <Md>{`- **Max positive**: moving uniform load on *all* positive regions + roving concentrated load at the **max positive ordinate**.
- **Max negative**: the same on the negative regions.
- **Dead load** acts everywhere: $w_d \\times$ (net area) — add it to both.`}</Md>
        <Callout kind="exam">Classic BUET combo: “self weight 2 k/ft, moving uniform 5 k/ft, roving concentrated 60 kip — find max shear and moment at E”. Also Müller-Breslau with fixed end + internal hinge (2023-24) and ILDs on frames (older papers).</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Two ways to draw any ILD">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold mb-1">1 · Statical (equilibrium) method</div>
            <Steps>
              <Step n={1} title="Place a unit load at x">Split into regions (left of section / right; each span of a Gerber beam).</Step>
              <Step n={2} title="Write the function as f(x)">Use reactions as functions of x, then shear/moment from a free body on the side away from the load.</Step>
              <Step n={3} title="Plot the straight pieces">Evaluate at region ends, join with straight lines.</Step>
            </Steps>
          </div>
          <div>
            <div className="font-bold mb-1">2 · Müller-Breslau (qualitative → quantitative)</div>
            <Steps>
              <Step n={1} title="Release the restraint">Reaction → remove support; moment → insert a hinge; shear → insert a slider.</Step>
              <Step n={2} title="Apply a unit displacement in the positive sense">The released structure moves as rigid pieces pivoting at supports and hinges.</Step>
              <Step n={3} title="Scale with geometry">Use similar triangles: e.g. moment at a section a from A on span L → peak a(L−a)/L.</Step>
            </Steps>
          </div>
        </div>
      </Section>
      <Section title="Müller-Breslau, animated" sub="Pick a function and watch the released beam deflect into its influence line">
        <MullerBreslau />
      </Section>
      <Section title="A moving unit load traces the ILD">
        <MovingLoad />
      </Section>
      <Section title="Max effects of uniform + roving loads">
        <MaxExplorer />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Beam playground" sub="Build any beam — supports and hinges wherever you like — then drag the load and the section S. SFD, BMD and the influence lines at S all update live.">
        <BeamPlayground />
      </Section>
      <Section title="Guess the shape" sub="Random determinate beam, random function. Shape it, check it — repeat until it's instant.">
        <GuessGame />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const ownI = (id: string, level: PYQ['level'], title: string, text: string, spec: string, items: { label: string; resp: Response }[], max?: { w: number; P: number; wd?: number; item: number; sign: 'pos' | 'neg' | 'mag' }): PYQ => {
  const m = beamOf(spec)
  const path = { kind: 'members' as const, members: pathOf(m) }
  const ild = (k: number) => influenceLine(m, path, items[k].resp)
  return {
    id: `own-ild-${id}`,
    paper: 'own',
    level,
    sec: 'B',
    no: id,
    marks: 0,
    topics: ['ild'],
    title,
    text,
    pages: [],
    figure: () => <StructureView model={m} showLoads={false} autoDimX maxHeight={220} />,
    checks: () => {
      const out: Check[] = items.map((it, k) => {
        const d = ild(k)
        const ex = d.pts.reduce((a, b) => (Math.abs(b.y) > Math.abs(a.y) ? b : a))
        return { key: `k${k}`, label: `${it.label}: largest ordinate (with sign)`, value: ex.y }
      })
      if (max) {
        const r = uniformPlusConcentrated(ild(max.item), max.w, max.P, max.wd ?? 0)
        const name = items[max.item].label
        if (max.sign === 'mag') out.push({ key: 'max', label: `Largest ${name} (magnitude)`, value: Math.max(Math.abs(r.maxPos.total), Math.abs(r.maxNeg.total)), magnitude: true })
        else out.push({ key: 'max', label: `Max ${max.sign === 'pos' ? 'positive' : 'negative'} ${name}`, value: max.sign === 'pos' ? r.maxPos.total : r.maxNeg.total })
      }
      return out
    },
    solution: () => (
      <div className="space-y-3">
        <ILDStack model={m} path={path} items={items} />
        {max && <MaxEffect ild={ild(max.item)} w={max.w} P={max.P} wd={max.wd} label={items[max.item].label} />}
      </div>
    ),
  }
}

const problems: PYQ[] = [
  ownI('1', 'warm-up', 'Overhanging beam', 'Draw ILDs for R_B, shear at S and moment at S. Then find the max positive moment at S for a moving 4 k/ft + roving 25 k.', 'A:0 B:6:pin S:16 C:30:roller D:36', [
    { label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } },
    { label: 'V_S', resp: { kind: 'shear', member: 'SC', x: 0, side: 1 } },
    { label: 'M_S', resp: { kind: 'moment', member: 'SC', x: 0 } },
  ], { w: 4, P: 25, item: 2, sign: 'pos' }),
  ownI('2', 'exam', 'Gerber beam: reactions and hinge shear', 'Beam A (pin) – B (roller, 20 ft) – C (hinge, 26 ft) – D (roller, 40 ft). Draw ILDs for R_B, R_D, shear at C and moment at B.', 'A:0:pin B:20:roller C*:26 D:40:roller', [
    { label: 'R_B', resp: { kind: 'reaction', node: 'B', comp: 'y' } },
    { label: 'R_D', resp: { kind: 'reaction', node: 'D', comp: 'y' } },
    { label: 'V_C', resp: { kind: 'shear', member: 'CD', x: 0, side: 1 } },
    { label: 'M_B', resp: { kind: 'moment', member: 'BC', x: 0 } },
  ]),
  ownI('3', 'exam', 'Fixed end + hinge (Müller-Breslau)', 'A fixed, hinge at C (14 ft), roller D (34 ft); section E at 24 ft. Draw ILDs for M_A, V_E and M_E; find the largest fixed-end moment M_A (reaction, magnitude) for dead 2 k/ft + moving 3 k/ft + roving 40 k.', 'A:0:fixed B:7 C*:14 E:24 D:34:roller', [
    { label: 'M_A', resp: { kind: 'reaction', node: 'A', comp: 'm' } },
    { label: 'V_E', resp: { kind: 'shear', member: 'ED', x: 0, side: 1 } },
    { label: 'M_E', resp: { kind: 'moment', member: 'ED', x: 0 } },
  ], { w: 3, P: 40, wd: 2, item: 0, sign: 'mag' }),
  ownI('4', 'challenge', 'Two hinges', 'A (pin) – B (roller 12) – C hinge (16) – S (22) – D (roller 28) – E hinge (32) – F (roller 44). ILDs for R_D, V_S, M_S, M_D.', 'A:0:pin B:12:roller C*:16 S:22 D:28:roller E*:32 F:44:roller', [
    { label: 'R_D', resp: { kind: 'reaction', node: 'D', comp: 'y' } },
    { label: 'V_S', resp: { kind: 'shear', member: 'SD', x: 0, side: 1 } },
    { label: 'M_S', resp: { kind: 'moment', member: 'SD', x: 0 } },
    { label: 'M_D', resp: { kind: 'moment', member: 'DE', x: 0 } },
  ]),
]

void ([] as ILD[])
const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
