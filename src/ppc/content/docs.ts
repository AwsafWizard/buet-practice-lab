// pc-docs — tender document sections, documents forming the contract, TDS, accompaniments, NOA (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-docs).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-docs' as const

const lists: PcList[] = [
  {
    id: 'l-tender-doc-elements',
    topic: T,
    title: 'Essential elements of a tender document',
    ask: 'List the essential elements of a tender document.',
    points: [
      { k: 'Instructions to Tenderer (ITT)', alt: ['ITT', 'instructions to tenderers'], d: 'General rules, same for all tenders; no amounts.' },
      { k: 'Tender Data Sheet (TDS)', alt: ['TDS', 'data sheet'], d: 'Particular data for the ITT: tender security amount, turnover, experience.' },
      { k: 'General Conditions of Contract (GCC)', alt: ['GCC'], d: 'Same for all tenders; definitions, arbitrators, JVCA, risk, compensation events.' },
      { k: 'Particular Conditions of Contract (PCC)', alt: ['PCC', 'special conditions'], d: 'Project-specific figures for the GCC; varies tender to tender.' },
      { k: 'Tender Form', alt: ['tender submission sheet', 'forms'], d: 'Varies tender to tender.' },
      { k: 'Bill of Quantities (BoQ)', alt: ['BoQ', 'BOQ'], d: 'All items with quantities; basis of contract price and payment.' },
      { k: 'General Specification', alt: ['general specifications'], d: 'Site requirements, health & safety, pollution, security.' },
      { k: 'Particular Specification', alt: ['technical specification', 'particular specifications'], d: 'Steel, concrete, bricks, electrical items.' },
      { k: 'The Drawings', alt: ['drawings'], d: 'Detailing of the task.' },
    ],
    ordered: true,
    hook: '“I Think Good People Tender Boldly — General then Particular Drawings”: ITT, TDS, GCC, PCC, Tender form, BoQ, General spec, Particular spec, Drawings. Each pair goes general → particular (ITT→TDS, GCC→PCC, Gen spec→Part spec).',
    seen: ['Jan 2021', '2015-16', '2011-12'],
    src: 'IA sir Tender Document slides 4–9',
  },
  {
    id: 'l-contract-priority',
    topic: T,
    title: 'Documents forming the contract, in order of precedence',
    ask: 'List, in order of priority, the documents that form the contract.',
    points: [
      { k: 'Signed Contract Agreement', alt: ['contract agreement', 'agreement'] },
      { k: 'Notification of Award', alt: ['NOA'] },
      { k: 'Tender and appendices to the Tender', alt: ['tender', 'appendices'] },
      { k: 'Particular Conditions of Contract', alt: ['PCC'] },
      { k: 'General Conditions of Contract', alt: ['GCC'] },
      { k: 'Technical specifications', alt: ['technical specification', 'particular specification'] },
      { k: 'General specifications', alt: ['general specification'] },
      { k: 'Drawings', alt: ['drawing'] },
      { k: 'Priced BoQ / price schedule', alt: ['BoQ', 'bill of quantities', 'price schedule'] },
      { k: 'Other documents including correspondence', alt: ['correspondence', 'other documents'] },
    ],
    ordered: true,
    hook: '“A New Tender Pays Good Teachers Good Dollars — Bills Owed”: Agreement, NOA, Tender, PCC, GCC, Technical spec, General spec, Drawings, BoQ, Others. Rule of thumb: specific beats general (PCC > GCC, technical > general spec).',
    seen: ['May 2024', '2020-21', 'Jan 2021', '2017-18', '2013-14', '2011-12'],
    src: 'PPR 2008 r.4(7)',
    note: 'The question bank cites this as “Rule 15(7)”; the correct citation is PPR r.4(7). The list itself is the same.',
  },
  {
    id: 'l-tds-items',
    topic: T,
    title: 'Qualification items set in a Tender Data Sheet',
    ask: 'Prepare the TDS items (at least five) for a works tender.',
    points: [
      { k: 'General experience', alt: ['years of experience'], d: 'Years in construction as prime contractor (7 / 10 / 15 by size).' },
      { k: 'Specific experience', alt: ['similar experience'], d: 'Physical (similar type/size) and financial (≈70% one / 50% two contracts) within 7 years.' },
      { k: 'Construction turnover', alt: ['turnover', 'annual turnover'], d: 'Average annual inflow over 5 years ≥ 1.5 × annual value.' },
      { k: 'Liquid asset / credit facility', alt: ['liquid asset', 'working capital', 'cash flow'], d: '≈ 10% of the total work.' },
      { k: 'Tender security', alt: ['bid security'], d: 'Fixed sum ≤ 3% of estimate (≈2%), valid 28 days beyond validity.' },
      { k: 'Key personnel', alt: ['technical personnel'], d: 'Project manager, engineers: degree and years.' },
      { k: 'Plant and equipment', alt: ['equipment'], d: 'Owned or leased, by type and number.' },
      { k: 'Tender validity', alt: ['validity period'], d: 'Normally 60–120 days.' },
      { k: 'Pre-tender meeting', alt: ['pre tender meeting'], d: 'Date, time, place; minutes to all buyers.' },
    ],
    hook: 'Gary Spent The Liquid Savings Keeping Plant Valid Pre-tender — General, Specific, Turnover, Liquid, Security, Key personnel, Plant, Validity, Pre-tender meeting.',
    seen: ['2023-24', '2021-22', '2016-17', '2013-14', '2012-13', '2011-12'],
    src: 'IA sir TD slide 5; senior note Q19, Q21; PPR r.22, 48–49, Sch II (multiples = standard practice)',
  },
  {
    id: 'l-accompaniments',
    topic: T,
    title: 'Tender accompaniments',
    ask: 'List the tender accompaniments a tenderer has to submit with the tender.',
    points: [
      { k: 'Signed tender submission sheet', alt: ['tender submission letter', 'tender form'] },
      { k: 'Power of attorney of signatory', alt: ['authorisation'] },
      { k: 'Tender security', alt: ['bid security'] },
      { k: 'Priced BoQ / price schedule', alt: ['priced BoQ', 'price schedule'] },
      { k: 'Valid trade license', alt: ['trade licence'] },
      { k: 'VAT and income-tax (TIN) certificates', alt: ['VAT', 'TIN', 'tax certificate'] },
      { k: 'Experience records with completion certificates', alt: ['completion certificates', 'experience'] },
      { k: 'Audited financial statements (turnover)', alt: ['audited accounts', 'turnover'] },
      { k: 'Bank certificate of liquid asset / credit', alt: ['bank certificate', 'liquid asset'] },
      { k: 'Key personnel CVs', alt: ['CVs', 'key personnel'] },
      { k: 'Plant and equipment list', alt: ['equipment list'] },
      { k: 'JV agreement, if JV', alt: ['JVCA agreement'] },
      { k: 'Affidavit / not-debarred declaration', alt: ['affidavit', 'eligibility declaration'] },
      { k: 'Work plan and method statement', alt: ['method statement', 'work programme'] },
    ],
    seen: ['2012-13'],
    src: 'IA sir TD slides 11–12; PPR r.4(2)(d), 48–49, Sch XI',
  },
  {
    id: 'l-noa-actions',
    topic: T,
    title: 'Actions the NOA asks of the successful tenderer',
    points: [
      { k: 'Accept NOA in writing within 7 days', alt: ['accept in writing', 'acceptance'] },
      { k: 'Furnish performance security within 14 days', alt: ['performance security'] },
      { k: 'Sign contract within 28 days', alt: ['sign the contract'] },
    ],
    ordered: true,
    seen: ['2016-17', '2013-14'],
    src: 'PPR Sch VII; IA sir Assignment 02; PPR Sch II r.102',
  },
  {
    id: 'l-doc-parties',
    topic: T,
    title: 'Parties named in contract documentation',
    points: [
      { k: 'Employer', alt: ['client', 'procuring entity'], d: 'Commissions the construction.' },
      { k: 'Client’s Representative', alt: ['client representative'], d: 'Liaises with the design team and project manager.' },
      { k: 'Adjudicator', alt: ['adjudicator'], d: 'Rules on employer–contractor disputes; preferably not the PM.' },
      { k: 'Contractor', alt: ['contractor'], d: 'Firm contracted to construct the works.' },
      { k: 'Subcontractor', alt: ['sub-contractor'], d: 'Contract with the main contractor for labour, materials or products.' },
      { k: 'Arbitrator', alt: ['arbitrator'], d: 'Binding decision on disputes; cannot be the PM.' },
    ],
    seen: [],
    src: 'IA sir Tender Document slides 1–2',
  },
]

const cards: PcCard[] = [
  { id: 'c-docs-itt-not-contract', topic: T, front: 'Why are the Instructions to Tenderers not a contract document?', back: 'The ITT only covers procedures **up to acceptance of the tender** (preparing, submitting, opening, evaluating) — so it drops out once the contract is formed.', src: 'IA sir Tender Document slide 3' },
  { id: 'c-docs-itt-vs-tds', topic: T, front: 'ITT vs TDS?', back: 'ITT gives **generalised** rules, the same for all tenders, without details — e.g. “deposit tender security” but not the amount. TDS gives the **particular data**: tender security amount (say 2–3%), required turnover, experience, dates.', src: 'IA sir Tender Document slide 5' },
  { id: 'c-docs-tender-bid', topic: T, front: 'Tender vs bid vs offer?', back: '**Tender** = documents completed by a tenderer and returned for evaluation. **Bid** is the US equivalent and, in UK use, covers verbal and written offers; **offer** likewise — so neither is used in contract documents.', src: 'IA sir Tender Document slide 3' },
  { id: 'c-docs-addenda', topic: T, front: 'What are addenda?', back: 'Changes to the tender documents **after they have been sent to tenderers and before acceptance**; they become part of the tender document; deadline extended if issued in the last third of the preparation time.', src: 'IA sir TD slide 4; PPA s.45' },
  { id: 'c-docs-vo', topic: T, front: 'Define a variation order (terminology slide).', back: 'The Project Manager’s **order for alterations, additions and omissions** to the Works.', src: 'IA sir TD slide 4' },
  { id: 'c-docs-contract-docn', topic: T, front: 'What is “contract documentation”?', back: 'Pre-qualification, tender and contract documents **collectively** — all documents prepared by the design team.', src: 'IA sir TD slide 2' },
  { id: 'c-docs-ts-fixed', topic: T, front: 'How is tender security written in the TDS?', back: 'As a **rounded fixed Taka amount** — not as a % — at most **3% of the official estimate**, set slightly below the 2% or 3% figure so the estimate cannot be guessed (PPR r.22(3)–(4)). E.g. Tk 80 crore → Tk 1.55 crore.', src: 'PPR r.22, Sch II' },
  { id: 'c-docs-turnover', topic: T, front: 'What is “turnover” in a TDS and how is it set?', back: 'A year’s **total inflow** of the firm; the TDS asks an **average annual construction turnover** over the last 5 years of about **1.5 × the annual value** of the contract (cost ÷ duration in years), from audited statements.', src: 'Senior note Q21; standard practice' },
  { id: 'c-docs-liquid', topic: T, front: 'How is the liquid asset / credit facility requirement set?', back: 'About **10% of the total work** (class note) — roughly 3–4 months of cash flow on a 3-year job — as liquid assets or a credit line certified by a scheduled bank.', src: 'Senior note Q21; standard practice' },
  { id: 'c-docs-specific', topic: T, front: 'How is “specific experience” written in a TDS?', back: 'Both **physical** (similar type and size — e.g. a building of ≥ 75% of the storeys) and **financial** (one contract ≥ ~70% of the estimate, or two ≥ ~50% each) completed within the last 7 years, with completion certificates.', src: 'Senior note Q21; standard practice' },
  { id: 'c-docs-tech-fin-offer', topic: T, front: 'Technical offer vs financial offer of a tenderer?', back: '**Technical offer**: general and specific experience, key technical personnel, plant and equipment, turnover, liquid asset. **Financial offer**: the price at which the tenderer offers to do the work.', src: 'Senior note Q21; OneNote' },
  { id: 'c-docs-noa-def', topic: T, front: 'What is an NOA?', back: 'The **Notification of Award** — the official notice by the employer (procuring entity) telling the tenderer its tender has been accepted; it states price, performance security and signing dates and forms the contract.', src: 'Senior note Q5; PPR r.102' },
  { id: 'c-docs-ps-noa', topic: T, front: 'Performance security in the NOA — amount and deadline?', back: 'Typically **10%** of the contract price for works (e.g. Tk 3.5 crore on Tk 35 crore), within **14 days** of acceptance of the NOA (national). The question bank’s “28 days” is the international limit.', src: 'IA sir Assignment 02; PPR Sch II, Sch VII' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-tender-doc-elements',
    topic: T,
    q: 'List the essential elements of a tender document with a brief description of each.',
    seen: ['Jan 2021', '2015-16', '2011-12'],
    a: `Documents are prepared from the **CPTU standard documents** (PPR r.4(1)); only the TDS and PCC are adapted.
1. **Instructions to Tenderer (ITT)** — instructs tenderers about general rules and regulations; almost the same for all tenders; no details (says “deposit tender security” but not the amount); not a contract document.
2. **Tender Data Sheet (TDS)** — the particular data for the ITT: amount of **tender security** (say 2–3% of project cost), required **turnover**, experience, validity, dates.
3. **General Conditions of Contract (GCC)** — same for all tenders; general conditions only: definitions, arbitrators, JVCA, risk, compensation events, performance security.
4. **Particular Conditions of Contract (PCC)** — varies tender to tender; specific figures for the GCC (amount of compensation, performance security), key personnel, modifications.
5. **Tender Form** — the tender submission sheet and forms; varies tender to tender.
6. **Bill of Quantities (BoQ)** — all items of work with quantities; used to calculate the **contract price**; contractor paid at the quoted rates.
7. **General Specification** — general site requirements, health and safety, measures against environmental pollution, security.
8. **Particular Specification** — strength and properties of steel, strength of concrete, bricks, electrical items.
9. **The Drawings** — drawing work giving the detailing of the task.`,
    keys: ['CPTU standard documents', 'Instructions to Tenderer', 'Tender Data Sheet', 'tender security', 'turnover', 'General Conditions of Contract', 'Particular Conditions of Contract', 'Tender Form', 'Bill of Quantities', 'contract price', 'General Specification', 'Particular Specification', 'Drawings'],
    lists: ['l-tender-doc-elements'],
    src: 'IA sir Tender Document slides 4–9; PPR r.4',
  },
  {
    id: 'a-contract-priority',
    topic: T,
    q: 'List, in order of priority, the documents that form the contract.',
    seen: ['May 2024', '2020-21', 'Jan 2021', '2017-18', '2013-14', '2011-12'],
    a: `PPR 2008 **r.4(7)** — the documents forming the contract, in **order of precedence**:
1. The **signed Contract Agreement**
2. The **Notification of Award**
3. The **Tender and the appendices** to the Tender
4. **Particular Conditions of Contract**
5. **General Conditions of Contract**
6. **Technical specifications**
7. **General specifications**
8. **Drawings**
9. **Priced Bill of Quantities** (works) / price schedule and schedule of requirements (goods)
10. **Other documents**, including correspondence

If two documents conflict, the higher one governs — the more specific document (PCC, technical specification) overrides the general one.`,
    keys: ['r.4(7)', 'order of precedence', 'Contract Agreement', 'Notification of Award', 'Tender and the appendices', 'Particular Conditions', 'General Conditions', 'Technical specifications', 'General specifications', 'Drawings', 'Priced Bill of Quantities', 'correspondence'],
    lists: ['l-contract-priority'],
    src: 'PPR 2008 r.4(7)',
  },
  {
    id: 'a-tds-method',
    topic: T,
    q: 'How do you prepare a Tender Data Sheet (TDS) for a works tender? (general experience, specific experience, turnover, liquid asset, tender security …)',
    seen: ['2023-24', '2021-22', '2016-17', '2013-14', '2012-13', '2011-12'],
    a: `The **TDS** gives the particular data for the ITT clauses — “the ITT provides generalized information; the particular data is provided in the TDS”. Write it as a table **ITT clause | TDS entry**.

### Work out first
- **Annual value** = estimated cost ÷ duration in years; **monthly cash flow** = cost ÷ months.

### Items
1. **General experience** — at least 7 / 10 / 15 years in construction as prime contractor, scaled to size.
2. **Specific experience** — **physical** (similar type and size, e.g. building of ≥ 75% of the storeys) and **financial**: within the last 7 years, one contract ≥ about **70%** of the estimate, or two contracts ≥ **50%** each; completion certificates.
3. **Construction turnover** — average annual turnover over the last **5 years** ≥ **1.5 × annual value**, from audited statements (turnover = a year's total inflow).
4. **Liquid asset / credit facility** — about **10% of the total work** (≈ 3–4 months' cash flow on a 3-year job), certified by a scheduled bank.
5. **Tender security** — a **fixed amount**, never a %, at most **3%** of the official estimate, set slightly under 2% and rounded down (PPR r.22); bank guarantee / pay order; valid **28 days beyond tender validity**.
6. Others as asked: tender validity (60–120 days), **pre-tender meeting** (date, time, venue, site visit, minutes to all buyers), key personnel, equipment, JV allowed, deadlines.

Only the tender-security rule is in PPR; the experience and turnover multiples are standard-document practice (class note: liquid asset ≈ 10% of work; turnover = average annual inflow).`,
    keys: ['TDS', 'Annual value', 'General experience', 'Specific experience', 'physical', 'financial', '70%', 'Construction turnover', '1.5 × annual value', 'Liquid asset', '10% of the total work', 'Tender security', 'fixed amount', '3%', '28 days beyond tender validity', 'pre-tender meeting'],
    lists: ['l-tds-items'],
    src: 'IA sir TD slide 5; PPR r.22, Sch II; senior note Q19, Q21; multiples = standard practice',
  },
  {
    id: 'a-accompaniments',
    topic: T,
    q: 'List the tender accompaniments a tenderer has to submit with the tender.',
    seen: ['2012-13'],
    a: `1. **Tender submission sheet** (letter), every page signed, with **power of attorney** of the signatory.
2. **Tender security** (pay order / bank draft / bank guarantee) valid 28 days beyond tender validity.
3. **Priced BoQ** / price schedule with any discounts.
4. **Valid trade license**.
5. **VAT and income-tax (TIN)** certificates.
6. Statements of **general and specific experience** with **completion certificates**.
7. **Audited financial statements** — annual turnover.
8. **Bank certificate** of liquid asset / credit facility.
9. List and **CVs of key personnel**.
10. List of **plant and equipment** (owned or leased).
11. **JV agreement** (or notarised letter of intent), if a JV.
12. **Affidavit** of legal capacity and declaration of not being debarred.
13. Work plan, **method statement** and programme, and any other document asked in the TDS.`,
    keys: ['Tender submission sheet', 'power of attorney', 'Tender security', 'Priced BoQ', 'trade license', 'VAT', 'completion certificates', 'Audited financial statements', 'Bank certificate', 'key personnel', 'plant and equipment', 'JV agreement', 'method statement'],
    lists: ['l-accompaniments'],
    src: 'IA sir TD slides 11–12; PPR r.4(2)(d), 48–49, Sch XI',
  },
  {
    id: 'a-noa',
    topic: T,
    q: 'Prepare a standard Notification of Award (NOA).',
    seen: ['2016-17', '2013-14'],
    a: `### [Name of Procuring Entity, address]
**NOTIFICATION OF AWARD**

Contract No: …………  Date: …………

To: [Name and address of the Contractor]

This is to notify you that your **Tender dated** [date] for the execution of the Works for [name of project / contract] for the **Contract Price** of Tk [figures] ([words]) **as corrected and modified in accordance with the Instructions to Tenderers**, has been **approved by** [name of Procuring Entity].

You are thus requested to take following actions:
1. **Accept in writing** the Notification of Award **within seven (7) days** of its issuance.
2. **Furnish a Performance Security** in the specified format and in the amount of Tk [10% of contract price] **within fourteen (14) days** of issuance of this letter but not later than [date].
3. **Sign the Contract within twenty-eight (28) days** of issuance of this letter but not later than [date].

You may proceed with the execution of the Works only upon completion of the above tasks. You may also please note that this Notification of Award shall constitute the **formation of this Contract** which shall become binding upon you.

We attach the **draft Contract** and all other documents for your perusal and signature.

Signed …………
**Duly authorised to sign for and on behalf of** [Procuring Entity]
Date: …………

(Tender validity date is critical to the NOA.)`,
    keys: ['NOTIFICATION OF AWARD', 'Contract No', 'Tender dated', 'Contract Price', 'as corrected and modified', 'Accept in writing', 'within seven (7) days', 'Performance Security', 'within fourteen (14) days', 'twenty-eight (28) days', 'formation of this Contract', 'draft Contract', 'on behalf of'],
    lists: ['l-noa-actions'],
    src: 'PPR Sch VII; IA sir Assignment 02 (DNCC NOA)',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
