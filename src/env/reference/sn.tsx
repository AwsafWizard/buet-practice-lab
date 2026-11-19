// Chart pane, Snigdha ma'am (s-) items: demand and fire flow, population forecasting, groundwater and well yield,
// DTW design (gradation, gravel pack, slot, housing, yield, well log), hand pumps, branched networks, Hazen–Williams
// sizing and the service reservoir. Her way and her numbers (SN L2–L5, Maths notes, DTW PDF; digest "Math procedures as taught").
import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { Chart, pathOf, SERIES } from '../../soil/topics/consol/plot'
import { BNBC_CITY, BNBC_FIRE, FIRE_FORMULAS, fireDemand, fireFlowLpm, peakHourly, pitotGpm, PEAK_FACTOR, weightedDemand, type FireFormula } from '../engine/demand'
import { curveOf, designDtw, dAt, gradationStats, housingPipe, openFraction, packFactor, packFactorExact, screenShare, screenYield, slotChoice, STD_SLOTS, STEEL_OPEN, SUCTION, wellsNeeded, type Layer } from '../engine/dtw'
import { balancingStorage, CHART_MM, hwDiameterMm, hwHeadLoss, nextChartMm, reservoirSize } from '../engine/network'
import { runAll, SUITS, type Census } from '../engine/population'
import { drawdownCurve, dupuitQ, interferenceConfinedQ, interferenceUnconfinedQ, thiemQ, type Aquifer } from '../engine/wells'
import { GradChart } from '../figs/well-grad'
import { WellLog } from '../figs/well-log'
import { Key } from './chem'
import type { EvRefItem } from './pane'

const f0 = (v: number) => fmt(v, 0)
const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const big = (v: number) => Math.round(v).toLocaleString('en-US')
const R = String.raw

function Sel<T extends string>({ label, value, onChange, opts }: { label: string; value: T; onChange: (v: T) => void; opts: [T, string][] }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-mute">{label}</span>
      <select className="field !py-0.5 !px-1.5 !text-xs" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {opts.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  )
}

// ---------------------------------------------------------------- s-lpcd
const MIX0 = [
  { label: 'X: single-family house (A1, full)', lpcd: 260, frac: 0.05, g: 'X' },
  { label: 'X: big apartment (A3, full)', lpcd: 200, frac: 0.1, g: 'X' },
  { label: 'Y: officer’s quarter (Y1, restricted)', lpcd: 135, frac: 0.25, g: 'Y' },
  { label: 'Y: small apartment (Y2)', lpcd: 120, frac: 0.3, g: 'Y' },
  { label: 'Z: junior staff flat (Z1)', lpcd: 80, frac: 0.15, g: 'Z' },
  { label: 'Z: common-yard stand post (Z3)', lpcd: 50, frac: 0.15, g: 'Z' },
]
function LpcdBody() {
  const [P, setP] = useState(125000)
  const [fr, setFr] = useState(MIX0.map((m) => m.frac))
  const mix = MIX0.map((m, i) => ({ label: m.label, lpcd: m.lpcd, frac: fr[i] }))
  const good = ok(P) && P > 0 && fr.every((f) => ok(f) && f >= 0) && fr.some((f) => f > 0)
  const w = good ? weightedDemand(P, mix) : null
  const sumF = fr.reduce((a, b) => a + (ok(b) ? b : 0), 0)
  return (
    <>
      <Md>{R`$$Q = P\sum_i f_i\,q_i\ \ (\text{L/d}),\qquad \text{share of a group} = \frac{\sum_{\text{group}} f_iq_i}{\sum_{\text{all}} f_iq_i}\times 100\%$$
Pick the BNBC table by area (a) city / district town, (b) Pourashava / upazila, (c) village, (d) other occupancies, then the income group X / Y / Z and full or restricted facility. Use the population at the **end of the design period**.`}</Md>
      <RT
        head={['BNBC 8.5.1(a)', 'Type', 'Full', 'Restricted']}
        rows={BNBC_CITY.map((r) => [`${r.group} · ${r.cat}`, r.label, r.full ? String(r.full) : '—', r.restricted ? String(r.restricted) : '—'])}
        cap="lpcd, cities and big district towns (X high, Y middle, Z low income)."
      />
      <Lookup
        result={
          w ? (
            <span>
              Σf·q = {f2(w.lpcd)} lpcd → Q = <b>{big(w.netLpd)} L/d = {f2(w.MLD)} MLD</b> · X {f1(w.share((r) => r.label.startsWith('X')))} % · Y {f1(w.share((r) => r.label.startsWith('Y')))} % · Z {f1(w.share((r) => r.label.startsWith('Z')))} %
              {Math.abs(sumF - 1) > 1e-6 && <span className="text-bad"> (fractions add to {f2(sumF)}, not 1)</span>}
            </span>
          ) : (
            'P > 0, fractions ≥ 0'
          )
        }
      >
        <NumIn label="P" value={P} onChange={setP} step={1000} w="w-20" />
        {MIX0.map((m, i) => (
          <NumIn key={m.label} label={`${m.lpcd}`} value={fr[i]} onChange={(v) => setFr(fr.map((x, j) => (j === i ? v : x)))} step={0.05} w="w-14" />
        ))}
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Fractions per lpcd (260, 200, 135, 120, 80, 50). Class example: P = 125 000 → 15.28×10⁶ L/d ≈ 15.30 MLD; high income 27 %, low income 16 %.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-peak
type PfKey = keyof typeof PEAK_FACTOR
function PeakBody() {
  const [adc, setAdc] = useState(1491000)
  const [pf, setPf] = useState<PfKey>('residential')
  const [hrs, setHrs] = useState(24)
  const [res, setRes] = useState(false)
  const good = ok(adc) && adc > 0 && ok(hrs) && hrs > 0 && hrs <= 24
  const p = good ? peakHourly(adc, PEAK_FACTOR[pf], hrs, res) : null
  return (
    <>
      <Md>{R`$$Q_{\text{peak hour}} = \frac{ADC}{24}\times PF\times TF,\qquad TF = \frac{24}{\text{hours of consumption}}$$
No time factor when a **reservoir** is present (her class note). Residential TF = 1; two-shift industry 24/16 = 1.5; school 24/6 = 4.`}</Md>
      <RT head={['Use', 'Peak factor PF']} rows={[['Residential', '2.5'], ['Industrial', '1.4'], ['Commercial / institutional', '4'], ['Fire fighting', '1']]} hl={(i) => i === ['residential', 'industrial', 'commercial', 'fire'].indexOf(pf)} cap="SN L5." />
      <RT
        head={['Component', 'Designed for']}
        rows={[
          ['Source, raw-water main, treatment plant', 'peak (maximum) daily demand'],
          ['Distribution network', 'peak hourly demand'],
          ['Service reservoir', 'balancing + emergency (fire in a separate ground tank)'],
        ]}
      />
      <Lookup result={p ? <span>ADC/24 = {big(p.avgHour)} · PF {p.pf} · TF {f2(p.tf)} → peak hour = <b>{big(p.peak)}</b> per hour</span> : '0 < hours ≤ 24'}>
        <NumIn label="ADC" value={adc} onChange={setAdc} step={1000} unit="L/d" w="w-24" />
        <Sel label="use" value={pf} onChange={setPf} opts={[['residential', 'residential'], ['industrial', 'industrial'], ['commercial', 'commercial'], ['fire', 'fire']]} />
        <NumIn label="hours used" value={hrs} onChange={setHrs} step={1} w="w-14" />
        <label className="inline-flex items-center gap-1 text-xs text-mute">
          <input type="checkbox" checked={res} onChange={(e) => setRes(e.target.checked)} /> reservoir
        </label>
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-fire
const FIRE_P = Array.from({ length: 81 }, (_, i) => 1 + i * 2.5)
const FIRE_COL: Record<FireFormula, string> = { kuichling: 'var(--c-accent)', freeman: 'var(--c-load)', nbfu: 'var(--c-water)', buston: 'var(--c-good)' }
function FireBody() {
  const [P, setP] = useState(65)
  const [hrs, setHrs] = useState(5)
  const [psi, setPsi] = useState(100)
  const good = ok(P) && P > 0 && ok(hrs) && hrs >= 0
  const fd = good ? fireDemand(P, hrs) : null
  const yMax = Math.max(...FIRE_FORMULAS.map((f) => fireFlowLpm(f.id, 200))) * 1.05
  return (
    <>
      <RT
        head={['BNBC hazard', 'Sprinkler L/min', 'Standpipe L/min', 'Duration min']}
        rows={BNBC_FIRE.map((r) => [r.hazard, big(r.sprinkler), big(r.standpipe), String(r.minutes)])}
        cap="Individual occupancies (SN L2). Street hydrants: Pitot Q (gpm) = 29.83 C d² √P (C 0.90, d = 3 in nozzle, P psi)."
      />
      <Md>{R`**Fire streams (Kuichling, as the past papers ask):** $N = 2.8\sqrt{P}$ (P in thousands), round **up**; each stream 250 gpm ≈ **950 L/min** → flow = N × 950 L/min; storage for h hours = flow × 60 × h.`}</Md>
      <RT head={['Formula (P in thousands)', 'Unit']} rows={FIRE_FORMULAS.map((f) => [<Md key={f.id}>{`${f.label}: $${f.tex}$`}</Md>, f.unit])} />
      <Chart w={360} h={220} x={{ min: 0, max: 200, label: 'P (thousands)', ticks: [0, 50, 100, 150, 200] }} y={{ min: 0, max: yMax, label: 'Q (L/min)', fmt: (v) => `${Math.round(v / 1000)}k` }} label="fire flow against population">
        {(s) => (
          <>
            {FIRE_FORMULAS.map((f) => (
              <path key={f.id} d={pathOf(FIRE_P.map((p) => [p, fireFlowLpm(f.id, p)]), s)} fill="none" stroke={FIRE_COL[f.id]} strokeWidth={1.6} />
            ))}
            {fd && P <= 200 && <circle cx={s.X(P)} cy={s.Y(fd.kuichlingLpm)} r={3.2} fill="var(--c-bad)" />}
          </>
        )}
      </Chart>
      <Key items={FIRE_FORMULAS.map((f) => ({ c: FIRE_COL[f.id], t: f.label }))} />
      <div className="text-[11px] text-faint mt-1">
        None of these formulas is on her slides or class notes; they come from the seniors' notes and the textbook (Kuichling written as 3182√P gpm here, matching the past-paper solutions — some books print 3182√P in L/min). Fire storage in her class is a separate ground reservoir.
      </div>
      <Lookup
        result={
          fd ? (
            <span>
              Kuichling Q = <b>{big(fd.kuichlingGpm)} gpm</b> ({big(fd.kuichlingLpm)} L/min) · N = 2.8√P = {f2(fd.streams.exact)} → <b>{fd.streams.n} streams</b> → {big(fd.streamFlowLpm)} L/min · storage {f1(hrs)} h = <b>{big(fd.storageL)} L</b> · Pitot at {f0(psi)} psi: {big(pitotGpm(psi))} gpm
            </span>
          ) : (
            'P > 0'
          )
        }
      >
        <NumIn label="P" value={P} onChange={setP} step={5} unit="thousand" w="w-16" />
        <NumIn label="storage" value={hrs} onChange={setHrs} step={1} unit="h" w="w-14" />
        <NumIn label="hydrant" value={psi} onChange={setPsi} step={10} unit="psi" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Past paper (2022-23): P = 65 000, 950 L/min per stream, 5 h → 23 streams, 21 850 L/min, 6 555 000 L.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-pop
const CENSUS: Census[] = [
  { year: 1980, pop: 72000 },
  { year: 1990, pop: 79000 },
  { year: 2000, pop: 89000 },
  { year: 2010, pop: 97000 },
  { year: 2020, pop: 120000 },
]
const YRS = Array.from({ length: 61 }, (_, i) => 1980 + i)
function PopBody() {
  const methods = useMemo(() => runAll(CENSUS), [])
  const [yr, setYr] = useState(2040)
  const yMax = Math.max(...methods.map((m) => m.at(2040))) * 1.05
  return (
    <>
      <RT
        head={['Method', 'Formula', 'Suits']}
        rows={[
          ['Arithmetic', <Md key="a">{R`$P_t = P_2 + K(T - T_2),\ K = \tfrac{P_2 - P_1}{T_2 - T_1}$`}</Md>, 'large old established city (low for new towns)'],
          ['Uniform % (exponential)', <Md key="e">{R`$P = P_1e^{K(T - T_1)},\ K = \tfrac{\ln(P_2/P_1)}{T_2 - T_1}$`}</Md>, 'room to expand, short horizon'],
          ['Geometric', <Md key="g">{R`$P_f = P_p(1+r)^n,\ r = (P_2/P_1)^{1/n} - 1$`}</Md>, 'new industrial town, few decades (high)'],
          ['Decreasing rate', <Md key="d">{R`$P_{n+1} = P_n\big(1 + \tfrac{r_n - s}{100}\big)$, s = mean decrease`}</Md>, 'town nearing saturation'],
          ['Incremental increase', <Md key="i">{R`$P_n = P + n\bar X + \tfrac{n(n+1)}{2}\bar Y$`}</Md>, 'textbook; not worked by her'],
          ['Least squares', 'line a + bx or parabola a + bx + cx² on coded x', 'smooth a scattered history'],
          ['Logistic', <Md key="l">{R`$P = \dfrac{P_S}{1 + e^{a + bt}}$`}</Md>, 'long term, S-curve to P_S'],
          ['Ratio', 'P = national P × (local / national at base year)', 'district inside a forecast country'],
        ]}
      />
      <Chart w={360} h={240} x={{ min: 1980, max: 2040, label: 'year', ticks: [1980, 1990, 2000, 2010, 2020, 2030, 2040], fmt: String }} y={{ min: 60000, max: yMax, label: 'population', fmt: (v) => `${Math.round(v / 1000)}k` }} label="population forecasts">
        {(s) => (
          <>
            <line x1={s.X(2020)} x2={s.X(2020)} y1={s.T} y2={s.B} stroke="var(--c-faint)" strokeDasharray="3 3" />
            {methods.map((m, i) => (
              <path key={m.id} d={pathOf(YRS.filter((y) => y >= 2020).map((y) => [y, m.at(y)]), s)} fill="none" stroke={SERIES[i % SERIES.length]} strokeWidth={1.5} />
            ))}
            <path d={pathOf(CENSUS.map((c) => [c.year, c.pop]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} />
            {CENSUS.map((c) => (
              <circle key={c.year} cx={s.X(c.year)} cy={s.Y(c.pop)} r={2.6} fill="var(--c-ink)" />
            ))}
            {ok(yr) && yr >= 1980 && yr <= 2040 && <line x1={s.X(yr)} x2={s.X(yr)} y1={s.T} y2={s.B} stroke="var(--c-bad)" strokeWidth={1} />}
          </>
        )}
      </Chart>
      <Key items={methods.map((m, i) => ({ c: SERIES[i % SERIES.length], t: m.label }))} />
      <Lookup
        result={
          ok(yr) ? (
            <span>
              {methods.map((m, i) => (
                <span key={m.id}>
                  {i ? ' · ' : ''}
                  {m.label} <b>{big(m.at(yr))}</b>
                </span>
              ))}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="year" value={yr} onChange={setYr} step={5} w="w-16" />
      </Lookup>
      <Md className="text-[11px] text-faint mt-1">{R`Her data 1980–2020: 72, 79, 89, 97, 120 thousand. Arithmetic K = 1200/yr → 132 000 (2030), 144 000 (2040). Geometric: slide uses end-to-end r = 0.01285 → **136 342 / 154 912**; her handwritten average of decade rates r = 0.01287 → 136 370 / 154 973 (give the slide's). Uniform % K = 0.01277 → 136 346 / 154 918. Decreasing rate (data 25, 28, 34, 42, 47 thousand): "increase = −ve decrease", s = 0.033 → 52 578 (2030), 58 818 (2040, answer key). ${SUITS.geom}`}</Md>
    </>
  )
}

// ---------------------------------------------------------------- s-darcy
function DarcyBody() {
  const [S, setS] = useState(0.15)
  const [A, setA] = useState(10000)
  const [dh, setDh] = useState(2)
  const [K, setK] = useState(40)
  const [b, setB] = useState(30)
  const good = [S, A, dh, K, b].every(ok)
  return (
    <>
      <Md>{R`- **Porosity** $n = V_v/V$; **specific yield** $S_y$ (drains by gravity) + **specific retention** $S_r$ (held) $= n$.
- **Storativity (storage coefficient)** $S$: volume released per unit area per unit head drop. Confined: $10^{-5}$–$10^{-3}$ (water and grain compressibility); unconfined $S \approx S_y$ (0.01–0.3).
- Volume released $= S\,A\,\Delta h$ (use $S_y$ for a water-table aquifer).
- **Transmissivity** $T = K\,b$ (m²/d); **Darcy** $Q = K\,i\,A$, $v = Ki$; seepage velocity $v_s = v/n$.`}</Md>
      <Lookup result={good ? <span>Volume released = <b>{big(S * A * dh)} m³</b> · T = Kb = <b>{f1(K * b)} m²/d</b></span> : '—'}>
        <NumIn label="S or Sy" value={S} onChange={setS} step={0.01} w="w-16" />
        <NumIn label="A" value={A} onChange={setA} step={1000} unit="m²" w="w-20" />
        <NumIn label="Δh" value={dh} onChange={setDh} step={0.5} unit="m" w="w-14" />
        <NumIn label="K" value={K} onChange={setK} step={5} unit="m/d" w="w-14" />
        <NumIn label="b" value={b} onChange={setB} step={5} unit="m" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Definitions only in her slides (SN L3): no numerical storativity example in any source.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-thiem
type WellMode = 'unconfined' | 'confined'
function ThiemBody() {
  const [mode, setMode] = useState<WellMode>('unconfined')
  const [K, setK] = useState(0.51)
  const [D, setD] = useState(35)
  const [b, setB] = useState(30)
  const [s, setS] = useState(2)
  const [rw, setRw] = useState(0.05)
  const [Rr, setRr] = useState(30)
  const [a, setA] = useState(7.5)
  const good = [K, D, b, s, rw, Rr].every((v) => ok(v) && v > 0) && Rr > rw && s < D
  const Q = good ? (mode === 'unconfined' ? dupuitQ({ K, D, s, rw, R: Rr }) : thiemQ({ K, b, s, rw, R: Rr })) : NaN
  const Qi = good && ok(a) && a > 0 && Rr * Rr > rw * a ? (mode === 'unconfined' ? interferenceUnconfinedQ({ K, D, s, rw, R: Rr, a }) : interferenceConfinedQ({ K, b, s, rw, R: Rr, a })) : NaN
  const aq: Aquifer = mode === 'unconfined' ? { kind: 'unconfined', K, thick: D, rw, R: Rr } : { kind: 'confined', K, thick: b, D, rw, R: Rr }
  const curve = good ? drawdownCurve(aq, Q) : []
  return (
    <>
      <Md>{R`$$\text{Unconfined (Dupuit): } Q = \frac{\pi K (D^2 - d^2)}{\ln(R/r)}\qquad \text{Confined (Thiem): } Q = \frac{2\pi K b\,(D - d)}{\ln(R/r)} = \frac{2\pi T s}{\ln(R/r)}$$
- D = static water depth above the base, d = D − drawdown, r = **well radius** (diameter/2), R = radius of influence; specific capacity = Q / (D − d).
- K from two observation wells: unconfined $K = \dfrac{Q\ln(r_2/r_1)}{\pi(h_2^2 - h_1^2)}$, confined $K = \dfrac{Q\ln(r_2/r_1)}{2\pi b(h_2 - h_1)}$.
- **Two identical wells a apart** (each Q): replace $\ln(R/r)$ by $\ln\!\big(R^2/(r\,a)\big)$; unconfined keeps **π** (the slide's printed 2π is a typo — her own answer needs π), confined keeps 2π.`}</Md>
      {good && (
        <Chart w={360} h={200} x={{ min: rw, max: Rr, log: true, label: 'distance from the well r (m, log)' }} y={{ min: 0, max: s * 1.1, flip: true, label: 'drawdown (m)' }} label="cone of depression">
          {(sc) => <path d={pathOf(curve.map((p) => [p.r, p.s]), sc)} fill="none" stroke="var(--c-water)" strokeWidth={1.8} />}
        </Chart>
      )}
      <Lookup
        result={
          good ? (
            <span>
              Q = <b>{f2(Q)}</b> · specific capacity {f2(Q / s)} per m{ok(Qi) && <> · with a 2nd well {f1(a)} m away each gives <b>{f2(Qi)}</b></>}
              <span className="text-faint"> (units of K × m²)</span>
            </span>
          ) : (
            'R > r, 0 < drawdown < D'
          )
        }
      >
        <Sel label="aquifer" value={mode} onChange={setMode} opts={[['unconfined', 'unconfined'], ['confined', 'confined']]} />
        <NumIn label="K" value={K} onChange={setK} step={0.05} w="w-14" />
        <NumIn label="D" value={D} onChange={setD} step={1} unit="m" w="w-14" />
        {mode === 'confined' && <NumIn label="b" value={b} onChange={setB} step={1} unit="m" w="w-14" />}
        <NumIn label="drawdown" value={s} onChange={setS} step={0.5} unit="m" w="w-14" />
        <NumIn label="r" value={rw} onChange={setRw} step={0.01} unit="m" w="w-14" />
        <NumIn label="R" value={Rr} onChange={setRr} step={10} unit="m" w="w-16" />
        <NumIn label="a" value={a} onChange={setA} step={2.5} unit="m" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Ex-1: K 0.51 L/s/m², D 35, d 33, R 30, r 0.05 → 34.1 L/s, 17.03 L/s per m. Ex-2 (confined): b 30, D−d 3, R 750, r 0.15, Q 230 L/min → K 3.5 L/min/m²; r 0.05 → 206 L/min. Ex-3: K 3.52, R ≈ 290 m, a 7.5 → 1058.5 L/min each. Ex-4: obs wells 25 m / 50 m → K = 43.5 m/d, drawdown 1.23 m at r 0.125.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-grad
const SAMPLE = curveOf([
  { size: 4.75, finer: 100 },
  { size: 2.36, finer: 100 },
  { size: 1.18, finer: 93 },
  { size: 0.6, finer: 67 },
  { size: 0.425, finer: 28 },
  { size: 0.3, finer: 11 },
  { size: 0.15, finer: 1 },
  { size: 0.075, finer: 0 },
])
function GradBody() {
  const st = gradationStats(SAMPLE)
  const [d1, setD1] = useState(0.15)
  const [p1, setP1] = useState(1)
  const [d2, setD2] = useState(0.3)
  const [p2, setP2] = useState(11)
  const [x, setX] = useState(10)
  const good = [d1, p1, d2, p2, x].every(ok) && d1 > 0 && d2 > 0 && p2 !== p1
  const dx = good ? d1 * (d2 / d1) ** ((x - p1) / (p2 - p1)) : NaN
  return (
    <>
      <Md>{R`Plot **% finer** against grain size on a **log** axis; read $D_{10}, D_{30}, D_{60}$ at 10, 30, 60 % finer.
$$C_u = \frac{D_{60}}{D_{10}}\ (\le 2.5),\qquad FM = \frac{\sum \text{cum. \% retained on \#4, 8, 16, 30, 50, 100}}{100}\ (>1)$$
Log interpolation between two sieves: $D_x = D_1\,(D_2/D_1)^{(x - P_1)/(P_2 - P_1)}$.`}</Md>
      <GradChart curves={[{ label: 'sample', pts: SAMPLE }]} xmin={0.01} xmax={10} />
      <RT
        head={['Sieve', '#4', '#8', '#16', '#30', '#50', '#100']}
        rows={[
          ['size mm', '4.75', '2.36', '1.18', '0.60', '0.30', '0.15'],
          ['cum. % retained', ...st.fmTerms.map((v) => f0(v))],
        ]}
        cap={`D10 = ${f3(st.d10)}, D30 = ${f3(st.d30)}, D60 = ${f3(st.d60)} mm, Cu = ${f2(st.cu)}, FM = ${f2(st.fm)} — her mini example: 0.279, 0.564, 2.02, 2.28 (uniform medium sand).`}
      />
      <Lookup result={good ? <span>D<sub>{f0(x)}</sub> = <b>{f3(dx)} mm</b></span> : 'P1 ≠ P2'}>
        <NumIn label="D1" value={d1} onChange={setD1} step={0.05} unit="mm" w="w-14" />
        <NumIn label="P1" value={p1} onChange={setP1} step={1} unit="%" w="w-14" />
        <NumIn label="D2" value={d2} onChange={setD2} step={0.05} unit="mm" w="w-14" />
        <NumIn label="P2" value={p2} onChange={setP2} step={1} unit="%" w="w-14" />
        <NumIn label="x" value={x} onChange={setX} step={10} unit="%" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-pack
const CUS = Array.from({ length: 41 }, (_, i) => 1 + i * 0.05)
function PackBody() {
  const [cu, setCu] = useState(2.18)
  const [d30, setD30] = useState(0.25)
  const [t, setT] = useState(8)
  const [dia, setDia] = useState(6)
  const good = [cu, d30, t, dia].every(ok) && cu > 0 && d30 > 0
  const fx = good ? packFactorExact(cu) : NaN
  const f = good ? packFactor(cu) : NaN
  return (
    <>
      <Md>{R`1. Among the layers in the screen zone take the **finest** (lowest FM).
2. Factor $f = 4$ ($C_u \le 1.5$), $6$ ($C_u \ge 2.5$), between: $f = 4 + 2(C_u - 1.5)$; she rounds to a whole number (5.36 → 5).
3. $D_{30,\text{pack}} = f\times D_{30,\text{sand}}$; draw the pack curve roughly parallel through it with $C_u \le 2.5$; spec ±8 %.
4. Pack 3–8 in thick → borehole = strainer + 2 × thickness; pack runs 20–50 ft above the screen down to the sand-trap bottom.`}</Md>
      <Chart w={360} h={190} x={{ min: 1, max: 3, label: 'Cu of the finest aquifer sand', ticks: [1, 1.5, 2, 2.5, 3] }} y={{ min: 3, max: 7, label: 'factor f', ticks: [3, 4, 5, 6, 7] }} label="gravel pack factor">
        {(s) => (
          <>
            <path d={pathOf(CUS.map((c) => [c, packFactorExact(c)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            {good && cu >= 1 && cu <= 3 && <circle cx={s.X(cu)} cy={s.Y(fx)} r={3.2} fill="var(--c-load)" />}
          </>
        )}
      </Chart>
      <Lookup result={good ? <span>f = {f2(fx)} → <b>{f}</b> · D30 pack = <b>{f2(f * d30)} mm</b> · borehole = {f1(dia)} + 2×{f1(t)} = <b>{f1(dia + 2 * t)} in</b></span> : '—'}>
        <NumIn label="Cu" value={cu} onChange={setCu} step={0.05} w="w-14" />
        <NumIn label="D30 sand" value={d30} onChange={setD30} step={0.01} unit="mm" w="w-14" />
        <NumIn label="pack" value={t} onChange={setT} step={1} unit="in" w="w-14" />
        <NumIn label="strainer" value={dia} onChange={setDia} step={1} unit="in" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Example-1: layer 490–530 ft (FM 1.62, Cu 2.18, D30 0.25) → f 5.36 ≈ 5 → D30 1.25 mm; pack D10 0.85, D60 1.55 (Cu 1.82); 6 + 2×8 = 22 in borehole (the slide sketch shows 18 in).</div>
    </>
  )
}

// ---------------------------------------------------------------- s-slot
function SlotBody() {
  const [d10, setD10] = useState(0.85)
  const [mat, setMat] = useState<'steel' | 'uPVC'>('steel')
  const good = ok(d10) && d10 > 0
  const sc = good ? slotChoice(d10) : null
  return (
    <>
      <Md>{R`$$\text{slot no.} = \frac{D_{10,\text{pack}}\ (\text{mm})}{25.4}\times 1000\ \ \to\ \text{round **down** to a standard slot}$$
Slot number = opening in thousandths of an inch (#30 = 0.030 in).`}</Md>
      <RT
        head={['Slot', 'Opening in', 'Opening mm', 'Open area steel', 'uPVC / PVC']}
        rows={STD_SLOTS.map((n) => [`#${n}`, (n / 1000).toFixed(3), f2((n / 1000) * 25.4), `${f0(STEEL_OPEN[n] * 100)} %`, `${f1(openFraction(n, 'uPVC') * 100)} %`])}
        hl={(i) => !!sc && STD_SLOTS[i] === sc.slot}
        cap="Her default list also names #25 and #35, but both worked examples round down within 20/30/40 (33.5 → 30, 27.55 → 20). uPVC open area is half the steel value."
      />
      <Lookup result={sc ? <span>{f3(d10)}/25.4 × 1000 = {f1(sc.raw)} → <b>#{sc.slot}</b>{sc.tooFine ? ' (finer than #20: use #20 and a finer pack)' : ''} · open area η = <b>{f1(openFraction(sc.slot, mat) * 100)} %</b></span> : '—'}>
        <NumIn label="D10 pack" value={d10} onChange={setD10} step={0.05} unit="mm" w="w-14" />
        <Sel label="strainer" value={mat} onChange={setMat} opts={[['steel', 'steel'], ['uPVC', 'uPVC']]} />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-dtw
const EX1: Layer[] = [
  { top: 0, bot: 160, kind: 'clay', label: 'overburden' },
  { top: 160, bot: 220, fm: 0.88, d60: 0.22, d10: 0.1, cu: 2.2 },
  { top: 220, bot: 260, fm: 1.01, d60: 0.24, d10: 0.06, cu: 4.0 },
  { top: 260, bot: 300, fm: 1.69, d60: 0.36, d10: 0.2, cu: 1.8 },
  { top: 300, bot: 360, fm: 0.93, d60: 0.23, d10: 0.09, cu: 2.56 },
  { top: 360, bot: 430, fm: 1.11, d60: 0.25, d10: 0.1, cu: 2.5 },
  { top: 430, bot: 490, fm: 1.73, d60: 0.4, d10: 0.17, cu: 2.35 },
  { top: 490, bot: 530, fm: 1.62, d60: 0.37, d10: 0.17, cu: 2.18, d30: 0.25 },
  { top: 530, bot: 590, fm: 2.23, d60: 0.53, d10: 0.34, cu: 1.56 },
  { top: 590, bot: 610, fm: 2.08, d60: 0.48, d10: 0.25, cu: 1.92 },
  { top: 610, bot: 660, fm: 1.25, d60: 0.27, d10: 0.15, cu: 1.8 },
]
function DtwBody() {
  const ex1 = useMemo(() => designDtw({ layers: EX1, housing: { swl: 200 }, strainerDia: 6, packThickness: 8, material: 'steel', fb: 2.5 }), [])
  const [swl, setSwl] = useState(200)
  const [dec, setDec] = useState(2)
  const [yrs, setYrs] = useState(20)
  const [avail, setAvail] = useState(230)
  const [eta, setEta] = useState(0.15)
  const [dia, setDia] = useState(6)
  const [L, setL] = useState(100)
  const [fb, setFb] = useState(2.5)
  const [demand, setDemand] = useState(1500000)
  const hp = ok(swl) && ok(dec) && ok(yrs) ? housingPipe({ swl, decline: dec, years: yrs }) : null
  const good = [eta, dia, L, fb].every((v) => ok(v) && v > 0)
  const y = good ? screenYield({ eta, dIn: dia, L, fb }) : null
  const share = ok(avail) && avail > 0 ? screenShare(avail) : NaN
  return (
    <>
      <RT
        head={['Design value', 'Her default']}
        rows={[
          ['Design period', '20 yr'],
          ['Water-level decline', '2 ft/yr'],
          ['Drawdown (D − d)', '15 ft (10–15)'],
          ['Safety', '15 ft (10–15)'],
          ['Entrance velocity Vc', '0.1 ft/s'],
          ['Blockage factor F_B', '3 if not given (her example 2.5)'],
          ['Screen share of the aquifer', '< 25 ft: 70 %; 25–50 ft: 75 %; > 50 ft: 80 %'],
          ['Longest screen', '100 ft (150 ft for high yield)'],
          ['Clearance at a layer interface', '10 ft'],
          ['Sand trap', '10 ft, capped'],
          ['Usable layer', 'FM > 1 and Cu ≤ 2.5'],
          ['Housing ID', 'pump bowl OD + 2 in'],
          ['Community DTW strainer', '6 in'],
        ]}
      />
      <Md>{R`$$L_{\text{housing}} = SWL + \text{decline}\times\text{years} + \text{drawdown} + \text{safety}\qquad Q = \frac{\eta\,\pi D L V_c}{F_B}\ (\text{cfs},\ D, L\ \text{in ft})$$
1 cfs = 0.3048³ × 1000 × 3600 = 101 941 L/h (≈ 1 lac L/h); daily yield = L/h × 8 h pumping; wells = demand / daily yield (round up).`}</Md>
      <WellLog d={ex1} title="Example-1 well log" />
      <Lookup
        result={
          hp && y ? (
            <span>
              Housing = {f0(swl)} + {f0(hp.totalDecline)} + 15 + 15 = <b>{f0(hp.length)} ft</b> · screen ≤ {ok(share) ? `${f0(share * 100)} % × ${f0(avail)} = ${f0(share * avail)} ft → ${f0(Math.min(share * avail, 100))} ft` : '—'} · Q = <b>{f3(y.cfs)} cfs = {big(y.lph)} L/h</b> → {big(y.lph * 8)} L/d (8 h)
              {ok(demand) && demand > 0 && <> → <b>{wellsNeeded(demand, y.lph * 8)} wells</b> for {big(demand)} L/d</>}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="SWL" value={swl} onChange={setSwl} step={10} unit="ft" w="w-14" />
        <NumIn label="decline" value={dec} onChange={setDec} step={1} unit="ft/yr" w="w-14" />
        <NumIn label="years" value={yrs} onChange={setYrs} step={5} w="w-14" />
        <NumIn label="aquifer" value={avail} onChange={setAvail} step={10} unit="ft" w="w-14" />
        <NumIn label="η" value={eta} onChange={setEta} step={0.05} w="w-14" />
        <NumIn label="D" value={dia} onChange={setDia} step={1} unit="in" w="w-14" />
        <NumIn label="L" value={L} onChange={setL} step={10} unit="ft" w="w-14" />
        <NumIn label="F_B" value={fb} onChange={setFb} step={0.5} w="w-14" />
        <NumIn label="demand" value={demand} onChange={setDemand} step={100000} unit="L/d" w="w-24" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Example-1: housing 270 ft; zone 430–660 (230 ft × 80 % = 184 → 100 ft); strainer 440–540, trap 540–550; slot 33.5 → #30, η 15 %; Q = 0.942 cfs = 96 028 L/h → 768 000 L/d. The printed log says pack 410–550 ft, her handwriting 400–550 (both inside 20–50 ft). Chandpur (uPVC 8 in, η 5 %, 20-slot): 0.4188 cfs ≈ 42 700 L/h.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-hand
function HandBody() {
  return (
    <>
      <RT
        head={['Item', 'Value (SN L4)']}
        rows={[
          ['Theoretical suction lift', `${SUCTION.theoreticalFt} ft (${SUCTION.patmPsi} psi × ${SUCTION.ftPerPsi})`],
          ['Practical suction lift', `${SUCTION.practicalFt[0]}–${SUCTION.practicalFt[1]} ft ≈ ${SUCTION.practicalM} m static water level`],
          ['No. 6 suction hand pump', '30–40 L/min, life 15–20 yr, 6 in barrel'],
          ['No. 6 STW pipe and strainer', '38 mm, slot #8/#10/#12, sand trap 4–6 ft'],
          ['Deep-set (force) pump', 'water level up to ≈ 30 m (100 ft)'],
          ['Tara pump', '15 m; cylinder at 18 m; 75 mm casing, 50 mm cylinder, 38 mm lower casing, 32 mm rod'],
          ['Deep tubewell', '> 75 m (246 ft) with ≥ 1 impermeable layer'],
          ['Sinking', 'jetting 400–500 ft in alluvium (test boring); rotary for the main boring'],
        ]}
        cap="Static water level below ~7.5 m → a suction pump cannot lift it: use deep-set / Tara."
      />
    </>
  )
}

// ---------------------------------------------------------------- s-branch
const FT3_L = 28.316846592
function BranchBody() {
  const [q, setQ] = useState(35957)
  const [L, setL] = useState(385)
  const [V, setV] = useState(3)
  const [min, setMin] = useState(4)
  const [f, setF] = useState(0.01)
  const [Hres, setHres] = useState(90)
  const good = [q, L, V, min, f].every((v) => ok(v) && v > 0)
  const Qcfs = q / 1000 / 3600 / (FT3_L / 1000)
  const Dft = 2 * Math.sqrt(Qcfs / (Math.PI * V))
  const Din = Dft * 12
  const Dad = Math.max(Math.ceil(Din - 1e-9), min)
  const hfClass = (4 * f * V * V * L) / (2 * 32.2 * (Dad / 12))
  const vAct = Qcfs / ((Math.PI * (Dad / 12) ** 2) / 4)
  const hfAct = (4 * f * vAct * vAct * L) / (2 * 32.2 * (Dad / 12))
  const psi = (ft: number) => (ft * 62.4) / 144
  return (
    <>
      <Md>{R`1. Flow in a pipe = **sum of all demands downstream** of it (× peak factor / losses if told).
2. $D = 2\sqrt{\dfrac{Q}{\pi V}}$ with $V = 3$ fps (1 m/s); round **up** (her notes: whole inches, minimum 4 in main).
3. $h_f = \dfrac{4fLv^2}{2gD}$ with **f = 0.01** (Fanning); ft → psi: × 62.4/144 (÷ 2.31).
4. Reservoir head 90 ft × 62.4/144 = **39 psi**; terminal pressure = 39 − Σh_f on the path ≥ **30 psi** (BNBC), else enlarge.`}</Md>
      <Lookup
        result={
          good ? (
            <span>
              Q = {f3(Qcfs)} cfs → D = {f2(Din)} in → <b>{Dad} in</b> · h_f (class, v = {f1(V)} fps) = {f2(hfClass)} ft = <b>{f2(psi(hfClass))} psi</b> · with actual v = {f2(vAct)} fps: {f2(psi(hfAct))} psi · reservoir {f0(Hres)} ft = {f1(psi(Hres))} psi
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="Q" value={q} onChange={setQ} step={1000} unit="lph" w="w-20" />
        <NumIn label="L" value={L} onChange={setL} step={10} unit="ft" w="w-14" />
        <NumIn label="V" value={V} onChange={setV} step={0.5} unit="fps" w="w-14" />
        <NumIn label="min D" value={min} onChange={setMin} step={1} unit="in" w="w-14" />
        <NumIn label="f" value={f} onChange={setF} step={0.001} w="w-16" />
        <NumIn label="reservoir" value={Hres} onChange={setHres} step={5} unit="ft" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">
        Her handwritten L5-Ex2 puts the design V = 3 fps (not the velocity in the rounded pipe) into h_f: 1-2 35 957 lph → 4.64 → 5 in, 2.24 psi; 2-3 4 in 2.51; 3-4 4 in 2.83; 1-5 77 340 → 7 in 1.25; 5-6 5 in 3.49; 5-7, 7-8 4 in 1.74 → node 4: 31.42 psi, node 6: 34.26, node 8: 34.27 &gt; 30, no revision. The step PDF (V = 1 m/s, standard 6/8 in sizes, L1-5 = 385 ft) gets 38.2/37.1/37.3 psi — follow what the question says.
      </div>
    </>
  )
}

// ---------------------------------------------------------------- s-hw
const QS = Array.from({ length: 61 }, (_, i) => 10 ** (-0.5 + i * 0.06))
function HwBody() {
  const [Q, setQ] = useState(11.3)
  const [S, setS] = useState(0.005)
  const [C, setC] = useState(130)
  const [L, setL] = useState(300)
  const good = [Q, S, C, L].every((v) => ok(v) && v > 0)
  const Dreq = good ? hwDiameterMm(Q, S, C) : NaN
  const Dad = good ? nextChartMm(Dreq) : NaN
  return (
    <>
      <Md>{R`$$h_f = \frac{10.67\,L\,Q^{1.85}}{C^{1.85}D^{4.87}}\ \Rightarrow\ D = \left[\frac{10.67\,Q^{1.85}}{C^{1.85}S}\right]^{1/4.87}\quad(\text{SI: Q in m}^3\text{/s, D in m})$$
Size each loop pipe after Hardy Cross ($\Delta = -\Sigma H / (1.85\,\Sigma|H/Q|)$, common pipe gets $\Delta_I - \Delta_{II}$) at S = 0.005 m/m, C = 130; take the next chart size; a common pipe takes the higher size.`}</Md>
      <Chart w={360} h={230} x={{ min: 0.3, max: 1000, log: true, label: 'Q (L/s, log)' }} y={{ min: 25, max: 1500, log: true, label: 'D (mm, log)' }} label="Hazen–Williams pipe size">
        {(s) => (
          <>
            {[0.002, 0.005, 0.01].map((sl, i) => (
              <path key={sl} d={pathOf(QS.map((q) => [q, hwDiameterMm(q, sl, C > 0 ? C : 130)]), s)} fill="none" stroke={['var(--c-water)', 'var(--c-accent)', 'var(--c-load)'][i]} strokeWidth={sl === 0.005 ? 1.9 : 1.1} />
            ))}
            {CHART_MM.filter((d) => d >= 25).map((d) => (
              <text key={d} x={s.R - 2} y={s.Y(d) - 1} fontSize={7} textAnchor="end" fill="var(--c-faint)">
                {d}
              </text>
            ))}
            {good && Q >= 0.3 && Q <= 1000 && Dreq >= 25 && Dreq <= 1500 && <circle cx={s.X(Q)} cy={s.Y(Dreq)} r={3.2} fill="var(--c-bad)" />}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-water)', t: 'S = 0.002' }, { c: 'var(--c-accent)', t: 'S = 0.005' }, { c: 'var(--c-load)', t: 'S = 0.01' }]} />
      <Lookup result={good ? <span>D = <b>{f1(Dreq)} mm</b> → chart size <b>{f0(Dad)} mm</b> · h_f over {f0(L)} m = {f2(hwHeadLoss(Q, Dad, L, C))} m</span> : '—'}>
        <NumIn label="Q" value={Q} onChange={setQ} step={1} unit="L/s" w="w-14" />
        <NumIn label="S" value={S} onChange={setS} step={0.001} unit="m/m" w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={10} w="w-14" />
        <NumIn label="L" value={L} onChange={setL} step={50} unit="m" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">L5-Ex3 step PDF: final flows 11.30, 10.60, 13.70, 7.41, 6.29, 3.71, 5.29 L/s → 150 mm, 3-4 = 100 mm. Her handwritten table reads 62 mm for every pipe from H/L = Q^1.85/L, which is not a real head loss — use the step PDF. Chart sizes: {CHART_MM.join(', ')} mm.</div>
    </>
  )
}

// ---------------------------------------------------------------- s-store
const DEM = [45, 60, 92, 86, 76, 73, 68, 71, 70, 65, 62, 69, 78, 82, 80, 72, 68, 62, 60, 38, 32, 28, 25, 29]
const SUP = [128, 128, 128, 0, 128, 0, 128, 128, 0, 128, 128, 0, 0, 128, 0, 128, 0, 128, 128, 0, 0, 0, 0, 0]
const HRLAB = ['5AM', '9AM', '1PM', '5PM', '9PM', '1AM', '5AM']
function StoreBody() {
  const st = useMemo(() => balancingStorage(DEM, SUP), [])
  const cumD = DEM.reduce<number[]>((a, d) => [...a, (a.at(-1) ?? 0) + d], [])
  const cumS = SUP.reduce<number[]>((a, d) => [...a, (a.at(-1) ?? 0) + d], [])
  const [P, setP] = useState(12425)
  const [q, setQ] = useState(120)
  const [pump, setPump] = useState(128000)
  const [bal, setBal] = useState(256000)
  const [ef, setEf] = useState(1.5)
  const [D, setD] = useState(8)
  const [fbd, setFbd] = useState(0.3)
  const good = [P, q, pump, bal, ef, D, fbd].every(ok) && P > 0 && q > 0 && pump > 0 && D > 0
  const daily = P * q
  const r = good ? reservoirSize({ daily, balancing: bal, emergencyFactor: ef }) : null
  const depth = r ? r.total / 1000 / ((Math.PI * D * D) / 4) : NaN
  return (
    <>
      <Md>{R`1. Daily demand = P × lpcd; average hourly = /24; pumping hours = daily / pump yield (round up).
2. Hour by hour: storage = previous + supply − demand, starting **empty**; **balancing storage = the maximum**.
3. Emergency (breakdown) = **1.5** (1.5–2) × average hourly (or ≈ 25 % of the total); fire in a separate ground tank.
4. Tank: choose D, depth = V / (πD²/4), add freeboard.`}</Md>
      <Chart w={360} h={230} x={{ min: 0, max: 24, label: 'hour from 5 AM', ticks: [0, 4, 8, 12, 16, 20, 24], fmt: (v) => HRLAB[v / 4] ?? String(v) }} y={{ min: 0, max: 1600, label: '×1000 L', ticks: [0, 400, 800, 1200, 1600] }} label="mass diagram of supply and demand">
        {(s) => (
          <>
            <path d={pathOf([[0, 0], ...cumS.map((v, i) => [i + 1, v] as [number, number])], s)} fill="none" stroke="var(--c-water)" strokeWidth={1.7} />
            <path d={pathOf([[0, 0], ...cumD.map((v, i) => [i + 1, v] as [number, number])], s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.7} />
            <path d={pathOf([[0, 0], ...st.hours.map((h, i) => [i + 1, h.storage] as [number, number])], s)} fill="none" stroke="var(--c-load)" strokeWidth={1.4} strokeDasharray="4 3" />
            <circle cx={s.X(st.maxAt + 1)} cy={s.Y(st.max)} r={3.2} fill="var(--c-bad)" />
            <text x={s.X(st.maxAt + 1) + 4} y={s.Y(st.max) - 4} fontSize={8} fill="var(--c-ink)">
              max {st.max}
            </text>
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-water)', t: 'cumulative supply' }, { c: 'var(--c-accent)', t: 'cumulative demand' }, { c: 'var(--c-load)', t: 'storage (supply − demand)', dash: true }]} />
      <Lookup
        result={
          r ? (
            <span>
              Daily {big(daily)} L · avg {big(r.avgHourly)} L/h · pumping {f2(daily / pump)} → {Math.ceil(daily / pump - 1e-9)} h · emergency <b>{big(r.emergency)} L</b> · total <b>{big(r.total)} L</b> · depth = {f2(depth)} m + {f2(fbd)} = <b>{f2(depth + fbd)} m</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="P" value={P} onChange={setP} step={100} w="w-16" />
        <NumIn label="lpcd" value={q} onChange={setQ} step={10} w="w-14" />
        <NumIn label="pump" value={pump} onChange={setPump} step={1000} unit="L/h" w="w-20" />
        <NumIn label="balancing" value={bal} onChange={setBal} step={1000} unit="L" w="w-20" />
        <NumIn label="× avg h" value={ef} onChange={setEf} step={0.5} w="w-14" />
        <NumIn label="D" value={D} onChange={setD} step={1} unit="m" w="w-14" />
        <NumIn label="freeboard" value={fbd} onChange={setFbd} step={0.1} unit="m" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">L5-Ex1: 12 425 × 120 = 1 491 000 L/d; 11.65 → 12 h of two 128 000 L/h pumps; max storage 256 000 L (3–4 PM); emergency 93 188 L; total ≈ 350 m³; D 8 m → 7 m + 0.3 m freeboard = 7.3 m (her notes: 1 m → 8 m).</div>
    </>
  )
}

export const SN_ITEMS: EvRefItem[] = [
  { id: 's-lpcd', group: 'sn', title: 'Per-capita demand (BNBC) and total demand', tag: 'SN L2', exam: true, keywords: 'lpcd water demand bnbc consumption income group mld per capita', Body: LpcdBody },
  { id: 's-peak', group: 'sn', title: 'Peak factors, time factor and design capacity', tag: 'SN L5', exam: true, keywords: 'peak hourly daily demand time factor tf pf reservoir variation', Body: PeakBody },
  { id: 's-fire', group: 'sn', title: 'Fire demand: BNBC, Kuichling streams, formula chart', tag: 'SN L2', exam: true, keywords: 'fire flow kuichling freeman nbfu buston streams hydrant pitot storage', Body: FireBody },
  { id: 's-pop', group: 'sn', title: 'Population forecasting: all methods compared', tag: 'SN L2', exam: true, keywords: 'population forecast arithmetic geometric exponential uniform percentage decreasing incremental least squares logistic ratio', Body: PopBody },
  { id: 's-darcy', group: 'sn', title: 'Aquifer properties: n, Sy, S, T and Darcy', tag: 'SN L3', exam: true, keywords: 'porosity specific yield retention storativity storage coefficient transmissivity darcy groundwater', Body: DarcyBody },
  { id: 's-thiem', group: 'sn', title: 'Well yield: Dupuit, Thiem, observation wells, interference', tag: 'SN L3', exam: true, keywords: 'well yield drawdown cone of depression dupuit thiem confined unconfined interference specific capacity radius of influence', Body: ThiemBody },
  { id: 's-grad', group: 'sn', title: 'Gradation curve: D10, D30, D60, Cu, FM', tag: 'SN L4 DTW', exam: true, keywords: 'sieve gradation d10 d30 d60 uniformity coefficient cu fineness modulus fm interpolation', Body: GradBody },
  { id: 's-pack', group: 'sn', title: 'Gravel pack: factor f against Cu', tag: 'SN L4 DTW', exam: true, keywords: 'gravel pack multiplying factor d30 borehole thickness', Body: PackBody },
  { id: 's-slot', group: 'sn', title: 'Slot number and open area', tag: 'SN L4 DTW', exam: true, keywords: 'slot strainer screen open area steel upvc pvc d10', Body: SlotBody },
  { id: 's-dtw', group: 'sn', title: 'DTW design: housing, screen, yield, well log', tag: 'SN L4 DTW', exam: true, keywords: 'deep tubewell dtw housing pipe strainer screen length yield entrance velocity blockage factor well log', Body: DtwBody },
  { id: 's-hand', group: 'sn', title: 'Hand pumps and suction limits', tag: 'SN L4', keywords: 'hand pump no 6 tara deep set suction lift stw shallow', Body: HandBody },
  { id: 's-branch', group: 'sn', title: 'Dead-end (branched) network design', tag: 'SN L5', exam: true, keywords: 'branch dead end distribution pipe size fanning head loss psi terminal pressure', Body: BranchBody },
  { id: 's-hw', group: 'sn', title: 'Hazen–Williams pipe sizing (after Hardy Cross)', tag: 'SN L5', exam: true, keywords: 'hazen williams hardy cross loop network pipe diameter head loss chart c 130', Body: HwBody },
  { id: 's-store', group: 'sn', title: 'Service reservoir: mass diagram and tank size', tag: 'SN L5', exam: true, keywords: 'reservoir balancing storage emergency mass curve elevated tank', Body: StoreBody },
]
