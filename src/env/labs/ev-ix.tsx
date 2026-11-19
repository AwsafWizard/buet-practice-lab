// Ion-exchange softener: the bypass mixing diagram, a resin bed that fills up with hardness until breakthrough, regeneration,
// the breakthrough curve, a fixed-bed designer, then exam-style problems.
import { useEffect, useRef, useState } from 'react'
import { Callout, Md, Section } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { breakthrough, fixedBed, homeSoftener } from '../engine/ix'
import { LineChart } from '../figs/pop-chart'
import { BypassFig } from '../figs/ta-ix'

const f = (v: number, d = 1) => v.toFixed(d)
const tx = String.raw

function HomeBench() {
  const [V, setV] = useState(0.1)
  const [cap, setCap] = useState(57)
  const [Q, setQ] = useState(2000)
  const [Hr, setHr] = useState(280)
  const [Hd, setHd] = useState(85)
  const [byOverride, setBy] = useState<number | null>(null)
  const base = homeSoftener({ V, cap, Qlpd: Q, Hraw: Hr, Hdes: Hd })
  const bypass = byOverride ?? base.bypass
  const e = homeSoftener({ V, cap, Qlpd: Q, Hraw: Hr, Hdes: Hd, bypass })
  const [day, setDay] = useState(0)
  const [play, setPlay] = useState(true)
  const [regen, setRegen] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    if (!play) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setDay((d) => (d > e.days * 1.4 ? 0 : d + (dt * e.days) / 9))
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [play, e.days])
  const dayMax = e.days * 1.35
  const d = Math.min(day, dayMax)
  const used = d / e.days
  const leak = breakthrough(used)
  const blended = bypass * Hr + (1 - bypass) * Hr * leak
  const ok = blended <= Hd * 1.0001
  const curve = Array.from({ length: 81 }, (_, i) => {
    const dd = (dayMax * i) / 80
    return [dd, bypass * Hr + (1 - bypass) * Hr * breakthrough(dd / e.days)] as [number, number]
  })
  const front = Math.min(used, 1) // exhausted fraction of the bed, from the inlet
  const salt = 150 * V
  return (
    <Section title="Home softener: bypass, bed and breakthrough" sub="Hard water goes through the resin, Ca²⁺ and Mg²⁺ swap for Na⁺, and the soft water is blended back with a little raw water so the tap does not get the zero-hardness water. The bed fills from the inlet end until it breaks through.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Resin volume" value={V} min={0.05} max={0.5} step={0.05} onChange={(v) => { setV(+v.toFixed(2)); setDay(0) }} unit=" m³" />
          <Slider label="Exchange capacity" value={cap} min={30} max={100} step={1} onChange={(v) => { setCap(v); setDay(0) }} unit=" kg/m³" />
          <Slider label="Water use" value={Q} min={500} max={5000} step={100} onChange={(v) => { setQ(v); setDay(0) }} unit=" L/d" />
          <Slider label="Raw hardness" value={Hr} min={150} max={400} step={5} onChange={(v) => { setHr(v); setBy(null); setDay(0) }} unit=" mg/L" />
          <Slider label="Wanted hardness" value={Hd} min={20} max={Math.min(150, Hr - 10)} step={5} onChange={(v) => { setHd(v); setBy(null); setDay(0) }} unit=" mg/L" />
          <Slider label="Bypass (your choice)" value={+(bypass * 100).toFixed(1)} min={0} max={100} step={0.5} onChange={(v) => { setBy(v / 100); setDay(0) }} unit=" %" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <svg viewBox="0 0 560 230" width="100%" role="img" aria-label="ion exchange softener with bypass" style={{ display: 'block' }}>
            <defs><marker id="ixa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--c-mute)" /></marker></defs>
            <text x="6" y="64" fontSize="12" fontWeight="700" fill="var(--c-ink)">Raw</text>
            <text x="6" y="80" fontSize="11" fill="var(--c-mute)">{Hr} mg/L</text>
            <line x1="46" y1="70" x2="150" y2="70" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#ixa)" />
            <path d="M100 70 V190 H400" fill="none" stroke="var(--c-mute)" strokeWidth={1 + bypass * 5} markerEnd="url(#ixa)" />
            <text x="112" y="184" fontSize="11" fill="var(--c-mute)">bypass {f(bypass * 100)} % = {f(Q * bypass, 0)} L/d at {Hr} mg/L</text>
            {/* bed */}
            <rect x="150" y="30" width="80" height="120" rx="6" fill="var(--c-panel2)" stroke="var(--c-ink)" />
            <rect x="152" y={32 + 116 * (1 - Math.min(front, 1))} width="76" height={116 * Math.min(front, 1)} fill="var(--c-bad)" opacity="0.35" />
            <rect x="152" y="32" width="76" height={116 * (1 - Math.min(front, 1))} fill="var(--c-water)" opacity="0.3" />
            <text x="190" y="24" textAnchor="middle" fontSize="11" fill="var(--c-ink)">resin {V} m³</text>
            <text x="190" y="100" textAnchor="middle" fontSize="11" fill="var(--c-ink)">{front >= 1 ? 'exhausted' : `${f(Math.min(front, 1) * 100, 0)} % used`}</text>
            <text x="190" y="164" textAnchor="middle" fontSize="11" fill="var(--c-mute)">through resin {f(Q * (1 - bypass), 0)} L/d</text>
            <line x1="230" y1="70" x2="300" y2="70" stroke="var(--c-mute)" strokeWidth={1 + (1 - bypass) * 5} markerEnd="url(#ixa)" />
            <text x="232" y="60" fontSize="11" fill="var(--c-mute)">{f(Hr * leak, 0)} mg/L</text>
            <circle cx="400" cy="130" r="26" fill="var(--c-panel2)" stroke="var(--c-ink)" />
            <text x="400" y="134" textAnchor="middle" fontSize="11" fill="var(--c-ink)">blend</text>
            <path d="M300 70 H400 V104" fill="none" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#ixa)" />
            <line x1="426" y1="130" x2="526" y2="130" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#ixa)" />
            <text x="432" y="118" fontSize="12" fontWeight="700" fill={ok ? 'var(--c-good)' : 'var(--c-bad)'}>{f(blended, 0)} mg/L</text>
            <text x="432" y="150" fontSize="11" fill="var(--c-mute)">tap water</text>
          </svg>
        </div>
        <Slider label="Day of operation" value={+d.toFixed(1)} min={0} max={+dayMax.toFixed(1)} step={0.1} onChange={(v) => { setPlay(false); setDay(v) }} unit=" d" />
        <div className="flex flex-wrap gap-2">
          <button className="btn !py-1 !px-3 !text-xs" onClick={() => setPlay(!play)}>{play ? 'Pause' : 'Run'}</button>
          <button className="btn !py-1 !px-3 !text-xs" onClick={() => { setDay(0); setRegen((r) => r + 1) }}>♻ Regenerate with brine</button>
          <span className="text-xs text-mute self-center">regenerations so far: {regen} · salt each time at 150 kg/m³: {f(salt, 0)} kg NaCl ({f(salt / 0.1 / 1000, 2)} m³ of 10 % brine)</span>
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <LineChart series={[{ id: 'h', label: 'tap hardness', color: 'var(--c-accent)', pts: curve }, { id: 'w', label: 'wanted', color: 'var(--c-good)', dash: true, pts: [[0, Hd], [dayMax, Hd]] }]} dots={[{ x: d, y: blended, color: 'var(--c-bad)' }]} xLabel="days since regeneration" yLabel="hardness of tap water (mg/L as CaCO₃)" yMin={0} fmtY={(v) => String(Math.round(v))} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Bypass" v={`${f(bypass * 100, 1)} %`} sub={`H_des/H_raw = ${f(base.bypass * 100, 1)} %`} />
          <Read k="Load on resin" v={`${f(e.loadKgD, 3)} kg/d`} sub="treated flow × raw hardness" />
          <Read k="Capacity" v={`${f(e.capKg, 2)} kg`} sub="V × exchange capacity" />
          <Read k="Between regenerations" v={`${f(e.days, 1)} d`} sub="capacity / load" />
        </div>
        <Callout kind="tip" title="Notice that…">
          With the exact bypass the tap water sits at the wanted hardness until the bed starts to break through, then climbs back towards the raw value as the bed saturates. Raise the bypass slider above the exact value and the tap is too hard from day zero; lower it and you waste resin capacity (regeneration comes sooner and salt is burnt for water that did not need softening). Every halving of the water use doubles the days between regenerations.
        </Callout>
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

function FixedBench() {
  const [Qd, setQd] = useState(25000)
  const [Hr, setHr] = useState(440)
  const [Hd, setHd] = useState(120)
  const [cap, setCap] = useState(95)
  const [ld, setLd] = useState(0.35)
  const [dep, setDep] = useState(1.5)
  const b = fixedBed({ Q: Qd, Hraw: Hr, Hdes: Hd, cap, loading: ld, depth: dep, regen: 150, strength: 0.1 })
  return (
    <Section title="Fixed-bed designer" sub="A plant-size softener at a hydraulic loading rate: area from the flow, volume from the depth, run length from capacity and hardness load, salt from 150 kg per m³ of resin as 10 % brine.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Plant flow" value={Qd} min={2000} max={60000} step={1000} onChange={setQd} unit=" m³/d" />
          <Slider label="Raw hardness" value={Hr} min={200} max={600} step={10} onChange={setHr} unit=" mg/L" />
          <Slider label="Wanted hardness" value={Hd} min={40} max={150} step={5} onChange={setHd} unit=" mg/L" />
          <Slider label="Exchange capacity" value={cap} min={50} max={120} step={5} onChange={setCap} unit=" kg/m³" />
          <Slider label="Loading rate" value={ld} min={0.1} max={0.6} step={0.05} onChange={(v) => setLd(+v.toFixed(2))} unit=" m³/min·m²" />
          <Slider label="Bed depth" value={dep} min={0.6} max={3} step={0.1} onChange={(v) => setDep(+v.toFixed(1))} unit=" m" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Bypass" v={`${f(b.bypass * 100, 1)} %`} sub={`${f(Qd * (1 - b.bypass), 0)} m³/d through resin`} />
          <Read k="Bed area" v={`${f(b.A, 1)} m²`} sub={`D = ${f(Math.sqrt((4 * b.A) / Math.PI), 2)} m (circular)`} />
          <Read k="Resin per bed" v={`${f(b.V, 1)} m³`} sub="area × depth" />
          <Read k="Run length" v={`${f(b.runH, 1)} h`} sub={`${f(b.cyclesPerDay, 2)} regenerations/day`} />
          <Read k="Salt per regeneration" v={`${f(b.saltKg, 0)} kg`} sub={`${f(b.brineM3, 1)} m³ of 10 % brine`} />
          <Read k="Salt per day" v={`${f(b.saltKgPerDay / 1000, 1)} t`} sub="one bed in service" />
        </div>
        <p className="text-xs text-faint">Continuous service needs at least two beds, each sized for the full flow: one runs while the other is backwashed, brined and rinsed. Run time is proportional to depth (900 min per metre at 250 mg/L, 0.4 m³/min·m² and 90 kg/m³, the T08-B numbers).</p>
      </div>
    </Section>
  )
}

// ================================================================ problems
type Fam = 'home' | 'fixed'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'home', label: 'Home softener' },
  { v: 'fixed', label: 'Fixed-bed plant' },
]
interface IP extends XProblem<Fam> {
  d: Record<string, number>
}
function make(seed: number, family?: Fam, level: Level = 'exam'): IP {
  const r = rng(seed * 3109 + 5)
  const fam = family ?? pick(r, ['home', 'home', 'fixed'] as Fam[])
  if (fam === 'home') {
    const V = pick(r, [0.1, 0.15, 0.2, 0.25])
    const cap = randInt(r, 50, 90, 5)
    const Q = randInt(r, 10, 40) * 100
    const Hraw = randInt(r, 22, 36) * 10
    const Hdes = pick(r, [60, 75, 85, 90, 100])
    const e = homeSoftener({ V, cap, Qlpd: Q, Hraw, Hdes })
    const steps: XStep[] = [
      { key: 'by', group: 'Bypass', label: 'fraction bypassed', value: e.bypass * 100, unit: '%', digits: 1, abs: 0.6 },
      { key: 'load', group: 'Run length', label: 'hardness load on the resin', value: e.loadKgD, unit: 'kg/d', digits: 4, tol: 0.02 },
      { key: 'cap', group: 'Run length', label: 'capacity of the bed', value: e.capKg, unit: 'kg', digits: 2, tol: 0.01 },
      { key: 'days', group: 'Run length', label: 'time between regenerations', value: e.days, unit: 'days', digits: 1, tol: 0.03 },
    ]
    return { family: fam, level, title: 'Home water softener', text: `A home water softener has ${V} m³ of ion exchange resin with an exchange capacity of ${cap} kg/m³. The occupants use ${nfl(Q)} L of water per day. The water has ${Hraw} mg/L of hardness as CaCO₃ and it is wanted at ${Hdes} mg/L. How much should be bypassed? What is the time between regeneration cycles?`, hash: hashKey(JSON.stringify([fam, V, cap, Q, Hraw, Hdes])), steps, d: { V, cap, Q, Hraw, Hdes } }
  }
  const Q = randInt(r, 10, 40) * 1000
  const Hraw = randInt(r, 25, 50) * 10
  const Hdes = pick(r, [100, 120])
  const cap = randInt(r, 18, 22) * 5
  const loading = pick(r, [0.3, 0.35, 0.4, 0.45])
  const depth = pick(r, [1.2, 1.5, 1.8])
  const b = fixedBed({ Q, Hraw, Hdes, cap, loading, depth, regen: 150, strength: 0.1 })
  const steps: XStep[] = [
    { key: 'by', group: 'Flow', label: 'fraction bypassed', value: b.bypass * 100, unit: '%', digits: 1, abs: 0.6 },
    { key: 'A', group: 'Bed', label: 'bed area', value: b.A, unit: 'm²', digits: 1, tol: 0.015 },
    { key: 'V', group: 'Bed', label: 'volume of resin', value: b.V, unit: 'm³', digits: 1, tol: 0.015 },
    { key: 'run', group: 'Regeneration', label: 'run time between regenerations', value: b.runH, unit: 'h', digits: 1, tol: 0.03 },
    { key: 'salt', group: 'Regeneration', label: 'NaCl per regeneration', value: b.saltKg, unit: 'kg', digits: 0, tol: 0.02 },
  ]
  return { family: fam, level, title: 'Fixed-bed ion exchange softener', text: `An ion exchange softener of capacity ${cap} kg/m³ treats ${nfl(Q)} m³/d of water of hardness ${Hraw} mg/L as CaCO₃, to be softened to ${Hdes} mg/L. The unit runs at ${loading} m³/min·m² with a bed depth of ${depth} m. Regeneration needs 150 kg NaCl per m³ of resin as a 10 % solution. Find the bypass fraction, bed area, volume of resin, the time between regenerations and the salt per regeneration.`, hash: hashKey(JSON.stringify([fam, Q, Hraw, Hdes, cap, loading, depth])), steps, d: { Q, Hraw, Hdes, cap, loading, depth } }
}
const nfl = (v: number) => v.toLocaleString('en-US')
/** thousands separator that KaTeX does not space out */
const nflt = (v: number) => nfl(v).replace(/,/g, '{,}')
function Solution({ p }: { p: IP }) {
  const d = p.d
  if (p.family === 'home') {
    const e = homeSoftener({ V: d.V, cap: d.cap, Qlpd: d.Q, Hraw: d.Hraw, Hdes: d.Hdes })
    return (
      <div className="space-y-2 text-sm">
        <Md>{tx`**Why the bypass:** the resin takes out all the hardness, so to get ${d.Hdes} mg/L at the tap some raw water is sent round the bed and mixed back. The hardness balance on the mix gives the bypass fraction:`}</Md>
        <div className="rounded-xl border border-line bg-panel2/40 p-2">
          <BypassFig Hraw={d.Hraw} Hdes={d.Hdes} X={e.bypass} Q={d.Q} qUnit="L/d" />
        </div>
        <Md>
          {[
            tx`1. Bypass: $X\cdot${d.Hraw}+(1-X)\cdot0=${d.Hdes}$ → $X=\dfrac{H_{des}}{H_{raw}}=\dfrac{${d.Hdes}}{${d.Hraw}}=$ **${f(e.bypass * 100, 1)} %**.`,
            tx`2. Through the resin: $(1-X)\,Q=${f(e.treated, 4)}\times${nflt(d.Q)}=${f(e.treatedLpd, 0)}$ L/d.`,
            tx`3. Hardness the resin must hold back each day: $${f(e.treatedLpd, 0)}\ \text{L/d}\times${d.Hraw}\ \text{mg/L}=${nflt(Math.round(e.treatedLpd * d.Hraw))}$ mg/d $=$ **${f(e.loadKgD, 4)} kg/d** (only the treated stream loads the resin).`,
            tx`4. What the bed can hold: $V\times\text{capacity}=${d.V}\times${d.cap}=$ **${f(e.capKg, 2)} kg** as CaCO₃.`,
            tx`5. Time between regenerations: $t=\dfrac{\text{capacity}}{\text{load}}=\dfrac{${f(e.capKg, 2)}}{${f(e.loadKgD, 4)}}=$ **${f(e.days, 1)} days**.`,
          ].join('\n\n')}
        </Md>
      </div>
    )
  }
  const b = fixedBed({ Q: d.Q, Hraw: d.Hraw, Hdes: d.Hdes, cap: d.cap, loading: d.loading, depth: d.depth, regen: 150, strength: 0.1 })
  return (
    <div className="space-y-2 text-sm">
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <BypassFig Hraw={d.Hraw} Hdes={d.Hdes} X={b.bypass} Q={d.Q} qUnit="m³/d" />
      </div>
      <Md>
        {[
          tx`1. Bypass (hardness balance, resin effluent taken as 0): $X=\dfrac{${d.Hdes}}{${d.Hraw}}=$ **${f(b.bypass * 100, 1)} %**; through the resin $${nflt(d.Q)}\times${f(1 - b.bypass, 3)}=${f(b.Qtreated, 0)}$ m³/d $\div1440=${f(b.QtreatedMin, 2)}$ m³/min.`,
          tx`2. **Why area first:** the loading rate is the flow per m² of bed, so $A=\dfrac{Q_{resin}}{\text{loading}}=\dfrac{${f(b.QtreatedMin, 2)}}{${d.loading}}=$ **${f(b.A, 1)} m²**.`,
          tx`3. Resin volume: $V=A\times\text{depth}=${f(b.A, 1)}\times${d.depth}=$ **${f(b.V, 1)} m³** per bed (build at least two, so one runs while the other is regenerated).`,
          tx`4. Run time. Per m² of bed: hardness arriving $=${d.loading}\ \text{m}^3\text{/min}\times${f(d.Hraw / 1000, 3)}\ \text{kg/m}^3=${f(b.loadPerM2, 4)}$ kg/min, and the resin under it holds $${d.cap}\times${d.depth}=${f(d.cap * d.depth, 1)}$ kg. So $t=\dfrac{${f(d.cap * d.depth, 1)}}{${f(b.loadPerM2, 4)}}=${f(b.runMin, 0)}$ min $=$ **${f(b.runH, 1)} h**.`,
          tx`5. Salt: $150\ \text{kg/m}^3\times${f(b.V, 1)}\ \text{m}^3=$ **${f(b.saltKg, 0)} kg NaCl** per regeneration; as 10 % brine $${f(b.saltKg, 0)}/0.10=${f(b.saltKg * 10, 0)}$ kg ≈ ${f(b.brineM3, 1)} m³.`,
        ].join('\n\n')}
      </Md>
    </div>
  )
}

export default function IxLab() {
  return (
    <div className="space-y-6">
      <HomeBench />
      <FixedBench />
      <ExamProblems<Fam, IP> topic="ev-ix:lab" families={FAMS} make={make} initialSeed={8} solution={(p) => <Solution p={p} />} foot="The exchanger is taken to deliver zero hardness; the bypass makes up the wanted hardness." />
    </div>
  )
}

/** for the render tests (src/env/figs/ta-work.test.tsx) */
export { FAMS, make, Solution }
