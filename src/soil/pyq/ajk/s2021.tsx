// CE 341 term final 2021-22 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section B (Q5–Q8), held 2 May 2023, PDF pp. 64–66; attached Table 1 AASHTO, Table 2 USCS (p68), Chart 1 plasticity, Chart 2 β vs OCR (p69).
import { Md, Tex } from '../../../components/ui'
import { aashto, uscs } from '../../engine/classify'
import { crackForces, solveWall, type Wall } from '../../engine/earth'
import { coneLL, onePointCone, wFromMasses } from '../../engine/plasticity'
import { bjerrum, cuPredict, fitCircles, phiFromCircle, skemptonNC, triaxCircles, vaneCu, type TriaxTest } from '../../engine/shear'
import { PlasticityChart } from '../../reference/idx'
import { FlowPlot } from '../../topics/plast/figs'
import { WallFig } from '../../topics/lep/figs'
import { PiecesTable } from '../../topics/lep/Solution'
import type { SmQ } from '../../types'
import { AashtoSolved, CuOCSolution, cuOCChecks, dsChecks, DSSolution, f2, f3, f4, FitText, Head, Model, Models, MohrPlot, Result, Sol, Tbl, th, TriaxTable, UscsSolved } from './kit'

const P = '2021-22' as const

// ---------------------------------------------------------------- Q5(b) fall cone (masses)
const CONE5 = [
  { d: 16, wet: 193.8, dry: 145.6 },
  { d: 18, wet: 190.7, dry: 136.0 },
  { d: 22, wet: 186.5, dry: 121.2 },
  { d: 25, wet: 181.3, dry: 111.4 },
]
const cone5 = () => {
  const ws = CONE5.map((x) => wFromMasses(x.wet, x.dry))
  const f = coneLL(CONE5.map((x, i) => ({ d: x.d, w: ws[i] })))
  return { ws, f, one18: onePointCone(ws[1], 18), one22: onePointCone(ws[2], 22) }
}

// ---------------------------------------------------------------- Q5(d) NC clay CU, two cell pressures
const q5d = () => {
  const phiE = phiFromCircle(200 - 125, 115)
  const phiT = phiFromCircle(200, 115)
  const s2 = cuPredict(400, { c: 0, phi: phiT }, { c: 0, phi: phiE })
  return { phiE, phiT, s2, Af1: 125 / 115 }
}

// ---------------------------------------------------------------- Q6(b)
const U6 = { F200: 13, F4: 100, LL: 23, PL: 19 }
const A6 = { P10: 90, P40: 38, P200: 13, LL: 23, PI: 4 }

// ---------------------------------------------------------------- Q7(a) direct shear, Q7(c) CU
const DS7 = [
  { N: 16, T: 80.5 },
  { N: 32, T: 159.6 },
  { N: 64, T: 309.3 },
]
const T7: TriaxTest[] = [
  { s3: 70, dev: 230, u: -20 },
  { s3: 350, dev: 550, u: 90 },
]

// ---------------------------------------------------------------- Q8(c) φ = 0 clay, total stress, surcharge
const W8: Wall = { layers: [{ h: 5, gamma: 21, phi: 0, c: 17, total: true }], zw: null, q: 11, state: 'active' }

export const A2021: SmQ[] = [
  {
    id: 'sm-2021-22-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 8.67,
    topics: ['sm-plast'],
    title: 'Define shrinkage limit; derive SL with Gs known',
    text: 'Define shrinkage limit. Derive an expression for shrinkage limit of soil having known specific gravity of soil solids ($G_s$).',
    pages: [64],
    theory: true,
    solution: () => <Model item={th('sm-plast', 't-sl-known')} />,
    notes: ['AJK sir’s slide only names the SL (ASTM D-427); the derivation is the standard phase-diagram one.'],
  },
  {
    id: 'sm-2021-22-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 17,
    topics: ['sm-plast'],
    title: 'Fall-cone LL from four trials (wet and dry masses) + one-point check',
    text: 'A cone penetration test was performed on a silty clay sample and the following results were obtained:\n\n- Trial 1: cone penetration 16 mm; weight of wet soil 193.8 gm; weight of oven-dry soil 145.6 gm\n- Trial 2: 18 mm; 190.7 gm; 136.0 gm\n- Trial 3: 22 mm; 186.5 gm; 121.2 gm\n- Trial 4: 25 mm; 181.3 gm; 111.4 gm\n\nDetermine the liquid limit of the soil and also check the result for a single point method using a relevant data.',
    pages: [64],
    given: [],
    checks: () => {
      const r = cone5()
      return [
        ...r.ws.map((w, i) => ({ key: `w${i}`, label: `w, trial ${i + 1} (${CONE5[i].d} mm)`, value: w, unit: '%' })),
        { key: 'LL', label: 'Liquid limit (w at 20 mm)', value: r.f.LL, unit: '%', tol: 0.02 },
        { key: 'o18', label: 'One-point LL from the 18 mm trial', value: r.one18, unit: '%' },
        { key: 'o22', label: 'One-point LL from the 22 mm trial', value: r.one22, unit: '%' },
      ]
    },
    solution: () => {
      const r = cone5()
      return (
        <Sol>
          <Tbl head={['Trial', 'Penetration (mm)', 'Ww = wet − dry (g)', 'Ws (g)', 'w (%)']} rows={CONE5.map((x, i) => [`${i + 1}`, `${x.d}`, f2(x.wet - x.dry), f2(x.dry), f2(r.ws[i])])} />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <FlowPlot mode="cone" pts={CONE5.map((x, i) => ({ x: x.d, w: r.ws[i] }))} a={r.f.a} b={r.f.b} LL={r.f.LL} />
          </div>
          <Md>{`Plot w against penetration and draw the best straight line (BS 1377 80 g cone): $w = ${f2(r.f.a)} + ${f3(r.f.b)}d$. **LL = w at 20 mm = ${f2(r.f.LL)} %** (straight interpolation between the 18 mm and 22 mm trials: ${f2(r.f.interp)} %).`}</Md>
          <Head>Single-point check</Head>
          <Md>{`One-point cone formula (IS 2720-5): $w_L = \\dfrac{w_y}{0.77\\log_{10}y}$, valid for y = 14–28 mm. The relevant data are the readings nearest 20 mm:`}</Md>
          <Tex block>{`y = 18:\\ w_L = \\frac{${f2(r.ws[1])}}{0.77\\log 18} = ${f2(r.one18)}\\%,\\qquad y = 22:\\ w_L = \\frac{${f2(r.ws[2])}}{0.77\\log 22} = ${f2(r.one22)}\\%`}</Tex>
          <Result>{`LL ≈ **${f2(r.f.LL)} %** from the graph. The one-point checks give ${f2(r.one18)} % and ${f2(r.one22)} % (mean ${f2((r.one18 + r.one22) / 2)} %): they bracket the graphical value, but each misses by about 5 % because these data are unusually steep (≈ ${f2(r.f.b)} % per mm) — so the one-point method is only a rough check here; the multi-point graph governs.`}</Result>
        </Sol>
      )
    },
    notes: ['Which one-point formula the course uses is not on the paper or the slides; the IS 2720-5 form is shown.', 'The masses are of the soil only (no container).'],
  },
  {
    id: 'sm-2021-22-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 7,
    topics: ['sm-class'],
    title: 'Soil types by particle size (ASTM D422)',
    text: 'Classify different types of soils based on particle size according to ASTM D422.',
    pages: [64],
    theory: true,
    solution: () => <Model item={th('sm-class', 't-sizes')} />,
  },
  {
    id: 'sm-2021-22-5d',
    paper: P,
    sec: 'B',
    no: '5(d)',
    marks: 14,
    topics: ['sm-shear'],
    title: 'NC clay CU: φ′ and φcu, then uf and Af of a second specimen at 400 kPa',
    text: 'A specimen of saturated normally consolidated clay sample was fully consolidated in the triaxial cell under a cell pressure of 200 kN/m². Pore pressure within the specimen at the end of consolidation was zero. Deviator stress was then applied under undrained condition and increased until failure took place. The values of deviator stress and pore pressure at failure were found to be 115 kN/m² and 125 kN/m², respectively. A second specimen of the same sample was fully consolidated in the triaxial cell under a cell pressure of 400 kN/m². Pore pressure within this specimen at the end of consolidation was zero. Deviator stress was then applied under undrained condition and increased until failure took place. Determine the following analytically.\n\n(i) Values of $\\varphi\'$ and $\\varphi_u$ of the sample.\n(ii) Values of pore pressure at failure ($u_f$) and the pore pressure parameters A at failure ($A_f$) of the second specimen.',
    pages: [64],
    given: [],
    flag: "Af is Skempton's A — not in AJK sir's slides.",
    checks: () => {
      const r = q5d()
      return [
        { key: 'phie', label: "$\\varphi'$", value: r.phiE, unit: '°' },
        { key: 'phit', label: '$\\varphi_u$ (= $\\varphi_{cu}$, total)', value: r.phiT, unit: '°' },
        { key: 'dev2', label: 'Deviator at failure, specimen 2', value: r.s2.dev, unit: 'kPa' },
        { key: 'uf2', label: '$u_f$, specimen 2', value: r.s2.uf, unit: 'kPa' },
        { key: 'af2', label: '$A_f$, specimen 2', value: r.s2.Af },
      ]
    },
    solution: () => {
      const r = q5d()
      const c1 = { C: 200 + 57.5, R: 57.5, s1: 315, s3: 200 }
      const e1 = { C: 75 + 57.5, R: 57.5, s1: 190, s3: 75 }
      const c2 = { C: 400 + r.s2.dev / 2, R: r.s2.dev / 2, s1: 400 + r.s2.dev, s3: 400 }
      const e2 = { C: r.s2.s3p + r.s2.dev / 2, R: r.s2.dev / 2, s1: r.s2.s1p, s3: r.s2.s3p }
      return (
        <Sol>
          <Md>{`Specimen 1: $\\sigma_3 = 200$, $\\sigma_1 = 315$ kPa (total); $\\sigma'_3 = 200 - 125 = 75$, $\\sigma'_1 = 190$ kPa (effective). NC clay → both envelopes through the origin, so $\\sin\\varphi = (\\sigma_1 - \\sigma_3)/(\\sigma_1 + \\sigma_3)$.`}</Md>
          <Tex block>{`\\sin\\varphi' = \\frac{190 - 75}{190 + 75} = ${f4(Math.sin((r.phiE * Math.PI) / 180))} \\Rightarrow \\varphi' = ${f2(r.phiE)}^\\circ,\\qquad \\sin\\varphi_u = \\frac{315 - 200}{315 + 200} \\Rightarrow \\varphi_u = ${f2(r.phiT)}^\\circ`}</Tex>
          <Md>{`(ii) Specimen 2 (same NC clay, $\\sigma_3$ = 400 kPa) fails on the same total envelope: $\\sigma_1 = \\sigma_3\\tan^2(45 + \\varphi_u/2) = 400 \\tan^2 ${f2(45 + r.phiT / 2)}° = ${f2(r.s2.s1)}$ kPa, so $\\Delta\\sigma_f = ${f2(r.s2.dev)}$ kPa. Its effective circle (same radius) touches the effective envelope: $\\sigma'_3 = R/\\sin\\varphi' - R = ${f2(r.s2.s3p)}$ kPa.`}</Md>
          <Tex block>{`u_f = \\sigma_3 - \\sigma'_3 = 400 - ${f2(r.s2.s3p)} = ${f2(r.s2.uf)}\\ \\text{kPa},\\qquad A_f = \\frac{u_f}{\\Delta\\sigma_f} = \\frac{${f2(r.s2.uf)}}{${f2(r.s2.dev)}} = ${f3(r.s2.Af)}`}</Tex>
          <MohrPlot total={[c1, c2]} eff={[e1, e2]} envT={{ c: 0, phi: r.phiT }} envE={{ c: 0, phi: r.phiE }} />
          <Result>{`$\\varphi'$ = **${f2(r.phiE)}°**, $\\varphi_u$ = **${f2(r.phiT)}°**; specimen 2: $\\Delta\\sigma_f$ = ${f2(r.s2.dev)} kPa, $u_f$ = **${f2(r.s2.uf)} kPa**, $A_f$ = **${f3(r.s2.Af)}** — the same as specimen 1 (125/115 = ${f3(r.Af1)}): for an NC clay everything scales with the consolidation pressure.`}</Result>
        </Sol>
      )
    },
    notes: ['"φu" in print means the total-stress angle of this CU test (φcu), not the UU φu = 0.'],
  },
  {
    id: 'sm-2021-22-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 13,
    topics: ['sm-struct'],
    title: 'Soil structures with sketches; flocculated vs dispersed',
    text: 'Define various types of soil structure for coarse and fine-grained soil with neat sketches. Mention the differences between flocculated and dispersed structure.',
    pages: [64],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Types of structure (9 marks)', item: th('sm-struct', 't-structures') },
          { title: 'Flocculated vs dispersed (4 marks)', item: th('sm-struct', 't-floc-disp') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2021-22-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 13.67,
    topics: ['sm-class'],
    title: 'AASHTO and USCS: 13 % fines, LL 23, PL 19 (A-1-b, SC-SM)',
    text: 'For an inorganic soil, the following grain-size analysis was obtained:\n\n- % passing No. 4 = 100, No. 10 = 90, No. 20 = 64, No. 40 = 38, No. 80 = 18, No. 200 = 13\n\nFor this soil, Liquid Limit (LL) = 23 and Plastic Limit (PL) = 19. Classify the soil according to the following:\n\n(i) AASHTO Soil Classification System (Use Table 1)\n(ii) Unified Soil Classification System (Use Table 2 and Chart 1).\n\nGive the group name and group symbol of each classification.',
    pages: [64, 65, 68, 69],
    given: [
      { label: 'Table 1', what: 'AASHTO classification', ref: 'c-aashto' },
      { label: 'Table 2', what: 'USCS group symbols', ref: 'c-uscs' },
      { label: 'Chart 1', what: 'plasticity chart', ref: 'c-plchart' },
    ],
    checks: () => {
      const a = aashto(A6)
      const u = uscs(U6)
      return [
        { key: 'pi', label: 'PI', value: 4 },
        { key: 'gi', label: 'AASHTO group index', value: a.gi.gi },
        { key: 'coarse', label: 'USCS: % retained on No. 200 (coarse fraction)', value: 100 - u.fines },
        { key: 'aline', label: 'A-line PI at LL = 23', value: 0.73 * (23 - 20), tol: 0.03 },
      ]
    },
    solution: () => (
      <Sol>
        <Head>(i) AASHTO (Table 1)</Head>
        <AashtoSolved inp={A6} lead="PI = 23 − 19 = 4. Work left to right through Table 1; the first column whose every limit is met is the group." />
        <Head>(ii) USCS (Table 2 + Chart 1)</Head>
        <UscsSolved inp={U6} />
        <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[460px]">
          <PlasticityChart pts={[{ LL: 23, PI: 4, label: 'fines' }]} />
        </div>
        <Result>{`**AASHTO: A-1-b(0)** — stone fragments, gravel and sand; excellent to good subgrade. **USCS: SC-SM, silty clayey sand** — 87 % coarse, all of it sand (100 % passes No. 4), 13 % fines (> 12 %), and PI = 4 at LL = 23 lies on/above the A-line (${f2(0.73 * 3)}) inside the hatched CL-ML band (4 ≤ PI ≤ 7), so footnote d gives the dual symbol.`}</Result>
      </Sol>
    ),
    notes: ['Gravel = 0 % (< 15 %), so the name has no "with gravel".', 'Group names come from the ASTM flowchart (Das Fig. 5.4), which is not attached; "silty clayey sand" is its name for SC-SM.'],
  },
  {
    id: 'sm-2021-22-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 12,
    topics: ['sm-lep'],
    title: "Earth-retaining structures; Rankine vs Coulomb",
    text: "Describe the importance of earth retaining structures and name four commonly encountered earth retaining structures. Briefly discuss about the fundamental differences between Rankine's and Coulomb's earth pressure theories.",
    pages: [65],
    theory: true,
    flag: "Coulomb's theory — not in AJK sir's slides this term.",
    solution: () => <Model item={th('sm-lep', 't-walls')} />,
  },
  {
    id: 'sm-2021-22-6d',
    paper: P,
    sec: 'B',
    no: '6(d)',
    marks: 8,
    topics: ['sm-shear'],
    title: 'Advantages of triaxial over direct shear; two UU field cases',
    text: 'What are the advantages of triaxial test over direct shear test? Also show with neat sketches two examples of unconsolidated undrained (UU) analyses in clays.',
    pages: [65],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-uu')} />,
  },
  {
    id: 'sm-2021-22-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 15.67,
    topics: ['sm-shear'],
    title: 'CD direct shear (kg loads, 63.5 mm specimens) → c′, φ′, stress history',
    text: "The following results were obtained in a consolidated drained (CD) direct shear test carried out on a clay sample:\n\n- Specimen 1: normal load 16 kg, peak shear force 80.5 N\n- Specimen 2: normal load 32 kg, peak shear force 159.6 N\n- Specimen 3: normal load 64 kg, peak shear force 309.3 N\n\nDiameter and height of each specimen were 63.5 mm and 25 mm, respectively. Draw the failure envelope in a plain graph paper and determine the values of effective shear strength parameters ($c'$ and $\\varphi'$) from it. Also comment on the stress history of the sample.",
    pages: [65],
    given: [],
    checks: () => dsChecks(DS7, 63.5, 'kg'),
    solution: () => <DSSolution rows={DS7} dia={63.5} unit="kg" history />,
    notes: ['The height (25 mm) is not needed.', 'Normal loads are in kg: × 9.81 to get N.'],
  },
  {
    id: 'sm-2021-22-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['sm-lep'],
    title: 'Earth pressure vs wall tilt; factors affecting K0',
    text: 'With a neat sketch show the variation of the magnitude of lateral earth pressure with tilt of wall. Mention the principal factors that influence the field value of $K_0$.',
    pages: [65],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Pressure vs tilt (5 marks)', item: th('sm-lep', 't-tilt') },
          { title: 'Factors influencing K0 (5 marks)', item: th('sm-lep', 't-k0') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2021-22-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 14,
    topics: ['sm-shear'],
    title: 'CU on compacted clay, two specimens (one negative uf): effective c′, φ′',
    text: "The following results were obtained at failure in consolidated undrained (CU) triaxial compression tests performed on two specimens of a compacted clay sample:\n\n- Specimen 1: cell pressure 70 kN/m², deviator stress 230 kN/m², pore pressure −20 kN/m²\n- Specimen 2: cell pressure 350 kN/m², deviator stress 550 kN/m², pore pressure 90 kN/m²\n\nDraw Mohr Circles in terms of effective stresses in a plain graph paper. Draw the Mohr-Coulomb failure envelope and hence determine the values of effective shear strength parameters ($c'$ and $\\varphi'$) from it. Also write down the Mohr-Coulomb failure equation for the effective stress failure envelope.",
    pages: [65],
    given: [],
    checks: () => {
      const tc = triaxCircles(T7)
      const e = tc.eff!
      return [
        { key: 's31', label: "$\\sigma'_3$, specimen 1", value: e[0].s3, unit: 'kPa' },
        { key: 's11', label: "$\\sigma'_1$, specimen 1", value: e[0].s1, unit: 'kPa' },
        { key: 's32', label: "$\\sigma'_3$, specimen 2", value: e[1].s3, unit: 'kPa' },
        { key: 's12', label: "$\\sigma'_1$, specimen 2", value: e[1].s1, unit: 'kPa' },
        ...(() => {
          const f = fitTwo()
          return [
            { key: 'phi', label: "$\\varphi'$", value: f.phi, unit: '°', tol: 0.03 },
            { key: 'c', label: "$c'$", value: f.c, unit: 'kPa', tol: 0.1 },
          ]
        })(),
      ]
    },
    solution: () => {
      const tc = triaxCircles(T7)
      const f = fitTwo()
      return (
        <Sol>
          <Md>{`Effective stresses: $\\sigma'_3 = \\sigma_3 - u_f$, $\\sigma'_1 = \\sigma'_3 + \\Delta\\sigma_f$. Specimen 1 has a **negative** pore pressure (the compacted clay tried to dilate), so its effective stresses are larger than the total ones.`}</Md>
          <TriaxTable tests={T7} />
          <MohrPlot eff={tc.eff!} envE={f} />
          <FitText cs={tc.eff!} prime />
          <Result>{`$c'$ = **${f2(f.c)} kPa**, $\\varphi'$ = **${f2(f.phi)}°**. Mohr–Coulomb (effective): $\\tau_f = ${f2(f.c)} + \\sigma'\\tan ${f2(f.phi)}°$ kPa. A hand-drawn tangent should be within about ±1° and ±3 kPa.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2021-22-7d',
    paper: P,
    sec: 'B',
    no: '7(d)',
    marks: 7,
    topics: ['sm-shear'],
    title: 'Field vane, one end shearing: cu, then Bjerrum design value',
    text: 'A vane, 100 mm height and 50 mm diameter was pressed into a clay deposit at the bottom of a borehole and the bottom of the vane is flush with the surface of the clay. Torque was applied and its value at failure was found to be 15 N-m. Assuming uniform mobilization of end shear, calculate the in-situ undrained shear strength of the clay. If the values of liquid limit and plastic limit of the clay are 56 and 20, respectively, what will be the design value of undrained shear strength of the clay?',
    pages: [66],
    given: [],
    flag: "Vane shear and Bjerrum's correction — not in AJK sir's slides.",
    checks: () => {
      const v = vaneCu(0.015, 0.05, 0.1, 1)
      const l = bjerrum(36)
      return [
        { key: 'cu', label: 'In-situ $c_u$ (one end shearing)', value: v.cu, unit: 'kPa' },
        { key: 'lam', label: 'Bjerrum λ (PI = 36)', value: l },
        { key: 'des', label: 'Design $c_u = \\lambda c_u$', value: l * v.cu, unit: 'kPa' },
      ]
    },
    solution: () => {
      const v = vaneCu(0.015, 0.05, 0.1, 1)
      const v2 = vaneCu(0.015, 0.05, 0.1, 2)
      const l = bjerrum(36)
      return (
        <Sol>
          <Md>{`The vane is pushed into the clay at the bottom of the borehole with one end flush with the clay surface, so the soil shears on the **cylinder side and one end only**. With uniform shear on the end disc, its moment is $c_u\\pi D^3/12$:`}</Md>
          <Tex block>{`T = c_u\\pi D^2\\left(\\frac{H}{2} + \\frac{D}{12}\\right) \\Rightarrow c_u = \\frac{0.015}{\\pi(0.05)^2(0.05 + 0.05/12)} = \\frac{0.015}{${f4(v.lever * 1e4)}\\times10^{-4}} = ${f2(v.cu)}\\ \\text{kN/m}^2`}</Tex>
          <Md>{`Design value (Bjerrum 1972): PI = 56 − 20 = 36, $\\lambda = 1.7 - 0.54\\log 36 = ${f3(l)}$.`}</Md>
          <Result>{`In-situ $c_u$ = **${f2(v.cu)} kPa**; design $c_u = ${f3(l)}\\times${f2(v.cu)}$ = **${f2(l * v.cu)} kPa**. (If both ends were assumed to shear, $c_u = ${f2(v2.cu)}$ and the design value ${f2(l * v2.cu)} kPa.)`}</Result>
        </Sol>
      )
    },
    notes: ['"bottom of the vane is flush with the surface of the clay" reads like a slip for "top"; either way only one end shears.', 'T = 15 N·m = 0.015 kN·m; D, H in m.'],
  },
  {
    id: 'sm-2021-22-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 10,
    topics: ['sm-shear'],
    title: 'cu of an OC clay at 10 m from PI and OCR (Skempton + β chart)',
    text: 'A clay sample (liquid limit = 58%, plastic limit = 27% and natural moisture content = 45%) was collected from a depth of 10 m below the existing ground level. Water table is at the existing ground level and saturated unit weight of the sample is 20 kN/m³. From a laboratory one-dimensional consolidation test, the preconsolidation pressure of the sample was found to be 510 kN/m². Estimate the value of undrained shear strength of the sample at that depth.',
    pages: [66, 69],
    given: [{ label: 'Chart 2', what: 'β vs overconsolidation ratio', ref: 's-beta' }],
    flag: 'cu correlations (Skempton, β chart) — not in AJK sir’s slides.',
    checks: () => cuOCChecks(10, 20, 510, skemptonNC(31)),
    solution: () => <CuOCSolution z={10} gsat={20} pc={510} LL={58} PL={27} ratio={skemptonNC(31)} ratioTex="0.11 + 0.0037\,PI = 0.11 + 0.0037(31)" />,
    notes: ['β read from the chart has about ±0.1 reading error; the average curve is used.', 'The natural moisture content (45 %) is not needed.', 'Same problem as Jan 2021 Q5(c) with 10 m and 510 kPa.'],
  },
  {
    id: 'sm-2021-22-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 12,
    topics: ['sm-shear'],
    title: 'Qualitative curves: u vs ε (NC, lightly OC, heavily OC), εv vs displacement (sand), B vs S',
    text: "Draw the following qualitative curves:\n\n(i) Pore pressure versus axial strain for saturated samples of normally consolidated, lightly overconsolidated and heavily overconsolidated clays in consolidated (with back pressure) undrained triaxial compression tests.\n(ii) Volumetric strain versus shear displacement for saturated samples of loose sand and dense sand in consolidated drained direct shear tests.\n(iii) Skempton's pore pressure coefficient B versus degree of saturation.",
    pages: [66],
    theory: true,
    flag: "(iii) Skempton's B — not in AJK sir's slides.",
    solution: () => {
      const D = th('sm-shear', 't-ds-curves').Fig!
      return <Model item={th('sm-shear', 't-curves')} post="For (ii) the direct-shear version of the volume-change sketch (change in height against shear displacement):" fig={<D />} />
    },
  },
  {
    id: 'sm-2021-22-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 24.67,
    topics: ['sm-lep'],
    title: 'φ = 0 soft clay, 5 m wall, surcharge 11 kPa: crack depth, Pa before and after the crack',
    text: "A 5-m high retaining wall with a vertical back face retains a homogeneous saturated soft clay. A surcharge pressure of 11 kN/m² is applied on top of the backfill. The saturated unit weight of the clay is 21 kN/m³. The undrained shear strength of the soft clay soil is 17 kN/m².\n\n(i) Draw the variation of Rankine's active pressure on the wall with depth.\n(ii) Find the depth up to which tensile crack can occur.\n(iii) Determine the total active force per unit length of the wall and the location of the resultant before the tensile crack occurs.\n(iv) Determine the total active force per unit length of the wall and the location of the resultant after the tensile crack occurs.",
    pages: [66],
    given: [],
    figure: () => (
      <div className="max-w-[480px] mx-auto">
        <WallFig w={W8} r={null} showDiagrams={false} width={460} />
      </div>
    ),
    checks: () => {
      const r = solveWall(W8)
      return [
        { key: 'top', label: 'σa at the top, q − 2cu', value: r.ords[0].earth, unit: 'kPa' },
        { key: 'bot', label: 'σa at the base, q + γH − 2cu', value: r.ords[r.ords.length - 1].earth, unit: 'kPa' },
        { key: 'zc', label: 'Crack depth $z_c = (2c_u - q)/\\gamma$', value: r.zc ?? NaN, unit: 'm' },
        { key: 'pb', label: 'Pa before the crack', value: r.Fbefore, unit: 'kN/m' },
        { key: 'zb', label: 'Its location above the base', value: r.zbarBefore, unit: 'm' },
        { key: 'pa', label: 'Pa after the crack', value: r.Fs, unit: 'kN/m' },
        { key: 'za', label: 'Its location above the base', value: r.zbar, unit: 'm' },
      ]
    },
    solution: () => {
      const r = solveWall(W8)
      const k = crackForces({ H: 5, gamma: 21, phi: 0, c: 17, q: 11 })
      return (
        <Sol>
          <Md>{`Saturated soft clay, undrained (φ = 0, $K_a$ = 1), total-stress analysis with $\\gamma_{sat}$ (no separate water pressure): $\\sigma_a = q + \\gamma z - 2c_u$.`}</Md>
          <Tex block>{`\\sigma_a(0) = 11 - 2(17) = ${f2(k.top)}\\ \\text{kPa},\\qquad \\sigma_a(5) = 11 + 21(5) - 34 = ${f2(k.base)}\\ \\text{kPa}`}</Tex>
          <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
            <div className="min-w-[560px]">
              <WallFig w={W8} r={r} />
            </div>
          </div>
          <Md>{`(ii) Tension crack where $\\sigma_a = 0$: $z_c = \\dfrac{2c_u - q}{\\gamma} = \\dfrac{34 - 11}{21}$ = **${f2(k.zc)} m**. The surcharge partly closes the crack (without it, $z_c = 2c_u/\\gamma = ${f2(34 / 21)}$ m).`}</Md>
          <Head>(iii) Before the crack (whole diagram, tension included)</Head>
          <PiecesTable pieces={r.piecesBefore} />
          <Md>{`$P_a = ${f2(r.Fbefore)}$ kN/m acting **${f2(r.zbarBefore)} m** above the base (= ½(−23 + 82) × 5 = ${f2(k.before)}).`}</Md>
          <Head>(iv) After the crack (tension zone dropped)</Head>
          <PiecesTable pieces={r.pieces} />
          <Result>{`Before the crack: **${f2(r.Fbefore)} kN/m at ${f2(r.zbarBefore)} m**; after the crack: $P_a = \\tfrac12(5 - ${f2(k.zc)})(${f2(k.base)})$ = **${f2(r.Fs)} kN/m at ${f2(r.zbar)} m** above the base — larger, because the negative (tension) part no longer subtracts. The after-crack value is the design thrust.`}</Result>
        </Sol>
      )
    },
    notes: ['Total-stress analysis with γsat; no separate water pressure (the clay is saturated, φ = 0). If water filled the crack, add ½γw zc² at zc/3 below the crack bottom.'],
  },
]

function fitTwo() {
  return fitCircles(triaxCircles(T7).eff!)
}
