// CE 341 term final Jan 2021 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Session January 2021, Section B (Q5–Q8), PDF pp. 50–51; attached Chart 1 AASHTO, Chart 2 β vs OCR, Fig. 4 (p52).
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { solveWall, type Wall } from '../../engine/earth'
import { circle, failurePlane } from '../../engine/mohr'
import { coneLL, onePointCone } from '../../engine/plasticity'
import { phiFromCircle, skemptonNC } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import { FlowPlot } from '../../topics/plast/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, clayChecks, ClaySolution, CuOCSolution, cuOCChecks, dsChecks, DSSolution, f2, f3, Head, Model, Models, MohrPlot, NcCuCdSolution, nccucd, Result, Sol, Tbl, th, UscsSolved, wallChecks, WallQFig, WallSolved } from './kit'

const P = 'jan-2021' as const

const DS5 = [
  { N: 24, T: 159 },
  { N: 48, T: 253 },
  { N: 96, T: 444 },
]
const CONE6 = [
  { d: 16.1, w: 50.0 },
  { d: 17.8, w: 52.1 },
  { d: 19.3, w: 54.1 },
  { d: 21.6, w: 57.0 },
  { d: 22.6, w: 58.2 },
]
const A6b = { P200: 92, LL: 41, PI: 10 }
const SA = { F200: 95, LL: 53, PL: 32 }
const SB = { F200: 11, F4: 90, LL: 37, PL: 21, Cu: 1.8 / 0.07, Cc: (0.4 * 0.4) / (1.8 * 0.07) }
const W8: Wall = {
  layers: [
    { h: 2, gamma: 16, phi: 30, c: 0 },
    { h: 4, gamma: 20, gammaSat: 20, phi: 27, c: 25 },
  ],
  zw: 2,
  q: 0,
  state: 'passive',
}
const W8q: Wall = { ...W8, q: 10 }

export const AJAN21: SmQ[] = [
  {
    id: 'sm-jan-2021-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 22,
    topics: ['sm-shear'],
    title: 'CD direct shear (24, 48, 96 kg; 63.5 mm) → c′, φ′ and the Mohr–Coulomb equation',
    text: "The following results were obtained in a consolidated drained (CD) direct shear test carried out on a clay sample.\n\n- Specimen 1: normal load 24 kg, peak shear force 159 N\n- Specimen 2: normal load 48 kg, peak shear force 253 N\n- Specimen 3: normal load 96 kg, peak shear force 444 N\n\nDiameter and height of each specimen were 63.5 mm and 25 mm, respectively. Determine the values of effective shear strength parameters $c'$ and $\\varphi'$. Also write down the Mohr-Coulomb equation for the effective stress failure envelope.",
    pages: [50],
    given: [],
    checks: () => dsChecks(DS5, 63.5, 'kg'),
    solution: () => <DSSolution rows={DS5} dia={63.5} unit="kg" />,
    notes: ['The paper header prints "Full Marks: 180" although six questions of 46⅔ make 280.'],
  },
  {
    id: 'sm-jan-2021-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 11.67,
    topics: ['sm-shear'],
    title: 'Short note: field vane shear test',
    text: 'Write a short note on field vane shear test.',
    pages: [50],
    theory: true,
    flag: 'Vane shear — not in AJK sir’s slides this term.',
    solution: () => <Model item={th('sm-shear', 't-vane')} />,
  },
  {
    id: 'sm-jan-2021-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 13,
    topics: ['sm-shear'],
    title: 'cu of an OC clay at 8 m from PI and OCR (Skempton + β chart)',
    text: 'A clay sample (liquid limit = 58%, plastic limit = 27% and natural moisture content = 45%) was collected from a depth of 8 m below the existing ground level (EGL). Water table is at the existing ground level and saturated unit weight of the sample is 20 kN/m³. From a laboratory one-dimensional consolidation test, the preconsolidation pressure of the sample was found to be 326 kN/m². Estimate the value of undrained shear strength at that depth.',
    pages: [50, 52],
    given: [{ label: 'Chart 2', what: 'β vs overconsolidation ratio', ref: 's-beta' }],
    flag: 'cu correlations (Skempton, β chart) — not in AJK sir’s slides.',
    checks: () => cuOCChecks(8, 20, 326, skemptonNC(31)),
    solution: () => <CuOCSolution z={8} gsat={20} pc={326} LL={58} PL={27} ratio={skemptonNC(31)} ratioTex="0.11 + 0.0037\,PI = 0.11 + 0.0037(31)" />,
    notes: ['The β chart is the same as 2021-22 Chart 2; its reading at OCR = 4 is about 2.7 (2.3–3.2 between the limits).', 'w = 45 % is not needed.'],
  },
  {
    id: 'sm-jan-2021-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 16.67,
    topics: ['sm-plast'],
    title: 'Fall-cone LL from five readings + one-point check',
    text: 'A cone penetrometer test was performed on a silty clay sample in order to determine its liquid limit and the following results were obtained:\n\n- Cone penetration (mm): 16.1, 17.8, 19.3, 21.6, 22.6\n- Water content (%): 50.0, 52.1, 54.1, 57.0, 58.2\n\nDetermine the liquid limit of the soil and also check the result for a single point method using a relevant data.',
    pages: [50],
    given: [],
    checks: () => {
      const f = coneLL(CONE6)
      return [
        { key: 'LL', label: 'Liquid limit (w at 20 mm)', value: f.LL, unit: '%', tol: 0.015 },
        { key: 'one', label: 'One-point LL from the 19.3 mm reading', value: onePointCone(54.1, 19.3), unit: '%' },
      ]
    },
    solution: () => {
      const f = coneLL(CONE6)
      const ones = CONE6.map((x) => onePointCone(x.w, x.d))
      return (
        <Sol>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <FlowPlot mode="cone" pts={CONE6.map((x) => ({ x: x.d, w: x.w }))} a={f.a} b={f.b} LL={f.LL} />
          </div>
          <Md>{`Plot w against penetration (BS 80 g cone) and draw the best straight line: $w = ${f2(f.a)} + ${f3(f.b)}d$. **LL = w at 20 mm = ${f2(f.LL)} %** (interpolating between 19.3 and 21.6 mm: ${f2(f.interp)} %).`}</Md>
          <Head>Single-point check</Head>
          <Md>{`The relevant reading is the one nearest 20 mm (19.3 mm, w = 54.1 %). IS 2720-5: $w_L = \\dfrac{w_y}{0.77\\log_{10}y}$:`}</Md>
          <Tex block>{`w_L = \\frac{54.1}{0.77\\log 19.3} = ${f2(ones[2])}\\%`}</Tex>
          <Tbl head={['Reading (mm)', ...CONE6.map((x) => `${x.d}`)]} rows={[['One-point wL (%)', ...ones.map((v) => f2(v))]]} cap="All readings lie in the valid 14–28 mm range." />
          <Result>{`LL ≈ **${f2(f.LL)} %**; the single-point value ${f2(ones[2])} % agrees within ${f2(Math.abs(f.LL - ones[2]))} % — the result is confirmed (the other readings give ${f2(Math.min(...ones))}–${f2(Math.max(...ones))} %).`}</Result>
        </Sol>
      )
    },
    notes: ['Which one-point formula the course uses is not on the paper or the slides; the IS 2720-5 form is shown.'],
  },
  {
    id: 'sm-jan-2021-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 15,
    topics: ['sm-class'],
    title: 'AASHTO: F200 = 92, LL 41, PL 31 → A-5 (boundary case) with GI',
    text: 'For a soil, the following results were obtained from grain size distribution and Atterberg limit tests: Percent finer No. 200 sieve (0.075 mm) = 92, Liquid Limit = 41%, Plastic limit = 31%. Classify the soil based on AASHTO Classification System.',
    pages: [50, 52],
    given: [{ label: 'Chart 1', what: 'AASHTO classification', ref: 'c-aashto' }],
    checks: () => {
      const a = aashto(A6b)
      return [
        { key: 'pi', label: 'PI', value: 10 },
        { key: 'gi', label: 'Group index (whole number)', value: a.gi.gi },
      ]
    },
    solution: () => (
      <Sol>
        <AashtoSolved inp={A6b} lead="PI = 41 − 31 = 10. Both limits sit exactly on the A-5 boundaries (LL 41 min, PI 10 max), so A-5 fits — not A-7 (PI 11 min) and not A-4 (LL 40 max). The GI formula is not printed on Chart 1 (Das eq. 5.1)." />
      </Sol>
    ),
    notes: ['Boundary case: LL = 41 and PI = 10 both meet the A-5 limits exactly.'],
  },
  {
    id: 'sm-jan-2021-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 15,
    topics: ['sm-shear', 'sm-lep'],
    title: 'Five qualitative curves: u vs ε, εv vs strain, B vs S, Af vs OCR, pressure vs tilt',
    text: "Draw the following qualitative curves:\n\n(i) Pore pressure versus axial strain for saturated samples of normally consolidated and overconsolidated clays in consolidated undrained (CU) triaxial compression tests.\n(ii) Volumetric strain versus axial strain for saturated samples of loose sand and dense sand in consolidated drained (CD) direct shear tests.\n(iii) Variation of Skempton's pore pressure parameter B with degree of saturation.\n(iv) Skempton's pore pressure parameter A at failure ($A_f$) versus overconsolidation ratio (OCR).\n(v) Variation of the magnitude of lateral earth pressures (at-rest, active and passive) with tilt of wall.",
    pages: [50],
    theory: true,
    flag: "(iii)–(iv) Skempton's B and A — not in AJK sir's slides.",
    solution: () => (
      <Models
        parts={[
          { title: '(i)–(iv) Shear curves', item: th('sm-shear', 't-curves') },
          { title: '(v) Earth pressure vs wall tilt', item: th('sm-lep', 't-tilt') },
        ]}
      />
    ),
    notes: ['"axial strain" in (ii) should be shear displacement for a direct shear test.'],
  },
  {
    id: 'sm-jan-2021-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 16,
    topics: ['sm-class'],
    title: 'USCS: soil A (95 % fines, LL 53, PL 32) and soil B (11 % fines, Cu, Cc, fines LL 37, PL 21)',
    text: 'Classify the following two inorganic soils according to Unified Soil Classification System (USCS):\n\n**Soil A:** Percent finer No. 200 sieve (0.075 mm) = 95; Liquid Limit = 53%; Plastic Limit = 32%.\n\n**Soil B:** Percent finer No. 4 sieve (4.75 mm) = 90; Percent finer No. 200 sieve (0.075 mm) = 11; $D_{60}$ = 1.8 mm, $D_{30}$ = 0.4 mm, $D_{10}$ = 0.07 mm; Consistency limit of fraction passing No. 200 sieve: Liquid Limit = 37%, Plastic Limit = 21%.',
    pages: [51],
    given: [],
    checks: () => [
      { key: 'piA', label: 'Soil A: PI', value: 21 },
      { key: 'aA', label: 'Soil A: A-line PI at LL 53', value: 0.73 * 33, tol: 0.03 },
      { key: 'cu', label: 'Soil B: $C_u$', value: SB.Cu },
      { key: 'cc', label: 'Soil B: $C_c$', value: SB.Cc },
      { key: 'aB', label: 'Soil B fines: A-line PI at LL 37', value: 0.73 * 17, tol: 0.03 },
    ],
    solution: () => {
      const a = uscs(SA)
      const b = uscs(SB)
      return (
        <Sol>
          <Head>Soil A</Head>
          <UscsSolved inp={SA} />
          <Head>Soil B</Head>
          <Tex block>{`C_u = \\frac{1.8}{0.07} = ${f2(SB.Cu)},\\qquad C_c = \\frac{0.4^2}{1.8\\times0.07} = ${f2(SB.Cc)}`}</Tex>
          <UscsSolved inp={SB} />
          <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[460px]">
            <PlasticityChart
              pts={[
                { LL: 53, PI: 21, label: 'A' },
                { LL: 37, PI: 16, label: 'B fines', color: 'var(--c-accent)' },
              ]}
            />
          </div>
          <Result>{`Soil A: **${a.symbol}, ${a.name.toLowerCase()}** (PI 21 below the A-line 24.09, LL ≥ 50). Soil B: **${b.symbol}, ${b.name.toLowerCase()}** — 79 % sand, 10 % gravel, 11 % fines (5–12 %: dual), well graded (Cu ≥ 6, 1 ≤ Cc ≤ 3), fines PI 16 above the A-line (12.41) → C.`}</Result>
        </Sol>
      )
    },
    notes: ['No plasticity chart is attached to this paper; same structure as 2020-21 Q6(a).'],
  },
  {
    id: 'sm-jan-2021-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 14,
    topics: ['sm-lep'],
    title: "Coulomb's assumptions; active pressure for a c–φ backfill",
    text: "State the assumptions in Coulomb's theory of earth pressure. Also deduce an expression for active earth pressure due to a cohesive frictional (c-φ) backfill.",
    pages: [51],
    theory: true,
    flag: "Coulomb's theory — not in AJK sir's slides this term.",
    solution: () => (
      <Models
        parts={[
          { title: "Coulomb's assumptions and the c–φ result", item: th('sm-lep', 't-coulomb') },
          { title: 'The c–φ active expression step by step (with the crack depth that follows from it)', item: th('sm-lep', 't-cphi') },
        ]}
      />
    ),
  },
  {
    id: 'sm-jan-2021-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 16.67,
    topics: ['sm-shear'],
    title: 'CD field cases (sketch) + CD test on NC clay: failure-plane angle, σ′f and τf',
    text: "Show with neat sketches two examples of consolidated drained (CD) analyses in clays. (5)\n\nA consolidated drained triaxial compression test was conducted on a normally consolidated clay sample with a cell pressure of 150 kN/m². Pore pressure within the sample at the end of consolidation was zero. Deviator stress at failure was 200 kN/m². The effective angle of internal friction ($\\varphi'$) of the sample was found to be 24º. Determine the angle of the failure plane of the sample. Also find the values of effective normal stress ($\\sigma_f'$) and shear stress ($\\tau_f$) on the failure plane. (11⅔)",
    pages: [51],
    given: [],
    checks: () => {
      const fp = failurePlane(circle(350, 150), 24)
      return [
        { key: 'th', label: 'Failure plane from the major principal plane θ', value: fp.theta, unit: '°' },
        { key: 'sf', label: "$\\sigma'_f$ on the failure plane", value: fp.sigma, unit: 'kPa' },
        { key: 'tf', label: '$\\tau_f$ on the failure plane', value: fp.tau, unit: 'kPa' },
      ]
    },
    solution: () => {
      const c = circle(350, 150)
      const fp = failurePlane(c, 24)
      const own = phiFromCircle(150, 200)
      const S = th('sm-shear', 't-cases').Fig!
      return (
        <Sol>
          <Head>CD analyses in clays (5 marks)</Head>
          <Md>{`Long-term (drained) conditions, effective-stress parameters c′, φ′: (1) an **embankment on soft clay many years after construction** (excess pore pressures dissipated); (2) an **excavation or natural slope in clay in the long term** (and an earth dam with steady seepage). Sketch each with the clay layer, the slip surface and "u = steady state / hydrostatic".`}</Md>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <S />
          </div>
          <Head>Failure plane (11⅔ marks)</Head>
          <Md>{`CD test, u = 0: $\\sigma'_3 = 150$, $\\sigma'_1 = 150 + 200 = 350$ kPa. Centre $C = 250$, radius $R = 100$ kPa. NC clay: envelope through the origin at φ′ = 24°.`}</Md>
          <Tex block>{`\\theta = 45 + \\frac{\\varphi'}{2} = 45 + 12 = ${f2(fp.theta)}^\\circ\\ \\text{from the major principal (horizontal) plane},\\quad 2\\theta = ${f2(fp.twoTheta)}^\\circ`}</Tex>
          <Tex block>{`\\sigma'_f = C + R\\cos 2\\theta = 250 + 100\\cos ${f2(fp.twoTheta)}^\\circ = ${f2(fp.sigma)}\\ \\text{kPa},\\qquad \\tau_f = R\\sin 2\\theta = 100\\sin ${f2(fp.twoTheta)}^\\circ = ${f2(fp.tau)}\\ \\text{kPa}`}</Tex>
          <MohrPlot eff={[c]} envE={{ c: 0, phi: 24 }} />
          <Result>{`θ = **${f2(fp.theta)}°**, $\\sigma'_f$ = **${f2(fp.sigma)} kPa**, $\\tau_f$ = **${f2(fp.tau)} kPa**. (Check: the data alone give $\\sin\\varphi' = 100/250$, φ′ = ${f2(own)}°, consistent with the stated 24°.)`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-jan-2021-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 12.67,
    topics: ['sm-lep'],
    title: 'φ = 0 clay, 9 m wall: unsupported height and force after the crack',
    text: 'A smooth vertical wall of height 9 m retains a soft clay backfill of unit weight 17.5 kN/m³. Undrained shear strength of the clay backfill is 26 kN/m². For undrained condition ($\\varphi = 0$) of the backfill, calculate the following:\n\n(i) Unsupported height of the wall\n(ii) Active earth force after tension crack forms',
    pages: [51],
    given: [],
    checks: () => clayChecks(9, 17.5, 26, { hc: true }),
    solution: () => <ClaySolution H={9} gamma={17.5} cu={26} hc />,
  },
  {
    id: 'sm-jan-2021-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 14,
    topics: ['sm-shear'],
    title: 'Thixotropy; CU and CD on identical NC specimens → φ′, φu, Af',
    text: "What do you mean by thixotrophy? (4)\n\nTwo identical specimens of a saturated normally consolidated soft clay sample were fully consolidated in the triaxial cell under a cell pressure of 150 kN/m². Pore pressure within each specimen at the end of consolidation was zero. One specimen was then sheared undrained condition and the other under drained condition until failure took place. The values of deviator stress at failure in the undrained and drained tests were found to be 175 kN/m² and 400 kN/m², respectively. Compute the following: (10)\n\n(i) Values of $\\varphi'$ and $\\varphi_u$.\n(ii) Value of pore pressure parameter A at failure ($A_f$) in the undrained test.",
    pages: [51],
    given: [],
    flag: "Thixotropy and Skempton's A — not in AJK sir's slides.",
    checks: () => {
      const r = nccucd(150, 175, 400)
      return [
        { key: 'phie', label: "$\\varphi'$ (from the CD test)", value: r.phiE, unit: '°' },
        { key: 'phiu', label: '$\\varphi_u$ (CU total)', value: r.phiT, unit: '°' },
        { key: 'uf', label: '$u_f$ in the CU test', value: r.uf, unit: 'kPa' },
        { key: 'af', label: '$A_f$', value: r.Af },
      ]
    },
    solution: () => {
      const r = nccucd(150, 175, 400)
      return (
        <Sol>
          <Head>Thixotropy (4 marks)</Head>
          <Md>{`The reversible, time-dependent **regain of strength** of a remoulded clay at **constant water content** when it is left undisturbed. Remoulding breaks the flocculated particle arrangement and the adsorbed-water structure; at rest the particles and water molecules slowly re-arrange towards a stable (flocculated) state and bonds re-form, so strength increases with time (sketch: strength vs time — drop on remoulding, gradual regain). Examples: set-up of piles in clay, bentonite drilling mud gelling at rest.`}</Md>
          <Head>φ′, φu and Af (10 marks)</Head>
          <NcCuCdSolution s3={150} devU={175} devD={400} />
          <Result>{`$\\varphi'$ = **${f2(r.phiE)}°**, $\\varphi_u$ (= $\\varphi_{cu}$) = **${f2(r.phiT)}°**, $u_f$ = ${f2(r.uf)} kPa, $A_f$ = **${f3(r.Af)}**.`}</Result>
        </Sol>
      )
    },
    notes: ['"thixotrophy" is sic.', '"φu" means the total-stress angle of the CU test (φcu).'],
  },
  {
    id: 'sm-jan-2021-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 20,
    topics: ['sm-lep'],
    title: 'Rankine passive, two layers (sand over c′–φ′), WT at 2 m; increase from q = 10 kPa',
    text: "For the retaining wall shown in Fig. 4, draw Rankine's passive pressure diagram and determine the total passive force per metre length of the wall. If the backfill supports a uniformly distributed load of 10 kN/m², what will be the increase in total passive force per metre length of the wall?\n\nFig. 4: wall 6 m; upper layer 2 m — $\\gamma_{moist}$ = 16 kN/m³, $c'$ = 0, $\\varphi'$ = 30°; water table at 2 m; lower layer 4 m — $\\gamma_{sat}$ = 20 kN/m³, $c'$ = 25 kN/m², $\\varphi'$ = 27°.",
    pages: [51, 52],
    given: [],
    figure: () => <WallQFig w={W8} />,
    checks: () => {
      const r = solveWall(W8),
        r2 = solveWall(W8q)
      return [...wallChecks(W8), { key: 'Fq', label: 'Total passive force with q = 10 kPa', value: r2.Fs, unit: 'kN/m' }, { key: 'dF', label: 'Increase in passive force', value: r2.Fs - r.Fs, unit: 'kN/m' }]
    },
    solution: () => {
      const r = solveWall(W8),
        r2 = solveWall(W8q)
      return (
        <Sol>
          <WallSolved
            w={W8}
            r={r}
            lead="Passive Rankine: σ′p = σ′vKp + 2c′√Kp in each layer (cohesion adds, so there is no tension zone). σ′v is continuous at 2 m but Kp and c′ change, so the diagram jumps. Water below 2 m is added separately (K = 1)."
          />
          <Head>With q = 10 kPa</Head>
          <Md>{`The surcharge adds $qK_p$ in each layer: $\\Delta P = 10(${f3(r.K[0])})(2) + 10(${f3(r.K[1])})(4) = ${f2(10 * r.K[0] * 2)} + ${f2(10 * r.K[1] * 4)} = ${f2(10 * r.K[0] * 2 + 10 * r.K[1] * 4)}$ kN/m. Re-solving the wall with q = 10: ${f2(r2.Fs)} kN/m.`}</Md>
          <Result>{`Total passive force (soil + water) = **${f2(r.Fs)} kN/m** at ${f2(r.zbar)} m above the base (water ${f2(r.waterF)} kN/m). Increase from q = 10 kPa = **${f2(r2.Fs - r.Fs)} kN/m**.`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 4 (p52) is hand-drawn; the water pressure is included in the total (as in the class handnote).'],
  },
]

