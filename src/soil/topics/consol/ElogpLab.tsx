// e–log p lab: enter or 🎲 oedometer data → plot; Casagrande's pc′ construction step by step, the two-line check,
// Cc and Cs from the data, and the field curve (Schmertmann, NC or OC).
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Choice, Md, Reveal } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { Slider } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { casagrande, ccFromData, csFromData, envelope, fieldCurve, pcTwoLines, type OedPt } from '../../engine/consolidation'
import { markUsed } from '../../reference/pane'
import { JAN21_OED, randomOed, TABLE_1718 } from './gen'
import { Chart, Legend, pathOf } from './plot'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const lg = Math.log10

const toText = (pts: OedPt[]) => pts.map((q) => `${q.p} ${q.e} ${q.stage}`).join('\n')
function parse(txt: string): OedPt[] {
  return txt
    .split('\n')
    .map((l) => l.trim().split(/[\s,;:]+/))
    .filter((a) => a.length >= 2 && Number.isFinite(+a[0]) && Number.isFinite(+a[1]) && +a[0] > 0)
    .map((a) => ({ p: +a[0], e: +a[1], stage: (a[2] === 'unload' || a[2] === 'u' ? 'unload' : a[2] === 'reload' || a[2] === 'r' ? 'reload' : 'load') as OedPt['stage'] }))
}

const W = 560
const Hh = 330
const PAD = { l: 48, r: 14, t: 12, b: 34 }
const STEPS = ['Plot the data', '1. Point of maximum curvature', '2. Horizontal line through it', '3. Tangent at it', '4. Bisect the angle', "5. Extend the virgin line back: pc′"]

export function ElogpLab() {
  const [txt, setTxt] = useState(toText(JAN21_OED))
  const [src, setSrc] = useState('Jan 2021 Q3(b) oedometer data (load, unload, reload).')
  const [step, setStep] = useState(5)
  const [show2, setShow2] = useState(true)
  const [e0, setE0] = useState(0.8)
  const [p0, setP0] = useState(38.3)
  const [showField, setShowField] = useState(true)
  const pts = useMemo(() => parse(txt), [txt])
  const env = useMemo(() => envelope(pts), [pts])
  const ok = env.length >= 4
  const ps = pts.map((q) => q.p)
  const es = pts.map((q) => q.e)
  const pmin = ok ? Math.min(...ps) / 2 : 1
  const pmax = ok ? Math.max(...ps) * 2.5 : 10
  const emin0 = ok ? Math.min(...es, showField ? 0.42 * e0 : Infinity) : 0
  const emax0 = ok ? Math.max(...es, showField ? e0 : -Infinity) : 1
  const ePad = (emax0 - emin0) * 0.06
  const eMin = emin0 - ePad
  const eMax = emax0 + ePad
  const aspect = ((Hh - PAD.t - PAD.b) / (eMax - eMin)) / ((W - PAD.l - PAD.r) / (lg(pmax) - lg(pmin)))
  const cg = ok ? casagrande(pts, aspect) : null
  const two = ok ? pcTwoLines(pts) : null
  const cc = ok ? ccFromData(pts) : null
  const cs = ok ? csFromData(pts) : null
  const vb = cc ? -cc.Cc : 0
  const va = cc ? cc.a.e - vb * lg(cc.a.p) : 0
  const pcUse = cg?.pc ?? 0
  const fc = ok && cc && e0 > 0 && p0 > 0 ? fieldCurve({ e0, p0, pc: pcUse, Cs: cs?.Cs ?? (cc.Cc / 6), lab: { a: va, b: vb } }) : null
  const key = hashKey(txt + '|' + e0 + '|' + p0)
  const id = (k: string) => `sm-consol:lab:elogp:${key}:${k}`
  useEffect(() => {
    if (cc) markUsed('k-cc', { key: 'test', Cc: +cc.Cc.toFixed(3) })
  })
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            const g = randomOed(Math.floor(Math.random() * 1e9))
            setTxt(toText(g.pts))
            setE0(g.e0)
            setP0(g.p0)
            setSrc(`Generated test (rounded readings). Sample from ${g.z} m: field e0 = ${g.e0}, p0′ = ${g.p0} kPa.`)
          }}
        >
          🎲 New oedometer test
        </button>
        <button
          className="btn !text-xs"
          onClick={() => {
            setTxt(toText(JAN21_OED))
            setE0(0.8)
            setP0(38.3)
            setSrc('Jan 2021 Q3(b) oedometer data (load, unload, reload).')
          }}
        >
          Jan 2021 Q3(b)
        </button>
        <button
          className="btn !text-xs"
          onClick={() => {
            setTxt(toText(TABLE_1718))
            setE0(0.695)
            setP0(80.8)
            setSrc('2017-18 Q6(a) / 2016-17 / 2008-09 lab table (loading only, 50–400 kPa): no break inside the range, so the "pc′" found is not meaningful — these papers use the table directly (log interpolation).')
          }}
        >
          2017-18 table
        </button>
      </div>
      <div className="text-sm text-mute">{src}</div>
      <div className="grid cq-lg:grid-cols-[1fr_15rem] gap-3">
        <div className="rounded-xl bg-bg/60 border border-line p-2">
          {ok && cg && two && cc ? (
            <Chart w={W} h={Hh} pad={PAD} x={{ min: pmin, max: pmax, log: true, label: "effective pressure p′ (kPa, log)" }} y={{ min: eMin, max: eMax, label: 'void ratio e', fmt: (v) => fmt(v, 3) }} label="e log p plot">
              {(s) => {
                const ax = (p: number) => s.X(p)
                const ay = (e: number) => s.Y(e)
                const m = cg.m
                const xm = lg(m.p)
                const line = (slope: number, x0: number, e00: number, x1: number, x2: number) => `M${ax(10 ** x1)},${ay(e00 + slope * (x1 - x0))} L${ax(10 ** x2)},${ay(e00 + slope * (x2 - x0))}`
                const lgmin = lg(pmin)
                const lgmax = lg(pmax)
                return (
                  <>
                    <path d={pathOf(env.map((q) => [q.p, q.e]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} data-name="loading" />
                    <path d={pathOf(pts.filter((q, i) => q.stage !== 'load' || pts.slice(i + 1).some((r) => r.stage !== 'load')).map((q) => [q.p, q.e]), s)} fill="none" stroke="var(--c-mute)" strokeWidth={0.9} strokeDasharray="3 2" data-name="unload–reload" />
                    {pts.map((q, i) => (
                      <circle key={i} cx={ax(q.p)} cy={ay(q.e)} r={3} fill={q.stage === 'load' ? 'var(--c-ink)' : q.stage === 'unload' ? 'var(--c-water)' : 'var(--c-shear)'} data-tip={`${q.stage}: p′ = ${fmt(q.p, 4)} kPa, e = ${f3(q.e)}`} />
                    ))}
                    {step >= 1 && <circle cx={ax(m.p)} cy={ay(m.e)} r={6} fill="none" stroke="var(--c-load)" strokeWidth={2} data-tip={`max curvature: p′ = ${fmt(m.p, 4)} kPa, e = ${f3(m.e)}`} />}
                    {step >= 2 && <path d={line(0, xm, m.e, xm, Math.min(lgmax, xm + 1.2))} stroke="var(--c-load)" strokeWidth={1} />}
                    {step >= 3 && <path d={line(cg.tangentSlope, xm, m.e, Math.max(lgmin, xm - 0.5), Math.min(lgmax, xm + 0.9))} stroke="var(--c-load)" strokeWidth={1} strokeDasharray="5 3" data-name="tangent" />}
                    {step >= 4 && <path d={line(cg.bisectorSlope, xm, m.e, xm, Math.min(lgmax, xm + 1.1))} stroke="var(--c-accent)" strokeWidth={1.3} data-name="bisector" />}
                    {step >= 5 && (
                      <>
                        <path d={line(vb, lg(cc.b.p), cc.b.e, Math.max(lgmin, lg(cg.pc) - 0.3), lg(cc.b.p))} stroke="var(--c-accent)" strokeWidth={1.3} strokeDasharray="6 3" />
                        <line x1={ax(cg.pc)} x2={ax(cg.pc)} y1={s.T} y2={s.B} stroke="var(--c-accent)" strokeDasharray="2 3" />
                        <circle cx={ax(cg.pc)} cy={ay(cg.ePc)} r={4} fill="var(--c-accent)" data-tip={`Casagrande pc′ = ${fmt(cg.pc, 4)} kPa, e = ${f3(cg.ePc)}`} />
                        <text x={ax(cg.pc) + 4} y={s.T + 11} fontSize={10} fill="var(--c-accent)">
                          pc′ ≈ {fmt(cg.pc, 0)} kPa
                        </text>
                      </>
                    )}
                    {show2 && (
                      <>
                        <path d={line(two.recomp.b, 0, two.recomp.a, lgmin, lg(two.pc) + 0.15)} stroke="var(--c-good)" strokeWidth={1} strokeDasharray="2 2" />
                        <path d={line(vb, 0, va, lg(two.pc) - 0.15, lgmax)} stroke="var(--c-good)" strokeWidth={1} strokeDasharray="2 2" />
                        <circle cx={ax(two.pc)} cy={ay(two.e)} r={3.5} fill="var(--c-good)" data-tip={`two-line pc′ = ${fmt(two.pc, 4)} kPa, e = ${f3(two.e)}`} />
                      </>
                    )}
                    {showField && fc && (
                      <>
                        <path d={pathOf(fc.pts.map((q) => [q.p, q.e]), s)} fill="none" stroke="var(--c-moment)" strokeWidth={2} data-name="field" />
                        <line x1={s.L} x2={ax(fc.pL)} y1={ay(fc.eL)} y2={ay(fc.eL)} stroke="var(--c-moment)" strokeDasharray="2 3" />
                        <text x={s.L + 3} y={ay(fc.eL) - 3} fontSize={9} fill="var(--c-moment)">
                          0.42e0 = {f3(fc.eL)}
                        </text>
                        <circle cx={ax(p0)} cy={ay(e0)} r={3.5} fill="var(--c-moment)" data-tip={`field: p0′ = ${fmt(p0, 4)} kPa, e0 = ${f3(e0)}`} />
                      </>
                    )}
                  </>
                )
              }}
            </Chart>
          ) : (
            <div className="text-bad text-sm p-4">Need at least four loading points (p e per line).</div>
          )}
          <Legend
            items={[
              { c: 'var(--c-ink)', t: 'loading / envelope' },
              { c: 'var(--c-water)', t: 'unload' },
              { c: 'var(--c-shear)', t: 'reload' },
              { c: 'var(--c-load)', t: 'Casagrande' },
              { c: 'var(--c-good)', t: 'two-line check', dash: true },
              { c: 'var(--c-moment)', t: 'field curve' },
            ]}
          />
        </div>
        <div className="space-y-2 text-sm">
          <label className="block text-xs text-mute">
            Data: p (kPa) e stage (load / unload / reload), one per line
            <textarea className="field w-full h-48 !text-xs num mt-1" value={txt} onChange={(e) => setTxt(e.target.value)} />
          </label>
          <Slider label={STEPS[step]} value={step} min={0} max={5} onChange={setStep} />
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={show2} onChange={(e) => setShow2(e.target.checked)} /> two-line intersection
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={showField} onChange={(e) => setShowField(e.target.checked)} /> field curve from
          </label>
          <div className="flex flex-wrap gap-2">
            <NumIn label="e0" value={e0} onChange={setE0} step={0.01} w="w-16" />
            <NumIn label="p0′" value={p0} onChange={setP0} step={5} unit="kPa" w="w-16" />
          </div>
        </div>
      </div>
      {ok && cg && two && cc && (
        <div key={key} className="grid cq-lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
            <Answer id={id('cc')} label={`Cc (${f2(cc.a.p)} → ${f2(cc.b.p)} kPa)`} value={cc.Cc} digits={4} abs={0.003} compact />
            {cs && <Answer id={id('cs')} label={`Cs (${f2(cs.top.p)} → ${f2(cs.end.p)} kPa unload)`} value={cs.Cs} digits={4} abs={0.002} compact />}
            <Answer id={id('pc')} label="pc′ (your construction)" value={cg.pc} unit="kPa" tol={0.15} hint="±15 %: it depends on your plot scale" compact />
            <Answer id={id('ocr')} label={`OCR at p0′ = ${f2(p0)}`} value={pcUse / p0} tol={0.15} compact />
            <Choice id={id('ncoc')} label="the clay is" options={[{ v: 'nc', label: 'NC' }, { v: 'oc', label: 'OC' }]} answer={pcUse > p0 * 1.1 ? 'oc' : 'nc'} />
            {fc && <Answer id={id('ccf')} label="field Cc (slope of the field virgin line)" value={fc.Ccf} digits={4} abs={0.005} compact />}
          </div>
          <div className="text-sm">
            <Md>{`- **Casagrande:** maximum curvature at p = ${f2(cg.m.p)} kPa (e = ${f3(cg.m.e)}); tangent slope ${f3(-cg.tangentSlope)}/decade, bisector ${f3(-cg.bisectorSlope)}; the virgin line through the last two points (Cc = ${fmt(cc.Cc, 4)}) meets the bisector at **pc′ ≈ ${fmt(cg.pc, 1)} kPa**.
- **Two lines:** recompression (least squares through the first points, slope ${fmt(two.Cr, 4)}) meets the virgin line at **${fmt(two.pc, 1)} kPa**.
${cs ? `- **Cs** from the unloading branch: (${f3(cs.end.e)} − ${f3(cs.top.e)})/log(${f2(cs.top.p)}/${f2(cs.end.p)}) = **${fmt(cs.Cs, 4)}** (Cc/Cs = ${f2(cc.Cc / cs.Cs)}).` : '- No unloading branch: take Cs ≈ Cc/5 to Cc/10.'}
${fc ? `- **Field curve (${fc.kind === 'nc' ? 'NC' : 'OC'}):** ${fc.kind === 'nc' ? `(p0′, e0) = (${f2(p0)}, ${f3(e0)}) to the lab curve at 0.42e0 = ${f3(fc.eL)} (p = ${fmt(fc.pL, 0)} kPa)` : `(p0′, e0) → slope Cs to pc′ (e = ${f3(fc.pts[1].e)}) → lab curve at 0.42e0 = ${f3(fc.eL)}`}; field Cc = **${fmt(fc.Ccf, 4)}** vs lab ${fmt(cc.Cc, 4)}.` : ''}`}</Md>
            <Reveal id={id('why')} title="Why the construction depends on the plot" tone="mute">
              <p className="text-sm">The angle you bisect is measured on the paper, so stretching the e axis moves the point of maximum curvature and the bisector. Draw the plot with a sensible aspect (here: a {W} × {Hh} box) and quote pc′ to two significant figures. The handnote gives 110–125 kPa for the Jan 2021 data; either way p0′ + Δp = 78 kPa is well below it.</p>
            </Reveal>
          </div>
        </div>
      )}
    </div>
  )
}

