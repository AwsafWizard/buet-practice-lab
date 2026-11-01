import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { keyValues, type DiagramMember } from '../engine/diagrams'
import type { Model } from '../engine/model'
import { useStore } from '../store'
import { makeTransform, StructureView, type Transform } from './StructureView'

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
  freeEnds?: boolean
}

const FONT = 11.5
const FONT_FOCUS = 14

export function DiagramView(p: DiagramViewProps) {
  const [big, setBig] = useState(false)
  return (
    <div className="relative group/dv">
      <DiagramCanvas {...p} />
      <button
        className="no-print absolute top-1 right-1 rounded-md border border-line bg-panel/80 px-1.5 py-0.5 text-xs text-mute hover:text-ink hover:bg-panel2 opacity-70 group-hover/dv:opacity-100"
        title="Enlarge"
        onClick={() => setBig(true)}
      >
        ⤢
      </button>
      {big && <BigView {...p} onClose={() => setBig(false)} />}
    </div>
  )
}

function BigView({ onClose, ...p }: DiagramViewProps & { onClose: () => void }) {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const rs = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('keydown', key)
    window.addEventListener('resize', rs)
    return () => {
      window.removeEventListener('keydown', key)
      window.removeEventListener('resize', rs)
    }
  }, [onClose])
  return createPortal(
    <div className="no-print fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm flex flex-col p-3" onClick={onClose}>
      <div className="flex items-center gap-2 mb-2">
        <div className="font-semibold text-sm">{KIND_NAME[p.kind]}</div>
        <button className="btn ml-auto !py-1" onClick={onClose}>
          ✕ Close
        </button>
      </div>
      <div className="flex-1 min-h-0 grid place-items-center overflow-auto" onClick={(e) => e.stopPropagation()}>
        <DiagramCanvas {...p} maxHeight={Math.max(300, vp.h - 170)} maxWidth={Math.max(400, vp.w - 40)} big />
      </div>
    </div>,
    document.body,
  )
}

interface Label {
  x: number
  y: number
  v: number
  w: number
  h: number
}

interface Geom {
  d: DiagramMember
  poly: string
  line: string
  base: [number, number, number, number]
  labels: Label[]
}

function DiagramCanvas(p: DiagramViewProps & { maxWidth?: number; big?: boolean }) {
  const globalSide = useStore((s) => s.bmdSide)
  const side = p.side ?? globalSide
  const members = p.only ? p.members.filter((m) => p.only!.includes(m.id)) : p.members
  const maxAbs = useMemo(() => {
    let m = 0
    for (const d of members) for (const s of d.samples) m = Math.max(m, Math.abs(s[p.kind]))
    return m || 1
  }, [members, p.kind])
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const focus = hover ?? pinned
  const showLabels = p.labels ?? true
  // tall frames (several storeys) get a taller box, otherwise they end up a narrow strip
  const maxH = p.maxHeight ?? (aspect(p.model) >= 0.7 ? 540 : 340)
  const pad = p.pad ?? 80
  // same transform StructureView builds, so the caption can know what is drawn
  const t = useMemo(() => makeTransform(p.model.nodes.map((n) => [n.x, n.y]), p.maxWidth ?? 820, maxH, pad), [p.model, p.maxWidth, maxH, pad])
  const { geoms, shown, hidden } = useMemo(() => {
    const ord = ordinate(members, t, p.big ? 90 : 46)
    const geoms = members
      .map((d) => geometry(d, t, p.kind, ord / maxAbs, side, showLabels, p.grow ?? 1, p.big ? 1.15 : 1))
      .filter((g): g is Geom => g !== null)
    // place labels biggest-first; drop any that would sit on one already placed
    // joints count as taken so values don't sit on node letters
    const placed: Label[] = p.model.nodes.map((n) => ({ x: t.x(n.x), y: t.y(n.y), v: 0, w: 14, h: 14 }))
    const shown = new Set<Label>()
    let hidden = 0
    for (const l of geoms.flatMap((g) => g.labels).sort((a, b) => Math.abs(b.v) - Math.abs(a.v))) {
      if (placed.some((q) => Math.abs(q.x - l.x) < (q.w + l.w) / 2 + 2 && Math.abs(q.y - l.y) < (q.h + l.h) / 2 + 1)) {
        hidden++
        continue
      }
      placed.push(l)
      shown.add(l)
    }
    return { geoms, shown, hidden }
  }, [members, t, p.kind, maxAbs, side, showLabels, p.grow, p.big])
  const focused = geoms.find((g) => g.d.id === focus)

  const draw = () => {
    const col = COLORS[p.kind]
    const order = focused ? [...geoms.filter((g) => g !== focused), focused] : geoms
    return (
      <g>
        {order.map((g) => {
          const isF = g === focused
          const dim = !!focused && !isF
          const pick = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()
          return (
            <g
              key={g.d.id}
              style={{ cursor: 'pointer', transition: 'opacity 120ms' }}
              opacity={dim ? 0.15 : 1}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(g.d.id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
              onClick={(e) => {
                pick(e)
                setPinned(pinned === g.d.id ? null : g.d.id)
              }}
            >
              {isF && <line x1={g.base[0]} y1={g.base[1]} x2={g.base[2]} y2={g.base[3]} stroke={col} strokeWidth={5} strokeOpacity={0.5} strokeLinecap="round" />}
              <polygon points={g.poly} fill={col} fillOpacity={isF ? 0.32 : 0.18} stroke="none" />
              <polyline points={g.line} fill="none" stroke={col} strokeWidth={isF ? 2.6 : 1.8} />
              {/* generous invisible hit area: the diagram plus a band along the member */}
              <polygon points={g.poly} fill="transparent" stroke="transparent" strokeWidth={10} pointerEvents="all" />
              <line x1={g.base[0]} y1={g.base[1]} x2={g.base[2]} y2={g.base[3]} stroke="transparent" strokeWidth={16} pointerEvents="stroke" />
              {g.labels
                .filter((l) => (isF ? true : !dim && shown.has(l)))
                .map((l, i) => (
                  <text
                    key={i}
                    x={l.x}
                    y={l.y + (isF ? 5 : 4)}
                    fontSize={(isF ? FONT_FOCUS : FONT) * (p.big ? 1.15 : 1)}
                    textAnchor="middle"
                    fill="var(--c-ink)"
                    className="num"
                    fontWeight={isF ? 700 : 600}
                    pointerEvents="none"
                    style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: isF ? 4 : 3 }}
                  >
                    {fmt(l.v)}
                  </text>
                ))}
            </g>
          )
        })}
      </g>
    )
  }

  const svg = (
    <StructureView
      model={p.model}
      showLoads={p.showLoads ?? false}
      maxHeight={maxH}
      maxWidth={p.maxWidth}
      lenUnit={p.lenUnit}
      forceUnit={p.forceUnit}
      autoDimX={p.autoDimX}
      pad={pad}
      nodeLabels
      freeEnds={p.freeEnds}
      className={p.big ? 'w-full h-auto max-h-full' : undefined}
    >
      {draw}
    </StructureView>
  )
  const f = focused
  return (
    <div onClick={() => setPinned(null)} className={p.big ? 'w-full' : undefined}>
      {svg}
      {showLabels && members.length > 1 && (
        <div className="text-xs text-mute px-1 min-h-[1.25rem] num">
          {f ? (
            <>
              <span className="font-bold text-ink">{f.d.id}</span> · {kindShort(p.kind)}: {f.labels.map((l) => fmt(l.v)).join(' → ')}
              {pinned && <span className="ml-2 opacity-70">(tap empty space to clear)</span>}
            </>
          ) : (
            <span className="opacity-80">
              Hover or tap a member to isolate it{hidden > 0 ? ` · ${hidden} overlapping value${hidden > 1 ? 's' : ''} hidden — they show on hover` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function aspect(m: Model) {
  const xs = m.nodes.map((n) => n.x),
    ys = m.nodes.map((n) => n.y)
  const dx = Math.max(...xs) - Math.min(...xs)
  return dx > 1e-6 ? (Math.max(...ys) - Math.min(...ys)) / dx : 0
}

const kindShort = (k: DiagramKind) => (k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD')

/** Peak ordinate in px (46, or more when enlarged), shrunk so diagrams on parallel members (storeys, bays) don't run into each other. */
function ordinate(members: DiagramMember[], t: Transform, max: number) {
  let gap = Infinity
  const seg = members.map((d) => [t.x(d.x1), t.y(d.y1), t.x(d.x2), t.y(d.y2)])
  for (let a = 0; a < seg.length; a++)
    for (let b = a + 1; b < seg.length; b++) {
      const [ax, ay, bx, by] = seg[a]
      const [cx, cy, dx, dy] = seg[b]
      const L = Math.hypot(bx - ax, by - ay)
      const L2 = Math.hypot(dx - cx, dy - cy)
      if (L < 1e-6 || L2 < 1e-6) continue
      const ux = (bx - ax) / L,
        uy = (by - ay) / L
      if (Math.abs(ux * (dy - cy) - uy * (dx - cx)) / L2 > 0.02) continue // not parallel
      const dist = Math.abs(ux * (cy - ay) - uy * (cx - ax))
      if (dist < 1) continue // collinear (continuous beam)
      // only members whose extents overlap along their direction face each other
      const s = [(cx - ax) * ux + (cy - ay) * uy, (dx - ax) * ux + (dy - ay) * uy]
      if (Math.max(...s) <= 1 || Math.min(...s) >= L - 1) continue
      gap = Math.min(gap, dist)
    }
  return Math.min(max, Math.max(22, gap * 0.42))
}

function geometry(d: DiagramMember, t: Transform, kind: DiagramKind, scale: number, side: 'compression' | 'tension', labels: boolean, grow: number, fs: number): Geom | null {
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
  const keys = labels ? keyValues(d, kind) : []
  return {
    d,
    poly: [[x1, y1], ...pts, [x2, y2]].map((p) => p.join(',')).join(' '),
    line: pts.map((p) => p.join(',')).join(' '),
    base: [x1, y1, x2, y2],
    labels: keys
      .filter((k) => Math.abs(k.v) > 1e-6)
      .map((k) => {
        const f = k.t / d.L
        const bx = x1 + (x2 - x1) * f
        const by = y1 + (y2 - y1) * f
        const v = k.v * scale * sgn * grow
        const off = Math.sign(v || 1) * 12
        const txt = fmt(k.v)
        return { x: bx + nx * (v + off), y: by + ny * (v + off), v: k.v, w: txt.length * FONT * fs * 0.6 + 4, h: FONT * fs + 2 }
      }),
  }
}
