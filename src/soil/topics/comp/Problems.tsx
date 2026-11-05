// Compaction exam-style problems: Proctor curve, field RC check, core-cutter check, borrow volume and payment,
// truck loads, two borrow areas compared. Every number from engine/compaction (via the earthwork runner).

import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { checkSpec, coreCutter, proctorCurve, proctorPeak, satOf, waterToSaturate, zav } from '../../engine/compaction'
import { COUNT, ExamProblems, type Level, type XProblem, type XStep } from '../seep/examShell'
import { EarthworkSolution, runEarthwork, type EW, type SIn, type Src } from './EarthworkLab'
import { CompactionChart, GWU, UNIT_LABEL } from './figs'
import { PeakSolution, randomSet, type PSet } from './ProctorLab'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const big = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 })

export type CFam = 'proctor' | 'field' | 'core' | 'borrow' | 'trucks' | 'compare'
const FAMS: { v: CFam; label: string }[] = [
  { v: 'proctor', label: 'Proctor curve' },
  { v: 'field', label: 'RC check' },
  { v: 'core', label: 'Core cutter vs spec' },
  { v: 'borrow', label: 'Borrow volume / payment' },
  { v: 'trucks', label: 'Truck loads' },
  { v: 'compare', label: 'Two borrow areas' },
]

interface CP extends XProblem<CFam> {
  set?: PSet
  ew?: EW
  field?: { gb: number; w: number; mdd: number; omc: number; rc: number; dw?: number; unit: 'kN' | 'pcf' }
  core?: { D: number; L: number; W: number; wet: number; dry: number; set: PSet; rc: number }
}

const src = (name: string, bank: SIn, p: Partial<Src> = {}): Src => ({ name, bank, looseMode: 'none', bulk: 0, loose: { kind: 'gbw', gb: 11.5, w: 0.06 }, costBasis: 'none', cost: 0, pay: 0, ...p })
const ewBase: EW = { unit: 'kN', fillMode: 'V', V: 1000, top: 2, H: 4, n: 1, L: 1, fill: { kind: 'gd', gd: 16, w: 0.15 }, srcs: [], truck: 0, waterCost: 0, Gs: 2.68 }

function make(seed: number, family?: CFam, level: Level = 'exam'): CP {
  const r = rng(seed * 4409 + 3)
  const fam = family ?? pick(r, FAMS.map((f) => f.v))
  if (fam === 'proctor') {
    const set = randomSet(seed)
    const pk = proctorPeak(set.std)
    const gw = GWU[set.unit]
    const wz = set.std[set.std.length - 1].w
    const steps: XStep[] = [
      { key: 'omc', group: 'Standard curve', label: 'OMC (%)', value: pk.omc * 100, abs: 0.5, tol: 0, digits: 1 },
      { key: 'mdd', group: 'Standard curve', label: `MDD (${UNIT_LABEL[set.unit]})`, value: pk.mdd, tol: 0.005, digits: 3 },
      { key: 'zav', group: 'ZAV line', label: `γzav at ${f2(wz * 100)} %`, value: zav(wz, set.Gs, gw), tol: 0.003, digits: 3 },
      { key: 's', group: 'ZAV line', label: 'degree of saturation at the peak (%)', value: satOf(pk.omc, pk.mdd, set.Gs, gw) * 100, abs: 2, tol: 0, digits: 1 },
    ]
    if (level !== 'basic' && set.mod) {
      const m = proctorPeak(set.mod)
      steps.push({ key: 'momc', group: 'Modified curve', label: 'OMC (%)', value: m.omc * 100, abs: 0.5, tol: 0, digits: 1 }, { key: 'mmdd', group: 'Modified curve', label: 'MDD', value: m.mdd, tol: 0.005, digits: 3 })
    }
    const row = (pts: { w: number; gd: number }[]) => `w (%): ${pts.map((p) => f2(p.w * 100)).join(', ')}; γd (${UNIT_LABEL[set.unit]}): ${pts.map((p) => p.gd).join(', ')}`
    return {
      family: fam,
      level,
      title: 'Proctor curves and the ZAV line',
      text: `Compaction tests on a soil (Gs = ${set.Gs}) gave — Standard Proctor: ${row(set.std)}.${level !== 'basic' && set.mod ? ` Modified Proctor: ${row(set.mod)}.` : ''} Plot the curve${level !== 'basic' ? 's' : ''} with the zero-air-void line and find the OMC and maximum dry ${set.unit === 't' ? 'density' : 'unit weight'}${level !== 'basic' ? ' for each' : ''}. What is the degree of saturation at the Standard optimum?`,
      hash: hashKey(JSON.stringify(['p', set, level])),
      steps,
      set: level !== 'basic' ? set : { ...set, mod: undefined },
    }
  }
  if (fam === 'field') {
    const unit = pick(r, ['kN', 'pcf'] as const)
    const mdd = unit === 'kN' ? randInt(r, 165, 195) / 10 : randInt(r, 105, 122)
    const omc = randInt(r, 10, 20) / 100
    const rc = pick(r, [0.9, 0.95])
    const w = Math.round((omc + (r() - 0.55) * 0.05) * 1000) / 1000
    const gd = mdd * (rc - 0.04 + 0.09 * r())
    const gb = unit === 'kN' ? Math.round(gd * (1 + w) * 10) / 10 : Math.round(gd * (1 + w))
    const dw = level === 'basic' ? undefined : pick(r, [0.015, 0.02])
    const c = checkSpec(gb / (1 + w), w, { mdd, omc, rcMin: rc, dw })
    return {
      family: fam,
      level,
      title: 'Is the field compaction acceptable?',
      text: `A field density test on a compacted layer gave a bulk unit weight of ${gb} ${unit === 'kN' ? 'kN/m³' : 'lb/ft³'} at a moisture content of ${f2(w * 100)} %. The specified relative compaction is ${rc * 100} % or more${dw ? ` with the water content within ±${dw * 100} % of OMC` : ''}. Standard Proctor on the same soil gave a maximum dry unit weight of ${mdd} ${unit === 'kN' ? 'kN/m³' : 'lb/ft³'} at OMC ${f2(omc * 100)} %. Is the compaction acceptable?`,
      hash: hashKey(JSON.stringify(['f', gb, w, mdd, omc, rc, dw])),
      steps: [
        { key: 'gd', group: 'Field', label: 'field γd', value: gb / (1 + w), unit: unit === 'kN' ? 'kN/m³' : 'pcf' },
        { key: 'rc', group: 'Field', label: 'relative compaction (%)', value: c.rc * 100, abs: 0.3, tol: 0 },
        { key: 'ok', group: 'Verdict', label: 'acceptable?', options: [{ v: 'y', label: 'yes' }, { v: 'n', label: 'no' }], answer: c.pass ? 'y' : 'n' },
      ],
      field: { gb, w, mdd, omc, rc, dw, unit },
    }
  }
  if (fam === 'core') {
    const set = randomSet(seed)
    const kset: PSet = { ...set, unit: 'kN', std: set.unit === 'kN' ? set.std : set.std.map((p) => ({ w: p.w, gd: Math.round(p.gd * 9.81 * 100) / 100 })), mod: undefined }
    const pk = proctorPeak(kset.std)
    const D = pick(r, [6, 7, 7.5, 10])
    const L = pick(r, [12, 12.7, 15.2, 13])
    const V = (Math.PI / 4) * D * D * L
    const w = pk.omc + (r() - 0.5) * 0.04
    const rd = (pk.mdd / 9.81) * (0.92 + 0.07 * r())
    const W = Math.round(rd * (1 + w) * V)
    const dry = Math.round(randInt(r, 80, 120) * 100) / 100
    const wet = Math.round(dry * (1 + w) * 100) / 100
    const rc = 0.95
    const cc = coreCutter({ D, L, W, wWet: wet, wDry: dry })
    const gd = cc.rhoD * 9.81
    const s = checkSpec(gd, cc.w, { mdd: pk.mdd, omc: pk.omc, rcMin: rc })
    return {
      family: fam,
      level,
      title: 'Undisturbed core vs 95 % of Proctor (Jan 2021 Q2(b) style)',
      text: `The specification for an embankment needs a field dry unit weight of at least 95 % of the Proctor maximum. An undisturbed cylinder ${D * 10} mm in diameter and ${L * 10} mm long, cut from the compacted fill, weighs ${W} g. A portion of it weighing ${wet} g weighs ${dry} g after oven drying. The laboratory compaction test gave: w (%): ${kset.std.map((p) => f2(p.w * 100)).join(', ')}; γd (kN/m³): ${kset.std.map((p) => p.gd).join(', ')}. Did the contractor meet the specification?`,
      hash: hashKey(JSON.stringify(['c', D, L, W, wet, dry, kset.std])),
      steps: [
        { key: 'V', group: 'Core', label: 'volume (cm³)', value: cc.V },
        { key: 'w', group: 'Core', label: 'w (%)', value: cc.w * 100, abs: 0.1, tol: 0 },
        { key: 'gd', group: 'Core', label: 'γd (kN/m³)', value: gd },
        { key: 'mdd', group: 'Lab curve', label: 'MDD (kN/m³)', value: pk.mdd, tol: 0.004 },
        { key: 'rc', group: 'Verdict', label: 'RC (%)', value: s.rc * 100, abs: 0.5, tol: 0 },
        { key: 'ok', group: 'Verdict', label: 'meets the spec?', options: [{ v: 'y', label: 'yes' }, { v: 'n', label: 'no' }], answer: s.pass ? 'y' : 'n' },
      ],
      core: { D, L, W, wet, dry, set: kset, rc },
    }
  }
  if (fam === 'borrow') {
    const unit = pick(r, ['kN', 't'] as const)
    const g = unit === 'kN' ? 9.81 : 1
    const fill: SIn = level === 'basic' ? { kind: 'gd', gd: Math.round(randInt(r, 160, 190) / 10 * g / 9.81 * 1000) / 1000, w: NaN } : { kind: 'rc', rc: pick(r, [0.9, 0.95, 0.98]), mdd: unit === 'kN' ? randInt(r, 165, 195) / 10 : randInt(r, 168, 199) / 100, w: randInt(r, 10, 20) / 100 }
    const bank: SIn = r() < 0.5 ? { kind: 'gbw', gb: unit === 'kN' ? randInt(r, 155, 185) / 10 : randInt(r, 158, 189) / 100, w: randInt(r, 8, 24) / 100 } : { kind: 'ew', e: randInt(r, 60, 110) / 100, Gs: pick(r, [2.65, 2.67, 2.7]), w: level === 'basic' ? NaN : randInt(r, 8, 24) / 100 }
    const ew: EW = { ...ewBase, unit, V: randInt(r, 1, 40) * 500, fill, srcs: [src('Borrow', bank, { pay: pick(r, [300, 400, 500, 600]) })] }
    const { res } = runEarthwork(ew)
    const p = res[0].p
    const steps: XStep[] = [
      { key: 'ws', group: 'Solids', label: `Ws (${unit === 't' ? 't' : 'kN'})`, value: p.Ws },
      { key: 'v', group: 'Borrow', label: 'volume to excavate (m³)', value: p.Vbank },
      { key: 'pay', group: 'Borrow', label: 'payment to the owner (Tk)', value: res[0].payCost },
    ]
    if (Number.isFinite(p.water)) steps.push({ key: 'w', group: 'Water', label: `water to add (${unit === 't' ? 't' : 'kN'}; negative = dry it)`, value: p.water, abs: 1 })
    const fT = fill.kind === 'gd' ? `a dry ${unit === 't' ? 'density' : 'unit weight'} of ${fill.gd} ${unit === 't' ? 't/m³' : 'kN/m³'}` : fill.kind === 'rc' ? `${fill.rc * 100} % relative compaction with respect to an MDD of ${fill.mdd} ${unit === 't' ? 't/m³' : 'kN/m³'} at OMC ${f2(fill.w * 100)} %` : ''
    const bT = bank.kind === 'gbw' ? `a bulk ${unit === 't' ? 'density' : 'unit weight'} of ${bank.gb} ${unit === 't' ? 't/m³' : 'kN/m³'} at a water content of ${f2(bank.w * 100)} %` : bank.kind === 'ew' ? `a void ratio of ${bank.e} (Gs = ${bank.Gs})${Number.isFinite(bank.w) ? ` and a water content of ${f2(bank.w * 100)} %` : ''}` : ''
    return {
      family: fam,
      level,
      title: 'Borrow-pit volume and payment',
      text: `A compacted fill of ${big(ew.V)} m³ is to be built at ${fT}, using soil from a borrow area with ${bT}. Find the volume to be excavated, the amount to pay the owner at Tk ${res[0].s.pay} per m³${Number.isFinite(p.water) ? ', and the water to be added (or removed)' : ''}.`,
      hash: hashKey(JSON.stringify(['b', ew])),
      steps,
      ew,
    }
  }
  if (fam === 'trucks') {
    const fill: SIn = { kind: 'gbw', gb: randInt(r, 175, 205) / 10, w: randInt(r, 10, 18) / 100 }
    const bank: SIn = { kind: 'gbw', gb: randInt(r, 150, 180) / 10, w: randInt(r, 5, 15) / 100 }
    const loose: SIn = { kind: 'gbw', gb: randInt(r, 105, 135) / 10, w: randInt(r, 3, 10) / 100 }
    const ew: EW = { ...ewBase, V: randInt(r, 4, 30) * 25, fill, srcs: [src('Borrow', bank, { looseMode: 'state', loose })], truck: pick(r, [5, 6, 8, 10]) }
    const p = runEarthwork(ew).res[0].p
    return {
      family: fam,
      level,
      title: 'Truck loads (2016-17 Q1(b) style)',
      text: `Soil for an embankment is carried from a borrow area by trucks of ${ew.truck} m³. Unit weights and water contents — borrow (in place): ${bank.gb} kN/m³, ${f2(bank.w * 100)} %; truck (loose): ${loose.kind === 'gbw' ? loose.gb : ''} kN/m³, ${f2(loose.w * 100)} %; compacted fill: ${fill.kind === 'gbw' ? fill.gb : ''} kN/m³, ${f2(fill.w * 100)} %. Find the number of truck loads for ${big(ew.V)} m³ of compacted fill and the volume of the borrow pit.`,
      hash: hashKey(JSON.stringify(['t', ew])),
      steps: [
        { key: 'ws', group: 'Solids', label: 'Ws (kN)', value: p.Ws },
        { key: 'vl', group: 'Trucks', label: 'loose volume (m³)', value: p.Vloose },
        { key: 'n', group: 'Trucks', label: 'truck loads', value: p.trucks, ...COUNT },
        { key: 'vp', group: 'Pit', label: 'borrow-pit volume (m³)', value: p.Vbank },
      ],
      ew,
    }
  }
  // compare two areas
  const unit = 't'
  const fill: SIn = { kind: 'gbw', gb: randInt(r, 190, 205) / 100, w: randInt(r, 15, 24) / 100 }
  const Gs = pick(r, [2.65, 2.67, 2.7])
  const A: SIn = { kind: 'ew', e: randInt(r, 70, 95) / 100, Gs, w: randInt(r, 10, 22) / 100 }
  const B: SIn = { kind: 'ew', e: randInt(r, 55, 80) / 100, Gs, w: randInt(r, 8, 20) / 100 }
  const cA = randInt(r, 18, 24) * 100
  const cB = cA + randInt(r, 1, 4) * 100
  const ew: EW = { ...ewBase, unit, V: randInt(r, 2, 20) * 5000, fill, srcs: [src('A', A, { costBasis: '100m3', cost: cA }), src('B', B, { costBasis: '100m3', cost: cB })], Gs }
  const res = runEarthwork(ew).res
  const best = res[0].total <= res[1].total ? 'A' : 'B'
  const sat = waterToSaturate({ V: 100, e: (A as { e: number }).e, Gs, w: A.w, gw: 1 })
  return {
    family: 'compare',
    level,
    title: 'Two borrow areas (2010-11 Q5(c) style)',
    text: `Borrow areas A and B have void ratios ${(A as { e: number }).e} and ${(B as { e: number }).e} and in-place water contents ${f2(A.w * 100)} % and ${f2(B.w * 100)} % (Gs = ${Gs}). The fill will be ${big(ew.V)} m³ at a bulk density of ${(fill as { gb: number }).gb} t/m³ and ${f2(fill.w * 100)} % moisture. Find the volume to excavate from each. Excavation and transport cost Tk ${cA} per 100 m³ (A) and Tk ${cB} per 100 m³ (B): which is more economical? Also find the water needed to fully saturate 100 m³ of soil at A.`,
    hash: hashKey(JSON.stringify(['c', ew])),
    steps: [
      { key: 'ws', group: 'Fill', label: 'dry mass of solids (t)', value: res[0].p.Ws },
      { key: 'va', group: 'Volumes', label: 'from A (m³)', value: res[0].p.Vbank },
      { key: 'vb', group: 'Volumes', label: 'from B (m³)', value: res[1].p.Vbank },
      { key: 'best', group: 'Cost', label: 'more economical', options: [{ v: 'A', label: 'A' }, { v: 'B', label: 'B' }], answer: best },
      { key: 'sat', group: 'Saturation', label: 'water to saturate 100 m³ at A (t)', value: sat.water },
    ],
    ew,
  }
}

function Solution({ p }: { p: CP }) {
  if (p.set) {
    const pk = proctorPeak(p.set.std)
    return (
      <div className="space-y-2">
        <CompactionChart series={[{ pts: p.set.std, curve: proctorCurve(p.set.std), color: 'var(--c-accent)', label: 'Standard', peak: pk }, ...(p.set.mod ? [{ pts: p.set.mod, curve: proctorCurve(p.set.mod), color: 'var(--c-load)', label: 'Modified', peak: proctorPeak(p.set.mod) }] : [])]} Gs={p.set.Gs} unit={p.set.unit} />
        <PeakSolution set={p.set} pts={p.set.std} name="Standard" />
        {p.set.mod && <PeakSolution set={p.set} pts={p.set.mod} name="Modified" />}
      </div>
    )
  }
  if (p.field) {
    const f = p.field
    const gd = f.gb / (1 + f.w)
    const c = checkSpec(gd, f.w, { mdd: f.mdd, omc: f.omc, rcMin: f.rc, dw: f.dw })
    return <Md>{`$\\gamma_d = \\gamma/(1 + w) = ${f.gb}/${f3(1 + f.w)} = ${f2(gd)}$; $RC = ${f2(gd)}/${f.mdd} = ${f2(c.rc * 100)}$ % ${c.okRC ? '≥' : '<'} ${f.rc * 100} %.${f.dw ? ` Water content ${f2(f.w * 100)} % vs window ${f2(c.lo * 100)}–${f2(c.hi * 100)} %: ${c.okW ? 'inside' : 'outside'}.` : ` (w is ${f2(Math.abs(f.w - f.omc) * 100)} % ${f.w < f.omc ? 'dry' : 'wet'} of OMC.)`} → **${c.pass ? 'acceptable' : 'not acceptable'}**${c.pass ? '' : `: ${c.why.join('; ')}`}.`}</Md>
  }
  if (p.core) {
    const c = p.core
    const cc = coreCutter({ D: c.D, L: c.L, W: c.W, wWet: c.wet, wDry: c.dry })
    const pk = proctorPeak(c.set.std)
    const gd = cc.rhoD * 9.81
    const s = checkSpec(gd, cc.w, { mdd: pk.mdd, omc: pk.omc, rcMin: c.rc })
    return (
      <div className="space-y-2">
        <Md>{`$V = \\frac{\\pi}{4}(${c.D})^2(${c.L}) = ${f2(cc.V)}$ cm³; $\\rho = ${c.W}/${f2(cc.V)} = ${f3(cc.rhoB)}$ g/cm³ → $\\gamma = ${f2(cc.rhoB * 9.81)}$ kN/m³. $w = (${c.wet} - ${c.dry})/${c.dry} = ${f2(cc.w * 100)}$ %; $\\gamma_d = ${f2(gd)}$ kN/m³.`}</Md>
        <CompactionChart series={[{ pts: c.set.std, curve: proctorCurve(c.set.std), color: 'var(--c-accent)', label: 'lab', peak: pk }]} Gs={c.set.Gs} unit="kN" field={[{ w: cc.w, gd, label: 'core', pass: s.pass }]} />
        <PeakSolution set={c.set} pts={c.set.std} name="Lab curve" />
        <Md>{`Required $\\gamma_d \\ge 0.95 \\times ${f2(pk.mdd)} = ${f2(0.95 * pk.mdd)}$ kN/m³. Field ${f2(gd)} → RC = ${f2(s.rc * 100)} % → **${s.pass ? 'specification met' : 'not met'}** (w is ${f2(Math.abs(cc.w - pk.omc) * 100)} % ${cc.w < pk.omc ? 'dry' : 'wet'} of OMC).`}</Md>
      </div>
    )
  }
  if (p.ew) {
    const ew = p.ew
    const sat = p.family === 'compare' ? waterToSaturate({ V: 100, e: (ew.srcs[0].bank as { e: number }).e, Gs: ew.Gs, w: ew.srcs[0].bank.w, gw: 1 }) : null
    return (
      <div className="space-y-2">
        <EarthworkSolution ew={ew} />
        {sat && <Md>{`**Saturating 100 m³ at A:** $w_{sat} = e/G_s = ${f3(sat.wSat)}$; dry mass $= ${f2(sat.Ws)}$ t; water $= (${f3(sat.wSat)} - ${f3(ew.srcs[0].bank.w)}) \\times ${f2(sat.Ws)} = ${f2(sat.water)}$ t (≈ ${f2(sat.waterVol)} m³).`}</Md>}
      </div>
    )
  }
  return null
}

export function CompProblems() {
  return <ExamProblems topic="sm-comp" families={FAMS} make={make} solution={(p) => <Solution p={p} />} />
}

export { make as makeCompProblem }
