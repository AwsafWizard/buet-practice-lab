// ev-coag — colloids, double layer, destabilisation mechanisms, dose vs colloid concentration, G and CAMP number (Tanvir sir T06).
// Numbers (alkalinity consumed, G, Gt) live in engine/coag.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-coag' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

// ---------- figures ----------
/** double layer around a negative colloid and the potential-vs-distance curve with the zeta potential */
const DoubleLayerFig: FC = () => {
  const ions: [number, number, string][] = []
  // counter-ions (+) denser near the surface, co-ions (-) sparse
  const pos = [
    [118, 70], [125, 110], [120, 150], [132, 90], [138, 130], [150, 60], [158, 160], [172, 100], [190, 75], [205, 140], [225, 110], [245, 80], [262, 150],
  ]
  pos.forEach(([x, y]) => ions.push([x, y, '+']))
  ;[[200, 112], [255, 120], [235, 60], [280, 100]].forEach(([x, y]) => ions.push([x, y, '−']))
  return (
    <svg viewBox="0 0 640 300" width="100%" role="img" aria-label="Electrical double layer and zeta potential">
      <circle cx={70} cy={110} r={52} fill={panel2} stroke={ink} strokeWidth={2} />
      <Tx x={70} y={106} t="colloid" b />
      <Tx x={70} y={124} t="(−) surface" />
      {[-36, -18, 0, 18, 36].map((d) => (
        <text key={d} x={30} y={110 + d} fontSize={13} fill={bad}>
          −
        </text>
      ))}
      <path d="M122,110 m0,-62 a62,62 0 0 1 0,124" fill="none" stroke={mute} strokeDasharray="4 3" />
      <path d="M170,110 m0,-110 a110,110 0 0 1 0,220" fill="none" stroke={mute} strokeDasharray="2 4" />
      {ions.map(([x, y, s], i) => (
        <text key={i} x={x} y={y} fontSize={13} fill={s === '+' ? good : bad} fontWeight={700}>
          {s}
        </text>
      ))}
      <Tx x={130} y={20} t="Stern (fixed) layer" c={mute} />
      <Tx x={235} y={34} t="diffuse layer" c={mute} />
      <Tx x={150} y={252} t="double layer = Stern layer + diffuse layer" b />
      <Tx x={150} y={272} t="net charge is strongest at the Stern layer and decays with distance" c={mute} />
      {/* potential plot */}
      <line x1={340} x2={340} y1={40} y2={210} stroke={ink} />
      <line x1={340} x2={610} y1={210} y2={210} stroke={ink} />
      <polyline points={Array.from({ length: 40 }, (_, i) => `${360 + i * 6},${210 - 140 * Math.exp(-i / 9)}`).join(' ')} fill="none" stroke={accent} strokeWidth={2.6} />
      <Tx x={346} y={52} t="electrostatic potential ψ" a="start" c={mute} />
      <Tx x={470} y={236} t="distance from the particle surface →" />
      <Tx x={366} y={68} t="ψ₀ Nernst potential" a="start" b />
      <line x1={394} x2={394} y1={72} y2={210} stroke={mute} strokeDasharray="4 3" />
      <Tx x={398} y={226} t="Stern plane" a="start" s={10.5} c={mute} />
      <line x1={424} x2={424} y1={100} y2={210} stroke={bad} strokeDasharray="4 3" />
      <circle cx={424} cy={210 - 140 * Math.exp(-11 / 9)} r={4} fill={bad} />
      <Tx x={430} y={134} t="ζ zeta potential" a="start" b c={bad} />
      <Tx x={430} y={148} t="(at the shear plane)" a="start" s={10.5} c={mute} />
    </svg>
  )
}

/** the four destabilisation mechanisms */
const MechanismsFig: FC = () => {
  const P = ({ cx, cy }: { cx: number; cy: number }) => (
    <g>
      <circle cx={cx} cy={cy} r={18} fill={panel2} stroke={ink} strokeWidth={1.6} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fill={bad}>
        −
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Four mechanisms of destabilising colloids">
      {/* 1 DLC */}
      <Tx x={80} y={16} t="1. Double-layer compression" b />
      <P cx={55} cy={70} />
      <P cx={105} cy={70} />
      <circle cx={55} cy={70} r={26} fill="none" stroke={mute} strokeDasharray="3 3" />
      <circle cx={105} cy={70} r={26} fill="none" stroke={mute} strokeDasharray="3 3" />
      <Tx x={80} y={116} t="add electrolyte (Na⁺, Ca²⁺, Al³⁺)" s={11} />
      <Tx x={80} y={132} t="thin layers → van der Waals wins" s={11} c={mute} />
      {/* 2 adsorption/neutralisation */}
      <Tx x={240} y={16} t="2. Adsorption & charge neutralisation" b />
      <P cx={215} cy={70} />
      <P cx={265} cy={70} />
      {[190, 200, 230, 240, 250, 280].map((x, i) => (
        <text key={x} x={x} y={52 + (i % 2) * 36} fontSize={12} fill={good} fontWeight={700}>
          +
        </text>
      ))}
      <Tx x={240} y={116} t="adsorbed Al³⁺ / hydrolysed species" s={11} />
      <Tx x={240} y={132} t="neutralise charge; overdose reverses it" s={11} c={mute} />
      {/* 3 sweep */}
      <Tx x={500} y={16} t="3. Enmeshment (sweep floc)" b />
      <ellipse cx={500} cy={72} rx={72} ry={40} fill={water} opacity={0.3} stroke={mute} />
      <P cx={470} cy={70} />
      <P cx={520} cy={62} />
      <P cx={505} cy={90} />
      <Tx x={500} y={126} t="Al(OH)₃ / Fe(OH)₃ precipitate sweeps colloids" s={11} />
      <Tx x={500} y={142} t="high dose; dose falls as colloids increase" s={11} c={mute} />
      {/* 4 bridging */}
      <Tx x={160} y={176} t="4. Adsorption & interparticle bridging" b />
      <P cx={90} cy={236} />
      <P cx={230} cy={236} />
      <path d="M108,236 q20,-30 40,0 t40,0 t4,0" fill="none" stroke={accent} strokeWidth={2.2} />
      <Tx x={160} y={282} t="long-chain polymer adsorbs on two particles and links them" s={11} />
      <Tx x={160} y={298} t="excess polymer coats each particle → restabilised" s={11} c={mute} />
      {/* summary */}
      <rect x={340} y={190} width={290} height={118} rx={6} fill="none" stroke={line} />
      <Tx x={352} y={210} t="Which one when?" a="start" b />
      <Tx x={352} y={230} t="DLC: very high ionic strength, not for potable water" a="start" s={11} />
      <Tx x={352} y={248} t="Neutralisation: low dose, stoichiometric with colloids" a="start" s={11} />
      <Tx x={352} y={266} t="Sweep floc: usual alum / FeCl₃ practice, pH 6–8" a="start" s={11} />
      <Tx x={352} y={284} t="Bridging: polymers (polyacrylamide, starch)" a="start" s={11} />
    </svg>
  )
}

/** coagulant dose vs colloid concentration with the four zones */
const DoseFig: FC = () => (
  <svg viewBox="0 0 640 310" width="100%" role="img" aria-label="Coagulant dose against colloid concentration: four zones">
    <defs>
      <marker id="ev-co-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    <line x1={60} x2={60} y1={20} y2={260} stroke={ink} markerStart="url(#ev-co-a)" />
    <line x1={60} x2={560} y1={260} y2={260} stroke={ink} markerEnd="url(#ev-co-a)" />
    <text x={22} y={140} fontSize={11.5} fill={ink} textAnchor="middle" transform="rotate(-90 22 140)">
      coagulant dose C
    </text>
    <Tx x={310} y={284} t="colloid concentration S →  (S₁ < S₂ < S₃ < S₄)" />
    {/* zone 4 sweep */}
    <polygon points="60,30 560,30 560,140 60,70" fill={good} opacity={0.22} />
    {/* zone 3 restab */}
    <polygon points="60,70 560,140 560,130 60,215" fill={bad} opacity={0.18} />
    {/* zone 2 coagulation */}
    <polygon points="60,215 560,130 560,175 60,246" fill={accent} opacity={0.3} />
    <Tx x={150} y={58} t="Zone 4: sweep-floc coagulation" a="start" b />
    <Tx x={150} y={74} t="(high dose; C and S inversely related)" a="start" s={10.5} c={mute} />
    <Tx x={110} y={146} t="Zone 3: restabilisation (charge reversal by overdose)" a="start" b c={bad} />
    <Tx x={290} y={222} t="Zone 2: adsorption & charge neutralisation" a="start" b />
    <Tx x={290} y={238} t="(dose proportional to S: stoichiometric)" a="start" s={10.5} c={mute} />
    <Tx x={100} y={254} t="Zone 1: no coagulation (dose too small)" a="start" b c={mute} s={11} />
    {/* bentonite arrow */}
    <path d="M110,226 H210" stroke={ink} strokeWidth={1.6} markerEnd="url(#ev-co-a)" strokeDasharray="5 3" />
    <Tx x={160} y={212} t="add clay (bentonite)" s={10.5} />
    {['S₁', 'S₂', 'S₃', 'S₄'].map((s, i) => (
      <g key={s}>
        <line x1={110 + i * 130} x2={110 + i * 130} y1={256} y2={264} stroke={ink} />
        <Tx x={110 + i * 130} y={276} t={s} s={11} />
      </g>
    ))}
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-coag-stability',
    topic: T,
    title: 'Reasons for stability of colloidal particles',
    points: [
      { k: 'Large surface to volume ratio', alt: ['large surface area', 'extremely small size'] },
      { k: 'Surface phenomena (accumulated charge) predominate', alt: ['surface charge', 'accumulation of charges'], d: 'charge from crystal arrangement, loss of atoms by abrasion, isomorphic replacement (Al for Si)' },
      { k: 'Most natural colloids are negatively charged', alt: ['negative charge'], d: 'so they repel one another' },
    ],
    seen: [],
    src: 'TA T06 p4',
  },
  {
    id: 'l-coag-forces',
    topic: T,
    title: 'Forces acting on colloidal particles in water',
    ask: 'What are the two forces that act on colloidal particles in an aqueous system?',
    points: [
      { k: 'Electrostatic repulsion', alt: ['repulsive force', 'double-layer repulsion', 'electrical repulsion'], d: 'like charges, from the double layer: keeps particles apart' },
      { k: 'Van der Waals attraction', alt: ['attractive force', 'van der Waals forces', 'London forces'], d: 'short-range, pulls particles together' },
    ],
    seen: ['2009-10'],
    src: 'TA T06 p7 (DLVO)',
  },
  {
    id: 'l-coag-mech',
    topic: T,
    title: 'Mechanisms of destabilisation of colloids',
    ask: 'Describe the mechanisms of destabilising colloidal particles.',
    points: [
      { k: 'Double-layer compression', alt: ['reduction of surface potential by double layer compression', 'ionic layer compression'], d: 'electrolyte compresses the diffuse layer' },
      { k: 'Adsorption and charge neutralization', alt: ['charge neutralisation', 'adsorption and neutralization'], d: 'oppositely charged species adsorb on the particle' },
      { k: 'Enmeshment in a precipitate', alt: ['sweep floc', 'sweep coagulation', 'sweep floc coagulation'], d: 'metal hydroxide precipitate traps the colloids' },
      { k: 'Adsorption and interparticle bridging', alt: ['bridging', 'polymer bridging'], d: 'long-chain polymers link particles' },
    ],
    hook: 'Squeeze, Neutralise, Sweep, Bridge.',
    seen: ['2007-08', '2008-09', '2009-10', '2015-16', '2020-21', '2021-22', '2022-23', '2023-24'],
    src: 'TA T06 p6–11',
    note: 'The slide lists "adsorption and charge neutralization" twice; the fourth item is adsorption and interparticle bridging (heading on p10–11).',
  },
  {
    id: 'l-coag-an-vs-dlc',
    topic: T,
    title: 'Adsorption–neutralisation differs from double-layer compression in',
    points: [
      { k: 'Stoichiometric relationship with colloid concentration', alt: ['stoichiometric', 'dose proportional to colloid concentration'] },
      { k: 'Charge reversal possible with overdose', alt: ['restabilization', 'charge reversal'] },
      { k: 'Sorbable species work at lower dosages', alt: ['lower dosage', 'low dose'] },
    ],
    seen: ['2007-08', '2008-09', '2020-21'],
    src: 'TA T06 p9',
  },
  {
    id: 'l-coag-zones',
    topic: T,
    title: 'Zones of coagulant dose vs colloid concentration',
    ask: 'Describe the effect of coagulant dosage with colloid concentration.',
    points: [
      { k: 'Zone 1: no coagulation', alt: ['no coagulation', 'dose too low'] },
      { k: 'Zone 2: adsorption and charge neutralisation', alt: ['coagulation zone', 'adsorption coagulation', 'charge neutralization'] },
      { k: 'Zone 3: restabilisation', alt: ['restabilization', 'charge reversal'], d: 'overdose reverses the charge' },
      { k: 'Zone 4: sweep-floc coagulation', alt: ['sweep floc', 'sweep coagulation'], d: 'high dose; dose falls as colloids rise' },
    ],
    seen: ['Jan 2021', '2021-22'],
    src: 'TA T06 p13',
  },
  {
    id: 'l-coag-factors',
    topic: T,
    title: 'Factors affecting coagulation',
    ask: 'What are the factors affecting the coagulation process?',
    points: [
      { k: 'Colloid concentration (turbidity)', alt: ['turbidity', 'concentration of colloids'] },
      { k: 'Alkalinity', alt: ['natural alkalinity'], d: 'alum consumes about 0.5 mg alkalinity per mg' },
      { k: 'pH', alt: ['pH of water'], d: 'alum best pH 5–7.5; iron 6–7' },
      { k: 'Type and dose of coagulant', alt: ['coagulant dose', 'type of coagulant'] },
      { k: 'Mixing (G and detention time)', alt: ['rapid mixing', 'velocity gradient', 'mixing intensity'] },
      { k: 'Temperature', alt: ['water temperature'] },
      { k: 'Ionic strength and charge of ions', alt: ['ions present', 'coagulant aids'] },
    ],
    seen: ['2016-17'],
    src: 'TA T06 p13–23 + Notes-S p12–13',
  },
  {
    id: 'l-coag-alk-react',
    topic: T,
    title: 'Coagulants with natural alkalinity (precipitates formed)',
    points: [
      { k: 'Aluminium sulfate (alum)', alt: ['alum', 'Al2(SO4)3'], d: 'Al(OH)₃ precipitate' },
      { k: 'Ferric chloride', alt: ['FeCl3', 'ferric salts'], d: 'Fe(OH)₃ precipitate' },
      { k: 'Magnesium carbonate', alt: ['MgCO3'], d: 'Mg(OH)₂' },
      { k: 'Lime', alt: ['calcium hydroxide', 'Ca(OH)2'], d: 'CaCO₃ and Mg(OH)₂' },
    ],
    seen: [],
    src: 'TA T06 p9',
  },
  {
    id: 'l-coag-rapid-mix',
    topic: T,
    title: 'Rapid (flash) mixing equipment',
    points: [
      { k: 'Diffusion mixing by pressured water jets', alt: ['water jets'] },
      { k: 'In-line mechanical mixing', alt: ['in-line blender'] },
      { k: 'In-line static mixing', alt: ['static mixer'], d: 'no moving parts, no external energy; but depends on flow' },
      { k: 'Mechanical mixing in stirred tanks', alt: ['CMFR', 'CSTR'], d: 'for sweep floc' },
      { k: 'Pipe-grid diffusion and hydraulic mixing', alt: ['pipe grid', 'hydraulic mixing'] },
    ],
    seen: [],
    src: 'TA T06 p20–22',
  },
  {
    id: 'l-coag-flocc',
    topic: T,
    title: 'Requirements of slow-mixing (flocculation) basins',
    points: [
      { k: 'Enough mixing to contact and suspend flocs', alt: ['bring flocs into contact and keep them suspended'] },
      { k: 'Heavier floc and higher SS need more mixing', alt: ['more mixing for heavy floc'] },
      { k: 'At least three compartments with tapered G', alt: ['three compartments', 'tapered G'] },
      { k: 'Low velocity to the settling basin', alt: ['avoid floc shear'], d: 'enough to avoid shear but keep floc suspended' },
    ],
    seen: [],
    src: 'TA T06 p23',
  },
  {
    id: 'l-coag-select',
    topic: T,
    title: 'Four types of raw water for coagulant selection',
    points: [
      { k: 'Type 1: high turbidity, high alkalinity (easiest)', alt: ['type 1'] },
      { k: 'Type 2: high turbidity, low alkalinity', alt: ['type 2'] },
      { k: 'Type 3: low turbidity, high alkalinity', alt: ['type 3'] },
      { k: 'Type 4: low turbidity, low alkalinity (hardest)', alt: ['type 4'] },
    ],
    seen: ['2021-22'],
    src: 'TA T06 p18',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-coag-def', topic: T, front: 'What is coagulation and why is it needed?', back: 'Colloids cause colour and turbidity, do not settle and pass through filters. They are removed only by adding chemicals that make them aggregate (grow) so they can settle: coagulation.', src: 'TA T06 p2–3' },
  { id: 'c-coag-vs-floc', topic: T, front: 'Coagulation vs flocculation?', back: 'Coagulation: chemical process, rapid mixing disperses the coagulant and destabilises the colloids (seconds). Flocculation: physical, slow mixing brings destabilised particles into contact to grow flocs (20–45 min). Floc must not break.', seen: ['2011-12', '2012-13'], src: 'TA T06 p19–23 + Notes-S p13' },
  { id: 'c-coag-dl', topic: T, front: 'What makes up the double layer?', back: 'A fixed Stern layer of counter-ions strongly held to the surface plus an outer diffuse layer of mobile ions in equilibrium with the bulk solution. Potential falls exponentially with distance.', src: 'TA T06 p5' },
  { id: 'c-coag-zeta', topic: T, front: 'What is zeta potential?', back: 'The electrostatic potential at the shear plane (edge of the Stern layer, where the particle moves relative to the water). Higher |ζ| = more stable colloid; coagulation reduces it towards zero.', src: 'TA T06 p5' },
  { id: 'c-coag-dlvo', topic: T, front: 'DLVO model in one line?', back: 'Net energy between two colloids = double-layer repulsion + van der Waals attraction. With little electrolyte there is an energy barrier; adding electrolyte lowers the barrier until particles stick.', src: 'TA T06 p7' },
  { id: 'c-coag-schulze', topic: T, front: 'Schulze–Hardy rule: relative coagulating power of 1+, 2+, 3+ ions?', back: 'Concentrations needed are in the ratio 1/1⁶ : 1/2⁶ : 1/3⁶ = 1000 : 16 : 1.3. So Al³⁺ works at tiny doses compared with Na⁺.', src: 'TA T06 p8' },
  { id: 'c-coag-dlc-nature', topic: T, front: 'Practical example of double-layer compression in nature?', back: 'Where a river meets the sea: the high salt concentration (Na⁺, Mg²⁺) compresses the double layer of clay colloids, which coagulate and settle, building deltas and silt bars at the estuary.', seen: ['2015-16'], src: 'textbook (Peavy 6-2)' },
  { id: 'c-coag-dlc-limit', topic: T, front: 'Why is double-layer compression not used in water treatment?', back: 'The ionic strength needed is far greater than acceptable for potable water (and wasteful). Practical coagulation uses adsorption or sweep floc.', src: 'TA T06 p7' },
  { id: 'c-coag-sweep', topic: T, front: 'What is sweep-floc coagulation?', back: 'A large dose of Al₂(SO₄)₃, FeCl₃ (or lime, MgCO₃) precipitates Al(OH)₃ / Fe(OH)₃ that nucleates on the particles and traps them as it grows. Dose and colloid concentration are inversely related.', seen: ['2020-21', '2017-18'], src: 'TA T06 p9, p13' },
  { id: 'c-coag-restab', topic: T, front: 'What is restabilisation?', back: 'Overdose of coagulant over-neutralises and reverses the charge of the colloid (or covers all sites of polymer-adsorbed particles), so it is stable again and turbidity rises.', src: 'TA T06 p9–12' },
  { id: 'c-coag-lowturb', topic: T, front: 'How do you coagulate a water of low turbidity?', back: 'Add clay (bentonite) as a coagulant aid to raise colloid concentration, or use a large dose for sweep floc; with low alkalinity also add alkalinity (lime or soda ash).', seen: ['2021-22'], src: 'TA T06 p13, p18; Notes-S p12' },
  { id: 'c-coag-alum-ph', topic: T, front: 'Best pH range for alum and for iron salts?', back: 'Alum: pH 5–7.5 (best near 6–6.5); iron salts have a wider effective range (6–7 stated) and are cheaper, but residual iron can colour the water. Alum dose is typically 5–50 mg/L.', src: 'TA T06 p15, p18' },
  { id: 'c-coag-alkcons', topic: T, front: 'Alkalinity consumed by alum?', back: 'Al₂(SO₄)₃·14H₂O (594) + 6HCO₃⁻ → 2Al(OH)₃ + 6CO₂ + …: 300 g CaCO₃ per 594 g alum, about 0.5 mg alkalinity per mg alum. With no alkalinity, H₂SO₄ forms and pH falls drastically.', src: 'TA T06 p14; Math §9' },
  { id: 'c-coag-noalk', topic: T, front: 'What if natural alkalinity is not enough?', back: 'The pH drops (acid is produced) and coagulation fails; add alkalinity as Ca(OH)₂ (lime) or Na₂CO₃ (soda ash) to buffer the pH.', src: 'TA T06 p14' },
  { id: 'c-coag-g', topic: T, front: 'Define the velocity gradient G and give design values.', back: '$G=\\sqrt{P/(\\mu V)}$ in s⁻¹. Rapid mix: 3000–5000 s⁻¹ for 0.5 s (adsorption); 600–1000 s⁻¹ for 1–10 s (sweep). Flocculation: 20–70 s⁻¹ (low turbidity), 50–150 s⁻¹ (high turbidity).', src: 'TA T06 p19, p23' },
  { id: 'c-coag-camp', topic: T, front: 'What is the CAMP number?', back: 'The product Gt of velocity gradient and detention time (dimensionless). It measures the total opportunity for particle collisions; flocculation design uses Gt ≈ 60,000–200,000 (colour removal), 90,000–180,000 (high turbidity).', seen: ['2007-08', '2008-09', '2015-16', '2016-17'], src: 'TA T06 p19, p23' },
  { id: 'c-coag-jar', topic: T, front: 'What is a jar test?', back: 'Six jars with paddles: first fix the dose and vary pH to find optimum pH, then fix pH and vary dose; the jar with the lowest residual turbidity gives the optimum.', src: 'TA T06 p16' },
  { id: 'c-coag-static', topic: T, front: 'Static mixer: advantages and disadvantage?', back: 'No moving parts and no external energy; but the degree and time of mixing depend on the flow rate.', src: 'TA T06 p21' },
  { id: 'c-coag-aid', topic: T, front: 'What is a coagulant aid?', back: 'A material (clay, polymer, activated silica, lime) added with the coagulant to weight or toughen the floc or supply particles for low-turbidity water.', src: 'TA T06 p18 + textbook' },
  { id: 'c-coag-polymer', topic: T, front: 'Why are cationic polymers good for coagulation?', back: 'Negative colloids adsorb the cationic polymer and are neutralised and bridged. Anionic or non-ionic polymers work by bridging; very high molecular weight is best.', src: 'TA T06 p10, p18' },
  { id: 'c-coag-hardness-alum', topic: T, front: 'Is alum coagulation needed after lime-soda softening?', back: 'No: the Mg(OH)₂ and CaCO₃ precipitates already do the coagulating (sweep). Softening flocs are strong (G 130–300 s⁻¹ allowed) whereas alum floc is weak (low G).', src: 'Notes-S p13–14' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-coag-forces',
    topic: T,
    q: 'What are the two forces that act on colloidal particles in an aqueous system?',
    seen: ['2009-10'],
    a: `### Forces on colloids (DLVO model)
1. **Electrostatic repulsion** between the like-charged double layers (negative surface charge, mostly from isomorphic replacement, such as Al³⁺ for Si⁴⁺). It keeps the particles apart, so colloids are stable.
2. **Van der Waals attraction**: short-range, always present, tends to pull particles together.
3. Net energy = repulsion + attraction: with little electrolyte there is an **energy barrier** and the particles do not aggregate; as ionic strength rises the barrier falls and disappears at high concentration (**destabilisation**).
Coagulation changes this balance by compressing or neutralising the charge.`,
    keys: ['Electrostatic repulsion', 'Van der Waals attraction', 'energy barrier', 'DLVO', 'negative'],
    lists: ['l-coag-forces', 'l-coag-stability'],
    src: 'TA T06 p4–7',
  },
  {
    id: 'a-coag-dlc',
    topic: T,
    q: 'Describe destabilisation of colloids by double-layer (ionic layer) compression, with a diagram of the double layer. Give a natural example.',
    seen: ['2007-08', '2008-09', '2009-10', '2015-16', '2020-21', '2021-22', '2022-23'],
    a: `### Double layer
A negatively charged colloid attracts positive counter-ions: a fixed **Stern layer** next to the surface and a diffuse layer outside it; together the **double layer**. The potential falls from the **Nernst (surface) potential** through the Stern potential to the **zeta potential** at the shear plane, then decays to zero in the bulk.

### Double-layer compression
1. Adding an **electrolyte** (Na⁺, Ca²⁺, Al³⁺) raises the ionic strength.
2. Charge density in the diffuse layer rises, so a **smaller volume of charge** is needed to neutralise the surface: the double layer is **compressed** and the zeta potential falls.
3. Repulsion drops below the van der Waals attraction (**DLVO**: no energy barrier), particles collide and stick.
4. Effect of the ion charge (Schulze–Hardy): concentrations needed 1/1⁶ : 1/2⁶ : 1/3⁶ = **1000 : 16 : 1.3** for Na⁺ : Ca²⁺ : Al³⁺.
5. Dose is independent of the colloid concentration and there is **no restabilisation** on overdose.
6. Effective but needs an ionic strength far above that acceptable for **potable water**.
7. **Natural example**: clay carried by a river is coagulated by the salts of sea water at the estuary, forming deltas and silt banks.`,
    keys: ['double layer', 'Stern layer', 'zeta potential', 'electrolyte', 'compressed', 'DLVO', '1000 : 16 : 1.3', 'estuary', 'Nernst'],
    lists: ['l-coag-forces'],
    src: 'TA T06 p5–8; natural example from textbook',
    Fig: DoubleLayerFig,
  },
  {
    id: 'a-coag-dlc-vs-an',
    topic: T,
    q: 'How does destabilisation by double-layer compression differ from adsorption and charge neutralisation?',
    seen: ['2007-08', '2008-09'],
    a: `### Double-layer compression vs adsorption and charge neutralisation
| | **Double-layer compression** | **Adsorption and charge neutralisation** |
|---|---|---|
| How | electrolyte raises ionic strength and squeezes the diffuse layer | oppositely charged species (Al³⁺, hydrolysis products, cationic polymers) adsorb on the particle surface and neutralise its charge |
| Dose vs colloid concentration | independent | **stoichiometric** relationship |
| Overdose | no effect, no reversal | **charge reversal** (restabilisation) possible |
| Dose needed | very high, ionic strength not acceptable in potable water | **lower dosages** (sorbable species) |
| Examples | NaCl, Ca²⁺ at the sea | alum at low dose (pH 4–6, 7–8.5) |`,
    keys: ['ionic strength', 'stoichiometric', 'charge reversal', 'lower dosages', 'squeezes'],
    lists: ['l-coag-an-vs-dlc'],
    src: 'TA T06 p6–9',
  },
  {
    id: 'a-coag-mech',
    topic: T,
    q: 'Briefly describe the mechanisms of destabilising colloidal particles with appropriate sketches.',
    seen: ['2020-21', '2023-24'],
    a: `### Four destabilisation mechanisms
1. **Double-layer compression**: electrolyte raises ionic strength; the diffuse layer shrinks, the energy barrier vanishes, van der Waals attraction takes over. Needs very high ionic strength.
2. **Adsorption and charge neutralisation**: oppositely charged species (Al³⁺, hydrolysed Al or Fe species, cationic polymers) adsorb on the colloid and neutralise its charge; dose is stoichiometric to colloid concentration, and an overdose reverses the charge (restabilisation).
3. **Enmeshment in a precipitate (sweep floc)**: a large dose of Al₂(SO₄)₃ or FeCl₃ (or lime) forms Al(OH)₃ / Fe(OH)₃ precipitate; it nucleates on the particle surface and grows, trapping the particles. Dose is inversely related to colloid concentration. Normal practice.
4. **Adsorption and interparticle bridging**: long-chain polymers (starch, polysaccharides, polyacrylamide) adsorb at one end on a particle and the other on another; excess polymer or intense mixing restabilises.
Order of dose for the same water: neutralisation (low) < sweep (high); DLC needs very high electrolyte.`,
    keys: ['Double-layer compression', 'Adsorption and charge neutralisation', 'Enmeshment in a precipitate', 'sweep floc', 'interparticle bridging', 'polymers', 'restabilisation'],
    lists: ['l-coag-mech'],
    src: 'TA T06 p6–12',
    Fig: MechanismsFig,
  },
  {
    id: 'a-coag-sweep',
    topic: T,
    q: 'What do you understand by sweep (floc) coagulation?',
    seen: ['2020-21', '2017-18'],
    a: `### Sweep-floc coagulation
1. With a **sufficient amount of coagulant** (Al₂(SO₄)₃, FeCl₃, MgCO₃, Ca(OH)₂) the solubility is exceeded and a rapid amorphous precipitate (Al(OH)₃, Fe(OH)₃, Mg(OH)₂, CaCO₃) is formed.
2. The precipitate **nucleates on the surface** of the colloids, grows, and **entraps** (enmeshes) the particles, sweeping them out of the water like a net.
3. Works at pH about 6–8 and high dose; **dose is inversely related to colloid concentration** (low-turbidity water needs more).
4. Rapid mixing for 1–10 s at G = 600–1000 s⁻¹ in a stirred tank; the flocs are large and settle well.
5. It consumes alkalinity: alum uses about 0.5 mg alkalinity per mg alum.
6. This is the normal mechanism in water treatment plants; zone 4 of the dose–colloid diagram.`,
    keys: ['sufficient amount of coagulant', 'precipitate', 'nucleates', 'entraps', 'inversely related', 'Zone 4', 'Al(OH)₃'],
    lists: ['l-coag-alk-react'],
    src: 'TA T06 p9, p13, p19–22',
  },
  {
    id: 'a-coag-camp',
    topic: T,
    q: 'What is the CAMP number? What is its significance in a flocculation process?',
    seen: ['2007-08', '2008-09', '2015-16', '2016-17'],
    a: `### CAMP number
1. **Definition**: the dimensionless product **Gt** of the root-mean-square velocity gradient $G=\\sqrt{P/(\\mu V)}$ (s⁻¹) and the detention time $t$ (s) of the flocculator.
2. G measures the **intensity of mixing** (power input P, volume V, viscosity μ); Gt measures the **total number of particle contacts** (collision opportunity) during flocculation.
3. **Significance**: G and Gt are the **design criteria** of mixing systems. G must be high enough to cause contact and keep flocs suspended but low enough not to shear them.
4. Values: low-turbidity / colour removal G = 20–70 s⁻¹, Gt = 60,000–200,000; high turbidity G = 50–150, Gt = 90,000–180,000; softening G = 130–300, Gt = 200,000–400,000.
5. Use: with Q and chosen G the basin volume V = Qt follows and the power P = G²μV.`,
    keys: ['Gt', 'velocity gradient', 'detention time', 'dimensionless', 'design criteria', 'Gt = 60,000–200,000'],
    lists: ['l-coag-flocc'],
    src: 'TA T06 p19, p23',
  },
  {
    id: 'a-coag-factors',
    topic: T,
    q: 'What are the factors affecting the coagulation process?',
    seen: ['2016-17'],
    a: `### Factors affecting coagulation
1. **Colloid concentration (turbidity)**: decides the mechanism and dose (stoichiometric in zone 2, inverse in sweep zone); low turbidity may need clay.
2. **Alkalinity**: coagulant hydrolysis consumes it (alum 0.5 mg per mg); too little lowers the pH and adds acid, so lime or soda ash is needed.
3. **pH**: alum is effective at pH 5–7.5, iron salts at 6–7 and wider; optimum pH and dose found by jar test.
4. **Type and dose of coagulant**: alum, ferric salts, polymers, magnesium; overdose causes restabilisation.
5. **Mixing**: rapid mix G = 3000–5000 s⁻¹ (0.5 s) or 600–1000 s⁻¹ (1–10 s); slow mixing G and Gt.
6. **Temperature** (slows hydrolysis and settling) and **ionic strength / ions present** (sulfate, Ca²⁺, Mg²⁺ help).`,
    keys: ['turbidity', 'Alkalinity', 'pH', 'Type and dose', 'Mixing', 'Temperature', 'jar test'],
    lists: ['l-coag-factors'],
    src: 'TA T06 p13–23; Notes-S p12–13',
  },
  {
    id: 'a-coag-vs-floc',
    topic: T,
    q: 'Distinguish between the coagulation process and the flocculation process.',
    seen: ['2011-12', '2012-13'],
    a: `### Coagulation vs flocculation
| | **Coagulation** | **Flocculation** |
|---|---|---|
| Nature | chemical process (destabilisation) | physical / mechanical process |
| What happens | coagulant is added and dispersed; charge on colloids is neutralised or precipitate forms | destabilised particles collide and grow into large settleable flocs |
| Mixing | rapid (flash) mixing, G = 600–5000 s⁻¹, 0.5–10 s | slow mixing, G = 20–150 s⁻¹, 20–45 min, three compartments, tapered |
| Equipment | in-line blender, static mixer, stirred tank | paddle flocculator, vertical turbine, baffled channel |
| Design criterion | G, short t | G and Gt (CAMP number) |
| Care | distribute the coagulant fast | do not break the floc, but keep it suspended |`,
    keys: ['chemical process', 'physical', 'rapid', 'slow mixing', 'paddle flocculator', 'Gt'],
    lists: ['l-coag-rapid-mix', 'l-coag-flocc'],
    src: 'TA T06 p19–24; Notes-S p13',
  },
  {
    id: 'a-coag-dose',
    topic: T,
    q: 'Explain the relationship between coagulant dosage and colloid concentration with appropriate diagrams. How would you apply alum for (i) low turbidity, high alkalinity and (ii) low turbidity, low alkalinity water?',
    seen: ['Jan 2021', '2021-22'],
    a: `### Dose vs colloid concentration
The diagram plots coagulant dose C against colloid concentration S; four zones appear (and the residual-turbidity curve for each S has a dip, a rise, then a second dip).
1. **Zone 1: no coagulation**: dose too low to destabilise, turbidity remains.
2. **Zone 2: coagulation by adsorption and charge neutralisation**: dose increases with S (**stoichiometric** relationship); the zone widens with S.
3. **Zone 3: restabilisation**: overdose reverses the charge (**charge reversal**), the colloids are stable again.
4. **Zone 4: sweep-floc coagulation**: high dose forms Al(OH)₃ / Fe(OH)₃ precipitate that enmeshes colloids; here dose and S are **inversely related**.
Adding clay (**bentonite**) raises S from S₁ to S₃ so that a low-turbidity water can be coagulated at a small dose in zone 2.

### Applying alum
| Water | Practice |
|---|---|
| **(i) Low turbidity, high alkalinity** (type 3) | relatively large dose to form Al(OH)₃ precipitate (sweep floc); alkalinity is ample; add a coagulant aid (clay, polymer) to weight the floc and improve settling |
| **(ii) Low turbidity, low alkalinity** (type 4, hardest) | sweep floc only, but the large dose destroys alkalinity and pH falls: **add alkalinity** (lime or soda ash) to make it type 3, or **add clay** to make it type 2; polymer cannot work alone |`,
    keys: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'stoichiometric', 'charge reversal', 'inversely related', 'bentonite', 'add alkalinity', 'coagulant aid'],
    lists: ['l-coag-zones', 'l-coag-select'],
    src: 'TA T06 p13, p18; Notes-S p12',
    Fig: DoseFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
