// Shear "Design problems" (top of the Lab tab): loaded beam → Vu, case, zones, stirrup count; solution from ShearSolution.
import { DesignProblems } from '../tbeam/designShell'
import { makeSDesign, S_FAMILIES, type SProblem } from './design'
import { BeamLoads, StirrupSketch } from './figs'
import { ShearSolution } from './Solution'

function Figure({ p }: { p: SProblem }) {
  return <BeamLoads bm={p.bm} dsg={p.dsg} />
}

function Solution({ p }: { p: SProblem }) {
  return (
    <div className="space-y-3">
      <ShearSolution bm={p.bm} sec={p.sec} dsg={p.dsg} barLabel={`#${p.bar} ${p.legs}-legged`} />
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StirrupSketch dsg={p.dsg} layouts={p.dsg.layouts} h={p.h} />
      </div>
    </div>
  )
}

export function ShearDesignProblems() {
  return (
    <DesignProblems
      topic="rc-shear"
      families={S_FAMILIES}
      make={makeSDesign}
      figure={(p) => <Figure p={p} />}
      solution={(p) => <Solution p={p} />}
      foot="Class method: Vc = 2λ√f′c bw d, φ = 0.75, Vu held constant from the face to d (face if a point load sits within d), Case A–D. Distances from the support face; the stirrup count follows the layout in the solution."
    />
  )
}
