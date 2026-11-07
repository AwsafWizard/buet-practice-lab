// Practice problem on a lecture topic never asked in the 13 past papers: Sherif's K0 for a dense compacted sand, against Jaky.
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { K0, solveWall, type Wall } from '../../engine/earth'
import type { SmQ } from '../../types'
import { WallFig } from './figs'
import { WallSolution } from './Solution'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

// basement wall, 5 m of dense compacted sand (drained backfill), 10 kPa surcharge
const B = { H: 5, phi: 36, gd: 16.4, gdMin: 15.6, q: 10 }
const kS = K0.sherif(B.phi, B.gd, B.gdMin)
const kJ = K0.jaky(B.phi)
const wall = (k0: number): Wall => ({ state: 'rest', layers: [{ h: B.H, gamma: B.gd, phi: B.phi, c: 0, K0: k0, name: 'dense compacted sand' }], zw: null, q: B.q })
const WS = wall(kS)
const WJ = wall(kJ)

export const LEP_NEW: SmQ[] = [
  {
    id: 'sm-own-lep-new1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: 'N1',
    marks: 0,
    topics: ['sm-lep'],
    title: "Basement wall on compacted sand: Sherif's K₀ vs Jaky · not asked yet",
    text: `*${NOT_ASKED}*

A rigid basement wall ${B.H} m high retains a dry, dense sand backfill compacted in layers to γd = ${B.gd} kN/m³. The loosest state of the same sand gives γd,min = ${B.gdMin} kN/m³, and φ′ = ${B.phi}°. The backfill is drained (no water) and carries a surcharge of ${B.q} kN/m².

(a) Find K₀ by Sherif et al. (1984), $K_0 = (1 - \\sin\\varphi') + 5.5\\left(\\dfrac{\\gamma_d}{\\gamma_{d(\\min)}} - 1\\right)$, and by Jaky.

(b) Draw the at-rest pressure diagram and find the thrust per metre and its location for each K₀.

(c) Comment on which value you would design for, and why.`,
    pages: [],
    figure: () => <WallFig w={WS} r={null} showDiagrams={false} width={420} />,
    checks: () => {
      const rs = solveWall(WS)
      const rj = solveWall(WJ)
      return [
        { key: 'ks', label: 'K₀ (Sherif)', value: kS },
        { key: 'kj', label: 'K₀ (Jaky)', value: kJ },
        { key: 'ps', label: 'P₀ with Sherif', value: rs.Fs, unit: 'kN/m' },
        { key: 'zs', label: 'z̄ above the base (Sherif)', value: rs.zbar, unit: 'm' },
        { key: 'pj', label: 'P₀ with Jaky', value: rj.Fs, unit: 'kN/m' },
      ]
    },
    solution: () => {
      const rs = solveWall(WS)
      const rj = solveWall(WJ)
      return (
        <div className="space-y-3 text-sm">
          <Md>{`**(a) K₀.** $1 - \\sin ${B.phi}^\\circ = ${f3(kJ)}$ (Jaky, meant for normally consolidated / loosely placed sand). Compaction adds the Sherif term: $\\gamma_d/\\gamma_{d(\\min)} = ${B.gd}/${B.gdMin} = ${f3(B.gd / B.gdMin)}$, so
$$K_0 = ${f3(kJ)} + 5.5(${f3(B.gd / B.gdMin)} - 1) = ${f3(kS)}$$
`}</Md>
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <WallFig w={WS} r={rs} />
            </div>
          </div>
          <Md>{`**(b) With Sherif's K₀ = ${f3(kS)}:**`}</Md>
          <WallSolution w={WS} r={rs} />
          <Md>{`**With Jaky's K₀ = ${f3(kJ)}** the same pieces give $P_0 = ${f2(rj.Fs)}$ kN/m at $\\bar z = ${f2(rj.zbar)}$ m (moment ${f2(rj.MOT)} kN·m/m).`}</Md>
          <Md>{`**(c) Comment.** Sherif's thrust is ${f2(rs.Fs / rj.Fs)} times Jaky's. Rolling a sand behind a rigid wall locks in horizontal stress (the grains are pushed sideways and cannot relax because the wall does not move), so a compacted backfill is not "normally consolidated" and Jaky under-predicts. Sherif's formula was fitted to such dense, compacted sand, so design the basement wall for **P₀ = ${f2(rs.Fs)} kN/m**. Jaky remains right for a loose, end-dumped sand; for an overconsolidated natural sand use Mayne–Kulhawy.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, "Sherif's K₀ is one of AJK sir's five K₀ formulas (Das eq. 13.6, for dense compacted sand). Chart pane: e-k0."],
  },
]
