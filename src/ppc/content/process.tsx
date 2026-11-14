// pc-process — tender process flow chart, evaluation, arithmetic correction, post-qualification,
// NOA, tender security and forfeiture, JV, complaints (IA sir).
// Source digest: CE301/Claude digests/lec_procurement.md (pp-process).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-process' as const

// ---------- figure (theme tokens only) ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const ia = 'var(--c-ia)'

const Box: FC<{ x: number; y: number; w: number; h?: number; t: string[]; strong?: boolean }> = ({ x, y, w, h = 28, t, strong }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={panel2} stroke={strong ? ia : line} strokeWidth={strong ? 2 : 1.3} />
    {t.map((s, i) => (
      <text key={i} x={x + w / 2} y={y + h / 2 + 4 - ((t.length - 1) * 13) / 2 + i * 13} textAnchor="middle" fontSize={11.5} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)

const Diamond: FC<{ cx: number; cy: number; t: string[] }> = ({ cx, cy, t }) => (
  <g>
    <polygon points={`${cx},${cy - 26} ${cx + 90},${cy} ${cx},${cy + 26} ${cx - 90},${cy}`} fill={panel2} stroke={ia} strokeWidth={2} />
    {t.map((s, i) => (
      <text key={i} x={cx} y={cy + 4 - ((t.length - 1) * 12) / 2 + i * 12} textAnchor="middle" fontSize={11} fill={ink}>
        {s}
      </text>
    ))}
  </g>
)

const Arrow: FC<{ d: string }> = ({ d }) => <path d={d} fill="none" stroke={mute} strokeWidth={1.4} markerEnd="url(#pc-arr)" />

const TenderFlowFig: FC = () => (
  <svg viewBox="-44 0 604 690" width="100%" role="img" aria-label="Flow chart of the tendering process">
    <defs>
      <marker id="pc-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={mute} />
      </marker>
    </defs>
    <Box x={95} y={8} w={210} t={['Tender Notice']} strong />
    <Arrow d="M200,36 V48" />
    <Box x={95} y={50} w={210} t={['Interested bidders buy tender documents']} />
    <Arrow d="M200,78 V90" />
    <Box x={95} y={92} w={210} t={['Pre-tender meeting (if any)']} />
    <Arrow d="M200,120 V132" />
    <Box x={95} y={134} w={210} t={['Tender submission']} />
    <Arrow d="M200,162 V174" />
    <Box x={95} y={176} w={210} t={['Tender opening (TOC, in public)']} />
    <Arrow d="M200,204 V216" />
    <Box x={95} y={218} w={210} t={['Tender evaluation by TEC']} strong />
    <Arrow d="M200,246 V258" />
    <Box x={95} y={260} w={210} t={['Outcome of tender evaluation']} />
    <path d="M70,288 V300 H450 M70,300 V306 M193,300 V306 M323,300 V306 M450,300 V306 M200,288 V300" fill="none" stroke={mute} strokeWidth={1.4} />
    <Box x={14} y={308} w={112} h={34} t={['Responsive', 'tenderer']} />
    <Box x={137} y={308} w={112} h={34} t={['Substantially', 'responsive']} />
    <Box x={267} y={308} w={112} h={34} t={['Non-responsive', 'tenderer']} />
    <Box x={394} y={308} w={112} h={34} t={['Rejected', 'tenderer']} />
    <text x={193} y={358} textAnchor="middle" fontSize={11} fill={mute}>
      obtain clarification → responsive or not
    </text>
    <path d="M70,342 V372 H200 M193,342 V372" fill="none" stroke={mute} strokeWidth={1.4} />
    <Arrow d="M200,372 V384" />
    <Box x={110} y={386} w={180} t={['Lowest bidder/tenderer']} strong />
    <Arrow d="M200,414 V430" />
    <Diamond cx={200} cy={458} t={['Post-', 'qualification']} />
    <path d="M110,458 H60 V400 H108" fill="none" stroke={mute} strokeWidth={1.4} markerEnd="url(#pc-arr)" />
    <text x={54} y={440} fontSize={11} fill={mute} textAnchor="end">
      Not OK:
    </text>
    <text x={54} y={453} fontSize={11} fill={mute} textAnchor="end">
      try next lowest
    </text>
    <Arrow d="M200,484 V506" />
    <text x={208} y={499} fontSize={11} fill={mute}>
      OK
    </text>
    <Diamond cx={200} cy={534} t={['Approval', 'from HOPE']} />
    <Arrow d="M290,534 H352" />
    <text x={312} y={527} fontSize={11} fill={mute}>
      No
    </text>
    <Box x={354} y={515} w={156} h={38} t={['Cancel the process &', 'arrange re-tender']} />
    <path d="M440,342 V430 H432 V513" fill="none" stroke={mute} strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#pc-arr)" />
    <text x={446} y={420} fontSize={11} fill={mute} textAnchor="start">
      none responsive /
    </text>
    <text x={446} y={434} fontSize={11} fill={mute}>
      none post-qualify
    </text>
    <Arrow d="M200,560 V576" />
    <text x={208} y={572} fontSize={11} fill={mute}>
      Yes
    </text>
    <Box x={95} y={578} w={210} t={['Invited to contract — NOA']} strong />
    <Arrow d="M200,606 V618" />
    <Box x={95} y={620} w={210} t={['Contract sign']} />
    <Arrow d="M200,648 V658" />
    <Box x={95} y={660} w={210} h={26} t={['Contractor']} strong />
  </svg>
)

// ---------- lists ----------
const lists: PcList[] = [
  {
    id: 'l-tender-flow',
    topic: T,
    title: 'Boxes of the tender process flow chart',
    ask: 'Describe the tender process using a flow-chart — the boxes in order.',
    points: [
      { k: 'Tender notice', alt: ['invitation for tender', 'IFT', 'advertisement'], d: 'Advertised in Bangla + English dailies and websites.' },
      { k: 'Interested bidders buy tender documents', alt: ['buy tender documents', 'sale of tender document'], d: 'Sold up to the day before the deadline.' },
      { k: 'Pre-tender meeting', alt: ['pretender meeting'], d: 'If any; minutes to all buyers.' },
      { k: 'Tender submission', alt: ['submission'], d: 'Sealed, with tender security, by the deadline.' },
      { k: 'Tender opening', alt: ['opening', 'TOC'], d: 'By the Tender Opening Committee, in public.' },
      { k: 'Tender evaluation by TEC', alt: ['evaluation', 'tender evaluating committee'], d: 'Preliminary, detailed, arithmetic correction, ranking.' },
      { k: 'Outcome of tender evaluation', alt: ['outcome', 'responsive non-responsive rejected'], d: 'Responsive / substantially responsive / non-responsive / rejected.' },
      { k: 'Lowest bidder/tenderer', alt: ['lowest evaluated', 'lowest bidder'], d: 'Lowest evaluated responsive tender.' },
      { k: 'Post-qualification', alt: ['post qualification'], d: 'Not OK → try next lowest.' },
      { k: 'Approval from HOPE', alt: ['HOPE approval', 'approval'], d: 'No → cancel the process and arrange re-tender.' },
      { k: 'Invited to contract — NOA', alt: ['NOA', 'notification of award'], d: 'Within tender validity, no complaint pending.' },
      { k: 'Contract sign', alt: ['contract signing', 'sign contract'], d: 'After performance security.' },
      { k: 'Contractor', alt: ['contractor'], d: 'The successful tenderer becomes the contractor.' },
    ],
    ordered: true,
    hook: 'No Bidder Plays Safe Over Exams Or Lunch; Post-lunch, HOPE Nods; Contract Concludes — Notice, Buy, Pre-tender, Submit, Open, Evaluate, Outcome, Lowest, Post-qual, HOPE, NOA, Contract sign, Contractor.',
    seen: ['2023-24', '2022-23', '2021-22', 'Jan 2021', '2017-18', '2015-16', '2013-14', '2011-12'],
    src: 'IA sir Tender Flow Chart (12 May 2015); GCC+TEC slide 6 (adds Tender Opening)',
    note: 'IA sir’s chart of 12 May 2015 (the one the seniors paste, TF p.47 = Nafee p.20) has no Tender Opening box: Pre-tender meeting → Tender submission → Tender evaluation by TEC, with Contract Sign as a side box. His GCC+TEC slide 6 (May 2015) shows Tender Opening, so either chart is accepted. The 2014 version has no pre-tender meeting or post-qualification.',
  },
  {
    id: 'l-tender-outcomes',
    topic: T,
    title: 'Outcomes of tender evaluation',
    points: [
      { k: 'Responsive tenderer', alt: ['responsive'], d: 'Meets every mandatory requirement without material deviation.' },
      { k: 'Substantially responsive tenderer', alt: ['substantially responsive', 'minor deviation'], d: 'Minor deviations; obtain clarification and make responsive or non-responsive.' },
      { k: 'Non-responsive tenderer', alt: ['non-response', 'non responsive'], d: 'Material deviation or reservation.' },
      { k: 'Rejected tenderer', alt: ['rejected'], d: 'Fails eligibility/mandatory documents, or refuses correction.' },
    ],
    seen: ['2023-24', '2022-23', '2021-22', 'Jan 2021', '2017-18', '2015-16', '2013-14', '2011-12'],
    src: 'IA sir Tender Flow Chart; PPR r.98(5)–(7)',
  },
  {
    id: 'l-otm-steps',
    topic: T,
    title: 'Steps of tender processing under OTM (four phases)',
    ask: 'Prepare a flow chart showing the steps for procurement of works.',
    points: [
      { k: 'Prepare PQ document', alt: ['prequalification document'], d: 'Phase 1, Prequalification (optional).' },
      { k: 'Advertise for PQ invitation', alt: ['PQ advertisement'] },
      { k: 'PQ clarification meeting, submission', alt: ['PQ application'], d: 'Allow min. 21 days.' },
      { k: 'PQ evaluation report and approval', alt: ['approval of PQ list'] },
      { k: 'Prepare tender document and approval', alt: ['tender document'], d: 'Phase 2, Tendering.' },
      { k: 'Advertise invitation for tender (IFT)', alt: ['IFT', 'advertise'] },
      { k: 'Pre-tender meeting, if any', alt: ['pre-tender'] },
      { k: 'Submission of tender', alt: ['submission'], d: 'Min. 21 days NCT, 42 days ICT.' },
      { k: 'Opening of tender by TOC', alt: ['opening', 'ToC'], d: 'Phase 3, Evaluation.' },
      { k: 'Evaluation by TEC', alt: ['evaluation'] },
      { k: 'Approval of TEC recommendation by HOPE', alt: ['approval by HOPE'] },
      { k: 'Issue NOA', alt: ['NOA'], d: 'Phase 4, Contracting.' },
      { k: 'Performance security and sign contract', alt: ['sign contract'], d: 'Slide: allow max. 21 days.' },
    ],
    ordered: true,
    hook: 'Four columns: PQ → Tendering → Evaluation → Contracting (“Please Tender Evaluate Carefully”).',
    seen: ['2021-22'],
    src: 'IA sir “Steps with tentative timeline” p1',
    note: 'Slide: NoA to signing “max. 21 days”; PPR Sch II: accept NOA 7 days, performance security 14 days, sign within 28 days of NOA.',
  },
  {
    id: 'l-tec-role',
    topic: T,
    title: 'Role of the Tender Evaluation Committee (TEC)',
    points: [
      { k: 'Examine and evaluate as per PPR', alt: ['examine and evaluate'] },
      { k: 'Check required documents submitted', alt: ['documents submitted'] },
      { k: 'Check qualification criteria', alt: ['qualification criteria'] },
      { k: 'Check tender meets specification', alt: ['specification'] },
      { k: 'Check arithmetic accuracy of BoQ', alt: ['arithmetic accuracy', 'arithmetic correction'] },
      { k: 'Ask for clarification, if needed', alt: ['clarification'] },
      { k: 'List responsive, non-responsive, rejected', alt: ['responsive list'] },
      { k: 'Recommend award or retender', alt: ['recommend award', 'retender'] },
    ],
    ordered: true,
    hook: 'E-D-Q-S-A-C-L-R: “Every Document Qualifies Some Arithmetic; Clarify, List, Recommend”.',
    seen: ['2017-18', '2016-17', '2015-16'],
    src: 'IA sir GCC+TEC slide 9',
  },
  {
    id: 'l-eval-prelim',
    topic: T,
    title: 'Items checked in preliminary examination',
    ask: 'List the items to be checked for preliminary evaluation of a tender.',
    points: [
      { k: 'Tender and goods are eligible', alt: ['eligibility', 'eligible'] },
      { k: 'Minimum general experience', alt: ['general experience'] },
      { k: 'Minimum similar contract type experience', alt: ['similar contract experience', 'specific experience'] },
      { k: 'Minimum liquid asset', alt: ['liquid asset'] },
      { k: 'VAT & IT related certificate', alt: ['VAT certificate', 'income tax', 'TIN'] },
      { k: 'Valid trade license', alt: ['trade licence'] },
      { k: 'Authorization letter', alt: ['authorisation letter', 'power of attorney'], d: '18-batch solve (TF p.46) puts it first in the second group.' },
      { k: 'All pages duly signed', alt: ['signed pages'] },
      { k: 'Price schedule', alt: ['priced BoQ'] },
      { k: 'Tender validity period', alt: ['validity'] },
      { k: 'Completed tender submission sheet', alt: ['tender submission sheet', 'tender form'] },
      { k: 'Tender security', alt: ['bid security'] },
      { k: 'Any additional condition imposed by tenderer', alt: ['additional condition', 'deviation'] },
    ],
    hook: 'Eligibility + three minimums (experience, similar experience, liquid asset) + two papers (VAT/IT, trade licence) + six sheets (authorization letter, signed pages, price schedule, validity, submission sheet, security) + no conditions.',
    seen: ['2020-21', '2015-16'],
    src: 'IA sir Tender Document slide 11; GCC+TEC slides 7–8 (“Preliminary Security” = preliminary examination); 18-batch TF solve p.46',
    note: 'IA sir’s slides head both groups “Preliminary Security”; the 18-batch solve heads items 1–6 “Preliminary Scrutiny”, 7–12 “Preliminary Security” and the second list “Detailed Examinations”, and adds “Authorization letter”.',
  },
  {
    id: 'l-eval-detailed',
    topic: T,
    title: 'Items checked in detailed examination',
    ask: 'List the items to be checked for detailed evaluation of a tender.',
    points: [
      { k: 'Qualification and experience of key personnel', alt: ['key personnel'] },
      { k: 'Adequacy of plants and equipments', alt: ['plant and equipment', 'equipment'] },
      { k: 'General experience', alt: ['general experience'] },
      { k: 'Similar contract type experience', alt: ['specific experience', 'similar contract'] },
      { k: 'Bank certificate for liquid asset', alt: ['liquid asset', 'bank certificate'] },
      { k: 'Annual average turnover from audit report', alt: ['turnover', 'audit report'] },
      { k: 'Arithmetic correction of prices quoted', alt: ['arithmetic correction'] },
      { k: 'Credit facility available', alt: ['credit facility', 'credit line'] },
    ],
    hook: 'People, Plant, General, Similar, Liquid, Turnover, Arithmetic, Credit — “PP-GS-LT-AC”.',
    seen: ['2020-21', '2017-18', '2016-17', '2015-16'],
    src: 'IA sir Tender Document slide 12; GCC+TEC slide 8',
  },
  {
    id: 'l-eval-steps',
    topic: T,
    title: 'Steps of tender evaluation',
    ask: 'Describe the steps that are followed in tender evaluation.',
    points: [
      { k: 'Tender opening and handover to TEC', alt: ['opening', 'TOS'] },
      { k: 'Declaration of impartiality', alt: ['impartiality', 'no conflict of interest'] },
      { k: 'Preliminary examination', alt: ['preliminary'] },
      { k: 'Detailed (technical) examination', alt: ['detailed examination', 'technical examination', 'responsiveness'] },
      { k: 'Clarification, without changing price', alt: ['clarification'] },
      { k: 'Arithmetic correction', alt: ['arithmetic'] },
      { k: 'Financial evaluation and ranking', alt: ['ranking', 'evaluated price'] },
      { k: 'Post-qualification of lowest', alt: ['post qualification'] },
      { k: 'Evaluation report and recommendation', alt: ['evaluation report', 'recommendation'] },
      { k: 'Approval by HOPE, then NOA', alt: ['approval', 'NOA'] },
    ],
    ordered: true,
    hook: 'O-D-P-D-C-A-F-P-R-A: “Old Dogs Prefer Dry Cat food; Arithmetic Fixes Pet Rations Anyway”.',
    seen: ['2017-18', '2016-17', '2015-16'],
    src: 'IA sir GCC+TEC slides 7–9; PPA s.48–51; PPR r.98, 100; senior note Q30',
  },
  {
    id: 'l-arith-rules',
    topic: T,
    title: 'Rules of arithmetic correction',
    points: [
      { k: 'Unit price prevails over line total', alt: ['unit rate prevails', 'rate prevails', 'unit price prevails'], d: 'ITT 44.1(a); unless an obvious misplacement of the decimal point in the unit price — then the total as quoted governs.' },
      { k: 'Subtotals prevail over total', alt: ['sub-totals prevail', 'subtotal prevails'], d: 'ITT 44.1(b).' },
      { k: 'Words prevail over figures', alt: ['amount in words'], d: 'ITT 44.1(c); unless the words relate to an arithmetic error.' },
      { k: 'Unpriced item covered by other rates', alt: ['no rate quoted', 'deemed covered'], d: 'PPR r.98(12): price not changed.' },
      { k: 'Refusal: non-responsive, security forfeited', alt: ['not accept correction', 'forfeit', 'non-responsive'], d: 'ITT 44.2; PPR r.98(15)(b), r.25(e).' },
    ],
    seen: ['2020-21', '2013-14', '2011-12'],
    src: 'Standard Tender Document ITT 44.1–44.2 (Nafee bhai note Ques-28; 18-batch TF solve pp.44–45); PPR r.98(11)–(15), 25(e)',
  },
  {
    id: 'l-forfeit',
    topic: T,
    title: 'Conditions for forfeiture of tender security',
    ask: 'List the conditions for which the tender security of a bidder can be forfeited.',
    points: [
      { k: 'Withdraws tender after opening, within validity', alt: ['withdraws tender', 'withdrawal'], d: 'PPR r.25(a).' },
      { k: 'Refuses to accept NOA', alt: ['refuses NOA', 'not accept notification of award'], d: 'r.25(b); also no acceptance within 7 days (r.102(4)).' },
      { k: 'Fails to furnish performance security', alt: ['no performance security'], d: 'r.25(c).' },
      { k: 'Refuses to sign the contract', alt: ['not sign contract'], d: 'r.25(d).' },
      { k: 'Rejects arithmetic correction', alt: ['does not accept correction', 'arithmetic correction'], d: 'r.25(e), pursuant to r.98(11).' },
    ],
    hook: '“W-A-P-S-C”: the tenderer Walks away, won’t Accept, won’t Pay security, won’t Sign, won’t accept Correction — every step after opening where he backs out.',
    seen: ['2023-24', '2021-22', '2020-21', '2011-12'],
    src: 'PPR 2008 r.25 (word for word in a-forfeit); Nafee bhai note Ques-20(b) (“Important for Term Final”)',
    note: 'Refusing to extend validity is NOT a forfeiture ground — the security is returned (r.23(2)).',
  },
  {
    id: 'l-postqual',
    topic: T,
    title: 'What post-qualification does',
    points: [
      { k: 'Apply post-qualification criteria in document', alt: ['criteria'] },
      { k: 'Verify qualifications and financial capability', alt: ['financial capability'] },
      { k: 'Contact references on past work', alt: ['references'] },
      { k: 'Visit premises; inspect plant', alt: ['site visit', 'inspection'] },
      { k: 'Fail → next lowest', alt: ['next lowest', 'try next lowest'] },
      { k: 'Done even after prequalification', alt: ['still capable'] },
    ],
    seen: ['2013-14', '2011-12'],
    src: 'PPA s.50; PPR r.93(20), 100',
  },
  {
    id: 'l-jv-conditions',
    topic: T,
    title: 'Conditions for accepting a JV (JVCA) tenderer',
    ask: 'Describe the basic conditions to be fulfilled for accepting a JV contractor.',
    points: [
      { k: 'JV agreement on non-judicial stamp', alt: ['JV agreement', 'stamped agreement'], d: 'Signed by all authorised representatives (Tk 300 stamp).' },
      { k: 'Or notarised letter of intent', alt: ['letter of intent', 'LoI'], d: 'With a copy of the proposed agreement; a bare LoI is not enough.' },
      { k: 'Joint and several liability', alt: ['jointly and severally liable', 'jointly and individually liable', 'jointly liable'], d: 'PPA s.27(3): “jointly and individually liable to the procuring entity”. Sir gives 0 if it is missing.' },
      { k: 'Nominated lead partner / representative', alt: ['lead partner', 'representative'], d: 'Authorised to conduct all business and receive payments.' },
      { k: 'Minimum qualification for each partner', alt: ['partner qualification'] },
      { k: 'Specific experience not aggregated', alt: ['no aggregation'], d: '3 + 2 years ≠ 5 years; 50 + 30 + 20 m spans ≠ 100 m bridge.' },
      { k: 'Composition unchanged before contract', alt: ['no change in composition'], d: 'Later only with HOPE approval and a stronger partner.' },
      { k: 'Partners eligible, not debarred', alt: ['not debarred'] },
      { k: 'One tender per firm', alt: ['only one tender'] },
      { k: 'Securities and insurance in JV’s name', alt: ['performance security in JVCA name'] },
    ],
    hook: 'Paper (agreement / notarised LoI), Liability (joint and several), Leader, Level (each partner’s minimum), no Lumping of experience, Lock (composition), Legal (not debarred), Lone tender, Labels (securities in JV name).',
    seen: ['2015-16', '2014-15', '2011-12'],
    src: 'PPA s.27; PPR r.54, 96(2); RHD EoI notice',
    note: 'Question bank adds “lead ≥ 40–50%, others ≥ 25%” and “≤ 3 partners” — not in IA sir’s material; the RHD EoI says limiting to 3 firms is “preferable”.',
  },
  {
    id: 'l-jv-requirements',
    topic: T,
    title: 'Requirements of a Joint Venture tender (18-batch solve)',
    ask: 'What are the requirements of a Joint Venture tender?',
    points: [
      { k: 'Work distribution', alt: ['distribution of work'], d: 'Must contain details about work distribution.' },
      { k: 'Joint and several liability', alt: ['jointly and severally liable', 'jointly and individually liable'], d: 'For any failure in performance or mismanagement. Sir gives 0 without it.' },
      { k: 'Lead partner with major share', alt: ['lead partner', 'share distribution'], d: 'Lead partner with the major portion of share, the second (and third) partner; share distribution stated.' },
      { k: 'Budget keeps time in control', alt: ['budget'], d: 'Budget designed so that time and duration stay in control.' },
      { k: 'Risk shared as per contribution', alt: ['risk factor', 'risk distribution'], d: 'Risk factor distributed among all parties as per contribution.' },
      { k: 'JV agreement submitted with tender', alt: ['JV agreement', 'part of the contract'], d: 'Becomes a part of the contract when the contract is signed.' },
    ],
    hook: 'W-J-L-B-R-A: “We Join, Lead, Budget, Risk, Agree”.',
    seen: ['2015-16', '2014-15', '2011-12'],
    src: 'Pallab’s 18-batch solve, 2014-15 Q3(a)',
  },
  {
    id: 'l-jv-purposes',
    topic: T,
    title: 'Purposes of a joint venture',
    ask: 'What are the purposes of a joint venture?',
    points: [
      { k: 'Scale efficiency by combining assets', alt: ['scale efficiency', 'combining assets and operations'], d: 'To gain scale efficiency by combining assets and operations.' },
      { k: 'Share risk for major investment', alt: ['share risk'] },
      { k: 'Access skills and capabilities', alt: ['skills'] },
      { k: 'More resources', alt: ['resources'] },
      { k: 'Greater capacity', alt: ['capacity'] },
      { k: 'Increase technical expertise', alt: ['technical expertise'] },
    ],
    seen: [],
    src: 'Nafee bhai note Ques-34 (∗∗)',
  },
  {
    id: 'l-jv-elements',
    topic: T,
    title: 'Essential elements of a joint venture',
    ask: 'What are the essential elements of a joint venture?',
    points: [
      { k: 'Contractual agreement', alt: ['agreement', 'implied agreement'] },
      { k: 'Intention to form a joint venture', alt: ['intention'] },
      { k: 'Joint property interest', alt: ['joint ownership', 'property interest'] },
      { k: 'Joint control over the venture', alt: ['joint control', 'joint operation'] },
      { k: 'Shared profit and losses', alt: ['profit and loss', 'shared profit'] },
    ],
    hook: 'C-I-P-C-S: “Contract, Intention, Property, Control, Share”.',
    seen: [],
    src: 'Nafee bhai note Ques-34 (∗∗)',
    note: 'The note marks three as “major”: joint ownership, joint operation, implied agreement.',
  },
  {
    id: 'l-tos-readout',
    topic: T,
    title: 'Read out and recorded at tender opening (TOS)',
    points: [
      { k: 'Name and address of tenderer', alt: ['name'] },
      { k: 'Withdrawal, substitution or modification', alt: ['modification'] },
      { k: 'Tender price', alt: ['price'] },
      { k: 'Discounts', alt: ['discount'] },
      { k: 'Tender security and amount', alt: ['security'] },
    ],
    seen: [],
    src: 'PPR r.97(4)(f)',
  },
  {
    id: 'l-reject-all',
    topic: T,
    title: 'Grounds for rejecting all tenders',
    points: [
      { k: 'Lowest price exceeds realistic estimate', alt: ['exceeds official estimate'] },
      { k: 'Lack of effective competition', alt: ['no competition'] },
      { k: 'Cannot complete in stipulated time', alt: ['completion time'] },
      { k: 'All tenders non-responsive', alt: ['non-responsive'] },
      { k: 'Professional misconduct established', alt: ['misconduct'] },
      { k: 'Negotiations fail (consultancy)', alt: ['negotiation fails'] },
    ],
    seen: [],
    src: 'PPR r.33(2)',
  },
  {
    id: 'l-complaint-chain',
    topic: T,
    title: 'Complaint chain under PPR',
    points: [
      { k: 'Officer who issued the document', alt: ['procuring entity officer', 'project director'] },
      { k: 'Head of the Procuring Entity', alt: ['HOPE'] },
      { k: 'Secretary of the Ministry/Division', alt: ['secretary'] },
      { k: 'Review Panel (through CPTU)', alt: ['review panel'] },
    ],
    ordered: true,
    seen: [],
    src: 'PPA s.29–30; PPR r.57–60',
  },
]

// ---------- cards ----------
const cards: PcCard[] = [
  { id: 'c-proc-responsive', topic: T, front: 'What makes a tender “responsive”?', back: 'It complies with all mandatory requirements of the tender document **without material deviation or reservation** (PPR r.98(5)); “qualified for consideration on the basis of evaluation criteria … specified in the tender document” (PPA s.2(28)).', src: 'PPR r.98(5)' },
  { id: 'c-proc-material-dev', topic: T, front: 'What is a material deviation?', back: 'One that substantially affects the **scope, quality or performance** of the works; substantially limits the PE’s rights or the tenderer’s obligations; or whose rectification would **unfairly affect other tenderers**. Minor deviations are quantified in money and the tender stays responsive.', src: 'PPR r.98(6)–(7)' },
  { id: 'c-proc-validity', topic: T, front: 'What is the guideline for determining the time frame for the tender validity period? (class question)', back: 'PPA s.14(a): the validity period shall be determined in a way sufficient to **complete the evaluation** of tenders, a **comparative assessment**, and to **obtain all necessary approvals** so that the **NOA** can be issued within it. First extension: **head of the procuring entity**; second: **next higher level of authority**. Generally **90–120 days** (class); PPR: 60–120.', src: 'PPA s.14(a) (class question in the annotated PPA); Nafee bhai note Ques-19; PPR r.19–21, Sch II' },
  { id: 'c-proc-ts-amount', topic: T, front: 'How is the tender security amount fixed?', back: 'As a **rounded fixed amount**, never stated as a %, **≤ 3% of the official estimate**, set slightly lower than the % figure so tenderers cannot work out the estimate (PPR r.22(3)–(4)). Teacher’s slide: “say, 2–3% of project cost”.', src: 'PPR r.22, Sch II; IA sir TD slide 5' },
  { id: 'c-proc-ts-validity', topic: T, front: 'Tender security — purpose, form and validity?', back: 'To **discourage tenders with ill motive**. Bank draft, pay order or bank guarantee of a scheduled bank; valid **28 days beyond the tender validity**.', src: 'PPR r.22' },
  { id: 'c-proc-ts-notneeded', topic: T, front: 'When is no tender security asked?', back: '**DPM and RFQ** (PPR r.22(6)); not mandatory in **LTM** (PPA s.14(b)); not in the first stage of two-stage; never for consultancy proposals (s.14(d)).', src: 'PPA s.14; PPR r.22, 66' },
  { id: 'c-proc-ts-return', topic: T, front: 'When are tender securities returned?', back: 'Never at opening. Non-responsive: after the evaluation report is approved. Responsive: after the winner signs and gives performance security. Others notified unsuccessful and paid back after signing (PPA s.53).', src: 'PPR r.26' },
  { id: 'c-proc-noa-times', topic: T, front: 'NOA time limits?', back: 'Issued within **7 working days** of approval and before validity expires. Accepted in writing within **7 days**; performance security within **14 days** of acceptance (28 for international); contract signed within **28 days** of NOA.', src: 'PPR r.102, Sch II, Sch VII' },
  { id: 'c-proc-reject-all', topic: T, front: 'Can the procuring entity reject all tenders? (PPA s.19)', back: '“The procuring entity may, subject to the specification in the tender or proposal document, **reject all tenders, proposals or quotations** at any time **prior to the issue of the notification of award** of contract, following the prescribed procedures” (s.19(1)). Actions after rejection are prescribed by rules (2); **no liability** of the procuring entity shall be imposed upon any person (3).', src: 'PPA 2006 s.19 (Nafee bhai note Ques-29(b), “THE END OF PPA”; 18-batch TF solve, extra questions discussed by Sir in class); grounds: PPR r.33(2) (l-reject-all)' },
  { id: 'c-proc-noa-contract', topic: T, front: 'What is NOA, and what is its legal effect?', back: 'NOA (Notification of Award) means the official notice issued by the employer notifying the contractor that his bid has been accepted. It **establishes the contract** — “shall constitute the formation of this Contract which shall become binding upon you”; signing the contract confirms it (PPR r.102(6), Sch VII).', src: 'Nafee bhai note Ques-30 (∗∗∗); PPR r.102(6)' },
  { id: 'c-proc-tec', topic: T, front: 'Composition of the Tender Evaluation Committee?', back: '**5 to 7 members**, at least **2 from outside** the ministry/agency; low-value: 3 members. Each signs a declaration of impartiality; report sent sealed **directly to the approving authority**.', src: 'PPA s.7; PPR r.8, Sch II' },
  { id: 'c-proc-toc', topic: T, front: 'Tender Opening Committee and opening rules?', back: '3 members (Chair, Member, Member-Secretary) incl. **1 from the TEC**. Opens in public within **1 hour** of the deadline; no tender rejected at opening; late tenders returned unopened.', src: 'PPA s.6, 46–47; PPR r.97, Sch II' },
  { id: 'c-proc-no-nego', topic: T, front: 'May the TEC negotiate with the lowest tenderer?', back: '**No** — no negotiation, no lottery (PPA s.49). Exceptions: DPM, bulk divisible commodities, and price far above the estimate (scope reduction / risk reallocation, PPR r.99(1)(c)).', src: 'PPA s.49; PPR r.99' },
  { id: 'c-proc-low-price', topic: T, front: 'Tender far below the official estimate — what does TEC do?', back: 'Investigates; non-responsive if the tenderer is inexperienced or cannot justify the price; responsive if due to favourable conditions (e.g. equipment already near the site).', src: 'PPR r.98(23)–(24)' },
  { id: 'c-proc-front-load', topic: T, front: 'What is front loading and the remedy?', back: 'Unbalanced pricing: high rates on early items, low on later ones. TEC asks for a **detailed price breakdown** and may raise the **performance security — max 20%** of contract value (PPR r.98(13), r.27(2)).', src: 'PPR r.27, 98(13), Sch II', seen: ['2011-12'] },
  { id: 'c-proc-tie', topic: T, front: 'Two tenders tie for the lowest price — who wins?', back: 'The one with **superior past performance** with the PE; else better programme/methodology (works) or better quality (goods). **Never by lottery**.', src: 'PPR r.98(31)–(33)' },
  { id: 'c-proc-single', topic: T, front: 'Only one tender received — can it be awarded?', back: 'Yes, if widely advertised, fully compliant and the price is close to the estimate and market price; the report explains why (PPR r.98(14),(29)–(30)).', src: 'PPR r.98' },
  { id: 'c-proc-contract-price', topic: T, front: 'Define contract price.', back: '“The price stated in the **Notification of Award** and thereafter as **adjusted in accordance with the provisions of the Contract**” — variations, compensation events, price adjustment, measured quantities (PPR r.2(12)).', src: 'PPR r.2(12)', seen: ['2013-14'] },
  { id: 'c-proc-complaint-not', topic: T, front: 'What cannot be complained about under PPA s.29?', back: 'The choice of procurement method; refusal to short-list; a decision to reject applications/tenders; an award approved by the Cabinet Committee on Government Purchase.', src: 'PPA s.29(2)' },
  { id: 'c-proc-review-panel', topic: T, front: 'Review Panel — who and how fast?', back: '3 specialists (legal, procurement-technical, contract-management), **no public servant**; appeal via CPTU with fee and security deposit; decision within **12 working days**; final. NOA suspended meanwhile.', src: 'PPA s.30; PPR r.58–60, Sch II' },
  { id: 'c-proc-jv-def', topic: T, front: 'What is a joint venture?', back: 'A business entity created by two or more parties generally characterized by **shared ownership, shared returns and risks and shared governance**. Essential (major): joint ownership, joint operation, implied agreement.', src: 'Senior note Q6', seen: ['2011-12'] },
  { id: 'c-jv-s27', topic: T, front: 'What does PPA s.27 say about joint ventures? (discussed by Sir in class)', back: '(1) Any Person may, individually or in joint venture along with another person or persons, national or foreign, submit an application, an expression of interest, a proposal or a tender. (2) No condition shall be imposed making it **mandatory** to tender under joint venture. (3) All such persons shall be **jointly and individually liable** to the procuring entity (**joint and several liability**).', src: 'PPA 2006 s.27; 18-batch TF solve p.33 (“extra questions discussed by Sir in class”)' },
]

// ---------- answers ----------
const answers: PcAnswer[] = [
  {
    id: 'a-tender-flow',
    topic: T,
    q: 'Describe the tender process using a flow-chart.',
    seen: ['2023-24', '2022-23', '2021-22', 'Jan 2021', '2017-18', '2015-16', '2013-14', '2011-12'],
    a: `### Flow chart (draw it) — then one line per box
1. **Tender notice** — Invitation for Tender advertised in one Bangla and one English daily and websites (PPA s.40); min. 21 days NCT, 42 days ICT.
2. **Interested bidders buy tender documents** — sold to all up to the day before the deadline.
3. **Pre-tender meeting** (if any) — queries answered; minutes and addenda to all buyers.
4. **Tender submission** — sealed, signed, with **tender security**, before the deadline; late tenders returned unopened.
5. **Tender opening** — Tender Opening Committee opens in public; reads name, price, discount, security.
6. **Tender evaluation by TEC** — preliminary and detailed examination, clarification, **arithmetic correction**, ranking.
7. **Outcome of tender evaluation** — **responsive**, **substantially responsive** (obtain clarification → responsive or non-responsive), **non-responsive**, **rejected**.
8. **Lowest bidder** — lowest evaluated responsive tenderer.
9. **Post-qualification** — OK → approval; Not OK → **try next lowest**.
10. **Approval from HOPE** — No, or none responsive / none post-qualifies → **cancel the process and arrange re-tender**.
11. **Invited to contract — NOA** within tender validity (no complaint pending).
12. **Contract sign** after performance security.
13. **Contractor**.

Sir's 12 May 2015 chart has no separate opening box (pre-tender meeting → submission → evaluation by TEC); his GCC+TEC slide shows Tender Opening — either is accepted.`,
    keys: ['Tender notice', 'buy tender documents', 'Pre-tender meeting', 'Tender submission', 'tender security', 'Tender opening', 'Tender evaluation by TEC', 'substantially responsive', 'Lowest bidder', 'Post-qualification', 'try next lowest', 'Approval from HOPE', 're-tender', 'NOA', 'Contract sign'],
    lists: ['l-tender-flow', 'l-tender-outcomes'],
    src: 'IA sir Tender Flow Chart (12 May 2015); GCC+TEC slides 6–7; PPA s.40–53',
    Fig: TenderFlowFig,
  },
  {
    id: 'a-otm-steps',
    topic: T,
    q: 'Prepare a flow chart showing the steps for procurement of works (OTM).',
    seen: ['2021-22'],
    a: `### Prequalification (optional) → Tendering → Evaluation → Contracting

| Prequalification (optional) | Tendering | Evaluation | Contracting |
|---|---|---|---|
| Prepare PQ document | Prepare tender document + approval | Opening of tender by TOC | Issue NOA |
| Advertise for PQ invitation | Advertise invitation for tender (IFT) | Evaluation by TEC | Obtain performance security and sign contract |
| PQ clarification meeting (if any) | Pre-tender meeting, if any | Approval of TEC's recommendation by HOPE | |
| Submission of PQ application (allow min. 21 days) | Submission of tender (min. **21 days NCT**, **42 days ICT**) | | (allow max. 21 days) |
| PQ evaluation report; approval of PQ list | | | |

Before these: the package is in the approved **procurement plan**, the specification and **official cost estimate** are prepared (PPR Sch III). After: contract administration.

PPR detail: NOA accepted within 7 days, performance security within 14 days, contract signed within 28 days of NOA.`,
    keys: ['Prequalification', 'Tendering', 'Evaluation', 'Contracting', 'PQ document', 'invitation for tender', 'Pre-tender meeting', '21 days NCT', '42 days ICT', 'TOC', 'TEC', 'HOPE', 'Issue NOA', 'performance security', 'procurement plan'],
    lists: ['l-otm-steps'],
    src: 'IA sir “Steps with tentative timeline” p1; PPR Sch II, Sch III Part B',
  },
  {
    id: 'a-eval-steps',
    topic: T,
    q: 'Describe the steps followed in tender evaluation (and the role of the TEC).',
    seen: ['2017-18', '2016-17', '2015-16'],
    a: `### Role of TEC (slide)
Examine and evaluate the tenders as per PPR 2008; check all required documents; check qualification criteria; check the specification; check arithmetic accuracy of BoQ; ask for clarification; prepare a list of responsive, non-responsive and rejected tenders; recommend award or retender.

### Steps
1. **Tender opening** — TOC opens in public, prepares the Tender Opening Sheet, hands tenders to the TEC.
2. **Declaration of impartiality** — each TEC member signs; evaluation only on **pre-disclosed criteria**.
3. **Preliminary examination** — eligibility, trade licence, VAT & IT certificates, signed pages, price schedule, validity, submission sheet, **tender security**, minimum experience and liquid asset.
4. **Detailed examination** — key personnel, plant and equipment, general and similar experience, liquid asset, turnover, credit facility; compliance with **specification**; material vs minor deviation.
5. **Clarification** — in writing, no change of price or substance.
6. **Arithmetic correction** — tenderer notified; must accept.
7. **Financial evaluation** — evaluated price, ranking in ascending order.
8. **Post-qualification** of the lowest; fail → next lowest.
9. **Evaluation report** — responsive, non-responsive, rejected; recommendation; sent sealed to the approving authority.
10. **Approval by HOPE** → NOA within tender validity.`,
    keys: ['Role of TEC', 'Tender opening', 'Declaration of impartiality', 'pre-disclosed criteria', 'Preliminary examination', 'tender security', 'Detailed examination', 'specification', 'Clarification', 'Arithmetic correction', 'Financial evaluation', 'Post-qualification', 'Evaluation report', 'Approval by HOPE'],
    lists: ['l-eval-steps', 'l-tec-role'],
    src: 'IA sir GCC+TEC slides 7–9 (role of TEC); Nafee bhai note Ques-27/30 (marked TF: checklist + 8 steps = the slide’s role of TEC); PPA s.7, 48–51; PPR r.98, 100. Pallab’s 2015-16 solve pastes PPR r.8 (committee) instead — weak.',
  },
  {
    id: 'a-eval-items',
    topic: T,
    q: 'List the items to be checked for preliminary and detailed evaluation to determine the responsiveness of a tender.',
    seen: ['2020-21', '2015-16'],
    a: `### Preliminary examination (slide: “Preliminary Security”)
1. **Tender and goods are eligible**
2. **Minimum general experience**
3. **Minimum similar contract type experience**
4. **Minimum liquid asset**
5. **VAT & IT related certificate**
6. **Valid trade license**
7. **Authorization letter**
8. **All pages duly signed**
9. **Price schedule**
10. **Tender validity period**
11. **Completed tender submission sheet**
12. **Tender security**
13. Any **additional condition** imposed by the tenderer

### Detailed examination (“Detailed Examinations”)
1. Qualification and experience of **key personnel**
2. Adequacy of **plants and equipments**
3. General experience
4. Similar contract type experience
5. **Bank certificate for liquid asset**
6. **Annual average turnover** from audit report
7. **Arithmetic correction** of prices quoted
8. **Credit facility** available

A tender passing all is **responsive**; minor deviations → substantially responsive (clarify); material deviation → non-responsive.`,
    keys: ['Preliminary examination', 'eligible', 'general experience', 'liquid asset', 'VAT & IT', 'trade license', 'duly signed', 'Tender validity', 'Tender security', 'Detailed examination', 'key personnel', 'plants and equipments', 'turnover', 'Arithmetic correction', 'Credit facility', 'responsive'],
    lists: ['l-eval-prelim', 'l-eval-detailed'],
    src: 'IA sir Tender Document slides 11–12; GCC+TEC slides 7–8; 18-batch TF solve p.46',
  },
  {
    id: 'a-arith-correction',
    topic: T,
    q: 'What is arithmetic correction? Describe its rules with an example.',
    seen: ['2020-21', '2013-14', '2011-12'],
    a: `**Arithmetic correction** refers to the process of correcting errors in the arithmetic calculations used to determine the prices and totals submitted by tenderers — mistakes in individual line items and in the addition or multiplication of those items. It is important because without it errors could **unfairly advantage or disadvantage** certain tenderers and could compromise the integrity of the evaluation process. A TEC shall correct any arithmetic errors discovered during the examination of tenders and shall **promptly notify** the concerned tenderer (PPR r.98(11)).

### Rules (Standard Tender Document, ITT 44)
**44.1** Provided that the Tender is responsive, the TEC shall correct arithmetical errors on the following basis:
- (a) if there is a discrepancy between the unit price and the line item total price that is obtained by multiplying the unit price and quantity, the **unit price will prevail** and the line item total price shall be corrected, unless in the opinion of the TEC there is an **obvious misplacement of the decimal point** in the unit price, in which case the total price as quoted will govern and the unit price will be corrected; and
- (b) if there is an error in a total corresponding to the addition or subtraction of subtotals, the **subtotals shall prevail** and the total shall be corrected; and
- (c) if there is a discrepancy between words and figures, the **amount in words shall prevail**, unless the amount expressed in words is related to an arithmetic error, in which case the amount in figures shall prevail subject to (a) and (b) above.

**44.2** TEC shall correct the arithmetic errors and shall promptly notify the concerned Tenderer(s). If the Tenderer does not accept the correction of arithmetic errors, its Tender shall be considered **non-responsive**.

PPR 2008 adds: an item with **no rate quoted** is deemed covered by the other rates and the tender price is not changed (r.98(12)); a tenderer who does not accept the correction is not evaluated further (r.98(15)(b)) and its **tender security is forfeited** (r.25(e)).

### Example
Supply of 100 air conditioners:

| Item | Quantity | Price per unit (Tk.) | (In word) | Total Price (Tk.) | (In word) |
|---|---|---|---|---|---|
| Air Conditioner | 100 | 2,00,000 | 2 lakh Tk. | 20,00,000 | 20 lakh Tk. |

100 × 2,00,000 = 2,00,00,000. By 44.1(a) the unit price prevails, so the TEC corrects the total to **Tk 2 crore**, notifies the tenderer to accept it, and continues the evaluation on the corrected price.`,
    keys: ['Arithmetic correction', 'unfairly advantage or disadvantage', 'promptly notify', '44.1', 'unit price will prevail', 'obvious misplacement of the decimal point', 'subtotals shall prevail', 'amount in words shall prevail', '44.2', 'non-responsive', 'no rate quoted', 'tender security is forfeited', 'Tk 2 crore'],
    lists: ['l-arith-rules'],
    src: 'Standard Tender Document ITT 44.1–44.2 and the air-conditioner example (Nafee bhai note Ques-28 = 18-batch TF solve pp.44–45); PPR 2008 r.25(e), 98(11)–(15)',
  },
  {
    id: 'a-postqual',
    topic: T,
    q: 'What is post-qualification?',
    seen: ['2013-14', '2011-12'],
    a: `**Post-qualification** is the TEC's check, before finishing the evaluation report, that the **lowest evaluated responsive tenderer** has the **requisite qualifications and financial capability** to carry out the contract (PPA s.50).
1. Applies the **post-qualification criteria** stated in the tender document (experience, personnel, equipment, turnover, liquid asset).
2. **Contacts references** on previous work and **verifies the truth** of the submitted documents (bank and land statements); if any is found false, the tender is rejected.
3. May **visit the premises** — a general, visual inspection of facilities, plant and equipment; no discussion of the tender.
4. If the lowest fails → the **next lowest** is checked, and so on; if remaining prices are far above the estimate → re-tender.
5. Done **even if prequalification was carried out** — then it checks the tenderer is **still capable** (PPR r.93(20), 100(7)).

In the flow chart: Post-qualification OK → HOPE approval; Not OK → try next lowest.

(The question bank calls it a replacement for prequalification; PPR requires it in every case.)`,
    keys: ['Post-qualification', 'lowest evaluated responsive tenderer', 'financial capability', 'post-qualification criteria', 'references', 'verifies the truth', 'visit the premises', 'next lowest', 'even if prequalification', 'still capable'],
    lists: ['l-postqual'],
    src: 'PPA s.50; PPR r.93(20), 100; IA sir flow chart; Nafee bhai note Ques-29(a)',
  },
  {
    id: 'a-contract-price',
    topic: T,
    q: 'What is the contract price?',
    seen: ['2013-14'],
    a: `**Contract price** is “the price stated in the **Notification of Award** and thereafter as **adjusted in accordance with the provisions of the Contract**” (PPR r.2(12)).
1. Starts as the **tender price after arithmetic correction** and accepted discounts, as approved.
2. **Unit-rate (BoQ) contract**: final price = actual measured quantities × BoQ rates; **lump-sum**: fixed regardless of quantity (r.38(8)).
3. Adjusted for **variations** and extra work, **compensation events**, **price adjustment** (contracts over 18 months), less liquidated damages.`,
    keys: ['Contract price', 'Notification of Award', 'adjusted in accordance with the provisions', 'arithmetic correction', 'Unit-rate', 'lump-sum', 'variations', 'compensation events', 'price adjustment'],
    src: 'PPR r.2(12), 5(4), 38(8)',
  },
  {
    id: 'a-forfeit',
    topic: T,
    q: 'List the conditions for which the tender security of a bidder can be forfeited.',
    seen: ['2023-24', '2021-22', '2020-21', '2011-12'],
    a: `Tender security is taken “to discourage the submission of tenders with ill motive”.

Under **PPR 2008 r.25(1)** a Tender security shall be **forfeited** if the Tenderer —
1. (a) **withdraws** his Tender **after the opening** of Tenders but within the validity of the Tender security; or
2. (b) **refuses to accept a Notification of Award**; or
3. (c) **fails to furnish performance security**, if so required; or
4. (d) **refuses to sign the Contract**; or
5. (e) **does not accept the correction** of the Tender amount following the correction of **arithmetic errors** pursuant to Rule 98(11).

Also: no written acceptance of the NOA within 7 days → security forfeited (r.102(4)). Not a forfeiture ground: refusing to extend tender validity — the security is returned (r.23(2)).`,
    keys: ['r.25', 'forfeited', 'withdraws', 'after the opening', 'refuses to accept a Notification of Award', 'fails to furnish performance security', 'refuses to sign the Contract', 'arithmetic errors'],
    lists: ['l-forfeit'],
    src: 'PPR 2008 r.22, 25, 102(4); senior note Q17',
  },
  {
    id: 'a-jv',
    topic: T,
    q: 'What are the requirements of a Joint Venture tender (conditions for accepting a JV contractor)?',
    seen: ['2015-16', '2014-15', '2011-12'],
    a: `A **joint venture** is a business entity created by two or more parties generally characterized by shared ownership, shared returns and risks and shared governance.

### Requirements of a JV tender
1. Must contain details about **work distribution**.
2. For any kind of failure in performance or mismanagement, **joint and several liability** clauses should be mentioned.
3. Should mention the **lead partner with major portion of share**, the second partner, also the third if there is one; **share distribution** should also be mentioned.
4. **Budget** must be established and designed in such a way that the time and duration stay in control.
5. **Risk factor** should be distributed among all the parties as per contribution.
6. **JV agreement should be submitted with tender**; when the contract is signed, that agreement shall become a part of the contract.

### PPA 2006 s.27 (word for word)
- (1) Any Person may, individually or in joint venture along with another person or persons, national or foreign, submit an application, an expression of interest, a proposal or a tender.
- (2) In the prequalification, expression of interest or tender or proposal document under this section, no such condition shall be imposed making it mandatory to submit an application, an expression of interest, a proposal or a tender under joint venture.
- (3) In the case of a joint venture among persons, all such persons shall be jointly and individually liable to the procuring entity. (**Joint and several liability**)

### Conditions in PPR 2008 r.54 (JVCA = Joint Venture, Consortium or Association)
1. **JV agreement** on a non-judicial stamp signed by all authorised representatives — or a **letter of intent** signed by all partners, **notarised**, with the proposed agreement (r.54(1)–(3)).
2. A **nominated representative / lead partner** authorised to act and receive payments for all (r.54(5)).
3. **Minimum qualification** for the lead and the other partners, as in the TDS (r.54(6)).
4. **Specific experience is not aggregated** (50 + 30 + 20 m spans ≠ a 100 m bridge) (r.54(12)–(13)).
5. **Composition unchanged** before contract execution; later only with HOPE approval (r.54(9)–(10)).
6. Every partner **not debarred**; a firm submits **only one tender** (r.54(11), r.96(2)).
7. **Performance security, insurance** and indemnity in the name of the JVCA (r.54(14)).

Sir: an answer without "joint and several liability" gets 0. For 5 marks write s.27 and requirements 1–3.`,
    keys: ['joint venture', 'work distribution', 'joint and several liability', 'lead partner with major portion of share', 'share distribution', 'Budget', 'Risk factor', 'JV agreement should be submitted with tender', 'jointly and individually liable', 'mandatory', 'JVCA', 'letter of intent', 'notarised', 'Specific experience is not aggregated', 'Composition unchanged'],
    lists: ['l-jv-requirements', 'l-jv-conditions'],
    src: 'Pallab’s 18-batch solve, 2014-15 Q3(a) (six requirements); PPA 2006 s.27 (18-batch TF solve p.33; Nafee note PYQ-27 “(Joint and several liability)”); PPR r.54, 96(2); Nafee bhai note Ques-34 (definition; “Sir said: no joint and several liability = 0”)',
  },
  {
    id: 'a-jv-agreement',
    topic: T,
    q: 'Prepare a Joint Venture Agreement to submit in the tender of works.',
    seen: [],
    a: `A **joint venture** is a business entity created by two or more parties generally characterized by shared ownership, shared returns and risks and shared governance. The agreement is submitted with the tender and becomes part of the contract if the tender is accepted.

### JOINT VENTURE AGREEMENT — Construction of 15 storied Residential Building for Engineers and Staff at Rooppur, Ishwardi, Pabna
This Joint Venture Agreement is made and entered into on [date], **by and between**:
1. **Abdul Monem Limited ("AML")**, a construction firm existing under the laws of Bangladesh, engaged in building construction ("Party A");
2. **Clandevous Electrics Ltd. ("CEL")**, an electrical system management organization existing under the laws of Bangladesh, engaged in electrical fittings ("Party B");

collectively the "Parties".

**RECITALS** — The Parties intend to combine their strengths by establishing a joint venture (the "Cerca Trova") to tender for and execute the above work. NOW, THEREFORE, in consideration of the recitals and the agreements contained, and intending to be legally bound, the Parties agree as follows:

1. **Purpose of Agreement** — to submit a joint tender to the Procuring Entity and, if awarded, to jointly execute and complete the works.
2. **Scope of Responsibilities** — AML completes the construction project without electrical fittings; CEL completes the electrical fittings of the whole project.
3. **Lead Partner** — AML is designated as the Lead Partner; it submits the tender and is the main channel of communication with the Procuring Entity.
4. **Contribution and Ownership** — AML contributes 80% and CEL 20% of the total work expenses; ownership is distributed 80% to AML and 20% to CEL.
5. **Liabilities** — AML and CEL each shall have **joint and several liability**; both Parties acknowledge joint and several liability toward the Procuring Entity for complete project execution.
6. **Confidential Information** — not revealed without the express prior written consent of the discloser.
7. **Term and Termination** — the agreement concludes on project completion or rejection of the tender, and may be terminated earlier for an uncorrected material breach.
8. **Default** — insolvency or bankruptcy of either party; levy, seizure or general assignment of a party's property for the benefit of creditors; any violation of this Agreement.
9. **Amendment** — only in writing, signed by the Parties.
10. **Governing Law** — the laws of Bangladesh; a dispute not settled amicably goes to **arbitration** under the Arbitration Act of Bangladesh.

**IN WITNESS WHEREOF**, the Parties have executed this Agreement as of the date first written above.

| For AML | For CEL |
|---|---|
| Signature, name, CEO | Signature, name, CEO |

Sir: no "joint and several liability" → 0 marks. The note's long version has 15 clauses (adds Financial Accounting, Severability, Waiver of Contractual Right, Entire Agreement); this term's assignment used six headings (Purpose of Agreement, Scope of Responsibilities, Leadership and Tender Management, Cost & Revenue Sharing, Liabilities and Termination, Governing Law).`,
    keys: ['joint venture', 'by and between', 'RECITALS', 'Purpose of Agreement', 'Scope of Responsibilities', 'Lead Partner', 'Contribution', 'joint and several liability', 'Default', 'Governing Law', 'arbitration', 'IN WITNESS WHEREOF'],
    lists: ['l-jv-purposes', 'l-jv-elements'],
    src: 'This term’s Assignment 3 (JV agreement, SCC free Wi-Fi; Simanto 2204049); Nafee bhai note Ques-34 (∗∗, AML–CEL agreement, “Sir said: no joint and several liability = 0”); 18-batch TF solve pp.11–13',
  },
  {
    id: 'a-front-loading',
    topic: T,
    q: 'What is front loading?',
    seen: ['2011-12'],
    a: `**Front loading** is an **unbalanced tender**: the tenderer quotes **high rates for items executed early** (mobilisation, earthwork, foundation, lower floors) and **low rates for later items**, keeping the total competitive — “in the hope of profit” early in the job.
1. Effect: the contractor gets **early cash**; the employer is exposed if the contractor abandons the work after the early items.
2. Remedy: the TEC requires a **detailed price breakdown** and may recommend a **higher performance security** (PPR r.98(13)), up to a **maximum of 20%** of the contract value (r.27(2), Sch II); retention also protects the employer.`,
    keys: ['Front loading', 'unbalanced tender', 'high rates for items executed early', 'early cash', 'detailed price breakdown', 'higher performance security', '20%'],
    src: 'PPR r.27(2), 98(13), Sch II; senior note Q24 (says “25%” — PPR cap is 20%)',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
