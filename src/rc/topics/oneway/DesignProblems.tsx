// One-way slab "Design problems": a fresh paper-style problem each click (see design.ts).
import { CantElevation, DesignShell, GridPlan } from './designKit'
import { FAMILIES, makeOneWay, type OneWayProblem } from './design'
import { useMark } from './kit'
import { CantSolution, CoefSolution } from './solution'

function Marks({ p }: { p: OneWayProblem }) {
  const rules = p.kind === 'coef' ? [...new Set(p.r.hmin.map((x) => x.rule))] : [p.r.spanRule, ...(p.r.nC ? ['cant'] : [])]
  useMark('sl-hmin', { rules: rules.join('|') })
  useMark('sl-ts', { fy: p.input.fy })
  return null
}

const figure = (p: OneWayProblem) => (
  <>
    <Marks p={p} />
    {p.kind === 'coef' ? <GridPlan g={p.fig} /> : <CantElevation p={p.input} />}
  </>
)
const solution = (p: OneWayProblem) => (p.kind === 'coef' ? <CoefSolution r={p.r} /> : <CantSolution r={p.r} />)

export function OneWayDesign() {
  return <DesignShell tid="rc-oneway" families={FAMILIES} make={makeOneWay} figure={figure} solution={solution} note="Class conventions: d = h − 1 in, h rounded up (½ in above 6 in), spacing rounded down to ½ in, 1.2D + 1.6L, bars #3 unless the spacing drops below 4.5 in. Give moments in k-ft per ft, steel in in² per ft." />
}
