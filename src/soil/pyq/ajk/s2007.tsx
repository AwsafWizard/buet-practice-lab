// CE 341 term final 2007-08 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1 compulsory: any EIGHT of ten 5-mark parts, + any TWO of Q2–Q4), held 19 Jan 2009 ("Geotechnical Engineering-I"), PDF pp. 1–3.
import { Md, Tex } from '../../../components/ui'
import { cuOf, ccOf, uscs } from '../../engine/classify'
import { integrateWall, Ka, pointLoadSigma, solveWall, type Wall } from '../../engine/earth'
import { circle } from '../../engine/mohr'
import { aLine } from '../../engine/plasticity'
import { directShear, failureAngle, fitCircles, samplingStages } from '../../engine/shear'
import { circleCentre, NEWMARK_IF, NEWMARK_RZ, newmarkCount } from '../../engine/stressdist'
import { NewmarkChart } from '../../topics/stress/newmark'
import type { SmQ } from '../../types'
import { cutNumbers, f1, f2, f3, f4, Frame, Head, Model, ncCu, NcCuPlot, ProfilePlot, Result, Sol, SlopingSolution, slopingChecks, Tbl, th, TwoColumnPlan, UscsSolved, wallChecks, WallQFig, WallSolved, MohrPlot } from './old-kit'

const P = '2007-08' as const
const rad = (d: number) => (d * Math.PI) / 180

// ---------------------------------------------------------------- Q1(a) sampling
const st1a = () => samplingStages(100, 100)

// ---------------------------------------------------------------- Q1(c) 6 m cut in clay
const C1c = { cu: 80 / 2, gamma: 16, H: 6 }

// ---------------------------------------------------------------- Q1(g) direct shear
const ds1g = () => directShear([{ N: 0.36, T: 0.18 }], 36e-4, { through0: true })

// ---------------------------------------------------------------- Q2(a) Newmark chart
const N2 = { q: 200, R: 4, z: 4 }
const nm2 = () => {
  const n = newmarkCount((x, y) => x * x + y * y <= N2.R * N2.R, N2.z)
  return { ...n, sz: N2.q * n.I, exact: circleCentre(N2.q, N2.R, N2.z) }
}

// ---------------------------------------------------------------- Q2(b) qu = 220 as printed (inconsistent), 120 in the textbook
const q2b = (qu: number) => {
  const cs = [circle(qu, 0), circle(200, 40)]
  const f = fitCircles(cs)
  return { cs, f, theta: failureAngle(f.phi) }
}

// ---------------------------------------------------------------- Q3(a)
const U3 = { F200: 10, F4: 60, LL: 45, PL: 21, Cu: cuOf(4.75, 0.075), Cc: ccOf(0.075, 0.425, 4.75) }

// ---------------------------------------------------------------- Q3(b) clay over sand
const W3: Wall = {
  layers: [
    { h: 4.5, gamma: 19, phi: 0, c: 18, name: 'clay' },
    { h: 3.0, gamma: 20, phi: 30, c: 0, name: 'sand' },
  ],
  zw: null,
  q: 0,
  state: 'active',
}

// ---------------------------------------------------------------- Q4(a) two column loads + Rankine
const C4 = { Q: 200, x: 5, s: 6, H: 9, gamma: 18, phi: 30 }
const q4a = () => {
  const aMid = (Math.atan(C4.s / 2 / C4.x) * 180) / Math.PI
  const aFar = (Math.atan(C4.s / C4.x) * 180) / Math.PI
  const one = integrateWall((z) => pointLoadSigma(C4.Q, C4.x, C4.H, z), C4.H)
  const mid = integrateWall((z) => 2 * pointLoadSigma(C4.Q, C4.x, C4.H, z, aMid), C4.H)
  const opp = integrateWall((z) => pointLoadSigma(C4.Q, C4.x, C4.H, z) + pointLoadSigma(C4.Q, C4.x, C4.H, z, aFar), C4.H)
  const Pa = 0.5 * C4.gamma * C4.H * C4.H * Ka(C4.phi)
  const crit = mid.P >= opp.P ? mid : opp
  return { aMid, aFar, one, mid, opp, Pa, crit, total: Pa + crit.P, m: C4.x / C4.H }
}

// ---------------------------------------------------------------- Q4(b)
const S4 = { s3: 150, dev: 260, u: 50 }

export const A2007: SmQ[] = [
  {
    id: 'sm-2007-08-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 5,
    topics: ['sm-shear', 'sm-seep'],
    title: 'Undisturbed saturated clay: σ, u, σ′ after sampling and under a 100 kPa cell pressure',
    text: 'A sample of saturated clay is obtained from the field without causing any disturbance and without allowing its water content to change. In the field the sample was subjected to σ = 250 kN/m², u = 150 kN/m², σ′ = 100 kN/m². The sample was placed in a triaxial cell and a cell pressure of 100 kN/m² was applied. What were the values of σ, u and σ′ acting on the sample?',
    pages: [1],
    flag: "Uses Skempton's B = 1 for a saturated sample — B is not in AJK sir's slides.",
    given: [],
    checks: () => {
      const s = st1a()
      return [
        { key: 'u0', label: 'Pore pressure after sampling (σ = 0)', value: s[0].u, unit: 'kPa' },
        { key: 's1', label: 'In the cell: total stress σ', value: s[1].sigma, unit: 'kPa' },
        { key: 'u1', label: 'In the cell: pore pressure u', value: s[1].u, unit: 'kPa' },
        { key: 'e1', label: "In the cell: effective stress σ′", value: s[1].sigmaP, unit: 'kPa' },
      ]
    },
    solution: () => {
      const s = st1a()
      return (
        <Sol>
          <Md>{`No disturbance and no change of water content → the void ratio and hence **σ′ stay at 100 kPa** throughout (a saturated soil can change σ′ only by draining). Any change in total stress on the undrained saturated sample goes into the pore water (B = 1).`}</Md>
          <Tbl head={['Stage', 'σ (kPa)', 'u (kPa)', "σ′ = σ − u (kPa)"]} rows={[['in the field', '250', '150', '100'], ...s.map((x) => [x.stage, f1(x.sigma), f1(x.u), f1(x.sigmaP)])]} />
          <Md>{`On sampling the total stress is removed (σ → 0), so u = σ − σ′ = −${f1(s[0].sigmaP)} kPa: a **suction** holds the sample together. Applying the cell pressure raises u by 100 kPa (B = 1) to ${f1(s[1].u)}.`}</Md>
          <Result>{`In the cell: **σ = ${f1(s[1].sigma)} kPa, u = ${f1(s[1].u)} kPa, σ′ = ${f1(s[1].sigmaP)} kPa.**`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2007-08-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 5,
    topics: ['sm-class'],
    title: 'Sand with 30 % passing #200: possible AASHTO groups',
    text: 'Grain size analysis was done on a sand sample that gave the percent passing #200 sieve as 30. What could be the possible classifications (symbol designation) as per AASHTO?',
    pages: [1],
    theory: true,
    solution: () => <Model item={th('sm-class', 't-f30')} />,
  },
  {
    id: 'sm-2007-08-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 5,
    topics: ['sm-lep'],
    title: 'Does a 6 m temporary vertical cut in clay (qu = 80 kPa, γ = 16) need support?',
    text: 'Do you require a retaining structure to support a 6 m temporary vertical cut in a clay with unconfined compressive strength of 80 kN/m² and γ = 16 kN/m³?',
    pages: [1],
    flag: 'Critical height of an unsupported cut — not in AJK sir’s slides (only the crack depth is).',
    given: [],
    checks: () => {
      const n = cutNumbers(C1c.cu, C1c.gamma)
      return [
        { key: 'cu', label: '$c_u = q_u/2$', value: C1c.cu, unit: 'kPa' },
        { key: 'zc', label: 'Tension-crack depth $2c_u/\\gamma$', value: n.zc, unit: 'm' },
        { key: 'Hc', label: 'Critical height $4c_u/\\gamma$', value: n.Hc, unit: 'm' },
        { key: 'FS', label: 'FS = Hc/H', value: n.Hc / C1c.H, tol: 0.01 },
      ]
    },
    solution: () => {
      const n = cutNumbers(C1c.cu, C1c.gamma)
      return (
        <Sol>
          <Md>{`Temporary (short-term) cut in saturated clay → undrained, φu = 0, $c_u = q_u/2 = ${f1(C1c.cu)}$ kPa. With Ka = 1, σa = γz − 2cu; the cut stands while the net thrust on its face is not positive:`}</Md>
          <Tex block>{`z_c = \\frac{2c_u}{\\gamma} = \\frac{80}{16} = ${f2(n.zc)}\\ \\text{m},\\qquad H_c = \\frac{4c_u}{\\gamma} = \\frac{160}{16} = ${f2(n.Hc)}\\ \\text{m} > 6\\ \\text{m}`}</Tex>
          <Md>{`FS = ${f2(n.Hc)}/6 = ${f2(n.Hc / C1c.H)}. But the tension crack (5 m deep, nearly the whole cut) can fill with rain water, and Terzaghi's crack-adjusted value $H_c = 2.67c_u/\\gamma$ = ${f2(n.Ht)} m leaves a margin of only ${f2(n.Ht / C1c.H)}.`}</Md>
          <Result>{`Theoretically **no** retaining structure is needed (Hc = ${f1(n.Hc)} m exceeds 6 m), but the margin is small once cracks are allowed for (FS ≈ ${f2(n.Ht / C1c.H)}): provide temporary support (shoring) or flatten the cut for safety, and keep it open only briefly.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2007-08-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Oil tank filled rapidly on clay: relevant strength parameter and test',
    text: 'In an oil tank the main load consists of the weight of the oil; oil is often pumped into the tank from some source and the filling process is quite rapid. For investigating the foundation of an oil tank for bearing capacity in a clay soil discuss — (i) what strength parameter(s) or shear strength is relevant? (ii) what test(s) will provide this relevant property?',
    pages: [1],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-cases')} />,
  },
  {
    id: 'sm-2007-08-1e',
    paper: P,
    sec: 'A',
    no: '1(e)',
    marks: 5,
    topics: ['sm-struct'],
    title: 'The geological cycle that forms soil (with sketches)',
    text: 'Briefly describe the geological cycle, with neat sketches, that results in the formation of soil.',
    pages: [1],
    theory: true,
    flag: 'Origin of soils (geological cycle) — not in AJK sir’s Topic 4 slides.',
    solution: () => <Model item={th('sm-struct', 't-cycle')} />,
  },
  {
    id: 'sm-2007-08-1f',
    paper: P,
    sec: 'A',
    no: '1(f)',
    marks: 5,
    topics: ['sm-lep'],
    title: "Rankine active, c = 0: failure-plane orientation by Mohr's circle",
    text: "Use Mohr's circle and Rankine's method to show the orientation of failure plane in a cohesion-less soil in active condition.",
    pages: [1],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-concepts')} />,
  },
  {
    id: 'sm-2007-08-1g',
    paper: P,
    sec: 'A',
    no: '1(g)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Direct shear on remoulded sand: N = 0.36 kN, T = 0.18 kN, A = 36 cm² → φ',
    text: 'A direct shear test performed on a remoulded sand sample yielded the following observations at the time of failure: (i) normal load = 0.36 kN; (ii) shear load = 0.18 kN; (iii) sample area = 36 cm². Determine the angle of internal friction of the soil.',
    pages: [1],
    given: [],
    checks: () => {
      const d = ds1g()
      return [
        { key: 's', label: 'Normal stress σ = N/A', value: d.pts[0].sigma, unit: 'kPa' },
        { key: 't', label: 'Shear stress at failure τf = T/A', value: d.pts[0].tau, unit: 'kPa' },
        { key: 'phi', label: 'φ', value: d.env.phi, unit: '°', tol: 0.01 },
      ]
    },
    solution: () => {
      const d = ds1g()
      return (
        <Sol>
          <Tex block>{`A = 36\\ \\text{cm}^2 = 0.0036\\ \\text{m}^2,\\quad \\sigma = \\frac{0.36}{0.0036} = ${f1(d.pts[0].sigma)}\\ \\text{kPa},\\quad \\tau_f = \\frac{0.18}{0.0036} = ${f1(d.pts[0].tau)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\text{Sand, } c = 0:\\quad \\tan\\varphi = \\frac{\\tau_f}{\\sigma} = ${f3(d.pts[0].tau / d.pts[0].sigma)}\\ \\Rightarrow\\ \\varphi = ${f2(d.env.phi)}^\\circ`}</Tex>
          <Result>{`φ = **${f1(d.env.phi)}°** (the area cancels: tan φ = T/N).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2007-08-1h',
    paper: P,
    sec: 'A',
    no: '1(h)',
    marks: 5,
    topics: ['sm-lep'],
    title: '8 m smooth wall, sand backfill sloping at 15° (φ 32°, γ 16): horizontal thrust',
    text: 'A massive retaining wall 8 m high with a smooth vertical back retains a mass of remoulded moist cohesionless sand with an inclined surface of 15° with the horizontal. The sand weighs 16 kN/m³ and has an angle of internal friction of 32°. What would be the total horizontal thrust coming to the wall?',
    pages: [2],
    flag: 'Sloping backfill — not in AJK sir’s slides this term (horizontal backfill only).',
    given: [],
    checks: () => slopingChecks(8, 16, 32, 15),
    solution: () => (
      <Sol>
        <SlopingSolution H={8} gamma={16} phi={32} beta={15} />
        <Result>{`Total horizontal thrust ≈ **${f1(slopingChecks(8, 16, 32, 15).find((c) => c.key === 'ph')!.value)} kN/m** at 8/3 = ${f2(8 / 3)} m above the base.`}</Result>
      </Sol>
    ),
    notes: ['Printed "coning" read as "coming".'],
  },
  {
    id: 'sm-2007-08-1i',
    paper: P,
    sec: 'A',
    no: '1(i)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Stress–strain curve: yield, peak, ultimate, critical, residual strength; use of residual',
    text: 'Draw typical stress-strain diagram of soil to indicate yield strength, peak strength, ultimate strength, critical strength and residual strength. Under what circumstances is residual strength used?',
    pages: [2],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-ss')} />,
  },
  {
    id: 'sm-2007-08-1j',
    paper: P,
    sec: 'A',
    no: '1(j)',
    marks: 5,
    topics: ['sm-lep'],
    title: 'Qualitative active diagrams, two cohesionless layers, five φ/γ orderings',
    text: 'Draw qualitative active earth pressure distribution diagram in a two layer cohesionless soil system for the following cases: (i) φ1 = φ2, γ1 > γ2; (ii) φ1 > φ2, γ1 = γ2; (iii) φ1 < φ2, γ1 < γ2; (iv) φ1 > φ2, γ1 > γ2; and (v) φ1 < φ2, γ1 > γ2. The subscripts 1 and 2 designate top and bottom layers respectively.',
    pages: [2],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-layers')} />,
  },
  {
    id: 'sm-2007-08-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 25,
    topics: ['sm-stress'],
    title: 'Construct a Newmark chart (0.005) from the circle formula; σz under an 8 m circular raft at 4 m',
    text: 'The vertical stress at a depth z under the centre of a circular loaded area of radius r, carrying a uniform pressure q, is given by $\\sigma_z = q\\left[1 - \\left\\{\\dfrac{1}{1 + (r/z)^2}\\right\\}^{3/2}\\right]$. Using the relationship, draw a Newmark chart having concentric circles and radials, and of intensity 0.005. Hence find the increase of vertical stress caused by a water tank at a depth of 4 m below the centre of the foundation. The water tank is supported by a circular raft foundation having diameter of 8 m. The uniform load intensity of the foundation is 200 kN/m².',
    pages: [2],
    given: [],
    checks: () => {
      const n = nm2()
      return [
        { key: 'r1', label: '$r/z$ of the first circle ($\\sigma_z/q$ = 0.1)', value: NEWMARK_RZ[0], tol: 0.01 },
        { key: 'r5', label: '$r/z$ for $\\sigma_z/q$ = 0.5', value: NEWMARK_RZ[4], tol: 0.01 },
        { key: 'r9', label: '$r/z$ for $\\sigma_z/q$ = 0.9', value: NEWMARK_RZ[8], tol: 0.01 },
        { key: 'N', label: 'Meshes covered by the raft (R/z = 1)', value: n.N, tol: 0.03 },
        { key: 'sz', label: 'Increase of vertical stress at 4 m', value: n.exact, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => {
      const n = nm2()
      return (
        <Sol>
          <Head>1. Radii of the circles</Head>
          <Md>{`Invert the formula: $\\dfrac{r}{z} = \\sqrt{(1 - \\sigma_z/q)^{-2/3} - 1}$. Ten rings, each worth 0.1q:`}</Md>
          <Tbl head={['σz/q', ...NEWMARK_RZ.map((_, i) => f1((i + 1) / 10)), '1.0']} rows={[['r/z', ...NEWMARK_RZ.map((v) => f3(v)), '∞']]} />
          <Head>2. Radials</Head>
          <Md>{`Each ring carries 0.1q; dividing it by **20 radial lines** (18° apart) gives meshes of influence 0.1/20 = **${NEWMARK_IF}**, i.e. 200 meshes in all. The scale bar AB = z.`}</Md>
          <Head>3. Use for the tank</Head>
          <Md>{`Draw the raft to the scale **AB = z = 4 m**: its radius 4 m equals AB, so R/z = 1.0. Place its centre on the chart centre and count the covered meshes (shaded):`}</Md>
          <Frame>
            <div className="max-w-[420px] mx-auto">
              <NewmarkChart z={N2.z} meshes={n.meshes} showRadii />
            </div>
          </Frame>
          <Md>{`R/z = 1.0 lies between circle 6 (r/z = ${f3(NEWMARK_RZ[5])}) and circle 7 (${f3(NEWMARK_RZ[6])}): six full rings (120 meshes) plus part of the seventh — about **N ≈ ${f1(n.N)} meshes**.`}</Md>
          <Tex block>{`\\sigma_z = I\\,N\\,q = ${NEWMARK_IF}\\times${f1(n.N)}\\times200 = ${f1(n.sz)}\\ \\text{kPa}`}</Tex>
          <Md>{`Check by the formula: $\\sigma_z = 200[1 - (1/2)^{3/2}] = ${f2(n.exact)}$ kPa.`}</Md>
          <Result>{`Increase of vertical stress at 4 m below the centre ≈ **${f1(n.exact)} kPa** (≈ ${f1(n.N)} meshes × 0.005 × 200).`}</Result>
        </Sol>
      )
    },
    notes: ['The printed formula omits the factor q ("σz = [1 − …]") — it is σz/q.', "Stress distribution is SJMY sir's topic but sits in Section A this year."],
  },
  {
    id: 'sm-2007-08-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'c and φ from an unconfined test (qu = 220 as printed) and one triaxial test; failure-plane angle',
    text: 'A soil has an unconfined compressive strength of 220 kN/m². In a triaxial compression test, a specimen of the same soil when subjected to a cell pressure of 40 kN/m² failed at an additional stress of 160 kN/m². Determine (i) the strength parameters of the soil; (ii) the angle of failure plane in the triaxial test.',
    pages: [2],
    flag: 'Print problem: with qu = 220 kPa the two circles have no common tangent; the textbook version has qu = 120 kPa.',
    given: [],
    checks: () => {
      const r = q2b(120)
      return [
        { key: 'phi', label: 'φ (with qu = 120 kPa)', value: r.f.phi, unit: '°', tol: 0.02 },
        { key: 'c', label: 'c (with qu = 120 kPa)', value: r.f.c, unit: 'kPa', tol: 0.03 },
        { key: 'th', label: 'Failure plane to the major principal plane (horizontal)', value: r.theta, unit: '°', tol: 0.01 },
      ]
    },
    solution: () => {
      const a = q2b(220)
      const b = q2b(120)
      const [u, t] = a.cs
      return (
        <Sol>
          <Head>As printed (qu = 220 kPa)</Head>
          <Md>{`Unconfined circle: σ3 = 0, σ1 = 220 → C = ${f1(u.C)}, R = ${f1(u.R)}. Triaxial circle: σ3 = 40, σ1 = 200 → C = ${f1(t.C)}, R = ${f1(t.R)}. A common tangent needs $\\sin\\varphi = (R_2 - R_1)/(C_2 - C_1) = (${f1(t.R)} - ${f1(u.R)})/(${f1(t.C)} - ${f1(u.C)}) = ${f1((t.R - u.R) / (t.C - u.C))}$ — impossible. The triaxial circle (40–200) lies **inside** the unconfined circle (0–220): a specimen under confinement cannot fail at a lower σ1 than an unconfined one. **The data are inconsistent.**`}</Md>
          <MohrPlot total={a.cs} />
          <Head>With qu = 120 kPa (the textbook problem)</Head>
          <Md>{`Circles (0, 120): C = ${f1(b.cs[0].C)}, R = ${f1(b.cs[0].R)}; (40, 200): C = ${f1(b.cs[1].C)}, R = ${f1(b.cs[1].R)}.`}</Md>
          <Tex block>{`\\sin\\varphi = \\frac{R_2 - R_1}{C_2 - C_1} = \\frac{80 - 60}{120 - 60} = ${f4(Math.sin(rad(b.f.phi)))} \\Rightarrow \\varphi = ${f2(b.f.phi)}^\\circ`}</Tex>
          <Tex block>{`c = \\frac{R_1 - C_1\\sin\\varphi}{\\cos\\varphi} = \\frac{60 - 60(${f4(Math.sin(rad(b.f.phi)))})}{${f4(Math.cos(rad(b.f.phi)))}} = ${f2(b.f.c)}\\ \\text{kPa}`}</Tex>
          <MohrPlot total={b.cs} envT={b.f} />
          <Tex block>{`\\theta = 45 + \\frac{\\varphi}{2} = 45 + \\frac{${f2(b.f.phi)}}{2} = ${f2(b.theta)}^\\circ\\ \\text{to the horizontal (major principal plane)}`}</Tex>
          <Result>{`As printed the data have no solution (say so). With qu = 120 kPa: **c = ${f1(b.f.c)} kPa, φ = ${f1(b.f.phi)}°**, failure plane at **${f1(b.theta)}°** to the horizontal.`}</Result>
          <Md>{`*Other way out:* if the clay is taken as φ = 0 the two tests should give the same deviator; 220 vs 160 kPa contradicts that too. Write the inconsistency and solve with a stated correction.`}</Md>
        </Sol>
      )
    },
    notes: ['Print problem: qu = 220 kN/m² as printed makes the triaxial circle lie inside the unconfined circle (sin φ = −3); solved as printed (shown inconsistent) and with qu = 120 kN/m², the textbook value.', 'Printed "plain" read as "plane".'],
  },
  {
    id: 'sm-2007-08-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['sm-class'],
    title: 'USCS: 10 % fines, 30 % passing #40, 60 % passing #4, LL 45, PL 21 (dual symbol)',
    text: 'A soil has the following characteristics: percent passing #200 sieve (75 µ) = 10; percent passing #40 sieve (0.425 mm) = 30; percent passing #4 sieve (4.76 mm) = 60; liquid limit of fraction passing #40 = 45; plastic limit of fraction passing #40 = 21. Classify the soil as per USCS.',
    pages: [2],
    given: [],
    checks: () => [
      { key: 'cu', label: '$C_u = D_{60}/D_{10}$', value: U3.Cu, tol: 0.02 },
      { key: 'cc', label: '$C_c$', value: U3.Cc, tol: 0.02 },
      { key: 'g', label: '% gravel', value: 100 - U3.F4, unit: '%' },
      { key: 's', label: '% sand', value: U3.F4 - U3.F200, unit: '%' },
      { key: 'A', label: 'A-line PI at LL = 45', value: aLine(45), tol: 0.01 },
    ],
    solution: () => {
      const u = uscs(U3)
      return (
        <Sol>
          <Md>{`The given percentages sit exactly at 10, 30 and 60 % finer, so $D_{10}$ = 0.075 mm (#200), $D_{30}$ = 0.425 mm (#40), $D_{60}$ = 4.75 mm (#4):`}</Md>
          <Tex block>{`C_u = \\frac{4.75}{0.075} = ${f2(U3.Cu)},\\qquad C_c = \\frac{0.425^2}{4.75\\times0.075} = ${f3(U3.Cc)}`}</Tex>
          <UscsSolved inp={U3} />
          <Result>{`**${u.symbol}** — ${u.name.toLowerCase()}.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "pashing" read as "passing"; #4 = 4.75 mm (printed 4.76).'],
  },
  {
    id: 'sm-2007-08-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: '7.5 m smooth wall: 4.5 m clay (c 18, φ 0) over 3 m sand (φ 30°) — active pressure and thrust',
    text: 'A 7.5 m high vertical back smooth retaining wall is supporting two layers of soil with the following details.\n\n| Layer | Thickness | γ | c | φ |\n|---|---|---|---|---|\n| Top | 4.5 m | 19 kN/m³ | 18 kN/m² | 0 |\n| Bottom | 3.0 m | 20 kN/m³ | 0 | 30° |',
    pages: [3],
    given: [],
    figure: () => <WallQFig w={W3} />,
    checks: () => wallChecks(W3, { before: true }),
    solution: () => (
      <WallSolved
        w={W3}
        lead="No ask is printed beyond the data: find the Rankine active pressure diagram, the total thrust and its point of application. Top clay: φ = 0, Ka = 1, σa = γz − 2c → negative near the top (tension crack, dropped). Bottom sand: Ka = 1/3 and c = 0, so the diagram drops at the interface from (γ1h1 − 2c) to γ1h1/3. No water table."
      />
    ),
    notes: ['The question gives only the data table; the active diagram, total thrust and its location are assumed to be asked.'],
  },
  {
    id: 'sm-2007-08-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Two 200 kN column loads 5 m behind a 9 m wall, 6 m apart: active thrust including the loads',
    text: 'Two concentrated column loads of 200 kN are acting at equal distances of 5 m from the back of a vertical smooth retaining wall. The columns are placed at the backfill surface 6 m apart from each other. The backfill is sand, level with the top of the wall, having φ = 30° and γ = 18 kN/m³. The retaining wall is 9.0 m high. Calculate the active thrust coming to the wall. Given that\n\n$$\\sigma_{x1} = \\frac{1.77Q}{H^2}\\,\\frac{m^2n^2}{(m^2 + n^2)^3};\\quad \\sigma_{x2} = \\frac{0.28Q}{H^2}\\,\\frac{n^2}{(0.16 + n^2)^3};\\quad \\sigma_{x\\alpha} = \\sigma_x\\cos^2(1.1\\alpha)$$',
    pages: [3],
    flag: 'Lateral pressure from point loads behind a wall — not in AJK sir’s slides this term (the Rankine part is).',
    given: [{ label: 'Point-load formulas', what: 'printed in the question', ref: 'e-wallload', formula: true }],
    figure: () => <TwoColumnPlan x={C4.x} s={C4.s} />,
    checks: () => {
      const r = q4a()
      return [
        { key: 'm', label: '$m = x/H$', value: r.m, tol: 0.01 },
        { key: 'P1', label: 'One load, section opposite it', value: r.one.P, unit: 'kN/m', tol: 0.03 },
        { key: 'Pm', label: 'Both loads, section midway (α each)', value: r.mid.P, unit: 'kN/m', tol: 0.03 },
        { key: 'Pa', label: 'Rankine active thrust of the backfill', value: r.Pa, unit: 'kN/m' },
        { key: 'P', label: 'Total active thrust (critical section)', value: r.total, unit: 'kN/m', tol: 0.01 },
      ]
    },
    solution: () => {
      const r = q4a()
      const w: Wall = { layers: [{ h: C4.H, gamma: C4.gamma, phi: C4.phi, c: 0 }], zw: null, q: 0, state: 'active' }
      const rw = solveWall(w)
      const cMid = Math.cos(rad(1.1 * r.aMid)) ** 2
      const cFar = Math.cos(rad(1.1 * r.aFar)) ** 2
      return (
        <Sol>
          <Head>1. Backfill (Rankine)</Head>
          <Tex block>{`K_a = \\tan^2 30^\\circ = ${f3(Ka(30))},\\qquad P_a = \\tfrac12(18)(9)^2(${f3(Ka(30))}) = ${f2(rw.Fs)}\\ \\text{kN/m at } 3\\ \\text{m above the base}`}</Tex>
          <Head>2. Column loads (modified Boussinesq)</Head>
          <Md>{`$m = x/H = 5/9 = ${f3(r.m)} > 0.4$ → use $\\sigma_{x1}$ with $n = z/H$. Away from the section through a load, multiply by $\\cos^2(1.1\\alpha)$, α = plan angle between the wall normal through the load and the line to the section.`}</Md>
          <Md>{`- **Section midway between the columns:** each load is 3 m along the wall, α = tan⁻¹(3/5) = ${f2(r.aMid)}°, cos²(1.1α) = ${f3(cMid)}; two loads.\n- **Section opposite one column:** that load α = 0; the other at 6 m, α = tan⁻¹(6/5) = ${f2(r.aFar)}°, cos²(1.1α) = ${f3(cFar)}.`}</Md>
          <Frame>
            <ProfilePlot
              H={C4.H}
              curves={[
                { f: (z) => pointLoadSigma(C4.Q, C4.x, C4.H, z), color: 'var(--c-mute)', label: 'one load, α = 0', dash: true },
                { f: (z) => pointLoadSigma(C4.Q, C4.x, C4.H, z) + pointLoadSigma(C4.Q, C4.x, C4.H, z, r.aFar), color: 'var(--c-accent2)', label: 'opposite a column', dash: true },
                { f: (z) => 2 * pointLoadSigma(C4.Q, C4.x, C4.H, z, r.aMid), color: 'var(--c-load)', label: 'midway (both)' },
              ]}
            />
          </Frame>
          <Tbl
            head={['Section', 'Force from the loads (kN/m)', 'Height above base (m)']}
            rows={[
              ['one load alone, opposite it', f2(r.one.P), f2(r.one.arm)],
              ['opposite one column (both loads)', f2(r.opp.P), f2(r.opp.arm)],
              ['midway between the columns', f2(r.mid.P), f2(r.mid.arm)],
            ]}
            cap="Integrated down the wall by Simpson's rule (400 strips)."
          />
          <Result>{`Critical section: ${r.crit === r.mid ? 'midway between the columns' : 'opposite a column'}, ${f1(r.crit.P)} kN/m from the loads. **Total active thrust ≈ ${f2(r.Pa)} + ${f2(r.crit.P)} = ${f1(r.total)} kN/m**, the surcharge part acting about ${f2(r.crit.arm)} m above the base and the Rankine part at 3 m.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "Cn²(1.1α)" read as cos²(1.1α); "Give that" as "Given that".', 'The modified Boussinesq formulas apply to a rigid (non-yielding) wall; adding them to the Rankine active thrust follows the question.'],
  },
  {
    id: 'sm-2007-08-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'CU test on NC clay (σ3 = 150, deviator 260, uf = 50): cu with φu = 0, and φ′ with c′ = 0',
    text: 'In a consolidated undrained triaxial test on a specimen of clay normally consolidated at a cell pressure of 150 kN/m², the deviator stress at failure was 260 kN/m² and the pore pressure at failure was 50 kN/m². Draw the appropriate shear strength envelope and determine the other corresponding parameter when (i) $\\varphi_u$ = 0; and (ii) c′ = 0.',
    pages: [3],
    given: [],
    checks: () => {
      const r = ncCu(S4.s3, S4.dev, S4.u)
      return [
        { key: 'cu', label: '(i) $c_u$ with $\\varphi_u = 0$', value: r.cu, unit: 'kPa' },
        { key: 'phip', label: "(ii) φ′ with c′ = 0", value: r.phiE, unit: '°', tol: 0.01 },
        { key: 'phit', label: 'φcu (total envelope through the origin)', value: r.phiT, unit: '°', tol: 0.01 },
      ]
    },
    solution: () => {
      const r = ncCu(S4.s3, S4.dev, S4.u)
      return (
        <Sol>
          <Md>{`Total circle: σ3 = 150, σ1 = 410 kPa. Effective circle: σ′3 = 150 − 50 = ${f1(r.eff.s3)}, σ′1 = ${f1(r.eff.s1)} kPa (same diameter ${f1(S4.dev)}).`}</Md>
          <Md>{`**(i) φu = 0** — a horizontal envelope tangent to the top of the total circle (undrained, total stress):`}</Md>
          <Tex block>{`c_u = \\frac{\\sigma_1 - \\sigma_3}{2} = \\frac{260}{2} = ${f2(r.cu)}\\ \\text{kPa}`}</Tex>
          <Md>{`**(ii) c′ = 0** — an envelope through the origin tangent to the effective circle (NC clay):`}</Md>
          <Tex block>{`\\sin\\varphi' = \\frac{\\sigma'_1 - \\sigma'_3}{\\sigma'_1 + \\sigma'_3} = \\frac{260}{${f1(r.eff.s1 + r.eff.s3)}} = ${f4(Math.sin(rad(r.phiE)))} \\Rightarrow \\varphi' = ${f2(r.phiE)}^\\circ`}</Tex>
          <NcCuPlot s3={S4.s3} dev={S4.dev} u={S4.u} phiU0 />
          <Result>{`(i) **cu = ${f1(r.cu)} kPa** (φu = 0); (ii) **φ′ = ${f1(r.phiE)}°** (c′ = 0). For reference, a total envelope through the origin would give φcu = ${f1(r.phiT)}°, and Af = 50/260 = ${f2(r.Af)}.`}</Result>
        </Sol>
      )
    },
  },
]

