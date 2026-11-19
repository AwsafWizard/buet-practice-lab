// Population forecaster: every method on one chart, then exam-style problems with step checks.
import { useMemo, useState } from 'react'
import { Callout, Md, Section } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { ALL_METHODS, annualGrowth, arithmetic, decreasing, geometric, growthRates, polyFit, runAll, SUITS, type Census, type MethodId } from '../engine/population'
import { Legend, LineChart, SERIES_COLORS, type Series } from '../figs/pop-chart'
import { PopWorkChart, type PopCurve } from '../figs/sn-pop-work'
import { censusTable, decrMd, geomMd, lsMd } from '../pyq/sn-math'

const COLOR: Record<MethodId, string> = { arith: SERIES_COLORS[0], expo: SERIES_COLORS[1], geom: SERIES_COLORS[2], decr: SERIES_COLORS[3], incr: SERIES_COLORS[4], line: SERIES_COLORS[5], parab: SERIES_COLORS[6], logi: SERIES_COLORS[7] }
const YEARS = [1980, 1990, 2000, 2010, 2020]

type Kind = 'slide' | 'old' | 'new' | 'sat'
const PRESETS: Record<Kind, { label: string; pops: number[]; blurb: string; best: MethodId[] }> = {
  slide: { label: 'Slide Ex-2 data', pops: [72, 79, 89, 97, 120], blurb: 'The census table of her Exercises 2–4 (thousands): the arithmetic, constant-percentage and geometric answers on her slides come from this.', best: ['arith', 'geom'] },
  old: { label: 'Old established city', pops: [210, 232, 255, 279, 304], blurb: 'Steady, nearly constant yearly addition: the arithmetic line follows the data and she says it suits large, old, established cities.', best: ['arith', 'line'] },
  new: { label: 'New industrial township', pops: [8, 12, 19, 30, 47], blurb: 'Young town growing by a constant percentage: geometric / constant-percentage fit; she restricts them to a new town for only a few decades.', best: ['geom', 'expo'] },
  sat: { label: 'Town nearing saturation', pops: [25, 28, 34, 42, 47], blurb: 'The growth rate has started to fall (this is her Exercise-5 data): the decreasing-rate or logistic curve flatten, the others keep climbing.', best: ['decr', 'logi'] },
}

function randomCensus(seed: number): number[] {
  const r = rng(seed * 977 + 5)
  const kind = pick(r, ['old', 'new', 'sat'] as Kind[])
  const base = randInt(r, 20, 120)
  const out = [base]
  let rate = 0.06 + r() * 0.1
  let inc = base * 0.1
  for (let i = 1; i < 5; i++) {
    const prev = out[i - 1]
    if (kind === 'old') out.push(prev + inc * (1 + (r() - 0.5) * 0.3))
    else if (kind === 'new') {
      rate = 0.3 + r() * 0.3
      out.push(prev * (1 + rate))
    } else {
      out.push(prev * (1 + Math.max(0.03, rate)))
      rate -= 0.012 + r() * 0.02
    }
  }
  return out.map((v) => +v.toFixed(1))
}

export default function PopLab() {
  const [pops, setPops] = useState<number[]>(PRESETS.slide.pops)
  const [kind, setKind] = useState<Kind | 'mine'>('slide')
  const [target, setTarget] = useState(2040)
  const [off, setOff] = useState<Record<string, boolean>>({ incr: true, line: true, logi: false })
  const [seed, setSeed] = useState(3)

  const census: Census[] = YEARS.map((year, i) => ({ year, pop: pops[i] }))
  const methods = useMemo(() => runAll(census), [pops]) // eslint-disable-line react-hooks/exhaustive-deps
  const visible = methods.filter((m) => !off[m.id])
  const years: number[] = []
  for (let y = 1980; y <= target + 1e-9; y += 2.5) years.push(y)
  if (years[years.length - 1] !== target) years.push(target)
  const series: Series[] = visible.map((m) => ({ id: m.id, label: m.label, color: COLOR[m.id], pts: years.map((y) => [y, m.at(y)] as [number, number]), dash: dashed(m.id) }))
  const last = census[census.length - 1].pop
  const gl = growthRates(census)
  const ranked = [...methods].sort((a, b) => a.at(target) - b.at(target))

  return (
    <div className="space-y-6">
      <Section title="Population forecaster" sub="Enter or roll census data, pick the year, and see what every method she teaches predicts, and why they disagree.">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(PRESETS) as Kind[]).map((k) => (
              <button
                key={k}
                className={'btn !py-1 !text-xs ' + (kind === k ? '!border-accent text-accent' : '')}
                onClick={() => {
                  setKind(k)
                  setPops(PRESETS[k].pops)
                }}
              >
                {PRESETS[k].label}
              </button>
            ))}
            <button
              className="btn !py-1 !px-3 !text-xs"
              onClick={() => {
                setSeed(seed + 1)
                setKind('mine')
                setPops(randomCensus(seed + 1))
              }}
            >
              🎲 Random city
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-line p-3">
            <span className="text-xs text-faint">census (thousands)</span>
            {YEARS.map((y, i) => (
              <NumIn
                key={y}
                label={y}
                value={pops[i]}
                step={1}
                w="w-20"
                onChange={(v) => {
                  setKind('mine')
                  setPops(pops.map((p, j) => (j === i ? (Number.isFinite(v) && v > 0 ? v : p) : p)))
                }}
              />
            ))}
          </div>
          <Slider label="Forecast to year" value={target} min={2025} max={2070} step={5} onChange={setTarget} />
          <div className="rounded-xl border border-line p-2 bg-bg/40">
            <LineChart
              series={series}
              dots={census.map((c) => ({ x: c.year, y: c.pop }))}
              xLabel="year"
              yLabel="population (thousands)"
              vline={{ x: 2020, label: 'last census' }}
              yMin={0}
            />
          </div>
          <Legend items={methods.map((m) => ({ id: m.id, label: m.label, color: COLOR[m.id] }))} on={Object.fromEntries(methods.map((m) => [m.id, !off[m.id]]))} toggle={(id) => setOff({ ...off, [id]: !off[id] })} />
          <p className="text-xs text-faint">Tap a name to hide or show its curve. Black dots are the census data.</p>
        </div>
      </Section>

      <div className="grid cq-lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-bold mb-2">Forecast for {target}</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-faint">
                <th className="py-1">Method</th>
                <th className="text-right">P ({target})</th>
                <th className="text-right">vs 2020</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((m) => (
                <tr key={m.id} className="border-t border-line/60">
                  <td className="py-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle" style={{ background: COLOR[m.id] }} />
                    {m.label}
                  </td>
                  <td className="num text-right font-semibold">{Math.round(m.at(target)).toLocaleString('en-US')}</td>
                  <td className="num text-right text-mute">{((m.at(target) / last - 1) * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-faint mt-2">
            Spread between lowest and highest: {Math.round(ranked[ranked.length - 1].at(target) - ranked[0].at(target)).toLocaleString('en-US')} thousand. In an exam the paper names the method, but this is why the choice matters.
          </p>
        </div>
        <div className="card p-4 space-y-2">
          <div className="font-bold">Which method suits which city?</div>
          {kind !== 'mine' && <p className="text-sm text-mute">{PRESETS[kind].blurb}</p>}
          {kind === 'mine' && <p className="text-sm text-mute">Your own data. Growth per decade: {gl.rates.map((r) => r.toFixed(0) + ' %').join(', ')}. Rates {gl.s > 0 ? 'falling (suits decreasing rate / logistic)' : 'rising or steady (suits geometric / arithmetic)'}.</p>}
          <ul className="text-sm space-y-1">
            {ALL_METHODS.filter((m) => ['arith', 'geom', 'decr', 'logi', 'parab'].includes(m.id)).map((m) => (
              <li key={m.id}>
                <b style={{ color: COLOR[m.id] }}>{m.label}.</b> <span className="text-mute">{SUITS[m.id]}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-faint">Her slides: short-term (1–10 yr) arithmetic, constant percentage, geometric, decreasing rate; long-term (10–50 yr) comparative graphical, ratio and logistic. Least squares is from the seniors’ notes.</p>
        </div>
      </div>

      <Callout kind="tip" title="Notice that…">
        With the Slide Ex-2 data the constant-percentage and geometric curves lie almost on top of each other (136,346 vs 136,342 in 2030). Switch to <b>New township</b> and the exponential methods leave the arithmetic line far behind by 2060. Switch to <b>Nearing saturation</b> and only the decreasing-rate curve and the logistic bend over. Turn on the parabola and drag the year out: it can curve away wildly beyond the data.
      </Callout>

      <Problems />
    </div>
  )
}
function dashed(id: MethodId) {
  return id === 'line' || id === 'incr' || id === 'logi'
}

// ================================================================ problems
type Fam = 'geom' | 'ls' | 'decr' | 'rate'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'geom', label: 'Geometric + arithmetic' },
  { v: 'ls', label: 'Least-squares parabola' },
  { v: 'decr', label: 'Decreasing rate' },
  { v: 'rate', label: 'Annual growth rate' },
]

interface PP extends XProblem<Fam> {
  c: Census[]
  targets: number[]
}

function make(seed: number, family?: Fam, level: Level = 'exam'): PP {
  const r = rng(seed * 6151 + 29)
  const fam = family ?? pick(r, ['geom', 'ls', 'decr', 'rate'] as Fam[])
  const unit = pick(r, ['thousand', 'thousand', 'million'] as const)
  const start = pick(r, [1970, 1980, 1990])
  const base = unit === 'thousand' ? randInt(r, 40, 120, 2) : randInt(r, 18, 40)
  if (fam === 'rate') {
    const a = base
    const b = +(a * (1.25 + r() * 0.5)).toFixed(1)
    const y1 = 2000 + randInt(r, 0, 10)
    const nyr = pick(r, [10, 20])
    const c = [{ year: y1, pop: a }, { year: y1 + nyr, pop: b }]
    const gr = annualGrowth(a, y1, b, y1 + nyr)
    const T = y1 + nyr + 20
    const P = b * Math.pow(1 + gr.geometric, 20)
    const steps: XStep[] = [
      { key: 'r', group: 'Annual growth rate', label: 'r (geometric)', value: gr.geometric * 100, unit: '% per year', digits: 3, abs: 0.02 },
      { key: 'p', group: `Population in ${T}`, label: `P(${T})`, value: P, unit: unit, digits: 1, tol: 0.015 },
    ]
    return {
      family: fam,
      level,
      title: 'Annual growth rate',
      text: `A city had ${a} ${unit} people in ${y1} and ${b} ${unit} in ${y1 + nyr}. What is its annual growth rate (uniform percentage, $P_f=P_p(1+r)^n$)? Hence estimate the population in ${T}.`,
      hash: hashKey(JSON.stringify([fam, a, b, y1, nyr])),
      steps,
      c,
      targets: [T],
    }
  }
  const pops: number[] = [base]
  const kind = level === 'basic' ? 'geo' : pick(r, ['geo', 'sat', 'mix'] as const)
  let rate = 0.12 + r() * 0.2
  for (let i = 1; i < 5; i++) {
    const prev = pops[i - 1]
    pops.push(+(prev * (1 + rate) * (1 + (r() - 0.5) * (level === 'tough' ? 0.1 : 0.04))).toFixed(1))
    if (kind === 'sat') rate -= 0.018 + r() * 0.015
    else if (kind === 'mix') rate += (r() - 0.35) * 0.08
  }
  const c: Census[] = pops.map((p, i) => ({ year: start + 10 * i, pop: p }))
  const lastY = c[4].year
  const targets = [lastY + 10, lastY + 20]
  if (fam === 'geom') {
    const gm = geometric(c, 'end')
    const K = (c[4].pop - c[0].pop) / (c[4].year - c[0].year)
    const steps: XStep[] = [
      { key: 'r', group: 'Geometric', label: 'r (first–last census)', value: gm.params.r * 100, unit: '% per year', digits: 3, abs: 0.02 },
      { key: 'g1', group: 'Geometric', label: `P(${targets[0]})`, value: gm.at(targets[0]), unit, digits: 1, tol: 0.012 },
      { key: 'g2', group: 'Geometric', label: `P(${targets[1]})`, value: gm.at(targets[1]), unit, digits: 1, tol: 0.012 },
      { key: 'K', group: 'Arithmetic', label: 'K (average rate)', value: K, unit: `${unit}/yr`, digits: 3, tol: 0.01 },
      { key: 'a2', group: 'Arithmetic', label: `P(${targets[1]})`, value: c[4].pop + K * (targets[1] - lastY), unit, digits: 1, tol: 0.01 },
    ]
    return { family: fam, level, title: 'Geometric and arithmetic forecast', text: `The census figures of a town (in ${unit}) were:\n\n${censusTable(c, unit)}\n\nForecast the population for ${targets[0]} and ${targets[1]} by the geometric increase method (rate from the first and last census, as in her slides) and for ${targets[1]} by the arithmetic method.`, hash: hashKey(JSON.stringify([fam, pops, start])), steps, c, targets }
  }
  if (fam === 'ls') {
    const f = polyFit(c, 2)
    const steps: XStep[] = [
      { key: 'sx2', group: 'Normal equations (x = (year − middle year)/10)', label: 'Σx²', value: 10, digits: 0, abs: 0.01 },
      { key: 'sx4', group: 'Normal equations (x = (year − middle year)/10)', label: 'Σx⁴', value: 34, digits: 0, abs: 0.01 },
      { key: 'b', group: 'Coefficients', label: 'b', value: f.coef[1], digits: 3, tol: 0.01, abs: 0.02 },
      { key: 'c', group: 'Coefficients', label: 'c', value: f.coef[2], digits: 3, tol: 0.01, abs: 0.02 },
      { key: 'a', group: 'Coefficients', label: 'a', value: f.coef[0], digits: 3, tol: 0.01, abs: 0.02 },
      { key: 'p1', group: 'Forecast', label: `P(${targets[0]})`, value: f.at(targets[0]), unit, digits: 1, tol: 0.012 },
      { key: 'p2', group: 'Forecast', label: `P(${targets[1]})`, value: f.at(targets[1]), unit, digits: 1, tol: 0.012 },
    ]
    return { family: fam, level, title: 'Least-squares parabola', text: `Census figures of a city (${unit}):\n\n${censusTable(c, unit)}\n\nEstimate the population for ${targets[0]} and ${targets[1]} by the least-squares parabola method $Y=a+bx+cx^2$ with the year coded about ${c[2].year} (so $x=-2,-1,0,1,2$).`, hash: hashKey(JSON.stringify([fam, pops, start])), steps, c, targets }
  }
  // decreasing
  const gr = growthRates(c)
  const dm = decreasing(c)
  const stp = dm.steps(targets[1])
  const steps: XStep[] = [
    { key: 'rl', group: 'Growth rates', label: `latest rate (${c[3].year}–${lastY})`, value: gr.rates[3], unit: '%', digits: 2, abs: 0.05 },
    { key: 's', group: 'Average decrease s', label: 's', value: gr.s, unit: '% per decade', digits: 2, abs: 0.05 },
    { key: 'p1', group: 'Forecast', label: `P(${targets[0]})`, value: stp[0].pop, unit, digits: 1, tol: 0.012 },
    { key: 'p2', group: 'Forecast', label: `P(${targets[1]})`, value: stp[1].pop, unit, digits: 1, tol: 0.012 },
  ]
  return { family: fam, level, title: 'Decreasing rate of growth', text: `Census figures of a city (${unit}):\n\n${censusTable(c, unit)}\n\nEstimate the population for ${targets[0]} and ${targets[1]} by the decreasing rate of growth method. (Her convention: decrease positive, so a rising growth rate gives a negative $s$.)`, hash: hashKey(JSON.stringify([fam, pops, start])), steps, c, targets }
}

function Solution({ p }: { p: PP }) {
  const unit = /million/.test(p.text) ? 'million' : 'thousand'
  let md = ''
  let curves: PopCurve[] = []
  if (p.family === 'geom') {
    const a = geomMd(p.c, p.targets, unit, 1)
    const K = (p.c[4].pop - p.c[0].pop) / (p.c[4].year - p.c[0].year)
    md = a.md + `\n\n**Arithmetic:** $K=\\dfrac{P_{${p.c[4].year}}-P_{${p.c[0].year}}}{${p.c[4].year - p.c[0].year}}=\\dfrac{${p.c[4].pop}-${p.c[0].pop}}{${p.c[4].year - p.c[0].year}}=${K.toFixed(3)}$ ${unit}/yr (the same as the mean of the four decade increases ÷ 10), $P_{${p.targets[1]}}=${p.c[4].pop}+${K.toFixed(3)}\\times${p.targets[1] - p.c[4].year}=${(p.c[4].pop + K * (p.targets[1] - p.c[4].year)).toFixed(1)}$ ${unit}.`
    curves = [{ label: 'geometric', at: a.m.at }, { label: 'arithmetic', at: arithmetic(p.c).at, dash: true }]
  } else if (p.family === 'ls') {
    const l = lsMd(p.c, p.targets, unit, 1)
    md = l.md
    curves = [{ label: 'least-squares parabola', at: l.f.at }]
  } else if (p.family === 'decr') {
    const dm = decrMd(p.c, p.targets, unit, 1)
    md = dm.md
    curves = [{ label: 'decreasing rate of growth', at: dm.m.at }]
  } else {
    const [a, b] = p.c
    const gr = annualGrowth(a.pop, a.year, b.pop, b.year)
    md = `1. $${b.pop}=${a.pop}(1+r)^{${gr.n}}$, so $r=\\left(\\dfrac{${b.pop}}{${a.pop}}\\right)^{1/${gr.n}}-1=${(b.pop / a.pop).toFixed(4)}^{${(1 / gr.n).toFixed(3)}}-1=${gr.geometric.toFixed(5)}$ → **${(gr.geometric * 100).toFixed(3)} %** per year.\n\n2. ${p.targets[0]} is ${p.targets[0] - b.year} years after ${b.year}: $P_{${p.targets[0]}}=${b.pop}(1+${gr.geometric.toFixed(5)})^{${p.targets[0] - b.year}}=$ **${(b.pop * Math.pow(1 + gr.geometric, 20)).toFixed(1)}** ${unit}.`
    curves = [{ label: 'geometric, (1 + r)ⁿ', at: geometric(p.c, 'end').at }]
  }
  return (
    <div className="space-y-2">
      <Md className="text-sm">{md}</Md>
      {curves.length > 0 && <PopWorkChart c={p.c} curves={curves} targets={p.targets} unit={unit} />}
    </div>
  )
}

function Problems() {
  return <ExamProblems<Fam, PP> topic="ev-pop:lab" families={FAMS} make={make} solution={(p) => <Solution p={p} />} initialSeed={4} />
}
