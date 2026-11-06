// CE 341 term final 2009-10 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8, any THREE), held 6 Dec 2010, PDF pp. 12–14 (Section B's own Fig. 1, the T-shaped plan, p. 14).
import { Md } from '../../../components/ui'
import { eFromN, filterDepth, gsubFromGsE } from '../../engine/stresses'
import { shapeI, type Rect } from '../../engine/stressdist'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import { QuickFigure, QuickSolution, type QState } from '../../topics/seep/HeaveLab'
import type { SmQ } from '../../types'
import { big, CkSolution, ckSolve, f0, f2, Head, Model, Models, newmarkOf, NewmarkSolved, PlanFig, Result, Sol, th, thx } from './old-kit'

const P = '2009-10' as const

// ---------------------------------------------------------------- Q5(d) Purbachal: two sites, truck loads + water
const EW5 = EW_PRESETS[6].ew
const r5d = () => runEarthwork(EW5)

// ---------------------------------------------------------------- Q6(c) weighting filter for FS = 2
const Q6: QState = { L: 2, h: 1.9, Gs: 2.65, n: 0.35, FS: 2 }
const r6c = () => {
  const gsub = gsubFromGsE(Q6.Gs, eFromN(Q6.n))
  return { gsub, ...filterDepth({ gsub, L: Q6.L, h: Q6.h, FS: Q6.FS }) }
}

// ---------------------------------------------------------------- Q8(c) T-shaped plan, P at the left re-entrant corner (origin)
const T8: Rect[] = [
  { x1: -3, y1: 0, x2: 6, y2: 3 },
  { x1: 0, y1: -1.5, x2: 3, y2: 0 },
]

export const B2009: SmQ[] = [
  {
    id: 'sm-2009-10-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 5,
    topics: ['sm-wv'],
    title: 'Block (phase) diagram: what, its use; how to find e',
    text: 'What is a block (phase) diagram? What is its use? How do you determine the void ratio of a soil?',
    pages: [12],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-block')} />,
  },
  {
    id: 'sm-2009-10-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 5,
    topics: ['sm-perm'],
    title: 'Capillary rise in soils; typical ranges',
    text: 'Discuss the phenomenon of capillary rise in soils. Give the typical ranges of capillary rise for various types of soil.',
    pages: [12],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-capillary')} />,
  },
  {
    id: 'sm-2009-10-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 10,
    topics: ['sm-comp'],
    title: 'Why a laboratory compaction test; Standard vs Modified Proctor',
    text: 'Why is the compaction test done in the laboratory? Describe the salient features of the Standard and Modified Proctor tests.',
    pages: [12],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Why the laboratory compaction test', item: th('sm-comp', 't-why-lab') },
          { title: 'Standard and Modified Proctor', item: th('sm-comp', 't-proctor') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2009-10-5d',
    paper: P,
    sec: 'B',
    no: '5(d)',
    marks: 26.67,
    topics: ['sm-comp', 'sm-wv'],
    title: "Purbachal fill (4 × 10⁶ m³): site A or B by truck-load cost with bulking and water",
    text: "A land development project at 'Purbachal' requires construction of a compacted fill. The potential borrow areas are site 'A' and site 'B'. The in-place properties of soil at there sites are as below:\n\n| | Site A | Site B |\n|---|---|---|\n| Void ratio | 0.79 | 0.65 |\n| Water content | 18% | 15% |\n\nThe fill at the end of construction will have a total volume of 4.0 × 10⁶ m³, a bulk density of 2 ton/m³ and a placement water content of 21 percent. During excavation and placing of soil in the truck, the soil bulks (increases) in volume by 10%. At the site the required quantity of water is added and compacted to the required extent using rollers. The cost of excavation of soil, its transportation and its compaction excluding water charge is Tk 1000 per truck for site A and Tk 1150 per truck for site B. Water charge per truck is Tk 300. Assume $G_s$ = 2.65. Which of the two sites is more economical? Note that soil from either site is to be excavated and transported in trucks of 10 m³ capacity.",
    pages: [12, 13],
    given: [],
    checks: () => {
      const { res } = r5d()
      const [A, B] = res
      return [
        { key: 'Ms', label: 'Dry mass of solids in the fill', value: A.p.Ws / 1e6, unit: '× 10⁶ t' },
        { key: 'tA', label: 'Soil truck loads from A', value: A.p.trucks, tol: 0.005 },
        { key: 'tB', label: 'Soil truck loads from B', value: B.p.trucks, tol: 0.005 },
        { key: 'wA', label: 'Water truck loads for A', value: A.p.waterTrucks, tol: 0.005 },
        { key: 'wB', label: 'Water truck loads for B', value: B.p.waterTrucks, tol: 0.005 },
        { key: 'cA', label: 'Total cost, site A', value: A.total / 1e6, unit: 'million Tk', tol: 0.005 },
        { key: 'cB', label: 'Total cost, site B', value: B.total / 1e6, unit: 'million Tk', tol: 0.005 },
      ]
    },
    solution: () => {
      const { res } = r5d()
      const [A, B] = res
      return (
        <Sol>
          <Md>{`Work in tonnes and m³ ($\\rho_w$ = 1 t/m³). Solids are conserved; each site's in-place dry density is $G_s\\rho_w/(1 + e)$; the dug soil bulks 10 % in the truck; water is hauled in 10 m³ truck loads.`}</Md>
          <EarthworkSolution ew={EW5} />
          <Result>{`Site A ≈ **Tk ${f2(A.total / 1e6)} million** against site B ≈ **Tk ${f2(B.total / 1e6)} million**: **site A is more economical**, saving about Tk ${f2((B.total - A.total) / 1e6)} million (${big(A.p.trucks)} vs ${big(B.p.trucks)} soil loads; A also needs ${big(A.p.waterTrucks)} water loads against ${big(B.p.waterTrucks)}).`}</Result>
        </Sol>
      )
    },
    notes: ['"Water charge Tk 300 per truck" is taken per 10 m³ truck load of water (as the handnote).', 'Truck loads are rounded up to whole trucks.'],
  },
  {
    id: 'sm-2009-10-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Pore pressure, effective stress, seepage pressure; principle of effective stress',
    text: 'Describe the terms pore water pressure, effective stress and seepage pressure. What is the principle of effective stress?',
    pages: [13],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-eff-principle')} />,
  },
  {
    id: 'sm-2009-10-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Prove: seepage force per unit volume = iγw',
    text: 'Prove that the seepage force per unit volume is equal to the product of hydraulic gradient and the unit weight of water.',
    pages: [13],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-seep-force')} />,
  },
  {
    id: 'sm-2009-10-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 26.67,
    topics: ['sm-seep'],
    title: 'Coarse-sand weighting for FS = 2 against piping (2.0 m layer, 1.90 m upward head)',
    text: 'A 2.0 m layer of soil ($G_s$ = 2.65 and porosity = 35%) is subjected to an upward seepage head of 1.90 m. What depth of coarse sand would be required above the soil to provide a factor of safety of 2.0 against piping? Assume the coarse sand has the same porosity and specific gravity as the soil below it.',
    pages: [13],
    given: [],
    figure: () => <QuickFigure s={Q6} zf={r6c().z} />,
    checks: () => {
      const r = r6c()
      return [
        { key: 'g', label: "$\\gamma'$", value: r.gsub, unit: 'kN/m³' },
        { key: 'fs0', label: 'FS without the coarse sand', value: r.FS0 },
        { key: 'z', label: 'Depth of coarse sand for FS = 2.0', value: r.z, unit: 'm' },
      ]
    },
    solution: () => (
      <Sol>
        <QuickSolution s={Q6} />
        <Result>{`Without the sand FS = ${f2(r6c().FS0)} (not boiling, but below 2); about **${f2(r6c().z)} m** of coarse sand on top raises it to 2.0 (head loss in the coarse sand neglected).`}</Result>
      </Sol>
    ),
    notes: ['Same form as 2012-13 Q10(d).'],
  },
  {
    id: 'sm-2009-10-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Using consolidation-test results to predict settlement',
    text: 'Explain how the results of a consolidation test can be used to predict the settlement of a structure caused by the consolidation of clay soil below the foundation.',
    pages: [13],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-test')} />,
  },
  {
    id: 'sm-2009-10-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'The consolidation process; primary vs secondary consolidation',
    text: 'Explain the process of consolidation in clay and differentiate between primary and secondary consolidation.',
    pages: [13],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-process')} />,
    notes: ['"the process of consolidation" is smudged by an overprint on the scan; read the same way as the handnote.'],
  },
  {
    id: 'sm-2009-10-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 26.67,
    topics: ['sm-consol', 'sm-perm'],
    title: 'Cc 0.27, e 2.04, k 3.5 × 10⁻⁸ cm/s: Δe, settlement of 5 m, t50 one-way; effect of two-way drainage',
    text: 'A saturated soil has a compression index equal to 0.27. Its void ratio at a stress level of 125 kN/m² is 2.04 and its permeability is 3.5 × 10⁻⁸ cm/sec. Compute: (i) the change in void ratio if the stress is increased to 187.5 kN/m²; (ii) the settlement in (i) if the soil stratum is 5 m thick; and (iii) the time required for 50% consolidation to occur if drainage is one way. What kind of variation in (a), (b) and (c) would you expect if a both way drainage condition exists?',
    pages: [13],
    given: [],
    checks: () => {
      const r = ckSolve()
      return [
        { key: 'de', label: '(i) Δe', value: r.de },
        { key: 'S', label: '(ii) Settlement', value: r.S * 1000, unit: 'mm' },
        { key: 'mv', label: '$m_v$', value: r.mv * 1e4, unit: '× 10⁻⁴ m²/kN' },
        { key: 'cv', label: '$c_v$', value: r.cv * 1e7, unit: '× 10⁻⁷ m²/s' },
        { key: 't1', label: '(iii) t50, one-way drainage', value: r.t1 / 86400, unit: 'days' },
        { key: 't2', label: 't50, both-way drainage', value: r.t2 / 86400, unit: 'days' },
      ]
    },
    solution: () => <CkSolution twoWay />,
    notes: ['Same numbers as 2007-08 Q6(c), plus the both-way follow-up. "(a), (b) and (c)" in the follow-up mean (i)–(iii).', 'Tv = 0.197 for 50 % (table).'],
  },
  {
    id: 'sm-2009-10-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10,
    topics: ['sm-consol'],
    title: "Short note: sand drains",
    text: "Write a short note on 'Sand Drains'.",
    pages: [14],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-drains')} />,
  },
  {
    id: 'sm-2009-10-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['sm-stress'],
    title: 'Contact pressure and its dependence on foundation and soil type',
    text: 'What is contact pressure? How does it depend on the type of foundation and the type of soil?',
    pages: [14],
    theory: true,
    solution: () => <Model item={thx('sm-stress', 't-contact')} />,
  },
  {
    id: 'sm-2009-10-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 26.67,
    topics: ['sm-stress'],
    title: "T-shaped foundation (120 kPa): σz 5 m below P by Newmark's chart, compared with the analytical value",
    text: "A T-shaped foundation as shown in Fig. 1 is loaded with a uniform load of 120 kN/m². Determine the stress at a point 'P' at a depth of 5.0 m. Use Newmark's chart. Also compare the result with the analytical solution.\n\n(Fig. 1: top bar 9 m long (3 m + 3 m + 3 m) and 3 m deep; stem under its middle third, 3 m wide and 1.5 m deep; P at the left re-entrant corner, on the bar's lower edge 3 m from its left end.)",
    pages: [14],
    given: [{ label: "Newmark's chart", what: 'not attached; draw it (0.005)', ref: 'd-newmark' }],
    figure: () => (
      <div className="max-w-[400px] mx-auto">
        <PlanFig
          rects={T8}
          P={[0, 0]}
          dims={[
            { a: [-3, -1.5], b: [0, -1.5], text: '3 m', off: 14 },
            { a: [0, -1.5], b: [3, -1.5], text: '3 m', off: 14 },
            { a: [3, -1.5], b: [6, -1.5], text: '3 m', off: 14 },
            { a: [6, 0], b: [6, 3], text: '3 m', off: 14 },
            { a: [3, -1.5], b: [3, 0], text: '1.5 m', off: 14 },
          ]}
        />
      </div>
    ),
    checks: () => {
      const n = newmarkOf(T8, 5)
      const I = shapeI(T8, 0, 0, 5)
      return [
        { key: 'N', label: 'Meshes covered (AB = 5 m)', value: n.N, tol: 0.05 },
        { key: 'sn', label: "σz by Newmark's chart", value: n.I * 120, unit: 'kPa', tol: 0.05 },
        { key: 'I', label: 'ΣI of the corner rectangles', value: I },
        { key: 'sa', label: 'σz analytically', value: I * 120, unit: 'kPa' },
      ]
    },
    solution: () => {
      const n = newmarkOf(T8, 5)
      const I = shapeI(T8, 0, 0, 5)
      return (
        <Sol>
          <NewmarkSolved rel={T8} z={5} q={120} lead="P is the left re-entrant corner of the T. With P at the origin the bar covers x = −3 … 6 m, y = 0 … 3 m and the stem x = 0 … 3 m, y = −1.5 … 0. Three rectangles meet at P: 3 × 3 (bar, left), 6 × 3 (bar, right) and 3 × 1.5 (stem)." />
          <Head>Comparison</Head>
          <Md>{`Newmark: ${f2(n.N)} meshes × 0.005 × 120 = ${f2(n.I * 120)} kPa; analytical: 120 × ${f2(I)} = ${f2(I * 120)} kPa. A hand count usually lands within 2–3 meshes (±2 kPa), i.e. within a few per cent.`}</Md>
          <Result>{`σz at 5 m below P ≈ **${f2(I * 120)} kPa** (analytical) and ≈ **${f0(n.I * 120)} kPa** by the chart — they agree within the counting error.`}</Result>
        </Sol>
      )
    },
    notes: ['Section B has its own "Fig. 1" this year (Section A\'s Fig. 1 is a sheet-pile wall).', 'Handnote: ΣI = 0.3129 → 37.5 kPa analytically, N ≈ 63 meshes → 37.8 kPa.'],
  },
]
