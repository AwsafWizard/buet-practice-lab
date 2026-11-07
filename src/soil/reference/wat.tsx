// Chart pane, compaction & water (w-) items: Proctor, field control, rollers, permeability, capillarity,
// effective stress and quick condition, filters, flow nets. Plus two step checklists (st-).
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { tipAxes } from '../../components/PointTip'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { energy, gdAtS, leeSinghRC, MODIFIED, modelCurve, rcFromDr, shiftForEnergy, STANDARD, zav } from '../engine/compaction'
import { flatDamExact, sheetPileExact } from '../engine/flownet'
import { capRiseSoil, capRiseTube, hazen, kAtTemp, kBand, TYPICAL_HC, TYPICAL_K, VISCOSITY } from '../engine/permeability'
import { icrFromGsE } from '../engine/stresses'
import { useUsed, type SmRefItem } from './pane'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const sci = (v: number) => (Number.isFinite(v) ? v.toExponential(2).replace('e', ' × 10^').replace('^+', '^').replace(/\^(-?\d+)/, (_, e) => `${toSup(e)}`) : '—')
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const toSup = (s: string) => [...s].map((c) => SUP[c] ?? c).join('')

// ---------------------------------------------------------------- w-proctor
function ProctorChart({ mod }: { mod: boolean }) {
  const Gs = 2.64
  const std = { omc: 0.155, mdd: 17.2 }
  const m = shiftForEnergy(std, Gs, 4.55)
  const W = 320
  const Hh = 170
  const w0 = 0.06
  const w1 = 0.26
  const g0 = 15
  const g1 = 20.5
  const X = (w: number) => 30 + ((w - w0) / (w1 - w0)) * (W - 40)
  const Y = (g: number) => Hh - 22 - ((g - g0) / (g1 - g0)) * (Hh - 32)
  const ws = Array.from({ length: 61 }, (_, k) => w0 + ((w1 - w0) * k) / 60)
  const path = (f: (w: number) => number) => ws.map((w, k) => `${k ? 'L' : 'M'}${X(w).toFixed(1)},${Y(Math.max(g0, Math.min(g1, f(w)))).toFixed(1)}`).join('')
  const S = shiftForEnergy(std, Gs, 1).S
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full max-w-[340px]" role="img" aria-label="Standard and Modified Proctor curves with the zero-air-void line" {...tipAxes({ X: (v) => X(v / 100), Y, x: 'w', xUnit: ' %', y: 'γd', yUnit: ' kN/m³' })}>
      <line x1={30} y1={Hh - 22} x2={W - 8} y2={Hh - 22} stroke="var(--c-line)" />
      <line x1={30} y1={8} x2={30} y2={Hh - 22} stroke="var(--c-line)" />
      <text x={W - 10} y={Hh - 8} fontSize={9} textAnchor="end" fill="var(--c-mute)">w</text>
      <text x={6} y={14} fontSize={9} fill="var(--c-mute)">γd</text>
      <path d={path((w) => zav(w, Gs))} fill="none" stroke="var(--c-water)" strokeWidth={1.5} data-name="ZAV" />
      <text x={X(0.215)} y={Y(zav(0.215, Gs)) - 4} fontSize={8.5} fill="var(--c-water)">ZAV (S = 100 %)</text>
      <path d={path((w) => gdAtS(w, Gs, S))} fill="none" stroke="var(--c-water)" strokeDasharray="3 3" strokeWidth={1} opacity={0.7} data-name="line of optimums" />
      <text x={X(0.235)} y={Y(gdAtS(0.235, Gs, S)) + 10} fontSize={8} fill="var(--c-water)">line of optimums (S ≈ {Math.round(S * 100)} %)</text>
      <path d={path((w) => modelCurve(std, Gs, w))} fill="none" stroke={mod ? 'var(--c-mute)' : 'var(--c-accent)'} strokeWidth={mod ? 1.2 : 2} data-name="Standard" />
      <path d={path((w) => modelCurve(m, Gs, w))} fill="none" stroke={mod ? 'var(--c-accent)' : 'var(--c-mute)'} strokeWidth={mod ? 2 : 1.2} data-name="Modified" />
      <circle cx={X(std.omc)} cy={Y(std.mdd)} r={2.5} fill="var(--c-ink)" data-tip={`Standard: OMC = ${f2(std.omc * 100)} %, MDD = ${f3(std.mdd)}`} />
      <circle cx={X(m.omc)} cy={Y(m.mdd)} r={2.5} fill="var(--c-ink)" data-tip={`${mod ? 'Modified' : 'shifted'}: OMC = ${f2(m.omc * 100)} %, MDD = ${f3(m.mdd)}`} />
      <text x={X(std.omc) + 4} y={Y(std.mdd) - 4} fontSize={8.5} fill="var(--c-ink)">Standard</text>
      <text x={X(m.omc) - 4} y={Y(m.mdd) - 5} fontSize={8.5} fill="var(--c-ink)" textAnchor="end">Modified</text>
      <line x1={X(std.omc)} y1={Y(std.mdd)} x2={X(std.omc)} y2={Hh - 22} stroke="var(--c-line)" strokeDasharray="2 2" />
      <text x={X(std.omc)} y={Hh - 12} fontSize={8} textAnchor="middle" fill="var(--c-mute)">OMC</text>
    </svg>
  )
}

function ProctorBody() {
  const used = useUsed('w-proctor')
  const [blows, setBlows] = useState(25)
  const [layers, setLayers] = useState(3)
  const [mass, setMass] = useState(2.495)
  const [drop, setDrop] = useState(0.3048)
  const [vol, setVol] = useState(943.3)
  const [w, setW] = useState(15)
  const [Gs, setGs] = useState(2.7)
  const E = [blows, layers, mass, drop, vol].every(ok) && vol > 0 ? energy({ blows, layers, massKg: mass, dropM: drop, Vcm3: vol }) : null
  const es = energy(STANDARD)
  const em = energy(MODIFIED)
  return (
    <>
      <RT
        head={['', 'Standard', 'Modified']}
        rows={[
          ['Code', 'ASTM D-698, AASHTO T-99', 'ASTM D-1557, AASHTO T-180'],
          ['Mould', '101.6 mm (4 in) dia, 943.3 cm³ (1/30 ft³)', 'same'],
          ['Hammer', `${STANDARD.massKg} kg (5.5 lb)`, `${MODIFIED.massKg} kg (10 lb)`],
          ['Drop', '305 mm (12 in)', '457 mm (18 in)'],
          ['Layers × blows', '3 × 25', '5 × 25'],
          ['Energy', `${fmt(es.ftlb, 0)} ft-lb/ft³ ≈ ${fmt(es.kJ, 1)} kJ/m³`, `${fmt(em.ftlb, 0)} ft-lb/ft³ ≈ ${fmt(em.kJ, 0)} kJ/m³ (≈ 4.55×)`],
          ['Use', 'light compaction: minor roads, ordinary fills', 'heavy compaction: highways, airfields, major dams'],
        ]}
        hl={(i) => !!used && i === 5}
        cap="SJMY sir, Lecture 5. Larger moulds (6 in) take 56 blows per layer for coarse soils; hammer, drop and layers stay the same."
      />
      <Md>{`$$E = \\frac{\\text{blows/layer} \\times \\text{layers} \\times W \\times h}{V_{mould}},\\qquad \\gamma_d = \\frac{\\gamma}{1+w},\\qquad \\gamma_{zav} = \\frac{G_s\\gamma_w}{1+wG_s}$$
- At saturation S: $\\gamma_d = G_s\\gamma_w/(1 + wG_s/S)$ (the S = 90 %, 80 % lines can cross the curve; the ZAV line never can).
- More energy → curve moves **up and left** (higher γd,max, lower OMC); the peaks lie on a line of optimums roughly parallel to the ZAV line (S ≈ 80–85 %).`}</Md>
      <ProctorChart mod={used?.energy === 'mod'} />
      <Lookup result={E ? <span>E = <b>{fmt(E.kJ, 1)}</b> kJ/m³ ({fmt(E.kJ / es.kJ, 2)} × Standard)</span> : '—'}>
        <NumIn label="blows" value={blows} onChange={setBlows} step={1} w="w-12" />
        <NumIn label="layers" value={layers} onChange={setLayers} step={1} w="w-12" />
        <NumIn label="hammer" value={mass} onChange={setMass} step={0.1} unit="kg" w="w-16" />
        <NumIn label="drop" value={drop} onChange={setDrop} step={0.01} unit="m" w="w-16" />
        <NumIn label="V" value={vol} onChange={setVol} step={10} unit="cm³" w="w-16" />
      </Lookup>
      <Lookup result={ok(w) && ok(Gs) ? <span>γzav = <b>{f2(zav(w / 100, Gs))}</b> kN/m³ = {f3(zav(w / 100, Gs, 1))} t/m³ · S = 90 %: {f2(gdAtS(w / 100, Gs, 0.9))} kN/m³</span> : '—'}>
        <NumIn label="w" value={w} onChange={setW} step={0.5} unit="%" w="w-14" />
        <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- w-field
function FieldBody() {
  const [Dr, setDr] = useState(64)
  const [gmin, setGmin] = useState(15.25)
  const [gmax, setGmax] = useState(18.31)
  return (
    <>
      <Md>{`**End-product (performance) spec** — the usual one: field $\\gamma_d \\ge$ RC × lab $\\gamma_{d,max}$ (RC = 90–95 % of Standard or Modified), moulding w within OMC ± 1.5–2 %; clean sands Dr ≥ 70–80 %. Contractor picks the plant; engineer checks each lift by field density tests.
**Method (procedural) spec** — roller type and weight, lift thickness (150–300 mm), passes and w, usually fixed on a trial strip; checked by supervision.

$$RC = \\frac{\\gamma_{d(field)}}{\\gamma_{d,max(lab)}},\\qquad D_r = \\frac{e_{max}-e}{e_{max}-e_{min}} = \\frac{\\gamma_d-\\gamma_{d,min}}{\\gamma_{d,max}-\\gamma_{d,min}}\\cdot\\frac{\\gamma_{d,max}}{\\gamma_d}$$
$$RC = \\frac{A}{1-D_r(1-A)},\\ A = \\frac{\\gamma_{d,min}}{\\gamma_{d,max}};\\qquad \\text{Lee \\& Singh: } RC = 80 + 0.2D_r\\ (\\%)$$
RC can exceed 100 %; RC ≈ 80 % at Dr = 0.

**Sand cone** (Lecture 6): calibrate $\\rho_{sand} = W/V$ and $W_{cone} = W_1 - W_2$. Field: $W_6 = W_3 - W_5 - W_{cone}$, $V_{hole} = W_6/\\rho_{sand}$, $\\rho = W_{wet}/V$, $\\rho_d = W_{dry}/V$. Also: core cutter ($V = \\pi D^2L/4$), rubber balloon, nuclear gauge.

**Earthwork**: solids are conserved. $W_s = \\gamma_{d,fill}V_{fill}$, $V_{borrow} = W_s/\\gamma_{d,borrow}$, loose $V = W_s/\\gamma_{d,loose}$ (or × bulking), water to add $= (w_{fill} - w_{borrow})W_s$.`}</Md>
      <Lookup result={[Dr, gmin, gmax].every(ok) && gmax > gmin ? <span>RC = <b>{fmt(rcFromDr(Dr / 100, gmin, gmax) * 100, 1)} %</b> · Lee & Singh {fmt(leeSinghRC(Dr), 1)} %</span> : '—'}>
        <NumIn label="Dr" value={Dr} onChange={setDr} step={5} unit="%" w="w-14" />
        <NumIn label="γd,min" value={gmin} onChange={setGmin} step={0.1} w="w-16" />
        <NumIn label="γd,max" value={gmax} onChange={setGmax} step={0.1} w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- w-rollers
const ROLLERS: [string, string, string][] = [
  ['Smooth steel-drum (wheel)', 'Static pressure 310–380 kPa, 100 % coverage', 'Proof rolling, finishing sub-grade / base; sandy and clayey soils in thin lifts'],
  ['Pneumatic rubber-tyred', 'Pressure + kneading 585–690 kPa, 70–80 % coverage', 'Sandy and clayey soils, mixed soils, asphalt'],
  ['Sheepsfoot', '1380–6900 kPa under the feet (25–85 cm² projections); compacts the lift from the bottom up', 'Clays and cohesive soils'],
  ['Vibratory roller', 'Vibration from rotating off-centre weights on a drum, tyred or sheepsfoot roller', 'Granular soils (sand, gravel)'],
  ['Vibratory plate (hand held)', '≥ 1600 cycles/min', 'Granular soils in small or confined areas'],
  ['Vibroflot', 'Deep vibration with water jetting', 'Thick loose granular deposits (deep compaction)'],
]
function RollersBody() {
  const used = useUsed('w-rollers')
  return (
    <>
      <RT head={['Roller', 'How it compacts', 'Best for']} rows={ROLLERS} hl={(i) => !!used && ROLLERS[i][0] === used.roller} cap="SJMY sir, Lecture 5. Lift 150–300 mm, rollers 1–20 t; add passes and adjust w until the field tests pass." />
    </>
  )
}

// ---------------------------------------------------------------- w-k
function KBody() {
  const used = useUsed('w-k')
  const [D10, setD10] = useState(0.1)
  const [C, setC] = useState(100)
  const [k, setK] = useState(1e-3)
  const [T, setT] = useState(27)
  return (
    <>
      <RT
        head={['Soil (class list)', 'k (cm/s)']}
        rows={TYPICAL_K.map((b) => [b.soil, `${sci(b.lo)} – ${sci(b.hi)}`])}
        hl={(i) => !!used && TYPICAL_K[i].soil === used.band}
        cap="Question Bank formula sheet: gravel > 10⁻¹; coarse sand 1–10⁻²; fine sand 10⁻²–10⁻³; silt 10⁻³–10⁻⁵; clay < 10⁻⁶ cm/s. 1 cm/s = 10⁻² m/s = 864 m/day."
      />
      <Md>{`$$\\text{Hazen: } k\\ (\\text{cm/s}) = C\\,D_{10}^2\\quad(D_{10}\\text{ in cm},\\ C \\approx 100\\text{–}150)\\qquad k_{T_1} = k_T\\,\\frac{\\eta_T}{\\eta_{T_1}}$$
Factors: grain size (k ∝ D10²), void ratio, structure (flocculated > dispersed), degree of saturation (air blocks flow), pore fluid and temperature (through γw/η).`}</Md>
      <RT head={['T (°C)', ...VISCOSITY.map(([t]) => String(t))]} rows={[['η (mPa·s)', ...VISCOSITY.map(([, m]) => String(m))]]} />
      <Lookup result={ok(D10) && ok(C) ? <span>k ≈ <b>{sci(hazen(D10, C))}</b> cm/s ({kBand(hazen(D10, C))})</span> : '—'}>
        <NumIn label="D10" value={D10} onChange={setD10} step={0.01} unit="mm" w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={10} w="w-14" />
      </Lookup>
      <Lookup result={ok(k) && ok(T) ? <span>k₂₀ = {sci(kAtTemp(k, T, 20))} cm/s (from {T} °C)</span> : '—'}>
        <NumIn label="k" value={k} onChange={setK} step={0.0001} unit="cm/s" w="w-20" />
        <NumIn label="T" value={T} onChange={setT} step={1} unit="°C" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- w-perm (tests and layers)
function PermTestsBody() {
  return (
    <Md>{`$$v = ki,\\quad q = kiA,\\quad v_s = \\frac{v}{n}\\quad(\\text{Darcy, laminar flow})$$
$$\\text{Constant head: } k = \\frac{QL}{Aht}\\qquad \\text{Falling head: } k = \\frac{aL}{At}\\ln\\frac{h_1}{h_2} = 2.303\\frac{aL}{At}\\log\\frac{h_1}{h_2}$$
- Same apparatus: $t \\propto \\ln(h_1/h_2)$.
- Constant head for coarse soils (k > 10⁻³ cm/s); falling head for fine sand and silt; clays indirectly: $k = c_v m_v \\gamma_w$ from the oedometer.
$$k_{h,eq} = \\frac{\\sum k_iH_i}{\\sum H_i}\\qquad k_{v,eq} = \\frac{\\sum H_i}{\\sum H_i/k_i}\\qquad (k_h \\ge k_v)$$
$$\\text{Pumping, unconfined: } k = \\frac{q\\ln(r_2/r_1)}{\\pi(h_2^2-h_1^2)}\\qquad \\text{confined (thickness } T): k = \\frac{q\\ln(r_2/r_1)}{2\\pi T(h_2-h_1)}$$
h measured up from the impermeable base (unconfined) or as piezometric head (confined).`}</Md>
  )
}

// ---------------------------------------------------------------- w-cap
function CapBody() {
  const used = useUsed('w-cap')
  const [d, setD] = useState(0.01)
  const [e, setE] = useState(0.6)
  const [D10, setD10] = useState(0.02)
  const [C, setC] = useState(0.3)
  return (
    <>
      <Md>{`$$\\pi r^2h_c\\gamma_w = 2\\pi r\\sigma\\cos\\theta\\ \\Rightarrow\\ h_c = \\frac{2\\sigma\\cos\\theta}{r\\gamma_w} = \\frac{4\\sigma\\cos\\theta}{d\\gamma_w}$$
Water: σ ≈ 0.073 N/m, θ ≈ 0 → $h_c \\approx 0.3/d$ cm with d in cm (the handnote's formula sheet prints 0.03/d; one zero too many is missing). Soils (Hazen): $h_c = C/(eD_{10})$, C = 0.1–0.5 cm².
In the capillary zone the soil is saturated and $u = -h\\gamma_w$ (h above the WT): σ′ goes **up** by that much.`}</Md>
      <RT head={['Soil', 'hc (m)']} rows={TYPICAL_HC.map((b) => [b.soil, `${b.lo}–${b.hi}`])} hl={(i) => !!used && TYPICAL_HC[i].soil === used.soil} cap="Question Bank 2011-12 Q8(d)." />
      <Lookup result={ok(d) && d > 0 ? <span>tube: hc = <b>{f3(capRiseTube(d / 1000))}</b> m</span> : '—'}>
        <NumIn label="d" value={d} onChange={setD} step={0.005} unit="mm" w="w-16" />
      </Lookup>
      <Lookup result={[e, D10, C].every(ok) && e > 0 && D10 > 0 ? <span>soil: hc = <b>{f2(capRiseSoil(e, D10 / 10, C) / 100)}</b> m</span> : '—'}>
        <NumIn label="e" value={e} onChange={setE} step={0.05} w="w-14" />
        <NumIn label="D10" value={D10} onChange={setD10} step={0.005} unit="mm" w="w-16" />
        <NumIn label="C" value={C} onChange={setC} step={0.05} unit="cm²" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- w-eff (effective stress, quick condition, heave)
function EffBody() {
  const [Gs, setGs] = useState(2.65)
  const [e, setE] = useState(0.65)
  return (
    <>
      <Md>{`$$\\sigma' = \\sigma - u\\qquad \\text{no flow: } \\sigma' = z\\gamma'\\qquad \\uparrow\\text{flow: } z\\gamma' - iz\\gamma_w\\qquad \\downarrow\\text{flow: } z\\gamma' + iz\\gamma_w$$
- Seepage pressure $p_s = iz\\gamma_w = h\\gamma_w$; seepage force per unit volume $j = i\\gamma_w$ along the flow.
- Standing water of any depth adds equally to σ and u: σ′ = zγ′ is independent of it.
$$i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1+e}\\ (\\approx 1),\\qquad \\gamma_{sat} = \\frac{(G_s+e)\\gamma_w}{1+e},\\ \\gamma' = \\frac{(G_s-1)\\gamma_w}{1+e}$$
- Quick (boiling) condition: upward flow and $i \\ge i_{cr}$, i.e. $h\\gamma_w \\ge z\\gamma'$.
- Weighting filter on top (no head loss in it): $FS = \\dfrac{\\gamma'L + \\gamma'_f z_f}{h\\gamma_w}$.
- Excavation in clay over sand with head $h_p$ above the clay base: heave when $(H_c - d)\\gamma_{sat} < h_p\\gamma_w$; $FS = (H_c-d)\\gamma_{sat}/(h_p\\gamma_w)$.`}</Md>
      <Lookup result={ok(Gs) && ok(e) ? <span>icr = <b>{f3(icrFromGsE(Gs, e))}</b> · γsat = {f2(((Gs + e) * 9.81) / (1 + e))} · γ′ = {f2(((Gs - 1) * 9.81) / (1 + e))} kN/m³</span> : '—'}>
        <NumIn label="Gs" value={Gs} onChange={setGs} step={0.01} w="w-14" />
        <NumIn label="e" value={e} onChange={setE} step={0.05} w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- w-filter
function FilterBody() {
  return (
    <>
      <RT
        head={['Criterion (Terzaghi)', 'Rule', 'Why']}
        rows={[
          ['Piping (retention)', 'D15(F)/D85(B) < 4–5', 'filter pores small enough to hold the base soil'],
          ['Permeability', 'D15(F)/D15(B) > 4–5', 'filter much more permeable: no pressure build-up'],
          ['Grading', 'curve roughly parallel to the base soil, between the curves through 4D15(B) and 4D85(B)', 'no segregation'],
          ['Also used', 'D50(F)/D50(B) < 25; fines (< 0.075 mm) ≤ 5 %', 'filter does not clog'],
        ]}
        cap="SJMY sir, Lecture 14 (Indian Road Congress / Railways: piping ratio < 5, permeability ratio > 5). F = filter, B = base soil being protected."
      />
      <Md>{`- **Graded (inverted) filter**: several layers, each a filter for the one below, grain size increasing in the flow direction (fine sand → coarse sand → gravel): weir floors, dam toes, behind walls.
- **Thickness**: its submerged weight must beat the upward seepage force for the required FS (Terzaghi prism: $FS = (W' + W_f)/U$).`}</Md>
    </>
  )
}

// ---------------------------------------------------------------- w-flownet
function FlownetBody() {
  const used = useUsed('w-flownet')
  const [s, setS] = useState(5)
  const [T, setT] = useState(10)
  const [B, setB] = useState(20)
  const [Td, setTd] = useState(12)
  return (
    <>
      <Md>{`**Properties**: flow lines ⟂ equipotentials; lines of one family never cross; curvilinear squares (b = l, a circle fits); equal Δq in every channel; equal Δh between equipotentials; the net depends only on the boundaries (not k or H). Impermeable boundaries (pile, base, impermeable stratum) are flow lines; submerged soil surfaces are equipotentials.
$$\\nabla^2 h = \\frac{\\partial^2 h}{\\partial x^2} + \\frac{\\partial^2 h}{\\partial z^2} = 0\\qquad (k_x h_{xx} + k_z h_{zz} = 0)$$
$$q = kH\\frac{N_f}{N_d},\\quad \\Delta h = \\frac{H}{N_d},\\quad \\Delta q = k\\Delta h\\ \\text{per channel}$$
- Head left at a point after $n$ drops: $h_P = H - n\\Delta h$ (above tail water). Seepage pressure $= h_P\\gamma_w$. Pore pressure $u = (\\text{depth below the D/S water} + h_P)\\gamma_w$ = (total head − elevation)γw.
- Exit gradient $i_e = \\Delta h / l$ of the last field; Harza $FS = i_{cr}/i_e$ (want 3–4 or more).
- Terzaghi heave: prism D × D/2 beside the downstream pile, $FS = \\dfrac{W'}{U} = \\dfrac{D\\gamma'}{h_a\\gamma_w} = \\dfrac{i_{cr}}{i_{av}}$, $h_a$ = average head above tail water at the tip level (FS 4–5 in design).
- Uplift: $u = (\\text{pressure head})\\gamma_w$ at each point of the base; $U$ = area of the diagram; $FS_{uplift} = W/U$.
- Anisotropic: draw on the transformed section $x_T = x\\sqrt{k_z/k_x}$, then $q = \\sqrt{k_xk_z}\\,H N_f/N_d$.`}</Md>
      <Lookup result={ok(s) && ok(T) && s > 0 && s < T ? <span>one sheet pile (exact): N<sub>f</sub>/N<sub>d</sub> = <b>{f3(sheetPileExact(s, T))}</b>{used?.shape !== undefined ? <span className="text-faint"> · lab solver: {used.shape}</span> : null}</span> : '—'}>
        <NumIn label="penetration s" value={s} onChange={setS} step={0.5} unit="m" w="w-14" />
        <NumIn label="layer T" value={T} onChange={setT} step={0.5} unit="m" w="w-14" />
      </Lookup>
      <Lookup result={ok(B) && ok(Td) && B > 0 && Td > 0 ? <span>flat base on the surface (exact): N<sub>f</sub>/N<sub>d</sub> = <b>{f3(flatDamExact(B, Td))}</b></span> : '—'}>
        <NumIn label="base B" value={B} onChange={setB} step={1} unit="m" w="w-14" />
        <NumIn label="layer T" value={Td} onChange={setTd} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- steps
function StepsFlownet() {
  return (
    <Md>{`1. Draw to scale; mark H = U/S level − D/S level, the impermeable boundaries (flow lines) and the submerged beds (equipotentials).
2. Sketch 3–4 flow channels; add equipotentials making curvilinear squares; count Nf and Nd (fractions allowed).
3. $q = kH N_f/N_d$ per metre; × length × time if asked (1 day = 86 400 s).
4. Point P: count drops $n$, $h_P = H - n\\Delta h$; seepage pressure $h_P\\gamma_w$; $u = (z_P + h_{D/S} + h_P)\\gamma_w$ below the D/S bed.
5. Exit: $i_e = \\Delta h/l$ of the last field → Harza FS = icr/ie. Sheet pile: Terzaghi prism D × D/2, $h_a$ from the net → FS = Dγ′/(haγw).
6. Base of a dam: pressure head at each equipotential → uplift diagram, U = area, FS = W/U.
7. Comment: FS ≥ 3–4 (piping), 4–5 (heave); else deepen cut-offs, lengthen the floor, add an inverted filter / weighting blanket.`}</Md>
  )
}
function StepsEarthwork() {
  return (
    <Md>{`1. Fill: $\\gamma_d = \\gamma/(1+w)$, or RC × MDD, or $G_s\\gamma_w/(1+e)$. $W_s = \\gamma_d V_{fill}$ (t if ρ in t/m³, kN if γ in kN/m³).
2. Each borrow state: its own $\\gamma_d$ → $V = W_s/\\gamma_d$ (solids are the same).
3. Loose / truck: $\\gamma_{d,loose}$ or bulking %; trucks = ⌈V_loose / capacity⌉.
4. Water to add $= (w_{fill} - w_{borrow})W_s$ (negative → dry it); volume = weight/γw.
5. Cost per site: soil (per m³, per 100 m³ or per truck) + water + payment to the owner; pick the cheaper.`}</Md>
  )
}

export const WAT_ITEMS: SmRefItem[] = [
  { id: 'w-proctor', group: 'wat', title: 'Standard vs Modified Proctor, ZAV line', tag: 'Lecture 5 · Das Ch 6', exam: false, keywords: 'compaction energy OMC MDD zero air void saturation line', Body: ProctorBody },
  { id: 'w-field', group: 'wat', title: 'Field compaction control, sand cone, earthwork', tag: 'Lecture 6', keywords: 'relative compaction specification sand cone core cutter borrow truck', Body: FieldBody },
  { id: 'w-rollers', group: 'wat', title: 'Rollers and the soils they suit', tag: 'Lecture 5', keywords: 'sheepsfoot pneumatic smooth vibratory plate vibroflot', Body: RollersBody },
  { id: 'w-k', group: 'wat', title: 'Typical k, Hazen, temperature', tag: 'Lecture 7', keywords: 'permeability hydraulic conductivity D10 viscosity', Body: KBody },
  { id: 'w-perm', group: 'wat', title: 'Permeability tests, layers, pumping', tag: 'Lectures 7–9', keywords: 'constant head falling head layered equivalent pumping well darcy seepage velocity', Body: PermTestsBody },
  { id: 'w-cap', group: 'wat', title: 'Capillary rise', tag: 'Lecture 9', keywords: 'surface tension meniscus suction', Body: CapBody },
  { id: 'w-eff', group: 'wat', title: 'Effective stress, quick condition, heave', tag: 'Lectures 10–11', keywords: 'icr critical gradient seepage pressure boiling excavation', Body: EffBody },
  { id: 'w-filter', group: 'wat', title: 'Filter criteria, graded filter', tag: 'Lecture 14', keywords: 'D15 D85 piping permeability inverted filter', Body: FilterBody },
  { id: 'w-flownet', group: 'wat', title: 'Flow-net rules and formulas', tag: 'Lectures 12–13', keywords: 'Nf Nd seepage exit gradient Harza Terzaghi heave uplift anisotropic transformed', Body: FlownetBody },
  { id: 'st-flownet', group: 'steps', title: 'Steps: flow-net question', keywords: 'seepage sheet pile dam', Body: StepsFlownet },
  { id: 'st-earthwork', group: 'steps', title: 'Steps: borrow-pit / earthwork question', keywords: 'compaction borrow truck water', Body: StepsEarthwork },
]
