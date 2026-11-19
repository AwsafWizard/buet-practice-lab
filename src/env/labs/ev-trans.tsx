// Water hammer lab: close a valve fast or slow and watch the pressure wave travel and reflect; see what slow closure, a surge
// tank and a relief valve do to the peak. Then numeric problems (Joukowsky, closure time) and the economic overhead tank.
// The numbers are textbook (Rowshan ma'am's L9 gives the phases and the remedies only).
import { useEffect, useMemo, useRef, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Md, Reveal, Section, Seg, Step } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { Card, Slider, pick, randInt, rng, useSeed } from '../../labs/common'
import { G, closureTimeFor, criticalTime, hammerRise, simulate, waveSpeed, type Protection } from '../engine/hammer'
import { economicTank, galToFt3, tankCost } from '../engine/tank'
import { HammerPipe, HammerTrace } from '../figs/pipe-hammer'
import { HammerSketch } from '../figs/rm-hammer-sketch'
import { LineChart } from '../figs/pump-chart'
import { Sheet, T, sg } from '../figs/pump-work'

const tx = String.raw
const MATS = [
  { v: 'steel', label: 'Steel', E: 200e9, tD: 0.02 },
  { v: 'di', label: 'Ductile iron', E: 170e9, tD: 0.025 },
  { v: 'conc', label: 'Concrete', E: 25e9, tD: 0.1 },
  { v: 'pvc', label: 'PVC', E: 3e9, tD: 0.04 },
]
const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className="flex items-baseline justify-between gap-2 py-0.5 text-sm">
    <span className="text-mute">{k}</span>
    <span className={'num ' + (bold ? 'font-bold' : 'font-semibold')}>{v}</span>
  </div>
)

function Hammer() {
  const [mat, setMat] = useState('steel')
  const [L, setL] = useState(1000)
  const [v0, setV0] = useState(2)
  const [H0, setH0] = useState(50)
  const [T, setT] = useState(0.5)
  const [prot, setProt] = useState<'none' | 'relief' | 'tank'>('none')
  const [speed, setSpeed] = useState(1)
  const [playing, setPlaying] = useState(true)
  const [k, setK] = useState(0)
  const m = MATS.find((x) => x.v === mat)!
  const D = 0.5
  const a = waveSpeed({ D, t: D * m.tD, E: m.E })
  const Tc = criticalTime(L, a)
  const tEnd = Math.min(Math.max(8 * Tc, T * 1.5 + 4 * Tc), 120)
  const protect: Protection | undefined = prot === 'relief' ? { reliefSet: H0 * 1.3, reliefSize: 1 } : prot === 'tank' ? { surgeArea: 20 } : undefined
  const sim = useMemo(() => simulate({ L, a, D, v0, H0, T, tEnd, N: 20, protect }), [L, a, v0, H0, T, tEnd, prot])
  const bare = useMemo(() => (prot === 'none' ? undefined : simulate({ L, a, D, v0, H0, T, tEnd, N: 20 })), [L, a, v0, H0, T, tEnd, prot])
  const ref = useRef({ n: sim.t.length, speed })
  ref.current = { n: sim.t.length, speed }
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setK((x) => (x + Math.max(1, Math.round(ref.current.speed))) % ref.current.n), 40)
    return () => clearInterval(id)
  }, [playing])
  useEffect(() => setK(0), [sim])
  const jk = hammerRise({ L, a, dv: v0, T: 1e-9, H0 })
  const th = hammerRise({ L, a, dv: v0, T, H0 })
  return (
    <Section title="1 · A valve closing at the end of a pipe" sub="Stopping the water suddenly turns its momentum into a pressure wave that runs to the reservoir and back every 4L/a.">
      <div className="grid gap-4 cq-lg:grid-cols-[1fr_1.7fr]">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm"><span className="text-mute">Pipe</span><Seg size="xs" value={mat} onChange={setMat} items={MATS.map((x) => ({ v: x.v, label: x.label }))} /></div>
          <Slider label="Length L" value={L} min={200} max={3000} step={100} onChange={setL} unit=" m" />
          <Slider label="Flow velocity v₀" value={v0} min={0.5} max={4} step={0.1} onChange={setV0} unit=" m/s" />
          <Slider label="Steady head at the valve" value={H0} min={20} max={120} step={5} onChange={setH0} unit=" m" />
          <Slider label="Valve closing time T" value={T} min={0.1} max={30} step={0.1} onChange={setT} unit=" s" />
          <div className="flex items-center gap-2 text-sm"><span className="text-mute">Protection</span><Seg size="xs" value={prot} onChange={setProt} items={[{ v: 'none', label: 'none' }, { v: 'relief', label: 'relief valve' }, { v: 'tank', label: 'surge tank' }]} /></div>
          <div className="flex items-center gap-2">
            <button className="btn !py-1 !px-3" onClick={() => setPlaying(!playing)}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
            <button className="btn !py-1 !px-3" onClick={() => setK(0)}>↺ Restart</button>
            <Seg size="xs" value={String(speed)} onChange={(x) => setSpeed(+x)} items={[{ v: '1', label: '1×' }, { v: '2', label: '2×' }, { v: '4', label: '4×' }]} />
          </div>
          <div className="rounded-xl border border-line p-3">
            <Row k="Wave speed a" v={`${fmt(a, 0)} m/s`} />
            <Row k="Critical time 2L/a" v={`${fmt(Tc, 2)} s`} />
            <Row k="Closure" v={T <= Tc ? 'rapid (T ≤ 2L/a)' : `slow (${fmt(T / Tc, 1)} × 2L/a)`} bold />
            <Row k="Joukowsky ρ a Δv" v={`${fmt(jk.dp / 1000, 0)} kPa = ${fmt(jk.dH, 0)} m`} />
            <Row k="Textbook estimate for this T" v={`${fmt(th.dH, 0)} m rise`} />
            <Row k="Simulated peak head" v={`${fmt(sim.Hmax, 0)} m (+${fmt(sim.Hmax - H0, 0)})`} bold />
            <Row k="Lowest head (suction)" v={`${fmt(sim.Hmin, 0)} m`} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-xl border border-line p-2"><HammerPipe sim={sim} k={k} a={a} L={L} showTank={prot === 'tank'} /></div>
          <div className="rounded-xl border border-line p-2"><HammerTrace sim={sim} k={k} T={T} a={a} L={L} compare={bare} /></div>
        </div>
      </div>
      <div className="grid gap-2 cq-lg:grid-cols-2 mt-3">
        <Callout kind="tip" title="Notice 1">Close in 0.1 s: the head at the valve jumps by about a·Δv/g and holds for 2L/a, then the reservoir sends back a relief wave and the pressure oscillates (with friction it dies away). Stretch T past 2L/a and the peak melts away.</Callout>
        <Callout kind="tip" title="Notice 2">Change the pipe to PVC: the wave speed drops from about 1200 to a few hundred m/s, so the same closing time is “slow” and the rise is far smaller. Stiffer pipe, bigger bang.</Callout>
        <Callout kind="tip" title="Notice 3 (remedies on her slide)">A surge tank or air chamber at the valve lets the water keep moving into a cushion; a relief valve dumps the excess; slow closure spreads the deceleration. The grey line is the same closure with nothing fitted.</Callout>
        <Callout kind="note" title="Not on her slides">Her L9 shows the four phases and the remedies only. The Joukowsky rise Δp = ρ a Δv, the wave speed and 2L/a are standard textbook (Peavy, Davis), so quote them as such in the script.</Callout>
      </div>
    </Section>
  )
}

function Tank() {
  const [gal, setGal] = useState(100000)
  const [kind, setKind] = useState<'british' | 'us'>('british')
  const [cf, setCf] = useState(1200)
  const [cw, setCw] = useState(1800)
  const V = galToFt3(gal, kind)
  const t = economicTank(V, cf, cw)
  const pts = Array.from({ length: 61 }, (_, i) => { const D = t.D * (0.5 + (i / 60) * 1.1); return [D, tankCost(V, D, cf, cw).cost / 1000] as [number, number] })
  return (
    <Section title="2 · Economic overhead tank (2020-21 Q2(c))" sub="A cylindrical tank of fixed capacity: a wider tank has a bigger floor, a taller one more wall. The cheapest shape is where the two balance.">
      <div className="grid gap-4 cq-lg:grid-cols-2">
        <div className="space-y-2.5">
          <Slider label="Capacity" value={gal} min={20000} max={400000} step={10000} onChange={setGal} unit=" gal" />
          <div className="flex items-center gap-2 text-sm"><span className="text-mute">Gallon</span><Seg size="xs" value={kind} onChange={setKind} items={[{ v: 'british', label: '0.16 ft³ (hers)' }, { v: 'us', label: 'US 0.1337 ft³' }]} /></div>
          <Slider label="Floor, Tk per sft" value={cf} min={100} max={2000} step={50} onChange={setCf} />
          <Slider label="Wall, Tk per sft" value={cw} min={100} max={3000} step={50} onChange={setCw} />
          <div className="rounded-xl border border-line p-3">
            <Row k="Volume" v={`${fmt(V, 0)} ft³`} />
            <Row k="Diameter D = (8 cw V / π cf)^⅓" v={`${fmt(t.D, 2)} ft`} bold />
            <Row k="Depth H = D cf / 2 cw" v={`${fmt(t.H, 2)} ft`} bold />
            <Row k="Cost" v={`Tk ${fmt(t.cost, 0)}`} />
          </div>
        </div>
        <div className="rounded-xl border border-line p-2">
          <LineChart series={[{ pts, color: 'var(--c-accent2)', label: 'floor + wall cost' }]} xmin={t.D * 0.5} xmax={t.D * 1.6} ymin={0} ymax={Math.ceil((tankCost(V, t.D * 0.5, cf, cw).cost / 1000) * 1.05)} xlabel="diameter D (ft)" ylabel="cost (Tk thousand)" marks={[{ x: t.D, y: t.cost / 1000, label: `best D ${fmt(t.D, 1)} ft`, color: 'var(--c-good)', dx: 8, dy: -10 }]} height={240} />
          <div className="text-xs text-mute px-1">At the minimum the floor costs half what the wall costs. Make the wall dearer and the tank gets wider and shallower.</div>
        </div>
      </div>
    </Section>
  )
}

type PT = 'jouk' | 'time' | 'tank'
function Problems() {
  const [type, setType] = useState<PT>('jouk')
  const { seed, next } = useSeed(7)
  const p = useMemo(() => {
    const r = rng(seed * 53 + type.length)
    if (type === 'jouk') {
      const L = randInt(r, 500, 2500, 100), a = pick(r, [900, 1000, 1100, 1200]), v = pick(r, [1.5, 2, 2.5, 3]), Tcl = pick(r, [0.5, 1, 3, 10])
      const h = hammerRise({ L, a, dv: v, T: Tcl, H0: 0 })
      return { key: [type, L, a, v, Tcl].join(), text: `Water flows at ${v} m/s in a pipe ${L} m long; the pressure wave speed is ${a} m/s. A valve at the end is closed in ${Tcl} s. Find the critical closure time 2L/a, say whether the closure is rapid, and find the pressure rise (kPa).`, checks: [{ id: 'Tc', label: 'Critical time 2L/a', value: h.Tc, unit: 's' }, { id: 'dp', label: 'Pressure rise', value: h.dp / 1000, unit: 'kPa' }], sol: <Sheet given={[`L ${L} m, a ${a} m/s, v ${v} m/s, T ${Tcl} s`]} answer={<>2L/a = {sg(h.Tc, 3)} s, so the closure is {h.rapid ? 'rapid' : 'slow'}; Δp ≈ {sg(h.dp / 1000, 4)} kPa ({sg(h.dH, 3)} m of water)</>} notes={['Textbook formulas, not on the CE22 slides.']} after={<div className="mb-3"><HammerSketch h={h} T={Tcl} /></div>}><Step n={1} title="Critical time"><T>{tx`T_c = \frac{2L}{a} = \frac{2 \times ${L}}{${a}} = ${sg(h.Tc, 3)}\text{ s}`}</T><div className="text-xs text-mute">The time the pressure wave takes to run to the reservoir and back. A valve shut faster than this gets no relief from the reflected wave.</div><T>{tx`T = ${Tcl}\text{ s} ${h.rapid ? tx`\le` : '>'} ${sg(h.Tc, 3)}\text{ s} \;\Rightarrow\; \text{${h.rapid ? 'rapid' : 'slow'} closure}`}</T></Step><Step n={2} title={h.rapid ? 'Rapid closure: Joukowsky' : 'Slow closure: Michaud'}><T>{h.rapid ? tx`\Delta p = \rho a \Delta v = 1000 \times ${a} \times ${v} = ${sg(h.dp / 1000, 4)}\text{ kPa}` : tx`\Delta p = \frac{2\rho L \Delta v}{T} = \frac{2 \times 1000 \times ${L} \times ${v}}{${Tcl}} = ${sg(h.dp / 1000, 4)}\text{ kPa}`}</T></Step><Step n={3} title="As a head of water"><T>{tx`\Delta H = \frac{\Delta p}{\rho g} = \frac{${sg(h.dp, 5)}}{1000 \times 9.81} = ${sg(h.dH, 4)}\text{ m}`}</T></Step></Sheet> }
    }
    if (type === 'time') {
      const L = randInt(r, 500, 3000, 100), v = pick(r, [1.5, 2, 3]), dH = pick(r, [20, 30, 40, 60])
      const Tn = closureTimeFor(L, v, dH)
      return { key: [type, L, v, dH].join(), text: `A pipe ${L} m long carries water at ${v} m/s. How slowly must the valve be closed so that the surge rise is held to ${dH} m of water? (Slow closure, ΔH = 2Lv/gT.)`, checks: [{ id: 'T', label: 'Closing time', value: Tn, unit: 's' }], sol: <Sheet given={[`L ${L} m, v ${v} m/s, ΔH ${dH} m`]} answer={<>T ≈ {sg(Tn, 4)} s</>} notes={['Textbook formula (Michaud), not on the CE22 slides.']}><Step n={1} title="Solve ΔH = 2Lv/(gT)"><T>{tx`T = \frac{2Lv}{g\,\Delta H} = \frac{2 \times ${L} \times ${v}}{9.81 \times ${dH}} = ${sg(Tn, 4)}\text{ s}`}</T></Step></Sheet> }
    }
    const gal = pick(r, [100000, 200000, 300000]), cf = pick(r, [200, 300, 500, 1200]), ratio = pick(r, [1.25, 1.5, 2]), cw = cf * ratio
    const t = economicTank(galToFt3(gal), cf, cw)
    return { key: [type, gal, cf, cw].join(), text: `An elevated cylindrical tank of ${gal.toLocaleString('en')} gallons (1 gal = 0.16 ft³) is to be built. Concrete work per sft costs Tk ${cf} in the floor and Tk ${cw} in the wall of the shell. Find the most economic diameter and depth.`, checks: [{ id: 'D', label: 'Diameter D', value: t.D, unit: 'ft' }, { id: 'H', label: 'Depth H', value: t.H, unit: 'ft' }], sol: <Sheet given={[`${gal} gal, floor Tk ${cf}, wall Tk ${cw}`]} answer={<>D = {sg(t.D, 4)} ft, H = {sg(t.H, 4)} ft</>}><Step n={1} title="Volume"><T>{tx`V = ${gal} \times 0.16 = ${sg(t.V, 6)}\text{ ft}^3`}</T></Step><Step n={2} title="Minimum cost"><T>{tx`D^3 = \frac{8 c_w V}{\pi c_f} = \frac{8 \times ${cw} \times ${sg(t.V, 6)}}{\pi \times ${cf}} \Rightarrow D = ${sg(t.D, 4)}\text{ ft},\; H = \frac{c_f D}{2 c_w} = ${sg(t.H, 4)}\text{ ft}`}</T></Step></Sheet> }
  }, [type, seed])
  const base = `ev-trans:lab:${hashKey(p.key)}`
  void G
  return (
    <Section title="3 · Numeric problems" sub="Work it on paper, check each number, then open the worked solution." right={<button className="btn" onClick={next}>🎲 New numbers</button>}>
      <div className="mb-3"><Seg value={type} onChange={setType} items={[{ v: 'jouk', label: 'Joukowsky' }, { v: 'time', label: 'Closing time' }, { v: 'tank', label: 'Economic tank' }]} /></div>
      <Card>
        <Md>{p.text}</Md>
        <div className="mt-3 space-y-0.5">{p.checks.map((c) => <Answer key={base + c.id} id={`${base}:${c.id}`} label={c.label} value={c.value} unit={c.unit} tol={0.03} digits={4} />)}</div>
        <div className="mt-3"><Reveal id={base + ':sol'} title="Worked solution">{p.sol}</Reveal></div>
      </Card>
    </Section>
  )
}

export default function TransLab() {
  return (
    <div className="space-y-2">
      <Hammer />
      <Tank />
      <Problems />
    </div>
  )
}
