// Snigdha ma'am's theory parts: how each past-paper part is answered (see docs/CE331_AUTHORING.md).
// Number-type parts live in sn-math.tsx / sn-dtw.tsx (and four tank parts in rm-math.tsx); a part that asks both gets only its theory sub-ask here.
import type { EvPartMap, EvSource, EvTopicId } from '../types'

const WS = 'ev-ws' as const
const DEM = 'ev-demand' as const
const POP = 'ev-pop' as const
const GW = 'ev-gw' as const
const WELL = 'ev-well' as const
const DIST = 'ev-dist' as const

const m = (topics: EvTopicId[], ans: string[], extra?: Partial<EvPartMap>): EvPartMap => ({ topics, ans, from: ['ce22'], ...extra })
const tb = (flag: string, extra?: Partial<EvPartMap>): Partial<EvPartMap> => ({ from: ['textbook', 'ce22'] as EvSource[], flag, ...extra })
const sen = (flag: string, extra?: Partial<EvPartMap>): Partial<EvPartMap> => ({ from: ['seniors', 'ce22'] as EvSource[], flag, ...extra })

const FLAG_ROT = 'Direct vs reverse rotary (recirculation) drilling is not in this term’s slides, which only name the rotary method and its drilling mud. Answered from the textbook.'
const FLAG_SLUDGER = 'The sludger (hand-boring) method is not in the CE22 slides. Answered from the textbook; "sludger" is as read from the scan.'
const FLAG_SST = 'The shallow shrouded tubewell (SST) is not in the CE22 slides. Short answer from the textbook; check it against your class notes.'
const FLAG_SALT = 'Salt-water intrusion is not in Snigdha ma’am’s CE22 slides or class notes (they only list salinity as a groundwater problem). The mechanism, z = 40 h and radial wells / recharge are from Delwar sir’s note; the remaining options are textbook.'
const FLAG_LEAK = 'Effects of leakage and the methods of leak detection / unaccounted-for water investigation are not in this term’s slides. Answered from the textbook.'
const FLAG_DP = 'The slides give only the definition and the table of design periods; the list of factors is from Delwar sir’s note.'
const FLAG_WDM = 'Objectives of water demand management and the typical locations of losses are not in this term’s slides (textbook). The tubewell technologies are from the slides; reverse rotary drilling is textbook.'
const FLAG_FIRE = 'The slides give the BNBC fire-flow table and the hydrant rules but not the city-scale formulas (Kuichling, Freeman, NBFU), which are the textbook ones.'
const FLAG_HARDY = 'The slides give the two conditions and the steps of Hardy Cross but no "assumptions" list; the assumptions follow the textbook derivation.'
const FLAG_NRW = 'The slide names real and apparent losses only; the third category (unbilled authorised use) and the benefits of reducing NRW are textbook.'
const FLAG_SPRING = 'Gravity springs and well maintenance are not in the CE22 slides (textbook); hydraulic conductivity is.'
const NOTE_SW = 'The CE22 slides give the SW / GW comparison under "sources": quality, quantity, challenges.'

export const SN_MAP: Record<string, EvPartMap> = {
  // ---------------- 2007-08 ----------------
  'ev-2007-08-1a': m([GW, WELL], ['a-gw-origin', 'a-well-bd-issues', 'a-well-tara', 'a-ws-hydro'], { extra: 'Four sub-asks, about four marks each: sources of groundwater (meteoric, connate, juvenile), problems of groundwater development in Bangladesh (the list), and short notes on the **Tara pump** (principle) and the **hydrologic cycle** (diagram). For the Tara note leave out the problem list unless the marks allow it.' }),
  'ev-2007-08-2a': m([DEM], ['a-dem-leak'], { ...tb(FLAG_LEAK), extra: 'Answer only the **effects of leakage** and the **methods of investigating unaccounted-for water and detecting leaks**. The advantages and disadvantages of centrifugal and airlift pumps belong to Rowshan ma’am’s pump topic and are not covered here.' }),
  'ev-2007-08-3a': m([WELL], ['a-well-rotary'], { ...tb(FLAG_ROT), extra: 'Only the first sub-ask (direct rotary vs reverse recirculation rotary). The tubewell design from the sieve data is solved in the numbers section.' }),
  'ev-2007-08-5a': m([WS], ['a-ws-elements'], { extra: 'Sketch the flow diagram with the four labelled blocks and add the sub-items of each (intake and intake main, deep tubewell, treatment methods, pipes / reservoirs / pumps / hydrants / valves / meters).' }),
  'ev-2007-08-5b': m([DEM], ['a-dem-pc-factors'], { extra: '18 marks: write all twelve factors with the "how it acts" line (about 1.5 marks each).' }),
  'ev-2007-08-7c': m([DIST], ['a-dist-hardy-derive'], { notes: ['The printed formula is ΔQ = −ΣH / (X ΣH/Q) with the X partly unclear in the scan; X is the exponent of the head-loss law (1.85 for Hazen–Williams, 2 for Darcy).'] }),
  'ev-2007-08-8a': m([DIST], ['a-dist-continuous'], { extra: '8 marks: say what each system is, then give four or five comparison points (fire demand, storage at home, contamination, pipe size, wastage).' }),
  'ev-2007-08-8b': m([DIST], ['a-dist-deadend'], { extra: '7 marks: one line on the layout, then three merits and three demerits.' }),

  // ---------------- 2008-09 ----------------
  'ev-2008-09-1a': m([WS], ['a-ws-objectives', 'a-ws-design'], { extra: 'Two sub-asks: first the **objectives** (the eight points), then the **essential elements in designing** (the design elements and the six development considerations).' }),
  'ev-2008-09-1b': m([WS, GW], ['a-ws-sw-gw'], { extra: '**For Dhaka**: over 80% of the supply is groundwater (about 1,330 deep tubewells), the water table is falling so fast that DTWs now reach 1,200 ft, while the surface-water plants (Saydabad, Padma / Jashaldia, Chandni Ghat) draw on polluted rivers and need extensive treatment. Weigh the merits of groundwater (low treatment, uniform quality, no pathogens in deep aquifers) against its demerits (depletion, arsenic and iron) and conclude with a mix: surface water plants for the new demand and groundwater as a supplement.', notes: [NOTE_SW] }),
  'ev-2008-09-2a': m([GW], ['a-gw-origin', 'a-gw-flow-well', 'a-gw-dupuit'], { extra: '15 marks: sources of groundwater (origin types), the hydraulics of flow to an unconfined well, then the Dupuit derivation.' }),
  'ev-2008-09-2b': m([DEM], ['a-dem-nrw', 'a-dem-leak'], { ...tb(FLAG_NRW), extra: 'Categories of unaccounted-for water (real losses, apparent losses, unbilled authorised use) first, then only the **effects of leakage** from the second answer.' }),
  'ev-2008-09-2c': m([WELL], ['a-well-rotary'], { ...tb(FLAG_ROT) }),
  'ev-2008-09-4b': m([DIST], ['a-dist-layouts'], { extra: '17 marks: all four layouts with a sketch of each; give merits and demerits even though only the layouts are asked.' }),

  // ---------------- 2009-10 ----------------
  'ev-2009-10-1a': m([WS], ['a-ws-planning'], { extra: '8 marks: eight short points, each with its reason; add the site items (Turag river nearby, 2000 acres, future phases).' }),
  'ev-2009-10-1c': m([WS], ['a-ws-sw-gw'], { extra: 'Only the **merits and demerits of groundwater** for the project area; the part of the printed question is partly lost, so also mention the Turag river as the surface-water alternative. Give four merits and four demerits (8 marks).', notes: ['The printed text of 1(c) is partly lost ("… the water supply system of the project area").'] }),
  'ev-2009-10-2a': m([DIST], ['a-dist-requirements', 'a-dist-layouts'], { notes: ['The printed question is partly lost. It probably reads "What are the requirements of a distribution system?"; if it asks for the layouts, use the second answer. 5 marks: give the first and a one-line list of the other.'] }),
  'ev-2009-10-2c': m([DIST], ['a-dist-looped'], { notes: ['Fig. 1 (redrawn above) is a grid of mains closed into three loops by cross pipes: a looped, grid-iron layout.'] }),
  'ev-2009-10-4c': m([DIST], ['a-dist-continuous']),
  'ev-2009-10-4d': m([DEM], ['a-dem-design-period'], { ...sen(FLAG_DP) }),
  'ev-2009-10-5a': m([GW], ['a-gw-aquifers'], { extra: 'Draw three sketches (unconfined with water table and a well, confined with piezometric surface and aquitards, leaky aquifer) and one of a perched water body above an unsaturated zone.' }),
  'ev-2009-10-5b': m([GW], ['a-gw-vertical'], { from: ['ce22', 'textbook'], notes: ['The zones are from the slides; the water-content profile of coarse sand after drainage (specific retention, thin capillary fringe) is the textbook idea.'] }),
  'ev-2009-10-6a': m([WELL], ['a-well-design-steps'], { extra: '10 marks: the seven steps with a line of the rule for each.' }),
  'ev-2009-10-6b': m([WELL], ['a-well-tara'], { extra: 'Working principle first (force-mode pump, piston below the static level), then the five problems.' }),
  'ev-2009-10-8d': m([GW, WELL], ['a-gw-storage', 'a-well-screen-length', 'a-well-development'], { extra: 'Three notes of about 3 marks each: (i) storage coefficient (storativity, with specific yield), (ii) well screen length, (iii) well development. **(iv) Water hammer** is Rowshan ma’am’s transmission topic and is not covered here.' }),

  // ---------------- 2010-11 ----------------
  'ev-2010-11-1a': m([WS], ['a-ws-elements'], { extra: 'Draw the flow diagram: source, collection, treatment, transmission, service reservoir, distribution, consumer.' }),
  'ev-2010-11-1b': m([POP], ['a-pop-methods', 'a-pop-best'], { notes: ['"Qualitative population curves" is read as the methods that use the population curve: graphical extension, comparative graphical, ratio and the logistic S-curve; name all the methods and then choose.'] }),
  'ev-2010-11-2a': m([DEM], ['a-dem-design-period'], { ...sen(FLAG_DP) }),
  'ev-2010-11-2b': m([DEM], ['a-dem-pc-factors'], { extra: 'Only four are asked: **size of the city, characteristics of people, water rates and metering, climatic condition**, about three marks each with the "how it acts" line.' }),
  'ev-2010-11-2c': m([DIST], ['a-dist-layouts']),
  'ev-2010-11-3a': m([DIST], ['a-dist-continuous']),
  'ev-2010-11-6d': m([GW, WELL], ['a-gw-salt'], { ...tb(FLAG_SALT, { from: ['seniors', 'textbook'] }) }),
  'ev-2010-11-7c': m([WELL], ['a-well-tara-vs-no6'], { extra: '6 marks: the comparison table, with the working principle of each (vacuum and atmospheric pressure against a piston below the static level).' }),
  'ev-2010-11-8a': m([WELL], ['a-well-sludger'], { ...tb(FLAG_SLUDGER) }),
  'ev-2010-11-8c': m([GW, WELL], ['a-gw-springs', 'a-gw-k-notes', 'a-well-maintenance'], { ...tb(FLAG_SPRING), extra: 'Mine: **(iii) gravity springs, (iv) hydraulic conductivity of an aquifer, (v) well maintenance**. (i) Galvanic corrosion and (ii) pump curve and system curve are Rowshan ma’am’s topics and are not covered here.' }),

  // ---------------- 2011-12 ----------------
  'ev-2011-12-8a': m([DIST], ['a-dist-layouts', 'a-dist-methods'], { notes: ['"Water distribution systems" can mean the layouts (branched, grid iron, ring, radial) or the methods (gravity, pumping, combined). Write the layouts with merits and demerits, then add the methods briefly if marks remain.'] }),
  'ev-2011-12-8b': m([DIST], ['a-dist-hardy-assume'], { ...tb(FLAG_HARDY, { from: ['ce22', 'textbook'] }), extra: 'Only the **assumptions** (5 marks); do not write the procedure.' }),
  'ev-2011-12-8c': m([DIST], ['a-dist-deadend'], { extra: '10 marks: describe the layout (with a small sketch), five merits / demerits, where it is used.' }),

  // ---------------- 2012-13 ----------------
  'ev-2012-13-1a': m([DIST], ['a-dist-branched-looped']),
  'ev-2012-13-1d': m([DEM], ['a-dem-nrw'], { ...tb(FLAG_NRW), extra: 'Definition (2 marks) and the benefits of reducing NRW (3 marks).' }),
  'ev-2012-13-2a': m([WELL, GW], ['a-well-sst', 'a-gw-salt'], { from: ['textbook', 'seniors'], flag: FLAG_SST + ' ' + FLAG_SALT, extra: 'Mine: **(iii) Shallow Shrouded Tubewell (SST)** and **(iv) salinity intrusion in coastal areas**. (i) Water hammer and (ii) external corrosion are Rowshan ma’am’s transmission topic and are not covered here.' }),
  'ev-2012-13-5a': m([DEM], ['a-dem-pc-factors'], { extra: 'Only the last sub-ask, the **factors affecting per capita demand**. The causes of climate change and its impacts in Bangladesh are Rowshan ma’am’s climate topic and are not covered here.' }),
  'ev-2012-13-6a': m([WS, GW], ['a-ws-sources', 'a-ws-hydro', 'a-gw-flow-well'], { extra: 'Three sub-asks: sources of water (the list), the hydrologic cycle (with a sketch), and the hydraulics of groundwater flow towards a well (cone of depression sketch).' }),

  // ---------------- 2015-16 ----------------
  'ev-2015-16-1b': m([DEM], ['a-dem-percap'], { extra: 'Only the first sub-ask here (define per capita demand). The population forecasts (geometric and change in increase rate) and the fire flow are solved in the numbers section.' }),
  'ev-2015-16-2a': m([WS], ['a-ws-sources', 'a-ws-elements', 'a-ws-hydro'], { extra: 'The sketch is of a **surface water based** supply: show intake, intake main, pump, treatment plant, service reservoir and network.' }),
  'ev-2015-16-2b': m([GW], ['a-gw-flow-well', 'a-gw-thiem'], { extra: 'Confined aquifer: use the Thiem derivation.' }),
  'ev-2015-16-3a': m([WELL], ['a-well-rotary'], { ...tb(FLAG_ROT), extra: 'Only the **reverse rotary recirculation sketch**. The parallel inclined plate separator and SOR are Tanvir sir’s topics and are not covered here.' }),
  'ev-2015-16-7c': m([DIST], ['a-dist-layouts']),

  // ---------------- 2016-17 ----------------
  'ev-2016-17-1b': m([DEM], ['a-dem-pc-factors'], { extra: 'Only the first sub-ask (factors affecting per capita demand). The population forecasts are solved in the numbers section.' }),
  'ev-2016-17-2a': m([WS, DEM], ['a-ws-hydro', 'a-dem-nrw'], { ...tb(FLAG_NRW), extra: 'Importance of the hydrologic cycle with a diagram, and **UFW** (unaccounted-for water = NRW: define and give categories). The transmission of diseases from faeces is not Snigdha ma’am’s topic and is not covered here.' }),
  'ev-2016-17-2b': m([GW], ['a-gw-flow-well', 'a-gw-dupuit']),
  'ev-2016-17-3b': m([WELL], ['a-well-rotary'], { ...tb(FLAG_ROT), extra: 'Only the **reverse rotary recirculation sketch**. The Mn vs Fe oxidation and the aeration objectives are Tanvir sir’s topics.' }),
  'ev-2016-17-8c': m([DIST], ['a-dist-hardy-assume'], { ...tb(FLAG_HARDY, { from: ['ce22', 'textbook'] }), extra: 'Assumptions (the first four), then the procedure with the two-loop sketch (clockwise positive, correction formula, common pipe).' }),

  // ---------------- 2017-18 ----------------
  'ev-2017-18-1b': m([DEM], ['a-dem-pc-factors'], { extra: 'Only the first sub-ask (factors affecting per capita demand). The population forecasts are solved in the numbers section.' }),
  'ev-2017-18-2a': m([WS, WELL], ['a-ws-hydro', 'a-well-bd-issues', 'a-ws-elements'], { extra: 'Three sub-asks: why the hydrologic cycle matters, the **major obstacles of groundwater supply in Bangladesh** (the six issues) and the essential elements of a **surface water based** supply with a sketch.' }),
  'ev-2017-18-3a': m([DEM, WELL], ['a-dem-mgmt', 'a-well-types', 'a-well-rotary'], { ...tb(FLAG_WDM, { from: ['textbook', 'ce22'] }), extra: 'Four sub-asks: objectives of water demand management, typical locations of losses (sketch), the types of tubewell technology in Bangladesh, and the sketch of reverse rotary recirculation drilling.' }),
  'ev-2017-18-4a': m([WS], ['a-ws-sw-gw'], { extra: 'Only the **water quality differences** (suspended solids, microbes, minerals, Fe / Mn / As, depletion). The treatment process diagrams for surface and ground water are Tanvir sir’s topic.', notes: [NOTE_SW] }),
  'ev-2017-18-8b': m([DIST], ['a-dist-continuous']),
  'ev-2017-18-8c': m([DIST], ['a-dist-deadend']),

  // ---------------- Jan 2021 ----------------
  'ev-jan-2021-2a': m([WS], ['a-ws-sw-gw'], { extra: 'Only the **surface vs groundwater** quality difference here. The three major activities of a Water Safety Plan (Rowshan ma’am) and the treatment flow diagrams (Tanvir sir) are not covered here.' }),
  'ev-jan-2021-5a': m([WS], ['a-ws-planning'], { extra: '12 marks: the eight factors with a line each; add the township facts (200 acres, Uttara 3rd phase).' }),
  'ev-jan-2021-7a': m([GW], ['a-gw-flow-well', 'a-gw-dupuit']),
  'ev-jan-2021-7b': m([GW], ['a-gw-salt'], { ...tb(FLAG_SALT, { from: ['seniors', 'textbook'] }), extra: 'Coastal Bangladesh: add that sea-level rise, low dry-season river flow and heavy pumping worsen the intrusion.' }),
  'ev-jan-2021-7c': m([WS], ['a-ws-hydro']),
  'ev-jan-2021-8b': m([WELL], ['a-well-sinking']),

  // ---------------- 2020-21 ----------------
  'ev-2020-21-1a': m([WS], ['a-ws-elements']),
  'ev-2020-21-1b': m([DEM], ['a-dem-pc-factors'], { extra: 'Only four are asked: **rates and metering, nature of supply, water quality, climatic condition**.' }),
  'ev-2020-21-5d': m([GW], ['a-gw-salt'], { ...tb(FLAG_SALT, { from: ['seniors', 'textbook'] }) }),
  'ev-2020-21-6b': m([GW], ['a-gw-dupuit']),
  'ev-2020-21-7c': m([WS], ['a-ws-sw-gw'], { extra: 'Frame it for a **municipal** supply: quantity needed, treatment cost, reliability, Dhaka as the example.' }),

  // ---------------- 2021-22 ----------------
  'ev-2021-22-2a': m([WS], ['a-ws-sw-gw'], { extra: 'Only the **surface vs groundwater** difference here. The 7 steps of a Water Safety Plan (Rowshan ma’am) and the treatment flow diagrams (Tanvir sir) are not covered here.' }),
  'ev-2021-22-5a': m([DEM], ['a-dem-pc-factors'], { extra: '20 marks: name all twelve factors and state how each influences consumption.' }),
  'ev-2021-22-5b': m([POP], ['a-pop-methods', 'a-pop-best'], { notes: ['Uttara 3rd phase: no census record, so comparative graphical (with similar developed areas) is the best method; see the second answer.'] }),
  'ev-2021-22-6a': m([WS], ['a-ws-design']),
  'ev-2021-22-6b': m([GW], ['a-gw-dupuit'], { extra: 'The derivation only here; the flow of the 300 mm well is solved in the numbers section.' }),
  'ev-2021-22-7a': m([WS, GW], ['a-ws-hydro', 'a-gw-flow-well'], { extra: 'Mine: **(i) hydrologic cycle** (with a diagram) and **(ii) cone of depression** (sketch). (iii) Water hammer is Rowshan ma’am’s topic and is not covered here.' }),
  'ev-2021-22-7b': m([DIST], ['a-dist-layouts']),

  // ---------------- 2022-23 ----------------
  'ev-2022-23-5a': m([GW], ['a-gw-thiem'], { extra: 'The derivation (10 marks) and the **assumptions** (8 marks, the second part of the answer); the estimate of K is solved in the numbers section.' }),
  'ev-2022-23-5b': m([GW], ['a-gw-storage'], { extra: 'Define **storativity** and **specific yield**; the water lost from storage is solved in the numbers section.' }),
  'ev-2022-23-5c': m([WELL], ['a-well-types', 'a-well-no6'], { extra: 'Four sub-asks: the tubewell technologies, the **maximum static water level for a No. 6 pump (about 7.5 m)** and why, the pump type for a lower level (**deep-set: Tara, Tara II, Moon, Bangla, Mark-II**) and its abstraction limit (about 30 m from the static level; Tara about 15 m below ground).' }),
  'ev-2022-23-6a': m([DEM], ['a-dem-pc-factors', 'a-dem-nrw'], { ...tb(FLAG_NRW), extra: 'Three factors only: **pressure of water, quality of water, sewerage facilities** (about 2 marks each), then NRW.' }),
  'ev-2022-23-7b': m([GW], ['a-gw-notes-aqt']),
  'ev-2022-23-8b': m([DIST], ['a-dist-methods'], { extra: 'Only part (iii): the **methods of water distribution** (gravity, direct pumping, indirect pumping with storage) with merits and demerits, 10 marks. (i) The Fe-As treatment is Tanvir sir’s and (ii) the pump curves are Rowshan ma’am’s topic.', notes: ['"Distribution network methods" is read as the methods of distribution (gravity, pumping, combined). If you think layouts are meant, add the layouts answer.'] }),

  // ---------------- 2023-24 ----------------
  'ev-2023-24-5a': m([GW], ['a-gw-formations', 'a-gw-storage'], { extra: 'Part 1 (8 marks): aquifer, aquitard, aquiclude, aquifuge with a labelled sketch. Part 2 (7 marks): why the specific yield of an unconfined aquifer is "unconfined storativity", with the sketch of the falling water table.' }),
  'ev-2023-24-5c': m([DEM], ['a-dem-fire'], { ...tb(FLAG_FIRE, { from: ['ce22', 'textbook'] }) }),
  'ev-2023-24-6b': m([POP], ['a-pop-methods'], { extra: 'Name the methods and give the **applicability** column of the table (large old city, new industrial town, saturating town, similar cities, regional).' }),
  'ev-2023-24-6c': m([WS], ['a-ws-elements'], { extra: 'Only the first part (3 marks): the **major elements of a water supply**, the four blocks. The sustainability of rainwater harvesting is Rowshan ma’am’s topic and is not covered here.' }),
  'ev-2023-24-7a': m([WELL], ['a-well-bd-issues', 'a-well-failure'], { ...tb('The reasons of tubewell failure in the slides are incrustation and corrosion; the other three (clogging, falling water table, mechanical failure) are textbook additions.', { from: ['ce22', 'textbook'] }), extra: 'Part 1 (4 marks): the major issues, one line each. Part 2 (6 marks): the reasons of failure with a line of explanation each.' }),
  'ev-2023-24-7c': m([DIST], ['a-dist-methods'], { extra: 'Only the merits and demerits of **(i) indirect pumping with storage** and **(ii) direct connection to the water main**; two or three of each.' }),
}
