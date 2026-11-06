// CE 341 term final 2011-12 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1 compulsory + any TWO of Q2–Q4), held 8 Jul 2013, PDF pp. 20–21; Fig. 1 (grain-size curves A–D) on p20.
import { Md, Tex } from '../../../components/ui'
import { aashto, grading, uscs, type GradPt } from '../../engine/classify'
import type { Wall } from '../../engine/earth'
import { shrinkage } from '../../engine/plasticity'
import { fitCircles, triaxCircles, type TriaxTest } from '../../engine/shear'
import { GradingCurve } from '../../topics/class/figs'
import type { SmQ } from '../../types'
import { AashtoSolved, cuCdChecks, CuCdSolution, f1, f2, f3, FitText, Frame, Head, Model, Models, MohrPlot, Result, Sol, Tbl, th, TriaxTable, UscsSolved, wallChecks, WallQFig, WallSolved } from './old-kit'

const P = '2011-12' as const

// ---------------------------------------------------------------- Q2(a) Fig. 1, digitised (papers_P1, ±1–2 %)
const pts = (a: [number, number][]): GradPt[] => a.map(([d, pf]) => ({ d, pf }))
const GA = pts([
  [50, 100],
  [40, 98],
  [30, 91],
  [25, 84],
  [20, 75],
  [15, 64],
  [12, 56],
  [10, 50],
  [8, 42],
  [6, 35],
  [4.75, 30],
  [3, 22],
  [2, 16],
  [1.16, 10],
  [0.85, 7.6],
  [0.425, 4.4],
  [0.075, 0.5],
  [0.03, 0],
])
const GB = pts([
  [2, 100],
  [1.5, 96],
  [1.3, 86],
  [1.18, 68],
  [1.1, 49],
  [1.0, 23],
  [0.85, 0],
])
const GC = pts([
  [0.65, 100],
  [0.6, 98.5],
  [0.425, 94],
  [0.3, 86],
  [0.25, 80],
  [0.2, 71],
  [0.15, 61],
  [0.1, 47],
  [0.075, 39],
  [0.05, 29],
  [0.03, 20],
  [0.02, 16.5],
  [0.01, 16],
])
const GD = pts([
  [0.4, 100],
  [0.3, 97],
  [0.2, 92],
  [0.15, 87],
  [0.1, 80],
  [0.075, 72],
  [0.06, 66],
  [0.05, 62],
  [0.04, 56],
  [0.03, 50],
  [0.02, 45],
  [0.01, 42],
])
const q2 = () => {
  const A = grading(GA),
    B = grading(GB),
    C = grading(GC),
    D = grading(GD)
  const uA = { F200: A.P200, F4: A.P4, NP: true, Cu: A.Cu, Cc: A.Cc }
  const uB = { F200: 0, F4: 100, NP: true, Cu: B.Cu, Cc: B.Cc }
  const uC = { F200: C.P200, F4: 100, LL: 40, PL: 16 }
  const aD = { P10: D.P10, P40: D.P40, P200: D.P200, LL: 62, PI: 62 - 34 }
  return { A, B, C, D, uA, uB, uC, aD }
}

// ---------------------------------------------------------------- Q3(a) three CU tests
const T3: TriaxTest[] = [
  { s3: 100, dev: 170, u: 40 },
  { s3: 200, dev: 260, u: 95 },
  { s3: 300, dev: 360, u: 135 },
]
const q3 = () => {
  const tc = triaxCircles(T3)
  const pair = (cs: typeof tc.total) => [fitCircles([cs[0], cs[1]]), fitCircles([cs[1], cs[2]]), fitCircles([cs[0], cs[2]])]
  return { tc, fT: fitCircles(tc.total), fE: fitCircles(tc.eff!), pT: pair(tc.total), pE: pair(tc.eff!) }
}

// ---------------------------------------------------------------- Q3(b) dock wall
const W3: Wall = { layers: [{ h: 10, gamma: 18.5, gammaSat: 18.5, phi: 32, c: 0 }], zw: 2, q: 30, state: 'active' }

// ---------------------------------------------------------------- Q4(a) shrinkage
const SH4 = { m1: 16.5, V1: 9.75, m2: 10.9, V2: 5.4 }

// ---------------------------------------------------------------- Q4(b) rapid vs slow
const CC4 = { z: 15, gsat: 19.8, ccu: 48.3, phicu: 13, cd: 41.4, phid: 23 }

export const A2011: SmQ[] = [
  {
    id: 'sm-2011-12-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 10,
    topics: ['sm-struct'],
    title: 'Transported soils: types and how each is formed',
    text: 'Define transported soil. Name the major types of transported soil and describe how each is formed.',
    pages: [20],
    theory: true,
    flag: 'Origin of soils — not in AJK sir’s Topic 4 slides.',
    solution: () => <Model item={th('sm-struct', 't-transported')} />,
  },
  {
    id: 'sm-2011-12-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 10,
    topics: ['sm-struct'],
    title: 'History of geotechnical engineering by age, with examples',
    text: 'How would you classify the history of geotechnical engineering? Cite at least one example of geotechnical importance for each classification age.',
    pages: [20],
    theory: true,
    flag: 'History of geotechnical engineering — not in this term’s slides.',
    solution: () => <Model item={th('sm-struct', 't-history')} />,
  },
  {
    id: 'sm-2011-12-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 10,
    topics: ['sm-struct'],
    title: 'Soils of Bangladesh: three categories, seven physiographic tracts',
    text: 'The three major categories of Bangladesh soil are found in seven physiographic tracts. Name the categories of soil, and also the physiographic tracts, mentioning the administrative locations of each of the tracts.',
    pages: [20],
    theory: true,
    flag: 'Soils of Bangladesh — not in this term’s slides.',
    solution: () => <Model item={th('sm-struct', 't-bd-soils')} />,
    notes: ['Printed "are found is seven" read as "are found in seven".'],
  },
  {
    id: 'sm-2011-12-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 10,
    topics: ['sm-struct'],
    title: 'Soil mechanics vs geotechnical engineering; aspects of geotechnical engineering',
    text: 'Distinguish between Soil Mechanics and Geotechnical Engineering. Explain briefly the various aspects of Geotechnical Engineering.',
    pages: [20],
    theory: true,
    flag: 'Introductory scope question — not in this term’s slides.',
    solution: () => <Model item={th('sm-struct', 't-sm-ge')} />,
  },
  {
    id: 'sm-2011-12-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 25,
    topics: ['sm-class'],
    title: 'Four grain-size curves (Fig. 1): soil A by USCS, soil D by AASHTO, broad USCS of B and C',
    text: 'Grain size distribution curves for four soils A, B, C and D are shown in Fig. 1, and the LL and PL values are: soil C = 40, 16; soil D = 62, 34. Classify soil A using USCS and soil D using the AASHTO soil classification system. What would be the broad classification of soils B and C as per USCS?',
    pages: [20],
    given: [],
    figure: () => (
      <div className="max-w-[560px] mx-auto">
        <GradingCurve
          curves={[
            { pts: GA, label: 'A', color: 'var(--c-accent)' },
            { pts: GB, label: 'B', color: 'var(--c-load)' },
            { pts: GC, label: 'C', color: 'var(--c-accent2)' },
            { pts: GD, label: 'D', color: 'var(--c-water)' },
          ]}
        />
        <p className="text-xs text-mute text-center">Fig. 1 redrawn from the scan (curves digitised, about ±1–2 %).</p>
      </div>
    ),
    checks: () => {
      const r = q2()
      return [
        { key: 'a10', label: 'Soil A: $D_{10}$', value: r.A.D10, unit: 'mm', tol: 0.08 },
        { key: 'a30', label: 'Soil A: $D_{30}$', value: r.A.D30, unit: 'mm', tol: 0.08 },
        { key: 'a60', label: 'Soil A: $D_{60}$', value: r.A.D60, unit: 'mm', tol: 0.08 },
        { key: 'acu', label: 'Soil A: $C_u$', value: r.A.Cu, tol: 0.12 },
        { key: 'acc', label: 'Soil A: $C_c$', value: r.A.Cc, tol: 0.15 },
        { key: 'ag', label: 'Soil A: % gravel (retained on No. 4)', value: 100 - r.A.P4, unit: '%', tol: 0.05 },
        { key: 'bcu', label: 'Soil B: $C_u$', value: r.B.Cu, tol: 0.1 },
        { key: 'cf', label: 'Soil C: % passing No. 200', value: r.C.P200, unit: '%', tol: 0.05 },
        { key: 'df', label: 'Soil D: % passing No. 200', value: r.D.P200, unit: '%', tol: 0.04 },
        { key: 'dgi', label: 'Soil D: group index (whole number)', value: aashto(r.aD).gi.gi, tol: 0.05 },
      ]
    },
    solution: () => {
      const r = q2()
      const uA = uscs(r.uA),
        uB = uscs(r.uB),
        uC = uscs(r.uC)
      const aD = aashto(r.aD)
      return (
        <Sol>
          <Md>{`Read each curve at the key sizes (4.75 mm = No. 4, 2 mm = No. 10, 0.425 mm = No. 40, 0.075 mm = No. 200) and at 10, 30 and 60 % finer:`}</Md>
          <Tbl
            head={['Soil', 'D10', 'D30', 'D60', 'Cu', 'Cc', '% No. 4', '% No. 10', '% No. 40', '% No. 200']}
            rows={(['A', 'B', 'C', 'D'] as const).map((k) => {
              const g = r[k]
              const dd = (v: number) => (Number.isFinite(v) ? f3(v) : '—')
              return [k, dd(g.D10), dd(g.D30), dd(g.D60), Number.isFinite(g.Cu) ? f2(g.Cu) : '—', Number.isFinite(g.Cc) ? f2(g.Cc) : '—', f1(g.P4), f1(g.P10), f1(g.P40), f1(g.P200)]
            })}
            cap="Sizes in mm. '—': the curve does not reach 10 % (fine soils C and D), so Cu and Cc are not defined — and not needed."
          />
          <Head>Soil A — USCS</Head>
          <UscsSolved inp={r.uA} />
          <Head>Soil D — AASHTO (LL 62, PL 34, PI 28)</Head>
          <AashtoSolved inp={r.aD} />
          <Head>Broad USCS of B and C</Head>
          <Md>{`- **Soil B:** a near-vertical curve — all grains between about 0.85 and 2 mm (coarse sand), no fines, no gravel. Uniform: Cu = ${f2(r.B.Cu)} (far below 6) → **${uB.symbol}**, ${uB.name.toLowerCase()} (uniform sand).
- **Soil C:** everything passes 4.75 mm, ${f1(r.C.P200)} % passes No. 200 (less than 50 %) → coarse-grained, sand; fines above 12 % with LL 40, PI 24 above the A-line (${f1(0.73 * 20)}) → **${uC.symbol}**, ${uC.name.toLowerCase()}.`}</Md>
          <Result>{`A: **${uA.symbol}** (${uA.name.toLowerCase()}); D: **${aD.label}**; B: **${uB.symbol}** (uniform coarse sand); C: **${uC.symbol}** (clayey sand).`}</Result>
        </Sol>
      )
    },
    notes: ['Values are read off the printed curves (digitised at 500 dpi, about ±1–2 % finer); a student reading by eye gets Cu ≈ 11–12, Cc ≈ 1.4–1.6 for soil A, so GW is robust.', 'Soil A has only 0.5 % fines, so its LL/PL are not needed (clean gravel).'],
  },
  {
    id: 'sm-2011-12-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Derive Rankine Ka (c = 0) with the failure plane; c–φ active pressure; unsupported height of a cut in clay',
    text: "Derive an expression for the coefficient of active earth pressure in a cohesionless soil using Rankine's method. Show also the orientation of the failure plane. Write down the expression for active earth pressure in a c-φ soil and hence deduce a formula of theoretical unsupported height for a purely cohesive soil.",
    pages: [20],
    theory: true,
    flag: 'Unsupported height of a cut (last part) — not in AJK sir’s slides (only the crack depth is).',
    solution: () => (
      <Models
        parts={[
          { title: 'Rankine Ka for a cohesionless soil, and the failure plane', item: th('sm-lep', 't-ka') },
          { title: 'c–φ soil: active pressure, tension crack and the unsupported height', item: th('sm-lep', 't-cphi') },
        ]}
      />
    ),
    notes: ['Printed "a formula of theoretical unsupported soil" — the word "height" is missing; read as the unsupported height of a cut.'],
  },
  {
    id: 'sm-2011-12-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'Three CU tests with pore pressures: c, φ, c′, φ′ from Mohr circles',
    text: 'A series of consolidated undrained triaxial tests were carried out on three identical saturated clay specimens. The results are tabulated below. Determine c, φ, c′ and φ′ using Mohr’s circles.\n\n| Specimen | Cell pressure (kPa) | Deviator stress at failure (kPa) | Pore pressure at failure (kPa) |\n|---|---|---|---|\n| 1 | 100 | 170 | 40 |\n| 2 | 200 | 260 | 95 |\n| 3 | 300 | 360 | 135 |',
    pages: [21],
    given: [],
    checks: () => {
      const r = q3()
      return [
        { key: 'c', label: 'Total-stress cohesion c', value: r.fT.c, unit: 'kPa', tol: 0.15 },
        { key: 'phi', label: 'Total-stress φ', value: r.fT.phi, unit: '°', tol: 0.05 },
        { key: 'cp', label: "Effective cohesion c′", value: r.fE.c, unit: 'kPa', tol: 0.2 },
        { key: 'phip', label: "Effective φ′", value: r.fE.phi, unit: '°', tol: 0.05 },
      ]
    },
    solution: () => {
      const r = q3()
      const rng = (fs: { c: number; phi: number }[]) => `φ ${f1(Math.min(...fs.map((x) => x.phi)))}–${f1(Math.max(...fs.map((x) => x.phi)))}°, c ${f1(Math.min(...fs.map((x) => x.c)))}–${f1(Math.max(...fs.map((x) => x.c)))} kPa`
      return (
        <Sol>
          <TriaxTable tests={T3} />
          <Head>Total stress envelope</Head>
          <FitText cs={r.tc.total} />
          <Head>Effective stress envelope</Head>
          <FitText cs={r.tc.eff!} prime />
          <MohrPlot total={r.tc.total} eff={r.tc.eff!} envT={r.fT} envE={r.fE} />
          <Md>{`The three circles are not exactly co-tangent: taking them in pairs gives total ${rng(r.pT)} and effective ${rng(r.pE)}. A tangent drawn by eye on graph paper lands inside that spread; the least-squares p–q line is the fair "best common tangent".`}</Md>
          <Result>{`Total: **c ≈ ${f1(r.fT.c)} kPa, φ ≈ ${f1(r.fT.phi)}°**; effective: **c′ ≈ ${f1(r.fE.c)} kPa, φ′ ≈ ${f1(r.fE.phi)}°**. (Af = u/Δσ = ${r.tc.Af.map((a) => f2(a!)).join(', ')}.)`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2011-12-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Dock wall 10 m: Rankine active with a 30 kPa surcharge and WT at 2 m',
    text: 'A dockside retaining wall 10 m high retains a non-cohesive backfill with a horizontal surface level with the top of the wall. The properties of the backfill material are γsat = 18.5 kN/m³, φ = 32°. An additional superimposed load of 30 kN/m² is indicated at the surface of the backfill due to construction of warehouses and dockyard traffic. Compute the lateral thrust on the wall when the water table is 2 m below the level surface. You are free to make reasonable assumptions for any missing data.',
    pages: [21],
    given: [],
    figure: () => <WallQFig w={W3} />,
    checks: () => wallChecks(W3),
    solution: () => (
      <WallSolved
        w={W3}
        lead="Rankine active, c = 0. Only γsat is given: the soil above the WT is taken at 18.5 kN/m³ as well (capillary-saturated fill near a dock); below the WT γ′ = 18.5 − 9.81 = 8.69 kN/m³. The surcharge adds a rectangle qKa; the water pressure (K = 1) is added below the WT."
        tail="If there is water in front of the dock wall at the same level, its pressure balances the water term and only the effective earth pressure remains — the paper does not say, so the full water thrust is kept (the critical case, e.g. rapid drawdown at low tide)."
      />
    ),
    notes: ['γ above the water table is not given — taken equal to γsat = 18.5 kN/m³.', 'No water in front of the wall assumed (worst case).'],
  },
  {
    id: 'sm-2011-12-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 25,
    topics: ['sm-plast'],
    title: 'Shrinkage limit and Gs from a shrinkage test (9.75 ml, 16.5 g → 5.40 ml, 10.9 g)',
    text: 'In an experiment for the determination of shrinkage limit, the following observations were taken:\n\n(i) volume of saturated soil = 9.75 ml;\n(ii) mass of saturated soil = 16.5 gm;\n(iii) volume of dry soil after shrinkage = 5.40 ml;\n(iv) mass of dry soil after shrinkage = 10.9 gm.\n\nCompute the shrinkage limit and specific gravity of soil solids.',
    pages: [21],
    flag: 'Shrinkage-limit calculation — not in AJK sir’s slides (SL is only named).',
    given: [],
    checks: () => {
      const s = shrinkage(SH4)
      return [
        { key: 'w1', label: 'Initial water content $w_1$', value: s.w1, unit: '%' },
        { key: 'SL', label: 'Shrinkage limit', value: s.SL, unit: '%' },
        { key: 'Gs', label: 'Specific gravity of solids $G_s$', value: s.Gs, tol: 0.01 },
      ]
    },
    solution: () => {
      const s = shrinkage(SH4)
      return (
        <Sol>
          <Md>{`Saturated pat: $m_1$ = 16.5 g, $V_1$ = 9.75 ml; oven-dry pat: $m_2 = M_s$ = 10.9 g, $V_2$ = 5.40 ml; $\\rho_w$ = 1 g/ml.`}</Md>
          <Tex block>{`w_1 = \\frac{m_1 - m_2}{m_2} = \\frac{16.5 - 10.9}{10.9} = ${f2(s.w1)}\\ \\%`}</Tex>
          <Md>{`Down to the SL the pat stays saturated, so each ml of volume lost is one gram of water lost:`}</Md>
          <Tex block>{`SL = \\frac{(m_1 - m_2) - (V_1 - V_2)\\rho_w}{m_2}\\times100 = \\frac{5.6 - 4.35}{10.9}\\times100 = ${f2(s.SL)}\\ \\%`}</Tex>
          <Md>{`At the SL the pat is still saturated but already at its dry volume $V_2$: $V_2 = V_s + V_w = \\dfrac{M_s}{G_s\\rho_w} + \\dfrac{SL\\cdot M_s}{\\rho_w}$, so`}</Md>
          <Tex block>{`G_s = \\frac{M_s}{(V_2 - SL\\cdot M_s/\\rho_w)\\rho_w} = \\frac{10.9}{5.40 - ${f3(s.SL / 100)}\\times10.9} = ${f3(s.Gs)}`}</Tex>
          <Result>{`SL = **${f1(s.SL)} %**, $G_s$ = **${f2(s.Gs)}** (shrinkage ratio $M_s/V_2$ = ${f2(s.SR)}).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2011-12-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'Silty clay at 15 m (WT at the surface): strength for rapid and for very slow loading',
    text: 'A boring log reveals that a thin layer of silty clay exists at a depth of 15 m below the ground surface. The soil above this layer is silt with γdry = 15.5 kN/m³, γsat = 19.8 kN/m³ and water content = 28%. The ground water table is found to exist nearly at the ground surface. Triaxial tests on the undisturbed silty clay samples give $c_{cu}$ = 48.3 kN/m², $\\varphi_{cu}$ = 13° and $c\'_d$ = 41.4 kN/m², $\\varphi\'_d$ = 23°. Estimate the shearing resistance of the silty clay on a horizontal plane (i) when the shear stress builds up rapidly and (ii) when the shear stress builds up very slowly.',
    pages: [21],
    given: [],
    checks: () => cuCdChecks(CC4),
    solution: () => <CuCdSolution p={CC4} />,
    notes: ['γdry and w of the silt are not needed once the water table is at the surface (all saturated).', 'Repeat of 2009-10 Q4(a).'],
  },
]
