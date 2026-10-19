import { useMemo } from 'react'
import { keyValues, type DiagramMember } from '../engine/diagrams'
import type { Model } from '../engine/model'
import { useStore } from '../store'
import { StructureView, type Transform } from './StructureView'

export type DiagramKind = 'N' | 'V' | 'M'

const COLORS: Record<DiagramKind, string> = { N: 'var(--c-axial)', V: 'var(--c-shear)', M: 'var(--c-moment)' }
export const KIND_NAME: Record<DiagramKind, string> = { N: 'Axial force (AFD)', V: 'Shear force (SFD)', M: 'Bending moment (BMD)' }

export function fmt(v: number, d = 2) {
  if (!Number.isFinite(v)) return '—'
  const r = Math.abs(v) < 5e-4 ? 0 : v
  const s = r.toFixed(d)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

export interface DiagramViewProps {
  model: Model
  members: DiagramMember[]
  kind: DiagramKind
  showLoads?: boolean
  maxHeight?: number
  only?: string[]
  labels?: boolean
  lenUnit?: string
  forceUnit?: string
  autoDimX?: boolean
  /** override global setting */
  side?: 'compression' | 'tension'
  /** animate growth 0..1 */
  grow?: number
  pad?: number
}

export function DiagramView(p: DiagramViewProps) {
  const globalSide = useStore((s) => s.bmdSide)
  const side = p.side ?? globalSide
  const members = p.only ? p.members.filter((m) => p.only!.includes(m.id)) : p.members
  const maxAbs = useMemo(() => {
    let m = 0
    for (const d of members) for (const s of d.samples) m = Math.max(m, Math.abs(s[p.kind]))
    return m || 1
  }, [members, p.kind])

  return (
    <StructureView
      model={p.model}
      showLoads={p.showLoads ?? false}
      maxHeight={p.maxHeight ?? 340}
      lenUnit={p.lenUnit}
      forceUnit={p.forceUnit}
      autoDimX={p.autoDimX}
      pad={p.pad ?? 80}
      nodeLabels
    >
      {(t) => (
        <g>
          {members.map((d) => (
            <MemberDiagram key={d.id} d={d} t={t} kind={p.kind} scale={46 / maxAbs} side={side} labels={p.labels ?? true} grow={p.grow ?? 1} />
          ))}
        </g>
      )}
    </StructureView>
  )
}

function MemberDiagram({
  d,
  t,
  kind,
  scale,
  side,
  labels,
  grow,
}: {
  d: DiagramMember
  t: Transform
  kind: DiagramKind
  scale: number
  side: 'compression' | 'tension'
  labels: boolean
  grow: number
}) {
  const x1 = t.x(d.x1),
    y1 = t.y(d.y1),
    x2 = t.x(d.x2),
    y2 = t.y(d.y2)
  const Lp = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / Lp
  const uy = (y2 - y1) / Lp
  // local +y (left normal) in screen coordinates: world left normal (-s, c) -> screen (-s, -c)·
  const nx = uy
  const ny = -ux
  // sign: + values drawn toward local +y; for M on tension side, sagging (+) goes to local -y
  const sgn = kind === 'M' && side === 'tension' ? -1 : 1
  const all = d.samples
  if (all.every((s) => Math.abs(s[kind]) < 1e-9)) return null
  const pts = all.map((s) => {
    const f = s.t / d.L
    const bx = x1 + (x2 - x1) * f
    const by = y1 + (y2 - y1) * f
    const v = s[kind] * scale * sgn * grow
    return [bx + nx * v, by + ny * v]
  })
  const poly = [[x1, y1], ...pts, [x2, y2]].map((p) => p.join(',')).join(' ')
  const col = COLORS[kind]
  const keys = labels ? keyValues(d, kind) : []
  return (
    <g>
      <polygon points={poly} fill={col} fillOpacity={0.18} stroke="none" />
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={col} strokeWidth={1.8} />
      {keys
        .filter((k) => Math.abs(k.v) > 1e-6)
        .map((k, i) => {
          const f = k.t / d.L
          const bx = x1 + (x2 - x1) * f
          const by = y1 + (y2 - y1) * f
          const v = k.v * scale * sgn * grow
          const off = Math.sign(v || 1) * 12
          return (
            <text
              key={i}
              x={bx + nx * (v + off)}
              y={by + ny * (v + off) + 4}
              fontSize={11.5}
              textAnchor="middle"
              fill="var(--c-ink)"
              className="num"
              fontWeight={600}
              style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}
            >
              {fmt(k.v)}
            </text>
          )
        })}
    </g>
  )
}
