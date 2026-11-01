// Floor-system playground: build the girder (supports, hinges) and place the floor beams, then drag a
// load along the deck. Shows how the stringers hand it to the floor beams, the girder SFD/BMD, and
// the girder ILDs next to the "load sat directly on the girder" ones.

import { useMemo, useRef, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { makeTransform, StructureView, type Transform } from '../../components/StructureView'
import { Seg } from '../../components/ui'
import { ildAt } from '../../engine/ild'
import { type PlayBeam, type PlaySupportType } from '../../engine/playbeam'
import { rot, rotTag } from '../../engine/sign'
import { analyseFloor, buildFloor, floorILDs, floorPickILD, type FloorPick } from '../../kit/playfloor'
import { Slider } from '../../labs/common'
import { Chip, eventToWorld, PG_PAD as PAD, Plot, Row, StatusBox, ToolBar, Tries, TwoWays, useColumnWidth, useSweep } from '../../labs/playground'
import { useStore } from '../../store'

const SNAP = 0.5
type Tool = 'move' | 'fb' | 'pin' | 'roller' | 'hinge' | 'erase'

interface Preset {
  name: string
  L: number
  sup: [number, PlaySupportType][]
  hinges?: number[]
  fbs: number[]
  sec: number
  load: number
}
const every = (L: number, d: number) => Array.from({ length: Math.round(L / d) + 1 }, (_, k) => k * d)
const PRESETS: Preset[] = [
  { name: '4 equal panels', L: 40, sup: [[0, 'pin'], [40, 'roller']], fbs: every(40, 10), sec: 15, load: 14 },
  { name: '6 panels', L: 48, sup: [[0, 'pin'], [48, 'roller']], fbs: every(48, 8), sec: 20, load: 22 },
  { name: 'Overhanging girder', L: 40, sup: [[10, 'pin'], [40, 'roller']], fbs: every(40, 10), sec: 25, load: 4 },
  { name: 'Gerber girder (hinge)', L: 48, sup: [[0, 'pin'], [16, 'roller'], [48, 'roller']], hinges: [24], fbs: every(48, 8), sec: 36, load: 28 },
  { name: 'Floor beams off the supports', L: 40, sup: [[0, 'pin'], [40, 'roller']], fbs: [5, 15, 25, 35], sec: 20, load: 12 },
  { name: 'Continuous girder', L: 40, sup: [[0, 'pin'], [20, 'roller'], [40, 'roller']], fbs: every(40, 10), sec: 15, load: 14 },
]

let uid = 1
const girderOf = (p: Preset): PlayBeam => ({
  L: p.L,
  supports: p.sup.map(([x, type]) => ({ id: uid++, x, type })),
  hinges: (p.hinges ?? []).map((x) => ({ id: uid++, x })),
})

const TOOLS: { v: Tool; label: string; hint: string }[] = [
  { v: 'move', label: '✋ Move', hint: 'Drag the load, S, floor beams, supports or hinges. Click anywhere to drop the load there.' },
  { v: 'fb', label: '┃ Floor beam', hint: 'Click to add a floor beam (stringers always run simply supported between neighbouring floor beams).' },
  { v: 'pin', label: '▲ Pin', hint: 'Click the girder to add a pin support (or convert the support there).' },
  { v: 'roller', label: '◯ Roller', hint: 'Click the girder to add a roller support (or convert the support there).' },
  { v: 'hinge', label: '⚬ Hinge', hint: 'Click the girder to add an internal hinge.' },
  { v: 'erase', label: '✕ Erase', hint: 'Click a floor beam, support or hinge to remove it.' },
]

type Drag = { kind: 'load' } | { kind: 'sec' } | { kind: 'fb'; i: number } | { kind: 'sup'; id: number } | { kind: 'hinge'; id: number }
type PickKey = string // 'fb:<x>' | 'R:<x>'

export function FloorPlayground() {
  const [girder, setGirder] = useState<PlayBeam>(() => girderOf(PRESETS[0]))
  const [fbsRaw, setFbs] = useState<number[]>(PRESETS[0].fbs)
  const [loadX, setLoadX] = useState(PRESETS[0].load)
  const [secX, setSecX] = useState(PRESETS[0].sec)
  const [P, setP] = useState(10)
  const [tool, setTool] = useState<Tool>('move')
  const [pick, setPick] = useState<PickKey>('')
  const [trace, setTrace] = useState(false)
  const [play, setPlay] = useState(false)
  const drag = useRef<Drag | null>(null)
  const L = girder.L
  const bmdSide = useStore((s) => s.bmdSide)

  const b = useMemo(() => buildFloor({ girder, floorBeams: fbsRaw }), [girder, fbsRaw])
  const ok = !!b.fs
  const [d0, d1] = b.deck
  const lx = Math.min(Math.max(loadX, d0), d1)

  const res = useMemo(() => (ok ? safe(() => analyseFloor(b, lx, P, secX)) : null), [b, ok, lx, P, secX])
  const unit = useMemo(() => (res ? safe(() => analyseFloor(b, lx, 1, secX)) : null), [res, b, lx, secX])
  const ilds = useMemo(() => (ok ? safe(() => floorILDs(b, secX)) : null), [b, ok, secX])

  const pickOpts = useMemo(() => {
    const o: { v: PickKey; label: string; p: FloorPick }[] = []
    for (const x of b.fbs) o.push({ v: `fb:${x}`, label: `FB_${b.nameAt(x)}`, p: { kind: 'fb', x } })
    for (const s of [...girder.supports].sort((p, q) => p.x - q.x)) o.push({ v: `R:${s.x}`, label: `R_${b.nameAt(s.x)}`, p: { kind: 'R', x: s.x } })
    return o
  }, [b, girder])
  const pickCur = pickOpts.find((o) => o.v === pick) ?? pickOpts[Math.min(1, pickOpts.length - 1)]
  const pickILD = useMemo(() => (ok && pickCur ? safe(() => floorPickILD(b, pickCur.p)) : null), [b, ok, pickCur?.v])
  const pickVal = (r: typeof res) => {
    if (!r || !pickCur) return 0
    if (pickCur.p.kind === 'fb') return r.fbLoads.find((f) => Math.abs(f.x - pickCur.p.x) < 1e-9)?.F ?? 0
    return r.reactions.find((q) => Math.abs(q.x - pickCur.p.x) < 1e-9)?.R ?? 0
  }

  useSweep(play, d0, d1, setLoadX)

  const snap = (x: number) => Math.min(L, Math.max(0, Math.round(x / SNAP) * SNAP))
  const loadPreset = (p: Preset) => {
    setGirder(girderOf(p))
    setFbs(p.fbs)
    setLoadX(p.load)
    setSecX(p.sec)
    setPick('')
    setPlay(false)
  }
  const equalPanels = (n: number) => {
    const d = L / n
    setFbs(Array.from({ length: n + 1 }, (_, k) => Math.round((k * d) / SNAP) * SNAP))
  }
  const setLength = (nl: number) => {
    const f = nl / L
    const sc = (x: number) => Math.round((x * f) / SNAP) * SNAP
    setGirder((g) => ({
      L: nl,
      supports: dedupe(g.supports.map((s) => ({ ...s, x: s.type === 'fixed' ? (s.x > 0 ? nl : 0) : sc(s.x) }))),
      hinges: dedupe(g.hinges.map((h) => ({ ...h, x: Math.min(nl - SNAP, Math.max(SNAP, sc(h.x))) }))),
    }))
    setFbs((fb) => [...new Set(fb.map(sc))])
    setLoadX((x) => sc(x))
    setSecX((x) => Math.min(nl, sc(x)))
  }

  // ---------------------------------------------------------------- editing
  const addAt = (x: number) => {
    if (tool === 'fb') {
      if (!fbsRaw.includes(x)) setFbs([...fbsRaw, x].sort((a, c) => a - c))
    } else if (tool === 'hinge') {
      const hx = Math.min(L - SNAP, Math.max(SNAP, x))
      if (!girder.hinges.some((h) => h.x === hx) && girder.hinges.length < 4) setGirder({ ...girder, hinges: [...girder.hinges, { id: uid++, x: hx }] })
    } else if (tool === 'pin' || tool === 'roller') {
      const there = girder.supports.find((s) => s.x === x)
      if (there) setGirder({ ...girder, supports: girder.supports.map((s) => (s.id === there.id ? { ...s, type: tool } : s)) })
      else if (girder.supports.length < 6) setGirder({ ...girder, supports: [...girder.supports, { id: uid++, x, type: tool }] })
    }
  }
  const moveTo = (d: Drag, x: number) => {
    if (d.kind === 'load') setLoadX(x)
    else if (d.kind === 'sec') setSecX(x)
    else if (d.kind === 'fb')
      setFbs((fb) => {
        if (fb.some((q, i) => i !== d.i && q === x)) return fb
        return fb.map((q, i) => (i === d.i ? x : q))
      })
    else if (d.kind === 'sup')
      setGirder((g) => {
        const s = g.supports.find((q) => q.id === d.id)
        if (!s) return g
        const nx = s.type === 'fixed' ? (x < L / 2 ? 0 : L) : x
        if (nx === s.x || g.supports.some((q) => q.id !== d.id && q.x === nx)) return g
        return { ...g, supports: g.supports.map((q) => (q.id === d.id ? { ...q, x: nx } : q)) }
      })
    else
      setGirder((g) => {
        const nx = Math.min(L - SNAP, Math.max(SNAP, x))
        if (g.hinges.some((q) => q.id !== d.id && q.x === nx)) return g
        return { ...g, hinges: g.hinges.map((q) => (q.id === d.id ? { ...q, x: nx } : q)) }
      })
  }
  const removeFb = (i: number) => setFbs(fbsRaw.filter((_, k) => k !== i))
  const removeSup = (id: number) => setGirder({ ...girder, supports: girder.supports.filter((s) => s.id !== id) })
  const removeHinge = (id: number) => setGirder({ ...girder, hinges: girder.hinges.filter((h) => h.id !== id) })
  const cycleType = (id: number) =>
    setGirder({
      ...girder,
      supports: girder.supports.map((s) => {
        if (s.id !== id) return s
        const order: PlaySupportType[] = s.x === 0 || s.x === L ? ['pin', 'roller', 'fixed'] : ['pin', 'roller']
        return { ...s, type: order[(order.indexOf(s.type) + 1) % order.length] }
      }),
    })

  const grab = (d: Drag) => (e: React.PointerEvent) => {
    e.stopPropagation()
    if (tool === 'erase') {
      if (d.kind === 'fb') removeFb(d.i)
      if (d.kind === 'sup') removeSup(d.id)
      if (d.kind === 'hinge') removeHinge(d.id)
      return
    }
    if (tool !== 'move' && d.kind !== 'load' && d.kind !== 'sec') {
      if (d.kind === 'sup' && (tool === 'pin' || tool === 'roller')) addAt(girder.supports.find((q) => q.id === d.id)!.x)
      return
    }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    if (d.kind === 'load') setPlay(false)
    drag.current = d
  }

  // drawing geometry (must match the StructureView inside)
  const [colRef, W0] = useColumnWidth()
  const extraPts: [number, number][] = [[0, b.rise * 2.3]]
  const t = makeTransform([[0, 0], [L, 0], [0, b.rise], ...extraPts], W0, 300, PAD)
  const sortedSups = [...girder.supports].sort((p, q) => p.x - q.x)

  const overlay = (tt: Transform) => {
    const yG = tt.y(0)
    const yD = tt.y(b.rise)
    const X = tt.x
    const cursor = tool === 'move' ? 'pointer' : tool === 'erase' ? 'not-allowed' : 'copy'
    const wx = (e: React.PointerEvent) => {
      const p = eventToWorld(e, tt)
      return p ? snap(p.x) : null
    }
    return (
      <g
        onPointerMove={(e) => {
          if (!drag.current) return
          const x = wx(e)
          if (x !== null) moveTo(drag.current, x)
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <rect
          x={X(0) - 26}
          y={yD - 70}
          width={X(L) - X(0) + 52}
          height={yG - yD + 120}
          fill="transparent"
          style={{ cursor }}
          onPointerDown={(e) => {
            const x = wx(e)
            if (x === null) return
            if (tool === 'move') {
              setPlay(false)
              setLoadX(x)
              ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
              drag.current = { kind: 'load' }
            } else addAt(x)
          }}
        />
        <defs>
          <marker id="arwFB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent2)" />
          </marker>
        </defs>
        {/* load path: what each floor beam hands down to the girder */}
        {res &&
          res.fbLoads.map((f) =>
            Math.abs(f.F) > 1e-6 ? (
              <g key={f.x} pointerEvents="none">
                <line x1={X(f.x) + 7} x2={X(f.x) + 7} y1={yD + 4} y2={yD + 4 + Math.max(8, (yG - yD - 10) * Math.min(1, Math.abs(f.F) / P))} stroke="var(--c-accent2)" strokeWidth={3} markerEnd="url(#arwFB)" />
                <text x={X(f.x) + 13} y={(yD + yG) / 2 + 4} fontSize={11.5} fontWeight={700} fill="var(--c-accent2)" className="num" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
                  {fmt(f.F)}
                </text>
              </g>
            ) : null,
          )}
        {/* section S on the girder */}
        <g style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }} onPointerDown={grab({ kind: 'sec' })}>
          <line x1={X(secX)} x2={X(secX)} y1={yG - 14} y2={yG + 30} stroke="var(--c-accent)" strokeWidth={2} strokeDasharray="5 3" />
          <rect x={X(secX) - 11} y={yG + 30} width={22} height={18} rx={5} fill="var(--c-accent)" />
          <text x={X(secX)} y={yG + 43} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--c-bg)">
            S
          </text>
          <rect x={X(secX) - 10} y={yG - 16} width={20} height={66} fill="transparent" />
        </g>
        {/* the load on the deck */}
        <g style={{ cursor: tool === 'move' ? 'grab' : cursor }} onPointerDown={grab({ kind: 'load' })}>
          <line x1={X(lx)} x2={X(lx)} y1={yD - 52} y2={yD - 6} stroke="var(--c-load)" strokeWidth={3} markerEnd="url(#arw)" />
          <text x={X(lx)} y={yD - 57} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--c-load)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
            P = {fmt(P)} k
          </text>
          <rect x={X(lx) - 14} y={yD - 70} width={28} height={66} fill="transparent" />
        </g>
        {fbsRaw.map((x, i) => (
          <rect
            key={'f' + i}
            x={X(x) - 9}
            y={yD + 2}
            width={18}
            height={Math.max(6, yG - yD - 4)}
            rx={6}
            fill="transparent"
            stroke={tool === 'erase' ? 'var(--c-bad)' : 'transparent'}
            strokeDasharray="3 3"
            style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }}
            onPointerDown={grab({ kind: 'fb', i })}
          />
        ))}
        {girder.supports.map((s) => (
          <circle key={'s' + s.id} cx={X(s.x)} cy={yG + 12} r={15} fill="transparent" stroke={tool === 'erase' ? 'var(--c-bad)' : 'transparent'} strokeDasharray="3 3" style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }} onPointerDown={grab({ kind: 'sup', id: s.id })} />
        ))}
        {girder.hinges.map((h) => (
          <circle key={'h' + h.id} cx={X(h.x)} cy={yG} r={11} fill="transparent" stroke={tool === 'erase' ? 'var(--c-bad)' : 'transparent'} strokeDasharray="3 3" style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }} onPointerDown={grab({ kind: 'hinge', id: h.id })} />
        ))}
      </g>
    )
  }

  const status = !b.girder.det.stable
    ? { c: 'var(--c-bad)', t: 'Girder unstable — a mechanism', d: girder.supports.length ? 'Add a support or remove a hinge.' : 'Add some supports.' }
    : b.fbs.length < 2
      ? { c: 'var(--c-bad)', t: 'Need at least two floor beams', d: 'The stringers span between floor beams.' }
      : b.girder.det.label === 'determinate'
        ? { c: 'var(--c-good)', t: `Stable · ${b.fbs.length - 1} panels`, d: 'Girder is determinate: ILDs are straight lines.' }
        : { c: 'var(--c-load)', t: `Girder indeterminate (degree ${b.girder.det.dosi})`, d: 'Between panel points the ILDs are still straight — the stringers see to that.' }

  const etaV = unit?.VS ?? 0
  const etaM = unit?.MS ?? 0
  const etaPick = pickVal(unit)
  const xShown = Math.round(lx * 100) / 100
  const labelXs = [...b.stations]
  const maxM = res ? res.M.reduce((a, c) => (c.y > a.y ? c : a), { x: 0, y: 0 }) : null
  const minM = res ? res.M.reduce((a, c) => (c.y < a.y ? c : a), { x: 0, y: 0 }) : null

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
        <ToolBar value={tool} onChange={setTool} items={TOOLS} />
        <button className="btn !py-1" onClick={() => setPlay(!play)}>
          {play ? '❚❚ pause' : '▶ sweep load'}
        </button>
        <label className="flex items-center gap-1.5 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} className="accent-[var(--c-accent)]" />
          Trace mode
        </label>
      </div>
      <div className="text-xs text-mute">{TOOLS.find((x) => x.v === tool)!.hint}</div>

      <div className="grid cq-lg:grid-cols-[1fr_290px] gap-4 items-start">
        <div className="min-w-0" ref={colRef}>
          <div className="rounded-xl bg-bg/60 border border-line p-2 touch-none select-none">
            <StructureView model={b.fs?.model ?? b.girder.model} showLoads={false} autoDimX={b.stations} maxWidth={W0} maxHeight={300} pad={PAD} freeEnds={false} extra={extraPts}>
              {overlay}
            </StructureView>
          </div>

          <div className="grid cq-sm:grid-cols-2 gap-x-6 gap-y-1 mt-3">
            <Slider
              label="Load position x"
              value={xShown}
              min={d0}
              max={d1}
              step={SNAP}
              onChange={(v) => {
                setPlay(false)
                setLoadX(v)
              }}
              unit="′"
            />
            <Slider label="Section S at" value={secX} min={0} max={L} step={SNAP} onChange={setSecX} unit="′" />
            <Slider label="Load P" value={P} min={1} max={50} step={1} onChange={setP} unit=" k" />
            <Slider label="Girder length" value={L} min={16} max={80} step={1} onChange={setLength} unit="′" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-mute">
            Equal panels:
            {[2, 3, 4, 5, 6, 8].map((n) => (
              <button key={n} className="btn !py-0.5 !px-2 !text-xs" onClick={() => equalPanels(n)}>
                {n}
              </button>
            ))}
          </div>

          {!res || !ilds ? (
            <div className="rounded-xl px-4 py-6 my-3 text-sm text-center" style={{ background: 'color-mix(in oklab, var(--c-bad) 9%, transparent)' }}>
              <div className="font-bold" style={{ color: 'var(--c-bad)' }}>
                {status.t}
              </div>
              <div className="text-mute mt-1">{status.d} Diagrams appear as soon as it works.</div>
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              <Plot title={`Girder SFD — P at x = ${fmt(xShown)}′`} badge={`V at S = ${fmt(res.VS)} k`} pts={res.V} x1={L} W={t.W} color="var(--c-shear)" labelXs={labelXs} secX={secX} loadX={lx} dot={{ x: secX, y: res.VS, color: 'var(--c-accent)' }} />
              <Plot
                title={`Girder BMD · sagging ${bmdSide === 'tension' ? '↓' : '↑'}`}
                badge={`M at S = ${fmt(res.MS)} k-ft`}
                pts={res.M}
                x1={L}
                W={t.W}
                color="var(--c-moment)"
                flip={bmdSide === 'tension'}
                labelXs={labelXs}
                secX={secX}
                loadX={lx}
                dot={{ x: secX, y: res.MS, color: 'var(--c-accent)' }}
              />
              <Plot
                title={`ILD of girder shear at S (x = ${fmt(secX)}′)`}
                badge={`η = ${fmt(etaV, 3)}`}
                pts={ilds.V.pts}
                x1={L}
                W={t.W}
                color="var(--c-shear)"
                sign
                digits={3}
                labelXs={[...b.fbs, secX]}
                secX={secX}
                loadX={lx}
                clipTo={trace ? lx : undefined}
                dot={{ x: lx, y: etaV, color: 'var(--c-load)' }}
                ghost={ilds.directV.pts}
                ghostLabel="load directly on the girder"
              />
              <Plot
                title={`ILD of girder moment at S (x = ${fmt(secX)}′)`}
                badge={`η = ${fmt(etaM, 3)}`}
                pts={ilds.M.pts}
                x1={L}
                W={t.W}
                color="var(--c-moment)"
                sign
                digits={3}
                labelXs={[...b.fbs, secX]}
                secX={secX}
                loadX={lx}
                clipTo={trace ? lx : undefined}
                dot={{ x: lx, y: etaM, color: 'var(--c-load)' }}
                ghost={ilds.directM.pts}
                ghostLabel="load directly on the girder"
              />
              {pickILD && pickCur && (
                <Plot
                  title={pickCur.p.kind === 'fb' ? `ILD of floor-beam load ${pickCur.label} (on the girder, down +)` : `ILD of girder reaction ${pickCur.label} (up +)`}
                  badge={`η = ${fmt(etaPick, 3)}`}
                  pts={pickILD.pts}
                  x1={L}
                  W={t.W}
                  color="var(--c-accent2)"
                  sign
                  digits={3}
                  labelXs={b.fbs}
                  loadX={lx}
                  clipTo={trace ? lx : undefined}
                  dot={{ x: lx, y: etaPick, color: 'var(--c-load)' }}
                />
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-mute pl-1">
                Bottom chart:
                <Seg size="xs" value={pickCur?.v ?? ''} onChange={setPick} items={pickOpts.map((o) => ({ v: o.v, label: o.label }))} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 cq-lg:sticky cq-lg:top-4">
          <StatusBox {...status}>{b.girder.hiddenX && b.girder.det.stable && <div className="text-mute text-xs mt-1">All rollers: one also holds the girder sideways (fine for vertical loads).</div>}</StatusBox>

          <div className="card p-3">
            <div className="font-bold text-sm mb-1">Girder &amp; floor beams</div>
            <div className="flex flex-wrap gap-1.5">
              {sortedSups.map((s) => (
                <Chip key={s.id} onRemove={() => removeSup(s.id)}>
                  <button className="hover:text-accent" title="click to change type" onClick={() => cycleType(s.id)}>
                    {b.nameAt(s.x)} · {s.type}
                  </button>
                  <span className="text-mute num"> @ {fmt(s.x)}′</span>
                </Chip>
              ))}
              {[...girder.hinges]
                .sort((p, q) => p.x - q.x)
                .map((h) => (
                  <Chip key={h.id} onRemove={() => removeHinge(h.id)}>
                    {b.nameAt(h.x)} · hinge<span className="text-mute num"> @ {fmt(h.x)}′</span>
                  </Chip>
                ))}
            </div>
            <div className="text-xs text-mute mt-2">
              Floor beams at <span className="num text-ink">{b.fbs.map((x) => fmt(x)).join(', ')}′</span>
            </div>
          </div>

          {res && ilds && (
            <>
              <div className="card p-3">
                <div className="font-bold text-sm mb-1">Load path (P = {fmt(P)} k at {fmt(xShown)}′)</div>
                {res.fbLoads
                  .filter((f) => Math.abs(f.F) > 1e-9)
                  .map((f) => (
                    <Row key={f.x} k={`Floor beam ${f.name} → girder`} v={`${fmt(f.F)} k ↓`} />
                  ))}
                <div className="border-t border-line/60 mt-1.5 pt-1.5">
                  {res.reactions.map((r) => (
                    <div key={r.name}>
                      <Row k={`R_${r.name}`} v={`${fmt(Math.abs(r.R))} k ${r.R >= 0 ? '↑' : '↓'}`} />
                      {r.type === 'fixed' && <Row k={`M_${r.name} (${rotTag()})`} v={`${fmt(rot(r.M))} k-ft`} />}
                    </div>
                  ))}
                </div>
                {maxM && minM && (
                  <div className="border-t border-line/60 mt-1.5 pt-1.5">
                    {maxM.y > 1e-9 && <Row k="Max +M" v={`${fmt(maxM.y)} k-ft @ ${fmt(maxM.x)}′`} />}
                    {minM.y < -1e-9 && <Row k="Max −M" v={`${fmt(minM.y)} k-ft @ ${fmt(minM.x)}′`} />}
                  </div>
                )}
              </div>

              <div className="card p-3">
                <div className="font-bold text-sm">Same number, two ways</div>
                <div className="text-[11px] text-mute mb-2">Solve for P and read the girder at S — or read the ILD at the load and multiply by P.</div>
                <TwoWays name="V_S" value={res.VS} P={P} eta={etaV} unit="k" />
                <TwoWays name="M_S" value={res.MS} P={P} eta={etaM} unit="k-ft" />
                {pickCur && <TwoWays name={pickCur.label} value={pickVal(res)} P={P} eta={etaPick} unit="k" />}
              </div>
            </>
          )}

          <Tries>
            <li>Put S in the middle of a panel: the solid ILD is straight between the two floor beams, the dashed (direct) one peaks at S. That cut-off corner is all a floor system changes.</li>
            <li>Move S around inside one panel — the shear ILD doesn't change. That is “shear in panel BC”.</li>
            <li>Drag a floor beam onto S: solid and dashed now meet at S.</li>
            <li>Click <b>Equal panels → 8</b>: more floor beams, closer to direct loading.</li>
            <li>Watch the purple arrows while sweeping: only the two floor beams of the loaded panel ever carry anything.</li>
            <li>Try <b>Floor beams off the supports</b>: the deck is shorter than the girder, so the ILDs stop at the end floor beams.</li>
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

function dedupe<T extends { x: number }>(arr: T[]): T[] {
  const out: T[] = []
  for (const a of arr) if (!out.some((q) => q.x === a.x)) out.push(a)
  return out
}
