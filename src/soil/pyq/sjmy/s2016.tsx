// CE 341 term final 2016-17 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section A (Q1–Q4), held 15 Jul 2017, PDF pp. 34–35 (+ Fig. 1 on p. 38).
import { Md, Tex } from '../../../components/ui'
import { relDensity } from '../../engine/phase'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import type { SmQ } from '../../types'
import { circleCase, CircleCaseSolution, f2, f3, Frm, Head, Model, Models, netOf, netPoint, NetFig, Result, sciTex, Sol, SoilColumn, th, type CircleCase } from './kit'

const P = '2016-17' as const

// ---------------------------------------------------------------- Q1(a)(iii) density index
const r1 = () => relDensity({ n: 0.5, gdMin: 1.2, gdMax: 2.0, Gs: 2.74, gw: 1 })

// ---------------------------------------------------------------- Q1(b) trucks
const EW1 = EW_PRESETS[2].ew

// ---------------------------------------------------------------- Q2(b) rigid circular block (twin of 2017-18 Q6(a))
const C2: CircleCase = { D: 6, q: 200, Hs: 5, wt: 1.5, gs: 19.2, gsSat: 20.8, Hc: 1.6, gc: 19.9, hLab: 20, t90: 106 }

// ---------------------------------------------------------------- Q3(b) sheet pile, 18 m layer
const net3 = () => netOf('1617')
const k3 = 5e-9 // 5 × 10⁻⁷ cm/s
const PP = { x: -4.3, z: 18 - 8 },
  PQ = { x: 8, z: 18 - 10 }
const r3 = () => {
  const c = net3()
  const q = k3 * c.sol.H * c.sol.shape
  return { c, q, month: q * 30 * 86400, p: netPoint(c, PP.x, PP.z), qq: netPoint(c, PQ.x, PQ.z) }
}

export const B2016: SmQ[] = [
  {
    id: 'sm-2016-17-1ai',
    paper: P,
    sec: 'A',
    no: '1(a)(i)',
    marks: 10,
    topics: ['sm-wv'],
    title: 'Block diagram: what and why; derive Se = wGs',
    text: 'What is block diagram and what are its uses? Using block diagram, establish the relationship among degree of saturation, void ratio, moisture content and specific gravity of soil skeleton.',
    pages: [34],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Block diagram and its uses', item: th('sm-wv', 't-block') },
          { title: 'Se = wGs', item: th('sm-wv', 't-se') },
        ]}
      />
    ),
    notes: ['Printed (10+10+10 = 30) for (a)(i)–(iii).'],
  },
  {
    id: 'sm-2016-17-1aii',
    paper: P,
    sec: 'A',
    no: '1(a)(ii)',
    marks: 10,
    topics: ['sm-comp'],
    title: 'Why lab compaction tests; percent compaction and its use',
    text: 'Why compaction tests are done in the laboratory? What is percent compaction and what is its use?',
    pages: [34],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-why-lab')} />,
  },
  {
    id: 'sm-2016-17-1aiii',
    paper: P,
    sec: 'A',
    no: '1(a)(iii)',
    marks: 10,
    topics: ['sm-wv'],
    title: 'Density index of a sand with n = 50 % (ρd 1.20–2.00 t/m³)',
    text: 'The in-situ porosity of a sand deposit is fifty percent. If the maximum and minimum dry densities of sand as determined from the laboratory test are 2.00 ton/m³ and 1.20 ton/m³ respectively, determine the density index. Assume $G_s$ = 2.74. Indicate the state of compaction of sand deposit.',
    pages: [34],
    given: [],
    checks: () => {
      const r = r1()
      return [
        { key: 'e', label: 'In-situ void ratio', value: r.e },
        { key: 'emax', label: '$e_{max}$', value: r.emax },
        { key: 'emin', label: '$e_{min}$', value: r.emin },
        { key: 'Id', label: 'Density index', value: r.pct, unit: '%' },
      ]
    },
    solution: () => {
      const r = r1()
      return (
        <Sol>
          <Md>{`Work in t/m³ ($\\rho_w$ = 1).`}</Md>
          <Tex block>{`e = \\frac{n}{1 - n} = \\frac{0.5}{0.5} = ${f3(r.e)},\\quad e_{max} = \\frac{G_s\\rho_w}{\\rho_{d,min}} - 1 = \\frac{2.74}{1.20} - 1 = ${f3(r.emax)},\\quad e_{min} = \\frac{2.74}{2.00} - 1 = ${f3(r.emin)}`}</Tex>
          <Tex block>{`I_D = \\frac{e_{max} - e}{e_{max} - e_{min}} = \\frac{${f3(r.emax)} - ${f3(r.e)}}{${f3(r.emax)} - ${f3(r.emin)}} = ${f2(r.pct)}\\ \\%`}</Tex>
          <Result>{`Density index ≈ **${f2(r.pct)} %** → the deposit is **${r.cls.toLowerCase()}** (15–35 % on the Das scale).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 16.67,
    topics: ['sm-comp'],
    title: 'Truck loads (6 m³) and borrow-pit volume for 100 m³ of compacted fill',
    text: 'For constructing an embankment, the soil is transported from a borrow area using truck which can carry 6 m³ of soil at a time with the following details. Determine the number of truck loads of soil required to obtained 100 m³ of compacted earth fill and the volume of borrow pit.\n\n| Property | Borrow area (in-situ) | Truck (loose) | Field (compacted) |\n|---|---|---|---|\n| Unit weight (kN/m³) | 16.6 | 11.5 | 18.2 |\n| Water content (%) | 8 | 6 | 14 |',
    pages: [34],
    given: [],
    checks: () => {
      const r = runEarthwork(EW1).res[0].p
      return [
        { key: 'Ws', label: 'Dry weight of solids in the fill', value: r.Ws, unit: 'kN' },
        { key: 'Vl', label: 'Loose (truck) volume', value: r.Vloose, unit: 'm³' },
        { key: 'n', label: 'Truck loads', value: r.trucks, tol: 0 },
        { key: 'Vb', label: 'Volume of the borrow pit', value: r.Vbank, unit: 'm³' },
      ]
    },
    solution: () => {
      const r = runEarthwork(EW1).res[0].p
      return (
        <Sol>
          <Md>{`Dry weight (solids) is the same in all three states; $\\gamma_d = \\gamma/(1 + w)$ in each.`}</Md>
          <EarthworkSolution ew={EW1} />
          <Result>{`$W_s$ = ${f2(r.Ws)} kN → loose volume ${f2(r.Vloose)} m³ → ${f2(r.Vloose / 6)} loads, i.e. **${r.trucks} truck loads**; borrow pit ≈ **${f2(r.Vbank)} m³**.`}</Result>
        </Sol>
      )
    },
    notes: ['"obtained" is sic (obtain). The water contents fix γd in each state; water to be added on site is a separate question.'],
  },
  {
    id: 'sm-2016-17-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 20,
    topics: ['sm-consol'],
    title: 'Short notes: mv, Cc, cv, Cs',
    text: 'Write short notes on coefficient of volume compressibility, compression index coefficient of consolidation and swell index.',
    pages: [34],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-cv')} />,
  },
  {
    id: 'sm-2016-17-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 26.67,
    topics: ['sm-consol', 'sm-stress'],
    title: 'Rigid 6 m circular block on 5 m sand over 1.6 m clay: S, t90, and with sand below',
    text: 'A circular rigid foundation block with 6.0 m diameter rests on a bed of compact sand of 5.0 m deep. It is subjected to a uniform pressure of 200 kN/m². Below the sand there is 1.6 m of clay overlying impervious rock. Ground water level (G.W.L) is 1.5 m below the surface of the sand. The unit weights of the sand above and below the G.W.L. are 19.2 kN/m³ and 20.8 kN/m³ respectively. The unit weight of clay is given as 19.9 kN/m³. Draw a schematic diagram of the described problem.\n\nA laboratory consolidation test performed on an undisturbed specimen of the clay of 20 mm thickness drained at the top and bottom gave the following results:\n\n| Pressure (kN/m²) | 50 | 100 | 200 | 300 | 400 |\n|---|---|---|---|---|---|\n| Void ratio | 0.730 | 0.680 | 0.625 | 0.580 | 0.540 |\n\n(i) Estimate the settlement of the foundation, assuming that load spread may be taken as 1 horizontal to 2 vertical.\n(ii) If the consolidation test, specimen reached 90% consolidation in 1 hour 46 minutes, how long it take for the foundation to reach 90% of its final settlement?\n(iii) What would be the magnitude of settlement, if there exists a sand layer instead of impervious rock at the bottom of clay layer?',
    pages: [34, 35],
    given: [],
    checks: () => {
      const r = circleCase(C2)
      return [
        { key: 'dp', label: 'Δp at mid-clay', value: r.dp, unit: 'kPa' },
        { key: 'p0', label: "$p'_0$ at mid-clay", value: r.p0, unit: 'kPa' },
        { key: 'S', label: '(i) Settlement', value: r.S * 1000, unit: 'mm', tol: 0.03 },
        { key: 't', label: '(ii) Time for 90 % (single drainage)', value: r.t90one, unit: 'years' },
        { key: 't2', label: '(iii) Time for 90 % with sand below', value: r.t90two, unit: 'years' },
      ]
    },
    solution: () => {
      const r = circleCase(C2)
      return (
        <Sol>
          <Frm>
            <SoilColumn
              layers={[
                { H: 5, name: 'Compact sand', kind: 'sand', props: ['19.2 kN/m³ above WT', '20.8 kN/m³ below WT'] },
                { H: 1.6, name: 'Clay', kind: 'clay', props: ['19.9 kN/m³'] },
                { H: 0.8, name: 'Impervious rock', kind: 'rock' },
              ]}
              wt={1.5}
              footing={{ Df: 0, B: 6, label: 'Ø 6 m, 200 kN/m²' }}
              marks={[{ z: 5.8, label: 'mid-clay' }]}
            />
          </Frm>
          <CircleCaseSolution c={C2} />
          <Head>(iii) Sand instead of rock below the clay</Head>
          <Md>{`The **magnitude** of consolidation settlement depends only on Δe (stresses and compressibility), not on the drainage: S stays ≈ **${f2(r.S * 1000)} mm**. Only the **rate** changes: double drainage, $d = 0.8$ m, so $t_{90} = ${f2(r.t90one)}/4 = ${f2(r.t90two)}$ years.`}</Md>
          <Result>{`(i) S ≈ **${f2(r.S * 1000)} mm**; (ii) t90 ≈ **${f2(r.t90one)} years** (106 min × 160²); (iii) settlement unchanged (≈ ${f2(r.S * 1000)} mm), reached 4 times faster (t90 ≈ ${f2(r.t90two)} years).`}</Result>
        </Sol>
      )
    },
    notes: ['Twin of 2017-18 Q6(a) (5.5 m sand, 270 kPa, 2 h).'],
  },
  {
    id: 'sm-2016-17-3ai',
    paper: P,
    sec: 'A',
    no: '3(a)(i)',
    marks: 10,
    topics: ['sm-seep', 'sm-perm'],
    title: 'Effective stress principle; k of clay; seepage pressure',
    text: 'What is the principle of effective stress? How can you estimate the coefficient of permeability of clayey soil? Define seepage pressure.',
    pages: [35],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Principle of effective stress', item: th('sm-seep', 't-eff-principle') },
          { title: 'k of a clayey soil', item: th('sm-perm', 't-k-clay') },
          { title: 'Seepage pressure', item: th('sm-seep', 't-seep-pressure'), noFig: true },
        ]}
      />
    ),
    notes: ['Printed (10+10 = 20) for (a)(i)–(ii).'],
  },
  {
    id: 'sm-2016-17-3aii',
    paper: P,
    sec: 'A',
    no: '3(a)(ii)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Derive the Laplace equation for 2-D flow; its interpretations',
    text: 'Derive the Laplace equation of continuity for two dimension flow problems in fully saturated soil. Write down the graphical and mathematical interpretations of this equation.',
    pages: [35],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-laplace')} />,
  },
  {
    id: 'sm-2016-17-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 26.67,
    topics: ['sm-seep'],
    title: 'Sheet pile 8 m into an 18 m layer: monthly seepage, pressures at P and Q, heave FS',
    text: 'A soil stratum with permeability, k = 5 × 10⁻⁷ cm/sec overlies an impermeable stratum. The impermeable stratum lies at a depth of 18 m below the ground surface (surface of the soil stratum). A sheet pile wall penetrates 8 m into the permeable soil stratum. Water stands to a height of 9 m on the upstream side and 1.5 m on downstream side, above the surface of soil stratum. Saturated unit weight of soil is given as 20.4 kN/m³. For the aforementioned problem the flow net diagram is shown in Fig. 1. Determine,\n\n(i) Quantity of seepage loss in one month,\n(ii) Seepage pressure and pore water pressure at a point "P",\n(ii) Pore water pressure and effective stress at a point "Q", and\n(iv) Factor of safety against up heaving using Terzaghi\'s and Harza\'s criteria.\n\n(Fig. 1: P on the upstream side about 4.3 m from the pile at the pile-tip level; Q on the downstream side about 8 m from the pile, 10 m below the ground.)',
    pages: [35, 38],
    given: [],
    figure: () => <NetFig c={net3()} marks={[{ ...PP, label: 'P' }, { ...PQ, label: 'Q' }]} />,
    checks: () => {
      const r = r3()
      return [
        { key: 'm', label: '(i) Seepage in one month (30 days), per metre', value: r.month * 1000, unit: 'litres', tol: 0.08 },
        { key: 'sp', label: '(ii) Seepage pressure at P', value: r.p.excess * 9.81, unit: 'kPa', tol: 0.05 },
        { key: 'uP', label: '(ii) Pore pressure at P', value: r.p.u, unit: 'kPa', tol: 0.03 },
        { key: 'uQ', label: '(iii) Pore pressure at Q', value: r.qq.u, unit: 'kPa', tol: 0.03 },
        { key: 'eQ', label: "(iii) σ′ at Q", value: r.qq.sigmaEff, unit: 'kPa', tol: 0.04 },
        { key: 'ft', label: "(iv) FS against heave (Terzaghi)", value: r.c.R.heave!.FS, tol: 0.06 },
        { key: 'fh', label: "(iv) FS against piping (Harza)", value: r.c.R.icr / r.c.R.ie, tol: 0.12 },
      ]
    },
    solution: () => {
      const r = r3()
      const c = r.c
      const hv = c.R.heave!
      return (
        <Sol>
          <Md>{`$H = 9 - 1.5 = ${f2(c.sol.H)}$ m; $\\gamma' = 20.4 - 9.81 = ${f2(c.R.gsub)}$ kN/m³; $i_{cr} = ${f2(c.R.gsub)}/9.81 = ${f3(c.R.icr)}$. Fig. 1 is a sketch with about 4 channels; drawn to curvilinear squares (solver) 4 channels need $N_d = ${f2(c.R.Nd)}$ drops ($N_f/N_d = ${f3(c.sol.shape)}$), $\\Delta h = ${f3(c.R.dh)}$ m.`}</Md>
          <NetFig c={c} marks={[{ ...PP, label: 'P' }, { ...PQ, label: 'Q' }]} prism exit />
          <Head>(i) Seepage in one month</Head>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 5\\times10^{-9} \\times ${f2(c.sol.H)} \\times ${f3(c.sol.shape)} = ${sciTex(r.q, 3)}\\ \\text{m}^3\\text{/s per m};\\quad \\times 30 \\times 86400 = ${f3(r.month)}\\ \\text{m}^3 = ${f2(r.month * 1000)}\\ \\text{L per m}`}</Tex>
          <Head>(ii) Point P (upstream, 8 m deep)</Head>
          <Md>{`About ${f2(r.p.drops)} drops are used before P, so the head left above tail water is $h_P = ${f2(c.sol.H)} - ${f2(r.p.drops)} \\times ${f3(c.R.dh)} = ${f3(r.p.excess)}$ m.`}</Md>
          <Tex block>{`\\text{seepage pressure} = h_P\\gamma_w = ${f3(r.p.excess)} \\times 9.81 = ${f2(r.p.excess * 9.81)}\\ \\text{kPa};\\quad u_P = (1.5 + 8 + ${f3(r.p.excess)}) \\times 9.81 = ${f2(r.p.u)}\\ \\text{kPa}`}</Tex>
          <Head>(iii) Point Q (downstream, 10 m deep)</Head>
          <Tex block>{`h_Q = ${f3(r.qq.excess)}\\ \\text{m},\\quad u_Q = (1.5 + 10 + ${f3(r.qq.excess)}) \\times 9.81 = ${f2(r.qq.u)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\sigma_Q = 1.5(9.81) + 10(20.4) = ${f2(r.qq.sigma)}\\ \\text{kPa},\\quad \\sigma'_Q = ${f2(r.qq.sigma)} - ${f2(r.qq.u)} = ${f2(r.qq.sigmaEff)}\\ \\text{kPa}`}</Tex>
          <Head>(iv) Heave</Head>
          <Md>{`**Terzaghi:** prism 8 m deep × 4 m wide beside the pile; average excess head on its base (tip level) $h_a = ${f3(hv.ha)}$ m (≈ ${f2(hv.ha / c.sol.H)}H): $FS = D\\gamma'/(h_a\\gamma_w) = 8 \\times ${f2(c.R.gsub)}/(${f3(hv.ha)} \\times 9.81) = ${f2(hv.FS)}$.`}</Md>
          <Md>{`**Harza:** last field down the downstream face, $l = ${f2(c.R.exitL)}$ m, $i_e = ${f3(c.R.dh)}/${f2(c.R.exitL)} = ${f3(c.R.ie)}$; $FS = ${f3(c.R.icr)}/${f3(c.R.ie)} = ${f2(c.R.icr / c.R.ie)}$.`}</Md>
          <Result>{`(i) ≈ **${f3(r.month)} m³ per m** in a month; (ii) at P: seepage pressure ≈ **${f2(r.p.excess * 9.81)} kPa**, u ≈ **${f2(r.p.u)} kPa**; (iii) at Q: u ≈ **${f2(r.qq.u)} kPa**, σ′ ≈ **${f2(r.qq.sigmaEff)} kPa**; (iv) FS ≈ **${f2(hv.FS)}** (Terzaghi) and **${f2(c.R.icr / c.R.ie)}** (Harza): adequate (≥ 3).`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 1 is a hand sketch on graph paper (the 9 m water height is drawn at a larger scale); P and Q are scaled from the 8 m and 10 m dimensions: P ≈ 4.3 m upstream at the 8 m tip level, Q ≈ 8 m downstream at 10 m depth.', 'The printed "(ii)" twice is a misprint for (ii) and (iii).', 'Seepage pressure is taken as the excess head above tail water × γw (as in the handnote).'],
  },
  {
    id: 'sm-2016-17-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 26.67,
    topics: ['sm-consol'],
    title: "Derive Terzaghi's 1-D consolidation equation; assumptions and limitations",
    text: "Derive Terzaghi's 1-D consolidation equation. Clearly state the assumptions you made and their application in deriving 1-D consolidation equation. Also clearly state their limitations.",
    pages: [35],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-terzaghi')} />,
  },
  {
    id: 'sm-2016-17-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 20,
    topics: ['sm-consol'],
    title: "Degree of consolidation with sand drains by Barron's chart: steps",
    text: "Write down the step by step procedure to calculate degree of consolidation for sand drains using Barron's Chart.",
    pages: [35],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-drains')} />,
    notes: ["No chart is attached; the numerical version is 2012-13 Q11(c). SJMY's slide writes de = 0.525s / 0.564s — those are re = de/2 (de = 1.05s triangular, 1.128s square)."],
  },
]
