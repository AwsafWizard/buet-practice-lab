// Worked population forecast, drawn: the census points, the fitted curve of each method used, and the forecast points
// marked with their values. Curves come from the population engine (Method.at / PolyFit.at), so the picture always
// matches the numbers in the solution.
import type { Census } from '../engine/population'
import { LineChart, type Dot, type Series } from './pop-chart'

export interface PopCurve {
  label: string
  at: (year: number) => number
  color?: string
  dash?: boolean
}

const COLS = ['var(--c-accent)', 'var(--c-load)', 'var(--c-water)']
const short = (v: number) => String(+v.toPrecision(4))

export function PopWorkChart({ c, curves, targets, unit }: { c: Census[]; curves: PopCurve[]; targets: number[]; unit: string }) {
  const y0 = c[0].year
  const yEnd = Math.max(...targets, c[c.length - 1].year)
  const yrs: number[] = []
  for (let k = 0; k <= 60; k++) yrs.push(y0 + ((yEnd - y0) * k) / 60)
  const series: Series[] = curves.map((m, i) => ({ id: m.label, label: m.label, color: m.color ?? COLS[i % COLS.length], dash: m.dash, pts: yrs.map((t) => [t, m.at(t)] as [number, number]) }))
  const dots: Dot[] = [
    ...c.map((p) => ({ x: p.year, y: p.pop })),
    ...curves.flatMap((m, i) => targets.map((T) => ({ x: T, y: m.at(T), color: m.color ?? COLS[i % COLS.length], label: short(m.at(T)) }))),
  ]
  return (
    <div className="rounded-xl border border-line bg-panel2/40 p-2">
      <LineChart series={series} dots={dots} xLabel="year" yLabel={`population (${unit})`} vline={{ x: c[c.length - 1].year, label: 'last census' }} yMin={0} />
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-faint mt-1">
        {curves.map((m, i) => (
          <span key={m.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-1.5 rounded" style={{ background: m.color ?? COLS[i % COLS.length] }} />
            {m.label}
          </span>
        ))}
        <span>Black dots: census. Coloured dots: the forecasts for {targets.join(' and ')}, labelled with their value.</span>
      </div>
    </div>
  )
}
