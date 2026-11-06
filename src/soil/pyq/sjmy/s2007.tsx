// CE 341 term final 2007-08 — SJMY sir’s half (compaction, permeability, seepage, consolidation + W–V in that section), solved by the engines.
// Section B (Q5–Q8, any THREE), held 19 Jan 2009 ("Geotechnical Engineering-I"), PDF pp. 3–4 (Fig. 1 dam with flow net p. 4).
// Section A's Q2(a) (Newmark chart construction) is in the AJK file.
import { Md, Tex } from '../../../components/ui'
import { fillFromBorrow } from '../../engine/compaction'
import { relDensity } from '../../engine/phase'
import { icrFromGsE } from '../../engine/stresses'
import { GW } from '../../engine/units'
import type { SmQ } from '../../types'
import { big, CkSolution, ckSolve, f0, f2, f3, Frm, Head, Model, NetFig, netPoint, oldNet, Result, sci, sciTex, Sol, th } from './old-kit'

const P = '2007-08' as const

// ---------------------------------------------------------------- Q5(b) borrow volume by void ratios
const r5b = () => {
  const Vs = 330000 / (1 + 1.2)
  return { Vs, Vf: fillFromBorrow(330000, 1.2, 0.7), M: Vs * 2.7 }
}

// ---------------------------------------------------------------- Q5(c) relative density
const r5c = () => relDensity({ gdMin: 13.34, gdMax: 21.4, n: 0.3, Gs: 2.67 })

// ---------------------------------------------------------------- Q8(c) dam with an upstream sheet pile (tip ≈ 6.5 m below GL by scale)
const net8 = () => oldNet('0708', { cutU: 4.5 })
const A8 = { x: 6.5, z: 9.9 }
const B8 = { x: 26, z: 7 }
const r8 = () => {
  const c = net8()
  const q = c.st.k * c.sol.H * c.sol.shape
  const a = netPoint(c, A8.x, A8.z)
  const b = netPoint(c, B8.x, B8.z)
  return { c, q, Q: q * 365 * 86400, a, b, ps: b.excess * GW, fs: c.R.icr / c.R.ie }
}

export const B2007: SmQ[] = [
  {
    id: 'sm-2007-08-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 16.67,
    topics: ['sm-wv'],
    title: 'Define S, γd and percentage voids; establish Se = wGs',
    text: 'Define the terms degree of saturation, dry unit weight and percentage voids. Establish the relationship between void ratio, water content, degree of saturation and the specific gravity of soil.',
    pages: [3],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-se')} />,
  },
  {
    id: 'sm-2007-08-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 15,
    topics: ['sm-comp', 'sm-wv'],
    title: '3.3 lakh m³ dug at e = 1.20: fill volume at e = 0.70 and mass removed',
    text: '3.3 lakh cubic metre of soil is removed from a borrow site. This dry soil has an in-situ void ratio of 1.20. How many cubic metre of fill having a void ratio of 0.7 could be constructed from this? What will be the mass of the soil removed? Given $G_s$ = 2.70.',
    pages: [3],
    given: [],
    checks: () => {
      const r = r5b()
      return [
        { key: 'Vs', label: 'Volume of solids', value: r.Vs, unit: 'm³' },
        { key: 'Vf', label: 'Volume of fill (e = 0.70)', value: r.Vf, unit: 'm³' },
        { key: 'M', label: 'Mass of soil removed (dry)', value: r.M, unit: 't' },
      ]
    },
    solution: () => {
      const r = r5b()
      return (
        <Sol>
          <Md>{`The solids are the same before and after; only the voids change. With $V_s = 1$, $V = 1 + e$, so $V_s = V/(1 + e)$.`}</Md>
          <Tex block>{`V_s = \\frac{330{,}000}{1 + 1.20} = ${big(r.Vs)}\\ \\text{m}^3,\\qquad V_{fill} = V_s(1 + 0.70) = ${big(r.Vs)} \\times 1.70 = ${big(r.Vf)}\\ \\text{m}^3`}</Tex>
          <Tex block>{`M = V_sG_s\\rho_w = ${big(r.Vs)} \\times 2.70 \\times 1\\ \\text{t/m}^3 = ${big(r.M)}\\ \\text{t}`}</Tex>
          <Result>{`Fill that can be built ≈ **${big(r.Vf)} m³**; mass of the (dry) soil removed ≈ **${big(r.M)} t** (${sci(r.M * 1000, 3)} kg).`}</Result>
        </Sol>
      )
    },
    notes: ['1 lakh = 10⁵, so 3.3 lakh m³ = 330,000 m³. "This dry soil": no water mass is added.'],
  },
  {
    id: 'sm-2007-08-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 15,
    topics: ['sm-wv'],
    title: 'Relative density from γd,min 13.34, γd,max 21.40 and n = 30 %; comment',
    text: 'The dry unit weights of a sand in the loosest and densest states are 13.34 kN/m³ and 21.40 kN/m³ respectively. Determine the relative density of the same sand with porosity of 30%. Comment on the result. Assume $G_s$ = 2.67.',
    pages: [3],
    given: [{ label: 'Dr classes', what: 'Das Table 3.3', ref: 'c-dr' }],
    checks: () => {
      const r = r5c()
      return [
        { key: 'emax', label: '$e_{max}$', value: r.emax },
        { key: 'emin', label: '$e_{min}$', value: r.emin },
        { key: 'e', label: '$e$ at n = 30 %', value: r.e },
        { key: 'Dr', label: 'Relative density', value: r.pct, unit: '%' },
      ]
    },
    solution: () => {
      const r = r5c()
      return (
        <Sol>
          <Tex block>{`e = \\frac{G_s\\gamma_w}{\\gamma_d} - 1:\\quad e_{max} = \\frac{2.67 \\times 9.81}{13.34} - 1 = ${f3(r.emax)},\\quad e_{min} = \\frac{2.67 \\times 9.81}{21.40} - 1 = ${f3(r.emin)}`}</Tex>
          <Tex block>{`e = \\frac{n}{1 - n} = \\frac{0.30}{0.70} = ${f3(r.e)},\\qquad D_r = \\frac{e_{max} - e}{e_{max} - e_{min}} = \\frac{${f3(r.emax)} - ${f3(r.e)}}{${f3(r.emax)} - ${f3(r.emin)}} = ${f2(r.pct)}\\ \\%`}</Tex>
          <Result>{`Dr ≈ **${f2(r.pct)} %** → **${r.cls.toLowerCase()}** (65–85 %). Comment: a dense sand — good bearing capacity, small settlement and low liquefaction potential. γd,max = 21.4 kN/m³ (emin = ${f3(r.emin)}) is unusually high for a natural sand, which suggests a very well-graded material.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2007-08-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 10.67,
    topics: ['sm-comp'],
    title: 'Why a laboratory compaction test; OMC and how it is found',
    text: 'Why is the compaction test done in the laboratory? Explain the term OMC and how it is determined in the laboratory.',
    pages: [3],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-why-lab')} />,
  },
  {
    id: 'sm-2007-08-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 12,
    topics: ['sm-consol'],
    title: 'Using consolidation-test results for the magnitude and rate of settlement',
    text: 'Explain how the results of a consolidation test can be used to predict the magnitude of settlement and also the settlement rate of a structure caused by the consolidation of clay soil below the foundation.',
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-test')} />,
  },
  {
    id: 'sm-2007-08-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 24,
    topics: ['sm-consol', 'sm-perm'],
    title: 'Cc 0.27, e 2.04, k 3.5 × 10⁻⁸ cm/s: Δe, settlement of 5 m, t50 one-way',
    text: 'A saturated soil has a compression index of 0.27. Its void ratio at a stress of 125 kN/m² is 2.04 and its permeability is 3.5 × 10⁻⁸ cm/sec. Compute: (i) the change in void ratio if the stress is increased to 187.5 kN/m²; (ii) the settlement in (i) if the clay stratum is 5 m thick; and (iii) time required for 50% consolidation to occur if one way drainage is allowed.',
    pages: [4],
    given: [],
    checks: () => {
      const r = ckSolve()
      return [
        { key: 'de', label: '(i) Δe', value: r.de },
        { key: 'S', label: '(ii) Settlement', value: r.S * 1000, unit: 'mm' },
        { key: 'cv', label: '$c_v$', value: r.cv * 1e7, unit: '× 10⁻⁷ m²/s' },
        { key: 't1', label: '(iii) t50, one-way drainage', value: r.t1 / 86400, unit: 'days' },
      ]
    },
    solution: () => <CkSolution />,
    notes: ['Repeated as 2009-10 Q7(c) (with a both-way follow-up).', 'Tv = 0.197 for 50 % (table).'],
  },
  {
    id: 'sm-2007-08-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 12.67,
    topics: ['sm-seep'],
    title: 'Flow net: what, its uses; why equal seepage between successive flow lines',
    text: 'What is a flow net and what are its uses in civil engineering practice? Why is the quantity of seepage between two successive flow lines equal?',
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-equal-q')} />,
  },
  {
    id: 'sm-2007-08-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 12,
    topics: ['sm-seep'],
    title: 'Mechanics of piping; ways to raise the factor of safety',
    text: 'Explain the mechanics of piping in hydraulic structures. What methods can be used to increase the factor of safety against piping?',
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-piping')} />,
  },
  {
    id: 'sm-2007-08-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 12,
    topics: ['sm-seep'],
    title: 'Critical hydraulic gradient for e = 0.80, Gs = 2.68',
    text: 'A coarse grained soil has a void ratio of 0.80 and specific gravity of solids as 2.68. Calculate the critical gradient at which piping will occur.',
    pages: [4],
    given: [],
    checks: () => [{ key: 'icr', label: 'Critical hydraulic gradient', value: icrFromGsE(2.68, 0.8) }],
    solution: () => (
      <Sol>
        <Md>{`Piping (boiling) starts when the upward seepage force equals the submerged weight, $i\\gamma_w = \\gamma'$:`}</Md>
        <Tex block>{`i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1 + e} = \\frac{2.68 - 1}{1 + 0.80} = ${f3(icrFromGsE(2.68, 0.8))}`}</Tex>
        <Result>{`Critical gradient ≈ **${f2(icrFromGsE(2.68, 0.8))}** (close to 1, as for most soils).`}</Result>
      </Sol>
    ),
  },
  {
    id: 'sm-2007-08-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 10,
    topics: ['sm-perm'],
    title: 'Short note: capillary rise in soils',
    text: 'Write a short note on capillary rise in soils.',
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-capillary')} />,
  },
  {
    id: 'sm-2007-08-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 12.67,
    topics: ['sm-seep'],
    title: 'Seepage pressure; how it raises or lowers effective stress',
    text: "Define the term 'seepage pressure'. Show how it increases or decreases the magnitude of effective stress.",
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-seep-pressure')} />,
  },
  {
    id: 'sm-2007-08-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Short note: sand drains',
    text: "Write a short note on 'Sand Drains'.",
    pages: [4],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-drains')} />,
  },
  {
    id: 'sm-2007-08-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 24,
    topics: ['sm-seep'],
    title: 'Dam with an upstream sheet pile (Fig. 1 net): seepage in a year, u at A, σ′ and seepage pressure at B, FS against piping',
    text: "For the problem described in Fig. 1, calculate: (i) seepage loss in one year, given k = 10⁻⁴ cm/sec; (ii) pore water pressure at 'A'; (iii) effective pressure and seepage pressure at 'B', given $\\gamma_{sat}$ = 21.0 kN/m³; (iv) factor of safety against piping.\n\n(Fig. 1: concrete dam, base 20 m set 2 m below the ground, with a sheet pile at the heel; upstream water 10 m above the ground, downstream water at the ground; permeable layer 12 m deep; A just under the base about 6.5 m from the heel; B 5 m below the downstream ground, about 6 m beyond the toe; the flow net is drawn.)",
    pages: [4],
    given: [],
    figure: () => (
      <NetFig
        c={net8()}
        Nf={3}
        marks={[
          { ...A8, label: 'A' },
          { ...B8, label: 'B' },
        ]}
      />
    ),
    checks: () => {
      const r = r8()
      return [
        { key: 'r', label: '$N_f/N_d$', value: r.c.sol.shape, tol: 0.08 },
        { key: 'Q', label: '(i) Seepage loss in one year', value: r.Q, unit: 'm³ per m', tol: 0.08 },
        { key: 'uA', label: '(ii) Pore water pressure at A', value: r.a.u, unit: 'kPa', tol: 0.05 },
        { key: 'ps', label: '(iii) Seepage pressure at B', value: r.ps, unit: 'kPa', tol: 0.12 },
        { key: 'sB', label: '(iii) Effective pressure at B', value: r.b.sigmaEff, unit: 'kPa', tol: 0.04 },
        { key: 'icr', label: '$i_{cr}$', value: r.c.R.icr },
        { key: 'ie', label: '(iv) Exit gradient (last field at the toe)', value: r.c.R.ie, tol: 0.15 },
        { key: 'fs', label: '(iv) FS against piping', value: r.fs, tol: 0.15 },
      ]
    },
    solution: () => {
      const r = r8()
      const c = r.c
      return (
        <Sol>
          <Md>{`H = 10 m (tail water at ground level); datum for "excess head" = the downstream water level. The printed net has about 3 flow channels; the solver's square net for the same section gives $N_f/N_d = ${f3(c.sol.shape)}$, i.e. ${f2(c.R.Nd)} drops for 3 channels, $\\Delta h = ${f3(c.R.dh)}$ m.`}</Md>
          <Frm>
            <NetFig
              c={c}
              Nf={3}
              exit
              marks={[
                { ...A8, label: 'A' },
                { ...B8, label: 'B' },
              ]}
            />
          </Frm>
          <Head>(i) Seepage in one year</Head>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 10^{-6} \\times 10 \\times ${f3(c.sol.shape)} = ${sciTex(r.q, 3)}\\ \\text{m}^3/\\text{s per m};\\quad Q = q \\times 365 \\times 86400 = ${f0(r.Q)}\\ \\text{m}^3\\ \\text{per m}`}</Tex>
          <Head>(ii) Pore pressure at A (just under the base, 2 m below the upstream ground)</Head>
          <Md>{`About ${f2(r.a.drops)} drops are used before A, so the head left above tail water is $h_A = 10 - ${f2(r.a.drops)} \\times ${f3(c.R.dh)} = ${f3(r.a.excess)}$ m. A (just below the base) is ${f2(12 - A8.z)} m below the downstream water level (the ground):`}</Md>
          <Tex block>{`u_A = (h_A + ${f2(12 - A8.z)})\\gamma_w = (${f3(r.a.excess)} + ${f2(12 - A8.z)}) \\times 9.81 = ${f2(r.a.u)}\\ \\text{kPa}`}</Tex>
          <Head>(iii) Point B (5 m below the downstream ground)</Head>
          <Tex block>{`\\text{seepage pressure} = h_B\\gamma_w = ${f3(r.b.excess)} \\times 9.81 = ${f2(r.ps)}\\ \\text{kPa (upward)}`}</Tex>
          <Tex block>{`\\sigma'_B = z\\gamma' - h_B\\gamma_w = 5(21.0 - 9.81) - ${f2(r.ps)} = ${f2(r.b.sigmaEff)}\\ \\text{kPa}`}</Tex>
          <Head>(iv) Piping</Head>
          <Tex block>{`i_{cr} = \\frac{21.0 - 9.81}{9.81} = ${f3(c.R.icr)},\\quad i_e = \\frac{\\Delta h}{l} = \\frac{${f3(c.R.dh)}}{${f2(c.R.exitL)}} = ${f3(c.R.ie)},\\quad FS = \\frac{${f3(c.R.icr)}}{${f3(c.R.ie)}} = ${f2(r.fs)}`}</Tex>
          <Result>{`(i) ≈ **${f0(r.Q)} m³** per metre per year; (ii) uA ≈ **${f2(r.a.u)} kPa**; (iii) at B seepage pressure ≈ **${f2(r.ps)} kPa**, σ′ ≈ **${f2(r.b.sigmaEff)} kPa**; (iv) FS against piping ≈ **${f2(r.fs)}** (the exit gradient is taken in the last field along the embedded toe).`}</Result>
        </Sol>
      )
    },
    notes: [
      'The scanned net is too coarse to count exactly: the section is redrawn from the dimensions (base 20 m, 2 m embedment, 12 m permeable layer, H = 10 m) with the sheet-pile tip ≈ 6.5 m below the ground by scale, A ≈ 6.5 m from the heel and B ≈ 6 m beyond the toe, and the net is solved. Answers shift a little with a hand-counted net.',
      'Handnote (pile tip ≈ 7 m, A ≈ 6 m, B ≈ 4.5 m): Nf/Nd ≈ 0.25, ≈ 79 m³ per m per year, uA ≈ 68 kPa, seepage pressure at B ≈ 7.6 kPa, σ′B ≈ 48 kPa, FS ≈ 3.0. "ore year" (sic) for one year.',
    ],
  },
]
