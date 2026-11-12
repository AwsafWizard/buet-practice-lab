// pc-law — Act vs Regulation, PPA 2006, PPR 2008, procurement plan, transparency (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-law).
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-law' as const

const lists: PcList[] = [
  {
    id: 'l-act-vs-reg',
    topic: T,
    title: 'Points that separate an Act from a Regulation',
    ask: 'Distinguish between an Act and a Regulation — name the points of difference.',
    points: [
      { k: 'Passed by Parliament, assented by President', alt: ['passed by parliament', 'president assent'], d: 'An Act is made directly by the Houses of Parliament; a Regulation by a body Parliament delegated the power to.' },
      { k: 'Primary legislation', alt: ['highest form of law'], d: 'The Act is the highest form of law in the land; a Regulation is secondary legislation.' },
      { k: 'Delegated power', alt: ['delegated legislation', 'secondary legislation'], d: 'A Regulation is made by the Minister/authority to whom Parliament delegated rule-making power.' },
      { k: 'What vs how', alt: ['sets out how act implemented', 'implemented and enforced'], d: 'The Act sets the framework (what must be done); the Regulation sets out how it will be implemented and enforced.' },
      { k: 'Amended without re-passing the Act', alt: ['altered by minister', 'easy to change'], d: 'Regulations can be altered without the whole Act being passed again by Parliament.' },
      { k: 'Regulation sits under the Act', alt: ['less powerful', 'subordinate'], d: 'Not nearly as powerful as an Act; enforceable because it tells how the law will be implemented.' },
    ],
    seen: ['2023-24', '2017-18', '2011-12'],
    src: 'IA sir slides L1 p4–5; OneNote Lecture 06',
  },
  {
    id: 'l-ppa-scope',
    topic: T,
    title: 'Areas to which PPA 2006 applies (s.3(2))',
    ask: 'Describe the scope of applicability of PPA-2006.',
    points: [
      { k: 'Procuring entity using public funds', alt: ['public funds'], d: 's.3(2)(a): goods, works or services bought by any procuring entity with public funds.' },
      { k: 'Government, semi-government, statutory bodies', alt: ['statutory body', 'semi-government'], d: 's.3(2)(b): any government, semi-government or statutory body established under any law.' },
      { k: 'Companies Act company using public funds', alt: ['companies act 1994', 'company'], d: 's.3(2)(c): a company registered under the Companies Act 1994 using public funds.' },
      { k: 'Loan, credit or grant agreement', alt: ['development partner', 'foreign aid'], d: 's.3(2)(d): procurement under a development-partner agreement; the agreement prevails if it conflicts.' },
    ],
    seen: ['2011-12'],
    src: 'PPA 2006 s.3',
    note: 'Also say: extends to the whole of Bangladesh (s.3(1)); the Act overrides other laws (s.4).',
  },
  {
    id: 'l-pplan-purpose',
    topic: T,
    title: 'Purposes of a procurement plan',
    ask: 'What is the purpose of having a procurement plan?',
    points: [
      { k: 'Keep transparency', alt: ['transparency', 'published plan'], d: 'Plan is published (notice board, website, CPTU) so everyone knows what will be bought and how.' },
      { k: 'Organise the whole year’s procurement', alt: ['organized', 'pack off the whole year'], d: 'All packages planned ahead; no improper splitting (PPR r.17).' },
      { k: 'Choose the method in advance', alt: ['procurement method', 'select method'], d: 'Method decided per package by nature and size (PPR r.15).' },
      { k: 'Competitive, better participation of bidders', alt: ['competition', 'better participation'], d: 'Bidders know what is coming and take part.' },
      { k: 'Bidders get sufficient preparation time', alt: ['sufficient preparation', 'enough time'], d: 'Tenderers can prepare in time.' },
      { k: 'Lessen cost, increase efficiency', alt: ['reduce cost', 'efficiency', 'fund flow'], d: 'Timing matched to the fund flow and project schedule, so funds do not lapse.' },
      { k: 'Fix responsibility and approving authority', alt: ['approving authority', 'responsibility'], d: 'Each package names who approves the award.' },
      { k: 'Monitor progress (planned vs actual)', alt: ['monitoring', 'does not go astray', 'slippage'], d: 'Updated quarterly; slippage caught early so procurement “does not go astray” (PPR Sch V).' },
    ],
    hook: 'Two lists to fuse: the teacher’s five (Transparency, Organised, Participation, Preparation, Cost) + PPR’s three (Method, Authority, Monitor). “TOPPC + MAM”.',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    src: 'IA sir assignment sample (Procurement Plan-Example p1); PPR r.15–17, Sch V Part B; senior note Q1',
  },
  {
    id: 'l-pplan-columns',
    topic: T,
    title: 'Information columns of the Annual Procurement Plan',
    ask: 'In a tabular format show what information is to be disclosed in a procurement plan (columns, in order).',
    points: [
      { k: 'Package No.', alt: ['package number'], d: 'GD1, WD1, SD1 …' },
      { k: 'Description of procurement package', alt: ['description'], d: 'In quantifiable terms.' },
      { k: 'Unit and quantity', alt: ['quantity'], d: 'e.g. 01, 7 km, 35 nos.' },
      { k: 'Procurement method and type', alt: ['method', 'OTM NCT'], d: 'OTM / LTM / RFQ / DPM; NCT or ICT.' },
      { k: 'Contract approving authority', alt: ['approving authority', 'HOPE'], d: 'e.g. HOPE.' },
      { k: 'Source of funds', alt: ['GOB', 'funds'], d: 'GOB, own funds or development partner.' },
      { k: 'Estimated cost', alt: ['estd cost', 'cost in lakh'], d: 'Tk lakh (DUET form) or Tk million (PPR Sch V).' },
      { k: 'Time code: planned dates, planned days, actual dates', alt: ['time code', 'planned dates'], d: 'Three rows for every package.' },
      { k: 'Invite / advertise tender', alt: ['advertise tender', 'invitation'], d: 'Planned days always 0.' },
      { k: 'Tender opening', alt: ['opening'] },
      { k: 'Tender evaluation', alt: ['evaluation'] },
      { k: 'Approval to award', alt: ['approval'] },
      { k: 'Notification of award', alt: ['NOA'] },
      { k: 'Signing of contract', alt: ['contract signing'] },
      { k: 'Total time to contract signature', alt: ['total time'] },
      { k: 'Time for completion of contract', alt: ['completion'] },
    ],
    ordered: true,
    hook: 'Two halves: WHAT (package, description, quantity, method, authority, funds, cost) then WHEN — "A-O-E-A-N-S": Advertise, Open, Evaluate, Approve, NOA, Sign, then totals.',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    src: 'IA sir Procurement Plan-Example p2 (DUET APP FY 2019-20); PPR Sch V',
    note: 'The DUET form numbers columns 1, 2, 4 … 18 (no 3, no 10); the question bank renumbers them 1–16. Content is the same.',
  },
  {
    id: 'l-ppa-transparency',
    topic: T,
    title: 'PPA provisions that ensure transparency',
    ask: 'Describe the provisions of PPA that would ensure transparency of a procurement process.',
    points: [
      { k: 'Public accessibility of Act and rules (s.9)', alt: ['public accessibility', 's.9'] },
      { k: 'Communications in writing (s.10)', alt: ['in writing'] },
      { k: 'Procurement plan published (s.11)', alt: ['publish plan'] },
      { k: 'Standard documents (s.12)', alt: ['standard tender documents'] },
      { k: 'Same information, pre-disclosed criteria (s.13)', alt: ['pre-disclosed criteria', 'equal information'] },
      { k: 'OTM preferred; reasons recorded (s.31–32)', alt: ['open tendering', 'reasons recorded'] },
      { k: 'Advertisement in Bangla and English dailies (s.40)', alt: ['advertisement', 'newspaper'] },
      { k: 'Public tender opening (s.47)', alt: ['public opening'] },
      { k: 'Committee with outside members (s.7)', alt: ['evaluation committee', 'outside members'] },
      { k: 'No negotiation, no lottery (s.49)', alt: ['no negotiation'] },
      { k: 'Publication of NOA; debriefing (s.21)', alt: ['publish award', 'debriefing'] },
      { k: 'Records and post review (s.23–24)', alt: ['records', 'post review'] },
      { k: 'Complaints and Review Panel (s.29–30)', alt: ['complaint', 'review panel'] },
      { k: 'Misconduct and debarment (s.64)', alt: ['corrupt practice', 'debarment'] },
      { k: 'e-GP (s.65)', alt: ['electronic procurement'] },
    ],
    seen: ['Jan 2021'],
    src: 'PPA 2006 ss.7, 9–13, 21, 23–24, 29–31, 40, 47, 49, 64–65',
  },
]

const cards: PcCard[] = [
  { id: 'c-law-ppa-basic', topic: T, front: 'PPA 2006 — Act number, dates, administering authority?', back: 'Act No. 24 of 2006, assented 6 July 2006, effective 31 January 2008. Administered (with PPR 2008) by the **Central Procurement Technical Unit (CPTU)**, IMED, Ministry of Planning.', src: 'PPA s.1; IA sir slides L1 p6' },
  { id: 'c-law-ppa-purpose', topic: T, front: 'What is the stated purpose of PPA 2006 (preamble)?', back: 'Procedures for ensuring **transparency and accountability** in procurement of goods, works or services using **public funds**, and **equitable treatment and free and fair competition** among all who wish to participate.', src: 'PPA preamble' },
  { id: 'c-law-override', topic: T, front: 'If another law conflicts with PPA 2006, which wins?', back: '**PPA** — s.4 “Act to override other laws”. Exception: a development-partner loan/grant agreement prevails over the Act where it conflicts (s.3(2)(d)); national security/defence may be excluded by Government (s.68(2)).', src: 'PPA s.3–4, 68' },
  { id: 'c-law-rules-power', topic: T, front: 'Under which section are the Public Procurement Rules made?', back: 'PPA **s.70** — Government makes rules by notification in the Official Gazette. PPR 2008 replaced the Public Procurement Regulations 2003 (s.73(3)).', src: 'PPA s.70, 73' },
  { id: 'c-law-egp-prevails', topic: T, front: 'PPR vs e-GP rules — which prevails in an e-GP procurement?', back: 'The **e-GP rules** prevail (PPR r.128(2)).', src: 'PPR r.128' },
  { id: 'c-law-goods', topic: T, front: 'Define “goods” (PPA).', back: 'Raw materials, products, equipment and objects in solid, liquid or gaseous form, electricity, and related services **if their value does not exceed that of the goods**.', src: 'PPA s.2(11)' },
  { id: 'c-law-works', topic: T, front: 'Define “works” (PPA).', back: 'Construction, reconstruction, site preparation, demolition, repair, maintenance or renovation of roads, railways, buildings, infrastructure… plus physical services ancillary to works if their value does not exceed that of the works.', src: 'PPA s.2(37)' },
  { id: 'c-law-services', topic: T, front: 'Physical services vs intellectual & professional services?', back: '**Physical services** have measurable outputs (O&M, surveys, drilling, security, catering). **Intellectual & professional services** are performed by consultants — advisory, design, supervision or transfer of know-how. Works and goods are “physical”; consultancy is “intellectual” (class note).', src: 'PPA s.2(14),(18); OneNote' },
  { id: 'c-law-pplan-def', topic: T, front: 'What is a procurement plan?', back: 'The procuring entity’s **approved, published** list of everything it will procure in a project/financial year — package, method, approving authority, source of funds, estimated cost and target dates. Mandatory for all PEs (PPR r.16(1)); PPA s.11.', src: 'PPA s.11; PPR r.16' },
  { id: 'c-law-pplan-who', topic: T, front: 'Who approves the annual procurement plan, and how often is it updated?', back: 'Approved by the **Head of the Procuring Entity** (or an officer he authorises). Updated at the start of each financial year and **quarterly** for the PE’s own use.', src: 'PPA s.11(3); PPR r.16(5),(7),(10)' },
  { id: 'c-law-pplan-dev-rev', topic: T, front: 'Development vs revenue budget — what plans are prepared?', back: 'Development project: a **Total Procurement Plan** for the whole project (attached to the DPP/TPP) plus an updated annual plan. Revenue budget: only an **annual** procurement plan.', src: 'PPR r.16(3)–(6)' },
  { id: 'c-law-split', topic: T, front: 'Can a single procurement be split into packages?', back: 'Not generally — never to avoid a method or a higher approval. Allowed on justifiable grounds with HOPE approval; usually ≤ **5 lots** per package; the authority competent for the sum total approves each package.', src: 'PPA s.11(5)–(6); PPR r.17' },
  { id: 'c-law-pplan-cptu', topic: T, front: 'When must a procurement plan be posted to CPTU?', back: 'For packages ≥ **Tk 10 million** (works, goods) and ≥ **Tk 5 million** (physical and intellectual services).', src: 'PPR Sch II r.16(11)' },
  { id: 'c-law-public-funds', topic: T, front: 'What are “public funds”?', back: 'Funds allocated to a procuring entity under the Government budget, or loans, grants and credits placed at its disposal through the Government by development partners or foreign states.', src: 'PPA s.2(23)' },
  { id: 'c-law-hope', topic: T, front: 'Who is the HOPE?', back: '**Head of the Procuring Entity**: Secretary of a Ministry/Division, head of a Department/Directorate, Divisional Commissioner, Deputy Commissioner, or Chief Executive of an autonomous body, corporation or company.', src: 'PPA s.2(13)' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-act-vs-reg',
    topic: T,
    q: 'Distinguish between an Act and a Regulation.',
    seen: ['2023-24', '2017-18', '2011-12'],
    a: `Act (law) and regulation are the two legislative terms.

| | Act (Law) | Regulation (Rules) |
|---|---|---|
| Made by | **Passed directly by the Houses of Parliament**, President has assented | A body/Minister to which Parliament has **delegated the power** |
| Rank | **Primary legislation** — the highest form of law in the land | **Secondary legislation** — sits under the Act, not nearly as powerful |
| Content | Broad binding rule; the overarching legal framework — **what** must be done | Specific directive; technical details — **how** the Act will be **implemented and enforced** |
| Change | Only by Parliament | **Altered without the need for the whole Act to be passed** again |
| Example | Public Procurement Act (**PPA**) 2006 | Public Procurement Rules (**PPR**) 2008 |

Civil example: an Environmental Protection Act says construction sites must not pollute rivers; the regulation fixes how many litres of concrete runoff are allowed per day.

A regulation is enforceable because it tells how a law will be implemented.`,
    keys: ['Parliament', 'President', 'primary legislation', 'secondary legislation', 'delegated the power', 'implemented and enforced', 'altered without', 'PPA', 'PPR'],
    lists: ['l-act-vs-reg'],
    src: 'IA sir slides L1 p4–5; OneNote Lecture 06',
  },
  {
    id: 'a-ppa-ppr-function',
    topic: T,
    q: 'Explain the functionality of PPA 2006 and PPR 2008.',
    seen: ['2017-18'],
    a: `### PPA 2006 — the Act (what)
1. **Purpose** — procedures for **transparency and accountability** in procurement of goods, works and services using public funds, with equal treatment and free and fair competition.
2. **Scope** — whole of Bangladesh; every procuring entity using public funds (s.3); overrides other laws (s.4).
3. **Principles** — procurement plan (s.11), standard documents (s.12), validity and securities (s.14), specifications (s.15), confidentiality (s.18).
4. **Methods** — OTM preferred (s.31), other methods with HOPE approval (s.32), international (s.33–34), intellectual services (s.37–39).
5. **Processing** — advertisement (s.40), opening, evaluation, post-qualification, NOA, contract (s.44–63).
6. **Accountability** — complaints and Review Panel (s.29–30), misconduct (s.64), **e-GP** (s.65).

### PPR 2008 — the Rules (how)
1. Made under **s.70**; details how the Act is implemented.
2. Committees (TOC, TEC/PEC), **thresholds and time limits** (Schedule II), flow charts (Sch III), checklists (Sch IV).
3. Procurement plan formats (Sch V), NOA format (Sch VII), use of **CPTU standard documents**.
4. Step-by-step rules for each method, evaluation (r.98), post-qualification (r.100), NOA (r.102), consultants (r.103–126).

Both are administered by the **Central Procurement Technical Unit (CPTU)**.`,
    keys: ['transparency and accountability', 'public funds', 'whole of Bangladesh', 'OTM', 'e-GP', 's.70', 'thresholds and time limits', 'CPTU standard documents', 'Central Procurement Technical Unit'],
    lists: ['l-ppa-scope'],
    src: 'PPA 2006; PPR 2008; IA sir slides L1 p6',
  },
  {
    id: 'a-ppa-scope',
    topic: T,
    q: 'Describe the scope of applicability of PPA-2006.',
    seen: ['2011-12'],
    a: `PPA 2006 (Act No. 24 of 2006) **extends to the whole of Bangladesh** (s.3(1)). It applies to (s.3(2)):
1. **Procuring entity using public funds** — procurement of goods, works or services by any procuring entity.
2. **Government, semi-government or statutory body** established under any law.
3. **Company registered under the Companies Act 1994** using public funds.
4. **Loan, credit or grant agreement** with a development partner, foreign state or organisation — provided that if the agreement says otherwise, **the agreement shall prevail**.

Also: the Act **overrides other laws** (s.4); only national security or defence may be excluded by Government (s.68(2)). “Public funds” = Government budget allocations and loans/grants/credits placed through the Government.`,
    keys: ['whole of Bangladesh', 'public funds', 'statutory body', 'Companies Act 1994', 'loan, credit or grant', 'agreement shall prevail', 'overrides other laws'],
    lists: ['l-ppa-scope'],
    src: 'PPA 2006 s.2(23), 3, 4, 68',
  },
  {
    id: 'a-pplan-purpose',
    topic: T,
    q: 'What is a procurement plan and what is the purpose of having one?',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    a: `A **procurement plan** is the procuring entity’s approved, published annual plan of everything it will procure — package by package, with method, approving authority, source of funds, estimated cost and target dates. It is **mandatory** (PPR r.16; PPA s.11), approved by the **HOPE** and updated **quarterly**.

### Purposes
1. **Transparency** — the plan is published on notice boards, websites and with CPTU.
2. **Organises the whole year’s procurement** — packages fixed early; no improper splitting.
3. **Method chosen in advance** for each package by nature and size.
4. **Competitive participation** — bidders know what is coming.
5. **Sufficient preparation** time for tenderers.
6. **Lessens cost and increases efficiency** — timing matched to fund flow and project schedule; funds do not lapse.
7. **Fixes responsibility** — approving authority named.
8. **Monitoring tool** — planned vs actual dates, so procurement “does not go astray” and slippage is dealt with promptly.`,
    keys: ['procurement plan', 'mandatory', 'HOPE', 'quarterly', 'Transparency', 'Method chosen in advance', 'Competitive participation', 'Sufficient preparation', 'Lessens cost', 'Monitoring tool'],
    lists: ['l-pplan-purpose'],
    src: 'IA sir Procurement Plan-Example p1; PPA s.11; PPR r.15–17, Sch V',
  },
  {
    id: 'a-pplan-format',
    topic: T,
    q: 'In a tabular format show what information is to be disclosed in a procurement plan.',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    a: `### ANNUAL PROCUREMENT PLAN — FY 2019-2020
Ministry/Division: Ministry of Education · Agency: DUET · **Procuring Entity Name & Code**: DUET, 131005700 · Budget: Development

| Package No. | Description of Procurement Package (Goods/Works) | Quantity | Procurement Method & Type | Contract Approving Authority | Source of Funds | Estd Cost (Tk lakh) | Time Code for Process | Invite/Advertise Tender | Tender Opening | Tender Evaluation | Approval to Award | Notification of Award | Signing of Contract | Total time to Contract Signature | Time for Completion of Contract |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GD5 | Construction of Teachers and Students Centre, 5 storey, 5000 sq ft | 01 | OTM | HOPE | GOB | 3000.00 | Planned dates | 12 Sep 2019 | 27 Oct | 31 Oct | 07 Nov | 14 Nov | 12 Dec | – | – |
| | | | | | | | Planned days | 0 | 45 | 05 | 07 | 07 | 28 | 92 | 90 |
| | | | | | | | Actual dates | 09 Sep | 27 Oct | 04 Nov | 10 Nov | 13 Nov | 26 Nov | | |

Notes: one schedule each for Goods, Works and Services; advertising always “0” planned days; for works a **Pre-Qualification** column, for services **EoI → issue RFP** columns are added (PPR Sch V).`,
    keys: ['Package No.', 'Procurement Method', 'Contract Approving Authority', 'Source of Funds', 'Estd Cost', 'Time Code', 'Tender Opening', 'Notification of Award', 'Signing of Contract', 'Time for Completion'],
    lists: ['l-pplan-columns'],
    src: 'IA sir Procurement Plan-Example p2; PPR Sch V',
  },
  {
    id: 'a-ppa-transparency',
    topic: T,
    q: 'Describe the provisions of PPA that would ensure transparency of a procurement process.',
    seen: ['Jan 2021'],
    a: `PPA 2006 is an Act “for ensuring **transparency and accountability**”. Its provisions:
1. **Public accessibility** (s.9) — Act, rules and guidelines available to the public.
2. **Communications in writing** (s.10).
3. **Procurement plan published** (s.11(4)).
4. **Standard documents** prescribed by Government (s.12).
5. **Same information to all**, qualification and evaluation criteria **clearly stated** in the document, minimum time (s.13).
6. **Open Tendering Method preferred** (s.31); other methods only with HOPE approval and **reasons recorded** in a file (s.32).
7. **Advertisement** in at least one Bangla and one English daily, own website and CPTU website (s.40).
8. **Public opening** in the presence of tenderers; late tenders returned unopened (s.47).
9. **Evaluation committee** with outside members; declaration of impartiality; **pre-disclosed criteria**; no negotiation, no lottery (s.7, 48–49).
10. **Confidentiality** from opening to award; influencing = rejection (s.18).
11. **NOA published**; unsuccessful tenderer told its ranking and deficiencies (s.21).
12. **Records** kept; post-procurement review (s.23–24).
13. **Complaints** and appeal to the **Review Panel** (s.29–30).
14. **Professional misconduct** — corrupt, fraudulent, collusive, coercive practices punished, debarment (s.64); **e-GP** (s.65).`,
    keys: ['transparency and accountability', 'Public accessibility', 'in writing', 'Standard documents', 'reasons recorded', 'Advertisement', 'Public opening', 'pre-disclosed criteria', 'NOA published', 'Review Panel', 'e-GP'],
    lists: ['l-ppa-transparency'],
    src: 'PPA 2006',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
