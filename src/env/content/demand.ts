// ev-demand — kinds of demand, per-capita consumption and its factors, variations and peak factors, design period, fire demand, NRW (Snigdha ma'am L2, L5).
// Numbers (Q = P q, peak flow, fire flow) live in engine/demand.ts.
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-demand' as const

const lists: EvList[] = [
  {
    id: 'l-dem-types',
    topic: T,
    title: 'Types (categories) of water demand',
    ask: 'What are the types of water demand / the categories of water consumption?',
    points: [
      { k: 'Domestic use', alt: ['domestic'], d: 'drinking, sanitation, cooking, bathing, washing' },
      { k: 'Agricultural use', alt: ['agricultural', 'irrigation'], d: 'irrigation and livestock' },
      { k: 'Industrial, institutional and commercial use', alt: ['industrial and commercial', 'industrial', 'commercial'], d: 'offices, stores, hotels, mills, factories' },
      { k: 'Public use', alt: ['public'], d: 'schools, hospitals, jails, mosques, parks, street sprinkling, fountains' },
      { k: 'Firefighting water demand', alt: ['fire demand', 'fire fighting', 'firefighting'] },
      { k: 'Loss and wastes', alt: ['losses and wastes', 'losses', 'wastage'], d: 'leakage, bad plumbing, illegal connections' },
    ],
    hook: 'Do All Industries Pay For Losses: Domestic, Agricultural, Industrial, Public, Fire, Losses.',
    seen: [],
    src: 'SN L2 p1',
  },
  {
    id: 'l-dem-public',
    topic: T,
    title: 'Public uses of water',
    points: [
      { k: 'Educational institutions', alt: ['schools'] },
      { k: 'Hospitals' },
      { k: 'Cinema and theatre halls', alt: ['cinema', 'theatre'] },
      { k: 'Jails', alt: ['prisons'] },
      { k: 'Mosques' },
      { k: 'Parks and gardens', alt: ['parks'] },
      { k: 'Street sprinkling', alt: ['street washing'] },
      { k: 'Firefighting' },
      { k: 'Public fountains and ornamental displays', alt: ['fountains'] },
    ],
    seen: [],
    src: 'SN L2 p5',
  },
  {
    id: 'l-dem-pc-factors',
    topic: T,
    title: 'Factors affecting per capita water consumption',
    ask: 'What are the factors affecting per capita water consumption? How does each act?',
    points: [
      { k: 'Size of the city', alt: ['size of city', 'size of town', 'population size'], d: 'larger cities use more: industry, commerce, parks, public facilities' },
      { k: 'Characteristics of people', alt: ['economic status', 'standard of living', 'habits of people'], d: 'low-income areas use far less than high-income areas (gardening, car washing)' },
      { k: 'Climatic condition', alt: ['climate', 'weather'], d: 'more in warm, dry weather (bathing, lawns); in cold climates water is wasted at taps to stop freezing' },
      { k: 'Commerce and industry', alt: ['industrial and commercial activity', 'industries'], d: 'industries may use their own supply; commercial areas are not very high per capita' },
      { k: 'Pressure of water', alt: ['water pressure', 'pressure'], d: 'consumption rises with pressure, up to 30% from 25 to 45 psi; excess pressure wastes water' },
      { k: 'Quality of water', alt: ['water quality'], d: 'better quality (taste, safety) means more use; soft water meeting industrial standards means high use' },
      { k: 'Sewerage facilities', alt: ['sewerage', 'sewer'], d: 'plumbing and flushing raise consumption' },
      { k: 'Water rates and metering', alt: ['metering', 'water rates', 'tariff'], d: 'high cost saves water; metered users repair leaks; meters cut use by up to 40% in some cities' },
      { k: 'Nature of supply', alt: ['continuous or intermittent supply', 'intermittent supply'], d: 'intermittent supply uses much less than continuous' },
      { k: 'Availability of private supplies', alt: ['private supply', 'private source'], d: 'own wells reduce municipal demand when cost is high or quality poor' },
      { k: 'Efficiency of management', alt: ['management', 'efficiency of the management'], d: 'controls losses and waste (leaks, faulty joints)' },
      { k: 'Accessibility to the consumption point', alt: ['accessibility', 'distance to source'], d: 'in the house, in the premises, in the street, or at a distance' },
    ],
    hook: 'SCC CPQ SWN PME-A: Size, Character, Climate, Commerce, Pressure, Quality, Sewerage, Water rate, Nature, Private, Management, Access.',
    seen: ['2007-08', '2010-11', '2012-13', '2016-17', '2017-18', '2020-21', '2021-22', '2022-23'],
    src: 'SN L2 p7–8',
    note: 'The 2007-08 and 2017-18 papers ask for all of them; 2010-11, 2020-21 and 2022-23 ask for only four or three, with "how they affect".',
  },
  {
    id: 'l-dem-variations',
    topic: T,
    title: 'Variations in water demand',
    points: [
      { k: 'Seasonal variation', alt: ['seasonal', 'monthly variation'], d: 'peaks in summer (more fires); decides storage-reservoir size' },
      { k: 'Daily variation', alt: ['daily'], d: 'more on holidays and festival days' },
      { k: 'Hourly variation', alt: ['hourly'], d: 'bulk of the day’s use 6–10 am and 4–8 pm; decides pump and service-reservoir size' },
    ],
    seen: [],
    src: 'SN L5 p8',
  },
  {
    id: 'l-dem-dp-factors',
    topic: T,
    title: 'Factors affecting the design period',
    ask: 'State the factors to be considered in selecting the design period of a water supply system.',
    points: [
      { k: 'Useful life of structures and equipment', alt: ['useful life', 'life of components', 'life of structure'], d: 'a component should not be designed for longer than it lasts' },
      { k: 'Ease or difficulty of extension', alt: ['ease of extending', 'future expansion', 'extension'], d: 'easy-to-extend works can have a shorter period' },
      { k: 'Funds available and initial cost', alt: ['funds', 'economy', 'initial cost', 'interest rate'], d: 'a long period costs more now: a burden on the present generation' },
      { k: 'Performance of the work in the early years', alt: ['performance', 'performance before use'], d: 'a system over-designed for a long period runs under-loaded at first' },
      { k: 'Population growth rate', alt: ['rate of population growth', 'growth rate'], d: 'fast growth means a shorter period' },
      { k: 'Possible shift in the community', alt: ['shift in community', 'migration'] },
      { k: 'Industrial and commercial development rate', alt: ['industrial and commercial development', 'development rate'] },
    ],
    seen: ['2009-10', '2010-11'],
    src: 'Delwar sir note (seniors); definition and not-too-long / not-too-short from SN L2 p1',
    note: 'This term’s slide gives only the definition and the table of design periods, not this list: the list is from the seniors’ note.',
  },
  {
    id: 'l-dem-nrw-groups',
    topic: T,
    title: 'Components (categories) of non-revenue water',
    ask: 'What are the different categories of unaccounted-for (non-revenue) water?',
    points: [
      { k: 'Real losses', alt: ['physical losses', 'leakage', 'leaks'], d: 'leaks in mains, service connections and reservoirs; overflows' },
      { k: 'Apparent losses', alt: ['commercial losses', 'meter inaccuracy', 'theft'], d: 'theft, unauthorised connections and metering inaccuracies' },
      { k: 'Unbilled authorised consumption', alt: ['unbilled use', 'unmetered use'], d: 'fire fighting, flushing, public use not metered' },
    ],
    seen: ['2008-09', '2012-13', '2022-23', '2016-17'],
    src: 'SN L2 p5–6 (real and apparent); the third group is the IWA (textbook) one',
    note: 'The slide names only real and apparent losses; the third group completes the standard categories.',
  },
  {
    id: 'l-dem-nrw-causes',
    topic: T,
    title: 'Common sources of non-revenue water',
    points: [
      { k: 'Bad plumbing', alt: ['faulty plumbing'] },
      { k: 'Faulty connections', alt: ['faulty joints'] },
      { k: 'Breakage of pipes', alt: ['pipe breaks', 'pipeline leaks'] },
      { k: 'Unauthorised connections', alt: ['illegal connections', 'unauthorized connections'] },
      { k: 'Leaky mains and other wastes', alt: ['leaky mains', 'leaks'] },
      { k: 'Inaccurate meter readings', alt: ['meter inaccuracy', 'water theft'], d: 'Bangladesh urban causes also include water theft' },
    ],
    seen: [],
    src: 'SN L2 p5–6',
  },
  {
    id: 'l-dem-nrw-benefits',
    topic: T,
    title: 'Benefits of reducing non-revenue water',
    ask: 'What are the benefits of reducing NRW?',
    points: [
      { k: 'More revenue', alt: ['improved financial viability', 'revenue', 'financial viability'], d: 'more of the produced water is billed' },
      { k: 'Lower production cost', alt: ['saves energy and chemicals', 'less production'], d: 'less pumping, chemicals and treatment for the same sales' },
      { k: 'More water without a new source', alt: ['defers capacity expansion', 'postpone investment'], d: 'delays new works and saves the aquifer' },
      { k: 'Better pressure and service', alt: ['improved service', 'continuous supply'] },
      { k: 'Less risk of contamination', alt: ['reduced contamination', 'public health'], d: 'fewer leaks means less ingress of dirty water' },
      { k: 'Conserves water resources', alt: ['resource conservation'] },
    ],
    seen: ['2012-13'],
    src: 'textbook; SN L2 p5–6 for "detrimental to financial viability"',
  },
  {
    id: 'l-dem-leak-effects',
    topic: T,
    title: 'Effects of leakage in a water distribution network',
    ask: 'What are the main effects of leakage in a water supply network?',
    points: [
      { k: 'Loss of treated water and money', alt: ['waste of water', 'financial loss', 'economic loss'], d: 'treated and pumped water wasted, lower revenue' },
      { k: 'Loss of pressure', alt: ['pressure drop', 'reduced pressure'], d: 'consumers at the ends get less' },
      { k: 'Contamination of the supply', alt: ['pollution', 'ingress of contaminants'], d: 'dirty water enters through leaks when the pressure falls or the supply is intermittent' },
      { k: 'Higher pumping and treatment cost', alt: ['energy cost', 'increased cost'] },
      { k: 'Damage to roads and structures', alt: ['damage to property', 'undermining', 'erosion'], d: 'erosion of the pipe bed, road failure, foundation damage' },
      { k: 'Need for larger source and plant capacity', alt: ['larger capacity', 'demand exceeds supply'], d: 'an earlier expansion of source and plant' },
    ],
    seen: ['2007-08', '2008-09'],
    src: 'textbook (Peavy / Aziz); the slides only say leaks make losses high',
    note: 'Not in this term’s slides.',
  },
  {
    id: 'l-dem-leak-detect',
    topic: T,
    title: 'Methods of investigating unaccounted-for water and detecting leaks',
    points: [
      { k: 'Water audit', alt: ['water balance', 'audit'], d: 'compare production with billed use to size the loss' },
      { k: 'District metering and night-flow measurement', alt: ['district metering', 'waste water meter', 'night flow', 'minimum night flow'], d: 'isolate a zone and meter the inflow at night when use is minimum' },
      { k: 'Step testing', alt: ['step test'], d: 'close valves in steps and watch the flow drop' },
      { k: 'Acoustic detection', alt: ['listening devices', 'sounding rod', 'geophone', 'leak noise correlator'], d: 'listen for the leak noise on valves and hydrants' },
      { k: 'Pitometer survey', alt: ['pitometer', 'flow survey'] },
      { k: 'Meter testing and calibration', alt: ['meter calibration', 'meter inspection'], d: 'to find under-registering consumer meters' },
      { k: 'Inspection for illegal connections', alt: ['illegal connection survey', 'inspection'] },
      { k: 'Tracer gas or dye test', alt: ['tracer', 'dye test'] },
    ],
    seen: ['2007-08'],
    src: 'textbook (Peavy / Aziz); not in this term’s slides',
  },
  {
    id: 'l-dem-mgmt-objectives',
    topic: T,
    title: 'Objectives of water demand management',
    ask: 'What are the main objectives of water demand management?',
    points: [
      { k: 'Reduce water consumption and waste', alt: ['conserve water', 'reduce consumption', 'water conservation'] },
      { k: 'Reduce losses (non-revenue water)', alt: ['reduce NRW', 'reduce losses', 'leakage control'] },
      { k: 'Postpone new sources and capacity expansion', alt: ['delay investment', 'defer new works'] },
      { k: 'Protect the source and the environment', alt: ['protect resources', 'protect environment', 'sustainability'] },
      { k: 'Improve efficiency and financial viability', alt: ['efficiency', 'financial sustainability'] },
      { k: 'Equitable distribution of water', alt: ['equity', 'fair distribution'] },
    ],
    seen: ['2017-18'],
    src: 'textbook; not in this term’s slides',
  },
  {
    id: 'l-dem-loss-locations',
    topic: T,
    title: 'Typical locations of losses in a water supply system',
    ask: 'Show the typical locations of losses in a water supply system.',
    points: [
      { k: 'Source and intake', alt: ['intake', 'source'], d: 'screen and intake leakage, reservoir seepage and evaporation' },
      { k: 'Raw water main', alt: ['intake main', 'raw water pipe'], d: 'joint leaks and pipe bursts' },
      { k: 'Treatment plant', alt: ['treatment plant', 'backwash'], d: 'filter backwash, sludge, spills' },
      { k: 'Transmission main', alt: ['trunk main', 'transmission pipe'], d: 'joint leaks, bursts, air valves' },
      { k: 'Service reservoir', alt: ['reservoir', 'storage tank', 'overflow'], d: 'overflow and cracks' },
      { k: 'Distribution mains and valves', alt: ['distribution network', 'mains', 'valves and hydrants'], d: 'joint leaks, corroded pipes, hydrants' },
      { k: 'Service connections and meters', alt: ['house connection', 'service pipes', 'consumer meters'], d: 'leaks, illegal tapping, faulty meters' },
      { k: 'Consumer plumbing and storage', alt: ['consumer end', 'household'], d: 'leaking taps and tanks, wasteful use' },
    ],
    ordered: true,
    seen: ['2017-18'],
    src: 'textbook; slide L2 p5 names bad plumbing, faulty connections, breakage, unauthorised connections',
    note: 'The question asks for a sketch: draw the chain source to consumer and mark each location.',
  },
  {
    id: 'l-dem-fire-uses',
    topic: T,
    title: 'Two applications of fire demand',
    points: [
      { k: 'Individual occupancy demand', alt: ['building demand', 'occupancy'], d: 'industrial, commercial, residential buildings: BNBC 2020 table' },
      { k: 'Street fire hydrant', alt: ['hydrant', 'street hydrant'], d: 'hydrants at intersections and every 80 to 120 m' },
    ],
    seen: ['2023-24'],
    src: 'SN L5 p9',
  },
]

const cards: EvCard[] = [
  { id: 'c-dem-q', topic: T, front: 'Formula for the quantity of water required, and what are its two parameters?', back: '$Q_f = P_f \\cdot q$: $P_f$ = projected population at the end of the design period, $q$ = per capita consumption (lpcd). Demand depends on (i) the size of the population served and (ii) the per capita consumption for the purpose of use.', src: 'SN L2 p1' },
  { id: 'c-dem-percap', topic: T, front: 'Define per capita consumption.', back: '$\\text{lpcd}=\\dfrac{\\text{total water consumed in a year (L)}}{\\text{population}\\times 365}$: litres per capita per day.', seen: ['2015-16'], src: 'SN L2 p1' },
  { id: 'c-dem-design-period', topic: T, front: 'Define design period and its limits.', back: 'The number of years in the future for which a facility is available to meet the demand. Not too long (burden on the present generation), not too short (poor cost-effectiveness). A system is usually designed for 20 to 30 years.', seen: ['2009-10', '2010-11'], src: 'SN L2 p1' },
  { id: 'c-dem-dp-table', topic: T, front: 'Design periods of the components.', back: 'Groundwater source 10–20 yr; surface-water intake 30–50 yr; treatment plant 20–30 yr; pumps 10–15 yr; distribution system 20–30 yr; overhead storage tanks 50–80 yr; dams 25–100 yr.', src: 'SN L2 p1' },
  { id: 'c-dem-bnbc-groups', topic: T, front: 'BNBC income groups used for domestic demand.', back: 'X high income (monthly income > 6 times the monthly gross per capita income of Bangladesh), Y middle income (< 6 times), Z low income (< 2 times). Areas: metropolitan / district towns, pourashavas / upazilas, villages. Full facility includes 25% hot water; restricted = minimum plumbing.', src: 'SN L2 p2' },
  { id: 'c-dem-city-lpcd', topic: T, front: 'BNBC lpcd, cities and big district towns (full / restricted).', back: 'A1 single-family dwelling 260 / 200; A3 big apartment 200 / 150; Y1 officer’s quarter 180 / 135; Y2 small apartment — / 120; Z1 junior staff 80; Z2 65; Z3 common yard 50; Z4 slum stand post 40.', src: 'SN L2 p3 (BNBC 2020 Table 8.5.1a)' },
  { id: 'c-dem-pourashava-lpcd', topic: T, front: 'BNBC lpcd for pourashavas / upazilas and villages.', back: 'Pourashava (restricted): A1 150, A2 135, A3 120, Z1 80, Z2 65, Z3 50, Z4 40. Village (non-piped): private source 50–60, public source 40–50.', src: 'SN L2 p3 (Table 8.5.1b, c)' },
  { id: 'c-dem-other-lpcd', topic: T, front: 'BNBC lpcd for common occupancies (full / restricted).', back: 'Hostels 135 / 70; hotels per bed 300 / 135; schools to higher secondary 70 / 45; small hospitals 340 / 225; big hospitals (> 100 beds) 450 / 250; offices 45 / 30; shops 45 / 30; assembly per seat 90 / 45; garages 15 / 10.', src: 'SN L2 p4 (Table 8.5.1d)' },
  { id: 'c-dem-ind', topic: T, front: 'Industrial and commercial demand: typical range?', back: 'From as low as 10 gpcd in small residential communities to about 100 gpcd in big industrial cities. Process water is estimated case by case.', src: 'SN L2 p5' },
  { id: 'c-dem-agri', topic: T, front: 'Agriculture’s share of water use in Bangladesh and Asia?', back: 'Asia-Pacific: about 90% of freshwater use (global average 75%). Bangladesh: about 33 billion m³ a year, driven by rice irrigation, highest in the north-west, a large share from groundwater.', src: 'SN L2 p5' },
  { id: 'c-dem-pressure', topic: T, front: 'How does water pressure change consumption?', back: 'Consumption rises with pressure, by up to 30% for an increase from 25 to 45 psi. Excess pressure wastes water through leaks and open taps.', seen: ['2022-23'], src: 'SN L2 p8' },
  { id: 'c-dem-meter', topic: T, front: 'How do water rates and metering change per capita use?', back: 'High cost encourages conservation and metered consumers repair leaks; in some cities meters cut consumption by as much as 40%.', seen: ['2010-11', '2020-21'], src: 'SN L2 p8' },
  { id: 'c-dem-sewerage', topic: T, front: 'Why does sewerage raise per capita consumption?', back: 'Water-flushed toilets and the plumbing that goes with a sewer connection use more water than dry or pit systems.', seen: ['2022-23'], src: 'SN L2 p8' },
  { id: 'c-dem-nrw-def', topic: T, front: 'Define non-revenue water (NRW).', back: 'Water that has been produced and is "lost" before it reaches the customer. Measured as the volume lost as a share of the net water produced. Two groups: real losses (physical leaks) and apparent losses (theft, metering errors).', seen: ['2012-13', '2022-23'], src: 'SN L2 p5–6' },
  { id: 'c-dem-ufw', topic: T, front: 'What is UFW (unaccounted-for water)?', back: 'The difference between the water put into the system and the water billed or metered as authorised use: leaks, illegal connections, meter errors and unmetered use. The same idea as NRW, which also counts unbilled authorised use.', seen: ['2016-17'], src: 'textbook; SN L2 p5' },
  { id: 'c-dem-nrw-values', topic: T, front: 'Reported NRW values?', back: 'Dhaka (2025) 25% (range 5–7% to 40%); Bangkok (2012) 25%; Mexico (2003) 51%; Singapore 5%.', src: 'SN L2 p6' },
  { id: 'c-dem-peak', topic: T, front: 'Peak factors (PF) used in class.', back: 'Residential zone 2.5; industrial zone 1.4; commercial / institutional 4; firefighting 1. $DPC = PF \\times ADC/24$ (peak hourly flow on the maximum-consumption day).', src: 'SN L5 p8' },
  { id: 'c-dem-tf', topic: T, front: 'What is the time factor (TF)?', back: '$TF = 24/\\text{hours of consumption}$, used for non-residential uses supplied less than 24 h straight from the pump or reservoir with no daily storage (industry on two 8-h shifts 1.5; school 4; residential 1). With a service reservoir present, no time factor. Peak flow = ADC/24 × PF × TF.', src: 'SN L5 p9; class note C#13' },
  { id: 'c-dem-capacity', topic: T, front: 'What demand is each component designed for?', back: 'Source, raw water main and treatment plant: peak daily (maximum-day) demand. Distribution system: peak hourly demand. Monthly variation sets the storage-reservoir size; hourly variation sets pump and service-reservoir size.', src: 'SN L5 p8–9' },
  { id: 'c-dem-peak-hours', topic: T, front: 'When are the daily demand peaks?', back: 'Bulk of the day’s use is 6–10 am and 4–8 pm; the two domestic peaks are about 7–9 am and 5–7 pm. Maximum daily consumption (MDC) is the single day of the year with the highest use.', src: 'SN L5 p8' },
  { id: 'c-dem-fire-streams', topic: T, front: 'Kuichling’s fire formulas.', back: 'Fire flow $Q = 700\\sqrt{P}$ gpm and number of streams $N = 2.8\\sqrt{P}$, with P in thousands (700 = 2.8 streams × 250 gpm). One stream is taken as 250 gpm (about 950 L/min). Textbooks print Kuichling as $3182\\sqrt P$ **L/min**. Other formulas: Freeman $Q=250(P/5+10)$ gpm; NBFU $Q=1020\\sqrt P(1-0.01\\sqrt P)$ gpm.', seen: ['2010-11', '2020-21', '2022-23', '2023-24'], src: 'textbook / seniors’ note; not printed in the slides' },
  { id: 'c-dem-hydrant', topic: T, front: 'Fire hydrant spacing and pressure.', back: 'At all street intersections and turnings, and every 80 to 120 m on a straight run. Street hydrant systems in Bangladesh work at 100–250 psi (NFPA). Pitot formula $Q = 29.83\\,C\\,d^2\\sqrt{P}$ gpm (C = 0.90, d = 3 in, P in psi): 2,416 gpm at 100 psi, 3,820 gpm at 250 psi.', src: 'SN L5 p9–10' },
  { id: 'c-dem-fire-bnbc', topic: T, front: 'BNBC 2020 fire protection flow (sprinkler, l/min, duration).', back: 'Light hazard I 1000 for 30 min; Light II 1900 for 50 min; Ordinary I 2650, II 3200, III 4800, each for 75 min (standpipe 1000 or 1900). Durations are × 1.25 for buildings 51–102 m high and × 1.5 above 102 m.', src: 'SN L2 p6' },
  { id: 'c-dem-fire-share', topic: T, front: 'Fire demand: small share, large rate.', back: 'A negligible part of the yearly total, but very high during a fire. It is usually a function of the population. Fire storage in this class is a separate ground reservoir, not added to the elevated tank.', seen: ['2023-24'], src: 'SN L2 p6, L5 p10' },
  { id: 'c-dem-streams-q', topic: T, front: 'Fire stream: what flow does one stream carry?', back: 'About 950 L/min (250 gpm) per stream. Storage for a fire of t hours = (number of streams × 950 L/min) × 60 t.', seen: ['2022-23'], src: 'textbook; used in the numbers of 2022-23 Q6(b)' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-dem-pc-factors',
    topic: T,
    q: 'Describe the factors affecting per capita water consumption, and how each one acts.',
    seen: ['2007-08', '2010-11', '2012-13', '2016-17', '2017-18', '2020-21', '2021-22', '2022-23'],
    a: String.raw`### Factors and how they act
| Factor | Effect on per capita consumption |
|---|---|
| **Size of the city** | Larger city uses more: industry, commerce, parks, public facilities |
| **Characteristics of people** | Low-income areas use far less than high-income (gardening, car washing) |
| **Climatic condition** | More in warm, dry weather (bathing, lawns); in cold climates water is wasted at taps to stop freezing |
| **Commerce and industry** | Industries may use their own supply (DTW); zoning helps estimate industrial demand |
| **Pressure of water** | Use rises with pressure, up to 30% from 25 to 45 psi; excess pressure wastes water |
| **Quality of water** | Better quality (taste, safety) raises use; soft water meeting industrial standards raises it a lot |
| **Sewerage facilities** | Sewer connection and flushing raise use |
| **Water rates and metering** | High cost saves water; metered users repair leaks; meters cut use by up to 40% |
| **Nature of supply** | Intermittent supply uses much less than continuous |
| **Availability of private supplies** | Own wells cut municipal demand when cost is high or quality poor |
| **Efficiency of management** | Controls leaks, faulty joints and waste |
| **Accessibility to the consumption point** | In the house, in the premises, in the street or at a distance: closer means more use |

Answer for marks: pick the four to six asked (see the paper) and give the "effect" line for each; write all twelve when the question says "factors affecting per capita demand" with 15 or more marks.`,
    keys: ['Size of the city', 'Characteristics of people', 'Climatic condition', 'Commerce and industry', 'Pressure of water', 'Quality of water', 'Sewerage', 'Water rates and metering', 'Nature of supply', 'private supplies', 'management', 'Accessibility'],
    lists: ['l-dem-pc-factors'],
    src: 'SN L2 p7–8',
  },
  {
    id: 'a-dem-percap',
    topic: T,
    q: 'What do you mean by "per capita demand of water"?',
    seen: ['2015-16'],
    a: String.raw`### Per capita demand
The **per capita demand** (consumption) is the average quantity of water used by one person in a day, in **litres per capita per day (lpcd)**:
$$q=\frac{\text{total water consumption in a year (L)}}{\text{total population}\times 365}$$
- It covers domestic, commercial, industrial, public, fire and **loss and waste** use divided over the whole population.
- It depends on the size of the city, climate, income, pressure, metering, nature of supply and similar factors (see the factors list).
- The total demand of a design year is $Q_f = P_f\cdot q$ with $P_f$ the projected population at the end of the **design period**.
- BNBC 2020 gives lpcd by income group (X, Y, Z) and area type for domestic use.`,
    keys: ['litres per capita per day', 'lpcd', 'total population', 'design period', 'BNBC'],
    lists: [],
    src: 'SN L2 p1–3',
  },
  {
    id: 'a-dem-nrw',
    topic: T,
    q: 'What is non-revenue water (NRW) / UFW? Give its categories, causes and the benefits of reducing it.',
    seen: ['2008-09', '2012-13', '2016-17', '2022-23'],
    a: String.raw`### Definition
**Non-revenue water (NRW)** is water that has been produced and is "lost" before it reaches the customer, measured as the volume lost as a share of the net water produced. **UFW** (unaccounted-for water) is the same idea. High NRW is detrimental to the **financial viability** of the utility.

### Categories
1. **Real losses**: physical leaks from mains, service connections, joints and reservoir overflows.
2. **Apparent losses** (commercial losses): theft, **unauthorised connections** and **metering inaccuracies**.
3. **Unbilled authorised consumption**: fire fighting, flushing and public use not metered.

### Causes
Bad plumbing, faulty connections, **breakage of pipes**, unauthorised connections, **leaky mains** and other wastes; in Bangladeshi cities also inaccurate meter readings and water theft. Reported values: Dhaka 25% (2025), Bangkok 25%, Mexico 51%, Singapore 5%.

### Benefits of reducing NRW
1. More **revenue** and better financial viability.
2. Lower production cost (pumping, chemicals).
3. More water for customers without a new source, delaying capacity expansion and saving the aquifer.
4. Better pressure and service; less risk of contamination.`,
    keys: ['Non-revenue water', 'unaccounted-for water', 'Real losses', 'Apparent losses', 'unauthorised connections', 'metering inaccuracies', 'leaky mains', 'financial viability', 'revenue'],
    lists: ['l-dem-nrw-groups', 'l-dem-nrw-causes', 'l-dem-nrw-benefits'],
    src: 'SN L2 p5–6; third category and benefits textbook',
  },
  {
    id: 'a-dem-leak',
    topic: T,
    q: 'What are the main effects of leakage in a water supply network? Explain the methods of investigating unaccounted-for water and detecting leaks.',
    seen: ['2007-08', '2008-09'],
    a: String.raw`### Effects of leakage
1. **Loss of treated water and money**: production, pumping and chemical cost is wasted and revenue falls.
2. **Loss of pressure** at the far ends of the network.
3. **Contamination**: dirty water enters through leaks when the pressure drops or in intermittent supply.
4. Higher pumping and treatment cost.
5. **Damage** to roads and structures: erosion of the pipe bed and foundations.
6. A larger source and plant are needed sooner.

### Methods of investigation and leak detection
1. **Water audit**: compare production with billed consumption to size the loss.
2. **District metering and night-flow measurement**: isolate a zone and meter the inflow at night when use is minimum; excess = leakage.
3. **Step testing**: close valves in steps and note the drop in flow to find the leaking section.
4. **Acoustic detection**: sounding rods, geophones and leak-noise correlators listen for leak noise at valves and hydrants.
5. **Pitometer** survey of flows in mains.
6. **Meter testing and calibration** for under-registration; survey for **illegal connections**.
7. Tracer gas or dye tests for hidden leaks.`,
    keys: ['Loss of treated water', 'Loss of pressure', 'Contamination', 'Damage', 'water audit', 'night-flow', 'Step testing', 'Acoustic', 'Pitometer', 'illegal connections'],
    lists: ['l-dem-leak-effects', 'l-dem-leak-detect', 'l-dem-nrw-groups'],
    src: 'textbook (Peavy / Aziz); not in this term’s slides',
  },
  {
    id: 'a-dem-fire',
    topic: T,
    q: 'Write a short note on water demand for fire fighting (on a city scale).',
    seen: ['2023-24'],
    a: String.raw`### Fire demand
- Fires occur in dense and industrial areas; big cities keep full fire-fighting squads. Fire demand is a **negligible part of the yearly total** but very high during a fire, and is usually a **function of population**.
- Water for existing fires must be easily available: **stored in reservoirs** (in class a separate ground fire reservoir, not added to the elevated tank) and drawn through **fire hydrants**.

### Two applications
1. **Individual occupancy demand** (industrial, commercial, residential building): BNBC 2020 table, for example light hazard I sprinkler 1000 l/min for 30 min; ordinary hazard III 4800 l/min for 75 min.
2. **Street fire hydrants**: at all intersections and turnings and every 80–120 m on a straight run; working pressure 100–250 psi. Pitot formula $Q=29.83\,C\,d^{2}\sqrt{P}$ gpm.

### City-scale formulas (P in thousands, Q in gpm)
| Formula | Fire flow |
|---|---|
| **Kuichling** | $Q=700\sqrt{P}$, streams $N=2.8\sqrt{P}$ |
| **Freeman** | $Q=250\left(\tfrac{P}{5}+10\right)$ |
| **NBFU** | $Q=1020\sqrt{P}\,(1-0.01\sqrt{P})$ |
In L/min (textbook): Kuichling $3182\sqrt P$, Freeman $1136.5(P/5+10)$, NBFU $4637\sqrt P(1-0.01\sqrt P)$.
Storage = streams × stream flow × duration (about 950 L/min per stream).`,
    keys: ['negligible', 'function of population', 'stored', 'fire hydrants', 'Individual occupancy', 'BNBC', 'Kuichling', 'Freeman', 'NBFU', '80–120 m'],
    lists: ['l-dem-fire-uses'],
    src: 'SN L2 p6, L5 p9–10; the city formulas are textbook / seniors’ notes (the slides do not print them)',
  },
  {
    id: 'a-dem-design-period',
    topic: T,
    q: 'What is the design period? Discuss the factors to be considered in selecting it.',
    seen: ['2009-10', '2010-11'],
    a: String.raw`### Design period
The **design period** is the number of years in the future for which a facility is available to meet the demand. It must not be too long (a burden on the present generation) nor too short (poor cost-effectiveness). A system is usually designed for **20 to 30 years**.

| Component | Years |
|---|---|
| Groundwater source | 10–20 |
| Surface-water intake | 30–50 |
| Treatment plant | 20–30 |
| Pumps | 10–15 |
| Distribution system | 20–30 |
| Overhead storage tank | 50–80 |

### Factors to be considered
1. **Useful life** of structures and equipment.
2. **Ease or difficulty of extension** of existing or planned works.
3. **Funds available** and initial cost (interest on capital).
4. **Performance** of the work in the early years (an over-sized plant runs under-loaded).
5. **Population growth rate**: fast growth means a shorter period.
6. Possible **shift in the community**.
7. **Industrial and commercial development** rate.`,
    keys: ['design period', 'too long', 'too short', '20 to 30 years', 'Useful life', 'extension', 'Funds', 'Performance', 'growth rate', 'shift in the community', 'Industrial and commercial'],
    lists: ['l-dem-dp-factors'],
    src: 'SN L2 p1 (definition, table); factors from Delwar sir note',
  },
  {
    id: 'a-dem-mgmt',
    topic: T,
    q: 'What are the main objectives of water demand management? Show the typical locations of losses in a water supply system.',
    seen: ['2017-18'],
    a: String.raw`### Objectives of water demand management
1. **Reduce consumption and waste**: conserve water.
2. **Reduce losses** (non-revenue water).
3. **Postpone** new sources and capacity expansion.
4. **Protect the source and the environment** (aquifer, river).
5. Improve **efficiency** and financial viability.
6. Ensure **equitable** distribution.
Tools: metering and tariffs, leak control, pressure management, awareness, efficient fittings.

### Typical locations of losses (source to consumer)
1. **Source and intake**: seepage, evaporation, intake leakage.
2. **Raw water main**: joint leaks and bursts.
3. **Treatment plant**: backwash, sludge, spills.
4. **Transmission main**: joints, bursts.
5. **Service reservoir**: overflow and cracks.
6. **Distribution mains and valves**: leaks, corroded pipes, hydrants.
7. **Service connections and meters**: leaks, illegal tapping, faulty meters.
8. **Consumer plumbing and storage**: leaking taps and tanks.
Sketch the chain source, intake, plant, transmission, reservoir, network, consumer, and mark each location.`,
    keys: ['Reduce consumption', 'Reduce losses', 'Postpone', 'Protect the source', 'equitable', 'intake', 'Treatment plant', 'Transmission main', 'Service reservoir', 'Service connections'],
    lists: ['l-dem-mgmt-objectives', 'l-dem-loss-locations'],
    src: 'textbook; not in this term’s slides',
  },
  {
    id: 'a-dem-types',
    topic: T,
    q: 'What are the types (categories) of water demand?',
    seen: [],
    a: String.raw`### Categories of water consumption
1. **Domestic use**: drinking, sanitation, cooking, bathing, washing; fixed by socio-economic group (X, Y, Z) and the type of area (city, pourashava, village) in BNBC.
2. **Agricultural use**: irrigation and livestock; the largest use in Bangladesh (about 33 billion m³ a year).
3. **Industrial, institutional and commercial use**: offices, stores, hotels, mills, factories (10 to 100 gpcd).
4. **Public use**: schools, hospitals, jails, mosques, parks, street sprinkling, fountains.
5. **Firefighting** demand.
6. **Loss and wastes**: leakage, bad plumbing, illegal connections (non-revenue water).`,
    keys: ['Domestic use', 'Agricultural use', 'Industrial', 'Public use', 'Firefighting', 'Loss and wastes'],
    lists: ['l-dem-types', 'l-dem-public'],
    src: 'SN L2 p1–5',
  },
  {
    id: 'a-dem-variations',
    topic: T,
    q: 'Describe the variations in water demand and the peak factors used in design.',
    seen: [],
    a: String.raw`### Variations
1. **Seasonal**: peaks in summer (more fires, bathing, lawns); sets the **storage reservoir** size.
2. **Daily**: higher on holidays and festival days; the highest day is the maximum daily consumption (MDC).
3. **Hourly**: bulk of the use 6–10 am and 4–8 pm (two peaks 7–9 am and 5–7 pm); sets the **pump** and **service reservoir** size.
As the population falls, the fluctuation rate rises.

### Peak factors
$DPC = PF\times ADC/24$ (peak hourly flow on the maximum day). **Residential 2.5, industrial 1.4, commercial / institutional 4, firefighting 1.** For non-residential uses supplied less than 24 h with no service reservoir multiply by the **time factor** $TF=24/\text{hours}$.

### Design capacity
Source, raw water main and treatment plant: **peak daily** demand. Distribution system: **peak hourly** demand.`,
    keys: ['Seasonal', 'Daily', 'Hourly', 'maximum daily consumption', 'Residential 2.5', 'time factor', 'peak daily', 'peak hourly'],
    lists: ['l-dem-variations'],
    src: 'SN L5 p8–9',
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
