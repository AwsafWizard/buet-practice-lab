// CE 341 term final 2017-18 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section B (Q5–Q8), held 1 Sep 2018, PDF pp. 42–44 (+ Figs. 2 and 3 on p. 46).
import { Md, Tex } from '../../../components/ui'
import { checkSpec, fieldTest, proctorCurve, proctorPeak, satOf, voidRatio } from '../../engine/compaction'
import { kRatio, uBy } from '../../engine/consolidation'
import { drClass, drFromE } from '../../engine/phase'
import { gsatFromGsE } from '../../engine/stresses'
import { boussinesq, KB, maxOnVertical, osterberg, type Embankment } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { CompactionChart } from '../../topics/comp/figs'
import { PeakSolution, PROCTOR_SETS } from '../../topics/comp/ProctorLab'
import { MiniChart } from '../../topics/seep/NetView'
import type { SmQ } from '../../types'
import { circleCase, CircleCaseSolution, EmbFig, f2, f3, f4, Frm, Head, Model, Models, netOf, NetFig, OsterbergSolved, Result, sciTex, Sol, SoilColumn, Tbl, th, type CircleCase } from './kit'

const P = '2017-18' as const

// ---------------------------------------------------------------- Q5(a) Standard / Modified Proctor + field tests
const SET = PROCTOR_SETS[0]
const FIELD = [
  { V: 946, Wwet: 1822, Wdry: 1703 },
  { V: 980, Wwet: 2083, Wdry: 1882 },
  { V: 957, Wwet: 1960, Wdry: 1675 },
]
const r5a = () => {
  const ps = proctorPeak(SET.std)
  const pm = proctorPeak(SET.mod!)
  const f = FIELD.map((t) => fieldTest(t))
  const spec = { mdd: pm.mdd, omc: pm.omc, rcMin: 0.95, dw: 0.02 }
  const c = f.map((x) => checkSpec(x.gd, x.w, spec))
  return { ps, pm, f, c }
}

// ---------------------------------------------------------------- Q5(b) sand above the WT
const r5b = () => {
  const gd = 18.84 / 1.15
  const e = voidRatio(gd, 2.65)
  const S = satOf(0.15, gd, 2.65)
  const Dr = drFromE(e, 0.85, 0.5)
  return { gd, e, S, Dr, gsat: gsatFromGsE(2.65, e) }
}

// ---------------------------------------------------------------- Q6(a) rigid circular block, 2:1, e–p table
const C6: CircleCase = { D: 6, q: 270, Hs: 5.5, wt: 1.5, gs: 19.2, gsSat: 20.8, Hc: 1.6, gc: 19.9, hLab: 20, t90: 120 }
const r6 = () => {
  const r = circleCase(C6)
  const Tv = (0.848 * 4.5) / r.t90one
  const U = uBy(Tv, 'approx')
  const Ux = uBy(Tv, 'exact')
  return { r, Tv, U, Ux, S45: (U / 100) * r.S }
}

// ---------------------------------------------------------------- Q7(a) dam with an upstream cut-off
const gsat7 = gsatFromGsE(2.66, 0.8)
const net7 = () => netOf('1718', { gsat: gsat7 })
const k7 = 3.6e-6

// ---------------------------------------------------------------- Q8
const r8a = () => kRatio({ eA: [0.65, 0.48], eB: [0.71, 0.59], dp: 225, dA: 3, dB: 4, tA: 1, tB: 3 })
const r8b = () => ({ s: boussinesq(50000, 7.5, 15), K: KB(0.5), m: maxOnVertical(50000, 7.5) })
const EMB8: Embankment = { c: 30, h: 1, gamma: 4, aL: 20, aR: 20 }

export const B2017: SmQ[] = [
  {
    id: 'sm-2017-18-5a',
    paper: P,
    sec: 'B',
    no: '5(a)',
    marks: 21.67,
    topics: ['sm-comp'],
    title: 'Standard and Modified Proctor curves, ZAV line; which field tests pass?',
    text: 'The data from a standard Proctor and Modified Proctor compaction test on a soil ($G_s$ = 2.64) are given as:\n\n| Standard Proctor w (%) | 9.3 | 11.8 | 14.3 | 17.6 | 20.8 | 23.0 |\n|---|---|---|---|---|---|---|\n| Dry density (t/m³) | 1.691 | 1.715 | 1.755 | 1.747 | 1.685 | 1.619 |\n\n| Modified Proctor w (%) | 9.3 | 12.8 | 15.5 | 18.7 | 21.1 |\n|---|---|---|---|---|---|\n| Dry density (t/m³) | 1.873 | 1.910 | 1.803 | 1.699 | 1.641 |\n\n(i) Plot the compaction curves along with zero air void line and find the optimum water content and the maximum dry density for each test.\n\n(ii) Compaction tests carried out at three locations in the field and the results are as follows:\n\n| Test No. | Volume of Soils (cm³) | Mass of the wet soil (gm) | Mass of dry soil (gm) |\n|---|---|---|---|\n| 1 | 946 | 1822 | 1703 |\n| 2 | 980 | 2083 | 1882 |\n| 3 | 957 | 1960 | 1675 |\n\nCompute the dry density, bulk density and water content for each test and plot the points in the above graph along with the compaction curves.\n\n(iii) The compaction specification requires that the in situ dry density be greater than or equal to 95% of the maximum dry density from modified Proctor compaction test and for the water content to be within 2% (plus or minus) of the modified Proctor optimum water content. Determine which of the three tests meet the specifications and also give reasons why the specifications were not met for the tests that failed.',
    pages: [42],
    given: [],
    checks: () => {
      const r = r5a()
      return [
        { key: 'sm', label: 'Standard Proctor MDD', value: r.ps.mdd, unit: 't/m³', tol: 0.006 },
        { key: 'so', label: 'Standard Proctor OMC', value: r.ps.omc * 100, unit: '%', tol: 0.06 },
        { key: 'mm', label: 'Modified Proctor MDD', value: r.pm.mdd, unit: 't/m³', tol: 0.006 },
        { key: 'mo', label: 'Modified Proctor OMC', value: r.pm.omc * 100, unit: '%', tol: 0.06 },
        ...r.f.flatMap((x, i) => [
          { key: `d${i + 1}`, label: `Field test ${i + 1}: dry density`, value: x.gd, unit: 't/m³' },
          { key: `w${i + 1}`, label: `Field test ${i + 1}: water content`, value: x.w * 100, unit: '%' },
        ]),
      ]
    },
    solution: () => {
      const r = r5a()
      return (
        <Sol>
          <Head>(i) Curves and peaks</Head>
          <Md>{`ZAV line: $\\rho_{zav} = G_s\\rho_w/(1 + wG_s) = 2.64/(1 + 2.64w)$ t/m³ (e.g. ${f3(2.64 / (1 + 2.64 * 0.1))} at 10 %, ${f3(2.64 / (1 + 2.64 * 0.2))} at 20 %).`}</Md>
          <PeakSolution set={SET} pts={SET.std} name="Standard Proctor" />
          <PeakSolution set={SET} pts={SET.mod!} name="Modified Proctor" />
          <Head>(ii) Field tests</Head>
          <Tbl
            head={['Test', 'ρ = W/V (t/m³)', 'w = (W − Wd)/Wd (%)', 'ρd = Wd/V (t/m³)', 'RC (% of Mod. MDD)', 'verdict']}
            rows={r.f.map((x, i) => [`${i + 1}`, f3(x.gb), f2(x.w * 100), f3(x.gd), f2(r.c[i].rc * 100), r.c[i].pass ? 'passes' : 'fails'])}
            cap="g/cm³ = t/m³."
          />
          <Frm wide={520}>
            <CompactionChart
              series={[
                { pts: SET.std, curve: proctorCurve(SET.std), color: 'var(--c-accent)', label: 'Standard', peak: r.ps },
                { pts: SET.mod!, curve: proctorCurve(SET.mod!), color: 'var(--c-load)', label: 'Modified', peak: r.pm },
              ]}
              Gs={2.64}
              unit="t"
              field={r.f.map((x, i) => ({ w: x.w, gd: x.gd, label: `${i + 1}`, pass: r.c[i].pass }))}
              spec={{ lo: r.c[0].lo, hi: r.c[0].hi, gdMin: r.c[0].gdReq }}
            />
          </Frm>
          <Head>(iii) Specification</Head>
          <Md>{`Required: $\\rho_d \\ge 0.95 \\times ${f3(r.pm.mdd)} = ${f3(r.c[0].gdReq)}$ t/m³ and $w = ${f2(r.pm.omc * 100)} \\pm 2$ % → ${f2(r.c[0].lo * 100)}–${f2(r.c[0].hi * 100)} %.`}</Md>
          <ul className="list-disc pl-5 text-sm">
            {r.c.map((c, i) => (
              <li key={i}>
                <b>Test {i + 1}</b>: {c.pass ? `meets both (RC ${f2(c.rc * 100)} %, w ${f2(r.f[i].w * 100)} % inside the window).` : `fails — ${c.why.join('; ')}.`}
              </li>
            ))}
          </ul>
          <Result>{`Standard: MDD ≈ ${f3(r.ps.mdd)} t/m³ at OMC ≈ ${f2(r.ps.omc * 100)} %; Modified: MDD ≈ ${f3(r.pm.mdd)} t/m³ at OMC ≈ ${f2(r.pm.omc * 100)} %. **Only test 2 meets the specification**; test 1 is too dry (and under-compacted), test 3 is too wet (and under-compacted).`}</Result>
        </Sol>
      )
    },
    notes: ['Peaks are found with a parabola through the highest point and its neighbours; a hand-drawn curve reads within about ±0.01 t/m³ and ±0.5 %.'],
  },
  {
    id: 'sm-2017-18-5b',
    paper: P,
    sec: 'B',
    no: '5(b)',
    marks: 15,
    topics: ['sm-wv'],
    title: 'S, Dr and saturated density of a sand (w = 15 %, γ = 18.84 kN/m³)',
    text: 'A sample of sand above water table was found out to have a moisture content of 15% and a unit weight of 18.84 kN/m³. Laboratory test on a dry sample indicated values $e_{min}$ = 0.50 and $e_{max}$ = 0.85 for the densest and loosest states respectively. Compute the degree of saturation and the relative density. Assume $G_s$ = 2.65. What will be the saturated density of sand in the field?',
    pages: [42],
    given: [],
    checks: () => {
      const r = r5b()
      return [
        { key: 'e', label: 'Void ratio', value: r.e },
        { key: 'S', label: 'Degree of saturation', value: r.S * 100, unit: '%' },
        { key: 'Dr', label: 'Relative density', value: r.Dr * 100, unit: '%' },
        { key: 'gsat', label: 'Saturated unit weight', value: r.gsat, unit: 'kN/m³' },
      ]
    },
    solution: () => {
      const r = r5b()
      return (
        <Sol>
          <Tex block>{`\\gamma_d = \\frac{\\gamma}{1 + w} = \\frac{18.84}{1.15} = ${f2(r.gd)}\\ \\text{kN/m}^3,\\qquad e = \\frac{G_s\\gamma_w}{\\gamma_d} - 1 = \\frac{2.65 \\times 9.81}{${f2(r.gd)}} - 1 = ${f3(r.e)}`}</Tex>
          <Tex block>{`S = \\frac{wG_s}{e} = \\frac{0.15 \\times 2.65}{${f3(r.e)}} = ${f2(r.S * 100)}\\ \\%,\\qquad D_r = \\frac{e_{max} - e}{e_{max} - e_{min}} = \\frac{0.85 - ${f3(r.e)}}{0.85 - 0.50} = ${f2(r.Dr * 100)}\\ \\%`}</Tex>
          <Tex block>{`\\gamma_{sat} = \\frac{(G_s + e)\\gamma_w}{1 + e} = \\frac{(2.65 + ${f3(r.e)})9.81}{${f3(1 + r.e)}} = ${f2(r.gsat)}\\ \\text{kN/m}^3\\ (\\rho_{sat} = ${f3(r.gsat / GW)}\\ \\text{t/m}^3)`}</Tex>
          <Result>{`S ≈ **${f2(r.S * 100)} %**; Dr ≈ **${f2(r.Dr * 100)} %** (${drClass(r.Dr * 100).toLowerCase()}); saturated unit weight ≈ **${f2(r.gsat)} kN/m³** (density ${f3(r.gsat / GW)} t/m³), e unchanged when the sand below the WT fills with water.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2017-18-5c',
    paper: P,
    sec: 'B',
    no: '5(c)',
    marks: 10,
    topics: ['sm-comp'],
    title: 'Two ways of specifying compaction of earthworks',
    text: 'There are two ways of specifying compaction of earthworks — Explain.',
    pages: [42],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-spec')} />,
  },
  {
    id: 'sm-2017-18-6a',
    paper: P,
    sec: 'B',
    no: '6(a)',
    marks: 26.67,
    topics: ['sm-consol', 'sm-stress'],
    title: 'Rigid 6 m circular block on 5.5 m sand over 1.6 m clay: settlement, t90, S at 4.5 years',
    text: 'A rigid foundation block, circular in plan, 6.0 m diameter rests on a sand bed of 5.5 m thick. Below the sand, there is a 1.6 m of clay layer overlaying impervious rock. Ground water table is 1.5 m below the ground surface. The densities of sand above the and below the water table are 19.2 and 20.8 kN/m³ respectively. The saturated density of clay is given as 19.9 kN/m³. Draw the schematic diagram of the problem. A consolidation test performed on an undisturbed sample of the clay 20 mm thick and drained at the top and bottom gave the following results:\n\n| Pressure (kN/m²) | 50 | 100 | 200 | 300 | 400 |\n|---|---|---|---|---|---|\n| Void Ratio | 0.73 | 0.68 | 0.625 | 0.58 | 0.54 |\n\nIf the foundation block is subjected to a uniform pressure of 270 kN/m²,\n\n(i) Estimate the settlement of the foundation assuming the load spread is 1 horizontal to 2 vertical.\n(ii) If the consolidation test sample reached 90% consolidation in two hours, how long it will take the foundation to reach 90% of its final settlement?\n(iii) Calculate the magnitude of foundation settlement after 4.5 years.',
    pages: [43],
    given: [],
    checks: () => {
      const { r, S45 } = r6()
      return [
        { key: 'dp', label: 'Δp at mid-clay', value: r.dp, unit: 'kPa' },
        { key: 'p0', label: "$p'_0$ at mid-clay", value: r.p0, unit: 'kPa' },
        { key: 'S', label: '(i) Settlement', value: r.S * 1000, unit: 'mm', tol: 0.03 },
        { key: 't', label: '(ii) Time for 90 %', value: r.t90one, unit: 'years' },
        { key: 'S45', label: '(iii) Settlement after 4.5 years', value: S45 * 1000, unit: 'mm', tol: 0.03 },
      ]
    },
    solution: () => {
      const { r, Tv, U, Ux, S45 } = r6()
      return (
        <Sol>
          <Frm>
            <SoilColumn
              layers={[
                { H: 5.5, name: 'Compact sand', kind: 'sand', props: ['19.2 kN/m³ above WT', '20.8 kN/m³ below WT'] },
                { H: 1.6, name: 'Clay', kind: 'clay', props: ['γsat = 19.9 kN/m³'] },
                { H: 0.8, name: 'Impervious rock', kind: 'rock' },
              ]}
              wt={1.5}
              footing={{ Df: 0, B: 6, label: 'Ø 6 m, 270 kN/m²' }}
              marks={[{ z: 6.3, label: 'mid-clay' }]}
            />
          </Frm>
          <CircleCaseSolution c={C6} />
          <Head>(iii) After 4.5 years</Head>
          <Tex block>{`T_v = 0.848 \\times \\frac{4.5}{${f2(r.t90one)}} = ${f3(Tv)} \\Rightarrow U = 100 - 10^{(1.781 - ${f3(Tv)})/0.933} = ${f2(U)}\\ \\%`}</Tex>
          <Tex block>{`S_{4.5} = US = ${f3(U / 100)} \\times ${f2(r.S * 1000)} = ${f2(S45 * 1000)}\\ \\text{mm}`}</Tex>
          <Result>{`(i) S ≈ **${f2(r.S * 1000)} mm**; (ii) t90 ≈ **${f2(r.t90one)} years**; (iii) after 4.5 years ≈ **${f2(S45 * 1000)} mm** (U ≈ ${f2(U)} %; the exact series gives ${f2(Ux)} %).`}</Result>
        </Sol>
      )
    },
    notes: ['"1 horizontal to 2 vertical" is the 2:1 method: diameter D + z at depth z.', 'The block rests on the ground surface (no embedment given).'],
  },
  {
    id: 'sm-2017-18-6b',
    paper: P,
    sec: 'B',
    no: '6(b)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Field e–log p curve for OC clays: step-by-step',
    text: 'Write down the step by step procedure for constructing field **e vs. log (p)** curve for OC clays.',
    pages: [43],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-fieldoc')} />,
  },
  {
    id: 'sm-2017-18-6c',
    paper: P,
    sec: 'B',
    no: '6(c)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Short notes: mv; secondary consolidation',
    text: 'Write short notes on (i) coefficient of volume compressibility, and (ii) secondary consolidation.',
    pages: [43],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: '(i) Coefficient of volume compressibility (with Cc, cv, Cs)', item: th('sm-consol', 't-cv') },
          { title: '(ii) Secondary consolidation', item: th('sm-consol', 't-secondary') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2017-18-7a',
    paper: P,
    sec: 'B',
    no: '7(a)',
    marks: 26.67,
    topics: ['sm-seep'],
    title: 'Concrete dam with a 2 m cut-off: seepage per day, FS against piping, uplift diagram',
    text: 'Seepage takes place beneath the concrete dam with vertical cut off (2 m length) is shown in Fig. 2. The permeability of the fine, silty sand beneath the dam is 3.6 × 10⁻⁴ cm/sec. Find the following:\n\n(i) The seepage loss in m³/day per meter run;\n(ii) The safety factor with respect to piping/heaving, assuming the void ratio is 0.8 and the specific gravity of soil grains is 2.66; and\n(iii) Uplift pressure diagram at the bottom of the dam.\n\n(Fig. 2, scale bar 0–5 m: headwater 4.5 m above the upstream bed; dam base 8.5 m wide, 1.0 m below the upstream bed; cut-off 2.0 m below the heel; downstream bed 2.0 m above the base with tail water 0.5 m above it; impervious stratum about 5 m below the base.)',
    pages: [43, 46],
    given: [],
    figure: () => <NetFig c={net7()} Nf={3} />,
    checks: () => {
      const c = net7()
      const up = c.R.up!
      return [
        { key: 'H', label: 'Head lost H', value: c.sol.H, unit: 'm' },
        { key: 'q', label: '(i) Seepage per metre run', value: k7 * c.sol.H * c.sol.shape * 86400, unit: 'm³/day', tol: 0.1 },
        { key: 'icr', label: '$i_{cr} = (G_s - 1)/(1 + e)$', value: c.R.icr },
        { key: 'fs', label: '(ii) FS against piping', value: c.R.icr / c.R.ie, tol: 0.25 },
        { key: 'uh', label: '(iii) Uplift at the heel', value: up.heel, unit: 'kPa', tol: 0.05 },
        { key: 'ut', label: '(iii) Uplift at the toe', value: up.toe, unit: 'kPa', tol: 0.05 },
        { key: 'U', label: '(iii) Total uplift force', value: up.U, unit: 'kN/m', tol: 0.06 },
      ]
    },
    solution: () => {
      const c = net7()
      const up = c.R.up!
      const q = k7 * c.sol.H * c.sol.shape
      return (
        <Sol>
          <Md>{`Datum at the dam base: headwater 1.0 + 4.5 = 5.5 m, tail water 2.0 + 0.5 = 2.5 m → $H = ${f2(c.sol.H)}$ m.`}</Md>
          <Md>{`**Net (Fig. 2).** The printed net has 3 flow channels and about 10–11 drops. The solver's square net: $N_f/N_d = ${f3(c.sol.shape)}$, i.e. 3 channels need ${f2(c.R.Nd)} drops; $\\Delta h = ${f2(c.sol.H)}/${f2(c.R.Nd)} = ${f3(c.R.dh)}$ m.`}</Md>
          <NetFig c={c} Nf={3} exit />
          <Head>(i) Seepage</Head>
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 3.6\\times10^{-6} \\times ${f2(c.sol.H)} \\times ${f3(c.sol.shape)} = ${sciTex(q, 3)}\\ \\text{m}^3\\text{/s} = ${f3(q * 86400)}\\ \\text{m}^3\\text{/day per m}`}</Tex>
          <Head>(ii) Piping / heave</Head>
          <Tex block>{`i_{cr} = \\frac{G_s - 1}{1 + e} = \\frac{1.66}{1.8} = ${f3(c.R.icr)}`}</Tex>
          <Md>{`The water exits up through the downstream bed next to the toe, after climbing the 2 m embedded face. Last field there: $l ≈ ${f2(c.R.exitL)}$ m, $i_e = \\Delta h/l = ${f3(c.R.ie)}$:`}</Md>
          <Tex block>{`FS = \\frac{i_{cr}}{i_e} = \\frac{${f3(c.R.icr)}}{${f3(c.R.ie)}} = ${f2(c.R.icr / c.R.ie)}`}</Tex>
          <Head>(iii) Uplift</Head>
          <Md>{`Pressure head under the base = total head − 0 (datum at the base); $u = (\\text{pressure head})\\gamma_w$:`}</Md>
          <Tbl head={['x from heel (m)', 'pressure head (m)', 'u (kPa)']} rows={up.pts.filter((_, i, a) => i === 0 || i === a.length - 1 || i % Math.max(1, Math.round(a.length / 6)) === 0).map((p) => [f2(p.x), f2(p.p), f2(p.u)])} />
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <MiniChart pts={up.pts.map((p) => ({ x: p.x, y: p.u }))} xLabel="distance from heel (m)" yLabel="u (kPa)" invert fill="var(--c-water)" />
          </div>
          <Result>{`(i) q ≈ **${f3(q * 86400)} m³/day per m**; (ii) FS ≈ **${f2(c.R.icr / c.R.ie)}** (icr ${f3(c.R.icr)}) — safe; (iii) uplift falls almost linearly from **${f2(up.heel)} kPa** at the heel to **${f2(up.toe)} kPa** at the toe, total ≈ **${f2(up.U)} kN per m**, acting ${f2(up.xbar)} m from the heel. The cut-off uses about ${f2(c.sol.g.hU - (up.heel / GW + (c.sol.iz.zB * c.sol.dz)))} m of head before the heel.`}</Result>
        </Sol>
      )
    },
    notes: ['The impervious depth (≈ 5 m below the base) and the dam outline are scaled from the 0–5 m bar; everything else is printed.', 'The handnote reads ie ≈ 0.17–0.23 (FS ≈ 4) from a coarser field; the verdict is the same.'],
  },
  {
    id: 'sm-2017-18-7b',
    paper: P,
    sec: 'B',
    no: '7(b)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Mechanism of piping; increasing the FS',
    text: 'Describe the mechanism of piping. How the factor of safety against piping can be increased for a hydraulic structure?',
    pages: [43],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-piping')} />,
  },
  {
    id: 'sm-2017-18-7c',
    paper: P,
    sec: 'B',
    no: '7(c)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Filters: why, design, graded filter',
    text: 'Why a filter is used on the downstream side an earth dam/embankment? How would you design a filter? What is graded filter?',
    pages: [43],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-filter')} />,
  },
  {
    id: 'sm-2017-18-8a',
    paper: P,
    sec: 'B',
    no: '8(a)',
    marks: 15,
    topics: ['sm-consol'],
    title: 'Ratio of permeabilities of two clay samples from mv and cv',
    text: 'Two clay samples A and B of thickness 3 cm and 4 cm have final voids ratios of 0.65 and 0.71, respectively, under a pressure of 225 kN/m². If the final void ratios of the same two soil samples are reduced to 0.48 and 0.59 respectively when the pressure is increased to 450 kN/m².\n\nFind the ratio of the coefficient of permeability of the two specimens. Given that the time required by the specimen A to reach 50% degree of consolidation is one third of that required by the specimen B for reaching 50% degree of consolidation.',
    pages: [44],
    given: [],
    checks: () => {
      const r = r8a()
      return [
        { key: 'mvA', label: '$m_{vA}$', value: r.mvA * 1e4, unit: '× 10⁻⁴ m²/kN' },
        { key: 'mvB', label: '$m_{vB}$', value: r.mvB * 1e4, unit: '× 10⁻⁴ m²/kN' },
        { key: 'cv', label: '$c_{vA}/c_{vB}$', value: r.cvRatio },
        { key: 'k', label: '$k_A/k_B$', value: r.kRatio },
      ]
    },
    solution: () => {
      const r = r8a()
      return (
        <Sol>
          <Tex block>{`m_v = \\frac{\\Delta e}{(1 + e_1)\\Delta p}:\\quad m_{vA} = \\frac{0.65 - 0.48}{1.65 \\times 225} = ${sciTex(r.mvA, 3)},\\quad m_{vB} = \\frac{0.71 - 0.59}{1.71 \\times 225} = ${sciTex(r.mvB, 3)}\\ \\text{m}^2\\text{/kN}`}</Tex>
          <Md>{`Same U (50 %) → same $T_v = c_vt/d^2$, so $c_v \\propto d^2/t$. Both specimens tested the same way (same drainage), $d \\propto$ thickness, and $t_A = t_B/3$:`}</Md>
          <Tex block>{`\\frac{c_{vA}}{c_{vB}} = \\left(\\frac{3}{4}\\right)^2\\frac{t_B}{t_A} = 0.5625 \\times 3 = ${f4(r.cvRatio)}`}</Tex>
          <Tex block>{`k = c_vm_v\\gamma_w \\Rightarrow \\frac{k_A}{k_B} = \\frac{c_{vA}}{c_{vB}}\\cdot\\frac{m_{vA}}{m_{vB}} = ${f4(r.cvRatio)} \\times ${f4(r.mvRatio)} = ${f3(r.kRatio)}`}</Tex>
          <Result>{`$k_A/k_B$ ≈ **${f2(r.kRatio)}** (A is about ${f2(r.kRatio)} times as permeable as B).`}</Result>
        </Sol>
      )
    },
    notes: ['Both samples are taken to have the same drainage condition in the oedometer (thickness ratio = drainage-path ratio).'],
  },
  {
    id: 'sm-2017-18-8b',
    paper: P,
    sec: 'B',
    no: '8(b)',
    marks: 16,
    topics: ['sm-stress'],
    title: 'Point load 50,000 kN: σz at (7.5 m, 15 m) and the maximum at r = 7.5 m',
    text: 'A point load of 50,000 kN is applied at the ground surface. Calculate vertical stress 7.5 m away horizontally and 15 m below the ground level. Also calculate the maximum vertical stress below the ground surface at a point 7.5 m laterally from the point of application of the load 50,000 kN.',
    pages: [44],
    given: [],
    checks: () => {
      const r = r8b()
      return [
        { key: 's', label: 'σz at r = 7.5 m, z = 15 m', value: r.s, unit: 'kPa' },
        { key: 'z', label: 'Depth of the maximum on r = 7.5 m', value: r.m.z, unit: 'm' },
        { key: 'm', label: 'Maximum σz on r = 7.5 m', value: r.m.sigma, unit: 'kPa' },
      ]
    },
    solution: () => {
      const r = r8b()
      return (
        <Sol>
          <Tex block>{`\\frac{r}{z} = \\frac{7.5}{15} = 0.5,\\quad K_B = \\frac{3}{2\\pi}\\frac{1}{(1 + 0.5^2)^{5/2}} = ${f4(r.K)},\\quad \\sigma_z = K_B\\frac{Q}{z^2} = ${f4(r.K)} \\times \\frac{50000}{15^2} = ${f2(r.s)}\\ \\text{kPa}`}</Tex>
          <Md>{`**Maximum on the vertical r = 7.5 m.** Write $\\sigma_z = \\frac{3Q}{2\\pi}\\frac{z^3}{(r^2 + z^2)^{5/2}}$ and set $d\\sigma_z/dz = 0$: $3z^2(r^2 + z^2) - 5z^4 = 0$ → $r/z = \\sqrt{2/3} = 0.8165$ (the line at ${f2(r.m.beta)}° from the load axis).`}</Md>
          <Tex block>{`z = \\frac{7.5}{0.8165} = ${f2(r.m.z)}\\ \\text{m},\\quad \\sigma_{z,max} = 0.0888\\frac{Q}{r^2} = 0.0888 \\times \\frac{50000}{7.5^2} = ${f2(r.m.sigma)}\\ \\text{kPa}`}</Tex>
          <Result>{`σz at (7.5 m, 15 m) ≈ **${f2(r.s)} kPa**; maximum on that vertical ≈ **${f2(r.m.sigma)} kPa** at z ≈ ${f2(r.m.z)} m.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2017-18-8c',
    paper: P,
    sec: 'B',
    no: '8(c)',
    marks: 15.67,
    topics: ['sm-stress'],
    title: 'Embankment (4 ksf, feet): σz 21 ft below the centre line',
    text: 'Calculate the magnitude of vertical pressure at A which is 21 feet below the ground level due to an embankment loading as shown in Fig. 3.\n\n(Fig. 3: symmetric embankment, crest 30 ft (15 ft + 15 ft about the centre line), each slope 20 ft horizontal, load 4 ksf on the crest; A on the centre line. All dimensions in feet.)',
    pages: [44, 46],
    given: [],
    figure: () => <EmbFig e={EMB8} pts={[{ X: 35, z: 21, label: 'A' }]} unit="ft" qLabel="q = 4 ksf" />,
    checks: () => [{ key: 's', label: 'σz at A', value: 2 * 4 * oster(), unit: 'ksf', tol: 0.03 }],
    solution: () => (
      <Sol>
        <Md>{`Symmetric about the centre line: each half is an Osterberg block with $a = 20$ ft, $b = 15$ ft, $z = 21$ ft, $q = 4$ ksf (work in feet and ksf).`}</Md>
        <OsterbergSolved e={EMB8} X={35} z={21} label="A" unit="ft" qUnit="ksf" />
        <Result>{`σz at A ≈ **${f2(2 * 4 * oster())} ksf** (≈ ${f2(2 * 4 * oster() * 47.88)} kPa).`}</Result>
      </Sol>
    ),
    notes: ['The embankment height is not drawn; only q = 4 ksf on the crest is needed. The figure\'s "4 ksf/per feet" means 4 ksf.'],
  },
]

function oster() {
  return osterberg(20, 15, 21)
}
