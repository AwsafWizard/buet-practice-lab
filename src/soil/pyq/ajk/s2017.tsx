// CE 341 term final 2017-18 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1–Q4), held 1 Sep 2018, PDF pp. 39–41; attached Chart 1 β vs OCR and Chart 2 AASHTO (p45).
import { Md, Tex } from '../../../components/ui'
import { aashto, grading, uscs } from '../../engine/classify'
import { solveWall, type Wall } from '../../engine/earth'
import { coneLL, onePointCone } from '../../engine/plasticity'
import { circleArea, directShear, fitCircles, suFromK0Af, triaxCircles, type TriaxTest } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import { FlowPlot } from '../../topics/plast/figs'
import { TauSigmaFig } from '../../topics/shear/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, clayChecks, ClaySolution, CuOCSolution, cuOCChecks, f2, f3, f4, FitText, Head, Model, MohrPlot, NcCuCdSolution, nccucd, Result, Sol, Tbl, th, TriaxTable, UscsSolved, wallChecks, WallQFig, WallSolved } from './kit'

const P = '2017-18' as const

const CONE1 = [
  { d: 16, w: 33 },
  { d: 18, w: 40 },
  { d: 22, w: 54 },
  { d: 25, w: 63 },
  { d: 30, w: 83 },
]
const RATIO1d = suFromK0Af({ c: 0, phi: 20, K0: 0.5, Af: 0.6, sv: 1 })

const SA2 = { F200: 93, LL: 58, PL: 23 }
const GB2 = () =>
  grading([
    { d: 4.75, pf: 92 },
    { d: 2.0, pf: 60 },
    { d: 0.425, pf: 30 },
    { d: 0.075, pf: 10 },
  ])
const SB2 = () => {
  const g = GB2()
  return { F200: 10, F4: 92, LL: 37, PL: 26, Cu: g.Cu, Cc: g.Cc }
}

const A3a = { P200: 90, LL: 52, PI: 27 }
const T3b: TriaxTest[] = [
  { s3: 100, dev: 410, u: -65 },
  { s3: 200, dev: 520, u: -10 },
]
const W3d: Wall = {
  layers: [
    { h: 3, gamma: 17, phi: 30, c: 0 },
    { h: 3, gamma: 20, gammaSat: 20, phi: 26, c: 15 },
  ],
  zw: 3,
  q: 0,
  state: 'passive',
}
const W3dq: Wall = { ...W3d, q: 20 }

const DS4 = [
  { N: 150, Tp: 158, Tr: 44 },
  { N: 350, Tp: 257, Tr: 102 },
  { N: 550, Tp: 363, Tr: 144.5 },
]
const ds4 = () => {
  const A = circleArea(50)
  const peak = directShear(
    DS4.map((x) => ({ N: x.N / 1000, T: x.Tp / 1000 })),
    A,
  )
  const res = directShear(
    DS4.map((x) => ({ N: x.N / 1000, T: x.Tr / 1000 })),
    A,
  )
  const res0 = directShear(
    DS4.map((x) => ({ N: x.N / 1000, T: x.Tr / 1000 })),
    A,
    { through0: true },
  )
  return { A, peak, res, res0 }
}

export const A2017: SmQ[] = [
  {
    id: 'sm-2017-18-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 13.67,
    topics: ['sm-plast'],
    title: 'Fall-cone LL from five readings + single-point check',
    text: 'A clayey soil was tested for liquid limit in a cone penetrometer and the following results were obtained:\n\n- Cone penetration (mm): 16, 18, 22, 25, 30\n- Water content (%): 33, 40, 54, 63, 83\n\nDetermine the liquid limit of the soil and check the result by the single point method using relevant data.',
    pages: [39],
    given: [],
    checks: () => {
      const f = coneLL(CONE1)
      return [
        { key: 'LL', label: 'Liquid limit (w at 20 mm)', value: f.LL, unit: '%', tol: 0.02 },
        { key: 'o18', label: 'One-point LL from the 18 mm reading', value: onePointCone(40, 18), unit: '%' },
        { key: 'o22', label: 'One-point LL from the 22 mm reading', value: onePointCone(54, 22), unit: '%' },
      ]
    },
    solution: () => {
      const f = coneLL(CONE1)
      const ones = CONE1.map((x) => onePointCone(x.w, x.d))
      return (
        <Sol>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <FlowPlot mode="cone" pts={CONE1.map((x) => ({ x: x.d, w: x.w }))} a={f.a} b={f.b} LL={f.LL} />
          </div>
          <Md>{`The points are almost on a straight line: $w = ${f2(f.a)} + ${f3(f.b)}d$. **LL = w at 20 mm = ${f2(f.LL)} %** (interpolating between 18 and 22 mm: ${f2(f.interp)} %).`}</Md>
          <Head>Single-point check</Head>
          <Md>{`IS 2720-5: $w_L = \\dfrac{w_y}{0.77\\log_{10}y}$ (y = 14–28 mm). The relevant readings are those nearest 20 mm:`}</Md>
          <Tex block>{`y = 18:\\ \\frac{40}{0.77\\log 18} = ${f2(ones[1])}\\%,\\qquad y = 22:\\ \\frac{54}{0.77\\log 22} = ${f2(ones[2])}\\%,\\qquad \\text{mean} = ${f2((ones[1] + ones[2]) / 2)}\\%`}</Tex>
          <Result>{`LL ≈ **${f2(f.LL)} %**. The one-point values from the two readings either side of 20 mm average ${f2((ones[1] + ones[2]) / 2)} %, confirming it; singly they miss by about ±5 % because the curve is steep (${f2(f.b)} % per mm). The 30 mm reading is outside the formula's 14–28 mm range.`}</Result>
        </Sol>
      )
    },
    notes: ['The one-point formula is not on AJK sir’s slide (it shows only the BS cone plot); the IS 2720-5 form is used.'],
  },
  {
    id: 'sm-2017-18-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 12,
    topics: ['sm-shear', 'sm-plast', 'sm-lep'],
    title: 'Define: SL, thixotropy, critical void ratio, cu, Skempton B, K0',
    text: "Define the following: (i) Shrinkage limit (ii) Thixotropy (iii) Critical void ratio (iv) Undrained shear strength (v) Skempton's pore pressure coefficient B (vi) Coefficient of earth pressure at rest.",
    pages: [39],
    theory: true,
    flag: "Thixotropy, critical void ratio and Skempton's B — not in AJK sir's slides.",
    solution: () => (
      <Model
        md={`(2 marks each)
1. **Shrinkage limit (SL):** the water content below which further loss of water causes **no further decrease in volume** of the soil; the boundary between the semi-solid and solid states. At the SL the soil is just saturated at its minimum volume: $SL = (V_d\\rho_w/W_s - 1/G_s)\\times100\\%$.
2. **Thixotropy:** the reversible, time-dependent **regain of strength** of a remoulded clay at constant water content when it is left undisturbed (particles and adsorbed water re-arrange into a stable structure).
3. **Critical void ratio:** the void ratio at which a cohesionless soil shears (drained) with **no change in volume**; looser sands contract, denser sands dilate. A saturated sand looser than critical can liquefy under undrained loading.
4. **Undrained shear strength ($c_u$ or $s_u$):** the shear strength of a saturated clay loaded with **no drainage** (no volume change): $\\tau_f = c_u$, $\\varphi_u = 0$; $c_u = (\\sigma_1 - \\sigma_3)_f/2$ from UU, $q_u/2$ from the unconfined test.
5. **Skempton's B:** the ratio of the change in pore pressure to the change in all-round (cell) total stress under undrained conditions, $B = \\Delta u/\\Delta\\sigma_3$; B = 1 for saturated soil, B ≈ 0 for dry soil.
6. **Coefficient of earth pressure at rest $K_0$:** the ratio of horizontal to vertical effective stress in soil with **no lateral strain**, $K_0 = \\sigma'_h/\\sigma'_v$; Jaky $K_0 = 1 - \\sin\\varphi'$ for NC soil, larger for OC soil ($K_0 \\propto \\sqrt{OCR}$).`}
      />
    ),
  },
  {
    id: 'sm-2017-18-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 10,
    topics: ['sm-class'],
    title: 'Draw the USCS plasticity chart',
    text: 'Draw neatly the plasticity chart of Unified Soil Classification System (USCS) showing the classifications of different soil deposits.',
    pages: [39],
    theory: true,
    solution: () => <Model item={th('sm-class', 't-plchart')} />,
  },
  {
    id: 'sm-2017-18-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 11,
    topics: ['sm-shear'],
    title: 'su of an OC clay at 5 m from K0, φ′, Af (NC) and the β chart',
    text: 'A clay sample (LL = 67%, PL = 35% and natural moisture content = 54%) was collected from a depth of 5 m below the ground level. The water table is at the ground level and the saturated unit weight of the sample is 20 kN/m³. From a laboratory one-dimensional consolidation test, the preconsolidation pressure of the sample was found to be 255 kN/m². Estimate the value of undrained shear strength of the sample at that depth. In the normally consolidated state, take the values of $K_0$, $\\varphi\'$ and $A_f$ as 0.5, 20° and 0.6 respectively.',
    pages: [39, 45],
    given: [{ label: 'Chart 1', what: 'β vs overconsolidation ratio', ref: 's-beta' }],
    flag: "Skempton's A and the β chart — not in AJK sir's slides.",
    checks: () => cuOCChecks(5, 20, 255, RATIO1d),
    solution: () => (
      <Sol>
        <Md>{`For the NC state use the expression of Q2(c) with c′ = 0 (NC clay), per unit $\\sigma'_v$:`}</Md>
        <CuOCSolution
          z={5}
          gsat={20}
          pc={255}
          ratio={RATIO1d}
          ratioTex={`\\frac{\\sin\\varphi'[K_0 + A_f(1 - K_0)]}{1 + (2A_f - 1)\\sin\\varphi'} = \\frac{\\sin 20^\\circ[0.5 + 0.6(0.5)]}{1 + 0.2\\sin 20^\\circ}`}
        />
      </Sol>
    ),
    notes: ['"volumes" in print is a typo for "values".', 'LL, PL and w are not needed (Skempton’s 0.11 + 0.0037PI would give 0.228 instead of 0.256).', 'β is read from the printed chart: about 3.2 on the average curve at OCR = 5 (2.7–3.7).'],
  },
  {
    id: 'sm-2017-18-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 11.67,
    topics: ['sm-struct'],
    title: 'Define soil structure; types for coarse-grained and clay soils (sketches)',
    text: 'Define structure of a soil. With neat sketches define various types of structure of coarse grained soil and clay soil.',
    pages: [39],
    theory: true,
    solution: () => <Model item={th('sm-struct', 't-structures')} />,
  },
  {
    id: 'sm-2017-18-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 12,
    topics: ['sm-class'],
    title: 'USCS: soil A (93 % fines, LL 58, PL 23) and soil B (sieve %, LL 37, PL 26)',
    text: 'Classify the following two inorganic soils according to Unified Soil Classification System (USCS):\n\n**Soil A:** Percent finer than No. 200 sieve (0.075 mm) = 93; Liquid Limit = 58%; Plastic Limit = 23%.\n\n**Soil B:** Percent finer than No. 4 sieve (4.75 mm) = 92; No. 10 sieve (2.0 mm) = 60; No. 40 sieve (0.425 mm) = 30; No. 200 sieve (0.075 mm) = 10; Liquid Limit = 37%; Plastic Limit = 26%.',
    pages: [39],
    given: [],
    checks: () => {
      const g = GB2()
      return [
        { key: 'piA', label: 'Soil A: PI', value: 35 },
        { key: 'aA', label: 'Soil A: A-line PI at LL 58', value: 0.73 * 38, tol: 0.03 },
        { key: 'd10', label: 'Soil B: $D_{10}$', value: g.D10, unit: 'mm' },
        { key: 'd30', label: 'Soil B: $D_{30}$', value: g.D30, unit: 'mm' },
        { key: 'd60', label: 'Soil B: $D_{60}$', value: g.D60, unit: 'mm' },
        { key: 'cu', label: 'Soil B: $C_u$', value: g.Cu },
        { key: 'cc', label: 'Soil B: $C_c$', value: g.Cc },
      ]
    },
    solution: () => {
      const g = GB2()
      const a = uscs(SA2)
      const b = uscs(SB2())
      return (
        <Sol>
          <Head>Soil A</Head>
          <UscsSolved inp={SA2} />
          <Head>Soil B</Head>
          <Md>{`The given sieve points fall exactly on 10, 30 and 60 % finer, so $D_{10}$ = ${f3(g.D10)} mm (No. 200), $D_{30}$ = ${f3(g.D30)} mm (No. 40), $D_{60}$ = ${f3(g.D60)} mm (No. 10).`}</Md>
          <Tex block>{`C_u = \\frac{${f3(g.D60)}}{${f3(g.D10)}} = ${f2(g.Cu)},\\qquad C_c = \\frac{${f3(g.D30)}^2}{${f3(g.D60)}\\times${f3(g.D10)}} = ${f2(g.Cc)}`}</Tex>
          <UscsSolved inp={SB2()} />
          <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[460px]">
            <PlasticityChart
              pts={[
                { LL: 58, PI: 35, label: 'A' },
                { LL: 37, PI: 11, label: 'B', color: 'var(--c-accent)' },
              ]}
            />
          </div>
          <Result>{`Soil A: **${a.symbol}, ${a.name.toLowerCase()}**. Soil B: **${b.symbol}, ${b.name.toLowerCase()}** — 8 % gravel, 82 % sand, 10 % fines (dual symbol), well graded (Cu = ${f2(g.Cu)} ≥ 6, Cc = ${f2(g.Cc)}), fines PI 11 below the A-line (${f2(0.73 * 17)}) → M.`}</Result>
        </Sol>
      )
    },
    notes: ['For soil B the LL and PL are taken as those of the fines (minus No. 40 / No. 200 fraction).'],
  },
  {
    id: 'sm-2017-18-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 13,
    topics: ['sm-shear'],
    title: 'Derive su from c′, φ′, σ′v, K0 and Af',
    text: "Derive the following expression (symbols have their usual meanings):\n\n$$s_u = \\frac{c'\\cos\\varphi' + \\sigma'_v\\sin\\varphi'\\,[K_0 + A_f(1 - K_0)]}{1 + (2A_f - 1)\\sin\\varphi'}$$",
    pages: [40],
    theory: true,
    flag: "Uses Skempton's A — not in AJK sir's slides.",
    solution: () => <Model item={th('sm-shear', 't-su')} />,
    notes: ['The "=" after su is missing in print.'],
  },
  {
    id: 'sm-2017-18-2d',
    paper: P,
    sec: 'A',
    no: '2(d)',
    marks: 10,
    topics: ['sm-lep'],
    title: 'φ = 0 clay, 8 m wall: crack depth, Pa before and after the crack',
    text: 'A smooth vertical wall of 8 m height retains a soft clay backfill of unit weight 17 kN/m³. For undrained condition ($\\varphi = 0$) of the backfill, determine (i) the depth of tension crack, (ii) the active earth force before the tension crack occurs, (iii) the active earth force after the tension crack occurs. Undrained shear strength of the backfill is 30 kN/m².',
    pages: [40],
    given: [],
    checks: () => clayChecks(8, 17, 30, { before: true }),
    solution: () => <ClaySolution H={8} gamma={17} cu={30} before />,
    notes: ['No water in the crack is mentioned, so none is added.'],
  },
  {
    id: 'sm-2017-18-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 7,
    topics: ['sm-class'],
    title: 'AASHTO: F200 = 90, LL 52, PL 25 → A-7-6 with GI',
    text: 'For a soil, the following results were obtained from grain size distribution and Atterberg limit tests: percent finer than No. 200 sieve = 90, Liquid Limit = 52, Plastic Limit = 25. Classify the soil according to the AASHTO classification system.',
    pages: [40, 45],
    given: [{ label: 'Chart 2', what: 'AASHTO classification (after Atkins, 1997)', ref: 'c-aashto' }],
    checks: () => [
      { key: 'pi', label: 'PI', value: 27 },
      { key: 'll30', label: 'LL − 30', value: 22 },
      { key: 'gi', label: 'Group index', value: aashto(A3a).gi.gi },
    ],
    solution: () => (
      <Sol>
        <AashtoSolved inp={A3a} lead="PI = 52 − 25 = 27. The GI formula is not printed on Chart 2 (Das eq. 5.1)." />
      </Sol>
    ),
    notes: ['"ASSHTO" in print.'],
  },
  {
    id: 'sm-2017-18-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 14,
    topics: ['sm-shear'],
    title: 'CU on OC clay, two specimens (negative uf): effective c′, φ′',
    text: "CU triaxial compression tests on two specimens of a saturated overconsolidated clay gave the following results at failure:\n\n- Specimen 1: cell pressure 100 kN/m², deviator stress 410 kN/m², pore pressure −65 kN/m²\n- Specimen 2: cell pressure 200 kN/m², deviator stress 520 kN/m², pore pressure −10 kN/m²\n\nDraw the Mohr circles in a plain graph paper in terms of effective stress and estimate the values of $c'$ and $\\varphi'$. Also write down the Mohr-Coulomb equation for the effective stress failure envelope.",
    pages: [40],
    given: [],
    checks: () => {
      const e = triaxCircles(T3b).eff!
      const f = fitCircles(e)
      return [
        { key: 's31', label: "$\\sigma'_3$, specimen 1", value: e[0].s3, unit: 'kPa' },
        { key: 's11', label: "$\\sigma'_1$, specimen 1", value: e[0].s1, unit: 'kPa' },
        { key: 's32', label: "$\\sigma'_3$, specimen 2", value: e[1].s3, unit: 'kPa' },
        { key: 's12', label: "$\\sigma'_1$, specimen 2", value: e[1].s1, unit: 'kPa' },
        { key: 'phi', label: "$\\varphi'$", value: f.phi, unit: '°', tol: 0.03 },
        { key: 'c', label: "$c'$ (small)", value: f.c, unit: 'kPa', tol: 1.5 },
      ]
    },
    solution: () => {
      const e = triaxCircles(T3b).eff!
      const f = fitCircles(e)
      return (
        <Sol>
          <Md>{`$\\sigma'_3 = \\sigma_3 - u_f$: the negative pore pressures (an OC clay tends to dilate) make the effective stresses **larger** than the total ones.`}</Md>
          <TriaxTable tests={T3b} />
          <MohrPlot eff={e} envE={f} />
          <FitText cs={e} prime />
          <Result>{`$\\varphi'$ ≈ **${f2(f.phi)}°**, $c'$ ≈ **${f2(f.c)} kPa** (practically zero). Mohr–Coulomb: $\\tau_f = ${f2(f.c)} + \\sigma'\\tan ${f2(f.phi)}°$ kPa. Check: $\\sigma'_1 = \\sigma'_3K_p + 2c'\\sqrt{K_p}$ for both circles gives the same pair.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2017-18-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 11.67,
    topics: ['sm-shear'],
    title: 'Qualitative curves: u vs ε (CU), εv vs ε (CD), B vs S, Af vs OCR',
    text: "Draw the following qualitative curves:\n\n(i) Pore pressure versus axial strain for saturated normally consolidated and overconsolidated clays in consolidated undrained triaxial compression tests.\n(ii) Volumetric strain versus axial strain for saturated normally consolidated and overconsolidated clays in consolidated drained triaxial compression tests.\n(iii) Variation of pore pressure parameter B with degree of saturation.\n(iv) Variation of pore pressure parameter A at failure ($A_f$) with overconsolidation ratio.",
    pages: [40],
    theory: true,
    flag: "(iii)–(iv) Skempton's B and A — not in AJK sir's slides.",
    solution: () => <Model item={th('sm-shear', 't-curves')} pre="For (ii) here the soils are NC and OC **clays** in a triaxial CD test: NC clay behaves like loose sand (contracts throughout), OC clay like dense sand (slight contraction, then dilation)." />,
  },
  {
    id: 'sm-2017-18-3d',
    paper: P,
    sec: 'A',
    no: '3(d)',
    marks: 14,
    topics: ['sm-lep'],
    title: 'Rankine passive, two layers, WT at 3 m: force and location; then with q = 20 kPa',
    text: "For the retaining wall shown in Fig. 1, determine the force per unit length of the wall for Rankine's passive state. Also find the location of the total passive force. If the backfill supports a uniformly distributed load of 20 kN/m², what will be the total passive force per unit length of the wall?\n\nFig. 1: top 3 m — $\\gamma$ = 17 kN/m³, $c'$ = 0, $\\varphi'$ = 30°; water table at 3 m; bottom 3 m — $\\gamma_{sat}$ = 20 kN/m³, $c'$ = 15 kN/m², $\\varphi'$ = 26°.",
    pages: [41],
    given: [],
    figure: () => <WallQFig w={W3d} />,
    checks: () => {
      const r2 = solveWall(W3dq)
      return [...wallChecks(W3d), { key: 'Fq', label: 'Total passive force with q = 20 kPa', value: r2.Fs, unit: 'kN/m' }, { key: 'zq', label: 'Its location above the base', value: r2.zbar, unit: 'm' }]
    },
    solution: () => {
      const r = solveWall(W3d),
        r2 = solveWall(W3dq)
      return (
        <Sol>
          <WallSolved w={W3d} r={r} lead="Passive Rankine, layer by layer: σ′p = σ′vKp + 2c′√Kp, water below 3 m added separately. The diagram jumps at 3 m because Kp and c′ change." />
          <Head>With q = 20 kPa</Head>
          <WallSolved w={W3dq} r={r2} />
          <Result>{`Without surcharge: $P_p$ = **${f2(r.Fs)} kN/m** acting **${f2(r.zbar)} m** above the base (water ${f2(r.waterF)} kN/m). With q = 20 kPa: $P_p$ = **${f2(r2.Fs)} kN/m** at ${f2(r2.zbar)} m (increase ${f2(r2.Fs - r.Fs)} = 20(${f3(r.K[0])})(3) + 20(${f3(r.K[1])})(3)).`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 1 (p41) is hand-drawn; the wall height is 3 + 3 = 6 m.', 'Water pressure is included in the total passive force (soil alone is the total minus the water line).'],
  },
  {
    id: 'sm-2017-18-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 12,
    topics: ['sm-shear'],
    title: 'Advantages of the triaxial test; UU behaviour; two UU field cases',
    text: 'What are the advantages of triaxial test? Describe briefly the behaviour of saturated clay samples in unconsolidated undrained (UU) triaxial compression test. Also, show with neat sketches two examples of UU analysis in clays.',
    pages: [41],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-uu')} />,
  },
  {
    id: 'sm-2017-18-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 10,
    topics: ['sm-shear'],
    title: 'CU vs CD on identical NC specimens (σ3 = 150): φ′, φu, Af',
    text: 'Two identical specimens of a saturated normally consolidated clay sample were fully consolidated in the triaxial cell under a cell pressure of 150 kN/m². Pore pressure within each specimen at the end of consolidation was zero. One specimen was then sheared under undrained condition and the other under drained condition until failure took place. The values of deviator stress at failure in the undrained and drained tests were found to be 225 kN/m² and 325 kN/m², respectively. Calculate the values of $\\varphi\'$ and $\\varphi_u$. Also calculate the value of pore pressure parameter A at failure ($A_f$).',
    pages: [41],
    given: [],
    flag: "Af is Skempton's A — not in AJK sir's slides.",
    checks: () => {
      const r = nccucd(150, 225, 325)
      return [
        { key: 'phie', label: "$\\varphi'$", value: r.phiE, unit: '°' },
        { key: 'phiu', label: '$\\varphi_u$ (CU total)', value: r.phiT, unit: '°' },
        { key: 'uf', label: '$u_f$', value: r.uf, unit: 'kPa' },
        { key: 'af', label: '$A_f$', value: r.Af },
      ]
    },
    solution: () => {
      const r = nccucd(150, 225, 325)
      return (
        <Sol>
          <NcCuCdSolution s3={150} devU={225} devD={325} />
          <Result>{`$\\varphi'$ = **${f2(r.phiE)}°**, $\\varphi_u$ = **${f2(r.phiT)}°**, $u_f$ = ${f2(r.uf)} kPa, $A_f$ = **${f3(r.Af)}**.`}</Result>
        </Sol>
      )
    },
    notes: ['"φu" here is the total-stress angle of the CU test (φcu), not the UU φu = 0.'],
  },
  {
    id: 'sm-2017-18-4c',
    paper: P,
    sec: 'A',
    no: '4(c)',
    marks: 15,
    topics: ['sm-shear'],
    title: 'CD direct shear (50 mm specimens): peak and residual φ′, stress history',
    text: 'A consolidated drained direct shear test was conducted on a clay sample and the following results were obtained:\n\n- Specimen 1: normal force 150 N, peak shear force 158 N, residual shear force 44 N\n- Specimen 2: normal force 350 N, peak shear force 257 N, residual shear force 102 N\n- Specimen 3: normal force 550 N, peak shear force 363 N, residual shear force 144.5 N\n\nDiameter and height of each specimen were 50 mm and 25 mm, respectively. Determine the effective peak friction angle ($\\varphi\'_p$) and effective residual friction angle ($\\varphi\'_r$). Also comment on the stress history of the sample.',
    pages: [41],
    given: [],
    checks: () => {
      const r = ds4()
      return [
        ...r.peak.pts.map((x, i) => ({ key: `s${i}`, label: `σ (specimen ${i + 1})`, value: x.sigma, unit: 'kPa' })),
        { key: 'pp', label: "Peak $\\varphi'_p$", value: r.peak.env.phi, unit: '°', tol: 0.03 },
        { key: 'cp', label: "Peak $c'_p$", value: r.peak.env.c, unit: 'kPa', tol: 0.08 },
        { key: 'pr', label: "Residual $\\varphi'_r$ (best line)", value: r.res.env.phi, unit: '°', tol: 0.04 },
      ]
    },
    solution: () => {
      const r = ds4()
      return (
        <Sol>
          <Tex block>{`A = \\frac{\\pi}{4}(50)^2 = ${f2(r.A * 1e6)}\\ \\text{mm}^2;\\quad \\sigma = N/A,\\ \\tau = T/A`}</Tex>
          <Tbl
            head={['Specimen', 'σ (kPa)', 'τ peak (kPa)', 'τ residual (kPa)']}
            rows={DS4.map((_, i) => [`${i + 1}`, f2(r.peak.pts[i].sigma), f2(r.peak.pts[i].tau), f2(r.res.pts[i].tau)])}
          />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <TauSigmaFig pts={r.peak.pts} env={r.peak.env} env2={{ env: r.res.env, color: 'var(--c-accent2)', label: `residual: τ = ${f2(r.res.env.c)} + σ tan ${f2(r.res.env.phi)}°`, pts: r.res.pts }} />
          </div>
          <Md>{`**Peak** (least squares): $\\tau_p = ${f2(r.peak.fit.a)} + ${f4(r.peak.fit.b)}\\sigma$ → $\\varphi'_p$ = **${f2(r.peak.env.phi)}°**, $c'_p$ = ${f2(r.peak.env.c)} kPa.\n\n**Residual:** $\\tau_r = ${f2(r.res.fit.a)} + ${f4(r.res.fit.b)}\\sigma$ → $\\varphi'_r$ = **${f2(r.res.env.phi)}°** with a small $c'_r$ = ${f2(r.res.env.c)} kPa; forced through the origin ($c'_r$ = 0, the usual assumption) $\\varphi'_r$ = ${f2(r.res0.env.phi)}°.`}</Md>
          <Result>{`$\\varphi'_p$ ≈ **${f2(r.peak.env.phi)}°**, $\\varphi'_r$ ≈ **${f2(r.res.env.phi)}°** (${f2(r.res0.env.phi)}° with c′r = 0). **Stress history:** a large peak cohesion intercept (${f2(r.peak.env.c)} kPa) in a drained test and a marked drop from peak to residual strength (dilatant, brittle behaviour) show the clay is **heavily overconsolidated**; an NC clay would give c′ ≈ 0 and little post-peak loss.`}</Result>
        </Sol>
      )
    },
    notes: ['Forces are already in N (no kg conversion). The height is not needed.'],
  },
  {
    id: 'sm-2017-18-4d',
    paper: P,
    sec: 'A',
    no: '4(d)',
    marks: 9.67,
    topics: ['sm-lep'],
    title: "Rankine's assumptions; active pressure for a c–φ backfill",
    text: "State the assumptions used in Rankine's theory of earth pressure. Deduce an expression for active earth pressure due to a c-φ backfill.",
    pages: [41],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-cphi')} post="(Steps 4–7 go beyond what this part asks; they answer 2016-17 Q10.)" />,
  },
]

