// pc-writing — reports, abstracts, proposals, business messages.
// Sources: Kabirul sir's note ch.3 (proposals), ch.4 (reports), ch.7 (business messages), ch.1 (abstracting).
// Report importance, proposal chronology and the methods checklist have no class source (question bank only).
import type { PcTopicContent } from '../types'

const T = 'pc-writing' as const
const KN3 = 'Kabirul sir note ch.3'
const KN4 = 'Kabirul sir note ch.4'
const KN7 = 'Kabirul sir note ch.7'
const QB = 'question bank only (Lesikar / Murphy & Hildebrandt)'

export default {
  lists: [
    {
      id: 'l-report-types',
      topic: T,
      title: 'Kinds of report',
      points: [
        { k: 'Short report', alt: ['short'] },
        { k: 'Long report', alt: ['long'] },
        { k: 'Informational report', alt: ['informational'], d: 'Facts only.' },
        { k: 'Interpretative report', alt: ['interpretative', 'analytical'], d: 'Facts plus analysis, conclusions, recommendations.' },
      ],
      hook: 'Two by length (short / long) × two by job (inform / interpret).',
      seen: [],
      src: KN4,
    },
    {
      id: 'l-report-importance',
      topic: T,
      title: 'Why reports are important',
      points: [
        { k: 'Informed decision making', alt: ['decision', 'decision-makers'] },
        { k: 'Record of work done', alt: ['record', 'accountability', 'audit'] },
        { k: 'Monitor performance against plan', alt: ['monitor', 'performance'] },
        { k: 'Coordinate departments', alt: ['coordination'] },
        { k: 'Transmit findings and recommendations', alt: ['findings', 'recommendations'] },
        { k: 'Evidence in disputes', alt: ['legal evidence', 'evidence'] },
      ],
      hook: '**D**on’t **R**ead **M**y **C**ase **F**ile **E**arly — Decide, Record, Monitor, Coordinate, Findings, Evidence.',
      seen: ['2015-16'],
      src: QB,
    },
    {
      id: 'l-report-steps',
      topic: T,
      title: 'Steps for writing a report',
      ordered: true,
      points: [
        { k: 'Specify problem, collect and organise data', alt: ['problem specifying', 'data collection', 'organisation', 'define problem'] },
        { k: 'Write first draft', alt: ['first draft', 'drafting'] },
        { k: 'Edit and revise draft', alt: ['editing', 'revising', 'revise'] },
        { k: 'Type the document', alt: ['typing', 'final document', 'produce'] },
      ],
      hook: '**P**lan, **D**raft, **R**evise, **T**ype — “**P**lease **D**on’t **R**ush **T**yping”.',
      seen: ['2015-16'],
      src: `${KN4} (given for long reports)`,
      note: 'Question bank (short report): define problem and reader; decide scope; gather information; analyse and conclude; choose format and order; outline and draft with headings; add visual aids; revise, proofread, submit.',
    },
    {
      id: 'l-report-short-structure',
      topic: T,
      title: 'Structure of a short report',
      ordered: true,
      points: [
        { k: 'Introduction', d: 'Purpose/aim, background, authorization — kept short.' },
        { k: 'Body or text', alt: ['body', 'text', 'findings', 'discussion'], d: 'Facts accurately presented and organised, headings, visual aids, topic sentences, seven C’s.' },
        { k: 'Terminal section', alt: ['terminal', 'closing section', 'conclusion'], d: 'Summary + conclusion + recommendation + offer; same order as the body; nothing new.' },
      ],
      seen: ['May 2024'],
      src: KN4,
      note: 'Question bank gives six parts: title; introduction; findings/discussion; conclusions; recommendations; attachments. Class note: three parts.',
    },
    {
      id: 'l-report-terminal',
      topic: T,
      title: 'Contents of the terminal section of a short report',
      points: [
        { k: 'Summarization', alt: ['summary', 'summarise'] },
        { k: 'Conclusion', alt: ['conclusions'] },
        { k: 'Recommendation', alt: ['recommendations'] },
        { k: 'Offer' },
      ],
      hook: '**S**ome **C**ats **R**efuse **O**ffers.',
      seen: ['May 2024'],
      src: KN4,
    },
    {
      id: 'l-report-short-formats',
      topic: T,
      title: 'Formats of short reports',
      ask: 'What are the different formats of short report?',
      points: [
        { k: 'Memorandum report', alt: ['memo report', 'memorandum'], d: 'Informational or interpretative memorandum, inside the organisation.' },
        { k: 'Conference report', alt: ['conference'], d: 'By an employee who attended a conference; topics in chronological order.' },
        { k: 'Progress report', alt: ['progress'], d: 'Progress/accomplishment over time.' },
        { k: 'Periodic report', alt: ['periodic'], d: 'At regular periods — weekly, monthly, quarterly.' },
        { k: 'Letter report', alt: ['letter'], d: 'Small report in letter form, often to an outside organisation.' },
        { k: 'Personnel report', alt: ['personnel'], d: 'Introduction → main body with headings → terminal section.' },
        { k: 'Recommendation / justification report', alt: ['recommendation report', 'justification report', 'justification'], d: 'Recommends a change and supports it.' },
      ],
      hook: '**M**y **C**ousin **P**rints **P**apers, **L**etters, **P**osters, **R**eceipts — Memo, Conference, Progress, Periodic, Letter, Personnel, Recommendation.',
      seen: ['2023-24'],
      src: KN4,
    },
    {
      id: 'l-report-progress',
      topic: T,
      title: 'Structure of a progress report',
      ordered: true,
      points: [
        { k: 'Introduction' },
        { k: 'Accomplishments', alt: ['work done', 'accomplishment'] },
        { k: 'Unanticipated problems', alt: ['problems'] },
        { k: 'Plan for next reporting period', alt: ['next period plan', 'plans'] },
        { k: 'Summary' },
      ],
      hook: '**I** **A**m **U**sually **P**unctual, **S**ir.',
      seen: [],
      src: KN4,
    },
    {
      id: 'l-report-long-structure',
      topic: T,
      title: 'Parts of a long report',
      ordered: true,
      points: [
        { k: 'Prefatory part', alt: ['preliminary', 'front matter'], d: 'Cover, copyright notice, acknowledgement, abstract, frontispiece, forwarding letter, list of illustrations, contents, preface, executive summary.' },
        { k: 'Main body', alt: ['body'], d: 'Introduction, discussion/text, conclusions, recommendations.' },
        { k: 'Back matter', alt: ['supplementary', 'end matter'], d: 'Appendices, bibliography, index, reference list, glossary.' },
      ],
      seen: [],
      src: KN4,
    },
    {
      id: 'l-proposal-types',
      topic: T,
      title: 'Types of proposal',
      points: [
        { k: 'Research proposal', alt: ['research'], d: 'For an academic investigation.' },
        { k: 'Business proposal', alt: ['business'], d: 'For a business purpose.' },
        { k: 'Solicited proposal', alt: ['solicited', 'RFP'], d: 'Requested by the organisation for a specific need; many bidders.' },
        { k: 'Unsolicited proposal', alt: ['unsolicited'], d: 'Sent on one’s own to convince an organisation that you can solve its problem.' },
      ],
      seen: ['2017-18'],
      src: KN3,
    },
    {
      id: 'l-proposal-parts',
      topic: T,
      title: 'Parts of a business proposal',
      ordered: true,
      points: [
        { k: 'Prefatory part', alt: ['prefatory', 'front matter'] },
        { k: 'Body', alt: ['body part', 'main body'] },
        { k: 'Supplementary part', alt: ['supplementary', 'appendix', 'back matter'] },
      ],
      seen: ['2017-18', '2016-17', '2012-13'],
      src: KN3,
      note: 'Question bank lists them flat: letter of transmittal, title page and contents, executive summary, introduction, background, proposed plan, staffing, budget, schedule, authorisation request, appendices.',
    },
    {
      id: 'l-proposal-prefatory',
      topic: T,
      title: 'Prefatory part of a proposal',
      points: [
        { k: 'Cover with title', alt: ['cover', 'title'] },
        { k: 'Inside title page', alt: ['title page'] },
        { k: 'Table of contents', alt: ['contents'] },
        { k: 'List of tables and figures', alt: ['list of figures', 'list of tables'] },
        { k: 'Request for proposal (RFP)', alt: ['RFP', 'request for proposal', 'draft contract'] },
        { k: 'Response to proposal (RTP)', alt: ['RTP'] },
        { k: 'Owner’s requirements', alt: ["owner's requirement", 'requirements'] },
        { k: 'Scheduled interview time', alt: ['interview time'] },
        { k: 'Executive summary', alt: ['summary', 'abstract'] },
      ],
      hook: 'From the outside in: **cover → title page → contents → figures**, then the paperwork of the deal (**RFP → RTP → owner’s needs → interview**), and last the **summary** the evaluator reads first.',
      seen: ['2016-17', '2012-13'],
      src: KN3,
    },
    {
      id: 'l-proposal-body',
      topic: T,
      title: 'Body of a proposal',
      points: [
        { k: 'Introduction', alt: ['background', 'objective', 'scope', 'need'], d: 'Background, objective, scope, need/problem.' },
        { k: 'Procedure (plan of attack)', alt: ['procedure', 'plan of attack', 'method', 'methodology'], d: 'Methods, sources, sequence of activities, equipment and facilities, personnel.' },
        { k: 'Project team / qualifications', alt: ['qualifications', 'personnel', 'staffing'] },
        { k: 'Products (deliverables)', alt: ['deliverables', 'products'] },
        { k: 'Budget / price', alt: ['budget', 'cost', 'price'] },
        { k: 'Project schedule', alt: ['schedule'] },
      ],
      hook: '**Why** (introduction) → **How** (procedure) → **Who** (team) → **What** (products) → **How much** (budget) → **When** (schedule).',
      seen: ['2016-17', '2012-13'],
      src: KN3,
    },
    {
      id: 'l-proposal-supplementary',
      topic: T,
      title: 'Supplementary part of a proposal',
      ask: 'What do the supplementary parts of a project proposal generally contain?',
      points: [
        { k: 'Maps, graphs, tables, charts', alt: ['maps', 'graphs', 'charts', 'tables'] },
        { k: 'Letter of support', alt: ['support letter'] },
        { k: 'Letter of endorsement', alt: ['endorsement'] },
        { k: 'References', alt: ['reference'] },
        { k: 'Forms' },
        { k: 'Table of definitions', alt: ['definitions', 'glossary'] },
      ],
      hook: '**M**any **S**upporters **E**ndorse **R**eal **F**orm **D**ata — Maps, Support, Endorsement, References, Forms, Definitions.',
      seen: ['2017-18', '2016-17'],
      src: KN3,
    },
    {
      id: 'l-proposal-chronology',
      topic: T,
      title: 'Chronology of a major solicited proposal',
      ordered: true,
      points: [
        { k: 'Client identifies need, prepares RFP', alt: ['RFP prepared', 'need identified'] },
        { k: 'RFP issued to firms', alt: ['RFP issued'] },
        { k: 'Go / no-go decision', alt: ['bid no-bid', 'go no go'] },
        { k: 'Pre-proposal conference and clarifications', alt: ['pre-proposal conference', 'site visit', 'clarification'] },
        { k: 'Appoint proposal manager and team', alt: ['proposal team', 'proposal manager'] },
        { k: 'Research client and develop approach', alt: ['research', 'technical approach', 'methodology'] },
        { k: 'Staffing, work plan, schedule, cost estimate', alt: ['cost estimate', 'work plan', 'staffing'] },
        { k: 'Write sections, executive summary last', alt: ['write', 'writing', 'executive summary'] },
        { k: 'Internal review, edit, check compliance', alt: ['red team', 'review', 'edit', 'compliance'] },
        { k: 'Approval, signatures, packaging', alt: ['approval', 'signatures', 'packaging', 'production'] },
        { k: 'Submit before deadline', alt: ['submit', 'submission'] },
        { k: 'Client evaluates; presentations/interviews', alt: ['evaluation', 'interview', 'presentation'] },
        { k: 'Ranking, negotiation, award, contract', alt: ['award', 'negotiation', 'contract signing'] },
        { k: 'Debriefing of unsuccessful firms', alt: ['debriefing', 'debrief'] },
      ],
      hook: 'Three acts — **Client asks** (need → RFP → issue), **Firm writes** (go/no-go → conference → team → research → costs → write → review → sign → submit), **Client decides** (evaluate → award → debrief).',
      seen: ['2017-18', '2012-13'],
      src: QB,
    },
    {
      id: 'l-exec-summary',
      topic: T,
      title: 'Issues for the executive summary of a proposal',
      ask: 'What are the main issues to consider when preparing the executive summary / abstract / synopsis of a proposal?',
      points: [
        { k: 'Most important part, read first', alt: ['most important part', 'read first', 'evaluators read it first'], d: 'Evaluators read it first to get a quick overview.' },
        { k: 'Covers the whole proposal', alt: ['whole proposal'] },
        { k: 'Stands alone', alt: ['stand alone', 'standalone'] },
        { k: 'Summarises the objectives', alt: ['objectives'] },
        { k: 'Summarises the procedures to be followed', alt: ['procedures', 'methods'] },
        { k: 'Immediate overview of the work', alt: ['overview', 'immediate overview'] },
        { k: 'Key financial information', alt: ['cost', 'financial information', 'price'] },
      ],
      hook: 'The evaluator’s **one page**: whole proposal, **alone**, **why** (objectives), **how** (procedures), **what** at a glance, **how much**.',
      seen: ['Jan 2021'],
      src: KN3,
      note: 'Question bank adds: write it last; about one page (5–10 % of the proposal); state the client’s need; give schedule and deliverables; show why the proposer should be chosen; use the client’s terms, no jargon, nothing not in the body.',
    },
    {
      id: 'l-proposal-methods-checklist',
      topic: T,
      title: 'Checklist for the methods and procedures section of a proposal',
      points: [
        { k: 'Each task described step by step', alt: ['step by step', 'tasks'] },
        { k: 'Methods linked to objectives and ToR', alt: ['objectives', 'ToR', 'terms of reference'] },
        { k: 'Feasibility shown, alternatives considered', alt: ['feasibility', 'alternatives'] },
        { k: 'Personnel, equipment, facilities, materials', alt: ['personnel', 'equipment', 'facilities'] },
        { k: 'Schedule with milestones and deliverables', alt: ['schedule', 'milestones', 'deliverables'] },
        { k: 'Quality control and monitoring', alt: ['quality control', 'monitoring', 'evaluation'] },
        { k: 'Assumptions and client inputs', alt: ['assumptions', 'client inputs'] },
        { k: 'Risks and their management', alt: ['risks', 'risk management'] },
        { k: 'Clear, specific language', alt: ['clear language', 'specific'] },
      ],
      seen: ['Jan 2021'],
      src: `${QB}; the class note only lists method, sources, sequence of activities, equipment and facilities, personnel`,
    },
    {
      id: 'l-msg-planning',
      topic: T,
      title: 'Planning steps for an effective business message',
      ordered: true,
      points: [
        { k: 'Identify the purpose', alt: ['purpose', 'identifying purpose'] },
        { k: 'Analyse the audience', alt: ['audience', 'analyzing audience', 'anticipate audience'] },
        { k: 'Choose ideas', alt: ['choosing idea', 'ideas'] },
        { k: 'Collect data to support ideas', alt: ['collect data', 'research', 'data'] },
        { k: 'Organise the message', alt: ['organising', 'organize', 'outline'] },
      ],
      hook: '**P**lease **A**sk **I**f **D**ata’s **O**K — Purpose, Audience, Ideas, Data, Organise.',
      seen: ['Jan 2021'],
      src: KN7,
      note: 'Question bank: the 3×3 process — analyse purpose, anticipate audience, adapt, research, organise, compose, revise.',
    },
    {
      id: 'l-msg-audience',
      topic: T,
      title: 'Issues to consider when analysing the audience',
      points: [
        { k: 'Professional background', alt: ['background'] },
        { k: 'Professional position', alt: ['position', 'status'] },
        { k: 'Age and sex', alt: ['age', 'gender', 'sex'] },
        { k: 'Educational level', alt: ['education'] },
        { k: 'Knowledge, attitude and cultural values', alt: ['knowledge', 'attitude', 'culture', 'cultural values'] },
      ],
      hook: 'Read the receiver’s **CV**: background, post, age/sex, degree — then their head (knowledge), heart (attitude) and roots (culture).',
      seen: ['Jan 2021'],
      src: KN7,
      note: 'Question bank: primary/secondary audience, their knowledge, expected reaction, relationship/status, needs and benefits, demographics and culture, size and preferred channel.',
    },
    {
      id: 'l-msg-approach',
      topic: T,
      title: 'Organisational plans (approaches) for a message',
      points: [
        { k: 'Direct (deductive)', alt: ['direct', 'deductive'], d: 'Favourable/neutral reaction: main idea first, details, friendly close.' },
        { k: 'Indirect (inductive)', alt: ['indirect', 'inductive'], d: 'Bad news or persuasion: reasons first, main idea later.' },
      ],
      seen: [],
      src: KN7,
    },
    {
      id: 'l-msg-composing',
      topic: T,
      title: 'Steps for composing a message',
      ordered: true,
      points: [
        { k: 'Drafting', alt: ['draft'] },
        { k: 'Revising', alt: ['revise'] },
        { k: 'Editing', alt: ['edit'] },
        { k: 'Proofreading', alt: ['proofread'] },
      ],
      hook: '**D**on’t **R**ush **E**very **P**age.',
      seen: [],
      src: KN7,
    },
  ],

  cards: [
    { id: 'c-report-define', topic: T, front: 'Define a **report** (class wording).', back: 'A **formal statement of facts and information** written for a **specific audience** for **making an informed decision**.', seen: ['2015-16'], src: KN4 },
    { id: 'c-proposal-define', topic: T, front: 'What is a **proposal** (project proposal)?', back: 'A **written plan or presentation for completing a task**, offered to a client or organisation for approval.', seen: ['2017-18'], src: KN3 },
    { id: 'c-proposal-solicited', topic: T, front: '**Solicited** vs **unsolicited** proposal?', back: '**Solicited**: the organisation asks for it (RFP) for a specific need — many bidders compete. **Unsolicited**: sent on one’s own initiative to convince an organisation that the sender has the skills to solve its problem.', src: KN3 },
    { id: 'c-exec-summary-why', topic: T, front: 'Why is the **executive summary** the most important part of a proposal?', back: 'Evaluators read it **first** (often only it) to get a quick overview — so it must cover the whole proposal and **stand alone**.', seen: ['Jan 2021'], src: KN3 },
    { id: 'c-report-terminal-rule', topic: T, front: 'Two rules for the **terminal section** of a short report.', back: 'Summarise in the **same order as the body** topics, and **add no new topic or material** there.', seen: ['May 2024'], src: KN4 },
    { id: 'c-report-body-rules', topic: T, front: 'How is the **body** of a short report written?', back: 'Relevant facts presented accurately and organised; important ideas emphasised; **headings** guide the reader; **visual aids**; each paragraph with a **topic sentence**; each major section with an introductory paragraph; follow the **seven C’s**.', seen: ['May 2024'], src: KN4 },
    { id: 'c-report-conference', topic: T, front: 'What is a **conference report**?', back: 'Written by an employee/executive who attended a conference, giving the discussed topics in **chronological order**.', seen: ['2023-24'], src: KN4 },
    { id: 'c-report-periodic', topic: T, front: 'What is a **periodic report**?', back: 'A report at a **regular recurring period** (weekly, monthly, quarterly). Favourable news in about half a page; unfavourable news may take a page, with how it will be handled.', seen: ['2023-24'], src: KN4 },
    { id: 'c-report-letter', topic: T, front: 'What is a **letter report**?', back: 'A small report in **letter form**, usually to an outside organisation: first paragraph purpose/problem and method, middle results under headings, last paragraph conclusion, recommendation and offer.', seen: ['2023-24'], src: KN4 },
    { id: 'c-report-justification', topic: T, front: 'What is a **recommendation / justification report**?', back: 'It **recommends a change** (vs the status quo): introduction states the recommendation, body supports it with accurate information, terminal section requests a response or action.', seen: ['2023-24'], src: KN4 },
    { id: 'c-report-personnel', topic: T, front: 'Structure of a **personnel report**.', back: '**Introduction** (purpose, background, methodology, plan) → **main body** (headings and sub-headings) → **terminal section** (summary + conclusion).', src: KN4 },
    { id: 'c-report-biblio', topic: T, front: 'What is a **bibliography**, and which two formats are common?', back: 'The list of sources (and additional reading) at the **end of the document**. Formats: **MLA** (Modern Language Association) and **APA** (American Psychological Association).', src: KN4 },
    { id: 'c-report-footnote', topic: T, front: '**Footnote** vs **endnote** — and why use them?', back: 'Both explain content, **identify the source** and add information, increasing trust in the report. **Footnote**: bottom of the page. **Endnote**: end of the chapter or book. Numbered in order.', src: KN4 },
    { id: 'c-msg-direct', topic: T, front: 'When is the **direct (deductive)** plan used, and how does it run?', back: 'When the receiver’s reaction will be **favourable or neutral** (routine request, good news, routine information). **Main idea / best news first** → necessary details → friendly closing.', src: KN7 },
    { id: 'c-msg-indirect', topic: T, front: 'When is the **indirect (inductive)** plan used?', back: 'For **persuasive requests** and **bad news** (request denied, unfavourable announcement) — reasons come before the main idea, because the reader may react badly.', src: KN7 },
    { id: 'c-abstract-define', topic: T, front: 'What is **abstraction**, and why is it necessary?', back: 'Selecting **some details** of an object or event and **omitting the rest**. Necessary because no one can perceive or report every detail; it lets us summarise and generalise — abstracts and executive summaries depend on it.', seen: ['2023-24', '2020-21'], src: 'Kabirul sir note ch.1' },
    { id: 'c-slanted-abstract', topic: T, front: 'What is a **slanted abstract**, and what is its purpose?', back: 'An abstract whose details are chosen (still **factual**) to **mislead or deceive** — to favour one side. Purpose: to **persuade/influence** (ads, proposals, propaganda). Avoid it in objective reports.', seen: ['2023-24', '2020-21'], src: 'Kabirul sir note ch.1' },
  ],

  answers: [
    {
      id: 'a-writing-report',
      topic: T,
      q: 'Define a report. Why are reports important? Briefly describe the steps to be followed in writing a (short) report.',
      seen: ['2015-16'],
      a: `### Definition
A report is a **formal statement of facts and information** written for a **specific audience** for **making an informed decision**. Reports are short or long, and informational or interpretative.

### Importance
1. **Decision making** — gives decision-makers facts and analysis.
2. **Record** — records work done (progress, inspection, test) for accountability and audit.
3. **Monitoring** — checks performance against plan.
4. **Coordination** — links departments.
5. **Findings and recommendations** — carries them to those who act.
6. **Evidence** — serves as evidence in disputes.

### Steps (class note)
1. **Problem specifying, data collection and organisation** — define the problem and reader, collect facts, organise them.
2. **Writing the first draft** — introduction, body with headings, terminal section; add visual aids.
3. **Editing and revising** the draft — seven C’s, accuracy.
4. **Typing the document** — final copy with bibliography and documentation.

*The importance points are from standard texts (no class source). Books split the steps further: define problem and reader, scope, gather, analyse, choose format, draft, visual aids, revise and submit.*`,
      keys: ['formal statement of facts and information', 'specific audience', 'informed decision', 'Record', 'Monitoring', 'Coordination', 'Evidence', 'first draft', 'Editing and revising', 'Typing'],
      lists: ['l-report-importance', 'l-report-steps', 'l-report-types'],
      src: `${KN4}; importance = ${QB}`,
    },
    {
      id: 'a-writing-short-structure',
      topic: T,
      q: 'Outline the structure of a short report.',
      seen: ['May 2024'],
      a: `A short report has **three parts**:

1. **Introduction** — purpose/aim, background, authorization; kept short (may be dropped in a very short report).
2. **Body or text** — relevant facts presented accurately and organised; important ideas emphasised; **headings** to guide the reader; **visual aids** (graph, chart, picture); every paragraph with a **topic sentence**; each major section with an introductory paragraph; follow the seven C’s.
3. **Terminal section** — **summarization, conclusion, recommendation and offer**, in the same order as the body; no new topic or material is added.

*Some books outline it as title; introduction; findings; conclusions; recommendations; attachments.*`,
      keys: ['three parts', 'Introduction', 'Body or text', 'Terminal section', 'headings', 'visual aids', 'topic sentence', 'summarization, conclusion, recommendation and offer', 'no new topic'],
      lists: ['l-report-short-structure', 'l-report-terminal'],
      src: KN4,
    },
    {
      id: 'a-writing-short-formats',
      topic: T,
      q: 'What are the different formats of short report?',
      seen: ['2023-24'],
      a: `1. **Memorandum report** — informational or interpretative memorandum, for use inside the organisation.
2. **Conference report** — by an employee who attended a conference; topics in chronological order.
3. **Progress report** — shows progress over time: introduction → accomplishments → unanticipated problems → plan for next period → summary.
4. **Periodic report** — at regular periods (weekly, monthly, quarterly); good news brief, bad news with the remedy.
5. **Letter report** — a small report in letter form, often to an outside organisation.
6. **Personnel report** — introduction → main body with headings → terminal section.
7. **Recommendation / justification report** — recommends a change and supports it, then asks for a response.`,
      keys: ['Memorandum report', 'Conference report', 'Progress report', 'Periodic report', 'Letter report', 'Personnel report', 'justification report'],
      lists: ['l-report-short-formats', 'l-report-progress'],
      src: KN4,
    },
    {
      id: 'a-writing-slanted-abstract',
      topic: T,
      q: 'What is abstraction and why is it necessary? Explain what a slanted abstract is and its purpose.',
      seen: ['2023-24', '2020-21'],
      a: `### Abstraction
**Abstraction** (abstracting) is selecting **some details** of an object or event and **omitting the rest**. Words sit on a ladder from concrete (“Jamuna Bridge”) to general (“bridge”, “structure”, “asset”).

### Why necessary
- Reality has endless details; no one can perceive or report them all.
- It lets us **summarise, classify and generalise** and communicate quickly — abstracts and executive summaries depend on it.
- The writer must choose the right level: concrete enough to be clear, general enough to be brief.

### Slanted abstract
A **slanted abstract** selects details (still **factual**) or uses loaded words to favour one side and **mislead or deceive** the receiver; it reveals the sender’s bias. E.g. “The contractor finished 90 % of the work” vs “The contractor failed to finish 10 % of the work”.

### Purpose
To **persuade or influence** the receiver’s attitude — used in advertising, sales letters, proposals and propaganda. In objective technical reports it should be avoided; receivers should recognise it and look for the omitted facts.`,
      keys: ['Abstraction', 'some details', 'omitting the rest', 'summarise, classify and generalise', 'slanted abstract', 'factual', 'mislead or deceive', 'persuade or influence', 'bias'],
      src: 'Kabirul sir note ch.1 (definitions); necessity and purpose from question bank (standard text)',
    },
    {
      id: 'a-writing-proposal-parts',
      topic: T,
      q: 'Describe (list in detail) the different parts of a business proposal and what they contain.',
      seen: ['2017-18', '2016-17', '2012-13'],
      a: `A proposal is a **written plan or presentation for completing a task**. It has three parts:

### 1. Prefatory part
Cover with title; inside title page; table of contents; list of tables and figures; **request for proposal (RFP)** / draft contract; **response to proposal (RTP)**; owner’s requirements; scheduled interview time; **executive summary**.

### 2. Body
- **Introduction** — background, objective, scope, need/problem.
- **Procedure (plan of attack)** — methods, sources, sequence of activities, equipment and facilities.
- **Project team / qualifications** — personnel and their experience.
- **Products** — deliverables.
- **Budget** — price and cost breakdown.
- **Project schedule** — bar chart with milestones.

### 3. Supplementary part
Maps, graphs, tables and charts; **letter of support**; **letter of endorsement**; references; forms; table of definitions.

*Books also add a letter of transmittal in front and an authorisation request at the end.*`,
      keys: ['written plan', 'Prefatory part', 'Body', 'Supplementary part', 'executive summary', 'RFP', 'Introduction', 'Procedure', 'Budget', 'Project schedule', 'letter of support', 'letter of endorsement'],
      lists: ['l-proposal-parts', 'l-proposal-prefatory', 'l-proposal-body', 'l-proposal-supplementary', 'l-proposal-types'],
      src: KN3,
    },
    {
      id: 'a-writing-proposal-chronology',
      topic: T,
      q: 'Give a complete chronological description of the steps (procedures) followed during the entire process of a major solicited proposal.',
      seen: ['2017-18', '2012-13'],
      a: `1. **Need and RFP** — the client identifies the need and prepares a request for proposal (often after EOI short-listing).
2. **RFP issued** to short-listed or interested firms.
3. **Go / no-go decision** — the firm studies the RFP and decides whether to bid.
4. **Pre-proposal conference** / site visit; written clarifications sought.
5. **Proposal team** — proposal manager and team appointed; outline, responsibilities and internal deadlines set; partners arranged.
6. **Research** the client, project and site; develop the technical approach.
7. **Staffing, work plan, schedule and cost estimate** prepared.
8. **Writing** — sections and graphics; executive summary written last.
9. **Internal review** — revise, edit, proofread; check compliance with every RFP requirement.
10. **Approval and packaging** — management approval, signatures; technical and financial parts in separate envelopes.
11. **Submit** before the deadline; obtain a receipt.
12. **Evaluation** — the client evaluates; may ask for clarifications, presentations or interviews.
13. **Award** — ranking, negotiation with the top firm, award and contract signing.
14. **Debriefing** — unsuccessful firms ask for a debriefing to learn for next time.`,
      keys: ['RFP', 'Go / no-go', 'Pre-proposal conference', 'Proposal team', 'cost estimate', 'executive summary written last', 'Internal review', 'Submit', 'Evaluation', 'Award', 'Debriefing'],
      lists: ['l-proposal-chronology'],
      src: QB,
    },
    {
      id: 'a-writing-exec-summary',
      topic: T,
      q: 'What are the main issues to consider when preparing the executive summary/abstract or synopsis of a proposal? What are the checklist items for methods and procedures of a proposal?',
      seen: ['Jan 2021'],
      a: `### Executive summary
1. **Most important part** — evaluators read it first to get a quick overview.
2. **Whole proposal** — it must tell about the whole proposal.
3. **Stand alone** — readable without the rest.
4. **Objectives** — summarise the objectives of the proposal.
5. **Procedures** — summarise the procedures to be followed.
6. **Immediate overview** of the work, with key **financial information** (cost) and schedule.
7. **Write it last**, about one page, in the client’s terms — no jargon and nothing not in the body (standard text).

### Checklist for methods and procedures
1. Each task described **step by step** in logical order.
2. Methods linked to the **objectives** and ToR.
3. **Feasibility** shown; alternatives considered.
4. Personnel, equipment, facilities and materials for each task.
5. **Schedule** with milestones and deliverables.
6. **Quality control** and monitoring.
7. Assumptions and inputs expected from the client.
8. **Risks** and how they will be managed.
9. Clear, specific language.

*The checklist is from standard texts; the class note’s procedure section lists method, sources, sequence of activities, equipment and facilities, and personnel.*`,
      keys: ['Most important part', 'Whole proposal', 'Stand alone', 'Objectives', 'Procedures', 'Immediate overview', 'financial information', 'step by step', 'Feasibility', 'Quality control', 'Risks'],
      lists: ['l-exec-summary', 'l-proposal-methods-checklist'],
      src: `${KN3}; checklist = ${QB}`,
    },
    {
      id: 'a-writing-business-messages',
      topic: T,
      q: 'What are the planning steps for preparing effective business messages? Describe the issues to consider when analysing your audience.',
      seen: ['Jan 2021'],
      a: `### Planning steps
1. **Identify the purpose** — what should the receiver know, do or feel?
2. **Analyse the audience** — who will read it and how they will react.
3. **Choose ideas** — the main points to carry the purpose.
4. **Collect data** to support the ideas.
5. **Organise the message** — direct (deductive) plan for good/neutral news, indirect (inductive) plan for bad news or persuasion.

### Analysing the audience
Know the receiver so the message gets the **desired response** — consider their views, attitudes, needs and culture:
1. **Professional background**
2. **Professional position** (status, relationship to you)
3. **Age and sex**
4. **Educational level**
5. **Knowledge, attitude and cultural values**

Write the message keeping these in mind and following the organisation’s communication principles. After planning: drafting → revising → editing → proofreading.

*Some books add: primary vs secondary audience, expected reaction, needs and benefits, size and preferred channel.*`,
      keys: ['Identify the purpose', 'Analyse the audience', 'Choose ideas', 'Collect data', 'Organise the message', 'desired response', 'Professional background', 'Professional position', 'Age and sex', 'Educational level', 'cultural values'],
      lists: ['l-msg-planning', 'l-msg-audience', 'l-msg-approach', 'l-msg-composing'],
      src: KN7,
    },
  ],
} satisfies PcTopicContent
