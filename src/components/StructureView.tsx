import { useMemo, useState, type ReactNode } from 'react'
import type { Load, Model, SNode, Support } from '../engine/model'

export interface Transform {
  k: number
  x: (wx: number) => number
  y: (wy: number) => number
  W: number
  H: number
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface Dim {
  from: [number, number]
  to: [number, number]
  text?: string
  /** offset in px, perpendicular (+ = below / right) */
  off?: number
}

export interface StructureViewProps {
  model: Model
  loads?: Load[]
  showLoads?: boolean
  dims?: Dim[]
  /** automatic dimension chain along x under the structure */
  autoDimX?: boolean | number[]
  autoDimY?: boolean | number[]
  lenUnit?: string
  forceUnit?: string
  nodeLabels?: boolean
  memberLabels?: boolean | Record<string, string>
  memberColor?: Record<string, string>
  memberDash?: Record<string, boolean>
  hideMembers?: Set<string>
  dimMembers?: Set<string>
  onMemberClick?: (id: string) => void
  onNodeClick?: (id: string) => void
  selectedMember?: string | null
  maxWidth?: number
  maxHeight?: number
  pad?: number
  extra?: [number, number][]
  children?: (t: Transform) => ReactNode
  under?: (t: Transform) => ReactNode
  className?: string
  wobble?: boolean
  /** tag unsupported member ends as "free end" (default true) */
  freeEnds?: boolean
}

const PX_W = 820
const PX_H = 360

export function makeTransform(pts: [number, number][], maxW = PX_W, maxH = PX_H, pad = 70): Transform {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const [x, y] of pts) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const dx = Math.max(maxX - minX, 1e-6)
  const dy = Math.max(maxY - minY, 1e-6)
  const k = Math.min((maxW - 2 * pad) / dx, dy < 1e-3 ? Infinity : (maxH - 2 * pad) / dy)
  const kk = Number.isFinite(k) ? k : (maxW - 2 * pad) / dx
  const W = dx * kk + 2 * pad
  const H = Math.max(dy * kk + 2 * pad, 150)
  const oy = (H - dy * kk) / 2
  return {
    k: kk,
    x: (wx) => pad + (wx - minX) * kk,
    y: (wy) => H - oy - (wy - minY) * kk,
    W,
    H,
    minX,
    maxX,
    minY,
    maxY,
  }
}

function connected(model: Model, id: string) {
  return model.members.filter((m) => m.i === id || m.j === id)
}

/** unit vector pointing from node away from the structure */
function outward(model: Model, n: SNode): [number, number] {
  const nm = new Map(model.nodes.map((q) => [q.id, q]))
  let sx = 0,
    sy = 0
  for (const m of connected(model, n.id)) {
    const o = nm.get(m.i === n.id ? m.j : m.i)!
    const L = Math.hypot(o.x - n.x, o.y - n.y)
    sx += (o.x - n.x) / L
    sy += (o.y - n.y) / L
  }
  const L = Math.hypot(sx, sy)
  if (L < 1e-6) return [0, -1]
  return [-sx / L, -sy / L]
}

function snapAxis([x, y]: [number, number]): [number, number] {
  // prefer "down" when ambiguous (beam ends)
  if (Math.abs(y) >= Math.abs(x) * 0.7) return [0, y >= 0 ? 1 : -1]
  return [x >= 0 ? 1 : -1, 0]
}

export function StructureView(p: StructureViewProps) {
  const [hover, setHover] = useState<string | null>(null)
  const loads = p.loads ?? p.model.loads
  const t = useMemo(() => {
    const pts: [number, number][] = p.model.nodes.map((n) => [n.x, n.y])
    if (p.extra) pts.push(...p.extra)
    return makeTransform(pts, p.maxWidth ?? PX_W, p.maxHeight ?? PX_H, p.pad ?? 70)
  }, [p.model, p.extra, p.maxWidth, p.maxHeight, p.pad])
  const nm = useMemo(() => new Map(p.model.nodes.map((n) => [n.id, n])), [p.model])
  const fu = p.forceUnit ?? 'k'
  const lu = p.lenUnit ?? '′'
  const showLoads = p.showLoads ?? true

  // world points where loads act (point loads, partial UDL ends) — added to the auto chains
  const loadPts = useMemo(() => {
    const out: { x: number; y: number; horiz: boolean; vert: boolean }[] = []
    const mm = new Map(p.model.members.map((m) => [m.id, m]))
    for (const l of showLoads ? loads : []) {
      if (l.kind === 'node') continue
      const m = mm.get(l.member)
      if (!m) continue
      const ni = nm.get(m.i)!,
        nj = nm.get(m.j)!
      const L = Math.hypot(nj.x - ni.x, nj.y - ni.y)
      const at = (s: number) => {
        const r = Math.min(Math.max(s / L, 0), 1)
        out.push({ x: ni.x + r * (nj.x - ni.x), y: ni.y + r * (nj.y - ni.y), horiz: Math.abs(nj.y - ni.y) < 1e-6, vert: Math.abs(nj.x - ni.x) < 1e-6 })
      }
      if (l.kind === 'point') at(l.a)
      else {
        if (l.a != null) at(l.a)
        if (l.b != null) at(l.b)
      }
    }
    return out
  }, [loads, showLoads, p.model, nm])

  const chain = (vals: number[]) => [...new Set(vals.map((v) => +v.toFixed(4)))].sort((a, b) => a - b)

  // auto x-dimension chain (row 1: nodes + load positions; row 2: nodes only, when loads split it)
  const dimsX = useMemo(() => {
    if (!p.autoDimX) return []
    const nodeXs = Array.isArray(p.autoDimX) ? chain(p.autoDimX) : chain(p.model.nodes.map((n) => n.x))
    const xs = Array.isArray(p.autoDimX) ? nodeXs : chain([...nodeXs, ...loadPts.filter((q) => !q.vert).map((q) => q.x)])
    const out: Dim[] = []
    for (let i = 0; i < xs.length - 1; i++) out.push({ from: [xs[i], t.minY], to: [xs[i + 1], t.minY], text: fmtLen(xs[i + 1] - xs[i], lu) })
    if (xs.length > nodeXs.length)
      for (let i = 0; i < nodeXs.length - 1; i++) out.push({ from: [nodeXs[i], t.minY], to: [nodeXs[i + 1], t.minY], text: fmtLen(nodeXs[i + 1] - nodeXs[i], lu), off: 26 })
    return out
  }, [p.autoDimX, p.model, t, lu, loadPts])
  const dimsY = useMemo(() => {
    if (!p.autoDimY) return []
    const nodeYs = Array.isArray(p.autoDimY) ? chain(p.autoDimY) : chain(p.model.nodes.map((n) => n.y))
    const ys = Array.isArray(p.autoDimY) ? nodeYs : chain([...nodeYs, ...loadPts.filter((q) => !q.horiz).map((q) => q.y)])
    const out: Dim[] = []
    for (let i = 0; i < ys.length - 1; i++) out.push({ from: [t.maxX, ys[i]], to: [t.maxX, ys[i + 1]], text: fmtLen(ys[i + 1] - ys[i], lu) })
    if (ys.length > nodeYs.length)
      for (let i = 0; i < nodeYs.length - 1; i++) out.push({ from: [t.maxX, nodeYs[i]], to: [t.maxX, nodeYs[i + 1]], text: fmtLen(nodeYs[i + 1] - nodeYs[i], lu), off: 40 })
    return out
  }, [p.autoDimY, p.model, t, lu, loadPts])

  const Hextra = (dimsX.length ? 34 : 0) + (dimsX.some((d) => d.off) ? 26 : 0) + 6
  const Wextra = (dimsY.length ? 44 : 0) + (dimsY.some((d) => d.off) ? 40 : 0)

  return (
    <svg
      viewBox={`0 0 ${t.W + Wextra} ${t.H + Hextra}`}
      className={p.className ?? 'w-full h-auto'}
      style={{ maxHeight: (p.maxHeight ?? PX_H) + 60 }}
    >
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
        </marker>
        <marker id="arwInk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-mute)" />
        </marker>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-mute)" strokeWidth="1.2" />
        </pattern>
      </defs>
      {p.under?.(t)}
      <g className={p.wobble ? 'wobble' : undefined}>
        {/* members */}
        {p.model.members.map((m) => {
          if (p.hideMembers?.has(m.id)) return null
          const a = nm.get(m.i)!
          const b = nm.get(m.j)!
          const color = p.memberColor?.[m.id] ?? (p.selectedMember === m.id ? 'var(--c-accent)' : 'var(--c-member)')
          const truss = m.truss || m.style === 'thin'
          const w = m.style === 'cable' ? 2 : truss ? 2.6 : 4.2
          const dash = p.memberDash?.[m.id] || m.style === 'dashed'
          const isHover = hover === m.id && !!p.onMemberClick
          return (
            <g key={m.id} opacity={p.dimMembers?.has(m.id) ? 0.3 : 1}>
              <line
                x1={t.x(a.x)}
                y1={t.y(a.y)}
                x2={t.x(b.x)}
                y2={t.y(b.y)}
                stroke={color}
                strokeWidth={isHover ? w + 2 : w}
                strokeLinecap="round"
                strokeDasharray={dash ? '7 6' : m.style === 'stringer' ? '2 0' : undefined}
                style={{ transition: 'stroke 0.25s, stroke-width 0.15s' }}
              />
              {p.onMemberClick && (
                <line
                  x1={t.x(a.x)}
                  y1={t.y(a.y)}
                  x2={t.x(b.x)}
                  y2={t.y(b.y)}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHover(m.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => p.onMemberClick!(m.id)}
                />
              )}
            </g>
          )
        })}
        {/* member labels */}
        {p.memberLabels &&
          p.model.members.map((m) => {
            if (p.hideMembers?.has(m.id)) return null
            const text = typeof p.memberLabels === 'object' ? p.memberLabels[m.id] : m.label
            if (!text) return null
            const a = nm.get(m.i)!
            const b = nm.get(m.j)!
            const mx = (t.x(a.x) + t.x(b.x)) / 2
            const my = (t.y(a.y) + t.y(b.y)) / 2
            const L = Math.hypot(t.x(b.x) - t.x(a.x), t.y(b.y) - t.y(a.y))
            const nx = -(t.y(b.y) - t.y(a.y)) / L
            const ny = (t.x(b.x) - t.x(a.x)) / L
            const s = ny > 0 ? -1 : 1
            return (
              <text key={'ml' + m.id} x={mx + s * nx * 13} y={my + s * ny * 13 + 4} fontSize={12} textAnchor="middle" fill="var(--c-accent2)" fontWeight={600} style={{ pointerEvents: 'none' }}>
                {text}
              </text>
            )
          })}
        {/* joints */}
        {p.model.nodes.map((n) => {
          const ms = connected(p.model, n.id)
          const trussJoint = ms.length > 0 && ms.every((m) => m.truss)
          if (n.hinge)
            return <circle key={n.id} cx={t.x(n.x)} cy={t.y(n.y)} r={5.5} fill="var(--c-panel)" stroke="var(--c-member)" strokeWidth={2.2} />
          if (trussJoint) return <circle key={n.id} cx={t.x(n.x)} cy={t.y(n.y)} r={3.6} fill="var(--c-panel)" stroke="var(--c-member)" strokeWidth={1.8} />
          return null
        })}
        {/* member-end releases */}
        {p.model.members.map((m) => {
          const ends: SNode[] = []
          if (m.relI && !nm.get(m.i)!.hinge) ends.push(nm.get(m.i)!)
          if (m.relJ && !nm.get(m.j)!.hinge) ends.push(nm.get(m.j)!)
          return ends.map((n) => {
            const o = nm.get(n.id === m.i ? m.j : m.i)!
            const L = Math.hypot(o.x - n.x, o.y - n.y)
            const off = 8 / t.k
            return <circle key={m.id + n.id} cx={t.x(n.x + ((o.x - n.x) / L) * off)} cy={t.y(n.y + ((o.y - n.y) / L) * off)} r={4.5} fill="var(--c-panel)" stroke="var(--c-member)" strokeWidth={2} />
          })
        })}
        {/* supports */}
        {p.model.supports.filter((s) => !s.hidden).map((s, k) => (
          <SupportGlyph key={k} s={s} n={nm.get(s.node)!} t={t} out={outward(p.model, nm.get(s.node)!)} />
        ))}
      </g>
      {/* node labels */}
      {p.nodeLabels !== false &&
        p.model.nodes.map((n) => {
          const label = n.label ?? n.id
          if (!label) return null
          const o = outward(p.model, n)
          const sup = p.model.supports.some((s) => s.node === n.id)
          let dx = o[0] * 16,
            dy = -o[1] * 16
          if (sup) {
            // put label beside the support glyph
            dx = o[0] !== 0 && Math.abs(o[0]) > 0.7 ? o[0] * 18 : -16
            dy = Math.abs(o[0]) > 0.7 ? -12 : -10
          }
          if (Math.abs(dx) < 4 && Math.abs(dy) < 4) dy = -14
          return (
            <text
              key={'nl' + n.id}
              x={t.x(n.x) + dx}
              y={t.y(n.y) + dy + 4}
              fontSize={13}
              fontWeight={700}
              textAnchor="middle"
              fill="var(--c-ink)"
              onClick={p.onNodeClick ? () => p.onNodeClick!(n.id) : undefined}
              style={{ cursor: p.onNodeClick ? 'pointer' : undefined }}
            >
              {label}
            </text>
          )
        })}
      {/* free ends: one framed member, no support, no hinge — tag them so they aren't mistaken for pins */}
      {p.model.nodes.map((n) => {
        const ms = connected(p.model, n.id)
        if (p.freeEnds === false || ms.length !== 1 || ms[0].truss || n.hinge || p.model.supports.some((s) => s.node === n.id)) return null
        const o = outward(p.model, n)
        const horiz = Math.abs(o[0]) > 0.7
        return (
          <text
            key={'fe' + n.id}
            x={t.x(n.x) + (horiz ? o[0] * 16 : 0)}
            y={t.y(n.y) + (horiz ? 20 : -o[1] * 16 + (o[1] > 0 ? -14 : 18))}
            fontSize={10.5}
            fontStyle="italic"
            textAnchor={horiz ? (o[0] > 0 ? 'start' : 'end') : 'middle'}
            fill="var(--c-mute)"
            style={{ pointerEvents: 'none' }}
          >
            free end
          </text>
        )
      })}
      {/* loads */}
      {showLoads && loads.map((l, k) => <LoadGlyph key={k} l={l} model={p.model} t={t} fu={fu} />)}
      {/* dims */}
      {[...dimsX.map((d) => ({ ...d, off: 30 + (d.off ?? 0) })), ...(p.dims ?? [])].map((d, k) => (
        <DimGlyph key={'d' + k} d={d} t={t} />
      ))}
      {dimsY.map((d, k) => (
        <DimGlyph key={'dy' + k} d={{ ...d, off: 30 + (d.off ?? 0) }} t={t} />
      ))}
      {p.children?.(t)}
    </svg>
  )
}

export function fmtLen(v: number, unit: string) {
  const r = Math.round(v * 100) / 100
  return `${r}${unit}`
}

function SupportGlyph({ s, n, t, out }: { s: Support; n: SNode; t: Transform; out: [number, number] }) {
  const cx = t.x(n.x)
  const cy = t.y(n.y)
  // axis a: from support base toward node (screen coords, y down)
  let ax: number, ay: number
  if (s.type === 'roller' || s.type === 'link') {
    const ang = ((s.dir ?? 90) * Math.PI) / 180
    let rx = Math.abs(Math.cos(ang)) < 1e-9 ? 0 : Math.cos(ang)
    let ry = Math.abs(Math.sin(ang)) < 1e-9 ? 0 : Math.sin(ang)
    // choose sign so the glyph sits on the outward side
    if (rx * out[0] + ry * out[1] > 1e-6) {
      rx = -rx
      ry = -ry
    }
    ax = rx
    ay = -ry
  } else if (s.type === 'pin') {
    // pins sit below the joint unless the structure clearly hangs from them
    const up = out[1] > 0.5 && Math.abs(out[1]) >= Math.abs(out[0])
    ax = 0
    ay = up ? 1 : -1
  } else {
    const o = snapAxis(out)
    ax = -o[0]
    ay = o[1]
  }
  const h = 16
  const w = 11
  const bx = cx - ax * h
  const by = cy - ay * h
  const px = -ay
  const py = ax
  const tri = `M${cx},${cy} L${bx + px * w},${by + py * w} L${bx - px * w},${by - py * w} Z`
  const ground = (gx: number, gy: number, len = 15) => (
    <g>
      <line x1={gx + px * len} y1={gy + py * len} x2={gx - px * len} y2={gy - py * len} stroke="var(--c-mute)" strokeWidth={2} />
      {[-12, -6, 0, 6, 12].map((o) => (
        <line key={o} x1={gx + px * o} y1={gy + py * o} x2={gx + px * o - ax * 6 - px * 5} y2={gy + py * o - ay * 6 - py * 5} stroke="var(--c-mute)" strokeWidth={1.2} />
      ))}
    </g>
  )
  if (s.type === 'fixed') {
    const len = 16
    return (
      <g>
        <line x1={cx + px * len} y1={cy + py * len} x2={cx - px * len} y2={cy - py * len} stroke="var(--c-mute)" strokeWidth={3} />
        {[-14, -7, 0, 7, 14].map((o) => (
          <line key={o} x1={cx + px * o} y1={cy + py * o} x2={cx + px * o - ax * 8 - px * 6} y2={cy + py * o - ay * 8 - py * 6} stroke="var(--c-mute)" strokeWidth={1.3} />
        ))}
      </g>
    )
  }
  if (s.type === 'link') {
    const ex = cx - ax * 26
    const ey = cy - ay * 26
    return (
      <g>
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--c-mute)" strokeWidth={2.5} />
        <circle cx={cx - ax * 3} cy={cy - ay * 3} r={3} fill="var(--c-panel)" stroke="var(--c-mute)" strokeWidth={1.5} />
        <circle cx={ex} cy={ey} r={3} fill="var(--c-panel)" stroke="var(--c-mute)" strokeWidth={1.5} />
        {ground(ex - ax * 3, ey - ay * 3, 11)}
      </g>
    )
  }
  if (s.type === 'guide') {
    return (
      <g>
        <rect x={cx - 9} y={cy - 9} width={18} height={18} fill="none" stroke="var(--c-mute)" strokeWidth={2} transform={`rotate(${(Math.atan2(ay, ax) * 180) / Math.PI} ${cx} ${cy})`} />
        <circle cx={bx + px * 6} cy={by + py * 6} r={3} fill="none" stroke="var(--c-mute)" strokeWidth={1.5} />
        <circle cx={bx - px * 6} cy={by - py * 6} r={3} fill="none" stroke="var(--c-mute)" strokeWidth={1.5} />
        {ground(bx - ax * 4, by - ay * 4)}
      </g>
    )
  }
  return (
    <g>
      <path d={tri} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeWidth={1.8} />
      {s.type === 'roller' ? (
        <>
          <circle cx={bx - ax * 4 + px * 5} cy={by - ay * 4 + py * 5} r={3.4} fill="var(--c-panel)" stroke="var(--c-mute)" strokeWidth={1.5} />
          <circle cx={bx - ax * 4 - px * 5} cy={by - ay * 4 - py * 5} r={3.4} fill="var(--c-panel)" stroke="var(--c-mute)" strokeWidth={1.5} />
          {ground(bx - ax * 8, by - ay * 8)}
        </>
      ) : (
        ground(bx, by)
      )}
    </g>
  )
}

function fmtF(v: number) {
  const r = Math.abs(v)
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/\.?0+$/, '')
}

function LoadGlyph({ l, model, t, fu }: { l: Load; model: Model; t: Transform; fu: string }) {
  const nm = new Map(model.nodes.map((n) => [n.id, n]))
  const arrow = (wx: number, wy: number, fx: number, fy: number, label: string, len = 42, hang = false) => {
    const mag = Math.hypot(fx, fy)
    if (mag < 1e-12) return null
    const ux = fx / mag
    const uy = -fy / mag // screen
    // hanging style: tail at the joint, head pointing away (used when the tail side is inside the structure)
    const hx = t.x(wx) + (hang ? ux * (len + 4) : 0)
    const hy = t.y(wy) + (hang ? uy * (len + 4) : 0)
    const sx = hx - ux * len
    const sy = hy - uy * len
    return (
      <g>
        <line x1={sx} y1={sy} x2={hx - ux * 3} y2={hy - uy * 3} stroke="var(--c-load)" strokeWidth={2.2} markerEnd="url(#arw)" />
        <text x={sx - ux * 10 + (Math.abs(uy) > 0.5 ? 0 : 0)} y={sy - uy * 10 + 4} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--c-load)">
          {label}
        </text>
      </g>
    )
  }
  const momentGlyph = (wx: number, wy: number, m: number, label: string) => {
    const cx = t.x(wx)
    const cy = t.y(wy)
    const r = 16
    // ccw positive: arc drawn ccw (screen: sweep 0)
    const ccw = m > 0
    const a0 = (-140 * Math.PI) / 180
    const a1 = (140 * Math.PI) / 180
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)]
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)]
    const d = ccw ? `M${p1[0]},${p1[1]} A${r},${r} 0 1,0 ${p0[0]},${p0[1]}` : `M${p0[0]},${p0[1]} A${r},${r} 0 1,1 ${p1[0]},${p1[1]}`
    return (
      <g>
        <path d={d} fill="none" stroke="var(--c-load)" strokeWidth={2} markerEnd="url(#arw)" />
        <text x={cx + 20} y={cy - 18} fontSize={12.5} fontWeight={700} fill="var(--c-load)">
          {label}
        </text>
      </g>
    )
  }
  if (l.kind === 'node') {
    const n = nm.get(l.node)!
    const o = outward(model, n)
    const mag = Math.hypot(l.fx ?? 0, l.fy ?? 0) || 1
    const hang = ((l.fx ?? 0) * o[0] + (l.fy ?? 0) * o[1]) / mag > 0.5 && model.members.filter((m) => m.i === n.id || m.j === n.id).length > 1
    const lab = l.label ?? `${fmtF(Math.hypot(l.fx ?? 0, l.fy ?? 0))}${fu}`
    return (
      <g>
        {hang ? (
          <g>
            {arrow(n.x, n.y, l.fx ?? 0, l.fy ?? 0, '', 34, true)}
            <text x={t.x(n.x) + ((l.fx ?? 0) / mag) * 48 + 4} y={t.y(n.y) - ((l.fy ?? 0) / mag) * 48 + 8} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--c-load)">
              {lab}
            </text>
          </g>
        ) : (
          arrow(n.x, n.y, l.fx ?? 0, l.fy ?? 0, lab)
        )}
        {l.m ? momentGlyph(n.x, n.y, l.m, l.label ?? `${fmtF(l.m)} ${fu}-ft`) : null}
      </g>
    )
  }
  const mem = model.members.find((m) => m.id === l.member)!
  const a = nm.get(mem.i)!
  const b = nm.get(mem.j)!
  const L = Math.hypot(b.x - a.x, b.y - a.y)
  const c = (b.x - a.x) / L
  const s = (b.y - a.y) / L
  const at = (d: number): [number, number] => [a.x + c * d, a.y + s * d]
  if (l.kind === 'point') {
    const [px, py] = at(l.a)
    let fx = l.fx ?? 0,
      fy = l.fy ?? 0
    if (l.local) {
      const gx = c * fx - s * fy
      const gy = s * fx + c * fy
      fx = gx
      fy = gy
    }
    return (
      <g>
        {arrow(px, py, fx, fy, l.label ?? `${fmtF(Math.hypot(fx, fy))}${fu}`)}
        {l.m ? momentGlyph(px, py, l.m, l.label ?? `${fmtF(l.m)} ${fu}-ft`) : null}
      </g>
    )
  }
  // distributed
  const d0 = l.a ?? 0
  const d1 = l.b ?? L
  const w1 = l.w1
  const w2 = l.w2 ?? l.w1
  const wmax = Math.max(Math.abs(w1), Math.abs(w2)) || 1
  let ux: number, uy: number // world direction of load
  if (l.dir === 'y') {
    ux = 0
    uy = Math.sign(w1 || w2)
  } else if (l.dir === 'x') {
    ux = Math.sign(w1 || w2)
    uy = 0
  } else {
    ux = -s * Math.sign(w1 || w2)
    uy = c * Math.sign(w1 || w2)
  }
  const n = Math.max(4, Math.round(((d1 - d0) * t.k) / 22))
  const maxLen = 30
  const arrows = []
  const top: string[] = []
  for (let i = 0; i <= n; i++) {
    const d = d0 + ((d1 - d0) * i) / n
    const w = w1 + ((w2 - w1) * i) / n
    const len = (Math.abs(w) / wmax) * maxLen
    const [px, py] = at(d)
    const hx = t.x(px)
    const hy = t.y(py)
    const sx = hx - ux * len
    const sy = hy + uy * len
    top.push(`${sx},${sy}`)
    if (len > 4)
      arrows.push(<line key={i} x1={sx} y1={sy} x2={hx - ux * 2} y2={hy + uy * 2} stroke="var(--c-load)" strokeWidth={1.4} markerEnd="url(#arw)" />)
  }
  const mid = top[Math.floor(top.length / 2)].split(',').map(Number)
  const txt = l.label ?? (w1 === w2 || l.w2 === undefined ? `${fmtF(w1)} ${fu}/ft` : `${fmtF(w1)}→${fmtF(w2)} ${fu}/ft`)
  return (
    <g>
      {arrows}
      <polyline points={top.join(' ')} fill="none" stroke="var(--c-load)" strokeWidth={1.6} />
      <text x={mid[0] - ux * 12} y={mid[1] + uy * 12 - (uy !== 0 ? 0 : 0) + (uy < 0 ? -2 : 12)} fontSize={12.5} fontWeight={700} textAnchor="middle" fill="var(--c-load)">
        {txt}
      </text>
    </g>
  )
}

function DimGlyph({ d, t }: { d: Dim; t: Transform }) {
  const x1 = t.x(d.from[0]),
    y1 = t.y(d.from[1]),
    x2 = t.x(d.to[0]),
    y2 = t.y(d.to[1])
  const L = Math.hypot(x2 - x1, y2 - y1)
  if (L < 2) return null
  const nx = -(y2 - y1) / L
  const ny = (x2 - x1) / L
  // offset toward "below" for horizontal (ny>0 is down in screen coords for left->right)
  const off = d.off ?? 28
  const sgn = Math.abs(ny) > 0.5 ? (ny > 0 ? 1 : -1) : nx > 0 ? 1 : -1
  const ox = nx * off * sgn
  const oy = ny * off * sgn
  const a = [x1 + ox, y1 + oy]
  const b = [x2 + ox, y2 + oy]
  const tick = (p: number[]) => (
    <line x1={p[0] - 4} y1={p[1] + 4} x2={p[0] + 4} y2={p[1] - 4} stroke="var(--c-faint)" strokeWidth={1.3} />
  )
  const vertical = Math.abs(x2 - x1) < 1
  return (
    <g>
      <line x1={x1 + ox * 0.3} y1={y1 + oy * 0.3} x2={a[0] + ox * 0.15} y2={a[1] + oy * 0.15} stroke="var(--c-faint)" strokeWidth={0.8} strokeDasharray="2 3" />
      <line x1={x2 + ox * 0.3} y1={y2 + oy * 0.3} x2={b[0] + ox * 0.15} y2={b[1] + oy * 0.15} stroke="var(--c-faint)" strokeWidth={0.8} strokeDasharray="2 3" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--c-faint)" strokeWidth={1} />
      {tick(a)}
      {tick(b)}
      {d.text && (
        <text
          x={(a[0] + b[0]) / 2 + (vertical ? 8 : 0)}
          y={(a[1] + b[1]) / 2 + (vertical ? 4 : 14)}
          fontSize={12}
          textAnchor={vertical ? 'start' : 'middle'}
          fill="var(--c-mute)"
          className="num"
        >
          {d.text}
        </text>
      )}
    </g>
  )
}
