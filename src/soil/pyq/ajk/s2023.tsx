// CE 341 term final 2023-24 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1–Q4), held 24 Aug 2025, PDF pp. 70–72.
import { Md, Tex } from '../../../components/ui'
import { sieveAnalysis, grading, gradeOf, uscs } from '../../engine/classify'
import type { Wall } from '../../engine/earth'
import { failurePlane } from '../../engine/mohr'
import { ALL_KEYS, cylinderVolume, formulaRoute, nf, solvePhase, unitSys } from '../../engine/phase'
import { chartZone, flowCurve, indices, waterContent } from '../../engine/plasticity'
import { fitCircles, phiFromCircle, triaxCircles, type TriaxTest } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import { GradingCurve } from '../../topics/class/figs'
import { FlowPlot } from '../../topics/plast/figs'
import { PhaseBlocks, PhaseStepsView } from '../../topics/wv/figs'
import type { SmQ } from '../../types'
import { CE, CT, f2, f3, FitText, Head, Model, Models, MohrPlot, Result, Sol, Tbl, th, TriaxTable, TrueFalse, wallChecks, WallQFig, WallSolved } from './kit'

const P = '2023-24' as const

// ---------------------------------------------------------------- Q1(a) UCS specimen
const V1 = cylinderVolume(1.5, 3)
const ph1 = () => solvePhase({ V: V1, W: 186.5, Ws: 160, Gs: 2.65 }, 1)

// ---------------------------------------------------------------- Q2(a) wall
const W2: Wall = { layers: [{ h: 6, gamma: 16, gammaSat: 18, phi: 35, c: 10 }], zw: 2, q: 20, state: 'active' }

// ---------------------------------------------------------------- Q3(a) CU series
const T3: TriaxTest[] = [
  { s3: 430, dev: 250, u: 25 },
  { s3: 470, dev: 298, u: 35 },
  { s3: 550, dev: 390, u: 73 },
]
const cu3 = () => {
  const tc = triaxCircles(T3)
  const eff = tc.eff!
  return { tc, eff, fT: fitCircles(tc.total), fE: fitCircles(eff), t13: fitCircles([tc.total[0], tc.total[2]]), e13: fitCircles([eff[0], eff[2]]), zT: fitCircles(tc.total, { forceC0: true }), zE: fitCircles(eff, { forceC0: true }) }
}

// ---------------------------------------------------------------- Q4(a) sieve
const SIEVE4 = [
  { no: '4', d: 4.75, ret: 0 },
  { no: '10', d: 2.0, ret: 40 },
  { no: '20', d: 0.85, ret: 60 },
  { no: '40', d: 0.425, ret: 89 },
  { no: '60', d: 0.25, ret: 140 },
  { no: '80', d: 0.18, ret: 122 },
  { no: '100', d: 0.15, ret: 210 },
  { no: '200', d: 0.075, ret: 56 },
]
const sv4 = () => {
  const s = sieveAnalysis(
    SIEVE4.map((x) => ({ d: x.d, ret: x.ret })),
    12,
  )
  return { s, g: grading(s.pts), gl: grading(s.pts, 'linear') }
}

// ---------------------------------------------------------------- Q4(b) cup
const CUP4 = [
  { N: 11, tare: 7.1, wet: 29.9, dry: 20.6 },
  { N: 17, tare: 7.0, wet: 30.1, dry: 20.9 },
  { N: 23, tare: 6.9, wet: 30.8, dry: 21.6 },
  { N: 30, tare: 10.6, wet: 34.0, dry: 25.2 },
  { N: 38, tare: 10.9, wet: 31.0, dry: 23.7 },
]
const cup4 = () => {
  const ws = CUP4.map((r) => waterContent(r))
  const fc = flowCurve(CUP4.map((r, i) => ({ N: r.N, w: ws[i].w })))
  const k = indices({ LL: fc.LL, PL: 27 })
  return { ws, fc, k, z: chartZone(fc.LL, k.PI) }
}

export const A2023: SmQ[] = [
  {
    id: 'sm-2023-24-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 20,
    topics: ['sm-wv'],
    title: 'Phase relations of a UCS specimen (1.5 × 3 in., 186.5 g wet, 160 g dry)',
    text: 'Following are the data obtained from an unconfined compression strength test on a clay specimen:\n\n- Diameter of the specimen = 1.5 inch, height = 3.0 inch\n- Weight of wet specimen = 186.5 gm\n- Weight of dry specimen = 160.0 gm\n- Specific gravity = 2.65\n\nDetermine: moisture content, degree of saturation, moist unit weight (gm/cc), dry unit weight (gm/cc), void ratio and porosity of the soil specimen. Is the moist unit weight equal to saturated unit weight for this particular specimen? Comment.',
    pages: [70],
    given: [],
    checks: () => {
      const v = ph1().vals
      return [
        { key: 'V', label: 'Volume of the specimen', value: V1, unit: 'cm³' },
        { key: 'w', label: 'Moisture content $w$', value: v.w * 100, unit: '%' },
        { key: 'S', label: 'Degree of saturation $S$', value: v.S * 100, unit: '%' },
        { key: 'g', label: 'Moist unit weight $\\gamma$', value: v.g, unit: 'g/cc' },
        { key: 'gd', label: 'Dry unit weight $\\gamma_d$', value: v.gd, unit: 'g/cc' },
        { key: 'e', label: 'Void ratio $e$', value: v.e },
        { key: 'n', label: 'Porosity $n$', value: v.n * 100, unit: '%' },
        { key: 'gsat', label: 'Saturated unit weight $\\gamma_{sat}$', value: v.gsat, unit: 'g/cc' },
      ]
    },
    solution: () => {
      const s = ph1()
      const v = s.vals
      const u = unitSys('g')
      const route = formulaRoute(v, 1)
      return (
        <Sol>
          <Md>{`Work in grams and cm³ ($\\rho_w$ = 1 g/cm³, so a unit weight in "gm/cc" is numerically the density). 1 in = 2.54 cm:`}</Md>
          <Tex block>{`V = \\frac{\\pi}{4}(1.5\\times2.54)^2(3.0\\times2.54) = \\frac{\\pi}{4}(3.81)^2(7.62) = ${nf(V1, 5)}\\ \\text{cm}^3`}</Tex>
          <Head>Block diagram (no derived expression)</Head>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <PhaseBlocks vals={v} known={new Set(ALL_KEYS)} u={u} />
          </div>
          <PhaseStepsView steps={s.steps} u={u} />
          <Head>Check by the formula route</Head>
          {route.slice(0, 4).map((r) => (
            <Tex key={r.key} block>
              {r.tex}
            </Tex>
          ))}
          <Result>{`$w$ = **${nf(v.w * 100, 4)} %**, $S$ = **${nf(v.S * 100, 4)} %**, $\\gamma$ = **${nf(v.g, 4)} g/cc**, $\\gamma_d$ = **${nf(v.gd, 4)} g/cc**, $e$ = **${nf(v.e, 3)}**, $n$ = **${nf(v.n * 100, 3)} %**.\n\n**Comment:** $\\gamma_{sat} = (W_s + \\rho_wV_v)/V = (160 + ${nf(v.Vv, 4)})/${nf(V1, 4)} = ${nf(v.gsat, 4)}$ g/cc — **yes, equal** to the moist unit weight, because $V_w = ${nf(v.Vw, 4)} ≈ V_v = ${nf(v.Vv, 4)}$ cm³: the specimen is fully saturated (S = 100 %, no air). A clay specimen trimmed from below the water table for a UCS test is normally saturated; if S were below 100 %, γ would be less than γsat.`}</Result>
        </Sol>
      )
    },
    notes: ['"form" in the printed stem is a typo for "from".', 'Inch dimensions with gram masses: convert D and H to cm (2.54) and keep g/cm³ throughout.'],
  },
  {
    id: 'sm-2023-24-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 10.67,
    topics: ['sm-plast', 'sm-wv'],
    title: 'Phase diagrams at PL and LL; strength across the plastic range',
    text: 'Draw three phase presentations of a soil at plastic limit and liquid limit. At which natural moisture content between liquid limit and plastic limit a high plasticity soil is expected to exhibit higher shear strength? Show on a qualitative scale and give reasoning.',
    pages: [70],
    theory: true,
    solution: () => <Model item={th('sm-plast', 't-limits-phase')} />,
  },
  {
    id: 'sm-2023-24-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 16,
    topics: ['sm-struct'],
    title: 'Short notes: single-grained, honeycomb, dispersed structure; swelling of clay minerals',
    text: 'Write short notes on:\n\n(i) Single grained structure of soil\n(ii) Honeycomb structure of soil\n(iii) Dispersed structure of soil\n(iv) Swelling potential of Kaolinite, Montmorillonite and Illite',
    pages: [70],
    theory: true,
    solution: () => {
      const Sk = th('sm-struct', 't-structures').Fig!
      return (
      <Models
        parts={[
          {
            title: '(i) Single-grained structure',
            md: `- Found in **gravel and sand** (coarse grains, gravity ≫ surface forces). Each grain settles on its own and rests in contact with its neighbours; no bonding between grains.\n- **Dense** state: small voids, low e (≈ 0.35–0.5), high shear strength, low compressibility, good foundation material.\n- **Loose** state: large voids, high e (up to ≈ 0.9), high permeability; **unstable** — vibration or shock rearranges the grains into a denser packing (settlement; liquefaction if saturated).\n- Its engineering behaviour is described by the relative density $D_r$.`,
          },
          {
            title: '(ii) Honeycomb structure',
            md: `- Found in **fine sand and silt** (grains ≈ 0.002–0.02 mm). The small grains settle slowly; when one touches the grains already deposited, the inter-particle (surface) attraction is large enough compared with its weight to hold it there, so the grains form **arch-like chains** enclosing large voids.\n- High void ratio; can carry ordinary **static** loads by arching (bridge action).\n- Under **vibration or heavy load** the arches break down: the structure **collapses** into a dense single-grained arrangement → large, sudden settlement. Unsuitable under machine foundations or in earthquake zones without treatment.`,
          },
          {
            title: '(iii) Dispersed structure',
            md: `- Found in **clays**. The plate-shaped particles lie **parallel, face to face** — net **repulsion** between the negatively charged faces keeps them apart (double layers), so they settle individually in an oriented way.\n- Forms when a flocculated clay is **remoulded** (or compacted wet of optimum), or on deposition in fresh water with dispersing agents.\n- Low void ratio and dense, but **lower strength** than the flocculated state, more compressible at first, low permeability; anisotropic.`,
          },
          { title: 'Sketches of the structures', fig: <Sk /> },
          { title: '(iv) Swelling potential of kaolinite, montmorillonite and illite', item: th('sm-struct', 't-swelling') },
        ]}
      />
      )
    },
    notes: ['Marks are not split among (i)–(iv); give each about 4 marks and a sketch.'],
  },
  {
    id: 'sm-2023-24-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 30,
    topics: ['sm-lep'],
    title: 'Rankine active, c′–φ′ fill, surcharge 20 kPa, WT at 2 m: sliding force and overturning moment',
    text: "A retaining wall has a height of 6.0 m from its base. There is a water table at 2.0 m below the top surface of the retained fill. The unit weights of retained fill above and below water table are 16 kN/m³ and 18 kN/m³, respectively. The effective angle of friction and effective cohesion of the retained fill are 35° and 10 kN/m², respectively. The retained fill carries a surcharge load of 20 kN/m². Draw the active earth pressure diagrams and hydrostatic pressure diagram for the wall. Calculate total sliding force at the base of the wall. Also, calculate the overturning moment about the toe of the wall.",
    pages: [70],
    given: [],
    figure: () => <WallQFig w={W2} />,
    checks: () => wallChecks(W2, { before: true, moment: true }),
    solution: () => (
      <WallSolved
        w={W2}
        lead="Rankine active state, smooth vertical wall, level fill. Below the WT use γ′ = 18 − 9.81 = 8.19 kN/m³ and add the water pressure separately (K = 1). With c′ > 0 the net earth pressure σ′h = (q + σ′v)Ka − 2c′√Ka is negative near the top: a tension crack forms and the negative zone is dropped (design value)."
        tail="**Overturning moment about the toe:** no base width is given, so the moment is taken about the toe level (arms measured up from the base) — the moment of the sliding force. If the tension zone is kept (no crack) the force and moment are the values in the 'before the crack' table."
      />
    ),
    notes: ['The 18 kN/m³ below the WT is taken as γsat (γ′ = 8.19 kN/m³).', 'qKa = 5.42 kPa is less than 2c′√Ka = 10.41 kPa, so the surcharge does not close the crack.', 'No base width is given: the overturning moment is the moment of the thrust about the base level (toe).'],
  },
  {
    id: 'sm-2023-24-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 6.67,
    topics: ['sm-lep'],
    title: 'Earth pressure vs wall tilt; which is the maximum?',
    text: 'Draw typical variation of lateral earth pressures with tilt of a wall. Which one of the three types of earth pressures is the maximum for a given cohesionless soil? Provide reasoning.',
    pages: [70],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-tilt')} />,
  },
  {
    id: 'sm-2023-24-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 10,
    topics: ['sm-lep', 'sm-shear'],
    title: 'Principal planes and failure planes in the at-rest, active and passive states',
    text: 'Show the major and minor principal planes on a 2D element of a backfill material behind a retaining wall at at-rest, active and passive earth pressure states. Also, show potential failure planes in a backfill behind a retaining wall at active and passive earth pressure states with respect to major principal planes.',
    pages: [71],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-planes')} />,
  },
  {
    id: 'sm-2023-24-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 26.67,
    topics: ['sm-shear'],
    title: 'CU with pore pressure, three specimens: total and effective c, φ and failure-plane angles',
    text: 'A triaxial CU test with pore pressure measurement was conducted on three specimens of a clay sample. Following are the data obtained from the tests on three specimens:\n\n- Specimen 1: cell pressure 430 kN/m², deviator stress at failure 250 kN/m², pore pressure at failure 25 kN/m²\n- Specimen 2: cell pressure 470 kN/m², deviator stress at failure 298 kN/m², pore pressure at failure 35 kN/m²\n- Specimen 3: cell pressure 550 kN/m², deviator stress at failure 390 kN/m², pore pressure at failure 73 kN/m²\n\nDetermine total stress and effective stress shear strength parameters of the clay sample. Also, determine the angle of the failure plane with respect to the major principal plane for each specimen. Use graph paper for solving the problem.',
    pages: [71],
    given: [],
    flag: 'Print problem: as printed, the data give envelopes with negative cohesion intercepts.',
    checks: () => {
      const r = cu3()
      return [
        { key: 'phi', label: 'Total $\\varphi$ (best straight envelope)', value: r.fT.phi, unit: '°', tol: 0.04 },
        { key: 'c', label: 'Total $c$ (negative intercept)', value: r.fT.c, unit: 'kPa', tol: 0.08 },
        { key: 'phie', label: "Effective $\\varphi'$", value: r.fE.phi, unit: '°', tol: 0.04 },
        { key: 'ce', label: "Effective $c'$ (negative intercept)", value: r.fE.c, unit: 'kPa', tol: 0.08 },
        { key: 'th', label: "Failure plane from the major principal plane, $45 + \\varphi'/2$", value: failurePlane(r.eff[0], r.fE.phi).theta, unit: '°', tol: 0.02 },
        { key: 'phi0', label: "If c′ = 0 is forced: $\\varphi'$ (fit through the origin)", value: r.zE.phi, unit: '°', tol: 0.04 },
      ]
    },
    solution: () => {
      const r = cu3()
      const own = T3.map((t, i) => ({ t: phiFromCircle(t.s3, t.dev), e: phiFromCircle(r.eff[i].s3, t.dev) }))
      return (
        <Sol>
          <Md>{`Total circles: $\\sigma_3$ = cell pressure, $\\sigma_1 = \\sigma_3 + \\Delta\\sigma_f$. Effective circles: shift each total circle left by its $u_f$ (same diameter).`}</Md>
          <TriaxTable tests={T3} />
          <Head>Fit 1 — the best straight envelope (what the graph shows)</Head>
          <MohrPlot total={r.tc.total} eff={r.eff} envT={r.fT} envE={r.fE} height={300} />
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <b style={{ color: CT }}>Total</b>
              <FitText cs={r.tc.total} />
            </div>
            <div>
              <b style={{ color: CE }}>Effective</b>
              <FitText cs={r.eff} prime />
            </div>
          </div>
          <Md>{`A common tangent drawn by hand to circles 1 and 3 gives almost the same: total φ = ${f2(r.t13.phi)}°, c = ${f2(r.t13.c)} kPa; effective φ′ = ${f2(r.e13.phi)}°, c′ = ${f2(r.e13.c)} kPa. The cohesion intercepts are **negative** — the deviator stresses are small for such high cell pressures, so no envelope with c ≥ 0 can touch all three circles. On graph paper the tangent line cuts the τ-axis below the origin; report the values as read and state that a negative c has no physical meaning.`}</Md>
          <Md>{`Failure planes (one straight envelope, so the same angle for every specimen): total θ = 45 + ${f2(r.fT.phi)}/2 = **${f2(45 + r.fT.phi / 2)}°**; effective θ = 45 + ${f2(r.fE.phi)}/2 = **${f2(45 + r.fE.phi / 2)}°** from the major principal (horizontal) plane — the effective angle governs, since failure is controlled by effective stress.`}</Md>
          <Head>Fit 2 — c = c′ = 0 (envelope forced through the origin)</Head>
          <MohrPlot total={r.tc.total} eff={r.eff} envT={r.zT} envE={r.zE} height={300} />
          <Tbl
            head={['Specimen', 'own φ = sin⁻¹ R/C (total)', "own φ′ (effective)", "θ = 45 + φ′/2"]}
            rows={own.map((o, i) => [`${i + 1}`, `${f2(o.t)}°`, `${f2(o.e)}°`, `${f2(45 + o.e / 2)}°`])}
            cap={`One line through the origin for all three (least squares on q = p tan α): total φ = ${f2(r.zT.phi)}°, effective φ′ = ${f2(r.zE.phi)}°, θ = ${f2(45 + r.zE.phi / 2)}°.`}
          />
          <Result>{`**Best fit:** total $c = ${f2(r.fT.c)}$ kPa, $\\varphi = ${f2(r.fT.phi)}°$; effective $c' = ${f2(r.fE.c)}$ kPa, $\\varphi' = ${f2(r.fE.phi)}°$; failure plane at ${f2(45 + r.fE.phi / 2)}° (effective) / ${f2(45 + r.fT.phi / 2)}° (total) to the major principal plane for each specimen.\n\n**If c = 0 is adopted:** $\\varphi = ${f2(r.zT.phi)}°$, $\\varphi' = ${f2(r.zE.phi)}°$, and each specimen has its own angle θ = ${own.map((o) => f2(45 + o.e / 2) + '°').join(', ')}. State clearly which fit you use.`}</Result>
        </Sol>
      )
    },
    notes: [
      'The values are clearly legible on the scan; the inconsistency is in the printed data, not the reading.',
      'Fit 1: least squares on the circle tops (p–q line); the hand tangent to circles 1 and 3 agrees within 0.1° and 3 kPa.',
      'Fit 2: forcing c = 0 gives φ ≈ 13–17° and a different θ per specimen — accepted if stated.',
    ],
  },
  {
    id: 'sm-2023-24-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 20,
    topics: ['sm-shear'],
    title: 'True or False: ten statements on direct shear and triaxial tests',
    text: "Give your answer in terms of 'True' or 'False' for the following statements:\n\n- I. Soil specimen fails along a predefined plane in a direct shear test.\n- II. In triaxial CU test with pore pressure measurement, drainage valve remains open during consolidation phase and closed during shear phase.\n- III. During shear phase in a triaxial CD test, pore pressure gauge measures no reading.\n- IV. Both total and effective stress shear strength parameters may be obtained from a CU test with pore pressure measurement.\n- V. Effective stress angle of friction is always higher than total stress angle of friction for a normally consolidated clay soil.\n- VI. Effective stress cohesion is always less than total cohesion for an over consolidated clay soil.\n- VII. Confining pressure is applied in a direct shear test.\n- VIII. In triaxial UU test, the drainage valve is always open.\n- IX. In triaxial CD test, the drainage valve remains closed during consolidation phase and open during shear phase.\n- X. Triaxial CD test provides only total stress shear strength parameters.",
    pages: [71],
    theory: true,
    solution: () => (
      <Sol>
        <TrueFalse
          items={[
            { s: 'Predefined failure plane in direct shear', a: true, why: 'the specimen is forced to shear on the horizontal plane between the two halves of the box.' },
            { s: 'CU: valve open in consolidation, closed in shear', a: true, why: '"C" = consolidated with drainage open, "U" = sheared undrained with the valve closed (u measured).' },
            { s: 'CD shear phase: gauge reads nothing', a: true, why: 'the valve is open and the loading slow, so no excess pore pressure builds up (Δu ≈ 0).' },
            { s: 'CU with u gives total and effective parameters', a: true, why: 'total circles give c, φ; shifting each by uf gives the effective circles and c′, φ′.' },
            { s: "φ′ > φ for NC clay", a: true, why: 'NC clay develops positive uf, which moves the effective circles left, so the effective envelope is steeper.' },
            { s: "c′ < c for OC clay", a: true, why: 'OC clay develops negative uf, moving the effective circles right and lowering the intercept (normally true; "always" makes it arguable).' },
            { s: 'Confining pressure in direct shear', a: false, why: 'only a normal load and a shear force act; there is no cell pressure σ3.' },
            { s: 'UU valve always open', a: false, why: 'in UU the drainage valve is closed throughout (no consolidation, no drainage in shear).' },
            { s: 'CD valve closed in consolidation, open in shear', a: false, why: 'in CD the valve is open in both phases.' },
            { s: 'CD gives only total-stress parameters', a: false, why: 'with u = 0 total = effective, so CD gives the drained (effective) c′, φ′.' },
          ]}
        />
      </Sol>
    ),
    notes: ['"of \'False\'" in print is a typo for "or \'False\'". Marks are not split (2 each implied).'],
  },
  {
    id: 'sm-2023-24-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 26.67,
    topics: ['sm-class'],
    title: 'Sieve analysis: grading curve, % gravel/sand/fines (AASHTO, USCS), Cu, Cc, grading',
    text: 'Following are the results of sieve analysis of a soil sample:\n\n- Sieve No. 4 (4.750 mm): 0 gm retained\n- No. 10 (2.000 mm): 40 gm\n- No. 20 (0.850 mm): 60 gm\n- No. 40 (0.425 mm): 89 gm\n- No. 60 (0.250 mm): 140 gm\n- No. 80 (0.180 mm): 122 gm\n- No. 100 (0.150 mm): 210 gm\n- No. 200 (0.075 mm): 56 gm\n- Pan: 12 gm\n\nDraw the particle size distribution curve on a semi-log graph paper for the soil and determine the following:\n\n(i) % Gravel, % Sand and % Fines according to AASHTO and USCS soil classification systems.\n(ii) Determine coefficient of uniformity and coefficient of curvature of the soil.\n(iii) Is the soil well graded, poorly graded or gap graded? Comment.',
    pages: [72],
    given: [],
    checks: () => {
      const { s, g } = sv4()
      return [
        { key: 'tot', label: 'Total mass', value: s.total, unit: 'g' },
        { key: 'p10', label: '% finer than No. 10', value: g.P10, unit: '%' },
        { key: 'p40', label: '% finer than No. 40', value: g.P40, unit: '%' },
        { key: 'p200', label: '% finer than No. 200 (fines)', value: g.P200, unit: '%' },
        { key: 'ag', label: 'AASHTO gravel (retained on No. 10)', value: g.aashto.gravel, unit: '%' },
        { key: 'as', label: 'AASHTO sand (No. 10 to No. 200)', value: g.aashto.sand, unit: '%' },
        { key: 'us', label: 'USCS sand (No. 4 to No. 200)', value: g.uscs.sand, unit: '%' },
        { key: 'd10', label: '$D_{10}$', value: g.D10, unit: 'mm', tol: 0.04 },
        { key: 'd30', label: '$D_{30}$', value: g.D30, unit: 'mm', tol: 0.04 },
        { key: 'd60', label: '$D_{60}$', value: g.D60, unit: 'mm', tol: 0.05 },
        { key: 'cu', label: '$C_u$', value: g.Cu, tol: 0.08 },
        { key: 'cc', label: '$C_c$', value: g.Cc, tol: 0.08 },
      ]
    },
    solution: () => {
      const { s, g, gl } = sv4()
      const gr = gradeOf(g.Cu, g.Cc, 'S')
      const u = uscs({ F200: g.P200, F4: g.P4, Cu: g.Cu, Cc: g.Cc, NP: true })
      return (
        <Sol>
          <Tbl
            head={['Sieve', 'Opening (mm)', 'Retained (g)', '% retained', 'Cumulative % retained', '% finer']}
            rows={[
              ...s.lines.map((l, i) => [`No. ${SIEVE4[i].no}`, f3(l.d), f2(l.ret), f2(l.pctRet), f2(l.cumRet), f2(l.pf)]),
              ['Pan', '—', '12', f2((100 * 12) / s.total), '100', '0'],
            ]}
            cap={`Total = ${f2(s.total)} g. % finer = 100 − cumulative % retained.`}
          />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <GradingCurve curves={[{ pts: s.pts, label: 'soil' }]} D={{ D10: g.D10, D30: g.D30, D60: g.D60 }} />
          </div>
          <Head>(i) Gravel, sand, fines</Head>
          <Tbl
            head={['System', 'Gravel', 'Sand', 'Fines (silt + clay)']}
            rows={[
              ['USCS (4.75 mm / 0.075 mm)', `100 − ${f2(g.P4)} = ${f2(g.uscs.gravel)} %`, `${f2(g.P4)} − ${f2(g.P200)} = ${f2(g.uscs.sand)} %`, `${f2(g.uscs.fines)} %`],
              ['AASHTO (2.0 mm / 0.075 mm)', `100 − ${f2(g.P10)} = ${f2(g.aashto.gravel)} %`, `${f2(g.P10)} − ${f2(g.P200)} = ${f2(g.aashto.sand)} %`, `${f2(g.aashto.siltClay)} %`],
            ]}
          />
          <Head>(ii) Cu and Cc</Head>
          <Md>{`Read off the curve (log interpolation between the bracketing sieves): $D_{10}$ = ${f3(g.D10)} mm (between No. 100 at 9.33 % and No. 80 at 38.13 %), $D_{30}$ = ${f3(g.D30)} mm, $D_{60}$ = ${f3(g.D60)} mm (between No. 60 at 54.87 % and No. 40 at 74.07 %).`}</Md>
          <Tex block>{`C_u = \\frac{D_{60}}{D_{10}} = \\frac{${f3(g.D60)}}{${f3(g.D10)}} = ${f2(g.Cu)},\\qquad C_c = \\frac{D_{30}^2}{D_{60}D_{10}} = \\frac{${f3(g.D30)}^2}{${f3(g.D60)}\\times${f3(g.D10)}} = ${f2(g.Cc)}`}</Tex>
          <Md>{`(Linear interpolation instead: $D_{10}$ = ${f3(gl.D10)}, $D_{30}$ = ${f3(gl.D30)}, $D_{60}$ = ${f3(gl.D60)} mm → $C_u$ = ${f2(gl.Cu)}, $C_c$ = ${f2(gl.Cc)} — either is accepted.)`}</Md>
          <Head>(iii) Grading</Head>
          <Result>{`**Poorly graded (uniform) sand.** For a sand to be well graded it needs $C_u \\ge 6$ and $1 \\le C_c \\le 3$; here $C_u$ = ${f2(g.Cu)} and $C_c$ = ${f2(g.Cc)}, so it fails both (${gr.comment}). It is **not gap graded**: no size range is missing — the curve is simply steep, with ${f2(s.lines[5].pf - s.lines[6].pf)} % of the soil between 0.18 mm and 0.15 mm. (USCS symbol, not asked: ${u.symbol}, ${u.name.toLowerCase()}.)`}</Result>
        </Sol>
      )
    },
    notes: ['D-values depend slightly on reading the semi-log graph: Cu ≈ 1.9–2.0, Cc ≈ 0.66–0.67.'],
  },
  {
    id: 'sm-2023-24-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 20,
    topics: ['sm-plast', 'sm-class'],
    title: 'Casagrande LL from five trials (masses), PL 27 % → plasticity chart',
    text: 'Following are the data obtained from a liquid limit test on an inorganic soil. Determine the liquid limit of the soil. Plastic limit of the soil was determined to be 27%. Using the plasticity chart, determine the type of the soil.\n\n- Specimen 1: 11 blows; container 7.10 gm; container + wet soil 29.90 gm; container + dry soil 20.60 gm\n- Specimen 2: 17 blows; 7.00; 30.10; 20.90 gm\n- Specimen 3: 23 blows; 6.90; 30.80; 21.60 gm\n- Specimen 4: 30 blows; 10.60; 34.00; 25.20 gm\n- Specimen 5: 38 blows; 10.90; 31.00; 23.70 gm\n\n(The plasticity chart is printed below the table.)',
    pages: [72],
    given: [{ label: 'Plasticity chart', what: 'printed with the question', ref: 'c-plchart' }],
    checks: () => {
      const r = cup4()
      return [
        ...r.ws.map((w, i) => ({ key: `w${i}`, label: `w, specimen ${i + 1} (${CUP4[i].N} blows)`, value: w.w, unit: '%' })),
        { key: 'LL', label: 'Liquid limit (w at 25 blows)', value: r.fc.LL, unit: '%', tol: 0.015 },
        { key: 'PI', label: 'Plasticity index', value: r.k.PI, unit: '%', tol: 0.03 },
        { key: 'A', label: 'A-line PI at this LL', value: r.z.aPI, tol: 0.03 },
      ]
    },
    solution: () => {
      const r = cup4()
      return (
        <Sol>
          <Tbl
            head={['Specimen', 'Blows N', 'Ww = (C + wet) − (C + dry)', 'Ws = (C + dry) − C', 'w = Ww/Ws (%)']}
            rows={CUP4.map((x, i) => [`${i + 1}`, `${x.N}`, f2(r.ws[i].Ww), f2(r.ws[i].Ws), f2(r.ws[i].w)])}
          />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <FlowPlot mode="cup" pts={CUP4.map((x, i) => ({ x: x.N, w: r.ws[i].w }))} a={r.fc.a} b={r.fc.b} LL={r.fc.LL} />
          </div>
          <Md>{`Flow curve (w against log N, best straight line): $w = ${nf(r.fc.a, 4)} - ${nf(r.fc.If, 4)}\\log N$. At N = 25: **LL = ${nf(r.fc.LL, 4)} %** (interpolating between 23 and 30 blows: ${nf(r.fc.interp, 4)} %). Flow index $I_F$ = ${nf(r.fc.If, 3)}.`}</Md>
          <Md>{`PI = LL − PL = ${nf(r.fc.LL, 4)} − 27 = **${nf(r.k.PI, 3)}** (${r.k.burmister.toLowerCase()}). A-line at LL ${nf(r.fc.LL, 3)}: 0.73(${nf(r.fc.LL, 3)} − 20) = ${nf(r.z.aPI, 3)}; U-line 0.9(LL − 8) = ${nf(r.z.uPI, 3)}. The point lies above the A-line, below the U-line, right of LL = 50.`}</Md>
          <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[480px]">
            <PlasticityChart pts={[{ LL: r.fc.LL, PI: r.k.PI, label: 'soil' }]} />
          </div>
          <Result>{`LL ≈ **${nf(r.fc.LL, 3)} %**, PI ≈ ${nf(r.k.PI, 3)} → zone **${r.z.zone}**: inorganic clay of high plasticity (fat clay). The soil is stated to be inorganic, so OH is ruled out.`}</Result>
        </Sol>
      )
    },
    notes: ['"form" is a typo for "from".', 'A hand-drawn best line gives LL within about ±1 %; the classification (CH) does not change.'],
  },
]

