// pc-law — Act vs Regulation, PPA 2006, PPR 2008, procurement plan, transparency (IA sir).
// Revised 13 Nov 2026 from CE301/Claude digests/v2_ia_solves.md and v2_ia_notes.md: the 18-batch term-final
// solve, Nafee bhai's note, this term's class annotations on the PPA and Assignments 1–3.
// IA sir wants statute text word for word, so the PPA sections are quoted from the English Act.
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-law' as const

const lists: PcList[] = [
  {
    id: 'l-act-vs-reg',
    topic: T,
    title: 'Points that separate an Act from a Regulation',
    ask: 'Distinguish between an Act and a Regulation — the eight rows of the table.',
    points: [
      { k: 'Brief outlook vs way implemented and enforced', alt: ['brief outlook of a law', 'implemented and enforced', 'what vs how'], d: 'Act shows a brief outlook of a law; Regulation sets out the way in which an Act will be implemented and enforced.' },
      { k: 'Updated through Parliament vs altered without re-passing', alt: ['updated through parliament', 'altered without the whole act passed again', 'passed by parliament'], d: 'An Act must be updated through Parliament; a Regulation can be altered without the need for the whole Act to be passed by the Parliament again.' },
      { k: 'Changing: difficult vs easy', alt: ['comparatively difficult', 'comparatively easy', 'easy to change'], d: 'Changing the Act is comparatively difficult; changing the regulation is comparatively easy.' },
      { k: 'Rules for guidance vs smaller clarifying rules', alt: ['set of rules for guidance', 'smaller rules', 'further clarification'], d: 'Act: a set of rules for guidance. Regulation: a set of smaller rules that go hand in hand with the Act for further clarification.' },
      { k: 'Standard document for public vs government gazette', alt: ['standard document for public', 'government gazette', 'gazette'], d: 'Act: a standard document for the public. Regulation: a government gazette.' },
      { k: 'Parent law vs supplementary', alt: ['parent law', 'supplementary', 'supplement'], d: 'Act is a parent law; Regulation is supplementary.' },
      { k: 'Primary vs secondary legislation', alt: ['primary legislation', 'secondary legislation', 'delegated legislation'], d: 'Act is primary legislation; Regulation is secondary legislation.' },
      { k: 'Breach enforceable in court vs not necessarily', alt: ['enforceable in court', 'not necessarily enforceable', 'liability'], d: 'Breaching an Act creates liability enforceable in court; breaching a regulation is not necessarily enforceable in court.' },
    ],
    hook: 'First words down the Act column: Outlook, Updated, Changing, Guidance, Document, Parent, Primary, Breach — “Our Uncle Can Give Dull Parents Proper Breaks”.',
    seen: ['2023-24', '2017-18', '2011-12'],
    src: '18-batch TF solve p.4; Nafee bhai note Ques-2 (8-row table); IA sir slides L1 p4–5',
    note: 'IA sir’s slide adds: an Act is passed directly by the Houses of Parliament and assented to by the President; a Regulation is made by a body to which Parliament has delegated the power. For 5 marks any five rows are enough.',
  },
  {
    id: 'l-ppa-scope',
    topic: T,
    title: 'Areas to which PPA 2006 applies (s.3(2))',
    ask: 'What is the applicability (scope) of the Public Procurement Act?',
    points: [
      { k: 'Any procuring entity using public funds', alt: ['public funds', 'procuring entity'], d: 's.3(2)(a): procurement of goods, works or services by any procuring entity using public funds.' },
      { k: 'Government, semi-government or statutory body', alt: ['statutory body', 'semi-government'], d: 's.3(2)(b): by any government, semi-government or any statutory body established under any law.' },
      { k: 'Companies Act 1994 company using public funds', alt: ['companies act 1994', 'company', 'DESCO', 'DPDC'], d: 's.3(2)(c): using public funds by a company registered under the Companies Act, 1994. Class example: DESCO, DPDC.' },
      { k: 'Loan, credit or grant agreement', alt: ['development partner', 'foreign state', 'foreign aid'], d: 's.3(2)(d): under an agreement with a development partner or a foreign state or organisation; the agreement prevails if it says otherwise. Sir: “extra added point” (added by amendment).' },
    ],
    seen: ['2011-12'],
    src: 'PPA 2006 s.3(2); annotated PPA p.6 (class question, “DESCO, DPDC”); 18-batch TF solve p.5 (asked in the CE 21 class test)',
    note: 'Also say: the Act extends to the whole of Bangladesh (s.3(1)) and overrides other laws (s.4). Nafee’s note heads this “Section 6” — it is section 3.',
  },
  {
    id: 'l-pplan-purpose',
    topic: T,
    title: 'Purposes of a procurement plan (as dictated in class)',
    ask: 'What is the purpose of having a procurement plan?',
    points: [
      { k: 'To inform the bidders well ahead', alt: ['inform bidders', 'inform the tenderer well ahead', 'sufficient preparation', 'enough time to prepare'], d: 'Tenderers know what is coming and get time to prepare.' },
      { k: 'To ensure transparency', alt: ['transparency', 'published plan'], d: 'The plan is approved and published for the information of all concerned (PPA s.11(4)).' },
      { k: 'To ensure better competition', alt: ['better competition', 'fair competition', 'competitive'], d: 'More tenderers can plan to take part, so competition is fair.' },
      { k: 'To ensure better participation', alt: ['better participation', 'fair participation'], d: 'Bidders are not surprised by a tender they could not prepare for.' },
      { k: 'To ensure lower cost', alt: ['lower cost', 'lessen cost', 'reduce cost', 'best use of public fund'], d: 'Planned contract types and delivery dates, and real competition, bring the cost down.' },
    ],
    hook: 'I-T-C-P-L: Inform, Transparency, Competition, Participation, Lower cost — “I Try Coffee, Pizza, Lassi”.',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    src: 'IA sir in class this term — annotated PPA p.8 beside s.11 (“1) To inform the bidders well ahead 2) To ensure transparency 3) To ensure better competition 4) Ensure better participation 5) Ensure lower cost”)',
    note: 'For a 10-mark answer add from the 18-batch solve: increase the efficiency, effectiveness and transparency of the whole process; specify how products or services will be acquired and how vendors will be managed; avoid surprises and last-minute considerations.',
  },
  {
    id: 'l-pplan-columns',
    topic: T,
    title: 'Information columns of the Annual Procurement Plan',
    ask: 'In a tabular format show what information is to be disclosed in a procurement plan (columns, in order).',
    points: [
      { k: 'Package No.', alt: ['package number', 'serial no'], d: 'After the serial number: GD1, WD1, BAIDP/14-15/G-01 …' },
      { k: 'Description of procurement package', alt: ['description'], d: 'Goods / works / services, in quantifiable terms.' },
      { k: 'Unit and quantity', alt: ['quantity', 'unit'], d: 'e.g. Package, 1; Lot, 1.' },
      { k: 'Procurement method and type', alt: ['method', 'OTM NCT', 'RFQ'], d: 'OTM / LTM / RFQ / DPM; NCT or ICT.' },
      { k: 'Contract approving authority', alt: ['approving authority', 'HOPE', 'project manager'], d: 'e.g. HOPE, Project Manager.' },
      { k: 'Source of funds', alt: ['GOB', 'funds'], d: 'GOB, own funds or development partner.' },
      { k: 'Estimated cost (Tk lakh)', alt: ['estd cost', 'cost in lakh'], d: 'Tk lakh in the LGED and DUET forms.' },
      { k: 'Time code: planned dates, planned days, actual dates', alt: ['time code', 'planned dates'], d: 'Full (DUET) form only: three rows for every package.' },
      { k: 'Invitation for tender', alt: ['advertise tender', 'invitation', 'IFT'], d: 'First indicative date. Planned days always 0.' },
      { k: 'Tender opening', alt: ['opening'], d: 'Full form.' },
      { k: 'Tender evaluation', alt: ['evaluation'], d: 'Full form.' },
      { k: 'Approval to award', alt: ['approval'], d: 'Full form.' },
      { k: 'Notification of award', alt: ['NOA'], d: 'Full form.' },
      { k: 'Signing of contract', alt: ['contract signing'], d: 'Second indicative date.' },
      { k: 'Total time to contract signature', alt: ['total time'], d: 'Full form.' },
      { k: 'Completion of contract', alt: ['completion', 'time for completion'], d: 'Third indicative date; then Remarks.' },
    ],
    ordered: true,
    hook: 'Two halves: WHAT (package, description, unit and quantity, method, authority, funds, cost) then WHEN — "A-O-E-A-N-S": Advertise, Open, Evaluate, Approve, NOA, Sign, then totals. The quick form keeps only three dates: Invitation, Signing, Completion.',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    src: 'IA sir Procurement Plan-Example p2 (DUET APP FY 2019-20); 18-batch TF solve p.6–7 and Nafee bhai note Ques-5 (LGED 13-column APP); PPR Sch V',
    note: 'Quick form the seniors write (13 columns): Serial No · Package No · Description of procurement package · Unit · Quantity · Procurement method and type · Contract approving authority · Source of funds · Estd. cost (Tk lakh) · Invitation for tender · Signing of contract · Completion of contract · Remarks.',
  },
  {
    id: 'l-ppa-transparency',
    topic: T,
    title: 'PPA provisions that ensure transparency',
    ask: 'Describe the provisions of PPA that would ensure transparency of a procurement process.',
    points: [
      { k: 'Procurement plan published (s.11)', alt: ['publish plan', 'annual procurement plan'], d: 'Tenderers know in advance what will be procured.' },
      { k: 'Open tendering preferred (s.31)', alt: ['open tendering', 'OTM', 'reasons recorded'], d: 'Transparency, equal competition, fair price, good value; other methods need approval and recorded reasons (s.32).' },
      { k: 'Advertisement in Bangla and English dailies (s.40)', alt: ['advertisement', 'newspaper'], d: 'At least one Bangla and one English daily newspaper of wide circulation.' },
      { k: 'Public tender opening (s.47)', alt: ['public opening', 'opened in public'], d: 'Opened by the TOC in the presence of tenderers; late tenders returned unopened.' },
      { k: 'e-GP (s.65)', alt: ['electronic procurement', 'e-government procurement'], d: 'Online processing through the portal run by CPTU.' },
      { k: 'Standard documents (s.12)', alt: ['standard tender documents'], d: 'Same rules and conditions for all tenderers.' },
      { k: 'Same information, pre-disclosed criteria (s.13)', alt: ['pre-disclosed criteria', 'equal information'], d: 'Evaluation only on criteria stated in the document.' },
      { k: 'Evaluation committee with outside members (s.7)', alt: ['evaluation committee', 'outside members', 'TEC'], d: 'Declaration of impartiality.' },
      { k: 'Publication of award; debriefing (s.21)', alt: ['publish award', 'debriefing', 'NOA published'] },
      { k: 'Complaints and Review Panel (s.29–30)', alt: ['complaint', 'review panel', 'appeal'] },
    ],
    hook: 'The 18-batch five by section number: 11 (plan), 31 (OTM), 40 (advertise), 47 (open in public), 65 (e-GP) — “plan, method, advertise, open, online”. Then documents, criteria, committee, award, complaints.',
    seen: ['Jan 2021'],
    src: 'Pallab’s 18-batch solve of Jan 2021 Q1(c) (ss.11, 31, 40, 47, 65); PPA 2006 ss.7, 12–13, 21, 29–30',
    note: 'Also in the Act: public accessibility (s.9), communications in writing (s.10), confidentiality (s.18), records and post review (s.23–24), no negotiation (s.49), misconduct and debarment (s.64).',
  },
]

const cards: PcCard[] = [
  { id: 'c-law-ppa-basic', topic: T, front: 'PPA 2006 — Act number, dates, administering authority?', back: 'Act No. 24 of 2006, assented 6 July 2006, effective 31 January 2008. Administered (with PPR 2008) by the **Central Procurement Technical Unit (CPTU)**, IMED, Ministry of Planning — the name sir uses; it has since become the **Bangladesh Public Procurement Authority (BPPA)** under the BPPA Act 2023.', src: 'PPA s.1; IA sir slides L1 p6; BPPA Act 2023 (Act 32 of 2023)' },
  { id: 'c-law-ppa-purpose', topic: T, front: 'What is the purpose of the Public Procurement Act? (class question)', back: '“An Act to provide for procedures to be followed for ensuring **transparency and accountability** in the procurement of goods, works or services using **public funds** and ensuring **equitable treatment** and **free and fair competition** among all persons wishing to participate in such procurement.” The 2025/2026 amendment adds value for money, efficiency, ethics, quality and sustainable procurement.', src: 'PPA 2006 preamble; annotated PPA (sir boxed “public fund”, “impartial”, “fair competition”); Nafee bhai note Ques-3(a)' },
  { id: 'c-law-procurement-def', topic: T, front: 'What is procurement? What is the legal framework of public procurement in Bangladesh, and who administers it?', back: 'Procurement = purchasing any goods, works or services through tender. Legal framework: **Public Procurement Act, 2006** and **Public Procurement Rules (Regulation), 2008**. Administered by **CPTU** (Central Procurement Technical Unit).', src: 'Nafee bhai note Ques-1; 18-batch TF solve p.4' },
  { id: 'c-law-cptu', topic: T, front: 'What is CPTU?', back: '**Central Procurement Technical Unit** — the agency responsible for **modernizing public procurement** processes and procedures in Bangladesh. It operates under the **IMED** (Implementation, Monitoring and Evaluation Division) of the **Ministry of Planning**. Goal: enhance **transparency, efficiency and effectiveness** in public procurement, for better use of public resources and good governance.', src: 'Nafee bhai note Ques-1(d); 18-batch TF solve, “extra questions discussed by Sir in class”' },
  { id: 'c-law-override', topic: T, front: 'If another law conflicts with PPA 2006, which wins?', back: '**PPA** — s.4 “Act to override other laws”. Exception: a development-partner loan/grant agreement prevails over the Act where it conflicts (s.3(2)(d)); national security/defence may be excluded by Government (s.68(2)).', src: 'PPA s.3–4, 68' },
  { id: 'c-law-rules-power', topic: T, front: 'Under which section are the Public Procurement Rules made?', back: 'PPA **s.70** — Government makes rules by notification in the Official Gazette. PPR 2008 replaced the Public Procurement Regulations 2003 (s.73(3)).', src: 'PPA s.70, 73' },
  { id: 'c-law-egp-prevails', topic: T, front: 'PPR vs e-GP rules — which prevails in an e-GP procurement?', back: 'The **e-GP rules** prevail (PPR r.128(2)).', src: 'PPR r.128' },
  { id: 'c-law-goods', topic: T, front: 'Define “goods” (PPA).', back: 'Raw materials, products, equipment and objects in solid, liquid or gaseous form, electricity, and related services **if their value does not exceed that of the goods**.', src: 'PPA s.2(11)' },
  { id: 'c-law-works', topic: T, front: 'Define “works” (PPA).', back: 'Construction, reconstruction, site preparation, demolition, repair, maintenance or renovation of roads, railways, buildings, infrastructure… plus physical services ancillary to works if their value does not exceed that of the works.', src: 'PPA s.2(37)' },
  { id: 'c-law-services', topic: T, front: 'Physical services vs intellectual & professional services?', back: '**Physical services** have measurable outputs (O&M, surveys, drilling, security, catering). **Intellectual & professional services** are performed by consultants — advisory, design, supervision or transfer of know-how. Works and goods are “physical”; consultancy is “intellectual” (class note).', src: 'PPA s.2(14),(18); OneNote' },
  { id: 'c-law-pplan-def', topic: T, front: 'What is a procurement plan?', back: 'An **annual plan** of a procuring entity, officially prepared for a year, of what it will procure: each package with its method, approving authority, source of funds, estimated cost and dates. Required by PPA s.11; **approved by the HOPE** and **published** for the information of all concerned.', src: 'Nafee bhai note Ques-5; PPA s.11; PPR r.16' },
  { id: 'c-law-pplan-who', topic: T, front: 'Who approves the annual procurement plan, and how often is it updated?', back: 'Approved by the **Head of the Procuring Entity** (or an officer he authorises). Updated at the start of each financial year and **quarterly** for the PE’s own use.', src: 'PPA s.11(3); PPR r.16(5),(7),(10)' },
  { id: 'c-law-pplan-dev-rev', topic: T, front: 'Development vs revenue budget — what plans are prepared?', back: 'Development project: a **Total Procurement Plan** for the whole project (attached to the DPP/TPP) plus an updated annual plan. Revenue budget: only an **annual** procurement plan.', src: 'PPA s.11(1)–(2); PPR r.16(3)–(6)' },
  { id: 'c-law-split', topic: T, front: 'Can a single procurement be split into packages?', back: 'Not generally — never to avoid a method or a higher approval. Allowed on justifiable grounds with HOPE approval; usually ≤ **5 lots** per package; the authority competent for the sum total approves each package.', src: 'PPA s.11(5)–(6); PPR r.17' },
  { id: 'c-law-pplan-cptu', topic: T, front: 'When must a procurement plan be posted to CPTU?', back: 'For packages ≥ **Tk 10 million** (works, goods) and ≥ **Tk 5 million** (physical and intellectual services).', src: 'PPR Sch II r.16(11)' },
  { id: 'c-law-public-funds', topic: T, front: 'What are “public funds”?', back: 'Funds allocated to a procuring entity under the Government budget, or loans, grants and credits placed at its disposal through the Government by development partners or foreign states.', src: 'PPA s.2(23)' },
  { id: 'c-law-hope', topic: T, front: 'Who is the HOPE?', back: '**Head of the Procuring Entity**: Secretary of a Ministry/Division, head of a Department/Directorate, Divisional Commissioner, Deputy Commissioner, or Chief Executive of an autonomous body, corporation or company.', src: 'PPA s.2(13)' },
  { id: 'c-law-s15', topic: T, front: 'PPA s.15(1) — how must technical specifications be prepared? (discussed in class)', back: '“For the purpose of creating **impartial and open competition** among tenderers … provide a **correct and complete description** of their **expected performance levels, the characteristics and required quality** ensuring that goods, works, services are procured accordingly; but it shall be ensured that such description are **not restrictive**.”', src: 'PPA 2006 s.15(1); Nafee bhai note Ques-16 (“Discussed by Sir in class”)' },
  { id: 'c-law-coi', topic: T, front: 'What is Conflict of Interest (PPA s.28)?', back: 'A person or organisation (and its affiliates) **previously engaged to provide intellectual and professional services** for the preparation or implementation of a project is **ineligible to supply goods, execute works or provide services** arising from that project. Not applicable to the contractor of a **turnkey or design and construction** contract.', src: 'PPA 2006 s.28; Nafee bhai note Ques-4' },
  { id: 'c-law-ppa-amend', topic: T, front: 'What did the Public Procurement (Amendment) Ordinance 2025 / Act 2026 change? (the points that touch this course)', back: 'Preamble adds **value for money, efficiency, ethics, quality, sustainable procurement**; s.31 gets the **significantly-low-price proviso**; s.32 adds **reverse auction** and rewords enlisted-firm LTM and one-stage two-envelope; s.36 **framework agreements**; s.65 **e-GP mandatory**; CPTU’s role goes to **BPPA**.', src: 'Ordinance No. 16 of 2025, re-enacted as Act No. 41 of 2026 (deemed in force from 28 Sep 2025); files in Ishtiaque sir/PPA/Bangla' },
]

const answers: PcAnswer[] = [
  {
    id: 'a-act-vs-reg',
    topic: T,
    q: 'Distinguish between an Act and a Regulation.',
    seen: ['2023-24', '2017-18', '2011-12'],
    a: `Act (law) and regulation are the two legislative terms. An **Act** is the law itself; a **Regulation** is the set of rules made under it.

| | Act | Regulation |
|---|---|---|
| 1 | Act shows a **brief outlook** of a law | Regulation sets out the way in which an Act will be **implemented and enforced** |
| 2 | It must be **updated through Parliament** | It can be **altered without** the need for the whole Act to be passed by the Parliament again |
| 3 | Changing the Act is **comparatively difficult** | Changing the regulation is **comparatively easy** |
| 4 | A **set of rules for guidance** | A set of **smaller rules** that go hand in hand with the Act for further clarification |
| 5 | It is a **standard document for public** | It is a **government gazette** |
| 6 | Act is a **parent law** | Regulation is **supplementary** |
| 7 | This is **primary legislation** | This is **secondary legislation** |
| 8 | Breaching an Act creates liability **enforceable in court** | Breaching a regulation is **not necessarily enforceable** in court |

(Breaching means violating the rules.)

From IA sir's slide: an Act is **passed directly by the Houses of Parliament** and the President has assented to it; a Regulation is made by a body or Minister to which Parliament has **delegated the power**. Example: the Public Procurement Act (**PPA**) 2006 is the Act; the Public Procurement Rules (**PPR**) 2008 are the regulation.

For 5 marks write any five rows.`,
    keys: ['brief outlook', 'implemented and enforced', 'updated through Parliament', 'altered without', 'comparatively difficult', 'comparatively easy', 'government gazette', 'parent law', 'supplementary', 'primary legislation', 'secondary legislation', 'enforceable in court'],
    lists: ['l-act-vs-reg'],
    src: '18-batch TF solve p.4; Nafee bhai note Ques-2; IA sir slides L1 p4–5 (the last paragraph)',
  },
  {
    id: 'a-ppa-ppr-function',
    topic: T,
    q: 'Explain the functionality of PPA 2006 and PPR 2008.',
    seen: ['2017-18'],
    a: `**PPA-2006 and PPR 2008 are the two legal frameworks** for public procurement in Bangladesh, under the administering authority **CPTU** (Central Procurement Technical Unit, IMED, Ministry of Planning).

### PPA 2006 — the Act (the parent law)
1. Provides the procedures to be followed for ensuring **transparency and accountability** in the procurement of goods, works or services using **public funds**.
2. Ensures **equitable treatment** and **free and fair competition** among all persons wishing to participate in such procurement.
3. Sets the scope (s.3), the principles (procurement plan s.11, specifications s.15), the **methods** (s.31–38), the committees, complaints and appeals, and **e-GP** (s.65).

### PPR 2008 — the Rules (the regulation)
1. **PPR provides regulations, aimed at ensuring objectivity in the procurement process, and to protect against fraud.**
2. Made by the Government under the Act (s.70); it gives the detailed way the Act is implemented.
3. Fixes the **threshold values and time limits**, the formation and duties of the opening and evaluation committees (TOC, TEC), and the use of the standard tender documents.

Thus **PPA says what must be done; PPR says how it shall be done.**`,
    keys: ['two legal frameworks', 'CPTU', 'transparency and accountability', 'public funds', 'equitable treatment', 'free and fair competition', 'e-GP', 'ensuring objectivity', 'protect against fraud', 'threshold values and time limits', 'what must be done'],
    lists: ['l-ppa-scope'],
    src: 'Pallab’s 18-batch solve of 2017-18 Q1(a); PPA 2006 preamble; typed note PYQ-1 (the closing line); PPA s.70',
  },
  {
    id: 'a-ppa-scope',
    topic: T,
    q: 'What is the purpose of the Public Procurement Act, and what is its scope of applicability?',
    seen: ['2011-12'],
    a: `### Purpose (preamble)
An Act to provide for procedures to be followed for ensuring **transparency and accountability** in the procurement of goods, works or services using **public funds** and ensuring **equitable treatment** and **free and fair competition** among all persons wishing to participate in such procurement including the matters incidental thereto.

### Scope of application — PPA 2006, section 3
(1) This Act **extends to the whole of Bangladesh**.

(2) This Act shall apply to the following areas, namely:

- (a) procurement of goods, works or services by **any procuring entity using public funds**;
- (b) procurement of goods, works or services by any **government, semi-government or any statutory body** established under any law;
- (c) procurement of goods, works or services using public funds by a **company registered under the Companies Act, 1994** (Act No. 18 of 1994) — class example: DESCO, DPDC;
- (d) procurement of goods, works or services under a **loan, credit or grant agreement** or under any other agreement with a development partner or with a foreign state or an organisation: Provided that if there is anything to the contrary in any such agreement entered into, **the provision of that agreement shall prevail**.

Clause (d) is the "extra added point" (inserted later by amendment). Section 4: the Act overrides other laws.`,
    keys: ['transparency and accountability', 'public funds', 'equitable treatment', 'free and fair competition', 'extends to the whole of Bangladesh', 'any procuring entity using public funds', 'statutory body', 'Companies Act, 1994', 'loan, credit or grant agreement', 'the provision of that agreement shall prevail'],
    lists: ['l-ppa-scope'],
    src: 'PPA 2006 preamble and s.3 (verbatim); annotated PPA p.6 — both marked “Q)” by sir this term; 18-batch TF solve p.5 (asked in the CE 21 class test)',
  },
  {
    id: 'a-pplan-purpose',
    topic: T,
    q: 'What is a procurement plan and what is the purpose of having one?',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    a: `A **procurement plan** is an **annual plan** of a procuring entity, officially prepared for a year, of everything it will procure — package by package, with the method, approving authority, source of funds, estimated cost and dates (PPA s.11). It is approved by the **HOPE** and published for the information of all concerned.

### Purposes (as dictated by sir in class)
1. To **inform the bidders well ahead**.
2. To ensure **transparency**.
3. To ensure **better competition**.
4. To ensure **better participation**.
5. To ensure **lower cost**.

### In detail (for 10 marks)
1. To inform the tenderer or bidder well ahead to prepare.
2. To increase the **efficiency, effectiveness and transparency** of the whole process.
3. To specify how products or services will be acquired and how **vendors will be managed** during the project.
4. To include information such as the types of contracts that will be used and the planned delivery or implementation dates for the contracted products or services, which ensures lower cost.
5. To avoid the surprises and **last-minute considerations**, if the budget is approved in the middle of the year.
6. To ensure better competition and fair participation.`,
    keys: ['procurement plan', 'annual plan', 'HOPE', 'inform the bidders well ahead', 'transparency', 'better competition', 'better participation', 'lower cost', 'efficiency, effectiveness and transparency', 'vendors will be managed', 'last-minute considerations'],
    lists: ['l-pplan-purpose'],
    src: 'IA sir in class this term (annotated PPA p.8, the five); 18-batch TF solve p.5 and Nafee bhai note Ques-5 (definition and the six “in detail”); PPA s.11',
  },
  {
    id: 'a-pplan-format',
    topic: T,
    q: 'In a tabular format show what information is to be disclosed in a procurement plan (prepare a procurement plan on behalf of a procuring entity).',
    seen: ['Jan 2021', '2016-17', '2011-12'],
    a: `### ANNUAL PROCUREMENT PLAN — FY 2018-2019 (quick form, 13 columns)
Ministry/Division: Ministry of Local Government, Rural Development and Co-operatives · Agency: Local Government Engineering Department (LGED) · **Procuring Entity Name & Code**: LGED, 131005700 · Project/Programme Name & Code: BAIDP, 224116600 · Budget: Development

| Serial No. | Package No. | Description of Procurement Package (Goods) | Unit | Quantity | Procurement Method & Type | Contract Approving Authority | Source of Funds | Estd. Cost (Tk lakh) | Invitation for Tender | Signing of Contract | Completion of Contract | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| 1 | BAIDP/14-15/G-01(a) | Supply of furniture | Package | 1 | RFQ | Project Manager | GOB | 2.00 | 1-Dec-18 | 31-Dec-18 | 30-Jan-19 | |
| 2 | BAIDP/14-15/G-02(a) | Supply of photocopier | Package | 1 | RFQ | Project Manager | GOB | 3.00 | 15-Oct-18 | 14-Nov-18 | 14-Dec-18 | |
| 3 | BAIDP/14-15/G-03(a) | Supply of motorcycle | Package | 1 | DPM | Project Manager | GOB | 2.50 | 1-Dec-18 | 31-Dec-18 | 30-Jan-19 | |
| | | **Total** | | | | | | 7.50 | | | | |

(Indicative Dates: Invitation for Tender, Signing of Contract, Completion of Contract)

### Full form (IA sir's sample — DUET, FY 2019-2020, with the time code)

| Package No. | Description of Procurement Package | Quantity | Procurement Method & Type | Contract Approving Authority | Source of Funds | Estd Cost (Tk lakh) | Time Code for Process | Invite/Advertise Tender | Tender Opening | Tender Evaluation | Approval to Award | Notification of Award | Signing of Contract | Total time to Contract Signature | Time for Completion of Contract |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GD5 | Construction of Teachers and Students Centre, 5 storey, 5000 sq ft | 01 | OTM | HOPE | GOB | 3000.00 | Planned dates | 12 Sep 2019 | 27 Oct | 31 Oct | 07 Nov | 14 Nov | 12 Dec | – | – |
| | | | | | | | Planned days | 0 | 45 | 05 | 07 | 07 | 28 | 92 | 90 |
| | | | | | | | Actual dates | 09 Sep | 27 Oct | 04 Nov | 10 Nov | 13 Nov | 26 Nov | | |

This term's assignment used the same columns with one row per package: header (Ministry/Division, Agency, Procuring Entity Name, Financial Year, Budget Type), a one-line executive summary with the total, planned dates from Tender Invitation to Contract Completion, a Total row and the signatures of the preparing officer and the HOPE.`,
    keys: ['Package No.', 'Unit', 'Quantity', 'Procurement Method', 'Contract Approving Authority', 'Source of Funds', 'Estd. Cost', 'Invitation for Tender', 'Signing of Contract', 'Completion of Contract', 'Remarks', 'Indicative Dates', 'Time Code', 'Notification of Award'],
    lists: ['l-pplan-columns'],
    src: '18-batch TF solve p.6–7 and Nafee bhai note Ques-5 (LGED BAIDP APP, 13 columns); IA sir Procurement Plan-Example p2 (DUET); Assignment 1 of this term; PPR Sch V',
  },
  {
    id: 'a-ppa-transparency',
    topic: T,
    q: 'Describe the provisions of PPA that would ensure transparency of a procurement process.',
    seen: ['Jan 2021'],
    a: `PPA 2006 is an Act "for ensuring **transparency and accountability**" in procurement using public funds. Its main provisions:
1. **Procurement plan (s.11)** — every procuring entity prepares an annual procurement plan, approved by the HOPE and **published** for the information of all concerned, so tenderers know in advance what will be procured.
2. **Open Tendering Method preferred (s.31)** — competition under **equal and non-discriminatory terms**; it gives transparency, equal competition, fair price and good value for price. Any other method needs approval and the **reasons recorded** in a file (s.32).
3. **Advertisement (s.40)** — published in at least **one Bangla and one English daily** newspaper of wide circulation, and on the website.
4. **Public opening (s.47)** — tenders are opened by the Tender Opening Committee in the presence of the tenderers; a late tender is returned unopened.
5. **e-GP (s.65)** — procurement through the electronic processing system run by CPTU; online notice, submission and opening leave an audit trail.

More, if marks allow: **standard documents** (s.12); the same information to all and evaluation only on the criteria stated in the document (s.13); an evaluation committee with outside members (s.7); **publication of the award** (s.21); complaints and appeal to the **Review Panel** (s.29–30); punishment of professional misconduct (s.64).`,
    keys: ['transparency and accountability', 'Procurement plan', 'published', 'Open Tendering Method', 'equal and non-discriminatory terms', 'reasons recorded', 'Advertisement', 'one Bangla and one English daily', 'Public opening', 'e-GP', 'standard documents', 'Review Panel'],
    lists: ['l-ppa-transparency'],
    src: 'Pallab’s 18-batch solve of Jan 2021 Q1(c) (ss.11, 31, 40, 47, 65); PPA 2006',
  },
  {
    id: 'a-legal-framework',
    topic: T,
    q: 'Describe the legal framework of public procurement in Bangladesh. What is CPTU?',
    seen: [],
    a: `**Procurement** means purchasing any goods, works or services through tender.

### Legal framework
1. **Public Procurement Act (PPA), 2006** — the primary legislation for procurement of goods, works and services using public funds.
2. **Public Procurement Rules (PPR), 2008** — the secondary legislation made under the PPA, giving the detailed procedures.
3. **Standard tender / proposal documents** issued by CPTU, which the procuring entities must use.
4. **e-GP guidelines** — electronic procurement under section 65 of the PPA.
5. Where a loan, credit or grant agreement with a development partner says otherwise, **the agreement prevails** (s.3(2)(d)).

### Administering authority — CPTU
**CPTU** stands for the **Central Procurement Technical Unit**. It is an agency in Bangladesh responsible for **modernizing public procurement** processes and procedures in the country. CPTU operates under the auspices of the **Implementation, Monitoring, and Evaluation Division (IMED)** of the **Ministry of Planning**. Its primary goal is to enhance **transparency, efficiency, and effectiveness** in public procurement to ensure better utilization of public resources and promote good governance.`,
    keys: ['Public Procurement Act', 'Public Procurement Rules', 'primary legislation', 'secondary legislation', 'Standard tender', 'e-GP', 'Central Procurement Technical Unit', 'modernizing public procurement', 'Implementation, Monitoring, and Evaluation Division', 'Ministry of Planning', 'transparency, efficiency, and effectiveness'],
    src: 'Nafee bhai note Ques-1 (CPTU paragraph verbatim; “What is CPTU?” discussed by sir in class); typed note PYQ-2; asked in CE 403 2010-11 Q7(a) — not in our 12 papers',
  },
  {
    id: 'a-coi',
    topic: T,
    q: 'What is Conflict of Interest (CoI)?',
    seen: [],
    a: `### PPA 2006, section 28 — Conflict of interest
(1) A person or an organisation and any of its affiliates shall, if **previously engaged** by a procuring entity to provide **intellectual and professional services** for **preparation or implementation of a project**, be **ineligible to supply goods, execute works or provide services** directly arising or resulting from that project.

(2) Notwithstanding anything contained in sub-section (1), the provision of this section shall not apply to a person if it is involved in the execution of a **turnkey or design and construction contract** as a contractor.

In plain words: a firm that worked on a project as the consultant cannot later supply goods or carry out works for the same project. In a turnkey contract the contractor designs and builds by himself and the employer only checks the work, so the bar does not apply.`,
    keys: ['previously engaged', 'intellectual and professional services', 'preparation or implementation of a project', 'ineligible to supply goods, execute works or provide services', 'turnkey or design and construction contract'],
    src: 'PPA 2006 s.28 (verbatim); Nafee bhai note Ques-4; 18-batch TF solve, “extra questions discussed by Sir in class” — not in our 12 papers',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
