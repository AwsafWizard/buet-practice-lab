// Pump & pipeline lab: the energy line as you change the pipeline, the pump curve against the system curve (throttle, speed,
// parallel / series, NPSH), then exam-style problems in the shapes of the CE 331 papers.
import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Step } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { Card, Slider, pick, randInt, rng, useSeed } from '../../labs/common'
import {
  GAL_FT3, G_SI, design, effCurve, frictionHead, headFromKPa, npshAvailable, operatingPoint, parallel, pipeFromDiameter, powerSI, quadPump, series, systemCurve, totalHead, velocityHead,
  type Curve,
} from '../engine/pump'
import { LineChart } from '../figs/pump-chart'
import { PumpProfile } from '../figs/pump-profile'
import { PumpWork, Sheet, T, npshBudget, sg, solvePump, type PCase } from '../figs/pump-work'

const tx = String.raw

// ===================================================================== A. the pipeline
function Pipeline() {
  const [hs, setHs] = useState(40)
  const [pumpAbove, setPumpAbove] = useState(-2)
  const [L, setL] = useState(1200)
  const [Qls, setQls] = useState(150)
  const [mode, setMode] = useState<'d' | 'v'>('v')
  const [dmm, setDmm] = useState(350)
  const [v, setV] = useState(1.6)
  const [f, setF] = useState(0.015)
  const [eta, setEta] = useState(70)
  const Q = Qls / 1000
  const des = design({ system: 'si', Q, d: mode === 'd' ? dmm / 1000 : undefined, v: mode === 'v' ? v : undefined, f, L, hs })
  const pw = powerSI(Q, des.H, eta / 100)
  const share = (x: number) => (des.H > 0 ? (x / des.H) * 100 : 0)
  return (
    <Section title="1 · The pumping main and its energy line" sub="Change a number and watch the pump's job change: it must lift the water (hs), push it through the pipe (hf) and give it its speed (hv).">
      <div className="grid gap-4 cq-lg:grid-cols-2">
        <div className="space-y-2.5">
          <Slider label="Static lift hs (water level to water level)" value={hs} min={5} max={90} onChange={setHs} unit=" m" />
          <Slider label="Pump axis above (+) / below (−) the source water" value={pumpAbove} min={-6} max={4} onChange={setPumpAbove} unit=" m" />
          <Slider label="Pipe length L" value={L} min={100} max={4000} step={50} onChange={setL} unit=" m" />
          <Slider label="Discharge Q" value={Qls} min={20} max={500} step={10} onChange={setQls} unit=" L/s" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">Pipe given by</span>
            <Seg size="xs" value={mode} onChange={setMode} items={[{ v: 'v', label: 'velocity' }, { v: 'd', label: 'diameter' }]} />
          </div>
          {mode === 'v' ? <Slider label="Velocity v" value={v} min={0.5} max={4} step={0.1} onChange={setV} unit=" m/s" /> : <Slider label="Diameter d" value={dmm} min={100} max={800} step={10} onChange={setDmm} unit=" mm" />}
          <Slider label="Friction factor f (Darcy, used as given)" value={f} min={0.005} max={0.03} step={0.001} onChange={setF} />
          <Slider label="Pump efficiency η" value={eta} min={40} max={90} onChange={setEta} unit=" %" />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-line p-2 bg-panel2/30">
            <PumpProfile unit="m" sourceWL={0} sourceBottom={-5} pumpCL={pumpAbove} deliveryWL={hs} tankBase={hs - Math.max(2, hs * 0.12)} ground={-1} hf={des.hf} hv={des.hv} flow sourceName="wet well / source" />
          </div>
          <div className="rounded-xl border border-line p-3">
            <div className="grid grid-cols-2 gap-x-6 text-sm">
              <div>
                <Row k="Pipe diameter" v={`${fmt(des.pipe.d * 1000, 0)} mm`} />
                <Row k="Velocity v" v={`${fmt(des.pipe.v, 2)} m/s`} />
                <Row k="Static head hs" v={`${fmt(hs, 1)} m`} />
                <Row k="Friction head hf" v={`${fmt(des.hf, 2)} m`} />
                <Row k="Velocity head hv" v={`${fmt(des.hv, 2)} m`} />
              </div>
              <div>
                <Row k="Total head H" v={`${fmt(des.H, 2)} m`} bold />
                <Row k="Water power γQH" v={`${fmt(pw.waterKW, 1)} kW`} />
                <Row k="Input power (÷ η)" v={`${fmt(pw.inputKW, 1)} kW`} bold />
                <Row k="" v={`${fmt(pw.inputHp, 0)} hp`} />
                <Row k="Suction" v={pumpAbove < 0 ? 'flooded' : 'lift'} />
              </div>
            </div>
            <div className="mt-2 flex h-4 w-full overflow-hidden rounded" title="share of the total head">
              <div style={{ width: share(hs) + '%', background: 'var(--c-good)' }} />
              <div style={{ width: share(des.hf) + '%', background: 'var(--c-accent2)' }} />
              <div style={{ width: share(des.hv) + '%', background: 'var(--c-load)' }} />
            </div>
            <div className="flex gap-3 text-[11px] text-mute mt-1">
              <span style={{ color: 'var(--c-good)' }}>■ static {fmt(share(hs), 0)} %</span>
              <span style={{ color: 'var(--c-accent2)' }}>■ friction {fmt(share(des.hf), 0)} %</span>
              <span style={{ color: 'var(--c-load)' }}>■ velocity {fmt(share(des.hv), 0)} %</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 cq-lg:grid-cols-2 mt-3">
        <Callout kind="tip" title="Notice 1">
          Keep Q and switch to “diameter”: halve d and the velocity quadruples while hf grows about 32 times (hf ∝ v²/d ∝ 1/d⁵). That is why the paper tells you the velocity: it fixes the pipe.
        </Callout>
        <Callout kind="tip" title="Notice 2">
          Slide the pump axis below the water: only the sketch changes. The static head is always <b>discharge level − source water level</b>; the pump's own height just decides flooded or lift suction (matters for NPSH).
        </Callout>
        <Callout kind="trap" title="Common trap">
          Water power is γQH, input power is water power ÷ η. A 70 % pump takes 1.43 × the water power from the motor; and if a motor efficiency is given, divide again.
        </Callout>
        <Callout kind="note" title="Her convention">
          hf = f L v²/2gd with f used directly (no 4); H = hs + hf + v²/2g (+ ΣK v²/2g when fittings are listed).
        </Callout>
      </div>
    </Section>
  )
}
const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className="flex items-baseline justify-between gap-2 py-0.5">
    <span className="text-mute">{k}</span>
    <span className={'num ' + (bold ? 'font-bold' : 'font-semibold')}>{v}</span>
  </div>
)

// ===================================================================== B. pump curve vs system curve
const TEMPS = [
  { v: '20', label: '20 °C', hvp: headFromKPa(2.34) },
  { v: '40', label: '40 °C', hvp: headFromKPa(7.38) },
  { v: '60', label: '60 °C', hvp: headFromKPa(19.9) },
]
function Curves() {
  const [H0, setH0] = useState(60)
  const [N, setN] = useState(100)
  const [hs, setHs] = useState(30)
  const [Hf100, setHf100] = useState(8)
  const [valve, setValve] = useState(0)
  const [cfg, setCfg] = useState<'one' | 'par' | 'ser'>('one')
  const [Hsuc, setHsuc] = useState(-2)
  const [temp, setTemp] = useState('20')
  const n = N / 100
  const Qr = 0.2
  const base: Curve = (Q) => n * n * quadPump(H0, Qr)(Q / n)
  const curve: Curve = cfg === 'par' ? parallel(base) : cfg === 'ser' ? series(base) : base
  const kSys = (Hf100 + valve) / 0.01
  const sys = systemCurve(hs, kSys)
  const Qmax = cfg === 'par' ? 2 * n * Qr : n * Qr
  const op = operatingPoint(curve, sys, 0, Qmax)
  const etaBase = effCurve(0.8, 0.55 * n * Qr)
  const perPump = (Q: number) => (cfg === 'par' ? Q / 2 : Q)
  const etaAt = (Q: number) => etaBase(perPump(Q))
  const hvp = TEMPS.find((t) => t.v === temp)!.hvp
  const Habs = headFromKPa(101.3)
  const npshA = (Q: number) => npshAvailable({ Habs, Hs: Hsuc, hL: 150 * Q * Q, Hvp: hvp })
  const npshR = (Q: number) => (2 + 120 * perPump(Q) ** 2) * n * n
  const grid = Array.from({ length: 81 }, (_, i) => (i / 80) * 0.45)
  const ymax = Math.ceil((cfg === 'ser' ? 2 : 1) * H0 * 1.08 / 10) * 10 + 10
  const eta = op ? etaAt(op.Q) : 0
  const Pin = op && eta > 0 ? (G_SI * op.Q * op.H) / eta : 0
  const wasted = op ? (G_SI * op.Q * ((valve / 0.01) * op.Q * op.Q)) : 0
  const margin = op ? npshA(op.Q) - npshR(op.Q) : 0
  const state = !op ? 'none' : margin < 0 ? 'bad' : margin < 1 ? 'warn' : 'ok'
  const bepQ = 0.55 * n * Qr * (cfg === 'par' ? 2 : 1)
  return (
    <Section title="2 · Pump curve against system curve" sub="The pump runs where its head–discharge curve crosses the system curve. Throttle it, change the lift, slow it down, add a second pump, and see where it settles.">
      <div className="grid gap-4 cq-lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">Duty</span>
            <Seg size="xs" value={cfg} onChange={setCfg} items={[{ v: 'one', label: 'one pump' }, { v: 'par', label: '2 in parallel' }, { v: 'ser', label: '2 in series' }]} />
          </div>
          <Slider label="Shut-off head H₀" value={H0} min={30} max={90} step={5} onChange={setH0} unit=" m" />
          <Slider label="Pump speed (impeller trim)" value={N} min={60} max={110} onChange={setN} unit=" %" />
          <Slider label="Static lift hs" value={hs} min={0} max={70} onChange={setHs} unit=" m" />
          <Slider label="Pipe friction at 100 L/s" value={Hf100} min={1} max={30} onChange={setHf100} unit=" m" />
          <Slider label="Throttle valve loss at 100 L/s" value={valve} min={0} max={60} onChange={setValve} unit=" m" />
          <div className="border-t border-line pt-2 text-xs font-bold uppercase tracking-wider text-faint">Suction side (NPSH)</div>
          <Slider label="Suction head Hs (+ flooded, − lift)" value={Hsuc} min={-8} max={4} step={0.5} onChange={setHsuc} unit=" m" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-mute">Water at</span>
            <Seg size="xs" value={temp} onChange={setTemp} items={TEMPS.map((t) => ({ v: t.v, label: t.label }))} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-xl border border-line p-2">
            <LineChart
              series={[
                { pts: grid.map((q) => [q, curve(q)] as [number, number]).filter(([q, h]) => q <= Qmax * 1.02 && h >= 0), color: 'var(--c-accent)', label: 'pump H–Q' },
                { pts: grid.map((q) => [q, sys(q)] as [number, number]).filter(([, h]) => h <= ymax), color: 'var(--c-bad)', label: 'system curve' },
                { pts: grid.filter((q) => q <= Qmax * 1.02).map((q) => [q, 100 * etaAt(q)] as [number, number]), color: 'var(--c-good)', label: 'efficiency (right axis)', dash: '5 4', right: true },
              ]}
              xmax={0.45}
              ymax={ymax}
              y2max={100}
              xlabel="discharge Q (m³/s)"
              ylabel="head (m)"
              y2label="efficiency (%)"
              vlines={[{ x: Math.min(0.44, bepQ), label: 'BEP', color: 'var(--c-good)' }]}
              hlines={[{ y: hs, label: 'static lift', color: 'var(--c-faint)' }]}
              marks={op ? [{ x: op.Q, y: op.H, label: `Q ${fmt(op.Q * 1000, 0)} L/s, H ${fmt(op.H, 1)} m`, color: 'var(--c-load)', dx: 8, dy: -10 }] : []}
            />
          </div>
          <div className="rounded-xl border border-line p-3 grid grid-cols-2 gap-x-6 text-sm">
            {op ? (
              <>
                <div>
                  <Row k="Operating discharge" v={`${fmt(op.Q * 1000, 1)} L/s`} bold />
                  <Row k="Operating head" v={`${fmt(op.H, 1)} m`} bold />
                  <Row k="Pump efficiency" v={`${fmt(eta * 100, 0)} %`} />
                </div>
                <div>
                  <Row k="Input power" v={`${fmt(Pin, 1)} kW`} />
                  <Row k="Burned in the valve" v={`${fmt(wasted, 1)} kW`} />
                  <Row k="Head given / lift" v={`${fmt(op.H, 1)} / ${fmt(hs, 0)} m`} />
                </div>
              </>
            ) : (
              <div className="col-span-2 text-bad font-semibold">The static lift is above the shut-off head: no flow. Raise H₀ or the speed, or lower hs.</div>
            )}
          </div>
          <div className="grid gap-2 cq-lg:grid-cols-[1.4fr_1fr] items-start">
            <div className="rounded-xl border border-line p-2">
              <LineChart
                height={200}
                series={[
                  { pts: grid.filter((q) => q <= Qmax * 1.02).map((q) => [q, Math.max(0, npshA(q))] as [number, number]), color: 'var(--c-water)', label: 'NPSH available' },
                  { pts: grid.filter((q) => q <= Qmax * 1.02).map((q) => [q, npshR(q)] as [number, number]), color: 'var(--c-bad)', label: 'NPSH required (pump)', dash: '5 4' },
                ]}
                xmax={0.45}
                ymax={14}
                xlabel="discharge Q (m³/s)"
                ylabel="NPSH (m)"
                marks={op ? [{ x: op.Q, y: npshA(op.Q), color: 'var(--c-load)' }] : []}
              />
            </div>
            <div
              className="rounded-xl p-3 text-sm"
              style={{ background: `color-mix(in oklab, ${state === 'ok' ? 'var(--c-good)' : state === 'warn' ? 'var(--c-load)' : 'var(--c-bad)'} 12%, transparent)`, border: `1px solid ${state === 'ok' ? 'var(--c-good)' : state === 'warn' ? 'var(--c-load)' : 'var(--c-bad)'}` }}
            >
              <div className="font-bold">{state === 'ok' ? 'No cavitation' : state === 'warn' ? 'Too close to cavitation' : state === 'bad' ? 'Cavitation!' : '—'}</div>
              {op && (
                <div className="text-xs mt-1">
                  NPSH available {fmt(npshA(op.Q), 1)} m, required {fmt(npshR(op.Q), 1)} m: margin {fmt(margin, 1)} m. Her slide wants NPSHav at least 1 m above NPSHreq.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 cq-lg:grid-cols-2 mt-3">
        <Callout kind="tip" title="Notice 3 (oversizing, RM L8 p31)">
          Raise the throttle valve loss: the operating point climbs the pump curve to the left, the flow falls, but the pump still lifts head that the valve then burns. Efficiency drops away from the BEP. Cheaper fixes: slow the pump (speed 60–100 %) or trim the impeller.
        </Callout>
        <Callout kind="tip" title="Notice 4 (combinations, p46-47)">
          Two in parallel: the flow is less than double, because the larger flow loses more head in the same pipe. Two in series: the head is less than double for the same reason; series pays when the static lift is high.
        </Callout>
        <Callout kind="tip" title="Notice 5 (NPSH)">
          Move the pump above the water (Hs more negative) or heat the water: NPSH available falls. When it falls below what the pump needs, bubbles form and collapse on the impeller. Remedies on the slide: raise the well level, lower the pump, bigger suction pipe, other pump.
        </Callout>
        <Callout kind="note" title="Reading the paper (2012-13 Q1(b))">
          The question gives tables, not equations: draw H–Q for one pump, H(Q/2) for two in parallel, 2H(Q) for two in series, then mark where each meets the system curve at the minimum and maximum reservoir level (system curve +2 m).
        </Callout>
      </div>
    </Section>
  )
}

// ===================================================================== C. problems
type PType = 'si' | 'fps' | 'well' | 'npsh'

function useProblem(type: PType, seed: number) {
  return useMemo(() => {
    const r = rng(seed * 131 + (type === 'si' ? 1 : type === 'fps' ? 2 : type === 'well' ? 3 : 4))
    if (type === 'si') return genSI(r)
    if (type === 'fps') return genFPS(r)
    if (type === 'well') return genWell(r)
    return genNpsh(r)
  }, [type, seed])
}

interface Gen {
  text: string
  c?: PCase
  key: string
  checks: { id: string; label: string; value: number; unit: string; tol?: number }[]
  extra?: { npsh: ReturnType<typeof npshData> }
}

function genSI(r: () => number): Gen {
  const vol = pick(r, [4000, 5000, 6000, 8000, 10000, 12000, 15000])
  const hours = pick(r, [6, 8, 10, 12])
  const rlTp = randInt(r, 100, 220, 10)
  const drop = pick(r, [3, 5, 6])
  const rlTank = rlTp + randInt(r, 25, 70, 5)
  const L = randInt(r, 300, 1500, 100)
  const f = pick(r, [0.008, 0.01, 0.012, 0.015])
  const fps = r() < 0.5
  const vv = fps ? pick(r, [6, 8, 10]) : pick(r, [1.5, 2, 2.5, 3])
  const vSI = fps ? vv * 0.3048 : vv
  const eta = pick(r, [0.65, 0.7, 0.75, 0.8])
  const Q = vol / (hours * 3600)
  const hs = rlTank - rlTp
  const c: PCase = {
    sys: 'si', Q, v: vSI, f, L, hs, eta, power: 'si',
    given: [`${vol} m³ of water a day pumped in ${hours} h a day, from a treatment plant (RL ${rlTp} m) through a pump station (RL ${rlTp - drop} m) to an elevated tank (RL ${rlTank} m)`, `Total pipe length ${L} m; f = ${f}; velocity ${fps ? vv + ' ft/s (= ' + sg(vSI, 4) + ' m/s)' : vv + ' m/s'}; pump efficiency ${eta * 100} %`],
    assume: ['The treatment-plant level is the water level the pump draws from; the pump sits below it (flooded suction)', 'Velocity head included, minor losses neglected'],
    qTex: [tx`Q = \frac{${vol}\text{ m}^3}{${hours} \times 3600\text{ s}} = ${sg(Q, 4)}\text{ m}^3/\text{s}\;(${sg(Q * 1000, 4)}\text{ L/s})`],
    hsTex: [tx`h_s = ${rlTank} - ${rlTp} = ${hs}\text{ m}`],
    fig: { sourceWL: rlTp, sourceBottom: rlTp - 4, pumpCL: rlTp - drop, deliveryWL: rlTank, tankBase: rlTank - 4, sourceName: 'treatment plant', tankName: 'elevated tank' },
  }
  const s = solvePump(c)
  return {
    key: JSON.stringify([vol, hours, rlTp, rlTank, L, f, vv, fps, eta]),
    text: `Determine the capacity of a pump to supply water from a treatment plant to an elevated tank. Volume pumped per day ${vol} m³, pumping hours ${hours} h daily, RL of treatment plant ${rlTp} m, RL of pump station ${rlTp - drop} m, RL of elevated tank ${rlTank} m, total length of pipe ${L} m, friction factor ${f}, velocity of water ${vv} ${fps ? 'ft/s' : 'm/s'}, pump efficiency ${eta * 100} %.`,
    c,
    checks: [
      { id: 'Q', label: 'Discharge Q', value: Q, unit: 'm³/s' },
      { id: 'd', label: 'Pipe diameter d', value: s.des.pipe.d * 1000, unit: 'mm' },
      { id: 'hf', label: 'Friction head hf', value: s.des.hf, unit: 'm' },
      { id: 'H', label: 'Total head H', value: s.des.H, unit: 'm' },
      { id: 'P', label: 'Input power', value: s.pw.inputKW, unit: 'kW' },
    ],
  }
}

function genFPS(r: () => number): Gen {
  const gpcd = pick(r, [35, 40, 45, 50, 65])
  const pop = pick(r, [3800, 12000, 25000, 60000, 85000])
  const hours = pick(r, [8, 10, 12])
  const hs = randInt(r, 60, 150, 5)
  const v = pick(r, [6, 8, 10, 12])
  const L = randInt(r, 500, 3500, 100)
  const f = pick(r, [0.0075, 0.01])
  const eta = pick(r, [0.65, 0.7, 0.75])
  const gpd = gpcd * pop
  const gpm = gpd / (hours * 60)
  const Q = (gpm * GAL_FT3) / 60
  const c: PCase = {
    sys: 'fps', Q, gpm, v, f, L, hs, eta, power: 'gpm',
    given: [`${gpcd} gpcd, population ${pop}, pumping ${hours} h a day`, `Static head ${hs} ft; velocity ${v} ft/s; total pipe length ${L} ft; friction factor ${f}; efficiency ${eta * 100} %; minor losses neglected`],
    assume: ['Her slide method for gallons: 1 gal = 0.16 ft³, water hp = H Q(gpm)/3960'],
    qTex: [tx`\text{Demand} = ${gpcd} \times ${pop} = ${sg(gpd, 6)}\text{ gal/day};\quad Q = \frac{${sg(gpd, 6)}}{${hours} \times 60} = ${sg(gpm, 5)}\text{ gpm}`, tx`Q = ${sg(gpm, 5)} \times \frac{0.16}{60} = ${sg(Q, 4)}\text{ ft}^3/\text{s}`],
    hsTex: [tx`h_s = ${hs}\text{ ft (given)}`],
  }
  const s = solvePump(c)
  return {
    key: JSON.stringify([gpcd, pop, hours, hs, v, L, f, eta]),
    text: `Design the pumping unit and the transmission main: water supply rate ${gpcd} gpcd, population ${pop}, pumping time ${hours} hours daily, static head ${hs} ft, velocity through the pipe ${v} fps, length of pipe ${L} ft, friction factor ${f}, efficiency of the pump ${eta * 100} %. Neglect minor losses.`,
    c,
    checks: [
      { id: 'gpm', label: 'Discharge Q', value: gpm, unit: 'gpm' },
      { id: 'd', label: 'Pipe diameter d', value: s.des.pipe.d, unit: 'ft' },
      { id: 'H', label: 'Total head H', value: s.des.H, unit: 'ft' },
      { id: 'P', label: 'Water power', value: s.pw.waterHp, unit: 'hp' },
      { id: 'B', label: 'Input power (BHP)', value: s.pw.inputHp, unit: 'hp' },
    ],
  }
}

function genWell(r: () => number): Gen {
  const vol = pick(r, [300000, 500000, 750000, 1000000])
  const hours = pick(r, [6, 8, 10])
  const wt = randInt(r, 10, 30, 5)
  const dd = randInt(r, 2, 8, 1)
  const th = randInt(r, 15, 40, 5)
  const dw = pick(r, [3, 4, 5])
  const dist = randInt(r, 30, 120, 10)
  const dia = pick(r, [150, 200, 250])
  const eta = pick(r, [0.6, 0.65, 0.7, 0.75])
  const f = 0.01
  const Q = vol / 1000 / (hours * 3600)
  const hs = wt + dd + th + dw
  const L = dist + wt + dd + th
  const c: PCase = {
    sys: 'si', Q, d: dia / 1000, f, L, hs, eta, power: 'si',
    given: [`Daily water demand ${vol.toLocaleString('en')} litres, daily pumping hours ${hours}`, `Water table ${wt} m below ground level, maximum depression on pumping level ${dd} m; height of the tank above GL ${th} m, maximum depth of water in the tank ${dw} m; distance between pump station and tank ${dist} m`, `Diameter of discharge and suction pipe ${dia} mm; pump efficiency ${eta * 100} %; Darcy friction, f = ${f}`],
    assume: [`Pipe length = ${dist} m horizontal + the vertical run (${wt + dd} + ${th} m)`, 'Velocity head included; minor losses neglected'],
    qTex: [tx`Q = \frac{${sg(vol, 7)}}{${hours} \times 3600 \times 1000} = ${sg(Q, 4)}\text{ m}^3/\text{s}`],
    hsTex: [tx`\text{pumping level} = ${wt} + ${dd} = ${wt + dd}\text{ m below GL}`, tx`\text{tank water surface} = ${th} + ${dw} = ${th + dw}\text{ m above GL}`, tx`h_s = ${wt + dd} + ${th + dw} = ${hs}\text{ m}`],
    lTex: [tx`L = ${dist} + ${wt + dd} + ${th} = ${L}\text{ m}`],
    fig: { ground: wt + dd, sourceWL: 0, sourceBottom: -3, pumpCL: 0.5, deliveryWL: hs, tankBase: hs - dw, sourceName: 'pumping level', tankName: 'elevated tank' },
  }
  const s = solvePump(c)
  return {
    key: JSON.stringify([vol, hours, wt, dd, th, dw, dist, dia, eta]),
    text: `A submersible pump has to be installed to withdraw and supply water to an elevated water tank. Determine the pump capacity: daily water demand ${vol.toLocaleString('en')} litres; daily pumping hours ${hours}; water table below ground level ${wt} m; maximum depression on pumping level ${dd} m; height of water tank above GL ${th} m; maximum depth of water in the tank ${dw} m; distance between pump station and tank ${dist} m; diameter of discharge and suction pipe ${dia} mm; pump efficiency ${eta * 100} %. (Use Darcy's equation, f = ${f}.)`,
    c,
    checks: [
      { id: 'Q', label: 'Discharge Q', value: Q * 1000, unit: 'L/s' },
      { id: 'hs', label: 'Static head hs', value: hs, unit: 'm' },
      { id: 'H', label: 'Total head H', value: s.des.H, unit: 'm' },
      { id: 'P', label: 'Input power', value: s.pw.inputKW, unit: 'kW' },
    ],
  }
}

function npshData(p: { Q: number; d: number; wet: number; pump: number; disch: number; L: number; Ls: number; f: number; sumK: number; Ksuc: number; vp: number; npshR: number }) {
  const pipe = pipeFromDiameter(p.Q, p.d)
  const h = totalHead({ hs: p.disch - p.wet, f: p.f, L: p.L, v: pipe.v, d: p.d, g: G_SI, sumK: p.sumK })
  const hv = velocityHead(pipe.v, G_SI)
  const hLs = frictionHead(p.f, p.Ls, pipe.v, p.d, G_SI) + p.Ksuc * hv
  const Habs = headFromKPa(101.3)
  const Hvp = headFromKPa(p.vp)
  const Hs = p.wet - p.pump
  const npsh = npshAvailable({ Habs, Hs, hL: hLs, Hvp })
  const pw = powerSI(p.Q, h.H, 1)
  return { pipe, h, hv, hLs, Habs, Hvp, Hs, npsh, pw, margin: npsh - p.npshR }
}
function genNpsh(r: () => number): Gen {
  const p = {
    Q: pick(r, [0.1, 0.15, 0.2, 0.25]),
    d: pick(r, [0.2, 0.25, 0.3]),
    wet: 38,
    pump: 38 + pick(r, [1, 2, 3, 4, 5]),
    disch: 38 + pick(r, [18, 22, 26, 30]),
    L: pick(r, [30, 40, 60]),
    Ls: pick(r, [3, 5, 8]),
    f: pick(r, [0.018, 0.022, 0.025]),
    sumK: pick(r, [1.0, 1.04, 1.5]),
    Ksuc: 0.04,
    vp: pick(r, [2.3, 4.2, 7.4]),
    npshR: pick(r, [3, 4, 5, 6]),
  }
  const d = npshData(p)
  return {
    key: JSON.stringify(p),
    text: `A pump delivers water at ${p.vp === 2.3 ? '20' : p.vp === 4.2 ? '30' : '40'} °C at ${fmt(p.Q, 2)} m³/s through a ${p.d * 100} cm steel pipe. Wet-well water level ${p.wet} m above m.s.l., pump at ${p.pump} m, discharge level ${p.disch} m. Total pipe length ${p.L} m, of which ${p.Ls} m with the entrance bell (K = ${p.Ksuc}) is on the suction side; ΣK of all fittings = ${p.sumK}; f = ${p.f}. γ = 9.81 kN/m³; vapour pressure ${p.vp} kPa; atmospheric pressure 101.3 kPa. The pump needs NPSH(required) = ${p.npshR} m. Find the power supplied to the flow and the NPSH available, and say whether the installation is safe.`,
    checks: [
      { id: 'H', label: 'Total head H', value: d.h.H, unit: 'm' },
      { id: 'P', label: 'Power γQH', value: d.pw.waterKW, unit: 'kW' },
      { id: 'hL', label: 'Suction loss hL', value: d.hLs, unit: 'm' },
      { id: 'N', label: 'NPSH available', value: d.npsh, unit: 'm' },
    ],
    extra: { npsh: d },
    // kept for the reveal
    c: undefined,
    ...{ p },
  } as Gen & { p: typeof p }
}

const TYPES: { v: PType; label: string; hint: string }[] = [
  { v: 'si', label: 'Treatment plant to tank', hint: '2022-23 Q1(b), 2007-08 Q2(b), 2008-09 Q7(c)' },
  { v: 'fps', label: 'gpcd, ft and hp', hint: '2016-17 Q7(c), 2023-24 Q8(b), RM Example 2' },
  { v: 'well', label: 'Submersible from a well', hint: '2020-21 Q4(b), 2021-22 Q1(c), Jan 2021 Q6(b)' },
  { v: 'npsh', label: 'Power and NPSH', hint: '2012-13 Q3(b)' },
]

function Problems() {
  const [type, setType] = useState<PType>('si')
  const { seed, next } = useSeed(3)
  const g = useProblem(type, seed)
  const base = `ev-pump:lab:${hashKey(type + g.key)}`
  const [cav, setCav] = useState(0)
  void cav
  const nd = g.extra?.npsh
  const pAny = g as Gen & { p?: Parameters<typeof npshData>[0] }
  return (
    <Section
      title="3 · Exam-style problems"
      sub="Shaped like the papers. Work it on paper first, check each step, then open the worked solution."
      right={
        <button className="btn" onClick={() => { next(); setCav((x) => x + 1) }}>
          🎲 New numbers
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Seg value={type} onChange={setType} items={TYPES.map((t) => ({ v: t.v, label: t.label }))} />
        <span className="text-xs text-faint">{TYPES.find((t) => t.v === type)!.hint}</span>
      </div>
      <Card>
        <Md>{g.text}</Md>
        <div className="mt-3 space-y-0.5">
          {g.checks.map((c) => (
            <Answer key={base + c.id} id={`${base}:${c.id}`} label={c.label} value={c.value} unit={c.unit} tol={c.tol ?? 0.03} digits={4} />
          ))}
          {nd && (
            <Choice
              id={`${base}:safe`}
              label="Verdict"
              answer={nd.margin >= 1 ? 'safe' : nd.margin >= 0 ? 'warn' : 'cav'}
              options={[
                { v: 'safe', label: 'Safe (margin ≥ 1 m)' },
                { v: 'warn', label: 'Too close' },
                { v: 'cav', label: 'Cavitates' },
              ]}
            />
          )}
        </div>
        <div className="mt-3">
          <Reveal id={base + ':sol'} title="Worked solution">
            {g.c ? <PumpWork c={g.c} /> : nd && pAny.p ? <NpshWork p={pAny.p} /> : null}
          </Reveal>
        </div>
      </Card>
    </Section>
  )
}

function NpshWork({ p }: { p: Parameters<typeof npshData>[0] }) {
  const d = npshData(p)
  return (
    <Sheet
      given={[`Q = ${p.Q} m³/s, d = ${p.d * 100} cm, levels ${p.wet} / ${p.pump} / ${p.disch} m, L = ${p.L} m (suction ${p.Ls} m), f = ${p.f}, ΣK = ${p.sumK}`, `Hvp = ${p.vp} kPa, Habs = 101.3 kPa, γ = 9.81 kN/m³, NPSHreq = ${p.npshR} m`]}
      answer={<>H = {sg(d.h.H, 4)} m; power {sg(d.pw.waterKW, 4)} kW; NPSH available {sg(d.npsh, 3)} m, so the margin over NPSHreq is {sg(d.margin, 3)} m: {d.margin >= 1 ? 'safe' : d.margin >= 0 ? 'too close (less than the 1 m asked for)' : 'the pump will cavitate'}</>}
    >
      <Step n={1} title="Velocity and velocity head">
        <T>{tx`A = \frac{\pi d^2}{4} = \frac{\pi (${p.d})^2}{4} = ${sg(d.pipe.A, 4)}\text{ m}^2,\qquad v = \frac{Q}{A} = \frac{${p.Q}}{${sg(d.pipe.A, 4)}} = ${sg(d.pipe.v, 4)}\text{ m/s}`}</T>
        <T>{tx`\frac{v^2}{2g} = \frac{${sg(d.pipe.v, 4)}^2}{2 \times 9.81} = ${sg(d.hv, 4)}\text{ m}`}</T>
      </Step>
      <Step n={2} title="Total head and power">
        <T>{tx`h_s = ${p.disch} - ${p.wet} = ${p.disch - p.wet}\text{ m}`}</T>
        <T>{tx`h_f = f\frac{L}{d}\frac{v^2}{2g} = ${p.f} \times \frac{${p.L}}{${p.d}} \times ${sg(d.hv, 4)} = ${sg(d.h.hf, 4)}\text{ m},\qquad h_m = \sum K\frac{v^2}{2g} = ${p.sumK} \times ${sg(d.hv, 4)} = ${sg(d.h.hm, 4)}\text{ m}`}</T>
        <T>{tx`H = h_s + \frac{v^2}{2g} + h_f + h_m = ${p.disch - p.wet} + ${sg(d.hv, 4)} + ${sg(d.h.hf, 4)} + ${sg(d.h.hm, 4)} = ${sg(d.h.H, 4)}\text{ m}`}</T>
        <T>{tx`P = \gamma Q H = 9.81 \times ${p.Q} \times ${sg(d.h.H, 4)} = ${sg(d.pw.waterKW, 4)}\text{ kW}`}</T>
      </Step>
      <Step n={3} title="Suction loss and NPSH available">
        <T>{tx`H_{abs} = \frac{101.3}{9.81} = ${sg(d.Habs, 4)}\text{ m},\qquad H_{vp} = \frac{${p.vp}}{9.81} = ${sg(d.Hvp, 3)}\text{ m},\qquad H_S = ${p.wet} - ${p.pump} = ${sg(d.Hs, 3)}\text{ m}`}</T>
        <T>{tx`h_L = f\frac{L_s}{d}\frac{v^2}{2g} + K\frac{v^2}{2g} = ${p.f} \times \frac{${p.Ls}}{${p.d}} \times ${sg(d.hv, 4)} + ${p.Ksuc} \times ${sg(d.hv, 4)} = ${sg(d.hLs, 4)}\text{ m}`}</T>
        <T>{tx`NPSH_{av} = H_{abs} + H_S - h_L - H_{vp} = ${sg(d.Habs, 4)} ${d.Hs < 0 ? '-' : '+'} ${sg(Math.abs(d.Hs), 3)} - ${sg(d.hLs, 3)} - ${sg(d.Hvp, 3)} = ${sg(d.npsh, 4)}\text{ m}`}</T>
        <Md>{npshBudget({ Habs: d.Habs, Hs: d.Hs, hL: d.hLs, Hvp: d.Hvp, npsh: d.npsh })}</Md>
      </Step>
      <Step n={4} title="Safe or not?">
        <T>{tx`\text{margin} = NPSH_{av} - NPSH_{req} = ${sg(d.npsh, 4)} - ${p.npshR} = ${sg(d.margin, 3)}\text{ m}`}</T>
        <div className="text-xs text-mute">Her slide wants NPSH available at least 1 m above what the pump needs; below 0 the water boils at the impeller eye and the pump cavitates.</div>
      </Step>
    </Sheet>
  )
}

export default function PumpLab() {
  return (
    <div className="space-y-2">
      <Pipeline />
      <Curves />
      <Problems />
    </div>
  )
}
