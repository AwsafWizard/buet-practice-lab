// Settlement calculator: build the profile (sand / clay layers, WT, wide fill or footing), see σ′0 and Δp beside it,
// the NC / OC branch on the e–log p plot, checkpoints and the written solution.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { NumIn } from '../../../reference/common'
import { ccSkempton, csFromCc, e0FromWGs, gammaSatFromGsE, settleAt, settleProfile, type CLayer, type LoadIn, type SettleIn } from '../../engine/consolidation'
import { markUsed, openSmRef } from '../../reference/pane'
import { ProfileFig, StressPathFig } from './figs'
import { randomProfile, SETTLE_PRESETS } from './gen'
import { Chart, pathOf } from './plot'
import { SettleSolution } from './Solution'

const f2 = (v: number) => fmt(v, 2)
const BRANCH_OPTS = [
  { v: 'nc', label: 'NC (Cc)' },
  { v: 'recomp', label: 'OC, below pc′ (Cs)' },
  { v: 'cross', label: 'OC, crosses pc′ (Cs + Cc)' },
]

function ClayHelper({ onApply }: { onApply: (o: Partial<CLayer>) => void }) {
  const [w, setW] = useState(40)
  const [Gs, setGs] = useState(2.7)
  const [LL, setLL] = useState(45)
  const [div, setDiv] = useState(6)
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-md bg-panel2/60 px-2 py-1">
      <span className="text-faint">from</span>
      <NumIn label="w" value={w} onChange={setW} step={1} unit="%" w="w-12" />
      <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-14" />
      <NumIn label="LL" value={LL} onChange={setLL} step={1} w="w-12" />
      <NumIn label="Cs = Cc /" value={div} onChange={setDiv} step={1} w="w-10" />
      <button
        className="btn !py-0.5 !px-2 !text-xs"
        onClick={() => {
          const e0 = e0FromWGs(w / 100, Gs)
          const g = gammaSatFromGsE(Gs, e0)
          const Cc = ccSkempton(LL)
          onApply({ e0: +e0.toFixed(4), gamma: +g.toFixed(2), gammaSat: +g.toFixed(2), Cc: +Cc.toFixed(4), Cs: +csFromCc(Cc, div).toFixed(4) })
        }}
      >
        e0 = wGs, γsat, Cc = 0.009(LL − 10)
      </button>
    </div>
  )
}

function LayerRow({ l, i, set, remove }: { l: CLayer; i: number; set: (o: Partial<CLayer>) => void; remove?: () => void }) {
  const clay = l.kind === 'clay'
  return (
    <div className="rounded-lg border border-line p-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <b className="text-xs">Layer {i + 1}</b>
        <Seg size="xs" value={l.kind} onChange={(v) => set(v === 'clay' ? { kind: v, e0: l.e0 ?? 0.9, Cc: l.Cc ?? 0.3, Cs: l.Cs ?? 0.05, cv: l.cv ?? 2 } : { kind: v })} items={[{ v: 'sand', label: 'sand' }, { v: 'clay', label: 'clay' }]} />
        <NumIn label="H" value={l.H} onChange={(v) => set({ H: v })} step={0.5} unit="m" w="w-14" />
        <NumIn label="γ" value={l.gamma} onChange={(v) => set({ gamma: v })} step={0.5} w="w-14" />
        <NumIn label="γsat" value={l.gammaSat} onChange={(v) => set({ gammaSat: v })} step={0.5} unit="kN/m³" w="w-14" />
        {remove && (
          <button className="text-xs text-bad underline ml-auto" onClick={remove}>
            remove
          </button>
        )}
      </div>
      {clay && (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <NumIn label="e0" value={l.e0 ?? NaN} onChange={(v) => set({ e0: v })} step={0.01} w="w-16" />
            <NumIn label="Cc" value={l.Cc ?? NaN} onChange={(v) => set({ Cc: v })} step={0.01} w="w-16" />
            <NumIn label="Cs" value={l.Cs ?? NaN} onChange={(v) => set({ Cs: v })} step={0.005} w="w-16" />
            <NumIn label="pc′ (0 = NC)" value={l.pc ?? 0} onChange={(v) => set({ pc: v > 0 ? v : null })} step={5} unit="kPa" w="w-16" />
            <NumIn label="cv" value={l.cv ?? NaN} onChange={(v) => set({ cv: v })} step={0.5} unit="m²/yr" w="w-14" />
          </div>
          <ClayHelper onApply={set} />
        </>
      )}
    </div>
  )
}

export function SettleLab() {
  const [inp, setInp] = useState<SettleIn>(SETTLE_PRESETS[0].inp)
  const [story, setStory] = useState<string | null>(SETTLE_PRESETS[0].note ?? null)
  const set = (o: Partial<SettleIn>) => {
    setInp({ ...inp, ...o })
    setStory(null)
  }
  const setL = (i: number, o: Partial<CLayer>) => set({ layers: inp.layers.map((l, j) => (j === i ? { ...l, ...o } : l)) })
  const setLoad = (o: Partial<LoadIn>) => set({ load: { ...inp.load, ...o } as LoadIn })
  const valid =
    inp.layers.length > 0 &&
    inp.layers.some((l) => l.kind === 'clay') &&
    inp.layers.every((l) => l.H > 0 && l.gamma > 0 && l.gammaSat > 0 && (l.kind === 'sand' || ((l.e0 ?? NaN) > 0 && (l.Cc ?? NaN) >= 0 && (l.Cs ?? NaN) >= 0))) &&
    Number.isFinite(inp.wt) &&
    (inp.load.kind === 'fill' ? inp.load.q >= 0 : inp.load.B > 0 && (inp.load.shape !== 'rect' || inp.load.L > 0) && inp.load.Q > 0 && inp.load.Df >= 0)
  const out = useMemo(() => (valid ? settleProfile(inp) : null), [inp, valid])
  const okOut = out && out.layers.every((L) => L.subs.every((s) => Number.isFinite(s.S) && s.p0 > 0))
  useEffect(() => {
    if (!okOut || !out) return
    markUsed('k-settle', { branch: out.layers.map((L) => L.subs[0].branch).join(', ') })
    if (inp.load.kind === 'footing' && inp.load.method === 'elastic' && inp.load.shape === 'rect') markUsed('d-fadum', { mn: out.layers.map((L) => `${fmt((inp.load as { B: number }).B / 2 / (L.subs[0].zMid - (inp.load as { Df: number }).Df), 3)},${fmt((inp.load as { L: number }).L / 2 / (L.subs[0].zMid - (inp.load as { Df: number }).Df), 3)}`).join(';') })
  })
  const key = hashKey(JSON.stringify(inp))
  const id = (k: string) => `sm-consol:lab:settle:${key}:${k}`
  const hasCv = inp.layers.some((l) => l.kind === 'clay' && (l.cv ?? 0) > 0)
  const L = inp.load
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            const g = randomProfile(Math.floor(Math.random() * 1e9))
            setInp(g.inp)
            setStory(g.story)
          }}
        >
          🎲 Random exam-style profile
        </button>
        <select
          className="field !py-1 !text-xs max-w-full"
          value=""
          onChange={(e) => {
            const p = SETTLE_PRESETS.find((x) => x.key === e.target.value)
            if (p) {
              setInp(p.inp)
              setStory(p.note ?? null)
            }
          }}
        >
          <option value="">Load a paper / handnote profile…</option>
          {SETTLE_PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{story}</div>}
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Seg value={L.kind} onChange={(v) => set({ load: v === 'fill' ? { kind: 'fill', q: 80 } : { kind: 'footing', shape: 'rect', B: 2, L: 3, Q: 600, Df: 1, method: '21' } })} items={[{ v: 'fill', label: 'Wide fill' }, { v: 'footing', label: 'Footing' }]} />
          {L.kind === 'fill' ? (
            <NumIn label="Δp = γh" value={L.q} onChange={(v) => setLoad({ q: v })} step={5} unit="kPa" w="w-16" />
          ) : (
            <>
              <Seg size="xs" value={L.shape} onChange={(v) => setLoad({ shape: v })} items={[{ v: 'rect', label: 'rectangle' }, { v: 'circle', label: 'circle' }, { v: 'strip', label: 'strip' }]} />
              <NumIn label={L.shape === 'circle' ? 'D' : 'B'} value={L.B} onChange={(v) => setLoad({ B: v })} step={0.5} unit="m" w="w-14" />
              {L.shape === 'rect' && <NumIn label="L" value={L.L} onChange={(v) => setLoad({ L: v })} step={0.5} unit="m" w="w-14" />}
              <NumIn label="Q" value={L.Q} onChange={(v) => setLoad({ Q: v })} step={50} unit={L.shape === 'strip' ? 'kN/m' : 'kN'} w="w-16" />
              <NumIn label="base depth Df" value={L.Df} onChange={(v) => setLoad({ Df: v })} step={0.5} unit="m" w="w-14" />
              <Seg size="xs" value={L.method} onChange={(v) => setLoad({ method: v })} items={[{ v: '21', label: '2:1' }, { v: 'elastic', label: 'Boussinesq' }]} />
            </>
          )}
          <NumIn label="WT depth" value={inp.wt} onChange={(v) => set({ wt: v })} step={0.5} unit="m" w="w-14" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-mute">Δp over each clay:</span>
          <Seg size="xs" value={inp.avg ?? 'mid'} onChange={(v) => set({ avg: v })} items={[{ v: 'mid', label: 'at mid-depth' }, { v: 'simpson', label: 'Simpson (t + 4m + b)/6' }]} />
          <span className="text-mute ml-2">sub-layers:</span>
          <Seg size="xs" value={String(inp.nSub ?? 1)} onChange={(v) => set({ nSub: +v })} items={['1', '2', '3', '5'].map((v) => ({ v, label: v }))} />
          <span className="text-mute ml-2">2nd OC term over:</span>
          <Seg size="xs" value={inp.eAtPc ?? 'e0'} onChange={(v) => set({ eAtPc: v })} items={[{ v: 'e0', label: '1 + e0' }, { v: 'ec', label: '1 + ec' }]} />
          <label className="inline-flex items-center gap-1 ml-2">
            <input type="checkbox" checked={!!inp.baseDrains} onChange={(e) => set({ baseDrains: e.target.checked })} /> base drains
          </label>
        </div>
        {inp.layers.map((l, i) => (
          <LayerRow key={i} l={l} i={i} set={(o) => setL(i, o)} remove={inp.layers.length > 1 ? () => set({ layers: inp.layers.filter((_, j) => j !== i) }) : undefined} />
        ))}
        {inp.layers.length < 6 && (
          <div className="flex gap-2">
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ layers: [...inp.layers, { kind: 'sand', H: 2, gamma: 17, gammaSat: 19 }] })}>
              + sand
            </button>
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ layers: [...inp.layers, { kind: 'clay', H: 3, gamma: 18, gammaSat: 18, e0: 0.9, Cc: 0.3, Cs: 0.05, cv: 2 }] })}>
              + clay
            </button>
          </div>
        )}
      </div>
      {!out || !okOut ? (
        <div className="text-bad text-sm">Fill in every input (thicknesses and unit weights positive, at least one clay layer, clay below any footing base).</div>
      ) : (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2 overflow-x-auto">
            <div className="min-w-[600px]">
              <ProfileFig inp={inp} out={out} />
            </div>
          </div>
          <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints {inp.nSub && inp.nSub > 1 ? '(first sub-layer of each clay)' : ''}</div>
              {out.layers.map((Ly, i) => {
                const s = Ly.subs[0]
                const tag = out.layers.length > 1 ? ` (clay ${i + 1})` : ''
                return (
                  <div key={i} className="border-t border-line/50 pt-1 first:border-0">
                    <Answer id={id(`p0${i}`)} label={`p0′ at ${f2(s.zMid)} m${tag}`} value={s.p0} unit="kPa" compact />
                    <Answer id={id(`dp${i}`)} label={`Δp${inp.avg === 'simpson' ? ' (Simpson)' : ''}${tag}`} value={s.dp} unit="kPa" compact />
                    {s.pc ? <Choice id={id(`br${i}`)} label={`branch${tag}`} options={BRANCH_OPTS} answer={s.branch} /> : null}
                    <Answer id={id(`S${i}`)} label={`settlement${tag}`} value={Ly.S * 1000} unit="mm" abs={0.3} compact />
                  </div>
                )
              })}
              {out.layers.length > 1 && <Answer id={id('S')} label="total settlement" value={out.S * 1000} unit="mm" abs={0.3} compact />}
              <button className="text-xs text-accent underline" onClick={() => openSmRef('k-settle')}>
                formula sheet ↗
              </button>
            </div>
            <div className="space-y-2">
              {out.layers.map((Ly, i) => {
                const l = inp.layers[Ly.layer]
                const s = Ly.subs[0]
                return (
                  <div key={i}>
                    <div className="text-xs font-bold uppercase tracking-wider text-faint">e–log p path, clay {i + 1}</div>
                    <StressPathFig e0={l.e0 ?? 1} p0={s.p0} p1={s.p1} pc={l.pc ?? null} Cc={l.Cc ?? 0} Cs={l.Cs ?? 0} />
                    <div className="text-xs text-mute">
                      {s.branch === 'nc' ? 'NC: the path runs down the virgin line (Cc).' : s.branch === 'recomp' ? `OC: p0′ + Δp = ${f2(s.p1)} stays below pc′ = ${f2(s.pc ?? 0)} → only the flat recompression line (Cs).` : `OC: the path crosses pc′ = ${f2(s.pc ?? 0)} → Cs up to pc′, then Cc.`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {hasCv && <TimeCurve inp={inp} out={out} />}
          {inp.layers.some((l) => l.kind === 'clay' && l.pc && l.Cs && l.Cc && Math.abs(l.Cc / l.Cs - 6) < 0.05) && (
            <Callout kind="note">Cs = Cc/6 here (the handnote's choice when Cs is not given). The papers accept Cc/5 to Cc/10 — state the one you use.</Callout>
          )}
          <Reveal key={'sol' + key} id={id('sol')} title="Full solution (as you would write it)">
            <SettleSolution inp={inp} out={out} />
          </Reveal>
        </>
      )}
    </div>
  )
}

function TimeCurve({ inp, out }: { inp: SettleIn; out: ReturnType<typeof settleProfile> }) {
  const tMax = useMemo(() => {
    let t = 0.01
    while (settleAt(inp, out, t) < 0.97 * out.S && t < 1e4) t *= 1.5
    return t
  }, [inp, out])
  const ts = Array.from({ length: 80 }, (_, i) => 0.001 * (tMax / 0.001) ** (i / 79))
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-faint">Settlement–time (each clay with its own cv and drainage, exact Tv–U)</div>
      <Chart w={520} h={210} x={{ min: 0.001, max: tMax, log: true, label: 't (years, log)' }} y={{ min: 0, max: out.S * 1000 * 1.05, flip: true, label: 'S (mm)' }} label="settlement time curve">
        {(s) => (
          <>
            <path d={pathOf(ts.map((t) => [t, settleAt(inp, out, t) * 1000]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
            <line x1={s.L} x2={s.R} y1={s.Y(out.S * 1000)} y2={s.Y(out.S * 1000)} stroke="var(--c-mute)" strokeDasharray="4 3" />
          </>
        )}
      </Chart>
      <div className="text-xs text-mute">
        {out.layers.map((L, i) => `clay ${i + 1}: drains ${L.top && L.bot ? 'both ways' : L.top ? 'upward only' : L.bot ? 'downward only' : 'nowhere'}, d = ${f2(L.d)} m, cv = ${f2(inp.layers[L.layer].cv ?? 0)} m²/yr`).join(' · ')}
      </div>
    </div>
  )
}
