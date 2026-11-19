// Chart pane, Rowshan ma'am (r-) items: RWH (runoff, demand side, mass curve), pump units, head and power, minor losses,
// pump & system curves, NPSH, intake losses, Manning / Hazen–Williams, water hammer, pipe stresses and trench loads,
// WSP risk matrix, economic overhead tank. Her way (RM L6–L10, Math procedures M1–M12); doubts flagged in captions.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import { criticalTime, G as G_SI_H, hammerRise, waveSpeed } from '../engine/hammer'
import { cfsFromGpm, headFromKPa, interp, npshAvailable, operatingPoint, parallel, pipeFromVelocity, powerGpm, series, totalHead, type Curve } from '../engine/pump'
import { BNBC, demandSide, demandSideBnbc, harvest, monthlyFromLpd, RAIN_TABLES, RUNOFF, supplySide } from '../engine/rwh'
import { costCurve, economicTank, galToFt3 } from '../engine/tank'
import { MassCurve } from '../figs/rwh-charts'
import { Key } from './chem'
import type { EvRefItem } from './pane'

const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const R = String.raw

/** small select used in lookups */
function Pick<T extends string>({ label, value, onChange, opts }: { label: string; value: T; onChange: (v: T) => void; opts: { v: T; t: string }[] }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-mute">{label}</span>
      <select className="field !py-0.5 !px-1.5 !text-xs" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {opts.map((o) => (
          <option key={o.v} value={o.v}>
            {o.t}
          </option>
        ))}
      </select>
    </label>
  )
}

// ---------------------------------------------------------------- r-runoff
function RunoffBody() {
  const [A, setA] = useState(190)
  const [rain, setRain] = useState(1056)
  const [C, setC] = useState(0.9)
  const good = [A, rain, C].every((v) => ok(v) && v >= 0)
  return (
    <>
      <Md>{R`$$V = A\,(\text{m}^2)\times R\,(\text{m})\times C\qquad(\text{monthly or annual})$$`}</Md>
      <RT head={['Catchment surface', 'Runoff coefficient C']} rows={RUNOFF.map((r) => [r.name, `${r.lo} – ${r.hi}`])} cap="RM L6 p8 (Pacey et al. 1989)." />
      <Md className="text-xs mt-2">{R`**BNBC 2020 rules (RM L6):**
- RWH required for buildings with roof area ≥ **${BNBC.thresholdM2} m²**.
- Catchment: flat terrace = plan area + **50 %** of the adjoining vertical wall area; inclined roof = the inclined area (not the footprint).
- At least **${BNBC.minRdp} RDPs** per independent roof, each ≥ **${BNBC.minRdpDiameterMm} mm** dia.
- First-flush diversion: Dhaka **20 min**; Sylhet, Chittagong and other urban areas **15 min**.
- Storage: **90 dry days** for drinking, cooking, utensil cleaning, bathing and ablution; **210 days** for other uses; + **10 %** freeboard.
- Disinfection: chlorine 1 ppm, contact time from the BNBC pH/temperature table.`}</Md>
      <Lookup result={good ? <span>V = {f1(A)} × {f3(rain / 1000)} × {f2(C)} = <b>{f2(harvest(A, rain, C))} m³</b> ({f1((harvest(A, rain, C) * 1000) / 365)} L/d over a year)</span> : '—'}>
        <NumIn label="A" value={A} onChange={setA} step={10} unit="m²" w="w-16" />
        <NumIn label="R" value={rain} onChange={setRain} step={10} unit="mm" w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={0.05} w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (dispensary, L6): 190 × 1.056 × 0.9 = 180.58 m³/yr = 494.7 L/d.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-rwhdem
function RwhDemBody() {
  const [n, setN] = useState(6)
  const [q, setQ] = useState(10)
  const [d, setD] = useState(100)
  const [qp, setQp] = useState(20)
  const [qo, setQo] = useState(100)
  const a = [n, q, d].every((v) => ok(v) && v >= 0) ? demandSide({ users: n, perCapita: q, days: d }) : null
  const b = [n, qp, qo].every((v) => ok(v) && v >= 0) ? demandSideBnbc({ users: n, potable: qp, other: qo }) : null
  return (
    <>
      <Md>{R`$$V = n \times d \times q\qquad V_{design} = 1.10\,V\ (\text{10 \% freeboard})$$
- BNBC split: $V = n\,(90\,q_{potable} + 210\,q_{other})$.
- "N dry months": d = N × 30 days.
- Check the roof can fill it in the wet season ($A R C \ge V$); if not, the supply side governs.`}</Md>
      <Lookup result={a ? <span>V = {n} × {d} × {q} = {fmt(a.V, 0)} L + {fmt(a.freeboard, 0)} L = <b>{f2(a.designM3)} m³</b></span> : '—'}>
        <NumIn label="n" value={n} onChange={setN} step={1} w="w-14" />
        <NumIn label="q" value={q} onChange={setQ} step={5} unit="lpcd" w="w-14" />
        <NumIn label="d" value={d} onChange={setD} step={10} unit="days" w="w-14" />
      </Lookup>
      <Lookup result={b ? <span>{n}(90 × {qp} + 210 × {qo}) = {fmt(b.V, 0)} L → × 1.10 = <b>{f2(b.designM3)} m³</b></span> : '—'}>
        <span className="text-mute text-xs">BNBC 90 / 210</span>
        <NumIn label="q potable" value={qp} onChange={setQp} step={5} unit="lpcd" w="w-14" />
        <NumIn label="q other" value={qo} onChange={setQo} step={5} unit="lpcd" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (L6): 6 × 100 × 10 = 6000 L + 600 L = 6.6 m³. 2023-24 Q3(d): 7 people, 15 lpcd, 3 dry months → 7 × 15 × 90 × 1.1 = 10.4 m³.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-rwhmass
function RwhMassBody() {
  const [tbl, setTbl] = useState(RAIN_TABLES[0].id)
  const [A, setA] = useState(190)
  const [C, setC] = useState(0.9)
  const [lpd, setLpd] = useState(715)
  const rain = RAIN_TABLES.find((t) => t.id === tbl)?.rain ?? RAIN_TABLES[0].rain
  const good = [A, C, lpd].every((v) => ok(v) && v > 0)
  const s = good ? supplySide({ area: A, C, rain, demandPerMonth: monthlyFromLpd(lpd) }) : null
  return (
    <>
      <Md>{R`1. Monthly harvest = A × rain × C; annual harvest $= \Sigma$.
2. Demand per month = L/d × 365/12 ÷ 1000. If the annual demand > annual harvest, **use harvest/12 instead** (supply governs).
3. Start at the first dry month (October); columns: harvest, Σ harvest, demand, Σ demand, **difference = Σ harvest − Σ demand**.
4. **Tank = the largest difference.**`}</Md>
      {s && <MassCurve rows={s.rows} tank={s.maxDiff} height={250} />}
      {s && (
        <RT
          head={['Month', 'Harvest', 'Σ H', 'Σ D', 'Diff']}
          rows={s.rows.map((r) => [r.month, f2(r.harvest), f2(r.cumHarvest), f2(r.cumDemand), f2(r.diff)])}
          hl={(i) => s.rows[i].month === s.maxDiffMonth}
          cap={`m³. Harvest ${f2(s.annualHarvest)} m³/yr; demand ${f2(s.demandAsked)} m³/month${s.supplyGoverns ? ` > supply, so ${f2(s.demandUsed)} m³/month is used` : ''}.`}
        />
      )}
      <Lookup result={s ? <span>Tank = largest difference = <b>{f2(s.maxDiff)} m³</b> ({s.maxDiffMonth})</span> : 'A, C, demand > 0'}>
        <Pick label="rain" value={tbl} onChange={setTbl} opts={RAIN_TABLES.map((t) => ({ v: t.id, t: t.label }))} />
        <NumIn label="A" value={A} onChange={setA} step={10} unit="m²" w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={0.05} w="w-14" />
        <NumIn label="demand" value={lpd} onChange={setLpd} step={50} unit="L/d" w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (dispensary): 7 × 45 + 40 × 10 = 715 L/d = 21.75 m³/month &gt; 15.05 available → tank 50.45 m³ (April).</div>
    </>
  )
}

// ---------------------------------------------------------------- r-units
function UnitsBody() {
  const [gpm, setGpm] = useState(7200)
  const [hp, setHp] = useState(186.5)
  const cfs = cfsFromGpm(gpm)
  return (
    <>
      <RT
        head={['Quantity', 'Her conversion']}
        rows={[
          ['1 British (Imperial) gallon', '0.16 ft³ (= 4.546 L)'],
          ['Q (cfs)', 'Q (gpm) × 0.16 / 60'],
          ['1 ft³', '28.32 L'],
          ['g', '32.2 ft/s² · 9.81 m/s²'],
          ['Water hp (ft, gpm)', 'H × Q / 3960'],
          ['Water hp (metric)', 'γ H Q / 75 (γ kg/m³, H m, Q m³/s)'],
          ['Water power (kW)', '9.81 Q H (Q m³/s, H m)'],
          ['1 hp', '0.746 kW'],
          ['BHP (input)', 'water hp / efficiency'],
          ['1 cusec', '≈ 100 m³/h ≈ 1 lakh L/h'],
        ]}
        cap="RM L8 p40–41. 3960 is the US-gallon constant; with British gpm the exact one is 3300 — the slide uses 3960, so follow it (digest doubt 1). The slide prints 19.26 cfs for 7200 gpm (exact 19.2)."
      />
      <Lookup result={ok(gpm) && ok(hp) ? <span>{fmt(gpm, 0)} gpm = <b>{f2(cfs)} cfs</b> = {f1(cfs * 28.3168)} L/s · {f1(hp)} hp = <b>{f1(hp * 0.7457)} kW</b></span> : '—'}>
        <NumIn label="Q" value={gpm} onChange={setGpm} step={100} unit="gpm" w="w-20" />
        <NumIn label="P" value={hp} onChange={setHp} step={10} unit="hp" w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- r-head
function HeadBody() {
  const [gpm, setGpm] = useState(7200)
  const [L, setL] = useState(800)
  const [hs, setHs] = useState(60)
  const [v, setV] = useState(12)
  const [f, setF] = useState(0.0075)
  const [eta, setEta] = useState(70)
  const good = [gpm, L, hs, v, f, eta].every(ok) && gpm > 0 && v > 0 && eta > 0
  const p = good ? pipeFromVelocity(cfsFromGpm(gpm), v) : null
  const h = p ? totalHead({ hs, f, L, v, d: p.d, g: 32.2 }) : null
  const pw = h ? powerGpm(h.H, gpm, eta / 100) : null
  return (
    <>
      <Md>{R`$$H = h_s + h_f + h_v\,(+h_m),\qquad h_f = \frac{f\,L\,v^2}{2gd},\quad h_v = \frac{v^2}{2g},\quad h_m = \Sigma K\frac{v^2}{2g}$$
$$P_W = \frac{H\,Q_{gpm}}{3960}\ \text{hp}\qquad P_W = \gamma Q H\qquad BHP = \frac{P_W}{\eta}$$
- Her f is used **as given, no factor 4** (Example 1 f = 0.0075; Example 2 f = 0.01).
- Pipe: $A = Q/v$, $d = \sqrt{4A/\pi}$. Q from demand: $Q = \dfrac{\text{gpcd}\times P}{\text{hours}\times 60}$ gpm (× max-day factor if given).
- Lift suction: $h_s = H_D + H_S$; flooded suction: $h_s = H_D - H_S$.`}</Md>
      <Lookup
        result={
          h && p && pw ? (
            <span>
              Q {f2(p.Q)} cfs · d <b>{f2(p.d)} ft</b> · h<sub>f</sub> {f2(h.hf)} · h<sub>v</sub> {f2(h.hv)} · H <b>{f2(h.H)} ft</b> · water hp <b>{f2(pw.waterHp)}</b> · BHP <b>{f1(pw.inputHp)}</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="Q" value={gpm} onChange={setGpm} step={100} unit="gpm" w="w-20" />
        <NumIn label="L" value={L} onChange={setL} step={50} unit="ft" w="w-16" />
        <NumIn label="hs" value={hs} onChange={setHs} step={5} unit="ft" w="w-14" />
        <NumIn label="v" value={v} onChange={setV} step={1} unit="ft/s" w="w-14" />
        <NumIn label="f" value={f} onChange={setF} step={0.0005} w="w-16" />
        <NumIn label="η" value={eta} onChange={setEta} step={5} unit="%" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (L8 Example 1): 7200 gpm, 800 ft, hs 60 ft, 12 ft/s, f 0.0075, 70 % → d 1.4 ft, hf 9.58, hv 2.24, H 71.82 ft, 130.58 hp, BHP 186.5 hp.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-minor
const K_ROWS: [string, string, number][] = [
  ['Pipe entrance', 'square edge, r/d = 0', 0.5],
  ['Pipe entrance', 'r/d = 0.1', 0.12],
  ['Pipe entrance', 'well rounded, r/d > 0.2', 0.03],
  ['Contraction (θ = 180°)', 'D₂/D₁ = 0 / 0.4 / 0.8', 0.5],
  ['90° miter bend', 'without vanes', 1.1],
  ['90° miter bend', 'with vanes', 0.2],
  ['90° smooth bend', 'r/d = 1', 0.35],
  ['90° smooth bend', 'r/d = 2 / 4 / 10', 0.19],
  ['Globe valve', 'wide open', 10],
  ['Angle valve', 'wide open', 5],
  ['Gate valve', 'wide open', 0.2],
  ['Gate valve', 'half open', 5.6],
  ['Return bend', 'threaded', 2.2],
  ['Tee', 'straight through', 0.4],
  ['Tee', 'side outlet', 1.8],
  ['90° elbow', 'threaded', 0.9],
  ['45° elbow', 'threaded', 0.4],
  ['Pipe exit', 'into a tank', 1],
]
function MinorBody() {
  const [sumK, setSumK] = useState(1.38)
  const [v, setV] = useState(4.44)
  return (
    <>
      <Md>{R`$$h_m = K\frac{V^2}{2g}\qquad h_L = h_f + \Sigma h_m$$`}</Md>
      <RT
        head={['Fitting', 'Condition', 'K']}
        rows={K_ROWS.map(([a, b, k]) => [a, b, String(k)])}
        cap="RM L8 p37–38 (Crowe Table 10.5). Contraction D₂/D₁ = 0 / 0.4 / 0.8: K = 0.50 / 0.42 / 0.20 (θ = 180°), 0.08 / 0.07 / 0.06 (θ = 60°); smooth bend r/d = 2 / 4 / 6 / 10: 0.19 / 0.16 / 0.21 / 0.32. Expansion K table was illegible on the slide (doubt 5)."
      />
      <Lookup result={ok(sumK) && ok(v) ? <span>h<sub>m</sub> = {f2(sumK)} × {f2(v)}² / (2 × 9.81) = <b>{f3((sumK * v * v) / (2 * 9.81))} m</b></span> : '—'}>
        <NumIn label="ΣK" value={sumK} onChange={setSumK} step={0.05} w="w-16" />
        <NumIn label="V" value={v} onChange={setV} step={0.1} unit="m/s" w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">L8 Example 3: entrance 0.03 + bend 0.35 + exit 1 = ΣK 1.38; V = 0.314/(π·0.3²/4) = 4.44 m/s.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-curves (2012-13 Q1(b) data)
const PUMP_PTS: [number, number][] = [
  [0, 40],
  [0.02, 39],
  [0.04, 36],
  [0.06, 29],
  [0.08, 20],
  [0.1, 8],
]
const SYS_PTS: [number, number][] = [
  [0, 30],
  [0.02, 32],
  [0.04, 34],
  [0.06, 37],
  [0.08, 40],
  [0.1, 44],
]
function CurvesBody() {
  const [dz, setDz] = useState(2)
  const pump = interp(PUMP_PTS)
  const sMin = interp(SYS_PTS)
  const sMax: Curve = (Q) => sMin(Q) + (ok(dz) ? dz : 0)
  const combos: { k: string; c: Curve; hi: number; col: string; dash?: boolean }[] = [
    { k: 'one pump', c: pump, hi: 0.11, col: 'var(--c-accent)' },
    { k: 'two in parallel', c: parallel(pump), hi: 0.22, col: 'var(--c-water)' },
    { k: 'two in series', c: series(pump), hi: 0.11, col: 'var(--c-load)' },
  ]
  const Qs = (hi: number) => Array.from({ length: 61 }, (_, i) => (i / 60) * hi)
  const ops = combos.map((cb) => ({ ...cb, min: operatingPoint(cb.c, sMin, 0, cb.hi), max: operatingPoint(cb.c, sMax, 0, cb.hi) }))
  return (
    <>
      <Md>{R`- **Operating point** = where the falling pump (H–Q) curve meets the rising system curve $H_{sys} = h_s + kQ^2$.
- **Parallel:** add discharges at the same head, $H(Q) = H_1(Q/2)$ — more flow, but less than double (system friction rises).
- **Series:** add heads at the same discharge, $H(Q) = 2H_1(Q)$.
- Higher static lift (lower suction level / higher delivery level) shifts the system curve up by the level difference.`}</Md>
      <Chart w={360} h={230} x={{ min: 0, max: 0.16, label: 'Q (m³/s)', ticks: [0, 0.04, 0.08, 0.12, 0.16] }} y={{ min: 0, max: 80, label: 'H (m)', ticks: [0, 20, 40, 60, 80] }} label="pump and system curves">
        {(s) => (
          <>
            <path d={pathOf(Qs(0.16).map((q) => [q, sMin(q)]), s)} fill="none" stroke="var(--c-bad)" strokeWidth={1.6} />
            <path d={pathOf(Qs(0.16).map((q) => [q, sMax(q)]), s)} fill="none" stroke="var(--c-bad)" strokeWidth={1.2} strokeDasharray="4 3" />
            {combos.map((cb) => (
              <path key={cb.k} d={pathOf(Qs(Math.min(cb.hi, 0.16)).map((q) => [q, cb.c(q)] as [number, number]).filter(([, h]) => h >= 0 && h <= 80), s)} fill="none" stroke={cb.col} strokeWidth={1.8} />
            ))}
            {ops.flatMap((o) =>
              [o.min, o.max].map((p, i) => (p ? <circle key={o.k + i} cx={s.X(p.Q)} cy={s.Y(p.H)} r={3} fill={o.col} stroke="var(--c-bg)" data-tip={`${o.k}: Q = ${f3(p.Q)} m³/s, H = ${f1(p.H)} m`} /> : null)),
            )}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-accent)', t: 'one pump' }, { c: 'var(--c-water)', t: 'parallel' }, { c: 'var(--c-load)', t: 'series' }, { c: 'var(--c-bad)', t: 'system (min level)' }, { c: 'var(--c-bad)', t: 'system + Δz', dash: true }]} />
      <RT
        head={['Pumps', 'Min level Q (m³/s)', 'H (m)', 'Max level Q', 'H (m)']}
        rows={ops.map((o) => [o.k, o.min ? f3(o.min.Q) : '—', o.min ? f1(o.min.H) : '—', o.max ? f3(o.max.Q) : '—', o.max ? f1(o.max.H) : '—'])}
        cap="2012-13 Q1(b) data, straight lines between the printed points (read off a hand-drawn graph you'll get ±0.002 m³/s)."
      />
      <Lookup result={<span>system curve shifted by {ok(dz) ? f1(dz) : '0'} m</span>}>
        <NumIn label="Δ level" value={dz} onChange={setDz} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- r-npsh
const VP: [number, number][] = [
  [10, 1.23],
  [15, 1.71],
  [20, 2.34],
  [25, 3.17],
  [30, 4.25],
  [40, 7.38],
  [50, 12.35],
]
function NpshBody() {
  const [patm, setPatm] = useState(101.3)
  const [Hs, setHs] = useState(-2)
  const [hL, setHL] = useState(0.2)
  const [pv, setPv] = useState(2.3)
  const [gam, setGam] = useState(9982)
  const [req, setReq] = useState(5)
  const good = [patm, Hs, hL, pv, gam].every(ok) && gam > 0
  const Habs = good ? headFromKPa(patm, gam) : NaN
  const Hvp = good ? headFromKPa(pv, gam) : NaN
  const av = good ? npshAvailable({ Habs, Hs, hL, Hvp }) : NaN
  return (
    <>
      <Md>{R`$$NPSH_{av} = H_{abs} + H_S - h_L - H_{vp}$$
$H_{abs}$ = atmospheric head on the suction-well surface ($p_{atm}/\gamma$); $H_S$ = suction head (**+ flooded**, **− lift**: pump above the water); $h_L$ = losses in the suction pipe; $H_{vp} = p_v/\gamma$.
- Need $NPSH_{av} > NPSH_{req}$, with **at least 1 m margin** (L8 p45); otherwise cavitation.
- If close: raise the suction-well level, lower the pump, enlarge the suction pipe (less $h_L$), or change the pump.`}</Md>
      <RT head={['T (°C)', 'p_v (kPa)', 'H_vp (m)']} rows={VP.map(([t, p]) => [String(t), String(p), f3(headFromKPa(p))])} hl={(i) => VP[i][0] === 20} cap="Standard steam-table values — not on her slides; the 2012-13 Q3(b) paper gives 2.3 kPa at 20 °C and γ = 9982 N/m³." />
      <Lookup
        result={
          good ? (
            <span>
              H<sub>abs</sub> {f2(Habs)} + ({f2(Hs)}) − {f2(hL)} − {f3(Hvp)} = <b>{f2(av)} m</b>
              {ok(req) && <> · {av >= req + 1 ? '✓ ≥ NPSHreq + 1 m' : '✗ less than NPSHreq + 1 m: cavitation risk'}</>}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="p atm" value={patm} onChange={setPatm} step={0.5} unit="kPa" w="w-16" />
        <NumIn label="Hs" value={Hs} onChange={setHs} step={0.5} unit="m" w="w-14" />
        <NumIn label="hL" value={hL} onChange={setHL} step={0.1} unit="m" w="w-14" />
        <NumIn label="p v" value={pv} onChange={setPv} step={0.1} unit="kPa" w="w-14" />
        <NumIn label="γ" value={gam} onChange={setGam} step={10} unit="N/m³" w="w-16" />
        <NumIn label="NPSH req" value={req} onChange={setReq} step={0.5} unit="m" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">2012-13 Q3(b): wet well 38 m, pump 40 m → H<sub>S</sub> = −2 m (lift); put in the suction-pipe loss you computed.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-intake
function IntakeBody() {
  const [v, setV] = useState(0.2)
  const [cd, setCd] = useState(0.7)
  const [vv, setVv] = useState(0)
  return (
    <>
      <Md>{R`$$\text{Intake port (orifice): } H_L = \frac{1}{2g}\Big(\frac{v}{C_d}\Big)^2,\ C_d = 0.6\text{–}0.9\qquad \text{Screen: } H_L = \frac{v^2 - v_v^2}{2g}\times\frac{1}{0.7}$$
$v$ = velocity through the opening; $v_v$ = approach velocity upstream (0 mostly). $Q = Av$.`}</Md>
      <RT
        head={['Where', 'Design velocity / rule']}
        rows={[
          ['Through the bar rack (coarse screen)', '< 8 cm/s (0.3 fps)'],
          ['Through the fine screen', '< 0.2 m/s (0.6 fps) in the example; 0.4–0.8 m/s generally'],
          ['Coarse screen bars', '2–3 in clear spacing, outside the intake'],
          ['Fine screen', '¼ in square mesh'],
          ['Canal intake', 'outlet pipe 1.5 m/s; coarse screen 0.15 m/s'],
          ['Conduit to the pump well', '1.0–1.5 m/s'],
          ['Submerged intake', '2–2.5 m above the bed; ports ≥ 2 m below the surface, 1 m above the bottom'],
        ]}
        cap="RM L7 p21–22 and the dry-tower design example (p35–37)."
      />
      <Lookup result={ok(v) && ok(cd) && cd > 0 && ok(vv) ? <span>port H<sub>L</sub> = <b>{fmt(((v / cd) ** 2) / (2 * 9.81), 4)} m</b> · screen H<sub>L</sub> = <b>{fmt((v * v - vv * vv) / (2 * 9.81) / 0.7, 4)} m</b></span> : '—'}>
        <NumIn label="v" value={v} onChange={setV} step={0.05} unit="m/s" w="w-14" />
        <NumIn label="Cd" value={cd} onChange={setCd} step={0.05} w="w-14" />
        <NumIn label="v v" value={vv} onChange={setVv} step={0.05} unit="m/s" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- r-hw
const GPM_PER_CFS = 448.83
/** Hazen–Williams (British): head loss per 1000 ft for Q (US gpm), D (in), C */
const hwPer1000 = (gpm: number, Din: number, C: number) => {
  const D = Din / 12
  const V = gpm / GPM_PER_CFS / ((Math.PI * D * D) / 4)
  return 1000 * (V / (0.55 * C * D ** 0.63)) ** (1 / 0.54)
}
const HW_D = [6, 8, 10, 12, 16]
const HW_Q = Array.from({ length: 61 }, (_, i) => 10 ** (2 + (i / 60) * 2))
function HwBody() {
  const [Q, setQ] = useState(825)
  const [D, setD] = useState(10)
  const [C, setC] = useState(130)
  const [B, setB] = useState(3)
  const [y, setY] = useState(1.2)
  const [S, setS] = useState(0.0004)
  const [n, setN] = useState(0.015)
  const good = [Q, D, C].every((v) => ok(v) && v > 0)
  const q100 = good ? (Q * 100) / C : NaN
  const Rh = (B * y) / (2 * y + B)
  const Vm = (1 / n) * Rh ** (2 / 3) * Math.sqrt(S)
  const mGood = [B, y, S, n].every((v) => ok(v) && v > 0)
  return (
    <>
      <Md>{R`$$V = 1.318\,C\,R^{0.63}h_L^{0.54} = 0.55\,C\,D^{0.63}h_L^{0.54}\quad(\text{ft, s};\ h_L\ \text{ft per ft})$$
**Nomograph is for C = 100**: first correct the flow, $Q_{100} = Q\times\dfrac{100}{C}$ (V, Q ∝ C), then read $h_L$ per 1000 ft.
Manning (open channel): $V = \frac{1}{n}R^{2/3}S^{1/2}$ (SI), $\frac{1.49}{n}$ (British); rectangular $R = \frac{By}{2y + B}$.`}</Md>
      <Chart w={360} h={230} x={{ min: 100, max: 10000, log: true, label: 'Q (gpm), C = 100' }} y={{ min: 0.1, max: 100, log: true, label: 'hL (ft / 1000 ft)' }} label="Hazen–Williams head loss, C = 100">
        {(s) => (
          <>
            {HW_D.map((d, i) => (
              <g key={d}>
                <path d={pathOf(HW_Q.map((q) => [q, hwPer1000(q, d, 100)] as [number, number]).filter(([, h]) => h >= 0.1 && h <= 100), s)} fill="none" stroke={['var(--c-accent)', 'var(--c-water)', 'var(--c-load)', 'var(--c-good)', 'var(--c-accent2)'][i]} strokeWidth={1.5} />
              </g>
            ))}
            {good && hwPer1000(q100, D, 100) >= 0.1 && hwPer1000(q100, D, 100) <= 100 && q100 >= 100 && q100 <= 10000 && <circle cx={s.X(q100)} cy={s.Y(hwPer1000(q100, D, 100))} r={3.5} fill="var(--c-bad)" />}
          </>
        )}
      </Chart>
      <Key items={HW_D.map((d, i) => ({ c: ['var(--c-accent)', 'var(--c-water)', 'var(--c-load)', 'var(--c-good)', 'var(--c-accent2)'][i], t: `${d} in` }))} />
      <RT head={['C', 'Conduit']} rows={[['140', 'smooth lined steel, very smooth concrete, new cast iron'], ['130', 'ordinary cast iron, good condition'], ['120', 'cast iron 5 yr old, welded steel'], ['110', 'cast iron 10 yr, new unlined riveted steel'], ['100', 'cast iron 15–20 yr'], ['95', 'unlined riveted steel in service']]} cap="RM L9 p6. The curves above are the formula with US gallons (the nomograph's units)." />
      <Lookup result={good ? <span>Q<sub>100</sub> = {fmt(Q, 0)} × 100/{fmt(C, 0)} = {fmt(q100, 0)} gpm → h<sub>L</sub> = <b>{f2(hwPer1000(q100, D, 100))} ft / 1000 ft</b></span> : '—'}>
        <NumIn label="Q" value={Q} onChange={setQ} step={25} unit="gpm" w="w-16" />
        <NumIn label="D" value={D} onChange={setD} step={1} unit="in" w="w-14" />
        <NumIn label="C" value={C} onChange={setC} step={5} w="w-14" />
      </Lookup>
      <Lookup result={mGood ? <span>R = {f3(Rh)} m · V = <b>{f3(Vm)} m/s</b> · Q = <b>{f3(Vm * B * y)} m³/s</b></span> : '—'}>
        <span className="text-mute text-xs">Manning</span>
        <NumIn label="B" value={B} onChange={setB} step={0.5} unit="m" w="w-14" />
        <NumIn label="y" value={y} onChange={setY} step={0.1} unit="m" w="w-14" />
        <NumIn label="S" value={S} onChange={setS} step={0.0001} w="w-20" />
        <NumIn label="n" value={n} onChange={setN} step={0.001} w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (TRN-1): 10 in, C = 130, 825 gpm → Q₁₀₀ = 635 gpm → nomograph 4.2 ft per 1000 ft (formula ≈ 4.3). Manning n: troweled concrete 0.012, unfinished concrete 0.015, earth straight 0.023 (L9 p5).</div>
    </>
  )
}

// ---------------------------------------------------------------- r-hammer
function HammerBody() {
  const [L, setL] = useState(1000)
  const [D, setD] = useState(0.5)
  const [t, setT] = useState(10)
  const [E, setE] = useState(200)
  const [dv, setDv] = useState(1.5)
  const [T, setTT] = useState(1)
  const good = [L, D, t, E, dv, T].every((v) => ok(v) && v > 0)
  const a = good ? waveSpeed({ D, t: t / 1000, E: E * 1e9 }) : NaN
  const Tc = good ? criticalTime(L, a) : NaN
  const r = good ? hammerRise({ L, a, dv, T }) : null
  const Ts = good ? Array.from({ length: 81 }, (_, i) => (i / 80) * 5 * Tc) : []
  const dh = (TT: number) => hammerRise({ L, a, dv, T: Math.max(TT, 1e-6) }).dH
  return (
    <>
      <Md>{R`$$a = \sqrt{\frac{K/\rho}{1 + \dfrac{K D}{E\,t}}}\qquad T_c = \frac{2L}{a}$$
$$T \le T_c:\ \Delta h = \frac{a\,\Delta v}{g}\ (\text{Joukowsky})\qquad T > T_c:\ \Delta h = \frac{2L\,\Delta v}{g\,T}$$
Standard (textbook) forms — **her L9 slides have no water-hammer formula**, only the four phases and the remedies: slow valve closure, air chamber, surge tank/tower, surge-control and pressure-relief valves. K = 2.19 GPa, ρ = 1000 kg/m³.`}</Md>
      {good && (
        <Chart w={360} h={210} x={{ min: 0, max: 5 * Tc, label: 'closure time T (s)' }} y={{ min: 0, max: dh(0) * 1.1, label: 'Δh (m)' }} label="pressure rise against closure time">
          {(s) => (
            <>
              <path d={pathOf(Ts.map((x) => [x, dh(x)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              <line x1={s.X(Tc)} x2={s.X(Tc)} y1={s.T} y2={s.B} stroke="var(--c-faint)" strokeDasharray="4 3" />
              <text x={s.X(Tc) + 3} y={s.T + 10} fontSize={8} fill="var(--c-mute)">
                2L/a
              </text>
              {T <= 5 * Tc && <circle cx={s.X(T)} cy={s.Y(dh(T))} r={3.5} fill="var(--c-load)" />}
            </>
          )}
        </Chart>
      )}
      <Lookup
        result={
          r ? (
            <span>
              a = <b>{fmt(a, 0)} m/s</b> · 2L/a = {f2(Tc)} s · {r.rapid ? 'rapid' : 'slow'} closure → Δh = <b>{f1(r.dH)} m</b> ({f1(r.dp / 1000)} kPa)
            </span>
          ) : (
            'all > 0'
          )
        }
      >
        <NumIn label="L" value={L} onChange={setL} step={100} unit="m" w="w-16" />
        <NumIn label="D" value={D} onChange={setD} step={0.05} unit="m" w="w-14" />
        <NumIn label="t" value={t} onChange={setT} step={1} unit="mm" w="w-14" />
        <NumIn label="E" value={E} onChange={setE} step={10} unit="GPa" w="w-14" />
        <NumIn label="Δv" value={dv} onChange={setDv} step={0.1} unit="m/s" w="w-14" />
        <NumIn label="T" value={T} onChange={setTT} step={0.5} unit="s" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Rigid pipe: a = √(K/ρ) ≈ {fmt(Math.sqrt(2.19e9 / 1000), 0)} m/s. Steel E ≈ 200 GPa. g = {G_SI_H} m/s².</div>
    </>
  )
}

// ---------------------------------------------------------------- r-stress
const C_TABLE: { hb: number; c: [number, number, number, number] }[] = [
  { hb: 1, c: [0.84, 0.86, 0.88, 0.9] },
  { hb: 2, c: [1.45, 1.5, 1.55, 1.62] },
  { hb: 3, c: [1.9, 2.0, 2.1, 2.2] },
  { hb: 4, c: [2.22, 2.33, 2.49, 2.65] },
  { hb: 5, c: [2.45, 2.6, 2.78, 3.04] },
  { hb: 6, c: [2.6, 2.7, 3.04, 3.33] },
  { hb: 7, c: [2.75, 2.95, 3.23, 3.57] },
  { hb: 8, c: [2.8, 3.03, 3.37, 3.76] },
  { hb: 9, c: [2.88, 3.11, 3.48, 3.92] },
  { hb: 10, c: [2.92, 3.17, 3.56, 4.04] },
  { hb: 12, c: [2.97, 3.24, 3.68, 4.22] },
  { hb: 14, c: [3.0, 3.28, 3.75, 4.34] },
]
const FILLS = ['Sand and gravel', 'Saturated top soil', 'Clay', 'Saturated clay']
function cAt(hb: number, k: number) {
  const t = C_TABLE
  if (hb <= t[0].hb) return t[0].c[k]
  for (let i = 1; i < t.length; i++) if (hb <= t[i].hb) return t[i - 1].c[k] + ((t[i].c[k] - t[i - 1].c[k]) * (hb - t[i - 1].hb)) / (t[i].hb - t[i - 1].hb)
  return t[t.length - 1].c[k]
}
function StressBody() {
  const [H, setH] = useState(9)
  const [B, setB] = useState(3.5)
  const [fill, setFill] = useState('0')
  const [gam, setGam] = useState(120)
  const [Dp, setDp] = useState(3)
  const k = +fill
  const good = [H, B, gam, Dp].every((v) => ok(v) && v > 0)
  const c = good ? cAt(H / B, k) : NaN
  return (
    <>
      <Md>{R`$$\text{Hoop } S_h = \frac{pd}{2t}\qquad \text{Longitudinal } S_t = \frac{pd}{4t}\qquad \text{Thermal } \sigma = E\,\alpha\,\Delta T$$
$$\text{Trench (earth) load: rigid } w = c\,\gamma B^2,\quad \text{flexible } w = c\,\gamma B D\quad(\text{lb/ft})$$
Superimposed: concentrated $w = c_1 P\,(I/L)$, distributed $w = c_1\,p\,I\,D$; impact factor **I = 1.50 highway, 1.75 railway, 1.00 airfield**.`}</Md>
      <RT head={['H/B', ...FILLS]} rows={C_TABLE.map((r) => [String(r.hb), ...r.c.map((x) => x.toFixed(2))])} hl={(i) => good && Math.abs(C_TABLE[i].hb - H / B) < 0.5} cap="Coefficient c (RM L9 p37, Table 4.1); γ = 100 / 100 / 120 / 130 lb/ft³. Interpolate linearly in H/B. A few digits are blurred on the slide." />
      <Lookup result={good ? <span>H/B = {f2(H / B)} → c = <b>{f3(c)}</b> · rigid w = <b>{fmt(c * gam * B * B, 0)} lb/ft</b> · flexible w = {fmt(c * gam * B * Dp, 0)} lb/ft</span> : '—'}>
        <NumIn label="H" value={H} onChange={setH} step={0.5} unit="ft" w="w-14" />
        <NumIn label="B" value={B} onChange={setB} step={0.5} unit="ft" w="w-14" />
        <Pick label="fill" value={fill} onChange={setFill} opts={FILLS.map((t, i) => ({ v: String(i), t }))} />
        <NumIn label="γ" value={gam} onChange={setGam} step={5} unit="lb/ft³" w="w-14" />
        <NumIn label="D" value={Dp} onChange={setDp} step={0.5} unit="ft" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">L9 Problem 1: B 3.5 ft, 9 ft of wet sand (120 lb/ft³). Problem 2: 3 ft steel (flexible) pipe, B 4 ft, clay 120, 6 ft cover. No slide solutions.</div>
    </>
  )
}

// ---------------------------------------------------------------- r-wsp
const LIKE = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain']
const IMP = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic']
const band = (s: number) => (s >= 15 ? { t: 'High', c: 'var(--c-bad)' } : s >= 6 ? { t: 'Medium', c: 'var(--c-load)' } : { t: 'Low', c: 'var(--c-good)' })
function WspBody() {
  const [cell, setCell] = useState<[number, number]>([5, 4])
  const [l, i] = cell
  const b = band(l * i)
  return (
    <>
      <Md>{R`$$\text{Risk score} = \text{Likelihood}\ (1\text{–}5)\times\text{Impact / severity}\ (1\text{–}5)$$
Bands: **Low ≤ 5**, **Medium 6–14**, **High ≥ 15**. Score the **initial** risk with no controls, then validate the controls and score the **residual** risk. Click a cell.`}</Md>
      <div className="overflow-x-auto scroll-thin">
        <table className="tbl ref-tbl">
          <thead>
            <tr>
              <th>Likelihood ↓ / Impact →</th>
              {IMP.map((t, k) => (
                <th key={t} className="!text-center">
                  {t} ({k + 1})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[5, 4, 3, 2, 1].map((L) => (
              <tr key={L}>
                <td className="txt">
                  {LIKE[L - 1]} ({L})
                </td>
                {[1, 2, 3, 4, 5].map((I) => {
                  const s = L * I
                  const sel = L === l && I === i
                  return (
                    <td key={I} className="!text-center cursor-pointer font-semibold" style={{ background: `color-mix(in oklab, ${band(s).c} ${sel ? 55 : 22}%, transparent)`, outline: sel ? '2px solid var(--c-ink)' : undefined }} onClick={() => setCell([L, I])}>
                      {s}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Lookup result={<span>{LIKE[l - 1]} ({l}) × {IMP[i - 1]} ({i}) = <b>{l * i}</b> → <b style={{ color: b.c }}>{b.t}</b></span>}>
        <span className="text-mute text-xs">selected cell</span>
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (L10 / 2017-18 Q7(b)): pit latrine within 10 m of a tubewell, no control → almost certain 5 × major 4 = 20, High; with ≥ 10 m distance → rare 1 × major 4 = 4, Low. (Her p24 table calls 15 "M" though the matrix makes it High.)</div>
    </>
  )
}

// ---------------------------------------------------------------- r-tank
function TankBody() {
  const [gal, setGal] = useState(100000)
  const [cf, setCf] = useState(1200)
  const [cw, setCw] = useState(1800)
  const good = [gal, cf, cw].every((v) => ok(v) && v > 0)
  const V = good ? galToFt3(gal) : NaN
  const e = good ? economicTank(V, cf, cw) : null
  const pts = e ? costCurve(V, cf, cw, e.D * 0.4, e.D * 2.2) : []
  const cMax = pts.length ? Math.max(...pts.map((p) => p.cost)) : 1
  return (
    <>
      <Md>{R`Cylindrical overhead tank, volume V fixed: $C = c_f\frac{\pi D^2}{4} + c_w\,\pi D H$ with $H = \frac{4V}{\pi D^2}$.
$$\frac{dC}{dD} = 0\ \Rightarrow\ D^3 = \frac{8\,c_w V}{\pi c_f},\qquad H = \frac{c_f\,D}{2\,c_w}$$
V from demand × detention time (e.g. 6 h); British gallon = 0.16 ft³. Textbook derivation — not worked on the CE22 slides.`}</Md>
      {e && (
        <Chart w={360} h={200} x={{ min: e.D * 0.4, max: e.D * 2.2, label: 'D (ft)' }} y={{ min: 0, max: cMax * 1.05, label: 'cost (Tk)', fmt: (v) => fmt(v / 1e6, 2) + 'M' }} label="tank cost against diameter">
          {(s) => (
            <>
              <path d={pathOf(pts.map((p) => [p.D, p.cost]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              <line x1={s.X(e.D)} x2={s.X(e.D)} y1={s.Y(e.cost)} y2={s.B} stroke="var(--c-load)" strokeDasharray="3 2" />
              <circle cx={s.X(e.D)} cy={s.Y(e.cost)} r={3.5} fill="var(--c-load)" />
            </>
          )}
        </Chart>
      )}
      <Lookup result={e ? <span>V = {fmt(V, 0)} ft³ → D = <b>{f2(e.D)} ft</b>, H = <b>{f2(e.H)} ft</b>, cost Tk {fmt(e.cost, 0)}</span> : '—'}>
        <NumIn label="V" value={gal} onChange={setGal} step={10000} unit="gal (Br)" w="w-24" />
        <NumIn label="floor" value={cf} onChange={setCf} step={50} unit="Tk/sft" w="w-16" />
        <NumIn label="wall" value={cw} onChange={setCw} step={50} unit="Tk/sft" w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">2020-21 Q2(c): 1 lakh gallon, floor Tk 1200, wall Tk 1800 per sft.</div>
    </>
  )
}

export const RM_ITEMS: EvRefItem[] = [
  { id: 'r-runoff', group: 'rm', title: 'Runoff coefficients and the BNBC 2020 RWH rules', tag: 'RM L6', exam: true, keywords: 'rwh rainwater harvesting catchment roof rdp first flush bnbc 90 210 days runoff coefficient', Body: RunoffBody },
  { id: 'r-rwhdem', group: 'rm', title: 'RWH tank, demand side: V = n·d·q + 10 %', tag: 'RM L6', exam: true, keywords: 'rwh rainwater tank demand side dry days dry months freeboard', Body: RwhDemBody },
  { id: 'r-rwhmass', group: 'rm', title: 'RWH tank, supply side: the mass curve', tag: 'RM L6', exam: true, keywords: 'rwh rainwater mass curve cumulative harvest demand difference supply side monthly rainfall', Body: RwhMassBody },
  { id: 'r-units', group: 'rm', title: 'Pump units: British gallon, cfs, 3960, hp ↔ kW', tag: 'RM L8', exam: true, keywords: 'gpm cfs cusec horsepower hp kw 3960 75 british imperial gallon conversion', Body: UnitsBody },
  { id: 'r-head', group: 'rm', title: 'Total head and pump power (her Example 1)', tag: 'RM L8', exam: true, keywords: 'pump head static friction velocity head darcy hf flv2/2gd water horsepower bhp efficiency rising main', Body: HeadBody },
  { id: 'r-minor', group: 'rm', title: 'Minor-loss coefficients K', tag: 'RM L8', exam: true, keywords: 'minor loss k entrance exit bend elbow valve tee contraction fitting', Body: MinorBody },
  { id: 'r-curves', group: 'rm', title: 'Pump & system curves, operating point, parallel and series', tag: 'RM L8', exam: true, keywords: 'operating point pump curve system curve parallel series characteristic head capacity', Body: CurvesBody },
  { id: 'r-npsh', group: 'rm', title: 'NPSH available and cavitation', tag: 'RM L8', exam: true, keywords: 'npsh net positive suction head cavitation vapour vapor pressure suction lift', Body: NpshBody },
  { id: 'r-intake', group: 'rm', title: 'Intake port and screen losses, design velocities', tag: 'RM L7', keywords: 'intake screen bar rack orifice cd head loss velocity coarse fine', Body: IntakeBody },
  { id: 'r-hw', group: 'rm', title: 'Hazen–Williams (C correction) and Manning', tag: 'RM L9', exam: true, keywords: 'hazen williams nomograph c 100 manning n open channel head loss per 1000 ft transmission', Body: HwBody },
  { id: 'r-hammer', group: 'rm', title: 'Water hammer: wave speed, 2L/a and the pressure rise', tag: 'RM L9', exam: true, keywords: 'water hammer surge joukowsky wave celerity closure time surge tank air chamber transient', Body: HammerBody },
  { id: 'r-stress', group: 'rm', title: 'Pipe stresses and trench (earth) loads', tag: 'RM L9', keywords: 'hoop longitudinal thermal stress marston trench load earth load impact factor c1 rigid flexible', Body: StressBody },
  { id: 'r-wsp', group: 'rm', title: 'WSP risk matrix: likelihood × severity', tag: 'RM L10', exam: true, keywords: 'water safety plan risk score likelihood severity impact matrix hazard', Body: WspBody },
  { id: 'r-tank', group: 'rm', title: 'Economic dimensions of an overhead tank', tag: 'papers', exam: true, keywords: 'overhead elevated tank economic dimension diameter height floor wall cost', Body: TankBody },
]
