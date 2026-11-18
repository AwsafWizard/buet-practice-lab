// ev-rwh — rainwater harvesting: why, components, BNBC 2020 rules, quality, tank sizing logic (Rowshan ma'am L6). Numbers live in engine/rwh.ts and pyq/rm-math.tsx.
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-rwh' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const good = 'var(--c-good)'
const soil = 'var(--c-soil)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** a rooftop RWH system with its five components and the first-flush / overflow details */
const RwhFig: FC = () => (
  <svg viewBox="0 0 640 340" width="100%" role="img" aria-label="Rooftop rainwater harvesting system">
    <defs>
      <marker id="ev-rw-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    {[40, 90, 140].map((x) => (
      <line key={x} x1={x} y1={8} x2={x - 8} y2={40} stroke={water} strokeWidth={2} />
    ))}
    <Tx x={30} y={20} t="1 precipitation" a="start" b />
    {/* house */}
    <polygon points="20,70 150,48 280,70" fill={panel2} stroke={ink} strokeWidth={2} />
    <rect x={40} y={70} width={220} height={150} fill={panel2} stroke={ink} strokeWidth={2} />
    <Tx x={150} y={62} t="2 catchment (roof)" b s={11} />
    <Tx x={150} y={150} t="building" c={mute} />
    <rect x={0} y={220} width={640} height={16} fill={soil} opacity={0.5} />
    {/* gutter + downpipe */}
    <line x1={20} y1={72} x2={20} y2={200} stroke={ink} strokeWidth={4} />
    <Tx x={10} y={120} t="3 conveyance" a="end" b s={11} />
    <Tx x={10} y={134} t="(gutter, downpipe)" a="end" s={10.5} />
    <line x1={20} y1={200} x2={330} y2={200} stroke={ink} strokeWidth={4} />
    {/* first flush */}
    <rect x={300} y={150} width={16} height={50} fill={water} opacity={0.5} stroke={ink} />
    <Tx x={308} y={140} t="first flush" s={10.5} />
    <Tx x={308} y={236 + 12} t="diverter" s={10.5} />
    {/* filter */}
    <rect x={350} y={180} width={46} height={40} fill={panel2} stroke={ink} />
    <Tx x={373} y={176} t="screen / filter" s={10.5} />
    <line x1={330} y1={200} x2={350} y2={200} stroke={ink} strokeWidth={4} />
    <line x1={396} y1={200} x2={430} y2={200} stroke={ink} strokeWidth={4} markerEnd="url(#ev-rw-a)" />
    {/* tank */}
    <rect x={430} y={150} width={110} height={150} rx={6} fill={water} opacity={0.3} stroke={ink} strokeWidth={2} />
    <rect x={430} y={190} width={110} height={110} rx={6} fill={water} opacity={0.35} />
    <Tx x={485} y={248} t="4 storage" b />
    <Tx x={485} y={264} t="tank / cistern" s={11} />
    <line x1={430} y1={160} x2={400} y2={160} stroke={ink} strokeDasharray="4 3" />
    <Tx x={330} y={164} t="overflow" a="end" s={10.5} />
    <Tx x={330} y={178} t="(to recharge pit)" a="end" s={10.5} />
    <rect x={545} y={160} width={50} height={20} fill="none" stroke={ink} strokeDasharray="3 3" />
    <Tx x={570} y={174} t="vent" s={10} />
    {/* delivery */}
    <line x1={540} y1={280} x2={600} y2={280} stroke={ink} strokeWidth={3} markerEnd="url(#ev-rw-a)" />
    <Tx x={570} y={272} t="5 delivery" b s={11} />
    <Tx x={570} y={298} t="tap or pump" s={11} />
    {/* recharge */}
    <rect x={330} y={236} width={60} height={50} fill={soil} opacity={0.3} stroke={ink} strokeDasharray="3 3" />
    <Tx x={360} y={266} t="recharge" s={10.5} />
    <Tx x={320} y={326} t="BNBC: first flush 20 min (Dhaka) or 15 min; at least two downpipes of 50 mm or more per roof" c={mute} s={11} />
    <Tx x={500} y={20} t="rain on the roof is conveyed, cleaned, stored and delivered" a="middle" s={11} c={good} />
    <Tx x={500} y={36} t="excess recharges groundwater" s={11} c={accent} />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-rwh-why',
    topic: T,
    title: 'Why rainwater harvesting?',
    ask: 'Describe the importance of rainwater harvesting.',
    points: [
      { k: 'To meet ever-increasing demand of water', alt: ['increasing demand'] },
      { k: 'To supply water in problem areas', alt: ['problem areas'], d: 'arsenic, salinity, hilly, coastal' },
      { k: 'To augment groundwater and stop level decline', alt: ['recharge groundwater', 'augment groundwater'] },
      { k: 'To avoid flooding of roads', alt: ['avoid waterlogging', 'reduce flooding'], d: 'urban drainage relief' },
      { k: 'To supplement domestic requirement in summer and drought', alt: ['dry season supply', 'drought'] },
      { k: 'To use in less quality-demanding uses', alt: ['toilet flushing, gardening, car washing'], d: 'toilet flushing, gardening, car washing, terrace cleaning' },
      { k: 'To comply with national rules (BNBC 2020)', alt: ['BNBC', 'national rules'], d: 'every building with 300 m² roof area needs an RWH system' },
    ],
    hook: 'Demand, Problem areas, Groundwater, Flood, Summer, Low-grade uses, Code.',
    seen: ['2020-21', '2023-24'],
    src: 'RM L6 p4',
  },
  {
    id: 'l-rwh-components',
    topic: T,
    title: 'Basic components of a rooftop RWH system',
    ask: 'What are the basic components of an RWH system?',
    ordered: true,
    points: [
      { k: 'Precipitation', alt: ['rainfall'] },
      { k: 'A collection area', alt: ['catchment', 'roof'] },
      { k: 'A conveyance system of pipes and gutters', alt: ['conveyance', 'gutters and downpipes'] },
      { k: 'A storage facility', alt: ['storage tank', 'cistern', 'storage'] },
      { k: 'A delivery system (tap or pump)', alt: ['delivery', 'tap or pump'] },
    ],
    hook: 'Rain falls on Roof, runs through Gutters, rests in a Tank, leaves by Tap.',
    seen: [],
    src: 'RM L6 p5',
  },
  {
    id: 'l-rwh-urban',
    topic: T,
    title: 'Elements of an urban RWH system (flow)',
    ordered: true,
    points: [
      { k: 'Rainfall' },
      { k: 'Catchment surface', alt: ['roof'] },
      { k: 'First flush diverter', alt: ['first flush'] },
      { k: 'Coarse filter', alt: ['filter'] },
      { k: 'Storage tank (with pump and overflow)', alt: ['storage tank'] },
      { k: 'Non-potable supply and header tank with mains top-up', alt: ['header tank', 'mains top-up'] },
    ],
    seen: [],
    src: 'RM L6 p6',
  },
  {
    id: 'l-rwh-bnbc',
    topic: T,
    title: 'BNBC 2020 rules for rainwater harvesting',
    ask: 'State the rules of BNBC 2020 in implementing an RWH system.',
    points: [
      { k: 'Buildings with 300 m² roof need RWH', alt: ['300 sqm', '300 square metre roof'] },
      { k: 'Flat surface: plan area plus 50% of wall', alt: ['50 per cent of the adjoining vertical wall', 'flat roof catchment'] },
      { k: 'Inclined roof: total inclined area is the catchment', alt: ['total inclined area'] },
      { k: 'At least two drains per independent roof', alt: ['minimum two drains', 'two downpipes'] },
      { k: 'Rainwater downpipe diameter not less than 50 mm', alt: ['RDP 50 mm', 'minimum 50 mm'] },
      { k: 'First flush: Dhaka 20 min, others 15 min', alt: ['first flush 20 minutes', 'first flush 15 minutes'] },
      { k: 'Tank for 90 or 210 dry days', alt: ['90 days', '210 days', 'dry days 90 and 210'] },
      { k: '10% extra volume as freeboard', alt: ['10 percent freeboard'] },
      { k: 'Treatment decided by end use', alt: ['treatment by use', 'qualifying rainwater use'] },
    ],
    hook: '300 roof, 50% wall, 2 drains, 50 mm, 20/15 min flush, 90/210 days, 10% free.',
    seen: ['2020-21'],
    src: 'RM L6 p4, p9–14, p21, p40',
  },
  {
    id: 'l-rwh-flush-time',
    topic: T,
    title: 'First flush diversion duration (BNBC 2020)',
    points: [
      { k: 'Dhaka metropolitan area: 20 min', alt: ['Dhaka 20 min'] },
      { k: 'Sylhet: 15 min', alt: ['Sylhet 15'] },
      { k: 'Chittagong: 15 min', alt: ['Chattogram 15 min'] },
      { k: 'Other urban areas: 15 min', alt: ['other urban 15'] },
    ],
    seen: [],
    src: 'RM L6 p13',
  },
  {
    id: 'l-rwh-store-parts',
    topic: T,
    title: 'Parts of an RW storage tank',
    points: [
      { k: 'Lid or manway', alt: ['manhole', 'lid'], d: 'secured against children and animals' },
      { k: 'Vent with fine mesh screen', alt: ['vent'], d: 'keeps mosquitoes out' },
      { k: 'Inlet from downspouts', alt: ['inlet'] },
      { k: 'Overflow with flap valve', alt: ['overflow'], d: 'keeps insects and animals out' },
      { k: 'Turbulence calming device', alt: ['calming inlet'], d: 'stops sediment remixing' },
      { k: 'Floating suction filter', alt: ['floating filter'] },
      { k: 'Outlet', alt: ['outlet to use'] },
      { k: 'Hose bibb', alt: ['tap'] },
      { k: 'Tank pad', alt: ['base'] },
    ],
    seen: [],
    src: 'RM L6 p17',
  },
  {
    id: 'l-rwh-tank-loc',
    topic: T,
    title: 'Storage tank location options',
    points: [
      { k: 'Below ground floor', alt: ['underground'] },
      { k: 'Roof top location', alt: ['roof top', 'rooftop'] },
      { k: 'Intermediate level in a high-rise building', alt: ['intermediate level'] },
      { k: 'Outside the building', alt: ['outside'] },
    ],
    seen: [],
    src: 'RM L6 p18',
  },
  {
    id: 'l-rwh-size-factors',
    topic: T,
    title: 'What tank size dictates',
    points: [
      { k: 'Mains water to be saved (saving efficiency)', alt: ['water saving efficiency'] },
      { k: 'Cost' },
      { k: 'Amount of rainwater to be stored (affects quality)', alt: ['amount of rainwater stored'] },
    ],
    seen: ['2020-21'],
    src: 'RM L6 p20',
  },
  {
    id: 'l-rwh-quality-factors',
    topic: T,
    title: 'Factors affecting rainwater quality',
    points: [
      { k: 'pH', d: 'slightly acidic from dissolved CO₂; acid rain in polluted areas' },
      { k: 'Particulate matter by wet deposition', alt: ['wet deposition'], d: 'hydrocarbons and lead from the atmosphere' },
      { k: 'Catchment surface by dry deposition', alt: ['dry deposition', 'roof type'], d: 'dust, vehicle and industrial emissions, nutrients, heavy metals' },
      { k: 'Leaching from the collection system', alt: ['leaching'], d: 'zinc from metal roofs, lead from paint, iron from old GI pipes' },
      { k: 'Storage tank', d: 'settling helps; long retention with organic matter harms' },
      { k: 'Microbial contamination', alt: ['bacteria and pathogens'], d: 'faecal matter from birds and wildlife' },
      { k: 'Mineral content', alt: ['lack of minerals'], d: 'rainwater lacks calcium, magnesium, fluoride' },
    ],
    seen: [],
    src: 'RM L6 p31–32',
  },
  {
    id: 'l-rwh-quality-manage',
    topic: T,
    title: 'Interventions to manage rainwater quality',
    points: [
      { k: 'Improved design features', alt: ['design features'], d: 'calming inlet, avoid overhanging vegetation, mesh screens' },
      { k: 'Pre-storage measures', alt: ['pre-storage'], d: 'debris screens, filters and first-flush diversion' },
      { k: 'Post-storage measures', alt: ['post-storage'], d: 'filtration and disinfection (chlorine, UV, SODIS)' },
    ],
    seen: [],
    src: 'RM L6 p33',
  },
  {
    id: 'l-rwh-use-treat',
    topic: T,
    title: 'End use decides the treatment of rainwater',
    points: [
      { k: 'Drinking, cooking, utensils, bathing, ablution: filtration and disinfection', alt: ['drinking: disinfection with filtration'] },
      { k: 'Cloth and floor washing, fountains: filtration', alt: ['washing: filtered'] },
      { k: 'Sprinkler fire fighting, air conditioning: sedimentation of suspended particles', alt: ['sedimentation'] },
      { k: 'Toilet flushing, gardening, parking lots: screening of floating materials', alt: ['screening'] },
    ],
    seen: ['2020-21'],
    src: 'RM L6 p40',
  },
]

const cards: EvCard[] = [
  { id: 'c-rwh-def', topic: T, front: 'Define rainwater harvesting.', back: 'A simple process or technology that **collects and stores rainwater for human use** from rooftops, land surface or catchments, using tanks, dams or recharge to the aquifer. Excess beyond the tank may recharge groundwater.', src: 'RM L6 p2' },
  { id: 'c-rwh-potential', topic: T, front: 'How much water can be harvested?', back: 'Volume = catchment area × rainfall × collection efficiency (runoff coefficient). Harvesting potential = rainfall (mm) × collection efficiency; losses are evaporation, spillage and first flush.', src: 'RM L6 p7' },
  { id: 'c-rwh-runoff', topic: T, front: 'Runoff coefficients (Pacey 1989).', back: 'Tile roof **0.8–0.9**; corrugated metal **0.7–0.8**; concrete surface **0.6–0.8**; brick pavement 0.5–0.6; soil on slope under 10%: 0–0.3; rocky natural catchment 0.2–0.5.', src: 'RM L6 p8' },
  { id: 'c-rwh-catch-flat', topic: T, front: 'Catchment area of a flat roof or terrace (BNBC 2020)?', back: 'Its **plan area plus 50% of the adjoining vertical wall** that contributes to the rainwater. E.g. downpipe RDP3 serves terraces 2 and 3 plus 50% of the adjacent walls.', seen: ['2020-21', '2022-23'], src: 'RM L6 p9' },
  { id: 'c-rwh-catch-inc', topic: T, front: 'Catchment area of an inclined roof (BNBC)?', back: 'The **total inclined area** of the roof, not its plan footprint (gable, hip or barrel roof).', src: 'RM L6 p10' },
  { id: 'c-rwh-rdp', topic: T, front: 'BNBC rule for rainwater downpipes (RDP)?', back: 'At least **two drains and vertical leaders** for any independent roof surface, diameter **not less than 50 mm**, distributed proportionately around the building.', src: 'RM L6 p12' },
  { id: 'c-rwh-ff', topic: T, front: 'What is a first-flush diverter and why use it?', back: 'It discards the first runoff, which washes dust, bird droppings and organic matter off the roof. It **retards sediment build-up** in the tank, prevents odour and colour problems and improves quality. BNBC: Dhaka 20 min, others 15 min.', src: 'RM L6 p13–14' },
  { id: 'c-rwh-ff-types', topic: T, front: 'Two simple first-flush diverters?', back: '(a) **PVC standpipe**: the pipe fills first, backs up, then flows to the collection pipe (hose bibb drip, clean-out plug). (b) **Standpipe with floating ball**: ball rises, seals on the seat and sends the rest of the water to the tank.', src: 'RM L6 p14' },
  { id: 'c-rwh-demand', topic: T, front: 'Demand-side tank sizing formula and the BNBC dry days.', back: '**V = n × d × q** (users × dry days × per-capita demand) plus **10% freeboard**. BNBC: d = **90 days** for drinking, cooking, utensils, bathing and ablution; **210 days** for other uses.', seen: ['2023-24'], src: 'RM L6 p21' },
  { id: 'c-rwh-demand-ex', topic: T, front: 'Slide example: 6 people, 10 L/day, 100 dry days.', back: 'Volume = 6 × 10 × 100 = 6000 L; 10% freeboard 600 L; tank **6600 L (6.6 m³)**.', src: 'RM L6 p22' },
  { id: 'c-rwh-supply', topic: T, front: 'When does the supply side govern the tank size?', back: 'When the total yearly rainfall supply is **lower than the yearly demand**; the demand is cut to the available water and a **mass curve** gives the tank as the maximum cumulative deficit.', src: 'RM L6 p23' },
  { id: 'c-rwh-supply-ex', topic: T, front: 'Slide example: community clinic, tank from the mass curve.', back: 'Demand 715 L/day; roof 190 m², C = 0.9, 1056 mm: supply 180.58 m³ a year = 494.7 L/day, so demand is cut to 15.05 m³/month; max deficit in April gives a tank of about **50.45 m³**.', src: 'RM L6 p24–27' },
  { id: 'c-rwh-dual', topic: T, front: 'What is the dual plumbing system?', back: 'Separate pipes for **rainwater** (toilet, washing machine, laundry, irrigation) and **mains water** (basin, bath, kitchen) with mains back-up into the rainwater tank through a water meter and dual check valve; hot water through a tempering valve.', src: 'RM L6 p28' },
  { id: 'c-rwh-chlor', topic: T, front: 'Chlorination of stored rainwater: dose and contact time?', back: '**1 ppm** chlorine; contact time depends on pH and temperature (BNBC): at pH 7.0 and 50 °F or warmer, **8 min**; pH 6.0 only 3 min; pH 8.0, 16 min. Drawback: disinfection by-products; some organisms are resistant.', src: 'RM L6 p37' },
  { id: 'c-rwh-uv', topic: T, front: 'Why must rainwater be filtered before UV or SODIS?', back: 'Suspended particles **shadow the pathogens** from the UV light. Direct sunlight accelerates bacterial die-off; solar UV disinfection was used in a rural RWH unit (ITN-BUET, CAFOD, DFID).', src: 'RM L6 p38–39' },
  { id: 'c-rwh-minerals', topic: T, front: 'Is rainwater good as drinking water?', back: 'It is soft, slightly acidic (CO₂) and **lacks minerals** such as calcium, magnesium and fluoride; roofs add metals and microbes, so filtration and disinfection are required for potable use.', src: 'RM L6 p31–32' },
  { id: 'c-rwh-tank-loc', topic: T, front: 'Where are RW tanks put (Dhaka examples)?', back: 'Below ground floor, on the roof, at an intermediate level, or outside. BUET cafeteria and IUB use roof tanks; UITS Dhaka has an above-ground sedimentation-filtration system.', src: 'RM L6 p18–19, p36' },
  { id: 'c-rwh-uttara', topic: T, front: 'RWH in Dhaka: the push for it?', back: 'BNBC 2020 requires RWH for buildings with 300 m² roof area; RAJUK builds RWH in Uttara, with 12,000 (Jhilmil) and 60,000 (Purbachal) apartments planned; WaterAid installed over 7000 systems.', src: 'SN L2 p77; RM L6 p4' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-rwh-importance',
    topic: T,
    q: 'Describe the importance of rainwater harvesting (RWH) in the context of rapid urbanisation and climate change in Bangladesh.',
    seen: ['2020-21', '2023-24'],
    a: `### What it is
**RWH** is a simple process that collects and stores rainwater for human use from roofs, land surfaces or catchments.

### Importance
1. **Rapid urbanisation**: demand grows faster than supply; Dhaka WASA pumps 3.3 million m³ a day and the water table falls about 2 m a year, so RWH **meets the ever-increasing demand** and cuts the load on groundwater.
2. **Groundwater recharge**: paved surfaces stop infiltration; storing roof runoff and letting overflow **recharge the aquifer** controls the decline of water levels.
3. **Urban flooding**: less runoff to roads and drains, so it helps **avoid waterlogging** of roads.
4. **Climate change**: rainfall is erratic, with long dry spells and heavy bursts; RWH **supplements domestic supply in summer and drought**; rising salinity makes rainwater a key drinking source on the coast.
5. **Problem areas**: arsenic, salinity, iron, hilly, haor and char areas can use it for **drinking**.
6. **Less quality-demanding uses**: toilet flushing, gardening, car washing and terrace cleaning use rainwater and save treated water and pumping energy.
7. **Compliance**: **BNBC 2020** requires an RWH system in every building with a 300 m² roof area.`,
    keys: ['ever-increasing demand', 'recharge the aquifer', 'avoid waterlogging', 'Climate change', 'drought', 'salinity', 'toilet flushing', 'BNBC 2020', '300 m²'],
    lists: ['l-rwh-why'],
    src: 'RM L6 p2–4',
  },
  {
    id: 'a-rwh-bnbc',
    topic: T,
    q: 'State the rules of BNBC 2020 in implementing an RWH system.',
    seen: ['2020-21'],
    a: `### BNBC 2020 rules
1. **When**: every building with **300 m² roof area** shall have an RWH system.
2. **Catchment area**: for a **flat surface**, its plan area plus **50% of the adjoining vertical wall** that contributes; for an **inclined roof**, the **total inclined area**.
3. **Conveyance**: **minimum two drains and vertical leaders** for any independent roof surface; rainwater downpipes **not less than 50 mm** and distributed around the building.
4. **First flush**: divert the first flush, **20 min in Dhaka**, **15 min** in Sylhet, Chittagong and other urban areas.
5. **Tank size**: demand-side **V = n d q** with **90 dry days** for drinking, cooking, utensils, bathing and ablution and **210 days** for other uses, plus **10% freeboard**.
6. **Use and treatment**: drinking, cooking and bathing water must be **filtered and disinfected**; washing uses filtered water; fire fighting and air conditioning need sedimentation; flushing and gardening need screening.
7. **Chlorine contact time** is tabulated with pH and temperature (8 min at pH 7, 50 °F or warmer).`,
    keys: ['300 m² roof area', '50%', 'total inclined area', 'two drains', '50 mm', 'First flush', '20 min', '90 dry days', '210 days', '10% freeboard', 'disinfected'],
    lists: ['l-rwh-bnbc', 'l-rwh-flush-time', 'l-rwh-use-treat'],
    src: 'RM L6 p4, p9–14, p21, p37, p40',
  },
  {
    id: 'a-rwh-components',
    topic: T,
    q: 'What are the basic components of a rooftop RWH system? Sketch it.',
    seen: [],
    a: `### Components
1. **Precipitation**: the rain.
2. **A collection area**: the roof or catchment surface (runoff coefficient 0.6–0.9).
3. **A conveyance system** of gutters and downpipes (RDP of at least 50 mm, two per roof).
4. **A storage facility**: tank or cistern with lid, vent, inlet, overflow, calming inlet and floating suction filter.
5. **A delivery system**: a tap or a pump.

### Added units in a good system
**Pre-treatment**: debris screen and **first-flush diverter**; **overflow** to a recharge pit or drain; post-storage filtration and chlorination for drinking; dual plumbing with mains back-up for non-potable use.`,
    keys: ['Precipitation', 'collection area', 'conveyance system', 'storage facility', 'delivery system', 'first-flush diverter', 'overflow'],
    lists: ['l-rwh-components', 'l-rwh-store-parts'],
    src: 'RM L6 p5–6, p17',
    Fig: RwhFig,
  },
  {
    id: 'a-rwh-sustain',
    topic: T,
    q: 'Write down the sustainability of rainwater harvesting as a potential source of water supply.',
    seen: ['2023-24'],
    a: `### Sustainability of RWH
1. **Resource**: Bangladesh gets about **2500 mm** of rain a year, so the source is renewable and free; but it is **seasonal** (about 80% in the monsoon), so a **tank sized for the dry season** is needed.
2. **Environmental**: it **reduces groundwater abstraction**, can **recharge** aquifers, lessens surface runoff and urban flooding, and uses no energy for transport.
3. **Social**: suits **problem areas** (arsenic, salinity, hilly, haor, char), is household or community managed and can be built with local skills.
4. **Economic**: low running cost and savings on pumping and treated water, but a **high initial cost** of tank and catchment; **supply-side** limits mean it may cover only part of the demand, so it is best as a **supplement** (and for non-potable uses).
5. **Quality risk**: rainwater lacks minerals and can pick up microbes and metals from roof and tank; needs **first flush, filtration, disinfection** and maintenance, so sustainability depends on **O&M and awareness**.
6. **Policy**: **BNBC 2020** makes it compulsory for buildings with a 300 m² roof area.`,
    keys: ['2500 mm', 'seasonal', 'dry season', 'groundwater abstraction', 'recharge', 'problem areas', 'initial cost', 'supplement', 'first flush', 'BNBC 2020'],
    lists: ['l-rwh-why', 'l-rwh-quality-manage'],
    src: 'RM L4 p11, L6 p2–4, p29–40; judgement: textbook',
  },
  {
    id: 'a-rwh-approaches',
    topic: T,
    q: 'Which approach of tank sizing (demand side or supply side) is economical and why?',
    seen: ['2020-21'],
    a: `### The two approaches
| | **Demand-side** | **Supply-side (mass curve)** |
|---|---|---|
| Idea | store the dry-season demand ($V = n \\times d \\times q$ plus 10% freeboard) | store the largest cumulative deficit between harvest and demand |
| Governs when | rainfall supply exceeds demand | yearly supply is lower than yearly demand |
| Data | users, dry days (BNBC 90 and 210), per-capita demand | monthly rainfall, roof area, runoff coefficient |
| Result | usually the **larger** tank | tank limited to what the roof can actually fill |

### Which is economical
1. The tank size sets the **cost**, so the tank that is no bigger than the water the roof can supply is cheaper: when the harvest is less than the demand, the **supply-side (mass-curve)** size is the economical one, since a demand-side tank would never fill.
2. When the roof supplies more than the demand, the **demand-side** size is enough, and a bigger tank only adds cost for no extra saving.
3. Compare the dry-season demand with the rainy-season catch and **adopt the smaller of the two**; any shortfall is met from the mains.`,
    keys: ['Demand-side', 'Supply-side', 'mass curve', 'dry-season demand', 'cumulative deficit', 'cost', 'economical', 'smaller'],
    lists: ['l-rwh-size-factors'],
    src: 'RM L6 p20–27; economy argument: judgement',
  },
  {
    id: 'a-rwh-quality',
    topic: T,
    q: 'What affects the quality of harvested rainwater and how is it managed?',
    seen: [],
    a: `### Factors affecting quality
1. **pH**: slightly acidic from CO₂, more so with acid rain.
2. **Wet deposition**: hydrocarbons and lead on dust washed out of the air.
3. **Dry deposition on the roof**: dust, vehicle and industrial particles, nutrients, heavy metals; roof type matters.
4. **Leaching** from the system: zinc from metal roofs, lead from paint, iron from old GI pipes.
5. **Storage tank**: settling and precipitation help; long retention with organic matter harms.
6. **Microbes**: faecal matter from birds and wildlife.
7. **Minerals**: rainwater lacks calcium, magnesium and fluoride.

### Management
1. **Design features**: calming inlet, no overhanging vegetation, angled mesh screen, finer mesh at the outlet, a separate pre-chamber.
2. **Pre-storage**: debris screens, filters and **first-flush diversion**.
3. **Post-storage**: filtration and **disinfection** (1 ppm chlorine with contact time, or filtration then UV or SODIS).
4. End use decides the level: drinking needs filtration and disinfection.`,
    keys: ['pH', 'Wet deposition', 'Dry deposition', 'Leaching', 'Storage tank', 'Microbes', 'first-flush diversion', 'Post-storage', 'disinfection'],
    lists: ['l-rwh-quality-factors', 'l-rwh-quality-manage', 'l-rwh-use-treat'],
    src: 'RM L6 p29–40',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
