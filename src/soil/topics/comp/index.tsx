import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { checkSpec, fieldTest, proctorCurve, proctorPeak, sandCone } from '../../engine/compaction'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { EarthworkLab, EarthworkSolution, EW_PRESETS, runEarthwork, type EW } from './EarthworkLab'
import { CompactionChart } from './figs'
import { COMP_PICKS } from './picks'
import { CompProblems } from './Problems'
import { PeakSolution, PROCTOR_SETS, ProctorLab, SpecLab } from './ProctorLab'
import { COMP_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const big = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 })

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Compaction and earthwork (SJMY sir, Lectures 4–6)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-comp" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`\\gamma_d = \\frac{\\gamma}{1+w},\\qquad \\gamma_{zav} = \\frac{G_s\\gamma_w}{1+wG_s},\\qquad \\gamma_d = \\frac{G_s\\gamma_w}{1+wG_s/S}`}</Tex>
            <Tex block>{`RC = \\frac{\\gamma_{d,field}}{\\gamma_{d,max}},\\qquad E = \\frac{\\text{blows}\\times\\text{layers}\\times W h}{V}`}</Tex>
            <Tex block>{`W_s = \\gamma_{d,fill}V_{fill} = \\gamma_{d,pit}V_{pit} = \\gamma_{d,loose}V_{loose}`}</Tex>
            <Tex block>{`\\text{water to add} = (w_{fill} - w_{pit})W_s`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Proctor curves**: plot γd against w, read MDD and OMC (parabola through the top three points if you want a number), draw the ZAV line.
- **Field control**: γd = γ/(1+w) from sand cone or core cutter, RC against the spec, w against the OMC window; say why a test fails.
- **Earthwork**: solids are conserved between pit, truck and fill; then volumes, truck loads, water and cost, often for two borrow areas.
- Theory: compaction curve and ZAV, curves by soil type, energy effect, Standard vs Modified, two ways of specifying, field control, rollers, sand cone, compaction vs consolidation.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          Asked in every paper. Numericals: borrow / embankment / truck / cost (2023-24 Q7(c), 2021-22 Q3(c), 2016-17 Q1(b), 2015-16 Q9(b), 2012-13 Q9(b), 2010-11 Q5(c), 2009-10 Q5(d), 2008-09 Q5(c), 2007-08 Q5(b)) and field checks against a Proctor curve (2017-18 Q5(a), Jan 2021 Q2(b), 2020-21 Q1(b), 2015-16 Q9(a)). Theory: compaction curves and ZAV (5 papers), soil-type curves (3), rollers (2), two ways of specifying (2), sand cone (2).
        </Callout>
      </Section>
      <Section title="The labs">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Proctor lab.** Edit the points or roll new ones; the curve, its peak, the ZAV and S-lines redraw. Switch on Modified energy and watch the peak move up and left.`}</Md>
          <Md>{`**Field-spec checker.** Several field tests against RC and the OMC window, plotted on the curve: which pass, and why the others fail.`}</Md>
          <Md>{`**Earthwork calculator.** Fill or embankment section → solids → pit, loose and truck volumes, water, cost; compare two borrow areas.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const s = PROCTOR_SETS[0]
  const spk = proctorPeak(s.std)
  const mpk = proctorPeak(s.mod!)
  const tests = [
    { V: 946, Wwet: 1822, Wdry: 1703 },
    { V: 980, Wwet: 2083, Wdry: 1882 },
    { V: 957, Wwet: 1960, Wdry: 1675 },
  ].map(fieldTest)
  const spec = { mdd: mpk.mdd, omc: mpk.omc, rcMin: 0.95, dw: 0.02 }
  const checks = tests.map((t) => checkSpec(t.gd, t.w, spec))
  const pur: EW = EW_PRESETS.find((p) => p.label.startsWith('2009-10'))!.ew
  const pr = runEarthwork(pur).res
  const das = sandCone({ rhoSand: 1570, Wcone: 0.545, W3: 7.59, W5: 4.78, Wwet: 3.007, w: 0.102 })
  return (
    <div>
      <Section title="Recipe: Proctor and field control">
        <Steps>
          <Step n={1} title="γd for every point">γd = γ/(1 + w) (or W_d/V). Tabulate w and γd.</Step>
          <Step n={2} title="Plot and read the peak">Smooth curve; MDD and OMC at the top (a parabola through the three highest points gives the number).</Step>
          <Step n={3} title="ZAV line">γzav = Gsγw/(1 + wGs) at 4–5 values of w; every point must lie below it.</Step>
          <Step n={4} title="Field test">Sand cone: W6 = W3 − W5 − Wcone, V = W6/γsand. Core: V = πD²L/4. Then γ, w, γd.</Step>
          <Step n={5} title="Spec">RC = γd/MDD ≥ the required %, and OMC − Δw ≤ w ≤ OMC + Δw. Say which fails and why (too dry, too wet, under-compacted).</Step>
        </Steps>
      </Section>
      <Section title="Recipe: earthwork">
        <Steps>
          <Step n={1} title="Fill solids">Ws = γd,fill × V (γd,fill from γ and w, RC × MDD, or Gsγw/(1 + e)). Embankment: area = (top + base)/2 × H, base = top + 2nH.</Step>
          <Step n={2} title="Same solids in each state">V_pit = Ws/γd,pit; V_loose = Ws/γd,loose or V_pit × (1 + bulking); trucks = ⌈V_loose/capacity⌉.</Step>
          <Step n={3} title="Water">(w_fill − w_pit) × Ws, as a weight; ÷ γw for m³ (1 t = 1 m³).</Step>
          <Step n={4} title="Cost">Per m³, per 100 m³ or per truck, + water + owner; compare the areas.</Step>
        </Steps>
        <button className="chip mt-2 hover:!border-load" onClick={() => openSmRef('st-earthwork')}>
          Chart pane: earthwork steps ↗
        </button>
        <Callout kind="trap">
          <Md>{`- Dividing Ws by the **bulk** γ of the pit instead of its **dry** γd.
- Taking RC on the bulk unit weight: RC uses γd.
- Water to add uses the **dry** weight of solids, not the wet weight.
- "Bulks by 10 %" multiplies the **pit** volume by 1.10.
- Truck loads round **up**.
- Units: t/m³ ↔ kN/m³ (× 9.81); pcf papers stay in pcf. Gs is often a red herring (2023-24 Q7(c)).
- A curve drawn above the ZAV line is wrong; RC above 100 % is possible.`}</Md>
        </Callout>
      </Section>
      <Section title="2017-18 Q5(a), stepped through" sub="Gs = 2.64, Standard and Modified data, three field tests; spec ρd ≥ 95 % of Modified MDD, w within ±2 % of Modified OMC.">
        <CompactionChart
          series={[
            { pts: s.std, curve: proctorCurve(s.std), color: 'var(--c-accent)', label: 'Standard', peak: spk },
            { pts: s.mod!, curve: proctorCurve(s.mod!), color: 'var(--c-load)', label: 'Modified', peak: mpk },
          ]}
          Gs={2.64}
          unit="t"
          field={tests.map((t, k) => ({ w: t.w, gd: t.gd, label: `${k + 1}`, pass: checks[k].pass }))}
          spec={{ lo: mpk.omc - 0.02, hi: mpk.omc + 0.02, gdMin: 0.95 * mpk.mdd }}
        />
        <PeakSolution set={s} pts={s.std} name="Standard" />
        <PeakSolution set={s} pts={s.mod!} name="Modified" />
        <table className="tbl w-auto">
          <thead>
            <tr>
              <th>test</th>
              <th>ρb</th>
              <th>w (%)</th>
              <th>ρd</th>
              <th>verdict</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, k) => (
              <tr key={k}>
                <td>{k + 1}</td>
                <td>{f3(t.gb)}</td>
                <td>{f2(t.w * 100)}</td>
                <td>{f3(t.gd)}</td>
                <td className="txt">{checks[k].pass ? 'passes' : checks[k].why.join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-faint mt-1">
          Limits: ρd ≥ {f3(0.95 * mpk.mdd)} t/m³, w {f2((mpk.omc - 0.02) * 100)}–{f2((mpk.omc + 0.02) * 100)} %. Handnote: MDD 1.76 / 1.92 t/m³ at 15.5 / 11.7 %, only test 2 passes.
        </p>
      </Section>
      <Section title="2009-10 Q5(d) Purbachal, stepped through">
        <EarthworkSolution ew={pur} />
        <p className="text-xs text-faint">
          Totals A Tk {big(pr[0].total)} vs B Tk {big(pr[1].total)} (handnote: Tk 497.2 M vs 532.7 M; it rounds 491,252.1 truck loads down to 491,252, here they round up). "Water charge Tk 300 per truck" is taken per 10 m³ truck of water, as the handnote does.
        </p>
      </Section>
      <Section title="Lecture 6 / Das Ex 4.3: sand cone">
        <Md>{`$W_6 = 7.59 - 4.78 - 0.545 = ${f3(das.W6)}$ kg; $V = ${f3(das.W6)}/1570 = ${(das.V * 1e3).toFixed(4)} \\times 10^{-3}$ m³; $\\rho = 3.007/V = ${big(das.rhoB)}$ kg/m³; $\\rho_d = \\rho/1.102 = ${big(das.rhoD)}$ kg/m³ → $\\gamma_d = ${f2((das.rhoD * 9.81) / 1000)}$ kN/m³. Lab MDD (parabola) = ${f2(proctorPeak(PROCTOR_SETS[2].std).mdd)} kN/m³ → RC = ${f2(((das.rhoD * 9.81) / 1000 / proctorPeak(PROCTOR_SETS[2].std).mdd) * 100)} %.`}</Md>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const ewOwn: EW = {
  unit: 'kN',
  fillMode: 'section',
  V: 0,
  top: 6,
  H: 3,
  n: 2,
  L: 500,
  fill: { kind: 'rc', rc: 0.95, mdd: 18.2, w: 0.14 },
  srcs: [
    { name: 'A', bank: { kind: 'gbw', gb: 17.2, w: 0.1 }, looseMode: 'bulk', bulk: 0.2, loose: { kind: 'gbw', gb: 12, w: 0.1 }, costBasis: 'truck', cost: 900, pay: 150 },
    { name: 'B', bank: { kind: 'ew', e: 0.62, Gs: 2.68, w: 0.16 }, looseMode: 'bulk', bulk: 0.25, loose: { kind: 'gbw', gb: 12, w: 0.1 }, costBasis: 'truck', cost: 1000, pay: 100 },
  ],
  truck: 8,
  waterCost: 400,
  Gs: 2.68,
}

const problems: SmQ[] = [
  {
    id: 'sm-own-comp-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['sm-comp'],
    title: 'Sand cone check',
    text: 'Sand cone test: sand density 1.57 g/cm³, sand to fill the cone 545 g; jar + cone + sand 7590 g before and 4780 g after. Soil from the hole 3007 g at w = 10.2 %. Lab MDD = 18.9 kN/m³ at OMC 11 %; spec RC ≥ 95 %, w = OMC ± 2 %. Find the field γd and RC. Does it pass?',
    pages: [],
    checks: () => {
      const s = sandCone({ rhoSand: 1.57, Wcone: 545, W3: 7590, W5: 4780, Wwet: 3007, w: 0.102 })
      const gd = s.rhoD * 9.81
      return [
        { key: 'v', label: 'hole volume', value: s.V, unit: 'cm³' },
        { key: 'gd', label: 'field γd', value: gd, unit: 'kN/m³' },
        { key: 'rc', label: 'RC', value: (gd / 18.9) * 100, unit: '%' },
      ]
    },
    solution: () => {
      const s = sandCone({ rhoSand: 1.57, Wcone: 545, W3: 7590, W5: 4780, Wwet: 3007, w: 0.102 })
      const gd = s.rhoD * 9.81
      const c = checkSpec(gd, 0.102, { mdd: 18.9, omc: 0.11, rcMin: 0.95, dw: 0.02 })
      return <Md>{`$W_6 = 7590 - 4780 - 545 = ${f2(s.W6)}$ g → $V = ${f2(s.W6)}/1.57 = ${f2(s.V)}$ cm³; $\\rho = 3007/V = ${f3(s.rhoB)}$, $\\rho_d = \\rho/1.102 = ${f3(s.rhoD)}$ g/cm³ → $\\gamma_d = ${f2(gd)}$ kN/m³. RC = ${f2(c.rc * 100)} %; w = 10.2 % is inside 9–13 % → **${c.pass ? 'passes' : 'fails'}**.`}</Md>
    },
  },
  {
    id: 'sm-own-comp-2',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: ['sm-comp'],
    title: 'Embankment from two borrow areas',
    text: 'A 500 m long embankment, 3 m high, 6 m top width, side slopes 1 V : 2 H, is to be compacted to 95 % of an MDD of 18.2 kN/m³ at 14 % moisture. Area A: γ = 17.2 kN/m³ at w = 10 %; it bulks 20 % in the truck; Tk 900 per truck plus Tk 150 per m³ to the owner. Area B: e = 0.62, Gs = 2.68, w = 16 %; bulks 25 %; Tk 1000 per truck plus Tk 100 per m³. Trucks carry 8 m³; water costs Tk 400 per 8 m³ truck. Which area is cheaper?',
    pages: [],
    checks: () => {
      const r = runEarthwork(ewOwn).res
      return [
        { key: 'va', label: 'volume dug at A', value: r[0].p.Vbank, unit: 'm³' },
        { key: 'vb', label: 'volume dug at B', value: r[1].p.Vbank, unit: 'm³' },
        { key: 'ca', label: 'total cost A', value: r[0].total, unit: 'Tk' },
        { key: 'cb', label: 'total cost B', value: r[1].total, unit: 'Tk' },
      ]
    },
    solution: () => <EarthworkSolution ew={ewOwn} />,
  },
  {
    id: 'sm-own-comp-3',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: ['sm-comp'],
    title: 'Which lifts pass? (Standard reference)',
    text: 'Using the 2017-18 Q5(a) Standard Proctor data (Gs = 2.64) as the reference, the spec is ρd ≥ 98 % of Standard MDD and w within OMC ± 2 %. Field tests (V cm³, wet g, dry g): 1: 950, 1880, 1640; 2: 960, 1965, 1700; 3: 940, 1930, 1640. Find the Standard MDD and OMC, then the RC of each test, and say which pass.',
    pages: [],
    checks: () => {
      const pk = proctorPeak(PROCTOR_SETS[0].std)
      const ts = [
        { V: 950, Wwet: 1880, Wdry: 1640 },
        { V: 960, Wwet: 1965, Wdry: 1700 },
        { V: 940, Wwet: 1930, Wdry: 1640 },
      ].map(fieldTest)
      return [{ key: 'mdd', label: 'Standard MDD', value: pk.mdd, unit: 't/m³', tol: 0.004 }, { key: 'omc', label: 'Standard OMC', value: pk.omc * 100, unit: '%', tol: 0.03 }, ...ts.map((t, k) => ({ key: 'rc' + k, label: `RC test ${k + 1}`, value: (t.gd / pk.mdd) * 100, unit: '%' }))]
    },
    solution: () => {
      const set = PROCTOR_SETS[0]
      const pk = proctorPeak(set.std)
      const ts = [
        { V: 950, Wwet: 1880, Wdry: 1640 },
        { V: 960, Wwet: 1965, Wdry: 1700 },
        { V: 940, Wwet: 1930, Wdry: 1640 },
      ].map(fieldTest)
      const cs = ts.map((t) => checkSpec(t.gd, t.w, { mdd: pk.mdd, omc: pk.omc, rcMin: 0.98, dw: 0.02 }))
      return (
        <div className="space-y-2">
          <PeakSolution set={set} pts={set.std} name="Standard" />
          <CompactionChart series={[{ pts: set.std, curve: proctorCurve(set.std), color: 'var(--c-accent)', label: 'Standard', peak: pk }]} Gs={2.64} unit="t" field={ts.map((t, k) => ({ w: t.w, gd: t.gd, label: `${k + 1}`, pass: cs[k].pass }))} spec={{ lo: pk.omc - 0.02, hi: pk.omc + 0.02, gdMin: 0.98 * pk.mdd }} />
          <Md>{ts.map((t, k) => `- Test ${k + 1}: ρd = ${f3(t.gd)}, w = ${f2(t.w * 100)} %, RC = ${f2(cs[k].rc * 100)} % → ${cs[k].pass ? '**passes**' : `**fails** (${cs[k].why.join('; ')})`}`).join('\n')}</Md>
        </div>
      )
    },
  },
]

function CompLab() {
  return (
    <div className="space-y-6">
      <PickSection topic="sm-comp" skills={COMP_PICKS} />
      <CompProblems />
      <Section title="Proctor lab" sub="Edit the test points or roll new ones. The curve, its peak, the ZAV and S-lines redraw; switch on Modified energy to see the peak move up and left.">
        <ProctorLab />
      </Section>
      <Section title="Field-spec checker" sub="Several field tests against relative compaction and the OMC window, plotted on the curve.">
        <SpecLab />
      </Section>
      <Section title="Earthwork calculator" sub="Solids are conserved: fill → pit → truck. Volumes, truck loads, water and cost for one or two borrow areas.">
        <EarthworkLab />
      </Section>
    </div>
  )
}

const mod: SmTopicModule = { Overview, Approach, Lab: CompLab, problems, theory: COMP_THEORY }
export default mod
