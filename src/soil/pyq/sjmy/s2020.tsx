// CE 341 term final 2020-21 — SJMY sir’s half (compaction, permeability, seepage, consolidation, stress distribution + W–V in that section), solved by the engines.
// Section A (Q1–Q4), held 15 Oct 2022, PDF pp. 53–55 (+ Fig. 1 on p. 60).
import { Md, Tex } from '../../../components/ui'
import { checkSpec, fieldTest } from '../../engine/compaction'
import { scaleTime, settleProfile, type SettleIn } from '../../engine/consolidation'
import { layered } from '../../engine/permeability'
import { profile } from '../../engine/stresses'
import { Irect } from '../../engine/stressdist'
import { GW } from '../../engine/units'
import { FadumChart } from '../../reference/sd'
import { ProfileFig } from '../../topics/consol/figs'
import { SettleSolution } from '../../topics/consol/Solution'
import { LayersFig } from '../../topics/perm/Labs'
import { PROF_DEFAULT, ProfileFigure, ProfileSolution, toProfileIn } from '../../topics/seep/ProfileLab'
import type { SmQ } from '../../types'
import { BulbAnswer, ContactAnswer, CornerTable, f2, f3, f4, Frm, Head, Model, Models, netOf, netPoint, NetFig, PlanFig, Result, sciTex, Sol, SoilColumn, Tbl, th } from './kit'

const P = '2020-21' as const

// ---------------------------------------------------------------- Q1(b) field check in pcf
const r1b = () => {
  const f = fieldTest({ gb: 121, w: 0.125 })
  return { f, c: checkSpec(f.gd, f.w, { mdd: 118, omc: 0.14, rcMin: 0.9 }) }
}

// ---------------------------------------------------------------- Q1(c) sheet pile (net drawn by the student); icr from assumed Gs = 2.65, e = 0.65
const Gs1 = 2.65,
  e1 = 0.65
const gsat1 = ((Gs1 + e1) * GW) / (1 + e1)
const net1 = () => netOf('2021', { gsat: gsat1 })
const k1 = 5e-6

// ---------------------------------------------------------------- Q2(a) three layers in a pipe, flow downward
const LAY2 = [
  { H: 5, k: 3e-4 },
  { H: 5, k: 4e-4 },
  { H: 5, k: 6e-4 },
]
const r2a = () => {
  const L = layered(LAY2)
  const A = (Math.PI / 4) * 6 * 6
  const h = 30
  const i = h / L.H
  const q = L.kv * i * A
  return { L, A, h, i, q, Q: q * 300 }
}

// ---------------------------------------------------------------- Q3(a) OC clay crossing pc′ under a 4 m fill
const LL3 = 50
const Cc3 = 0.009 * (LL3 - 10)
const Cs3 = Cc3 / 6
const SET3: SettleIn = {
  layers: [
    { kind: 'sand', H: 3, gamma: 16, gammaSat: 18.5 },
    { kind: 'sand', H: 3, gamma: 18.5, gammaSat: 18.5 },
    { kind: 'clay', H: 6, gamma: 19, gammaSat: 19, e0: 0.95, Cc: Cc3, Cs: Cs3, pc: 150 },
  ],
  wt: 3,
  load: { kind: 'fill', q: 4 * 18 },
}
const st3 = (div = 6) => settleProfile(div === 6 ? SET3 : { ...SET3, layers: SET3.layers.map((l) => (l.kind === 'clay' ? { ...l, Cs: Cc3 / div } : l)) })

// ---------------------------------------------------------------- Q4(d) rectangle with P outside (Fadum)
const REL4 = [{ x1: 1, y1: -1, x2: 4, y2: 1 }]

export const B2020: SmQ[] = [
  {
    id: 'sm-2020-21-1a',
    paper: P,
    sec: 'A',
    no: '1(a)',
    marks: 12,
    topics: ['sm-wv'],
    title: 'Show γsat = γw(Gs + e)/(1 + e) from the phase diagram',
    text: 'Using phase diagram, show that for a saturated soil, $\\gamma_b = \\gamma_w\\dfrac{G_s + e}{1 + e}$. The symbols carry their usual meanings.',
    pages: [53],
    theory: true,
    solution: () => <Model item={th('sm-wv', 't-gsat')} />,
  },
  {
    id: 'sm-2020-21-1b',
    paper: P,
    sec: 'A',
    no: '1(b)',
    marks: 10,
    topics: ['sm-comp'],
    title: 'Field check: 121 pcf at 12.5 % against 90 % of 118 pcf',
    text: 'From field density test on a compacted clay layer, the bulk unit weight was found as 121 lb/ft³ and the moisture content was 12.5%. The specified relative compaction is 90% or more. Standard Proctor Compaction was performed on the same soil and it produced a maximum dry unit weight of 118 lb/ft³ and optimum moisture content of 14%. Is the field compaction acceptable as per the specifications?',
    pages: [53],
    given: [],
    checks: () => {
      const { f, c } = r1b()
      return [
        { key: 'gd', label: 'Field dry unit weight', value: f.gd, unit: 'lb/ft³' },
        { key: 'rc', label: 'Relative compaction', value: c.rc * 100, unit: '%' },
      ]
    },
    solution: () => {
      const { f, c } = r1b()
      return (
        <Sol>
          <Md>{`Work in lb/ft³ (the paper's units).`}</Md>
          <Tex block>{`\\gamma_d = \\frac{\\gamma_b}{1 + w} = \\frac{121}{1.125} = ${f2(f.gd)}\\ \\text{lb/ft}^3,\\qquad RC = \\frac{\\gamma_d}{\\gamma_{d,max}} = \\frac{${f2(f.gd)}}{118} = ${f2(c.rc * 100)}\\ \\%`}</Tex>
          <Result>{`RC = **${f2(c.rc * 100)} % ≥ 90 %**: the field compaction is **acceptable**. (Required γd = 0.90 × 118 = ${f2(c.gdReq)} pcf.) The fill is placed 1.5 % dry of OMC; if the specification also limited w to OMC ± 2 % it would still pass.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2020-21-1c',
    paper: P,
    sec: 'A',
    no: '1(c)',
    marks: 18,
    topics: ['sm-seep'],
    title: 'Sheet pile 4 m into 8 m stratum: draw the net, q per day, exit gradient, piping',
    text: 'A sheet pile wall penetrates 4 m into a permeable soil stratum with coefficient of permeability of 5 × 10⁻⁶ m/s (Fig. 1). The permeable stratum extends upto 8 m from the ground level and is underlain by an impermeable stratum. The water level on the upstream and downstream side are 6 m and 1 m above the ground level. Draw a flow net and find the seepage flow per meter length of sheet pile wall per day. Also, determine the exit gradient and check stability against failure by piping.',
    pages: [53, 60],
    given: [],
    figure: () => <NetFig c={net1()} net={false} />,
    checks: () => {
      const c = net1()
      return [
        { key: 'r', label: '$N_f/N_d$ of your net', value: c.sol.shape, tol: 0.08 },
        { key: 'q', label: 'Seepage per metre of wall', value: k1 * c.sol.H * c.sol.shape * 86400, unit: 'm³/day', tol: 0.08 },
        { key: 'ie', label: 'Exit gradient (last field beside the pile)', value: c.R.ie, tol: 0.12 },
        { key: 'fs', label: 'FS against piping ($i_{cr}$ = 1.0 assumed)', value: c.R.icr / c.R.ie, tol: 0.12 },
      ]
    },
    solution: () => {
      const c = net1()
      const q = k1 * c.sol.H * c.sol.shape
      const hv = c.R.heave!
      const ex = netPoint(c, 0.05, c.sol.g.zD - 0.05)
      return (
        <Sol>
          <Md>{`**Net.** The pile and the impermeable base are the first and last flow lines; the upstream and downstream ground surfaces are equipotentials. $H = 6 - 1 = ${f2(c.sol.H)}$ m. With $N_f = ${c.st.Nf}$ channels the squares need $N_d = ${f2(c.R.Nd)}$ drops ($N_f/N_d = ${f3(c.sol.shape)}$; a pile reaching half way through the layer gives a symmetric net, so Nd = 2Nf).`}</Md>
          <NetFig c={c} exit prism />
          <Tex block>{`q = kH\\frac{N_f}{N_d} = 5\\times10^{-6} \\times ${f2(c.sol.H)} \\times ${f3(c.sol.shape)} = ${sciTex(q, 3)}\\ \\text{m}^3\\text{/s} = ${f3(q * 86400)}\\ \\text{m}^3\\text{/day per m}`}</Tex>
          <Head>Exit gradient and piping</Head>
          <Md>{`$\\Delta h = H/N_d = ${f3(c.R.dh)}$ m. The last field along the downstream face of the pile is $l = ${f2(c.R.exitL)}$ m long, so $i_e = ${f3(c.R.dh)}/${f2(c.R.exitL)} = ${f3(c.R.ie)}$. (The upward gradient right at the pile foot is about ${f3(ex.i)}.)`}</Md>
          <Md>{`No unit weight is given: assume a medium sand, $G_s = 2.65$, $e = 0.65$ → $i_{cr} = (G_s - 1)/(1 + e) = 1.65/1.65 = ${f3(c.R.icr)}$ (γsat = ${f2(gsat1)} kN/m³).`}</Md>
          <Tex block>{`FS_{piping} = \\frac{i_{cr}}{i_e} = \\frac{${f3(c.R.icr)}}{${f3(c.R.ie)}} = ${f2(c.R.icr / c.R.ie)}`}</Tex>
          <Md>{`Terzaghi's heave check on the 4 m × 2 m prism: $h_a = ${f3(hv.ha)}$ m, $FS = D\\gamma'/(h_a\\gamma_w) = 4 \\times ${f2(c.R.gsub)}/(${f3(hv.ha)} \\times 9.81) = ${f2(hv.FS)}$.`}</Md>
          <Result>{`q ≈ **${f2(q * 86400)} m³/day per m**; exit gradient ≈ **${f2(c.R.ie)}**; FS against piping ≈ **${f2(c.R.icr / c.R.ie)}** (heave ${f2(hv.FS)}). No boiling (FS > 1), but the margin is below the 3–4 normally required: drive the pile deeper or add a filter / weighting blanket downstream.`}</Result>
        </Sol>
      )
    },
    notes: ['Gs = 2.65 and e = 0.65 (icr = 1.0) are assumed, as in the handnote (FS ≈ 2.7).', 'Fig. 1 is on p. 60 (handwritten "for Ques. 1(c)"); it shows the geometry only, the net is drawn by the student.'],
  },
  {
    id: 'sm-2020-21-1d',
    paper: P,
    sec: 'A',
    no: '1(d)',
    marks: 6.67,
    topics: ['sm-comp'],
    title: 'Compaction curves for different soil types (qualitative)',
    text: 'Draw qualitative diagrams showing the variation of laboratory compaction curves for different soil types.',
    pages: [53],
    theory: true,
    solution: () => <Model item={th('sm-comp', 't-soiltypes')} />,
  },
  {
    id: 'sm-2020-21-2a',
    paper: P,
    sec: 'A',
    no: '2(a)',
    marks: 15,
    topics: ['sm-perm'],
    title: 'Three sand layers in a 30 cm pipe: k(eq) and volume in 5 minutes',
    text: 'A cylindrical pipe, 30 cm long and 6 cm in internal diameter, is fitted with a screen at the bottom and is open at the top. The pipe is filled with three distinct layers of sand each of thickness 5 cm. The coefficient of permeability of the top, intermediate and bottom layers are 3 × 10⁻⁴ cm/s, 4 × 10⁻⁴ cm/s and 6 × 10⁻⁴ cm/s, respectively. The cylinder is filled with water up to its top and the water level is maintained at that position by external supply of water. Determine the equivalent coefficient of permeability of the sand assembly and the volume of water that will flow through the sand layers in 5 minutes.',
    pages: [53],
    given: [],
    figure: () => (
      <div className="max-w-[460px] mx-auto">
        <LayersFig ls={LAY2} dir="v" />
      </div>
    ),
    checks: () => {
      const r = r2a()
      return [
        { key: 'k', label: 'Equivalent k (flow across the layers)', value: r.L.kv * 1e4, unit: '× 10⁻⁴ cm/s' },
        { key: 'i', label: 'Hydraulic gradient', value: r.i },
        { key: 'Q', label: 'Volume in 5 minutes', value: r.Q, unit: 'cm³' },
      ]
    },
    solution: () => {
      const r = r2a()
      return (
        <Sol>
          <Md>{`Water flows **down through** the layers (perpendicular to the bedding), so the same velocity passes every layer:`}</Md>
          <Tex block>{`k_{eq} = \\frac{H}{\\sum H_i/k_i} = \\frac{15}{5/(3\\times10^{-4}) + 5/(4\\times10^{-4}) + 5/(6\\times10^{-4})} = ${sciTex(r.L.kv, 3)}\\ \\text{cm/s}`}</Tex>
          <Md>{`**Head.** The sand (15 cm) sits on the screen at the bottom and water stands at the top of the 30 cm pipe; outflow is free at the screen. Datum at the screen: total head 30 cm at the water surface, 0 at the outlet, so the head lost through the sand is $h = 30$ cm and $i = 30/15 = ${f2(r.i)}$.`}</Md>
          <Tex block>{`A = \\frac{\\pi}{4}(6)^2 = ${f2(r.A)}\\ \\text{cm}^2,\\quad q = k_{eq}iA = ${sciTex(r.L.kv, 2)} \\times ${f2(r.i)} \\times ${f2(r.A)} = ${f4(r.q)}\\ \\text{cm}^3\\text{/s}`}</Tex>
          <Tex block>{`Q = qt = ${f4(r.q)} \\times 300 = ${f2(r.Q)}\\ \\text{cm}^3`}</Tex>
          <Tbl head={['Layer', 'k (cm/s)', 'head lost (cm)']} rows={LAY2.map((l, i) => [['top', 'middle', 'bottom'][i], `${f2(l.k * 1e4)} × 10⁻⁴`, f2(r.L.hShare[i] * r.h)])} cap="The least permeable (top) layer uses the most head." />
          <Result>{`$k_{eq}$ = **${f2(r.L.kv * 1e4)} × 10⁻⁴ cm/s**; volume in 5 minutes ≈ **${f2(r.Q)} cm³**.`}</Result>
        </Sol>
      )
    },
    notes: ['The sand is taken to sit at the bottom of the pipe on the screen with free outflow (head loss 30 cm over 15 cm of sand), as in the handnote (6.79 cm³).'],
  },
  {
    id: 'sm-2020-21-2b',
    paper: P,
    sec: 'A',
    no: '2(b)',
    marks: 15,
    topics: ['sm-seep'],
    title: 'σ, u, σ′ diagrams to 10 m: 3 m clay over sand, WT at 2 m',
    text: 'A soil in a location consists of clay upto a depth of 3 m from the ground level underlain by a sand layer. The water table is at 2 m below the ground level. The unit weight of the clay layer above and below water table are respectively, 15 kN/m³ and 18 kN/m³. The unit weight of the sand layer is 20 kN/m³. Draw a schematic diagram of the soil profile. Also, draw the total and effective vertical stress diagram, showing the controlling ordinates, upto a depth of 10 m below the ground surface.',
    pages: [53],
    given: [],
    checks: () => {
      const pts = profile(toProfileIn(PROF_DEFAULT))
      const at = (z: number) => pts.find((p) => Math.abs(p.z - z) < 1e-9)!
      return [
        { key: 's2', label: 'σ at 2 m (WT)', value: at(2).sigma, unit: 'kPa' },
        { key: 's3', label: 'σ at 3 m', value: at(3).sigma, unit: 'kPa' },
        { key: 'e3', label: 'σ′ at 3 m', value: at(3).eff, unit: 'kPa' },
        { key: 's10', label: 'σ at 10 m', value: at(10).sigma, unit: 'kPa' },
        { key: 'u10', label: 'u at 10 m', value: at(10).u, unit: 'kPa' },
        { key: 'e10', label: 'σ′ at 10 m', value: at(10).eff, unit: 'kPa' },
      ]
    },
    solution: () => {
      const pts = profile(toProfileIn(PROF_DEFAULT))
      return (
        <Sol>
          <Md>{`Profile: clay 0–3 m (15 kN/m³ above the WT at 2 m, 18 kN/m³ below), sand 3–10 m (20 kN/m³, saturated). Controlling depths: 0, 2 (WT), 3 (layer change) and 10 m.`}</Md>
          <ProfileSolution s={PROF_DEFAULT} />
          <Frm wide={600}>
            <ProfileFigure s={PROF_DEFAULT} pts={pts} />
          </Frm>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2020-21-2c',
    paper: P,
    sec: 'A',
    no: '2(c)',
    marks: 16.67,
    topics: ['sm-consol'],
    title: 'Sample disturbance and Cc; field e–log p curve for NC clay',
    text: 'Explain the effect of sample disturbance on the compression index obtained from laboratory one-dimensional consolidation test. Also, state the process of establishing field e ~ log(p) curve from the laboratory results for NC clay of low to medium plasticity.',
    pages: [54],
    theory: true,
    solution: () => <Model item={th('sm-consol', 't-disturb')} />,
    notes: ['Printed marks 6⅔ + 10.'],
  },
  {
    id: 'sm-2020-21-3a',
    paper: P,
    sec: 'A',
    no: '3(a)',
    marks: 18,
    topics: ['sm-consol'],
    title: 'OC clay (pc′ = 150 kPa) under a 4 m fill: settlement',
    text: 'A soil profile is shown in Fig. 1(a). If 4 m fill of density 18 kN/m³ is placed on the ground surface, determine the total consolidation settlement of the clay layer.\n\n(Fig. 1(a), from the top: 3 m sand, γ = 16 kN/m³, water table at its base; 3 m sand, $\\gamma_{sat}$ = 18.5 kN/m³; 6 m OC clay, $\\gamma_{sat}$ = 19 kN/m³, $p\'_c$ = 150 kN/m², e = 0.95, LL = 50; sand below.)',
    pages: [54],
    given: [],
    figure: () => (
      <SoilColumn
        layers={[
          { H: 3, name: 'Sand', kind: 'sand', props: ['γ = 16 kN/m³'] },
          { H: 3, name: 'Sand', kind: 'sand', props: ['γsat = 18.5 kN/m³'] },
          { H: 6, name: 'OC clay', kind: 'clay', props: ["γsat = 19 kN/m³, p′c = 150 kN/m²", 'e = 0.95, LL = 50'] },
          { H: 1, name: 'Sand', kind: 'sand' },
        ]}
        wt={3}
      />
    ),
    checks: () => {
      const s = st3().layers[0].subs[0]
      return [
        { key: 'p0', label: "$p'_0$ at mid-clay (9 m)", value: s.p0, unit: 'kPa' },
        { key: 'cc', label: '$C_c = 0.009(LL - 10)$', value: Cc3 },
        { key: 'p1', label: "$p'_0 + \\Delta p$", value: s.p1, unit: 'kPa' },
        { key: 'S', label: 'Settlement ($C_s = C_c/6$ assumed)', value: s.S * 1000, unit: 'mm', tol: 0.05 },
      ]
    },
    solution: () => {
      const out = st3()
      const s = out.layers[0].subs[0]
      const s10 = st3(10)
      return (
        <Sol>
          <Md>{`$C_c = 0.009(50 - 10) = ${f3(Cc3)}$ (Skempton). $C_s$ is not given: take $C_s \\approx C_c/6 = ${f3(Cs3)}$ (range Cc/5–Cc/10). Fill: $\\Delta p = 4 \\times 18 = 72$ kPa at every depth (wide fill).`}</Md>
          <SettleSolution inp={SET3} out={out} />
          <Md>{`Since $p'_0 = ${f2(s.p0)} < p'_c = 150 < p'_0 + \\Delta p = ${f2(s.p1)}$ kPa the clay recompresses along $C_s$ up to $p'_c$ and then follows the virgin line ($C_c$) — the two-term formula above.`}</Md>
          <Frm wide={560}>
            <ProfileFig inp={SET3} out={out} />
          </Frm>
          <Result>{`Total consolidation settlement ≈ **${f2(out.S * 1000)} mm** (≈ ${f2(out.S)} m) with Cs = Cc/6; ${f2(s10.S * 1000)} mm with Cs = Cc/10.`}</Result>
        </Sol>
      )
    },
    notes: ['Cs is not given; Cs = Cc/6 is assumed (the handnote, ≈ 0.10 m). "density 18 kN/m³" is a unit weight.', 'e = 0.95 is taken as e0 of the clay.'],
  },
  {
    id: 'sm-2020-21-3b',
    paper: P,
    sec: 'A',
    no: '3(b)',
    marks: 12.67,
    topics: ['sm-consol'],
    title: 'Time for layer B (5 m, cv × 1.5) given layer A (4 m) took 130 days',
    text: 'Two clay layers A and B are, respectively, 4 m and 5 m thick. Both layers have permeable boundaries at top and bottom. The time taken for the clay layer A to reach 90% consolidation is 130 days. Calculate the time that will be required for clay layer B to reach the same degree of consolidation, if the coefficient of consolidation of layer B is 1.5 times that of layer A.',
    pages: [54],
    given: [],
    checks: () => [{ key: 't', label: 'Time for layer B to reach 90 %', value: scaleTime(130, 2, 2.5, 1, 1.5), unit: 'days' }],
    solution: () => {
      const t = scaleTime(130, 2, 2.5, 1, 1.5)
      return (
        <Sol>
          <Md>{`Same U → same $T_v = c_vt/d^2$. Double drainage: $d_A = 4/2 = 2$ m, $d_B = 5/2 = 2.5$ m.`}</Md>
          <Tex block>{`\\frac{c_{vA}t_A}{d_A^2} = \\frac{c_{vB}t_B}{d_B^2} \\Rightarrow t_B = t_A\\left(\\frac{d_B}{d_A}\\right)^2\\frac{c_{vA}}{c_{vB}} = 130 \\times \\left(\\frac{2.5}{2}\\right)^2 \\times \\frac{1}{1.5} = ${f2(t)}\\ \\text{days}`}</Tex>
          <Result>{`Layer B reaches 90 % in about **${f2(t)} days**.`}</Result>
        </Sol>
      )
    },
  },
  {
    id: 'sm-2020-21-3c',
    paper: P,
    sec: 'A',
    no: '3(c)',
    marks: 10,
    topics: ['sm-seep'],
    title: 'Basic properties of a flow net',
    text: 'State the basic properties of flow net.',
    pages: [54],
    theory: true,
    solution: () => <Model item={th('sm-seep', 't-flownet-props')} />,
  },
  {
    id: 'sm-2020-21-3d',
    paper: P,
    sec: 'A',
    no: '3(d)',
    marks: 6.67,
    topics: ['sm-stress'],
    title: 'Contact pressure and settlement below flexible foundations on sand and clay',
    text: 'Discuss the distribution of contact pressure and settlement below flexible foundations on sand and clay.',
    pages: [54],
    theory: true,
    solution: () => <ContactAnswer />,
    notes: ["Q3's printed marks add to 47⅓ (18 + 12⅔ + 10 + 6⅔)."],
  },
  {
    id: 'sm-2020-21-4a',
    paper: P,
    sec: 'A',
    no: '4(a)',
    marks: 14.67,
    topics: ['sm-comp'],
    title: 'Using lab compaction results in the field; rollers and soils',
    text: 'How laboratory compaction results are utilized for specifying and controlling field compaction? Mention various type of rollers along with their suitability for compacting different soil types.',
    pages: [54],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: 'Specifying and controlling field compaction (6⅔)', item: th('sm-comp', 't-control') },
          { title: 'Rollers and the soils they suit (8)', item: th('sm-comp', 't-rollers') },
        ]}
      />
    ),
    notes: ['Printed marks 6⅔ + 8.'],
  },
  {
    id: 'sm-2020-21-4b',
    paper: P,
    sec: 'A',
    no: '4(b)',
    marks: 10,
    topics: ['sm-consol'],
    title: 'Short notes: average degree of consolidation; secondary consolidation',
    text: 'Write short notes on (i) Average degree of consolidation (ii) Secondary consolidation.',
    pages: [54],
    theory: true,
    solution: () => (
      <Models
        parts={[
          { title: '(i) Average degree of consolidation', item: th('sm-consol', 't-avgU') },
          { title: '(ii) Secondary consolidation', item: th('sm-consol', 't-secondary') },
        ]}
      />
    ),
  },
  {
    id: 'sm-2020-21-4c',
    paper: P,
    sec: 'A',
    no: '4(c)',
    marks: 8,
    topics: ['sm-stress'],
    title: 'Stress increase with depth below circular, square and strip footings',
    text: 'Compare the vertical stress increase with depth below circular, square and strip footing.',
    pages: [54],
    theory: true,
    solution: () => <BulbAnswer />,
  },
  {
    id: 'sm-2020-21-4d',
    paper: P,
    sec: 'A',
    no: '4(d)',
    marks: 14,
    topics: ['sm-stress'],
    title: "Fadum's chart: 2 m × 3 m area (150 kPa), point 1 m outside, z = 2 m",
    text: "A rectangular area 2 m by 3 m (Fig. 2) is subjected to a uniformly distributed load of 150 kPa. Determine the increase in stress at a depth of 2 m below point P as shown in the figure. Use Fadum's chart for Newmark's influence coefficient (Fig. 3).\n\n(Fig. 2: rectangle ABCD, AB = 3 m, BC = 2 m (1 m + 1 m about its centre line); P lies on the extended centre line, 1 m outside side AD.)",
    pages: [54, 55],
    given: [{ label: "Fadum's chart", what: 'Fig. 3, I(m, n) for a corner', ref: 'd-fadum' }],
    figure: () => (
      <div className="max-w-[400px] mx-auto">
        <PlanFig
          rects={REL4}
          P={[0, 0]}
          hatch={[{ x1: 0, y1: -1, x2: 1, y2: 1 }]}
          dims={[
            { a: [1, 1], b: [4, 1], text: 'AB = 3 m' },
            { a: [4, -1], b: [4, 0], text: '1 m', off: 14 },
            { a: [4, 0], b: [4, 1], text: '1 m', off: 14 },
            { a: [0, -1], b: [1, -1], text: '1 m', off: 14 },
          ]}
        />
      </div>
    ),
    checks: () => {
      const I = Irect(2, 0.5) - Irect(0.5, 0.5)
      return [
        { key: 'I1', label: 'I for the 4 m × 1 m rectangle (P to BC)', value: Irect(2, 0.5), tol: 0.02 },
        { key: 'I2', label: 'I for the 1 m × 1 m rectangle (P to AD)', value: Irect(0.5, 0.5), tol: 0.02 },
        { key: 's', label: 'σz 2 m below P', value: 2 * 150 * I, unit: 'kPa', tol: 0.04 },
      ]
    },
    solution: () => (
      <Sol>
        <Md>{`P is outside the area, level with its centre line. Each half (above and below the centre line) = rectangle from P to side BC (4 m × 1 m, loaded) **minus** rectangle from P to side AD (1 m × 1 m, fictitious). Both have a corner at P; z = 2 m.`}</Md>
        <CornerTable rel={REL4} z={2} q={150} />
        <Tex block>{`\\sigma_z = 2q[I(2, 0.5) - I(0.5, 0.5)] = 2 \\times 150 \\times (${f4(Irect(2, 0.5))} - ${f4(Irect(0.5, 0.5))}) = ${f2(2 * 150 * (Irect(2, 0.5) - Irect(0.5, 0.5)))}\\ \\text{kPa}`}</Tex>
        <Frm>
          <div className="max-w-[420px] mx-auto">
            <FadumChart pts={[[2, 0.5], [0.5, 0.5]]} />
          </div>
        </Frm>
        <Result>{`Stress increase 2 m below P ≈ **${f2(2 * 150 * (Irect(2, 0.5) - Irect(0.5, 0.5)))} kPa**.`}</Result>
      </Sol>
    ),
  },
]
