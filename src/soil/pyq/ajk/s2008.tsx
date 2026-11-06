// CE 341 term final 2008-09 — AJK sir’s half (W–V, plasticity, classification, structure, shear, earth pressure + old-syllabus items), solved by the engines.
// Section A (Q1 compulsory: any EIGHT of ten 5-mark parts, + any TWO of Q2–Q4), held 1 Mar 2010, PDF pp. 5–6. No figures in Section A.
import { Md, Tex } from '../../../components/ui'
import { uscs } from '../../engine/classify'
import { K0, Kp, solveWall, type Wall } from '../../engine/earth'
import { aLine, dryingChange } from '../../engine/plasticity'
import { cuFromDeviator, fitCircles, triaxCircles, type TriaxTest } from '../../engine/shear'
import { MohrFig } from '../../topics/shear/figs'
import type { SmQ } from '../../types'
import { CE, CT, culmannChecks, CulmannSolution, cutNumbers, DepthLoadSolution, depthLoadChecks, f1, f2, f3, FitText, Frame, Head, Model, MohrPlot, Result, Sol, Tbl, th, TriaxTable, UscsSolved, wallChecks, WallQFig, WallSolved } from './old-kit'

const P = '2008-09' as const

// ---------------------------------------------------------------- Q1(b)
const U1b = { F200: 60, LL: 19, PL: 14 }

// ---------------------------------------------------------------- Q1(d) loose vs compacted dry sand, passive
const q1d = () => {
  const H = 8
  const k1 = Kp(30),
    k2 = Kp(35)
  const P1 = 0.5 * 17.8 * H * H * k1,
    P2 = 0.5 * 18.8 * H * H * k2
  return { k1, k2, P1, P2, ratio: P1 / P2 }
}

// ---------------------------------------------------------------- Q1(g) cut caved at 4 m
const G1g = { gamma: 22, Hc: 4 }
const c1g = (G1g.gamma * G1g.Hc) / 4

// ---------------------------------------------------------------- Q1(h) OC clay at rest (γ not given)
const G1h = 18
const k0nc = K0.massarsch(40 - 25)
const k0oc = K0.ocSqrt(k0nc, 2.5)
const W1h: Wall = { layers: [{ h: 6, gamma: G1h, phi: 0, c: 0, K0: k0oc }], zw: null, q: 0, state: 'rest' }

// ---------------------------------------------------------------- Q2(b)
const D2 = { D10: 0.15, D30: 0.425, D60: 2.0 }
const U2b = { F200: 8, F4min: 60, LL: 27, PL: 15, Cu: D2.D60 / D2.D10, Cc: (D2.D30 * D2.D30) / (D2.D60 * D2.D10) }

// ---------------------------------------------------------------- Q3(a) two CU tests
const T3: TriaxTest[] = [
  { s3: 170, dev: 125, u: 110 },
  { s3: 430, dev: 310, u: 270 },
]
const q3 = () => {
  const tc = triaxCircles(T3)
  return { tc, fT: fitCircles(tc.total), fE: fitCircles(tc.eff!) }
}

// ---------------------------------------------------------------- Q4(a) sand over c–φ clay, GWL at the interface
const W4: Wall = {
  layers: [
    { h: 5.5, gamma: 18.5, phi: 34, c: 0, name: 'sand' },
    { h: 2.5, gamma: 20.3, gammaSat: 20.3, phi: 28, c: 17, name: 'sandy clay' },
  ],
  zw: 5.5,
  q: 0,
  state: 'active',
}

// ---------------------------------------------------------------- Q4(b)
const D4 = { z: 4.5, gamma: 19.8, phi: 32, dSigma: 65, tau: 50 }

export const A2008: SmQ[] = [
  {
    id: 'sm-2008-09-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Unconfined compression: Mohr circle, envelope, show cu = qu/2',
    text: "Draw the Mohr's circle at failure and strength envelope corresponding to Unconfined Compression Test, and show that $C_u = q_u/2$.",
    pages: [5],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-uc')} />,
  },
  {
    id: 'sm-2008-09-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 5,
    topics: ['sm-class'],
    title: 'USCS: 60 % passing 75 µm, LL 19, PL 14 (hatched CL-ML zone)',
    text: 'Classify the soil having the following properties, as per USCS: fraction passing 75 micron sieve = 60%; liquid limit = 19%; plastic limit = 14%.',
    pages: [5],
    given: [],
    checks: () => [
      { key: 'PI', label: 'PI', value: U1b.LL - U1b.PL },
      { key: 'A', label: 'A-line PI at LL = 19', value: aLine(U1b.LL), tol: 0.01 },
      { key: 'plus', label: '% retained on No. 200 (coarse)', value: 100 - U1b.F200, unit: '%' },
    ],
    solution: () => {
      const u = uscs(U1b)
      return (
        <Sol>
          <UscsSolved inp={U1b} />
          <Result>{`**${u.symbol}** — silty clay; 40 % is coarser than 75 µm, so the full name is "sandy silty clay" or "gravelly silty clay" depending on the sand/gravel split, which is not given.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2008-09-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 5,
    topics: ['sm-plast'],
    title: 'Volume change on drying from 8 % when SL = 12 %',
    text: 'The shrinkage limit of a soil is 12%. The soil is dried from its initial water content of 8% to dry state. Calculate the percentage of volume change in this process.',
    pages: [5],
    flag: 'Shrinkage-limit calculation — not in AJK sir’s slides (SL is only named).',
    given: [],
    checks: () => [{ key: 'dv', label: 'Volume change on drying (% of the initial volume)', value: dryingChange(8, 0, 12, 1.8).pctOfInitial, unit: '%', hint: 'Where does 8 % sit relative to the SL?' }],
    solution: () => {
      const r = dryingChange(8, 0, 12, 1.8)
      return (
        <Sol>
          <Md>{`The **shrinkage limit** is the water content below which further drying causes **no further reduction in volume** — water lost is replaced by air, the soil skeleton no longer contracts. The initial water content (8 %) is already **below** the SL (12 %), so drying from 8 % to 0 % happens entirely in the solid state.`}</Md>
          <Result>{`Volume change = **${f1(r.pctOfInitial)} %** — no volume change at all.`}</Result>
          <Md>{`(Had the soil started above the SL, say at w0 = 18 %, the change would be (w0 − SL)·SR % of the dry volume, which needs the shrinkage ratio — not given; that is the hint that 8 % is intended.)`}</Md>
        </Sol>
      )
    },
    notes: ['The scan clearly reads 8 %: a trick case (or a typo for 18 %, which would need the shrinkage ratio, not given).'],
  },
  {
    id: 'sm-2008-09-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 5,
    topics: ['sm-lep'],
    title: 'Ratio of Rankine passive thrusts: loose (φ 30°) vs compacted (φ 35°) dry sand, 8 m wall',
    text: "A retaining wall of height 8 m retains dry sand. In the initial state the soil is loose and has a void ratio of 0.5, γd = 17.8 kN/m³ and φ = 30°. Subsequently the backfill is compacted to a state where the void ratio is 0.4, γd = 18.8 kN/m³ and φ = 35°. Find the ratio of the initial passive thrust to the final passive thrust, according to Rankine's earth pressure theory.",
    pages: [5],
    given: [],
    checks: () => {
      const r = q1d()
      return [
        { key: 'k1', label: '$K_p$ initial (φ = 30°)', value: r.k1, tol: 0.01 },
        { key: 'k2', label: '$K_p$ final (φ = 35°)', value: r.k2, tol: 0.01 },
        { key: 'P1', label: 'Initial passive thrust', value: r.P1, unit: 'kN/m' },
        { key: 'P2', label: 'Final passive thrust', value: r.P2, unit: 'kN/m' },
        { key: 'r', label: 'Ratio initial/final', value: r.ratio, tol: 0.01 },
      ]
    },
    solution: () => {
      const r = q1d()
      return (
        <Sol>
          <Tex block>{`P_p = \\tfrac12\\gamma H^2K_p,\\qquad K_p = \\tan^2(45 + \\varphi/2)`}</Tex>
          <Tex block>{`\\text{Initial: } K_p = \\tan^2 60^\\circ = ${f3(r.k1)},\\ P_p = \\tfrac12(17.8)(8)^2(${f3(r.k1)}) = ${f1(r.P1)}\\ \\text{kN/m}`}</Tex>
          <Tex block>{`\\text{Final: } K_p = \\tan^2 62.5^\\circ = ${f3(r.k2)},\\ P_p = \\tfrac12(18.8)(8)^2(${f3(r.k2)}) = ${f1(r.P2)}\\ \\text{kN/m}`}</Tex>
          <Result>{`Ratio = ${f1(r.P1)}/${f1(r.P2)} = **${f3(r.ratio)}** (= 17.8 × ${f3(r.k1)} / 18.8 × ${f3(r.k2)}). The void ratios are not needed. Compaction raises the passive resistance by about ${f1((1 / r.ratio - 1) * 100)} %.`}</Result>
        </Sol>
      )
    },
    notes: ['Printed "void ration" and "kw/m³" read as void ratio and kN/m³.'],
  },
  {
    id: 'sm-2008-09-1e',
    paper: P,
    sec: 'A',
    no: '1(e)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'UU test on saturated clay (σ3 = 100, deviator 200 kPa): strength parameters',
    text: 'An undrained triaxial compression test is carried out on a saturated clay sample under a cell pressure of 100 kN/m². The sample is failed at a deviator stress of 200 kN/m². Calculate the strength parameters of the sample.',
    pages: [5],
    given: [],
    checks: () => [
      { key: 'cu', label: 'Undrained cohesion $c_u$', value: cuFromDeviator(200), unit: 'kPa' },
      { key: 'phi', label: '$\\varphi_u$', value: 0, unit: '°' },
    ],
    solution: () => {
      const cu = cuFromDeviator(200)
      return (
        <Sol>
          <Md>{`Saturated clay sheared undrained: any change in cell pressure is carried by the pore water, so σ′ — and the strength — does not change with σ3. All total-stress circles have the same diameter and the envelope is horizontal: **φu = 0**.`}</Md>
          <Tex block>{`c_u = \\frac{\\sigma_1 - \\sigma_3}{2} = \\frac{200}{2} = ${f2(cu)}\\ \\text{kPa}`}</Tex>
          <Frame>
            <MohrFig height={200} circles={[{ c: { C: 100 + cu, R: cu, s1: 300, s3: 100 }, color: CT }]} envs={[{ env: { c: cu, phi: 0 }, color: CE, label: `τ = cu = ${f1(cu)} kPa (φu = 0)` }]} />
          </Frame>
          <Result>{`**cu = ${f1(cu)} kPa, φu = 0.**`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2008-09-1f',
    paper: P,
    sec: 'A',
    no: '1(f)',
    marks: 5,
    topics: ['sm-struct'],
    title: 'Line diagram: classification of soil deposits',
    text: 'Show in a line diagram the classification of soil deposits.',
    pages: [5],
    theory: true,
    flag: 'Origin of soil deposits — not in AJK sir’s Topic 4 slides.',
    solution: () => <Model item={th('sm-struct', 't-deposits')} />,
  },
  {
    id: 'sm-2008-09-1g',
    paper: P,
    sec: 'A',
    no: '1(g)',
    marks: 5,
    topics: ['sm-lep'],
    title: 'Vertical cut in clay caved at 4 m (γ = 22, φ = 0): back-calculate c',
    text: 'A vertical excavation was made in a clay deposit having unit weight of 22 kN/m³. It caved in after the digging reached 4 m depth. Assuming φ = 0, calculate the magnitude of cohesion.',
    pages: [5],
    flag: 'Critical height of an unsupported cut — not in AJK sir’s slides (only the crack depth is).',
    given: [],
    checks: () => [{ key: 'c', label: 'Cohesion from $H_c = 4c/\\gamma$', value: c1g, unit: 'kPa' }],
    solution: () => {
      const n = cutNumbers(c1g, G1g.gamma)
      return (
        <Sol>
          <Md>{`φ = 0 → Ka = 1, σa = γz − 2c. A vertical cut stands as long as the net active thrust on an imaginary wall face is not positive: $\\tfrac12\\gamma H^2 - 2cH = 0$ at the **critical height**`}</Md>
          <Tex block>{`H_c = \\frac{4c}{\\gamma}\\ \\Rightarrow\\ c = \\frac{\\gamma H_c}{4} = \\frac{22\\times4}{4} = ${f2(c1g)}\\ \\text{kPa}`}</Tex>
          <Md>{`Check: with c = ${f1(c1g)} kPa, $z_c = 2c/\\gamma$ = ${f2(n.zc)} m and $H_c = 2z_c$ = ${f2(n.Hc)} m ✓.`}</Md>
          <Result>{`**c = cu ≈ ${f1(c1g)} kPa.** (Terzaghi's crack-adjusted $H_c = 2.67c/\\gamma$ would give c = 22 × 4/2.67 = ${f1((G1g.gamma * G1g.Hc) / 2.67)} kPa.)`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2008-09-1h',
    paper: P,
    sec: 'A',
    no: '1(h)',
    marks: 5,
    topics: ['sm-lep'],
    title: 'At-rest thrust on a rigid 6 m wall: clay LL 40, PL 25, OCR 2.5 (γ assumed)',
    text: 'A rigid retaining wall 6 m high retains cohesive soil with liquid limit of 40% and plastic limit 25%. The OCR of the soil is 2.5. Calculate the lateral thrust coming on the wall.',
    pages: [5],
    given: [],
    checks: () => [
      { key: 'nc', label: '$K_{0(NC)} = 0.44 + 0.42\\,PI/100$', value: k0nc, tol: 0.01 },
      { key: 'oc', label: '$K_{0(OC)} = K_{0(NC)}\\sqrt{OCR}$', value: k0oc, tol: 0.01 },
      { key: 'P', label: `At-rest thrust with γ = ${G1h} kN/m³`, value: solveWall(W1h).Fs, unit: 'kN/m' },
    ],
    solution: () => (
      <WallSolved
        w={W1h}
        lead={`Rigid wall → **at rest**. Fine-grained OC soil: Massarsch (Das eq. 13.8) then eq. 13.9:\n\n$PI = 40 - 25 = 15$, $K_{0(NC)} = 0.44 + 0.42(15/100) = ${f3(k0nc)}$, $K_{0(OC)} = ${f3(k0nc)}\\sqrt{2.5} = ${f3(k0oc)}$.\n\nγ is not given — "assume reasonable values": γ = ${G1h} kN/m³, no water table. $P_0 = \\tfrac12K_0\\gamma H^2 = 14.3\\gamma$ kN/m for any γ.`}
      />
    ),
    notes: ['Unit weight not given: γ = 18 kN/m³ assumed; P0 = ½K0γH² = 14.3γ kN/m in general.'],
  },
  {
    id: 'sm-2008-09-1i',
    paper: P,
    sec: 'A',
    no: '1(i)',
    marks: 5,
    topics: ['sm-shear'],
    title: 'Mohr–Coulomb failure theory',
    text: 'Describe briefly the Mohr-Coulomb failure theory.',
    pages: [5],
    theory: true,
    solution: () => <Model item={th('sm-shear', 't-mc')} />,
  },
  {
    id: 'sm-2008-09-1j',
    paper: P,
    sec: 'A',
    no: '1(j)',
    marks: 5,
    topics: ['sm-class'],
    title: 'Salient features of the AASHTO classification',
    text: 'State the salient features of AASHTO soil classification.',
    pages: [5],
    theory: true,
    solution: () => <Model item={th('sm-class', 't-aashto')} />,
  },
  {
    id: 'sm-2008-09-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 25,
    topics: ['sm-lep'],
    title: "Culmann's method: 4.5 m vertical wall, level fill, φ = 32°, δ = 20°",
    text: "A retaining wall 4.5 m high with a vertical back supports a horizontal fill weighing 18.6 kN/m³ and having φ = 32°, δ = 20° and c = 0. Determine the total active thrust coming on the wall by Culmann's graphical method.",
    pages: [6],
    flag: "Culmann's method with wall friction (Coulomb) — not in AJK sir's slides this term.",
    given: [],
    checks: () => culmannChecks(4.5, 18.6, 32, 20, 'active'),
    solution: () => <CulmannSolution H={4.5} gamma={18.6} phi={32} delta={20} state="active" compare="coulomb" />,
    notes: ['Printed "Calmann\'s" read as Culmann\'s.'],
  },
  {
    id: 'sm-2008-09-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 25,
    topics: ['sm-class'],
    title: 'USCS with dual symbol: 8 % fines, D10/D30/D60 from #100, #40, #10; LL 27, PL 15',
    text: 'A soil has the following properties: percent passing 75 micron sieve = 8; percent passing #100 sieve = 10; percent passing #40 sieve = 30; percent passing #10 sieve = 60; liquid limit of fraction passing #40 sieve = 27; plastic limit of fraction passing #40 sieve = 15. Classify the soil as per USCS.',
    pages: [6],
    given: [],
    checks: () => [
      { key: 'cu', label: '$C_u = D_{60}/D_{10}$', value: U2b.Cu, tol: 0.01 },
      { key: 'cc', label: '$C_c = D_{30}^2/(D_{60}D_{10})$', value: U2b.Cc, tol: 0.01 },
      { key: 'PI', label: 'PI of the fines', value: U2b.LL - U2b.PL },
      { key: 'A', label: 'A-line PI at LL = 27', value: aLine(U2b.LL), tol: 0.01 },
    ],
    solution: () => {
      const u = uscs(U2b)
      return (
        <Sol>
          <Md>{`The given % passing values sit exactly on the 10, 30 and 60 % levels, so the characteristic sizes are the sieve openings: $D_{10}$ = 0.150 mm (#100), $D_{30}$ = 0.425 mm (#40), $D_{60}$ = 2.00 mm (#10).`}</Md>
          <Tex block>{`C_u = \\frac{2.00}{0.150} = ${f2(U2b.Cu)},\\qquad C_c = \\frac{0.425^2}{2.00\\times0.150} = ${f3(U2b.Cc)}`}</Tex>
          <UscsSolved inp={U2b} />
          <Result>{`**${u.symbol}** — ${u.name.toLowerCase()} (add "and gravel" if gravel ≥ 15 %; % passing No. 4 is not given, but at least 60 % passes No. 10, so sand ≥ 52 % and the soil is a sand).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2008-09-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'Two CU tests with pore pressure: total and effective c, φ; Af',
    text: 'Two consolidated undrained triaxial tests are performed on undisturbed silty clay samples. One sample is consolidated under an all round pressure of 170 kN/m² and when subjected to shear it fails at an added axial stress of 125 kN/m². The pore pressure at the time of failure is found to have a positive value of 110 kN/m². The second sample is consolidated under a pressure of 430 kN/m² and fails at an added stress of 310 kN/m². The corresponding pore water pressure at the time of failure is 270 kN/m². Find the total stress and effective shear strength parameters of the soil. Also compute the pore pressure parameter A at the time of failure. Assume B = 1.',
    pages: [6],
    flag: "Skempton's pore-pressure parameter A — not in AJK sir's slides.",
    given: [],
    checks: () => {
      const r = q3()
      return [
        { key: 'c', label: 'Total-stress c', value: r.fT.c, unit: 'kPa', tol: 0.1 },
        { key: 'phi', label: 'Total-stress φ', value: r.fT.phi, unit: '°', tol: 0.02 },
        { key: 'cp', label: "c′", value: r.fE.c, unit: 'kPa', tol: 0.1 },
        { key: 'phip', label: "φ′", value: r.fE.phi, unit: '°', tol: 0.02 },
        { key: 'A1', label: '$A_f$, sample 1', value: r.tc.Af[0]!, tol: 0.02 },
        { key: 'A2', label: '$A_f$, sample 2', value: r.tc.Af[1]!, tol: 0.02 },
      ]
    },
    solution: () => {
      const r = q3()
      return (
        <Sol>
          <TriaxTable tests={T3} />
          <Head>Total stress</Head>
          <FitText cs={r.tc.total} />
          <Head>Effective stress</Head>
          <FitText cs={r.tc.eff!} prime />
          <MohrPlot total={r.tc.total} eff={r.tc.eff!} envT={r.fT} envE={r.fE} />
          <Head>Pore pressure parameter A at failure</Head>
          <Md>{`With B = 1 and the cell pressure held constant during shear, $\\Delta u = A(\\Delta\\sigma_1 - \\Delta\\sigma_3)$, so $A_f = u_f/\\Delta\\sigma_f$ (the pore pressure at the start of shear is zero after consolidation):`}</Md>
          <Tbl head={['Sample', 'uf (kPa)', 'Δσf (kPa)', 'Af']} rows={T3.map((t, i) => [`${i + 1}`, f2(t.u!), f2(t.dev), f3(r.tc.Af[i]!)])} />
          <Result>{`Total: **c = ${f1(r.fT.c)} kPa, φ = ${f1(r.fT.phi)}°**; effective: **c′ = ${f1(r.fE.c)} kPa, φ′ = ${f1(r.fE.phi)}°**; **Af ≈ ${f2(r.tc.Af[0]!)} and ${f2(r.tc.Af[1]!)}** (typical of a normally consolidated clay, 0.5–1).`}</Result>
          <Md>{`With two circles the common tangent is exact; both intercepts are small, as for an NC silty clay (an envelope forced through the origin gives φ = ${f1(fitCircles([r.tc.total[0]], {}).phi)}° / ${f1(fitCircles([r.tc.total[1]], {}).phi)}° and φ′ = ${f1(fitCircles([r.tc.eff![0]], {}).phi)}° / ${f1(fitCircles([r.tc.eff![1]], {}).phi)}° from each circle alone).`}</Md>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2008-09-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 25,
    topics: ['sm-lep'],
    title: 'Derive the active pressure in a c–φ soil; tension-crack depth in pure clay',
    text: 'Derive a formula for active earth pressure due to a c-φ soil. Hence find an expression for depth of tension crack in a purely cohesive soil.',
    pages: [6],
    theory: true,
    solution: () => <Model item={th('sm-lep', 't-cphi')} />,
  },
  {
    id: 'sm-2008-09-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 25,
    topics: ['sm-lep'],
    title: '8 m wall: 5.5 m dry sand over c–φ sandy clay, GWL at the interface — Rankine active',
    text: 'An 8 m high retaining wall supports a 5.5 m deep sand layer (γd = 18.5 kN/m³, φ = 34°) overlying a saturated sandy clay layer (γsat = 20.3 kN/m³, φ = 28°, c = 17 kPa). The ground water level is located at the interface of the two layers. Draw the lateral stress distribution diagram and calculate the total active thrust.',
    pages: [6],
    given: [],
    figure: () => <WallQFig w={W4} />,
    checks: () => wallChecks(W4),
    solution: () => (
      <WallSolved
        w={W4}
        lead="Smooth vertical wall, level backfill, Rankine active on effective stresses: σ′a = σ′vKa − 2c′√Ka in each layer, water pressure added separately (K = 1) below the GWL. At the interface σ′v is continuous but Ka and c change, so the diagram steps. Here the clay's (σ′v Ka) at its top already exceeds 2c√Ka, so there is no tension zone."
      />
    ),
  },
  {
    id: 'sm-2008-09-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 25,
    topics: ['sm-shear'],
    title: 'Sand (φ 32°) at 4.5 m: strength on a horizontal plane before and after a structure',
    text: 'A soil sample taken from a sand deposit is tested in a direct shear apparatus and found to have an angle of shearing resistance of 32° at a unit weight of 19.8 kN/m³. Estimate the shear strength of the soil on a horizontal plane at a depth of 4.5 m below the ground surface. A structure proposed to be built on the site will cause the vertical and shear stresses to increase by 65 kN/m² and 50 kN/m² respectively. Will the structure be stable considering failure on the horizontal plane?',
    pages: [6],
    given: [],
    checks: () => depthLoadChecks(D4),
    solution: () => <DepthLoadSolution p={D4} />,
    notes: ['No water table given: σ′ = σ.', 'The shear stress on the horizontal plane before the structure is taken as zero (level ground), so after loading τ = 50 kPa.', 'Printed "silt" read as "site".'],
  },
]

