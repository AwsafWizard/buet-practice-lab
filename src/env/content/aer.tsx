// ev-aer — aeration / gas transfer (Tanvir sir T04). Numbers (Henry's law, K_L a) live in engine/chem.ts.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-aer' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const water = 'var(--c-water)'
const panel2 = 'var(--c-panel2)'

// ---------- figures ----------
const Lbl = ({ x, y, t, a = 'middle' }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} textAnchor={a} fontSize={11.5} fill={ink}>
    {t}
  </text>
)

/** four aerator sketches: cascade, spray, perforated-tray tower, diffuser */
const AeratorsFig: FC = () => (
  <svg viewBox="0 0 620 330" width="100%" role="img" aria-label="Types of aerators: cascade, spray, tray tower, diffuser">
    {/* cascade */}
    <Lbl x={80} y={18} t="1. Cascade (gravity)" />
    <path d="M10,50 H60 V80 H100 V110 H140 V140 H190 V160" fill="none" stroke={ink} strokeWidth={2} />
    {[40, 85, 125, 165].map((x, i) => (
      <path key={x} d={`M${x},${48 + i * 30} q8,14 16,0`} fill="none" stroke={water} strokeWidth={2} />
    ))}
    <Lbl x={36} y={42} t="inlet" />
    <Lbl x={165} y={178} t="water in a thin film, air contact" a="middle" />
    {/* spray */}
    <Lbl x={420} y={18} t="2. Spray aerator (nozzles)" />
    <rect x={330} y={150} width={180} height={30} fill={panel2} stroke={mute} />
    <Lbl x={420} y={170} t="collecting basin" />
    <line x1={420} y1={140} x2={420} y2={100} stroke={ink} strokeWidth={2} />
    <rect x={410} y={92} width={20} height={10} fill={ink} />
    {[-70, -45, -20, 20, 45, 70].map((d) => (
      <path key={d} d={`M420,92 Q${420 + d},${40} ${420 + d * 1.4},${150}`} fill="none" stroke={water} strokeWidth={1.6} />
    ))}
    <Lbl x={420} y={196} t="fine droplets: large area, short fall" />
    {/* tray tower */}
    <Lbl x={80} y={216} t="3. Perforated trays / tower" />
    <rect x={30} y={226} width={100} height={92} fill="none" stroke={ink} strokeWidth={2} />
    {[246, 268, 290].map((y) => (
      <line key={y} x1={30} x2={130} y1={y} y2={y} stroke={mute} strokeDasharray="6 3" strokeWidth={2} />
    ))}
    <Lbl x={80} y={324} t="air up (countercurrent), water down" />
    <path d="M150,300 V240" stroke={mute} markerEnd="url(#ev-aer-a)" />
    {/* diffuser */}
    <Lbl x={420} y={216} t="4. Diffuser (wastewater)" />
    <rect x={340} y={226} width={160} height={90} fill="none" stroke={ink} strokeWidth={2} />
    <rect x={340} y={256} width={160} height={60} fill={water} opacity={0.25} />
    {[370, 400, 430, 460].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy={300 - i * 8} r={4} fill="none" stroke={ink} />
        <circle cx={x + 10} cy={280 - i * 6} r={3} fill="none" stroke={ink} />
      </g>
    ))}
    <Lbl x={420} y={326} t="air bubbles in water (also mechanical aerators)" />
    <defs>
      <marker id="ev-aer-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={mute} />
      </marker>
    </defs>
  </svg>
)

/** two-film theory: concentration profile across the interface */
const TwoFilmFig: FC = () => (
  <svg viewBox="0 0 600 270" width="100%" role="img" aria-label="Two-film theory of gas transfer">
    <rect x={40} y={30} width={520} height={190} fill="none" stroke={mute} />
    <rect x={240} y={30} width={50} height={190} fill={panel2} />
    <rect x={290} y={30} width={50} height={190} fill={water} opacity={0.2} />
    <line x1={290} x2={290} y1={30} y2={220} stroke={ink} strokeWidth={2} />
    <Lbl x={140} y={20} t="bulk gas" />
    <Lbl x={265} y={20} t="gas film" />
    <Lbl x={315} y={20} t="liquid film" />
    <Lbl x={450} y={20} t="bulk liquid" />
    <polyline points="60,70 240,70 290,100 340,150 540,170" fill="none" stroke="var(--c-accent)" strokeWidth={2.6} />
    <Lbl x={70} y={62} t="C (gas)" a="start" />
    <Lbl x={470} y={160} t="C_t (liquid)" />
    <line x1={540} x2={540} y1={100} y2={170} stroke={ink} strokeDasharray="4 3" />
    <Lbl x={500} y={125} t="Cs − Ct" />
    <Lbl x={300} y={245} t="distance from interface →   (concentration gradient Cs − Ct is the driving force)" />
    <Lbl x={290} y={262} t="thin films = fast transfer; r = K_L (Cs − Ct)" />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-aer-objectives',
    topic: T,
    title: 'Objectives of aeration of ground water',
    ask: 'What are the two main objectives of aeration?',
    points: [
      { k: 'Oxidation of Fe, Mn and sulfide', alt: ['oxidation of iron and manganese', 'add oxygen', 'oxidize Fe2+ Mn2+ S2-'], d: 'oxygen is absorbed so soluble Fe²⁺, Mn²⁺ become insoluble and settle' },
      { k: 'Removal of dissolved gases', alt: ['stripping of CO2 and H2S', 'remove CO2', 'taste and odour control', 'VOC removal'], d: 'CO₂ (raises pH, cuts corrosion), H₂S and VOC (taste, odour, carcinogens) are desorbed' },
    ],
    seen: ['2011-12', '2015-16', '2016-17'],
    src: 'TA T04 p4',
  },
  {
    id: 'l-aer-absorb',
    topic: T,
    title: 'Gases added to water by absorption (purpose)',
    points: [
      { k: 'O₂, Cl₂: oxidation of Fe²⁺, Mn²⁺, S²⁻', alt: ['O2 Cl2'] },
      { k: 'O₃: disinfection, colour removal, oxidation of organics', alt: ['ozone'] },
      { k: 'ClO₂: disinfection', alt: ['chlorine dioxide'] },
      { k: 'CO₂: pH control', alt: ['CO2'] },
      { k: 'SO₂: dechlorination', alt: ['SO2'] },
      { k: 'NH₃: chloramine formation', alt: ['NH3'] },
    ],
    seen: [],
    src: 'TA T04 p4',
  },
  {
    id: 'l-aer-desorb',
    topic: T,
    title: 'Gases removed from water by desorption (purpose)',
    points: [
      { k: 'CO₂, O₂: corrosion control', alt: ['CO2 O2'] },
      { k: 'H₂S: odour control', alt: ['H2S'] },
      { k: 'NH₃: nutrient removal', alt: ['NH3'] },
      { k: 'VOC: taste and odour, removal of carcinogens', alt: ['volatile organic compounds'] },
    ],
    seen: [],
    src: 'TA T04 p4',
  },
  {
    id: 'l-aer-types',
    topic: T,
    title: 'Four types of aerators',
    ask: 'What are the different methods (types) of aeration?',
    points: [
      { k: 'Gravity aerators', alt: ['gravity'], d: 'water treatment' },
      { k: 'Spray aerators', alt: ['spray'], d: 'water treatment' },
      { k: 'Diffusers', alt: ['diffused air'], d: 'wastewater treatment' },
      { k: 'Mechanical aerators', alt: ['mechanical'], d: 'wastewater treatment' },
    ],
    seen: ['2010-11'],
    src: 'TA T04 p10',
  },
  {
    id: 'l-aer-gravity',
    topic: T,
    title: 'Gravity aerators',
    points: [
      { k: 'Cascades', d: 'stepped drops from inlet to outlet conduit' },
      { k: 'Inclined planes' },
      { k: 'Tower with countercurrent air flow', alt: ['countercurrent tower'], d: 'perforated pipe water down, air up' },
      { k: 'Perforated stacks', alt: ['perforated trays', 'tray aerator'] },
      { k: 'Packed columns', alt: ['packed tower'] },
    ],
    seen: ['2010-11'],
    src: 'TA T04 p12–13',
  },
  {
    id: 'l-aer-principles',
    topic: T,
    title: 'Basic principles of liquid–gas contact systems',
    points: [
      { k: 'Maximise area of contact', alt: ['increase interfacial area', 'form droplets'], d: 'break water into droplets' },
      { k: 'Increase exposure time', alt: ['long time of contact'], d: 'project water high or drop it from a height' },
      { k: 'Produce relative motion', alt: ['renew the interface', 'agitation', 'maximise concentration gradient'], d: 'renewal of the interface by agitation keeps Cs − Ct large' },
    ],
    seen: [],
    src: 'TA T04 p11',
  },
  {
    id: 'l-aer-optimize',
    topic: T,
    title: 'How to optimise gas transfer across the air–water interface',
    ask: 'How can gas transfer between the air–water interface be optimised / maximised?',
    points: [
      { k: 'Increase interfacial area', alt: ['maximise area', 'droplets', 'spray'] },
      { k: 'Prevent build-up of thick interfacial films', alt: ['thin films', 'reduce film thickness', 'agitation'] },
      { k: 'Induce a long time of exposure', alt: ['long contact time', 'increase exposure time'] },
      { k: 'Ventilate to keep the driving force high', alt: ['maintain highest Cs - Ct', 'ventilation', 'fresh air'], d: 'keeps (Cs − Ct) maximum' },
    ],
    hook: 'A-F-T-V: Area, Film, Time, Ventilation.',
    seen: ['2007-08', '2008-09', '2011-12', '2015-16', '2016-17'],
    src: 'TA T04 p8',
  },
  {
    id: 'l-aer-solubility',
    topic: T,
    title: 'Solubility of a gas depends on',
    points: [
      { k: 'Partial pressure in the atmosphere', alt: ['partial pressure'] },
      { k: 'Water temperature', alt: ['temperature'] },
      { k: 'Presence of impurities', alt: ['impurities'] },
    ],
    seen: [],
    src: 'TA T04 p7',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-aer-def', topic: T, front: 'Define aeration (gas transfer).', back: '"A physical phenomenon in which gas molecules are exchanged between a liquid and a gas at a gas–liquid interface." Absorption adds a gas (O₂), desorption (stripping) removes one (CO₂, H₂S).', src: 'TA T04 p4' },
  { id: 'c-aer-why-gw', topic: T, front: 'Why is ground water aerated?', back: 'It is low in DO and rich in Fe²⁺, Mn²⁺, CO₂, H₂S: aeration adds O₂ to oxidise Fe and Mn to insoluble forms and strips CO₂ and H₂S (higher pH, less corrosion, no rotten-egg odour).', seen: ['2011-12', '2015-16', '2016-17'], src: 'TA T03 p8–9' },
  { id: 'c-aer-twofilm', topic: T, front: 'What does the two-film theory say?', back: 'The interface is made of a gas film and a liquid film, which are barriers between the bulk phases. The concentration gradient (Cs − Ct) is the driving force; transfer is faster when a film is thinner.', seen: ['2017-18'], src: 'TA T04 p5' },
  { id: 'c-aer-ratelimit', topic: T, front: 'What is the rate-limiting step in gas transfer?', back: 'The film offering most resistance. Highly soluble gas (NH₃): gas film controls, so stir the gas. Weakly soluble (O₂, N₂, CO₂): liquid film controls, so stir the liquid. Intermediate (H₂S): both matter.', src: 'TA T04 p6–7' },
  { id: 'c-aer-henry', topic: T, front: 'State Henry’s law as used in class.', back: 'The solubility of a gas is proportional to its partial pressure: P = H × c (P in atm or mol/mol air, c in mol/mol water). A large H means a gas that is volatile and easily stripped (TCE, H = 560 atm).', src: 'TA T04 p6' },
  { id: 'c-aer-rate', topic: T, front: 'Write the aeration rate equation and its integrated form.', back: '$r = dW/(A\\,dt) = K_L(C_S - C_t)$ per area; per volume $dC/dt = K_L a (C_S - C_t)$, with $a = A/V$. Integrated: $(C_t - C_0) = (C_S - C_0)[1 - e^{-K_L a t}]$.', src: 'TA T04 p8' },
  { id: 'c-aer-solubility', topic: T, front: 'What affects the solubility of a gas in water?', back: 'Partial pressure of the gas in contact with water, water temperature (colder dissolves more) and impurities (salts reduce it).', src: 'TA T04 p7' },
  { id: 'c-aer-gravity', topic: T, front: 'Which aerators are used in water treatment and which in wastewater?', back: 'Water treatment: gravity (cascades, inclined planes, tray towers, packed columns) and spray aerators. Wastewater: diffusers and mechanical aerators.', src: 'TA T04 p10' },
  { id: 'c-aer-most-eff', topic: T, front: 'Which aerator is the most efficient for ground water?', back: 'Spray aerators and tray / packed countercurrent towers: they give small droplets (large area) or thin films with continuous renewal and fresh air flow. Cascades are simple and cheap but less efficient.', seen: ['2010-11'], src: 'TA T04 p10–14 + textbook' },
  { id: 'c-aer-dropdirection', topic: T, front: 'A gas is "absorbed" or "desorbed" when…?', back: 'Absorbed when Cs > Ct (water under-saturated, gas goes in: O₂ for oxidation). Desorbed when Cs < Ct (water over-saturated, gas leaves: CO₂, H₂S, VOC).', src: 'TA T04 p5' },
  { id: 'c-aer-droplet-bubble', topic: T, front: 'Two ways to bring water and gas into contact?', back: 'Disperse water into air (spray, cascade, tower) or air into water (diffusers, bubbles). Contact systems drive the mixture to equilibrium as quickly as possible.', src: 'TA T04 p10' },
  { id: 'c-aer-recarb', topic: T, front: 'How is gas transfer used for pH control?', back: 'CO₂ is absorbed (recarbonation) to lower the pH of limed water to 8.4–8.6 so that CaCO₃ stops depositing; CO₂ is stripped to raise the pH of aggressive ground water.', src: 'TA T04 p4, T07 p16' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-aer-objectives',
    topic: T,
    q: 'What are the (two main) objectives of aeration of ground water?',
    seen: ['2011-12', '2015-16', '2016-17'],
    a: `### Objectives of aeration
1. **Oxidation of iron, manganese and sulfide**: ground water is low in DO. Absorbing O₂ turns soluble Fe²⁺ and Mn²⁺ to insoluble Fe(III) and Mn(IV) that settle and are filtered. $4Fe^{2+} + O_2 + 10H_2O \\rightarrow 4Fe(OH)_3 + 8H^+$.
2. **Removal of dissolved gases (stripping)**: CO₂ is removed (pH rises above 7.3 so Fe oxidation is faster and the water is less corrosive); H₂S and VOCs removed for **taste and odour control** and carcinogen removal.
3. Other uses on the same principle: adding CO₂ for pH control (recarbonation), O₃ and ClO₂ for disinfection, chloramine formation.`,
    keys: ['Oxidation', 'Fe²⁺', 'dissolved gases', 'CO₂', 'H₂S', 'taste and odour', 'VOC'],
    lists: ['l-aer-objectives', 'l-aer-absorb', 'l-aer-desorb'],
    src: 'TA T04 p4',
  },
  {
    id: 'a-aer-optimize',
    topic: T,
    q: 'How can gas transfer between the air–water interface be optimised (maximised)? Show with a diagram.',
    seen: ['2007-08', '2008-09', '2011-12', '2015-16', '2016-17'],
    a: `### Rate of transfer
$$\\frac{dC}{dt}=K_L a\\,(C_S-C_t),\\qquad a=\\frac{A}{V}$$
Transfer is optimised by raising $K_L$, $a$ or the driving force $(C_S-C_t)$:
1. **Increase interfacial area**: break the water into droplets (spray nozzles, cascades, perforated trays) or the air into fine bubbles (diffusers).
2. **Prevent build-up of thick interfacial films**: turbulence and continuous renewal of the interface (agitation, falling over steps, trays) keep the films thin. Stir the liquid for weakly soluble gases (O₂, CO₂) and the gas for very soluble gases (NH₃).
3. **Induce a long time of exposure**: project the water high, or let it fall from a height or flow through packed towers.
4. **Ventilate the aerator** to maintain the highest driving force: fresh air keeps $C_S$ high for absorption, and removes stripped gas so $C_t$ stays below $C_S$ for desorption. Cold water and high partial pressure also help.`,
    keys: ['interfacial area', 'thick interfacial films', 'long time of exposure', 'Ventilate', 'driving force', 'droplets', 'Increase'],
    lists: ['l-aer-optimize', 'l-aer-principles'],
    src: 'TA T04 p8, p11',
    Fig: AeratorsFig,
  },
  {
    id: 'a-aer-types',
    topic: T,
    q: 'What are the different methods of aeration of water, and which is comparatively most efficient?',
    seen: ['2010-11'],
    a: `### Aerator types
1. **Gravity aerators** (water treatment): cascades, inclined planes, tower with countercurrent air flow, perforated stacks (trays), packed columns. Water falls in thin films by gravity.
2. **Spray aerators** (water treatment): nozzles shoot the water as fine droplets into the air; large area but short contact.
3. **Diffusers** (wastewater): compressed air released as bubbles in the water.
4. **Mechanical aerators** (wastewater): surface agitators or submerged turbines churn air into water.

**Most efficient for ground water:** spray and tray / packed-tower aerators: large interfacial area, thin renewed films, good ventilation. Cascades are cheapest but least efficient.`,
    keys: ['Gravity aerators', 'Spray aerators', 'Diffusers', 'Mechanical aerators', 'cascades', 'packed columns', 'perforated stacks'],
    lists: ['l-aer-types', 'l-aer-gravity'],
    src: 'TA T04 p10–14',
    Fig: AeratorsFig,
  },
  {
    id: 'a-aer-twofilm',
    topic: T,
    q: 'Write a short note on the two-film theory of gas transfer.',
    seen: ['2017-18'],
    a: `### Two-film theory
1. The interface between gas and liquid consists of **two distinct films** (a gas film and a liquid film) that act as a barrier between the bulk phases; the bulk phases are well mixed.
2. The **concentration gradient** $(C_s - C_t)$ across the films is the **driving force**; $C_s$ is the saturation (equilibrium) value given by **Henry's law**.
3. Flux $r = K_L (C_s - C_t)$; for a tank $dC/dt = K_L a (C_s - C_t)$, giving $C_t - C_0 = (C_s - C_0)(1 - e^{-K_L a t})$.
4. The film with the greatest resistance is **rate limiting**: highly soluble gas (NH₃) gas film controls; weakly soluble (O₂, N₂, CO₂) the liquid film controls; intermediate (H₂S) both.
5. Transfer is enhanced by **reducing film thickness** (turbulence, agitation) and increasing area.`,
    keys: ['two distinct films', 'driving force', 'Henry', 'rate limiting', 'film thickness', 'Concentration gradient', 'liquid film'],
    lists: ['l-aer-solubility'],
    src: 'TA T04 p5–8',
    Fig: TwoFilmFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
