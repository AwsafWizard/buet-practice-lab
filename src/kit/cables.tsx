// Plots and step solutions for cables, suspension bridges and arches.

import { useMemo } from 'react'
import { stiffenedSuspension, threeHingedArch, type PointLoad } from '../engine/cable'
import { fmt } from '../components/DiagramView'
import { Tex } from '../components/ui'

/** generic 1-D function plot (SFD / BMD of a girder) */
export function FnPlot({ f, x0, x1, title, color = 'var(--c-moment)', marks = [], height = 170, jumps = [] }: { f: (x: number, side?: -1 | 1) => number; x0: number; x1: number; title: string; color?: string; marks?: number[]; height?: number; jumps?: number[] }) {
  const W = 820,
    pad = 60,
    H = height
  const xs: number[] = []
  const N = 400
  for (let i = 0; i <= N; i++) xs.push(x0 + ((x1 - x0) * i) / N)
  const pts: { x: number; y: number }[] = []
  const all = [...new Set([...xs, ...jumps.flatMap((j) => [j - 1e-7, j + 1e-7])])].sort((a, b) => a - b)
  for (const x of all) pts.push({ x, y: f(x) })
  const ymax = Math.max(1e-9, ...pts.map((p) => Math.abs(p.y)))
  const X = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - 2 * pad)
  const Y = (y: number) => H / 2 - (y / ymax) * (H / 2 - 22)
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x)},${Y(p.y)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
        {title}
      </text>
      <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke="var(--c-faint)" />
      <path d={`${d} L${X(x1)},${Y(0)} L${X(x0)},${Y(0)} Z`} fill={color} fillOpacity={0.15} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
      {marks.map((x, i) => {
        const v = f(x)
        return (
          <g key={i}>
            <circle cx={X(x)} cy={Y(v)} r={3} fill={color} />
            <text x={X(x)} y={Y(v) + (v >= 0 ? -8 : 16)} fontSize={11} textAnchor="middle" className="num" fill="var(--c-ink)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
              {fmt(v)}
            </text>
            <text x={X(x)} y={H - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-faint)">
              {fmt(x)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function SuspensionSolution({ L, h, xh, loads, w = 0, marks, unit = 'k', lenUnit = 'ft', panel }: { L: number; h: number; xh: number; loads: PointLoad[]; w?: number; marks?: number[]; unit?: string; lenUnit?: string; panel?: number }) {
  const s = useMemo(() => stiffenedSuspension({ L, h, xh, loads, w }), [L, h, xh, loads, w])
  const mk = marks ?? [...new Set([0, xh, ...loads.map((p) => p.x), L / 4, (3 * L) / 4, L])].sort((a, b) => a - b)
  return (
    <div className="space-y-2 text-sm">
      <p>
        The cable is parabolic, so the hangers carry a <b>uniform</b> upward load q on the girder. Cable sag at x: <Tex>{`y(x) = \\frac{4h\\,x(L-x)}{L^2}`}</Tex>. Girder moment = simple-beam moment − H·y:
      </p>
      <Tex block>{`M(x) = M_0(x) - H\\,y(x),\\qquad \\text{hinge at } x = ${fmt(xh)}:\\ M = 0 \\Rightarrow H = \\frac{M_0(${fmt(xh)})}{y(${fmt(xh)})} = \\frac{${fmt(s.M0h)}}{${fmt(s.ys(xh))}} = \\mathbf{${fmt(s.H)}}\\ ${unit}`}</Tex>
      <Tex block>{`q = \\frac{8Hh}{L^2} = ${fmt(s.q, 4)}\\ ${unit}/${lenUnit}${panel ? `\\Rightarrow \\text{hanger force} = q\\times ${panel} = \\mathbf{${fmt(s.q * panel)}}\\ ${unit}` : ''},\\qquad T_{max} = \\sqrt{H^2 + (qL/2)^2} = ${fmt(s.Tmax)}\\ ${unit}`}</Tex>
      <div className="rounded-xl bg-bg/60 border border-line">
        <FnPlot f={(x) => s.V(x)} x0={0} x1={L} title={`Girder SFD (${unit})`} color="var(--c-shear)" marks={mk} jumps={loads.map((p) => p.x)} />
        <FnPlot f={(x) => s.M(x)} x0={0} x1={L} title={`Girder BMD (${unit}-${lenUnit})`} marks={mk} />
      </div>
    </div>
  )
}

export function ArchSolution({ L, h, loads, udl, at, unit = 'kN', lenUnit = 'm' }: { L: number; h: number; loads: PointLoad[]; udl?: { w: number; a: number; b: number }; at: number; unit?: string; lenUnit?: string }) {
  const a = useMemo(() => threeHingedArch({ L, h, loads, udl }), [L, h, loads, udl])
  const r = a.at(at)
  return (
    <div className="text-sm space-y-1">
      <Tex block>{`y = \\frac{4h}{L^2}x(L-x),\\quad H = \\frac{M_0(\\text{crown})}{h} = \\mathbf{${fmt(a.H)}}\\ ${unit},\\quad V_A = ${fmt(a.RA)}\\ ${unit}`}</Tex>
      <Tex block>{`\\text{At } x = ${fmt(at)}:\\ y = ${fmt(r.y, 4)},\\ \\tan\\theta = ${fmt(Math.tan(r.theta), 4)}\\ (\\theta = ${fmt((r.theta * 180) / Math.PI, 3)}^\\circ)`}</Tex>
      <Tex block>{`M = M_0 - Hy = \\mathbf{${fmt(r.M)}}\\ ${unit}\\text{-}${lenUnit},\\quad N = V\\sin\\theta + H\\cos\\theta = \\mathbf{${fmt(r.N)}}\\ ${unit}\\ (\\text{comp.}),\\quad Q = V\\cos\\theta - H\\sin\\theta = \\mathbf{${fmt(r.Q)}}\\ ${unit}`}</Tex>
    </div>
  )
}
