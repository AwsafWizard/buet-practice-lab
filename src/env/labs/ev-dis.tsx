// Breakpoint chlorination: the curve with a dose slider showing the zones, then Chick–Watson and exam-style problems.
import { useState } from 'react'
import { Callout, Md, Section } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { breakpointModel, chickWatson, chlorineDose, residualAt, timeAtOtherC, timeForLogKill, type Zone } from '../engine/chlorine'
import { LineChart } from '../figs/pop-chart'

const f = (v: number, d = 1) => v.toFixed(d)
const tx = String.raw

const ZONES: Record<Zone, { name: string; text: string }> = {
  demand: { name: 'Zone 1: demand', text: 'Chlorine is used up by reducing compounds (Fe²⁺, Mn²⁺, H₂S, some organics): no residual yet.' },
  chloramine: { name: 'Zone 2: chloramines form', text: 'Chlorine reacts with ammonia: NH₃ + HOCl → NH₂Cl (monochloramine), NHCl₂ … The measured residual rises, but it is combined chlorine (weak disinfectant, persistent).' },
  destruction: { name: 'Zone 3: chloramines destroyed', text: 'More chlorine oxidises chloramines and chloro-organics to N₂ and other products: the residual falls to the breakpoint.' },
  free: { name: 'Zone 4: free residual', text: 'Past the breakpoint all the dose appears as free chlorine (HOCl, OCl⁻), the best disinfectant. This is the target of breakpoint chlorination.' },
}

function Breakpoint() {
  const [d0, setD0] = useState(0.5)
  const [N, setN] = useState(1)
  const [dose, setDose] = useState(3)
  const m = breakpointModel(d0, N)
  const r = residualAt(m, dose)
  const top = Math.ceil(m.bpDose + 3)
  const pts = Array.from({ length: 121 }, (_, i) => {
    const D = (top * i) / 120
    return [D, residualAt(m, D).residual] as [number, number]
  })
  return (
    <Section title="Breakpoint chlorination" sub="Add more and more chlorine to water that contains some ammonia and some reducing matter, and watch the residual. The dose slider shows which zone you are in.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Dose" value={dose} min={0} max={top} step={0.1} onChange={(v) => setDose(+v.toFixed(1))} unit=" mg/L" />
          <Slider label="Immediate demand (reducing matter)" value={d0} min={0} max={2} step={0.1} onChange={(v) => setD0(+v.toFixed(1))} unit=" mg/L" />
          <Slider label="Ammonia-N" value={N} min={0.2} max={2} step={0.1} onChange={(v) => setN(+v.toFixed(1))} unit=" mg/L" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <LineChart
            series={[
              { id: 'res', label: 'residual', color: 'var(--c-accent)', pts },
              { id: 'app', label: 'dose = residual (no demand)', color: 'var(--c-faint)', dash: true, pts: [[0, 0], [top, top]] },
            ]}
            dots={[{ x: dose, y: r.residual, color: 'var(--c-bad)' }, { x: m.peakDose, y: m.peakRes, color: 'var(--c-load)', label: 'peak' }, { x: m.bpDose, y: m.bpRes, color: 'var(--c-good)', label: 'breakpoint' }]}
            vline={{ x: dose, label: `dose ${dose}` }}
            xLabel="chlorine dose (mg/L)"
            yLabel="residual measured (mg/L)"
            yMin={0}
          />
        </div>
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm">
          <b>{ZONES[r.zone].name}.</b> {ZONES[r.zone].text}
          <div className="num mt-1">residual {f(r.residual, 2)} mg/L = combined {f(r.combined, 2)} + free {f(r.free, 2)}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Combined-residual peak" v={`${f(m.peakRes, 2)} mg/L`} sub={`at dose ${f(m.peakDose, 1)} (Cl₂:N ≈ 5:1)`} />
          <Read k="Breakpoint" v={`${f(m.bpRes, 2)} mg/L`} sub={`at dose ${f(m.bpDose, 1)} (Cl₂:N ≈ 7.6:1)`} />
          <Read k="Dose for 0.5 free" v={`${f(m.bpDose + 0.5, 1)} mg/L`} sub="breakpoint dose + residual wanted" />
          <Read k="Dose = demand + residual" v={`${f(chlorineDose(m.bpDose, 0.5), 1)} mg/L`} sub="demand taken up to the breakpoint" />
        </div>
        <Callout kind="tip" title="Notice that…">
          More ammonia moves the peak and the breakpoint to the right: ammonia-rich waters need a lot more chlorine to reach free residual. Stopping in zone 2 leaves a combined (chloramine) residual, which is weaker but lasts longer in the distribution system, and that is sometimes deliberate: ammonia is added so that chlorine does not react with organics and phenols (fewer THMs, no odour). The curve is a qualitative model built on the T10 p10–11 figures.
        </Callout>
      </div>
    </Section>
  )
}

function ChickBench() {
  const [k, setK] = useState(0.21)
  const [C, setC] = useState(1.8)
  const [lg, setLg] = useState(3)
  const t = timeForLogKill(k, C, lg)
  const pts = Array.from({ length: 61 }, (_, i) => {
    const tt = (i * 2 * t) / 60
    return [tt, Math.log10(Math.exp(-k * C * tt))] as [number, number]
  })
  return (
    <Section title="Chick–Watson: how long for a log kill?" sub="ln(N/N₀) = −k·Cⁿ·t with n = 1: kill depends on the product C·t.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-2">
          <Slider label="Rate constant k" value={k} min={0.02} max={1} step={0.01} onChange={setK} unit=" L/mg·s" />
          <Slider label="Free chlorine C" value={C} min={0.2} max={5} step={0.1} onChange={(v) => setC(+v.toFixed(1))} unit=" mg/L" />
          <Slider label="Log kill wanted" value={lg} min={1} max={6} step={0.5} onChange={setLg} unit=" log" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <LineChart series={[{ id: 'k', label: 'log N/N₀', color: 'var(--c-accent)', pts }]} dots={[{ x: t, y: -lg, color: 'var(--c-bad)' }]} xLabel="contact time (s)" yLabel="log₁₀ (N/N₀)" fmtY={(v) => String(+v.toFixed(1))} />
        </div>
        <div className="text-sm">{lg}-log ({f((1 - Math.pow(10, -lg)) * 100, 3)} %) needs <b className="num">{f(t, 1)} s</b>; C·t = <b className="num">{f(C * t, 1)} mg·s/L</b>. Doubling C halves t ({f(timeAtOtherC(C, t, 2 * C), 1)} s): C·t stays constant.</div>
      </div>
    </Section>
  )
}
function Read({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line p-2">
      <div className="text-[11px] text-faint">{k}</div>
      <div className="num font-semibold">{v}</div>
      {sub && <div className="text-[11px] text-mute">{sub}</div>}
    </div>
  )
}

type Fam = 'cw' | 'dose' | 'ct'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'cw', label: 'Rate constant k' },
  { v: 'dose', label: 'Dose = demand + residual' },
  { v: 'ct', label: 'C·t scaling' },
]
interface DP extends XProblem<Fam> {
  d: Record<string, number>
  data?: { t: number; N: number }[]
}
function make(seed: number, family?: Fam, level: Level = 'exam'): DP {
  const r = rng(seed * 2711 + 19)
  const fam = family ?? pick(r, ['cw', 'dose', 'ct'] as Fam[])
  const hash = (x: unknown) => hashKey(JSON.stringify([fam, x]))
  if (fam === 'cw') {
    const C = pick(r, [1.2, 1.5, 1.8, 2.5])
    const k = pick(r, [0.12, 0.2, 0.3])
    const N0 = pick(r, [5000, 6152, 8000])
    const ts = [0, 2, 4, 6, 8]
    const data = ts.map((t) => ({ t, N: Math.round(N0 * Math.exp(-k * C * t * (0.95 + r() * 0.1))) }))
    const cw = chickWatson({ C, data })
    const steps: XStep[] = [{ key: 'ct', group: 'Plot', label: 'C·t at t = 8 s', value: C * 8, unit: 'mg·s/L', digits: 1, tol: 0.005 }, { key: 'ln', group: 'Plot', label: 'ln(N/N₀) at t = 8 s', value: cw.pts[4].lnR, digits: 2, abs: 0.03 }, { key: 'k', group: 'Result', label: 'k (slope through the origin)', value: cw.k, unit: 'L/mg·s', digits: 3, tol: 0.06, abs: 0.01 }]
    return { family: fam, level, title: 'Chick–Watson rate constant', text: `The data for HOCl disinfection of a virus at ${C} mg/L are below (20 °C, pH 6). Determine the rate constant of inactivation assuming the Chick–Watson model with n = 1.\n\n| Time (s) | ${ts.join(' | ')} |\n|---|${ts.map(() => '---').join('|')}|\n| PFU | ${data.map((q) => q.N).join(' | ')} |`, hash: hash([C, data]), steps, d: { C }, data }
  }
  if (fam === 'dose') {
    const demand = randInt(r, 5, 25) / 10
    const res = pick(r, [0.2, 0.3, 0.5])
    const Q = pick(r, [5000, 10000, 20000])
    const dose = chlorineDose(demand, res)
    const steps: XStep[] = [{ key: 'dose', group: 'Dose', label: 'chlorine dose', value: dose, unit: 'mg/L', digits: 2, tol: 0.01 }, { key: 'kg', group: 'Feed', label: 'chlorine per day', value: (dose * Q) / 1000, unit: 'kg/d', digits: 1, tol: 0.015 }]
    return { family: fam, level, title: 'Chlorine dose', text: `A water has a chlorine demand of ${demand} mg/L and a residual of ${res} mg/L is wanted after the contact period. What dose is needed, and how many kg of chlorine per day for ${Q.toLocaleString('en-US')} m³/d?`, hash: hash([demand, res, Q]), steps, d: { demand, res, Q } }
  }
  const C1 = pick(r, [0.5, 1, 1.5, 2])
  const t1 = pick(r, [20, 30, 40, 60])
  const C2 = pick(r, [0.25, 0.4, 3, 4])
  const t2 = timeAtOtherC(C1, t1, C2)
  const steps: XStep[] = [{ key: 'K', group: 'Constant', label: 'C·t', value: C1 * t1, unit: 'mg·min/L', digits: 1, tol: 0.005 }, { key: 't', group: 'Result', label: `time at ${C2} mg/L`, value: t2, unit: 'min', digits: 1, tol: 0.015 }]
  return { family: fam, level, title: 'Contact time at another concentration', text: `A given kill of an organism takes ${t1} min at a free chlorine concentration of ${C1} mg/L. Using Cⁿt = constant with n = 1, how long does the same kill need at ${C2} mg/L?`, hash: hash([C1, t1, C2]), steps, d: { C1, t1, C2 } }
}
function Solution({ p }: { p: DP }) {
  const d = p.d
  let md: string
  if (p.family === 'cw' && p.data) {
    const cw = chickWatson({ C: d.C, data: p.data })
    md = [`| t (s) | N | ln(N/N₀) | C·t |\n|---|---|---|---|\n${cw.pts.map((q) => `| ${q.t} | ${q.N} | ${f(q.lnR, 3)} | ${f(q.ct, 1)} |`).join('\n')}`, tx`Plot $-\ln(N/N_0)$ against $C\,t$; the slope through the origin is $k_{cw}=\dfrac{\sum(-\ln)\,Ct}{\sum (Ct)^2}=$ **${f(cw.k, 3)} L/mg·s**.`].join('\n\n')
  } else if (p.family === 'dose') {
    md = tx`Dose $=$ demand $+$ residual $=${d.demand}+${d.res}=$ **${f(d.demand + d.res, 2)} mg/L**. Mass $=${f(d.demand + d.res, 2)}\ \text{g/m}^3\times${d.Q.toLocaleString('en-US')}\ \text{m}^3\text{/d}=$ **${f(((d.demand + d.res) * d.Q) / 1000, 1)} kg/d**.`
  } else {
    md = tx`$Ct=${d.C1}\times${d.t1}=${f(d.C1 * d.t1, 1)}$ mg·min/L; $t=\dfrac{Ct}{${d.C2}}=$ **${f((d.C1 * d.t1) / d.C2, 1)} min**.`
  }
  return <Md className="text-sm">{md}</Md>
}

export default function DisLab() {
  return (
    <div className="space-y-6">
      <Breakpoint />
      <ChickBench />
      <ExamProblems<Fam, DP> topic="ev-dis:lab" families={FAMS} make={make} initialSeed={7} solution={(p) => <Solution p={p} />} foot="Design pH for chlorination is 6.5–7.5; HOCl is a far better disinfectant than OCl⁻." />
    </div>
  )
}
