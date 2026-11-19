// Demand & fire flow: fire formulas side by side, streams and storage, per-capita × peak factors, then exam-style problems.
import { useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { BNBC_CITY, economicTank, FIRE_FORMULAS, fireDemand, fireFlowGpm, fireFlowLpm, GAL_FT3, peakHourly, PEAK_FACTOR, weightedDemand, type FireFormula, type MixRow } from '../engine/demand'
import { Legend, LineChart, SERIES_COLORS, type Series } from '../figs/pop-chart'
import { fireMd } from '../pyq/sn-math'

const FCOL: Record<FireFormula, string> = { kuichling: SERIES_COLORS[0], freeman: SERIES_COLORS[1], nbfu: SERIES_COLORS[2], buston: SERIES_COLORS[3] }
const nf = (v: number, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

export default function DemandLab() {
  const [P, setP] = useState(65)
  const [hours, setHours] = useState(5)
  const [on, setOn] = useState<Record<string, boolean>>({ kuichling: true, freeman: true, nbfu: true, buston: true })
  const [unitL, setUnitL] = useState<'gpm' | 'lpm'>('gpm')

  const f = fireDemand(P, hours)
  const ps: number[] = []
  for (let p = 1; p <= 300; p += 2) ps.push(p)
  const series: Series[] = FIRE_FORMULAS.filter((x) => on[x.id]).map((x) => ({ id: x.id, label: x.label, color: FCOL[x.id], pts: ps.map((p) => [p, unitL === 'gpm' ? fireFlowGpm(x.id, p) : fireFlowLpm(x.id, p)] as [number, number]) }))

  // per capita × peak factors
  const [pop, setPop] = useState(12425)
  const [lpcd, setLpcd] = useState(120)
  const [loss, setLoss] = useState(0)
  const [zone, setZone] = useState<keyof typeof PEAK_FACTOR>('residential')
  const [tfH, setTfH] = useState(24)
  const [res, setRes] = useState(false)
  const adc = pop * lpcd * (1 + loss / 100)
  const pk = peakHourly(adc, PEAK_FACTOR[zone], tfH, res)

  return (
    <div className="space-y-6">
      <Section title="Fire flow by every formula" sub="One population, four textbook formulas. The papers say 'according to Kuichling', so that is the one to remember; the others show how far apart they are.">
        <div className="space-y-3">
          <Slider label="Population served" value={P} min={1} max={300} step={1} onChange={setP} unit=" thousand" />
          <div className="flex flex-wrap items-center gap-2">
            <Seg value={unitL} onChange={setUnitL} items={[{ v: 'gpm', label: 'gpm' }, { v: 'lpm', label: 'L/min' }]} />
            <Legend items={FIRE_FORMULAS.map((x) => ({ id: x.id, label: x.label, color: FCOL[x.id] }))} on={on} toggle={(id) => setOn({ ...on, [id]: !on[id] })} />
          </div>
          <div className="rounded-xl border border-line p-2 bg-bg/40">
            <LineChart series={series} dots={FIRE_FORMULAS.filter((x) => on[x.id]).map((x) => ({ x: P, y: unitL === 'gpm' ? fireFlowGpm(x.id, P) : fireFlowLpm(x.id, P), color: FCOL[x.id] }))} xLabel="population (thousands)" yLabel={unitL === 'gpm' ? 'fire flow (gpm)' : 'fire flow (L/min)'} vline={{ x: P, label: `${P} thousand` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FIRE_FORMULAS.map((x) => (
              <div key={x.id} className="rounded-lg border border-line p-2 text-center">
                <div className="text-xs font-bold" style={{ color: FCOL[x.id] }}>
                  {x.label}
                </div>
                <div className="num font-semibold">{nf(unitL === 'gpm' ? fireFlowGpm(x.id, P) : fireFlowLpm(x.id, P))}</div>
                <div className="text-[11px] text-faint">{unitL === 'gpm' ? 'gpm' : 'L/min'}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-faint grid gap-0.5">
            <span>Kuichling Q = 700 √P gpm · Freeman Q = 250 (P/5 + 10) gpm · NBFU Q = 1020 √P (1 − 0.01 √P) gpm · Buston Q = 5663 √P L/min. P in thousands.</span>
            <span>These formulas are not in her slides (only the Pitot hydrant formula and the BNBC table are); the papers ask Kuichling, and its numbers here are from the seniors' notes and the textbook.</span>
          </div>
        </div>
      </Section>

      <div className="grid cq-lg:grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <div className="font-bold">Streams and storage</div>
          <Slider label="Duration of fire" value={hours} min={1} max={10} step={1} onChange={setHours} unit=" h" />
          <div className="text-sm space-y-0.5">
            <div>
              Streams <span className="num">N = 2.8 √{P} = {f.streams.exact.toFixed(2)}</span> → <b>{f.streams.n}</b> (round up)
            </div>
            <div>
              Flow with 250 gpm (950 L/min) per stream: <b className="num">{nf(f.streams.totalGpm)} gpm</b> = <b className="num">{nf(f.streamFlowLpm)} L/min</b>
            </div>
            <div>
              Storage for {hours} h: <b className="num">{nf(f.storageL / 1000)} m³</b> (using Kuichling's own Q: {nf(f.storageKuichlingL / 1000)} m³)
            </div>
            <div className="text-faint text-xs">Her class: fire storage is a separate ground reservoir, not added to the elevated tank.</div>
          </div>
        </div>
        <div className="card p-4 space-y-2">
          <div className="font-bold">Per capita × peak factors → design flows</div>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <NumIn label="population" value={pop} step={500} w="w-24" onChange={(v) => setPop(Number.isFinite(v) && v > 0 ? v : pop)} />
            <NumIn label="lpcd" value={lpcd} step={5} onChange={(v) => setLpcd(Number.isFinite(v) && v > 0 ? v : lpcd)} />
            <NumIn label="losses" value={loss} step={5} unit="%" onChange={(v) => setLoss(Number.isFinite(v) && v >= 0 ? v : loss)} />
          </div>
          <Seg value={zone} onChange={setZone} items={[{ v: 'residential', label: 'Residential 2.5' }, { v: 'industrial', label: 'Industrial 1.4' }, { v: 'commercial', label: 'Comm. 4' }, { v: 'fire', label: 'Fire 1' }]} size="xs" />
          <div className="flex flex-wrap items-center gap-3">
            <NumIn label="hours of use per day" value={tfH} step={1} unit="h" onChange={(v) => setTfH(Number.isFinite(v) && v >= 1 && v <= 24 ? v : tfH)} />
            <label className="text-xs inline-flex items-center gap-1.5">
              <input type="checkbox" checked={res} onChange={(e) => setRes(e.target.checked)} /> service reservoir present (no time factor)
            </label>
          </div>
          <div className="text-sm space-y-0.5">
            <div>
              ADC = {nf(adc / 1000)} m³/day · ADC/24 = <b className="num">{nf(pk.avgHour)} L/h</b>
            </div>
            <div>
              PF × TF = {pk.pf} × {+pk.tf.toFixed(2)} = <b className="num">{+(pk.pf * pk.tf).toFixed(2)}</b>
            </div>
            <div>
              Peak hourly demand = <b className="num">{nf(pk.peak)} L/h</b> = <b className="num">{(pk.peak / 3600).toFixed(2)} L/s</b>
            </div>
          </div>
          <p className="text-xs text-faint">Source, raw-water main and treatment plant are sized on the peak <i>daily</i> demand, the distribution system on the peak <i>hourly</i> demand.</p>
        </div>
      </div>

      <Callout kind="tip" title="Notice that…">
        Buston gives by far the most and Kuichling the least; Freeman grows in a straight line with P, so it overtakes the √P formulas for a big city, and NBFU bends over because of its (1 − 0.01√P) term. Raise the population past 200 thousand and watch the streams count climb, then set 'hours of use' to 8 with no reservoir: the time factor 3 triples the peak, which is why office areas are the worst case for a pump with no storage.
      </Callout>

      <Problems />
    </div>
  )
}

// ================================================================ problems
type Fam = 'fire' | 'peak' | 'mix' | 'tank'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'fire', label: 'Fire flow, streams, storage' },
  { v: 'peak', label: 'Peak factors' },
  { v: 'mix', label: 'Income-group mix' },
  { v: 'tank', label: 'Most economic tank' },
]
interface DP extends XProblem<Fam> {
  data: Record<string, number>
  mix?: MixRow[]
}

function make(seed: number, family?: Fam, level: Level = 'exam'): DP {
  const r = rng(seed * 4409 + 3)
  const fam = family ?? pick(r, ['fire', 'peak', 'mix', 'tank'] as Fam[])
  if (fam === 'fire') {
    const Pp = pick(r, [10, 25, 40, 65, 90, 120, 164, 220])
    const per = pick(r, [950, 1100, 1900])
    const h = pick(r, [3, 4, 5, 6])
    const st = Math.ceil(2.8 * Math.sqrt(Pp) - 1e-9)
    const Q = st * per
    const steps: XStep[] = [
      { key: 'n', group: 'Streams', label: 'N (round up)', value: st, digits: 0, abs: 0.4, tol: 0 },
      { key: 'q', group: 'Total flow', label: 'Total flow', value: Q, unit: 'L/min', digits: 0, tol: 0.005 },
      { key: 'k', group: 'Kuichling', label: 'Q = 700√P', value: fireFlowGpm('kuichling', Pp), unit: 'gpm', digits: 0, tol: 0.005 },
      { key: 'v', group: 'Storage', label: `Storage, ${h} h`, value: (Q * 60 * h) / 1000, unit: 'm³', digits: 0, tol: 0.005 },
    ]
    return {
      family: fam,
      level,
      title: 'Fire demand',
      text: `A city has a population of ${nf(Pp * 1000)}. According to Kuichling, how many fire streams may be called into use at the same time? Taking ${per} L/min per stream, find the total fire flow and the storage needed for ${h} hours of firefighting. Also find the fire flow by Kuichling's formula in gpm.`,
      hash: hashKey(JSON.stringify([fam, Pp, per, h])),
      steps,
      data: { Pp, per, h },
    }
  }
  if (fam === 'peak') {
    const pop = randInt(r, 4000, 30000, 500)
    const q = pick(r, [90, 100, 120, 135, 150])
    const kind = pick(r, ['residential', 'industrial', 'school', 'commercial'] as const)
    const cfg = { residential: { pf: 2.5, tf: 1, hrs: 24 }, industrial: { pf: 1.4, tf: 1.5, hrs: 16 }, school: { pf: 4, tf: 4, hrs: 6 }, commercial: { pf: 4, tf: 3, hrs: 8 } }[kind]
    const adc = pop * q
    const pk = peakHourly(adc, cfg.pf, cfg.hrs)
    const steps: XStep[] = [
      { key: 'adc', group: 'Average demand', label: 'ADC', value: adc / 1000, unit: 'm³/day', digits: 1, tol: 0.003 },
      { key: 'h', group: 'Average demand', label: 'ADC/24', value: pk.avgHour, unit: 'L/h', digits: 0, tol: 0.003 },
      { key: 'tf', group: 'Factors', label: 'time factor TF', value: pk.tf, digits: 2, tol: 0.01 },
      { key: 'pk', group: 'Peak', label: 'Peak hourly demand', value: pk.peak, unit: 'L/h', digits: 0, tol: 0.005 },
    ]
    const use = { residential: 'a residential zone (supplied 24 h)', industrial: `an industrial area working two 8-hour shifts (${cfg.hrs} h of use)`, school: 'a school using water 6 hours a day', commercial: 'a commercial area open 8 hours a day' }[kind]
    return { family: fam, level, title: 'Peak hourly demand', text: `A town of ${nf(pop)} people uses ${q} lpcd. The water goes directly from the pump station (no daily storage) to ${use}. Find the average daily demand, the average hourly demand and the instantaneous peak hourly demand, using her peak factors (residential 2.5, industrial 1.4, commercial/institutional 4) and time factor $TF=24/\\text{hours of consumption}$.`, hash: hashKey(JSON.stringify([fam, pop, q, kind])), steps, data: { pop, q, pf: cfg.pf, hrs: cfg.hrs } }
  }
  if (fam === 'mix') {
    const P = randInt(r, 40, 200, 5) * 1000
    const rows = [
      { c: BNBC_CITY[0], v: 200 },
      { c: BNBC_CITY[1], v: 150 },
      { c: BNBC_CITY[2], v: 135 },
      { c: BNBC_CITY[3], v: 120 },
      { c: BNBC_CITY[4], v: 80 },
      { c: BNBC_CITY[6], v: 50 },
    ]
    const fr = [0.04, 0.08, 0.28, 0.3, 0.16, 0.14].map((x) => x)
    // jitter fractions, keep sum 1
    const jit = fr.map((x) => x * (0.8 + r() * 0.4))
    const sum = jit.reduce((a, b) => a + b, 0)
    const mix: MixRow[] = rows.map((q, i) => ({ label: `${q.c.cat} ${q.c.label.split(',')[0]}`, frac: Math.round((jit[i] / sum) * 100) / 100, lpcd: q.v }))
    const adj = 1 - mix.reduce((a, b) => a + b.frac, 0)
    mix[3].frac = +(mix[3].frac + adj).toFixed(2)
    const wd = weightedDemand(P, mix)
    const hi = wd.share((m) => m.label.startsWith('A'))
    const steps: XStep[] = [
      { key: 'lp', group: 'Weighted demand', label: 'Average lpcd', value: wd.lpcd, unit: 'lpcd', digits: 2, tol: 0.005 },
      { key: 'mld', group: 'Weighted demand', label: 'Daily demand', value: wd.MLD, unit: 'MLD', digits: 2, tol: 0.005 },
      { key: 'hi', group: 'Shares', label: 'High-income share', value: hi, unit: '%', digits: 1, abs: 0.4 },
    ]
    return {
      family: fam,
      level,
      title: 'Demand by income group (her Example 1)',
      text: `A district town has ${nf(P)} people. Using BNBC Table 8.5.1(a), the population is distributed as:\n\n| Group | Share | lpcd |\n|---|---|---|\n${mix.map((m) => `| ${m.label} | ${(m.frac * 100).toFixed(0)} % | ${m.lpcd} |`).join('\n')}\n\nFind the average lpcd, the daily demand in MLD, and the share of the total demand taken by the high-income groups (A1, A3).`,
      hash: hashKey(JSON.stringify([fam, P, mix])),
      steps,
      data: { P },
      mix,
    }
  }
  const V = randInt(r, 4, 40) * 50 // m³
  const cf = pick(r, [150, 200, 300])
  const cw = pick(r, [200, 250, 400])
  const t = economicTank(V, cf, cw)
  const steps: XStep[] = [
    { key: 'D', group: 'Dimensions', label: 'Diameter D', value: t.D, unit: 'm', digits: 2, tol: 0.01 },
    { key: 'H', group: 'Dimensions', label: 'Depth H', value: t.H, unit: 'm', digits: 2, tol: 0.01 },
    { key: 'r', group: 'Dimensions', label: 'H / D', value: t.ratioHD, digits: 3, tol: 0.01 },
  ]
  return { family: fam, level, title: 'Most economic cylindrical tank', text: `A cylindrical overhead tank must hold ${V} m³. Concrete costs Tk ${cf} per m² in the floor and Tk ${cw} per m² in the wall (ignore the roof). Find the most economic diameter and water depth.`, hash: hashKey(JSON.stringify([fam, V, cf, cw])), steps, data: { V, cf, cw } }
}

function Solution({ p }: { p: DP }) {
  const d = p.data
  let md = ''
  if (p.family === 'fire') {
    const f = fireDemand(d.Pp, d.h)
    md = fireMd(d.Pp, 'the city', true) + `\n\nTotal flow with ${d.per} L/min per stream: ${f.streams.n} × ${d.per} = **${nf(f.streams.n * d.per)} L/min**. Storage: ${nf(f.streams.n * d.per)} × 60 × ${d.h} = **${nf((f.streams.n * d.per * 60 * d.h) / 1000)} m³**.`
  } else if (p.family === 'peak') {
    const pk = peakHourly(d.pop * d.q, d.pf, d.hrs)
    md = `1. ADC $=P\\,q=${nf(d.pop)}\\times${d.q}=${nf(d.pop * d.q)}$ L/day.\n\n2. ADC/24 $=${nf(pk.avgHour)}$ L/h.\n\n3. $TF=24/${d.hrs}=${+pk.tf.toFixed(2)}$ (a reservoir would make it 1).\n\n4. Peak $=\\dfrac{ADC}{24}\\times PF\\times TF=${nf(pk.avgHour)}\\times${d.pf}\\times${+pk.tf.toFixed(2)}=$ **${nf(pk.peak)} L/h** $=${(pk.peak / 3600).toFixed(2)}$ L/s.`
  } else if (p.family === 'mix') {
    const wd = weightedDemand(d.P, p.mix!)
    const hiRows = wd.rows.filter((r) => r.label.startsWith('A'))
    md = [
      `1. **Weighted lpcd.** Each group uses its own lpcd, so the town's average is the population-weighted mean, $q=\\sum(\\text{share}\\times\\text{lpcd})$:`,
      `| Group | share × lpcd |\n|---|---|\n${wd.rows.map((r) => `| ${r.label} | ${r.frac.toFixed(2)} × ${r.lpcd} = ${r.lpcdShare.toFixed(2)} |`).join('\n')}\n| **Σ** | **${wd.lpcd.toFixed(2)} lpcd** |`,
      `2. **Daily demand:** $Q=P\\,q=${nf(d.P)}\\times${wd.lpcd.toFixed(2)}=${nf(wd.netLpd)}$ L/day $=${nf(wd.netLpd)}\\div10^6=$ **${wd.MLD.toFixed(2)} MLD** (1 ML = 10⁶ L).`,
      `3. **High-income share** of the demand (not of the people): $\\dfrac{${hiRows.map((r) => r.lpcdShare.toFixed(2)).join(' + ')}}{${wd.lpcd.toFixed(2)}}\\times100=$ **${wd.share((m) => m.label.startsWith('A')).toFixed(1)} %**, although they are only ${(hiRows.reduce((s, r) => s + r.frac, 0) * 100).toFixed(0)} % of the people.`,
    ].join('\n\n')
  } else {
    const t = economicTank(d.V, d.cf, d.cw)
    md = `$C=c_f\\dfrac{\\pi D^2}{4}+c_w\\pi DH$ with $H=\\dfrac{4V}{\\pi D^2}$ → $C=c_f\\dfrac{\\pi D^2}{4}+\\dfrac{4c_wV}{D}$.\n\n$\\dfrac{dC}{dD}=0\\Rightarrow D^3=\\dfrac{8c_wV}{\\pi c_f}=\\dfrac{8(${d.cw})(${d.V})}{\\pi(${d.cf})}$, so **D = ${t.D.toFixed(2)} m**, $H=\\dfrac{4V}{\\pi D^2}=$ **${t.H.toFixed(2)} m** ($H/D=c_f/2c_w=${t.ratioHD.toFixed(3)}$).`
  }
  return <Md className="text-sm">{md}</Md>
}

function Problems() {
  return <ExamProblems<Fam, DP> topic="ev-demand:lab" families={FAMS} make={make} solution={(p) => <Solution p={p} />} initialSeed={7} />
}

void GAL_FT3
