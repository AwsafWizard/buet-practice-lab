// CE 341 term final 2021-22 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section A (Q1–Q4), held 2 May 2023, PDF pp. 61–63 (+ charts p. 67).
import { Md, Tex } from '../../../components/ui'
import { settleProfile, tvFromTable, type SettleIn } from '../../engine/consolidation'
import { excavationHeave } from '../../engine/stresses'
import { boussinesq, KB, type Rect } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { FadumChart } from '../../reference/sd'
import { EW_PRESETS, EarthworkSolution, runEarthwork } from '../../topics/comp/EarthworkLab'
import { ProfileFig } from '../../topics/consol/figs'
import { SettleSolution } from '../../topics/consol/Solution'
import { ExFigure, ExSolution, EX_DEFAULT } from '../../topics/seep/HeaveLab'
import type { SmQ } from '../../types'
import { big, cornerSet, CornerTable, f2, f3, f4, Frm, Model, Models, netOf, NetFig, newmarkOf, NewmarkSolved, PlanFig, Result, sciTex, shift, Sol, SoilColumn, th } from './kit'

const P = '2021-22' as const
const TV_GIVEN = { label: 'Tv table', what: 'U % 10 … 90 → Tv 0.008 … 0.848 (printed in Q1(b))', ref: 'k-tvu' }

// ---------------------------------------------------------------- Q1(b)
const r1b = () => {
  const T1 = tvFromTable(20)
  const T2 = tvFromTable(50)
  const t2 = (100 * T2) / T1
  return { T1, T2, t2, cv: (T1 * 2 * 2) / 100 }
}

// ---------------------------------------------------------------- Fig. 1: T-shaped foundation, P at the left re-entrant corner
const AREA1: Rect[] = [
  { x1: 0, y1: 2, x2: 9, y2: 5 },
  { x1: 3, y1: 0, x2: 6, y2: 2 },
]
const P1: [number, number] = [3, 2]
const REL1 = shift(AREA1, P1)
const Fig1 = () => (
  <div className="max-w-[440px] mx-auto">
    <PlanFig
      rects={AREA1}
      P={P1}
      dims={[
        { a: [0, 5], b: [3, 5], text: '3 m' },
        { a: [3, 5], b: [6, 5], text: '3 m' },
        { a: [6, 5], b: [9, 5], text: '3 m' },
        { a: [0, 2], b: [0, 5], text: '3 m' },
        { a: [3, 0], b: [3, 2], text: '2 m', off: -14 },
      ]}
    />
  </div>
)
const FIG1_TXT = '(Fig. 1, plan: a bar 9 m long (3 m + 3 m + 3 m) and 3 m wide with a 3 m × 2 m stem under its middle third; P is the re-entrant corner where the stem’s left edge meets the bar.)'

// ---------------------------------------------------------------- Q3(a) two NC clays under a wide fill
const w3 = 0.34,
  Gs3 = 2.75
const e03 = w3 * Gs3
const gsat3 = ((Gs3 + e03) * GW) / (1 + e03)
const SET3: SettleIn = {
  layers: [
    { kind: 'sand', H: 2, gamma: 19, gammaSat: 19 },
    { kind: 'clay', H: 3, gamma: gsat3, gammaSat: gsat3, e0: e03, Cc: 0.35 },
    { kind: 'sand', H: 2, gamma: 20, gammaSat: 20 },
    { kind: 'clay', H: 3, gamma: gsat3, gammaSat: gsat3, e0: e03, Cc: 0.35 },
  ],
  wt: 0,
  load: { kind: 'fill', q: 5 * 20 },
}
const st3 = () => settleProfile(SET3)

// ---------------------------------------------------------------- Q3(c)
const EW3 = EW_PRESETS[1].ew

// ---------------------------------------------------------------- Q4(a) two point loads
const r4 = () => {
  const z = 6 + 8 / 2 - 1.5
  const own = boussinesq(300, 0, z)
  const other = boussinesq(300, 5, z)
  return { z, own, other, sum: own + other, rz: 5 / z }
}
const Fig3 = () => {
  const k = 22
  const X = (x: number) => 150 + x * k
  const Y = (z: number) => 30 + z * k
  return (
    <svg viewBox="0 0 520 360" className="w-full max-w-[540px]" role="img" aria-label="two footings over sand and clay">
      <rect x={20} y={Y(0)} width={480} height={6 * k} fill="var(--c-soil)" opacity={0.22} />
      <rect x={20} y={Y(6)} width={480} height={8 * k} fill="var(--c-soil)" opacity={0.55} />
      <rect x={20} y={Y(14)} width={480} height={10} fill="var(--c-mute)" opacity={0.4} />
      <line x1={20} x2={500} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.3} />
      <line x1={20} x2={500} y1={Y(3)} y2={Y(3)} stroke="var(--c-water)" strokeDasharray="6 3" />
      <text x={490} y={Y(3) - 3} fontSize={10} textAnchor="end" fill="var(--c-water)">
        WT
      </text>
      {[0, 5].map((x) => (
        <g key={x}>
          <rect x={X(x) - 0.6 * k} y={Y(1.5) - 6} width={1.2 * k} height={6} fill="var(--c-mute)" stroke="var(--c-ink)" />
          <rect x={X(x) - 4} y={Y(0) - 14} width={8} height={1.5 * k + 8} fill="var(--c-mute)" stroke="var(--c-ink)" strokeWidth={0.8} />
          <text x={X(x)} y={Y(0) - 18} fontSize={10} textAnchor="middle" fill="var(--c-load)">
            300 kN
          </text>
        </g>
      ))}
      <line x1={X(0)} x2={X(5)} y1={Y(0) - 26} y2={Y(0) - 26} stroke="var(--c-mute)" />
      <text x={X(2.5)} y={Y(0) - 29} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        5.0 m c/c
      </text>
      <circle cx={X(0)} cy={Y(10)} r={4} fill="var(--c-accent)" />
      <text x={X(0) + 6} y={Y(10) + 4} fontSize={10} fill="var(--c-accent)">
        mid-clay, below a footing
      </text>
      <line x1={X(0)} x2={X(0)} y1={Y(1.5)} y2={Y(10)} stroke="var(--c-accent)" strokeDasharray="3 3" />
      <g fontSize={10} fill="var(--c-mute)">
        <text x={26} y={Y(1.5)}>3 m</text>
        <text x={26} y={Y(4.5)}>3 m</text>
        <text x={26} y={Y(10)}>8 m</text>
        <text x={360} y={Y(1.5)}>Sand: Gs = 2.65, e0 = 0.70</text>
        <text x={360} y={Y(1.5) + 13}>MC = 10 % above the WT</text>
        <text x={360} y={Y(8)}>Clay: Gs = 2.55, e0 = 0.95</text>
        <text x={360} y={Y(8) + 13}>Cc = 0.36, cv = 40×10⁻⁴ cm²/s</text>
        <text x={360} y={Y(14) + 22}>stiff impervious stratum</text>
        <text x={70} y={Y(1.5) - 2}>1.5 m</text>
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- Q4(c) dam
const net4 = () => netOf('2122')
const k4 = 5e-8 // 5 × 10⁻⁵ mm/s in m/s

export const B2021: SmQ[] = [
  {
    id: 'sm-2021-22-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 12,
    topics: ['sm-wv', 'sm-comp'],
    title: 'Derive γd in terms of S, w, Gs and γw',
    text: 'Using phase diagram of soil establish an expression of $\\gamma_d$ in terms of S, w, $G_s$ and $\\gamma_w$. The symbles have their usual meanings.',
    pages: [61],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-gd')} />,
    notes: ['"symbles" is sic.'],
  },
  {
    id: 'sm-2021-22-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 14,
    topics: ['sm-consol'],
    title: '40 mm in 100 days of 200 mm: time for 100 mm',
    text: 'After construction of a building, it underwent a settlement of 40 mm in 100 days due to consolidation of a 4 m thick underlying clay layer. If the total consolidation settlement of the clay layer is 200 mm, find the time for 100 mm consolidation settlement. Assume two way drainage of the clay layer. Time factor $T_v$ for various degree of consolidation are given in the following Table.\n\n| U % | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |\n|---|---|---|---|---|---|---|---|---|---|---|\n| $T_v$ | 0.008 | 0.031 | 0.071 | 0.126 | 0.197 | 0.287 | 0.403 | 0.567 | 0.848 | ∞ |',
    pages: [61],
    given: [TV_GIVEN],
    checks: () => {
      const r = r1b()
      return [
        { key: 'U1', label: 'U after 100 days', value: 20, unit: '%' },
        { key: 'cv', label: '$c_v$ back-calculated', value: r.cv * 1000, unit: '× 10⁻³ m²/day' },
        { key: 't', label: 'Time for 100 mm settlement', value: r.t2, unit: 'days', tol: 0.02 },
      ]
    },
    solution: () => {
      const r = r1b()
      return (
        <Sol>
          <Md>{`$U_1 = 40/200 = 20\\ \\%$ → $T_{v1} = ${f3(r.T1)}$ (table). $U_2 = 100/200 = 50\\ \\%$ → $T_{v2} = ${f3(r.T2)}$. Same layer and drainage (d = 4/2 = 2 m), so $t \\propto T_v$:`}</Md>
          <Tex block>{`c_v = \\frac{T_{v1}d^2}{t_1} = \\frac{${f3(r.T1)} \\times 2^2}{100} = ${sciTex(r.cv, 3)}\\ \\text{m}^2\\text{/day}`}</Tex>
          <Tex block>{`t_2 = \\frac{T_{v2}d^2}{c_v} = t_1\\frac{T_{v2}}{T_{v1}} = 100 \\times \\frac{${f3(r.T2)}}{${f3(r.T1)}} = ${f2(r.t2)}\\ \\text{days} \\approx ${f2(r.t2 / 365)}\\ \\text{years}`}</Tex>
          <Result>{`Time for 100 mm settlement ≈ **${f2(r.t2)} days** (≈ ${f2(r.t2 / 365)} years). (The exact series, $T_v = (\\pi/4)U^2$ below 60 %, gives Tv1 = 0.0314, Tv2 = 0.196 → 625 days.)`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2021-22-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 15,
    topics: ['sm-stress'],
    title: "Newmark's chart: T-shaped foundation, 150 kPa, 5 m below the re-entrant corner",
    text: "A foundation (Fig. 1) is loaded with a uniform pressure of 150 kPa. Determine the vertical stress at a point P at a depth of 5 m from the foundation base. Use Newmarks's influence chart (attached).\n\n" + FIG1_TXT,
    pages: [61, 67],
    given: [{ label: "Newmark's influence chart", what: '0.005, 200 meshes (p. 67)', ref: 'd-newmark' }],
    figure: Fig1,
    checks: () => {
      const n = newmarkOf(REL1, 5)
      return [
        { key: 'N', label: 'Meshes covered N', value: n.N, tol: 0.05 },
        { key: 's', label: 'σz 5 m below P', value: n.I * 150, unit: 'kPa', tol: 0.05 },
      ]
    },
    solution: () => (
      <>
        <NewmarkSolved rel={REL1} z={5} q={150} lead="P is the re-entrant corner (3 m from the left end of the bar, where the stem meets it). AB = 5 m." />
        <Result>{`σz ≈ **${f2(newmarkOf(REL1, 5).I * 150)} kPa** (N ≈ ${f2(newmarkOf(REL1, 5).N)}).`}</Result>
      </>
    ),
  },
  {
    id: 'sm-2021-22-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 5.67,
    topics: ['sm-comp'],
    title: 'Rollers to suggest for different soils',
    text: 'State the types of rollers that you will suggest to compact different soil types.',
    pages: [62],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-rollers')} />,
  },
  {
    id: 'sm-2021-22-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 14,
    topics: ['sm-consol'],
    title: 'Sample disturbance and the field e–log p curve (NC clay)',
    text: 'Describe the effect of sampling disturbance on e-log(p) curve obtained from laboratory test. Also state the procedure for establishment of field e - log(p) curve for NC clay of low to mediun plasticity.',
    pages: [62],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-disturb')} />,
    notes: ['Printed marks 4 + 10. "mediun" is sic.'],
  },
  {
    id: 'sm-2021-22-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 20,
    topics: ['sm-seep'],
    title: '9 m excavation in 12 m of clay over sand: possible without dewatering?',
    text: 'For construction of a building foundation at a site, excavation is to be made to a depth of 9 m. The subsoil at the site consist of 12 m thick clay layer (saturated unit weight 18.5 kN/m³) extending from the ground surface and is underlain by a sand layer. Water table is at the ground surface. It is considered that, as excavation continues, water level will be always kept to the bottom of excavation by pumping. Carry out the relevant analysis and comment whether excavation will be possible without lowering the water table surrounding the excavation.',
    pages: [62],
    given: [],
    figure: () => (
      <div className="max-w-[460px] mx-auto">
        <ExFigure s={EX_DEFAULT} />
      </div>
    ),
    checks: () => {
      const r = excavationHeave({ Hc: 12, gSat: 18.5, wt: 0 }, 9, 1)
      return [
        { key: 'u', label: 'Uplift water pressure at the clay base', value: r.u, unit: 'kPa' },
        { key: 'W', label: 'Downward stress of the remaining 3 m of clay', value: r.W, unit: 'kPa' },
        { key: 'fs', label: 'FS against heave at 9 m', value: r.FS },
        { key: 'dm', label: 'Maximum depth without dewatering', value: r.dMax, unit: 'm' },
        { key: 'dd', label: 'Drop in sand head needed for 9 m', value: r.drawdown, unit: 'm' },
      ]
    },
    solution: () => {
      const r = excavationHeave({ Hc: 12, gSat: 18.5, wt: 0 }, 9, 1)
      return (
        <Sol>
          <ExSolution s={EX_DEFAULT} />
          <Result>{`At 9 m the clay left (3 m) weighs ${f2(r.W)} kPa against an uplift of ${f2(r.u)} kPa: FS = ${f2(r.FS)} < 1, so the **base would heave (blow up) long before 9 m**. Excavation is possible only to about **${f2(r.dMax)} m** without dewatering; to reach 9 m the piezometric head in the sand must be lowered by at least **${f2(r.drawdown)} m** (relief wells / deep wells in the sand).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2021-22-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 12.67,
    topics: ['sm-stress'],
    title: "Fadum's chart: same T-shaped foundation, 200 kPa, 5 m below P",
    text: "Consider the foundations as shown in Fig. 1. If it transmits a uniform pressure of 200 kPa at its base, determine the stress at point P at a depth of 5 m using Fadum's chart for Newmark's influence coefficient (attached).\n\n" + FIG1_TXT,
    pages: [62, 61, 67],
    given: [{ label: "Fadum's chart", what: 'I(m, n) for a corner (p. 67)', ref: 'd-fadum' }],
    figure: Fig1,
    checks: () => {
      const ts = cornerSet(REL1, 5)
      const I = ts.reduce((s, t) => s + t.sign * t.I, 0)
      return [
        { key: 'I', label: 'Sum of the influence coefficients ΣI', value: I, tol: 0.02 },
        { key: 's', label: 'σz 5 m below P', value: 200 * I, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => {
      const ts = cornerSet(REL1, 5)
      return (
        <Sol>
          <Md>{`P is a corner of every piece, so split the T into three rectangles meeting at P: the bar left of P (3 m × 3 m), the bar right of P (3 m × 6 m) and the stem (3 m × 2 m). z = 5 m, m = B/z, n = L/z (interchangeable), read I on Fadum's chart:`}</Md>
          <CornerTable rel={REL1} z={5} q={200} />
          <Frm>
            <div className="max-w-[420px] mx-auto">
              <FadumChart pts={ts.map((t) => [t.m, t.n] as [number, number])} />
            </div>
          </Frm>
          <Result>{`σz at 5 m below P ≈ **${f2(200 * ts.reduce((s, t) => s + t.sign * t.I, 0))} kPa** (chart readings ±0.002 give ±0.5 kPa).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2021-22-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 20,
    topics: ['sm-consol'],
    title: 'Two NC clay layers under a 5 m fill (20 kN/m³)',
    text: 'The subsoil condition at a site is shown in the Fig. 2. The water table is at the ground surface. The entire site (large area) is raised by 5 m fill of soil with average unit weight of 20 kN/m³. Estimate the consolidation settlement due to the landfill.\n\n(Fig. 2, from the top: 2 m sand, $\\gamma_{sat}$ = 19 kN/m³; 3 m clay, $C_c$ = 0.35, w = 0.34, $G_s$ = 2.75; 2 m sand, $\\gamma_{sat}$ = 20 kN/m³; 3 m clay, $C_c$ = 0.35, w = 0.34, $G_s$ = 2.75; hard clay.)',
    pages: [62],
    given: [],
    figure: () => (
      <SoilColumn
        layers={[
          { H: 2, name: 'Sand', kind: 'sand', props: ['γsat = 19 kN/m³'] },
          { H: 3, name: 'Clay', kind: 'clay', props: ['Cc = 0.35, w = 0.34, Gs = 2.75'] },
          { H: 2, name: 'Sand', kind: 'sand', props: ['γsat = 20 kN/m³'] },
          { H: 3, name: 'Clay', kind: 'clay', props: ['Cc = 0.35, w = 0.34, Gs = 2.75'] },
          { H: 0.8, name: 'Hard clay', kind: 'rock' },
        ]}
        wt={0}
      />
    ),
    checks: () => {
      const s = st3()
      return [
        { key: 'e0', label: '$e_0 = wG_s$', value: e03 },
        { key: 'g', label: 'Clay $\\gamma_{sat}$', value: gsat3, unit: 'kN/m³' },
        { key: 'p1', label: "$p'_0$ at the middle of the upper clay", value: s.layers[0].subs[0].p0, unit: 'kPa' },
        { key: 'p2', label: "$p'_0$ at the middle of the lower clay", value: s.layers[1].subs[0].p0, unit: 'kPa' },
        { key: 'S1', label: 'Settlement of the upper clay', value: s.layers[0].S * 1000, unit: 'mm' },
        { key: 'S2', label: 'Settlement of the lower clay', value: s.layers[1].S * 1000, unit: 'mm' },
        { key: 'S', label: 'Total settlement', value: s.S * 1000, unit: 'mm' },
      ]
    },
    solution: () => {
      const s = st3()
      return (
        <Sol>
          <Md>{`Clays saturated (WT at GL): $e_0 = wG_s = 0.34 \\times 2.75 = ${f3(e03)}$, $\\gamma_{sat} = (2.75 + ${f3(e03)})9.81/${f3(1 + e03)} = ${f2(gsat3)}$ kN/m³; no pc′ is given, so both are taken as NC. A wide fill adds $\\Delta p = 5 \\times 20 = 100$ kPa at every depth.`}</Md>
          <SettleSolution inp={SET3} out={s} />
          <Frm wide={560}>
            <ProfileFig inp={SET3} out={s} />
          </Frm>
          <Result>{`Consolidation settlement ≈ ${f2(s.layers[0].S * 1000)} + ${f2(s.layers[1].S * 1000)} = **${f2(s.S * 1000)} mm** (≈ ${f2(s.S)} m).`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2021-22-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 16,
    topics: ['sm-comp', 'sm-consol', 'sm-seep'],
    title: 'Short notes: secondary consolidation, icr, ZAV curve, field compaction control',
    text: 'Write short notes on:\n\n(i) Secondary consolidation settlement\n(ii) Critical hydraulic gradient\n(iii) Zero air void curve\n(iv) Field compaction control',
    pages: [62],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: '(i) Secondary consolidation settlement', item: th('sm-consol', 't-secondary') },
          { title: '(ii) Critical hydraulic gradient', item: th('sm-seep', 't-icr') },
          { title: '(iii) Zero air void curve', item: th('sm-comp', 't-curve'), noFig: true },
          { title: '(iv) Field compaction control', item: th('sm-comp', 't-control') },
        ]}
      />
    ),
    notes: ['Marks are not split; about 4 each.'],
  },
  {
    id: 'sm-2021-22-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 10.67,
    topics: ['sm-comp'],
    title: 'Payment to the borrow-area owner for a 20,000 m³ fill',
    text: 'A compacted fill of volume 20,000 m³ is to be constructed at a dry density of 18.6 kN/m³ using the soil from a nearby borrow area. The soil in the borrow area has a void ratio of 0.95 and specific graity of 2.70. Determine the total amount to be paid to the owner of the borrow area at the rate of Tk. 500 per cum.',
    pages: [62],
    given: [],
    checks: () => {
      const r = runEarthwork(EW3).res[0]
      return [
        { key: 'gd', label: 'Dry unit weight in the borrow area', value: r.p.gdBank, unit: 'kN/m³' },
        { key: 'V', label: 'Volume to excavate', value: r.p.Vbank, unit: 'm³' },
        { key: 'pay', label: 'Payment to the owner', value: r.payCost / 1e6, unit: 'million Tk' },
      ]
    },
    solution: () => {
      const r = runEarthwork(EW3).res[0]
      return (
        <Sol>
          <Md>{`Borrow $\\gamma_d = G_s\\gamma_w/(1 + e) = 2.70 \\times 9.81/1.95$; solids conserved.`}</Md>
          <EarthworkSolution ew={EW3} />
          <Result>{`Volume dug ≈ ${big(r.p.Vbank)} m³ → payment ≈ **Tk ${big(r.payCost)}** (≈ Tk ${f2(r.payCost / 1e7)} crore).`}</Result>
        </Sol>
      )
    },
    notes: ['"graity" is sic. "dry density 18.6 kN/m³" is a dry unit weight.'],
  },
  {
    id: 'sm-2021-22-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 15,
    topics: ['sm-stress'],
    title: 'Two 300 kN columns 5 m apart: Boussinesq stress at mid-clay below one',
    text: 'Two column footings, each 1.2 m × 1.2 m in plan, are spaced 5.0 m apart center to center. Each footing transmits 300 kN of load to a sand stratum at 1.5 m below the ground surface (Fig. 3). The sand stratum is 6.0 m thick below which exists a 8.0 m thick compressible clay layer which is underlain by a stiff impervious stratum. Water Table is 3 m below the ground surface. Considering the column loads as point loads acting at the center of the footings, determine the stress increase at the mid height of the clay layer and vertically below the center of any one of the footings.\n\n$$\\sigma_z = \\frac{3Q}{2\\pi z^2}\\frac{1}{[1 + (r/z)^2]^{5/2}}$$',
    pages: [63],
    given: [{ label: 'Boussinesq formula', what: 'printed under Fig. 3', ref: 'd-kb', formula: true }],
    figure: Fig3,
    checks: () => {
      const r = r4()
      return [
        { key: 'z', label: 'Depth of the point below the footing base', value: r.z, unit: 'm' },
        { key: 'own', label: 'From the footing above the point', value: r.own, unit: 'kPa' },
        { key: 'oth', label: 'From the other footing (r = 5 m)', value: r.other, unit: 'kPa' },
        { key: 'sum', label: 'Total stress increase', value: r.sum, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = r4()
      return (
        <Sol>
          <Md>{`Mid-height of the clay = 6 + 8/2 = 10 m below GL; the loads act at the footing base (1.5 m), so $z = 10 - 1.5 = ${f2(r.z)}$ m.`}</Md>
          <Tex block>{`\\text{own footing } (r = 0):\\ \\sigma_z = \\frac{3(300)}{2\\pi(${f2(r.z)})^2} = ${f4(KB(0))} \\times \\frac{300}{${f2(r.z * r.z)}} = ${f3(r.own)}\\ \\text{kPa}`}</Tex>
          <Tex block>{`\\text{other footing } (r = 5,\\ r/z = ${f3(r.rz)}):\\ K_B = \\frac{0.4775}{[1 + ${f3(r.rz)}^2]^{5/2}} = ${f4(KB(r.rz))},\\ \\sigma_z = ${f4(KB(r.rz))} \\times \\frac{300}{${f2(r.z * r.z)}} = ${f3(r.other)}\\ \\text{kPa}`}</Tex>
          <Result>{`Stress increase at mid-clay below one footing ≈ ${f3(r.own)} + ${f3(r.other)} = **${f2(r.sum)} kPa**. (The soil data in Fig. 3 — Gs, e0, MC, Cc, cv — are not needed for this part.)`}</Result>
        </Sol>
      )
    },
    notes: ['Fig. 3 also gives soil properties that this part does not use; they look like the remains of a fuller settlement problem.'],
  },
  {
    id: 'sm-2021-22-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 11.67,
    topics: ['sm-comp', 'sm-wv'],
    title: 'Sand cone method of field density',
    text: 'State the method of determining field density of soils using Sand Cone Method.',
    pages: [63],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-sandcone')} />,
  },
  {
    id: 'sm-2021-22-4c',
    paper: P,
    sec: 'A',
    no: '4(c)',
    marks: 20,
    topics: ['sm-seep'],
    title: 'Flow net under a 20 m dam on a 12 m permeable layer; seepage for 25 m length',
    text: 'Fig. 4 shows the section of a dam. For the underlying soil $k_x$ = 5 × 10⁻⁵ mm/s and $k_z$ = 5 × 10⁻⁵ mm/s. Draw a flow net and calculate the rate of seepage below the dam. The dam is 25 m long.\n\n(Fig. 4: headwater 5 m above the ground upstream, tailwater at the ground downstream; dam base 20 m on the ground surface; permeable layer 12 m thick.)',
    pages: [63],
    given: [],
    figure: () => <NetFig c={net4()} net={false} />,
    checks: () => {
      const c = net4()
      const q = k4 * c.sol.H * c.sol.shape
      return [
        { key: 'r', label: '$N_f/N_d$', value: c.sol.shape, tol: 0.08 },
        { key: 'q', label: 'Seepage per metre run', value: q * 1e8, unit: '× 10⁻⁸ m³/s', tol: 0.08 },
        { key: 'Q', label: 'Seepage below the 25 m dam', value: q * 25 * 86400, unit: 'm³/day', tol: 0.08 },
      ]
    },
    solution: () => {
      const c = net4()
      const q = k4 * c.sol.H * c.sol.shape
      return (
        <Sol>
          <Md>{`Isotropic soil ($k_x = k_z$), so a square net is drawn on the true section. Boundaries: the dam base and the bottom of the permeable layer are flow lines; the upstream bed (head 5 m) and the downstream bed (head 0) are equipotentials. $H = 5$ m.`}</Md>
          <NetFig c={c} />
          <Md>{`With $N_f = ${c.st.Nf}$ the squares give $N_d = ${f2(c.R.Nd)}$ (solver: $N_f/N_d = ${f3(c.sol.shape)}$); a hand net of 4 channels and about 10 drops is right.`}</Md>
          <Tex block>{`k = 5\\times10^{-5}\\ \\text{mm/s} = 5\\times10^{-8}\\ \\text{m/s}`}</Tex>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 5\\times10^{-8} \\times 5 \\times ${f3(c.sol.shape)} = ${sciTex(q, 3)}\\ \\text{m}^3\\text{/s per m}`}</Tex>
          <Tex block>{`Q = 25q = ${sciTex(25 * q, 3)}\\ \\text{m}^3\\text{/s} = ${f3(25 * q * 86400)}\\ \\text{m}^3\\text{/day}`}</Tex>
          <Result>{`Seepage below the dam ≈ $${sciTex(25 * q, 2)}$ m³/s ≈ **${f3(25 * q * 86400)} m³/day** for the 25 m length.`}</Result>
        </Sol>
      )
    },
    notes: ['The dam is drawn on the ground surface with no cut-off; the downstream apron is part of the 20 m base.', 'k = 5 × 10⁻⁵ mm/s (a clayey silt) — the seepage is tiny.'],
  },
]
