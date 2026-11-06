// CE 341 term final 2010-11 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1–Q4, answer any THREE, 23⅓ per part), held 1 Feb 2012, PDF pp. 15–16; unnumbered figure in Q4(a) on p16.
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { integrateWall, K0, lineLoadSigma, pointLoadSigma, solveWall, type Wall } from '../../engine/earth'
import { aLine, indices, linearFromVS, onePointCup, piFromLS, slFromE, srFromE, volShrink } from '../../engine/plasticity'
import { cuFromDeviator } from '../../engine/shear'
import { MohrFig } from '../../topics/shear/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, CDSandSolution, cdSandChecks, CE, CT, f1, f2, f3, Frame, Head, Model, ProfilePlot, Result, Sol, SlopingSolution, slopingChecks, SurchargeFig, Tbl, th, UscsSolved, wallChecks, WallQFig, WallSolved } from './old-kit'

const P = '2010-11' as const

// ---------------------------------------------------------------- Q1(a)
const q1 = () => {
  const LL = onePointCup(45, 28)
  const k = indices({ LL, PL: 18.2, w: 40 })
  const SL = slFromE(0.4, 2.7)
  const SR = srFromE(0.4, 2.7)
  const VS = volShrink(LL, SL, SR)
  return { LL, k, SL, SR, VS, LS: linearFromVS(VS), LSpi: k.PI / piFromLS(1) }
}

// ---------------------------------------------------------------- Q2(b)
const U2 = { F200: 96.9, F4: 100, LL: 20, PL: 14, Cu: 1.4, Cc: 1.03 }
const A2 = { P200: 96.9, LL: 20, PI: 6 }

// ---------------------------------------------------------------- Q3(a) two undrained clay layers
const W3: Wall = {
  layers: [
    { h: 4, gamma: 18.6, phi: 0, c: 18, name: 'top clay' },
    { h: 6, gamma: 20, phi: 0, c: 24, name: 'bottom clay' },
  ],
  zw: null,
  q: 0,
  state: 'active',
}

// ---------------------------------------------------------------- Q3(b) OC sand, sloping backfill
const S3 = { H: 6, gamma: 18, phi: 33, beta: 18, OCR: 3 }
const k03 = K0.mayne(S3.phi, S3.OCR)
const W3b: Wall = { layers: [{ h: S3.H, gamma: S3.gamma, phi: S3.phi, c: 0, K0: k03 }], zw: null, q: 0, state: 'rest' }

// ---------------------------------------------------------------- Q4(a) point + line load
const L4 = { H: 6, Q: 300, xQ: 1.2, q: 100, xq: 2.4 }
const sP = (z: number) => pointLoadSigma(L4.Q, L4.xQ, L4.H, z)
const sL = (z: number) => lineLoadSigma(L4.q, L4.xq, L4.H, z)
const q4 = () => {
  const p = integrateWall(sP, L4.H)
  const l = integrateWall(sL, L4.H)
  const t = integrateWall((z) => sP(z) + sL(z), L4.H)
  const zs = [0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0]
  return { p, l, t, zs }
}

export const A2010: SmQ[] = [
  {
    id: 'sm-2010-11-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 23.33,
    topics: ['sm-plast'],
    title: 'One-point LL (45 % at 28 blows), consistency state, SL from e = 0.40, linear shrinkage',
    text: 'In a liquid limit test by the one point method, a soil sample showed a water content of 45% against a number of blows of 28. The plastic limit of the soil was 18.2% and the natural moisture content was 40%. What was the state of consistency of the soil? What is the shrinkage limit of the soil if the void ratio at the shrinkage limit is 0.40? Given that degree of saturation $S_r = wG/e$. Assume G = 2.70. Also calculate the linear shrinkage of the soil.',
    pages: [15],
    flag: 'One-point LL, shrinkage limit and linear shrinkage — not in AJK sir’s slides.',
    given: [],
    checks: () => {
      const r = q1()
      return [
        { key: 'LL', label: 'Liquid limit (one-point method)', value: r.LL, unit: '%' },
        { key: 'PI', label: 'Plasticity index', value: r.k.PI, unit: '%' },
        { key: 'LI', label: 'Liquidity index', value: r.k.LI, tol: 0.02 },
        { key: 'SL', label: 'Shrinkage limit', value: r.SL, unit: '%' },
        { key: 'SR', label: 'Shrinkage ratio $G/(1 + e)$', value: r.SR, tol: 0.01 },
        { key: 'LS', label: 'Linear shrinkage', value: r.LS, unit: '%', tol: 0.03 },
      ]
    },
    solution: () => {
      const r = q1()
      return (
        <Sol>
          <Head>Liquid limit (one-point cup method)</Head>
          <Tex block>{`LL = w_N\\left(\\frac{N}{25}\\right)^{0.121} = 45\\left(\\frac{28}{25}\\right)^{0.121} = ${f2(r.LL)}\\ \\%`}</Tex>
          <Head>State of consistency</Head>
          <Tex block>{`PI = ${f2(r.LL)} - 18.2 = ${f2(r.k.PI)},\\quad LI = \\frac{w - PL}{PI} = \\frac{40 - 18.2}{${f2(r.k.PI)}} = ${f3(r.k.LI)},\\quad CI = 1 - LI = ${f3(r.k.CI)}`}</Tex>
          <Md>{`PL = 18.2 % < w = 40 % < LL = ${f1(r.LL)} % → **plastic state**, close to the liquid limit (LI ≈ ${f2(r.k.LI)}): a **soft** clay of low strength.`}</Md>
          <Head>Shrinkage limit</Head>
          <Md>{`At the shrinkage limit the soil is still saturated (S = 1) at its minimum volume, so $1 = w_{SL}G/e_{SL}$:`}</Md>
          <Tex block>{`SL = \\frac{e_{SL}}{G} = \\frac{0.40}{2.70} = ${f2(r.SL)}\\ \\%`}</Tex>
          <Head>Linear shrinkage</Head>
          <Md>{`Shrinkage ratio $SR = \\dfrac{\\gamma_d}{\\gamma_w} = \\dfrac{G}{1 + e_{SL}} = \\dfrac{2.70}{1.40} = ${f3(r.SR)}$. The linear-shrinkage bar starts at the LL, so the volumetric shrinkage (as % of the dry volume) is`}</Md>
          <Tex block>{`VS = (LL - SL)\\,SR = (${f2(r.LL)} - ${f2(r.SL)})(${f3(r.SR)}) = ${f2(r.VS)}\\ \\%`}</Tex>
          <Tex block>{`LS = \\left[1 - \\left(\\frac{100}{VS + 100}\\right)^{1/3}\\right]\\times100 = \\left[1 - \\left(\\frac{100}{${f2(r.VS + 100)}}\\right)^{1/3}\\right]\\times100 = ${f2(r.LS)}\\ \\%`}</Tex>
          <Result>{`LL = **${f1(r.LL)} %**, plastic state (LI = ${f2(r.k.LI)}); SL = **${f1(r.SL)} %**; linear shrinkage ≈ **${f1(r.LS)} %** (the rough rule PI ≈ 2.13 LS gives ${f1(r.LSpi)} %).`}</Result>
        </Sol>
      )
    },
    notes: ['The one-point formula LL = wN(N/25)^0.121 and the linear-shrinkage relation are textbook (Das / IS) forms, not slide content.', 'Linear shrinkage is taken from the LL (the standard bar test starts at the LL).'],
  },
  {
    id: 'sm-2010-11-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Derive Rankine active pressure at depth h in a c–φ soil and the thrust on a wall of height H',
    text: "Derive an expression for active earth pressure at a depth h in a c − φ soil. Also find the magnitude of active thrust coming to a retaining wall having height H, due to this backfill soil. Use Rankine's method.",
    pages: [15],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-cphi')} />,
    notes: ['Printed "achieve earth pressure" read as "active earth pressure".'],
  },
  {
    id: 'sm-2010-11-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CU test (σ3 = 50, σ1f = 86.2 kPa): qu of a similar specimen consolidated under 50 kPa',
    text: 'A consolidated undrained test was conducted on a saturated clay specimen. The cell pressure was 50 kPa and the failure $\\sigma_1$ was 86.2 kPa. If a similar specimen, which is first consolidated under 50 kPa cell pressure, is then tested in an unconfined compression device, what will be the unconfined compression strength $q_u$?',
    pages: [15],
    given: [],
    checks: () => [
      { key: 'dev', label: 'Deviator at failure in the CU test', value: 86.2 - 50, unit: 'kPa' },
      { key: 'cu', label: 'Undrained strength $c_u$', value: cuFromDeviator(86.2 - 50), unit: 'kPa' },
      { key: 'qu', label: 'Unconfined compressive strength $q_u$', value: 2 * cuFromDeviator(86.2 - 50), unit: 'kPa' },
    ],
    solution: () => {
      const cu = cuFromDeviator(86.2 - 50)
      return (
        <Sol>
          <Md>{`Both specimens are consolidated under the same 50 kPa, so they have the **same water content and void ratio**. Sheared undrained, a saturated clay's strength depends only on its water content — the cell pressure during shear changes u, not σ′ (φu = 0). So the undrained strength is the same in the CU test and in the unconfined test:`}</Md>
          <Tex block>{`c_u = \\frac{(\\sigma_1 - \\sigma_3)_f}{2} = \\frac{86.2 - 50}{2} = ${f2(cu)}\\ \\text{kPa},\\qquad q_u = 2c_u = ${f2(2 * cu)}\\ \\text{kPa}`}</Tex>
          <Frame>
            <MohrFig
              height={220}
              circles={[
                { c: { C: 50 + cu, R: cu, s1: 86.2, s3: 50 }, color: CT, label: 'CU, σ3 = 50' },
                { c: { C: cu, R: cu, s1: 2 * cu, s3: 0 }, color: CE, label: 'unconfined', dash: true },
              ]}
              envs={[{ env: { c: cu, phi: 0 }, color: 'var(--c-load)', label: `φu = 0: τ = cu = ${f1(cu)} kPa` }]}
            />
          </Frame>
          <Result>{`$q_u$ = **${f1(2 * cu)} kPa** (cu = ${f1(cu)} kPa). The circle simply shifts left by 50 kPa with the same diameter.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "qa" read as qu.', 'Assumes the unconfined specimen keeps the water content it had after consolidation (no swelling when the cell pressure is removed).'],
  },
  {
    id: 'sm-2010-11-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 23.33,
    topics: ['sm-class'],
    title: 'USCS and AASHTO: 96.9 % fines, LL 20, PI 6 (CL-ML band; GI)',
    text: 'The following data were obtained from a laboratory test on a soil: percentage of particles finer than 4.75 mm = 100; percentage of particles finer than 75 µm = 96.9; uniformity coefficient = 1.40; coefficient of curvature = 1.03; liquid limit = 20; plasticity index = 6. Classify the soil as per both USCS and AASHTO.',
    pages: [15],
    given: [],
    checks: () => {
      const a = aashto(A2)
      return [
        { key: 'aline', label: 'A-line PI at LL = 20', value: aLine(20), tol: 0.01 },
        { key: 't1', label: 'GI, LL term $(F-35)[0.2 + 0.005(LL-40)]$', value: a.gi.t1, tol: 0.02 },
        { key: 't2', label: 'GI, PI term $0.01(F-15)(PI-10)$', value: a.gi.t2, tol: 0.02 },
        { key: 'gi', label: 'Group index (whole number)', value: a.gi.gi, tol: 0.001 },
      ]
    },
    solution: () => {
      const u = uscs(U2)
      const a = aashto(A2)
      return (
        <Sol>
          <Head>USCS</Head>
          <UscsSolved inp={U2} />
          <Md>{`Cu and Cc are distractors here: the grading letters (W/P) apply only to coarse-grained soils.`}</Md>
          <Head>AASHTO</Head>
          <AashtoSolved inp={A2} />
          <Result>{`USCS **${u.symbol}** (${u.name.toLowerCase()}); AASHTO **${a.label}** — the negative PI term (PI below 10) reduces the GI.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "Uniformly co-efficient" read as uniformity coefficient.'],
  },
  {
    id: 'sm-2010-11-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Two undrained clay layers (cu 18 / 24 kPa) behind a 10 m wall: tension zone, Pa after the crack, its location',
    text: 'A vertical wall 10 m high retains two horizontal layers of saturated cohesive backfill with a level surface. The top 4 m of the backfill has an undrained cohesion of 18 kPa and a bulk unit weight of 18.6 kN/m³. The bottom clay layer has a bulk unit weight and an undrained cohesion of 20 kN/m³ and 24 kPa respectively. Estimate the likely depth of the tension zone behind the wall. Draw the pressure distribution diagram and calculate the total active force if a tension crack develops. Also locate the point of application of the resultant lateral force.',
    pages: [15],
    given: [],
    figure: () => <WallQFig w={W3} />,
    checks: () => wallChecks(W3, { before: true }),
    solution: () => (
      <WallSolved
        w={W3}
        lead="Saturated clay, undrained (short-term) analysis: φu = 0, so Ka = 1 and σa = σv − 2cu in each layer, using the bulk (total) unit weights; no water table is given, so no separate water pressure. The negative zone at the top becomes a tension crack, $z_c = 2c_{u1}/\gamma_1$, and is dropped. At the interface σv is continuous but 2cu changes, so the diagram steps back."
      />
    ),
    notes: ['No water table given: total-stress (φ = 0) analysis with the bulk unit weights, no separate water pressure.'],
  },
  {
    id: 'sm-2010-11-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'OC sand (OCR 3) with an 18° backfill slope: at-rest and active horizontal thrust on a 6 m wall',
    text: 'A retaining wall of height 6 m retains backfill soil with a surface slope of 18°. The soil has the following properties: c = 0, φ = 33°, γ = 18 kN/m³ and OCR = 3. Draw the lateral pressure distribution diagram and calculate the magnitude of horizontal thrust coming to the wall for the following conditions: (i) the wall is restricted from any movement; (ii) the wall has yielded sufficiently to allow the backfill soil a moving tendency in the outward and downward directions.',
    pages: [16],
    flag: 'Sloping backfill — not in AJK sir’s slides this term (the at-rest OCR formula is).',
    given: [],
    checks: () => {
      const r = solveWall(W3b)
      return [
        { key: 'k0', label: '(i) $K_0 = (1 - \\sin\\varphi)OCR^{\\sin\\varphi}$', value: k03, tol: 0.01 },
        { key: 'p0', label: '(i) At-rest thrust ½K0γH² (slope ignored)', value: r.Fs, unit: 'kN/m' },
        ...slopingChecks(S3.H, S3.gamma, S3.phi, S3.beta),
      ]
    },
    solution: () => {
      const r = solveWall(W3b)
      const sb = Math.sin((S3.beta * Math.PI) / 180)
      return (
        <Sol>
          <Head>(i) Wall restricted from any movement → at rest</Head>
          <Tex block>{`K_0 = (1 - \\sin 33^\\circ)(3)^{\\sin 33^\\circ} = ${f3(1 - Math.sin((33 * Math.PI) / 180))}\\times${f3(3 ** Math.sin((33 * Math.PI) / 180))} = ${f3(k03)}`}</Tex>
          <Tex block>{`\\sigma'_h(H) = K_0\\gamma H = ${f3(k03)}\\times18\\times6 = ${f2(k03 * 18 * 6)}\\ \\text{kPa},\\qquad P_0 = \\tfrac12K_0\\gamma H^2 = ${f2(r.Fs)}\\ \\text{kN/m at } H/3 = 2\\ \\text{m}`}</Tex>
          <Md>{`The slide formulas are for a level ground surface. For the 18° slope a common correction is $K_{0\\beta} = K_0(1 + \\sin\\beta)$ = ${f3(k03 * (1 + sb))}, giving ${f1(r.Fs * (1 + sb))} kN/m — mention it as an upper estimate.`}</Md>
          <Head>(ii) Wall yields outward and downward → Rankine active, sloping backfill</Head>
          <SlopingSolution H={S3.H} gamma={S3.gamma} phi={S3.phi} beta={S3.beta} />
          <Md>{`Both diagrams are triangles (c = 0, no water): zero at the top, maximum at the base, resultant at H/3 above the base.`}</Md>
          <Result>{`(i) at rest: **${f1(r.Fs)} kN/m** horizontal (level-ground K0); (ii) active: horizontal component **${f1(slopingChecks(S3.H, S3.gamma, S3.phi, S3.beta).find((c) => c.key === 'ph')!.value)} kN/m**, both at 2 m above the base.`}</Result>
        </Sol>
      )
    },
    notes: ['At rest with a sloping surface is not covered by the K0 formulas; the level-ground value is the main answer and the (1 + sin β) correction is quoted.'],
  },
  {
    id: 'sm-2010-11-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Lateral pressure on a 6 m wall from a 300 kN point load (1.2 m) and a 100 kN/m line load (2.4 m)',
    text: 'The figure below shows surcharge loads (a point load and a line load) on the horizontal backfill. Compute and plot the induced lateral pressure distribution against the vertical wall due to the combination of the surcharge loads. Compute it along the nearest wall face of the point load.\n\n(Wall H = 6 m; point load Q = 300 kN at 1.2 m from the wall; line load q = 100 kN/m parallel to the wall a further 1.2 m out; backfill γ = 19.2 kN/m³, c = 0, φ = 35°.)',
    pages: [16],
    flag: 'Lateral pressure from point and line loads — not in AJK sir’s slides this term.',
    given: [{ label: 'Point / line load formulas', what: 'not printed this year (Terzaghi–Spangler)', ref: 'e-wallload', formula: true }],
    figure: () => (
      <SurchargeFig
        H={L4.H}
        loads={[
          { x: L4.xQ, label: 'Point load Q = 300 kN', kind: 'point' },
          { x: L4.xq, label: 'Line load q = 100 kN/m', kind: 'line' },
        ]}
        soil={['Backfill soil: γ = 19.2 kN/m³', 'c = 0, φ = 35°']}
      />
    ),
    checks: () => {
      const r = q4()
      return [
        { key: 's12', label: 'σh at z = 1.2 m (point + line)', value: sP(1.2) + sL(1.2), unit: 'kPa', tol: 0.03 },
        { key: 's24', label: 'σh at z = 2.4 m', value: sP(2.4) + sL(2.4), unit: 'kPa', tol: 0.03 },
        { key: 's48', label: 'σh at z = 4.8 m', value: sP(4.8) + sL(4.8), unit: 'kPa', tol: 0.03 },
        { key: 'Pp', label: 'Resultant from the point load (this section)', value: r.p.P, unit: 'kN/m', tol: 0.03 },
        { key: 'Pl', label: 'Resultant from the line load', value: r.l.P, unit: 'kN/m', tol: 0.03 },
        { key: 'P', label: 'Total resultant', value: r.t.P, unit: 'kN/m', tol: 0.03 },
        { key: 'arm', label: '… acting above the base', value: r.t.arm, unit: 'm', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = q4()
      return (
        <Sol>
          <Md>{`Terzaghi / Gerber–Spangler modified Boussinesq (rigid wall), $m = x/H$, $n = z/H$:`}</Md>
          <Md>{`- **Point load**, $m = 1.2/6 = 0.2 \\le 0.4$: $\\sigma_h = \\dfrac{0.28Q}{H^2}\\,\\dfrac{n^2}{(0.16 + n^2)^3}$ (on the section through the load, α = 0).\n- **Line load**, $m = 2.4/6 = 0.4 \\le 0.4$ (exactly on the boundary — the m ≤ 0.4 form): $\\sigma_h = \\dfrac{0.203q}{H}\\,\\dfrac{n}{(0.16 + n^2)^2}$.`}</Md>
          <Tbl
            head={['z (m)', 'n', 'σh point (kPa)', 'σh line (kPa)', 'Total (kPa)']}
            rows={r.zs.map((z) => [f2(z), f2(z / L4.H), f2(sP(z)), f2(sL(z)), f2(sP(z) + sL(z))])}
          />
          <Frame>
            <ProfilePlot
              H={L4.H}
              curves={[
                { f: sP, color: 'var(--c-load)', label: 'point load', dash: true },
                { f: sL, color: 'var(--c-accent2)', label: 'line load', dash: true },
                { f: (z) => sP(z) + sL(z), color: 'var(--c-accent)', label: 'combined' },
              ]}
            />
          </Frame>
          <Md>{`Integrating down the wall (Simpson, 400 strips): point load ${f1(r.p.P)} kN/m at ${f2(r.p.arm)} m above the base, line load ${f1(r.l.P)} kN/m at ${f2(r.l.arm)} m (≈ ${f3(r.l.P / L4.q)}q).`}</Md>
          <Result>{`Combined lateral pressure peaks at about ${f1(Math.max(...Array.from({ length: 61 }, (_, i) => sP((i * L4.H) / 60) + sL((i * L4.H) / 60))))} kPa near z ≈ 1.5 m; resultant ≈ **${f1(r.t.P)} kN/m** acting **${f2(r.t.arm)} m** above the base (on the section opposite the point load). The backfill's own Rankine pressure is extra and was not asked.`}</Result>
        </Sol>
      )
    },
    notes: ['No formulas are printed this year; the Terzaghi–Spangler forms printed in 2007-08 Q4(a) and 2009-10 Q2(b) are used.', 'm = 0.4 for the line load sits exactly on the branch boundary; the m ≤ 0.4 form is used.', 'Printed "Compute the Plot" read as "compute and plot".'],
  },
  {
    id: 'sm-2010-11-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CD test on sand (σ3 = 100, Δσ = 250): φ, failure plane, τf, τmax and its plane',
    text: "In a consolidated drained triaxial test, a specimen of saturated sand fails under an additional axial stress of 250 kN/m² when the cell pressure is 100 kN/m². Draw the Mohr's circle diagram for the stress conditions. Determine the shear strength parameter and the theoretical inclination of the failure plane to the horizontal. What is the shear stress on the failure plane and the maximum shear stress that developed? What is the orientation of the plane of maximum shear stress?",
    pages: [16],
    given: [],
    checks: () => cdSandChecks(100, 250),
    solution: () => <CDSandSolution s3={100} dev={250} />,
    notes: ['Same data as 2012-13 Q4.'],
  },
]

