// CE 341 term final 2015-16 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q9–Q12, any THREE), held 14 Jan 2017, PDF pp. 32–33. Figs. 1–5 are missing from the scan: parts that need
// them are solved as far as the printed data allow, with the method and (clearly marked) illustrative numbers.
import { Md, Tex } from '../../../components/ui'
import { fieldTest, satOf, voidRatio, zav, eAfterSettlement, gammaD } from '../../engine/compaction'
import { e0FromWGs, gammaSatFromGsE, settleAt, settleProfile, type SettleIn } from '../../engine/consolidation'
import { constantHead } from '../../engine/permeability'
import { effWithFlow, gsatFromGsE, gsubFromGsE, icrFromGsE } from '../../engine/stresses'
import { type Rect } from '../../engine/stressdist'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import { ProfileFig } from '../../topics/consol/figs'
import { Chart, pathOf } from '../../topics/consol/plot'
import { SettleSolution } from '../../topics/consol/Solution'
import type { SmQ } from '../../types'
import { f0, f2, f3, f4, Frm, Head, MissingFig, Model, Models, newmarkOf, NewmarkSolved, Note, PlanFig, Result, sci, sciTex, shift, Sol, Tbl, th } from './old-kit'

const P = '2015-16' as const

// ---------------------------------------------------------------- Q9(a)(ii) ZAV, Gs = 2.74 (ρw = 1 g/cm³)
const GS9 = 2.74
const W9 = [0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22]

// ---------------------------------------------------------------- Q9(a)(iii) field density
const fd9 = () => {
  const w = fieldTest({ V: 1, Wwet: 26.3, Wdry: 22.8 }).w
  const f = fieldTest({ gb: 957 / 450, w })
  const e = voidRatio(f.gd, GS9, 1)
  return { ...f, mddMax: f.gd / 0.95, lo: w - 0.015, hi: w + 0.015, e, S: satOf(w, f.gd, GS9, 1) }
}

// ---------------------------------------------------------------- Q9(b) embankment section from a borrow pit
const EW9 = EW_PRESETS[3].ew
const r9b = () => {
  const p = runEarthwork(EW9).res[0].p
  const gdB = gammaD(18, 0.08)
  const eB = voidRatio(gdB, 2.67)
  const eE = voidRatio(15, 2.67)
  return { p, gdB, eB, SB: satOf(0.08, gdB, 2.67), eE, SE: satOf(0.1, 15, 2.67), eN: eAfterSettlement(eE, 0.12, 3.0) }
}

// ---------------------------------------------------------------- Q10(b) OC + NC clay under a 2 m fill (Fig. 2 missing: illustrative profile)
const OC = { w: 0.2, Gs: 2.7 }
const NC = { w: 0.29, Gs: 2.7 }
const eOC = e0FromWGs(OC.w, OC.Gs)
const eNC = e0FromWGs(NC.w, NC.Gs)
const gOC = gammaSatFromGsE(2.7, eOC)
const gNC = gammaSatFromGsE(2.7, eNC)
const SET10: SettleIn = {
  layers: [
    { kind: 'sand', H: 2, gamma: 16, gammaSat: 19 },
    { kind: 'clay', H: 1.5, gamma: gOC, gammaSat: gOC, e0: eOC, Cc: 0.55, Cs: 0.06, pc: 50, cv: 13 },
    { kind: 'sand', H: 1, gamma: 19, gammaSat: 19 },
    { kind: 'clay', H: 8, gamma: gNC, gammaSat: gNC, e0: eNC, Cc: 0.6, cv: 2.5 },
  ],
  wt: 2,
  load: { kind: 'fill', q: 2 * 20 },
  baseDrains: true,
}
const MONTHS = [1, 3, 6, 12, 24, 36, 60, 120]
const r10 = () => {
  const out = settleProfile(SET10)
  const at = (mo: number) => settleAt(SET10, out, mo / 12, 'approx')
  // time for 200 mm (bisection in months)
  let lo = 0.01
  let hi = 600
  for (let k = 0; k < 80; k++) {
    const m = (lo + hi) / 2
    if (at(m) < 0.2) lo = m
    else hi = m
  }
  return { out, at, t200: (lo + hi) / 2 }
}

// ---------------------------------------------------------------- Q11(b) upward-flow permeameter (Fig. 3 missing)
const PM = { D: 10, e: 0.82, Gs: 2.68, h: 15, Q: 175, t: 900, zA: 0.22 }
const LILL = 30 // cm, the handnote's example length
const r11b = (L: number) => {
  const icr = icrFromGsE(PM.Gs, PM.e)
  const gsub = gsubFromGsE(PM.Gs, PM.e)
  const c = constantHead({ Q: PM.Q, L, h: PM.h, t: PM.t, D: PM.D })
  const i = PM.h / L
  return { icr, gsub, A: c.A, k: c.k, kPerL: c.k / L, hmax: icr * L, i, sA: effWithFlow(PM.zA, gsub, i, 'up') }
}

// ---------------------------------------------------------------- Q11(c) sheet pile in sandy silt (Fig. 4 missing)
const r11c = () => {
  const e = e0FromWGs(0.33, 2.66)
  const gsat = gsatFromGsE(2.66, e)
  const gsub = gsubFromGsE(2.66, e)
  const k = 1.6e-6 // m/s
  return { e, gsat, gsub, icr: icrFromGsE(2.66, e), coef: k * 9 * 86400, k }
}

// ---------------------------------------------------------------- Q12(b) illustrative plan (Fig. 5 missing)
const ILL12: Rect[] = [
  { x1: 0, y1: 0, x2: 12, y2: 6 },
  { x1: 0, y1: 6, x2: 6, y2: 12 },
]
const A12: [number, number] = [6, 6]

export const B2015: SmQ[] = [
  {
    id: 'sm-2015-16-9a-i',
    paper: P,
    sec: 'B',
    no: '9(a)(i)',
    marks: 10.67,
    topics: ['sm-comp'],
    title: 'Two ways of specifying compaction; the zero-air-void line',
    text: 'Explain "there are two ways of specifying compaction of earth work". What is zero air void line?',
    pages: [32],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Two ways of specifying compaction', item: th('sm-comp', 't-spec') },
          { title: 'Zero-air-void line', item: th('sm-comp', 't-curve') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2015-16-9a-ii',
    paper: P,
    sec: 'B',
    no: '9(a)(ii)',
    marks: 8,
    topics: ['sm-comp'],
    title: 'Draw the ZAV curve (Gs = 2.74) on the given Proctor curve',
    text: 'A standard Proctor test was carried out on a soil sample ($G_s$ = 2.74) collected from an earthwork. The compaction curve is shown in Fig. 1. Draw the zero air void curve on the same figure. (Please attach Fig. 1 with the answer script.)',
    pages: [32],
    given: [{ label: 'Fig. 1 compaction curve', what: 'missing from the scan' }],
    figure: () => <MissingFig what="Fig. 1 (the compaction curve)">The ZAV values below do not depend on it; only the plotting does.</MissingFig>,
    checks: () => [
      { key: 'z10', label: '$\\rho_{zav}$ at w = 10 %', value: zav(0.1, GS9, 1), unit: 'g/cm³' },
      { key: 'z14', label: '$\\rho_{zav}$ at w = 14 %', value: zav(0.14, GS9, 1), unit: 'g/cm³' },
      { key: 'z18', label: '$\\rho_{zav}$ at w = 18 %', value: zav(0.18, GS9, 1), unit: 'g/cm³' },
      { key: 'z22', label: '$\\rho_{zav}$ at w = 22 %', value: zav(0.22, GS9, 1), unit: 'g/cm³' },
    ],
    solution: () => (
      <Sol>
        <Md>{`At zero air voids the soil is saturated (S = 1, e = wGs), so $\\rho_{zav} = \\dfrac{G_s\\rho_w}{1 + wG_s} = \\dfrac{2.74}{1 + 2.74w}$ g/cm³. Compute it over the range of water contents on Fig. 1's axis and plot the points on the same axes:`}</Md>
        <Tbl head={['w (%)', ...W9.map((w) => f0(w * 100))]} rows={[['ρzav (g/cm³)', ...W9.map((w) => f3(zav(w, GS9, 1)))]]} />
        <Frm>
          <div className="max-w-[440px] mx-auto">
            <Chart w={420} h={240} x={{ min: 8, max: 24, label: 'water content w (%)' }} y={{ min: 1.6, max: 2.25, label: 'ρ (g/cm³)' }} label="zero air void curve">
              {(s) => (
                <>
                  <path d={pathOf(Array.from({ length: 33 }, (_, i) => 8 + i * 0.5).map((w) => [w, zav(w / 100, GS9, 1)] as [number, number]), s)} fill="none" stroke="var(--c-water)" strokeWidth={2} />
                  {W9.map((w) => (
                    <circle key={w} cx={s.X(w * 100)} cy={s.Y(zav(w, GS9, 1))} r={3} fill="var(--c-water)" />
                  ))}
                  <text x={s.X(9)} y={s.Y(2.2)} fontSize={10} fill="var(--c-water)">
                    ZAV (S = 100 %), Gs = 2.74
                  </text>
                </>
              )}
            </Chart>
          </div>
        </Frm>
        <Result>{`ZAV curve: **${W9.map((w) => `${f0(w * 100)} % → ${f2(zav(w, GS9, 1))}`).join('; ')} g/cm³**. The compaction curve of Fig. 1 must lie wholly below it and approach it on the wet side.`}</Result>
      </Sol>
    ),
    notes: ['The handnote lists 1.93, 1.77, 1.64, 1.53 t/m³ at 10, 14, 18, 22 % — these are wrong: 2.74/(1 + 2.74 × 0.10) = 2.15, not 1.93. The values above are the correct ones.', 'Fig. 1 is missing from the scan.'],
  },
  {
    id: 'sm-2015-16-9a-iii',
    paper: P,
    sec: 'B',
    no: '9(a)(iii)',
    marks: 8,
    topics: ['sm-comp'],
    title: 'Field density test against RC ≥ 95 % and OMC ± 1.5 %',
    text: 'The specification for the earthwork requires that the soil be compacted to a relative compaction of at least 95% of standard Proctor and the water content should be within ±1.5% of OMC. In a field density test, 957 g of soil was removed from a hole of measured volume of 450 cm³. A 26.3 g sample of this soil had an oven-dried mass of 22.8 g. Does the compaction meet the specifications?',
    pages: [32],
    given: [{ label: 'Fig. 1 compaction curve', what: 'MDD and OMC (missing from the scan)' }],
    checks: () => {
      const r = fd9()
      return [
        { key: 'rb', label: 'Bulk density', value: r.gb, unit: 'g/cm³' },
        { key: 'w', label: 'Water content', value: r.w * 100, unit: '%' },
        { key: 'rd', label: 'Field dry density', value: r.gd, unit: 'g/cm³' },
        { key: 'mdd', label: 'Largest MDD that still passes (ρd/0.95)', value: r.mddMax, unit: 'g/cm³' },
      ]
    },
    solution: () => {
      const r = fd9()
      return (
        <Sol>
          <Tex block>{`\\rho_b = \\frac{957}{450} = ${f3(r.gb)}\\ \\text{g/cm}^3,\\quad w = \\frac{26.3 - 22.8}{22.8} = ${f2(r.w * 100)}\\ \\%,\\quad \\rho_d = \\frac{\\rho_b}{1 + w} = \\frac{${f3(r.gb)}}{${f4(1 + r.w)}} = ${f3(r.gd)}\\ \\text{g/cm}^3`}</Tex>
          <Md>{`**Conditions** (MDD and OMC are read from Fig. 1):
- Relative compaction $\\rho_d/\\text{MDD} \\ge 0.95$ ⟺ $\\text{MDD} \\le ${f3(r.gd)}/0.95 = ${f3(r.mddMax)}$ g/cm³.
- Water content within ±1.5 % of OMC ⟺ $${f2(r.lo * 100)}\\ \\% \\le \\text{OMC} \\le ${f2(r.hi * 100)}\\ \\%$.`}</Md>
          <Md>{`Check of the field point: $e = G_s\\rho_w/\\rho_d - 1 = ${f3(r.e)}$, $S = wG_s/e = ${f2(r.S * 100)}$ % — below 100 %, so the point lies under the ZAV curve, as it must.`}</Md>
          <Result>{`ρd = **${f3(r.gd)} g/cm³** at w = **${f2(r.w * 100)} %**. The compaction meets the specification only if Fig. 1 gives MDD ≤ **${f3(r.mddMax)} g/cm³** and OMC between **${f2(r.lo * 100)} % and ${f2(r.hi * 100)} %**; otherwise it fails (re-roll, or adjust the water).`}</Result>
          <Note>Fig. 1 is missing from the scan, so the final yes/no cannot be given here; read MDD and OMC from your copy and apply the two conditions.</Note>
        </Sol>
      )
    },
    notes: ['Fig. 1 (compaction curve) is missing from the scan; the handnote stops at the same two conditions (MDD ≤ 1.941 g/cm³, OMC 13.85–16.85 %).'],
  },
  {
    id: 'sm-2015-16-9b',
    paper: P,
    sec: 'B',
    no: '9(b)',
    marks: 20,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Borrow pit for a 4 m embankment: volume, e and S, new e after 120 mm settlement',
    text: 'Earth is excavated from a borrow pit for building an embankment. The wet unit weight of the borrow soil is 18 kN/m³ and its natural moisture content is 8%. $G_s$ = 2.67. The embankment is 4.0 m high with a top width of 2.0 m and side slopes 1:1.\n\n(i) Estimate the quantity of earth required to be excavated per metre length of embankment. The dry unit weight required in the embankment is 15 kN/m³ with a moisture content of 10%.\n(ii) Calculate the void ratio and degree of saturation of the soil in both its undisturbed and remoulded states.\n(iii) Six months after construction, the embankment settled by 120 mm. What is the new void ratio? Assume the average height of the embankment is 3.0 m.',
    pages: [32],
    given: [],
    checks: () => {
      const r = r9b()
      return [
        { key: 'A', label: 'Section area per metre', value: r.p.Ws / 15, unit: 'm²' },
        { key: 'V', label: '(i) Excavation per metre length', value: r.p.Vbank, unit: 'm³' },
        { key: 'eB', label: '(ii) Void ratio in the borrow pit', value: r.eB },
        { key: 'SB', label: '(ii) Degree of saturation in the borrow pit', value: r.SB * 100, unit: '%' },
        { key: 'eE', label: '(ii) Void ratio in the embankment', value: r.eE },
        { key: 'SE', label: '(ii) Degree of saturation in the embankment', value: r.SE * 100, unit: '%' },
        { key: 'eN', label: '(iii) New void ratio after 120 mm settlement', value: r.eN },
      ]
    },
    solution: () => {
      const r = r9b()
      return (
        <Sol>
          <Head>(i) Volume per metre</Head>
          <EarthworkSolution ew={EW9} />
          <Head>(ii) Void ratio and saturation</Head>
          <Tex block>{`\\text{Borrow (undisturbed): } \\gamma_d = \\frac{18}{1.08} = ${f2(r.gdB)},\\ e = \\frac{G_s\\gamma_w}{\\gamma_d} - 1 = \\frac{2.67 \\times 9.81}{${f2(r.gdB)}} - 1 = ${f3(r.eB)},\\ S = \\frac{wG_s}{e} = \\frac{0.08 \\times 2.67}{${f3(r.eB)}} = ${f2(r.SB * 100)}\\ \\%`}</Tex>
          <Tex block>{`\\text{Embankment (remoulded): } e = \\frac{2.67 \\times 9.81}{15} - 1 = ${f3(r.eE)},\\ S = \\frac{0.10 \\times 2.67}{${f3(r.eE)}} = ${f2(r.SE * 100)}\\ \\%`}</Tex>
          <Head>(iii) After 120 mm of settlement</Head>
          <Md>{`Only the voids compress: $\\dfrac{\\Delta H}{H} = \\dfrac{\\Delta e}{1 + e_0}$ with the average height 3.0 m.`}</Md>
          <Tex block>{`\\Delta e = (1 + ${f3(r.eE)})\\frac{0.12}{3.0} = ${f3(1 + r.eE)} \\times 0.04 = ${f4((1 + r.eE) * 0.04)},\\qquad e = ${f3(r.eE)} - ${f4((1 + r.eE) * 0.04)} = ${f3(r.eN)}`}</Tex>
          <Result>{`(i) **${f2(r.p.Vbank)} m³** of borrow soil per metre; (ii) borrow e = **${f3(r.eB)}**, S = **${f2(r.SB * 100)} %**; embankment e = **${f3(r.eE)}**, S = **${f2(r.SE * 100)} %**; (iii) new e = **${f3(r.eN)}**.`}</Result>
        </Sol>
      )
    },
    notes: ['"Undisturbed" = in the borrow pit, "remoulded" = as compacted in the embankment.'],
  },
  {
    id: 'sm-2015-16-10a',
    paper: P,
    sec: 'B',
    no: '10(a)',
    marks: 16.67,
    topics: ['sm-consol'],
    title: 'Step-by-step procedure for the time–settlement curve',
    text: 'Write down the step by step procedure for calculating the rate of settlement (time vs. settlement) due to consolidation.',
    pages: [32],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-tv')} />,
  },
  {
    id: 'sm-2015-16-10b',
    paper: P,
    sec: 'B',
    no: '10(b)',
    marks: 30,
    topics: ['sm-consol'],
    title: 'OC over NC clay under a 2 m fill: ultimate settlement, 1 month, time–settlement curve, time to 200 mm',
    text: 'Two undisturbed clay samples were taken from the middle of the OC and NC clay layers as shown in Fig. 2. The water table is located at the top of the OC clay layer. A 2.0 m high compacted fill with unit weight of 20 kN/m³ is placed at the ground level.\n\n| | O.C clay | N.C clay |\n|---|---|---|\n| Natural water content | 20% | 29% |\n| Preconsolidation pressure (kPa) | 50.0 | — |\n| Compression index | 0.55 | 0.60 |\n| Swell index | 0.06 | — |\n| Coefficient of consolidation (m²/year) | 13.0 | 2.5 |\n\nUnit weight of sand above and below water are 160 and 19.0 kN/m³ respectively. Specific gravity of clay grains = 2.70.\n\n(i) What is the primary consolidation settlement?\n(ii) What would be the consolidation settlement after one month?\n(iii) Plot the consolidation vs. time (say 1, 6, 12, 24, 36, 60 months etc.) and calculate the time required to reach 200 mm of consolidation settlement.',
    pages: [32, 33],
    given: [{ label: 'Fig. 2 soil profile', what: 'layer thicknesses (missing from the scan)' }],
    figure: () => (
      <div className="space-y-2">
        <MissingFig what="Fig. 2 (sand / OC clay / NC clay profile with thicknesses)">The sketch below is an illustrative profile used to show the full working; substitute your thicknesses.</MissingFig>
        <Frm wide={560}>
          <ProfileFig inp={SET10} out={null} />
        </Frm>
      </div>
    ),
    checks: () => {
      const r = r10()
      const [oc, nc] = r.out.layers
      return [
        { key: 'eoc', label: 'OC clay $e_0 = wG_s$', value: eOC },
        { key: 'enc', label: 'NC clay $e_0$', value: eNC },
        { key: 'goc', label: 'OC clay $\\gamma_{sat}$', value: gOC, unit: 'kN/m³' },
        { key: 'gnc', label: 'NC clay $\\gamma_{sat}$', value: gNC, unit: 'kN/m³' },
        { key: 'dp', label: 'Δp from the fill (every depth)', value: 40, unit: 'kPa' },
        { key: 'soc', label: 'Assumed profile: OC layer settlement', value: oc.S * 1000, unit: 'mm', tol: 0.03 },
        { key: 'snc', label: 'Assumed profile: NC layer settlement', value: nc.S * 1000, unit: 'mm', tol: 0.03 },
        { key: 's', label: 'Assumed profile: (i) total primary settlement', value: r.out.S * 1000, unit: 'mm', tol: 0.03 },
        { key: 's1', label: 'Assumed profile: (ii) settlement after 1 month', value: r.at(1) * 1000, unit: 'mm', tol: 0.04 },
        { key: 't200', label: 'Assumed profile: (iii) time to 200 mm', value: r.t200, unit: 'months', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = r10()
      const [oc, nc] = r.out.layers
      const tMax = 120
      const ts = Array.from({ length: 121 }, (_, i) => (i / 120) * tMax)
      return (
        <Sol>
          <Md>{`**Data that do not depend on Fig. 2.** Both clays are below the WT (saturated): $e_0 = wG_s$ → OC: $0.20 \\times 2.70 = ${f3(eOC)}$, $\\gamma_{sat} = (2.70 + ${f3(eOC)})9.81/${f3(1 + eOC)} = ${f2(gOC)}$ kN/m³; NC: $0.29 \\times 2.70 = ${f3(eNC)}$, $\\gamma_{sat} = ${f2(gNC)}$ kN/m³. The fill is wide: $\\Delta p = 2.0 \\times 20 = 40$ kPa at every depth. Sand: 16.0 kN/m³ above the WT ("160" is a misprint), 19.0 below.`}</Md>
          <Md>{`**Illustrative profile** (Fig. 2 missing): sand 2 m (above the WT) → OC clay 1.5 m → sand 1 m → NC clay 8 m → sand. Each clay layer then drains at both faces and is treated on its own (own cv, d = H/2).`}</Md>
          <Head>(i) Ultimate primary settlement</Head>
          <SettleSolution inp={SET10} out={r.out} />
          <Head>(ii)–(iii) Settlement with time</Head>
          <Md>{`Each layer: $T_v = c_vt/d^2$ → U (π/4 U² below 60 %, 1.781 − 0.933 log(100 − U) above) → $S_t = U_1S_1 + U_2S_2$. OC: $d = ${f2(oc.d)}$ m, $c_v = 13$ m²/yr; NC: $d = ${f2(nc.d)}$ m, $c_v = 2.5$ m²/yr.`}</Md>
          <Tbl
            head={['t (months)', 'Tv (OC)', 'Tv (NC)', 'S_t (mm)']}
            rows={MONTHS.map((m) => [f0(m), f3((13 * (m / 12)) / oc.d ** 2), f3((2.5 * (m / 12)) / nc.d ** 2), f2(r.at(m) * 1000)])}
          />
          <Frm>
            <div className="max-w-[440px] mx-auto">
              <Chart w={420} h={240} x={{ min: 0, max: tMax, label: 'time (months)' }} y={{ min: 0, max: Math.ceil((r.out.S * 1000) / 50) * 50, flip: true, label: 'settlement (mm)' }} label="consolidation settlement against time">
                {(s) => (
                  <>
                    <path d={pathOf(ts.map((t) => [t, r.at(t) * 1000] as [number, number]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
                    <line x1={s.L} x2={s.X(r.t200)} y1={s.Y(200)} y2={s.Y(200)} stroke="var(--c-load)" strokeDasharray="4 3" />
                    <line x1={s.X(r.t200)} x2={s.X(r.t200)} y1={s.Y(200)} y2={s.Y(0)} stroke="var(--c-load)" strokeDasharray="4 3" />
                    <circle cx={s.X(r.t200)} cy={s.Y(200)} r={3.5} fill="var(--c-load)" />
                  </>
                )}
              </Chart>
            </div>
          </Frm>
          <Result>{`With the illustrative profile: (i) S = **${f2(r.out.S * 1000)} mm** (OC ${f2(oc.S * 1000)} + NC ${f2(nc.S * 1000)}); (ii) after one month ≈ **${f2(r.at(1) * 1000)} mm**; (iii) 200 mm is reached after about **${f2(r.t200)} months**. The OC layer (high cv, small Cs) is almost finished within a few months; the NC layer controls the long tail.`}</Result>
          <Note>The method, e0, γsat and Δp are fixed by the printed data; every settlement and time depends on the layer thicknesses in Fig. 2, which the scan does not show.</Note>
        </Sol>
      )
    },
    notes: ['Fig. 2 is missing from the scan; the handnote also leaves the answer in symbols. The profile used here (2 m sand, 1.5 m OC clay, 1 m sand, 8 m NC clay, sand below) is an assumption for illustration only.', 'The sand unit weight is printed "160"; 16.0 kN/m³ is meant.', 'OC branch: p′0 + Δp > pc′ = 50 kPa in the assumed profile, so both terms (Cs to pc′, Cc beyond) are used, with 1 + e0 in both.'],
  },
  {
    id: 'sm-2015-16-11a',
    paper: P,
    sec: 'B',
    no: '11(a)',
    marks: 16.67,
    topics: ['sm-seep', 'sm-perm'],
    title: 'Effective-stress principle and its role; k of clay; typical k of sand and clay',
    text: 'What is the principle of effective stress? Discuss its role in geotechnical engineering problems. How can you estimate the coefficient of permeability of a clayey soil? Give typical values of coefficient of permeability (cm/s) for sand clay.',
    pages: [33],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Principle of effective stress and its role', item: th('sm-seep', 't-eff-principle') },
          { title: 'k of a clayey soil', item: th('sm-perm', 't-k-clay') },
          { title: 'Typical values', item: th('sm-perm', 't-typical-k') },
        ]}
      />
    ),
    notes: ['"for sand clay" is printed without "and".'],
  },
  {
    id: 'sm-2015-16-11b',
    paper: P,
    sec: 'B',
    no: '11(b)',
    marks: 15,
    topics: ['sm-seep', 'sm-perm'],
    title: 'Upward-flow permeameter: largest h before quick condition; k and σ′ at A',
    text: 'Water flows through a granular soil specimen of 100 mm diameter as shown in Fig. 3. The water levels on both sides are kept constant during the test. The void ratio and specific gravity of the soil are 0.82 and 2.68 respectively.\n\n(i) What is the largest value of h for which the soil will not reach the quick condition?\n(ii) For h = 150 mm, 175 ml of water was collected in 15 minutes. Find the coefficient of permeability of the soil, and the effective stress at A which is 220 mm below the top of the sample.',
    pages: [33],
    given: [{ label: 'Fig. 3 permeameter', what: 'sample length L (missing from the scan)' }],
    figure: () => <MissingFig what="Fig. 3 (the permeameter, sample length L)">Upward flow is assumed (a quick condition can only occur with upward flow).</MissingFig>,
    checks: () => {
      const r = r11b(LILL)
      return [
        { key: 'icr', label: '$i_{cr} = (G_s - 1)/(1 + e)$', value: r.icr },
        { key: 'g', label: "$\\gamma'$", value: r.gsub, unit: 'kN/m³' },
        { key: 'kL', label: 'k per cm of sample length, k/L', value: r.kPerL * 1e4, unit: '× 10⁻⁴ s⁻¹' },
        { key: 'hm', label: 'Illustration L = 300 mm: (i) largest h', value: r.hmax * 10, unit: 'mm' },
        { key: 'k', label: 'Illustration L = 300 mm: (ii) k', value: r.k * 1e3, unit: '× 10⁻³ cm/s' },
        { key: 'sA', label: "Illustration L = 300 mm: (ii) σ′ at A", value: r.sA, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = r11b(LILL)
      return (
        <Sol>
          <Tex block>{`i_{cr} = \\frac{G_s - 1}{1 + e} = \\frac{1.68}{1.82} = ${f3(r.icr)},\\qquad \\gamma' = \\frac{(G_s - 1)\\gamma_w}{1 + e} = ${f2(r.gsub)}\\ \\text{kN/m}^3,\\qquad A = \\frac{\\pi}{4}(10)^2 = ${f2(r.A)}\\ \\text{cm}^2`}</Tex>
          <Md>{`**(i)** The head h is lost across the sample length L (Fig. 3). Quick condition when $h/L = i_{cr}$: $h_{max} = ${f3(r.icr)}L$.`}</Md>
          <Md>{`**(ii)** $k = \\dfrac{QL}{Aht} = \\dfrac{175L}{${f2(r.A)} \\times 15 \\times 900} = ${sciTex(r.kPerL, 3)}\\,L$ cm/s (L in cm). At A, 0.22 m below the top of the sample, upward flow reduces σ′: $\\sigma'_A = z(\\gamma' - i\\gamma_w) = 0.22\\left(${f2(r.gsub)} - \\frac{0.15}{L}\\times 9.81\\right)$ kPa (L in m).`}</Md>
          <Head>Illustration with L = 300 mm (the handnote's example)</Head>
          <Tex block>{`h_{max} = ${f3(r.icr)} \\times 300 = ${f0(r.hmax * 10)}\\ \\text{mm};\\quad k = ${sciTex(r.k, 3)}\\ \\text{cm/s};\\quad i = 150/300 = ${f2(r.i)},\\ \\sigma'_A = 0.22(${f2(r.gsub)} - ${f2(r.i)} \\times 9.81) = ${f3(r.sA)}\\ \\text{kPa}`}</Tex>
          <Result>{`icr = **${f3(r.icr)}**, so h(max) = **${f3(r.icr)}L**; k = **${sci(r.kPerL, 3)} × L** cm/s; σ′A = 0.22(${f2(r.gsub)} − 1.4715/L) kPa. With L = 300 mm: ${f0(r.hmax * 10)} mm, ${f3(r.k * 1e3)} × 10⁻³ cm/s and ${f2(r.sA)} kPa.`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 3 is missing from the scan: the sample length L and the flow direction are unknown. Upward flow is assumed (as the handnote), and L = 300 mm is only an illustration.'],
  },
  {
    id: 'sm-2015-16-11c',
    paper: P,
    sec: 'B',
    no: '11(c)',
    marks: 15,
    topics: ['sm-seep'],
    title: 'Sheet pile in sandy silt (Fig. 4 net): seepage, pore pressure at A, piping FS by Terzaghi and Harza',
    text: 'A sheet pile is driven in sandy silt and seepage takes place under a head difference of 9.0 m as shown in Fig. 4. The coefficient of permeability of the soil is 1.6 × 10⁻⁴ cm/s, water content 33% and specific gravity 2.66. Using the flow net shown in Fig. 4, compute: (i) the seepage loss in m³/day per metre run, (ii) the pore water pressure at A, (iii) the factor of safety against piping by Terzaghi\'s and Harza\'s criteria. (Please attach Fig. 4 with the answer script.)',
    pages: [33],
    given: [{ label: 'Fig. 4 flow net', what: 'missing from the scan' }],
    figure: () => <MissingFig what="Fig. 4 (sheet pile, flow net and point A)">Read Nf, Nd, the pile depth D and the drops used before A from your copy.</MissingFig>,
    checks: () => {
      const r = r11c()
      return [
        { key: 'e', label: '$e = wG_s$ (saturated)', value: r.e },
        { key: 'gs', label: '$\\gamma_{sat}$', value: r.gsat, unit: 'kN/m³' },
        { key: 'icr', label: '$i_{cr}$', value: r.icr },
        { key: 'qc', label: 'q per unit Nf/Nd', value: r.coef, unit: 'm³/day per m' },
        { key: 'q48', label: 'q if the net has Nf/Nd = 4/8', value: r.coef * 0.5, unit: 'm³/day per m' },
      ]
    },
    solution: () => {
      const r = r11c()
      return (
        <Sol>
          <Tex block>{`e = wG_s = 0.33 \\times 2.66 = ${f3(r.e)},\\quad \\gamma_{sat} = \\frac{(2.66 + ${f3(r.e)})9.81}{${f3(1 + r.e)}} = ${f2(r.gsat)},\\quad \\gamma' = ${f2(r.gsub)}\\ \\text{kN/m}^3,\\quad i_{cr} = \\frac{\\gamma'}{\\gamma_w} = ${f3(r.icr)}`}</Tex>
          <Md>{`**(i) Seepage.** $q = kH\\dfrac{N_f}{N_d} = 1.6\\times10^{-6} \\times 9.0 \\times 86400 \\times \\dfrac{N_f}{N_d} = ${f3(r.coef)}\\dfrac{N_f}{N_d}$ m³/day per m. For example a net of 4 channels and 8 drops gives ${f3(r.coef * 0.5)} m³/day per m.`}</Md>
          <Md>{`**(ii) Pore pressure at A.** With $n_A$ drops used before A, the head left is $9.0 - n_A(9.0/N_d)$ above the downstream water; $u_A = [\\text{depth of A below the downstream water level} + 9.0 - n_A\\,9.0/N_d]\\gamma_w$ (or, from the upstream side, [depth below the upstream water level − $n_A\\Delta h$]γw).`}</Md>
          <Md>{`**(iii) Piping.** Harza: $i_e = \\Delta h/l$ in the last field beside the pile, $FS = ${f3(r.icr)}/i_e$. Terzaghi: prism D × D/2 beside the pile on the downstream side; $h_a$ = average excess head along its base (pile-tip level) from the net; $FS = \\dfrac{D\\gamma'}{h_a\\gamma_w} = \\dfrac{${f2(r.gsub)}D}{9.81h_a}$.`}</Md>
          <Result>{`icr = **${f3(r.icr)}**; q = **${f3(r.coef)} × Nf/Nd** m³/day per metre; uA and both safety factors follow from the counted net of Fig. 4 by the formulas above.`}</Result>
          <Note>Fig. 4 is missing from the scan, so Nf, Nd, D and the position of A cannot be read; the solution stops where the handnote stops. The flow-net simulator (seepage topic) shows the full working for a sheet pile with any geometry.</Note>
        </Sol>
      )
    },
    notes: ['Fig. 4 (flow net) is missing from the scan.'],
  },
  {
    id: 'sm-2015-16-12a',
    paper: P,
    sec: 'B',
    no: '12(a)',
    marks: 16.67,
    topics: ['sm-consol'],
    title: 'Short notes: Cc, mv, preconsolidation pressure',
    text: 'Write short notes on: (i) Compression index (ii) Co-efficient of volume compressibility (iii) Pre-consolidation pressure.',
    pages: [33],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: '(i) Compression index, (ii) coefficient of volume compressibility', item: th('sm-consol', 't-cv') },
          { title: '(iii) Pre-consolidation pressure', item: th('sm-consol', 't-pc') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2015-16-12b',
    paper: P,
    sec: 'B',
    no: '12(b)',
    marks: 30,
    topics: ['sm-stress'],
    title: 'σz 5 m below A of a loaded area (200 kPa): analytically and by Newmark’s chart',
    text: "The area shown in Fig. 5 carries a uniform pressure of 200 kPa. Find the increase in vertical stress at a depth of 5.0 m below the point A, both analytically and graphically (using Newmark's chart).",
    pages: [33],
    given: [
      { label: 'Fig. 5 loaded area', what: 'missing from the scan' },
      { label: "Newmark's chart", what: '0.005, 200 meshes', ref: 'd-newmark' },
    ],
    figure: () => (
      <div className="space-y-2">
        <MissingFig what="Fig. 5 (plan of the loaded area and point A)">The L-shaped plan below is only an illustration of the two methods.</MissingFig>
        <div className="max-w-[360px] mx-auto">
          <PlanFig
            rects={ILL12}
            P={A12}
            label="A"
            dims={[
              { a: [0, 0], b: [12, 0], text: '12 m', off: 14 },
              { a: [0, 0], b: [0, 12], text: '12 m' },
              { a: [6, 12], b: [6, 6], text: '6 m', off: 14 },
            ]}
          />
        </div>
      </div>
    ),
    checks: () => {
      const n = newmarkOf(shift(ILL12, A12), 5)
      return [
        { key: 'sa', label: 'Illustration: σz by corner rectangles (analytical)', value: n.I * 200, unit: 'kPa', tol: 0.03 },
        { key: 'N', label: 'Illustration: Newmark meshes covered', value: n.N, tol: 0.05 },
      ]
    },
    solution: () => (
      <Sol>
        <Md>{`**Method (any plan).** *Analytical:* split the area into rectangles that each have a corner at A — add loaded rectangles, subtract fictitious ones where A lies outside — and sum $I(m, n)$ with $m = B/5$, $n = L/5$ (Fadum / Newmark corner formula): $\\sigma_z = 200\\sum(\\pm I)$. *Graphical:* redraw the plan to the scale AB = 5 m with A at the centre of Newmark's chart, count the covered meshes N, $\\sigma_z = 0.005 \\times N \\times 200$.`}</Md>
        <NewmarkSolved rel={shift(ILL12, A12)} z={5} q={200} lead="**Illustration** (Fig. 5 missing): an L-shaped area, 12 m × 12 m with a 6 m × 6 m corner cut out, A at the re-entrant corner. Three 6 m × 6 m rectangles meet at A." />
        <Result>{`Illustration: σz ≈ **${f2(newmarkOf(shift(ILL12, A12), 5).I * 200)} kPa** both ways (the count matches the corner-rectangle sum). For the paper's own Fig. 5 the same two procedures apply.`}</Result>
      </Sol>
    ),
    notes: ['Fig. 5 is missing from the scan (the handnote gives the method only); the L-shaped plan is an illustration, not the paper\'s data.', 'Printed marks 15 + 15.'],
  },
]
