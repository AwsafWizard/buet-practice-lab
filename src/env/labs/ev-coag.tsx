// Coagulation: dose against colloid concentration (the four zones) with a pointer, and the alkalinity a coagulant eats.
import { useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { alkConsumed, alkShortfall, alumNoAlkalinity, COAGULANTS, type Coagulant } from '../engine/coag'

const f = (v: number, d = 1) => v.toFixed(d)
const tx = String.raw

// qualitative zone model: S = colloid concentration (0–10), C = coagulant dose (0–100)
const LOW = (S: number) => 4 + 2.2 * S // below this: nothing happens (zone 1)
const HIGH = (S: number) => 10 + 5.5 * S // top of the adsorption / charge-neutralisation band (zone 2)
const SWEEP = (S: number) => 88 - 5.5 * S // above this: sweep floc (zone 4); falls as S rises (inverse relation)
function zoneOf(S: number, C: number) {
  if (C < LOW(S)) return 1
  if (C <= HIGH(S)) return 2
  if (C < SWEEP(S)) return 3
  return 4
}
const ZONE_INFO: Record<number, { name: string; text: string; col: string }> = {
  1: { name: 'Zone 1: no coagulation', text: 'Dose too small to destabilise the colloids; the turbidity stays.', col: 'var(--c-faint)' },
  2: { name: 'Zone 2: adsorption and charge neutralisation', text: 'Dose is proportional to the colloid concentration (stoichiometric): Al³⁺ hydrolysis products adsorb on the colloids and neutralise their charge. Works.', col: 'var(--c-good)' },
  3: { name: 'Zone 3: restabilisation', text: 'Overdose: charge reversal, the colloids pick up too much positive charge and repel again. Turbidity returns.', col: 'var(--c-bad)' },
  4: { name: 'Zone 4: sweep-floc coagulation', text: 'A large dose precipitates Al(OH)₃ or Fe(OH)₃ that enmeshes the colloids. Works, and the more dilute the colloids, the more coagulant is needed (inverse relation).', col: 'var(--c-water)' },
}

function Zones() {
  const [S, setS] = useState(3)
  const [C, setC] = useState(25)
  const z = zoneOf(S, C)
  const W = 560
  const Hh = 300
  const ml = 46
  const mb = 38
  const mt = 14
  const mr = 14
  const sx = (s: number) => ml + (s / 10) * (W - ml - mr)
  const sy = (c: number) => Hh - mb - (c / 100) * (Hh - mb - mt)
  const xs = Array.from({ length: 41 }, (_, i) => i / 4)
  const clamp = (v: number) => Math.max(0, Math.min(100, v))
  const poly = (top: (s: number) => number, bot: (s: number) => number) => xs.map((s) => `${sx(s)},${sy(clamp(top(s)))}`).join(' ') + ' ' + [...xs].reverse().map((s) => `${sx(s)},${sy(clamp(bot(s)))}`).join(' ')
  const resid = z === 2 || z === 4 ? 'low' : z === 3 ? 'high again' : 'high'
  return (
    <Section title="Dose against colloid concentration: the four zones" sub="Move the pointer: raise the colloid concentration (S) or the coagulant dose (C) and see which mechanism you are in. A qualitative chart, as in Peavy / T06 p13.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Colloid concentration S (turbidity)" value={S} min={0.2} max={10} step={0.2} onChange={(v) => setS(+v.toFixed(1))} />
          <Slider label="Coagulant dose C" value={C} min={0} max={100} step={1} onChange={setC} />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="coagulant dose against colloid concentration, four zones" style={{ display: 'block' }}>
            <polygon points={poly(LOW, () => 0)} fill="var(--c-faint)" opacity="0.18" />
            <polygon points={poly(HIGH, LOW)} fill="var(--c-good)" opacity="0.3" />
            <polygon points={poly(SWEEP, HIGH)} fill="var(--c-bad)" opacity="0.2" />
            <polygon points={poly(() => 100, SWEEP)} fill="var(--c-water)" opacity="0.3" />
            <line x1={ml} x2={ml} y1={mt} y2={Hh - mb} stroke="var(--c-ink)" />
            <line x1={ml} x2={W - mr} y1={Hh - mb} y2={Hh - mb} stroke="var(--c-ink)" />
            <text x={sx(7.2)} y={sy(8)} fontSize="12" fill="var(--c-ink)">1 no coagulation</text>
            <text x={sx(0.4)} y={sy(37)} fontSize="12" fill="var(--c-ink)">2 adsorption</text>
            <text x={sx(0.4)} y={sy(52)} fontSize="12" fill="var(--c-ink)">3 restabilisation</text>
            <text x={sx(0.4)} y={sy(92)} fontSize="12" fill="var(--c-ink)">4 sweep floc</text>
            <text x={(ml + W - mr) / 2} y={Hh - 6} textAnchor="middle" fontSize="12" fill="var(--c-mute)">colloid concentration S →</text>
            <text x={12} y={Hh / 2} fontSize="12" fill="var(--c-mute)" transform={`rotate(-90 12 ${Hh / 2})`} textAnchor="middle">coagulant dose C →</text>
            <circle cx={sx(S)} cy={sy(C)} r="7" fill="var(--c-ink)" stroke="var(--c-panel)" strokeWidth="2" />
          </svg>
        </div>
        <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: ZONE_INFO[z].col }}>
          <b>{ZONE_INFO[z].name}.</b> {ZONE_INFO[z].text} Residual turbidity after settling: <b>{resid}</b>.
        </div>
        <Callout kind="tip" title="Notice that…">
          Set S low and walk the dose up: nothing, then (if S is not too small) a thin working band, restabilisation, and finally sweep floc. At very low S the adsorption band almost vanishes, which is why clay is added to low-turbidity water (raising S) and why sweep-floc dosing has to be large. At high S the band is wide and one modest dose works.
        </Callout>
      </div>
    </Section>
  )
}

function AlkBench() {
  const [id, setId] = useState<Coagulant['id']>('alum')
  const [dose, setDose] = useState(40)
  const [alk, setAlk] = useState(30)
  const use = alkConsumed(id, dose)
  const sh = alkShortfall({ id, dose, alk })
  const left = Math.max(alk - use.alk, 0)
  const noAlk = id === 'fecl3' ? null : alumNoAlkalinity({ dose, id })
  return (
    <Section title="Alkalinity eaten by the coagulant" sub="Every mole of Al₂(SO₄)₃·14H₂O uses 6 mol of HCO₃⁻; every mole of FeCl₃ uses 3. If the water has less alkalinity than that, the pH collapses unless lime or soda ash makes up the difference.">
      <div className="space-y-3">
        <Seg value={id} onChange={setId} items={(Object.keys(COAGULANTS) as Coagulant['id'][]).map((k) => ({ v: k, label: k === 'alum' ? 'Alum (·14H₂O)' : k === 'alum18' ? 'Alum (·18H₂O)' : 'FeCl₃' }))} />
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="Coagulant dose" value={dose} min={5} max={150} step={1} onChange={setDose} unit=" mg/L" />
          <Slider label="Natural alkalinity" value={alk} min={0} max={200} step={1} onChange={setAlk} unit=" mg/L as CaCO₃" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <svg viewBox="0 0 560 90" width="100%" role="img" aria-label="alkalinity available and consumed" style={{ display: 'block' }}>
            {(() => {
              const mx = Math.max(alk, use.alk, 1) * 1.05
              const wA = (alk / mx) * 520
              const wU = (Math.min(use.alk, alk) / mx) * 520
              return (
                <g>
                  <rect x="20" y="18" width={wA} height="26" fill="var(--c-water)" opacity="0.4" stroke="var(--c-ink)" />
                  <rect x="20" y="18" width={wU} height="26" fill="var(--c-bad)" opacity="0.5" />
                  <text x="22" y="14" fontSize="11" fill="var(--c-mute)">natural alkalinity {alk} (red = used up by the dose)</text>
                  {use.alk > alk && <rect x={20 + wA} y="52" width={((use.alk - alk) / mx) * 520} height="22" fill="var(--c-load)" opacity="0.5" stroke="var(--c-ink)" strokeDasharray="4 3" />}
                  {use.alk > alk && <text x={22 + wA} y="86" fontSize="11" fill="var(--c-load)">short by {f(use.alk - alk)}: add lime or soda ash</text>}
                </g>
              )
            })()}
          </svg>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Consumed" v={`${f(use.alk)} mg/L`} sub={`${f(use.perMg, 3)} mg alk per mg coagulant`} />
          <Read k="Alkalinity left" v={`${f(left)} mg/L`} sub="as CaCO₃" />
          <Read k="Short by" v={`${f(sh.short)} mg/L`} sub={sh.short > 0 ? `${f(sh.lime)} Ca(OH)₂ or ${f(sh.soda)} Na₂CO₃` : 'enough alkalinity'} />
          <Read k={noAlk ? 'pH with no alkalinity' : 'as HCO₃⁻'} v={noAlk ? f(noAlk.pH, 2) : `${f(use.hco3)} mg/L`} sub={noAlk ? `NaOH to pH 7: ${f(noAlk.naohMgL)} mg/L` : ''} />
        </div>
        <Callout kind="tip" title="Notice that…">
          Alum eats about half its own weight in alkalinity (0.505 mg per mg with ·14H₂O, 0.45 with the ·18H₂O of the class notes, 0.92 for FeCl₃). Low-alkalinity water plus a sweep-floc dose is the hardest case: the dose destroys the alkalinity and the pH drops out of the 5–7.5 window where alum works.
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

type Fam = 'use' | 'short' | 'noalk'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'use', label: 'Alkalinity consumed' },
  { v: 'short', label: 'Alkalinity short' },
  { v: 'noalk', label: 'No alkalinity: pH' },
]
interface CP extends XProblem<Fam> {
  d: Record<string, number | string>
}
function make(seed: number, family?: Fam, level: Level = 'exam'): CP {
  const r = rng(seed * 1931 + 17)
  const fam = family ?? pick(r, ['use', 'short', 'noalk'] as Fam[])
  const id = pick(r, ['alum', 'fecl3'] as Coagulant['id'][])
  const dose = randInt(r, 8, 60, 2)
  const nm = id === 'alum' ? 'alum Al₂(SO₄)₃·14H₂O (MW 594)' : 'ferric chloride FeCl₃ (Fe 55.85, Cl 35.45)'
  const eq = id === 'alum' ? 'Al₂(SO₄)₃·14H₂O + 6HCO₃⁻ → 2Al(OH)₃·3H₂O + 6CO₂ + 8H₂O + 3SO₄²⁻' : 'FeCl₃ + 3HCO₃⁻ + 3H₂O → Fe(OH)₃·3H₂O + 3CO₂ + 3Cl⁻'
  const hash = (x: unknown) => hashKey(JSON.stringify([fam, id, dose, x]))
  const u = alkConsumed(id, dose)
  if (fam === 'use') {
    const steps: XStep[] = [{ key: 'mm', group: 'Moles', label: 'dose in mmol/L', value: u.mmol, digits: 4, tol: 0.01 }, { key: 'alk', group: 'Alkalinity', label: 'alkalinity consumed', value: u.alk, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.015 }]
    return { family: fam, level, title: 'Alkalinity consumed by a coagulant', text: `The optimum dose of ${nm} from a jar test is ${dose} mg/L. Estimate the alkalinity consumed. ${eq}`, hash: hash(0), steps, d: { id, dose } }
  }
  if (fam === 'short') {
    const alk = randInt(r, 5, 25)
    const s = alkShortfall({ id, dose, alk })
    const steps: XStep[] = [{ key: 'use', group: 'Demand', label: 'alkalinity consumed', value: u.alk, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.015 }, { key: 'sh', group: 'Shortfall', label: 'alkalinity to add', value: s.short, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.03, abs: 0.3 }, { key: 'lime', group: 'Shortfall', label: 'as Ca(OH)₂', value: s.lime, unit: 'mg/L', digits: 1, tol: 0.03, abs: 0.3 }]
    return { family: fam, level, title: 'Alkalinity to add before coagulation', text: `A raw water has alkalinity ${alk} mg/L as CaCO₃. The dose of ${nm} is ${dose} mg/L. How much alkalinity must be added, and how much hydrated lime Ca(OH)₂ (eq. wt 37) is that? ${eq}`, hash: hash(alk), steps, d: { id, dose, alk } }
  }
  const a = alumNoAlkalinity({ dose })
  const steps: XStep[] = [{ key: 'mm', group: 'Acid', label: 'alum in mmol/L', value: a.mmol, digits: 4, tol: 0.01 }, { key: 'pH', group: 'Result', label: 'pH with no alkalinity', value: a.pH, digits: 2, abs: 0.05 }, { key: 'naoh', group: 'Result', label: 'NaOH to reach pH 7', value: a.naohMgL, unit: 'mg/L', digits: 1, tol: 0.03 }]
  return { family: fam, level, title: 'Alum in water with no alkalinity', text: `Estimate the pH from ${dose} mg/L of alum (Al₂(SO₄)₃·14H₂O → 2Al(OH)₃·3H₂O + 2H₂O + 3H₂SO₄) added to a water with no alkalinity, and the NaOH needed to bring it to pH 7 (H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O).`, hash: hash(1), steps, d: { id: 'alum', dose } }
}
function Solution({ p }: { p: CP }) {
  const id = p.d.id as Coagulant['id']
  const dose = p.d.dose as number
  const c = COAGULANTS[id]
  const u = alkConsumed(id, dose)
  let md: string
  if (p.family === 'use') md = [tx`$${dose}/${f(c.mw, 1)}=${u.mmol.toFixed(4)}$ mmol/L; each mmol uses ${c.hco3} meq of HCO₃⁻: $${u.mmol.toFixed(4)}\times${c.hco3}\times50=$ **${f(u.alk)} mg/L as CaCO₃**.`].join('\n\n')
  else if (p.family === 'short') {
    const s = alkShortfall({ id, dose, alk: p.d.alk as number })
    md = [tx`Consumed $=${f(u.alk)}$ mg/L as CaCO₃ (${f(u.perMg, 3)} per mg).`, tx`Short by $${f(u.alk)}-${p.d.alk}=$ **${f(s.short)}** mg/L as CaCO₃ → Ca(OH)₂ $=${f(s.short)}\times37/50=$ **${f(s.lime)} mg/L** (or Na₂CO₃ ${f(s.soda)} mg/L).`].join('\n\n')
  } else {
    const a = alumNoAlkalinity({ dose })
    md = [tx`${dose}/594 = ${a.mmol.toFixed(4)} mmol/L alum → 3 mol H₂SO₄ per mol = ${a.acidMmol.toFixed(4)} mmol/L → $[H^+]=2\times${a.acidMmol.toFixed(4)}\times10^{-3}=${(a.H).toExponential(2)}$ → pH **${f(a.pH, 2)}**.`, tx`NaOH: 2 mol per mol H₂SO₄ → $${(2 * a.acidMmol).toFixed(4)}$ mmol/L × 40 = **${f(a.naohMgL)} mg/L**.`].join('\n\n')
  }
  return <Md className="text-sm">{md}</Md>
}

export default function CoagLab() {
  return (
    <div className="space-y-6">
      <Zones />
      <AlkBench />
      <ExamProblems<Fam, CP> topic="ev-coag:lab" families={FAMS} make={make} initialSeed={5} solution={(p) => <Solution p={p} />} foot="50 mg/L as CaCO₃ per eq of HCO₃⁻." />
    </div>
  )
}
