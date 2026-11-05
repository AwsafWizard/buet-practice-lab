// Earth-pressure labs: the wall builder (layers, WT, q, c′ / cu, passive in front, K0 / active / passive) with
// pressure diagrams to scale and the pieces table; a Mohr view of one element; pressure against wall tilt.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Reveal, Section, Seg } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { Slider } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { crackForces, criticalHeight, K0_LABEL, Ka, kVsTilt, MOVE_TABLE, Kp, solveWall, stateCircles, type K0Formula, type Ordinate, type Piece, type WallState } from '../../engine/earth'
import { markUsed, openSmRef } from '../../reference/pane'
import { ElementFig, StateMohrFig, TiltFig, WallFig } from './figs'
import { layer, PRESETS, randomWall, toWall, type LabLayer, type LabWall } from './gen'
import { WallSolution } from './Solution'

const f2 = (v: number) => fmt(v, 2)
const F0: K0Formula[] = ['jaky', 'sherif', 'mayne', 'massarsch', 'massarschOC']

function LayerRow({ l, i, state, set, remove }: { l: LabLayer; i: number; state: WallState; set: (o: Partial<LabLayer>) => void; remove?: () => void }) {
  return (
    <div className="rounded-lg border border-line p-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <b className="text-xs">Layer {i + 1}</b>
        <NumIn label="h" value={l.h} onChange={(v) => set({ h: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="γ" value={l.gamma} onChange={(v) => set({ gamma: v })} step={0.5} unit="kN/m³" w="w-14" />
        <NumIn label="γsat" value={l.gammaSat} onChange={(v) => set({ gammaSat: v })} step={0.5} w="w-14" />
        <NumIn label="φ′" value={l.phi} onChange={(v) => set({ phi: v })} step={1} unit="°" w="w-12" />
        <NumIn label={l.phi === 0 ? 'cu' : 'c′'} value={l.c} onChange={(v) => set({ c: v })} step={1} unit="kPa" w="w-12" />
        {l.phi === 0 && l.c > 0 && (
          <label className="inline-flex items-center gap-1 text-xs" title="2021-22 Q8(c): σa = q + γsat z − 2cu, no separate water">
            <input type="checkbox" checked={l.total} onChange={(e) => set({ total: e.target.checked })} /> total stress (γsat, no separate water)
          </label>
        )}
        {remove && (
          <button className="text-xs text-bad underline ml-auto" onClick={remove}>
            remove
          </button>
        )}
      </div>
      {state === 'rest' && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <select className="field !py-0.5 !text-xs" value={l.k0f} onChange={(e) => set({ k0f: e.target.value as K0Formula })}>
            {F0.map((f) => (
              <option key={f} value={f}>
                {K0_LABEL[f]}
              </option>
            ))}
          </select>
          {(l.k0f === 'mayne' || l.k0f === 'massarschOC') && <NumIn label="OCR" value={l.OCR} onChange={(v) => set({ OCR: v })} step={0.5} w="w-12" />}
          {(l.k0f === 'massarsch' || l.k0f === 'massarschOC') && <NumIn label="PI" value={l.PI} onChange={(v) => set({ PI: v })} step={1} w="w-12" />}
          {l.k0f === 'sherif' && (
            <>
              <NumIn label="γd" value={l.gd} onChange={(v) => set({ gd: v })} step={0.1} w="w-14" />
              <NumIn label="γd(min)" value={l.gdMin} onChange={(v) => set({ gdMin: v })} step={0.1} w="w-14" />
            </>
          )}
        </div>
      )}
    </div>
  )
}

type OrdRow = Ordinate & { k: string }
const ORD_COLS: CheckCol<OrdRow>[] = [
  { key: 'e', label: "σ′h (kPa)", get: (r) => r.earth, abs: 0.06 },
  { key: 'u', label: 'u (kPa)', get: (r) => r.water, abs: 0.06 },
]
type PcRow = Piece & { k: string }
const PC_COLS: CheckCol<PcRow>[] = [
  { key: 'F', label: 'F (kN/m)', get: (r) => r.F, abs: 0.06 },
  { key: 'arm', label: 'arm above base (m)', get: (r) => r.arm, abs: 0.012 },
]

// ---------------------------------------------------------------- the wall builder
export function WallLab() {
  const [p, setP] = useState<LabWall>(PRESETS[2].w)
  const [story, setStory] = useState<string | null>(null)
  const set = (o: Partial<LabWall>) => {
    setP({ ...p, ...o })
    setStory(null)
  }
  const setL = (i: number, o: Partial<LabLayer>) => set({ layers: p.layers.map((l, j) => (j === i ? { ...l, ...o } : l)) })
  const w = useMemo(() => toWall(p), [p])
  const valid = p.layers.length > 0 && p.layers.every((l) => l.h > 0 && l.gamma > 0 && l.gammaSat > 0 && l.phi >= 0 && l.phi < 60 && l.c >= 0 && [l.OCR, l.PI, l.gd, l.gdMin].every(Number.isFinite)) && Number.isFinite(p.q) && p.q >= 0 && (!p.wt || p.zw >= 0) && (!p.front || (p.D > 0 && p.fGamma > 0))
  const r = useMemo(() => (valid ? solveWall(w) : null), [w, valid])
  useEffect(() => {
    if (!r) return
    markUsed('e-ka', { phis: [...new Set(p.layers.map((l) => l.phi))].join(',') })
    if (p.state === 'rest') markUsed('e-k0', { f: p.layers[0].k0f })
  })
  const key = hashKey(JSON.stringify(w))
  const id = (k: string) => `sm-lep:lab:${key}:${k}`
  const H = p.layers.reduce((s, l) => s + l.h, 0)
  const single = p.layers.length === 1 ? p.layers[0] : null
  const cf = single && single.c > 0 && p.state === 'active' && !p.wt ? crackForces({ H, gamma: single.gamma, phi: single.phi, c: single.c, q: p.q }) : null
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            const g = randomWall(Math.floor(Math.random() * 1e9))
            setP(g.w)
            setStory(g.story)
          }}
        >
          🎲 Random exam-style wall
        </button>
        <select
          className="field !py-1 !text-xs"
          value=""
          onChange={(e) => {
            const pr = PRESETS.find((x) => x.key === e.target.value)
            if (pr) {
              setP(pr.w)
              setStory(null)
            }
          }}
        >
          <option value="">Load a lecture / handnote / paper wall…</option>
          {PRESETS.map((x) => (
            <option key={x.key} value={x.key}>
              {x.label}
            </option>
          ))}
        </select>
      </div>
      {story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{story}</div>}
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Seg value={p.state} onChange={(v) => set({ state: v })} items={[{ v: 'rest', label: 'At rest (K0)' }, { v: 'active', label: 'Active (Ka)' }, { v: 'passive', label: 'Passive (Kp)' }]} />
          <NumIn label="surcharge q" value={p.q} onChange={(v) => set({ q: v })} step={5} unit="kPa" w="w-14" />
          <label className="inline-flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={p.wt} onChange={(e) => set({ wt: e.target.checked })} /> water table at
          </label>
          {p.wt && <NumIn label="" value={p.zw} onChange={(v) => set({ zw: v })} step={0.5} unit="m below top" w="w-14" />}
        </div>
        {p.layers.map((l, i) => (
          <LayerRow key={i} l={l} i={i} state={p.state} set={(o) => setL(i, o)} remove={p.layers.length > 1 ? () => set({ layers: p.layers.filter((_, j) => j !== i) }) : undefined} />
        ))}
        <div className="flex flex-wrap items-center gap-3">
          {p.layers.length < 4 && (
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ layers: [...p.layers, layer({ h: 2, gamma: 18, gammaSat: 19, phi: 30 })] })}>
              + layer
            </button>
          )}
          {p.state === 'active' && (
            <>
              <label className="inline-flex items-center gap-1.5 text-xs">
                <input type="checkbox" checked={p.front} onChange={(e) => set({ front: e.target.checked })} /> passive soil in front
              </label>
              {p.front && (
                <>
                  <NumIn label="D" value={p.D} onChange={(v) => set({ D: v })} step={0.5} unit="m" w="w-12" />
                  <NumIn label="γ" value={p.fGamma} onChange={(v) => set({ fGamma: v })} step={0.5} w="w-12" />
                  <NumIn label="φ′" value={p.fPhi} onChange={(v) => set({ fPhi: v })} step={1} unit="°" w="w-12" />
                  <NumIn label="c′" value={p.fC} onChange={(v) => set({ fC: v })} step={1} w="w-12" />
                </>
              )}
            </>
          )}
        </div>
      </div>
      {!r ? (
        <div className="text-bad text-sm">Fill in every input (thicknesses and unit weights positive, φ′ below 60°).</div>
      ) : (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
            <div className="min-w-[640px]">
              <WallFig w={w} r={r} />
            </div>
          </div>
          {p.layers.some((l) => l.phi === 0 && l.c > 0 && !l.total) && p.wt && (
            <Callout kind="note">φ = 0 layer below the WT treated as effective stress + separate water. Tick “total stress” to follow 2021-22 Q8(c) (γsat, no separate water).</Callout>
          )}
          <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
              {r.K.map((K, i) => (
                <Answer key={i} id={id(`K${i}`)} label={`${p.state === 'rest' ? 'K0' : p.state === 'active' ? 'Ka' : 'Kp'}${p.layers.length > 1 ? ` layer ${i + 1}` : ''}`} value={K} digits={4} abs={0.002} compact />
              ))}
              {r.zc !== null && <Answer id={id('zc')} label="crack depth zc" value={r.zc} unit="m" abs={0.02} compact />}
              {r.tension.length > 0 && <Answer id={id('fb')} label="force before the crack" value={r.Fbefore} unit="kN/m" compact />}
              {r.front && <Answer id={id('pp')} label="passive in front Pp" value={r.front.P} unit="kN/m" compact />}
              <Answer id={id('fs')} label={p.state === 'passive' ? 'total passive force' : r.front ? 'net sliding force Fs' : 'sliding force Fs'} value={r.Fs} unit="kN/m" compact />
              <Answer id={id('mot')} label="moment about the base" value={r.MOT} unit="kN·m/m" compact />
              <Answer id={id('zb')} label="z̄ above the base" value={r.zbar} unit="m" abs={0.02} compact />
              {cf && cf.zc < H && <Answer id={id('hc')} label="unsupported cut height Hc = 2zc" value={criticalHeight(single!.c, single!.gamma, single!.phi)} unit="m" compact />}
              {r.waterF > 0 && <Choice id={id('big')} label="largest single piece" options={[{ v: 'water', label: 'water' }, { v: 'earth', label: 'earth' }]} answer={Math.max(...r.pieces.filter((x) => x.kind === 'water').map((x) => x.F)) >= Math.max(...r.pieces.filter((x) => x.kind !== 'water' && x.kind !== 'passive').map((x) => x.F)) ? 'water' : 'earth'} />}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Pressure ordinates — σ′h = σ′0K ∓ 2c√K + qK, and u</div>
              <CheckTable
                rows={r.ords.map((o, i) => ({ ...o, k: `o${i}` }))}
                rowKey={(x) => x.k}
                given={[
                  { label: 'z (m)', get: (x) => `${f2(x.z)}${r.ords.filter((y) => Math.abs(y.z - x.z) < 1e-9).length > 1 ? (x.at === 'bot' ? ' ↑' : ' ↓') : ''}` },
                  { label: 'K', get: (x) => fmt(x.K, 3) },
                ]}
                cols={ORD_COLS}
                idp={id('ords')}
              />
              <div className="text-[11px] text-faint mt-1">↑ just above, ↓ just below an interface. Negative σ′h = tension.</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Pieces — force and arm above the base {r.tension.length ? '(after the crack)' : ''}</div>
            <CheckTable
              rows={r.pieces.map((x, i) => ({ ...x, k: `p${i}` }))}
              rowKey={(x) => x.k}
              given={[
                { label: 'piece', get: (x) => x.label },
                { label: 'shape', get: (x) => (x.shape === 'rect' ? '▭' : '◺') },
              ]}
              cols={PC_COLS}
              idp={id('pcs')}
            />
          </div>
          <Reveal id={id('sol')} title="Full solution (as you would write it)">
            <WallSolution w={w} r={r} />
          </Reveal>
          <div className="text-xs text-mute">
            Chart pane:{' '}
            <button className="underline" onClick={() => openSmRef('e-ka')}>
              Ka / Kp table
            </button>{' '}
            ·{' '}
            <button className="underline" onClick={() => openSmRef('e-k0')}>
              K0 formulas
            </button>{' '}
            ·{' '}
            <button className="underline" onClick={() => openSmRef('e-rankine')}>
              Rankine sheet
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- one element in the three states
export function ElementLab() {
  const [sv, setSv] = useState(72)
  const [phi, setPhi] = useState(30)
  const [c, setC] = useState(10)
  const [K0v, setK0] = useState(0.5)
  const ok = sv > 0 && phi > 0 && phi < 60 && c >= 0 && K0v > 0
  const st = ok ? stateCircles({ sv, phi, c, K0: K0v }) : null
  const id = (k: string) => `sm-lep:mohr:${hashKey(JSON.stringify([sv, phi, c, K0v]))}:${k}`
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        <NumIn label="σ′v at the element" value={sv} onChange={setSv} step={4} unit="kPa" w="w-16" />
        <NumIn label="φ′" value={phi} onChange={setPhi} step={1} unit="°" w="w-12" />
        <NumIn label="c′" value={c} onChange={setC} step={1} unit="kPa" w="w-12" />
        <NumIn label="K0" value={K0v} onChange={setK0} step={0.05} w="w-14" />
        <button className="text-xs text-accent underline" onClick={() => (setSv(72), setPhi(30), setC(10), setK0(0.5))}>
          handnote Problem 8
        </button>
      </div>
      {st && (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <StateMohrFig sv={sv} phi={phi} c={c} K0={K0v} />
            <div className="grid grid-cols-3 gap-2 mt-1">
              <ElementFig state="rest" phi={phi} />
              <ElementFig state="active" phi={phi} />
              <ElementFig state="passive" phi={phi} />
            </div>
          </div>
          <div key={id('')} className="grid cq-md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line p-3 space-y-1">
              <Answer id={id('s0')} label="σ′h at rest" value={st.rest.sh} unit="kPa" compact />
              <Answer id={id('sa')} label="σ′a (active)" value={st.active.sh} unit="kPa" compact />
              <Answer id={id('sp')} label="σ′p (passive)" value={st.passive.sh} unit="kPa" compact />
              <Answer id={id('ra')} label="active circle radius" value={st.active.R} unit="kPa" compact />
              <Answer id={id('rp')} label="passive circle radius" value={st.passive.R} unit="kPa" compact />
            </div>
            <div className="rounded-xl border border-line p-3 space-y-1">
              <Answer id={id('ta')} label="active failure plane to the horizontal" value={st.thActive} unit="°" compact />
              <Answer id={id('tp')} label="passive failure plane to the horizontal" value={st.thPassive} unit="°" compact />
              <Choice id={id('maj')} label="passive: major principal plane is" options={[{ v: 'h', label: 'horizontal' }, { v: 'v', label: 'vertical' }]} answer="v" />
              <Answer id={id('tpa')} label="τ on the active failure plane" value={st.active.tp.tau} unit="kPa" compact />
              <div className="text-xs text-mute">
                Tangency check R = C sin φ′ + c′ cos φ′: active {f2(st.active.R)} = {f2(st.active.check)}, passive {f2(st.passive.R)} = {f2(st.passive.check)}. Tangent points: active ({f2(st.active.tp.sigma)}, {f2(st.active.tp.tau)}), passive ({f2(st.passive.tp.sigma)}, {f2(st.passive.tp.tau)}).
              </div>
            </div>
          </div>
          <p className="text-xs text-mute">
            The pole is at σ′h (the stress on the vertical plane). Lines from the pole to the tangent points are the failure planes: active {f2(st.thActive)}° to the horizontal = 45 + φ′/2 to the major (horizontal) plane; passive {f2(st.thPassive)}° to the horizontal = 45 + φ′/2 to the major (vertical) plane.
          </p>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- pressure against tilt
export function TiltLab() {
  const [soil, setSoil] = useState(0)
  const [phi, setPhi] = useState(30)
  const [H, setH] = useState(5)
  const [g, setG] = useState(16)
  const [t, setT] = useState(0)
  const m = MOVE_TABLE[soil]
  const xa = m.a[1],
    xp = m.p[0]
  const o = { k0: 1 - Math.sin((phi * Math.PI) / 180), ka: Ka(phi), kp: Kp(phi), xa, xp }
  const x = t < 0 ? (t / 100) * xa * 2 : (t / 100) * xp * 1.3
  const K = kVsTilt(x, o)
  useEffect(() => markUsed('e-move', { soil: m.soil }))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-sm">
        <select className="field !py-0.5 !text-xs" value={soil} onChange={(e) => setSoil(+e.target.value)}>
          {MOVE_TABLE.map((r, i) => (
            <option key={r.soil} value={i}>
              {r.soil}
            </option>
          ))}
        </select>
        <NumIn label="φ′" value={phi} onChange={setPhi} step={1} unit="°" w="w-12" />
        <NumIn label="H" value={H} onChange={setH} step={0.5} unit="m" w="w-12" />
        <NumIn label="γ" value={g} onChange={setG} step={0.5} w="w-12" />
      </div>
      <Slider label="wall movement (− away, + into the soil)" value={t} min={-100} max={100} onChange={setT} unit="%" />
      {phi > 0 && phi < 60 && (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <TiltFig {...o} x={x} />
          </div>
          <p className="text-sm">
            ΔL = {fmt(Math.abs(x) * H * 1000, 1)} mm {x < 0 ? 'outward' : x > 0 ? 'inward' : ''} (ΔL/H = {fmt(x, 5)}) → K = <b>{fmt(K, 3)}</b>, σ′h at the base = {f2(K * g * H)} kPa, P = ½KγH² = <b>{f2(0.5 * K * g * H * H)} kN/m</b>. Active needs {fmt(m.a[0] * H * 1000, 1)}–{fmt(m.a[1] * H * 1000, 1)} mm, full passive {fmt(xp * H * 1000, 0)} mm.
          </p>
        </>
      )}
    </div>
  )
}

export function LepLabSections() {
  return (
    <>
      <Section title="Wall builder" sub="Layers, water table, surcharge, c′ or cu, passive soil in front, K0 / active / passive. Diagrams are drawn to one pressure scale. Fill the ordinates and pieces, then open the solution.">
        <WallLab />
      </Section>
      <Section title="One soil element: K0, active and passive on the Mohr diagram" sub="2023-24 Q2(c) asks the principal and failure planes in each state; handnote Problem 8 asks the circles and the tangent points.">
        <ElementLab />
      </Section>
      <Section title="Earth pressure against wall tilt" sub="Das Fig. 13.2 / Table 13.1: a small outward tilt reaches active; passive needs far more movement. Asked as a sketch in 2023-24, 2021-22, 2020-21, Jan 2021.">
        <TiltLab />
      </Section>
    </>
  )
}
