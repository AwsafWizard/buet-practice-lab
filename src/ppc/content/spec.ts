// pc-spec — specifications (why, attributes, PPR r.29, structure, samples) and the BoQ (IA sir).
// Sources: IA sir’s “7. Specification” slides; the 18-batch term-final solve and Nafee bhai’s note
// (CE301/Claude digests/v2_ia_solves.md, v2_ia_notes.md); PPR 2008.
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-spec' as const

// ---------- BoQ items, word for word (18-batch term-final solve pp.37–40; Nafee bhai's note p.30) ----------
// The past-paper map (pyq/ia.ts) prints its BoQs from these too, so the wording is the same everywhere.

/** the class columns (latest edition of the PWD schedule) */
const BOQ_COLS = `| Item No. | Description | Unit | Quantity | Unit Price | Amount | In Word |
|---|---|---|---|---|---|---|`

/** the one line to write under every BoQ */
export const BOQ_NOTE =
  'Unit and quantity are filled in; the unit price, the amount and the amount in words are left blank for the tenderer. Ishtiaque sir: “Quantity and unit are to be included but not rate and amount.”'

/** heading row 6 of the RCC item (latest edition) */
export const RCC_HEAD =
  'RCC WORKS: 1:1.5:3 (measured on gross concrete section) (f′c = 25 MPa, minimum f′cr = 33.5 MPa in nominal mix 1 : 1.5 : 3), with stone chips (100% sand of F.M. 2.2)'

/** item 6.1, latest edition: “Very important for TF … this is the latest one” */
export const RCC_61 =
  'Reinforced cement concrete works with minimum cement content relates to mix ratio 1:1.5:3 having maximum water cement ratio = 0.40 and minimum f′cr = 33.5 MPa, satisfying a specified compressive strength f′c = 25 MPa at 28 days on standard cylinders as per standard practice of Code ACI/BNBC/ASTM, Cement conforming to BDS EN-197-1-CEM-I, 52.5N (52.5 MPa) / ASTM-C 150 Type – I, best quality Sylhet sand or coarse sand of equivalent F.M. 2.2 and 20 mm down well graded stone chips conforming to ASTM C-33 (Aggregate grading as per table shown in technical specification), conducting necessary tests, making and placing shutter in position and maintaining true to plumb, making shutter water-tight properly, placing reinforcement in position; mixing with standard mixer machine with hopper, fed by standard measuring boxes, casting in forms, compacting by vibrator machine and curing at least for 28 days, removing centering-shuttering after specified time approved; including cost of water, electricity, other charges etc. all complete, approved and accepted by the Engineer-in-charge. (Rate is excluding laboratory test fees, the cost of reinforcement and its fabrication, placing, binding etc. and the cost of shuttering & centering)'

/** the earlier edition of the RCC item (the 18-batch solve of “100 m³ of concrete in foundation”) */
export const RCC_OLD =
  'Reinforced cement concrete works using wooden shutter with minimum cement content relates to mix ratio 1:1.5:3 having minimum f′cr = 30 MPa, and satisfying a specified compressive strength f′c = 25 MPa at 28 days on standard cylinders as per standard practice of Code ACI/BNBC/ASTM & Cement conforming to BDS EN-197-1-CEM 1 (32.5 to 52.5 N) / ASTM-C 150 Type – I, best quality Sylhet sand or coarse sand of equivalent F.M. 2.2 and 20 mm down well graded stone chips conforming to ASTM C-33, making, placing shutter in position and maintaining true to plumb, making shutter water-tight properly, placing reinforcement in position; mixing with standard mixer machine with hopper, fed by standard measuring boxes, casting in forms, compacting by vibrator machine and curing at least for 28 days, removing centering-shuttering including cost of water, electricity, testing and other charges etc. all complete approved and accepted by the Engineer. (Rate is excluding the cost of reinforcement and its fabrication, binding, welding and placing)'

/** the 1:2:4 item the 18-batch solve wrote for a foundation mat (item 07 / 07.1) */
export const RCC_MAT_OLD =
  'Reinforced cement concrete works with minimum cement content relates to mix ratio 1:2:4 having maximum water cement ratio = 0.45 and minimum f′cr = 26 MPa, satisfying a specified compressive strength f′c = 19 MPa at 28 days on standard cylinders as per standard practice of Code ACI/BNBC/ASTM, cement conforming to BDS EN-197-1-CEM-I, 52.5N (52.5 MPa) / ASTM-C 150 Type – I, best quality sand (50% quantity of best local sand (F.M. 1.2) and 50% quantity of Sylhet sand or coarse sand of equivalent F.M. 2.2) and 20 mm down well graded picked Jhama brick chips conforming to ASTM C-33 including conducting necessary tests.'

/** bridge superstructure: the class item adapted (typed note, written by a current-batch student; no senior solve exists) */
export const RCC_BRIDGE =
  'Reinforced cement concrete works in deck slab, main girders and cross girders of bridge super-structure with minimum cement content relates to mix ratio 1:1.5:3 having maximum water cement ratio 0.40 and minimum f′cr = 33.5 MPa satisfying a specified compressive strength f′c = 25 MPa at 28 days on standard cylinders as per ACI/BNBC/AASHTO/ASTM, cement conforming to BDS EN-197-1-CEM-I 52.5N / ASTM C-150 Type-I, Sylhet sand of F.M. 2.2 and 20 mm down well graded stone chips conforming to ASTM C-33, including conducting necessary tests, making, placing and maintaining steel shutter and staging true to line and level, placing reinforcement in position, mixing with standard mixer machine, casting, compacting by vibrator, curing for at least 28 days, removing shuttering after specified time, including cost of water, electricity and other charges etc. all complete and accepted by the Engineer. (Rate excludes the cost of reinforcement and its fabrication.)'

/** brick work, 250 mm wall in superstructure (the 18-batch solve of “250 mm thick, 50 m³”) */
export const BRICK_SUPER =
  'Brick works of width one brick length with first class bricks in cement sand (F.M. 1.2) mortar (1:6) in superstructure including raking out joints, filling the interstices with mortar, cleaning and soaking the bricks at least for 24 hours before use and washing of sand, necessary scaffolding, curing at least for 7 days etc. all complete (measurement to be given as 250 mm width for one brick length and 375 mm for one brick and a half brick length) and accepted by the Engineer. (Cement: CEM-II/A-M) In ground floor.'

/** brick work in foundation and plinth (item 19 / 19.1 of Nafee bhai's note) */
export const BRICK_PLINTH =
  'Brick works with first class bricks in cement sand (F.M. of sand 1.2) mortar (1:6) in foundation and plinth, filling the joints/interstices fully with mortar, racking out the joints, cleaning and soaking the bricks at least for 24 hours before use and curing at least for 7 days etc. all complete including cost of water, electricity and other charges and accepted by the Engineer. (Cement: CEM-II/A-M)'

/** sub-items of 6.1 with the sample quantities of the class copy (a whole building) */
export const RCC_SUBS: [no: string, name: string, qty: string][] = [
  ['6.1.1', 'Individual & combined footing', '47.9'],
  ['6.1.2', 'Column', '98.1'],
  ['6.1.3', 'Foundation beam up to plinth level', '32.18'],
  ['6.1.4', 'Rectangular beam', '104.75'],
  ['6.1.5', 'Floor slab', '35.76'],
  ['6.1.6', 'Roof slab', '17.87'],
  ['6.1.7', 'Lintel', '8.52'],
  ['6.1.8', 'Staircase slab and steps', '59.98'],
]

/** a BoQ in the class columns: rows are [item no., description, unit, quantity]; the last three columns stay blank */
export const boqTable = (rows: [no: string, desc: string, unit?: string, qty?: string][]) =>
  `${BOQ_COLS}\n${rows.map(([no, desc, unit = '', qty = '']) => `| ${no} | ${desc} | ${unit} | ${qty} | | | |`).join('\n')}`

/** the RCC item: heading 6, item 6.1 in full, then the sub-items that carry the unit and the quantity */
export const boqRcc = (subs: [no: string, name: string, qty: string][]) =>
  boqTable([['**6**', `**${RCC_HEAD}**`], ['6.1', RCC_61], ...subs.map(([no, name, qty]): [string, string, string, string] => [no, name, 'Cum', qty])])

/** one brick-work row */
export const boqBrick = (qty: string, desc = BRICK_SUPER, no = '1') => boqTable([[no, desc, 'cum', qty]])

const lists: PcList[] = [
  {
    id: 'l-spec-reasons',
    topic: T,
    title: 'Reasons for specifications',
    ask: 'Why is specification important in a construction contract?',
    points: [
      { k: 'States what an element consists of and how installed', alt: ['what and how', 'sufficient detail to construct', 'what it should consist of'], d: 'In sufficient detail so that it can be constructed.' },
      { k: 'Too many notes make drawings clumsy', alt: ['drawings clumsy', 'unreadable drawings', 'clumsy and unreadable'], d: 'Putting too much notes on drawings may make it clumsy and unreadable.' },
      { k: 'Workmanship hard to describe on a drawing', alt: ['workmanship', 'construction methods'], d: 'Describing workmanship or construction methods on a drawing is often more difficult than describing the materials in a specification.' },
    ],
    seen: ['Jan 2021', '2017-18', '2011-12'],
    src: 'IA sir “7. Specification” slide “Reasons for Specifications”; the solves copy these three word for word',
    note: 'The class answer has only these three. Extra points with no class source: it fixes quality and tests (PPR r.4(4)); it gives every tenderer the same non-restrictive description (PPA s.15); it is a contract document.',
  },
  {
    id: 'l-spec-attrs',
    topic: T,
    title: 'Qualities (attributes) of a good specification',
    ask: 'Describe the attributes of good specification.',
    points: [
      { k: 'Clarity', alt: ['clear'], d: 'Correct grammar, no ambiguity, the correct word for the exact meaning.' },
      { k: 'Correctness', alt: ['correct', 'accuracy'], d: 'Ideas and explanations presented accurately and precisely.' },
      { k: 'Completeness', alt: ['complete'], d: 'Nothing important left out.' },
      { k: 'Conciseness', alt: ['concise'], d: 'No unnecessary words — but not at the expense of clarity, correctness or completeness.' },
    ],
    hook: 'The 4 C’s, in slide order: Clarity, Correctness, Completeness, Conciseness (“Clear, Correct, Complete — then Cut”).',
    seen: ['Jan 2021', '2017-18', '2011-12'],
    src: 'IA sir “7. Specification” slide “Quality of Good Specification”',
  },
  {
    id: 'l-r29-info',
    topic: T,
    title: 'Information a PE must give when describing requirements (PPR r.29(1))',
    points: [
      { k: 'Name or description', alt: ['description'], d: '(a) of the goods, works or services.' },
      { k: 'Quality', alt: ['quality of goods'], d: '(b)' },
      { k: 'Performance standards and life span', alt: ['life span', 'performance standards'], d: '(c)' },
      { k: 'Safety standards and limits', alt: ['safety'], d: '(d)' },
      { k: 'Packaging, marking and labelling terms', alt: ['packaging', 'labelling', 'symbols, terminology'], d: '(e) symbols and terminology.' },
      { k: 'Processes and methods of production', alt: ['production process'], d: '(f) where applicable.' },
      { k: 'Test procedure for conformity', alt: ['test procedure', 'conformity assessment'], d: '(g)' },
    ],
    ordered: true,
    hook: 'N-Q-P-S-P-P-T: “Name Quality, Perform Safely, Pack, Produce, Test”.',
    seen: ['2013-14', 'Jan 2021'],
    src: 'PPR 2008 r.29(1)(a)–(g); IA sir “7. Specification” slides 1–2; Pallab’s solve uses it for Jan 2021 3(b)',
  },
  {
    id: 'l-r29-rules',
    topic: T,
    title: 'PPR r.29 rules for writing technical specifications',
    points: [
      { k: 'Performance or output based', alt: ['performance requirements', 'output'], d: 'Not tied to design or descriptive characteristics that limit competition (generator example).' },
      { k: 'International or national standards', alt: ['standards', 'generic names'], d: 'International standards where they exist, else national standards, codes or generic names.' },
      { k: 'No trade mark, brand, patent, origin', alt: ['no brand name', 'no trade name'], d: '4WD vehicle example.' },
      { k: '“Or similar or equivalent” if branded', alt: ['or equivalent'], d: 'Only when the PE lacks expertise for generic specs.' },
      { k: 'Prepared with user; ISO, IEC, BSTI', alt: ['ISO', 'IEC', 'BSTI', 'user cooperation'] },
      { k: 'Non-restrictive, consistent with drawings', alt: ['non-restrictive'], d: 'PPR r.4(5).' },
    ],
    seen: ['2013-14'],
    src: 'PPR r.29(2)–(5), 4(5); IA sir “7. Specification” slides 2–5',
  },
  {
    id: 'l-spec-heads',
    topic: T,
    title: 'Headings of the specification of concrete, in order',
    ask: 'Under which headings is the specification of concrete works written?',
    points: [
      { k: 'Materials', alt: ['material', 'major materials', 'material quality'], d: 'Cement, water, fine aggregate, coarse aggregate.' },
      { k: 'Mix ratio', alt: ['mix', 'proportioning'], d: '1:1.5:3.' },
      { k: 'Strength and curing', alt: ['strength', 'curing'], d: 'f′c = 25 MPa at 28 days; curing at least 28 days.' },
      { k: 'Transportation', alt: ['transport'], d: 'Without segregation, maintaining workability.' },
      { k: 'Compaction', alt: ['vibrator'], d: 'Mechanical vibrator.' },
      { k: 'Workmanship', alt: ['method'], d: 'The sentence shared with the BoQ item.' },
      { k: 'Testing', alt: ['tests', 'testing measurement'], d: 'ASTM C31, C33, C39.' },
      { k: 'Payment', alt: ['basis of payment'], d: 'Per cum rate.' },
      { k: 'Measurements', alt: ['measurement', 'basis of measurement'], d: 'In cum, to the nearest 1 cm.' },
    ],
    ordered: true,
    hook: 'First what goes in (Materials, Mix), then what it must reach (Strength and curing), then the journey of the concrete: Transport, Compact, Workmanship; then the paperwork: Test, Pay, Measure. After the last heading comes the BoQ item.',
    seen: ['Jan 2021', '2017-18', '2016-17', '2013-14', '2011-12'],
    src: '18-batch term-final solve pp.42–43',
    note: 'Nafee bhai’s typed version numbers seven heads: 1 Major Materials, 2 Proportioning, 3 Mix ratio, 4 Transportation, 5 Workmanship, 6 Testing, 7 Payment. IA sir’s slide lists the parts of a particular specification as material, workmanship, supplies, testing and quality control, measurement, payment.',
  },
  {
    id: 'l-spec-brick-heads',
    topic: T,
    title: 'Headings of the specification of brickwork, in order',
    ask: 'Under which headings is the specification of brick work written?',
    points: [
      { k: 'Material', alt: ['materials'], d: 'Brick type, cement, sand, water, mortar.' },
      { k: 'Workmanship', alt: ['method'], d: 'Filling interstices, raking out joints, soaking 24 hours, washing sand, scaffolding.' },
      { k: 'Laying', alt: ['bond', 'English bond'], d: 'English Bond, truly horizontal, true to plumb.' },
      { k: 'Curing', alt: ['cure'], d: 'At least for 7 days.' },
      { k: 'Testing', alt: ['tests'], d: 'ASTM C67.' },
      { k: 'Payment', alt: ['basis of payment'], d: 'Per cum rate as specified in the contract.' },
      { k: 'Measurement', alt: ['measurements'], d: 'Cubic metres ordered, placed and accepted; 250 mm and 375 mm widths.' },
    ],
    ordered: true,
    hook: 'Make it (Material, Workmanship, Laying), keep it wet (Curing), check it (Testing), then Pay and Measure.',
    seen: ['2017-18', '2013-14'],
    src: '18-batch term-final solve p.43; Nafee bhai’s note p.29 (“this one must be read”)',
  },
  {
    id: 'l-general-spec',
    topic: T,
    title: 'Contents of the general specification',
    points: [
      { k: 'General site facilities / requirements', alt: ['site facilities'] },
      { k: 'Health, safety and security', alt: ['safety', 'security measures'] },
      { k: 'Environmental protection, waste disposal', alt: ['environment', 'pollution'] },
      { k: 'Preparing the site for work', alt: ['site preparation'] },
    ],
    seen: [],
    src: 'IA sir GCC+TEC slide 5; Tender Document slide 8',
  },
  {
    id: 'l-em-reliability',
    topic: T,
    title: 'How a specification secures a reliable electro-mechanical product',
    ask: 'How shall the specification of electro-mechanical equipment ensure procurement of a reliable product?',
    points: [
      { k: 'Suppliers with top 10 annual turnover', alt: ['top 10 annual turnover', 'top ten turnover'], d: 'Demand supply from such companies, without naming a brand.' },
      { k: 'Close range of specs of a reliable product', alt: ['close range of specifications', 'known reliable product'], d: 'A close range of specifications corresponding to a known reliable product.' },
      { k: 'PPR r.29(1) information', alt: ['quality, performance standards, life span', 'r.29'], d: 'Name, quality, performance standards and life span, safety, packaging, production, test procedure.' },
      { k: 'Performance/output requirements', alt: ['performance', 'output'], d: 'Generator: output per hour, maximum fuel per kWh, maximum noise.' },
      { k: 'International and national standards', alt: ['ISO', 'IEC', 'BSTI', 'standards'] },
      { k: 'Brand “or equivalent”; minimum values', alt: ['or equivalent', 'or higher'], d: 'As in the projector specification.' },
      { k: 'Warranty and after-sales service', alt: ['warranty', 'spare parts'], d: 'Three years (minimum) in the projector example.' },
      { k: 'Tests and commissioning', alt: ['factory test', 'pre-shipment inspection', 'commissioning'] },
    ],
    seen: ['Jan 2021'],
    src: 'Pallab’s 18-batch solve of Jan 2021 3(b) (first three); PPR r.29; IA sir’s projector specification; the last two points have no class source',
  },
  {
    id: 'l-generator',
    topic: T,
    title: 'Features in the specification of an electric generator',
    ask: 'What features would you include in the specification of an electric generator?',
    points: [
      { k: 'Electricity output per hour', alt: ['rated output', 'kVA'], d: 'PPR r.29 example.' },
      { k: 'Maximum fuel per kWh', alt: ['fuel consumption'], d: 'PPR r.29 example.' },
      { k: 'Maximum noise level', alt: ['noise'], d: 'PPR r.29 example.' },
      { k: 'Voltage, phase, frequency', alt: ['400/230 V 50 Hz'] },
      { k: 'Engine and alternator type', alt: ['engine', 'alternator', 'AVR'] },
      { k: 'Control panel, auto start, protections', alt: ['ATS', 'protection'] },
      { k: 'Standards (ISO 8528, IEC)', alt: ['standards'] },
      { k: 'Country of origin, manufacturer’s authorisation', alt: ['origin'] },
      { k: 'Tests, commissioning, training', alt: ['testing'] },
      { k: 'Warranty and spare parts', alt: ['warranty'] },
    ],
    seen: ['2011-12', 'Jan 2021'],
    src: 'PPR r.29(2)(a) example on IA sir’s slide (first three; the solves use them for Jan 2021 3(b) too); the rest has no class source',
  },
  {
    id: 'l-boq-purpose',
    topic: T,
    title: 'Purposes of a BoQ',
    ask: 'What is the purpose of BoQ?',
    points: [
      { k: 'Standardising the tendering process', alt: ['standardise', 'standardizing tendering'], d: 'All tenderers price the same items.' },
      { k: 'Clear, precise method to value the project', alt: ['value the project', 'valuation'], d: 'A clear and precise method to value the project.' },
      { k: 'Analyse prices of items and overall costs', alt: ['analyse prices', 'individual items and overall costs', 'consultants analyse'], d: 'Enables consultants to analyse prices of various individual items and overall costs.' },
      { k: 'Verify tenders are genuine and compliant', alt: ['genuine tenders', 'quantity surveyor', 'compliant with tender information'], d: 'Assists the quantity surveyor in verifying that contractors have submitted genuine tenders compliant with tender information.' },
      { k: 'Calculating the contract price', alt: ['contract price'], d: 'Slide: used to calculate the contract price (rate × quantity).' },
      { k: 'Payment at the quoted rates', alt: ['payment', 'periodic valuation', 'financial control'], d: 'Slide: actual quantities are measured and paid at the quoted unit rate.' },
    ],
    hook: 'S-V-A-V: Standardise, Value, Analyse, Verify. Then the two money uses: contract price and payment.',
    seen: ['2011-12'],
    src: 'Nafee bhai’s note Ques-44 (first four, word for word); IA sir Tender Document slides 7–8 and GCC+TEC slides 4–5 (last two)',
  },
  {
    id: 'l-boq-cols',
    topic: T,
    title: 'Columns of a standard BoQ',
    ask: 'Name the columns of a standard BoQ, in order.',
    points: [
      { k: 'Item No.', alt: ['item number', 'SL no', 'serial no'] },
      { k: 'Description', alt: ['description of work', 'description of item'], d: 'The item description, memorised word for word.' },
      { k: 'Unit', alt: ['cum'], d: 'Filled in (Cum for concrete and brick work).' },
      { k: 'Quantity', alt: ['qty'], d: 'Filled in, from the question.' },
      { k: 'Unit Price', alt: ['rate', 'rate in Tk', 'unit rate'], d: 'Left blank for the tenderer.' },
      { k: 'Amount', alt: ['total price', 'total'], d: 'Left blank.' },
      { k: 'In Word', alt: ['amount in words', 'in words'], d: 'Left blank.' },
    ],
    ordered: true,
    seen: ['2022-23', '2020-21', '2017-18', '2015-16', '2013-14', '2012-13', '2011-12'],
    src: '18-batch term-final solve p.37 (latest edition); Nafee bhai’s note p.30',
    note: 'Ishtiaque sir: “Quantity and unit are to be included but not rate and amount.” Older solves draw six columns: SL. No, Description of Work, Unit, Quantity, Rate in Tk., Amount.',
  },
  {
    id: 'l-boq-rcc-subs',
    topic: T,
    title: 'Sub-items of the RCC item 6.1 in the BoQ',
    ask: 'Name the eight sub-items (6.1.1 to 6.1.8) of the RCC works item in the BoQ.',
    points: [
      { k: 'Individual & combined footing', alt: ['footing', 'individual and combined footing'], d: '6.1.1 (foundation).' },
      { k: 'Column', alt: ['columns'], d: '6.1.2' },
      { k: 'Foundation beam up to plinth level', alt: ['foundation beam', 'grade beam'], d: '6.1.3 (foundation).' },
      { k: 'Rectangular beam', alt: ['beam'], d: '6.1.4' },
      { k: 'Floor slab', alt: ['floor'], d: '6.1.5' },
      { k: 'Roof slab', alt: ['roof'], d: '6.1.6' },
      { k: 'Lintel', alt: ['lintels'], d: '6.1.7' },
      { k: 'Staircase slab and steps', alt: ['staircase', 'stair'], d: '6.1.8' },
    ],
    ordered: true,
    hook: 'Build the frame from the ground up: footing, column, foundation beam, beam, floor slab, roof slab, then the small ones, lintel and stair.',
    seen: [],
    src: '18-batch term-final solve pp.37–38; typed note Ques-46',
    note: 'Each sub-item carries the unit (Cum) and its quantity. For “concrete in foundation” use 6.1.1 and 6.1.3.',
  },
  {
    id: 'l-vo-procedure',
    topic: T,
    title: 'Procedure for a variation / extra work order (item missing from BoQ)',
    points: [
      { k: 'Contractor’s written notice within 7 days', alt: ['notice', 'claim'] },
      { k: 'Engineer prepares the order', alt: ['project manager prepares', 'quantities and justification'] },
      { k: 'Rate fixed (BoQ rate or new rate)', alt: ['rate', 'new rate'] },
      { k: 'Approval by approving authority', alt: ['approval', 'next higher authority'] },
      { k: 'Contract amended; work executed', alt: ['amend contract'] },
      { k: 'Payment after approval', alt: ['payment'] },
    ],
    ordered: true,
    seen: ['2015-16', '2011-12'],
    src: 'PPR r.78–80, 38(12), Sch II',
  },
]

const cards: PcCard[] = [
  { id: 'c-spec-generator-ex', topic: T, front: 'PPR r.29 generator example — how should the requirement be expressed?', back: 'By **performance**: (i) electricity output per hour; (ii) maximum fuel consumed per kWh in operation; (iii) maximum noise level in operation — not by a named model.', src: 'PPR r.29(2)(a)' },
  { id: 'c-spec-4wd', topic: T, front: 'PPR r.29 4WD example — what is not allowed?', back: 'Issuing a tender for a **named vehicle**, or writing a specification so tied to one manufacturer that others cannot tender.', src: 'PPR r.29(3)' },
  { id: 'c-spec-or-equal', topic: T, front: 'When may a brand be named in a specification?', back: 'Only if the PE lacks expertise for a generic specification — then add the words **“or similar or equivalent”** (PPR r.29(4)); in ICT, “or equivalent” where a BD standard is unique.', src: 'PPR r.29(4), 83(1)(c)' },
  { id: 'c-spec-standards', topic: T, front: 'Which standards bodies does PPR name for specifications?', back: '**ISO** (International Organisation for Standardisation), **IEC** (International Electrotechnical Commission), **BSTI** (Bangladesh Standards and Testing Institution) or other national/international institutes; prepared with the user.', src: 'PPR r.29(5)' },
  { id: 'c-spec-gen-vs-part', topic: T, front: 'General vs particular specification?', back: '**General**: site facilities, health and safety, security, environmental protection, site preparation — applies to the whole job. **Particular**: material, workmanship, supplies, testing and QC, measurement and payment for each item (steel, concrete, bricks, electrical).', src: 'IA sir GCC+TEC slides 5–6' },
  { id: 'c-spec-projector', topic: T, front: 'Pattern of the teacher’s goods specification (projector)?', back: 'Brand “Casio/Hitachi/Dell/Mitsubishi **or equivalent**”; model and country of assembling “**to be mentioned**”; origin “Japan/USA/EU or equivalent”; minimum values “2500 lumens **or higher**”, XGA “or better”; accessories; **warranty three years (minimum)**.', src: 'IA sir “7. Specification”; 7a specification .doc; the solves mark it “Important for Term Final”' },
  { id: 'c-spec-boq-def', topic: T, front: 'What is a BoQ?', back: 'A list of **all items** of works and supplies (construction, testing, commissioning), each with a quantity worked out by the design team; tenderers quote a unit rate × quantity; it gives the contract price and the contractor is **paid at the quoted rates for actual measured quantities**.', src: 'IA sir GCC+TEC slides 4–5' },
  { id: 'c-spec-qty-25', topic: T, front: 'Actual quantity of a BoQ item differs a lot — what applies?', back: 'Payment is on actual measured quantity at the BoQ rate; if an item increases by **more than 25%** and the change exceeds **1% of the initial contract price**, the Engineer adjusts its unit rate (PPR r.39(20)); within the 15% variation limit.', src: 'PPR r.39(20), Sch II', seen: ['2011-12'] },
  { id: 'c-spec-vo-ewo', topic: T, front: 'Variation order vs extra work order?', back: '**Variation**: increase/decrease of quantities or new items from change of plan, design or alignment **within the general scope**. **Extra work**: new work needed to complete, improve or protect the original work because of materially different subsurface/unknown site conditions.', src: 'PPR r.78(1)–(2)' },
  { id: 'c-spec-nti', topic: T, front: 'What is an NTI, and how is it settled?', back: '**NTI = non-tendered item**: extra work or services not mentioned in the tender. The procuring entity may issue an **extra work order** to cover the introduction of new work for the completion, improvement and protection of the original work. Thus it is settled.', src: 'Nafee bhai’s note Ques-36; PPR r.78(2)' },
  { id: 'c-spec-vo-def', topic: T, front: 'What is a variation order?', back: 'A variation order (also called **change order**) is a formal document issued by the contractor or the client for changes in the project such as changes in the **project scope, design, completion date, contract price**.', src: 'Nafee bhai’s note Ques-36' },
  { id: 'c-spec-boq-norate', topic: T, front: 'In an exam BoQ, which columns are filled in and which are left blank?', back: 'Filled: **item no., description, unit, quantity**. Blank: **unit price, amount, in word**. Ishtiaque sir: “Quantity and unit are to be included but not rate and amount.”', src: 'Nafee bhai’s note p.30', seen: ['2022-23', '2020-21', '2017-18', '2015-16', '2013-14', '2012-13', '2011-12'] },
  { id: 'c-spec-rcc-figures', topic: T, front: 'The figures of the RCC item (BoQ 6.1 and the concrete specification)?', back: 'Mix **1:1.5:3**; maximum water cement ratio **0.40**; minimum f′cr **33.5 MPa**; f′c **25 MPa** at 28 days on standard cylinders; cement **BDS EN-197-1-CEM-I, 52.5N** / ASTM-C 150 Type I; Sylhet sand **F.M. 2.2**; **20 mm down** stone chips (ASTM C-33); curing **at least for 28 days**.', src: '18-batch term-final solve pp.37, 42' },
  { id: 'c-spec-rcc-rate-excl', topic: T, front: 'What does the rate of the RCC item exclude?', back: '“Rate is excluding **laboratory test fees**, the cost of **reinforcement** and its fabrication, placing, binding etc. and the cost of **shuttering & centering**.” It includes the cost of water, electricity and other charges.', src: '18-batch term-final solve p.37' },
  { id: 'c-spec-astm-conc', topic: T, front: 'Which three ASTM standards are named under Testing in the concrete specification?', back: '**ASTM C31**: making and curing concrete specimens in the field. **ASTM C33**: specification for concrete aggregates. **ASTM C39**: compressive strength of cylindrical concrete specimens.', src: '18-batch term-final solve p.43' },
  { id: 'c-spec-cube-cyl', topic: T, front: 'Cylinder size and the cube–cylinder relation in the concrete specification?', back: 'Cylinders of **diameter 150 mm and height 300 mm**. **Cube strength at 28 days must be 1.2 times cylinder strength** at 28 days.', src: '18-batch term-final solve p.42' },
  { id: 'c-spec-curing', topic: T, front: 'Curing of concrete in the specification: time and method?', back: '**At least for 28 days.** Horizontal surface: **ponding with water**. Other surfaces: wrapping by **moist jute fabric** with sprinkling water frequently.', src: '18-batch term-final solve p.42' },
  { id: 'c-spec-brick-figures', topic: T, front: 'The figures of the brick-work item (specification and BoQ)?', back: '**First class bricks**; sand **F.M. 1.2**; mortar **(1:6)**; soaking **at least for 24 hours** before use; curing **at least for 7 days**; **English Bond**; test **ASTM C67**; **250 mm** width for one brick length, **375 mm** for one brick and a half; cement CEM-II/A-M.', src: '18-batch term-final solve pp.40, 43' },
  { id: 'c-spec-boq-important', topic: T, front: 'Which element of the tender document is called the most important?', back: 'The **Bill of Quantities (BoQ)**: “most important part of Tender Document”.', src: '18-batch term-final solve p.34; typed note Ques-22' },
  { id: 'c-spec-language', topic: T, front: 'Specification language: three rules, with an example.', back: '**“Shall”** for the contractor’s obligation (“Bricks shall be soaked at least for 24 hours”). **Measurable values with standards** (“Sylhet sand of F.M. 2.2”, “BDS EN-197-1 CEM-I, 52.5 N”). **No vague words** such as “etc.”, “best quality”, “as directed”, “approximately”.', src: 'Typed note PYQ-34, an answer written by a current-batch student for the old CE 403 2008-09 short note; not from class' },
  { id: 'c-spec-new-rate', topic: T, front: 'How is the rate of a new (non-BoQ) item fixed?', back: 'Same/similar item → **original BoQ rate**. New item → direct unit costs from the contractor’s price breakdown (cement, steel, labour, equipment) or agreed market prices, **plus the contractor’s tender mark-up** (taxes, overheads, profit) (PPR r.80(1)).', src: 'PPR r.80(1)' },
  { id: 'c-spec-vo-limit', topic: T, front: 'Variation limits and timing?', back: 'Contractor’s notice within **7 days**; processing ≤ **30 days**; cumulative ≤ **15%** of original price, beyond → authority above the original approver or a new contract if separable; no work before approval (HOPE may allow start in emergency if unapproved total ≤ 10%).', src: 'PPR r.74(4), 78–80, Sch II' },
  { id: 'c-spec-unpriced', topic: T, front: 'A BoQ item has no rate quoted — what happens?', back: 'It is **deemed covered** by the other rates and prices; the tender price is not changed (PPR r.39(24), 98(12)). Different from an item missing from the BoQ altogether (→ variation).', src: 'PPR r.39(24), 98(12)' },
  { id: 'c-spec-dayworks', topic: T, front: 'Dayworks and provisional sums?', back: '**Dayworks**: work paid by time spent by the contractor’s workers and equipment at BoQ rates. **Provisional sums**: amounts in the BoQ used at the PE’s discretion, e.g. for nominated subcontractors.', src: 'PPR r.2(15),(41), 5(6)–(7)' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-spec-why',
    topic: T,
    q: 'Why is specification important (necessary) in a construction contract?',
    seen: ['Jan 2021', '2017-18', '2011-12'],
    a: `### Reasons for specifications
1. A specification should state **what an element of construction should consist of** and **how it should be installed** in **sufficient detail** so that it can be constructed.
2. Putting too much notes on drawings may make it **clumsy and unreadable**.
3. To describe **workmanship or construction methods** on a drawing is often **more difficult** than describing the materials in a specification.

These three are the class answer. If the marks ask for more, add (not from the slide): it fixes the quality, the tests and the standards for acceptance; it gives every tenderer the same correct, complete and non-restrictive description (PPA s.15).`,
    keys: ['what an element of construction should consist of', 'how it should be installed', 'sufficient detail', 'clumsy and unreadable', 'workmanship or construction methods', 'more difficult'],
    lists: ['l-spec-reasons'],
    src: 'IA sir “7. Specification” slide “Reasons for Specifications”; the 18-batch solve and Nafee bhai’s note copy the three word for word; the closing line has no class source (PPA s.15, PPR r.4)',
  },
  {
    id: 'a-spec-attrs',
    topic: T,
    q: 'Describe the attributes of good specification.',
    seen: ['Jan 2021', '2017-18', '2011-12'],
    a: `### Quality of good specification
1. **Clarity** — Use correct grammar and avoid **ambiguity**. Use the **correct word** to convey exact meaning.
2. **Correctness** — Present ideas and explanations **accurately and precisely**.
3. **Completeness** — Do not **leave out** anything that is important.
4. **Conciseness** — Eliminate **unnecessary words**, but not at the expense of clarity, correctness or completeness.`,
    keys: ['Clarity', 'ambiguity', 'correct word', 'Correctness', 'accurately and precisely', 'Completeness', 'leave out', 'Conciseness', 'unnecessary words'],
    lists: ['l-spec-attrs'],
    src: 'IA sir “7. Specification” slide “Quality of Good Specification” (word for word; same in the solves)',
  },
  {
    id: 'a-r29',
    topic: T,
    q: 'With suitable examples, describe the guideline of PPR for preparation of technical specification of goods.',
    seen: ['2013-14'],
    a: `PPR 2008 **Rule 29**:
1. **Information to give** (r.29(1)): (a) name or description; (b) quality; (c) **performance standards and life span**; (d) safety standards and limits; (e) symbols/terminology for packaging, marking and labelling; (f) processes and methods of production; (g) **test procedure** for conformity assessment.
2. **Performance or output requirements** rather than design-linked specifications that limit competition (r.29(2)(a)). *Example*: a generator is specified by electricity output per hour, maximum fuel per kWh and maximum noise level.
3. **International standards** where they exist, otherwise recognised national standards, codes or generic names (r.29(2)(b)).
4. **No reference to a trade mark**, trade name, patent, design, type, country of origin, producer or supplier (r.29(3)). *Example*: for a 4WD vehicle the PE may not tender for a named vehicle or write specs only one maker can meet.
5. If the PE lacks expertise it may name a brand but must add **“or similar or equivalent”** (r.29(4)).
6. Prepare in cooperation with the **user/beneficiary** and follow **ISO, IEC and BSTI** standards (r.29(5)).
7. Specs must be **non-restrictive** and consistent with drawings (r.4(5)). Commonly used goods may be standardised (r.29(6)).

*Goods example*: multimedia projector — brand “or equivalent”, 2500 lumens or higher, XGA or better, warranty three years (minimum).

The Act says the same in **PPA s.15(1)**: to create impartial and open competition, the procuring entity shall provide a correct and complete description of the expected performance levels, the characteristics and required quality, and such description shall not be restrictive.`,
    keys: ['Rule 29', 'performance standards and life span', 'test procedure', 'Performance or output', 'generator', 'International standards', 'No reference to a trade mark', '4WD', 'or similar or equivalent', 'ISO, IEC and BSTI', 'non-restrictive'],
    lists: ['l-r29-info', 'l-r29-rules'],
    src: 'PPR r.29, 4(5); IA sir “7. Specification” slides 1–5; PPA s.15(1) (the typed note answers this question with s.15, “discussed by Sir in class”)',
  },
  {
    id: 'a-spec-concrete',
    topic: T,
    q: 'Write a specification for concrete works in foundation (or in a building) showing material quality, transportation, workmanship, testing, measurement and payment.',
    seen: ['Jan 2021', '2017-18', '2016-17', '2011-12'],
    a: `### Specification of Concrete
**Materials**

- **Cement** — BDS EN-197-1 CEM-I / ASTM C-150 Type-I; minimum characteristic strength **52.5 N** (28 days); Seven Rings Gold Cement or similar or equivalent.
- **Water** — **potable water**, clean and free from injurious amounts of oils, acids, alkalis and other deleterious materials.
- **Fine aggregate** — Sylhet sand or equivalent sand (**F.M. 2.2**).
- **Coarse aggregate** — **20 mm down** well graded **stone chips** (ASTM C-33).

**Mix ratio** — **1:1.5:3**; maximum water cement ratio 0.40.

**Strength and curing**

- Minimum compressive strength at 28 days: f′c (at 28 days cylinder strength) = **25 MPa** for footing, for column, and for slab, beam and other structural members; minimum f′cr = 33.5 MPa.
- Minimum cylinder strength is based on concrete cylinders of diameter **150 mm** and height **300 mm**.
- Cube strength at 28 days must be **1.2 times** cylinder strength at 28 days.
- Curing time: **at least for 28 days**. Curing method: horizontal surface, **ponding with water**; other surfaces, wrapping by **moist jute fabric** with sprinkling water frequently.

**Transportation** — Concrete shall be transported from the mixing machine to the laying place as soon as possible **without causing segregation** of materials and **maintaining workability**.

**Compaction** — **Mechanical vibrator** shall be used.

**Workmanship** — Conducting test of materials, breaking chips and screening, making, placing shutter and maintaining **true to plumb**, making shutter **water-tight** properly, placing reinforcement in position, mixing with standard mixer machine with hopper, fed by standard measuring box, casting in forms, compacting by vibrator machine, curing for at least 28 days, removing centering-shuttering after specified time.

**Testing**

- **ASTM C31** — Standard Practice for Making and Curing Concrete Specimens in the Field
- **ASTM C33** — Standard Specifications for Concrete Aggregates
- **ASTM C39** — Standard Test Method for Compressive Strength of Cylindrical Concrete Specimens

**Payment** — According to **per cum rate**, determined excluding laboratory test fees, the cost of reinforcement i.e. fabrication, welding, binding, placing and the cost of shuttering and centering.

**Measurements** — Measurements shall be taken in cum and length, breadth and height or thickness shall be taken to the **nearest 1 cm**.

### BoQ (concrete works in foundation)
${boqRcc([
      ['6.1.1', 'Individual & combined footing', '47.9'],
      ['6.1.3', 'Foundation beam up to plinth level', '32.18'],
    ])}

${BOQ_NOTE} The two quantities are sample figures; use the paper’s quantity when it gives one. For concrete in a whole building add the sub-items 6.1.2 Column, 6.1.4 Rectangular beam, 6.1.5 Floor slab, 6.1.6 Roof slab, 6.1.7 Lintel and 6.1.8 Staircase slab and steps.

Other version: Nafee bhai’s typed answer numbers the heads (1 Major Materials, 2 Proportioning, 3 Mix ratio, 4 Transportation, 5 Workmanship, 6 Testing, 7 Payment) and gives f′c 32 MPa, f′cr 40.5 MPa, mix 1:1.25:2.5 with a Type G admixture (ASTM C494) for foundation, and 19 MPa, 1:2:4 with brick chips for a building. The values above are the ones the BoQ item carries.`,
    keys: ['BDS EN-197-1 CEM-I', '52.5 N', 'potable water', 'F.M. 2.2', '20 mm down', 'stone chips', '1:1.5:3', '25 MPa', '150 mm', '1.2 times', 'at least for 28 days', 'ponding with water', 'moist jute fabric', 'without causing segregation', 'Mechanical vibrator', 'true to plumb', 'ASTM C31', 'ASTM C39', 'per cum rate', 'nearest 1 cm'],
    lists: ['l-spec-heads', 'l-boq-cols', 'l-boq-rcc-subs'],
    src: '18-batch term-final solve pp.42–43 (specification) and pp.37–38 (BoQ item, “very important for TF”); Nafee bhai’s note pp.26–30, where each specification is followed by its BoQ and IA sir’s quote. Water cement ratio 0.40 and f′cr 33.5 MPa are taken from the BoQ item',
  },
  {
    id: 'a-spec-brick',
    topic: T,
    q: 'Write a specification for brick works (material quality, workmanship, measurement and payment).',
    seen: ['2017-18', '2013-14'],
    a: `### Specification of Brickwork
**Material**

- **Brick type** — **1st class brick** conforming to standard ASTM specifications.
- **Cement** — BDS EN-197-1 CEM-II/A-M.
- **Sand** — sand with minimum **F.M. 1.2**.
- **Water** — water used shall be clean and reasonably free from injurious quantities of deleterious materials such as **acid, alkali, oils and salts**.
- **Mortar** — mortar to be used shall be properly mixed at specified proportions **(1:6)**.

**Workmanship** — **Filling the interstices** with mortar, **raking out joints**, cleaning and **soaking bricks at least for 24 hours** before use, **washing of sand** and providing necessary **scaffolding**.

**Laying** — Bricks shall be laid in **English Bond**. The course of the brick shall be **truly horizontal** and the wall should be maintained **true to plumb**.

**Curing** — **At least for 7 days**.

**Testing** — **ASTM C67**: Standard Test Method for Sampling and Testing Brick and Structural Clay Tile.

**Payment** — According to **per cum rate** as specified in the contract.

**Measurement** — Brickwork shall be measured by the number of cubic metres that is **ordered, placed and accepted**. **250 mm** width for one brick length and **375 mm** width for one brick and a half brick length.

### BoQ (brick work)
${boqBrick('50')}

${BOQ_NOTE} The quantity is a sample (50 m³ is the figure the papers give).

Other version: the typed specification in the solves prints mortar (1:4) and cement CEM-II/B-M. The 18-batch copy corrects the mortar to 1:6 by hand, and the BoQ item carries mortar (1:6) and CEM-II/A-M, so the specification above is written to agree with the BoQ.`,
    keys: ['1st class brick', 'F.M. 1.2', 'acid, alkali, oils and salts', '(1:6)', 'Filling the interstices', 'raking out joints', 'soaking bricks at least for 24 hours', 'washing of sand', 'scaffolding', 'English Bond', 'truly horizontal', 'true to plumb', 'At least for 7 days', 'ASTM C67', 'per cum rate', 'ordered, placed and accepted', '250 mm', '375 mm'],
    lists: ['l-spec-brick-heads', 'l-boq-cols'],
    src: '18-batch term-final solve p.43 (specification, mortar corrected by hand to 1:6) and p.40 (BoQ item); Nafee bhai’s note p.29 (“this one must be read”) and p.30',
  },
  {
    id: 'a-spec-goods',
    topic: T,
    q: 'Write a specification of a goods item (e.g. multimedia projector).',
    seen: ['2013-14'],
    a: `### Multimedia projector (teacher's example)
| Feature | Specification |
|---|---|
| Brand | Casio/Hitachi/Dell/Mitsubishi **or equivalent** |
| Model | **To be mentioned** |
| Country of origin | Japan/USA/EU countries or equivalent |
| Country of assembling | To be mentioned |
| Type | Laser and LED hybrid |
| Brightness | **2500 lumens or higher** |
| Resolution | 1024 × 768 (XGA) or better |
| Zoom / focus | 1.5× manual (min) / manual |
| Contrast ratio | 1800:1 or higher |
| Estimated operating life | Up to 20,000 hours or higher |
| Weight | 8.6 lb or less |
| Power supply | AC 220–240 V, 50 Hz |
| Standard accessories | Remote control, RGB cable, power cord, user manual, carry bag |
| **Warranty** | Three years (minimum) |

Pattern (PPR r.29): brand only with “or equivalent”, **minimum performance values**, accessories and warranty — never a single maker's model.`,
    keys: ['or equivalent', 'To be mentioned', 'Country of origin', '2500 lumens or higher', 'XGA', 'operating life', 'Power supply', 'accessories', 'Warranty', 'minimum performance values'],
    src: 'IA sir “7. Specification” slide; 7a specification .doc; the solves copy it and mark it “Important for Term Final”',
  },
  {
    id: 'a-generator',
    topic: T,
    q: 'What features would you include in the specification of an electric generator?',
    seen: ['2011-12'],
    a: `Following PPR r.29 — state **performance**, not a brand:
1. **Electricity output** per hour — rated output (e.g. 250 kVA / 200 kW prime) at 0.8 pf.
2. **Maximum fuel consumption** per kWh at 75% and 100% load.
3. **Maximum noise level** in operation (e.g. 75 dB(A) at 7 m, soundproof canopy).
4. **Voltage, phase, frequency** — 400/230 V, 3-phase, 50 Hz.
5. **Engine** (diesel, 4-stroke, 1500 rpm, governor) and **alternator** (brushless, AVR).
6. **Control panel** with auto start, automatic transfer switch and protections.
7. **Standards** — ISO 8528 / IEC; country of origin of engine and alternator; manufacturer's authorisation.
8. **Tests** — factory test certificates, site testing and commissioning; operator training, manuals.
9. **Warranty** (≥ 2 years) and spare-parts availability, local service.`,
    keys: ['performance', 'Electricity output', 'Maximum fuel consumption', 'Maximum noise level', 'Voltage, phase, frequency', 'Engine', 'alternator', 'Control panel', 'Standards', 'Tests', 'Warranty'],
    lists: ['l-generator'],
    src: 'PPR r.29(2)(a) example; question bank',
  },
  {
    id: 'a-em-reliability',
    topic: T,
    q: 'How shall the specification of electro-mechanical equipment ensure procurement of a reliable product?',
    seen: ['Jan 2021'],
    a: `A brand cannot be named, so reliability is secured by how the item is described:
1. **Without specifying brand**, demand supply from companies with **top 10 annual turnover**, and give a **close range of specifications** corresponding to a known reliable product.
2. Give the information of **PPR r.29(1)**: (a) name or description; (b) quality; (c) required **performance standards and life span**; (d) **safety standards** and limits; (e) symbols and terminology for packaging, marking and labelling; (f) processes and methods of production; (g) **test procedure** for conformity assessment.
3. Express it in terms of **performance or output** (r.29(2)). Example, a generator: the **electricity output** per hour; the **maximum volume of fuel** consumed per kilowatt hour; the **maximum noise level** in operation.
4. Base it on **international standards** (ISO, IEC) or national standards (BSTI).
5. Where a brand is mentioned add **“or equivalent”**, and state minimum values, as in the projector specification: “2500 lumens or higher”, “warranty: three years (minimum)”.

Further points with no class source: factory test certificates and commissioning, manufacturer’s authorisation, after-sales service and spare parts.`,
    keys: ['Without specifying brand', 'top 10 annual turnover', 'close range of specifications', 'PPR r.29(1)', 'performance standards and life span', 'safety standards', 'test procedure', 'performance or output', 'electricity output', 'maximum volume of fuel', 'maximum noise level', 'international standards', 'or equivalent'],
    lists: ['l-em-reliability', 'l-r29-info'],
    src: 'Pallab’s 18-batch solve of Jan 2021 3(b) (points 1–3); PPR r.29 as on IA sir’s slides; IA sir’s projector specification',
  },
  {
    id: 'a-boq-purpose',
    topic: T,
    q: 'What is the purpose of BoQ?',
    seen: ['2011-12'],
    a: `The **Bill of Quantities** lists all items of work with their quantities; it is the **most important part** of the tender document. Its purposes:
1. For **standardising the tendering process**.
2. For providing a **clear and precise method to value the project**.
3. For enabling consultants to **analyse prices** of various individual items and overall costs.
4. For assisting the quantity surveyor in verifying that individual contractors have submitted **genuine tenders** compliant with tender information.

From the class slides: it is used to calculate the **contract price**, and the contractor is **paid at the quoted rates** for the quantities actually measured.`,
    keys: ['Bill of Quantities', 'most important part', 'standardising the tendering process', 'clear and precise method to value the project', 'analyse prices', 'genuine tenders', 'contract price', 'paid at the quoted rates'],
    lists: ['l-boq-purpose'],
    src: 'Nafee bhai’s note Ques-44 (the four purposes, word for word); 18-batch solve p.34 (“most important part of Tender Document”); IA sir Tender Document slides 7–8',
  },
  {
    id: 'a-boq-format',
    topic: T,
    q: 'In a standard format prepare a BoQ for a work item (e.g. concreting work in foundation, 50 m³).',
    seen: ['2022-23', '2020-21', '2015-16', '2013-14', '2012-13', '2011-12'],
    a: `### Bill of Quantities — RCC works
The description of work is memorised **word for word**. This is the latest edition of the item.

${boqRcc([['6.1.1', 'Individual & combined footing', '50']])}

${BOQ_NOTE}

- **Quantity and unit** come from the question (here 50 m³ of concrete in foundation, so 50 Cum against the footing).
- **Foundation** sub-items: 6.1.1 Individual & combined footing and 6.1.3 Foundation beam up to plinth level. If you show both, split the given volume so the total stays the same.
- **Whole building**: add 6.1.2 Column, 6.1.4 Rectangular beam, 6.1.5 Floor slab, 6.1.6 Roof slab, 6.1.7 Lintel and 6.1.8 Staircase slab and steps, each in Cum.
- Older solves draw six columns (SL. No, Description of Work, Unit, Quantity, Rate in Tk., Amount) with the earlier edition of the item (“using wooden shutter … minimum f′cr = 30 MPa”); that version is printed with the 2020-21 paper.`,
    keys: ['RCC WORKS', '1:1.5:3', 'maximum water cement ratio = 0.40', 'f′cr = 33.5 MPa', 'f′c = 25 MPa', 'BDS EN-197-1-CEM-I', 'Sylhet sand', 'F.M. 2.2', '20 mm down', 'ASTM C-33', 'curing at least for 28 days', 'Engineer-in-charge', 'excluding laboratory test fees', 'Individual & combined footing', 'Cum'],
    lists: ['l-boq-cols', 'l-boq-rcc-subs'],
    src: '18-batch term-final solve pp.37–39 (“Very important for TF”, “memorize the description word by word”); Nafee bhai’s note p.30 (IA sir’s quote); typed note Ques-46',
  },
  {
    id: 'a-boq-brick',
    topic: T,
    q: 'Prepare a BoQ, in a standard format, for brick work 250 mm thick and 50 m³ of work volume.',
    seen: ['2017-18'],
    a: `### Bill of Quantities — brick work
The description of work is memorised **word for word**.

${boqBrick('50')}

${BOQ_NOTE}

- A **250 mm** wall is “width one brick length”; a 375 mm wall is one brick and a half.
- Mortar **(1:6)**, sand **F.M. 1.2**, soaking **24 hours**, curing **7 days**, cement **CEM-II/A-M**: the same values as the brick-work specification.
- Brick work below the plinth uses the other item of the notes: “${BRICK_PLINTH}” (item 19 Brickwork, 19.1), unit cum.`,
    keys: ['width one brick length', 'first class bricks', 'F.M. 1.2', 'mortar (1:6)', 'in superstructure', 'raking out joints', 'filling the interstices with mortar', 'soaking the bricks at least for 24 hours', 'washing of sand', 'necessary scaffolding', 'curing at least for 7 days', '250 mm width for one brick length', 'CEM-II/A-M', 'cum'],
    lists: ['l-boq-cols'],
    src: '18-batch term-final solve p.40 (“memorize the description word by word”; the notes call it the exact answer of 2018-19 Q3(b)); Nafee bhai’s note p.30 (item 19.1)',
  },
  {
    id: 'a-qty-variation',
    topic: T,
    q: 'The quantity in the BoQ is an estimated quantity. If the actual quantity varies significantly, what contractual provision applies?',
    seen: ['2011-12'],
    a: `1. **Payment on actual quantity** — in a unit-rate contract the contractor is paid for actual measured quantities at the quoted BoQ rate (PPR r.38(8), 39(13),(16)).
2. **Rate adjustment** — if the final quantity of an item increases by **more than 25%** over the BoQ quantity and the change exceeds **1% of the Initial Contract Price**, the Engineer adjusts the unit rate for that item (PPR r.39(20)).
3. **Variation order** — increase or decrease of quantities is a variation (r.78(1)); cumulative variation up to **15%** of the original contract price; beyond that, approval of the **next higher authority** (r.74(4)) or a new contract if separable.
4. **Extension of time** if the change delays completion (r.39(3)).`,
    keys: ['Payment on actual quantity', 'Rate adjustment', 'more than 25%', '1% of the Initial Contract Price', 'Variation order', '15%', 'next higher authority', 'Extension of time'],
    src: 'PPR r.38(8), 39(3),(13),(16),(20), 74(4), 78, Sch II',
  },
  {
    id: 'a-missing-item',
    topic: T,
    q: 'If an essential item of work is not included in the BoQ, what contractual provision and procedure resolve it?',
    seen: ['2015-16', '2011-12'],
    a: `The **variation order / extra work order** provision is used. An item missing from the BoQ is a **non-tendered item (NTI)**.
1. **Variation order** (also called **change order**) — a formal document issued by the contractor or the client for changes in the project such as changes in the project scope, design, completion date, contract price.
2. **NTI** — extra work or services which are not mentioned in the tender.
3. **Extra work order** — the procuring entity may issue an extra work order to cover the introduction of new works necessary for the **completion, improvement or protection** of the original works (PPR r.78(2)). Thus it is settled.
4. **Notice** — the contractor gives written notice with full particulars **within 7 days**, otherwise the claim is waived (r.79(1)).
5. **Costing** (r.80) — same or similar item: the **original unit price** of the BoQ; new item: a new rate built from the contractor’s price breakdown or agreed market prices plus its mark-up.
6. **Approval** — **no work before approval** of the approving authority; variations beyond 15% of the original price go to the next higher authority (r.74(4)).`,
    keys: ['variation order', 'non-tendered item', 'change order', 'Extra work order', 'completion, improvement or protection', 'within 7 days', 'original unit price', 'no work before approval', '15%'],
    lists: ['l-vo-procedure'],
    src: 'Nafee bhai’s note Ques-36 (points 1–3); Pallab’s 18-batch solve of 2015-16 3(b) (PPR r.78(2), 79(1), 80); PPR r.74(4), Sch II',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
