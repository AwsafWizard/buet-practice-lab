// Gradation chart: % finer against grain size (log axis), with D10 / D30 / D60 read-off lines. Theme tokens only.
import type { CurvePoint } from '../engine/dtw'

export interface GradCurve {
  label: string
  pts: CurvePoint[]
  color?: string
  dashed?: boolean
}

export function GradChart({ curves, reads = [10, 30, 60], xmin = 0.01, xmax = 10, mark }: { curves: GradCurve[]; reads?: number[]; xmin?: number; xmax?: number; mark?: { size: number; finer: number; label: string }[] }) {
  const W = 520
  const H = 300
  const L = 44
  const R = 14
  const T = 14
  const B = 40
  const X = (s: number) => L + ((Math.log10(s) - Math.log10(xmin)) / (Math.log10(xmax) - Math.log10(xmin))) * (W - L - R)
  const Y = (p: number) => T + (1 - p / 100) * (H - T - B)
  const decades: number[] = []
  for (let v = xmin; v <= xmax * 1.0001; v *= 10) decades.push(v)
  const cols = ['var(--c-accent)', 'var(--c-load)', 'var(--c-accent2)']
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="gradation chart" style={{ maxWidth: 600 }}>
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="var(--c-panel)" stroke="var(--c-line)" />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
        <g key={p}>
          <line x1={L} y1={Y(p)} x2={W - R} y2={Y(p)} stroke="var(--c-line)" strokeWidth={reads.includes(p) ? 0.4 : 0.6} opacity={0.7} />
          <text x={L - 5} y={Y(p) + 4} textAnchor="end" fontSize="11" fill="var(--c-mute)">
            {p}
          </text>
        </g>
      ))}
      {decades.flatMap((v) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => ({ v: v * m, major: m === 1 }))).filter((t) => t.v <= xmax * 1.0001).map((t) => (
        <g key={t.v}>
          <line x1={X(t.v)} y1={T} x2={X(t.v)} y2={H - B} stroke="var(--c-line)" strokeWidth={t.major ? 0.9 : 0.4} />
          {t.major && (
            <text x={X(t.v)} y={H - B + 14} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
              {t.v < 1 ? t.v : Math.round(t.v)}
            </text>
          )}
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
        sieve size (mm, log)
      </text>
      <text x={11} y={(T + H - B) / 2} textAnchor="middle" fontSize="11" fill="var(--c-mute)" transform={`rotate(-90 11 ${(T + H - B) / 2})`}>
        % finer
      </text>
      {curves.map((c, i) => {
        const col = c.color ?? cols[i % cols.length]
        const pts = [...c.pts].sort((a, b) => a.size - b.size).filter((p) => p.size >= xmin && p.size <= xmax)
        return (
          <g key={c.label}>
            <polyline points={pts.map((p) => `${X(p.size)},${Y(p.finer)}`).join(' ')} fill="none" stroke={col} strokeWidth="2.2" strokeDasharray={c.dashed ? '6 4' : undefined} />
            {!c.dashed && pts.map((p, k) => <circle key={k} cx={X(p.size)} cy={Y(p.finer)} r="2.6" fill={col} />)}
            <text x={W - R - 6} y={T + 14 + i * 14} textAnchor="end" fontSize="11" fill={col}>
              {c.label}
            </text>
          </g>
        )
      })}
      {mark?.map((m) => {
        // label sits on its own reading line, just left of the point (falls back to the right if there is no room)
        const room = X(m.size) - L > 7 * m.label.length + 10
        return (
          <g key={m.label}>
            <line x1={L} y1={Y(m.finer)} x2={X(m.size)} y2={Y(m.finer)} stroke="var(--c-ink)" strokeDasharray="3 3" strokeWidth="1" />
            <line x1={X(m.size)} y1={Y(m.finer)} x2={X(m.size)} y2={H - B} stroke="var(--c-ink)" strokeDasharray="3 3" strokeWidth="1" />
            <circle cx={X(m.size)} cy={Y(m.finer)} r="3.5" fill="var(--c-bad)" />
            <text x={room ? X(m.size) - 6 : X(m.size) + 6} y={Y(m.finer) - 5} textAnchor={room ? 'end' : 'start'} fontSize="11" fill="var(--c-ink)">
              {m.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
