// Beam playground: build any straight beam (supports + hinges anywhere), drag a point load and a
// section, and watch SFD, BMD and the influence lines at the section update together.

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { fmt } from '../../components/DiagramView'
import { makeTransform, StructureView, type Transform } from '../../components/StructureView'
import { Seg } from '../../components/ui'
import { ildAt, type ILD, type Pt } from '../../engine/ild'
import { analyse, buildBeam, reactionILD, sectionILDs, type PlayBeam, type PlaySupportType } from '../../engine/playbeam'
import { rot, rotTag } from '../../engine/sign'
import { Slider } from '../../labs/common'
import { useStore } from '../../store'

const PAD = 56
const W_MAX = 820
const W_MIN = 380
const SNAP = 0.5
const MAX_SUPPORTS = 6
const MAX_HINGES = 4

type Tool = 'move' | PlaySupportType | 'hinge' | 'erase'

interface Preset {
  name: string
  beam: Omit<PlayBeam, 'supports' | 'hinges'> & { supports: [number, PlaySupportType][]; hinges: number[] }
  sec: number
  load: number
}

const PRESETS: Preset[] = [
  { name: 'Simply supported', beam: { L: 20, supports: [[0, 'pin'], [20, 'roller']], hinges: [] }, sec: 8, load: 4 },
  { name: 'Overhangs', beam: { L: 30, supports: [[6, 'pin'], [24, 'roller']], hinges: [] }, sec: 14, load: 2 },
  { name: 'Cantilever', beam: { L: 15, supports: [[0, 'fixed']], hinges: [] }, sec: 5, load: 12 },
  { name: 'Gerber (hinge)', beam: { L: 40, supports: [[0, 'pin'], [16, 'roller'], [40, 'roller']], hinges: [22] }, sec: 30, load: 8 },
  { name: 'Fixed + hinge', beam: { L: 34, supports: [[0, 'fixed'], [34, 'roller']], hinges: [14] }, sec: 24, load: 6 },
  { name: 'Propped cantilever', beam: { L: 20, supports: [[0, 'fixed'], [20, 'roller']], hinges: [] }, sec: 10, load: 6 },
  { name: '2-span continuous', beam: { L: 30, supports: [[0, 'pin'], [15, 'roller'], [30, 'roller']], hinges: [] }, sec: 7.5, load: 4 },
]

let uid = 1
const fromPreset = (p: Preset): PlayBeam => ({
  L: p.beam.L,
  supports: p.beam.supports.map(([x, type]) => ({ id: uid++, x, type })),
  hinges: p.beam.hinges.map((x) => ({ id: uid++, x })),
})

const TOOLS: { v: Tool; label: string; hint: string }[] = [
  { v: 'move', label: '✋ Move', hint: 'Drag the load, the section S, supports or hinges. Click the beam to drop the load there.' },
  { v: 'pin', label: '▲ Pin', hint: 'Click the beam to add a pin (or turn the support there into a pin).' },
  { v: 'roller', label: '◯ Roller', hint: 'Click the beam to add a roller (or turn the support there into a roller).' },
  { v: 'fixed', label: '▮ Fixed', hint: 'Fixed supports go on an end — click near the end you want.' },
  { v: 'hinge', label: '⚬ Hinge', hint: 'Click the beam to add an internal hinge (not on an end).' },
  { v: 'erase', label: '✕ Erase', hint: 'Click a support or hinge to remove it.' },
]

type Drag = { kind: 'load' } | { kind: 'sec' } | { kind: 'sup'; id: number } | { kind: 'hinge'; id: number }

export function BeamPlayground() {
  const [beam, setBeam] = useState<PlayBeam>(() => fromPreset(PRESETS[0]))
  const [loadX, setLoadX] = useState(PRESETS[0].load)
  const [secX, setSecX] = useState(PRESETS[0].sec)
  const [P, setP] = useState(10)
  const [tool, setTool] = useState<Tool>('move')
  const [rSel, setRSel] = useState<string>('')
  const [trace, setTrace] = useState(false)
  const [play, setPlay] = useState(false)
  const drag = useRef<Drag | null>(null)
  const L = beam.L

  const bb = useMemo(() => buildBeam(beam), [beam])
  const stable = bb.det.stable
  const res = useMemo(() => {
    if (!stable) return null
    try {
      return analyse(bb, loadX, P, secX)
    } catch {
      return null
    }
  }, [bb, stable, loadX, P, secX])
  const ilds = useMemo(() => {
    if (!stable) return null
    try {
      return sectionILDs(bb, secX)
    } catch {
      return null
    }
  }, [bb, stable, secX])

  // reaction ILD choice: "<supportId>:y" or "<supportId>:m"
  const rOpts = useMemo(
    () =>
      [...beam.supports]
        .sort((a, b) => a.x - b.x)
        .flatMap((s) => {
          const n = bb.nameAt(s.x)
          const o: { v: string; label: string; x: number; comp: 'y' | 'm' }[] = [{ v: `${s.id}:y`, label: `R_${n}`, x: s.x, comp: 'y' }]
          if (s.type === 'fixed') o.push({ v: `${s.id}:m`, label: `M_${n}`, x: s.x, comp: 'm' })
          return o
        }),
    [beam, bb],
  )
  const rCur = rOpts.find((o) => o.v === rSel) ?? rOpts[0]
  const rILD = useMemo(() => {
    if (!stable || !rCur) return null
    try {
      return reactionILD(bb, rCur.x, rCur.comp)
    } catch {
      return null
    }
  }, [bb, stable, rCur?.x, rCur?.comp])

  // play: sweep the load across the beam
  useEffect(() => {
    if (!play) return
    let raf = 0
    let last = performance.now()
    const speed = L / 7 // whole beam in ~7 s
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      setLoadX((x) => {
        const nx = x + speed * dt
        return nx > L ? 0 : nx
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, L])

  const snap = (x: number) => Math.min(L, Math.max(0, Math.round(x / SNAP) * SNAP))
  const xShown = Math.round(loadX * 100) / 100

  const loadPreset = (p: Preset) => {
    setBeam(fromPreset(p))
    setLoadX(p.load)
    setSecX(p.sec)
    setRSel('')
    setPlay(false)
  }

  const setLength = (nl: number) => {
    const f = nl / L
    const sc = (x: number) => Math.round((x * f) / SNAP) * SNAP
    setBeam((b) => {
      const sups: PlayBeam['supports'] = []
      for (const s of b.supports) {
        const x = s.type === 'fixed' ? (s.x > 0 ? nl : 0) : sc(s.x)
        if (!sups.some((q) => q.x === x)) sups.push({ ...s, x })
      }
      const hs: PlayBeam['hinges'] = []
      for (const h of b.hinges) {
        const x = Math.min(nl - SNAP, Math.max(SNAP, sc(h.x)))
        if (!hs.some((q) => q.x === x)) hs.push({ ...h, x })
      }
      return { L: nl, supports: sups, hinges: hs }
    })
    setLoadX((x) => Math.min(nl, sc(x)))
    setSecX((x) => Math.min(nl, sc(x)))
  }

  // ---------------------------------------------------------------- editing
  const addAt = (x: number) => {
    if (tool === 'hinge') {
      const hx = Math.min(L - SNAP, Math.max(SNAP, x))
      if (beam.hinges.some((h) => h.x === hx) || beam.hinges.length >= MAX_HINGES) return
      setBeam({ ...beam, hinges: [...beam.hinges, { id: uid++, x: hx }] })
      return
    }
    if (tool !== 'pin' && tool !== 'roller' && tool !== 'fixed') return
    const sx = tool === 'fixed' ? (x < L / 2 ? 0 : L) : x
    const there = beam.supports.find((s) => s.x === sx)
    if (there) setBeam({ ...beam, supports: beam.supports.map((s) => (s.id === there.id ? { ...s, type: tool } : s)) })
    else if (beam.supports.length < MAX_SUPPORTS) setBeam({ ...beam, supports: [...beam.supports, { id: uid++, x: sx, type: tool }] })
  }

  const moveTo = (d: Drag, x: number) => {
    if (d.kind === 'load') setLoadX(x)
    else if (d.kind === 'sec') setSecX(x)
    else if (d.kind === 'sup')
      setBeam((b) => {
        const s = b.supports.find((q) => q.id === d.id)
        if (!s) return b
        const nx = s.type === 'fixed' ? (x < L / 2 ? 0 : L) : x
        if (nx === s.x || b.supports.some((q) => q.id !== d.id && q.x === nx)) return b
        return { ...b, supports: b.supports.map((q) => (q.id === d.id ? { ...q, x: nx } : q)) }
      })
    else
      setBeam((b) => {
        const nx = Math.min(L - SNAP, Math.max(SNAP, x))
        const h = b.hinges.find((q) => q.id === d.id)
        if (!h || nx === h.x || b.hinges.some((q) => q.id !== d.id && q.x === nx)) return b
        return { ...b, hinges: b.hinges.map((q) => (q.id === d.id ? { ...q, x: nx } : q)) }
      })
  }

  const removeSup = (id: number) => setBeam({ ...beam, supports: beam.supports.filter((s) => s.id !== id) })
  const removeHinge = (id: number) => setBeam({ ...beam, hinges: beam.hinges.filter((h) => h.id !== id) })
  const cycleType = (id: number) =>
    setBeam({
      ...beam,
      supports: beam.supports.map((s) => {
        if (s.id !== id) return s
        const atEnd = s.x === 0 || s.x === L
        const order: PlaySupportType[] = atEnd ? ['pin', 'roller', 'fixed'] : ['pin', 'roller']
        const type = order[(order.indexOf(s.type) + 1) % order.length]
        return { ...s, type }
      }),
    })

  const worldX = (e: React.PointerEvent, t: Transform) => {
    const svg = (e.currentTarget as SVGGraphicsElement).ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(ctm.inverse())
    return snap(t.minX + (p.x - PAD) / t.k)
  }

  const grab = (d: Drag) => (e: React.PointerEvent) => {
    e.stopPropagation()
    if (tool === 'erase') {
      if (d.kind === 'sup') removeSup(d.id)
      if (d.kind === 'hinge') removeHinge(d.id)
      return
    }
    if (tool !== 'move' && (d.kind === 'sup' || d.kind === 'hinge')) {
      // in an add tool, clicking an existing support converts it
      if (d.kind === 'sup') {
        const s = beam.supports.find((q) => q.id === d.id)
        if (s && tool !== 'hinge') addAt(s.x)
      }
      return
    }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    if (d.kind === 'load') setPlay(false)
    drag.current = d
  }

  // draw at the real column width (clamped) so text stays readable on a phone
  const colRef = useRef<HTMLDivElement>(null)
  const [colW, setColW] = useState(W_MAX)
  useEffect(() => {
    const el = colRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setColW(Math.round(Math.min(W_MAX, Math.max(W_MIN, e.contentRect.width - 16)))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const W0 = colW
  const t = makeTransform([[0, 0], [L, 0]], W0, 300, PAD)
  const bmdSide = useStore((s) => s.bmdSide)
  const toolHint = TOOLS.find((x) => x.v === tool)!.hint
  const nameS = (x: number) => `${fmt(x)}′`

  const overlay = (tt: Transform) => {
    const y0 = tt.y(0)
    const X = tt.x
    const cursor = tool === 'move' ? 'pointer' : tool === 'erase' ? 'not-allowed' : 'copy'
    return (
      <g
        onPointerMove={(e) => {
          if (!drag.current) return
          const x = worldX(e, tt)
          if (x !== null) moveTo(drag.current, x)
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        {/* click target along the beam */}
        <rect
          x={X(0) - 26}
          y={y0 - 70}
          width={X(L) - X(0) + 52}
          height={130}
          fill="transparent"
          style={{ cursor }}
          onPointerDown={(e) => {
            const x = worldX(e, tt)
            if (x === null) return
            if (tool === 'move') {
              setPlay(false)
              setLoadX(x)
              ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
              drag.current = { kind: 'load' }
            } else addAt(x)
          }}
        />
        {/* section S */}
        <g style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }} onPointerDown={grab({ kind: 'sec' })}>
          <line x1={X(secX)} x2={X(secX)} y1={y0 - 30} y2={y0 + 30} stroke="var(--c-accent)" strokeWidth={2} strokeDasharray="5 3" />
          <rect x={X(secX) - 11} y={y0 + 30} width={22} height={18} rx={5} fill="var(--c-accent)" />
          <text x={X(secX)} y={y0 + 43} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--c-bg)">
            S
          </text>
          <rect x={X(secX) - 10} y={y0 - 32} width={20} height={82} fill="transparent" />
        </g>
        {/* the load */}
        <g style={{ cursor: tool === 'move' ? 'grab' : cursor }} onPointerDown={grab({ kind: 'load' })}>
          <line x1={X(loadX)} x2={X(loadX)} y1={y0 - 58} y2={y0 - 6} stroke="var(--c-load)" strokeWidth={3} markerEnd="url(#arw)" />
          <text x={X(loadX)} y={y0 - 63} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--c-load)" style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}>
            P = {fmt(P)} k
          </text>
          <rect x={X(loadX) - 14} y={y0 - 76} width={28} height={72} fill="transparent" />
        </g>
        {/* support + hinge handles */}
        {beam.supports.map((s) => (
          <circle
            key={'s' + s.id}
            cx={X(s.x)}
            cy={y0 + 12}
            r={15}
            fill="transparent"
            stroke={tool === 'erase' ? 'var(--c-bad)' : 'transparent'}
            strokeDasharray="3 3"
            style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }}
            onPointerDown={grab({ kind: 'sup', id: s.id })}
          />
        ))}
        {beam.hinges.map((h) => (
          <circle
            key={'h' + h.id}
            cx={X(h.x)}
            cy={y0}
            r={11}
            fill="transparent"
            stroke={tool === 'erase' ? 'var(--c-bad)' : 'transparent'}
            strokeDasharray="3 3"
            style={{ cursor: tool === 'move' ? 'ew-resize' : cursor }}
            onPointerDown={grab({ kind: 'hinge', id: h.id })}
          />
        ))}
      </g>
    )
  }

  const stations = bb.xs
  const status = !stable
    ? { c: 'var(--c-bad)', t: 'Unstable — a mechanism', d: bb.beam.supports.length === 0 ? 'Add some supports.' : 'It can move without bending. Add a support or remove a hinge.' }
    : bb.det.label === 'determinate'
      ? { c: 'var(--c-good)', t: 'Stable · statically determinate', d: 'Every ILD is made of straight lines.' }
      : { c: 'var(--c-load)', t: `Indeterminate to degree ${bb.det.dosi}`, d: 'ILDs become curves (Müller-Breslau with an elastic deflected shape).' }

  const sortedSups = [...beam.supports].sort((a, b) => a.x - b.x)
  // ILD ordinates at the load = the same solve with P = 1 (exact, also between the ILD's sample points)
  const unit = useMemo(() => (res ? analyse(bb, loadX, 1, secX) : null), [res, bb, loadX, secX])
  const pickR = (r: typeof res) => {
    const q = r && rCur ? r.reactions.find((x) => Math.abs(x.x - rCur.x) < 1e-9) : null
    return q ? (rCur!.comp === 'm' ? rot(q.M) : q.R) : 0
  }
  const etaV = unit?.VS ?? 0
  const etaM = unit?.MS ?? 0
  const etaR = pickR(unit)
  const rVal = pickR(res)
  const maxM = res ? res.M.reduce((a, b) => (b.y > a.y ? b : a), { x: 0, y: 0 }) : null
  const minM = res ? res.M.reduce((a, b) => (b.y < a.y ? b : a), { x: 0, y: 0 }) : null

  return (
    <div className="space-y-3">
      {/* presets + tools */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-mute mr-1">Start from:</span>
        {PRESETS.map((p) => (
          <button key={p.name} className="btn !py-1 !text-xs" onClick={() => loadPreset(p)}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap rounded-lg border border-line overflow-hidden">
          {TOOLS.map((x) => (
            <button key={x.v} onClick={() => setTool(x.v)} className={'px-2.5 py-1 text-sm font-semibold ' + (tool === x.v ? 'bg-accent text-bg' : 'bg-panel2 text-mute hover:text-ink')}>
              {x.label}
            </button>
          ))}
        </div>
        <button className="btn !py-1" onClick={() => setPlay(!play)}>
          {play ? '❚❚ pause' : '▶ sweep load'}
        </button>
        <label className="flex items-center gap-1.5 text-sm text-mute cursor-pointer select-none">
          <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} className="accent-[var(--c-accent)]" />
          Trace mode (ILDs draw themselves as the load moves)
        </label>
      </div>
      <div className="text-xs text-mute">{toolHint}</div>

      <div className="grid cq-lg:grid-cols-[1fr_290px] gap-4 items-start">
        <div className="min-w-0" ref={colRef}>
          <div className="rounded-xl bg-bg/60 border border-line p-2 touch-none select-none">
            <StructureView model={bb.model} showLoads={false} autoDimX maxWidth={W0} maxHeight={300} pad={PAD} freeEnds={false}>
              {overlay}
            </StructureView>
          </div>

          <div className="grid cq-sm:grid-cols-2 gap-x-6 gap-y-1 mt-3">
            <Slider label="Load position x" value={xShown} min={0} max={L} step={SNAP} onChange={(v) => {
                setPlay(false)
                setLoadX(v)
              }} unit="′" />
            <Slider label="Section S at" value={secX} min={0} max={L} step={SNAP} onChange={setSecX} unit="′" />
            <Slider label="Load P" value={P} min={1} max={50} step={1} onChange={setP} unit=" k" />
            <Slider label="Beam length" value={L} min={10} max={60} step={1} onChange={setLength} unit="′" />
          </div>

          {!stable || !res || !ilds ? (
            <div className="rounded-xl px-4 py-6 my-3 text-sm text-center" style={{ background: 'color-mix(in oklab, var(--c-bad) 9%, transparent)' }}>
              <div className="font-bold" style={{ color: 'var(--c-bad)' }}>
                {status.t}
              </div>
              <div className="text-mute mt-1">{status.d} Diagrams appear as soon as the beam is stable.</div>
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              <Plot
                title={`SFD — P at x = ${fmt(xShown)}′`}
                badge={`V at S = ${fmt(res.VS)} k`}
                pts={res.V}
                L={L}
                W={t.W}
                color="var(--c-shear)"
                labelXs={[...stations, loadX]}
                secX={secX}
                loadX={loadX}
                dot={{ x: secX, y: res.VS, color: 'var(--c-accent)' }}
              />
              <Plot
                title={`BMD — P at x = ${fmt(xShown)}′ · sagging ${bmdSide === 'tension' ? '↓' : '↑'}`}
                badge={`M at S = ${fmt(res.MS)} k-ft`}
                pts={res.M}
                L={L}
                W={t.W}
                color="var(--c-moment)"
                flip={bmdSide === 'tension'}
                labelXs={[...stations, loadX]}
                secX={secX}
                loadX={loadX}
                dot={{ x: secX, y: res.MS, color: 'var(--c-accent)' }}
              />
              <Plot
                title={`ILD of shear at S (x = ${nameS(secX)})`}
                badge={`η = ${fmt(etaV, 3)}`}
                pts={ilds.V.pts}
                L={L}
                W={t.W}
                color="var(--c-shear)"
                sign
                digits={3}
                labelXs={[...stations, secX]}
                secX={secX}
                loadX={loadX}
                clipTo={trace ? loadX : undefined}
                dot={{ x: loadX, y: etaV, color: 'var(--c-load)' }}
              />
              <Plot
                title={`ILD of moment at S (x = ${nameS(secX)})`}
                badge={`η = ${fmt(etaM, 3)}`}
                pts={ilds.M.pts}
                L={L}
                W={t.W}
                color="var(--c-moment)"
                sign
                digits={3}
                labelXs={[...stations, secX]}
                secX={secX}
                loadX={loadX}
                clipTo={trace ? loadX : undefined}
                dot={{ x: loadX, y: etaM, color: 'var(--c-load)' }}
              />
              {rILD && rCur && (
                <Plot
                  title={`ILD of ${rCur.label} ${rCur.comp === 'm' ? `(fixed-end moment, ${rotTag()})` : '(reaction, up +)'}`}
                  badge={`η = ${fmt(etaR, 3)}`}
                  pts={rILD.pts}
                  L={L}
                  W={t.W}
                  color="var(--c-accent)"
                  sign
                  digits={3}
                  labelXs={stations}
                  loadX={loadX}
                  clipTo={trace ? loadX : undefined}
                  dot={{ x: loadX, y: etaR, color: 'var(--c-load)' }}
                />
              )}
              {rOpts.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-mute pl-1">
                  Reaction ILD for:
                  <Seg size="xs" value={rCur?.v ?? ''} onChange={setRSel} items={rOpts.map((o) => ({ v: o.v, label: o.label }))} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* readout */}
        <div className="space-y-3 cq-lg:sticky cq-lg:top-4">
          <div className="rounded-xl px-3 py-2 text-sm" style={{ background: `color-mix(in oklab, ${status.c} 10%, transparent)`, borderLeft: `3px solid ${status.c}` }}>
            <div className="font-bold" style={{ color: status.c }}>
              {status.t}
            </div>
            <div className="text-mute text-xs mt-0.5">{status.d}</div>
            {bb.hiddenX && stable && <div className="text-mute text-xs mt-1">All rollers: treated as if one of them also holds the beam sideways (fine for vertical loads).</div>}
          </div>

          <div className="card p-3">
            <div className="font-bold text-sm mb-1">Supports &amp; hinges</div>
            {sortedSups.length === 0 && beam.hinges.length === 0 && <div className="text-xs text-mute">None yet — pick a tool and click the beam.</div>}
            <div className="flex flex-wrap gap-1.5">
              {sortedSups.map((s) => (
                <Chip key={s.id} onRemove={() => removeSup(s.id)}>
                  <button className="hover:text-accent" title="click to change type" onClick={() => cycleType(s.id)}>
                    {bb.nameAt(s.x)} · {s.type}
                  </button>
                  <span className="text-mute num"> @ {fmt(s.x)}′</span>
                </Chip>
              ))}
              {[...beam.hinges]
                .sort((a, b) => a.x - b.x)
                .map((h) => (
                  <Chip key={h.id} onRemove={() => removeHinge(h.id)}>
                    {bb.nameAt(h.x)} · hinge<span className="text-mute num"> @ {fmt(h.x)}′</span>
                  </Chip>
                ))}
            </div>
            <div className="text-[11px] text-faint mt-1.5">Click a support's name to cycle pin → roller (→ fixed on an end).</div>
          </div>

          {res && ilds && (
            <>
              <div className="card p-3">
                <div className="font-bold text-sm mb-1">Reactions (P = {fmt(P)} k at {fmt(xShown)}′)</div>
                {res.reactions.map((r) => (
                  <div key={r.name}>
                    <Row k={`R_${r.name}`} v={`${fmt(Math.abs(r.R))} k ${r.R >= 0 ? '↑' : '↓'}`} />
                    {r.type === 'fixed' && <Row k={`M_${r.name}`} v={`${fmt(Math.abs(r.M))} k-ft ${r.M >= 0 ? '↺' : '↻'}`} />}
                  </div>
                ))}
                {maxM && minM && (
                  <div className="border-t border-line/60 mt-1.5 pt-1.5">
                    {maxM.y > 1e-9 && <Row k="Max +M" v={`${fmt(maxM.y)} k-ft @ ${fmt(maxM.x)}′`} />}
                    {minM.y < -1e-9 && <Row k="Max −M" v={`${fmt(minM.y)} k-ft @ ${fmt(minM.x)}′`} />}
                  </div>
                )}
              </div>

              <div className="card p-3">
                <div className="font-bold text-sm">Same number, two ways</div>
                <div className="text-[11px] text-mute mb-2">Left: solve the beam for P, read the diagram at S. Right: read the ILD at the load, multiply by P.</div>
                <TwoWays name="V_S" diagram={res.VS} P={P} eta={etaV} unit="k" />
                <TwoWays name="M_S" diagram={res.MS} P={P} eta={etaM} unit="k-ft" />
                {rCur && <TwoWays name={rCur.label} diagram={rVal} P={P} eta={etaR} unit={rCur.comp === 'm' ? 'k-ft' : 'k'} />}
              </div>
            </>
          )}

          <div className="card p-3 text-xs leading-relaxed">
            <div className="font-bold text-sm mb-1">Things to try</div>
            <ul className="list-disc pl-4 space-y-1 text-mute">
              <li>Sweep the load with <b>Trace mode</b> on: the ILD is just “the value at S” plotted against where the load is.</li>
              <li>Watch the BMD: its peak always sits under the load. The <i>moment</i> ILD peaks when the load reaches S.</li>
              <li>Drag the load across S: the shear ILD jumps by exactly 1 there.</li>
              <li>Put S on a hinge — the moment ILD flattens to zero. Shear still passes through.</li>
              <li>Use <b>Overhangs</b> and push the load onto an overhang: the far reaction goes negative (hold-down needed).</li>
              <li>Add a hinge between two supports with nothing else — the status turns red: one hinge too many.</li>
              <li>Try <b>Propped cantilever</b> or <b>2-span continuous</b>: the straight lines turn into curves.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-panel2 pl-2.5 pr-1 py-0.5 text-xs font-semibold">
      {children}
      <button className="ml-0.5 w-4 h-4 rounded-full text-mute hover:text-bad hover:bg-bad/10 leading-none" title="remove" onClick={onRemove}>
        ×
      </button>
    </span>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm py-0.5">
      <span className="text-mute">{k}</span>
      <span className="num font-semibold">{v}</span>
    </div>
  )
}

function TwoWays({ name, diagram, P, eta, unit }: { name: string; diagram: number; P: number; eta: number; unit: string }) {
  const viaILD = P * eta
  const ok = Math.abs(viaILD - diagram) <= 1e-6 * Math.max(1, Math.abs(diagram))
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 items-baseline text-sm py-1 border-t border-line/50 first-of-type:border-0">
      <span className="font-bold">{name}</span>
      <span className="num text-right">
        <span>{fmt(diagram)}</span>
        <span className="text-mute"> = {fmt(P)} × {fmt(eta, 3)}</span>
        <span className={'ml-1 ' + (ok ? 'text-good' : 'text-bad')}>{ok ? '✓' : '≠'}</span>
        <span className="text-faint text-xs"> {unit}</span>
      </span>
    </div>
  )
}

// ---------------------------------------------------------------- 1-D plot aligned with the beam

interface PlotProps {
  title: ReactNode
  badge?: string
  pts: Pt[]
  L: number
  W: number
  color: string
  /** green / red fill by sign (ILDs) instead of a single colour */
  sign?: boolean
  /** plot positive values downward */
  flip?: boolean
  digits?: number
  labelXs?: number[]
  secX?: number
  loadX?: number
  /** ILD trace mode: only draw up to this x */
  clipTo?: number
  dot?: { x: number; y?: number; color: string }
  height?: number
}

function valueAt(pts: Pt[], x: number, side: -1 | 1 = 1) {
  if (!pts.length) return 0
  const ild: ILD = { pts, xmin: pts[0].x, xmax: pts[pts.length - 1].x }
  return ildAt(ild, x, side)
}

function Plot(p: PlotProps) {
  const cid = useId().replace(/:/g, '')
  const H = p.height ?? 150
  const top = 24
  const k = (p.W - 2 * PAD) / Math.max(p.L, 1e-6)
  const X = (x: number) => PAD + x * k
  const yMax = Math.max(1e-9, ...p.pts.map((q) => Math.abs(q.y)))
  const allZero = yMax < 1e-7
  const ky = ((H - top) / 2 - 18) / yMax
  const mid = top + (H - top) / 2
  const sgn = p.flip ? -1 : 1
  const Y = (v: number) => mid - sgn * v * ky
  const digits = p.digits ?? 2

  const fills = useMemo(() => {
    const pos: string[] = []
    const neg: string[] = []
    const pts = p.pts
    const seg = (u: Pt, v: Pt, arr: string[]) => arr.push(`M${X(u.x)},${Y(0)} L${X(u.x)},${Y(u.y)} L${X(v.x)},${Y(v.y)} L${X(v.x)},${Y(0)} Z`)
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      if (b.x - a.x < 1e-9) continue
      if (a.y >= 0 && b.y >= 0) seg(a, b, pos)
      else if (a.y <= 0 && b.y <= 0) seg(a, b, neg)
      else {
        const z = { x: a.x + (a.y / (a.y - b.y)) * (b.x - a.x), y: 0 }
        seg(a, z, a.y > 0 ? pos : neg)
        seg(z, b, a.y > 0 ? neg : pos)
      }
    }
    return { pos: pos.join(' '), neg: neg.join(' ') }
  }, [p.pts, p.W, p.L, p.flip])

  // value labels: requested stations (both sides of jumps) + interior extremes, thinned so they don't collide
  const labels = useMemo(() => {
    if (allZero) return []
    const cands: { x: number; v: number; dx: number }[] = []
    for (const x of p.labelXs ?? []) {
      const l = valueAt(p.pts, x, -1)
      const r = valueAt(p.pts, x, 1)
      if (Math.abs(l - r) > 1e-7 && x > 1e-9 && x < p.L - 1e-9) cands.push({ x, v: l, dx: -7 }, { x, v: r, dx: 7 })
      else cands.push({ x, v: x >= p.L - 1e-9 ? l : r, dx: 0 })
    }
    for (let i = 1; i < p.pts.length - 1; i++) {
      const a = p.pts[i - 1].y
      const b = p.pts[i].y
      const c = p.pts[i + 1].y
      if ((b > a && b > c) || (b < a && b < c)) cands.push({ x: p.pts[i].x, v: b, dx: 0 })
    }
    // one label per flat run (SFD steps): same value with nothing different in between
    const flat = (x1: number, x2: number, v: number) => {
      const lo = Math.min(x1, x2)
      const hi = Math.max(x1, x2)
      return p.pts.every((q) => q.x <= lo + 1e-9 || q.x >= hi - 1e-9 || Math.abs(q.y - v) < 1e-7)
    }
    const placed: { px: number; py: number }[] = []
    const out: { x: number; v: number; dx: number }[] = []
    for (const c of cands.sort((a, b) => Math.abs(b.v) - Math.abs(a.v))) {
      if (Math.abs(c.v) < 5e-4 * Math.max(1, yMax)) continue
      if (p.clipTo !== undefined && c.x > p.clipTo + 1e-9) continue
      const px = X(c.x) + c.dx
      const py = Y(c.v)
      if (placed.some((q) => Math.abs(q.px - px) < 34 && Math.abs(q.py - py) < 15)) continue
      if (out.some((q) => Math.abs(q.v - c.v) < 1e-7 && flat(q.x, c.x, c.v))) continue
      placed.push({ px, py })
      out.push(c)
    }
    return out
  }, [p.pts, p.labelXs, p.clipTo, p.W, p.L, p.flip])

  const line = p.pts.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)},${Y(q.y)}`).join(' ')
  const clip = p.clipTo !== undefined ? `url(#c${cid})` : undefined
  const dotV = p.dot ? (p.dot.y ?? valueAt(p.pts, p.dot.x, 1)) : 0
  const dotVisible = p.dot && (p.clipTo === undefined || p.dot.x <= p.clipTo + 1e-9)

  return (
    <svg viewBox={`0 0 ${p.W} ${H}`} className="w-full h-auto">
      {p.clipTo !== undefined && (
        <defs>
          <clipPath id={`c${cid}`}>
            <rect x={0} y={0} width={X(p.clipTo)} height={H} />
          </clipPath>
        </defs>
      )}
      <text x={8} y={16} fontSize={12.5} fontWeight={700} fill="var(--c-mute)">
        {p.title}
      </text>
      {p.badge && (
        <text x={p.W - 8} y={16} fontSize={12.5} fontWeight={700} textAnchor="end" fill="var(--c-ink)" className="num">
          {p.badge}
        </text>
      )}
      <line x1={X(0)} y1={Y(0)} x2={X(p.L)} y2={Y(0)} stroke="var(--c-faint)" strokeWidth={1.2} />
      {p.secX !== undefined && <line x1={X(p.secX)} x2={X(p.secX)} y1={top} y2={H - 4} stroke="var(--c-accent)" strokeWidth={1.2} strokeDasharray="5 3" opacity={0.8} />}
      {p.loadX !== undefined && <line x1={X(p.loadX)} x2={X(p.loadX)} y1={top} y2={H - 4} stroke="var(--c-load)" strokeWidth={1.2} strokeDasharray="2 3" opacity={0.9} />}
      <g clipPath={clip}>
        {p.sign ? (
          <>
            <path d={fills.pos} fill="var(--c-good)" fillOpacity={0.15} />
            <path d={fills.neg} fill="var(--c-bad)" fillOpacity={0.15} />
          </>
        ) : (
          <>
            <path d={fills.pos} fill={p.color} fillOpacity={0.16} />
            <path d={fills.neg} fill={p.color} fillOpacity={0.16} />
          </>
        )}
        <path d={line} fill="none" stroke={p.color} strokeWidth={2.2} strokeLinejoin="round" />
      </g>
      {allZero && (
        <text x={X(p.L / 2)} y={Y(0) - 8} textAnchor="middle" fontSize={12} fill="var(--c-mute)">
          zero everywhere
        </text>
      )}
      {labels.map((c, i) => (
        <text
          key={i}
          x={X(c.x) + c.dx}
          y={Y(c.v) + (sgn * c.v >= 0 ? -7 : 15)}
          fontSize={11}
          textAnchor={c.dx < 0 ? 'end' : c.dx > 0 ? 'start' : 'middle'}
          fill="var(--c-ink)"
          className="num"
          fontWeight={600}
          style={{ paintOrder: 'stroke', stroke: 'var(--c-panel)', strokeWidth: 3 }}
        >
          {fmt(c.v, digits)}
        </text>
      ))}
      {p.dot && dotVisible && (
        <g>
          <circle cx={X(p.dot.x)} cy={Y(dotV)} r={5.5} fill={p.dot.color} stroke="var(--c-panel)" strokeWidth={2} />
        </g>
      )}
    </svg>
  )
}
