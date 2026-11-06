// Consolidation & settlement (SJMY sir, Lectures 15–20): e–log p, NC / OC settlement, pc′ and field curves, Terzaghi theory,
// Tv–U, cv fitting, secondary compression, sand drains.
import { fmt } from '../../../components/DiagramView'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { casagrande, csFromData, kRatio, pcTwoLines, scaleTime, settleAt, settleProfile, tvFromTable, type SettleIn } from '../../engine/consolidation'
import { openSmRef } from '../../reference/pane'
import type { SmQ, SmTopicModule } from '../../types'
import { ElogpLab } from './ElogpLab'
import { ProfileFig } from './figs'
import { DrainLab, FitLab, SecondaryLab } from './FitLab'
import { JAN21_OED, SETTLE_PRESETS } from './gen'
import { CONSOL_PICKS } from './picks'
import { ConsolProblems } from './Problems'
import { IsochronePlayground, RateLab } from './RateLab'
import { SettleLab } from './SettleLab'
import { SettleSolution } from './Solution'
import { CONSOL_THEORY } from './theory'

const f2 = (v: number) => fmt(v, 2)
const R = String.raw

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Consolidation & settlement (SJMY sir, Lectures 15–20)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-consol" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{R`S = \frac{C_cH}{1+e_0}\log\frac{p_0'+\Delta p}{p_0'}\ \ (\text{NC}),\qquad S = \frac{\Delta e\,H}{1+e_0} = m_v\Delta pH`}</Tex>
            <Tex block>{R`\text{OC: }\ \frac{C_sH}{1+e_0}\log\frac{p_0'+\Delta p}{p_0'}\ \text{or}\ \frac{C_sH}{1+e_0}\log\frac{p_c'}{p_0'} + \frac{C_cH}{1+e_0}\log\frac{p_0'+\Delta p}{p_c'}`}</Tex>
            <Tex block>{R`T_v = \frac{c_vt}{d^2},\quad c_v = \frac{k}{m_v\gamma_w},\quad T_{50} = 0.197,\ T_{90} = 0.848,\quad C_c = 0.009(LL-10)`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **Magnitude:** p0′ at the clay's mid-depth, Δp (wide fill = γh; footing = 2:1 or Boussinesq, Simpson over the layer), NC / OC branch, or Δe straight from an e–p table by log interpolation.
- **Rate:** U = St/S ↔ Tv (table or formulas), d = H/2 or H, t ∝ d²/cv between lab and field or between layers.
- **Lab:** e–log p (pc′ by Casagrande, Cc, Cs, field curve), cv by √t / log t, Cα.
- Older papers add **secondary compression**, **sand drains** (Barron) and **k = cv mv γw** ratios.`}</Md>
          </div>
        </div>
        <Callout kind="exam">
          <Md>{`**How it is asked (all 13 papers, 48 sub-parts: ~27 numericals, ~21 theory):**
- **Every modern paper** has a settlement numerical worth 12–30 marks: NC clay under a small footing with 2:1 and Simpson (2023-24 Q5(c)); two NC clays under a wide fill (2021-22 Q3(a)); OC clay crossing pc′ with Cs not given (2020-21 Q3(a)); oedometer data → pc′ → OC → recompression under a circle (Jan 2021 Q3(b)).
- **A time question** almost every year: U from a settlement and t from Tv with one- and two-way drainage (2023-24 Q7(b)); time for a settlement from one observation (2021-22 Q1(b)); layer A → B scaling (2020-21 Q3(b)).
- **The circular raft on sand over 1.6 m of clay** with a printed e–p table and a lab t90 (2008-09, 2011-12, 2016-17, 2017-18): log interpolation, 1H:2V spread, t_field = t_lab (d_f/d_lab)².
- **Theory:** field e–log p and disturbance (3 papers), secondary consolidation (3), Terzaghi derivation (2), √t vs log t, NC vs OC and causes, sand drains (4), consolidation test (3), time factor and S² ∝ t.`}</Md>
        </Callout>
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="btn" onClick={() => openSmRef('k-settle')}>
            Settlement formula sheet ↗
          </button>
          <button className="btn" onClick={() => openSmRef('k-tvu')}>
            Tv–U table ↗
          </button>
        </div>
      </Section>
      <Section title="Read the paper carefully">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**2010-11 Q6(c)** prints "undergoes **5%** consolidation" with no time. The handnote reads it as 50 % in one year (the only reading that fits its 429 mm part): cv = 0.788 m²/yr, S = 0.57 m, 286 mm at 1 yr, 429 mm at ≈ 2.4 yr. State the reinterpretation.`}</Md>
          <Md>{`**2012-13 Q12(b)** prints cv = 7.8 × 10³ in²/s (no minus sign); the handnote uses 7.8 × 10⁻³ in²/s and still gets hours, not years. Flag it and carry on with the formulas.`}</Md>
          <Md>{`**2015-16 Q10(b)**: Fig. 2 (layer thicknesses) is missing from the scan — the lab preset assumes 2 m sand, 3 m OC clay, 4 m NC clay. **Cs not given** (2020-21 Q3(a)): the handnote takes Cc/6; say which ratio you use.`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function DecisionChart() {
  const box = 'rounded-lg border border-line p-2 text-xs'
  return (
    <div className="grid cq-md:grid-cols-3 gap-2">
      <div className={box}>
        <b>Which Δp?</b>
        <div>Fill over the whole site → Δp = γh at every depth.</div>
        <div>Footing → 2:1 (Q/((B+z)(L+z)), circle Q/(π(D+z)²/4)) or Boussinesq / Fadum; small footing over a thick clay → Simpson (t + 4m + b)/6.</div>
        <div>"Load spread 1H:2V" on a raft → qD²/(D + z)².</div>
      </div>
      <div className={box}>
        <b>Which formula?</b>
        <div>pc′ not given / = p0′ → NC (Cc).</div>
        <div>pc′ &gt; p0′ + Δp → Cs only.</div>
        <div>p0′ &lt; pc′ &lt; p0′ + Δp → Cs to pc′, then Cc.</div>
        <div>e–p table given → e0, e1 by log interpolation, S = ΔeH/(1 + e0).</div>
      </div>
      <div className={box}>
        <b>Which time route?</b>
        <div>U = S_t/S → Tv → t = Tv d²/cv.</div>
        <div>t → Tv → U → S_t.</div>
        <div>Same soil, same U → t ∝ d²/cv (lab → field, A → B).</div>
        <div>d = H/2 if both faces drain, H if one is impervious.</div>
      </div>
    </div>
  )
}

const P2324 = SETTLE_PRESETS[0].inp
const P2021 = SETTLE_PRESETS[2].inp
function Approach() {
  const o1 = settleProfile(P2324)
  const o2 = settleProfile(P2021)
  return (
    <div>
      <Section title="Recipe (handnote style)">
        <Steps>
          <Step n={1} title="Sketch the profile">Layers with thicknesses, the WT, the load and its level; mark the mid-depth of each clay.</Step>
          <Step n={2} title="Clay properties">e0 = wGs, γsat = (Gs + e0)γw/(1 + e0), Cc = 0.009(LL − 10), Cs (given, from the loop, or Cc/5–Cc/10 stated).</Step>
          <Step n={3} title="p0′ at mid-depth">γh above the WT, (γsat − 9.81)h below; split thick clays into sub-layers.</Step>
          <Step n={4} title="Δp at mid-depth">Fill γh; footing 2:1 / Boussinesq / Fadum; Simpson over the layer when Δp drops fast.</Step>
          <Step n={5} title="NC or OC?">Compare p0′ and p0′ + Δp with pc′ — pick the branch.</Step>
          <Step n={6} title="S per layer, then add">Show each log term; settlement in mm.</Step>
          <Step n={7} title="Time">d, cv (given, √t, log t or k/mvγw), Tv ↔ U, t or S_t; t ∝ d²/cv for scaling.</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <DecisionChart />
        <Callout kind="trap">
          <Md>{`- Using the **full specimen thickness** as d in the lab (double drained → d = H/2) or two-way d for a clay on rock.
- (π/4)U² with U in **percent**; or (π/4)U² beyond 60 %.
- p0′ with γsat instead of γ′ below the WT; p0′ at the top of the clay instead of mid-depth.
- Δp at mid-depth only for a small footing on a thick clay (2023-24: 24 mm vs 37 mm with Simpson).
- Applying Cc all the way for an OC clay; or Cs all the way when the path crosses pc′.
- z for the 2:1 method measured from the **ground** instead of the footing base.
- Taking the 1 + e at pc′ as 1 + e0 is the usual simplification — fine, but know that SJMY's exact form uses 1 + ec.
- Secondary from t = 0: Ss runs from the **end of primary** (t1 = tp).`}</Md>
        </Callout>
      </Section>
      <Section title="2023-24 Q5(c), stepped through (latest paper)" sub="6 m NC clay at 8 m depth, 2 × 3 m footing carrying 250 kN on the clay top. 2:1 with Simpson. Handnote: ≈ 37 mm.">
        <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto mb-3">
          <div className="min-w-[600px]">
            <ProfileFig inp={P2324} out={o1} />
          </div>
        </div>
        <SettleSolution inp={P2324} out={o1} />
      </Section>
      <Section title="2020-21 Q3(a): the OC clay that crosses pc′" sub="Cs not given → Cc/6 (handnote); with Cc/10 it would be 89 mm.">
        <SettleSolution inp={P2021} out={o2} />
      </Section>
      <Section title="2023-24 Q7(b): time rate with the printed table">
        <Md>{`H = 5 m drained at the top only (d = 5 m), S = 310 mm, cv = 9.5 m²/yr.
- (i) U = 90/310 = **${f2((90 / 310) * 100)} %**.
- (ii) U = 75 % → Tv = (0.403 + 0.567)/2 = ${fmt(tvFromTable(75), 3)} → t = ${fmt(tvFromTable(75), 3)} × 25/9.5 = **${fmt((tvFromTable(75) * 25) / 9.5, 2)} years** (formula: Tv = 0.477, 1.26 yr).
- (iii) Both sides: d = 2.5 m; U = 65 % → Tv = ${fmt(tvFromTable(65), 3)} → t = ${fmt(tvFromTable(65), 3)} × 6.25/9.5 = **${fmt((tvFromTable(65) * 6.25) / 9.5, 3)} yr ≈ ${fmt(((tvFromTable(65) * 6.25) / 9.5) * 365, 0)} days**.`}</Md>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- practice problems
const OWN1: SettleIn = {
  layers: [
    { kind: 'sand', H: 3, gamma: 17, gammaSat: 19.5 },
    { kind: 'clay', H: 3, gamma: 20.5, gammaSat: 20.5, e0: 0.6, Cc: 0.25, Cs: 0.04, pc: 90, cv: 10 },
    { kind: 'clay', H: 5, gamma: 18.8, gammaSat: 18.8, e0: 1.05, Cc: 0.45, Cs: 0.07, cv: 1.5 },
  ],
  wt: 1.5,
  load: { kind: 'fill', q: 60 },
  baseDrains: true,
}
const OWN2_DP = 1500 / ((Math.PI * (2 + 2) ** 2) / 4)

const problems: SmQ[] = [
  {
    id: 'sm-own-consol-1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: '1',
    marks: 0,
    topics: ['sm-consol'],
    title: 'OC clay over NC clay under a fill, settlement after one year (2015-16 Q10(b) style)',
    text: `Sand 0–3 m (γ = 17, γsat = 19.5 kN/m³), WT at 1.5 m. Below: 3 m OC clay (γsat = 20.5, e0 = 0.60, Cc = 0.25, Cs = 0.04, pc′ = 90 kPa, cv = 10 m²/yr), then 5 m NC clay (γsat = 18.8, e0 = 1.05, Cc = 0.45, cv = 1.5 m²/yr), then sand. A wide fill adds 60 kPa. Find the settlement of each clay, the total, and the settlement after one year (each layer drains into the sands; use the exact Tv–U relation).`,
    pages: [],
    figure: () => <ProfileFig inp={OWN1} out={null} width={560} />,
    checks: () => {
      const o = settleProfile(OWN1)
      return [
        { key: 's1', label: 'OC clay settlement', value: o.layers[0].S * 1000, unit: 'mm' },
        { key: 's2', label: 'NC clay settlement', value: o.layers[1].S * 1000, unit: 'mm' },
        { key: 'st', label: 'settlement after 1 year', value: settleAt(OWN1, o, 1) * 1000, unit: 'mm' },
      ]
    },
    solution: () => {
      const o = settleProfile(OWN1)
      return (
        <div className="space-y-2">
          <SettleSolution inp={OWN1} out={o} />
          <Md>{`Time: both clays are bounded by sand above and the OC clay sits on the NC clay — the engine treats each clay as draining at a face that touches sand: OC clay one-way (d = 3 m, upward), NC clay one-way (d = 5 m, into the bottom sand). Tv = cv t/d² → U → S(1 yr) = ΣU_iS_i = **${fmt(settleAt(OWN1, o, 1) * 1000, 1)} mm**. (Treating the clay–clay interface as impervious is the safe assumption.)`}</Md>
        </div>
      )
    },
  },
  {
    id: 'sm-own-consol-2',
    paper: 'own',
    level: 'challenge',
    sec: 'B',
    no: '2',
    marks: 0,
    topics: ['sm-consol', 'sm-stress'],
    title: 'From oedometer data to the settlement of a heavier circular footing (Jan 2021 style)',
    text: `Use the Jan 2021 Q3(b) profile and oedometer data (sand 0–2 m, γ = 17 / 19; clay 2–4 m, γsat = 18, e0 = 0.80; GWT at 1.5 m; data 5 : 0.755 … 800 : 0.539), but the 2 m circular footing at 1 m now carries **1500 kN**. Find pc′ by the two-line intersection, decide the branch with the 2:1 Δp at mid-clay, and find the settlement.`,
    pages: [],
    checks: () => {
      const two = pcTwoLines(JAN21_OED)
      const dp = 1500 / ((Math.PI * 4 ** 2) / 4)
      const o = settleProfile({ layers: [{ kind: 'sand', H: 2, gamma: 17, gammaSat: 19 }, { kind: 'clay', H: 2, gamma: 18, gammaSat: 18, e0: 0.8, Cc: two.Cc, Cs: csFromData(JAN21_OED)!.Cs, pc: two.pc }], wt: 1.5, load: { kind: 'footing', shape: 'circle', B: 2, L: 2, Q: 1500, Df: 1, method: '21' } })
      return [
        { key: 'pc', label: 'pc′ (two lines)', value: two.pc, unit: 'kPa', tol: 0.06 },
        { key: 'dp', label: 'Δp at mid-clay', value: dp, unit: 'kPa' },
        { key: 's', label: 'settlement', value: o.S * 1000, unit: 'mm', tol: 0.05 },
      ]
    },
    solution: () => {
      const two = pcTwoLines(JAN21_OED)
      const cg = casagrande(JAN21_OED)
      const cs = csFromData(JAN21_OED)!.Cs
      const inp: SettleIn = { layers: [{ kind: 'sand', H: 2, gamma: 17, gammaSat: 19 }, { kind: 'clay', H: 2, gamma: 18, gammaSat: 18, e0: 0.8, Cc: two.Cc, Cs: cs, pc: two.pc }], wt: 1.5, load: { kind: 'footing', shape: 'circle', B: 2, L: 2, Q: 1500, Df: 1, method: '21' } }
      const o = settleProfile(inp)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`Recompression line (first three points) slope ${fmt(two.Cr, 4)}; virgin line 400 → 800 kPa: Cc = ${fmt(two.Cc, 3)}; they meet at **pc′ ≈ ${fmt(two.pc, 0)} kPa** (Casagrande on a square plot ≈ ${fmt(cg.pc, 0)} kPa). Cs from the unloading branch = ${fmt(cs, 4)}. With 1500 kN the 2:1 Δp at z = 2 m is ${f2(OWN2_DP)} kPa, so p0′ + Δp crosses pc′.`}</Md>
          <SettleSolution inp={inp} out={o} />
        </div>
      )
    },
  },
  {
    id: 'sm-own-consol-3',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: '3',
    marks: 0,
    topics: ['sm-consol'],
    title: 'Permeability ratio from two oedometer tests, then lab → field time (2017-18 Q8(a) + Q6(a) style)',
    text: 'Specimens A (2.5 cm) and B (2.0 cm), both double drained, have e = 0.88 and 0.74 at 150 kPa and 0.79 and 0.70 at 300 kPa. A reaches 50 % in twice the time B takes. (i) kA/kB. (ii) If A took 12 min for 50 %, how long will a 3 m layer of clay A drained on one side take for 50 %?',
    pages: [],
    checks: () => {
      const k = kRatio({ eA: [0.88, 0.79], eB: [0.74, 0.7], dp: 150, dA: 1.25, dB: 1, tA: 2, tB: 1 })
      return [
        { key: 'mv', label: 'mvA/mvB', value: k.mvRatio },
        { key: 'k', label: 'kA/kB', value: k.kRatio },
        { key: 't', label: 'field t50 (years)', value: scaleTime(12, 12.5, 3000) / (60 * 24 * 365), unit: 'yr' },
      ]
    },
    solution: () => {
      const k = kRatio({ eA: [0.88, 0.79], eB: [0.74, 0.7], dp: 150, dA: 1.25, dB: 1, tA: 2, tB: 1 })
      const t = scaleTime(12, 12.5, 3000)
      return (
        <Md>{R`$m_{vA} = \frac{0.09}{1.88(150)} = ${fmt(k.mvA, 6)}$, $m_{vB} = \frac{0.04}{1.74(150)} = ${fmt(k.mvB, 6)}$ → ratio **${fmt(k.mvRatio, 3)}**.
Same U: $c_v = T_vd^2/t$ → $\frac{c_{vA}}{c_{vB}} = \left(\frac{1.25}{1.0}\right)^2\frac{t_B}{t_A} = ${fmt(k.cvRatio, 4)}$.
$k = c_vm_v\gamma_w$ → $k_A/k_B = ${fmt(k.cvRatio, 4)} \times ${fmt(k.mvRatio, 3)} = $ **${fmt(k.kRatio, 3)}**.
Field: $d_{lab} = 12.5$ mm, $d_f = 3000$ mm (one side) → $t = 12(3000/12.5)^2 = ${fmt(t, 0)}$ min = **${fmt(t / (60 * 24 * 365), 2)} years**.`}</Md>
      )
    },
  },
]

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <Section title="Settlement calculator" sub="Build the profile (sand / clay, WT, wide fill or footing at any depth). σ′0 and σ′0 + Δp are drawn beside it; each clay's stress path on its e–log p shows whether it crosses pc′.">
        <SettleLab />
      </Section>
      <Section title="e–log p lab: pc′, Cc, Cs and the field curve" sub="Enter or 🎲 oedometer data. Step through Casagrande's construction; the two-line intersection is the check; Schmertmann's field curve from (p0′, e0) to 0.42e0.">
        <ElogpLab />
      </Section>
      <Section title="Time rate" sub="Tv ↔ U by the printed table, the two formulas or the exact series; one- vs two-way drainage; t ∝ d²/cv.">
        <RateLab />
      </Section>
      <Section title="Isochrone playground" sub="Press play: the excess pore pressure drains out from the faces first. The area left under the curve is 1 − U.">
        <IsochronePlayground />
      </Section>
      <Section title="cv from dial readings (√t and log t)" sub="One load increment; the constructions are drawn step by step on the generated readings.">
        <FitLab />
      </Section>
      <Section title="Secondary compression">
        <SecondaryLab />
      </Section>
      <Section title="Sand drains (Barron)">
        <DrainLab />
      </Section>
      <PickSection topic="sm-consol" skills={CONSOL_PICKS} />
      <ConsolProblems />
    </div>
  ),
  problems,
  theory: CONSOL_THEORY,
}
export default mod
