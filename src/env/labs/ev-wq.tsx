// Water chemistry bench: carbonate species against pH (Bjerrum plot) with the alkalinity split, hardness bars (CH / NCH),
// and a Henry's-law gas-in-water widget; then exam-style problems (alkalinity from pH, titration, TH split, Henry, pH of CO2 water, Langelier).
import { useState } from 'react'
import { Callout, Md, Section, Seg } from '../../components/ui'
import { hashKey } from '../../labs/CheckTable'
import { pick, randInt, rng, Slider } from '../../labs/common'
import { NumIn } from '../../reference/common'
import { ExamProblems, type Level, type XProblem, type XStep } from '../../soil/topics/seep/examShell'
import { alkalinityFromBicarbonate, alkalinityTitration, carbonateFractions, hardness, henryWithAir, langelier, phOfCo2Water, toCaCO3 } from '../engine/chem'
import { bars } from '../engine/soften'
import { LineChart } from '../figs/pop-chart'
import { BarDiagram } from '../figs/soft-bars'

const f = (v: number, d = 1) => v.toFixed(d)
const tx = String.raw
const g = (v: number, p = 3) => String(+v.toPrecision(p))

function Bjerrum() {
  const [pH, setPH] = useState(8.3)
  const [ct, setCt] = useState(3) // mmol/L total carbonate
  const fr = carbonateFractions(pH)
  const ohEq = Math.pow(10, pH - 14)
  const hEq = Math.pow(10, -pH)
  const alk = (ct / 1000) * (fr.a1 + 2 * fr.a2) + ohEq - hEq // eq/L
  const alkCC = alk * 50000
  const hco = ((ct / 1000) * fr.a1 * 50000)
  const co3 = ((ct / 1000) * fr.a2 * 2 * 50000)
  const oh = ohEq * 50000
  const pts = (k: 'a0' | 'a1' | 'a2') => Array.from({ length: 81 }, (_, i) => [4 + (i * 8) / 80, carbonateFractions(4 + (i * 8) / 80)[k] * 100] as [number, number])
  return (
    <Section title="Carbonate species against pH" sub="Total carbonate is shared between H₂CO₃*, HCO₃⁻ and CO₃²⁻; the pH decides who wins. Alkalinity is what the HCO₃⁻, CO₃²⁻ and OH⁻ can neutralise.">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="pH" value={pH} min={4} max={12} step={0.1} onChange={(v) => setPH(+v.toFixed(1))} />
          <Slider label="Total carbonate C_T" value={ct} min={0.5} max={8} step={0.5} onChange={setCt} unit=" mmol/L" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <LineChart
            series={[
              { id: 'a0', label: 'H₂CO₃*', color: 'var(--c-bad)', pts: pts('a0') },
              { id: 'a1', label: 'HCO₃⁻', color: 'var(--c-water)', pts: pts('a1') },
              { id: 'a2', label: 'CO₃²⁻', color: 'var(--c-load)', pts: pts('a2') },
            ]}
            dots={[{ x: pH, y: fr.a0 * 100, color: 'var(--c-bad)' }, { x: pH, y: fr.a1 * 100, color: 'var(--c-water)' }, { x: pH, y: fr.a2 * 100, color: 'var(--c-load)' }]}
            vline={{ x: pH, label: `pH ${pH}` }}
            xLabel="pH (pK₁ = 6.3, pK₂ = 10.3)"
            yLabel="% of total carbonate"
            yMin={0}
            fmtY={(v) => String(Math.round(v))}
          />
          <div className="flex gap-3 text-xs px-2"><span style={{ color: 'var(--c-bad)' }}>● H₂CO₃*</span><span style={{ color: 'var(--c-water)' }}>● HCO₃⁻</span><span style={{ color: 'var(--c-load)' }}>● CO₃²⁻</span></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="H₂CO₃* / HCO₃⁻ / CO₃²⁻" v={`${f(fr.a0 * 100, 0)} / ${f(fr.a1 * 100, 0)} / ${f(fr.a2 * 100, 0)} %`} />
          <Read k="Alkalinity" v={`${f(alkCC, 0)} mg/L`} sub="as CaCO₃" />
          <Read k="split" v={`HCO₃ ${f(hco, 0)} · CO₃ ${f(co3, 0)} · OH ${f(oh, 1)}`} sub="mg/L as CaCO₃" />
          <Read k="Titration rule" v={pH < 8.3 ? 'P = 0: all HCO₃⁻' : pH > 9.5 ? 'P > M/2 : OH⁻ + CO₃²⁻' : 'P < M/2 : HCO₃⁻ + CO₃²⁻'} sub="phenolphthalein at pH 8.3, M at 4.5" />
        </div>
        <Callout kind="tip" title="Notice that…">
          At pH 6.3 and 10.3 two species are equal (the curves cross at the pK values). Between pH 7 and 9 nearly everything is HCO₃⁻, which is why natural waters are bicarbonate waters. CO₃²⁻ alkalinity counts double per mole, so the alkalinity rises faster than C_T when pH climbs above 9.
        </Callout>
      </div>
    </Section>
  )
}

function HardnessBars() {
  const [ca, setCa] = useState(80)
  const [mg, setMg] = useState(20)
  const [alk, setAlk] = useState(180)
  const caC = toCaCO3('ca', ca)
  const mgC = toCaCO3('mg', mg)
  const h = hardness({ ca: caC, mg: mgC, alk })
  const cat = { ca: caC, mg: mgC, na: 0, cl: Math.max(h.th - alk, 0), so4: 0, alk, co2: 0 }
  return (
    <Section title="Hardness: carbonate and non-carbonate" sub="Ca²⁺ and Mg²⁺ (as CaCO₃) make the hardness. The part matched by HCO₃⁻ alkalinity is carbonate hardness; the rest is non-carbonate (chloride / sulfate).">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-4">
          <NumIn label="Ca²⁺" value={ca} onChange={setCa} unit="mg/L" step={5} />
          <NumIn label="Mg²⁺" value={mg} onChange={setMg} unit="mg/L" step={1} />
          <NumIn label="Alkalinity" value={alk} onChange={setAlk} unit="mg/L as CaCO₃" step={10} w="w-24" />
        </div>
        <div className="rounded-xl border border-line p-2 bg-bg/40">
          <BarDiagram bars={bars(cat)} title="cations: Ca, Mg · anions: HCO₃ then the rest (Cl/SO₄)" mark={[{ label: `alk ${alk}`, at: alk }]} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Total hardness" v={`${f(h.th)} mg/L`} sub={`Ca ${f(caC)} + Mg ${f(mgC)}`} />
          <Read k="Carbonate hardness" v={`${f(h.ch)} mg/L`} sub={h.th > alk ? 'CH = alkalinity' : 'CH = TH'} />
          <Read k="Non-carbonate" v={`${f(h.nch)} mg/L`} sub="TH − alkalinity" />
          <Read k="Extra alkalinity" v={`${f(h.excessAlk)} mg/L`} sub="Na₂CO₃-type, not hardness" />
        </div>
      </div>
    </Section>
  )
}

function HenryBench() {
  const [x8, setX8] = useState(6.9)
  const [H, setH] = useState(560)
  const [nAir, setNAir] = useState(0.01)
  const [P, setP] = useState(0.001)
  const r = henryWithAir({ x: x8 * 1e-8, H, nAir, mw: 131.4 })
  const xEq = P / H
  return (
    <Section title="Henry's law: a gas in water and air" sub="TCE (MW 131.4) dissolved in water, shaken with a little air. The gas moves until P (mol per mol air) = H × C (mol per mol water).">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <Slider label="TCE in water (× 10⁻⁸ mol/mol)" value={x8} min={1} max={20} step={0.1} onChange={(v) => setX8(+v.toFixed(1))} />
          <Slider label="Henry's constant H" value={H} min={50} max={1500} step={10} onChange={setH} unit=" atm" />
          <Slider label="Air in contact" value={nAir} min={0.001} max={1} step={0.001} onChange={(v) => setNAir(+v.toFixed(3))} unit=" mol per mol water" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Read k="Concentration in water" v={`${f(r.ugL0, 0)} µg/L`} sub="x × 55.6 mol/L × 131.4 g/mol" />
          <Read k="Moves to the air" v={`${g(r.X)} mol`} sub="X = Hx/(1/n_air + H)" />
          <Read k="Left in water" v={`${f(r.ugLLeft, 1)} µg/L`} sub={`${f(r.fractionLeft * 100, 1)} % remains`} />
          <Read k="Air then holds" v={`${g(r.gAir)} mol/mol`} sub="= H × C_left" />
        </div>
        <div className="border-t border-line pt-2 space-y-2">
          <Slider label="Partial pressure of the gas over the water" value={P} min={0.0001} max={0.01} step={0.0001} onChange={(v) => setP(+v.toFixed(4))} unit=" atm" />
          <div className="text-sm text-mute">In equilibrium with that air the water holds x = P/H = <b className="num text-ink">{g(xEq)}</b> mol/mol = <b className="num text-ink">{f(xEq * 55.6 * 131.4 * 1000, 1)} µg/L</b>.</div>
        </div>
        <Callout kind="tip" title="Notice that…">
          A big H means a volatile gas (it prefers the air), so almost all of it leaves; give it more air (drag the air slider up) and the water is stripped further, the principle of an air stripper. With only 0.01 mol of air per mole of water, a gas with H = 560 atm still loses {f((1 - 1 / (1 + 560 * 0.01)) * 100, 0)} % of its mass: H × n_air is the number to compare with 1.
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
type Fam = 'alk' | 'titr' | 'hard' | 'henry' | 'co2' | 'lsi'
const FAMS: { v: Fam; label: string }[] = [
  { v: 'alk', label: 'Alkalinity from pH' },
  { v: 'titr', label: 'Titration P and M' },
  { v: 'hard', label: 'CH / NCH' },
  { v: 'henry', label: "Henry's law" },
  { v: 'co2', label: 'pH of CO₂ water' },
  { v: 'lsi', label: 'Langelier / Ryznar' },
]
interface WP extends XProblem<Fam> {
  d: Record<string, number>
}
function make(seed: number, family?: Fam, level: Level = 'exam'): WP {
  const r = rng(seed * 2297 + 13)
  const fam = family ?? pick(r, ['alk', 'titr', 'hard', 'henry', 'co2', 'lsi'] as Fam[])
  const hash = (x: unknown) => hashKey(JSON.stringify([fam, x]))
  if (fam === 'alk') {
    const hco = randInt(r, 60, 180, 5)
    const pH = pick(r, [9.8, 10, 10.3, 10.5])
    const th = randInt(r, 200, 340, 10)
    const a = alkalinityFromBicarbonate({ hco3mgL: hco, pH, pK2: 10.3, th })
    const steps: XStep[] = [
      { key: 'co3', group: 'Species', label: '[CO₃²⁻]/[HCO₃⁻]', value: a.ratio, digits: 2, tol: 0.02 },
      { key: 'alk', group: 'Species', label: 'total alkalinity', value: a.total, unit: 'mg/L as CaCO₃', digits: 0, tol: 0.015 },
      { key: 'ch', group: 'Hardness', label: 'carbonate hardness', value: a.ch, unit: 'mg/L', digits: 0, tol: 0.015 },
      { key: 'nch', group: 'Hardness', label: 'non-carbonate hardness', value: a.nch, unit: 'mg/L', digits: 0, tol: 0.03, abs: 1 },
    ]
    return { family: fam, level, title: 'Alkalinity from bicarbonate and pH', text: `A water contains ${hco} mg/L bicarbonate at a pH of ${pH}. Total hardness is ${th} mg/L as CaCO₃. Calculate the total alkalinity, carbonate hardness and non-carbonate hardness. $K_w=10^{-14}$, $K_1=10^{-6.3}$, $K_2=10^{-10.3}$.`, hash: hash([hco, pH, th]), steps, d: { hco, pH, th } }
  }
  if (fam === 'titr') {
    const vol = pick(r, [100, 200, 250])
    const pH = pick(r, [10, 10.2, 9.8])
    const M = randInt(r, 18, 40)
    const P = randInt(r, 5, Math.floor(M / 2) - 1)
    const a = alkalinityTitration({ vol, M, P, pH })
    const steps: XStep[] = [
      { key: 'tot', group: 'Alkalinity', label: 'total alkalinity', value: a.total, unit: 'mg/L as CaCO₃', digits: 0, tol: 0.01 },
      { key: 'oh', group: 'Species', label: 'OH⁻', value: a.oh, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.03, abs: 0.5 },
      { key: 'co3', group: 'Species', label: 'CO₃²⁻', value: a.co3, unit: 'mg/L', digits: 0, tol: 0.03, abs: 1 },
      { key: 'hco3', group: 'Species', label: 'HCO₃⁻', value: a.hco3, unit: 'mg/L', digits: 0, tol: 0.03, abs: 1 },
    ]
    return { family: fam, level, title: 'Alkalinity species from a titration', text: `A ${vol} mL sample has an initial pH of ${pH}. It needs ${M} mL of 0.02 N H₂SO₄ to reach pH 4.5 and ${P} mL to reach pH 8.3. Find the total alkalinity and the species (OH⁻, CO₃²⁻, HCO₃⁻) in mg/L as CaCO₃, counting the OH⁻ from the pH as in class.`, hash: hash([vol, pH, M, P]), steps, d: { vol, pH, M, P } }
  }
  if (fam === 'hard') {
    const ca = randInt(r, 40, 120, 5)
    const mg = randInt(r, 8, 40)
    const alk = randInt(r, 80, 300, 10)
    const h = hardness({ ca: toCaCO3('ca', ca), mg: toCaCO3('mg', mg), alk })
    const steps: XStep[] = [
      { key: 'th', group: 'Hardness', label: 'total hardness', value: h.th, unit: 'mg/L as CaCO₃', digits: 1, tol: 0.01 },
      { key: 'ch', group: 'Hardness', label: 'carbonate hardness', value: h.ch, unit: 'mg/L', digits: 1, tol: 0.01 },
      { key: 'nch', group: 'Hardness', label: 'non-carbonate hardness', value: h.nch, unit: 'mg/L', digits: 1, tol: 0.015, abs: 0.5 },
    ]
    return { family: fam, level, title: 'Total, carbonate and non-carbonate hardness', text: `A water contains ${ca} mg/L Ca²⁺, ${mg} mg/L Mg²⁺ and has an alkalinity of ${alk} mg/L as CaCO₃. Find TH, CH and NCH in mg/L as CaCO₃.`, hash: hash([ca, mg, alk]), steps, d: { ca, mg, alk } }
  }
  if (fam === 'henry') {
    const x8 = randInt(r, 20, 90) / 10
    const H = pick(r, [300, 560, 800, 1200])
    const n = pick(r, [0.01, 0.02, 0.05])
    const h = henryWithAir({ x: x8 * 1e-8, H, nAir: n, mw: 131.4 })
    const steps: XStep[] = [
      { key: 'c0', group: 'Part (a)', label: 'concentration in water', value: h.ugL0, unit: 'µg/L', digits: 0, tol: 0.01 },
      { key: 'X', group: 'Part (b)', label: 'X moving to the air', value: h.X * 1e8, unit: '× 10⁻⁸ mol/mol', digits: 2, tol: 0.015 },
      { key: 'c1', group: 'Part (b)', label: 'left in water', value: h.ugLLeft, unit: 'µg/L', digits: 1, tol: 0.03, abs: 0.5 },
    ]
    return { family: fam, level, title: 'TCE in water and air (Henry)', text: `Water contains ${x8} × 10⁻⁸ moles of trichloroethylene (TCE, MW = 131.4) per mole of water. (a) What is the concentration of TCE in water? (b) If Henry's constant is ${H} atm, what will the concentration in water be in the presence of ${n} mole of air? (1 L of water = 55.6 mol.)`, hash: hash([x8, H, n]), steps, d: { x8, H, n } }
  }
  if (fam === 'co2') {
    const P = pick(r, [1, 1.5, 2, 3, 4])
    const KH = pick(r, [0.033363, 0.0339, 0.045])
    const c = phOfCo2Water({ KH, P })
    const steps: XStep[] = [
      { key: 'c', group: 'Dissolved CO₂', label: '[CO₂] = K_H P', value: c.h2co3, unit: 'mol/L', digits: 4, tol: 0.01 },
      { key: 'ph', group: 'Result', label: 'pH', value: c.approxPH, digits: 2, abs: 0.03 },
    ]
    return { family: fam, level, title: 'pH of water under CO₂ pressure', text: `The gas above a soft drink is pure CO₂ at ${P} atm. Take $K_H=${KH}$ mol/L·atm and $K_1=10^{-6.3}$. Find the CO₂ concentration and the pH.`, hash: hash([P, KH]), steps, d: { P, KH } }
  }
  const pH = pick(r, [7.5, 7.8, 8, 8.3])
  const ca = randInt(r, 30, 120, 5)
  const alk = randInt(r, 60, 200, 5)
  const l = langelier({ pH, pK2minusPKs: 2.54, caMgL: ca, alkCaCO3: alk })
  const steps: XStep[] = [
    { key: 'pHs', group: 'Saturation', label: 'pHs', value: l.pHs, digits: 2, abs: 0.03 },
    { key: 'lsi', group: 'Indices', label: 'Langelier index', value: l.lsi, digits: 2, abs: 0.04 },
    { key: 'rsi', group: 'Indices', label: 'Ryznar index', value: l.rsi, digits: 2, abs: 0.05 },
  ]
  return { family: fam, level, title: 'Langelier and Ryznar indices', text: `Calculate the Langelier index and the Ryznar index of a water with pH = ${pH}, $pK_2-pK_s=2.54$, Ca²⁺ = ${ca} mg/L and alkalinity ${alk} mg/L as CaCO₃ (all bicarbonate). Does it scale or corrode?`, hash: hash([pH, ca, alk]), steps, d: { pH, ca, alk } }
}
function Solution({ p }: { p: WP }) {
  const d = p.d
  let md: string
  if (p.family === 'alk') {
    const a = alkalinityFromBicarbonate({ hco3mgL: d.hco, pH: d.pH, pK2: 10.3, th: d.th })
    md = [tx`$[HCO_3^-]=${d.hco}/61000=${g(a.hcoM)}$ mol/L; $[CO_3^{2-}]/[HCO_3^-]=K_2/[H^+]=10^{${f(d.pH - 10.3, 1)}}=${g(a.ratio)}$ → $[CO_3^{2-}]=${g(a.coM)}$; $[OH^-]=10^{${f(d.pH - 14, 1)}}=${g(a.ohM)}$.`, tx`Alkalinity $=${g(a.hcoM)}+2(${g(a.coM)})+${g(a.ohM)}=${g(a.hcoM + 2 * a.coM + a.ohM)}$ eq/L → **${f(a.total, 0)} mg/L as CaCO₃**.`, tx`TH $=${d.th}$ ${d.th > a.total ? '>' : '≤'} alkalinity → CH $=$ **${f(a.ch, 0)}**, NCH $=$ **${f(a.nch, 0)}**.`].join('\n\n')
  } else if (p.family === 'titr') {
    const a = alkalinityTitration({ vol: d.vol, M: d.M, P: d.P, pH: d.pH })
    md = [tx`Total $=M\times1000/${d.vol}=$ **${f(a.total, 0)}**. $[OH^-]=10^{${f(d.pH - 14, 1)}}$ mol/L × 17 g/mol = ${f(Math.pow(10, d.pH - 14) * 17000, 2)} mg/L = **${f(a.oh, 1)}** as CaCO₃ = ${f(a.mlOH, 2)} mL of acid.`, `$P=${d.P}$ = OH + ½CO₃ → CO₃ uses $2(${d.P}-${f(a.mlOH, 2)})=${f(a.mlCO3, 2)}$ mL → **${f(a.co3, 0)}** mg/L; HCO₃ = rest = ${f(a.mlHCO3, 2)} mL → **${f(a.hco3, 0)}** mg/L.`].join('\n\n')
  } else if (p.family === 'hard') {
    const h = hardness({ ca: toCaCO3('ca', d.ca), mg: toCaCO3('mg', d.mg), alk: d.alk })
    md = [tx`Ca $=${d.ca}\times2.5=${f(h.caH)}$; Mg $=${d.mg}\times4.12=${f(h.mgH)}$; $TH=$ **${f(h.th)}**.`, `TH ${h.th > d.alk ? '>' : '≤'} alkalinity ${d.alk}: CH = **${f(h.ch)}**, NCH = **${f(h.nch)}**${h.th > d.alk ? '' : ` (the extra ${f(h.excessAlk)} of alkalinity is Na₂CO₃-type, not hardness)`}.`].join('\n\n')
  } else if (p.family === 'henry') {
    const h = henryWithAir({ x: d.x8 * 1e-8, H: d.H, nAir: d.n, mw: 131.4 })
    md = [tx`(a) $${d.x8}\times10^{-8}\times55.6\times131.4=$ **${f(h.ugL0, 0)} µg/L**.`, tx`(b) $H=\dfrac{X/${d.n}}{x-X}$ → $X=\dfrac{Hx}{1/${d.n}+H}=${g(h.X * 1e8)}\times10^{-8}$ mol/mol; left $=${g(h.xLeft * 1e8)}\times10^{-8}$ → **${f(h.ugLLeft, 1)} µg/L**.`].join('\n\n')
  } else if (p.family === 'co2') {
    const c = phOfCo2Water({ KH: d.KH, P: d.P })
    md = tx`$[H_2CO_3^*]=K_HP=${d.KH}\times${d.P}=${g(c.h2co3)}$ mol/L; $[H^+]=\sqrt{K_1[H_2CO_3^*]}=${g(Math.sqrt(10 ** -6.3 * c.h2co3))}$; $pH=$ **${f(c.approxPH, 2)}**.`
  } else {
    const l = langelier({ pH: d.pH, pK2minusPKs: 2.54, caMgL: d.ca, alkCaCO3: d.alk })
    md = [tx`$pCa=-\log(${d.ca}/40.08/1000)=${f(l.pCa, 3)}$; $pAlk=-\log(${d.alk}/50/1000)=${f(l.pAlk, 3)}$; $pH_s=2.54+${f(l.pCa, 3)}+${f(l.pAlk, 3)}=$ **${f(l.pHs, 2)}**.`, tx`$LSI=pH-pH_s=$ **${f(l.lsi, 2)}** (${l.lsiVerdict}); $RSI=2pH_s-pH=$ **${f(l.rsi, 2)}** (${l.rsiVerdict}).`].join('\n\n')
  }
  return <Md className="text-sm">{md}</Md>
}

export default function WqLab() {
  const [tab, setTab] = useState<'carb' | 'hard' | 'henry'>('carb')
  return (
    <div className="space-y-6">
      <Seg value={tab} onChange={setTab} items={[{ v: 'carb', label: 'Carbonate & alkalinity' }, { v: 'hard', label: 'Hardness' }, { v: 'henry', label: "Henry's law" }]} />
      {tab === 'carb' && <Bjerrum />}
      {tab === 'hard' && <HardnessBars />}
      {tab === 'henry' && <HenryBench />}
      <ExamProblems<Fam, WP> topic="ev-wq:lab" families={FAMS} make={make} initialSeed={3} solution={(p) => <Solution p={p} />} foot="Factors: Ca 2.5, Mg 4.12 to mg/L as CaCO₃; Langelier and CO₂ pH are textbook methods (not in this term's slides)." />
    </div>
  )
}
