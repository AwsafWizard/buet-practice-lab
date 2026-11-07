// cv fitting lab: generated dial–time readings for one load increment → Taylor's √t and Casagrande's log t constructions.
// Also the secondary-compression and sand-drain calculators.
import { useEffect, useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider, useSeed } from '../../../labs/common'
import { NumIn } from '../../../reference/common'
import { casagrandeFit, genDial, sandDrain, secondary, taylorFit, tvApprox, type DrainPattern } from '../../engine/consolidation'
import { markUsed, openSmRef } from '../../reference/pane'
import { BarronChart } from '../../reference/con'
import { Chart, pathOf } from './plot'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

function makeTest(seed: number) {
  const r = rng(seed * 101 + 5)
  const H = pick(r, [19, 20, 25.4, 18])
  const d = H / 2
  const cvYr = randInt(r, 5, 40) / 10 // m²/yr
  const cv = (cvYr * 1e6) / (365 * 24 * 60) // mm²/min
  const dp = randInt(r, 60, 160) / 100
  const pts = genDial({ cv, d, di: randInt(r, 2, 8) / 100, dp, ds: dp * randInt(r, 2, 6) / 100, noise: (i) => ((((i * 7919 + seed) % 13) - 6) / 6) * 0.002 })
  return { H, d, cvYr, cv, pts: pts.map((q) => ({ t: q.t, d: Math.round(q.d * 1000) / 1000 })) }
}

export function FitLab() {
  const { seed, next } = useSeed(3)
  const test = useMemo(() => makeTest(seed), [seed])
  const [step, setStep] = useState(4)
  const tay = taylorFit(test.pts, test.d)
  const cas = casagrandeFit(test.pts, test.d)
  const toYr = (cvMm2Min: number) => (cvMm2Min * 365 * 24 * 60) / 1e6
  useEffect(() => markUsed('k-fit', { t90: +tay.t90.toFixed(1), t50: +cas.t50.toFixed(1), d: test.d }))
  const id = (k: string) => `sm-consol:lab:fit:${hashKey(JSON.stringify(test.pts))}:${k}`
  const dMax = Math.max(...test.pts.map((q) => q.d)) * 1.08
  const sq = Math.sqrt(test.pts[test.pts.length - 1].t)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={next}>
          🎲 New load increment
        </button>
        <span className="text-sm text-mute">
          Specimen {f2(test.H)} mm, drained top and bottom (d = {f2(test.d)} mm). Compression readings (mm) after the load is applied:
        </span>
        <button className="text-xs text-accent underline" onClick={() => openSmRef('k-fit')}>
          construction steps ↗
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="tbl text-xs num">
          <tbody>
            <tr>
              <th className="txt">t (min)</th>
              {test.pts.map((q) => (
                <td key={q.t}>{q.t}</td>
              ))}
            </tr>
            <tr>
              <th className="txt">ΔH (mm)</th>
              {test.pts.map((q) => (
                <td key={q.t}>{q.d.toFixed(3)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Slider label="construction step" value={step} min={0} max={4} onChange={setStep} />
      <div className="grid cq-lg:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Taylor: ΔH vs √t</div>
          <Chart w={360} h={240} x={{ min: 0, max: sq * 1.02, label: '√t (√min)' }} y={{ min: 0, max: dMax, flip: true, label: 'ΔH (mm)' }} label="root time plot">
            {(s) => (
              <>
                <path d={pathOf(test.pts.map((q) => [Math.sqrt(q.t), q.d]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} />
                {test.pts.map((q) => (
                  <circle key={q.t} cx={s.X(Math.sqrt(q.t))} cy={s.Y(q.d)} r={2.2} fill="var(--c-ink)" data-tip={`t = ${fmt(q.t, 3)} min (√t = ${fmt(Math.sqrt(q.t), 3)}), ΔH = ${fmt(q.d, 3)} mm`} />
                ))}
                {step >= 1 && <path d={pathOf([[0, tay.d0], [tay.x90 * 1.1, tay.d0 + tay.slope * tay.x90 * 1.1]], s)} stroke="var(--c-load)" strokeWidth={1.2} />}
                {step >= 1 && <circle cx={s.X(0)} cy={s.Y(tay.d0)} r={3.5} fill="var(--c-load)" data-tip={`corrected zero d0 = ${fmt(tay.d0, 3)} mm`} />}
                {step >= 2 && <path d={pathOf([[0, tay.d0], [tay.x90 * 1.3, tay.d0 + (tay.slope / 1.15) * tay.x90 * 1.3]], s)} stroke="var(--c-accent)" strokeWidth={1.2} strokeDasharray="5 3" />}
                {step >= 3 && (
                  <>
                    <circle cx={s.X(tay.x90)} cy={s.Y(tay.d90)} r={4} fill="var(--c-accent)" data-tip={`√t90 = ${fmt(tay.x90, 3)} (t90 = ${fmt(tay.x90 ** 2, 3)} min), d90 = ${fmt(tay.d90, 3)} mm`} />
                    <line x1={s.X(tay.x90)} x2={s.X(tay.x90)} y1={s.Y(tay.d90)} y2={s.B} stroke="var(--c-accent)" strokeDasharray="2 2" />
                    <text x={s.X(tay.x90) + 4} y={s.B - 5} fontSize={9} fill="var(--c-accent)">
                      √t90 = {f2(tay.x90)}
                    </text>
                  </>
                )}
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Casagrande: ΔH vs log t</div>
          <Chart w={360} h={240} x={{ min: 0.05, max: test.pts[test.pts.length - 1].t * 1.5, log: true, label: 't (min, log)', minor: false }} y={{ min: 0, max: dMax, flip: true, label: 'ΔH (mm)' }} label="log time plot">
            {(s) => (
              <>
                <path d={pathOf(test.pts.map((q) => [q.t, q.d]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} />
                {test.pts.map((q) => (
                  <circle key={q.t} cx={s.X(q.t)} cy={s.Y(q.d)} r={2.2} fill="var(--c-ink)" data-tip={`t = ${fmt(q.t, 3)} min, ΔH = ${fmt(q.d, 3)} mm`} />
                ))}
                {step >= 1 && (
                  <>
                    <line x1={s.L} x2={s.R} y1={s.Y(cas.d0)} y2={s.Y(cas.d0)} stroke="var(--c-load)" strokeDasharray="3 2" />
                    <text x={s.R - 3} y={s.Y(cas.d0) - 3} fontSize={9} textAnchor="end" fill="var(--c-load)">
                      d0 (t = {cas.t1}, 4t)
                    </text>
                  </>
                )}
                {step >= 2 && (
                  <>
                    <path d={pathOf([[cas.t100 / 8, cas.tangent.a + cas.tangent.b * Math.log10(cas.t100 / 8)], [cas.t100 * 2, cas.tangent.a + cas.tangent.b * Math.log10(cas.t100 * 2)]], s)} stroke="var(--c-accent)" strokeWidth={1.1} />
                    <path d={pathOf([[cas.t100 / 2, cas.secondary.a + cas.secondary.b * Math.log10(cas.t100 / 2)], [test.pts[test.pts.length - 1].t * 1.4, cas.secondary.a + cas.secondary.b * Math.log10(test.pts[test.pts.length - 1].t * 1.4)]], s)} stroke="var(--c-accent)" strokeWidth={1.1} />
                    <line x1={s.L} x2={s.R} y1={s.Y(cas.d100)} y2={s.Y(cas.d100)} stroke="var(--c-accent)" strokeDasharray="3 2" />
                    <text x={s.R - 3} y={s.Y(cas.d100) + 10} fontSize={9} textAnchor="end" fill="var(--c-accent)">
                      d100
                    </text>
                  </>
                )}
                {step >= 3 && (
                  <>
                    <line x1={s.L} x2={s.X(cas.t50)} y1={s.Y(cas.d50)} y2={s.Y(cas.d50)} stroke="var(--c-good)" strokeDasharray="3 2" />
                    <line x1={s.X(cas.t50)} x2={s.X(cas.t50)} y1={s.Y(cas.d50)} y2={s.B} stroke="var(--c-good)" strokeDasharray="3 2" />
                    <text x={s.X(cas.t50) + 3} y={s.B - 5} fontSize={9} fill="var(--c-good)">
                      t50 = {f2(cas.t50)}
                    </text>
                  </>
                )}
              </>
            )}
          </Chart>
        </div>
      </div>
      <div key={seed} className="grid cq-lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line p-3 space-y-1 text-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints (±5 %: these are graphical)</div>
          <Answer id={id('t90')} label="t90 (Taylor)" value={tay.t90} unit="min" tol={0.05} compact />
          <Answer id={id('cvT')} label="cv = 0.848d²/t90" value={tay.cv} unit="mm²/min" tol={0.05} compact />
          <Answer id={id('t50')} label="t50 (Casagrande)" value={cas.t50} unit="min" tol={0.05} compact />
          <Answer id={id('cvC')} label="cv = 0.197d²/t50" value={cas.cv} unit="mm²/min" tol={0.05} compact />
        </div>
        <Reveal id={id('sol')} title="Solution and the true cv">
          <Md>{String.raw`**Taylor:** initial line through the first ${tay.nLine} points, d0 = ${f3(tay.d0)} mm; the 1.15× line cuts the curve at √t90 = ${f2(tay.x90)} → t90 = ${f2(tay.t90)} min; $c_v = 0.848(${f2(test.d)})^2/${f2(tay.t90)} = ${f4(tay.cv)}$ mm²/min = **${f2(toYr(tay.cv))} m²/yr**.

**Casagrande:** d0 = 2d(${cas.t1}) − d(${4 * cas.t1}) = ${f3(cas.d0)} mm; d100 = ${f3(cas.d100)} mm (tangent ∩ secondary line); d50 = ${f3(cas.d50)} mm → t50 = ${f2(cas.t50)} min; $c_v = 0.197(${f2(test.d)})^2/${f2(cas.t50)} = ${f4(cas.cv)}$ mm²/min = **${f2(toYr(cas.cv))} m²/yr**.

The data were generated with cv = ${f2(test.cvYr)} m²/yr. 1 mm²/min = 0.5256 m²/yr.`}</Md>
        </Reveal>
      </div>
    </div>
  )
}

export function SecondaryLab() {
  const [o, setO] = useState({ H: 8.5, e0: 0.8, Cc: 0.28, p0: 2650, dp: 970, Ca: 0.02, tp: 1.5, t2: 6.5 })
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const de = o.Cc * Math.log10((o.p0 + o.dp) / o.p0)
  const Sp = (de * o.H) / (1 + o.e0)
  const ep = o.e0 - de
  const s = secondary({ Ca: o.Ca, ep, H: o.H, t1: o.tp, t2: o.t2 })
  const ok = Object.values(o).every((v) => Number.isFinite(v) && v > 0) && o.t2 > o.tp
  const id = (k: string) => `sm-consol:lab:sec:${hashKey(JSON.stringify(o))}:${k}`
  return (
    <div className="grid cq-lg:grid-cols-2 gap-4">
      <div className="space-y-2 text-sm">
        <div className="text-mute">2010-11 Q8(c) (US units: ft, psf, years): NC organic clay, primary complete in tp, find the total settlement at t2.</div>
        <div className="flex flex-wrap gap-2">
          {(['H', 'e0', 'Cc', 'p0', 'dp', 'Ca', 'tp', 't2'] as const).map((k) => (
            <NumIn key={k} label={k === 'p0' ? 'p0′' : k === 'dp' ? 'Δp' : k === 'Ca' ? 'Cα' : k === 'tp' ? 't1 = tp' : k} value={o[k]} onChange={set(k)} step={k === 'Ca' || k === 'Cc' || k === 'e0' ? 0.01 : 0.5} w="w-16" />
          ))}
        </div>
        <Md>{String.raw`$\Delta e = C_c\log\frac{p_0'+\Delta p}{p_0'}$, $e_p = e_0 - \Delta e$, $C_\alpha' = \dfrac{C_\alpha}{1+e_p}$, $S_s = C_\alpha' H\log\dfrac{t_2}{t_1}$ — t1 is the end of primary (t2 measured from the start of loading: "5 years after primary" = tp + 5).`}</Md>
      </div>
      <div key={JSON.stringify(o)} className="rounded-xl border border-line p-3 space-y-1 text-sm">
        {ok ? (
          <>
            <Answer id={id('sp')} label="primary Sp" value={Sp} unit="(H units)" digits={4} abs={0.002} compact />
            <Answer id={id('ep')} label="ep" value={ep} digits={4} abs={0.002} compact />
            <Answer id={id('cap')} label="Cα′" value={s.Cap} digits={5} abs={0.0002} compact />
            <Answer id={id('ss')} label="secondary Ss" value={s.S} digits={4} abs={0.001} compact />
            <Answer id={id('tot')} label="total" value={Sp + s.S} digits={4} abs={0.002} compact />
          </>
        ) : (
          <div className="text-bad">Positive inputs, t2 after tp.</div>
        )}
      </div>
    </div>
  )
}

export function DrainLab() {
  const [o, setO] = useState({ s: 3, rw: 0.15, H: 6, cv: 1, cvr: 1, Uv0: 25 })
  const [pat, setPat] = useState<DrainPattern>('square')
  const [way, setWay] = useState<'one' | 'two'>('one')
  const [tMode, setTMode] = useState<'U' | 't'>('U')
  const [t, setT] = useState(1)
  const set = (k: keyof typeof o) => (v: number) => setO({ ...o, [k]: v })
  const dv = way === 'two' ? o.H / 2 : o.H
  // time: either from "U without drains would be Uv0" or entered directly
  const tt = tMode === 'U' ? (tvApprox(o.Uv0) * dv * dv) / o.cv : t
  const r = sandDrain({ s: o.s, pattern: pat, rw: o.rw, cv: o.cv, cvr: o.cvr, t: tt, dv, tv: 'approx' })
  const ok = Object.values(o).every((v) => Number.isFinite(v) && v > 0) && r.n > 1 && tt > 0
  useEffect(() => {
    if (ok) markUsed('k-barron', { n: +r.n.toFixed(2), Tr: +r.Tr.toFixed(4) })
  })
  const id = (k: string) => `sm-consol:lab:drain:${hashKey(JSON.stringify({ o, pat, way, tMode, t }))}:${k}`
  return (
    <div className="grid cq-lg:grid-cols-2 gap-4">
      <div className="space-y-2 text-sm">
        <div className="text-mute">2012-13 Q11(c) by default: 6 m clay on an impermeable base, 30 cm drains at 3 m square, U at the time when U without drains = 25 %.</div>
        <div className="flex flex-wrap items-center gap-2">
          <NumIn label="spacing s" value={o.s} onChange={set('s')} step={0.25} unit="m" w="w-14" />
          <Seg size="xs" value={pat} onChange={setPat} items={[{ v: 'square', label: 'square (1.128s)' }, { v: 'triangular', label: 'triangular (1.05s)' }]} />
          <NumIn label="rw" value={o.rw} onChange={set('rw')} step={0.025} unit="m" w="w-14" />
          <NumIn label="H" value={o.H} onChange={set('H')} step={0.5} unit="m" w="w-14" />
          <Seg size="xs" value={way} onChange={setWay} items={[{ v: 'one', label: 'one-way' }, { v: 'two', label: 'two-way' }]} />
          <NumIn label="cv" value={o.cv} onChange={set('cv')} step={0.5} unit="m²/yr" w="w-14" />
          <NumIn label="cvr" value={o.cvr} onChange={set('cvr')} step={0.5} unit="m²/yr" w="w-14" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Seg size="xs" value={tMode} onChange={setTMode} items={[{ v: 'U', label: 'time when Uv alone =' }, { v: 't', label: 'time t =' }]} />
          {tMode === 'U' ? <NumIn label="" value={o.Uv0} onChange={set('Uv0')} step={5} unit="%" w="w-14" /> : <NumIn label="" value={t} onChange={setT} step={0.25} unit="yr" w="w-14" />}
        </div>
        <BarronChart n={ok ? r.n : undefined} Tr={ok ? r.Tr : undefined} w={380} />
        <div className="text-[11px] text-load">SJMY's slide labels 0.525s / 0.564s as de — those are re = de/2. de = 1.05s (triangular), 1.128s (square).</div>
      </div>
      <div key={id('k')} className="rounded-xl border border-line p-3 space-y-1 text-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
        {ok ? (
          <>
            <Answer id={id('de')} label="de" value={r.de} unit="m" abs={0.002} compact />
            <Answer id={id('n')} label="n = re/rw" value={r.n} abs={0.02} compact />
            <Answer id={id('Tv')} label="Tv (vertical)" value={r.Tv} digits={4} abs={0.001} compact />
            <Answer id={id('Tr')} label="Tr = cvr t/de²" value={r.Tr} digits={4} abs={0.002} compact />
            <Answer id={id('Ur')} label="Ur (Barron)" value={100 * r.Ur} unit="%" abs={0.5} compact />
            <Answer id={id('U')} label="U = 1 − (1 − Uv)(1 − Ur)" value={100 * r.U} unit="%" abs={0.5} compact />
            <Reveal id={id('sol')} title="Solution">
              <Md>{String.raw`Vertical: d = ${f2(dv)} m, ${tMode === 'U' ? `Uv = ${f2(o.Uv0)} % → Tv = ${f4(r.Tv)}` : `Tv = ${f4(r.Tv)} → Uv = ${f2(100 * r.Uv)} %`}, t = ${f3(tt)} yr. Radial: de = ${f3(r.de)} m, re = ${f3(r.re)} m, n = ${f2(r.n)}, F(n) = ${f3(r.F)}; Tr = ${f2(o.cvr)}(${f3(tt)})/${f3(r.de)}² = ${f4(r.Tr)} → Ur = 1 − e^(−8Tr/F) = ${f2(100 * r.Ur)} % (chart: read the n ≈ ${Math.round(r.n)} curve). U = 1 − (1 − ${f3(r.Uv)})(1 − ${f3(r.Ur)}) = **${f2(100 * r.U)} %**, ${f2(r.U / Math.max(1e-9, r.Uv))}× the progress without drains.`}</Md>
            </Reveal>
          </>
        ) : (
          <div className="text-bad">Positive inputs; n = re/rw must exceed 1.</div>
        )}
      </div>
    </div>
  )
}
