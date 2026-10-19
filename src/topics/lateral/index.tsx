import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { makeTransform, StructureView } from '../../components/StructureView'
import { Answer, Callout, Md, Section, Seg, Step, Steps, Tex } from '../../components/ui'
import { cantileverMethod, gridModel, gridNames, portalMethod, type ApproxResult, type GridFrame } from '../../engine/approx'
import { ApproxSolution } from '../../kit/solutions'
import { pick, randInt, rng, TopicFrequency, useSeed } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

function genFrame(seed: number): GridFrame {
  const r = rng(seed)
  const nb = randInt(r, 1, 3)
  const ns = randInt(r, 1, 3)
  const xs = [0]
  for (let k = 0; k < nb; k++) xs.push(xs[xs.length - 1] + pick(r, [12, 15, 16, 18, 20, 24]))
  const heights = Array.from({ length: ns }, (_, k) => (k === 0 ? pick(r, [12, 14, 15, 16]) : pick(r, [10, 12])))
  const loads = Array.from({ length: ns }, () => randInt(r, 4, 24, 2))
  const areas = Array.from({ length: ns }, () => xs.map((_, j) => (j === 0 || j === nb ? 1 : 2)))
  return { xs, heights, loads, areas }
}

// ---------------------------------------------------------------- sway animation
function Sway({ g, r }: { g: GridFrame; r: ApproxResult }) {
  const [ph, setPh] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      setPh(Math.sin((t - t0) / 600))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const Y = r.levelsY
  const tt = makeTransform(g.xs.flatMap((x) => Y.map((y) => [x, y] as [number, number])), 600, 300, 50)
  const drift = Y.map((_, l) => (l === 0 ? 0 : (l / (Y.length - 1)) ** 0.8 * 22 * ph))
  return (
    <svg viewBox={`0 0 ${tt.W} ${tt.H}`} className="w-full h-auto max-w-xl">
      {g.xs.map((x, j) =>
        g.heights.map((_, s) => {
          const x0 = tt.x(x) + drift[s],
            y0 = tt.y(Y[s]),
            x1 = tt.x(x) + drift[s + 1],
            y1 = tt.y(Y[s + 1])
          const hp = (y0 - y1) / 3
          const zf = r.inflection[s] / g.heights[s]
          return (
            <g key={`c${j}${s}`}>
              <path d={`M${x0},${y0} C${x0},${y0 - hp} ${x1},${y1 + hp} ${x1},${y1}`} fill="none" stroke="var(--c-member)" strokeWidth={3} />
              <circle cx={x0 + (x1 - x0) * (zf === 0 ? 0 : 0.5)} cy={y0 + (y1 - y0) * zf} r={4.5} fill="var(--c-load)" />
            </g>
          )
        }),
      )}
      {Y.slice(1).map((y, l) =>
        g.xs.slice(0, -1).map((x, b) => {
          const xa = tt.x(x) + drift[l + 1],
            xb = tt.x(g.xs[b + 1]) + drift[l + 1],
            yy = tt.y(y)
          const rot = 6 * ph
          return (
            <g key={`b${l}${b}`}>
              <path d={`M${xa},${yy} C${xa + (xb - xa) / 3},${yy + rot} ${xb - (xb - xa) / 3},${yy - rot} ${xb},${yy}`} fill="none" stroke="var(--c-member)" strokeWidth={3} />
              <circle cx={(xa + xb) / 2} cy={yy} r={4.5} fill="var(--c-load)" />
            </g>
          )
        }),
      )}
      {g.xs.map((x, j) => (
        <path key={'s' + j} d={`M${tt.x(x) - 12},${tt.y(0) + 2} h24`} stroke="var(--c-mute)" strokeWidth={3} />
      ))}
      <text x={10} y={tt.H - 8} fontSize={11} fill="var(--c-load)">
        ● assumed inflection points (M = 0)
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- guided solver
function Guided({ g, method, seed }: { g: GridFrame; method: 'portal' | 'cantilever'; seed: number }) {
  const r = useMemo(() => (method === 'portal' ? portalMethod(g) : cantileverMethod(g)), [g, method])
  const names = gridNames(g)
  const [stage, setStage] = useState(0)
  useEffect(() => setStage(0), [seed, method])
  const id = (k: string) => `lateral:guided:${method}:${seed}:${k}`
  const m = gridModel(g)
  const steps: { title: string; body: React.ReactNode }[] = [
    {
      title: 'Storey shears',
      body: (
        <div>
          <Md>{`Storey shear = sum of all lateral loads **above** the inflection plane of that storey.`}</Md>
          {r.storeyShear.map((v, s) => (
            <Answer key={s} id={id(`V${s}`)} label={`Storey ${s + 1} shear`} value={v} unit="k" compact />
          ))}
        </div>
      ),
    },
    method === 'portal'
      ? {
          title: 'Column shears (exterior = half of interior)',
          body: (
            <div>
              <Md>{`With $n$ bays: exterior column $V/(2n)$, interior column $V/n$.`}</Md>
              {r.columns.map((row, s) => (
                <div key={s}>
                  <Answer id={id(`ce${s}`)} label={`Storey ${s + 1}: exterior column`} value={row[0].shear} unit="k" compact />
                  {row.length > 2 && <Answer id={id(`ci${s}`)} label={`Storey ${s + 1}: interior column`} value={row[1].shear} unit="k" compact />}
                </div>
              ))}
            </div>
          ),
        }
      : {
          title: 'Column axial forces from the overturning moment',
          body: (
            <div>
              <Md>{`Centroid of column areas $\\bar x$, then $N_j = \\dfrac{M\\,A_j d_j}{\\sum A d^2}$ (windward side in tension). M = overturning moment of the loads above about the storey's inflection plane.`}</Md>
              {r.overturning!.map((o, s) => (
                <div key={s}>
                  <Answer id={id(`M${s}`)} label={`Storey ${s + 1}: overturning moment`} value={o.M} unit="k-ft" compact />
                  <Answer id={id(`N${s}`)} label={`Storey ${s + 1}: axial in ${names[s][0]}${names[s + 1][0]} (T +)`} value={r.columns[s][0].axial} unit="k" compact />
                </div>
              ))}
            </div>
          ),
        },
    method === 'portal'
      ? {
          title: 'Column end moments',
          body: (
            <div>
              <Md>{`Inflection at mid-height → $M = V\\cdot h/2$ at top and bottom.`}</Md>
              {r.columns.map((row, s) => (
                <Answer key={s} id={id(`cm${s}`)} label={`Storey ${s + 1}: exterior column end moment`} value={row[0].mTop} unit="k-ft" compact />
              ))}
            </div>
          ),
        }
      : {
          title: 'Beam shears from joint equilibrium',
          body: (
            <div>
              <Md>{`Start at the windward joint of the top floor: beam shear = column axial below − column axial above (± beam shear coming from the other side).`}</Md>
              {r.beams.map((row, l) => (
                <Answer key={l} id={id(`bv${l}`)} label={`Level ${l + 1}: beam ${row[0].name} shear`} value={Math.abs(row[0].shear)} unit="k" magnitude compact />
              ))}
            </div>
          ),
        },
    {
      title: method === 'portal' ? 'Beam moments & shears (joint by joint)' : 'Beam moments, then column moments & shears',
      body: (
        <div>
          <Md>{method === 'portal' ? 'At each joint Σ column moments = Σ beam moments; inflection at mid-span → beam shear = 2M/L.' : 'Beam end moment = V·L/2. Then joints from the top down: column moment below = Σ beam moments − column moment above; column shear = 2M/h.'}</Md>
          {r.beams.map((row, l) => (
            <Answer key={l} id={id(`bm${l}`)} label={`Level ${l + 1}: beam ${row[0].name} end moment`} value={Math.abs(row[0].moment)} unit="k-ft" magnitude compact />
          ))}
          {method === 'cantilever' && <Answer id={id('cv0')} label={`Storey 1: column ${r.columns[0][0].name} shear`} value={Math.abs(r.columns[0][0].shear)} unit="k" magnitude compact />}
        </div>
      ),
    },
    {
      title: 'Axial forces & diagrams',
      body: <ApproxSolution g={g} method={method} />,
    },
  ]
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
      <div>
        <Steps>
          {steps.slice(0, stage + 1).map((s, i) => (
            <Step key={i} n={i + 1} title={s.title}>
              {i < steps.length - 1 ? s.body : null}
            </Step>
          ))}
        </Steps>
        <div className="flex gap-2 mt-3">
          <button className="btn" disabled={stage === 0} onClick={() => setStage(stage - 1)}>
            ← Back
          </button>
          <button className="btn btn-primary" disabled={stage === steps.length - 1} onClick={() => setStage(stage + 1)}>
            Next step →
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView model={m} autoDimX autoDimY memberLabels={method === 'cantilever'} maxHeight={280} />
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <Sway g={g} r={r} />
        </div>
      </div>
      {stage === steps.length - 1 && <div className="lg:col-span-2">{steps[steps.length - 1].body}</div>}
    </div>
  )
}

function Trainer() {
  const { seed, next } = useSeed(17)
  const [method, setMethod] = useState<'portal' | 'cantilever'>('portal')
  const g = useMemo(() => genFrame(seed), [seed])
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Seg value={method} onChange={setMethod} items={[{ v: 'portal', label: 'Portal method' }, { v: 'cantilever', label: 'Cantilever method' }]} />
        <button className="btn ml-auto" onClick={next}>
          ↻ New frame
        </button>
      </div>
      <Guided g={g} method={method} seed={seed} />
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Approximate analysis for lateral loads" right={<div className="w-72 hidden md:block"><TopicFrequency topic="lateral" /></div>}>
        <Md>{`A building frame is highly indeterminate. For wind/earthquake (lateral, joint) loads the columns and beams bend in **double curvature**, so we *assume* where the moment is zero and turn the frame into a determinate one.`}</Md>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div className="card p-4">
            <div className="font-bold mb-1">Portal method (low-rise, shear-type)</div>
            <Md>{`1. Inflection point at **mid-height of every column**.
2. Inflection point at **mid-span of every beam**.
3. Storey shear shared so that **each interior column takes twice an exterior column** (each bay acts like a portal).`}</Md>
          </div>
          <div className="card p-4">
            <div className="font-bold mb-1">Cantilever method (tall, slender)</div>
            <Md>{`1. & 2. Same inflection points.
3. The frame acts like a vertical cantilever: **axial stress in each column ∝ its distance from the centroid** of the column areas → $N_j \\propto A_j d_j$.`}</Md>
          </div>
        </div>
        <Callout kind="exam">Every paper since 2011 has a portal and/or a cantilever question (2023-24: one each, 30 marks). Variants: draw AFD/SFD/BMD of all members; “given the column-shear diagram, find P₁ and P₂” (2021-22); a truss supported on columns (knee-braced bent, 2020-21).</Callout>
      </Section>
      <Section title="Signs that save marks">
        <Md>{`- Loads to the right → the **windward (left) columns are in tension**, leeward in compression.
- All beams at a level have the **same end moment** in the portal method (when bays are loaded only by joint loads); beam shear = 2M/L, so shorter bays get bigger shears.
- Column axial = running sum of beam shears from the roof down.
- Draw BMDs on the compression or tension side as your teacher asks — the toggle in the sidebar flips every diagram here.`}</Md>
      </Section>
    </div>
  )
}

function Approach() {
  const g: GridFrame = { xs: [0, 20, 40], heights: [12, 10], loads: [40, 20], areas: [[1, 2, 1], [1, 2, 1]] }
  return (
    <div>
      <Section title="Portal method recipe">
        <Steps>
          <Step n={1} title="Storey shears">V_s = Σ loads above that storey.</Step>
          <Step n={2} title="Column shears">exterior V/(2n), interior V/n (n = bays).</Step>
          <Step n={3} title="Column moments">M = V·h/2 at both ends (pinned base: M_top = V·h, M_base = 0).</Step>
          <Step n={4} title="Beam moments, joint by joint from the windward side">M_beam,right = M_col,above + M_col,below − M_beam,left; beam shear = 2M/L.</Step>
          <Step n={5} title="Axial forces">Columns: Σ beam shears; beams: horizontal joint equilibrium.</Step>
        </Steps>
      </Section>
      <Section title="Cantilever method recipe">
        <Steps>
          <Step n={1} title="Centroid of column areas">x̄ = ΣA x / ΣA; distances d_j.</Step>
          <Step n={2} title="Overturning moment at each storey's inflection plane">M = Σ P (height of P − height of the plane).</Step>
          <Step n={3} title="Column axial forces">N_j = M·A_j·d_j / ΣA d² (tension on the windward side).</Step>
          <Step n={4} title="Beam shears">Vertical equilibrium of each joint, windward → leeward.</Step>
          <Step n={5} title="Moments and column shears">Beam M = V·L/2; column moment from joint equilibrium (top storey first); column shear = 2M/h.</Step>
        </Steps>
      </Section>
      <Section title="Worked example (2-bay, 2-storey; areas A, 2A, A)">
        <Tex block>{`\\text{Loads } 20\\text{ k (roof)},\\ 40\\text{ k (1st floor)};\\quad V_2 = 20,\\ V_1 = 60\\text{ k}`}</Tex>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div className="font-bold mb-1">Portal</div>
            <ApproxSolution g={g} method="portal" kinds={['M']} />
          </div>
          <div>
            <div className="font-bold mb-1">Cantilever</div>
            <ApproxSolution g={g} method="cantilever" kinds={['M']} />
          </div>
        </div>
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Guided trainer" sub="Random frame. Fill each step, check, then move on — the frame sways on the right with the assumed inflection points.">
        <Trainer />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const ownL = (id: string, level: PYQ['level'], title: string, text: string, g: GridFrame, method: 'portal' | 'cantilever'): PYQ => ({
  id: `own-lateral-${id}`,
  paper: 'own',
  level,
  sec: 'B',
  no: id,
  marks: 0,
  topics: ['lateral'],
  title,
  text,
  pages: [],
  figure: () => <StructureView model={gridModel(g)} autoDimX autoDimY memberLabels={method === 'cantilever'} maxHeight={260} />,
  checks: () => {
    const r = method === 'portal' ? portalMethod(g) : cantileverMethod(g)
    const s0 = r.columns[0]
    return [
      { key: 'c', label: `Ground-storey column ${s0[s0.length > 2 ? 1 : 0].name} shear`, value: s0[s0.length > 2 ? 1 : 0].shear, unit: 'k' },
      { key: 'b', label: `First-floor beam ${r.beams[0][0].name} end moment`, value: r.beams[0][0].moment, unit: 'k-ft' },
      { key: 'n', label: `Axial force in ${s0[0].name} (T +)`, value: s0[0].axial, unit: 'k' },
    ]
  },
  solution: () => <ApproxSolution g={g} method={method} />,
})
const problems: PYQ[] = [
  ownL('1', 'warm-up', 'Portal: 2 bays, 1 storey', 'Lateral load 24 k at roof level; bays 20 ft and 15 ft, height 14 ft, fixed bases. Portal method: SFD, BMD, AFD of all members.', { xs: [0, 20, 35], heights: [14], loads: [24] }, 'portal'),
  ownL('2', 'exam', 'Portal: 3 bays, 3 storeys', 'Loads 10, 20, 20 k (roof, 2nd, 1st floor). Bays 15, 10, 15 ft; storeys 15, 12, 12 ft. Portal method.', { xs: [0, 15, 25, 40], heights: [15, 12, 12], loads: [20, 20, 10] }, 'portal'),
  ownL('3', 'exam', 'Cantilever: 2 bays, 2 storeys', 'Loads 30 k (1st floor) and 15 k (roof). Bays 24 ft and 16 ft; storeys 14 and 12 ft; areas A, 2A, A. Cantilever method.', { xs: [0, 24, 40], heights: [14, 12], loads: [30, 15], areas: [[1, 2, 1], [1, 2, 1]] }, 'cantilever'),
  ownL('4', 'challenge', 'Cantilever: unequal areas, loads from the right', 'Leftward loads of 16 k (1st floor) and 8 k (roof) applied at the right end. Bays 18, 12 ft; storeys 15, 12 ft; areas 1.5A, 2A, A. Cantilever method.', { xs: [0, 18, 30], heights: [15, 12], loads: [-16, -8], areas: [[1.5, 2, 1], [1.5, 2, 1]] }, 'cantilever'),
]

void fmt
const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
