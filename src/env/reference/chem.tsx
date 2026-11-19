// Chart pane, water chemistry (c-) items: ions to CaCO3, alkalinity from P and M, carbonate species vs pH,
// hardness split and bar diagram, Henry's law, aeration curve, Langelier / Ryznar. Tanvir sir T01–T04 (Rowshan ma'am L9 for LSI).
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import { aerationConc, aerationTime } from '../engine/aeration'
import { alkalinityTitration, carbonateFractions, hardness, ION_LABEL, langelier, mgLFromMoleFraction, TO_CACO3, type Ion } from '../engine/chem'
import { bars } from '../engine/soften'
import { BarDiagram } from '../figs/soft-bars'
import type { EvRefItem } from './pane'

const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const R = String.raw

/** small coloured legend under a chart */
export function Key({ items }: { items: { c: string; t: string; dash?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-mute mt-0.5">
      {items.map((it) => (
        <span key={it.t} className="inline-flex items-center gap-1">
          <svg width="16" height="6">
            <line x1="0" x2="16" y1="3" y2="3" stroke={it.c} strokeWidth="2" strokeDasharray={it.dash ? '4 3' : undefined} />
          </svg>
          {it.t}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- c-caco3
const IONS: { ion: Ion; mw: number; z: number }[] = [
  { ion: 'ca', mw: 40.08, z: 2 },
  { ion: 'mg', mw: 24.3, z: 2 },
  { ion: 'na', mw: 23, z: 1 },
  { ion: 'k', mw: 39.1, z: 1 },
  { ion: 'hco3', mw: 61, z: 1 },
  { ion: 'co3', mw: 60, z: 2 },
  { ion: 'so4', mw: 96, z: 2 },
  { ion: 'cl', mw: 35.45, z: 1 },
  { ion: 'no3', mw: 62, z: 1 },
  { ion: 'oh', mw: 17, z: 1 },
  { ion: 'co2', mw: 44, z: 2 },
]
function Caco3Body() {
  const [ion, setIon] = useState<Ion>('ca')
  const [mg, setMg] = useState(95.2)
  return (
    <>
      <Md>{R`$$\text{mg/L as CaCO}_3 = \text{mg/L of ion}\times\frac{50}{\text{eq. wt of ion}},\qquad \text{eq. wt} = \frac{\text{MW}}{|z|}$$`}</Md>
      <RT
        head={['Ion', 'MW', '|z|', 'Eq. wt', '× factor']}
        rows={IONS.map((r) => [ION_LABEL[r.ion], String(r.mw), String(r.z), f2(r.mw / r.z), f3(TO_CACO3[r.ion])])}
        hl={(i) => IONS[i].ion === ion}
        cap="Tanvir sir's rounded factors (so the slides' 238, 90.6, 56.2, 95.6, 76, 12.5 come out). CO₂ counts as a diprotic acid: eq. wt 22, × 50/22 = 2.27."
      />
      <RT
        head={['Chemical', 'MW', 'Eq. wt', 'mg chemical per mg as CaCO₃']}
        rows={[
          ['CaO (quicklime)', '56', '28', '0.56'],
          ['Ca(OH)₂ (slaked lime)', '74', '37', '0.74'],
          ['Na₂CO₃ (soda ash)', '106', '53', '1.06'],
          ['NaOH', '40', '40', '0.80'],
          ['Al₂(SO₄)₃·14H₂O (alum)', '594', '99', '—'],
          ['FeCl₃', '162.2', '54.1', '—'],
          ['CaCO₃', '100', '50', '1'],
        ]}
        cap="Dose as CaCO₃ × (eq. wt / 50) = mass of the chemical; divide by the purity (e.g. ÷ 0.90 for 90 % lime)."
      />
      <Lookup result={ok(mg) ? <span>{f2(mg)} mg/L {ION_LABEL[ion]} × {f3(TO_CACO3[ion])} = <b>{f1(mg * TO_CACO3[ion])} mg/L as CaCO₃</b></span> : '—'}>
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">ion</span>
          <select className="field !py-0.5 !px-1.5 !text-xs" value={ion} onChange={(e) => setIon(e.target.value as Ion)}>
            {IONS.map((r) => (
              <option key={r.ion} value={r.ion}>
                {ION_LABEL[r.ion]}
              </option>
            ))}
          </select>
        </label>
        <NumIn label="mg/L" value={mg} onChange={setMg} step={1} w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- c-alk
function AlkBody() {
  const [vol, setVol] = useState(200)
  const [P, setP] = useState(11)
  const [M, setM] = useState(30)
  const [pH, setPH] = useState(10)
  const r = ok(vol) && ok(P) && ok(M) && vol > 0 && M >= P && P >= 0 ? alkalinityTitration({ vol, P, M, pH: ok(pH) ? pH : undefined }) : null
  const row = P === 0 ? 0 : Math.abs(P - M / 2) < 1e-9 ? 2 : P < M / 2 ? 1 : Math.abs(P - M) < 1e-9 ? 4 : 3
  return (
    <>
      <Md>{R`- **P** = mL of acid to pH **8.3** (phenolphthalein); **M** (or T) = mL to pH **4.5** (methyl orange) — total alkalinity.
- With 0.02 N H₂SO₄, **1 mL ≡ 1 mg as CaCO₃**, so alkalinity (mg/L as CaCO₃) $= \dfrac{\text{mL acid}\times 1000}{\text{sample mL}}$ (any normality: × N × 50 000 / sample mL).`}</Md>
      <RT
        head={['Result', 'OH⁻', 'CO₃²⁻', 'HCO₃⁻']}
        rows={[
          ['P = 0', '0', '0', 'M'],
          ['P < M/2', '0', '2P', 'M − 2P'],
          ['P = M/2', '0', '2P', '0'],
          ['P > M/2', '2P − M', '2(M − P)', '0'],
          ['P = M', 'M', '0', '0'],
        ]}
        hl={(i) => i === row}
        cap="The slide's five cases. At pH ≥ ~10 the class way first takes OH⁻ from the pH: [OH⁻] = 10^(pH−14) mol/L × 17 000 × 50/17 mg/L as CaCO₃, then P = OH + ½CO₃ and M = OH + CO₃ + HCO₃ (all in mL)."
      />
      <Lookup
        result={
          r ? (
            <span>
              Total = <b>{f1(r.total)}</b> · OH⁻ {f1(r.oh)} · CO₃²⁻ <b>{f1(r.co3)}</b> · HCO₃⁻ <b>{f1(r.hco3)}</b> mg/L as CaCO₃ <span className="text-faint">({r.rule}{r.viaPH ? '; OH⁻ from the pH' : ''})</span>
            </span>
          ) : (
            '0 ≤ P ≤ M'
          )
        }
      >
        <NumIn label="sample" value={vol} onChange={setVol} step={50} unit="mL" w="w-14" />
        <NumIn label="P" value={P} onChange={setP} step={1} unit="mL" w="w-14" />
        <NumIn label="M" value={M} onChange={setM} step={1} unit="mL" w="w-14" />
        <NumIn label="pH" value={pH} onChange={setPH} step={0.5} w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class example (T02): 200 mL, pH 10, P = 11, M = 30 → 150 total = 5 OH⁻ + 100 CO₃²⁻ + 45 HCO₃⁻.</div>
    </>
  )
}

// ---------------------------------------------------------------- c-carb
const PHS = Array.from({ length: 141 }, (_, i) => 4 + i * 0.07)
function CarbBody() {
  const [pH, setPH] = useState(8.3)
  const a = carbonateFractions(pH)
  return (
    <>
      <Chart w={360} h={220} x={{ min: 4, max: 13.8, label: 'pH', ticks: [4, 6, 8, 10, 12] }} y={{ min: 0, max: 1, label: 'fraction of total CO₃', ticks: [0, 0.25, 0.5, 0.75, 1] }} label="carbonate species against pH">
        {(s) => (
          <>
            <path d={pathOf(PHS.map((p) => [p, carbonateFractions(p).a0]), s)} fill="none" stroke="var(--c-water)" strokeWidth={1.8} />
            <path d={pathOf(PHS.map((p) => [p, carbonateFractions(p).a1]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
            <path d={pathOf(PHS.map((p) => [p, carbonateFractions(p).a2]), s)} fill="none" stroke="var(--c-load)" strokeWidth={1.8} />
            {[4.5, 8.3].map((p) => (
              <g key={p}>
                <line x1={s.X(p)} x2={s.X(p)} y1={s.T} y2={s.B} stroke="var(--c-faint)" strokeDasharray="3 3" />
                <text x={s.X(p) + 2} y={s.T + 9} fontSize={8} fill="var(--c-mute)">
                  {p === 4.5 ? 'M end' : 'P end'}
                </text>
              </g>
            ))}
            {ok(pH) && pH >= 4 && pH <= 13.8 && <line x1={s.X(pH)} x2={s.X(pH)} y1={s.T} y2={s.B} stroke="var(--c-bad)" strokeWidth={1.2} />}
          </>
        )}
      </Chart>
      <Key items={[{ c: 'var(--c-water)', t: 'H₂CO₃* (CO₂)' }, { c: 'var(--c-accent)', t: 'HCO₃⁻' }, { c: 'var(--c-load)', t: 'CO₃²⁻' }]} />
      <Md className="text-xs mt-1">{R`$pK_1 = 6.3$, $pK_2 = 10.3$: the curves cross at those pHs. Below 4.5 there is no alkalinity (all CO₂); between 4.5 and 8.3 almost all is HCO₃⁻ (that is why P = 0 there); above 8.3 CO₃²⁻ appears; above ~10 OH⁻ counts too. $[\text{CO}_3^{2-}] = K_2[\text{HCO}_3^-]/[\text{H}^+]$.`}</Md>
      <Lookup result={ok(pH) ? <span>H₂CO₃* {f3(a.a0)} · HCO₃⁻ <b>{f3(a.a1)}</b> · CO₃²⁻ {f3(a.a2)}</span> : '—'}>
        <NumIn label="pH" value={pH} onChange={setPH} step={0.1} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- c-hard
function HardBody() {
  const [ca, setCa] = useState(95.2)
  const [mgI, setMgI] = useState(22)
  const [na, setNa] = useState(25.8)
  const [alk, setAlk] = useState(198)
  const [cl, setCl] = useState(67.8)
  const [so4, setSo4] = useState(73)
  const v = { ca: ca * TO_CACO3.ca, mg: mgI * TO_CACO3.mg, na: na * TO_CACO3.na, cl: cl * TO_CACO3.cl, so4: so4 * TO_CACO3.so4, alk, co2: 0 }
  const all = [ca, mgI, na, alk, cl, so4].every((x) => ok(x) && x >= 0)
  const h = hardness({ ca: v.ca, mg: v.mg, alk })
  return (
    <>
      <Md>{R`$$TH = \text{Ca} + \text{Mg}\ \ (\text{as CaCO}_3)$$
$$CH = \min(TH,\ \text{Alk}),\qquad NCH = TH - CH$$
- TH > Alk: CH = Alk, NCH = TH − Alk; **Ca-NCH** = Ca − Alk (if +), the rest of the NCH is Mg.
- TH ≤ Alk: CH = TH, NCH = 0; the extra alkalinity is "Na₂CO₃" (non-hardness).
- Bar diagram: cations Ca → Mg → Na on top, anions HCO₃ → Cl → SO₄ below; CO₂ to the left of zero. CH ends where HCO₃ ends.`}</Md>
      {all && <BarDiagram bars={bars(v)} mark={[{ label: 'Alk', at: alk }]} />}
      <Lookup
        result={
          all ? (
            <span>
              Ca {f1(v.ca)} + Mg {f1(v.mg)} = TH <b>{f1(h.th)}</b> · CH <b>{f1(h.ch)}</b> · NCH <b>{f1(h.nch)}</b> (Ca {f1(h.caNch)}, Mg {f1(h.mgNch)}) mg/L as CaCO₃
            </span>
          ) : (
            'all values ≥ 0'
          )
        }
      >
        <NumIn label="Ca²⁺" value={ca} onChange={setCa} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Mg²⁺" value={mgI} onChange={setMgI} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Na⁺" value={na} onChange={setNa} step={1} unit="mg/L" w="w-14" />
        <NumIn label="Alk" value={alk} onChange={setAlk} step={1} unit="as CaCO₃" w="w-14" />
        <NumIn label="Cl⁻" value={cl} onChange={setCl} step={1} unit="mg/L" w="w-14" />
        <NumIn label="SO₄²⁻" value={so4} onChange={setSo4} step={1} unit="mg/L" w="w-14" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Preset: the split-treatment sheet (T07) — TH 328.6, Alk 198, NCH 130.6 = 40 Ca + 90.6 Mg.</div>
    </>
  )
}

// ---------------------------------------------------------------- c-henry
function HenryBody() {
  const [x, setX] = useState(6.84e-8)
  const [H, setH] = useState(560)
  const [nAir, setNAir] = useState(0.01)
  const [mw, setMw] = useState(131.4)
  // per mol of water: X moves to the air; H = (X / nAir) / (x − X)
  const X = (H * x * nAir) / (1 + H * nAir)
  const left = x - X
  const good = [x, H, nAir, mw].every((v) => ok(v) && v > 0)
  return (
    <>
      <Md>{R`$$P_{\text{gas}} = H\,x\qquad \Big(\tfrac{\text{mol gas}}{\text{mol air}}\Big) = H\ (\text{atm})\times\Big(\tfrac{\text{mol gas}}{\text{mol water}}\Big)$$
- Mole fraction → mg/L: $x \times 55.6\ \tfrac{\text{mol water}}{\text{L}} \times \text{MW} \times 1000$ (µg/L: × 10⁶).
- Gas shared with a small air volume (T04-C, per mol of water): let X mol leave, $H = \dfrac{X/n_{air}}{x - X}$ ⇒ $X = \dfrac{H\,n_{air}\,x}{1 + H\,n_{air}}$.
- Higher H = less soluble = easier to strip (aeration removes high-H gases: CO₂, H₂S, VOCs like TCE).`}</Md>
      <Lookup
        result={
          good ? (
            <span>
              Initial {f1(mgLFromMoleFraction(x, mw) * 1000)} µg/L · moved to air X = <b>{X.toExponential(3)}</b> mol · left in water {left.toExponential(3)} mol/mol = <b>{f1(mgLFromMoleFraction(left, mw) * 1000)} µg/L</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="x" value={x} onChange={setX} step={1e-8} w="w-24" />
        <NumIn label="H" value={H} onChange={setH} step={10} unit="atm" w="w-16" />
        <NumIn label="n air" value={nAir} onChange={setNAir} step={0.005} unit="mol" w="w-16" />
        <NumIn label="MW" value={mw} onChange={setMw} step={1} w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (T04-C, TCE): 6.84×10⁻⁸ mol/mol ≈ 500 µg/L; with 0.01 mol air and H = 560, X = 5.8×10⁻⁸ mol, ≈ 75.7 µg/L stays.</div>
    </>
  )
}

// ---------------------------------------------------------------- c-aer
function AerBody() {
  const [C0, setC0] = useState(1.5)
  const [Cs, setCs] = useState(9.09)
  const [Ka, setKa] = useState(0.01)
  const [Ct, setCt] = useState(8.5)
  const good = [C0, Cs, Ka, Ct].every(ok) && Ka > 0 && Cs > C0 && Ct > C0 && Ct < Cs
  const t = good ? aerationTime({ C0, Ct, Cs, Ka }) : NaN
  const tMax = good ? Math.max(t * 1.4, 1) : 100
  const ts = Array.from({ length: 81 }, (_, i) => (i / 80) * tMax)
  return (
    <>
      <Md>{R`$$\frac{dC}{dt} = K_La\,(C_s - C)\ \Rightarrow\ \ln\frac{C_s - C_t}{C_s - C_0} = -K_La\,t,\qquad a = \frac{A}{V}$$
Droplet / single-constant form: $\ln\frac{C_s - C}{C_s - C_0} = -Kt$. The deficit $C_s - C$ falls exponentially; the last bit to saturation is the slowest.`}</Md>
      {good && (
        <Chart w={360} h={210} x={{ min: 0, max: tMax, label: 'time t' }} y={{ min: 0, max: Cs * 1.08, label: 'C (mg/L)' }} label="aeration curve">
          {(s) => (
            <>
              <line x1={s.L} x2={s.R} y1={s.Y(Cs)} y2={s.Y(Cs)} stroke="var(--c-faint)" strokeDasharray="4 3" />
              <text x={s.R - 2} y={s.Y(Cs) - 3} fontSize={8} textAnchor="end" fill="var(--c-mute)">
                Cs
              </text>
              <path d={pathOf(ts.map((tt) => [tt, aerationConc({ C0, Cs, Ka, t: tt })]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              <line x1={s.X(t)} x2={s.X(t)} y1={s.Y(Ct)} y2={s.B} stroke="var(--c-load)" strokeDasharray="3 2" />
              <line x1={s.L} x2={s.X(t)} y1={s.Y(Ct)} y2={s.Y(Ct)} stroke="var(--c-load)" strokeDasharray="3 2" />
              <circle cx={s.X(t)} cy={s.Y(Ct)} r={3.2} fill="var(--c-load)" />
            </>
          )}
        </Chart>
      )}
      <Lookup result={good ? <span>t = <b>{f2(t)}</b> (time units of 1/K<sub>L</sub>a) to go {f2(C0)} → {f2(Ct)} mg/L</span> : 'C0 < Ct < Cs, KLa > 0'}>
        <NumIn label="C0" value={C0} onChange={setC0} step={0.5} w="w-14" />
        <NumIn label="Ct" value={Ct} onChange={setCt} step={0.5} w="w-14" />
        <NumIn label="Cs" value={Cs} onChange={setCs} step={0.1} w="w-14" />
        <NumIn label={<>K<sub>L</sub>a</>} value={Ka} onChange={setKa} step={0.005} unit="/time" w="w-16" />
      </Lookup>
      <div className="text-[11px] text-faint mt-1">Class (T04-A): KL = 0.03 m/h, a = 400/(400×3) = 0.33 m⁻¹ → KLa = 0.01 h⁻¹ → t ≈ 258 h ≈ 11 days. T04-B: K = ln(6/9.2)/(−2) = 0.2137 s⁻¹, then 10.4 s to reach 8.2 mg/L.</div>
    </>
  )
}

// ---------------------------------------------------------------- c-lsi
function LsiBody() {
  const [pH, setPH] = useState(7.5)
  const [pk, setPk] = useState(2.3)
  const [ca, setCa] = useState(80)
  const [alk, setAlk] = useState(150)
  const good = [pH, pk, ca, alk].every(ok) && ca > 0 && alk > 0
  const l = good ? langelier({ pH, pK2minusPKs: pk, caMgL: ca, alkCaCO3: alk }) : null
  return (
    <>
      <Md>{R`$$pH_s = (pK_2 - pK_s) + pCa^{2+} + pAlk,\qquad LI = pH - pH_s,\qquad RI = 2\,pH_s - pH$$
Ca in mol/L, alkalinity in eq/L (mg/L as CaCO₃ ÷ 50 000). LI < 0 corrosive, LI > 0 scale-forming.`}</Md>
      <RT head={['Ryznar index', 'Water']} rows={[['< 5.5', 'heavy scale'], ['5.5 – 6.2', 'some scale'], ['6.2 – 6.8', 'stable (non-scaling, non-corrosive)'], ['6.8 – 8.5', 'corrosive'], ['> 8.5', 'very corrosive']]} hl={(i) => !!l && [l.rsi < 5.5, l.rsi >= 5.5 && l.rsi < 6.2, l.rsi >= 6.2 && l.rsi < 6.8, l.rsi >= 6.8 && l.rsi <= 8.5, l.rsi > 8.5][i]} cap="Rowshan ma'am L9 (water stability). No numerical example on her slides." />
      <Lookup result={l ? <span>pCa {f2(l.pCa)} · pAlk {f2(l.pAlk)} · pHs <b>{f2(l.pHs)}</b> · LI <b>{f2(l.lsi)}</b> · RI <b>{f2(l.rsi)}</b></span> : '—'}>
        <NumIn label="pH" value={pH} onChange={setPH} step={0.1} w="w-14" />
        <NumIn label="pK2 − pKs" value={pk} onChange={setPk} step={0.1} w="w-14" />
        <NumIn label="Ca²⁺" value={ca} onChange={setCa} step={5} unit="mg/L" w="w-14" />
        <NumIn label="Alk" value={alk} onChange={setAlk} step={5} unit="as CaCO₃" w="w-14" />
      </Lookup>
    </>
  )
}

export const CHEM_ITEMS: EvRefItem[] = [
  { id: 'c-caco3', group: 'chem', title: 'Ions and chemicals to mg/L as CaCO₃', tag: 'TA T01–T02', exam: true, keywords: 'equivalent weight factor conversion caco3 lime soda alum mw molecular', Body: Caco3Body },
  { id: 'c-alk', group: 'chem', title: 'Alkalinity from a titration (P and M)', tag: 'TA T02', exam: true, keywords: 'phenolphthalein methyl orange hydroxide carbonate bicarbonate oh co3 hco3 8.3 4.5', Body: AlkBody },
  { id: 'c-carb', group: 'chem', title: 'Carbonate species against pH', tag: 'TA T02', keywords: 'alpha fraction h2co3 hco3 co3 pk1 pk2 carbonate system distribution', Body: CarbBody },
  { id: 'c-hard', group: 'chem', title: 'Hardness: TH, CH, NCH and the bar diagram', tag: 'TA T02, T07', exam: true, keywords: 'carbonate non-carbonate hardness nch ch th bar diagram milliequivalent', Body: HardBody },
  { id: 'c-henry', group: 'chem', title: "Henry's law and gas stripping (TCE)", tag: 'TA T04', exam: true, keywords: 'henry constant mole fraction tce air stripping solubility', Body: HenryBody },
  { id: 'c-aer', group: 'chem', title: 'Aeration curve: C against t', tag: 'TA T04', exam: true, keywords: 'gas transfer kla deficit saturation dissolved oxygen do aerator time', Body: AerBody },
  { id: 'c-lsi', group: 'chem', title: 'Langelier and Ryznar indices (water stability)', tag: 'RM L9', keywords: 'lsi rsi phs saturation scale corrosion stability langelier ryznar', Body: LsiBody },
]
