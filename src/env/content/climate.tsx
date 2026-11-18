// ev-climate — climate change, greenhouse effect, water vapour, energy and Bangladesh, energy–environment nexus, the environmental engineer (Rowshan ma'am L2–L3).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-climate' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'
const soil = 'var(--c-soil)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** greenhouse effect: incoming short-wave, reflected, absorbed, re-radiated long-wave trapped by GHGs */
const GreenhouseFig: FC = () => (
  <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Greenhouse effect">
    <defs>
      <marker id="ev-gh-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
      <marker id="ev-gh-b" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={bad} />
      </marker>
    </defs>
    <circle cx={70} cy={50} r={26} fill={accent} opacity={0.85} />
    <Tx x={70} y={96} t="Sun" b />
    {/* atmosphere band */}
    <rect x={150} y={100} width={470} height={70} fill={water} opacity={0.18} />
    <Tx x={540} y={118} t="atmosphere with greenhouse gases" c={mute} s={11} />
    <Tx x={540} y={134} t="CO₂, CH₄, N₂O, SF₆, PFC, water vapour" c={mute} s={11} />
    {/* earth */}
    <rect x={150} y={250} width={470} height={60} fill={soil} opacity={0.5} />
    <Tx x={385} y={288} t="Earth's surface" b />
    {/* incoming */}
    <line x1={100} y1={60} x2={230} y2={245} stroke={ink} strokeWidth={2.4} markerEnd="url(#ev-gh-a)" />
    <Tx x={110} y={160} t="solar radiation" a="start" s={11} />
    <Tx x={110} y={175} t="(short wave)" a="start" s={11} c={mute} />
    {/* reflected */}
    <line x1={235} y1={245} x2={330} y2={60} stroke={ink} strokeWidth={2} strokeDasharray="5 3" markerEnd="url(#ev-gh-a)" />
    <Tx x={290} y={50} t="some is reflected" a="start" s={11} />
    {/* absorbed re-radiated */}
    <line x1={400} y1={245} x2={400} y2={180} stroke={bad} strokeWidth={2.4} markerEnd="url(#ev-gh-b)" />
    <line x1={400} y1={100} x2={400} y2={30} stroke={bad} strokeWidth={2.4} strokeDasharray="2 3" markerEnd="url(#ev-gh-b)" />
    <Tx x={412} y={218} t="absorbed energy re-radiated:" a="start" s={11} />
    <Tx x={412} y={232} t="long-wave infrared" a="start" s={11} c={bad} b />
    <Tx x={412} y={20} t="a little escapes to space" a="start" s={11} />
    {/* back radiation */}
    <path d="M470,170 Q500,205 470,245" fill="none" stroke={bad} strokeWidth={2.4} markerEnd="url(#ev-gh-b)" />
    <Tx x={512} y={206} t="most is absorbed and" a="start" s={11} />
    <Tx x={512} y={220} t="radiated back by the GHGs" a="start" s={11} />
    <Tx x={320} y={326} t="Without GHGs the earth would average about −18 °C" c={mute} />
  </svg>
)

/** energy–environment nexus: energy production uses water, land, minerals and harms the environment; water treatment and pumping use energy */
const NexusFig: FC = () => (
  <svg viewBox="0 0 640 320" width="100%" role="img" aria-label="Energy, water, land and environment nexus">
    <defs>
      <marker id="ev-nx-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={ink} />
      </marker>
    </defs>
    <rect x={30} y={20} width={580} height={280} rx={14} fill="none" stroke={line} strokeDasharray="5 4" />
    <Tx x={320} y={42} t="ENVIRONMENT (climate variability and change at the centre)" b c={mute} />
    {[
      { x: 320, y: 90, t: 'ENERGY', c: accent },
      { x: 150, y: 235, t: 'WATER', c: water },
      { x: 490, y: 235, t: 'LAND / FOOD', c: good },
    ].map((n) => (
      <g key={n.t}>
        <ellipse cx={n.x} cy={n.y} rx={78} ry={30} fill={panel2} stroke={n.c} strokeWidth={2.4} />
        <Tx x={n.x} y={n.y + 4} t={n.t} b />
      </g>
    ))}
    <line x1={270} y1={115} x2={190} y2={208} stroke={ink} markerEnd="url(#ev-nx-a)" markerStart="url(#ev-nx-a)" />
    <line x1={370} y1={115} x2={450} y2={208} stroke={ink} markerEnd="url(#ev-nx-a)" markerStart="url(#ev-nx-a)" />
    <line x1={228} y1={235} x2={412} y2={235} stroke={ink} markerEnd="url(#ev-nx-a)" markerStart="url(#ev-nx-a)" />
    <Tx x={205} y={152} t="power plants need cooling water;" a="end" s={10.5} />
    <Tx x={205} y={166} t="pumping and treatment need energy" a="end" s={10.5} />
    <Tx x={435} y={152} t="biofuel, hydropower dams, mining" a="start" s={10.5} />
    <Tx x={435} y={166} t="and solar farms take land" a="start" s={10.5} />
    <Tx x={320} y={268} t="irrigation, food, fertiliser: water and energy" s={10.5} />
    <Tx x={320} y={290} t="Energy production and use: acid rain, global warming, smog, asthma, cancer" c={bad} s={11} />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-climate-ghg',
    topic: T,
    title: 'Greenhouse gases',
    ask: 'Name the greenhouse gases.',
    points: [
      { k: 'Carbon dioxide', alt: ['CO2'], d: 'fossil fuels, deforestation' },
      { k: 'Methane', alt: ['CH4'], d: 'paddy, livestock, landfill' },
      { k: 'Nitrous oxide', alt: ['N2O', 'NO2', 'nitrogen oxide'], d: 'fertiliser, combustion (slide prints NO2)' },
      { k: 'Sulphur hexafluoride', alt: ['SF6'], d: 'insulating gas in switchgear' },
      { k: 'Perfluorocarbons', alt: ['PFC', 'PFCs'] },
      { k: 'Water vapour', alt: ['water vapor', 'H2O'], d: 'the most abundant GHG; a feedback, not a driver' },
    ],
    seen: ['2015-16'],
    src: 'RM L1-3 p57',
    note: 'The slide prints "NO2" for the third gas; nitrous oxide (N₂O) is meant.',
  },
  {
    id: 'l-climate-drivers',
    topic: T,
    title: 'Drivers of temperature rise',
    points: [
      { k: 'Greenhouse gases', alt: ['GHGs'] },
      { k: 'Aerosols and clouds' },
      { k: 'Changes on land surface', alt: ['land use change', 'land surface changes'] },
      { k: 'Solar and volcanic activity', alt: ['solar activity', 'volcanic activity'] },
    ],
    hook: 'G-A-L-S: Gases, Aerosols, Land, Sun and volcanoes.',
    seen: ['2011-12', '2012-13', '2016-17', '2017-18'],
    src: 'RM L1-3 p60',
  },
  {
    id: 'l-climate-impacts',
    topic: T,
    title: 'Potential impacts of climate change (EPA chart)',
    points: [
      { k: 'Health impacts', alt: ['human health'], d: 'weather-related mortality, infectious diseases, respiratory illness' },
      { k: 'Agriculture impacts', alt: ['agriculture'], d: 'crop yields, irrigation demand' },
      { k: 'Forest impacts', alt: ['forests'], d: 'composition, shifted range, health and productivity' },
      { k: 'Water resource impacts', alt: ['water resources'], d: 'supply, quality, competition for water' },
      { k: 'Impacts on coastal areas', alt: ['coastal areas'], d: 'beach erosion, inundation, cost of defence' },
      { k: 'Species and natural areas', alt: ['species'], d: 'shift of ecological zones, loss of habitat and species' },
    ],
    hook: 'Climate changes (temperature, rain, sea level) hit: Health, Agriculture, Forests, Water, Coast, Species.',
    seen: ['2011-12', '2012-13', '2016-17', '2017-18', '2020-21', '2022-23'],
    src: 'RM L1-3 p61',
  },
  {
    id: 'l-climate-bd-impacts',
    topic: T,
    title: 'Climate change impacts on Bangladesh',
    ask: 'What are the general impacts of climate change in Bangladesh?',
    points: [
      { k: 'Sea level rise', alt: ['inundation of coastal land'], d: 'coastal flooding, land loss' },
      { k: 'Salinity intrusion', alt: ['salinity'], d: 'into rivers and aquifers of the coast' },
      { k: 'Floods', alt: ['flooding', 'riverine flood'], d: 'bigger and more frequent' },
      { k: 'Cyclones and storm surges', alt: ['cyclones', 'cyclone'], d: 'Sidr 2007' },
      { k: 'Drought', alt: ['droughts'], d: 'barind and north-west' },
      { k: 'Erosion', alt: ['river bank erosion'] },
      { k: 'Fall in crop production', alt: ['agriculture', 'food security'] },
      { k: 'Health problems', alt: ['diseases'] },
      { k: 'Migration', alt: ['environmental migration', 'displacement'] },
      { k: 'Loss of biodiversity', alt: ['ecosystem damage'] },
    ],
    seen: ['2011-12', '2012-13', '2016-17', '2017-18', '2020-21'],
    src: 'RM L1-3 p61–62 (general) + textbook for the Bangladesh list',
  },
  {
    id: 'l-climate-response',
    topic: T,
    title: 'Responses to climate change',
    points: [
      { k: 'Mitigation', d: 'reduce emissions or enhance sinks: renewable energy, energy conservation and efficiency, carbon sinks' },
      { k: 'Adaptation', d: 'adjust to impacts: relocation, hardened infrastructure, emergency planning' },
    ],
    seen: [],
    src: 'RM L1-3 p63',
  },
  {
    id: 'l-climate-adapt',
    topic: T,
    title: 'Adaptation only measures',
    points: [
      { k: 'Change in land use or relocation', alt: ['relocation'] },
      { k: 'Emergency and business continuity planning', alt: ['emergency planning'] },
      { k: 'Upgrades or hardening of buildings and infrastructure', alt: ['hardening of infrastructure'] },
      { k: 'Residential programs promoting adaptation' },
    ],
    seen: [],
    src: 'RM L1-3 p63',
  },
  {
    id: 'l-climate-mitig',
    topic: T,
    title: 'Mitigation only measures',
    points: [
      { k: 'Energy conservation and efficiency' },
      { k: 'Renewable energy' },
      { k: 'Sustainable transportation and improved fuel efficiency', alt: ['sustainable transportation'] },
      { k: 'Capture and use of landfill and digester gas', alt: ['landfill gas capture'] },
      { k: 'Carbon sinks' },
    ],
    seen: [],
    src: 'RM L1-3 p63',
  },
  {
    id: 'l-climate-both',
    topic: T,
    title: 'Measures that do both (mitigation and adaptation)',
    points: [{ k: 'Seal buildings' }, { k: 'Green infrastructure' }, { k: 'Water and energy conservation' }, { k: 'Smart growth' }],
    seen: [],
    src: 'RM L1-3 p63',
  },
  {
    id: 'l-climate-vapour-loop',
    topic: T,
    title: 'Water vapour feedback loop',
    ordered: true,
    points: [
      { k: 'Increased CO₂ concentration', alt: ['more CO2', 'greenhouse gas increase'] },
      { k: 'Global air temperature increases', alt: ['temperature rises'] },
      { k: 'Increased evaporation, more water vapour in the air', alt: ['more water vapour', 'increased water vapor'] },
      { k: 'More greenhouse warming from water vapour', alt: ['more heat trapped', 'increased greenhouse warming'] },
    ],
    seen: ['2020-21', '2022-23'],
    src: 'RM L1-3 p59',
    note: 'Then back to the second step: a positive feedback loop.',
  },
  {
    id: 'l-climate-energy-src',
    topic: T,
    title: 'Sources of energy',
    points: [
      { k: 'Non-renewable (conventional)', alt: ['non-renewable', 'conventional'], d: 'fossil fuel (coal, gas, petroleum) and nuclear' },
      { k: 'Renewable (alternative)', alt: ['renewable', 'alternative'] },
    ],
    seen: [],
    src: 'RM L1-3 p65–66',
  },
  {
    id: 'l-climate-renew',
    topic: T,
    title: 'Renewable energy sources',
    points: [
      { k: 'Solar' },
      { k: 'Wind' },
      { k: 'Geothermal' },
      { k: 'Tidal' },
      { k: 'Biomass', alt: ['biomass and waste'] },
      { k: 'Biofuel', alt: ['biodiesel'] },
      { k: 'Hydropower', alt: ['hydro'] },
    ],
    hook: 'Sun, Wind, Earth heat, Tide, Plants, Fuel crops, Dams.',
    seen: ['2022-23'],
    src: 'RM L1-3 p67',
  },
  {
    id: 'l-climate-bd-energy',
    topic: T,
    title: 'Main energy sources of Bangladesh',
    ask: 'Describe the energy situation of Bangladesh.',
    points: [
      { k: 'Natural gas', alt: ['gas'] },
      { k: 'Oil' },
      { k: 'Biomass' },
      { k: 'Coal' },
      { k: 'LNG' },
      { k: 'LPG' },
      { k: 'Solar' },
      { k: 'Hydropower', alt: ['hydro'] },
      { k: 'Wind' },
    ],
    seen: ['2021-22'],
    src: 'RM L1-3 p70',
  },
  {
    id: 'l-climate-bd-renew-challenges',
    topic: T,
    title: 'Challenges of renewable energy in Bangladesh',
    ask: 'What are the challenges of using renewable energy in Bangladesh?',
    points: [
      { k: 'Land scarcity', alt: ['limited land', 'high population density'], d: 'dense country; solar and wind farms need land' },
      { k: 'High initial cost', alt: ['high capital cost', 'initial cost is high'] },
      { k: 'Intermittency', alt: ['unreliable supply', 'variability', 'no storage'], d: 'sun and wind are not continuous; storage is expensive' },
      { k: 'Limited wind and hydro potential', alt: ['low wind speed', 'flat terrain'] },
      { k: 'Technology and skilled manpower', alt: ['lack of technology', 'recent and advanced technology'] },
      { k: 'Grid integration', alt: ['grid problems'] },
      { k: 'Policy and financing gaps', alt: ['policy', 'financing'] },
    ],
    seen: ['2022-23'],
    src: 'RM L1-3 p69 (comparison table) + textbook',
    note: 'The CE22 slides give only the renewable vs non-renewable table (initial cost high, recent technology); the rest is general knowledge.',
  },
  {
    id: 'l-climate-nexus-stmts',
    topic: T,
    title: 'The energy–environment relationship',
    points: [
      { k: 'Strong relationship between energy and environment', alt: ['strong relationship'] },
      { k: 'Huge resource consumption in energy production', alt: ['resource consumption is huge'] },
      { k: 'Energy production and use cause major environmental problems', alt: ['acid rain, global warming, smog'], d: 'acid rain, global warming, smog, and health problems such as asthma and cancer' },
    ],
    seen: ['Jan 2021', '2022-23'],
    src: 'RM L1-3 p75',
  },
  {
    id: 'l-climate-solutions',
    topic: T,
    title: 'What should be done: solutions to the energy–environment nexus',
    points: [
      { k: 'Switch', d: 'to renewable, clean energy' },
      { k: 'Reduce', d: 'energy use: efficiency and conservation' },
      { k: 'Capture', d: 'carbon and gases (CCS, landfill and digester gas)' },
    ],
    seen: ['Jan 2021'],
    src: 'RM L1-3 p79',
  },
  {
    id: 'l-climate-engineer',
    topic: T,
    title: 'Roles of an environmental engineer',
    ask: 'How can an environmental engineer contribute to conserving and maintaining environmental quality?',
    points: [
      { k: 'Water supply and treatment', alt: ['safe drinking water'], d: 'source selection, treatment, distribution, water safety plans' },
      { k: 'Wastewater and sanitation', alt: ['wastewater treatment'] },
      { k: 'Solid and hazardous waste management', alt: ['solid waste', 'waste management'] },
      { k: 'Air pollution control', alt: ['air quality'] },
      { k: 'Climate change mitigation and adaptation', alt: ['climate change'], d: 'renewable energy, energy efficiency, resilient design' },
      { k: 'Environmental impact assessment and monitoring', alt: ['EIA', 'monitoring'] },
      { k: 'Public health protection', alt: ['public health'] },
      { k: 'Policy, standards and sustainable development', alt: ['standards', 'policy', 'sustainability'] },
      { k: 'Restoration of ecosystems', alt: ['remediation', 'conservation of ecosystems'] },
    ],
    seen: ['2020-21', '2021-22', '2022-23'],
    src: 'textbook (Peavy, Davis)',
    note: 'The CE22 slide "What does an environmental engineer do?" is a title and a video with no text.',
  },
]

const cards: EvCard[] = [
  { id: 'c-climate-weather', topic: T, front: 'Weather vs climate?', back: '**Weather**: short-term properties (temperature, rain, pressure, moisture) at a place and time. **Climate**: the long-term pattern of weather, assessed over about **30 years**.', seen: ['2011-12'], src: 'RM L1-3 p53' },
  { id: 'c-climate-def', topic: T, front: 'Define climate change (IPCC).', back: 'A change in the state of the climate, identifiable by changes in the **mean and/or variability** of its properties, that persists for **decades or longer**; due to natural internal processes, external forcing (solar cycles, volcanoes) or **persistent human changes** to the atmosphere and land use.', seen: ['2011-12', '2016-17'], src: 'RM L1-3 p54' },
  { id: 'c-climate-evidence', topic: T, front: 'What is the evidence that global warming is occurring?', back: 'Rising surface air and sub-surface ocean temperatures, rising average sea level, retreating glaciers and changes in many physical and biological systems; most of the recent warming is attributed to human activities.', src: 'RM L1-3 p55' },
  { id: 'c-climate-minus18', topic: T, front: 'Why are greenhouse gases "essential"?', back: 'With no greenhouse gases the earth would average about **−18 °C**. Venus (abundant GHGs) is about 855 °F, Pluto (almost none) about −370 °F. The problem is the **enhanced** greenhouse effect from extra gases.', src: 'RM L1-3 p57' },
  { id: 'c-climate-gh-effect', topic: T, front: 'Explain the greenhouse effect in three lines.', back: 'Short-wave solar radiation is partly reflected, mostly absorbed by the surface. The surface re-radiates **long-wave infrared**; most of it is absorbed and radiated back by greenhouse gases, warming the lower atmosphere.', seen: ['2015-16'], src: 'RM L1-3 p56' },
  { id: 'c-climate-vapour2', topic: T, front: 'By how much does the water vapour feedback amplify CO₂ warming?', back: 'Scientists estimate it **more than doubles** the warming from the increased CO₂ alone. Warmer air holds more moisture and vapour does not condense out as easily; vapour absorbs outgoing heat: a **positive feedback loop**.', seen: ['2020-21', '2022-23'], src: 'RM L1-3 p59 (NASA)' },
  { id: 'c-climate-vapour3', topic: T, front: 'Why is water vapour not a "driver" like CO₂?', back: 'Its amount is set by temperature, so it **responds** to warming caused by other gases (a feedback), rather than being emitted directly in a significant amount by human activity.', src: 'RM L1-3 p59–60' },
  { id: 'c-climate-energy-def', topic: T, front: 'Define energy; why does energy matter for the economy?', back: 'Capacity of a physical system to perform work (potential, heat, kinetic, light, electrical). Energy is the **prime mover of economic activity** and energy consumption is an indicator of a country\'s economic growth.', src: 'RM L1-3 p64' },
  { id: 'c-climate-nr-vs-r', topic: T, front: 'Non-renewable vs renewable energy: five contrasts.', back: 'Non-renewable: finite, high carbon emission, millions of years to replenish, known technology, **less cost**. Renewable: continuous, mostly non-polluting (green), replenishes quickly, recent technology, **high initial cost**.', seen: ['2022-23'], src: 'RM L1-3 p69' },
  { id: 'c-climate-bd-gas', topic: T, front: 'Bangladesh electricity installed capacity: the big shares.', back: 'Total 32,457 MW (SREDA 2026): **gas 38.4%**, coal 19.3%, HFO 17.4%, captive 8.6%, imported 8.3%, **renewable 5.6%** (1807 MW), HSD 2.4%.', seen: ['2021-22'], src: 'RM L1-3 p71' },
  { id: 'c-climate-bd-renew', topic: T, front: 'Renewable capacity of Bangladesh by technology?', back: 'Total 1807 MW: **solar 1514 MW (83.8%)**, hydro 230 MW (12.7%), wind 62 MW, biogas and biomass under 1 MW. On-grid 1429 MW, off-grid 379 MW.', seen: ['2021-22', '2022-23'], src: 'RM L1-3 p72' },
  { id: 'c-climate-buet-solar', topic: T, front: 'BUET rooftop solar project in numbers.', back: '**3.5 MW** on **19 buildings**, about **30%** of the university\'s daily electricity, saving about Tk 3 crore a year over 25 years and a carbon-footprint cut of about 1 crore 2 lac tonnes.', src: 'RM L1-3 p74' },
  { id: 'c-climate-iea', topic: T, front: 'IEA World Energy Outlook 2016: energy and water numbers?', back: 'From 2014 to 2040 energy used by the **water sector** rises about **130%** and water used by the **energy sector** rises about **59%**.', seen: ['2021-22'], src: 'RM L1-3 p76' },
  { id: 'c-climate-covid', topic: T, front: 'What happened to global carbon emission in 2020?', back: 'It **dropped by 7%** amid the Covid-19 pandemic (a sign how tied emissions are to energy use).', src: 'RM L1-3 p78' },
  { id: 'c-climate-sidr', topic: T, front: 'Which Bangladesh event does the climate-impact slide show?', back: '**Cyclone Sidr**, with tidal flooding (Venice) and desertification (Mali) as global examples of the sea-level, temperature and rainfall impacts.', src: 'RM L1-3 p62' },
  { id: 'c-climate-ccs', topic: T, front: 'What are carbon sinks?', back: 'Reservoirs that absorb more CO₂ than they release: forests, oceans, soils. Protecting and growing them is a **mitigation** measure.', src: 'RM L1-3 p63' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-climate-causes',
    topic: T,
    q: 'What do you mean by climate change? Briefly explain the causes of climate change.',
    seen: ['2011-12', '2012-13', '2016-17', '2017-18'],
    a: `### Climate change
1. **Climate** is the long-term pattern of weather (temperature, humidity, pressure, wind, precipitation) over about 30 years; **weather** is the short-term state.
2. **Climate change** (IPCC): a change in the mean and/or variability of climate properties that persists for **decades or longer**, due to natural processes, external forcing (solar cycles, volcanic eruptions) or persistent human changes in the atmosphere and land use.
3. Evidence: rising air and ocean temperature, sea-level rise, retreating glaciers; most recent warming is human-caused.

### Causes (drivers of temperature rise)
1. **Greenhouse gases**: CO₂ (fossil fuels, cement, deforestation), CH₄ (paddy fields, livestock, landfill), N₂O (fertiliser), SF₆, PFCs and water vapour trap long-wave radiation (the **enhanced greenhouse effect**).
2. **Aerosols and clouds**: reflect or absorb sunlight (net cooling or warming depending on type).
3. **Changes on the land surface**: deforestation, urbanisation, agriculture change albedo and remove carbon sinks.
4. **Solar and volcanic activity**: natural forcing, small compared with the human contribution since 1880.`,
    keys: ['climate change', 'weather', 'IPCC', 'decades', 'Greenhouse gases', 'Aerosols', 'land surface', 'Solar and volcanic', 'greenhouse effect'],
    lists: ['l-climate-drivers', 'l-climate-ghg'],
    src: 'RM L1-3 p53–60',
    Fig: GreenhouseFig,
  },
  {
    id: 'a-climate-impacts-bd',
    topic: T,
    q: 'What are the general impacts of climate change in Bangladesh? Describe the importance of climate change in the Bangladesh perspective.',
    seen: ['2011-12', '2012-13', '2016-17', '2017-18', '2020-21'],
    a: `### Climate changes
Rising **temperature**, changing **precipitation** and **sea-level rise** produce these impacts (EPA chart):
1. **Health**: weather-related deaths, infectious and water-borne disease, respiratory illness.
2. **Agriculture**: change in crop yield, higher irrigation demand, salinity of soil.
3. **Forests**: change in composition, shifting range, lower productivity (Sundarbans mangrove).
4. **Water resources**: change in water supply and quality, more competition for water, drought and flood.
5. **Coastal areas**: erosion, **inundation** of low coastal land, cost of defence.
6. **Species and natural areas**: shift of ecological zones, loss of habitat and species.

### Why it matters for Bangladesh
1. A low-lying, **delta** country with a long coast and about 700 rivers: **sea-level rise** and **salinity intrusion** damage drinking water, crops and livelihoods.
2. **Cyclones and storm surges** (Sidr), bigger **floods**, droughts in the north-west and **erosion** of river banks.
3. Dense population, so **migration** and displacement, and the poor suffer most; loss of safe water supply and food security.
4. Hence adaptation (embankments, cyclone shelters, rainwater harvesting, salt-tolerant crops) as well as mitigation.`,
    keys: ['Health', 'Agriculture', 'Forests', 'Water resources', 'Coastal areas', 'Species', 'sea-level rise', 'salinity intrusion', 'Cyclones', 'floods', 'migration'],
    lists: ['l-climate-impacts', 'l-climate-bd-impacts'],
    src: 'RM L1-3 p61–62; Bangladesh specifics: textbook',
    Fig: undefined,
  },
  {
    id: 'a-climate-ghg',
    topic: T,
    q: 'Write short notes on greenhouse gases and their effects.',
    seen: ['2015-16'],
    a: `### Greenhouse effect
Solar short-wave radiation is partly reflected, mostly absorbed by the surface and atmosphere. The warmed earth re-radiates **long-wave infrared**; some passes out, but most is **absorbed and radiated back by greenhouse gases**, warming the lower atmosphere. This natural effect keeps the earth at about 15 °C instead of −18 °C: GHGs are essential to our climate.

### Greenhouse gases
1. **CO₂**: fossil fuel burning, deforestation, cement.
2. **CH₄**: paddy, livestock, landfills, gas leaks.
3. **N₂O**: fertiliser, combustion.
4. **SF₆** and **PFCs**: industrial gases, very long-lived, strong absorbers.
5. **Water vapour**: the most abundant, amplifies the warming of the others.

### Effects
1. Global **warming**: rising air and ocean temperature.
2. **Sea-level rise**, melting glaciers, coastal inundation and salinity.
3. Changes in rainfall, more extreme weather (floods, droughts, cyclones).
4. Effects on health, agriculture, forests, water resources and species.`,
    keys: ['long-wave infrared', 'absorbed', 'radiated back', 'CO₂', 'CH₄', 'N₂O', 'SF₆', 'PFCs', 'Water vapour', 'sea-level rise', 'warming'],
    lists: ['l-climate-ghg', 'l-climate-impacts'],
    src: 'RM L1-3 p56–57, p61',
    Fig: GreenhouseFig,
  },
  {
    id: 'a-climate-vapour',
    topic: T,
    q: 'Explain the role of water vapour in global warming.',
    seen: ['2020-21', '2022-23'],
    a: `### Water vapour as a feedback
1. Water vapour is a **greenhouse gas**: it absorbs heat radiated from the earth and prevents it escaping to space.
2. As CO₂ and CH₄ increase, the **temperature rises**, which increases **evaporation** from water and land.
3. **Warmer air holds more moisture**, and vapour does not condense and precipitate out as easily at higher temperature, so its concentration rises.
4. More vapour **absorbs more heat**, warming the atmosphere further, which gives even more vapour: a **positive feedback loop**.
5. Scientists estimate that this effect **more than doubles** the warming caused by the increased CO₂ alone.
6. Water vapour therefore **amplifies** the warming started by other gases rather than starting it.

Loop: more CO₂ → higher air temperature → more vapour in the air → more greenhouse warming → higher temperature.`,
    keys: ['greenhouse gas', 'evaporation', 'Warmer air holds more moisture', 'positive feedback loop', 'more than doubles', 'absorbs'],
    lists: ['l-climate-vapour-loop'],
    src: 'RM L1-3 p59',
  },
  {
    id: 'a-climate-agri-health',
    topic: T,
    q: 'State the impacts of climate change on agriculture and human health.',
    seen: ['2022-23'],
    a: `### Agriculture
1. Change in **crop yields**: heat stress and shorter growing seasons lower yield of rice and wheat; CO₂ may help some crops.
2. Higher **irrigation demand** as temperature and evaporation rise and rainfall becomes erratic.
3. **Salinity** of soil and water on the coast from sea-level rise; floods and drought destroy crops; new pests.
4. Loss of food security and farm income.

### Human health
1. **Weather-related mortality**: heat waves, floods and cyclones.
2. **Infectious diseases**: water-borne (cholera, diarrhoea) and vector-borne (malaria, dengue) spread as temperature and rainfall change.
3. **Air-quality related respiratory illness**, asthma.
4. Malnutrition and mental stress from displacement and loss of crops.`,
    keys: ['crop yields', 'irrigation demand', 'Salinity', 'Weather-related mortality', 'Infectious diseases', 'respiratory illness'],
    lists: ['l-climate-impacts'],
    src: 'RM L1-3 p61 (headings); detail: textbook',
  },
  {
    id: 'a-climate-nexus',
    topic: T,
    q: 'Explain the energy–environment nexus with an example. What are the solutions to the problems of this nexus?',
    seen: ['Jan 2021', '2022-23', '2021-22'],
    a: `### The nexus
1. There is a **strong relationship between energy and environment**.
2. **Resource consumption** (land, water, minerals) is huge in energy production: coal mining, hydropower dams, cooling water of power plants, biofuel land.
3. Energy production and use cause major **environmental problems**: **acid rain, global warming, smog** and health problems such as asthma and cancer.
4. In return the environment and water sector need energy: pumping, treating and distributing water; IEA 2016: energy used by the water sector rises 130% and water used for energy 59% from 2014 to 2040. Climate variability sits at the centre of the water–energy–land nexus.

### Example
A coal power plant in Bangladesh uses large volumes of **cooling water** and land, emits CO₂ (global warming), SO₂ (acid rain) and fly ash; the same plant's electricity runs the **deep tubewells and WASA pumps** that supply water, so a water shortage hits power and a power cut hits water supply.

### Solutions: switch, reduce, capture
1. **Switch** to renewable energy (solar, wind, hydro, biomass); BUET's 3.5 MW rooftop solar covers about 30% of its demand.
2. **Reduce** consumption: energy efficiency, conservation, leak control and water saving.
3. **Capture** carbon and gases (carbon capture, landfill and digester gas, carbon sinks).
4. Integrated planning of water, energy and land, and clean technology policy.`,
    keys: ['strong relationship', 'Resource consumption', 'acid rain', 'global warming', 'smog', 'cooling water', 'Switch', 'Reduce', 'Capture', 'renewable'],
    lists: ['l-climate-nexus-stmts', 'l-climate-solutions'],
    src: 'RM L1-3 p75–79',
    Fig: NexusFig,
  },
  {
    id: 'a-climate-energy-bd',
    topic: T,
    q: 'Describe the energy situation of Bangladesh. Show the relationship between energy use and water consumption with examples.',
    seen: ['2021-22'],
    a: `### Energy situation of Bangladesh
1. **Main sources**: natural gas, oil, biomass, coal, LNG, LPG, solar, hydropower, wind.
2. **Installed capacity** (SREDA 2026), total 32,457 MW: gas 38.4%, coal 19.3%, HFO 17.4%, captive 8.6%, imported 8.3%, **renewable 5.6%**, HSD 2.4%. The country depends on **fossil fuel** and imported fuel.
3. **Renewable** 1807 MW: solar 1514 MW (83.8%), hydro 230 MW, wind 62 MW, biogas and biomass under 1 MW; on-grid 1429 MW, off-grid 379 MW.
4. Initiatives: first floating solar PV (10 kWp) on the Mongla water treatment reservoir, a planned 50 MW floating solar plant at Barapukuria pit lakes, **BUET rooftop solar 3.5 MW**.

### Energy use and water consumption
1. **Energy for water**: pumping groundwater (Dhaka WASA pumps 3.3 million m³ a day), treatment, distribution, desalination (RO needs electricity), and wastewater treatment.
2. **Water for energy**: cooling of thermal power plants, hydropower, fuel extraction and biofuel crops.
3. The IEA expects water-sector energy use to rise **130%** and energy-sector water use **59%** between 2014 and 2040.
4. Saving one saves the other: leak control and efficient pumps save water and electricity.`,
    keys: ['natural gas', 'renewable', 'solar', 'SREDA', 'Initiatives', 'Energy for water', 'Water for energy', 'cooling', '130%'],
    lists: ['l-climate-bd-energy'],
    src: 'RM L1-3 p70–76',
  },
  {
    id: 'a-climate-renew-challenges',
    topic: T,
    q: 'What are the challenges of using renewable energy in Bangladesh?',
    seen: ['2022-23'],
    a: `### Challenges
1. **Land scarcity**: one of the most densely populated countries, and solar and wind farms need large areas (floating solar on ponds and rooftop solar are the answer).
2. **High initial cost**: renewables have a high capital cost (slide: initial cost is high in most cases) against cheap known fossil technology.
3. **Intermittency**: sun and wind are not continuous (no solar at night, monsoon cloud), so **storage** and backup are needed.
4. **Limited resources**: low wind speed, flat terrain, very little hydro potential (230 MW at Kaptai).
5. **Technology and skills**: recent and advanced technology, imported equipment, shortage of skilled people and maintenance.
6. **Grid integration** and weak policy, tariff and financing support.
Share now: renewable is only **5.6%** (1807 MW) of 32,457 MW, 84% of it solar.`,
    keys: ['Land scarcity', 'initial cost', 'Intermittency', 'storage', 'wind', 'Technology', 'Grid integration', '5.6%'],
    lists: ['l-climate-bd-renew-challenges'],
    src: 'RM L1-3 p69–72; challenges: textbook / general',
  },
  {
    id: 'a-climate-engineer',
    topic: T,
    q: 'What is the role of an environmental engineer? How can an environmental engineer contribute to conserving and maintaining environmental quality? Describe with examples.',
    seen: ['2020-21', '2021-22', '2022-23'],
    a: `### Role of an environmental engineer
An environmental engineer applies engineering and science to **protect human health and the environment** and to use resources sustainably.
1. **Water supply and treatment**: select and protect sources, design intakes, treatment, transmission and distribution, prepare **water safety plans**; arsenic, salinity and iron removal in Bangladesh.
2. **Wastewater and sanitation**: collection, treatment and reuse; faecal sludge management.
3. **Solid and hazardous waste**: collection, recycling, landfill, safe disposal.
4. **Air pollution control**: emission control, brick kilns, vehicles.
5. **Climate change and energy**: mitigation (renewable energy, efficiency, carbon capture) and adaptation (rainwater harvesting, resilient water supply, flood and salinity protection); the energy–water nexus.
6. **EIA, monitoring and standards**: environmental impact assessment, water and air quality monitoring, compliance with national rules.
7. **Ecosystems**: protect biodiversity and wetlands, restore polluted rivers (Buriganga, Hazaribag tanneries).
8. **Public health and sustainable development**: reduce faecal-oral and water-borne disease, SDG 6, equity of services.`,
    keys: ['protect human health', 'Water supply and treatment', 'water safety plans', 'Wastewater', 'Solid and hazardous waste', 'Air pollution', 'mitigation', 'adaptation', 'EIA', 'SDG 6'],
    lists: ['l-climate-engineer'],
    src: 'textbook (Peavy; Davis) — not in the CE22 slides',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
