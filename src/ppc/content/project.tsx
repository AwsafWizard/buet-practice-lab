// pc-project — Project, life cycle, project development, pre-design (Tanvir sir L2–L3).
// Source digest: CE301/Claude digests/lec_project_legal.md (pr-project).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-project' as const

// ---------- figures (theme tokens only) ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const oia = 'var(--c-oia)'

const TriangleFig: FC = () => (
  <svg viewBox="0 0 360 236" width="100%" role="img" aria-label="Scope, schedule and budget triangle">
    <text x={180} y={18} textAnchor="middle" fontSize={12} fill={mute}>
      One leg cannot move without affecting the other two
    </text>
    <polygon points="180,42 50,192 310,192" fill={panel2} stroke={oia} strokeWidth={2.5} />
    <text x={102} y={106} transform="rotate(-49 102 106)" textAnchor="middle" fontSize={14} fontWeight={700} fill={ink}>
      SCOPE
    </text>
    <text x={258} y={106} transform="rotate(49 258 106)" textAnchor="middle" fontSize={14} fontWeight={700} fill={ink}>
      BUDGET
    </text>
    <text x={180} y={214} textAnchor="middle" fontSize={14} fontWeight={700} fill={ink}>
      SCHEDULE
    </text>
    <text x={180} y={150} textAnchor="middle" fontSize={12} fill={ink}>
      A complete definition
    </text>
    <text x={180} y={166} textAnchor="middle" fontSize={12} fill={ink}>
      of the project
    </text>
    <text x={180} y={232} textAnchor="middle" fontSize={11} fill={mute}>
      quality connects scope, schedule and budget
    </text>
  </svg>
)

const ParticipantsFig: FC = () => {
  const main = [
    ['Client', 'Prime mover and', 'sometimes the user'],
    ['Engineer and/or Architect', 'Developer of the', 'design'],
    ['Contractor', 'Organizer and', 'builder'],
  ]
  const fourth = [
    ['Legislative and', 'statutory bodies'],
    ['Regulatory and', 'permitting agencies'],
    ['Licensing organizations', 'and professional societies'],
    ['The public and special', 'interest groups'],
  ]
  return (
    <svg viewBox="0 0 470 262" width="100%" role="img" aria-label="Participants in project development">
      <text x={115} y={20} textAnchor="middle" fontSize={12} fontWeight={700} fill={ink}>
        THREE MAIN GROUPS
      </text>
      <text x={355} y={20} textAnchor="middle" fontSize={12} fontWeight={700} fill={ink}>
        FOURTH GROUP
      </text>
      {main.map(([h, a, b], i) => (
        <g key={h}>
          <rect x={20} y={32 + i * 76} width={190} height={66} rx={6} fill={panel2} stroke={oia} strokeWidth={1.8} />
          <text x={32} y={52 + i * 76} fontSize={12} fontWeight={700} fill={ink}>
            {h}
          </text>
          <text x={32} y={69 + i * 76} fontSize={12} fill={ink}>
            {a}
          </text>
          <text x={32} y={85 + i * 76} fontSize={12} fill={ink}>
            {b}
          </text>
        </g>
      ))}
      <rect x={240} y={32} width={220} height={218} rx={6} fill={panel2} stroke={mute} strokeWidth={1.5} />
      {fourth.map(([a, b], i) => (
        <g key={a}>
          <text x={252} y={58 + i * 52} fontSize={12} fill={ink}>
            {a}
          </text>
          <text x={252} y={74 + i * 52} fontSize={12} fill={ink}>
            {b}
          </text>
        </g>
      ))}
    </svg>
  )
}

const FlowFig: FC = () => {
  const chain: [string, number, number][] = [
    ['PREDESIGN', 10, 92],
    ['DESIGN', 122, 80],
    ['BID', 222, 46],
    ['CONSTRUCT', 288, 92],
    ['OCCUPY-ADAPT', 400, 110],
    ['DECOMMISSION', 530, 120],
  ]
  const y = 120
  return (
    <svg viewBox="0 0 680 290" width="100%" role="img" aria-label="Flow of work in project development">
      <defs>
        <marker id="pc-flow-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={mute} />
        </marker>
      </defs>
      {chain.map(([t, x, w], i) => (
        <g key={t}>
          <rect x={x} y={y} width={w} height={30} rx={4} fill={panel2} stroke={t === 'DESIGN' ? oia : mute} strokeWidth={t === 'DESIGN' ? 2.2 : 1.5} />
          <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
            {t}
          </text>
          {i < chain.length - 1 && (
            <line x1={x + w} y1={y + 15} x2={chain[i + 1][1] - 1} y2={y + 15} stroke={mute} strokeWidth={1.5} markerEnd="url(#pc-flow-arr)" />
          )}
        </g>
      ))}
      {/* program / brief call-out */}
      <line x1={112} y1={92} x2={112} y2={y} stroke={mute} />
      {['PROGRAM / BRIEF', '• project definition package', '• project alignment &', '  partnering agreement', '• schedule, budget'].map((s, i) => (
        <text key={s} x={10} y={22 + i * 15} fontSize={11} fontWeight={i === 0 ? 700 : 400} fill={ink}>
          {s}
        </text>
      ))}
      {/* statement of need */}
      <line x1={40} y1={y + 30} x2={40} y2={178} stroke={mute} />
      {['STATEMENT OF NEED', '• justification', '• order-of-magnitude', '  cost estimate', '• budget'].map((s, i) => (
        <text key={s} x={10} y={194 + i * 15} fontSize={11} fontWeight={i === 0 ? 700 : 400} fill={ink}>
          {s}
        </text>
      ))}
      {/* post-completion and restatement */}
      <line x1={412} y1={92} x2={412} y2={y} stroke={mute} />
      <text x={392} y={70} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        POST-COMPLETION
      </text>
      <text x={392} y={84} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        REVIEW
      </text>
      <line x1={498} y1={92} x2={498} y2={y} stroke={mute} />
      <text x={522} y={70} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        RESTATEMENT
      </text>
      <text x={522} y={84} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        OF NEED
      </text>
      {/* design expanded */}
      <ellipse cx={162} cy={y + 15} rx={50} ry={24} fill="none" stroke={oia} strokeDasharray="3 3" />
      <line x1={175} y1={y + 38} x2={194} y2={236} stroke={mute} strokeWidth={1.5} markerEnd="url(#pc-flow-arr)" />
      <ellipse cx={428} cy={236} rx={246} ry={44} fill="none" stroke={oia} strokeDasharray="3 3" />
      <text x={210} y={186} fontSize={11} fill={mute}>
        VALIDATION OF PROGRAM / BRIEF
      </text>
      {[
        ['Schematic design', '(SD) 20%', 196, 110],
        ['Design development', '(DD) 30%', 306, 140],
        ['Construction documents', '(CD) 50%', 446, 214],
      ].map(([a, b, x, w]) => (
        <g key={a as string}>
          <rect x={x as number} y={216} width={w as number} height={40} fill={panel2} stroke={oia} strokeWidth={1.5} />
          <text x={(x as number) + (w as number) / 2} y={232} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
            {a}
          </text>
          <text x={(x as number) + (w as number) / 2} y={248} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
            {b}
          </text>
        </g>
      ))}
    </svg>
  )
}

const LifeCycleFig: FC = () => (
  <svg viewBox="0 0 400 240" width="100%" role="img" aria-label="Level of activity during the project life cycle">
    <defs>
      <marker id="pc-lc-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill={mute} />
      </marker>
    </defs>
    <rect x={50} y={20} width={300} height={180} fill="none" stroke={mute} />
    <path d="M52,196 C110,192 150,104 200,100 S285,180 346,196" fill="none" stroke={oia} strokeWidth={2.5} />
    <path d="M52,198 C150,196 170,62 346,48" fill="none" stroke={ink} strokeWidth={2} />
    <text x={268} y={44} fontSize={12} fill={ink}>
      Cumulative
    </text>
    <text x={60} y={100} fontSize={12} fill={oia} fontWeight={700}>
      Period-by-period
    </text>
    <text x={30} y={110} transform="rotate(-90 30 110)" textAnchor="middle" fontSize={12} fill={ink}>
      Project activity
    </text>
    <text x={372} y={110} transform="rotate(90 372 110)" textAnchor="middle" fontSize={12} fill={ink}>
      Cumulative activity
    </text>
    <text x={170} y={222} textAnchor="middle" fontSize={12} fill={ink}>
      Time
    </text>
    <line x1={190} y1={218} x2={240} y2={218} stroke={mute} strokeWidth={1.5} markerEnd="url(#pc-lc-arr)" />
    <text x={200} y={237} textAnchor="middle" fontSize={11} fill={mute}>
      Level of activity during the project life cycle
    </text>
  </svg>
)

// ---------- seen labels ----------
const DEF_SEEN = ['2020-21', '2017-18', '2016-17', '2015-16', '2014-15', '2011-12']
const TRI_SEEN = ['2022-23', '2017-18', '2016-17', '2014-15', '2013-14', '2011-12']
const CHAR_SEEN = ['2021-22', '2020-21', '2017-18', '2016-17', '2014-15', '2012-13']
const FLOW_SEEN = ['2017-18', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12']
const CONCERN_SEEN = ['2023-24', '2022-23', '2021-22', '2017-18']
const BRIEF_SEEN = ['2023-24', '2022-23', '2021-22', '2020-21']
const PART_SEEN = ['Jan 2021', '2020-21', '2015-16', '2014-15', '2013-14']

const lists: PcList[] = [
  {
    id: 'l-pr-def',
    topic: T,
    title: 'Things a project is an endeavor that will do (definition, "to be more specific")',
    points: [
      { k: 'Accomplish a specific client need or goal' },
      { k: 'Related activities guided by a leader', alt: ['guided by a project manager'], d: 'include related activities guided by a leader or project manager' },
      { k: 'Cross-departmental personnel or unique experts', d: 'capable of providing unique services to the project' },
      { k: 'Performed for a fixed duration of time', alt: ['fixed duration'] },
    ],
    seen: DEF_SEEN,
    src: 'Tanvir sir L2 p5',
    note: 'The question bank uses the PMI definition ("a temporary endeavour undertaken to create a unique product, service or result") — not the slide.',
  },
  {
    id: 'l-pr-pm-rise',
    topic: T,
    title: 'Developments behind the rise of modern project management (1930s–1950s)',
    points: [
      { k: 'System engineering in U.S. defense and aerospace', alt: ['system engineering'] },
      { k: 'Engineering management in process engineering' },
      { k: 'Developments in management theory', d: 'particularly in organization design' },
      { k: 'Evolution of the computer', d: 'enabling many project management tools' },
    ],
    seen: [],
    src: 'Tanvir sir L2 p3',
  },
  {
    id: 'l-pr-evolution',
    topic: T,
    title: 'Evolution of design toward collaboration and integration (Modern → Postmodern)',
    points: [
      { k: 'Taylorism → Systems engineering', alt: ['Taylorism', 'systems engineering'], d: 'strict, tight control of work → manage the project as a whole, interconnected system' },
      { k: 'Hierarchical/vertical → Flat/layered/horizontal', alt: ['hierarchical', 'flat'], d: 'bosses at the top give orders → everyone on a similar level, side by side' },
      { k: 'Specialization → Interdisciplinary', alt: ['specialization', 'interdisciplinary'], d: 'narrow specific jobs → different fields working together as a team' },
      { k: 'Rational order → Messy complexity', alt: ['rational order', 'messy complexity'], d: 'neat predictable plan → real-world problems, complicated and full of change' },
      { k: 'Centralized control → Distributed control', alt: ['centralized control', 'distributed control'], d: 'one leader or office decides → power shared so several teams decide' },
      { k: 'Experts → Meritocracy', alt: ['experts', 'meritocracy'], d: 'a few highly trained people give answers → power/rewards for good ideas and performance' },
      { k: 'Tightly coupled system → Networked system', alt: ['tightly coupled', 'networked system'], d: 'if one part breaks everything stops → parts linked flexibly, still work if one fails' },
      { k: 'Micro-management → Blackboxing', alt: ['micro-management', 'blackboxing'], d: 'boss controls every tiny detail → focus on the final result without forcing every step to be shown' },
      { k: 'Hierarchical decision making → Consensus-reaching', alt: ['hierarchical decision making', 'consensus'], d: 'only top bosses decide → the whole group agrees' },
      { k: 'Bureaucratic structure → Collegial community', alt: ['bureaucratic', 'collegial community'], d: 'rigid rules and paperwork → a group working together as equals' },
      { k: 'Incremental → Discontinuous', alt: ['incremental', 'discontinuous'], d: 'slow, small step-by-step change → big, sudden jumps' },
      { k: 'Closed → Open', alt: ['closed', 'open'], d: 'work kept private and isolated → information shared, others collaborate' },
    ],
    seen: [],
    src: 'Tanvir sir L2 p4; paradigms glossary handout; Class Test 1 (d), (g)',
    note: 'Left column = Modern (Taylorism), right column = Postmodern (Systems Engineering). CT-1: the postmodern model does NOT favour centralized control/specialization/hierarchical decisions (d = False); blackboxing does NOT mean controlling every detail (g = False).',
  },
  {
    id: 'l-pr-measures',
    topic: T,
    title: 'Measures of project activity (apply throughout the full span)',
    points: [
      { k: 'Time', d: 'temporal progress of activities; extent to which schedules and deadlines are being met' },
      { k: 'Cost', d: 'rate of resource expenditure compared to budgeted resources' },
      { k: 'Performance', d: 'outputs compared to objectives, specifications and requirements — a measure of quality' },
    ],
    seen: ['2022-23', '2015-16', '2013-14'],
    src: 'Tanvir sir L2 p12–13',
    note: 'The question bank (and the 18-batch solve, 2015-16 7a) answer "scope, schedule and budget" — that is the triangle; the slide says Time, Cost, Performance.',
  },
  {
    id: 'l-pr-characteristics',
    topic: T,
    title: 'Characteristics of a project',
    points: [
      { k: 'Projects have a purpose', alt: ['purpose'], d: 'clearly defined aims; solve a "problem"; lasting social change' },
      { k: 'Projects are realistic', alt: ['realistic'], d: 'achievable aims within financial and human resources' },
      { k: 'Limited in time and space', d: 'a beginning and an end; specific place(s) and context' },
      { k: 'Projects are complex', alt: ['complex'], d: 'various planning and implementation skills; various partners and players' },
      { k: 'Projects are collective', alt: ['collective'], d: 'teamwork; cater for the needs of others' },
      { k: 'Projects are unique', alt: ['unique'], d: 'stem from new ideas; specific response in a specific context; innovative' },
      { k: 'Projects are an adventure', alt: ['adventure'], d: 'different and ground-breaking; uncertainty and risk' },
      { k: 'Projects can be assessed', alt: ['assessed'], d: 'measurable aims open to evaluation' },
      { k: 'Projects are made up of stages', alt: ['stages'], d: 'distinct, identifiable stages' },
    ],
    hook: '"A Purposeful, Realistic, Limited project is Complex, Collective and Unique — an Adventure you can Assess in Stages."',
    seen: CHAR_SEEN,
    src: 'Tanvir sir L2 p16–18',
    note: 'The question bank gives PMI traits (temporary, progressively elaborated, many stakeholders) — not the slide’s nine.',
  },
  {
    id: 'l-pr-dominate',
    topic: T,
    title: 'Who dominates each stage of the project life cycle',
    points: [
      { k: 'Clients and planners', d: 'early stages' },
      { k: 'Designers, builders and implementers', d: 'middle stages' },
      { k: 'Users and operators', d: 'later stages' },
    ],
    ordered: true,
    seen: ['2011-12'],
    src: 'Tanvir sir L2 p12',
  },
  {
    id: 'l-pr-lc-obstacles',
    topic: T,
    title: 'What unforeseen obstacles in the life cycle can cause',
    points: [{ k: 'Missed deadlines' }, { k: 'Cost overruns', alt: ['cost overturns'] }, { k: 'Poor project performance' }],
    seen: ['2011-12'],
    src: 'Tanvir sir L2 p14',
  },
  {
    id: 'l-pr-lc-response',
    topic: T,
    title: 'What management must do when managing the life cycle',
    points: [
      { k: 'Anticipate problems and plan for them' },
      { k: 'Re-plan activities' },
      { k: 'Shift resources', d: 'as unforeseen problems occur' },
      { k: 'Continuously balance resources among projects', d: 'each gets what it needs, yet the sum does not exceed the resources available' },
    ],
    ordered: true,
    seen: ['2011-12'],
    src: 'Tanvir sir L2 p15',
  },
  {
    id: 'l-pr-participants',
    topic: T,
    title: 'Three main groups (key players) in project development',
    points: [
      { k: 'Owner (client)', alt: ['client', 'owner'], d: 'prime mover and sometimes the user' },
      { k: 'Designer (engineer and/or architect)', alt: ['engineer', 'architect', 'designer'], d: 'developer of the design' },
      { k: 'Builder or contractor', alt: ['contractor', 'builder'], d: 'organizer and builder' },
    ],
    seen: PART_SEEN,
    src: 'Tanvir sir L3 p11–12',
  },
  {
    id: 'l-pr-fourth-group',
    topic: T,
    title: 'Fourth group that coexists with the three main groups',
    points: [
      { k: 'Legislative and statutory bodies' },
      { k: 'Regulatory and permitting agencies' },
      { k: 'Licensing organizations and professional societies' },
      { k: 'The public and special interest groups' },
    ],
    seen: PART_SEEN,
    src: 'Tanvir sir L3 p12',
    note: 'The question bank’s fourth group adds financiers, insurers, sureties and lawyers — not on the slide.',
  },
  {
    id: 'l-pr-pm-plan',
    topic: T,
    title: 'Components of a project management plan',
    points: [
      { k: 'General project information' },
      { k: 'Major client, stakeholder and general information' },
      { k: 'Organizational structure', d: 'key disciplines, team members' },
      { k: 'Scope of work and work plan' },
      { k: 'Project schedule' },
      { k: 'Project budget' },
      { k: 'Communication plan' },
      { k: 'Health and safety plan' },
      { k: 'Project quality plan' },
    ],
    seen: ['Jan 2021'],
    src: '18-batch TF solve only (not in this term’s slides)',
    note: 'The solver himself marked it out of syllabus ("lecture slides of batch ’17 and ’18 are not exactly the same").',
  },
  {
    id: 'l-pr-aec-players',
    topic: T,
    title: 'Players involved in constructed products (AEC industry)',
    points: [
      { k: 'Private owners' },
      { k: 'Developers' },
      { k: 'Government agencies' },
      { k: 'Engineers & architects' },
      { k: 'Other designers' },
      { k: 'Builders' },
      { k: 'Product & material suppliers' },
      { k: 'Real estate agents' },
      { k: 'Lending institutions' },
      { k: 'Inspectors' },
    ],
    seen: ['2022-23'],
    src: 'Tanvir sir L3 p9',
  },
  {
    id: 'l-pr-flow',
    topic: T,
    title: 'Phases in the flow of work in project development',
    points: [
      { k: 'Pre-design', alt: ['predesign'], d: 'Statement of Need; program/brief' },
      { k: 'Design', d: 'SD 20% → DD 30% → CD 50%' },
      { k: 'Bid' },
      { k: 'Construction', alt: ['construct'] },
      { k: 'Occupancy and adaptive re-use', alt: ['occupy-adapt', 'occupancy'], d: 'post-completion review; restatement of need' },
      { k: 'Decommissioning and/or demolition', alt: ['decommission'] },
    ],
    ordered: true,
    hook: '"Please Design, Bid, Construct, Occupy, Decommission" — P-D-B-C-O-D.',
    seen: FLOW_SEEN,
    src: 'Tanvir sir L3 p13',
    note: 'The question bank uses invented stages (planning → … → commissioning → O&M). Draw the slide’s six boxes.',
  },
  {
    id: 'l-pr-design-sub',
    topic: T,
    title: 'Sub-phases of design with their share of design effort',
    points: [
      { k: 'Schematic design (SD) 20%', alt: ['schematic design'] },
      { k: 'Design development (DD) 30%', alt: ['design development'] },
      { k: 'Construction documents (CD) 50%', alt: ['construction documents'] },
    ],
    ordered: true,
    seen: ['2017-18', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
    src: 'Tanvir sir L3 p13, p24',
  },
  {
    id: 'l-pr-design-phases',
    topic: T,
    title: 'Phases of the design effort',
    points: [
      { k: 'Schematic design' },
      { k: 'Design development' },
      { k: 'Construction document', alt: ['construction documents'] },
      { k: 'Bidding' },
      { k: 'Construction' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L3 p22',
  },
  {
    id: 'l-pr-predesign-data',
    topic: T,
    title: 'Data to include during pre-design',
    points: [
      { k: 'History of events leading to the decision to build' },
      { k: 'Purpose & function of the project' },
      { k: 'Policy decision' },
      { k: 'Timescale for the project' },
      { k: 'Cost limit, or budget', alt: ['budget'] },
      { k: 'Details of the site and services' },
      { k: 'Basic details of building requirements' },
      { k: 'Comparable best practices' },
    ],
    hook: '"History, Purpose, Policy, Time, Cost, Site, Building, Best practice" — the story of the project from why to what.',
    seen: ['2012-13'],
    src: 'Tanvir sir L3 p16',
    note: 'The question bank gives generic data (zoning, market data, surveys) — not the slide list.',
  },
  {
    id: 'l-pr-predesign-activities',
    topic: T,
    title: 'Key activities in pre-design',
    points: [
      { k: 'Confirming that options have been identified' },
      { k: 'Agreeing upon which option(s) to pursue' },
      { k: 'Identifying potential problems in the budget', d: '…with items in the budget and agreeing on a total budget' },
      { k: 'Establishing a timeline' },
      { k: 'Carrying out a risk assessment' },
      { k: 'Defining clear objectives' },
      { k: 'Preparing a Program / Statement of Need / Brief', alt: ['preparing the brief'] },
    ],
    hook: 'Options found → option chosen → Budget → Timeline → Risk → Objectives → Brief: "O-O-B-T-R-O-B".',
    seen: ['2012-13', '2011-12'],
    src: 'Tanvir sir L3 p18',
  },
  {
    id: 'l-pr-predesign-purpose',
    topic: T,
    title: 'Purposes of the pre-design phase',
    points: [
      { k: 'Establish project scope, budget, and schedule' },
      { k: 'Obtain necessary permits' },
      { k: 'Select prime designer' },
    ],
    seen: ['2011-12'],
    src: 'Tanvir sir L3 p24',
  },
  {
    id: 'l-pr-predesign-deliv',
    topic: T,
    title: 'Deliverables of the pre-design phase',
    points: [
      { k: 'Design criteria, program, or brief' },
      { k: 'Order of magnitude cost estimate' },
      { k: 'Schedule' },
      { k: 'RFP and scope of work (SOW)', alt: ['RFP', 'SOW'] },
    ],
    seen: ['2011-12'],
    src: 'Tanvir sir L3 p24',
  },
  {
    id: 'l-pr-client-concerns',
    topic: T,
    title: 'Common client concerns during pre-design',
    points: [
      { k: 'Early indication of cost' },
      { k: 'Early indication of schedule' },
      { k: 'Functional constraints — spaces and services', alt: ['functional constraints'] },
      { k: 'Environmental issues — planning and site', alt: ['environmental issues'] },
    ],
    hook: 'Two EARLY questions (cost? schedule?) and two CONSTRAINTS (spaces & services; planning & site).',
    seen: CONCERN_SEEN,
    src: 'Tanvir sir L3 p20 (Key Briefing Issues)',
    note: 'The question bank answers with a paragraph of generic questions (financing, permits, stakeholders) — the slide has exactly these four.',
  },
  {
    id: 'l-pr-success',
    topic: T,
    title: 'Conditions necessary for success (pre-design / briefing)',
    points: [
      { k: 'Clear points of contact', d: 'client and design team clear points of contact' },
      { k: 'Decision-making authority of client rep.', alt: ['decision-making authority'] },
      { k: 'Effective client/design team organization' },
      { k: 'Communication media clearly understood by all' },
    ],
    hook: '"Contact, Authority, Organization, Media" — who to call, who decides, how we’re organised, how we talk.',
    seen: ['2021-22'],
    src: 'Tanvir sir L3 p20',
    note: 'The question bank lists eight generic conditions (funding, schedule, site data…) — the slide has these four.',
  },
  {
    id: 'l-pr-brief',
    topic: T,
    title: 'Attributes of an effective brief',
    points: [
      { k: 'Limited number of key objectives expressed' },
      { k: 'Layered and iterative', d: 'reflecting design stages' },
      { k: 'Fluid until the last possible moment' },
      { k: 'Fixed and frozen once complete' },
      { k: 'Requirements backed up with hard data' },
      { k: 'Performance measured' },
      { k: 'Innovation balanced with established use' },
      { k: 'Users and building demands balanced' },
      { k: 'Related to chosen procurement process' },
      { k: 'Concise and clear' },
    ],
    hook: 'Shape it "L-L-F-F" (Limited, Layered, Fluid, Frozen) → prove it (hard data, performance measured) → balance it twice (innovation vs established use; users vs building) → tie it to procurement → say it concise & clear.',
    seen: BRIEF_SEEN,
    src: 'Tanvir sir L3 p20 (Key Briefing Issues)',
    note: 'The question bank gives ten invented attributes (purpose, budget, site data, decision-maker…) — learn the slide’s ten.',
  },
  {
    id: 'l-pr-brief-payoffs',
    topic: T,
    title: 'Payoffs of getting requirements right early',
    points: [{ k: 'Improved product quality' }, { k: 'Saving of time & budget' }, { k: 'Better client relation' }],
    seen: [],
    src: 'Tanvir sir L3 p20',
  },
  {
    id: 'l-pr-brief-steps',
    topic: T,
    title: 'Steps in developing the Brief / Statement of Need',
    points: [
      { k: 'Elicit', d: 'vision and scope, objectives, key users, champions, focus groups, support organization' },
      { k: 'Analyze', d: 'need to build, physical & nonphysical context, prioritize, model cost and schedule, QFD, roles' },
      { k: 'Document', d: 'purpose and functions, business case, cost/schedule limits, SoN template, traceability matrix' },
      { k: 'Verify', d: 'inspect requirements document, cross-check performance requirements, user acceptance criteria' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L3 p19',
  },
  {
    id: 'l-pr-qcp-elements',
    topic: T,
    title: 'Important elements of a QCP',
    points: [
      { k: 'Knowledgeable project manager', d: 'adept at implementing a QCP' },
      { k: 'Experienced QC team', d: 'capable of reviewing contract documents' },
      { k: 'Extensive & successful QCP outline' },
    ],
    seen: ['2017-18', '2012-13'],
    src: 'Tanvir sir L3 p30',
  },
  {
    id: 'l-pr-qcp-impl',
    topic: T,
    title: 'Implementation of a comprehensive QCP includes',
    points: [
      { k: 'Clear & concise organizational chart', d: 'outlining roles & responsibilities of the QC team' },
      { k: 'Proper scheduling of review' },
      { k: 'Ample time for each review' },
      { k: 'Good project management practice', d: 'to ensure the reviews are completed' },
    ],
    seen: ['2017-18', '2012-13'],
    src: 'Tanvir sir L3 p30',
  },
  {
    id: 'l-pr-qcp-benefits',
    topic: T,
    title: 'What a comprehensive QCP does',
    points: [
      { k: 'Reduces the risk', d: 'of incomplete or poorly completed work products' },
      { k: 'Improves the overall quality of the work' },
      { k: 'Enables a final review', d: 'for any missing items or incorrect standards' },
    ],
    seen: ['2017-18', '2012-13'],
    src: 'Tanvir sir L3 p31',
  },
  {
    id: 'l-pr-sow',
    topic: T,
    title: 'What the SOW (statement of work) needs to include',
    points: [{ k: 'Cost estimate' }, { k: 'Project schedule' }, { k: 'Tabulated labor categories', d: 'may include subcontractors, so the client can choose a path forward' }],
    seen: [],
    src: 'Tanvir sir L3 p3',
  },
  {
    id: 'l-pr-bizdev',
    topic: T,
    title: 'Business development process (David Evans & Associates)',
    points: [
      { k: 'Identify/screen project leads' },
      { k: 'Tracking phase' },
      { k: 'Positioning phase', d: 'project understanding, strategy, teaming, go/no-go' },
      { k: 'Agency request for proposals (RFP)', alt: ['RFP'] },
      { k: 'Proposal phase', d: 'qualifications, PM & key staff, technical approach, sealed cost proposal' },
      { k: 'Agency reviews proposals', d: 'selection committee, QBS, ranking and short list' },
      { k: 'Interview phase' },
      { k: 'Agency selects consultant', d: 'final ranking, notify top-ranked firm, open cost proposal' },
      { k: 'Negotiation phase', d: 'final scope, billing rates, negotiate price, execute contract' },
      { k: 'Start project' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L3 p5',
  },
  {
    id: 'l-pr-proposal',
    topic: T,
    title: 'Key components of problem solving in engineering proposals',
    points: [
      { k: 'Identifying the client’s particular problem' },
      { k: 'Background knowledge, teamwork and a clear SOW' },
      { k: 'Understanding requirements and constraints' },
      { k: 'Ability to communicate clearly' },
      { k: 'Formulating technical alternatives' },
      { k: 'Alternative evaluation and/or selection' },
      { k: 'Engineering design', d: 'plans, specifications and cost estimates' },
      { k: 'Construction assistance, monitoring or management' },
      { k: 'Start-up and/or O&M assistance' },
      { k: 'Creating a realistic project schedule' },
    ],
    seen: [],
    src: 'Tanvir sir L3 p8',
  },
  {
    id: 'l-pr-design-thinking',
    topic: T,
    title: 'Phases of design thinking (Tim Brown, IDEO)',
    points: [
      { k: 'Inspiration', d: 'explore the circumstances (problems and/or opportunities)' },
      { k: 'Ideation', d: 'generate, develop and test ideas' },
      { k: 'Implementation', d: 'chart the path to completion' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L3 p26–27',
  },
  {
    id: 'l-pr-designer-process',
    topic: T,
    title: 'What a designer must process in pursuit of acceptable solutions',
    points: [
      { k: 'Client requirements' },
      { k: 'Technical variables' },
      { k: 'Physical, budgetary and schedule constraints' },
      { k: 'Permitting & code issues' },
      { k: 'Political realities' },
    ],
    seen: [],
    src: 'Tanvir sir L3 p25',
  },
  {
    id: 'l-pr-design-contract',
    topic: T,
    title: 'What the client–designer contract spells out',
    points: [
      { k: 'Design tasks to be performed' },
      { k: 'Parties’ specific responsibilities during design' },
      { k: 'Client approvals required' },
      { k: 'Schedule', d: 'start date, end dates and major milestones' },
      { k: 'Budget', d: 'including any contingencies' },
    ],
    seen: [],
    src: 'Tanvir sir L3 p21',
  },
  {
    id: 'l-pr-bid-items',
    topic: T,
    title: 'Procurement & contracting requirements a CE may include in the project manual',
    points: [
      { k: 'Advertisement for bids' },
      { k: 'Invitation to bid' },
      { k: 'Instruction to bidders' },
      { k: 'Prebid meetings' },
      { k: 'Land survey information' },
      { k: 'Geotechnical information' },
      { k: 'Bid forms' },
      { k: 'Owner-contractor agreement forms' },
      { k: 'Bond forms' },
      { k: 'Certificate of substantial completion form' },
      { k: 'Certificate of completion form' },
      { k: 'Conditions of the contract' },
      { k: 'Procedure for answering bidders’ questions' },
    ],
    seen: [],
    src: 'Tanvir sir L3 p28',
  },
  {
    id: 'l-pr-post-award',
    topic: T,
    title: 'CE’s duties after contract award',
    points: [
      { k: 'Attending a preconstruction meeting' },
      { k: 'Responding to RFIs', alt: ['request for information'] },
      { k: 'Making field observations' },
      { k: 'Reviewing submittals and shop drawings' },
    ],
    seen: [],
    src: 'Tanvir sir L3 p29',
  },
]

const cards: PcCard[] = [
  {
    id: 'c-pr-def',
    topic: T,
    front: 'Define **project** (Tanvir sir’s first sentence).',
    back: '"A project is an **endeavor that is undertaken to produce results expected from the requesting party**."',
    seen: DEF_SEEN,
    src: 'Tanvir sir L2 p5',
  },
  {
    id: 'c-pr-owner',
    topic: T,
    front: 'Why does an owner need a project team, and what happens after completion?',
    back: 'The requester/owner generally lacks the **expertise or the time (or both)**. The project has a fixed or estimated life; afterwards **operation and maintenance revert to the owner** — though some owners have builders provide start-up or even long-term operation.',
    src: 'Tanvir sir L2 p6',
  },
  {
    id: 'c-pr-pm-origin',
    topic: T,
    front: 'When was project management spawned, and what did **Morris** call its inception?',
    back: 'Mid-20th century. A 1930s writer proposed a **coordinator** for tasks spanning several functional areas; (Peter) **Morris** saw this **separate mechanism to integrate the entities of a project** as the inception of modern PM (Class Test 1 f: True). Today: "**management by projects**".',
    src: 'Tanvir sir L2 p2–3',
  },
  {
    id: 'c-pr-blackboxing',
    topic: T,
    front: 'What is **blackboxing** in postmodern project management?',
    back: 'Focusing on the **final result** without the manager controlling every internal step: the opposite of **micro-management**. (Class Test 1 g: "a senior manager must directly control every internal detail" is **False**.)',
    src: 'Tanvir sir L2 p4; glossary; Class Test 1 (g)',
  },
  {
    id: 'c-pr-postmodern',
    topic: T,
    front: 'Which model favours **distributed control, interdisciplinary work and consensus-reaching**?',
    back: 'The **Postmodern** model (systems engineering). **Centralized control, specialization and hierarchical decision making** belong to the **Modern / Taylorist** model (Class Test 1 d: False).',
    src: 'Tanvir sir L2 p4; Class Test 1 (d)',
  },
  {
    id: 'c-pr-quality',
    topic: T,
    front: 'Where does **quality** sit in the scope–schedule–budget relationship?',
    back: 'The client includes quality thoughts in the scope details; **quality should connect the scope, schedule and budget**. If the final project does not meet or exceed the owner’s quality expectation, it will likely be **rejected**. Quality is **not an independent fourth constraint**: changing it affects the three sides (Class Test 1 e: False).',
    seen: TRI_SEEN,
    src: 'Tanvir sir L2 p9; Class Test 1 (e)',
  },
  {
    id: 'c-pr-lifecycle',
    topic: T,
    front: 'Where does the **project life cycle** come from, and what shape does activity follow?',
    back: 'Projects develop a system; the **natural life cycle of systems** gives rise to the project life cycle. Activity **builds up, peaks and then declines** until termination (bell-shaped period-by-period curve, S-shaped cumulative curve).',
    seen: ['2011-12'],
    src: 'Tanvir sir L2 p10–11',
  },
  {
    id: 'c-pr-time',
    topic: T,
    front: 'Measure of project activity: **Time** means…',
    back: 'The **temporal progress of activities** and the **extent to which schedules and deadlines are being met**.',
    seen: ['2022-23', '2015-16', '2013-14'],
    src: 'Tanvir sir L2 p13',
  },
  {
    id: 'c-pr-cost',
    topic: T,
    front: 'Measure of project activity: **Cost** means…',
    back: 'The **rate of resource expenditure as compared to budgeted resources**.',
    seen: ['2022-23', '2015-16', '2013-14'],
    src: 'Tanvir sir L2 p13',
  },
  {
    id: 'c-pr-performance',
    topic: T,
    front: 'Measure of project activity: **Performance** means…',
    back: '**Outputs of the project compared to objectives, specifications and requirements**; the ability to meet performance requirements is one measure of the **quality** of the project output.',
    seen: ['2022-23', '2015-16', '2013-14'],
    src: 'Tanvir sir L2 p13',
  },
  {
    id: 'c-pr-engagement',
    topic: T,
    front: 'Define **professional engagement** and its major issue.',
    back: '"To **secure professional services, to hire**." Major issue: the **difficulty in defining & communicating the specific needs and/or tasks** required to arrive at a solution — engineers call it the need to create a **scope or statement of work (SOW)**.',
    src: 'Tanvir sir L3 p2',
  },
  {
    id: 'c-pr-son',
    topic: T,
    front: 'What is the **Statement of Need**, and what does it state?',
    back: 'The result of pre-design evaluation: it identifies the need for a new or remodeled facility from business objectives or public policy and lets the client gain **internal approval**. It **states the problem, not the solution** — all options considered, feasibility studies, alternatives tested.',
    seen: ['2012-13', '2011-12'],
    src: 'Tanvir sir L3 p17',
  },
  {
    id: 'c-pr-brief-rfp',
    topic: T,
    front: 'What role does the **Brief** play later, and who helps write it?',
    back: 'The Statement of Need or Brief **captures the essence of the project**; during the proposal phase it forms a **key component of the RFP**. It is usually written **with the help of a designer**, following Elicit → Analyze → Document → Verify.',
    src: 'Tanvir sir L3 p18–19',
  },
  {
    id: 'c-pr-discovery',
    topic: T,
    front: 'What kind of phase is **pre-design** for the client?',
    back: 'A **"discovery" phase** where needs and wishes are explored. A large client’s staff prepare a general plan of action; a client without in-house capacity **hires a consultant** (who may hire more consultants).',
    seen: ['2012-13'],
    src: 'Tanvir sir L3 p14',
  },
  {
    id: 'c-pr-sd',
    topic: T,
    front: '**Schematic design** (20%) involves…',
    back: 'Establishing the **general project scope, relationship among project components, basic geometry, and client understanding & acceptance**; the designer also **validates the program or brief**.',
    src: 'Tanvir sir L3 p22',
  },
  {
    id: 'c-pr-dd',
    topic: T,
    front: '**Design development** (30%) involves…',
    back: 'The design concept is **elaborated**; **major systems are defined**; important decisions are **documented**; a **clear, coordinated description** of the project is developed (workshops: value engineering, lifecycle analysis, sustainability review).',
    src: 'Tanvir sir L3 p23–24',
  },
  {
    id: 'c-pr-cd',
    topic: T,
    front: '**Construction documents** (50%) do what?',
    back: 'Give the contractor **sufficient information to build**; delineate the responsibilities of the **two parties who sign the construction contract**; describe the designer’s role; comprise **drawings and a project manual** (bidding requirements + technical specifications).',
    seen: ['2017-18'],
    src: 'Tanvir sir L3 p23',
  },
  {
    id: 'c-pr-contract-tool',
    topic: T,
    front: 'Besides being a legal document, what is the client–designer contract?',
    back: 'A **communication tool** — it spells out design tasks, each party’s responsibilities, client approvals, schedule and budget.',
    src: 'Tanvir sir L3 p21',
  },
  {
    id: 'c-pr-qcp',
    topic: T,
    front: 'What is a **QCP** and when is it implemented?',
    back: 'A **quality control plan** implemented **throughout the design process and particularly in the construction document phase**; it reduces risk, improves quality and enables a final review — leading to client satisfaction and **repeat business**.',
    seen: ['2017-18', '2012-13'],
    src: 'Tanvir sir L3 p30–31',
  },
  {
    id: 'c-pr-aec',
    topic: T,
    front: 'On what principle has the **AEC industry** always operated?',
    back: 'The **"virtual" organization principle** — it is infamous for its **fragmentation**: a staggering number of players come together for one-of-a-kind projects.',
    seen: ['2022-23'],
    src: 'Tanvir sir L3 p9',
  },
  {
    id: 'c-pr-perspectives',
    topic: T,
    front: 'How do the **owner’s** and the **designers’** perspectives differ?',
    back: 'The **owner** thinks in terms of **quality and short- and long-term costs**; architects and engineers are motivated to **avoid mishaps and minimize their costs relative to billable hours**.',
    seen: ['2022-23'],
    src: 'Tanvir sir L3 p10',
  },
  {
    id: 'c-pr-design-thinking',
    topic: T,
    front: '"If design begins with ___, it proceeds with ___." Who proposed "design thinking"?',
    back: 'Begins with **analysis**, proceeds with **synthesis**. **Tim Brown, CEO of IDEO**: Inspiration → Ideation → Implementation.',
    src: 'Tanvir sir L3 p25–26',
  },
  {
    id: 'c-pr-prebid',
    topic: T,
    front: 'Why do civil engineers attend **prebid meetings**, and what is an **RFI**?',
    back: 'To **acquaint prospective bidders with the project**. After award, field questions are called **requests for information (RFIs)**; the CE responds to them, observes the field and reviews submittals/shop drawings.',
    src: 'Tanvir sir L3 p29',
  },
  {
    id: 'c-pr-trust',
    topic: T,
    front: 'Why do large clients keep their own engineering staff?',
    back: 'Professional services are **best provided when the client knows and trusts the engineer**; staff engineers know the employer’s mission and can act in its best interest — and can prepare a **SOW for outside engineering support**.',
    src: 'Tanvir sir L3 p6',
  },
]

const answers: PcAnswer[] = [
  {
    id: 'a-pr-define',
    topic: T,
    q: 'Define project (in detail).',
    seen: DEF_SEEN,
    a: `"A project is an **endeavor that is undertaken to produce results expected from the requesting party**."

To be more specific, a project is an endeavor that will:

1. **Accomplish a specific client need or goal**;
2. **Include related activities guided by a leader or project manager**;
3. **Be composed of cross-departmental personnel or unique experts** capable of providing unique services to the project;
4. **Be performed for a fixed duration of time**.

Generally the requester or owner **does not have the expertise or the time (or both)** to take on the endeavor alone. The project has a fixed or estimated life; once complete, **operation and maintenance revert to the owners** (some owners have builders provide short-term start-up or long-term operation).

Some books use the PMI definition ("a temporary endeavour to create a unique product, service or result"); the class definition is the one above.`,
    keys: ['endeavor', 'results expected from the requesting party', 'specific client need or goal', 'leader or project manager', 'cross-departmental personnel', 'fixed duration of time', 'expertise or the time', 'revert to the owners'],
    lists: ['l-pr-def'],
    src: 'Tanvir sir L2 p5–6',
  },
  {
    id: 'a-pr-evolution',
    topic: T,
    q: 'Show the evolution of design toward collaboration and integration (Modern vs Postmodern).',
    seen: [],
    a: `Project management moved from the **Modern** (Taylorist) model to the **Postmodern** (systems engineering) model:

| Modern | Postmodern |
|---|---|
| **Taylorism** | **Systems Engineering** |
| Hierarchical/vertical | Flat/layered/horizontal |
| Specialization | Interdisciplinary |
| Rational order | Messy complexity |
| Centralized control | Distributed control |
| Experts | Meritocracy |
| Tightly coupled system | Networked system |
| Micro-management | **Blackboxing** |
| Hierarchical decision making | Consensus-reaching |
| Bureaucratic structure | Collegial community |
| Incremental | Discontinuous |
| Closed | Open |`,
    keys: ['Modern', 'Postmodern', 'Taylorism', 'Systems Engineering', 'Interdisciplinary', 'Distributed control', 'Meritocracy', 'Networked system', 'Blackboxing', 'Consensus-reaching', 'Collegial community'],
    lists: ['l-pr-evolution'],
    src: 'Tanvir sir L2 p4 (slide table); Class Test 1 (d), (g) tested it',
  },
  {
    id: 'a-pr-measures',
    topic: T,
    q: 'Briefly discuss the three measures of project activity.',
    seen: ['2022-23', '2015-16', '2013-14'],
    a: `Besides the level of activity, its nature and emphasis change over the life cycle (clients & planners early; designers, builders & implementers in the middle; users & operators later). Despite these changes, **three measures of project activity apply throughout a project’s full span**:

1. **Time** — the **temporal progress of activities** and the extent to which **schedules and deadlines are being met**.
2. **Cost** — the **rate of resource expenditure as compared to budgeted resources**.
3. **Performance** — the **outputs of the project as compared to objectives, specifications and requirements**; the ability to meet performance requirements is one measure of the **quality** of the project output.

The project organization attempts to achieve **time, cost and performance requirements** as it advances through the phases of the project life cycle.

The question bank and the 18-batch solve answer this with scope, schedule and budget — that is the triangle, not the three measures in the slides.`,
    keys: ['Time', 'Cost', 'Performance', 'temporal progress', 'schedules and deadlines', 'rate of resource expenditure', 'budgeted resources', 'objectives, specifications and requirements', 'quality', 'full span'],
    lists: ['l-pr-measures', 'l-pr-dominate'],
    src: 'Tanvir sir L2 p12–13',
  },
  {
    id: 'a-pr-triangle',
    topic: T,
    q: 'Describe the scope–schedule–budget triangular relationship of a project.',
    seen: TRI_SEEN,
    a: `- A project’s **scope of work** is a **definition of the tasks required to complete the project to meet the client’s need**.
- The complete scope of work requires a **schedule and budget**.
- Scope, schedule and budget can be thought of as a **connected triangle** where **each side represents an essential component** of the project managed by the **PM (project manager)**.
- The connected sides let the PM see that the three are **interrelated**: **one side cannot move or be adjusted without affecting either of the other two**.
- Together they form **a complete definition of the project** (centre of the triangle).

### Quality
Quality is another important issue at this stage: the client includes its idea of quality in the scope details, and **quality should connect the scope, schedule and budget**. If the final project does not meet or exceed the owner’s quality expectation, it will likely be **rejected**.

(The 18-batch solve adds: the three are the *triple constraint*; budget is a function of scope and schedule; with a constant budget only scope and schedule can vary, and a change of scope affects the schedule.)

*Sketch: a triangle — SCOPE on the left side, BUDGET on the right side, SCHEDULE on the base; "A complete definition of the project" inside.*`,
    keys: ['scope of work', 'schedule and budget', 'connected triangle', 'essential component', 'project manager', 'interrelated', 'cannot move', 'complete definition of the project', 'quality should connect', 'rejected'],
    src: 'Tanvir sir L2 p7–9',
    Fig: TriangleFig,
  },
  {
    id: 'a-pr-characteristics',
    topic: T,
    q: 'What are the characteristics of a project?',
    seen: CHAR_SEEN,
    a: `1. **Projects have a purpose** — clearly defined aims and results; they solve a "problem" after analysing needs and aim at lasting social change.
2. **Projects are realistic** — aims must be achievable, considering requirements and the financial and human resources available.
3. **Projects are limited in time and space** — a beginning and an end; implemented in a specific place and context.
4. **Projects are complex** — they call on various planning and implementation skills and involve various partners and players.
5. **Projects are collective** — the product of collective endeavours; teamwork; they cater for the needs of others.
6. **Projects are unique** — they stem from new ideas and give a specific response to a need in a specific context; they are innovative.
7. **Projects are an adventure** — every project is different and ground-breaking and always involves some uncertainty and risk.
8. **Projects can be assessed** — planned and broken down into measurable aims open to evaluation.
9. **Projects are made up of stages** — distinct, identifiable stages.`,
    keys: ['purpose', 'realistic', 'limited in time and space', 'complex', 'collective', 'unique', 'adventure', 'assessed', 'stages'],
    lists: ['l-pr-characteristics'],
    src: 'Tanvir sir L2 p16–18',
  },
  {
    id: 'a-pr-lifecycle',
    topic: T,
    q: 'Describe the project life cycle and show graphically the level of activity over it.',
    seen: ['2011-12'],
    a: `- Projects are undertaken to develop a system; the **natural life cycle of systems** gives rise to a similar life cycle in projects, the **project life cycle**.
- Each project has a **starting point** and progresses toward a **predetermined conclusion**, during which the state of the project organization changes.
- Projects show a **buildup in "activity" that peaks and then declines** until project termination; activity can be measured in various ways.

### Who dominates
1. **Early stages** — clients and planners.
2. **Middle stages** — designers, builders and implementers.
3. **Later stages** — users and operators.

### Graph
Project activity against time: the **period-by-period** curve is bell-shaped (slow rise, peak, decline); the **cumulative** curve is S-shaped and flattens at completion. For "stages of a construction project", also draw the flow of work: Predesign → Design → Bid → Construct → Occupy-Adapt → Decommission.`,
    keys: ['natural life cycle of systems', 'predetermined conclusion', 'peaks', 'declines', 'clients and planners', 'designers, builders and implementers', 'users and operators', 'period-by-period', 'cumulative'],
    lists: ['l-pr-dominate', 'l-pr-flow'],
    src: 'Tanvir sir L2 p10–12',
    Fig: LifeCycleFig,
  },
  {
    id: 'a-pr-lifecycle-manage',
    topic: T,
    q: '"Managing the project life cycle is complex" — explain.',
    seen: ['2011-12'],
    a: `1. **Requires special treatment** — most things in a project (resources, schedules, tasks) are **somewhat unfamiliar or in a constant state of change**.
2. **Little is repetitive or routine** in a project.
3. **Tailored to each phase** — work schedules, budgets and tasks must be tailored to fit each phase and stage of the life cycle.
4. **Uncertainty** — all life cycles contain an element of uncertainty; unforeseen obstacles, some virtually inevitable, cause **missed deadlines, cost overruns and poor project performance**.
5. **Management must anticipate problems and plan for them**, then **re-plan activities** and **shift resources** as unforeseen problems occur.
6. **Several projects at once** — organizations run many projects at different stages (some starting, some underway, some closing out).
7. **Continuously balance resources** among the projects so each gets what it needs, yet **the sum does not exceed the resources available**.`,
    keys: ['special treatment', 'constant state of change', 'repetitive or routine', 'tailored', 'uncertainty', 'missed deadlines', 'anticipate problems', 're-plan', 'shift resources', 'balance resources'],
    lists: ['l-pr-lc-obstacles', 'l-pr-lc-response'],
    src: 'Tanvir sir L2 p14–15',
  },
  {
    id: 'a-pr-aec',
    topic: T,
    q: 'Why is the AEC industry infamous for its fragmentation?',
    seen: ['2022-23'],
    a: `The AEC industry is infamous for its **fragmentation** because:

1. **"Virtual" organization principle** — the architectural, engineering and construction (AEC) industry has always operated this way: firms come together for a project and then disperse.
2. **Staggering number of players** — private owners, developers, government agencies, engineers & architects, other designers, builders, product & material suppliers, real estate agents, lending institutions, inspectors, etc.
3. **Design-intensive, one-of-a-kind projects** — AEC professionals must produce unique products to **stringent cost, schedule and quality standards**.
4. **Different perspectives** — the **owner** thinks of quality and short- and long-term costs; **architects and engineers** are motivated to avoid mishaps and minimize their costs relative to **billable hours**.
5. **Determinant and non-determinant processes** — civil engineers face a vast array of participants and must evaluate outcomes and **manage risk**.
6. **Specialized contracts** — projects epitomize a fragmented, hierarchical network organization with highly specialized, price-based contracts that often cause **adversarial relations**.`,
    keys: ['virtual', 'fragmentation', 'staggering number of players', 'one-of-a-kind', 'stringent cost, schedule and quality','billable hours', 'manage risk', 'adversarial relations'],
    lists: ['l-pr-aec-players'],
    src: 'Tanvir sir L3 p9–10; L4 p2',
  },
  {
    id: 'a-pr-participants',
    topic: T,
    q: 'Who are the participants in project development? Show them in a diagram.',
    seen: PART_SEEN,
    a: `A need for civil engineers to be problem solvers, innovators, analysts, critical thinkers and communicators has remained constant for millennia, and so has the involvement of **three key players** in project development and delivery:

### Three main groups
1. **Client (owner)** — the **prime mover** and sometimes the user.
2. **Engineer and/or architect (designer)** — the **developer of the design**.
3. **Contractor (builder)** — the **organizer and builder**.

### Fourth group
These three coexist and interact with a **fourth group** of legislative bodies and interested groups:
1. **Legislative and statutory bodies**
2. **Regulatory and permitting agencies**
3. **Licensing organizations and professional societies**
4. **The public and special interest groups**

*Diagram: two columns — three stacked boxes under "Three main groups", one tall box under "Fourth group".* Some books add financiers, insurers and lawyers to the fourth group; the slide does not.`,
    keys: ['three key players', 'Client', 'prime mover', 'developer of the design', 'organizer and builder', 'fourth group', 'Legislative and statutory bodies', 'Regulatory and permitting agencies', 'Licensing organizations', 'special interest groups'],
    lists: ['l-pr-participants', 'l-pr-fourth-group'],
    src: 'Tanvir sir L3 p11–12',
    Fig: ParticipantsFig,
  },
  {
    id: 'a-pr-flow',
    topic: T,
    q: 'Draw (graphically show) the flow of work in project development.',
    seen: FLOW_SEEN,
    a: `The typical project moves through several phases: **pre-design, design, bid, construction, occupancy, and eventually adaptive re-use, and decommissioning and/or demolition**.

### The chart
1. **Predesign** — output: **Statement of Need** (justification, order-of-magnitude cost estimate, budget) → **Program/Brief** (project definition package, project alignment and partnering agreement, schedule, budget).
2. **Design** — expanded into **Schematic design (SD) 20%** → **Design development (DD) 30%** → **Construction documents (CD) 50%**; SD starts with **validation of program/brief**.
3. **Bid**
4. **Construct**
5. **Occupy-Adapt** — **post-completion review** and **restatement of need**.
6. **Decommission**

Draw the six boxes joined by arrows, with the call-outs, and the design box exploded into the three sub-phase bars (width roughly 20 : 30 : 50).`,
    keys: ['Predesign', 'Statement of Need', 'Program/Brief', 'Schematic design (SD) 20%', 'Design development (DD) 30%', 'Construction documents (CD) 50%', 'Bid', 'Construct', 'Occupy-Adapt', 'post-completion review', 'restatement of need', 'Decommission'],
    lists: ['l-pr-flow', 'l-pr-design-sub'],
    src: 'Tanvir sir L3 p13',
    Fig: FlowFig,
  },
  {
    id: 'a-pr-cd-emphasis',
    topic: T,
    q: 'Why does the construction document phase get higher emphasis during the design phase?',
    seen: ['2017-18'],
    a: `### Share of design effort
In the flow of work the design effort splits **Schematic design 20% → Design development 30% → Construction documents 50%**. CD alone takes **half of the design effort**, because construction documents:

1. **Provide the contractor with sufficient information to build the project.**
2. **Delineate the responsibilities of the two parties who sign the construction contract** (owner and contractor).
3. **Provide information about the role of the designer**, who usually is not a party to this contract but who has responsibilities during the bidding & construction phase.
4. **Comprise drawings & a project manual**, made up of bidding requirements and technical specifications.

### Also done in this phase (L3 p24 table, p30)
5. Supplying appropriate detail in plans and specs, and conducting a **constructability review**.
6. Deliverables: complete plans, a complete project manual (procurement requirements, conditions of the contract, **technical specifications**) and the **opinion of probable construction cost**.
7. A **quality control plan (QCP)** is implemented throughout design and **particularly in the construction document phase**.`,
    keys: ['50%', 'half of the design effort', 'sufficient information to build', 'two parties who sign', 'role of the designer', 'not a party', 'project manual', 'technical specifications', 'constructability review', 'opinion of probable construction cost', 'particularly in the construction document phase'],
    lists: ['l-pr-design-sub'],
    src: 'Tanvir sir L3 p23 (the four points the 18-batch solve writes), p24 table, p30',
  },
  {
    id: 'a-pr-predesign',
    topic: T,
    q: 'What is pre-design? What data should be included, and what are its key activities?',
    seen: ['2012-13'],
    a: `### What is pre-design
In predesign or planning, clients enter a **"discovery" phase** where needs and wishes are explored. A large client’s staff prepare a general plan of action; a client without in-house capacity **hires a consultant**. The responsible entity **forms a working organization and identifies the information needed**. The result is a **Statement of Need**, which **states the problem, not the solution**.

### Data to include
1. **History** of the events leading up to the decision to build
2. **Purpose & function** of the project
3. **Policy decision**
4. **Timescale** for the project
5. **Cost limit, or budget**
6. **Details of the site and services**
7. **Basic details of building requirements**
8. **Comparable best practices**

### Key activities
1. **Confirming that options have been identified**
2. **Agreeing upon which option(s) to pursue**
3. **Identifying potential problems** with items in the budget and agreeing on a total budget
4. **Establishing a timeline**
5. **Carrying out a risk assessment**
6. **Defining clear objectives**
7. **Preparing a Program or Statement of Need or Brief**`,
    keys: ['discovery', 'Statement of Need', 'states the problem, not the solution', 'History', 'Purpose & function', 'Policy decision', 'Timescale', 'budget', 'Comparable best practices', 'options', 'timeline', 'risk assessment', 'clear objectives', 'Brief'],
    lists: ['l-pr-predesign-data', 'l-pr-predesign-activities'],
    src: 'Tanvir sir L3 p14–18',
  },
  {
    id: 'a-pr-predesign-pad',
    topic: T,
    q: 'Describe the purposes, activities and deliverables of the pre-design phase.',
    seen: ['2011-12'],
    a: `### Purposes
1. **Establish project scope, budget, and schedule**
2. **Obtain necessary permits**
3. **Select prime designer**

### Activities — assist the client in:
1. **Analyzing project requirements**
2. **Gaining funding approval**
3. **Performing environmental impact report(s)**
4. **Obtaining geotechnical reports**
5. **Preparing the request for proposal (RFP)**

(Also the key activities: confirm options, agree on option, budget, timeline, risk assessment, clear objectives, prepare the brief.)

### Deliverables
1. **Design criteria, program, or brief**
2. **Order of magnitude cost estimate**
3. **Schedule**
4. **RFP and scope of work (SOW)**`,
    keys: ['scope, budget, and schedule', 'necessary permits', 'prime designer', 'project requirements', 'funding approval', 'environmental impact', 'geotechnical reports', 'request for proposal', 'program, or brief', 'Order of magnitude cost estimate', 'scope of work (SOW)'],
    lists: ['l-pr-predesign-purpose', 'l-pr-predesign-deliv', 'l-pr-predesign-activities'],
    src: 'Tanvir sir L3 p24 (summary table)',
  },
  {
    id: 'a-pr-client-concerns',
    topic: T,
    q: 'What are the common client concerns during the pre-design phase?',
    seen: CONCERN_SEEN,
    a: `Key briefing issues — getting requirements right early results in improved product quality, saving of time & budget and better client relation. The **common client concerns** are:

1. **Early indication of cost**
2. **Early indication of schedule**
3. **Functional constraints — spaces and services**
4. **Environmental issues — planning and site**

(For more marks, add one line each: the client wants an order-of-magnitude cost and a timescale early to win internal approval; the facility must fit its functions in the space and services available; the site and planning regulations must allow it.) Some books list broader concerns (financing, permits, stakeholders); the slide has these four.`,
    keys: ['Early indication of cost', 'Early indication of schedule', 'Functional constraints', 'spaces and services', 'Environmental issues', 'planning and site'],
    lists: ['l-pr-client-concerns'],
    src: 'Tanvir sir L3 p20',
  },
  {
    id: 'a-pr-success',
    topic: T,
    q: 'What are the conditions necessary for success in pre-design (briefing)?',
    seen: ['2021-22'],
    a: `1. **Client and design team clear points of contact**
2. **Decision-making authority of client rep.**
3. **Effective client/design team organization**
4. **Communication media clearly understood by all**`,
    keys: ['clear points of contact', 'Decision-making authority', 'client/design team organization', 'Communication media'],
    lists: ['l-pr-success'],
    src: 'Tanvir sir L3 p20',
  },
  {
    id: 'a-pr-brief',
    topic: T,
    q: 'What are the attributes of an effective brief?',
    seen: BRIEF_SEEN,
    a: `The Brief (Statement of Need) captures the essence of the project and becomes a key component of the RFP. An effective brief has:

1. **Limited number of key objectives expressed**
2. **Layered and iterative**, reflecting design stages
3. **Fluid until the last possible moment**
4. **Fixed and frozen once complete**
5. **Requirements backed up with hard data**
6. **Performance measured**
7. **Innovation balanced with established use**
8. **Users and building demands balanced**
9. **Related to chosen procurement process**
10. **Concise and clear**

The question bank gives a different, generic list (purpose, budget, site data…) — not in the slides.`,
    keys: ['Limited number of key objectives', 'Layered and iterative', 'Fluid until the last possible moment', 'Fixed and frozen', 'hard data', 'Performance measured', 'Innovation balanced', 'Users and building demands', 'procurement process', 'Concise and clear'],
    lists: ['l-pr-brief'],
    src: 'Tanvir sir L3 p20',
  },
  {
    id: 'a-pr-qcp',
    topic: T,
    q: 'Briefly discuss the quality control plan (QCP).',
    seen: ['2017-18', '2012-13'],
    a: `Throughout the design process and **particularly in the construction document phase**, a **quality control plan (QCP)** should be implemented; QCPs are an important aspect of any successful project.

### Important elements
1. A **knowledgeable project manager** adept at implementing a QCP
2. An **experienced QC team** capable of reviewing contract documents
3. An **extensive & successful QCP outline**

### Implementation includes
1. A **clear & concise organizational chart** outlining roles & responsibilities of the QC team
2. **Proper scheduling of review**
3. **Ample time for each review**
4. **Good project management practice** to ensure the reviews are completed

### Benefits
A comprehensive QCP **reduces the risk** of incomplete or poorly completed work products, **improves the overall quality** of the work, and **enables a final review** for missing items or incorrect standards. These lead to a better end product and **client satisfaction**, so the client solicits the designer again — **repeat business** is paramount for a profitable organization.

(The question bank describes a contractor’s site quality plan; in this course the QCP is the designer’s review plan.)`,
    keys: ['construction document phase', 'knowledgeable project manager', 'experienced QC team', 'QCP outline', 'organizational chart', 'scheduling of review', 'ample time', 'reduces the risk', 'improves the overall quality', 'final review', 'client satisfaction', 'repeat business'],
    lists: ['l-pr-qcp-elements', 'l-pr-qcp-impl', 'l-pr-qcp-benefits'],
    src: 'Tanvir sir L3 p30–31',
  },
  {
    id: 'a-pr-design-phases',
    topic: T,
    q: 'Describe the phases of the design effort.',
    seen: [],
    a: `After the client has a program/brief and has selected a designer, they sign a contract for professional services — a legal document and a **communication tool**. The design effort is divided into:

1. **Schematic design** — general project scope, relationship among components, basic geometry, client understanding & acceptance; the designer **validates the program or brief**.
2. **Design development** — the concept is elaborated, **major systems are defined**, important decisions documented, a clear coordinated description developed.
3. **Construction document** — gives the contractor **sufficient information to build**; drawings and a project manual.
4. **Bidding** — assist the client in selecting a contractor: prebid conference, answering bidders’ questions, evaluating bids, addenda.
5. **Construction** — field observations, responses to RFIs, review of submittals and shop drawings.`,
    keys: ['communication tool', 'Schematic design', 'validates the program', 'Design development', 'major systems are defined', 'Construction document', 'sufficient information to build', 'Bidding', 'Construction'],
    lists: ['l-pr-design-phases', 'l-pr-design-contract'],
    src: 'Tanvir sir L3 p21–24',
  },
  {
    id: 'a-pr-phase-table',
    topic: T,
    q: 'Describe the purpose, activities and deliverables of the various phases of project development.',
    seen: [],
    a: `| Phase | Purpose | Activities | Deliverables |
|---|---|---|---|
| **Predesign** | establish project scope, budget and schedule; obtain necessary permits; select prime designer | assist client in analyzing project requirements, gaining funding approval, performing environmental impact report(s), obtaining geotechnical reports, preparing the RFP | design criteria, program or brief; order of magnitude cost estimate; schedule; RFP and SOW |
| **Schematic Design (20%)** | establish basic geometry and relationships among project components | verifying information in RFP; organizing information and synthesizing possibilities; involving other designers and subconsultants; securing client understanding and acceptance | schematic plans; outline specifications; schematic cost estimate |
| **Design Development (30%)** | develop a clear, coordinated description of the project, including major systems | defining major systems; workshops (value engineering, lifecycle analysis, sustainability review); documenting important decisions; freezing client's design changes | DD plans; DD specifications; DD cost estimate |
| **Construction Documents (50%)** | provide contractor with sufficient information to build the project | delineating responsibilities of client (owner) and contractor; supplying appropriate detail in plans and specs; conducting constructability review | complete plans; complete project manual (procurement requirements, conditions of the contract, technical specifications); opinion of probable construction cost |
| **Bid** | assist client in selecting contractor | conducting prebid conference; answering bidders' questions; assisting client in evaluating bids | addendum/a |
| **Construction** | assist client in assuring contractor builds per contract documents | field observations; resolving problems and discrepancies as they arise | responses to RFIs; reviews of submittals and shop drawings |
| **Postconstruction** | improve design/construct process and position firm to acquire new work | conducting post-occupancy review | post-occupancy review report |`,
    keys: ['Predesign', 'Schematic Design (20%)', 'Design Development (30%)', 'Construction Documents (50%)', 'Bid', 'Postconstruction', 'sufficient information to build', 'constructability review', 'opinion of probable construction cost', 'post-occupancy review'],
    lists: ['l-pr-predesign-purpose', 'l-pr-predesign-deliv', 'l-pr-design-sub'],
    src: 'Tanvir sir L3 p24 (summary table, rendered); question from Rahat’s note ("2008-09", label unverified)',
  },
  {
    id: 'a-pr-engagement',
    topic: T,
    q: 'What is professional engagement? Give the business development process (flow chart).',
    seen: [],
    a: `**Professional engagement** is "to secure professional services, to hire". The major issue is the **difficulty in defining & communicating the specific needs** — hence the **scope or statement of work (SOW)**, which needs a cost estimate, project schedule and tabulated labor categories.

To win work, firms follow a **business development process** (David Evans & Associates):

1. **Identify/screen project leads** (services, prime or sub, client/location, potential fee)
2. **Tracking phase** (RFP schedule, agency PM, funding)
3. **Positioning phase** (project understanding, strategy, teaming, go/no-go decision)
4. **Agency request for proposals (RFP)**
5. **Proposal phase** (firm qualifications, PM and key staff, technical approach, scope and schedule, sealed cost proposal)
6. **Agency reviews proposals** (selection committee, QBS, ranking and short list)
7. **Interview phase**
8. **Agency selects consultant** (final ranking, notify top-ranked firm, open cost proposal)
9. **Negotiation phase** (final scope, billing rates, negotiate price, execute contract)
10. **Start project**`,
    keys: ['secure professional services', 'statement of work', 'business development process', 'Tracking phase', 'Positioning phase', 'request for proposals', 'Proposal phase', 'Interview phase', 'selects consultant', 'Negotiation phase', 'Start project'],
    lists: ['l-pr-bizdev', 'l-pr-sow'],
    src: 'Tanvir sir L3 p2–5 (DEA business development chart p5); Nafee bhai note asks "Give the basic development flowchart of professional engagement"',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
