// CE 341 term final 2009-10 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1 compulsory, five parts × 8, + any TWO of Q2–Q4), held 6 Dec 2010, PDF pp. 10–12; Fig. 1 for Q4(b) (sheet pile) on p12.
import { Md, Tex } from '../../../components/ui'
import { aashto, fromCuCc } from '../../engine/classify'
import { integrateWall, Ka, Kp, lineLoadSigma, rankineSloping, sheetPileD, solveWall, type Wall } from '../../engine/earth'
import { coneLL, indices } from '../../engine/plasticity'
import { GradingCurve } from '../../topics/class/figs'
import { FlowPlot } from '../../topics/plast/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, cuCdChecks, CuCdSolution, f1, f2, f3, f4, Frame, Head, Model, Models, ProfilePlot, Result, SheetPileFig, Sol, SurchargeFig, th, WallQFig, WallSolved } from './old-kit'

const P = '2009-10' as const
const rad = (d: number) => (d * Math.PI) / 180

// ---------------------------------------------------------------- Q2(a)
const D2 = fromCuCc(0.075, 3.0, 1.92)
const GSD2 = [
  { d: 4.75, pf: 100 },
  { d: 0.425, pf: 80 },
  { d: 0.075, pf: 60 },
  { d: D2.D30, pf: 30 },
  { d: D2.D10, pf: 10 },
]
const A2 = { P40: 80, P200: 60, LL: 43, PI: 43 - 15 }

// ---------------------------------------------------------------- Q2(b) line load
const L2 = { q: 25, x: 3.5, H: 6 }
const sL2 = (z: number) => lineLoadSigma(L2.q, L2.x, L2.H, z)

// ---------------------------------------------------------------- Q3(a) fall cone
const CONE3 = [
  { d: 7.8, w: 45 },
  { d: 14.8, w: 53 },
  { d: 22.0, w: 60 },
  { d: 32.0, w: 68 },
]
const q3a = () => {
  const f = coneLL(CONE3)
  return { f, k: indices({ LL: f.LL, PL: 35, w: 40 }), ki: indices({ LL: f.interp, PL: 35, w: 40 }) }
}

// ---------------------------------------------------------------- Q3(b) cinder replacement
const B3 = { H: 6.3, g: 16.2, Pa: 75, top: 2.8, gc: 8.2 }
const q3b = () => {
  const ka = (2 * B3.Pa) / (B3.g * B3.H * B3.H)
  const phi = (Math.asin((1 - ka) / (1 + ka)) * 180) / Math.PI
  const fill = B3.H - B3.top
  const wallFor = (cinder: number): Wall => ({
    layers: [
      { h: cinder, gamma: B3.gc, phi, c: 0, name: 'cinder' },
      { h: fill, gamma: B3.g, phi, c: 0, name: 'original fill' },
    ],
    zw: null,
    q: 0,
    state: 'active',
  })
  const replaced = solveWall(wallFor(B3.top)).Fs
  // Pa(a) = Ka[½γc a² + γc a·fill + ½γ fill²] = Pa  →  quadratic in the cinder thickness a
  const A = 0.5 * B3.gc,
    Bq = B3.gc * fill,
    Cq = 0.5 * B3.g * fill * fill - B3.Pa / ka
  const a = (-Bq + Math.sqrt(Bq * Bq - 4 * A * Cq)) / (2 * A)
  const w = wallFor(a)
  return { ka, phi, fill, replaced, a, h: a - B3.top, Hn: a + fill, w, check: solveWall(w).Fs, A, Bq, Cq }
}

// ---------------------------------------------------------------- Q4(a)
const CC4 = { z: 15, gsat: 19.8, ccu: 48.3, phicu: 13, cd: 41.4, phid: 23 }

// ---------------------------------------------------------------- Q4(b) sheet pile
const SP4 = { H: 6, beta: 18.2, phi: 30, gamma: 17 }
const q4b = () => {
  const s = rankineSloping(SP4.phi, SP4.beta)
  const kp = Kp(SP4.phi)
  const D = sheetPileD({ H: SP4.H, kaH: s.kaH, kp })
  const Dalt = SP4.H * Math.sqrt(s.kaH / kp)
  const Pa = 0.5 * SP4.gamma * (SP4.H + D) ** 2 * s.kaH
  const Pp = 0.5 * SP4.gamma * D * D * kp
  return { s, kp, D, Dalt, Pa, Pp }
}

export const A2009: SmQ[] = [
  {
    id: 'sm-2009-10-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 8,
    topics: ['sm-struct', 'sm-class'],
    title: 'Chart of inorganic soil deposits; salient features of USCS',
    text: 'Give a chart showing the classification of inorganic soil deposits. State the salient features of the Unified Soil Classification System.',
    pages: [10],
    theory: true,
    flag: 'Soil deposits by origin (first half) — not in AJK sir’s Topic 4 slides.',
    solution: () => (
      <Models
        parts={[
          { title: 'Classification of soil deposits by origin', item: th('sm-struct', 't-deposits') },
          { title: 'Salient features of the USCS', item: th('sm-class', 't-uscs') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2009-10-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 8,
    topics: ['sm-plast'],
    title: 'Deduce the shrinkage limit when Gs is unknown',
    text: 'Deduce an expression for the shrinkage limit of soil when the specific gravity of the soil solids is unknown.',
    pages: [10],
    theory: true,
    flag: 'Shrinkage-limit calculation — not in AJK sir’s slides (SL is only named).',
    solution: () => <Model item={th('sm-plast', 't-sl-unknown')} />,
  },
  {
    id: 'sm-2009-10-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 8,
    topics: ['sm-lep'],
    title: 'Active pressure in the bottom layer of a three-layer cohesionless backfill',
    text: 'Derive an expression for active earth pressure in the bottom most layer of a three layer cohesionless soil system.',
    pages: [10],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-layers')} />,
  },
  {
    id: 'sm-2009-10-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 8,
    topics: ['sm-shear'],
    title: 'Prove cu = 6T/(7πD³) for the vane shear test',
    text: 'Prove that in a vane shear test $c_u = \\dfrac{6T}{7\\pi D^3}$, where the symbols have their usual meanings.',
    pages: [10],
    theory: true,
    flag: 'Vane shear test — not in AJK sir’s slides this term.',
    solution: () => <Model item={th('sm-shear', 't-vane')} />,
    notes: ['The formula holds for a vane with H = 2D sheared on both ends (uniform end stress); the question does not state H = 2D — say so.'],
  },
  {
    id: 'sm-2009-10-1e',
    paper: P,
    sec: 'A',
    no: '1(e)',
    marks: 8,
    topics: ['sm-lep'],
    title: 'Prove the design active thrust after the tension crack, c–φ soil',
    text: 'Starting with the formula of active earth pressure in a c-φ soil, prove that the design active thrust after the occurrence of tensile crack is $P_a = \\frac12\\left(H - \\frac{2c}{\\gamma\\sqrt{K_a}}\\right)(\\gamma HK_a - 2c\\sqrt{K_a})$, where the symbols have their usual meanings.',
    pages: [10],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-after')} />,
  },
  {
    id: 'sm-2009-10-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 25,
    topics: ['sm-class'],
    title: 'D10, D30 from Cu = 3.00 and Cc = 1.92; sketch the GSD; AASHTO with GI',
    text: 'The following data were obtained from laboratory tests on a soil: percent of particles finer than 4.75 mm = 100; percent passing #40 sieve = 80; percent of particles finer than 0.075 mm = 60; uniformity coefficient = 3.00; coefficient of curvature = 1.92; liquid limit of soil fraction passing #40 sieve = 43; plastic limit of soil fraction passing #40 sieve = 15. Draw the grain size distribution diagram of the soil using available and estimated (calculated) data. Also classify the soil as per AASHTO soil classification system.',
    pages: [10],
    given: [],
    checks: () => {
      const a = aashto(A2)
      return [
        { key: 'D60', label: '$D_{60}$', value: D2.D60, unit: 'mm' },
        { key: 'D10', label: '$D_{10} = D_{60}/C_u$', value: D2.D10, unit: 'mm' },
        { key: 'D30', label: '$D_{30} = \\sqrt{C_c D_{60}D_{10}}$', value: D2.D30, unit: 'mm' },
        { key: 'PI', label: 'PI', value: A2.PI },
        { key: 'gi', label: 'Group index (whole number)', value: a.gi.gi, tol: 0.001 },
      ]
    },
    solution: () => {
      const a = aashto(A2)
      return (
        <Sol>
          <Md>{`60 % of the particles are finer than 0.075 mm, so $D_{60}$ = **0.075 mm** directly. Then`}</Md>
          <Tex block>{`D_{10} = \\frac{D_{60}}{C_u} = \\frac{0.075}{3.00} = ${f4(D2.D10)}\\ \\text{mm},\\qquad D_{30} = \\sqrt{C_c\\,D_{60}D_{10}} = \\sqrt{1.92(0.075)(${f4(D2.D10)})} = ${f4(D2.D30)}\\ \\text{mm}`}</Tex>
          <Md>{`Plot the five known points (4.75 mm 100 %, 0.425 mm 80 %, 0.075 mm 60 %, $D_{30}$ 30 %, $D_{10}$ 10 %) on the semi-log sheet and draw a smooth curve:`}</Md>
          <Frame>
            <GradingCurve curves={[{ pts: GSD2, label: 'soil', color: 'var(--c-accent)' }]} D={D2} />
          </Frame>
          <Head>AASHTO</Head>
          <AashtoSolved inp={A2} />
          <Result>{`$D_{10}$ = ${f3(D2.D10)} mm, $D_{30}$ = ${f3(D2.D30)} mm, $D_{60}$ = 0.075 mm; AASHTO **${a.label}** (clayey soil; % passing No. 10 is not given but is not needed once F200 exceeds 35 %).`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "Uniformly co-efficient" read as uniformity coefficient.', '% passing No. 10 is not given; it lies between 80 and 100 % and does not affect a silt-clay group.'],
  },
  {
    id: 'sm-2009-10-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Lateral thrust on a 6 m wall from a 25 kN/m line load 3.5 m behind it',
    text: 'A line load of 25 kN/m due to a concrete pipe running parallel to the retaining wall acts on the surface of the backfill at a distance of 3.5 m from the wall. The height of the wall is 6 m. Determine the lateral thrust coming on the wall due to this line load. Given that\n\n$$\\sigma_h = \\frac{1.27q}{H}\\,\\frac{m^2n}{(m^2 + n^2)^2}\\quad\\text{or}\\quad \\sigma_h = \\frac{0.203q}{H}\\,\\frac{n}{(0.16 + n^2)^2}$$\n\nc = 0, γ = 18 kN/m³, φ = 30°, μ = 0.5.',
    pages: [11],
    flag: 'Lateral pressure from a line load behind a wall — not in AJK sir’s slides this term.',
    given: [{ label: 'Line-load formulas', what: 'printed in the question', ref: 'e-wallload', formula: true }],
    figure: () => <SurchargeFig H={L2.H} loads={[{ x: L2.x, label: 'line load 25 kN/m (pipe)', kind: 'line' }]} soil={['c = 0, γ = 18 kN/m³, φ = 30°']} />,
    checks: () => {
      const r = integrateWall(sL2, L2.H)
      return [
        { key: 'm', label: '$m = x/H$', value: L2.x / L2.H },
        { key: 's2', label: 'σh at z = 2 m', value: sL2(2), unit: 'kPa', tol: 0.03 },
        { key: 'P', label: 'Lateral thrust from the line load', value: r.P, unit: 'kN/m', tol: 0.03 },
        { key: 'arm', label: '… acting above the base', value: r.arm, unit: 'm', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = integrateWall(sL2, L2.H)
      const m = L2.x / L2.H
      const zs = [0, 1, 2, 3, 4, 5, 6]
      return (
        <Sol>
          <Tex block>{`m = \\frac{x}{H} = \\frac{3.5}{6} = ${f3(m)} > 0.4\\ \\Rightarrow\\ \\sigma_h = \\frac{1.27q}{H}\\,\\frac{m^2n}{(m^2 + n^2)^2},\\quad n = \\frac{z}{H}`}</Tex>
          <Md>{`Ordinates (kPa): ${zs.map((z) => `z = ${z} m: ${f2(sL2(z))}`).join('; ')}.`}</Md>
          <Frame>
            <ProfilePlot H={L2.H} curves={[{ f: sL2, color: 'var(--c-load)', label: 'σh from the line load' }]} />
          </Frame>
          <Md>{`Integrate down the wall (Simpson's rule, or the closed form $P = \\dfrac{0.635q}{m^2 + 1}$ = 0.635(25)/(${f3(m * m)} + 1) = ${f2((0.635 * 25) / (m * m + 1))} kN/m):`}</Md>
          <Tex block>{`P = \\int_0^H \\sigma_h\\,dz = ${f2(r.P)}\\ \\text{kN/m},\\qquad \\bar z = ${f2(r.arm)}\\ \\text{m above the base}`}</Tex>
          <Result>{`Lateral thrust due to the line load ≈ **${f1(r.P)} kN/m**, acting about **${f2(r.arm)} m** above the base. γ, φ and μ are not needed for it; the backfill's own Rankine thrust would be ½γH²Ka = ${f1(0.5 * 18 * 36 * Ka(30))} kN/m on top of this.`}</Result>
        </Sol>
      )
    },
    notes: ['μ = 0.5 (Poisson ratio) is consistent with the modified Boussinesq forms; it, γ and φ do not enter the line-load thrust.'],
  },
  {
    id: 'sm-2009-10-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['sm-plast'],
    title: 'Fall-cone LL (80 g); PL with the same apparatus; liquidity index',
    text: 'The results of a cone penetration test for liquid limit are as follows, using a cone weight of 80 gms.\n\n| Penetration (mm) | 7.8 | 14.8 | 22.0 | 32.0 |\n|---|---|---|---|---|\n| Water content (%) | 45 | 53 | 60 | 68 |\n\nDetermine the liquid limit of the soil. How can you determine the plastic limit of a soil by using the same apparatus? Suppose that the plastic limit of the soil mentioned above is 35% and the natural water content is 40%. Calculate the liquidity index of the soil.',
    pages: [11],
    given: [],
    checks: () => {
      const r = q3a()
      return [
        { key: 'LL', label: 'Liquid limit (w at 20 mm)', value: r.f.LL, unit: '%', tol: 0.03 },
        { key: 'PI', label: 'PI = LL − 35', value: r.k.PI, unit: '%', tol: 0.08 },
        { key: 'LI', label: 'Liquidity index', value: r.k.LI, tol: 0.08 },
      ]
    },
    solution: () => {
      const r = q3a()
      return (
        <Sol>
          <Md>{`Plot w against penetration and draw the best straight line (BS 1377, 80 g cone): $w = ${f2(r.f.a)} + ${f3(r.f.b)}d$ (r² = ${f3(r.f.r2)}).`}</Md>
          <Frame>
            <FlowPlot mode="cone" pts={CONE3.map((p) => ({ x: p.d, w: p.w }))} a={r.f.a} b={r.f.b} LL={r.f.LL} />
          </Frame>
          <Md>{`**LL = w at 20 mm = ${f2(r.f.LL)} %** (straight interpolation between the 14.8 and 22.0 mm readings gives ${f2(r.f.interp)} %; a hand-drawn line lands at 57–59 %).`}</Md>
          <Head>Plastic limit with the same apparatus</Head>
          <Model item={th('sm-plast', 't-cone')} />
          <Head>Liquidity index</Head>
          <Tex block>{`LI = \\frac{w_n - PL}{LL - PL} = \\frac{40 - 35}{${f2(r.f.LL)} - 35} = ${f3(r.k.LI)}`}</Tex>
          <Result>{`LL ≈ **${f1(r.f.LL)} %**; LI ≈ **${f2(r.k.LI)}** (${f2(r.ki.LI)} with the interpolated LL) — the soil is in the plastic state, near its PL: stiff.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2009-10-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Back-calculate Ka from Pa = 75 kN/m; replace the top 2.8 m with cinder; extra wall height at the same thrust',
    text: 'A dry granular level backfill of a 6.3 m high retaining wall weighs 16.2 kN/m³. The active thrust on the wall is believed to be 75 kN per metre length of the wall. It is intended to increase the height of the wall and at the same time keep the force on the wall within permissible limits. The backfill to a depth of 2.8 m from the top is removed. The removed portion is replaced by a material such as cinder with γ = 8.2 kN/m³. If the portion of the additional height is also to be filled with cinder, estimate the additional height of the wall without increasing the initial active thrust. Neglect the wall friction, and assume that both the backfill soil and the cinder have the same angle of internal friction.',
    pages: [11],
    given: [],
    figure: () => <WallQFig w={q3b().w} />,
    checks: () => {
      const r = q3b()
      return [
        { key: 'ka', label: '$K_a = 2P_a/(\\gamma H^2)$', value: r.ka, tol: 0.01 },
        { key: 'phi', label: 'Corresponding φ', value: r.phi, unit: '°', tol: 0.01 },
        { key: 'rep', label: 'Thrust after replacing the top 2.8 m (same height)', value: r.replaced, unit: 'kN/m' },
        { key: 'h', label: 'Additional height of the wall', value: r.h, unit: 'm', tol: 0.03 },
        { key: 'Hn', label: 'New wall height', value: r.Hn, unit: 'm', tol: 0.01 },
      ]
    },
    solution: () => {
      const r = q3b()
      return (
        <Sol>
          <Md>{`Smooth wall, level dry fill, c = 0: $P_a = \\tfrac12K_a\\gamma H^2$, so the believed thrust fixes $K_a$:`}</Md>
          <Tex block>{`K_a = \\frac{2P_a}{\\gamma H^2} = \\frac{2(75)}{16.2(6.3)^2} = ${f4(r.ka)}\\quad(\\varphi = \\sin^{-1}\\tfrac{1 - K_a}{1 + K_a} = ${f2(r.phi)}^\\circ)`}</Tex>
          <Md>{`**Cinder in the top 2.8 m only:** the cinder acts like a lighter top layer, and the original fill below sees it as a surcharge $\\gamma_c t$. Same φ → same $K_a$ in both, no jump at the interface. Thrust drops to **${f2(r.replaced)} kN/m** — so the wall can be raised.`}</Md>
          <Md>{`**Raised wall:** cinder thickness $a = 2.8 + h$ over the remaining ${f2(r.fill)} m of fill:`}</Md>
          <Tex block>{`P_a = K_a\\left[\\tfrac12\\gamma_c a^2 + \\gamma_c a(${f2(r.fill)}) + \\tfrac12\\gamma(${f2(r.fill)})^2\\right] = 75`}</Tex>
          <Tex block>{`${f2(r.A)}a^2 + ${f2(r.Bq)}a ${r.Cq < 0 ? '-' : '+'} ${f2(Math.abs(r.Cq))} = 0\\ \\Rightarrow\\ a = ${f3(r.a)}\\ \\text{m},\\qquad h = a - 2.8 = ${f3(r.h)}\\ \\text{m}`}</Tex>
          <WallSolved w={r.w} lead={`Check with the full pressure diagram for the raised wall (H = ${f2(r.Hn)} m):`} />
          <Result>{`Additional height ≈ **${f2(r.h)} m** (new wall ≈ ${f2(r.Hn)} m with ${f2(r.a)} m of cinder); its thrust is ${f2(r.check)} kN/m = the original 75 kN/m.`}</Result>
        </Sol>
      )
    },
    notes: ['Same φ for fill and cinder means the same Ka throughout, so the diagram only changes slope at the interface.'],
  },
  {
    id: 'sm-2009-10-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'Silty clay at 15 m (WT at the surface): strength for rapid and for very slow loading',
    text: 'A boring log reveals that a thin layer of silty clay exists at a depth of 15 m below the natural ground surface. The soil above this layer is a silt having γsat = 19.8 kN/m³. The ground water table is found to exist approximately near the ground surface. Triaxial tests on the undisturbed silty clay sample give the following results: $c_{cu}$ = 48.3 kN/m², $\\varphi_{cu}$ = 13° and $c_d$ = 41.4 kN/m², $\\varphi_d$ = 23°. Estimate the shearing resistance of the silty clay on a horizontal plane (i) when the shearing stress builds up rapidly and (ii) when the shearing stress builds up very slowly.',
    pages: [11],
    given: [],
    checks: () => cuCdChecks(CC4),
    solution: () => <CuCdSolution p={CC4} />,
    notes: ['Printed "silly clay" read as "silty clay".', 'Repeated in 2011-12 Q4(b).'],
  },
  {
    id: 'sm-2009-10-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Sheet pile (Fig. 1): embedment D by horizontal force balance, backfill sloping at 18.2°',
    text: 'A proposed sheet pile retaining structure is to be built as shown in Fig. 1. It is believed that the active thrust that develops at the backfill side is being resisted by the passive thrust that develops on the front side of the retaining structure. Calculate the depth D so that it can resist the horizontal thrust coming from the backfill. Assume homogeneous soil on both sides of the sheet pile wall. Neglect the stability consideration of the sheet pile wall.\n\n(Fig. 1: sheet pile wall 6 m height; backfill surface rising at 18.2° from the top of the pile; front ground level; c = 0, φ = 30°, γ = 17 kN/m³.)',
    pages: [12],
    flag: 'Sheet-pile embedment and sloping backfill — not in AJK sir’s slides this term.',
    given: [],
    figure: () => <SheetPileFig H={SP4.H} D={3.3} beta={SP4.beta} soil={['c = 0, φ = 30°', 'γ = 17 kN/m³']} />,
    checks: () => {
      const r = q4b()
      return [
        { key: 'ka', label: '$K_a$ for the 18.2° slope (Rankine)', value: r.s.ka, tol: 0.01 },
        { key: 'kah', label: 'Horizontal component $K_a\\cos\\beta$', value: r.s.kaH, tol: 0.01 },
        { key: 'kp', label: '$K_p$ (level front)', value: r.kp, tol: 0.01 },
        { key: 'D', label: 'Embedment depth D', value: r.D, unit: 'm', tol: 0.02 },
        { key: 'P', label: 'Horizontal thrust on each side at that D', value: r.Pp, unit: 'kN/m', tol: 0.02 },
      ]
    },
    solution: () => {
      const r = q4b()
      const cb = Math.cos(rad(SP4.beta))
      return (
        <Sol>
          <Md>{`Rankine on both sides, c = 0, no water. **Back (active)** over the full height H + D, sloping surface β = 18.2°; the thrust is parallel to the slope, so use its horizontal component. **Front (passive)** over D, level ground.`}</Md>
          <Tex block>{`K_a = \\cos\\beta\\,\\frac{\\cos\\beta - \\sqrt{\\cos^2\\beta - \\cos^2\\varphi}}{\\cos\\beta + \\sqrt{\\cos^2\\beta - \\cos^2\\varphi}} = ${f4(r.s.ka)},\\qquad K_a\\cos\\beta = ${f4(r.s.ka)}\\times${f4(cb)} = ${f4(r.s.kaH)}`}</Tex>
          <Tex block>{`K_p = \\tan^2(45 + 15) = ${f3(r.kp)}`}</Tex>
          <Md>{`Horizontal equilibrium (moments ignored, as the question says):`}</Md>
          <Tex block>{`\\tfrac12\\gamma(H + D)^2K_a\\cos\\beta = \\tfrac12\\gamma D^2K_p\\ \\Rightarrow\\ \\frac{H + D}{D} = \\sqrt{\\frac{K_p}{K_a\\cos\\beta}} = ${f3(Math.sqrt(r.kp / r.s.kaH))}`}</Tex>
          <Tex block>{`D = \\frac{H\\sqrt{K_a\\cos\\beta}}{\\sqrt{K_p} - \\sqrt{K_a\\cos\\beta}} = \\frac{6(${f4(Math.sqrt(r.s.kaH))})}{${f4(Math.sqrt(r.kp))} - ${f4(Math.sqrt(r.s.kaH))}} = ${f3(r.D)}\\ \\text{m}`}</Tex>
          <Md>{`Check: active ½(17)(${f2(SP4.H + r.D)})²(${f4(r.s.kaH)}) = ${f1(r.Pa)} kN/m = passive ½(17)(${f2(r.D)})²(${f3(r.kp)}) = ${f1(r.Pp)} kN/m.`}</Md>
          <Result>{`**D ≈ ${f2(r.D)} m** (total pile length ≈ ${f2(SP4.H + r.D)} m). If the "6 m" were the total pile length instead, $6^2K_a\\cos\\beta = D^2K_p$ gives D = ${f2(r.Dalt)} m. Moment equilibrium (a real design) would need a much deeper pile.`}</Result>
        </Sol>
      )
    },
    notes: ['"Sheet pile wall 6 m height" (handwritten on Fig. 1) read as the exposed height above the front ground; the total-length reading is given too.', 'The figure is hand-drawn and not to scale; β = 18.2° is clear on the scan.'],
  },
]
