// IA sir block (Prof. Ishtiaque Ahmed: PPA 2006, PPR 2008, tender documents, conditions of contract,
// specifications, consultants) — how each past-paper part is answered.
// Part ids and wording: ./skeleton.ts; owners: CE301/Claude digests/part_owners.md.
// Source digest: CE301/Claude digests/lec_procurement.md. Teacher material and PPA/PPR win over the question bank.
import type { PcPartMap } from '../types'
import { BOQ_NOTE, BRICK_PLINTH, RCC_BRIDGE, RCC_MAT_OLD, RCC_OLD, RCC_SUBS, boqBrick, boqRcc, boqTable } from '../content/spec'

const LAW = 'pc-law' as const
const MET = 'pc-methods' as const
const PRO = 'pc-process' as const
const DOC = 'pc-docs' as const
const GCC = 'pc-gcc' as const
const SPE = 'pc-spec' as const
const SVC = 'pc-services' as const

// ---------- shared maps ----------
const actReg: PcPartMap = { topics: [LAW], ans: ['a-act-vs-reg'] }
const flow: PcPartMap = { topics: [PRO], ans: ['a-tender-flow'] }
const priority: PcPartMap = { topics: [DOC], ans: ['a-contract-priority'] }
const forfeit: PcPartMap = { topics: [PRO], ans: ['a-forfeit'] }
const docElements: PcPartMap = { topics: [DOC], ans: ['a-tender-doc-elements'] }
const evalSteps: PcPartMap = { topics: [PRO], ans: ['a-eval-steps'] }
const servicesMethods: PcPartMap = { topics: [SVC], ans: ['a-services-methods'] }
const methodsApplic: PcPartMap = { topics: [MET], ans: ['a-methods-applicability'] }
const jv: PcPartMap = { topics: [PRO], ans: ['a-jv'] }
const specConcrete: PcPartMap = { topics: [SPE], ans: ['a-spec-concrete'] }
const specWhyAttrs: PcPartMap = { topics: [SPE], ans: ['a-spec-why', 'a-spec-attrs'] }
const gccClauses: PcPartMap = { topics: [GCC], ans: ['a-gcc-pcc-relation', 'a-gcc-clauses'] }

const qbFlowNote = 'The question bank and the 18-batch solve’s simple chart (TF p.29: Prepare Tender Documents → Publish Tender Notice → Pre-bid Meeting (optional) → Receive and Evaluate Bids → Evaluation and Selection of Preferred Bidder → Award Contract → Signing Contract) start by preparing the tender document. IA sir’s chart starts at Tender Notice and (12 May 2015 version) has no separate opening box — draw sir’s.'
const priorityNote = 'Cite PPR 2008 r.4(7) — the question bank writes “Rule 15(7)”.'

// ---------- BoQ (pc-spec parts) ----------
// Ishtiaque sir: “Quantity and unit are to be included but not rate and amount.” Every BoQ is drawn in the class
// columns with the unit and the quantity filled in and the last three columns blank; the item descriptions are the
// ones the solves say to memorise word for word (they live in content/spec.ts so the answers and the papers agree).
const boq = (table: string) => `${table}\n\n${BOQ_NOTE}`
/** the RCC item 6 / 6.1 with the sub-items that carry the quantity */
const boqConc = (subs: [no: string, name: string, qty: string][]) => boq(boqRcc(subs))
const FOOTING = 'Individual & combined footing'

// ---------- TDS (pc-docs parts) ----------
// The class formulas (18-batch solve pp.35–36): turnover = cost ÷ years × 3; gap between one bill = months ÷ bills + 3
// (kept unrounded); liquid asset = cost ÷ months × gap, rounded up to a whole crore; tender security 2 %.
// The sheet under each part draws the table; this is the working the student writes under it.
const n3 = (x: number) => String(+x.toFixed(3))
const tdsWork = (cost: number, months: number, close: string, lead = 'Assuming the billing amount is 10% (10 bills).') => {
  const years = months / 12
  const gap = months / 10 + 3
  const liquid = (cost / months) * gap
  const up = Math.ceil(liquid - 1e-9)
  return `${lead}

Draw the table “Tender Data Sheet” with the bands **Qualification Criteria** (general experience, specific experience, liquid asset, turnover) and **Tender Preparation** (tender security), then write the working under it:

- Gap between one bill = (${n3(months)} ÷ 10) + 3 = **${n3(gap)} months** (3 months is the assumed delay)
- Liquid asset = (${n3(cost)} ÷ ${n3(months)}) × ${n3(gap)} = ${n3(liquid)}${up === +n3(liquid) ? '' : `, rounded up to **Tk ${up} crore**`}${up === +n3(liquid) ? ` = **Tk ${up} crore**` : ''}
- Annual turnover = (${n3(cost)} ÷ ${n3(years)}) × 3 = **Tk ${n3((cost / years) * 3)} crore**
- Tender security = 2% × ${n3(cost)} = **Tk ${n3(0.02 * cost)} crore**, written as a fixed amount (2 to 3% of the total cost)
- Specific experience, a job close to this one: ${close}, 80% × ${n3(cost)} = **Tk ${n3(0.8 * cost)} crore**, 1 contract in the last 5 years`
}

export const IA_MAP: Record<string, PcPartMap> = {
  // ===== May 2024 (printed 2021-2022) =====
  'pc-may-2024-4a': { ...flow, notes: [qbFlowNote] },
  'pc-may-2024-4b': {
    topics: [GCC],
    ans: ['a-gcc-pcc-relation', 'a-gcc-clauses'],
    extra: `Write the relation paragraph in two lines, then only these four rows:

| Terminology | GCC Clause | PCC Clause |
|---|---|---|
| (i) Liquidated Damage | The Contractor pays liquidated damages at the rate in the PCC for each week of delay beyond the Intended Completion Date, up to the maximum in the PCC; deducted from payments; once the maximum is reached the Procuring Entity may terminate; payment does not relieve the Contractor of its obligations | The applicable rate for liquidated damages for delay shall be 0.5 percent of the Contract Price for each week of delay. The maximum amount of liquidated damages shall be Ten (10%) percent of the Contract Price |
| (ii) Completion Time | The Contractor shall commence the Works on the Start Date and complete the whole of the Works by the Intended Completion Date; only the Project Manager can extend it, if a compensation event occurs or a variation is issued (decision within 21 days; up to 20% of the original time, above that HOPE) | The Start Date shall be [date]. The Intended Completion Date for the whole of the Works shall be [date] (e.g. 730 days from the Start Date) |
| (iii) Retention Money | 29. The Procuring Entity shall retain from each progressive payment due to the Contractor at the percentage specified in the PCC until completion of the whole of the Works. On completion of the whole of the Works the first half of the total amount retained shall be repaid to the Contractor and the remaining second half after the Defects Liability Period has passed | The amount of Retention Money to hold in each progress claim is 10% of the work done and up to 5% of the contract sum |
| (iv) Price Adjustment | The Contract Price shall be adjusted for rise or fall in the cost of inputs (labour, materials, fuel) only if provided for in the PCC, using the formula stated there (PPR r.5: contracts longer than 18 months) | Price adjustment is applicable; the coefficients for labour, materials and fuel and the base indices are stated |`,
    notes: ['LD and retention rows follow the 18-batch solve (0.5% per week, max 10%; 10% of the work done, up to 5% of the contract sum). No senior solve of this paper exists; the completion-time and price-adjustment wording is the typed note’s (PYQ-32, current batch).'],
  },
  'pc-may-2024-5b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ for 50 m³ of concrete in the foundation
${boqConc([['6.1.1', FOOTING, '50']])}

The whole 50 m³ is put against the footing. If the foundation also has grade beams, add 6.1.3 Foundation beam up to plinth level and split the volume so the total stays 50 Cum.`,
  },
  'pc-may-2024-5c': { ...priority, notes: [priorityNote] },
  'pc-may-2024-8a': servicesMethods,
  'pc-may-2024-8b': {
    topics: [SVC],
    ans: ['a-qcbs-method'],
    calc: {
      kind: 'qcbs',
      techWeight: 80,
      qualify: 80,
      firms: [
        { name: 'Alpha Consulting', tech: 84, price: 5.5 },
        { name: 'GBH', tech: 76 },
        { name: 'Omega Advisory', tech: 90, price: 6.0 },
        { name: 'Peter IT Solutions', tech: 87, price: 6.2 },
        { name: 'Giga Solutions', tech: 95, price: 6.5 },
      ],
      unit: 'million Tk',
    },
    extra: 'Next step: the technical report is approved; GBH (76 < 80) gets its financial proposal back unopened. The PEC invites **Giga Solutions** (highest combined score) to negotiate methodology, work plan, staffing, deliverables, inputs and reimbursables — not staff remuneration rates (PPR r.122). If negotiation fails, Omega Advisory is invited. Then approval → NOA → contract.',
  },

  // ===== 2021-22 =====
  'pc-2021-22-3b': { topics: [SVC], ans: ['a-terms-compare'] },
  'pc-2021-22-4': { ...methodsApplic, ans: ['a-tender-methods-list', 'a-methods-applicability'] },
  'pc-2021-22-7b': { topics: [PRO], ans: ['a-otm-steps', 'a-tender-flow'], notes: ['Seniors file this part under IA sir’s tender flow chart (typed note PYQ-21). The four-column steps chart is IA sir’s own “Steps with tentative timeline” slide: draw it as four boxed columns PQ → Tendering → Evaluation → Contracting with arrows, then the tender flow chart if time allows.'] },
  'pc-2021-22-8a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 80, months: 36, storeys: 20, items: ['Specific Experience', 'General Experience', 'Turnover', 'Tender Security', 'Credit facility / Liquid Asset'] },
    extra: tdsWork(80, 36, '15 storeys for 20'),
  },
  'pc-2021-22-8b': forfeit,

  // ===== 2020-21 =====
  'pc-2020-21-3a': { topics: [PRO], ans: ['a-eval-items'] },
  'pc-2020-21-4a': {
    topics: [SVC],
    ans: ['a-qcbs-method'],
    calc: {
      kind: 'qcbs',
      techWeight: 80,
      qualify: 80,
      firms: [
        { name: 'Abacus Ltd.', tech: 85, price: 100 },
        { name: 'System Engineers', tech: 95, price: 130 },
        { name: 'Delta Inc.', tech: 70 },
        { name: 'Wye System Inc.', tech: 80, price: 95 },
      ],
      unit: 'million Tk',
    },
    extra: 'Delta Inc. (70 < 80) is technically non-responsive; its financial proposal is returned unopened. Wye System (exactly 80) qualifies. System Engineers is invited for negotiation.',
  },
  'pc-2020-21-4b': { topics: [PRO], ans: ['a-arith-correction'] },
  'pc-2020-21-7b': forfeit,
  'pc-2020-21-7c': { ...priority, notes: [priorityNote] },
  'pc-2020-21-8a': { topics: [GCC], ans: ['a-fidic-select'] },
  'pc-2020-21-8b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ for 100 m³ of concrete in foundation (latest edition of the item)
${boqConc([['6.1.1', FOOTING, '100']])}

### The earlier edition (what the 18-batch solve wrote for this question)
${boqTable([['1', RCC_OLD, 'cum', '100']])}

Write one of the two. The older solve heads its columns SL. No, Description of Work, Unit, Quantity, Rate in Tk., Amount, and also leaves the rate and the amount blank.`,
  },

  // ===== Jan 2021 =====
  'pc-jan-2021-1a': { topics: [LAW], ans: ['a-pplan-purpose'] },
  'pc-jan-2021-1b': { topics: [LAW], ans: ['a-pplan-format'] },
  'pc-jan-2021-1c': { topics: [LAW], ans: ['a-ppa-transparency'] },
  'pc-jan-2021-2a': { ...flow, notes: [qbFlowNote] },
  'pc-jan-2021-2b': docElements,
  'pc-jan-2021-2c': { ...priority, notes: [priorityNote] },
  'pc-jan-2021-3a': specWhyAttrs,
  'pc-jan-2021-3b': { topics: [SPE], ans: ['a-em-reliability'] },
  'pc-jan-2021-3c': specConcrete,

  // ===== 2015-16 =====
  'pc-2015-16-1a': evalSteps,
  'pc-2015-16-1b': flow,
  'pc-2015-16-2a': docElements,
  'pc-2015-16-2b': { ...jv, extra: 'Only 5 marks: PPA s.27 (the three sub-sections) and requirements 1–3; the words **joint and several liability** are compulsory.' },
  'pc-2015-16-2c': { topics: [GCC], ans: ['a-gcc-timely'] },
  'pc-2015-16-3a': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ for concrete in the foundation mat of a high-rise building (quantity assumed: 424 m³)
${boqConc([['6.1.1', 'Foundation mat (raft)', '424']])}

The item is the class RCC item; the schedule’s first sub-item reads “Individual & combined footing”, so for a mat the sub-item is named after the mat.

### What the 18-batch solve wrote (an older 1:2:4 item)
${boqTable([
      ['**07**', '**Concrete Work for Foundation Mat**'],
      ['07.1', RCC_MAT_OLD, 'cum', '424'],
    ])}

Either is accepted in class; the 6.1 item is the latest one and agrees with the concrete specification (f′c = 25 MPa, 1:1.5:3, stone chips).`,
    notes: ['The paper gives no quantity; state your assumed quantity.'],
  },
  'pc-2015-16-3b': { topics: [SPE], ans: ['a-missing-item'] },
  'pc-2015-16-3c': { topics: [MET], ans: ['a-egp'] },

  // ===== 2014-15 =====
  'pc-2014-15-1a': methodsApplic,
  'pc-2014-15-1b': { topics: [MET], ans: ['a-otm-preferred'] },
  'pc-2014-15-2a': servicesMethods,
  'pc-2014-15-2b': {
    topics: [SVC],
    ans: ['a-qcbs-method'],
    calc: {
      kind: 'qcbs',
      techWeight: 80,
      qualify: 75,
      firms: [
        { name: 'A', tech: 75, price: 10 },
        { name: 'B', tech: 85, price: 12 },
        { name: 'C', tech: 90, price: 15 },
      ],
      unit: 'million Tk',
    },
    extra: 'All three reach the qualifying mark of 75 (A exactly 75). C is invited for negotiation.',
  },
  'pc-2014-15-3a': jv,
  'pc-2014-15-3b': {
    ...gccClauses,
    extra: 'Pick any five rows from the clause table: definitions, advance payment, performance security, retention money, liquidated damage, compensation events (list the events), arbitration.',
  },

  // ===== 2013-14 =====
  'pc-2013-14-1a': { topics: [SPE], ans: ['a-r29'] },
  'pc-2013-14-1b': { topics: [SPE], ans: ['a-spec-goods', 'a-spec-brick'], extra: 'Goods item: the multimedia projector. Civil work item: brick work with its BoQ item (or the specification of concrete with its BoQ item).' },
  'pc-2013-14-2a': { ...priority, notes: [priorityNote] },
  'pc-2013-14-2b': {
    topics: [DOC],
    ans: ['a-noa'],
    extra: `The 18-batch solve of this part (write it in full):

**Government of The People's Republic of Bangladesh**

**Bangladesh University of Engineering & Technology**

**Notification of Award**

Contract No: 322.29315 — Date: 29/3/2023

To, X-Brothers Ltd, Niketan, Gulshan, Dhaka.

This is to notify you that your Tender dated 1/1/2023 for construction work of a Residential hall at BUET for the Contract Price of Tk. 10,00,00,000 (Ten crore BDT) as corrected and modified in accordance with the Instructions to Tenderers, has been approved by competent authority.

You are thus requested to take following actions:
1. Accept in writing the Notification of Award within seven (7) days of its issuance pursuant to ITT sub-clause 32.1.
2. Furnish a Performance security in the specified format and in the amount of Tk. 1,00,00,000 (1 crore BDT) within fourteen (14) days of issuance of this letter but not later than 12/4/2023, in accordance with ITT clause 32.3.
3. Sign the contract within twenty eight (28) days of issuance of this letter but not later than 26/4/2023, in accordance with ITT clause 32.6.

You may proceed with the execution of the works only upon completion of the above tasks. You may also please note that this Notification of Award shall constitute the formation of this contract which shall become binding upon you.

We attach the draft contract and all other documents for your perusal and signature.

[Signature, date] — Duly authorised to sign for and on behalf of the Project coordinator, BUET.

The paper gives no price or dates: the solve assumes Tk 10 crore, so the performance security is 10% = Tk 1 crore.`,
    notes: ['The question bank’s sample gives 28 days for performance security; PPR Sch VII and IA sir’s Assignment 02 give 14 days.'],
  },
  'pc-2013-14-2c': flow,
  'pc-2013-14-3a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 1000, months: 36, lengthM: 1500, items: ['General Experience', 'Specific Experience', 'Tender Security', 'Construction Turnover', 'Liquid Asset / Working Capital'] },
    extra: `${tdsWork(1000, 36, 'a river bridge at least 1,200 m long for 1,500 m (80%)')}
- General experience: a very large job, so 10 (Ten) years is a reasonable number here.

**(v) Pre-tender meeting** — “A pre-tender meeting shall be held on [date] at [time] at the office of the Procuring Entity [address]. Tenderers may submit their queries in writing before the meeting. Minutes of the meeting will be sent to all purchasers of the tender document. Non-attendance shall not be a cause for disqualification.”`,
    notes: ['No senior solve of this part exists; the figures follow the class formulas. The pre-tender meeting entry is from the typed note (PYQ-19), written by a current-batch student.'],
  },
  'pc-2013-14-3b': {
    topics: [PRO],
    ans: ['a-arith-correction', 'a-contract-price', 'a-postqual'],
    notes: ['Post-qualification is done even after prequalification (PPR r.93(20)) — the question bank says it replaces PQ.'],
  },
  'pc-2013-14-4a': { topics: [GCC], ans: ['a-fidic-prefer'] },
  'pc-2013-14-4b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ for concrete in the superstructure of a bridge (quantity assumed: 450 m³)
${boq(
      boqTable([
        ['**10**', '**RCC works in super-structure of bridge**'],
        ['10.1', RCC_BRIDGE, 'cum', '450'],
      ]),
    )}

This is the class RCC item (1:1.5:3, f′c = 25 MPa, f′cr = 33.5 MPa, water cement ratio 0.40) reworded for the deck slab, main girders and cross girders, with steel shutter and staging.`,
    notes: ['No quantity given; state the assumption.', 'No senior solve of this part exists. The description is the class RCC item adapted to a bridge (typed note, PYQ-40).'],
  },

  // ===== 2012-13 =====
  'pc-2012-13-1a': {
    topics: [MET],
    ans: ['a-tender-methods-list', 'a-methods-applicability'],
    extra: 'International competitive tendering (PPA s.33–34): **International open tendering** — when competitive tenders cannot be obtained in the country and effective international competition needs special efforts; **international two-stage** — large complex projects / rapidly evolving technology; **international RFQ** — bulk divisible commodities (food grains, fertilizer, fuel) at market-linked prices; **international limited tendering** — specialised items from a few foreign suppliers; **international direct procurement** — sole foreign source or additional procurement.',
  },
  'pc-2012-13-1b': { topics: [MET], ans: ['a-ict-provisions'] },
  'pc-2012-13-2a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 200, months: 30, lengthM: 240, items: ['General Experience', 'Specific Experience', 'Construction Turnover', 'Liquid Asset', 'Tender Security'] },
    extra: `${tdsWork(200, 30, 'a bridge at least 192 m long for 240 m (80%), with spans of about 50 m', 'Duration is not given: **assumed 30 months**. Assuming the billing amount is 10% (10 bills). Say both in the script.')}

Further TDS items:

| Item | TDS entry |
|---|---|
| Employer / contract | Executive Engineer, [ ] Road Division, RHD; Construction of 240 m PC girder bridge (4 × 60 m) over [ ] river |
| Tender validity | 120 days from the tender closing date (class: generally 90–120 days; PPR: 60–120 days) |
| Key personnel | Project Manager: B.Sc. Civil, 15 years incl. 5 as PM of bridges; Bridge Engineer 10 years; QC/Materials Engineer; Surveyor |
| Key equipment | Bored-piling rigs, 50 t cranes, batching plant, transit mixers, concrete pumps, prestressing jacks, launching gantry |
| Pre-tender meeting | Date, time, venue; site visit; minutes to all purchasers |
| Tender closing / opening | Date, time, place (or e-GP) |`,
  },
  'pc-2012-13-2b': { topics: [DOC], ans: ['a-accompaniments'] },
  'pc-2012-13-3a': {
    ...gccClauses,
    extra: 'Assume a project (e.g. RHD’s 240 m bridge) and give at least five rows with its own names and figures — definitions, completion time, liquidated damages, performance security, retention, advance payment, settlement of disputes.',
  },
  'pc-2012-13-3b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `Any major item with its full description is accepted. The RCC item is the safest choice; a sample BoQ shows all eight sub-items (quantities are a sample, state that they are assumed).

${boqConc(RCC_SUBS)}

If time allows add a second item, brick work: “${BRICK_PLINTH}” (item 19.1, unit cum).`,
  },

  // ===== 2011-12 =====
  'pc-2011-12-1a': actReg,
  'pc-2011-12-1b': { topics: [LAW], ans: ['a-ppa-scope'] },
  'pc-2011-12-1c': { topics: [LAW], ans: ['a-pplan-purpose', 'a-pplan-format'], extra: 'Only 5 marks: one-line definition, then the column headings of the table.' },
  'pc-2011-12-1d': { topics: [MET], ans: ['a-tender-methods-list'] },
  'pc-2011-12-2a': flow,
  'pc-2011-12-2b': docElements,
  'pc-2011-12-2c': { ...priority, notes: [priorityNote] },
  'pc-2011-12-2d': { topics: [GCC], ans: ['a-comp-events'] },
  'pc-2011-12-3a': { topics: [SPE], ans: ['a-spec-why'] },
  'pc-2011-12-3b': { topics: [SPE], ans: ['a-spec-attrs'] },
  'pc-2011-12-3c': {
    ...specConcrete,
    extra: 'Only 6 marks: write every heading with its key figures on one line each (Materials, Mix ratio 1:1.5:3, Strength and curing 25 MPa and 28 days, Transportation, Compaction, Workmanship, Testing ASTM C31 / C33 / C39, Payment, Measurements), then the BoQ row with unit and quantity.',
  },
  'pc-2011-12-3d': { topics: [SPE], ans: ['a-generator'] },
  'pc-2011-12-4a': { topics: [SPE], ans: ['a-boq-purpose'] },
  'pc-2011-12-4b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ for 50 m³ of concrete in the foundation of a multi-storied building
${boqConc([['6.1.1', FOOTING, '50']])}

8 marks: the table with the full description is the answer. The whole 50 m³ is put against the footing (add 6.1.3 Foundation beam up to plinth level only if you split the volume).`,
  },
  'pc-2011-12-4c': { topics: [SPE], ans: ['a-qty-variation'] },
  'pc-2011-12-4d': { topics: [SPE], ans: ['a-missing-item'] },
  'pc-2011-12-5a': {
    topics: [SVC],
    ans: ['a-eoi-notice'],
    extra: `For this case (**overseas consultant**): Civil Aviation Authority of Bangladesh (CAAB) letterhead; title “Request for Expressions of Interest (International) — Consultancy Services for Design and Supervision of an Airport for Wide-Body Aircraft”.

- Background: fund source (GOB / development partner), objective — an airport able to handle wide-body (Code E) aircraft.
- Scope: master plan review, design of runway, taxiways, apron, terminal, control tower, navaids and utilities; tender documents; construction supervision; duration.
- Invitation to eligible **international** firms, alone or in JV/association; association with local firms encouraged but **not mandatory** (PPA s.39(2)).
- Experience asked: design and supervision of at least two international airports for wide-body aircraft in the last 10 years.
- Short-list of 4–7 firms; not more than two from one country and at least one from a developing country (PPR r.115(4)).
- EoI in **English**; deadline at least **21 days** after publication (international); advertised also in an international English newspaper / UNDB (s.40(5)).`,
    notes: ['Question bank: “short list of not more than six” and “≥ 28 days” — PPA/PPR: 4–7 (preferably 6), ≥ 21 days international.'],
  },
  'pc-2011-12-5b': {
    topics: [SVC],
    ans: ['a-qcbs-method'],
    calc: {
      kind: 'qcbs',
      techWeight: 70,
      qualify: 70,
      firms: [
        { name: 'A', tech: 88, price: 20 },
        { name: 'B', tech: 80, price: 16 },
      ],
      unit: 'million Tk',
    },
    extra: 'Your own example (the paper gives no numbers): assume minimum technical score 70 and the prices above. B wins despite the lower technical score, because price carries 30%.',
  },
  'pc-2011-12-5c': { topics: [SVC], ans: ['a-consultant-steps'] },
  'pc-2011-12-6a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 100, months: 36, storeys: 20, items: ['Specific Experience', 'General Experience', 'Turnover', 'Tender Security', 'Credit facility / Liquid Asset'] },
    extra: tdsWork(100, 36, '15 storeys for 20', 'Duration is not given: **assumed 36 months**. Assuming the billing amount is 10% (10 bills). Say both in the script.'),
  },
  'pc-2011-12-6b': forfeit,
  'pc-2011-12-7': {
    topics: [PRO, GCC],
    ans: ['a-arbitration', 'a-postqual', 'a-arith-correction', 'a-front-loading', 'a-jv'],
    extra: 'Short notes, about 4 marks each: definition + 3–4 points per term. (e) JVCA = Joint Venture, Consortium or Association — definition, PPA s.27(3) and the words **joint and several liability** (Sir gives 0 without them).',
  },

  // ===== 2016-17 =====
  'pc-2016-17-1a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 50, months: 48, storeys: 20, items: ['General Experience', 'Specific Experience', 'Tender Security', 'Turnover', 'Liquid Asset'] },
    extra: tdsWork(50, 48, '15 storeys for 20', 'This is the part the 18-batch solve works out. Assuming the billing amount is 10% (10 bills).'),
  },
  'pc-2016-17-1b': {
    topics: [DOC],
    ans: ['a-noa'],
    extra: 'Fill the standard NOA for the 20-storied building (Tk 50 crore): contract price as corrected; accept within 7 days; performance security **Tk 5 crore (10%)** within 14 days; sign within 28 days; NOA forms the contract.',
    notes: ['The senior solve (Pallab / Nafee, RCCR → Silver Tech) writes performance security Tk 50 lakh — that is 1%; it should be 10% = Tk 5 crore. It also cites “ITT Clause” without numbers: use 32.1 / 32.3 / 32.6.'],
  },
  'pc-2016-17-2a': {
    ...gccClauses,
    ans: ['a-gcc-pcc-relation', 'a-gcc-clauses', 'a-comp-events'],
    extra: 'Rows needed: (i) completion time, (ii) liquidated damage, (iii) compensation events — list the events in the GCC column, (iv) retention, (v) arbitration (amicable → adjudication → arbitration; PCC: venue, rules, appointing authority).',
  },
  'pc-2016-17-2b': {
    ...specConcrete,
    extra: `“In building”: the specification is the same (it already names footing, column, slab and beam). The BoQ after it carries all the sub-items of the building (sample quantities; say they are assumed):

${boqConc(RCC_SUBS)}

The 18-batch typed solve of this part used weaker concrete for a building: f′c 19 MPa, f′cr 26 MPa, water cement ratio 0.45, mix 1:2:4, brick chips and half local sand (F.M. 1.2). Those values belong to the older 1:2:4 BoQ item; do not mix them with the 6.1 item.`,
  },
  'pc-2016-17-3a': {
    topics: [LAW],
    ans: ['a-pplan-purpose', 'a-pplan-format'],
    extra: 'Prepare the plan “on behalf of a procuring entity” — the DUET Annual Procurement Plan layout with one or two of your own packages (e.g. WD1 construction of an academic building, OTM, HOPE, GOB, cost, planned dates and days).',
  },
  'pc-2016-17-3b': evalSteps,
  'pc-2016-17-3c': {
    topics: [SVC],
    ans: ['a-qcbs-method'],
    calc: {
      kind: 'qcbs',
      techWeight: 80,
      qualify: 75,
      firms: [
        { name: 'A', tech: 70 },
        { name: 'B', tech: 85, price: 2 },
        { name: 'C', tech: 90, price: 2.5 },
        { name: 'D', tech: 80, price: 2 },
      ],
      unit: 'crore',
    },
    extra: 'A (70 < 75) is disqualified — financial proposal returned unopened. B and C both get **88**. Class rule (N.B.): if the combined score of two consulting firms is the same, the firm with the **greater technical score** is selected — so **C (90) is 1st, B 2nd, D 3rd. C is selected** and invited to negotiate. Write the N.B. line under the table.',
    notes: ['Class rule: TF solve p.19 and typed note Ques-14 N.B.; Pallab’s solve gives the same ranking “[As technical score has more weightage]”.'],
  },

  // ===== 2017-18 =====
  'pc-2017-18-1a': { topics: [LAW], ans: ['a-act-vs-reg', 'a-ppa-ppr-function'] },
  'pc-2017-18-1b': { topics: [MET], ans: ['a-tender-methods-list', 'a-methods-applicability'] },
  'pc-2017-18-2a': { topics: [PRO], ans: ['a-tender-flow', 'a-eval-steps'] },
  'pc-2017-18-2b': { ...priority, notes: [priorityNote] },
  'pc-2017-18-3a': specWhyAttrs,
  'pc-2017-18-3b': {
    topics: [SPE],
    ans: ['a-spec-concrete', 'a-spec-brick'],
    extra: `Write one of the two. The concrete specification has every heading the question names (material quality, transportation, workmanship, testing, measurement, payment); the brick-work one has no transportation heading. For a high-rise building the BoQ after the concrete specification carries the sub-items of the whole frame (sample quantities; say they are assumed):

${boqConc(RCC_SUBS)}`,
  },
  'pc-2017-18-4a': {
    topics: [SPE],
    ans: ['a-boq-brick'],
    extra: `### BoQ for 50 m³ of brick work in a multi-storied building
${boq(boqBrick('50'))}

The paper gives no wall thickness; the item is for a 250 mm wall (“width one brick length”) in the superstructure.`,
  },
  'pc-2017-18-4b': {
    ...gccClauses,
    extra: 'Rows needed: (i) definitions of “The Employer”, “Contractor”, “The Engineer” and “Day” (calendar day unless working day stated); (ii) performance security; (iii) variation; (iv) payment; (v) settlement of disputes (amicable → adjudication → arbitration).',
  },

  // ===== 2023-24 (latest) =====
  'pc-2023-24-5a': actReg,
  'pc-2023-24-5b': { topics: [MET], ans: ['a-otm-preferred'], extra: '15 marks: give the six reasons with a line each, then the PPA s.31 conditions as the requirements that make it transparent.' },
  'pc-2023-24-5c': { ...flow, notes: [qbFlowNote] },
  'pc-2023-24-6a': { topics: [SVC], ans: ['a-consultant-steps'] },
  'pc-2023-24-6b': servicesMethods,
  'pc-2023-24-7a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 120, months: 60, storeys: 30, items: ['General Experience', 'Specific Experience', 'Construction Turnover', 'Liquid Asset', 'Tender Security'] },
    extra: tdsWork(120, 60, '22 storeys for 30 (0.75 × 30 = 22.5)'),
  },
  'pc-2023-24-7b': forfeit,
}
