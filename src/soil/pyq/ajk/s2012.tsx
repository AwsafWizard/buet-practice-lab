// CE 341 term final 2012-13 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1–Q8, answer any SIX, 23⅓ each), held 7 Jun 2014, PDF pp. 25–27; Fig. 1 (basement wall) p26, Fig. 2 (passive wall) p27.
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { K0, type Wall } from '../../engine/earth'
import { circleFromTangentPoint, failurePlane } from '../../engine/mohr'
import { aLine, indices } from '../../engine/plasticity'
import { envelopeTwoPoints, skemptonDu, vaneCu } from '../../engine/shear'
import { MohrFig } from '../../topics/shear/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, CDSandSolution, cdSandChecks, CE, CT, culmannChecks, CulmannSolution, f1, f2, f3, f4, Frame, Head, Model, Result, Sol, Tbl, th, UscsSolved, wallChecks, WallQFig, WallSolved } from './old-kit'

const P = '2012-13' as const

// ---------------------------------------------------------------- Q2 two soils
const SA = { LL: 30, PL: 16, If: 12, w: 32 }
const SB = { LL: 52, PL: 19, If: 6, w: 40 }
const q2 = () => ({ A: indices(SA), B: indices(SB) })
const U2 = { F200: 52, LL: 30, PL: 16 }
const A2 = { P200: 52, LL: 52, PI: 33 }

// ---------------------------------------------------------------- Q3 Skempton
const q3 = () => {
  const du1 = skemptonDu(1, 0, 300 - 200, 300 - 200)
  const u1 = 50 + du1
  const du2 = skemptonDu(1, 0.5, 0, 150)
  return { du1, u1, du2, u2: u1 + du2 }
}

// ---------------------------------------------------------------- Q5 direct shear with a cohesion intercept
const q5 = () => {
  const env = envelopeTwoPoints({ sigma: 0, tau: 30 }, { sigma: 200, tau: 130 })
  const c = circleFromTangentPoint(200, 130, env.phi)
  const fp = failurePlane(c, env.phi)
  return { env, c, fp }
}

// ---------------------------------------------------------------- Q6 (wall height not printed)
const H6 = 6

// ---------------------------------------------------------------- Q7 basement wall at rest
const K01 = K0.mayne(33, 1)
const K02 = K0.mayne(38, 2)
const W7: Wall = {
  layers: [
    { h: 2.5, gamma: 18.5, phi: 33, c: 0, K0: K01, name: 'Soil 1' },
    { h: 3.0, gamma: 19.5, gammaSat: 19.5, phi: 38, c: 0, K0: K02, name: 'Soil 2' },
  ],
  zw: 2.5,
  q: 0,
  state: 'rest',
}

// ---------------------------------------------------------------- Q8 passive, two c–φ layers, q0 not printed
const Q0 = 10
const W8: Wall = {
  layers: [
    { h: 2, gamma: 18, phi: 14, c: 20, name: 'Soil 1' },
    { h: 4, gamma: 19, gammaSat: 19, phi: 17, c: 25, name: 'Soil 2' },
  ],
  zw: 2,
  q: Q0,
  state: 'passive',
}
const W8zero: Wall = { ...W8, q: 0 }

export const A2012: SmQ[] = [
  {
    id: 'sm-2012-13-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 11.33,
    topics: ['sm-struct'],
    title: 'Natural soil deposits by origin and their characteristics',
    text: 'Classify the natural soil deposits based on their origin and briefly indicate the characteristics of each of them.',
    pages: [25],
    theory: true,
    flag: 'Origin of soil deposits — not in AJK sir’s Topic 4 slides (structure and mineralogy only).',
    solution: () => <Model item={th('sm-struct', 't-deposits')} />,
  },
  {
    id: 'sm-2012-13-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 12,
    topics: ['sm-shear'],
    title: 'Vane shear formula with triangular end stresses; special case τ = 3T/(11D³)',
    text: 'Deduce a formula for the shear strength of soil determined by the vane shear test, considering a triangular distribution of stresses at the edge (end) surfaces of the blade. Hence prove that for a special condition the approximate relationship is $\\tau = \\dfrac{3T}{11D^3}$. The symbols have their usual meanings.',
    pages: [25],
    theory: true,
    flag: 'Vane shear test — not in AJK sir’s slides this term.',
    solution: () => {
      const u = vaneCu(1, 1, 2, 2, 'uniform')
      const t = vaneCu(1, 1, 2, 2, 'triangular')
      return (
        <Model
          item={th('sm-shear', 't-vane')}
          post={`**Numbers (H = 2D, T and D in consistent units):** uniform ends $c_u = ${f4(u.cu)}\\,T/D^3$ (= 6/(7π); 3/11 = ${f4(3 / 11)}); triangular ends $c_u = ${f4(t.cu)}\\,T/D^3$ (= 8/(9π)). So the printed 3T/(11D³) is the **uniform-end** result with H = 2D and π ≈ 22/7; with triangular ends the coefficient would be ${f3(t.cu)}. Say so in the answer.`}
        />
      )
    },
    notes: ['The printed result 3T/(11D³) follows from the uniform-end form with H = 2D (6/(7π) ≈ 3/11); the triangular form with H = 2D gives 8T/(9πD³). The wording mixes the two assumptions.'],
  },
  {
    id: 'sm-2012-13-2',
    paper: P,
    sec: 'A',
    no: '2(i)–(iv)',
    marks: 13.33,
    topics: ['sm-plast'],
    title: 'Two soils compared by PI, consistency index, flow index and toughness index',
    text: 'The following are the consistency limit data of two soils A and B:\n\n| | Soil A | Soil B |\n|---|---|---|\n| Liquid limit (%) | 30 | 52 |\n| Plastic limit (%) | 16 | 19 |\n| Flow index | 12 | 6 |\n| Natural water content (%) | 32 | 40 |\n\nFind which soil is (i) more plastic, (ii) a better foundation material on remoulding, (iii) of better strength as a function of water content, and (iv) of better shear strength at the plastic limit.',
    pages: [25],
    flag: 'Consistency index and toughness index — not in AJK sir’s slides (PI, LI and flow index are).',
    given: [],
    checks: () => {
      const r = q2()
      return [
        { key: 'piA', label: 'PI of soil A', value: r.A.PI },
        { key: 'piB', label: 'PI of soil B', value: r.B.PI },
        { key: 'ciA', label: 'Consistency index $I_c$ of soil A', value: r.A.CI, tol: 0.02 },
        { key: 'ciB', label: 'Consistency index $I_c$ of soil B', value: r.B.CI, tol: 0.02 },
        { key: 'itA', label: 'Toughness index $I_t = PI/I_f$ of soil A', value: r.A.It, tol: 0.02 },
        { key: 'itB', label: 'Toughness index of soil B', value: r.B.It, tol: 0.02 },
      ]
    },
    solution: () => {
      const r = q2()
      return (
        <Sol>
          <Tbl
            head={['', 'Soil A', 'Soil B', 'Better']}
            rows={[
              ['PI = LL − PL', f2(r.A.PI), f2(r.B.PI), 'B more plastic'],
              ['Ic = (LL − w)/PI', f3(r.A.CI), f3(r.B.CI), 'B (higher Ic)'],
              ['LI = (w − PL)/PI', f3(r.A.LI), f3(r.B.LI), 'B (lower LI)'],
              ['Flow index If', '12', '6', 'B (flatter flow curve)'],
              ['It = PI/If', f3(r.A.It), f3(r.B.It), 'B (tougher)'],
            ]}
          />
          <Md>{`- **(i) More plastic:** the soil with the larger PI — **B** (PI ${f1(r.B.PI)} vs ${f1(r.A.PI)}; ${r.B.burmister.toLowerCase()} vs ${r.A.burmister.toLowerCase()}).
- **(ii) Better foundation material on remoulding:** the one with the higher consistency index (lower liquidity index). Soil A has w = 32 % above its LL = 30 % (Ic = ${f3(r.A.CI)} below 0, LI = ${f3(r.A.LI)} above 1): on remoulding it turns into a **liquid**. Soil B (Ic = ${f3(r.B.CI)}) stays plastic → **B**.
- **(iii) Strength as a function of water content:** the flow index is the slope of the flow curve, i.e. how fast the strength falls as w rises. The smaller flow index (B, 6) means the strength drops more slowly with water → **B**.
- **(iv) Shear strength at the plastic limit:** the toughness index $I_t = PI/I_f$ measures the shear strength at the PL. B has $I_t = ${f2(r.B.It)}$ vs ${f2(r.A.It)} → **B**.`}</Md>
          <Result>{`Soil **B** is better on all four counts.`}</Result>
        </Sol>
      )
    },
    notes: ['Marks for Q2 are printed only for the whole question (23⅓); the split between the comparison and the classification is our estimate.', 'The same question returns in 2016-17 Q5 with the soils swapped.'],
  },
  {
    id: 'sm-2012-13-2-classify',
    paper: P,
    sec: 'A',
    no: '2 (classify)',
    marks: 10,
    topics: ['sm-class'],
    title: 'Soil A by USCS, soil B by AASHTO (both 52 % fines)',
    text: 'Classify soil A as per USCS and soil B using the AASHTO classification system. Both soils contain 52 percent fines (passing No. 200 sieve). (Soil A: LL 30, PL 16; soil B: LL 52, PL 19.)',
    pages: [25],
    given: [],
    checks: () => [
      { key: 'piA', label: 'PI of soil A', value: U2.LL - U2.PL },
      { key: 'aA', label: 'A-line PI at LL = 30', value: aLine(30), tol: 0.01 },
      { key: 'll30', label: 'Soil B: LL − 30 (A-7 subgroup test)', value: A2.LL - 30 },
      { key: 'gi', label: 'Group index of soil B (whole number)', value: aashto(A2).gi.gi, tol: 0.001 },
    ],
    solution: () => {
      const u = uscs(U2)
      const a = aashto(A2)
      return (
        <Sol>
          <Head>Soil A — USCS</Head>
          <UscsSolved inp={U2} />
          <Head>Soil B — AASHTO</Head>
          <AashtoSolved inp={A2} />
          <Result>{`Soil A: **${u.symbol}** (${u.name.toLowerCase()}; "sandy" or "gravelly" lean clay once the sand/gravel split of the 48 % coarse fraction is known). Soil B: **${a.label}**.`}</Result>
        </Sol>
      )
    },
    notes: ['No sieve data beyond F200 = 52 % are given, so the USCS group name of soil A cannot be completed (sandy vs gravelly).'],
  },
  {
    id: 'sm-2012-13-3',
    paper: P,
    sec: 'A',
    no: '3',
    marks: 23.33,
    topics: ['sm-shear'],
    title: "Pore pressure after a cell-pressure rise and a deviator (Skempton's B = 1, A = 0.5)",
    text: 'A triaxial sample under a cell pressure of 200 kN/m² showed a pore pressure of 50 kN/m² and was found to be fully saturated. The cell pressure was raised to 300 kN/m²: what is the pore pressure? Then a deviator stress of 150 kN/m² was applied. Taking A = 0.5, determine the pore pressure.',
    pages: [25],
    flag: "Skempton's pore-pressure parameters A and B — not in AJK sir's slides.",
    given: [],
    checks: () => {
      const r = q3()
      return [
        { key: 'u1', label: 'Pore pressure after the cell pressure is raised to 300 kPa', value: r.u1, unit: 'kPa' },
        { key: 'du2', label: 'Increase in pore pressure due to the deviator', value: r.du2, unit: 'kPa' },
        { key: 'u2', label: 'Pore pressure after the deviator is applied', value: r.u2, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = q3()
      return (
        <Sol>
          <Md>{`Skempton: $\\Delta u = B[\\Delta\\sigma_3 + A(\\Delta\\sigma_1 - \\Delta\\sigma_3)]$. Fully saturated → $B = 1$ (water is far stiffer than the soil skeleton, so it takes the whole all-round increase).`}</Md>
          <Head>Stage 1 — cell pressure 200 → 300 kPa (undrained)</Head>
          <Tex block>{`\\Delta u_1 = B\\,\\Delta\\sigma_3 = 1\\times(300 - 200) = ${f2(r.du1)}\\ \\text{kPa},\\qquad u = 50 + ${f2(r.du1)} = ${f2(r.u1)}\\ \\text{kPa}`}</Tex>
          <Head>Stage 2 — deviator 150 kPa (Δσ3 = 0, Δσ1 = 150)</Head>
          <Tex block>{`\\Delta u_2 = B\\,A\\,(\\Delta\\sigma_1 - \\Delta\\sigma_3) = 1\\times0.5\\times150 = ${f2(r.du2)}\\ \\text{kPa},\\qquad u = ${f2(r.u1)} + ${f2(r.du2)} = ${f2(r.u2)}\\ \\text{kPa}`}</Tex>
          <Result>{`u = **${f1(r.u1)} kPa** after the cell increase and **${f1(r.u2)} kPa** after the deviator. The effective stresses are unchanged in stage 1 (σ′3 = 300 − ${f1(r.u1)} = ${f1(300 - r.u1)} kPa, as before: 200 − 50 = 150).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2012-13-4',
    paper: P,
    sec: 'A',
    no: '4',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CD test on sand (σ3 = 100, Δσ = 250): φ′, failure plane, τmax, obliquity, FS on the τmax plane',
    text: "In a CD triaxial test, a saturated sand specimen failed under an additional axial stress of 250 kN/m² at a cell pressure of 100 kN/m².\n\n- Draw the Mohr circles for the initial and failure stress states.\n- Determine φ′ and the inclination of the failure plane to the horizontal.\n- Find the shear stress on the failure plane and the maximum shear stress τmax, and the orientation of the τmax plane.\n- Compare the maximum obliquity with the obliquity of τmax.\n- Is the factor of safety with respect to shear strength more than 1 on the plane of τmax?",
    pages: [25],
    given: [],
    checks: () => cdSandChecks(100, 250, true),
    solution: () => <CDSandSolution s3={100} dev={250} extra initial />,
  },
  {
    id: 'sm-2012-13-5',
    paper: P,
    sec: 'A',
    no: '5',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'Direct shear on silty sand (0, 30) and (200, 130): φ, principal stresses, failure-plane stresses',
    text: 'A direct shear test was performed in a 60 mm × 60 mm square box on a silty sand. At zero normal load it sheared at 30 kN/m². An identical sample under a normal stress of 200 kN/m² failed at a shear stress of 130 kN/m². Determine:\n\n(i) the angle of internal friction φ;\n(ii) the principal stresses, by drawing a Mohr circle tangent at (200, 130);\n(iii) the normal and shear stresses on a properly oriented failure plane.',
    pages: [26],
    given: [],
    checks: () => {
      const r = q5()
      return [
        { key: 'c', label: 'Cohesion intercept c', value: r.env.c, unit: 'kPa' },
        { key: 'phi', label: 'φ', value: r.env.phi, unit: '°', tol: 0.01 },
        { key: 's1', label: 'Major principal stress σ1', value: r.c.s1, unit: 'kPa' },
        { key: 's3', label: 'Minor principal stress σ3', value: r.c.s3, unit: 'kPa' },
        { key: 'th', label: 'Failure plane from the major principal plane, 45 + φ/2', value: r.fp.theta, unit: '°', tol: 0.01 },
        { key: 'sf', label: 'Normal stress on the failure plane', value: r.fp.sigma, unit: 'kPa' },
        { key: 'tf', label: 'Shear stress on the failure plane', value: r.fp.tau, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = q5()
      const tp = Math.tan((r.env.phi * Math.PI) / 180)
      return (
        <Sol>
          <Md>{`**(i)** Both failure points lie on the Mohr–Coulomb envelope $\\tau_f = c + \\sigma\\tan\\varphi$. At σ = 0, τ = 30 → **c = ${f2(r.env.c)} kPa**. Slope: $\\tan\\varphi = (130 - 30)/(200 - 0) = ${f4(tp)}$ → **φ = ${f2(r.env.phi)}°**. (The box size is not needed — stresses are given.)`}</Md>
          <Md>{`**(ii)** The circle at failure is tangent to the envelope at F(200, 130). Its centre is where the **normal to the envelope at F** meets the σ-axis:`}</Md>
          <Tex block>{`C = \\sigma_F + \\tau_F\\tan\\varphi = 200 + 130(${f4(tp)}) = ${f2(r.c.C)},\\qquad R = \\frac{\\tau_F}{\\cos\\varphi} = \\frac{130}{${f4(Math.cos((r.env.phi * Math.PI) / 180))}} = ${f2(r.c.R)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\sigma_1 = C + R = ${f2(r.c.s1)}\\ \\text{kPa},\\qquad \\sigma_3 = C - R = ${f2(r.c.s3)}\\ \\text{kPa}`}</Tex>
          <Frame>
            <MohrFig
              height={280}
              circles={[{ c: r.c, color: CT, label: 'failure circle' }]}
              envs={[{ env: r.env, color: CE, label: `τ = ${f1(r.env.c)} + σ tan ${f2(r.env.phi)}°` }]}
              points={[
                { s: 0, t: 30, color: CE, label: '(0, 30)' },
                { s: 200, t: 130, color: 'var(--c-load)', label: 'F (200, 130) = pole', dx: -110 },
              ]}
              lines={[
                { s1: r.c.C, t1: 0, s2: 200, t2: 130, color: 'var(--c-mute)', dash: true },
                { s1: 200, t1: 130, s2: r.c.s1, t2: 0, color: 'var(--c-accent)', dash: true },
              ]}
            />
          </Frame>
          <Md>{`**(iii)** In the direct shear box the failure plane is **horizontal** (the plane between the two halves), and F is the stress on it, so F is also the **pole**. A line from the pole to σ1 gives the major principal plane: it makes $45 + \\varphi/2 = ${f2(r.fp.theta)}^\\circ$ with the failure plane (2θ = 90 + φ = ${f2(r.fp.twoTheta)}° at the centre). On the failure plane:`}</Md>
          <Tex block>{`\\sigma_f = C - R\\sin\\varphi = ${f2(r.c.C)} - ${f2(r.c.R)}\\sin ${f2(r.env.phi)}^\\circ = ${f2(r.fp.sigma)},\\qquad \\tau_f = R\\cos\\varphi = ${f2(r.fp.tau)}\\ \\text{kPa}`}</Tex>
          <Result>{`φ = **${f2(r.env.phi)}°** (c = ${f1(r.env.c)} kPa); σ1 = **${f1(r.c.s1)} kPa**, σ3 = **${f1(r.c.s3)} kPa**; on the failure plane (horizontal, at ${f2(r.fp.theta)}° to the major principal plane) σ = **${f1(r.fp.sigma)} kPa**, τ = **${f1(r.fp.tau)} kPa** — the measured failure point, as it must be.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "property oriented" read as "properly oriented".'],
  },
  {
    id: 'sm-2012-13-6',
    paper: P,
    sec: 'A',
    no: '6',
    marks: 23.33,
    topics: ['sm-lep'],
    title: "Active thrust on a smooth wall by Culmann's method vs Rankine (φ = 35°, γ = 16; H assumed 6 m)",
    text: "A vertical, smooth-backed retaining wall supports a dry cohesionless soil (γ = 16 kN/m³, φ = 35°) with a horizontal backfill surface. Determine the total active thrust by Culmann's graphical method and compare it with Rankine's method.",
    pages: [26],
    flag: "Culmann's graphical method — not in AJK sir's slides this term.",
    given: [],
    figure: () => <WallQFig w={{ layers: [{ h: H6, gamma: 16, phi: 35, c: 0 }], zw: null, q: 0, state: 'active' }} />,
    checks: () => culmannChecks(H6, 16, 35, 0, 'active'),
    solution: () => (
      <>
        <Md>{`**Wall height is not printed** — "assume reasonable values": H = ${H6} m (the passive twin, 2015-16 Q6, uses 6 m). Every thrust below scales with H².`}</Md>
        <CulmannSolution H={H6} gamma={16} phi={35} state="active" compare="rankine" />
      </>
    ),
    notes: ['Print problem: the wall height is missing. H = 6 m assumed; Pa = ½γH²Ka = 2.168H² kN/m for any H.'],
  },
  {
    id: 'sm-2012-13-7-theory',
    paper: P,
    sec: 'A',
    no: '7 (theory)',
    marks: 8.33,
    topics: ['sm-lep'],
    title: 'Basic considerations of Rankine and Coulomb theories',
    text: 'What are the basic considerations of Rankine and Coulomb theories of earth pressure?',
    pages: [26],
    theory: true,
    flag: "Coulomb's theory (half of the answer) — not in AJK sir's slides this term.",
    solution: () => <Model item={th('sm-lep', 't-walls')} />,
    notes: ['Q7 carries 23⅓ marks in total; the theory/numerical split is our estimate.'],
  },
  {
    id: 'sm-2012-13-7',
    paper: P,
    sec: 'A',
    no: '7',
    marks: 15,
    topics: ['sm-lep'],
    title: 'At-rest thrust on a basement wall (Fig. 1): two layers, OCR 1 and 2, WT at the interface',
    text: 'Draw the lateral pressure distribution diagram and compute the total lateral thrust coming to the basement wall shown in Fig. 1 with the following data:\n\n- $H_1$ = 2.5 m, $H_2$ = 3.0 m\n- Soil 1: $\\gamma_1$ = 18.5 kN/m³, $\\varphi_1$ = 33°, OCR₁ = 1.0\n- Soil 2: $\\gamma_2$ = 19.5 kN/m³, $\\varphi_2$ = 38°, OCR₂ = 2.0\n- Water table at the interface of soils 1 and 2.',
    pages: [26],
    given: [],
    figure: () => <WallQFig w={W7} />,
    checks: () => wallChecks(W7),
    solution: () => (
      <WallSolved
        w={W7}
        lead={`A basement wall is propped by the floors and does not move, so the soil is **at rest**. With OCR given, K0 by Mayne–Kulhawy (Das eq. 13.7), $K_0 = (1 - \\sin\\varphi')\\,OCR^{\\sin\\varphi'}$:\n\n- Soil 1: $K_0 = (1 - \\sin 33°)(1.0)^{\\sin 33°} = ${f3(K01)}$ (= Jaky, NC)\n- Soil 2: $K_0 = (1 - \\sin 38°)(2.0)^{\\sin 38°} = ${f3(1 - Math.sin((38 * Math.PI) / 180))} \\times ${f3(2 ** Math.sin((38 * Math.PI) / 180))} = ${f3(K02)}$\n\nσ′h = K0σ′v in each layer; below the WT γ2 = 19.5 is γsat (γ′ = 9.69) and the water pressure is added with K = 1.`}
        tail="Fig. 1 shows soil on both sides of the box; the thrust above is per metre of one wall face (the other side is equal and opposite)."
      />
    ),
    notes: ['γ2 below the water table taken as γsat.', 'Same figure and pattern, different numbers: 2016-17 Q8.'],
  },
  {
    id: 'sm-2012-13-8',
    paper: P,
    sec: 'A',
    no: '8',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'Passive thrust (Fig. 2): two c–φ layers, WT at the interface, surcharge q0 (value not printed)',
    text: 'The figure (Fig. 2) shows a vertical retaining wall with a horizontal backfill, which may fail in passive mode. Compute and draw all lateral pressures that may act on the wall. Also compute the total lateral thrust and the point of application of the resultant force.\n\n- $H_1$ = 2.0 m, $H_2$ = 4.0 m\n- Soil 1: $\\gamma_1$ = 18.0 kN/m³, $c_1$ = 20 kN/m², $\\varphi_1$ = 14°\n- Soil 2: $\\gamma_2$ = 19.0 kN/m³, $c_2$ = 25 kN/m², $\\varphi_2$ = 17°\n- Water table at the interface; uniform surcharge $q_0$ on the backfill.',
    pages: [26, 27],
    given: [],
    figure: () => <WallQFig w={W8} />,
    checks: () => wallChecks(W8),
    solution: () => {
      const r0 = wallChecks(W8zero)
      const F0 = r0.find((c) => c.key === 'F')!.value
      const z0 = r0.find((c) => c.key === 'zb')!.value
      return (
        <WallSolved
          w={W8}
          lead={`**q0 is drawn but its value is not printed** — "assume reasonable values": $q_0$ = ${Q0} kPa. Rankine **passive**: $\\sigma'_p = (q_0 + \\sigma'_v)K_p + 2c\\sqrt{K_p}$ in each layer (the cohesion term *adds* in the passive case, so there is no tension zone), plus the water pressure below the WT. γ2 = 19 kN/m³ is taken as γsat (γ′ = 9.19).`}
          tail={`**Without the surcharge** (q0 = 0): $P_p$ = ${f1(F0)} kN/m at ${f2(z0)} m above the base. Each 1 kPa of q0 adds ${f2((wallChecks(W8).find((c) => c.key === 'F')!.value - F0) / Q0)} kN/m.`}
        />
      )
    },
    notes: ['Print problem: q0 is shown in Fig. 2 but no value is printed — q0 = 10 kPa assumed (the q0 = 0 answer is in the solution).', 'Marks for Q8 are not printed; 23⅓ by the section rubric.', 'γ2 below the water table taken as γsat.'],
  },
]
