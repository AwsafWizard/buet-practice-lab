// Drawing of a confined-seepage section with its flow net: soil, water, structure / sheet pile, impermeable base,
// flow lines and equipotentials from the solver, optional heave prism, probe point with a piezometer, drag handles.

import { useId, useRef, type ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import type { ExitInfo, FlowSol, HeaveInfo, NetLines } from '../../engine/flownet'

export type NetKind = 'pile' | 'dam' | 'wall'

export interface Frame {
  x0: number
  x1: number
  z0: number
  z1: number
}

export function frameOf(sol: FlowSol, pad = 1.4): Frame {
  const g = sol.g
  const T = Math.max(g.zU, g.zD)
  const side = Math.max(pad * T, 5)
  return { x0: -side, x1: Math.max(0, g.B) + side, z0: -0.7, z1: Math.max(g.hU, g.hD, g.zU, g.zD) + 1.2 }
}

export interface Handle {
  id: string
  x: number
  z: number
  /** drag direction */
  dir: 'x' | 'z'
  label: string
  onDrag: (x: number, z: number) => void
}

const W = 760

export function NetView({
  sol,
  net,
  kind,
  frame,
  xScale = 1,
  probe,
  prism,
  exit,
  handles,
  onProbe,
  onDragState,
  dims = true,
  children,
}: {
  sol: FlowSol
  net?: NetLines | null
  kind: NetKind
  frame?: Frame
  /** transformed section: x multiplied by √(kz/kx) */
  xScale?: number
  probe?: { x: number; z: number; h: number } | null
  prism?: HeaveInfo | null
  exit?: ExitInfo | null
  handles?: Handle[]
  onProbe?: (x: number, z: number) => void
  onDragState?: (dragging: boolean) => void
  dims?: boolean
  children?: ReactNode
}) {
  const g = sol.g
  const fr = frame ?? frameOf(sol)
  const pad = 26
  const k = (W - 2 * pad) / ((fr.x1 - fr.x0) * xScale)
  const Hpx = Math.round((fr.z1 - fr.z0) * k + 2 * pad)
  const X = (x: number) => pad + (x * xScale - fr.x0 * xScale) * k
  const Y = (z: number) => pad + (fr.z1 - z) * k
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<Handle | null>(null)
  const clip = useId().replace(/:/g, '')
  const B = Math.max(0, g.B)
  const zB = g.B > 0 ? sol.iz.zB * sol.dz : 0
  const zU = sol.iz.zU * sol.dz
  const zD = sol.iz.zD * sol.dz
  const tipU = sol.iz.tipU !== null ? sol.iz.tipU * sol.dz : null
  const tipD = sol.iz.tipD !== null ? sol.iz.tipD * sol.dz : null

  const toWorld = (e: React.PointerEvent) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    return { x: (p.x - pad) / k / xScale + fr.x0, z: fr.z1 - (p.y - pad) / k }
  }

  // soil outline
  const soil = B > 0 ? [[fr.x0, 0], [fr.x0, zU], [0, zU], [0, zB], [B, zB], [B, zD], [fr.x1, zD], [fr.x1, 0]] : [[fr.x0, 0], [fr.x0, zU], [0, zU], [0, zD], [fr.x1, zD], [fr.x1, 0]]
  const soilPath = soil.map(([x, z], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(z).toFixed(1)}`).join('') + 'Z'
  const poly = (pts: number[][]) => pts.map(([x, z], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(z).toFixed(1)}`).join('') + 'Z'
  const line = (l: [number, number][]) => l.map(([x, z], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(z).toFixed(1)}`).join('')

  // structure
  let structure: ReactNode = null
  if (kind === 'dam' && B > 0) {
    const crest = Math.max(g.hU, zU) + 0.6
    const cw = Math.min(0.18 * B, 2.5)
    const toeTop = Math.max(g.hD, zD) + 0.3
    structure = <path d={poly([[0, zB], [0, crest], [cw, crest], [B, toeTop], [B, zB]])} fill="var(--c-conc)" stroke="var(--c-ink)" strokeWidth={1.4} />
  } else if (kind === 'wall' && B > 0) {
    structure = <path d={poly([[0, zB], [0, zU + 0.3], [B, zU + 0.3], [B, zB]])} fill="var(--c-conc)" stroke="var(--c-ink)" strokeWidth={1.4} />
  }
  const wl = (x0: number, x1: number, z: number) => (
    <g>
      <line x1={X(x0)} y1={Y(z)} x2={X(x1)} y2={Y(z)} stroke="var(--c-water)" strokeWidth={1.4} />
      <path d={`M${X((x0 + x1) / 2) - 5},${Y(z) - 9}L${X((x0 + x1) / 2) + 5},${Y(z) - 9}L${X((x0 + x1) / 2)},${Y(z) - 1}Z`} fill="var(--c-water)" />
    </g>
  )
  const dimV = (x: number, za: number, zb: number, text: string, side: 1 | -1 = 1) => (
    <g fontSize={10.5} fill="var(--c-mute)">
      <line x1={X(x)} y1={Y(za)} x2={X(x)} y2={Y(zb)} stroke="var(--c-mute)" strokeWidth={0.8} markerStart={`url(#a${clip})`} markerEnd={`url(#a${clip})`} />
      <text x={X(x) + 4 * side} y={(Y(za) + Y(zb)) / 2 + 3} textAnchor={side > 0 ? 'start' : 'end'}>
        {text}
      </text>
    </g>
  )
  const xs = [fr.x0 + 0.6, fr.x1 - 0.6]
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${Hpx}`}
      className="w-full select-none touch-none"
      style={{ maxHeight: 520 }}
      onPointerDown={(e) => {
        if (drag.current) return
        const p = toWorld(e)
        if (p && onProbe) onProbe(p.x, p.z)
      }}
      onPointerMove={(e) => {
        const h = drag.current
        if (!h) return
        const p = toWorld(e)
        if (p) h.onDrag(p.x, p.z)
      }}
      onPointerUp={() => {
        if (drag.current) {
          drag.current = null
          onDragState?.(false)
        }
      }}
      onPointerLeave={() => {
        if (drag.current) {
          drag.current = null
          onDragState?.(false)
        }
      }}
    >
      <defs>
        <clipPath id={`c${clip}`}>
          <path d={soilPath} />
        </clipPath>
        <marker id={`a${clip}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" fill="var(--c-mute)" />
        </marker>
        <pattern id={`h${clip}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--c-mute)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* water */}
      {g.hU > zU + 1e-6 && <rect x={X(fr.x0)} y={Y(g.hU)} width={X(0) - X(fr.x0)} height={Y(zU) - Y(g.hU)} fill="var(--c-water)" opacity={0.13} />}
      {g.hD > zD + 1e-6 && <rect x={X(B)} y={Y(g.hD)} width={X(fr.x1) - X(B)} height={Y(zD) - Y(g.hD)} fill="var(--c-water)" opacity={0.13} />}
      {wl(fr.x0 + 0.3, Math.min(-0.3, fr.x0 + (0 - fr.x0) * 0.6), g.hU)}
      {wl(Math.max(B + 0.3, B + (fr.x1 - B) * 0.4), fr.x1 - 0.3, g.hD)}
      {/* soil */}
      <path d={soilPath} fill="var(--c-soil)" opacity={0.35} stroke="var(--c-ink)" strokeWidth={1} />
      {/* impermeable base */}
      <rect x={X(fr.x0)} y={Y(0)} width={X(fr.x1) - X(fr.x0)} height={Math.max(6, Y(fr.z0) - Y(0))} fill={`url(#h${clip})`} opacity={0.6} />
      <line x1={X(fr.x0)} y1={Y(0)} x2={X(fr.x1)} y2={Y(0)} stroke="var(--c-ink)" strokeWidth={1.6} />
      <text x={X(fr.x1) - 4} y={Y(0) + 12} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        impermeable
      </text>
      {/* net */}
      {net && (
        <g clipPath={`url(#c${clip})`}>
          {net.equip.map((e, i) => (
            <path key={'e' + i} d={e.lines.map(line).join('')} fill="none" stroke="var(--c-accent)" strokeWidth={1.1} strokeDasharray="5 3" />
          ))}
          {net.flow.map((f, i) => (
            <path key={'f' + i} d={f.lines.map(line).join('')} fill="none" stroke="var(--c-water)" strokeWidth={1.5} />
          ))}
        </g>
      )}
      {/* heave prism */}
      {prism && (
        <g>
          <rect x={X(B)} y={Y(zD)} width={X(B + prism.D / 2) - X(B)} height={Y(zD - prism.D) - Y(zD)} fill="var(--c-load)" opacity={0.12} stroke="var(--c-load)" strokeDasharray="4 3" />
          <text x={X(B + prism.D / 4)} y={Y(zD - prism.D) + 13} fontSize={10} textAnchor="middle" fill="var(--c-load)">
            D/2 prism · FS {fmt(prism.FS, 2)}
          </text>
        </g>
      )}
      {/* last field */}
      {exit && Number.isFinite(exit.l) && (
        <g stroke="var(--c-load)" strokeWidth={4} opacity={0.75} strokeLinecap="round">
          {exit.along === 'pile' ? <line x1={X(B) + 3} y1={Y(zD)} x2={X(B) + 3} y2={Y(zD - exit.l)} /> : <line x1={X(B)} y1={Y(zB) + 3} x2={X(B - Math.min(B, exit.l))} y2={Y(zB) + 3} />}
        </g>
      )}
      {structure}
      {/* sheet pile / cut-offs */}
      {B === 0 && tipU !== null && <line x1={X(0)} y1={Y(tipU)} x2={X(0)} y2={Y(Math.max(g.hU, zU) + 0.6)} stroke="var(--c-ink)" strokeWidth={4} />}
      {B > 0 && tipU !== null && tipU < zB && <line x1={X(0)} y1={Y(tipU)} x2={X(0)} y2={Y(zB)} stroke="var(--c-ink)" strokeWidth={4} />}
      {B > 0 && tipD !== null && tipD < zB && <line x1={X(B)} y1={Y(tipD)} x2={X(B)} y2={Y(zB)} stroke="var(--c-ink)" strokeWidth={4} />}
      {/* dimensions */}
      {dims && (
        <g>
          {dimV(xs[0], zU, 0, `${fmt(zU, 2)} m`)}
          {g.hU - zU > 0.05 && dimV(xs[0] + 1.6 / xScale, g.hU, zU, `${fmt(g.hU - zU, 2)} m`)}
          {g.hD - zD > 0.05 && dimV(xs[1], g.hD, zD, `${fmt(g.hD - zD, 2)} m`, -1)}
          {Math.abs(zD - zU) > 0.05 && dimV(xs[1], zD, 0, `${fmt(zD, 2)} m`, -1)}
          {B === 0 && tipU !== null && dimV(0.35 / xScale + 0.4, zD, tipU, `s = ${fmt(zD - tipU, 2)} m`)}
          {B > 0 && tipU !== null && tipU < zB && dimV(-0.5, zB, tipU, `${fmt(zB - tipU, 2)} m`, -1)}
          {B > 0 && tipD !== null && tipD < zB && dimV(B + 0.5, zB, tipD, `${fmt(zB - tipD, 2)} m`)}
          {B > 0 && (
            <g fontSize={10.5} fill="var(--c-mute)">
              <line x1={X(0)} y1={Y(zB) + 14} x2={X(B)} y2={Y(zB) + 14} stroke="var(--c-mute)" strokeWidth={0.8} markerStart={`url(#a${clip})`} markerEnd={`url(#a${clip})`} />
              <text x={(X(0) + X(B)) / 2} y={Y(zB) + 26} textAnchor="middle">
                B = {fmt(B, 2)} m
              </text>
            </g>
          )}
        </g>
      )}
      {/* probe with a piezometer */}
      {probe && Number.isFinite(probe.h) && (
        <g>
          <rect x={X(probe.x) - 2.5} y={Y(Math.max(probe.h, probe.z))} width={5} height={Math.max(0, Y(probe.z) - Y(Math.max(probe.h, probe.z)))} fill="var(--c-water)" opacity={0.55} />
          <line x1={X(probe.x) - 3.5} y1={Y(Math.max(probe.h, probe.z) + 0.4)} x2={X(probe.x) - 3.5} y2={Y(probe.z)} stroke="var(--c-ink)" strokeWidth={0.8} />
          <line x1={X(probe.x) + 3.5} y1={Y(Math.max(probe.h, probe.z) + 0.4)} x2={X(probe.x) + 3.5} y2={Y(probe.z)} stroke="var(--c-ink)" strokeWidth={0.8} />
          <path d={`M${X(probe.x) - 4},${Y(probe.h) - 7}L${X(probe.x) + 4},${Y(probe.h) - 7}L${X(probe.x)},${Y(probe.h) - 1}Z`} fill="var(--c-water)" />
          <circle cx={X(probe.x)} cy={Y(probe.z)} r={4.5} fill="var(--c-load)" stroke="var(--c-bg, #fff)" strokeWidth={1.5} />
          <text x={X(probe.x) + 8} y={Y(probe.z) + 4} fontSize={11} fontWeight={700} fill="var(--c-load)">
            P
          </text>
        </g>
      )}
      {children}
      {/* handles */}
      {handles?.map((h) => (
        <g
          key={h.id}
          style={{ cursor: h.dir === 'x' ? 'ew-resize' : 'ns-resize' }}
          onPointerDown={(e) => {
            e.stopPropagation()
            drag.current = h
            onDragState?.(true)
            ;(e.currentTarget.ownerSVGElement as SVGSVGElement | null)?.setPointerCapture?.(e.pointerId)
          }}
        >
          <circle cx={X(h.x)} cy={Y(h.z)} r={11} fill="transparent" />
          <circle cx={X(h.x)} cy={Y(h.z)} r={6} fill="var(--c-accent)" stroke="var(--c-bg, #fff)" strokeWidth={2} />
          <text x={X(h.x) + 9} y={Y(h.z) - 8} fontSize={9.5} fill="var(--c-accent)">
            {h.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** small x–y chart for uplift and exit-gradient profiles */
export function MiniChart({ pts, xLabel, yLabel, fill = 'var(--c-water)', hLine, hLabel, invert = false }: { pts: { x: number; y: number }[]; xLabel: string; yLabel: string; fill?: string; hLine?: number; hLabel?: string; invert?: boolean }) {
  if (!pts.length) return null
  const w = 360
  const h = 130
  const p = 30
  const x0 = Math.min(...pts.map((q) => q.x))
  const x1 = Math.max(...pts.map((q) => q.x))
  const yMax = Math.max(1e-9, ...pts.map((q) => q.y), hLine ?? 0) * 1.1
  const X = (x: number) => p + ((x - x0) / (x1 - x0 || 1)) * (w - p - 10)
  const Y = (y: number) => (invert ? 14 + (y / yMax) * (h - p - 14) : h - p - (y / yMax) * (h - p - 14))
  const base = invert ? 14 : h - p
  const d = `M${X(pts[0].x)},${base}` + pts.map((q) => `L${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`).join('') + `L${X(pts[pts.length - 1].x)},${base}Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[380px]">
      <path d={d} fill={fill} opacity={0.25} stroke={fill} strokeWidth={1.3} />
      <line x1={p} y1={base} x2={w - 10} y2={base} stroke="var(--c-line)" />
      <line x1={p} y1={14} x2={p} y2={h - p} stroke="var(--c-line)" />
      {hLine !== undefined && (
        <g>
          <line x1={p} y1={Y(hLine)} x2={w - 10} y2={Y(hLine)} stroke="var(--c-bad)" strokeDasharray="4 3" />
          <text x={w - 12} y={Y(hLine) - 3} fontSize={9} textAnchor="end" fill="var(--c-bad)">
            {hLabel}
          </text>
        </g>
      )}
      <text x={(p + w) / 2} y={h - 6} fontSize={9.5} textAnchor="middle" fill="var(--c-mute)">
        {xLabel}
      </text>
      <text x={4} y={invert ? h - p : 12} fontSize={9.5} fill="var(--c-mute)">
        {yLabel}
      </text>
      <text x={p - 3} y={invert ? h - p : 18} fontSize={8.5} textAnchor="end" fill="var(--c-mute)">
        {fmt(yMax / 1.1, 1)}
      </text>
    </svg>
  )
}
