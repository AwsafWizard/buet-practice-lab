// CE 341 term final, session January 2021 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section A (Q1–Q4), PDF pp. 47–49.
import { Md, Tex } from '../../../components/ui'
import { checkSpec, coreCutter, proctorCurve, proctorPeak, zav } from '../../engine/compaction'
import { casagrande, ccFromData, csFromData, pcTwoLines, settleProfile, type OedPt, type SettleIn } from '../../engine/consolidation'
import { embankmentBlocks, type Embankment } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { CompactionChart } from '../../topics/comp/figs'
import { ProfileFig } from '../../topics/consol/figs'
import { Chart, Legend, pathOf } from '../../topics/consol/plot'
import { SettleSolution } from '../../topics/consol/Solution'
import type { SmQ } from '../../types'
import { BulbAnswer, EmbFig, f2, f3, f4, Frm, Head, Model, Models, netOf, netPoint, NetFig, OsterbergSolved, Result, sciTex, Sol, SoilColumn, Tbl, th } from './kit'

const P = 'jan-2021' as const

// ---------------------------------------------------------------- Q1(b) printed flow net: Nf = 4, Nd = 6 (scan); icr from assumed Gs = 2.65, e = 0.65
const gsat1 = ((2.65 + 0.65) * GW) / 1.65
const net1 = () => netOf('j21', { gsat: gsat1 })
const k1 = 4e-5 // 4 × 10⁻³ cm/s
const NF = 4,
  ND = 6
const P1 = { x: 0.35, z: 6 - 3.3 },
  P2 = { x: 2.3, z: 6 - 2.1 }
const r1 = () => {
  const c = net1()
  const dh = c.sol.H / ND
  const q = (k1 * c.sol.H * NF) / ND
  const ie = dh / 0.82
  const a = netPoint(c, P1.x, P1.z)
  const b = netPoint(c, P2.x, P2.z)
  return { c, dh, q, ie, icr: c.R.icr, h1: 2 * dh, a, b, qs: k1 * c.sol.H * c.sol.shape }
}

// ---------------------------------------------------------------- Q2(b) core sample vs Modified Proctor
const MP = [5.9, 9.6, 11.5, 14.2, 15.2, 17.4].map((w, i) => ({ w: w / 100, gd: [16.54, 17.03, 17.18, 17.06, 16.88, 16.52][i] }))
const r2 = () => {
  const core = coreCutter({ D: 6, L: 15.2, W: 816, wWet: 102.96, wDry: 90.71 })
  const gb = core.rhoB * GW
  const gd = gb / (1 + core.w)
  const pk = proctorPeak(MP)
  const sp = checkSpec(gd, core.w, { mdd: pk.mdd, omc: pk.omc, rcMin: 0.95 })
  return { core, gb, gd, pk, sp }
}

// ---------------------------------------------------------------- Q3(b) OC clay under a circular footing (2:1)
const OED: OedPt[] = (
  [
    [5, 0.755, 'load'],
    [25, 0.74, 'load'],
    [50, 0.734, 'load'],
    [100, 0.717, 'load'],
    [200, 0.67, 'load'],
    [100, 0.675, 'unload'],
    [50, 0.68, 'unload'],
    [25, 0.69, 'unload'],
    [100, 0.678, 'reload'],
    [200, 0.664, 'reload'],
    [400, 0.609, 'reload'],
    [800, 0.539, 'reload'],
  ] as [number, number, OedPt['stage']][]
).map(([p, e, stage]) => ({ p, e, stage }))
const oed = () => ({ cas: casagrande(OED), two: pcTwoLines(OED), Cc: ccFromData(OED).Cc, cs: csFromData(OED)! })
const SET3 = (): SettleIn => {
  const o = oed()
  return {
    layers: [
      { kind: 'sand', H: 2, gamma: 17, gammaSat: 19 },
      { kind: 'clay', H: 2, gamma: 18, gammaSat: 18, e0: 0.8, Cc: o.Cc, Cs: o.cs.Cs, pc: o.cas.pc },
      { kind: 'sand', H: 1, gamma: 20, gammaSat: 20 },
    ],
    wt: 1.5,
    load: { kind: 'footing', shape: 'circle', B: 2, L: 2, Q: 500, Df: 1, method: '21' },
  }
}
function OedFig() {
  const o = oed()
  const s = settleProfile(SET3()).layers[0].subs[0]
  const xs = [4, 1000]
  const vir = (p: number) => o.two.virgin.a + o.two.virgin.b * Math.log10(p)
  const rec = (p: number) => o.two.recomp.a + o.two.recomp.b * Math.log10(p)
  return (
    <div className="space-y-1">
      <Chart w={420} h={270} x={{ min: 4, max: 1000, log: true, label: "p (kPa, log scale)" }} y={{ min: 0.52, max: 0.77, ticks: [0.55, 0.6, 0.65, 0.7, 0.75], label: 'e' }} label="oedometer e–log p">
        {(sc) => (
          <>
            <path d={pathOf(OED.filter((q) => q.stage === 'load').map((q) => [q.p, q.e]), sc)} fill="none" stroke="var(--c-accent)" strokeWidth={1.4} />
            <path d={pathOf([[200, 0.67], ...OED.filter((q) => q.stage !== 'load').map((q) => [q.p, q.e] as [number, number])], sc)} fill="none" stroke="var(--c-accent)" strokeWidth={1} strokeDasharray="4 3" />
            {OED.map((q, i) => (
              <circle key={i} cx={sc.X(q.p)} cy={sc.Y(q.e)} r={2.6} fill={q.stage === 'load' ? 'var(--c-accent)' : 'var(--c-load)'} />
            ))}
            <path d={pathOf(xs.map((p) => [p, vir(p)] as [number, number]).filter(([, e]) => e > 0.52 && e < 0.77), sc)} fill="none" stroke="var(--c-mute)" strokeDasharray="2 3" />
            <path d={pathOf(xs.map((p) => [p, rec(p)]), sc)} fill="none" stroke="var(--c-mute)" strokeDasharray="2 3" />
            {[
              { p: o.cas.pc, t: `p′c ≈ ${f2(o.cas.pc)}`, c: 'var(--c-bad)' },
              { p: s.p0, t: `p′0 = ${f2(s.p0)}`, c: 'var(--c-water)' },
              { p: s.p1, t: `p′0 + Δp = ${f2(s.p1)}`, c: 'var(--c-good)' },
            ].map((m, i) => (
              <g key={i}>
                <line x1={sc.X(m.p)} x2={sc.X(m.p)} y1={sc.T} y2={sc.B} stroke={m.c} strokeWidth={1.1} />
                <text x={sc.X(m.p) + 3} y={sc.T + 11 + 11 * i} fontSize={9} fill={m.c}>
                  {m.t}
                </text>
              </g>
            ))}
          </>
        )}
      </Chart>
      <Legend items={[{ c: 'var(--c-accent)', t: 'loading / reloading' }, { c: 'var(--c-load)', t: 'unload–reload loop', dash: true }, { c: 'var(--c-mute)', t: 'recompression and virgin lines', dash: true }]} />
    </div>
  )
}

// ---------------------------------------------------------------- Q4(b) embankment
const EMB: Embankment = { c: 8, h: 5, gamma: 19, aL: 10, aR: 25 }
const PA = { X: 10, z: 2, label: 'A' },
  PB = { X: 14, z: 3, label: 'B' }

export const BJAN21: SmQ[] = [
  {
    id: 'sm-jan-2021-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 16,
    topics: ['sm-comp'],
    title: 'Moisture–density relations: effect of energy and of soil type',
    text: 'Discuss the moisture~density relations in a laboratory test for variation in (i) compaction energy for a given soil (ii) soil type for a given compaction energy.',
    pages: [47],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: '(i) Compaction energy, same soil', item: th('sm-comp', 't-energy') },
          { title: '(ii) Soil type, same energy', item: th('sm-comp', 't-soiltypes') },
        ]}
      />
    ),
  },
  {
    id: 'sm-jan-2021-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 30.67,
    topics: ['sm-seep'],
    title: 'Printed flow net under a sheet pile: q per day, piezometer difference h1, boiling',
    text: "Fig.1 shows a flow net for a single row of sheet piles planned to be driven in a permeable stratum. The horizontal and vertical permeability of the stratum is same and equal to 4×10⁻³ cm/sec. Determine (i) Seepage flow per meter of wall in m³/day and (ii) the piezometric head difference 'h1' as shown in the Fig.1. (iii) Will the wall be safe against failure by 'sand boiling' at the downstream side?\n\n(Fig. 1: water 3 m above the ground upstream and 0.5 m downstream; pile tip 1.5 m below the ground; permeable layer 6 m deep; first downstream equipotential meets the pile 0.82 m below the ground; two piezometers on the downstream side.)",
    pages: [47],
    given: [],
    figure: () => <NetFig c={net1()} marks={[{ ...P1, label: 'P1' }, { ...P2, label: 'P2' }]} />,
    checks: () => {
      const r = r1()
      return [
        { key: 'q', label: '(i) Seepage per metre of wall (printed net, Nf = 4, Nd = 6)', value: r.q * 86400, unit: 'm³/day', tol: 0.1 },
        { key: 'h1', label: '(ii) Piezometric head difference h1', value: r.h1, unit: 'm', tol: 0.25, hint: 'count the equipotentials between the two piezometer tips' },
        { key: 'ie', label: '(iii) Exit gradient Δh/0.82', value: r.ie, tol: 0.08 },
        { key: 'fs', label: '(iii) FS against boiling ($i_{cr}$ ≈ 1)', value: r.icr / r.ie, tol: 0.12 },
      ]
    },
    solution: () => {
      const r = r1()
      const c = r.c
      return (
        <Sol>
          <Md>{`**Count the printed net.** Flow lines: the pile (BCDE), three solid U-shaped lines and the base GH → $N_f = 4$ channels. Equipotentials: AB, an outer arch (meeting the pile 0.82 m below GL), an inner arch (just above the tip), the vertical line below the tip, the two downstream arches and EF → $N_d = 6$ drops. $H = 3 - 0.5 = ${f2(c.sol.H)}$ m, $\\Delta h = ${f2(c.sol.H)}/6 = ${f3(r.dh)}$ m.`}</Md>
          <Head>(i) Seepage</Head>
          <Tex block>{`k = 4\\times10^{-3}\\ \\text{cm/s} = 4\\times10^{-5}\\ \\text{m/s},\\quad q = kH\\frac{N_f}{N_d} = 4\\times10^{-5} \\times ${f2(c.sol.H)} \\times \\frac{4}{6} = ${sciTex(r.q, 3)}\\ \\text{m}^3\\text{/s} = ${f2(r.q * 86400)}\\ \\text{m}^3\\text{/day per m}`}</Tex>
          <Md>{`(The solver's square net has $N_f/N_d = ${f3(c.sol.shape)}$, i.e. 4 channels need ${f2(c.R.Nd)} drops; it gives ${f2(r.qs * 86400)} m³/day — the printed net is a little coarse.)`}</Md>
          <Head>(ii) h1</Head>
          <Md>{`Each piezometer reads the total head at its tip. P1's tip (≈ 0.35 m from the pile, ≈ 3.3 m below GL) lies just past the vertical equipotential below the tip: **3 drops** used. P2's tip (≈ 2.3 m from the pile, ≈ 2.1 m below GL) lies just before the outer downstream equipotential: **5 drops** used. So`}</Md>
          <Tex block>{`h_1 = (5 - 3)\\Delta h = 2 \\times ${f3(r.dh)} = ${f3(r.h1)}\\ \\text{m}`}</Tex>
          <Md>{`Interpolating the heads at the tip positions (solver) gives ${f2(r.a.excess)} m and ${f2(r.b.excess)} m above tail water, i.e. $h_1 \\approx ${f2(r.a.h - r.b.h)}$ m — the drawn water levels in the two tubes differ by about 0.6 m.`}</Md>
          <Head>(iii) Sand boiling</Head>
          <Md>{`Last field on the downstream face: Δh over 0.82 m (printed): $i_e = ${f3(r.dh)}/0.82 = ${f3(r.ie)}$. No unit weight is given; for a sand $i_{cr} = (G_s - 1)/(1 + e) \\approx 1$ (e.g. Gs = 2.65, e = 0.65 → ${f3(r.icr)}).`}</Md>
          <Tex block>{`FS = \\frac{i_{cr}}{i_e} = \\frac{${f3(r.icr)}}{${f3(r.ie)}} = ${f2(r.icr / r.ie)}`}</Tex>
          <Result>{`(i) q ≈ **${f2(r.q * 86400)} m³/day per m**; (ii) h1 ≈ **${f2(r.h1)} m** (two drops); (iii) $i_e ≈ ${f2(r.ie)} < i_{cr} ≈ 1$: no boiling, but FS ≈ ${f2(r.icr / r.ie)} is below the 3–4 usually required — drive the pile deeper or place a filter / weighted blanket downstream.`}</Result>
        </Sol>
      )
    },
    notes: [
      'The scan shows three solid flow lines between the pile and the base, so Nf = 4 (the handnote counts 3 and gets 4.32 m³/day). Its own exact-net note (Nf/Nd ≈ 0.72) agrees with Nf = 4.',
      'h1: the handnote takes one drop (0.417 m), placing P2 one equipotential too early; the tube tips read from the scan are 2 drops apart (0.83 m; ≈ 0.65 m by interpolating within the fields).',
      'The figure redraws the section with the solver\'s square net (4 channels); the printed net is a coarser 4 × 6 sketch.',
    ],
  },
  {
    id: 'sm-jan-2021-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 16,
    topics: ['sm-seep'],
    title: 'Seepage analysis steps for a spillway foundation',
    text: 'Suppose you are to design the foundation of a spill way. Write down the steps of analyses that you will carry out from seepage considerations? Mention the quantities you will determine and state their significance.',
    pages: [48],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-spillway')} />,
  },
  {
    id: 'sm-jan-2021-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 30.67,
    topics: ['sm-comp'],
    title: 'Undisturbed core vs 95 % of Modified Proctor: does the work pass?',
    text: "Specification for an embankment construction states that the dry density to be obtained in the field should not be less than 95% of Modified Proctor Compaction. An undisturbed cylindrical soil sample, 60 mm in diameter and 152 mm long was retrieved from the compacted ground and it was found to weigh 816 gm. A small portion of this undisturbed sample, that weighed 102.96 gm, was oven dried and was found to be 90.71 gm after oven drying. Modified Proctor compaction test on collected soil sample was also carried out in the laboratory and the following data was obtained.\n\n| Moisture content, % | 5.9 | 9.6 | 11.5 | 14.2 | 15.2 | 17.4 |\n|---|---|---|---|---|---|---|\n| Dry density, kN/m³ | 16.54 | 17.03 | 17.18 | 17.06 | 16.88 | 16.52 |\n\nBased on appropriate analysis, comment whether the Contractor's work satisfied the specification.",
    pages: [48],
    given: [],
    checks: () => {
      const r = r2()
      return [
        { key: 'V', label: 'Volume of the core', value: r.core.V, unit: 'cm³' },
        { key: 'gb', label: 'Bulk unit weight', value: r.gb, unit: 'kN/m³' },
        { key: 'w', label: 'Water content', value: r.core.w * 100, unit: '%' },
        { key: 'gd', label: 'Field dry unit weight', value: r.gd, unit: 'kN/m³' },
        { key: 'mdd', label: 'Modified Proctor MDD', value: r.pk.mdd, unit: 'kN/m³', tol: 0.005 },
        { key: 'omc', label: 'OMC', value: r.pk.omc * 100, unit: '%', tol: 0.05 },
        { key: 'rc', label: 'Relative compaction', value: r.sp.rc * 100, unit: '%', tol: 0.005 },
      ]
    },
    solution: () => {
      const r = r2()
      const curve = proctorCurve(MP)
      return (
        <Sol>
          <Head>Field sample</Head>
          <Tex block>{`V = \\frac{\\pi}{4}(6.0)^2(15.2) = ${f2(r.core.V)}\\ \\text{cm}^3,\\quad \\rho = \\frac{816}{${f2(r.core.V)}} = ${f4(r.core.rhoB)}\\ \\text{g/cm}^3 \\Rightarrow \\gamma = ${f4(r.core.rhoB)} \\times 9.81 = ${f2(r.gb)}\\ \\text{kN/m}^3`}</Tex>
          <Tex block>{`w = \\frac{102.96 - 90.71}{90.71} = ${f2(r.core.w * 100)}\\ \\%,\\qquad \\gamma_d = \\frac{\\gamma}{1 + w} = \\frac{${f2(r.gb)}}{${f4(1 + r.core.w)}} = ${f2(r.gd)}\\ \\text{kN/m}^3`}</Tex>
          <Head>Modified Proctor curve</Head>
          <Md>{`Plot γd against w and draw a smooth curve; the peak (parabola through the highest point and its neighbours) is at OMC ≈ ${f2(r.pk.omc * 100)} %, MDD ≈ **${f2(r.pk.mdd)} kN/m³**. Required field value: $0.95 \\times ${f2(r.pk.mdd)} = ${f2(r.sp.gdReq)}$ kN/m³.`}</Md>
          <Frm wide={520}>
            <CompactionChart
              series={[{ pts: MP, curve, color: 'var(--c-accent)', label: 'Modified Proctor', peak: r.pk }]}
              Gs={2.7}
              unit="kN"
              field={[{ w: r.core.w, gd: r.gd, label: 'field core', pass: r.sp.okRC }]}
              spec={{ lo: 0.059, hi: 0.174, gdMin: r.sp.gdReq }}
            />
          </Frm>
          <p className="text-xs text-faint">ZAV line drawn with an assumed Gs = 2.70 (not given): {f2(zav(r.core.w, 2.7))} kN/m³ at the field water content, above the field point as it must be.</p>
          <Tex block>{`RC = \\frac{${f2(r.gd)}}{${f2(r.pk.mdd)}} = ${f2(r.sp.rc * 100)}\\ \\%`}</Tex>
          <Result>{`RC ≈ **${f2(r.sp.rc * 100)} % ≥ 95 %**: the contractor's work **satisfies** the specification, but only just (γd ${f2(r.gd)} vs ${f2(r.sp.gdReq)} kN/m³ required). The fill was placed ${f2((r.core.w - r.pk.omc) * 100)} % wet of OMC.`}</Result>
          <Tbl head={['w (%)', ...MP.map((p) => f2(p.w * 100))]} rows={[['γd (kN/m³)', ...MP.map((p) => f2(p.gd))]]} />
        </Sol>
      )
    },
    notes: ['The specification has no water-content limit; only RC is checked.'],
  },
  {
    id: 'sm-jan-2021-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 16,
    topics: ['sm-stress'],
    title: 'Stress increase with depth: square, circular and strip footings',
    text: 'Comment on the stress increase with depth for square, circular and strip footings.',
    pages: [48],
    theory: true,
    solution: () => <BulbAnswer />,
  },
  {
    id: 'sm-jan-2021-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 30.67,
    topics: ['sm-consol', 'sm-stress'],
    title: 'NC or OC from oedometer data; settlement of a 2 m circular footing (2:1)',
    text: "A circular foundation 2 m in diameter and subjected to a column load of 500 kN is placed at a depth of 1 m below the ground surface. The sub-soil consist of 2 m of fine sand (γ = 17 kN/m³, $\\gamma_{sat}$ = 19 kN/m³) below the ground surface, which is underlain by an inorganic clay layer of same thickness ($\\gamma_{sat}$ = 18 kN/m³, $e_0$ = 0.80). A dense sand layer lies below the clay layer. Groundwater table is at 0.5 m below the footing bottom. One dimensional consolidation test on an undisturbed sample from the mid-depth of the clay layer was conducted and the following data was obtained.\n\n| Pressure, kPa | 5 | 25 | 50 | 100 | 200 | 100 | 50 | 25 | 100 | 200 | 400 | 800 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n| Void ratio | 0.755 | 0.740 | 0.734 | 0.717 | 0.670 | 0.675 | 0.680 | 0.690 | 0.678 | 0.664 | 0.609 | 0.539 |\n\n(i) Schematically show the soil profile. (ii) Is the clay layer ‘NC’ or “OC’? (iii) Estimate the settlement of the foundation due to consolidation of the clay layer. (Use 2:1 dispersion method to determine the stress increase in the clay layer)",
    pages: [48],
    given: [],
    checks: () => {
      const o = oed()
      const s = settleProfile(SET3()).layers[0].subs[0]
      return [
        { key: 'p0', label: "$p'_0$ at mid-clay (3 m)", value: s.p0, unit: 'kPa' },
        { key: 'pc', label: "$p'_c$ (Casagrande)", value: o.cas.pc, unit: 'kPa', tol: 0.25, hint: 'a hand construction gives about 110–150 kPa' },
        { key: 'cs', label: '$C_s$ from the unloading branch', value: o.cs.Cs, tol: 0.05 },
        { key: 'dp', label: 'Δp at mid-clay (2:1)', value: s.dp, unit: 'kPa' },
        { key: 'S', label: 'Consolidation settlement', value: s.S * 1000, unit: 'mm', tol: 0.05 },
      ]
    },
    solution: () => {
      const o = oed()
      const inp = SET3()
      const out = settleProfile(inp)
      const s = out.layers[0].subs[0]
      return (
        <Sol>
          <Head>(i) Profile</Head>
          <Frm>
            <SoilColumn
              layers={[
                { H: 2, name: 'Fine sand', kind: 'sand', props: ['γ = 17, γsat = 19 kN/m³'] },
                { H: 2, name: 'Inorganic clay', kind: 'clay', props: ['γsat = 18 kN/m³, e0 = 0.80'] },
                { H: 1, name: 'Dense sand', kind: 'sand' },
              ]}
              wt={1.5}
              footing={{ Df: 1, B: 2, label: 'Ø 2 m, 500 kN' }}
              marks={[{ z: 3, label: 'mid-clay (sample)' }]}
            />
          </Frm>
          <Head>(ii) NC or OC?</Head>
          <Tex block>{`p'_0(3\\ \\text{m}) = 1.5(17) + 0.5(19 - 9.81) + 1.0(18 - 9.81) = ${f2(s.p0)}\\ \\text{kPa}`}</Tex>
          <Md>{`Plot e against log p. The virgin line (400 → 800 kPa) has $C_c = (0.609 - 0.539)/\\log 2 = ${f3(o.Cc)}$. Casagrande's construction (point of maximum curvature at 100 kPa, tangent, horizontal, bisector, meeting the virgin line extended back) gives $p'_c \\approx ${f2(o.cas.pc)}$ kPa; the intersection of the recompression and virgin lines gives ${f2(o.two.pc)} kPa. Either way $p'_c \\gg p'_0$ (OCR ≈ ${f2(o.cas.pc / s.p0)}): the clay is **overconsolidated**.`}</Md>
          <Frm>
            <div className="max-w-[460px] mx-auto">
              <OedFig />
            </div>
          </Frm>
          <Md>{`Swell (recompression) index from the unloading branch: $C_s = (0.690 - 0.670)/\\log(200/25) = ${f4(o.cs.Cs)}$.`}</Md>
          <Head>(iii) Settlement</Head>
          <Tex block>{`\\Delta p = \\frac{Q}{\\pi(D + z)^2/4} = \\frac{500}{\\pi(2 + 2)^2/4} = ${f2(s.dp)}\\ \\text{kPa}\\quad (z = 3 - 1 = 2\\ \\text{m below the footing})`}</Tex>
          <SettleSolution inp={inp} out={out} />
          <Frm wide={560}>
            <ProfileFig inp={inp} out={out} />
          </Frm>
          <Result>{`(ii) **OC** (pc′ ≈ ${f2(o.cas.pc)} kPa ≫ p′0 = ${f2(s.p0)} kPa). (iii) p′0 + Δp = ${f2(s.p1)} kPa stays below pc′, so only recompression ($C_s$): settlement ≈ **${f2(s.S * 1000)} mm**.`}</Result>
        </Sol>
      )
    },
    notes: ['e0 = 0.80 (given) is used in 1 + e0 although the oedometer curve reads about 0.74 near p′0; the difference changes S by under 4 %.', 'pc′ only needs to exceed p′0 + Δp ≈ 78 kPa for the answer to stand; every reasonable construction (110–150 kPa) does.'],
  },
  {
    id: 'sm-jan-2021-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 18,
    topics: ['sm-perm'],
    title: 'Laboratory methods for k: principles and applications',
    text: 'State differences in principle and applications of various methods for determination of coefficient of permeability in the laboratory.',
    pages: [49],
    theory: true,
    solution: () => <Model item={th('sm-perm', 't-lab-methods')} />,
  },
  {
    id: 'sm-jan-2021-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 28.67,
    topics: ['sm-stress'],
    title: "Osterberg's chart: unsymmetrical 5 m flood embankment, points A and B",
    text: "A flood protection embankment, 5 m high, is to be built with its cross-section as shown in Fig. 2. Determine the increase in stress at points A and B due to the embankment load. Osterberg's Chart for Influence coefficients is provided in Fig. 3.\n\n(Fig. 2: embankment soil γ = 19 kN/m³; crest 8 m; left slope 1 V : 2 H, right slope 1 V : 5 H; A is 2 m below the ground on the vertical through the left crest edge; B is 3 m below the ground on the centre line of the crest.)",
    pages: [49],
    given: [{ label: "Osterberg's chart", what: 'Fig. 3, Iz vs a/z for b/z curves', ref: 'd-osterberg' }],
    figure: () => <EmbFig e={EMB} pts={[PA, PB]} />,
    checks: () => {
      const A = OsterbergNum(PA.X, PA.z)
      const B = OsterbergNum(PB.X, PB.z)
      return [
        { key: 'q', label: 'q = γH', value: EMB.h * EMB.gamma, unit: 'kPa' },
        { key: 'IA', label: 'ΣIz at A', value: A.I, tol: 0.02 },
        { key: 'sA', label: 'σz at A', value: A.sigma, unit: 'kPa', tol: 0.03 },
        { key: 'IB', label: 'ΣIz at B', value: B.I, tol: 0.02 },
        { key: 'sB', label: 'σz at B', value: B.sigma, unit: 'kPa', tol: 0.03 },
      ]
    },
    solution: () => (
      <Sol>
        <Md>{`$q = \\gamma H = 19 \\times 5 = 95$ kPa. Horizontal slope lengths: left $a = 2 \\times 5 = 10$ m, right $a = 5 \\times 5 = 25$ m.`}</Md>
        <OsterbergSolved e={EMB} X={PA.X} z={PA.z} label="A" />
        <OsterbergSolved e={EMB} X={PB.X} z={PB.z} label="B" />
        <Result>{`σz at A ≈ **${f2(OsterbergNum(PA.X, PA.z).sigma)} kPa**; at B ≈ **${f2(OsterbergNum(PB.X, PB.z).sigma)} kPa**.`}</Result>
      </Sol>
    ),
    notes: ['For A the left block has b = 0 (A is below the crest edge): the b/z = 0 curve.', 'The drawing is not to scale; the slopes are read from the printed ratios.'],
  },
]

function OsterbergNum(X: number, z: number) {
  const r = embankmentBlocks(EMB, X, z)!
  return { I: r.I, sigma: r.sigma }
}
