// Proctor lab (edit or 🎲 test points → curve, peak, ZAV, energy toggle) and the field-spec checker (2017-18 Q5 style).

import { useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Choice, Md, Reveal, Seg, Tex } from '../../../components/ui'
import { CheckTable, hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, useSeed } from '../../../labs/common'
import { StatusBox } from '../../../labs/playground'
import { NumIn } from '../../../reference/common'
import { checkSpec, fieldTest, gdAtS, modelCurve, monotoneCubic, proctorCurve, proctorPeak, satOf, shiftForEnergy, zav, type Pt } from '../../engine/compaction'
import { markUsed, openSmRef } from '../../reference/pane'
import { CompactionChart, GWU, UNIT_LABEL, type FieldPt, type GUnit, type Series } from './figs'

const f1 = (v: number) => fmt(v, 1)
const f3 = (v: number) => fmt(v, 3)
const pct = (w: number) => fmt(w * 100, 2)

export interface PSet {
  label: string
  unit: GUnit
  Gs: number
  std: Pt[]
  mod?: Pt[]
  note?: string
}
const P = (w: number[], g: number[]) => w.map((x, k) => ({ w: x / 100, gd: g[k] }))
export const PROCTOR_SETS: PSet[] = [
  { label: '2017-18 Q5(a)', unit: 't', Gs: 2.64, std: P([9.3, 11.8, 14.3, 17.6, 20.8, 23.0], [1.691, 1.715, 1.755, 1.747, 1.685, 1.619]), mod: P([9.3, 12.8, 15.5, 18.7, 21.1], [1.873, 1.91, 1.803, 1.699, 1.641]) },
  { label: 'Jan 2021 Q2(b) (Modified only)', unit: 'kN', Gs: 2.7, std: P([5.9, 9.6, 11.5, 14.2, 15.2, 17.4], [16.54, 17.03, 17.18, 17.06, 16.88, 16.52]), note: 'This set is a Modified test; Gs is not given, 2.70 is assumed for the ZAV line.' },
  { label: 'Das Ex 4.3 (Lecture 6)', unit: 'kN', Gs: 2.7, std: P([6, 8, 9, 11, 12, 14], [14.8, 17.45, 18.52, 18.9, 18.5, 16.9]), note: 'Gs assumed 2.70 for the ZAV line.' },
]

export function randomSet(seed: number): PSet {
  const r = rng(seed * 3571 + 11)
  const Gs = pick(r, [2.65, 2.67, 2.7, 2.72, 2.74])
  const unit: GUnit = pick(r, ['kN', 'kN', 't'])
  const gw = GWU[unit]
  const omc = randInt(r, 10, 22) / 100
  const S = randInt(r, 78, 88) / 100
  const mdd = gdAtS(omc, Gs, S, gw)
  const pk = { omc, mdd }
  const m = shiftForEnergy(pk, Gs, 4.55, gw)
  const mk = (p: { omc: number; mdd: number }, n: number) => {
    const w0 = p.omc - randInt(r, 5, 7) / 100
    const dw = randInt(r, 20, 30) / 1000
    return Array.from({ length: n }, (_, k) => {
      const w = Math.round((w0 + k * dw) * 1000) / 1000
      const g = modelCurve(p, Gs, w, gw) * (1 + (r() - 0.5) * 0.006)
      return { w, gd: unit === 't' ? Math.round(g * 1000) / 1000 : Math.round(g * 100) / 100 }
    })
  }
  return { label: '🎲 random soil', unit, Gs, std: mk(pk, randInt(r, 5, 6)), mod: mk(m, 5) }
}

function PointTable({ pts, onChange, unit }: { pts: Pt[]; onChange: (p: Pt[]) => void; unit: GUnit }) {
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto text-sm">
        <tbody>
          <tr>
            <th>w (%)</th>
            {pts.map((p, k) => (
              <td key={k}>
                <input className="field w-16 !py-0.5 num" type="number" step={0.1} value={+(p.w * 100).toFixed(2)} onChange={(e) => onChange(pts.map((q, i) => (i === k ? { ...q, w: +e.target.value / 100 } : q)))} />
              </td>
            ))}
            <td rowSpan={2}>
              <div className="flex flex-col gap-1">
                <button className="btn !py-0 !px-2 !text-xs" onClick={() => onChange([...pts, { w: pts[pts.length - 1].w + 0.02, gd: pts[pts.length - 1].gd * 0.97 }])}>
                  +
                </button>
                {pts.length > 3 && (
                  <button className="btn !py-0 !px-2 !text-xs" onClick={() => onChange(pts.slice(0, -1))}>
                    −
                  </button>
                )}
              </div>
            </td>
          </tr>
          <tr>
            <th>γd ({UNIT_LABEL[unit]})</th>
            {pts.map((p, k) => (
              <td key={k}>
                <input className="field w-16 !py-0.5 num" type="number" step={unit === 't' ? 0.005 : 0.05} value={p.gd} onChange={(e) => onChange(pts.map((q, i) => (i === k ? { ...q, gd: +e.target.value } : q)))} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function PeakSolution({ set, pts, name }: { set: PSet; pts: Pt[]; name: string }) {
  const pk = proctorPeak(pts)
  const gw = GWU[set.unit]
  const [a, b, c] = pk.used
  const dg = set.unit === 't' ? 3 : 2
  return (
    <div className="space-y-1 text-sm">
      <Md>{`**${name}.** Highest point (${pct(b.w)} %, ${fmt(b.gd, dg)}); parabola through it and its neighbours (${pct(a.w)}, ${fmt(a.gd, dg)}), (${pct(c.w)}, ${fmt(c.gd, dg)}):
$$\\gamma_d = ${fmt(pk.a, 2)}w^2 + ${fmt(pk.b, 3)}w + ${fmt(pk.c, 4)}\\quad(w\\text{ as a fraction})$$
Vertex: $\\text{OMC} = -b/2a = ${pct(pk.omc)}\\ \\%$, $\\text{MDD} = ${fmt(pk.mdd, dg + 1)}$ ${UNIT_LABEL[set.unit]}. On the plotted curve the peak reads the same to the accuracy of a hand plot. At the peak $S = wG_s/e = ${fmt(satOf(pk.omc, pk.mdd, set.Gs, gw) * 100, 1)}$ %.${pk.bracketed ? '' : ' (The highest point is at the end of the data: the peak is not bracketed, add a point beyond it.)'}`}</Md>
    </div>
  )
}

export function ProctorLab() {
  const [set, setSet] = useState<PSet>(PROCTOR_SETS[0])
  const [view, setView] = useState<'std' | 'both'>('both')
  const { seed, next } = useSeed(2)
  const gw = GWU[set.unit]
  const pk = proctorPeak(set.std)
  const curve = proctorCurve(set.std)
  const modPts = set.mod
  const est = !modPts ? shiftForEnergy(pk, set.Gs, 4.55, gw) : null
  const mpk = modPts ? proctorPeak(modPts) : est!
  const mcurve = modPts ? proctorCurve(modPts) : monotoneCubic(Array.from({ length: 9 }, (_, k) => ({ w: est!.omc + (k - 4) * 0.02, gd: modelCurve(est!, set.Gs, est!.omc + (k - 4) * 0.02, gw) })))
  const series: Series[] = [{ pts: set.std, curve, color: 'var(--c-accent)', label: set.label.startsWith('Jan') ? 'Modified' : 'Standard', peak: pk }]
  if (view === 'both' && !set.label.startsWith('Jan')) series.push({ pts: modPts ?? [], curve: mcurve, color: 'var(--c-load)', label: modPts ? 'Modified' : 'Modified (estimated)', peak: mpk, faint: !modPts })
  markUsed('w-proctor', { energy: view === 'both' ? 'mod' : 'std' })
  const id = (k: string) => `sm-comp:lab:proctor:${hashKey(JSON.stringify(set))}:${k}`
  const dg = set.unit === 't' ? 3 : 2
  const ws = [...new Set([...set.std, ...(modPts ?? [])].map((p) => p.w))].sort((a, b) => a - b)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className="field !py-1 !text-sm" value={PROCTOR_SETS.findIndex((s) => s.label === set.label)} onChange={(e) => +e.target.value >= 0 && setSet(PROCTOR_SETS[+e.target.value])}>
          {PROCTOR_SETS.map((s, k) => (
            <option key={k} value={k}>
              {s.label}
            </option>
          ))}
          {set.label.startsWith('🎲') && <option value={-1}>🎲 random soil</option>}
        </select>
        <button className="btn !py-1 !px-3" onClick={() => (next(), setSet(randomSet(seed + 1)))}>
          🎲 New test points
        </button>
        {!set.label.startsWith('Jan') && <Seg size="xs" value={view} onChange={setView} items={[{ v: 'std', label: 'Standard' }, { v: 'both', label: '+ Modified energy' }]} />}
        <NumIn label="Gs" value={set.Gs} onChange={(v) => Number.isFinite(v) && v > 2 && setSet({ ...set, Gs: v })} step={0.01} w="w-16" />
        <span className="text-xs text-faint">γd in {UNIT_LABEL[set.unit]}</span>
      </div>
      {set.note && <p className="text-xs text-faint">{set.note}</p>}
      <div className="rounded-xl border border-line bg-bg/60 p-2">
        <CompactionChart series={series} Gs={set.Gs} unit={set.unit} />
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-3">
        <div className="card p-3 space-y-2">
          <div className="text-sm font-semibold">{set.label.startsWith('Jan') ? 'Modified' : 'Standard'} test points (edit them)</div>
          <PointTable pts={set.std} unit={set.unit} onChange={(std) => setSet({ ...set, std })} />
          {modPts && view === 'both' && (
            <>
              <div className="text-sm font-semibold">Modified test points</div>
              <PointTable pts={modPts} unit={set.unit} onChange={(mod) => setSet({ ...set, mod })} />
            </>
          )}
          {view === 'both' && !set.label.startsWith('Jan') && (
            <p className="text-xs text-mute">
              {modPts ? 'Modified (≈ 4.55× the energy) sits up and to the left' : 'No Modified data: the dashed curve is the Standard peak moved along the line of optimums (S constant) to +9 % MDD, the shift 2017-18 Q5(a) shows'}: MDD {fmt(pk.mdd, dg)} → {fmt(mpk.mdd, dg)}, OMC {pct(pk.omc)} → {pct(mpk.omc)} %.
            </p>
          )}
        </div>
        <div className="card p-3 space-y-1">
          <div className="text-sm font-semibold">Read the curve</div>
          <Answer id={id('omc')} label="OMC (%)" value={pk.omc * 100} abs={0.4} tol={0} digits={1} />
          <Answer id={id('mdd')} label={`MDD (${UNIT_LABEL[set.unit]})`} value={pk.mdd} tol={0.004} digits={dg} />
          <Answer id={id('zav')} label={`γzav at w = ${pct(ws[ws.length - 1])} %`} value={zav(ws[ws.length - 1], set.Gs, gw)} tol={0.003} digits={dg} />
          <Answer id={id('s')} label="S at the peak (%)" value={satOf(pk.omc, pk.mdd, set.Gs, gw) * 100} abs={1.5} tol={0} digits={1} />
          {view === 'both' && modPts && <Answer id={id('momc')} label="Modified OMC (%)" value={mpk.omc * 100} abs={0.4} tol={0} digits={1} />}
          {view === 'both' && modPts && <Answer id={id('mmdd')} label="Modified MDD" value={mpk.mdd} tol={0.004} digits={dg} />}
        </div>
      </div>
      <Reveal id={id('sol')} title="Full solution">
        <div className="space-y-2">
          <Md>{`**ZAV line** $\\gamma_{zav} = \\dfrac{G_s\\gamma_w}{1 + wG_s} = \\dfrac{${set.Gs} \\times ${gw}}{1 + ${set.Gs}w}$:`}</Md>
          <table className="tbl w-auto">
            <tbody>
              <tr>
                <th>w (%)</th>
                {ws.map((w) => (
                  <td key={w}>{pct(w)}</td>
                ))}
              </tr>
              <tr>
                <th>γzav</th>
                {ws.map((w) => (
                  <td key={w}>{fmt(zav(w, set.Gs, gw), dg)}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <PeakSolution set={set} pts={set.std} name={set.label.startsWith('Jan') ? 'Modified' : 'Standard'} />
          {modPts && <PeakSolution set={set} pts={modPts} name="Modified" />}
          <p className="text-sm">Every test point lies below the ZAV line (a point above it would mean a wrong Gs, w or γ). The wet side runs roughly parallel to it.</p>
        </div>
      </Reveal>
      <button className="chip hover:!border-load" onClick={() => openSmRef('w-proctor')}>
        Chart pane: Standard vs Modified ↗
      </button>
    </div>
  )
}

// ---------------------------------------------------------------- field-spec checker
interface FTest {
  V: number
  Wwet: number
  Wdry: number
}
interface SpecState {
  unit: GUnit
  ref: 'std' | 'mod'
  rcMin: number
  dw: number
  tests: FTest[]
  set: PSet
}
const SPEC_DEFAULT: SpecState = {
  unit: 't',
  ref: 'mod',
  rcMin: 0.95,
  dw: 0.02,
  tests: [
    { V: 946, Wwet: 1822, Wdry: 1703 },
    { V: 980, Wwet: 2083, Wdry: 1882 },
    { V: 957, Wwet: 1960, Wdry: 1675 },
  ],
  set: PROCTOR_SETS[0],
}

function randomSpec(seed: number): SpecState {
  const set = randomSet(seed)
  const r = rng(seed * 2027 + 5)
  const ref = set.mod && r() < 0.6 ? 'mod' : 'std'
  const pk = proctorPeak(ref === 'mod' ? set.mod! : set.std)
  const gw = GWU[set.unit]
  const rho = pk.mdd / gw // t/m³ = g/cm³
  const tests = Array.from({ length: randInt(r, 3, 4) }, () => {
    const w = pk.omc + (r() - 0.5) * 0.07
    const rd = rho * (0.9 + 0.12 * r())
    const V = randInt(r, 900, 1000)
    const Wdry = Math.round(rd * V)
    return { V, Wdry, Wwet: Math.round(Wdry * (1 + w)) }
  })
  return { unit: set.unit, ref, rcMin: pick(r, [0.9, 0.95, 0.95, 0.98]), dw: pick(r, [0.015, 0.02, 0.02]), tests, set }
}

export function SpecLab() {
  const [s, setS] = useState<SpecState>(SPEC_DEFAULT)
  const { seed, next } = useSeed(4)
  const gw = GWU[s.set.unit]
  const refPts = s.ref === 'mod' && s.set.mod ? s.set.mod : s.set.std
  const pk = proctorPeak(refPts)
  const spec = { mdd: pk.mdd / gw, omc: pk.omc, rcMin: s.rcMin, dw: s.dw } // in g/cm³ (masses in g, volumes in cm³)
  const rows = s.tests.map((t, k) => {
    const f = fieldTest(t)
    return { k, ...f, ...checkSpec(f.gd, f.w, spec) }
  })
  const field: FieldPt[] = rows.map((r) => ({ w: r.w, gd: r.gd * gw, label: `${r.k + 1}`, pass: r.pass }))
  const series: Series[] = [{ pts: refPts, curve: proctorCurve(refPts), color: s.ref === 'mod' ? 'var(--c-load)' : 'var(--c-accent)', label: s.ref === 'mod' ? 'Modified' : 'Standard', peak: pk }]
  const idp = `sm-comp:lab:spec:${hashKey(JSON.stringify(s))}`
  const setTest = (k: number, q: Partial<FTest>) => setS({ ...s, tests: s.tests.map((t, i) => (i === k ? { ...t, ...q } : t)) })
  const dg = s.set.unit === 't' ? 3 : 2
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn !py-1 !px-3" onClick={() => setS(SPEC_DEFAULT)}>
          2017-18 Q5(a)(ii)–(iii)
        </button>
        <button className="btn !py-1 !px-3" onClick={() => (next(), setS(randomSpec(seed + 1)))}>
          🎲 New site
        </button>
        <span className="text-sm text-mute">reference</span>
        <Seg size="xs" value={s.ref} onChange={(ref) => setS({ ...s, ref: ref === 'mod' && !s.set.mod ? 'std' : ref })} items={[{ v: 'std', label: 'Standard' }, { v: 'mod', label: 'Modified' }]} />
        <NumIn label="RC ≥" value={+(s.rcMin * 100).toFixed(1)} onChange={(v) => Number.isFinite(v) && setS({ ...s, rcMin: v / 100 })} step={1} unit="%" w="w-14" />
        <NumIn label="w = OMC ±" value={+(s.dw * 100).toFixed(1)} onChange={(v) => Number.isFinite(v) && setS({ ...s, dw: v / 100 })} step={0.5} unit="%" w="w-14" />
      </div>
      <div className="rounded-xl border border-line bg-bg/60 p-2">
        <CompactionChart series={series} Gs={s.set.Gs} unit={s.set.unit} field={field} spec={{ lo: spec.omc - s.dw, hi: spec.omc + s.dw, gdMin: s.rcMin * pk.mdd }} sLines={[]} />
      </div>
      <div className="card p-3 space-y-2">
        <div className="text-sm font-semibold">Field tests (volume cm³, wet and dry mass g) — edit them</div>
        <div className="flex flex-wrap gap-3">
          {s.tests.map((t, k) => (
            <div key={k} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line px-2 py-1">
              <span className="font-bold text-sm">{k + 1}</span>
              <NumIn label="V" value={t.V} onChange={(v) => Number.isFinite(v) && v > 0 && setTest(k, { V: v })} step={1} w="w-16" />
              <NumIn label="wet" value={t.Wwet} onChange={(v) => Number.isFinite(v) && setTest(k, { Wwet: v })} step={1} w="w-16" />
              <NumIn label="dry" value={t.Wdry} onChange={(v) => Number.isFinite(v) && v > 0 && setTest(k, { Wdry: v })} step={1} w="w-16" />
              {s.tests.length > 1 && (
                <button className="text-xs text-faint hover:text-bad" onClick={() => setS({ ...s, tests: s.tests.filter((_, i) => i !== k) })}>
                  ×
                </button>
              )}
            </div>
          ))}
          {s.tests.length < 6 && (
            <button className="btn !py-0.5 !px-2 !text-xs" onClick={() => setS({ ...s, tests: [...s.tests, { V: 950, Wwet: 1950, Wdry: 1760 }] })}>
              + test
            </button>
          )}
        </div>
        <CheckTable
          rows={rows}
          rowKey={(r) => String(r.k)}
          given={[{ label: 'test', get: (r) => String(r.k + 1) }]}
          cols={[
            { key: 'gb', label: 'ρb (g/cm³)', get: (r) => r.gb, abs: 0.004, digits: 3 },
            { key: 'w', label: 'w (%)', get: (r) => r.w * 100, abs: 0.1, digits: 2 },
            { key: 'gd', label: 'ρd (g/cm³)', get: (r) => r.gd, abs: 0.004, digits: 3 },
            { key: 'rc', label: 'RC (%)', get: (r) => r.rc * 100, abs: 0.3, digits: 1 },
          ]}
          idp={idp}
        />
        {rows.map((r) => (
          <Choice key={r.k} id={`${idp}:pass${r.k}`} label={`Test ${r.k + 1} meets the spec?`} options={[{ v: 'y', label: 'passes' }, { v: 'n', label: 'fails' }]} answer={r.pass ? 'y' : 'n'} />
        ))}
      </div>
      <Reveal id={`${idp}:sol`} title="Full solution">
        <div className="space-y-2 text-sm">
          <Md>{`Reference (${s.ref === 'mod' ? 'Modified' : 'Standard'} peak): MDD = ${fmt(pk.mdd, dg)} ${UNIT_LABEL[s.set.unit]}${s.set.unit === 'kN' ? ` (${f3(spec.mdd)} t/m³)` : ''}, OMC = ${pct(pk.omc)} %. Limits: $\\rho_d \\ge ${s.rcMin} \\times ${f3(spec.mdd)} = ${f3(s.rcMin * spec.mdd)}$ g/cm³ and $w = ${pct(spec.omc - s.dw)}$ to $${pct(spec.omc + s.dw)}$ %. For each test $\\rho_b = W/V$, $w = (W - W_d)/W_d$, $\\rho_d = W_d/V$.`}</Md>
          {rows.map((r) => (
            <StatusBox key={r.k} c={r.pass ? 'var(--c-good)' : 'var(--c-bad)'} t={`Test ${r.k + 1}: ρb = ${f3(r.gb)}, w = ${pct(r.w)} %, ρd = ${f3(r.gd)} g/cm³, RC = ${f1(r.rc * 100)} % → ${r.pass ? 'passes' : 'fails'}`} d={r.pass ? 'dense enough and inside the water-content window' : r.why.join('; ')} />
          ))}
          <p className="text-xs text-faint">
            The plotted × marks show the same: a passing test sits inside the green window (above the RC line and between the w limits).
          </p>
        </div>
      </Reveal>
      <p className="text-xs text-faint">
        <Tex>{`RC = \\rho_{d,field}/\\rho_{d,max}`}</Tex>; a test can fail on density, on water content, or both. Masses in g and volumes in cm³ give g/cm³ = t/m³.
      </p>
    </div>
  )
}

