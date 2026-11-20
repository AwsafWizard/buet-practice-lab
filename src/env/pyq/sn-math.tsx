// Number-type parts from Snigdha ma'am's block: worked solutions computed by ../engine (see docs/CE331_AUTHORING.md).
// Population: her slides' methods (arithmetic, geometric = end-to-end, decreasing rate); least-squares parabola and Kuichling fire
// flow come from the seniors' notes (Delwar sir) and the textbook — they are not in the CE22 slides, so those parts carry `from` + `flag`.
import type { ReactNode } from 'react'
import { Md } from '../../components/ui'
import { GwSection } from '../figs/gw-section'
import { PopWorkChart } from '../figs/sn-pop-work'
import { WellSketch } from '../figs/sn-well-sketch'
import { annualGrowth, arithmetic, decreasing, geometric, growthRates, incremental, polyFit, type Census } from '../engine/population'
import { economicTank, fireDemand, fireFlowGpm, fireStreams, GAL_FT3, gpmToLpm, STREAM_GPM, STREAM_LPM } from '../engine/demand'
import { dAtWell, dupuitK, dupuitQ, kObsUnconfined, qObsConfined, storageVolume, thiemK, thiemQ, unconfinedInterferenceChain, wellEffect, type Aquifer } from '../engine/wells'
import type { EvPartMap } from '../types'

const tx = String.raw
/** number with thousands separators */
const n = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const g = (v: number, p = 4) => String(+v.toPrecision(p))

function Sheet({ children, final }: { children: ReactNode; final: string }) {
  return (
    <div className="space-y-3">
      {children}
      <div className="rounded-lg border border-accent/60 bg-accent/10 px-3 py-2 font-semibold text-sm">Answer: {final}</div>
    </div>
  )
}
const Doc = ({ md }: { md: string }) => <Md className="text-sm">{md}</Md>

// ================================================================ population markdown blocks
export const censusTable = (c: Census[], unit: string) => `| Year | ${c.map((p) => p.year).join(' | ')} |\n|---|${c.map(() => '---').join('|')}|\n| Population (${unit}) | ${c.map((p) => g(p.pop, 6)).join(' | ')} |`

export function geomMd(c: Census[], targets: number[], u: string, d = 0, mode: 'end' | 'last' = 'end') {
  const m = geometric(c, mode)
  const a = mode === 'end' ? c[0] : c[c.length - 2]
  const z = c[c.length - 1]
  const nn = z.year - a.year
  const r = m.params.r
  const rows = targets.map((T) => `| ${T} | ${T} − ${z.year} = ${T - z.year} | $${g(z.pop, 6)}\\times(1+${r.toFixed(5)})^{${T - z.year}}$ | **${n(m.at(T), d)}** |`).join('\n')
  return {
    m,
    md: [
      tx`**Geometric increase** (her slide: geometric *mean* increase, ${mode === 'end' ? 'first and last census, "skip the middle data"' : 'last two censuses'}): $P_f = P_p(1+r)^n$, where $r$ is the constant yearly rate and $n$ the number of years.`,
      tx`1. Rate from ${a.year} to ${z.year} ($n=${z.year}-${a.year}=${nn}$ years): $${g(z.pop, 6)}=${g(a.pop, 6)}(1+r)^{${nn}}$, so $r=\left(\dfrac{${g(z.pop, 6)}}{${g(a.pop, 6)}}\right)^{1/${nn}}-1=${r.toFixed(5)}$ (${(r * 100).toFixed(3)} % per year)`,
      tx`2. Project from the latest census (${z.year}); $n$ = years after ${z.year}:`,
      `| Year | n | $P_{${z.year}}(1+r)^n$ | P (${u}) |\n|---|---|---|---|\n${rows}`,
    ].join('\n\n'),
  }
}

const neg = (v: number, dp: number) => (v < 0 ? `(${v.toFixed(dp)})` : v.toFixed(dp))

export function decrMd(c: Census[], targets: number[], u: string, d = 0) {
  const gr = growthRates(c)
  const m = decreasing(c)
  const z = c[c.length - 1]
  const rows = gr.rates
    .map((r, i) => {
      const inc = c[i + 1].pop - c[i].pop
      return `| ${c[i].year}–${c[i + 1].year} | ${g(c[i + 1].pop, 6)} − ${g(c[i].pop, 6)} = ${g(inc, 5)} | ${g(inc, 5)} ÷ ${g(c[i].pop, 6)} × 100 = **${r.toFixed(2)} %** | ${i ? `${gr.rates[i - 1].toFixed(2)} − ${r.toFixed(2)} = ${gr.dec[i - 1].toFixed(2)}` : '–'} |`
    })
    .join('\n')
  const last = Math.max(...targets)
  const st = m.steps(last)
  let prevR = gr.rates[gr.rates.length - 1]
  let prevP = z.pop
  const stepRows = st
    .map((s) => {
      const row = `| ${s.year} | ${prevR.toFixed(3)} − ${neg(gr.s, 3)} = **${s.r.toFixed(3)} %** | ${n(prevP, d)} + ${s.r.toFixed(3)}/100 × ${n(prevP, d)} = **${n(s.pop, d)}** |`
      prevR = s.r
      prevP = s.pop
      return row
    })
    .join('\n')
  return {
    m,
    st,
    md: [
      tx`**Decreasing rate of growth** (her formula): $P_n = P_{n-1} + \dfrac{r_{n-1}-s}{100}P_{n-1}$, where $s$ = average decrease in the growth rate (decrease taken positive; if the rate has been rising, $s$ is negative). The idea: the town's growth rate keeps slowing by about the same amount every decade, so each future decade's rate is the previous one minus $s$.`,
      tx`1. Growth rate of each decade, $r=\dfrac{\text{increase}}{\text{population at the start}}\times100$, and how much it fell from the decade before:`,
      `| Decade | Increase | Growth rate r | Decrease (previous r − this r) |\n|---|---|---|---|\n${rows}`,
      tx`2. Average decrease: $s=\dfrac{${gr.dec.map((v) => neg(v, 2)).join('+')}}{${gr.dec.length}} = ${gr.s.toFixed(3)}$ % per decade`,
      tx`3. Project decade by decade from ${z.year} (${n(z.pop, d)} ${u}), starting from the last decade's rate ${gr.rates[gr.rates.length - 1].toFixed(2)} % and taking $s$ off each time:`,
      `| Year | Rate used = previous r − s | P = P(prev) + r/100 × P(prev) (${u}) |\n|---|---|---|\n${stepRows}`,
    ].join('\n\n'),
    pop: (T: number) => st.find((s) => s.year === T)?.pop ?? m.at(T),
  }
}

/** least-squares parabola with the coded x (…, −1, 0, 1 …), as the seniors' note lays it out */
export function lsMd(c: Census[], targets: number[], u: string, d = 1) {
  const f = polyFit(c, 2)
  const xs = c.map((p) => (p.year - f.x0) / f.h)
  const sx = (k: number) => xs.reduce((s, x) => s + x ** k, 0)
  const sxy = (k: number) => xs.reduce((s, x, i) => s + x ** k * c[i].pop, 0)
  const q = (v: number) => +v.toFixed(2)
  const row = (p: Census, i: number) => `| ${p.year} | ${g(p.pop, 6)} | ${q(xs[i])} | ${q(xs[i] ** 2)} | ${q(xs[i] ** 4)} | ${q(xs[i])} × ${g(p.pop, 6)} = ${q(xs[i] * p.pop)} | ${q(xs[i] ** 2)} × ${g(p.pop, 6)} = ${q(xs[i] ** 2 * p.pop)} |`
  const N = c.length
  const [a, b, cc] = f.coef
  const sym = Math.abs(sx(1)) < 1e-9 && Math.abs(sx(3)) < 1e-9
  const SY = c.reduce((s, p) => s + p.pop, 0)
  const solve = sym
    ? [
        tx`4. Solve. The middle equation has $b$ alone: $b=\dfrac{\Sigma xY}{\Sigma x^2}=\dfrac{${q(sxy(1))}}{${q(sx(2))}}=${b.toFixed(3)}$`,
        tx`5. The first and third hold $a$ and $c$. Multiply the first by $\Sigma x^2$, the third by $N$, and subtract, so $a$ drops out:`,
        tx`$$c=\dfrac{N\,\Sigma x^2Y-\Sigma x^2\,\Sigma Y}{N\,\Sigma x^4-(\Sigma x^2)^2}=\dfrac{${N}(${q(sxy(2))})-${q(sx(2))}(${g(SY, 6)})}{${N}(${q(sx(4))})-${q(sx(2))}^2}=\dfrac{${q(N * sxy(2) - sx(2) * SY)}}{${q(N * sx(4) - sx(2) ** 2)}}=${cc.toFixed(3)}$$`,
        tx`6. Back in the first: $a=\dfrac{\Sigma Y-c\,\Sigma x^2}{N}=\dfrac{${g(SY, 6)}-${cc.toFixed(3)}\times${q(sx(2))}}{${N}}=${a.toFixed(3)}$`,
      ]
    : [tx`4. Solving the three equations together: $a=${a.toFixed(3)},\ b=${b.toFixed(3)},\ c=${cc.toFixed(3)}$`]
  const fRows = targets
    .map((T) => {
      const x = q((T - f.x0) / f.h)
      return `| ${T} | (${T} − ${f.x0}) ÷ ${f.h} = ${x} | $${a.toFixed(3)}+${b.toFixed(3)}(${x})+${cc.toFixed(3)}(${x})^2$ | **${n(f.at(T), d)}** |`
    })
    .join('\n')
  return {
    f,
    md: [
      tx`**Least-squares parabola** $Y=a+bx+cx^2$: the parabola that passes closest to all the census points (smallest sum of squared misses). Code the year as $x=(\text{year}-${f.x0})/${f.h}$ about the middle census, so that $\Sigma x=\Sigma x^3=0$ and the hand work halves.`,
      tx`1. Tabulate $x$, $x^2$, $x^4$, $xY$, $x^2Y$ for every census and add each column:`,
      `| Year | Y | x | x² | x⁴ | xY | x²Y |\n|---|---|---|---|---|---|---|\n${c.map(row).join('\n')}\n| **Σ** | **${g(SY, 6)}** | **${q(sx(1))}** | **${q(sx(2))}** | **${q(sx(4))}** | **${q(sxy(1))}** | **${q(sxy(2))}** |`,
      tx`2. Normal equations (N = ${N}): ${
        sym
          ? tx`$\Sigma Y = Na + c\Sigma x^2$, $\ \Sigma xY = b\Sigma x^2$, $\ \Sigma x^2Y = a\Sigma x^2 + c\Sigma x^4$`
          : tx`$\Sigma Y=Na+b\Sigma x+c\Sigma x^2$, $\Sigma xY=a\Sigma x+b\Sigma x^2+c\Sigma x^3$, $\Sigma x^2Y=a\Sigma x^2+b\Sigma x^3+c\Sigma x^4$`
      }`,
      tx`3. With the column sums: $${g(SY, 6)} = ${N}a + ${q(sx(2))}c,\quad ${q(sxy(1))} = ${q(sx(2))}b,\quad ${q(sxy(2))} = ${q(sx(2))}a + ${q(sx(4))}c$`,
      ...solve,
      tx`So $Y=${a.toFixed(3)}+${b.toFixed(3)}x+${cc.toFixed(3)}x^2$. To forecast, put each year's $x$ in:`,
      `| Year | x | a + bx + cx² | P (${u}) |\n|---|---|---|---|\n${fRows}`,
    ].join('\n\n'),
  }
}

// ---- fire block
export function fireMd(Pth: number, year: number | string, withFlow = true, storageH = 0) {
  const kui = fireFlowGpm('kuichling', Pth)
  const st = fireStreams(Pth)
  return [
    tx`**Fire demand (Kuichling).** $P$ in thousands: $P=${n(Pth, 2)}$ in ${year}.`,
    withFlow
      ? tx`- Flow: $Q=700\sqrt{P}=700\sqrt{${n(Pth, 2)}}=$ **${n(kui)} gpm** = ${n(gpmToLpm(kui))} L/min = ${n((gpmToLpm(kui) * 1440) / 1000)} m³/day (US gallons, 250 gpm ≈ 950 L/min per stream; textbooks write $3182\sqrt P$ L/min with Imperial gallons = ${n(3182 * Math.sqrt(Pth))} L/min).`
      : '',
    tx`- Streams: $N=2.8\sqrt{P}=2.8\sqrt{${n(Pth, 2)}}=${st.exact.toFixed(2)}$ → **${st.n} streams** (round up).`,
    withFlow ? tx`- Check, N streams of 250 gpm: ${st.n} × 250 = ${n(st.totalGpm)} gpm (= ${n(st.totalLpm)} L/min at 950 L/min each); $700\sqrt P$ is the same thing before N is rounded up.` : '',
    storageH ? tx`- Storage for ${storageH} h: ${n(st.totalLpm)} L/min × 60 × ${storageH} = **${n((st.totalLpm * 60 * storageH) / 1000)} m³**.` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

const NOTE_FIRE = 'Kuichling’s fire formulas (and N = 2.8√P streams) are not in this term’s slides: taken from the seniors’ notes (Delwar sir) and the textbook.'

// ================================================================ parts: population / demand
// ---- 2007-08 Q8(c)
const c0708: Census[] = [{ year: 1990, pop: 55000 }, { year: 2000, pop: 67500 }]
const g0708 = geometric(c0708, 'end')
const P0708 = g0708.at(2015)
const f0708 = fireDemand(P0708 / 1000)
const final0708 = `r = ${(g0708.params.r * 100).toFixed(2)} %/yr; P2015 = ${n(P0708)}; fire Q = ${n(f0708.kuichlingGpm)} gpm (${n(f0708.kuichlingLpm)} L/min); ${f0708.streams.n} streams`
function Sol0708() {
  const gm = geomMd(c0708, [2015], 'persons')
  return (
    <Sheet final={final0708}>
      <Doc md={[`### Given`, censusTable(c0708, 'persons'), `### Assumptions`, `- "Empirical method" = the geometric increase method (Hardenberg's empirical method, her "most widely used" one). Two censuses, so end-to-end = last two.\n- Fire demand by Kuichling for the population of 2015; streams N = 2.8√P.`, `### Steps`, gm.md].join('\n\n')} />
      <PopWorkChart c={c0708} curves={[{ label: 'geometric', at: g0708.at }]} targets={[2015]} unit="persons" />
      <Doc md={[`### Fire demand 2015`, fireMd(P0708 / 1000, 2015)].join('\n\n')} />
    </Sheet>
  )
}

// ---- 2008-09 Q3 (all five asks)
const c0809: Census[] = [0.9, 1.2, 1.4, 1.8].map((l, i) => ({ year: 1980 + 10 * i, pop: l * 1e5 }))
const g0809 = geometric(c0809, 'end')
const P0809 = g0809.at(2018)
const ar0809 = arithmetic(c0809).at(2018)
const inc0809 = incremental(c0809).at(2018)
const arK0809 = arithmetic(c0809).params.K
const incP0809 = incremental(c0809).params
const inc0809d = c0809.slice(1).map((p, i) => p.pop - c0809[i].pop)
const f0809 = fireDemand(P0809 / 1000)
const avg0809 = 40 * P0809 // gal/day
const avgGpm0809 = avg0809 / 1440
const totGpm0809 = avgGpm0809 + f0809.kuichlingGpm
const V0809 = (avg0809 * 6) / 24 // gallons
const V0809ft3 = V0809 / GAL_FT3
const tank0809 = economicTank(V0809ft3, 200, 250)
const final0809 = `P2018 ≈ ${n(P0809)}; fire ${n(f0809.kuichlingGpm)} gpm, ${f0809.streams.n} streams; total ${n(totGpm0809)} gpm (${n(avg0809 / 1e6, 2)} Mgpd average + fire); tank V = ${n(V0809ft3)} ft³, D = ${n(tank0809.D, 1)} ft, H = ${n(tank0809.H, 1)} ft`
function Sol0809() {
  const gm = geomMd(c0809, [2018], 'persons')
  return (
    <Sheet final={final0809}>
      <Doc
        md={[
          `### Given`,
          censusTable(c0809, 'lac') + `\n\n(1 lac = 100,000: 90,000; 120,000; 140,000; 180,000.) Average consumption 40 gpcd; floor Tk 200/sft, wall Tk 250/sft; 6 h detention.`,
          `### Assumptions`,
          `- The paper does not name the method. Geometric is her most-used method for a Bangladesh town over a short interval, so it is adopted; the others are shown to compare.\n- Gallons are US gallons (the same unit as the Kuichling gpm). The tank has no roof cost.\n- "Including fire demand": the fire flow is a *rate* needed on top of the average flow, so the two are added in gpm.`,
          `### (i) Population 2018`,
          gm.md,
          `For comparison, the two other short-term methods on the same data:`,
          tx`- Arithmetic: $K=\dfrac{180{,}000-90{,}000}{2010-1980}=${n(arK0809)}$ per year, $P_{2018}=180{,}000+${n(arK0809)}\times8=${n(ar0809)}$`,
          tx`- Incremental increase: increases per decade ${inc0809d.map((v) => n(v)).join(', ')} → mean $X=${n(incP0809.X)}$; their changes ${inc0809d.slice(1).map((v, i) => n(v - inc0809d[i])).join(', ')} → mean $Y=${n(incP0809.Y)}$; $n=8/10=0.8$ decade: $P=180{,}000+0.8(${n(incP0809.X)})+\dfrac{0.8(1.8)}{2}(${n(incP0809.Y)})=${n(inc0809)}$`,
          `| Method | P 2018 |\n|---|---|\n| Arithmetic | ${n(ar0809)} |\n| **Geometric (adopted)** | **${n(P0809)}** |\n| Incremental increase | ${n(inc0809)} |`,
        ].join('\n\n')}
      />
      <PopWorkChart c={c0809} curves={[{ label: 'geometric (adopted)', at: g0809.at }, { label: 'arithmetic', at: arithmetic(c0809).at, dash: true }, { label: 'incremental increase', at: incremental(c0809).at, dash: true }]} targets={[2018]} unit="persons" />
      <Doc
        md={[
          `### (ii) Fire demand 2018`,
          fireMd(P0809 / 1000, 2018),
          `### (iv) Total requirement`,
          tx`Average: $40\times${n(P0809)}=${n(avg0809)}$ gal/day = ${n(avgGpm0809)} gpm. Fire: ${n(f0809.kuichlingGpm)} gpm. Total = ${n(avgGpm0809)} + ${n(f0809.kuichlingGpm)} = **${n(totGpm0809)} gpm** (equivalent to ${n((totGpm0809 * 1440) / 1e6, 1)} million gal/day if sustained for a day).`,
          `### (v) Most economic cylindrical tank (fire neglected)`,
          tx`Capacity for 6 h: $V=\dfrac{6}{24}\times${n(avg0809)}=${n(V0809)}$ gal $=${n(V0809)}/${GAL_FT3}=${n(V0809ft3)}$ ft³.`,
          tx`Cost $C=200\cdot\dfrac{\pi D^2}{4}+250\cdot\pi D H$, with $H=\dfrac{4V}{\pi D^2}$ → $C=50\pi D^2+\dfrac{1000V}{D}$.`,
          tx`$\dfrac{dC}{dD}=100\pi D-\dfrac{1000V}{D^2}=0\Rightarrow D^3=\dfrac{10V}{\pi}$ (general: $D^3=\dfrac{8c_wV}{\pi c_f}$), so $D=\left(\dfrac{10\times${n(V0809ft3)}}{\pi}\right)^{1/3}=$ **${n(tank0809.D, 1)} ft**, $H=\dfrac{4V}{\pi D^2}=$ **${n(tank0809.H, 1)} ft** ($H=0.4D$).`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}

// ---- Kuichling-only parts
const f1011 = fireStreams(164)
const final1011 = `N = 2.8√164 = ${f1011.exact.toFixed(2)} → ${f1011.n} streams (Q = ${n(fireFlowGpm('kuichling', 164))} gpm)`
function Sol1011() {
  return (
    <Sheet final={final1011}>
      <Doc md={[`### Given`, `Population 164,000 → $P=164$ (thousands).`, `### Assumptions`, `- Kuichling's number of simultaneous streams $N=2.8\\sqrt{P}$, rounded up to a whole stream.`, `### Steps`, fireMd(164, 'the city')].join('\n\n')} />
    </Sheet>
  )
}
const f2021 = fireDemand(10)
const final2021 = `Q = 700√10 = ${n(f2021.kuichlingGpm)} gpm (${n(f2021.kuichlingLpm)} L/min); ${f2021.streams.n} streams`
function Sol2021() {
  return (
    <Sheet final={final2021}>
      <Doc md={[`### Given`, `Population 10,000 → $P=10$ (thousands).`, `### Steps`, fireMd(10, 'the area')].join('\n\n')} />
    </Sheet>
  )
}
const f2223 = fireDemand(65, 5)
const final2223 = `${f2223.streams.n} streams, ${n(f2223.streamFlowLpm)} L/min; 5 h storage = ${n(f2223.storageL / 1000)} m³`
function Sol2223b() {
  return (
    <Sheet final={final2223}>
      <Doc
        md={[
          `### Given`,
          `Population 65,000 → $P=65$ thousand; one stream = 950 L/min; storage for 5 h.`,
          `### Assumptions`,
          `- Number of streams by Kuichling $N=2.8\\sqrt{P}$, rounded up. Total flow = N × 950 L/min (the paper gives the flow per stream, so it is used rather than 700√P gpm).`,
          `### Steps`,
          tx`1. $N=2.8\sqrt{65}=${f2223.streams.exact.toFixed(2)}$ → **${f2223.streams.n} streams**.`,
          tx`2. Total flow $=${f2223.streams.n}\times950=$ **${n(f2223.streamFlowLpm)} L/min** (${n(f2223.streamFlowLpm / 60, 1)} L/s).`,
          tx`3. Storage $=Q\,t=${n(f2223.streamFlowLpm)}\times60\times5=${n(f2223.storageL)}$ L $=$ **${n(f2223.storageL / 1000)} m³**.`,
          `For comparison, Kuichling's own flow 700√P = ${n(fireFlowGpm('kuichling', 65))} gpm = ${n(gpmToLpm(fireFlowGpm('kuichling', 65)))} L/min.`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}

// ---- least-squares parabola parts
const c1112: Census[] = [50.0, 58.0, 63.8, 85.8, 110.2].map((p, i) => ({ year: 1970 + 10 * i, pop: p }))
const ls1112 = polyFit(c1112, 2)
const P2013 = ls1112.at(2013)
const fF = fireDemand(P2013)
const fN = fireDemand(110.2)
const final1112 = `P2020 = ${n(ls1112.at(2020), 1)} thousand; fire demand 2013 (P = ${n(P2013, 1)} thousand) = ${n(fF.kuichlingGpm)} gpm; streams now (2010) = ${fN.streams.n}`
function Sol1112() {
  const ls = lsMd(c1112, [2020, 2013], 'thousand')
  return (
    <Sheet final={final1112}>
      <Doc
        md={[
          `### Given`,
          censusTable(c1112, 'thousand'),
          `### Assumptions`,
          `- Parabola fitted to all five censuses. 2013 is read off the same parabola.\n- "Present situation": the latest census, 2010, P = 110.2 thousand.`,
          `### Steps`,
          ls.md,
        ].join('\n\n')}
      />
      <PopWorkChart c={c1112} curves={[{ label: 'least-squares parabola', at: ls1112.at }]} targets={[2013, 2020]} unit="thousand" />
      <Doc
        md={[
          `### Fire demand for 2013 and the streams now`,
          fireMd(P2013, 2013, true),
          tx`Present (2010): $N=2.8\sqrt{110.2}=${fN.streams.exact.toFixed(2)}$ → **${fN.streams.n} streams**.`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}
function lsPart(c: Census[], targets: number[], unit: string, label: string) {
  const f = polyFit(c, 2)
  const final = targets.map((T) => `P${T} = ${n(f.at(T), 1)} ${unit}`).join('; ')
  const Sol = () => {
    const ls = lsMd(c, targets, unit)
    return (
      <Sheet final={final}>
        <Doc md={[`### Given`, censusTable(c, unit), `### Assumptions`, `- ${label}\n- Year coded about the middle census, so the sums of odd powers vanish and the three equations solve by hand.`, `### Steps`, ls.md].join('\n\n')} />
        <PopWorkChart c={c} curves={[{ label: 'least-squares parabola', at: f.at }]} targets={targets} unit={unit} />
      </Sheet>
    )
  }
  const checks = () => [
    ...targets.map((T) => ({ key: `p${T}`, label: `Forecast population $P_{${T}}$`, value: f.at(T), unit }))
  ]
  return { final, Sol, checks }
}
const c1213: Census[] = [25, 29, 38, 55, 80].map((p, i) => ({ year: 1970 + 10 * i, pop: p }))
const ls1213 = lsPart(c1213, [2020, 2030], 'million', 'Fitted to all five censuses.')
const c1718: Census[] = [20, 26, 34, 48, 70].map((p, i) => ({ year: 1970 + 10 * i, pop: p }))
const ls1718 = lsPart(c1718, [2020, 2030], 'million', 'Fitted to all five censuses (same data as the seniors’ worked example).')
const c2223: Census[] = [73, 80, 90, 102, 116].map((p, i) => ({ year: 1980 + 10 * i, pop: p }))
const ls2223 = lsPart(c2223, [2030, 2040], 'thousand', 'Fitted to all five censuses; the centre year is 2000.')

// ---- geometric + decreasing (2015-16 / 2016-17)
function geomDecrPart(pops: number[], target: number, fireYear?: number) {
  const c: Census[] = pops.map((p, i) => ({ year: 1970 + 10 * i, pop: p }))
  const gm = geometric(c, 'end')
  const gl = geometric(c, 'last')
  const dm = decreasing(c)
  const dpop = decrMd(c, [2020, target], 'million', 1).pop
  const incr = incremental(c).at(target)
  const fy = fireYear ? gm.at(fireYear) : undefined
  const fire = fy ? fireDemand(fy * 1000) : undefined
  const final =
    `geometric P${target} = ${n(gm.at(target), 1)} million (r = ${(gm.params.r * 100).toFixed(2)} %/yr); decreasing rate P${target} = ${n(dpop(target), 1)} million (s = ${dm.params.s.toFixed(2)} %)` +
    (fire ? `; fire ${fireYear}: P = ${n(fy!, 1)} million → ${n(fire.kuichlingGpm)} gpm, ${fire.streams.n} streams` : '')
  const Sol = () => {
    const g1 = geomMd(c, [target], 'million', 1)
    const d1 = decrMd(c, [2020, target], 'million', 1)
    return (
      <Sheet final={final}>
        <Doc
          md={[
            `### Given`,
            censusTable(c, 'million'),
            `### Assumptions`,
            `- "Change in increase rate method" is read as her **decreasing rate of growth** method (average change in the growth rate). The textbook incremental-increase method would give ${n(incr, 1)} million.\n- Geometric: first and last census (her slide convention). Using only the last two censuses (seniors' note) the rate is ${(gl.params.r * 100).toFixed(2)} % and P${target} = ${n(gl.at(target), 1)} million.` +
              (fireYear ? `\n- The fire demand year needs a population: the geometric forecast for ${fireYear} is used.` : ''),
            `### (a) Geometric progression`,
            g1.md,
            `### (b) Decreasing rate of growth`,
            d1.md,
          ].join('\n\n')}
        />
        <PopWorkChart c={c} curves={[{ label: 'geometric', at: gm.at }, { label: 'decreasing rate of growth', at: dm.at }]} targets={[target]} unit="million" />
        {fire && <Doc md={[`### Fire demand ${fireYear}`, tx`Population ${fireYear} (geometric): ${tx`$${g(c[c.length - 1].pop, 4)}(1+${gm.params.r.toFixed(5)})^{${fireYear! - 2010}}=${n(fy!, 2)}$`} million → $P=${n(fy! * 1000)}$ thousand.`, fireMd(fy! * 1000, fireYear!)].join('\n\n')} />}
      </Sheet>
    )
  }
  const checks = () => [
    { key: 'r', label: 'Geometric growth rate $r$', value: gm.params.r * 100, unit: '%/yr' },
    { key: 'pg', label: `Geometric forecast $P_{${target}}$`, value: gm.at(target), unit: 'million' },
    { key: 'pd', label: `Decreasing-rate forecast $P_{${target}}$`, value: dpop(target), unit: 'million' },
    ...(fire && fy ? [
      { key: 'pf', label: `Population in ${fireYear} (geometric)`, value: fy, unit: 'million' },
      { key: 'fire', label: `Kuichling fire demand ${fireYear}`, value: fire.kuichlingGpm, unit: 'gpm' },
    ] : []),
  ]
  return { final, Sol, checks }
}
const p1516 = geomDecrPart([25, 28.5, 39, 54, 75], 2030, 2020)
const p1617 = geomDecrPart([24, 28, 37.5, 52, 72], 2030)

// ---- Jan 2021 Q5(c)
const gr21 = annualGrowth(8.0, 2010, 12.0, 2020)
const final21 = `r = ${(gr21.geometric * 100).toFixed(2)} % per year (geometric); simple ${(gr21.arithmetic * 100).toFixed(1)} %/yr; K = ${(gr21.continuous * 100).toFixed(2)} %/yr`
function SolJan21() {
  return (
    <Sheet final={final21}>
      <Doc
        md={[
          `### Given`,
          `$P_{2010}=8.0$ million, $P_{2020}=12.0$ million, $n=10$ years.`,
          `### Assumptions`,
          `- Annual growth rate in her sense: the constant yearly rate of the geometric method, $P_f=P_p(1+r)^n$.`,
          `### Steps`,
          tx`1. $12.0=8.0(1+r)^{10}$ → $r=\left(\dfrac{12.0}{8.0}\right)^{1/10}-1=1.5^{0.1}-1=$ **${gr21.geometric.toFixed(5)}** = **${(gr21.geometric * 100).toFixed(2)} %** per year.`,
          `2. Other conventions, for comparison:\n- arithmetic (simple) rate $=\\dfrac{12-8}{8\\times10}=${(gr21.arithmetic * 100).toFixed(1)}$ % per year\n- constant-percentage $K=\\dfrac{\\ln(12/8)}{10}=${gr21.continuous.toFixed(5)}$ per year ($e^K-1$ = ${(Math.exp(gr21.continuous) - 1).toFixed(5)}, the same ${(gr21.geometric * 100).toFixed(2)} %)\n- absolute increase $=\\dfrac{12-8}{10}=${n(gr21.perYear * 1000)}$ thousand per year (the arithmetic method's K)`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}

// ================================================================ parts: groundwater
// ---- unconfined interference chain (five papers + the slide's Ex-3)
/** the worked steps of the chain (K from the unpumped well → R → both wells pumping), shared with the groundwater lab */
export function chainMd(p: { Q: number; D: number; s: number; rw: number; a: number; h: number; s2: number }, unit: string) {
  const c = unconfinedInterferenceChain(p)
  const { rw } = p
  return [
    `1. **Two points on the drawdown curve while one well pumps.** The pumped well's own water level is one point (at its wall, $r_1=r$); the unpumped well is an observation well that shows the curve's height at $r_2=a$. Heights are measured up from the impermeable base.`,
    `| point | distance from the pumped well | water depth above the base |\n|---|---|---|\n| pumped well | $r_1 = r = ${rw}$ m | $h_1 = d = D - s = ${p.D} - ${p.s} = ${c.d}$ m |\n| unpumped well | $r_2 = a = ${p.a}$ m | $h_2 = h = ${p.h}$ m |`,
    tx`2. **K from these two points** (Dupuit between $r_1$ and $r_2$): $K=\dfrac{Q\ln(r_2/r_1)}{\pi(h_2^2-h_1^2)}=\dfrac{${n(p.Q)}\ln(${p.a}/${rw})}{\pi(${p.h}^2-${c.d}^2)}=\dfrac{${n(p.Q)}\times${Math.log(p.a / rw).toFixed(4)}}{\pi\times${n(p.h * p.h - c.d * c.d, 2)}}=\dfrac{${n(p.Q * Math.log(p.a / rw), 1)}}{${n(Math.PI * (p.h * p.h - c.d * c.d), 2)}}=$ **${c.K.toFixed(3)}** ${unit} per m²`,
    tx`3. **Radius of influence** from the single-well test $Q=\dfrac{\pi K(D^2-d^2)}{\ln(R/r)}$, rearranged for $\ln(R/r)$: $\ln\dfrac{R}{r}=\dfrac{\pi K(D^2-d^2)}{Q}=\dfrac{\pi(${c.K.toFixed(3)})(${p.D}^2-${c.d}^2)}{${n(p.Q)}}=\dfrac{\pi(${c.K.toFixed(3)})(${n(p.D * p.D - c.d * c.d, 2)})}{${n(p.Q)}}=${c.lnRr.toFixed(3)}$ → $R=r\,e^{${c.lnRr.toFixed(3)}}=${rw}\times${n(Math.exp(c.lnRr), 1)}=$ **${n(c.R, 1)} m**`,
    tx`4. **Both wells pumped, drawdown ${p.s2} m in each.** Water depth in each well $d_2=D-s_2=${p.D}-${p.s2}=${c.d2}$ m. Each well now also sits in the other's cone ($a$ away), which is why $\ln(R/r)$ becomes $\ln\!\big(R^2/(r\,a)\big)$:`,
    tx`$$Q_1=Q_2=\dfrac{\pi K(D^2-d_2^2)}{\ln\!\big(R^2/(r\,a)\big)}=\dfrac{\pi(${c.K.toFixed(3)})(${p.D}^2-${c.d2}^2)}{\ln\!\big(${n(c.R, 1)}^2/(${rw}\times${p.a})\big)}=\dfrac{${n(c.num, 1)}}{${c.lnTerm.toFixed(3)}}=${n(c.each, 1)}\ \text{${unit}}$$`,
    tx`5. Together: $2\times${n(c.each, 1)}=$ **${n(c.total, 1)} ${unit}**. (One well alone at the same drawdown would give ${n(c.single, 1)} ${unit}; interference costs each well ${n((1 - c.each / c.single) * 100, 0)} % of its yield.)`,
  ].join('\n\n')
}

interface ChainIn { id: string; paper: string; dia_mm: number; Q: number; unit: string; D: number; s: number; a: number; h: number; s2: number }
function chainPart(p: ChainIn) {
  const rw = p.dia_mm / 2000
  const c = unconfinedInterferenceChain({ Q: p.Q, D: p.D, s: p.s, rw, a: p.a, h: p.h, s2: p.s2 })
  const final = `K = ${c.K.toFixed(2)} ${p.unit}/m²; R = ${n(c.R, 0)} m; each well ${n(c.each, 1)} ${p.unit}, both wells together ${n(c.total, 1)} ${p.unit}`
  const aq: Aquifer = { kind: 'unconfined', K: 1, thick: p.D, rw, R: c.R }
  const Sol = () => (
    <Sheet final={final}>
      <Doc
        md={[
          `### Given`,
          `Well diameter ${p.dia_mm} mm → $r=${rw}$ m (water-table = unconfined aquifer). Pumped alone: $Q=${n(p.Q)}$ ${p.unit}, drawdown ${p.s} m, static depth $D=${p.D}$ m, so the water depth in the pumped well is $d=${p.D}-${p.s}=${c.d}$ m. A similar well ${p.a} m away, not pumped, has water depth ${p.h} m. Both wells pumped together with drawdown ${p.s2} m each.`,
          `### Assumptions`,
          `- Dupuit (horizontal radial) flow; the unpumped well is an observation well at $r_2=a=${p.a}$ m; the two wells are identical and the pumping drawdowns add (superposition), so both yield the same $Q_1=Q_2$.\n- Interference formula as in her class notes: $\\pi K(D^2-d^2)/\\ln(R^2/ra)$ (the slide's printed 2π is a typo; her own Ex-3 answer needs π).\n- Q is kept in ${p.unit}, so K comes out in ${p.unit} per m².`,
          `### Sketch: one well pumping, the other watched`,
        ].join('\n\n')}
      />
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <WellSketch kind="unconfined" unit="m" rw={rw} R={c.R} D={p.D} d={c.d} s={p.s} obs={[{ r: p.a, h: p.h }]} />
      </div>
      <Doc md={[`### Steps`, chainMd({ Q: p.Q, D: p.D, s: p.s, rw, a: p.a, h: p.h, s2: p.s2 }, p.unit), `Both wells pumping (drawn from the engine; the dashed cones are each well alone, the solid line their sum):`].join('\n\n')} />
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <GwSection aq={{ ...aq, K: c.K }} wells={[{ x: 0, Q: c.each }, { x: p.a, Q: c.each }]} xr={[-Math.min(c.R, 6 * p.a), p.a + Math.min(c.R, 6 * p.a)]} />
      </div>
    </Sheet>
  )
  const checks = () => [
    { key: 'K', label: 'Permeability $K$ (from the observation well)', value: c.K, unit: `${p.unit}/m²` },
    { key: 'R', label: 'Radius of influence $R$', value: c.R, unit: 'm' },
    { key: 'each', label: 'Yield of each well when both pump', value: c.each, unit: p.unit },
    { key: 'tot', label: 'Both wells together', value: c.total, unit: p.unit },
  ]
  return { final, Sol, checks }
}
const ch0708 = chainPart({ id: '2007-08-1b', paper: '2007-08', dia_mm: 200, Q: 1000, unit: 'L/min', D: 50, s: 10, a: 7.5, h: 47, s2: 9.5 })
const ch0910 = chainPart({ id: '2009-10-5c', paper: '2009-10', dia_mm: 200, Q: 400, unit: 'gpm', D: 67, s: 12, a: 8, h: 61, s2: 12 })
const ch1112 = chainPart({ id: '2011-12-1b', paper: '2011-12', dia_mm: 300, Q: 1500, unit: 'L/min', D: 40, s: 8, a: 6, h: 37, s2: 7.5 })
const ch1213 = chainPart({ id: '2012-13-6b', paper: '2012-13', dia_mm: 300, Q: 1800, unit: 'L/min', D: 50, s: 10, a: 7.5, h: 47, s2: 9 })
const ch1718 = chainPart({ id: '2017-18-2b', paper: '2017-18', dia_mm: 150, Q: 2500, unit: 'L/min', D: 45, s: 8.5, a: 6.5, h: 42, s2: 8 })

// ---- 2010-11 Q7(d): confined, two observation drawdowns
const q1011 = qObsConfined({ K: 1e-3, b: 2.5, r1: 8, s1: 2.5, r2: 50, s2: 0.6 })
const final1011d = `Q = ${(q1011 * 1000).toFixed(2)} L/s = ${q1011.toFixed(5)} m³/s = ${n(q1011 * 86400, 0)} m³/day`
function Sol1011d() {
  return (
    <Sheet final={final1011d}>
      <Doc
        md={[
          `### Given`,
          `Confined aquifer, $b=2.5$ m, $K=10^{-3}$ m/s, well dia 0.4 m. Steady drawdowns $s_1=2.5$ m at $r_1=8$ m and $s_2=0.6$ m at $r_2=50$ m.`,
          `### Assumptions`,
          `- Thiem (steady, fully penetrating, confined). The well diameter is not needed: both drawdowns are measured away from the well.`,
          `### Steps`,
          tx`1. Thiem between the two observation points: $s_1-s_2=\dfrac{Q}{2\pi Kb}\ln\dfrac{r_2}{r_1}$ (the piezometric head difference $h_2-h_1=s_1-s_2$).`,
          tx`2. $Q=\dfrac{2\pi Kb(s_1-s_2)}{\ln(r_2/r_1)}=\dfrac{2\pi(10^{-3})(2.5)(2.5-0.6)}{\ln(50/8)}=\dfrac{${(2 * Math.PI * 1e-3 * 2.5 * 1.9).toFixed(5)}}{${Math.log(50 / 8).toFixed(4)}}=$ **${q1011.toFixed(5)} m³/s** (K in m/s and lengths in m, so Q comes out in m³/s)`,
          tx`3. $T=Kb=2.5\times10^{-3}$ m²/s. $Q=${q1011.toFixed(5)}\times1000=${(q1011 * 1000).toFixed(2)}$ L/s $=${q1011.toFixed(5)}\times86{,}400=${n(q1011 * 86400)}$ m³/day.`,
        ].join('\n\n')}
      />
      <WellSketch kind="confined" unit="m" rw={0.2} b={2.5} obs={[{ r: 8, s: 2.5 }, { r: 50, s: 0.6 }]} />
    </Sheet>
  )
}

// ---- 2021-22 Q6(b): unconfined single well
const q2122 = dupuitQ({ K: 40.5, D: 100, s: 20, rw: 0.15, R: 1000 })
const final2122 = `Q = ${n(q2122)} m³/day (${(q2122 / 86.4).toFixed(1)} L/s)`
function Sol2122() {
  return (
    <Sheet final={final2122}>
      <Doc
        md={[
          `### Given`,
          `Unconfined, well dia 300 mm → $r=0.15$ m; $D=100$ m (depth of water below the table), drawdown 20 m → $d=80$ m; $K=40.5$ m³/m²/day; $R=1000$ m.`,
          `### Assumptions`,
          `- The expression is Dupuit's (derivation is the theory part of this question).`,
          `### Steps`,
          tx`1. $Q=\dfrac{\pi K(D^2-d^2)}{\ln(R/r)}$`,
          tx`2. $D^2-d^2=100^2-80^2=3600$ m²; $\ln(R/r)=\ln(1000/0.15)=${Math.log(1000 / 0.15).toFixed(4)}$`,
          tx`3. $Q=\dfrac{\pi(40.5)(3600)}{${Math.log(1000 / 0.15).toFixed(4)}}=\dfrac{${n(Math.PI * 40.5 * 3600)}}{${Math.log(1000 / 0.15).toFixed(4)}}=$ **${n(q2122)} m³/day**`,
          `4. Specific capacity $=Q/s=${n(q2122 / 20)}$ m³/day per metre of drawdown.`,
        ].join('\n\n')}
      />
      <WellSketch kind="unconfined" unit="m" rw={0.15} R={1000} D={100} d={80} s={20} />
    </Sheet>
  )
}

// ---- 2022-23 Q5(a)
const Q2223 = 950 * 1.44 // m³/day
const K2223wrong = thiemK({ Q: Q2223, b: 35, s: 7.5, rw: 0.15, R: 950 })
const K2223r = thiemK({ Q: Q2223, b: 35, s: 7.5, rw: 0.075, R: 950 })
const final2223a2 = `K = ${K2223r.toFixed(2)} m/day (= ${(K2223r / 86400).toExponential(2)} m/s)`
function Sol2223a() {
  return (
    <Sheet final={final2223a2}>
      <Doc
        md={[
          `### Given`,
          `Confined aquifer $b=35$ m, well dia 0.15 m (r = 0.075 m), $Q=950$ L/min, drawdown $s=7.5$ m, $R=950$ m, static level 65 m above the aquifer bottom.`,
          `### Assumptions`,
          `- 6 in = 0.15 m is the *diameter* (the paper says so), so $r=0.075$ m. The static level 65 m is not needed in the confined formula: only the drawdown $D-d=s$ enters.`,
          `### Steps`,
          `1. Units: $Q=950$ L/min $=0.95\\times1440=${n(Q2223, 1)}$ m³/day.`,
          tx`2. Thiem: $Q=\dfrac{2\pi Kb(D-d)}{\ln(R/r)}$ → $K=\dfrac{Q\ln(R/r)}{2\pi b\,s}$`,
          tx`3. $\ln(R/r)=\ln(950/0.075)=${Math.log(950 / 0.075).toFixed(4)}$`,
          tx`4. $K=\dfrac{${n(Q2223, 1)}\times${Math.log(950 / 0.075).toFixed(4)}}{2\pi(35)(7.5)}=\dfrac{${n(Q2223 * Math.log(950 / 0.075))}}{${n(2 * Math.PI * 35 * 7.5, 1)}}=$ **${thiemK({ Q: Q2223, b: 35, s: 7.5, rw: 0.075, R: 950 }).toFixed(2)} m/day**`,
          `5. Check on the reading: if 0.15 m were wrongly used as the radius, $K$ would be ${K2223wrong.toFixed(2)} m/day (about ${((1 - K2223wrong / K2223r) * 100).toFixed(0)} % lower), so say which you used.`,
        ].join('\n\n')}
      />
      <WellSketch kind="confined" unit="m" rw={0.075} R={950} b={35} s={7.5} />
    </Sheet>
  )
}

// ---- 2022-23 Q5(b): storage volume
const V2223b = storageVolume(0.14, 23e6, 2.6)
const final2223b = `ΔV = ${(V2223b / 1e6).toFixed(3)} × 10⁶ m³ (${n(V2223b)} m³)`
function Sol2223bS() {
  return (
    <Sheet final={final2223b}>
      <Doc
        md={[
          `### Given`,
          `Unconfined aquifer: $S_y=0.14$, area $A=23$ km² $=23\\times10^6$ m², water-table drop $\\Delta h=2.6$ m.`,
          `### Assumptions`,
          `- Unconfined storage is almost entirely specific yield ($S=S_y+S_sb\\approx S_y$); the volume released is that drained by gravity.`,
          `### Steps`,
          tx`1. $V=S_y\,A\,\Delta h$ (confined aquifers use the storativity $S$ the same way).`,
          tx`2. $V=0.14\times23\times10^6\times2.6=$ **${(V2223b / 1e6).toFixed(3)}\times10^6$ m³** $\approx 8.4$ million m³ lost from storage.`,
        ].join('\n\n')}
      />
    </Sheet>
  )
}

// ---- 2023-24 Q7(b)
const p2324 = { K: 0.001, b: 100, s: 18, rw: 0.5, R: 80 }
const Q2324 = thiemQ(p2324)
const aq2324: Aquifer = { kind: 'confined', K: 0.001, thick: 100, D: 430, rw: 0.5, R: 80 }
const add2324 = wellEffect(aq2324, Q2324, 30)
const final2324 = `Q = ${Q2324.toFixed(3)} ft³/s (${n(Q2324 * 448.831)} gpm); both wells: drawdown ${(18 + add2324).toFixed(2)} ft, i.e. ${add2324.toFixed(2)} ft more than alone`
function Sol2324() {
  return (
    <Sheet final={final2324}>
      <Doc
        md={[
          `### Given`,
          `Confined aquifer between two aquitards (figure): static level 430 ft above the aquifer bottom, aquifer 330 ft thick, each well screened for the top 100 ft of it. Wells 12 in dia → $r=0.5$ ft, 30 ft apart. Single well: drawdown $s=18$ ft, diameter of influence 160 ft → $R=80$ ft. $K=0.001$ ft³/s·ft² (= ft/s).`,
          `### Assumptions`,
          tx`- The wells only partly penetrate the aquifer: water enters through the 100 ft screens, so $b=100$ ft (the screened length) goes in the Thiem equation. Using the full 330 ft instead gives $Q=\dfrac{2\pi(0.001)(330)(18)}{\ln 160}=${thiemQ({ ...p2324, b: 330 }).toFixed(2)}$ ft³/s; say which one you use.
- Both wells pump the same $Q$ as the single well did; drawdowns superpose; $R=80$ ft applies to each cone. Part (ii) does not depend on $b$: $\Delta s = s\,\ln(R/a)/\ln(R/r)$.`,
          `### (i) Flow of one well`,
          tx`$Q=\dfrac{2\pi Kb\,s}{\ln(R/r)}=\dfrac{2\pi(0.001)(100)(18)}{\ln(80/0.5)}=\dfrac{${(2 * Math.PI * 0.001 * 100 * 18).toFixed(3)}}{${Math.log(160).toFixed(3)}}=$ **${Q2324.toFixed(3)} ft³/s** ($\approx$ ${n(Q2324 * 448.831)} gpm)`,
          `### (ii) Both wells operating`,
          tx`Extra drawdown at well 1 from well 2 (30 ft away): $\Delta s=\dfrac{Q}{2\pi Kb}\ln\dfrac{R}{a}=\dfrac{${Q2324.toFixed(3)}}{2\pi(0.001)(100)}\ln\dfrac{80}{30}=${(Q2324 / (2 * Math.PI * 0.001 * 100)).toFixed(2)}\times${Math.log(80 / 30).toFixed(4)}=$ **${add2324.toFixed(2)} ft**`,
          tx`Total drawdown in each well $=18+${add2324.toFixed(2)}=$ **${(18 + add2324).toFixed(2)} ft** (so the pumping level falls ${add2324.toFixed(2)} ft further; equivalently $s=\dfrac{Q}{2\pi Kb}\ln\dfrac{R^2}{ra}$).`,
        ].join('\n\n')}
      />
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <GwSection aq={aq2324} wells={[{ x: 0, Q: Q2324 }, { x: 30, Q: Q2324 }]} xr={[-80, 110]} />
      </div>
    </Sheet>
  )
}

// ================================================================ the map
const FIRE_FLAG = NOTE_FIRE
export const SN_MATH: Record<string, EvPartMap> = {
  'ev-2007-08-8c': { topics: ['ev-pop', 'ev-demand'], ans: [], final: final0708, Sol: Sol0708, from: ['ce22', 'seniors', 'textbook'], flag: FIRE_FLAG, notes: ['"Empirical method" is read as the geometric increase method.'], checks: () => [
    { key: 'r', label: 'Geometric growth rate $r$', value: g0708.params.r * 100, unit: '%/yr' },
    { key: 'p', label: 'Population in 2015, $P_{2015}$', value: P0708, unit: 'persons' },
    { key: 'q', label: 'Kuichling fire demand $Q=700\\sqrt{P}$', value: f0708.kuichlingGpm, unit: 'gpm' },
    { key: 'n', label: 'Number of fire streams $N$', value: f0708.streams.n },
  ] },
  'ev-2008-09-3': { topics: ['ev-pop', 'ev-demand'], ans: [], final: final0809, Sol: Sol0809, from: ['ce22', 'seniors', 'textbook'], flag: FIRE_FLAG, notes: ['The paper does not name the population method: geometric adopted, arithmetic and incremental shown.', '(iv) adds the fire flow as a rate (gpm) to the average flow.', 'US gallons assumed; the tank has no roof cost.'], checks: () => [
    { key: 'p', label: 'Geometric forecast $P_{2018}$', value: P0809, unit: 'persons' },
    { key: 'fire', label: 'Kuichling fire demand 2018', value: f0809.kuichlingGpm, unit: 'gpm' },
    { key: 'tot', label: 'Total requirement (average + fire)', value: totGpm0809, unit: 'gpm' },
    { key: 'D', label: 'Most economic tank diameter $D$', value: tank0809.D, unit: 'ft' },
    { key: 'H', label: 'Tank height $H$', value: tank0809.H, unit: 'ft' },
  ] },
  'ev-2010-11-1c': { topics: ['ev-demand'], ans: [], final: final1011, Sol: Sol1011, from: ['seniors', 'textbook'], flag: FIRE_FLAG, checks: () => [
    { key: 'n', label: 'Number of fire streams $N=2.8\\sqrt{P}$', value: f1011.n },
    { key: 'q', label: 'Kuichling fire flow', value: fireFlowGpm('kuichling', 164), unit: 'gpm' },
  ] },
  'ev-2011-12-7': { topics: ['ev-pop', 'ev-demand'], ans: [], final: final1112, Sol: Sol1112, from: ['seniors', 'textbook'], flag: 'Least-squares parabola and Kuichling are not in the CE22 slides: from the seniors’ notes and the textbook.', notes: ['"Present situation" read as the 2010 census population.'], checks: () => [
    { key: 'p20', label: 'Parabola forecast $P_{2020}$', value: ls1112.at(2020), unit: 'thousand' },
    { key: 'p13', label: 'Population 2013, $P_{2013}$', value: P2013, unit: 'thousand' },
    { key: 'q', label: 'Kuichling fire demand 2013', value: fF.kuichlingGpm, unit: 'gpm' },
    { key: 'n', label: 'Streams now (2010)', value: fN.streams.n },
  ] },
  'ev-2012-13-5b': { topics: ['ev-pop'], ans: [], final: ls1213.final, Sol: ls1213.Sol, checks: ls1213.checks, from: ['seniors'], flag: 'Least-squares parabola is not in the CE22 slides: from the seniors’ notes (Delwar sir).' },
  'ev-2015-16-1b': { topics: ['ev-pop', 'ev-demand'], ans: [], final: p1516.final, Sol: p1516.Sol, checks: p1516.checks, from: ['ce22', 'seniors', 'textbook'], flag: FIRE_FLAG, notes: ['"Change in increase rate method" read as the decreasing growth rate method.', 'Fire year 2020 uses the geometric forecast.'] },
  'ev-2016-17-1b': { topics: ['ev-demand', 'ev-pop'], ans: [], final: p1617.final, Sol: p1617.Sol, checks: p1617.checks, from: ['ce22'], notes: ['"Change in increase rate method" read as the decreasing growth rate method.'] },
  'ev-2017-18-1b': { topics: ['ev-demand', 'ev-pop'], ans: [], final: ls1718.final, Sol: ls1718.Sol, checks: ls1718.checks, from: ['seniors'], flag: 'Least-squares parabola is not in the CE22 slides: from the seniors’ notes (Delwar sir).' },
  'ev-jan-2021-5c': { topics: ['ev-pop'], ans: [], final: final21, Sol: SolJan21, from: ['ce22'], checks: () => [
    { key: 'r', label: 'Geometric growth rate $r$', value: gr21.geometric * 100, unit: '%/yr' },
    { key: 'ra', label: 'Simple (arithmetic) rate', value: gr21.arithmetic * 100, unit: '%/yr' },
    { key: 'K', label: 'Constant-percentage $K=\\ln(P_2/P_1)/n$', value: gr21.continuous * 100, unit: '%/yr' },
  ] },
  'ev-2020-21-1c': { topics: ['ev-demand', 'ev-pop'], ans: [], final: final2021, Sol: Sol2021, from: ['seniors', 'textbook'], flag: FIRE_FLAG, checks: () => [
    { key: 'q', label: 'Kuichling fire demand $Q=700\\sqrt{P}$', value: f2021.kuichlingGpm, unit: 'gpm' },
    { key: 'n', label: 'Number of fire streams $N$', value: f2021.streams.n },
  ] },
  'ev-2022-23-6b': { topics: ['ev-demand'], ans: [], final: final2223, Sol: Sol2223b, from: ['seniors', 'textbook'], flag: FIRE_FLAG, checks: () => [
    { key: 'n', label: 'Number of streams $N=2.8\\sqrt{P}$', value: f2223.streams.n },
    { key: 'q', label: 'Total fire flow $N\\times950$', value: f2223.streamFlowLpm, unit: 'L/min' },
    { key: 'v', label: 'Storage for 5 h', value: f2223.storageL / 1000, unit: 'm³' },
  ] },
  'ev-2022-23-7a': { topics: ['ev-pop'], ans: [], final: ls2223.final, Sol: ls2223.Sol, checks: ls2223.checks, from: ['seniors'], flag: 'Least-squares parabola is not in the CE22 slides: from the seniors’ notes (Delwar sir).' },
  'ev-2007-08-1b': { topics: ['ev-gw'], ans: [], final: ch0708.final, Sol: ch0708.Sol, checks: ch0708.checks, from: ['ce22'] },
  'ev-2009-10-5c': { topics: ['ev-gw'], ans: [], final: ch0910.final, Sol: ch0910.Sol, checks: ch0910.checks, from: ['ce22'], notes: ['Q stays in gpm throughout; K is in gpm/m².'] },
  'ev-2011-12-1b': { topics: ['ev-gw'], ans: [], final: ch1112.final, Sol: ch1112.Sol, checks: ch1112.checks, from: ['ce22'] },
  'ev-2012-13-6b': { topics: ['ev-gw'], ans: [], final: ch1213.final, Sol: ch1213.Sol, checks: ch1213.checks, from: ['ce22'] },
  'ev-2017-18-2b': { topics: ['ev-gw'], ans: [], final: ch1718.final, Sol: ch1718.Sol, checks: ch1718.checks, from: ['ce22'] },
  'ev-2010-11-7d': { topics: ['ev-gw'], ans: [], final: final1011d, Sol: Sol1011d, from: ['ce22'], checks: () => [
    { key: 'q', label: 'Well discharge $Q$', value: q1011 * 1000, unit: 'L/s' },
    { key: 'qd', label: 'Discharge per day', value: q1011 * 86400, unit: 'm³/day' },
  ] },
  'ev-2021-22-6b': { topics: ['ev-gw'], ans: [], final: final2122, Sol: Sol2122, from: ['ce22'], checks: () => [
    { key: 'q', label: 'Well discharge $Q$ (Dupuit)', value: q2122, unit: 'm³/day' },
    { key: 'qs', label: 'Specific capacity $Q/s$', value: q2122 / 20, unit: 'm³/day per m' },
  ] },
  'ev-2022-23-5a': { topics: ['ev-gw'], ans: [], final: final2223a2, Sol: Sol2223a, from: ['ce22'], notes: ['6 in = 0.15 m is the diameter, so r = 0.075 m (taking 0.15 as the radius would lower K by about 7 %).'], checks: () => [
    { key: 'Q', label: 'Discharge $Q$', value: Q2223, unit: 'm³/day' },
    { key: 'K', label: 'Permeability $K$', value: K2223r, unit: 'm/day' },
  ] },
  'ev-2022-23-5b': { topics: ['ev-gw'], ans: [], final: final2223b, Sol: Sol2223bS, from: ['ce22'], checks: () => [
    { key: 'V', label: 'Volume released $\\Delta V=S_yA\\Delta h$', value: V2223b / 1e6, unit: '×10⁶ m³' },
  ] },
  'ev-2023-24-7b': { topics: ['ev-gw'], ans: [], final: final2324, Sol: Sol2324, from: ['ce22'], notes: ['Figure (read at 300 dpi): 430 ft static level to aquifer bottom, 330 ft aquifer thickness, 100 ft from the aquifer top to the screen bottom. b = 100 ft (screened length) is used; with b = 330 ft, Q is 3.3 times larger and (ii) is unchanged.'], checks: () => [
    { key: 'Q', label: 'Single-well discharge $Q$', value: Q2324, unit: 'ft³/s' },
    { key: 'Qg', label: 'Same, in gpm', value: Q2324 * 448.831, unit: 'gpm' },
    { key: 'ds', label: 'Extra drawdown from the second well', value: add2324, unit: 'ft' },
    { key: 's2', label: 'Total drawdown, both wells pumping', value: 18 + add2324, unit: 'ft' },
  ] },
}

// engine pieces re-exported for the labs' own use is unnecessary; keep unused-import guard happy
void [arithmetic, dupuitK, dAtWell, kObsUnconfined, STREAM_GPM, STREAM_LPM]
