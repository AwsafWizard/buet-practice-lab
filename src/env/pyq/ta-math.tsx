// Number-type parts from Tanvir sir's block: worked solutions computed by ../engine (see docs/CE331_AUTHORING.md).
// Method sources: CE22 slides T01–T10 + the class notes' worked examples (Type I strips, Type II ΔR·Z/Z0, split treatment, ion exchange).
// Langelier/Ryznar and the pH of CO2 water are not in this term's slides: those parts are `textbook`.
import type { ReactNode } from 'react'
import { Md } from '../../components/ui'
import { IsoChartFig } from '../figs/sed-iso'
import { BarDiagram, SplitFlow } from '../figs/soft-bars'
import { alkalinityFromBicarbonate, hardness, henryWithAir, langelier, phOfCo2Water, toCaCO3 } from '../engine/chem'
import { alkConsumed } from '../engine/coag'
import { fixedBed, homeSoftener } from '../engine/ix'
import { CHART_2017, CHART_2021, CHART_2324, isoFromCurves, minTimeForRemoval, typeIColumn, type IsoChart, type IsoResult, type TypeI } from '../engine/settle'
import { bars, bypassForHardness, masses, slideExcess, splitAt, splitTreatment, treat, waterFromIons, type Split, type Treat, type Water } from '../engine/soften'
import type { EvPartMap } from '../types'

const tx = String.raw
const g = (v: number, p = 4) => String(+v.toPrecision(p))
const f = (v: number, d = 1) => v.toFixed(d)

function Sheet({ children, final }: { children: ReactNode; final: string }) {
  return (
    <div className="space-y-3">
      {children}
      <div className="rounded-lg border border-accent/60 bg-accent/10 px-3 py-2 font-semibold text-sm">Answer: {final}</div>
    </div>
  )
}
const Doc = ({ md }: { md: string }) => <Md className="text-sm">{md}</Md>
const Fig = ({ children, cap }: { children: ReactNode; cap?: string }) => (
  <div className="rounded-xl border border-line bg-panel2/40 p-2">
    {children}
    {cap && <div className="text-xs text-faint mt-1">{cap}</div>}
  </div>
)

// ================================================================ shared markdown blocks
/** Type I: the table, x0 and the strips */
function typeIMd(r: TypeI, H: number, C0: number, unit = 'm/min', dgt = 4) {
  const rows = r.rows
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((q) => `| ${q.t} | ${q.C} | ${f(q.x, 3)} | ${g(q.v, 4)} |`)
    .join('\n')
  const s = r.strips
  const hi = r.rows.slice().sort((a, b) => a.x - b.x).find((q) => q.v >= r.v0)
  const lo = r.rows.slice().sort((a, b) => b.x - a.x).find((q) => q.v < r.v0)
  const interp = hi && lo ? tx`$x_0 = ${f(lo.x, 3)} + \dfrac{${g(r.v0, 4)}-${g(lo.v, 4)}}{${g(hi.v, 4)}-${g(lo.v, 4)}}(${f(hi.x, 3)}-${f(lo.x, 3)}) = ${f(r.x0, 3)}$` : tx`$x_0 = ${f(r.x0, 3)}$`
  return [
    `| t (min) | C (mg/L) | x = C/C₀ | v = H/t (${unit}) |\n|---|---|---|---|\n${rows}`,
    tx`$C_0=${C0}$ mg/L, $H=${H}$ m. $x$ is the fraction of particles that settle **slower** than $v$ (still in suspension at that time).`,
    tx`**Overflow rate** $v_0 = ${g(r.v0, 4)}$ ${unit}. Read $x_0$ at $v=v_0$ by interpolation: ${interp} — so a fraction $1-x_0 = ${f(r.full, 3)}$ settles faster than $v_0$ and is removed completely.`,
    `**Partial removal**: particles slower than $v_0$ are removed in the ratio $v/v_0$. $\\dfrac{1}{v_0}\\int_0^{x_0}v\\,dx$ by strips (Δx × mean v):\n\n| strip | Δx | mean v (${unit}) | Δx·v |\n|---|---|---|---|\n${s.map((q, i) => `| ${i + 1} | ${f(q.dx, 3)} | ${g(q.vMean, dgt)} | ${g(q.area, 3)} |`).join('\n')}\n| Σ | ${f(r.x0, 3)} | | **${g(r.sum, 4)}** |`,
    tx`$R=(1-x_0)+\dfrac{1}{v_0}\sum \Delta x\,\bar v = ${f(r.full, 3)} + \dfrac{${g(r.sum, 4)}}{${g(r.v0, 4)}} = ${f(r.full, 3)}+${f(r.partial, 3)} =$ **${f(r.R * 100, 1)} %**`,
  ].join('\n\n')
}

/** Type II: the strip table and R */
function isoMd(r: IsoResult, labelOf?: (i: number) => string) {
  const rows = r.strips
    .map((s, i) => `| ${labelOf ? labelOf(i) : `${+s.r1.toFixed(1)}–${+s.r2.toFixed(1)} %`} | ${f(s.dr, 1)} | ${f(s.z1, 2)} | ${f(s.z2, 2)} | ${f(s.zMid, 2)} | ${f(s.area, 1)} |`)
    .join('\n')
  return [
    `Depth of every iso-removal curve where the line $t_0=${+r.t0.toFixed(1)}$ min cuts it, then the strips between curves. $r_0$ = the curve that reaches the bottom (${r.H} m) by $t_0$ = **${+r.r0.toFixed(1)} %**:`,
    `| strip | ΔR (%) | depth top (m) | depth bottom (m) | Zᵢ = mean depth (m) | ΔR·Zᵢ |\n|---|---|---|---|---|---|\n${rows}\n| Σ | | | | | **${f(r.sum, 1)}** |`,
    tx`$R=r_0+\dfrac{\sum \Delta R\,Z_i}{Z_0} = ${+r.r0.toFixed(1)}+\dfrac{${f(r.sum, 1)}}{${r.H}} = ${+r.r0.toFixed(1)}+${f(r.partial, 1)} =$ **${f(r.R, 1)} %**`,
  ].join('\n\n')
}

/** composition table, ions → mg/L as CaCO3 */
function convMd(rows: { name: string; mgL: number; ion: Parameters<typeof toCaCO3>[0]; fac: number }[]) {
  return `| Constituent | mg/L | × factor (50/eq. wt) | mg/L as CaCO₃ |\n|---|---|---|---|\n${rows.map((r) => `| ${r.name} | ${g(r.mgL, 4)} | ${r.fac} | ${f(toCaCO3(r.ion, r.mgL), 1)} |`).join('\n')}`
}
const FAC = { ca: 2.5, mg: 4.12, na: 2.174, cl: 1.41, so4: 1.042, co2: 2.27, hco3: 0.82 }

function hardMd(w: Water) {
  const h = hardness(w)
  return [
    tx`$TH = Ca + Mg = ${f(w.ca)}+${f(w.mg)} = ${f(h.th)}$; alkalinity $= ${f(w.alk)}$ → ${h.th > w.alk ? tx`$CH=${f(h.ch)}$, $NCH = TH-\text{alk} = ${f(h.nch)}$ (Ca part ${f(h.caNch)}, Mg part ${f(h.mgNch)})` : tx`TH ≤ alkalinity: all hardness is carbonate (CH = ${f(h.th)}, NCH = 0)`}`,
  ].join('\n')
}

// ================================================================ 2012-13 Q1(c) Langelier / Ryznar
const L1213 = langelier({ pH: 8.0, pK2minusPKs: 2.54, caMgL: 60, alkCaCO3: 91 })
const final1213 = `pHs = ${f(L1213.pHs, 2)}; LSI = ${f(L1213.lsi, 2)} (${L1213.lsiVerdict}); RSI = ${f(L1213.rsi, 2)} (${L1213.rsiVerdict})`
const Sol1213 = () => (
  <Sheet final={final1213}>
    <Doc
      md={[
        '### Given',
        'pH = 8.0; pK₂ − pKₛ = 2.54; Ca²⁺ = 60 mg/L; alkalinity = 91 mg/L as CaCO₃ (all HCO₃⁻).',
        '### Steps',
        tx`1. $pCa = -\log[Ca^{2+}]$, with $[Ca^{2+}] = 60/40.08/1000 = ${g(60 / 40.08 / 1000, 4)}$ mol/L → $pCa = ${f(L1213.pCa, 3)}$`,
        tx`2. $pAlk = -\log(\text{eq/L})$, with $91/50/1000 = ${g(91 / 50 / 1000, 4)}$ eq/L → $pAlk = ${f(L1213.pAlk, 3)}$`,
        tx`3. $pH_s = (pK_2-pK_s)+pCa+pAlk = 2.54+${f(L1213.pCa, 3)}+${f(L1213.pAlk, 3)} = ${f(L1213.pHs, 3)}$`,
        tx`4. Langelier index $LSI = pH-pH_s = 8.0-${f(L1213.pHs, 3)} =$ **${f(L1213.lsi, 2)}**`,
        tx`5. Ryznar index $RSI = 2\,pH_s-pH = 2(${f(L1213.pHs, 3)})-8.0 =$ **${f(L1213.rsi, 2)}**`,
        '### Conclusion',
        `LSI is slightly negative (${f(L1213.lsi, 2)}, within about ±0.1 of zero): the water is just undersaturated, essentially at equilibrium with a tendency to **corrode** rather than scale. RSI = ${f(L1213.rsi, 2)} lies in the 7.5–8.5 band (above 7: corrosive), which says the same: **corrosive** (mild), no scaling.`,
      ].join('\n\n')}
    />
  </Sheet>
)

// ================================================================ Type II charts
function ChartSol({ chart, H, times, curves, intro, note }: { chart: IsoChart; H: number; times: number[]; curves?: IsoChart['curves']; intro: string; note?: string }) {
  const cs = curves ?? chart.curves
  return (
    <div className="space-y-3">
      <Doc md={intro} />
      {times.map((t) => {
        const r = isoFromCurves(cs, H, t)
        return (
          <div key={t} className="space-y-2">
            <Doc md={`### Detention time ${t} min\n\n` + isoMd(r)} />
            <Fig cap={`Worked chart for t₀ = ${t} min: the shaded bands are the strips, ΔR written beside the mean depth of each. Attach this with the script.`}>
              <IsoChartFig H={H} tMax={chart.tMax} curves={cs} t0={t} res={r} />
            </Fig>
          </div>
        )
      })}
      {note && <Doc md={note} />}
    </div>
  )
}

// ---- 2017-18 Q3(b)
const r1718a = isoFromCurves(CHART_2017.curves, 3, 90)
const r1718b = isoFromCurves(CHART_2017.curves, 3, 180)
const final1718 = `t = 90 min: R ≈ ${f(r1718a.R, 0)} % (r0 = ${r1718a.r0} %); t = 180 min: R ≈ ${f(r1718b.R, 0)} % (r0 = ${r1718b.r0} %)`
const Sol1718 = () => (
  <Sheet final={final1718}>
    <ChartSol
      chart={CHART_2017}
      H={3}
      times={[90, 180]}
      intro={[
        '### Given',
        'Flocculent (Type II) suspension, $C_0 = 300$ mg/L, column and basin depth $Z_0 = 3$ m. Iso-removal lines 40, 45, 50, 60, 70, 80, 90 % from Figure 1. Draw a vertical line at the detention time; $r_0$ is the curve that just reaches the bottom; each strip between two curves removes a fraction $\\Delta R\\cdot Z_i/Z_0$ (Z measured down from the surface to the middle of the strip).',
        '### Steps (curves read off the figure; reading error about ±0.1 m)',
      ].join('\n\n')}
      note={`Check against the printed grid: at 3.0 m the figure reads 45 % at 90 min and 70 % at 180 min, exactly the $r_0$ used. The extra 20 % of the water above the top (90 %) curve is credited with the strip from that curve to the surface (the curve is taken to 100 % at the surface), as in the class example.`}
    />
  </Sheet>
)

// ---- 2020-21 Q5(a)
const r2021 = isoFromCurves(CHART_2021.curves, 3, 20)
const final2021 = `R ≈ ${f(r2021.R, 0)} % (r0 = ${r2021.r0} % + ${f(r2021.partial, 1)} % from the strips)`
const Sol2021 = () => (
  <Sheet final={final2021}>
    <ChartSol chart={CHART_2021} H={3} times={[20]} intro={'### Given\n\nBasin depth $Z_0 = 3$ m, detention time $t_0 = 20$ min; iso-removal lines 10 to 60 % in the figure. The 20 % curve meets the bottom exactly at 20 min, so $r_0 = 20$ %.\n\n### Steps (readings by eye, ±0.1 m)'} note="The 60 % curve is the last one drawn; the strip above it (60 % to 100 %) is taken to the surface, mean depth half of its 0.38 m." />
  </Sheet>
)

// ---- 2021-22 Q2(b): the same drawing as 2023-24, no values printed; the bottom edge read as the 3 m floor
const chart2122: IsoChart = { ...CHART_2324, id: '2021-22-2b', H: 3, curves: CHART_2324.curves.map((c) => ({ r: c.r, pts: c.pts.map(([t, z]) => [t, (z * 3) / 2.5] as [number, number]) })) }
const r2122a = isoFromCurves(chart2122.curves, 3, 60)
const r2122b = isoFromCurves(chart2122.curves, 3, 105)
const final2122 = `t = 60 min: R ≈ ${f(r2122a.R, 0)} %; t = 105 min: R ≈ ${f(r2122b.R, 0)} %`
const Sol2122 = () => (
  <Sheet final={final2122}>
    <ChartSol
      chart={chart2122}
      H={3}
      times={[60, 105]}
      intro={'### Given\n\n$C_0 = 250$ mg/L, column depth 3 m. The figure prints no removal values: the curves are labelled 30–80 % and are read where they cut the detention-time line. The bottom edge of the chart is taken as the 3 m floor of the basin (depths are fractions of the chart height × 3 m).\n\n### Steps'}
      note="Reading of an unlabelled chart, so the answers carry about ±2 %. At 60 min the 40 % curve is just reaching the floor, so $r_0 = 30$ % with a thin strip up to the 40 % curve."
    />
  </Sheet>
)

// ---- 2023-24 Q1(c)
const R2324 = (t: number) => isoFromCurves(CHART_2324.curves, 2.5, t)
const tStar = minTimeForRemoval((t) => R2324(t).R, 85, 600) ?? NaN
const r2324 = R2324(tStar)
const final2324 = `t ≈ ${f(tStar, 0)} min (≈ ${f(tStar / 60, 1)} h) for 85 % at 2.5 m (80 % curve extended beyond the figure: estimate)`
const Sol2324 = () => (
  <Sheet final={final2324}>
    <div className="space-y-3">
      <Doc
        md={[
          '### Given',
          'Type II test, 2.5 m column; basin depth 2.5 m; target overall removal 85 %. Iso-removal lines 30–80 % (Figure 1).',
          '### Method',
          'The overall removal of a basin of depth $Z_0$ and detention time $t_0$ is $R=r_0+\\sum\\Delta R\\,Z_i/Z_0$. Find $t_0$ by trying times until $R=85$ %:',
          `| t₀ (min) | r₀ (%) | ΣΔR·Zᵢ/Z₀ | R (%) |\n|---|---|---|---|\n${[60, 90, 120, 150, 165, Math.round(tStar), 180]
            .filter((t, i, a) => a.indexOf(t) === i)
            .sort((a, b) => a - b)
            .map((t) => {
              const q = R2324(t)
              return `| ${t}${q.extrapolated ? ' *' : ''} | ${q.r0} | ${f(q.partial, 1)} | ${f(q.R, 1)} |`
            })
            .join('\n')}`,
          '\\* beyond 150 min the figure stops; the 80 % curve (which only reaches 1.45 m at 150 min) is continued with its last slope and the 70 % curve likewise.',
          `### Result\n\nR reaches 85 % at $t_0\\approx$ **${f(tStar, 0)} min** (about ${f(tStar / 60, 1)} h). Worked chart at that time:`,
          isoMd(r2324),
        ].join('\n\n')}
      />
      <Fig cap="Worked chart at the minimum detention time (extended curves drawn dashed in the text only; the figure shows them to the edge of the paper). Attach this with the script.">
        <IsoChartFig H={2.5} tMax={Math.max(CHART_2324.tMax, Math.ceil(tStar / 15) * 15)} curves={CHART_2324.curves} t0={tStar} res={r2324} />
      </Fig>
      <Doc md="**Why it needs extrapolation:** an 85 % curve is not drawn, and the 80 % line has not even reached the floor by 150 min. So the answer relies on continuing the 80 % curve; the examiner's figure may have a different shape beyond the paper, so quote it as an estimate (about 2.7–3 h)." />
    </div>
  </Sheet>
)

// ================================================================ Type I columns
function TypeISheet({ r, H, C0, extra }: { r: TypeI; H: number; C0: number; extra?: string }) {
  return (
    <Sheet final={`x₀ = ${f(r.x0, 3)}; overall removal R = ${f(r.R * 100, 1)} %`}>
      <Doc md={['### Given', `Type I (discrete) suspension: column $H=${H}$ m, $C_0=${C0}$ mg/L, loading (overflow) rate $v_0=${g(r.v0, 4)}$ m/min.`, '### Steps', typeIMd(r, H, C0), extra ?? ''].join('\n\n')} />
    </Sheet>
  )
}
const tJan = [58, 77, 91, 114, 154, 250]
const cJan = [560, 415, 325, 215, 130, 52]
const rJan = typeIColumn({ H: 2, C0: 650, data: tJan.map((t, i) => ({ t, C: cJan[i] })), v0: 2.4e-2 })
const tJ22 = [58, 77, 91, 114, 154, 250]
const cJ22 = [540, 405, 305, 200, 120, 45]
const r2223 = typeIColumn({ H: 3, C0: 600, data: tJ22.map((t, i) => ({ t, C: cJ22[i] })), v0: 2.1e-2 })
const stripNote = 'Strips are trapezoids between neighbouring readings (mean velocity of each), starting at the origin (x = 0, v = 0) as in the class notes; reading x₀ off a hand graph gives a few tenths of a percent difference.'

// ================================================================ softening
function softIntro(rows: string, w: Water, extra = '') {
  return [`### Given and conversion to mg/L as CaCO₃`, rows, hardMd(w), extra].filter(Boolean).join('\n\n')
}
function treatMd(t: Treat, label: string) {
  return t.mode === 'selective'
    ? tx`**${label}** (selective Ca removal): $\text{Lime}=CO_2+\text{HCO}_3^-=${f(t.limeParts.co2)}+${f(t.limeParts.alk)}${t.excess ? `+${t.excess}\\ (\\text{excess})` : ''} =$ **${f(t.lime)}** mg/L as CaCO₃; soda ash $=${f(t.soda)}$${t.soda ? '' : ' (the Ca non-carbonate hardness is left alone)'}.`
    : tx`**${label}** (to the practical limits Ca 30, Mg 10): $\text{Lime}=CO_2+\text{alk}+Mg=${f(t.limeParts.co2)}+${f(t.limeParts.alk)}+${f(t.limeParts.mg)}${t.excess ? `+${t.excess}\\ (\\text{excess})` : ''}=$ **${f(t.lime)}**; $\text{Soda}=NCH=TH-\text{alk}=$ **${f(t.soda)}** mg/L as CaCO₃; finished hardness $30+10=40$.`
}
function splitMd(s: Split, o: { mgFinal?: number; thMax: number; pu?: [number, number]; thMin?: number }) {
  const m = masses(s.lime, s.soda, o.pu?.[0] ?? 1, o.pu?.[1] ?? 1)
  return [
    treatMd(s.first, 'First stage (complete)'),
    treatMd(s.second, 'Second stage (selective, only if needed)'),
    o.mgFinal !== undefined ? tx`**Bypass** $X=\dfrac{Mg_f-Mg_i}{Mg_r-Mg_i}=\dfrac{${o.mgFinal}-10}{${f(s.first.h.mgH, 1)}-10}=${f(s.X, 3)}$ → treated fraction $1-X=${f(s.treated, 3)}$.` : tx`**Bypass** $X=${f(s.X, 3)}$, treated $1-X=${f(s.treated, 3)}$.`,
    tx`**Check the blend**: $TH=X(TH_{raw})+(1-X)(40)=${f(s.X, 3)}(${f(s.rawTH)})+${f(s.treated, 3)}(40)=$ **${f(s.blended)}** mg/L as CaCO₃ ${s.blended > o.thMax ? tx`$>${o.thMax}$ → a second stage (selective Ca removal of the bypassed part) is needed; the finished hardness drops to **${f(s.finalTH)}**.` : s.blended < (o.thMin ?? 0) ? tx`(below ${o.thMin}: over-softened, a little more bypass is allowed).` : tx`$\le${o.thMax}$ → **no second stage** is needed.`}`,
    tx`**Doses on the whole flow**: $\text{Lime}=(1-X)\,L_1${s.secondNeeded ? tx`+X\,L_2` : ''}=${f(s.treated, 3)}(${f(s.first.lime)})${s.secondNeeded ? tx`+${f(s.X, 3)}(${f(s.second.lime)})` : ''}=$ **${f(s.lime, 1)}**; $\text{Soda}=(1-X)\,S_1=${f(s.treated, 3)}(${f(s.first.soda)})=$ **${f(s.soda, 1)}** mg/L as CaCO₃.`,
    `As chemicals${o.pu ? ` (quicklime ${o.pu[0] * 100} % pure, soda ash ${o.pu[1] * 100} % pure)` : ' (100 % pure)'}: CaO = ${f(s.lime, 1)} × 56/100${o.pu ? ' ÷ ' + o.pu[0] : ''} = **${f(m.CaO, 1)} mg/L**; Ca(OH)₂ = ${f(m.CaOH2, 1)} mg/L; Na₂CO₃ = ${f(s.soda, 1)} × 106/100${o.pu ? ' ÷ ' + o.pu[1] : ''} = **${f(m.Na2CO3, 1)} mg/L**.`,
  ].join('\n\n')
}
const splitFinal = (s: Split, pu?: [number, number]) => {
  const m = masses(s.lime, s.soda, pu?.[0] ?? 1, pu?.[1] ?? 1)
  return `bypass X = ${f(s.X, 3)}; lime ${f(s.lime, 1)} and soda ${f(s.soda, 1)} mg/L as CaCO₃ (CaO ${f(m.CaO, 0)}, Na₂CO₃ ${f(m.Na2CO3, 0)} mg/L); blended hardness ${f(s.blended, 0)}${s.secondNeeded ? `, ${f(s.finalTH, 0)} after the second stage` : ' (no second stage)'}`
}

// ---- 2017-18 Q4(b)
const w1718 = waterFromIons({ co2: 11, ca: 55, mg: 22, na: 15, cl: 70, so4: 21.2, alkCaCO3: 140 })
const s1718 = splitTreatment(w1718, { mgFinal: 40, thMax: 120 })
const final1718b = splitFinal(s1718)
const Sol1718b = () => (
  <Sheet final={final1718b}>
    <div className="space-y-3">
      <Doc
        md={[
          '### (a) Split treatment',
          '**Advantages:** (1) the water can be tailored to a wanted Mg-hardness; (2) smaller tankage, since the whole flow is not treated; (3) lower chemical cost; (4) the natural alkalinity of the bypassed raw water lowers the pH of the product and helps stabilisation. **Used when** the raw water has high Mg-hardness (Mg > 40 mg/L as CaCO₃), because removing Mg is expensive and the finished water may keep up to 40 mg/L Mg.',
          softIntro(
            convMd([
              { name: 'CO₂', mgL: 11, ion: 'co2', fac: FAC.co2 },
              { name: 'Ca²⁺', mgL: 55, ion: 'ca', fac: FAC.ca },
              { name: 'Mg²⁺', mgL: 22, ion: 'mg', fac: FAC.mg },
              { name: 'Na⁺', mgL: 15, ion: 'na', fac: FAC.na },
              { name: 'Cl⁻', mgL: 70, ion: 'cl', fac: FAC.cl },
              { name: 'SO₄²⁻', mgL: 21.2, ion: 'so4', fac: FAC.so4 },
            ]) + '\n\nBicarbonate alkalinity = 140 mg/L as CaCO₃ (given).',
            w1718,
            '**Assumption:** the table is in mg/L as the ion (cations 260.6 and anions 260.8 as CaCO₃ then balance). "Maximum hardness of 40" is read as the maximum **Mg-hardness** 40 mg/L, with total hardness 80–120 mg/L as CaCO₃.',
          ),
          '### (b) Doses',
          splitMd(s1718, { mgFinal: 40, thMax: 120 }),
        ].join('\n\n')}
      />
      <Fig cap="Flow sheet: the blend is already inside 80–120 mg/L, so the second stage is not built.">
        <SplitFlow X={s1718.X} second={s1718.secondNeeded} />
      </Fig>
    </div>
  </Sheet>
)

// ---- 2022-23 Q4(a)
const w2223 = waterFromIons({ co2: 5.5, ca: 87, mg: 18, na: 24, cl: 65, so4: 68, alkCaCO3: 182 })
const s2223 = splitTreatment(w2223, { mgFinal: 30, thMax: 120 })
const final2223 = splitFinal(s2223)
const Sol2223s = () => (
  <Sheet final={final2223}>
    <div className="space-y-3">
      <Doc
        md={[
          softIntro(
            convMd([
              { name: 'CO₂', mgL: 5.5, ion: 'co2', fac: FAC.co2 },
              { name: 'Ca²⁺', mgL: 87, ion: 'ca', fac: FAC.ca },
              { name: 'Mg²⁺', mgL: 18, ion: 'mg', fac: FAC.mg },
              { name: 'Na⁺', mgL: 24, ion: 'na', fac: FAC.na },
              { name: 'Cl⁻', mgL: 65, ion: 'cl', fac: FAC.cl },
              { name: 'SO₄²⁻', mgL: 68, ion: 'so4', fac: FAC.so4 },
            ]) + '\n\nAlkalinity 182 mg/L as CaCO₃ (given).',
            w2223,
            'Criteria: Mg-hardness ≤ 30, total hardness 80–120 mg/L as CaCO₃.',
          ),
          '### Doses (split treatment)',
          splitMd(s2223, { mgFinal: 30, thMax: 120 }),
        ].join('\n\n')}
      />
      <Fig>
        <SplitFlow X={s2223.X} second={s2223.secondNeeded} />
      </Fig>
    </div>
  </Sheet>
)

// ---- 2023-24 Q2(c)
const w2324 = waterFromIons({ co2: 9, ca: 102, mg: 45, hco3: 364, so4: 138 })
const s2324 = splitTreatment(w2324, { mgFinal: 40, thMax: 120 })
const final2324c = splitFinal(s2324, [0.87, 0.97])
const Sol2324c = () => (
  <Sheet final={final2324c}>
    <div className="space-y-3">
      <Doc
        md={[
          softIntro(
            convMd([
              { name: 'CO₂', mgL: 9, ion: 'co2', fac: FAC.co2 },
              { name: 'Ca²⁺', mgL: 102, ion: 'ca', fac: FAC.ca },
              { name: 'Mg²⁺', mgL: 45, ion: 'mg', fac: FAC.mg },
              { name: 'HCO₃⁻', mgL: 364, ion: 'hco3', fac: FAC.hco3 },
              { name: 'SO₄²⁻', mgL: 138, ion: 'so4', fac: FAC.so4 },
            ]),
            w2324,
            '**Assumption:** the paper gives no Mg limit, only "final hardness < 120", so the usual finished Mg-hardness of 40 mg/L as CaCO₃ (slide) is used to set the bypass; the first stage takes Ca to 30 and Mg to 10 (hardness 40).',
          ),
          '### Flow scheme, split and doses',
          splitMd(s2324, { mgFinal: 40, thMax: 120, pu: [0.87, 0.97] }),
          `### Final hardness\n\n**${f(s2324.finalTH, 0)} mg/L as CaCO₃**, below the limit of 120 (the bypassed water carries ${f(s2324.X * s2324.rawTH, 0)} of it).`,
        ].join('\n\n')}
      />
      <Fig cap="Raw water bar diagram: cation total 440, anion total 442 mg/L as CaCO₃ (balanced); the Ca and Mg sit on a HCO₃⁻ bar that is longer than Ca alone, so Mg is partly carbonate hardness.">
        <BarDiagram bars={bars({ ...w2324, na: 0, cl: 0 })} title="Raw water (mg/L as CaCO₃)" mark={[{ label: 'alk 298', at: w2324.alk }]} />
      </Fig>
      <Fig>
        <SplitFlow X={s2324.X} second={s2324.secondNeeded} />
      </Fig>
    </div>
  </Sheet>
)

// ---- 2020-21 Q7(b)
const w2021 = { co2: 19, ca: 225, mg: 70, na: 0, cl: 0, so4: 0, alk: 264 }
const full2021 = treat(w2021, { mode: 'complete' })
const X2021 = bypassForHardness(w2021.ca + w2021.mg, 60)
const sp2021 = splitAt(w2021, X2021, { thMax: 60 })
const final2021b = `treat all: lime ${f(full2021.lime, 0)}, soda ${f(full2021.soda, 0)} (TH 40); with ${f(X2021 * 100, 1)} % bypass to give exactly 60: lime ${f(sp2021.lime, 0)}, soda ${f(sp2021.soda, 0)} mg/L as CaCO₃`
const Sol2021b = () => (
  <Sheet final={final2021b}>
    <Doc
      md={[
        '### Given',
        hardMd(w2021),
        tx`Mg is above 40 mg/L as CaCO₃, so it has to be removed to reach 60 mg/L (selective Ca removal alone leaves $30+70=100$).`,
        '### Steps',
        treatMd(full2021, 'Complete softening of all the water'),
        tx`That gives a finished hardness of 40, lower than the 60 asked. Cheaper: **bypass** part of the raw water and blend: $X(295)+(1-X)(40)=60$ → $X=\dfrac{60-40}{295-40}=${f(X2021, 4)}$ (${f(X2021 * 100, 1)} %).`,
        tx`Lime $=(1-X)(${f(full2021.lime)})=${f(sp2021.lime, 1)}$ mg/L as CaCO₃; soda $=(1-X)(${f(full2021.soda)})=${f(sp2021.soda, 1)}$ mg/L as CaCO₃.`,
        `As chemicals (100 % pure): all water treated: CaO = ${f(full2021.lime * 0.56, 0)} mg/L, Na₂CO₃ = ${f(full2021.soda * 1.06, 0)} mg/L; with the bypass: CaO = ${f(sp2021.lime * 0.56, 0)}, Na₂CO₃ = ${f(sp2021.soda * 1.06, 0)} mg/L. Excess lime (20–40 mg/L) is not added in Tanvir sir's own worked method; if the examiner wants it, add 40 (Mg > 40) to the lime of the treated stream.`,
      ].join('\n\n')}
    />
  </Sheet>
)

// ---- 2021-22 Q4(a)
const w2122 = { co2: 4.6, ca: 257.9, mg: 22.2, na: 0, cl: 0, so4: 32.1, alk: 248 }
const sel2122 = treat(w2122, { mode: 'selective' })
const cmp2122 = treat(w2122, { mode: 'complete' })
const final2122b = `(a) selective Ca: lime ${f(sel2122.lime, 1)} mg/L as CaCO₃ (soda 0; +${slideExcess(w2122, 'selective')} excess = ${f(sel2122.lime + 20, 1)}), finished TH ≈ ${f(sel2122.final.th, 0)}; (b) practical limits: lime ${f(cmp2122.lime, 1)}, soda ${f(cmp2122.soda, 1)}, finished TH 40`
const Sol2122b = () => (
  <Sheet final={final2122b}>
    <div className="space-y-3">
      <Doc
        md={[
          '### Given',
          'All in mg/L as CaCO₃ (as printed). Cations Ca + Mg = 280.1, anions HCO₃ + SO₄ = 280.1: balanced (no Na, no Cl).',
          hardMd(w2122),
          '### (a) Selective calcium removal',
          treatMd(sel2122, 'Lime'),
          tx`Ca non-carbonate hardness is only $257.9-248=9.9$, below the practical Ca limit of 30, so no soda ash. Finished water: Ca falls to $9.9+30=${f(sel2122.final.ca, 1)}$ (carbonate part to the 30 solubility limit), Mg stays 22.2: TH ≈ ${f(sel2122.final.th, 1)}; the 30 left as CO₃²⁻ alkalinity balances the cations.`,
          '### (b) To the practical solubility limits',
          treatMd(cmp2122, 'Lime and soda'),
          `Finished water: Ca 30, Mg 10, Na ${f(cmp2122.final.na, 1)} (from the soda), SO₄ 32.1, alkalinity left ${f(cmp2122.final.alk, 1)} (CO₃²⁻ of the 30 + 10 residual hardness). Adding excess lime (20 mg/L for Mg 20–40) would raise the lime to ${f(cmp2122.lime + 20, 1)}, to be removed by recarbonation.`,
        ].join('\n\n')}
      />
      <Fig cap="(a) selective Ca removal, finished water (before recarbonation)">
        <BarDiagram bars={bars(sel2122.final)} max={290} title="(a) finished water, selective Ca removal" />
      </Fig>
      <Fig cap="(b) practical limits: hardness 30 + 10 = 40; the Na bar is the sodium added by the soda ash">
        <BarDiagram bars={bars(cmp2122.final)} max={290} title="(b) finished water, practical solubility limits" />
      </Fig>
      <Fig cap="For comparison: the raw water">
        <BarDiagram bars={bars(w2122)} max={290} title="Raw water (mg/L as CaCO₃)" />
      </Fig>
    </div>
  </Sheet>
)

// ================================================================ ion exchange
const hJan = homeSoftener({ V: 0.1, cap: 65, Qlpd: 1500, Hraw: 260, Hdes: 90 })
const h2223 = homeSoftener({ V: 0.2, cap: 82, Qlpd: 3000, Hraw: 320, Hdes: 75 })
function HomeSol({ p, V, cap, Q, Hr, Hd }: { p: ReturnType<typeof homeSoftener>; V: number; cap: number; Q: number; Hr: number; Hd: number }) {
  return (
    <Sheet final={`bypass ${f(p.bypass * 100, 1)} % (treated ${f(p.treated * 100, 1)} %); regeneration every ${f(p.days, 1)} days`}>
      <Doc
        md={[
          '### Given',
          `Resin ${V} m³, capacity ${cap} kg/m³; use ${Q} L/d; hardness ${Hr} → ${Hd} mg/L as CaCO₃. Assumption: the exchanger delivers water of zero hardness.`,
          '### Steps',
          tx`1. Bypass: $X=\dfrac{H_{des}}{H_{raw}}=\dfrac{${Hd}}{${Hr}}=${f(p.bypass, 4)}$ → **${f(p.bypass * 100, 1)} %** of the flow is bypassed; ${f(p.treated * 100, 1)} % goes through the resin.`,
          tx`2. Flow through the resin: $${Q}\times${f(p.treated, 4)} = ${f(p.treatedLpd, 0)}$ L/d.`,
          tx`3. Hardness load on the resin: $${f(p.treatedLpd, 0)}\ \text{L/d}\times${Hr}\ \text{mg/L}=${g(p.treatedLpd * Hr, 5)}$ mg/d $=${f(p.loadKgD, 4)}$ kg/d.`,
          tx`4. Capacity of the bed: $${V}\times${cap}=${f(p.capKg, 2)}$ kg as CaCO₃.`,
          tx`5. Time between regenerations: $t=\dfrac{${f(p.capKg, 2)}}{${f(p.loadKgD, 4)}}=$ **${f(p.days, 1)} days**.`,
          `(Class way: if the bypass is rounded to ${Math.round(p.bypass * 100)} %, the load becomes ${f((Q * (1 - Math.round(p.bypass * 100) / 100) * Hr) / 1e6, 4)} kg/d and the time ${f(p.capKg / ((Q * (1 - Math.round(p.bypass * 100) / 100) * Hr) / 1e6), 1)} days.)`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}

const wQ2c = waterFromIons({ co2: 9, ca: 102, mg: 45, hco3: 364, so4: 138 })
const H4c = wQ2c.ca + wQ2c.mg
const fb4c = fixedBed({ Q: 25000, Hraw: H4c, Hdes: 120, cap: 95, loading: 0.35, depth: 1.5, regen: 150, strength: 0.1 })
const final4c = `bypass ${f(fb4c.bypass * 100, 1)} % (${f(25000 * fb4c.bypass, 0)} m³/d); bed area ${f(fb4c.A, 1)} m², resin ${f(fb4c.V, 1)} m³ per bed (depth 1.5 m assumed); two beds; run ${f(fb4c.runH, 1)} h; ${f(fb4c.saltKg, 0)} kg NaCl (${f(fb4c.brineM3, 1)} m³ of 10 % brine) per regeneration`
const Sol4c = () => (
  <Sheet final={final4c}>
    <Doc
      md={[
        '### Given',
        `Water of Q2(c) Table 1: TH = Ca + Mg = ${f(wQ2c.ca, 1)} + ${f(wQ2c.mg, 1)} = **${f(H4c, 1)} mg/L as CaCO₃**. Q = 25 000 m³/d, target < 120 mg/L, resin capacity 95 kg/m³, loading 0.35 m³/min·m², regeneration 150 kg NaCl per m³ of resin as a 10 % solution.`,
        '### Assumptions',
        '- The resin removes all hardness (zero-hardness effluent), the rest is made up by bypass.\n- Bed depth **1.5 m** (not given; typical 1–2 m: the run length is proportional to depth).\n- Continuous operation: **two** identical beds, each able to take the full flow, so one runs while the other is regenerated (backwash, brine, rinse).\n- 10 % brine ≈ 1 kg/L.',
        '### (i) Bypass',
        tx`$X=\dfrac{120}{${f(H4c, 1)}}=${f(fb4c.bypass, 4)}$ → **${f(fb4c.bypass * 100, 1)} %** = ${f(25000 * fb4c.bypass, 0)} m³/d bypasses; **${f(fb4c.Qtreated, 0)} m³/d** (${f(fb4c.QtreatedMin, 2)} m³/min) goes through the resin.`,
        '### (ii) and (iii) Medium and tank',
        tx`Bed area $A=\dfrac{Q}{\text{loading}}=\dfrac{${f(fb4c.QtreatedMin, 2)}}{0.35}=${f(fb4c.A, 1)}$ m² → circular tank $D=\sqrt{4A/\pi}=${f(Math.sqrt((4 * fb4c.A) / Math.PI), 2)}$ m. Volume of medium per bed $V=A\times1.5=${f(fb4c.V, 1)}$ m³ (a total of ${f(2 * fb4c.V, 1)} m³ for two beds). Tank height about 1.5 m of resin + about 0.75 m for backwash expansion + freeboard ≈ 2.8–3 m.`,
        '### (iv) Regeneration',
        tx`Hardness applied $=0.35\times${f(H4c / 1000, 4)}=${f(fb4c.loadPerM2, 4)}$ kg/min per m². Capacity per m² $=95\times1.5=142.5$ kg → run time $=\dfrac{142.5}{${f(fb4c.loadPerM2, 4)}}=${f(fb4c.runMin, 0)}$ min = **${f(fb4c.runH, 1)} h** between regenerations (${f(fb4c.cyclesPerDay, 2)} cycles/day).`,
        tx`Salt per regeneration $=150\times${f(fb4c.V, 1)}=$ **${f(fb4c.saltKg, 0)} kg NaCl**; brine $=\dfrac{${f(fb4c.saltKg, 0)}}{0.10}=${f(fb4c.brineM3 * 1000, 0)}$ kg ≈ **${f(fb4c.brineM3, 1)} m³** of 10 % solution. Per day ${f(fb4c.saltKgPerDay / 1000, 1)} t NaCl.`,
      ].join('\n\n')}
    />
  </Sheet>
)

// ================================================================ water chemistry
const a2021 = alkalinityFromBicarbonate({ hco3mgL: 105, pH: 10.3, pK2: 10.3, th: 310 })
const final2021c = `alkalinity ≈ ${f(a2021.total, 0)} mg/L as CaCO₃; CH = ${f(a2021.ch, 0)}; NCH = ${f(a2021.nch, 0)} mg/L as CaCO₃`
const Sol2021c = () => (
  <Sheet final={final2021c}>
    <Doc
      md={[
        '### Given',
        'HCO₃⁻ = 105 mg/L, pH = 10.3, TH = 310 mg/L as CaCO₃; $K_w=10^{-14}$, $K_1=10^{-6.3}$, $K_2=10^{-10.3}$.',
        '### Steps',
        tx`1. $[HCO_3^-]=\dfrac{105}{61\,000}=${g(a2021.hcoM, 4)}$ mol/L.`,
        tx`2. From $K_2=\dfrac{[H^+][CO_3^{2-}]}{[HCO_3^-]}$: $[CO_3^{2-}]=[HCO_3^-]\dfrac{K_2}{[H^+]}=${g(a2021.hcoM, 4)}\times\dfrac{10^{-10.3}}{10^{-10.3}}=${g(a2021.coM, 4)}$ mol/L (at pH = pK₂ the two are equal).`,
        tx`3. $[OH^-]=\dfrac{K_w}{[H^+]}=10^{-3.7}=${g(a2021.ohM, 3)}$ mol/L; $[H^+]=10^{-10.3}$ is negligible.`,
        tx`4. Alkalinity (eq/L) $=[HCO_3^-]+2[CO_3^{2-}]+[OH^-]-[H^+]=${g(a2021.hcoM, 4)}+2(${g(a2021.coM, 4)})+${g(a2021.ohM, 3)}=${g(a2021.hcoM + 2 * a2021.coM + a2021.ohM, 4)}$ eq/L.`,
        tx`5. As CaCO₃ (× 50 000 mg/eq): HCO₃⁻ ${f(a2021.hco3, 1)} + CO₃²⁻ ${f(a2021.co3, 1)} + OH⁻ ${f(a2021.oh, 1)} = **${f(a2021.total, 1)} mg/L as CaCO₃** (total alkalinity).`,
        tx`6. TH = 310 > alkalinity → **carbonate hardness = alkalinity = ${f(a2021.ch, 1)}**, **non-carbonate hardness** $=310-${f(a2021.total, 1)}=${f(a2021.nch, 1)}$ mg/L as CaCO₃.`,
      ].join('\n\n')}
    />
  </Sheet>
)

const hen = henryWithAir({ x: 6.9e-8, H: 560, nAir: 0.01, mw: 131.4 })
const final2324b = `${f(hen.ugL0, 0)} µg/L (≈ 0.50 mg/L) in water; with 0.01 mol air: ${f(hen.ugLLeft, 1)} µg/L (${f(hen.fractionLeft * 100, 1)} % remains)`
const Sol2324b = () => (
  <Sheet final={final2324b}>
    <Doc
      md={[
        '### Given',
        'x = 6.9 × 10⁻⁸ mol TCE per mol water; MW(TCE) = 131.4; H = 560 atm; 0.01 mol air.',
        '### (a) Concentration',
        tx`1 L of water is 55.6 mol. TCE $=6.9\times10^{-8}\times55.6=${g(6.9e-8 * 55.6, 4)}$ mol/L → $\times131.4=${g(6.9e-8 * 55.6 * 131.4, 4)}$ g/L = **${f(hen.ugL0, 0)} µg/L** (≈ ${f(hen.mgL0, 2)} mg/L).`,
        '### (b) In the presence of 0.01 mol air (class method)',
        tx`Let $X$ mol TCE per mol water pass into the 0.01 mol of air. Henry: $H=\dfrac{P}{C}=\dfrac{X/0.01}{(6.9\times10^{-8}-X)}=560$ (P in mol TCE per mol air, equal to atm at 1 atm total pressure, C in mol per mol water).`,
        tx`$100X=560(6.9\times10^{-8}-X)$ → $X=\dfrac{560\times6.9\times10^{-8}}{100+560}=${g(hen.X, 3)}$ mol.`,
        tx`Left in water: $6.9\times10^{-8}-${g(hen.X, 3)}=${g(hen.xLeft, 3)}$ mol/mol → $\times55.6\times131.4\times10^6=$ **${f(hen.ugLLeft, 1)} µg/L** (${f(hen.fractionLeft * 100, 1)} % of the original).`,
        'This follows Tanvir sir’s class working of the same question (his slide number 6.84 × 10⁻⁸ gives 500 µg/L and 75.7 µg/L); "0.01 mole air" is the amount of air receiving the TCE, not a pressure.',
      ].join('\n\n')}
    />
  </Sheet>
)

const co2ph = phOfCo2Water({ KH: 0.033363, P: 2 })
const final2324d = `[CO₂] = ${g(co2ph.h2co3, 3)} mol/L; pH ≈ ${f(co2ph.pH, 2)}`
const Sol2324d = () => (
  <Sheet final={final2324d}>
    <Doc
      md={[
        '### Given',
        'P(CO₂) = 2 atm, 25 °C, K_H = 0.033363 mol/L·atm. **Assumption:** the paper gives no K₁; the first dissociation constant $K_1=10^{-6.3}$ ($pK_1=6.3$, the value on Tanvir sir’s own sheet in 2020-21 Q8(b)) is used. Textbooks give $4.3\\times10^{-7}$ ($pK_1=6.37$), which changes the pH by 0.03.',
        '### Steps',
        tx`1. $[H_2CO_3^*]=K_HP_g=0.033363\times2=${g(co2ph.h2co3, 4)}$ mol/L.`,
        tx`2. $H_2CO_3^*\rightleftharpoons H^++HCO_3^-$, $K_1=\dfrac{[H^+][HCO_3^-]}{[H_2CO_3^*]}=10^{-6.3}$. Only the first dissociation matters, and $[H^+]=[HCO_3^-]$ (water's own $H^+$ and $CO_3^{2-}$ are negligible).`,
        tx`3. $[H^+]=\sqrt{K_1[H_2CO_3^*]}=\sqrt{10^{-6.3}\times${g(co2ph.h2co3, 4)}}=${g(Math.sqrt(10 ** -6.3 * co2ph.h2co3), 3)}$ mol/L.`,
        tx`4. $pH=-\log[H^+]=$ **${f(co2ph.approxPH, 2)}** (solving the full charge balance, including OH⁻ and CO₃²⁻, gives ${f(co2ph.pH, 3)}).`,
        'The soft drink is acidic (pH about 3.7), as it should be; the sharp taste is the carbonic acid, and a lower pH than rain water (5.6, at 0.0004 atm) because the pressure is 5000 times higher.',
      ].join('\n\n')}
    />
  </Sheet>
)

// ================================================================ coagulation
const fe = alkConsumed('fecl3', 28)
const finalFe = `${f(fe.alk, 1)} mg/L as CaCO₃ (= ${f(fe.hco3, 1)} mg/L HCO₃⁻) consumed`
const SolFe = () => (
  <Sheet final={finalFe}>
    <Doc
      md={[
        '### Given',
        tx`FeCl₃ + 3HCO₃⁻ + 3H₂O → Fe(OH)₃·3H₂O(s) + 3CO₂ + 3Cl⁻; optimum dose 28 mg/L; Fe = 55.85, Cl = 35.45.`,
        '### Steps',
        tx`1. MW(FeCl₃) $=55.85+3(35.45)=162.2$ g/mol → dose $=\dfrac{28}{162.2}=${g(fe.mmol, 4)}$ mmol/L.`,
        tx`2. Each mole uses 3 mol HCO₃⁻, i.e. 3 equivalents: $3\times${g(fe.mmol, 4)}=${g(fe.mmol * 3, 4)}$ meq/L.`,
        tx`3. As CaCO₃ (50 mg per meq): $${g(fe.mmol * 3, 4)}\times50=$ **${f(fe.alk, 1)} mg/L as CaCO₃** (0.92 mg alkalinity per mg FeCl₃; ${f(fe.hco3, 1)} mg/L as HCO₃⁻).`,
        'The raw water must therefore have at least this much natural alkalinity (plus a reserve for pH control), or lime / soda ash must be added.',
      ].join('\n\n')}
    />
  </Sheet>
)

// ================================================================ the map
export const TA_MATH: Record<string, EvPartMap> = {
  'ev-2012-13-1c': { topics: ['ev-wq'], ans: [], from: ['textbook'], final: final1213, Sol: Sol1213, checks: () => [
      { key: 'phs', label: 'Saturation pH, $\\text{pH}_s$', value: L1213.pHs, tol: 0.01 },
      { key: 'lsi', label: 'Langelier index, $\\text{LSI} = \\text{pH} - \\text{pH}_s$', value: L1213.lsi, abs: 0.02 },
      { key: 'rsi', label: 'Ryznar index, $\\text{RSI} = 2\\,\\text{pH}_s - \\text{pH}$', value: L1213.rsi, tol: 0.01 },
    ], flag: 'Langelier and Ryznar indices are not in this term’s CE22 slides: standard textbook method (Peavy / Davis).', notes: ['The ratio pK₂ − pKₛ = 2.54 is given, so pHₛ = 2.54 + pCa + pAlk (Ca and alkalinity in mol/L and eq/L).'] },
  'ev-2017-18-3b': { topics: ['ev-sed'], ans: [], checks: () => [
      { key: 'r0a', label: 'Curve reaching the bottom, $r_0$ at 90 min', value: r1718a.r0, unit: '%', tol: 0.04 },
      { key: 'suma', label: '$\\sum \\Delta R\\,Z_i$ at 90 min', value: r1718a.sum, tol: 0.05 },
      { key: 'Ra', label: 'Overall removal $R$ at 90 min', value: r1718a.R, unit: '%', tol: 0.04 },
      { key: 'r0b', label: 'Curve reaching the bottom, $r_0$ at 180 min', value: r1718b.r0, unit: '%', tol: 0.04 },
      { key: 'sumb', label: '$\\sum \\Delta R\\,Z_i$ at 180 min', value: r1718b.sum, tol: 0.05 },
      { key: 'Rb', label: 'Overall removal $R$ at 180 min', value: r1718b.R, unit: '%', tol: 0.04 },
    ], from: ['ce22'], final: final1718, Sol: Sol1718, notes: ['Chart read from the transcription’s curve readings (±0.1 m); the printed grid of % removal is consistent with them (45 % at 3 m, 90 min; 70 % at 3 m, 180 min).'] },
  'ev-2017-18-4b': { topics: ['ev-soft'], ans: [], checks: () => [
      { key: 'X', label: 'Bypass fraction $X$', value: s1718.X, tol: 0.03 },
      { key: 'lime', label: 'Lime dose on the whole flow', value: s1718.lime, unit: 'mg/L as CaCO₃' },
      { key: 'soda', label: 'Soda ash dose on the whole flow', value: s1718.soda, unit: 'mg/L as CaCO₃' },
      { key: 'cao', label: 'Lime as CaO', value: masses(s1718.lime, s1718.soda).CaO, unit: 'mg/L' },
    ], from: ['ce22', 'notes'], final: final1718b, Sol: Sol1718b, notes: ['"Maximum hardness of 40" is read as the maximum Mg-hardness 40 mg/L as CaCO₃; table taken as mg/L of the ion (the analysis then balances).'] },
  'ev-jan-2021-2b': { topics: ['ev-sed'], ans: [], from: ['ce22', 'notes'], final: `x₀ = ${f(rJan.x0, 3)}; R = ${f(rJan.R * 100, 1)} %`, Sol: () => <TypeISheet r={rJan} H={2} C0={650} extra={stripNote} />, checks: () => [
      { key: 'v0', label: 'Overflow rate $v_0$', value: rJan.v0, unit: 'm/min' },
      { key: 'x0', label: 'Fraction slower than $v_0$, $x_0$', value: rJan.x0, tol: 0.03 },
      { key: 'R', label: 'Overall removal $R$', value: rJan.R * 100, unit: '%', tol: 0.03 },
    ] },
  'ev-jan-2021-4b': { topics: ['ev-ix'], ans: [], checks: () => [
      { key: 'x', label: 'Bypass', value: hJan.bypass * 100, unit: '%' },
      { key: 'load', label: 'Hardness load on the resin', value: hJan.loadKgD, unit: 'kg/d' },
      { key: 'cap', label: 'Bed capacity', value: hJan.capKg, unit: 'kg as CaCO₃' },
      { key: 'days', label: 'Time between regenerations', value: hJan.days, unit: 'days' },
    ], from: ['ce22', 'notes'], final: `bypass ${f(hJan.bypass * 100, 1)} %; regenerate every ${f(hJan.days, 1)} days`, Sol: () => <HomeSol p={hJan} V={0.1} cap={65} Q={1500} Hr={260} Hd={90} /> },
  'ev-2020-21-5a': { topics: ['ev-sed'], ans: [], checks: () => [
      { key: 'r0', label: 'Curve reaching the bottom, $r_0$', value: r2021.r0, unit: '%', tol: 0.04 },
      { key: 'sum', label: '$\\sum \\Delta R\\,Z_i$', value: r2021.sum, tol: 0.05 },
      { key: 'R', label: 'Overall removal $R$', value: r2021.R, unit: '%', tol: 0.04 },
    ], from: ['ce22'], final: final2021, Sol: Sol2021, notes: ['Curve positions read by eye from the transcription (±0.1 m, ±1 min).'] },
  'ev-2020-21-7b': { topics: ['ev-soft'], ans: [], checks: () => [
      { key: 'limeAll', label: 'Lime, treating all the water', value: full2021.lime, unit: 'mg/L as CaCO₃' },
      { key: 'sodaAll', label: 'Soda ash, treating all the water', value: full2021.soda, unit: 'mg/L as CaCO₃' },
      { key: 'X', label: 'Bypass for 60 mg/L', value: X2021 * 100, unit: '%' },
      { key: 'lime', label: 'Lime with bypass', value: sp2021.lime, unit: 'mg/L as CaCO₃' },
      { key: 'soda', label: 'Soda ash with bypass', value: sp2021.soda, unit: 'mg/L as CaCO₃' },
    ], from: ['ce22', 'notes'], final: final2021b, Sol: Sol2021b, notes: ['Target 60 mg/L needs Mg removal; solved with complete treatment plus bypass. Tanvir sir does not add excess lime in his worked split example.'] },
  'ev-2020-21-8b': { topics: ['ev-wq'], ans: [], checks: () => [
      { key: 'alk', label: 'Total alkalinity', value: a2021.total, unit: 'mg/L as CaCO₃' },
      { key: 'ch', label: 'Carbonate hardness', value: a2021.ch, unit: 'mg/L as CaCO₃' },
      { key: 'nch', label: 'Non-carbonate hardness', value: a2021.nch, unit: 'mg/L as CaCO₃' },
    ], from: ['ce22'], final: final2021c, Sol: Sol2021c },
  'ev-2020-21-8c': { topics: ['ev-coag', 'ev-wq'], ans: [], checks: () => [
      { key: 'mmol', label: 'FeCl₃ dose', value: fe.mmol, unit: 'mmol/L' },
      { key: 'alk', label: 'Alkalinity consumed', value: fe.alk, unit: 'mg/L as CaCO₃' },
    ], from: ['ce22'], final: finalFe, Sol: SolFe },
  'ev-2021-22-2b': { topics: ['ev-sed'], ans: [], checks: () => [
      { key: 'r0a', label: 'Curve reaching the bottom, $r_0$ at 60 min', value: r2122a.r0, unit: '%', tol: 0.04 },
      { key: 'suma', label: '$\\sum \\Delta R\\,Z_i$ at 60 min', value: r2122a.sum, tol: 0.05 },
      { key: 'Ra', label: 'Overall removal $R$ at 60 min', value: r2122a.R, unit: '%', tol: 0.04 },
      { key: 'r0b', label: 'Curve reaching the bottom, $r_0$ at 105 min', value: r2122b.r0, unit: '%', tol: 0.04 },
      { key: 'sumb', label: '$\\sum \\Delta R\\,Z_i$ at 105 min', value: r2122b.sum, tol: 0.05 },
      { key: 'Rb', label: 'Overall removal $R$ at 105 min', value: r2122b.R, unit: '%', tol: 0.04 },
    ], from: ['ce22'], final: final2122, Sol: Sol2122, flag: 'The figure prints no removal values: curves read by eye (same drawing as 2023-24 Q1(c)); the chart bottom is taken as the 3 m floor. Expect ±2 %.', notes: ['Depth axis read as fractions of the chart height × 3 m (the ports at 0.5 m intervals stop at h₅).'] },
  'ev-2021-22-4a': { topics: ['ev-soft'], ans: [], checks: () => [
      { key: 'limeA', label: '(a) Lime, selective Ca removal', value: sel2122.lime, unit: 'mg/L as CaCO₃' },
      { key: 'limeB', label: '(b) Lime, practical limits', value: cmp2122.lime, unit: 'mg/L as CaCO₃' },
      { key: 'sodaB', label: '(b) Soda ash, practical limits', value: cmp2122.soda, unit: 'mg/L as CaCO₃' },
    ], from: ['ce22', 'notes'], final: final2122b, Sol: Sol2122b },
  'ev-2022-23-2c': { topics: ['ev-ix'], ans: [], checks: () => [
      { key: 'x', label: 'Bypass', value: h2223.bypass * 100, unit: '%' },
      { key: 'load', label: 'Hardness load on the resin', value: h2223.loadKgD, unit: 'kg/d' },
      { key: 'cap', label: 'Bed capacity', value: h2223.capKg, unit: 'kg as CaCO₃' },
      { key: 'days', label: 'Time between regenerations', value: h2223.days, unit: 'days' },
    ], from: ['ce22', 'notes'], final: `bypass ${f(h2223.bypass * 100, 1)} %; regenerate every ${f(h2223.days, 1)} days`, Sol: () => <HomeSol p={h2223} V={0.2} cap={82} Q={3000} Hr={320} Hd={75} /> },
  'ev-2022-23-3a': { topics: ['ev-sed'], ans: [], checks: () => [
      { key: 'v0', label: 'Overflow rate $v_0$', value: r2223.v0, unit: 'm/min' },
      { key: 'x0', label: 'Fraction slower than $v_0$, $x_0$', value: r2223.x0, tol: 0.03 },
      { key: 'R', label: 'Overall removal $R$', value: r2223.R * 100, unit: '%', tol: 0.03 },
    ], from: ['ce22', 'notes'], final: `x₀ = ${f(r2223.x0, 3)}; R = ${f(r2223.R * 100, 1)} %`, Sol: () => <TypeISheet r={r2223} H={3} C0={600} extra={stripNote} /> },
  'ev-2022-23-4a': { topics: ['ev-soft'], ans: [], checks: () => [
      { key: 'X', label: 'Bypass fraction $X$', value: s2223.X, tol: 0.03 },
      { key: 'lime', label: 'Lime dose on the whole flow', value: s2223.lime, unit: 'mg/L as CaCO₃' },
      { key: 'soda', label: 'Soda ash dose on the whole flow', value: s2223.soda, unit: 'mg/L as CaCO₃' },
      { key: 'cao', label: 'Lime as CaO', value: masses(s2223.lime, s2223.soda).CaO, unit: 'mg/L' },
    ], from: ['ce22', 'notes'], final: final2223, Sol: Sol2223s },
  'ev-2023-24-1b': { topics: ['ev-aer', 'ev-wq'], ans: [], checks: () => [
      { key: 'c0', label: '(a) TCE concentration in water', value: hen.ugL0, unit: 'µg/L' },
      { key: 'X', label: '(b) TCE moved into the air, $X$', value: hen.X, unit: 'mol', tol: 0.03 },
      { key: 'left', label: '(b) TCE left in the water', value: hen.ugLLeft, unit: 'µg/L' },
    ], from: ['notes'], final: final2324b, Sol: Sol2324b },
  'ev-2023-24-1c': { topics: ['ev-sed'], ans: [], checks: () => [
      { key: 'r0', label: 'Curve reaching the bottom, $r_0$', value: r2324.r0, unit: '%', tol: 0.04 },
      { key: 'part', label: '$\\sum \\Delta R\\,Z_i/Z_0$', value: r2324.partial, unit: '%', tol: 0.05 },
      { key: 't', label: 'Detention time for 85 % removal', value: tStar, unit: 'min', tol: 0.05 },
    ], from: ['ce22'], final: final2324, Sol: Sol2324, flag: 'The 85 % iso-removal line is not drawn and the 80 % line stops at 1.45 m: the answer needs extrapolation, so it is an estimate.', notes: ['Curves rebuilt from the transcription’s readings (±0.1 m, ±3 min).'] },
  'ev-2023-24-2b': { topics: ['ev-wq'], ans: [], checks: () => [
      { key: 'h2co3', label: 'Dissolved CO₂, $[\\text{H}_2\\text{CO}_3^*]$', value: co2ph.h2co3, unit: 'mol/L' },
      { key: 'ph', label: 'pH', value: co2ph.pH, tol: 0.01 },
    ], from: ['textbook'], final: final2324d, Sol: Sol2324d, flag: 'pH of CO₂ water is not in this term’s slides or class notes; K₁ is not given in the paper (10^-6.3 assumed, as on Tanvir sir’s 2020-21 sheet).' },
  'ev-2023-24-2c': { topics: ['ev-soft'], ans: [], checks: () => [
      { key: 'X', label: 'Bypass fraction $X$', value: s2324.X, tol: 0.03 },
      { key: 'lime', label: 'Lime dose on the whole flow', value: s2324.lime, unit: 'mg/L as CaCO₃' },
      { key: 'soda', label: 'Soda ash dose on the whole flow', value: s2324.soda, unit: 'mg/L as CaCO₃' },
      { key: 'cao', label: 'Lime as CaO', value: masses(s2324.lime, s2324.soda, 0.87, 0.97).CaO, unit: 'mg/L' },
      { key: 'th', label: 'Final hardness', value: s2324.finalTH, unit: 'mg/L as CaCO₃' },
    ], from: ['ce22', 'notes'], final: final2324c, Sol: Sol2324c, notes: ['No Mg limit printed: the usual finished Mg-hardness of 40 mg/L as CaCO₃ is assumed to set the bypass.'] },
  'ev-2023-24-4c': { topics: ['ev-ix'], ans: [], checks: () => [
      { key: 'x', label: 'Bypass', value: fb4c.bypass * 100, unit: '%' },
      { key: 'A', label: 'Bed area', value: fb4c.A, unit: 'm²' },
      { key: 'V', label: 'Resin volume per bed', value: fb4c.V, unit: 'm³' },
      { key: 'run', label: 'Run between regenerations', value: fb4c.runH, unit: 'h' },
      { key: 'salt', label: 'NaCl per regeneration', value: fb4c.saltKg, unit: 'kg' },
    ], from: ['ce22', 'notes'], final: final4c, Sol: Sol4c, notes: ['Bed depth (1.5 m) and the two-bed arrangement are assumed: the paper does not give them.'] },
}
void hardness
