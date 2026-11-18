// Tubewell designer: a borehole log with layers, gradation curves, and a well drawn to scale that reacts to every choice;
// then exam-style problems in the shape of 2022-23 Q6(c), 2023-24 Q5(b) and the older sieve-analysis papers, and the
// hand-pump limits (No. 6 suction vs Tara deep-set).
import { useMemo, useState } from 'react'
import { Callout, KV, Md, Section, Seg } from '../../components/ui'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { hashKey } from '../../labs/CheckTable'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import {
  curveFromD,
  designDtw,
  designFromSieve,
  dtwChecks,
  entranceVelocity,
  finerAt,
  handPumpChoice,
  SUCTION,
  type DtwDesign,
  type DtwInput,
  type Layer,
  type SieveRow,
} from '../engine/dtw'
import { GradChart } from '../figs/well-grad'
import { WellLog } from '../figs/well-log'
import { DtwSol, SieveSol, type SieveCase } from '../pyq/sn-dtw'

const n = (v: number, d = 2) => {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s
}
const comma = (v: number) => Math.round(v).toLocaleString('en')

// ------------------------------------------------------------------ the borehole logs of the simulator
interface Preset {
  id: string
  label: string
  blurb: string
  layers: Layer[]
  swl: number
  dia: number
  material: 'steel' | 'uPVC'
  pack: number
  fb: number
  givenPack?: { d10: number; d30: number; d60: number }
}
const PRESETS: Preset[] = [
  {
    id: 'ex1',
    label: 'Slide Example 1',
    blurb: 'Her worked example: SWL 200 ft, aquifer to 660 ft. Layers 1–5 are fine or too graded; the screen goes below 430 ft.',
    swl: 200, dia: 6, material: 'steel', pack: 8, fb: 2.5,
    layers: [
      { top: 0, bot: 160, kind: 'clay', label: 'overburden' },
      { top: 160, bot: 220, fm: 0.88, d60: 0.22, d10: 0.1, cu: 2.2 },
      { top: 220, bot: 260, fm: 1.01, d60: 0.24, d10: 0.06, cu: 4.0 },
      { top: 260, bot: 300, fm: 1.69, d60: 0.36, d10: 0.2, cu: 1.8 },
      { top: 300, bot: 360, fm: 0.93, d60: 0.23, d10: 0.09, cu: 2.56 },
      { top: 360, bot: 430, fm: 1.11, d60: 0.25, d10: 0.1, cu: 2.5 },
      { top: 430, bot: 490, fm: 1.73, d60: 0.4, d10: 0.17, cu: 2.35 },
      { top: 490, bot: 530, fm: 1.62, d60: 0.37, d10: 0.17, cu: 2.18, d30: 0.25 },
      { top: 530, bot: 590, fm: 2.23, d60: 0.53, d10: 0.34, cu: 1.56 },
      { top: 590, bot: 610, fm: 2.08, d60: 0.48, d10: 0.25, cu: 1.92 },
      { top: 610, bot: 660, fm: 1.25, d60: 0.27, d10: 0.15, cu: 1.8 },
    ],
  },
  {
    id: 'chandpur',
    label: 'Chandpur (saline)',
    blurb: '2023-24 Q5(b): saline water in the shallow aquifers above the 740–880 ft clay seal, so only the deep sand below counts.',
    swl: 80, dia: 8, material: 'uPVC', pack: 8, fb: 2.5, givenPack: { d60: 1.35, d30: 1.0, d10: 0.7 },
    layers: [
      { top: 200, bot: 400, kind: 'clay', label: 'clayey soil' },
      { top: 400, bot: 550, fm: 1.12, d60: 0.27, d10: 0.14, cu: 1.59, exclude: 'saline: shallow aquifer above the clay seal' },
      { top: 550, bot: 640, fm: 1.34, d60: 0.3, d10: 0.17, cu: 1.76, exclude: 'saline: shallow aquifer above the clay seal' },
      { top: 640, bot: 740, fm: 0.67, d60: 0.2, d10: 0.09, cu: 2.22, exclude: 'saline: shallow aquifer above the clay seal' },
      { top: 740, bot: 880, kind: 'clay', label: 'clay seal' },
      { top: 880, bot: 930, fm: 1.28, d60: 0.28, d10: 0.16, cu: 1.75 },
      { top: 930, bot: 1020, fm: 1.38, d60: 0.31, d10: 0.18, cu: 1.72 },
      { top: 1020, bot: 1090, fm: 0.73, d60: 0.23, d10: 0.13, cu: 1.77 },
      { top: 1090, bot: 1150, kind: 'clay', label: 'clayey soil' },
    ],
  },
  {
    id: 'thin',
    label: '2022-23 shape',
    blurb: '2022-23 Q6(c): one water-bearing sand 180–350 ft, SWL 150 ft. The housing pipe eats the top of it, so the maximum allowable screen is set by what is left.',
    swl: 150, dia: 6, material: 'steel', pack: 6, fb: 3,
    layers: [
      { top: 0, bot: 180, kind: 'clay', label: 'clay and silt' },
      { top: 180, bot: 350, fm: 1.41, d10: 0.14, d30: 0.203, d60: 0.313 },
      { top: 350, bot: 380, kind: 'clay', label: 'clay' },
    ],
  },
]

const SLOTS = [20, 25, 30, 35, 40]

function DesignerSim() {
  const [pid, setPid] = useState('ex1')
  const P = PRESETS.find((p) => p.id === pid)!
  const [swl, setSwl] = useState(P.swl)
  const [dia, setDia] = useState(P.dia)
  const [mat, setMat] = useState<'steel' | 'uPVC'>(P.material)
  const [packT, setPackT] = useState(P.pack)
  const [fb, setFb] = useState(P.fb)
  const [top, setTop] = useState<number | undefined>()
  const [len, setLen] = useState<number | undefined>()
  const [slot, setSlot] = useState<number | undefined>()
  const [pump, setPump] = useState(100)
  const [decline, setDecline] = useState(2)

  const loadPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!
    setPid(id)
    setSwl(p.swl)
    setDia(p.dia)
    setMat(p.material)
    setPackT(p.pack)
    setFb(p.fb)
    setTop(undefined)
    setLen(undefined)
    setSlot(undefined)
    setPump(100)
  }
  const base: DtwInput = {
    layers: P.layers,
    housing: { swl, decline, bowlOD: 12 },
    strainerDia: dia,
    material: mat,
    packThickness: packT,
    pack: P.givenPack,
    fb,
    packAbove: P.id === 'chandpur' ? 50 : 40,
    placement: P.id === 'chandpur' ? 'centre' : 'top',
  }
  const auto = useMemo(() => {
    try {
      return designDtw(base)
    } catch {
      return null
    }
  }, [pid, swl, dia, mat, packT, fb, decline]) // eslint-disable-line react-hooks/exhaustive-deps
  const manual = top !== undefined || len !== undefined || slot !== undefined
  const d: DtwDesign | null = useMemo(() => {
    if (!auto) return null
    return manual ? designDtw({ ...base, screenTop: top ?? auto.strainer.top, screenLength: len ?? auto.length, slotNo: slot }) : auto
  }, [auto, top, len, slot]) // eslint-disable-line react-hooks/exhaustive-deps
  const bottomAll = Math.max(...P.layers.map((l) => l.bot))
  const pumpCfs = d ? (d.yield.cfs * pump) / 100 : 0
  const checks = d ? dtwChecks(d, pumpCfs) : []
  const vNow = d ? entranceVelocity(pumpCfs, d.eta, d.input.strainerDia, d.length, d.yield.fb) : 0

  const sandCurve = d?.finest ? curveFromD(d.finest.d10 ?? 0.1, d.finest.d30, d.finest.d60 ?? 0.3) : []
  const packCurve = d ? curveFromD(d.pack.d10, d.pack.d30, d.pack.d60) : []
  const passing = d ? finerAt(packCurve, d.slot.widthMm) : 0
  const goodLayers = P.layers.filter((l) => l.kind !== 'clay')

  const place = (l: Layer) => {
    if (!d) return
    const t = Math.max(l.top + 10, d.housing.length + 20)
    setTop(Math.min(t, l.bot - 20))
    setLen(Math.max(10, Math.min(100, l.bot - t - 10)))
  }

  if (!auto || !d) return <Callout kind="trap" title="No usable layer">With these water-level numbers the housing pipe reaches below the whole log: lower the SWL or the decline.</Callout>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((p) => (
          <button key={p.id} className={'btn !py-1 !text-xs ' + (p.id === pid ? '!border-accent text-accent' : '')} onClick={() => loadPreset(p.id)}>
            {p.label}
          </button>
        ))}
        <span className="text-xs text-faint basis-full">{P.blurb}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div>
          <WellLog d={d} title={manual ? 'Your design' : 'Her rule (auto)'} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-line p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-faint">Water level and pipes</div>
            <Slider label="static water level" value={swl} min={20} max={Math.min(380, bottomAll - 60)} step={10} unit=" ft" onChange={setSwl} />
            <Slider label="decline per year" value={decline} min={0} max={10} step={1} unit=" ft/yr" onChange={setDecline} />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-mute">strainer ⌀</span>
              <Seg value={String(dia)} onChange={(v) => setDia(+v)} items={[4, 6, 8, 10, 12].map((v) => ({ v: String(v), label: `${v} in` }))} />
              <span className="text-mute">material</span>
              <Seg value={mat} onChange={setMat} items={[{ v: 'steel', label: 'steel' }, { v: 'uPVC', label: 'uPVC (½ open)' }]} />
            </div>
            <Slider label="gravel pack thickness" value={packT} min={3} max={8} unit=" in" onChange={setPackT} />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-mute">blockage factor F_B</span>
              <Seg value={String(fb)} onChange={(v) => setFb(+v)} items={[{ v: '2.5', label: '2.5' }, { v: '3', label: '3 (default)' }]} />
            </div>
          </div>

          <div className="rounded-xl border border-line p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-faint">Your choices</div>
              <button className="btn !py-0.5 !text-xs" onClick={() => (setTop(undefined), setLen(undefined), setSlot(undefined))} disabled={!manual}>
                back to her rule
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {goodLayers.map((l, i) => {
                const rl = d.layers.find((x) => x.top === l.top)!
                return (
                  <button
                    key={i}
                    onClick={() => place(l)}
                    className="rounded-lg border px-2 py-0.5 text-xs"
                    style={{ borderColor: rl.usable ? 'var(--c-good)' : 'var(--c-bad)', color: rl.usable ? 'var(--c-good)' : 'var(--c-bad)' }}
                    title={rl.why}
                  >
                    {l.top}–{l.bot} ft · FM {l.fm}
                  </button>
                )
              })}
              <span className="text-xs text-faint basis-full">tap a layer to put the screen in it</span>
            </div>
            <Slider label="screen top" value={Math.round(d.strainer.top)} min={Math.round(d.housing.length) - 40} max={bottomAll - 20} step={5} unit=" ft" onChange={(v) => setTop(v)} />
            <Slider label="screen length" value={Math.round(d.length)} min={10} max={160} step={5} unit=" ft" onChange={(v) => setLen(v)} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-mute">slot no.</span>
              <Seg value={String(d.slot.slot)} onChange={(v) => setSlot(+v)} items={SLOTS.map((v) => ({ v: String(v), label: `#${v}` }))} />
              <span className="text-xs text-faint">her rule: {n(d.slot.raw, 1)} → round down</span>
            </div>
            <Slider label="pump at" value={pump} min={20} max={200} step={5} unit=" % of its yield" onChange={setPump} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Finest sand in the screen and the gravel pack</div>
          <GradChart
            curves={[
              { label: `finest sand (FM ${d.finest?.fm ?? '–'}, Cu ${n(d.finest?.cu ?? 0, 2)})`, pts: sandCurve },
              { label: `gravel pack ×${d.pack.how === 'given' ? '(given)' : d.factor}`, pts: packCurve, dashed: true, color: 'var(--c-load)' },
            ]}
            mark={[{ size: d.slot.widthMm, finer: passing, label: `slot #${d.slot.slot} = ${n(d.slot.widthMm, 2)} mm` }]}
          />
          <p className="text-xs text-mute mt-1">
            The slot holds back the pack coarser than {n(d.slot.widthMm, 2)} mm; <b style={{ color: passing > 10.5 ? 'var(--c-bad)' : 'var(--c-good)' }}>{n(passing, 1)} %</b> of the pack is finer than that (rule: at most 10 %, so slot ≤ D10 of the pack).
          </p>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-1">Numbers</div>
          <KV k="housing pipe length" v={n(d.housing.length, 0)} unit="ft" />
          <KV k="strainer" v={`${n(d.strainer.top, 0)}–${n(d.strainer.bot, 0)}`} unit="ft" />
          <KV k="blind pipe" v={`${n(d.blind.top, 0)}–${n(d.blind.bot, 0)}`} unit="ft" />
          <KV k="gravel pack" v={`${n(d.packRange.top, 0)}–${n(d.packRange.bot, 0)}`} unit="ft" />
          <KV k="pack D30 / D10" v={`${n(d.pack.d30, 2)} / ${n(d.pack.d10, 2)}`} unit="mm" />
          <KV k="slot (raw → chosen)" v={`${n(d.slot.raw, 1)} → #${d.slot.slot}`} />
          <KV k="open area" v={n(d.eta * 100, 1)} unit="%" />
          <KV k="borehole" v={d.boreholeDia} unit="in" />
          <KV k="yield" v={`${n(d.yield.cfs, 3)} cusec`} unit={`= ${comma(d.yield.lph)} L/h`} />
          <KV k={`entrance velocity at ${pump} %`} v={n(vNow, 3)} unit="ft/s (limit 0.1)" />
          <div className="mt-2 space-y-1">
            {checks.map((c, i) => (
              <div
                key={i}
                className="text-xs rounded-lg px-2 py-1"
                style={{
                  background: `color-mix(in oklab, ${c.level === 'bad' ? 'var(--c-bad)' : c.level === 'warn' ? 'var(--c-load)' : 'var(--c-good)'} 10%, transparent)`,
                  color: c.level === 'bad' ? 'var(--c-bad)' : c.level === 'warn' ? 'var(--c-load)' : 'var(--c-good)',
                }}
              >
                {c.level === 'bad' ? '✗ ' : c.level === 'warn' ? '⚠ ' : '✓ '}
                {c.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Callout kind="tip" title="Try: slide the screen up">
          Drag the screen top into 260–430 ft on Example 1. The log marks the poor layers (FM below 1 or Cu above 2.5), the 10 ft clearance and the housing pipe.
        </Callout>
        <Callout kind="tip" title="Try: slot #40">
          A wider slot lets more than 10 % of the gravel pack through. A finer slot looks safe but chokes the openings, so she rounds the raw number down.
        </Callout>
        <Callout kind="tip" title="Try: pump at 200 %">
          The yield is the pumping rate that keeps the entrance velocity at 0.1 ft/s (after the blockage factor). Beyond that the screen incrusts and corrodes.
        </Callout>
      </div>
      <p className="text-xs text-faint">Screen capacity ∝ open area × π D L: both diameter and length enter the formula, but in a thick aquifer length raises the real yield far more than diameter, so she makes the screen as long as the rules allow (≤ 100 ft; the 70/75/80 % rule) and then picks D for the use (community deep tubewell 6 in).</p>
    </div>
  )
}

// ------------------------------------------------------------------ hand pumps
function HandPumpWidget() {
  const [swl, setSwl] = useState(5)
  const [patm, setPatm] = useState(14.7)
  const r = handPumpChoice(swl)
  const W = 520
  const H = 260
  const T = 14
  const L = 70
  const maxM = 40
  const Y = (m: number) => T + (m / maxM) * (H - T - 20)
  const lift = patm * 2.31
  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="hand pump limits" style={{ maxWidth: 560 }}>
          <rect x={L} y={T} width={150} height={H - T - 20} fill="var(--c-panel2)" stroke="var(--c-line)" />
          {[0, 10, 20, 30, 40].map((m) => (
            <g key={m}>
              <line x1={L - 5} y1={Y(m)} x2={L} y2={Y(m)} stroke="var(--c-faint)" />
              <text x={L - 8} y={Y(m) + 4} textAnchor="end" fontSize="11" fill="var(--c-mute)">
                {m} m
              </text>
            </g>
          ))}
          {/* ranges */}
          <rect x={L + 8} y={Y(0)} width={34} height={Y(SUCTION.practicalM) - Y(0)} fill="var(--c-good)" opacity={0.5} />
          <rect x={L + 54} y={Y(0)} width={34} height={Y(30) - Y(0)} fill="var(--c-accent)" opacity={0.35} />
          <text x={L + 25} y={Y(0) - 3} textAnchor="middle" fontSize="11" fill="var(--c-ink)">No. 6</text>
          <text x={L + 71} y={Y(0) - 3} textAnchor="middle" fontSize="11" fill="var(--c-ink)">Tara</text>
          <line x1={L} y1={Y(SUCTION.practicalM)} x2={L + 150} y2={Y(SUCTION.practicalM)} stroke="var(--c-good)" strokeDasharray="5 3" />
          <line x1={L} y1={Y(10)} x2={L + 150} y2={Y(10)} stroke="var(--c-faint)" strokeDasharray="2 3" />
          <line x1={L} y1={Y(30)} x2={L + 150} y2={Y(30)} stroke="var(--c-accent)" strokeDasharray="5 3" />
          {/* water level */}
          <line x1={L - 10} y1={Y(swl)} x2={L + 150} y2={Y(swl)} stroke="var(--c-water)" strokeWidth="2.5" />
          <text x={L + 156} y={Y(swl) + 4} fontSize="11" fontWeight="700" fill="var(--c-water)">
            SWL {n(swl, 1)} m
          </text>
          <text x={L + 156} y={Y(SUCTION.practicalM) + 4} fontSize="11" fill="var(--c-good)">practical suction 7.5 m</text>
          <text x={L + 156} y={Y(10) + 4} fontSize="11" fill="var(--c-mute)">theoretical 10 m (32.8 ft)</text>
          <text x={L + 156} y={Y(30) + 4} fontSize="11" fill="var(--c-accent)">deep-set limit 30 m (100 ft)</text>
          <text x={L + 156} y={Y(18) + 4} fontSize="11" fill="var(--c-mute)">Tara cylinder at 18 m</text>
          <line x1={L + 150} y1={Y(18)} x2={L + 154} y2={Y(18)} stroke="var(--c-faint)" />
        </svg>
        <div className="space-y-2 text-sm">
          <Slider label="static water level below the pump" value={swl} min={1} max={40} step={0.5} unit=" m" onChange={setSwl} />
          <div className="rounded-xl border p-3" style={{ borderColor: r.no6 ? 'var(--c-good)' : r.tara ? 'var(--c-accent)' : 'var(--c-bad)' }}>
            <div className="font-bold">{r.best}</div>
            <p className="text-xs text-mute mt-1">{r.why}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NumIn label="atmospheric pressure" value={patm} onChange={setPatm} step={0.1} unit="psi" />
            <span className="text-xs text-mute">
              theoretical lift = {n(patm, 1)} × 2.31 = {n(lift, 1)} ft = {n(lift * 0.3048, 1)} m; her slide: 32.8 ft (10 m) at 14.7 psi
            </span>
          </div>
        </div>
      </div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left text-mute border-b border-line">
            <th className="py-1 pr-2">&nbsp;</th>
            <th className="pr-2">No. 6 (shallow, suction)</th>
            <th>Tara (deep-set, force mode)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Principle', 'piston lifts a vacuum: atmosphere pushes the water up', 'displacement pump: piston below the water level pushes it up'],
            ['Limit', '7.5 m practical (22–25 ft; 32.8 ft theory) to the static level', 'about 30 m (100 ft) from the static level; cylinder set at 18 m, tapping to 15 m below ground'],
            ['Output', '30–40 L/min; life 15–20 yr; barrel 6 in', 'about 4 m³/d at 7 m lift, 1.5 m³/d at 12 m lift'],
            ['Pipes', '38 mm blind pipe and strainer, slot #8/#10/#12, sand trap 4–6 ft', '75 mm casing, 50 mm cylinder, 38 mm lower casing and screen, 32 mm PVC rod'],
          ].map((row) => (
            <tr key={row[0]} className="border-b border-line/50 align-top">
              <td className="py-1 pr-2 font-semibold">{row[0]}</td>
              <td className="pr-2">{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ------------------------------------------------------------------ exam problems
type Fam = 'log' | 'saline' | 'sieve'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'log', label: '2022-23 style (one sand layer)' },
  { v: 'saline', label: '2023-24 style (saline, strata table)' },
  { v: 'sieve', label: 'Older papers (sieve data)' },
]

interface PP extends XProblem<Fam> {
  d?: DtwDesign
  sieve?: SieveCase
  given?: string[]
  assumed?: string[]
  figure?: { d10: number; d30: number; d60: number }
}

const r3 = (v: number) => Math.round(v * 1000) / 1000
const r2 = (v: number) => Math.round(v * 100) / 100

function makeLog(seed: number, level: Level): PP {
  const r = rng(seed * 733 + 21)
  const swl = randInt(r, 100, 250, 10)
  const dia = pick(r, [6, 8])
  const housing = pick(r, [12, 14, 16])
  const cu = level === 'basic' ? 1.4 + randInt(r, 0, 1) * 0.05 : level === 'exam' ? 1.7 + randInt(r, 0, 6) * 0.1 : 2.1 + randInt(r, 0, 3) * 0.1
  const d10 = randInt(r, 12, 20) / 100
  const d60 = r3(d10 * cu)
  const d30 = r3(d10 * cu ** 0.4 * (0.97 + r() * 0.06))
  const hl = swl + 40 + 30
  const top = swl + 30
  const thick = level === 'tough' ? randInt(r, 50, 100, 10) : randInt(r, 90, 250, 10)
  const bot = hl + thick
  const material = level === 'tough' ? 'uPVC' : 'steel'
  const input: DtwInput = {
    layers: [{ top, bot, fm: 1.4, d10, d30, d60 }],
    housing: { swl, bowlOD: housing - 2 },
    strainerDia: dia,
    material,
    packThickness: 6,
    fb: 3,
  }
  const d = designDtw(input)
  const steps: XStep[] = [
    { key: 'lh', group: 'Housing pipe', label: 'housing pipe length', value: d.housing.length, unit: 'ft', digits: 0, abs: 1 },
    { key: 'av', group: 'Strainer', label: 'aquifer left below the housing', value: d.avail, unit: 'ft', digits: 0, abs: 1 },
    { key: 'len', group: 'Strainer', label: 'strainer length (max allowable)', value: d.length, unit: 'ft', digits: 0, abs: 1 },
    { key: 'top', group: 'Strainer', label: 'strainer top depth', value: d.strainer.top, unit: 'ft', digits: 0, abs: 5 },
    { key: 'f', group: 'Gravel pack and slot', label: 'multiplying factor (rounded)', value: d.factor, digits: 0, abs: 0.4, tol: 0 },
    { key: 'd30', group: 'Gravel pack and slot', label: 'D30 of the pack', value: d.pack.d30, unit: 'mm', digits: 3, tol: 0.03 },
    { key: 'd10', group: 'Gravel pack and slot', label: 'D10 of the pack', value: d.pack.d10, unit: 'mm', digits: 3, tol: 0.03 },
    { key: 'slot', group: 'Gravel pack and slot', label: 'slot number (20 / 30 / 40)', value: d.slot.slot, digits: 0, abs: 0.4, tol: 0 },
    { key: 'eta', group: 'Yield', label: 'open area', value: d.eta * 100, unit: '%', digits: 1, abs: 0.3, tol: 0 },
    { key: 'q', group: 'Yield', label: 'yield', value: d.yield.cfs, unit: 'cusec', digits: 3, tol: 0.03 },
    { key: 'lph', group: 'Yield', label: 'yield', value: d.yield.lph, unit: 'L/h', digits: 0, tol: 0.03 },
  ]
  return {
    family: 'log',
    level,
    title: '2022-23 Q6(c) style',
    hash: hashKey(JSON.stringify([seed, level, 'log', swl, d10, d60])),
    d,
    figure: { d10, d30, d60 },
    given: [`static water level ${swl} ft`, `water-bearing strata ${top}–${bot} ft, water suitable for drinking`, `finest sand of the strata: D10 = ${d10}, D30 = ${d30}, D60 = ${d60} mm (read off the gradation chart; Cu = ${n(d60 / d10, 2)})`, `${dia} in ${material === 'uPVC' ? 'uPVC' : 'steel'} strainer, ${housing} in housing pipe`, 'open area 20 / 15 / 10 % for 40 / 30 / 20-slot' + (material === 'uPVC' ? ', half of that for uPVC' : '')],
    assumed: ['decline 2 ft/yr over 20 yr; drawdown 15 ft; safety 15 ft', 'entrance velocity 0.1 ft/s; F_B = 3', 'sand trap 10 ft; pack thickness 6 in; no clay inside the strata'],
    text: `The test boring for a deep tubewell gives: static water level **${swl} ft**; suitable water-bearing strata **${top}–${bot} ft**; the finest sand layer of the strata has **D10 = ${d10} mm, D30 = ${d30} mm, D60 = ${d60} mm**. Consider a **${dia} in ${material === 'uPVC' ? 'uPVC' : 'steel'}** strainer and a **${housing} in** housing pipe. Design the well: housing pipe length, position and length of the strainer (**maximum allowable length**), gravel pack, slot number and the estimated yield; sketch the well section. *(Open area ${material === 'uPVC' ? '20 / 15 / 10 % (steel) for 40 / 30 / 20-slot, half for uPVC' : '20 / 15 / 10 % for 40 / 30 / 20-slot'}; assume reasonable values for the rest: 2 ft/yr decline for 20 yr, drawdown 15 ft, safety 15 ft, F_B = 3.)*`,
    steps,
  }
}

function makeSaline(seed: number, level: Level): PP {
  const r = rng(seed * 421 + 77)
  const swl = randInt(r, 40, 120, 10)
  const dia = pick(r, [6, 8, 10])
  const material = level === 'basic' ? 'steel' : pick(r, ['uPVC', 'steel'] as const)
  const t = (a: number, b: number) => randInt(r, a, b, 10)
  const layers: Layer[] = []
  let z = 200
  const add = (th: number, l: Partial<Layer>) => {
    layers.push({ top: z, bot: z + th, ...l })
    z += th
  }
  add(t(100, 200), { kind: 'clay' })
  const sal = 'saline: shallow aquifer above the clay seal'
  const gd = (fm: [number, number], cuR: [number, number]) => {
    const d10 = randInt(r, 13, 19) / 100
    const cu = r2(cuR[0] + r() * (cuR[1] - cuR[0]))
    return { fm: r2(fm[0] + r() * (fm[1] - fm[0])), d10, d60: r2(d10 * cu), cu }
  }
  add(t(80, 150), { ...gd([1.1, 1.4], [1.5, 1.9]), exclude: sal })
  add(t(60, 100), { ...gd([1.2, 1.5], [1.6, 1.9]), exclude: sal })
  add(t(60, 100), { ...gd([0.6, 0.9], [2.1, 2.4]), exclude: sal })
  add(t(100, 160), { kind: 'clay', label: 'clay seal' })
  const th1 = level === 'tough' ? t(20, 40) : t(40, 70)
  const th2 = level === 'tough' ? t(40, 60) : t(50, 90)
  add(th1, gd([1.15, 1.45], [1.6, 1.9]))
  add(th2, gd([1.25, 1.55], [1.6, 1.9]))
  add(t(60, 90), gd([0.6, 0.95], [1.7, 2.0]))
  add(t(50, 90), { kind: 'clay' })
  const pd10 = randInt(r, 10, 18) / 20
  const pack = { d10: pd10, d30: r2(pd10 * 1.4), d60: r2(pd10 * 1.9) }
  const packT = pick(r, [6, 8])
  const input: DtwInput = { layers, housing: { swl }, strainerDia: dia, material, packThickness: packT, pack, fb: 2.5, packAbove: 40 }
  const d = designDtw(input)
  const rows = layers.map((l, i) => `| ${l.kind === 'clay' ? '–' : layers.filter((x, k) => k <= i && x.kind !== 'clay').length} | ${l.top}–${l.bot} | ${l.kind === 'clay' ? 'Clayey soil' : l.fm} | ${l.kind === 'clay' ? '' : l.d60} | ${l.kind === 'clay' ? '' : l.d10} | ${l.kind === 'clay' ? '' : l.cu} |`).join('\n')
  const steps: XStep[] = [
    { key: 'lh', group: 'Housing pipe', label: 'housing pipe length', value: d.housing.length, unit: 'ft', digits: 0, abs: 1 },
    { key: 'av', group: 'Zone and strainer', label: 'thickness of the usable zone', value: d.avail, unit: 'ft', digits: 0, abs: 1 },
    { key: 'len', group: 'Zone and strainer', label: 'strainer length', value: d.length, unit: 'ft', digits: 0, abs: 1 },
    { key: 'top', group: 'Zone and strainer', label: 'strainer top depth', value: d.strainer.top, unit: 'ft', digits: 0, abs: 5 },
    { key: 'slot', group: 'Slot and open area', label: 'slot number (20 / 30 / 40)', value: d.slot.slot, digits: 0, abs: 0.4, tol: 0 },
    { key: 'eta', group: 'Slot and open area', label: 'open area', value: d.eta * 100, unit: '%', digits: 1, abs: 0.2, tol: 0 },
    { key: 'q', group: 'Yield', label: 'yield', value: d.yield.cfs, unit: 'cusec', digits: 3, tol: 0.03 },
    { key: 'lph', group: 'Yield', label: 'yield', value: d.yield.lph, unit: 'L/h', digits: 0, tol: 0.03 },
  ]
  return {
    family: 'saline',
    level,
    title: '2023-24 Q5(b) style',
    hash: hashKey(JSON.stringify([seed, level, 'saline', swl, dia])),
    d,
    given: [`piezometric (static) level ${swl} ft`, `strainer ${dia} in ${material}`, `gravel pack D60 / D30 / D10 = ${pack.d60} / ${pack.d30} / ${pack.d10} mm, thickness ${packT} in`, 'open area 20 / 15 / 10 % (steel) for 40 / 30 / 20-slot, half for uPVC', 'salinity very high in the area'],
    assumed: ['decline 2 ft/yr over 20 yr, drawdown 15 ft, safety 15 ft', 'entrance velocity 0.1 ft/s, F_B = 2.5', 'layers above the clay seal carry the saline water and are left out', 'sand trap 10 ft; pack 40 ft above the screen; screen 10 ft below the clay'],
    text: `A groundwater supply is planned in a coastal area where the **shallow aquifers are very saline** (above the thick clay seal). Grain-size results are below; static (piezometric) level **${swl} ft**; **${dia} in ${material}** strainer; gravel pack **D60 / D30 / D10 = ${pack.d60} / ${pack.d30} / ${pack.d10} mm**, thickness **${packT} in**. Open area: 40-slot 20 %, 30-slot 15 %, 20-slot 10 % for steel, **half for uPVC**. Find the housing pipe, the strainer, the yield (F_B = 2.5) and draw the well log.

| Sl | Depth (ft) | FM | D60 (mm) | D10 (mm) | Cu |
|---|---|---|---|---|---|
${rows}`,
    steps,
  }
}

function makeSieve(seed: number, level: Level): PP {
  const r = rng(seed * 151 + 9)
  const w30 = randInt(r, 1, 8) / 10
  const w40 = randInt(r, 5, 25) / 10
  const w50 = level === 'basic' ? randInt(r, 40, 140) / 10 : randInt(r, 20, 260) / 10
  const w200 = randInt(r, 50, 280) / 10
  const pan = randInt(r, 1, 25) / 10
  const w100 = r2(100 - w30 - w40 - w50 - w200 - pan)
  const rows: SieveRow[] = [
    { no: '30', size: 0.6, retained: w30 },
    { no: '40', size: 0.425, retained: w40 },
    { no: '50', size: 0.3, retained: w50 },
    { no: '100', size: 0.15, retained: w100 },
    { no: '200', size: 0.075, retained: w200 },
  ]
  const strainerMm = pick(r, [100, 150])
  const thicknessM = pick(r, [30, 40, 50, 60])
  const open = pick(r, [0.1, 0.12, 0.13, 0.15])
  const c: SieveCase = { rows, pan, strainerMm, thicknessM, open, assumed: ['F_B = 3, entrance velocity 0.1 ft/s'] }
  const d = designFromSieve({ rows, pan, strainerMm, thicknessM, open })
  const y = d.yield!
  const steps: XStep[] = [
    { key: 'd10', group: 'The curve', label: 'D10', value: d.stats.d10, unit: 'mm', digits: 3, tol: 0.05 },
    { key: 'cu', group: 'The curve', label: 'Cu = D60 / D10', value: d.stats.cu, digits: 2, tol: 0.05 },
    { key: 'f', group: 'Gravel pack and slot', label: 'multiplying factor (rounded)', value: d.factor, digits: 0, abs: 0.4, tol: 0 },
    { key: 'pd10', group: 'Gravel pack and slot', label: 'D10 of the pack', value: d.pack.d10, unit: 'mm', digits: 3, tol: 0.05 },
    { key: 'slot', group: 'Gravel pack and slot', label: 'slot number (20 / 30 / 40)', value: d.slot.slot, digits: 0, abs: 0.4, tol: 0 },
    { key: 'len', group: 'Screen and yield', label: 'screen length', value: d.screen!.Lft, unit: 'ft', digits: 0, abs: 1 },
    { key: 'q', group: 'Screen and yield', label: 'yield', value: y.cfs, unit: 'cusec', digits: 3, tol: 0.04 },
    { key: 'lph', group: 'Screen and yield', label: 'yield', value: y.lph, unit: 'L/h', digits: 0, tol: 0.04 },
  ]
  const tab = ['| Sieve No. | Size (mm) | Retained (g) |', '|---|---|---|', ...rows.map((x) => `| ${x.no} | ${x.size} | ${x.retained} |`), `| Pan | – | ${pan} |`].join('\n')
  return {
    family: 'sieve',
    level,
    title: 'older sieve-analysis paper',
    hash: hashKey(JSON.stringify([seed, level, 'sieve', rows, strainerMm])),
    sieve: c,
    text: `Design a tubewell with the following sieve analysis of the aquifer sample. Diameter of the strainer **${strainerMm} mm**, thickness of the aquifer **${thicknessM} m**, and the opening area of the strainer is **${n(open * 100, 0)} %** of its surface. *(Take F_B = 3 and an entrance velocity of 0.1 ft/s.)*

${tab}`,
    steps,
  }
}

export function make(seed: number, family?: Fam, level: Level = 'exam'): PP {
  const f = family ?? pick(rng(seed * 31 + 7), ['log', 'saline', 'sieve'] as Fam[])
  return f === 'log' ? makeLog(seed, level) : f === 'saline' ? makeSaline(seed, level) : makeSieve(seed, level)
}

function Solution({ p }: { p: PP }) {
  if (p.sieve) return <SieveSol c={p.sieve} />
  const d = p.d!
  return (
    <DtwSol
      d={d}
      given={p.given!}
      assumed={p.assumed!}
      curve={p.figure ? { pts: curveFromD(p.figure.d10, p.figure.d30, p.figure.d60), label: 'finest sand' } : undefined}
    />
  )
}

function Problems() {
  return (
    <ExamProblems<Fam, PP>
      topic="ev-well:lab"
      families={FAMS}
      make={make}
      solution={(p) => <Solution p={p} />}
      figure={(p) =>
        p.figure ? (
          <GradChart curves={[{ label: 'finest sand', pts: curveFromD(p.figure.d10, p.figure.d30, p.figure.d60) }]} mark={[{ size: p.figure.d10, finer: 10, label: `D10 ${p.figure.d10}` }, { size: p.figure.d30, finer: 30, label: `D30 ${p.figure.d30}` }, { size: p.figure.d60, finer: 60, label: `D60 ${p.figure.d60}` }]} />
        ) : null
      }
      foot="Her defaults when the paper is silent: decline 2 ft/yr for 20 yr, drawdown 15 ft, safety 15 ft, V = 0.1 ft/s, F_B = 3 (her slide example uses 2.5), sand trap 10 ft, slots rounded down to #20 / #30 / #40."
      initialSeed={5}
    />
  )
}

export default function WellLab() {
  const [tab, setTab] = useState<'sim' | 'pump'>('sim')
  return (
    <div className="space-y-6">
      <Section
        title="Tubewell designer"
        sub="Pick the layer, the slot and the strainer on a drawn borehole log and watch the housing pipe, blind pipe, strainer and gravel pack move to scale while the open area, entrance velocity and yield update."
        right={<Seg value={tab} onChange={setTab} items={[{ v: 'sim', label: 'Deep tubewell' }, { v: 'pump', label: 'Hand pumps' }]} />}
      >
        {tab === 'sim' ? <DesignerSim /> : <HandPumpWidget />}
      </Section>
      <Problems />
      <Md className="text-xs text-faint">{`Procedure checked against her Example 1 (housing 270 ft, strainer 440–540 ft, pack D30 1.25 mm, slot 30, 0.942 cusec ≈ 96,000 L/h) and the Chandpur solution (150 ft housing, 20-slot, 0.4188 cusec ≈ 42,700 L/h).`}</Md>
    </div>
  )
}
