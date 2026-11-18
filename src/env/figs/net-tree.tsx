// Branched (dead-end) network drawn from a TreeResult: pipes (width = size), flows and sizes on them, pressure at the nodes.
import type { TreeResult } from '../engine/network'

export type NodePos = Record<string, [number, number]>

const f1 = (v: number) => (Math.round(v * 10) / 10).toString()

export function TreeFig({ res, pos, flowUnit = 'lph', root, viewBox = [560, 300], nodeLabels, selected }: { res: TreeResult; pos: NodePos; flowUnit?: 'lph' | 'lps' | 'cfs'; root: string; viewBox?: [number, number]; nodeLabels?: Record<string, string>; selected?: string }) {
  const [W, H] = viewBox
  const q = (p: TreeResult['pipes'][number]) => (flowUnit === 'lph' ? `${Math.round(p.Qlph).toLocaleString('en')} lph` : flowUnit === 'lps' ? `${f1(p.Qlps)} lps` : `${Math.round(p.Qcfs * 1000) / 1000} cfs`)
  const onPath = new Set<string>()
  if (selected) {
    const t = res.terminals.find((x) => x.node === selected)
    if (t) t.path.forEach((n) => onPath.add(n))
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="branched network" style={{ maxWidth: 640 }}>
      {res.pipes.map((p) => {
        const [x1, y1] = pos[p.from]
        const [x2, y2] = pos[p.to]
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const hot = !selected || (onPath.has(p.from) && onPath.has(p.to))
        const horiz = Math.abs(y2 - y1) < Math.abs(x2 - x1)
        return (
          <g key={p.id} opacity={hot ? 1 : 0.35}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-water)" strokeWidth={Math.max(2, p.Din * 0.9)} strokeLinecap="round" opacity={0.85} />
            <text x={mx + (horiz ? 0 : 8)} y={my + (horiz ? -10 : 0)} textAnchor={horiz ? 'middle' : 'start'} fontSize="11" fill="var(--c-ink)">
              {p.id} · {p.Din} in
            </text>
            <text x={mx + (horiz ? 0 : 8)} y={my + (horiz ? 15 : 13)} textAnchor={horiz ? 'middle' : 'start'} fontSize="11" fill="var(--c-mute)">
              {q(p)} · {Math.round(p.Lft)} ft
            </text>
          </g>
        )
      })}
      {Object.entries(pos).map(([n, [x, y]]) => {
        const p = res.pressure[n]
        if (p === undefined) return null
        const term = res.terminals.find((t) => t.node === n)
        const ok = p >= res.minPsi - 1e-9
        return (
          <g key={n}>
            {n === root ? (
              <rect x={x - 11} y={y - 11} width={22} height={22} rx="3" fill="var(--c-accent)" />
            ) : (
              <circle cx={x} cy={y} r={9} fill="var(--c-panel)" stroke={term ? (ok ? 'var(--c-good)' : 'var(--c-bad)') : 'var(--c-ink)'} strokeWidth="2" />
            )}
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={n === root ? 'var(--c-panel)' : 'var(--c-ink)'}>
              {nodeLabels?.[n] ?? n}
            </text>
            <text x={x} y={y - 15} textAnchor="middle" fontSize="11" fontWeight="700" fill={ok ? 'var(--c-good)' : 'var(--c-bad)'}>
              {f1(p)} psi
            </text>
          </g>
        )
      })}
    </svg>
  )
}
