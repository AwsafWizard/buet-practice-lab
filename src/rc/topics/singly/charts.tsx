// φ vs net tensile strain εt (ACI 21.2.2, Grade 60) with an optional beam point; strain profiles at the limits.

import { tipAxes } from '../../../components/PointTip'
import { phiFlex } from '../../engine/materials'

export function PhiChart({ epsT, fy = 60000, label }: { epsT?: number; fy?: number; label?: string }) {
  const W = 420,
    H = 210,
    L = 44,
    R = 14,
    T = 16,
    B = 40
  const xMax = 0.008
  const X = (e: number) => L + (Math.min(e, xMax) / xMax) * (W - L - R)
  const Y = (p: number) => T + ((0.95 - p) / (0.95 - 0.6)) * (H - T - B)
  const ey = fy / 29e6
  const pts = Array.from({ length: 81 }, (_, i) => (xMax * i) / 80)
  const path = pts.map((e, i) => `${i ? 'L' : 'M'}${X(e)},${Y(phiFlex(e, fy))}`).join(' ')
  const spiral = pts.map((e, i) => `${i ? 'L' : 'M'}${X(e)},${Y(e >= 0.005 ? 0.9 : e <= ey ? 0.75 : 0.75 + (0.15 * (e - ey)) / (0.005 - ey))}`).join(' ')
  const p = epsT !== undefined ? phiFlex(epsT, fy) : undefined
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-md" {...tipAxes({ X, Y, xAt: [0, xMax], x: 'εt', y: 'φ' })}>
      <rect x={X(0)} y={T} width={X(ey) - X(0)} height={H - T - B} fill="var(--c-bad)" fillOpacity={0.08} />
      <rect x={X(ey)} y={T} width={X(0.005) - X(ey)} height={H - T - B} fill="var(--c-load)" fillOpacity={0.08} />
      <rect x={X(0.005)} y={T} width={X(xMax) - X(0.005)} height={H - T - B} fill="var(--c-good)" fillOpacity={0.08} />
      <rect x={X(0.004)} y={T} width={1.5} height={H - T - B} fill="var(--c-mute)" fillOpacity={0.6} />
      <text x={X(0.004) + 3} y={T + 10} fontSize={9} fill="var(--c-mute)">
        beams: εt ≥ 0.004
      </text>
      {[0.65, 0.75, 0.9].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--c-line)" strokeDasharray="2 3" />
          <text x={L - 4} y={Y(v) + 3.5} fontSize={10} textAnchor="end" className="num" fill="var(--c-mute)">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      {[0, ey, 0.004, 0.005, 0.008].map((e) => (
        <text key={e} x={X(e)} y={H - B + 13} fontSize={9.5} textAnchor="middle" className="num" fill="var(--c-mute)">
          {e === ey ? 'εy' : e.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}
        </text>
      ))}
      <text x={(L + W) / 2} y={H - 6} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
        net tensile strain εt
      </text>
      <text x={12} y={(T + H - B) / 2} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 12 ${(T + H - B) / 2})`}>
        φ
      </text>
      <path d={spiral} fill="none" stroke="var(--c-mute)" strokeDasharray="5 3" strokeWidth={1.4} data-name="spiral" />
      <path d={path} fill="none" stroke="var(--c-accent)" strokeWidth={2.4} data-name="tied / other" />
      <text x={X(0.0004)} y={Y(0.65) - 5} fontSize={9.5} fill="var(--c-bad)">
        compression-controlled
      </text>
      <text x={X(0.0055)} y={Y(0.9) + 13} fontSize={9.5} fill="var(--c-good)">
        tension-controlled
      </text>
      <text x={X(0.00215)} y={Y(0.75) - 22} fontSize={9.5} fill="var(--c-load)">
        transition
      </text>
      <text x={X(0.0004)} y={Y(0.75) - 4} fontSize={9} fill="var(--c-mute)">
        spiral 0.75
      </text>
      {p !== undefined && epsT !== undefined && (
        <g>
          <line x1={X(epsT)} x2={X(epsT)} y1={Y(p)} y2={H - B} stroke="var(--c-ink)" strokeDasharray="3 3" />
          <circle cx={X(epsT)} cy={Y(p)} r={5} fill="var(--c-ink)" stroke="var(--c-bg)" strokeWidth={1.5} data-tip={`${label && !label.startsWith('ε') ? label + ': ' : ''}εt = ${epsT.toFixed(5)}, φ = ${p.toFixed(3)}`} />
          <text x={X(epsT) + (epsT > 0.0038 ? -8 : 8)} y={Y(p) + (p > 0.85 ? 18 : -8)} fontSize={10.5} textAnchor={epsT > 0.0038 ? 'end' : 'start'} className="num" fill="var(--c-ink)" fontWeight={700}>
            {label ?? 'beam'}: εt = {epsT.toFixed(4)}, φ = {p.toFixed(3)}
            {epsT > xMax ? ' →' : ''}
          </text>
        </g>
      )}
    </svg>
  )
}

/** strain profiles for c/dt = 0.375, 0.429 (εt = 0.004) and 0.600 */
export function StrainLimits() {
  const W = 360,
    H = 170,
    top = 18,
    dt = 130
  const X0 = 150
  const S = 6000 // px per unit strain
  const lines = [
    { c: 0.375, e: 0.005, col: 'var(--c-good)', lab: 'c/dt = 0.375 → εt = 0.005' },
    { c: 0.429, e: 0.004, col: 'var(--c-load)', lab: 'c/dt = 0.429 → εt = 0.004' },
    { c: 0.6, e: 0.002, col: 'var(--c-bad)', lab: 'c/dt = 0.600 → εt = 0.002' },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-sm">
      <line x1={X0} x2={X0} y1={top} y2={top + dt + 6} stroke="var(--c-mute)" />
      <line x1={X0 - 30 * 0.6} x2={X0 + 0.003 * S} y1={top} y2={top} stroke="var(--c-mute)" />
      <text x={X0 + 0.003 * S} y={top - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        εu = 0.003
      </text>
      {lines.map((l, i) => (
        <g key={i}>
          <line x1={X0 + 0.003 * S} y1={top} x2={X0 - l.e * S * 0.36} y2={top + dt} stroke={l.col} strokeWidth={1.8} />
          <circle cx={X0} cy={top + l.c * dt} r={2.5} fill={l.col} data-tip={l.lab} />
          <text x={8} y={top + 60 + i * 16} fontSize={10} fill={l.col}>
            {l.lab}
          </text>
        </g>
      ))}
      <text x={X0 + 4} y={top + dt + 12} fontSize={9.5} fill="var(--c-mute)">
        depth dt (εt drawn ×0.36)
      </text>
    </svg>
  )
}
