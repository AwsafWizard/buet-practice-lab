// ev-bdws — water supply in Bangladesh: coverage and gaps, SDG 6 and target 6.1, service ladder, problem areas and their options (Rowshan ma'am L4–L5).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-bdws' as const
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

/** drinking water service ladder, five rungs from surface water up to safely managed */
const LadderFig: FC = () => {
  const rungs = [
    { t: 'No service', d: 'river, canal, lake, pond, irrigation canal (surface water)', c: bad },
    { t: 'Unimproved', d: 'unprotected dug well, spring', c: bad },
    { t: 'Limited', d: 'improved source, round trip more than 30 min incl. queuing', c: accent },
    { t: 'Basic', d: 'improved source, round trip within 30 min (MDG target)', c: accent },
    { t: 'Safely managed', d: 'improved, on premises, available when needed, free of faecal and priority contamination (SDG target)', c: good },
  ]
  return (
    <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Drinking water service ladder">
      {rungs.map((r, i) => {
        const x = 20 + i * 62
        const y = 270 - i * 56
        return (
          <g key={r.t}>
            <rect x={x} y={y} width={620 - x} height={50} rx={5} fill={panel2} stroke={r.c} strokeWidth={2} />
            <Tx x={x + 10} y={y + 20} t={r.t} a="start" b />
            <Tx x={x + 10} y={y + 38} t={r.d.length > 78 ? r.d.slice(0, 76) + '…' : r.d} a="start" s={11} c={mute} />
          </g>
        )
      })}
      <Tx x={26} y={322} t="step up from surface water to safely managed water (SDG 6.1)" a="start" c={mute} s={11} />
    </svg>
  )
}

/** salt-water intrusion: fresh-water lens, the 1:40 rule and up-coning under a pumped well */
const SaltFig: FC = () => (
  <svg viewBox="0 0 640 380" width="100%" role="img" aria-label="Salt water intrusion in coastal aquifers">
    <Tx x={320} y={16} t="(a) Natural equilibrium: fresh-water lens floats on salt water" b />
    <rect x={30} y={28} width={580} height={30} fill={soil} opacity={0.35} />
    <Tx x={80} y={48} t="ground surface" a="start" s={10.5} />
    <rect x={30} y={58} width={420} height={50} fill={water} opacity={0.4} />
    <Tx x={240} y={86} t="fresh groundwater" />
    <rect x={30} y={108} width={580} height={60} fill={bad} opacity={0.22} />
    <Tx x={280} y={142} t="salt groundwater" />
    <rect x={450} y={58} width={160} height={50} fill={bad} opacity={0.22} />
    <Tx x={530} y={86} t="sea" />
    <line x1={30} x2={450} y1={66} y2={66} stroke={ink} strokeDasharray="4 3" />
    <Tx x={34} y={78} t="water table" a="start" s={10.5} />
    <line x1={450} x2={450} y1={58} y2={108} stroke={ink} />
    <Tx x={440} y={100} t="h" a="end" b />
    <path d="M450,108 Q300,140 120,108" fill="none" stroke={ink} strokeDasharray="3 3" />
    <Tx x={320} y={182} t="Ghyben–Herzberg: salt water lies about 40 h below sea level for a fresh-water head h above it (ρs/ρf = 1.025)" s={11} c={mute} />
    <Tx x={320} y={222} t="(b) Pumping disturbs the balance: the salt water cones up under the well" b />
    <rect x={30} y={234} width={580} height={24} fill={soil} opacity={0.35} />
    <rect x={30} y={258} width={580} height={46} fill={water} opacity={0.4} />
    <rect x={30} y={304} width={580} height={56} fill={bad} opacity={0.22} />
    <rect x={312} y={214} width={12} height={110} fill="none" stroke={ink} strokeWidth={2} />
    <Tx x={318} y={210} t="well" s={10.5} />
    <path d="M214,258 Q318,282 422,258" fill="none" stroke={ink} strokeDasharray="4 3" />
    <Tx x={440} y={274} t="cone of depression" a="start" s={10.5} />
    <path d="M150,304 Q318,252 486,304" fill="none" stroke={bad} strokeWidth={2.4} />
    <Tx x={500} y={318} t="inverted cone of salt water" a="start" s={10.5} c={bad} />
    <Tx x={110} y={282} t="fresh water" s={11} />
    <Tx x={110} y={340} t="salt water" s={11} />
    <Tx x={320} y={376} t="about 40 ft of salt-water rise for 1 ft of fresh-water drawdown; remedy: radial wells, recharge wells" s={11} c={mute} />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-bdws-aims',
    topic: T,
    title: 'What a water supply system must do',
    points: [
      { k: 'Provide potable water to ensure public health', alt: ['potable water', 'public health'] },
      { k: 'Supply water in adequate quantity and pressure', alt: ['adequate quantity and pressure'] },
      { k: 'Make water accessible to the users', alt: ['accessible', 'accessibility'] },
    ],
    seen: [],
    src: 'RM L4 p3',
  },
  {
    id: 'l-bdws-uses',
    topic: T,
    title: 'Water uses',
    points: [{ k: 'Domestic' }, { k: 'Agricultural', alt: ['agriculture', 'irrigation'] }, { k: 'Industrial', alt: ['industry'] }, { k: 'Commercial' }, { k: 'Fire fighting', alt: ['firefighting'] }],
    seen: [],
    src: 'RM L4 p4',
  },
  {
    id: 'l-bdws-design',
    topic: T,
    title: 'Design considerations of a water supply system',
    ask: 'What are the design considerations of a water supply system?',
    points: [
      { k: 'Present and future population', alt: ['population'] },
      { k: 'Water demand', alt: ['demand'] },
      { k: 'Quality of water', alt: ['water quality'] },
      { k: 'Design period' },
      { k: 'Selecting sources, traditional sources preferable', alt: ['selection of source', 'source selection'] },
      { k: 'Location and siting of treatment plant and intake', alt: ['location of intake', 'siting of treatment plant'] },
      { k: 'Optimisation through alternative plans and cost-benefit analysis', alt: ['optimization', 'cost benefit analysis'] },
      { k: 'Construction, operation and maintenance by local technical staff', alt: ['local staff for O&M'] },
      { k: 'Mechanisation, instrumentation and automation (hardy, reliable, local equipment)', alt: ['automation', 'mechanization'] },
      { k: 'Minimum construction and operation cost', alt: ['minimum cost'] },
      { k: 'Minimum use of pumping and chemicals', alt: ['minimum pumping and chemicals'] },
      { k: 'Planned together with the community', alt: ['community participation', 'local conditions and preferences'] },
      { k: 'Incorporate the views of women', alt: ['women participation', 'gender'] },
      { k: 'Sustainable planning, design and pricing', alt: ['sustainability', 'sustainable system'] },
    ],
    hook: 'Count them: People, Demand, Quality, Period, Source, Siting, Options, Local O&M, Mechanise, Cheap, Less pump/chemicals, Community, Women, Sustainable.',
    seen: [],
    src: 'RM L4 p6–7',
  },
  {
    id: 'l-bdws-concern',
    topic: T,
    title: 'Why Bangladesh water supply is a concern',
    points: [
      { k: 'Climate change and weather variability', alt: ['climate change'], d: 'flood, cyclone, drought' },
      { k: 'Salinity intrusion', alt: ['salinity'] },
      { k: 'Increasing demand' },
      { k: 'Depletion of groundwater resource', alt: ['groundwater depletion'] },
      { k: 'Declining flow in many rivers', alt: ['declining river flow'] },
      { k: 'Rapid urbanisation', alt: ['rapid urbanization'] },
      { k: 'Pollution of water sources', alt: ['pollution'] },
      { k: 'Water quality' },
      { k: 'Hard to reach areas', alt: ['HtR areas'] },
    ],
    seen: [],
    src: 'RM L4 p12',
  },
  {
    id: 'l-bdws-sdg6',
    topic: T,
    title: 'SDG 6 targets 6.1 to 6.6',
    ask: 'State SDG 6 and target 6.1 (and the other targets).',
    points: [
      { k: '6.1 Safe and affordable drinking water for all', alt: ['6.1', 'drinking water'], d: 'universal and equitable access by 2030' },
      { k: '6.2 Sanitation and hygiene, end open defecation', alt: ['6.2', 'sanitation'], d: 'special attention to women, girls and the vulnerable' },
      { k: '6.3 Water quality, wastewater treatment and reuse', alt: ['6.3', 'water quality'], d: 'reduce pollution, halve untreated wastewater' },
      { k: '6.4 Water-use efficiency and water scarcity', alt: ['6.4', 'water use efficiency'] },
      { k: '6.5 Integrated water resources management', alt: ['6.5', 'IWRM'], d: 'including trans-boundary cooperation' },
      { k: '6.6 Protect and restore water-related ecosystems', alt: ['6.6', 'ecosystems'], d: 'mountains, forests, wetlands, rivers, aquifers, lakes' },
    ],
    hook: 'Drink, Sanitise, Quality, Efficiency, IWRM, Ecosystems.',
    seen: ['2020-21', '2022-23'],
    src: 'RM L4 p18–22',
    note: 'SDG 6: "Ensure availability and sustainable management of water and sanitation for all". 6.a and 6.b are not in the slides.',
  },
  {
    id: 'l-bdws-61-words',
    topic: T,
    title: 'Target 6.1 key words: safe, equitable, affordable',
    points: [
      { k: 'Safe', d: 'free from pathogens and elevated levels of toxic chemicals at all times' },
      { k: 'Equitable', d: 'progressive reduction and elimination of inequalities between population sub-groups' },
      { k: 'Affordable', d: 'payment does not become a barrier to access or prevent meeting other basic human needs' },
    ],
    seen: ['2020-21', '2023-24'],
    src: 'RM L4 p23',
  },
  {
    id: 'l-bdws-ladder',
    topic: T,
    title: 'Drinking water service ladder',
    ask: 'Describe the Drinking Water Service Ladder.',
    ordered: true,
    points: [
      { k: 'No service (surface water)', alt: ['no service', 'surface water'], d: 'river, canal, lake, pond, irrigation canal' },
      { k: 'Unimproved service', alt: ['unimproved'], d: 'unprotected dug well, spring' },
      { k: 'Limited service', alt: ['limited'], d: 'improved source, round trip more than 30 minutes including queuing' },
      { k: 'Basic service', alt: ['basic'], d: 'improved source, round trip not more than 30 minutes (MDG target)' },
      { k: 'Safely managed water', alt: ['safely managed'], d: 'improved, on premises, available when needed, free of faecal and priority contamination (SDG target)' },
    ],
    hook: 'No, Un, Limited, Basic, Safe: bottom to top.',
    seen: ['2023-24'],
    src: 'RM L4 p24',
  },
  {
    id: 'l-bdws-challenges61',
    topic: T,
    title: 'Specific challenges in achieving target 6.1',
    ask: 'What are the challenges for Bangladesh in achieving SDG 6.1?',
    points: [
      { k: 'Widespread pollution of surface water', alt: ['surface water pollution'] },
      { k: 'Arsenic contamination of groundwater', alt: ['arsenic'] },
      { k: 'Re-emergence of microbial contamination in tubewell water', alt: ['microbial contamination', 'faecal contamination of tubewells'] },
      { k: 'Salinity in the coastal belt', alt: ['salinity'] },
      { k: 'Issue of equity', alt: ['equity'] },
    ],
    hook: 'Pollution, Arsenic, Microbes, Salinity, Equity (P-A-M-S-E).',
    seen: ['2020-21', '2022-23', '2023-24'],
    src: 'RM L4 p27',
  },
  {
    id: 'l-bdws-gaps',
    topic: T,
    title: 'Water gaps in Bangladesh (equity issues)',
    ask: 'Describe the equity issue in the water supply sector of Bangladesh.',
    points: [
      { k: 'Rapid and uneven urbanisation, informal settlements', alt: ['informal settlements', 'uneven urbanization'], d: 'inter-city and intra-city gaps' },
      { k: '35% of city people in slums', alt: ['slums'], d: 'on only 4% of the land; low sanitation coverage' },
      { k: 'Piped coverage gap: Dhaka 85%, Chittagong 41%', alt: ['piped water coverage gap'] },
      { k: 'Supply hours: 12 h (Chittagong), 22 h (Dhaka)', alt: ['supply hours'] },
      { k: 'Consumption gap: 20 to 400 lpcd', alt: ['consumption pattern gap'] },
      { k: 'Fixed water rate encourages wasteful use', alt: ['fixed water rate'] },
      { k: 'Poor slum dwellers without piped water pay more', alt: ['poor pay more'] },
      { k: 'Almost 90% of supply is groundwater; Dhaka 78%', alt: ['groundwater dependence'] },
      { k: 'Going deeper and too far is not sustainable', alt: ['not sustainable'] },
    ],
    seen: ['2020-21', '2021-22'],
    src: 'RM L4 p33–34',
  },
  {
    id: 'l-bdws-actions',
    topic: T,
    title: 'Action plans by 2030',
    ask: 'What measures are undertaken to overcome the challenges?',
    points: [
      { k: 'Use of surface water sources from 5% to 40%', alt: ['surface water 5% to 40%'] },
      { k: 'Managed aquifer recharge (MAR) from 100 to 300', alt: ['managed aquifer recharge', 'MAR'] },
      { k: 'Pond excavation and re-excavation from 100 to 4100', alt: ['pond excavation'] },
      { k: 'WASH blocks at schools', alt: ['WASH block'] },
    ],
    seen: ['2020-21', '2022-23'],
    src: 'RM L4 p39',
  },
  {
    id: 'l-bdws-htr',
    topic: T,
    title: 'Hard to Reach (HtR) areas',
    ask: 'Define and list the Hard to Reach (HtR) areas of Bangladesh.',
    points: [
      { k: 'Coastal areas', alt: ['coast'] },
      { k: 'Hilly areas', alt: ['hill'] },
      { k: 'Barind areas', alt: ['barind'] },
      { k: 'Char areas', alt: ['char'] },
      { k: 'Haor areas', alt: ['haor'] },
      { k: 'Tea gardens', alt: ['tea garden'] },
    ],
    hook: 'CHBCHT: Coast, Hill, Barind, Char, Haor, Tea.',
    seen: ['2023-24'],
    src: 'RM L5 p3',
    note: 'Definition: remote geographical locations with poor water and sanitation coverage, poor communication network and frequent natural calamities (GoB 2011).',
  },
  {
    id: 'l-bdws-problem-areas',
    topic: T,
    title: 'Quality and quantity problem areas',
    points: [{ k: 'High salinity areas' }, { k: 'Arsenic contaminated areas' }, { k: 'Drought prone areas' }, { k: 'Rocky soil formation areas' }, { k: 'Hard to reach areas (HtRs)', alt: ['HtR'] }],
    seen: [],
    src: 'RM L5 p2',
  },
  {
    id: 'l-bdws-coastal',
    topic: T,
    title: 'Water supply problems of coastal areas',
    ask: 'What are the challenges in water supply in coastal areas?',
    points: [
      { k: 'Salinity', d: 'most areas badly affected' },
      { k: 'Arsenic in shallow groundwater', alt: ['arsenic'], d: 'almost all coastal upazilas' },
      { k: 'Excessive iron', alt: ['iron'] },
      { k: 'Excessive manganese', alt: ['manganese'], d: 'above 0.4 mg/L' },
      { k: 'Microbial contamination (E. coli)', alt: ['E. coli', 'faecal contamination'], d: 'about 35% of Khulna division households' },
      { k: 'Fine sand: regular tubewell installation difficult', alt: ['fine sand'], d: 'shallow aquifer at 15–20 m' },
      { k: 'RO needs high cost, electricity and trained O&M', alt: ['high cost of RO'] },
    ],
    seen: ['Jan 2021', '2021-22'],
    src: 'RM L4 p31, L5 p4–6',
  },
  {
    id: 'l-bdws-coastal-opt',
    topic: T,
    title: 'Options for coastal areas',
    ask: 'State the potential options to overcome the problems of coastal areas.',
    points: [
      { k: 'Rainwater harvesting', alt: ['RWH'] },
      { k: 'Pond sand filter', alt: ['PSF'] },
      { k: 'Shallow shrouded tubewell (SST, VSST)', alt: ['SST', 'shrouded tubewell'] },
      { k: 'Deep hand tubewell', alt: ['deep tubewell', 'DTW', 'deep HTW'] },
      { k: 'Reverse osmosis / desalination plant', alt: ['RO', 'desalination', 'solar desalination'] },
      { k: 'Piped water supply', alt: ['piped supply'] },
      { k: 'Managed aquifer recharge (MAR)', alt: ['MAR'] },
      { k: 'Adaptive technology', alt: ['adaptive technologies'] },
    ],
    seen: ['Jan 2021', '2021-22'],
    src: 'RM L5 p20; L4 p31',
  },
  {
    id: 'l-bdws-hilly',
    topic: T,
    title: 'Water supply problems of hilly areas',
    points: [
      { k: 'High iron and manganese in groundwater', alt: ['iron and manganese'], d: 'generic in hilly aquifers' },
      { k: 'E. coli contamination', alt: ['E. coli', 'microbial contamination'], d: 'Chittagong 48%, Sylhet 62% of households' },
      { k: 'Tubewell sinking is difficult', alt: ['difficult drilling', 'rocky formation'] },
    ],
    seen: ['Jan 2021'],
    src: 'RM L5 p7',
  },
  {
    id: 'l-bdws-hilly-opt',
    topic: T,
    title: 'Options for hilly areas',
    points: [
      { k: 'Gravity flow system (GFS)', alt: ['gravity flow system', 'GFS'] },
      { k: 'Rainwater harvesting', alt: ['RWH'] },
      { k: 'Infiltration gallery (IFG)', alt: ['infiltration gallery'] },
      { k: 'Spring and chhara water', alt: ['spring', 'chhara'] },
      { k: 'Deep hand tubewell', alt: ['deep HTW', 'DTW'] },
      { k: 'Protection of surface water sources', alt: ['source protection'] },
      { k: 'Regulation of groundwater use and control of land use', alt: ['regulation of GW use'] },
    ],
    seen: ['Jan 2021'],
    src: 'RM L5 p20',
  },
  {
    id: 'l-bdws-haor',
    topic: T,
    title: 'Water supply problems of haor areas',
    points: [
      { k: 'Iron in groundwater is acute', alt: ['iron'] },
      { k: 'Arsenic above the Bangladesh standard', alt: ['arsenic'], d: 'even deeper aquifers in Chhatak and Sadar' },
      { k: 'Manganese in all upazilas', alt: ['manganese'] },
      { k: 'E. coli: 62% of Sylhet division households', alt: ['E. coli', 'microbial'] },
      { k: 'Extensive deep and prolonged flooding', alt: ['flooding', 'deep flooding'], d: 'high recharge but sources are submerged' },
    ],
    seen: ['2021-22'],
    src: 'RM L5 p9',
  },
  {
    id: 'l-bdws-haor-opt',
    topic: T,
    title: 'Options for haor areas',
    points: [
      { k: 'Deep hand tubewell', alt: ['deep HTW'] },
      { k: 'Deep tubewell (DTW)', alt: ['DTW', 'deep tubewell'] },
      { k: 'Arsenic-iron removal plant', alt: ['AIRP'] },
      { k: 'Dug well', alt: ['dug wells'] },
      { k: 'Rainwater harvesting', alt: ['RWH'], d: 'high rainfall; tank above flood level' },
      { k: 'Pond sand filter', alt: ['PSF'] },
    ],
    seen: ['2021-22'],
    src: 'RM L5 p20 (table) + textbook for RWH and PSF',
  },
  {
    id: 'l-bdws-barind',
    topic: T,
    title: 'Water supply problems of barind areas',
    points: [
      { k: 'Declining groundwater levels (quantity problem)', alt: ['declining groundwater level', 'quantity problem'] },
      { k: 'Clay top 2–20 m prevents recharge', alt: ['clay top'] },
      { k: 'Iron and manganese in groundwater', alt: ['iron and manganese'] },
      { k: 'Arsenic in some upazilas', alt: ['arsenic'], d: 'Paba, Mohanpur, Manda' },
      { k: 'E. coli: 31% of Rajshahi households', alt: ['E. coli'] },
      { k: 'Tubewell sinking difficult because of soil formation', alt: ['tubewell sinking difficult'] },
    ],
    seen: [],
    src: 'RM L5 p8',
  },
  {
    id: 'l-bdws-char',
    topic: T,
    title: 'Water supply problems of char areas',
    points: [
      { k: 'Low groundwater development in Meghna chars', alt: ['low groundwater development'] },
      { k: 'Arsenic and iron problems', alt: ['arsenic and iron'] },
      { k: 'Manganese in all char upazilas', alt: ['manganese'] },
      { k: 'Salinity in the deep aquifer (Chandpur)', alt: ['deep aquifer salinity'] },
      { k: 'Arsenic even in the deep aquifer (Hajiganj)', alt: ['arsenic in deep aquifer'] },
    ],
    seen: [],
    src: 'RM L5 p10',
  },
  {
    id: 'l-bdws-alt-tech',
    topic: T,
    title: 'Alternative water supply technologies for problem areas',
    points: [
      { k: 'Shallow shrouded tubewell (SST)', alt: ['SST'] },
      { k: 'Very shallow shrouded tubewell (VSST)', alt: ['VSST'] },
      { k: 'Pond sand filter (PSF)', alt: ['PSF'] },
      { k: 'Household filters', alt: ['household filter'] },
      { k: 'Infiltration gallery', alt: ['IFG'] },
      { k: 'Solar desalination', alt: ['desalination'] },
      { k: 'Rainwater harvesting', alt: ['RWH'] },
    ],
    hook: 'SST, VSST, PSF, Household filter, Gallery, Solar desal, RWH.',
    seen: ['2012-13', '2020-21'],
    src: 'RM L5 p11',
  },
  {
    id: 'l-bdws-ars-tech',
    topic: T,
    title: 'Arsenic removal technologies shown',
    points: [
      { k: 'Stevens Institute two-bucket unit', alt: ['two bucket', 'Stevens'] },
      { k: 'DPHE-Danida fill and draw unit', alt: ['fill and draw'] },
      { k: 'Community unit: mixing, flocculation, sedimentation, up-flow filtration', alt: ['community arsenic removal unit'] },
      { k: 'SIDKO plant (AdsorpAs granular ferric hydroxide)', alt: ['SIDKO', 'AdsorpAs'] },
      { k: 'Arsenic-iron removal plant (AIRP)', alt: ['AIRP'] },
    ],
    seen: ['2021-22'],
    src: 'RM L5 p16–19',
  },
  {
    id: 'l-bdws-psf-parts',
    topic: T,
    title: 'Parts of a pond sand filter',
    points: [
      { k: 'Raw water from the pond', alt: ['pond water'] },
      { k: 'Filter chamber with raw water above the sand', alt: ['filter chamber'] },
      { k: 'Filter sand', alt: ['sand bed'] },
      { k: 'Coarse aggregate', alt: ['gravel'] },
      { k: 'Under-drainage system', alt: ['underdrain'] },
      { k: 'Clear water tank with handpump', alt: ['clear water tank'] },
    ],
    seen: ['2020-21'],
    src: 'RM L5 p14',
  },
  {
    id: 'l-bdws-gw-problems',
    topic: T,
    title: 'Problems of groundwater development in Bangladesh',
    ask: 'What are the main problems of groundwater development in Bangladesh?',
    points: [
      { k: 'Arsenic contamination', alt: ['arsenic'], d: 'mostly shallow aquifers' },
      { k: 'Declining groundwater level', alt: ['decline in groundwater storage', 'depletion'], d: 'Dhaka, barind; Dhaka water table falls about 2 m a year' },
      { k: 'Excessive iron', alt: ['iron'] },
      { k: 'Salinity in the coastal area', alt: ['salinity'], d: 'sea-level rise and heavy pumping' },
      { k: 'Faecal bacteria in shallow tubewells', alt: ['microbial contamination', 'faecal contamination'] },
      { k: 'Rocky or stony layers in the hills', alt: ['hard rock layers', 'difficult drilling'] },
    ],
    hook: 'A-D-I-S-F-R: Arsenic, Decline, Iron, Salinity, Faecal, Rock.',
    seen: ['2007-08', '2010-11', '2017-18', '2023-24'],
    src: 'SN L4b p6; RM L4 p12, p27–29',
  },
  {
    id: 'l-bdws-salinity-ch',
    topic: T,
    title: 'Salinity challenges in the coastal belt',
    points: [
      { k: 'Rainwater and pond water remain major sources', alt: ['rainwater and pond water'] },
      { k: 'RO units installed by DPHE and NGOs', alt: ['reverse osmosis'] },
      { k: 'High installation cost; needs electricity and trained O&M', alt: ['high cost'] },
      { k: 'Cost is the important issue', alt: ['cost'] },
      { k: 'Solar desalination units (household scale)', alt: ['solar desalination'] },
    ],
    seen: [],
    src: 'RM L4 p31',
  },
]

const cards: EvCard[] = [
  { id: 'c-bdws-rural', topic: T, front: 'Rural water supply in Bangladesh: key numbers.', back: 'Coverage **87%**; more than **99% by point source** (tubewells), under 1% piped; over **10 million tubewells**; about 1.329 million public water points, one per about **89 persons**; groundwater is the predominant source.', src: 'RM L4 p16 (JMP 2015, DPHE 2016)' },
  { id: 'c-bdws-urban', topic: T, front: 'Urban water supply in Bangladesh: key numbers.', back: 'Coverage **87%**; **piped 32%** (136 of 310 paurashavas have piped supply), point source 55%; DWASA has 661 deep tubewells and over 2000 private ones; surface-water treatment is rising as groundwater falls and arsenic spreads.', src: 'RM L4 p17' },
  { id: 'c-bdws-safely', topic: T, front: 'Safely managed drinking water (JMP 2024)?', back: 'Urban **54.1%**, rural **62.3%**, total **59.1%** (the slide prints urban lower than rural). 6.1.1 is the SDG indicator: proportion using safely managed drinking water services.', src: 'RM L4 p25, p35' },
  { id: 'c-bdws-gap', topic: T, front: 'How does the slide show "wide coverage but wide gap"?', back: 'Coverage is 87% but only about 59% is **safely managed**; arsenic cut coverage from 97% to 74% (DPHE 2010-11); piped supply is low (rural under 1%); big gaps between cities, slums and income groups.', seen: ['2021-22'], src: 'RM L4 p16–28' },
  { id: 'c-bdws-as', topic: T, front: 'Arsenic in Bangladesh groundwater: the figures.', back: 'Detected in **1993**; coverage dropped to **74% from 97%** (DPHE 2010-11); **12.4%** exposed above the BD standard (50 ppb), **24.8%** above the WHO value (10 ppb); still the biggest obstacle to safe water coverage.', seen: ['2021-22', '2023-24'], src: 'RM L4 p28' },
  { id: 'c-bdws-fecal-as', topic: T, front: 'Why does fixing arsenic raise a microbial problem?', back: 'van Geen (2011): faecal contamination of shallow tubewells is **inversely related to arsenic**, so low-arsenic wells are more prone to faecal contamination. The tubewell, the backbone of safe supply, may face challenges without research.', src: 'RM L4 p29' },
  { id: 'c-bdws-dhaka', topic: T, front: 'Dhaka groundwater facts.', back: 'DWASA pumps **3.3 million m³ a day** (20 Mirpur-stadium volumes); water table falls about **2 m a year**; groundwater gives **78%** of Dhaka supply; GW use: drinking 97%, irrigation 80%.', src: 'RM L4 p13–15' },
  { id: 'c-bdws-scarce', topic: T, front: 'Is Bangladesh water scarce?', back: 'About **700 rivers**, rainfall about **2500 mm** a year, groundwater within 1–60 m, so in quantity no, but seasonal, polluted, saline or arsenic-laden: the problem is **quality and access**, plus falling river flows and depleting groundwater.', src: 'RM L4 p11–12' },
  { id: 'c-bdws-htr-def', topic: T, front: 'Define Hard to Reach (HtR) areas.', back: 'Remote geographical locations with **poor water and sanitation coverage, poor communication network and frequent natural calamities** (GoB 2011): coastal, hilly, barind, char, haor, tea gardens.', seen: ['2023-24'], src: 'RM L5 p3' },
  { id: 'c-bdws-sst', topic: T, front: 'What is a shallow shrouded tubewell (SST) and why is it used?', back: 'On the coast fresh water lies at **15–20 m** in very fine sand, so an ordinary tubewell would pump sand. **Artificial sand packing (shrouding)** around the screen keeps fine sand out. VSST draws from about **8 m**.', seen: ['2012-13'], src: 'RM L5 p12' },
  { id: 'c-bdws-psf', topic: T, front: 'What is a pond sand filter (PSF)?', back: 'A slow-sand-type filter that treats **pond water**: raw water over filter sand and coarse aggregate with an under-drain, then a clear-water tank with a hand pump. Used in coastal and char areas where groundwater is saline.', seen: ['2020-21'], src: 'RM L5 p14' },
  { id: 'c-bdws-ifg', topic: T, front: 'What is an infiltration gallery?', back: 'A buried trench placed **perpendicular to groundwater flow** beside a sandy river or pond; water filters through sand into the gallery and is drawn by a handpump tubewell in a sealed well, giving good sanitary protection.', src: 'RM L5 p15' },
  { id: 'c-bdws-hh-filter', topic: T, front: 'What are household filters in the slides?', back: 'Two kinds: a **three-pitcher (kolshi) stack** with two filter media layers, or a **single container** with filter media and a tap, giving filtered water at the bottom.', src: 'RM L5 p13' },
  { id: 'c-bdws-sidko', topic: T, front: 'SIDKO plant: what and how big?', back: 'A **community arsenic-removal** plant using AdsorpAs (granular activated ferric hydroxide); about 15 × 10 ft, stores 950 L, about 6000 L a day taken, cost about Tk 5 lakh with Tk 30,000 filter replacement.', src: 'RM L5 p18–19' },
  { id: 'c-bdws-ghyben', topic: T, front: 'What is the 1:40 rule for salt-water intrusion?', back: 'Hydrostatic balance (Ghyben–Herzberg): salt water lies about **40 times** the fresh-water head below sea level; pumping 1 ft of fresh-water drawdown raises the salt water cone about **40 ft**. Remedy: radial wells, recharge wells.', seen: ['2020-21', '2012-13'], src: 'RM L5 p4' },
  { id: 'c-bdws-mn', topic: T, front: 'Bangladesh standard for manganese in drinking water?', back: '**0.4 mg/L** (as quoted in the coastal slide). Many coastal, hilly, barind, haor and char upazilas exceed it.', src: 'RM L5 p5' },
  { id: 'c-bdws-halda', topic: T, front: 'Halda river: what is the SDG 6.6 example?', back: 'Restoration project: stopped sand lifting, plying of mechanised boats controlled, rubber dams lowered, fishing banned in a stretch to save brood fish, public awareness; 2018 a record year for fish-egg collection.', src: 'RM L4 p38' },
  { id: 'c-bdws-wastewater', topic: T, front: 'SDG 6.3 in Bangladesh: how much wastewater is treated?', back: 'Only Dhaka has a wastewater treatment facility and it serves **about 20%** of the city; many industries lack treatment; tannery relocation from Hazaribag.', src: 'RM L4 p36' },
  { id: 'c-bdws-transboundary', topic: T, front: 'Trans-boundary rivers of Bangladesh (SDG 6.5.2)?', back: '**57** rivers: 54 shared with India and 3 with Myanmar; the **Ganges treaty (1996)** runs to 2027, with flow at Farakka shared in ten-day periods from 1 January to 31 May.', src: 'RM L4 p37' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-bdws-gap',
    topic: T,
    q: '"Bangladesh has achieved a wide coverage in the water supply sector but there still remains a wide gap." Explain with examples.',
    seen: ['2021-22'],
    a: `### Wide coverage
1. **Coverage is 87%** both rural and urban (JMP 2015, DPHE 2016).
2. Rural: more than 99% by **point sources**, mainly the over **10 million tubewells**, one public water point per about 89 people.
3. Urban: point source 55%, piped 32%.

### Yet a wide gap
1. **Safely managed** water (on premises, when needed, free of contamination) reaches only about **59%** (JMP 2024); most others are only basic.
2. **Arsenic** (found 1993) cut coverage from 97% to **74%**; 12.4% of people are exposed above 50 ppb and 24.8% above the WHO 10 ppb; tubewells also show faecal contamination.
3. **Salinity** in the coastal belt and iron and manganese in hilly, barind, haor and char areas.
4. **Piped** supply is poor: Dhaka 85%, Chittagong 41%, Khulna 45%, municipal towns 40%; rural piped under 1%.
5. **Equity and urban gaps**: 35% of city people live in slums on 4% of land; supply hours 12 in Chittagong and Khulna against 22 in Dhaka; 20 lpcd in slums to 400 lpcd in rich areas.
6. **Groundwater dependence**: about 90% of supply, Dhaka 78%, with the water table falling about 2 m a year; surface water is polluted.`,
    keys: ['87%', 'point sources', 'Safely managed', 'Arsenic', '74%', 'Salinity', 'Piped', 'slums', 'Groundwater dependence'],
    lists: ['l-bdws-gaps', 'l-bdws-challenges61'],
    src: 'RM L4 p16–34',
  },
  {
    id: 'a-bdws-sdg',
    topic: T,
    q: 'State SDG 6 and target 6.1. What are the challenges to achieve this target and what measures are undertaken to overcome them?',
    seen: ['2020-21', '2022-23', '2023-24'],
    a: `### SDG 6 and target 6.1
1. **Goal 6**: ensure availability and sustainable management of water and sanitation for all.
2. **Target 6.1**: by 2030, achieve universal and equitable access to **safe and affordable drinking water for all**. **Safe**: free from pathogens and elevated toxic chemicals at all times. **Equitable**: inequalities between groups progressively reduced. **Affordable**: payment is not a barrier to access or to other basic needs.

### Challenges for Bangladesh
1. Widespread **pollution of surface water**.
2. **Arsenic** contamination of groundwater (coverage fell from 97% to 74%).
3. **Re-emergence of microbial contamination** in tubewell water.
4. **Salinity** in the coastal belt.
5. Issue of **equity** (slums, rural-urban, income, hard-to-reach areas).

### Measures
1. Raise use of **surface water** from 5% to 40% by 2030.
2. **Managed aquifer recharge** units from 100 to 300; **pond** excavation and re-excavation from 100 to 4100; WASH blocks at schools.
3. Alternative technologies for problem areas: RWH, PSF, SST, desalination, arsenic-iron removal plants; piped supply; **water safety plans**.
4. Protect sources, regulate groundwater, treat wastewater; target the poor and HtR areas.`,
    keys: ['Goal 6', 'safe and affordable drinking water', 'Safe', 'Equitable', 'Affordable', 'pollution of surface water', 'Arsenic', 'microbial contamination', 'Salinity', 'equity', 'managed aquifer recharge', '5% to 40%'],
    lists: ['l-bdws-sdg6', 'l-bdws-61-words', 'l-bdws-challenges61', 'l-bdws-actions'],
    src: 'RM L4 p18–39',
  },
  {
    id: 'a-bdws-equity',
    topic: T,
    q: 'Describe the equity issue in the water supply sector of Bangladesh. What would you do to overcome the challenges to achieve the SDG target?',
    seen: ['2020-21'],
    a: `### Equity issue (the water gaps)
1. **Rapid and uneven urbanisation** creates informal settlements and inter-city and intra-city gaps.
2. **35% of city people live in slums on 4% of the land**, with poor water and sanitation.
3. **Piped coverage**: Dhaka 85%, Chittagong 41%, Khulna 45%, municipal towns 40%; supply hours 12 against 22.
4. **Consumption gap**: 20 lpcd in low-income slums, about 400 lpcd in high-income areas; a **fixed water rate** wastes water in middle- and high-income areas.
5. **The poor pay more**: slum dwellers without a piped connection buy water at a higher unit price.
6. Rural, **hard-to-reach** and arsenic or salinity areas are left behind.

### Overcoming the challenges (my opinion)
1. Extend piped supply and **legal connections** to slums (community or prepaid taps); lifeline tariff with volumetric charges, so the poor pay less per unit and the rich do not waste.
2. Alternative options for HtR areas (RWH, PSF, SST, deep tubewells, desalination) and arsenic-iron removal.
3. Shift to **surface water** (5% to 40%), recharge aquifers, stop going deeper and too far.
4. Water safety plans, source protection, monitoring of equity indicators, and community and women participation.`,
    keys: ['Rapid and uneven urbanisation', '35%', 'Piped coverage', 'Consumption gap', 'fixed water rate', 'The poor pay more', 'hard-to-reach', 'surface water'],
    lists: ['l-bdws-gaps', 'l-bdws-actions'],
    src: 'RM L4 p33–34, p39; opinion part is general',
  },
  {
    id: 'a-bdws-ladder',
    topic: T,
    q: 'Describe the Drinking Water Service Ladder.',
    seen: ['2023-24'],
    a: `### The ladder (JMP service levels)
The ladder grades drinking-water service in five rungs, from the bottom:
1. **No service (surface water)**: drinking water from a river, canal, lake, pond or irrigation canal.
2. **Unimproved service**: from unprotected sources such as an unprotected dug well or spring.
3. **Limited service**: from an improved source but the **round trip takes more than 30 minutes** including queuing.
4. **Basic service**: improved source with a round trip of **not more than 30 minutes** including queuing (the **MDG** target).
5. **Safely managed water**: improved source **on premises, available when needed and free of faecal and priority contamination** (the **SDG** target 6.1).

Bangladesh: about 59% safely managed (urban 54.1%, rural 62.3%, JMP 2024); basic fills most of the rest.`,
    keys: ['No service', 'Unimproved service', 'Limited service', 'Basic service', 'Safely managed', '30 minutes', 'on premises', 'MDG', 'SDG'],
    lists: ['l-bdws-ladder'],
    src: 'RM L4 p24–25',
    Fig: LadderFig,
  },
  {
    id: 'a-bdws-htr',
    topic: T,
    q: 'Define and list the Hard to Reach (HtR) areas of Bangladesh.',
    seen: ['2023-24'],
    a: `### Definition
**HtR areas** are remote geographical locations with **poor water and sanitation coverage, poor communication network and frequent occurrence of natural calamities** (GoB 2011).

### The HtR areas
1. **Coastal areas**: salinity, arsenic, iron, manganese.
2. **Hilly areas**: iron and manganese, hard sinking of tubewells.
3. **Barind areas**: falling groundwater, clay top, iron and manganese.
4. **Char areas**: arsenic, iron, manganese, low development.
5. **Haor areas**: iron, arsenic, manganese, deep flooding.
6. **Tea gardens**.`,
    keys: ['poor water and sanitation coverage', 'poor communication network', 'natural calamities', 'Coastal', 'Hilly', 'Barind', 'Char', 'Haor', 'Tea gardens'],
    lists: ['l-bdws-htr'],
    src: 'RM L5 p3–10',
  },
  {
    id: 'a-bdws-coastal-hilly',
    topic: T,
    q: 'What are the challenges in water supply in coastal and hilly areas of Bangladesh? State the potential options to overcome the problems.',
    seen: ['Jan 2021', '2021-22'],
    a: `### Coastal areas
**Problems**
1. **Salinity**: most areas badly affected (rising sea level and pumping, tidal rivers).
2. **Arsenic** in the shallow groundwater of almost all coastal upazilas; **iron** and **manganese** (above 0.4 mg/L) in many; about 35% of Khulna division households have **E. coli** in drinking water.
3. Fresh water is at **15–20 m in very fine sand**, so ordinary tubewells are not feasible.
4. **RO** is costly and needs electricity and trained O&M.

**Options**: **rainwater harvesting**, **pond sand filter**, **shallow shrouded tubewell** (SST, VSST), **deep hand tubewell**, **desalination** (RO, solar desalination), piped water supply, **managed aquifer recharge**, adaptive technology.

### Hilly areas
**Problems**
1. **High iron and manganese** in groundwater everywhere in hilly aquifers.
2. **E. coli**: 48% of Chittagong and 62% of Sylhet division households.
3. **Sinking tubewells is difficult** (rocky formation).

**Options**: **gravity flow system** from springs and chhara, **rainwater harvesting**, **infiltration gallery**, deep hand tubewell, small-scale technologies, **protection of surface water sources**, regulation of groundwater use and land-use control.`,
    keys: ['Salinity', 'Arsenic', 'iron', 'manganese', 'E. coli', 'fine sand', 'rainwater harvesting', 'pond sand filter', 'shallow shrouded tubewell', 'desalination', 'gravity flow system', 'infiltration gallery'],
    lists: ['l-bdws-coastal', 'l-bdws-coastal-opt', 'l-bdws-hilly', 'l-bdws-hilly-opt'],
    src: 'RM L5 p4–7, p20; L4 p31',
  },
  {
    id: 'a-bdws-haor-ars',
    topic: T,
    q: 'State the problems associated with water supply and potential options for the haor region and the arsenic problem areas.',
    seen: ['2021-22'],
    a: `### Haor region
**Problems**
1. **Iron** in groundwater is acute; **manganese** in all upazilas.
2. **Arsenic** above the Bangladesh standard in all upazilas except Jagannathpur, even in deeper aquifers (Chhatak, Sadar); worst in Derai, Dharmapasha, Jamalganj.
3. **E. coli**: about 62% of Sylhet division households.
4. Extensive, deep and prolonged **flooding** submerges sources.

**Options**: **deep hand tubewell / deep tubewell** beyond the arsenic zone, **arsenic-iron removal plant**, dug well, flood-proof raised platforms, **rainwater harvesting** (high rainfall) and pond sand filters.

### Arsenic problem areas
**Problems**: arsenic (detected 1993) in shallow tubewells; coverage fell from 97% to 74%; 12.4% above 50 ppb, 24.8% above 10 ppb; the biggest obstacle to safe water coverage; low-arsenic wells tend to have faecal contamination.

**Options**
1. **Deep tubewells** and deep hand tubewells in uncontaminated aquifers.
2. **Arsenic removal technologies**: two-bucket (Stevens) unit, DPHE-Danida fill and draw, community unit (mixing, flocculation, sedimentation, up-flow filtration), **SIDKO plant** (granular ferric hydroxide), AIRP.
3. **Surface water** based piped supply, **pond sand filter**, rainwater harvesting, dug wells, infiltration gallery, managed aquifer recharge.
4. Testing and marking of wells, monitoring and **water safety plans**.`,
    keys: ['Iron', 'Arsenic', 'flooding', 'deep tubewell', 'arsenic-iron removal plant', '97% to 74%', 'SIDKO', 'pond sand filter', 'rainwater harvesting'],
    lists: ['l-bdws-haor', 'l-bdws-haor-opt', 'l-bdws-ars-tech'],
    src: 'RM L4 p28–29; L5 p9, p16–20',
  },
  {
    id: 'a-bdws-gw-problems',
    topic: T,
    q: 'What are the main problems of groundwater development in Bangladesh?',
    seen: ['2007-08', '2010-11', '2017-18', '2023-24'],
    a: `### Problems and obstacles
1. **Arsenic**: widespread, mainly in shallow aquifers; coverage fell from 97% to 74%; only about 1% of deep tubewells exceed the Bangladesh standard.
2. **Declining groundwater level and storage**: Dhaka (water table falls about 2 m a year, 3.3 million m³ a day pumped) and the barind tract (clay top limits recharge).
3. **Excessive iron** (above 1.0 mg/L in some shallow aquifers) and **manganese**.
4. **Salinity** in the coast, increased by sea-level rise and heavy pumping (salt-water intrusion).
5. **Faecal bacteria** in a substantial share of shallow tubewells, with low-arsenic wells the most contaminated.
6. **Rock or stony layers** in the hilly areas make drilling difficult; deeper wells cost more.
7. Heavy dependence on groundwater (about 90% of supply) without recharge or regulation; going deeper and too far is not sustainable.`,
    keys: ['Arsenic', 'Declining groundwater level', 'iron', 'Salinity', 'Faecal bacteria', 'Rock or stony layers', 'Dhaka', 'barind'],
    lists: ['l-bdws-gw-problems'],
    src: 'SN L4b p6; RM L4 p12–15, L5',
  },
  {
    id: 'a-bdws-saltwater',
    topic: T,
    q: 'Discuss briefly, with sketches, the salt water intrusion in the coastal areas of Bangladesh.',
    seen: ['2020-21', '2012-13'],
    a: `### Salt-water intrusion
1. Along the coast, a **lens of fresh groundwater floats on salt groundwater**. By **hydrostatic equilibrium** (Ghyben–Herzberg) the fresh column must be about 40 times as high as the head above sea level: salt water lies about **40 h** below sea level for a fresh-water head h above it.
2. **Pumping disturbs this equilibrium**: the water table falls in a cone of depression and an **inverted cone of salt water rises** under the well (about 40 ft of rise for 1 ft of drawdown).
3. **Causes** in Bangladesh: heavy abstraction, sea-level rise, tidal rivers carrying salt upstream, reduced dry-season flow, shrimp culture.
4. **Effects**: salinity of tubewells and ponds; Bangladesh standard is below 1 ppt (the dry-season map shows the south-west is worst); crops and health suffer.
5. **Remedies**: **radial wells** and **recharge wells**, pumping at low rates from the upper fresh layer, shallow shrouded tubewells, rainwater harvesting, PSF, desalination.`,
    keys: ['lens of fresh groundwater', 'hydrostatic equilibrium', '40 h', 'cone of depression', 'inverted cone', 'sea-level rise', 'radial wells', 'recharge wells'],
    lists: ['l-bdws-salinity-ch'],
    src: 'RM L5 p4–6; L4 p30–32',
    Fig: SaltFig,
  },
  {
    id: 'a-bdws-psf',
    topic: T,
    q: 'Write a short note on the pond sand filter.',
    seen: ['2020-21'],
    a: `### Pond sand filter (PSF)
1. **Purpose**: treat pond water (coastal, char and other areas where groundwater is saline, arsenic-rich or absent) to make a community or household supply.
2. **Parts**: raw water from the pond on top of the **filter sand**, **coarse aggregate** below it and an **under-drainage system**, then a **clear-water tank** fitted with a hand pump and tap.
3. **Working**: pond water seeps down through the sand by gravity, as in a slow sand filter; suspended solids and microbes are strained and biologically removed.
4. **Care**: protect the pond from bathing and washing, scrape the top layer and clean regularly; chlorinate for safety. Listed among the critical control points for a water safety plan.
5. **Limits**: needs O&M by the community; the pond water quality varies; poor with high turbidity or chemical contamination.`,
    keys: ['pond water', 'filter sand', 'coarse aggregate', 'under-drainage', 'clear-water tank', 'hand pump', 'slow sand filter'],
    lists: ['l-bdws-psf-parts'],
    src: 'RM L5 p14; L10 p21; operation: textbook',
  },
  {
    id: 'a-bdws-sst',
    topic: T,
    q: 'Write a short note on the shallow shrouded tubewell (SST).',
    seen: ['2012-13'],
    a: `### Shallow shrouded tubewell
1. **Why**: in coastal areas fresh water is available in shallow aquifers at **15–20 m**, but the **very fine sand** makes an ordinary tubewell impossible (it would pump sand).
2. **Shrouding**: **artificial sand packing** of suitable size is placed around the screen to prevent fine sand from entering it.
3. **Parts**: hand pump on a platform, clay seal, 38 mm PVC pipe, **900–1800 mm PVC strainer**, 700 mm sand trap, centralisers, 150 mm borehole, shrouding sand up to 1200 mm above the filter.
4. **VSST** (very shallow shrouded tubewell): the same, drawing from a shallower depth (**8 m**).
5. Total depth 15–20 m; a coastal option together with RWH and PSF.`,
    keys: ['15–20 m', 'very fine sand', 'shrouding', 'sand packing', 'strainer', 'sand trap', 'VSST', '8 m'],
    lists: ['l-bdws-alt-tech'],
    src: 'RM L5 p12',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
