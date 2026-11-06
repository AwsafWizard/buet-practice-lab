// Time-rate lab: Tv–U both ways, one- vs two-way drainage, time for a settlement, settlement at a time, scaling t ∝ d²/cv,
// the time–settlement curve; and the isochrone playground (u(z) animating with Tv, the spring–cylinder share).
import { useEffect, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Answer, Md, Reveal, Seg } from '../../../components/ui'
import { hashKey } from '../../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../../labs/common'
import { useSweep } from '../../../labs/playground'
import { NumIn } from '../../../reference/common'
import { drainPath, scaleTime, tvBy, uBy, uFromTv, uz, type TvMethod } from '../../engine/consolidation'
import { markUsed, openSmRef } from '../../reference/pane'
import { IsochroneFig, SpringFig } from './figs'
import { Chart, Legend, pathOf } from './plot'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)
type Mode = 'time' | 'settle' | 'scale'
const METHODS: { v: TvMethod; label: string }[] = [
  { v: 'table', label: 'printed table' },
  { v: 'approx', label: 'formulas' },
  { v: 'exact', label: 'exact series' },
]

interface RateP {
  H: number
  way: 'one' | 'two'
  cv: number
  S: number
  St: number
  t: number
  t1: number
  d1: number
  d2: number
  cvr: number
}
const START: RateP = { H: 5, way: 'one', cv: 9.5, S: 310, St: 90, t: 1, t1: 130, d1: 2, d2: 2.5, cvr: 1.5 }

export function RateLab() {
  const [p, setP] = useState<RateP>(START)
  const [mode, setMode] = useState<Mode>('time')
  const [m, setM] = useState<TvMethod>('table')
  const [story, setStory] = useState<string | null>('2023-24 Q7(b): H = 5 m drained at the top only, S = 310 mm, cv = 9.5 m²/yr. U when S = 90 mm? (Switch to two-way for part (iii).)')
  const set = (o: Partial<RateP>) => {
    setP({ ...p, ...o })
    setStory(null)
  }
  const d = drainPath(p.H, p.way)
  const U = mode === 'time' ? (100 * p.St) / p.S : uBy((p.cv * p.t) / (d * d), m)
  const Tv = mode === 'time' ? tvBy(U, m) : (p.cv * p.t) / (d * d)
  const t = mode === 'time' ? (Tv * d * d) / p.cv : p.t
  const St = (U / 100) * p.S
  const t2 = scaleTime(p.t1, p.d1, p.d2, 1, p.cvr)
  const valid = [p.H, p.cv, p.S, p.St, p.t].every((v) => Number.isFinite(v) && v > 0) && p.St < p.S
  useEffect(() => {
    if (valid && mode !== 'scale') markUsed('k-tvu', { U: +U.toFixed(2) })
  })
  const key = hashKey(JSON.stringify({ p, mode, m }))
  const id = (k: string) => `sm-consol:lab:rate:${key}:${k}`
  const tEnd = (1.2 * (p.H * p.H)) / Math.max(1e-9, p.cv)
  const ts = Array.from({ length: 100 }, (_, i) => (i / 99) * tEnd)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="btn"
          onClick={() => {
            const r = rng(Math.floor(Math.random() * 1e9))
            const H = randInt(r, 3, 10)
            const way = pick(r, ['one', 'two'] as const)
            const cv = randInt(r, 10, 100) / 10
            const S = randInt(r, 10, 60) * 10
            const St = Math.round(S * randInt(r, 10, 85) / 100)
            setP({ ...p, H, way, cv, S, St, t: randInt(r, 1, 30) / 10 })
            setMode(pick(r, ['time', 'settle'] as const))
            setStory(`A ${H} m clay layer drains ${way === 'two' ? 'at the top and the bottom' : 'at the top only'}; final consolidation settlement ${S} mm; cv = ${cv} m²/yr.`)
          }}
        >
          🎲 New layer
        </button>
        <Seg value={mode} onChange={setMode} items={[{ v: 'time', label: 'time for a settlement' }, { v: 'settle', label: 'settlement at a time' }, { v: 'scale', label: 'scale t ∝ d²/cv' }]} />
        {mode !== 'scale' && <Seg size="xs" value={m} onChange={setM} items={METHODS} />}
      </div>
      {story && <div className="rounded-xl border border-line bg-panel2/50 p-3 text-sm">{story}</div>}
      {mode === 'scale' ? (
        <div className="grid cq-lg:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <NumIn label="t1" value={p.t1} onChange={(v) => set({ t1: v })} step={5} w="w-16" />
              <NumIn label="d1" value={p.d1} onChange={(v) => set({ d1: v })} step={0.1} w="w-14" />
              <NumIn label="d2" value={p.d2} onChange={(v) => set({ d2: v })} step={0.1} w="w-14" />
              <NumIn label="cv2/cv1" value={p.cvr} onChange={(v) => set({ cvr: v })} step={0.1} w="w-14" />
            </div>
            <Md>{String.raw`Same U ⇒ same Tv: $\dfrac{c_{v1}t_1}{d_1^2} = \dfrac{c_{v2}t_2}{d_2^2}$ ⇒ $t_2 = t_1\left(\dfrac{d_2}{d_1}\right)^2\dfrac{c_{v1}}{c_{v2}}$. Lab → field (same soil): $t_f = t_{lab}(d_f/d_{lab})^2$ — e.g. 2 h × (1600/10)² = 51 200 h ≈ 5.84 yr (2017-18 Q6(a)). Layer A → B (2020-21 Q3(b)): d = 2 → 2.5 m, cv ×1.5: 130 days → 135.4 days.`}</Md>
          </div>
          <div key={key} className="rounded-xl border border-line p-3">
            <Answer id={id('t2')} label="t2 (same units as t1)" value={t2} compact />
          </div>
        </div>
      ) : (
        <div className="grid cq-lg:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <NumIn label="H" value={p.H} onChange={(v) => set({ H: v })} step={0.5} unit="m" w="w-14" />
              <Seg size="xs" value={p.way} onChange={(v) => set({ way: v })} items={[{ v: 'one', label: 'one-way (d = H)' }, { v: 'two', label: 'two-way (d = H/2)' }]} />
              <NumIn label="cv" value={p.cv} onChange={(v) => set({ cv: v })} step={0.5} unit="m²/yr" w="w-14" />
              <NumIn label="S final" value={p.S} onChange={(v) => set({ S: v })} step={10} unit="mm" w="w-16" />
              {mode === 'time' ? <NumIn label="St" value={p.St} onChange={(v) => set({ St: v })} step={5} unit="mm" w="w-16" /> : <NumIn label="t" value={p.t} onChange={(v) => set({ t: v })} step={0.1} unit="yr" w="w-14" />}
            </div>
            {valid && (
              <Chart w={420} h={220} x={{ min: 0, max: tEnd, label: 't (years)' }} y={{ min: 0, max: p.S, flip: true, label: 'settlement (mm)' }} label="time settlement curve">
                {(s) => (
                  <>
                    {(['one', 'two'] as const).map((w) => {
                      const dd = drainPath(p.H, w)
                      return <path key={w} d={pathOf(ts.map((tt) => [tt, (uBy((p.cv * tt) / (dd * dd), 'exact') / 100) * p.S]), s)} fill="none" stroke={w === 'one' ? 'var(--c-accent)' : 'var(--c-water)'} strokeWidth={w === p.way ? 2.2 : 1} opacity={w === p.way ? 1 : 0.6} />
                    })}
                    {t <= tEnd && <circle cx={s.X(t)} cy={s.Y(St)} r={4} fill="var(--c-load)" />}
                  </>
                )}
              </Chart>
            )}
            <Legend items={[{ c: 'var(--c-accent)', t: 'one-way' }, { c: 'var(--c-water)', t: 'two-way (4× faster)' }]} />
          </div>
          <div key={key} className="rounded-xl border border-line p-3 space-y-1 text-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Checkpoints</div>
            {valid ? (
              <>
                <Answer id={id('d')} label="drainage path d" value={d} unit="m" compact />
                {mode === 'time' ? (
                  <>
                    <Answer id={id('U')} label="U = St/S" value={U} unit="%" abs={0.1} compact />
                    <Answer id={id('Tv')} label={`Tv (${METHODS.find((x) => x.v === m)!.label})`} value={Tv} digits={4} abs={0.002} compact />
                    <Answer id={id('t')} label="t = Tv d²/cv" value={t} unit="yr" abs={0.005} compact />
                  </>
                ) : (
                  <>
                    <Answer id={id('Tv')} label="Tv = cv t/d²" value={Tv} digits={4} abs={0.002} compact />
                    <Answer id={id('U')} label={`U (${METHODS.find((x) => x.v === m)!.label})`} value={U} unit="%" abs={0.3} compact />
                    <Answer id={id('St')} label="St = U S" value={St} unit="mm" abs={1} compact />
                  </>
                )}
                <Reveal id={id('sol')} title="Solution">
                  <Md>{mode === 'time' ? String.raw`$d = ${f2(d)}$ m; $U = ${f2(p.St)}/${f2(p.S)} = ${f2(U)}\%$ → $T_v = ${f4(Tv)}$ (${m === 'table' ? 'interpolated in the table' : m === 'approx' ? (U < 60 ? '(π/4)U²' : '1.781 − 0.933 log(100 − U)') : 'exact series'}) → $t = T_vd^2/c_v = ${f4(Tv)}(${f2(d)})^2/${f2(p.cv)} = ${f3(t)}$ yr (${fmt(t * 365, 0)} days). With the other drainage: ${f3((Tv * drainPath(p.H, p.way === 'one' ? 'two' : 'one') ** 2) / p.cv)} yr.` : String.raw`$d = ${f2(d)}$ m; $T_v = ${f2(p.cv)}(${f2(p.t)})/${f2(d)}^2 = ${f4(Tv)}$ → $U = ${f2(U)}\%$ → $S_t = ${f2(U / 100)}(${f2(p.S)}) = ${f2(St)}$ mm.`}</Md>
                </Reveal>
              </>
            ) : (
              <div className="text-bad">Positive inputs, St below S.</div>
            )}
            <button className="text-xs text-accent underline" onClick={() => openSmRef('k-tvu')}>
              Tv–U table ↗
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function IsochronePlayground() {
  const [Tv, setTv] = useState(0.1)
  const [play, setPlay] = useState(false)
  const [way, setWay] = useState<'one' | 'two'>('two')
  useSweep(play, 0.001, 1.2, (f) => setTv((x) => +f(x).toFixed(4)), 10)
  const U = uFromTv(Tv)
  const mid = way === 'two' ? 1 : 1
  const umid = 1 - uz(mid, Tv)
  return (
    <div className="grid cq-lg:grid-cols-[1fr_14rem] gap-4">
      <div>
        <IsochroneFig Tv={Tv} way={way} />
        <div className="text-xs text-mute">Shaded = excess pore pressure still in the layer; its area ÷ the initial rectangle = 1 − U. Faint curves: Tv = 0.01 … 1.0.</div>
      </div>
      <div className="space-y-2 text-sm">
        <Seg size="xs" value={way} onChange={setWay} items={[{ v: 'two', label: 'two-way' }, { v: 'one', label: 'one-way' }]} />
        <Slider label="Tv" value={Tv} min={0.001} max={1.2} step={0.001} onChange={setTv} />
        <button className="btn !py-1" onClick={() => setPlay(!play)}>
          {play ? '⏸ pause' : '▶ play'}
        </button>
        <div className="rounded-lg border border-line p-2 text-xs space-y-0.5 num">
          <div>U (average) = <b>{f2(100 * U)} %</b></div>
          <div>u/u0 at the {way === 'two' ? 'middle' : 'impervious base'} = {f3(umid)}</div>
          <div>t = Tv d²/cv: double d → 4× the time</div>
        </div>
        <SpringFig uFrac={umid} />
        <div className="text-[11px] text-faint">Spring–cylinder at the slowest point: water (u) hands the load to the spring (σ′) as it drains.</div>
      </div>
    </div>
  )
}
