import { useMemo, useState } from 'react'
import { DiagramView, fmt } from '../../components/DiagramView'
import { StructureView } from '../../components/StructureView'
import { Answer, Callout, Md, Section, Step, Steps, Tex } from '../../components/ui'
import { gridModel, verticalApprox, type GridFrame } from '../../engine/approx'
import { diagramsFromResult } from '../../engine/diagrams'
import { solve } from '../../engine/frame2d'
import { beamOf, W } from '../../kit/builders'
import { Slider, TopicFrequency } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

function GirderDemo() {
  const [L, setL] = useState(20)
  const [w, setW] = useState(4)
  const m = useMemo(() => {
    const b = beamOf(`A:0:fixed P*:${0.1 * L} Q*:${0.9 * L} B:${L}:fixed`)
    return { ...b, loads: [W(`AP`, w), W('PQ', w), W('QB', w)] }
  }, [L, w])
  const r = useMemo(() => solve(m), [m])
  const d = useMemo(() => diagramsFromResult(m, r), [m, r])
  return (
    <div className="space-y-2">
      <div className="grid cq-md:grid-cols-2 gap-x-6">
        <Slider label="Span L" value={L} min={10} max={40} onChange={setL} unit=" ft" />
        <Slider label="w" value={w} min={1} max={10} step={0.5} onChange={setW} unit=" k/ft" />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={m} autoDimX maxHeight={200} />
        <DiagramView model={m} members={d} kind="M" maxHeight={220} />
      </div>
      <Tex block>{`M_{end} = -0.045wL^2 = ${fmt(-0.045 * w * L * L)},\\quad M_{mid} = 0.08wL^2 = ${fmt(0.08 * w * L * L)}\\ \\text{k-ft},\\quad V_{end} = 0.5wL = ${fmt(0.5 * w * L)}\\text{ k}`}</Tex>
    </div>
  )
}

function FrameCalc() {
  const g: GridFrame = { xs: [0, 30, 50], heights: [20, 12], loads: [0, 0] }
  const [w1, setW1] = useState(4)
  const [w2, setW2] = useState(4)
  const r = useMemo(() => verticalApprox(g, [[w1, w2], [w1, w2]]), [w1, w2])
  return (
    <div className="space-y-2">
      <div className="grid cq-md:grid-cols-2 gap-x-6">
        <Slider label="w on left bays" value={w1} min={0} max={8} step={0.5} onChange={setW1} unit=" k/ft" />
        <Slider label="w on right bays" value={w2} min={0} max={8} step={0.5} onChange={setW2} unit=" k/ft" />
      </div>
      <div className="grid cq-lg:grid-cols-[1fr_1.2fr] gap-3">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView model={gridModel(g)} showLoads={false} autoDimX autoDimY maxHeight={260} />
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Girder</th>
                <th>w</th>
                <th>M end (−)</th>
                <th>M mid (+)</th>
                <th>V end</th>
              </tr>
            </thead>
            <tbody>
              {r.beams.flat().map((b) => (
                <tr key={b.name}>
                  <td className="txt">{b.name}</td>
                  <td>{b.w}</td>
                  <td>{fmt(b.endMoment)}</td>
                  <td>{fmt(b.midMoment)}</td>
                  <td>{fmt(b.endShear)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="tbl mt-2">
            <thead>
              <tr>
                <th>Column</th>
                <th>M top</th>
                <th>M bottom</th>
                <th>Axial (T +)</th>
              </tr>
            </thead>
            <tbody>
              {r.cols.flat().map((c) => (
                <tr key={c.name}>
                  <td className="txt">{c.name}</td>
                  <td>{fmt(c.mTop)}</td>
                  <td>{fmt(c.mBot)}</td>
                  <td>{fmt(c.axial)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-faint mt-1">Column moments: the unbalanced girder moment at each joint is shared by the columns above and below in proportion to I/h (EI equal); fixed bases carry half the top moment. Signs follow “left girder heavier = +”.</p>
        </div>
      </div>
      <Callout kind="tip">Make one bay’s load zero: the interior column suddenly bends a lot. That is how you get the <b>maximum possible column moment</b> — live load on one adjacent span only (checkerboard), dead load everywhere.</Callout>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Approximate analysis for gravity loads" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="vertical" /></div>}>
        <Md>{`Assumptions for each girder of a building frame under uniform vertical load w:
1. **Inflection points at 0.1L** from each end (the end restraint is between pinned (0) and fixed (0.211L)).
2. **Zero axial force** in the girders.
3. The middle 0.8L acts as a simple beam hung from two 0.1L cantilevers.`}</Md>
        <Tex block>{`M_{mid} = \\frac{w(0.8L)^2}{8} = 0.08wL^2,\\qquad M_{end} = -\\left[0.4wL(0.1L) + \\frac{w(0.1L)^2}{2}\\right] = -0.045wL^2,\\qquad V_{end} = 0.5wL`}</Tex>
        <Md>{`**Columns**: axial = sum of the girder end shears above; bending = the **unbalanced** girder end moment at each joint, shared by the columns above and below in proportion to their stiffness (I/h). With equal loads on both sides of an interior column the moments cancel — the exterior columns bend most.`}</Md>
        <Callout kind="exam">Last asked in 2016-17 (AFD/SFD/BMD of a 3-storey frame), 2015-16, 2012-13 and 2011-12 (“also find the maximum possible BM in column BF” → pattern live load). Low priority but quick.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Each girder">End moments −0.045wL², midspan +0.08wL², end shears 0.5wL.</Step>
          <Step n={2} title="Joint unbalance">ΣM from girders at each joint (left − right).</Step>
          <Step n={3} title="Distribute to columns">By I/h; equal columns → half above, half below (top floor: all to the column below).</Step>
          <Step n={4} title="Column axial">Accumulate girder shears from the roof down.</Step>
          <Step n={5} title="Max column moment">Full DL + LL on one adjacent span, DL only on the other.</Step>
        </Steps>
      </Section>
      <Section title="See the 0.1L idealisation">
        <GirderDemo />
      </Section>
      <Section title="Frame calculator">
        <FrameCalc />
      </Section>
    </div>
  )
}

function Lab() {
  const L = 24,
    w = 5
  return (
    <div>
      <Section title="Quick drill" sub="Girder 24 ft, w = 5 k/ft">
        <Answer id="vertical:drill:end" label="Girder end moment (magnitude)" value={0.045 * w * L * L} unit="k-ft" magnitude />
        <Answer id="vertical:drill:mid" label="Midspan moment" value={0.08 * w * L * L} unit="k-ft" />
        <Answer id="vertical:drill:v" label="End shear" value={0.5 * w * L} unit="k" />
        <Answer id="vertical:drill:ip" label="Distance of inflection point from the end" value={0.1 * L} unit="ft" />
      </Section>
      <Section title="Play with the loads">
        <FrameCalc />
      </Section>
    </div>
  )
}

const ownV = (id: string, level: PYQ['level'], title: string, text: string, g: GridFrame, w: number[][]): PYQ => ({
  id: `own-vertical-${id}`,
  paper: 'own',
  level,
  sec: 'B',
  no: id,
  marks: 0,
  topics: ['vertical'],
  title,
  text,
  pages: [],
  figure: () => <StructureView model={gridModel(g)} showLoads={false} autoDimX autoDimY maxHeight={240} />,
  checks: () => {
    const r = verticalApprox(g, w)
    return [
      { key: 'e', label: `Girder ${r.beams[0][0].name} end moment (magnitude)`, value: r.beams[0][0].endMoment, unit: 'k-ft' },
      { key: 'a', label: `Axial force in ${r.cols[0][0].name} (compression −)`, value: r.cols[0][0].axial, unit: 'k' },
    ]
  },
  solution: () => {
    const r = verticalApprox(g, w)
    return (
      <div className="text-sm space-y-2">
        <table className="tbl">
          <thead>
            <tr>
              <th>Girder</th>
              <th>w</th>
              <th>M end</th>
              <th>M mid</th>
              <th>V end</th>
            </tr>
          </thead>
          <tbody>
            {r.beams.flat().map((b) => (
              <tr key={b.name}>
                <td className="txt">{b.name}</td>
                <td>{b.w}</td>
                <td>−{fmt(b.endMoment)}</td>
                <td>{fmt(b.midMoment)}</td>
                <td>{fmt(b.endShear)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="tbl">
          <thead>
            <tr>
              <th>Column</th>
              <th>M top</th>
              <th>M bottom</th>
              <th>Axial (T +)</th>
            </tr>
          </thead>
          <tbody>
            {r.cols.flat().map((c) => (
              <tr key={c.name}>
                <td className="txt">{c.name}</td>
                <td>{fmt(c.mTop)}</td>
                <td>{fmt(c.mBot)}</td>
                <td>{fmt(c.axial)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
})
const problems: PYQ[] = [
  ownV('1', 'warm-up', 'Single storey, two bays', 'w = 3 k/ft on both girders (spans 25 ft and 20 ft, height 15 ft, fixed bases). Girder moments and column axial forces.', { xs: [0, 25, 45], heights: [15], loads: [0] }, [[3, 3]]),
  ownV('2', 'exam', 'Two storeys, unequal bays', 'DL + LL = 6 k/ft on all girders; spans 30 ft and 20 ft; storey heights 20 ft and 12 ft. Girder and column moments, column axial forces.', { xs: [0, 30, 50], heights: [20, 12], loads: [0, 0] }, [[6, 6], [6, 6]]),
  ownV('3', 'challenge', 'Pattern loading', 'Same frame as problem 2 but live load only on the left bay: left girders 10 k/ft, right girders 6 k/ft. Compare the interior column moments with problem 2.', { xs: [0, 30, 50], heights: [20, 12], loads: [0, 0] }, [[10, 6], [10, 6]]),
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
