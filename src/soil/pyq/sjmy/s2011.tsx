// CE 341 term final 2011-12 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8, any THREE), held 8 Jul 2013, PDF pp. 22–24 (Fig. 1 L-shaped plan p. 23, Fig. 2 dam p. 24).
import { Md, Tex } from '../../../components/ui'
import { gammaD, satOf, voidRatio } from '../../engine/compaction'
import { kRatio } from '../../engine/consolidation'
import { scaleFallTime } from '../../engine/permeability'
import { waterToRaise, waterToSaturate } from '../../engine/phase'
import { shapeI, type Rect } from '../../engine/stressdist'
import type { SmQ } from '../../types'
import { CircBlockSettle, CircBlockTime, circBlock, CornerTable, f0, f2, f3, f4, Frm, Model, NetFig, oldNet, PlanFig, Result, sci, sciTex, Sol, th, thx, type CircBlock } from './old-kit'

const P = '2011-12' as const

// ---------------------------------------------------------------- Q5(b) circular block (variant of 2008-09 Q6(b))
const CB: CircBlock = { D: 5, q: 200, Hs: 5, wt: 1.5, gs: 19.2, gsSat: 20.8, Hc: 1.6, gcSat: 20.0, ps: [50, 100, 200, 300, 400], es: [0.73, 0.68, 0.63, 0.58, 0.54], t90: 110, dLab: 0.01 }

// ---------------------------------------------------------------- Q6(b) kA/kB
const k6 = () => kRatio({ eA: [0.572, 0.505], eB: [0.612, 0.597], dp: 60, dA: 1.5, dB: 1, tA: 1, tB: 3 })

// ---------------------------------------------------------------- Q7(b) W–V
const r7b = () => {
  const rd = gammaD(2.0, 0.08)
  const Ms = 150 * rd
  const e = voidRatio(rd, 2.7, 1)
  return { rd, Ms, e, add: waterToRaise(Ms, 0.08, 0.11, 1), S12: satOf(0.12, rd, 2.7, 1), Vw: waterToSaturate(100, e) }
}

// ---------------------------------------------------------------- Q7(c) L-shaped plan, P at the re-entrant corner (origin)
const L7: Rect[] = [
  { x1: -10, y1: 0, x2: 0, y2: 10 },
  { x1: -10, y1: -10, x2: 30, y2: 0 },
]

// ---------------------------------------------------------------- Q8(e) dam with a 9 m cut-off
const net8 = () => oldNet('1112')
const T6M = 182.5 * 86400

export const B2011: SmQ[] = [
  {
    id: 'sm-2011-12-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Preconsolidation pressure: meaning, importance, estimate from qu and PI',
    text: 'What is preconsolidation pressure? In what way its determination is important in foundation design practice? How can you estimate its value if you know the unconfined compressive strength and plasticity index of clay at a given depth? (3+3+4=10)',
    pages: [22],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-pc')} />,
    notes: ['Printed marks 3 + 3 + 4.'],
  },
  {
    id: 'sm-2011-12-5b-i',
    paper: P,
    sec: 'B',
    no: '5(b)(i)',
    marks: 26.67,
    topics: ['sm-consol', 'sm-stress'],
    title: 'Rigid circular block (5 m, 200 kPa) on sand over 1.6 m clay: settlement with a 1H:2V spread',
    text: 'A rigid foundation block, circular in plan and 5.0 m diameter rests on a bed of compact sand 5.0 m deep. Below the sand there is 1.6 m of clay overlying impervious bed rock. Ground water table is 1.5 m below the top surface of the sand. The unit weight of sand above ground water level is 19.2 kN/m³, the saturated unit weight of sand is 20.8 kN/m³ and the saturated unit weight of the clay is 20.0 kN/m³. The foundation block is subjected to a uniform pressure of 200 kN/m². Draw the schematic diagram of the described problem. A laboratory consolidation test on an undisturbed sample of clay, 20 mm thick and drained top and bottom, gave the following results:\n\n| Pressure (kN/m²) | 50 | 100 | 200 | 300 | 400 |\n|---|---|---|---|---|---|\n| Void ratio | 0.73 | 0.68 | 0.63 | 0.58 | 0.54 |\n\n(i) Calculate the final settlement of the foundation, assuming that the load spread may be taken as 1 horizontal to 2 vertical.',
    pages: [22],
    given: [],
    checks: () => {
      const r = circBlock(CB)
      return [
        { key: 'dp', label: 'Δp at mid-clay (z = 5.8 m)', value: r.dp, unit: 'kPa' },
        { key: 'p0', label: "$p'_0$ at mid-clay", value: r.p0, unit: 'kPa' },
        { key: 'e0', label: '$e_0$ (from the table)', value: r.e0, tol: 0.005 },
        { key: 'e1', label: '$e_1$ at $p_0\' + \\Delta p$', value: r.e1, tol: 0.005 },
        { key: 'S', label: 'Final settlement', value: r.S * 1000, unit: 'mm', tol: 0.06 },
      ]
    },
    solution: () => (
      <>
        <CircBlockSettle c={CB} />
        <Result>{`Final settlement ≈ **${f2(circBlock(CB).S * 1000)} mm**.`}</Result>
      </>
    ),
    notes: ['Variant of 2008-09 Q6(b) (there D = 6 m, other unit weights, e = 0.625 at 200 kPa).', 'e is interpolated linearly in log p between table entries; reading off a hand-drawn e–log p curve gives e within about ±0.003.'],
  },
  {
    id: 'sm-2011-12-5b-ii',
    paper: P,
    sec: 'B',
    no: '5(b)(ii)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Field time for 90 % from the lab t90 = 110 min',
    text: '(ii) If the consolidation of the test sample reached 90% consolidation in 110 minutes, how long will it take the foundation to reach 90% of its final settlement?',
    pages: [22],
    given: [],
    checks: () => {
      const r = circBlock(CB)
      return [
        { key: 't', label: 'Field time for 90 %', value: r.tField / 60 / 24 / 365, unit: 'years' },
        { key: 'tm', label: 'Same, in minutes', value: r.tField / 1e6, unit: '× 10⁶ min' },
      ]
    },
    solution: () => <CircBlockTime c={CB} />,
  },
  {
    id: 'sm-2011-12-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 10.67,
    topics: ['sm-consol'],
    title: 'Time factor; its relation to U; steps for the field time–settlement curve',
    text: 'What is time factor? How is it related to the average degree of consolidation? Write down the steps for determining the time-settlement curve in the field.',
    pages: [22],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-tv')} />,
  },
  {
    id: 'sm-2011-12-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 18,
    topics: ['sm-consol', 'sm-perm'],
    title: 'Ratio of k of two clays from Δe, thickness and t50',
    text: "The void ratio of clay 'A' decreased from 0.572 to 0.505 under a change in pressure from 120 to 180 kN/m². The void ratio of clay 'B' decreased from 0.612 to 0.597 under the same pressure increment. The thickness of sample 'A' was 1.5 times that of 'B'. Nevertheless the time required for 50% consolidation was three times longer for sample 'B' than for sample 'A'. What is the ratio of the coefficient of permeability of 'A' to that of 'B'?",
    pages: [22],
    given: [],
    checks: () => {
      const k = k6()
      return [
        { key: 'mv', label: '$m_{vA}/m_{vB}$', value: k.mvRatio },
        { key: 'cv', label: '$c_{vA}/c_{vB}$', value: k.cvRatio },
        { key: 'k', label: '$k_A/k_B$', value: k.kRatio },
      ]
    },
    solution: () => {
      const k = k6()
      return (
        <Sol>
          <Md>{`$k = c_vm_v\\gamma_w$, so $\\dfrac{k_A}{k_B} = \\dfrac{c_{vA}}{c_{vB}} \\cdot \\dfrac{m_{vA}}{m_{vB}}$.`}</Md>
          <Tex block>{`m_v = \\frac{\\Delta e}{(1 + e_0)\\Delta p}:\\quad m_{vA} = \\frac{0.067}{1.572 \\times 60} = ${sciTex(k.mvA, 3)},\\quad m_{vB} = \\frac{0.015}{1.612 \\times 60} = ${sciTex(k.mvB, 3)}\\ \\text{m}^2/\\text{kN} \\Rightarrow \\frac{m_{vA}}{m_{vB}} = ${f3(k.mvRatio)}`}</Tex>
          <Md>{`Same U (50 %) ⇒ same $T_v = c_vt/d^2$, so $c_v \\propto d^2/t$. Both samples are tested the same way, so $d_A/d_B = H_A/H_B = 1.5$, and $t_B = 3t_A$:`}</Md>
          <Tex block>{`\\frac{c_{vA}}{c_{vB}} = \\left(\\frac{d_A}{d_B}\\right)^2\\frac{t_B}{t_A} = 1.5^2 \\times 3 = ${f2(k.cvRatio)}`}</Tex>
          <Tex block>{`\\frac{k_A}{k_B} = ${f2(k.cvRatio)} \\times ${f3(k.mvRatio)} = ${f2(k.kRatio)}`}</Tex>
          <Result>{`$k_A/k_B$ ≈ **${f0(k.kRatio)}** — clay A is about ${f0(k.kRatio)} times more permeable.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2011-12-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 18,
    topics: ['sm-perm'],
    title: 'Falling head: 50 → 48 cm in 5 min; time to reach 25 cm',
    text: 'In the falling head permeability test method, the head causing flow was initially 50 cm and it drops 2 cm in 5 minutes. How much time is required for the head to fall 25 cm?',
    pages: [22],
    given: [],
    checks: () => [{ key: 't', label: 'Time for the head to fall to 25 cm', value: scaleFallTime(5, 50, 48, 25), unit: 'min' }],
    solution: () => {
      const t = scaleFallTime(5, 50, 48, 25)
      return (
        <Sol>
          <Md>{`$k = \\dfrac{aL}{At}\\ln\\dfrac{h_1}{h_2}$. For the same apparatus and soil, $\\dfrac{aL}{Ak}$ is constant, so $t \\propto \\ln(h_1/h_2)$:`}</Md>
          <Tex block>{`\\frac{t}{5} = \\frac{\\ln(50/25)}{\\ln(50/48)} = \\frac{${f4(Math.log(2))}}{${f4(Math.log(50 / 48))}} \\Rightarrow t = ${f2(t)}\\ \\text{min}`}</Tex>
          <Result>{`Time for the head to fall from 50 cm to 25 cm ≈ **${f2(t)} min** (≈ ${f0(t)} min from the start; ${f2(t - 5)} min after the first 5).`}</Result>
        </Sol>
      )
    },
    notes: ['"fall 25 cm": from 50 cm, falling by 25 cm and falling to 25 cm are the same.'],
  },
  {
    id: 'sm-2011-12-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 10.67,
    topics: ['sm-stress'],
    title: 'Boussinesq σz(z, r) for a point load; depth of the maximum on a vertical line',
    text: 'Write down the expression for vertical stress, σz at a point due to a point load, Q at the surface of an elastic medium (soil) as a function of z and r, where z is the depth and r is the radial distance. For a given r, find the depth z at which σz will be maximum.',
    pages: [23],
    theory: true,
    solution: () => <Model item={thx('sm-stress', 't-maxsz')} />,
  },
  {
    id: 'sm-2011-12-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 18,
    topics: ['sm-wv'],
    title: '150 m³ at 8 %: water to reach 11 %, S at 12 %, water to saturate 100 m³ of dry soil',
    text: 'A natural soil sample of 150 m³ with $G_s$ = 2.70 has a mass density of 2.00 ton/m³ at a water content of 8%. (i) Calculate the additional volume of water required to be added to raise the water content to 11% from 8%. (ii) What will be the degree of saturation at 12% moisture content? (iii) Calculate the volume of water required to make 100 m³ of the above dry sample fully saturated.',
    pages: [23],
    given: [],
    checks: () => {
      const r = r7b()
      return [
        { key: 'rd', label: 'Dry density', value: r.rd, unit: 't/m³' },
        { key: 'e', label: 'Void ratio', value: r.e },
        { key: 'w', label: '(i) Water to add (8 → 11 %)', value: r.add, unit: 'm³' },
        { key: 'S', label: '(ii) Degree of saturation at 12 %', value: r.S12 * 100, unit: '%' },
        { key: 'Vw', label: '(iii) Water to saturate 100 m³ of dry soil', value: r.Vw, unit: 'm³' },
      ]
    },
    solution: () => {
      const r = r7b()
      return (
        <Sol>
          <Tex block>{`\\rho_d = \\frac{\\rho}{1 + w} = \\frac{2.00}{1.08} = ${f3(r.rd)}\\ \\text{t/m}^3,\\quad M_s = 150 \\times ${f3(r.rd)} = ${f2(r.Ms)}\\ \\text{t},\\quad e = \\frac{G_s\\rho_w}{\\rho_d} - 1 = \\frac{2.70}{${f3(r.rd)}} - 1 = ${f3(r.e)}`}</Tex>
          <Tex block>{`\\text{(i)}\\ \\Delta M_w = (0.11 - 0.08)M_s = 0.03 \\times ${f2(r.Ms)} = ${f2(r.add)}\\ \\text{t} \\Rightarrow ${f2(r.add)}\\ \\text{m}^3\\ \\text{of water}`}</Tex>
          <Tex block>{`\\text{(ii)}\\ S = \\frac{wG_s}{e} = \\frac{0.12 \\times 2.70}{${f3(r.e)}} = ${f2(r.S12 * 100)}\\ \\%\\quad (\\text{volume unchanged, so } e \\text{ is the same})`}</Tex>
          <Tex block>{`\\text{(iii)}\\ V_v = V\\frac{e}{1 + e} = 100 \\times \\frac{${f3(r.e)}}{${f3(1 + r.e)}} = ${f2(r.Vw)}\\ \\text{m}^3\\ \\text{of water fills the voids of the dry soil}`}</Tex>
          <Result>{`(i) **${f2(r.add)} m³**; (ii) S ≈ **${f2(r.S12 * 100)} %**; (iii) **${f2(r.Vw)} m³**.`}</Result>
        </Sol>
      )
    },
    notes: ["A W–V question in SJMY sir's section."],
  },
  {
    id: 'sm-2011-12-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 18,
    topics: ['sm-stress'],
    title: 'L-shaped building (75 kPa): σz 8 m below the interior corner P, analytically',
    text: "Calculate analytically the increase in vertical stress σz at a depth of 8 m below the interior corner point 'P' due to an 'L' shaped building in plan (Fig. 1) that exerts a pressure of 75 kN/m².",
    pages: [23],
    given: [],
    figure: () => (
      <div className="max-w-[440px] mx-auto">
        <PlanFig
          rects={L7}
          P={[0, 0]}
          w={420}
          dims={[
            { a: [-10, 10], b: [0, 10], text: '10 m' },
            { a: [-10, -10], b: [-10, 10], text: '20 m' },
            { a: [0, 0], b: [30, 0], text: '30 m', off: -12 },
            { a: [30, -10], b: [30, 0], text: '10 m', off: 14 },
          ]}
        />
      </div>
    ),
    checks: () => {
      const I = shapeI(L7, 0, 0, 8)
      return [
        { key: 'I', label: 'ΣI of the corner rectangles', value: I },
        { key: 's', label: 'σz 8 m below P', value: 75 * I, unit: 'kPa' },
      ]
    },
    solution: () => (
      <Sol>
        <Md>{`P is a corner of three rectangles that make up the L: the upper-left 10 m × 10 m (the leg), the lower-left 10 m × 10 m and the lower-right 30 m × 10 m. Each has a corner at P, so $\\sigma_z = q\\sum I(m, n)$ with $m = B/z$, $n = L/z$, z = 8 m:`}</Md>
        <CornerTable rel={L7} z={8} q={75} />
        <Result>{`σz 8 m below P ≈ **${f2(75 * shapeI(L7, 0, 0, 8))} kPa**.`}</Result>
      </Sol>
    ),
    notes: ['Fig. 1 read as: left leg 10 m wide and 20 m tall overall; bottom block extending 30 m to the right of P and 10 m tall; P 10 m from the left and 10 m above the bottom edge.'],
  },
  {
    id: 'sm-2011-12-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 9,
    topics: ['sm-perm', 'sm-seep'],
    title: 'Define discharge velocity, seepage velocity and seepage pressure',
    text: 'Define discharge velocity, seepage velocity and seepage pressure.',
    pages: [23],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-velocity')} />,
  },
  {
    id: 'sm-2011-12-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 5,
    topics: ['sm-seep'],
    title: 'Graded filter: what, when and where',
    text: 'What is a graded filter? When and where is it used?',
    pages: [23],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-filter')} />,
  },
  {
    id: 'sm-2011-12-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 6,
    topics: ['sm-perm'],
    title: 'Typical k of coarse sand, fine sand and clay',
    text: 'Write down the typical values of co-efficient of permeability of coarse sand, fine sand and clay.',
    pages: [23],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-typical-k')} />,
  },
  {
    id: 'sm-2011-12-8d',
    paper: P,
    sec: 'B',
    no: '8(d)',
    marks: 4,
    topics: ['sm-perm'],
    title: 'Typical capillary rise in coarse sand and clay',
    text: 'Write down the typical values of capillary rise in meter for coarse sand and clay.',
    pages: [23],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-capillary')} pre="**Typical capillary rise:** coarse sand ≈ 0.03–0.15 m; fine sand 0.3–1.2 m; silt 0.75–7.5 m; clay ≈ 7.5–25 m (theoretically more, but the rise is very slow)." />,
  },
  {
    id: 'sm-2011-12-8e',
    paper: P,
    sec: 'B',
    no: '8(e)',
    marks: 22.67,
    topics: ['sm-seep'],
    title: 'Flow net under a dam with a 9 m cut-off; seepage loss in 6 months',
    text: 'Draw the flow net diagram for the problem shown in Fig. 2. Also calculate the seepage loss in 6 months for unit width of the hydraulic structure. Given K = 2.5 × 10⁻⁴ m/sec.\n\n(Fig. 2: concrete dam with a 27 m base on the ground surface; upstream water 10.5 m above the ground, downstream water at ground level; sheet-pile cut-off 9 m deep at the heel; permeable stratum 15 m thick on bed rock. "You may draw flow net diagram on Fig. 2 in this page and attach this with the answer scripts.")',
    pages: [23, 24],
    given: [],
    figure: () => <NetFig c={net8()} net={false} />,
    checks: () => {
      const c = net8()
      const q = c.st.k * c.sol.H * c.sol.shape
      return [
        { key: 'H', label: 'Head lost H', value: c.sol.H, unit: 'm' },
        { key: 'r', label: '$N_f/N_d$', value: c.sol.shape, tol: 0.08 },
        { key: 'Nd', label: '$N_d$ for 4 flow channels', value: c.R.Nd, tol: 0.08 },
        { key: 'q', label: 'Seepage per metre width', value: q * 1e4, unit: '× 10⁻⁴ m³/s', tol: 0.08 },
        { key: 'Q', label: 'Seepage loss in 6 months', value: q * T6M, unit: 'm³ per m', tol: 0.08 },
      ]
    },
    solution: () => {
      const c = net8()
      const q = c.st.k * c.sol.H * c.sol.shape
      return (
        <Sol>
          <Md>{`**Boundaries.** Equipotentials: the upstream bed (h = 10.5 m above tail water) and the downstream bed (h = 0). Flow lines: the cut-off and the dam base (first flow line, running down the upstream face of the pile, round its tip, up the downstream face and along the base) and the bed rock (last flow line). Water dives under the cut-off, passes under the 27 m base and rises downstream.`}</Md>
          <Frm>
            <NetFig c={c} />
          </Frm>
          <Md>{`**Net.** With $N_f = ${c.st.Nf}$ channels the curvilinear squares need $N_d ≈ ${f2(c.R.Nd)}$ drops ($N_f/N_d = ${f3(c.sol.shape)}$ from the solver); a hand net of 4 channels and about ${f0(c.R.Nd)} drops is right.`}</Md>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 2.5\\times10^{-4} \\times 10.5 \\times ${f3(c.sol.shape)} = ${sciTex(q, 3)}\\ \\text{m}^3/\\text{s per m}`}</Tex>
          <Tex block>{`Q_{6\\,months} = ${sciTex(q, 3)} \\times 182.5 \\times 86400 = ${sciTex(q * T6M, 3)}\\ \\text{m}^3\\ \\text{per m width}`}</Tex>
          <Result>{`Nf/Nd ≈ **${f3(c.sol.shape)}**; q ≈ **${sci(q, 2)} m³/s per m**; seepage loss in 6 months ≈ **${sci(q * T6M, 2)} m³** per metre width.`}</Result>
        </Sol>
      )
    },
    notes: ['6 months taken as 182.5 days.', 'The handnote: Nf/Nd ≈ 0.27 (4 channels, 15 drops), q ≈ 7.0 × 10⁻⁴ m³/s per m, ≈ 1.1 × 10⁴ m³ per m in 6 months.'],
  },
]
