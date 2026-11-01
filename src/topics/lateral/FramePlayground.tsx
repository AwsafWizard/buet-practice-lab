// Lateral-load playground: build a frame (bays, storeys, sizes, loads), then compare the portal or
// cantilever method with an exact stiffness analysis — diagrams, numbers and the real sway shape.

import { useMemo, useRef, useState } from 'react'
import { DiagramView, fmt, KIND_NAME, type DiagramKind } from '../../components/DiagramView'
import { StructureView, type Transform } from '../../components/StructureView'
import { Seg } from '../../components/ui'
import type { Result } from '../../engine/frame2d'
import type { Model } from '../../engine/model'
import { analyseFrame, pctErr, type FrameAnalysis, type PlayFrame } from '../../kit/playframe'
import { Slider } from '../../labs/common'
import { eventToWorld, Row, StatusBox, Tries } from '../../labs/playground'

const PAD = 60
const MIN_BAY = 6
const MIN_H = 6

interface Preset {
  name: string
  f: PlayFrame
  method: 'portal' | 'cantilever'
}
const PRESETS: Preset[] = [
  { name: '1 bay · 1 storey', method: 'portal', f: { xs: [0, 20], heights: [14], loads: [20], base: 'fixed', areas: [1, 1], beamStiff: 1 } },
  { name: '2 bays · 2 storeys', method: 'portal', f: { xs: [0, 20, 35], heights: [14, 12], loads: [20, 10], base: 'fixed', areas: [1, 2, 1], beamStiff: 1 } },
  { name: '3 bays · 3 storeys', method: 'portal', f: { xs: [0, 15, 25, 40], heights: [15, 12, 12], loads: [10, 20, 20], base: 'fixed', areas: [1, 2, 2, 1], beamStiff: 1 } },
  { name: 'Cantilever: A, 2A, A', method: 'cantilever', f: { xs: [0, 24, 40], heights: [14, 12], loads: [30, 15], base: 'fixed', areas: [1, 2, 1], beamStiff: 1 } },
  { name: 'Tall & narrow', method: 'cantilever', f: { xs: [0, 12, 24], heights: [14, 12, 12, 12], loads: [8, 8, 8, 6], base: 'fixed', areas: [1, 1, 1], beamStiff: 1 } },
  { name: 'Pinned bases', method: 'portal', f: { xs: [0, 20, 40], heights: [16], loads: [24], base: 'pinned', areas: [1, 1, 1], beamStiff: 1 } },
]

const STIFF = [0.1, 0.25, 0.5, 1, 2, 5, 10, 100]
const AREA_CYCLE = [1, 1.5, 2, 3, 0.5]

type Drag = { kind: 'col'; j: number } | { kind: 'lev'; l: number }

export function FramePlayground() {
  const [f, setF] = useState<PlayFrame>(PRESETS[1].f)
  const [method, setMethod] = useState<'portal' | 'cantilever'>('portal')
  const [kind, setKind] = useState<DiagramKind>('M')
  const [sway, setSway] = useState(true)
  const drag = useRef<Drag | null>(null)

  const a = useMemo(() => safe(() => analyseFrame(f, method)), [f, method])
  const levelsY = useMemo(() => f.heights.reduce((acc, h) => [...acc, acc[acc.length - 1] + h], [0]), [f.heights])
  const nb = f.xs.length - 1
  const ns = f.heights.length
  const W = f.xs[nb]

  const loadPreset = (p: Preset) => {
    setF(p.f)
    setMethod(p.method)
  }
  const setBays = (n: number) =>
    setF((g) => {
      if (n < 1 || n > 4) return g
      const xs = n > g.xs.length - 1 ? [...g.xs, g.xs[g.xs.length - 1] + 20] : g.xs.slice(0, n + 1)
      const areas = n > g.xs.length - 1 ? [...g.areas, 1] : g.areas.slice(0, n + 1)
      return { ...g, xs, areas }
    })
  const setStoreys = (n: number) =>
    setF((g) => {
      if (n < 1 || n > 4) return g
      if (n > g.heights.length) return { ...g, heights: [...g.heights, 12], loads: [...g.loads, 10] }
      return { ...g, heights: g.heights.slice(0, n), loads: g.loads.slice(0, n) }
    })
  const setLoad = (l: number, v: number) => setF((g) => ({ ...g, loads: g.loads.map((p, k) => (k === l ? v : p)) }))
  const cycleArea = (j: number) => setF((g) => ({ ...g, areas: g.areas.map((x, k) => (k === j ? AREA_CYCLE[(AREA_CYCLE.indexOf(x) + 1) % AREA_CYCLE.length] ?? 1 : x)) }))

  const moveTo = (d: Drag, wx: number, wy: number) =>
    setF((g) => {
      if (d.kind === 'col') {
        const lo = g.xs[d.j - 1] + MIN_BAY
        const hi = d.j < g.xs.length - 1 ? g.xs[d.j + 1] - MIN_BAY : 80
        const x = Math.min(hi, Math.max(lo, Math.round(wx)))
        if (x === g.xs[d.j]) return g
        // dragging a line moves everything to its right with it (bay widths to the right are kept)
        const dx = x - g.xs[d.j]
        return { ...g, xs: g.xs.map((q, k) => (k >= d.j ? q + dx : q)) }
      }
      const Y = g.heights.reduce((acc, h) => [...acc, acc[acc.length - 1] + h], [0])
      const y = Math.round(wy)
      const h = Math.min(30, Math.max(MIN_H, y - Y[d.l - 1]))
      if (h === g.heights[d.l - 1]) return g
      return { ...g, heights: g.heights.map((q, k) => (k === d.l - 1 ? h : q)) }
    })

  const overlay = (tt: Transform) => {
    const X = tt.x
    const Y = tt.y
    return (
      <g
        onPointerMove={(e) => {
          if (!drag.current) return
          const p = eventToWorld(e, tt, PAD)
          if (p) moveTo(drag.current, p.x, p.y)
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {a && sway && <SwayOverlay a={a} t={tt} />}
        {/* column-line handles (above the roof) */}
        {f.xs.map((x, j) =>
          j === 0 ? null : (
            <g
              key={'c' + j}
              style={{ cursor: 'ew-resize' }}
              onPointerDown={(e) => {
                ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
                drag.current = { kind: 'col', j }
              }}
            >
              <line x1={X(x)} x2={X(x)} y1={Y(levelsY[ns]) - 34} y2={Y(levelsY[ns]) - 8} stroke="var(--c-accent)" strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={X(x)} cy={Y(levelsY[ns]) - 38} r={7} fill="var(--c-accent)" stroke="var(--c-panel)" strokeWidth={2} />
              <path d={`M${X(x) - 4},${Y(levelsY[ns]) - 38} h8 M${X(x) - 4},${Y(levelsY[ns]) - 38} l2,-2 M${X(x) - 4},${Y(levelsY[ns]) - 38} l2,2 M${X(x) + 4},${Y(levelsY[ns]) - 38} l-2,-2 M${X(x) + 4},${Y(levelsY[ns]) - 38} l-2,2`} stroke="var(--c-bg)" strokeWidth={1.3} />
              <circle cx={X(x)} cy={Y(levelsY[ns]) - 30} r={14} fill="transparent" />
            </g>
          ),
        )}
        {/* floor-level handles (right of the frame) */}
        {levelsY.map((y, l) =>
          l === 0 ? null : (
            <g
              key={'l' + l}
              style={{ cursor: 'ns-resize' }}
              onPointerDown={(e) => {
                ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
                drag.current = { kind: 'lev', l }
              }}
            >
              <line x1={X(W) + 6} x2={X(W) + 15} y1={Y(y)} y2={Y(y)} stroke="var(--c-accent)" strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={X(W) + 22} cy={Y(y)} r={7} fill="var(--c-accent)" stroke="var(--c-panel)" strokeWidth={2} />
              <path d={`M${X(W) + 22},${Y(y) - 4} v8 M${X(W) + 22},${Y(y) - 4} l-2,2 M${X(W) + 22},${Y(y) - 4} l2,2 M${X(W) + 22},${Y(y) + 4} l-2,-2 M${X(W) + 22},${Y(y) + 4} l2,-2`} stroke="var(--c-bg)" strokeWidth={1.3} />
              <circle cx={X(W) + 22} cy={Y(y)} r={14} fill="transparent" />
            </g>
          ),
        )}
      </g>
    )
  }

  const model = a?.model
  const cols = a?.cols ?? []
  const scaleV = Math.max(1e-9, ...cols.map((c) => Math.abs(c.exact.V)))
  const scaleM = Math.max(1e-9, ...cols.map((c) => Math.max(c.exact.Mtop, c.exact.Mbot)))
  const scaleN = Math.max(1e-9, ...cols.map((c) => Math.abs(c.exact.N)))
  const worstM = cols.reduce((w, c) => Math.max(w, Math.abs(pctErr(c.approx.Mtop, c.exact.Mtop, scaleM)), Math.abs(pctErr(c.approx.Mbot, c.exact.Mbot, scaleM))), 0)
  const worstV = cols.reduce((w, c) => Math.max(w, Math.abs(pctErr(c.approx.V, c.exact.V, scaleV))), 0)
  const worstN = cols.reduce((w, c) => Math.max(w, Math.abs(pctErr(c.approx.N, c.exact.N, scaleN))), 0)
  const zs = cols.filter((c) => c.exact.z !== null && !(c.storey === 0 && f.base === 'pinned')).map((c) => c.exact.z! / c.h)
  const methodName = method === 'portal' ? 'Portal method' : 'Cantilever method'
  const verdict = worstM < 10 ? { c: 'var(--c-good)', t: `${methodName}: close (worst column moment off by ${fmt(worstM, 0)}%)` } : worstM < 25 ? { c: 'var(--c-load)', t: `${methodName}: rough (worst column moment off by ${fmt(worstM, 0)}%)` } : { c: 'var(--c-bad)', t: `${methodName}: poor here (worst column moment off by ${fmt(worstM, 0)}%)` }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-mute mr-1">Start from:</span>
        {PRESETS.map((p) => (
          <button key={p.name} className="btn !py-1 !text-xs" onClick={() => loadPreset(p)}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Seg value={method} onChange={setMethod} items={[{ v: 'portal', label: 'Portal' }, { v: 'cantilever', label: 'Cantilever' }]} />
        <Seg value={f.base} onChange={(base) => setF({ ...f, base })} items={[{ v: 'fixed', label: 'Fixed bases' }, { v: 'pinned', label: 'Pinned bases' }]} />
        <Counter label="Bays" value={nb} onChange={setBays} />
        <Counter label="Storeys" value={ns} onChange={setStoreys} />
        <label className="flex items-center gap-1.5 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" checked={sway} onChange={(e) => setSway(e.target.checked)} className="accent-[var(--c-accent)]" />
          Exact sway shape
        </label>
      </div>
      <div className="text-xs text-mute">Drag the blue handles to change bay widths (top) and storey heights (right). Dashed = exact deflected shape; ● orange = inflection points the method assumes, ● green = where they really are.</div>

      <div className="grid cq-lg:grid-cols-[1fr_290px] gap-4 items-start">
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl bg-bg/60 border border-line p-2 touch-none select-none">
            {model && (
              <StructureView model={model} autoDimX autoDimY maxHeight={340} pad={PAD} memberLabels={method === 'cantilever' ? areaLabels(model, f) : false} extra={[[0, levelsY[ns] + 3.2], [W + 5, 0]]}>
                {overlay}
              </StructureView>
            )}
          </div>

          <div className="grid cq-sm:grid-cols-2 gap-x-6 gap-y-1">
            {[...f.loads.keys()].reverse().map((l) => (
              <Slider key={l} label={l === ns - 1 ? 'Roof load' : `Floor ${l + 1} load`} value={f.loads[l]} min={-40} max={40} step={1} onChange={(v) => setLoad(l, v)} unit=" k" />
            ))}
            <label className="flex items-center gap-3 text-sm">
              <span className="text-mute min-w-[7rem]">Beam EI ÷ column EI</span>
              <input type="range" min={0} max={STIFF.length - 1} step={1} value={STIFF.indexOf(f.beamStiff)} onChange={(e) => setF({ ...f, beamStiff: STIFF[+e.target.value] })} className="flex-1 accent-[var(--c-accent)]" />
              <span className="num w-16 text-right">×{f.beamStiff}</span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-mute">
            Column areas (cantilever method & exact):
            {f.areas.map((ar, j) => (
              <button key={j} className="btn !py-0.5 !px-2 !text-xs num" title="click to change" onClick={() => cycleArea(j)}>
                line {j + 1}: {ar === 1 ? 'A' : `${ar}A`}
              </button>
            ))}
          </div>

          {a && model && (
            <>
              <div className="flex items-center gap-2">
                <Seg value={kind} onChange={setKind} items={[{ v: 'M', label: 'BMD' }, { v: 'V', label: 'SFD' }, { v: 'N', label: 'AFD' }]} />
                <span className="text-xs text-mute">{KIND_NAME[kind]}</span>
              </div>
              <div className="grid cq-2xl:grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg/60 border border-line p-2">
                  <div className="text-sm font-bold px-1">{methodName}</div>
                  <DiagramView model={stripLoads(model)} members={a.approx.diagrams} kind={kind} maxHeight={320} pad={50} />
                </div>
                <div className="rounded-xl bg-bg/60 border border-line p-2">
                  <div className="text-sm font-bold px-1">Exact (stiffness method)</div>
                  <DiagramView model={stripLoads(model)} members={a.exactDiagrams} kind={kind} maxHeight={320} pad={50} />
                </div>
              </div>
              <CompareTable a={a} scale={{ V: scaleV, M: scaleM, N: scaleN }} />
            </>
          )}
        </div>

        <div className="space-y-3 cq-lg:sticky cq-lg:top-4">
          {a ? (
            <StatusBox c={verdict.c} t={verdict.t} d={`Shear off by up to ${fmt(worstV, 0)}%, axial by up to ${fmt(worstN, 0)}% (as % of the largest exact value).`} />
          ) : (
            <StatusBox c="var(--c-bad)" t="Could not solve this frame" />
          )}
          {a && (
            <div className="card p-3">
              <div className="font-bold text-sm mb-1">Storey shears</div>
              {[...a.approx.storeyShear.keys()].reverse().map((s) => (
                <Row key={s} k={`Storey ${s + 1}`} v={`${fmt(a.approx.storeyShear[s])} k`} />
              ))}
              {zs.length > 0 && (
                <div className="border-t border-line/60 mt-1.5 pt-1.5">
                  <Row k="Exact inflection points" v={`${fmt(Math.min(...zs), 2)}h – ${fmt(Math.max(...zs), 2)}h`} />
                  <Row k="Assumed" v={f.base === 'pinned' ? '0.5h (base: 0)' : '0.5h'} />
                </div>
              )}
              {method === 'cantilever' && a.approx.overturning && (
                <div className="border-t border-line/60 mt-1.5 pt-1.5">
                  <Row k="Centroid of areas x̄" v={`${fmt(a.approx.overturning[0].xbar)}′`} />
                </div>
              )}
            </div>
          )}
          <Tries>
            <li>Slide <b>Beam EI ÷ column EI</b> to ×100: the green dots move to mid-height and the portal method gets very close. At 0.1 the beams are too floppy and it drifts.</li>
            <li>Switch to <b>Pinned bases</b>: the ground-storey inflection point jumps to the base and the ground columns' base moments vanish.</li>
            <li>Load <b>Tall &amp; narrow</b> and flip Portal ↔ Cantilever: watch the column axial forces (AFD) — the cantilever method's linear-with-distance idea fits a tall frame.</li>
            <li>Make one bay much wider than the others. Portal still gives interior columns twice the exterior shear — check the table to see how true that is.</li>
            <li>Change a column area in cantilever mode: the centroid moves and the axial forces redistribute.</li>
            <li>Reverse a load (drag it negative): every sign flips, magnitudes don't.</li>
          </Tries>
        </div>
      </div>
    </div>
  )
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-line overflow-hidden text-sm">
      <button className="px-2 py-1 bg-panel2 text-mute hover:text-ink" onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="px-2 py-1 font-semibold">
        {label} <span className="num">{value}</span>
      </span>
      <button className="px-2 py-1 bg-panel2 text-mute hover:text-ink" onClick={() => onChange(value + 1)}>
        +
      </button>
    </span>
  )
}

function CompareTable({ a, scale }: { a: FrameAnalysis; scale: { V: number; M: number; N: number } }) {
  const cell = (ap: number, ex: number, sc: number) => {
    const e = pctErr(ap, ex, sc)
    const c = Math.abs(e) < 10 ? 'text-good' : Math.abs(e) < 25 ? 'text-[var(--c-load)]' : 'text-bad'
    return (
      <td className="px-2 py-1 text-right num whitespace-nowrap">
        {fmt(ap)} <span className="text-faint">/</span> {fmt(ex)} <span className={'text-[10px] ' + c}>{Math.abs(e) < 0.5 ? '✓' : `${e > 0 ? '+' : ''}${fmt(e, 0)}%`}</span>
      </td>
    )
  }
  const storeys = [...new Set(a.cols.map((c) => c.storey))].reverse()
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-xs">
        <thead className="bg-panel2 text-mute">
          <tr>
            <th className="px-2 py-1.5 text-left">Column</th>
            <th className="px-2 py-1.5 text-right">Shear (k)</th>
            <th className="px-2 py-1.5 text-right">M top</th>
            <th className="px-2 py-1.5 text-right">M bottom</th>
            <th className="px-2 py-1.5 text-right">Axial (T +)</th>
            <th className="px-2 py-1.5 text-right">Inflection (exact)</th>
          </tr>
        </thead>
        <tbody>
          {storeys.flatMap((s) =>
            a.cols
              .filter((c) => c.storey === s)
              .map((c) => (
                <tr key={c.name} className="border-t border-line/60">
                  <td className="px-2 py-1 font-semibold">
                    {c.name} <span className="text-faint font-normal">st. {s + 1}</span>
                  </td>
                  {cell(c.approx.V, c.exact.V, scale.V)}
                  {cell(c.approx.Mtop, c.exact.Mtop, scale.M)}
                  {cell(c.approx.Mbot, c.exact.Mbot, scale.M)}
                  {cell(c.approx.N, c.exact.N, scale.N)}
                  <td className="px-2 py-1 text-right num">{c.exact.z === null ? '—' : `${fmt(c.exact.z / c.h, 2)}h`}</td>
                </tr>
              )),
          )}
        </tbody>
      </table>
      <div className="px-2 py-1 text-[11px] text-faint border-t border-line/60">approx / exact · % = error relative to the largest exact value of that kind · moments in k-ft</div>
    </div>
  )
}

// ---------------------------------------------------------------- exact sway shape + inflection points

function SwayOverlay({ a, t }: { a: FrameAnalysis; t: Transform }) {
  const m = a.model
  const r = a.exact
  const width = Math.max(...m.nodes.map((n) => n.x)) - Math.min(...m.nodes.map((n) => n.x))
  const maxU = Math.max(1e-12, ...m.nodes.map((n) => Math.abs(r.disp(n.id).ux)))
  const sc = (0.07 * Math.max(width, 10)) / maxU
  const shape = (id: string, xi: number) => deflectedPoint(m, r, id, xi, sc)
  return (
    <g pointerEvents="none">
      {m.members.map((mem) => {
        const pts = Array.from({ length: 17 }, (_, k) => shape(mem.id, k / 16))
        return <path key={mem.id} d={pts.map((p, k) => `${k ? 'L' : 'M'}${t.x(p[0])},${t.y(p[1])}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2} strokeDasharray="5 3" opacity={0.85} />
      })}
      {a.cols.map((c) => {
        const assumed = shape(c.name, c.z0 / c.h)
        const exact = c.exact.z === null ? null : shape(c.name, c.exact.z / c.h)
        return (
          <g key={c.name}>
            <circle cx={t.x(assumed[0])} cy={t.y(assumed[1])} r={4.5} fill="var(--c-load)" />
            {exact && <circle cx={t.x(exact[0]) + 0.5} cy={t.y(exact[1])} r={3.6} fill="var(--c-good)" stroke="var(--c-panel)" strokeWidth={1} />}
          </g>
        )
      })}
      {a.approx.beams.flat().map((b) => {
        const mr = r.member(b.name)
        const M0 = mr.M(0, 1)
        const ML = mr.M(b.L, -1)
        const xi = M0 * ML < 0 ? M0 / (M0 - ML) : null
        const assumed = shape(b.name, 0.5)
        const exact = xi === null ? null : shape(b.name, xi)
        return (
          <g key={b.name}>
            <circle cx={t.x(assumed[0])} cy={t.y(assumed[1])} r={4.5} fill="var(--c-load)" />
            {exact && <circle cx={t.x(exact[0])} cy={t.y(exact[1])} r={3.6} fill="var(--c-good)" stroke="var(--c-panel)" strokeWidth={1} />}
          </g>
        )
      })}
    </g>
  )
}

/** point on the (scaled) deflected shape of a member at fraction xi — cubic Hermite from end displacements */
function deflectedPoint(m: Model, r: Result, id: string, xi: number, sc: number): [number, number] {
  const mem = m.members.find((q) => q.id === id)!
  const a = m.nodes.find((n) => n.id === mem.i)!
  const b = m.nodes.find((n) => n.id === mem.j)!
  const L = Math.hypot(b.x - a.x, b.y - a.y)
  const c = (b.x - a.x) / L
  const s = (b.y - a.y) / L
  const da = r.disp(a.id)
  const db = r.disp(b.id)
  const ua = c * da.ux + s * da.uy
  const va = -s * da.ux + c * da.uy
  const ub = c * db.ux + s * db.uy
  const vb = -s * db.ux + c * db.uy
  const N1 = 1 - 3 * xi ** 2 + 2 * xi ** 3
  const N2 = L * (xi - 2 * xi ** 2 + xi ** 3)
  const N3 = 3 * xi ** 2 - 2 * xi ** 3
  const N4 = L * (-(xi ** 2) + xi ** 3)
  const v = N1 * va + N2 * da.rz + N3 * vb + N4 * db.rz
  const u = (1 - xi) * ua + xi * ub
  return [a.x + (b.x - a.x) * xi + sc * (c * u - s * v), a.y + (b.y - a.y) * xi + sc * (s * u + c * v)]
}

function areaLabels(m: Model, f: PlayFrame): Record<string, string> {
  const out: Record<string, string> = {}
  const ncol = f.xs.length
  const ids = m.nodes.map((n) => n.id)
  for (const mem of m.members) {
    const a = m.nodes.find((n) => n.id === mem.i)!
    const b = m.nodes.find((n) => n.id === mem.j)!
    if (Math.abs(a.x - b.x) > 1e-9) continue
    const ar = f.areas[ids.indexOf(mem.i) % ncol] ?? 1
    out[mem.id] = ar === 1 ? 'A' : `${ar}A`
  }
  return out
}

const stripLoads = (m: Model): Model => ({ ...m, loads: [] })

function safe<T>(fn: () => T): T | null {
  try {
    return fn()
  } catch {
    return null
  }
}
