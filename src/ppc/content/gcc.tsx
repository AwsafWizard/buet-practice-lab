// pc-gcc — conditions of contract, GCC/PCC clause pairs, compensation events, FIDIC, Engineer, arbitration (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-gcc).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-gcc' as const

// ---------- figure ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const ia = 'var(--c-ia)'

const Q: FC<{ x: number; y: number; w: number; t: string[] }> = ({ x, y, w, t }) => (
  <g>
    <rect x={x} y={y} width={w} height={40} rx={4} fill={panel2} stroke={line} strokeWidth={1.3} />
    {t.map((s, i) => (
      <text key={i} x={x + w / 2} y={y + 24 - ((t.length - 1) * 13) / 2 + i * 13} textAnchor="middle" fontSize={11.5} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)
const Book: FC<{ y: number; t: string[] }> = ({ y, t }) => (
  <g>
    <rect x={418} y={y} width={176} height={40} rx={4} fill={panel2} stroke={ia} strokeWidth={2} />
    {t.map((s, i) => (
      <text key={i} x={506} y={y + 24 - ((t.length - 1) * 13) / 2 + i * 13} textAnchor="middle" fontSize={11.5} fill={ink} fontWeight={i === t.length - 1 ? 700 : 400}>
        {s}
      </text>
    ))}
  </g>
)
const A: FC<{ d: string; label?: string; lx?: number; ly?: number }> = ({ d, label, lx, ly }) => (
  <g>
    <path d={d} fill="none" stroke={mute} strokeWidth={1.4} markerEnd="url(#pc-fidic-arr)" />
    {label && (
      <text x={lx} y={ly} fontSize={11} fill={mute}>
        {label}
      </text>
    )}
  </g>
)

const FidicFig: FC = () => (
  <svg viewBox="0 0 600 330" width="100%" role="img" aria-label="FIDIC conditions selection criteria flow chart">
    <defs>
      <marker id="pc-fidic-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={mute} />
      </marker>
    </defs>
    <Q x={6} y={8} w={196} t={['Straight-forward', 'contract?']} />
    <A d="M202,28 H416" label="Yes" lx={214} ly={22} />
    <Book y={8} t={['Short Form of Contract', 'Green Book']} />
    <A d="M104,48 V66" label="No" lx={110} ly={62} />
    <Q x={6} y={68} w={196} t={['Designing in the', 'scope of Employer?']} />
    <A d="M202,88 H416" label="Yes" lx={214} ly={82} />
    <Book y={68} t={['Conditions for Construction', 'Red Book']} />
    <A d="M104,108 V126" label="No" lx={110} ly={122} />
    <Q x={6} y={128} w={196} t={['Contractor’s design: plant', 'and/or high unforeseen risk?']} />
    <A d="M202,148 H224" />
    <text x={203} y={142} fontSize={10} fill={mute}>
      Yes
    </text>
    <Q x={226} y={128} w={150} t={['Maintenance in', 'Contractor’s scope?']} />
    <A d="M376,148 H416" label="Yes" lx={384} ly={142} />
    <Book y={128} t={['Design, Build & Operate', 'Gold Book']} />
    <A d="M301,168 V200 H416" label="No" lx={307} ly={190} />
    <Book y={180} t={['Plant and Design-Build', 'Yellow Book']} />
    <A d="M104,168 V226" label="No" lx={110} ly={214} />
    <Q x={6} y={228} w={196} t={['Fixed-price lump sum, little', 'Employer involvement, low risk?']} />
    <A d="M202,248 H416" label="Yes" lx={214} ly={242} />
    <Book y={228} t={['EPC / Turnkey Projects', 'Silver Book']} />
    <A d="M104,268 V300 H416" label="No" lx={110} ly={292} />
    <Book y={280} t={['Employer’s Requirements —', 'Modified FIDIC / other']} />
  </svg>
)

// ---------- lists ----------
const lists: PcList[] = [
  {
    id: 'l-gcc-items',
    topic: T,
    title: 'Items covered by GCC clauses',
    ask: 'Name some items of GCC clauses.',
    points: [
      { k: 'Key definitions', alt: ['definitions'] },
      { k: 'Arbitrator', alt: ['arbitration'] },
      { k: 'Provisions for JVCA', alt: ['JVCA', 'joint venture'] },
      { k: 'Provision of price escalation', alt: ['price escalation', 'price adjustment'] },
      { k: 'Compensation events', alt: ['compensation'] },
      { k: 'Performance security', alt: ['security'] },
      { k: 'Required equipment', alt: ['equipment'] },
      { k: 'Required key personnel', alt: ['key personnel'] },
      { k: 'Performance bond', alt: ['bond'], d: 'The slide lists it separately from performance security.' },
      { k: 'Advance payment to contractor', alt: ['advance payment'] },
      { k: 'Multiple currencies', alt: ['currencies'] },
      { k: 'Sectional completion', alt: ['sectional'] },
      { k: 'Retention', alt: ['retention money'] },
      { k: 'Bonus for early completion', alt: ['bonus'] },
      { k: 'Delay (liquidated) damages', alt: ['liquidated damages', 'LD', 'delay damages'] },
      { k: 'Changes in the law', alt: ['change in law'] },
    ],
    hook: 'Who (definitions, arbitrator, JVCA, personnel, equipment) – Money (escalation, compensation, security, bond, advance, currencies, retention, bonus, damages) – Time (sectional completion) – Law (changes in law).',
    seen: ['2022-23', '2017-18', '2016-17', '2015-16', '2014-15', '2012-13'],
    src: 'IA sir GCC+TEC slides 2–3; Tender Document slide 6',
  },
  {
    id: 'l-comp-events',
    topic: T,
    title: 'Compensation events in a works contract',
    ask: 'List the events that are regarded as compensation events in a construction contract.',
    points: [
      { k: 'Site possession not given on time', alt: ['site possession'] },
      { k: 'Employer changes other contractors’ schedule', alt: ['other contractors'] },
      { k: 'Engineer orders a delay', alt: ['delay ordered'] },
      { k: 'Drawings or instructions issued late', alt: ['late drawings', 'late instructions'] },
      { k: 'Tests ordered show no defect', alt: ['uncover and test, no defect'] },
      { k: 'Subcontract approval unreasonably refused', alt: ['subcontract refused'] },
      { k: 'Ground conditions worse than assumed', alt: ['unforeseen ground', 'adverse ground conditions'] },
      { k: 'Utilities or authorities work late', alt: ['public authorities', 'utilities', 'other contractors public authorities utilities'] },
      { k: 'Advance payment paid late', alt: ['late advance payment'] },
      { k: 'Employer’s risks affect contractor', alt: ['employer risk'] },
      { k: 'Completion certificate unreasonably delayed', alt: ['completion certificate'] },
      { k: 'Unforeseeable conditions (PCC addition)', alt: ['conditions that could not reasonably have been foreseen', 'unforeseen conditions'], d: 'PCC: “Conditions that could not reasonably have been foreseen”.' },
    ],
    hook: 'Follow the job in time: Site → Schedule → Stop (delay) → Sheets (drawings) → Samples (tests) → Subcontract → Soil → Services (utilities) → Silver (advance) → Sovereign risk → Sign-off (certificate) → Surprise (unforeseeable, PCC).',
    seen: ['2016-17', '2014-15', '2011-12'],
    src: 'GCC 27.1 and PCC as in the 18-batch solve (Pallab 2014-15 Q3(b) = Nafee bhai note Ques-39); other events: standard GCC (question bank); PPR r.39(3),(26)',
    note: 'The 18-batch solve writes only the five GCC 27.1 events (site possession, ground conditions, others/utilities late, completion certificate delayed, tests with no defect) plus the PCC addition — for 3 marks write those.',
  },
  {
    id: 'l-fidic-books',
    topic: T,
    title: 'FIDIC selection chart — questions and books, in order',
    ask: 'Describe the selection criteria (flow chart) for FIDIC conditions of contract.',
    points: [
      { k: 'Straight-forward → Green Book', alt: ['short form of contract', 'green book'], d: 'Short Form of Contract.' },
      { k: 'Employer designs → Red Book', alt: ['conditions for construction', 'red book'], d: 'Conditions of contract for Construction.' },
      { k: 'Contractor design + maintenance → Gold Book', alt: ['design build operate', 'gold book'], d: 'Design, Build and Operate projects.' },
      { k: 'Contractor design, no maintenance → Yellow Book', alt: ['plant and design build', 'yellow book'], d: 'Plant and Design-Build.' },
      { k: 'Fixed-price lump sum, low risk → Silver Book', alt: ['EPC turnkey', 'silver book'], d: 'EPC / Turnkey projects.' },
      { k: 'Otherwise → modified FIDIC', alt: ['employer’s requirements', 'other conditions'], d: 'Employer’s requirements — modified FIDIC / other conditions.' },
    ],
    ordered: true,
    hook: 'Traffic of colours: Go Green (simple) → Red (employer draws) → Gold or Yellow (contractor draws; maintains? Gold) → Silver (lump-sum turnkey) → anything else is modified.',
    seen: ['2020-21'],
    src: 'IA sir “FIDIC Conditions Selection Criteria” chart',
  },
  {
    id: 'l-fidic-prefer',
    topic: T,
    title: 'Situations favouring FIDIC over the standard tender document',
    points: [
      { k: 'International competitive tendering', alt: ['ICT', 'international tender'], d: 'Conditions similar to international trade (PPA s.33(c)(vi)).' },
      { k: 'Development-partner financed projects', alt: ['donor funded', 'World Bank ADB'], d: 'The loan agreement prevails (s.3(2)(d)).' },
      { k: 'Contractor-design, plant, EPC/turnkey', alt: ['design build', 'turnkey'], d: 'Yellow, Gold, Silver Books.' },
      { k: 'Large, complex projects needing ADR', alt: ['international arbitration', 'complex projects'] },
      { k: 'Multiple currencies', alt: ['foreign currency'] },
    ],
    seen: ['2013-14'],
    src: 'PPA s.3(2)(d), 33; IA sir GCC+TEC slide 1; FIDIC chart (list built from these)',
  },
  {
    id: 'l-engineer-role',
    topic: T,
    title: 'Roles of the Engineer (Project Manager) in a contract',
    points: [
      { k: 'Supervising the work', alt: ['supervision'] },
      { k: 'Certifying payment', alt: ['certify payment'] },
      { k: 'Deciding extension of time, variations', alt: ['extension of time', 'variation'] },
      { k: 'Ensuring adherence to contract conditions', alt: ['contract administration'] },
      { k: 'Identifying risks; mitigation plans', alt: ['risk'] },
      { k: 'Maintaining client relationship', alt: ['client relationship'] },
      { k: 'Measurement, billing, certification', alt: ['measurement', 'billing'] },
      { k: 'Documenting claims and variations', alt: ['claims'] },
    ],
    seen: [],
    src: 'Senior note Q26; PPR r.2(40), 39',
  },
  {
    id: 'l-dispute-steps',
    topic: T,
    title: 'Settlement of disputes — in order',
    points: [
      { k: 'Amicable settlement', alt: ['negotiation', 'amicable'] },
      { k: 'Adjudication', alt: ['adjudicator', 'engineer decision'] },
      { k: 'Arbitration', alt: ['arbitrator'] },
    ],
    ordered: true,
    seen: ['2017-18', '2016-17', '2014-15', '2011-12'],
    src: 'PPR r.42(4) (“chronologically … amicable solutions, adjudications and arbitration”)',
  },
  {
    id: 'l-timely-completion',
    topic: T,
    title: 'GCC/PCC clauses for timely completion',
    points: [
      { k: 'Start date and intended completion date', alt: ['completion date', 'start date'] },
      { k: 'Programme and updates', alt: ['work programme'] },
      { k: 'Early warning', alt: ['warning'] },
      { k: 'Extension of intended completion date', alt: ['extension of time', 'EOT'] },
      { k: 'Delays ordered / acceleration', alt: ['acceleration'] },
      { k: 'Liquidated damages', alt: ['LD', 'delay damages'] },
      { k: 'Bonus for early completion', alt: ['bonus'] },
      { k: 'Completion certificate and taking over', alt: ['taking over'] },
      { k: 'Termination for excessive delay', alt: ['termination', 'fundamental breach'] },
    ],
    seen: ['2022-23', '2016-17', '2015-16'],
    src: 'PPR r.2(30), 39(1)–(4),(27)–(33), 42; IA sir GCC+TEC slide 3 (bonus, delay damages, sectional completion)',
  },
]

// ---------- cards ----------
const cards: PcCard[] = [
  { id: 'c-gcc-coc', topic: T, front: 'What do the conditions of contract define?', back: 'The conditions under which the Contractor executes the Contract, **including the rights, responsibilities and relationships of the parties**. Standard conditions exist; **FIDIC** conditions are commonly used.', src: 'IA sir GCC+TEC slide 1' },
  { id: 'c-gcc-gen-part', topic: T, front: 'General vs Particular conditions of contract?', back: '**General**: core clauses generally applicable to most projects, kept unchanged for all tenders. **Particular** (special/supplementary): written to expand on the GCC for a particular project — the figures (compensation, performance security), key personnel, modifications.', src: 'IA sir GCC+TEC slides 2–3' },
  { id: 'c-gcc-pcc-wins', topic: T, front: 'GCC and PCC conflict — which wins?', back: 'The **PCC** — it is 4th and the GCC 5th in the order of precedence (PPR r.4(7)). Only the TDS and PCC may be adjusted for a specific job (r.4(12)).', src: 'PPR r.4(7),(12)' },
  { id: 'c-gcc-ld', topic: T, front: 'Liquidated damages — the rule?', back: 'Contractor pays LD at the **rate per day/week** in the contract for each day beyond the Intended Completion Date, up to the **maximum** in the contract; deducted from payments; **does not relieve** the contractor of obligations (class PCC: 0.5% per week, max 10%).', src: 'PPR r.38(14), 39(27)–(28)', seen: ['2022-23', '2016-17', '2014-15'] },
  { id: 'c-gcc-eot', topic: T, front: 'Extension of the Intended Completion Date — when and limits?', back: 'When a **compensation event** or **variation** makes completion on time impossible without extra cost. Decision within **21 days**; up to **20%** of original time, above that HOPE approval.', src: 'PPR r.39(3)–(4), Sch II' },
  { id: 'c-gcc-retention', topic: T, front: 'Retention money — deduction and release?', back: 'A % (Sch II) deducted from each bill until completion; **half repaid at completion**, the rest after the Defects Correction Certificate (within 28 days) or earlier against a bank guarantee. Not needed if no advance and PS = 10%; retention + PS ≤ 10% without advance.', src: 'PPR r.28, Sch II' },
  { id: 'c-gcc-ps', topic: T, front: 'Performance security — amounts and validity?', back: 'Works 10% (with advance) or 5–10% (without); goods 10%; divisible commodities 5%; up to 20% for front loading. Valid **28 days beyond the intended completion date**; if no retention, replaced by 50% security for the defects liability period.', src: 'PPR r.27, Sch II' },
  { id: 'c-gcc-advance', topic: T, front: 'Advance payment — conditions?', back: 'Against a **bank guarantee**; used only for equipment, plant, materials and mobilisation; recovered proportionately from payments by % of work done; guarantee reduced progressively; **no interest**.', src: 'PPR r.39(9)–(12)' },
  { id: 'c-gcc-payment', topic: T, front: 'Payment clause — how does it work?', back: 'Monthly statement of work done less amounts certified → Engineer checks and **certifies** → PE pays within **28 days** of the certificate; value = items done × BoQ rates + variations + compensation events; final payment certified within 56 days.', src: 'PPR r.39(13)–(22), Sch II' },
  { id: 'c-gcc-variation', topic: T, front: 'Variation — limit and rule?', back: 'Engineer may order increases/decreases or new items **within the general scope**; contractor gives notice within 7 days; no work before approval; cumulative variation ≤ **15%** of original price, beyond → next higher authority or new contract.', src: 'PPR r.74(4), 78–80, Sch II' },
  { id: 'c-gcc-defs', topic: T, front: 'Define Engineer (Project Manager) and Day as in the contract.', back: '**Engineer/PM**: person named in the contract or appointed by the PE and notified to the contractor, responsible for **supervising the works and administering the contract**. **Day**: **calendar day** unless working day is stated.', src: 'PPR r.2(14), 2(40)' },
  { id: 'c-gcc-price-adj', topic: T, front: 'When is price adjustment allowed?', back: 'For contracts of **more than 18 months**, by the formula and indices in the tender document (labour, material, equipment, fuel); not usually for simple contracts within 18 months unless HOPE approves.', src: 'PPR r.5(3)–(5), 38(10)' },
  { id: 'c-gcc-dlp', topic: T, front: 'Defects liability period?', back: 'Period named in the contract, **counted from the completion date**; Engineer notifies defects before it ends; extended while defects remain; uncorrected defects are corrected at the contractor’s cost; ends with the Defects Correction Certificate.', src: 'PPR r.2(18), 39(5)–(8),(29)' },
  { id: 'c-gcc-arb-def', topic: T, front: 'Define arbitration (with an example).', back: 'A procedure in which a dispute is submitted **by agreement of the parties** to one or more arbitrators who make a **binding decision**. E.g. employer and contractor disagree on the value of a variation; the adjudicator’s ruling is rejected; an arbitrator decides and both are bound. Arbitrator ≠ Project Manager.', src: 'Senior note Q13; IA sir TD slide 2; Nafee bhai note Ques-37 (example: two people divorcing who let a third party decide)', seen: ['2011-12'] },
  { id: 'c-gcc-fidic-books', topic: T, front: 'Who designs and who supervises under the Red, Gold, Yellow and Silver Books?', back: '**Red**: the consultant supervises the contractor’s work. **Gold**: the contractor designs and looks after it himself. **Yellow**: the contractor designs, someone else supervises. **Silver**: EPC (Engineering Procurement Construction) — the employer only checks the work is done properly.', src: 'Nafee bhai note Ques-38 (Bangla table)', seen: ['2020-21'] },
  { id: 'c-gcc-insurance', topic: T, front: 'Insurance for works — what does the GCC require?', back: 'The Contractor provides insurance in the **joint names** of the Procuring Entity and the Contractor from the Start Date to the end of the Defects Liability Period, in the amounts in the PCC, for loss of or damage to the **Works, Plant and Materials**; **Equipment**; other property connected with the Contract; and **personal injury or death**. Policies go to the Project Manager before the Start Date.', src: 'Typed note PYQ-33 (current batch, low authority; standard GCC)' },
  { id: 'c-gcc-fm', topic: T, front: 'What is force majeure?', back: 'An event beyond the contractor’s control, not foreseeable, unavoidable and not due to its negligence — war, revolution, fire, flood, epidemic, quarantine, embargo, acts of Government; a ground for termination.', src: 'PPR r.2(24), 42(2)' },
]

const ROWS = `| Terminology | GCC Clause | PCC Clause |
|---|---|---|`

// ---------- answers ----------
const answers: PcAnswer[] = [
  {
    id: 'a-gcc-pcc-relation',
    topic: T,
    q: 'State the relationship between GCC and PCC.',
    seen: ['2022-23', '2017-18', '2016-17', '2014-15', '2012-13'],
    a: `**Condition of Contract** define the conditions under which the Contractor executes the Contract including the **rights, responsibilities and relationships** of the parties involved. It consists of General Conditions and Particular Conditions.

### Relation between GCC and PCC
In GCC section general conditions are written only, not specific conditions relating to the project. General Conditions are **core clauses that are generally applicable to most projects**. So, this section is **kept unchanged for all tender**. Whereas Particular Conditions (or **Special Conditions or Supplementary Conditions**) are **optional clauses required for a particular project** or particular circumstances. So, PCC section is specifically written to **expand on GCC** to suit particular project/situation. The **project specific information** relevant to GCC are given here; say the amount of compensation, the performance security, list and qualification of key personnel etc. written here. Any **modification** to relevant GCC clauses is also specified here.

### How they work together
- Read **clause by clause** with the same numbering: the GCC states the rule, the PCC fills in the data (GCC: liquidated damages at the rate in the PCC; PCC: 0.5% per week, maximum 10%).
- In a conflict the **PCC prevails** (4th vs 5th in the order of precedence, PPR r.4(7)).
- The PE may adapt only the TDS and the PCC, never contradicting the Act/Rules (r.4(12)).`,
    keys: ['Condition of Contract', 'rights, responsibilities and relationships', 'core clauses that are generally applicable to most projects', 'kept unchanged for all tender', 'Special Conditions or Supplementary Conditions', 'optional clauses required for a particular project', 'expand on GCC', 'project specific information', 'modification', 'clause by clause', 'PCC prevails', 'r.4(7)'],
    lists: ['l-gcc-items'],
    src: 'IA sir GCC+TEC slides 1–3 (word for word; the 18-batch solve, Pallab and Nafee bhai’s note write the same paragraph); PPR r.4(7),(12)',
  },
  {
    id: 'a-gcc-clauses',
    topic: T,
    q: 'Prepare corresponding GCC and PCC clauses for: definitions, completion time, liquidated damages, compensation events, retention, performance security, advance payment, variation, payment, price adjustment, arbitration.',
    seen: ['2022-23', '2017-18', '2016-17', '2014-15', '2012-13'],
    a: `State the relation first (General Conditions are kept unchanged for all tender; the PCC expands on GCC with the project data), then the table.

${ROWS}
| **Employer** | 1.1(a) The person or body that commissions the construction. | The Employer is Name: Dalia Builders Ltd. Address: 39/1, Kolabagan, Dhanmondi, Dhaka |
| **Contractor** | 1.1(c) The person/firm under contract with the Procuring Entity for the execution of works under the Rules and the Act as stated in the PCC. | The Contractor is Name: Sapphire Construction Ltd. Address: 28/3, Green Road, Banani, Dhaka |
| **The Engineer** | 1.1(f) A construction engineer who is tasked with the oversight and management of a large-scale, complex construction project. | The Engineer-in-charge is Naim Sheikh, Project Director, Dalia Builders Ltd. |
| **Day** | Day means calendar days unless otherwise specified as working days. | — (no PCC entry) |
| **Completion time** | The Contractor shall commence the Works on the Start Date and complete the whole of the Works by the **Intended Completion Date**; only the Project Manager can extend it, if a compensation event occurs or a variation is issued. | The Start Date shall be [date]. The Intended Completion Date for the whole of the Works shall be [date] (e.g. 730 days from the Start Date). |
| **Liquidated damages** | The Contractor pays liquidated damages at the rate in the PCC for each week of delay beyond the Intended Completion Date, up to the maximum in the PCC; deducted from payments; payment does not relieve the Contractor of its obligations. | The applicable rate for liquidated damages for delay shall be **0.5 percent of the Contract Price for each week of delay**. The maximum amount of liquidated damages shall be Ten (10%) percent of the Contract Price. |
| **Compensation events** | 27.1 The following shall be Compensation Events: the Procuring Entity does not give access to or possession of the Site by the Site Possession Date; ground conditions are substantially more adverse than could reasonably have been assumed; other Contractors, public authorities, utilities or the Procuring Entity do not work within the dates; the Project Manager unreasonably delays issuing a Completion Certificate; the Project Manager instructs uncovering or additional tests and no Defects are found. | The following additional events shall also be the Compensation Events: Conditions that could not reasonably have been foreseen. |
| **Retention money** | 29. The Procuring Entity shall **retain** from each progressive payment due to the Contractor at the percentage specified in the PCC until completion of the whole of the Works. On completion of the whole of the Works the **first half** of the total amount retained shall be repaid to the Contractor and the remaining second half after the Defects Liability Period has passed. | The amount of Retention Money to hold in each progress claim is **10% of the work done and up to 5% of the contract sum**. |
| **Performance security** | 30.1 The Performance Security furnished at the time of signing of the Contract Agreement shall be substituted by a new Security covering **fifty (50) percent** of it to cover the Defects Liability Period. 30.2 The Procuring Entity may claim against the security if the Contractor is in breach of the Contract, or has not paid an amount due, and has been duly notified, for fourteen (14) days or more. 30.3 It may call the full amount if the compensation due equals or exceeds it. 30.4 Otherwise it is discharged and returned not later than twenty-eight (28) days after the Defects Liability Period has passed. | The Performance Security shall be in the form of Bank draft or irrevocable Bank Guarantee (Rule 27(4) of the Public Procurement Rules, 2008). The amount of Performance Security shall be 10 (Ten) percent of the Contract Price. |
| **Advance payment** | 27.1 The Contract Price, including any Advance Payments, if applicable, shall be paid in the manner as specified in the PCC. | Advance payment shall be made only after prior approval of the Project Manager, and shall not exceed fifteen percent (15%) of the Contract amount, against a bank guarantee. |
| **Variation** | 23.1 The Project Manager may issue a **Variation Order** to cover any increase or decrease in quantities, including the introduction of new work items, due to change of plans, design or alignment to suit actual field conditions, within the general scope and physical boundaries of the contract. 23.3 No work under a Variation Order before it is approved by the Approving Authority. | No variation of this Agreement shall be valid unless it is in writing and signed by or on behalf of each of the parties. |
| **Payment** | The Contractor submits monthly statements of the value of work done; the Project Manager **certifies** them within 28 days; the Procuring Entity pays within the period in the PCC; delayed payment attracts interest. | Payment shall be made within 28 days of certification; currency of payment: Bangladesh Taka. |
| **Price adjustment** | The Contract Price shall be adjusted for rise or fall in the cost of inputs (labour, materials, fuel) only if provided for in the PCC, using the formula stated there. | Price adjustment is applicable (contract longer than 18 months); coefficients and base indices are stated. |
| **Arbitration** | 38. If the parties are unable to reach a settlement within twenty-eight (28) days of the first written correspondence on the matter of disagreement, either party may give notice to the other of its intention to commence arbitration. The arbitration shall be conducted in accordance with the **Arbitration Act (Act No 1 of 2001)** of Bangladesh and in the place shown in the PCC. | The arbitration shall be conducted in the place mentioned below — Address: [Dhaka address]. |
| **Settlement of disputes** | 42.1 Amicable settlement. 42.2 The dispute is referred to the **Adjudicator** within fourteen (14) days; the Adjudicator gives a decision in writing within twenty-eight (28) days. 42.3 Either party may refer the decision to arbitration within twenty-eight (28) days, under the Arbitration Act 2001. | The Adjudicator is Mr. Mahmud Hossain, Judge, District Court, Dhaka. |

Clause numbers are the ones in the 18-batch solve; they differ between editions of the Standard Tender Document, so write the clause text if unsure of a number. PPR limits: performance security 5–10%, cumulative variation 15%.`,
    keys: ['Terminology', 'GCC Clause', 'PCC Clause', 'Employer', 'Contractor', 'Engineer', 'Day', 'Intended Completion Date', 'Liquidated damages', 'each week of delay', 'Compensation Events', 'retain', 'first half', '10% of the work done', 'Performance Security', 'fifty (50) percent', 'Advance payment', 'Variation Order', 'certifies', 'Price adjustment', 'Arbitration Act', 'Adjudicator'],
    lists: ['l-gcc-items', 'l-dispute-steps'],
    src: '18-batch solve (Pallab 2014-15 Q3(b), 2017-18 Q4(b), 2015-16 Q2(c)) = Nafee bhai note Ques-39 (“Read the clauses from the GCC & PCC pdf”); payment, price adjustment, completion time and Day rows: typed note PYQ-32 [current batch]; PPR r.27, 28, 39, 42, Sch II',
  },
  {
    id: 'a-gcc-timely',
    topic: T,
    q: 'Describe the GCC and PCC clauses pertaining to timely completion of a contract.',
    seen: ['2015-16'],
    a: `${ROWS}
| **Start and intended completion date** | Contractor starts on the Start Date and completes by the **Intended Completion Date**, revised only by the Engineer through an extension or acceleration order. | Intended Completion Date: 18 months from the Start Date. |
| **Programme** | Contractor submits a **programme** (methods, order, timing) for approval and updates it with a cash-flow forecast; payment may be withheld until it is given. | Within 14 days of NOA; update every 30 days. |
| **Early warning** | Contractor warns the Engineer of events likely to delay completion. | — |
| **Extension of time** | The Contractor notifies the Project Manager in writing of any condition impeding timely completion and requests extension before the original date lapses; within **twenty-one (21) days** the Intended Completion Date may be **extended** for a compensation event or variation; up to **twenty percent (20%)** of the original contract time, above that with the approval of HOPE. | — |
| **Acceleration / delays ordered** | Engineer may order a delay or ask for proposals to accelerate. | — |
| **Liquidated damages** | **Liquidated damages** for each week of delay beyond the Intended Completion Date at the PCC rate, up to the maximum; payment does not relieve obligations. | 0.5 percent of the Contract Price for each week of delay; maximum Ten (10%) percent. |
| **Bonus** | **Bonus for early completion** per day, if the PCC provides. | No credit will be given for earlier completion (or a bonus rate per day, if the PCC provides one). |
| **Completion and taking over** | Engineer issues the **completion certificate**; PE takes over the site and works. | Take over within 7 days. |
| **Termination** | Delay beyond the maximum-LD period is a fundamental breach — **termination**. | — |`,
    keys: ['Intended Completion Date', 'programme', 'Early warning', 'extended', 'compensation event', 'Liquidated damages', 'Bonus for early completion', 'completion certificate', 'termination', 'twenty-one (21) days', 'twenty percent (20%)', 'No credit will be given for earlier completion'],
    lists: ['l-timely-completion'],
    src: 'Pallab’s 18-batch solve 2015-16 Q2(c) (GCC 32.1–32.4, PCC (a)–(c)); PPR r.2(30), 39(1)–(4),(27)–(33), 42, Sch II; IA sir GCC+TEC slide 3',
  },
  {
    id: 'a-ld-apply',
    topic: T,
    q: 'What contract provision will apply if the Contractor delays the work without a reasonable ground? Explain how this provision is applied.',
    seen: [],
    a: `The **Liquidated Damages** clause of the GCC applies when the Contractor fails to complete by the **Intended Completion Date** and the delay is not due to a compensation event or another ground for extension.
1. The Contractor pays liquidated damages at the rate in the PCC (e.g. **0.5% of the Contract Price per week** of delay) for each week the actual completion is later than the Intended Completion Date.
2. The total shall not exceed the **maximum** in the PCC (e.g. 10% of the Contract Price).
3. The Procuring Entity may **deduct** it from payments due (or recover it from the performance security); no proof of actual loss is needed — the damages are **pre-estimated**.
4. Payment of liquidated damages **does not relieve** the Contractor of its obligation to complete the Works.
5. If the Intended Completion Date is later extended, the overpaid damages are **refunded**.
6. When the maximum is reached, the Procuring Entity may treat it as a fundamental breach and **terminate** the contract.

Example: Contract Price Tk 80 crore, 8 weeks late → 0.5% × 8 = 4% = Tk 3.2 crore deducted; 20 weeks or more reaches the 10% cap (Tk 8 crore).`,
    keys: ['Liquidated Damages', 'Intended Completion Date', '0.5% of the Contract Price per week', 'maximum', 'deduct', 'pre-estimated', 'does not relieve', 'refunded', 'terminate'],
    lists: ['l-timely-completion'],
    src: '2018-19 Q2(b) (typed note PYQ-32, answer by a current-batch student — low authority); LD rate from the 18-batch PCC; PPR r.38(14), 39(27)–(28)',
  },
  {
    id: 'a-comp-events',
    topic: T,
    q: 'List the events that are regarded as compensation events in a construction contract.',
    seen: ['2016-17', '2014-15', '2011-12'],
    a: `**Compensation events** are events for which the Contractor is entitled to **extra time and/or money**; the Project Manager assesses them and the Contract Price and/or the Intended Completion Date are adjusted (PPR r.39(3),(26)).

### GCC 27.1 — The following shall be Compensation Events
1. The Procuring Entity does not give access to or **possession of the Site** or part of the Site by the Site Possession Date.
2. **Ground conditions** are substantially more adverse than could reasonably have been assumed before issuance of the Notification of Award.
3. Other Contractors, public authorities, **utilities**, or the Procuring Entity do not work within the dates and other constraints stated in the Contract, and they cause delay or extra cost to the Contractor.
4. The Project Manager unreasonably delays issuing a **Completion Certificate**.
5. The Project Manager instructs the Contractor to uncover or to carry out additional **tests** upon work, which is then found to have no Defects.
6. Other Compensation Events described in the Contract or determined by the Project Manager in the PCC shall apply.

### PCC
The following additional events shall also be the Compensation Events: **Conditions that could not reasonably have been foreseen**.

### Other events in the standard GCC (if more are asked)
The Project Manager **orders a delay**; **drawings**, specifications or instructions issued late; approval of a **subcontract** unreasonably refused; **advance payment** paid late; the **employer's risks** affect the Contractor; the employer changes other contractors' schedule.`,
    keys: ['Compensation events', 'extra time', 'possession of the Site', 'Ground conditions', 'utilities', 'Completion Certificate', 'tests', 'Conditions that could not reasonably have been foreseen', 'orders a delay', 'drawings', 'subcontract', 'advance payment', "employer's risks"],
    lists: ['l-comp-events'],
    src: 'GCC 27.1 and PCC as in the 18-batch solve (Pallab 2014-15 Q3(b) = Nafee bhai note Ques-39); other events: standard GCC (question bank); PPR r.39(3),(26)',
  },
  {
    id: 'a-fidic-select',
    topic: T,
    q: 'Describe the selection criteria (using a flow-chart) for various FIDIC conditions of contract.',
    seen: ['2020-21'],
    a: `### FIDIC Conditions Selection Criteria (ask in this order)
1. **Straight-forward contract?** Yes → **Short Form of Contract (Green Book)**.
2. No → **Designing in the scope of the Employer?** Yes → **Conditions of Contract for Construction (Red Book)** — employer designs, contractor builds, measured by BoQ.
3. No → **Contractor's design, plant and/or high unforeseen risks?** Yes → **Maintenance in contractor's scope?**
   Yes → **Design, Build and Operate Projects (Gold Book)**; No → **Plant and Design-Build (Yellow Book)**.
4. No → **Fixed-price lump sum, little employer involvement and low unforeseen risks?** Yes → **EPC / Turnkey Projects (Silver Book)**.
5. No → **Employer's requirements — modified FIDIC / other conditions**.

### What the books mean
- **Red Book** — the consultant supervises the contractor's work (the employer designs).
- **Gold Book** — the contractor designs and also looks after the work himself.
- **Yellow Book** — the contractor designs, someone else supervises.
- **Silver Book** — **EPC = Engineering Procurement Construction**: the employer only checks that the work is done properly.

FIDIC = Federation of Consulting Engineers (slide; the 18-batch solve writes "The International Federation of Consulting Engineers"); its conditions of contract are commonly used.`,
    keys: ['Straight-forward', 'Green Book', 'Designing in the scope of the Employer', 'Red Book', "Contractor's design", 'Maintenance', 'Gold Book', 'Yellow Book', 'Fixed-price lump sum', 'Silver Book', 'modified FIDIC', 'Engineering Procurement Construction'],
    lists: ['l-fidic-books'],
    src: 'IA sir “FIDIC Conditions Selection Criteria” chart; GCC+TEC slide 1; Nafee bhai note Ques-38 (meaning of each book); 18-batch TF solve p.21',
    Fig: FidicFig,
  },
  {
    id: 'a-fidic-prefer',
    topic: T,
    q: 'State the situations where FIDIC conditions may be preferred over the conditions of contract in the Standard Tender Document.',
    seen: ['2013-14'],
    a: `1. **International competitive tendering** — PPA s.33 requires general and particular conditions “similar to those used in international trade”; foreign contractors know FIDIC.
2. **Development-partner financed projects** (World Bank, ADB, JICA) — the loan/grant agreement prevails over PPA (s.3(2)(d)) and usually prescribes FIDIC-based conditions.
3. **Contractor-designed works** — plant and design-build (**Yellow Book**), design-build-operate (**Gold Book**), **EPC/turnkey** (**Silver Book**); the national STD is written for employer-designed works.
4. **Large, complex contracts** needing detailed claims procedures, dispute boards and **international arbitration**.
5. **Multiple currencies** and foreign-currency payments.`,
    keys: ['International competitive tendering', 'Development-partner', 'Yellow Book', 'Gold Book', 'EPC/turnkey', 'Silver Book', 'international arbitration', 'Multiple currencies'],
    lists: ['l-fidic-prefer'],
    src: 'PPA s.3(2)(d), 33; FIDIC chart; GCC+TEC slide 1',
  },
  {
    id: 'a-arbitration',
    topic: T,
    q: 'Write a short note on arbitration.',
    seen: ['2011-12'],
    a: `**Arbitration** is a procedure in which a dispute is submitted, **by agreement of the parties**, to one or more **arbitrators** who make a **binding decision** on the dispute. Arbitration is a process of resolving dispute between the parties with the help of **designated arbitrators**.
1. The **arbitrator** is the person to whom employer and contractor refer their disputes and are bound by the decision; he **cannot be the Project Manager**.
2. It is the **last step**: disputes are settled **amicably**, then by the **adjudicator** (rulings, preferably not the PM), then arbitration (PPR r.42(4)).
3. **GCC 38**: if the parties are unable to reach a settlement within **twenty-eight (28) days** of the first written correspondence, either party may give notice of its intention to commence arbitration; it is conducted under the **Arbitration Act (Act No 1 of 2001)** of Bangladesh at the place shown in the PCC (the PCC gives the venue address).
4. In international contracts, **international arbitration** gives the final resolution (PPA s.33(c)(ix)).
5. Advantages: quicker and less expensive than court; decided by technical experts; private and confidential; flexible procedure; award final, binding and enforceable.

Example: employer and contractor disagree on the rate for a variation; the adjudicator's ruling is not accepted, so they refer it to an arbitrator, whose award both must follow.`,
    keys: ['Arbitration', 'by agreement of the parties', 'arbitrators', 'binding decision', 'cannot be the Project Manager', 'amicably', 'adjudicator', 'international arbitration', 'designated arbitrators', 'Arbitration Act'],
    lists: ['l-dispute-steps'],
    src: 'Nafee bhai note Ques-37 (both definitions); GCC 38 as in the 18-batch solve; IA sir TD slide 2; PPR r.42(4); PPA s.33; advantages: typed note PYQ-30 [current batch]',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
