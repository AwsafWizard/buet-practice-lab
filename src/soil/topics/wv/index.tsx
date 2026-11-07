// Weight–volume relationships & relative density (AJK sir's Topic 1).
import { Link } from 'react-router-dom'
import { Callout, Md, Section, Step, Steps, Tex } from '../../../components/ui'
import { SmFrequency } from '../../components/Frequency'
import { PickSection } from '../../components/PickDrill'
import { cylinderVolume, nf, relDensity, solvePhase, unitSys, waterToRaise } from '../../engine/phase'
import { GW } from '../../engine/units'
import type { SmQ, SmTopicModule } from '../../types'
import { WvExams } from './exam'
import { PhaseStepsView } from './figs'
import { WvLab } from './Lab'
import { WV_NEW } from './notAsked'
import { WV_PICKS } from './picks'
import { WV_THEORY } from './theory'

// ---------------------------------------------------------------- overview
function Overview() {
  return (
    <div>
      <Section title="Weight–volume relationships (Topic 1)" right={<div className="w-72 hidden cq-md:block"><SmFrequency topic="sm-wv" /></div>}>
        <div className="grid cq-md:grid-cols-2 gap-4">
          <div>
            <Tex block>{`e = \\frac{V_v}{V_s},\\quad n = \\frac{V_v}{V},\\quad S = \\frac{V_w}{V_v},\\quad w = \\frac{W_w}{W_s}`}</Tex>
            <Tex block>{`\\gamma = \\frac{W}{V},\\quad \\gamma_d = \\frac{W_s}{V},\\quad \\gamma_{sat} = \\frac{W_s + \\gamma_wV_v}{V},\\quad G_s = \\frac{W_s}{V_s\\gamma_w}`}</Tex>
            <Tex block>{`D_r = \\frac{e_{\\max}-e}{e_{\\max}-e_{\\min}},\\qquad \\text{check: } Se = wG_s`}</Tex>
          </div>
          <div className="text-sm">
            <Md>{`- **The method is the block diagram.** AJK sir crosses out Das Table 3.1 (the formula sheet) twice and ends both examples with "No derived expression has been used!".
- Assume **V = 1** (γ, γd, n given) or **Vs = 1** (e given) when no size is given; fill weights on the left, volumes on the right.
- Relative density: e_max ↔ γd,min, e_min ↔ γd,max; classes 15 / 50 / 70 / 85 on the slide; "Dr > 70 %: good for EQ".
- Field density: sand cone (ASTM D1556), V = (W₅ − W_c)/γd(sand), γd = W₃/V.`}</Md>
            <Link to="/ce341/topic/sm-wv/lab" className="btn btn-primary mt-2 inline-block">
              Open the live phase diagram →
            </Link>
          </div>
        </div>
        <Callout kind="exam">
          15 parts in 11 of the 13 papers. **Derivations** from the phase diagram are the most common (Se = wGs 2007-08 and 2016-17, Sr expression 2008-09, submerged density 2012-13, γsat 2020-21, γd(S, w, Gs) 2021-22 — 12 marks each in the modern papers). **Numericals:** relative density from γd,min/γd,max and n (2007-08, 2016-17), S + Dr + γsat of a field sand (2017-18), water to add and to saturate (2011-12), and the 20-mark **UCS specimen** of 2023-24 Q1(a) (inch dimensions, gram masses, "is γ = γsat? Comment"). **Theory:** block diagram uses, Dr classes, sand cone method (2021-22, 2023-24).
        </Callout>
      </Section>
      <Section title="What changes between the papers">
        <div className="grid cq-md:grid-cols-3 gap-3 text-sm">
          <Md>{`**Units.** g and cm³ with ρw = 1 (2023-24), t/m³ (2011-12, 2016-17), kN/m³ (2017-18), pcf (Das 3.4). Inch specimens: 1 in = 2.54 cm, convert D and H.`}</Md>
          <Md>{`**Which half.** Until 2017-18 W–V sat in SJMY sir's section next to compaction; since 2020-21 it opens AJK sir's Section A (Q1(a)). Same content.`}</Md>
          <Md>{`**The comment.** Every numerical ends with a judgement: S = 100 % → γ = γsat; Dr → loose / dense; impossible data (S over 100 %).`}</Md>
        </div>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- approach
function Approach() {
  const ex32 = solvePhase({ V: 1.2, W: 2350, w: 0.086, Gs: 2.71 }, 1000)
  const ex34 = solvePhase({ gd: 103, w: 0.23, S: 1 }, 62.4)
  // the slide truncates Vs to 0.79 m³
  const vv = 1.2 - 0.79
  return (
    <div>
      <Section title="Recipe (slides 13–19)">
        <Steps>
          <Step n={1} title="Givens and units">Write every given with units. Inch → cm (×2.54), masses in g give densities in g/cc (ρw = 1). γw = 9.81 kN/m³, 62.4 pcf.</Step>
          <Step n={2} title="Draw the block diagram">Air / water / solids; weights on the left, volumes on the right. Put the givens on it.</Step>
          <Step n={3} title="Fix a size">If no V, W, Ws … is given: assume V = 1 (when γ, γd or n is given) or Vs = 1 (when e is given). Ex 3.4 keeps V symbolic — the same thing.</Step>
          <Step n={4} title="Fill the weights">W = (1 + w)Ws → Ws, Ww = wWs; or Ws = γdV, W = γV.</Step>
          <Step n={5} title="Fill the volumes">Vs = Ws/(Gsγw), Vw = Ww/γw, Vv = V − Vs, Va = Vv − Vw (or Vv = Vw when saturated).</Step>
          <Step n={6} title="Read the answers off">e = Vv/Vs, n = Vv/V, S = Vw/Vv, γ = W/V, γd = Ws/V, γsat = (Ws + γwVv)/V, Gs = Ws/(Vsγw).</Step>
          <Step n={7} title="Check and comment">Se = wGs, S ≤ 100 %, γd {'<'} γ ≤ γsat; Dr class; is γ = γsat?</Step>
        </Steps>
      </Section>
      <Section title="Which case am I in?">
        <div className="grid cq-md:grid-cols-2 gap-3 text-sm">
          <Md>{`- **A size is given** (V and W, a cylinder, a mass of soil): no assumption — Das 3.2, 2023-24 Q1(a).
- **γ or γd and w (+ Gs)**: V = 1 → W = γ, Ws = γ/(1 + w) — 2017-18 Q5(b).
- **γd, w, saturated (Gs unknown)**: V = 1 → Ws, Ww, Vw = Vv, Vs = 1 − Vv, Gs = Ws/(Vsγw) — Das 3.4.
- **e, w (or S), Gs**: Vs = 1 → Vv = e, Ws = Gsγw.`}</Md>
          <Md>{`- **γ, S, Gs (no w)**: two blocks are linked — write W = Gsγw·Vs + Sγw(1 − Vs) = γ with V = 1 and solve for Vs.
- **Relative density**: e_max = Gsγw/γd,min − 1, e_min = Gsγw/γd,max − 1, e from n or γd; Dr = (e_max − e)/(e_max − e_min).
- **Adding water**: solids do not change. ΔWw = Ws(w₂ − w₁); e stays the same, so S = wGs/e at the new w.
- **Saturating**: water needed = Vv − Vw = V·e/(1 + e)·(1 − S).`}</Md>
        </div>
        <Callout kind="trap">
          <Md>{`- Using V for Vs (or W for Ws) in e or w: e is per **solids**, n per **total**.
- Taking ρw = 1 with kN: in SI unit weights γw = 9.81 kN/m³; in g/cc ρw = 1.
- Converting only D (not H) from inches; using D as the radius.
- Rounding Vs early: the slide truncates 0.7985 to 0.79 and gets e = 0.52 instead of 0.503 (both accepted, but carry 4 figures).
- Mixing up e_max with γd,max: the **loosest** state has the **largest** e and the **smallest** γd.
- Writing the formula sheet: AJK sir wants the diagram; use Se = wGs only as a check.`}</Md>
        </Callout>
      </Section>
      <Section title="Das Ex 3.2 on the block diagram" sub="V = 1.2 m³, W = 2350 kg, w = 8.6 %, Gs = 2.71 (kg, m³, ρw = 1000 kg/m³)">
        <PhaseStepsView steps={ex32.steps} u={unitSys('kg')} />
        <p className="text-xs text-faint mt-2">
          The slide truncates Vs to 0.79 m³, so its Vv = {nf(vv, 3)} m³, e = {nf(vv / 0.79, 3)}, n = {nf(vv / 1.2, 3)}, S = {nf((ex32.vals.Vw / vv) * 100, 3)} %. Unrounded (Das): e = {nf(ex32.vals.e, 3)}, n = {nf(ex32.vals.n, 3)}, S = {nf(ex32.vals.S * 100, 3)} %.
        </p>
      </Section>
      <Section title="Das Ex 3.4 on the block diagram" sub="Saturated, γd = 103 pcf, w = 23 % → γsat, Gs, e">
        <PhaseStepsView steps={ex34.steps} u={unitSys('lb')} />
        <p className="text-xs text-faint mt-2">The slide takes Vw = 1 ft³ and V = 2.63 ft³ instead of V = 1: same ratios (e = 1/1.63 = 0.613 after rounding).</p>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------- own problems
function phaseQ(o: { id: string; level: SmQ['level']; title: string; text: string; given: Parameters<typeof solvePhase>[0]; u: 'kN' | 'g' | 't' | 'kg' | 'lb'; checks: ('w' | 'e' | 'n' | 'S' | 'g' | 'gd' | 'gsat' | 'Gs')[]; extra?: (v: ReturnType<typeof solvePhase>['vals']) => { key: string; label: string; value: number; unit?: string }[]; note?: string }): SmQ {
  const run = () => solvePhase(o.given, unitSys(o.u).gw)
  const lab = { w: 'w (%)', e: 'e', n: 'n (%)', S: 'S (%)', g: 'γ', gd: 'γd', gsat: 'γsat', Gs: 'Gs' }
  const pct = ['w', 'n', 'S']
  return {
    id: `sm-own-wv-${o.id}`,
    paper: 'own',
    level: o.level,
    sec: 'A',
    no: o.id,
    marks: 0,
    topics: ['sm-wv'],
    title: o.title,
    text: o.text,
    pages: [],
    checks: () => {
      const v = run().vals
      return [...o.checks.map((k) => ({ key: k, label: lab[k], value: pct.includes(k) ? v[k] * 100 : v[k], unit: pct.includes(k) ? '%' : k.startsWith('g') ? unitSys(o.u).g : undefined })), ...(o.extra?.(v) ?? [])]
    },
    solution: () => {
      const s = run()
      return (
        <div className="space-y-2">
          <PhaseStepsView steps={s.steps} u={unitSys(o.u)} />
          {o.extra && (
            <div className="text-sm">
              {o.extra(s.vals).map((x) => (
                <div key={x.key}>
                  {x.label} = <b>{nf(x.value, 4)}</b> {x.unit}
                </div>
              ))}
            </div>
          )}
          {o.note && <Md className="text-sm">{o.note}</Md>}
        </div>
      )
    },
  }
}

const V28 = cylinderVolume(2.8, 5.6)
const problems: SmQ[] = [
  phaseQ({
    id: '1',
    level: 'warm-up',
    title: 'Das 3.2 with new numbers (kg, m³)',
    text: 'A moist soil sample of volume 0.9 m³ has a mass of 1710 kg. Its water content is 11 % and Gs = 2.68. Using the block diagram only, find ρ, ρd, e, n, S and the volume of water in the sample.',
    given: { V: 0.9, W: 1710, w: 0.11, Gs: 2.68 },
    u: 'kg',
    checks: ['g', 'gd', 'e', 'n', 'S'],
    extra: (v) => [{ key: 'vw', label: 'Vw', value: v.Vw, unit: 'm³' }],
  }),
  phaseQ({
    id: '2',
    level: 'exam',
    title: 'UCS specimen 2.8 in × 5.6 in (2023-24 style)',
    text: 'An unconfined compression specimen is 2.8 in in diameter and 5.6 in high. It weighs 1080.0 g wet and 885.0 g after oven drying; Gs = 2.70. Find w, S, γ and γd (g/cc), e and n. Is the moist unit weight equal to the saturated unit weight? Comment.',
    given: { V: V28, W: 1080, Ws: 885, Gs: 2.7 },
    u: 'g',
    checks: ['w', 'S', 'g', 'gd', 'e', 'n'],
    extra: (v) => [{ key: 'gsat', label: 'γsat', value: v.gsat, unit: 'g/cc' }],
    note: `V = (π/4)(2.8 × 2.54)²(5.6 × 2.54) = ${nf(V28, 5)} cm³. S is below 100 %, so γ is less than γsat: the specimen holds some air.`,
  }),
  phaseQ({
    id: '3',
    level: 'exam',
    title: 'Field sand: S, Dr and γsat (2017-18 style)',
    text: 'A sand above the water table has w = 12 % and γ = 18.2 kN/m³; Gs = 2.66. Lab tests gave e_min = 0.46 and e_max = 0.88. Find e, S, the relative density (and its class) and γsat.',
    given: { w: 0.12, g: 18.2, Gs: 2.66 },
    u: 'kN',
    checks: ['e', 'S', 'gsat'],
    extra: (v) => [{ key: 'dr', label: 'Dr', value: relDensity({ e: v.e, emax: 0.88, emin: 0.46 }).pct, unit: '%' }],
    note: 'Dr = (e_max − e)/(e_max − e_min); slide scale: 50–70 % medium, 70–85 % dense.',
  }),
  phaseQ({
    id: '4',
    level: 'challenge',
    title: 'Borrow soil: water to add (2011-12 style)',
    text: 'A soil in a borrow pit has ρ = 1.95 t/m³ at w = 9 %, Gs = 2.70. For 200 m³ of it in place, find ρd and e, the water to add to bring it to 14 %, and S at 14 % (no volume change).',
    given: { V: 200, g: 1.95, w: 0.09, Gs: 2.7 },
    u: 't',
    checks: ['gd', 'e'],
    extra: (v) => [
      { key: 'add', label: 'water to add', value: waterToRaise(v.Ws, 0.09, 0.14, 1), unit: 'm³' },
      { key: 's14', label: 'S at 14 %', value: ((0.14 * 2.7) / v.e) * 100, unit: '%' },
    ],
  }),
  ...WV_NEW,
]
void GW

const mod: SmTopicModule = {
  Overview,
  Approach,
  Lab: () => (
    <div className="space-y-6">
      <Section title="Live phase diagram" sub="Pick what you know (any consistent set), or 🎲 an exam specimen. Press “Next block” and say each step before it appears; then check your answers. The chart pane (T) highlights the W–V sheet and the Dr class.">
        <WvLab />
      </Section>
      <PickSection topic="sm-wv" skills={WV_PICKS} />
      <WvExams />
    </div>
  ),
  problems,
  theory: WV_THEORY,
}
export default mod
