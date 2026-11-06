// Exam-style consolidation problems: seeded, step checks, engine solution on reveal (CE 315's DesignProblems shell).
import { fmt } from '../../../components/DiagramView'
import { Md, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { DesignProblems, type DProblem, type DStep, type Level } from '../../../rc/topics/tbeam/designShell'
import { eFromTable, sandDrain, settleDe, settleProfile, tvBy, tvFromTable, uApprox, type SettleIn } from '../../engine/consolidation'
import { GW } from '../../engine/units'
import { ProfileFig } from './figs'
import { CONSOL_FAMILIES, randomProfile, type ConsolFamily } from './gen'
import { SettleSolution } from './Solution'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
const BR = [
  { v: 'nc', label: 'NC' },
  { v: 'recomp', label: 'OC, below pc′' },
  { v: 'cross', label: 'OC, crosses pc′' },
]

type Extra =
  | { kind: 'profile'; inp: SettleIn; out: ReturnType<typeof settleProfile> }
  | { kind: 'table'; o: TableO; r: TableR }
  | { kind: 'rate'; lines: string[] }
  | { kind: 'drain'; lines: string[] }
export interface CProblem extends DProblem<ConsolFamily> {
  x: Extra
}

interface TableO {
  D: number
  sand: number
  wt: number
  g1: number
  g2: number
  gc: number
  Hc: number
  q: number
  ps: number[]
  es: number[]
  tLab: number
  hLab: number
  rock: boolean
  tAsk: number
}
function solveTable(o: TableO) {
  const z = o.sand + o.Hc / 2
  const dp = (o.q * o.D * o.D) / (o.D + z) ** 2
  const p0 = o.wt * o.g1 + (o.sand - o.wt) * (o.g2 - GW) + (o.Hc / 2) * (o.gc - GW)
  const e0 = eFromTable(o.ps, o.es, p0)
  const e1 = eFromTable(o.ps, o.es, p0 + dp)
  const S = settleDe(e0 - e1, o.Hc, e0)
  const dF = o.rock ? o.Hc : o.Hc / 2
  const tF = o.tLab * ((dF * 1000) / (o.hLab / 2)) ** 2 // min
  const cv = (0.848 * (o.hLab / 2000) ** 2) / (o.tLab * 60) // m²/s
  const Tv = (cv * o.tAsk * 365 * 86400) / (dF * dF)
  const U = uApprox(Tv)
  return { z, dp, p0, e0, e1, S, dF, tF, tYr: tF / (60 * 24 * 365), cv, Tv, U, St: (U / 100) * S }
}
type TableR = ReturnType<typeof solveTable>

export function makeConsolProblem(seed: number, family?: ConsolFamily, level: Level = 'exam'): CProblem {
  const r = rng(seed * 7 + 11)
  const fam = family ?? pick(r, CONSOL_FAMILIES.map((f) => f.v))
  const title = CONSOL_FAMILIES.find((f) => f.v === fam)!.label
  if (fam === 'fill' || fam === 'footing') {
    const g = randomProfile(seed * 3 + 1, fam, level)
    const out = settleProfile(g.inp)
    const steps: DStep[] = []
    out.layers.forEach((L, i) => {
      const s = L.subs[0]
      const tag = out.layers.length > 1 ? ` (clay ${i + 1})` : ''
      const l = g.inp.layers[L.layer]
      if (i === 0) {
        steps.push({ key: 'e0', group: 'Clay properties', label: 'e0 = wGs', value: l.e0!, digits: 4, abs: 0.003 })
        steps.push({ key: 'cc', group: 'Clay properties', label: 'Cc = 0.009(LL − 10)', value: l.Cc!, digits: 4, abs: 0.002 })
        steps.push({ key: 'gs', group: 'Clay properties', label: 'γsat of the clay', value: l.gammaSat, unit: 'kN/m³', abs: 0.05 })
      }
      steps.push({ key: `p0${i}`, group: 'Stresses at mid-depth', label: `p0′${tag}`, value: s.p0, unit: 'kPa', abs: 0.3 })
      steps.push({ key: `dp${i}`, group: 'Stresses at mid-depth', label: `Δp${g.inp.avg === 'simpson' ? ' (Simpson)' : ''}${tag}`, value: s.dp, unit: 'kPa', abs: 0.2 })
      if (s.pc) steps.push({ key: `br${i}`, group: 'Stresses at mid-depth', label: `branch${tag}`, options: BR, answer: s.branch })
      steps.push({ key: `S${i}`, group: 'Settlement', label: `S${tag}`, value: L.S * 1000, unit: 'mm', abs: 0.5 })
    })
    if (out.layers.length > 1) steps.push({ key: 'S', group: 'Settlement', label: 'total S', value: out.S * 1000, unit: 'mm', abs: 0.5 })
    return { family: fam, level, title, text: g.story, hash: hashKey(JSON.stringify(g.inp)), steps, x: { kind: 'profile', inp: g.inp, out } }
  }
  if (fam === 'table') {
    const D = randInt(r, 4, 8)
    const sand = randInt(r, 8, 12) / 2
    const o: TableO = {
      D,
      sand,
      wt: 1.5,
      g1: randInt(r, 180, 195) / 10,
      g2: randInt(r, 200, 212) / 10,
      gc: randInt(r, 190, 200) / 10,
      Hc: pick(r, [1.6, 2, 2.4, 3]),
      q: randInt(r, 15, 30) * 10,
      ps: [50, 100, 200, 300, 400],
      es: pick(r, [
        [0.73, 0.68, 0.625, 0.58, 0.54],
        [0.73, 0.68, 0.63, 0.58, 0.54],
        [0.82, 0.76, 0.69, 0.645, 0.61],
      ]),
      tLab: randInt(r, 60, 150),
      hLab: 20,
      rock: level === 'basic' ? true : r() < 0.6,
      tAsk: randInt(r, 2, 8) / 2,
    }
    const s = solveTable(o)
    const steps: DStep[] = [
      { key: 'z', group: 'Δp in the clay (1H:2V)', label: 'z to the clay mid-depth', value: s.z, unit: 'm', abs: 0.01 },
      { key: 'dp', group: 'Δp in the clay (1H:2V)', label: 'Δp = qD²/(D + z)²', value: s.dp, unit: 'kPa', abs: 0.2 },
      { key: 'p0', group: 'Void ratios (log interpolation)', label: 'p0′ at mid-clay', value: s.p0, unit: 'kPa', abs: 0.2 },
      { key: 'e0', group: 'Void ratios (log interpolation)', label: 'e0 at p0′', value: s.e0, digits: 4, abs: 0.0015 },
      { key: 'e1', group: 'Void ratios (log interpolation)', label: 'e1 at p0′ + Δp', value: s.e1, digits: 4, abs: 0.0015 },
      { key: 'S', group: 'Settlement and time', label: 'S = ΔeH/(1 + e0)', value: s.S * 1000, unit: 'mm', abs: 0.6 },
      { key: 't', group: 'Settlement and time', label: 'field t90', value: s.tYr, unit: 'years', abs: 0.02 },
    ]
    if (level !== 'basic') steps.push({ key: 'St', group: 'Settlement and time', label: `settlement after ${o.tAsk} years`, value: s.St * 1000, unit: 'mm', abs: 0.6 })
    const text = `A rigid circular foundation ${D} m in diameter rests on the surface of ${f2(sand)} m of compact sand, below which lies ${f2(o.Hc)} m of clay ${o.rock ? 'on impervious rock' : 'over dense sand'}. GWT 1.5 m below GL; sand γ = ${o.g1} kN/m³ above and ${o.g2} kN/m³ below the GWT; clay γsat = ${o.gc} kN/m³. A ${o.hLab} mm specimen (drained top and bottom) gave p = 50, 100, 200, 300, 400 kPa → e = ${o.es.join(', ')}. The foundation applies ${o.q} kPa. (i) Settlement of the clay (load spread 1H:2V). (ii) The specimen reached 90 % in ${o.tLab} min: time for 90 % in the field.${level !== 'basic' ? ` (iii) Settlement after ${o.tAsk} years.` : ''}`
    return { family: fam, level, title, text, hash: hashKey(JSON.stringify(o)), steps, x: { kind: 'table', o, r: s } }
  }
  if (fam === 'rate') {
    const H = randInt(r, 3, 10)
    const way = pick(r, ['one', 'two'] as const)
    const d = way === 'two' ? H / 2 : H
    const S = randInt(r, 10, 50) * 10
    const t1 = randInt(r, 5, 30) * 10
    const U1 = pick(r, [10, 20, 30, 40])
    const U2 = pick(r, [50, 60, 70, 80, 90].filter((u) => u > U1))
    const Tv1 = tvFromTable(U1)
    const Tv2 = tvFromTable(U2)
    const t2 = (t1 * Tv2) / Tv1
    const cv = (Tv1 * d * d) / t1
    const U3 = randInt(r, 13, 17) * 5
    const t3 = (tvBy(U3, 'table') * (H / (way === 'two' ? 1 : 2)) ** 2) / cv
    const steps: DStep[] = [
      { key: 'u1', group: 'From the observation', label: 'U at the observed time', value: U1, unit: '%', abs: 0.1 },
      { key: 'cv', group: 'From the observation', label: 'cv', value: cv, unit: 'm²/day', digits: 5, abs: 1e-5, tol: 0.02 },
      { key: 't2', group: 'Asked', label: `time for ${(U2 / 100) * S} mm`, value: t2, unit: 'days', abs: 1 },
      { key: 't3', group: 'Asked', label: `time for ${U3} % with ${way === 'two' ? 'one-way' : 'two-way'} drainage`, value: t3, unit: 'days', abs: 1 },
    ]
    const text = `After construction a building settled ${(U1 / 100) * S} mm in ${t1} days due to consolidation of a ${H} m clay layer drained ${way === 'two' ? 'top and bottom' : 'at the top only'}. The final consolidation settlement is ${S} mm. Find (i) cv, (ii) the time for ${(U2 / 100) * S} mm, (iii) the time for ${U3} % consolidation had the layer drained ${way === 'two' ? 'at the top only' : 'on both sides'}. Use the printed Tv table (interpolate linearly).`
    const lines = [
      String.raw`d = ${f2(d)}\ \text{m};\ U_1 = ${(U1 / 100) * S}/${S} = ${U1}\% \Rightarrow T_{v1} = ${Tv1};\ c_v = T_vd^2/t = ${Tv1}(${f2(d)})^2/${t1} = ${fmt(cv, 5)}\ \text{m}^2/\text{day}`,
      String.raw`U_2 = ${U2}\% \Rightarrow T_{v2} = ${Tv2};\ \text{same layer: } t_2 = t_1 T_{v2}/T_{v1} = ${t1}(${Tv2})/${Tv1} = ${f2(t2)}\ \text{days}`,
      String.raw`U = ${U3}\% \Rightarrow T_v = ${f4(tvBy(U3, 'table'))}\ (\text{table});\ d' = ${f2(way === 'two' ? H : H / 2)}\ \text{m};\ t = ${f4(tvBy(U3, 'table'))}(${f2(way === 'two' ? H : H / 2)})^2/${fmt(cv, 5)} = ${f2(t3)}\ \text{days}`,
    ]
    return { family: fam, level, title, text, hash: hashKey(text), steps, x: { kind: 'rate', lines } }
  }
  // sand drains
  const H = randInt(r, 5, 15)
  const sp = randInt(r, 8, 16) / 4
  const pat = pick(r, ['square', 'triangular'] as const)
  const rw = pick(r, [0.1, 0.15, 0.2, 0.25])
  const imperv = r() < 0.6
  const Uv0 = pick(r, [15, 20, 25, 30, 40])
  const cv = randInt(r, 5, 30) / 10
  const dv = imperv ? H : H / 2
  const t = (tvBy(Uv0, 'approx') * dv * dv) / cv
  const s = sandDrain({ s: sp, pattern: pat, rw, cv, t, dv, tv: 'approx' })
  const steps: DStep[] = [
    { key: 'tv', group: 'Vertical', label: 'Tv', value: s.Tv, digits: 4, abs: 0.001 },
    { key: 'de', group: 'Radial', label: 'de', value: s.de, unit: 'm', abs: 0.003 },
    { key: 'n', group: 'Radial', label: 'n = re/rw', value: s.n, abs: 0.03 },
    { key: 'tr', group: 'Radial', label: 'Tr', value: s.Tr, digits: 4, abs: 0.002 },
    { key: 'ur', group: 'Radial', label: 'Ur (Barron)', value: 100 * s.Ur, unit: '%', abs: 1 },
    { key: 'u', group: 'Combined', label: 'U', value: 100 * s.U, unit: '%', abs: 1 },
  ]
  const text = `Soft clay ${H} m thick ${imperv ? 'rests on an impermeable base' : 'lies between two sand layers'}. Sand drains ${rw * 200} cm in diameter are installed in a ${pat} pattern at ${f2(sp)} m spacing. Find the average degree of consolidation with the drains at the time when, without drains, U would be ${Uv0} %. Soil isotropic (cvr = cv). Use Barron's chart (equal strain, no smear).`
  const lines = [
    String.raw`\text{Vertical: } d = ${f2(dv)}\ \text{m},\ U_v = ${Uv0}\% \Rightarrow T_v = \tfrac{\pi}{4}(${f2(Uv0 / 100)})^2 = ${f4(s.Tv)}`,
    String.raw`d_e = ${pat === 'square' ? '1.128' : '1.05'}(${f2(sp)}) = ${f3(s.de)}\ \text{m},\ r_e = ${f3(s.re)},\ n = ${f3(s.re)}/${rw} = ${f2(s.n)},\ F(n) = ${f3(s.F)}`,
    String.raw`\text{same } t,\ c_{vr} = c_v:\ T_r = T_v(d/d_e)^2 = ${f4(s.Tv)}(${f2(dv)}/${f3(s.de)})^2 = ${f4(s.Tr)} \Rightarrow U_r = 1 - e^{-8T_r/F(n)} = ${f2(100 * s.Ur)}\%`,
    String.raw`U = 1 - (1 - ${f2(Uv0 / 100)})(1 - ${f3(s.Ur)}) = ${f2(100 * s.U)}\%`,
  ]
  return { family: 'drain', level, title, text, hash: hashKey(text), steps, x: { kind: 'drain', lines } }
}

function TableSolution({ o, r }: { o: TableO; r: TableR }) {
  return (
    <div className="space-y-1 text-sm">
      <Tex block>{String.raw`z = ${f2(o.sand)} + ${f2(o.Hc / 2)} = ${f2(r.z)}\ \text{m};\quad \Delta p = q\frac{D^2}{(D+z)^2} = ${o.q}\frac{${o.D}^2}{${f2(o.D + r.z)}^2} = ${f2(r.dp)}\ \text{kPa}`}</Tex>
      <Tex block>{String.raw`p_0' = 1.5(${o.g1}) + ${f2(o.sand - 1.5)}(${o.g2} - 9.81) + ${f2(o.Hc / 2)}(${o.gc} - 9.81) = ${f2(r.p0)};\quad p_1 = ${f2(r.p0 + r.dp)}\ \text{kPa}`}</Tex>
      <Tex block>{String.raw`e_0 = ${f4(r.e0)},\ e_1 = ${f4(r.e1)}\ (\text{log interpolation in the table: } e = e_i - \Delta e_i\frac{\log(p/p_i)}{\log(p_{i+1}/p_i)})`}</Tex>
      <Tex block>{String.raw`S = \frac{\Delta e\,H}{1+e_0} = \frac{${f4(r.e0 - r.e1)}(${f2(o.Hc * 1000)})}{1 + ${f4(r.e0)}} = ${fmt(r.S * 1000, 1)}\ \text{mm}`}</Tex>
      <Tex block>{String.raw`d_{lab} = ${o.hLab / 2}\ \text{mm},\ d_f = ${f2(r.dF * 1000)}\ \text{mm}\ (${o.rock ? '\\text{rock below: one-way}' : '\\text{sand both sides: two-way}'});\ t_f = ${o.tLab}\left(\frac{${f2(r.dF * 1000)}}{${o.hLab / 2}}\right)^2 = ${fmt(r.tF, 0)}\ \text{min} = ${f2(r.tYr)}\ \text{yr}`}</Tex>
      <Tex block>{String.raw`c_v = \frac{0.848(${o.hLab / 2000})^2}{${o.tLab}(60)} = ${r.cv.toExponential(3)}\ \text{m}^2/\text{s};\ T_v(${o.tAsk}\ \text{yr}) = ${f4(r.Tv)} \Rightarrow U = ${f2(r.U)}\% \Rightarrow S_t = ${fmt(r.St * 1000, 1)}\ \text{mm}`}</Tex>
    </div>
  )
}

export function ConsolProblems() {
  return (
    <DesignProblems
      topic="sm-consol"
      families={CONSOL_FAMILIES}
      make={makeConsolProblem}
      figure={(p) =>
        p.x.kind === 'profile' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <ProfileFig inp={p.x.inp} out={null} />
            </div>
          </div>
        ) : (
          <div className="text-xs text-faint">No figure: sketch the profile yourself (it earns marks).</div>
        )
      }
      solution={(p) =>
        p.x.kind === 'profile' ? (
          <SettleSolution inp={p.x.inp} out={p.x.out} />
        ) : p.x.kind === 'table' ? (
          <TableSolution o={p.x.o} r={p.x.r} />
        ) : (
          <div className="space-y-1">
            {p.x.lines.map((l, i) => (
              <Tex key={i} block>
                {l}
              </Tex>
            ))}
            <Md className="text-xs text-faint">{p.x.kind === 'rate' ? 'Table values interpolated linearly, as the handnote does; the formulas give slightly different times — either is accepted if stated.' : "Chart reading: pick the n curve nearest to yours (or interpolate); the formula is Barron's equal-strain solution."}</Md>
          </div>
        )
      }
      sub="A full exam-style problem from the paper families: work it on paper (sketch the profile), check each step, then open the solution."
      foot="γw = 9.81 kN/m³; log = log10; Tv–U from the printed table unless stated."
    />
  )
}
