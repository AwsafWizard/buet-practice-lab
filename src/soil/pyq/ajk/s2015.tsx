// CE 341 term final 2015-16 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1–Q8, answer any SIX, 23⅓ each), held 14 Jan 2017, PDF pp. 30–31. Section A has no figures.
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { integrateWall, pointLoadSigma, pointLoadWholeWall, solveWall, type Wall } from '../../engine/earth'
import { aLine } from '../../engine/plasticity'
import { fitLine, intersect } from '../../engine/shear'
import { TauSigmaFig } from '../../topics/shear/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, CE, culmannChecks, CulmannSolution, DepthLoadSolution, depthLoadChecks, f1, f2, f3, f4, Frame, Head, Model, ncCu, NcCuPlot, ProfilePlot, Result, Sol, SurchargeFig, th, UscsSolved, wallChecks, WallQFig, WallSolved } from './old-kit'

const P = '2015-16' as const

// ---------------------------------------------------------------- Q1
const D1 = { z: 4, gamma: 19.6, phi: 35, dSigma: 60, tau: 52 }

// ---------------------------------------------------------------- Q2
const S2 = { s3: 45, dev: 97 - 45, u: 20 }

// ---------------------------------------------------------------- Q3 wheel load next to a basement wall
const Q3 = { Q: 100, x: 1.5, H: 3 }
const q3 = () => {
  const whole = pointLoadWholeWall(Q3.Q, Q3.x, Q3.H)
  const ts = integrateWall((z) => pointLoadSigma(Q3.Q, Q3.x, Q3.H, z), Q3.H)
  let zPk = 0
  let sPk = 0
  for (let i = 0; i <= 300; i++) {
    const z = (i * Q3.H) / 300
    const s = pointLoadSigma(Q3.Q, Q3.x, Q3.H, z)
    if (s > sPk) {
      sPk = s
      zPk = z
    }
  }
  return { whole, rigid: 2 * whole, ts, zPk, sPk, m: Q3.x / Q3.H }
}

// ---------------------------------------------------------------- Q4 three layers, 11 m wall (layers printed add to 9 m)
const W4: Wall = {
  layers: [
    { h: 3, gamma: 15, phi: 30, c: 10, name: 'top' },
    { h: 2, gamma: 16, phi: 32, c: 0, name: 'middle' },
    { h: 6, gamma: 18, gammaSat: 18, phi: 32, c: 0, name: 'bottom' },
  ],
  zw: 5,
  q: 0,
  state: 'active',
}
const W4b: Wall = { ...W4, layers: [W4.layers[0], W4.layers[1], { ...W4.layers[2], h: 4 }] }

// ---------------------------------------------------------------- Q5
const U5 = { F200: 52, F4: 98, LL: 55, PL: 33, LLoven: 45 }
const A5 = { P10: 80, P40: 70, P200: 52, LL: 55, PI: 55 - 33 }

// ---------------------------------------------------------------- Q7 CU direct shear, six samples
const DS7 = [
  { s: 15, t: 15 },
  { s: 30, t: 18.5 },
  { s: 50, t: 23 },
  { s: 80, t: 32 },
  { s: 100, t: 40 },
  { s: 120, t: 48 },
]
const q7 = () => {
  const lo = DS7.slice(0, 3),
    hi = DS7.slice(3)
  const oc = fitLine(
    lo.map((p) => p.s),
    lo.map((p) => p.t),
  )
  const nc = fitLine(
    hi.map((p) => p.s),
    hi.map((p) => p.t),
    true,
  )
  const x = intersect(oc, nc)
  const deg = (b: number) => (Math.atan(b) * 180) / Math.PI
  return { oc, nc, x, phiOC: deg(oc.b), phiNC: deg(nc.b), ratios: DS7.map((p) => p.t / p.s) }
}

export const A2015: SmQ[] = [
  {
    id: 'sm-2015-16-1',
    paper: P,
    sec: 'A',
    no: '1',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'Strength of granular soil on a horizontal plane at 4 m; FS after a structure adds 60 kPa',
    text: 'Samples from a uniform deposit of granular soil have a unit weight of 19.6 kN/m³ and an angle of internal friction of 35°. What is the shearing strength of the soil on a horizontal plane at a point 4 m below the ground surface?\n\nA proposed structure will increase the vertical stress by 60 kN/m² at the 4 m depth, and its weight also increases the shearing stress on a horizontal plane at this depth to 52 kN/m². Does this shearing stress exceed the shearing strength of the soil? Calculate the factor of safety against shear failure.',
    pages: [30],
    given: [],
    checks: () => depthLoadChecks(D1),
    solution: () => <DepthLoadSolution p={D1} />,
    notes: ['No water table is given: σ′ = σ (dry or moist deposit), c = 0 for a granular soil.'],
  },
  {
    id: 'sm-2015-16-2',
    paper: P,
    sec: 'A',
    no: '2',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CU test on NC clay (σ3 = 45, σ1 = 97, uf = 20 kPa): φ′ (= φCD) and φcu',
    text: 'A normally consolidated clay sample is tested in a consolidated undrained triaxial test with pore pressure measurement. It fails at a total all-around confining pressure of 45 kPa and a total axial pressure of 97 kPa, with a recorded pore pressure of 20 kPa. Determine the angle of internal friction $\\varphi_{CD}$ of the effective stress strength envelope, and also $\\varphi_{cu}$.',
    pages: [30],
    given: [],
    checks: () => {
      const r = ncCu(S2.s3, S2.dev, S2.u)
      return [
        { key: 'dev', label: 'Deviator stress at failure', value: S2.dev, unit: 'kPa' },
        { key: 's3p', label: "$\\sigma'_3 = \\sigma_3 - u_f$", value: r.eff.s3, unit: 'kPa' },
        { key: 's1p', label: "$\\sigma'_1 = \\sigma_1 - u_f$", value: r.eff.s1, unit: 'kPa' },
        { key: 'phiE', label: "$\\varphi_{CD} = \\varphi'$", value: r.phiE, unit: '°', tol: 0.01 },
        { key: 'phiT', label: '$\\varphi_{cu}$ (total stress)', value: r.phiT, unit: '°', tol: 0.01 },
      ]
    },
    solution: () => {
      const r = ncCu(S2.s3, S2.dev, S2.u)
      return (
        <Sol>
          <Md>{`The "total axial pressure" 97 kPa is σ1 itself, so the deviator is 97 − 45 = ${f2(S2.dev)} kPa. NC clay: both envelopes pass through the origin (c = c′ = 0), so one circle fixes each angle, $\\sin\\varphi = (\\sigma_1 - \\sigma_3)/(\\sigma_1 + \\sigma_3)$.`}</Md>
          <Tex block>{`\\text{Effective: } \\sigma'_3 = 45 - 20 = ${f2(r.eff.s3)},\\ \\sigma'_1 = 97 - 20 = ${f2(r.eff.s1)}\\ \\Rightarrow\\ \\sin\\varphi' = \\frac{${f2(S2.dev)}}{${f2(r.eff.s1 + r.eff.s3)}} = ${f4(Math.sin((r.phiE * Math.PI) / 180))},\\ \\varphi_{CD} = \\varphi' = ${f2(r.phiE)}^\\circ`}</Tex>
          <Tex block>{`\\text{Total: } \\sin\\varphi_{cu} = \\frac{${f2(S2.dev)}}{97 + 45} = ${f4(Math.sin((r.phiT * Math.PI) / 180))}\\ \\Rightarrow\\ \\varphi_{cu} = ${f2(r.phiT)}^\\circ`}</Tex>
          <NcCuPlot s3={S2.s3} dev={S2.dev} u={S2.u} />
          <Result>{`$\\varphi_{CD} = \\varphi'$ = **${f1(r.phiE)}°**, $\\varphi_{cu}$ = **${f1(r.phiT)}°**. The drained (effective) angle equals φ′ of the CU test because the effective envelope is unique; positive pore pressure moves the effective circle left by ${f2(S2.u)} kPa, so φ′ is larger than φcu.`}</Result>
        </Sol>
      )
    },
    notes: ['"Total axial pressure of 97 kPa" read as σ1 (not the deviator).'],
  },
  {
    id: 'sm-2015-16-3',
    paper: P,
    sec: 'A',
    no: '3',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Lateral force on a 3 m basement wall from a 100 kN truck wheel 1.5 m away',
    text: "A commercial truck parks in a house driveway, which borders one side of the house. Estimate the resultant lateral force imposed on the masonry basement wall by the truck's rear wheel closest to the house. The wall is 3 m high, the axle wheel is 1.5 m from the house, and the wheel load is 100 kN.",
    pages: [30],
    flag: 'Lateral pressure from a point load behind a wall — not in AJK sir’s slides this term.',
    given: [{ label: 'Point-load formulas', what: 'not printed this year (Boussinesq / Terzaghi–Spangler)', ref: 'e-wallload', formula: true }],
    figure: () => <SurchargeFig H={Q3.H} loads={[{ x: Q3.x, label: 'wheel Q = 100 kN', kind: 'point' }]} wheel soil={['basement wall (masonry)', 'backfill']} />,
    checks: () => {
      const r = q3()
      return [
        { key: 'm', label: '$m = x/H$', value: r.m },
        { key: 'P', label: 'Boussinesq (ν = 0.5): total force on the whole wall, $(Q/\\pi)H^2/(x^2 + H^2)$', value: r.whole, unit: 'kN' },
        { key: 'P2', label: 'Rigid (unyielding) basement wall: twice that', value: r.rigid, unit: 'kN', tol: 0.03 },
        { key: 'Pm', label: 'Terzaghi–Spangler: force per metre of wall opposite the wheel', value: r.ts.P, unit: 'kN/m', tol: 0.03 },
        { key: 'arm', label: '… its height above the base of the wall', value: r.ts.arm, unit: 'm', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = q3()
      return (
        <Sol>
          <Md>{`A surface point load spreads into the backfill; the wall feels a horizontal stress that peaks a little below the surface and dies out with depth and with distance along the wall. Two standard estimates (neither is on this term's slides):`}</Md>
          <Head>(1) Elastic (Boussinesq, ν = 0.5) — resultant on the whole wall</Head>
          <Md>{`Integrating Boussinesq's σx over the full height and the whole length of the wall (x = ${f2(Q3.x)} m, H = ${f2(Q3.H)} m):`}</Md>
          <Tex block>{`P = \\frac{Q}{\\pi}\\,\\frac{H^2}{x^2 + H^2} = \\frac{100}{\\pi}\\,\\frac{3^2}{1.5^2 + 3^2} = ${f2(r.whole)}\\ \\text{kN}`}</Tex>
          <Md>{`A masonry basement wall barely yields, so the soil next to it cannot strain laterally: the usual correction (mirror load at −x) **doubles** the elastic value → **${f1(r.rigid)} kN** resultant on the wall from this wheel.`}</Md>
          <Head>(2) Terzaghi–Spangler modified Boussinesq — per metre opposite the wheel</Head>
          <Tex block>{`m = \\frac{x}{H} = ${f3(r.m)} > 0.4:\\qquad \\sigma_h = \\frac{1.77Q}{H^2}\\,\\frac{m^2n^2}{(m^2 + n^2)^3},\\quad n = \\frac{z}{H}`}</Tex>
          <Frame>
            <ProfilePlot H={Q3.H} curves={[{ f: (z) => pointLoadSigma(Q3.Q, Q3.x, Q3.H, z), color: 'var(--c-load)', label: 'σh opposite the wheel' }]} />
          </Frame>
          <Md>{`Peak σh ≈ ${f2(r.sPk)} kPa at z ≈ ${f2(r.zPk)} m. Integrating down the wall (Simpson, 400 strips): $P = \\int_0^H \\sigma_h\\,dz$ = **${f1(r.ts.P)} kN/m**, acting ${f2(r.ts.arm)} m above the base (${f2(Q3.H - r.ts.arm)} m below the top).`}</Md>
          <Result>{`Resultant lateral force from the wheel ≈ **${f1(r.rigid)} kN** on the (rigid) basement wall (${f1(r.whole)} kN for a yielding wall), concentrated in the few metres of wall nearest the wheel, where it is about **${f1(r.ts.P)} kN per metre** at ${f2(Q3.H - r.ts.arm)} m below the top.`}</Result>
        </Sol>
      )
    },
    notes: ['The answer depends on the method: "resultant lateral force" read as the whole-wall total; the per-metre Terzaghi–Spangler value is given as well.', 'Soil properties are not needed for the elastic estimate; the earth pressure of the backfill itself is not asked.'],
  },
  {
    id: 'sm-2015-16-4',
    paper: P,
    sec: 'A',
    no: '4',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Rankine active on an 11 m wall: c–φ top layer (tension crack), two sand layers, WT at 5 m',
    text: 'A three-layer soil system lies behind an 11 m high retaining wall. The water table is 5 m below the ground surface. Estimate the design lateral thrust, assuming the wall moves outward enough to cause failure by lateral expansion of the backfill.\n\n| Layer | Thickness | c | φ | γ |\n|---|---|---|---|---|\n| Top | 3.0 m | 10 | 30° | 15 kN/m³ |\n| Middle | 2.0 m | 0 | 32° | 16 kN/m³ |\n| Bottom | 4.0 m | 0 | 32° | 18 kN/m³ |',
    pages: [30],
    given: [],
    figure: () => <WallQFig w={W4} />,
    checks: () => wallChecks(W4, { before: true }),
    solution: () => {
      const b = solveWall(W4b)
      return (
        <WallSolved
          w={W4}
          lead={`"Lateral expansion of the backfill" = **Rankine active** state. The printed layers add to only 9 m on an 11 m wall, so the bottom layer is taken to continue to the base (6 m thick, all below the WT). c = 10 is taken as kPa; the bottom layer's 18 kN/m³ is γsat (γ′ = 8.19). The top layer has c > 0, so σ′a = σ′vKa − 2c√Ka is negative near the surface: a **tension crack** forms and the negative zone is dropped for the design thrust.`}
          tail={`**If the wall were only 9 m** (layers as printed, 4 m below the WT): the design thrust would be ${f1(b.Fs)} kN/m acting ${f2(b.zbar)} m above the base (water ${f1(b.waterF)} kN/m of it). Write the assumption down in the exam.`}
        />
      )
    },
    notes: ['Print problem: the layers total 9 m but the wall is 11 m high — the bottom layer is assumed to extend to the base (6 m thick). The 9 m answer is given in the solution.', 'Units of c are not printed: kN/m² assumed.', 'The 18 kN/m³ of the bottom layer (below the WT) is taken as γsat.'],
  },
  {
    id: 'sm-2015-16-5',
    paper: P,
    sec: 'A',
    no: '5',
    marks: 23.33,
    topics: ['sm-class'],
    title: 'Organic check (oven-dried LL), then USCS and AASHTO with GI',
    text: 'From the following test results, test whether the soil is organic or inorganic, then classify it as per USCS and AASHTO.\n\n| Item | Value |\n|---|---|\n| % passing 4.75 mm sieve | 98 |\n| % passing 2.00 mm sieve | 80 |\n| % passing 0.425 mm sieve | 70 |\n| % passing 0.075 mm sieve | 52 |\n| Liquid limit of air-dried soil | 55 |\n| Liquid limit of oven-dried soil | 45 |\n| Plastic limit of air-dried soil | 33 |',
    pages: [31],
    given: [],
    checks: () => {
      const a = aashto(A5)
      return [
        { key: 'r', label: 'LL(oven-dried)/LL(air-dried)', value: U5.LLoven / U5.LL, tol: 0.01 },
        { key: 'PI', label: 'PI of the air-dried soil', value: A5.PI },
        { key: 'A', label: 'A-line PI at LL = 55', value: aLine(U5.LL) },
        { key: 'gi', label: 'Group index GI (whole number)', value: a.gi.gi, tol: 0.001 },
      ]
    },
    solution: () => {
      const u = uscs(U5)
      const a = aashto(A5)
      return (
        <Sol>
          <Head>Organic or inorganic?</Head>
          <Md>{`$LL_{oven}/LL_{air} = 45/55 = ${f3(U5.LLoven / U5.LL)}$ ≥ 0.75 → **inorganic** (an organic soil loses much of its LL on oven drying).`}</Md>
          <Head>USCS</Head>
          <UscsSolved inp={U5} />
          <Head>AASHTO</Head>
          <AashtoSolved inp={A5} />
          <Result>{`Inorganic; USCS **${u.symbol}** (${u.name.toLowerCase()}); AASHTO **${a.label}**.`}</Result>
        </Sol>
      )
    },
    notes: ['The USCS check uses the air-dried LL and PL (PI = 22); the oven-dried LL is only for the organic test.'],
  },
  {
    id: 'sm-2015-16-6',
    paper: P,
    sec: 'A',
    no: '6',
    marks: 23.33,
    topics: ['sm-lep'],
    title: "Passive thrust on a 6 m smooth wall by Culmann's method vs Coulomb (φ = 33°)",
    text: "A smooth-backed vertical retaining wall is 6 m high. The backfill has c = 0, φ = 33° and γ = 18 kN/m³. Use Culmann's graphical method to determine the passive pressure on the wall, and compare the result with Coulomb's method.",
    pages: [31],
    flag: "Culmann's method and Coulomb's theory — not in AJK sir's slides this term.",
    given: [],
    figure: () => <WallQFig w={{ layers: [{ h: 6, gamma: 18, phi: 33, c: 0 }], zw: null, q: 0, state: 'passive' }} />,
    checks: () => culmannChecks(6, 18, 33, 0, 'passive'),
    solution: () => <CulmannSolution H={6} gamma={18} phi={33} state="passive" compare="coulomb" />,
    notes: ['The backfill slope is not stated: horizontal assumed. Smooth wall → δ = 0, so Coulomb Kp = Rankine Kp.', 'Active twin: 2012-13 Q6.'],
  },
  {
    id: 'sm-2015-16-7',
    paper: P,
    sec: 'A',
    no: '7',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'Six CU direct shear tests: bilinear envelope → c, φcu and preconsolidation pressure',
    text: 'In-situ strength parameters c and φ and the pre-consolidation pressure are wanted for a saturated clay. Direct shear tests under consolidated undrained conditions were run on six identical samples. Estimate the in-situ cohesion c, $\\varphi_{cu}$, and the pre-consolidation pressure.\n\n| Sample | Normal stress (kN/m²) | Shear stress at failure (kN/m²) |\n|---|---|---|\n| 1 | 15 | 15 |\n| 2 | 30 | 18.5 |\n| 3 | 50 | 23 |\n| 4 | 80 | 32 |\n| 5 | 100 | 40 |\n| 6 | 120 | 48 |',
    pages: [31],
    given: [],
    checks: () => {
      const r = q7()
      return [
        { key: 'nc', label: '$\\varphi_{cu}$ of the high-stress (NC) line through the origin', value: r.phiNC, unit: '°', tol: 0.01 },
        { key: 'c', label: 'Cohesion intercept c of the low-stress (OC) line', value: r.oc.a, unit: 'kPa', tol: 0.05 },
        { key: 'phi', label: 'φ of the OC line', value: r.phiOC, unit: '°', tol: 0.03 },
        { key: 'pc', label: 'Preconsolidation pressure (where the lines meet)', value: r.x.x, unit: 'kPa', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = q7()
      return (
        <Sol>
          <Md>{`Plot τf against σ. The ratio τ/σ is ${r.ratios.map((x) => f3(x)).join(', ')}: constant (0.4) for samples 4–6 but rising as σ falls for samples 1–3. So the points lie on **two straight lines**:`}</Md>
          <Md>{`- **Samples 4–6** (high σ): the clay was consolidated beyond its past maximum, i.e. **normally consolidated**; the NC envelope passes through the origin. Best line through the origin: $\\tau = ${f4(r.nc.b)}\\sigma$ → $\\varphi_{cu} = \\tan^{-1}${f4(r.nc.b)} = ${f2(r.phiNC)}^\\circ$, c = 0.\n- **Samples 1–3** (low σ): **overconsolidated** — stronger than the NC line, with a cohesion intercept. Least squares: $\\tau = ${f2(r.oc.a)} + ${f4(r.oc.b)}\\sigma$ (r² = ${f4(r.oc.r2)}) → c = ${f2(r.oc.a)} kPa, φ = ${f2(r.phiOC)}°.`}</Md>
          <Frame>
            <TauSigmaFig pts={DS7.map((p) => ({ sigma: p.s, tau: p.t }))} env={{ c: 0, phi: r.phiNC }} env2={{ env: { c: r.oc.a, phi: r.phiOC }, color: CE, label: `OC: τ = ${f1(r.oc.a)} + σ tan ${f1(r.phiOC)}°` }} />
          </Frame>
          <Md>{`The break between the two branches marks the largest effective stress the clay has carried — the **preconsolidation pressure**:`}</Md>
          <Tex block>{`${f2(r.oc.a)} + ${f4(r.oc.b)}\\,\\sigma = ${f4(r.nc.b)}\\,\\sigma\\ \\Rightarrow\\ \\sigma = \\frac{${f2(r.oc.a)}}{${f4(r.nc.b)} - ${f4(r.oc.b)}} = ${f1(r.x.x)}\\ \\text{kPa}`}</Tex>
          <Result>{`In situ (stresses below the preconsolidation pressure): **c ≈ ${f1(r.oc.a)} kPa**, φ ≈ ${f1(r.phiOC)}°; NC branch **φcu = ${f1(r.phiNC)}°** (c = 0); **σ′c ≈ ${f1(r.x.x)} kPa**. A hand-drawn pair of lines should land within about ±5 kPa of σ′c.`}</Result>
        </Sol>
      )
    },
    notes: ['The OC line is a least-squares fit through samples 1–3; samples 4–6 lie exactly on τ = 0.4σ.'],
  },
  {
    id: 'sm-2015-16-8a',
    paper: P,
    sec: 'A',
    no: '8(a)',
    marks: 13.33,
    topics: ['sm-struct'],
    title: 'Structure vs fabric; types of soil structure',
    text: 'Distinguish between soil structure and fabric. Describe the various types of soil structure.',
    pages: [31],
    theory: true,
    solution: () => <Model item={th('sm-struct', 't-structures')} />,
  },
  {
    id: 'sm-2015-16-8b',
    paper: P,
    sec: 'A',
    no: '8(b)',
    marks: 10,
    topics: ['sm-plast'],
    title: 'Derive the shrinkage limit when Gs is unknown',
    text: 'Derive the expression for the shrinkage limit of a soil when the specific gravity of soil solids is unknown.',
    pages: [31],
    theory: true,
    flag: 'Shrinkage-limit calculation — not in AJK sir’s slides (SL is only named).',
    solution: () => <Model item={th('sm-plast', 't-sl-unknown')} />,
    notes: ['Printed "shrinkage limit soil" — read as "shrinkage limit of a soil".'],
  },
]
