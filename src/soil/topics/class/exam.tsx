// Classification exam-style problems: sieve analysis, two soils by USCS, AASHTO + GI, both systems from % passing,
// USDA with gravel, back-calculated D's (2009-10).
import { Md } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { aashto, ccOf, cuOf, fromCuCc, gradeOf, grading, sieveAnalysis, sieveName, usda, uscs, type GradPt } from '../../engine/classify'
import { nf } from '../../engine/phase'
import { ExamSet, rd, type ExProblem } from '../wv/ExamSet'
import { GradingCurve } from './figs'
import { aGroupOptions, symbolOptions } from './Lab'

type Fam = 'sieve' | 'uscs2' | 'aashto' | 'both' | 'usda' | 'back'
const FAMILIES: { v: Fam; label: string }[] = [
  { v: 'sieve', label: 'Sieve analysis' },
  { v: 'uscs2', label: 'USCS, two soils' },
  { v: 'aashto', label: 'AASHTO + GI' },
  { v: 'both', label: 'Both systems' },
  { v: 'usda', label: 'USDA' },
  { v: 'back', label: 'D’s from Cu, Cc' },
]

interface CP extends ExProblem<Fam> {
  curve?: GradPt[]
  D?: { D10: number; D30: number; D60: number }
  sol: string
}

const opt = (xs: string[]) => xs.map((v) => ({ v, label: v }))
const fmtSteps = (xs: { text: string }[]) => xs.map((s, i) => `${i + 1}. ${s.text}`).join('\n')

export function makeClassExam(seed: number, family?: Fam): CP {
  const r = rng(seed * 6007 + 3)
  const fam = family ?? pick(r, FAMILIES.map((f) => f.v))
  if (fam === 'sieve') {
    const ds = [4.75, 2.0, 0.85, 0.425, 0.25, 0.18, 0.15, 0.075]
    const shape = pick(r, ['uniform', 'wide'] as const)
    const masses = ds.map((d, i) => (i === 0 ? 0 : shape === 'uniform' ? Math.round((d < 0.3 && d > 0.1 ? 120 : 30) + 90 * r()) : Math.round(40 + 70 * r())))
    const pan = Math.round(4 + 16 * r())
    const sa = sieveAnalysis(
      ds.map((d, i) => ({ d, ret: masses[i] })),
      pan,
    )
    const g = grading(sa.pts)
    const gw = gradeOf(g.Cu, g.Cc, 'S')
    return {
      family: fam,
      title: '2023-24 Q4(a) type · 26⅔ marks',
      text: 'Results of a sieve analysis:',
      table: { head: ['Sieve', 'Opening (mm)', 'Mass retained (g)'], rows: [...ds.map((d, i) => [sieveName(d), d, masses[i]]), ['Pan', '—', pan]] },
      after: 'Draw the particle-size distribution curve on semi-log paper and determine (i) % gravel, % sand and % fines by AASHTO and by USCS; (ii) Cu and Cc; (iii) is the soil well graded, poorly graded or gap graded? Comment.',
      hash: hashKey(JSON.stringify(masses) + pan),
      curve: sa.pts,
      D: g,
      sol: `Total = ${sa.total} g. % finer: ${sa.lines.map((l) => `${sieveName(l.d)} ${nf(l.pf, 4)}`).join(', ')}.\n\n(i) USCS (4.75 / 0.075 mm): gravel ${nf(g.uscs.gravel, 4)} %, sand ${nf(g.uscs.sand, 4)} %, fines ${nf(g.uscs.fines, 4)} %. AASHTO (2.0 / 0.075 mm): gravel ${nf(g.aashto.gravel, 4)} %, sand ${nf(g.aashto.sand, 4)} %, silt-clay ${nf(g.aashto.siltClay, 4)} %.\n\n(ii) Log interpolation on the curve: D10 = ${nf(g.D10, 3)}, D30 = ${nf(g.D30, 3)}, D60 = ${nf(g.D60, 3)} mm → $C_u = ${nf(g.Cu, 4)}$, $C_c = ${nf(g.Cc, 4)}$.\n\n(iii) ${gw.comment}.`,
      steps: [
        { key: 'p200', group: '% finer', label: '% finer No. 200', value: g.P200, unit: '%', abs: 0.1 },
        { key: 'p40', group: '% finer', label: '% finer No. 40', value: g.P40, unit: '%', abs: 0.1 },
        { key: 'ag', group: 'Fractions', label: 'AASHTO gravel', value: g.aashto.gravel, unit: '%', abs: 0.15 },
        { key: 'us', group: 'Fractions', label: 'USCS sand', value: g.uscs.sand, unit: '%', abs: 0.15 },
        { key: 'D10', group: 'Grading', label: 'D10 (mm)', value: g.D10, digits: 4, tol: 0.04 },
        { key: 'D60', group: 'Grading', label: 'D60 (mm)', value: g.D60, digits: 4, tol: 0.04 },
        { key: 'Cu', group: 'Grading', label: 'Cu', value: g.Cu, tol: 0.05 },
        { key: 'Cc', group: 'Grading', label: 'Cc', value: g.Cc, tol: 0.05 },
        { key: 'gr', group: 'Grading', label: 'grading', options: [{ v: 'W', label: 'well graded' }, { v: 'P', label: 'poorly graded' }], answer: gw.letter },
      ],
    }
  }
  if (fam === 'uscs2') {
    const FA = rd(85 + 12 * r(), 0)
    const LLA = rd(45 + 20 * r(), 0)
    const PIA = rd(0.73 * (LLA - 20) + pick(r, [-1, 1]) * (3 + 6 * r()), 0)
    const F4 = rd(88 + 8 * r(), 0)
    const FB = rd(6 + 6 * r(), 0)
    const D60 = rd(1.2 + 1.2 * r(), 1)
    const D10 = rd(0.05 + 0.05 * r(), 2)
    const D30 = rd(Math.sqrt((0.8 + 2 * r()) * D60 * D10), 2)
    const LLB = rd(30 + 12 * r(), 0)
    const PIB = rd(0.73 * (LLB - 20) + pick(r, [-1, 1]) * (2 + 4 * r()), 0)
    const A = uscs({ F200: FA, F4: 100, LL: LLA, PL: LLA - PIA })
    const B = uscs({ F200: FB, F4, LL: LLB, PL: LLB - PIB, Cu: cuOf(D60, D10), Cc: ccOf(D10, D30, D60) })
    return {
      family: fam,
      title: '2020-21 Q6(a) / Jan 2021 Q7(a) type · 13–16 marks',
      text: `Classify the following two inorganic soils by the USCS (symbol and name).\n\n- **Soil A:** percent finer No. 200 = ${FA}; LL = ${LLA} %; PL = ${LLA - PIA} %.\n- **Soil B:** percent finer No. 4 = ${F4}; No. 200 = ${FB}; D60 = ${D60} mm, D30 = ${D30} mm, D10 = ${D10} mm; LL and PL of the fines = ${LLB} % and ${LLB - PIB} %.`,
      hash: hashKey(`${FA}|${LLA}|${PIA}|${F4}|${FB}|${D60}|${D30}|${D10}|${LLB}|${PIB}`),
      sol: `**Soil A**\n${fmtSteps(A.steps)}\n\n**Soil B**\n${fmtSteps(B.steps)}`,
      steps: [
        { key: 'a', group: 'Soil A', label: 'symbol', options: opt(symbolOptions(A.symbol)), answer: A.symbol },
        { key: 'cu', group: 'Soil B', label: 'Cu', value: cuOf(D60, D10) },
        { key: 'cc', group: 'Soil B', label: 'Cc', value: ccOf(D10, D30, D60) },
        { key: 'b', group: 'Soil B', label: 'symbol', options: opt(symbolOptions(B.symbol)), answer: B.symbol },
      ],
    }
  }
  if (fam === 'aashto') {
    const F = rd(40 + 57 * r(), 0)
    const LL = rd(30 + 35 * r(), 0)
    const PL = rd(Math.max(12, LL - 5 - 30 * r()), 0)
    const a = aashto({ P200: F, LL, PI: LL - PL })
    return {
      family: fam,
      title: '2020-21 Q5(c) / Jan 2021 Q6(b) / 2017-18 Q3(a) type · 7–15 marks',
      text: `Grain-size and Atterberg-limit results for a soil: percent finer No. 200 (0.075 mm) = **${F}**, LL = **${LL} %**, PL = **${PL} %**. Classify the soil by the AASHTO system (the table is attached; the group-index formula is not).`,
      hash: hashKey(`${F}|${LL}|${PL}`),
      sol: fmtSteps(a.steps.map((text) => ({ text }))) + `\n\nAnswer **${a.label}**: ${a.material.toLowerCase()}, ${a.rating.toLowerCase()} as subgrade.`,
      steps: [
        { key: 'g', group: 'Group', label: 'group', options: opt(aGroupOptions(a.group)), answer: a.group },
        ...(a.gi.rule === 'formula' ? [{ key: 't1', group: 'Group index', label: 'LL term', value: a.gi.t1, abs: 0.05 }, { key: 't2', group: 'Group index', label: 'PI term', value: a.gi.t2, abs: 0.05 }] : []),
        { key: 'gi', group: 'Group index', label: 'GI', value: a.gi.gi, abs: 0.4, tol: 0, digits: 0 },
      ],
    }
  }
  if (fam === 'both') {
    const F200 = rd(8 + 40 * r(), 0)
    const F40 = rd(F200 + 10 + 25 * r(), 0)
    const F10 = rd(Math.min(100, F40 + 10 + 25 * r()), 0)
    const F4 = rd(Math.min(100, F10 + 3 + 20 * r()), 0)
    const LL = rd(20 + 30 * r(), 0)
    const PL = rd(LL - 2 - 16 * r(), 0)
    const pts = [
      { d: 4.75, pf: F4 },
      { d: 2.0, pf: F10 },
      { d: 0.425, pf: F40 },
      { d: 0.075, pf: F200 },
    ]
    const g = grading(pts)
    const u = uscs({ F200, F4, LL, PL, Cu: g.Cu, Cc: g.Cc })
    const a = aashto({ P10: F10, P40: F40, P200: F200, LL, PI: LL - PL })
    return {
      family: fam,
      title: '2021-22 Q6(b) / 2015-16 Q5 type · 14–23 marks',
      text: `For an inorganic soil: % passing No. 4 = ${F4}, No. 10 = ${F10}, No. 40 = ${F40}, No. 200 = ${F200}; LL = ${LL}, PL = ${PL}. Classify it by (i) AASHTO and (ii) USCS; give the group symbol and name.`,
      hash: hashKey(`${F4}|${F10}|${F40}|${F200}|${LL}|${PL}`),
      curve: pts,
      D: g,
      sol: `**AASHTO**\n${fmtSteps(a.steps.map((text) => ({ text })))}\n\n**USCS** (D's read from the curve through the four points${Number.isFinite(g.Cu) ? `: Cu = ${nf(g.Cu, 3)}, Cc = ${nf(g.Cc, 3)}` : ''})\n${fmtSteps(u.steps)}`,
      steps: [
        { key: 'a', group: 'AASHTO', label: 'group', options: opt(aGroupOptions(a.group)), answer: a.group },
        { key: 'gi', group: 'AASHTO', label: 'GI', value: a.gi.gi, abs: 0.4, tol: 0, digits: 0 },
        { key: 'u', group: 'USCS', label: 'symbol', options: opt(symbolOptions(u.symbol)), answer: u.symbol },
      ],
    }
  }
  if (fam === 'usda') {
    const g = rd(r() < 0.6 ? 10 + 15 * r() : 0, 0)
    const rest = 100 - g
    const sand = rd(rest * (0.1 + 0.4 * r()), 0)
    const clay = rd((rest - sand) * (0.3 + 0.5 * r()), 0)
    const silt = rest - sand - clay
    const u = usda({ gravel: g, sand, silt, clay })
    const all = ['Clay', 'Silty clay', 'Clay loam', 'Silty clay loam', 'Sandy clay', 'Loam', 'Silt loam', 'Sandy clay loam', 'Sandy loam']
    return {
      family: fam,
      title: 'Das Ex. 5.1 type (USDA)',
      text: `A soil has gravel ${g} %, sand ${sand} %, silt ${silt} %, clay ${clay} %. Classify it by the USDA textural system.`,
      hash: hashKey(`${g}|${sand}|${silt}|${clay}`),
      sol: `${g ? `Modified %: × 100/(100 − ${g}) → sand ${nf(u.sand, 3)}, silt ${nf(u.silt, 3)}, clay ${nf(u.clay, 3)} %.\n\n` : ''}From the triangle: **${u.cls}**${u.gravelly ? ` → with ${g} % gravel, **${u.name}**` : ''}.`,
      steps: [
        ...(g ? [{ key: 'ms', group: 'Modified %', label: 'modified % clay', value: u.clay, abs: 0.15 }] : []),
        { key: 'c', group: 'Class', label: 'triangle class', options: opt(all.includes(u.cls) ? all : [...all, u.cls]), answer: u.cls },
      ],
    }
  }
  // back-calculated D's (2009-10 Q2(a)): 60 % finer than 0.075 mm, so D60 = 0.075 mm
  const F200 = 60
  const Cu = rd(2.5 + 2 * r(), 2)
  const Cc = rd(1 + 1.2 * r(), 2)
  const LL = rd(35 + 20 * r(), 0)
  const PL = rd(12 + 10 * r(), 0)
  const F40 = rd(75 + 10 * r(), 0)
  const d = fromCuCc(0.075, Cu, Cc)
  const a = aashto({ P40: F40, P200: F200, LL, PI: LL - PL })
  return {
    family: 'back',
    title: '2009-10 Q2(a) type · 25 marks',
    text: `Laboratory data: 100 % finer than 4.75 mm; ${F40} % passing No. 40; **${F200} %** finer than 0.075 mm; Cu = **${Cu}**, Cc = **${Cc}**; LL = **${LL}**, PL = **${PL}** (minus No. 40 fraction). Draw the grain-size distribution curve from the available and calculated data, and classify the soil by AASHTO.`,
    hash: hashKey(`${Cu}|${Cc}|${LL}|${PL}|${F40}`),
    curve: [
      { d: 4.75, pf: 100 },
      { d: 0.425, pf: F40 },
      { d: 0.075, pf: 60 },
      { d: d.D30, pf: 30 },
      { d: d.D10, pf: 10 },
    ],
    D: d,
    sol: `60 % is finer than 0.075 mm → D60 = 0.075 mm. $D_{10} = D_{60}/C_u = 0.075/${Cu} = ${nf(d.D10, 4)}$ mm; $D_{30} = \\sqrt{C_cD_{60}D_{10}} = ${nf(d.D30, 4)}$ mm. Plot (4.75, 100), (0.425, ${F40}), (0.075, 60), (${nf(d.D30, 3)}, 30), (${nf(d.D10, 3)}, 10) on semi-log paper.\n\n${fmtSteps(a.steps.map((text) => ({ text })))}`,
    steps: [
      { key: 'D10', group: 'Grading', label: 'D10 (mm)', value: d.D10, digits: 4 },
      { key: 'D30', group: 'Grading', label: 'D30 (mm)', value: d.D30, digits: 4 },
      { key: 'g', group: 'AASHTO', label: 'group', options: opt(aGroupOptions(a.group)), answer: a.group },
      { key: 'gi', group: 'AASHTO', label: 'GI', value: a.gi.gi, abs: 0.4, tol: 0, digits: 0 },
    ],
  }
}

function Solution({ p }: { p: CP }) {
  return (
    <div className="space-y-2 text-sm">
      {p.curve && <GradingCurve curves={[{ pts: p.curve }]} D={p.D} w={500} />}
      <Md>{p.sol}</Md>
    </div>
  )
}

export function ClassExams() {
  return <ExamSet topic="sm-class" families={FAMILIES} make={makeClassExam} solution={(p) => <Solution p={p} />} foot="AASHTO limits compared as whole numbers (M 145). D’s by log interpolation; reading them off your own curve within 4 % is accepted." />
}
