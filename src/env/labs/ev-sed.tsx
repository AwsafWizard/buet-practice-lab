// Settling column: (1) an animated ideal basin where a spectrum of particles falls against the overflow rate v0 = Q/A,
// (2) the Type II iso-removal workbench (ΔR·Z/Z0 strips shaded and summed), (3) exam-style problems.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { CHART_2017, CHART_2021, CHART_2324, isoFromCurves, minTimeForRemoval, randomChart, tankSize, terminalVelocity, typeIColumn, type IsoChart } from '../engine/settle'
import { IsoChartFig } from '../figs/sed-iso'

const nf = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const tx = String.raw
const f = (v: number, d = 1) => v.toFixed(d)

// ================================================================ 1. the animated basin
const SPECTRA: Record<string, { label: string; d: number[]; w: number[] }> = {
  fine: { label: 'Fine silt', d: [0.005, 0.01, 0.02, 0.03], w: [0.25, 0.3, 0.3, 0.15] },
  mixed: { label: 'Silt mix', d: [0.01, 0.03, 0.06, 0.1], w: [0.2, 0.3, 0.3, 0.2] },
  coarse: { label: 'Silt and sand', d: [0.03, 0.06, 0.1, 0.2], w: [0.25, 0.25, 0.25, 0.25] },
}
const CLS_COL = ['var(--c-water)', 'var(--c-accent)', 'var(--c-load)', 'var(--c-good)']
const STARTS = [0.1, 0.3, 0.5, 0.7, 0.9]

function BasinSim() {
  const [spec, setSpec] = useState<keyof typeof SPECTRA>('mixed')
  const [v0, setV0] = useState(3) // m/h
  const [p, setP] = useState(0)
  const [play, setPlay] = useState(true)
  const raf = useRef(0)
  useEffect(() => {
    if (!play) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setP((q) => (q > 1.35 ? 0 : q + dt / 7))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [play])
  const sp = SPECTRA[spec]
  const cls = sp.d.map((d, i) => {
    const v = terminalVelocity({ d: d / 1000, sg: 2.65 }).v * 3600
    return { d, v, w: sp.w[i], rem: Math.min(1, v / v0), col: CLS_COL[i] }
  })
  const overall = cls.reduce((s, c) => s + c.w * c.rem, 0)
  const X0 = 40
  const X1 = 520
  const Y0 = 34
  const Y1 = 174
  const pp = Math.min(p, 1)
  return (
    <Section title="The ideal settling basin" sub="Water crosses the tank in the detention time t₀; a particle that reaches the floor before the outlet is removed. The overflow rate v₀ = Q/A is the velocity of the particle that just makes it from the top of the inlet.">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Seg value={spec} onChange={setSpec} items={Object.entries(SPECTRA).map(([k, s]) => ({ v: k, label: s.label }))} />
          <button className="btn !py-1 !px-3 !text-xs" onClick={() => { setP(0); setPlay(true) }}>↻ Replay</button>
          <button className="btn !py-1 !px-3 !text-xs" onClick={() => setPlay(!play)}>{play ? 'Pause' : 'Play'}</button>
        </div>
        <Slider label="Overflow rate v₀ = Q/A" value={v0} min={0.2} max={40} step={0.2} onChange={(v) => { setV0(+v.toFixed(1)); setP(0) }} unit=" m/h" />
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <svg viewBox="0 0 560 210" width="100%" role="img" aria-label="ideal settling basin with falling particles" style={{ display: 'block' }}>
            <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="var(--c-water)" opacity="0.1" stroke="var(--c-ink)" />
            <text x={X0 + 4} y={Y0 - 8} fontSize="11" fill="var(--c-mute)">inlet</text>
            <text x={X1} y={Y0 - 8} fontSize="11" fill="var(--c-mute)" textAnchor="end">outlet</text>
            <text x={(X0 + X1) / 2} y={Y1 + 18} fontSize="11" fill="var(--c-mute)" textAnchor="middle">sludge zone: anything that touches the floor stays</text>
            <line x1={X0} y1={Y0} x2={X1} y2={Y1} stroke="var(--c-bad)" strokeDasharray="5 4" />
            <text x={X0 + 6} y={Y0 + 14} fontSize="11" fill="var(--c-bad)">critical particle (v = v₀)</text>
            {cls.map((c, ci) =>
              STARTS.map((h0, si) => {
                const k = c.v / v0
                const hit = (1 - h0) / k // normalised time at which it reaches the floor
                const done = hit <= 1
                const tt = Math.min(pp, done ? hit : 1)
                const x = X0 + tt * (X1 - X0)
                const y = Y0 + (h0 + k * tt) * (Y1 - Y0)
                const gone = pp >= 1 && !done
                return <circle key={ci + '-' + si} cx={x} cy={Math.min(y, Y1 - 2)} r={3 + ci * 0.6} fill={gone ? 'none' : c.col} stroke={gone ? 'var(--c-bad)' : 'none'} strokeWidth="1.5" opacity={done && tt >= hit ? 0.9 : 1} />
              }),
            )}
          </svg>
          <div className="text-xs text-faint px-1">Filled = settles into the sludge zone. Red ring = carried out with the effluent. Each size is shown from five starting depths.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead>
              <tr className="text-left text-faint text-xs">
                <th className="py-1 pr-3">size d</th><th className="pr-3">v_s (Stokes)</th><th className="pr-3">share of solids</th><th className="pr-3">removed</th><th>why</th>
              </tr>
            </thead>
            <tbody>
              {cls.map((c, i) => (
                <tr key={i} className="border-t border-line/60">
                  <td className="py-1 pr-3"><span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: c.col }} />{c.d} mm</td>
                  <td className="pr-3 num">{c.v < 0.1 ? c.v.toFixed(3) : c.v.toFixed(2)} m/h</td>
                  <td className="pr-3 num">{(c.w * 100).toFixed(0)} %</td>
                  <td className="pr-3 num font-semibold">{(c.rem * 100).toFixed(0)} %</td>
                  <td className="text-mute text-xs">{c.v >= v0 ? 'v_s ≥ v₀: all of it settles' : `v_s < v₀: only the fraction starting low enough, v_s/v₀`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm">
          Overall removal <b className="num">{(overall * 100).toFixed(0)} %</b> at v₀ = {v0} m/h. A basin of depth 3 m has t₀ = depth/v₀ = {f(3 / v0, 2)} h.
        </div>
        <Callout kind="tip" title="Notice that…">
          Slide v₀ down and every class moves toward 100 %; slide it up and the small ones collapse first in proportion to v_s/v₀. Depth does not appear in the removal at all: only Q/A does. That is why a shallow tank with the same area works as well as a deep one (for discrete particles), and why plate settlers add area, not volume.
        </Callout>
      </div>
    </Section>
  )
}

// ================================================================ 2. Type II workbench
type ChartKey = '2023-24' | '2020-21' | '2017-18' | 'rand'
function Type2Bench() {
  const [key, setKey] = useState<ChartKey>('2023-24')
  const [seed, setSeed] = useState(5)
  const chart: IsoChart = useMemo(() => {
    if (key === '2023-24') return CHART_2324
    if (key === '2020-21') return CHART_2021
    if (key === '2017-18') return CHART_2017
    return randomChart(rng(seed * 131 + 7))
  }, [key, seed])
  const [H, setH] = useState(chart.H)
  const [t0, setT0] = useState(Math.round(chart.tMax * 0.6))
  const [target, setTarget] = useState(70)
  useEffect(() => {
    setH(chart.H)
    setT0(Math.round(chart.tMax * 0.6))
  }, [chart])
  const res = isoFromCurves(chart.curves, H, t0)
  const tReq = minTimeForRemoval((t) => isoFromCurves(chart.curves, H, t).R, target, chart.tMax * 3)
  return (
    <Section title="Type II (flocculent) workbench: iso-removal strips" sub="Slide the detention-time line and the basin depth. Each band between two curves removes ΔR·Z/Z₀ of the solids, where Z is the mid-depth of the band; the bands add to the overall removal.">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Seg value={key} onChange={setKey} items={[{ v: '2023-24', label: '2023-24 chart' }, { v: '2020-21', label: '2020-21 chart' }, { v: '2017-18', label: '2017-18 chart' }, { v: 'rand', label: '🎲 random' }]} />
          {key === 'rand' && <button className="btn !py-1 !px-3 !text-xs" onClick={() => setSeed((s) => s + 1)}>🎲 new chart</button>}
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Detention time t₀" value={t0} min={Math.round(chart.tMax * 0.1)} max={Math.round(chart.tMax * 1.2)} step={chart.tMax > 60 ? 1 : 0.5} onChange={setT0} unit=" min" />
          <Slider label="Basin depth Z₀" value={H} min={Math.max(0.5, +(chart.H / 3).toFixed(2))} max={chart.H} step={0.25} onChange={setH} unit=" m" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <IsoChartFig H={chart.H} tMax={chart.tMax} curves={chart.curves} t0={t0} res={H === chart.H ? res : undefined} title={chart.title} grid={chart.grid} />
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm w-full">
            <thead><tr className="text-left text-faint text-xs"><th className="py-1 pr-2">strip</th><th className="pr-2">ΔR (%)</th><th className="pr-2">depths (m)</th><th className="pr-2">Zᵢ (m)</th><th>ΔR·Zᵢ</th></tr></thead>
            <tbody>
              {res.strips.map((s, i) => (
                <tr key={i} className="border-t border-line/60 num">
                  <td className="py-1 pr-2">{+s.r1.toFixed(0)}–{+s.r2.toFixed(0)} %</td><td className="pr-2">{f(s.dr)}</td><td className="pr-2">{f(s.z1, 2)} → {f(s.z2, 2)}</td><td className="pr-2">{f(s.zMid, 2)}</td><td>{f(s.area)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm">
          r₀ = {+res.r0.toFixed(0)} %, ΣΔR·Z/Z₀ = {f(res.sum)}/{H} = {f(res.partial)} % → overall <b className="num">R = {f(res.R)} %</b>
          {res.extrapolated && <span className="text-bad"> (some curves extended past the drawn chart: estimate)</span>}
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 items-center">
          <Slider label="Target removal" value={target} min={30} max={90} step={1} onChange={setTarget} unit=" %" />
          <div className="text-sm">{tReq === null ? 'not reached in 3× the drawn time' : <>needs t₀ ≈ <b className="num">{nf(tReq)} min</b> at Z₀ = {H} m</>}</div>
        </div>
        <Callout kind="tip" title="Notice that…">
          The vertical line crosses the curves at different depths: deep curves are the first to reach the floor, so r₀ steps up as t₀ grows. Halving the depth (try it) shortens the time for the same removal because particles have less to fall: unlike discrete settling, flocculating particles also grow as they fall, so depth does matter here, and detention time must be read off the test, not computed from Stokes.
        </Callout>
      </div>
    </Section>
  )
}

// ================================================================ 3. problems
type Fam = 'type1' | 'type2' | 'mint' | 'sor' | 'stokes'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'type1', label: 'Type I column' },
  { v: 'type2', label: 'Type II removal' },
  { v: 'mint', label: 'Minimum time' },
  { v: 'sor', label: 'Tank size' },
  { v: 'stokes', label: 'Settling velocity' },
]
interface SP extends XProblem<Fam> {
  d: Record<string, number>
  chart?: IsoChart
  col?: { t: number; C: number }[]
}

function make(seed: number, family?: Fam, level: Level = 'exam'): SP {
  const r = rng(seed * 6007 + 3)
  const fam = family ?? pick(r, ['type1', 'type2', 'mint', 'sor', 'stokes'] as Fam[])
  if (fam === 'type1') {
    const H = pick(r, [1.8, 2, 2.4, 3])
    const C0 = pick(r, [300, 450, 600, 650])
    const xs = [0.88, 0.7, 0.55, 0.4, 0.25, 0.1].map((x) => +(x + (r() - 0.5) * 0.04).toFixed(3))
    const ts = [50, 65, 80, 100, 140, 230].map((t) => Math.round(t * (0.9 + r() * 0.25)))
    const col = ts.map((t, i) => ({ t, C: Math.round(C0 * xs[i]) }))
    const vs = ts.map((t) => H / t)
    const v0 = +(vs[1] + (vs[2] - vs[1]) * (0.2 + r() * 0.6) + (r() < 0.5 ? 0 : vs[1] - vs[2]) * 0.0).toFixed(4)
    const tr = typeIColumn({ H, C0, data: col, v0 })
    const steps: XStep[] = [
      { key: 'x0', group: 'Reading the curve', label: 'x₀ at v = v₀', value: tr.x0, digits: 3, abs: 0.02 },
      { key: 'full', group: 'Reading the curve', label: 'fully removed 1 − x₀', value: tr.full, digits: 3, abs: 0.02 },
      { key: 'sum', group: 'Partial removal', label: 'Σ Δx·v̄', value: tr.sum * 100, unit: '× 10⁻² m/min', digits: 3, abs: 0.05, tol: 0.06 },
      { key: 'R', group: 'Result', label: 'overall removal R', value: tr.R * 100, unit: '%', digits: 1, abs: 1.5 },
    ]
    return {
      family: fam, level, title: 'Settling column, discrete (Type I) suspension',
      text: `A settling column analysis is run on a Type I suspension. The column is ${H} m tall and the initial concentration is ${C0} mg/L.\n\n| Time (min) | ${ts.join(' | ')} |\n|---|${ts.map(() => '---').join('|')}|\n| Concentration (mg/L) | ${col.map((c) => c.C).join(' | ')} |\n\nWhat is the theoretical removal efficiency of a basin whose loading rate is $${v0}$ m/min?`,
      hash: hashKey(JSON.stringify([fam, H, C0, col, v0])), steps, d: { H, C0, v0 }, col,
    }
  }
  if (fam === 'type2' || fam === 'mint') {
    const chart = randomChart(r)
    const mid = chart.tMax * (0.45 + r() * 0.4)
    const t0 = Math.round(mid)
    const res = isoFromCurves(chart.curves, chart.H, t0)
    if (fam === 'type2') {
      const steps: XStep[] = [
        { key: 'r0', group: 'Chart', label: 'r₀ (curve reaching the bottom)', value: res.r0, unit: '%', digits: 0, abs: 0.1 },
        { key: 'R', group: 'Result', label: 'overall removal R', value: res.R, unit: '%', digits: 1, abs: 2.5 },
      ]
      return { family: fam, level, title: 'Overall removal from iso-removal lines', text: `A settling column test on a flocculent suspension gives the iso-removal lines in the figure (curves in %, depth in m, time in min). What overall removal will a basin ${chart.H} m deep with a detention time of ${t0} min achieve?`, hash: hashKey(JSON.stringify([fam, chart.H, chart.curves.map((c) => c.pts.length), t0, chart.tMax])), steps, d: { t0 }, chart }
    }
    const target = Math.round(res.R)
    const tm = minTimeForRemoval((t) => isoFromCurves(chart.curves, chart.H, t).R, target, chart.tMax * 3) ?? t0
    const steps: XStep[] = [{ key: 't', group: 'Result', label: 'minimum detention time', value: tm, unit: 'min', digits: 0, tol: 0.08, abs: 4 }]
    return { family: fam, level, title: 'Minimum detention time for a target', text: `From the iso-removal lines in the figure, estimate the minimum detention time needed for ${target} % overall removal in a basin ${chart.H} m deep. (Try several times and sum the strips until R reaches ${target} %.)`, hash: hashKey(JSON.stringify([fam, chart.H, chart.tMax, target, chart.curves[0].pts.length])), steps, d: { target }, chart }
  }
  if (fam === 'sor') {
    const Q = pick(r, [8000, 10000, 12000, 15000, 20000, 30000])
    const v0 = pick(r, [15, 20, 24, 30, 36])
    const depth = pick(r, [3, 3.5, 4])
    const n = pick(r, [2, 3, 4])
    const t = tankSize({ Q, v0, depth, n, LW: 3 })
    const steps: XStep[] = [
      { key: 'A', group: 'Size', label: 'surface area A = Q/v₀', value: t.A, unit: 'm²', digits: 0, tol: 0.01 },
      { key: 'V', group: 'Size', label: 'volume', value: t.V, unit: 'm³', digits: 0, tol: 0.01 },
      { key: 'td', group: 'Check', label: 'detention time', value: t.tHours, unit: 'h', digits: 2, tol: 0.015 },
      { key: 'Au', group: 'Units', label: `area of each of ${n} units`, value: t.Aunit, unit: 'm²', digits: 0, tol: 0.01 },
    ]
    return { family: fam, level, title: 'Sedimentation tank size', text: `A city must treat ${nf(Q)} m³/d of water. A column analysis shows an overflow rate of ${v0} m/d gives satisfactory removal at a depth of ${depth} m. Size the settling tank (${n} units). Find the total area, the volume, the detention time and the area of each unit.`, hash: hashKey(JSON.stringify([fam, Q, v0, depth, n])), steps, d: { Q, v0, depth, n } }
  }
  const d = pick(r, [0.02, 0.05, 0.1, 0.2, 0.5, 1])
  const sg = pick(r, [2.65, 2.4, 1.5])
  const tt = terminalVelocity({ d: d / 1000, sg })
  const steps: XStep[] = [
    { key: 'vs', group: 'Stokes first', label: 'Stokes v (assumed)', value: tt.vStokes * 100, unit: 'cm/s', digits: 3, tol: 0.02 },
    { key: 'Re', group: 'Stokes first', label: 'Reynolds number', value: tt.reStokes, digits: 2, tol: 0.03 },
    { key: 'v', group: 'Result', label: 'terminal velocity', value: tt.v * 100, unit: 'cm/s', digits: 3, tol: 0.04 },
  ]
  return { family: fam, level, title: 'Terminal settling velocity', text: `Find the terminal settling velocity of a sphere of diameter ${d} mm and specific gravity ${sg} in water at 20 °C ($\\rho=998.2$ kg/m³, $\\mu=1.002\\times10^{-3}$ Pa·s). Use Stokes first and check the Reynolds number; if $Re>1$ iterate with $C_D=24/Re+3/\\sqrt{Re}+0.34$.`, hash: hashKey(JSON.stringify([fam, d, sg])), steps, d: { d, sg } }
}

function Solution({ p }: { p: SP }) {
  const d = p.d
  let md = ''
  if (p.family === 'type1' && p.col) {
    const tr = typeIColumn({ H: d.H, C0: d.C0, data: p.col, v0: d.v0 })
    md = [
      `1. $x=C/C_0$ and $v=H/t$ for each reading: ${tr.rows.slice().sort((a, b) => a.t - b.t).map((q) => `(t ${q.t}: x ${f(q.x, 3)}, v ${(q.v * 100).toFixed(2)}×10⁻²)`).join('; ')}.`,
      tx`2. Interpolate $x_0$ at $v_0=${d.v0}$: $x_0=$ **${f(tr.x0, 3)}**; fully removed $1-x_0=$ **${f(tr.full, 3)}**.`,
      `3. Strips (Δx × mean v): ${tr.strips.map((s) => `${f(s.dx, 3)}×${(s.vMean * 100).toFixed(2)}×10⁻²`).join(' + ')} → Σ = **${(tr.sum * 100).toFixed(3)}×10⁻² m/min**.`,
      tx`4. $R=(1-x_0)+\dfrac{\sum\Delta x\,\bar v}{v_0}=${f(tr.full, 3)}+\dfrac{${tr.sum.toFixed(5)}}{${d.v0}}=$ **${f(tr.R * 100, 1)} %**.`,
    ].join('\n\n')
  } else if (p.family === 'type2' && p.chart) {
    const res = isoFromCurves(p.chart.curves, p.chart.H, d.t0)
    md = [`Vertical line at $t_0=${d.t0}$ min. The curve that reaches the floor (${p.chart.H} m) by then is $r_0=$ **${+res.r0.toFixed(0)} %**. Strips:`, `| strip | ΔR | depths (m) | Zᵢ | ΔR·Zᵢ |\n|---|---|---|---|---|\n${res.strips.map((s) => `| ${+s.r1.toFixed(0)}–${+s.r2.toFixed(0)} | ${f(s.dr)} | ${f(s.z1, 2)} → ${f(s.z2, 2)} | ${f(s.zMid, 2)} | ${f(s.area)} |`).join('\n')}`, tx`$R=r_0+\dfrac{\sum\Delta R\,Z_i}{Z_0}=${+res.r0.toFixed(0)}+\dfrac{${f(res.sum)}}{${p.chart.H}}=$ **${f(res.R)} %**`].join('\n\n')
  } else if (p.family === 'mint' && p.chart) {
    const ch = p.chart
    const tm = minTimeForRemoval((t) => isoFromCurves(ch.curves, ch.H, t).R, d.target, ch.tMax * 3) ?? NaN
    const ts = [0.5, 0.7, 0.9, 1.1].map((k) => Math.round(tm * k))
    md = [`Try detention times and sum the strips each time (R = r₀ + ΣΔR·Z/Z₀):`, `| t₀ (min) | r₀ | R (%) |\n|---|---|---|\n${ts.map((t) => { const q = isoFromCurves(ch.curves, ch.H, t); return `| ${t} | ${+q.r0.toFixed(0)} | ${f(q.R)} |` }).join('\n')}`, `R reaches ${d.target} % at $t_0\\approx$ **${nf(tm)} min**.`].join('\n\n')
  } else if (p.family === 'sor') {
    const t = tankSize({ Q: d.Q, v0: d.v0, depth: d.depth, n: d.n, LW: 3 })
    md = [tx`$A=Q/v_0=${nf(d.Q)}/${d.v0}=$ **${nf(t.A)} m²**; each of ${d.n} units $A/${d.n}=$ **${nf(t.Aunit)} m²** (e.g. ${f(t.L, 1)} m × ${f(t.W, 1)} m, L:W = 3:1).`, tx`$V=A\times${d.depth}=$ **${nf(t.V)} m³**; $t=\dfrac{V}{Q}=\dfrac{\text{depth}}{v_0}=$ **${f(t.tHours, 2)} h** (flocculent tanks 4–6 h, discrete 2–4 h); overflow ${f(t.overflowMh, 2)} m/h.`].join('\n\n')
  } else {
    const tt = terminalVelocity({ d: d.d / 1000, sg: d.sg })
    md = [tx`Stokes: $v=\dfrac{g(\rho_s-\rho_w)d^2}{18\mu}=${(tt.vStokes * 100).toFixed(3)}$ cm/s; $Re=\dfrac{\rho vd}{\mu}=${f(tt.reStokes, 2)}$.`, tt.stokesValid ? `$Re\\le1$: Stokes holds, **v = ${(tt.v * 100).toFixed(3)} cm/s**.` : `$Re>1$: Stokes does not hold. Iterate $v=\\sqrt{4g(\\rho_s-\\rho_w)d/(3C_D\\rho_w)}$: ${tt.iterations.slice(0, 5).map((q) => `v ${(q.v * 100).toFixed(2)} cm/s (Re ${f(q.Re, 1)}, C_D ${f(q.CD, 2)})`).join(' → ')} … converges to **v = ${(tt.v * 100).toFixed(3)} cm/s**, Re = ${f(tt.Re, 1)} (${tt.regime}).`].join('\n\n')
  }
  return <Md className="text-sm">{md}</Md>
}

export default function SedLab() {
  return (
    <div className="space-y-6">
      <BasinSim />
      <Type2Bench />
      <ExamProblems<Fam, SP>
        topic="ev-sed:lab"
        families={FAMS}
        make={make}
        initialSeed={4}
        figure={(p) => (p.chart ? <IsoChartFig H={p.chart.H} tMax={p.chart.tMax} curves={p.chart.curves} title={p.title} /> : null)}
        foot="Charts are read by eye: answers within a couple of percent count."
        solution={(p) => <Solution p={p} />}
      />
    </div>
  )
}
void randInt
