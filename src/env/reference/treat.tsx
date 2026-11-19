// Chart pane, treatment-unit (t-) items: settling (Stokes, Type I column, Type II iso-removal, tank sizing), coagulation
// (alkalinity used, G and Gt), lime–soda softening and split treatment, ion exchange, Chick–Watson, breakpoint chlorination,
// filtration rates. Tanvir sir T05–T10, "Math procedures as taught" §4–§16 of the lecture digest.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import { breakthrough, homeSoftener } from '../engine/ix'
import { breakpointModel, chickWatson, residualAt, timeAtOtherC, timeForLogKill, type Zone } from '../engine/chlorine'
import { alkConsumed, alumNoAlkalinity, COAGULANTS, powerForG, velocityGradient, type Coagulant } from '../engine/coag'
import { CHART_2017, CHART_2021, CHART_2324, isoFromCurves, minTimeForRemoval, tankSize, terminalVelocity, typeIColumn, waterAt, WATER, dragCoefficient, type IsoChart } from '../engine/settle'
import { bars, masses, splitTreatment, treat, waterFromIons, type Mode } from '../engine/soften'
import { BarDiagram, SplitFlow } from '../figs/soft-bars'
import { IsoChartFig } from '../figs/sed-iso'
import { Key } from './chem'
import type { EvRefItem } from './pane'

const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const R = String.raw
const Note = ({ children }: { children: React.ReactNode }) => <div className="text-[11px] text-faint mt-1">{children}</div>

// ---------------------------------------------------------------- t-stokes
const RES = Array.from({ length: 121 }, (_, i) => 10 ** (-2 + (i / 120) * 7))
function StokesBody() {
  const [dmm, setD] = useState(0.5)
  const [sg, setSg] = useState(2.65)
  const [T, setT] = useState(20)
  const good = ok(dmm) && ok(sg) && ok(T) && dmm > 0 && sg > 1 && T >= 0 && T <= 30
  const w = good ? waterAt(T) : waterAt(20)
  const r = good ? terminalVelocity({ d: dmm / 1000, sg, rhoW: w.rho, mu: w.mu }) : null
  return (
    <>
      <Md>{R`$$v_s = \frac{g(\rho_s-\rho_w)d^2}{18\mu}\ \ (Re\le 1),\qquad Re = \frac{\rho_w v d}{\mu}$$
$$Re > 1:\ v = \sqrt{\frac{4g(\rho_s-\rho_w)d}{3C_D\rho_w}},\qquad C_D = \frac{24}{Re} + \frac{3}{\sqrt{Re}} + 0.34\ \ (1 < Re < 10^4),\ \ 0.4\ \text{above}$$
**Steps:** assume Stokes → find Re → if Re ≤ 1 done; else put Re in C_D, new v, new Re … repeat until v stops changing.`}</Md>
      <Chart w={360} h={220} x={{ min: 0.01, max: 1e5, log: true, label: 'Re (log)', minor: false }} y={{ min: 0.1, max: 1e4, log: true, label: 'C_D (log)', minor: false }} label="drag coefficient against Reynolds number">
        {(s) => (
          <>
            <path d={pathOf(RES.filter((x) => x <= 1e3).map((x) => [x, 24 / x]), s)} fill="none" stroke="var(--c-load)" strokeWidth={1} strokeDasharray="4 3" />
            <path d={pathOf(RES.map((x) => [x, dragCoefficient(x)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            <line x1={s.X(1)} x2={s.X(1)} y1={s.T} y2={s.B} stroke="var(--c-faint)" strokeDasharray="3 3" />
            <line x1={s.X(1e4)} x2={s.X(1e4)} y1={s.T} y2={s.B} stroke="var(--c-faint)" strokeDasharray="3 3" />
            <text x={s.X(0.05)} y={s.B - 4} fontSize={8} fill="var(--c-mute)">laminar</text>
            <text x={s.X(20)} y={s.B - 4} fontSize={8} fill="var(--c-mute)">transition</text>
            {r && r.Re >= 0.01 && r.Re <= 1e5 && <circle cx={s.X(r.Re)} cy={s.Y(r.CD)} r={3.5} fill="var(--c-bad)" />}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-accent)', t: 'C_D used (slide T05 p3)' }, { c: 'var(--c-load)', t: '24/Re (Stokes)', dash: true }]} />
      <RT head={['T (°C)', 'µ (×10⁻³ Pa·s)', 'ρ (kg/m³)']} rows={WATER.map((x) => [String(x.T), f3(x.mu * 1000), f1(x.rho)])} hl={(i) => good && WATER[i].T === T} cap="Water properties for v_s and Re (linear between rows)." />
      <Lookup
        result={
          r ? (
            <span>
              Stokes {f3(r.vStokes)} m/s (Re {f1(r.reStokes)}{r.stokesValid ? ', valid' : ', not valid'}) → v = <b>{f3(r.v)} m/s</b>, Re {f1(r.Re)}, C_D {f2(r.CD)} · {r.regime}
              {r.iterations.length > 0 && ` · ${r.iterations.length} iterations`}
            </span>
          ) : (
            'd > 0, SG > 1, 0 ≤ T ≤ 30 °C'
          )
        }
      >
        <NumIn label="d" value={dmm} onChange={setD} step={0.05} unit="mm" w="w-16" />
        <NumIn label="SG" value={sg} onChange={setSg} step={0.05} w="w-14" />
        <NumIn label="T" value={T} onChange={setT} step={5} unit="°C" w="w-14" />
      </Lookup>
      <Note>Slide T05-A (0.5 mm, SG 2.65, 20 °C) prints 0.11 m/s; the iteration converges to ≈ 0.090 m/s (Re ≈ 45) — the slide figure is not reproduced (digest doubt 7).</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-type1
const T1_DATA = [
  { t: 60, C: 189 },
  { t: 80, C: 180 },
  { t: 100, C: 168 },
  { t: 130, C: 156 },
  { t: 200, C: 111 },
  { t: 240, C: 78 },
  { t: 420, C: 27 },
]
const T1_CLASS_V = [3, 2.5, 2, 1.55, 1, 0.83, 0.43]
function Type1Body() {
  const [v0d, setV0d] = useState(25)
  const [cls, setCls] = useState(true)
  const v0 = (v0d / 1440) * 100 // ×10⁻² m/min
  const good = ok(v0d) && v0d > 0
  const r = typeIColumn({ H: 1.8 * 100, C0: 300, data: T1_DATA, v0: good ? v0 : 1, v: cls ? T1_CLASS_V : undefined })
  const pts: [number, number][] = [[0, 0], ...r.rows.map((x) => [x.v, x.x] as [number, number])]
  return (
    <>
      <Md>{R`**Steps (T05-B):** (1) for each sample: fraction remaining $x = C/C_0$ and velocity $v = H/t$. (2) $v_0 = Q/A$ (loading rate) in the same units. (3) Plot x against v; read $x_0$ at $v_0$. (4) Particles with $v \ge v_0$ all go: $1 - x_0$. (5) Slower ones go in the ratio $v/v_0$: split $0\to x_0$ into strips, area $\Delta x\,\bar v$.
$$R = (1 - x_0) + \frac{1}{v_0}\int_0^{x_0} v\,dx \approx (1 - x_0) + \frac{\sum \Delta x\,\bar v}{v_0}$$`}</Md>
      <Chart w={360} h={220} x={{ min: 0, max: 3.2, label: 'v (×10⁻² m/min)', ticks: [0, 0.5, 1, 1.5, 2, 2.5, 3] }} y={{ min: 0, max: 0.7, label: 'fraction x = C/C₀', ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7] }} label="Type I column: fraction remaining against settling velocity">
        {(s) => (
          <>
            {good &&
              r.strips.map((st, i) => (
                <rect key={i} x={s.X(0)} y={s.Y(st.x2)} width={s.X(st.vMean) - s.X(0)} height={Math.max(s.Y(st.x1) - s.Y(st.x2), 0)} fill={i % 2 ? 'var(--c-water)' : 'var(--c-accent)'} opacity={0.22} />
              ))}
            <path d={pathOf(pts, s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            {pts.slice(1).map(([v, x], i) => (
              <circle key={i} cx={s.X(v)} cy={s.Y(x)} r={2.4} fill="var(--c-ink)" />
            ))}
            {good && v0 <= 3.2 && (
              <g>
                <line x1={s.X(v0)} x2={s.X(v0)} y1={s.B} y2={s.Y(r.x0)} stroke="var(--c-load)" strokeDasharray="3 2" />
                <line x1={s.L} x2={s.X(v0)} y1={s.Y(r.x0)} y2={s.Y(r.x0)} stroke="var(--c-load)" strokeDasharray="3 2" />
                <circle cx={s.X(v0)} cy={s.Y(r.x0)} r={3.5} fill="var(--c-load)" />
                <text x={s.X(v0) + 4} y={s.Y(r.x0) - 4} fontSize={8} fill="var(--c-ink)">
                  v₀, x₀
                </text>
              </g>
            )}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-accent)', t: 'x against v (data dots)' }, { c: 'var(--c-load)', t: 'v₀ → x₀', dash: true }]} />
      {good && (
        <RT
          head={['strip', 'Δx', 'v̄ (×10⁻²)', 'Δx·v̄']}
          rows={[...r.strips.map((st, i) => [String(i + 1), f3(st.dx), f2(st.vMean), f3(st.area)]), ['Σ', f3(r.x0), '', f3(r.sum)]]}
          cap="Strips run between the data points up to x₀ (the class used Δx = 0.06, 0.06, 0.1, 0.1, 0.1, 0.06, 0.06)."
        />
      )}
      <Lookup result={good ? <span>v₀ = {f3(v0)}×10⁻² m/min · x₀ = <b>{f3(r.x0)}</b> · R = {f3(r.full)} + {f3(r.sum)}/{f3(v0)} = <b>{f1(r.R * 100)} %</b></span> : 'v₀ > 0'}>
        <NumIn label="v₀" value={v0d} onChange={setV0d} step={5} unit="m/d" w="w-14" />
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={cls} onChange={(e) => setCls(e.target.checked)} />
          <span className="text-mute">class velocity column</span>
        </label>
      </Lookup>
      <Note>Class (T05-B, 1.8 m, C₀ 300, 25 m/d): x₀ read 0.54, Σ = 0.46 → R = 0.46 + 0.46/1.74 = 72 %. The class velocities 2.5, 2, 0.83 are not exactly 1.8/t; untick to use H/t (≈ 70 %).</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-iso
const ISO: { c: IsoChart; t0: number; ask: string }[] = [
  { c: CHART_2017, t0: 90, ask: 't₀ = 90 and 180 min' },
  { c: CHART_2021, t0: 20, ask: 't₀ = 20 min' },
  { c: CHART_2324, t0: Math.round(minTimeForRemoval((t) => isoFromCurves(CHART_2324.curves, CHART_2324.H, t).R, 85, 600) ?? 120), ask: 'least t₀ for 85 %' },
]
function IsoBody() {
  const [k, setK] = useState(0)
  const [t0, setT0] = useState(ISO[0].t0)
  const ch = ISO[k].c
  const good = ok(t0) && t0 > 0
  const res = good ? isoFromCurves(ch.curves, ch.H, t0) : null
  return (
    <>
      <Md>{R`**Steps (T05-C):** (1) % removal at each (t, depth) $= (C_0 - C)/C_0\times100$. (2) Draw iso-removal curves through equal %. (3) Vertical line at $t_0$. (4) $r_0$ = the curve that reaches the bottom by $t_0$ (all of it removed). (5) Between the curves crossing the line: $\Delta R$ and the mid-depth $Z_i$ of each strip (from the surface).
$$R = r_0 + \sum \frac{\Delta R\,Z_i}{Z_0}$$`}</Md>
      <div className="flex flex-wrap gap-1 my-1">
        {ISO.map((x, i) => (
          <button
            key={x.c.id}
            className={'px-2 py-0.5 rounded-md text-[11px] border ' + (k === i ? 'bg-accent/15 border-accent/50' : 'border-line text-mute')}
            onClick={() => {
              setK(i)
              setT0(x.t0)
            }}
          >
            {x.c.id}
          </button>
        ))}
      </div>
      <IsoChartFig H={ch.H} tMax={ch.tMax} curves={ch.curves} t0={good ? t0 : undefined} res={res ?? undefined} title={ch.title} />
      {res && (
        <RT
          head={['ΔR (%)', 'Z_i (m)', 'ΔR·Z_i']}
          rows={[...res.strips.map((s) => [`${s.r1} → ${s.r2} = ${f1(s.dr)}`, f2(s.zMid), f1(s.area)]), ['Σ', '', f1(res.sum)]]}
          cap={`${ch.title} · asked: ${ISO[k].ask}. Curves are rebuilt from the printed figure, so read ±0.1 m.`}
        />
      )}
      <Lookup result={res ? <span>r₀ = {res.r0} % · Σ/Z₀ = {f1(res.sum)}/{ch.H} = {f1(res.partial)} → R = <b>{f1(res.R)} %</b>{res.extrapolated ? ' (a curve extended past its last point)' : ''}</span> : 't₀ > 0'}>
        <NumIn label="t₀" value={t0} onChange={setT0} step={5} unit="min" w="w-16" />
      </Lookup>
      <Note>Class (T05-C, 3 m, 1 h 45 min): r₀ = 43 %, Σ ΔR·Z = 0.61 → R = 43 + 0.61/3 × 100 ≈ 63 %.</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-sor
function SorBody() {
  const [Q, setQ] = useState(15000)
  const [v0, setV0] = useState(20)
  const [depth, setDepth] = useState(3.5)
  const [n, setN] = useState(2)
  const good = [Q, v0, depth, n].every((x) => ok(x) && x > 0)
  const t = good ? tankSize({ Q, v0, depth, n, LW: 3 }) : null
  return (
    <>
      <Md>{R`$$v_0 = \frac{Q}{A} = \frac{h_0}{t_0},\quad A = \frac{Q}{v_0},\quad V = A\,h,\quad t = \frac{V}{Q} = \frac{h}{v_0},\quad \text{weir loading} = \frac{Q}{L_{weir}},\quad v_h = \frac{Q}{W h}$$
The overflow rate is the design factor: particles with $v_s \ge v_0$ are all removed, slower ones in the ratio $v_s/v_0$ — depth does not enter (ideal basin).`}</Md>
      <RT
        head={['Criterion', 'Discrete (Type I)', 'Flocculent (Type II)']}
        rows={[
          ['Overflow rate', '1 – 2.5 m/h', '0.6 – 1 m/h'],
          ['Detention time', '2 – 4 h', '4 – 6 h'],
          ['Horizontal velocity', '≤ 36 m/h', '≤ 9 m/h'],
          ['Weir loading', '≤ 14 m³/h·m', '≤ 6 m³/h·m'],
          ['Units / shape', 'at least 2; L : W 2:1 – 4:1, W ≤ 12 m, L ≤ 48 m', ''],
        ]}
        cap="TA T05 p15. Rectangular tank: + inlet and outlet zones, sludge zone and freeboard on the depth."
      />
      <Lookup
        result={
          t ? (
            <span>
              A = <b>{f1(t.A)} m²</b> · V = {f1(t.V)} m³ · t = <b>{f2(t.tHours)} h</b> · overflow {f2(t.overflowMh)} m/h · each of {n}: {f1(t.Aunit)} m² ≈ {f1(t.L)} × {f1(t.W)} m (L:W 3)
            </span>
          ) : (
            'all > 0'
          )
        }
      >
        <NumIn label="Q" value={Q} onChange={setQ} step={1000} unit="m³/d" w="w-20" />
        <NumIn label="v₀" value={v0} onChange={setV0} step={1} unit="m/d" w="w-14" />
        <NumIn label="depth" value={depth} onChange={setDepth} step={0.5} unit="m" w="w-14" />
        <NumIn label="units" value={n} onChange={setN} step={1} w="w-12" />
      </Lookup>
      <Note>T05-D (computed): 15000 m³/d, 20 m/d, 3.5 m → 750 m², 4.2 h, 0.83 m/h; the slide sketch shows two units 34 × 11 m.</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-coag
const COAG_IDS: Coagulant['id'][] = ['alum', 'alum18', 'fecl3']
function CoagBody() {
  const [id, setId] = useState<Coagulant['id']>('alum')
  const [dose, setDose] = useState(12)
  const good = ok(dose) && dose > 0
  const u = good ? alkConsumed(id, dose) : null
  const na = good ? alumNoAlkalinity({ dose, id }) : null
  return (
    <>
      <Md>{R`$$\text{Al}_2(\text{SO}_4)_3\!\cdot\!14\text{H}_2\text{O} + 6\,\text{HCO}_3^- \rightarrow 2\,\text{Al(OH)}_3\!\cdot\!3\text{H}_2\text{O} + 6\,\text{CO}_2 + 3\,\text{SO}_4^{2-} + 2\,\text{H}_2\text{O}$$
594 g alum uses 6 × 50 = 300 g alkalinity as CaCO₃ → **0.505 mg/L per mg/L alum**. No alkalinity: the alum makes 3 H₂SO₄ per mole → pH falls (T06-B).`}</Md>
      <RT
        head={['Coagulant', 'MW', 'HCO₃⁻ per mol', 'mg alk (as CaCO₃) per mg']}
        rows={COAG_IDS.map((c) => [COAGULANTS[c].label, f1(COAGULANTS[c].mw), String(COAGULANTS[c].hco3), f3(alkConsumed(c, 1).perMg)])}
        hl={(i) => COAG_IDS[i] === id}
        cap="Slides use 14H₂O (594); the class notes write 18H₂O (666 → 0.45). Say which you used (digest doubt 12)."
      />
      <Lookup
        result={
          u && na ? (
            <span>
              {f3(u.mmol)} mmol/L → alkalinity used <b>{f1(u.alk)} mg/L as CaCO₃</b> ({f1(u.hco3)} mg/L HCO₃⁻) · with no alkalinity: pH ≈ <b>{f2(na.pH)}</b>, NaOH to neutralise {f1(na.naohMgL)} mg/L
            </span>
          ) : (
            'dose > 0'
          )
        }
      >
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">coagulant</span>
          <select className="field !py-0.5 !px-1.5 !text-xs" value={id} onChange={(e) => setId(e.target.value as Coagulant['id'])}>
            {COAG_IDS.map((c) => (
              <option key={c} value={c}>
                {COAGULANTS[c].label}
              </option>
            ))}
          </select>
        </label>
        <NumIn label="dose" value={dose} onChange={setDose} step={2} unit="mg/L" w="w-14" />
      </Lookup>
      <Note>T06-A: jar-test optimum 12 mg/L alum → ≈ 6.1 mg/L as CaCO₃ used. T06-B: 100 mg/L alum, no alkalinity → pH ≈ 3.0, ≈ 40 mg/L NaOH to bring it to 7.</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-g
function GBody() {
  const [P, setP] = useState(500)
  const [V, setV] = useState(100)
  const [T, setT] = useState(20)
  const [tMin, setTMin] = useState(30)
  const good = [P, V, T, tMin].every((x) => ok(x) && x > 0) && T <= 30
  const mu = waterAt(good ? T : 20).mu
  const G = good ? velocityGradient(P, mu, V) : NaN
  return (
    <>
      <Md>{R`$$G = \sqrt{\frac{P}{\mu V}}\ (\text{s}^{-1}),\qquad P = G^2\mu V,\qquad \text{Camp number} = G\,t_0,\qquad t_0 = V/Q$$
P in W, µ in Pa·s, V in m³. G sets how often particles collide; Gt (the Camp number) sets the total number of collisions.`}</Md>
      <RT
        head={['Mixing', 'G (s⁻¹)', 't', 'Gt']}
        rows={[
          ['Rapid mix, adsorption / charge neutralisation (in-line blender)', '3000 – 5000', '≈ 0.5 s', ''],
          ['Rapid mix, sweep coagulation (CMFR)', '600 – 1000', '1 – 10 s (p22: 1 – 7 s)', ''],
          ['Floc: low turbidity, colour removal', '20 – 70', '', '60 000 – 200 000'],
          ['Floc: high turbidity, solids removal', '50 – 150', '', '90 000 – 180 000'],
          ['Floc: softening, 10 % solids', '130 – 200', '', '200 000 – 250 000'],
          ['Floc: softening, 39 % solids', '150 – 300', '', '390 000 – 400 000'],
          ['Softening flash mix', '300 – 700', '10 – 30 s', ''],
          ['Softening flocculation', '130 – 300', '30 – 45 min', '200 000 – 400 000'],
        ]}
        cap="TA T06 p19–23 and T07. Flocculator: at least three compartments with tapered G; floc-basin velocity 0.15 – 0.36 m/s (softening)."
      />
      <Lookup result={good ? <span>µ = {f3(mu * 1000)}×10⁻³ Pa·s → G = <b>{f1(G)} s⁻¹</b> · Gt = <b>{fmt(G * tMin * 60, 0)}</b> · power for G = 50 s⁻¹: {f1(powerForG(50, mu, V))} W</span> : 'all > 0, T ≤ 30 °C'}>
        <NumIn label="P" value={P} onChange={setP} step={50} unit="W" w="w-16" />
        <NumIn label="V" value={V} onChange={setV} step={10} unit="m³" w="w-16" />
        <NumIn label="T" value={T} onChange={setT} step={5} unit="°C" w="w-14" />
        <NumIn label="t" value={tMin} onChange={setTMin} step={5} unit="min" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- t-lime
function LimeBody() {
  const [co2, setCo2] = useState(9.6)
  const [ca, setCa] = useState(95.2)
  const [mg, setMg] = useState(13.5)
  const [alk, setAlk] = useState(198)
  const [mode, setMode] = useState<Mode>('complete')
  const [excess, setExcess] = useState(0)
  const [pur, setPur] = useState(100)
  const good = [co2, ca, mg, alk, excess, pur].every((x) => ok(x) && x >= 0) && pur > 0
  const w = waterFromIons({ co2, ca, mg, alkCaCO3: alk })
  const r = good ? treat(w, { mode, excess, removeCaNch: true }) : null
  const m = r ? masses(r.lime, r.soda, pur / 100) : null
  return (
    <>
      <RT
        head={['Add', 'Lime (as CaCO₃)', 'Soda ash (as CaCO₃)']}
        rows={[
          ['CO₂', 'CO₂', '—'],
          ['Ca carbonate hardness (HCO₃⁻)', 'Alk', '—'],
          ['Ca non-carbonate hardness', '—', 'Ca-NCH'],
          ['Mg carbonate hardness', '2 × Mg-CH (Alk counted once + Mg)', '—'],
          ['Mg non-carbonate hardness', 'Mg-NCH', 'Mg-NCH'],
          ['Excess lime', '20 (Ca; Mg 20–40), 40 (Mg > 40)', '—'],
        ]}
        cap="Sum: Lime = CO₂ + Alk + Mg (+ excess); Soda = NCH. Selective Ca removal: Lime = CO₂ + Alk (+ 20), Soda = Ca-NCH only if wanted."
      />
      <Md className="text-xs">{R`- **Practical limits:** Ca → 30, Mg → 10 mg/L as CaCO₃ (final TH ≈ 40). Only Mg above 40 is worth removing.
- CO₂ > 10 mg/L (**22.7 as CaCO₃**): strip it by aeration rather than spend lime on it.
- Excess lime is removed afterwards by **recarbonation**. Tanvir sir's own worked sheets add **no** excess lime — say so if you add it.
- Mass: CaO = dose × 0.56, Ca(OH)₂ × 0.74, Na₂CO₃ × 1.06, ÷ purity.`}</Md>
      {r && <BarDiagram bars={bars({ ...w, na: 0, cl: 0, so4: 0 })} title="raw water (Ca, Mg against HCO₃)" mark={[{ label: 'Alk', at: w.alk }]} />}
      <Lookup
        result={
          r && m ? (
            <span>
              TH {f1(r.h.th)}, NCH {f1(r.h.nch)} · Lime = {f1(r.limeParts.co2)} + {f1(r.limeParts.alk)} + {f1(r.limeParts.mg)} + {f1(r.limeParts.excess)} = <b>{f1(r.lime)}</b> · Soda <b>{f1(r.soda)}</b> mg/L as CaCO₃ · CaO {f1(m.CaO)}, Na₂CO₃ {f1(m.Na2CO3)} mg/L · final TH ≈ {f1(r.final.th)}
              {w.co2 > 22.7 && ' · CO₂ > 22.7: strip it'}
            </span>
          ) : (
            'values ≥ 0'
          )
        }
      >
        <NumIn label="CO₂" value={co2} onChange={setCo2} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Ca²⁺" value={ca} onChange={setCa} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Mg²⁺" value={mg} onChange={setMg} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Alk" value={alk} onChange={setAlk} step={5} unit="as CaCO₃" w="w-14" />
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">removal</span>
          <select className="field !py-0.5 !px-1.5 !text-xs" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="complete">Ca + Mg (practical limits)</option>
            <option value="selective">selective Ca</option>
          </select>
        </label>
        <NumIn label="excess" value={excess} onChange={setExcess} step={20} w="w-14" />
        <NumIn label="purity" value={pur} onChange={setPur} step={5} unit="%" w="w-14" />
      </Lookup>
      <Note>T07-B (preset): CO₂ 21.8, Ca 238, Mg 55.6, Alk 198 → Lime 275.4, Soda 95.6 mg/L as CaCO₃. T07-A selective: 15 + 164 = 179 → 111 mg/L CaO at 90 %.</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-split
function SplitBody() {
  const [co2, setCo2] = useState(0)
  const [ca, setCa] = useState(95.2)
  const [mg, setMg] = useState(22)
  const [alk, setAlk] = useState(198)
  const [thMax, setThMax] = useState(120)
  const good = [co2, ca, mg, alk, thMax].every((x) => ok(x) && x >= 0)
  const w = waterFromIons({ co2, ca, mg, alkCaCO3: alk })
  const s = good && w.mg > 40 ? splitTreatment(w, { mgFinal: 40, thMax }) : null
  return (
    <>
      <Md>{R`**Steps (T07 split sheet):** (1) First stage (100 % flow) to practical limits: lime₁ = CO₂ + Alk + Mg, soda₁ = NCH. (2) Bypass so the blend has Mg = 40:
$$X = \frac{Mg_f - Mg_i}{Mg_r - Mg_i}\quad (Mg_f = 40,\ Mg_i = 10,\ Mg_r = \text{raw Mg})$$
(3) Blended TH = X · raw TH + (1 − X) · 40. Above the limit → second stage on the blend, selective Ca removal (lime₂ = CO₂ + Alk, no soda). (4) Doses on the whole flow: Lime = (1 − X) lime₁ + X lime₂, Soda = (1 − X) soda₁. (5) Convert to CaO / Na₂CO₃ and divide by purity.`}</Md>
      {s && <SplitFlow X={s.X} second={s.secondNeeded} />}
      <Lookup
        result={
          s ? (
            <span>
              X = <b>{f3(s.X)}</b> (treated {f3(s.treated)}) · lime₁ {f1(s.first.lime)}, soda₁ {f1(s.first.soda)} · blend TH {f1(s.blended)} {s.secondNeeded ? `> ${thMax}: 2nd stage needed` : `≤ ${thMax}: no 2nd stage`} · Lime <b>{f1(s.lime)}</b>, Soda <b>{f1(s.soda)}</b> mg/L as CaCO₃
            </span>
          ) : (
            'needs raw Mg > 40 mg/L as CaCO₃'
          )
        }
      >
        <NumIn label="CO₂" value={co2} onChange={setCo2} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Ca²⁺" value={ca} onChange={setCa} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Mg²⁺" value={mg} onChange={setMg} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Alk" value={alk} onChange={setAlk} step={5} unit="as CaCO₃" w="w-14" />
        <NumIn label="TH max" value={thMax} onChange={setThMax} step={10} w="w-14" />
      </Lookup>
      <Note>Class sheet (T07-C): Mg 90.6 → X = 30/80.6 = 0.372, treated 0.628; blend 147.4 &gt; 80–120 → second stage; lime 267.4, soda 82 for the first stage share (notes first write 0.322, a slip).</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-ix
const USED = Array.from({ length: 101 }, (_, i) => (i / 100) * 1.2)
function IxBody() {
  const [V, setV] = useState(0.1)
  const [cap, setCap] = useState(57)
  const [Q, setQ] = useState(2000)
  const [Hr, setHr] = useState(280)
  const [Hd, setHd] = useState(85)
  const good = [V, cap, Q, Hr, Hd].every((x) => ok(x) && x > 0) && Hd < Hr
  const h = good ? homeSoftener({ V, cap, Qlpd: Q, Hraw: Hr, Hdes: Hd }) : null
  return (
    <>
      <Md>{R`**Steps (T08):** (1) The resin gives zero-hardness water, so bypass $= H_{des}/H_{raw}$. (2) Treated flow $= (1 - \text{bypass})Q$. (3) Load on resin = treated flow × $H_{raw}$ (L/d × mg/L × 10⁻⁶ = kg/d). (4) Run length = resin volume × capacity ÷ load. (5) Fixed beds: $A = Q/\text{loading rate}$, $V = A \times$ depth; salt = regeneration level (kg/m³) × V; brine = salt ÷ strength.
Regeneration: $2\text{RNa} + \text{Ca}^{2+} \rightleftharpoons \text{R}_2\text{Ca} + 2\text{Na}^+$ driven backwards by strong brine. Continuous plants keep ≥ 2 beds: one runs while the other regenerates.`}</Md>
      <Chart w={360} h={190} x={{ min: 0, max: 1.2, label: 'fraction of resin capacity used', ticks: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2] }} y={{ min: 0, max: 1, label: 'C/C₀ (effluent)', ticks: [0, 0.25, 0.5, 0.75, 1] }} label="ion-exchange breakthrough curve">
        {(s) => (
          <>
            <path d={pathOf(USED.map((u) => [u, breakthrough(u)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            <line x1={s.X(0.92)} x2={s.X(0.92)} y1={s.T} y2={s.B} stroke="var(--c-load)" strokeDasharray="3 2" />
            <text x={s.X(0.92) - 3} y={s.T + 10} fontSize={8} textAnchor="end" fill="var(--c-mute)">
              breakthrough → regenerate
            </text>
          </>
        )}
      </Chart>
      <Note>Qualitative: the exchange zone moves down the bed; hardness leaks out only when the zone reaches the bottom.</Note>
      <Lookup
        result={
          h ? (
            <span>
              bypass <b>{f1(h.bypass * 100)} %</b> · treated {fmt(h.treatedLpd, 0)} L/d · load {f3(h.loadKgD)} kg/d · capacity {f2(h.capKg)} kg → run <b>{f1(h.days)} days</b>
            </span>
          ) : (
            'all > 0, desired < raw'
          )
        }
      >
        <NumIn label="resin" value={V} onChange={setV} step={0.05} unit="m³" w="w-14" />
        <NumIn label="capacity" value={cap} onChange={setCap} step={5} unit="kg/m³" w="w-14" />
        <NumIn label="Q" value={Q} onChange={setQ} step={100} unit="L/d" w="w-16" />
        <NumIn label="H raw" value={Hr} onChange={setHr} step={10} w="w-14" />
        <NumIn label="H des" value={Hd} onChange={setHd} step={5} w="w-14" />
      </Lookup>
      <Note>T08-A: 30 % bypass, 0.392 kg/d, 14.5 days. T08-B: 250 mg/L at 0.4 m³/min·m² → 0.1 kg/min per m²; 90 kg/m³ → 900 min per m of bed; 150 kg NaCl/m³ as 10 % brine ≈ 1.5 m³ brine per m³ resin.</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-chick
const CW_DATA = [0, 2, 4, 6, 8].map((t, i) => ({ t, N: 6152 * Math.exp([0, -0.718, -1.63, -2.16, -3.02][i]) }))
function ChickBody() {
  const cw = chickWatson({ C: 1.8, data: CW_DATA })
  const [k, setK] = useState(0.208)
  const [C, setC] = useState(1.8)
  const [lg, setLg] = useState(3)
  const [C2, setC2] = useState(1)
  const good = [k, C, lg, C2].every((x) => ok(x) && x > 0)
  const t = good ? timeForLogKill(k, C, lg) : NaN
  return (
    <>
      <Md>{R`$$\ln\frac{N}{N_0} = -k\,C^n\,t\qquad (n = 1:\ \text{plot } -\ln(N/N_0)\ \text{against}\ Ct,\ \text{slope through the origin} = k)$$
$C^n t = \text{constant}$ for a given % kill: $t_2 = t_1 (C_1/C_2)^n$. A 3-log kill (99.9 %) is $\ln 10^3 = 6.91$.`}</Md>
      <Chart w={360} h={200} x={{ min: 0, max: 16, label: 'C·t (mg·s/L)', ticks: [0, 4, 8, 12, 16] }} y={{ min: 0, max: 3.5, label: '−ln(N/N₀)', ticks: [0, 1, 2, 3] }} label="Chick–Watson plot">
        {(s) => (
          <>
            <path d={pathOf([[0, 0], [16, 16 * cw.k]], s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.6} />
            {cw.pts.map((p) => (
              <circle key={p.t} cx={s.X(p.ct)} cy={s.Y(-p.lnR)} r={2.8} fill="var(--c-load)" />
            ))}
            <text x={s.X(9)} y={s.Y(9 * cw.k) - 6} fontSize={9} fill="var(--c-ink)">
              slope k = {f3(cw.k)}
            </text>
          </>
        )}
      </Chart>
      <RT head={['t (s)', 'Ct', '−ln(N/N₀)']} rows={cw.pts.map((p) => [String(p.t), f1(p.ct), f2(-p.lnR)])} cap="T10-A data (N₀ = 6152, C = 1.8 mg/L); the class reads k = 0.208 L/mg·s." />
      <Lookup result={good ? <span>t for {lg}-log kill at {f2(C)} mg/L = <b>{f1(t)} s</b> · same kill at {f2(C2)} mg/L: <b>{f1(timeAtOtherC(C, t, C2))} s</b></span> : 'all > 0'}>
        <NumIn label="k" value={k} onChange={setK} step={0.01} w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={0.1} unit="mg/L" w="w-14" />
        <NumIn label="log kill" value={lg} onChange={setLg} step={1} w="w-12" />
        <NumIn label="C₂" value={C2} onChange={setC2} step={0.1} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- t-bp
const ZONE_LABEL: Record<Zone, string> = { demand: '1 · destroyed by reducing compounds', chloramine: '2 · chloramines & chloro-organics form', destruction: '3 · chloramines destroyed', free: '4 · free residual (past breakpoint)' }
function BpBody() {
  const [d0, setD0] = useState(1)
  const [N, setN] = useState(0.5)
  const [dose, setDose] = useState(6)
  const good = [d0, N, dose].every((x) => ok(x) && x >= 0) && N > 0
  const m = breakpointModel(good ? d0 : 1, good ? N : 0.5)
  const max = m.bpDose * 1.6
  const ds = Array.from({ length: 121 }, (_, i) => (i / 120) * max)
  const r = good ? residualAt(m, dose) : null
  return (
    <>
      <Chart w={360} h={220} x={{ min: 0, max, label: 'chlorine dose (mg/L)' }} y={{ min: 0, max: Math.max(m.peakRes, residualAt(m, max).residual) * 1.1, label: 'residual (mg/L)' }} label="breakpoint chlorination curve">
        {(s) => (
          <>
            <path d={pathOf(ds.map((x) => [x, x]), s)} fill="none" stroke="var(--c-faint)" strokeDasharray="4 3" />
            <path d={pathOf(ds.map((x) => [x, residualAt(m, x).residual]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            {[m.d0, m.peakDose, m.bpDose].map((x) => (
              <line key={x} x1={s.X(x)} x2={s.X(x)} y1={s.T} y2={s.B} stroke="var(--c-line)" strokeDasharray="3 3" />
            ))}
            <text x={s.X(m.bpDose)} y={s.Y(m.bpRes) + 12} fontSize={8} textAnchor="middle" fill="var(--c-ink)">
              breakpoint
            </text>
            {r && dose <= max && <circle cx={s.X(dose)} cy={s.Y(r.residual)} r={3.5} fill="var(--c-bad)" />}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-accent)', t: 'residual' }, { c: 'var(--c-faint)', t: 'no demand (residual = dose)', dash: true }]} />
      <Md className="text-xs">{R`1. Cl₂ destroyed by reducing compounds (Fe²⁺, Mn²⁺, H₂S, organics) — no residual.
2. Chloramines and chloro-organics form — combined residual rises.
3. Chloramines and chloro-organics destroyed — residual falls to the **breakpoint**.
4. Free chlorine residual rises with every extra mg/L.
Dose = demand + residual. Ammonia can be added on purpose to make chloramine (keeps chlorine off phenols/organics). Design pH 6.5–7.5.`}</Md>
      <Lookup result={r ? <span>residual <b>{f2(r.residual)}</b> mg/L (free {f2(r.free)}, combined {f2(r.combined)}) · zone {ZONE_LABEL[r.zone]}</span> : 'values ≥ 0, NH₃-N > 0'}>
        <NumIn label="demand" value={d0} onChange={setD0} step={0.5} unit="mg/L" w="w-14" />
        <NumIn label="NH₃-N" value={N} onChange={setN} step={0.1} unit="mg/L" w="w-14" />
        <NumIn label="dose" value={dose} onChange={setDose} step={0.5} unit="mg/L" w="w-14" />
      </Lookup>
      <Note>Qualitative only — no numerical breakpoint problem was taught (T10 p11). Peak at Cl₂ : N ≈ 5 : 1, breakpoint ≈ 7.6 : 1 by mass (textbook).</Note>
    </>
  )
}

// ---------------------------------------------------------------- t-filt
function FiltBody() {
  const [Q, setQ] = useState(1000)
  const good = ok(Q) && Q > 0
  const rates: [string, number, number][] = [
    ['SSF', 0.1, 0.4],
    ['RSF', 5, 10],
    ['Up-flow roughing', 1, 2],
  ]
  return (
    <>
      <RT
        head={['', 'Slow sand (SSF)', 'Rapid sand (RSF)', 'Up-flow roughing (URF)']}
        rows={[
          ['Suits', '< 50 NTU', '> 50 NTU', '50 – 150 NTU'],
          ['Pre-treatment', 'URF / plain sedimentation', 'coag., floc. & sed.', 'none / DRF'],
          ['Filtration rate', '0.1 – 0.4 m/h', '5 – 10 m/h', '1 – 2 m/h'],
          ['Ripening', '0.25 – 30 days', '5 – 10 min', '3 – 10 days'],
          ['D10', '0.1 – 0.3 mm', '0.45 – 0.55 mm', '5 – 8 mm'],
          ['Uniformity coeff.', '2 – 3', '1.2 – 1.7', '1.7 – 2.5'],
          ['Bed', '1.0 – 1.4 m fine–medium sand', '0.3 to > 1.0 m medium–coarse', '0.6 – 1.0 m gravel'],
          ['Under-drain', 'slotted pipe grid', 'gravel & perforated tiles', 'perforated RCC slab'],
          ['Cleaning', 'surface scraping', 'back-washing', 'flushing / drain-out'],
          ['Filter run', '40 – 60 days', '1 – 3 days', '21 – 28 days'],
          ['Area', 'large', 'small', 'moderate'],
        ]}
        cap="TA T09 p25. The RSF rate is 5 – 15 m³/m²·h on p20 but 5 – 10 m/h in this table (digest doubt 17)."
      />
      <Md className="text-xs">{R`Loading rate $v_a = Q/A$. Rose head loss (clean stratified bed): $h_L = \dfrac{1.067\,v_a^2 D}{\varphi\,g\,\varepsilon^4}\sum\dfrac{C_D f}{d_g}$ — goes as $v_a^2$, so a small rise in rate is amplified.`}</Md>
      <Lookup result={good ? <span>{rates.map(([n, lo, hi]) => `${n}: ${f1(Q / 24 / hi)} – ${f1(Q / 24 / lo)} m²`).join(' · ')}</span> : 'Q > 0'}>
        <NumIn label="Q" value={Q} onChange={setQ} step={100} unit="m³/d" w="w-20" />
      </Lookup>
    </>
  )
}

export const TREAT_ITEMS: EvRefItem[] = [
  { id: 't-stokes', group: 'treat', title: 'Terminal settling velocity (Stokes, C_D iteration)', tag: 'TA T05', keywords: 'stokes law reynolds drag coefficient cd discrete particle sphere viscosity', Body: StokesBody },
  { id: 't-type1', group: 'treat', title: 'Type I settling column: removal at a loading rate', tag: 'TA T05', exam: true, keywords: 'discrete settling column analysis x0 v0 fraction remaining strips overflow', Body: Type1Body },
  { id: 't-iso', group: 'treat', title: 'Type II settling: iso-removal curves', tag: 'TA T05', exam: true, keywords: 'flocculent settling iso-removal isoremoval r0 delta r zi z0 detention', Body: IsoBody },
  { id: 't-sor', group: 'treat', title: 'Settling tank sizing and design criteria', tag: 'TA T05', exam: true, keywords: 'sor surface overflow rate detention time weir loading horizontal velocity tank area', Body: SorBody },
  { id: 't-coag', group: 'treat', title: 'Coagulant dose: alkalinity used and pH', tag: 'TA T06', exam: true, keywords: 'alum fecl3 ferric chloride alkalinity consumed jar test 0.505 naoh', Body: CoagBody },
  { id: 't-g', group: 'treat', title: 'Velocity gradient G, Camp number Gt', tag: 'TA T06', exam: true, keywords: 'velocity gradient camp number gt mixing flocculation power rapid mix', Body: GBody },
  { id: 't-lime', group: 'treat', title: 'Lime–soda softening doses', tag: 'TA T07', exam: true, keywords: 'lime soda ash softening excess lime practical limit recarbonation cao na2co3', Body: LimeBody },
  { id: 't-split', group: 'treat', title: 'Split treatment: bypass X and doses', tag: 'TA T07', exam: true, keywords: 'split treatment bypass fraction x mg second stage blend', Body: SplitBody },
  { id: 't-ix', group: 'treat', title: 'Ion exchange: bypass, run length, salt', tag: 'TA T08', exam: true, keywords: 'ion exchange resin capacity regeneration brine nacl breakthrough bypass softener', Body: IxBody },
  { id: 't-chick', group: 'treat', title: 'Chick–Watson disinfection kinetics', tag: 'TA T10', keywords: 'chick watson ct kill log inactivation chlorine contact time', Body: ChickBody },
  { id: 't-bp', group: 'treat', title: 'Breakpoint chlorination curve', tag: 'TA T10', keywords: 'breakpoint chlorine residual chloramine free combined ammonia dose demand', Body: BpBody },
  { id: 't-filt', group: 'treat', title: 'Filters: SSF vs RSF vs roughing, loading rate', tag: 'TA T09', exam: true, keywords: 'slow sand rapid sand roughing filtration rate loading rose head loss backwash', Body: FiltBody },
]
