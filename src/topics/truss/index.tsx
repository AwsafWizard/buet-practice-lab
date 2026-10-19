import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { StructureView } from '../../components/StructureView'
import { Callout, isClose, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { xBraced } from '../../engine/approx'
import { solve } from '../../engine/frame2d'
import type { Model } from '../../engine/model'
import { P, truss } from '../../kit/builders'
import { TrussSolution, trussForces } from '../../kit/solutions'
import { pick, randInt, rng, Slider, TopicFrequency, useSeed } from '../../labs/common'
import { buildTruss, cutMembers, intersect, TRUSS_NAMES, zeroForceByRules, type TrussType } from '../../labs/trusses'
import type { PYQ } from '../../pyq/types'
import { useStore } from '../../store'
import type { TopicModule } from '../modules'

const TYPES: TrussType[] = ['pratt', 'howe', 'warren', 'parker', 'roof', 'xbraced']

function genTruss(seed: number, type: TrussType) {
  const r = rng(seed)
  const n = pick(r, [4, 6])
  const w = pick(r, [10, 12, 15, 20])
  const h = pick(r, [10, 12, 15, 16, 20])
  const loads = Array.from({ length: n - 1 }, () => (r() < 0.75 ? randInt(r, 10, 40, 5) : 0))
  if (loads.every((x) => !x)) loads[1] = 20
  return { ...buildTruss({ type, n, w, h, loads }), n, w, h }
}

// ---------------------------------------------------------------- click-the-member game
function MemberGame() {
  const [type, setType] = useState<TrussType>('pratt')
  const { seed, next } = useSeed(3)
  const t = useMemo(() => genTruss(seed, type), [seed, type])
  const forces = useMemo(() => {
    if (type === 'xbraced') return xBraced(t.model, t.pairs, 'both').forces
    return trussForces(t.model).f
  }, [t, type])
  const [sel, setSel] = useState<string | null>(null)
  const [state, setState] = useState<Record<string, 'ok' | 'bad'>>({})
  const [reveal, setReveal] = useState(false)
  const [mag, setMag] = useState('')
  const [tc, setTc] = useState<'T' | 'C' | 'Z' | null>(null)
  const record = useStore((s) => s.record)
  const reset = () => {
    setState({})
    setSel(null)
    setReveal(false)
    setMag('')
    setTc(null)
  }
  const check = () => {
    if (!sel) return
    const v = forces.get(sel) ?? 0
    const g = parseFloat(mag)
    let ok: boolean
    if (Math.abs(v) < 1e-6) ok = tc === 'Z' || (Number.isFinite(g) && Math.abs(g) < 0.05)
    else ok = Number.isFinite(g) && isClose(Math.abs(g), Math.abs(v), 0.02, 0.05) && tc === (v > 0 ? 'T' : 'C')
    setState({ ...state, [sel]: ok ? 'ok' : 'bad' })
    record(`truss:game:${seed}:${type}:${sel}`, ok)
  }
  const color: Record<string, string> = {}
  const labels: Record<string, string> = {}
  for (const m of t.model.members) {
    const v = forces.get(m.id) ?? 0
    if (reveal) {
      color[m.id] = Math.abs(v) < 1e-6 ? 'var(--c-faint)' : v > 0 ? 'var(--c-tension)' : 'var(--c-comp)'
      labels[m.id] = Math.abs(v) < 1e-6 ? '0' : `${fmt(Math.abs(v), 1)}${v > 0 ? 'T' : 'C'}`
    } else if (state[m.id]) color[m.id] = state[m.id] === 'ok' ? 'var(--c-good)' : 'var(--c-bad)'
  }
  const nOk = Object.values(state).filter((x) => x === 'ok').length
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {TYPES.map((x) => (
          <button
            key={x}
            className={'btn !py-1 !text-xs ' + (x === type ? '!border-accent text-accent' : '')}
            onClick={() => {
              setType(x)
              reset()
            }}
          >
            {TRUSS_NAMES[x]}
          </button>
        ))}
        <button
          className="btn !py-1 ml-auto"
          onClick={() => {
            next()
            reset()
          }}
        >
          ↻ New loads/geometry
        </button>
      </div>
      {type === 'xbraced' && <div className="text-xs text-mute">Indeterminate: assume the two diagonals of each panel share the panel shear equally (both take T and C).</div>}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-3 items-start">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView
            model={t.model}
            autoDimX
            autoDimY={[0, t.h]}
            memberColor={color}
            memberLabels={reveal ? labels : undefined}
            selectedMember={sel}
            onMemberClick={(id) => {
              setSel(id)
              setMag('')
              setTc(null)
            }}
            maxHeight={300}
          />
          <div className="text-xs text-faint px-2">Click any member. Green = you got it, red = try again.</div>
        </div>
        <div className="card p-3 space-y-2">
          <div className="text-sm">
            Score: <b className="num text-good">{nOk}</b> / {t.model.members.length} members
          </div>
          {sel ? (
            <>
              <div className="font-bold">Member {sel}</div>
              <div className="flex gap-2 items-center">
                <input className="field w-28" placeholder="force (k)" value={mag} onChange={(e) => setMag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} />
                <span className="text-sm text-mute">k</span>
              </div>
              <div className="flex gap-1.5">
                {(['T', 'C', 'Z'] as const).map((x) => (
                  <button key={x} className={'btn !py-1 !text-xs ' + (tc === x ? '!border-accent text-accent' : '')} onClick={() => setTc(x)}>
                    {x === 'T' ? 'Tension' : x === 'C' ? 'Compression' : 'Zero-force'}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={check}>
                Check
              </button>
              {state[sel] === 'ok' && <div className="text-good font-bold pop">✓ correct</div>}
              {state[sel] === 'bad' && (
                <div className="text-bad text-sm pop">
                  ✗ not quite.{' '}
                  <button className="underline text-accent" onClick={() => setReveal(true)}>
                    reveal all
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-mute">Pick a member on the drawing. Tip: start with zero-force members and the joints at the supports.</div>
          )}
          <button className="btn w-full justify-center" onClick={() => setReveal(!reveal)}>
            {reveal ? 'Hide answers' : 'Reveal all forces'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- zero force hunt
function ZeroHunt() {
  const { seed, next } = useSeed(11)
  const t = useMemo(() => {
    const r = rng(seed)
    const type = pick(r, ['pratt', 'howe', 'warren', 'roof'] as TrussType[])
    const n = pick(r, [4, 6])
    const loads = Array.from({ length: n - 1 }, () => (r() < 0.45 ? randInt(r, 10, 30, 5) : 0))
    if (loads.every((x) => !x)) loads[0] = 20
    return buildTruss({ type, n, w: 12, h: 12, loads })
  }, [seed])
  const zero = useMemo(() => {
    const f = trussForces(t.model).f
    return new Set([...f.entries()].filter(([, v]) => Math.abs(v) < 1e-6).map(([k]) => k))
  }, [t])
  const byRule = useMemo(() => zeroForceByRules(t.model), [t])
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)
  const color: Record<string, string> = {}
  for (const m of t.model.members) {
    if (checked) color[m.id] = zero.has(m.id) ? (picked.has(m.id) ? 'var(--c-good)' : 'var(--c-load)') : picked.has(m.id) ? 'var(--c-bad)' : 'var(--c-member)'
    else if (picked.has(m.id)) color[m.id] = 'var(--c-accent)'
  }
  const correct = [...picked].filter((x) => zero.has(x)).length
  return (
    <div className="grid lg:grid-cols-[1.6fr_1fr] gap-3">
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView
          model={t.model}
          memberColor={color}
          onMemberClick={(id) => {
            if (checked) return
            const p = new Set(picked)
            if (p.has(id)) p.delete(id)
            else p.add(id)
            setPicked(p)
          }}
          maxHeight={260}
        />
      </div>
      <div className="space-y-2 text-sm">
        <div>Click every member you think carries <b>zero force</b> under these loads, then check.</div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setChecked(true)}>
            Check
          </button>
          <button
            className="btn"
            onClick={() => {
              next()
              setPicked(new Set())
              setChecked(false)
            }}
          >
            ↻ New truss
          </button>
        </div>
        {checked && (
          <div className="space-y-1">
            <div>
              You found <b className="text-good">{correct}</b> of {zero.size}; {[...picked].filter((x) => !zero.has(x)).length} wrong picks.
            </div>
            <div className="text-xs text-mute">
              Orange = missed. By the two joint rules alone you could spot: {[...byRule].join(', ') || 'none'}. Any others are zero only because of how this particular load pattern happens to balance.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- section cutter
function SectionCutter() {
  const t = useMemo(() => buildTruss({ type: 'pratt', n: 6, w: 15, h: 18, loads: [20, 30, 30, 30, 20] }), [])
  const [xc, setXc] = useState(37.5)
  const r = useMemo(() => solve(t.model), [t])
  const cut = cutMembers(t.model, xc)
  const left = new Set(t.model.members.filter((m) => cut.every((c) => c.id !== m.id)).filter((m) => {
    const nm = new Map(t.model.nodes.map((n) => [n.id, n]))
    return Math.max(nm.get(m.i)!.x, nm.get(m.j)!.x) <= xc
  }).map((m) => m.id))
  const dim = new Set(t.model.members.filter((m) => !left.has(m.id) && !cut.some((c) => c.id === m.id)).map((m) => m.id))
  const color: Record<string, string> = {}
  cut.forEach((c) => (color[c.id] = 'var(--c-load)'))
  const rows = cut.map((c) => {
    const others = cut.filter((o) => o.id !== c.id)
    const pt = others.length === 2 ? intersect(t.model, others[0], others[1]) : null
    const N = r.member(c.id).N(0.1)
    return { id: c.id, pt, N }
  })
  return (
    <div className="space-y-2">
      <Slider label="Cut at x =" value={xc} min={1} max={89} step={0.5} onChange={setXc} unit="′" />
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={t.model} memberColor={color} dimMembers={dim} autoDimX maxHeight={260}>
          {(tr) => (
            <g>
              <line x1={tr.x(xc)} x2={tr.x(xc)} y1={10} y2={tr.H - 10} stroke="var(--c-load)" strokeDasharray="6 4" strokeWidth={2} />
              {rows.map((row) =>
                row.pt ? <circle key={row.id} cx={tr.x(row.pt.x)} cy={tr.y(row.pt.y)} r={6} fill="none" stroke="var(--c-accent2)" strokeWidth={2} /> : null,
              )}
            </g>
          )}
        </StructureView>
      </div>
      <table className="tbl w-auto text-sm">
        <thead>
          <tr>
            <th>Cut member</th>
            <th>Equation that isolates it</th>
            <th>Force</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="txt font-semibold">{row.id}</td>
              <td className="txt">{row.pt ? `ΣM about the point (${fmt(row.pt.x)}, ${fmt(row.pt.y)}) where the other two cut members meet` : 'ΣFy = 0 (the other two cut members are parallel chords)'}</td>
              <td>
                {fmt(Math.abs(row.N))} {Math.abs(row.N) < 1e-6 ? '' : row.N > 0 ? 'T' : 'C'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-faint">{cut.length === 3 ? 'Three members cut → each one can be found with a single equation.' : `${cut.length} members cut — a single section can only find three unknowns; move the cut or combine with joints.`}</div>
    </div>
  )
}

// ---------------------------------------------------------------- X-braced explorer
function XBracedExplorer() {
  const [mode, setMode] = useState<'both' | 'tension'>('both')
  const t = useMemo(() => {
    const m = truss('A:0,0 B:12,0 C:24,0 D:36,0 E:0,16 F:12,16 G:24,16 H:36,16', 'A-B B-C C-D E-F F-G G-H A-E B-F C-G D-H AF=A-F BE=B-E BG=B-G CF=C-F CH=C-H DG=D-G', 'A:pin D:roller', [P('B', 16), P('F', 8), P('G', 48), { kind: 'node', node: 'H', fy: -12 }])
    return { m, pairs: [['AF', 'BE'], ['BG', 'CF'], ['CH', 'DG']] as [string, string][] }
  }, [])
  const res = useMemo(() => xBraced(t.m, t.pairs, mode), [t, mode])
  return (
    <div className="space-y-2">
      <Seg value={mode} onChange={setMode} items={[{ v: 'both', label: 'Diagonals take T & C (equal shares)' }, { v: 'tension', label: 'Slender diagonals: tension only' }]} />
      <TrussSolution model={t.m} forces={res.forces} note={mode === 'both' ? 'Each diagonal carries half the panel shear, opposite signs.' : `Compression diagonals buckle → taken as zero (removed: ${res.removed.join(', ')}).`} />
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Truss essentials" right={<div className="w-72 hidden md:block"><TopicFrequency topic="truss" /></div>}>
        <Md>{`**Assumptions**: members joined by frictionless pins, loads applied at joints → every member is a **two-force member** carrying only axial force (tension +, compression −).

- **Method of joints** — ΣFx = ΣFy = 0 at a joint with ≤ 2 unknowns. Best for finding *all* forces or near supports.
- **Method of sections** — cut through ≤ 3 members whose lines don’t all meet at one point; take moments about the intersection of two of them to get the third directly. Best for “find the force in members X, Y, Z”.
- **Zero-force members** (unloaded joint): (1) two non-collinear members → both zero; (2) three members with two collinear → the third is zero.`}</Md>
      </Section>
      <Section title="What the exam throws at you">
        <Md>{`- **Pratt / Howe / Warren / Parker** bridge trusses with panel loads → sections.
- **K-trusses and subdivided trusses** (2015-16, 2010-11, 2007-08) → cut around a K joint or use two sections + a joint.
- **Compound / complex trusses** (2012-13 Fig 3, 2007-08 Fig 12) → find the connecting members first.
- **X-braced (indeterminate) trusses** solved approximately:
  - diagonals can take tension *and* compression → each diagonal of a panel takes **half the panel shear**;
  - slender diagonals (“cannot take compression”) → the compression diagonal is **zero**, the tension diagonal takes all the shear.`}</Md>
        <Callout kind="exam">The approximate X-braced truss appeared in 2022-23, 2021-22 (twice in 3 papers), 2020-21, 2016-17, 2015-16, 2012-13 and 2011-12 — almost guaranteed.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Recipe for “find the force in members …”">
        <Steps>
          <Step n={1} title="Reactions">ΣM about one support. Skip if you can cut a part that doesn’t include the supports.</Step>
          <Step n={2} title="Zero-force members">Strike them out first — fewer unknowns, and the exam often hides one in the asked list.</Step>
          <Step n={3} title="Choose a section">Through the member you want plus ≤ 2 others. Moment centre = intersection of the other two (for a diagonal between parallel chords use ΣFy).</Step>
          <Step n={4} title="Sign convention">Assume tension (arrow pulling away from the cut). A negative result = compression.</Step>
          <Step n={5} title="Check">One extra equation (another moment centre or a joint) on the answer.</Step>
        </Steps>
      </Section>
      <Section title="Section cutter" sub="Drag the cut along a Pratt truss: see which members are cut and which point isolates each one.">
        <SectionCutter />
      </Section>
      <Section title="X-braced trusses by approximation" sub="Toggle the assumption and see how the forces change">
        <XBracedExplorer />
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Solve it member by member" sub="Pick a truss type, click a member, enter its force with T/C. New geometry and loads every time.">
        <MemberGame />
      </Section>
      <Section title="Zero-force hunt">
        <ZeroHunt />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const ownT = (id: string, level: PYQ['level'], title: string, text: string, m: Model, asked: string[], forces?: () => Map<string, number>): PYQ => ({
  id: `own-truss-${id}`,
  paper: 'own',
  level,
  sec: 'B',
  no: id,
  marks: 0,
  topics: ['truss'],
  title,
  text,
  pages: [],
  figure: () => <StructureView model={m} autoDimX maxHeight={260} />,
  checks: () => {
    const f = forces ? forces() : trussForces(m).f
    return asked.map((a) => ({ key: a, label: `Force in ${a} (T +, C −)`, value: f.get(a) ?? 0, unit: 'k' }))
  },
  solution: () => <TrussSolution model={m} asked={asked} forces={forces?.()} />,
})

const ownPratt = buildTruss({ type: 'pratt', n: 6, w: 20, h: 25, loads: [30, 30, 40, 30, 30] }).model
const ownRoof = buildTruss({ type: 'roof', n: 6, w: 10, h: 15, loads: [10, 10, 15, 10, 10] }).model
const ownParker = buildTruss({ type: 'parker', n: 6, w: 18, h: 24, loads: [20, 25, 30, 25, 20] }).model
const ownX = truss('A:0,0 B:0,12 C:0,24 D:10,0 E:10,12 F:10,24', 'A-D B-E C-F A-B B-C D-E E-F AE=A-E BD=B-D BF=B-F CE=C-E', 'A:pin D:pin', [{ kind: 'node', node: 'C', fx: 10 }, { kind: 'node', node: 'B', fx: 20 }])
const problems: PYQ[] = [
  ownT('1', 'warm-up', 'Pratt truss — three members by one section', 'Six-panel Pratt truss (panels 20 ft, height 25 ft) with panel loads 30, 30, 40, 30, 30 k at L1…L5. Find the forces in U2U3, U2L3 and L2L3.', ownPratt, ['U2U3', 'U2L3', 'L2L3']),
  ownT('2', 'warm-up', 'Roof truss', 'Fink-type roof truss: 6 panels of 10 ft, rise 15 ft, top-chord joint loads 10, 10, 15, 10, 10 k. Find U2U3, U2L3 and L2L3.', ownRoof, ['U2U3', 'U2L3', 'L2L3']),
  ownT('3', 'exam', 'Parker truss (curved top chord)', 'Find the forces in U2U3, U2L3 and L2L3 of the curved-chord truss (6 × 18 ft, max height 24 ft, loads 20, 25, 30, 25, 20 k).', ownParker, ['U2U3', 'U2L3', 'L2L3']),
  ownT('4', 'exam', 'X-braced tower — approximate', 'A two-panel braced tower (10 ft wide, 2 × 12 ft high) carries 20 k and 10 k horizontally. Diagonals can take tension and compression. Find all diagonal forces approximately.', ownX, ['AE', 'BD', 'BF', 'CE'], () => xBraced(ownX, [['AE', 'BD'], ['BF', 'CE']], 'both').forces),
  ownT('5', 'challenge', 'Same tower, slender diagonals', 'Repeat problem 4 assuming the diagonals cannot take compression.', ownX, ['AE', 'BD', 'BF', 'CE'], () => xBraced(ownX, [['AE', 'BD'], ['BF', 'CE']], 'tension').forces),
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
