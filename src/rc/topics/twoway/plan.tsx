// Two-way panel plan: click edges to toggle continuous / discontinuous; with a result it also shows
// strips, corner-steel zones, moments at every edge and the bar directions.
import type { EdgeName, Edges, TwoWayResult } from '../../engine/twoway'
import { f } from '../oneway/kit'

export function PanelPlan({ lx, ly, edges, onToggle, r }: { lx: number; ly: number; edges: Edges; onToggle?: (e: EdgeName) => void; r?: TwoWayResult }) {
  const W = 560
  const H = 400
  const sc = Math.min((W - 170) / lx, (H - 130) / ly)
  const w = lx * sc
  const h = ly * sc
  const x0 = (W - w) / 2
  const y0 = (H - h) / 2 + 4
  const geo = r?.geo
  const isLong = (e: EdgeName) => (geo ? geo.longEdges.includes(e) : (lx >= ly) === (e === 'top' || e === 'bottom'))
  const seg: Record<EdgeName, [number, number, number, number, [number, number]]> = {
    top: [x0, y0, x0 + w, y0, [0, -1]],
    bottom: [x0, y0 + h, x0 + w, y0 + h, [0, 1]],
    left: [x0, y0, x0, y0 + h, [-1, 0]],
    right: [x0 + w, y0, x0 + w, y0 + h, [1, 0]],
  }
  const hatch = (e: EdgeName) => {
    const [a, b, c, d, o] = seg[e]
    const len = Math.hypot(c - a, d - b)
    const n = Math.round(len / 9)
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const x = a + (c - a) * t
      const y = b + (d - b) * t
      return <line key={i} x1={x} y1={y} x2={x + o[0] * 9 + o[1] * 5} y2={y + o[1] * 9 - o[0] * 5} stroke="var(--c-accent)" strokeWidth={1.2} />
    })
  }
  const mid = (e: EdgeName) => {
    const [a, b, c, d] = seg[e]
    return [(a + c) / 2, (b + d) / 2]
  }
  const edgeMoment = (e: EdgeName) => {
    if (!r) return null
    const long = isLong(e)
    const cont = edges[e]
    const M = long ? (cont ? r.M.aNeg : r.M.aDisc) : cont ? r.M.bNeg : r.M.bDisc
    if (M === null) return null
    return `${cont ? '' : ''}−${f(M, 2)}${cont ? '' : ' (disc)'}`
  }
  const zone = r ? r.corner.zone * sc : 0
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-2xl select-none">
      <defs>
        <marker id="twa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-bad)" />
        </marker>
        <marker id="twb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6" />
        </marker>
      </defs>
      <rect x={x0} y={y0} width={w} height={h} fill="var(--c-panel2)" fillOpacity={0.6} />
      {/* strips: quarter lines both ways */}
      {r && (
        <g stroke="var(--c-faint)" strokeDasharray="5 4" strokeWidth={1}>
          <line x1={x0 + w / 4} x2={x0 + w / 4} y1={y0} y2={y0 + h} />
          <line x1={x0 + (3 * w) / 4} x2={x0 + (3 * w) / 4} y1={y0} y2={y0 + h} />
          <line x1={x0} x2={x0 + w} y1={y0 + h / 4} y2={y0 + h / 4} />
          <line x1={x0} x2={x0 + w} y1={y0 + (3 * h) / 4} y2={y0 + (3 * h) / 4} />
        </g>
      )}
      {/* corner zones */}
      {r &&
        r.corner.corners.map(([v, hz]) => {
          const cx = hz === 'left' ? x0 : x0 + w - zone
          const cy = v === 'top' ? y0 : y0 + h - zone
          return <rect key={v + hz} x={cx} y={cy} width={zone} height={zone} fill="#ec4899" fillOpacity={0.22} stroke="#ec4899" strokeDasharray="3 2" />
        })}
      {/* edges */}
      {(['top', 'right', 'bottom', 'left'] as EdgeName[]).map((e) => {
        const [a, b, c, d, o] = seg[e]
        const cont = edges[e]
        const [mx, my] = mid(e)
        const lab = `${cont ? 'continuous' : 'discontinuous'} · ${isLong(e) ? 'long' : 'short'} edge`
        return (
          <g key={e} onClick={onToggle ? () => onToggle(e) : undefined} style={{ cursor: onToggle ? 'pointer' : undefined }}>
            {cont && hatch(e)}
            <line x1={a} y1={b} x2={c} y2={d} stroke={cont ? 'var(--c-accent)' : 'var(--c-ink)'} strokeWidth={cont ? 4 : 1.8} />
            {onToggle && <line x1={a + o[0] * 8} y1={b + o[1] * 8} x2={c + o[0] * 8} y2={d + o[1] * 8} stroke="transparent" strokeWidth={26} />}
            <text
              x={mx + o[0] * 18}
              y={my + o[1] * 22 + (e === 'left' || e === 'right' ? 0 : 4)}
              fontSize={10.5}
              textAnchor="middle"
              transform={e === 'left' || e === 'right' ? `rotate(${e === 'left' ? -90 : 90} ${mx + o[0] * 18} ${my})` : undefined}
              fill={cont ? 'var(--c-accent)' : 'var(--c-mute)'}
              fontWeight={600}
            >
              {lab}
              {onToggle ? ' ⟲' : ''}
            </text>
            {r && edgeMoment(e) && (
              <text x={mx - o[0] * (e === 'left' || e === 'right' ? 8 : 0)} y={my - o[1] * 12 + (e === 'left' || e === 'right' ? 4 : 4)} fontSize={11} textAnchor={e === 'left' ? 'start' : e === 'right' ? 'end' : 'middle'} fill="var(--c-bad)" className="num" fontWeight={700}>
                {edgeMoment(e)}
              </text>
            )}
          </g>
        )
      })}
      {/* centre: positive moments and bar directions */}
      {r &&
        (() => {
          const cx = x0 + w / 2
          const cy = y0 + h / 2
          const shortVert = geo!.horizLong
          const L = Math.min(w, h) * 0.3
          return (
            <g>
              {shortVert ? (
                <line x1={cx - 30} x2={cx - 30} y1={cy - L} y2={cy + L} stroke="var(--c-bad)" strokeWidth={1.6} markerStart="url(#twa)" markerEnd="url(#twa)" />
              ) : (
                <line x1={cx - L} x2={cx + L} y1={cy + 30} y2={cy + 30} stroke="var(--c-bad)" strokeWidth={1.6} markerStart="url(#twa)" markerEnd="url(#twa)" />
              )}
              {shortVert ? (
                <line x1={cx - L} x2={cx + L} y1={cy + 30} y2={cy + 30} stroke="#3b82f6" strokeWidth={1.6} markerStart="url(#twb)" markerEnd="url(#twb)" />
              ) : (
                <line x1={cx - 30} x2={cx - 30} y1={cy - L} y2={cy + L} stroke="#3b82f6" strokeWidth={1.6} markerStart="url(#twb)" markerEnd="url(#twb)" />
              )}
              <text x={cx} y={cy - 6} fontSize={11.5} textAnchor="middle" fill="var(--c-bad)" className="num" fontWeight={700}>
                +Ma {f(r.M.aPos, 2)}
              </text>
              <text x={cx} y={cy + 10} fontSize={11.5} textAnchor="middle" fill="#3b82f6" className="num" fontWeight={700}>
                +Mb {f(r.M.bPos, 2)}
              </text>
            </g>
          )
        })()}
      {/* dimensions */}
      <text x={x0 + w / 2} y={H - 8} fontSize={11} textAnchor="middle" fill="var(--c-mute)">
        {f(lx, 2)} ft (clear){r ? ` · case ${r.case}, m = ${f(r.m, 3)}` : ''}
      </text>
      <text x={14} y={y0 + h / 2} fontSize={11} fill="var(--c-mute)" transform={`rotate(-90 14 ${y0 + h / 2})`} textAnchor="middle">
        {f(ly, 2)} ft (clear)
      </text>
      {r && (
        <text x={W - 6} y={14} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
          red = short-way bars (lower layer) · blue = long-way · dashed = strip boundaries (¼ points) · pink = corner steel {f(r.corner.zone, 2)}′ × {f(r.corner.zone, 2)}′ · k-ft/ft
        </text>
      )}
    </svg>
  )
}
