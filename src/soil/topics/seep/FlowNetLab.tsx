// Flow-net simulator: sheet pile / dam (with or without cut-offs) / gravity wall on a permeable layer.
// Drag the pile tip, base, water levels and widths; the finite-difference Laplace solution redraws live
// (coarse grid while dragging, fine grid + extrapolation when you let go). Click anywhere for a piezometer.

import { useMark } from './useMark'
import { useEffect, useMemo, useRef, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider, useSeed } from '../../../labs/common'
import { Row, StatusBox, Tries } from '../../../labs/playground'
import { NumIn } from '../../../reference/common'
import { dam, exitGradient, netLines, pointInfo, sheetPile, sheetPileExact, solveNet, terzaghiHeave, uplift, type FlowGeom, type FlowSol } from '../../engine/flownet'
import { GW } from '../../engine/units'
import { openSmRef } from '../../reference/pane'
import { frameOf, MiniChart, NetView, type Frame, type Handle, type NetKind } from './NetView'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const sci = (v: number, d = 2) => (Number.isFinite(v) ? v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => ` × 10^${+e}`) : '—')
const sciTex = (v: number, d = 2) => (Number.isFinite(v) ? v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => `\\times 10^{${+e}}`) : '—')

export interface NetState {
  kind: NetKind
  /** layer thickness: below the D/S ground (pile), below the U/S ground (dam), below the front ground (wall) */
  T: number
  /** pile penetration below the D/S ground */
  s: number
  /** water heights above the U/S and D/S grounds */
  hU: number
  hD: number
  /** base width (dam / wall) */
  B: number
  /** dam: base below the U/S ground; wall: base below the front ground */
  embed: number
  /** dam: D/S bed above the base */
  embedD: number
  /** cut-off depths below the base (0 = none) */
  cutU: number
  cutD: number
  /** wall: retained ground above the front ground */
  R: number
  /** kx/kz */
  kr: number
  Nf: number
  gsat: number
  /** k in m/s */
  k: number
}

export const NET_DEFAULT: NetState = { kind: 'pile', T: 10, s: 5, hU: 5, hD: 1.5, B: 12, embed: 1, embedD: 1, cutU: 0, cutD: 0, R: 7, kr: 1, Nf: 4, gsat: 18, k: 5e-6 }

export const NET_PRESETS: { id: string; label: string; st: Partial<NetState> }[] = [
  { id: '2324', label: '2023-24 Q6(c) sheet pile', st: { kind: 'pile', T: 10, s: 5, hU: 5, hD: 1.5, gsat: 18, Nf: 4 } },
  { id: '2021', label: '2020-21 Q1(c) sheet pile', st: { kind: 'pile', T: 8, s: 4, hU: 6, hD: 1, gsat: 19.8, k: 5e-6, Nf: 4 } },
  { id: '1617', label: '2016-17 Q3(b) sheet pile', st: { kind: 'pile', T: 18, s: 8, hU: 9, hD: 1.5, gsat: 20.4, k: 5e-9, Nf: 4 } },
  { id: '1011', label: '2010-11 Q7(d) sheet pile', st: { kind: 'pile', T: 8.6, s: 5, hU: 4.5, hD: 0.5, gsat: 21.5, k: 2.5e-5, Nf: 4 } },
  { id: 'j21', label: 'Jan 2021 Q1(b) sheet pile', st: { kind: 'pile', T: 6, s: 1.5, hU: 3, hD: 0.5, gsat: 19.8, k: 4e-5, Nf: 4 } },
  { id: '2122', label: '2021-22 Q4(c) dam', st: { kind: 'dam', T: 12, B: 20, hU: 5, hD: 0, embed: 0, embedD: 0, cutU: 0, cutD: 0, k: 5e-8, Nf: 4 } },
  { id: '1112', label: '2011-12 Q8(e) dam + cut-off', st: { kind: 'dam', T: 15, B: 27, hU: 10.5, hD: 0, embed: 0, embedD: 0, cutU: 9, cutD: 0, k: 2.5e-4, Nf: 4 } },
  { id: '1718', label: '2017-18 Q7(a) dam + cut-off', st: { kind: 'dam', T: 6, B: 8.5, hU: 4.5, hD: 0.5, embed: 1, embedD: 2, cutU: 2, cutD: 0, k: 3.6e-6, gsat: 19.0, Nf: 3 } },
  { id: '0708', label: '2007-08 Q8(c) dam + sheet pile', st: { kind: 'dam', T: 12, B: 20, hU: 10, hD: 0, embed: 2, embedD: 2, cutU: 5, cutD: 0, k: 1e-6, gsat: 21, Nf: 3 } },
  { id: '2324w', label: '2023-24 Q8(a) gravity wall', st: { kind: 'wall', T: 10, B: 6, embed: 3, R: 7, hD: 0, gsat: 20, Nf: 4 } },
]

export function geomOf(st: NetState): FlowGeom {
  const kx = st.kr
  if (st.kind === 'pile') return { ...sheetPile({ T: st.T, s: Math.min(st.s, st.T - 0.2), hU: st.hU, hD: Math.min(st.hD, st.hU - 0.05) }), kx, kz: 1 }
  if (st.kind === 'dam') {
    const g = dam({ T: st.T, B: st.B, hU: st.hU, hD: st.hD, embedU: st.embed, embedD: st.embedD, cutU: st.cutU || undefined, cutD: st.cutD || undefined })
    // tail water must stay below head water
    const hD = Math.min(g.hD, g.hU - 0.05)
    return { ...g, hD, tipU: g.tipU !== undefined ? Math.max(0.3, g.tipU) : undefined, tipD: g.tipD !== undefined ? Math.max(0.3, g.tipD) : undefined, kx, kz: 1 }
  }
  // gravity wall: retained side drawn upstream (left), water table at its surface; front water hD above the front ground
  const zD = st.T
  const zU = st.T + st.R
  return { zU, zD, hU: zU, hD: zD + Math.min(st.hD, st.R - 0.05), B: st.B, zB: Math.max(0.5, st.T - st.embed), kx, kz: 1 }
}

/** live solve while dragging, fine solve (with extrapolation) shortly after the last change */
export function useNetSolve(geom: FlowGeom, dragging: boolean) {
  const key = JSON.stringify(geom)
  const [fin, setFin] = useState<{ key: string; sol: FlowSol } | null>(null)
  const ready = fin?.key === key
  const live = useMemo(() => (ready ? null : solveNet(geom, 'live')), [key, ready]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (dragging || ready) return
    const t = setTimeout(() => setFin({ key, sol: solveNet(geom, 'final') }), 80)
    return () => clearTimeout(t)
  }, [key, dragging, ready]) // eslint-disable-line react-hooks/exhaustive-deps
  return { sol: ready ? fin!.sol : live!, final: ready }
}

export interface NetResults {
  sol: FlowSol
  H: number
  Nd: number
  dh: number
  q: number
  icr: number
  gsub: number
  ie: number
  exitL: number
  exitAlong: 'pile' | 'base'
  heave: ReturnType<typeof terzaghiHeave>
  up: ReturnType<typeof uplift>
  exact: number | null
}

export function netResults(sol: FlowSol, st: NetState): NetResults {
  const Nd = st.Nf / sol.shape
  const gsub = st.gsat - GW
  const ex = exitGradient(sol, Nd)
  const exact = st.kind === 'pile' && st.kr === 1 ? sheetPileExact(Math.min(st.s, st.T - 0.2), st.T) : null
  return {
    sol,
    H: sol.H,
    Nd,
    dh: sol.H / Nd,
    q: st.k * Math.sqrt(st.kr) * sol.H * sol.shape,
    icr: gsub / GW,
    gsub,
    ie: ex.ie,
    exitL: ex.l,
    exitAlong: ex.along,
    heave: terzaghiHeave(sol, gsub),
    up: uplift(sol),
    exact,
  }
}

/** ground level and depth of a point below it */
export function depthBelowGround(g: FlowGeom, x: number, z: number) {
  const gl = x < 0 ? g.zU : x > Math.max(0, g.B) ? g.zD : NaN
  return { gl, depth: gl - z }
}

function randomState(seed: number): { st: NetState; probe: { x: number; z: number } } {
  const r = rng(seed * 9301 + 49297)
  const kind = pick(r, ['pile', 'pile', 'dam', 'dam', 'wall'] as NetKind[])
  const st: NetState = { ...NET_DEFAULT, kind, Nf: pick(r, [3, 4, 4, 5]), gsat: randInt(r, 180, 210) / 10, k: pick(r, [2e-6, 5e-6, 1e-5, 4e-5, 2.5e-5, 3.6e-6]) }
  if (kind === 'pile') {
    st.T = randInt(r, 12, 36) / 2
    st.s = Math.round((st.T * (0.25 + 0.5 * r())) * 2) / 2
    st.hU = randInt(r, 6, 20) / 2
    st.hD = randInt(r, 0, Math.min(6, st.hU * 2 - 4)) / 2
  } else if (kind === 'dam') {
    st.T = randInt(r, 12, 30) / 2
    st.B = randInt(r, 8, 30)
    st.hU = randInt(r, 6, 22) / 2
    st.hD = randInt(r, 0, 2) / 2
    st.embed = pick(r, [0, 0, 1, 1.5, 2])
    st.embedD = st.embed
    const c = pick(r, ['none', 'heel', 'heel', 'toe', 'both'])
    st.cutU = c === 'heel' || c === 'both' ? Math.round(st.T * (0.3 + 0.3 * r()) * 2) / 2 : 0
    st.cutD = c === 'toe' || c === 'both' ? Math.round(st.T * (0.2 + 0.3 * r()) * 2) / 2 : 0
  } else {
    st.T = randInt(r, 16, 24) / 2
    st.B = randInt(r, 4, 8)
    st.embed = randInt(r, 2, 8) / 2
    st.R = randInt(r, 8, 16) / 2
    st.hD = 0
  }
  const g = geomOf(st)
  const zD = g.zD
  const B = Math.max(0, g.B)
  const side = r() < 0.5 ? -1 : 1
  const x = side < 0 ? -randInt(r, 2, 8) / 2 : B + randInt(r, 2, 8) / 2
  const zl = side < 0 ? g.zU : zD
  const z = Math.max(0.5, zl - randInt(r, 2, Math.max(3, Math.floor(zl * 1.6))) / 2)
  return { st, probe: { x, z } }
}

export function FlowNetLab() {
  const [st, setSt] = useState<NetState>(NET_DEFAULT)
  const [probe, setProbe] = useState<{ x: number; z: number } | null>({ x: 2, z: 5 })
  const [dragging, setDragging] = useState(false)
  const [view, setView] = useState<'true' | 'tr'>('true')
  const [kUnit, setKUnit] = useState<'m/s' | 'cm/s' | 'mm/s'>('m/s')
  const [show, setShow] = useState({ net: true, prism: true, exit: true })
  const { seed, next } = useSeed(3)
  const geom = useMemo(() => geomOf(st), [st])
  const { sol, final } = useNetSolve(geom, dragging)
  const R = useMemo(() => netResults(sol, st), [sol, st])
  const net = useMemo(() => (show.net ? netLines(sol, st.Nf) : null), [sol, st.Nf, show.net])
  const frozen = useRef<{ x0: number; x1: number; d0: number; d1: number } | null>(null)
  const base = frameOf(sol)
  let frame: Frame = base
  if (dragging && frozen.current) {
    const fz = frozen.current
    frame = { x0: fz.x0, x1: fz.x1, z0: geom.zD - fz.d0, z1: geom.zD - fz.d1 }
  }
  const setDrag = (d: boolean) => {
    if (d) frozen.current = { x0: base.x0, x1: base.x1, d0: geom.zD - base.z0, d1: geom.zD - base.z1 }
    setDragging(d)
  }
  const up = (p: Partial<NetState>) => setSt((s) => ({ ...s, ...p }))
  const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)) * 10) / 10
  const g = sol.g
  const B = Math.max(0, g.B)
  const zB = g.B > 0 ? sol.iz.zB * sol.dz : 0

  // handles
  const handles: Handle[] = []
  const depthLimit = frozen.current && dragging ? frozen.current.d0 - 0.3 : 40
  handles.push({ id: 'T', x: frame.x1 - 2.5, z: 0, dir: 'z', label: 'layer', onDrag: (_x, z) => up({ T: clamp((st.kind === 'dam' ? g.zU : g.zD) - z, Math.max(3, st.kind === 'pile' ? st.s + 0.5 : st.embed + 1.5 + Math.max(st.cutU, st.cutD)), Math.min(depthLimit, 30)) }) })
  if (st.kind !== 'wall') handles.push({ id: 'hU', x: frame.x0 + 2.5, z: g.hU, dir: 'z', label: 'U/S water', onDrag: (_x, z) => up({ hU: clamp(z - g.zU, Math.max(0.3, st.hD + 0.2), 20) }) })
  if (st.kind !== 'wall' || st.hD > 0) handles.push({ id: 'hD', x: frame.x1 - 2.5, z: g.hD, dir: 'z', label: 'D/S water', onDrag: (_x, z) => up({ hD: clamp(z - g.zD, 0, Math.max(0, st.kind === 'wall' ? st.R - 0.5 : st.hU - 0.2)) }) })
  if (st.kind === 'pile') handles.push({ id: 's', x: 0, z: g.tipU ?? 0, dir: 'z', label: 'pile tip', onDrag: (_x, z) => up({ s: clamp(g.zD - z, 0.3, st.T - 0.3) }) })
  if (st.kind !== 'pile') handles.push({ id: 'B', x: B, z: zB, dir: 'x', label: 'B', onDrag: (x) => up({ B: clamp(x, 2, 40) }) })
  if (st.kind === 'dam') {
    handles.push({ id: 'cU', x: 0, z: zB - st.cutU, dir: 'z', label: st.cutU ? 'cut-off' : '+ cut-off', onDrag: (_x, z) => up({ cutU: clamp(zB - z, 0, zB - 0.5) }) })
    handles.push({ id: 'cD', x: B, z: zB - st.cutD - (st.cutD ? 0 : 0.6), dir: 'z', label: st.cutD ? 'toe cut-off' : '+ toe', onDrag: (_x, z) => up({ cutD: clamp(zB - z, 0, zB - 0.5) }) })
  }
  if (st.kind === 'wall') {
    handles.push({ id: 'emb', x: B / 2, z: zB, dir: 'z', label: 'base', onDrag: (_x, z) => up({ embed: clamp(g.zD - z, 0, st.T - 1.5) }) })
    handles.push({ id: 'R', x: -2, z: g.zU, dir: 'z', label: 'retained', onDrag: (_x, z) => up({ R: clamp(z - g.zD, 1, 14) }) })
  }

  const pinfo = probe ? pointInfo(sol, probe.x, probe.z, st.gsat, R.Nd) : null
  const pOk = !!pinfo && Number.isFinite(pinfo.h) && probe!.z > 0
  const pd = probe ? depthBelowGround(g, probe.x, probe.z) : null
  const kEff = st.k * Math.sqrt(st.kr)
  const kShow = st.k * (kUnit === 'cm/s' ? 100 : kUnit === 'mm/s' ? 1000 : 1)
  const shapeStr = f3(sol.shape)
  useMark('w-flownet', { shape: shapeStr })
  const id = (k: string) => `sm-seep:lab:net:${hashKey(JSON.stringify([st, probe && [Math.round(probe.x * 10), Math.round(probe.z * 10)]]))}:${k}`
  const xScale = view === 'tr' && st.kr !== 1 ? Math.sqrt(1 / st.kr) : 1
  const fsH = R.heave?.FS
  const fsP = R.icr / R.ie
  const verdict = (fs: number | undefined, need: number) => (fs === undefined || !Number.isFinite(fs) ? 'var(--c-mute)' : fs >= need ? 'var(--c-good)' : fs >= 1 ? 'var(--c-load)' : 'var(--c-bad)')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Seg
          value={st.kind}
          onChange={(kind) => {
            up({ ...NET_DEFAULT, ...(kind === 'dam' ? { T: 12, B: 20, hU: 5, hD: 0, embed: 0, embedD: 0, cutU: 4 } : kind === 'wall' ? { T: 10, B: 6, embed: 3, R: 7, hD: 0, gsat: 20 } : {}), kind, k: st.k, Nf: st.Nf })
            setProbe(kind === 'pile' ? { x: 2, z: 5 } : kind === 'dam' ? { x: 6, z: 11 } : { x: 6, z: 4 })
          }}
          items={[
            { v: 'pile', label: 'Sheet pile' },
            { v: 'dam', label: 'Dam / weir' },
            { v: 'wall', label: 'Gravity wall' },
          ]}
        />
        <select
          className="field !py-1 !text-sm"
          value=""
          onChange={(e) => {
            const p = NET_PRESETS.find((x) => x.id === e.target.value)
            if (!p) return
            const s2 = { ...NET_DEFAULT, ...p.st } as NetState
            setSt(s2)
            const gg = geomOf(s2)
            setProbe(p.id === '1617' ? { x: -4, z: gg.zD - 8 } : p.id === '0708' ? { x: 24.5, z: gg.zD - 5 } : p.id === '2324w' ? { x: 6, z: 4 } : p.id === 'j21' ? { x: 0.35, z: gg.zD - 3.3 } : { x: Math.max(0, gg.B) + 2, z: gg.zD / 2 })
          }}
        >
          <option value="">Load a past paper…</option>
          {NET_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          className="btn !py-1 !px-3"
          onClick={() => {
            next()
            const r = randomState(seed + 1)
            setSt(r.st)
            setProbe(r.probe)
          }}
        >
          🎲 Exam-style setup
        </button>
        <span className="text-xs text-faint ml-auto">
          {final ? `fine grid ${sol.nx}×${sol.nz} + extrapolation` : 'coarse grid (dragging)'} · {f2(sol.ms)} ms
        </span>
      </div>

      <div className="grid cq-lg:grid-cols-[minmax(0,1fr)_17rem] gap-4">
        <div className="space-y-2">
          <div className="rounded-xl border border-line bg-bg/60 p-1">
            <NetView sol={sol} net={net} kind={st.kind} frame={frame} xScale={xScale} probe={pOk ? { ...probe!, h: pinfo!.h } : null} prism={show.prism ? R.heave : null} exit={show.exit ? { profile: [], ie: R.ie, l: R.exitL, along: R.exitAlong } : null} handles={handles} onProbe={(x, z) => setProbe({ x, z })} onDragState={setDrag} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-mute">
            <span>
              <span style={{ color: 'var(--c-water)' }}>━</span> flow lines (Nf = {st.Nf}) · <span style={{ color: 'var(--c-accent)' }}>╍</span> equipotentials every Δh · <span style={{ color: 'var(--c-load)' }}>━</span> last field
            </span>
            {(['net', 'prism', 'exit'] as const).map((k) => (
              <label key={k} className="inline-flex items-center gap-1">
                <input type="checkbox" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} /> {k === 'net' ? 'net' : k === 'prism' ? 'heave prism' : 'last field'}
              </label>
            ))}
            {st.kr !== 1 && <Seg size="xs" value={view} onChange={setView} items={[{ v: 'true', label: 'true section' }, { v: 'tr', label: 'transformed' }]} />}
          </div>
          <p className="text-xs text-faint">Drag the blue handles. Click in the soil to put a piezometer there. {st.kind === 'wall' ? 'The retained side is drawn on the left (water flows left to right), water table at its surface as in 2023-24 Q8(a).' : ''}</p>
        </div>
        <div className="space-y-2">
          <div className="card p-3 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Geometry</div>
            {st.kind === 'pile' && <Slider label="penetration s" value={st.s} min={0.5} max={st.T - 0.5} step={0.1} unit=" m" onChange={(s) => up({ s })} />}
            <Slider label={st.kind === 'dam' ? 'layer below U/S bed' : st.kind === 'wall' ? 'layer below front GL' : 'layer below GL'} value={st.T} min={3} max={30} step={0.1} unit=" m" onChange={(T) => up({ T })} />
            {st.kind !== 'pile' && <Slider label={st.kind === 'wall' ? 'wall width B' : 'base width B'} value={st.B} min={2} max={40} step={0.5} unit=" m" onChange={(B) => up({ B })} />}
            {st.kind === 'dam' && (
              <>
                <Slider label="base below U/S bed" value={st.embed} min={0} max={Math.min(4, st.T - 1)} step={0.1} unit=" m" onChange={(embed) => up({ embed, embedD: Math.max(st.embedD, 0) })} />
                <Slider label="D/S bed above base" value={st.embedD} min={0} max={Math.min(4, st.T - 1)} step={0.1} unit=" m" onChange={(embedD) => up({ embedD })} />
                <Slider label="heel cut-off" value={st.cutU} min={0} max={Math.max(0, st.T - st.embed - 0.5)} step={0.1} unit=" m" onChange={(cutU) => up({ cutU })} />
                <Slider label="toe cut-off" value={st.cutD} min={0} max={Math.max(0, st.T - st.embed - 0.5)} step={0.1} unit=" m" onChange={(cutD) => up({ cutD })} />
              </>
            )}
            {st.kind === 'wall' && (
              <>
                <Slider label="retained height" value={st.R} min={1} max={14} step={0.1} unit=" m" onChange={(R) => up({ R })} />
                <Slider label="base below front GL" value={st.embed} min={0} max={st.T - 1.5} step={0.1} unit=" m" onChange={(embed) => up({ embed })} />
              </>
            )}
            {st.kind !== 'wall' && <Slider label="U/S water above bed" value={st.hU} min={0.5} max={20} step={0.1} unit=" m" onChange={(hU) => up({ hU, hD: Math.min(st.hD, hU - 0.2) })} />}
            <Slider label={st.kind === 'wall' ? 'front water above GL' : 'D/S water above bed'} value={st.hD} min={0} max={st.kind === 'wall' ? st.R - 0.5 : Math.max(0, st.hU - 0.2)} step={0.1} unit=" m" onChange={(hD) => up({ hD })} />
          </div>
          <div className="card p-3 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Soil and net</div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">Nf</span>
              <Seg size="xs" value={String(st.Nf)} onChange={(v) => up({ Nf: +v })} items={[3, 4, 5, 6].map((n) => ({ v: String(n), label: String(n) }))} />
              <span className="text-mute ml-2">kx/kz</span>
              <Seg size="xs" value={String(st.kr)} onChange={(v) => up({ kr: +v })} items={[1, 2, 4, 9].map((n) => ({ v: String(n), label: String(n) }))} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NumIn label={st.kr === 1 ? 'k' : 'kz'} value={+kShow.toPrecision(3)} onChange={(v) => Number.isFinite(v) && v > 0 && up({ k: v / (kUnit === 'cm/s' ? 100 : kUnit === 'mm/s' ? 1000 : 1) })} step={0.000001} w="w-24" />
              <Seg size="xs" value={kUnit} onChange={setKUnit} items={[{ v: 'm/s', label: 'm/s' }, { v: 'cm/s', label: 'cm/s' }, { v: 'mm/s', label: 'mm/s' }]} />
            </div>
            <NumIn label="γsat" value={st.gsat} onChange={(v) => Number.isFinite(v) && v > GW && up({ gsat: v })} step={0.1} unit="kN/m³" w="w-16" />
          </div>
        </div>
      </div>

      <div className="grid cq-md:grid-cols-3 gap-3">
        <div className="card p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Flow</div>
          <Row k="H (head lost)" v={`${f2(R.H)} m`} />
          <Row k="Nf/Nd (solver)" v={shapeStr} strong />
          {R.exact !== null && <Row k="exact (one pile)" v={f3(R.exact)} />}
          <Row k={`Nd for Nf = ${st.Nf}`} v={f2(R.Nd)} />
          <Row k="Δh = H/Nd" v={`${f3(R.dh)} m`} />
          <Row k={st.kr === 1 ? 'q = kH·Nf/Nd' : 'q = √(kxkz)H·Nf/Nd'} v={`${sci(R.q)} m³/s/m`} />
          <Row k="" v={`${f3(R.q * 86400)} m³/day per m`} />
        </div>
        <div className="card p-3 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Safety</div>
          <Row k="icr = γ′/γw" v={f3(R.icr)} />
          <Row k={`ie (last field, l = ${f2(R.exitL)} m ${R.exitAlong === 'pile' ? 'down the pile' : 'along the base'})`} v={f3(R.ie)} />
          <StatusBox c={verdict(fsP, 3)} t={`Piping (Harza) FS = ${f2(fsP)}`} d={fsP >= 3 ? 'adequate (≥ 3–4)' : fsP >= 1 ? 'no boiling, but too little margin' : 'boils: ie > icr'} />
          {R.heave ? <StatusBox c={verdict(fsH, 4)} t={`Heave (Terzaghi) FS = ${f2(fsH!)}`} d={`D = ${f2(R.heave.D)} m, ha = ${f3(R.heave.ha)} m, iav = ${f3(R.heave.iav)}`} /> : <div className="text-xs text-faint">Terzaghi heave needs a downstream pile or toe cut-off.</div>}
        </div>
        <div className="card p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Piezometer at P</div>
          {pOk && pinfo && pd ? (
            <>
              <Row k="depth below its ground" v={Number.isFinite(pd.depth) ? `${f2(pd.depth)} m` : 'under the base'} />
              <Row k="drops used n" v={f2(pinfo.drops)} />
              <Row k="head above tail water hP" v={`${f3(pinfo.excess)} m`} strong />
              <Row k="seepage pressure hPγw" v={`${f2(pinfo.excess * GW)} kPa`} />
              <Row k="pore pressure u" v={`${f2(pinfo.u)} kPa`} strong />
              {Number.isFinite(pinfo.sigma) && <Row k="σ, σ′" v={`${f2(pinfo.sigma)}, ${f2(pinfo.sigmaEff)} kPa`} />}
              <Row k="gradient i, seepage force iγw" v={`${f3(pinfo.i)}, ${f2(pinfo.i * GW)} kN/m³`} />
            </>
          ) : (
            <div className="text-sm text-mute">Click in the soil to place P.</div>
          )}
        </div>
      </div>

      {(R.up || R.ie) && (
        <div className="grid cq-md:grid-cols-2 gap-3">
          {R.up && (
            <div className="card p-3">
              <div className="text-sm font-semibold">Uplift under the base: heel {f2(R.up.heel)} → toe {f2(R.up.toe)} kPa, U = {f2(R.up.U)} kN/m at {f2(R.up.xbar)} m from the heel</div>
              <MiniChart pts={R.up.pts.map((p) => ({ x: p.x, y: p.u }))} xLabel="distance from heel (m)" yLabel="u (kPa)" invert />
            </div>
          )}
          <div className="card p-3">
            <div className="text-sm font-semibold">Exit gradient along the downstream surface (point values)</div>
            <MiniChart pts={exitGradient(sol, R.Nd).profile.map((p) => ({ x: p.x, y: p.i }))} xLabel="distance from the toe / pile (m)" yLabel="i" fill="var(--c-load)" hLine={R.icr} hLabel={`icr = ${f2(R.icr)}`} />
            <p className="text-xs text-faint">At a dam toe the point value is singular (it grows as the grid gets finer); the exam uses Δh over the last field instead.</p>
          </div>
        </div>
      )}

      <div className="card p-3 space-y-1">
        <div className="font-semibold text-sm">Your turn (draw the net on paper first; ±10 % is a good hand-drawn net)</div>
        <Answer id={id('nd')} label={`Nd for Nf = ${st.Nf}`} value={R.Nd} tol={0.1} digits={1} />
        <Answer id={id('q')} label="q (m³/day per m)" value={R.q * 86400} tol={0.1} digits={4} />
        {pOk && pinfo && <Answer id={id('u')} label="pore pressure at P (kPa)" value={pinfo.u} tol={0.05} digits={1} />}
        <Answer id={id('ie')} label="exit gradient (last field)" value={R.ie} tol={0.15} digits={3} />
        {R.heave && <Answer id={id('fs')} label="FS heave (Terzaghi)" value={R.heave.FS} tol={0.1} digits={2} />}
      </div>

      <Reveal id={id('sol')} title="Full solution for this setup">
        <NetSolution st={st} R={R} probe={pOk && pinfo && pd ? { info: pinfo, depth: pd.depth } : null} />
      </Reveal>

      <Tries>
        <li>Load 2023-24 Q6(c), then drag the pile tip up and down: at s/T = 0.5 the net is symmetric and Nf/Nd = 0.5 exactly; the exit gradient falls fast as s grows.</li>
        <li>Deepen the layer with the pile fixed: q rises but levels off; past T ≈ 3s the bottom hardly matters.</li>
        <li>Dam: move the cut-off from the heel to the toe. The heel cut-off cuts uplift; the toe cut-off is what cuts the exit gradient.</li>
        <li>Set kx/kz = 4 and switch to the transformed section: squares again, and q uses √(kxkz).</li>
        <li>Put P on one equipotential, then slide it along: the piezometer level stays put.</li>
      </Tries>
      <button className="chip hover:!border-load" onClick={() => openSmRef('w-flownet')}>
        Chart pane: flow-net rules ↗
      </button>
    </div>
  )
}

export function NetSolution({ st, R, probe }: { st: NetState; R: NetResults; probe: { info: ReturnType<typeof pointInfo>; depth: number } | null }) {
  const sol = R.sol
  const g = sol.g
  const kTxt = st.kr === 1 ? `k = ${sciTex(st.k)}\\ \\text{m/s}` : `k' = \\sqrt{k_xk_z} = ${sciTex(st.k * Math.sqrt(st.kr))}\\ \\text{m/s}`
  return (
    <div className="space-y-2 text-sm">
      <Md>{`**1. Head lost.** $H = ${f2(g.hU)} - ${f2(g.hD)} = ${f2(R.H)}$ m (both levels measured from the impermeable base; only the difference matters).`}</Md>
      <Md>{`**2. Flow net.** ${st.kind === 'pile' ? 'The pile and the impermeable base are the first and last flow lines; the two submerged ground surfaces are equipotentials.' : st.kind === 'dam' ? 'The base (and cut-off) contour and the impermeable stratum are flow lines; the upstream and downstream beds are equipotentials.' : 'The wall faces, its base and the impermeable stratum are flow lines; the retained water table and the front ground are equipotentials.'} With $N_f = ${st.Nf}$ the squares give $N_d = ${f2(R.Nd)}$ (solver: $N_f/N_d = ${f3(sol.shape)}$${R.exact !== null ? `, exact ${f3(R.exact)}` : ''}). Round to a count you can draw, e.g. ${st.Nf}/${Math.round(R.Nd)}.`}</Md>
      <Md>{`**3. Seepage.** $$q = kH\\frac{N_f}{N_d} = ${kTxt} \\times ${f2(R.H)} \\times ${f3(sol.shape)} = ${sciTex(R.q, 3)}\\ \\text{m}^3\\text{/s per m} = ${f3(R.q * 86400)}\\ \\text{m}^3\\text{/day per m}$$`}</Md>
      {probe && (
        <Md>{`**4. Point P.** $\\Delta h = H/N_d = ${f3(R.dh)}$ m; P sits after $n = ${f2(probe.info.drops)}$ drops, so the head left above tail water is $h_P = H - n\\Delta h = ${f3(probe.info.excess)}$ m. Seepage pressure $= h_P\\gamma_w = ${f2(probe.info.excess * GW)}$ kPa. Pore pressure $u = (\\text{depth below the D/S water level} + h_P)\\gamma_w = (${f2(g.hD - probe.info.z)} + ${f3(probe.info.excess)}) \\times 9.81 = ${f2(probe.info.u)}$ kPa.${Number.isFinite(probe.info.sigma) ? ` Total stress there ${f2(probe.info.sigma)} kPa, so $\\sigma' = ${f2(probe.info.sigmaEff)}$ kPa.` : ''}`}</Md>
      )}
      <Md>{`**5. Piping (Harza).** $i_{cr} = \\gamma'/\\gamma_w = (${f2(st.gsat)} - 9.81)/9.81 = ${f3(R.icr)}$. Last field ${R.exitAlong === 'pile' ? 'down the downstream face of the pile' : 'along the base back from the toe'}: $l = ${f2(R.exitL)}$ m, $i_e = \\Delta h/l = ${f3(R.ie)}$, $FS = i_{cr}/i_e = ${f2(R.icr / R.ie)}$.`}</Md>
      {R.heave && (
        <Md>{`**6. Heave (Terzaghi).** Prism $D \\times D/2 = ${f2(R.heave.D)} \\times ${f2(R.heave.D / 2)}$ m beside the pile. Average head above tail water along its base (tip level) $h_a = ${f3(R.heave.ha)}$ m. $$FS = \\frac{D\\gamma'}{h_a\\gamma_w} = \\frac{${f2(R.heave.D)} \\times ${f2(R.gsub)}}{${f3(R.heave.ha)} \\times 9.81} = ${f2(R.heave.FS)}$$`}</Md>
      )}
      {R.up && (
        <>
          <Md>{`**${R.heave ? 7 : 6}. Uplift.** Pressure head at the base = total head − base elevation; $u = (\\text{pressure head})\\gamma_w$:`}</Md>
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>x from heel (m)</th>
                <th>pressure head (m)</th>
                <th>u (kPa)</th>
              </tr>
            </thead>
            <tbody>
              {R.up.pts
                .filter((_, i, a) => i === 0 || i === a.length - 1 || i % Math.max(1, Math.round(a.length / 6)) === 0)
                .map((p) => (
                  <tr key={p.x}>
                    <td>{f2(p.x)}</td>
                    <td>{f2(p.p)}</td>
                    <td>{f2(p.u)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p>
            Total uplift <Tex>{`U = ${f2(R.up.U)}`}</Tex> kN per m run, acting {f2(R.up.xbar)} m from the heel.
          </p>
        </>
      )}
      <Md>{`**Comment.** ${R.icr / R.ie >= 3 && (!R.heave || R.heave.FS >= 3) ? 'Factors of safety are above 3, so the structure is safe against piping and heave (flow nets are approximate, so 3–5 is the usual target).' : 'The margin is too small (want FS ≥ 3–4 for piping, 4–5 for heave): drive the pile / cut-off deeper, lengthen the floor or add an upstream apron, and place an inverted filter or weighting blanket downstream.'}`}</Md>
    </div>
  )
}
