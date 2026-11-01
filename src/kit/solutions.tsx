// High-level solution renderers. Every number shown is computed by the engines.

import { useMemo, useState, type ReactNode } from 'react'
import { cantileverMethod, gridModel, portalMethod, type ApproxResult, type GridFrame } from '../engine/approx'
import { diagramsFromResult, type DiagramMember } from '../engine/diagrams'
import { solve, type Result } from '../engine/frame2d'
import { influenceLine, ildAt, ordinates, type ILD, type LoadPath, type Response } from '../engine/ild'
import type { Load, Model } from '../engine/model'
import { absoluteMaxMoment, offsets, place, trainExtremes, TRAVEL, uniformPlusConcentrated, type Placement, type Train } from '../engine/moving'
import { virtualWork, type VWOptions } from '../engine/vw'
import { DiagramView, fmt, KIND_NAME, type DiagramKind } from '../components/DiagramView'
import { ILDChart } from '../components/ILDChart'
import { makeTransform, StructureView, type Transform } from '../components/StructureView'
import { Seg, Tex } from '../components/ui'
import { isInclined } from '../engine/inclined'
import { InclinedMembers } from './inclined'

const arrowX = (v: number) => (v > 0 ? '→' : v < 0 ? '←' : '')
const arrowY = (v: number) => (v > 0 ? '↑' : v < 0 ? '↓' : '')
const rot = (v: number) => (v > 0 ? '↺ (ccw)' : v < 0 ? '↻ (cw)' : '')

export function ReactionsTable({ r, unit = 'k', mUnit = 'k-ft', names }: { r: Result; unit?: string; mUnit?: string; names?: Record<string, string> }) {
  return (
    <table className="tbl w-auto">
      <thead>
        <tr>
          <th>Support</th>
          <th>Horizontal</th>
          <th>Vertical</th>
          <th>Moment</th>
        </tr>
      </thead>
      <tbody>
        {r.reactions.filter((x) => !r.model.supports.find((s) => s.node === x.node)?.hidden).map((x) => (
          <tr key={x.node}>
            <td className="txt font-semibold">{names?.[x.node] ?? x.node}</td>
            <td>{x.rx ? `${fmt(Math.abs(x.rx))} ${unit} ${arrowX(x.rx)}` : '0'}</td>
            <td>{x.ry ? `${fmt(Math.abs(x.ry))} ${unit} ${arrowY(x.ry)}` : '0'}</td>
            <td>{x.m ? `${fmt(Math.abs(x.m))} ${mUnit} ${rot(x.m)}` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** reaction arrows overlay */
export function reactionOverlay(r: Result, model: Model, unit = 'k') {
  return (t: Transform) => (
    <g>
      {r.reactions.map((x) => {
        const n = model.nodes.find((q) => q.id === x.node)!
        const cx = t.x(n.x)
        const cy = t.y(n.y)
        const out: ReactNode[] = []
        const L = 36
        if (Math.abs(x.ry) > 1e-9) {
          const d = x.ry > 0 ? 1 : -1
          const y0 = cy + 30 + (d > 0 ? L : 0)
          const y1 = cy + 30 + (d > 0 ? 0 : L)
          out.push(
            <g key="y">
              <line x1={cx + 14} y1={y0} x2={cx + 14} y2={y1} stroke="var(--c-accent2)" strokeWidth={2} markerEnd="url(#arwR)" />
              <text x={cx + 20} y={cy + 30 + L / 2 + 4} fontSize={11.5} fill="var(--c-accent2)" fontWeight={700} className="num">
                {fmt(Math.abs(x.ry))}
              </text>
            </g>,
          )
        }
        if (Math.abs(x.rx) > 1e-9) {
          const d = x.rx > 0 ? 1 : -1
          const x0 = cx - 18 - (d > 0 ? L : 0)
          const x1 = cx - 18 - (d > 0 ? 0 : L)
          out.push(
            <g key="x">
              <line x1={x0} y1={cy + 22} x2={x1} y2={cy + 22} stroke="var(--c-accent2)" strokeWidth={2} markerEnd="url(#arwR)" />
              <text x={cx - 18 - L / 2} y={cy + 38} fontSize={11.5} fill="var(--c-accent2)" fontWeight={700} textAnchor="middle" className="num">
                {fmt(Math.abs(x.rx))}
              </text>
            </g>,
          )
        }
        if (Math.abs(x.m) > 1e-9)
          out.push(
            <text key="m" x={cx} y={cy - 22} fontSize={11.5} fill="var(--c-accent2)" fontWeight={700} textAnchor="middle" className="num">
              {fmt(Math.abs(x.m))} {x.m > 0 ? '↺' : '↻'}
            </text>,
          )
        return <g key={x.node}>{out}</g>
      })}
      <defs>
        <marker id="arwR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent2)" />
        </marker>
      </defs>
    </g>
  )
}

export function Figure({ model, loads, lenUnit = '′', forceUnit = 'k', dims = true, dimY, labels, maxHeight }: { model: Model; loads?: Load[]; lenUnit?: string; forceUnit?: string; dims?: boolean | number[]; dimY?: boolean | number[]; labels?: boolean | Record<string, string>; maxHeight?: number }) {
  return (
    <div className="rounded-xl bg-bg/60 border border-line p-2">
      <StructureView model={model} loads={loads} autoDimX={dims} autoDimY={dimY} lenUnit={lenUnit} forceUnit={forceUnit} memberLabels={labels} maxHeight={maxHeight ?? 300} />
    </div>
  )
}

// ---------------------------------------------------------------- frames / beams
export function FrameSolution({
  model,
  loads,
  kinds = ['V', 'M'],
  unit = 'k',
  lenUnit = '′',
  mUnit,
  only,
  inclined = true,
  children,
}: {
  model: Model
  loads?: Load[]
  kinds?: DiagramKind[]
  unit?: string
  lenUnit?: string
  mUnit?: string
  only?: string[]
  /** add per-member diagrams + hand calculation for inclined members */
  inclined?: boolean
  children?: ReactNode
}) {
  const r = useMemo(() => solve(model, loads ?? model.loads), [model, loads])
  const dms = useMemo(() => diagramsFromResult(model, r), [model, r])
  const [kind, setKind] = useState<DiagramKind>(kinds.includes('M') ? 'M' : kinds[0])
  const mu = mUnit ?? `${unit}-${lenUnit === ' m' ? 'm' : 'ft'}`
  const incl = useMemo(() => (inclined ? model.members.filter((m) => (!only || only.includes(m.id)) && isInclined(model, m.id)).map((m) => m.id) : []), [model, only, inclined])
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold mb-1">1 · Free body &amp; reactions</h4>
        <div className="grid cq-md:grid-cols-[1.4fr_1fr] gap-3 items-center">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <StructureView model={model} loads={loads} forceUnit={unit} lenUnit={lenUnit} autoDimX maxHeight={280}>
              {reactionOverlay(r, model, unit)}
            </StructureView>
          </div>
          <div>
            <ReactionsTable r={r} unit={unit} mUnit={mu} />
            <p className="text-xs text-faint mt-2">Check: ΣFx = ΣFy = ΣM = 0 is satisfied by these values (computed with a stiffness solver, identical to statics for a determinate structure).</p>
          </div>
        </div>
      </div>
      {children}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-bold">2 · Diagrams</h4>
          {kinds.length > 1 && <Seg value={kind} onChange={setKind} items={kinds.map((k) => ({ v: k, label: k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD' }))} />}
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <DiagramView model={model} members={dms} kind={kind} only={only} lenUnit={lenUnit} forceUnit={unit} />
        </div>
        <p className="text-xs text-faint mt-1">
          {KIND_NAME[kind]} — {kind === 'M' ? 'sagging (+) plotted per your BMD-side setting (sidebar).' : kind === 'V' ? 'shear + when the left part is pushed up (members read left→right / bottom→top).' : 'tension +.'}
        </p>
      </div>
      {incl.length > 0 && <InclinedMembers model={model} r={r} dms={dms} ids={incl} unit={unit} lenUnit={lenUnit} mu={mu} />}
      <MemberEndTable dms={dms} unit={unit} mu={mu} only={only} />
    </div>
  )
}

export function MemberEndTable({ dms, unit, mu, only }: { dms: DiagramMember[]; unit: string; mu: string; only?: string[] }) {
  const rows = only ? dms.filter((d) => only.includes(d.id)) : dms
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-mute font-semibold">Member end values table</summary>
      <table className="tbl mt-2">
        <thead>
          <tr>
            <th>Member</th>
            <th>N ({unit}, T+)</th>
            <th>V start</th>
            <th>V end</th>
            <th>M start ({mu})</th>
            <th>M end</th>
            <th>M max / min</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const s0 = d.samples[0]
            const s1 = d.samples[d.samples.length - 1]
            const Ms = d.samples.map((s) => s.M)
            return (
              <tr key={d.id}>
                <td className="txt font-semibold">{d.id}</td>
                <td>{fmt(s0.N)}</td>
                <td>{fmt(s0.V)}</td>
                <td>{fmt(s1.V)}</td>
                <td>{fmt(s0.M)}</td>
                <td>{fmt(s1.M)}</td>
                <td>
                  {fmt(Math.max(...Ms))} / {fmt(Math.min(...Ms))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-faint mt-1">Members are read left→right (horizontal) or bottom→top (vertical / inclined). M sagging +.</p>
    </details>
  )
}

// ---------------------------------------------------------------- trusses
export function trussForces(model: Model, loads?: Load[]) {
  const r = solve(model, loads ?? model.loads)
  const f = new Map<string, number>()
  for (const m of r.members) f.set(m.id, m.N(m.L / 2))
  return { r, f }
}

export function TrussSolution({ model, loads, asked, unit = 'k', lenUnit = '′', forces: given, note }: { model: Model; loads?: Load[]; asked?: string[]; unit?: string; lenUnit?: string; forces?: Map<string, number>; note?: ReactNode }) {
  const { r, f: solved } = useMemo(() => trussForces(model, loads), [model, loads])
  const f = given ?? solved
  const [all, setAll] = useState(false)
  const color: Record<string, string> = {}
  const labels: Record<string, string> = {}
  for (const m of model.members) {
    const v = f.get(m.id) ?? 0
    color[m.id] = Math.abs(v) < 1e-6 ? 'var(--c-faint)' : v > 0 ? 'var(--c-tension)' : 'var(--c-comp)'
    if (all || !asked || asked.includes(m.id)) labels[m.id] = Math.abs(v) < 1e-6 ? '0' : `${fmt(Math.abs(v))}${v > 0 ? 'T' : 'C'}`
  }
  const rows = (asked ?? model.members.map((m) => m.id)).map((id) => ({ id, v: f.get(id) ?? 0 }))
  return (
    <div className="space-y-3">
      <div className="grid cq-md:grid-cols-[1.5fr_1fr] gap-3 items-start">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <StructureView model={model} loads={loads} memberColor={color} memberLabels={labels} forceUnit={unit} lenUnit={lenUnit} maxHeight={300}>
            {given ? undefined : reactionOverlay(r, model, unit)}
          </StructureView>
          <div className="flex gap-3 text-xs px-2 pb-1">
            <span style={{ color: 'var(--c-tension)' }}>■ tension</span>
            <span style={{ color: 'var(--c-comp)' }}>■ compression</span>
            <span className="text-faint">■ zero-force</span>
            <label className="ml-auto flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> label all members
            </label>
          </div>
        </div>
        <div>
          {!given && <ReactionsTable r={r} unit={unit} mUnit={`${unit}-ft`} />}
          <table className="tbl mt-3">
            <thead>
              <tr>
                <th>Member</th>
                <th>Force ({unit})</th>
                <th>Nature</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id} className={asked?.includes(x.id) ? 'hl' : ''}>
                  <td className="txt font-semibold">{x.id}</td>
                  <td>{fmt(Math.abs(x.v))}</td>
                  <td className="txt">{Math.abs(x.v) < 1e-6 ? 'zero' : x.v > 0 ? 'Tension' : 'Compression'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {note && <div className="text-xs text-mute mt-2">{note}</div>}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- influence lines
export interface ILDItem {
  label: string
  resp: Response
  path?: LoadPath
  /** x positions to label (default: all breakpoints) */
  xs?: number[]
  unit?: string
}

export function useILDs(model: Model, path: LoadPath, items: ILDItem[], skip = false) {
  return useMemo(() => (skip ? [] : items.map((it) => influenceLine(model, it.path ?? path, it.resp))), [model, path, items, skip])
}

export function ILDStack({ model, path, items, lenUnit = '′', ilds: given, showTable = true }: { model: Model; path: LoadPath; items: ILDItem[]; lenUnit?: string; ilds?: ILD[]; showTable?: boolean }) {
  const computed = useILDs(model, path, items, !!given)
  const ilds = given ?? computed
  const t = useMemo(() => makeTransform(model.nodes.map((n) => [n.x, n.y]), 820, 300, 70), [model])
  const xs = useMemo(() => {
    const s = new Set<number>()
    ilds.forEach((d) => d.pts.forEach((p) => s.add(+p.x.toFixed(4))))
    return [...s].sort((a, b) => a - b)
  }, [ilds])
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <StructureView model={model} showLoads={false} autoDimX lenUnit={lenUnit} maxWidth={820} maxHeight={300} />
        {ilds.map((d, k) => (
          <div key={k} className="border-t border-line/60">
            <ILDChart ild={d} minX={t.minX} maxX={t.maxX} maxWidth={t.W} pad={70} title={`ILD: ${items[k].label}`} labelXs={items[k].xs ?? d.pts.map((p) => p.x)} />
          </div>
        ))}
      </div>
      {showTable && (
        <details className="text-sm" open>
          <summary className="cursor-pointer text-mute font-semibold">Key ordinates</summary>
          <div className="overflow-x-auto">
            <table className="tbl mt-2">
              <thead>
                <tr>
                  <th>x ({lenUnit.trim() || 'ft'})</th>
                  {items.map((it, k) => (
                    <th key={k}>{it.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {xs.map((x) => (
                  <tr key={x}>
                    <td>{fmt(x)}</td>
                    {ilds.map((d, k) => {
                      const o = ordinates(d, [x])[0]
                      return <td key={k}>{o.jump ? `${fmt(o.left, 4)} | ${fmt(o.right, 4)}` : fmt(o.right, 4)}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint mt-1">“a | b” = jump: value just left | just right of that point.</p>
        </details>
      )}
    </div>
  )
}

export function MaxEffect({ ild, w, P, wd = 0, label, unit = 'k', resUnit }: { ild: ILD; w: number; P: number; wd?: number; label: string; unit?: string; resUnit?: string }) {
  const r = uniformPlusConcentrated(ild, w, P, wd)
  const ru = resUnit ?? unit
  return (
    <div className="text-sm space-y-1">
      <div className="font-semibold">{label}</div>
      <div className="grid cq-sm:grid-cols-2 gap-x-6">
        <div>
          Positive area <span className="num">A⁺ = {fmt(r.areas.pos, 3)}</span>, negative area <span className="num">A⁻ = {fmt(r.areas.neg, 3)}</span>
          <br />
          Max ordinate <span className="num">{fmt(r.extremes.max.y, 4)}</span> at x = {fmt(r.extremes.max.x)}, min <span className="num">{fmt(r.extremes.min.y, 4)}</span> at x = {fmt(r.extremes.min.x)}
        </div>
        <div>
          <Tex>{`\\max(+) = w A^+ + P\\,y_{max}${wd ? ' + w_d A_{net}' : ''} = ${fmt(w)}(${fmt(r.areas.pos, 3)}) + ${fmt(P)}(${fmt(r.extremes.max.y, 4)})${wd ? ` + ${fmt(wd)}(${fmt(r.areas.net, 3)})` : ''} = \\mathbf{${fmt(r.maxPos.total)}}\\ ${ru}`}</Tex>
          <br />
          <Tex>{`\\max(-) = w A^- + P\\,y_{min}${wd ? ' + w_d A_{net}' : ''} = \\mathbf{${fmt(r.maxNeg.total)}}\\ ${ru}`}</Tex>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- wheel loads
export function TrainTable({ t, unit = 'k' }: { t: Train; unit?: string }) {
  const d = offsets(t)
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto">
        <tbody>
          <tr>
            <th>Wheel</th>
            {t.P.map((_, k) => (
              <td key={k} className="text-center">
                {t.labels?.[k] ?? k + 1}
              </td>
            ))}
            {t.udl && <td className="text-center">UDL</td>}
          </tr>
          <tr>
            <th>Load ({unit})</th>
            {t.P.map((p, k) => (
              <td key={k} className="text-center">
                {fmt(p)}
              </td>
            ))}
            {t.udl && <td className="text-center">{fmt(t.udl.w)}/ft</td>}
          </tr>
          <tr>
            <th>Distance from wheel 1</th>
            {d.map((x, k) => (
              <td key={k} className="text-center">
                {fmt(x)}
              </td>
            ))}
            {t.udl && <td className="text-center">from {fmt(d[d.length - 1] + t.udl.gap)}</td>}
          </tr>
          <tr>
            <th>Cumulative load</th>
            {t.P.map((_, k) => (
              <td key={k} className="text-center">
                {fmt(t.P.slice(0, k + 1).reduce((a, b) => a + b, 0))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function PlacementView({ pl, ild, span, section, unit = 'k', title }: { pl: Placement; ild: ILD; span: [number, number]; section?: number; unit?: string; title?: string }) {
  const W = 820,
    pad = 60,
    H = 120
  const lo = Math.min(span[0], ...pl.wheels.map((w) => w.x))
  const hi = Math.max(span[1], ...pl.wheels.map((w) => w.x))
  const k = (W - 2 * pad) / (hi - lo || 1)
  const X = (x: number) => pad + (x - lo) * k
  const by = 84
  return (
    <div>
      {title && <div className="text-xs text-mute font-semibold mb-1">{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={X(span[0])} y1={by} x2={X(span[1])} y2={by} stroke="var(--c-member)" strokeWidth={4} />
        {[span[0], span[1]].map((x, i) => (
          <path key={i} d={`M${X(x)},${by + 2} l-9,14 h18 z`} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeWidth={1.5} />
        ))}
        <text x={W - 8} y={14} fontSize={10.5} textAnchor="end" fill="var(--c-faint)">
          ← direction of travel
        </text>
        {section !== undefined && <line x1={X(section)} y1={by - 70} x2={X(section)} y2={by + 18} stroke="var(--c-accent2)" strokeDasharray="4 3" strokeWidth={1.5} />}
        {pl.wheels.map((w) => (
          <g key={w.k} opacity={w.on ? 1 : 0.3}>
            <line x1={X(w.x)} y1={by - 46} x2={X(w.x)} y2={by - 6} stroke="var(--c-load)" strokeWidth={2} />
            <path d={`M${X(w.x)},${by - 4} l-4,-8 h8 z`} fill="var(--c-load)" />
            <text x={X(w.x)} y={by - 52} fontSize={11} textAnchor="middle" fill="var(--c-load)" fontWeight={700}>
              {fmt(w.P)}
            </text>
            <text x={X(w.x)} y={by - 64} fontSize={9.5} textAnchor="middle" fill="var(--c-faint)">
              {w.k + 1}
            </text>
          </g>
        ))}
        {pl.udl && pl.udl.x2 > span[0] && pl.udl.x1 < span[1] && (
          <rect x={X(Math.max(pl.udl.x1, lo))} y={by - 22} width={Math.max(0, X(Math.min(pl.udl.x2, hi)) - X(Math.max(pl.udl.x1, lo)))} height={14} fill="var(--c-load)" fillOpacity={0.25} />
        )}
      </svg>
      <div className="text-xs text-mute">
        Response = Σ P·y = <span className="num font-semibold text-ink">{fmt(pl.value)}</span>
        {void ild}
        {void unit}
      </div>
    </div>
  )
}

/** generic moving-train solution on any ILD (beam section, reaction, truss member…) */
export function TrainOnILD({ ild, t, span, section, peak, unit = 'k', resUnit, what }: { ild: ILD; t: Train; span: [number, number]; section?: number; peak?: { x: number; side: -1 | 1 }; unit?: string; resUnit?: string; what: string }) {
  const ext = useMemo(() => trainExtremes(ild, t), [ild, t])
  const trials = useMemo(() => {
    if (!peak) return []
    const d = offsets(t)
    return t.P.map((_, k) => ({ k, value: place(ild, t, peak.x + TRAVEL * d[k], TRAVEL, peak.side).value }))
  }, [ild, t, peak])
  const ru = resUnit ?? unit
  const best = trials.length ? trials.reduce((a, b) => (b.value > a.value + 1e-9 ? b : a)) : null
  return (
    <div className="space-y-3">
      <TrainTable t={t} unit={unit} />
      {peak && (
        <div>
          <div className="text-sm font-semibold mb-1">Trial positions — each wheel placed at the critical point (x = {fmt(peak.x)}{peak.side < 0 ? ', just left' : peak.side > 0 && section !== undefined ? ', just right' : ''})</div>
          <div className="overflow-x-auto">
            <table className="tbl w-auto">
              <thead>
                <tr>
                  <th>Wheel at critical point</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((r) => (
                  <tr key={r.k} className={best === r ? 'hl' : ''}>
                    <td className="txt">Wheel {r.k + 1}</td>
                    <td>{fmt(r.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint mt-1">Train travelling right → left: wheel 1 (leftmost in the figure) leads, the rest of the train trails to its right.</p>
        </div>
      )}
      <div className="grid cq-md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <PlacementView pl={ext.max} ild={ild} span={span} section={section} unit={unit} title={`Max (+) ${what}: ${fmt(ext.max.value)} ${ru}`} />
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <PlacementView pl={ext.min} ild={ild} span={span} section={section} unit={unit} title={`Max (−) ${what}: ${fmt(ext.min.value)} ${ru}`} />
        </div>
      </div>
      <p className="text-xs text-faint">The two diagrams come from checking every wheel at every ILD corner with the train travelling right → left (exhaustive) — they confirm the hand trial above.</p>
    </div>
  )
}

export function AbsMaxSolution({ L, t, unit = 'k', lenUnit = 'ft' }: { L: number; t: Train; unit?: string; lenUnit?: string }) {
  const r = useMemo(() => absoluteMaxMoment(L, t), [L, t])
  const onLoads = t.P.filter((_, i) => r.onSpan[i])
  const ild: ILD = { pts: [{ x: 0, y: 0 }, { x: L, y: 0 }], xmin: 0, xmax: L }
  const pl: Placement = { value: r.M, s: r.s, o: r.o, wheels: r.positions.map((x, k) => ({ k, x, P: t.P[k], y: 0, on: r.onSpan[k] })) }
  const xk = r.positions[r.k]
  return (
    <div className="space-y-3 text-sm">
      <TrainTable t={t} unit={unit} />
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          Loads on the span: {onLoads.map((p) => fmt(p)).join(' + ')} → resultant <b className="num">R = {fmt(r.R)} {unit}</b>, acting at x̄ = {fmt(r.xbar)} {lenUnit} from the left support in the critical position.
        </li>
        <li>
          Critical wheel = <b>wheel {r.k + 1}</b> ({fmt(t.P[r.k])} {unit}); distance between it and R: e = {fmt(r.e)} {lenUnit}.
        </li>
        <li>
          Place the train so that the <b>beam centreline bisects</b> wheel {r.k + 1} and R: wheel {r.k + 1} at x = L/2 {xk < L / 2 ? '−' : '+'} e/2 = {fmt(xk)} {lenUnit}.
        </li>
        <li>
          Left reaction R<sub>A</sub> = R(L − x̄)/L = {fmt(r.RA)} {unit}; moment under wheel {r.k + 1}:
          <Tex block>{`M_{abs,max} = R_A\\,x_{${r.k + 1}} - \\sum_{\\text{left}} P_i (x_{${r.k + 1}} - x_i) = \\mathbf{${fmt(r.M)}}\\ ${unit}\\text{-}${lenUnit}`}</Tex>
        </li>
      </ol>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <PlacementView pl={pl} ild={ild} span={[0, L]} section={L / 2} unit={unit} title="Critical position (dashed line = midspan)" />
      </div>
      <details>
        <summary className="cursor-pointer text-mute font-semibold">Other candidate wheels</summary>
        <table className="tbl w-auto mt-1">
          <thead>
            <tr>
              <th>Wheel</th>
              <th>R on span</th>
              <th>e</th>
              <th>M under wheel</th>
            </tr>
          </thead>
          <tbody>
            {r.candidates.map((c, i) => (
              <tr key={i} className={Math.abs(c.M - r.M) < 1e-6 ? 'hl' : ''}>
                <td className="txt">{c.k + 1}</td>
                <td>{fmt(c.R)}</td>
                <td>{fmt(c.e)}</td>
                <td>{fmt(c.M)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

// ---------------------------------------------------------------- portal / cantilever
export function ApproxTables({ r, unit = 'k', lenUnit = 'ft' }: { r: ApproxResult; unit?: string; lenUnit?: string }) {
  const mu = `${unit}-${lenUnit}`
  return (
    <div className="space-y-3 text-sm">
      {r.method === 'cantilever' && r.overturning && (
        <div className="overflow-x-auto">
          <div className="font-semibold mb-1">Overturning moment at each inflection plane & column axial forces</div>
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Storey</th>
                <th>x̄ (centroid)</th>
                <th>Σ A d²</th>
                <th>M about plane ({mu})</th>
                {r.columns[0].map((c) => (
                  <th key={c.col}>Col {c.col + 1} d / N</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.overturning.map((o, s) => (
                <tr key={s}>
                  <td>{s + 1}</td>
                  <td>{fmt(o.xbar)}</td>
                  <td>{fmt(o.sumAd2)}</td>
                  <td>{fmt(o.M)}</td>
                  {r.columns[s].map((c) => (
                    <td key={c.col}>
                      {fmt(c.dist ?? 0)} / {fmt(c.axial)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-faint">N = −M·A·d / ΣA d² (tension +). Columns on the windward side of the centroid are in tension.</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="font-semibold mb-1">Columns</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Column</th>
              <th>Storey shear</th>
              <th>Shear ({unit})</th>
              <th>M top ({mu})</th>
              <th>M bottom</th>
              <th>Axial ({unit}, T+)</th>
            </tr>
          </thead>
          <tbody>
            {r.columns.flatMap((row, s) =>
              row.map((c) => (
                <tr key={c.name}>
                  <td className="txt font-semibold">{c.name}</td>
                  <td>{fmt(r.storeyShear[s])}</td>
                  <td>{fmt(c.shear)}</td>
                  <td>{fmt(c.mTop)}</td>
                  <td>{fmt(c.mBot)}</td>
                  <td>{fmt(c.axial)}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <div className="font-semibold mb-1">Beams (girders)</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Beam</th>
              <th>Span</th>
              <th>End moment ({mu})</th>
              <th>Shear ({unit})</th>
              <th>Axial ({unit}, T+)</th>
            </tr>
          </thead>
          <tbody>
            {r.beams.flatMap((row) =>
              row.map((b) => (
                <tr key={b.name}>
                  <td className="txt font-semibold">{b.name}</td>
                  <td>{fmt(b.L)}</td>
                  <td>{fmt(b.moment)}</td>
                  <td>{fmt(b.shear)}</td>
                  <td>{fmt(b.axial)}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ApproxSolution({ g, method, unit = 'k', lenUnit = 'ft', kinds = ['M', 'V', 'N'] }: { g: GridFrame; method: 'portal' | 'cantilever'; unit?: string; lenUnit?: string; kinds?: DiagramKind[] }) {
  const r = useMemo(() => (method === 'portal' ? portalMethod(g) : cantileverMethod(g)), [g, method])
  const m = useMemo(() => gridModel(g), [g])
  const [kind, setKind] = useState<DiagramKind>(kinds[0])
  return (
    <div className="space-y-4">
      <ApproxTables r={r} unit={unit} lenUnit={lenUnit} />
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold text-sm">Diagrams</div>
          <Seg value={kind} onChange={setKind} items={kinds.map((k) => ({ v: k, label: k === 'N' ? 'AFD' : k === 'V' ? 'SFD' : 'BMD' }))} />
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <DiagramView model={m} members={r.diagrams} kind={kind} lenUnit={lenUnit === 'm' ? ' m' : '′'} forceUnit={unit} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- virtual work
export function VWSolution({ model, real, virtual, opts, unitNote, result, scale = 1, resultUnit = '', what }: { model: Model; real: Load[]; virtual: Load[]; opts?: VWOptions; unitNote?: ReactNode; result?: (total: number) => ReactNode; scale?: number; resultUnit?: string; what: string }) {
  const r = useMemo(() => virtualWork(model, real, virtual, opts), [model, real, virtual, opts])
  const dR = useMemo(() => diagramsFromResult(model, r.real), [model, r])
  const dU = useMemo(() => diagramsFromResult(model, r.virtual), [model, r])
  const allTruss = model.members.every((m) => m.truss)
  return (
    <div className="space-y-3 text-sm">
      {!allTruss && (
        <div className="grid cq-md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs font-semibold text-mute px-1">Real system — M diagram</div>
            <DiagramView model={model} members={dR} kind="M" />
          </div>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <div className="text-xs font-semibold text-mute px-1">Virtual unit load — m diagram</div>
            <DiagramView model={{ ...model, loads: virtual }} members={dU} kind="M" showLoads />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>L</th>
              {allTruss ? (
                <>
                  <th>N (real)</th>
                  <th>n (virtual)</th>
                  <th>N n L / AE</th>
                </>
              ) : (
                <>
                  <th>∫Mm/EI</th>
                  {opts?.shear && <th>∫KVv/GA</th>}
                  {opts?.axial && <th>NnL/AE</th>}
                </>
              )}
              {opts?.dL && <th>n·ΔL</th>}
            </tr>
          </thead>
          <tbody>
            {r.terms.map((t) => (
              <tr key={t.member}>
                <td className="txt font-semibold">{t.member}</td>
                <td>{fmt(t.L)}</td>
                {allTruss ? (
                  <>
                    <td>{fmt(t.N)}</td>
                    <td>{fmt(t.n, 4)}</td>
                    <td>{fmt(t.axial * scale, 5)}</td>
                  </>
                ) : (
                  <>
                    <td>{fmt(t.bending * scale, 5)}</td>
                    {opts?.shear && <td>{fmt(t.shear * scale, 5)}</td>}
                    {opts?.axial && <td>{fmt(t.axial * scale, 5)}</td>}
                  </>
                )}
                {opts?.dL && <td>{fmt(t.fab * scale, 5)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.settle !== 0 && <div>Support movement term −Σ r·Δ = {fmt(r.settle * scale, 5)}</div>}
      <div className="text-base">
        {what} = Σ = <b className="num">{fmt(r.total * scale, 4)} {resultUnit}</b> {result?.(r.total * scale)}
      </div>
      {unitNote && <div className="text-xs text-faint">{unitNote}</div>}
    </div>
  )
}

export { ildAt }
