// CE 341 term final 2020-21 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section B (Q5–Q8), held 15 Oct 2022, PDF pp. 55–59; attached Chart 1 AASHTO and Fig. 4 (p59).
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { Ka, solveWall, type Wall } from '../../engine/earth'
import { flowCurve, indices } from '../../engine/plasticity'
import { deviatorWithAB, fitCircles, triaxCircles, type TriaxTest } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import { FlowPlot } from '../../topics/plast/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, clayChecks, ClaySolution, dsChecks, DSSolution, f2, f3, FitText, Head, Model, Models, MohrPlot, PQPlot, Result, Sol, th, TriaxTable, UscsSolved, wallChecks, WallQFig, WallSolved } from './kit'

const P = '2020-21' as const

// ---------------------------------------------------------------- Q5(b) cup, w given
const CUP5 = [
  { N: 15, w: 66.9 },
  { N: 19, w: 64.6 },
  { N: 24, w: 62.4 },
  { N: 30, w: 60.2 },
  { N: 35, w: 58.7 },
]
const A5c = { P200: 95, LL: 53, PI: 29 }

// ---------------------------------------------------------------- Q6
const SA = { F200: 93, LL: 53, PL: 23 }
const SB = { F200: 10, F4: 92, LL: 38, PL: 27, Cu: 1.8 / 0.08, Cc: (0.5 * 0.5) / (1.8 * 0.08) }
const DS6 = [
  { N: 8, T: 106 },
  { N: 16, T: 149 },
  { N: 32, T: 235 },
]
const S6d = { F200: 100, LL: 84, PL: 45, LLoven: 58 }

// ---------------------------------------------------------------- Q7(d) B and Af
const AB7 = { s3c: 300, s3: 400, B: 0.95, Af: 0.4, env: { c: 0, phi: 30 } }
const ab7 = () => {
  const main = deviatorWithAB(AB7)
  // alternative reading Δu = BΔσ3 + AfΔσd (B applied to the cell increase only)
  const alt = deviatorWithAB({ s3c: AB7.s3 - main.du1, s3: AB7.s3 - main.du1, B: 1, Af: AB7.Af, env: AB7.env })
  return { main, alt, altUf: main.du1 + alt.uf }
}

// ---------------------------------------------------------------- Q8(b) three CU tests, Q8(c) wall
const T8: TriaxTest[] = [
  { s3: 75, dev: 200, u: 25 },
  { s3: 150, dev: 272, u: 50 },
  { s3: 300, dev: 418, u: 100 },
]
const W8: Wall = {
  layers: [
    { h: 3, gamma: 17, phi: 30, c: 0 },
    { h: 5, gamma: 20, gammaSat: 20, phi: 28, c: 10 },
  ],
  zw: 3,
  q: 0,
  state: 'active',
}
const W8q: Wall = { ...W8, q: 30 }

export const A2020: SmQ[] = [
  {
    id: 'sm-2020-21-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 9.67,
    topics: ['sm-class'],
    title: 'Draw the USCS plasticity chart',
    text: 'Draw neatly the Plasticity Chart according to Unified Soil Classification System (USCS) showing the classifications of important soil deposits.',
    pages: [55],
    theory: true,
    solution: () => <Model item={th('sm-class', 't-plchart')} />,
  },
  {
    id: 'sm-2020-21-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 18,
    topics: ['sm-plast'],
    title: "Casagrande flow curve: LL and flow index from five points",
    text: "Liquid limit test was carried out on a silty clay sample using Casagrande's apparatus and the following results were obtained:\n\n- Number of blows: 15, 19, 24, 30, 35\n- Water content (%): 66.9, 64.6, 62.4, 60.2, 58.7\n\nPlot the flow curve and determine the liquid limit of the sample. Also, compute the flow index of the sample.",
    pages: [55],
    given: [],
    checks: () => {
      const f = flowCurve(CUP5)
      return [
        { key: 'LL', label: 'Liquid limit (w at 25 blows)', value: f.LL, unit: '%', tol: 0.015 },
        { key: 'If', label: 'Flow index $I_F$', value: f.If, tol: 0.06 },
      ]
    },
    solution: () => {
      const f = flowCurve(CUP5)
      return (
        <Sol>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <FlowPlot mode="cup" pts={CUP5.map((x) => ({ x: x.N, w: x.w }))} a={f.a} b={f.b} LL={f.LL} />
          </div>
          <Md>{`Plot w (natural scale) against N (log scale); the points lie on a straight line. Best fit: $w = ${f2(f.a)} - ${f2(f.If)}\\log N$.`}</Md>
          <Tex block>{`LL = w(25) = ${f2(f.a)} - ${f2(f.If)}\\log 25 = ${f2(f.LL)}\\%`}</Tex>
          <Md>{`(Interpolating between 24 and 30 blows: ${f2(f.interp)} %.) **Flow index** = slope of the flow curve per log cycle, $I_F = \\dfrac{w_1 - w_2}{\\log(N_2/N_1)}$ read over one cycle of the line, e.g. from N = 10 to 100: $I_F = ${f2(f.wAt(10))} - ${f2(f.wAt(100))} = ${f2(f.If)}$.`}</Md>
          <Result>{`LL ≈ **${f2(f.LL)} %**, flow index $I_F$ ≈ **${f2(f.If)}**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2020-21-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 9,
    topics: ['sm-class'],
    title: 'AASHTO: F200 = 95, LL 53, PL 24 → A-7-6 with GI',
    text: 'For a soil, the following results were obtained from grain size distribution and Atterberg limit tests: Percent finer No. 200 sieve (0.075 mm) = 95, Liquid Limit = 53%, Plastic limit = 24%. Classify the soil based on AASHTO soil classification system.',
    pages: [56, 59],
    given: [{ label: 'Chart 1', what: 'AASHTO classification', ref: 'c-aashto' }],
    checks: () => {
      const a = aashto(A5c)
      return [
        { key: 'pi', label: 'PI', value: 29 },
        { key: 'll30', label: 'LL − 30 (A-7 subgroup test)', value: 23 },
        { key: 'gi', label: 'Group index (whole number)', value: a.gi.gi },
      ]
    },
    solution: () => (
      <Sol>
        <AashtoSolved inp={A5c} lead="PI = 53 − 24 = 29. Chart 1 does not print the group-index formula; use Das eq. 5.1: GI = (F − 35)[0.2 + 0.005(LL − 40)] + 0.01(F − 15)(PI − 10)." />
      </Sol>
    ),
  },
  {
    id: 'sm-2020-21-5d',
    paper: P,
    sec: 'B',
    no: '5(d)',
    marks: 10,
    topics: ['sm-struct', 'sm-shear'],
    title: 'Explain thixotropy and critical void ratio',
    text: 'Explain the following: (i) Thixotropy (ii) Critical void ratio',
    pages: [56],
    theory: true,
    flag: 'Thixotropy and critical void ratio — not in AJK sir’s slides.',
    solution: () => (
      <Models
        parts={[
          {
            title: '(i) Thixotropy (5 marks)',
            md: `- **Definition:** the time-dependent, reversible process by which a clay that has been **remoulded** (softened) at constant water content **regains part of its strength** when left at rest.\n- **Mechanism:** remoulding breaks the flocculated, edge-to-face particle arrangement and disturbs the adsorbed-water layers; at rest the particles and water molecules slowly rearrange into a lower-energy, more flocculated structure and the inter-particle bonds re-form, so strength rises with time.\n- **Sketch:** strength against time — undisturbed strength $s_u$; drop to the remoulded value at remoulding; gradual regain towards (but usually not up to) the original.\n- **Importance:** thixotropic regain explains why pile capacity in clay increases days after driving (set-up), why sensitive clays partly recover after disturbance, and is used in drilling muds (bentonite slurry gels at rest, flows when agitated). Sensitivity $S_t = q_u(\\text{undisturbed})/q_u(\\text{remoulded})$ measures the loss that thixotropy can partly regain.`,
          },
          {
            title: '(ii) Critical void ratio (5 marks)',
            md: `- **Definition** (Casagrande): the void ratio at which a cohesionless soil can be sheared (drained) **without any change in volume**.\n- A sand **looser** than critical ($e > e_{cr}$) contracts during shear; a sand **denser** than critical dilates (after a small initial contraction). Both approach $e_{cr}$ at large strain.\n- $e_{cr}$ is found from drained triaxial tests at the same σ3 and different initial e: plot volume change at failure against initial e; the e where the volume change is zero is $e_{cr}$. It decreases as the confining pressure increases.\n- **Importance:** a saturated sand looser than critical tends to contract under undrained (rapid, e.g. earthquake) loading, so positive pore pressure builds up, effective stress falls and the sand can **liquefy** (flow slides). Denser than critical develops negative pore pressure and gains strength.`,
          },
        ]}
      />
    ),
    notes: ['"Thixotrophy" in print is a misspelling.'],
  },
  {
    id: 'sm-2020-21-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 13,
    topics: ['sm-class'],
    title: 'USCS: soil A (93 % fines, LL 53, PL 23) and soil B (10 % fines, Cu, Cc, fines LL 38, PL 27)',
    text: 'Classify the following two inorganic soils according to Unified Soil Classification System:\n\n**Soil A:** Percent finer No. 200 sieve (0.075 mm) = 93; Liquid Limit = 53%; Plastic Limit = 23%.\n\n**Soil B:** Percent finer No. 4 sieve (4.75 mm) = 92; Percent finer No. 200 sieve (0.075 mm) = 10; $D_{60}$ = 1.8 mm, $D_{30}$ = 0.5 mm, $D_{10}$ = 0.08 mm; Consistency limit of fraction passing No. 200 sieve: Liquid Limit = 38%, Plastic Limit = 27%.',
    pages: [56],
    given: [],
    checks: () => [
      { key: 'piA', label: 'Soil A: PI', value: 30 },
      { key: 'aA', label: 'Soil A: A-line PI at LL 53', value: 0.73 * 33, tol: 0.03 },
      { key: 'cu', label: 'Soil B: $C_u$', value: SB.Cu },
      { key: 'cc', label: 'Soil B: $C_c$', value: SB.Cc },
      { key: 'aB', label: 'Soil B fines: A-line PI at LL 38', value: 0.73 * 18, tol: 0.03 },
    ],
    solution: () => {
      const a = uscs(SA)
      const b = uscs(SB)
      return (
        <Sol>
          <Head>Soil A</Head>
          <UscsSolved inp={SA} />
          <Head>Soil B</Head>
          <Tex block>{`C_u = \\frac{D_{60}}{D_{10}} = \\frac{1.8}{0.08} = ${f2(SB.Cu)},\\qquad C_c = \\frac{D_{30}^2}{D_{60}D_{10}} = \\frac{0.5^2}{1.8\\times0.08} = ${f2(SB.Cc)}`}</Tex>
          <UscsSolved inp={SB} />
          <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[460px]">
            <PlasticityChart
              pts={[
                { LL: 53, PI: 30, label: 'A' },
                { LL: 38, PI: 11, label: 'B fines', color: 'var(--c-accent)' },
              ]}
            />
          </div>
          <Result>{`Soil A: **${a.symbol}, ${a.name.toLowerCase()}** (7 % coarse, < 15 %, so no "with sand"). Soil B: **${b.symbol}, ${b.name.toLowerCase()}** — 82 % sand, 8 % gravel, 10 % fines (5–12 %: dual symbol), well graded (Cu ≥ 6, 1 ≤ Cc ≤ 3), fines plot below the A-line (PI 11 < 13.14) → M.`}</Result>
        </Sol>
      )
    },
    notes: ['No plasticity chart is attached to this paper: the A-line PI = 0.73(LL − 20) must be remembered.'],
  },
  {
    id: 'sm-2020-21-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 17.67,
    topics: ['sm-shear'],
    title: 'CD direct shear (8, 16, 32 kg; 63.5 mm) → c′, φ′, stress history',
    text: 'The following results were obtained in a consolidated drained (CD) direct shear test carried out on a clay sample.\n\n- Specimen 1: normal load 8 kg, peak shear force 106 N\n- Specimen 2: normal load 16 kg, peak shear force 149 N\n- Specimen 3: normal load 32 kg, peak shear force 235 N\n\nDiameter and height of each specimen were 63.5 mm and 25 mm, respectively. Draw the failure envelope and determine the values of effective shear strength parameters from it. Also, comment on the stress history of the sample.',
    pages: [56],
    given: [],
    checks: () => dsChecks(DS6, 63.5, 'kg'),
    solution: () => <DSSolution rows={DS6} dia={63.5} unit="kg" history />,
    notes: ['Contrast with 2021-22 Q7(a): there c′ ≈ 0 (normally consolidated), here c′ ≈ 20 kPa (overconsolidated).'],
  },
  {
    id: 'sm-2020-21-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 10,
    topics: ['sm-shear', 'sm-lep'],
    title: 'Qualitative curves: u vs ε, εv vs strain, Af vs OCR, earth pressure vs tilt',
    text: "Draw the following qualitative curves:\n\n(i) Pore pressure versus axial strain for saturated samples of normally consolidated and overconsolidated clays in consolidated undrained (CU) triaxial compression tests.\n(ii) Volumetric strain versus axial strain for saturated samples of loose sand and dense sand in consolidated drained (CD) direct shear tests.\n(iii) Skempton's pore pressure parameter A at failure ($A_f$) versus overconsolidation ratio (OCR).\n(iv) Variation of the magnitude of lateral earth pressures (at-rest, active and passive) with tilt of wall.",
    pages: [56],
    theory: true,
    flag: "(iii) Skempton's A — not in AJK sir's slides.",
    solution: () => (
      <Models
        parts={[
          { title: '(i)–(iii) Shear curves', item: th('sm-shear', 't-curves') },
          { title: '(iv) Earth pressure vs wall tilt', item: th('sm-lep', 't-tilt') },
        ]}
      />
    ),
    notes: ['"axial strain" in (ii) should be shear displacement for a direct shear test; draw volume change against shear displacement.'],
  },
  {
    id: 'sm-2020-21-6d',
    paper: P,
    sec: 'B',
    no: '6(d)',
    marks: 6,
    topics: ['sm-class'],
    title: 'USCS organic check: LL air-dry 84 %, oven-dry 58 %, PL 45 % → OH',
    text: 'Liquid limit of a soil in air-dry state and oven-dry state were found to be 84% and 58%, respectively. Plastic limit of the soil in air-dry state was 45%. What is the group symbol and group name of the soil according to Unified Soil Classification System (USCS)?',
    pages: [57],
    given: [],
    checks: () => [
      { key: 'r', label: 'LL(oven-dried)/LL(not dried)', value: 58 / 84 },
      { key: 'pi', label: 'PI (air-dried)', value: indices({ LL: 84, PL: 45 }).PI },
      { key: 'a', label: 'A-line PI at LL 84', value: 0.73 * 64, tol: 0.02 },
    ],
    solution: () => {
      const u = uscs(S6d)
      return (
        <Sol>
          <UscsSolved inp={S6d} lead="No grain-size data are given; a soil whose liquid limit is the only question is fine-grained (≥ 50 % passing No. 200) — assumed. Use the air-dried (not oven-dried) LL and PL for the chart." />
          <Result>{`Group symbol **${u.symbol}**, group name **${u.name.toLowerCase()}** (ASTM Fig. 5.6: PI = 39 plots below the A-line at 46.7, so "organic silt"; on or above it would be "organic clay").`}</Result>
        </Sol>
      )
    },
    notes: ['Fines content not given: assumed fine-grained with < 15 % coarser than No. 200, so the name has no "sandy"/"with sand".'],
  },
  {
    id: 'sm-2020-21-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 10,
    topics: ['sm-lep'],
    title: "Concepts of Rankine's active and passive earth pressure",
    text: "Explain the concepts of Rankine's active earth pressure and passive earth pressure.",
    pages: [57],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-concepts')} />,
  },
  {
    id: 'sm-2020-21-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 14,
    topics: ['sm-lep'],
    title: 'φ = 0 clay, 10 m wall: unsupported height and force after the crack',
    text: 'A smooth vertical wall of height 10 m retains a soft clay backfill of unit weight 16.5 kN/m³. Undrained shear strength of the clay backfill is 35 kN/m². For undrained condition ($\\varphi = 0$) of the backfill, calculate the following:\n\n(i) Unsupported height of the wall.\n(ii) Active earth force after tension crack forms. Also, draw the active earth pressure diagram.',
    pages: [57],
    given: [],
    checks: () => clayChecks(10, 16.5, 35, { hc: true }),
    solution: () => <ClaySolution H={10} gamma={16.5} cu={35} hc />,
  },
  {
    id: 'sm-2020-21-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 10.67,
    topics: ['sm-lep'],
    title: "Coulomb's assumptions; passive pressure for a c–φ backfill",
    text: "State the assumptions in Coulomb's theory of earth pressure. Also, deduce an expression for passive earth pressure due to a cohesive frictional (c-φ) backfill.",
    pages: [57],
    theory: true,
    flag: "Coulomb's theory — not in AJK sir's slides this term.",
    solution: () => (
      <Model
        item={th('sm-lep', 't-coulomb')}
        post={`**Passive derivation in full** (Mohr circle at passive failure, the form examiners accept for a c–φ fill): σ′v = γz is now the **minor** principal stress and σp the major. Mohr–Coulomb at failure: $\\sigma_1 = \\sigma_3\\tan^2(45 + \\varphi/2) + 2c\\tan(45 + \\varphi/2)$. Put σ1 = σp, σ3 = γz:\n$$\\sigma_p = \\gamma zK_p + 2c\\sqrt{K_p},\\qquad K_p = \\tan^2(45 + \\varphi/2)$$\nIntegrating over the height: $P_p = \\tfrac12\\gamma H^2K_p + 2cH\\sqrt{K_p}$ — a triangle plus a rectangle (no tension zone in the passive case), acting at $\\bar z = \\dfrac{\\tfrac16\\gamma H^3K_p + cH^2\\sqrt{K_p}}{P_p}$ above the base.`}
      />
    ),
  },
  {
    id: 'sm-2020-21-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 12,
    topics: ['sm-shear'],
    title: 'NC clay: undrained cell increase 300 → 400 kPa, B = 0.95, Af = 0.4, φ′ = 30° → deviator at failure',
    text: 'A specimen of normally consolidated clay sample was fully consolidated in the triaxial cell under a cell pressure of 300 kN/m². Pore pressure within the specimen at the end of consolidation was zero. Then, under undrained conditions the cell pressure was increased to 400 kN/m² and deviator stress was applied and increased until failure took place. Pore pressure parameters B and $A_f$ of the specimen were found to be 0.95 and 0.4, respectively. If effective angle of internal friction ($\\varphi\'$) of the specimen is 30°, what would be the value of deviator stress at failure for this specimen?',
    pages: [57],
    given: [],
    flag: "Skempton's pore-pressure parameters — not in AJK sir's slides.",
    checks: () => {
      const r = ab7()
      return [
        { key: 'du1', label: 'Δu from the cell increase, BΔσ3', value: r.main.du1, unit: 'kPa' },
        { key: 'D', label: 'Deviator stress at failure', value: r.main.D, unit: 'kPa', tol: 0.03 },
        { key: 'uf', label: 'Pore pressure at failure', value: r.main.uf, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = ab7()
      const kp = 1 / Ka(30)
      return (
        <Sol>
          <Md>{`Skempton: $\\Delta u = B[\\Delta\\sigma_3 + A(\\Delta\\sigma_1 - \\Delta\\sigma_3)]$. NC clay → c′ = 0, so at failure $\\sigma'_1 = \\sigma'_3K_p$ with $K_p = \\tan^2(45 + 15) = ${f3(kp)}$.`}</Md>
          <Tex block>{`\\text{Cell increase (undrained): } \\Delta u_1 = B\\Delta\\sigma_3 = 0.95(400 - 300) = ${f2(r.main.du1)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\text{Shear: } \\Delta u_2 = BA_f\\Delta\\sigma_d = 0.95(0.4)\\Delta\\sigma_d = 0.38\\,\\Delta\\sigma_d`}</Tex>
          <Tex block>{`\\sigma'_{3f} = 400 - ${f2(r.main.du1)} - 0.38\\Delta\\sigma_d,\\qquad \\sigma'_{1f} = \\sigma'_{3f} + \\Delta\\sigma_d = ${f3(kp)}\\,\\sigma'_{3f}`}</Tex>
          <Tex block>{`\\Delta\\sigma_d = (K_p - 1)\\sigma'_{3f} = 2(${f2(400 - r.main.du1)} - 0.38\\Delta\\sigma_d) \\Rightarrow \\Delta\\sigma_d = \\frac{2(${f2(400 - r.main.du1)})}{1 + 2(0.38)} = ${f2(r.main.D)}\\ \\text{kPa}`}</Tex>
          <Md>{`Check: $u_f = ${f2(r.main.du1)} + 0.38(${f2(r.main.D)}) = ${f2(r.main.uf)}$ kPa, $\\sigma'_{3f} = ${f2(r.main.s3f)}$, $\\sigma'_{1f} = ${f2(r.main.s1f)}$, ratio ${f3(r.main.s1f / r.main.s3f)} = $K_p$ ✓.`}</Md>
          <Result>{`$\\Delta\\sigma_{d,f}$ ≈ **${f2(r.main.D)} kPa** ($u_f$ = ${f2(r.main.uf)} kPa). If the shear increment is taken as $\\Delta u = A_f\\Delta\\sigma_d$ (B = 1 during shear, B only on the cell increase): $\\Delta\\sigma_d = 2(${f2(400 - r.main.du1)})/(1 + 2(0.4)) = ${f2(r.alt.D)}$ kPa, $u_f$ = ${f2(r.altUf)} kPa — either reading is accepted if stated.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2020-21-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10.67,
    topics: ['sm-shear'],
    title: 'UU behaviour of saturated clay; two CU field cases',
    text: 'Describe briefly the behavior of saturated clay samples in unconsolidated undrained (UU) triaxial compression test. Also, show with neat sketches two examples of consolidated undrained (CU) analyses in clays.',
    pages: [57],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'UU behaviour of saturated clay', item: th('sm-shear', 't-uu') },
          { title: 'CU analyses in clays (sketches)', item: th('sm-shear', 't-cases') },
        ]}
      />
    ),
    notes: ['Only the UU-behaviour paragraph of the first answer and the CU half of the second are needed here.'],
  },
  {
    id: 'sm-2020-21-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 18,
    topics: ['sm-shear'],
    title: 'Three CU tests: modified failure envelope (p′–q) → c′, φ′',
    text: 'The following results were obtained at failure in a series of consolidated undrained (CU) triaxial compression tests performed on three specimens of a saturated clay sample:\n\n- Specimen 1: cell pressure 75 kN/m², deviator stress 200 kN/m², pore pressure 25 kN/m²\n- Specimen 2: cell pressure 150 kN/m², deviator stress 272 kN/m², pore pressure 50 kN/m²\n- Specimen 3: cell pressure 300 kN/m², deviator stress 418 kN/m², pore pressure 100 kN/m²\n\nDraw the Modified Failure Envelope and hence estimate the values of effective shear strength parameters $c\'$ and $\\varphi\'$ from it. Also, write down the Mohr-Coulomb equation for the effective stress failure envelope.',
    pages: [57, 58],
    given: [],
    checks: () => {
      const e = triaxCircles(T8).eff!
      const f = fitCircles(e)
      return [
        ...e.map((c, i) => ({ key: `p${i}`, label: `p′ = (σ′1 + σ′3)/2, specimen ${i + 1}`, value: c.C, unit: 'kPa' })),
        ...e.map((c, i) => ({ key: `q${i}`, label: `q = (σ1 − σ3)/2, specimen ${i + 1}`, value: c.R, unit: 'kPa' })),
        { key: 'al', label: 'Slope angle α of the Kf line', value: f.alpha, unit: '°', tol: 0.03 },
        { key: 'a', label: 'Intercept a', value: f.a, unit: 'kPa', tol: 0.06 },
        { key: 'phi', label: "$\\varphi' = \\sin^{-1}(\\tan\\alpha)$", value: f.phi, unit: '°', tol: 0.03 },
        { key: 'c', label: "$c' = a/\\cos\\varphi'$", value: f.c, unit: 'kPa', tol: 0.06 },
      ]
    },
    solution: () => {
      const e = triaxCircles(T8).eff!
      const f = fitCircles(e)
      return (
        <Sol>
          <Md>{`The **modified failure envelope** ($K_f$ line) joins the tops of the effective Mohr circles at failure, plotted as $q = (\\sigma_1 - \\sigma_3)/2$ against $p' = (\\sigma'_1 + \\sigma'_3)/2$. If it is $q = a + p'\\tan\\alpha$, the Mohr–Coulomb envelope has $\\sin\\varphi' = \\tan\\alpha$ and $c' = a/\\cos\\varphi'$.`}</Md>
          <TriaxTable tests={T8} />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <PQPlot pts={e.map((c) => ({ p: c.C, q: c.R }))} a={f.a} alpha={f.alpha} />
          </div>
          <FitText cs={e} prime />
          <MohrPlot eff={e} envE={f} />
          <Result>{`$\\alpha$ = ${f2(f.alpha)}°, $a$ = ${f2(f.a)} kPa → $\\varphi'$ = **${f2(f.phi)}°**, $c'$ = **${f2(f.c)} kPa**. Mohr–Coulomb (effective): $\\tau_f = ${f2(f.c)} + \\sigma'\\tan ${f2(f.phi)}°$ kPa. (A hand-drawn line through the three points gives about the same within ±1°.)`}</Result>
        </Sol>
      )
    },
    notes: ['"Modified failure envelope" (p–q / Kf line) is not named in AJK sir’s slides; the Mohr-circle tangent gives the same c′ and φ′.'],
  },
  {
    id: 'sm-2020-21-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 18,
    topics: ['sm-lep'],
    title: 'Rankine active, two layers (sand over c′–φ′ soil), WT at 3 m; increase from q = 30 kPa',
    text: "For the retaining wall of height 8 m shown in Fig. 4, draw Rankine's active pressure diagram and determine the total active earth force per metre length of the wall. If the backfill supports a uniformly distributed load of 30 kN/m², what will be the increase in active force per metre length of the wall?\n\nFig. 4: upper layer 3 m — $\\gamma_{moist}$ = 17 kN/m³, $c'$ = 0, $\\varphi'$ = 30°; water table at 3 m; lower layer 5 m — $\\gamma_{sat}$ = 20 kN/m³, $c'$ = 10 kN/m², $\\varphi'$ = 28°.",
    pages: [58, 59],
    given: [],
    figure: () => <WallQFig w={W8} />,
    checks: () => {
      const r = solveWall(W8),
        r2 = solveWall(W8q)
      return [...wallChecks(W8), { key: 'Fq', label: 'Total force with q = 30 kPa', value: r2.Fs, unit: 'kN/m' }, { key: 'dF', label: 'Increase in active force', value: r2.Fs - r.Fs, unit: 'kN/m' }]
    },
    solution: () => {
      const r = solveWall(W8),
        r2 = solveWall(W8q)
      return (
        <Sol>
          <WallSolved
            w={W8}
            r={r}
            lead="Active Rankine, layer by layer. σ′v is continuous at 3 m but K changes, so the diagram jumps there. Layer 2 has c′ = 10 kPa: σ′h = σ′vKa2 − 2c′√Ka2 (positive at its top, so no tension zone). Water below 3 m separately."
          />
          <Head>With q = 30 kPa on the backfill</Head>
          <Md>{`The surcharge adds $qK_a$ in each layer (a rectangle) and nothing to the water: $\\Delta P = 30(${f3(r.K[0])})(3) + 30(${f3(r.K[1])})(5) = ${f2(30 * r.K[0] * 3)} + ${f2(30 * r.K[1] * 5)} = ${f2(30 * r.K[0] * 3 + 30 * r.K[1] * 5)}$ kN/m. Re-solving the whole wall with q = 30 gives ${f2(r2.Fs)} kN/m (vs ${f2(r.Fs)}), the same increase.`}</Md>
          <Result>{`Total active force (soil + water) = **${f2(r.Fs)} kN/m** at ${f2(r.zbar)} m above the base (soil alone ${f2(r.Fs - r.waterF)}, water ${f2(r.waterF)} kN/m). Increase from q = 30 kPa = **${f2(r2.Fs - r.Fs)} kN/m**.`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 4 is hand-drawn on p59 (the printed "Fig. 1" label there is struck out).', 'Layer 1 is above the WT, so its γmoist is used; layer 2 uses γ′ = 20 − 9.81.'],
  },
]

