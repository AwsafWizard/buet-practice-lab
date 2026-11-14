// pc-services — procurement of intellectual & professional services: methods, selection steps, EoI,
// terminology, TOR/RFP, QCBS scoring (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-services).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

// ---------- figure: selection of consultants (theme tokens only) ----------
const fInk = 'var(--c-ink)'
const fMute = 'var(--c-mute)'
const fLine = 'var(--c-line)'
const fPanel = 'var(--c-panel2)'
const fAccent = 'var(--c-ia)'

const ConsultantFlowFig: FC = () => {
  const boxes = [
    ['Expression of Interest', '(invitation, submission, evaluation)'],
    ['Issue of RFP by PE'],
    ['Proposal Submission by', 'preselected interested firms'],
    ['Evaluation of Proposal', '(Technical + Financial)'],
    ['Negotiations with the', '1st ranked proposer'],
    ['Contract with the Consultant'],
  ]
  return (
    <svg viewBox="0 0 340 480" width="100%" style={{ maxWidth: 380 }} role="img" aria-label="Flow chart of selection of a consultant">
      <defs>
        <marker id="pc-svc-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={fMute} />
        </marker>
      </defs>
      {boxes.map((t, i) => {
        const y = 8 + i * 78
        const last = i === boxes.length - 1
        return (
          <g key={i}>
            <rect x={30} y={y} width={280} height={48} rx={6} fill={fPanel} stroke={last ? fAccent : fLine} strokeWidth={last ? 2.4 : 1.3} />
            {t.map((s, k) => (
              <text key={k} x={170} y={y + 24 + 4 - ((t.length - 1) * 8) + k * 16} textAnchor="middle" fontSize={12} fill={fInk} fontWeight={last ? 700 : 400}>
                {s}
              </text>
            ))}
            {!last && <path d={`M170,${y + 48} V${y + 78 - 2}`} fill="none" stroke={fMute} strokeWidth={1.4} markerEnd="url(#pc-svc-arr)" />}
          </g>
        )
      })}
    </svg>
  )
}

const T = 'pc-services' as const

const lists: PcList[] = [
  {
    id: 'l-services-methods',
    topic: T,
    title: 'Methods for procuring intellectual and professional services',
    ask: 'Name the different methods for procurement of intellectual services (PPA 2006).',
    points: [
      { k: 'Quality and Cost Based Selection (QCBS)', alt: ['QCBS'], d: 's.37(a): competitive process among short-listed consultants considering the quality and the probable cost judiciously.' },
      { k: 'Fixed Budget Selection (FBS / SFB)', alt: ['FBS', 'SFB', 'fixed budget'], d: 's.37(b): simple and specific nature of service; budget allocation stated in the RFP.' },
      { k: 'Least Cost Selection (LCS)', alt: ['LCS', 'least cost'], d: 's.38(1)(a): service of standard or routine nature; cost within the prescribed price limit.' },
      { k: 'Community Service Organisation selection', alt: ['CSO', 'NGO'], d: 's.38(1)(b): knowledge of community needs, local issues and community participation paramount.' },
      { k: 'Single Source Selection (SSS)', alt: ['SSS', 'single source'], d: 's.38(1)(c): continuation, low value, emergency, single qualified firm, catastrophic event.' },
      { k: 'Individual Consultant Selection', alt: ['ICS', 'SIC', 'individual consultant'], d: 's.38(1)(d): qualification and experience of individuals paramount; no team or outside support.' },
      { k: 'Qualifications based Selection (QBS)', alt: ['QBS', 'SBCQ', 'qualifications based', 'qualification based'], d: 's.38(1)(e): low value; preparing and evaluating competitive proposals not justified.' },
      { k: 'Design Contest Selection', alt: ['DC', 'design contest'], d: 's.38(1)(f): technical excellence and innovation prime (architectural design).' },
    ],
    hook: 'Two preferred (Quality+Cost, Fixed budget) + six others “Little Children Sing In Quiet Dens” — LCS, CSO, SSS, Individual, QBS, Design contest (PPA s.38 (a)–(f) order).',
    seen: ['2023-24', '2022-23', '2014-15'],
    src: 'PPA 2006 s.37–38; PPR r.103–112; IA sir “Steps” slide p3; TF solve pp.17–18',
    note: 'Slide calls them FBS and QBS; PPR calls them SFB and SBCQ.',
  },
  {
    id: 'l-sss-cases',
    topic: T,
    title: 'When Single Source Selection may be used',
    points: [
      { k: 'Continuation of ongoing or just-completed work', alt: ['continuation', 'downstream work'] },
      { k: 'Low value small assignments', alt: ['small assignment', 'low value'] },
      { k: 'Speedy selection in emergency', alt: ['emergency'] },
      { k: 'Only one firm qualified / rare experience', alt: ['only one firm', 'exceptional worth'] },
      { k: 'Urgent need after catastrophic event', alt: ['catastrophe', 'disaster'] },
    ],
    seen: ['2023-24', '2022-23', '2014-15'],
    src: 'PPA s.38(1)(c); PPR r.104(d); senior note Q15',
    note: 'Why restricted (PPR r.104(d)(1)): no benefits of competition in quality and cost, lacks transparency, could encourage fraudulent practices.',
  },
  {
    id: 'l-consultant-steps',
    topic: T,
    title: 'Steps for selecting a consultant under QCBS',
    ask: 'Write essential steps for selection of a consultant for intellectual services.',
    points: [
      { k: 'Expression of Interest (EoI) advertised', alt: ['EoI', 'request for expression of interest'], d: 'Prepare and approve EoI document, advertise, receive EoIs.' },
      { k: 'Short-list approved', alt: ['shortlist', 'short-listing'], d: '4–7 firms, approved by HOPE; all applicants informed.' },
      { k: 'Issue RFP to short-listed firms', alt: ['RFP', 'request for proposal'] },
      { k: 'Receive proposals in two envelopes', alt: ['technical and financial proposal', 'submission'] },
      { k: 'Evaluate technical proposals', alt: ['technical evaluation', 'PEC'] },
      { k: 'Open financial proposals of qualified firms', alt: ['financial opening'] },
      { k: 'Combine scores and rank', alt: ['combined score', 'ranking'] },
      { k: 'Negotiate with top-ranked firm', alt: ['negotiation'] },
      { k: 'Issue NOA and sign contract', alt: ['contract', 'NOA'] },
    ],
    ordered: true,
    hook: 'Slide columns E-R-E-N-C: Expression of interest → Request for proposal → Evaluation → Negotiation → Contracting (“Every Request Ends in Negotiated Contract”).',
    seen: ['2023-24', '2011-12'],
    src: 'IA sir “Steps … Selection of Consultant by QCBS” slide; PPA s.54–63; PPR r.105; senior note Q14',
  },
  {
    id: 'l-eoi-contents',
    topic: T,
    title: 'Contents of a request for Expression of Interest',
    points: [
      { k: 'Name and address of procuring entity', alt: ['procuring entity'] },
      { k: 'Background and objective', alt: ['background', 'source of fund'] },
      { k: 'Brief description and scope of assignment', alt: ['scope', 'description of assignment'] },
      { k: 'Eligibility; JV or association rules', alt: ['joint venture', 'association'] },
      { k: 'Selection method (QCBS under PPR)', alt: ['selection method'] },
      { k: 'Information required: experience, staff, capacity', alt: ['experience', 'professional staff', 'resources'] },
      { k: 'Place and deadline for submission', alt: ['deadline', 'place of submission'] },
      { k: 'Disclaimers: no cost, right to reject', alt: ['right to reject', 'disclaimer'] },
    ],
    seen: ['2011-12'],
    src: 'PPR r.113(3); PPA s.54(2); IA sir RHD EoI notice',
  },
  {
    id: 'l-eoi-criteria',
    topic: T,
    title: 'Criteria on which EoIs are evaluated (RHD notice)',
    points: [
      { k: 'Registration of the firm', alt: ['registration'] },
      { k: 'Legal entitlements: trade licence, TIN, VAT', alt: ['trade license', 'TIN', 'VAT'] },
      { k: 'Company profile (3 pages)', alt: ['company profile'] },
      { k: 'Permanent professional staff', alt: ['key staff', 'professional staff'] },
      { k: 'Average annual turnover, last 3 years', alt: ['turnover'] },
      { k: 'General and overall experience', alt: ['general experience'] },
      { k: 'Similar experience, last 10 years', alt: ['similar experience', 'specific experience'] },
    ],
    seen: ['2011-12'],
    src: 'IA sir RHD EoI notice (24.05.2022)',
  },
  {
    id: 'l-qcbs-tech-criteria',
    topic: T,
    title: 'Criteria for evaluating technical proposals (with points)',
    points: [
      { k: 'Specific experience (5–10)', alt: ['specific experience'] },
      { k: 'Methodology and work plan (20–50)', alt: ['methodology', 'work plan'] },
      { k: 'Key staff qualifications (40–60)', alt: ['key staff'] },
      { k: 'Transfer of knowledge (0–20)', alt: ['training'] },
      { k: 'National participation (0–10)', alt: ['national participation'] },
    ],
    seen: [],
    src: 'PPR r.117(25),(27)',
  },
  {
    id: 'l-negotiation-items',
    topic: T,
    title: 'Items negotiated with the winning consultant',
    points: [
      { k: 'Methodology', alt: ['method'] },
      { k: 'Work plan and activity schedule', alt: ['work plan'] },
      { k: 'Organisation and staffing', alt: ['staffing'] },
      { k: 'Deliverables', alt: ['outputs'] },
      { k: 'Training inputs', alt: ['training'] },
      { k: 'Client’s inputs', alt: ['procuring entity inputs'] },
      { k: 'Reimbursables (time-based)', alt: ['reimbursables'] },
      { k: 'Proposed contract price', alt: ['price'] },
    ],
    seen: ['2022-23'],
    src: 'PPR r.122(3)',
    note: 'Staff remuneration rates are never re-negotiated where price was an evaluation factor (r.122(4)).',
  },
  {
    id: 'l-tor-contents',
    topic: T,
    title: 'Contents of the Terms of Reference (TOR)',
    points: [
      { k: 'Background of PE and project', alt: ['background'] },
      { k: 'Objectives and scope', alt: ['scope', 'objectives'] },
      { k: 'Duration of assignment', alt: ['duration'] },
      { k: 'Services, surveys and expected outputs', alt: ['outputs', 'deliverables'] },
      { k: 'Training / transfer of knowledge', alt: ['training'] },
      { k: 'Facilities provided to consultant', alt: ['facilities', 'support'] },
      { k: 'Institutional arrangements', alt: ['institutional'] },
      { k: 'Existing studies and data', alt: ['data', 'studies'] },
    ],
    seen: [],
    src: 'PPR r.116; senior note Q4',
  },
  {
    id: 'l-svc-terms',
    topic: T,
    title: 'Terms: works & goods vs intellectual services (class table)',
    ask: 'Compare the terminologies used for procurement of intellectual services as opposed to works and goods.',
    points: [
      { k: 'Prequalification → Expression of Interest', alt: ['EoI', 'expression of interest'], d: 'Prequalification not mandatory; EoI mandatory.' },
      { k: 'Tender → Proposal', alt: ['proposal'] },
      { k: 'TEC → PEC', alt: ['PEC', 'proposal evaluation committee'] },
      { k: 'TOC → POC', alt: ['POC', 'proposal opening committee'] },
      { k: 'Tender security → No security', alt: ['no security', 'no proposal security'] },
      { k: 'Contractor / Supplier → Consultant', alt: ['consultant'] },
    ],
    seen: ['2021-22'],
    src: '18-batch TF solve p.18 (Important for TF); typed note Ques-11',
  },
  {
    id: 'l-tor-advantages',
    topic: T,
    title: 'Advantages of a Terms of Reference (TOR)',
    ask: 'What are the advantages of TOR?',
    points: [
      { k: 'Resolving disputes', alt: ['disputes'] },
      { k: 'States facts clearly for all stakeholders', alt: ['facts', 'stakeholders'] },
      { k: 'Clear understanding between provider and client', alt: ['clear understanding'] },
      { k: 'Supports the project team', alt: ['project team'] },
      { k: 'Protects against liability and damage claims', alt: ['liability', 'damage claim'] },
      { k: 'Selling point: evokes trust', alt: ['trust', 'reliable tone'] },
    ],
    seen: [],
    src: 'Nafee bhai note Ques-15 (∗∗∗)',
  },
  {
    id: 'l-rfp-parts',
    topic: T,
    title: 'Parts of a Request for Proposal (RFP)',
    points: [
      { k: 'Letter of Invitation with short-list', alt: ['LOI', 'letter of invitation'] },
      { k: 'Instructions to Consultants (ITC)', alt: ['ITC', 'ITA', 'instructions to applicants'] },
      { k: 'Proposal Data Sheet (PDS)', alt: ['PDS'] },
      { k: 'General Conditions of Contract', alt: ['GCC'] },
      { k: 'Particular Conditions of Contract', alt: ['PCC'] },
      { k: 'Standard Contract Form', alt: ['contract form'] },
      { k: 'Terms of Reference (TOR)', alt: ['TOR'] },
      { k: 'Appendices', alt: ['appendix'] },
    ],
    ordered: true,
    seen: [],
    src: 'PPR r.117(3)',
  },
]

const cards: PcCard[] = [
  { id: 'c-svc-preferred', topic: T, front: 'Which two methods are “preferred” for intellectual services?', back: '**QCBS** — used in most cases, quality of proposal and cost of services (PPR r.103(4)(a)); **SFB/FBS** — only when the assignment is simple, precisely defined and the budget fixed. Both **preceded by short-listing** (PPA s.37). Others need HOPE approval (s.38).', src: 'PPA s.37–38; PPR r.103' },
  { id: 'c-svc-quality-first', topic: T, front: 'Why is quality the prime consideration in consultancy?', back: 'If cost predominates, the quality of services “often ends up being inferior”, causing rework or less economical solutions — so cost is “considered judiciously” (PPR r.103(1)–(2)).', src: 'PPR r.103' },
  { id: 'c-svc-shortlist', topic: T, front: 'Short-list size and rules?', back: '**Not less than 4 and not more than 7**, preferably **6** (PPA s.56(2); PPR Sch II). International: ≤ 2 per country, ≥ 1 developing-country firm. EoIs judged Excellent / Very good / Good / Poor (not marks). (PPA s.56(2) as amended in 2025/2026 leaves the number to the rules; PPR still says 4–7.)', src: 'PPA s.56; PPR r.115, Sch II' },
  { id: 'c-svc-eoi-time', topic: T, front: 'Minimum time for EoI and for proposals?', back: 'EoI: **14 days** national, **21 days** international. Proposals: **28 days** national, **42 days** international (PPR Sch II 113(2), 117(19)).', src: 'PPR Sch II' },
  { id: 'c-svc-eoi-app', topic: T, front: 'What must an EoI application contain (PPA s.54(2))?', back: '(a) particulars of **professional staff**; (b) **financial and technical capability** to deliver the services; (c) **past experience** in providing the relevant services. Class labels on s.54–55: **EOI — mandatory process**; **RFP — fee + reimbursable expense**.', src: 'PPA s.54(2)' },
  { id: 'c-svc-two-env', topic: T, front: 'How are consultancy proposals submitted and opened?', back: 'Technical and financial proposals in **two sealed inner envelopes** in one sealed outer envelope; POC opens technical only; financial kept in safe custody (HOPE) until the technical evaluation is approved, then opened **in public** for qualified firms.', src: 'PPA s.57–59; PPR r.118, 120' },
  { id: 'c-svc-sf', topic: T, front: 'QCBS financial score formula?', back: '**Fs = 100 × Fm / F** — the lowest financial offer Fm gets 100 points; others pro rata (PPR r.121(2): 1.0 M → 100, 1.2 M → 83.3, 1.5 M → 66.6).', src: 'PPR r.121(2)' },
  { id: 'c-svc-combined', topic: T, front: 'QCBS combined score?', back: '**Combined score = Ts × T + Fs × P** (T + P = 100%; e.g. 0.8 Ts + 0.2 Fs). PPR example: 90 points × 80% = 72. The highest combined score is invited for negotiation; if two are equal, the greater technical score is selected (class N.B.).', src: 'PPR r.121' },
  { id: 'c-svc-weights', topic: T, front: 'QCBS weights and minimum technical score in PPR?', back: 'Quality up to **80%**, price 20% (multidisciplinary, feasibility, management studies); standard services 65:35, 60:40, 55:45 or 50:50. Minimum technical points **70**; below it the financial proposal is **returned unopened**.', src: 'PPR r.117(24)' },
  { id: 'c-svc-winner', topic: T, front: 'Who is invited to negotiate under QCBS, FBS and LCS?', back: 'QCBS: **highest combined score**. FBS: **highest technical score within the budget** (over-budget proposals rejected). LCS: **lowest price** among those passing the technical threshold (PPA s.59(3); PPR r.122(1)).', src: 'PPA s.59(3); PPR r.106–107, 122' },
  { id: 'c-svc-nego-rule', topic: T, front: 'Negotiation rules with consultants?', back: 'One firm at a time — fail → next ranked (PPA s.60(2)); no change to quoted **staff remuneration rates**; TOR not significantly altered; agreed minutes signed and draft contract initialled.', src: 'PPA s.60; PPR r.122, 125' },
  { id: 'c-svc-no-ps', topic: T, front: 'Is tender security required for procurement of services? (asked in class)', back: '**No.** PPA s.14(d): “in the case of services contracts relating to service procurement, no person shall be required to submit a **proposal security or a performance security**, the type of any **indemnities or any insurance**, or both indemnities and insurances are to be provided by the consultant shall be specified.” (PPR r.125(4)–(5): the consultant re-performs at its own cost or indemnifies.)', src: 'PPA s.14(d); PPR r.125(4)–(5); class-marked question in the annotated PPA; typed note Ques-18(a)' },
  { id: 'c-svc-pli', topic: T, front: 'What is “Professional Liability Insurance”? (discussed by Sir in class)', back: 'Professional liability insurance, often referred to as **errors and omissions (E&O) insurance**, is a type of insurance coverage designed to protect professionals from liability arising from **negligent acts, errors, or omissions** in the performance of their professional duties. In service procurement it replaces the proposal / performance security (PPA s.14(d)).', seen: [], src: 'Nafee bhai note Ques-18(b) (“Discussed by Sir in class”)' },
  { id: 'c-svc-budget', topic: T, front: 'Does the RFP state the budget?', back: 'QCBS: **no** — only the expected key-staff input in person-months (cost is an evaluation criterion). FBS: **yes**, the available budget excluding taxes.', src: 'PPR r.106(1)(a), 117(24)(f)' },
  { id: 'c-svc-sbcq', topic: T, front: 'How does QBS (SBCQ) work?', back: 'TOR first → EoIs → short-list → select the **best-qualified firm** → only it submits a combined technical + financial proposal → negotiate. For very small assignments (brief evaluation studies, short legal advice).', src: 'PPR r.104(b), 108' },
  { id: 'c-svc-individual', topic: T, front: 'Individual consultant selection?', back: 'When the individual’s qualifications are paramount and no team is needed; EoI, compare CVs (academic background, experience, local knowledge), interview, negotiate. Without EoI (HOPE approval) for continuation, < 6 months, disaster, or only one qualified — collect ≥ 3 CVs.', src: 'PPA s.38(1)(d); PPR r.112' },
  { id: 'c-svc-dc', topic: T, front: 'Design contest — what is evaluated?', back: 'Conceptual designs (monument, terminal, HQ): innovation, aesthetics, blending with surroundings, use of space, attractiveness, energy saving, revenue potential, estimated construction cost; winner gets the next design phase and a prize.', src: 'PPR r.111' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-services-methods',
    topic: T,
    q: 'According to PPA 2006, what are the methods for procurement of intellectual services? Describe the applicability of each (with examples).',
    seen: ['2023-24', '2022-23', '2014-15'],
    a: `### Preferred methods — PPA 2006 s.37
"The procuring entity shall, for the procurement of intellectual and professional services, use one of the following preferred methods, preceded by **short-listing** of applicants interested in providing intellectual and professional services, namely:"
1. **Quality and Cost Based Selection (QCBS)** — "the selection of consultant through a competitive process among short-listed consultants considering the **quality and the probable cost** of the services judiciously". *e.g. detailed design and supervision of a highway.*
2. **Fixed Budget Selection (FBS)** — "selection of consultant for **simple and specific nature** of service considering the **budget allocation** as stated in the request for proposal document". *e.g. a feasibility study with a fixed allocation.*

### Other methods — PPA 2006 s.38
"(1) Any of the following methods, other than the method mentioned in section 37, may be applied with the **approval of the head of the procuring entity** or an officer authorised by him, for procurement of intellectual and professional services, namely:—"
3. **Least Cost Selection** method — "in cases where the service is of **standard or routine nature**, and where the cost of the services is within the as prescribed price limit" (PPR: up to Tk 5 million). *e.g. annual audit.*
4. **Community Service Organisation Selection** method — "in cases where overall knowledge of **community needs**, local issues and community participation are paramount in the preparation, implementation and operation of community development projects". *e.g. community mobilisation for rural water supply.*
5. **Single Source Selection** method — "in the following cases— (i) if necessary in **continuation** of on-going or just completed assignments; (ii) low value small assignments; (iii) a speedy selection required in an **emergency** situation; (iv) where only a single firm has the required qualification or rare experience required for the assignment; (v) if an urgent need of the services is required, in the case of catastrophic event".
6. **Individual Consultant Selection** method — "in cases where the **qualification and experience of individuals are paramount** and a team of personnel and outside professional support are not required". *e.g. a procurement specialist.*
7. **Qualifications based Selection** method — "in cases where the assignment is of **low value** and within the threshold value as prescribed and for which preparation and evaluation of competitive proposal is not justified". *e.g. short high-level legal advice.*
8. **Design Contest Selection** method — "in cases where **technical excellence and innovation** are of prime considerations in the selection of the successful applicant". *(Architectural Design)*

"(2) In the case of procurement using any method under sub-section (1), a procuring entity shall properly record in the file the reasons for use of that method and preserve such records. (3) The outline and implementation procedures for the use of the methods mentioned in sub-section (1) may be prescribed by rules."`,
    keys: ['Quality and Cost Based Selection', 'short-listing', 'quality and the probable cost', 'Fixed Budget Selection', 'simple and specific nature', 'budget allocation', 'approval of the head of the procuring entity', 'Least Cost Selection', 'standard or routine nature', 'community needs', 'Single Source Selection', 'continuation', 'emergency', 'Individual Consultant', 'qualification and experience of individuals are paramount', 'Qualifications based Selection', 'low value', 'Design Contest', 'technical excellence and innovation'],
    lists: ['l-services-methods', 'l-sss-cases'],
    src: 'PPA s.37–38; PPR r.103–112, Sch II; TF solve pp.17–18 (memorise word by word); typed note Ques-12',
  },
  {
    id: 'a-tor',
    topic: T,
    q: 'What is a Terms of Reference (TOR)? What are its advantages? Prepare a TOR.',
    seen: [],
    a: `### Definition
**Terms of reference (TOR)** define the **purpose and structure** of a project, committee, negotiation or any similar collection of people who have agreed to work together to accomplish a **shared goal**. In public procurement a TOR is used for **intellectual and professional services** only — it is the consultant's counterpart of the specifications, drawings and BoQ.

### PPA 2006 s.15(2)
"A procuring entity shall, for the purpose of creating conditions for impartial and open competition among consultants, in preparing the terms of reference of the consultants, provide a **correct and complete description** of the intellectual and professional services to be procured; but no such condition shall be imposed that may **restrict the competition**."

### Advantages
1. **Resolving disputes**.
2. States facts clearly for all stakeholders.
3. Creates a **clear understanding** between the provider and the client.
4. Supports the project team.
5. Protects against **liability** and damage claims.
6. A selling point — **evokes trust** and a reliable tone.

### Contents (PPR r.116)
Background of the procuring entity and the project; **objectives and scope**; duration; services, surveys and **expected outputs**; training / transfer of knowledge; facilities provided to the consultant; institutional arrangements; existing studies and data.

### Template (senior note)
Name of group · Title · Purpose / Role of the group · Membership · Accountability · Review · Working method · Meetings · Sharing of information and resources (including confidential materials) · Definition of terms.

### Example — TOR for a CAAB airport consultant (20-batch assignment)
1. **Site Selection** — Mymensingh, Ganginar Par; at least 3,000 acres; flat or very gently undulating land; parallel runways at least 1,035 m apart under IFR.
2. **Environment Impact Assessment (EIA)** — present land use, vegetation, soil profile.
3. **Transportation Impact Assessment (TIA)** — road, rail, public transport, air traffic.
4. **Geotechnical Impact Assessment (GIA)** — site characterization, project impacts, mitigation strategies.
5. **Conceptual Design Study** — runways, apron, terminals, taxiway.
6. **Cost Estimation**

| Components | Quantity | BDT (million) |
|---|---|---|
| Airfield | 2 | 5000 × 2 = 10000 |
| Taxiway | 1 | 200 |
| Lighting System | – | 100 |
| Passenger Terminal | 3 | 1000 × 3 = 3000 |
| Cargo Terminals | 2 | 500 × 2 = 1000 |
| Control Tower | 1 | 100 |
| Total | – | 14400 |`,
    keys: ['Terms of reference', 'purpose and structure', 'shared goal', 'intellectual and professional services', 'correct and complete description', 'restrict the competition', 'Resolving disputes', 'clear understanding', 'liability', 'evokes trust', 'objectives and scope', 'expected outputs'],
    lists: ['l-tor-advantages', 'l-tor-contents'],
    src: 'Nafee bhai note Ques-15 (∗∗∗, definition, advantages, template); Ques-16 “Discussed by Sir in class” (PPA s.15(2)); typed note Ques-17 (CAAB ToR, 20-batch assignment; TF solve pp.23–28); PPR r.116',
  },
  {
    id: 'a-consultant-steps',
    topic: T,
    q: 'Describe the steps for the procurement of intellectual services / selection of a consultant (as per PPA 2006).',
    seen: ['2023-24', '2011-12'],
    a: `### Expression of Interest (EoI)
1. Prepare and approve the EoI document; **advertise the request for EoI** (s.40); applicants submit staff, capability and experience (s.54).
2. POC opens EoIs; PEC evaluates; **short-list of 4–7** approved by HOPE; all applicants informed (s.55–56).

### Request for Proposal (RFP)
3. **Issue RFP** to the short-listed firms (s.57).
4. Firms submit **technical and financial proposals** in two sealed envelopes inside one; late proposals returned unopened.

### Evaluation of proposal
5. POC opens technical proposals; financial kept in safe custody. **PEC evaluates technical proposals**; report approved by HOPE (s.58–59).
6. **Financial proposals of technically qualified firms opened** in their presence.
7. **Combine technical and financial scores** and rank (QCBS).

### Negotiation
8. **Negotiate with the top-ranked firm** as to scope the services (methodology, work plan, staffing, inputs); if it fails, the next — never two at once (s.60).

### Contracting
9. Approval → **issue NOA and sign contract** (no complaint pending); notify unsuccessful firms (s.61–63).

### Short version (class note, 8 steps) — for 5–7 marks
Step-1 EOI (Expression of Interest) → Step-2 Issue RFP to shortlisted firms → Step-3 Receive Proposals: Technical & Financial (Two Envelope) → Step-4 Evaluation of Proposal: 1st Technical, 2nd Financial → Step-5 Open Financial Proposal of technically responsive proposer → Step-6 Evaluate and Combine technical & financial score → Step-7 Negotiate with first ranked proposer → Step-8 Contract sign.`,
    keys: ['Expression of Interest', 'advertise the request for EoI', 'short-list of 4–7', 'Issue RFP', 'technical and financial proposals', 'PEC evaluates technical proposals', 'Financial proposals', 'Combine technical and financial scores', 'Negotiate with the top-ranked firm', 'sign contract'],
    lists: ['l-consultant-steps'],
    src: 'IA sir QCBS steps slide; PPA s.54–63; PPR r.105, 113–126; TF p.22; typed note Ques-13',
    Fig: ConsultantFlowFig,
  },
  {
    id: 'a-eoi-notice',
    topic: T,
    q: 'Prepare a notice inviting an Expression of Interest (EoI) for selection of a consultant.',
    seen: ['2011-12'],
    a: `### Government of the People's Republic of Bangladesh
**[Procuring Entity], [Office], [Address]** — Memo No. … Date: …
### Request for Expressions of Interest (EOI)
**Consultancy Services for [assignment]**

**A. Background and objective** — 1. The Government (or development partner) has allocated funds for [project] and intends to use part of them for consultancy services. 2. Objective of the services.

**B. Scope** — description of the services and the main activities (Activity 1, 2, 3 …), duration.

**Invitation** — [PE] now invites **Expressions of Interest** in English from eligible consulting firms, alone or in **joint venture / association** (state "Joint Venture" or "Sub-Consultancy"; partners **jointly and severally liable**; lead partner signs; preferably not more than 3 firms).

**Selection method** — consultants will be selected under **Quality and Cost Based Selection (QCBS)** as per the Public Procurement Rules 2008.

**Information required / evaluation of EoI** — (i) registration of the firm; (ii) legal entitlements (trade licence, TIN, VAT); (iii) company profile; (iv) permanent professional staff; (v) **average annual turnover** of the last 3 years (audited); (vi) general experience; (vii) **similar experience** in the last 10 years.

**Submission** — EoIs in sealed envelopes marked "[assignment]" to the address below by [time, date — at least **14 days** after publication (21 days if international)]. **Late submission will be rejected.**

The procuring entity is not responsible for any cost of preparing the EoI and **reserves the right to accept or reject** any or all EoIs without assigning any reason. A **short-list of 4–7** firms will be prepared.

[Name, designation, address, phone, e-mail — signed]`,
    keys: ['Expressions of Interest', 'Background and objective', 'Scope', 'joint venture', 'jointly and severally liable', 'Quality and Cost Based Selection', 'average annual turnover', 'similar experience', '14 days', 'Late submission will be rejected', 'reserves the right to accept or reject', 'short-list of 4–7'],
    lists: ['l-eoi-contents', 'l-eoi-criteria'],
    src: 'IA sir RHD EoI notice; PPA s.39, 54–56; PPR r.113–115, Sch II',
  },
  {
    id: 'a-terms-compare',
    topic: T,
    q: 'Compare the terminologies used for procurement of intellectual services as opposed to works and goods.',
    seen: ['2021-22'],
    a: `### Terms (class table)
| Works and Goods | Intellectual Services |
|---|---|
| **Prequalification (not mandatory)** | **Expression of Interest (EoI) (mandatory)** |
| **Tender** | **Proposal** |
| **TEC** | **PEC** (Proposal Evaluation Committee) |
| **TOC** | **POC** (Proposal Opening Committee) |
| **Tender Security** | **No security** (indemnity / insurance instead, PPA s.14(d)) |
| **Contractor / Supplier** | **Consultant** |

### Other differences (PPA / PPR)
| Works and goods | Intellectual and professional services |
|---|---|
| Invitation for Tender (IFT) | **Request for Proposal (RFP)** to short-listed firms only |
| Tender document | RFP document |
| Specifications, drawings, BoQ | **Terms of Reference (TOR)** |
| Instructions to Tenderers (ITT) | Instructions to Consultants (ITC) |
| Tender Data Sheet (TDS) | **Proposal Data Sheet (PDS)** |
| Pre-tender meeting | Pre-proposal meeting |
| One sealed tender | Two sealed envelopes (technical, financial) in one |
| Lowest evaluated responsive tenderer wins | Highest combined score (QCBS) / best within budget (FBS) / lowest above threshold (LCS) |
| **No negotiation** | **Negotiation** with the first-ranked |
| Post-qualification | Short-listing + negotiation |
| Unit-rate (BoQ) or lump-sum contract | Time-based or lump-sum contract |`,
    keys: ['Prequalification (not mandatory)', 'Expression of Interest', '(mandatory)', 'Proposal', 'Proposal Evaluation Committee', 'Proposal Opening Committee', 'No security', 'Consultant', 'Request for Proposal', 'Terms of Reference', 'Proposal Data Sheet', 'No negotiation'],
    lists: ['l-svc-terms', 'l-rfp-parts'],
    src: 'PPA s.2, 14(d), 49, 54–60; PPR r.116–125; TF p.18 (Important for TF); typed note Ques-11',
  },
  {
    id: 'a-qcbs-method',
    topic: T,
    q: 'How does QCBS work? Show how technical and financial scores are combined (method and formula).',
    seen: ['2022-23', '2020-21', '2016-17', '2014-15', '2011-12'],
    a: `### Method (PPR r.105, 117(24), 119–122)
1. **Technical evaluation** — the PEC scores each technical proposal out of 100 (specific experience, methodology and work plan, key staff, transfer of knowledge, national participation); the score is the average of the members.
2. **Qualifying mark** — a firm below the qualifying technical score given in the RFP (PPR default **70**) is non-responsive; its financial proposal is **returned unopened**.
3. **Financial score** — the lowest financial offer Fm gets 100, the others pro rata: **Fs = 100 × Fm / F**.
4. **Combined score** — Ts × T + Fs × P, with T + P = 100% (up to **80 : 20**, i.e. **0.8 Ts + 0.2 Fs**; down to 50 : 50 for standard services).
5. **Ranking** — the **highest combined score** is ranked 1st. N.B. If the Combined Score of two consulting firms is the same, then the firm with the **greater Technical Score** will be selected as consultant.
6. **Next step** — technical report approved → financial proposals opened in public → **negotiation with the highest-ranked firm**; if it fails, the next one → approval → NOA and contract.

### Example (class note, technical 80% : financial 20%)
| Name of the firm | Ts (100) | Financial offer | Fs | Combined score (0.8 Ts + 0.2 Fs) | Ranking |
|---|---|---|---|---|---|
| A | 85 | 10 | 100 | 68 + 20 = 88 | 3rd |
| B | 72 (×) | — | — | — | — |
| C | 95 | 15 | (10 / 15) × 100 = 66.67 | 76 + 13.33 = 89.33 | 2nd |
| D | 90 | 11 | (10 / 11) × 100 = 90.91 | 72 + 18.18 = 90.18 | 1st |

B is below the qualifying mark, so its financial proposal is not opened. **D is selected.**

### Example 2 (senior notes' “2018-19” paper): technical 90% : financial 10%, qualifying 75
| Name of the firm | Ts (100) | Financial offer (Tk lakh) | Fs | Combined score (0.9 Ts + 0.1 Fs) | Ranking |
|---|---|---|---|---|---|
| A | 80 | 100 | 100 | 72 + 10 = 82 | 2nd |
| B | 70 (×) | — | — | — | — |
| C | 90 | 140 | (100 / 140) × 100 = 71.43 | 81 + 7.14 = 88.14 | 1st |
| D | 76 | 110 | (100 / 110) × 100 = 90.91 | 68.4 + 9.09 = 77.49 | 3rd |

**C is selected.**`,
    keys: ['Technical evaluation', 'Qualifying mark', 'returned unopened', 'Financial score', 'Fs = 100 × Fm / F', 'Combined score', '0.8 Ts + 0.2 Fs', '80 : 20', 'highest combined score', 'greater Technical Score', 'negotiation with the highest-ranked firm', 'is selected'],
    lists: ['l-qcbs-tech-criteria', 'l-negotiation-items'],
    src: 'PPR r.105, 117(24)–(27), 119–122; typed note Ques-13 (8-step + example table) and Ques-14 (N.B., VVI for Term Final); TF p.19–20',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
