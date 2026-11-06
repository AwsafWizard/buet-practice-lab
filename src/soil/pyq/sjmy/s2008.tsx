// CE 341 term final 2008-09 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8, any THREE), held 1 Mar 2010, PDF pp. 7–9 (Fig. 1 L-shaped plan p. 8, Fig. 2 dam section p. 9).
import { Md, Tex } from '../../../components/ui'
import { borrowPlan, gdOf } from '../../engine/compaction'
import { shapeI, type Rect } from '../../engine/stressdist'
import { PERM_DEFAULT, permResults, PermSolution } from '../../topics/perm/Labs'
import type { SmQ } from '../../types'
import { CircBlockK, CircBlockSettle, CircBlockTime, circBlock, f0, f2, f3, Frm, Head, Model, NetFig, newmarkOf, NewmarkRadii, NewmarkSolved, oldNet, PlanFig, Result, Sol, th, type CircBlock } from './old-kit'

const P = '2008-09' as const

// ---------------------------------------------------------------- Q5(c) borrow → embankment, per 1 m³
const r5c = () => {
  const bank = { gb: 1.8, w: 0.1 }
  const gdB = gdOf(bank, 1)
  const p = borrowPlan({ Vfill: 1, fill: { gd: 1.85, w: 0.18 }, bank, gw: 1 })
  return { gdB, water1: (0.18 - 0.1) * gdB, V: p.Vbank }
}

// ---------------------------------------------------------------- Q6(b) circular block, 6 m
const CB: CircBlock = { D: 6, q: 200, Hs: 5, wt: 1.5, gs: 18.34, gsSat: 20.4, Hc: 1.6, gcSat: 19.5, ps: [50, 100, 200, 300, 400], es: [0.73, 0.68, 0.625, 0.58, 0.54], t90: 106, dLab: 0.01 }
const CB_TEXT =
  'A rigid foundation block, circular in plan and 6 m diameter, is subjected to a uniform pressure of 200 kN/m². It rests on a bed of compact sand 5.0 m deep. Below the sand there is a 1.6 m clay layer overlying impervious bed rock. Ground water level is 1.5 m below the surface of the sand. The unit weight of the sand above G.W.L. is 18.34 kN/m³, the saturated density of sand is 20.4 kN/m³ and the saturated density of clay is 19.5 kN/m³. A laboratory consolidation test on an undisturbed sample of the clay 20 mm thick and drained top and bottom gave the following results:\n\n| Pressure (kN/m²) | 50 | 100 | 200 | 300 | 400 |\n|---|---|---|---|---|---|\n| Void ratio | 0.73 | 0.68 | 0.625 | 0.58 | 0.54 |'

// ---------------------------------------------------------------- Q7(b) L-shaped building, P at the interior corner (origin)
const L7: Rect[] = [
  { x1: -10, y1: 0, x2: 0, y2: 10 },
  { x1: -10, y1: -15, x2: 15, y2: 0 },
]

// ---------------------------------------------------------------- Q8(d) dam on a 10 m permeable layer, base 1 m below ground, no cut-off
const net8 = () => oldNet('0809d', { kind: 'dam', T: 10, B: 25, hU: 6, hD: 0, embed: 1, embedD: 1, cutU: 0, cutD: 0, Nf: 3 })

export const B2008: SmQ[] = [
  {
    id: 'sm-2008-09-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 10.67,
    topics: ['sm-wv'],
    title: 'Relative density; classifying compactness with it',
    text: "Define the term 'Relative Density' of cohesionless soil. How can this be used in classifying the compactness of soil?",
    pages: [7],
    theory: true,
    given: [{ label: 'Dr classes', what: 'Das Table 3.3', ref: 'c-dr' }],
    solution: () => <Model item={th('sm-wv', 't-dr')} />,
  },
  {
    id: 'sm-2008-09-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 10,
    topics: ['sm-wv'],
    title: 'Prove Sr = w / [(ρw/ρ)(1 + w) − 1/Gs]',
    text: 'Prove that the degree of saturation ($S_r$) of a partially saturated soil can be expressed as $S_r = \\dfrac{w}{(\\rho_w/\\rho)(1 + w) - 1/G_s}$, where ρ = bulk density, $G_s$ = specific gravity of solids, w = moisture content and $\\rho_w$ = density of water.',
    pages: [7],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-sr')} />,
    notes: ['"moisture context" (sic).'],
  },
  {
    id: 'sm-2008-09-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 16,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Borrow soil at 10 % → embankment at 18 %, 1.85 t/m³: water per m³ of borrow, excavation per m³',
    text: 'A borrow area soil has a natural water content of 10% and a bulk density of 1.80 ton/m³. The soil is used for an embankment to be compacted at 18% moisture content to a dry density of 1.85 ton/m³. Determine the quantity of water to be added to 1.0 m³ of borrow soil. How many cubic metres of excavation is required for 1.0 m³ of compacted embankment?',
    pages: [7],
    given: [],
    checks: () => {
      const r = r5c()
      return [
        { key: 'gd', label: 'Dry density of the borrow soil', value: r.gdB, unit: 't/m³' },
        { key: 'ww', label: 'Water to add per 1.0 m³ of borrow soil', value: r.water1 * 1000, unit: 'kg' },
        { key: 'V', label: 'Excavation per 1.0 m³ of embankment', value: r.V, unit: 'm³' },
      ]
    },
    solution: () => {
      const r = r5c()
      return (
        <Sol>
          <Tex block>{`\\rho_{d} = \\frac{1.80}{1.10} = ${f3(r.gdB)}\\ \\text{t/m}^3 \\Rightarrow \\text{solids in 1 m}^3\\ \\text{of borrow soil} = ${f3(r.gdB)}\\ \\text{t}`}</Tex>
          <Tex block>{`\\text{Water to add} = (0.18 - 0.10) \\times ${f3(r.gdB)} = ${f3(r.water1)}\\ \\text{t} = ${f0(r.water1 * 1000)}\\ \\text{kg} \\ (\\approx ${f0(r.water1 * 1000)}\\ \\text{litres})`}</Tex>
          <Tex block>{`V_{exc} = \\frac{\\rho_{d,fill}}{\\rho_{d,borrow}} \\times 1.0 = \\frac{1.85}{${f3(r.gdB)}} = ${f3(r.V)}\\ \\text{m}^3`}</Tex>
          <Result>{`Add **${f0(r.water1 * 1000)} kg (${f3(r.water1)} t)** of water per m³ of borrow soil; excavate **${f2(r.V)} m³** per m³ of embankment.`}</Result>
        </Sol>
      )
    },
    notes: ['Same data as 2012-13 Q9(b). "quality of water" (sic) for quantity.'],
  },
  {
    id: 'sm-2008-09-5d',
    paper: P,
    sec: 'B',
    no: '5(d)',
    marks: 10,
    topics: ['sm-comp'],
    title: 'Compaction curve: salient features; zero-air-void line',
    text: 'What is a compaction curve? Give its salient features. What is a zero-air void line?',
    pages: [7],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-curve')} />,
  },
  {
    id: 'sm-2008-09-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 15.67,
    topics: ['sm-consol'],
    title: 'NC vs OC soils; causes of preconsolidation; effect on settlement',
    text: 'Differentiate between normally consolidated and over consolidated soils. What are the causes of preconsolidation in soils? What is the effect of preconsolidation on the settlement?',
    pages: [7],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-ncoc')} />,
  },
  {
    id: 'sm-2008-09-6b-i',
    paper: P,
    sec: 'B',
    no: '6(b)(i)',
    marks: 20,
    topics: ['sm-consol', 'sm-stress'],
    title: 'Rigid circular block (6 m, 200 kPa) on sand over 1.6 m clay: settlement with a 1H:2V spread',
    text: CB_TEXT + '\n\n(i) Estimate the settlement of the foundation, assuming that the load spread may be taken as 1 horizontal to 2 vertical.',
    pages: [7],
    given: [],
    checks: () => {
      const r = circBlock(CB)
      return [
        { key: 'dp', label: 'Δp at mid-clay (z = 5.8 m)', value: r.dp, unit: 'kPa' },
        { key: 'p0', label: "$p'_0$ at mid-clay", value: r.p0, unit: 'kPa' },
        { key: 'e0', label: '$e_0$ (from the table)', value: r.e0, tol: 0.005 },
        { key: 'e1', label: "$e_1$ at $p'_0 + \\Delta p$", value: r.e1, tol: 0.005 },
        { key: 'S', label: 'Settlement', value: r.S * 1000, unit: 'mm', tol: 0.06 },
      ]
    },
    solution: () => (
      <>
        <CircBlockSettle c={CB} />
        <Result>{`Settlement of the foundation ≈ **${f2(circBlock(CB).S * 1000)} mm**.`}</Result>
      </>
    ),
    notes: ['"Saturated density" values are printed in kN/m³ (they are unit weights).', 'e is interpolated linearly in log p between table entries.'],
  },
  {
    id: 'sm-2008-09-6b-ii',
    paper: P,
    sec: 'B',
    no: '6(b)(ii)',
    marks: 6,
    topics: ['sm-consol'],
    title: 'Field time for 90 % from the lab t90 = 1 h 46 min',
    text: '(ii) If the consolidation test sample reached 90% consolidation in 1 hour 46 minutes, how long will it take the foundation to reach 90% of its final settlement?',
    pages: [8],
    given: [],
    checks: () => {
      const r = circBlock(CB)
      return [{ key: 't', label: 'Field time for 90 %', value: r.tField / 60 / 24 / 365, unit: 'years' }]
    },
    solution: () => <CircBlockTime c={CB} />,
  },
  {
    id: 'sm-2008-09-6b-iii',
    paper: P,
    sec: 'B',
    no: '6(b)(iii)',
    marks: 5,
    topics: ['sm-consol', 'sm-perm'],
    title: 'k of the clay during consolidation (cv mv γw)',
    text: '(iii) Calculate the co-efficient of permeability of the 1.6 m clay layer during the consolidation process.',
    pages: [8],
    given: [],
    checks: () => {
      const r = circBlock(CB)
      return [
        { key: 'cv', label: '$c_v$ (Taylor, lab)', value: r.cv * 1e8, unit: '× 10⁻⁸ m²/s' },
        { key: 'mv', label: '$m_v$ over the field increment', value: r.mv * 1e4, unit: '× 10⁻⁴ m²/kN', tol: 0.04 },
        { key: 'k', label: 'k', value: r.k * 1e11, unit: '× 10⁻¹¹ m/s', tol: 0.05 },
      ]
    },
    solution: () => <CircBlockK c={CB} />,
  },
  {
    id: 'sm-2008-09-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 20.67,
    topics: ['sm-consol'],
    title: "Terzaghi's 1-D consolidation equation; meaning of the terms; Tv and U",
    text: 'Develop the mathematical expression for one dimensional consolidation of clays according to Terzaghi. Explain the physical meaning of the various terms of which this equation is composed. How is the time factor ($T_v$) related to degree of consolidation?',
    pages: [8],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-terzaghi')} />,
  },
  {
    id: 'sm-2008-09-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 26,
    topics: ['sm-stress'],
    title: "Construct a Newmark chart; σz 10 m below the interior corner of an L-shaped building (75 kPa)",
    text: "An 'L' shaped building in plan (Fig. 1) exerts a pressure of 75 kN/m² on soil. Construct an appropriate New mark's chart and use it to calculate the vertical stress increment at a depth of 10.0 m below the interior corner point 'P'.\n\n(Fig. 1: lower block 25 m wide × 15 m deep; a 10 m wide leg rising 10 m above P's level on the left; P is the interior corner, 10 m from the left edge on the top edge of the lower block.)",
    pages: [8],
    given: [{ label: "Newmark's chart", what: 'to be constructed (0.005)', ref: 'd-newmark' }],
    figure: () => (
      <div className="max-w-[400px] mx-auto">
        <PlanFig
          rects={L7}
          P={[0, 0]}
          dims={[
            { a: [-10, 10], b: [0, 10], text: '10 m' },
            { a: [-10, 0], b: [-10, 10], text: '10 m' },
            { a: [-10, -15], b: [15, -15], text: '25 m', off: 14 },
            { a: [15, -15], b: [15, 0], text: '15 m', off: 14 },
          ]}
        />
      </div>
    ),
    checks: () => {
      const n = newmarkOf(L7, 10)
      const I = shapeI(L7, 0, 0, 10)
      return [
        { key: 'N', label: 'Meshes covered (AB = 10 m)', value: n.N, tol: 0.05 },
        { key: 'sn', label: 'σz by the chart', value: n.I * 75, unit: 'kPa', tol: 0.05 },
        { key: 'sa', label: 'σz by corner rectangles (check)', value: I * 75, unit: 'kPa' },
      ]
    },
    solution: () => (
      <Sol>
        <Head>1. Construct the chart</Head>
        <NewmarkRadii AB={4} />
        <Head>2. Use it</Head>
        <NewmarkSolved rel={L7} z={10} q={75} lead="Draw the plan to the scale AB = 10 m with P at the chart's centre. With P at the origin the leg covers x = −10 … 0, y = 0 … 10 m and the lower block x = −10 … 15, y = −15 … 0 m." />
        <Result>{`σz 10 m below P ≈ **${f2(shapeI(L7, 0, 0, 10) * 75)} kPa** (≈ ${f0(newmarkOf(L7, 10).N)} meshes × 0.005 × 75).`}</Result>
      </Sol>
    ),
    notes: ['Handnote: rectangles 10×10 (0.1752) + 10×15 (0.1936) + 15×15 (0.2157) → 43.8 kPa, N ≈ 117. "New mark\'s" (sic).'],
  },
  {
    id: 'sm-2008-09-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10.67,
    topics: ['sm-seep'],
    title: 'Quick sand: what, in which soils, when',
    text: 'What is the quick sand phenomenon, and in which types of soil and under what situation may it occur?',
    pages: [8],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-quick')} />,
  },
  {
    id: 'sm-2008-09-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Derive the Laplace equation for seepage; meaning of each term',
    text: 'Derive the Laplace equation in connection with soil seepage. Give the physical meaning and mathematical interpretation of each term.',
    pages: [8],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-laplace')} />,
  },
  {
    id: 'sm-2008-09-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 16,
    topics: ['sm-perm'],
    title: 'Constant-head test: k, discharge velocity, seepage velocity',
    text: 'The discharge of water collected from a constant head permeameter in a period of 15 minutes is 500 ml. The internal diameter of the permeameter is 5 cm and the measured difference in head between two gauging points 15 cm vertically apart is 40 cm. Calculate the coefficient of permeability and the discharge velocity. If the dry weight of the 15 cm long sample is 486 gm and the specific gravity of soil is 2.65, calculate the seepage velocity.',
    pages: [8],
    given: [],
    checks: () => {
      const r = permResults(PERM_DEFAULT)
      return [
        { key: 'k', label: 'Coefficient of permeability k', value: r.k * 100, unit: '× 10⁻² cm/s' },
        { key: 'v', label: 'Discharge velocity', value: r.v * 100, unit: '× 10⁻² cm/s' },
        { key: 'vs', label: 'Seepage velocity', value: r.vs * 100, unit: '× 10⁻² cm/s' },
      ]
    },
    solution: () => {
      const r = permResults(PERM_DEFAULT)
      return (
        <Sol>
          <PermSolution s={PERM_DEFAULT} />
          <Result>{`k ≈ **${f2(r.k * 100)} × 10⁻² cm/s**; v ≈ **${f3(r.v)} cm/s**; vs ≈ **${f3(r.vs)} cm/s** (n = ${f3(r.n)}).`}</Result>
        </Sol>
      )
    },
    notes: ['Same data as 2012-13 Q10(c).'],
  },
  {
    id: 'sm-2008-09-8d',
    paper: P,
    sec: 'B',
    no: '8(d)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Redraw the dam section to scale and construct its flow net; how to raise FS against subsurface erosion',
    text: 'Redraw the section in Fig. 2 to true scale and construct the flow net for this section. How can you increase the factor of safety against sub-surface erosion for the flow problem described in Fig. 2?\n\n(Fig. 2, not to scale: dam with a 25 m base, set 1 m below the ground; upstream water 6 m above the ground; tail water at the downstream ground; permeable layer 10 m thick below the upstream ground on an impervious base; no cut-off.)',
    pages: [8, 9],
    given: [],
    figure: () => <NetFig c={net8()} net={false} />,
    checks: () => {
      const c = net8()
      return [
        { key: 'H', label: 'Head lost H', value: c.sol.H, unit: 'm' },
        { key: 'r', label: '$N_f/N_d$', value: c.sol.shape, tol: 0.08 },
        { key: 'Nd', label: '$N_d$ for 3 flow channels', value: c.R.Nd, tol: 0.08 },
        { key: 'qk', label: 'q/k = H·Nf/Nd (seepage per unit k)', value: c.sol.H * c.sol.shape, unit: 'm', tol: 0.08 },
      ]
    },
    solution: () => {
      const c = net8()
      return (
        <Sol>
          <Md>{`**To scale:** base 25 m, set 1 m into a 10 m permeable layer, so the flow region under the base is 9 m deep; head lost $H = 6$ m (tail water at ground level).`}</Md>
          <Md>{`**Boundaries.** Upstream bed: equipotential h = H; downstream bed: equipotential h = 0. The embedded heel face, the base and the embedded toe face form the first flow line; the impervious base is the last. Flow lines are U-shaped curves from the upstream bed to the downstream bed; equipotentials fan out from the base.`}</Md>
          <Frm>
            <NetFig c={c} exit />
          </Frm>
          <Md>{`With $N_f = 3$ the squares need $N_d ≈ ${f2(c.R.Nd)}$ ($N_f/N_d = ${f3(c.sol.shape)}$), so a hand net of 3 channels and about ${f0(c.R.Nd)} drops; $q = kH N_f/N_d = ${f2(c.sol.H * c.sol.shape)}k$ per metre (k not given). The largest exit gradients are at the downstream toe (≈ ${f3(c.R.ie)} in the last field).`}</Md>
          <Head>Raising the factor of safety against sub-surface erosion</Head>
          <Model item={th('sm-seep', 't-piping')} noFig />
        </Sol>
      )
    },
    notes: ['On the scan the "1 m" is the embedment of the base (dimensioned between the downstream ground and the base) and the ∇ sits on the ground line, so H = 6 m. The handnote reads it as 1 m of tail water (H = 5 m, Nf ≈ 3, Nd ≈ 10); the scan reading is used here.'],
  },
]
