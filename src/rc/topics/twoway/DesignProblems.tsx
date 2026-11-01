// Two-way slab "Design problems": a floor plan, design panel S1 (see design.ts).
import { DesignShell, GridPlan } from '../oneway/designKit'
import { useMark } from '../oneway/kit'
import { FAMILIES, makeTwoWay, type TwoWayProblem } from './design'
import { TwoWaySolution } from './solution'

function Marks({ p }: { p: TwoWayProblem }) {
  const m = Math.max(0.5, p.r.m)
  useMark('sl-t123', { case: p.r.case, m })
  useMark('sl-t124', { case: p.r.case, m })
  useMark('sl-t125', { case: p.r.case, m })
  useMark('sl-t126', { case: p.r.case, m })
  useMark('sl-ts', { fy: p.input.fy })
  return null
}

const figure = (p: TwoWayProblem) => (
  <>
    <Marks p={p} />
    <GridPlan g={p.fig} />
  </>
)
const solution = (p: TwoWayProblem) => <TwoWaySolution r={p.r} />

export function TwoWayDesign() {
  return <DesignShell tid="rc-twoway" families={FAMILIES} make={makeTwoWay} figure={figure} solution={solution} note="Class conventions: la = short CLEAR span, m = la/lb (interpolate), d = h − 1 (short way), h − 1.5 (long-way positive bars), #3 bars, s ≤ 2h, column strips 1.5s, corner steel over lb/5. Moments in k-ft per ft." />
}
