// ev-ws — the water supply system: elements, objectives, sources, hydrologic cycle, ground vs surface water (Snigdha ma'am L1).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-ws' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const water = 'var(--c-water)'
const accent = 'var(--c-accent)'
const sn = 'var(--c-sn)'
const good = 'var(--c-good)'
const soil = 'var(--c-soil)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 12 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

// ---------- figures ----------
/** elements of a water supply system: source, collection, treatment, distribution */
const ElementsFig: FC = () => {
  const Box = ({ x, y, w, h, l1, l2, col }: { x: number; y: number; w: number; h: number; l1: string; l2?: string; col: string }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={panel2} stroke={col} strokeWidth={2} />
      <Tx x={x + w / 2} y={y + (l2 ? h / 2 - 3 : h / 2 + 4)} t={l1} b s={12} />
      {l2 && <Tx x={x + w / 2} y={y + h / 2 + 13} t={l2} c={mute} s={11} />}
    </g>
  )
  const Arrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={2} markerEnd="url(#ws-ar)" />
  return (
    <svg viewBox="0 0 760 330" width="100%" role="img" aria-label="Elements of a water supply system">
      <defs>
        <marker id="ws-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      {/* sources */}
      <Box x={10} y={20} w={150} h={64} l1="Surface water" l2="river, lake, reservoir" col={water} />
      <Box x={10} y={120} w={150} h={64} l1="Groundwater" l2="aquifer, spring" col={soil} />
      <Box x={10} y={220} w={150} h={64} l1="Alternatives" l2="rain, waste, storm, sea" col={mute} />
      <Tx x={85} y={308} t="1  SOURCE" b c={sn} />
      {/* collection */}
      <Box x={215} y={20} w={150} h={64} l1="Intake + intake main" l2="(pumping if needed)" col={water} />
      <Box x={215} y={120} w={150} h={64} l1="Deep tubewell" l2="well + pump" col={soil} />
      <Box x={215} y={220} w={150} h={64} l1="Roof / ground catchment" l2="storage tank" col={mute} />
      <Tx x={290} y={308} t="2  COLLECTION" b c={sn} />
      {/* treatment */}
      <Box x={420} y={90} w={130} h={110} l1="Treatment plant" l2="screen, settle, filter, disinfect" col={accent} />
      <Tx x={485} y={308} t="3  TREATMENT" b c={sn} />
      {/* distribution */}
      <Box x={605} y={20} w={145} h={50} l1="Pump + transmission" l2="main" col={good} />
      <Box x={605} y={95} w={145} h={50} l1="Service reservoir" l2="ground / elevated" col={good} />
      <Box x={605} y={170} w={145} h={50} l1="Distribution pipes" l2="valves, hydrants, meters" col={good} />
      <Box x={605} y={245} w={145} h={40} l1="Consumers" col={good} />
      <Tx x={677} y={308} t="4  DISTRIBUTION" b c={sn} />
      <Arrow x1={160} y1={52} x2={213} y2={52} />
      <Arrow x1={160} y1={152} x2={213} y2={152} />
      <Arrow x1={160} y1={252} x2={213} y2={252} />
      <Arrow x1={365} y1={52} x2={418} y2={120} />
      <Arrow x1={365} y1={152} x2={418} y2={145} />
      <Arrow x1={365} y1={252} x2={418} y2={170} />
      <Arrow x1={550} y1={145} x2={603} y2={50} />
      <Arrow x1={677} y1={70} x2={677} y2={93} />
      <Arrow x1={677} y1={145} x2={677} y2={168} />
      <Arrow x1={677} y1={220} x2={677} y2={243} />
    </svg>
  )
}

/** the hydrologic cycle */
const HydroFig: FC = () => (
  <svg viewBox="0 0 720 330" width="100%" role="img" aria-label="The hydrologic cycle">
    <defs>
      <marker id="hc-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={water} />
      </marker>
    </defs>
    {/* sun */}
    <circle cx={660} cy={40} r={20} fill="none" stroke={accent} strokeWidth={2} />
    <Tx x={660} y={78} t="Sun (energy)" c={mute} s={11} />
    {/* clouds */}
    <path d="M230,70 q-10,-30 25,-30 q15,-25 45,-5 q35,-5 30,25 q-5,15 -25,12 h-60 q-20,3 -15,-2z" fill={panel2} stroke={ink} />
    <Tx x={285} y={62} t="Condensation (clouds)" s={11} />
    {/* mountain/land */}
    <path d="M330,250 L430,150 L470,175 L540,120 L720,250 z" fill={panel2} stroke={soil} strokeWidth={2} />
    <rect x={330} y={250} width={390} height={70} fill={soil} opacity={0.35} />
    <Tx x={560} y={290} t="Zone of saturation (groundwater)" s={11} />
    <line x1={330} y1={272} x2={720} y2={272} stroke={water} strokeDasharray="5 4" />
    <Tx x={715} y={266} a="end" t="water table" c={water} s={11} />
    {/* ocean */}
    <rect x={0} y={250} width={330} height={70} fill={water} opacity={0.35} />
    <Tx x={90} y={290} t="Ocean (97% of water)" s={12} b />
    {/* arrows */}
    <path d="M120,245 C120,170 170,110 225,80" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={85} y={165} t="Evaporation" s={11} />
    <path d="M300,85 C330,130 380,160 420,175" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={370} y={115} t="Precipitation" s={11} />
    <path d="M440,180 C400,215 360,235 320,250" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={365} y={222} t="Runoff to rivers" s={11} a="start" />
    <path d="M520,170 L520,265" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={528} y={215} t="Infiltration" s={11} a="start" />
    <path d="M610,268 C500,300 400,300 332,290" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={470} y={312} t="Groundwater flow to sea" s={11} />
    <path d="M610,165 C625,120 600,95 575,75" fill="none" stroke={water} strokeWidth={2} markerEnd="url(#hc-ar)" />
    <Tx x={640} y={130} t="Evapotranspiration" s={11} />
    <circle cx={585} cy={165} r={10} fill={good} opacity={0.5} />
    <Tx x={585} y={190} t="plants" c={mute} s={11} />
  </svg>
)

// ---------- lists ----------
const lists: EvList[] = [
  {
    id: 'l-ws-objectives',
    topic: T,
    title: 'Objectives of a water supply system',
    ask: 'State the objectives of a water supply system.',
    points: [
      { k: 'Make water easily available', alt: ['easily accessible', 'close to home'], d: 'near the consumer' },
      { k: 'Adequate quantity, 24 hours a day', alt: ['24 hours a day, 365 days a year', 'adequate quantity', 'sufficient quantity', 'continuous supply'], d: 'at least the minimum needs of the individual' },
      { k: 'Safe and wholesome water', alt: ['safe water', 'wholesome water', 'safe and potable water'], d: 'safe = does no harm; wholesome = unpolluted and free from toxic and excess mineral or organic matter' },
      { k: 'Provide for emergencies', alt: ['fire fighting', 'firefighting', 'emergency provision'], d: 'fire fighting, festivals, meetings' },
      { k: 'Provide for future demands', alt: ['future demand', 'future growth'], d: 'population growth, higher standard of living, storage and conveyance' },
      { k: 'Prevent pollution at source, storage and conveyance', alt: ['prevent pollution', 'prevent contamination'] },
      { k: 'Maintain treatment units and distribution system', alt: ['operation and maintenance', 'O&M'], d: 'in good condition with adequate staff and materials' },
      { k: 'Economical and reliable system', alt: ['economical design', 'reliable and economical'] },
    ],
    hook: 'Easy, Enough, Edible, Emergency, Expansion, Protection, Maintenance, Money.',
    seen: ['2008-09'],
    src: 'SN L1 p4',
  },
  {
    id: 'l-ws-elements',
    topic: T,
    title: 'Elements of a water supply system',
    ask: 'What are the (major) elements of a water supply system?',
    points: [
      { k: 'Source of water supply', alt: ['source', 'sources'], d: 'surface water, groundwater, alternatives (rain, waste, storm, sea water)' },
      { k: 'Collection system', alt: ['collection works', 'intake and intake main', 'collection'], d: 'intake + intake main for surface water; deep tubewell for groundwater' },
      { k: 'Water treatment plant', alt: ['treatment plant', 'treatment', 'purification'], d: 'remove suspended solids, colour, bacteria; Fe, Mn, As and hardness for Bangladesh groundwater' },
      { k: 'Water distribution system', alt: ['distribution system', 'distribution', 'transmission and distribution'], d: 'pipes, storage reservoirs, pumps, hydrants, valves, meters' },
    ],
    ordered: true,
    hook: 'Source, Collect, Clean, Carry: the water travels in that order.',
    seen: ['2007-08', '2010-11', '2015-16', '2017-18', '2020-21', '2023-24'],
    src: 'SN L1 p5',
  },
  {
    id: 'l-ws-dist-parts',
    topic: T,
    title: 'Parts of the distribution system',
    points: [
      { k: 'Pipes', alt: ['pipes to convey water'], d: 'convey the water to the consumer' },
      { k: 'Storage reservoirs', alt: ['reservoirs', 'service reservoirs'], d: 'aid in the distribution' },
      { k: 'Pumps and pumping equipment', alt: ['pumps'] },
      { k: 'Fire hydrants, valves, meters and other appurtenances', alt: ['hydrants', 'valves', 'meters', 'appurtenances'] },
    ],
    seen: [],
    src: 'SN L1 p8',
  },
  {
    id: 'l-ws-sources',
    topic: T,
    title: 'Sources of water for a water supply system',
    ask: 'What are the different sources of water for a water supply system?',
    points: [
      { k: 'Surface water', alt: ['river', 'lake', 'impounding reservoir', 'stream'], d: 'rivers, streams, lakes, ponds, impounding reservoirs' },
      { k: 'Groundwater', alt: ['ground water', 'tubewell', 'dug well', 'spring'], d: 'dug well, production well (tubewell), spring' },
      { k: 'Rainwater harvesting', alt: ['rain water', 'rainwater'], d: 'where there is no fresh water on the surface' },
      { k: 'Wastewater resources', alt: ['waste water', 'reclaimed wastewater'] },
      { k: 'Storm water resources', alt: ['storm water', 'stormwater'] },
      { k: 'Saltwater resources', alt: ['sea water', 'desalination', 'salt water'] },
      { k: 'Ice cap water resources', alt: ['ice cap', 'glacier', 'ice'] },
    ],
    seen: ['2012-13', '2015-16'],
    src: 'SN L1 p5',
    note: 'The slide groups the last five as "alternate options where no fresh water is available on the surface".',
  },
  {
    id: 'l-ws-source-choice',
    topic: T,
    title: 'Considerations when choosing a source of water',
    points: [
      { k: 'Quantity', alt: ['yield', 'adequate quantity'], d: 'enough for the design period, including dry-season flow or water-level fluctuation' },
      { k: 'Quality', alt: ['water quality'], d: 'safe, or treatable at reasonable cost' },
      { k: 'Cost', alt: ['cost to supply', 'economy'], d: 'capital and running cost of collection, treatment and pumping' },
      { k: 'Accessibility', alt: ['distance', 'location'], d: 'how far it is from the consumers' },
    ],
    seen: [],
    src: 'SN L1 p8; Delwar sir note',
  },
  {
    id: 'l-ws-devel',
    topic: T,
    title: 'Development considerations of a water supply system',
    ask: 'Discuss briefly the essential elements (steps) in designing a water supply system.',
    points: [
      { k: 'Estimate the water demand', alt: ['estimation of water demand', 'water demand', 'estimate demand'], d: 'first step, with provision for future requirements' },
      { k: 'Select the water supply source', alt: ['selection of source', 'select source'], d: 'cost to supply, water-level fluctuation, accessibility' },
      { k: 'Water collection system', alt: ['collection system', 'design of collection works'] },
      { k: 'Treatment plant design', alt: ['design treatment plant', 'treatment plant'] },
      { k: 'Transmission and distribution system', alt: ['distribution system', 'transmission main'] },
      { k: 'Organisational set-up for operation and maintenance', alt: ['organizational set up', 'operation and maintenance', 'O&M'], d: 'efficient operation and maintenance of the system' },
    ],
    ordered: true,
    hook: 'Demand, Source, Collect, Treat, Distribute, Manage.',
    seen: ['2008-09', '2021-22'],
    src: 'SN L1 p8',
  },
  {
    id: 'l-ws-design-elements',
    topic: T,
    title: 'Essential design elements of a water supply system',
    points: [
      { k: 'Design period', alt: ['period of design'], d: 'for how many years the system is built' },
      { k: 'Design population', alt: ['population'], d: 'for how many people' },
      { k: 'Design flow', alt: ['per capita demand', 'design demand'], d: 'per-capita use and flow' },
      { k: 'Design area', alt: ['area to be served'], d: 'for which area' },
    ],
    seen: ['2008-09', '2021-22'],
    src: 'Delwar sir note (seniors)',
    note: 'Not in this term’s slides; the slides give the six "development considerations" instead. Write both.',
  },
  {
    id: 'l-ws-treatment-methods',
    topic: T,
    title: 'Common treatment methods',
    points: [
      { k: 'Screening', alt: ['screen'] },
      { k: 'Sedimentation', alt: ['settling', 'plain sedimentation'] },
      { k: 'Aeration' },
      { k: 'Treatment with chemicals', alt: ['coagulation', 'chemical treatment'] },
      { k: 'Filtration', alt: ['filter'] },
      { k: 'Demineralization', alt: ['demineralisation'] },
      { k: 'Disinfection', alt: ['chlorination'], d: 'needed in almost all systems' },
    ],
    seen: [],
    src: 'SN L1 p8',
  },
  {
    id: 'l-ws-hydro',
    topic: T,
    title: 'Stages of the hydrologic cycle',
    ask: 'Name the processes of the hydrologic cycle in order.',
    points: [
      { k: 'Evaporation', alt: ['evapotranspiration', 'evaporation and transpiration'], d: 'from oceans, seas, open water and (transpiration) plants' },
      { k: 'Condensation', alt: ['cloud formation', 'clouds'], d: 'vapour rises, cools and forms clouds' },
      { k: 'Precipitation', alt: ['rain', 'rainfall'], d: 'rain, hail, sleet, snow' },
      { k: 'Runoff and infiltration', alt: ['surface runoff', 'infiltration', 'percolation'], d: 'over land to rivers, or down into the ground' },
      { k: 'Groundwater flow', alt: ['ground water flow', 'subsurface flow'], d: 'moves slowly towards rivers and the sea' },
      { k: 'Return to the ocean', alt: ['back to ocean', 'discharge to ocean'] },
    ],
    ordered: true,
    seen: ['2012-13', '2015-16', '2016-17', '2017-18', 'Jan 2021', '2021-22', '2007-08'],
    src: 'SN L1 p3 (stages) ; labels are the standard ones',
  },
  {
    id: 'l-ws-gw-merits',
    topic: T,
    title: 'Merits of groundwater as a source',
    points: [
      { k: 'Clear, colourless, low suspended solids', alt: ['free from suspended solids', 'clear'], d: 'filtered by the soil' },
      { k: 'Free from pathogens (deep aquifer)', alt: ['free from microorganisms', 'bacteriologically safe'], d: 'microorganisms filtered out in the upper layers' },
      { k: 'Little treatment needed', alt: ['less treatment', 'no extensive treatment'], d: 'usually disinfection, plus Fe / Mn / As removal where needed' },
      { k: 'Uniform quality and temperature', alt: ['constant quality'] },
      { k: 'Deep aquifer yield is uniform and reliable', alt: ['reliable', 'drought resistant', 'dependable yield'] },
      { k: 'Available close to the point of use', alt: ['no long transmission', 'cheap collection'], d: 'wells can be sunk anywhere there is an aquifer' },
    ],
    seen: ['2008-09', '2009-10', '2020-21'],
    src: 'SN L1 p6; benefits of the clear, uniform water follow from the textbook',
  },
  {
    id: 'l-ws-gw-demerits',
    topic: T,
    title: 'Demerits of groundwater as a source',
    points: [
      { k: 'High dissolved solids and hardness', alt: ['hardness', 'high TDS', 'minerals'], d: 'universal solvent: Ca, Mg, Na, Cl, SO₄, HCO₃' },
      { k: 'Iron, manganese and arsenic', alt: ['arsenic', 'Fe Mn As'], d: 'geogenic, mainly the shallow aquifer in Bangladesh' },
      { k: 'Rapid depletion by over-extraction', alt: ['declining water table', 'depletion', 'over pumping'], d: 'Dhaka and the Barind Tract' },
      { k: 'Salinity in coastal areas', alt: ['salinity', 'salt water intrusion'] },
      { k: 'Pumping cost and deeper wells', alt: ['pumping cost', 'energy cost'], d: 'DTWs now go to 1,200 ft in Dhaka' },
      { k: 'Faecal contamination of shallow wells', alt: ['pit latrine leaching', 'faecal coliform'] },
    ],
    seen: ['2008-09', '2009-10', '2020-21'],
    src: 'SN L1 p4–7',
  },
  {
    id: 'l-ws-sw-merits',
    topic: T,
    title: 'Merits of surface water as a source',
    points: [
      { k: 'Abundant in the wet season', alt: ['abundant', 'large quantity'], d: 'large rivers (Padma, Meghna, Sitalakhya) discharge far more than any withdrawal' },
      { k: 'Low dissolved minerals', alt: ['soft', 'low hardness', 'no Fe Mn As'], d: 'usually no iron, manganese or arsenic problem' },
      { k: 'Does not deplete the aquifer', alt: ['no aquifer depletion', 'protects groundwater'], d: 'relieves the falling water table in Dhaka' },
      { k: 'Large quantity at one place', alt: ['large scale supply', 'suitable for big cities'] },
    ],
    seen: ['2008-09', '2020-21'],
    src: 'SN L1 p5–6',
  },
  {
    id: 'l-ws-sw-demerits',
    topic: T,
    title: 'Demerits of surface water as a source',
    points: [
      { k: 'Polluted by industrial and municipal waste', alt: ['pollution', 'polluted', 'contamination'], d: 'worse in the dry season when the flow is low' },
      { k: 'High suspended solids and turbidity', alt: ['turbidity', 'suspended solids'], d: 'runoff in the wet season' },
      { k: 'Pathogens and organic matter', alt: ['microorganisms', 'bacteria'] },
      { k: 'Extensive treatment needed', alt: ['expensive treatment', 'clarification and disinfection'], d: 'clarification and disinfection at least' },
      { k: 'Seasonal flow variation', alt: ['flow fluctuation', 'dry season shortage'], d: 'small rivers and ponds may fail in the dry season' },
      { k: 'High capital cost of intake and plant', alt: ['high cost', 'capital cost'] },
    ],
    seen: ['2008-09', '2020-21'],
    src: 'SN L1 p4–6',
  },
  {
    id: 'l-ws-planning',
    topic: T,
    title: 'Factors in planning a water supply for a new township',
    ask: 'State the factors to be considered in planning the water supply of a new township (Uttara 3rd phase).',
    points: [
      { k: 'Population and growth', alt: ['future population', 'design population'], d: 'present and at the end of the design period' },
      { k: 'Water demand', alt: ['per capita demand', 'fire demand'], d: 'domestic, commercial, public, losses, fire' },
      { k: 'Source and its yield', alt: ['source of supply', 'availability of source'], d: 'Turag river nearby; groundwater below' },
      { k: 'Water quality and treatment needs', alt: ['quality of water', 'treatment'] },
      { k: 'Collection, storage and distribution system', alt: ['distribution layout', 'storage'] },
      { k: 'Topography and land use of the area', alt: ['topography', 'land use', 'road layout'], d: 'decides gravity feed, layout and pipe sizes' },
      { k: 'Cost and funds available', alt: ['economy', 'cost'] },
      { k: 'Operation and maintenance organisation', alt: ['O&M', 'management'] },
    ],
    seen: ['2009-10', 'Jan 2021'],
    src: 'SN L1 p8 (development considerations), Delwar sir note (planning steps); site items from the question',
    note: 'The slides have no list titled "planning factors"; this is the development-considerations list adapted to a new township.',
  },
  {
    id: 'l-ws-env',
    topic: T,
    title: 'Groups of the environment',
    points: [
      { k: 'Physico-chemical environment', alt: ['physical chemical environment'], d: 'soil, geology, topography, water, air, climate' },
      { k: 'Biological environment', alt: ['biological'], d: 'flora, fauna, species diversity, ecosystem stability' },
      { k: 'Cultural environment', alt: ['cultural'], d: 'historic and archaeological sites, aesthetic resources' },
      { k: 'Socio-economic environment', alt: ['socio economic', 'social'], d: 'people, economic indicators, transport, water supply, waste disposal' },
    ],
    seen: [],
    src: 'SN L1 p1',
    note: 'First two = natural environment; last two = man-made.',
  },
]

// ---------- cards ----------
const cards: EvCard[] = [
  { id: 'c-ws-hydro-def', topic: T, front: 'Define the **hydrologic cycle**.', back: 'The circulation of water in its liquid, vapour or solid state from the oceans to the air, air to land, over land surfaces or underground, and back to the oceans. All water comes as precipitation.', seen: ['2015-16', '2016-17', '2017-18'], src: 'SN L1 p3' },
  { id: 'c-ws-hydro-why', topic: T, front: 'Why is the hydrologic cycle important to water supply engineering?', back: 'It is the only renewal mechanism of all sources: rain feeds rivers, lakes and aquifers. It shows that surface water and groundwater are linked, quantifies the available yield, and shows how pollution and over-use in one part reach the others.', seen: ['2015-16', '2016-17', '2017-18'], src: 'SN L1 p3; textbook' },
  { id: 'c-ws-97', topic: T, front: 'How is the Earth’s water divided between salt and fresh water?', back: '97% is salt water, 3% is fresh. Slightly over two thirds of the fresh water is frozen in glaciers and ice caps; most of the rest is groundwater.', src: 'SN L1 p3' },
  { id: 'c-ws-first-rain', topic: T, front: 'Why does the first rain have the most contaminants?', back: 'It acts as a "vacuum cleaner": it washes dust, gases and other pollutants out of the air and off the surface.', src: 'SN L1 p3' },
  { id: 'c-ws-safe-whole', topic: T, front: 'Safe water vs wholesome water?', back: '**Safe**: does not cause any harm on consumption. **Wholesome**: unpolluted, significantly free from toxic substances and from an excess of mineral and organic matter that could impair its quality.', seen: ['2008-09'], src: 'SN L1 p4' },
  { id: 'c-ws-public', topic: T, front: 'What is public water supply?', back: 'Water withdrawn by public and private water suppliers and delivered to users: cities, towns, military bases, apartment complexes, parks.', src: 'SN L1 p4' },
  { id: 'c-ws-pollution', topic: T, front: 'Define pollution (Clean Water Act wording).', back: '"The man-made or man-induced alteration of the physical, biological, chemical and radiological integrity of water and other media."', src: 'SN L1 p2' },
  { id: 'c-ws-envengg', topic: T, front: 'Define environmental engineering.', back: 'The application of science and engineering principles to improve the environment (air, water, land), to provide healthful water, air and land for human habitation and other organisms, and to remediate polluted sites. It also studies natural systems.', src: 'SN L1 p2' },
  { id: 'c-ws-gw-def', topic: T, front: 'Define groundwater.', back: 'Water in the saturation zone (pores completely filled) below the earth’s surface in a soil formation: the only subsurface water that readily flows to a well.', seen: ['2008-09'], src: 'SN L1 p6, L3 p3' },
  { id: 'c-ws-sw-impurities', topic: T, front: 'What two kinds of impurity does surface water carry?', back: 'Suspended (SS, microorganisms, organic matter) and dissolved (minerals). It is usually polluted and needs clarification and disinfection.', src: 'SN L1 p5' },
  { id: 'c-ws-as-limit', topic: T, front: 'WHO arsenic limit and the two big problems of shallow groundwater in Bangladesh?', back: 'WHO limit 10 µg/L. Problems: (1) widespread arsenic above it, (2) rapid fall of groundwater storage in big cities (Dhaka) and intensely irrigated areas (Barind Tract).', seen: ['2017-18'], src: 'SN L1 p9' },
  { id: 'c-ws-stw-def', topic: T, front: 'What is a "shallow tubewell" in the National Hygiene Survey?', back: 'One that is less than 250 feet deep. Survey (rural sources): shallow TW / tara 51%, deep TW / tara 30%, tap inside dwelling 8.1%, tap outside 7.5%, protected dug well or spring 1.1%.', src: 'SN L1 p9' },
  { id: 'c-ws-dates', topic: T, front: 'Key dates in Bangladesh water supply.', back: 'First Dhaka water works 1874 (Nawab Abdul Ghani, Chandni Ghat, 39 MLD). Hand-pump tubewells from 1928. Dhaka WASA set up 1963. Groundwater pushed in the late 1970s–80s to avoid pathogenic surface water: about 10 million tubewells.', src: 'SN L1 p9' },
  { id: 'c-ws-dhaka', topic: T, front: 'Dhaka’s water supply in numbers.', back: 'Demand 3,200–3,250 MLD, WASA production 2,950–3,000 MLD (shortfall about 250 MLD). Over 80% from groundwater. About 1,330 DTWs; average depth 800 ft, pumps now going to 1,200 ft.', seen: ['2008-09'], src: 'SN L1 p9–10' },
  { id: 'c-ws-rain', topic: T, front: 'Bangladesh rainfall and the quality of rainwater.', back: 'Average 2,200–2,800 mm a year, 75% from May to September; under 1,500 mm in the west. Rainwater is soft (very low dissolved solids) with a flat taste and usually free of contamination, but may pick up impurities in tanks, so it needs disinfection.', src: 'SN L1 p7–8' },
  { id: 'c-ws-gw-sw', topic: T, front: 'How are groundwater and surface water linked?', back: 'Groundwater feeds rivers in the dry season; surface water recharges the ground in the monsoon. Large-scale groundwater irrigation lowers the water table and can dry up surface sources.', src: 'SN L1 p3' },
  { id: 'c-ws-gw-quality', topic: T, front: 'Why does groundwater have high dissolved solids but little suspended matter?', back: 'Water is a universal solvent and picks up Ca, Mg, Na, Cl, SO₄, HCO₃, Fe, Mn, As as it flows through the formation, while the soil filters out suspended solids and microorganisms (deep groundwater is usually pathogen-free).', src: 'SN L1 p6' },
  { id: 'c-ws-sw-gw-quantity', topic: T, front: 'Shallow vs deep aquifer as a source (quantity)?', back: 'Shallow aquifer: easy to reach but temporary; depletes in the dry season, arsenic-prone. Deep aquifer: uniform, more reliable yield, usually safer water but costly to drill.', src: 'SN L1 p6, L4b p4' },
]

// ---------- answers ----------
const answers: EvAnswer[] = [
  {
    id: 'a-ws-elements',
    topic: T,
    q: 'Discuss briefly, with a sketch, the elements of a water supply system.',
    seen: ['2007-08', '2010-11', '2015-16', '2017-18', '2020-21', '2023-24'],
    a: String.raw`### Four major elements
1. **Source of water supply**: surface water (river, lake, impounding reservoir) and groundwater (dug well, tubewell, spring). Where there is no fresh surface water use alternatives: rainwater harvesting, wastewater, storm water, sea water, ice-cap water.
2. **Collection system**: an **intake and intake main** (with pumping) for surface water; a **deep tubewell** for groundwater; a roof or clean ground catchment for rainwater.
3. **Water treatment plant**: surface water for suspended solids, colour and bacteria; Bangladesh groundwater for Fe, Mn, As and hardness. Methods: screening, sedimentation, aeration, chemicals, filtration, demineralization and **disinfection** (needed in almost every system).
4. **Water distribution system**: delivers the required quantity at satisfactory pressure: **pipes**, **storage reservoirs**, **pumps**, **fire hydrants, valves and meters**.

### How it works
Water flows source, collection, treatment, then by transmission main to a service reservoir and through the distribution network to the consumer. Sketch the flow diagram below with these four labelled blocks.`,
    keys: ['Source', 'Collection', 'Treatment', 'Distribution', 'intake', 'deep tubewell', 'disinfection', 'storage reservoirs', 'hydrants'],
    lists: ['l-ws-elements', 'l-ws-sources', 'l-ws-dist-parts', 'l-ws-treatment-methods'],
    src: 'SN L1 p5, p8',
    Fig: ElementsFig,
  },
  {
    id: 'a-ws-objectives',
    topic: T,
    q: 'State the objectives of a water supply system.',
    seen: ['2008-09'],
    a: String.raw`### Objectives
1. **Easily available**: close to the consumers.
2. **Adequate quantity**: at least the minimum needs, **24 hours a day, 365 days a year**; pump, storage and distribution capacity must suffice.
3. **Safe and wholesome**: safe = no harm on consumption; wholesome = unpolluted, free from toxic substances and excess mineral or organic matter.
4. **Emergencies**: provision for fire fighting, festivals, meetings.
5. **Future demand**: population growth, higher living standard, storage and conveyance.
6. **Prevent pollution** at source, in storage and in conveyance.
7. **Maintain** treatment units and the distribution system, with adequate staff and materials.
8. **Economical and reliable** design.`,
    keys: ['easily available', 'adequate quantity', 'safe', 'wholesome', 'emergencies', 'future', 'prevent pollution', 'economical'],
    lists: ['l-ws-objectives'],
    src: 'SN L1 p4',
  },
  {
    id: 'a-ws-design',
    topic: T,
    q: 'Discuss briefly the essential elements (considerations) for designing a water supply system.',
    seen: ['2008-09', '2021-22'],
    a: String.raw`### Design elements
**Design period** (for how many years), **design population** (for how many people), **design flow** (per-capita use) and **design area** (the area served).

### Development considerations, in order
1. **Estimate the water demand**: first step, with provision for future requirements (Q = P·q at the end of the design period).
2. **Select the source**: cost to supply, water-level fluctuation, accessibility, quantity and quality.
3. **Collection system**: intake and intake main, or deep tubewell.
4. **Treatment plant design** for the raw water quality.
5. **Transmission and distribution system**: pipes, reservoirs, pumps, layout.
6. **Organisational set-up** for efficient operation and maintenance.

### Factors fixing the design period
Useful life of structures and equipment; ease or difficulty of extension; funds available and initial cost; performance in the early years; population growth rate; shifts in the community; industrial and commercial development.`,
    keys: ['design period', 'design population', 'design flow', 'design area', 'Estimate the water demand', 'Select the source', 'Treatment plant', 'distribution', 'operation and maintenance'],
    lists: ['l-ws-devel', 'l-ws-design-elements'],
    src: 'SN L1 p8; design elements and period factors from Delwar sir note',
  },
  {
    id: 'a-ws-sources',
    topic: T,
    q: 'What are the different sources of water for a water supply system?',
    seen: ['2012-13', '2015-16'],
    a: String.raw`### Sources
1. **Surface water**: rivers, streams, lakes, ponds, impounding reservoirs. Abundant in the wet season but polluted and variable; needs clarification and disinfection. Dhaka, Chittagong, Rajshahi and Khulna use it partly.
2. **Groundwater**: dug wells, production wells (tubewells), springs. Clear, little microbial load, but high dissolved solids (Fe, Mn, As in Bangladesh); deep aquifers are reliable.
3. **Rainwater harvesting**: soft and relatively clean; important in the Chittagong Hill Tracts, coastal areas and the Barind.
4. **Wastewater** resources: reclaimed after treatment.
5. **Storm water** resources.
6. **Saltwater** resources: desalination of sea water.
7. **Ice-cap water** resources.
Items 3–7 are the alternatives where no fresh surface water is available.`,
    keys: ['Surface water', 'Groundwater', 'Rainwater harvesting', 'Wastewater', 'Storm water', 'Saltwater', 'Ice-cap'],
    lists: ['l-ws-sources'],
    src: 'SN L1 p5–8',
  },
  {
    id: 'a-ws-hydro',
    topic: T,
    q: 'Explain the hydrologic cycle with a diagram and say why it is important.',
    seen: ['2007-08', '2012-13', '2015-16', '2016-17', '2017-18', 'Jan 2021', '2021-22'],
    a: String.raw`### The cycle
The **hydrologic cycle** is the continuous circulation of water in its liquid, vapour or solid state from the oceans to the air, air to land, over or under the land surface, and back to the oceans.
1. **Evaporation** from oceans, seas and open water, plus **transpiration** from plants (evapotranspiration), driven by solar energy.
2. **Condensation**: vapour rises, cools and forms **clouds**.
3. **Precipitation**: rain, hail, sleet, snow. All water comes as precipitation.
4. **Runoff** over the land to streams and rivers, and **infiltration** into the soil to recharge the **groundwater**.
5. **Groundwater flow** towards rivers and the sea, and surface flow back to the **ocean**.

### Why it is important
- It is the **renewal mechanism** of every source, so it limits the safe yield of a supply.
- It links surface water and groundwater: groundwater feeds rivers in the dry season; river water recharges aquifers in the monsoon; heavy pumping lowers the water table and dries surface sources.
- It explains how pollution moves between air, water and soil (the first rain picks up the most contaminants).
- It guides planning for floods, droughts and recharge.`,
    keys: ['Evaporation', 'transpiration', 'Condensation', 'Precipitation', 'Runoff', 'infiltration', 'groundwater', 'ocean', 'renewal'],
    lists: ['l-ws-hydro'],
    src: 'SN L1 p3; the importance points are textbook',
    Fig: HydroFig,
  },
  {
    id: 'a-ws-sw-gw',
    topic: T,
    q: 'Compare groundwater and surface water as a source of municipal water supply (merits and demerits, quality, quantity).',
    seen: ['2008-09', '2009-10', '2017-18', '2020-21', 'Jan 2021', '2021-22'],
    a: String.raw`### Comparison
| | Groundwater | Surface water |
|---|---|---|
| **Quality** | Clear, little suspended matter, usually free of microorganisms in deep aquifers; **high dissolved solids** (hardness, **Fe, Mn, As** in Bangladesh) | High **suspended solids** and microbes in the wet season; polluted by industrial and municipal waste, worse in the dry season |
| **Quantity** | Shallow aquifer easy but temporary; deep aquifer uniform and **reliable**; but over-extraction causes **depletion** (Dhaka, Barind) | **Abundant** in the wet season; small bodies fail in the dry season; large rivers far exceed withdrawals |
| **Treatment** | Little: disinfection, plus Fe / Mn / As and hardness removal | **Extensive**: clarification and disinfection |
| **Cost** | Cheap collection near the user; pumping cost rises as water level falls | High capital cost of intake and plant |
| **Other** | Salinity in coastal areas; faecal contamination of shallow wells | Seasonal flow variation; upstream development changes quality |

### Merits of groundwater over surface water
1. Needs little treatment, so low treatment cost and a safer, uniform product.
2. Free from suspended solids and (deep) pathogens.
3. Reliable yield in drought and available near the point of use.

### Demerits
1. Dissolved minerals and Fe, Mn, As.
2. Falling water table, depletion and rising pumping cost.
3. Salinity and shallow-well contamination.`,
    keys: ['Quality', 'Quantity', 'suspended solids', 'dissolved solids', 'Fe, Mn, As', 'depletion', 'Extensive', 'reliable', 'Treatment'],
    lists: ['l-ws-gw-merits', 'l-ws-gw-demerits', 'l-ws-sw-merits', 'l-ws-sw-demerits'],
    src: 'SN L1 p4–7',
  },
  {
    id: 'a-ws-planning',
    topic: T,
    q: 'State the factors to be considered in planning the water supply of a new township (Uttara 3rd phase, near the river Turag).',
    seen: ['2009-10', 'Jan 2021'],
    a: String.raw`### Factors
1. **Population and growth**: present and at the end of the design period (new area: from the planned plots and densities).
2. **Water demand**: domestic (BNBC lpcd by income group), commercial and public use, losses and wastage, **fire demand**.
3. **Source and its yield**: Turag river nearby (surface water, seasonal, polluted) against groundwater below (reliable but Fe / As / depletion risk); the dry-season minimum.
4. **Water quality and treatment**: what treatment the chosen source needs.
5. **Collection, storage and distribution system**: intake or deep tubewells, service reservoirs, layout (grid iron suits a planned road pattern), pressure.
6. **Topography and land use**: decide gravity feed, zoning, pipe routes, hydrant locations.
7. **Cost and funds**: initial and running cost, phasing of the work.
8. **Operation and maintenance**: an organisation (RAJUK / WASA) and trained staff.
9. **Sustainability**: rainwater harvesting and recharge for the apartment blocks.`,
    keys: ['Population', 'demand', 'fire demand', 'Source', 'quality', 'distribution', 'Topography', 'Cost', 'maintenance'],
    lists: ['l-ws-planning', 'l-ws-devel'],
    src: 'SN L1 p8 and Delwar sir note; site-specific items adapted by us',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
