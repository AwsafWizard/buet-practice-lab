// Tanvir sir's theory parts: how each past-paper part is answered (see docs/CE331_AUTHORING.md).
// Number-type parts live in ta-math.tsx; a part that asks both gets only its theory sub-ask here.
import type { EvPartMap, EvSource, EvTopicId } from '../types'

const WQ = 'ev-wq' as const
const AER = 'ev-aer' as const
const SED = 'ev-sed' as const
const COAG = 'ev-coag' as const
const SOFT = 'ev-soft' as const
const IX = 'ev-ix' as const
const FILT = 'ev-filt' as const
const DIS = 'ev-dis' as const
const ATT = 'ev-att' as const
const FE = 'ev-fe' as const

const m = (topics: EvTopicId[], ans: string[], extra?: Partial<EvPartMap>): EvPartMap => ({ topics, ans, from: ['ce22'], ...extra })
const tb = (s: string): Partial<EvPartMap> => ({ from: ['ce22', 'textbook'] as EvSource[], notes: [s] })

const FLAG_HYP = 'The three named hypotheses (cell wall, cell permeability, protoplasm / enzymes) are not listed in this term’s slides, which only say chlorine acts on enzymes, protoplasm and the cell wall. Answered from the textbook.'
const FLAG_PLATE = 'The CE22 slides contain only the class-note plate-settler sketch; the advantage list is the standard textbook one.'
const FLAG_DESAL = 'The CE22 slides cover only RO and electrodialysis; distillation, freezing and other methods are textbook.'
const NOTE_SRC = 'Rows for Cr, Pb, Fe, CO₂ and H₂S are textbook; colour, taste and odour, nitrate and coliform are from the CE22 slides.'
const NOTE_SIG = 'Dissolved oxygen, CO₂ and pesticides rows are textbook; the others are in the CE22 slides.'
const NOTE_MNEQ = 'The T13 slides carry no equations; the oxidation and sorption equations are the standard textbook forms.'

export const TA_MAP: Record<string, EvPartMap> = {
  // ---------------- 2007-08 ----------------
  'ev-2007-08-3b': m([ATT, WQ], ['a-att-ro-ed', 'a-wq-pm-alk', 'a-wq-turb-colour']),
  'ev-2007-08-4a': m([FILT, AER], ['a-filt-ssf-removal', 'a-aer-optimize']),
  'ev-2007-08-4b': m([FE, WQ], ['a-fe-as-ioniz', 'a-fe-as-methods', 'a-wq-significance'], {
    ...tb(NOTE_SIG),
    extra: 'Second sub-ask (significance): write only the **Arsenic**, **Carbon dioxide** and **Manganese** rows of the table. Three methods: A, B and C of the flow diagrams.',
  }),
  'ev-2007-08-6a': m([FE], ['a-fe-conditions', 'a-fe-diff'], { extra: 'Part two: use the Iron and Manganese columns of the comparison table (Mn: slow by aeration, needs pH above 9 or chemical oxidation above 8.5, catalysis and sorption).' }),
  'ev-2007-08-6b': m([SED], ['a-sed-sor']),
  'ev-2007-08-6c': m([DIS], ['a-dis-mech', 'a-dis-pre-post'], {
    from: ['textbook', 'ce22'],
    flag: FLAG_HYP + ' Pre- vs post-chlorination is also not in the slides.',
    extra: 'Only **two** mechanisms are asked: give damage to the cell wall and alteration of cell permeability in full, and mention the protoplasm / enzyme effect briefly.',
  }),
  'ev-2007-08-6d': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Write only the **Nitrate**, **E. coli** and **Colour** rows.' }),
  'ev-2007-08-7a': m([SOFT], ['a-soft-nch']),
  'ev-2007-08-7b': m([COAG], ['a-coag-dlc-vs-an', 'a-coag-dlc', 'a-coag-camp'], { extra: 'Distinguish first (table), then CAMP number (Gt) in 3–4 lines.' }),

  // ---------------- 2008-09 ----------------
  'ev-2008-09-5a': m([WQ], ['a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Rows to write: **Turbidity**, **Manganese**, **Fluoride**, **Lead**, **E. coli**.' }),
  'ev-2008-09-5b': m([SED], ['a-sed-plate'], { from: ['notes', 'textbook'], flag: FLAG_PLATE, extra: 'A tube settler is the same idea with tubes instead of plates: draw the plates / tubes at about 60° with the flow up and the sludge sliding down.' }),
  'ev-2008-09-5c': m([FE], ['a-fe-ph']),
  'ev-2008-09-5d': m([SOFT], ['a-soft-recarb']),
  'ev-2008-09-6a': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Rows: **Iron**, **Colour**, **Nitrate**, **Chromium**, **CO₂**.' }),
  'ev-2008-09-6b': m([FILT], ['a-filt-ssf-removal']),
  'ev-2008-09-6c': m([AER], ['a-aer-optimize']),
  'ev-2008-09-6d': m([DIS], ['a-dis-mech'], { from: ['textbook', 'ce22'], flag: FLAG_HYP }),
  'ev-2008-09-7a': m([FE], ['a-fe-lowalk']),
  'ev-2008-09-7b': m([SOFT], ['a-soft-flow-lowalk']),
  'ev-2008-09-8b': m([COAG, ATT, WQ], ['a-coag-dlc-vs-an', 'a-att-ro-ed', 'a-wq-acidity', 'a-wq-turb-colour'], { ...tb('Mineral vs natural acidity is not in the CE22 slides (textbook).'), extra: 'Four short distinctions, about 2 marks each: one table row of the answer is enough for each.' }),
  'ev-2008-09-8c': m([COAG, DIS, ATT], ['a-coag-camp', 'a-dis-thm', 'a-att-ac-use', 'a-dis-bp'], { ...tb('Applications of activated carbon and the advantages of breakpoint chlorination are textbook consequences of the CE22 slides.'), extra: 'Short notes: (i) CAMP number, (ii) THM prevention, (iii) activated carbon applications, (iv) advantages of breakpoint chlorination (the list under the curve).' }),

  // ---------------- 2009-10 ----------------
  'ev-2009-10-3a': m([COAG], ['a-coag-forces', 'a-coag-dlc']),
  'ev-2009-10-3b': m([DIS], ['a-dis-mech'], { from: ['textbook', 'ce22'], flag: FLAG_HYP }),
  'ev-2009-10-3c': m([FE], ['a-fe-lowalk']),
  'ev-2009-10-4a': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Rows: **Nitrate**, **Coliform**, **Colour**, **Odour and taste**.' }),
  'ev-2009-10-4b': m([ATT], ['a-att-desal'], { from: ['ce22', 'textbook'], flag: FLAG_DESAL, extra: 'Only the methods are asked (list): reverse osmosis, electrodialysis, distillation, freezing, ion exchange.' }),
  'ev-2009-10-7a': m([FILT], ['a-filt-mech']),
  'ev-2009-10-7b': m([SED], ['a-sed-sor'], { extra: 'Argue that Q/A (surface area) fixes the removal; depth only changes detention time (see point 5 of the answer).' }),
  'ev-2009-10-7c': m([FE], ['a-fe-diff'], { extra: 'Compare only the **Arsenic** and **Manganese** columns.' }),
  'ev-2009-10-8a': m([WQ], ['a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Rows: **Fluoride**, **Turbidity**, **Carbon dioxide**, **Manganese**.' }),
  'ev-2009-10-8b': m([SOFT], ['a-soft-soda']),

  // ---------------- 2010-11 ----------------
  'ev-2010-11-3b': m([FE], ['a-fe-as-ioniz', 'a-fe-as-methods'], { notes: ['Three methods (A, B, C) as in the exam convention.'] }),
  'ev-2010-11-3c': m([WQ], ['a-wq-carbonic']),
  'ev-2010-11-4a': m([WQ], ['a-wq-bd-health'], { ...tb('Health effects of As, F, Fe/Mn and nitrate are in T02; the Bangladesh context is textbook.') }),
  'ev-2010-11-4b': m([SED], ['a-sed-plate'], { from: ['notes', 'textbook'], flag: FLAG_PLATE, notes: ['"Water" in the printed question stands for "What".'] }),
  'ev-2010-11-4c': m([DIS], ['a-dis-mech'], { from: ['textbook', 'ce22'], flag: FLAG_HYP }),
  'ev-2010-11-4d': m([AER], ['a-aer-types']),
  'ev-2010-11-5a': m([WQ], ['a-wq-causes']),
  'ev-2010-11-5b': m([FILT], ['a-filt-mech']),
  'ev-2010-11-5c': m([SOFT], ['a-soft-ph-alk']),
  'ev-2010-11-5d': m([ATT], ['a-att-desal'], { from: ['ce22', 'textbook'], flag: FLAG_DESAL }),
  'ev-2010-11-6a': m([FE], ['a-fe-mn-cat'], tb(NOTE_MNEQ)),
  'ev-2010-11-6b': m([WQ], ['a-wq-indicator']),

  // ---------------- 2011-12 ----------------
  'ev-2011-12-3a': m([WQ], ['a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Rows: **Sulfate**, **Turbidity**, **Dissolved oxygen**, **Manganese**.' }),
  'ev-2011-12-3b': m([WQ], ['a-wq-carbonic']),
  'ev-2011-12-3c': m([DIS], ['a-dis-bp', 'a-dis-thm'], tb('Advantages of breakpoint chlorination are the textbook consequences of the curve on the slide.')),
  'ev-2011-12-3d': m([SOFT], ['a-soft-soda']),
  'ev-2011-12-3e': m([COAG], ['a-coag-vs-floc']),
  'ev-2011-12-4a': m([FE], ['a-fe-mn-cat'], tb(NOTE_MNEQ)),
  'ev-2011-12-5a': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Rows: **E. coli**, **Chromium**, **CO₂**, **Nitrate**.' }),
  'ev-2011-12-5b': m([FE], ['a-fe-conditions'], { extra: 'List the factors: pH above 7.3, alkalinity above 130 mg/L, no organic matter, oxidant / oxygen, catalyst, temperature and time.' }),
  'ev-2011-12-5c': m([SED], ['a-sed-plate'], { from: ['notes', 'textbook'], flag: FLAG_PLATE }),
  'ev-2011-12-5d': m([AER], ['a-aer-objectives', 'a-aer-optimize']),
  'ev-2011-12-6a': m([ATT], ['a-att-ro-ed']),
  'ev-2011-12-6b': m([FILT], ['a-filt-ssf-removal']),
  'ev-2011-12-6c': m([FE], ['a-fe-as-methods'], { extra: 'Two methods asked: write **A (oxidation + FeCl₃ or alum floc)** and **B (lime to pH above 9 + floc)**.' }),

  // ---------------- 2012-13 ----------------
  'ev-2012-13-3c': m([COAG, IX, ATT], ['a-coag-vs-floc', 'a-att-ac-vs-ix', 'a-att-ro-ed'], { extra: 'Three short distinctions (about 4–5 marks each): (i) coagulation vs flocculation, (ii) ion exchange vs activated carbon, (iii) RO vs ED.' }),
  'ev-2012-13-3d': m([DIS], ['a-dis-thm']),
  'ev-2012-13-4a': m([WQ], ['a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Rows: **Sulfate**, **Fluoride**, **Carbon dioxide**, **Arsenic**.' }),
  'ev-2012-13-4b': m([WQ], ['a-wq-carbonic']),
  'ev-2012-13-4c': m([SOFT], ['a-soft-soda']),
  'ev-2012-13-4d': m([FE], ['a-fe-mn-cat'], tb(NOTE_MNEQ)),
  'ev-2012-13-7a': m([FILT], ['a-filt-ssf-rsf'], { extra: 'Four rows only: bacteria removal mechanism, method of cleaning, rate of filtration, effective grain size D₁₀.' }),
  'ev-2012-13-7b': m([DIS], ['a-dis-mech'], { from: ['textbook', 'ce22'], flag: FLAG_HYP, extra: 'A list is enough: cell wall damage, cell permeability change, protoplasm / enzyme inactivation.' }),
  'ev-2012-13-8a': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Rows: **E. coli**, **Chromium**, **Odour and taste**, **Nitrate**.' }),
  'ev-2012-13-8b': m([FE], ['a-fe-as-methods', 'a-fe-conditions'], { extra: 'Two methods (A and B), then the factors affecting iron oxidation and precipitation.' }),
  'ev-2012-13-8c': m([SED], ['a-sed-sor']),

  // ---------------- 2015-16 ----------------
  'ev-2015-16-3a': m([SED], ['a-sed-plate', 'a-sed-sor'], { extra: 'The reverse rotary recirculation drilling sketch is Snigdha ma’am’s topic (tubewells), not part of this block.' }),
  'ev-2015-16-4a': m([WQ], ['a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Rows: **Carbon dioxide**, **Dissolved oxygen** (O₂), **Fluoride**, **Pesticides**.' }),
  'ev-2015-16-4b': m([FILT, SOFT], ['a-filt-mech', 'a-filt-ssf-removal', 'a-soft-recarb', 'a-soft-twostage'], {
    from: ['ce22', 'textbook'],
    flag: 'Two-stage recarbonation is not in the CE22 slides (textbook).',
    extra: 'The "theory of flocculation, sedimentation and adsorption" in the granular filter is the non-straining part of the filtration answer (converging flow flocculates, pores settle, grains adsorb).',
  }),
  'ev-2015-16-4c': m([FE], ['a-fe-mn-cat'], { ...tb(NOTE_MNEQ), extra: 'Asked for soluble metal ions generally: write the process for Fe and Mn together; the equations for iron are 4Fe²⁺ + O₂ + 10H₂O → 4Fe(OH)₃ + 8H⁺ and for manganese as in the answer.' }),
  'ev-2015-16-5a': m([WQ], ['a-wq-sources'], {
    from: ['ce22', 'textbook'],
    notes: [NOTE_SRC],
    flag: 'WHO guideline values for colour, odour and taste are not health-based; the slides give only the ECR 1997 / WHO 2011 table (arsenic WHO 0.01, BD 0.05 mg/L; colour 15 Hazen BD).',
    extra: '**WHO / BD values:** arsenic WHO 0.01 mg/L (Bangladesh 0.05); colour 15 Hazen units (BD), no health-based WHO value, acceptable to consumers; odour: odourless / acceptable; taste: acceptable. Rows: **Colour**, **Odour and taste**, **Arsenic**.',
  }),
  'ev-2015-16-5b': m([COAG], ['a-coag-dlc', 'a-coag-camp'], { extra: 'The "practical example in nature" is the estuary: clay carried by a river is coagulated by the salts of sea water (last point of the double-layer answer).' }),
  'ev-2015-16-5c': m([ATT], ['a-att-ac-use'], tb('Advantages of activated carbon are the textbook consequences of the T12 slide properties.')),
  'ev-2015-16-6a': m([DIS], ['a-dis-bp', 'a-dis-thm'], tb('Advantages of breakpoint chlorination and the THM control list combine the T10 slides with the textbook.')),
  'ev-2015-16-6b': m([AER], ['a-aer-objectives', 'a-aer-optimize']),

  // ---------------- 2016-17 ----------------
  'ev-2016-17-3b': m([FE, AER], ['a-fe-diff', 'a-aer-objectives', 'a-aer-optimize'], { extra: 'The reverse rotary recirculation drilling sketch is Snigdha ma’am’s topic and is not covered here. For Fe vs Mn use the Iron and Manganese columns (Mn also adds adsorption on Fe(OH)₃ / MnO₂).' }),
  'ev-2016-17-4a': m([WQ, FILT], ['a-wq-significance', 'a-filt-mech'], { ...tb(NOTE_SIG), extra: 'Rows: **Sulfate**, **Hardness**, **Dissolved oxygen**, **Manganese**; then the filtration mechanisms with the diagram.' }),
  'ev-2016-17-4b': m([WQ, SOFT, ATT, IX], ['a-wq-carbonic', 'a-soft-soda', 'a-att-ac-vs-ix', 'a-att-gac-pac'], { extra: 'Four sub-asks in order: carbonic species sketch, soda ash and recarbonation, activated carbon vs ion exchange, advantages of GAC over PAC (last paragraph of the GAC / PAC answer).' }),
  'ev-2016-17-5a': m([WQ], ['a-wq-sources'], { ...tb(NOTE_SRC), extra: 'Rows: **E. coli**, **Lead**, **H₂S**, **Nitrate**.' }),
  'ev-2016-17-5b': m([DIS], ['a-dis-mech'], { from: ['textbook', 'ce22'], flag: FLAG_HYP }),
  'ev-2016-17-5c': m([COAG], ['a-coag-camp', 'a-coag-factors']),
  'ev-2016-17-5d': m([SED, ATT], ['a-sed-plate', 'a-att-ro-ed'], { from: ['notes', 'textbook'], flag: FLAG_PLATE }),
  'ev-2016-17-6a': m([SOFT], ['a-soft-ph-alk']),
  'ev-2016-17-6b': m([FE], ['a-fe-as-ph-iron']),

  // ---------------- 2017-18 ----------------
  'ev-2017-18-4a': m([WQ, FE], ['a-wq-sw-gw', 'a-fe-trains']),
  'ev-2017-18-4b': m([SOFT], ['a-soft-split'], { extra: 'Theory sub-asks only (advantages of split treatment, when it is done). The lime and soda ash dosages are in the worked solution.' }),
  'ev-2017-18-5a': m([IX], ['a-ix-demin']),
  'ev-2017-18-5b': m([ATT], ['a-att-ro-apps', 'a-att-ro-ed']),
  'ev-2017-18-5c': m([FE], ['a-fe-lowalk', 'a-fe-as-theory'], { extra: 'Strategies when alkalinity is insufficient: the three methods of the low-alkalinity answer (8 marks); then the theory and process of arsenic removal (7 marks).' }),
  'ev-2017-18-6a': m([DIS, FILT, COAG, AER], ['a-dis-dbp', 'a-filt-backwash', 'a-coag-sweep', 'a-aer-twofilm'], { extra: 'Four short notes at 5 marks each.' }),

  // ---------------- Jan 2021 ----------------
  'ev-jan-2021-3a': m([COAG, SOFT], ['a-coag-dose', 'a-soft-split']),
  'ev-jan-2021-3b': m([ATT, FILT], ['a-att-ro-ed', 'a-filt-dual']),
  'ev-jan-2021-4a': m([IX, FE, FILT], ['a-ix-softening', 'a-ix-breakthrough', 'a-fe-mn-cat', 'a-filt-mech'], { ...tb(NOTE_MNEQ), extra: 'Four short notes: (iv) is the non-straining mechanisms part of the filtration answer (impaction, hydrodynamic forces, interception, diffusion, attraction forces, sedimentation).' }),

  // ---------------- 2020-21 ----------------
  'ev-2020-21-5b': m([FILT], ['a-filt-media', 'a-filt-rough']),
  'ev-2020-21-5c': m([FILT], ['a-filt-dual']),
  'ev-2020-21-6a': m([COAG], ['a-coag-dlc', 'a-coag-dlc-vs-an', 'a-coag-sweep']),
  'ev-2020-21-7a': m([IX, ATT, SOFT], ['a-ix-vs-lime', 'a-att-ro-ed']),
  'ev-2020-21-8a': m([FE], ['a-fe-asfe-high']),
  'ev-2020-21-8d': m([WQ], ['a-wq-pops'], { from: ['textbook'], flag: 'POPs and CECs are not in this term’s slides or class notes; answered from the textbook.' }),

  // ---------------- 2021-22 ----------------
  'ev-2021-22-3a': m([FILT, FE], ['a-filt-mech', 'a-fe-mn-theory', 'a-fe-as-theory'], { extra: 'Straining and non-straining: the first two sections of the filtration answer. Then Mn theory and criteria, and As theory and criteria.' }),
  'ev-2021-22-3b': m([SED, COAG, SOFT, IX], ['a-sed-sor', 'a-coag-dlc', 'a-soft-split', 'a-ix-demin'], { extra: 'Four short notes at 5 marks each, with the diagrams of the answers.' }),
  'ev-2021-22-4a': m([SOFT], ['a-soft-bar'], { extra: 'Sketch part only: bar diagrams of the finished water for (a) selective calcium removal and (b) removal to practical limits. Dosages are in the worked solution.' }),
  'ev-2021-22-4b': m([COAG], ['a-coag-dose']),
  'ev-2021-22-4c': m([DIS], ['a-dis-ideal']),

  // ---------------- 2022-23 ----------------
  'ev-2022-23-2b': m([ATT], ['a-att-prep', 'a-att-gac-pac']),
  'ev-2022-23-3b': m([FILT, ATT], ['a-filt-backwash', 'a-filt-dual', 'a-att-phys-chem']),
  'ev-2022-23-4b': m([SOFT, FILT, COAG, FE], ['a-soft-recarb', 'a-filt-rough', 'a-coag-dlc', 'a-fe-diff'], { extra: 'Four short notes at 5 marks each: (i) stabilisation and recarbonation, (ii) roughing filtration, (iii) double-layer compression, (iv) Fe, Mn and As oxidation (the comparison table).' }),
  'ev-2022-23-8b': m([FE], ['a-fe-asfe-high', 'a-fe-asfe-low', 'a-fe-as-methods'], {
    from: ['ce22', 'textbook'],
    notes: ['Only sub-part (i) (6 marks) belongs here. The pump performance curves are Rowshan ma’am’s and the distribution methods Snigdha ma’am’s.'],
    flag: 'Bangladesh-specific technologies (community arsenic-iron removal plants, household units) are not in the T13 slides; the process principles (aeration, oxidation, co-precipitation, filtration) are.',
    extra: '**Technology for Fe-As problem areas:** aeration to oxidise Fe(II) → flocculation / sedimentation → sand filtration, with chlorine or potash to oxidise As(III) and Fe(OH)₃ flocs to co-precipitate arsenic (iron-rich water needs no added coagulant; low-iron water gets FeCl₃ or alum).',
  }),

  // ---------------- 2023-24 ----------------
  'ev-2023-24-1a': m([WQ], ['a-wq-natural-hardness', 'a-wq-significance'], { ...tb(NOTE_SIG), extra: 'Second sub-ask (6 marks): rows **Chloride**, **Fluoride**, **Nitrogen**.' }),
  'ev-2023-24-2a': m([FILT], ['a-filt-mech', 'a-filt-ssf-rsf']),
  'ev-2023-24-2c': m([SOFT], ['a-soft-split'], { extra: 'Sketch sub-ask only: the split-treatment flow scheme (figure). The split fraction and chemical doses are in the worked solution.' }),
  'ev-2023-24-4a': m([FE], ['a-fe-asfe-low'], { notes: ['The Water Safety Plan activities and steps (first half) are Rowshan ma’am’s block.'] }),
  'ev-2023-24-4b': m([COAG], ['a-coag-mech']),
  'ev-2023-24-4c': m([ATT, IX], ['a-att-ads-mech'], { extra: 'Theory sub-ask only (3 marks): the mechanisms of adsorption. The ion exchange softener calculation is in the worked solution.' }),
}
