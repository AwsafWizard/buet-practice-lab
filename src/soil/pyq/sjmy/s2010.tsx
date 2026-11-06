// CE 341 term final 2010-11 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8, any THREE), held 1 Feb 2012, PDF pp. 16–19 (Fig. 1 sheet piling p. 19).
import { Md, Tex } from '../../../components/ui'
import { waterToSaturate } from '../../engine/compaction'
import { secondary, settleNC, timeFor, tvApprox, tvFromTable } from '../../engine/consolidation'
import { Irect } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import type { SmQ } from '../../types'
import { big, f0, f2, f3, f4, Frm, Head, Model, NetFig, oldNet, PlanFig, Result, sci, sciTex, Sol, Tbl, th, thx } from './old-kit'

const P = '2010-11' as const

// ---------------------------------------------------------------- Q5(c) two borrow areas
const EW5 = EW_PRESETS[5].ew
const r5c = () => {
  const { res } = runEarthwork(EW5)
  const sat = waterToSaturate({ V: 100, e: 0.8, Gs: 2.65, w: 0.2, gw: 1 })
  return { A: res[0], B: res[1], sat }
}

// ---------------------------------------------------------------- Q6(c) read as 50 % in one year (5 % printed)
const C6 = { H: 4, dp: 55, k: 0.02, t: 1, S: 0.429 }
const r6c = (Upct: number, Tv: number) => {
  const d = C6.H / 2
  const cv = (Tv * d * d) / C6.t
  const mv = C6.k / (cv * GW)
  const S = mv * C6.dp * C6.H
  const S1 = (Upct / 100) * S
  const U2 = (C6.S / S) * 100
  const T2 = U2 < 100 ? tvApprox(U2) : NaN
  return { d, cv, mv, S, S1, U2, T2, t2: timeFor(T2, d, cv) }
}
const r50 = () => r6c(50, tvFromTable(50))
const r05 = () => r6c(5, tvApprox(5))

// ---------------------------------------------------------------- Q7(d) sheet pile (Craig Ex. 2.1 with 5 m penetration)
const net7 = () => oldNet('1011')
const T6M = 182.5 * 86400

// ---------------------------------------------------------------- Q8(b) 2 m × 4 m, 8 t/m², z = 5 m
const r8b = () => {
  const Ic = Irect(1 / 5, 2 / 5)
  const Ik = Irect(2 / 5, 4 / 5)
  return { Ic, Ik, sc: 4 * Ic * 8, sk: Ik * 8 }
}

// ---------------------------------------------------------------- Q8(c) primary + secondary (US units)
const r8c = () => {
  const lgr = Math.log10((2650 + 970) / 2650)
  const Sp = settleNC(0.28, 8.5, 0.8, 2650, 970)
  const de = 0.28 * lgr
  const ep = 0.8 - de
  const s = secondary({ Ca: 0.02, ep, H: 8.5, t1: 1.5, t2: 6.5 })
  return { lgr, Sp, de, ep, Cap: s.Cap, Ss: s.S, St: Sp + s.S }
}

export const B2010: SmQ[] = [
  {
    id: 'sm-2010-11-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 16,
    topics: ['sm-comp'],
    title: 'Compaction curve: salient features; zero-air-void line',
    text: 'What is a compaction curve? Give its salient features. What is a zero-air void line?',
    pages: [16],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-curve')} />,
    notes: ['Repeats 2008-09 Q5(d).'],
  },
  {
    id: 'sm-2010-11-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 10.67,
    topics: ['sm-comp', 'sm-consol'],
    title: 'Compaction vs consolidation; factors affecting compaction',
    text: 'Distinguish between compaction and consolidation. What are the factors that affect compaction? Discuss in brief.',
    pages: [16],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-vs-consol')} />,
  },
  {
    id: 'sm-2010-11-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 20,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Borrow area A or B for 10,000 m³ of fill (cost per 100 m³); water to saturate 100 m³ at A',
    text: "There are two borrow areas 'A' and 'B' which have soils with void ratios of 0.80 and 0.70 respectively. The in-place water contents are 20% and 15% respectively. The fill at the end of construction will have a total volume of 10,000 m³ with a bulk density of 2 ton/m³ at a moisture content of 22%. Determine the volume of the soil required to be excavated from both the areas. Assume $G_s$ = 2.65. If the cost of excavation of soil and transportation is Tk. 2000/- per 100 m³ for area 'A' and Tk. 2200/- per 100 m³ for area 'B', which borrow area is more economical? Also calculate the additional quantity of water to make 100 m³ of fully saturated borrow soil at 'A'.",
    pages: [17],
    given: [],
    checks: () => {
      const r = r5c()
      return [
        { key: 'Ms', label: 'Dry mass of solids in the fill', value: r.A.p.Ws, unit: 't' },
        { key: 'VA', label: 'Volume to excavate from A', value: r.A.p.Vbank, unit: 'm³' },
        { key: 'VB', label: 'Volume to excavate from B', value: r.B.p.Vbank, unit: 'm³' },
        { key: 'cA', label: 'Cost from A', value: r.A.total, unit: 'Tk' },
        { key: 'cB', label: 'Cost from B', value: r.B.total, unit: 'Tk' },
        { key: 'w', label: 'Water to saturate 100 m³ of borrow soil at A', value: r.sat.water, unit: 't' },
      ]
    },
    solution: () => {
      const r = r5c()
      return (
        <Sol>
          <EarthworkSolution ew={EW5} />
          <Head>Water to saturate 100 m³ of borrow soil at A</Head>
          <Tex block>{`w_{sat} = \\frac{e}{G_s} = \\frac{0.80}{2.65} = ${f2(r.sat.wSat * 100)}\\ \\%,\\quad M_s = \\frac{G_s\\rho_wV}{1 + e} = \\frac{2.65 \\times 100}{1.80} = ${f2(r.sat.Ws)}\\ \\text{t}`}</Tex>
          <Tex block>{`\\Delta M_w = (w_{sat} - w)M_s = (${f4(r.sat.wSat)} - 0.20) \\times ${f2(r.sat.Ws)} = ${f2(r.sat.water)}\\ \\text{t} \\approx ${f2(r.sat.waterVol)}\\ \\text{m}^3`}</Tex>
          <Result>{`Excavate **${big(r.A.p.Vbank)} m³** from A (Tk ${big(r.A.total)}) or **${big(r.B.p.Vbank)} m³** from B (Tk ${big(r.B.total)}): **area A is more economical** (it also needs less added water, 2 % against 7 %). Water to saturate 100 m³ at A ≈ **${f2(r.sat.water)} t (${f2(r.sat.waterVol)} m³)**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2010-11-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 10.67,
    topics: ['sm-consol'],
    title: 'Causes of preconsolidation; effect on settlement',
    text: 'What are the different causes of preconsolidation in soils? What is the effect of preconsolidation on the settlement?',
    pages: [17],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-ncoc')} />,
    notes: ['"preconsolodation" (sic).'],
  },
  {
    id: 'sm-2010-11-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 16,
    topics: ['sm-consol'],
    title: 'Time factor and U; prove S² ∝ t for U < 60 %',
    text: 'What is the time factor? How is it related to the average degree of consolidation? Prove that S² ∝ t for U < 60%, where S is the settlement achieved in time t and U is the average degree of consolidation.',
    pages: [17],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-tv')} />,
  },
  {
    id: 'sm-2010-11-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 20,
    topics: ['sm-consol', 'sm-perm'],
    title: '4 m clay, double drainage, Δp 55 kPa, k = 0.020 m/yr: settlement in one year; time to 429 mm',
    text: 'A clay layer 4 m thick is subjected to a pressure of 55 kN/m². If the layer has a double drainage condition and undergoes 5% consolidation, determine the settlement in one year. Given K = 0.020 m/yr. How much time will it take to reach 429 mm settlement?',
    pages: [17],
    given: [{ label: 'Tv–U table', what: 'formula sheet', ref: 'k-tvu' }],
    checks: () => {
      const r = r50()
      return [
        { key: 'cv', label: '$c_v$ (50 % in one year)', value: r.cv, unit: 'm²/yr' },
        { key: 'mv', label: '$m_v = k/(c_v\\gamma_w)$', value: r.mv * 1e3, unit: '× 10⁻³ m²/kN' },
        { key: 'S', label: 'Final settlement', value: r.S * 1000, unit: 'mm' },
        { key: 'S1', label: 'Settlement in one year', value: r.S1 * 1000, unit: 'mm' },
        { key: 'U2', label: 'U at 429 mm', value: r.U2, unit: '%' },
        { key: 't2', label: 'Time to reach 429 mm', value: r.t2, unit: 'years', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = r50()
      const x = r05()
      return (
        <Sol>
          <Md>{`**Reading.** As printed ("undergoes 5% consolidation", no time) the data do not close: taking 5 % in one year gives a final settlement of ${f0(x.S)} m — absurd — and 429 mm would then be only ${f2((0.429 / x.S) * 100)} % of it. The only consistent reading is **50 % consolidation in one year** (429 mm then sits at 75 %), which is solved below.`}</Md>
          <Md>{`Double drainage: $d = H/2 = ${f2(r.d)}$ m. U = 50 % → $T_v = 0.197$ at t = 1 yr:`}</Md>
          <Tex block>{`c_v = \\frac{T_vd^2}{t} = \\frac{0.197 \\times ${f2(r.d)}^2}{1} = ${f3(r.cv)}\\ \\text{m}^2/\\text{yr},\\qquad m_v = \\frac{k}{c_v\\gamma_w} = \\frac{0.020}{${f3(r.cv)} \\times 9.81} = ${sciTex(r.mv, 3)}\\ \\text{m}^2/\\text{kN}`}</Tex>
          <Tex block>{`S = m_v\\Delta pH = ${sciTex(r.mv, 3)} \\times 55 \\times 4 = ${f3(r.S)}\\ \\text{m};\\qquad S_{1\\,yr} = 0.50 \\times ${f3(r.S)} = ${f0(r.S1 * 1000)}\\ \\text{mm}`}</Tex>
          <Md>{`**429 mm:** $U = 0.429/${f3(r.S)} = ${f2(r.U2)}$ % (≥ 60 %) → $T_v = 1.781 - 0.933\\log(100 - ${f2(r.U2)}) = ${f3(r.T2)}$:`}</Md>
          <Tex block>{`t = \\frac{T_vd^2}{c_v} = \\frac{${f3(r.T2)} \\times ${f2(r.d)}^2}{${f3(r.cv)}} = ${f2(r.t2)}\\ \\text{years}`}</Tex>
          <Result>{`Settlement in one year ≈ **${f0(r.S1 * 1000)} mm** (final ${f0(r.S * 1000)} mm); 429 mm is reached after ≈ **${f2(r.t2)} years**.`}</Result>
        </Sol>
      )
    },
    notes: [
      'The scan clearly prints "5%" with no time attached. Read as "50% consolidation in one year" — the only reading consistent with the 429 mm asked for later (the handnote reads it the same way).',
      `Literal 5 %-in-one-year reading: Tv = 0.00196, cv = 0.0079 m²/yr, final settlement ≈ 57 m — physically impossible.`,
    ],
  },
  {
    id: 'sm-2010-11-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 8,
    topics: ['sm-perm'],
    title: '"Permeability tests on cohesionless materials are often misleading" — explain',
    text: '"The results of permeability tests on cohesionless materials are often misleading." Explain.',
    pages: [17],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-misleading')} />,
  },
  {
    id: 'sm-2010-11-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 8,
    topics: ['sm-perm', 'sm-consol'],
    title: 'How is k of a clay determined?',
    text: 'How do you determine the co-efficient of permeability of clay?',
    pages: [17],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-k-clay')} />,
  },
  {
    id: 'sm-2010-11-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 10.67,
    topics: ['sm-seep'],
    title: 'Effect of seepage pressure on effective stress, with examples',
    text: 'What is the effect of the seepage pressure on the effective stress? Give examples.',
    pages: [17],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-seep-pressure')} />,
  },
  {
    id: 'sm-2010-11-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 20,
    topics: ['sm-seep'],
    title: 'Sheet pile (H = 4 m, 5 m penetration): flow net, seepage in 6 months, FS against heave (Terzaghi)',
    text: "Draw the flow net diagram for the problem shown in Fig. 1. Also calculate the seepage loss in 6 months and factor of safety against heaving using Terzaghi's criteria. Given K = 2.5 × 10⁻⁵ m/sec and $\\gamma_{sat}$ = 21.5 kN/m³.\n\n(Fig. 1: sheet piling; upstream water 4.50 m and downstream water 0.50 m above the ground; penetration 5.00 m below the downstream ground; permeable layer 8.60 m thick on an impermeable layer. \"P.S. You may draw flow net diagram on this page and attach this with the answer script.\")",
    pages: [17, 19],
    given: [],
    figure: () => <NetFig c={net7()} net={false} />,
    checks: () => {
      const c = net7()
      const q = c.st.k * c.sol.H * c.sol.shape
      const hv = c.R.heave!
      return [
        { key: 'H', label: 'Head lost H', value: c.sol.H, unit: 'm' },
        { key: 'r', label: '$N_f/N_d$', value: c.sol.shape, tol: 0.08 },
        { key: 'q', label: 'Seepage per metre', value: q * 1e5, unit: '× 10⁻⁵ m³/s', tol: 0.08 },
        { key: 'Q', label: 'Seepage loss in 6 months', value: q * T6M, unit: 'm³ per m', tol: 0.08 },
        { key: 'g', label: "$\\gamma'$", value: c.R.gsub, unit: 'kN/m³' },
        { key: 'ha', label: 'Average excess head at the prism base, $h_a$', value: hv.ha, unit: 'm', tol: 0.08 },
        { key: 'fs', label: 'FS against heave (Terzaghi)', value: hv.FS, tol: 0.08 },
      ]
    },
    solution: () => {
      const c = net7()
      const q = c.st.k * c.sol.H * c.sol.shape
      const hv = c.R.heave!
      return (
        <Sol>
          <Md>{`$H = 4.50 - 0.50 = ${f2(c.sol.H)}$ m. **Boundaries:** upstream and downstream beds are equipotentials; the pile (both faces) and the impermeable layer are the first and last flow lines.`}</Md>
          <Frm>
            <NetFig c={c} prism />
          </Frm>
          <Md>{`**Net.** 4 channels need $N_d ≈ ${f2(c.R.Nd)}$ drops for squares ($N_f/N_d = ${f3(c.sol.shape)}$).`}</Md>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 2.5\\times10^{-5} \\times ${f2(c.sol.H)} \\times ${f3(c.sol.shape)} = ${sciTex(q, 3)}\\ \\text{m}^3/\\text{s per m};\\quad Q_{6\\,mo} = q \\times 182.5 \\times 86400 = ${f0(q * T6M)}\\ \\text{m}^3\\ \\text{per m}`}</Tex>
          <Head>Heave (Terzaghi): prism D × D/2 beside the pile, downstream</Head>
          <Md>{`D = ${f2(hv.D)} m, width ${f2(hv.D / 2)} m; $\\gamma' = 21.5 - 9.81 = ${f2(c.R.gsub)}$ kN/m³. From the net, the average excess head along the prism base (pile-tip level) is $h_a = ${f3(hv.ha)}$ m.`}</Md>
          <Tex block>{`FS = \\frac{W'}{U} = \\frac{\\tfrac{D}{2}D\\gamma'}{\\tfrac{D}{2}h_a\\gamma_w} = \\frac{${f2(hv.D)} \\times ${f2(c.R.gsub)}}{${f3(hv.ha)} \\times 9.81} = ${f2(hv.FS)}`}</Tex>
          <Result>{`Seepage ≈ **${sci(q, 2)} m³/s per m**, i.e. ≈ **${f0(q * T6M)} m³ per metre** in 6 months; FS against heave ≈ **${f2(hv.FS)}** — safe.`}</Result>
        </Sol>
      )
    },
    notes: ["Craig's Example 2.1 geometry with the penetration cut from 6 m to 5 m (the \"5\" looks hand-altered).", 'Handnote: Nf/Nd ≈ 0.44 (4 channels, 9 drops), ≈ 694 m³ per m in 6 months, ha ≈ 1.31 m, FS ≈ 4.5. 6 months = 182.5 days.'],
  },
  {
    id: 'sm-2010-11-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10.67,
    topics: ['sm-stress'],
    title: 'Contact pressure: meaning, factors, diagrams for flexible and rigid footings',
    text: 'What do you understand by contact pressure? What are the factors that affect the contact pressure distribution? Draw the contact pressure distribution diagrams for flexible and rigid footings.',
    pages: [17],
    theory: true,
    solution: () => <Model item={thx('sm-stress', 't-contact')} />,
    notes: ['"foilings" (sic) for footings.'],
  },
  {
    id: 'sm-2010-11-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 18,
    topics: ['sm-stress'],
    title: '2 m × 4 m area, 8 t/m²: σz 5 m below the centre and below a corner',
    text: 'A rectangular area 2 m × 4 m carries a uniform pressure of 8 ton/m² at the ground surface. Find the vertical stress at 5 m below the centre and the corner of the loaded area.',
    pages: [17],
    given: [],
    figure: () => (
      <div className="max-w-[320px] mx-auto">
        <PlanFig rects={[{ x1: 0, y1: 0, x2: 4, y2: 2 }]} P={[2, 1]} hatch={[{ x1: 2, y1: 1, x2: 4, y2: 2 }]} dims={[{ a: [0, 2], b: [4, 2], text: '4 m' }, { a: [0, 0], b: [0, 2], text: '2 m' }]} label="centre" />
      </div>
    ),
    checks: () => {
      const r = r8b()
      return [
        { key: 'Ic', label: 'I for a 1 m × 2 m quarter (m = 0.2, n = 0.4)', value: r.Ic, tol: 0.03 },
        { key: 'sc', label: 'σz 5 m below the centre', value: r.sc, unit: 't/m²' },
        { key: 'Ik', label: 'I for the whole area at a corner (m = 0.4, n = 0.8)', value: r.Ik, tol: 0.02 },
        { key: 'sk', label: 'σz 5 m below a corner', value: r.sk, unit: 't/m²' },
      ]
    },
    solution: () => {
      const r = r8b()
      return (
        <Sol>
          <Md>{`Corner formula $\\sigma_z = qI(m, n)$, $m = B/z$, $n = L/z$ (Fadum / Newmark). Units stay in t/m².`}</Md>
          <Md>{`**Below the centre:** four 1 m × 2 m rectangles meet at the centre (one outlined): $m = 1/5 = 0.2$, $n = 2/5 = 0.4$, $I = ${f4(r.Ic)}$.`}</Md>
          <Tex block>{`\\sigma_z = 4qI = 4 \\times 8 \\times ${f4(r.Ic)} = ${f3(r.sc)}\\ \\text{t/m}^2`}</Tex>
          <Md>{`**Below a corner:** the whole 2 m × 4 m area, $m = 2/5 = 0.4$, $n = 4/5 = 0.8$, $I = ${f4(r.Ik)}$.`}</Md>
          <Tex block>{`\\sigma_z = qI = 8 \\times ${f4(r.Ik)} = ${f3(r.sk)}\\ \\text{t/m}^2`}</Tex>
          <Tbl head={['point', 'm', 'n', 'I', 'σz (t/m²)', 'σz (kPa)']} rows={[['centre (×4)', '0.2', '0.4', f4(r.Ic), f3(r.sc), f2(r.sc * 9.81)], ['corner', '0.4', '0.8', f4(r.Ik), f3(r.sk), f2(r.sk * 9.81)]]} />
          <Result>{`σz ≈ **${f2(r.sc)} t/m²** below the centre and **${f2(r.sk)} t/m²** below a corner (at 5 m the load has spread so far that the two differ little).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2010-11-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 18,
    topics: ['sm-consol'],
    title: 'NC organic clay: primary + secondary settlement 5 years after primary (US units)',
    text: 'For a normally consolidated clay layer with organic content in the field, the following data are given: thickness of clay layer = 8.5 ft, initial void ratio = 0.80, compression index = 0.28, effective overburden pressure at the mid-depth of the clay layer = 2650 lb/ft², increase in effective pressure at mid-depth of the clay layer due to superimposed load = 970 lb/ft², secondary compression index = 0.02. What is the total settlement of the clay layer five years after the completion of the primary consolidation settlement? Given, time for completion of primary settlement = 1.5 years.',
    pages: [18],
    given: [],
    checks: () => {
      const r = r8c()
      return [
        { key: 'Sp', label: 'Primary settlement', value: r.Sp * 12, unit: 'in' },
        { key: 'ep', label: '$e_p$ at the end of primary', value: r.ep },
        { key: 'Cap', label: "$C'_\\alpha = C_\\alpha/(1 + e_p)$", value: r.Cap, tol: 0.01 },
        { key: 'Ss', label: 'Secondary settlement (1.5 → 6.5 yr)', value: r.Ss * 12, unit: 'in' },
        { key: 'St', label: 'Total settlement', value: r.St * 12, unit: 'in' },
      ]
    },
    solution: () => {
      const r = r8c()
      return (
        <Sol>
          <Tex block>{`S_p = \\frac{C_cH}{1 + e_0}\\log\\frac{p'_0 + \\Delta p}{p'_0} = \\frac{0.28 \\times 8.5}{1.80}\\log\\frac{3620}{2650} = ${f3((0.28 * 8.5) / 1.8)} \\times ${f4(r.lgr)} = ${f4(r.Sp)}\\ \\text{ft} = ${f2(r.Sp * 12)}\\ \\text{in}`}</Tex>
          <Tex block>{`\\Delta e = C_c\\log\\frac{3620}{2650} = ${f4(r.de)},\\quad e_p = 0.80 - ${f4(r.de)} = ${f3(r.ep)},\\quad C'_\\alpha = \\frac{0.02}{1 + ${f3(r.ep)}} = ${f4(r.Cap)}`}</Tex>
          <Md>{`Secondary compression runs from the end of primary, $t_1 = 1.5$ yr, to $t_2 = 1.5 + 5 = 6.5$ yr:`}</Md>
          <Tex block>{`S_s = C'_\\alpha H\\log\\frac{t_2}{t_1} = ${f4(r.Cap)} \\times 8.5 \\times \\log\\frac{6.5}{1.5} = ${f4(r.Ss)}\\ \\text{ft} = ${f2(r.Ss * 12)}\\ \\text{in}`}</Tex>
          <Result>{`Total settlement = ${f2(r.Sp * 12)} + ${f2(r.Ss * 12)} = **${f2(r.St * 12)} in** (${f3(r.St)} ft ≈ ${f0(r.St * 304.8)} mm).`}</Result>
        </Sol>
      )
    },
  },
]
