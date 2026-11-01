// Shear lab: build a beam, get the Vu diagram, classify, fill checkpoints, edit the zone layout, open the full solution.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Reveal, Section, Seg } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, randInt, rng } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { checkLayout, designShear, positionsOf, shearAt, stirrupAv, type PointLoad, type RunLayout, type ShearBeam, type ShearDesign, type ShearSection, type Zone } from '../../engine/shear'
import { markUsed } from '../../reference/pane'
import { BeamLoads, CaseChart, SpacingChart, StirrupSketch, VuDiagram } from './figs'
import { distinctRuns, layoutText, runsTotal, ShearSolution } from './Solution'

export interface LabIn {
  kind: 'ss' | 'cant'
  L: number
  ohL: number
  ohR: number
  P: PointLoad[]
  wD: number
  wL: number
  factored: boolean
  sw: boolean
  h: number
  patterns: boolean
  bw: number
  d: number
  fc: number
  fy: number
  bar: number
  legs: number
  phi: number
  nSets: number
  nominal: boolean
  step: number
  story?: string
}

export const toBeam = (p: LabIn): ShearBeam => ({
  kind: p.kind,
  L: p.L,
  ohL: p.kind === 'ss' ? p.ohL : 0,
  ohR: p.kind === 'ss' ? p.ohR : 0,
  wD: p.wD,
  wL: p.factored ? 0 : p.wL,
  P: p.P.map((q) => (p.factored ? { x: q.x, P: q.P } : q)),
  factored: p.factored,
  selfWeight: p.sw ? { b: p.bw, h: p.h } : undefined,
  patterns: p.patterns && !p.factored,
})
export const toSec = (p: LabIn): ShearSection => ({ bw: p.bw, d: p.d, fc: p.fc, fy: p.fy, phi: p.phi, Av: stirrupAv(p.bar, p.legs) })

const DEFAULT: LabIn = { kind: 'ss', L: 36, ohL: 0, ohR: 0, P: [{ x: 10, P: 40 }, { x: 26, P: 40 }], wD: 2, wL: 0, factored: true, sw: false, h: 28, patterns: false, bw: 14, d: 26, fc: 4000, fy: 60000, bar: 3, legs: 2, phi: 0.75, nSets: 3, nominal: false, step: 0.5 }

// ---------------------------------------------------------------- random exam-style problems
export function randomLab(seed: number): LabIn {
  const r = rng(seed)
  const t = pick(r, ['two', 'two', 'two', 'mid', 'udl', 'cant', 'over'])
  const fc = pick(r, [3000, 3000, 3500, 4000, 4000])
  const base = { ...DEFAULT, fc, P: [] as PointLoad[], ohL: 0, ohR: 0, wL: 0, sw: false, patterns: false, nSets: 3, nominal: false }
  if (t === 'two') {
    const a = pick(r, [10, 10, 12])
    const mid = pick(r, [15, 16, 12])
    const P = randInt(r, 30, 50, 5)
    const L = 2 * a + mid
    const sw = r() < 0.35
    const b = pick(r, [12, 14])
    const d = randInt(r, 22, 26)
    return { ...base, kind: 'ss', L, P: [{ x: a, P }, { x: a + mid, P }], wD: pick(r, [2, 2, 2.5]), factored: true, sw, h: d + 3, bw: b, d, story: `Simply supported ${L} ft beam, ${P} k at ${a} ft from each end, UDL ${sw ? 'excluding' : 'including'} self-weight, all loads factored. Design the stirrups with 3 sets of spacing and sketch them.` }
  }
  if (t === 'mid') {
    const L = pick(r, [20, 24, 30])
    const P = randInt(r, 40, 80, 10)
    const d = randInt(r, 20, 24)
    return { ...base, kind: 'ss', L, P: [{ x: L / 2, P }], wD: pick(r, [0, 1.5, 2]), factored: true, bw: 12, d, story: `Simply supported ${L} ft beam with a factored ${P} k load at midspan (and the factored UDL shown, incl. self-weight).` }
  }
  if (t === 'udl') {
    const L = randInt(r, 20, 30, 2)
    const d = randInt(r, 20, 26)
    return { ...base, kind: 'ss', L, wD: randInt(r, 15, 25, 5) / 10, wL: randInt(r, 15, 25, 5) / 10, factored: false, sw: true, h: d + 3, bw: 12, d, story: `Simply supported ${L} ft beam, service DL (excluding self-weight) and LL as shown. Find Vu at d, where stirrups are needed, and design them.` }
  }
  if (t === 'cant') {
    const L = randInt(r, 8, 12)
    const d = randInt(r, 17, 22)
    return { ...base, kind: 'cant', L, wD: 1.5, wL: 2, factored: false, sw: false, bw: pick(r, [10, 12]), d, fc: 4000, nSets: 2, story: `Cantilever ${L} ft, DL 1.5 k/ft (incl. self-weight) and LL 2.0 k/ft. Which part needs web reinforcement? Design the stirrups (Vc = 2√f′c bw d).` }
  }
  const L = pick(r, [24, 30, 36])
  const oh = pick(r, [5, 6])
  const P = randInt(r, 20, 45, 5)
  return { ...base, kind: 'ss', L, ohL: oh, ohR: oh, P: [{ x: 0, P }, { x: oh + L / 2, P: 2 * P }, { x: L + 2 * oh, P }], wD: pick(r, [3, 4, 5]), factored: true, bw: 14, d: randInt(r, 26, 30), fc: 3000, story: `Beam with ${oh} ft overhangs (factored tip loads ${P} k, ${2 * P} k at midspan, UDL between and on the overhangs). Neglect self-weight. Design the shear reinforcement.` }
}

// ---------------------------------------------------------------- input panel
function Inputs({ p, set }: { p: LabIn; set: (o: Partial<LabIn>) => void }) {
  const Ltot = p.kind === 'ss' ? p.ohL + p.L + p.ohR : p.L
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-2 items-center">
        <Seg value={p.kind} onChange={(v) => set({ kind: v })} items={[{ v: 'ss', label: 'Simply supported / overhang' }, { v: 'cant', label: 'Cantilever' }]} />
        <Seg value={p.factored ? 'f' : 'u'} onChange={(v) => set({ factored: v === 'f' })} items={[{ v: 'f', label: 'loads factored' }, { v: 'u', label: 'service D + L' }]} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <NumIn label={p.kind === 'ss' ? 'span L' : 'length L'} value={p.L} onChange={(v) => set({ L: v })} step={1} unit="ft" w="w-16" />
        {p.kind === 'ss' && (
          <>
            <NumIn label="left overhang" value={p.ohL} onChange={(v) => set({ ohL: v })} step={1} unit="ft" w="w-14" />
            <NumIn label="right overhang" value={p.ohR} onChange={(v) => set({ ohR: v })} step={1} unit="ft" w="w-14" />
          </>
        )}
        <NumIn label={p.factored ? 'w_u' : 'w_D'} value={p.wD} onChange={(v) => set({ wD: v })} step={0.1} unit="k/ft" w="w-16" />
        {!p.factored && <NumIn label="w_L" value={p.wL} onChange={(v) => set({ wL: v })} step={0.1} unit="k/ft" w="w-16" />}
        <label className="inline-flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={p.sw} onChange={(e) => set({ sw: e.target.checked })} /> add self-weight (×1.2)
        </label>
        {p.sw && <NumIn label="h" value={p.h} onChange={(v) => set({ h: v })} step={1} unit="in" w="w-14" />}
        {!p.factored && p.kind === 'ss' && (p.ohL > 0 || p.ohR > 0) && (
          <label className="inline-flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={p.patterns} onChange={(e) => set({ patterns: e.target.checked })} /> live-load patterns
          </label>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-xs text-mute">
          Point loads (x from the {p.kind === 'cant' ? 'fixed end' : 'left end'}, beam length {fmt(Ltot, 2)} ft)
        </div>
        {p.P.map((q, i) => (
          <div key={i} className="flex flex-wrap gap-3 items-center">
            <NumIn label={`P${i + 1} at x`} value={q.x} onChange={(v) => set({ P: p.P.map((o, j) => (j === i ? { ...o, x: Math.max(0, Math.min(Ltot, v)) } : o)) })} step={0.5} unit="ft" w="w-16" />
            <NumIn label={p.factored ? 'P_u' : 'P_D'} value={q.P} onChange={(v) => set({ P: p.P.map((o, j) => (j === i ? { ...o, P: v } : o)) })} step={5} unit="k" w="w-16" />
            {!p.factored && <NumIn label="P_L" value={q.PL ?? 0} onChange={(v) => set({ P: p.P.map((o, j) => (j === i ? { ...o, PL: v } : o)) })} step={5} unit="k" w="w-16" />}
            <button className="text-xs text-bad underline" onClick={() => set({ P: p.P.filter((_, j) => j !== i) })}>
              remove
            </button>
          </div>
        ))}
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ P: [...p.P, { x: +(Ltot / 2).toFixed(1), P: 20 }] })}>
          + point load
        </button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <NumIn label="b_w" value={p.bw} onChange={(v) => set({ bw: v })} step={1} unit="in" w="w-14" />
        <NumIn label="d" value={p.d} onChange={(v) => set({ d: v })} step={0.5} unit="in" w="w-14" />
        <NumIn label="f′c" value={p.fc} onChange={(v) => set({ fc: v })} step={500} unit="psi" />
        <NumIn label="f_yt" value={p.fy} onChange={(v) => set({ fy: v })} step={10000} unit="psi" />
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">stirrup</span>
          <select className="field !py-0.5 !text-xs" value={p.bar} onChange={(e) => set({ bar: +e.target.value })}>
            {[3, 4, 5].map((b) => (
              <option key={b} value={b}>
                #{b}
              </option>
            ))}
          </select>
          <select className="field !py-0.5 !text-xs" value={p.legs} onChange={(e) => set({ legs: +e.target.value })}>
            {[2, 4].map((b) => (
              <option key={b} value={b}>
                {b} legs
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">φ</span>
          <select className="field !py-0.5 !text-xs" value={p.phi} onChange={(e) => set({ phi: +e.target.value })}>
            <option value={0.75}>0.75</option>
            <option value={0.85}>0.85 (old papers)</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">sets of spacing</span>
          <select className="field !py-0.5 !text-xs" value={p.nSets} onChange={(e) => set({ nSets: +e.target.value })}>
            {[1, 2, 3, 4].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">round s down to</span>
          <select className="field !py-0.5 !text-xs" value={p.step} onChange={(e) => set({ step: +e.target.value })}>
            <option value={0.5}>½ in</option>
            <option value={1}>1 in</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={p.nominal} onChange={(e) => set({ nominal: e.target.checked })} /> nominal stirrups at s_max where Case A (good practice)
        </label>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- layout editor
type Custom = Record<string, { first: number; zones: { s: number; n: number }[] }>

function fromLayout(l: RunLayout) {
  return { first: l.first, zones: l.zones.map((z: Zone) => ({ s: z.s, n: z.n })) }
}

function LayoutEditor({ dsg, custom, setCustom }: { dsg: ShearDesign; custom: Custom; setCustom: (c: Custom) => void }) {
  const groups = distinctRuns(dsg)
  const upd = (ids: string[], v: Custom[string]) => {
    const c = { ...custom }
    ids.forEach((id) => (c[id] = v))
    setCustom(c)
  }
  return (
    <div className="space-y-3">
      {groups.map(({ run, same }) => {
        const ids = [run.id, ...same.map((s) => s.id)]
        const cur = custom[run.id] ?? fromLayout(dsg.layouts[run.id])
        const lay = positionsOf(cur.first, cur.zones)
        const chk = checkLayout(run, lay)
        if (run.uReqEnd <= 0 && !cur.zones.length) return (
          <div key={run.id} className="text-xs text-mute">
            {run.label}: no stirrups required (Case A throughout).
          </div>
        )
        return (
          <div key={run.id} className="rounded-lg border border-line p-2 text-xs space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <b className="text-sm">{run.label}</b>
              {same.length > 0 && <span className="chip">same for {same.map((s) => s.label.toLowerCase()).join(', ')}</span>}
              <span className={chk.ok ? 'text-good font-semibold' : 'text-bad font-semibold'}>{chk.ok ? '✓ satisfies the requirement' : '✗ check the red items'}</span>
              <button className="text-accent underline ml-auto" onClick={() => upd(ids, fromLayout(dsg.layouts[run.id]))}>
                reset to auto
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <NumIn label="first stirrup at" value={cur.first} onChange={(v) => upd(ids, { ...cur, first: v })} step={0.5} unit="in" w="w-14" />
              {!chk.firstOk && <span className="text-bad">first stirrup should be at ≤ s/2 (or 2 in)</span>}
            </div>
            {cur.zones.map((z, i) => {
              const bad = chk.spaces.filter((sp) => Math.abs(sp.s - z.s) < 1e-6 && sp.from >= (lay.zones[i]?.from ?? 0) - 1e-6 && sp.to <= (lay.zones[i]?.to ?? 0) + 1e-6 && !sp.ok)
              return (
                <div key={i} className={'flex flex-wrap items-center gap-2 rounded px-1 ' + (bad.length ? 'bg-bad/10' : '')}>
                  <span className="text-mute w-12">zone {i + 1}</span>
                  <button className="btn !py-0 !px-1.5" onClick={() => upd(ids, { ...cur, zones: cur.zones.map((o, j) => (j === i ? { ...o, n: Math.max(0, o.n - 1) } : o)) })}>
                    −
                  </button>
                  <NumIn label="spaces" value={z.n} onChange={(v) => upd(ids, { ...cur, zones: cur.zones.map((o, j) => (j === i ? { ...o, n: Math.max(0, Math.round(v || 0)) } : o)) })} step={1} w="w-12" />
                  <button className="btn !py-0 !px-1.5" onClick={() => upd(ids, { ...cur, zones: cur.zones.map((o, j) => (j === i ? { ...o, n: o.n + 1 } : o)) })}>
                    +
                  </button>
                  <NumIn label="@ s" value={z.s} onChange={(v) => upd(ids, { ...cur, zones: cur.zones.map((o, j) => (j === i ? { ...o, s: v } : o)) })} step={0.5} unit="in" w="w-14" />
                  <span className="num text-faint">
                    {fmt(lay.zones[i]?.from ?? 0, 1)} → {fmt(lay.zones[i]?.to ?? 0, 1)} in
                  </span>
                  {bad.length > 0 && <span className="text-bad">too wide: needs ≤ {fmt(Math.min(...bad.map((b) => b.req)), 2)} in</span>}
                  <button className="text-bad underline" onClick={() => upd(ids, { ...cur, zones: cur.zones.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </div>
              )
            })}
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => upd(ids, { ...cur, zones: [...cur.zones, { s: cur.zones.at(-1)?.s ?? run.sMin, n: 1 }] })}>
                + zone
              </button>
              <span className="num">
                last stirrup at {fmt(lay.last, 1)} in · {lay.count} stirrups · required to {fmt(run.uReqEnd, 1)} in
              </span>
              {!chk.coverOk && <span className="text-bad">does not reach the end of the required region (last stirrup must be within s/2 of it)</span>}
              {chk.tooClose && <span className="text-load">spacing below 3 in: use #4 or 4 legs</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- zone check table
type ZoneRow = { k: string; s: number; n: number; to: number }
const ZONE_COLS: CheckCol<ZoneRow>[] = [
  { key: 'n', label: 'number of spaces', get: (r) => r.n, abs: 0.4 },
  { key: 'to', label: 'zone ends at (in from face)', get: (r) => r.to, abs: 0.6 },
]

// ---------------------------------------------------------------- the lab
export function ShearLab() {
  const [p, setP] = useState<LabIn>(DEFAULT)
  const [custom, setCustom] = useState<Custom>({})
  const set = (o: Partial<LabIn>) => {
    setP({ ...p, ...o, story: undefined })
    setCustom({})
  }
  const valid = p.L > 0 && p.bw > 0 && p.d > 0 && p.fc > 0 && p.fy > 0 && [p.L, p.ohL, p.ohR, p.wD, p.wL, p.bw, p.d, p.fc, p.fy, ...p.P.flatMap((q) => [q.x, q.P, q.PL ?? 0])].every(Number.isFinite)
  const bm = useMemo(() => toBeam(p), [p])
  const sec = useMemo(() => toSec(p), [p])
  const dsg = useMemo(() => (valid ? designShear(bm, sec, { nSets: p.nSets, nominal: p.nominal, step: p.step }) : null), [bm, sec, valid, p.nSets, p.nominal, p.step])
  const layouts = useMemo(() => {
    if (!dsg) return {}
    const out: Record<string, RunLayout> = {}
    for (const r of dsg.runs) out[r.id] = custom[r.id] ? positionsOf(custom[r.id].first, custom[r.id].zones) : dsg.layouts[r.id]
    return out
  }, [dsg, custom])
  const main = dsg?.runs.find((r) => r.id === 'sL' || r.id === 'c') ?? dsg?.runs[0]
  const a = main ? shearAt(main.Vd, sec) : null
  useEffect(() => {
    if (!dsg || !a) return
    markUsed('s-vc', { fc: p.fc, bw: p.bw, d: p.d, phiVc: +dsg.lim.phiVc.toFixed(2) })
    markUsed('s-cases', { case: a.case })
    markUsed('s-avmin', { fc: p.fc })
  })
  const key = hashKey(JSON.stringify(p))
  const id = (k: string) => `rc-shear:lab:${key}:${k}`
  const generate = () => {
    setP(randomLab(Math.floor(Math.random() * 1e9)))
    setCustom({})
  }
  const barLabel = `#${p.bar} ${p.legs}-legged`
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={generate}>
          🎲 Random exam-style beam
        </button>
        <button className="text-sm text-accent underline" onClick={() => set(DEFAULT)}>
          reset (2021-22 Q3(a) beam)
        </button>
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{p.story}</div>}
      <Inputs p={p} set={set} />
      {!dsg || !main || !a ? (
        <div className="text-bad text-sm">Fill in every input with a positive number.</div>
      ) : (
        <>
          <div className="rounded-xl bg-bg/60 border border-line p-2">
            <BeamLoads bm={bm} dsg={dsg} />
            <VuDiagram dsg={dsg} d={p.d} />
          </div>
          {dsg.flags.length > 0 && (
            <Callout kind="note" title="Flags">
              {dsg.flags.map((f) => (
                <div key={f}>{f}</div>
              ))}
            </Callout>
          )}
          <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints — {main.label.toLowerCase()}</div>
              <Answer id={id('vf')} label="Vu at the face" value={main.Vface} unit="k" compact />
              <Answer id={id('vd')} label={main.critAtFace ? 'Vu (critical at face)' : 'Vu at d'} value={main.Vd} unit="k" compact />
              <Answer id={id('pvc')} label="φVc" value={dsg.lim.phiVc} unit="k" compact />
              <Answer id={id('hvc')} label="φVc/2" value={dsg.lim.halfPhiVc} unit="k" compact />
              <Choice id={id('case')} label="Case at d" options={(['A', 'B', 'C', 'D', 'redesign'] as const).map((v) => ({ v, label: v === 'redesign' ? 'redesign' : v }))} answer={a.case} />
              {a.case !== 'A' && a.case !== 'redesign' && (
                <>
                  <Answer id={id('avs')} label="Av/s at d" value={a.avs} unit="in²/in" digits={4} abs={0.0003} compact />
                  <Answer id={id('sc')} label="s = Av/(Av/s)" value={a.sCalc} unit="in" compact />
                  <Answer id={id('smax')} label="s_max" value={a.sMax} unit="in" compact />
                  <Answer id={id('s')} label="required s at d" value={a.s} unit="in" compact />
                </>
              )}
              {main.uPhiVc !== null && <Answer id={id('xb')} label="x where Vu = φVc" value={main.uPhiVc / 12} unit="ft" abs={0.03} compact />}
              {main.uHalf !== null && <Answer id={id('xc')} label="x where Vu = φVc/2" value={main.uHalf / 12} unit="ft" abs={0.03} compact />}
              <Answer id={id('tot')} label="total stirrups (auto layout)" value={dsg.total} abs={0.4} compact />
            </div>
            <div className="space-y-2">
              <CaseChart Vu={main.Vd} phiVc={dsg.lim.phiVc} />
              {dsg.layouts[main.id].zones.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Zone table — given the spacings, how far does each zone go?</div>
                  <CheckTable
                    rows={dsg.layouts[main.id].zones.map((z, i) => ({ k: `z${i}`, s: z.s, n: z.n, to: z.to }))}
                    rowKey={(r) => r.k}
                    given={[
                      { label: 'zone', get: (r) => r.k.replace('z', '') },
                      { label: 's (in)', get: (r) => fmt(r.s, 1) },
                    ]}
                    cols={ZONE_COLS}
                    idp={id('zones')}
                  />
                  <div className="text-[11px] text-faint mt-1">First stirrup at {fmt(dsg.layouts[main.id].first, 1)} in. A zone stops where the next spacing becomes adequate (that space centred on the point); the last one within s/2 of the end of the required region.</div>
                </div>
              )}
            </div>
          </div>
          <Section title="Your stirrup layout" sub="Edit spaces and spacings; red = a spacing wider than required at the middle of that space.">
            <div className="rounded-xl bg-bg/60 border border-line p-2 mb-3">
              <SpacingChart dsg={dsg} layouts={layouts} />
              <StirrupSketch dsg={dsg} layouts={layouts} h={p.sw ? p.h : undefined} />
            </div>
            <LayoutEditor dsg={dsg} custom={custom} setCustom={setCustom} />
            <p className="text-sm mt-2">
              Total {runsTotal(dsg, layouts)} stirrups ·{' '}
              {distinctRuns(dsg)
                .map(({ run }) => `${run.label}: ${layoutText(layouts[run.id])}`)
                .join(' · ')}
            </p>
          </Section>
          <Reveal id={id('sol')} title="Full solution (as you would write it)">
            <ShearSolution bm={bm} sec={sec} dsg={dsg} layouts={layouts} barLabel={barLabel} />
          </Reveal>
        </>
      )}
    </div>
  )
}
