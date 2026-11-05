// Exam-style full wall problems: seeded, step checks, engine solution on reveal.
import { fmt } from '../../../components/DiagramView'
import { hashKey } from '../../../labs/CheckTable'
import { DesignProblems, type DProblem, type DStep, type Level } from '../../../rc/topics/tbeam/designShell'
import { crackForces, solveWall, type Wall, type WallResult } from '../../engine/earth'
import { WallFig } from './figs'
import { LEP_FAMILIES, randomWall, toWall, type LepFamily } from './gen'
import { WallSolution } from './Solution'

interface LProblem extends DProblem<LepFamily> {
  w: Wall
  r: WallResult
}

function make(seed: number, family?: LepFamily, level: Level = 'exam'): LProblem {
  const g = randomWall(seed * 7 + 3, family, level)
  const w = toWall(g.w)
  const r = solveWall(w)
  const kn = w.state === 'rest' ? 'K0' : w.state === 'active' ? 'Ka' : 'Kp'
  const steps: DStep[] = r.K.map((K, i) => ({ key: `K${i}`, group: 'Coefficients', label: `${kn}${w.layers.length > 1 ? ` layer ${i + 1}` : ''}`, value: K, digits: 4, abs: 0.002 }))
  r.ords.forEach((o, i) => {
    const dup = r.ords.filter((x) => Math.abs(x.z - o.z) < 1e-9).length > 1
    steps.push({ key: `o${i}`, group: 'Pressure ordinates (σ′h, kPa)', label: `σ′h at ${fmt(o.z, 2)} m${dup ? (o.at === 'bot' ? ' (just above)' : ' (just below)') : ''}`, value: o.earth, unit: 'kPa', abs: 0.06 })
  })
  const last = r.ords[r.ords.length - 1]
  if (last.water > 0) steps.push({ key: 'u', group: 'Pressure ordinates (σ′h, kPa)', label: 'water pressure at the base', value: last.water, unit: 'kPa', abs: 0.05 })
  if (r.zc !== null) steps.push({ key: 'zc', group: 'Tension crack', label: 'crack depth zc', value: r.zc, unit: 'm', abs: 0.02 })
  if (r.tension.length) steps.push({ key: 'fb', group: 'Tension crack', label: 'force before the crack', value: r.Fbefore, unit: 'kN/m', abs: 0.1 })
  if (g.family === 'clay') {
    const l = w.layers[0]
    steps.push({ key: 'hc', group: 'Tension crack', label: 'unsupported height Hc', value: crackForces({ H: r.H, gamma: l.gamma, phi: 0, c: l.c }).Hc, unit: 'm', abs: 0.02 })
  }
  if (r.front) steps.push({ key: 'pp', group: 'Forces', label: 'passive resistance in front', value: r.front.P, unit: 'kN/m', abs: 0.1 })
  steps.push({ key: 'fs', group: 'Forces', label: w.state === 'passive' ? 'total passive force' : r.front ? 'net sliding force' : r.tension.length ? 'force after the crack (design)' : 'total thrust Fs', value: r.Fs, unit: 'kN/m', abs: 0.1 })
  steps.push({ key: 'm', group: 'Forces', label: 'moment about the base', value: r.MOT, unit: 'kN·m/m', abs: 0.2 })
  steps.push({ key: 'zb', group: 'Forces', label: 'resultant above the base z̄', value: r.zbar, unit: 'm', abs: 0.02 })
  const title = LEP_FAMILIES.find((f) => f.v === g.family)!.label
  return { family: g.family, level, title, text: g.story, hash: hashKey(JSON.stringify(w)), steps, w, r }
}

export function LepProblems() {
  return (
    <DesignProblems
      topic="sm-lep"
      families={LEP_FAMILIES}
      make={make}
      figure={(p) => <WallFig w={p.w} r={null} showDiagrams={false} width={460} />}
      solution={(p) => (
        <div className="space-y-3">
          <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
            <div className="min-w-[640px]">
              <WallFig w={p.w} r={p.r} />
            </div>
          </div>
          <WallSolution w={p.w} r={p.r} />
        </div>
      )}
      sub="A full exam-style wall from the paper families: work it on paper (draw the diagrams to scale), check each step, then open the solution."
      foot="γw = 9.81 kN/m³. Arms are measured up from the base; after a crack the negative zone is dropped (design value)."
    />
  )
}
