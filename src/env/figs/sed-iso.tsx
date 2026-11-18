// The worked iso-removal chart: curves, the detention-time line, and the ΔR strips shaded and labelled.
import type { IsoChart, IsoCurve, IsoResult } from '../engine/settle'
import { curveDepthAt } from '../engine/settle'

const STRIP_FILL = ['var(--c-accent)', 'var(--c-water)', 'var(--c-good)', 'var(--c-load)', 'var(--c-accent2)', 'var(--c-soil)', 'var(--c-sn)']

export function IsoChartFig({ H, tMax, curves, t0, res, title }: { H: number; tMax: number; curves: IsoCurve[]; t0?: number; res?: IsoResult; title?: string }) {
  const W = 560
  const Hh = 330
  const ml = 46
  const mr = 70
  const mt = 22
  const mb = 40
  const sx = (t: number) => ml + (t / tMax) * (W - ml - mr)
  const sy = (z: number) => mt + (z / H) * (Hh - mt - mb)
  const xt = tMax <= 45 ? 5 : tMax <= 90 ? 10 : tMax <= 150 ? 15 : 30
  const xs: number[] = []
  for (let t = 0; t <= tMax + 1e-9; t += xt) xs.push(t)
  const dstep = H <= 3 ? 0.5 : 1
  const ys: number[] = []
  for (let z = 0; z <= H + 1e-9; z += dstep) ys.push(z)
  const cl = curves.map((c) => ({ ...c, pts: c.pts.filter((p) => p[0] <= tMax + 1e-9 && p[1] <= H + 1e-9) }))
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label={title ?? 'iso-removal chart'} style={{ display: 'block' }}>
      {ys.map((z) => (
        <g key={'y' + z}>
          <line x1={ml} x2={W - mr} y1={sy(z)} y2={sy(z)} stroke="var(--c-line)" />
          <text x={ml - 6} y={sy(z) + 4} textAnchor="end" fontSize="12" fill="var(--c-mute)">{+z.toFixed(2)}</text>
        </g>
      ))}
      {xs.map((t) => (
        <g key={'x' + t}>
          <line x1={sx(t)} x2={sx(t)} y1={mt} y2={Hh - mb} stroke="var(--c-line)" />
          <text x={sx(t)} y={Hh - mb + 16} textAnchor="middle" fontSize="12" fill="var(--c-mute)">{t}</text>
        </g>
      ))}
      <text x={(ml + W - mr) / 2} y={Hh - 6} textAnchor="middle" fontSize="12" fill="var(--c-mute)">time t (min)</text>
      <text x={12} y={mt + (Hh - mt - mb) / 2} fontSize="12" fill="var(--c-mute)" transform={`rotate(-90 12 ${mt + (Hh - mt - mb) / 2})`} textAnchor="middle">depth (m)</text>
      {t0 !== undefined && res && res.strips.map((s, i) => {
        const w = 18
        return (
          <g key={'s' + i}>
            <rect x={sx(t0) - w} y={sy(s.z2)} width={2 * w} height={Math.max(sy(s.z1) - sy(s.z2), 0)} fill={STRIP_FILL[i % STRIP_FILL.length]} opacity="0.3" />
            <line x1={sx(t0)} x2={W - mr + 6} y1={sy(s.zMid)} y2={sy(s.zMid)} stroke={STRIP_FILL[i % STRIP_FILL.length]} strokeDasharray="3 3" />
            <text x={W - mr + 8} y={sy(s.zMid) + 4} fontSize="11" fill="var(--c-ink)">ΔR {+s.dr.toFixed(1)}</text>
          </g>
        )
      })}
      {cl.map((c) => {
        const last = c.pts[c.pts.length - 1]
        return (
          <g key={c.r}>
            <polyline points={c.pts.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth="1.6" />
            <text x={Math.min(sx(last[0]) + 3, W - mr - 20)} y={sy(last[1]) + (last[1] >= H - 1e-6 ? -4 : 12)} fontSize="11" fill="var(--c-ink)" fontWeight="600">{c.r}%</text>
          </g>
        )
      })}
      {t0 !== undefined && (
        <g>
          <line x1={sx(t0)} x2={sx(t0)} y1={mt} y2={Hh - mb} stroke="var(--c-bad)" strokeWidth="2" />
          <text x={sx(t0)} y={mt - 6} textAnchor="middle" fontSize="12" fill="var(--c-bad)" fontWeight="700">t₀ = {+t0.toFixed(1)}</text>
          {curves.map((c) => {
            const { z } = curveDepthAt(c, t0)
            return z < H && z > 0 ? <circle key={c.r} cx={sx(t0)} cy={sy(z)} r="3.5" fill="var(--c-bad)" /> : null
          })}
        </g>
      )}
    </svg>
  )
}
export { type IsoChart }
