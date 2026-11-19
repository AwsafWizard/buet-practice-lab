// The worked iso-removal chart: curves, the detention-time line, and the ΔR strips shaded and labelled.
import type { IsoChart, IsoCurve, IsoGrid, IsoResult } from '../engine/settle'
import { curveDepthAt, curveSamples } from '../engine/settle'

const STRIP_FILL = ['var(--c-accent)', 'var(--c-water)', 'var(--c-good)', 'var(--c-load)', 'var(--c-accent2)', 'var(--c-soil)', 'var(--c-sn)']

/** `grid`: the paper's printed % removal at each sampling point, drawn as small numbers so the curves can be checked against the data */
export function IsoChartFig({ H, tMax, curves, t0, res, title, grid }: { H: number; tMax: number; curves: IsoCurve[]; t0?: number; res?: IsoResult; title?: string; grid?: IsoGrid }) {
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
  // smooth monotone curves through the read points (straight chords between readings looked kinked)
  const cl = curves.map((c) => ({ ...c, pts: curveSamples(c, tMax).filter((p) => p[1] <= H + 1e-6) }))
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
      {grid &&
        grid.depths.flatMap((z, i) =>
          grid.times.map((t, j) =>
            t <= tMax + 1e-9 && z <= H + 1e-9 ? (
              <g key={`g${i}-${j}`}>
                <circle cx={sx(t)} cy={sy(z)} r="2" fill="var(--c-faint)" />
                <text x={sx(t) + 3} y={sy(z) - 3} fontSize="9" fill="var(--c-mute)">{+grid.R[i][j].toFixed(0)}</text>
              </g>
            ) : null,
          ),
        )}
      {t0 !== undefined && res && (() => {
        // thin strips near the surface: push their ΔR labels apart so they never overlap (leader lines keep the true depth)
        const order = res.strips.map((s, i) => ({ i, y: sy(s.zMid) })).sort((a, b) => a.y - b.y)
        const labY: number[] = []
        let prev = -Infinity
        for (const o of order) {
          prev = Math.max(o.y, prev + 12)
          labY[o.i] = prev
        }
        const over = Math.max(0, prev - (Hh - mb + 4))
        return res.strips.map((s, i) => {
          const w = 18
          const ly = labY[i] - over
          return (
            <g key={'s' + i}>
              <rect x={sx(t0) - w} y={sy(s.z2)} width={2 * w} height={Math.max(sy(s.z1) - sy(s.z2), 0)} fill={STRIP_FILL[i % STRIP_FILL.length]} opacity="0.3" />
              <polyline points={`${sx(t0)},${sy(s.zMid)} ${W - mr},${sy(s.zMid)} ${W - mr + 6},${ly}`} fill="none" stroke={STRIP_FILL[i % STRIP_FILL.length]} strokeDasharray="3 3" />
              <text x={W - mr + 8} y={ly + 4} fontSize="11" fill="var(--c-ink)">ΔR {+s.dr.toFixed(1)}</text>
            </g>
          )
        })
      })()}
      {cl.map((c) => {
        const last = c.pts[c.pts.length - 1]
        return (
          <g key={c.r}>
            <polyline points={c.pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth="1.6" strokeLinejoin="round" />
            {last[1] >= H - 1e-6 ? (
              <text x={sx(last[0]) + 3} y={sy(last[1]) - 4} fontSize="11" fill="var(--c-ink)" fontWeight="600">{c.r}%</text>
            ) : (
              <text x={sx(last[0]) - 3} y={sy(last[1]) - 5} textAnchor="end" fontSize="11" fill="var(--c-ink)" fontWeight="600">{c.r}%</text>
            )}
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
