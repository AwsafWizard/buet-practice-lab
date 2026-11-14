// pc-risk — Risk management, insurance, bonds, fiduciary risk (Tanvir sir L5).
// Two decks this term: "Lecture 05.pdf" (42 pp, identical to the old batch's — cited as "L5 pN") and the rewritten
// "Lecture 05 Risk Management, Insuruance, Bond.pdf" (58 pp — cited as "new deck pN"). Where they differ the new deck
// wins and the old wording stays in alt / note, because the past papers were set on it.
// Digests: CE301/Claude digests/v2_oia.md (§4 A–B, §5) and lec_project_legal.md (pr-risk).
import type { FC } from 'react'
import type { PcAnswer, PcCard, PcList, PcTopicContent } from '../types'

const T = 'pc-risk' as const

// ---------- figures (theme tokens only) ----------
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const panel2 = 'var(--c-panel2)'
const oia = 'var(--c-oia)'

const Node = ({ x, y, w, t, strong }: { x: number; y: number; w: number; t: string; strong?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={30} rx={5} fill={panel2} stroke={strong ? oia : mute} strokeWidth={strong ? 2.2 : 1.4} />
    <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize={12} fontWeight={strong ? 700 : 400} fill={ink}>
      {t}
    </text>
  </g>
)

const ArrowDefs = () => (
  <defs>
    <marker id="pc-rk-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={mute} />
    </marker>
  </defs>
)
const Arrow = ({ d, dash }: { d: string; dash?: boolean }) => (
  <path d={d} fill="none" stroke={mute} strokeWidth={1.5} strokeDasharray={dash ? '5 4' : undefined} markerEnd="url(#pc-rk-arr)" />
)

const RiskTreeFig: FC = () => {
  const leaves: [string, number][] = [
    ['Identification', 20],
    ['Analysis', 62],
    ['Prioritisation', 104],
    ['Allocation (hold, avoid, reduce, transfer, share)', 166],
    ['Monitoring & reporting', 208],
  ]
  const p = (pts: number[]) => <polyline points={pts.join(' ')} fill="none" stroke={mute} strokeWidth={1.6} />
  return (
    <svg viewBox="0 0 620 260" width="100%" role="img" aria-label="Elements of risk management">
      <Node x={10} y={114} w={130} t="Risk management" strong />
      {p([140, 129, 160, 129])}
      {p([160, 77, 160, 197])}
      {p([160, 77, 180, 77])}
      {p([160, 197, 180, 197])}
      <Node x={180} y={62} w={110} t="Assessment" strong />
      <Node x={180} y={182} w={110} t="Action" strong />
      {p([290, 77, 310, 77])}
      {p([310, 35, 310, 119])}
      {p([290, 197, 310, 197])}
      {p([310, 181, 310, 223])}
      {leaves.map(([t, y]) => (
        <g key={t}>
          {p([310, y + 15, 326, y + 15])}
          <Node x={326} y={y} w={t.length > 20 ? 286 : 160} t={t} />
        </g>
      ))}
      <text x={10} y={252} fontSize={11} fill={mute}>
        Identification is the most critical element — risk cannot be managed if it is not identified.
      </text>
    </svg>
  )
}

/** the hierarchical network of firms (new deck p3–6: the deck gives it in words, not as a drawing) */
const NetworkFig: FC = () => {
  const subs: [string, number][] = [
    ['Specialist subcontractor', 70],
    ['Specialist subcontractor', 245],
    ['Specialist subcontractor', 420],
  ]
  return (
    <svg viewBox="0 0 640 318" width="100%" role="img" aria-label="Hierarchical network of firms in a construction project">
      <ArrowDefs />
      <text x={26} y={165} transform="rotate(-90 26 165)" textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        HIERARCHY: command, authority, liability flow top-down
      </text>
      <Arrow d="M42,18 V288" />
      <Node x={220} y={12} w={200} t="Client (Employer)" strong />
      <Arrow d="M320,42 V86" />
      <text x={330} y={68} fontSize={11} fill={mute}>
        master contract: performance and cost risk
      </text>
      <rect x={56} y={78} width={572} height={206} rx={10} fill="none" stroke={oia} strokeWidth={1.4} strokeDasharray="6 5" />
      <Node x={220} y={88} w={200} t="Main contractor" strong />
      <polyline points="320,118 320,142" fill="none" stroke={mute} strokeWidth={1.5} />
      <polyline points="145,142 495,142" fill="none" stroke={mute} strokeWidth={1.5} />
      <text x={330} y={134} fontSize={11} fill={mute}>
        back-to-back subcontracts: execution risks
      </text>
      {subs.map(([t, x], i) => (
        <g key={i}>
          <Arrow d={`M${x + 75},142 V166`} />
          <Node x={x} y={168} w={150} t={t} />
          <Arrow d={`M${x + 75},198 V236`} />
        </g>
      ))}
      <Node x={70} y={238} w={500} t="Sub-subcontractors / suppliers" />
      <text x={342} y={304} textAnchor="middle" fontSize={11} fontWeight={700} fill={ink}>
        NETWORK: temporary alliance of legally independent firms delivering a single project
      </text>
    </svg>
  )
}

/** the three parties of a surety bond (new deck p46–48: built from the slide text, the deck has no drawing) */
const BondFig: FC = () => {
  const Party = ({ x, y, name, role }: { x: number; y: number; name: string; role: string }) => (
    <g>
      <rect x={x} y={y} width={190} height={46} rx={6} fill={panel2} stroke={oia} strokeWidth={2} />
      <text x={x + 95} y={y + 19} textAnchor="middle" fontSize={13} fontWeight={700} fill={ink}>
        {name}
      </text>
      <text x={x + 95} y={y + 36} textAnchor="middle" fontSize={11} fill={mute}>
        {role}
      </text>
    </g>
  )
  const note = (x: number, y: number, anchor: 'start' | 'end' | 'middle', lines: string[]) =>
    lines.map((l, i) => (
      <text key={l} x={x} y={y + i * 15} textAnchor={anchor} fontSize={12} fill={i === 0 ? ink : mute} fontWeight={i === 0 ? 700 : 400}>
        {l}
      </text>
    ))
  return (
    <svg viewBox="0 0 660 250" width="100%" role="img" aria-label="Three parties of a surety bond">
      <ArrowDefs />
      <Party x={235} y={10} name="SURETY" role="bonding company (obligator)" />
      <Party x={20} y={176} name="PRINCIPAL" role="contractor" />
      <Party x={450} y={176} name="OBLIGEE" role="project owner" />
      <Arrow d="M400,58 L522,174" />
      {note(504, 90, 'start', ['Bond', 'financial guarantee of', 'performance or payment,', 'up to the penal sum'])}
      <Arrow d="M138,174 L260,58" />
      {note(154, 90, 'end', ['GIA', 'the contractor must repay', 'whatever the surety pays', '(contingent credit)'])}
      <Arrow d="M212,199 H448" />
      {note(330, 190, 'middle', ['Construction contract'])}
      <text x={330} y={216} textAnchor="middle" fontSize={12} fill={mute}>
        obligated to perform the work
      </text>
    </svg>
  )
}

// ---------- seen labels ----------
const CR_SEEN = ['2023-24', '2022-23', '2021-22', '2016-17', '2015-16', '2013-14', '2011-12']
const CONC_SEEN = ['2023-24', '2022-23', '2020-21', '2016-17', '2015-16', '2014-15', '2013-14']
const PLAYER_SEEN = ['2014-15', '2013-14', '2012-13', '2011-12']
const GLI_SEEN = ['2022-23', '2017-18', '2016-17', '2012-13', '2011-12']
const BOND_SEEN = ['2022-23', '2016-17', '2015-16', '2014-15', '2013-14', '2012-13', '2011-12']
const SURETY_SEEN = ['2023-24', '2021-22', '2020-21', '2017-18']
const FID_SEEN = ['2023-24', '2022-23', '2020-21', 'Jan 2021', '2017-18', '2016-17', '2015-16', '2013-14', '2012-13', '2011-12']

const lists: PcList[] = [
  // ---------- new deck p3–7: the network model ----------
  {
    id: 'l-rk-network-why',
    topic: T,
    title: 'Why construction uses the hierarchical network model',
    ask: 'Why does construction manage risk in hierarchical networks of firms? (4 reasons)',
    points: [
      {
        k: 'High specialization & technical complexity',
        alt: ['specialisation', 'technical complexity', 'specialized trades'],
        d: 'geotechnical ground improvement, structural steel erection/RCC casting, HVAC engineering, MEP integration — economically inefficient for a single firm to permanently employ all these trades and keep expensive specialized equipment year-round',
      },
      {
        k: 'Strategic flexibility & capacity',
        alt: ['flexibility', 'asset-light', 'capacity'],
        d: 'demand fluctuates wildly by region and economic cycle: main contractors stay "asset-light"; specialist subcontractors move between project sites and main contractors',
      },
      {
        k: 'Risk offloading & distribution',
        alt: ['contractual risk allocation', 'offloading risk', 'back-to-back'],
        d: 'client → main contractor via a master contract (performance and cost risk); main contractor → specialist sub-tier firms via "back-to-back" subcontractor agreements (specific execution risks)',
      },
      {
        k: 'Capital efficiency',
        alt: ['reduces capital requirements'],
        d: 'one firm does not finance machinery, materials and specialized labor force; financial exposure and working capital are distributed across dozens of independent firms',
      },
    ],
    hook: '"Specialists Flex, Risk Cascades": S-F-R-C.',
    seen: [],
    src: 'Tanvir sir L5 new deck p4–6',
  },
  {
    id: 'l-rk-network-challenges',
    topic: T,
    title: 'Key challenges of the network model',
    ask: 'Managing a multi-tiered firm network introduces which operational and contractual risks?',
    points: [
      {
        k: 'Interface & coordination risk',
        alt: ['interface risk', 'coordination risk'],
        d: 'gaps between sub-contracts (where Scope A ends and Scope B begins) frequently cause delays or extra costs',
      },
      {
        k: 'Contractual disconnects',
        d: 'information or claims must pass through multiple contractual layers — slows decision-making and increases litigation risks',
      },
      {
        k: 'Supply chain vulnerability',
        d: 'insolvency or delay at a sub-subcontractor level cascades upward, disrupting the critical path of the entire project',
      },
    ],
    hook: 'Look down the tiers: the gaps between scopes, the layers between contracts, the weakest link at the bottom.',
    seen: [],
    src: 'Tanvir sir L5 new deck p7',
  },
  // ---------- new deck p8–10: categories of contract risk ----------
  {
    id: 'l-rk-risk-categories',
    topic: T,
    title: 'Primary categories of contract risks',
    ask: 'Name the six primary categories of contract risks.',
    points: [
      {
        k: 'Site & geotechnical risk',
        alt: ['site risk', 'geotechnical risk'],
        d: 'unforeseen (differing site) conditions; site access & possession delays by the employer; major policy changes',
      },
      {
        k: 'Scope & design risk',
        alt: ['scope risk', 'design risk'],
        d: 'incomplete or ambiguous design or documentation; scope creep & design changes',
      },
      {
        k: 'Time & schedule risk',
        alt: ['time risk', 'schedule risk'],
        d: 'excusable vs. non-excusable delays (EoT); force majeure & exceptional events',
      },
      {
        k: 'Financial & commercial risk',
        alt: ['financial risk', 'commercial risk'],
        d: 'price volatility & inflation; cash flow & payment delays',
      },
      {
        k: 'Legal, regulatory & environmental risk',
        alt: ['legal risk', 'regulatory risk', 'environmental risk'],
        d: 'permitting & environmental compliance; change in legislation',
      },
      {
        k: 'Performance & quality risk',
        alt: ['performance risk', 'quality risk'],
        d: 'defective workmanship / materials; subcontractor / supplier default',
      },
    ],
    hook: 'Walk a job from the ground up: the ground, the drawings, the programme, the money, the law, the finished quality — S-S-T-F-L-P.',
    seen: [],
    src: 'Tanvir sir L5 new deck p8–10',
  },
  // ---------- new deck p11–19: key principles ----------
  {
    id: 'l-rk-key-principles',
    topic: T,
    title: 'Key principles of contract risk management',
    ask: 'Name the seven key principles of contract risk management — in the slide’s order.',
    points: [
      {
        k: 'Equitable risk allocation',
        alt: ['Abrahamson principle', 'risk allocation'],
        d: 'Abrahamson principle: risk should be assigned to the party best equipped to manage, control, or bear it',
      },
      {
        k: 'Risk mitigation',
        alt: ['early and thorough risk identification', 'pro-active engineering and management'],
        d: 'early & thorough risk identification, pro-active engineering and management — in the pre-bid and negotiation phases, not after execution',
      },
      {
        k: 'Risk transfer & financial shielding',
        alt: ['risk transfer', 'financial shielding'],
        d: 'leverage external protection and limit liability: caps, insurance, bonds & guarantees, pass-through clauses',
      },
      {
        k: 'Match contract type to project uncertainty',
        alt: ['match contract type', 'contract type to uncertainty'],
        d: 'payment and contract structure aligned with the level of design clarity and project risk profile',
      },
      {
        k: 'Clear change management protocols',
        alt: ['change management'],
        d: 'standardized process for Variation Orders and Extensions of Time; enforceable notice windows',
      },
      {
        k: 'Clear contractual risk clauses',
        alt: ['risk clauses'],
        d: 'variation & EoT mechanisms; price adjustment clauses; limitation of liability & liquidated damages',
      },
      {
        k: 'Tiered dispute resolution',
        alt: ['multi-tiered dispute mechanisms', 'dispute resolution'],
        d: 'negotiation → dispute board or mediation → arbitration or litigation as a last resort',
      },
    ],
    ordered: true,
    hook: '"**E**very **R**isk **R**eally **M**atters — **C**heck **C**lauses **T**wice": E-R-R-M-C-C-T.',
    seen: [],
    src: 'Tanvir sir L5 new deck p11–19 (p16 and p17 are the same slide)',
  },
  {
    id: 'l-rk-contractor-risk',
    topic: T,
    title: 'Equitable risk allocation — risks assigned to the contractor',
    ask: 'Under the Abrahamson principle, which four risks sit with the contractor?',
    points: [{ k: 'Execution' }, { k: 'Means and methods', alt: ['means & methods'] }, { k: 'Site safety' }, { k: 'Productivity' }],
    hook: 'The contractor owns how the work is done: E-M-S-P.',
    seen: [],
    src: 'Tanvir sir L5 new deck p11',
  },
  {
    id: 'l-rk-owner-risk',
    topic: T,
    title: 'Equitable risk allocation — risks assigned to the owner',
    ask: 'Under the Abrahamson principle, which four risks sit with the owner?',
    points: [
      { k: 'Site access' },
      { k: 'Fundamental design criteria', alt: ['design criteria'] },
      { k: 'Regulatory approvals' },
      { k: 'Sub-surface conditions', alt: ['subsurface conditions'] },
    ],
    hook: 'The owner owns what he hands over: the site, the design basis, the permits, the ground below.',
    seen: [],
    src: 'Tanvir sir L5 new deck p11',
  },
  {
    id: 'l-rk-mitigation',
    topic: T,
    title: 'Risk mitigation measures (principle 2)',
    ask: 'Contract risks must be identified in the pre-bid and negotiation phases. Which three measures does the slide give?',
    points: [
      {
        k: 'Thorough pre-contract site investigation',
        alt: ['site investigation', 'pre-contract site investigation'],
        d: 'extensive geological and geotechnical site investigations (boreholes, geophysics) to minimize subsurface surprises',
      },
      {
        k: 'Constructability reviews',
        alt: ['constructability review'],
        d: 'multi-disciplinary reviews before tender to identify design errors or conflicting specifications',
      },
      {
        k: 'Clear baseline schedules & cost estimates',
        alt: ['baseline schedules', 'cost estimates', 'CPM baselines'],
        d: 'realistic Critical Path Method (CPM) baselines and adequate risk contingencies (time and cost)',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p12',
  },
  {
    id: 'l-rk-transfer',
    topic: T,
    title: 'Risk transfer & financial shielding — the four means (principle 3)',
    ask: 'How is financial exposure mitigated by leveraging external protection and limiting liability?',
    points: [
      {
        k: 'Cap liabilities',
        alt: ['aggregate liability caps', 'liability caps'],
        d: 'aggregate liability caps (e.g. 100% of contract value); exclude consequential/indirect damages (recoverable only if foreseeable by both parties when the contract was executed)',
      },
      {
        k: 'Insurance policies',
        alt: ['insurance'],
        d: 'Contractor’s All Risks (CAR), Third-Party Liability, Professional Indemnity (for design-build), Delay in Start-Up (DSU)',
      },
      {
        k: 'Bonds & guarantees',
        alt: ['bonds and guarantees', 'bonds', 'guarantees'],
        d: 'performance bonds, advance payment guarantees and defects liability retention funds — protect against default',
      },
      {
        k: 'Subcontractor pass-through clauses',
        alt: ['pass-through clauses', 'back-to-back contracting'],
        d: 'back-to-back contracting passes operational obligations and risks downstream to specialized subcontractors',
      },
    ],
    hook: '"**C**aps, **I**nsurance, **B**onds, **S**ubcontracts" — cap it, insure it, bond it, pass it down.',
    seen: [],
    src: 'Tanvir sir L5 new deck p13',
  },
  {
    id: 'l-rk-insurance-policies',
    topic: T,
    title: 'Insurance policies used for risk transfer in construction projects',
    ask: 'Name the four insurance coverages the slide lists under risk transfer & financial shielding.',
    points: [
      {
        k: 'Contractor’s All Risks (CAR)',
        alt: ['CAR', 'contractors all risks'],
        d: 'physical loss or damage to the construction work itself, site materials and equipment from unforeseen events (fires, storms, floods, collapse)',
      },
      {
        k: 'Third-Party Liability',
        alt: ['third party liability', 'TPL'],
        d: 'accidental bodily injury, death or property damage caused to third parties (pedestrians, neighbors, adjacent buildings) by site operations',
      },
      {
        k: 'Professional Indemnity (for Design-Build)',
        alt: ['professional indemnity', 'PI'],
        d: 'legal liability for errors, omissions or structural design faults when a contractor handles both design and construction',
      },
      {
        k: 'Delay in Start-Up (DSU)',
        alt: ['DSU', 'delay in start up'],
        d: 'owners’ or investors’ financial losses (lost revenue, interest payments, fixed overheads) from schedule delays caused by physical damage covered under CAR',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p13 (the four names); p14 (what each covers)',
    note: 'The names are on the slide (p13). The coverage lines come from p14, which is a screenshot pasted into the copy of the deck, not a typed slide — good to know, but the four names are the safe part.',
  },
  {
    id: 'l-rk-bonds-guarantees',
    topic: T,
    title: 'Bonds & guarantees that protect against default (principle 3)',
    points: [
      { k: 'Performance bonds', alt: ['performance bond'] },
      { k: 'Advance payment guarantees', alt: ['advance payment guarantee'] },
      { k: 'Defects liability retention funds', alt: ['retention funds', 'defects liability retention'] },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p13',
  },
  {
    id: 'l-rk-contract-type-match',
    topic: T,
    title: 'Matching contract type to project uncertainty (principle 4)',
    ask: 'Which contract types does the slide match to which level of project uncertainty?',
    points: [
      {
        k: 'Fixed price / lump sum',
        alt: ['fixed price', 'lump sum'],
        d: 'best when scope is well-defined; transfers price and performance risk to the contractor',
      },
      {
        k: 'Target cost / cost-plus',
        alt: ['target cost', 'cost plus'],
        d: 'ideal for high-uncertainty projects; shares cost risks and savings between parties',
      },
      {
        k: 'Time & materials / remeasurable',
        alt: ['time and materials', 'remeasurable', 'remeasureable'],
        d: 'suitable for undefined or emergency scopes, though requires tight auditing',
      },
    ],
    hook: 'The less you know about the scope, the more the owner keeps the risk: fixed → shared → measured as you go.',
    seen: [],
    src: 'Tanvir sir L5 new deck p15',
  },
  {
    id: 'l-rk-change-mgmt',
    topic: T,
    title: 'Clear change management protocols (principle 5)',
    points: [
      {
        k: 'Variations and scope creep drive claims',
        alt: ['uncontrolled variations', 'scope creep', 'primary drivers of contract claims'],
        d: 'uncontrolled variations and scope creep are the primary drivers of contract claims',
      },
      {
        k: 'Strict, standardized process for VOs and EOT',
        alt: ['variation orders', 'extensions of time', 'standardized process'],
        d: 'for Variation Orders (VOs) and Extensions of Time (EOT)',
      },
      {
        k: 'Enforceable notice windows',
        alt: ['notice windows', 'written notice within 14 days'],
        d: 'e.g. written notice within 14 days of an event — prevents cumulative "end-of-project" claims',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p16–17',
  },
  {
    id: 'l-rk-risk-clauses',
    topic: T,
    title: 'Clear contractual risk clauses (principle 6)',
    points: [
      {
        k: 'Variation & EoT mechanisms',
        alt: ['variation and extension of time mechanisms', 'EoT mechanisms'],
        d: 'standardized, time-bound procedures for notifying, evaluating and issuing variations and claims',
      },
      {
        k: 'Price adjustment clauses',
        alt: ['price adjustment', 'fluctuation formulas'],
        d: 'fluctuation formulas linked to official price indices for long-duration contracts',
      },
      {
        k: 'Limitation of liability & liquidated damages',
        alt: ['limitation of liability', 'liquidated damages', 'LDs'],
        d: 'capping aggregate liability and defining clear, pre-agreed rates for delays',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p18',
  },
  {
    id: 'l-rk-dispute-tiers',
    topic: T,
    title: 'Tiered dispute resolution — the three tiers (principle 7)',
    ask: 'Put the tiers of dispute resolution in order.',
    points: [
      { k: 'Direct executive negotiation', alt: ['negotiation'] },
      { k: 'Independent dispute boards or mediation', alt: ['dispute boards', 'mediation'] },
      { k: 'Binding arbitration or court litigation', alt: ['arbitration', 'litigation'], d: 'as a last resort' },
    ],
    ordered: true,
    seen: [],
    src: 'Tanvir sir L5 new deck p19',
  },
  // ---------- dealing with contract risk ----------
  {
    id: 'l-rk-contract-risk',
    topic: T,
    title: 'Ways (activities) of dealing with contract risk',
    ask: 'Name the eight ways of dealing with contract risk — in the slide’s order.',
    points: [
      { k: 'Execute the contract in a professional manner', alt: ['execute professionally'], d: 'be quality oriented' },
      {
        k: 'Educate clients in using GCC',
        alt: ['educating clients in using GCC to manage risk', 'thoroughly educate clients', 'educate clients', 'use general conditions to cover costs'],
        d: '…to manage risk. GCC = the framework of the Employer–Contractor relationship: it clarifies who pays for what. (Older slide: "Thoroughly educate clients — use general conditions to cover costs".)',
      },
      { k: 'Identify problems', d: 'impose a fee premium or indemnification' },
      { k: 'Identify unavoidable/unacceptable risks', alt: ['unacceptable risks'], d: 'e.g. modification of existing structure, hazardous materials' },
      { k: 'Use the contract to close loopholes', alt: ['close loopholes and avoid traps'], d: '…and avoid traps: list services the client has declined' },
      { k: 'Establish extralegal conditions', alt: ['extralegal'], d: 'use dispute resolution (mediation/arbitration), reduce statute of limitations/repose, restrict damages' },
      { k: 'Develop clear contract language', alt: ['clear language'], d: 'make sure that the contract is easily understood by the client' },
      { k: 'Walk away', d: 'if a client is adamant about not taking prudent measures' },
    ],
    ordered: true,
    hook: '"E-E-I-I, U-E-C, W": two E’s (Execute, Educate), two I’s (problems, then unavoidable risks), then Use the contract, go Extralegal, write Clearly — and if the client still refuses, Walk.',
    seen: CR_SEEN,
    src: 'Tanvir sir L5 p2–3; new deck p20–21',
    note: 'Point 2 was rewritten this term: the new deck says "Educating clients in using GCC to manage RISK"; Lecture 05.pdf (and the 18-batch solve) say "Thoroughly educate clients — use general conditions to cover costs". Write the new one. The question bank gives eight different steps (read the contract, prefer model forms, check insurability…) — only "decline" matches "walk away". Learn the slide’s eight.',
  },
  {
    id: 'l-rk-gcc-pays',
    topic: T,
    title: 'What the GCC clarifies — who pays for…',
    ask: 'The general conditions of contract clarify who pays for which six things?',
    points: [
      { k: 'Site management' },
      { k: 'Mobilization and demobilization cost', alt: ['mobilization', 'demobilization'] },
      { k: 'Cost escalation', alt: ['inflation', 'price volatility'], d: 'due to inflation and price volatility' },
      {
        k: 'Unforeseen physical and geotechnical conditions',
        alt: ['unforeseen conditions', 'geotechnical conditions'],
        d: 'costs and time extension for them',
      },
      { k: 'Scope changes and work order variations', alt: ['scope changes', 'variations'] },
      { k: 'Exceptional events and force majeure', alt: ['force majeure', 'exceptional events'] },
    ],
    hook: 'A job from start to shock: set up the site, bring the plant in and out, prices rise, the ground surprises, the client changes his mind, disaster strikes.',
    seen: [],
    src: 'Tanvir sir L5 new deck p20',
  },
  // ---------- dealing with risk in general ----------
  {
    id: 'l-rk-three-factors',
    topic: T,
    title: 'Very important factors in dealing with risk',
    points: [
      { k: 'A good formal contract' },
      { k: 'Good project management' },
      { k: 'Knowledge of how to prevent risk events', alt: ['knowledge of preventable risks', 'knowledge of prevent risks'] },
    ],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p6; new deck p22',
    note: 'Lecture 05.pdf prints the third factor as "Knowledge of prevent risks"; the new deck corrects it to "Knowledge of how to prevent risk events".',
  },
  {
    id: 'l-rk-before-proposing',
    topic: T,
    title: 'What a firm should do before proposing on a project',
    points: [
      { k: 'Background research on the client and project', d: 'do background research on the client and the current project' },
      { k: 'Critically evaluate own capability and experience', d: '…with the type of work and project' },
      { k: 'Not rely on past behavior', d: '…as an indicator of future' },
      { k: 'Not rely on assumptions' },
    ],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p9; new deck p25',
  },
  {
    id: 'l-rk-before-signing',
    topic: T,
    title: 'What the contract must include before signing',
    points: [
      { k: 'Appropriate clause' },
      { k: 'Explicit general conditions' },
      { k: 'A well-defined work-scope' },
      { k: 'An accurate schedule' },
      { k: 'A clear budget' },
    ],
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p9; new deck p25',
  },
  {
    id: 'l-rk-techniques',
    topic: T,
    title: 'Techniques adopted to improve risk management in construction',
    points: [
      { k: 'PERT', alt: ['Program Evaluation & Review Technique'] },
      { k: 'Monte Carlo simulations' },
      { k: 'Cause & effect diagrams', alt: ['cause and effect diagram'] },
      { k: 'Fault trees' },
      { k: 'Decision trees' },
    ],
    hook: '"PERT Monte’s Cause — Fault or Decision?"',
    seen: [],
    src: 'Tanvir sir L5 p14; new deck p30',
  },
  {
    id: 'l-rk-elements',
    topic: T,
    title: 'Elements of risk management (Assessment → Action)',
    points: [
      { k: 'Identification', d: 'Assessment — the most critical element' },
      { k: 'Analysis', d: 'Assessment' },
      { k: 'Prioritisation', alt: ['prioritization'], d: 'Assessment' },
      { k: 'Allocation', d: 'Action — hold, avoid, reduce, transfer, share' },
      { k: 'Monitoring & reporting', alt: ['monitoring and reporting'], d: 'Action' },
    ],
    ordered: true,
    hook: '"**IAP → AM**" (the margin note on the slide): three letters under Assessment, two under Action.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p17–18; new deck p31 (the tree only)',
    note: 'The sentence "a two phased approach using assessment and action" is only in Lecture 05.pdf p17; the new deck keeps just the tree. The question bank lists identification, analysis, response, monitoring and documentation, and calls the two phases "assessment" and "response/control". Slide: Assessment (identification, analysis, prioritisation) and Action (allocation, monitoring & reporting).',
  },
  {
    id: 'l-rk-allocation',
    topic: T,
    title: 'Risk allocation options',
    points: [{ k: 'Hold', alt: ['retain'] }, { k: 'Avoid' }, { k: 'Reduce' }, { k: 'Transfer' }, { k: 'Share' }],
    hook: '"HART-S": Hold, Avoid, Reduce, Transfer, Share.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p18; new deck p31',
  },
  // ---------- insurance ----------
  {
    id: 'l-rk-players',
    topic: T,
    title: 'Principal players in the professional liability insurance industry',
    points: [
      { k: 'Insureds', d: 'those to whom a policy’s coverage is extended' },
      { k: 'Insurance agents', alt: ['agents', 'brokers'], d: 'specialize in selling insurance; obtain commissions based on their sales' },
      { k: 'Insurers', alt: ['insurance companies'], d: 'issue policies; establish what they do and do not cover, limits, deductibles and the premium' },
      { k: 'Actuaries', d: 'compute the odds that a given risk will materialize and the probable cost of the risk' },
      { k: 'Underwriters', d: 'evaluate each applicant; decide what the premium should be' },
      { k: 'Claims managers', d: 'advise insureds on what course of action to take when a claim arises' },
      { k: 'Reinsurers', d: 'insure insurers: back-up (should a large claim be filed) and stability' },
    ],
    hook: 'Follow a policy’s life: the Insured meets an Agent, buys from an Insurer whose Actuary did the odds and Underwriter set the premium; when trouble comes the Claims manager helps, and the Reinsurer backs the insurer. "I AIAU CR".',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21; new deck p33',
    note: 'The question bank writes "agents and brokers" and "claims managers and defence attorneys", and has actuaries setting premiums — on the slide the underwriter decides the premium.',
  },
  {
    id: 'l-rk-cost-drivers',
    topic: T,
    title: 'What a firm’s PLI premium is based on',
    points: [
      { k: 'Type of practice', d: 'geotechnical, structural, environmental, and so forth' },
      { k: 'Geographical area' },
      { k: 'Project mix' },
      { k: 'Claims history' },
      { k: 'Coverage needs' },
      { k: 'Resulting risks to insurer' },
    ],
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p27; new deck p39',
  },
  {
    id: 'l-rk-pli-concerns',
    topic: T,
    title: 'Specific concerns for professional liability insurance',
    points: [
      { k: 'Policy limits', d: 'more protection costs more; find the lowest practical amount; client requirements' },
      { k: 'Deductible', d: 'raising the limit is cheaper than lowering the deductible; new deductible each claim' },
      { k: 'Cost', d: 'set by the underwriter from practice type, area, project mix, claims history…' },
      { k: 'Insurability', d: 'indemnities and warranty-like certificates are not covered' },
      { k: 'Subconsultants', d: 'vicarious liability → review their policies' },
      { k: 'Joint ventures', d: 'like partnerships; one or all members liable' },
      { k: 'Project professional liability insurance', alt: ['project insurance', 'project PLI'], d: 'covers the whole project team' },
      { k: 'Expanded project delivery', d: 'design-build / developer cover through endorsements' },
      { k: 'Claims', d: 'timely reporting; barratry' },
    ],
    hook: 'Money first, then people, then trouble: 3 money words (Limits, Deductible, Cost) → 5 "who is covered" (Insurability, Subconsultants, Joint ventures, Project PLI, Expanded delivery) → Claims.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p26–30; new deck p38–42',
    note: 'The question bank lists nine different concerns (claims-made basis, retroactive date, hammer clause…). Only limits, deductible and project policy overlap — learn the slide’s nine.',
  },
  {
    id: 'l-rk-policy-considerations',
    topic: T,
    title: 'General policy considerations when buying PLI',
    points: [
      { k: 'Scope of coverage, endorsements, exclusions' },
      { k: 'Cost of the basic policy and endorsements' },
      { k: 'Part of overall financial management program?' },
    ],
    seen: [],
    src: 'Tanvir sir L5 p25; new deck p37',
  },
  {
    id: 'l-rk-gli-covers',
    topic: T,
    title: 'Exposures general liability insurance is meant for',
    points: [
      { k: 'Slips & falls', alt: ['slips and falls'] },
      { k: 'Libel & slander claims', alt: ['libel and slander'] },
      { k: 'Property damage to third parties', d: 'from office operations and nonprofessional activities at jobsites' },
    ],
    seen: GLI_SEEN,
    src: 'Tanvir sir L5 p31; new deck p43',
  },
  {
    id: 'l-rk-gli-excludes',
    topic: T,
    title: 'Exposures general liability insurance does NOT cover',
    points: [{ k: 'Professional' }, { k: 'Automobile' }, { k: 'Workers’ compensation', alt: ['workers compensation'] }],
    seen: GLI_SEEN,
    src: 'Tanvir sir L5 p31; new deck p43',
    note: 'The question bank says general liability covers damage by the firm’s vehicle — the slide says automobile exposures are NOT covered.',
  },
  {
    id: 'l-rk-epli',
    topic: T,
    title: 'Employee charges covered by employment practices liability insurance',
    points: [{ k: 'Harassment' }, { k: 'Discrimination' }, { k: 'Wrongful termination' }],
    seen: ['2022-23', '2016-17'],
    src: 'Tanvir sir L5 p32; new deck p44',
  },
  // ---------- bonds ----------
  {
    id: 'l-rk-bonds',
    topic: T,
    title: 'Most common bonds',
    points: [
      { k: 'Bid bond', d: 'winner will enter into the contract within a specified period of time and furnish any required bonds' },
      { k: 'Payment bond', d: 'certain payment obligations of the project will be satisfied' },
      { k: 'Performance bond', d: 'delivered at contract signing; work in accordance with the contract documents' },
    ],
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p33–34; new deck p45–46, p50',
    note: 'The question bank lists six bonds (adds advance payment, retention, maintenance) — the slide says the most common are these three. One senior note says a bid bond guarantees finishing the work in time: wrong — it guarantees entering into the contract and furnishing the required bonds.',
  },
  {
    id: 'l-rk-bond-promise',
    topic: T,
    title: 'What a surety legally promises when it executes a bond',
    ask: 'When a surety executes a bond it is making a legally binding promise of which two things?',
    points: [
      {
        k: 'Prequalification',
        d: 'the contractor is financially stable, technically capable, and reputable enough to complete the contract',
      },
      {
        k: 'Backstop guarantee',
        alt: ['backstop'],
        d: 'if the contractor defaults or fails to pay subcontractors/suppliers, the surety steps in to finish the work or pay up to the bond’s penal sum (limit)',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p47',
  },
  {
    id: 'l-rk-bond-parties',
    topic: T,
    title: 'The three parties involved in a bond',
    points: [
      { k: 'Principal (contractor)', alt: ['principal', 'contractor'], d: 'the party obligated to perform the work' },
      { k: 'Obligee (owner)', alt: ['obligee', 'owner', 'project owner'], d: 'the beneficiary who requires the guarantee' },
      {
        k: 'Surety (bonding company)',
        alt: ['surety', 'bonding company', 'obligator'],
        d: 'the financial institution guaranteeing the principal’s performance',
      },
    ],
    seen: [],
    src: 'Tanvir sir L5 new deck p47',
  },
  {
    id: 'l-rk-gia-recovery',
    topic: T,
    title: 'How the surety recovers paid bond money (under the GIA)',
    ask: 'Through which mechanisms does the General Indemnity Agreement let the surety recover paid bond money?',
    points: [
      {
        k: 'Corporate indemnity',
        d: 'freeze and claim the contractor’s corporate bank accounts, equipment, real estate and project receivables',
      },
      {
        k: 'Personal guarantees',
        d: 'signed by owners (and often their spouses): if the company goes bankrupt the surety can attach personal bank accounts, real estate and investments',
      },
      {
        k: 'Intercept unpaid contract funds',
        alt: ['unpaid contract funds', 'unbilled contract balances'],
        d: 'the project owner pays any remaining, unbilled contract balances directly to the surety, not to the defaulting contractor',
      },
      {
        k: 'Pursue third parties',
        alt: ['third parties', 'lawsuits'],
        d: 'lawsuits or claims against sub-consultants, sub-contractors or architects whose errors may have caused the initial failure',
      },
      {
        k: 'Collateral security',
        alt: ['collateral', 'letters of credit'],
        d: 'cash deposits or Letters of Credit equal to the reserved loss amount — even before the formal claim payout',
      },
    ],
    hook: 'Follow the money back: the Company, the Person behind it, the Project’s unpaid money, other Parties at fault — and Collateral up front. "C-P-I-P-C".',
    seen: [],
    src: 'Tanvir sir L5 new deck p48–49',
    note: 'The slide says "three main mechanisms" and then lists five; write all five.',
  },
  {
    id: 'l-rk-bond-cost',
    topic: T,
    title: 'What the cost of a bond depends on',
    points: [{ k: 'Class of project' }, { k: 'Contract amount' }, { k: 'Contract format' }],
    seen: [],
    src: 'Tanvir sir L5 p35; new deck p51',
  },
  {
    id: 'l-rk-surety',
    topic: T,
    title: 'Aspects of the surety company’s inquiry before issuing bonds',
    points: [
      { k: 'Essential characteristics of the project', d: 'size, type, nature; owner and ability to pay; contractor’s resources and experience' },
      { k: 'Total bonded and unbonded uncompleted work', alt: ['bonded and unbonded work'], d: 'is the contractor becoming overextended?' },
      { k: 'Adequacy of working capital and credit', alt: ['working capital', 'availability of credit'], d: 'substantiated by financial reports' },
      { k: 'Money between bid and next lowest bid', alt: ['left on table'], d: '"left on the table" — over 5 or 6 percent is a concern' },
      { k: 'Largest similar contract successfully completed', alt: ['largest contract amount of similar work'], d: 'stay within expertise; start small in a new sector' },
      { k: 'Terms of the contract and bonds required', d: 'payments, retention, time, liquidated damages, warranties' },
      { k: 'Amount subcontracted and subcontractor qualifications', alt: ['subcontracted work'], d: 'organization, financial resources, experience' },
    ],
    hook: 'Look at the job, then the contractor: Project → Workload → Wallet → Bid gap → Biggest past job → Terms → Subs. "P-W-W-B-B-T-S".',
    seen: SURETY_SEEN,
    src: 'Tanvir sir L5 p36–38; new deck p52–54',
    note: 'The question bank answers with the "three C’s" (character, capacity, capital) — not the slide’s seven aspects.',
  },
  // ---------- fiduciary risk ----------
  {
    id: 'l-rk-fid-causes',
    topic: T,
    title: 'Factors behind the realization of fiduciary risk',
    points: [
      { k: 'Lack of capacity, competency or knowledge' },
      { k: 'Bureaucratic inefficiency' },
      { k: 'Active corruption' },
    ],
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40; new deck p56',
  },
  {
    id: 'l-rk-fid-principles',
    topic: T,
    title: 'Principles of managing fiduciary risk',
    points: [
      { k: 'Understanding the fiduciary risk environment', alt: ['understanding'] },
      { k: 'Mitigating risks to the proper use of funds', alt: ['mitigating'] },
      { k: 'Monitoring performance on an on-going basis', alt: ['monitoring'] },
    ],
    ordered: true,
    seen: ['Jan 2021'],
    src: 'Tanvir sir L5 p41–42; new deck p57–58',
    note: 'The question bank’s principles ("define the duty, act with loyalty, be prudent") are about fiduciary duties of the engineer — not the slide’s three.',
  },
  {
    id: 'l-rk-program',
    topic: T,
    title: 'Finally, in a risk management program a civil engineer should',
    points: [
      { k: 'React quickly to the symptoms of problems' },
      { k: 'Maintain open lines of communication' },
      { k: 'Use emotional intelligence', alt: ['emotion intelligence'] },
    ],
    seen: [],
    src: 'Tanvir sir L5 p13; new deck p29',
  },
]

const cards: PcCard[] = [
  {
    id: 'c-rk-risk',
    topic: T,
    front: 'Define **risk** (Tanvir sir).',
    back: 'Risk can be defined as **danger, chance, and/or exposure to loss or injury**.',
    src: 'Tanvir sir L5 p4; new deck p2',
  },
  {
    id: 'c-rk-info-flow',
    topic: T,
    front: 'Why is an **unbroken flow of information** practically nonexistent in constructed projects?',
    back: 'The flow should run from early debates & strategic project definition through design, engineering, procurement, construction, operation and decommission — it is difficult to achieve because the **nature of decisions and type of decision makers change considerably over project lifecycles**.',
    src: 'Tanvir sir L5 p4; new deck p2',
  },
  {
    id: 'c-rk-hierarchy',
    topic: T,
    front: 'In what kind of organisation is construction risk managed? Which **two organizational forms** does it blend?',
    back: 'In **hierarchical networks of firms**. **Hierarchy**: clear contractual chains of command, authority, and liability flowing top-down (main contractor → subcontractors → sub-subcontractors/suppliers). **Network**: interdependent, temporary alliances of legally independent firms collaborating to deliver a single project. Problems are **highly interdependent** while the people, methods and organizations involved are **extraordinarily independent** (old L5 p5).',
    src: 'Tanvir sir L5 new deck p3; Lecture 05.pdf p5',
  },
  {
    id: 'c-rk-interdependent',
    topic: T,
    front: 'Older L5 slide: what typifies the management and decision-making environment of **hierarchical networks of firms**?',
    back: 'Problems are **highly interdependent** while the people, methods, and organizations involved are **extraordinarily independent**. Some projects have relatively stable partnerships between firms; more commonly there is greater uncertainty.',
    src: 'Lecture 05.pdf p5 only (the new deck replaced this slide with hierarchy + network)',
  },
  {
    id: 'c-rk-asset-light',
    topic: T,
    front: 'Network model: what does it mean that main contractors stay "**asset-light**"?',
    back: 'They maintain **core management and engineering staff** while scaling field operations up or down depending on secured projects. **Specialist subcontractors** move between project sites and main contractors, keeping their specialized labor and equipment continuously utilized.',
    src: 'Tanvir sir L5 new deck p5',
  },
  {
    id: 'c-rk-offload',
    topic: T,
    front: 'Network model: how is risk **offloaded** down the tiers?',
    back: 'The **client** passes **performance and cost risk** to the main contractor via a **master contract**. The **main contractor** passes **specific execution risks** (e.g. ground failure, steel fabrication delays) to specialist sub-tier firms via "**back-to-back**" subcontractor agreements.',
    src: 'Tanvir sir L5 new deck p6',
  },
  {
    id: 'c-rk-cat-site',
    topic: T,
    front: 'Contract risk category **Site & geotechnical risk**: which three risks?',
    back: '**Unforeseen conditions** — differing site conditions (unexpected rock formations, soft clay, contaminated soil, high groundwater) deviating significantly from baseline geotechnical reports. **Site access & possession** — employer’s delay in handing over clear, unencumbered physical access. **Major policy changes**.',
    src: 'Tanvir sir L5 new deck p8',
  },
  {
    id: 'c-rk-cat-scope',
    topic: T,
    front: 'Contract risk category **Scope & design risk**: which two risks?',
    back: '**Incomplete or ambiguous design or documentation** — gaps in drawings, vague specifications, or conflicting contract documents leading to variations and disputes. **Scope creep & design changes** — employer-requested variations during execution that impact constructability, sequence, and overall schedule.',
    src: 'Tanvir sir L5 new deck p8',
  },
  {
    id: 'c-rk-cat-time',
    topic: T,
    front: 'Contract risk category **Time & schedule risk**: which two risks?',
    back: '**Excusable vs. non-excusable delays** — whether a delay warrants an Extension of Time (EoT) and prolonged cost recovery. **Force majeure & exceptional events** — unforeseeable events beyond control (extreme weather, civil unrest, natural disasters).',
    src: 'Tanvir sir L5 new deck p9',
  },
  {
    id: 'c-rk-cat-fin',
    topic: T,
    front: 'Contract risk category **Financial & commercial risk**: which two risks?',
    back: '**Price volatility & inflation** — unanticipated increases in raw material (steel, cement, fuel) or labor costs, especially in fixed-price/lump-sum contracts without price adjustment clauses. **Cash flow & payment delays** — delayed interim payments, non-payment, or slow release of retention money affecting contractor liquidity.',
    src: 'Tanvir sir L5 new deck p9',
  },
  {
    id: 'c-rk-cat-legal',
    topic: T,
    front: 'Contract risk category **Legal, regulatory & environmental risk**: which two risks?',
    back: '**Permitting & environmental compliance** — delays in obtaining statutory approvals, environmental clearances, or right-of-way (RoW) permits. **Change in legislation** — local regulatory updates or tariff changes introduced after contract signing.',
    src: 'Tanvir sir L5 new deck p10',
  },
  {
    id: 'c-rk-cat-perf',
    topic: T,
    front: 'Contract risk category **Performance & quality risk**: which two risks?',
    back: '**Defective workmanship / materials** — failure to meet performance specifications or structural durability criteria. **Subcontractor / supplier default** — underperformance or insolvency of key tier-2 vendors.',
    src: 'Tanvir sir L5 new deck p10',
  },
  {
    id: 'c-rk-abrahamson',
    topic: T,
    front: 'State the **Abrahamson principle**.',
    back: 'The foundational rule of contracting (equitable risk allocation): **risk should be assigned to the party best equipped to manage, control, or bear it**.',
    src: 'Tanvir sir L5 new deck p11',
  },
  {
    id: 'c-rk-prebid',
    topic: T,
    front: '**When** must contract risks be identified (risk mitigation)?',
    back: 'During the **pre-bid and negotiation phases, not after execution** — early & thorough risk identification, pro-active engineering and management.',
    src: 'Tanvir sir L5 new deck p12',
  },
  {
    id: 'c-rk-cap',
    topic: T,
    front: '**Cap liabilities**: what two things does the slide say to do?',
    back: 'Include **aggregate liability caps** (e.g. 100% of contract value) and **exclude consequential/indirect damages** — these are recoverable only if they were foreseeable by both parties at the time the contract was executed.',
    src: 'Tanvir sir L5 new deck p13',
  },
  {
    id: 'c-rk-back-to-back',
    topic: T,
    front: 'What is **back-to-back contracting** (subcontractor pass-through clauses)?',
    back: 'Contracting that **passes operational obligations and risks downstream to specialized subcontractors** — the main contractor’s obligations under the master contract are mirrored in the subcontracts.',
    src: 'Tanvir sir L5 new deck p6, p13 (the "mirrored" gloss is an explanation, not slide text)',
  },
  {
    id: 'c-rk-car-tpl',
    topic: T,
    front: '**Contractor’s All Risks (CAR)** vs **Third-Party Liability** insurance?',
    back: '**CAR**: physical loss or damage to the **construction work itself, site materials and equipment** from unforeseen events (fires, storms, floods, collapse). **Third-Party Liability**: accidental bodily injury, death or property damage caused to **third parties** (pedestrians, neighbors, adjacent buildings) by site operations.',
    src: 'Tanvir sir L5 new deck p13; p14 (screenshot pasted into the deck)',
  },
  {
    id: 'c-rk-pi-dsu',
    topic: T,
    front: '**Professional Indemnity (for design-build)** and **Delay in Start-Up (DSU)** cover what?',
    back: '**Professional indemnity**: legal liability for errors, omissions or structural design faults when a contractor handles both design and construction. **DSU**: owners’ or investors’ financial losses (lost revenue, interest payments, fixed overheads) from schedule delays caused by physical damage covered under CAR.',
    src: 'Tanvir sir L5 new deck p13; p14 (screenshot pasted into the deck)',
  },
  {
    id: 'c-rk-type-risk',
    topic: T,
    front: 'Which contract type puts **price and performance risk on the contractor**, and which **shares** cost risk?',
    back: '**Fixed price / lump sum** (best when scope is well-defined) transfers price and performance risk to the contractor. **Target cost / cost-plus** (high-uncertainty projects) shares cost risks and savings between parties. **Time & materials / remeasurable** (undefined or emergency scopes) requires tight auditing.',
    src: 'Tanvir sir L5 new deck p15',
  },
  {
    id: 'c-rk-notice',
    topic: T,
    front: 'What **notice window** does the slide give as an example, and what is it for?',
    back: 'Written notice **within 14 days of an event** — enforceable notice windows prevent cumulative "**end-of-project**" claims.',
    src: 'Tanvir sir L5 new deck p16–17',
  },
  {
    id: 'c-rk-abbr',
    topic: T,
    front: 'Expand **EoT, VO, LDs, CPM, RoW, GIA**.',
    back: '**EoT** Extension of Time · **VO** Variation Order · **LDs** Liquidated Damages (clear, pre-agreed rates for delays) · **CPM** Critical Path Method · **RoW** right-of-way · **GIA** General Indemnity Agreement.',
    src: 'Tanvir sir L5 new deck p9–12, p16–18, p48',
  },
  {
    id: 'c-rk-gcc',
    topic: T,
    front: 'What do the **general conditions of contract (GCC)** serve as?',
    back: 'The **framework for the legal and administrative relationship between the Employer (Client) and the Contractor** — it clarifies **who pays** for site management, mobilization and demobilization, cost escalation, unforeseen physical and geotechnical conditions, scope changes and variations, exceptional events and force majeure.',
    src: 'Tanvir sir L5 new deck p20',
  },
  {
    id: 'c-rk-prevent',
    topic: T,
    front: 'What is the **most effective preventive approach** to risk?',
    back: 'To **perform professionally** — not only technical execution but **eliminating misunderstanding and unrealistic expectations** with clients and other professionals.',
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p6; new deck p22',
  },
  {
    id: 'c-rk-transfer',
    topic: T,
    front: 'Why are insurance and indemnification only **partial** risk transfer?',
    back: 'PLI, the most common mechanism, leaves many exposures **uncovered or covered only in part**; indemnification (full or partial — partial can cap liability) is likewise **imperfect**. **Transferring all risk is impossible.**',
    seen: ['2023-24'],
    src: 'Tanvir sir L5 p7–8; new deck p23–24',
  },
  {
    id: 'c-rk-reserves',
    topic: T,
    front: 'What is a **loss reserves account** and why is it hard to keep?',
    back: 'Money set aside by **including risks in the fees**; **competition in the marketplace** makes this difficult — and some risk problems are not merely financial (emotional drain, reputation).',
    src: 'Tanvir sir L5 p8; new deck p24',
  },
  {
    id: 'c-rk-documentation',
    topic: T,
    front: 'Which client statements does good **documentation** eliminate?',
    back: 'Notes, memos, e-mails and meeting minutes kill "**We never said that…**", "**You said…**" and "**I’ve never heard [seen] that before…**" — proper documentation often gets claims **dropped**.',
    src: 'Tanvir sir L5 p12; new deck p28',
  },
  {
    id: 'c-rk-surety-bond',
    topic: T,
    front: 'Define a **surety bond** by its three parties (older slide).',
    back: 'A financial instrument issued by a **third party (surety company)** to a **first party (owner)**, guaranteeing that a **second party (construction firm)** will complete the project according to the written contract.',
    seen: BOND_SEEN,
    src: 'Lecture 05.pdf p15 only (the new deck dropped this slide; its own definition is on new deck p46)',
  },
  {
    id: 'c-rk-identify',
    topic: T,
    front: 'Which element of risk management is **most critical**, and why?',
    back: '**Identification** — risk **cannot be managed if it is not identified**.',
    seen: ['2015-16', '2012-13'],
    src: 'Tanvir sir L5 p18; new deck p31',
  },
  {
    id: 'c-rk-two-phase',
    topic: T,
    front: 'What is the **two-phased approach** to risk management?',
    back: '**Assessment** (identification, analysis, prioritisation) then **Action** (allocation — hold, avoid, reduce, transfer, share — and monitoring & reporting). Advocated by practitioners and researchers as risk management becomes a distinct activity.',
    seen: ['2012-13'],
    src: 'Lecture 05.pdf p17 (the sentence); new deck p31 (the tree)',
  },
  {
    id: 'c-rk-firms',
    topic: T,
    front: 'How do construction firms actually treat risk?',
    back: 'Seldom quantitatively: they **ignore remote possibilities**, look at a few outcomes, **focus on opportunities rather than danger**, and pass risk to vendors and subcontractors through **performance clauses** — leading to sub-optimization of the whole project.',
    src: 'Lecture 05.pdf p16–17 only (the new deck dropped these slides)',
  },
  {
    id: 'c-rk-li',
    topic: T,
    front: 'Define **liability insurance** (slide wording).',
    back: 'A contract under which an insurance company agrees to **protect a person or entity against claims arising from real or alleged failure to fulfill an obligation or duty to a third party** who is an incidental beneficiary.',
    seen: ['2014-15'],
    src: 'Tanvir sir L5 p20; new deck p32 (a senior note defines it as insurance against damage caused by employees — write the slide’s wording)',
  },
  {
    id: 'c-rk-pli',
    topic: T,
    front: 'Define **professional liability insurance** (slide wording).',
    back: 'Insurance coverage for the insured professional’s **legal liability for claims arising out of damages sustained by others allegedly as a result of negligent acts, errors, or omissions in the performance of professional services**.',
    seen: ['2014-15', '2011-12'],
    src: 'Tanvir sir L5 p20; new deck p32',
  },
  {
    id: 'c-rk-bond',
    topic: T,
    front: 'Define a **bond** (slide wording) — name the three parties.',
    back: 'In suretyship, an obligation by which one party (**surety** or obligator) agrees to guarantee performance by another (**principal**) of a specified obligation for the benefit of a third person or entity (**obligee**).',
    seen: ['2022-23', '2014-15', '2012-13'],
    src: 'Tanvir sir L5 p20; new deck p45',
  },
  {
    id: 'c-rk-bond-credit',
    topic: T,
    front: 'This term’s slide: a surety bond is what kind of **mechanism**?',
    back: 'A **specialized credit mechanism based on a three-party relationship**: a surety company (surety or obligator) agrees to execute a bond on behalf of a **contractor (the principal)** for a **project owner (the third party or obligee)** — providing the **third-party financial guarantee of performance or payment**.',
    src: 'Tanvir sir L5 new deck p46',
  },
  {
    id: 'c-rk-bond-loan',
    topic: T,
    front: '**Is a bond a loan?** How is it unlike insurance?',
    back: 'Money is paid **only when a party defaults**, but once paid it becomes an **absolute debt that must be repaid by the contractor**. Unlike insurance (risk is pooled and the insurer absorbs the loss), a surety bond is a **contingent extension of credit**: every dollar the surety pays the owner, the contractor legally owes back.',
    src: 'Tanvir sir L5 new deck p48; Class Test 1 (b)',
  },
  {
    id: 'c-rk-ct1-b',
    topic: T,
    front: '**True or false** (Class Test 1): "Professional liability insurance works the same way as a surety bond — in both cases, the party that causes the loss must eventually repay the insurer or surety."',
    back: '**False.** In insurance the risk is pooled and the **insurer absorbs the loss**; under a bond, whatever the surety pays becomes an **absolute debt the contractor must repay** (a contingent extension of credit).',
    src: 'Class Test 1 (b), this term — printed answer False; reason from new deck p48',
  },
  {
    id: 'c-rk-penal-sum',
    topic: T,
    front: 'What is the bond’s **penal sum**?',
    back: 'The bond’s **limit**: under the backstop guarantee, if the contractor defaults or fails to pay subcontractors/suppliers, the surety steps in to **finish the work or pay up to the penal sum**.',
    src: 'Tanvir sir L5 new deck p47',
  },
  {
    id: 'c-rk-gia',
    topic: T,
    front: 'What is a **GIA**, who signs it and when?',
    back: 'The **General Indemnity Agreement**: **before** a surety company executes a single bond, it requires the **contractor (and often the company’s owners personally)** to sign it. It provides the **legal framework for recovering** paid bond money.',
    src: 'Tanvir sir L5 new deck p48',
  },
  {
    id: 'c-rk-actuary',
    topic: T,
    front: '**Actuaries** vs **underwriters**?',
    back: '**Actuaries** compute the **odds** that a given risk will materialize and its **probable cost**. **Underwriters** **evaluate each applicant** to determine the extent to which risks may occur and **what the premium should be**.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21; new deck p33',
  },
  {
    id: 'c-rk-reinsurer',
    topic: T,
    front: 'Who are **reinsurers**?',
    back: 'Those who **insure insurers**, providing both **back-up** (should a large claim be filed) and **stability** to the industry.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21; new deck p33',
  },
  {
    id: 'c-rk-insurers',
    topic: T,
    front: 'Who are **insureds** and **insurers**?',
    back: '**Insureds**: those to whom a policy’s coverage is extended. **Insurers**: insurance companies that **issue policies** and establish what they do and do not cover, **limits, deductibles and the premium**.',
    seen: PLAYER_SEEN,
    src: 'Tanvir sir L5 p21; new deck p33',
  },
  {
    id: 'c-rk-supply',
    topic: T,
    front: 'What influences the **cost of PLI** at industry level?',
    back: '**Risk, demand and level of coverage**; actuaries’ and underwriters’ analysis is a prime aspect. **Supply and demand**: high capacity + low demand → cheap; rising demand → more expensive.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p22–23; new deck p34–35',
  },
  {
    id: 'c-rk-deductible',
    topic: T,
    front: 'PLI **deductible**: the three slide points.',
    back: '1. **Raising a policy’s limit is relatively less expensive than lowering a deductible.** 2. Balance the **deductible, premium and level of coverage**. 3. A **new deductible obligation occurs with each claim**.',
    seen: ['2012-13', ...CONC_SEEN],
    src: 'Tanvir sir L5 p26; new deck p38',
  },
  {
    id: 'c-rk-project-pli',
    topic: T,
    front: '**Project professional liability insurance** — three points.',
    back: 'Covers the **entire project team, even those who practice without insurance**; **owners usually pay** when they want coverage beyond what design firms normally carry; when scope grows it can **cover consultants who could not otherwise obtain coverage**.',
    seen: ['2012-13', ...CONC_SEEN],
    src: 'Tanvir sir L5 p29; new deck p41',
  },
  {
    id: 'c-rk-insurability',
    topic: T,
    front: 'PLI concern **insurability**: what is not covered?',
    back: 'PLI covers only the professionals it is bought for. **Not covered**: owners’ demands that designers **indemnify** them, and **certificates that act as express warranties or guarantees**.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p28; new deck p40',
  },
  {
    id: 'c-rk-barratry',
    topic: T,
    front: 'What is **barratry**? And what claims point must a policy be checked for?',
    back: '**Barratry** = the **fomenting of claims where none exist**. Check for terms requiring **timely reporting of claims** — late reporting can jeopardize coverage.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p30; new deck p42',
  },
  {
    id: 'c-rk-jv',
    topic: T,
    front: 'PLI concern **joint ventures**?',
    back: 'Legally similar to **partnerships** (though with a more limited purpose); if a claim is made against a JV, **one or all members can be held liable** — take care over the type of PLI the JV uses.',
    seen: CONC_SEEN,
    src: 'Tanvir sir L5 p29; new deck p41',
  },
  {
    id: 'c-rk-devastating',
    topic: T,
    front: 'What is the **most devastating** professional and business risk for most CE firms?',
    back: '**Litigation based on accusations of negligence** in the performance of professional services. Buying appropriate insurance is a **major business decision**.',
    src: 'Tanvir sir L5 p32; new deck p44',
  },
  {
    id: 'c-rk-bid-bond',
    topic: T,
    front: '**Bid bond** guarantees…',
    back: 'That **if a contractor is successful in winning a bid**, it will **enter into a contract within a specified period of time and furnish any required bonds**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34; new deck p50',
  },
  {
    id: 'c-rk-perf-bond',
    topic: T,
    front: '**Performance bond**: when is it delivered and what does it guarantee?',
    back: 'Typically **delivered when the owner–contractor contract is signed**; guarantees the contractor will **perform the work in accordance with the contract documents**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34; new deck p50',
  },
  {
    id: 'c-rk-pay-bond',
    topic: T,
    front: '**Payment bond** provides…',
    back: 'Assurance that **certain payment obligations associated with a construction project will be satisfied**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34; new deck p50',
  },
  {
    id: 'c-rk-owner-surety',
    topic: T,
    front: 'What right does the owner usually reserve over bonds, and why does bonding capacity matter to a contractor?',
    back: 'The owner reserves the right to **approve the surety company and the form of the bond**. An entity’s ability to obtain bonds **greatly influences the type and size of projects it can pursue**.',
    seen: BOND_SEEN,
    src: 'Tanvir sir L5 p34–35; new deck p50–51',
  },
  {
    id: 'c-rk-left-table',
    topic: T,
    front: 'Surety inquiry: what is "**left on the table**" and when is it a concern?',
    back: 'The money between the contractor’s bid and the **next lowest bid**; a spread of **more than 5 or 6 percent** is cause for concern about the soundness of the contractor’s bidding practices.',
    seen: SURETY_SEEN,
    src: 'Tanvir sir L5 p37; new deck p53',
  },
  {
    id: 'c-rk-final-report',
    topic: T,
    front: 'What happens after a bonded project is completed?',
    back: 'The owner sends a **final report to the surety**: the contractor’s execution, changes made, and the **final total contract amount**, used to **adjust the final bond premium**.',
    src: 'Tanvir sir L5 p39; new deck p55',
  },
  {
    id: 'c-rk-fiduciary',
    topic: T,
    front: 'Define **fiduciary risk** (three parts).',
    back: 'The risk that funds **are not used for the intended purposes**; **do not achieve value for money**; and/or **are not properly accounted for**.',
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40; new deck p56',
  },
  {
    id: 'c-rk-fid-example',
    topic: T,
    front: 'Fiduciary risk from the trustee’s side — with the slide example.',
    back: 'The risk that a **trustee or other fiduciary** does not perform their duties or achieve the best value for the **beneficiary’s interests** — e.g. the fiduciary **making more trades than truly necessary**.',
    seen: FID_SEEN,
    src: 'Tanvir sir L5 p40; new deck p56',
  },
]

const answers: PcAnswer[] = [
  // ---------- new deck: likely new questions ----------
  {
    id: 'a-rk-network',
    topic: T,
    q: 'In what form of organisation is risk managed in construction? Why does construction use this model, and what are its key challenges?',
    seen: [],
    a: `Risk is managed in **hierarchical networks of firms**. This structure blends two organizational forms:
- **Hierarchy** — clear contractual chains of command, authority, and liability flowing **top-down** (main contractor to subcontractors to sub-subcontractors/suppliers).
- **Network** — interdependent, **temporary alliances** of **legally independent firms** collaborating to deliver a single project.

### Why construction uses this model
1. **High specialization & technical complexity** — modern construction demands highly technical capabilities (geotechnical ground improvement, structural steel erection/RCC casting, HVAC engineering, MEP integration); it is economically inefficient for a single firm to permanently employ all these specialized trades and maintain expensive, specialized equipment year-round.
2. **Strategic flexibility & capacity** — construction demand fluctuates wildly by region and economic cycle. Main contractors stay "**asset-light**" (core management and engineering staff, field operations scaled up or down with secured projects); specialist subcontractors move between project sites and main contractors, keeping their labor and equipment continuously utilized.
3. **Risk offloading & distribution** — the client passes performance and cost risk to the main contractor via a **master contract**; the main contractor passes specific execution risks (e.g. ground failure, steel fabrication delays) to specialist sub-tier firms via "**back-to-back**" subcontractor agreements.
4. **Capital efficiency** — a network model reduces capital requirements for any single entity: one firm does not finance machinery, materials and specialized labor force; financial exposure and working capital requirements are distributed across dozens of independent firms.

### Key challenges of the network model
While flexible, managing a multi-tiered firm network introduces distinct operational and contractual risks:
1. **Interface & coordination risk** — gaps between sub-contracts (where Scope A ends and Scope B begins) frequently cause delays or extra costs.
2. **Contractual disconnects** — information or claims must pass through multiple contractual layers, which slows decision-making and increases litigation risks.
3. **Supply chain vulnerability** — insolvency or delay at a sub-subcontractor level cascades upward, disrupting the **critical path** of the entire project.`,
    keys: [
      'hierarchical networks of firms',
      'top-down',
      'temporary alliances',
      'legally independent firms',
      'High specialization & technical complexity',
      'Strategic flexibility & capacity',
      'asset-light',
      'Risk offloading & distribution',
      'master contract',
      'back-to-back',
      'Capital efficiency',
      'Interface & coordination risk',
      'Contractual disconnects',
      'Supply chain vulnerability',
      'critical path',
    ],
    lists: ['l-rk-network-why', 'l-rk-network-challenges'],
    src: 'Tanvir sir L5 new deck p3–7 — a likely new question (not in any past paper). The sketch is built from the slide text; the deck has no drawing.',
    Fig: NetworkFig,
  },
  {
    id: 'a-rk-risk-categories',
    topic: T,
    q: 'What are the primary categories of contract risks? Briefly describe each.',
    seen: [],
    a: `### 1. Site & geotechnical risk
- **Unforeseen conditions** — differing site conditions (e.g. unexpected rock formations, soft clay, contaminated soil, high groundwater) that deviate significantly from baseline geotechnical reports.
- **Site access & possession** — delays by the employer/owner in handing over clear, unencumbered physical access to the site.
- **Major policy changes**.

### 2. Scope & design risk
- **Incomplete or ambiguous design or documentation** — gaps in drawings, vague specifications, or conflicting contract documents leading to variations and disputes.
- **Scope creep & design changes** — employer-requested variations during execution that impact constructability, sequence, and overall schedule.

### 3. Time & schedule risk
- **Excusable vs. non-excusable delays** — clear distinctions (and debate) over whether a delay warrants an **Extension of Time** (EoT) and prolonged cost recovery.
- **Force majeure & exceptional events** — unforeseeable events beyond control (e.g. extreme weather, civil unrest, natural disasters).

### 4. Financial & commercial risk
- **Price volatility & inflation** — unanticipated increases in raw material (steel, cement, fuel) or labor costs, especially in fixed-price/lump-sum contracts without price adjustment clauses.
- **Cash flow & payment delays** — delayed interim payments, non-payment, or slow release of retention money affecting contractor liquidity.

### 5. Legal, regulatory & environmental risk
- **Permitting & environmental compliance** — delays in obtaining statutory approvals, environmental clearances, or right-of-way (RoW) permits.
- **Change in legislation** — local regulatory updates or tariff changes introduced after contract signing.

### 6. Performance & quality risk
- **Defective workmanship / materials** — failure to meet performance specifications or structural durability criteria.
- **Subcontractor / supplier default** — underperformance or insolvency of key tier-2 vendors.`,
    keys: [
      'Site & geotechnical risk',
      'Unforeseen conditions',
      'Scope & design risk',
      'Scope creep',
      'Time & schedule risk',
      'Extension of Time',
      'Force majeure',
      'Financial & commercial risk',
      'Price volatility & inflation',
      'Cash flow & payment delays',
      'Legal, regulatory & environmental risk',
      'Change in legislation',
      'Performance & quality risk',
      'Defective workmanship',
      'supplier default',
    ],
    lists: ['l-rk-risk-categories'],
    src: 'Tanvir sir L5 new deck p8–10 — a likely new question (not in any past paper)',
  },
  {
    id: 'a-rk-key-principles',
    topic: T,
    q: 'What are the key principles of contract risk management?',
    seen: [],
    a: `### 1. Equitable risk allocation
The foundational rule of contracting (**Abrahamson principle**) is that risk should be assigned to the party **best equipped** to manage, control, or bear it.

| Contractor risk | Owner risk |
|---|---|
| Execution | Site access |
| Means and methods | Fundamental design criteria |
| Site safety | Regulatory approvals |
| Productivity | Sub-surface conditions |

### 2. Risk mitigation
Early & thorough risk identification, pro-active engineering and management: contract risks must be identified during the **pre-bid** and negotiation phases, not after execution.
- **Thorough pre-contract site investigation** — extensive geological and geotechnical site investigations (boreholes, geophysics) to minimize subsurface surprises.
- **Constructability reviews** — multi-disciplinary reviews before tender to identify design errors or conflicting specifications.
- **Clear baseline schedules & cost estimates** — realistic Critical Path Method (CPM) baselines and adequate risk contingencies (time and cost).

### 3. Risk transfer & financial shielding
Mitigate financial exposure by leveraging external protection and limiting liability.
- **Cap liabilities** — include **aggregate liability caps** (e.g. 100% of contract value) and exclude consequential/indirect damages.
- **Insurance policies** — Contractor’s All Risks (CAR), Third-Party Liability, Professional Indemnity (for design-build) and Delay in Start-Up (DSU) coverage.
- **Bonds & guarantees** — performance bonds, advance payment guarantees and defects liability retention funds, to protect against default.
- **Subcontractor pass-through clauses** — **back-to-back** contracting to pass operational obligations and risks downstream to specialized subcontractors.

### 4. Match contract type to project uncertainty
Select a payment and contract structure that aligns with the level of design clarity and project risk profile.

| Project uncertainty | Contract type | Risk |
|---|---|---|
| Scope is well-defined | Fixed price / lump sum | transfers price and performance risk to the contractor |
| High-uncertainty projects | Target cost / cost-plus | shares cost risks and savings between parties |
| Undefined or emergency scopes | Time & materials / remeasurable | requires tight auditing |

### 5. Clear change management protocols
- Uncontrolled variations and scope creep are the primary drivers of contract claims.
- Establish a strict, standardized process for **Variation Orders** (VOs) and Extensions of Time (EOT).
- Set enforceable notice windows (e.g. requiring written notice within **14 days** of an event) to prevent cumulative "end-of-project" claims.

### 6. Clear contractual risk clauses
- **Variation & Extension of Time (EoT) mechanisms** — standardized, time-bound procedures for notifying, evaluating, and issuing variations and claims.
- **Price adjustment clauses** — fluctuation formulas linked to official price indices for long-duration contracts.
- **Limitation of liability & liquidated damages (LDs)** — capping aggregate liability and defining clear, pre-agreed rates for delays.

### 7. Tiered dispute resolution
Include structured, multi-tiered dispute mechanisms to resolve conflicts early without escalating straight to litigation:
1. Direct executive negotiation
2. Independent dispute boards or mediation
3. Binding arbitration or court litigation as a last resort`,
    keys: [
      'Equitable risk allocation',
      'Abrahamson principle',
      'best equipped',
      'Risk mitigation',
      'pre-bid',
      'Risk transfer & financial shielding',
      'aggregate liability caps',
      'back-to-back',
      'Match contract type to project uncertainty',
      'Clear change management protocols',
      'Variation Orders',
      '14 days',
      'Clear contractual risk clauses',
      'liquidated damages',
      'Tiered dispute resolution',
    ],
    lists: [
      'l-rk-key-principles',
      'l-rk-contractor-risk',
      'l-rk-owner-risk',
      'l-rk-mitigation',
      'l-rk-transfer',
      'l-rk-contract-type-match',
      'l-rk-change-mgmt',
      'l-rk-risk-clauses',
      'l-rk-dispute-tiers',
    ],
    src: 'Tanvir sir L5 new deck p11–19 — a likely new question (not in any past paper). The two tables put the slide’s bullets in the form the class copy of the deck draws them. For a short question, write the seven names with one line each.',
  },
  {
    id: 'a-rk-abrahamson',
    topic: T,
    q: 'What is the Abrahamson principle (equitable risk allocation)? Which risks belong to the contractor and which to the owner?',
    seen: [],
    a: `**Equitable risk allocation** — the foundational rule of contracting (**Abrahamson principle**) is that risk should be assigned to the party **best equipped to manage, control, or bear it**.

| Contractor risk | Owner risk |
|---|---|
| **Execution** | **Site access** |
| **Means and methods** | **Fundamental design criteria** |
| **Site safety** | **Regulatory approvals** |
| **Productivity** | **Sub-surface conditions** |`,
    keys: [
      'Equitable risk allocation',
      'Abrahamson principle',
      'best equipped to manage, control, or bear it',
      'Execution',
      'Means and methods',
      'Site safety',
      'Productivity',
      'Site access',
      'Fundamental design criteria',
      'Regulatory approvals',
      'Sub-surface conditions',
    ],
    lists: ['l-rk-contractor-risk', 'l-rk-owner-risk'],
    src: 'Tanvir sir L5 new deck p11 — a likely new question (not in any past paper)',
  },
  {
    id: 'a-rk-transfer',
    topic: T,
    q: 'How is contract risk transferred (risk transfer and financial shielding)? Which insurance policies are used in construction projects?',
    seen: [],
    a: `**Risk transfer & financial shielding** — mitigate financial exposure by **leveraging external protection and limiting liability**:

1. **Cap liabilities** — include **aggregate liability caps** (e.g. 100% of contract value) and exclude **consequential damages/indirect damages** (recoverable only if they were foreseeable by both parties at the time the contract was executed).
2. **Insurance policies** — Contractor’s All Risks (CAR), Third-Party Liability, Professional Indemnity (for design-build) and Delay in Start-Up (DSU) coverage.
3. **Bonds & guarantees** — performance bonds, **advance payment guarantees** and **defects liability retention funds**, to protect against default.
4. **Subcontractor pass-through clauses** — **back-to-back contracting** to pass operational obligations and risks downstream to specialized subcontractors.

### The four insurance policies
| Policy | Primary purpose and coverage |
|---|---|
| **Contractor’s All Risks** (CAR) | physical loss or damage to the construction work itself, site materials and equipment caused by unforeseen events (fires, storms, floods, collapse) |
| **Third-Party Liability** | claims arising from accidental bodily injury, death or property damage caused to third parties (pedestrians, neighbors, adjacent buildings) due to site operations |
| **Professional Indemnity** (for design-build) | legal liability for damages resulting from errors, omissions or structural design faults when a contractor handles both design and construction duties |
| **Delay in Start-Up** (DSU) | project owners’ or investors’ financial losses (lost revenue, interest payments, fixed overheads) caused by schedule delays resulting from physical damage covered under CAR |

By purchasing these policies, project teams transfer potential financial losses to an insurance company.`,
    keys: [
      'leveraging external protection and limiting liability',
      'Cap liabilities',
      'aggregate liability caps',
      'consequential damages/indirect damages',
      'Insurance policies',
      'Bonds & guarantees',
      'advance payment guarantees',
      'defects liability retention funds',
      'Subcontractor pass-through clauses',
      'back-to-back contracting',
      'Contractor’s All Risks',
      'Third-Party Liability',
      'Professional Indemnity',
      'Delay in Start-Up',
    ],
    lists: ['l-rk-transfer', 'l-rk-insurance-policies', 'l-rk-bonds-guarantees'],
    src: 'Tanvir sir L5 new deck p13 (the four means, slide text) and p14 (the coverage table — a screenshot pasted into the deck, not a typed slide). A likely new question (not in any past paper).',
  },
  {
    id: 'a-rk-bond-execution',
    topic: T,
    q: 'What is a surety bond? What does a surety promise when it executes a bond, and who are the three parties involved?',
    seen: [],
    a: `### Bond
In suretyship, an obligation by which one party (surety or obligator) agrees to guarantee performance by another (principal) of a specified obligation for the benefit of a third person or entity (obligee).

A surety bond (or bond) is a **specialized credit mechanism** based on a **three-party relationship**: a surety company (surety or obligator) agrees to execute a bond on behalf of a contractor (the principal) for a project owner (the third party or obligee). The surety company is providing the **third-party financial guarantee** of performance or payment.

### Execution of bonds
When a surety executes a bond, it is making a **legally binding promise** that:
1. **Prequalification** — the contractor is **financially stable, technically capable, and reputable** enough to complete the contract.
2. **Backstop guarantee** — if the contractor defaults on its contractual obligations or fails to pay subcontractors/suppliers, the surety company will step in to finish the work or pay up to the bond’s **penal sum** (limit).

### The three parties involved
1. **Principal (contractor)** — the party obligated to perform the work.
2. **Obligee (owner)** — the **beneficiary** who requires the guarantee.
3. **Surety (bonding company)** — the financial institution guaranteeing the principal’s performance.`,
    keys: [
      'specialized credit mechanism',
      'three-party relationship',
      'third-party financial guarantee',
      'legally binding promise',
      'Prequalification',
      'financially stable, technically capable, and reputable',
      'Backstop guarantee',
      'penal sum',
      'Principal (contractor)',
      'Obligee (owner)',
      'beneficiary',
      'Surety (bonding company)',
    ],
    lists: ['l-rk-bond-promise', 'l-rk-bond-parties'],
    src: 'Tanvir sir L5 new deck p45–47 — a likely new question (not in any past paper). The sketch is built from the slide text; the deck has no drawing.',
    Fig: BondFig,
  },
  {
    id: 'a-rk-bond-loan',
    topic: T,
    q: 'Is a bond a loan? How does the surety recover the bond money it has paid?',
    seen: [],
    a: `### Is a bond a loan or money paid in case of default?
- A bond is money paid **only when a party defaults**, but once paid, it becomes an **absolute debt** that must be repaid by the contractor.
- Unlike insurance — where risk is **pooled** and the **insurer absorbs the loss** — a surety bond acts as a **contingent extension of credit**.
- If the surety pays a single dollar to the owner, the contractor legally owes that dollar back to the surety.

### How the surety recovers paid bond money
Before a surety company executes a single bond, it requires the contractor (and often the company’s owners personally) to sign a **General Indemnity Agreement** (GIA). This agreement provides the legal framework for recovery:
1. **Corporate indemnity** — the surety can freeze and claim the contractor’s corporate bank accounts, equipment, real estate, and project receivables.
2. **Personal guarantees** — owners (and often their spouses) usually sign personal guarantees; if the contractor company goes bankrupt, the surety can legally attach personal assets, including personal bank accounts, personal real estate, and investments.
3. **Intercept unpaid contract funds** — demand that the project owner pay any remaining, unbilled contract balances directly to the surety rather than to the defaulting contractor.
4. **Pursue third parties** — file lawsuits or claims against sub-consultants, sub-contractors, or architects whose errors may have caused the initial failure.
5. **Collateral security** — if a dispute arises while default claims are being evaluated, the GIA typically empowers the surety to demand collateral security (e.g. cash deposits or Letters of Credit) equal to the reserved loss amount, even before the formal claim payout occurs.

So professional liability insurance does not work the same way as a surety bond: an insurer absorbs the loss, while the contractor must repay the surety.`,
    keys: [
      'only when a party defaults',
      'absolute debt',
      'pooled',
      'insurer absorbs the loss',
      'contingent extension of credit',
      'General Indemnity Agreement',
      'Corporate indemnity',
      'Personal guarantees',
      'Intercept unpaid contract funds',
      'Pursue third parties',
      'Collateral security',
    ],
    lists: ['l-rk-gia-recovery'],
    src: 'Tanvir sir L5 new deck p48–49; Class Test 1 (b) this term tested it (PLI works like a surety bond: False). The slide says "three main mechanisms" but lists five.',
  },
  // ---------- contract risk and risk in general ----------
  {
    id: 'a-rk-contract-risk',
    topic: T,
    q: 'What are the (eight) ways / activities of dealing with contract risk?',
    seen: CR_SEEN,
    a: `1. **Execute the contract in a professional manner** — be quality oriented.
2. **Educate clients in using GCC to manage risk** — the **general conditions** of contract (GCC) serve as the framework for the legal and administrative relationship between the Employer (Client) and the Contractor. It clarifies who pays for site management, mobilization and demobilization cost, cost escalation due to inflation and price volatility, costs and time extension for unforeseen physical and geotechnical conditions, scope changes and work order variations, exceptional events and force majeure.
3. **Identify problems** — impose a fee premium or indemnification.
4. **Identify unavoidable/unacceptable risks** — for example, modification of existing structure, hazardous materials.
5. **Use the contract to close loopholes and avoid traps** — list services the client has declined.
6. **Establish extralegal conditions** — use dispute resolution (mediation/arbitration), reduce statute of limitations/repose, restrict damages.
7. **Develop clear contract language** — make sure that the contract is easily understood by the client.
8. **If a client is adamant about not taking prudent measures — walk away.**

Point 2 on the older slide (and in the 18-batch solve): "Thoroughly educate clients — use general conditions to cover costs."`,
    keys: [
      'professional manner',
      'quality oriented',
      'Educate clients',
      'GCC',
      'general conditions',
      'who pays',
      'Identify problems',
      'fee premium',
      'unavoidable/unacceptable risks',
      'close loopholes',
      'extralegal conditions',
      'mediation/arbitration',
      'clear contract language',
      'walk away',
    ],
    lists: ['l-rk-contract-risk', 'l-rk-gcc-pays'],
    src: 'Tanvir sir L5 p2–3; new deck p20–21 (point 2 rewritten this term). The question bank’s list (read the contract, prefer model forms, check insurability…) is not in the slides.',
  },
  {
    id: 'a-rk-general',
    topic: T,
    q: 'What general guidelines should be followed in dealing with risk?',
    seen: ['2023-24'],
    a: `### Prevent
- The most effective preventive approach is to **perform professionally** — not just execution of technical effort but eliminating misunderstanding and unrealistic expectations between civil engineers and their clients and other professionals.
- Very important three factors: a **good formal contract**, **good project management**, **knowledge of how to prevent risk events**.

### Transfer (only partly)
- Civil engineers can attempt to transfer risk via **insurance and/or indemnification** — professional liability insurance affords only partial transfer of risk; indemnification (full or partial) is also an imperfect mechanism.
- **Transferring all risks is impossible**: establish a **loss reserves** account by including risks in fees; understand and abide by the "rules of the road"; be careful in **selecting clients** and projects.

### Before proposing
Do **background research** on the client and the current project; critically evaluate the firm’s capability and experience; do not rely on past behavior or on assumptions.

### Before signing
Be sure the contract includes an appropriate clause, **explicit general conditions**, a **well-defined work-scope**, an accurate schedule and a clear budget.

### Other actions
Insist on an **adequate fee** or reduce work-scope (internal plan review, shop drawing review and construction monitoring should never be limited); add quality control; do not agree to deadlines that cannot be met; establish a **risk management program** — documentation is key; react quickly, maintain open lines of communication, use emotional intelligence.`,
    keys: [
      'perform professionally',
      'good formal contract',
      'good project management',
      'knowledge of how to prevent risk events',
      'insurance and/or indemnification',
      'Transferring all risks is impossible',
      'loss reserves',
      'selecting clients',
      'background research',
      'explicit general conditions',
      'well-defined work-scope',
      'adequate fee',
      'risk management program',
    ],
    lists: ['l-rk-three-factors', 'l-rk-before-proposing', 'l-rk-before-signing', 'l-rk-program'],
    src: 'Tanvir sir L5 p6–13; new deck p22–29',
  },
  {
    id: 'a-rk-elements',
    topic: T,
    q: 'What are the elements of risk management? Describe the two-phased approach.',
    seen: ['2015-16', '2012-13'],
    a: `Optimizing within tasks has led to sub-optimization of whole projects, so risk management as a **distinct activity** is gaining attention. Practitioners and researchers advocate a **two-phased approach using assessment and action**.

### Phase 1 — Assessment
1. **Identification** — the **most critical element**: risk cannot be managed if it is not identified.
2. **Analysis**
3. **Prioritisation**

### Phase 2 — Action
4. **Allocation** — **hold, avoid, reduce, transfer, share**.
5. **Monitoring & reporting**

*Draw as a tree: Risk management → Assessment (identification, analysis, prioritisation) and Action (allocation, monitoring & reporting).*`,
    keys: ['two-phased approach', 'assessment', 'action', 'Identification', 'most critical element', 'Analysis', 'Prioritisation', 'Allocation', 'hold, avoid, reduce, transfer, share', 'Monitoring & reporting'],
    lists: ['l-rk-elements', 'l-rk-allocation'],
    src: 'Tanvir sir L5 p17–18; new deck p31 (the new deck keeps only the tree — the two-phase sentence is in Lecture 05.pdf p17)',
    Fig: RiskTreeFig,
  },
  // ---------- insurance ----------
  {
    id: 'a-rk-defs',
    topic: T,
    q: 'Define liability insurance, professional liability insurance and bond.',
    seen: ['2022-23', '2014-15', '2012-13', '2011-12'],
    a: `### Liability insurance
A contract under which an insurance company agrees to **protect a person or entity against claims arising from real or alleged failure to fulfill an obligation or duty to a third party** who is an incidental beneficiary.

### Professional liability insurance
Insurance coverage for the insured professional’s **legal liability for claims arising out of damages sustained by others allegedly as a result of negligent acts, errors, or omissions in the performance of professional services**. It is an essential part of risk management.

### Bond
In suretyship, an **obligation** by which one party (**surety** or obligator) agrees to **guarantee performance** by another (**principal**) of a specified obligation for the benefit of a third person or entity (**obligee**).

A surety bond is a specialized credit mechanism based on a **three-party** relationship: a surety company agrees to execute a bond on behalf of a contractor (the principal) for a project owner (the obligee), providing the third-party financial guarantee of performance or payment.`,
    keys: ['protect a person or entity', 'obligation or duty to a third party', 'legal liability', 'negligent acts, errors, or omissions', 'professional services', 'suretyship', 'surety', 'guarantee performance', 'principal', 'obligee', 'three-party'],
    src: 'Tanvir sir L5 p20; new deck p32 (insurance), p45–46 (bond — the second paragraph is this term’s added slide)',
  },
  {
    id: 'a-rk-players',
    topic: T,
    q: 'Who are the principal players in the professional liability insurance industry and what are their roles?',
    seen: PLAYER_SEEN,
    a: `1. **Insureds** — those to whom a policy’s coverage is extended (e.g. the civil engineering firm).
2. **Insurance agents** — specialize in selling various types of insurance and obtain **commissions** based on their sales.
3. **Insurers** — insurance companies that **issue policies** and establish what policies do and do not cover, **limits, deductibles, and the premium**.
4. **Actuaries** — compute the **odds** that a given risk will materialize and the **probable cost** of the risk.
5. **Underwriters** — **evaluate each applicant** to determine the extent to which risks may occur and **what the premium should be**.
6. **Claims managers** — **advise insureds** on what course of action to take when a claim arises.
7. **Reinsurers** — those who **insure insurers**, providing both **back-up** (should a large claim be filed) and **stability** to the industry.

Insurance is outlined in a **policy (contract)** between the civil engineer (insured) and the insurance company, protecting the professional in case of **negligence**.`,
    keys: ['Insureds', 'Insurance agents', 'commissions', 'Insurers', 'issue policies', 'Actuaries', 'odds', 'probable cost', 'Underwriters', 'evaluate each applicant', 'premium', 'Claims managers', 'Reinsurers', 'insure insurers'],
    lists: ['l-rk-players'],
    src: 'Tanvir sir L5 p21–22; new deck p33–34',
  },
  {
    id: 'a-rk-pli-concerns',
    topic: T,
    q: 'What are the specific concerns for professional liability insurance?',
    seen: CONC_SEEN,
    a: `1. **Policy limits** — the more protection, the more expensive; find the **lowest practical amount of coverage**, considering what clients require.
2. **Deductible** — raising the limit is relatively less expensive than lowering the deductible; balance deductible, premium and coverage; a **new deductible with each claim**.
3. **Cost** — calculated individually by the **underwriter** from type of practice, geographical area, project mix, **claims history**, coverage needs and resulting risks to the insurer.
4. **Insurability** — PLI covers only the professionals it is bought for; owner-demanded **indemnities** and warranty-like **certificates** are not covered.
5. **Subconsultants** — primes face **vicarious liability** for subconsultants’ negligence, so review their policies for limits and gaps.
6. **Joint ventures** — legally like **partnerships**; one or all members can be held liable.
7. **Project professional liability insurance** — covers the **entire project team**; usually paid by owners.
8. **Expanded project delivery** — cover for designers in **design-build** or acting as developers, via **endorsements**.
9. **Claims** — made directly (a demand for money or services) or arising from subjective circumstances; check for **timely reporting** terms; know **barratry** (fomenting claims where none exist).

The question bank lists other concerns (claims-made basis, retroactive date, hammer clause) — not in the slides.`,
    keys: ['Policy limits', 'lowest practical amount', 'Deductible', 'Cost', 'underwriter', 'claims history', 'Insurability', 'Subconsultants', 'vicarious liability', 'Joint ventures', 'Project professional liability insurance', 'Expanded project delivery', 'Claims', 'timely reporting', 'barratry'],
    lists: ['l-rk-pli-concerns', 'l-rk-cost-drivers'],
    src: 'Tanvir sir L5 p26–30; new deck p38–42',
  },
  {
    id: 'a-rk-deductible',
    topic: T,
    q: 'Short note: Deductible.',
    seen: ['2012-13'],
    a: `The deductible is the share of each claim the insured firm pays itself before the insurer pays — a specific concern for professional liability insurance.

1. Usually, **raising a policy’s limit is relatively less expensive than lowering a deductible**.
2. There has to be a **balance among the deductible, premium, and level of coverage**,
3. considering that a **new deductible obligation occurs with each claim**.`,
    keys: ['raising a policy’s limit', 'less expensive than lowering a deductible', 'balance', 'premium', 'level of coverage', 'new deductible obligation', 'each claim'],
    src: 'Tanvir sir L5 p26; new deck p38 (the opening line explaining the word is not slide text)',
  },
  {
    id: 'a-rk-project-pli',
    topic: T,
    q: 'Short note: Project professional liability insurance.',
    seen: ['2012-13'],
    a: `1. Project insurance covers the **entire project team**, even those who **practice without insurance**.
2. **Owners usually pay** for project insurance when they desire coverage **beyond that normally carried by design firms**.
3. When the project scope is generally increased, it can provide a way to **cover consultants who could not otherwise obtain coverage**.`,
    keys: ['entire project team', 'practice without insurance', 'Owners usually pay', 'beyond that normally carried', 'cover consultants'],
    src: 'Tanvir sir L5 p29; new deck p41',
  },
  {
    id: 'a-rk-gli-epli',
    topic: T,
    q: 'Briefly discuss general liability insurance and employment practices liability insurance.',
    seen: GLI_SEEN,
    a: `In addition to professional liability insurance, a civil engineering firm may carry **additional liability insurance**:

### General liability insurance
- CE firms can be exposed to loss from other liability exposures such as **slips & falls**, **libel & slander** claims, and **property damage to third parties** arising from **office operations and nonprofessional activities at jobsites**.
- It usually covers claims involving **third-party liability** — **bodily injury, personal injury, property damage**, and so forth.
- It does **not cover professional, automobile, and workers’ compensation** exposures.

### Employment practices liability insurance
- In addition to sound management practices, some firms buy it to **protect against losses arising from employee charges of harassment, discrimination, and wrongful termination**.

Insurance may seem deceptively simple, but buying appropriate coverage is a **major business decision**. (The question bank says general liability covers the firm’s vehicles — the slide says automobile is not covered.)`,
    keys: ['slips & falls', 'libel & slander', 'property damage to third parties', 'nonprofessional activities', 'third-party liability', 'bodily injury', 'automobile', 'workers’ compensation', 'harassment', 'discrimination', 'wrongful termination'],
    lists: ['l-rk-gli-covers', 'l-rk-gli-excludes', 'l-rk-epli'],
    src: 'Tanvir sir L5 p31–32; new deck p43–44',
  },
  // ---------- bonds ----------
  {
    id: 'a-rk-bonds',
    topic: T,
    q: 'Briefly describe the common types of bonds (bid bond, performance bond, payment bond).',
    seen: BOND_SEEN,
    a: `**Bond** — in suretyship, an obligation by which the **surety** guarantees performance by the **principal** of a specified obligation for the benefit of the **obligee**. It is a specialized credit mechanism based on a **three-party** relationship: the surety company provides the third-party financial guarantee of performance or payment. Almost all contractors use **national surety companies**, which are subject to public regulation. The most common bonds are:

1. **Bid bond** — guarantees that **if a contractor is successful in winning a bid**, it will **enter into a contract within a specified period of time** and **furnish any required bonds**.
2. **Payment bond** — provides assurance that certain **payment obligations** associated with a construction project will be satisfied.
3. **Performance bond** — typically **delivered at the time the contract between the owner and contractor is signed**; it guarantees that the contractor will **perform the work in accordance with the contract documents**.

The **owner usually reserves the right to approve the surety company and the form of the bond**. The cost of a bond depends on the class of project, contract amount and contract format.`,
    keys: ['surety', 'principal', 'obligee', 'three-party', 'Bid bond', 'winning a bid', 'specified period of time', 'furnish any required bonds', 'Payment bond', 'payment obligations', 'Performance bond', 'contract documents', 'approve the surety company'],
    lists: ['l-rk-bonds', 'l-rk-bond-cost'],
    src: 'Tanvir sir L5 p20, p33–35; new deck p45–46, p50–51',
  },
  {
    id: 'a-rk-surety',
    topic: T,
    q: 'What are the most important aspects of the inquiry surety companies undertake before issuing bonds?',
    seen: SURETY_SEEN,
    a: `Before issuing bonds, surety companies usually undertake thorough investigations. The usual and most important aspects are:

1. **Essential characteristics of the project** under consideration — including size, type, and nature; identity of the owner and the owner’s **ability to pay**; contractor’s adequate resources, equipment, expertise, and experience.
2. **Total amount of bonded and unbonded uncompleted work** in the contractor’s current inventory, including work that has yet to be awarded — helps determine if the contractor’s working capital, equipment, and organization are becoming **overextended**.
3. **Adequacy of working capital and availability of credit** — substantiated by **financial reports**; may prevent the contractor from taking on too much work.
4. **Amount of money between the contractor’s bid and the next lowest bid** — what was "**left on the table**"; if the spread is more than **5 or 6 percent**, there is cause for concern about the soundness of the contractor’s bidding practices.
5. **Largest contract amount of similar work successfully undertaken and completed** — the surety is more comfortable if the contractor stays within its realm of expertise; for a new market sector it will advise starting with small projects.
6. **Terms of the contract and bonds required** — how the owner’s payments will be made, **retention**, time allotted for construction, **liquidated damages**, and required warranties: all affect the contractor’s ability to perform the work.
7. **Amount of work subcontracted and qualifications of the subcontractors** — they must possess the necessary organization, financial resources, and experience to carry out the work.

(Some books summarise this as "character, capacity, capital"; the slide gives these seven.)`,
    keys: ['Essential characteristics of the project', 'ability to pay', 'bonded and unbonded', 'overextended', 'working capital', 'availability of credit', 'next lowest bid', 'left on the table', '5 or 6 percent', 'similar work', 'Terms of the contract', 'retention', 'liquidated damages', 'subcontracted'],
    lists: ['l-rk-surety'],
    src: 'Tanvir sir L5 p36–38; new deck p52–54',
  },
  // ---------- fiduciary risk ----------
  {
    id: 'a-rk-fiduciary',
    topic: T,
    q: 'What is fiduciary risk? What are the three principles of managing it, and how do they feed into each other?',
    seen: FID_SEEN,
    a: `### Definition
Fiduciary risk may be defined as the risk that funds **are not used for the intended purposes**; **do not achieve value for money**; and/or **are not properly accounted for**.

It can be realized through **lack of capacity, competency or knowledge**; **bureaucratic inefficiency**; and/or **active corruption**. It is also the risk that a **trustee or other fiduciary** does not perform their duties or achieve the best value for the **beneficiary’s interests** — e.g. making **more trades than truly necessary**.

### Three mutually reinforcing principles
1. **Understanding** the fiduciary risk environment
2. **Mitigating** risks to the proper use of funds
3. **Monitoring** performance on an on-going basis

### How they feed into each other
- A good **understanding** of fiduciary risk beforehand helps the designer decide **whether any mitigating measures are required** to safeguard funds.
- **Monitoring progress reinforces understanding** and allows **remedial action to be taken quickly** if problems arise.
- The three should be undertaken on a **continuous and continuing basis**.

(The question bank treats fiduciary risk as the engineer accepting trustee duties in a contract — not the slide’s meaning.)`,
    keys: ['intended purposes', 'value for money', 'properly accounted for', 'lack of capacity', 'bureaucratic inefficiency', 'active corruption', 'trustee', 'Understanding', 'Mitigating', 'Monitoring', 'remedial action', 'continuous and continuing'],
    lists: ['l-rk-fid-causes', 'l-rk-fid-principles'],
    src: 'Tanvir sir L5 p40–42; new deck p56–58',
  },
]

export default { lists, cards, answers } satisfies PcTopicContent
