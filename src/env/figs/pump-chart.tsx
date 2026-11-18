// A small line chart for pump curves, mass curves and pressure traces (theme tokens only; works at phone width).
import type { ReactNode } from 'react'

export interface Series {
  pts: [number, number][]
  color: string
  label?: string
  dash?: string
  width?: number
  /** plotted against the right axis (scale 0 to y2max) */
  right?: boolean
  /** draw as filled bars instead of a line */
  bars?: boolean
}
export interface Mark {
  x: number
  y: number
  label?: string
  color?: string
  right?: boolean
  dx?: number
  dy?: number
}

function ticks(max: number, n = 5) {
  const raw = max / n
  const p = 10 ** Math.floor(Math.log10(raw))
  const f = raw / p
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p
  const out: number[] = []
  for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toFixed(10))
  return { out, step }
}
const nf = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? String(Math.round(v * 100) / 100) : v.toPrecision(2).replace(/\.?0+$/, ''))

export function LineChart({
  series, xmax, ymax, xmin = 0, ymin = 0, y2max, xlabel, ylabel, y2label, marks = [], vlines = [], hlines = [], height = 280, xticks, children, legend = true,
}: {
  series: Series[]
  xmax: number
  ymax: number
  xmin?: number
  ymin?: number
  y2max?: number
  xlabel?: string
  ylabel?: string
  y2label?: string
  marks?: Mark[]
  vlines?: { x: number; label?: string; color?: string }[]
  hlines?: { y: number; label?: string; color?: string }[]
  height?: number
  xticks?: { x: number; label: string }[]
  children?: ReactNode
  legend?: boolean
}) {
  const W = 620
  const H = height
  const m = { l: 52, r: y2max ? 48 : 16, t: 14, b: 40 }
  const pw = W - m.l - m.r
  const ph = H - m.t - m.b
  const X = (x: number) => m.l + ((x - xmin) / (xmax - xmin)) * pw
  const Y = (y: number) => m.t + ph - ((y - ymin) / (ymax - ymin)) * ph
  const Y2 = (y: number) => m.t + ph - (y / (y2max || 1)) * ph
  const ty = ticks(ymax - ymin)
  const tx = ticks(xmax - xmin)
  const path = (s: Series) => s.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${(s.right ? Y2(y) : Y(y)).toFixed(1)}`).join(' ')
  const leg = legend ? series.filter((s) => s.label) : []
  return (
    <div>
      {leg.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-1 px-1">
          {leg.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <svg width="20" height="8" aria-hidden>
                <line x1="0" x2="20" y1="4" y2="4" stroke={s.color} strokeWidth={3} strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      )}
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }}>
      <rect x={m.l} y={m.t} width={pw} height={ph} fill="var(--c-panel)" stroke="var(--c-line)" />
      {ty.out.map((v) => (
        <g key={'y' + v}>
          <line x1={m.l} x2={m.l + pw} y1={Y(v + ymin)} y2={Y(v + ymin)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={m.l - 6} y={Y(v + ymin) + 4} textAnchor="end" fontSize={11} fill="var(--c-mute)">
            {nf(v + ymin)}
          </text>
        </g>
      ))}
      {(xticks ?? tx.out.map((v) => ({ x: v + xmin, label: nf(v + xmin) }))).map((t) => (
        <g key={'x' + t.x}>
          <line x1={X(t.x)} x2={X(t.x)} y1={m.t + ph} y2={m.t + ph + 4} stroke="var(--c-mute)" />
          <text x={X(t.x)} y={m.t + ph + 16} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
            {t.label}
          </text>
        </g>
      ))}
      {y2max &&
        ticks(y2max).out.map((v) => (
          <text key={'r' + v} x={m.l + pw + 6} y={Y2(v) + 4} fontSize={11} fill="var(--c-mute)">
            {nf(v)}
          </text>
        ))}
      {xlabel && (
        <text x={m.l + pw / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
          {xlabel}
        </text>
      )}
      {ylabel && (
        <text transform={`translate(13 ${m.t + ph / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
          {ylabel}
        </text>
      )}
      {y2label && (
        <text transform={`translate(${W - 8} ${m.t + ph / 2}) rotate(90)`} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
          {y2label}
        </text>
      )}
      {hlines.map((h, i) => (
        <g key={'h' + i}>
          <line x1={m.l} x2={m.l + pw} y1={Y(h.y)} y2={Y(h.y)} stroke={h.color ?? 'var(--c-faint)'} strokeDasharray="5 4" />
          {h.label && (
            <text x={m.l + pw - 4} y={Y(h.y) - 4} textAnchor="end" fontSize={11} fill={h.color ?? 'var(--c-mute)'}>
              {h.label}
            </text>
          )}
        </g>
      ))}
      {vlines.map((v, i) => (
        <g key={'v' + i}>
          <line x1={X(v.x)} x2={X(v.x)} y1={m.t} y2={m.t + ph} stroke={v.color ?? 'var(--c-faint)'} strokeDasharray="5 4" />
          {v.label && (
            <text x={X(v.x) + 3} y={m.t + 11} fontSize={11} fill={v.color ?? 'var(--c-mute)'}>
              {v.label}
            </text>
          )}
        </g>
      ))}
      {series.map((s, i) =>
        s.bars ? (
          <g key={i}>
            {s.pts.map(([x, y], k) => {
              const bw = (pw / (xmax - xmin)) * 0.34
              return <rect key={k} x={X(x) - bw / 2} y={Y(y)} width={bw} height={Math.max(0, Y(0) - Y(y))} fill={s.color} opacity={0.8} />
            })}
          </g>
        ) : (
          <path key={i} d={path(s)} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.2} strokeDasharray={s.dash} strokeLinejoin="round" />
        ),
      )}
      {children}
      {marks.map((k, i) => (
        <g key={'m' + i}>
          <circle cx={X(k.x)} cy={k.right ? Y2(k.y) : Y(k.y)} r={4.5} fill={k.color ?? 'var(--c-load)'} stroke="var(--c-panel)" strokeWidth={1.5} />
          {k.label && (
            <text x={X(k.x) + (k.dx ?? 8)} y={(k.right ? Y2(k.y) : Y(k.y)) + (k.dy ?? -8)} fontSize={11} fontWeight={700} fill={k.color ?? 'var(--c-load)'}>
              {k.label}
            </text>
          )}
        </g>
      ))}
    </svg>
    </div>
  )
}
