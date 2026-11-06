// Newmark's influence chart drawn from σz/q = 1 − [1/(1 + (R/z)²)]^(3/2): 9 circles R/z = 0.270 … 1.908,
// 20 sectors (18°), influence value 0.005, scale bar AB = z. Optional plan overlay (rectangles in metres, the point
// at the centre) and covered-mesh shading.
import { fmt } from '../../../components/DiagramView'
import { NEWMARK_RZ, NEWMARK_SECTORS, type Rect } from '../../engine/stressdist'

function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy - r * Math.sin(a)).toFixed(2)}`
  if (r0 <= 0) return `M${cx},${cy} L${p(r1, a0)} A${r1},${r1} 0 0 0 ${p(r1, a1)} Z`
  return `M${p(r0, a0)} L${p(r1, a0)} A${r1},${r1} 0 0 0 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 0 1 ${p(r0, a0)} Z`
}

export function NewmarkChart({
  size = 360,
  z = 1,
  rects,
  meshes,
  circles,
  label = true,
  showRadii = false,
}: {
  size?: number
  /** depth represented by AB (for the overlay scale and the bar label) */
  z?: number
  /** plan of the loaded area in metres, point at (0, 0), y up */
  rects?: Rect[]
  /** covered fraction per [ring][sector] */
  meshes?: number[][]
  /** circular loaded areas (plan, metres) */
  circles?: { cx: number; cy: number; r: number }[]
  label?: boolean
  showRadii?: boolean
}) {
  const cx = size / 2
  const cy = size / 2
  const Rout = size * 0.44
  const AB = Rout / NEWMARK_RZ[8]
  const radii = [0, ...NEWMARK_RZ.map((v) => v * AB)]
  const far = size * 0.75
  const k = AB / z
  const da = (2 * Math.PI) / NEWMARK_SECTORS
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ maxWidth: size * 1.4 }} role="img" aria-label="Newmark influence chart">
      <defs>
        <clipPath id={`nm-clip-${size}`}>
          <rect x={0} y={0} width={size} height={size} />
        </clipPath>
      </defs>
      <g clipPath={`url(#nm-clip-${size})`}>
        {meshes?.map((row, ring) =>
          row.map((f, sec) =>
            f > 0.001 ? <path key={`${ring}-${sec}`} d={wedge(cx, cy, radii[ring], ring < 9 ? radii[ring + 1] : far, sec * da, (sec + 1) * da)} fill="var(--c-accent)" opacity={0.12 + 0.45 * f} /> : null,
          ),
        )}
        {rects?.map((r, i) => (
          <rect key={i} x={cx + Math.min(r.x1, r.x2) * k} y={cy - Math.max(r.y1, r.y2) * k} width={Math.abs(r.x2 - r.x1) * k} height={Math.abs(r.y2 - r.y1) * k} fill="var(--c-load)" fillOpacity={0.12} stroke="var(--c-load)" strokeWidth={1.4} />
        ))}
        {circles?.map((c, i) => (
          <circle key={'c' + i} cx={cx + c.cx * k} cy={cy - c.cy * k} r={c.r * k} fill="var(--c-load)" fillOpacity={0.12} stroke="var(--c-load)" strokeWidth={1.4} />
        ))}
      </g>
      {radii.slice(1).map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-ink)" strokeWidth={i === 8 ? 1.2 : 0.8} />
      ))}
      {Array.from({ length: NEWMARK_SECTORS }, (_, j) => {
        const a = j * da
        return <line key={j} x1={cx} y1={cy} x2={cx + far * Math.cos(a)} y2={cy - far * Math.sin(a)} stroke="var(--c-ink)" strokeWidth={0.6} opacity={0.8} clipPath={`url(#nm-clip-${size})`} />
      })}
      <circle cx={cx} cy={cy} r={2.5} fill="var(--c-load)" />
      {showRadii &&
        NEWMARK_RZ.map((v, i) => (
          <text key={i} x={cx + v * AB + 2} y={cy - 3} fontSize={7.5} fill="var(--c-mute)">
            {i + 1}
          </text>
        ))}
      <g>
        <line x1={size - 14} x2={size - 14} y1={size - 10} y2={size - 10 - AB} stroke="var(--c-load)" strokeWidth={2.5} />
        <line x1={size - 19} x2={size - 9} y1={size - 10} y2={size - 10} stroke="var(--c-load)" strokeWidth={1.5} />
        <line x1={size - 19} x2={size - 9} y1={size - 10 - AB} y2={size - 10 - AB} stroke="var(--c-load)" strokeWidth={1.5} />
        <text x={size - 22} y={size - 10 - AB / 2} fontSize={9} textAnchor="end" fill="var(--c-load)">
          AB = z{z !== 1 ? ` = ${fmt(z, 2)} m` : ''}
        </text>
        <text x={size - 10} y={size - 14 - AB} fontSize={8} textAnchor="middle" fill="var(--c-load)">
          A
        </text>
      </g>
      {label && (
        <text x={6} y={12} fontSize={9} fill="var(--c-mute)">
          Influence value = 0.005 (10 rings × 20 sectors = 200 meshes)
        </text>
      )}
    </svg>
  )
}
