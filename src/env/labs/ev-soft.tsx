// Softening bench: the bar diagram of a water analysis, stepped through lime, soda ash and recarbonation, the doses tallied,
// a split-treatment bypass slider with the blended hardness, then exam-style problems.
import { useState, type ReactNode } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { toCaCO3 } from '../engine/chem'
import { analyse, bars, masses, slideExcess, splitAt, splitTreatment, treat, waterFromIons, type Water } from '../engine/soften'
import { BarDiagram, SplitFlow } from '../figs/soft-bars'
import { doseTableMd, FAC, hardnessTableMd, ionTableMd, massTableMd } from '../figs/ta-soft'

const f = (v: number, d = 1) => v.toFixed(d)
const tx = String.raw

interface Ions { co2: number; ca: number; mg: number; na: number; cl: number; so4: number; alk: number }
const PRESETS: Record<string, { label: string; v: Ions }> = {
  sheet: { label: 'Split-treatment sheet', v: { co2: 5.5, ca: 95.2, mg: 22, na: 25.8, cl: 67.8, so4: 73, alk: 198 } },
  t07b: { label: 'T07 Problem 2', v: { co2: 9.6, ca: 95.2, mg: 13.5, na: 25.8, cl: 67.8, so4: 73, alk: 198 } },
  p2324: { label: '2023-24 Q2(c)', v: { co2: 9, ca: 102, mg: 45, na: 0, cl: 0, so4: 138, alk: 298.4 } },
  p2223: { label: '2022-23 Q4(a)', v: { co2: 5.5, ca: 87, mg: 18, na: 24, cl: 65, so4: 68, alk: 182 } },
}
const toW = (i: Ions): Water => waterFromIons({ co2: i.co2, ca: i.ca, mg: i.mg, na: i.na, cl: i.cl, so4: i.so4, alkCaCO3: i.alk })

type Stage = 'raw' | 'lime' | 'soda' | 'recarb'
const STAGES: { v: Stage; label: string }[] = [
  { v: 'raw', label: '1 Raw water' },
  { v: 'lime', label: '2 + Lime' },
  { v: 'soda', label: '3 + Soda ash' },
  { v: 'recarb', label: '4 Recarbonate' },
]

function Bench() {
  const [pre, setPre] = useState('sheet')
  const [ions, setIons] = useState<Ions>(PRESETS.sheet.v)
  const [mode, setMode] = useState<'selective' | 'complete'>('complete')
  const [exc, setExc] = useState(false)
  const [stage, setStage] = useState<Stage>('raw')
  const [pu, setPu] = useState({ lime: 90, soda: 97 })
  const w = toW(ions)
  const h = analyse(w)
  const excess = exc ? slideExcess(w, mode) : 0
  const t = treat(w, { mode, excess, removeCaNch: false })
  // composition after the lime step alone (soda not yet added)
  const limeOnly = (() => {
    if (mode === 'selective') return t.after
    const mg = 10
    const alk = t.after.alk - excess
    const ca = Math.max(alk + w.cl + w.so4 - mg - w.na, 30) + excess
    return { ca, mg, na: w.na, cl: w.cl, so4: w.so4, alk: alk + excess, co2: 0, th: ca + mg }
  })()
  const shown = stage === 'raw' ? { ...w, co2: w.co2 } : stage === 'lime' ? limeOnly : stage === 'soda' ? t.after : t.final
  const total = Math.max(w.ca + w.mg + w.na, w.alk + w.cl + w.so4, t.after.ca + t.after.mg + t.after.na) * 1.02
  const m = masses(t.lime, t.soda, pu.lime / 100, pu.soda / 100)
  const set = (k: keyof Ions) => (v: number) => setIons((o) => ({ ...o, [k]: Number.isFinite(v) ? v : 0 }))
  const wCC = (k: Exclude<keyof Ions, 'alk'>) => toCaCO3(k === 'co2' ? 'co2' : k, ions[k])

  const bypassDefault = splitTreatment(w, { mgFinal: 40, thMax: 120 }).X
  const [X, setX] = useState<number | null>(null)
  const Xv = X ?? bypassDefault
  const sp = splitAt(w, Xv, { thMax: 120 })
  return (
    <Section title="Lime–soda bench" sub="Build the bar diagram from the analysis, then step through the chemicals. All bars are mg/L as CaCO₃; the CO₂ block hangs to the left of zero.">
      <div className="space-y-3">
        <Seg value={pre} onChange={(k) => { setPre(k); setIons(PRESETS[k].v); setX(null) }} items={Object.entries(PRESETS).map(([k, p]) => ({ v: k, label: p.label }))} />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <NumIn label="CO₂" value={ions.co2} onChange={set('co2')} unit="mg/L" />
          <NumIn label="Ca²⁺" value={ions.ca} onChange={set('ca')} unit="mg/L" />
          <NumIn label="Mg²⁺" value={ions.mg} onChange={set('mg')} unit="mg/L" />
          <NumIn label="Na⁺" value={ions.na} onChange={set('na')} unit="mg/L" />
          <NumIn label="Cl⁻" value={ions.cl} onChange={set('cl')} unit="mg/L" />
          <NumIn label="SO₄²⁻" value={ions.so4} onChange={set('so4')} unit="mg/L" />
          <NumIn label="Alkalinity" value={ions.alk} onChange={set('alk')} unit="mg/L as CaCO₃" w="w-24" />
        </div>
        <div className="text-xs text-mute">
          As CaCO₃: CO₂ {f(wCC('co2'))}, Ca {f(w.ca)}, Mg {f(w.mg)}, Na {f(w.na)}, Cl {f(w.cl)}, SO₄ {f(w.so4)}; TH = {f(h.th)}, CH = {f(h.ch)}, NCH = {f(h.nch)} (Ca {f(h.caNch)}, Mg {f(h.mgNch)}).
          {w.co2 > 22.7 && <span className="text-bad"> CO₂ above 10 mg/L as CO₂ (22.7 as CaCO₃): strip it with air instead of lime.</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Seg value={mode} onChange={setMode} items={[{ v: 'selective', label: 'Selective Ca removal' }, { v: 'complete', label: 'Practical limits (Ca + Mg)' }]} />
          <label className="text-sm inline-flex items-center gap-1.5"><input type="checkbox" checked={exc} onChange={(e) => setExc(e.target.checked)} /> excess lime ({slideExcess(w, mode)})</label>
        </div>
        <Seg value={stage} onChange={setStage} items={STAGES} />
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <BarDiagram bars={bars({ ...shown, co2: stage === 'raw' ? w.co2 : 0 })} max={total} title={STAGES.find((s) => s.v === stage)!.label.slice(2) + (stage === 'raw' ? '' : ' (mg/L as CaCO₃)')} mark={stage === 'raw' ? [{ label: `alkalinity ${f(w.alk)}`, at: w.alk }] : undefined} />
          <div className="text-xs text-mute px-1">
            {stage === 'raw' && `Hardness = Ca + Mg = ${f(h.th)}. The HCO₃ bar ends at ${f(w.alk)}: the part of the hardness bar left of it is carbonate hardness (${f(h.ch)}), the rest non-carbonate (${f(h.nch)}).`}
            {stage === 'lime' && `Lime = ${mode === 'complete' ? 'CO₂ + alk + Mg' : 'CO₂ + alk'}${excess ? ' + excess' : ''} = ${f(t.lime)}. CO₂ is gone; carbonate hardness precipitates as CaCO₃ ${mode === 'complete' ? 'and Mg(OH)₂' : ''}. Non-carbonate hardness is still there.`}
            {stage === 'soda' && `Soda = ${f(t.soda)}: carbonate for the non-carbonate hardness; Na⁺ rises by ${f(t.soda)}. Hardness now ${f(t.after.th - excess)} (Ca ${f(t.after.ca - excess)} + Mg ${f(t.after.mg)}).${excess ? ' Excess lime leaves extra Ca²⁺ and OH⁻.' : ''}`}
            {stage === 'recarb' && 'CO₂ added to bring the pH down to 8.4–8.6: stops the precipitation, removes any excess lime and keeps the water from scaling the pipes.'}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Lime" v={`${f(t.lime)} mg/L`} sub="as CaCO₃" />
          <Read k="Soda ash" v={`${f(t.soda)} mg/L`} sub="as CaCO₃" />
          <Read k="Finished hardness" v={`${f(t.final.th)} mg/L`} sub={mode === 'complete' ? 'Ca 30 + Mg 10' : 'Ca-NCH + 30, Mg untouched'} />
          <Read k="Alk left" v={`${f(t.final.alk)} mg/L`} sub="before recarbonation" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <NumIn label="CaO purity" value={pu.lime} onChange={(v) => setPu((p) => ({ ...p, lime: v || 100 }))} unit="%" step={1} />
          <NumIn label="soda purity" value={pu.soda} onChange={(v) => setPu((p) => ({ ...p, soda: v || 100 }))} unit="%" step={1} />
          <span className="text-mute">CaO <b className="num text-ink">{f(m.CaO)}</b> · Ca(OH)₂ <b className="num text-ink">{f(m.CaOH2)}</b> · Na₂CO₃ <b className="num text-ink">{f(m.Na2CO3)}</b> mg/L (× 56/100, 74/100, 106/100 ÷ purity)</span>
        </div>

        <div className="border-t border-line pt-3 space-y-2">
          <div className="font-bold text-sm">Split treatment: how much can you bypass?</div>
          <Slider label="Bypass X (raw water mixed back)" value={+Xv.toFixed(3)} min={0} max={1} step={0.005} onChange={setX} />
          <div className="rounded-xl border border-line p-2 bg-bg/40"><SplitFlow X={Xv} second={sp.secondNeeded} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Read k="Blended hardness" v={`${f(sp.blended)} mg/L`} sub={sp.blended > 120 ? 'above 120: second stage' : sp.blended < 80 ? 'below 80: could bypass more' : 'inside 80–120'} />
            <Read k="Mg-hardness of blend" v={`${f(Xv * w.mg + (1 - Xv) * 10)} mg/L`} sub="X·Mg_raw + (1−X)·10" />
            <Read k="Lime on whole flow" v={`${f(sp.lime)} mg/L`} sub={sp.secondNeeded ? '(1−X)L₁ + X·L₂' : '(1−X)·L₁'} />
            <Read k="Soda on whole flow" v={`${f(sp.soda)} mg/L`} sub="(1−X)·S₁" />
          </div>
          <p className="text-xs text-faint">The slide's X = (Mg_f − Mg_i)/(Mg_r − Mg_i) with Mg_f = 40 and Mg_i = 10 puts the slider at {f(bypassDefault, 3)}; drag X up and watch the blended hardness climb through 120 into second-stage territory.</p>
        </div>
        <Callout kind="tip" title="Notice that…">
          In the complete mode the lime dose carries three terms (CO₂, alkalinity, Mg) while the soda ash is just the non-carbonate hardness, so a water whose alkalinity exceeds its hardness needs no soda at all. In the selective mode Mg is untouched, so the finished hardness can never fall below the raw Mg-hardness: that is when split treatment (or removing Mg after all) enters.
        </Callout>
      </div>
    </Section>
  )
}
function Read({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line p-2">
      <div className="text-[11px] text-faint">{k}</div>
      <div className="num font-semibold">{v}</div>
      {sub && <div className="text-[11px] text-mute">{sub}</div>}
    </div>
  )
}

// ================================================================ problems
type Fam = 'selective' | 'complete' | 'split' | 'chem'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'selective', label: 'Selective Ca removal' },
  { v: 'complete', label: 'Practical limits' },
  { v: 'split', label: 'Split treatment' },
  { v: 'chem', label: 'Chemical masses' },
]
interface SP extends XProblem<Fam> {
  ions: Ions
  mgFinal?: number
  pu?: [number, number]
}
function make(seed: number, family?: Fam, level: Level = 'exam'): SP {
  const r = rng(seed * 4513 + 29)
  const fam = family ?? pick(r, ['selective', 'complete', 'split', 'split', 'chem'] as Fam[])
  const ca = randInt(r, 60, 110)
  const mgIon = fam === 'selective' ? randInt(r, 6, 9) : fam === 'split' ? randInt(r, 14, 30) : randInt(r, 8, 24)
  const ions: Ions = { co2: randInt(r, 3, 10), ca, mg: mgIon, na: randInt(r, 10, 30), cl: randInt(r, 30, 70), so4: randInt(r, 40, 90), alk: randInt(r, 14, 24) * 10 }
  const w = toW(ions)
  const h = analyse(w)
  const stepsConv: XStep[] = [
    { key: 'ca', group: 'As CaCO₃', label: 'Ca²⁺', value: w.ca, unit: 'mg/L', digits: 1, tol: 0.01 },
    { key: 'mg', group: 'As CaCO₃', label: 'Mg²⁺', value: w.mg, unit: 'mg/L', digits: 1, tol: 0.01 },
    { key: 'nch', group: 'As CaCO₃', label: 'non-carbonate hardness', value: h.nch, unit: 'mg/L', digits: 1, tol: 0.015, abs: 0.5 },
  ]
  const head = `| CO₂ | Ca²⁺ | Mg²⁺ | Na⁺ | Cl⁻ | SO₄²⁻ | Alkalinity (as CaCO₃) |\n|---|---|---|---|---|---|---|\n| ${ions.co2} | ${ions.ca} | ${ions.mg} | ${ions.na} | ${ions.cl} | ${ions.so4} | ${ions.alk} |\n\n(all mg/L as the ion, except the alkalinity)`
  const hash = (x: unknown) => hashKey(JSON.stringify([fam, ions, x]))
  if (fam === 'selective') {
    const t = treat(w, { mode: 'selective' })
    return { family: fam, level, title: 'Selective calcium removal', text: `Determine the lime dose (mg/L as CaCO₃) for selective calcium removal of the water below, and the quicklime dose if the lime is 90 % pure.\n\n${head}`, hash: hash(0), ions, steps: [...stepsConv.slice(0, 2), { key: 'lime', group: 'Dose', label: 'lime = CO₂ + alk', value: t.lime, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.01 }, { key: 'cao', group: 'Dose', label: 'CaO at 90 %', value: masses(t.lime, 0, 0.9).CaO, unit: 'mg/L', digits: 1, tol: 0.012 }] }
  }
  if (fam === 'complete') {
    const t = treat(w, { mode: 'complete' })
    return { family: fam, level, title: 'Softening to the practical solubility limits', text: `Determine the lime and soda ash doses (mg/L as CaCO₃) to soften the water below to the practical solubility limits. Lime is 100 % pure; no excess lime.\n\n${head}`, hash: hash(1), ions, steps: [...stepsConv, { key: 'lime', group: 'Dose', label: 'lime', value: t.lime, unit: 'mg/L', digits: 1, tol: 0.01 }, { key: 'soda', group: 'Dose', label: 'soda ash', value: t.soda, unit: 'mg/L', digits: 1, tol: 0.012, abs: 0.5 }] }
  }
  if (fam === 'split') {
    const mgFinal = pick(r, [30, 40])
    const s = splitTreatment(w, { mgFinal, thMax: 120 })
    return { family: fam, level, title: 'Split-treatment softening', mgFinal, text: `Determine the chemical doses to soften the water below by split treatment to a finished Mg-hardness of ${mgFinal} mg/L as CaCO₃ and total hardness of 80–120 mg/L as CaCO₃. Is a second stage needed?\n\n${head}`, hash: hash(mgFinal), ions, steps: [...stepsConv.slice(0, 2), { key: 'X', group: 'Split', label: 'bypass X', value: s.X, digits: 3, abs: 0.004 }, { key: 'blend', group: 'Split', label: 'blended hardness', value: s.blended, unit: 'mg/L', digits: 1, tol: 0.02 }, { key: 'lime', group: 'Doses on the whole flow', label: 'lime', value: s.lime, unit: 'mg/L', digits: 1, tol: 0.012 }, { key: 'soda', group: 'Doses on the whole flow', label: 'soda ash', value: s.soda, unit: 'mg/L', digits: 1, tol: 0.015, abs: 0.5 }] }
  }
  const pu: [number, number] = [pick(r, [0.85, 0.87, 0.9]), pick(r, [0.95, 0.97])]
  const t = treat(w, { mode: 'complete' })
  const m = masses(t.lime, t.soda, pu[0], pu[1])
  return { family: fam, level, title: 'From mg/L as CaCO₃ to chemical masses', pu, text: `Soften the water below to the practical limits (no excess lime). Quicklime (CaO) is ${pu[0] * 100} % pure and soda ash (Na₂CO₃) ${pu[1] * 100} % pure. How many mg/L of each chemical are fed?\n\n${head}`, hash: hash(pu), ions, steps: [{ key: 'lime', group: 'As CaCO₃', label: 'lime', value: t.lime, unit: 'mg/L', digits: 1, tol: 0.01 }, { key: 'soda', group: 'As CaCO₃', label: 'soda', value: t.soda, unit: 'mg/L', digits: 1, tol: 0.012, abs: 0.5 }, { key: 'cao', group: 'Chemicals', label: 'CaO', value: m.CaO, unit: 'mg/L', digits: 1, tol: 0.012 }, { key: 'na2', group: 'Chemicals', label: 'Na₂CO₃', value: m.Na2CO3, unit: 'mg/L', digits: 1, tol: 0.015, abs: 0.5 }], ...{} }
}
function Solution({ p }: { p: SP }) {
  const w = toW(p.ions)
  const h = analyse(w)
  const i = p.ions
  const conv = [
    `1. Convert every ion to mg/L as CaCO₃ (so they can be added and compared):`,
    ionTableMd(
      [
        { name: 'CO₂', mgL: i.co2, fac: FAC.co2, eqw: '22', cc: w.co2 },
        { name: 'Ca²⁺', mgL: i.ca, fac: FAC.ca, eqw: '20', cc: w.ca },
        { name: 'Mg²⁺', mgL: i.mg, fac: FAC.mg, eqw: '12.15', cc: w.mg },
        { name: 'Na⁺', mgL: i.na, fac: FAC.na, eqw: '23', cc: w.na },
        { name: 'Cl⁻', mgL: i.cl, fac: FAC.cl, eqw: '35.45', cc: w.cl },
        { name: 'SO₄²⁻', mgL: i.so4, fac: FAC.so4, eqw: '48', cc: w.so4 },
      ],
      `| HCO₃⁻ alkalinity | given as CaCO₃ | | **${f(w.alk)}** |`,
    ),
    `2. Hardness:`,
    hardnessTableMd(h),
    `3. Bar diagram of the raw water (below): the hardness to the left of the alkalinity line is carbonate, the rest non-carbonate.`,
  ].join('\n\n')
  const raw = (
    <div className="rounded-xl border border-line bg-panel2/40 p-2">
      <BarDiagram bars={bars(w)} title="Raw water (mg/L as CaCO₃)" mark={[{ label: `alk ${f(w.alk, 0)}`, at: w.alk }]} />
    </div>
  )
  let rest: string
  let flow: ReactNode = null
  if (p.family === 'selective') {
    const t = treat(w, { mode: 'selective' })
    const m = masses(t.lime, 0, 0.9)
    rest = [
      `4. **Selective Ca removal**: lime only, Mg is left alone (it is below 40 mg/L as CaCO₃, so it is not worth removing). Lime term by term:`,
      doseTableMd([{ label: 'mg/L as CaCO₃', t }]),
      tx`5. Quicklime at 90 % purity: $\text{CaO}=${f(t.lime)}\times\dfrac{56}{100}\div0.90=$ **${f(m.CaO)} mg/L** (add 20 mg/L as CaCO₃ excess lime only if the question asks for it).`,
    ].join('\n\n')
  } else if (p.family === 'complete' || p.family === 'chem') {
    const t = treat(w, { mode: 'complete' })
    rest = [
      `4. **Softening to the practical limits** (Ca 30, Mg 10): lime for CO₂, the carbonate hardness and the Mg; soda ash for the non-carbonate hardness. Term by term:`,
      doseTableMd([{ label: 'mg/L as CaCO₃', t }]),
      p.family === 'chem' ? `5. From mg/L as CaCO₃ to mg/L of each chemical (× molar mass/100, ÷ purity):` : '',
      p.family === 'chem' ? massTableMd(t.lime, t.soda, p.pu) : '',
    ]
      .filter(Boolean)
      .join('\n\n')
  } else {
    const s = splitTreatment(w, { mgFinal: p.mgFinal, thMax: 120 })
    rest = [
      tx`4. **Bypass.** **Why:** the first stage takes Mg down to 10; the raw bypass keeps its Mg ${f(w.mg)}. Blend them so the Mg comes out at ${p.mgFinal}: $X\,\text{Mg}_r+(1-X)\,\text{Mg}_i=\text{Mg}_f$, so`,
      tx`$$X=\frac{\text{Mg}_f-\text{Mg}_i}{\text{Mg}_r-\text{Mg}_i}=\frac{${p.mgFinal}-10}{${f(w.mg)}-10}=${f(s.X, 3)}$$`,
      `so ${f(s.X * 100, 1)} % bypasses and ${f(s.treated * 100, 1)} % is treated.`,
      `5. **Doses of each stage**, per litre of the water that stage treats:`,
      doseTableMd([
        { label: '1st stage: complete', t: s.first },
        { label: '2nd stage: selective Ca', t: s.second },
      ]),
      tx`6. **Blend check:** $TH=X\,TH_{raw}+(1-X)\,40=${f(s.X, 3)}(${f(s.rawTH)})+${f(s.treated, 3)}(40)=$ **${f(s.blended)}** mg/L as CaCO₃: ${s.secondNeeded ? `more than 120, so a **second stage** (selective Ca removal of the bypassed water) is needed; finished hardness ${f(s.finalTH)}.` : 'inside 80–120, so **no second stage**.'}`,
      tx`7. **Doses on the whole flow** (each stage dose × the share of the flow it treats): lime $=(1-X)L_1${s.secondNeeded ? '+X\\,L_2' : ''}=${f(s.treated, 3)}(${f(s.first.lime)})${s.secondNeeded ? `+${f(s.X, 3)}(${f(s.second.lime)})` : ''}=$ **${f(s.lime)}**; soda $=(1-X)S_1=${f(s.treated, 3)}(${f(s.first.soda)})=$ **${f(s.soda)}** mg/L as CaCO₃.`,
    ].join('\n\n')
    flow = (
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <SplitFlow X={s.X} second={s.secondNeeded} />
      </div>
    )
  }
  return (
    <div className="space-y-2 text-sm">
      <Md>{conv}</Md>
      {raw}
      <Md>{rest}</Md>
      {flow}
    </div>
  )
}

export default function SoftLab() {
  return (
    <div className="space-y-6">
      <Bench />
      <ExamProblems<Fam, SP> topic="ev-soft:lab" families={FAMS} make={make} initialSeed={6} solution={(p) => <Solution p={p} />} foot="Factors to as-CaCO₃: Ca 2.5, Mg 4.12, CO₂ 2.27 (mg/L × 50/eq. wt). Tanvir sir's own worked method adds no excess lime." />
    </div>
  )
}

/** for the render tests (src/env/figs/ta-work.test.tsx) */
export { FAMS, make, Solution }
