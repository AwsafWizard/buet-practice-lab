// Rainwater charts: monthly harvest against demand, and the mass curve with the storage marked.
import { fmt } from '../../components/DiagramView'
import { MONTHS, type MassRow } from '../engine/rwh'
import { LineChart } from './pump-chart'

/** monthly bars (rainfall or harvest) with the demand line */
export function RwhBars({ harvest, demand, unit = 'm³' }: { harvest: number[]; demand: number; unit?: string }) {
  const W = 620
  const H = 230
  const m = { l: 48, r: 12, t: 14, b: 30 }
  const pw = W - m.l - m.r
  const ph = H - m.t - m.b
  const mx = Math.max(demand * 1.1, ...harvest) * 1.08 || 1
  const Y = (v: number) => m.t + ph - (v / mx) * ph
  const bw = pw / 12
  const st = Math.pow(10, Math.floor(Math.log10(mx / 4)))
  const step = [1, 2, 5, 10].map((f) => f * st).find((s) => mx / s <= 5) ?? st * 10
  const tk: number[] = []
  for (let v = 0; v <= mx; v += step) tk.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}>
      <rect x={m.l} y={m.t} width={pw} height={ph} fill="var(--c-panel)" stroke="var(--c-line)" />
      {tk.map((v) => (
        <g key={v}>
          <line x1={m.l} x2={m.l + pw} y1={Y(v)} y2={Y(v)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={m.l - 5} y={Y(v) + 4} textAnchor="end" fontSize={11} fill="var(--c-mute)">
            {fmt(v, 0)}
          </text>
        </g>
      ))}
      {harvest.map((v, i) => {
        const surplus = v >= demand
        return (
          <g key={i}>
            <rect x={m.l + i * bw + bw * 0.16} y={Y(v)} width={bw * 0.68} height={Math.max(0, Y(0) - Y(v))} fill={surplus ? 'var(--c-water)' : 'var(--c-load)'} opacity={0.8} />
            <text x={m.l + i * bw + bw / 2} y={H - 12} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
              {MONTHS[i]}
            </text>
          </g>
        )
      })}
      <line x1={m.l} x2={m.l + pw} y1={Y(demand)} y2={Y(demand)} stroke="var(--c-bad)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={m.l + pw - 4} y={Y(demand) - 5} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--c-bad)">
        demand {fmt(demand, 1)} {unit}/month
      </text>
      <text transform={`translate(12 ${m.t + ph / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        harvest ({unit})
      </text>
    </svg>
  )
}

/** mass curve: cumulative harvest and cumulative demand, the largest gap is the tank */
export function MassCurve({ rows, tank, unit = 'm³', height = 280 }: { rows: MassRow[]; tank: number; unit?: string; height?: number }) {
  const hs = rows.map((r, i) => [i + 1, r.cumHarvest] as [number, number])
  const ds = rows.map((r, i) => [i + 1, r.cumDemand] as [number, number])
  const mx = Math.max(...hs.map((p) => p[1]), ...ds.map((p) => p[1])) * 1.05 || 1
  // widest vertical gap where harvest is above demand, and the deficit run after it
  let gi = 0
  rows.forEach((r, i) => {
    if (r.diff > rows[gi].diff) gi = i
  })
  const marks = [{ x: gi + 1, y: rows[gi].cumHarvest, label: `largest gap ${fmt(rows[gi].diff, 2)} ${unit}${tank > 0 ? ` = tank ${fmt(tank, 2)}` : ''}`, color: 'var(--c-load)', dx: -110, dy: -10 }]
  return (
    <LineChart
      series={[
        { pts: [[0, 0], ...hs], color: 'var(--c-water)', label: 'cumulative harvest' },
        { pts: [[0, 0], ...ds], color: 'var(--c-bad)', label: 'cumulative demand', dash: '6 4' },
      ]}
      xmax={12}
      ymax={mx}
      xlabel={`months from ${rows[0].month}`}
      ylabel={`volume (${unit})`}
      xticks={rows.map((r, i) => ({ x: i + 1, label: r.month }))}
      marks={marks}
      height={height}
    />
  )
}
