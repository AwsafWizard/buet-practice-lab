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
      { k: 'Price escalation', alt: ['price adjustment'] },
      { k: 'Compensation events', alt: ['compensation'] },
      { k: 'Performance security', alt: ['performance bond'] },
      { k: 'Required equipment', alt: ['equipment'] },
      { k: 'Required key personnel', alt: ['key personnel'] },
      { k: 'Advance payment to contractor', alt: ['advance payment'] },
      { k: 'Multiple currencies', alt: ['currencies'] },
      { k: 'Sectional completion', alt: ['sectional'] },
      { k: 'Retention', alt: ['retention money'] },
      { k: 'Bonus for early completion', alt: ['bonus'] },
      { k: 'Delay (liquidated) damages', alt: ['liquidated damages', 'LD', 'delay damages'] },
      { k: 'Changes in the law', alt: ['change in law'] },
    ],
    hook: 'Who (definitions, arbitrator, JVCA, personnel, equipment) – Money (escalation, compensation, security, advance, currencies, retention, bonus, damages) – Time (sectional completion) – Law (changes in law).',
    seen: ['May 2024', '2017-18', '2016-17', '2015-16', '2014-15', '2012-13'],
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
      { k: 'Utilities or authorities work late', alt: ['public authorities', 'utilities'] },
      { k: 'Advance payment paid late', alt: ['late advance payment'] },
      { k: 'Employer’s risks affect contractor', alt: ['employer risk'] },
      { k: 'Completion certificate unreasonably delayed', alt: ['completion certificate'] },
    ],
    hook: 'Follow the job in time: Site → Schedule → Stop (delay) → Sheets (drawings) → Samples (tests) → Subcontract → Soil → Services (utilities) → Silver (advance) → Sovereign risk → Sign-off (certificate).',
    seen: ['2016-17', '2014-15', '2011-12'],
    src: 'Standard GCC list (question bank); PPR r.39(3),(19),(26) say CEs follow GCC/PCC — not listed in IA sir’s files',
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
    seen: ['2017-18', '2016-17', '2014-15'],
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
    seen: ['May 2024', '2016-17', '2015-16'],
    src: 'PPR r.2(30), 39(1)–(4),(27)–(33), 42; IA sir GCC+TEC slide 3 (bonus, delay damages, sectional completion)',
  },
]

// ---------- cards ----------
const cards: PcCard[] = [
  { id: 'c-gcc-coc', topic: T, front: 'What do the conditions of contract define?', back: 'The conditions under which the Contractor executes the Contract, **including the rights, responsibilities and relationships of the parties**. Standard conditions exist; **FIDIC** conditions are commonly used.', src: 'IA sir GCC+TEC slide 1' },
  { id: 'c-gcc-gen-part', topic: T, front: 'General vs Particular conditions of contract?', back: '**General**: core clauses generally applicable to most projects, kept unchanged for all tenders. **Particular** (special/supplementary): written to expand on the GCC for a particular project — the figures (compensation, performance security), key personnel, modifications.', src: 'IA sir GCC+TEC slides 2–3' },
  { id: 'c-gcc-pcc-wins', topic: T, front: 'GCC and PCC conflict — which wins?', back: 'The **PCC** — it is 4th and the GCC 5th in the order of precedence (PPR r.4(7)). Only the TDS and PCC may be adjusted for a specific job (r.4(12)).', src: 'PPR r.4(7),(12)' },
  { id: 'c-gcc-ld', topic: T, front: 'Liquidated damages — the rule?', back: 'Contractor pays LD at the **rate per day/week** in the contract for each day beyond the Intended Completion Date, up to the **maximum** in the contract; deducted from payments; **does not relieve** the contractor of obligations.', src: 'PPR r.38(14), 39(27)–(28)' },
  { id: 'c-gcc-eot', topic: T, front: 'Extension of the Intended Completion Date — when and limits?', back: 'When a **compensation event** or **variation** makes completion on time impossible without extra cost. Decision within **21 days**; up to **20%** of original time, above that HOPE approval.', src: 'PPR r.39(3)–(4), Sch II' },
  { id: 'c-gcc-retention', topic: T, front: 'Retention money — deduction and release?', back: 'A % (Sch II) deducted from each bill until completion; **half repaid at completion**, the rest after the Defects Correction Certificate (within 28 days) or earlier against a bank guarantee. Not needed if no advance and PS = 10%; retention + PS ≤ 10% without advance.', src: 'PPR r.28, Sch II' },
  { id: 'c-gcc-ps', topic: T, front: 'Performance security — amounts and validity?', back: 'Works 10% (with advance) or 5–10% (without); goods 10%; divisible commodities 5%; up to 20% for front loading. Valid **28 days beyond the intended completion date**; if no retention, replaced by 50% security for the defects liability period.', src: 'PPR r.27, Sch II' },
  { id: 'c-gcc-advance', topic: T, front: 'Advance payment — conditions?', back: 'Against a **bank guarantee**; used only for equipment, plant, materials and mobilisation; recovered proportionately from payments by % of work done; guarantee reduced progressively; **no interest**.', src: 'PPR r.39(9)–(12)' },
  { id: 'c-gcc-payment', topic: T, front: 'Payment clause — how does it work?', back: 'Monthly statement of work done less amounts certified → Engineer checks and **certifies** → PE pays within **28 days** of the certificate; value = items done × BoQ rates + variations + compensation events; final payment certified within 56 days.', src: 'PPR r.39(13)–(22), Sch II' },
  { id: 'c-gcc-variation', topic: T, front: 'Variation — limit and rule?', back: 'Engineer may order increases/decreases or new items **within the general scope**; contractor gives notice within 7 days; no work before approval; cumulative variation ≤ **15%** of original price, beyond → next higher authority or new contract.', src: 'PPR r.74(4), 78–80, Sch II' },
  { id: 'c-gcc-defs', topic: T, front: 'Define Engineer (Project Manager) and Day as in the contract.', back: '**Engineer/PM**: person named in the contract or appointed by the PE and notified to the contractor, responsible for **supervising the works and administering the contract**. **Day**: **calendar day** unless working day is stated.', src: 'PPR r.2(14), 2(40)' },
  { id: 'c-gcc-price-adj', topic: T, front: 'When is price adjustment allowed?', back: 'For contracts of **more than 18 months**, by the formula and indices in the tender document (labour, material, equipment, fuel); not usually for simple contracts within 18 months unless HOPE approves.', src: 'PPR r.5(3)–(5), 38(10)' },
  { id: 'c-gcc-dlp', topic: T, front: 'Defects liability period?', back: 'Period named in the contract, **counted from the completion date**; Engineer notifies defects before it ends; extended while defects remain; uncorrected defects are corrected at the contractor’s cost; ends with the Defects Correction Certificate.', src: 'PPR r.2(18), 39(5)–(8),(29)' },
  { id: 'c-gcc-arb-def', topic: T, front: 'Define arbitration (with an example).', back: 'A procedure in which a dispute is submitted **by agreement of the parties** to one or more arbitrators who make a **binding decision**. E.g. employer and contractor disagree on the value of a variation; the adjudicator’s ruling is rejected; an arbitrator decides and both are bound. Arbitrator ≠ Project Manager.', src: 'Senior note Q13; IA sir TD slide 2', seen: ['2011-12'] },
  { id: 'c-gcc-fm', topic: T, front: 'What is force majeure?', back: 'An event beyond the contractor’s control, not foreseeable, unavoidable and not due to its negligence — war, revolution, fire, flood, epidemic, quarantine, embargo, acts of Government; a ground for termination.', src: 'PPR r.2(24), 42(2)' },
]

const ROWS = `| Clause | GCC (general rule — same for all tenders) | PCC (project data — example) |
|---|---|---|`

// ---------- answers ----------
const answers: PcAnswer[] = [
  {
    id: 'a-gcc-pcc-relation',
    topic: T,
    q: 'State the relationship between GCC and PCC.',
    seen: ['May 2024', '2017-18', '2016-17', '2014-15', '2012-13'],
    a: `**Conditions of contract** define the conditions under which the contractor executes the contract, including the **rights, responsibilities and relationships** of the parties. They have two parts:
1. **General Conditions of Contract (GCC)** — core clauses generally applicable to most projects; **kept unchanged for all tenders**; only general conditions, not project-specific ones (definitions, arbitrator, JVCA, price escalation, compensation events, performance security, retention, delay damages …).
2. **Particular Conditions of Contract (PCC)** — specifically written to **expand on the GCC** for the particular project: the **project-specific figures** for each GCC clause (amount of compensation, performance security, LD rate), list of key personnel, and any **modification** of GCC clauses.

### Relationship
- Read together, **clause by clause** with the same numbering — the GCC states the rule, the PCC fills in the data.
- In a conflict the **PCC prevails** (4th vs 5th in the order of precedence, PPR r.4(7)).
- The PE may adapt only the TDS and **PCC**, never contradicting the Act/Rules (r.4(12)).`,
    keys: ['Conditions of contract', 'rights, responsibilities and relationships', 'General Conditions of Contract', 'kept unchanged for all tenders', 'Particular Conditions of Contract', 'expand on the GCC', 'project-specific figures', 'modification', 'clause by clause', 'PCC prevails', 'r.4(7)'],
    lists: ['l-gcc-items'],
    src: 'IA sir GCC+TEC slides 1–3; Tender Document slide 6; PPR r.4(7),(12)',
  },
  {
    id: 'a-gcc-clauses',
    topic: T,
    q: 'Prepare corresponding GCC and PCC clauses for: definitions, completion time, liquidated damages, compensation events, retention, performance security, advance payment, variation, payment, price adjustment, arbitration.',
    seen: ['May 2024', '2017-18', '2016-17', '2014-15', '2012-13'],
    a: `${ROWS}
| **Definitions** | Employer: the body that commissions the works. Contractor: person whose tender is accepted and who executes the works. **Engineer**: person named in the contract or appointed by the PE, responsible for supervising the works and administering the contract. **Day**: calendar day unless working day is stated. | Employer: Executive Engineer, … Division, RHD. Engineer: Superintending Engineer, … Circle. Contractor: M/s X Ltd. |
| **Completion time** | Contractor starts on the Start Date and completes by the **Intended Completion Date**; programme submitted and updated; extension for compensation events/variations. | Start: 14 days after signing. Intended completion: 730 days. EOT decided within 21 days. |
| **Liquidated damages** | Contractor pays LD at the **rate per day** stated in the PCC for each day beyond the Intended Completion Date, up to the maximum; deducted from payments; does not relieve obligations. | 0.05% of contract price per day; maximum 10%. |
| **Compensation events** | Listed employer-risk events (late site possession, late drawings, ordered delay, tests with no defect, adverse ground …) entitle the contractor to more time and/or money. | Extra event: payment delayed beyond 28 days of certificate. |
| **Retention** | A % of each bill **retained** until completion; **half repaid on completion**, rest after the Defects Correction Certificate. | 5% of each bill; total retention + PS ≤ 10% if no advance. |
| **Performance security** | Furnished in the amount and form in the PCC after NOA; valid **28 days beyond the intended completion date**. | 10% of contract price, bank guarantee of a scheduled bank, within 14 days of NOA acceptance. |
| **Advance payment** | Paid against an equal **bank guarantee**; used for mobilisation/equipment; recovered proportionately; no interest. | 10% of contract price; recovered from interim bills. |
| **Variation** | Engineer may order changes within the general scope; valued at BoQ rates or new rates; no work without approval. | Cumulative limit 15% of original contract price. |
| **Payment** | Monthly statement → Engineer **certifies** → PE pays within the period; BoQ rates. | Payment within 28 days of each certificate. |
| **Price adjustment** | Prices adjusted for rise/fall of labour, material, fuel by the formula, only if the PCC allows. | Applicable (contract > 18 months); indices from BBS. |
| **Arbitration / settlement of disputes** | Disputes settled **amicably**, then by **adjudication**, then **arbitration** as the contract provides. | Adjudicator: [name]; arbitration in Dhaka; appointing authority named. |

The GCC column is identical in every tender; the PCC column changes with the project. PCC figures above are examples (PPR limits: PS 5–10%, LD cap as stated, variation 15%).`,
    keys: ['Definitions', 'Engineer', 'Day', 'Intended Completion Date', 'Liquidated damages', 'rate per day', 'Compensation events', 'Retention', 'half repaid on completion', 'Performance security', '28 days beyond the intended completion date', 'Advance payment', 'bank guarantee', 'Variation', 'certifies', 'Price adjustment', 'adjudication', 'arbitration'],
    lists: ['l-gcc-items', 'l-dispute-steps'],
    src: 'IA sir GCC+TEC slides 2–3; PPR r.2, 5, 27–28, 38–39, 42, 78–80, Sch II (PCC figures illustrative)',
  },
  {
    id: 'a-gcc-timely',
    topic: T,
    q: 'Describe the GCC and PCC clauses pertaining to timely completion of a contract.',
    seen: ['2015-16'],
    a: `${ROWS}
| **Start and intended completion date** | Contractor starts on the Start Date and completes by the **Intended Completion Date**, revised only by the Engineer through an extension or acceleration order. | Start: 14 days after signing; completion 540 days. |
| **Programme** | Contractor submits a **programme** (methods, order, timing) for approval and updates it with a cash-flow forecast; payment may be withheld until it is given. | Within 14 days of NOA; update every 30 days. |
| **Early warning** | Contractor warns the Engineer of events likely to delay completion. | — |
| **Extension of time** | Intended Completion Date **extended** if a compensation event or variation prevents completion without extra cost. | Decision within 21 days; > 20% of original time needs HOPE. |
| **Acceleration / delays ordered** | Engineer may order a delay or ask for proposals to accelerate. | — |
| **Liquidated damages** | **Liquidated damages** per day of delay, up to a maximum; payment does not relieve obligations. | 0.05% per day, max 10%. |
| **Bonus** | **Bonus for early completion** per day, if the PCC provides. | Not applicable / rate per day. |
| **Completion and taking over** | Engineer issues the **completion certificate**; PE takes over the site and works. | Take over within 7 days. |
| **Termination** | Delay beyond the maximum-LD period is a fundamental breach — **termination**. | — |`,
    keys: ['Intended Completion Date', 'programme', 'Early warning', 'extended', 'compensation event', 'Liquidated damages', 'Bonus for early completion', 'completion certificate', 'termination'],
    lists: ['l-timely-completion'],
    src: 'PPR r.2(30), 39(1)–(4),(27)–(33), 42; IA sir GCC+TEC slide 3',
  },
  {
    id: 'a-comp-events',
    topic: T,
    q: 'List the events that are regarded as compensation events in a construction contract.',
    seen: ['2016-17', '2014-15', '2011-12'],
    a: `**Compensation events** are employer-risk events for which the contractor gets **extra time and/or money**; the Engineer assesses them and the contract price and/or Intended Completion Date are adjusted (PPR r.39(3),(26)). Typical GCC list:
1. Employer does not give **possession of the site** by the site possession date.
2. Employer modifies the schedule of **other contractors**.
3. Engineer **orders a delay**.
4. Engineer does not issue **drawings, specifications or instructions** in time.
5. Engineer orders uncovering/**tests** and no defect is found.
6. Engineer unreasonably refuses approval of a **subcontract**.
7. **Ground conditions** substantially more adverse than could reasonably be assumed.
8. Other contractors, **public authorities or utilities** do not work within agreed dates.
9. **Advance payment** paid late.
10. **Employer's risks** affect the contractor.
11. Engineer unreasonably delays the **completion certificate**.

The PCC may add events (e.g. payment delayed beyond 28 days of a certificate).`,
    keys: ['Compensation events', 'extra time', 'possession of the site', 'orders a delay', 'drawings', 'tests', 'subcontract', 'Ground conditions', 'utilities', 'Advance payment', "Employer's risks", 'completion certificate'],
    lists: ['l-comp-events'],
    src: 'Standard GCC (question bank); PPR r.39(3),(26)',
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

FIDIC = Federation of Consulting Engineers; its conditions of contract are commonly used.`,
    keys: ['Straight-forward', 'Green Book', 'Designing in the scope of the Employer', 'Red Book', "Contractor's design", 'Maintenance', 'Gold Book', 'Yellow Book', 'Fixed-price lump sum', 'Silver Book', 'modified FIDIC'],
    lists: ['l-fidic-books'],
    src: 'IA sir “FIDIC Conditions Selection Criteria” chart; GCC+TEC slide 1',
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
    a: `**Arbitration** is a procedure in which a dispute is submitted, **by agreement of the parties**, to one or more **arbitrators** who make a **binding decision** on the dispute.
1. The **arbitrator** is the person to whom employer and contractor refer their disputes and are bound by the decision; he **cannot be the Project Manager**.
2. It is the **last step**: disputes are settled **amicably**, then by the **adjudicator** (rulings, preferably not the PM), then arbitration (PPR r.42(4)).
3. The GCC names the arbitrator clause; the PCC gives venue, rules and appointing authority.
4. In international contracts, **international arbitration** gives the final resolution (PPA s.33(c)(ix)).
5. Advantages: expert decision-maker, private, faster and cheaper than court.

Example: employer and contractor disagree on the rate for a variation; the adjudicator's ruling is not accepted, so they refer it to an arbitrator, whose award both must follow.`,
    keys: ['Arbitration', 'by agreement of the parties', 'arbitrators', 'binding decision', 'cannot be the Project Manager', 'amicably', 'adjudicator', 'international arbitration'],
    lists: ['l-dispute-steps'],
    src: 'Senior note Q13; IA sir TD slide 2; PPR r.42(4); PPA s.33',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
