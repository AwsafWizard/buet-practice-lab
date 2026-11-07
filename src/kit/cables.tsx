// Plots and step solutions for cables, suspension bridges and arches.

import { useMemo } from 'react'
import { hangerGirder, stiffenedSuspension, threeHingedArch, type PointLoad } from '../engine/cable'
import { fmt } from '../components/DiagramView'
import { GhostPts, tipName } from '../components/PointTip'
import { Tex } from '../components/ui'

/** generic 1-D function plot (SFD / BMD of a girder) */
/** marks: dot + value + axis tick; labels: value only (e.g. mid-step of an SFD); ticks: axis tick only */
export function FnPlot({ f, x0, x1, title, color = 'var(--c-moment)', marks = [], height = 170, jumps = [], labels = [], ticks = [] }: { f: (x: number, side?: -1 | 1) => number; x0: number; x1: number; title: string; color?: string; marks?: number[]; height?: number; jumps?: number[]; labels?: number[]; ticks?: number[] }) {
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
  /** value label y: below a negative point unless that would hit the axis numbers */
  const ly = (v: number, gap: number) => (v >= 0 ? Y(v) - gap : Y(v) + 15 > H - 16 ? Y(v) - gap : Y(v) + 15)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
        {title}
      </text>
      <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke="var(--c-faint)" />
      <path d={`${d} L${X(x1)},${Y(0)} L${X(x0)},${Y(0)} Z`} fill={color} fillOpacity={0.15} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
      <GhostPts pts={pts.map((q) => ({ x: X(q.x), y: Y(q.y), tip: `${tipName(title) ? tipName(title) + ': ' : ''}${fmt(q.y, 3)} at x = ${fmt(q.x, 3)}` }))} />
      {marks.map((x, i) => {
        const v = f(x)
        return (
          <g key={i}>
            <circle cx={X(x)} cy={Y(v)} r={3} fill={color} data-tip={`x = ${fmt(x, 3)}: ${fmt(v, 3)}`} />
            <text x={X(x)} y={ly(v, 8)} fontSize={11} textAnchor="middle" className="num" fill="var(--c-ink)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
              {fmt(v)}
            </text>
            <text x={X(x)} y={H - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-faint)">
              {fmt(x)}
            </text>
          </g>
        )
      })}
      {labels.map((x, i) => {
        const v = f(x)
        return (
          <text key={`l${i}`} x={X(x)} y={ly(v, 7)} fontSize={11} textAnchor="middle" className="num" fill="var(--c-ink)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
            {fmt(v)}
          </text>
        )
      })}
      {ticks.map((x, i) => (
        <text key={`t${i}`} x={X(x)} y={H - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-faint)">
          {fmt(x)}
        </text>
      ))}
    </svg>
  )
}

/** girder free body like the class note: hanger pulls up, loads down, tower reactions, hinge */
function GirderFBD({ L, xh, loads, F, hangers, RA, RB, unit }: { L: number; xh: number; loads: PointLoad[]; F: number; hangers: PointLoad[]; RA: number; RB: number; unit: string }) {
  const W = 820,
    pad = 60,
    H = 150,
    yG = 82
  const X = (x: number) => pad + (x / L) * (W - 2 * pad)
  const reaction = (x: number, R: number) => {
    const up = R >= 0
    const y0 = up ? yG + 46 : yG - 46
    return (
      <g key={`r${x}`}>
        <line x1={X(x)} y1={y0} x2={X(x)} y2={up ? yG + 7 : yG - 7} stroke="var(--c-ink)" strokeWidth={1.8} markerEnd="url(#fbd-r)" />
        <text x={X(x) + (x === 0 ? -8 : 8)} y={up ? y0 + 2 : y0 + 4} fontSize={11.5} fontWeight={700} textAnchor={x === 0 ? 'end' : 'start'} className="num" fill="var(--c-ink)">
          {fmt(Math.abs(R))} {unit}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        {(
          [
            ['fbd-h', 'var(--c-accent)'],
            ['fbd-l', 'var(--c-load)'],
            ['fbd-r', 'var(--c-ink)'],
          ] as const
        ).map(([id, c]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={c} />
          </marker>
        ))}
      </defs>
      <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
        Girder free body (hanger pulls, loads, tower reactions)
      </text>
      <rect x={X(0)} y={yG - 4} width={X(L) - X(0)} height={8} rx={4} fill="var(--c-panel2)" stroke="var(--c-member)" strokeWidth={1.4} />
      {hangers.map((hg) => (
        <g key={`h${hg.x}`}>
          <line x1={X(hg.x)} y1={yG - 6} x2={X(hg.x)} y2={yG - 40} stroke="var(--c-accent)" strokeWidth={1.8} markerEnd="url(#fbd-h)" />
          <text x={X(hg.x)} y={yG - 46} fontSize={10.5} textAnchor="middle" className="num" fill="var(--c-accent)">
            {fmt(F)}
          </text>
        </g>
      ))}
      {loads.map((l) => (
        <g key={`p${l.x}`}>
          <line x1={X(l.x)} y1={yG + 6} x2={X(l.x)} y2={yG + 40} stroke="var(--c-load)" strokeWidth={2.2} markerEnd="url(#fbd-l)" />
          <text x={X(l.x)} y={yG + 54} fontSize={11.5} fontWeight={700} textAnchor="middle" className="num" fill="var(--c-load)">
            {fmt(l.P)} {unit}
          </text>
        </g>
      ))}
      {reaction(0, RA)}
      {reaction(L, RB)}
      <circle cx={X(xh)} cy={yG} r={5} fill="var(--c-bg)" stroke="var(--c-member)" strokeWidth={1.8} />
      {[0, L].map((x) => (
        <circle key={x} cx={X(x)} cy={yG} r={4} fill="var(--c-bg)" stroke="var(--c-member)" strokeWidth={1.8} />
      ))}
    </svg>
  )
}

export function SuspensionSolution({ L, h, xh, loads, w = 0, marks, unit = 'k', lenUnit = 'ft', panel }: { L: number; h: number; xh: number; loads: PointLoad[]; w?: number; marks?: number[]; unit?: string; lenUnit?: string; panel?: number }) {
  const s = useMemo(() => stiffenedSuspension({ L, h, xh, loads, w }), [L, h, xh, loads, w])
  const g = useMemo(() => (panel ? hangerGirder({ L, panel, q: s.q, loads, w }) : null), [L, panel, s.q, loads, w])
  const mk = marks ?? [...new Set([0, xh, ...loads.map((p) => p.x), L / 4, (3 * L) / 4, L])].sort((a, b) => a - b)
  return (
    <div className="space-y-2 text-sm">
      <p>
        The cable is parabolic, so the hangers carry a <b>uniform</b> upward load q on the girder. Cable sag at x: <Tex>{`y(x) = \\frac{4h\\,x(L-x)}{L^2}`}</Tex>. Girder moment = simple-beam moment − H·y:
      </p>
      <Tex block>{`M(x) = M_0(x) - H\\,y(x),\\qquad \\text{hinge at } x = ${fmt(xh)}:\\ M = 0 \\Rightarrow H = \\frac{M_0(${fmt(xh)})}{y(${fmt(xh)})} = \\frac{${fmt(s.M0h)}}{${fmt(s.ys(xh))}} = \\mathbf{${fmt(s.H)}}\\ ${unit}`}</Tex>
      <Tex block>{`q = \\frac{8Hh}{L^2} = ${fmt(s.q, 4)}\\ ${unit}/${lenUnit}${panel ? `\\Rightarrow \\text{hanger force} = q\\times ${panel} = \\mathbf{${fmt(s.q * panel)}}\\ ${unit}` : ''},\\qquad T_{max} = \\sqrt{H^2 + (qL/2)^2} = ${fmt(s.Tmax)}\\ ${unit}`}</Tex>
      {g ? (
        <>
          <p>
            <b>Hanger by hanger</b> (as in class): each of the {g.n - 1} hangers pulls the girder up with <Tex>{`F = q\\times ${fmt(panel!)} = ${fmt(g.F)}\\ ${unit}`}</Tex>. The half-panel next to each tower (<Tex>{`F/2`}</Tex>) goes straight into the tower, so the girder's own tower reactions are <Tex>{`R_{left} = ${fmt(g.RA)}`}</Tex>, <Tex>{`R_{right} = ${fmt(g.RB)}\\ ${unit}`}</Tex>
            {g.RA < 0 || g.RB < 0 ? ' (minus = downward)' : ''}. The SFD steps up by F at every hanger and down by P at every load; the BMD is straight between them, with the same panel-point values as <Tex>{`M_0 - Hy`}</Tex> and M = 0 at the hinge.
          </p>
          <div className="rounded-xl bg-bg/60 border border-line">
            <GirderFBD L={L} xh={xh} loads={loads} F={g.F} hangers={g.hangers} RA={g.RA} RB={g.RB} unit={unit} />
            <FnPlot f={(x) => g.V(x)} x0={0} x1={L} title={`Girder SFD (${unit})`} color="var(--c-shear)" jumps={g.breaks} labels={g.breaks.slice(0, -1).map((x, i) => (x + g.breaks[i + 1]) / 2)} ticks={g.breaks} />
            <FnPlot f={(x) => g.M(x)} x0={0} x1={L} title={`Girder BMD (${unit}-${lenUnit})`} marks={g.breaks} jumps={g.breaks} />
          </div>
          <p className="text-xs text-faint">
            Max girder moments: +{fmt(g.max.M)} {unit}-{lenUnit} at {fmt(g.max.x)} {lenUnit}, {fmt(g.min.M)} {unit}-{lenUnit} at {fmt(g.min.x)} {lenUnit} (always at a hanger or a load).
          </p>
        </>
      ) : (
        <div className="rounded-xl bg-bg/60 border border-line">
          <FnPlot f={(x) => s.V(x)} x0={0} x1={L} title={`Girder SFD (${unit})`} color="var(--c-shear)" marks={mk} jumps={loads.map((p) => p.x)} />
          <FnPlot f={(x) => s.M(x)} x0={0} x1={L} title={`Girder BMD (${unit}-${lenUnit})`} marks={mk} />
        </div>
      )}
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
