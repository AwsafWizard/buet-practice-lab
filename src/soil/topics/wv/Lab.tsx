// Weight–volume lab: pick what is known, enter values (or 🎲 an exam specimen), watch the block diagram fill
// step by step (AJK sir's way), check e, n, S, w and the unit weights, then the formula route; Dr gauge.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Callout, Choice, Reveal, Section, Seg, Tex } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { ALL_KEYS, cylinderVolume, drClass, drIndex, DR_LAMBE, formulaRoute, nf, PERCENT_KEYS, PHASE_NAME, PHASE_TEX, relDensity, solvePhase, unitOf, unitSys, UNIT_SYSTEMS, type PhaseKey, type UnitSys } from '../../engine/phase'
import { markUsed } from '../../reference/pane'
import { DrGauge, PhaseBlocks, PhaseStepsView } from './figs'

export interface KnownRow {
  key: PhaseKey
  /** value in display units (% for ratios) */
  v: number
}
export interface WvIn {
  u: UnitSys['key']
  rows: KnownRow[]
  cyl: { on: boolean; D: number; H: number; inch: boolean }
  story?: string
}

export const WV_DEFAULT: WvIn = {
  u: 'g',
  rows: [
    { key: 'W', v: 186.5 },
    { key: 'Ws', v: 160 },
    { key: 'Gs', v: 2.65 },
  ],
  cyl: { on: true, D: 1.5, H: 3, inch: true },
  story: '2023-24 Q1(a): UCS specimen 1.5 in diameter × 3.0 in high, wet 186.5 g, dry 160.0 g, Gs = 2.65. Find w, S, γ, γd (g/cc), e and n. Is γ = γsat? Comment.',
}

/** givens in engine units (fractions) */
export function givensOf(p: WvIn): Partial<Record<PhaseKey, number>> {
  const g: Partial<Record<PhaseKey, number>> = {}
  for (const r of p.rows) if (Number.isFinite(r.v)) g[r.key] = PERCENT_KEYS.includes(r.key) ? r.v / 100 : r.v
  if (p.cyl.on && p.u === 'g') g.V = cylinderVolume(p.cyl.D, p.cyl.H, p.cyl.inch)
  return g
}

// ---------------------------------------------------------------- 🎲 exam-style specimens
const r2 = (v: number, n = 2) => Math.round(v * 10 ** n) / 10 ** n
export function randomWv(seed: number): WvIn {
  const r = rng(seed)
  const t = pick(r, ['ucs', 'ucs', 'das32', 'das34', 'field', 'eS', 'nw'])
  const Gs = r2(2.6 + 0.12 * r(), 2)
  if (t === 'ucs') {
    const D = pick(r, [1.4, 1.5, 2.0, 2.8])
    const H = 2 * D
    const e = 0.45 + 0.4 * r()
    const S = r() < 0.5 ? 1 : 0.8 + 0.18 * r()
    const V = cylinderVolume(D, H)
    const Vs = V / (1 + e)
    const Ws = r2(Gs * Vs, 1)
    const W = r2(Ws + S * e * Vs, 1)
    return { u: 'g', rows: [{ key: 'W', v: W }, { key: 'Ws', v: Ws }, { key: 'Gs', v: Gs }], cyl: { on: true, D, H, inch: true }, story: `Unconfined compression specimen ${D} in diameter × ${H} in high; wet ${W} g, oven-dry ${Ws} g, Gs = ${Gs}. Find w, S, γ and γd (g/cc), e, n. Is γ = γsat?` }
  }
  if (t === 'das32') {
    const V = pick(r, [0.8, 1.0, 1.2, 1.5])
    const e = 0.45 + 0.25 * r()
    const Vs = V / (1 + e)
    const w = r2(6 + 8 * r(), 1)
    const Ws = Gs * 1000 * Vs
    return { u: 'kg', rows: [{ key: 'V', v: V }, { key: 'W', v: Math.round(Ws * (1 + w / 100)) }, { key: 'w', v: w }, { key: 'Gs', v: Gs }], cyl: { on: false, D: 1.5, H: 3, inch: true }, story: `Das Ex. 3.2 type: a moist soil of ${V} m³ has a mass of ${Math.round(Ws * (1 + w / 100))} kg at w = ${w} %, Gs = ${Gs}. Find ρ, ρd, e, n, S and the volume of water.` }
  }
  if (t === 'das34') {
    const gd = Math.round(95 + 20 * r())
    const w = r2(18 + 10 * r(), 1)
    return { u: 'lb', rows: [{ key: 'gd', v: gd }, { key: 'w', v: w }, { key: 'S', v: 100 }], cyl: { on: false, D: 1.5, H: 3, inch: true }, story: `Das Ex. 3.4 type: a saturated soil has γd = ${gd} pcf and w = ${w} %. Find γsat, Gs and e.` }
  }
  if (t === 'field') {
    const e = 0.5 + 0.35 * r()
    const w = r2(((0.45 + 0.45 * r()) * e * 100) / Gs, 1)
    const g = r2(((Gs + (w / 100) * Gs) * 9.81) / (1 + e), 2)
    return { u: 'kN', rows: [{ key: 'g', v: g }, { key: 'w', v: w }, { key: 'Gs', v: Gs }], cyl: { on: false, D: 1.5, H: 3, inch: true }, story: `2017-18 Q5(b) type: a sand above the water table has w = ${w} % and γ = ${g} kN/m³, Gs = ${Gs}. Find e, S, γd and γsat.` }
  }
  if (t === 'eS') {
    const e = r2(0.5 + 0.5 * r(), 2)
    const S = Math.round(50 + 45 * r())
    return { u: 't', rows: [{ key: 'e', v: e }, { key: 'S', v: S }, { key: 'Gs', v: Gs }], cyl: { on: false, D: 1.5, H: 3, inch: true }, story: `A soil has e = ${e}, S = ${S} %, Gs = ${Gs}. Find w, ρ, ρd, ρsat (t/m³) and n.` }
  }
  const n = Math.round(30 + 15 * r())
  const w = r2(((0.3 + 0.6 * r()) * (n / (100 - n)) * 100) / Gs, 1)
  return { u: 'kN', rows: [{ key: 'n', v: n }, { key: 'w', v: w }, { key: 'Gs', v: Gs }], cyl: { on: false, D: 1.5, H: 3, inch: true }, story: `A soil has porosity ${n} % and water content ${w} %, Gs = ${Gs}. Find e, S, γ, γd and the percent air voids.` }
}

// ---------------------------------------------------------------- inputs
function Inputs({ p, set }: { p: WvIn; set: (o: Partial<WvIn>) => void }) {
  const u = unitSys(p.u)
  const used = new Set(p.rows.map((r) => r.key))
  const opts = ALL_KEYS.filter((k) => !(k === 'V' && p.cyl.on && p.u === 'g'))
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">units</span>
          <select className="field !py-0.5 !text-xs" value={p.u} onChange={(e) => set({ u: e.target.value as UnitSys['key'] })}>
            {UNIT_SYSTEMS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {p.u === 'g' && (
          <label className="inline-flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={p.cyl.on} onChange={(e) => set({ cyl: { ...p.cyl, on: e.target.checked } })} /> cylindrical specimen
          </label>
        )}
        {p.u === 'g' && p.cyl.on && (
          <>
            <NumIn label="D" value={p.cyl.D} onChange={(v) => set({ cyl: { ...p.cyl, D: v } })} step={0.1} w="w-14" />
            <NumIn label="H" value={p.cyl.H} onChange={(v) => set({ cyl: { ...p.cyl, H: v } })} step={0.1} w="w-14" />
            <Seg size="xs" value={p.cyl.inch ? 'in' : 'cm'} onChange={(v) => set({ cyl: { ...p.cyl, inch: v === 'in' } })} items={[{ v: 'in', label: 'inch' }, { v: 'cm', label: 'cm' }]} />
            <span className="text-xs text-faint num">V = πD²H/4 = {nf(cylinderVolume(p.cyl.D, p.cyl.H, p.cyl.inch), 5)} cm³{p.cyl.inch ? ' (1 in = 2.54 cm)' : ''}</span>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        {p.rows.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-line px-1.5 py-1">
            <select className="field !py-0.5 !text-xs" value={r.key} onChange={(e) => set({ rows: p.rows.map((x, j) => (j === i ? { ...x, key: e.target.value as PhaseKey } : x)) })}>
              {opts
                .filter((k) => k === r.key || !used.has(k))
                .map((k) => (
                  <option key={k} value={k}>
                    {k} — {PHASE_NAME[k]}
                  </option>
                ))}
            </select>
            <NumIn label="=" value={r.v} onChange={(v) => set({ rows: p.rows.map((x, j) => (j === i ? { ...x, v } : x)) })} step={PERCENT_KEYS.includes(r.key) ? 1 : 0.01} unit={unitOf(r.key, u)} w="w-20" />
            <button className="text-xs text-bad px-1" title="remove" onClick={() => set({ rows: p.rows.filter((_, j) => j !== i) })}>
              ✕
            </button>
          </span>
        ))}
        <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => set({ rows: [...p.rows, { key: opts.find((k) => !used.has(k)) ?? 'e', v: NaN }] })}>
          + known quantity
        </button>
      </div>
    </div>
  )
}

const CHECK_KEYS: PhaseKey[] = ['w', 'e', 'n', 'S', 'g', 'gd', 'gsat', 'Gs']

export function WvLab() {
  const [p, setP] = useState<WvIn>(WV_DEFAULT)
  const [k, setK] = useState(0)
  const set = (o: Partial<WvIn>) => {
    setP({ ...p, ...o, story: undefined })
    setK(0)
  }
  const u = unitSys(p.u)
  const given = useMemo(() => givensOf(p), [p])
  const sol = useMemo(() => solvePhase(given, u.gw), [given, u.gw])
  const key = hashKey(JSON.stringify(given) + p.u)
  const id = (s: string) => `sm-wv:lab:${key}:${s}`
  const nGiven = sol.steps.filter((s) => s.kind === 'given' || s.kind === 'basis').length
  const work = sol.steps.slice(nGiven)
  const shown = Math.min(k, work.length)
  const known = new Set<PhaseKey>(sol.steps.slice(0, nGiven + shown).map((s) => s.key))
  if (given.V !== undefined) known.add('V')
  const hot = shown > 0 ? work[shown - 1].key : undefined
  const v = sol.vals
  const ok = sol.status === 'ok'
  const satEq = ok && Math.abs(v.S - 1) < 0.005
  useEffect(() => {
    if (ok) markUsed('c-phase', { e: +v.e.toFixed(3), S: +(v.S * 100).toFixed(1), w: +(v.w * 100).toFixed(2), Gs: +v.Gs.toFixed(3) })
  })
  const unitWord = u.mass ? 'density' : 'unit weight'
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            setP(randomWv(Math.floor(Math.random() * 1e9)))
            setK(0)
          }}
        >
          🎲 Exam-style specimen
        </button>
        <button className="text-sm text-accent underline" onClick={() => (setP(WV_DEFAULT), setK(0))}>
          reset (2023-24 Q1(a))
        </button>
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{p.story}</div>}
      <Inputs p={p} set={set} />
      {sol.status !== 'ok' ? (
        <Callout kind={sol.status === 'under' ? 'note' : 'trap'} title={sol.status === 'under' ? 'Need more data' : sol.status === 'inconsistent' ? 'Contradicting data' : 'Check the inputs'}>
          {sol.msg}
        </Callout>
      ) : (
        <>
          <div className="grid cq-lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
            <div className="rounded-xl bg-bg/60 border border-line p-2">
              <PhaseBlocks vals={v} known={known} hot={hot} u={u} />
              <div className="flex flex-wrap items-center gap-2 px-2 pb-1">
                <button className="btn !py-1 !px-2.5" disabled={shown >= work.length} onClick={() => setK(shown + 1)}>
                  Next block ▸
                </button>
                <button className="btn !py-1 !px-2.5" onClick={() => setK(work.length)}>
                  Fill all
                </button>
                <button className="text-xs text-accent underline" onClick={() => setK(0)}>
                  start again
                </button>
                <span className="text-xs text-faint">
                  {shown}/{work.length} steps{sol.basis ? ` · basis ${sol.basis.key} = 1 (no size given)` : ''}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">The block-diagram working</div>
              <PhaseStepsView steps={[...sol.steps.slice(0, nGiven), ...work.slice(0, shown)]} upto={shown ? nGiven + shown : undefined} u={u} />
              {shown < work.length && <div className="text-xs text-faint mt-2">Say the next block out loud before you press “Next”.</div>}
            </div>
          </div>
          <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-3 space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints ({u.g} for the {unitWord}s)</div>
              {CHECK_KEYS.filter((q) => given[q] === undefined).map((q) => (
                <Answer key={q} id={id(q)} label={<span>{PHASE_NAME[q]} <Tex>{PHASE_TEX[q]}</Tex></span>} value={PERCENT_KEYS.includes(q) ? v[q] * 100 : v[q]} unit={unitOf(q, u)} digits={4} compact />
              ))}
              <Choice
                id={id('sat')}
                label={`Is the moist ${unitWord} equal to the saturated one?`}
                options={[
                  { v: 'yes', label: 'Yes — S = 100 %' },
                  { v: 'no', label: 'No — there is air' },
                ]}
                answer={satEq ? 'yes' : 'no'}
              />
            </div>
            <div className="rounded-xl border border-line p-3 text-sm space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Formula route (check only)</div>
              <Reveal id={id('route')} title="Se = wGs and the γ formulas" tone="mute">
                <div className="space-y-1">
                  {formulaRoute(v, u.gw).map((l) => (
                    <div key={l.key} className="overflow-x-auto">
                      <Tex>{l.tex}</Tex>
                    </div>
                  ))}
                  <p className="text-xs text-faint">Same numbers as the diagram — AJK sir wants the diagram on the script; these are for checking.</p>
                </div>
              </Reveal>
              <div className="text-xs text-mute">
                Comment: S = {fmt(v.S * 100, 1)} %{satEq ? ' → fully saturated, so γ = γsat and Va = 0.' : v.S > 1.005 ? ' → over 100 %: the data are impossible (check Gs or the masses).' : ` → partly saturated, γ < γsat (= ${nf(v.gsat, 4)} ${u.g}).`}
              </div>
            </div>
          </div>
          <Reveal id={id('sol')} title="Full solution (as you would write it)">
            <PhaseStepsView steps={sol.steps} u={u} />
          </Reveal>
          <DrCard e={v.e} Gs={v.Gs} />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- relative density gauge
function DrCard({ e: eLab, Gs: gsLab }: { e: number; Gs: number }) {
  const [src, setSrc] = useState<'lab' | 'own'>('lab')
  const [mode, setMode] = useState<'e' | 'g'>('e')
  const [scale, setScale] = useState<'slide' | 'lambe'>('slide')
  const [eOwn, setEOwn] = useState(0.6)
  const [emax, setEmax] = useState(0.85)
  const [emin, setEmin] = useState(0.5)
  const [gmin, setGmin] = useState(13.34)
  const [gmax, setGmax] = useState(21.4)
  const [Gs, setGs] = useState(2.67)
  const e = src === 'lab' ? eLab : eOwn
  const G = src === 'lab' ? gsLab : Gs
  const r = mode === 'e' ? relDensity({ e, emax, emin }) : relDensity({ e, gdMin: gmin, gdMax: gmax, Gs: G, gw: 9.81 })
  useEffect(() => {
    markUsed('c-dr', { cls: drIndex(r.pct) })
  })
  return (
    <Section title="Relative density gauge" sub="Dr tells how dense a sand is between its loosest (e_max) and densest (e_min) lab states.">
      <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
        <Seg size="xs" value={src} onChange={setSrc} items={[{ v: 'lab', label: 'e from the diagram' }, { v: 'own', label: 'my own e' }]} />
        {src === 'own' && <NumIn label="e" value={eOwn} onChange={setEOwn} step={0.01} w="w-16" />}
        <Seg size="xs" value={mode} onChange={setMode} items={[{ v: 'e', label: 'limits as e' }, { v: 'g', label: 'limits as γd (kN/m³)' }]} />
        {mode === 'e' ? (
          <>
            <NumIn label="e_max" value={emax} onChange={setEmax} step={0.01} w="w-16" />
            <NumIn label="e_min" value={emin} onChange={setEmin} step={0.01} w="w-16" />
          </>
        ) : (
          <>
            <NumIn label="γd,min" value={gmin} onChange={setGmin} step={0.1} w="w-16" />
            <NumIn label="γd,max" value={gmax} onChange={setGmax} step={0.1} w="w-16" />
            {src === 'own' && <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-16" />}
          </>
        )}
        <Seg size="xs" value={scale} onChange={setScale} items={[{ v: 'slide', label: 'slide scale' }, { v: 'lambe', label: '15/35/65/85 scale' }]} />
      </div>
      <DrGauge Dr={r.pct} scale={scale} />
      <div className="text-sm num mt-1">
        {mode === 'g' && (
          <>
            e_max = Gsγw/γd,min − 1 = {nf(r.emax, 4)}, e_min = {nf(r.emin, 4)} ·{' '}
          </>
        )}
        Dr = ({nf(r.emax, 4)} − {nf(r.e, 4)})/({nf(r.emax, 4)} − {nf(r.emin, 4)}) = <b>{nf(r.pct, 4)} %</b> → {scale === 'slide' ? r.cls : drClass(r.pct, DR_LAMBE)}
      </div>
    </Section>
  )
}
