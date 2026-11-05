// Plasticity lab: cup or cone data (masses or w, editable and draggable), flow curve → LL, PL, PI, LI checkpoints,
// consistency-state bar, strength across the plastic range, plasticity chart point, shrinkage-limit calculator.
import { useEffect, useMemo, useState } from 'react'
import { Answer, Choice, Reveal, Section, Seg, Tex } from '../../../components/ui'
import { CheckTable, hashKey, type CheckCol } from '../../../labs/CheckTable'
import { pick, rng } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { nf } from '../../engine/phase'
import { BURMISTER, burmisterIndex, chartZone, coneLL, flowCurve, indices, liComment, onePointCone, onePointCup, shrinkage, slFromE, slFromGs, srFromE, volShrink, linearFromVS, waterContent, wFromMasses } from '../../engine/plasticity'
import { PlasticityChart } from '../../reference/idx'
import { markUsed } from '../../reference/pane'
import { FlowPlot, ShrinkPlot, StateBar, StrengthCurve } from './figs'

export interface Trial {
  /** N (cup) or penetration d in mm (cone) */
  x: number
  tare: number
  wet: number
  dry: number
  /** water content when entered directly */
  w: number
}
export interface PlastIn {
  mode: 'cup' | 'cone'
  input: 'masses' | 'w'
  trials: Trial[]
  plMode: 'value' | 'masses'
  PL: number
  plRows: { tare: number; wet: number; dry: number }[]
  wN: number
  coneLog: boolean
  story?: string
}

const SLIDE_CUP: Trial[] = [
  { x: 15, tare: 10.4, wet: 44.12, dry: 31.48, w: 59.96 },
  { x: 19, tare: 11.29, wet: 46.91, dry: 33.74, w: 58.66 },
  { x: 24, tare: 6.93, wet: 48.37, dry: 33.17, w: 57.93 },
  { x: 29, tare: 9.49, wet: 46.61, dry: 33.19, w: 56.62 },
  { x: 33, tare: 7.22, wet: 46.74, dry: 32.63, w: 55.53 },
]
const JAN21_CONE: Trial[] = [16.1, 17.8, 19.3, 21.6, 22.6].map((x, i) => ({ x, tare: 0, wet: NaN, dry: NaN, w: [50, 52.1, 54.1, 57, 58.2][i] }))
export const PLAST_DEFAULT: PlastIn = {
  mode: 'cup',
  input: 'masses',
  trials: SLIDE_CUP,
  plMode: 'masses',
  PL: 34,
  plRows: [
    { tare: 10.54, wet: 47.26, dry: 37.95 },
    { tare: 11.22, wet: 47.77, dry: 38.51 },
    { tare: 9.29, wet: 46.43, dry: 37.03 },
  ],
  wN: 40,
  coneLog: false,
  story: "AJK sir's data sheets (slides 12 and 15): LL by Casagrande cup, PL by thread rolling. Natural water content 40 % (assumed for the LI).",
}

export const trialW = (p: PlastIn, t: Trial) => (p.input === 'w' ? t.w : p.mode === 'cone' && !(t.tare > 0) ? wFromMasses(t.wet, t.dry) : waterContent(t).w)
export function plOf(p: PlastIn) {
  if (p.plMode === 'value') return p.PL
  const ws = p.plRows.map((r) => waterContent(r).w).filter(Number.isFinite)
  return ws.reduce((s, v) => s + v, 0) / ws.length
}

// ---------------------------------------------------------------- 🎲
const r1 = (v: number, n = 1) => Math.round(v * 10 ** n) / 10 ** n
export function randomPlast(seed: number): PlastIn {
  const r = rng(seed)
  const t = pick(r, ['cup', 'cup', 'cone', 'cone'] as const)
  const LL = r1(32 + 35 * r())
  const PL = r1(LL * (0.35 + 0.3 * r()))
  const wN = r1(PL + (LL - PL) * (0.1 + 0.9 * r()))
  if (t === 'cup') {
    const If = 8 + 16 * r()
    const Ns = pick(r, [
      [11, 17, 23, 30, 38],
      [15, 19, 24, 30, 35],
      [14, 20, 26, 33],
      [12, 18, 27, 36],
    ])
    const masses = r() < 0.6
    const trials = Ns.map((N) => {
      const w = r1(LL - If * Math.log10(N / 25) + (r() - 0.5) * 0.8, 2)
      const tare = r1(6 + 5 * r(), 2)
      const dry = r1(tare + 12 + 10 * r(), 2)
      const wet = r1(dry + ((dry - tare) * w) / 100, 2)
      return { x: N, tare, wet, dry, w }
    })
    return { mode: 'cup', input: masses ? 'masses' : 'w', trials, plMode: 'value', PL, plRows: PLAST_DEFAULT.plRows, wN, coneLog: false, story: `Casagrande cup on an inorganic soil (${masses ? 'container weights given, 2023-24 Q4(b) style' : '2020-21 Q5(b) style'}). PL = ${PL} %, natural w = ${wN} %. Plot the flow curve, find LL and the flow index, PI, LI, and the type from the plasticity chart.` }
  }
  const slope = 1.2 + 2.2 * r()
  const ds = pick(r, [
    [16, 18, 22, 25],
    [16.1, 17.8, 19.3, 21.6, 22.6],
    [14, 17, 21, 24, 28],
  ])
  const masses = r() < 0.5
  const trials = ds.map((d) => {
    const w = r1(LL + slope * (d - 20) + (r() - 0.5) * 0.6, 2)
    const dry = r1(110 + 40 * r(), 1)
    const wet = r1(dry * (1 + w / 100), 1)
    return { x: d, tare: 0, wet, dry, w }
  })
  return { mode: 'cone', input: masses ? 'masses' : 'w', trials, plMode: 'value', PL, plRows: PLAST_DEFAULT.plRows, wN, coneLog: false, story: `BS fall cone (80 g, 30°) on a silty clay${masses ? ' — wet and oven-dry soil weights given (2021-22 Q5(b))' : ' (Jan 2021 Q6(a))'}. Find LL and check it by the one-point method. PL = ${PL} %, w = ${wN} %.` }
}

// ---------------------------------------------------------------- the lab
type WRow = { k: string; t: Trial; w: number }
const W_COLS: CheckCol<WRow>[] = [{ key: 'w', label: 'w (%)', get: (r) => r.w, abs: 0.05, digits: 2 }]

export function PlastLab() {
  const [p, setP] = useState<PlastIn>(PLAST_DEFAULT)
  const set = (o: Partial<PlastIn>) => setP({ ...p, ...o, story: o.story })
  const ws = p.trials.map((t) => trialW(p, t))
  const pts = p.trials.map((t, i) => ({ x: t.x, w: ws[i] }))
  const fit = useMemo(() => (p.mode === 'cup' ? flowCurve(pts.map((q) => ({ N: q.x, w: q.w }))) : coneLL(pts.map((q) => ({ d: q.x, w: q.w })), p.coneLog ? 'log' : 'linear')), [JSON.stringify(pts), p.mode, p.coneLog])
  const LL = fit.LL
  const PL = plOf(p)
  const k = indices({ LL, PL, w: p.wN, If: p.mode === 'cup' ? (fit as ReturnType<typeof flowCurve>).If : undefined })
  const z = chartZone(LL, k.PI)
  const key = hashKey(JSON.stringify(p.trials) + p.mode + p.input + PL + p.wN)
  const id = (s: string) => `sm-plast:lab:${key}:${s}`
  const near = pts.reduce((b, q) => (Math.abs(q.x - (p.mode === 'cup' ? 25 : 20)) < Math.abs(b.x - (p.mode === 'cup' ? 25 : 20)) ? q : b), pts[0])
  const one = p.mode === 'cup' ? onePointCup(near.w, near.x) : onePointCone(near.w, near.x)
  const ok = Number.isFinite(LL) && Number.isFinite(PL) && LL > PL
  useEffect(() => {
    if (!ok) return
    markUsed('c-plchart', { LL: +LL.toFixed(1), PI: +k.PI.toFixed(1) })
    markUsed('c-burmister', { i: burmisterIndex(k.PI) })
    markUsed('c-atterberg', { LL: +LL.toFixed(1), PL: +PL.toFixed(1), w: p.wN })
  })
  const upd = (i: number, o: Partial<Trial>) => set({ trials: p.trials.map((t, j) => (j === i ? { ...t, ...o } : t)) })
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={() => setP(randomPlast(Math.floor(Math.random() * 1e9)))}>
          🎲 Exam-style data
        </button>
        <button className="text-sm text-accent underline" onClick={() => setP(PLAST_DEFAULT)}>
          reset (slide 12 / 15 data sheets)
        </button>
      </div>
      {p.story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{p.story}</div>}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Seg value={p.mode} onChange={(v) => set({ mode: v, trials: v === p.mode ? p.trials : v === 'cup' ? SLIDE_CUP : JAN21_CONE, input: v === 'cup' ? 'masses' : 'w', story: v === 'cone' && v !== p.mode ? 'Jan 2021 Q6(a): fall cone on a silty clay. Find LL and check it by the one-point method.' : undefined })} items={[{ v: 'cup', label: 'Casagrande cup' }, { v: 'cone', label: 'Fall cone (80 g)' }]} />
        <Seg size="xs" value={p.input} onChange={(v) => set({ input: v, trials: p.trials.map((t, i) => ({ ...t, w: +ws[i].toFixed(2) })) })} items={[{ v: 'masses', label: 'container / soil weights' }, { v: 'w', label: 'water contents' }]} />
        {p.mode === 'cone' && (
          <label className="inline-flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={p.coneLog} onChange={(e) => set({ coneLog: e.target.checked })} /> penetration on a log axis (slide 13 drawing)
          </label>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="tbl w-auto text-sm">
          <thead>
            <tr>
              <th>{p.mode === 'cup' ? 'Blows N' : 'Penetration (mm)'}</th>
              {p.input === 'masses' ? (
                <>
                  <th>{p.mode === 'cup' ? 'container (g)' : 'container (g, 0 = none)'}</th>
                  <th>{p.mode === 'cup' ? 'cont. + wet' : 'wet (+ cont.)'}</th>
                  <th>{p.mode === 'cup' ? 'cont. + dry' : 'dry (+ cont.)'}</th>
                </>
              ) : (
                <th>w (%)</th>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {p.trials.map((t, i) => (
              <tr key={i}>
                <td>
                  <NumIn label="" value={t.x} onChange={(v) => upd(i, { x: v })} step={p.mode === 'cup' ? 1 : 0.1} w="w-16" />
                </td>
                {p.input === 'masses' ? (
                  <>
                    <td>
                      <NumIn label="" value={t.tare} onChange={(v) => upd(i, { tare: v })} step={0.01} w="w-20" />
                    </td>
                    <td>
                      <NumIn label="" value={t.wet} onChange={(v) => upd(i, { wet: v })} step={0.01} w="w-20" />
                    </td>
                    <td>
                      <NumIn label="" value={t.dry} onChange={(v) => upd(i, { dry: v })} step={0.01} w="w-20" />
                    </td>
                  </>
                ) : (
                  <td>
                    <NumIn label="" value={t.w} onChange={(v) => upd(i, { w: v })} step={0.1} w="w-20" />
                  </td>
                )}
                <td>
                  <button className="text-xs text-bad" onClick={() => p.trials.length > 2 && set({ trials: p.trials.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn !py-0.5 !px-2 !text-xs mt-1" onClick={() => set({ trials: [...p.trials, { ...p.trials[p.trials.length - 1], x: p.trials[p.trials.length - 1].x + (p.mode === 'cup' ? 5 : 2) }] })}>
          + trial
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Seg size="xs" value={p.plMode} onChange={(v) => set({ plMode: v })} items={[{ v: 'masses', label: 'PL from thread data' }, { v: 'value', label: 'PL given' }]} />
        {p.plMode === 'value' ? (
          <NumIn label="PL" value={p.PL} onChange={(v) => set({ PL: v })} step={0.5} unit="%" w="w-16" />
        ) : (
          p.plRows.map((r, i) => (
            <span key={i} className="inline-flex gap-1 items-center text-xs">
              <span className="text-faint">#{i + 1}</span>
              {(['tare', 'wet', 'dry'] as const).map((f) => (
                <NumIn key={f} label={f} value={r[f]} onChange={(v) => set({ plRows: p.plRows.map((x, j) => (j === i ? { ...x, [f]: v } : x)) })} step={0.01} w="w-16" />
              ))}
            </span>
          ))
        )}
        <NumIn label="natural w" value={p.wN} onChange={(v) => set({ wN: v })} step={0.5} unit="%" w="w-16" />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <FlowPlot mode={p.mode} pts={pts} a={fit.a} b={fit.b} LL={LL} logX={p.coneLog} onDrag={(i, x, w) => set({ input: 'w', trials: p.trials.map((t, j) => (j === i ? { ...t, x, w } : { ...t, w: +ws[j].toFixed(2) })) })} />
        <div className="text-xs text-faint px-2">
          Drag a point to see how the line and LL move (dragging switches to water-content entry). Best-fit line by least squares{p.mode === 'cup' ? ' on log N' : ''}: w = {nf(fit.a, 4)} {fit.b < 0 ? '−' : '+'} {nf(Math.abs(fit.b), 4)}·{p.mode === 'cup' ? 'log N' : p.coneLog ? 'log d' : 'd'} (r² = {nf(fit.r2, 3)}).
        </div>
      </div>
      {!ok ? (
        <div className="text-bad text-sm">Need at least two good trials and LL above PL.</div>
      ) : (
        <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-line p-3 space-y-1">
            {p.input === 'masses' && (
              <>
                <div className="text-xs font-bold uppercase tracking-wider text-faint">Water content of each trial</div>
                <CheckTable rows={p.trials.map((t, i) => ({ k: String(i + 1), t, w: ws[i] }))} rowKey={(r) => r.k} given={[{ label: p.mode === 'cup' ? 'N' : 'd', get: (r) => r.t.x }]} cols={W_COLS} idp={id('w')} />
              </>
            )}
            <div className="text-xs font-bold uppercase tracking-wider text-faint mt-2">Checkpoints</div>
            <Answer id={id('LL')} label={`LL (w at ${p.mode === 'cup' ? 'N = 25' : '20 mm'})`} value={LL} unit="%" tol={0.015} compact hint="from your best line; ±1.5 %" />
            {p.mode === 'cup' && <Answer id={id('If')} label="flow index I_F" value={(fit as ReturnType<typeof flowCurve>).If} tol={0.05} compact />}
            <Answer id={id('PL')} label="PL" value={PL} unit="%" compact />
            <Answer id={id('PI')} label="PI" value={k.PI} unit="%" tol={0.03} compact />
            <Answer id={id('LI')} label="LI" value={k.LI} tol={0.04} abs={0.02} compact />
            <Answer id={id('CI')} label="CI" value={k.CI} tol={0.04} abs={0.02} compact />
            <Choice id={id('burm')} label="Burmister" options={BURMISTER.map((b) => ({ v: b.label, label: b.label }))} answer={k.burmister} />
            <Choice id={id('state')} label="state at w" options={['semi-solid', 'plastic', 'liquid'].map((v) => ({ v, label: v }))} answer={k.state === 'solid' ? 'semi-solid' : k.state} />
            <Choice id={id('zone')} label="plasticity chart" options={['CL', 'CL-ML', 'ML', 'CH', 'MH'].map((v) => ({ v, label: v }))} answer={z.zone} />
          </div>
          <div className="space-y-2">
            <StateBar PL={PL} LL={LL} w={p.wN} />
            <div className="text-sm">
              LI = {nf(k.LI, 3)}: {liComment(k.LI)}.
            </div>
            <PlasticityChart pts={[{ LL, PI: k.PI, label: z.zone }]} w={420} />
            <div className="text-xs text-mute">
              A-line at LL {nf(LL, 3)}: {nf(z.aPI, 3)} → {z.aboveA ? 'above' : 'below'} → {z.zone} ({z.alt} if organic).
            </div>
          </div>
        </div>
      )}
      {ok && (
        <Reveal id={id('sol')} title="Full solution (as you would write it)">
          <div className="text-sm space-y-1">
            {p.input === 'masses' && <p>Water contents: {ws.map((w) => nf(w, 4)).join(', ')} %.</p>}
            <Tex block>{p.mode === 'cup' ? `w = ${nf(fit.a, 4)} - ${nf(-fit.b, 4)}\\log N \\Rightarrow LL = w(25) = ${nf(LL, 4)}\\%,\\quad I_F = ${nf(-fit.b, 4)}` : `w = ${nf(fit.a, 4)} + ${nf(fit.b, 4)}\\,${p.coneLog ? '\\log d' : 'd'} \\Rightarrow LL = w(20\\ \\text{mm}) = ${nf(LL, 4)}\\%`}</Tex>
            {Number.isFinite(fit.interp) && <p>Interpolating straight between the two readings either side: {nf(fit.interp, 4)} % (a hand-drawn line gives a value in between).</p>}
            <p>
              One-point check with the reading nearest {p.mode === 'cup' ? '25 blows' : '20 mm'} ({nf(near.x, 3)}, {nf(near.w, 4)} %):{' '}
              {p.mode === 'cup' ? <Tex>{`LL = w_N(N/25)^{0.121} = ${nf(one, 4)}\\%`}</Tex> : <Tex>{`w_L = \\dfrac{w_y}{0.77\\log y} = ${nf(one, 4)}\\%`}</Tex>} (not on the slides; {p.mode === 'cup' ? 'ASTM/Das' : 'IS 2720-5'} form).
            </p>
            <Tex block>{`PI = ${nf(LL, 4)} - ${nf(PL, 4)} = ${nf(k.PI, 4)}\\ (\\text{${k.burmister}}),\\quad LI = \\frac{${p.wN} - ${nf(PL, 4)}}{${nf(k.PI, 4)}} = ${nf(k.LI, 3)},\\quad CI = ${nf(k.CI, 3)}`}</Tex>
            {p.mode === 'cup' && <Tex block>{`I_T = PI/I_F = ${nf(k.It, 3)}`}</Tex>}
            <p>
              Plasticity chart: A-line PI = 0.73({nf(LL, 3)} − 20) = {nf(z.aPI, 3)}; PI = {nf(k.PI, 3)} is {z.aboveA ? 'above' : 'below'} it, LL {LL >= 50 ? '≥' : '<'} 50 → <b>{z.zone}</b>.
            </p>
          </div>
        </Reveal>
      )}
      <StrengthCard PL={ok ? PL : 25} LL={ok ? LL : 50} />
      <ShrinkCard />
    </div>
  )
}

// ---------------------------------------------------------------- strength across the plastic range (2023-24 Q1(b))
function StrengthCard({ PL, LL }: { PL: number; LL: number }) {
  const [t1, setT1] = useState(0.25)
  const [t2, setT2] = useState(0.8)
  const w1 = PL + t1 * (LL - PL)
  const w2 = PL + t2 * (LL - PL)
  const key = hashKey(`${nf(PL)}|${nf(LL)}|${t1}|${t2}`)
  return (
    <Section title="Which water content gives the higher strength?" sub="2023-24 Q1(b): pick two natural water contents between the PL and the LL. Strength falls about a hundredfold from the PL to the LL.">
      <div className="grid cq-md:grid-cols-2 gap-3 text-sm">
        <label className="block">
          <span className="text-load font-semibold">w₁ = {nf(w1, 3)} %</span> (LI {nf(t1, 2)})
          <input type="range" min={0} max={1} step={0.01} value={t1} onChange={(e) => setT1(+e.target.value)} className="w-full accent-[var(--c-load)]" />
        </label>
        <label className="block">
          <span className="font-semibold" style={{ color: 'var(--c-accent2)' }}>
            w₂ = {nf(w2, 3)} %
          </span>{' '}
          (LI {nf(t2, 2)})
          <input type="range" min={0} max={1} step={0.01} value={t2} onChange={(e) => setT2(+e.target.value)} className="w-full" />
        </label>
      </div>
      <StateBar PL={PL} LL={LL} w={w1} w2={w2} />
      <StrengthCurve PL={PL} LL={LL} w1={w1} w2={w2} />
      {t1 !== t2 && <Choice id={`sm-plast:lab:str:${key}`} label="higher shear strength at" options={[{ v: 'w1', label: `w₁ = ${nf(w1, 3)} %` }, { v: 'w2', label: `w₂ = ${nf(w2, 3)} %` }]} answer={w1 < w2 ? 'w1' : 'w2'} />}
      <p className="text-xs text-faint">The drier one (closer to the PL, LI → 0) is stronger: less water between the particles, thinner water films, more particle contacts. Curve: cu ≈ 170·e^(−4.6·LI) kPa (Wroth & Wood) — a qualitative scale, not on the slides.</p>
    </Section>
  )
}

// ---------------------------------------------------------------- shrinkage limit
function ShrinkCard() {
  const [mode, setMode] = useState<'mv' | 'gs' | 'e'>('mv')
  const [m1, setM1] = useState(16.5)
  const [V1, setV1] = useState(9.75)
  const [m2, setM2] = useState(10.9)
  const [V2, setV2] = useState(5.4)
  const [Gs, setGs] = useState(2.7)
  const [e, setE] = useState(0.4)
  const [w1, setW1] = useState(45.6)
  const s = shrinkage({ m1, V1, m2, V2 })
  const SR2 = m2 / V2
  const SL = mode === 'mv' ? s.SL : mode === 'gs' ? slFromGs(Gs, SR2) : slFromE(e, Gs)
  const SR = mode === 'mv' ? s.SR : mode === 'gs' ? SR2 : srFromE(e, Gs)
  const w0 = mode === 'mv' ? s.w1 : w1
  const VS = volShrink(w0, SL, SR)
  const LS = linearFromVS(VS)
  const key = hashKey(`${mode}|${m1}|${V1}|${m2}|${V2}|${Gs}|${e}|${w1}`)
  const id = (k: string) => `sm-plast:lab:sl:${key}:${k}`
  return (
    <Section title="Shrinkage-limit calculator" sub="Not on AJK sir's slides (only named, ASTM D427) but asked in 2008-09, 2009-10, 2010-11, 2011-12, 2015-16 and 2021-22.">
      <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
        <Seg size="xs" value={mode} onChange={setMode} items={[{ v: 'mv', label: 'wet & dry pat (Gs unknown)' }, { v: 'gs', label: 'Gs known + dry pat' }, { v: 'e', label: 'e at SL + Gs' }]} />
        {mode === 'mv' && (
          <>
            <NumIn label="m₁ wet" value={m1} onChange={setM1} step={0.1} unit="g" w="w-16" />
            <NumIn label="V₁" value={V1} onChange={setV1} step={0.05} unit="ml" w="w-16" />
          </>
        )}
        {mode !== 'e' && (
          <>
            <NumIn label="m₂ dry" value={m2} onChange={setM2} step={0.1} unit="g" w="w-16" />
            <NumIn label="V₂" value={V2} onChange={setV2} step={0.05} unit="ml" w="w-16" />
          </>
        )}
        {mode !== 'mv' && <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-16" />}
        {mode === 'e' && <NumIn label="e at SL" value={e} onChange={setE} step={0.01} w="w-16" />}
        {mode !== 'mv' && <NumIn label="from w₁ (e.g. LL)" value={w1} onChange={setW1} step={0.5} unit="%" w="w-16" />}
      </div>
      <div className="grid cq-md:grid-cols-2 gap-3 items-start">
        <div className="text-sm space-y-0.5">
          <Answer id={id('SL')} label="shrinkage limit SL" value={SL} unit="%" compact />
          {mode === 'mv' && <Answer id={id('Gs')} label="Gs (saturated at SL)" value={s.Gs} digits={3} compact />}
          <Answer id={id('SR')} label="shrinkage ratio SR" value={SR} digits={3} compact />
          <Answer id={id('VS')} label={`volumetric shrinkage from ${nf(w0, 3)} %`} value={VS} unit="%" compact />
          <Answer id={id('LS')} label="linear shrinkage" value={LS} unit="%" compact />
          <Reveal id={id('sol')} title="Working" tone="mute">
            <div className="text-sm">
              {mode === 'mv' && <Tex block>{`w_1 = \\frac{${m1} - ${m2}}{${m2}} = ${nf(s.w1, 4)}\\%,\\quad SL = \\frac{(${m1} - ${m2}) - (${V1} - ${V2})(1)}{${m2}} = ${nf(SL, 4)}\\%`}</Tex>}
              {mode === 'mv' && <Tex block>{`\\frac{V_2\\rho_w}{m_2} = SL + \\frac{1}{G_s} \\Rightarrow G_s = \\frac{1}{${nf(1 / SR, 4)} - ${nf(SL / 100, 4)}} = ${nf(s.Gs, 4)}`}</Tex>}
              {mode === 'gs' && <Tex block>{`SL = \\left(\\frac{V_2\\rho_w}{m_2} - \\frac{1}{G_s}\\right)100 = \\left(\\frac{${V2}}{${m2}} - \\frac{1}{${Gs}}\\right)100 = ${nf(SL, 4)}\\%`}</Tex>}
              {mode === 'e' && <Tex block>{`SL = \\frac{e_{SL}}{G_s} = \\frac{${e}}{${Gs}} = ${nf(SL, 4)}\\%,\\quad SR = \\frac{G_s}{1+e} = ${nf(SR, 4)}`}</Tex>}
              <Tex block>{`VS = (w_1 - SL)SR = ${nf(VS, 4)}\\%,\\quad LS = \\left[1 - \\left(\\frac{100}{VS+100}\\right)^{1/3}\\right]100 = ${nf(LS, 4)}\\%`}</Tex>
              <p className="text-xs text-faint">Below the SL the volume does not change: drying a soil that is already drier than its SL causes no shrinkage (2008-09 Q1(c)).</p>
            </div>
          </Reveal>
        </div>
        {mode === 'mv' ? <ShrinkPlot w1={s.w1} SL={SL} V1={V1} V2={V2} /> : <ShrinkPlot w1={w0} SL={SL} V1={1 + (VS / 100)} V2={1} />}
      </div>
    </Section>
  )
}
