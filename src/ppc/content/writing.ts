// pc-writing — reports, abstracts, proposals (business messages are their own topic: msg.tsx).
// Sources: Noor sir's slides L05 (Writing Project Proposals), L06 (Reports), L08 (Preparing Effective Business
// Messages) and L02 (abstraction) — almost word for word Kabirul sir's set, which the 18-batch solve (Shafi) copies.
// Lists, cards and answers follow the slide wording. Only "why reports are important" has no slide (18-batch solve).
// Figures are built with createElement so the file can stay .ts.
import { createElement as h, type FC, type ReactNode } from 'react'
import type { PcTopicContent } from '../types'

const T = 'pc-writing' as const
const S2 = 'Noor sir L02 slides (differences in perception of reality)'
const S5 = 'Noor sir L05 slides (Writing Project Proposals)'
const S6 = 'Noor sir L06 slides (Reports)'
const SH = '18-batch solve (Shafi) copies the same bullets'

// ---------- figures (theme tokens only) ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel = 'var(--c-panel)'
const panel2 = 'var(--c-panel2)'
const aan = 'var(--c-aan)'

const box = (x: number, y: number, w: number, hgt: number, t: string[], strong = false): ReactNode =>
  h(
    'g',
    null,
    h('rect', { x, y, width: w, height: hgt, rx: 5, fill: panel2, stroke: strong ? aan : line, strokeWidth: strong ? 2 : 1.3 }),
    ...t.map((s, i) =>
      h('text', { x: x + w / 2, y: y + hgt / 2 + 4 - ((t.length - 1) * 13) / 2 + i * 13, textAnchor: 'middle', fontSize: 11.5, fill: ink }, s),
    ),
  )
const wire = (d: string, arrow = false): ReactNode =>
  h('path', { d, fill: 'none', stroke: mute, strokeWidth: 1.4, markerEnd: arrow ? 'url(#pc-arr-w)' : undefined })
const arrowDef = (): ReactNode =>
  h(
    'defs',
    null,
    h('marker', { id: 'pc-arr-w', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, h('path', { d: 'M0,0 L10,5 L0,10 z', fill: mute })),
  )

const CHRONO: string[][] = [
  ['1. Soliciting company publicly announces the project', '(professional publications, newspapers, or writes to companies)'],
  ['2. Contracting companies submit preliminary proposals'],
  ['3. Soliciting company reviews, eliminates some companies,', 'establishes short list of finalists'],
  ['4. Soliciting company asks each finalist for a highly', 'detailed proposal and sets deadlines'],
  ['5. Finalists select written and oral presentation teams;', 'several editions of the proposal; oral rehearsals'],
  ['6. Finalists submit proposals;', 'dates established for oral presentation'],
  ['7. Finalist companies make their presentation'],
  ['8. Finalist companies wait for response'],
]

const ChronologyFig: FC = () =>
  h(
    'svg',
    { viewBox: '0 0 440 404', width: '100%', role: 'img', 'aria-label': 'Flow chart: chronology of procedures for solicited major proposals, eight steps' },
    arrowDef(),
    ...CHRONO.flatMap((t, i) => {
      const y = 6 + i * 50
      return [box(20, y, 400, 38, t, i === 0 || i === 7), i < 7 ? wire(`M220,${y + 38} V${y + 49}`, true) : null]
    }),
  )

const FormatsFig: FC = () =>
  h(
    'svg',
    { viewBox: '0 0 600 236', width: '100%', role: 'img', 'aria-label': 'Tree: formats of short reports' },
    box(200, 6, 200, 28, ['Formats of short reports'], true),
    wire('M300,34 V50 M75,50 H485 M75,50 V66 M260,50 V66 M485,50 V66'),
    box(10, 66, 130, 38, ['Letter report']),
    box(160, 66, 200, 38, ['Informational', 'memorandum report']),
    box(380, 66, 210, 38, ['Interpretative / analytical', 'memorandum report']),
    h('text', { x: 75, y: 122, textAnchor: 'middle', fontSize: 11, fill: mute }, 'letter form, to a reader'),
    h('text', { x: 75, y: 136, textAnchor: 'middle', fontSize: 11, fill: mute }, 'outside the organization'),
    wire('M176,104 V209 M176,141 H192 M176,175 H192 M176,209 H192'),
    box(192, 128, 160, 26, ['Conference report']),
    box(192, 162, 160, 26, ['Progress report']),
    box(192, 196, 160, 26, ['Periodic report']),
    wire('M396,104 V184 M396,141 H412 M396,184 H412'),
    box(412, 128, 170, 26, ['Personnel report']),
    box(412, 164, 170, 40, ['Recommendation-', 'justification report']),
  )

const PARTS_COLS: { head: string; rows: [string, boolean?][] }[] = [
  {
    head: 'Prefatory parts',
    rows: [
      ['Cover, with title'],
      ['Inside title page'],
      ['Table of contents (TOC)'],
      ['List of tables and/or figures'],
      ['Request for proposal letter'],
      ['Response to proposal'],
      ['Description of owner’s requirement'],
      ['Schedule for selecting personnel'],
      ['Executive summary or abstract'],
      ['Draft contract'],
    ],
  },
  {
    head: 'Body',
    rows: [
      ['Introduction', true],
      ['Problem · Need · Scope'],
      ['Background'],
      ['Objective or purpose'],
      ['Project team'],
      ['Procedures', true],
      ['Methods, procedures, sources'],
      ['Plan of attack'],
      ['Sequence of activities'],
      ['Equipment, facilities, products'],
      ['Personnel qualifications'],
      ['Budget of costs, prices, total bids'],
    ],
  },
  {
    head: 'Supplementary parts',
    rows: [['Maps, graphs, tables, charts'], ['Letter of support'], ['Letter of endorsement'], ['References'], ['Forms'], ['Table of definition'], ['Project schedules']],
  },
]

const ProposalPartsFig: FC = () =>
  h(
    'svg',
    { viewBox: '0 0 640 250', width: '100%', role: 'img', 'aria-label': 'Three parts of a proposal: prefatory parts, body, supplementary parts' },
    ...PARTS_COLS.flatMap((c, ci) => {
      const x = 4 + ci * 214
      return [
        h('rect', { x, y: 4, width: 204, height: 242, rx: 6, fill: panel, stroke: line, strokeWidth: 1.2 }),
        box(x + 8, 10, 188, 26, [c.head], true),
        ...c.rows.map(([s, head], ri) =>
          h('text', { x: x + (head ? 12 : 20), y: 56 + ri * 16, fontSize: 11, fill: head ? aan : ink, fontWeight: head ? 700 : 400 }, s),
        ),
      ]
    }),
  )

export default {
  lists: [
    // ---------- reports (L06) ----------
    {
      id: 'l-report-types',
      topic: T,
      title: 'Types of reports',
      points: [
        { k: 'Short', alt: ['short report'] },
        { k: 'Long', alt: ['long report'], d: 'Extension of a short report: greater length and depth of discussion of more complex problems.' },
        { k: 'Informational', alt: ['informational report'], d: 'Summarizes information by reviewing facts covered; no inferences, opinions, judgement or recommendations.' },
        { k: 'Interpretative', alt: ['interpretative report', 'analytical'], d: 'Analytical: seeks to analyze a situation, has a conclusion, may or may not have a recommendation.' },
      ],
      hook: 'Two by length (short / long) × two by job (inform / interpret).',
      seen: [],
      src: S6,
    },
    {
      id: 'l-report-importance',
      topic: T,
      title: 'Why reports are important',
      ask: 'Why are reports important?',
      points: [
        { k: 'Useful insights for management', alt: ['insights', 'management', 'informed decision making', 'decision'], d: 'On spending, profits and growth.' },
        { k: 'Detail for forecasts, plans, budgets, decisions', alt: ['forecasts', 'marketing plans', 'budget planning', 'decision-making', 'decision-makers'], d: 'Gives the detail needed for forecasts, marketing plans, budget planning and decision-making.' },
        { k: 'Track progress, identify trends or irregularities', alt: ['track progress', 'trends', 'irregularities', 'monitor', 'performance', 'monitor performance against plan'], d: 'Tracks progress and growth.' },
        { k: 'Audit trail of business activities', alt: ['audit trail', 'audit', 'record', 'record of work done', 'accountability'] },
        { k: 'Transparency; annual report a legal requirement', alt: ['transparency', 'legal requirement', 'annual report', 'evidence', 'legal evidence'] },
        { k: 'Compare performance with others in the sector', alt: ['compare', 'comparison', 'sector'] },
      ],
      hook: 'I-D-T-A-T-C — **I**nsight, **D**etail, **T**rack, **A**udit, **T**ransparency, **C**ompare: “**I** **D**on’t **T**rust **A**ny **T**yped **C**opy” (so I read the report).',
      seen: ['2015-16'],
      src: '18-batch solve (Shafi), 2015-16 Q6(a) — not on the slides',
      note: 'No slide gives the importance of reports. Rahat’s note (CE22) writes four: informed decisions on the basis of facts; permanent written record of facts, progress and problems; carries information upward, downward and across the organisation; gives conclusions and recommendations that solve problems. The earlier version of this site (question bank) had: decision making, record, monitoring, coordination, findings and recommendations, evidence in disputes.',
    },
    {
      id: 'l-report-steps',
      topic: T,
      title: 'Writing the long report: four steps',
      ask: 'What are the four steps of writing a long report?',
      ordered: true,
      points: [
        { k: 'First step: define problem, collect, outline', alt: ['first step', 'define the problem', 'define problem', 'problem specifying', 'data collection', 'organisation', 'collect all needed material'], d: 'Define the problem; collect all needed material; sort and interpret data; organize the final outline; prepare visual aids; finally write, edit, revise, type.' },
        { k: 'Second step: writing first draft', alt: ['first draft', 'drafting', 'write first draft', 'second step'], d: 'Begin; write outline and start writing; summary, conclusions, recommendations; introduction; executive summary, letter of transmittal, bibliography or endnotes, table of contents, table of figures, tables etc.' },
        { k: 'Third step: editing, revising draft', alt: ['editing', 'revising', 'revise', 'edit and revise draft', 'third step'], d: 'Lay aside first draft for several days; look objectively at the material and identify weakness of the draft; revise, rewrite draft several times.' },
        { k: 'Final step: type the document', alt: ['typing', 'type', 'final document', 'final step'], d: 'Harmonious style; spacing; top margin of 1.5 to 2 inch; page numbers (small Roman numerals for prefatory pages, Arabic numbers for supplemental sheets).' },
      ],
      hook: '**D**efine → **D**raft → **E**dit → **T**ype.',
      seen: [],
      src: S6,
      note: 'These are the LONG-report steps. The 2015-16 question asks the steps in writing a SHORT report — answer that with Introduction / Body or text / Terminal section (list “Writing a short report”).',
    },
    {
      id: 'l-short-report-writing',
      topic: T,
      title: 'Writing a short report (the steps)',
      ask: 'Briefly describe the steps to be followed in writing a short report.',
      ordered: true,
      points: [
        { k: 'Introduction', alt: ['intro', 'prefatory part'], d: 'Give purpose or aim (always), background, list of topics to be discussed, authorization. For short introductions (one or two short paragraphs) the title “Introduction” is generally omitted.' },
        { k: 'Body or text', alt: ['body', 'text', 'discussion'], d: 'Present all relevant facts accurately and impartially; organise; emphasize important ideas; headings; visual aids; topic sentences; introductory paragraphs; apply seven C’s.' },
        { k: 'Terminal section', alt: ['terminal', 'conclusion', 'closing section'], d: 'Summarize, conclude and offer recommendation; same order as topics discussed in the text; do not include new material.' },
      ],
      seen: ['2015-16'],
      src: `${S6}; ${SH} (2015-16 Q6a)`,
    },
    {
      id: 'l-short-report-intro',
      topic: T,
      title: 'What the introduction of a short report gives',
      points: [
        { k: 'Purpose or aim (always)', alt: ['purpose', 'aim'] },
        { k: 'Background' },
        { k: 'List of topics to be discussed', alt: ['topics', 'list of topics'] },
        { k: 'Authorization', alt: ['authorisation'], d: 'Who asked for the report.' },
      ],
      hook: '**P**lease **B**ring **T**he **A**uthorization — Purpose, Background, Topics, Authorization.',
      seen: ['2022-23', '2015-16'],
      src: S6,
    },
    {
      id: 'l-short-report-body',
      topic: T,
      title: 'Rules for the body (text) of a short report',
      points: [
        { k: 'Present all relevant facts accurately and impartially', alt: ['accurately', 'impartially', 'relevant facts'], d: 'Impartially = fairly, without bias, favoritism, or taking sides.' },
        { k: 'Organise', alt: ['organize', 'organised'] },
        { k: 'Emphasize important ideas', alt: ['emphasis', 'important ideas'], d: 'By giving important details, placement in document of relevant information.' },
        { k: 'Use headings to guide reader', alt: ['headings'] },
        { k: 'Include visual aids whenever they clarify', alt: ['visual aids', 'graphs', 'charts', 'pictures'], d: 'Graphs, charts, pictures.' },
        { k: 'Topic sentences at beginning of paragraph', alt: ['topic sentence', 'topic sentences'], d: 'Topic sentence = the main or introductory sentence of a paragraph that summarizes its core point.' },
        { k: 'Introductory paragraphs at beginning of major section', alt: ['introductory paragraph', 'introductory paragraphs'] },
        { k: 'Apply seven C’s of writing principles', alt: ["seven C's", '7 Cs', 'seven Cs'] },
      ],
      hook: 'Facts → Organise → Emphasize, then the four signposts (**H**eadings, **V**isual aids, **T**opic sentences, **I**ntroductory paragraphs), and the 7 C’s over everything.',
      seen: ['2022-23', '2015-16'],
      src: S6,
    },
    {
      id: 'l-report-short-structure',
      topic: T,
      title: 'Structure of a short report',
      ask: 'Outline the structure of a short report.',
      ordered: true,
      points: [
        { k: 'Prefatory part or introduction', alt: ['introduction', 'prefatory part', 'prefatory'], d: 'Purpose or aim (always), background, list of topics to be discussed, authorization.' },
        { k: 'Discussion, text or body', alt: ['body', 'text', 'discussion', 'body or text', 'findings'], d: 'All relevant facts, accurately and impartially, organised, with headings, visual aids and topic sentences.' },
        { k: 'Terminal section', alt: ['terminal', 'closing section', 'conclusion', 'summary conclusions recommendations'], d: 'Includes summary, conclusions and recommendations.' },
      ],
      seen: ['2022-23'],
      src: S6,
    },
    {
      id: 'l-report-terminal',
      topic: T,
      title: 'Contents of the terminal section of a short report',
      points: [
        { k: 'Summary', alt: ['summarization', 'summarise', 'summarize'], d: 'Condenses the text.' },
        { k: 'Conclusions', alt: ['conclusion', 'conclude'], d: 'Evaluate and infer from the text.' },
        { k: 'Recommendations', alt: ['recommendation', 'recommend'], d: 'Offer a specific course of action.' },
      ],
      seen: ['2022-23', '2015-16'],
      src: S6,
      note: 'Nafee bhai’s note (Kabirul sir’s class) adds a fourth, “offer” — on the slide the offer to discuss further belongs to the last paragraph of a LETTER report, not to the terminal section.',
    },
    {
      id: 'l-report-short-formats',
      topic: T,
      title: 'Formats of short reports',
      ask: 'What are the different formats of short report?',
      points: [
        { k: 'Letter report', alt: ['letter'], d: 'Small report in letter form, sent to a reader outside the organization.' },
        { k: 'Informational memorandum report', alt: ['informational memorandum', 'informational memo', 'memorandum report', 'memo report', 'memorandum'], d: 'Informational report in memorandum form, circulated within the organization. Three kinds: conference, progress, periodic.' },
        { k: 'Conference report', alt: ['conference'], d: '(informational) Written after a significant conference; by topics discussed or in chronological fashion.' },
        { k: 'Progress report', alt: ['progress'], d: '(informational) Shows progress, i.e. accomplishments, over time or at a given stage of a major assignment.' },
        { k: 'Periodic report', alt: ['periodic'], d: '(informational) At regular recurring periods — weekly, monthly, quarterly.' },
        { k: 'Interpretative / analytical memorandum report', alt: ['interpretative memorandum', 'analytical memorandum', 'analytical', 'interpretative'], d: 'Seeks to analyze a situation; has a conclusion; may or may not have a recommendation. Two kinds: personnel, recommendation-justification.' },
        { k: 'Personnel report', alt: ['personnel'], d: '(analytical) Employee human-resource reports.' },
        { k: 'Recommendation-justification report', alt: ['recommendation report', 'justification report', 'justification', 'recommendation / justification report'], d: '(analytical) Recommends a change or remaining with the status quo, and justifies it.' },
      ],
      hook: 'A tree of **1 + 3 + 2**: the **Letter** goes outside alone; the **Informational memo** has **C-P-P** (Conference, Progress, Periodic); the **Analytical memo** has **P-R** (Personnel, Recommendation-justification).',
      seen: ['2023-24'],
      src: S6,
      note: 'Three formats, the two memorandum formats having sub-types. The earlier version of this site listed seven flat formats (memorandum, conference, progress, periodic, letter, personnel, recommendation / justification) from Nafee bhai’s note.',
    },
    {
      id: 'l-letter-report-parts',
      topic: T,
      title: 'What a letter report includes',
      ordered: true,
      points: [
        { k: 'Date' },
        { k: 'Inside address', alt: ['address'] },
        { k: 'Salutation', alt: ['greeting'], d: 'A greeting used at the beginning of a letter to acknowledge the recipient.' },
        { k: 'Subject line (optional)', alt: ['subject', 'subject line'] },
        { k: 'Body' },
        { k: 'Complimentary close', alt: ['close', 'closing'] },
        { k: 'Signature' },
        { k: 'Reference section', alt: ['reference', 'references'] },
      ],
      hook: 'Read a letter top to bottom: date → address → “Dear …” → subject → body → “Yours sincerely” → signature → references.',
      seen: [],
      src: S6,
    },
    {
      id: 'l-letter-report-paragraphs',
      topic: T,
      title: 'Writing a letter report — the three paragraphs',
      ordered: true,
      points: [
        { k: 'First paragraph', alt: ['first', 'opening paragraph'], d: 'Pleasant greeting and authorization (date and name of person making request); purpose, aim (always); problem, issues (if problems exist); conclusion, statement of results (optional).' },
        { k: 'Middle paragraph', alt: ['middle', 'body paragraph'], d: 'Present all facts, favorable or unfavorable; mention sources and methodology used, if any; emphasis on finding results; headings and visual aids whenever necessary.' },
        { k: 'Last paragraph', alt: ['last', 'closing paragraph'], d: 'Bring the letter to a pleasant friendly close; conclude or recommend if you desire to do so; offer to discuss further, if appropriate.' },
      ],
      seen: [],
      src: S6,
    },
    {
      id: 'l-report-progress',
      topic: T,
      title: 'Contents of a progress report',
      ordered: true,
      points: [
        { k: 'Introduction' },
        { k: 'Description of accomplishments during period', alt: ['accomplishments', 'work done', 'accomplishment'] },
        { k: 'Unanticipated problems (if any)', alt: ['problems', 'unanticipated problems'] },
        { k: 'Plans for next reporting period', alt: ['next period plan', 'plans', 'plan for next reporting period'] },
        { k: 'Summary', alt: ['overall appraisal'], d: 'Overall appraisal of progress to date.' },
      ],
      hook: '**I** **A**m **U**sually **P**unctual, **S**ir — Introduction, Accomplishments, Unanticipated problems, Plans, Summary.',
      seen: [],
      src: S6,
    },
    {
      id: 'l-recjust-aspects',
      topic: T,
      title: 'What a recommendation-justification report does (three aspects)',
      points: [
        { k: 'Policy aspect', alt: ['policy', 'recommend a change', 'status quo'], d: 'Recommend a change or remain with status quo.' },
        { k: 'Value aspect', alt: ['value', 'desirable or undesirable'], d: 'Support the idea that something is desirable or undesirable.' },
        { k: 'Fact aspect', alt: ['fact', 'accuracy of information'], d: 'Defend the accuracy of information.' },
      ],
      seen: [],
      src: S6,
      note: 'The report may be in response to a request or it may be voluntary. Status quo = the existing state of affairs.',
    },
    {
      id: 'l-recjust-sections',
      topic: T,
      title: 'Sections of a recommendation-justification report',
      ordered: true,
      points: [
        { k: 'Introduction', d: 'Purpose; authorization; layout of report.' },
        { k: 'Body (text, discussion)', alt: ['body', 'text', 'discussion'], d: 'Current state of the problem; effects and causes of problems; possible options to remove problems; criteria in evaluating solution; recommended solution.' },
        { k: 'Terminal section (conclusion, recommendation)', alt: ['terminal section', 'terminal', 'conclusion'], d: 'Brief summary of major points; conclusion; recommendation.' },
      ],
      seen: [],
      src: S6,
    },
    {
      id: 'l-report-long-structure',
      topic: T,
      title: 'Structure of a long report',
      ordered: true,
      points: [
        { k: 'Prefatory part', alt: ['preliminary', 'front matter', 'prefatory'], d: 'Cover; frontispiece; copyright notice; forwarding letter / transmittal letter; preface; acknowledgements; table of contents; list of illustrations; abstract and executive summary.' },
        { k: 'Main body', alt: ['body'], d: 'Introduction (section or separate chapter); discussion or text (chapters, sections, subsections); conclusions; recommendations.' },
        { k: 'Back matter', alt: ['supplementary', 'end matter'], d: 'Appendices; list of references; bibliography; glossary; index.' },
      ],
      seen: [],
      src: S6,
    },
    {
      id: 'l-long-prefatory',
      topic: T,
      title: 'Prefatory part of a long report',
      ordered: true,
      points: [
        { k: 'Cover' },
        { k: 'Frontispiece', d: 'An illustration or photograph on the page facing the title page.' },
        { k: 'Copyright notice', alt: ['copyright'] },
        { k: 'Forwarding letter / transmittal letter', alt: ['forwarding letter', 'transmittal letter', 'letter of transmittal'] },
        { k: 'Preface' },
        { k: 'Acknowledgements', alt: ['acknowledgement'] },
        { k: 'Table of contents', alt: ['contents', 'TOC'] },
        { k: 'List of illustrations', alt: ['illustrations'] },
        { k: 'Abstract and executive summary', alt: ['abstract', 'executive summary'] },
      ],
      hook: '**C**an **F**ive **C**ivil **F**irms **P**repare **A** **T**ender **L**ist **A**ccurately? — Cover, Frontispiece, Copyright, Forwarding letter, Preface, Acknowledgements, TOC, List of illustrations, Abstract.',
      seen: [],
      src: S6,
    },
    {
      id: 'l-long-back',
      topic: T,
      title: 'Back matter of a long report',
      ordered: true,
      points: [
        { k: 'Appendices', alt: ['appendix'] },
        { k: 'List of references', alt: ['references', 'reference list'] },
        { k: 'Bibliography' },
        { k: 'Glossary', d: 'Alphabetical list of specialized, technical or unfamiliar terms with their definitions.' },
        { k: 'Index' },
      ],
      hook: '**A** **L**ong **B**ook’s **G**lossary and **I**ndex — Appendices, List of references, Bibliography, Glossary, Index.',
      seen: [],
      src: S6,
    },
    {
      id: 'l-long-prep-steps',
      topic: T,
      title: 'Preparatory steps of a long report',
      ordered: true,
      points: [
        { k: 'Recognize issues, problems, purpose, scope of report', alt: ['issues', 'problems', 'purpose', 'scope'] },
        { k: 'Realize who your readers will be', alt: ['readers', 'audience'] },
        { k: 'Get an idea of sources of information', alt: ['sources of information', 'sources'] },
        { k: 'Understand when the report needs to be completed', alt: ['deadline', 'when', 'completion time'] },
        { k: 'Recognize financial and time constraints', alt: ['constraints', 'financial constraints', 'time constraints'] },
      ],
      hook: '**What** (issues, purpose, scope) → **Who** (readers) → **Where from** (sources) → **When** (completion) → **With what** (money and time).',
      seen: [],
      src: S6,
    },
    {
      id: 'l-report-title-5w',
      topic: T,
      title: 'Five W’s of a report title (cover)',
      points: [
        { k: 'Who', d: 'By whom and for whom.' },
        { k: 'What', d: 'Title or subject matter.' },
        { k: 'When', d: 'Date.' },
        { k: 'Where' },
        { k: 'Why' },
      ],
      seen: [],
      src: S6,
      note: 'Titles should be short; extremely short and vague titles should be avoided; judgement terms should not be used.',
    },
    {
      id: 'l-transmittal-parts',
      topic: T,
      title: 'Five parts of a letter of transmittal',
      ordered: true,
      points: [
        { k: 'Authorization', alt: ['authorisation'], d: 'Opening words refer to the request made for preparing the report, including the date the request was made.' },
        { k: 'Transmittal details', alt: ['transmittal'], d: 'Puts into words the handing over of the report to the recipient.' },
        { k: 'Background and methodology', alt: ['background', 'methodology'], d: 'Briefly suggests research methods employed, scope and limits of the report; background and qualifications of the author and committee members.' },
        { k: 'Highlights', d: 'Briefly mentions conclusions — precise for a friendly audience, more general for a less friendly audience.' },
        { k: 'Courteous ending', alt: ['ending', 'courteous close'], d: 'Acknowledge those who assisted; willingness to respond to further questions; later reports or findings forthcoming.' },
      ],
      hook: '**A** **T**ransmittal **B**rings **H**ighlights **C**ourteously — Authorization, Transmittal details, Background, Highlights, Courteous ending.',
      seen: [],
      src: S6,
    },
    {
      id: 'l-report-exec-summary',
      topic: T,
      title: 'Issues addressed in the executive summary of a report',
      points: [
        { k: 'Purpose' },
        { k: 'Scope' },
        { k: 'Background' },
        { k: 'Data analysis' },
        { k: 'Methods of research', alt: ['research methods', 'methods'] },
        { k: 'Current issues' },
        { k: 'Causes' },
        { k: 'Effects' },
        { k: 'Problem analysis' },
        { k: 'Solutions criteria', alt: ['solution criteria', 'criteria'] },
        { k: 'Conclusions' },
        { k: 'Possible solutions / recommendations', alt: ['possible solutions', 'recommendations'] },
        { k: 'Benefits' },
      ],
      hook: 'The report in miniature: **set-up** (purpose, scope, background) → **study** (data analysis, methods) → **problem** (current issues, causes, effects, problem analysis) → **answer** (criteria, conclusions, solutions, benefits).',
      seen: [],
      src: S6,
    },

    // ---------- proposals (L05) ----------
    {
      id: 'l-proposal-tasks',
      topic: T,
      title: 'Tasks a proposal may be written for',
      ask: 'A proposal is a written plan or presentation for completing a task. The task may be to …?',
      points: [
        { k: 'Solve a problem', alt: ['problem'] },
        { k: 'Alter a procedure', alt: ['procedure'] },
        { k: 'Find answers to questions', alt: ['answers', 'questions'] },
        { k: 'Offer advice or training', alt: ['advice', 'training'] },
        { k: 'Conduct research on a topic', alt: ['research'] },
      ],
      hook: '**S**ome **A**nts **F**ind **O**ld **C**rumbs — Solve, Alter, Find, Offer, Conduct.',
      seen: ['2017-18'],
      src: S5,
    },
    {
      id: 'l-proposal-topics',
      topic: T,
      title: 'Proposal topics (examples on the slide)',
      points: [
        { k: 'To construct a structure', alt: ['construct', 'structure'] },
        { k: 'To survey an area or population group', alt: ['survey'] },
        { k: 'To design or build an industrial plant', alt: ['design', 'build', 'manufacturing plant', 'plant'], d: 'An industrial or manufacturing plant.' },
      ],
      seen: [],
      src: S5,
    },
    {
      id: 'l-proposal-types',
      topic: T,
      title: 'Types of proposals',
      points: [
        { k: 'Research proposal', alt: ['research'], d: 'Deals with academic investigation.' },
        { k: 'Business proposal', alt: ['business'], d: 'Deals with securing business.' },
        { k: 'Solicited proposal', alt: ['solicited', 'RFP'], d: 'Solicited by a business organization to meet its specific needs; has many competitors bidding for a contract.' },
        { k: 'Unsolicited proposal', alt: ['unsolicited'], d: 'Sent to convince a business or organization that the proposal sender has skills to solve their problems; resolution of problems would significantly benefit the organization.' },
      ],
      seen: [],
      src: S5,
    },
    {
      id: 'l-proposal-attributes',
      topic: T,
      title: 'Key attributes of a proposal (three basic attributes)',
      ordered: true,
      points: [
        { k: 'Describe / identify the problem', alt: ['describe the problem', 'identify the problem', 'problem'], d: 'Find new scope, magnitude or complexity of the problem; establish credibility.' },
        { k: 'Offer a viable solution', alt: ['viable solution', 'solution'] },
        { k: 'Demonstrate skill and resources', alt: ['skill', 'resources'] },
      ],
      seen: [],
      src: S5,
    },
    {
      id: 'l-proposal-parts',
      topic: T,
      title: 'Parts of a proposal',
      ordered: true,
      points: [
        { k: 'Prefatory parts', alt: ['prefatory', 'prefatory part', 'front matter'] },
        { k: 'Body', alt: ['body part', 'main body'], d: 'Introduction and procedures.' },
        { k: 'Supplementary parts', alt: ['supplementary', 'supplementary part', 'appendix', 'back matter'] },
      ],
      seen: ['2016-17', '2012-13'],
      src: S5,
    },
    {
      id: 'l-proposal-prefatory',
      topic: T,
      title: 'Prefatory parts of a proposal',
      ordered: true,
      points: [
        { k: 'Cover, with title', alt: ['cover', 'cover with title', 'title'] },
        { k: 'Inside title page', alt: ['title page'], d: 'Title; to whom submitted; by whom submitted; date.' },
        { k: 'Table of contents (TOC)', alt: ['contents', 'TOC', 'table of contents'], d: 'Brief proposals do not require one.' },
        { k: 'List of tables and/or figures', alt: ['list of figures', 'list of tables', 'list of tables and figures'] },
        { k: 'Request for proposal letter', alt: ['RFP', 'request for proposal', 'owner’s solicitation letter', 'solicitation letter', 'request for proposal (RFP)'], d: 'The owner’s solicitation letter.' },
        { k: 'Response to proposal', alt: ['RTP', 'company’s cover letter', 'cover letter', 'response to proposal (RTP)'], d: 'The company’s cover letter.' },
        { k: 'Description of owner’s requirement', alt: ["owner's requirement", 'owner’s requirements', 'requirements', 'owner requirement'] },
        { k: 'Schedule for selecting personnel', alt: ['scheduled interview time', 'interview time', 'personnel schedule'] },
        { k: 'Executive summary or abstract', alt: ['executive summary', 'summary', 'abstract', 'synopsis'], d: 'Most important part of a proposal.' },
        { k: 'Draft contract', d: 'Inserted after the executive summary for long proposals; immediate overview of the work including financial information.' },
      ],
      hook: 'Outside in: **cover → title page → TOC → lists**; two letters (**owner’s RFP letter → company’s response**); the owner’s side (**requirement → schedule for selecting personnel**); last the **executive summary** and the **draft contract** that follows it. 4 + 2 + 2 + 2 = 10.',
      seen: ['2016-17', '2012-13'],
      src: `${S5}; ${SH} (2016-17 Q6a)`,
      note: 'Nafee bhai’s note (and the earlier version of this site) had nine: “RFP / draft contract” as one item, “RTP”, and “scheduled interview time” for the schedule for selecting personnel. The slide has ten, with Draft contract as its own last item.',
    },
    {
      id: 'l-proposal-body',
      topic: T,
      title: 'Body of a proposal (two sections)',
      ask: 'What does the body of a proposal contain?',
      ordered: true,
      points: [
        { k: 'Introduction', alt: ['intro'], d: 'Problem; need; scope; background; objective or purpose; project team.' },
        { k: 'Procedures', alt: ['procedure', 'methods', 'plan of attack', 'methodology'], d: 'Methods, procedures, sources; plan of attack; sequence of activities; equipment, facilities, products; personnel qualifications; budget of costs, prices, total bids.' },
      ],
      seen: ['2016-17', '2012-13'],
      src: S5,
      note: 'Also asked alone in 2010-11 Q2(b), 2009-10 Q2(b), 2008-09 Q1(a) (Rahat’s question list). The earlier version of this site listed six flat items (introduction, procedure, project team, products, budget, project schedule): on the slide the project team sits in the Introduction, products with equipment and facilities, the budget in Procedures, and project schedules in the supplementary parts.',
    },
    {
      id: 'l-proposal-intro',
      topic: T,
      title: 'Body of a proposal: Introduction',
      points: [
        { k: 'Problem', d: 'Clearly state the problem and demonstrate clear understanding of it; if pertinent, mention difficulties that may be encountered and methods proposed to overcome them.' },
        { k: 'Need' },
        { k: 'Scope', d: 'The boundaries being set for the project to accomplish objectives: what you will do and what you will not do.' },
        { k: 'Background', d: 'May be omitted for short proposals. Long: previous work on identical or related projects; literature review and its evaluation; how the proposal will build on already completed projects and research.' },
        { k: 'Objective or purpose', alt: ['objective', 'purpose'], d: 'In simple language, as if approaching a non-specialist; often in infinitive form: to recommend, to bid, to supply.' },
        { k: 'Project team', alt: ['team'], d: 'List of individuals who will work for the project; in long proposals a brief curriculum vitae of each.' },
      ],
      hook: '**P**lease **N**ever **S**kip **B**ackground **O**r **P**eople — Problem, Need, Scope, Background, Objective, Project team.',
      seen: ['2016-17', '2012-13'],
      src: S5,
    },
    {
      id: 'l-proposal-procedures',
      topic: T,
      title: 'Body of a proposal: Procedures',
      points: [
        { k: 'Methods, procedures, sources', alt: ['methods', 'method', 'sources', 'methodology'], d: 'State how project requirements will be met (five-item checklist).' },
        { k: 'Plan of attack' },
        { k: 'Sequence of activities', alt: ['sequence'] },
        { k: 'Equipment, facilities, products', alt: ['equipment', 'facilities', 'products', 'deliverables'], d: 'What facilities will be needed; what you already have; how you will get what you do not have.' },
        { k: 'Personnel qualifications', alt: ['personnel', 'qualifications', 'staffing'], d: 'Personnel arrangements; company areas involved; individual qualifications in complete biographic form; percentages of time devoted.' },
        { k: 'Budget of costs, prices, total bids', alt: ['budget', 'cost', 'price', 'total bids'], d: 'As specified in the RFP, with a budget justification section.' },
      ],
      hook: '**How** (methods → plan of attack → sequence) → **with what** (equipment, facilities, products) → **by whom** (personnel) → **for how much** (budget).',
      seen: ['2016-17', '2012-13'],
      src: S5,
    },
    {
      id: 'l-proposal-supplementary',
      topic: T,
      title: 'Supplementary parts of a proposal',
      ask: 'What do the supplementary parts of a project proposal generally contain?',
      points: [
        { k: 'Maps, graphs, tables, charts', alt: ['maps', 'graphs', 'charts', 'tables'] },
        { k: 'Letter of support', alt: ['support letter', 'support'] },
        { k: 'Letter of endorsement', alt: ['endorsement'] },
        { k: 'References', alt: ['reference', 'list of references'] },
        { k: 'Forms' },
        { k: 'Table of definition', alt: ['definitions', 'table of definitions', 'glossary'] },
        { k: 'Project schedules', alt: ['project schedule', 'schedule', 'schedules'] },
      ],
      hook: '**M**any **S**upporters **E**ndorse **R**eal **F**orm **D**ata **P**romptly — Maps, Support, Endorsement, References, Forms, Definition, Project schedules.',
      seen: ['2017-18', '2016-17', '2012-13'],
      src: `${S5}; ${SH} (2017-18 Q8b)`,
      note: 'Seven items — project schedules is the one usually forgotten (it is supplementary, not part of the body).',
    },
    {
      id: 'l-proposal-title-page',
      topic: T,
      title: 'What the title page of a proposal should include (as a minimum)',
      points: [
        { k: 'Title' },
        { k: 'To whom the proposal is submitted', alt: ['to whom', 'recipient', 'client'], d: 'Name of person or company to whom proposal is submitted.' },
        { k: 'Who is submitting the proposal', alt: ['by whom', 'submitter', 'company submitting'], d: 'Name of person or company submitting the proposal.' },
        { k: 'Date' },
      ],
      seen: ['2016-17'],
      src: S5,
    },
    {
      id: 'l-exec-summary',
      topic: T,
      title: 'Issues for the executive summary (abstract, synopsis) of a proposal',
      ask: 'What are the main issues to consider when preparing the executive summary / abstract / synopsis of a proposal?',
      points: [
        { k: 'Most important part of a proposal', alt: ['most important part', 'most important'] },
        { k: 'Many evaluators read only the executive summary', alt: ['read only', 'quick overview', 'evaluators', 'read first', 'evaluators read it first'], d: 'To gain a quick overview.' },
        { k: 'Should speak for the complete proposal', alt: ['complete proposal', 'whole proposal', 'covers the whole proposal', 'speak for'] },
        { k: 'Should be able to stand alone', alt: ['stand alone', 'stands alone', 'standalone'] },
        { k: 'Summarize what objectives will be met', alt: ['objectives', 'summarises the objectives'] },
        { k: 'Summarize what procedures will be followed', alt: ['procedures', 'methods', 'summarises the procedures to be followed'] },
      ],
      hook: 'Two **M**’s and four **S**’s: **M**ost important · **M**any read only it · **S**peak for all · **S**tand alone · **S**ummarize objectives · **S**ummarize procedures.',
      seen: ['Jan 2021'],
      src: `${S5}; ${SH} (Jan 2021 Q4b)`,
      note: '“Immediate overview of the work including financial information” is NOT an executive-summary point — on the slide it describes the Draft contract (the earlier version of this site had it here).',
    },
    {
      id: 'l-proposal-methods-checklist',
      topic: T,
      title: 'Checklist for the methods and procedures of a proposal',
      ask: 'What are the checklist items to keep in mind when preparing methods and procedures of a proposal?',
      ordered: true,
      points: [
        { k: 'Be realistic as to what you can accomplish', alt: ['realistic', 'be realistic', 'feasibility'], d: 'Avoid overextending your capabilities and those of your company.' },
        { k: 'Be specific as to method of meeting goals', alt: ['specific', 'be specific', 'method of meeting all goals'], d: 'Be specific as to the method of meeting all goals.' },
        { k: 'Be precise with the time schedule', alt: ['precise', 'time schedule', 'schedule'] },
        { k: 'Be clear how you will evaluate your work', alt: ['clear', 'evaluate', 'evaluation', 'quality control'], d: 'Be clear as to how you will evaluate your work, production or product.' },
        { k: 'Be exact to the scope', alt: ['exact', 'scope'], d: 'What you will do and what you will not do.' },
      ],
      hook: '**R**eal **S**ites **P**our **C**oncrete **E**arly — Realistic, Specific, Precise (schedule), Clear (evaluation), Exact (scope).',
      seen: ['Jan 2021'],
      src: `${S5}; ${SH} (Jan 2021 Q4b)`,
      note: 'Opening line on the slide: “State how project requirements will be met. The following checklist may be used for that purpose.” The earlier version of this site had a nine-item textbook checklist (step-by-step tasks, feasibility, quality control, risks …) — not the teacher’s.',
    },
    {
      id: 'l-proposal-equipment',
      topic: T,
      title: 'Methods: equipment and facilities',
      ordered: true,
      points: [
        { k: 'State what facilities will be needed', alt: ['facilities needed', 'needed'] },
        { k: 'State what you already have', alt: ['already have'] },
        { k: 'Show how you will get the rest', alt: ['do not have', 'how you will get what you do not have'], d: 'Show how you will get what you do not have.' },
      ],
      seen: ['2016-17'],
      src: S5,
    },
    {
      id: 'l-proposal-personnel',
      topic: T,
      title: 'Methods: personnel information to include',
      points: [
        { k: 'Personnel arrangements', alt: ['arrangements'] },
        { k: 'Company areas involved', alt: ['company areas'] },
        { k: 'Individual qualifications in complete biographic form', alt: ['qualifications', 'biographic form', 'biography', 'CV'] },
        { k: 'Percentages of time devoted to the project', alt: ['percentage of time', 'time'] },
      ],
      seen: ['2016-17'],
      src: S5,
    },
    {
      id: 'l-rfp-contents',
      topic: T,
      title: 'Information a request for proposal (RFP) may contain',
      points: [
        { k: 'Product or service for which bids are desired', alt: ['product', 'service', 'bids'], d: 'Express it clearly.' },
        { k: 'Name, address, phone number of recipient', alt: ['name', 'address', 'phone number'], d: 'Of the person to whom the proposal should be sent.' },
        { k: 'What bidders must include', alt: ['bidders must include', 'precise'], d: 'Be precise — this makes initial screening easier for locating qualified candidates.' },
        { k: 'Time by which the proposal should arrive', alt: ['time', 'deadline'] },
      ],
      hook: '**What** is wanted → **to whom** it is sent → **what to include** → **by when**.',
      seen: [],
      src: S5,
    },
    {
      id: 'l-proposal-chronology',
      topic: T,
      title: 'Chronology of procedures for solicited major proposals',
      ask: 'Give the chronology of procedures for a major solicited proposal.',
      ordered: true,
      points: [
        { k: 'Soliciting company publicly announces the project', alt: ['announce', 'public announcement', 'announces a project', 'RFP issued', 'need identified'], d: 'Soliciting company publicly announces a project in professional publications, newspapers or writes to companies asking if they are interested in bidding on the project.' },
        { k: 'Contracting companies submit preliminary proposals', alt: ['preliminary proposals', 'preliminary proposal'], d: 'Contracting companies and others reacting to the public announcement submit preliminary proposals based on initial request information.' },
        { k: 'Review, eliminate, short list of finalists', alt: ['short list', 'shortlist', 'review', 'eliminates', 'finalists'], d: 'Soliciting company reviews all submitted documents, eliminates some companies on the basis of preliminary review. Establishes short list of finalists.' },
        { k: 'Finalists asked for highly detailed proposal, deadlines', alt: ['detailed proposal', 'highly detailed proposal', 'deadlines', 'deadline'], d: 'Soliciting company asks each finalist bidding for the project to submit a highly detailed proposal and sets deadlines for receiving the proposal.' },
        { k: 'Finalists select teams; several editions; oral rehearsals', alt: ['presentation teams', 'teams', 'rehearsals', 'several editions', 'proposal team', 'write'], d: 'Finalist companies select their written and oral presentation teams; writing of their proposal proceeds through several editions; oral rehearsals based on proposal occur.' },
        { k: 'Finalists submit proposals; oral presentation dates set', alt: ['submit', 'submission', 'submit proposals', 'dates for oral presentation'], d: 'Finalist companies submit proposals to the soliciting group; dates are established for oral presentation to the soliciting group.' },
        { k: 'Finalist companies make their presentation', alt: ['presentation', 'oral presentation', 'present'] },
        { k: 'Finalist companies wait for response', alt: ['wait', 'response', 'wait for response', 'award'] },
      ],
      hook: '**A**nnounce → **P**reliminary → **S**hort list → **D**etailed → **T**eams → **S**ubmit → **P**resent → **W**ait. Who acts: steps 1, 3, 4 begin “Soliciting company …”, step 2 “Contracting companies …”, steps 5–8 “Finalist companies …”.',
      seen: ['2017-18', '2012-13'],
      src: `${S5}; ${SH} (2017-18 Q8b)`,
      note: 'Also 2009-10 Q2(a). Eight steps. The earlier version of this site had a 14-step textbook chronology (RFP, go / no-go, pre-proposal conference … award, debriefing) — not the teacher’s; write the eight slide steps.',
    },
    {
      id: 'l-proposal-style',
      topic: T,
      title: 'Writing style and appearance of a proposal — issues to consider',
      points: [
        { k: 'General appearance', alt: ['appearance'] },
        { k: 'Neatness', alt: ['neat'] },
        { k: 'Specific appearance of individual parts', alt: ['specific appearance', 'table of contents', 'list of figures', 'title page', 'maps', 'graphs', 'charts'], d: 'Table of contents, list of figures, title page, maps, graphs, charts.' },
        { k: 'Consistency of style', alt: ['consistency'] },
        { k: 'Title properly describes the project', alt: ['title'], d: 'Title, whether it properly describes the project.' },
        { k: 'Completeness', alt: ['complete'] },
        { k: 'Professionalism', alt: ['professional'] },
        { k: 'Checking and rechecking of final draft', alt: ['checking', 'rechecking', 'final draft'], d: 'Until satisfactory.' },
        { k: 'Proper typing, proofing, graphs', alt: ['typing', 'proofing', 'proofreading'], d: 'Check for proper typing, proofing, graphs, etc.' },
      ],
      hook: 'Looks first (**general appearance, neatness, specific appearance**), then the text (**consistency, title, completeness, professionalism**), then the last checks (**recheck the draft, typing and proofing**) — 3 + 4 + 2.',
      seen: [],
      src: `${S5} — asked 2008-09 Q1(b) (Rahat’s question list)`,
    },

  ],

  cards: [
    // reports
    { id: 'c-report-define', topic: T, front: 'Define a **report** (slide wording).', back: 'A **formal statement of facts, information**, written for a **specific audience**, for **making informed decision**. A report also contains **inferences made, conclusions reached, recommendations provided** — based on **facts** and **supporting evidence** included.', seen: ['2015-16'], src: S6 },
    { id: 'c-report-inference', topic: T, front: 'What is an **inference**?', back: 'The process of **drawing a conclusion based on evidence and reasoning** rather than on direct observation.', src: `${S6} (teacher’s glossary box)` },
    { id: 'c-report-fact-evidence', topic: T, front: '**Fact** vs **supporting evidence**?', back: 'A **fact** is an indisputably true piece of information; **supporting evidence** is the strategic use of that fact to prove a specific claim or argument.', src: `${S6} (teacher’s glossary box)` },
    { id: 'c-report-body-rules', topic: T, front: 'How must the facts be presented in the **body** of a short report — and what does *impartially* mean?', back: 'Present **all relevant facts accurately and impartially**. Impartially = making decisions or treating people **fairly, without bias, favoritism, or taking sides**.', seen: ['2022-23', '2015-16'], src: S6 },
    { id: 'c-report-terminal-rule', topic: T, front: 'Two rules for the **terminal section** of a short report.', back: 'Summarize points in the **same order as topics discussed in the text**, and **do not include new material** in the terminal section.', seen: ['2022-23', '2015-16'], src: S6 },
    { id: 'c-report-topic-sentence', topic: T, front: 'What is a **topic sentence**, and where does it go?', back: 'The **main or introductory sentence** of a paragraph that **summarizes its core point**; used at the **beginning of a paragraph**.', src: `${S6} (teacher’s glossary box)` },
    { id: 'c-report-intro-title', topic: T, front: 'When is the title “Introduction” omitted in a short report?', back: 'For **short introductions** (one or two short paragraphs) the title “Introduction” is generally omitted.', src: S6 },
    { id: 'c-report-memorandum', topic: T, front: 'What is a **memorandum** (memo)?', back: 'A written message or document used primarily for **communication within** a business, organization, or government agency.', seen: ['2023-24'], src: `${S6} (teacher’s glossary box)` },
    { id: 'c-report-letter', topic: T, front: 'What is a **letter report**?', back: 'A **small report in letter form**, used to send information to a reader **outside the organization**. It includes date, inside address, salutation, subject line (optional), body, complimentary close, signature, reference section.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-informational', topic: T, front: 'What does an **informational report** do — and avoid?', back: '**Summarizes information by reviewing facts covered**. Avoids giving **inferences, opinions, judgement, recommendations** from presented data; uses **neutral, unbiased language** rather than a particular point of view.', src: S6 },
    { id: 'c-report-info-memo', topic: T, front: 'What is an **informational memorandum report**?', back: 'An informational report presented in **memorandum form**, normally used for **circulation within the organization** by email, fax etc. Kinds: **conference, progress, periodic**.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-conference', topic: T, front: 'What is a **conference report**?', back: 'Written by **employees or executives after a significant conference** with individuals or committees. Text organized **by topics discussed** or presented simply in **chronological fashion**.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-progress', topic: T, front: 'What is a **progress report**, and how is it organized?', back: 'Shows **progress, i.e. accomplishments** — over time, or at a given stage of a major assignment. Its organizational plan is usually **inductive**: specific facts and details first, main conclusions / overall status at the end.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-periodic', topic: T, front: 'What is a **periodic report** (and how long, in a USA company)?', back: 'Written at **regular recurring periods** — weekly, monthly, quarterly. Expected to be **half a page if the news is favorable**; for **unfavorable news it may be one page**, including the reasons for the unfavorable situation and the way it was being handled.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-analytical', topic: T, front: 'What do **analytical memorandum reports** do?', back: '**Seek to analyze a situation**; have a **conclusion**; **may or may not** have a recommendation. Kinds: **personnel** and **recommendation-justification** reports.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-personnel', topic: T, front: 'What is a **personnel report**?', back: 'The personnel report category contains **employee human-resource reports**. Topics: assignment, attendance, benefits, awards, new employees, terminated employees, discipline, disability, and more.', seen: ['2023-24'], src: `${S6}. (Nafee bhai’s note gave its structure instead: introduction → main body → terminal section.)` },
    { id: 'c-report-justification', topic: T, front: 'What does a **recommendation-justification report** do?', back: '**Recommends a change or remaining with the status quo** (policy aspect); **supports the idea that something is desirable or undesirable** (value aspect); **defends the accuracy of information** (fact aspect). It may be in response to a request or voluntary.', seen: ['2023-24'], src: S6 },
    { id: 'c-report-status-quo', topic: T, front: 'What does **status quo** mean?', back: 'A Latin phrase: the **existing state of affairs**, the current situation.', src: `${S6} (teacher’s glossary box)` },
    { id: 'c-long-report', topic: T, front: 'What is a **long report**?', back: 'An **extension of a short report**: greater length and depth of discussion of **more complex problems**; requires more preliminary collecting, sorting, interpreting, writing, editing and creation of visuals; a **mix of informative and persuasive information**.', src: S6 },
    { id: 'c-long-numbering', topic: T, front: 'Page **numbering scheme** of a long report.', back: '**Cover and title fly**: do not count. **Title page** and **transmittal document**: count but do not insert number. **Table of contents, table of tables, executive summary**: count and number. Small **Roman** numerals for prefatory pages, **Arabic** numbers for supplemental sheets.', src: S6 },
    { id: 'c-long-typing', topic: T, front: 'Typing a long report: spacing and margin rules.', back: 'Harmonious style throughout; double or **single spacing** (more popular in recent years); always **double space between paragraphs**, before and after quotations, visual aids and footnotes; single space for the transmittal document, quotations, lists, footnotes, tables; **top margin 1.5 to 2 inch**.', src: S6 },
    { id: 'c-report-title-fly', topic: T, front: 'What is a **title fly**, and what are the four parts of the **title page**?', back: 'Title fly: a **blank sheet between the cover and the internal title page** (it carries at most the title). Title page: **title** as stated on the exterior cover, the **recipient** of the report, the **preparer**, the **date**.', src: S6 },
    { id: 'c-report-frontispiece', topic: T, front: 'What is a **frontispiece**?', back: 'An **illustration or photograph** positioned on the page **facing the title page**.', src: `${S6} (teacher’s glossary box)` },
    { id: 'c-report-toc', topic: T, front: 'Rules for the **table of contents** of a long report.', back: 'Prepare the ToC **last** — after assigning headings and final page numbers; place it **just before the report body**; all headings in the ToC should **parallel those in the text**. Table of tables = list of illustrations, data, visuals.', src: S6 },
    { id: 'c-report-exec-summary', topic: T, front: 'The **executive summary of a report** — where is it placed and why does it matter?', back: 'Generally placed **right after the transmittal letter**. It is the **most read part**: many executives decide from it whether to read the report; some firms circulate only it to management. It may be **deductively organized (recommendations first)**.', src: S6 },
    { id: 'c-report-biblio', topic: T, front: 'What is a **bibliography**, and which two forms are common?', back: 'The **list of sources cited as documentation** for relevant content in the report, included at the **end of the document** (scholarly report always, business report optional); also sources for additional reading. Forms: **MLA** (Modern Language Association) and **APA** (American Psychological Association).', src: S6 },
    { id: 'c-report-footnote', topic: T, front: '**Footnotes and endnotes** — what are they for and how are they marked?', back: 'They **explain content or identify sources** (citation), which **improves credibility** and lets the reader examine sources. Placed at the **bottom of the page, end of chapter or end of book**; marked with **superscript numerals**, numbered consecutively through the report or restarting with each chapter.', src: S6 },

    // proposals
    { id: 'c-proposal-define', topic: T, front: 'What is a **proposal** (project proposal)?', back: 'A **written plan or presentation for completing a task**. The task may be to: solve a problem; alter a procedure; find answers to questions; offer advice or training; conduct research on a topic.', seen: ['2017-18'], src: S5 },
    { id: 'c-proposal-solicited', topic: T, front: '**Solicited** vs **unsolicited** proposal?', back: '**Solicited**: solicited by a business organization to meet its specific needs — has many competitors bidding for a contract. **Unsolicited**: sent to convince a business or organization that the sender has the skills to solve their problems; resolution of the problems would significantly benefit the organization.', src: S5 },
    { id: 'c-proposal-research-business', topic: T, front: '**Research** proposal vs **business** proposal?', back: 'Research proposal: deals with **academic investigation**. Business proposal: deals with **securing business**.', src: S5 },
    { id: 'c-exec-summary-why', topic: T, front: 'Why is the **executive summary** the most important part of a proposal?', back: '**Many evaluators read only the executive summary** to gain a quick overview — so it should **speak for the complete proposal** and be able to **stand alone**.', seen: ['Jan 2021'], src: S5 },
    { id: 'c-draft-contract', topic: T, front: 'What is the **draft contract** in a proposal?', back: '**Inserted after the executive summary for long proposals**; gives an **immediate overview of the work including financial information**. (These two points belong to the draft contract, not to the executive summary.)', seen: ['2016-17'], src: S5 },
    { id: 'c-proposal-toc', topic: T, front: 'When does a proposal need a **table of contents**?', back: '**Brief proposals do not require a TOC.** Long proposals require a TOC as well as a list of **tables, figures, illustrations**.', src: S5 },
    { id: 'c-proposal-purpose', topic: T, front: 'How is the **purpose** written in the introduction of a proposal?', back: 'In **simple language, as if approaching a non-specialist**; often stated in **infinitive form** — to recommend, to bid, to supply.', src: S5 },
    { id: 'c-proposal-problem', topic: T, front: 'What does the **problem** statement of a proposal do?', back: '**Clearly states the problem** and demonstrates **clear understanding** of it. If pertinent, mentions **difficulties that may be encountered** and **methods proposed to overcome** the problems.', src: S5 },
    { id: 'c-proposal-scope', topic: T, front: 'What is the **scope** in a proposal?', back: 'It defines the **boundaries being set for the project** to accomplish objectives — **what you will do and what you will not do**.', src: S5 },
    { id: 'c-proposal-team', topic: T, front: 'What goes under **project team** in a proposal?', back: 'The **list of individuals who will work for the project**; in long proposals, a **brief curriculum vitae** of each individual.', src: S5 },
    { id: 'c-proposal-background', topic: T, front: 'What does the **background** of a long proposal include?', back: 'May be **omitted for short proposals**. For long ones: **previous work** completed on identical or related projects; **literature review** on the subject and its evaluation; a statement showing how the proposal will **build on already completed projects and research**.', src: S5 },
    { id: 'c-proposal-budget', topic: T, front: 'How is the **budget** presented in a proposal?', back: 'Present the budget **as specified in the RFP**. Add a **budget justification section**: state in paragraph form the rationale for the financial figures shown in tabular, graphical or chart format — salaries and wages, capital equipment, travel, consultants etc.', src: S5 },
    { id: 'c-proposal-appendices', topic: T, front: 'Advice on **appendices** of a proposal.', back: 'Appendices: graphs, tables, letters of support and endorsement, list of references. Some reviewers read them **last, if at all**; additional bulk could produce a **negative reaction**. **When in doubt, leave it out.**', src: S5 },
    { id: 'c-rfp-who', topic: T, front: 'Who sends a **request for proposal (RFP)**, and to whom?', back: 'A **government, company, agency or individual** may send an RFP to **outside vendors who they feel are qualified** to complete a given project.', src: S5 },

    // abstract
    { id: 'c-abstract-define', topic: T, front: 'What is **abstraction**, and why is it necessary?', back: '**Focusing on some details and omitting others.** Facts pertinent to the problem are selected due to **limitations of time, space, purpose** — so it is necessary and desirable.', seen: ['2022-23', '2020-21', '2017-18', '2016-17', '2014-15', '2012-13', '2011-12'], src: `${S2}; “necessary and desirable” from the 18-batch solve` },
    { id: 'c-slanted-abstract', topic: T, front: 'What is a **slanted abstract**, and what is its purpose?', back: 'When facts are selected to **distort reality or support one’s own view of reality**: slanted abstract. **Purpose: to deceive, mislead, miscommunicate.** E.g. selling a car by naming only its brand-new engine and great gas mileage, hiding the broken AC and failing transmission.', seen: ['2023-24', '2020-21'], src: S2 },
  ],

  answers: [
    {
      id: 'a-writing-report',
      topic: T,
      q: 'Define a report. Why are reports important? Briefly describe the steps to be followed in writing a short report.',
      seen: ['2015-16'],
      a: `### Definition
**Report:** a **formal statement of facts, information**, which is written for a **specific audience** for **making informed decision**, is called a report.

A report also contains **inferences made, conclusions reached and recommendations provided**, based on facts and the supporting evidence included.

### Importance of reports
1. **Useful insights for management** — on spending, profits and growth.
2. **Detail for forecasts**, marketing plans, budget planning and decision-making.
3. **Track progress** and growth; identify trends or irregularities.
4. **Audit trail** of business activities.
5. **Transparency** — the annual report is a legal requirement.
6. **Compare performance** with others in the sector.

### Steps in writing a short report
**1. Introduction**
- Give **purpose or aim (always)**, background, list of topics to be discussed, authorization.
- For short introductions (one or two short paragraphs), the title “Introduction” is generally omitted.

**2. Body or text**
- Present all relevant facts **accurately and impartially**.
- Organise.
- Emphasize important ideas by giving important details, placement in document of relevant information.
- Use **headings** to guide reader through the report.
- Include **visual aids** like graphs, charts, pictures whenever they clarify.
- Use **topic sentences** at the beginning of a paragraph.
- Use introductory paragraphs at the beginning of a major section.
- Apply **seven C’s** of writing principles.

**3. Terminal section**
- Summarize, conclude and offer recommendation.
- Summary condenses text, conclusions evaluate and infer from text, recommendations offer specific course of action.
- Summarize points in the **same order** as topics discussed in the text.
- Do not include **new material** in the terminal section of the report.`,
      keys: ['formal statement of facts, information', 'specific audience', 'making informed decision', 'insights for management', 'Audit trail', 'Transparency', 'purpose or aim (always)', 'accurately and impartially', 'headings', 'visual aids', 'topic sentences', 'Terminal section', 'same order', 'new material'],
      lists: ['l-report-importance', 'l-short-report-writing', 'l-short-report-intro', 'l-short-report-body', 'l-report-terminal'],
      src: `${S6}; ${SH} (2015-16 Q6a). Importance: not on the slides — the six points are the 18-batch solve’s. The steps asked are the SHORT-report steps (Introduction / Body / Terminal), not the four long-report steps.`,
    },
    {
      id: 'a-writing-short-structure',
      topic: T,
      q: 'Outline the structure of a short report.',
      seen: ['2022-23'],
      a: `A short report has **three parts**:

1. **Prefatory part or introduction** — gives the purpose or aim (always), background, list of topics to be discussed and authorization.
2. **Discussion, text or body** — presents all relevant facts accurately and impartially, organised, with headings, visual aids and topic sentences; the seven C’s are applied.
3. **Terminal section** — includes **summary, conclusions and recommendations**: the summary condenses the text, the conclusions evaluate and infer from the text, the recommendations offer a specific course of action. Points come in the same order as in the text, and **no new material** is included.`,
      keys: ['three parts', 'Prefatory part or introduction', 'Discussion, text or body', 'Terminal section', 'summary, conclusions and recommendations', 'purpose or aim', 'headings', 'no new material'],
      lists: ['l-report-short-structure', 'l-report-terminal', 'l-short-report-intro', 'l-short-report-body'],
      src: S6,
    },
    {
      id: 'a-writing-short-formats',
      topic: T,
      q: 'What are the different formats of short report?',
      seen: ['2023-24'],
      a: `Short reports come in **three formats** (draw the tree):

### 1. Letter report
- A small report in **letter form**, used to send information to a reader **outside the organization**.
- Includes: date, inside address, salutation, subject line (optional), body, complimentary close, signature, reference section.

### 2. Informational memorandum report
An informational report presented in memorandum form, normally circulated **within the organization** (email, fax etc.). It summarizes facts and avoids inferences, opinions, judgement and recommendations.
- **Conference report** — written by employees or executives after a significant conference with individuals or committees; organized by topics discussed or in chronological fashion.
- **Progress report** — shows progress, i.e. accomplishments, over time or at a given stage of a major assignment; its plan is usually inductive.
- **Periodic report** — written at regular recurring periods: weekly, monthly, quarterly.

### 3. Interpretative / analytical memorandum report
It seeks to **analyze a situation**, has a conclusion, and may or may not have a recommendation.
- **Personnel report** — employee human-resource reports: assignment, attendance, benefits, awards, new employees, terminated employees, discipline, disability.
- **Recommendation-justification report** — recommends a change or remaining with the status quo (policy aspect), supports the idea that something is desirable or undesirable (value aspect), defends the accuracy of information (fact aspect).`,
      keys: ['three formats', 'Letter report', 'letter form', 'outside the organization', 'Informational memorandum report', 'within the organization', 'Conference report', 'Progress report', 'Periodic report', 'analytical memorandum report', 'Personnel report', 'Recommendation-justification report'],
      lists: ['l-report-short-formats', 'l-letter-report-parts', 'l-letter-report-paragraphs', 'l-report-progress', 'l-recjust-aspects', 'l-recjust-sections'],
      src: `${S6}; the tree is how Rahat’s note (CE22) draws the slide`,
      Fig: FormatsFig,
    },
    {
      id: 'a-writing-slanted-abstract',
      topic: T,
      q: 'What is abstraction and why is it necessary? Explain what a slanted abstract is and its purpose.',
      seen: ['2023-24', '2020-21'],
      a: `### Abstraction
**Abstraction** (abstracting) is **focusing on some details and omitting others**. It comes under differences in perception of reality.

### Why it is necessary
- Facts pertinent to the problem are selected due to **limitations of time, space, purpose** — no message can carry every detail of reality.
- So abstraction is **necessary and desirable**.
- Example: a site engineer’s daily report mentions the concrete poured, the labour used and the problems faced — not every minute on site.

### Slanted abstract
When facts are selected to **distort reality** or to support one’s **own view of reality**, the result is a **slanted abstract**: the favourable facts are kept and the unfavourable ones left out.

### Purpose
The purpose of a slanted abstract is **to deceive, mislead, miscommunicate**.

### Example
- **Reality:** the car has a **brand-new engine**, gets great gas mileage, the AC is completely broken, and the transmission is starting to fail.
- **Slanted abstract:** “I’m selling my car. It has a brand-new engine and gets great gas mileage.” The faults are hidden, so the buyer is misled.
- **Honest abstract:** “I’m selling my car. It has a brand-new engine and gets great gas mileage, but it will need transmission and AC work.”
- Civil example: a contractor’s report that mentions only the completed items and hides the failed cube tests.`,
      keys: ['focusing on some details and omitting others', 'limitations of time, space, purpose', 'necessary and desirable', 'distort reality', 'own view of reality', 'slanted abstract', 'to deceive, mislead, miscommunicate', 'brand-new engine'],
      src: `${S2}: definition, necessity, slanted abstract, purpose and the car (reality + honest version) are the slide’s; “necessary and desirable” is the 18-batch solve’s; the slanted version of the car advert and the site / contractor examples are from Rahat’s note. For 8 marks (2023-24) give one line on abstraction, then the slanted abstract, purpose and car example.`,
    },
    {
      id: 'a-writing-proposal-parts',
      topic: T,
      q: 'Describe (list in detail) the different parts of a business proposal and what they contain.',
      seen: ['2016-17', '2012-13'],
      a: `**Proposal:** a written plan or presentation for completing a task is called a proposal. It has three parts: **prefatory parts**, **body** and **supplementary parts**.

### 1. Prefatory parts
1. **Cover, with title**
2. **Inside title page** — title; name of person or company to whom the proposal is submitted; name of person or company submitting the proposal; date.
3. **Table of contents (TOC)** — brief proposals do not require a TOC; long proposals require a TOC as well as a list of tables, figures, illustrations.
4. **List of tables and/or figures**
5. **Request for proposal letter** (owner’s solicitation letter)
6. **Response to proposal** (company’s cover letter)
7. **Description of owner’s requirement**
8. **Schedule for selecting personnel**
9. **Executive summary or abstract** — most important part of a proposal; many evaluators read only it to gain a quick overview; should speak for the complete proposal and be able to stand alone; summarizes what objectives will be met and what procedures will be followed.
10. **Draft contract** — inserted after the executive summary for long proposals; gives an immediate overview of the work including financial information.

### 2. Body
**a. Introduction**
- **Problem** — clearly state the problem and demonstrate clear understanding of it; if pertinent, mention difficulties that may be encountered and methods proposed to overcome them.
- **Need**
- **Scope** — the boundaries set for the project: what you will do and what you will not do.
- **Background** — may be omitted for short proposals; for long proposals: previous work on identical or related projects, literature review and its evaluation, how the proposal will build on already completed projects and research.
- **Objective or purpose** — in simple language, as if approaching a non-specialist; often in infinitive form: to recommend, to bid, to supply.
- **Project team** — list of individuals who will work for the project; in long proposals a brief curriculum vitae of each.

**b. Procedures**
- **Methods, procedures, sources** — state how project requirements will be met: be realistic, be specific as to the method, be precise with the time schedule, be clear how the work will be evaluated, be exact to the scope.
- **Plan of attack**
- **Sequence of activities**
- **Equipment, facilities, products** — what facilities will be needed, what you already have, how you will get what you do not have.
- **Personnel qualifications** — personnel arrangements; company areas involved; individual qualifications in complete biographic form; percentages of time personnel will devote to the project.
- **Budget of costs, prices, total bids** — as specified in the RFP, with a budget justification section (salaries and wages, capital equipment, travel, consultants etc.).

### 3. Supplementary parts
1. Maps, graphs, tables, charts
2. **Letter of support**
3. **Letter of endorsement**
4. References
5. Forms
6. Table of definition
7. **Project schedules**`,
      keys: ['written plan or presentation for completing a task', 'Prefatory parts', 'Inside title page', 'Request for proposal letter', 'Response to proposal', 'Schedule for selecting personnel', 'Executive summary or abstract', 'Draft contract', 'Introduction', 'Procedures', 'Plan of attack', 'Personnel qualifications', 'Supplementary parts', 'Letter of support', 'Letter of endorsement', 'Project schedules'],
      lists: ['l-proposal-parts', 'l-proposal-prefatory', 'l-proposal-body', 'l-proposal-intro', 'l-proposal-procedures', 'l-proposal-supplementary', 'l-proposal-title-page', 'l-proposal-equipment', 'l-proposal-personnel'],
      src: `${S5}; shape = 18-batch solve (2016-17 Q6a); the three-column sketch is how Rahat’s note draws it. For “list” wording the names alone are enough; “in detail / what they contain” needs the sub-points.`,
      Fig: ProposalPartsFig,
    },
    {
      id: 'a-writing-proposal-def-supp',
      topic: T,
      q: 'What is a project proposal? What do the supplementary parts of a project proposal generally contain?',
      seen: ['2017-18'],
      a: `### Project proposal
**Project proposal:** a **written plan or presentation for completing a task** is called a project proposal. The task may be to:
- solve a problem
- alter a procedure
- find answers to questions
- offer advice or training
- conduct research on a topic

### Supplementary parts
The supplementary parts of a project proposal generally contain:
1. **Maps, graphs, tables, charts**
2. **Letter of support**
3. **Letter of endorsement**
4. **References**
5. **Forms**
6. **Table of definition**
7. **Project schedules**

Some reviewers leave the reading of appendices to the last, if they read them at all, and additional bulk could produce a negative reaction — when in doubt whether a document is necessary, leave it out.`,
      keys: ['written plan or presentation for completing a task', 'solve a problem', 'Maps, graphs, tables, charts', 'Letter of support', 'Letter of endorsement', 'References', 'Forms', 'Table of definition', 'Project schedules'],
      lists: ['l-proposal-tasks', 'l-proposal-supplementary'],
      src: `${S5}; ${SH} (2017-18 Q8b). The third part of that question is the chronology (separate answer).`,
    },
    {
      id: 'a-writing-proposal-chronology',
      topic: T,
      q: 'Give a complete chronological description of the steps (procedures) followed during the entire process of a major solicited proposal.',
      seen: ['2017-18', '2012-13'],
      a: `The chronology of procedures for solicited major proposals is given below:

1. **Soliciting company publicly announces** a project in professional publications, newspapers, or writes to companies asking if they are interested in bidding on the project.
2. Contracting companies and others reacting to the public announcement submit **preliminary proposals** based on initial request information.
3. Soliciting company reviews all submitted documents and eliminates some companies on the basis of preliminary review. It establishes a **short list of finalists**.
4. Soliciting company asks each finalist bidding for the project to submit a **highly detailed proposal** and **sets deadlines** for receiving the proposal.
5. Finalist companies select their **written and oral presentation teams**; writing of their proposal proceeds through **several editions**; **oral rehearsals** based on the proposal occur.
6. Finalist companies **submit proposals** to the soliciting group; dates are established for oral presentation to the soliciting group.
7. Finalist companies **make their presentation**.
8. Finalist companies **wait for response**.`,
      keys: ['Soliciting company publicly announces', 'preliminary proposals', 'short list of finalists', 'highly detailed proposal', 'sets deadlines', 'written and oral presentation teams', 'several editions', 'oral rehearsals', 'submit proposals', 'make their presentation', 'wait for response'],
      lists: ['l-proposal-chronology'],
      src: `${S5}; ${SH} (2017-18 Q8b); also 2009-10 Q2(a). The vertical flow chart is Rahat’s tip.`,
      Fig: ChronologyFig,
    },
    {
      id: 'a-writing-exec-summary',
      topic: T,
      q: 'What are the main issues to consider when preparing the executive summary/abstract or synopsis of a proposal? What are the checklist items for methods and procedures of a proposal?',
      seen: ['Jan 2021'],
      a: `### Executive summary, abstract or synopsis
The main issues to consider when preparing the executive summary of a proposal are given below:
1. It is the **most important part** of a proposal.
2. Many evaluators **read only the executive summary** to gain a **quick overview**.
3. It should **speak for the complete proposal**.
4. It should be able to **stand alone**.
5. It should summarize **what objectives will be met**.
6. It should summarize **what procedures will be followed**.

### Checklist for methods and procedures
State how project requirements will be met. The following checklist may be used for that purpose:
1. **Be realistic** as to what you can accomplish. Avoid **overextending** your capabilities and those of your company.
2. **Be specific** as to the method of meeting all goals.
3. **Be precise** with the time schedule.
4. **Be clear** as to how you will evaluate your work, production or product.
5. **Be exact to the scope**: what you will do and what you will not do.`,
      keys: ['most important part', 'read only the executive summary', 'quick overview', 'speak for the complete proposal', 'stand alone', 'what objectives will be met', 'what procedures will be followed', 'Be realistic', 'overextending', 'Be specific', 'Be precise', 'Be clear', 'Be exact to the scope'],
      lists: ['l-exec-summary', 'l-proposal-methods-checklist'],
      src: `${S5}; ${SH} (Jan 2021 Q4b)`,
    },
    {
      id: 'a-writing-proposal-body',
      topic: T,
      q: 'List in detail what the body of a proposal should contain.',
      seen: [],
      a: `The body of a proposal has two sections: **Introduction** and **Procedures**.

### 1. Introduction
1. **Problem** — clearly state the problem and demonstrate clear understanding of the problem; if pertinent, mention difficulties that may be encountered and methods proposed to overcome the problems.
2. **Need**
3. **Scope** — define the boundaries that are being set for the project to accomplish objectives: what you will do and what you will not do.
4. **Background** — may be omitted for short proposals; for long proposals include previous work completed on identical or related projects, literature review on the subject and its evaluation, and a statement showing how the proposal will build on already completed projects and research.
5. **Objective or purpose** — written in a simple language as if approaching a non-specialist; often stated in infinitive form: to recommend, to bid, to supply.
6. **Project team** — list of individuals who will work for the project; in long proposals, a brief curriculum vitae of each individual.

### 2. Procedures
1. **Methods, procedures, sources** — state how project requirements will be met (be realistic; be specific as to the method of meeting all goals; be precise with the time schedule; be clear as to how you will evaluate your work; be exact to the scope).
2. **Plan of attack**
3. **Sequence of activities**
4. **Equipment, facilities, products** — state what facilities will be needed to accomplish the project; state what you already have; show how you will get what you do not have.
5. **Personnel qualifications** — personnel arrangements; company areas involved; individual qualifications, expressed in complete biographic form; percentages of time that personnel will devote to the project.
6. **Budget of costs, prices, total bids** — present the budget as specified in the RFP; add a budget justification section (salaries and wages, capital equipment, travel, consultants etc.).`,
      keys: ['Introduction', 'Procedures', 'Problem', 'Need', 'Scope', 'Background', 'Objective or purpose', 'Project team', 'Methods, procedures, sources', 'Plan of attack', 'Sequence of activities', 'Equipment, facilities, products', 'Personnel qualifications', 'Budget of costs, prices, total bids'],
      lists: ['l-proposal-body', 'l-proposal-intro', 'l-proposal-procedures', 'l-proposal-methods-checklist', 'l-proposal-equipment', 'l-proposal-personnel'],
      src: `${S5}. Not in our 12 papers — asked 2010-11 Q2(b), 2009-10 Q2(b), 2008-09 Q1(a) (Rahat’s question list); 2008-09 also wants the definition of a proposal first.`,
    },
    {
      id: 'a-writing-proposal-style',
      topic: T,
      q: 'Describe briefly the important considerations in terms of writing style and appearance when writing a proposal.',
      seen: [],
      a: `Style and appearance of a proposal is very important. The following issues are to be considered:

1. **General appearance**
2. **Neatness**
3. **Specific appearance** of: table of contents, list of figures, title page, maps, graphs, charts
4. **Consistency of style**
5. **Title** — whether it properly describes the project
6. **Completeness**
7. **Professionalism**
8. **Checking and rechecking** of the final draft until satisfactory
9. Check for proper **typing, proofing**, graphs, etc.`,
      keys: ['General appearance', 'Neatness', 'Specific appearance', 'Consistency of style', 'Title', 'Completeness', 'Professionalism', 'Checking and rechecking', 'typing, proofing'],
      lists: ['l-proposal-style'],
      src: `${S5}. Not in our 12 papers — asked 2008-09 Q1(b) (Rahat’s question list).`,
    },
    {
      id: 'a-writing-rfp',
      topic: T,
      q: 'What is a request for proposal (RFP)? What information may it contain?',
      seen: [],
      a: `A government, company, agency or individual may send a **request for proposal (RFP)** to **outside vendors** who they feel are qualified to complete a given project.

An RFP may contain the following information:
1. Express clearly the **product or service** for which bids are desired.
2. Give the **name, address, phone number** of the person to whom the proposal should be sent.
3. Be precise as to **what bidders must include** — this makes initial screening easier for locating qualified candidates.
4. Indicate the **time by which the proposal should arrive**.`,
      keys: ['request for proposal (RFP)', 'outside vendors', 'product or service', 'name, address, phone number', 'what bidders must include', 'time by which the proposal should arrive'],
      lists: ['l-rfp-contents'],
      src: `${S5}. On this term’s slides, not asked yet (Rahat’s note marks it a possible short question).`,
    },
    {
      id: 'a-writing-long-report',
      topic: T,
      q: 'What is a long report? Describe its structure and the steps of writing it.',
      seen: [],
      a: `### Long report
A long report is an **extension of a short report**: greater length and depth of discussion of more complex problems; more preliminary collecting, sorting, interpreting, writing, editing and creation of visuals; a mix of informative and persuasive information.

### Structure
1. **Prefatory part** — cover; frontispiece; copyright notice; forwarding letter / transmittal letter; preface; acknowledgements; table of contents; list of illustrations; abstract and executive summary.
2. **Main body** — introduction; discussion or text (chapters, sections, subsections); conclusions; recommendations.
3. **Back matter** — appendices; list of references; bibliography; glossary; index.

### Preparatory steps
1. Recognize clearly the issues, problems, purpose, scope of the report.
2. Realize who your readers will be.
3. Get an idea of sources of information.
4. Understand when the report needs to be completed.
5. Recognize financial and time constraints.

### Writing the long report: four steps
1. **First step** — define the problem; collect all needed material; sort and interpret data; organize the final outline; prepare visual aids; finally write, edit, revise, type.
2. **Second step (writing first draft)** — write the outline and start writing; summary, conclusions, recommendations; introduction; then executive summary, letter of transmittal, bibliography or endnotes, table of contents, table of figures.
3. **Third step (editing, revising draft)** — lay aside the first draft for several days; look objectively at the material and identify weakness of the draft; revise, rewrite the draft several times.
4. **Final step (type the document)** — harmonious style throughout; double or single spacing; top margin of 1.5 to 2 inch; every page except the cover and title fly numbered.

### Letter of transmittal
A cover letter or cover memorandum with five parts: **authorization**, **transmittal details**, **background and methodology**, **highlights**, **courteous ending**.`,
      keys: ['extension of a short report', 'Prefatory part', 'Main body', 'Back matter', 'frontispiece', 'glossary', 'First step', 'writing first draft', 'editing, revising draft', 'type the document', 'authorization', 'transmittal details', 'background and methodology', 'highlights', 'courteous ending'],
      lists: ['l-report-long-structure', 'l-long-prefatory', 'l-long-back', 'l-long-prep-steps', 'l-report-steps', 'l-transmittal-parts', 'l-report-title-5w', 'l-report-exec-summary'],
      src: `${S6}. Half of the report slides, never asked yet (Rahat’s note marks it a likely new question).`,
    },
  ],
} satisfies PcTopicContent
