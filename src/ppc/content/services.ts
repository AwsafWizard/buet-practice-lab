// pc-services — procurement of intellectual & professional services: methods, selection steps, EoI,
// terminology, TOR/RFP, QCBS scoring (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-services).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-services' as const

const lists: PcList[] = [
  {
    id: 'l-services-methods',
    topic: T,
    title: 'Methods for procuring intellectual and professional services',
    ask: 'Name the different methods for procurement of intellectual services (PPA 2006).',
    points: [
      { k: 'Quality and Cost Based Selection (QCBS)', alt: ['QCBS'], d: 'Preferred (s.37(a)); quality and probable cost judiciously; most cases.' },
      { k: 'Fixed Budget Selection (FBS / SFB)', alt: ['FBS', 'SFB', 'fixed budget'], d: 'Preferred (s.37(b)); simple, precisely defined assignment; budget fixed.' },
      { k: 'Least Cost Selection (LCS)', alt: ['LCS', 'least cost'], d: 'Standard/routine assignments within threshold (audits, non-complex designs).' },
      { k: 'Community Service Organisation selection', alt: ['CSO', 'NGO'], d: 'Community needs and participation paramount.' },
      { k: 'Single Source Selection (SSS)', alt: ['SSS', 'single source'], d: 'Continuation, small value, emergency, only one qualified firm.' },
      { k: 'Individual Consultant Selection', alt: ['ICS', 'SIC', 'individual consultant'], d: 'Individual’s qualification paramount, no team needed.' },
      { k: 'Qualification Based Selection (QBS / SBCQ)', alt: ['QBS', 'SBCQ', 'qualifications based'], d: 'Low value; full competitive proposals not justified.' },
      { k: 'Design Contest Selection', alt: ['DC', 'design contest'], d: 'Technical excellence and innovation prime.' },
    ],
    hook: 'Two preferred (Quality+Cost, Fixed budget) + six others “Little Children Sing In Quiet Dens” — LCS, CSO, SSS, Individual, QBS, Design contest (PPA s.38 (a)–(f) order).',
    seen: ['2023-24', 'May 2024', '2014-15'],
    src: 'PPA 2006 s.37–38; PPR r.103–112; IA sir “Steps” slide p3',
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
    seen: ['2023-24', 'May 2024', '2014-15'],
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
    seen: ['May 2024'],
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
    seen: ['2021-22'],
    src: 'PPR r.117(3)',
  },
]

const cards: PcCard[] = [
  { id: 'c-svc-preferred', topic: T, front: 'Which two methods are “preferred” for intellectual services?', back: '**QCBS** — used in most cases, quality of proposal and cost of services (PPR r.103(4)(a)); **SFB/FBS** — only when the assignment is simple, precisely defined and the budget fixed. Both **preceded by short-listing** (PPA s.37). Others need HOPE approval (s.38).', src: 'PPA s.37–38; PPR r.103' },
  { id: 'c-svc-quality-first', topic: T, front: 'Why is quality the prime consideration in consultancy?', back: 'If cost predominates, the quality of services “often ends up being inferior”, causing rework or less economical solutions — so cost is “considered judiciously” (PPR r.103(1)–(2)).', src: 'PPR r.103' },
  { id: 'c-svc-shortlist', topic: T, front: 'Short-list size and rules?', back: '**Not less than 4 and not more than 7**, preferably **6** (PPA s.56(2); PPR Sch II). International: ≤ 2 firms from one country, ≥ 1 from a developing country. EoIs judged on a scale Excellent / Very good / Good / Poor (not marks).', src: 'PPA s.56; PPR r.115, Sch II' },
  { id: 'c-svc-eoi-time', topic: T, front: 'Minimum time for EoI and for proposals?', back: 'EoI: **14 days** national, **21 days** international. Proposals: **28 days** national, **42 days** international (PPR Sch II 113(2), 117(19)).', src: 'PPR Sch II' },
  { id: 'c-svc-eoi-app', topic: T, front: 'What must an EoI application contain (PPA s.54(2))?', back: '(a) particulars of **professional staff**; (b) **financial and technical capability** to deliver the services; (c) **past experience** in providing the relevant services.', src: 'PPA s.54(2)' },
  { id: 'c-svc-two-env', topic: T, front: 'How are consultancy proposals submitted and opened?', back: 'Technical and financial proposals in **two sealed inner envelopes** in one sealed outer envelope; POC opens technical only; financial kept in safe custody (HOPE) until the technical evaluation is approved, then opened **in public** for qualified firms.', src: 'PPA s.57–59; PPR r.118, 120' },
  { id: 'c-svc-sf', topic: T, front: 'QCBS financial score formula?', back: '**Sf = 100 × Fm / F** — the lowest evaluated price Fm gets 100 points; others pro rata (PPR r.121(2): 1.0 M → 100, 1.2 M → 83.3, 1.5 M → 66.6).', src: 'PPR r.121(2)' },
  { id: 'c-svc-combined', topic: T, front: 'QCBS combined score?', back: '**S = St × T + Sf × P**, with T + P = 100% (e.g. 80:20). PPR example: 90 points × 80% = 72. Highest combined score is invited for negotiation.', src: 'PPR r.121' },
  { id: 'c-svc-weights', topic: T, front: 'QCBS weights and minimum technical score in PPR?', back: 'Quality up to **80%**, price 20% (multidisciplinary, feasibility, management studies); standard services 65:35, 60:40, 55:45 or 50:50. Minimum technical points **70**; below it the financial proposal is **returned unopened**.', src: 'PPR r.117(24)' },
  { id: 'c-svc-winner', topic: T, front: 'Who is invited to negotiate under QCBS, FBS and LCS?', back: 'QCBS: **highest combined score**. FBS: **highest technical score within the budget** (over-budget proposals rejected). LCS: **lowest price** among those passing the technical threshold (PPA s.59(3); PPR r.122(1)).', src: 'PPA s.59(3); PPR r.106–107, 122' },
  { id: 'c-svc-nego-rule', topic: T, front: 'Negotiation rules with consultants?', back: 'One firm at a time — fail → next ranked (PPA s.60(2)); no change to quoted **staff remuneration rates**; TOR not significantly altered; agreed minutes signed and draft contract initialled.', src: 'PPA s.60; PPR r.122, 125' },
  { id: 'c-svc-no-ps', topic: T, front: 'Do consultants give proposal or performance security?', back: '**No** — PPA s.14(d); PPR r.125(4). Instead the RFP specifies indemnities/insurance and obliges the consultant to **re-perform at its own cost or indemnify** the PE.', src: 'PPA s.14(d); PPR r.125(4)–(5)' },
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
    seen: ['2023-24', 'May 2024', '2014-15'],
    a: `### Preferred methods (PPA s.37) — preceded by short-listing
1. **Quality and Cost Based Selection (QCBS)** — competitive process among short-listed consultants considering **quality and the probable cost** judiciously; used in most cases. *e.g. detailed design and supervision of a highway.*
2. **Fixed Budget Selection (FBS / SFB)** — **simple and precisely defined** assignment with a **fixed budget** stated in the RFP; best technical proposal within the budget. *e.g. a feasibility study with a fixed allocation.*

### Other methods (s.38) — with HOPE approval, reasons recorded
3. **Least Cost Selection (LCS)** — **standard or routine** services within the threshold (≤ Tk 5 million): audits, non-complex designs; lowest price above the technical threshold.
4. **Community Service Organisation (CSO) selection** — where knowledge of **community needs**, local issues and participation are paramount (NGOs). *e.g. community mobilisation for rural water supply.*
5. **Single Source Selection (SSS)** — **continuation** of ongoing/just-completed work, low-value small jobs, **emergency**, only one firm qualified, catastrophe. *e.g. design by the firm that did the feasibility study.*
6. **Individual Consultant Selection** — the individual's **qualification and experience are paramount**, no team needed. *e.g. procurement specialist.*
7. **Qualification Based Selection (QBS / SBCQ)** — **low value**, preparing and evaluating competitive proposals not justified. *e.g. short high-level legal advice.*
8. **Design Contest** — **technical excellence and innovation** are prime. *e.g. architectural design of a national monument.*

Prime consideration is the quality of the technical proposal; if cost dominates, quality suffers (PPR r.103).`,
    keys: ['Quality and Cost Based Selection', 'quality and the probable cost', 'Fixed Budget Selection', 'simple and precisely defined', 'fixed budget', 'Least Cost Selection', 'standard or routine', 'community needs', 'Single Source Selection', 'continuation', 'emergency', 'Individual Consultant', 'Qualification Based Selection', 'low value', 'Design Contest', 'technical excellence'],
    lists: ['l-services-methods', 'l-sss-cases'],
    src: 'PPA s.37–38; PPR r.103–112, Sch II',
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
8. **Negotiate with the top-ranked firm** on methodology, work plan, staffing, inputs; if it fails, the next — never two at once (s.60).

### Contracting
9. Approval → **issue NOA and sign contract** (no complaint pending); notify unsuccessful firms (s.61–63).`,
    keys: ['Expression of Interest', 'advertise the request for EoI', 'short-list of 4–7', 'Issue RFP', 'technical and financial proposals', 'PEC evaluates technical proposals', 'Financial proposals', 'Combine technical and financial scores', 'Negotiate with the top-ranked firm', 'sign contract'],
    lists: ['l-consultant-steps'],
    src: 'IA sir QCBS steps slide; PPA s.54–63; PPR r.105, 113–126',
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
    a: `| Works and goods | Intellectual and professional services |
|---|---|
| **Tender** | **Proposal** (technical + financial) |
| Tenderer; **contractor** / supplier | Applicant; **consultant** |
| Prequalification (optional) | **Expression of Interest** → **short-list** |
| Invitation for Tender (IFT) | **Request for Proposal (RFP)** to short-listed firms |
| Tender document | RFP document |
| Specifications, drawings, BoQ | **Terms of Reference (TOR)** |
| Instructions to Tenderers (ITT) | Instructions to Consultants (ITC) |
| Tender Data Sheet (TDS) | **Proposal Data Sheet (PDS)** |
| Tender Opening / Evaluation Committee (TOC / TEC) | Proposal Opening / Evaluation Committee (**POC / PEC**) |
| Pre-tender meeting | Pre-proposal meeting |
| Tender security; performance security | **No proposal or performance security**; indemnity / insurance |
| One sealed tender | Two sealed envelopes (technical, financial) in one |
| Lowest evaluated responsive tenderer wins | Highest combined score (QCBS) / best within budget (FBS) / lowest above threshold (LCS) |
| **No negotiation** | **Negotiation** with the first-ranked |
| Post-qualification | Short-listing + negotiation |
| Unit-rate (BoQ) or lump-sum contract | Time-based or lump-sum contract |`,
    keys: ['Tender', 'Proposal', 'contractor', 'consultant', 'Expression of Interest', 'short-list', 'Request for Proposal', 'Terms of Reference', 'Proposal Data Sheet', 'POC / PEC', 'No proposal or performance security', 'No negotiation', 'Negotiation'],
    lists: ['l-rfp-parts'],
    src: 'PPA s.2, 14(d), 49, 54–60; PPR r.116–125',
  },
  {
    id: 'a-qcbs-method',
    topic: T,
    q: 'How does QCBS work? Show how technical and financial scores are combined (method and formula).',
    seen: ['May 2024', '2020-21', '2016-17', '2014-15', '2011-12'],
    a: `### Method (PPR r.105, 119–122)
1. **Technical evaluation** — PEC members score each technical proposal out of 100 (specific experience, methodology and work plan, key staff, transfer of knowledge, national participation); the score is the average of members.
2. **Qualifying mark** — proposals below the minimum technical score (PPR: **70**, or as stated in the RFP) are non-responsive; their **financial proposals are returned unopened**.
3. **Financial score** — the lowest evaluated price **Fm** gets 100; others pro rata: **Sf = 100 × Fm / F**.
4. **Combined score** — **S = St × T + Sf × P**, where T and P are the technical and financial weights (T + P = 100%; up to **80 : 20**, down to 50 : 50 for standard services).
5. **Ranking** — highest combined score is first; if equal, the technically stronger firm first.
6. **Next step** — technical report approved → financial proposals opened publicly → **negotiation with the highest-ranked firm**; if negotiation fails, the next one → approval → NOA and contract.

### Example (PPR r.121, 80 : 20)
| Firm | St | Price (Tk M) | Sf | 0.8 St | 0.2 Sf | S | Rank |
|---|---|---|---|---|---|---|---|
| X | 90 | 1.0 | 100.0 | 72.0 | 20.0 | 92.0 | 1 |
| Z | 95 | 1.5 | 66.7 | 76.0 | 13.3 | 89.3 | 2 |
| Y | 85 | 1.2 | 83.3 | 68.0 | 16.7 | 84.7 | 3 |

Always rank by the combined score S — not by price alone or by technical score alone.`,
    keys: ['Technical evaluation', 'Qualifying mark', '70', 'returned unopened', 'Financial score', 'Sf = 100 × Fm / F', 'Combined score', 'S = St × T + Sf × P', '80 : 20', 'highest combined score', 'negotiation with the highest-ranked firm'],
    lists: ['l-qcbs-tech-criteria', 'l-negotiation-items'],
    src: 'PPR r.105, 117(24)–(27), 119–122',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
