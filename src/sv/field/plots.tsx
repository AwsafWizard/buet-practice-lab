// Drawings for the field sheets: plan frame (north up, scale bar, north arrow), longitudinal profile, cross-section.
import type { ReactNode } from 'react'

export interface Pt {
  e: number
  n: number
}

/** a "nice" round length for a scale bar about a fifth of the drawing */
export function niceLen(span: number) {
  const raw = span / 5
  const p = 10 ** Math.floor(Math.log10(raw || 1))
  const m = raw / p
  return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p
}

/**
 * Plan view: give it every point that must fit; children get `X(e)`, `Y(n)` (north up) and the pixel scale.
 */
export function PlanFrame({ pts, unit = 'm', height = 380, children, pad = 0.12, north = true }: { pts: Pt[]; unit?: string; height?: number; pad?: number; north?: boolean; children: (t: { X: (e: number) => number; Y: (n: number) => number; k: number }) => ReactNode }) {
  const ok = pts.filter((p) => isFinite(p.e) && isFinite(p.n))
  if (!ok.length) return <div className="text-sm text-faint p-6 text-center border border-dashed border-line rounded-xl">Fill in the sheet to see the drawing.</div>
  let minE = Math.min(...ok.map((p) => p.e)),
    maxE = Math.max(...ok.map((p) => p.e)),
    minN = Math.min(...ok.map((p) => p.n)),
    maxN = Math.max(...ok.map((p) => p.n))
  const span = Math.max(maxE - minE, maxN - minN, 1e-6)
  minE -= span * pad
  maxE += span * pad
  minN -= span * pad
  maxN += span * pad
  const W = 640
  const H = height
  const k = Math.min((W - 40) / (maxE - minE), (H - 40) / (maxN - minN))
  const cx = (minE + maxE) / 2
  const cy = (minN + maxN) / 2
  const X = (e: number) => W / 2 + (e - cx) * k
  const Y = (n: number) => H / 2 - (n - cy) * k
  const bar = niceLen(span)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg" role="img">
      {children({ X, Y, k })}
      {/* north arrow */}
      {north && <g transform={`translate(${W - 28},34)`} className="text-ink">
        <path d="M0 -18 L7 6 L0 1 L-7 6 Z" fill="currentColor" opacity="0.85" />
        <text y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
          N
        </text>
      </g>}
      {/* scale bar */}
      <g transform={`translate(16,${H - 16})`}>
        <rect width={bar * k} height="5" fill="var(--c-ink)" opacity="0.8" />
        <rect x={(bar * k) / 2} width={(bar * k) / 2} height="5" fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth="0.8" />
        <text y="-4" fontSize="10" fill="var(--c-mute)">
          0
        </text>
        <text x={bar * k} y="-4" fontSize="10" textAnchor="end" fill="var(--c-mute)">
          {bar} {unit}
        </text>
      </g>
    </svg>
  )
}

/** station mark (triangle) with a label */
export function Station({ x, y, label, color = 'var(--c-accent)' }: { x: number; y: number; label?: string; color?: string }) {
  return (
    <g>
      <path d={`M${x} ${y - 6} L${x + 5.5} ${y + 4} L${x - 5.5} ${y + 4} Z`} fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx={x} cy={y} r="1.2" fill={color} />
      {label && (
        <text x={x + 7} y={y - 6} fontSize="12" fontWeight="700" fill={color}>
          {label}
        </text>
      )}
    </g>
  )
}

/** longitudinal profile (or any x–z line) with vertical exaggeration chosen to fill the box */
export function Profile({ pts, title, xLabel = 'chainage (m)', zLabel = 'RL (m)', height = 230, labels = true, datum }: { pts: { x: number; z: number; tag?: string }[]; title?: string; xLabel?: string; zLabel?: string; height?: number; labels?: boolean; datum?: number }) {
  const p = pts.filter((q) => isFinite(q.x) && isFinite(q.z)).sort((a, b) => a.x - b.x)
  if (p.length < 2) return <div className="text-sm text-faint p-4 text-center border border-dashed border-line rounded-xl">Need at least two points with a chainage and an RL for the {title?.toLowerCase() ?? 'profile'}.</div>
  const W = 640,
    H = height,
    L = 54,
    R = 14,
    T = 22,
    B = 34
  const x0 = Math.min(...p.map((q) => q.x)),
    x1 = Math.max(...p.map((q) => q.x))
  const zmin = Math.min(...p.map((q) => q.z)),
    zmax = Math.max(...p.map((q) => q.z))
  const base = datum ?? Math.floor((zmin - (zmax - zmin) * 0.4 - 0.001) * 100) / 100
  const top = zmax + (zmax - zmin) * 0.25 + 0.005
  const X = (x: number) => L + ((x - x0) / (x1 - x0 || 1)) * (W - L - R)
  const Y = (z: number) => H - B - ((z - base) / (top - base || 1)) * (H - T - B)
  const path = p.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)} ${Y(q.z).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg">
      {title && (
        <text x={L} y={15} fontSize="12" fontWeight="700" fill="var(--c-ink)">
          {title}
        </text>
      )}
      <line x1={L} x2={W - R} y1={Y(base)} y2={Y(base)} stroke="var(--c-mute)" />
      <text x={L - 4} y={Y(base) + 4} fontSize="9.5" textAnchor="end" fill="var(--c-mute)">
        {base.toFixed(3)}
      </text>
      <text x={L - 4} y={T + 4} fontSize="9.5" textAnchor="end" fill="var(--c-mute)">
        {zLabel}
      </text>
      <path d={`${path} L${X(p[p.length - 1].x)} ${Y(base)} L${X(p[0].x)} ${Y(base)} Z`} fill="var(--c-soil)" opacity="0.35" />
      <path d={path} fill="none" stroke="var(--c-accent)" strokeWidth="2" />
      {p.map((q, i) => (
        <g key={i}>
          <line x1={X(q.x)} x2={X(q.x)} y1={Y(q.z)} y2={Y(base)} stroke="var(--c-line)" strokeDasharray="3 3" />
          <circle cx={X(q.x)} cy={Y(q.z)} r="2.6" fill="var(--c-accent)" />
          {labels && (
            <text x={X(q.x)} y={Y(q.z) - 6} fontSize="9" textAnchor="middle" fill="var(--c-ink)">
              {q.z.toFixed(3)}
            </text>
          )}
          <text x={X(q.x)} y={H - B + 13} fontSize="9.5" textAnchor="middle" fill="var(--c-mute)">
            {q.tag ?? q.x}
          </text>
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="var(--c-mute)">
        {xLabel}
      </text>
    </svg>
  )
}
