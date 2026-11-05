// Classification lab: sieve table (or % finer, or given D's) → grading curve with D10/D30/D60 → USCS step-through
// (Table 5.2 path + group-name chart) and AASHTO step-through (left-to-right elimination + GI) → USDA triangle.
import { useEffect, useMemo, useState } from 'react'
import { Answer, Callout, Choice, Md, Reveal, Section, Seg, Tex } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { aashto, ccOf, cuOf, grading, gradeOf, sieveAnalysis, sieveName, SIEVES, usda, uscs, type GradPt, type SieveLine } from '../../engine/classify'
import { nf } from '../../engine/phase'
import { chartZone } from '../../engine/plasticity'
import { AashtoFig52, PlasticityChart, UsdaTriangle } from '../../reference/idx'
import { markUsed } from '../../reference/pane'
import { AashtoGrid, GradingCurve, UscsPath } from './figs'

export interface ClassIn {
  mode: 'sieve' | 'pf'
  sieve: { d: number; ret: number }[]
  pan: number
  pf: GradPt[]
  /** D's given directly by the question (mm) */
  Dgiven: { on: boolean; D10: number; D30: number; D60: number }
  LL: number
  PL: number
  NP: boolean
  LLoven: number
  story?: string
}

const base = { Dgiven: { on: false, D10: NaN, D30: NaN, D60: NaN }, LLoven: NaN, NP: false, pan: 0, sieve: [] as { d: number; ret: number }[], pf: [] as GradPt[] }
export const CLASS_PRESETS: { id: string; label: string; p: ClassIn }[] = [
  {
    id: '2324',
    label: '2023-24 Q4(a) sieve analysis',
    p: {
      ...base,
      mode: 'sieve',
      sieve: [
        { d: 4.75, ret: 0 },
        { d: 2.0, ret: 40 },
        { d: 0.85, ret: 60 },
        { d: 0.425, ret: 89 },
        { d: 0.25, ret: 140 },
        { d: 0.18, ret: 122 },
        { d: 0.15, ret: 210 },
        { d: 0.075, ret: 56 },
      ],
      pan: 12,
      LL: NaN,
      PL: NaN,
      NP: true,
      story: '2023-24 Q4(a): draw the grading curve, find % gravel / sand / fines by AASHTO and USCS, Cu and Cc, and say whether it is well, poorly or gap graded.',
    },
  },
  {
    id: '2122',
    label: '2021-22 Q6(b) (% passing, LL 23, PL 19)',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 100 },
        { d: 2.0, pf: 90 },
        { d: 0.85, pf: 64 },
        { d: 0.425, pf: 38 },
        { d: 0.18, pf: 18 },
        { d: 0.075, pf: 13 },
      ],
      LL: 23,
      PL: 19,
      story: '2021-22 Q6(b): inorganic soil, LL 23, PL 19. Classify by AASHTO (Table 1) and USCS (Table 2, Chart 1); give the group symbol and name.',
    },
  },
  {
    id: '1718b',
    label: '2017-18 Q2(b) soil B',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 92 },
        { d: 2.0, pf: 60 },
        { d: 0.425, pf: 30 },
        { d: 0.075, pf: 10 },
      ],
      LL: 37,
      PL: 26,
      story: '2017-18 Q2(b) soil B: % finer No. 4 92, No. 10 60, No. 40 30, No. 200 10; LL 37, PL 26 (inorganic). USCS?',
    },
  },
  {
    id: '0708',
    label: '2007-08 Q3(a)',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 60 },
        { d: 0.425, pf: 30 },
        { d: 0.075, pf: 10 },
      ],
      LL: 45,
      PL: 21,
      story: '2007-08 Q3(a): passing No. 200 10 %, No. 40 30 %, No. 4 60 %; LL 45, PL 21. Classify by USCS.',
    },
  },
  {
    id: 'das56',
    label: 'Das Ex 5.6 (slides 38–39)',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 70 },
        { d: 0.075, pf: 30 },
      ],
      LL: 33,
      PL: 12,
      story: 'Das Example 5.6: 70 % passes No. 4, 30 % passes No. 200, LL 33, PL 12. Group symbol and group name (USCS).',
    },
  },
  {
    id: '1516',
    label: '2015-16 Q5 (organic check)',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 98 },
        { d: 2.0, pf: 80 },
        { d: 0.425, pf: 70 },
        { d: 0.075, pf: 52 },
      ],
      LL: 55,
      PL: 33,
      LLoven: 45,
      story: '2015-16 Q5: LL air-dried 55, oven-dried 45, PL 33. Organic or inorganic? Classify by USCS and AASHTO.',
    },
  },
  {
    id: '2021a',
    label: '2020-21 Q6(a) soil B (D’s given)',
    p: {
      ...base,
      mode: 'pf',
      pf: [
        { d: 4.75, pf: 92 },
        { d: 0.075, pf: 10 },
      ],
      Dgiven: { on: true, D10: 0.08, D30: 0.5, D60: 1.8 },
      LL: 38,
      PL: 27,
      story: '2020-21 Q6(a) soil B: % finer No. 4 = 92, No. 200 = 10; D60 = 1.8, D30 = 0.5, D10 = 0.08 mm; LL 38, PL 27 (fines). USCS?',
    },
  },
  {
    id: '1112',
    label: '2011-12 Q2(a) soil A curve',
    p: {
      ...base,
      mode: 'pf',
      pf: [50, 40, 30, 25, 20, 15, 12, 10, 8, 6, 4.75, 3, 2, 1.16, 0.85, 0.425, 0.075].map((d, i) => ({ d, pf: [100, 98, 91, 84, 75, 64, 56, 50, 42, 35, 30, 22, 16, 10, 7.6, 4.4, 0.5][i] })),
      NP: true,
      LL: NaN,
      PL: NaN,
      story: '2011-12 Q2(a) soil A (curve digitised from Fig. 1): classify by USCS.',
    },
  },
]

type PfRow = SieveLine & { k: string }
const PF_COLS: CheckCol<PfRow>[] = [{ key: 'pf', label: '% finer', get: (r) => r.pf, abs: 0.05, digits: 2 }]

export function ClassLab() {
  const [p, setP] = useState<ClassIn>(CLASS_PRESETS[1].p)
  const [preset, setPreset] = useState('2122')
  const set = (o: Partial<ClassIn>) => setP({ ...p, ...o, story: undefined })
  const sa = useMemo(() => sieveAnalysis(p.sieve, p.pan), [p.sieve, p.pan])
  const pts = p.mode === 'sieve' ? sa.pts : p.pf
  const g = useMemo(() => grading(pts), [pts])
  const D = p.Dgiven.on ? { D10: p.Dgiven.D10, D30: p.Dgiven.D30, D60: p.Dgiven.D60 } : { D10: g.D10, D30: g.D30, D60: g.D60 }
  const Cu = cuOf(D.D60, D.D10)
  const Cc = ccOf(D.D10, D.D30, D.D60)
  const PI = p.NP ? 0 : p.LL - p.PL
  const topD = Math.max(...pts.map((q) => q.d))
  const F4min = !Number.isFinite(g.P4) && topD < 4.75 ? Math.max(...pts.map((q) => q.pf)) : undefined
  const u = uscs({ F200: g.P200, F4: g.P4, F4min, LL: p.LL, PL: p.PL, NP: p.NP, Cu, Cc, LLoven: Number.isFinite(p.LLoven) ? p.LLoven : undefined })
  const a = aashto({ P10: g.P10, P40: g.P40, P200: g.P200, LL: p.LL, PI, NP: p.NP })
  const key = hashKey(JSON.stringify(p))
  const id = (s: string) => `sm-class:lab:${key}:${s}`
  const okF = Number.isFinite(g.P200)
  useEffect(() => {
    if (!okF) return
    markUsed('c-uscs', { rows: u.rows.join(',') })
    markUsed('c-uscs-names', { symbol: u.symbol, branch: u.branch })
    markUsed('c-aashto', { group: a.group })
    markUsed('c-sizes', { org: 'USCS,AASHTO' })
    if (!p.NP && Number.isFinite(PI)) markUsed('c-plchart', { LL: p.LL, PI })
  })
  const symOpts = useMemo(() => symbolOptions(u.symbol), [u.symbol])
  const gradeKind = u.symbol[0] === 'G' ? 'G' : 'S'
  const gw = gradeOf(Cu, Cc, gradeKind)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="field !py-1 !text-sm"
          value={preset}
          onChange={(e) => {
            setPreset(e.target.value)
            setP(CLASS_PRESETS.find((x) => x.id === e.target.value)!.p)
          }}
        >
          {CLASS_PRESETS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() => {
            setP(randomClass(Math.floor(Math.random() * 1e9)))
            setPreset('')
          }}
        >
          🎲 Random soil
        </button>
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{p.story}</div>}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Seg value={p.mode} onChange={(v) => set({ mode: v, pf: v === 'pf' && !p.pf.length ? sa.pts.map((q) => ({ d: q.d, pf: +q.pf.toFixed(2) })) : p.pf, sieve: v === 'sieve' && !p.sieve.length ? CLASS_PRESETS[0].p.sieve : p.sieve, pan: v === 'sieve' && !p.sieve.length ? 12 : p.pan })} items={[{ v: 'sieve', label: 'masses retained' }, { v: 'pf', label: '% finer' }]} />
        <NumIn label="LL" value={p.LL} onChange={(v) => set({ LL: v })} step={1} w="w-14" />
        <NumIn label="PL" value={p.PL} onChange={(v) => set({ PL: v })} step={1} w="w-14" />
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={p.NP} onChange={(e) => set({ NP: e.target.checked })} /> non-plastic
        </label>
        <NumIn label="LL oven-dried" value={p.LLoven} onChange={(v) => set({ LLoven: v })} step={1} w="w-14" />
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={p.Dgiven.on} onChange={(e) => set({ Dgiven: { ...p.Dgiven, on: e.target.checked, ...(e.target.checked && !Number.isFinite(p.Dgiven.D10) ? { D10: +g.D10.toFixed(3), D30: +g.D30.toFixed(3), D60: +g.D60.toFixed(3) } : {}) } })} /> D’s given
        </label>
        {p.Dgiven.on &&
          (['D10', 'D30', 'D60'] as const).map((k) => (
            <NumIn key={k} label={k} value={p.Dgiven[k]} onChange={(v) => set({ Dgiven: { ...p.Dgiven, [k]: v } })} step={0.01} unit="mm" w="w-16" />
          ))}
      </div>
      <div className="grid cq-lg:grid-cols-[auto_1fr] gap-4 items-start">
        <div className="overflow-x-auto">
          <table className="tbl w-auto text-sm">
            <thead>
              <tr>
                <th>Sieve</th>
                <th>mm</th>
                <th>{p.mode === 'sieve' ? 'retained (g)' : '% finer'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(p.mode === 'sieve' ? p.sieve : p.pf).map((row, i) => (
                <tr key={i}>
                  <td className="txt">
                    <select
                      className="field !py-0 !text-xs"
                      value={row.d}
                      onChange={(e) => (p.mode === 'sieve' ? set({ sieve: p.sieve.map((x, j) => (j === i ? { ...x, d: +e.target.value } : x)) }) : set({ pf: p.pf.map((x, j) => (j === i ? { ...x, d: +e.target.value } : x)) }))}
                    >
                      {[...SIEVES, ...(SIEVES.some((s) => s.d === row.d) ? [] : [{ no: `${row.d} mm`, d: row.d }])].map((s) => (
                        <option key={s.d} value={s.d}>
                          {s.no}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{row.d}</td>
                  <td>
                    {p.mode === 'sieve' ? (
                      <NumIn label="" value={(row as { ret: number }).ret} onChange={(v) => set({ sieve: p.sieve.map((x, j) => (j === i ? { ...x, ret: v } : x)) })} step={1} w="w-16" />
                    ) : (
                      <NumIn label="" value={(row as GradPt).pf} onChange={(v) => set({ pf: p.pf.map((x, j) => (j === i ? { ...x, pf: v } : x)) })} step={1} w="w-16" />
                    )}
                  </td>
                  <td>
                    <button className="text-xs text-bad" onClick={() => (p.mode === 'sieve' ? set({ sieve: p.sieve.filter((_, j) => j !== i) }) : set({ pf: p.pf.filter((_, j) => j !== i) }))}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {p.mode === 'sieve' && (
                <tr>
                  <td className="txt">Pan</td>
                  <td></td>
                  <td>
                    <NumIn label="" value={p.pan} onChange={(v) => set({ pan: v })} step={1} w="w-16" />
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            className="btn !py-0.5 !px-2 !text-xs mt-1"
            onClick={() => {
              const used = (p.mode === 'sieve' ? p.sieve : p.pf).map((x) => x.d)
              const d = SIEVES.find((s) => !used.includes(s.d) && s.d < 5)?.d ?? 0.15
              if (p.mode === 'sieve') set({ sieve: [...p.sieve, { d, ret: 0 }] })
              else set({ pf: [...p.pf, { d, pf: 50 }] })
            }}
          >
            + sieve
          </button>
          {p.mode === 'sieve' && <div className="text-xs text-faint mt-1">Total {nf(sa.total, 5)} g (pan included).</div>}
        </div>
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          <GradingCurve curves={[{ pts }]} D={D} />
        </div>
      </div>
      {!okF ? (
        <Callout kind="note" title="Need % passing No. 200">Add the 0.075 mm sieve (or its % finer).</Callout>
      ) : (
        <div key={key} className="space-y-4">
          <div className="grid cq-lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-3 space-y-0.5">
              {p.mode === 'sieve' && (
                <>
                  <div className="text-xs font-bold uppercase tracking-wider text-faint">Percent finer</div>
                  <CheckTable rows={sa.lines.map((l) => ({ ...l, k: String(l.d) }))} rowKey={(r) => r.k} given={[{ label: 'sieve', get: (r) => sieveName(r.d) }, { label: 'retained', get: (r) => r.ret }]} cols={PF_COLS} idp={id('pf')} />
                </>
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-faint mt-2">Grading</div>
              {!p.Dgiven.on && (
                <>
                  <Answer id={id('D10')} label="D10 (mm)" value={D.D10} digits={4} tol={0.03} compact />
                  <Answer id={id('D30')} label="D30 (mm)" value={D.D30} digits={4} tol={0.03} compact />
                  <Answer id={id('D60')} label="D60 (mm)" value={D.D60} digits={4} tol={0.03} compact />
                </>
              )}
              {Number.isFinite(Cu) && (
                <>
                  <Answer id={id('Cu')} label="Cu = D60/D10" value={Cu} tol={0.04} compact />
                  <Answer id={id('Cc')} label="Cc = D30²/(D60·D10)" value={Cc} tol={0.04} compact />
                  <Choice id={id('grade')} label="grading" options={[{ v: 'W', label: 'well graded' }, { v: 'P', label: 'poorly graded' }]} answer={gw.letter} />
                </>
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-faint mt-2">Fractions (% of the whole sample)</div>
              {Number.isFinite(g.P4) && (
                <>
                  <Answer id={id('ug')} label="USCS gravel (> 4.75)" value={g.uscs.gravel} unit="%" abs={0.3} compact />
                  <Answer id={id('us')} label="USCS sand" value={g.uscs.sand} unit="%" abs={0.3} compact />
                </>
              )}
              <Answer id={id('uf')} label="fines (< 0.075)" value={g.P200} unit="%" abs={0.3} compact />
              {Number.isFinite(g.P10) && (
                <>
                  <Answer id={id('ag')} label="AASHTO gravel (> 2.0)" value={g.aashto.gravel} unit="%" abs={0.3} compact />
                  <Answer id={id('as')} label="AASHTO sand" value={g.aashto.sand} unit="%" abs={0.3} compact />
                </>
              )}
            </div>
            <div className="rounded-xl border border-line p-3 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">USCS (Table 5.2 → Fig. 5.3 → Fig. {u.chart ?? '—'})</div>
              <Choice id={id('usym')} label="group symbol" options={symOpts.map((s) => ({ v: s, label: s }))} answer={u.symbol} />
              <Reveal id={id('upath')} title="Step through the USCS path" tone="mute">
                <UscsPath u={u} />
                <ol className="text-sm list-decimal pl-5 mt-2 space-y-0.5">
                  {u.steps.map((s, i) => (
                    <li key={i}>
                      <Md>{s.text}</Md>
                    </li>
                  ))}
                </ol>
                {u.nameNote && <p className="text-xs text-load mt-1">{u.nameNote}</p>}
                {u.flags.map((f) => (
                  <p key={f} className="text-xs text-bad">
                    {f}
                  </p>
                ))}
              </Reveal>
              {!p.NP && Number.isFinite(PI) && <PlasticityChart pts={[{ LL: p.LL, PI, label: chartZone(p.LL, PI).zone }]} w={380} />}
            </div>
          </div>
          <div className="rounded-xl border border-line p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">AASHTO (Table 5.1, left to right → Fig. 5.2 → GI)</div>
            <AashtoGrid a={a} />
            <div className="grid cq-lg:grid-cols-2 gap-3 items-start">
              <div className="space-y-0.5">
                <Choice id={id('agrp')} label="group" options={aGroupOptions(a.group).map((s) => ({ v: s, label: s }))} answer={a.group} />
                {a.gi.rule === 'formula' && (
                  <>
                    <Answer id={id('gi1')} label="partial GI (LL)" value={a.gi.t1} abs={0.05} compact />
                    <Answer id={id('gi2')} label="partial GI (PI)" value={a.gi.t2} abs={0.05} compact />
                  </>
                )}
                <Answer id={id('gi')} label="GI (rounded)" value={a.gi.gi} abs={0.4} tol={0} digits={0} compact />
                <Reveal id={id('asteps')} title="AASHTO working" tone="mute">
                  <ol className="text-sm list-decimal pl-5 space-y-0.5">
                    {a.steps.map((s, i) => (
                      <li key={i}>
                        <Md>{s}</Md>
                      </li>
                    ))}
                  </ol>
                  <p className="text-sm mt-1">
                    Answer: <b>{a.label}</b> — {a.material}; {a.rating.toLowerCase()} as subgrade.
                  </p>
                </Reveal>
              </div>
              {!p.NP && Number.isFinite(PI) && <AashtoFig52 pt={{ LL: p.LL, PI }} F200={g.P200} w={360} />}
            </div>
          </div>
          <Reveal id={id('sol')} title="Full solution (as you would write it)">
            <div className="text-sm space-y-1">
              {p.mode === 'sieve' && <p>% finer: {sa.lines.map((l) => `${sieveName(l.d)} ${nf(l.pf, 4)}`).join(', ')}.</p>}
              {Number.isFinite(Cu) && (
                <Tex block>{`D_{10} = ${nf(D.D10, 3)},\\ D_{30} = ${nf(D.D30, 3)},\\ D_{60} = ${nf(D.D60, 3)}\\ \\text{mm};\\ C_u = ${nf(Cu, 4)},\\ C_c = ${nf(Cc, 4)}`}</Tex>
              )}
              {Number.isFinite(Cu) && <p>{gw.comment}.</p>}
              <p>
                USCS: <b>{u.symbol}</b>, {u.name}. AASHTO: <b>{a.label}</b>.
              </p>
            </div>
          </Reveal>
        </div>
      )}
      <UsdaCard />
    </div>
  )
}

function UsdaCard() {
  const [v, setV] = useState({ gravel: 20, sand: 10, silt: 30, clay: 40 })
  const sum = v.gravel + v.sand + v.silt + v.clay
  const r = Math.abs(sum - 100) < 0.6 ? usda(v) : null
  const key = hashKey(JSON.stringify(v))
  useEffect(() => {
    if (r) markUsed('c-usda', { sand: +r.sand.toFixed(1), silt: +r.silt.toFixed(1), clay: +r.clay.toFixed(1) })
  })
  return (
    <Section title="USDA textural triangle" sub="Slides 3–7: remove the gravel, rescale, read the triangle, add “gravelly”. Drag on the triangle or type the percentages.">
      <div className="grid cq-lg:grid-cols-[1fr_1fr] gap-4 items-start">
        <UsdaTriangle pt={r ? { sand: r.sand, silt: r.silt, clay: r.clay } : undefined} onPick={(q) => setV({ gravel: 0, ...q })} w={400} />
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {(['gravel', 'sand', 'silt', 'clay'] as const).map((k) => (
              <NumIn key={k} label={k} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} step={1} unit="%" w="w-14" />
            ))}
          </div>
          {!r ? (
            <div className="text-bad">The four add to {nf(sum, 4)} %, not 100.</div>
          ) : (
            <div key={key} className="space-y-0.5">
              {v.gravel > 0 && (
                <>
                  <Answer id={`sm-class:lab:usda:${key}:sand`} label="modified % sand" value={r.sand} abs={0.15} compact />
                  <Answer id={`sm-class:lab:usda:${key}:clay`} label="modified % clay" value={r.clay} abs={0.15} compact />
                </>
              )}
              <Choice id={`sm-class:lab:usda:${key}:cls`} label="class" options={usdaOptions(r.cls).map((c) => ({ v: c, label: c }))} answer={r.cls} />
              <p className="text-xs text-mute">
                {v.gravel > 0 ? `× 100/(100 − ${v.gravel}) → sand ${nf(r.sand, 3)}, silt ${nf(r.silt, 3)}, clay ${nf(r.clay, 3)} → ` : ''}
                <b>{r.name}</b>
                {v.gravel > 0 && !r.gravelly ? ' (little gravel: no “gravelly”)' : ''}. Slide 4: Soil B (20 % gravel, 10/30/40) → gravelly clay.
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------- choice options
export function symbolOptions(sym: string): string[] {
  const out = new Set<string>([sym])
  if (sym.includes('-') && /^[GS][WP]-/.test(sym)) {
    const L = sym[0]
    ;['W', 'P'].forEach((w) => ['M', 'C'].forEach((f) => out.add(`${L}${w}-${L}${f}`)))
    out.add(`${L}${sym.endsWith('M') ? 'M' : 'C'}`)
  } else if (/^[GS]/.test(sym)) {
    const L = sym[0]
    ;[`${L}M`, `${L}C`, `${L}C-${L}M`, `${L}W`, `${L}P`, `${L === 'G' ? 'S' : 'G'}${sym.slice(1, 2)}`].forEach((s) => out.add(s))
  } else {
    ;['CL', 'ML', 'CL-ML', 'CH', 'MH', 'OL', 'OH'].forEach((s) => out.add(s))
  }
  return [...out].slice(0, 7)
}
export function aGroupOptions(g: string): string[] {
  const all = ['A-1-a', 'A-1-b', 'A-3', 'A-2-4', 'A-2-5', 'A-2-6', 'A-2-7', 'A-4', 'A-5', 'A-6', 'A-7-5', 'A-7-6']
  return all.includes(g) ? all : [...all, g]
}
function usdaOptions(c: string): string[] {
  const all = ['Sand', 'Loamy sand', 'Sandy loam', 'Loam', 'Silt loam', 'Silt', 'Sandy clay loam', 'Clay loam', 'Silty clay loam', 'Sandy clay', 'Silty clay', 'Clay']
  const i = all.indexOf(c)
  const pick = new Set([c, all[(i + 1) % all.length], all[(i + 11) % all.length], all[(i + 4) % all.length]])
  return all.filter((x) => pick.has(x))
}

// ---------------------------------------------------------------- 🎲 random soils
export function randomClass(seed: number): ClassIn {
  const r = rng(seed)
  const t = pick(r, ['sieve', 'pf', 'pf', 'fine'] as const)
  const rd = (v: number, n = 0) => Math.round(v * 10 ** n) / 10 ** n
  if (t === 'sieve') {
    const ds = [4.75, 2.0, 0.85, 0.425, 0.25, 0.15, 0.075]
    const masses = ds.map(() => rd(20 + 140 * r()))
    masses[0] = rd(40 * r())
    const pan = rd(5 + 40 * r())
    const plastic = r() < 0.5
    const LL = plastic ? rd(25 + 20 * r()) : NaN
    return { ...base, mode: 'sieve', sieve: ds.map((d, i) => ({ d, ret: masses[i] })), pan, LL, PL: plastic ? rd(LL - 4 - 12 * r()) : NaN, NP: !plastic, story: 'Sieve analysis (2023-24 Q4(a) style): % finer, grading curve, D10/D30/D60, Cu, Cc, fractions, then USCS and AASHTO.' }
  }
  if (t === 'fine') {
    const F = rd(52 + 45 * r())
    const LL = rd(28 + 45 * r())
    const PI = rd(Math.max(3, Math.min(0.9 * (LL - 8) - 2, 0.73 * (LL - 20) + (r() - 0.45) * 22)))
    return { ...base, mode: 'pf', pf: [{ d: 4.75, pf: rd(F + (100 - F) * (0.6 + 0.4 * r())) }, { d: 0.425, pf: rd(F + 5 + 3 * r()) }, { d: 0.075, pf: F }], LL, PL: LL - PI, story: `Fine-grained soil (2020-21 Q5(c) / Jan 2021 Q7(a) style): ${F} % passes No. 200, LL ${LL}, PL ${LL - PI}. USCS and AASHTO.` }
  }
  const F200 = rd(3 + 25 * r())
  const F40 = rd(F200 + 10 + 30 * r())
  const F10 = rd(Math.min(100, F40 + 10 + 30 * r()))
  const F4 = rd(Math.min(100, F10 + 5 + 25 * r()))
  const LL = rd(20 + 25 * r())
  const PL = rd(LL - 2 - 14 * r())
  return { ...base, mode: 'pf', pf: [{ d: 4.75, pf: F4 }, { d: 2.0, pf: F10 }, { d: 0.425, pf: F40 }, { d: 0.075, pf: F200 }], LL, PL, story: `Inorganic soil (2021-22 Q6(b) style): % passing No. 4 ${F4}, No. 10 ${F10}, No. 40 ${F40}, No. 200 ${F200}; LL ${LL}, PL ${PL}. AASHTO and USCS (symbol and name).` }
}
