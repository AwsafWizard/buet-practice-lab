import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { darcy, layered, pumpUnconfined, scaleFallTime } from '../../engine/permeability'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { CapLab, LayeredLab, LayeredSolution, LayersFig, PermeameterLab, PermSolution, PERM_DEFAULT, PumpLab, sciTex, type PermState } from './Labs'
import { PERM_PICKS } from './picks'
import { PermProblems } from './Problems'
import { PERM_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)

function Overview() {
  return (
    <div>
      <Section title="Permeability and capillarity (SJMY sir, Lectures 7–9)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-perm" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`v = ki,\\quad q = kiA,\\quad v_s = v/n`}</Tex>
            <Tex block>{`k = \\frac{QL}{Aht}\\qquad k = 2.303\\frac{aL}{At}\\log\\frac{h_1}{h_2}`}</Tex>
            <Tex block>{`k_h = \\frac{\\sum k_iH_i}{H},\\qquad k_v = \\frac{H}{\\sum H_i/k_i}`}</Tex>
            <Tex block>{`h_c = \\frac{4\\sigma\\cos\\theta}{d\\gamma_w},\\qquad k = CD_{10}^2`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Lab tests**: constant head for coarse soils, falling head for fine sand and silt, k = cv·mv·γw for clays.
- **Velocities**: discharge v = ki on the gross area, seepage vs = v/n through the voids (n from the dry mass: Vs = Ws/Gs).
- **Layers**: kh (along) ≥ kv (across, set by the tightest layer).
- **Field**: pumping tests, confined and unconfined.
- **Capillarity**: rise ∝ 1/pore size; suction u = −hγw in the capillary zone.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          A small topic in marks, but in most papers: permeameter numericals (2012-13 Q10(c) = 2008-09 Q8(c), 2011-12 Q6(c), 2020-21 Q2(a)), the layered-k derivation (2023-24 Q6(d)), lab methods compared (Jan 2021 Q4(a)), k of clay (3 papers), typical k and capillary rise values (2011-12), short notes on capillary rise (2009-10, 2007-08) and why sand test results mislead (2010-11).
        </Callout>
      </Section>
    </div>
  )
}

function Approach() {
  const c = PERM_DEFAULT
  const lay = [
    { H: 5, k: 3e-4 },
    { H: 5, k: 4e-4 },
    { H: 5, k: 6e-4 },
  ]
  const L = layered(lay)
  const A = (Math.PI / 4) * 36
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Which test?">Constant head: steady h, collect Q in t → k = QL/(Aht). Falling head: standpipe area a, h1 → h2 in t → k = 2.303(aL/At)log(h1/h2). Same apparatus: t ∝ ln(h1/h2).</Step>
          <Step n={2} title="Areas and units">A = πD²/4 of the sample, a of the standpipe; keep cm and s (k in cm/s), then convert: 1 cm/s = 10⁻² m/s = 864 m/day.</Step>
          <Step n={3} title="Velocities">v = Q/(At) = ki; n = 1 − Vs/V with Vs = Ws/(Gsρw); vs = v/n.</Step>
          <Step n={4} title="Layers">Across: same v, heads add → kv = ΣH/Σ(H/k). Along: same i, flows add → kh = ΣkH/ΣH. Find i from the head lost over the sand only.</Step>
          <Step n={5} title="Comment">Compare k with the typical bands (coarse sand 1–10⁻², fine sand 10⁻²–10⁻³, clay {'<'} 10⁻⁶ cm/s).</Step>
        </Steps>
        <button className="chip mt-2 hover:!border-load" onClick={() => openSmRef('w-perm')}>
          Chart pane: permeability formulas ↗
        </button>
        <Callout kind="trap">
          <Md>{`- Using the standpipe area a for the sample area A (or the reverse).
- t ∝ ln(h1/h2), **not** ∝ the drop: 2 cm in 5 min does not mean 25 cm in 62.5 min.
- Seepage velocity divides by **n**, not e.
- In a layered permeameter the head lost is from the water surface to the outflow, but the length is the sand only.
- Unconfined pumping: h measured from the **impermeable base**, squared.`}</Md>
        </Callout>
      </Section>
      <Section title="2012-13 Q10(c), stepped through" sub="500 ml in 15 min, D = 5 cm, 40 cm head over 15 cm, dry mass 486 g, Gs = 2.65">
        <PermSolution s={c} />
      </Section>
      <Section title="2011-12 Q6(c)" sub="50 cm drops 2 cm in 5 min: time to 25 cm">
        <Md>{`$$t = 5 \\times \\frac{\\ln(50/25)}{\\ln(50/48)} = ${f2(scaleFallTime(5, 50, 48, 25))}\\ \\text{min}$$`}</Md>
      </Section>
      <Section title="2020-21 Q2(a), stepped through" sub="30 cm pipe, 6 cm bore, three 5 cm sand layers on the screen, water kept at the top">
        <LayersFig ls={lay} dir="v" />
        <LayeredSolution ls={lay} h={30} A={A} />
        <p className="text-sm">
          Volume in 5 min = {f2(darcy({ k: L.kv, i: 2, A }).q * 300)} cm³ (handnote 6.79 cm³).
        </p>
      </Section>
    </div>
  )
}

const fhOwn: PermState = { ...PERM_DEFAULT, mode: 'fall', D: 7.5, L: 12, d: 0.6, h1: 90, h2: 55, t: 600 }

const problems: SmQ[] = [
  {
    id: 'sm-own-perm-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['sm-perm'],
    title: 'Falling head: k and time',
    text: 'A falling-head test on a 7.5 cm diameter, 12 cm long sample: the head in a 6 mm bore standpipe falls from 90 cm to 55 cm in 10 min. Find k (cm/s) and the time for the head to fall from 90 cm to 30 cm.',
    pages: [],
    checks: () => {
      const k = (() => {
        const a = (Math.PI / 4) * 0.36
        const A = (Math.PI / 4) * 56.25
        return ((a * 12) / (A * 600)) * Math.log(90 / 55)
      })()
      return [
        { key: 'k', label: 'k', value: k, unit: 'cm/s' },
        { key: 't', label: 'time 90 → 30 cm', value: scaleFallTime(600, 90, 55, 30), unit: 's' },
      ]
    },
    solution: () => <PermSolution s={fhOwn} />,
  },
  {
    id: 'sm-own-perm-2',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: ['sm-perm'],
    title: 'Layered deposit, both directions',
    text: 'A deposit has 2 m of sand (k = 2 × 10⁻³ cm/s), 1.5 m of silt (k = 5 × 10⁻⁵ cm/s) and 3 m of silty sand (k = 4 × 10⁻⁴ cm/s). Find kh, kv and kh/kv, and the share of the head lost in the silt for vertical flow.',
    pages: [],
    checks: () => {
      const L = layered([
        { H: 2, k: 2e-3 },
        { H: 1.5, k: 5e-5 },
        { H: 3, k: 4e-4 },
      ])
      return [
        { key: 'kh', label: 'kh', value: L.kh, unit: 'cm/s' },
        { key: 'kv', label: 'kv', value: L.kv, unit: 'cm/s' },
        { key: 'r', label: 'kh/kv', value: L.ratio },
        { key: 's', label: 'head lost in the silt', value: L.hShare[1] * 100, unit: '%' },
      ]
    },
    solution: () => (
      <LayeredSolution
        ls={[
          { H: 2, k: 2e-3 },
          { H: 1.5, k: 5e-5 },
          { H: 3, k: 4e-4 },
        ]}
      />
    ),
  },
  {
    id: 'sm-own-perm-3',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: ['sm-perm'],
    title: 'Unconfined pumping test',
    text: 'A well in an unconfined sand on rock is pumped at 0.025 m³/s. At steady state the water stands 6.1 m and 7.0 m above the rock in observation wells 12 m and 50 m away. Find k in m/s and cm/s.',
    pages: [],
    checks: () => [{ key: 'k', label: 'k', value: pumpUnconfined({ q: 0.025, r1: 12, r2: 50, h1: 6.1, h2: 7 }), unit: 'm/s' }],
    solution: () => {
      const k = pumpUnconfined({ q: 0.025, r1: 12, r2: 50, h1: 6.1, h2: 7 })
      return <Md>{`$$k = \\frac{q\\ln(r_2/r_1)}{\\pi(h_2^2 - h_1^2)} = \\frac{0.025\\ln(50/12)}{\\pi(7.0^2 - 6.1^2)} = ${sciTex(k, 3)}\\ \\text{m/s} = ${sciTex(k * 100, 3)}\\ \\text{cm/s (coarse sand)}$$`}</Md>
    },
  },
]

function PermLab() {
  return (
    <div className="space-y-6">
      <PickSection topic="sm-perm" skills={PERM_PICKS} />
      <PermProblems />
      <Section title="Permeameter" sub="Constant or falling head. Run the falling-head test and watch the standpipe drain exponentially.">
        <PermeameterLab />
      </Section>
      <Section title="Layered deposits" sub="Equivalent k across and along the layers, with how the flow (or the head) is shared.">
        <LayeredLab />
      </Section>
      <Section title="Pumping test" sub="Drag the observation-well readings; the drawdown curve follows Dupuit.">
        <PumpLab />
      </Section>
      <Section title="Capillary rise" sub="Tubes of three bores and a soil by Hazen's rule.">
        <CapLab />
      </Section>
    </div>
  )
}

const mod: SmTopicModule = { Overview, Approach, Lab: PermLab, problems, theory: PERM_THEORY }
export default mod
