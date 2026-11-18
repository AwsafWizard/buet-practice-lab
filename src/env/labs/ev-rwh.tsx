// Rainwater tank lab: monthly harvest against demand, the mass curve, a tank of your size through the year, and the
// demand-side / supply-side / dry-months answers side by side; then exam-style problems.
import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Md, Reveal, Section, Seg, Step } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { Card, Slider, pick, randInt, rng, useSeed } from '../../labs/common'
import { BNBC, RAIN_TABLES, RUNOFF, catchmentArea, compare, demandSide, demandSideBnbc, dryMonths, harvest, monthlyFromLpd, scaleRain, supplySide, tankYear } from '../engine/rwh'
import { LineChart } from '../figs/pump-chart'
import { Sheet, T, sg } from '../figs/pump-work'
import { MassFigures, MassTable } from '../figs/rwh-work'

const tx = String.raw
const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className="flex items-baseline justify-between gap-2 py-0.5 text-sm">
    <span className="text-mute">{k}</span>
    <span className={'num ' + (bold ? 'font-bold' : 'font-semibold')}>{v}</span>
  </div>
)

function Sim() {
  const [tid, setTid] = useState('dispensary')
  const [area, setArea] = useState(190)
  const [C, setC] = useState(0.9)
  const [users, setUsers] = useState(7)
  const [qp, setQp] = useState(45)
  const [qo, setQo] = useState(0)
  const [months, setMonths] = useState(3)
  const [mult, setMult] = useState(1)
  const [rain, setRain] = useState<number[] | null>(null)
  const table = RAIN_TABLES.find((t) => t.id === tid)!
  const rn = rain ?? table.rain
  const lpd = users * (qp + qo)
  const cmp = useMemo(() => compare({ area, C, rain: rn, users, potable: qp, other: qo, dryMonthsN: months }), [area, C, rn, users, qp, qo, months])
  const s = cmp.supply
  const size = s.tank * mult
  const ty = tankYear(s, size)
  const chart = s.rows.map((r, i) => [i + 1, ty.level[i]] as [number, number])
  const random = () => {
    const r = rng(Math.floor(Math.random() * 1e6))
    const base = pick(r, RAIN_TABLES).rain
    setRain(scaleRain(base, randInt(r, 900, 3000, 50)))
  }
  return (
    <Section title="1 · Roof, rain and tank" sub="Harvest = roof area × rainfall × runoff coefficient. Pick a paper's rainfall, or roll your own, and see which approach sizes the tank.">
      <div className="grid gap-4 cq-lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-mute">Rainfall</span>
            <select className="field !py-1 !text-xs" value={rain ? 'rand' : tid} onChange={(e) => { setRain(null); setTid(e.target.value) }}>
              {RAIN_TABLES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              {rain && <option value="rand">random year</option>}
            </select>
            <button className="btn !py-1 !px-2.5" onClick={random}>🎲</button>
          </div>
          <Slider label="Roof (catchment) area" value={area} min={50} max={2500} step={10} onChange={setArea} unit=" m²" />
          <Slider label="Runoff coefficient C" value={C} min={0.3} max={0.95} step={0.05} onChange={setC} />
          <div className="text-[11px] text-faint">{RUNOFF.slice(0, 3).map((r) => `${r.name} ${r.lo}–${r.hi}`).join(' · ')}</div>
          <Slider label="People" value={users} min={1} max={300} onChange={setUsers} />
          <Slider label="Potable demand (drink, cook, bathe)" value={qp} min={5} max={100} step={5} onChange={setQp} unit=" lpcd" />
          <Slider label="Non-potable demand" value={qo} min={0} max={150} step={10} onChange={setQo} unit=" lpcd" />
          <Slider label="Dry months to carry" value={months} min={1} max={6} onChange={setMonths} />
        </div>
        <div className="space-y-3">
          <MassFigures s={s} />
          <div className="rounded-xl border border-line p-3">
            <Row k="Annual harvest A R C" v={`${fmt(cmp.harvestYear, 1)} m³`} />
            <Row k="Annual demand" v={`${fmt(cmp.demandYear, 1)} m³ (${fmt(lpd, 0)} L/day)`} />
            <Row k="Which side governs" v={cmp.governs === 'supply' ? 'supply (demand cut to ' + fmt(s.demandUsed, 2) + ' m³/month)' : 'demand'} bold />
          </div>
        </div>
      </div>
      <div className="grid gap-3 cq-lg:grid-cols-3 mt-3">
        <Card title="Demand side"><div className="text-2xl font-bold num">{fmt(cmp.demandSide, 1)} m³</div><div className="text-xs text-mute">n(90 q_potable + 210 q_other) + 10 %. Ignores the roof.</div></Card>
        <Card title="Supply side (mass curve)"><div className="text-2xl font-bold num">{fmt(s.tank, 1)} m³</div><div className="text-xs text-mute">Largest gap between cumulative harvest and demand ({s.maxDiffMonth}). Uses the rain.</div></Card>
        <Card title={`${months} dry months`}><div className="text-2xl font-bold num">{fmt(cmp.dryMonths, 1)} m³</div><div className="text-xs text-mute">n q × {months * 30} days + 10 %. Roof ignored too.</div></Card>
      </div>
      <div className="mt-3 rounded-xl border border-line p-3">
        <div className="text-sm font-semibold mb-1">Try a tank size through the year</div>
        <Slider label="Tank size as a share of the mass-curve answer" value={mult} min={0.2} max={1.6} step={0.05} onChange={setMult} unit=" ×" />
        <LineChart
          height={210}
          series={[{ pts: [[0, 0], ...chart], color: 'var(--c-water)', label: `tank level, ${fmt(size, 1)} m³` }]}
          xmax={12}
          ymax={Math.max(size, 1) * 1.1}
          xticks={s.rows.map((r, i) => ({ x: i + 1, label: r.month }))}
          ylabel="stored (m³)"
          hlines={[{ y: size, label: 'full', color: 'var(--c-faint)' }]}
        />
        <div className="text-sm mt-1">
          Demand met {fmt(ty.reliability * 100, 0)} % of the year ({ty.monthsShort} months short), {fmt(ty.spill, 1)} m³ spilled.{' '}
          {mult < 0.98 ? 'Too small: the dry spell empties it.' : mult > 1.05 ? 'Bigger than needed: it only spills more and costs more.' : 'Just enough.'}
        </div>
      </div>
      <div className="grid gap-2 cq-lg:grid-cols-2 mt-3">
        <Callout kind="tip" title="Notice 1">Shrink the roof until the demand cannot be met: the demand is replaced by harvest ÷ 12 and the supply side governs. Grow the roof: the demand stays, and the tank only has to bridge the dry months.</Callout>
        <Callout kind="tip" title="Notice 2">The demand-side figure does not change with the roof or the rain. If it is far above the mass-curve tank, the big tank could never fill: that is the economical-approach argument of 2020-21 Q3(b).</Callout>
        <Callout kind="note" title="BNBC 2020 numbers">Every building with {BNBC.thresholdM2} m² of roof should have RWH; dry days {BNBC.dryDaysPotable} (potable) and {BNBC.dryDaysOther} (other); 10 % freeboard; catchment = plan area + 50 % of adjoining wall; at least 2 downpipes of 50 mm or more; first flush {BNBC.firstFlushMin.Dhaka} min in Dhaka, {BNBC.firstFlushMin.Sylhet} min elsewhere.</Callout>
        <Callout kind="trap" title="Common trap">Start the table where the tank is empty, and read the tank as the largest value of (cumulative harvest − cumulative demand), not the largest monthly harvest.</Callout>
      </div>
    </Section>
  )
}

type PT = 'demand' | 'mass' | 'dry' | 'area'
const TYPES: { v: PT; label: string; hint: string }[] = [
  { v: 'demand', label: 'Demand side', hint: 'RWH-1, 2020-21 Q3(b)' },
  { v: 'mass', label: 'Mass curve', hint: 'RWH-2, Jan 2021 Q1(b), 2021-22 Q8(c)' },
  { v: 'dry', label: 'Dry months', hint: '2023-24 Q3(d)' },
  { v: 'area', label: 'BNBC catchment', hint: '2022-23 Q2(a), 2020-21 Q3(b)' },
]

function Problems() {
  const [type, setType] = useState<PT>('mass')
  const { seed, next } = useSeed(5)
  const p = useMemo(() => {
    const r = rng(seed * 97 + type.length)
    if (type === 'demand') {
      const users = randInt(r, 4, 60, 2), qp = pick(r, [10, 15, 20, 45]), qo = pick(r, [0, 50, 100])
      const b = demandSideBnbc({ users, potable: qp, other: qo })
      return { key: [type, users, qp, qo].join(), text: `${users} residents; potable demand ${qp} lpcd and non-potable ${qo} lpcd. Size the rainwater tank by the demand-side approach with the BNBC 2020 dry days (90 for potable, 210 for other uses) and 10 % freeboard.`, checks: [{ id: 'V', label: 'Volume with freeboard', value: b.designM3, unit: 'm³' }], sol: <Sheet given={[`n = ${users}, potable ${qp}, other ${qo} lpcd`]} answer={<>V ≈ {sg(b.designM3, 4)} m³</>}><Step n={1} title="V = n d q"><T>{tx`V = ${users}(90 \times ${qp} + 210 \times ${qo}) = ${sg(b.V, 6)}\text{ L}`}</T></Step><Step n={2} title="Freeboard"><T>{tx`1.10 \times ${sg(b.V / 1000, 5)} = ${sg(b.designM3, 5)}\text{ m}^3`}</T></Step></Sheet> }
    }
    if (type === 'dry') {
      const users = randInt(r, 3, 12), q = pick(r, [10, 15, 20, 25]), m = pick(r, [2, 3, 4]), A = pick(r, [80, 100, 150, 200]), R = pick(r, [900, 1070, 1500, 2000]), C = pick(r, [0.7, 0.8, 0.9])
      const d = dryMonths({ users, perCapita: q, months: m })
      const h = harvest(A, R, C)
      return { key: [type, users, q, m, A, R, C].join(), text: `A household of ${users} plans a rainwater harvesting system. Demand for drinking and cooking is ${q} lpcd; concrete roof ${A} m², annual rainfall ${R} mm, runoff coefficient ${C}. Design a tank with ${m} dry months of storage, and say how much the roof harvests a year.`, checks: [{ id: 'V', label: 'Tank volume (+10 %)', value: d.designM3, unit: 'm³' }, { id: 'h', label: 'Annual harvest', value: h, unit: 'm³' }], sol: <Sheet given={[`${users} people, ${q} lpcd, ${m} dry months, A ${A} m², ${R} mm, C ${C}`]} answer={<>Tank ≈ {sg(d.designM3, 4)} m³; harvest {sg(h, 4)} m³/yr</>}><Step n={1} title="Demand over the dry days"><T>{tx`V = ${users} \times ${m * 30} \times ${q} = ${sg(d.V, 6)}\text{ L},\; 1.10V = ${sg(d.designM3, 4)}\text{ m}^3`}</T></Step><Step n={2} title="Harvest"><T>{tx`A R C = ${A} \times ${R / 1000} \times ${C} = ${sg(h, 4)}\text{ m}^3/\text{yr}`}</T></Step></Sheet> }
    }
    if (type === 'area') {
      const w = pick(r, [20, 22, 25, 30]), d1 = pick(r, [12, 15, 20]), d2 = pick(r, [5, 6, 8]), step = pick(r, [6, 8, 10]), R = pick(r, [1100, 1500, 2435]), C = pick(r, [0.7, 0.8])
      const c = catchmentArea({ terraces: [w * d1, w * d2], walls: [step * w] })
      const h = harvest(c.total, R, C)
      return { key: [type, w, d1, d2, step, R, C].join(), text: `A stepped concrete building has an upper roof ${w} m × ${d1} m and a lower roof strip ${w} m × ${d2} m, with an ${step} m high wall between them. Using the BNBC 2020 catchment rule, find the catchment area and the annual harvest for ${R} mm of rain and C = ${C}.`, checks: [{ id: 'A', label: 'Catchment area', value: c.total, unit: 'm²' }, { id: 'h', label: 'Annual harvest', value: h, unit: 'm³' }], sol: <Sheet given={[`terraces ${w}×${d1} and ${w}×${d2}, wall ${step} m high`]} answer={<>A = {sg(c.total, 4)} m²; harvest {sg(h, 4)} m³/yr</>}><Step n={1} title="Plan areas + 50 % of the wall"><T>{tx`A = ${w * d1} + ${w * d2} + 0.5(${step} \times ${w}) = ${sg(c.total, 5)}\text{ m}^2`}</T></Step><Step n={2} title="Harvest"><T>{tx`${sg(c.total, 5)} \times ${R / 1000} \times ${C} = ${sg(h, 5)}\text{ m}^3`}</T></Step></Sheet> }
    }
    const t = pick(r, RAIN_TABLES.slice(0, 3))
    const rain = scaleRain(t.rain, randInt(r, 1000, 2400, 100))
    const A = randInt(r, 100, 600, 20), C = pick(r, [0.7, 0.8, 0.9]), pp = randInt(r, 5, 40), q = pick(r, [20, 45, 60, 100])
    const s = supplySide({ area: A, C, rain, demandPerMonth: monthlyFromLpd(pp * q) })
    return { key: [type, A, C, pp, q, rain.map((x) => Math.round(x)).join('.')].join(), text: `Roof area ${A} m², runoff coefficient ${C}, ${pp} users at ${q} lpcd. Monthly rainfall (mm, Jan to Dec): ${rain.map((x) => fmt(x, 0)).join(', ')}. Size the tank by the supply-side mass curve (if the roof cannot meet the demand, cut the demand to the harvest).`, checks: [{ id: 'h', label: 'Annual harvest', value: s.annualHarvest, unit: 'm³' }, { id: 'd', label: 'Demand used per month', value: s.demandUsed, unit: 'm³' }, { id: 'V', label: 'Tank volume', value: s.tank, unit: 'm³' }], sol: <Sheet given={[`A ${A} m², C ${C}, ${pp} × ${q} lpcd`]} answer={<>Tank ≈ {sg(s.tank, 4)} m³ (table starts in {s.rows[0].month}, largest gap {s.maxDiffMonth})</>}><Step n={1} title="Harvest and demand"><T>{tx`V_h = ${sg(s.annualHarvest, 5)}\text{ m}^3/\text{yr};\quad \text{demand asked} = ${sg(s.demandAsked, 4)}\text{ m}^3/\text{month}${s.supplyGoverns ? tx`\;\Rightarrow\; \text{cut to } ${sg(s.demandUsed, 4)}` : ''}`}</T></Step><Step n={2} title="Mass-curve table"><MassTable s={s} /></Step><Step n={3} title="Tank"><T>{tx`V = \max(\text{difference}) = ${sg(s.tank, 4)}\text{ m}^3`}</T></Step></Sheet> }
  }, [type, seed])
  const base = `ev-rwh:lab:${hashKey(p.key)}`
  void demandSide
  return (
    <Section title="2 · Exam-style problems" sub="Work it on paper, check each number, then open the worked solution." right={<button className="btn" onClick={next}>🎲 New numbers</button>}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Seg value={type} onChange={setType} items={TYPES.map((t) => ({ v: t.v, label: t.label }))} />
        <span className="text-xs text-faint">{TYPES.find((t) => t.v === type)!.hint}</span>
      </div>
      <Card>
        <Md>{p.text}</Md>
        <div className="mt-3 space-y-0.5">
          {p.checks.map((c) => <Answer key={base + c.id} id={`${base}:${c.id}`} label={c.label} value={c.value} unit={c.unit} tol={0.03} digits={4} />)}
        </div>
        <div className="mt-3"><Reveal id={base + ':sol'} title="Worked solution">{p.sol}</Reveal></div>
      </Card>
    </Section>
  )
}

export default function RwhLab() {
  return (
    <div className="space-y-2">
      <Sim />
      <Problems />
    </div>
  )
}
