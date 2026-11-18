import type { EvTopicId } from '../store'

/** the three teachers this term: Rowshan ma'am, Snigdha ma'am, Tanvir sir */
export type EvBlock = 'RM' | 'SN' | 'TA'

export interface EvTopicMeta {
  id: EvTopicId
  title: string
  short: string
  block: EvBlock
  blurb: string
  hours: number
  /** CSS colour (a theme variable, so it reads in Rosé Pine Moon and Dawn alike) */
  color: string
}

const RM = 'var(--c-rm)'
const SN = 'var(--c-sn)'
const TA = 'var(--c-ta)'

export const EV_TOPICS: EvTopicMeta[] = [
  // Tanvir sir — water quality and treatment
  { id: 'ev-wq', title: 'Water Quality & Water Chemistry', short: 'Water quality', block: 'TA', blurb: 'Physical, chemical and biological parameters, their sanitary significance and standards; hardness, alkalinity, the carbonate system, pH and Henry’s law.', hours: 2, color: TA },
  { id: 'ev-aer', title: 'Aeration', short: 'Aeration', block: 'TA', blurb: 'Why ground water is aerated, aerator types, gas transfer across the air–water interface and how to make it faster.', hours: 0.75, color: TA },
  { id: 'ev-sed', title: 'Settling (Solids Separation)', short: 'Settling', block: 'TA', blurb: 'Discrete (Type I) and flocculent (Type II) settling, column analyses and iso-removal lines, surface overflow rate, plate settlers.', hours: 2, color: TA },
  { id: 'ev-coag', title: 'Coagulation & Flocculation', short: 'Coagulation', block: 'TA', blurb: 'Colloids and the double layer, the four destabilisation mechanisms, coagulants and the alkalinity they use, dose vs colloid concentration, jar test, G and CAMP number.', hours: 1.5, color: TA },
  { id: 'ev-soft', title: 'Softening & Stabilisation', short: 'Softening', block: 'TA', blurb: 'Lime–soda softening: selective calcium removal, excess lime, split treatment, bar diagrams, recarbonation and stabilisation.', hours: 2, color: TA },
  { id: 'ev-ix', title: 'Ion Exchange', short: 'Ion exchange', block: 'TA', blurb: 'Softening and demineralisation by ion exchange, capacity, bypass, resin volume, regeneration cycle and the breakthrough curve.', hours: 1, color: TA },
  { id: 'ev-filt', title: 'Filtration', short: 'Filtration', block: 'TA', blurb: 'Slow vs rapid sand filters, straining and non-straining mechanisms, dual and mixed media, backwashing, roughing and pond sand filters.', hours: 1.5, color: TA },
  { id: 'ev-dis', title: 'Disinfection', short: 'Disinfection', block: 'TA', blurb: 'Chlorine chemistry, breakpoint chlorination, THMs and how to keep them down, the ideal disinfectant, other disinfectants.', hours: 1, color: TA },
  { id: 'ev-att', title: 'Membranes & Adsorption', short: 'Membranes & adsorption', block: 'TA', blurb: 'RO vs electrodialysis and the other membranes; activated carbon (GAC vs PAC), how it is made, physical adsorption vs chemisorption.', hours: 1, color: TA },
  { id: 'ev-fe', title: 'Iron, Manganese & Arsenic Removal', short: 'Fe, Mn & As removal', block: 'TA', blurb: 'Oxidation and catalytic contact oxidation, process flow diagrams for Fe–As water, surface vs ground water treatment trains.', hours: 1.25, color: TA },
  // Rowshan ma'am — environment, Bangladesh water supply, RWH, intake, pumps, transmission, WSP
  { id: 'ev-eco', title: 'Environment, Ecology & Biodiversity', short: 'Ecology', block: 'RM', blurb: 'Environment and its components, ecology, levels of organisation, ecosystems and their services, biodiversity and its threats.', hours: 1, color: RM },
  { id: 'ev-climate', title: 'Climate, Energy & the Environmental Engineer', short: 'Climate & energy', block: 'RM', blurb: 'Greenhouse effect and water vapour, impacts of climate change, energy sources and Bangladesh’s energy situation, the energy–environment nexus, what an environmental engineer does.', hours: 1.25, color: RM },
  { id: 'ev-bdws', title: 'Water Supply in Bangladesh', short: 'Bangladesh water supply', block: 'RM', blurb: 'Coverage and gaps, SDG 6 and target 6.1, the drinking-water service ladder, coastal, hilly, haor, barind, char and hard-to-reach areas, arsenic and salinity, alternative options.', hours: 1.5, color: RM },
  { id: 'ev-rwh', title: 'Rainwater Harvesting', short: 'Rainwater harvesting', block: 'RM', blurb: 'Why RWH matters, its components, BNBC 2020 rules and storage-tank sizing by demand, supply and dry-month methods.', hours: 1.25, color: RM },
  { id: 'ev-intake', title: 'Intakes', short: 'Intakes', block: 'RM', blurb: 'Surface water collection, types of intake, dry vs wet intake and what decides an intake’s location.', hours: 0.75, color: RM },
  { id: 'ev-pump', title: 'Pumps', short: 'Pumps', block: 'RM', blurb: 'Pump types, centrifugal and submersible pumps, performance curves, priming, cavitation and NPSH, selection, pump capacity and power.', hours: 1.5, color: RM },
  { id: 'ev-trans', title: 'Water Transmission', short: 'Transmission', block: 'RM', blurb: 'Transmission mains and pipe materials, water hammer and its control, corrosion of metal pipes, laying pipes, appurtenances.', hours: 1, color: RM },
  { id: 'ev-wsp', title: 'Water Safety Plan', short: 'Water safety plan', block: 'RM', blurb: 'Objectives, the three major activities, the steps (modules) of a WSP, hazards, and risk scoring by likelihood × severity.', hours: 1, color: RM },
  // Snigdha ma'am — water supply engineering
  { id: 'ev-ws', title: 'The Water Supply System', short: 'Water supply system', block: 'SN', blurb: 'Elements of a water supply system with a sketch, sources, the hydrologic cycle, ground vs surface water, design considerations.', hours: 1, color: SN },
  { id: 'ev-demand', title: 'Water Demand & Fire Flow', short: 'Demand & fire flow', block: 'SN', blurb: 'Kinds of demand, per-capita consumption and what affects it, variations and peak factors, fire demand and fire streams, non-revenue water.', hours: 1.25, color: SN },
  { id: 'ev-pop', title: 'Population Forecasting', short: 'Population forecast', block: 'SN', blurb: 'Arithmetic, geometric, incremental-increase, least-squares and other methods, and which suits which kind of city.', hours: 1, color: SN },
  { id: 'ev-gw', title: 'Groundwater Hydraulics', short: 'Groundwater', block: 'SN', blurb: 'Aquifer types, porosity, specific yield and storativity, Darcy’s law, steady flow to wells in confined and unconfined aquifers, cone of depression, interference, salt-water intrusion.', hours: 2, color: SN },
  { id: 'ev-well', title: 'Tubewells & Deep Tubewell Design', short: 'Tubewells & DTW', block: 'SN', blurb: 'DTW design from the gradation curve (slot, gravel pack, housing pipe, strainer, yield, well log), STW, deep-set and hand pumps, sinking methods, tubewell failure.', hours: 2, color: SN },
  { id: 'ev-dist', title: 'Distribution Network', short: 'Distribution', block: 'SN', blurb: 'Layouts and methods of distribution, dead-end branch design, looped networks and Hardy Cross, storage.', hours: 1.5, color: SN },
]

export const evTopicById = (id: string) => EV_TOPICS.find((t) => t.id === id)

export const EV_BLOCK_LABEL: Record<EvBlock, string> = {
  TA: 'Tanvir sir — water quality & treatment',
  RM: 'Rowshan ma’am — environment, RWH, pumps, WSP',
  SN: 'Snigdha ma’am — water supply engineering',
}

export const EV_BLOCK_SHORT: Record<EvBlock, string> = { TA: 'Tanvir sir', RM: 'Rowshan ma’am', SN: 'Snigdha ma’am' }

export const EV_BLOCKS: EvBlock[] = ['TA', 'RM', 'SN']
