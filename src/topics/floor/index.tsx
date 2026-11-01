import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { checkILD, ILDChart, ILDEditor, type Handle } from '../../components/ILDChart'
import { makeTransform, StructureView, type Dim } from '../../components/StructureView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../components/ui'
import { ildAt, influenceLine, type ILD, type Response } from '../../engine/ild'
import type { Model } from '../../engine/model'
import { uniformPlusConcentrated } from '../../engine/moving'
import { beamOf, floorSystem } from '../../kit/builders'
import { ILDStack, MaxEffect } from '../../kit/solutions'
import { pick, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import { buildTruss, heightDims, TRUSS_NAMES, type TrussType } from '../../labs/trusses'
import type { PYQ } from '../../pyq/types'
import { useStore } from '../../store'
import type { TopicModule } from '../modules'
import { FloorPlayground } from './FloorPlayground'

// ---------------------------------------------------------------- load path animation
function LoadPath() {
  const d = 10
  const n = 4
  const xs = Array.from({ length: n + 1 }, (_, k) => k * d)
  const [x, setX] = useState(14)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (!play) return
    const id = setInterval(() => setX((v) => (v >= 40 ? 0 : +(v + 0.25).toFixed(2))), 40)
    return () => clearInterval(id)
  }, [play])
  const fs = useMemo(() => floorSystem({ floorBeams: xs, stringers: [[0, 10], [10, 20], [20, 30], [30, 40]], supports: [{ x: 0, type: 'pin' }, { x: 40, type: 'roller' }], names: { 0: 'A', 10: 'B', 20: 'C', 30: 'D', 40: 'E' }, rise: 4 }), [])
  const girder = useMemo(() => beamOf('A:0:pin B:10 S:15 C:20 D:30 E:40:roller'), [])
  const direct = useMemo(() => influenceLine(girder, { kind: 'members', members: girder.members.map((m) => m.id) }, { kind: 'moment', member: 'SC', x: 0 }), [girder])
  const panel = useMemo(() => influenceLine(fs.model, fs.path, fs.moment(15)), [fs])
  const k = Math.min(n - 1, Math.floor(x / d))
  const left = (xs[k + 1] - x) / d
  const right = 1 - left
  const t = makeTransform(fs.model.nodes.map((q) => [q.x, q.y]), 820, 300, 70)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Slider label="Unit load on the deck at x" value={x} min={0} max={40} step={0.25} onChange={setX} unit="′" />
        </div>
        <button className="btn" onClick={() => setPlay(!play)}>
          {play ? '❚❚ pause' : '▶ play'}
        </button>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={fs.model} showLoads={false} autoDimX={xs} maxWidth={820} maxHeight={300}>
          {(tt) => (
            <g>
              <line x1={tt.x(x)} y1={tt.y(4) - 52} x2={tt.x(x)} y2={tt.y(4) - 6} stroke="var(--c-load)" strokeWidth={2.5} markerEnd="url(#arw)" />
              <text x={tt.x(x)} y={tt.y(4) - 58} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--c-load)">
                1
              </text>
              {[
                [xs[k], left],
                [xs[k + 1], right],
              ].map(([px, v], i) =>
                v > 0.01 ? (
                  <g key={i}>
                    <line x1={tt.x(px)} y1={tt.y(4) + 6} x2={tt.x(px)} y2={tt.y(4) + 6 + 40 * v} stroke="var(--c-accent2)" strokeWidth={3} markerEnd="url(#arw)" />
                    <text x={tt.x(px) + 8} y={tt.y(4) + 24} fontSize={12} fill="var(--c-accent2)" fontWeight={700} className="num">
                      {fmt(v, 2)}
                    </text>
                  </g>
                ) : null,
              )}
            </g>
          )}
        </StructureView>
        <ILDChart ild={panel} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} marker={x} title="Girder moment at S (mid-panel B–C): solid = with floor beams, dashed = if the load sat directly on the girder" labelXs={[10, 15, 20]}>
          {({ X, Y }) => <path d={direct.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x)},${Y(p.y)}`).join(' ')} fill="none" stroke="var(--c-faint)" strokeDasharray="5 4" strokeWidth={1.6} />}
        </ILDChart>
      </div>
      <div className="text-sm text-mute">
        The stringer is a simple beam between floor beams, so it splits the load <b className="text-ink">{fmt(left, 2)}</b> / <b className="text-ink">{fmt(right, 2)}</b> onto the two floor beams. The girder only feels loads at panel points → its ILD is the direct ILD with every panel “straightened”.
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- guess: floor system ILD
function genFloor(seed: number) {
  const r = rng(seed)
  const n = pick(r, [4, 5, 6])
  const d = pick(r, [8, 10, 12, 15, 20])
  const xs = Array.from({ length: n + 1 }, (_, k) => k * d)
  const names: Record<number, string> = {}
  xs.forEach((x, k) => (names[x] = String.fromCharCode(65 + k)))
  // optionally overhang the girder support inward by one panel
  const leftSup = pick(r, [0, 0, d])
  const fs = floorSystem({ floorBeams: xs, stringers: xs.slice(0, -1).map((x, k) => [x, xs[k + 1]] as [number, number]), supports: [{ x: leftSup, type: 'pin' }, { x: xs[n], type: 'roller' }], names })
  const kk = 1 + Math.floor(r() * (n - 1))
  const options: { label: string; resp: Response }[] = [
    { label: `Floor-beam reaction FBR_${names[xs[kk]]}`, resp: fs.fbr(xs[kk]) },
    { label: `Panel shear V_${names[xs[kk - 1]]}${names[xs[kk]]}`, resp: fs.shear((xs[kk - 1] + xs[kk]) / 2) },
    { label: `Moment at panel point ${names[xs[kk]]}`, resp: fs.moment(xs[kk]) },
    { label: `Girder reaction at ${names[xs[n]]}`, resp: fs.reaction(xs[n]) },
  ]
  const o = pick(r, options)
  return { fs, xs, label: o.label, truth: influenceLine(fs.model, fs.path, o.resp) }
}

function genTrussILD(seed: number) {
  const r = rng(seed)
  const type = pick(r, ['pratt', 'howe', 'warren', 'parker'] as TrussType[])
  const n = pick(r, [4, 6])
  const t = buildTruss({ type, n, w: pick(r, [12, 15, 20]), h: pick(r, [12, 15, 20]), loads: [] })
  const mem = pick(r, t.model.members.filter((m) => !(m.i === 'L0' && m.j === 'L1')))
  const nodes = Array.from({ length: n + 1 }, (_, k) => `L${k}`)
  const truth = influenceLine(t.model, { kind: 'panel', nodes }, { kind: 'force', member: mem.id })
  return { model: t.model, nodes, label: `Force in ${mem.id} (${TRUSS_NAMES[type]}, load on bottom chord)`, truth, mem: mem.id }
}

function GuessPanel({ kind }: { kind: 'floor' | 'truss' }) {
  const { seed, next } = useSeed(kind === 'floor' ? 31 : 41)
  const g = useMemo(() => {
    if (kind === 'floor') {
      const f = genFloor(seed)
      return { model: f.fs.model as Model, label: f.label, truth: f.truth, xs: f.xs, highlight: undefined as string | undefined, dims: undefined as Dim[] | undefined }
    }
    const tr = genTrussILD(seed)
    return { model: tr.model, label: tr.label, truth: tr.truth, xs: tr.model.nodes.filter((q) => q.id.startsWith('L')).map((q) => q.x), highlight: tr.mem, dims: heightDims(tr.model) }
  }, [seed, kind])
  const handles: Handle[] = useMemo(() => {
    const out: Handle[] = []
    for (const x of g.xs) {
      const jump = Math.abs(ildAt(g.truth, x, -1) - ildAt(g.truth, x, 1)) > 1e-9
      if (jump) out.push({ x, side: -1 }, { x, side: 1 })
      else out.push({ x })
    }
    return out
  }, [g])
  const [values, setValues] = useState<number[]>([])
  const [results, setResults] = useState<boolean[] | null>(null)
  const [revealed, setRevealed] = useState(false)
  const record = useStore((s) => s.record)
  useEffect(() => {
    setValues(handles.map(() => 0))
    setResults(null)
    setRevealed(false)
  }, [handles])
  const t = makeTransform(g.model.nodes.map((q) => [q.x, q.y]), 820, 300, 70)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="font-bold">
          Draw: <span className="text-accent">{g.label}</span>
        </div>
        <button className="btn ml-auto" onClick={next}>
          ↻ New
        </button>
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={g.model} showLoads={false} autoDimX={g.xs} dims={g.dims} maxWidth={820} maxHeight={300} memberColor={g.highlight ? { [g.highlight]: 'var(--c-load)' } : undefined} />
        <ILDEditor truth={g.truth} handles={handles} values={values} setValues={setValues} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} revealed={revealed} results={results} />
      </div>
      <div className="flex gap-2 items-center text-sm">
        <span className="text-mute">Ordinates at the panel points only — straight lines between them.</span>
        <button
          className="btn btn-primary ml-auto"
          onClick={() => {
            const c = checkILD(g.truth, handles, values)
            setResults(c.details.map((d) => d.ok))
            record(`floor:guess:${kind}:${seed}`, c.ok)
          }}
        >
          Check
        </button>
        <button className="btn" onClick={() => setRevealed(!revealed)}>
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      </div>
      {results && <div className={'text-sm font-semibold ' + (results.every(Boolean) ? 'text-good' : 'text-bad')}>{results.every(Boolean) ? '✓ Correct!' : `${results.filter(Boolean).length}/${results.length} ordinates right.`}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- counters
function Counters() {
  const [wd, setWd] = useState(2)
  const [wl, setWl] = useState(3)
  const [P, setP] = useState(50)
  const t = useMemo(() => buildTruss({ type: 'pratt', n: 6, w: 20, h: 25, loads: [] }), [])
  const nodes = Array.from({ length: 7 }, (_, k) => `L${k}`)
  const diags = ['U1L2', 'U2L3', 'L3U4', 'L4U5']
  const rows = diags.map((id) => {
    const ild = influenceLine(t.model, { kind: 'panel', nodes }, { kind: 'force', member: id })
    const r = uniformPlusConcentrated(ild, wl, P, wd)
    return { id, maxT: r.maxPos.total, maxC: r.maxNeg.total }
  })
  return (
    <div className="space-y-2">
      <div className="grid cq-md:grid-cols-3 gap-x-4">
        <Slider label="dead w_d" value={wd} min={0} max={5} step={0.5} onChange={setWd} unit=" k/ft" />
        <Slider label="moving w" value={wl} min={0} max={6} step={0.5} onChange={setWl} unit=" k/ft" />
        <Slider label="roving P" value={P} min={0} max={100} step={5} onChange={setP} unit=" k" />
      </div>
      <div className="grid cq-lg:grid-cols-[1.3fr_1fr] gap-3">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView model={t.model} showLoads={false} autoDimX maxHeight={240} memberColor={Object.fromEntries(rows.map((r) => [r.id, r.maxC < 0 ? 'var(--c-bad)' : 'var(--c-good)']))} />
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Diagonal (Pratt: should be in tension)</th>
              <th>max T</th>
              <th>max C</th>
              <th>Counter?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="txt">{r.id}</td>
                <td>{fmt(r.maxT)}</td>
                <td>{fmt(r.maxC)}</td>
                <td className="txt">{r.maxC < 0 ? <b className="text-bad whitespace-nowrap">yes · ≈{fmt(-r.maxC, 1)} k</b> : 'no'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout kind="note">A Pratt diagonal is designed as a slender tension member. If DL + LL can put it in compression, a <b>counter</b> (the opposite diagonal of that panel) is added; with slender diagonals only one acts at a time, so the counter's force ≈ the compression the main diagonal would have had, adjusted for its own inclination (same here because panels are equal).</Callout>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Floor systems" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="floor" /></div>}>
        <Md>{`Bridges and many buildings carry the deck on **stringers**, which sit on **floor beams**, which bring the load to the **girders** (or truss panel points). The girder (or truss) is loaded **only at the panel points**, so:
- every girder/truss ILD is **straight between panel points**;
- ordinate at a panel point = the ordinate of the ordinary (direct-loading) ILD there;
- the **floor-beam reaction** ILD is a triangle: 1 at that floor beam, 0 at the neighbouring floor beams (longer if stringers overhang);
- **panel shear** (shear anywhere between two floor beams) is constant across the panel.`}</Md>
      </Section>
      <Section title="Trusses are the same idea">
        <Md>{`For a bridge truss the unit load travels on the floor and reaches the truss at the loaded-chord joints. Draw the ILD by placing the unit load at each panel point and solving the truss (usually by one section), then join with straight lines.
- **Chord members**: moment centre at a joint → ILD looks like the moment ILD at that joint ÷ truss depth.
- **Diagonals / verticals between parallel chords**: proportional to the **panel shear** ILD.
- **Counters**: if dead + live load can reverse a diagonal, a counter diagonal is needed in that panel.`}</Md>
        <Callout kind="exam">2023-24: floor beams with overhanging stringers (FBR, panel shears, moments, max values) + truss ILD with max forces. 2021-22: floor beams + truss ILD with floor beams over the bottom chord. Older papers: counters in Pratt trusses under DL + moving UDL + roving load.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Mark the panel points">Where the floor beams are. Check the stringer breaks and overhangs.</Step>
          <Step n={2} title="Unit load at each panel point">The girder is a simple (or overhanging) beam with that single load → ordinate of the asked function.</Step>
          <Step n={3} title="Join with straight lines">Between panel points; extend over stringer overhangs.</Step>
          <Step n={4} title="Max effects">Uniform live load on the + (or −) area, concentrated load at the peak; dead load over everything.</Step>
        </Steps>
        <Tex block>{`\\text{Panel shear in panel } k\\text{ of an } n\\text{-panel span (load at panel point } j):\\ V = \\begin{cases}-\\tfrac{j}{n} & j \\le k-1\\\\ 1-\\tfrac{j}{n} & j \\ge k\\end{cases}`}</Tex>
      </Section>
      <Section title="Follow the load path" sub="See how the stringer splits a moving load onto two floor beams — and why the girder ILD gets straightened">
        <LoadPath />
      </Section>
      <Section title="When are counters needed?">
        <Counters />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Floor system playground" sub="Build the girder, place the floor beams, then drag the load along the deck. Watch the stringers hand it to the floor beams, and the girder diagrams and ILDs update live.">
        <FloorPlayground />
      </Section>
      <Section title="Floor system ILD — guess at the panel points">
        <GuessPanel kind="floor" />
      </Section>
      <Section title="Truss member ILD — guess at the panel points">
        <GuessPanel kind="truss" />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
function floorProblem(id: string, level: PYQ['level'], title: string, text: string, fs: ReturnType<typeof floorSystem>, items: { label: string; resp: Response }[], max?: { item: number; w: number; P: number; wd?: number; sign: 'pos' | 'neg' }): PYQ {
  const ild = (k: number): ILD => influenceLine(fs.model, fs.path, items[k].resp)
  return {
    id: `own-floor-${id}`,
    paper: 'own',
    level,
    sec: 'B',
    no: id,
    marks: 0,
    topics: ['floor'],
    title,
    text,
    pages: [],
    figure: () => <StructureView model={fs.model} showLoads={false} autoDimX={fs.xs} maxHeight={220} />,
    checks: () => {
      const out = items.map((it, k) => ({ key: `p${k}`, label: `${it.label}: peak ordinate (largest magnitude, with sign)`, value: ild(k).pts.reduce((a, b) => (Math.abs(b.y) > Math.abs(a.y) ? b : a)).y }))
      if (max) {
        const r = uniformPlusConcentrated(ild(max.item), max.w, max.P, max.wd ?? 0)
        out.push({ key: 'max', label: `Max ${max.sign === 'pos' ? 'positive' : 'negative'} ${items[max.item].label}`, value: max.sign === 'pos' ? r.maxPos.total : r.maxNeg.total })
      }
      return out
    },
    solution: () => (
      <div className="space-y-3">
        <ILDStack model={fs.model} path={fs.path} items={items} />
        {max && <MaxEffect ild={ild(max.item)} w={max.w} P={max.P} wd={max.wd} label={items[max.item].label} />}
      </div>
    ),
  }
}

const fs1 = floorSystem({ floorBeams: [0, 12, 24, 36, 48], stringers: [[0, 12], [12, 24], [24, 36], [36, 48]], supports: [{ x: 0, type: 'pin' }, { x: 48, type: 'roller' }], names: { 0: 'A', 12: 'B', 24: 'C', 36: 'D', 48: 'E' } })
const fs2 = floorSystem({ floorBeams: [0, 10, 20, 30, 40, 50], stringers: [[0, 10], [10, 20], [20, 30], [30, 40], [40, 50]], supports: [{ x: 10, type: 'pin' }, { x: 50, type: 'roller' }], names: { 0: 'A', 10: 'B', 20: 'C', 30: 'D', 40: 'E', 50: 'F' } })
const fs3 = floorSystem({ floorBeams: [0, 10, 25, 35], stringers: [[0, 18], [18, 45]], supports: [{ x: 0, type: 'pin' }, { x: 35, type: 'roller' }], names: { 0: 'A', 10: 'B', 18: 'G', 25: 'C', 35: 'D' } })
const ownTr = buildTruss({ type: 'howe', n: 6, w: 20, h: 24, loads: [] }).model
const trussProblem: PYQ = {
  id: 'own-floor-4',
  paper: 'own',
  level: 'exam',
  sec: 'B',
  no: '4',
  marks: 0,
  topics: ['floor'],
  title: 'Howe truss ILDs and max forces',
  text: 'Six-panel Howe truss (20 ft panels, 24 ft deep), load on the bottom chord. Draw ILDs for U2U3, L2L3, L2U3 and L2U2; find the max tension and compression in L2U3 for a moving 4 k/ft + roving 30 k.',
  pages: [],
  figure: () => <StructureView model={ownTr} showLoads={false} autoDimX maxHeight={240} />,
  checks: () => {
    const ild = influenceLine(ownTr, { kind: 'panel', nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'] }, { kind: 'force', member: 'L2U3' })
    const r = uniformPlusConcentrated(ild, 4, 30)
    return [
      { key: 't', label: 'Max tension in L2U3', value: r.maxPos.live, unit: 'k' },
      { key: 'c', label: 'Max compression in L2U3 (negative)', value: r.maxNeg.live, unit: 'k' },
    ]
  },
  solution: () => {
    const path = { kind: 'panel' as const, nodes: ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'] }
    return (
      <div className="space-y-3">
        <ILDStack model={ownTr} path={path} items={['U2U3', 'L2L3', 'L2U3', 'L2U2'].filter((id) => ownTr.members.some((m) => m.id === id)).map((id) => ({ label: id, resp: { kind: 'force' as const, member: id } }))} />
        <MaxEffect ild={influenceLine(ownTr, path, { kind: 'force', member: 'L2U3' })} w={4} P={30} label="L2U3" />
      </div>
    )
  },
}

const problems: PYQ[] = [
  floorProblem('1', 'warm-up', 'Four-panel girder', 'Girder A–E (4 panels × 12 ft) with simply supported stringers. Draw ILDs for FBR_B, panel shear V_BC and moment at C.', fs1, [
    { label: 'FBR_B', resp: fs1.fbr(12) },
    { label: 'V_BC', resp: fs1.shear(18) },
    { label: 'M_C', resp: fs1.moment(24) },
  ]),
  floorProblem('2', 'exam', 'Girder with an overhanging panel', 'Girder supported at B and F; the first panel A–B overhangs. Draw ILDs for R_B, V_CD, M_C and M_B, then the max negative moment at B for dead 1.5 k/ft + moving 3 k/ft + roving 40 k.', fs2, [
    { label: 'R_B', resp: fs2.reaction(10) },
    { label: 'V_CD', resp: fs2.shear(25) },
    { label: 'M_C', resp: fs2.moment(20) },
    { label: 'M_B', resp: fs2.moment(10) },
  ], { item: 3, w: 3, P: 40, wd: 1.5, sign: 'neg' }),
  floorProblem('3', 'challenge', 'Overhanging stringers (2023-24 style)', 'Floor beams at A(0), B(10), C(25), D(35); stringer 1 spans 0–18 on A, B; stringer 2 spans 18–45 on C, D. Girder supported at A and D. Draw FBR_B, FBR_C, V_BC, M_G (G at x = 18); find the max positive M_G for moving 5 k/ft + roving 20 k.', fs3, [
    { label: 'FBR_B', resp: fs3.fbr(10) },
    { label: 'FBR_C', resp: fs3.fbr(25) },
    { label: 'V_BC', resp: fs3.shear(15) },
    { label: 'M_G', resp: fs3.moment(18) },
  ], { item: 3, w: 5, P: 20, sign: 'pos' }),
  trussProblem,
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
