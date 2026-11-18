// Looped network with flow arrows (size = flow), external inflows / outflows and the loop sense, for Hardy Cross.
import type { HcLoop, HcPipe } from '../engine/network'
import type { NodePos } from './net-tree'

const f2 = (v: number) => (Math.round(v * 100) / 100).toString()

export function LoopFig({
  pipes,
  pos,
  flows,
  ext,
  loops,
  loopAt,
  unit = 'lps',
  viewBox = [560, 300],
  sizes,
  hot,
}: {
  pipes: HcPipe[]
  pos: NodePos
  flows: Record<string, number>
  /** external flow at a node: positive = inflow, negative = outflow (same unit as flows) */
  ext: Record<string, number>
  loops?: HcLoop[]
  /** where to put the circular arrow for each loop id */
  loopAt?: Record<string, [number, number]>
  unit?: string
  viewBox?: [number, number]
  sizes?: Record<string, string>
  /** highlight these pipes (the ones just corrected) */
  hot?: Record<string, number>
}) {
  const [W, H] = viewBox
  const maxQ = Math.max(1e-9, ...Object.values(flows).map(Math.abs))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="looped network" style={{ maxWidth: 640 }}>
      <defs>
        <marker id="lp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--c-accent)" />
        </marker>
        <marker id="lp-ext" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--c-load)" />
        </marker>
      </defs>
      {pipes.map((p) => {
        const q = flows[p.id]
        const [ax, ay] = pos[q >= 0 ? p.from : p.to]
        const [bx, by] = pos[q >= 0 ? p.to : p.from]
        const [x1, y1] = pos[p.from]
        const [x2, y2] = pos[p.to]
        const dx = x2 - x1
        const dy = y2 - y1
        const len = Math.hypot(dx, dy)
        const nx = -dy / len
        const ny = dx / len
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const w = 2 + (Math.abs(q) / maxQ) * 5
        const isHot = hot && hot[p.id] !== undefined
        return (
          <g key={p.id}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-water)" strokeWidth={w} strokeLinecap="round" opacity={0.65} />
            <line x1={ax + (bx - ax) * 0.38} y1={ay + (by - ay) * 0.38} x2={ax + (bx - ax) * 0.62} y2={ay + (by - ay) * 0.62} stroke="var(--c-accent)" strokeWidth="2.2" markerEnd="url(#lp-arrow)" />
            <text x={mx + nx * 15} y={my + ny * 15 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={isHot ? 'var(--c-load)' : 'var(--c-ink)'}>
              {f2(Math.abs(q))}
            </text>
            <text x={mx - nx * 14} y={my - ny * 14 + 4} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
              {p.id}
              {sizes?.[p.id] ? ` · ${sizes[p.id]}` : p.L ? ` · ${p.L}` : ''}
            </text>
          </g>
        )
      })}
      {Object.entries(pos).map(([n, [x, y]]) => {
        const e = ext[n] ?? 0
        return (
          <g key={n}>
            {e !== 0 && (
              <>
                <line x1={x + (e > 0 ? -34 : 0)} y1={y + (e > 0 ? -26 : 0)} x2={x + (e > 0 ? -6 : 30)} y2={y + (e > 0 ? -6 : 24)} stroke="var(--c-load)" strokeWidth="2.2" markerEnd="url(#lp-ext)" />
                <text x={x + (e > 0 ? -38 : 34)} y={y + (e > 0 ? -28 : 34)} textAnchor={e > 0 ? 'end' : 'start'} fontSize="11" fontWeight="700" fill="var(--c-load)">
                  {e > 0 ? '+' : '−'}
                  {f2(Math.abs(e))} {unit}
                </text>
              </>
            )}
            <circle cx={x} cy={y} r={9} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--c-ink)">
              {n}
            </text>
          </g>
        )
      })}
      {loops?.map((l) => {
        const at = loopAt?.[l.id]
        if (!at) return null
        return (
          <g key={l.id}>
            <circle cx={at[0]} cy={at[1]} r={18} fill="none" stroke="var(--c-accent2)" strokeWidth="1.6" strokeDasharray="70 20" />
            <text x={at[0]} y={at[1] + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-accent2)">
              {l.id}
            </text>
            <text x={at[0] + 1} y={at[1] - 22} textAnchor="middle" fontSize="11" fill="var(--c-accent2)">
              ↻
            </text>
          </g>
        )
      })}
    </svg>
  )
}
