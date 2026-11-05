// CE 341 term final 2016-17 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section B (Q5–Q12, eight questions, answer any six, 23⅓ each), held 15 Jul 2017, PDF pp. 36–37 (Fig. 2 on p37). No aids attached.
import { Md, Tex } from '../../../components/ui'
import { aashto } from '../../engine/classify'
import { K0, solveWall, type Wall } from '../../engine/earth'
import { circle } from '../../engine/mohr'
import { chartZone, indices, linearFromLength, piFromLS } from '../../engine/plasticity'
import { cuFromDeviator, cuPredict, phiFromAngle, phiFromCircle, samplingStages, sigma1f } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import type { SmQ } from '../../types'
import { AashtoSolved, f2, f3, Head, Model, MohrPlot, Result, Sol, Tbl, th, wallChecks, WallSolved } from './kit'

const P = '2016-17' as const

// ---------------------------------------------------------------- Q5
const SOIL_A = { LL: 52, PL: 19, If: 11, w: 32 }
const SOIL_B = { LL: 30, PL: 22, If: 6, w: 40 }

// ---------------------------------------------------------------- Q6 stages
const stages = () => samplingStages(100, 100, 320)
const stageCheck = (i: number) => {
  const s = stages()[i]
  return [
    { key: 'sig', label: 'Total stress σ', value: s.sigma, unit: 'kPa' },
    { key: 'u', label: 'Pore-water pressure u', value: s.u, unit: 'kPa' },
    { key: 'sp', label: "Effective stress σ′", value: s.sigmaP, unit: 'kPa' },
  ]
}
const STAGE_TEXT = 'A saturated clay sample was obtained from the field without allowing the water content and the void ratio to change. The sample was subjected to the following stresses in the field: σ = 240 kN/m², u = 140 kN/m², σ′ = 100 kN/m².'

// ---------------------------------------------------------------- Q8 basement wall
const W8: Wall = {
  layers: [
    { h: 2, gamma: 16.5, phi: 33, c: 0, K0: K0.mayne(33, 1) },
    { h: 4, gamma: 18.5, gammaSat: 18.5, phi: 35, c: 0, K0: K0.mayne(35, 2) },
  ],
  zw: 2,
  q: 0,
  state: 'rest',
}

// ---------------------------------------------------------------- Q11 linear shrinkage → PI
const q11 = () => {
  const LS = linearFromLength(129)
  const PI = piFromLS(LS)
  const PL = 38 - PI
  const k = indices({ LL: 38, PL, w: 29, clay: 24.2 })
  return { LS, PI, PL, k, a: aashto({ P200: 40, LL: 38, PI }) }
}

function BasementFig() {
  const k = 34
  const y0 = 40
  const yG = y0 + 1.2 * k
  const Y = (z: number) => yG + z * k
  const xb = 170,
    wb = 120
  return (
    <svg viewBox="0 0 520 290" className="w-full max-w-[520px] mx-auto block" role="img" aria-label="basement wall, Fig. 2">
      <rect x={30} y={yG} width={xb - 30} height={6 * k} fill="var(--c-soil)" opacity={0.5} />
      <rect x={xb + wb} y={yG} width={200} height={2 * k} fill="var(--c-soil)" opacity={0.45} />
      <rect x={xb + wb} y={Y(2)} width={200} height={4 * k} fill="var(--c-soil)" opacity={0.8} />
      <line x1={20} x2={500} y1={yG} y2={yG} stroke="var(--c-ink)" strokeWidth={1.3} />
      <rect x={xb} y={y0} width={wb} height={Y(6) - y0 + 10} fill="none" stroke="var(--c-ink)" strokeWidth={8} opacity={0.55} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={xb} x2={xb + wb} y1={y0 + 8 + i * 1.95 * k} y2={y0 + 8 + i * 1.95 * k} stroke="var(--c-mute)" strokeWidth={5} />
      ))}
      <line x1={xb + wb} x2={500} y1={Y(2)} y2={Y(2)} stroke="var(--c-water)" strokeDasharray="6 3" strokeWidth={1.4} />
      <path d={`M${470},${Y(2) - 9} l8,0 l-4,7 z`} fill="var(--c-water)" />
      <text x={498} y={Y(2) - 3} fontSize={10} textAnchor="end" fill="var(--c-water)">
        Water table
      </text>
      <text x={xb + wb + 10} y={Y(1) + 4} fontSize={10.5} fill="var(--c-ink)">
        Soil 1: γ1 = 16.5, φ1 = 33°, OCR1 = 1
      </text>
      <text x={xb + wb + 10} y={Y(4) + 4} fontSize={10.5} fill="var(--c-ink)">
        Soil 2: γ2 = 18.5, φ2 = 35°, OCR2 = 2
      </text>
      <g stroke="var(--c-mute)" fill="var(--c-mute)">
        <line x1={xb - 20} x2={xb - 20} y1={yG} y2={Y(2)} />
        <line x1={xb - 20} x2={xb - 20} y1={Y(2)} y2={Y(6)} />
        {[yG, Y(2), Y(6)].map((y) => (
          <line key={y} x1={xb - 26} x2={xb - 14} y1={y} y2={y} />
        ))}
        <text x={xb - 26} y={Y(1) + 4} fontSize={11} textAnchor="end" stroke="none">
          H1 = 2 m
        </text>
        <text x={xb - 26} y={Y(4) + 4} fontSize={11} textAnchor="end" stroke="none">
          H2 = 4 m
        </text>
      </g>
      <text x={260} y={284} fontSize={10} textAnchor="middle" fill="var(--c-faint)">
        Fig. 2 (redrawn): basement box with soil on both sides; unit weights in kN/m³
      </text>
    </svg>
  )
}

export const A2016: SmQ[] = [
  {
    id: 'sm-2016-17-5',
    paper: P,
    sec: 'B',
    no: '5',
    marks: 23.33,
    topics: ['sm-plast', 'sm-class'],
    title: 'Two fine soils: more plastic, better on remoulding, strength vs w, strength at PL; classify soil A',
    text: 'The following results on consistency tests are available for two fine grained soils A and B:\n\n- Liquid limit: soil A 52, soil B 30\n- Plastic limit: soil A 19, soil B 22\n- Flow index: soil A 11, soil B 6\n- Natural water content: soil A 32, soil B 40\n\nWhich soil is – (a) more plastic; (b) better foundation material on remoulding; (c) better shear strength as a function of water content; (d) better shear strength at plastic limit. Also, do the appropriate classification of Soil A based on the data provided.',
    pages: [36],
    given: [],
    checks: () => {
      const a = indices(SOIL_A),
        b = indices(SOIL_B)
      return [
        { key: 'piA', label: 'PI, soil A', value: a.PI },
        { key: 'piB', label: 'PI, soil B', value: b.PI },
        { key: 'ciA', label: 'Consistency index $I_c$, soil A', value: a.CI },
        { key: 'ciB', label: 'Consistency index $I_c$, soil B', value: b.CI },
        { key: 'itA', label: 'Toughness index $I_T = PI/I_F$, soil A', value: a.It },
        { key: 'itB', label: 'Toughness index, soil B', value: b.It },
        { key: 'al', label: 'A-line PI at LL 52 (soil A)', value: chartZone(52, a.PI).aPI },
      ]
    },
    solution: () => {
      const a = indices(SOIL_A),
        b = indices(SOIL_B)
      const z = chartZone(52, a.PI)
      return (
        <Sol>
          <Tbl
            head={['Index', 'Soil A', 'Soil B', 'Better / more']}
            rows={[
              ['PI = LL − PL', f2(a.PI), f2(b.PI), `(a) more plastic: **${a.PI > b.PI ? 'A' : 'B'}**`],
              ['Ic = (LL − w)/PI', f3(a.CI), f3(b.CI), `(b) on remoulding: **${a.CI > b.CI ? 'A' : 'B'}**`],
              ['Flow index IF', '11', '6', `(c) strength vs w: **${SOIL_A.If < SOIL_B.If ? 'A' : 'B'}**`],
              ['IT = PI/IF', f3(a.It), f3(b.It), `(d) at the PL: **${a.It > b.It ? 'A' : 'B'}**`],
            ].map((r) => r.map((c, i) => (i === 3 ? <Md className="inline [&>p]:inline">{c}</Md> : c)))}
          />
          <Md>{`- **(a) Soil A** is more plastic: PI ${f2(a.PI)} against ${f2(b.PI)} (Burmister: A ${a.burmister.toLowerCase()}, B ${b.burmister.toLowerCase()}).\n- **(b) Soil A** is the better foundation material on remoulding: its consistency index ${f3(a.CI)} (medium stiff, w between PL and LL); soil B has $I_c$ = ${f3(b.CI)} < 0 — its natural water content (40) exceeds its LL (30), so once remoulded it turns into a liquid.\n- **(c) Soil B** has the better strength as a function of water content: its flow index (6) is smaller — a flatter flow curve, so its strength falls more slowly as w increases.\n- **(d) Soil A** has the better strength at the plastic limit: toughness index ${f3(a.It)} against ${f3(b.It)}.`}</Md>
          <Head>Classification of soil A</Head>
          <Md>{`Fine-grained, LL = 52 ≥ 50 (H). A-line at LL 52: 0.73(52 − 20) = ${f2(z.aPI)}; PI = ${f2(a.PI)} lies above it (and below the U-line ${f2(z.uPI)}) → **${z.zone}**, inorganic clay of high plasticity (fat clay). Burmister: PI 33 = high plasticity. AASHTO cannot be done without the % passing No. 200.`}</Md>
          <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[460px]">
            <PlasticityChart pts={[{ LL: 52, PI: a.PI, label: 'A' }]} />
          </div>
          <Result>{`(a) A, (b) A, (c) B, (d) A; soil A is **CH** (fat clay, high plasticity).`}</Result>
        </Sol>
      )
    },
    notes: [
      'Soil B’s plastic limit is a handwritten **22** over the print (probably a correction announced in the hall; the hidden original was likely 12). With PL = 12 the toughness indices would tie at 3.0.',
      'Consistency index and toughness index are not on AJK sir’s slides; the four decisions follow the standard rules (PI, Ic, IF, IT).',
    ],
  },
  {
    id: 'sm-2016-17-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 8.33,
    topics: ['sm-shear'],
    title: 'Saturated clay sample on sampling: σ, u, σ′',
    text: `${STAGE_TEXT}\n\n(a) On sampling what are the total, effective and porewater stresses acting on it?`,
    pages: [36],
    given: [],
    checks: () => stageCheck(0),
    solution: () => {
      const s = stages()
      return (
        <Sol>
          <Md>{`When the sample is taken out, the total stress is removed: $\\sigma = 0$. The water content and void ratio do not change, so the soil skeleton keeps its effective stress: $\\sigma' = 100$ kPa. Then $u = \\sigma - \\sigma' = 0 - 100 = -100$ kPa — a **suction** (negative pore pressure, held by menisci at the sample surface).`}</Md>
          <Result>{`σ = **${s[0].sigma}**, u = **${s[0].u}**, σ′ = **${s[0].sigmaP} kPa**.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed marks (8⅓ + 5 × 3) cover (a)–(d).'],
  },
  {
    id: 'sm-2016-17-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Placed in the triaxial cell at 100 kPa: σ, u, σ′',
    text: `${STAGE_TEXT}\n\nThe sample was then placed in a triaxial cell and was subjected to a cell pressure of 100 kN/m². (b) What are the total, effective and porewater stresses acting on it now?`,
    pages: [36],
    given: [],
    checks: () => stageCheck(1),
    solution: () => {
      const s = stages()
      return (
        <Sol>
          <Md>{`Saturated and undrained, so the whole increase in total stress goes into the pore water ($\\Delta u = \\Delta\\sigma_3$, B = 1): $u = -100 + 100 = 0$; σ′ is unchanged.`}</Md>
          <Result>{`σ = **${s[1].sigma}**, u = **${s[1].u}**, σ′ = **${s[1].sigmaP} kPa**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Cell raised to 320 kPa, valves closed: σ, u, σ′',
    text: `${STAGE_TEXT}\n\nThe cell pressure was then raised to 320 kN/m² with the drainage valves closed. (c) What are the total, effective and porewater stresses acting on it now?`,
    pages: [36],
    given: [],
    checks: () => stageCheck(2),
    solution: () => {
      const s = stages()
      return (
        <Sol>
          <Md>{`Valves closed: $\\Delta u = \\Delta\\sigma_3 = 320 - 100 = 220$ kPa, so $u = 220$ kPa and σ′ stays 100 kPa.`}</Md>
          <Result>{`σ = **${s[2].sigma}**, u = **${s[2].u}**, σ′ = **${s[2].sigmaP} kPa**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-6d',
    paper: P,
    sec: 'B',
    no: '6(d)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Valves opened, consolidated under 320 kPa: σ, u, σ′',
    text: `${STAGE_TEXT}\n\nThe drainage valves were then opened and the soil is allowed to consolidate under a cell pressure of 320 kN/m². (d) What are the total, effective and porewater stresses acting on it now?`,
    pages: [36],
    given: [],
    checks: () => stageCheck(3),
    solution: () => {
      const s = stages()
      return (
        <Sol>
          <Md>{`With drainage the excess pore pressure dissipates to the drainage boundary (zero back pressure assumed): $u \\to 0$ and the effective stress rises to the full cell pressure.`}</Md>
          <Tbl head={['Stage', 'σ (kPa)', 'u (kPa)', 'σ′ (kPa)']} rows={[['In the field', '240', '140', '100'], ...s.map((x) => [x.stage, `${x.sigma}`, `${x.u}`, `${x.sigmaP}`])]} />
          <Result>{`σ = **${s[3].sigma}**, u = **${s[3].u}**, σ′ = **${s[3].sigmaP} kPa**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-7',
    paper: P,
    sec: 'B',
    no: '7',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CD test on NC clay: failure plane at 55° → φ′ and deviator stress',
    text: 'A drained triaxial compression test for a normally consolidated clay specimen was conducted with a cell pressure of 100 kPa. After the test, the failure plane on the specimen was observed. The failure plane angle was measured as 55° inclined with the horizontal. What are the effective angle of internal friction and magnitude of deviator stress at failure?',
    pages: [36],
    given: [],
    checks: () => {
      const ph = phiFromAngle(55)
      return [
        { key: 'phi', label: "$\\varphi'$", value: ph, unit: '°' },
        { key: 's1', label: "$\\sigma'_1$ at failure", value: sigma1f(100, { c: 0, phi: ph }), unit: 'kPa' },
        { key: 'dev', label: 'Deviator stress at failure', value: sigma1f(100, { c: 0, phi: ph }) - 100, unit: 'kPa' },
      ]
    },
    solution: () => {
      const ph = phiFromAngle(55)
      const s1 = sigma1f(100, { c: 0, phi: ph })
      const c = circle(s1, 100)
      return (
        <Sol>
          <Md>{`In a triaxial compression test the major principal plane is horizontal (σ1 vertical), so the measured 55° is the failure-plane angle θ from the major principal plane: $\\theta = 45 + \\varphi'/2$.`}</Md>
          <Tex block>{`55 = 45 + \\frac{\\varphi'}{2} \\Rightarrow \\varphi' = 2(55 - 45) = ${f2(ph)}^\\circ`}</Tex>
          <Tex block>{`\\sigma'_1 = \\sigma'_3\\tan^2\\left(45 + \\frac{\\varphi'}{2}\\right) = 100\\tan^2 55^\\circ = ${f2(s1)}\\ \\text{kPa},\\quad \\Delta\\sigma_f = ${f2(s1)} - 100 = ${f2(s1 - 100)}\\ \\text{kPa}`}</Tex>
          <MohrPlot eff={[c]} envE={{ c: 0, phi: ph }} />
          <Result>{`$\\varphi'$ = **${f2(ph)}°**, deviator stress at failure = **${f2(s1 - 100)} kPa** (drained, u = 0, NC so c′ = 0).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-8',
    paper: P,
    sec: 'B',
    no: '8',
    marks: 23.33,
    topics: ['sm-lep'],
    title: 'At-rest pressure on a basement wall: two layers with OCR, WT at 2 m (Mayne–Kulhawy K0)',
    text: 'Compute the lateral earth pressure against the basement wall as shown in Figure 2. The dimensions and parameters are as follows:\n\n- For Layer 1: $H_1$ = 2 m, $\\gamma_1$ = 16.5 kN/m³, $\\varphi_1$ = 33°, OCR₁ = 1\n- For Layer 2: $H_2$ = 4 m, $\\gamma_2$ = 18.5 kN/m³, $\\varphi_2$ = 35°, OCR₂ = 2\n\n(Fig. 2: the water table is at the boundary between the layers.)',
    pages: [36, 37],
    given: [],
    figure: () => <BasementFig />,
    checks: () => wallChecks(W8),
    solution: () => (
      <Sol>
        <Md>{`A basement wall is propped by the floor slabs and cannot move: **at-rest** state. With OCR given, use AJK sir's Mayne–Kulhawy formula $K_0 = (1 - \\sin\\varphi')\\,\\text{OCR}^{\\sin\\varphi'}$:`}</Md>
        <Tex block>{`K_{0,1} = (1 - \\sin 33^\\circ)(1)^{\\sin 33^\\circ} = ${f3(K0.mayne(33, 1))},\\qquad K_{0,2} = (1 - \\sin 35^\\circ)(2)^{\\sin 35^\\circ} = ${f3(K0.jaky(35))}\\times${f3(2 ** Math.sin((35 * Math.PI) / 180))} = ${f3(K0.mayne(35, 2))}`}</Tex>
        <WallSolved w={W8} lead="Layer 2 is below the WT: γ′ = 18.5 − 9.81 = 8.69 kN/m³ and water pressure is added separately (K = 1)." />
        <Result>{`Total lateral force on the wall ≈ **${f2(solveWall(W8).Fs)} kN/m** at ${f2(solveWall(W8).zbar)} m above the base (soil ${f2(solveWall(W8).Fs - solveWall(W8).waterF)}, water ${f2(solveWall(W8).waterF)} kN/m).`}</Result>
      </Sol>
    ),
    notes: ['Typos in print: "kN/m²" for unit weights (kN/m³), the second line says "Layer 1" and "φ1" (read as layer 2, φ2).', 'The water table is taken at the layer interface (2 m) as drawn in Fig. 2.', 'Fig. 2 is the same drawing as 2012-13 Fig. 1.'],
  },
  {
    id: 'sm-2016-17-9',
    paper: P,
    sec: 'B',
    no: '9',
    marks: 23.33,
    topics: ['sm-shear'],
    title: 'CU parameters (total and effective) → deviator and uf at σ3 = 45 kPa',
    text: "A cohesive soil was tested in a consolidated undrained triaxial test with pore pressure measurement, and φ = 24° and c = 26 kPa in the total stress and φ′ = 27° and c′ = 30 kPa were obtained. If the similar specimen were tested under cell pressure of 45 kPa,\n\n(a) What would have been the failure deviator stress?\n(b) What would have been the pore water pressure at failure?",
    pages: [37],
    given: [],
    checks: () => {
      const r = cuPredict(45, { c: 26, phi: 24 }, { c: 30, phi: 27 })
      return [
        { key: 's1', label: '$\\sigma_1$ at failure (total envelope)', value: r.s1, unit: 'kPa' },
        { key: 'dev', label: '(a) Failure deviator stress', value: r.dev, unit: 'kPa' },
        { key: 's3p', label: "$\\sigma'_3$ at failure", value: r.s3p, unit: 'kPa' },
        { key: 'uf', label: '(b) Pore pressure at failure', value: r.uf, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = cuPredict(45, { c: 26, phi: 24 }, { c: 30, phi: 27 })
      const kp = Math.tan(((45 + 12) * Math.PI) / 180)
      const kpe = Math.tan(((45 + 13.5) * Math.PI) / 180)
      return (
        <Sol>
          <Md>{`**(a)** The CU total-stress envelope gives the total circle at failure for σ3 = 45 kPa:`}</Md>
          <Tex block>{`\\sigma_1 = \\sigma_3\\tan^2(45 + \\tfrac{\\varphi}{2}) + 2c\\tan(45 + \\tfrac{\\varphi}{2}) = 45(${f3(kp)})^2 + 2(26)(${f3(kp)}) = ${f2(r.s1)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\Delta\\sigma_f = ${f2(r.s1)} - 45 = ${f2(r.dev)}\\ \\text{kPa}`}</Tex>
          <Md>{`**(b)** The effective circle has the same diameter and must touch the effective envelope: $\\sigma'_1 = \\sigma'_3K'_p + 2c'\\sqrt{K'_p}$ with $\\sqrt{K'_p} = \\tan 58.5° = ${f3(kpe)}$, and $\\sigma'_1 - \\sigma'_3 = ${f2(r.dev)}$:`}</Md>
          <Tex block>{`\\sigma'_3(${f3(kpe * kpe)} - 1) + 2(30)(${f3(kpe)}) = ${f2(r.dev)} \\Rightarrow \\sigma'_3 = ${f2(r.s3p)}\\ \\text{kPa},\\qquad u_f = \\sigma_3 - \\sigma'_3 = 45 - ${f2(r.s3p)} = ${f2(r.uf)}\\ \\text{kPa}`}</Tex>
          <MohrPlot total={[circle(r.s1, 45)]} eff={[circle(r.s1p, r.s3p)]} envT={{ c: 26, phi: 24 }} envE={{ c: 30, phi: 27 }} />
          <Result>{`(a) $\\Delta\\sigma_f$ ≈ **${f2(r.dev)} kPa**; (b) $u_f$ ≈ **${f2(r.uf)} kPa**.`}</Result>
        </Sol>
      )
    },
    notes: ['c′ > c and φ′ > φ is unusual (it implies small positive pore pressures), but the problem is solvable as printed.', 'The "4" in 24° is faint on the photo but does not look like a 1.'],
  },
  {
    id: 'sm-2016-17-10',
    paper: P,
    sec: 'B',
    no: '10',
    marks: 23.33,
    topics: ['sm-lep'],
    title: "Rankine's assumptions; c–φ active pressure; unsupported height in pure clay",
    text: "State the assumptions used in Rankine's theory of earth pressure. Deduce a formula for active earth pressure due to a c-φ backfill and hence derive an expression for theoretical unsupported height in a purely cohesive soil.",
    pages: [37],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-cphi')} />,
  },
  {
    id: 'sm-2016-17-11a',
    paper: P,
    sec: 'B',
    no: '11(a)',
    marks: 7,
    topics: ['sm-plast'],
    title: 'Activity, with PI from the linear shrinkage (129 mm dry length)',
    text: 'After a series of laboratory tests, the following data were established for a fine soil:\n\n- Liquid limit = 38\n- Clay content (particles less than 0.002 mm) = 24.2%\n- Dry length of sample in linear shrinkage test = 129 mm\n- Percent passing 0.075 mm sieve = 40\n- Natural moisture content = 29\n\n(a) Calculate the activity of the soil.',
    pages: [37],
    given: [],
    checks: () => {
      const r = q11()
      return [
        { key: 'ls', label: 'Linear shrinkage (140 mm mould)', value: r.LS, unit: '%' },
        { key: 'pi', label: 'PI ≈ 2.13 LS', value: r.PI },
        { key: 'a', label: 'Activity A = PI/(% clay)', value: r.k.A },
      ]
    },
    solution: () => {
      const r = q11()
      return (
        <Sol>
          <Md>{`No plastic limit is given, so the PI must come from the **linear shrinkage**. The standard BS bar mould is 140 mm long (its length is not printed):`}</Md>
          <Tex block>{`LS = \\left(1 - \\frac{L_d}{L_0}\\right)100 = \\left(1 - \\frac{129}{140}\\right)100 = ${f2(r.LS)}\\%,\\qquad PI \\approx 2.13\\,LS = ${f2(r.PI)}`}</Tex>
          <Tex block>{`A = \\frac{PI}{\\%\\ \\text{clay} (< 2\\,\\mu\\text{m})} = \\frac{${f2(r.PI)}}{24.2} = ${f3(r.k.A)}`}</Tex>
          <Result>{`Activity ≈ **${f2(r.k.A)}** → **${r.k.activity}** clay (A < 0.75, Skempton), i.e. kaolinite-like minerals; PL = LL − PI ≈ ${f2(r.PL)} %.`}</Result>
        </Sol>
      )
    },
    notes: ['Assumes the standard 140 mm linear-shrinkage mould and PI ≈ 2.13 LS (BS 1377); neither is printed.', 'Activity and linear shrinkage are not in the text of AJK sir’s slides.', 'Printed marks (7 + 7 + 9⅓) for (a)–(c).'],
  },
  {
    id: 'sm-2016-17-11b',
    paper: P,
    sec: 'B',
    no: '11(b)',
    marks: 7,
    topics: ['sm-plast'],
    title: 'Liquidity index and consistency state',
    text: 'For the soil of Q11(a) (LL = 38, clay content 24.2 %, linear-shrinkage dry length 129 mm, 40 % passing 0.075 mm, natural moisture content 29): (b) Calculate the liquidity index and comment on the consistency state of the soil.',
    pages: [37],
    given: [],
    checks: () => {
      const r = q11()
      return [
        { key: 'pl', label: 'PL = LL − PI', value: r.PL, unit: '%' },
        { key: 'li', label: 'Liquidity index', value: r.k.LI, tol: 0.04 },
      ]
    },
    solution: () => {
      const r = q11()
      return (
        <Sol>
          <Tex block>{`LI = \\frac{w - PL}{PI} = \\frac{29 - ${f2(r.PL)}}{${f2(r.PI)}} = ${f3(r.k.LI)}`}</Tex>
          <Result>{`LI ≈ **${f2(r.k.LI)}** — between 0 and 1, so the soil is in the **${r.k.state}** state (w = 29 lies between PL ≈ ${f2(r.PL)} and LL = 38): medium strength, soft to firm (consistency index ${f2(r.k.CI)}).`}</Result>
        </Sol>
      )
    },
    notes: ['Depends on the PI estimated from the linear shrinkage in (a).'],
  },
  {
    id: 'sm-2016-17-11c',
    paper: P,
    sec: 'B',
    no: '11(c)',
    marks: 9.33,
    topics: ['sm-class'],
    title: 'AASHTO description: 40 % passing No. 200, LL 38, PI from (a)',
    text: 'For the soil of Q11(a) (LL = 38, 40 % passing the 0.075 mm sieve, PI from the linear shrinkage): (c) Describe the soil as per AASHTO classification system.',
    pages: [37],
    given: [],
    checks: () => {
      const r = q11()
      return [
        { key: 'pi', label: 'PI used', value: r.PI },
        { key: 'gi', label: 'Group index', value: r.a.gi.gi },
      ]
    },
    solution: () => {
      const r = q11()
      return (
        <Sol>
          <AashtoSolved inp={{ P200: 40, LL: 38, PI: r.PI }} lead={`PI ≈ ${f2(r.PI)} from (a). No AASHTO table is attached; use Das Table 5.1.`} />
        </Sol>
      )
    },
    notes: ['Only % passing No. 200 is known; the granular groups are ruled out anyway (40 > 35 %).'],
  },
  {
    id: 'sm-2016-17-12',
    paper: P,
    sec: 'B',
    no: '12',
    marks: 9.33,
    topics: ['sm-shear'],
    title: 'Undrained test on NC clay (σ3 150, Δσ 260, u 50): draw the strength envelopes',
    text: 'In an undrained triaxial test on a specimen of normally consolidated clay at a cell pressure of 150 kPa, the ultimate deviator stress was 260 kPa and ultimate pore pressure was 50 kPa. Draw the appropriate shear strength envelope.',
    pages: [37],
    given: [],
    checks: () => [
      { key: 'c', label: 'Total circle centre', value: 150 + 130, unit: 'kPa' },
      { key: 'ce', label: 'Effective circle centre', value: 100 + 130, unit: 'kPa' },
      { key: 'r', label: 'Radius (both)', value: 130, unit: 'kPa' },
    ],
    solution: () => {
      const t = circle(410, 150),
        e = circle(360, 100)
      const pe = phiFromCircle(100, 260),
        pt = phiFromCircle(150, 260)
      return (
        <Sol>
          <Md>{`Total circle: σ3 = 150, σ1 = 150 + 260 = 410 kPa (centre ${f2(t.C)}, radius ${f2(t.R)}). Effective circle: σ′3 = 150 − 50 = 100, σ′1 = 360 kPa (centre ${f2(e.C)}, same radius). NC clay → the envelopes pass through the origin; draw each tangent to its circle. The **appropriate** envelope for a test with u measured is the **effective** one (φ′ = ${f2(pe)}°); the total-stress line (φcu = ${f2(pt)}°) is shown for comparison, and the undrained strength is the horizontal line τ = cu.`}</Md>
          <MohrPlot total={[t]} eff={[e]} envT={{ c: 0, phi: pt }} envE={{ c: 0, phi: pe }} extra={[{ env: { c: cuFromDeviator(260), phi: 0 }, color: 'var(--c-load)', label: `undrained: τ = cu = ${f2(cuFromDeviator(260))}`, dash: true }]} />
        </Sol>
      )
    },
    notes: ['Printed marks (9⅓ + 7 + 7): 9⅓ for drawing the envelope, 7 each for (a) and (b).'],
  },
  {
    id: 'sm-2016-17-12a',
    paper: P,
    sec: 'B',
    no: '12(a)',
    marks: 7,
    topics: ['sm-shear'],
    title: "φ′ from the single CU test on NC clay",
    text: "For the test of Q12 (NC clay, σ3 = 150 kPa, ultimate deviator stress 260 kPa, ultimate pore pressure 50 kPa): (a) determine the parameter $\\varphi'$.",
    pages: [37],
    given: [],
    checks: () => [{ key: 'phi', label: "$\\varphi'$", value: phiFromCircle(100, 260), unit: '°' }],
    solution: () => {
      const pe = phiFromCircle(100, 260)
      return (
        <Sol>
          <Tex block>{`\\sin\\varphi' = \\frac{\\sigma'_1 - \\sigma'_3}{\\sigma'_1 + \\sigma'_3} = \\frac{360 - 100}{360 + 100} = \\frac{260}{460} = ${f3(Math.sin((pe * Math.PI) / 180))} \\Rightarrow \\varphi' = ${f2(pe)}^\\circ`}</Tex>
          <Result>{`$\\varphi'$ = **${f2(pe)}°** (c′ = 0 for NC clay).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2016-17-12b',
    paper: P,
    sec: 'B',
    no: '12(b)',
    marks: 7,
    topics: ['sm-shear'],
    title: 'Undrained shear strength cu',
    text: 'For the test of Q12 (NC clay, σ3 = 150 kPa, ultimate deviator stress 260 kPa, ultimate pore pressure 50 kPa): (b) determine the undrained shear strength, $c_u$.',
    pages: [37],
    given: [],
    checks: () => [{ key: 'cu', label: '$c_u$', value: cuFromDeviator(260), unit: 'kPa' }],
    solution: () => (
      <Sol>
        <Tex block>{`c_u = \\frac{(\\sigma_1 - \\sigma_3)_f}{2} = \\frac{260}{2} = ${f2(cuFromDeviator(260))}\\ \\text{kPa}`}</Tex>
        <Result>{`$c_u$ = **${f2(cuFromDeviator(260))} kPa** — the radius of the circle (the same for total and effective), i.e. the strength the clay shows under undrained loading from this consolidation pressure.`}</Result>
      </Sol>
    ),
  },
]
