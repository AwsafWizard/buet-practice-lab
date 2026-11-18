// Cone of depression: confined / unconfined section drawn live from the wells engine, a second well with superposed cones,
// then exam-style problems (find Q, find K, observation wells, interference, storage volume).
import { useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { drawdownAt, drawdownCurve, dupuitK, dupuitQ, interferenceConfinedQ, interferenceUnconfinedQ, kObsUnconfined, qObsConfined, storageVolume, thiemK, thiemQ, unconfinedInterferenceChain, yieldFor, type Aquifer } from '../engine/wells'
import { GwSection } from '../figs/gw-section'
import { LineChart } from '../figs/pop-chart'

const nf = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const tx = String.raw

export default function GwLab() {
  const [kind, setKind] = useState<'confined' | 'unconfined'>('confined')
  const [K, setK] = useState(20) // m/day
  const [thick, setThick] = useState(30)
  const [rw, setRw] = useState(0.15)
  const [R, setR] = useState(300)
  const [s, setS] = useState(4)
  const [two, setTwo] = useState(false)
  const [a, setA] = useState(60)
  const [mode, setMode] = useState<'sameQ' | 'sameS'>('sameQ')

  const sMax = kind === 'unconfined' ? thick * 0.6 : 15
  const sEff = Math.min(s, sMax)
  const aq: Aquifer = { kind, K, thick, D: kind === 'confined' ? thick + 25 : undefined, rw, R }
  const Q1 = yieldFor(aq, sEff)
  const aOk = a < R
  let Qeach = Q1
  if (two && mode === 'sameS' && aOk) Qeach = kind === 'confined' ? interferenceConfinedQ({ K, b: thick, s: sEff, rw, R, a }) : interferenceUnconfinedQ({ K, D: thick, s: sEff, rw, R, a })
  const wells = two ? [{ x: 0, Q: Qeach }, { x: a, Q: Qeach }] : [{ x: 0, Q: Q1 }]
  const sw = drawdownAt(aq, wells, 0)
  const sMid = two ? drawdownAt(aq, wells, a / 2) : drawdownAt(aq, wells, rw * 10)
  const cur = drawdownCurve(aq, Q1, 90)
  const span = two ? Math.min(R, Math.max(4 * a, 40)) : R
  const xr: [number, number] = two ? [-span, a + span] : [-R, R]
  const sAt = (r: number) => cur.reduce((b, c) => (Math.abs(c.r - r) < Math.abs(b.r - r) ? c : b), cur[0]).s

  return (
    <div className="space-y-6">
      <Section title="Cone of depression" sub="Pump a well in a confined or an unconfined aquifer and watch the water level drop around it. Everything is drawn from the same equations the exam uses.">
        <div className="space-y-3">
          <Seg value={kind} onChange={setKind} items={[{ v: 'confined', label: 'Confined (Thiem)' }, { v: 'unconfined', label: 'Unconfined (Dupuit)' }]} />
          <div className="rounded-xl border border-line p-2 bg-bg/40">
            <GwSection aq={aq} wells={wells} xr={xr} note={two ? undefined : `cone reaches the radius of influence R = ${R} m`} />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            <Slider label="Hydraulic conductivity K" value={K} min={1} max={80} step={1} onChange={setK} unit=" m/d" />
            <Slider label={kind === 'confined' ? 'Aquifer thickness b' : 'Saturated thickness H (D)'} value={thick} min={10} max={80} step={1} onChange={setThick} unit=" m" />
            <Slider label="Well radius r" value={rw} min={0.05} max={0.5} step={0.025} onChange={setRw} unit=" m" />
            <Slider label="Radius of influence R" value={R} min={50} max={1000} step={10} onChange={setR} unit=" m" />
            <Slider label="Drawdown wanted at the well s" value={sEff} min={0.5} max={sMax} step={0.5} onChange={setS} unit=" m" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Read k="Q (one well)" v={`${nf(Q1, 0)} m³/d`} sub={`${nf(Q1 / 86.4, 1)} L/s`} />
            <Read k="s at the well" v={`${sw.toFixed(2)} m`} sub={two ? 'both pumping' : 'one well'} />
            <Read k="Specific capacity" v={`${nf(Q1 / sEff, 0)} m³/d/m`} sub="Q per metre of drawdown" />
            <Read k={kind === 'confined' ? 'Transmissivity T = K b' : 'K'} v={kind === 'confined' ? `${nf(K * thick, 0)} m²/d` : `${K} m/d`} sub={kind === 'confined' ? (K * thick / 86400 > 0.015 ? 'T above 0.015 m²/s: a good aquifer' : 'T below 0.015 m²/s') : ''} />
          </div>
        </div>
      </Section>

      <Section title="A second well" sub="Wells close together share the same cone: the drawdowns add (superposition) and each yields less.">
        <div className="space-y-3">
          <label className="text-sm inline-flex items-center gap-2">
            <input type="checkbox" checked={two} onChange={(e) => setTwo(e.target.checked)} /> add a second, identical well
          </label>
          {two && (
            <>
              <Slider label="Spacing a" value={a} min={5} max={Math.min(400, R - 5)} step={5} onChange={setA} unit=" m" />
              <Seg value={mode} onChange={setMode} items={[{ v: 'sameQ', label: 'Same Q each (drawdown rises)' }, { v: 'sameS', label: 'Same drawdown each (Q falls)' }]} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Read k="Q each" v={`${nf(Qeach, 0)} m³/d`} sub={`${((Qeach / Q1) * 100).toFixed(0)} % of a single well`} />
                <Read k="Q total" v={`${nf(2 * Qeach, 0)} m³/d`} sub={`${((2 * Qeach / Q1) * 100).toFixed(0)} % of one well`} />
                <Read k="s at each well" v={`${sw.toFixed(2)} m`} sub={mode === 'sameS' ? 'held at your s' : `was ${sEff.toFixed(2)} m alone`} />
                <Read k="s midway" v={`${sMid.toFixed(2)} m`} sub="cones overlap here" />
              </div>
              <p className="text-xs text-faint">
                {kind === 'confined' ? tx`Same drawdown: Q = 2πKb s / ln(R²/(r a)). ` : tx`Same drawdown: Q = πK(D² − d²) / ln(R²/(r a)) (π, not the 2π printed on the slide). `}
                The ln(R/r) of a lone well becomes ln(R²/ra): spacing a raises the denominator.
              </p>
            </>
          )}
        </div>
      </Section>

      <div className="card p-4 space-y-2">
        <div className="font-bold">Drawdown against distance (one well)</div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <LineChart series={[{ id: 's', label: 's(r)', color: 'var(--c-accent)', pts: cur.map((c) => [c.r, c.s] as [number, number]) }]} xLabel="distance from the well r (m)" yLabel="drawdown (m)" yMin={0} fmtY={(v) => String(+v.toFixed(2))} />
        </div>
        <p className="text-sm text-mute">
          At 10 m from the well the drawdown is already only {sAt(10).toFixed(2)} m of the {sEff.toFixed(2)} m at the well, and at 50 m {sAt(50).toFixed(2)} m: the cone is a steep spike in a log distance, which is why observation wells must be well away from the pumped one.
        </p>
      </div>

      <Callout kind="tip" title="Notice that…">
        Double K and the same Q needs only half the drawdown; double R and Q barely changes, because R sits inside a logarithm (ln 300/0.15 = 7.6, ln 600/0.15 = 8.3). Switch to unconfined and raise s: Q is not proportional to s any more because of the (D² − d²) term, and the unconfined cone is steeper near the well. In the two-well view, with the same Q the drawdown at each well rises by the other well's contribution; holding the drawdown, each well gives less.
      </Callout>

      <Problems />
    </div>
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

// ================================================================ problems
type Fam = 'q' | 'k' | 'obs' | 'interf' | 'vol'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'q', label: 'Find Q' },
  { v: 'k', label: 'Find K' },
  { v: 'obs', label: 'Observation wells' },
  { v: 'interf', label: 'Interference' },
  { v: 'vol', label: 'Storage volume' },
]
interface GP extends XProblem<Fam> {
  d: Record<string, number>
  conf?: boolean
}

function make(seed: number, family?: Fam, level: Level = 'exam'): GP {
  const r = rng(seed * 7919 + 11)
  const fam = family ?? pick(r, ['q', 'k', 'obs', 'interf', 'interf', 'vol'] as Fam[])
  const diaMm = pick(r, [100, 150, 200, 250, 300, 450])
  const rw = diaMm / 2000
  if (fam === 'q' || fam === 'k') {
    const conf = r() < 0.5
    const K = conf ? randInt(r, 5, 60) / 2 : randInt(r, 10, 90)
    const thick = conf ? randInt(r, 15, 50) : randInt(r, 30, 100)
    const s = conf ? randInt(r, 4, 20) / 2 : randInt(r, 4, 12) / 2
    const R = pick(r, [150, 300, 500, 750, 1000])
    const Q = conf ? thiemQ({ K, b: thick, s, rw, R }) : dupuitQ({ K, D: thick, s, rw, R })
    const Qr = Math.round(Q / 10) * 10
    if (fam === 'q') {
      const steps: XStep[] = [
        { key: 'ln', group: 'Steps', label: 'ln(R/r)', value: Math.log(R / rw), digits: 3, tol: 0.003 },
        ...(conf ? [] : [{ key: 'dd', group: 'Steps', label: 'D² − d²', value: thick * thick - (thick - s) ** 2, unit: 'm²', digits: 1, tol: 0.003 }]),
        { key: 'Q', group: 'Yield', label: 'Q', value: Q, unit: 'm³/day', digits: 0, tol: 0.01 },
        { key: 'sc', group: 'Yield', label: 'Specific capacity', value: Q / s, unit: 'm³/day per m', digits: 0, tol: 0.01 },
      ]
      return {
        family: fam,
        level,
        title: conf ? 'Yield of a confined well (Thiem)' : 'Yield of an unconfined well (Dupuit)',
        text: conf
          ? `A ${diaMm} mm diameter well fully penetrates a confined aquifer ${thick} m thick, $K=${K}$ m/day. The drawdown at the well is ${s} m and the radius of influence ${R} m. Find the discharge and the specific capacity.`
          : `A ${diaMm} mm diameter well is sunk ${thick} m below the static water table in an unconfined aquifer, $K=${K}$ m/day. The drawdown when pumped is ${s} m, the radius of influence ${R} m. Find the discharge and the specific capacity.`,
        hash: hashKey(JSON.stringify([fam, conf, diaMm, K, thick, s, R])),
        steps,
        d: { K, thick, s, R, rw },
        conf,
      }
    }
    const steps: XStep[] = [
      { key: 'Q', group: 'Units', label: 'Q in m³/day', value: Qr * 1.44, unit: 'm³/day', digits: 0, tol: 0.003 },
      { key: 'K', group: 'Result', label: 'K', value: conf ? thiemK({ Q: Qr * 1.44, b: thick, s, rw, R }) : dupuitK({ Q: Qr * 1.44, D: thick, s, rw, R }), unit: 'm/day', digits: 2, tol: 0.012 },
    ]
    return {
      family: fam,
      level,
      title: conf ? 'K of a confined aquifer' : 'K of an unconfined aquifer',
      text: conf
        ? `A ${diaMm} mm well pumping from a ${thick} m thick confined aquifer yields ${Qr} L/min at a drawdown of ${s} m, radius of influence ${R} m. Find the hydraulic conductivity of the aquifer in m/day.`
        : `A ${diaMm} mm well, ${thick} m deep below the water table in an unconfined aquifer, yields ${Qr} L/min at a drawdown of ${s} m; radius of influence ${R} m. Find K in m/day.`,
      hash: hashKey(JSON.stringify([fam, conf, diaMm, Qr, thick, s, R])),
      steps,
      d: { Q: Qr, thick, s, R, rw },
      conf,
    }
  }
  if (fam === 'obs') {
    const K = pick(r, [5e-4, 1e-3, 2e-3, 5e-3])
    const b = randInt(r, 2, 20) / 2 + 1
    const r1 = pick(r, [5, 8, 10, 15])
    const r2 = r1 * pick(r, [4, 5, 6, 8])
    const Q = pick(r, [0.005, 0.01, 0.02, 0.03])
    const s1 = (Q * Math.log(500 / r1)) / (2 * Math.PI * K * b)
    const s2 = (Q * Math.log(500 / r2)) / (2 * Math.PI * K * b)
    const s1r = +s1.toFixed(2)
    const s2r = +s2.toFixed(2)
    const Qa = qObsConfined({ K, b, r1, s1: s1r, r2, s2: s2r })
    const steps: XStep[] = [
      { key: 'ds', group: 'Steps', label: 's₁ − s₂', value: s1r - s2r, unit: 'm', digits: 2, abs: 0.011 },
      { key: 'Q', group: 'Discharge', label: 'Q', value: Qa * 1000, unit: 'L/s', digits: 2, tol: 0.012 },
    ]
    return { family: fam, level, title: 'Q from two observation wells (confined)', text: `A fully penetrating well of diameter ${diaMm} mm pumps a ${b} m thick confined aquifer with $K=${K}$ m/s. At steady state the drawdowns at ${r1} m and ${r2} m from the well are ${s1r} m and ${s2r} m. Find the discharge.`, hash: hashKey(JSON.stringify([fam, K, b, r1, r2, s1r, s2r])), steps, d: { K, b, r1, r2, s1: s1r, s2: s2r } }
  }
  if (fam === 'vol') {
    const Sy = pick(r, [0.08, 0.12, 0.15, 0.2, 0.25])
    const A = randInt(r, 5, 60)
    const dh = randInt(r, 5, 40) / 10
    const V = storageVolume(Sy, A * 1e6, dh)
    const steps: XStep[] = [{ key: 'V', group: 'Result', label: 'Volume lost', value: V / 1e6, unit: '× 10⁶ m³', digits: 3, tol: 0.005 }]
    return { family: fam, level, title: 'Storage volume', text: `An unconfined aquifer with a specific yield of ${Sy} covers ${A} km². The water table falls ${dh} m in the dry season. How much water is lost from storage?`, hash: hashKey(JSON.stringify([fam, Sy, A, dh])), steps, d: { Sy, A, dh } }
  }
  // interference (her slide Ex-3 / the papers' chain)
  const D = randInt(r, 36, 70)
  const s = randInt(r, 6, 20) / 2
  const R = randInt(r, 30, 150)
  const aa = pick(r, [6, 7.5, 8, 10])
  const Q0 = pick(r, [600, 800, 1000, 1500, 2000])
  const dd = D - s
  const K = (Q0 * Math.log(R / rw)) / (Math.PI * (D * D - dd * dd))
  const hh = +Math.sqrt(dd * dd + (Q0 * Math.log(aa / rw)) / (Math.PI * K)).toFixed(2)
  const s2 = s - 0.5
  const c = unconfinedInterferenceChain({ Q: Q0, D, s, rw, a: aa, h: hh, s2 })
  const steps: XStep[] = [
    { key: 'K', group: 'Step 1 — K from the observation well', label: 'K', value: c.K, unit: 'L/min per m²', digits: 3, tol: 0.012 },
    { key: 'R', group: 'Step 2 — radius of influence', label: 'R', value: c.R, unit: 'm', digits: 0, tol: 0.03 },
    { key: 'Qe', group: 'Step 3 — both wells pumping', label: 'Q of each well', value: c.each, unit: 'L/min', digits: 0, tol: 0.015 },
    { key: 'Qt', group: 'Step 3 — both wells pumping', label: 'Q of both', value: c.total, unit: 'L/min', digits: 0, tol: 0.015 },
  ]
  return {
    family: fam,
    level,
    title: 'Two interfering wells (water-table aquifer)',
    text: `A ${diaMm} mm diameter well in a water-table aquifer is pumped at ${Q0} litre/min with a drawdown of ${s} m. The static depth of water in the well is ${D} m. During pumping the depth of water in a similar well, not being pumped, ${aa} m away, is ${hh} m. At what rate could water be pumped from the two wells if both are pumped together with a drawdown of ${s2} m in each well?`,
    hash: hashKey(JSON.stringify([fam, diaMm, Q0, s, D, aa, hh, s2])),
    steps,
    d: { Q: Q0, D, s, rw, a: aa, h: hh, s2 },
  }
}

function Solution({ p }: { p: GP }) {
  const d = p.d
  let md = ''
  if (p.family === 'q') {
    const Q = p.conf ? thiemQ({ K: d.K, b: d.thick, s: d.s, rw: d.rw, R: d.R }) : dupuitQ({ K: d.K, D: d.thick, s: d.s, rw: d.rw, R: d.R })
    md = p.conf
      ? tx`$Q=\dfrac{2\pi Kb\,s}{\ln(R/r)}=\dfrac{2\pi(${d.K})(${d.thick})(${d.s})}{\ln(${d.R}/${d.rw})}=\dfrac{${nf(2 * Math.PI * d.K * d.thick * d.s, 1)}}{${Math.log(d.R / d.rw).toFixed(3)}}=$ **${nf(Q)} m³/day**. Specific capacity $=Q/s=${nf(Q / d.s)}$ m³/day per m.`
      : tx`$d=D-s=${d.thick - d.s}$ m. $Q=\dfrac{\pi K(D^2-d^2)}{\ln(R/r)}=\dfrac{\pi(${d.K})(${d.thick}^2-${d.thick - d.s}^2)}{\ln(${d.R}/${d.rw})}=\dfrac{${nf(Math.PI * d.K * (d.thick ** 2 - (d.thick - d.s) ** 2), 1)}}{${Math.log(d.R / d.rw).toFixed(3)}}=$ **${nf(Q)} m³/day**. Specific capacity $=Q/s=${nf(Q / d.s)}$ m³/day per m.`
  } else if (p.family === 'k') {
    const Q = d.Q * 1.44
    const K = p.conf ? thiemK({ Q, b: d.thick, s: d.s, rw: d.rw, R: d.R }) : dupuitK({ Q, D: d.thick, s: d.s, rw: d.rw, R: d.R })
    md = tx`$Q=${d.Q}\times1.44=${nf(Q, 1)}$ m³/day (1 L/min = 1.44 m³/day). ${p.conf ? tx`$K=\dfrac{Q\ln(R/r)}{2\pi b\,s}=\dfrac{${nf(Q, 1)}\ln(${d.R}/${d.rw})}{2\pi(${d.thick})(${d.s})}$` : tx`$K=\dfrac{Q\ln(R/r)}{\pi(D^2-d^2)}=\dfrac{${nf(Q, 1)}\ln(${d.R}/${d.rw})}{\pi(${d.thick}^2-${d.thick - d.s}^2)}$`} = **${K.toFixed(2)} m/day**.`
  } else if (p.family === 'obs') {
    const Q = qObsConfined({ K: d.K, b: d.b, r1: d.r1, s1: d.s1, r2: d.r2, s2: d.s2 })
    md = tx`Thiem between the two observation wells: $Q=\dfrac{2\pi Kb(s_1-s_2)}{\ln(r_2/r_1)}=\dfrac{2\pi(${d.K})(${d.b})(${d.s1}-${d.s2})}{\ln(${d.r2}/${d.r1})}=$ **${(Q * 1000).toFixed(2)} L/s** (${Q.toFixed(5)} m³/s). The well diameter is not needed.`
  } else if (p.family === 'vol') {
    md = tx`$V=S_y\,A\,\Delta h=${d.Sy}\times${d.A}\times10^6\times${d.dh}=$ **${(storageVolume(d.Sy, d.A * 1e6, d.dh) / 1e6).toFixed(3)}$\times10^6$ m³**.`
  } else {
    const c = unconfinedInterferenceChain({ Q: d.Q, D: d.D, s: d.s, rw: d.rw, a: d.a, h: d.h, s2: d.s2 })
    md = [
      tx`1. $d=${d.D}-${d.s}=${c.d}$ m. $K=\dfrac{Q\ln(r_2/r_1)}{\pi(h_2^2-h_1^2)}=\dfrac{${d.Q}\ln(${d.a}/${d.rw})}{\pi(${d.h}^2-${c.d}^2)}=$ **${c.K.toFixed(3)}** L/min per m².`,
      tx`2. $\ln(R/r)=\pi K(D^2-d^2)/Q=${c.lnRr.toFixed(3)}$ → $R=$ **${nf(c.R)} m**.`,
      tx`3. $Q_1=Q_2=\dfrac{\pi K(D^2-d_2^2)}{\ln(R^2/ra)}=\dfrac{${nf(c.num, 1)}}{${c.lnTerm.toFixed(3)}}=$ **${nf(c.each, 1)} L/min**, both together **${nf(c.total, 1)} L/min**.`,
    ].join('\n\n')
  }
  return (
    <div className="space-y-2">
      <Md className="text-sm">{md}</Md>
      {p.family === 'interf' && <InterfFig d={p.d} />}
    </div>
  )
}

function InterfFig({ d }: { d: Record<string, number> }) {
  const c = unconfinedInterferenceChain({ Q: d.Q, D: d.D, s: d.s, rw: d.rw, a: d.a, h: d.h, s2: d.s2 })
  const aq: Aquifer = { kind: 'unconfined', K: c.K, thick: d.D, rw: d.rw, R: c.R }
  return (
    <div className="rounded-xl border border-line bg-panel2/40 p-2">
      <GwSection aq={aq} wells={[{ x: 0, Q: c.each }, { x: d.a, Q: c.each }]} xr={[-Math.min(c.R, 6 * d.a), d.a + Math.min(c.R, 6 * d.a)]} />
    </div>
  )
}

function Problems() {
  return <ExamProblems<Fam, GP> topic="ev-gw:lab" families={FAMS} make={make} solution={(p) => <Solution p={p} />} initialSeed={9} />
}

void kObsUnconfined
