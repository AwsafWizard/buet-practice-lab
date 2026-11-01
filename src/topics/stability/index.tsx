import { useMemo, useState } from 'react'
import { StructureView } from '../../components/StructureView'
import { Answer, Callout, Choice, Md, Section, Step, Steps, Tex } from '../../components/ui'
import { determinacy } from '../../engine/determinacy'
import type { Model, SupportType } from '../../engine/model'
import { beamOf, model, truss } from '../../kit/builders'
import { DeterminacyCard } from '../../kit/loads'
import { TopicFrequency } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

// ---------------------------------------------------------------- gallery
const portal = (sa: SupportType, sb: SupportType, hinge = false) =>
  hinge ? model('A:0,0 B:0,10 C*:10,10 D:20,10 E:20,0', 'A-B B-C C-D E-D', `A:${sa} E:${sb}`) : model('A:0,0 B:0,10 D:20,10 E:20,0', 'A-B B-D E-D', `A:${sa} E:${sb}`)
const frame2x2 = model(
  'A:0,0 B:10,0 C:20,0 D:0,10 E:10,10 F:20,10 G:0,20 H:10,20 I:20,20',
  'A-D D-G B-E E-H C-F F-I D-E E-F G-H H-I',
  'A:fixed B:pin C:fixed',
)
const frame1x2 = model('A:0,0 B:12,0 C:0,10 D:12,10 E:0,20 F:12,20', 'A-C C-E B-D D-F C-D E-F', 'A:fixed B:pin')
export const GALLERY: { name: string; m: Model; note?: string }[] = [
  { name: 'Propped cantilever', m: beamOf('A:0:fixed B:20:roller') },
  { name: 'Fixed–fixed beam', m: beamOf('A:0:fixed B:20:fixed') },
  { name: 'Beam on three rollers', m: beamOf('A:0:roller B:10:roller C:20:roller'), note: 'All reactions parallel → cannot resist a horizontal load: geometrically unstable even though r = 3.' },
  {
    name: 'Concurrent reactions',
    m: { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 5, y: 0 }, { id: 'C', x: 10, y: 0 }], members: [{ id: 'AB', i: 'A', j: 'B' }, { id: 'BC', i: 'B', j: 'C' }], supports: [{ node: 'A', type: 'link', dir: 45 }, { node: 'B', type: 'roller', dir: 90 }, { node: 'C', type: 'link', dir: 135 }], loads: [] },
    note: 'The three reaction lines meet at one point (5, 5): no moment about that point can be resisted → geometrically unstable.',
  },
  { name: 'Gerber beam', m: beamOf('A:0:fixed B*:10 C:20:roller D:30:roller') },
  { name: 'Beam with too many hinges', m: beamOf('A:0:pin B*:8 C:16:roller D*:24 E:32:roller') },
  { name: 'Portal, fixed bases', m: portal('fixed', 'fixed') },
  { name: 'Portal, pinned bases', m: portal('pin', 'pin') },
  { name: 'Three-hinged frame', m: portal('pin', 'pin', true) },
  { name: 'Portal with a roller', m: portal('pin', 'roller') },
  { name: '2-storey frame (fixed + pin)', m: frame1x2 },
  { name: '2-bay 2-storey frame', m: frame2x2 },
  {
    name: 'X-braced panel truss',
    m: truss('A:0,0 B:10,0 C:10,8 D:0,8', 'A-B B-C C-D D-A ac=A-C bd=B-D', 'A:pin B:pin'),
  },
  {
    name: 'Warren truss',
    m: truss('A:0,0 B:10,0 C:20,0 D:30,0 E:5,8 F:15,8 G:25,8', 'A-B B-C C-D E-F F-G A-E E-B B-F F-C C-G G-D', 'A:pin D:roller'),
  },
  {
    name: 'Two diagonals in one panel, none in the other',
    m: truss('A:0,0 B:10,0 C:20,0 D:0,10 E:10,10 F:20,10', 'A-B B-C D-E E-F A-D B-E C-F A-E B-D', 'A:pin C:roller'),
    note: 'b + r − 2j = 9 + 3 − 12 = 0 looks determinate, but panel B–C–F–E has no diagonal (it can rack) while panel 1 has a redundant one → geometrically unstable. Counting alone is not enough.',
  },
  {
    name: 'Truss with a mechanism',
    m: truss('A:0,0 B:10,0 C:20,0 D:0,10 E:10,10 F:20,10', 'A-B B-C D-E E-F A-D B-E C-F A-E', 'A:pin C:roller'),
    note: 'b + r − 2j = 8 + 3 − 12 = −1 → statically unstable: panel B–C–F–E is a parallelogram mechanism.',
  },
]

function QuizCard({ g, i }: { g: (typeof GALLERY)[number]; i: number }) {
  const d = useMemo(() => determinacy(g.m), [g])
  const [show, setShow] = useState(false)
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-sm">
          {i + 1}. {g.name}
        </div>
        <button className="text-xs text-accent underline" onClick={() => setShow(!show)}>
          {show ? 'hide' : 'reveal'}
        </button>
      </div>
      <StructureView model={g.m} showLoads={false} nodeLabels={false} maxHeight={150} wobble={show && !d.stable} />
      <Choice id={`stability:gal:${i}:st`} label="Stable?" options={[{ v: 'stable', label: 'Stable' }, { v: 'unstable', label: 'Unstable' }]} answer={d.stable ? 'stable' : 'unstable'} />
      {d.stable && <Answer id={`stability:gal:${i}:dosi`} label="DOSI" value={d.dosi} abs={0.1} compact />}
      {d.stable && <Answer id={`stability:gal:${i}:doki`} label="DOKI" value={d.doki} abs={0.1} compact />}
      {show && (
        <div className="text-xs text-mute mt-2 space-y-0.5">
          <div>
            {d.kind === 'truss' ? `b = ${d.m}, r = ${d.r}, j = ${d.j}` : `m = ${d.m}, r = ${d.r}, j = ${d.j}, c = ${d.c}`} → formula {d.formula} = <b className="text-ink">{d.dosiFormula}</b>
          </div>
          <div>
            {d.stable ? (
              <>
                DOSI = <b className="text-ink">{d.dosi}</b> ({d.dosi === 0 ? 'determinate' : 'indeterminate'}), DOKI = <b className="text-ink">{d.doki}</b>
                {d.kind === 'frame' && ` (${d.dokiNoAxial} ignoring axial deformation)`}
              </>
            ) : (
              <b className="text-bad">Unstable{d.geometricallyUnstable ? ' — geometrically (the count looks fine but the arrangement is a mechanism)' : ' — statically (too few restraints/members)'}</b>
            )}
          </div>
          {g.note && <div>{g.note}</div>}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- builder sandbox
const CYCLE: (SupportType | 'none')[] = ['fixed', 'pin', 'roller', 'none']
function Builder() {
  const base = useMemo(() => model('A:0,0 B:12,0 C:24,0 D:0,10 E:12,10 F:24,10 G:0,20 H:12,20', 'A-D D-G B-E E-H C-F D-E E-F G-H', 'A:fixed B:pin C:roller'), [])
  const [sup, setSup] = useState<Record<string, SupportType | 'none'>>({ A: 'fixed', B: 'pin', C: 'roller' })
  const [hinges, setHinges] = useState<Set<string>>(new Set())
  const [removed, setRemoved] = useState<Set<string>>(new Set())
  const m: Model = useMemo(
    () => ({
      ...base,
      nodes: base.nodes.map((n) => ({ ...n, hinge: hinges.has(n.id) || undefined })),
      members: base.members.filter((x) => !removed.has(x.id)),
      supports: Object.entries(sup)
        .filter(([, t]) => t !== 'none')
        .map(([node, type]) => ({ node, type: type as SupportType })),
    }),
    [base, sup, hinges, removed],
  )
  const used = new Set(m.members.flatMap((x) => [x.i, x.j]))
  const mm = { ...m, nodes: m.nodes.filter((n) => used.has(n.id)), supports: m.supports.filter((s) => used.has(s.node)) }
  const d = useMemo(() => determinacy(mm), [mm])
  return (
    <div className="grid cq-lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={mm} showLoads={false} maxHeight={300} wobble={!d.stable} onMemberClick={(id) => setRemoved(new Set([...removed, id]))}>
          {(t) => (
            <g>
              {mm.nodes.map((n) => (
                <circle
                  key={n.id}
                  cx={t.x(n.x)}
                  cy={t.y(n.y)}
                  r={11}
                  fill="transparent"
                  stroke="var(--c-accent)"
                  strokeOpacity={0.35}
                  strokeDasharray="3 3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (['A', 'B', 'C'].includes(n.id)) {
                      const cur = sup[n.id] ?? 'none'
                      setSup({ ...sup, [n.id]: CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length] })
                    } else {
                      const h = new Set(hinges)
                      if (h.has(n.id)) h.delete(n.id)
                      else h.add(n.id)
                      setHinges(h)
                    }
                  }}
                />
              ))}
            </g>
          )}
        </StructureView>
        <div className="text-xs text-faint px-2 pb-1">Click a base joint (A, B, C) to cycle fixed → pin → roller → free. Click an upper joint to toggle a hinge. Click a member to delete it.</div>
      </div>
      <div className="space-y-2 text-sm">
        <div className={'text-2xl font-extrabold ' + (d.stable ? 'text-good' : 'text-bad')}>{d.stable ? (d.dosi === 0 ? 'Determinate' : `Indeterminate (${d.dosi}°)`) : 'Unstable!'}</div>
        <Tex block>{`m = ${d.m},\\ r = ${d.r},\\ j = ${d.j},\\ c = ${d.c}`}</Tex>
        <Tex block>{`\\text{DOSI} = 3m + r - (3j + c) = ${d.dosiFormula}`}</Tex>
        <div>
          Rank check of the equilibrium matrix: {d.rankA} of {d.equations} equations independent → {d.stable ? 'every load can be equilibrated ✓' : 'some load cannot be resisted ✗'}
        </div>
        <div>
          DOKI = <b className="num">{d.doki}</b> (ignoring axial deformation: <b className="num">{d.dokiNoAxial}</b>)
        </div>
        <button
          className="btn"
          onClick={() => {
            setSup({ A: 'fixed', B: 'pin', C: 'roller' })
            setHinges(new Set())
            setRemoved(new Set())
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- DOSI / DOKI formula table (shared by Overview and Approach)
function FormulaTable() {
  return (
    <div>
      <div className="overflow-x-auto mb-3">
        <table className="tbl">
          <thead>
            <tr>
              <th>Structure (DOF / joint)</th>
              <th>DOSI</th>
              <th>DOKI</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Plane truss', 'u, v', 'b + r - 2j', '2j - r'],
              ['Plane frame', 'u, v, \\theta', '3m + r - 3j - c', '3j - r'],
              ['Space truss', 'u, v, w', 'b + r - 3j', '3j - r'],
              ['Space frame', 'u, v, w, \\theta_{x,y,z}', '6m + r - 6j - c', '6j - r'],
            ].map(([s, dof, dosi, doki]) => (
              <tr key={s}>
                <td className="txt">
                  <div>{s}</div>
                  <div className="text-xs text-faint"><Tex>{dof}</Tex></div>
                </td>
                <td className="whitespace-nowrap"><Tex>{dosi}</Tex></td>
                <td className="whitespace-nowrap"><Tex>{doki}</Tex></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid cq-md:grid-cols-2 gap-4">
        <Md>{`- *b* or *m* = members, *r* = support reactions, *j* = joints (**including support joints**).
- *c* = equations of condition: an internal hinge joining *n* members gives $c = n - 1$; a released member end gives 1.
- DOKI = (DOF per joint) × *j* − *r*: every joint's DOFs minus the ones the supports restrain.`}</Md>
        <Md>{`**Notes for frames**
- **Support reactions (r):** a fixed support gives 3, a pin 2, a roller 1.
- **Internal hinges:** each hinge releases moment, so subtract the releases from DOSI: $3m + r - 3j - c$. For DOKI, each hinge adds an extra rotation DOF: $3j - r + c$.`}</Md>
      </div>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Two different questions" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="stability" /></div>}>
        <Md>{`- **Static indeterminacy (DOSI)** — how many *unknown forces* exceed the equilibrium equations. Needed for the **flexibility (force) method**: redundants are the unknowns.
- **Kinematic indeterminacy (DOKI)** — how many independent *joint displacements* (translations + rotations) are free. Needed for the **stiffness (displacement) method**.
- **Stability** — whether the supports and members can hold the structure in equilibrium under *any* load.`}</Md>
      </Section>
      <Section title="Formulas (Prof. Nazrul Islam’s notation)">
        <FormulaTable />
        <Md className="mt-3">{`**DOKI** = DOF at free joints + DOF at support joints + extra rotations at hinges.
- plane truss joint: 2 (δx, δy); beam/plane frame joint: 3 (δx, δy, θ); space frame: 6.
- a support removes the restrained DOFs (pin: 2, roller: 1, fixed: 3).
- a hinge joining two members has **one translation pair + two rotations**.
- *ignoring axial deformation*, members can't change length → fewer independent translations (a portal on fixed bases: 2 rotations + 1 sway = **3**).`}</Md>
      </Section>
      <Section title="Stability">
        <Md>{`**Count first:** truss DOSI $= b + r - 2j$, DOKI $= 2j - r$ · frame DOSI $= 3m + r - 3j - c$, DOKI $= 3j - r + c$ (space: $b + r - 3j$ / $3j - r$ and $6m + r - 6j - c$ / $6j - r$).

- **DOSI < 0** → *statically unstable* (partial constraints: too few reactions or members).
- **DOSI = 0** → determinate; **DOSI > 0** → indeterminate — *if* stable.
- **Geometrically unstable** (improper constraints): the count is fine but reactions are **all parallel** or **all concurrent** (meet at one point), or a part of the structure forms a mechanism (a truss panel without a diagonal, three hinges in a line).`}</Md>
        <Callout kind="exam">2023-24 asked DOSI and DOKI for a braced tower and an irregular frame (6 marks). Jan-2021 asked DOSI of four structures (8 marks). Quick marks — learn it once.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Formulas">
        <FormulaTable />
      </Section>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Decide truss or frame">All joints pinned and loads at joints → truss formula; otherwise frame formula.</Step>
          <Step n={2} title="Count carefully">m (or b) = every member between two joints; j = every joint incl. supports and free ends; r = reaction components; c = releases.</Step>
          <Step n={3} title="Apply the formula">Truss: b + r − 2j; frame: 3m + r − 3j − c. DOSI &lt; 0 → unstable. Otherwise…</Step>
          <Step n={4} title="Inspect the arrangement">Parallel / concurrent reactions? A non-triangulated panel? Three hinges in line? → geometrically unstable.</Step>
          <Step n={5} title="DOKI">Free DOF of each joint − support restraints + extra hinge rotations: truss 2j − r, frame 3j − r + c. State whether axial deformation is ignored.</Step>
        </Steps>
      </Section>
      <Section title="Lecture examples, solved">
        <div className="grid cq-md:grid-cols-3 gap-3">
          <DeterminacyCard m={beamOf('A:0:fixed B:20:roller')} label="Propped cantilever" />
          <DeterminacyCard m={frame1x2} label="2-storey frame (fixed + pin) — DOSI 5, DOKI 13" />
          <DeterminacyCard m={frame2x2} label="2-bay 2-storey frame — DOSI 11, DOKI 19" />
          <DeterminacyCard m={portal('fixed', 'fixed', true)} label="Fixed portal with a hinge — DOSI 2" />
          <DeterminacyCard m={GALLERY[12].m} label="X-braced panel — DOSI 2" />
          <DeterminacyCard m={GALLERY[3].m} label="Concurrent reactions" />
        </div>
      </Section>
    </div>
  )
}

function Lab() {
  return (
    <div>
      <Section title="Classify the structure" sub="Decide stable/unstable, then DOSI and DOKI. Reveal shows the count and the reasoning; unstable ones wobble.">
        <div className="grid cq-md:grid-cols-2 cq-xl:grid-cols-3 gap-3">
          {GALLERY.map((g, i) => (
            <QuizCard key={g.name} g={g} i={i} />
          ))}
        </div>
      </Section>
      <Section title="Builder" sub="Change supports, add hinges, delete members — see the counts change live.">
        <Builder />
      </Section>
    </div>
  )
}

const ownP = (id: string, level: PYQ['level'], title: string, m: Model): PYQ => ({
  id: `own-stability-${id}`,
  paper: 'own',
  level,
  sec: 'A',
  no: id,
  marks: 0,
  topics: ['stability'],
  title,
  text: 'Determine whether the structure is stable. If stable, find DOSI and DOKI (state DOKI with and without axial deformation for frames).',
  pages: [],
  figure: () => <StructureView model={m} showLoads={false} maxHeight={220} />,
  checks: () => {
    const d = determinacy(m)
    return d.stable
      ? [
          { key: 'dosi', label: 'DOSI', value: d.dosi },
          { key: 'doki', label: 'DOKI', value: d.doki },
        ]
      : [{ key: 'formula', label: 'Formula value (it is unstable!)', value: d.dosiFormula }]
  },
  solution: () => <DeterminacyCard m={m} />,
})

const problems: PYQ[] = [
  ownP('1', 'warm-up', 'Continuous beam on four supports', beamOf('A:0:fixed B:10:roller C:20:roller D:30:roller')),
  ownP('2', 'warm-up', 'Pratt truss with a redundant support', truss('A:0,0 B:10,0 C:20,0 D:30,0 E:10,10 F:20,10', 'A-B B-C C-D E-F A-E E-B E-C F-C F-D', 'A:pin D:pin')),
  ownP('3', 'exam', 'Frame with a hinge and mixed supports', model('A:0,0 B:0,12 C*:10,12 D:20,12 E:20,0 F:30,12 G:30,0', 'A-B B-C C-D E-D D-F G-F', 'A:fixed E:pin G:roller')),
  ownP('4', 'exam', 'Three-storey single-bay frame', model('A:0,0 B:15,0 C:0,10 D:15,10 E:0,20 F:15,20 G:0,30 H:15,30', 'A-C C-E E-G B-D D-F F-H C-D E-F G-H', 'A:fixed B:fixed')),
  ownP('5', 'challenge', 'Spot the mechanism', beamOf('A:0:pin B*:6 C*:12 D:18:roller')),
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
