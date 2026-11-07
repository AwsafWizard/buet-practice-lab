// Shared pieces for SJMY sir's half of the CE 341 past papers: solution wrappers (from the AJK kit), theory model
// answers borrowed from the water / consolidation topic modules, flow nets from the seepage solver, loaded plans with
// Newmark counts and corner-rectangle superposition, embankments (Osterberg), soil columns and the stress-bulb sketch.
// Every number comes from the engines in src/soil/engine.
import type { ReactNode } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Tex } from '../../../components/ui'
import { eFromTable } from '../../engine/consolidation'
import { netLines, pointInfo, solveNet, type FlowSol } from '../../engine/flownet'
import { bulbDepth, bulbRatio, cornerTerms, embankmentAt, embankmentBlocks, embPts, newmarkCount, rectsInside, shapeI, simplifyTerms, type CornerTerm, type Embankment, type Rect } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { ContactFig } from '../../reference/sd'
import { COMP_THEORY } from '../../topics/comp/theory'
import { Chart, Legend, pathOf, SERIES } from '../../topics/consol/plot'
import { CONSOL_THEORY } from '../../topics/consol/theory'
import { PERM_THEORY } from '../../topics/perm/theory'
import { geomOf, NET_DEFAULT, NET_PRESETS, netResults, type NetResults, type NetState } from '../../topics/seep/FlowNetLab'
import { frameOf, NetView, type Frame } from '../../topics/seep/NetView'
import { SEEP_THEORY } from '../../topics/seep/theory'
import { NewmarkChart } from '../../topics/stress/newmark'
import { WV_THEORY } from '../../topics/wv/theory'
import type { SmTheoryItem } from '../../types'
import { f2, f3, f4, Head, Note, Result, Sol, Tbl } from '../ajk/kit'

export { f1, f2, f3, f4, Head, Model, Models, Note, Result, Sol, Tbl } from '../ajk/kit'

export const f0 = (v: number) => fmt(v, 0)
/** a × 10^n in TeX */
export const sciTex = (v: number, d = 2) => (Number.isFinite(v) ? v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => `\\times 10^{${+e}}`) : '—')
/** thousands separators for big volumes / money */
export const big = (v: number, d = 0) => (Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—')

// ---------------------------------------------------------------- theory model answers (water, consolidation, W–V topics)
const ALL_THEORY: SmTheoryItem[] = [...WV_THEORY, ...COMP_THEORY, ...PERM_THEORY, ...SEEP_THEORY, ...CONSOL_THEORY]
/** a topic theory item by topic and id (throws at render if it was renamed, so the card shows the boundary) */
export function th(topic: string, id: string): SmTheoryItem {
  const t = ALL_THEORY.find((x) => x.topic === topic && x.id === id)
  if (!t) throw new Error(`theory item ${topic}/${id} not found`)
  return t
}

/** a framed figure */
export function Frm({ children, wide }: { children: ReactNode; wide?: number }) {
  return (
    <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
      <div style={wide ? { minWidth: wide } : undefined}>{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------- flow nets (seepage solver, the simulator presets)
export type NetId = '2324' | '2021' | '1617' | 'j21' | '2122' | '1718' | '2324w'
export interface NetCase {
  st: NetState
  sol: FlowSol
  R: NetResults
}
const netCache = new Map<string, NetCase>()
/** the simulator preset for a paper's figure (with overrides), solved once ('final' quality) and cached */
export function netOf(id: NetId, over: Partial<NetState> = {}): NetCase {
  const key = id + JSON.stringify(over)
  const hit = netCache.get(key)
  if (hit) return hit
  const p = NET_PRESETS.find((x) => x.id === id)
  if (!p) throw new Error(`no flow-net preset ${id}`)
  const st: NetState = { ...NET_DEFAULT, ...p.st, ...over }
  const sol = solveNet(geomOf(st), 'final')
  const c = { st, sol, R: netResults(sol, st) }
  netCache.set(key, c)
  return c
}
/** head, pore pressure etc. at a point (x from the pile / heel, z above the impermeable base) */
export const netPoint = (c: NetCase, x: number, z: number) => pointInfo(c.sol, x, z, c.st.gsat, c.R.Nd)

export interface NetMark {
  x: number
  z: number
  label: string
}
/** the section drawn by the solver's geometry, with (optionally) the solver's square net and labelled points */
export function NetFig({ c, net = true, Nf, marks = [], prism, exit, frame }: { c: NetCase; net?: boolean; Nf?: number; marks?: NetMark[]; prism?: boolean; exit?: boolean; frame?: Frame }) {
  const fr = frame ?? frameOf(c.sol)
  // NetView's own mapping (W = 760, pad = 26) so the labels land on the drawing
  const pad = 26
  const k = (760 - 2 * pad) / (fr.x1 - fr.x0)
  const X = (x: number) => pad + (x - fr.x0) * k
  const Y = (z: number) => pad + (fr.z1 - z) * k
  const ex = exit ? { profile: [], ie: c.R.ie, l: c.R.exitL, along: c.R.exitAlong } : null
  return (
    <NetView sol={c.sol} kind={c.st.kind} frame={fr} net={net ? netLines(c.sol, Nf ?? c.st.Nf) : null} prism={prism ? c.R.heave : null} exit={ex}>
      {marks.map((m) => (
        <g key={m.label}>
          <circle cx={X(m.x)} cy={Y(m.z)} r={4.5} fill="var(--c-load)" stroke="var(--c-bg, #fff)" strokeWidth={1.5} />
          <text x={X(m.x) + 7} y={Y(m.z) - 6} fontSize={12} fontWeight={700} fill="var(--c-load)">
            {m.label}
          </text>
        </g>
      ))}
    </NetView>
  )
}

/** q in three handy units */
export function qLine(kTex: string, k: number, H: number, ratio: number, ratioTex: string) {
  const q = k * H * ratio
  return { q, tex: `q = kH\\frac{N_f}{N_d} = ${kTex} \\times ${f2(H)} \\times ${ratioTex} = ${sciTex(q, 3)}\\ \\text{m}^3\\text{/s per m} = ${f3(q * 86400)}\\ \\text{m}^3\\text{/day per m}` }
}

// ---------------------------------------------------------------- loaded plans: Newmark count + rectangle superposition
export interface Dim {
  /** from → to, plan metres (absolute plan coordinates) */
  a: [number, number]
  b: [number, number]
  text: string
  /** offset of the dimension line, px (perpendicular, + = right/down) */
  off?: number
}
/** a plan of rectangles (absolute coordinates, y up) with the point P and printed dimensions */
export function PlanFig({ rects, P, dims = [], w = 380, label = 'P', hatch = [] }: { rects: Rect[]; P: [number, number]; dims?: Dim[]; w?: number; label?: string; hatch?: Rect[] }) {
  const xs = [...rects, ...hatch].flatMap((r) => [r.x1, r.x2]).concat(P[0])
  const ys = [...rects, ...hatch].flatMap((r) => [r.y1, r.y2]).concat(P[1])
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs),
    y0 = Math.min(...ys),
    y1 = Math.max(...ys)
  const m = 46
  const k = (w - 2 * m) / Math.max(x1 - x0, (y1 - y0) * 0.9)
  const H = (y1 - y0) * k + 2 * m
  const X = (x: number) => m + (x - x0) * k
  const Y = (y: number) => H - m - (y - y0) * k
  return (
    <svg viewBox={`0 0 ${w} ${H}`} className="w-full" style={{ maxWidth: w * 1.3 }} role="img" aria-label="loaded area in plan">
      <defs>
        <marker id="sj-ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" fill="var(--c-mute)" />
        </marker>
      </defs>
      {rects.map((r, i) => (
        <rect key={i} x={X(Math.min(r.x1, r.x2))} y={Y(Math.max(r.y1, r.y2))} width={Math.abs(r.x2 - r.x1) * k} height={Math.abs(r.y2 - r.y1) * k} fill="var(--c-load)" fillOpacity={0.16} stroke="none" />
      ))}
      {rects.map((r, i) => (
        <rect key={'o' + i} x={X(Math.min(r.x1, r.x2))} y={Y(Math.max(r.y1, r.y2))} width={Math.abs(r.x2 - r.x1) * k} height={Math.abs(r.y2 - r.y1) * k} fill="none" stroke="var(--c-load)" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
      ))}
      {hatch.map((r, i) => (
        <rect key={'h' + i} x={X(Math.min(r.x1, r.x2))} y={Y(Math.max(r.y1, r.y2))} width={Math.abs(r.x2 - r.x1) * k} height={Math.abs(r.y2 - r.y1) * k} fill="none" stroke="var(--c-mute)" strokeWidth={1} strokeDasharray="5 3" />
      ))}
      {dims.map((d, i) => {
        const horiz = Math.abs(d.a[1] - d.b[1]) < 1e-9
        const o = d.off ?? (horiz ? -14 : -14)
        const xa = X(d.a[0]) + (horiz ? 0 : o)
        const ya = Y(d.a[1]) + (horiz ? o : 0)
        const xb = X(d.b[0]) + (horiz ? 0 : o)
        const yb = Y(d.b[1]) + (horiz ? o : 0)
        return (
          <g key={'d' + i} fontSize={10.5} fill="var(--c-mute)">
            <line x1={xa} y1={ya} x2={xb} y2={yb} stroke="var(--c-mute)" strokeWidth={0.8} markerStart="url(#sj-ar)" markerEnd="url(#sj-ar)" />
            <text x={(xa + xb) / 2 + (horiz ? 0 : o < 0 ? -4 : 4)} y={(ya + yb) / 2 + (horiz ? (o < 0 ? -4 : 12) : 3)} textAnchor={horiz ? 'middle' : o < 0 ? 'end' : 'start'}>
              {d.text}
            </text>
          </g>
        )
      })}
      <circle cx={X(P[0])} cy={Y(P[1])} r={4} fill="var(--c-accent)" />
      <text x={X(P[0]) + 6} y={Y(P[1]) - 5} fontSize={12} fontWeight={700} fill="var(--c-accent)">
        {label}
      </text>
    </svg>
  )
}

/** rectangles relative to the point (P at the origin) */
export const shift = (rs: Rect[], P: [number, number]): Rect[] => rs.map((r) => ({ x1: r.x1 - P[0], y1: r.y1 - P[1], x2: r.x2 - P[0], y2: r.y2 - P[1] }))

/** the corner rectangles of a loaded area (relative rectangles), merged */
export function cornerSet(rel: Rect[], z: number): CornerTerm[] {
  return simplifyTerms(rel.flatMap((r) => cornerTerms(r, 0, 0, z)))
}
export function CornerTable({ rel, z, q, chart = 'Fadum' }: { rel: Rect[]; z: number; q: number; chart?: string }) {
  const ts = cornerSet(rel, z)
  const I = ts.reduce((s, t) => s + t.sign * t.I, 0)
  return (
    <div className="space-y-1">
      <Tbl
        head={['', 'B × L (m)', 'm = B/z', 'n = L/z', `I (${chart})`]}
        rows={ts.map((t) => [t.sign > 0 ? '+' : '−', `${f2(t.B)} × ${f2(t.L)}`, f3(t.m), f3(t.n), `${t.sign > 0 ? '' : '−'}${f4(t.I)}`])}
        cap={`Each rectangle has a corner at the point; − = fictitious area subtracted. z = ${f2(z)} m.`}
      />
      <Tex block>{`\\sum I = ${ts.map((t, i) => `${i && t.sign > 0 ? '+' : ''}${t.sign < 0 ? '-' : ''}${f4(t.I)}`).join(' ')} = ${f4(I)},\\qquad \\sigma_z = q\\sum I = ${f2(q)} \\times ${f4(I)} = ${f2(q * I)}\\ \\text{kPa}`}</Tex>
    </div>
  )
}

export function newmarkOf(rel: Rect[], z: number) {
  return newmarkCount(rectsInside(rel), z, 12)
}
/** Newmark: plan drawn to AB = z with P at the centre, the mesh count by ring, σz = 0.005Nq, superposition check */
export function NewmarkSolved({ rel, z, q, lead }: { rel: Rect[]; z: number; q: number; lead?: string }) {
  const nm = newmarkOf(rel, z)
  const I = shapeI(rel, 0, 0, z)
  return (
    <Sol>
      {lead && <Md>{lead}</Md>}
      <Md>{`**Scale:** the chart's bar AB represents z = ${f2(z)} m. Redraw the plan to that scale (1 m = AB/${f2(z)}), with the point at the centre of the chart, and count the meshes covered (partly covered meshes as fractions).`}</Md>
      <div className="rounded-xl bg-bg/60 border border-line p-2 max-w-[440px] mx-auto">
        <NewmarkChart size={380} z={z} rects={rel} meshes={nm.meshes} />
      </div>
      <Tbl
        head={['Ring (σ/q band)', ...nm.perRing.map((_, i) => `${i + 1}`), 'N']}
        rows={[['meshes covered', ...nm.perRing.map((v) => f1x(v)), f1x(nm.N)]]}
        cap="Ring 1 is the innermost (0–0.1q); each ring has 20 meshes. Counted numerically from the plan (fine sampling inside every mesh)."
      />
      <Tex block>{`\\sigma_z = I_f\\,N\\,q = 0.005 \\times ${f1x(nm.N)} \\times ${f2(q)} = ${f2(nm.I * q)}\\ \\text{kPa}`}</Tex>
      <Head>Check by superposition of corner rectangles (Fadum's formula)</Head>
      <CornerTable rel={rel} z={z} q={q} />
      <Note>{`A hand count is usually within ±3 meshes of N = ${f1x(nm.N)} (±${f1x(0.015 * q)} kPa here); the exact value is ${f2(I * q)} kPa.`}</Note>
    </Sol>
  )
}
const f1x = (v: number) => fmt(v, 1)


// ---------------------------------------------------------------- embankments (Osterberg)
export function EmbFig({ e, pts, unit = 'm', qLabel }: { e: Embankment; pts: { X: number; z: number; label: string }[]; unit?: string; qLabel?: string }) {
  const W = 620
  const span = e.aL + e.c + e.aR
  const zmax = Math.max(...pts.map((p) => p.z), e.h)
  const m = 30
  const k = (W - 2 * m) / (span * 1.1)
  const hDraw = Math.max(e.h * k, 40)
  const top = 20
  const gl = top + hDraw
  const H = gl + zmax * k + 40
  const X = (x: number) => m + span * 0.05 * k + x * k
  const ptsP = embPts(e)
  const poly = ptsP.map(([x, q], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${(gl - (q / (e.h * e.gamma)) * hDraw).toFixed(1)}`).join('') + 'Z'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="embankment cross-section">
      <line x1={4} x2={W - 4} y1={gl} y2={gl} stroke="var(--c-ink)" strokeWidth={1.2} />
      <rect x={4} y={gl} width={W - 8} height={H - gl - 4} fill="var(--c-soil)" opacity={0.15} />
      <path d={poly} fill="var(--c-soil)" opacity={0.6} stroke="var(--c-ink)" />
      <g fontSize={10.5} fill="var(--c-mute)" textAnchor="middle">
        <text x={X(e.aL / 2)} y={gl + 13}>{`${fmt(e.aL, 2)} ${unit}`}</text>
        <text x={X(e.aL + e.c / 2)} y={top - 5}>{`crest ${fmt(e.c, 2)} ${unit}`}</text>
        <text x={X(e.aL + e.c + e.aR / 2)} y={gl + 13}>{`${fmt(e.aR, 2)} ${unit}`}</text>
        <text x={X(e.aL + e.c / 2)} y={top + hDraw / 2 + 4}>{qLabel ?? `H = ${fmt(e.h, 2)} ${unit}, γ = ${fmt(e.gamma, 2)}`}</text>
      </g>
      {pts.map((p) => (
        <g key={p.label}>
          <line x1={X(p.X)} x2={X(p.X)} y1={top} y2={gl + p.z * k} stroke="var(--c-accent)" strokeDasharray="4 3" strokeWidth={0.9} />
          <circle cx={X(p.X)} cy={gl + p.z * k} r={4} fill="var(--c-accent)" />
          <text x={X(p.X) + 6} y={gl + p.z * k + 4} fontSize={11} fontWeight={700} fill="var(--c-accent)">
            {p.label}
          </text>
          <text x={X(p.X) - 5} y={gl + (p.z * k) / 2 + 3} fontSize={10} textAnchor="end" fill="var(--c-mute)">
            {`${fmt(p.z, 2)} ${unit}`}
          </text>
        </g>
      ))}
    </svg>
  )
}
/** σz below a point under the crest by Osterberg blocks (split at the vertical through the point), with the exact check */
export function OsterbergSolved({ e, X, z, label, unit = 'm', qUnit = 'kPa' }: { e: Embankment; X: number; z: number; label: string; unit?: string; qUnit?: string }) {
  const r = embankmentBlocks(e, X, z)!
  const q = e.h * e.gamma
  return (
    <div className="space-y-1">
      <Md>{`**Point ${label}** (z = ${fmt(z, 2)} ${unit}): split the section at the vertical through ${label}; each side is an Osterberg block (slope a, flat top b, point below the inner edge of the slope).`}</Md>
      <Tbl
        head={['Block', `a (${unit})`, `b (${unit})`, 'a/z', 'b/z', 'Iz']}
        rows={r.blocks.map((b) => [b.side, f2(b.a), f2(b.b), f3(b.az), f3(b.bz), f4(b.I)])}
      />
      <Tex block>{`\\sigma_z = q\\sum I_z = ${f2(q)} \\times (${r.blocks.map((b) => f4(b.I)).join(' + ')}) = ${f2(q)} \\times ${f4(r.I)} = ${f2(r.sigma)}\\ \\text{${qUnit}}`}</Tex>
      <p className="text-xs text-faint">
        Exact integration of the whole trapezoid gives {f2(embankmentAt(e, X, z))} {qUnit} (same: the split is exact).
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- soil column (as printed / as the student sketches it)
export interface ColLayer {
  H: number
  name: string
  /** extra text lines */
  props?: string[]
  kind: 'sand' | 'clay' | 'fill' | 'rock'
}
export function SoilColumn({ layers, wt, footing, marks = [], w = 560, unit = 'm' }: { layers: ColLayer[]; wt?: number | null; footing?: { Df: number; B: number; label: string }; marks?: { z: number; label: string }[]; w?: number; unit?: string }) {
  const Ht = layers.reduce((s, l) => s + l.H, 0)
  const top = footing ? 40 : 22
  const k = Math.min(26, 300 / Ht)
  const H = top + Ht * k + 24
  const x0 = 70
  const cw = 200
  let z = 0
  const fill = (kind: ColLayer['kind']) => (kind === 'clay' ? 'var(--c-soil)' : kind === 'rock' ? 'var(--c-mute)' : kind === 'fill' ? 'var(--c-load)' : 'var(--c-soil)')
  const op = (kind: ColLayer['kind']) => (kind === 'clay' ? 0.55 : kind === 'rock' ? 0.35 : kind === 'fill' ? 0.18 : 0.22)
  return (
    <svg viewBox={`0 0 ${w} ${H}`} className="w-full" style={{ maxWidth: w * 1.2 }} role="img" aria-label="soil profile">
      <line x1={x0 - 30} x2={x0 + cw + 10} y1={top} y2={top} stroke="var(--c-ink)" strokeWidth={1.4} />
      <text x={x0 - 32} y={top - 4} fontSize={10} fill="var(--c-mute)">
        GL
      </text>
      {layers.map((l, i) => {
        const y = top + z * k
        const zt = z
        z += l.H
        return (
          <g key={i}>
            <rect x={x0} y={y} width={cw} height={l.H * k} fill={fill(l.kind)} opacity={op(l.kind)} stroke="var(--c-ink)" strokeWidth={0.8} />
            <text x={x0 + cw + 14} y={y + Math.min(13, (l.H * k) / 2 + 4)} fontSize={10.5} fontWeight={600} fill="var(--c-ink)">
              {l.name}
            </text>
            {(l.props ?? []).map((t, j) => (
              <text key={j} x={x0 + cw + 14} y={y + 13 + 12 * (j + 1)} fontSize={9.5} fill="var(--c-mute)">
                {t}
              </text>
            ))}
            <text x={x0 - 6} y={y + (l.H * k) / 2 + 4} fontSize={10} textAnchor="end" fill="var(--c-mute)">
              {`${fmt(l.H, 2)} ${unit}`}
            </text>
            <text x={x0 + 4} y={y + l.H * k - 3} fontSize={8.5} fill="var(--c-faint)">
              {fmt(zt + l.H, 2)}
            </text>
          </g>
        )
      })}
      {wt !== undefined && wt !== null && (
        <g>
          <line x1={x0} x2={x0 + cw} y1={top + wt * k} y2={top + wt * k} stroke="var(--c-water)" strokeWidth={1.4} strokeDasharray="6 3" />
          <path d={`M${x0 + cw - 30},${top + wt * k - 9}l10,0l-5,8z`} fill="var(--c-water)" />
          <text x={x0 + cw - 36} y={top + wt * k - 3} fontSize={9.5} textAnchor="end" fill="var(--c-water)">
            WT
          </text>
        </g>
      )}
      {footing && (
        <g>
          <rect x={x0 + cw / 2 - 30} y={top + footing.Df * k - 7} width={60} height={7} fill="var(--c-conc, var(--c-mute))" stroke="var(--c-ink)" />
          <rect x={x0 + cw / 2 - 6} y={top - 20} width={12} height={footing.Df * k + 13} fill="var(--c-conc, var(--c-mute))" stroke="var(--c-ink)" strokeWidth={0.8} />
          <path d={`M${x0 + cw / 2},${top - 34}l0,12m-4,-5l4,5l4,-5`} stroke="var(--c-load)" strokeWidth={2} fill="none" />
          <text x={x0 + cw / 2 + 8} y={top - 24} fontSize={10} fill="var(--c-load)">
            {footing.label}
          </text>
        </g>
      )}
      {marks.map((mk) => (
        <g key={mk.label}>
          <circle cx={x0 + cw / 2} cy={top + mk.z * k} r={3.5} fill="var(--c-accent)" />
          <text x={x0 + cw / 2 + 6} y={top + mk.z * k + 4} fontSize={10} fontWeight={700} fill="var(--c-accent)">
            {mk.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------- stress-bulb comparison (circle, square, strip)
export function BulbCompare() {
  const zs = Array.from({ length: 61 }, (_, i) => 0.05 + (i / 60) * 5.95)
  const shapes = [
    { s: 'circle' as const, t: 'circle (diameter B)' },
    { s: 'square' as const, t: 'square (B × B)' },
    { s: 'strip' as const, t: 'strip (width B)' },
  ]
  return (
    <div className="space-y-1">
      <Chart w={360} h={260} x={{ min: 0, max: 1, label: 'σz/q below the centre' }} y={{ min: 0, max: 6, flip: true, label: 'z/B' }} label="stress with depth below circle, square and strip">
        {(s) => (
          <>
            {shapes.map((sh, i) => (
              <path key={sh.s} d={pathOf([[1, 0], ...zs.map((z) => [bulbRatio(sh.s, 1, 0, z), z] as [number, number])], s)} fill="none" stroke={SERIES[i]} strokeWidth={1.8} data-name={sh.s} />
            ))}
            <line x1={s.X(0.1)} x2={s.X(0.1)} y1={s.T} y2={s.B} stroke="var(--c-mute)" strokeDasharray="3 3" />
          </>
        )}
      </Chart>
      <Legend items={shapes.map((sh, i) => ({ c: SERIES[i], t: sh.t }))} />
    </div>
  )
}
/** numbers for the comparison answer */
export function bulbNumbers() {
  const at = (z: number) => ({ z, circle: bulbRatio('circle', 1, 0, z), square: bulbRatio('square', 1, 0, z), strip: bulbRatio('strip', 1, 0, z) })
  return { rows: [0.5, 1, 2, 3].map(at), d10: { circle: bulbDepth('circle', 1), square: bulbDepth('square', 1), strip: bulbDepth('strip', 1) } }
}
export function BulbAnswer({ pre }: { pre?: string }) {
  const b = bulbNumbers()
  return (
    <Sol>
      {pre && <Md>{pre}</Md>}
      <Md>{`For the same contact pressure q and the same width B (circle of diameter B, square B × B, strip of width B), Boussinesq below the centre gives:

- At the surface all three give $\\sigma_z = q$; the stress then **decreases with depth** for every shape.
- It decreases **fastest under the circle**, slightly slower under the **square** (a little more loaded area at the corners), and **much slower under the strip**, which is loaded along its whole length and so feeds stress to a much greater depth.
- The **pressure bulb** of 0.1q reaches about **${f2(b.d10.circle)}B** (circle), **${f2(b.d10.square)}B** (square) and **${f2(b.d10.strip)}B** (strip): the significant depth (seat of settlement) is about 2B for square and circular footings but 4B or more for strip footings.
- Consequence: a strip footing stresses (and settles) a deep clay layer much more than a square footing of the same width and pressure; borings must go deeper under strips and rafts.`}</Md>
      <Tbl head={['z/B', 'circle σz/q', 'square σz/q', 'strip σz/q']} rows={b.rows.map((r) => [f2(r.z), f3(r.circle), f3(r.square), f3(r.strip)])} cap="Boussinesq below the centre (stressdist engine)." />
      <Frm>
        <div className="max-w-[420px] mx-auto">
          <BulbCompare />
        </div>
      </Frm>
    </Sol>
  )
}

export function ContactAnswer() {
  return (
    <Sol>
      <Md>{`**Contact pressure** is the pressure between the base of a footing and the soil. Its distribution depends on the rigidity of the footing and on the soil.

**Flexible foundation** (e.g. an earth embankment, a thin steel tank floor) carrying a uniform load:
- The **contact pressure is uniform** (equal to the applied load) on both sand and clay, because the footing simply follows the ground.
- **On clay** (cohesive, behaves like an elastic half-space): the settlement is **dish-shaped** — maximum at the centre, smaller at the edges (the centre is stressed by the whole loaded area, the edges by about half).
- **On sand** (cohesionless, stiffness grows with confinement): the soil at the edges has little confining pressure and is soft, the centre is confined and stiff, so the settlement is an **inverted dish** — larger at the edges, smaller at the centre.

**For comparison, rigid foundations** settle uniformly: on clay the contact pressure is least at the centre and very high at the edges; on sand it is parabolic, zero at the edges and highest at the centre.

In design a uniform contact pressure is assumed; the safety factor covers the difference.`}</Md>
      <Frm>
        <div className="max-w-[420px] mx-auto">
          <ContactFig />
        </div>
      </Frm>
      <p className="text-xs text-faint">Shaded: contact pressure; dashed: settled base.</p>
    </Sol>
  )
}



// ---------------------------------------------------------------- rigid circular block over a thin clay (2016-17 Q2(b), 2017-18 Q6(a)): 2:1 spread, e–p table
export const EP_P = [50, 100, 200, 300, 400]
export const EP_E = [0.73, 0.68, 0.625, 0.58, 0.54]
export interface CircleCase {
  D: number
  q: number
  /** sand thickness, WT depth, unit weights */
  Hs: number
  wt: number
  gs: number
  gsSat: number
  /** clay thickness and unit weight */
  Hc: number
  gc: number
  /** lab: specimen thickness (mm, double drained) and t90 (minutes) */
  hLab: number
  t90: number
}
export function circleCase(c: CircleCase) {
  const z = c.Hs + c.Hc / 2
  const dp = (c.q * c.D * c.D) / (c.D + z) ** 2
  const p0 = c.wt * c.gs + (c.Hs - c.wt) * (c.gsSat - GW) + (c.Hc / 2) * (c.gc - GW)
  const e0 = eTable(p0)
  const e1 = eTable(p0 + dp)
  const S = ((e0 - e1) * c.Hc) / (1 + e0)
  const dLab = c.hLab / 2 / 1000
  const cv = (0.848 * dLab * dLab) / c.t90 // m²/min
  const yr = 365 * 24 * 60
  const t90one = (0.848 * c.Hc * c.Hc) / cv / yr
  const t90two = (0.848 * (c.Hc / 2) ** 2) / cv / yr
  return { z, dp, p0, e0, e1, S, dLab, cv, cvYr: cv * yr, t90one, t90two }
}
const eTable = (p: number) => eFromTable(EP_P, EP_E, p)
export function CircleCaseSolution({ c }: { c: CircleCase }) {
  const r = circleCase(c)
  const seg = (p: number) => {
    let i = 0
    while (i < EP_P.length - 2 && p > EP_P[i + 1]) i++
    return i
  }
  const i0 = seg(r.p0)
  const i1 = seg(r.p0 + r.dp)
  return (
    <Sol>
      <Md>{`**Δp at the middle of the clay** (1H : 2V spread, i.e. the 2:1 method on the circle): $z = ${f2(c.Hs)} + ${f2(c.Hc)}/2 = ${f2(r.z)}$ m below the block,`}</Md>
      <Tex block>{`\\Delta p = q\\frac{D^2}{(D + z)^2} = ${f2(c.q)} \\times \\frac{${f2(c.D)}^2}{(${f2(c.D)} + ${f2(r.z)})^2} = ${f2(r.dp)}\\ \\text{kPa}`}</Tex>
      <Tex block>{`p'_0 = ${f2(c.wt)}(${f2(c.gs)}) + ${f2(c.Hs - c.wt)}(${f2(c.gsSat)} - 9.81) + ${f2(c.Hc / 2)}(${f2(c.gc)} - 9.81) = ${f2(r.p0)}\\ \\text{kPa},\\quad p'_0 + \\Delta p = ${f2(r.p0 + r.dp)}\\ \\text{kPa}`}</Tex>
      <Md>{`**Void ratios from the test table**, interpolating linearly in log p: $e_0$ between ${EP_P[i0]} and ${EP_P[i0 + 1]} kPa → $e_0 = ${f4(r.e0)}$; $e_1$ between ${EP_P[i1]} and ${EP_P[i1 + 1]} kPa → $e_1 = ${f4(r.e1)}$.`}</Md>
      <Tex block>{`S = \\frac{\\Delta e}{1 + e_0}H = \\frac{${f4(r.e0)} - ${f4(r.e1)}}{1 + ${f4(r.e0)}} \\times ${f2(c.Hc * 1000)} = ${f2(r.S * 1000)}\\ \\text{mm}`}</Tex>
      <Md>{`**Time.** Lab specimen ${f2(c.hLab)} mm, drained top and bottom: $d_{lab} = ${f2(c.hLab / 2)}$ mm; $c_v = 0.848d^2/t_{90} = ${sciTex(r.cv, 3)}$ m²/min (${f3(r.cvYr)} m²/yr). Field: sand above, impervious rock below → single drainage, $d = ${f2(c.Hc)}$ m. Same U → same Tv:`}</Md>
      <Tex block>{`t_{90,field} = t_{90,lab}\\left(\\frac{d_{field}}{d_{lab}}\\right)^2 = ${f2(c.t90)}\\ \\text{min} \\times \\left(\\frac{${f2(c.Hc * 1000)}}{${f2(c.hLab / 2)}}\\right)^2 = ${f2(r.t90one)}\\ \\text{years}`}</Tex>
    </Sol>
  )
}
