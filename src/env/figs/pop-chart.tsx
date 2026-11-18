// A small multi-series line chart with theme colours (population curves, fire-flow curves). Axis ticks are "nice" numbers.
export interface Series {
  id: string
  label: string
  color: string
  pts: [number, number][]
  dash?: boolean
  width?: number
}
export interface Dot {
  x: number
  y: number
  color?: string
  label?: string
}

export const SERIES_COLORS = ['var(--c-accent)', 'var(--c-water)', 'var(--c-load)', 'var(--c-good)', 'var(--c-bad)', 'var(--c-soil)', 'var(--c-accent2)', 'var(--c-sn)']

function niceStep(span: number, ticks: number) {
  const raw = span / ticks
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
}
const short = (v: number) => (Math.abs(v) >= 1e6 ? +(v / 1e6).toFixed(2) + 'M' : Math.abs(v) >= 1e4 ? +(v / 1e3).toFixed(1) + 'k' : String(+v.toPrecision(4)))

export function LineChart({ series, dots = [], xLabel, yLabel, vline, fmtY = short, yMin }: { series: Series[]; dots?: Dot[]; xLabel?: string; yLabel?: string; vline?: { x: number; label: string }; fmtY?: (v: number) => string; yMin?: number }) {
  const W = 560
  const H = 300
  const ml = 52
  const mr = 12
  const mt = 14
  const mb = 38
  const all = series.flatMap((s) => s.pts).concat(dots.map((d) => [d.x, d.y] as [number, number])).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
  if (!all.length) return null
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const ylo = yMin ?? Math.min(0, ...ys)
  const yhi = Math.max(...ys) * 1.05 || 1
  const sx = (x: number) => ml + ((x - x0) / (x1 - x0 || 1)) * (W - ml - mr)
  const sy = (y: number) => H - mb - ((y - ylo) / (yhi - ylo || 1)) * (H - mb - mt)
  const xt = niceStep(x1 - x0, 6)
  const yt = niceStep(yhi - ylo, 5)
  const xticks: number[] = []
  for (let v = Math.ceil(x0 / xt) * xt; v <= x1 + 1e-9; v += xt) xticks.push(v)
  const yticks: number[] = []
  for (let v = Math.ceil(ylo / yt) * yt; v <= yhi + 1e-9; v += yt) yticks.push(v)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}>
      {yticks.map((v) => (
        <g key={'y' + v}>
          <line x1={ml} x2={W - mr} y1={sy(v)} y2={sy(v)} stroke="var(--c-line)" strokeWidth="1" />
          <text x={ml - 6} y={sy(v) + 4} textAnchor="end" fontSize="12" fill="var(--c-mute)">
            {fmtY(v)}
          </text>
        </g>
      ))}
      {xticks.map((v) => (
        <g key={'x' + v}>
          <line x1={sx(v)} x2={sx(v)} y1={H - mb} y2={H - mb + 4} stroke="var(--c-mute)" />
          <text x={sx(v)} y={H - mb + 17} textAnchor="middle" fontSize="12" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      <line x1={ml} x2={W - mr} y1={H - mb} y2={H - mb} stroke="var(--c-mute)" />
      <line x1={ml} x2={ml} y1={mt} y2={H - mb} stroke="var(--c-mute)" />
      {xLabel && (
        <text x={(ml + W - mr) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="var(--c-mute)">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={12} y={mt + 2} fontSize="12" fill="var(--c-mute)" transform={`rotate(-90 12 ${mt + 2})`} textAnchor="end">
          {yLabel}
        </text>
      )}
      {vline && (
        <g>
          <line x1={sx(vline.x)} x2={sx(vline.x)} y1={mt} y2={H - mb} stroke="var(--c-faint)" strokeDasharray="4 4" />
          <text x={sx(vline.x) + 4} y={mt + 12} fontSize="12" fill="var(--c-mute)">
            {vline.label}
          </text>
        </g>
      )}
      {series.map((s) => (
        <path key={s.id} d={s.pts.filter(([x, y]) => Number.isFinite(y)).map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash ? '6 4' : undefined} />
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={sx(d.x)} cy={sy(d.y)} r="4.5" fill={d.color ?? 'var(--c-ink)'} stroke="var(--c-panel)" strokeWidth="1.5" />
          {d.label && (
            <text x={sx(d.x) + 7} y={sy(d.y) - 7} fontSize="12" fill="var(--c-ink)">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

export function Legend({ items, on, toggle }: { items: { id: string; label: string; color: string }[]; on?: Record<string, boolean>; toggle?: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {items.map((it) => {
        const active = on ? on[it.id] !== false : true
        return (
          <button key={it.id} type="button" onClick={() => toggle?.(it.id)} className={'inline-flex items-center gap-1.5 ' + (active ? '' : 'opacity-40')} disabled={!toggle}>
            <span className="inline-block w-3 h-1.5 rounded" style={{ background: it.color }} />
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
