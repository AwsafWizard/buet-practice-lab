// Plasticity & consistency (AJK sir's Topic 2).
import { Link } from 'react-router-dom'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { nf } from '../../engine/phase'
import { chartZone, coneLL, flowCurve, indices, linearFromVS, onePointCone, shrinkage, slFromE, srFromE, volShrink, waterContent, onePointCup } from '../../engine/plasticity'
import { PlasticityChart } from '../../reference/idx'
import type { SmQ, SmTopicModule } from '../../types'
import { PlastExams } from './exam'
import { FlowPlot, StateBar } from './figs'
import { PlastLab } from './Lab'
import { PLAST_PICKS } from './picks'
import { PLAST_THEORY } from './theory'

const CUP = [
  { N: 15, tare: 10.4, wet: 44.12, dry: 31.48 },
  { N: 19, tare: 11.29, wet: 46.91, dry: 33.74 },
  { N: 24, tare: 6.93, wet: 48.37, dry: 33.17 },
  { N: 29, tare: 9.49, wet: 46.61, dry: 33.19 },
  { N: 33, tare: 7.22, wet: 46.74, dry: 32.63 },
]
const PLR = [
  { tare: 10.54, wet: 47.26, dry: 37.95 },
  { tare: 11.22, wet: 47.77, dry: 38.51 },
  { tare: 9.29, wet: 46.43, dry: 37.03 },
]

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Plasticity of soils (Topic 2)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-plast" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`PI = LL - PL,\\qquad LI = \\frac{w_N - PL}{PI},\\qquad CI = \\frac{LL - w_N}{PI}`}</Tex>
            <Tex block>{`I_F = \\frac{w_1 - w_2}{\\log(N_2/N_1)},\\qquad I_T = \\frac{PI}{I_F},\\qquad A = \\frac{PI}{\\%\\,< 2\\,\\mu m}`}</Tex>
            <Tex block>{`SL = \\frac{(m_1 - m_2) - (V_1 - V_2)\\rho_w}{m_2} = \\frac{V_2\\rho_w}{m_2} - \\frac{1}{G_s}`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **LL**: cup → w at **25 blows** on the w–log N line; fall cone (80 g, 30°) → w at **20 mm**.
- **PL**: thread crumbles at 3.2 mm. **PI** → Burmister (PI 20–40 high plasticity).
- **LI ≈ 0** (near PL): high strength, competent; **LI ≈ 1** (near LL): low strength, incompetent.
- Plasticity chart: A-line 0.73(LL − 20), U-line 0.9(LL − 8).
- On the slides: states, LL/PL tests, flow index, PI, LI, Burmister, Casagrande chart. **Not on the slides but asked:** SL calculations, CI, toughness index, activity, one-point formulas, linear shrinkage.`}</Md>
            <Link to="/ce341/topic/sm-plast/lab" className="btn btn-primary mt-2 inline-block">
              Open the flow-curve lab →
            </Link>
          </div>
        </div>
        <Callout kind="exam">
          About 17 parts in 12 papers. **LL from test data** every modern paper: Casagrande cup with container weights (2023-24 Q4(b), 2020-21 Q5(b), 18–20 marks) or the fall cone + "check by the single-point method" (2017-18, 2021-22, Jan 2021, 2009-10). **Shrinkage limit:** derivations with and without Gs (2009-10, 2015-16, 2021-22), the shrinkage test (2011-12, 25 marks), SL from e and linear shrinkage (2010-11), no volume change below SL (2008-09). **Compare two soils** by PI, CI, I_F, I_T (2012-13, 2016-17). **Theory:** phase diagrams at PL and LL and which water content is stronger (2023-24 Q1(b)).
        </Callout>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const ws = CUP.map((r) => waterContent(r).w)
  const f = flowCurve(CUP.map((r, i) => ({ N: r.N, w: ws[i] })))
  const pls = PLR.map((r) => waterContent(r).w)
  const PL = (pls[0] + pls[1] + pls[2]) / 3
  const k = indices({ LL: 57, PL: 34 })
  const z = chartZone(57, 23)
  const jan = coneLL([16.1, 17.8, 19.3, 21.6, 22.6].map((d, i) => ({ d, w: [50, 52.1, 54.1, 57, 58.2][i] })))
  const sh = shrinkage({ m1: 16.5, V1: 9.75, m2: 10.9, V2: 5.4 })
  const LL10 = onePointCup(45, 28)
  const SL10 = slFromE(0.4, 2.7)
  const VS10 = volShrink(LL10, SL10, srFromE(0.4, 2.7))
  return (
    <div>
      <Section title="Recipe">
        <Steps>
          <Step n={1} title="Water content of every can">w = (W₂ − W₃)/(W₃ − W₁) × 100 (container W₁, + wet W₂, + dry W₃). Tabulate.</Step>
          <Step n={2} title="Plot and fit">Cup: w against N on a log axis. Cone: w against penetration. Draw the best straight line (not point to point).</Step>
          <Step n={3} title="Read the LL">At N = 25 (cup) or d = 20 mm (cone). Flow index = fall in w over one log cycle of N.</Step>
          <Step n={4} title="Check (if asked)">One-point: LL = w(N/25)^0.121 (cup) or w/(0.77 log d) (cone), with the reading nearest 25 blows / 20 mm.</Step>
          <Step n={5} title="PL, PI, LI">PL = mean of the threads; PI = LL − PL → Burmister; LI and CI → state and strength comment.</Step>
          <Step n={6} title="Plot on the plasticity chart">A-line 0.73(LL − 20): above → C, below → M (or O); LL ≥ 50 → H.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <div className="grid cq-md:grid-cols-2 gap-3 text-sm">
          <Md>{`- **Blows given** → cup, log N axis, LL at 25.
- **Penetration given** → BS cone, linear axis, LL at 20 mm; "single point" → $w/(0.77\\log y)$.
- **One water content and N** → one-point cup formula.
- **Only LL, PL, w** → PI, LI, CI, state; two soils → compare PI, CI, I_F, I_T.`}</Md>
          <Md>{`- **Wet and dry pat masses and volumes** → SL without Gs, then Gs.
- **Gs and the dry pat** → SL = V₂ρw/m₂ − 1/Gs.
- **e at the SL** → SL = e/Gs, SR = Gs/(1 + e).
- **Drying from w₀** → no change if w₀ ≤ SL; else ΔV/Vdry = (w₀ − SL)·SR.
- **Bar length only** → LS = 1 − Ld/L₀, PI ≈ 2.13 LS, activity A = PI/clay %.`}</Md>
        </div>
        <Callout kind="trap">
          <Md>{`- Dividing by the **wet** mass for w (it is per dry mass).
- Joining the points instead of a best-fit line; using a linear N axis.
- Cone: reading the LL at 25 mm or using the cup's 25.
- Mixing LI and CI: LI = 0 at PL, CI = 0 at LL.
- Forgetting the flat part: below the SL drying causes **no** volume change (2008-09: dry from 8 % with SL 12 % → 0 %).
- Shrinkage formulas use ρw = 1 g/ml with g and ml.`}</Md>
        </Callout>
      </Section>
      <Section title="AJK sir's data sheets (slides 12, 15, 16)" sub={`Water contents ${ws.map((w) => nf(w, 4)).join(', ')} % → LL = ${nf(f.LL, 3)} % (boxed 57 %), flow index ${nf(f.If, 3)}; PL = ${nf(PL, 4)} % (34 %)`}>
        <FlowPlot mode="cup" pts={CUP.map((r, i) => ({ x: r.N, w: ws[i] }))} a={f.a} b={f.b} LL={f.LL} />
        <p className="text-sm mt-2">
          PI = 57 − 34 = {k.PI} % → <b>{k.burmister}</b> (slide 16). On the plasticity chart the point (57, 23) is below the A-line ({nf(z.aPI, 3)}) → <b>{z.zone}</b> — the slides do not plot it.
        </p>
        <div className="grid cq-md:grid-cols-2 gap-3 mt-2">
          <PlasticityChart pts={[{ LL: 57, PI: 23, label: 'class soil' }]} w={420} />
          <div>
            <StateBar PL={22} LL={52} w={24} />
            <p className="text-xs text-mute">Slide 18 case study: w = 24, PL = 22, LL = 52 → LI = {nf(indices({ LL: 52, PL: 22, w: 24 }).LI, 3)} ≈ 0: high strength, competent.</p>
          </div>
        </div>
      </Section>
      <Section title="Past-paper numbers, stepped" sub="engine values">
        <div className="text-sm space-y-2">
          <Md>{`**Jan 2021 Q6(a)** cone: least squares $w = ${nf(jan.a, 4)} + ${nf(jan.b, 4)}d$ → LL = **${nf(jan.LL, 4)} %**; one-point from 19.3 mm: 54.1/(0.77 log 19.3) = **${nf(onePointCone(54.1, 19.3), 4)} %**.`}</Md>
          <Md>{`**2011-12 Q4(a)** shrinkage: w₁ = ${nf(sh.w1, 4)} %, SL = [(16.5 − 10.9) − (9.75 − 5.40)]/10.9 = **${nf(sh.SL, 4)} %**, Gs = 1/(5.40/10.9 − ${nf(sh.SL / 100, 4)}) = **${nf(sh.Gs, 4)}**.`}</Md>
          <Md>{`**2010-11 Q1(a)**: LL = 45(28/25)^0.121 = ${nf(LL10, 4)} %; PI = ${nf(LL10 - 18.2, 4)}; LI = ${nf((40 - 18.2) / (LL10 - 18.2), 3)} (plastic, very soft); SL = 0.40/2.70 = ${nf(SL10, 4)} %; VS = ${nf(VS10, 4)} %; LS = **${nf(linearFromVS(VS10), 4)} %**.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
const p1 = [
  { N: 14, tare: 8.2, wet: 33.9, dry: 25.15 },
  { N: 20, tare: 7.9, wet: 35.4, dry: 26.31 },
  { N: 27, tare: 9.1, wet: 36.8, dry: 27.86 },
  { N: 36, tare: 8.6, wet: 34.2, dry: 26.21 },
]
const problems: SmQ[] = [
  {
    id: 'sm-own-plast-1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: ['sm-plast'],
    title: 'Cup flow curve with container weights',
    text: `Casagrande cup results: blows 14, 20, 27, 36; container 8.20, 7.90, 9.10, 8.60 g; container + wet soil 33.90, 35.40, 36.80, 34.20 g; container + dry soil 25.15, 26.31, 27.86, 26.21 g. PL = 24 %, natural w = 31 %. Find LL, the flow index, PI, LI, the toughness index and the soil type on the plasticity chart.`,
    pages: [],
    checks: () => {
      const ws = p1.map((r) => waterContent(r).w)
      const f = flowCurve(p1.map((r, i) => ({ N: r.N, w: ws[i] })))
      const k = indices({ LL: f.LL, PL: 24, w: 31, If: f.If })
      return [
        { key: 'LL', label: 'LL', value: f.LL, unit: '%', tol: 0.015 },
        { key: 'If', label: 'flow index', value: f.If, tol: 0.06 },
        { key: 'LI', label: 'LI', value: k.LI, tol: 0.05 },
        { key: 'It', label: 'toughness index', value: k.It, tol: 0.06 },
      ]
    },
    solution: () => {
      const ws = p1.map((r) => waterContent(r).w)
      const f = flowCurve(p1.map((r, i) => ({ N: r.N, w: ws[i] })))
      const k = indices({ LL: f.LL, PL: 24, w: 31, If: f.If })
      const z = chartZone(f.LL, k.PI)
      return (
        <div className="text-sm space-y-1">
          <p>w = {ws.map((w) => nf(w, 4)).join(', ')} %.</p>
          <FlowPlot mode="cup" pts={p1.map((r, i) => ({ x: r.N, w: ws[i] }))} a={f.a} b={f.b} LL={f.LL} w={440} />
          <Tex block>{`w = ${nf(f.a, 4)} - ${nf(f.If, 4)}\\log N,\\ LL = ${nf(f.LL, 4)}\\%,\\ PI = ${nf(k.PI, 4)},\\ LI = ${nf(k.LI, 3)},\\ I_T = ${nf(k.It, 3)}`}</Tex>
          <p>
            A-line {nf(z.aPI, 3)} → <b>{z.zone}</b>, {k.burmister.toLowerCase()}; state {k.state}.
          </p>
        </div>
      )
    },
  },
  {
    id: 'sm-own-plast-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: ['sm-plast'],
    title: 'Fall cone + single-point check',
    text: 'Cone penetrations 15.2, 17.6, 20.8, 23.9 mm at water contents 38.4, 41.0, 44.3, 47.6 %. Find the LL and check it with the single-point method (the reading nearest 20 mm). PL = 21 %.',
    pages: [],
    checks: () => {
      const f = coneLL([15.2, 17.6, 20.8, 23.9].map((d, i) => ({ d, w: [38.4, 41, 44.3, 47.6][i] })))
      return [
        { key: 'LL', label: 'LL', value: f.LL, unit: '%', tol: 0.015 },
        { key: 'one', label: 'one-point LL (20.8 mm)', value: onePointCone(44.3, 20.8), unit: '%' },
        { key: 'PI', label: 'PI', value: f.LL - 21, tol: 0.03 },
      ]
    },
    solution: () => {
      const f = coneLL([15.2, 17.6, 20.8, 23.9].map((d, i) => ({ d, w: [38.4, 41, 44.3, 47.6][i] })))
      return (
        <div className="text-sm">
          <FlowPlot mode="cone" pts={[15.2, 17.6, 20.8, 23.9].map((x, i) => ({ x, w: [38.4, 41, 44.3, 47.6][i] }))} a={f.a} b={f.b} LL={f.LL} w={440} />
          <Tex block>{`w = ${nf(f.a, 4)} + ${nf(f.b, 4)}d \\Rightarrow LL = ${nf(f.LL, 4)}\\%;\\quad w_L = \\frac{44.3}{0.77\\log 20.8} = ${nf(onePointCone(44.3, 20.8), 4)}\\%`}</Tex>
        </div>
      )
    },
  },
  {
    id: 'sm-own-plast-3',
    paper: 'own',
    level: 'challenge',
    sec: 'A',
    no: '3',
    marks: 0,
    topics: ['sm-plast'],
    title: 'Shrinkage test and drying',
    text: 'A saturated pat: 24.6 g, 14.2 ml; after oven drying 16.8 g, 9.1 ml. Find the SL, Gs and the shrinkage ratio. By what percentage of its dry volume does the soil shrink if dried from 30 % to 5 %?',
    pages: [],
    checks: () => {
      const s = shrinkage({ m1: 24.6, V1: 14.2, m2: 16.8, V2: 9.1 })
      return [
        { key: 'SL', label: 'SL', value: s.SL, unit: '%' },
        { key: 'Gs', label: 'Gs', value: s.Gs },
        { key: 'SR', label: 'SR', value: s.SR },
        { key: 'dv', label: 'shrinkage (% of dry volume)', value: (30 - s.SL) * s.SR, unit: '%' },
      ]
    },
    solution: () => {
      const s = shrinkage({ m1: 24.6, V1: 14.2, m2: 16.8, V2: 9.1 })
      return (
        <div className="text-sm">
          <Tex block>{`SL = \\frac{(24.6 - 16.8) - (14.2 - 9.1)}{16.8} = ${nf(s.SL, 4)}\\%,\\quad SR = \\frac{16.8}{9.1} = ${nf(s.SR, 4)},\\quad G_s = \\frac{1}{1/SR - SL} = ${nf(s.Gs, 4)}`}</Tex>
          <Tex block>{`\\Delta V/V_d = (30 - ${nf(s.SL, 4)})\\times ${nf(s.SR, 4)} = ${nf((30 - s.SL) * s.SR, 4)}\\%\\ \\text{(nothing more below the SL, so 5 \\% adds nothing)}`}</Tex>
        </div>
      )
    },
  },
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <Section title="Flow-curve lab" sub="Enter the data sheet (masses or water contents), drag points, read the LL; then PL, PI, LI, the state and the chart. The chart pane (T) shows the point and the Burmister row.">
        <PlastLab />
      </Section>
      <PickSection topic="sm-plast" skills={PLAST_PICKS} />
      <PlastExams />
    </div>
  ),
  problems,
  theory: PLAST_THEORY,
}
export default mod
