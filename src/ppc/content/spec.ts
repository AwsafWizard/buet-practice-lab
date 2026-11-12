// pc-spec — specifications (why, attributes, PPR r.29, structure, samples) and the BoQ (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-spec).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-spec' as const

const lists: PcList[] = [
  {
    id: 'l-spec-reasons',
    topic: T,
    title: 'Reasons for specifications',
    ask: 'Why is specification important in a construction contract?',
    points: [
      { k: 'States what an element consists of and how installed', alt: ['what and how', 'sufficient detail to construct'], d: 'In sufficient detail so that it can be constructed.' },
      { k: 'Too many notes make drawings clumsy', alt: ['drawings clumsy', 'unreadable drawings'], d: 'Putting too many notes on drawings makes them clumsy and unreadable.' },
      { k: 'Workmanship hard to show on drawings', alt: ['workmanship', 'construction methods'], d: 'Describing workmanship or methods on a drawing is harder than in a specification.' },
      { k: 'Fixes quality, tests, acceptance', alt: ['quality', 'testing'], d: 'Defines the tests and standards for compliance (PPR r.4(4)).' },
      { k: 'Equal basis for open competition', alt: ['competition', 'equal basis'], d: 'Correct, complete, non-restrictive description (PPA s.15).' },
      { k: 'Contract document for control and disputes', alt: ['contract document'], d: 'Used to accept/reject work, measure, pay and settle disputes.' },
    ],
    seen: ['Jan 2021', '2017-18', '2011-12'],
    src: 'IA sir “7. Specification” slide “Reasons for Specifications” (first three); PPA s.15; PPR r.4(4)–(7)',
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
      { k: 'Name or description', alt: ['description'] },
      { k: 'Quality', alt: ['quality of goods'] },
      { k: 'Performance standards and life span', alt: ['life span', 'performance standards'] },
      { k: 'Safety standards and limits', alt: ['safety'] },
      { k: 'Packaging, marking and labelling terms', alt: ['packaging', 'labelling'] },
      { k: 'Processes and methods of production', alt: ['production process'] },
      { k: 'Test procedure for conformity', alt: ['test procedure', 'conformity assessment'] },
    ],
    ordered: true,
    hook: 'N-Q-P-S-P-P-T: “Name Quality, Perform Safely, Pack, Produce, Test”.',
    seen: ['2013-14'],
    src: 'PPR 2008 r.29(1)(a)–(g); IA sir “7. Specification” slides 1–2',
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
    title: 'Headings of a particular specification (per item)',
    ask: 'What should a specification for a work item contain?',
    points: [
      { k: 'Specification of material', alt: ['material', 'material quality'] },
      { k: 'Specification of workmanship', alt: ['workmanship', 'method'] },
      { k: 'Specification of supplies', alt: ['supplies', 'transportation', 'storage'] },
      { k: 'Testing and quality control', alt: ['testing', 'quality control'] },
      { k: 'Basis of measurement', alt: ['measurement'] },
      { k: 'Basis of payment', alt: ['payment'] },
    ],
    ordered: true,
    hook: 'M-W-S-T-M-P: “Make Work Sound, Then Measure and Pay”.',
    seen: ['Jan 2021', '2017-18', '2016-17', '2013-14', '2011-12'],
    src: 'IA sir GCC+TEC slide 6 (“Particular Specification”)',
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
    title: 'Specification features that ensure a reliable electro-mechanical product',
    ask: 'How shall the specification of electro-mechanical equipment ensure procurement of a reliable product?',
    points: [
      { k: 'Performance/output requirements', alt: ['performance', 'output'] },
      { k: 'International and national standards', alt: ['ISO', 'IEC', 'BSTI', 'standards'] },
      { k: 'Brand “or equivalent”; origin stated', alt: ['country of origin', 'or equivalent'] },
      { k: 'Life span and safety standards', alt: ['operating life', 'safety'] },
      { k: 'Tests and commissioning', alt: ['factory test', 'pre-shipment inspection', 'commissioning'] },
      { k: 'Manufacturer’s authorisation and experience', alt: ['manufacturer authorisation', 'references'] },
      { k: 'Warranty and after-sales service', alt: ['warranty', 'spare parts'] },
      { k: 'Accessories, manuals, training', alt: ['manuals', 'training'] },
      { k: 'Technical compliance sheet with tender', alt: ['compliance sheet'] },
    ],
    seen: ['Jan 2021'],
    src: 'PPR r.29, 40(2),(5), 49; IA sir projector specification; question bank',
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
    seen: ['2011-12'],
    src: 'PPR r.29(2)(a) example (first three); rest question bank',
  },
  {
    id: 'l-boq-purpose',
    topic: T,
    title: 'Purposes (objects) of a BoQ',
    ask: 'What is the purpose of BoQ?',
    points: [
      { k: 'Accurate preparation of tenders', alt: ['prepare tenders', 'uniform basis'], d: 'Quantities measured on a uniform basis.' },
      { k: 'Basis of financial control', alt: ['financial control', 'periodic valuation'], d: 'Priced BoQ for periodic valuation of works.' },
      { k: 'Calculating the contract price', alt: ['contract price'], d: 'Rate × quantity summed.' },
      { k: 'Payment at quoted rates', alt: ['payment', 'interim payment'], d: 'Actual quantities measured, paid at BoQ rates.' },
      { k: 'Standardising the tendering process', alt: ['standardise', 'comparison of tenders'], d: 'All tenderers price the same items.' },
      { k: 'Valuing variations', alt: ['variation'], d: 'Rates used for added/omitted work.' },
    ],
    seen: ['2011-12'],
    src: 'IA sir GCC+TEC slide 4; Tender Document slides 7–8; senior note Q25',
  },
  {
    id: 'l-boq-cols',
    topic: T,
    title: 'Columns of a standard BoQ',
    points: [
      { k: 'Item no.', alt: ['item number'] },
      { k: 'Description of item', alt: ['description'] },
      { k: 'Unit', alt: ['unit'] },
      { k: 'Quantity', alt: ['qty'] },
      { k: 'Unit rate in figures', alt: ['rate in figures', 'rate'] },
      { k: 'Unit rate in words', alt: ['rate in words'] },
      { k: 'Amount', alt: ['total'] },
    ],
    ordered: true,
    seen: ['May 2024', '2020-21', '2017-18', '2015-16', '2013-14', '2012-13', '2011-12'],
    src: 'Standard BoQ format (question bank); IA sir GCC+TEC slide 5 (rate × quantity)',
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
  { id: 'c-spec-projector', topic: T, front: 'Pattern of the teacher’s goods specification (projector)?', back: 'Brand “Casio/Hitachi/Dell/Mitsubishi **or equivalent**”; model and country of assembling “**to be mentioned**”; origin “Japan/USA/EU or equivalent”; minimum values “2500 lumens **or higher**”, XGA “or better”; accessories; **warranty three years (minimum)**.', src: 'IA sir “7. Specification”; 7a specification .doc' },
  { id: 'c-spec-boq-def', topic: T, front: 'What is a BoQ?', back: 'A list of **all items** of works and supplies (construction, testing, commissioning), each with a quantity worked out by the design team; tenderers quote a unit rate × quantity; it gives the contract price and the contractor is **paid at the quoted rates for actual measured quantities**.', src: 'IA sir GCC+TEC slides 4–5' },
  { id: 'c-spec-qty-25', topic: T, front: 'Actual quantity of a BoQ item differs a lot — what applies?', back: 'Payment is on actual measured quantity at the BoQ rate; if an item increases by **more than 25%** and the change exceeds **1% of the initial contract price**, the Engineer adjusts its unit rate (PPR r.39(20)); within the 15% variation limit.', src: 'PPR r.39(20), Sch II', seen: ['2011-12'] },
  { id: 'c-spec-vo-ewo', topic: T, front: 'Variation order vs extra work order?', back: '**Variation**: increase/decrease of quantities or new items from change of plan, design or alignment **within the general scope**. **Extra work**: new work needed to complete, improve or protect the original work because of materially different subsurface/unknown site conditions.', src: 'PPR r.78(1)–(2)' },
  { id: 'c-spec-nti', topic: T, front: 'What is an NTI?', back: 'A **non-tendered item** — extra work or service not in the BoQ/tender; settled by an extra work / variation order priced under PPR r.80.', src: 'Senior note Q16' },
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
1. A specification states **what an element of construction should consist of** and **how it should be installed**, in sufficient detail so that it can be constructed.
2. Putting too many notes on drawings makes them **clumsy and unreadable**.
3. To describe **workmanship** or construction methods on a drawing is more difficult than describing them in a specification.
4. It fixes **quality**, the tests, standards and acceptance criteria for compliance (PPR r.4(4)).
5. It gives all tenderers a correct, complete and **non-restrictive** description — an equal basis for **open competition** (PPA s.15).
6. It is a **contract document** (6th–7th in precedence) used to accept or reject work, measure, pay and settle disputes.`,
    keys: ['what an element of construction should consist of', 'how it should be installed', 'clumsy and unreadable', 'workmanship', 'quality', 'non-restrictive', 'open competition', 'contract document'],
    lists: ['l-spec-reasons'],
    src: 'IA sir “7. Specification” slide; PPA s.15; PPR r.4',
  },
  {
    id: 'a-spec-attrs',
    topic: T,
    q: 'Describe the attributes of good specification.',
    seen: ['Jan 2021', '2017-18', '2011-12'],
    a: `### Quality of good specification
1. **Clarity** — use correct grammar and avoid ambiguity; use the correct word to convey the exact meaning.
2. **Correctness** — present ideas and explanations accurately and precisely (consistent with drawings and standards).
3. **Completeness** — do not leave out anything important (material, workmanship, testing, measurement, payment).
4. **Conciseness** — eliminate unnecessary words, but not at the expense of clarity, correctness or completeness.

Also expected by PPR r.29: **performance-based**, based on **standards**, and **non-restrictive** (no brand name without “or equivalent”).`,
    keys: ['Clarity', 'ambiguity', 'Correctness', 'accurately and precisely', 'Completeness', 'Conciseness', 'unnecessary words', 'performance-based', 'non-restrictive'],
    lists: ['l-spec-attrs'],
    src: 'IA sir “7. Specification” slide; PPR r.29',
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

*Goods example*: multimedia projector — brand “or equivalent”, 2500 lumens or higher, XGA or better, warranty three years (minimum).`,
    keys: ['Rule 29', 'performance standards and life span', 'test procedure', 'Performance or output', 'generator', 'International standards', 'No reference to a trade mark', '4WD', 'or similar or equivalent', 'ISO, IEC and BSTI', 'non-restrictive'],
    lists: ['l-r29-info', 'l-r29-rules'],
    src: 'PPR r.29, 4(5); IA sir “7. Specification” slides 1–5',
  },
  {
    id: 'a-spec-concrete',
    topic: T,
    q: 'Write a specification for concrete works in foundation (or in a building) showing material quality, transportation, workmanship, testing, measurement and payment.',
    seen: ['Jan 2021', '2017-18', '2016-17', '2011-12'],
    a: `### Reinforced cement concrete in foundation (cast-in-situ)
1. **Scope** — supply all materials, labour and equipment for RCC in footings, pile caps, raft and grade beams as per drawings.
2. **Material** — **cement**: Portland cement (ASTM C150 Type I / CEM I), fresh, test certificate per lot, stored dry on raised platforms; **fine aggregate**: clean coarse sand, FM ≥ 2.5, silt ≤ 3%; **coarse aggregate**: 20 mm down crushed stone chips, well graded (ASTM C33), washed; **water**: clean, potable; admixture only with the Engineer's approval.
3. **Mix and strength** — f′c ≥ 25 MPa at 28 days; w/c ≤ 0.45; slump 75–100 mm; trial mix approved.
4. **Transportation and storage** — materials stored separately; concrete carried without segregation and placed within 30 minutes of mixing.
5. **Workmanship** — batching by weight; machine mixing ≥ 2 min; rigid, mortar-tight **formwork**; placing on 75 mm lean concrete, free fall ≤ 1.5 m, layers ≤ 300 mm; **compaction** by needle vibrators; **curing** wet for at least 14 days.
6. **Testing** — slump test per batch; 3 cylinders (150 × 300 mm) per 15 m³ or per day's pour, tested at 7 and 28 days; average of 3 ≥ f′c and none below f′c − 3.5 MPa, else cores and remedy at the contractor's cost.
7. **Measurement** — net volume in m³ as per drawings; no deduction for reinforcement.
8. **Payment** — at the BoQ unit rate, including materials, formwork, mixing, placing, compaction, curing and testing; reinforcement paid separately.

(Headings follow the teacher's particular-specification format; the numerical values are standard practice — the teacher's sample slide is not in our files.)`,
    keys: ['Material', 'cement', 'fine aggregate', 'coarse aggregate', 'water', 'Transportation', 'Workmanship', 'formwork', 'compaction', 'curing', 'Testing', 'Measurement', 'Payment'],
    lists: ['l-spec-heads'],
    src: 'IA sir GCC+TEC slide 6 (headings); question bank (values)',
  },
  {
    id: 'a-spec-brick',
    topic: T,
    q: 'Write a specification for brick works (a civil work item).',
    seen: ['2017-18', '2013-14'],
    a: `### First-class brick masonry in cement mortar (1:4)
1. **Material — bricks**: first-class, well burnt, uniform deep red, sharp edges, metallic ring when struck; size 240 × 115 × 70 mm (±3%); crushing strength ≥ 15 MPa; water absorption ≤ 15%.
2. **Material — mortar**: Portland cement and clean sand (FM ≥ 1.5) 1:4 by volume; clean water; used within 30 minutes.
3. **Transportation and stacking** — bricks unloaded by hand, stacked on level ground; cement stored dry.
4. **Workmanship** — bricks **soaked** at least 12 hours; English bond, frog upward; joints fully filled 10 mm (max 12 mm); courses level, walls **plumb**; ≤ 1.5 m height a day; joints raked for plaster.
5. **Curing** — kept wet for at least 7 days.
6. **Testing** — bricks sampled per lot for size, absorption and crushing strength; mortar cubes if required.
7. **Measurement** — m³ of finished masonry, openings deducted.
8. **Payment** — at the BoQ rate, covering materials, labour, scaffolding, curing and testing.`,
    keys: ['bricks', 'crushing strength', 'water absorption', 'mortar', 'Workmanship', 'soaked', 'English bond', 'plumb', 'Curing', 'Testing', 'Measurement', 'Payment'],
    lists: ['l-spec-heads'],
    src: 'IA sir GCC+TEC slide 6 (headings); question bank (values)',
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
    src: 'IA sir “7. Specification” slide; 7a specification .doc',
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
    a: `1. **Performance/output requirements** — capacity, efficiency, consumption, noise (PPR r.29(2)(a)) instead of a model.
2. **Standards** — international/national standards: ISO, IEC, BSTI (r.29(2)(b),(5)).
3. **Brand “or equivalent”**; model and country of assembling “to be mentioned”; reputable **country of origin**.
4. **Life span and safety standards** (r.29(1)(c),(d)) — e.g. operating life 20,000 h or higher.
5. **Tests** — test procedure for conformity (r.29(1)(g)), factory test certificates, **pre-shipment inspection**, site testing and **commissioning**.
6. **Manufacturer's authorisation** and record of similar supplies with references (r.49).
7. **Warranty** (e.g. three years minimum), maintenance guarantee, **after-sales service**, spare parts (r.40(5)).
8. **Accessories, manuals and training**.
9. **Technical compliance sheet** and brochures with the tender; post-qualification inspection of the supplier's facilities.`,
    keys: ['Performance/output', 'Standards', 'or equivalent', 'country of origin', 'Life span', 'Tests', 'pre-shipment inspection', 'commissioning', "Manufacturer's authorisation", 'Warranty', 'after-sales service', 'Technical compliance sheet'],
    lists: ['l-em-reliability'],
    src: 'PPR r.29, 40, 49; IA sir projector specification; question bank',
  },
  {
    id: 'a-boq-purpose',
    topic: T,
    q: 'What is the purpose of BoQ?',
    seen: ['2011-12'],
    a: `A **BoQ** contains all items of works and supplies for construction, testing and commissioning, each with an estimated quantity. Its objects:
1. **Accurate preparation of tenders** — quantities measured on a **uniform basis**, so tenders are prepared efficiently and accurately.
2. **Basis for financial control** — the priced BoQ is used for the **periodic valuation** of works executed.
3. **Calculates the contract price** (rate × quantity).
4. **Payment** — actual quantities are measured and paid at the **quoted unit rate**.
5. **Standardises the tendering process** and lets consultants/quantity surveyors compare and check tenders.
6. **Values variations** at the BoQ rates.`,
    keys: ['BoQ', 'Accurate preparation of tenders', 'uniform basis', 'financial control', 'periodic valuation', 'contract price', 'quoted unit rate', 'Standardises', 'variations'],
    lists: ['l-boq-purpose'],
    src: 'IA sir GCC+TEC slides 4–5; Tender Document slides 7–8; senior note Q25',
  },
  {
    id: 'a-boq-format',
    topic: T,
    q: 'In a standard format prepare a BoQ for a work item (e.g. concreting work in foundation).',
    seen: ['May 2024', '2020-21', '2017-18', '2015-16', '2013-14', '2012-13', '2011-12'],
    a: `### Bill of Quantities — Name of Work: Construction of a multi-storied building
**Bill No. 3: Concrete Works**

| Item No. | Description of item | Unit | Quantity | Unit rate in figures (Tk) | Unit rate in words | Amount (Tk) |
|---|---|---|---|---|---|---|
| 3.01 | Cast-in-situ reinforced cement concrete in foundation (footings, pile caps, raft, grade beams), mix designed for f′c = 25 MPa at 28 days, Portland cement, coarse sand FM ≥ 2.5, 20 mm down crushed stone chips; batching by weight, machine mixing, placing, compacting with vibrator, shuttering and removal, curing ≥ 14 days, sampling and testing of cylinders; all complete as per drawings, specifications and instructions of the Engineer; reinforcement measured and paid separately | m³ | 50.00 | 14,000.00 | Fourteen thousand only | 7,00,000.00 |
| | **Carried to Summary** | | | | | 7,00,000.00 |

How it works: the description says **what is included** (material, workmanship, testing) so the rate is complete; the tenderer quotes the **unit rate in figures and words**; **Amount = Quantity × Rate**; the contractor is paid on the **actual measured quantity** at the quoted rate.`,
    keys: ['Bill of Quantities', 'Item No.', 'Description of item', 'Unit', 'Quantity', 'Unit rate in figures', 'Unit rate in words', 'Amount', 'Carried to Summary', 'Amount = Quantity × Rate', 'actual measured quantity'],
    lists: ['l-boq-cols'],
    src: 'Standard BoQ format (question bank); IA sir GCC+TEC slides 4–5',
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
    a: `The **variation / extra work order** provision. A missing item is a **non-tendered item (NTI)**.
1. **Variation order** — for increase/decrease or **new work items** from change of plan, design or alignment **within the general scope** (PPR r.78(1)); **extra work order** — new work needed to complete, improve or protect the original works because of materially different site conditions (r.78(2)).
2. **Notice** — the contractor gives written notice with full particulars **within 7 days**, otherwise the claim is waived (r.79(1)).
3. **Preparation** — the Engineer prepares the order with plans, quantities per item and location, a unit-cost estimate and justification (r.79(2)).
4. **Rate** — same or similar item → the **original BoQ rate**; new item → direct costs from the contractor's price breakdown or agreed market prices **plus the contractor's mark-up** (taxes, overheads, profit) (r.80(1)).
5. **Approval** — by the approving authority within **15%** of the original price; beyond, the **next higher authority** (r.74(4)); processing ≤ 30 days.
6. **No work before approval** (r.80(3)), except emergency start authorised by the HOPE; contract amended; paid after approval.

(The question bank prices new items from the agency's schedule of rates; PPR r.80 uses the contractor's own price breakdown and mark-up.)`,
    keys: ['Variation order', 'non-tendered item', 'new work items', 'within the general scope', 'extra work order', 'within 7 days', 'original BoQ rate', 'mark-up', '15%', 'next higher authority', 'No work before approval'],
    lists: ['l-vo-procedure'],
    src: 'PPR r.74(4), 78–80, Sch II; senior note Q16',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
