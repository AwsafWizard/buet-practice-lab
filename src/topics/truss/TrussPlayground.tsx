// Truss playground: shape a truss, drag a load along the deck, watch every member force (T / C,
// thickness = size) update, and click any member for its influence line.

import { useMemo, useRef, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { makeTransform, StructureView, type Transform } from '../../components/StructureView'
import { Seg } from '../../components/ui'
import { ildAt, ildExtremes } from '../../engine/ild'
import { analyseTruss, buildPlayTruss, deckY, jointShares, memberILD, type PlayTruss } from '../../kit/playtruss'
import { Slider } from '../../labs/common'
import { eventToWorld, PG_PAD as PAD, Plot, Row, StatusBox, Tries, TwoWays, useColumnWidth, useSweep } from '../../labs/playground'
import { TRUSS_NAMES, type TrussType } from '../../labs/trusses'

const TYPES: TrussType[] = ['pratt', 'howe', 'warren', 'parker', 'roof', 'xbraced']
const SNAP = 0.5

const tc = (v: number) => (Math.abs(v) < 1e-6 ? '0' : `${fmt(Math.abs(v), 2)} ${v > 0 ? 'T' : 'C'}`)

export function TrussPlayground() {
  const [cfg, setCfg] = useState<PlayTruss>({ type: 'pratt', n: 6, w: 12, h: 14, deck: 'bottom' })
  const [loadX, setLoadX] = useState(26)
  const [P, setP] = useState(20)
  const [wd, setWd] = useState(0)
  const [sel, setSel] = useState<string>('')
  const [labelsPick, setLabels] = useState<boolean | null>(null)
  const [trace, setTrace] = useState(false)
  const [play, setPlay] = useState(false)
  const drag = useRef(false)

  const t = useMemo(() => buildPlayTruss(cfg), [cfg])
  const L = t.L
  const lx = Math.min(Math.max(loadX, 0), L)
  const res = useMemo(() => safe(() => analyseTruss(t, lx, P, wd)), [t, lx, P, wd])
  const memIds = t.model.members.map((m) => m.id)
  const defaultSel = useMemo(() => {
    // an interior diagonal left of midspan: the classic T↔C flipper
    const end = new Set(['L0', `L${cfg.n}`])
    const diag = t.model.members.filter((m) => m.i[0] !== m.j[0] && m.i.slice(1) !== m.j.slice(1) && !end.has(m.i) && !end.has(m.j))
    return (diag[Math.max(0, Math.floor(diag.length / 2) - 1)] ?? t.model.members[0]).id
  }, [t])
  const selId = memIds.includes(sel) ? sel : defaultSel
  const ild = useMemo(() => safe(() => memberILD(t, selId)), [t, selId])
  const eta = ild ? ildAt(ild, lx, 1) : 0
  const deadPart = ild && wd ? wd * t.deckXY.reduce((s, q) => s + ildAt(ild, q.x), 0) : 0

  useSweep(play, 0, L, setLoadX)

  const set = (patch: Partial<PlayTruss>) =>
    setCfg((c) => {
      const n = { ...c, ...patch }
      n.h = Math.min(n.h, maxH(n))
      return n
    })
  const maxH = (c: PlayTruss) => Math.max(6, Math.min(30, Math.floor(c.n * c.w * 0.5)))

  // drawing (width-limited so the charts below line up with it)
  const [colRef, W0] = useColumnWidth()
  // force labels crowd a phone-sized drawing: off there unless asked for
  const labels = labelsPick ?? W0 >= 520
  const topY = Math.max(...t.model.nodes.map((q) => q.y))
  const extraPts: [number, number][] = [[0, topY + (t.top ? 0.45 : 0.12) * cfg.h]]
  const maxHpx = Math.round(W0 * 0.8)
  const tr = makeTransform([...t.model.nodes.map((q) => [q.x, q.y] as [number, number]), ...extraPts], W0, maxHpx, PAD)

  const maxF = res ? Math.max(1e-9, ...[...res.forces.values()].map(Math.abs)) : 1
  const color: Record<string, string> = {}
  const lab: Record<string, string> = {}
  if (res)
    for (const id of memIds) {
      const v = res.forces.get(id) ?? 0
      color[id] = Math.abs(v) < 1e-6 * maxF ? 'var(--c-faint)' : v > 0 ? 'var(--c-tension)' : 'var(--c-comp)'
      if (labels) lab[id] = tc(v)
    }

  const overlay = (tt: Transform) => {
    const yd = deckY(t, lx)
    const X = tt.x
    const Y = tt.y
    const nm = new Map(t.model.nodes.map((q) => [q.id, q]))
    const shares = jointShares(t, lx, P)
    return (
      <g
        onPointerMove={(e) => {
          if (!drag.current) return
          const p = eventToWorld(e, tt)
          if (p) setLoadX(Math.min(L, Math.max(0, Math.round(p.x / SNAP) * SNAP)))
        }}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
      >
        <defs>
          <marker id="arwJ" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent2)" />
          </marker>
        </defs>
        {/* force "thickness" */}
        {res &&
          t.model.members.map((m) => {
            const v = res.forces.get(m.id) ?? 0
            if (Math.abs(v) < 1e-6 * maxF) return null
            const a = nm.get(m.i)!
            const b = nm.get(m.j)!
            return <line key={m.id} x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} stroke={v > 0 ? 'var(--c-tension)' : 'var(--c-comp)'} strokeOpacity={0.28} strokeWidth={3 + 13 * (Math.abs(v) / maxF)} strokeLinecap="round" pointerEvents="none" />
          })}
        {/* the joints the load is handed to */}
        {shares.map((s) => (
          <g key={s.node} pointerEvents="none">
            <line x1={X(s.x) + 9} x2={X(s.x) + 9} y1={Y(s.y) - 8 - 34 * (s.F / P)} y2={Y(s.y) - 7} stroke="var(--c-accent2)" strokeWidth={2.5} markerEnd="url(#arwJ)" />
            <text x={X(s.x) + 14} y={Y(s.y) - 14} fontSize={11} fontWeight={700} fill="var(--c-accent2)" className="num" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
              {fmt(s.F)}
            </text>
          </g>
        ))}
        {/* the moving load */}
        <g
          style={{ cursor: 'grab' }}
          onPointerDown={(e) => {
            e.stopPropagation()
            ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
            setPlay(false)
            drag.current = true
          }}
        >
          <line x1={X(lx)} x2={X(lx)} y1={Y(yd) - 52} y2={Y(yd) - 6} stroke="var(--c-load)" strokeWidth={3} markerEnd="url(#arw)" />
          <text x={X(lx)} y={Y(yd) - 57} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--c-load)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
            P = {fmt(P)} k
          </text>
          <rect x={X(lx) - 15} y={Y(yd) - 72} width={30} height={68} fill="transparent" />
        </g>
      </g>
    )
  }

  const det = t.det
  const status = det.label === 'determinate' ? { c: 'var(--c-good)', t: 'Stable · statically determinate', d: `m + r = 2j (${det.m} + ${det.r} = ${2 * det.j}). Every member ILD is straight between panel points.` } : { c: 'var(--c-load)', t: `Indeterminate to degree ${det.dosi}`, d: 'Solved exactly with equal EA in every bar — compare with the “diagonals share equally” trick in the Approach tab.' }

  const ext = ild ? ildExtremes(ild) : null
  const sorted = res ? [...res.forces.entries()].sort((a, b) => b[1] - a[1]) : []
  const maxT = sorted[0]
  const maxC = sorted[sorted.length - 1]
  const xShown = Math.round(lx * 100) / 100

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {TYPES.map((x) => (
          <button key={x} className={'btn !py-1 !text-xs ' + (x === cfg.type ? '!border-accent text-accent' : '')} onClick={() => set({ type: x })}>
            {TRUSS_NAMES[x]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {cfg.type !== 'roof' && (
          <Seg
            value={cfg.deck}
            onChange={(deck) => set({ deck })}
            items={[
              { v: 'bottom', label: 'Load on bottom chord' },
              { v: 'top', label: 'Load on top chord' },
            ]}
          />
        )}
        <button className="btn !py-1" onClick={() => setPlay(!play)}>
          {play ? '❚❚ pause' : '▶ sweep load'}
        </button>
        <label className="flex items-center gap-1.5 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} className="accent-[var(--c-accent)]" />
          Force labels
        </label>
        <label className="flex items-center gap-1.5 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} className="accent-[var(--c-accent)]" />
          Trace mode
        </label>
      </div>
      <div className="text-xs text-mute">
        Drag the orange load (or use the slider). <b className="text-ink">Click any member</b> to see its influence line. Blue = tension, red = compression, faint = zero; the halo's thickness shows the size.
      </div>

      <div className="grid cq-lg:grid-cols-[1fr_290px] gap-4 items-start">
        <div className="min-w-0" ref={colRef}>
          <div className="rounded-xl bg-bg/60 border border-line p-2 touch-none select-none">
            <StructureView model={t.model} showLoads={false} autoDimX maxWidth={W0} maxHeight={maxHpx} pad={PAD} memberColor={color} memberLabels={labels ? lab : undefined} selectedMember={selId} onMemberClick={setSel} extra={extraPts}>
              {overlay}
            </StructureView>
          </div>

          <div className="grid cq-sm:grid-cols-2 gap-x-6 gap-y-1 mt-3">
            <Slider
              label="Load position x"
              value={xShown}
              min={0}
              max={L}
              step={SNAP}
              onChange={(v) => {
                setPlay(false)
                setLoadX(v)
              }}
              unit="′"
            />
            <Slider label="Load P" value={P} min={1} max={60} step={1} onChange={setP} unit=" k" />
            <Slider label="Dead load / joint" value={wd} min={0} max={20} step={1} onChange={setWd} unit=" k" />
            <Slider label="Panels" value={cfg.n} min={4} max={10} step={2} onChange={(n) => set({ n })} />
            <Slider label="Panel width" value={cfg.w} min={6} max={20} step={1} onChange={(w) => set({ w })} unit="′" />
            <Slider label="Height" value={cfg.h} min={6} max={maxH(cfg)} step={1} onChange={(h) => set({ h })} unit="′" />
          </div>

          {ild && (
            <div className="mt-2">
              <Plot
                title={`ILD of force in ${selId} (tension +, unit load on the ${t.top ? 'top' : 'bottom'} chord)`}
                badge={`η = ${fmt(eta, 3)}`}
                pts={ild.pts}
                x1={L}
                W={tr.W}
                color="var(--c-accent)"
                sign
                digits={3}
                labelXs={t.deckXY.map((q) => q.x)}
                loadX={lx}
                clipTo={trace ? lx : undefined}
                dot={{ x: lx, y: eta, color: 'var(--c-load)' }}
                height={170}
              />
            </div>
          )}
        </div>

        <div className="space-y-3 cq-lg:sticky cq-lg:top-4">
          <StatusBox {...status} />
          {res && (
            <>
              <div className="card p-3">
                <div className="font-bold text-sm mb-1">
                  Member {selId}: <span className={(res.forces.get(selId) ?? 0) >= 0 ? 'text-[var(--c-tension)]' : 'text-[var(--c-comp)]'}>{tc(res.forces.get(selId) ?? 0)}</span>
                </div>
                <TwoWays name={`F_${selId}`} value={res.forces.get(selId) ?? 0} P={P} eta={eta} unit="k" rest={wd ? { label: 'dead', value: deadPart } : undefined} />
                {ext && (
                  <div className="border-t border-line/60 mt-1.5 pt-1.5 text-xs text-mute">
                    {ext.max.y > 1e-9 && (
                      <div>
                        Most tension from P: at x = <span className="num text-ink">{fmt(ext.max.x)}′</span> → <span className="num text-ink">{fmt(P * ext.max.y)} k</span>
                      </div>
                    )}
                    {ext.min.y < -1e-9 && (
                      <div>
                        Most compression from P: at x = <span className="num text-ink">{fmt(ext.min.x)}′</span> → <span className="num text-ink">{fmt(-P * ext.min.y)} k</span>
                      </div>
                    )}
                    {ext.max.y > 1e-9 && ext.min.y < -1e-9 && <div className="mt-1">The ILD changes sign — this member can flip between T and C as the load moves (a counter candidate).</div>}
                  </div>
                )}
              </div>
              <div className="card p-3">
                <div className="font-bold text-sm mb-1">Right now (P at {fmt(xShown)}′)</div>
                {res.reactions.map((r) => (
                  <Row key={r.node} k={`R_${r.node}`} v={`${fmt(Math.abs(r.ry))} k ${r.ry >= 0 ? '↑' : '↓'}`} />
                ))}
                <div className="border-t border-line/60 mt-1.5 pt-1.5">
                  {maxT && maxT[1] > 1e-9 && <Row k={<button onClick={() => setSel(maxT[0])} className="hover:text-accent">Max tension: {maxT[0]}</button>} v={tc(maxT[1])} />}
                  {maxC && maxC[1] < -1e-9 && <Row k={<button onClick={() => setSel(maxC[0])} className="hover:text-accent">Max compression: {maxC[0]}</button>} v={tc(maxC[1])} />}
                  <Row k="Zero-force members" v={String(sorted.filter(([, v]) => Math.abs(v) < 1e-6 * maxF).length)} />
                </div>
              </div>
            </>
          )}
          <Tries>
            <li>Sweep the load across a Pratt truss and watch a middle diagonal: it flips from tension to compression. Its ILD crosses zero inside its own panel.</li>
            <li>Click a top-chord member: its ILD is a triangle — the beam moment ILD at the opposite joint divided by h.</li>
            <li>Switch Pratt ↔ Howe: diagonals swap T and C, verticals too.</li>
            <li>With the load on the bottom chord, find the verticals that only work when the load sits in the two panels next to them — then switch to the top chord and watch that change.</li>
            <li>Make the truss taller: chord forces drop (M / h), diagonals barely change.</li>
            <li>X-braced: both diagonals share the panel shear — notice how close the exact split is to half each.</li>
          </Tries>
        </div>
      </div>
    </div>
  )
}

function safe<T>(f: () => T): T | null {
  try {
    return f()
  } catch {
    return null
  }
}
