// CE 341 term final 2023-24 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8), held 24 Aug 2025, PDF pp. 73–76.
import { Md, Tex } from '../../../components/ui'
import { settleProfile, timeFor, tvBy, tvFromTable, type SettleIn } from '../../engine/consolidation'
import { excavationHeave } from '../../engine/stresses'
import { Irect, type Rect } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import { ProfileFig } from '../../topics/consol/figs'
import { SettleSolution } from '../../topics/consol/Solution'
import { ExFigure } from '../../topics/seep/HeaveLab'
import type { SmQ } from '../../types'
import { BulbAnswer, f2, f3, f4, Frm, Head, Model, Models, netOf, netPoint, NetFig, newmarkOf, NewmarkSolved, PlanFig, Result, shift, Sol, SoilColumn, Tbl, th } from './kit'

const P = '2023-24' as const
const TV_GIVEN = { label: 'Tv table', what: 'U % 10 … 90 → Tv 0.008 … 0.848 (printed in Q7(b))', ref: 'k-tvu' }

// ---------------------------------------------------------------- Q5(b) excavation in clay over sand
const EX5 = { Hc: 7, gSat: 17, wt: 0 }
const ex5 = () => ({ r1: excavationHeave(EX5, 0, 1), r12: excavationHeave(EX5, 0, 1.2) })

// ---------------------------------------------------------------- Q5(c) footing on the clay top, 2:1 + Simpson
const w5 = 0.4,
  Gs5 = 2.7,
  LL5 = 45
const e05 = w5 * Gs5
const gsat5 = ((Gs5 + e05) * GW) / (1 + e05)
const Cc5 = 0.009 * (LL5 - 10)
const SET5 = (avg: 'simpson' | 'mid'): SettleIn => ({
  layers: [
    { kind: 'sand', H: 8, gamma: 17, gammaSat: 10.5 + GW },
    { kind: 'clay', H: 6, gamma: gsat5, gammaSat: gsat5, e0: e05, Cc: Cc5 },
  ],
  wt: 4,
  load: { kind: 'footing', shape: 'rect', B: 2, L: 3, Q: 250, Df: 8, method: '21' },
  avg,
})
const st5 = () => ({ s: settleProfile(SET5('simpson')), m: settleProfile(SET5('mid')) })

// ---------------------------------------------------------------- Q6(c) sheet pile with a drawn net (3 channels, 6 drops)
const net6 = () => netOf('2324', { Nf: 3 })
const net6b = () => netOf('2324')

// ---------------------------------------------------------------- Q7(a) notched area (reading from the drawing: 9 × 9 m outline, 6 × 3 m notch, P at its centre)
const AREA7: Rect[] = [
  { x1: 0, y1: 0, x2: 9, y2: 3 },
  { x1: 0, y1: 6, x2: 9, y2: 9 },
  { x1: 6, y1: 3, x2: 9, y2: 6 },
]
const P7: [number, number] = [3, 4.5]
// literal labels: 6 × 9 m outline, 3 × 3 m notch, P 3 m from the left edge (on the notch's inner edge)
const AREA7A: Rect[] = [
  { x1: 0, y1: 0, x2: 6, y2: 3 },
  { x1: 0, y1: 6, x2: 6, y2: 9 },
  { x1: 3, y1: 3, x2: 6, y2: 6 },
]
// handnote: 3 × 3 notch, P at its centre (1.5 m from the left edge)
const P7B: [number, number] = [1.5, 4.5]

// ---------------------------------------------------------------- Q7(b) time rate with the printed table
const S7 = 310,
  St7 = 90,
  cv7 = 9.5,
  H7 = 5
const r7 = () => {
  const U = (St7 / S7) * 100
  const T75 = tvFromTable(75)
  const T65 = tvFromTable(65)
  return { U, T75, T65, t75: timeFor(T75, H7, cv7), t65: timeFor(T65, H7 / 2, cv7), f75: tvBy(75, 'approx'), f65: tvBy(65, 'approx'), x75: tvBy(75, 'exact'), x65: tvBy(65, 'exact') }
}

// ---------------------------------------------------------------- Q7(c) borrow volume
const EW7 = EW_PRESETS[0].ew

// ---------------------------------------------------------------- Q8(a) gravity wall
const net8 = () => netOf('2324w')
const A8 = { x: 6, z: 4 }

export const B2023: SmQ[] = [
  {
    id: 'sm-2023-24-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 12,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Sand cone method for field density',
    text: "Explain the 'Sand Cone Method' for determination of field density of soils.",
    pages: [73],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-sandcone')} />,
    notes: ['Repeats 2021-22 Q4(b).'],
  },
  {
    id: 'sm-2023-24-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Safe excavation depth in 7 m of clay over sand (WT at GL)',
    text: 'The soil profile at a site consists of a 7 m thick clay layer ($\\gamma_{sat}$ = 17 kN/m³) underlain by a sand layer ($\\gamma_{sat}$ = 18 kN/m³). The clay layer extends from the ground surface. If water table is at the ground surface, determine the safe depth of excavation in the clay layer. Water level in the excavation will be maintained at the excavation bottom.',
    pages: [73],
    given: [],
    figure: () => (
      <div className="max-w-[460px] mx-auto">
        <ExFigure s={{ ...EX5, art: null, pit: 0, d: ex5().r1.dMax, FS: 1 }} />
      </div>
    ),
    checks: () => {
      const { r1, r12 } = ex5()
      return [
        { key: 'u', label: 'Water pressure at the clay–sand interface', value: r1.u, unit: 'kPa' },
        { key: 'd', label: 'Depth at which the base just heaves (FS = 1)', value: r1.dMax, unit: 'm' },
        { key: 'd12', label: 'Safe depth with FS = 1.2', value: r12.dSafe, unit: 'm', tol: 0.03 },
      ]
    },
    solution: () => {
      const { r1, r12 } = ex5()
      return (
        <Sol>
          <Md>{`The sand below the clay is connected to the water table at GL, so its pore pressure is hydrostatic. The pit is pumped to its bottom, so nothing but the clay plug left below the pit holds the base down.`}</Md>
          <Tex block>{`u = 7\\gamma_w = 7 \\times 9.81 = ${f2(r1.u)}\\ \\text{kPa (upward, at the clay base)}`}</Tex>
          <Md>{`Downward stress of the plug below a pit of depth d: $\\sigma = (7 - d)\\gamma_{sat} = (7 - d) \\times 17$. Heave starts when σ′ = 0 at the clay base:`}</Md>
          <Tex block>{`(7 - d)(17) = ${f2(r1.u)} \\Rightarrow 7 - d = ${f3(r1.u / 17)}\\ \\text{m} \\Rightarrow d_{max} = ${f2(r1.dMax)}\\ \\text{m}`}</Tex>
          <Md>{`With a factor of safety (FS = 1.2 as usually adopted for base heave): $(7 - d)(17) = 1.2 \\times ${f2(r1.u)}$ → $d = ${f2(r12.dSafe)}$ m.`}</Md>
          <Result>{`Safe depth of excavation ≈ **${f2(r1.dMax)} m** (limit, FS = 1); with FS = 1.2 about **${f2(r12.dSafe)} m**. The sand's γsat (18 kN/m³) is not needed. To dig deeper, lower the piezometric head in the sand (relief wells / dewatering).`}</Result>
        </Sol>
      )
    },
    notes: ['"Safe depth" is answered at FS = 1 (as the handnote, 2.96 m) and with FS = 1.2 (2.15 m).'],
  },
  {
    id: 'sm-2023-24-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 12,
    topics: ['sm-consol', 'sm-stress'],
    title: 'Settlement of 6 m NC clay under a 2 m × 3 m footing (250 kN) on its top',
    text: 'A 6 m thick stratum of clay is located at a depth of 8 m below the ground surface. For the clay layer: LL = 45, NMC = 40% and $G_s$ = 2.7. A sand layer, that extends from the ground surface, exists above this clay stratum. Water table is at a depth of 4 m below the ground surface. For the sand layer: γ = 17 kN/m³ (above water table) and γ′ = 10.5 kN/m³ (below water table). A 2 m × 3 m footing, carrying a column load of 250 kN is placed at the top of the clay layer. Schematically show the sub-soil profile at the site and estimate the total primary consolidation settlement of the clay layer.',
    pages: [73],
    given: [],
    figure: () => (
      <SoilColumn
        layers={[
          { H: 8, name: 'Sand', kind: 'sand', props: ['γ = 17 kN/m³ above WT', "γ′ = 10.5 kN/m³ below WT"] },
          { H: 6, name: 'Clay (NC)', kind: 'clay', props: ['LL = 45, w = 40 %, Gs = 2.7'] },
        ]}
        wt={4}
        footing={{ Df: 8, B: 2, label: '2 m × 3 m, 250 kN' }}
      />
    ),
    checks: () => {
      const { s, m } = st5()
      const sub = s.layers[0].subs[0]
      return [
        { key: 'e0', label: '$e_0 = wG_s$', value: e05 },
        { key: 'gsat', label: 'Clay $\\gamma_{sat}$', value: gsat5, unit: 'kN/m³' },
        { key: 'cc', label: '$C_c = 0.009(LL - 10)$', value: Cc5 },
        { key: 'p0', label: "$p'_0$ at the middle of the clay (11 m)", value: sub.p0, unit: 'kPa' },
        { key: 'dp', label: "Average $\\Delta p$ over the clay (2:1, Simpson)", value: sub.dp, unit: 'kPa', tol: 0.03 },
        { key: 'S', label: 'Primary consolidation settlement', value: s.S * 1000, unit: 'mm', tol: 0.05 },
        { key: 'Sm', label: 'Settlement with Δp at mid-depth only', value: m.S * 1000, unit: 'mm', tol: 0.05 },
      ]
    },
    solution: () => {
      const { s, m } = st5()
      return (
        <Sol>
          <Md>{`**Clay (saturated, NC):** $e_0 = wG_s = 0.40 \\times 2.7 = ${f3(e05)}$; $\\gamma_{sat} = \\frac{(G_s + e_0)\\gamma_w}{1 + e_0} = \\frac{(2.7 + ${f3(e05)})9.81}{${f3(1 + e05)}} = ${f2(gsat5)}$ kN/m³; $C_c = 0.009(45 - 10) = ${f3(Cc5)}$. Sand below the WT: γ′ = 10.5 is used directly (γsat = 10.5 + 9.81).`}</Md>
          <Md>{`**Δp by the 2:1 method** (z from the footing base, which sits on the clay top): $\\Delta p = Q/[(B + z)(L + z)]$ at the top, middle and bottom of the clay, averaged by Simpson's rule, because Δp drops fast below a small footing.`}</Md>
          <SettleSolution inp={SET5('simpson')} out={s} />
          <Frm wide={560}>
            <ProfileFig inp={SET5('simpson')} out={s} />
          </Frm>
          <Result>{`Total primary consolidation settlement ≈ **${f2(s.S * 1000)} mm** (Δp averaged over the layer). Using Δp at the mid-depth only gives ${f2(m.S * 1000)} mm — an underestimate here.`}</Result>
        </Sol>
      )
    },
    notes: ['No method is named for Δp: the 2:1 method with the Simpson average follows the handnote (37 mm); Boussinesq below the centre would also be acceptable.', 'The clay is taken as normally consolidated (no pc′ given) and fully saturated (e0 = wGs).'],
  },
  {
    id: 'sm-2023-24-5d',
    paper: P,
    sec: 'B',
    no: '5(d)',
    marks: 12.67,
    topics: ['sm-comp'],
    title: 'Compaction characteristics of various soils; significance of the ZAV line',
    text: "Discuss the compaction characteristics of various soil types. Also, state the significance of 'zero air void line' on compaction curve.",
    pages: [73],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Compaction characteristics of various soil types (8)', item: th('sm-comp', 't-soiltypes') },
          { title: "Significance of the zero-air-void line (4⅔)", item: th('sm-comp', 't-curve'), noFig: true },
        ]}
      />
    ),
    notes: ['Printed marks 8 + 4⅔.'],
  },
  {
    id: 'sm-2023-24-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 10.67,
    topics: ['sm-consol'],
    title: 'cv by log-time vs root-time: advantages and limitations',
    text: 'Discuss the advantages and limitations of using of values of co-efficient of consolidation obtained by logarithm-of-time method and square-root-of-time method.',
    pages: [73],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-fit')} />,
    notes: ['"using of values" is sic.'],
  },
  {
    id: 'sm-2023-24-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 6,
    topics: ['sm-stress'],
    title: 'Stress increase with depth below circular, square and strip loads',
    text: 'Compare the increase in vertical stress with depth below the center of circular, square and strip loads.',
    pages: [73],
    theory: true,
    solution: () => <BulbAnswer />,
    notes: ['Repeats 2020-21 Q4(c) and Jan 2021 Q3(a).'],
  },
  {
    id: 'sm-2023-24-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 18,
    topics: ['sm-seep'],
    title: 'Sheet pile with a drawn flow net: heave (Terzaghi) and piping checks',
    text: 'Fig. 1 shows a section through a sheet pile wall along with flow net. Analyze and comment on the stability of the wall against heaving and piping failure.\n\n(Fig. 1: water 5 m above the ground upstream and 1.5 m downstream; the pile penetrates 5 m into a 10 m sand layer (Gs = 2.65, $\\gamma_{sat}$ = 18 kN/m³) on an impermeable layer.)',
    pages: [73],
    given: [],
    figure: () => <NetFig c={net6()} Nf={3} />,
    checks: () => {
      const c = net6()
      return [
        { key: 'H', label: 'Head lost H', value: c.sol.H, unit: 'm' },
        { key: 'icr', label: "$i_{cr} = \\gamma'/\\gamma_w$", value: c.R.icr },
        { key: 'dh', label: 'Drop per equipotential (drawn net: Nd = 6)', value: c.sol.H / 6, unit: 'm' },
        { key: 'fsh', label: 'FS against heave (Terzaghi)', value: c.R.heave!.FS, tol: 0.08 },
        { key: 'ie', label: 'Exit gradient beside the pile (drawn net)', value: c.R.ie, tol: 0.15 },
        { key: 'fsp', label: 'FS against piping (Harza)', value: c.R.icr / c.R.ie, tol: 0.15 },
      ]
    },
    solution: () => {
      const c = net6()
      const b = net6b()
      const hv = c.R.heave!
      return (
        <Sol>
          <Md>{`**Count the net in Fig. 1.** Flow lines: the pile, two U-shaped lines and the impermeable base → $N_f = 3$. Equipotentials: the two ground surfaces, two arches either side and the vertical line below the tip → $N_d = 6$. The solver's square net gives $N_f/N_d = ${f3(c.sol.shape)}$ (= 3/${f2(c.R.Nd)}), the same ratio.`}</Md>
          <Tex block>{`H = 5 - 1.5 = ${f2(c.sol.H)}\\ \\text{m},\\quad \\Delta h = H/N_d = ${f2(c.sol.H)}/6 = ${f3(c.sol.H / 6)}\\ \\text{m},\\quad \\gamma' = 18 - 9.81 = ${f2(c.R.gsub)},\\quad i_{cr} = ${f2(c.R.gsub)}/9.81 = ${f3(c.R.icr)}`}</Tex>
          <Head>Heave (Terzaghi): prism D × D/2 on the downstream side</Head>
          <Md>{`D = ${f2(hv.D)} m (pile depth below the downstream ground), width D/2 = ${f2(hv.D / 2)} m. Average excess head (above tail water) along the prism base at the tip level, read from the net: $h_a = ${f3(hv.ha)}$ m (≈ ${f2(hv.ha / c.sol.H)}H).`}</Md>
          <Tex block>{`FS = \\frac{W'}{U} = \\frac{D\\gamma'}{h_a\\gamma_w} = \\frac{${f2(hv.D)} \\times ${f2(c.R.gsub)}}{${f3(hv.ha)} \\times 9.81} = ${f2(hv.FS)}`}</Tex>
          <Head>Piping (Harza): exit gradient in the last field beside the pile</Head>
          <Md>{`Last field along the downstream face: $l = ${f2(c.R.exitL)}$ m, so $i_e = \\Delta h/l = ${f3(c.sol.H / 6)}/${f2(c.R.exitL)} = ${f3(c.R.ie)}$ and $FS = i_{cr}/i_e = ${f3(c.R.icr)}/${f3(c.R.ie)} = ${f2(c.R.icr / c.R.ie)}$. A finer net (4 channels, ${f2(b.R.Nd)} drops) gives $i_e = ${f3(b.R.ie)}$, FS = ${f2(b.R.icr / b.R.ie)} — practically the same.`}</Md>
          <NetFig c={c} Nf={3} prism exit />
          <Result>{`FS against heave ≈ **${f2(hv.FS)}** and against piping ≈ **${f2(c.R.icr / c.R.ie)}** (${f2(b.R.icr / b.R.ie)} with the finer net). Both exceed about 3, the margin normally required because flow nets are approximate: **the wall is safe** against heaving and piping. A filter / weighting blanket downstream would add margin if needed.`}</Result>
        </Sol>
      )
    },
    notes: ['The net is redrawn from the solver with 3 channels (it reproduces the printed 3 × 6 net). The handnote counts 4/8 (same ratio): FS heave 3.57, piping ≈ 4.0.', 'Printed marks 10 + 8.'],
  },
  {
    id: 'sm-2023-24-6d',
    paper: P,
    sec: 'B',
    no: '6(d)',
    marks: 12,
    topics: ['sm-perm'],
    title: 'Derive the equivalent k for flow perpendicular to layers',
    text: "Derive expression for 'equivalent coefficient of permeability' of layered deposits with flow direction perpendicular to bedding plane.",
    pages: [73],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-layered')} />,
  },
  {
    id: 'sm-2023-24-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 12.67,
    topics: ['sm-stress'],
    title: "Newmark's chart: notched area, 150 kPa, 3 m below P",
    text: "An area (Fig. 2) is loaded with a uniform pressure of 150 kPa. Using Newmarks's influence chart (provided) determine the increase in vertical stress at a point which is 3 m below point 'P' as shown in the figure. (Attach the chart with the answer script).",
    pages: [74, 76],
    given: [{ label: "Newmark's influence chart", what: '0.005, 200 meshes (p. 76)', ref: 'd-newmark' }],
    figure: () => (
      <div className="max-w-[420px] mx-auto">
        <PlanFig
          rects={AREA7}
          P={P7}
          dims={[
            { a: [0, 9], b: [6, 9], text: 'notch depth (printed "3 m", drawn ≈ 6 m)', off: -12 },
            { a: [6, 9], b: [9, 9], text: '3 m', off: -26 },
            { a: [0, 0], b: [0, 3], text: '3 m' },
            { a: [0, 3], b: [0, 6], text: '3 m' },
            { a: [0, 6], b: [0, 9], text: '3 m' },
            { a: [0, 4.5], b: [3, 4.5], text: '3 m', off: 12 },
          ]}
        />
      </div>
    ),
    checks: () => {
      const n = newmarkOf(shift(AREA7, P7), 3)
      return [
        { key: 'N', label: 'Meshes covered N', value: n.N, tol: 0.05 },
        { key: 's', label: 'Vertical stress increase 3 m below P', value: n.I * 150, unit: 'kPa', tol: 0.05 },
      ]
    },
    solution: () => (
      <>
        <NewmarkSolved
          rel={shift(AREA7, P7)}
          z={3}
          q={150}
          lead="**Reading of Fig. 2 (from the drawing):** the plan is drawn to a common scale on which the outline is 9 m × 9 m, the notch cut into the left side over the middle 3 m of height is about 6 m deep, the solid strip to its right is 3 m, and P is the dot at the centre of the notch, 3 m from the left edge and 1.5 m below the notch's top edge (both printed). P lies outside the loaded area, in the notch."
        />
        <Result>{`σz ≈ **${f2(newmarkOf(shift(AREA7, P7), 3).I * 150)} kPa** (N ≈ ${f2(newmarkOf(shift(AREA7, P7), 3).N)} meshes). The handnote's reading (3 × 3 notch, P at its centre 1.5 m from the edge) gives ${f2(newmarkOf(shift(AREA7A, P7B), 3).I * 150)} kPa — practically the same, because P sits at the centre of the notch in both.`}</Result>
      </>
    ),
    notes: [
      'Fig. 2 is not to scale and its labels conflict: the top dimensions print "3 m + 3 m" (a 6 m wide outline) but the notch is drawn about 6 m deep with a 3 m strip to its right. The main answer follows the drawing (P at the notch centre, 3 m from the left edge).',
      `Literal-label reading (6 m × 9 m outline, 3 m × 3 m notch, P 3 m from the left edge, i.e. on the notch's inner edge at mid-height): N ≈ ${f2(newmarkOf(shift(AREA7A, P7), 3).N)}, σz ≈ ${f2(newmarkOf(shift(AREA7A, P7), 3).I * 150)} kPa.`,
      'Attach the chart with the plan drawn on it: AB = 3 m.',
    ],
  },
  {
    id: 'sm-2023-24-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 20,
    topics: ['sm-consol'],
    title: 'U at 90 mm of 310 mm; times for 75 % (one-way) and 65 % (two-way)',
    text: 'A clay layer at a site is 5 m thick and is drained at the top only. Total consolidation settlement of the clay layer, due to application of a surcharge on the ground surface, is estimated as 310 mm. Given, $c_v$ = 9.5 m²/year for the clay, determine:\n\n(i) Average degree of consolidation of the clay layer at the time when settlement is 90 mm. (8)\n(ii) Time for 75% consolidation to occur. (6)\n(iii) Time for 65% consolidation to occur if the layer is drained on both sides. (6)\n\nTime factor $T_v$ for various degree of consolidation are given in the table.\n\n| U % | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |\n|---|---|---|---|---|---|---|---|---|---|---|\n| $T_v$ | 0.008 | 0.031 | 0.071 | 0.126 | 0.197 | 0.287 | 0.403 | 0.567 | 0.848 | ∞ |',
    pages: [74],
    given: [TV_GIVEN],
    checks: () => {
      const r = r7()
      return [
        { key: 'U', label: '(i) Average degree of consolidation', value: r.U, unit: '%' },
        { key: 'T75', label: '(ii) $T_v$ for 75 % (table)', value: r.T75 },
        { key: 't75', label: '(ii) Time for 75 %', value: r.t75, unit: 'years', tol: 0.03 },
        { key: 'T65', label: '(iii) $T_v$ for 65 % (table)', value: r.T65 },
        { key: 't65', label: '(iii) Time for 65 %, double drainage', value: r.t65, unit: 'years', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = r7()
      return (
        <Sol>
          <Tex block>{`\\text{(i)}\\quad U = \\frac{S_t}{S_{final}} = \\frac{90}{310} = ${f4(r.U / 100)} = ${f2(r.U)}\\ \\%`}</Tex>
          <Md>{`**(ii)** Drained at the top only: $d = H = 5$ m. From the table, interpolating between 70 % (0.403) and 80 % (0.567): $T_{75} = 0.403 + 0.5(0.567 - 0.403) = ${f3(r.T75)}$.`}</Md>
          <Tex block>{`t = \\frac{T_vd^2}{c_v} = \\frac{${f3(r.T75)} \\times 5^2}{9.5} = ${f3(r.t75)}\\ \\text{years} \\approx ${f2(r.t75 * 12)}\\ \\text{months}`}</Tex>
          <Md>{`**(iii)** Drained on both sides: $d = H/2 = 2.5$ m. $T_{65} = 0.287 + 0.5(0.403 - 0.287) = ${f3(r.T65)}$.`}</Md>
          <Tex block>{`t = \\frac{${f3(r.T65)} \\times 2.5^2}{9.5} = ${f3(r.t65)}\\ \\text{years} \\approx ${f2(r.t65 * 365)}\\ \\text{days}`}</Tex>
          <Tbl head={['U', 'table (interpolated)', 'formula 1.781 − 0.933 log(100 − U)', 'exact series']} rows={[['75 %', f3(r.T75), f3(r.f75), f3(r.x75)], ['65 %', f3(r.T65), f3(r.f65), f3(r.x65)]]} cap="The printed table is what the paper asks for; the formula / exact values give 1.26 yr and 0.224 yr." />
          <Result>{`(i) U ≈ **${f2(r.U)} %**; (ii) t75 ≈ **${f2(r.t75)} years**; (iii) t65 ≈ **${f3(r.t65)} years** (≈ ${f2(r.t65 * 365)} days).`}</Result>
        </Sol>
      )
    },
    notes: ['Printed marks 8 + 6 + 6.'],
  },
  {
    id: 'sm-2023-24-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 14,
    topics: ['sm-comp'],
    title: 'Borrow volume for 1000 m³ of embankment at 95 % RC',
    text: 'The soil at a site has water content of 18% and bulk unit weight of 16.5 kN/m³. The specific gravity is 2.70. Soil from this site will be used to construct an embankment section of 1000 cum. The soil will be compacted at 95% relative compaction with respect to MDD of 17.0 kN/m³ and OMC of 15%. Determine the required volume of excavation at the borrow site.',
    pages: [74],
    given: [],
    checks: () => {
      const r = runEarthwork(EW7).res[0].p
      return [
        { key: 'gdb', label: 'Dry unit weight at the borrow site', value: r.gdBank, unit: 'kN/m³' },
        { key: 'Ws', label: 'Weight of solids in the embankment', value: r.Ws, unit: 'kN' },
        { key: 'V', label: 'Volume of excavation at the borrow site', value: r.Vbank, unit: 'm³' },
      ]
    },
    solution: () => (
      <Sol>
        <Md>{`Solids are conserved: the dry weight placed in the embankment is the dry weight dug out. Fill: $\\gamma_d = RC \\times MDD = 0.95 \\times 17.0$; borrow: $\\gamma_d = \\gamma/(1 + w) = 16.5/1.18$.`}</Md>
        <EarthworkSolution ew={EW7} />
        <Result>{`Volume to excavate ≈ **${f2(runEarthwork(EW7).res[0].p.Vbank)} m³**. Gs is not needed. The borrow soil (18 %) is 3 % wet of OMC (15 %), so it must be dried (aerated) before compaction.`}</Result>
      </Sol>
    ),
  },
  {
    id: 'sm-2023-24-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 18.67,
    topics: ['sm-seep'],
    title: 'Flow net under a gravity retaining wall; seepage and pore pressure at A',
    text: 'Fig. 3 shows a section through a 20 m long retaining wall. Draw a flow-net. Also, determine the seepage pressure and hydrostatic pressure at point A.\n\n(Fig. 3: wall 6 m wide; retained side water table at its ground surface, 7 m above the front ground and water level; wall base 3 m below the front ground; sand to an impermeable stratum 10 m below the front ground; A on the vertical through the front face, 3 m below the base.)',
    pages: [74, 75],
    given: [],
    figure: () => <NetFig c={net8()} net={false} marks={[{ ...A8, label: 'A' }]} />,
    checks: () => {
      const c = net8()
      const a = netPoint(c, A8.x, A8.z)
      return [
        { key: 'H', label: 'Total head lost H', value: c.sol.H, unit: 'm' },
        { key: 'r', label: '$N_f/N_d$ of the net', value: c.sol.shape, tol: 0.08 },
        { key: 'h', label: 'Excess head at A (above the front water level)', value: a.excess, unit: 'm', tol: 0.06 },
        { key: 'ps', label: 'Seepage pressure at A', value: a.excess * GW, unit: 'kPa', tol: 0.06 },
        { key: 'u', label: 'Pore (hydrostatic) water pressure at A', value: a.u, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => {
      const c = net8()
      const a = netPoint(c, A8.x, A8.z)
      return (
        <Sol>
          <Md>{`**Boundaries.** Equipotentials: the retained-side ground (water table at its surface, h = 7 m above the front water level) and the front ground (h = 0). Flow lines: the back face, base and front face of the wall (first flow line) and the impermeable stratum (last). Water flows down behind the wall, under the base and up in front of it.`}</Md>
          <Md>{`**Net.** With $N_f = ${c.st.Nf}$ channels the squares need $N_d = ${f2(c.R.Nd)}$ drops ($N_f/N_d = ${f3(c.sol.shape)}$, solver), so a hand net of 4 channels and about 11 drops is right. $\\Delta h = 7/${f2(c.R.Nd)} = ${f3(c.R.dh)}$ m.`}</Md>
          <NetFig c={c} marks={[{ ...A8, label: 'A' }]} />
          <Md>{`**Point A** (6 m below the front ground, below the front face): about ${f2(a.drops)} drops are used before A, so the head left above the front water level is $h_A = ${f2(c.sol.H)} - ${f2(a.drops)} \\times ${f3(c.R.dh)} = ${f3(a.excess)}$ m.`}</Md>
          <Tex block>{`\\text{seepage pressure} = h_A\\gamma_w = ${f3(a.excess)} \\times 9.81 = ${f2(a.excess * GW)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`u_A = (\\text{depth below the front water level} + h_A)\\gamma_w = (6 + ${f3(a.excess)}) \\times 9.81 = ${f2(a.u)}\\ \\text{kPa}`}</Tex>
          <Result>{`Seepage pressure at A ≈ **${f2(a.excess * GW)} kPa**; pore (hydrostatic + seepage) water pressure ≈ **${f2(a.u)} kPa** (static part 6 × 9.81 = ${f2(6 * GW)} kPa). The 20 m length matters only for the total seepage (k is not given).`}</Result>
        </Sol>
      )
    },
    notes: ['"Hydrostatic pressure at A" is read as the pore water pressure there (static + seepage), as in the handnote (78.4 kPa).'],
  },
  {
    id: 'sm-2023-24-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 12,
    topics: ['sm-stress'],
    title: "Steinbrenner's chart: 6 m below the centre of a 4 m × 6 m footing (4800 kN)",
    text: "A foundation of size 4 m × 6 m transmits a total load of 4800 kN to the soil at its base. Determine the increase in vertical stress at a point which is 6 m below the center of the foundation. Use Newmark's solution, σz = q I. Steinbrener's chart for Newmark's influence coefficient, I is provided (Fig. 4).",
    pages: [75],
    given: [{ label: "Steinbrenner's chart", what: 'I vs z/b for l/b = 1, 2, 5, 10, ∞ (Fig. 4)', ref: 'd-steinbrenner' }],
    figure: () => (
      <div className="max-w-[360px] mx-auto">
        <PlanFig rects={[{ x1: 0, y1: 0, x2: 6, y2: 4 }]} P={[3, 2]} hatch={[{ x1: 3, y1: 2, x2: 6, y2: 4 }]} dims={[{ a: [0, 4], b: [6, 4], text: '6 m' }, { a: [0, 0], b: [0, 4], text: '4 m' }]} label="centre" />
      </div>
    ),
    checks: () => {
      const I = Irect(2 / 6, 3 / 6)
      return [
        { key: 'q', label: 'Contact pressure q', value: 4800 / 24, unit: 'kPa' },
        { key: 'I', label: 'I for one 2 m × 3 m quarter (z/b = 3, l/b = 1.5)', value: I, tol: 0.05 },
        { key: 's', label: 'σz 6 m below the centre', value: 4 * 200 * I, unit: 'kPa', tol: 0.05 },
      ]
    },
    solution: () => {
      const I = Irect(2 / 6, 3 / 6)
      return (
        <Sol>
          <Md>{`$q = 4800/(4 \\times 6) = 200$ kPa. The chart gives I below a **corner**, so split the footing into four 2 m × 3 m rectangles that meet at the centre (one is outlined). For each: $b = 2$ m (shorter side), $l = 3$ m, $z/b = 6/2 = 3$, $l/b = 1.5$.`}</Md>
          <Md>{`Fig. 4 has no l/b = 1.5 curve: at z/b = 3 read I on the l/b = 1 curve (${f4(Irect(1 / 3, 1 / 3))}) and the l/b = 2 curve (${f4(Irect(1 / 3, 2 / 3))}) and interpolate: I ≈ ${f4((Irect(1 / 3, 1 / 3) + Irect(1 / 3, 2 / 3)) / 2)}. The formula (m = b/z = 0.333, n = l/z = 0.5) gives I = ${f4(I)}.`}</Md>
          <Tex block>{`\\sigma_z = 4qI = 4 \\times 200 \\times ${f4(I)} = ${f2(4 * 200 * I)}\\ \\text{kPa}`}</Tex>
          <Result>{`Increase in vertical stress 6 m below the centre ≈ **${f2(4 * 200 * I)} kPa**.`}</Result>
        </Sol>
      )
    },
    notes: ['The chart title prints "Steinbrener" (sic).'],
  },
  {
    id: 'sm-2023-24-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 16,
    topics: ['sm-seep'],
    title: 'Define i and icr; derive icr = γ′/γw',
    text: "Define 'hydraulic gradient' and 'critical hydraulic gradient' relevant to flow through soils. Derive an expression for 'critical hydraulic gradient' in terms of effective unit weight of soil and unit weight of water.",
    pages: [75],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-icr')} />,
    notes: ['Printed marks 8 + 8.'],
  },
]
