// Rowshan ma'am's theory parts: how each past-paper part is answered (see docs/CE331_AUTHORING.md).
// Number-type parts live in rm-math.tsx; a part that asks both gets only its theory sub-ask here.
import { Md } from '../../components/ui'
import type { EvPartMap, EvSource, EvTopicId } from '../types'

const ECO = 'ev-eco' as const
const CLI = 'ev-climate' as const
const BD = 'ev-bdws' as const
const RWH = 'ev-rwh' as const
const INT = 'ev-intake' as const
const PMP = 'ev-pump' as const
const TRN = 'ev-trans' as const
const WSP = 'ev-wsp' as const

const m = (topics: EvTopicId[], ans: string[], extra?: Partial<EvPartMap>): EvPartMap => ({ topics, ans, from: ['ce22'], ...extra })
const tb = (flag: string, extra?: Partial<EvPartMap>): Partial<EvPartMap> => ({ from: ['ce22', 'textbook'] as EvSource[], flag, ...extra })

const FLAG_HAMMER = 'Water hammer: the CE22 slides (RM L9) give only the four-phase sketch, the air-chamber and the words "surge towers, surge control valves"; there is no pressure formula and no surge-tank text. The causes list, the Joukowsky formula and the remedies beyond those are textbook.'
const FLAG_ENGR = 'Not in the CE22 slides: the lecture slide "What does an environmental engineer do?" is a title and a video with no text. The answer is the standard textbook role list.'
const FLAG_FAECAL = 'Transmission of disease from faeces (the F-diagram and its barriers) is not in this term’s slides; answered from the textbook.'
const FLAG_AIRLIFT = 'The CE22 slide gives the principle and uses of the air-lift pump only; its advantages and disadvantages are textbook.'
const FLAG_CURVES = 'The CE22 slides show only the H–Q curve, system curve, operating point and the vendor family chart; the standalone efficiency, power and NPSH curves are the standard textbook sketch.'
const FLAG_BD_IMPACT = 'The CE22 slides give the general impact chart (health, agriculture, forests, water, coast, species) and a Cyclone Sidr photo; the Bangladesh-specific list (sea-level rise, salinity, floods, drought, migration) is textbook.'
// risk score of the slide example (RM L10 p41): likelihood almost certain 5, impact major 4
const LIK = 5
const IMP = 4
const RISK = LIK * IMP
const RISK_BAND = RISK <= 5 ? 'Low' : RISK <= 14 ? 'Medium' : 'High'
const RiskSol = () => (
  <Md>{`**Given**: hazardous event = leaching from a pit latrine into a tubewell of a rural community supply. Ignore the controls already in place (the distance between latrine and well): this is the **raw (initial) risk**.

1. $\\text{Risk} = \\text{Likelihood} \\times \\text{Impact}$.
2. **Likelihood**: without an adequate distance (more than 10 m) leaching very likely contaminates the well regularly: almost certain, **${LIK}**.
3. **Impact**: pathogens in the well water can spread water-borne disease among the community: major, **${IMP}**.
4. **Risk score** $= ${LIK} \\times ${IMP} = ${RISK}$, which is 15 or more, so the category is **${RISK_BAND}** (red).

With the latrine more than 30 m away the likelihood is rare (1) and the impact still major (4): residual score 4, **Low**; validate the control by periodic water quality tests.`}</Md>
)

const gwprob = (extra?: string): EvPartMap => m([BD], ['a-bdws-gw-problems'], { extra, notes: ['The list comes from Snigdha ma’am’s L4b slide (problems associated with groundwater in Bangladesh) together with RM L4 p12 and p27–29.'] })

export const RM_MAP: Record<string, EvPartMap> = {
  // ---------------- 2007-08 ----------------
  'ev-2007-08-1a': gwprob('Only the **problems of groundwater development in Bangladesh** is Rowshan ma’am’s sub-ask; sources of groundwater, the Tara pump and the hydrologic cycle are Snigdha ma’am’s.'),
  'ev-2007-08-2a': m([PMP], ['a-pump-cent-adv-dis', 'a-pump-airlift'], { ...tb(FLAG_AIRLIFT), extra: 'Write the two lists side by side: centrifugal (merits and demerits from the slide) and air lift (advantages and disadvantages). Leakage effects and leak detection are Snigdha ma’am’s.' }),

  // ---------------- 2008-09 ----------------
  'ev-2008-09-1c': m([INT], ['a-intake-site', 'a-intake-design'], { extra: '8 marks: give the location factors in full and the design considerations in two or three lines.' }),
  'ev-2008-09-4a': m([PMP], ['a-pump-types', 'a-pump-airlift', 'a-pump-cent-adv-dis'], { extra: 'Types "on the basis of mechanical properties only" means the mechanical-principle row: **displacement, centrifugal, air lift**. Describe the air-lift working principle (first part of its answer) only; its advantages are not asked.' }),

  // ---------------- 2009-10 ----------------
  'ev-2009-10-1b': m([INT], ['a-intake-site'], { extra: 'For the **Turag River** (Dhaka): the river carries Tongi and Gazipur industrial and municipal waste, so choose a stretch **upstream of the sewage and industrial discharge points**, a place with water in the **driest season** (low dry-season flow in the Turag), not near **navigation** channels and ghats, safe from flood, and near the treatment plant.', notes: ['The Turag details are general knowledge, applied to the standard list.'] }),
  'ev-2009-10-8c': m([INT], ['a-intake-def', 'a-intake-design']),
  'ev-2009-10-8d': m([TRN], ['a-trans-hammer', 'a-trans-hammer-control'], { ...tb(FLAG_HAMMER), extra: 'Short note (3 marks): definition, the phenomenon in three lines, causes and remedies. Storage coefficient, well screen length and well development are Snigdha ma’am’s.' }),

  // ---------------- 2010-11 ----------------
  'ev-2010-11-6c': gwprob(),
  'ev-2010-11-7a': m([TRN], ['a-trans-pipes']),
  'ev-2010-11-7b': m([PMP], ['a-pump-airlift'], tb(FLAG_AIRLIFT)),
  'ev-2010-11-8b': m([TRN], ['a-trans-corr-micro']),
  'ev-2010-11-8c': m([TRN, PMP], ['a-trans-corr-galvanic', 'a-pump-system'], { extra: 'Rowshan ma’am’s sub-asks are (i) galvanic corrosion and (ii) pump curve and system curve. Gravity springs, hydraulic conductivity and well maintenance are Snigdha ma’am’s.' }),

  // ---------------- 2011-12 ----------------
  'ev-2011-12-1a': m([CLI], ['a-climate-causes', 'a-climate-impacts-bd'], tb(FLAG_BD_IMPACT)),
  'ev-2011-12-2a': m([PMP], ['a-pump-types', 'a-pump-cent-adv-dis']),
  'ev-2011-12-6d': m([WSP], ['a-wsp-def-flow']),

  // ---------------- 2012-13 ----------------
  'ev-2012-13-2a': m([TRN, BD], ['a-trans-hammer', 'a-trans-hammer-control', 'a-trans-corr-micro', 'a-trans-corr-factors', 'a-bdws-sst', 'a-bdws-saltwater'], {
    ...tb(FLAG_HAMMER),
    extra: '(i) water hammer: first two answers (short form); (ii) external corrosion: the slide calls the microbial mechanism "external corrosion", add the soil factors from the factor list; (iii) SST; (iv) salinity intrusion. About 3 marks each.',
  }),
  'ev-2012-13-2b': m([INT], ['a-intake-site']),
  'ev-2012-13-3a': m([PMP], ['a-pump-selection']),
  'ev-2012-13-5a': m([CLI], ['a-climate-causes', 'a-climate-impacts-bd'], { ...tb(FLAG_BD_IMPACT), extra: 'The third sub-ask (factors affecting per capita demand of water) is Snigdha ma’am’s.' }),

  // ---------------- 2015-16 ----------------
  'ev-2015-16-1a': m([ECO, CLI], ['a-eco-env-ecology', 'a-climate-ghg', 'a-eco-biodiversity', 'a-eco-faecal'], { ...tb(FLAG_FAECAL), extra: 'Four short notes at about 4–5 marks each; (iv) transmission of diseases from faeces: use the F-diagram only, with two or three barriers.' }),
  'ev-2015-16-6c': m([PMP], ['a-pump-curves'], tb(FLAG_CURVES)),
  'ev-2015-16-7a': m([TRN], ['a-trans-corr-factors', 'a-trans-corr-control'], { notes: ['Corrosion control: the slides give galvanic prevention and stable water; cathodic protection and inhibitors are textbook.'] }),
  'ev-2015-16-7b': m([TRN], ['a-trans-laying'], { extra: '"In the city areas": stress traffic management, shoring of trenches, utility crossings, night work and restoration of the road surface.' }),
  'ev-2015-16-8a': m([WSP], ['a-wsp-objectives', 'a-wsp-steps'], { extra: 'Draw the flow chart of the major steps (figure) and add the BUET campus system underneath each step (paragraph at the end of the steps answer).', notes: ['The BUET campus details are illustrative; the slides do not describe the campus system.'] }),
  'ev-2015-16-8b': m([WSP], ['a-wsp-risk-cat']),

  // ---------------- 2016-17 ----------------
  'ev-2016-17-1a': m([CLI], ['a-climate-causes', 'a-climate-impacts-bd'], tb(FLAG_BD_IMPACT)),
  'ev-2016-17-2a': m([ECO], ['a-eco-faecal'], { ...tb(FLAG_FAECAL), extra: 'Only **transmission of diseases from faeces** is Rowshan ma’am’s sub-ask here; the hydrologic cycle with a diagram and UFW are Snigdha ma’am’s.' }),
  'ev-2016-17-7a': m([WSP], ['a-wsp-objectives']),
  'ev-2016-17-7b': m([PMP], ['a-pump-cent-char'], tb(FLAG_CURVES)),
  'ev-2016-17-8a': m([INT], ['a-intake-site', 'a-intake-design']),
  'ev-2016-17-8b': m([TRN], ['a-trans-hammer', 'a-trans-hammer-control'], tb(FLAG_HAMMER)),

  // ---------------- 2017-18 ----------------
  'ev-2017-18-1a': m([CLI, ECO], ['a-climate-impacts-bd', 'a-climate-causes', 'a-eco-faecal'], { ...tb(FLAG_FAECAL + ' ' + FLAG_BD_IMPACT), extra: 'Third sub-ask: **minimise** transmission, so use the barriers list (sanitation, safe water, hand washing, food hygiene, fly control).' }),
  'ev-2017-18-2a': gwprob('Only the **major obstacles of groundwater supply in Bangladesh** is Rowshan ma’am’s sub-ask; the importance of the hydrologic cycle and the sketch of a surface-water supply system are Snigdha ma’am’s.'),
  'ev-2017-18-6b': m([TRN], ['a-trans-corr-factors', 'a-trans-corr-control'], { notes: ['Corrosion control: the slides give galvanic prevention and stable water; cathodic protection and inhibitors are textbook.'] }),
  'ev-2017-18-7a': m([WSP], ['a-wsp-def-flow', 'a-wsp-steps']),
  'ev-2017-18-7b': m([WSP], ['a-wsp-risk-example'], { Sol: RiskSol, checks: () => [{ key: 'L', label: 'Likelihood score', value: LIK }, { key: 'I', label: 'Impact (severity) score', value: IMP }, { key: 'R', label: 'Risk score = likelihood × impact', value: RISK }], final: `Risk = ${LIK} × ${IMP} = ${RISK}: ${RISK_BAND}`, notes: ['This is the slide example RM L10 p41, worked in the answer; no engine is needed.'] }),
  'ev-2017-18-8a': m([PMP], ['a-pump-cent-char'], tb(FLAG_CURVES)),

  // ---------------- Jan 2021 ----------------
  'ev-jan-2021-1a': m([BD, INT], ['a-bdws-coastal-hilly', 'a-intake-design', 'a-intake-site'], { extra: 'Third sub-ask: factors in designing an intake: the design considerations first, then the location factors.' }),
  'ev-jan-2021-2a': m([WSP], ['a-wsp-activities'], { extra: 'The second sub-ask (differences between surface-water and groundwater treatment) belongs to the treatment and water-supply parts (Tanvir sir, Snigdha ma’am).' }),
  'ev-jan-2021-5b': m([INT], ['a-intake-site'], { extra: 'Link each factor to the **Meghna**: a large perennial river with ample flow in the driest season, a location chosen away from the polluted Buriganga and Sitalakhya and upstream of city discharges, with room for expansion, flood-safe banks and clear of navigation channels and ghats; and near enough to the treatment plant to keep the conveyance cost down.', notes: ['The Meghna details are general knowledge applied to the standard list.'] }),
  'ev-jan-2021-6a': m([CLI], ['a-climate-nexus']),
  'ev-jan-2021-8a': m([TRN], ['a-trans-hammer', 'a-trans-hammer-control'], tb(FLAG_HAMMER)),
  'ev-jan-2021-8c': m([TRN], ['a-trans-laying']),

  // ---------------- 2020-21 ----------------
  'ev-2020-21-2a': m([CLI, ECO], ['a-climate-engineer', 'a-climate-impacts-bd'], tb(FLAG_ENGR + ' ' + FLAG_BD_IMPACT)),
  'ev-2020-21-2b': m([BD], ['a-bdws-sdg', 'a-bdws-equity']),
  'ev-2020-21-3a': m([RWH], ['a-rwh-importance', 'a-rwh-bnbc']),
  'ev-2020-21-3b': m([RWH], ['a-rwh-approaches'], { extra: 'Only the last sub-ask (**which approach is economical and why**) is theory; the tank sizing is solved in the numbers solution.' }),
  'ev-2020-21-4a': m([INT, CLI, ECO, BD], ['a-intake-def', 'a-climate-vapour', 'a-eco-biodiversity', 'a-bdws-psf'], { notes: ['Biodiversity conservation (in-situ and ex-situ) is textbook; the slides cover biodiversity levels and threats only.'] }),
  'ev-2020-21-4c': m([PMP], ['a-pump-selection', 'a-pump-npsh']),
  'ev-2020-21-5d': m([BD], ['a-bdws-saltwater'], { extra: 'The sketch has two parts: the natural fresh-water lens on salt water, and the up-coning under a pumped well.' }),
  'ev-2020-21-6c': m([TRN], ['a-trans-hammer'], tb(FLAG_HAMMER)),
  'ev-2020-21-7d': m([TRN], ['a-trans-corr-factors']),

  // ---------------- 2021-22 ----------------
  'ev-2021-22-1a': m([BD], ['a-bdws-gap']),
  'ev-2021-22-1b': m([BD], ['a-bdws-coastal-hilly', 'a-bdws-haor-ars'], { extra: 'Three regions: for the **coastal region** use the coastal half of the first answer only (skip hilly); then the **haor** and **arsenic** halves of the second.' }),
  'ev-2021-22-1c': m([PMP], ['a-pump-priming-cav'], { extra: 'Only the first sub-ask (priming and cavitation) is theory; the numbers part is solved separately.' }),
  'ev-2021-22-2a': m([WSP], ['a-wsp-steps'], { extra: 'Write the seven steps with the flow diagram. The surface-water and groundwater treatment flow diagrams and their differences are Tanvir sir’s and Snigdha ma’am’s.' }),
  'ev-2021-22-7a': m([TRN], ['a-trans-hammer', 'a-trans-hammer-control'], { ...tb(FLAG_HAMMER), extra: 'Only **water hammer** is Rowshan ma’am’s; the hydrologic cycle and the cone of depression are Snigdha ma’am’s.' }),
  'ev-2021-22-7c': m([INT], ['a-intake-dry-wet']),
  'ev-2021-22-8a': m([CLI, ECO], ['a-climate-engineer'], tb(FLAG_ENGR, { extra: 'Frame it for "the present situation of the world": climate change, energy transition, water scarcity, pollution, urbanisation and the SDGs.' })),
  'ev-2021-22-8b': m([CLI], ['a-climate-energy-bd', 'a-climate-nexus']),

  // ---------------- 2022-23 ----------------
  'ev-2022-23-1a': m([CLI, ECO], ['a-climate-engineer', 'a-climate-nexus', 'a-climate-renew-challenges'], tb(FLAG_ENGR + ' The challenges of renewable energy in Bangladesh are only partly in the slides (renewable vs non-renewable table); the list is general knowledge.')),
  'ev-2022-23-1c': m([WSP], ['a-wsp-activities']),
  'ev-2022-23-2a': m([BD], ['a-bdws-sdg'], { extra: 'Only the first part (SDG 6, target 6.1, challenges and measures) is theory; the storage tank volume is solved in the numbers solution.' }),
  'ev-2022-23-5c': m([BD], [], {
    extra: 'The questions on tubewell technologies, the No. 6 handpump suction limit (about 7.5 m practical, 32.8 ft theoretical) and deep-set pumps (Tara, up to about 15 m below static level) are Snigdha ma’am’s (tubewell topic). From Rowshan ma’am’s slides add the **coastal alternatives**: shallow shrouded tubewell (SST, from 15–20 m) and very shallow shrouded tubewell (VSST, about 8 m), pond sand filter, infiltration gallery.',
    notes: ['Mapped here only so that the part is not left blank; the model answer lives under Tubewells.'],
  }),
  'ev-2022-23-8a': m([CLI, INT, TRN], ['a-climate-vapour', 'a-climate-agri-health', 'a-intake-dry-wet', 'a-trans-hammer', 'a-trans-hammer-control'], { ...tb(FLAG_HAMMER), extra: '(iii) short notes: wet intake (use the wet-intake half of the dry-vs-wet answer) and water hammer.', notes: ['The detail under agriculture and human health goes beyond the slide headings; the slides give the six impact boxes only.'] }),
  'ev-2022-23-8b': m([PMP], ['a-pump-curves'], { ...tb(FLAG_CURVES), extra: 'Only (ii) qualitative pump performance curves is Rowshan ma’am’s; the iron-arsenic technology (i) is Tanvir sir’s and the distribution network methods (iii) are Snigdha ma’am’s.' }),

  // ---------------- 2023-24 ----------------
  'ev-2023-24-3a': m([ECO], ['a-eco-ecosystem-services']),
  'ev-2023-24-3b': m([BD], ['a-bdws-htr'], {
    from: ['ce22', 'none'],
    flag: 'Not solved: "Describe and assess the BUET Water Supply System aligning with the conventional system" has no source in the slides, the older slides or the seniors’ notes. The conventional-system frame (source, intake or tubewell, transmission, treatment, storage, distribution) is in the water supply system answers; the BUET facts must come from the class.',
    extra: 'Part (a) definition and list of HtR areas is answered. For the BUET assessment use the frame: source (deep tubewells) → pump → treatment (chlorination, any iron removal) → overhead tanks → distribution → taps, and compare each element with the conventional surface-water system (no intake or long transmission, small scale, supply by campus Estate Office).',
    notes: ['The BUET system description is a guess from general knowledge; check it against what was said in class.'],
  }),
  'ev-2023-24-3c': m([BD], ['a-bdws-ladder', 'a-bdws-sdg']),
  'ev-2023-24-4a': m([WSP], ['a-wsp-activities', 'a-wsp-steps'], { extra: 'List the three major activities, then the urban-area steps (module list). The process flow diagram for simultaneous iron and arsenic removal is Tanvir sir’s.' }),
  'ev-2023-24-6c': m([RWH], ['a-rwh-sustain'], { extra: 'Only the sustainability of RWH is Rowshan ma’am’s; the major elements of a water supply are Snigdha ma’am’s.', notes: ['The sustainability points are built from the slides on why RWH and quality; the framing (resource, environmental, social, economic) is general.'] }),
  'ev-2023-24-7a': gwprob('Only the **major issues associated with groundwater extraction in Bangladesh** is Rowshan ma’am’s sub-ask; the reasons for tubewell failure are Snigdha ma’am’s.'),
  'ev-2023-24-8a': m([INT], ['a-intake-dry-wet', 'a-intake-site']),
  'ev-2023-24-8b': m([PMP], ['a-pump-priming-cav'], { extra: 'Only the first three sub-asks (priming in a submersible pump, cavitation, avoiding it) are theory; the submersible pump design is solved in the numbers solution.' }),
  'ev-2023-24-8c': m([TRN], ['a-trans-hammer-control', 'a-trans-hammer'], tb(FLAG_HAMMER)),
}
