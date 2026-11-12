// IA sir block (Prof. Ishtiaque Ahmed: PPA 2006, PPR 2008, tender documents, conditions of contract,
// specifications, consultants) — how each past-paper part is answered.
// Part ids and wording: ./skeleton.ts; owners: CE301/Claude digests/part_owners.md.
// Source digest: CE301/Claude digests/lec_procurement.md. Teacher material and PPA/PPR win over the question bank.
import type { PcPartMap } from '../types'

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

const qbFlowNote = 'Question bank adds a first box “prepare and approve tender document”; IA sir’s chart starts at Tender Notice.'
const priorityNote = 'Cite PPR 2008 r.4(7) — the question bank writes “Rule 15(7)”.'

const WORDS: Record<number, string> = {
  9500: 'Nine thousand five hundred',
  14000: 'Fourteen thousand',
  15500: 'Fifteen thousand five hundred',
  18000: 'Eighteen thousand',
}

const boq = (qty: string, desc: string, unit = 'm³', rate = 14000) => {
  const n = parseFloat(qty.replace(/,/g, ''))
  const amt = (n * rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })
  const r = rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })
  return `| Item No. | Description of item | Unit | Quantity | Unit rate in figures (Tk) | Unit rate in words | Amount (Tk) |
|---|---|---|---|---|---|---|
| 1.01 | ${desc} | ${unit} | ${qty} | ${r} | ${WORDS[rate] ?? '(in words)'} only | ${amt} |
| | **Carried to Summary** | | | | | ${amt} |`
}

const CONC_DESC =
  'Cast-in-situ reinforced cement concrete in foundation (footings, pile caps, grade beams), f′c = 25 MPa at 28 days, Portland cement, coarse sand FM ≥ 2.5, 20 mm down crushed stone chips; batching by weight, machine mixing, placing, vibrating, shuttering, curing ≥ 14 days, cylinder testing; complete as per drawings, specification and Engineer’s instructions; reinforcement paid separately'

export const IA_MAP: Record<string, PcPartMap> = {
  // ===== May 2024 (printed 2021-2022) =====
  'pc-may-2024-4a': { ...flow, notes: [qbFlowNote] },
  'pc-may-2024-4b': {
    topics: [GCC],
    ans: ['a-gcc-pcc-relation', 'a-gcc-clauses'],
    extra: `Write only these four rows of the clause table:

| Item | GCC provision | PCC provision (example) |
|---|---|---|
| (i) Liquidated damage | Contractor pays LD at the rate per day in the PCC for each day beyond the Intended Completion Date, up to the maximum; deducted from payments; does not relieve obligations (PPR r.39(27)–(28)) | 0.05% of contract price per day; maximum 10% |
| (ii) Completion time | Start on the Start Date, complete by the Intended Completion Date; programme; extension for compensation events/variations (r.39(1)–(4)) | Start 14 days after signing; 730 days; EOT decided within 21 days (≤ 20% without HOPE) |
| (iii) Retention money | % of each bill retained till completion; half repaid at completion, rest within 28 days after the Defects Correction Certificate or against a bank guarantee (r.28) | 5% of each bill; retention + PS ≤ 10% when no advance payment |
| (iv) Price adjustment | Prices adjusted for rise/fall of labour, materials, equipment, fuel by the formula, only if the PCC provides; contracts > 18 months (r.5(3)–(5)) | Applicable; Pc = A + B(Ic/Io); indices from BBS; base date 28 days before tender closing |`,
    notes: ['PCC figures are examples; keep within PPR limits.'],
  },
  'pc-may-2024-5b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ — 50 m³ concrete in foundation (Bill No. 3: Concrete Works)\n${boq('50.00', CONC_DESC)}`,
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
  'pc-2021-22-7b': { topics: [PRO], ans: ['a-otm-steps'] },
  'pc-2021-22-8a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 80, months: 36, storeys: 20, items: ['Specific Experience', 'General Experience', 'Turnover', 'Tender Security', 'Credit facility / Liquid Asset'] },
    extra: 'Write it as a table “ITT clause | TDS entry”. Duration three years = 36 months as given.',
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
    extra: `### BoQ — 100 m³ concrete in foundation\n${boq('100.00', CONC_DESC)}`,
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
  'pc-2015-16-2b': jv,
  'pc-2015-16-2c': { topics: [GCC], ans: ['a-gcc-timely'] },
  'pc-2015-16-3a': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ — concrete in the foundation mat (raft) of a high-rise building (quantity assumed: 1,200 m³)\n${boq(
      '1,200.00',
      'Cast-in-situ reinforced concrete in mat (raft) foundation, f′c = 30 MPa at 28 days, Portland cement, coarse sand FM ≥ 2.5, 20 mm down crushed stone; ready-mixed or batched by weight, placed by pump in a continuous pour with planned construction joints, compacted by vibrators; edge formwork, temperature control for mass concrete, curing ≥ 14 days, cylinder testing; complete as per drawings, specification and Engineer’s instructions; reinforcement measured separately',
      'm³',
      15500,
    )}`,
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
  'pc-2013-14-1b': { topics: [SPE], ans: ['a-spec-goods', 'a-spec-brick'], extra: 'Goods item: the projector table. Civil work item: brick work (or concrete in foundation — see a-spec-concrete).' },
  'pc-2013-14-2a': { ...priority, notes: [priorityNote] },
  'pc-2013-14-2b': {
    topics: [DOC],
    ans: ['a-noa'],
    extra: `Fill the standard NOA for this case:

- Letterhead: **Bangladesh University of Engineering and Technology (BUET), Office of the Chief Engineer, Dhaka-1000**; Memo/Contract No. BUET/W-…/…; date.
- To: The Managing Director, **X-Brothers Ltd.**, [address].
- “Your Tender dated … for the execution of the Works for **Construction of a Residential Hall at BUET** for the Contract Price of Tk … (in words) as corrected and modified in accordance with the Instructions to Tenderers, has been approved by BUET.”
- Actions: (i) accept in writing within **7 days**; (ii) performance security **10%** of the contract price within **14 days**, not later than [date]; (iii) sign the contract within **28 days**, not later than [date].
- Proceed only after these; NOA constitutes formation of the contract; draft contract attached.
- Signed for and on behalf of BUET (Chief Engineer); copies to VC, Treasurer, TEC chair.`,
    notes: ['The question bank’s sample gives 28 days for performance security; PPR Sch VII and IA sir’s Assignment 02 give 14 days.'],
  },
  'pc-2013-14-2c': flow,
  'pc-2013-14-3a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 1000, months: 36, items: ['General Experience', 'Specific Experience', 'Tender Security', 'Construction Turnover', 'Liquid Asset / Working Capital'] },
    extra: `Specific experience for this job (physical): at least one river bridge of ≥ 1,000 m length with PC-girder/box-girder or steel superstructure on bored-pile foundations.

**(v) Pre-tender meeting** — to be held at 11:00 am on [date] in the conference room of the procuring entity; site visit on the previous day; written queries to reach the PE at least 7 days before; all who bought or intend to buy the document may attend; minutes and any addendum sent to every purchaser within 1 week (PPA s.44(4)–(5); PPR Sch II).`,
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
    extra: `### BoQ — concrete in bridge superstructure (Bill No. 5: Superstructure; quantity assumed 850 m³)\n${boq(
      '850.00',
      'Cast-in-situ reinforced concrete in bridge superstructure (deck slab, cross-girders, diaphragms, kerbs), f′c = 35 MPa at 28 days, Portland cement, washed coarse sand FM ≥ 2.5, 20 mm down crushed stone, approved admixture; batching plant, pumping, vibrating; staging and formwork, construction joints, finishing, curing ≥ 14 days, testing; complete as per drawings, specification and Engineer’s instructions; excluding reinforcement and prestressing steel',
      'm³',
      18000,
    )}`,
    notes: ['No quantity given; state the assumption.'],
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
    calc: { kind: 'tds', costCrore: 200, months: 30, items: ['General Experience', 'Specific Experience', 'Construction Turnover', 'Liquid Asset', 'Tender Security'] },
    extra: `Duration is not given — **assumed 30 months** (say so in the script).

Specific experience (physical): at least one bridge of ≥ 150 m length with PC-girder spans of ≥ 40 m on bored-pile foundations.

Further TDS items:

| ITT clause | TDS entry |
|---|---|
| Employer / contract | Executive Engineer, [ ] Road Division, RHD; Construction of 240 m PC girder bridge (4 × 60 m) over [ ] river |
| Tender validity | 120 days from the tender closing date (PPR: normally 60–120 days) |
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
    extra: 'Any major item with a full description is accepted — concrete in foundation (as in the answer) is the safest choice; add a second item such as brick work if time allows.',
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
  'pc-2011-12-3c': specConcrete,
  'pc-2011-12-3d': { topics: [SPE], ans: ['a-generator'] },
  'pc-2011-12-4a': { topics: [SPE], ans: ['a-boq-purpose'] },
  'pc-2011-12-4b': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ — 50 m³ concrete in foundation of a multi-storied building\n${boq('50.00', CONC_DESC)}`,
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
    extra: 'Duration is not given — **assumed 36 months** (state it).',
  },
  'pc-2011-12-6b': forfeit,
  'pc-2011-12-7': {
    topics: [PRO, GCC],
    ans: ['a-arbitration', 'a-postqual', 'a-arith-correction', 'a-front-loading', 'a-jv'],
    extra: 'Short notes, about 4 marks each: definition + 3–4 points per term. (e) JVCA = Joint Venture, Consortium or Association — definition plus the conditions list.',
  },

  // ===== 2016-17 =====
  'pc-2016-17-1a': {
    topics: [DOC],
    ans: ['a-tds-method'],
    calc: { kind: 'tds', costCrore: 50, months: 48, storeys: 20, items: ['General Experience', 'Specific Experience', 'Tender Security', 'Turnover', 'Liquid Asset'] },
    extra: 'Tk 50 crore over four years (48 months): annual value Tk 12.5 crore.',
  },
  'pc-2016-17-1b': {
    topics: [DOC],
    ans: ['a-noa'],
    extra: 'Fill the standard NOA for the 20-storied building (Tk 50 crore): contract price as corrected; accept within 7 days; performance security **Tk 5 crore (10%)** within 14 days; sign within 28 days; NOA forms the contract.',
  },
  'pc-2016-17-2a': {
    ...gccClauses,
    ans: ['a-gcc-pcc-relation', 'a-gcc-clauses', 'a-comp-events'],
    extra: 'Rows needed: (i) completion time, (ii) liquidated damage, (iii) compensation events — list the events in the GCC column, (iv) retention, (v) arbitration (amicable → adjudication → arbitration; PCC: venue, rules, appointing authority).',
  },
  'pc-2016-17-2b': specConcrete,
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
    extra: 'A (70 < 75) is disqualified — financial proposal returned unopened. B and C tie at 88.0; C is placed first on the higher technical score (quality is the prime consideration, PPR r.103) and invited to negotiate — state the tie and your tie-break.',
    notes: ['Tie-break by technical score is the engine’s convention; PPR has no QCBS tie rule.'],
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
    extra: 'Write either one (concrete or brick); make sure every heading asked appears: material quality, transportation, workmanship, testing, measurement, payment. For a high-rise building, concrete strength f′c 30–40 MPa and pumping/placing in lifts.',
  },
  'pc-2017-18-4a': {
    topics: [SPE],
    ans: ['a-boq-format'],
    extra: `### BoQ — 50 m³ brick work in a multi-storied building\n${boq(
      '50.00',
      'First-class brick work in cement mortar (1:4) in superstructure walls (250 mm), bricks soaked ≥ 12 h, English bond, joints 10 mm, raking joints, scaffolding, curing ≥ 7 days; complete as per drawings, specification and Engineer’s instructions',
      'm³',
      9500,
    )}`,
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
  },
  'pc-2023-24-7b': forfeit,
}
