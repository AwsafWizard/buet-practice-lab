// ev-wsp — water safety plan: objectives, three major activities, steps and modules, hazards, likelihood × severity risk matrix (Rowshan ma'am L10).
import type { FC } from 'react'
import type { EvAnswer, EvCard, EvList, EvTopicContent } from '../types'

const T = 'ev-wsp' as const
const ink = 'var(--c-ink)'
const mute = 'var(--c-mute)'
const line = 'var(--c-line)'
const panel2 = 'var(--c-panel2)'
const accent = 'var(--c-accent)'
const bad = 'var(--c-bad)'
const good = 'var(--c-good)'

const Tx = ({ x, y, t, a = 'middle', b, c = ink, s = 11.5 }: { x: number; y: number; t: string; a?: 'start' | 'middle' | 'end'; b?: boolean; c?: string; s?: number }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fontWeight={b ? 700 : 400} fill={c}>
    {t}
  </text>
)

/** the flow chart of the major steps of a WSP (Bangladesh guideline) with its side boxes */
const FlowFig: FC = () => {
  const steps = [
    { t: 'Decision to have a WSP', s: 'management commitment' },
    { t: 'Step 1  Preparation', s: 'form the multidisciplinary WSP team, appoint a leader' },
    { t: 'Step 2  System assessment', s: 'describe the system, flow diagram, catchment to consumer' },
    { t: 'Step 3  Risk assessment', s: 'hazards and hazardous events, score, prioritise, controls' },
    { t: 'Step 4  Operational monitoring', s: 'monitor control measures, verify the WSP' },
    { t: 'Step 5  Management and communication', s: 'procedures, SOPs, emergency plans, documents' },
    { t: 'Steps 6 and 7  WSP application', s: 'implement, disseminate, train, review' },
  ]
  return (
    <svg viewBox="0 0 640 420" width="100%" role="img" aria-label="Major steps in developing and implementing a water safety plan">
      <defs>
        <marker id="ev-wsp-a" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ink} />
        </marker>
      </defs>
      {steps.map((s, i) => {
        const y = 8 + i * 58
        return (
          <g key={s.t}>
            <rect x={150} y={y} width={300} height={42} rx={6} fill={panel2} stroke={i === 0 || i === 6 ? good : accent} strokeWidth={2} />
            <Tx x={300} y={y + 18} t={s.t} b />
            <Tx x={300} y={y + 34} t={s.s} s={10.5} c={mute} />
            {i < 6 && <line x1={300} y1={y + 42} x2={300} y2={y + 58} stroke={ink} markerEnd="url(#ev-wsp-a)" />}
          </g>
        )
      })}
      {/* side boxes */}
      <rect x={490} y={170} width={142} height={44} rx={6} fill="none" stroke={bad} strokeDasharray="4 3" />
      <Tx x={561} y={188} t="System improvement" s={11} b c={bad} />
      <Tx x={561} y={204} t="(back to step 2)" s={10.5} />
      <path d="M450,150 H470 V190 H490" fill="none" stroke={bad} />
      <path d="M490,200 H470 V90 H450" fill="none" stroke={bad} markerEnd="url(#ev-wsp-a)" />
      <rect x={490} y={290} width={142} height={44} rx={6} fill="none" stroke={mute} strokeDasharray="4 3" />
      <Tx x={561} y={308} t="Supporting programmes" s={11} b />
      <Tx x={561} y={324} t="(training, SOPs, source protection)" s={10} />
      <line x1={490} y1={312} x2={450} y2={270} stroke={mute} />
      <line x1={490} y1={312} x2={450} y2={328} stroke={mute} />
      <rect x={8} y={170} width={128} height={44} rx={6} fill="none" stroke={mute} strokeDasharray="4 3" />
      <Tx x={72} y={188} t="Feedback / review" s={11} b />
      <Tx x={72} y={204} t="after incident; periodic" s={10.5} />
      <path d="M136,200 H150" stroke={mute} />
      <Tx x={320} y={414} t="Risk = Likelihood × Severity at step 3; the control loop of step 4 is monitor, compare, correct" s={10.5} c={mute} />
    </svg>
  )
}

const L_ROWS = ['Almost certain (5)', 'Likely (4)', 'Possible (3)', 'Unlikely (2)', 'Rare (1)']
const I_COLS = ['Insignificant (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Catastrophic (5)']
const band = (s: number) => (s <= 5 ? good : s <= 14 ? accent : bad)

/** the 5 × 5 semi-quantitative risk matrix, colour banded Low / Medium / High */
const MatrixFig: FC = () => (
  <svg viewBox="0 0 640 330" width="100%" role="img" aria-label="Risk matrix: likelihood against severity">
    <Tx x={330} y={16} t="Severity (impact) →" b />
    {I_COLS.map((c, j) => (
      <Tx key={c} x={170 + j * 92 + 46} y={36} t={c.replace(' (', ' ').replace(')', '')} s={10.5} />
    ))}
    <text x={14} y={170} fontSize={11.5} fontWeight={700} fill={ink} textAnchor="middle" transform="rotate(-90 14 170)">
      Likelihood
    </text>
    {L_ROWS.map((r, i) => {
      const L = 5 - i
      return (
        <g key={r}>
          <Tx x={160} y={72 + i * 46} t={r} a="end" s={10.5} />
          {I_COLS.map((c, j) => {
            const sc = L * (j + 1)
            return (
              <g key={c}>
                <rect x={170 + j * 92} y={46 + i * 46} width={90} height={44} rx={3} fill={band(sc)} opacity={0.35} stroke={band(sc)} />
                <Tx x={170 + j * 92 + 45} y={74 + i * 46} t={String(sc)} b s={13} />
              </g>
            )
          })}
        </g>
      )
    })}
    <rect x={170} y={290} width={14} height={14} fill={good} opacity={0.5} />
    <Tx x={190} y={302} t="Low: 5 or less" a="start" s={11} />
    <rect x={300} y={290} width={14} height={14} fill={accent} opacity={0.5} />
    <Tx x={320} y={302} t="Medium: 6 to 14" a="start" s={11} />
    <rect x={450} y={290} width={14} height={14} fill={bad} opacity={0.5} />
    <Tx x={470} y={302} t="High: 15 or more" a="start" s={11} />
    <Tx x={330} y={324} t="risk score = likelihood × severity" c={mute} s={11} />
  </svg>
)

const lists: EvList[] = [
  {
    id: 'l-wsp-objectives',
    topic: T,
    title: 'Objectives of a water safety plan',
    ask: 'What are the objectives of a Water Safety Plan?',
    points: [
      { k: 'Ensure water quality and safety', alt: ['ensure safe drinking water', 'overall objective'], d: 'the overall objective, from catchment to consumer' },
      { k: 'Identify hazards and the risk of each', alt: ['identify hazards', 'risk assessment'], d: 'that the supply is likely to be exposed to' },
      { k: 'Decide how each hazard will be controlled', alt: ['control of hazards', 'control measures'] },
      { k: 'Monitor the means of control', alt: ['monitoring', 'operational monitoring'] },
      { k: 'Define actions to restore control if it fails', alt: ['corrective action', 'restore control'] },
      { k: 'Verify the effectiveness of the WSP', alt: ['verification', 'verify effectiveness'] },
      { k: 'Shift from reactive testing to proactive prevention', alt: ['preventive approach', 'prevent contamination before it occurs', 'proactive prevention'] },
    ],
    hook: 'Ensure, Identify, Control, Monitor, Restore, Verify, Prevent.',
    seen: ['2015-16', '2016-17'],
    src: 'RM L10 p4, p7–8',
    note: 'The slides list the five things a WSP identifies (hazards and risk, control, monitoring, actions to restore control, verification) and say its overall objective is to ensure water quality and safety.',
  },
  {
    id: 'l-wsp-questions',
    topic: T,
    title: 'The three questions of risk management',
    points: [
      { k: 'What are the risks?', alt: ['risks'] },
      { k: 'How can the risks be controlled?', alt: ['control measures'] },
      { k: 'How to assess that the risks are under control?', alt: ['assess control', 'monitoring and verification'] },
    ],
    seen: [],
    src: 'RM L10 p7',
  },
  {
    id: 'l-wsp-traditional',
    topic: T,
    title: 'Weaknesses of the traditional approach (testing only)',
    points: [
      { k: 'Results are too little', alt: ['few samples'], d: 'few samples compared with the water produced' },
      { k: 'Results are too late', alt: ['late results'], d: 'preventive action is no longer possible' },
      { k: 'Not feasible to support preventive action', alt: ['not preventive'], d: 'reactive, not proactive' },
    ],
    seen: [],
    src: 'RM L10 p3',
  },
  {
    id: 'l-wsp-activities',
    topic: T,
    title: 'The three major activities in a WSP',
    ask: 'What are the three major activities in a Water Safety Plan?',
    ordered: true,
    points: [
      { k: 'System assessment', d: 'can the supply chain as a whole deliver water of acceptable quality; identify risks at each step; assess design of new systems' },
      { k: 'Identification of control measures', alt: ['control measures and monitoring', 'operational monitoring'], d: 'stop or eliminate the risks to meet targets, with operational monitoring of each measure' },
      { k: 'Management and communication plans', alt: ['management plans', 'communication plans'], d: 'actions in normal and incident conditions, documentation, upgrade planning, monitoring and reporting, supporting programmes' },
    ],
    hook: 'Assess, Control, Manage.',
    seen: ['Jan 2021', '2022-23', '2023-24'],
    src: 'RM L10 p9',
  },
  {
    id: 'l-wsp-steps',
    topic: T,
    title: 'Seven steps of developing a WSP (Bangladesh guideline)',
    ask: 'Briefly describe the 7 steps of developing a water safety plan.',
    ordered: true,
    points: [
      { k: 'Preparation', alt: ['Step 1: preparation', 'assemble the WSP team', 'formation of committee'], d: 'multidisciplinary team, team leader, senior management support' },
      { k: 'System assessment', alt: ['Step 2: system assessment', 'system description and analysis', 'describe the water supply system'], d: 'complete chain from catchment to consumer, flow diagram' },
      { k: 'Risk assessment', alt: ['Step 3: risk assessment', 'risk prioritization', 'risk assessment, prioritization and controls'], d: 'hazards, hazardous events, risk score, control measures, improvement plan' },
      { k: 'Operational monitoring', alt: ['Step 4: operational monitoring', 'monitoring'], d: 'monitor control measures and verify the WSP' },
      { k: 'Management and communication', alt: ['Step 5: management and communication', 'WSP management and operational procedure'], d: 'SOPs, incident and emergency procedures, supporting programmes' },
      { k: 'WSP application (providers prepare and implement)', alt: ['Step 6: WSP application', 'application of WSP'], d: 'providers prepare their WSP; WSP part of new and rehabilitation projects; WASAs pilot' },
      { k: 'WSP application (dissemination and support)', alt: ['Step 7: WSP application', 'dissemination'], d: 'awareness, DPHE support, training, update of the guideline' },
    ],
    hook: 'Prepare, Assess system, Assess risk, Monitor, Manage, Apply, Spread.',
    seen: ['2015-16', '2017-18', '2021-22', '2023-24'],
    src: 'RM L10 p12–13, p37–38',
    note: 'The slides title steps 6 and 7 both "WSP application". The WHO form has 10 modules (see the urban components list).',
  },
  {
    id: 'l-wsp-urban',
    topic: T,
    title: 'WSP components of an urban water supply (modules)',
    ask: 'List the steps for the development of a WSP for an urban area.',
    ordered: true,
    points: [
      { k: 'Assemble the team', alt: ['preparation', 'assemble the WSP team'] },
      { k: 'Describe the water supply system', alt: ['system description'] },
      { k: 'Identify hazards and hazardous events and assess the risks', alt: ['hazard identification and risk assessment'] },
      { k: 'Determine and validate control measures, reprioritise risks', alt: ['control measures', 'validate control measures'] },
      { k: 'Develop, implement and maintain an improvement / upgrade plan', alt: ['improvement plan', 'upgrade plan'] },
      { k: 'Define monitoring of the control measures', alt: ['operational monitoring'] },
      { k: 'Verify the effectiveness of the WSP', alt: ['verification'] },
      { k: 'Prepare management procedures', alt: ['management procedures'] },
      { k: 'Develop supporting programmes', alt: ['supporting programs'] },
      { k: 'Periodic review and revisit after an incident', alt: ['periodic review', 'feedback'] },
    ],
    hook: 'Team, Describe, Hazards, Controls, Improve, Monitor, Verify, Manage, Support, Review.',
    seen: ['2023-24'],
    src: 'RM L10 p10',
  },
  {
    id: 'l-wsp-small',
    topic: T,
    title: 'WSP for small water supplies: the six tasks',
    ordered: true,
    points: [
      { k: 'Engage the community and assemble a WSP team', alt: ['engage the community'] },
      { k: 'Describe the community water supply', alt: ['describe the water supply'] },
      { k: 'Identify and assess hazards, events and existing controls', alt: ['identify hazards'] },
      { k: 'Develop and implement an incremental improvement plan', alt: ['improvement plan'] },
      { k: 'Monitor controls and verify the WSP', alt: ['monitor and verify'] },
      { k: 'Document, review and improve all aspects of implementation', alt: ['document and review'] },
    ],
    seen: [],
    src: 'RM L10 p11',
  },
  {
    id: 'l-wsp-team',
    topic: T,
    title: 'Step 1: assembling the WSP team',
    points: [
      { k: 'Establish a multidisciplinary team with technical expertise', alt: ['multidisciplinary team'] },
      { k: 'Appoint a team leader and define roles and responsibilities', alt: ['team leader'] },
      { k: 'Engage senior management; identify external stakeholders and expertise', alt: ['senior management support'] },
    ],
    seen: [],
    src: 'RM L10 p13',
  },
  {
    id: 'l-wsp-describe',
    topic: T,
    title: 'Step 2: system description should include',
    points: [
      { k: 'Written description of all major process steps', alt: ['written description'] },
      { k: 'System flow diagrams', alt: ['flow diagram'] },
      { k: 'Description of intended users and uses of the water', alt: ['intended users and uses'] },
      { k: 'Compare quality standards with quality achieved', alt: ['compare targets with achieved quality'] },
    ],
    seen: [],
    src: 'RM L10 p14',
  },
  {
    id: 'l-wsp-likelihood',
    topic: T,
    title: 'Likelihood categories',
    ask: 'Describe the different categories of likelihood for determining risk scores.',
    ordered: true,
    points: [
      { k: 'Almost certain (5)', alt: ['almost certain'], d: 'expected in most circumstances; observed regularly; confirmed by data' },
      { k: 'Likely (4)', alt: ['likely'], d: 'will probably occur; observed occasionally; confirmed by data' },
      { k: 'Possible (3)', alt: ['possible'], d: 'might occur sometimes; no significant data trend' },
      { k: 'Unlikely (2)', alt: ['unlikely'], d: 'could occur at some time; not observed in the field' },
      { k: 'Rare (1)', alt: ['rare'], d: 'exceptional circumstances; no indication in data' },
    ],
    hook: '5 Almost certain, 4 Likely, 3 Possible, 2 Unlikely, 1 Rare.',
    seen: ['2015-16', '2017-18'],
    src: 'RM L10 p22',
  },
  {
    id: 'l-wsp-impact',
    topic: T,
    title: 'Severity (impact) categories',
    ask: 'Describe the different categories of impact (severity) for determining risk scores.',
    ordered: true,
    points: [
      { k: 'Insignificant (1)', alt: ['insignificant'], d: 'negligible impact on quality, service or operations' },
      { k: 'Minor (2)', alt: ['minor'], d: 'minor quality impact for a small percentage of consumers; manageable disruption' },
      { k: 'Moderate (3)', alt: ['moderate'], d: 'minor impact for a large percentage; more complaints; regulator interest; extra cost' },
      { k: 'Major (4)', alt: ['major'], d: 'major quality impact for a small percentage; many complaints; system compromised' },
      { k: 'Catastrophic (5)', alt: ['catastrophic'], d: 'major impact for a large percentage; illness in the community; litigation' },
    ],
    hook: '1 Insignificant, 2 Minor, 3 Moderate, 4 Major, 5 Catastrophic.',
    seen: ['2015-16', '2017-18'],
    src: 'RM L10 p22',
  },
  {
    id: 'l-wsp-bands',
    topic: T,
    title: 'Risk score bands',
    points: [
      { k: 'Low (green): 5 or less', alt: ['low', 'green'] },
      { k: 'Medium (yellow): 6 to 14', alt: ['medium', 'moderate', 'yellow'] },
      { k: 'High (red): 15 or more', alt: ['high', 'red'] },
    ],
    seen: ['2015-16', '2017-18'],
    src: 'RM L10 p23',
  },
  {
    id: 'l-wsp-monitor',
    topic: T,
    title: 'What effective monitoring establishes',
    points: [
      { k: 'What will be monitored', alt: ['what'] },
      { k: 'How it will be monitored', alt: ['how'] },
      { k: 'Timing or frequency', alt: ['when', 'frequency'] },
      { k: 'Where it will be monitored', alt: ['where'] },
      { k: 'Who will do the monitoring', alt: ['who monitors'] },
      { k: 'Who will do the analysis', alt: ['who analyses'] },
      { k: 'Who receives the results for action', alt: ['who gets results'] },
    ],
    seen: [],
    src: 'RM L10 p32',
  },
  {
    id: 'l-wsp-verify',
    topic: T,
    title: 'Three key actions of WSP verification',
    points: [
      { k: 'Compliance monitoring', d: 'water quality testing against standards' },
      { k: 'Auditing', alt: ['audit'], d: 'internal and external inspection that the WSP is complete, up to date and implemented' },
      { k: 'Consumer satisfaction', d: 'consumers are satisfied and not turning to less safe alternatives' },
    ],
    seen: [],
    src: 'RM L10 p33',
  },
  {
    id: 'l-wsp-mgmt',
    topic: T,
    title: 'Management procedures cover these conditions',
    points: [
      { k: 'Normal operational period', alt: ['normal operation'] },
      { k: 'Predictable incidents', alt: ['incidents'] },
      { k: 'Unforeseen events' },
      { k: 'Emergencies', alt: ['emergency'] },
    ],
    seen: [],
    src: 'RM L10 p35',
  },
  {
    id: 'l-wsp-docs',
    topic: T,
    title: 'Documentation of a WSP',
    points: [
      { k: 'Description and assessment of the system with upgrade programmes', alt: ['system description and assessment'] },
      { k: 'Plan for operational monitoring and verification', alt: ['monitoring and verification plan'] },
      { k: 'Management procedures for normal, incident and emergency situations', alt: ['management procedures'] },
      { k: 'Communication plan', alt: ['communication'] },
      { k: 'Description of supporting programmes', alt: ['supporting programs'] },
    ],
    seen: [],
    src: 'RM L10 p36',
  },
  {
    id: 'l-wsp-ccp',
    topic: T,
    title: 'Critical control points of a piped supply',
    points: [
      { k: 'Water quality at source', alt: ['source water quality'] },
      { k: 'Intake points', alt: ['intake'] },
      { k: 'Treatment units', alt: ['treatment'] },
      { k: 'Distribution system', d: 'leakage, unauthorised intervention, pressure' },
      { k: 'Storage reservoir', alt: ['reservoir'] },
      { k: 'Storage of water in houses and hygiene practice', alt: ['household storage'] },
    ],
    seen: [],
    src: 'RM L10 p21',
  },
  {
    id: 'l-wsp-support',
    topic: T,
    title: 'Supporting programmes include',
    points: [{ k: 'Training courses', alt: ['training'] }, { k: 'Standard operating procedures (SOP)', alt: ['SOP'] }, { k: 'Source protection protocol', alt: ['source protection'] }, { k: 'Risk map', alt: ['risk maps'] }, { k: 'Legal compliance programme', alt: ['legal aspects', 'compliance'] }],
    seen: [],
    src: 'RM L10 p40',
  },
]

const cards: EvCard[] = [
  { id: 'c-wsp-def', topic: T, front: 'What is a water safety plan?', back: 'A **comprehensive risk assessment and risk management approach** to ensure safe drinking water **from the source (catchment) to the consumer\'s tap**; WHO GDWQ introduced it. System-specific, and it exists and continues as long as the supply operates.', seen: ['2011-12', '2017-18'], src: 'RM L10 p2, p5, p8' },
  { id: 'c-wsp-reactive', topic: T, front: 'How does a WSP change water safety management?', back: 'From **reactive testing** (few, late results) to **proactive prevention**: it stops contamination before it happens rather than testing for it after it occurs.', src: 'RM L10 p3–4' },
  { id: 'c-wsp-origin', topic: T, front: 'From what concepts did WSPs evolve?', back: 'From **sanitary surveys and vulnerability assessment**, adding the principles of risk management for the whole supply system and its operation.', src: 'RM L10 p6' },
  { id: 'c-wsp-hazard', topic: T, front: 'Hazard vs hazardous event.', back: '**Hazard**: a biological, chemical, physical or radiological agent or condition with potential to cause harm (contamination), e.g. bacteria in a latrine pit. **Hazardous event**: the process by which the hazard enters the supply, e.g. bacteria travel through soil and contaminate a nearby tubewell.', src: 'RM L10 p18' },
  { id: 'c-wsp-model', topic: T, front: 'Source-pathway-receptor model?', back: 'To find hazardous events: the **source** of the hazard, the **receptor** (the water supply) and the **pathways** by which the hazard reaches it.', src: 'RM L10 p18' },
  { id: 'c-wsp-risk', topic: T, front: 'Define risk and severity; the risk formula.', back: 'Risk = likelihood of identified hazards causing harm to exposed people in a time frame, including its magnitude. Severity is judged by the number of people affected and the impact on them. **Risk = Likelihood × Severity**.', seen: ['2015-16', '2017-18'], src: 'RM L10 p17–18' },
  { id: 'c-wsp-describe-event', topic: T, front: 'How should a hazardous event be written?', back: '"**X happens (to the water supply) because of Y**", e.g. the source water is faecally contaminated (X) due to fertiliser use on crops and runoff during rains (Y).', src: 'RM L10 p24' },
  { id: 'c-wsp-initial', topic: T, front: 'Initial (raw) risk vs residual risk.', back: '**Initial** risk assessment ignores the controls already in place. After validating existing controls, **residual** risk is reassessed and shows where more control is needed.', seen: ['2017-18'], src: 'RM L10 p24, p27' },
  { id: 'c-wsp-control', topic: T, front: 'Control measure and validation.', back: '**Control measure**: an activity or process that prevents or eliminates a hazard or reduces it to an acceptable level (barrier, mitigation measure). **Validation**: obtaining evidence that the measure can effectively control the hazard.', src: 'RM L10 p26' },
  { id: 'c-wsp-prior', topic: T, front: 'How are risks acted on by priority?', back: 'High, very high or significant risks need validated controls urgently (or an improvement programme if none); **moderate or low** risks are documented and kept under regular review.', src: 'RM L10 p25' },
  { id: 'c-wsp-improve', topic: T, front: 'What is an incremental improvement plan?', back: 'Step-by-step improvements in risk management: some can be done at once at little or no cost, others need resources and time, so the plan allows for planning and funding.', src: 'RM L10 p29' },
  { id: 'c-wsp-monitoring', topic: T, front: 'Operational monitoring and corrective action.', back: 'Routine monitoring confirms that control measures work. A **corrective action** is taken when monitoring shows an actual or pending loss of control (critical limit exceeded). Monitoring and corrective actions form the **control loop**.', src: 'RM L10 p31–32' },
  { id: 'c-wsp-chlorine', topic: T, front: 'Example critical limit for chlorine in the monitoring table.', back: 'Residual chlorine at the plant outlet, 4 times daily, critical limit **below 0.2 mg/L or above 1.0 mg/L**; corrective action: adjust the dose as per SOP.', src: 'RM L10 p31' },
  { id: 'c-wsp-example-table', topic: T, front: 'Slide risk-table scores: catchment, treatment, distribution, household.', back: 'Cattle at the off-take 5×5 = **25 High**; chlorine under-dosing 4×5 = **20 High**; vermin in the tank 3×3 = **9 Medium**; insanitary household container 3×5 = 15 (printed M, but 15 is High in the matrix).', src: 'RM L10 p24' },
  { id: 'c-wsp-latrine', topic: T, front: 'Raw risk: pit latrine near a tubewell (the slide example).', back: 'Likelihood almost certain (5), impact major (4): score 5 × 4 = **20, High** (above 15). With a control (latrine more than 30 m away): likelihood rare (1), impact still major (4): **4, Low**; validate by water tests.', seen: ['2017-18'], src: 'RM L10 p19, p41–42' },
  { id: 'c-wsp-latrine-dist', topic: T, front: 'How does distance change the likelihood in the slide?', back: 'Pit latrine within **10 m** of a shallow tubewell: likelihood **high**. At **50 m**: **low**.', src: 'RM L10 p19' },
  { id: 'c-wsp-severity-ex', topic: T, front: 'Severity example: pathogen vs dissolved iron.', back: 'A pathogen can be **severe** (depending on the number of people served); dissolved iron with no health effect is **less severe** (only an aesthetic problem).', src: 'RM L10 p19' },
  { id: 'c-wsp-tools', topic: T, front: 'Tools for risk assessment, verification and validation.', back: 'System-specific **data collection tools**: sanitary inspection forms, field test kits, selected physico-chemical tests, used to find what risks exist and how hazards could enter and be controlled.', src: 'RM L10 p30' },
  { id: 'c-wsp-triggers', topic: T, front: 'What triggers a review of the WSP?', back: 'New activities in the catchment, new water supply infrastructure, updates to improvement plans, and incidents (revisit after an incident); also periodic review.', src: 'RM L10 p39' },
]

const answers: EvAnswer[] = [
  {
    id: 'a-wsp-def-flow',
    topic: T,
    q: 'What is a water safety plan? State (with brief description) the flow diagram to prepare a water safety plan.',
    seen: ['2011-12', '2017-18'],
    a: `### Water safety plan
A **WSP** is a **comprehensive risk assessment and risk management approach** to ensure safe drinking water **from the catchment to the consumer's tap**. It moves from reactive testing (few, late results) to **proactive prevention**, and is specific to each system.

### Flow diagram (steps in developing and implementing a WSP)
Decision to have a WSP, then:
1. **Preparation**: assemble a multidisciplinary WSP team with a leader and senior management support.
2. **System assessment**: describe the supply chain from catchment to consumer with a flow diagram.
3. **Risk assessment, prioritisation and controls**: identify hazards and hazardous events, score the risk (likelihood × severity), determine and validate control measures, reassess and prioritise; a **system improvement** plan feeds back to step 2.
4. **Operational monitoring**: monitor the control measures and verify the WSP, with corrective action.
5. **Management and communication**: procedures for normal, incident and emergency conditions, supporting programmes, documentation.
6. and 7. **WSP application**: the provider implements it, awareness, training and support (DPHE), and periodic review and feedback after incidents.`,
    keys: ['comprehensive risk assessment', 'catchment to the consumer', 'proactive prevention', 'Preparation', 'System assessment', 'Risk assessment', 'Operational monitoring', 'Management and communication', 'WSP application', 'system improvement'],
    lists: ['l-wsp-steps'],
    src: 'RM L10 p2–5, p12',
    Fig: FlowFig,
  },
  {
    id: 'a-wsp-objectives',
    topic: T,
    q: 'What are the objectives of a Water Safety Plan?',
    seen: ['2015-16', '2016-17'],
    a: `### Objectives of a WSP
1. The **overall objective** is to **ensure water quality and safety** for the consumer (from the catchment to the tap).
2. To **identify the hazards** the supply is likely to be exposed to and the **level of risk** of each.
3. To decide **how each hazard will be controlled** (control measures).
4. To set **how the means of control will be monitored** (operational monitoring).
5. To define **what actions restore control** if it fails (corrective action, incident and emergency response).
6. To **verify the effectiveness** of the WSP (compliance testing, audit, consumer satisfaction).
7. To **shift from reactive testing to proactive prevention**, stopping contamination before it occurs, and to drive continual improvement through upgrade plans and review.`,
    keys: ['ensure water quality and safety', 'identify the hazards', 'level of risk', 'control', 'monitored', 'restore control', 'verify the effectiveness', 'proactive prevention'],
    lists: ['l-wsp-objectives'],
    src: 'RM L10 p3–8',
  },
  {
    id: 'a-wsp-activities',
    topic: T,
    q: 'What are the three major activities in a Water Safety Plan?',
    seen: ['Jan 2021', '2022-23', '2023-24'],
    a: `### The three major activities
1. **System assessment**: determine whether the drinking water supply chain as a whole (up to the point of consumption) **can deliver water of acceptable quality**, including **identification of risks** at each step; also assessing the design criteria of new systems.
2. **Identification of control measures**: identify measures to **stop or eliminate the identified risks** and ensure water quality targets are met; for each, define **operational monitoring** that detects deviation quickly.
3. **Management and communication plans**: describe the actions in **normal operation and incident conditions**, and document the system assessment, **upgrade and improvement planning**, monitoring and reporting plans and **supporting programmes**.`,
    keys: ['System assessment', 'acceptable quality', 'identification of risks', 'Identification of control measures', 'operational monitoring', 'Management and communication plans', 'incident conditions', 'supporting programmes'],
    lists: ['l-wsp-activities'],
    src: 'RM L10 p9',
  },
  {
    id: 'a-wsp-steps',
    topic: T,
    q: 'Describe the steps of the water safety plan process with a flow diagram (7 steps; steps for an urban area; major steps for BUET campus).',
    seen: ['2015-16', '2017-18', '2021-22', '2023-24'],
    a: `### Steps (Bangladesh guideline)
1. **Preparation**: multidisciplinary team, team leader, roles and the support of senior management.
2. **System assessment**: describe the supply from catchment to consumer: process steps, flow diagrams, users and uses, standards against quality achieved.
3. **Risk assessment**: identify **hazards and hazardous events** at each step, assess risk by **likelihood × severity**, determine and validate **control measures**, reassess the residual risk, prioritise, and prepare an **improvement / upgrade plan**.
4. **Operational monitoring**: define what, where, when, how and who for each control measure, with **critical limits** and **corrective actions**; **verify** the WSP (compliance monitoring, auditing, consumer satisfaction).
5. **Management and communication**: **SOPs** for normal, incident and emergency conditions, supporting programmes (training, source protection), documentation.
6. **WSP application**: providers prepare and implement their WSP, management commitment, a part of every new project, pilots by the WASAs.
7. **WSP application (dissemination)**: awareness, DPHE support and guidance, training, update of the guideline.
Plus **periodic review** and revisit after incidents (feedback loop).

### For an urban system (module form)
Assemble the team; describe the system; identify hazards and assess risks; determine and validate control measures and prioritise; improvement plan; monitoring of controls; verify effectiveness; management procedures; supporting programmes.

### Applying it to the BUET campus
Team (CE staff, estate and campus health officers); system (deep tubewells or WASA supply, overhead tanks, distribution, department storage and taps); hazards (arsenic and iron in the source, leaking pipes and cross connection, dirty tanks, chlorine under-dosing, household containers); score them; controls (chlorination, tank cleaning, sanitary inspection); monitor residual chlorine and tank hygiene; review yearly.`,
    keys: ['Preparation', 'System assessment', 'Risk assessment', 'hazards and hazardous events', 'likelihood × severity', 'control measures', 'Operational monitoring', 'critical limits', 'corrective actions', 'Management and communication', 'WSP application', 'periodic review'],
    lists: ['l-wsp-steps', 'l-wsp-urban', 'l-wsp-team', 'l-wsp-describe'],
    src: 'RM L10 p10–16, p24–40; BUET paragraph: judgement',
    Fig: FlowFig,
  },
  {
    id: 'a-wsp-risk-cat',
    topic: T,
    q: 'Describe the different categories of likelihood and impact for determining risk scores for a WSP. State the semi-quantitative risk scoring (risk matrix) system.',
    seen: ['2015-16', '2017-18'],
    a: `### Risk score
**Risk = Likelihood × Severity (impact)**, each rated 1 to 5, so the score runs from 1 to 25.

### Likelihood categories
1. **Almost certain (5)**: expected in most circumstances; observed regularly in the field; confirmed by data.
2. **Likely (4)**: will probably occur; observed occasionally; confirmed by data.
3. **Possible (3)**: might occur sometimes; no significant data trend.
4. **Unlikely (2)**: could occur at some time; not observed in the field.
5. **Rare (1)**: exceptional circumstances; data show no risk.

### Impact (severity) categories
1. **Insignificant (1)**: negligible effect on quality, service or operations.
2. **Minor (2)**: minor quality impact for a small share of consumers; manageable disruption.
3. **Moderate (3)**: minor impact for a large share of consumers; more complaints, regulator interest, extra cost.
4. **Major (4)**: major impact for a small share; many complaints; system compromised.
5. **Catastrophic (5)**: major impact for a large share; illness in the community; litigation.

### Risk matrix (bands)
| Likelihood \\ Impact | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Almost certain 5 | 5 | 10 | 15 | 20 | 25 |
| Likely 4 | 4 | 8 | 12 | 16 | 20 |
| Possible 3 | 3 | 6 | 9 | 12 | 15 |
| Unlikely 2 | 2 | 4 | 6 | 8 | 10 |
| Rare 1 | 1 | 2 | 3 | 4 | 5 |

**Low (green)**: 5 or less; **Medium (yellow)**: 6 to 14; **High (red)**: 15 or more. High risks need urgent validated controls or an improvement programme; medium and low are documented and reviewed.`,
    keys: ['Likelihood × Severity', 'Almost certain', 'Likely', 'Possible', 'Unlikely', 'Rare', 'Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic', 'Low', 'Medium', 'High'],
    lists: ['l-wsp-likelihood', 'l-wsp-impact', 'l-wsp-bands'],
    src: 'RM L10 p22–23, p25',
    Fig: MatrixFig,
  },
  {
    id: 'a-wsp-risk-example',
    topic: T,
    q: 'For a tubewell-based rural community supply, leaching from a pit latrine is a hazardous event. Determine the risk score and risk category.',
    seen: ['2017-18'],
    a: `### Raw risk (no control measure)
1. **Risk = Likelihood × Impact**. Ignore existing control measures (the distance between latrine and tubewell).
2. Without an adequate distance (more than 10 m) leaching from the pit is very likely to contaminate the well water regularly: likelihood **almost certain = 5**.
3. The water is contaminated with pathogens that can spread water-borne disease among the community: impact **major = 4**.
4. **Risk score = 5 × 4 = 20**, which is above 15, so the risk category is **High** (red).

### Residual risk (for comparison)
With the latrine more than 30 m away: likelihood **rare = 1**, impact still **major = 4** (if pathogens reach the well they still spread disease): score $1 \\times 4 = 4$, category **Low**. The control reduces the risk significantly, but its effectiveness must be validated by periodic water quality tests.`,
    keys: ['Likelihood × Impact', 'almost certain', '5 × 4 = 20', 'High', 'major', 'Residual', 'Low', 'validated'],
    lists: ['l-wsp-likelihood', 'l-wsp-impact', 'l-wsp-bands'],
    src: 'RM L10 p41–42',
    Fig: MatrixFig,
  },
]

export default { lists, cards, answers } satisfies EvTopicContent
