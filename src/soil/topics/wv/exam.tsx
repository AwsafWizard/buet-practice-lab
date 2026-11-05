// Weight–volume exam-style problems: seeded generator → statement, step checks, engine solution.
import { Md, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { cylinderVolume, nf, relDensity, sandCone, solvePhase, unitSys, waterToRaise, waterToSaturate, type PhaseSolution, type UnitSys } from '../../engine/phase'
import { GW } from '../../engine/units'
import { ExamSet, rd, type ExProblem } from './ExamSet'
import { PhaseStepsView } from './figs'

type Fam = 'ucs' | 'dr' | 'water' | 'cone' | 'sat'
const FAMILIES: { v: Fam; label: string }[] = [
  { v: 'ucs', label: 'Specimen (inch, g)' },
  { v: 'dr', label: 'Relative density' },
  { v: 'water', label: 'Adding water' },
  { v: 'sat', label: 'Saturated soil' },
  { v: 'cone', label: 'Sand cone' },
]

const CLS_OPTS = ['Very loose', 'Loose', 'Medium', 'Dense', 'Very dense'].map((v) => ({ v, label: v }))

interface WvP extends ExProblem<Fam> {
  u: UnitSys['key']
  sol?: PhaseSolution
  extra: { label: string; tex: string }[]
}

export function makeWvExam(seed: number, family?: Fam): WvP {
  const r = rng(seed * 104729 + 7)
  const fam = family ?? pick(r, FAMILIES.map((f) => f.v))
  const Gs = rd(2.62 + 0.1 * r(), 2)
  if (fam === 'ucs') {
    const D = pick(r, [1.4, 1.5, 2.0, 2.8])
    const H = 2 * D
    const e0 = 0.4 + 0.45 * r()
    const S0 = r() < 0.5 ? 1 : 0.75 + 0.2 * r()
    const V = cylinderVolume(D, H)
    const Vs = V / (1 + e0)
    const Ws = rd(Gs * Vs, 1)
    const W = rd(Ws + S0 * e0 * Vs, 1)
    const sol = solvePhase({ V, W, Ws, Gs }, 1)
    const v = sol.vals
    const sat = Math.abs(v.S - 1) < 0.005
    return {
      family: fam,
      u: 'g',
      title: '2023-24 Q1(a) type · 20 marks',
      text: `Data from an unconfined compression test on a clay specimen: diameter **${D} in**, height **${H} in**, weight of wet specimen **${W} g**, weight of dry specimen **${Ws} g**, specific gravity **${Gs}**. Determine the moisture content, degree of saturation, moist and dry unit weights (g/cc), void ratio and porosity. Is the moist unit weight equal to the saturated unit weight for this specimen? Comment.`,
      hash: hashKey(`${D}|${W}|${Ws}|${Gs}`),
      sol,
      extra: [{ label: 'Volume', tex: `V = \\dfrac{\\pi}{4}(${D}\\times 2.54)^2(${H}\\times 2.54) = ${nf(V, 5)}\\ \\text{cm}^3` }],
      steps: [
        { key: 'V', group: 'Specimen', label: 'V (cm³)', value: V, unit: 'cm³' },
        { key: 'w', group: 'From the diagram', label: 'w', value: v.w * 100, unit: '%' },
        { key: 'e', group: 'From the diagram', label: 'e', value: v.e, digits: 4 },
        { key: 'n', group: 'From the diagram', label: 'n', value: v.n * 100, unit: '%' },
        { key: 'S', group: 'From the diagram', label: 'S', value: v.S * 100, unit: '%' },
        { key: 'g', group: 'From the diagram', label: 'γ (moist)', value: v.g, unit: 'g/cc', digits: 4 },
        { key: 'gd', group: 'From the diagram', label: 'γd', value: v.gd, unit: 'g/cc', digits: 4 },
        { key: 'sat', group: 'Comment', label: 'γ = γsat?', options: [{ v: 'y', label: 'Yes (S = 100 %)' }, { v: 'n', label: 'No (air present)' }], answer: sat ? 'y' : 'n' },
      ],
    }
  }
  if (fam === 'dr') {
    const kind = pick(r, ['gdn', 'gw', 'rho'] as const)
    if (kind === 'gw') {
      const emin = rd(0.42 + 0.12 * r(), 2)
      const emax = rd(emin + 0.3 + 0.15 * r(), 2)
      const w = rd(8 + 10 * r(), 1)
      const e0 = emin + (emax - emin) * (0.1 + 0.8 * r())
      const g = rd(((Gs + (w / 100) * Gs) * GW) / (1 + e0), 2)
      const sol = solvePhase({ w: w / 100, g, Gs }, GW)
      const v = sol.vals
      const d = relDensity({ e: v.e, emax, emin })
      return {
        family: fam,
        u: 'kN',
        title: '2017-18 Q5(b) type · 15 marks',
        text: `A sand above the water table has a moisture content of **${w} %** and a unit weight of **${g} kN/m³**. Laboratory tests on a dry sample gave e_min = **${emin}** and e_max = **${emax}**. Compute the degree of saturation and the relative density (Gs = **${Gs}**). What will be the saturated unit weight of this sand in the field?`,
        hash: hashKey(`gw|${w}|${g}|${emin}|${emax}|${Gs}`),
        sol,
        extra: [{ label: 'Dr', tex: `D_r = \\dfrac{${emax} - ${nf(v.e)}}{${emax} - ${emin}} = ${nf(d.pct)}\\%\\ \\Rightarrow\\ \\text{${d.cls}}` }],
        steps: [
          { key: 'e', group: 'Phase diagram', label: 'e', value: v.e, digits: 4 },
          { key: 'S', group: 'Phase diagram', label: 'S', value: v.S * 100, unit: '%' },
          { key: 'Dr', group: 'Relative density', label: 'Dr', value: d.pct, unit: '%' },
          { key: 'cls', group: 'Relative density', label: 'state (slide scale)', options: CLS_OPTS, answer: d.cls },
          { key: 'gsat', group: 'Saturated', label: 'γsat', value: v.gsat, unit: 'kN/m³' },
        ],
      }
    }
    const rho = kind === 'rho'
    const gmin = rho ? rd(1.2 + 0.25 * r(), 2) : rd(13 + 2.5 * r(), 2)
    const gmax = rho ? rd(gmin + 0.3 + 0.3 * r(), 2) : rd(gmin + 3 + 3 * r(), 2)
    const gw = rho ? 1 : GW
    const emax = (Gs * gw) / gmin - 1
    const emin = (Gs * gw) / gmax - 1
    const e0 = emin + (emax - emin) * (0.1 + 0.8 * r())
    const n = Math.round((100 * e0) / (1 + e0))
    const d = relDensity({ n: n / 100, gdMin: gmin, gdMax: gmax, Gs, gw })
    const un = rho ? 't/m³' : 'kN/m³'
    return {
      family: fam,
      u: rho ? 't' : 'kN',
      title: rho ? '2016-17 Q1(a)(iii) type · 10 marks' : '2007-08 Q5(c) type · 15 marks',
      text: rho
        ? `The in-situ porosity of a sand deposit is **${n} %**. The maximum and minimum dry densities from laboratory tests are **${gmax} t/m³** and **${gmin} t/m³**. Determine the density index (Gs = **${Gs}**) and indicate the state of compaction of the deposit.`
        : `The dry unit weights of a sand in the loosest and densest states are **${gmin} kN/m³** and **${gmax} kN/m³**. Determine the relative density of the sand at a porosity of **${n} %**. Comment on the result. Gs = **${Gs}**.`,
      hash: hashKey(`${kind}|${gmin}|${gmax}|${n}|${Gs}`),
      extra: [
        { label: 'e_max', tex: `e_{\\max} = \\dfrac{G_s\\gamma_w}{\\gamma_{d\\min}} - 1 = \\dfrac{${Gs}\\times ${nf(gw)}}{${gmin}} - 1 = ${nf(d.emax)}\\ \\ (${un})` },
        { label: 'e_min', tex: `e_{\\min} = \\dfrac{${Gs}\\times ${nf(gw)}}{${gmax}} - 1 = ${nf(d.emin)}` },
        { label: 'e', tex: `e = \\dfrac{n}{1-n} = \\dfrac{${n / 100}}{${rd(1 - n / 100, 2)}} = ${nf(d.e)}` },
        { label: 'Dr', tex: `D_r = \\dfrac{${nf(d.emax)} - ${nf(d.e)}}{${nf(d.emax)} - ${nf(d.emin)}} = ${nf(d.pct)}\\%\\ \\Rightarrow\\ \\text{${d.cls}}${d.cls !== d.clsLambe ? `\\ (\\text{${d.clsLambe} on the 15/35/65/85 scale})` : ''}` },
      ],
      steps: [
        { key: 'emax', group: 'Limits', label: 'e_max (from γd,min)', value: d.emax, digits: 4 },
        { key: 'emin', group: 'Limits', label: 'e_min (from γd,max)', value: d.emin, digits: 4 },
        { key: 'e', group: 'In situ', label: 'e = n/(1 − n)', value: d.e, digits: 4 },
        { key: 'Dr', group: 'Relative density', label: 'Dr', value: d.pct, unit: '%' },
        { key: 'cls', group: 'Relative density', label: 'state (slide scale)', options: CLS_OPTS, answer: d.cls },
      ],
    }
  }
  if (fam === 'water') {
    const V = pick(r, [100, 120, 150, 200])
    const rho = rd(1.85 + 0.2 * r(), 2)
    const w1 = Math.round(6 + 6 * r())
    const w2 = w1 + pick(r, [2, 3, 4])
    const w3 = w2 + 1
    const sol = solvePhase({ V, g: rho, w: w1 / 100, Gs }, 1)
    const v = sol.vals
    const add = waterToRaise(v.Ws, w1 / 100, w2 / 100, 1)
    const S3 = ((w3 / 100) * Gs) / v.e
    const Vsat = 100
    const toSat = waterToSaturate(Vsat, v.e)
    return {
      family: fam,
      u: 't',
      title: '2011-12 Q7(b) type · 18 marks',
      text: `A natural soil of **${V} m³** with Gs = **${Gs}** has a mass density of **${rho} t/m³** at a water content of **${w1} %**. (i) Calculate the volume of water to add to raise the water content to **${w2} %**. (ii) What will the degree of saturation be at **${w3} %**? (iii) Calculate the volume of water needed to make **${Vsat} m³** of the dry soil fully saturated.`,
      hash: hashKey(`w|${V}|${rho}|${w1}|${w2}|${Gs}`),
      sol,
      extra: [
        { label: '(i)', tex: `\\Delta V_w = \\dfrac{M_s(w_2 - w_1)}{\\rho_w} = ${nf(v.Ws)}\\times(${w2 / 100} - ${w1 / 100}) = ${nf(add)}\\ \\text{m}^3` },
        { label: '(ii)', tex: `S = \\dfrac{wG_s}{e} = \\dfrac{${w3 / 100}\\times ${Gs}}{${nf(v.e)}} = ${nf(S3 * 100)}\\%\\ \\text{(e unchanged)}` },
        { label: '(iii)', tex: `V_v = V\\dfrac{e}{1+e} = ${Vsat}\\times\\dfrac{${nf(v.e)}}{${nf(1 + v.e)}} = ${nf(toSat)}\\ \\text{m}^3` },
      ],
      steps: [
        { key: 'gd', group: 'Phase diagram', label: 'ρd', value: v.gd, unit: 't/m³', digits: 4 },
        { key: 'e', group: 'Phase diagram', label: 'e', value: v.e, digits: 4 },
        { key: 'add', group: 'Answers', label: '(i) water to add', value: add, unit: 'm³' },
        { key: 'S3', group: 'Answers', label: `(ii) S at ${w3} %`, value: S3 * 100, unit: '%' },
        { key: 'sat', group: 'Answers', label: '(iii) water to saturate', value: toSat, unit: 'm³' },
      ],
    }
  }
  if (fam === 'sat') {
    const gd = Math.round(95 + 20 * r())
    const w = rd(16 + 12 * r(), 1)
    const sol = solvePhase({ gd, w: w / 100, S: 1 }, 62.4)
    const v = sol.vals
    return {
      family: fam,
      u: 'lb',
      title: 'Das Ex. 3.4 type',
      text: `A saturated soil has a dry unit weight of **${gd} lb/ft³** and a moisture content of **${w} %**. Determine (a) γsat, (b) Gs, (c) e — on the phase diagram, without derived formulas.`,
      hash: hashKey(`s|${gd}|${w}`),
      sol,
      extra: [],
      steps: [
        { key: 'gsat', group: 'Answers', label: 'γsat', value: v.gsat, unit: 'pcf' },
        { key: 'Gs', group: 'Answers', label: 'Gs', value: v.Gs, digits: 4 },
        { key: 'e', group: 'Answers', label: 'e', value: v.e, digits: 4 },
      ],
    }
  }
  // sand cone
  const W1 = rd(7 + r(), 2)
  const W4 = rd(W1 - 2.6 - 0.6 * r(), 2)
  const Wc = rd(0.5 + 0.1 * r(), 3)
  const rs = Math.round(1550 + 50 * r())
  const W2 = rd(2.8 + 0.6 * r(), 3)
  const w = rd(8 + 6 * r(), 1)
  const gmax = Math.round(1900 + 150 * r())
  const c = sandCone({ W1, W4, Wc, gdSand: rs, W2, w: w / 100, gdMax: gmax })
  return {
    family: 'cone',
    u: 'kg',
    title: 'Sand cone (2023-24 Q5(a) / 2021-22 Q4(b) method)',
    text: `A sand-cone test in the field gave: jar + cone + sand before **${W1} kg**, after **${W4} kg**; sand to fill the cone alone **${Wc} kg**; dry density of the Ottawa sand **${rs} kg/m³**; moist soil from the hole **${W2} kg** at w = **${w} %**. Lab maximum dry density **${gmax} kg/m³**. Find the hole volume, field dry density and relative compaction.`,
    hash: hashKey(`c|${W1}|${W4}|${Wc}|${rs}|${W2}|${w}`),
    extra: [
      { label: 'W5', tex: `W_5 = W_1 - W_4 = ${W1} - ${W4} = ${nf(c.W5)}\\ \\text{kg}` },
      { label: 'V', tex: `V = \\dfrac{W_5 - W_c}{\\rho_{d(sand)}} = \\dfrac{${nf(c.W5)} - ${Wc}}{${rs}} = ${nf(c.V * 1000)}\\times10^{-3}\\ \\text{m}^3` },
      { label: 'W3', tex: `W_3 = \\dfrac{W_2}{1+w} = \\dfrac{${W2}}{${rd(1 + w / 100, 3)}} = ${nf(c.W3)}\\ \\text{kg}` },
      { label: 'ρd', tex: `\\rho_d = W_3/V = ${nf(c.gd)}\\ \\text{kg/m}^3,\\quad R = ${nf(c.gd)}/${gmax} = ${nf(c.RC * 100)}\\%` },
    ],
    steps: [
      { key: 'V', group: 'Hole', label: 'V (×10⁻³ m³)', value: c.V * 1000, digits: 4 },
      { key: 'gd', group: 'Field density', label: 'ρd', value: c.gd, unit: 'kg/m³' },
      { key: 'RC', group: 'Field density', label: 'relative compaction', value: c.RC * 100, unit: '%' },
    ],
  }
}

function Solution({ p }: { p: WvP }) {
  const u = unitSys(p.u)
  return (
    <div className="space-y-2 text-sm">
      {p.extra
        .filter((x) => p.family === 'ucs' && x.label === 'Volume')
        .map((x) => (
          <Tex key={x.label} block>
            {x.tex}
          </Tex>
        ))}
      {p.sol && p.sol.status === 'ok' && <PhaseStepsView steps={p.sol.steps} u={u} />}
      {p.extra
        .filter((x) => !(p.family === 'ucs' && x.label === 'Volume'))
        .map((x) => (
          <div key={x.label} className="overflow-x-auto">
            <Tex block>{x.tex}</Tex>
          </div>
        ))}
      {p.family === 'ucs' && p.sol && (
        <Md>{`**Comment:** S = ${nf(p.sol.vals.S * 100)} %. ${Math.abs(p.sol.vals.S - 1) < 0.005 ? 'The voids are full of water (Va ≈ 0), so the moist unit weight **equals** γsat for this specimen.' : `There is air in the voids, so γ < γsat = (Ws + γwVv)/V = ${nf(p.sol.vals.gsat)} g/cc.`}`}</Md>
      )}
      {p.family === 'dr' && <Md>{`Dense and very dense sands (Dr above 70 %) are "good for EQ" (slide 28); a loose sand settles and may liquefy under shaking.`}</Md>}
    </div>
  )
}

export function WvExams() {
  return <ExamSet topic="sm-wv" families={FAMILIES} make={makeWvExam} solution={(p) => <Solution p={p} />} foot="γw = 9.81 kN/m³ (62.4 pcf, 1 g/cc, 1 t/m³). Answers within 2 %." />
}
