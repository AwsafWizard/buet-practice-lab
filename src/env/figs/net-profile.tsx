// Pressure along each path of a branched network: one coloured line per terminal, the required-pressure threshold dashed.
import { pressureProfile, type TreeResult } from '../engine/network'

export function PressureProfile({ res, selected }: { res: TreeResult; selected?: string }) {
  const W = 520
  const H = 220
  const L = 44
  const R = 14
  const T = 14
  const B = 34
  const lines = res.terminals.map((t) => pressureProfile(res, t.node))
  const dmax = Math.max(1, ...lines.map((l) => l[l.length - 1].dist))
  const pmax = Math.max(res.startPsi, res.minPsi) * 1.06
  const pmin = Math.max(0, Math.min(res.minPsi, ...res.terminals.map((t) => t.p)) * 0.8)
  const X = (d: number) => L + (d / dmax) * (W - L - R)
  const Y = (p: number) => T + (1 - (p - pmin) / (pmax - pmin)) * (H - T - B)
  const cols = ['var(--c-accent)', 'var(--c-accent2)', 'var(--c-load)', 'var(--c-good)', 'var(--c-sn)']
  const ticksP = 4
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="pressure along the branches" style={{ maxWidth: 600 }}>
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="var(--c-panel)" stroke="var(--c-line)" />
      {Array.from({ length: ticksP + 1 }, (_, i) => pmin + ((pmax - pmin) * i) / ticksP).map((p) => (
        <g key={p}>
          <line x1={L} y1={Y(p)} x2={W - R} y2={Y(p)} stroke="var(--c-line)" strokeWidth="0.6" />
          <text x={L - 5} y={Y(p) + 4} textAnchor="end" fontSize="11" fill="var(--c-mute)">
            {Math.round(p * 10) / 10}
          </text>
        </g>
      ))}
      <rect x={L} y={Y(res.minPsi)} width={W - L - R} height={H - B - Y(res.minPsi)} fill="var(--c-bad)" opacity={0.08} />
      <line x1={L} y1={Y(res.minPsi)} x2={W - R} y2={Y(res.minPsi)} stroke="var(--c-bad)" strokeDasharray="6 4" strokeWidth="1.6" />
      <text x={W - R - 4} y={Y(res.minPsi) - 5} textAnchor="end" fontSize="11" fill="var(--c-bad)">
        required {res.minPsi} psi
      </text>
      {lines.map((ln, i) => {
        const t = res.terminals[i]
        const dim = selected && selected !== t.node
        const col = t.ok ? cols[i % cols.length] : 'var(--c-bad)'
        return (
          <g key={t.node} opacity={dim ? 0.3 : 1}>
            <polyline points={ln.map((p) => `${X(p.dist)},${Y(p.p)}`).join(' ')} fill="none" stroke={col} strokeWidth="2.4" />
            {ln.map((p, k) => (
              <circle key={k} cx={X(p.dist)} cy={Y(p.p)} r="3" fill={col} />
            ))}
            <text x={X(ln[ln.length - 1].dist) - 4} y={Y(ln[ln.length - 1].p) - 8} textAnchor="end" fontSize="11" fill={col} fontWeight="700">
              {t.node}: {Math.round(t.p * 10) / 10}
            </text>
          </g>
        )
      })}
      <text x={(L + W - R) / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
        distance from the reservoir along the path (ft)
      </text>
      <text x={11} y={(T + H - B) / 2} textAnchor="middle" fontSize="11" fill="var(--c-mute)" transform={`rotate(-90 11 ${(T + H - B) / 2})`}>
        psi
      </text>
    </svg>
  )
}
