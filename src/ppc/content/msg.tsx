// pc-msg — preparing effective business messages (Noor sir's L08 slide, 15 pages). Asked in our papers only in
// Jan 2021 Q4(a); the seniors' list adds 2010-11 Q1(b)(i) and Q3(b). Ids moved here from writing.ts unchanged.
import type { FC } from 'react'
import type { PcTopicContent } from '../types'

const T = 'pc-msg' as const
const S8 = 'Noor sir L08 slides (Preparing Effective Business Messages)'
const SH = '18-batch solve (Shafi) copies the same bullets'

function Box({ x, y, w, h, t, strong = false }: { x: number; y: number; w: number; h: number; t: string[]; strong?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="var(--c-panel2)" stroke={strong ? 'var(--c-aan)' : 'var(--c-line)'} strokeWidth={strong ? 2 : 1.3} />
      {t.map((s, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + 4 - ((t.length - 1) * 14) / 2 + i * 14} textAnchor="middle" fontSize={12} fill="var(--c-ink)">
          {s}
        </text>
      ))}
    </g>
  )
}
const Arrow = ({ d }: { d: string }) => <path d={d} fill="none" stroke="var(--c-mute)" strokeWidth={1.4} markerEnd="url(#pc-msg-arr)" />
const Defs = () => (
  <defs>
    <marker id="pc-msg-arr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--c-mute)" />
    </marker>
  </defs>
)

const STEPS = [['1. Identifying', 'purpose'], ['2. Analyzing', 'audience'], ['3. Choosing', 'ideas'], ['4. Collecting data', 'to support ideas'], ['5. Organizing', 'the message']]

/** the five planning steps, in order, then the draft */
const PlanningFig: FC = () => (
  <svg viewBox="0 0 620 120" width="100%" role="img" aria-label="Planning steps for a business message: purpose, audience, ideas, data, organizing, then the first draft">
    <Defs />
    {STEPS.map((t, i) => (
      <g key={i}>
        <Box x={4 + i * 122} y={10} w={106} h={48} t={t} strong={i === 0} />
        {i < STEPS.length - 1 && <Arrow d={`M${110 + i * 122},34 H${124 + i * 122}`} />}
      </g>
    ))}
    <Arrow d="M545,58 V78 H310 V86" />
    <Box x={200} y={86} w={220} h={28} t={['Compose: draft → revise → edit → proofread']} />
  </svg>
)

/** direct vs indirect plan: the order of a message under each */
const ApproachFig: FC = () => (
  <svg viewBox="0 0 620 196" width="100%" role="img" aria-label="Direct (deductive) message: main idea or best news, explanatory details, friendly closing. Indirect (inductive): neutral opening and reasons, then the bad news or the request, then a positive close with goodwill">
    <Defs />
    <text x={4} y={16} fontSize={12} fontWeight={700} fill="var(--c-aan)">
      DIRECT / DEDUCTIVE — favorable or neutral reaction (direct request, good news)
    </text>
    <Box x={4} y={26} w={180} h={46} t={['Main ideas or', 'best news']} strong />
    <Arrow d="M184,49 H214" />
    <Box x={216} y={26} w={190} h={46} t={['All necessary', 'explanatory details']} />
    <Arrow d="M406,49 H436" />
    <Box x={438} y={26} w={178} h={46} t={['Appropriate', 'friendly closing']} />
    <text x={4} y={108} fontSize={12} fontWeight={700} fill="var(--c-aan)">
      INDIRECT / INDUCTIVE — persuasive request, bad news
    </text>
    <Box x={4} y={118} w={180} h={46} t={['Attention-getting /', 'neutral opening, reasons']} />
    <Arrow d="M184,141 H214" />
    <Box x={216} y={118} w={190} h={46} t={['The request or', 'the bad news']} strong />
    <Arrow d="M406,141 H436" />
    <Box x={438} y={118} w={178} h={46} t={['Positive close,', 'goodwill']} />
    <text x={310} y={188} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
      The slide gives the direct order; the indirect order is the seniors’ note (the slide gives its two situations).
    </text>
  </svg>
)

export default {
  lists: [
    {
      id: 'l-msg-planning',
      topic: T,
      title: 'Planning steps for preparing effective business messages',
      ask: 'What are the planning steps for preparing effective business messages?',
      ordered: true,
      points: [
        { k: 'Identifying purpose', alt: ['purpose', 'identify the purpose', 'identifying your purpose'], d: 'To provide information, to persuade, to negotiate, to refuse a request; transmit the message clearly, simultaneously creating goodwill.' },
        { k: 'Analyzing audience', alt: ['audience', 'analyse the audience', 'analysing audience', 'anticipate audience'], d: 'Adapt the message to the receiver’s views, attitudes, needs, culture.' },
        { k: 'Choosing ideas', alt: ['ideas', 'choose ideas', 'choosing idea'], d: 'List ideas as they come; choose ideas likely to get a desired response; depends on type of message, background of the receiver, location of receiver.' },
        { k: 'Collecting data to support ideas', alt: ['collect data', 'data', 'research', 'collecting data'], d: 'Facts, figures, quotations, any evidence; check and verify names of individuals, dates, addresses, statistics.' },
        { k: 'Organizing the message', alt: ['organising', 'organize', 'organise the message', 'outline'], d: 'Ordering of ideas; as important as the ideas themselves; outline the message on paper before writing the draft; disorganized messages look careless, unimportant, confusing.' },
      ],
      hook: '**P**lease **A**sk **I**f **D**ata’s **O**K — Purpose, Audience, Ideas, Data, Organizing.',
      seen: ['Jan 2021'],
      src: `${S8}; ${SH} (Jan 2021 Q4a)`,
    },
    {
      id: 'l-msg-purposes',
      topic: T,
      title: 'Purposes a message may have',
      points: [
        { k: 'To provide information', alt: ['information', 'inform'] },
        { k: 'To persuade', alt: ['persuade', 'persuasion'] },
        { k: 'To negotiate', alt: ['negotiate', 'negotiation'] },
        { k: 'To refuse a request', alt: ['refuse', 'refusal'] },
      ],
      hook: '**I** **P**romise **N**o **R**efunds — Inform, Persuade, Negotiate, Refuse.',
      seen: ['Jan 2021'],
      src: S8,
      note: 'It is important to transmit a message clearly, simultaneously creating goodwill.',
    },
    {
      id: 'l-msg-adapt',
      topic: T,
      title: 'The message must be adapted to the receiver’s …',
      ask: 'To get the desired response from the receiver, the message must be adapted to the receiver’s …?',
      points: [{ k: 'Views' }, { k: 'Attitudes', alt: ['attitude'] }, { k: 'Needs', alt: ['need'] }, { k: 'Culture' }],
      hook: '**V-A-N-C** — the receiver’s **VAN** of **C**ulture.',
      seen: ['Jan 2021'],
      src: S8,
    },
    {
      id: 'l-msg-audience',
      topic: T,
      title: 'Aspects of the receiver to analyze when sending a message',
      ask: 'Describe the issues to consider when analyzing your audience.',
      points: [
        { k: 'Professional background', alt: ['background'] },
        { k: 'Position in the company', alt: ['position', 'professional position', 'status'] },
        { k: 'Gender', alt: ['sex', 'age and sex'] },
        { k: 'Age' },
        { k: 'Educational level', alt: ['education'] },
        { k: 'Knowledge, attitude, cultural values', alt: ['knowledge', 'attitude', 'culture', 'cultural values'] },
      ],
      hook: 'Read the receiver’s **CV**: background, post, gender, age, degree — then their head (knowledge), heart (attitude) and roots (cultural values).',
      seen: ['Jan 2021'],
      src: `${S8}; ${SH} (Jan 2021 Q4a)`,
      note: 'Six separate aspects. Kabirul sir’s slide (the 18-batch solve) says “Sex”; Noor sir’s says “Gender”. Add: when writing to a business, organization, or country, it is essential to know the communication principles of the organization, business, or country.',
    },
    {
      id: 'l-msg-approach',
      topic: T,
      title: 'Organizational plans (approaches) for composing a message',
      points: [
        { k: 'Direct or deductive', alt: ['direct', 'deductive', 'direct (deductive)'], d: 'Receiver will have a favorable or neutral reaction: begin with the main ideas or best news → explanatory details → friendly closing.' },
        { k: 'Indirect or inductive', alt: ['indirect', 'inductive', 'indirect (inductive)'], d: 'Persuasive request or bad news — the reader must be convinced or may react negatively.' },
      ],
      seen: [],
      src: `${S8} — asked 2010-11 Q3(b) (Rahat’s question list)`,
    },
    {
      id: 'l-msg-direct-plan',
      topic: T,
      title: 'How a direct (deductive) message runs',
      ordered: true,
      points: [
        { k: 'Begin with the main ideas or best news', alt: ['main idea', 'best news', 'main ideas'] },
        { k: 'Include all necessary explanatory details', alt: ['explanatory details', 'details'], d: 'After the opening, in one or several paragraphs.' },
        { k: 'End with an appropriate friendly closing', alt: ['friendly closing', 'closing', 'friendly close'] },
      ],
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-direct-situations',
      topic: T,
      title: 'Two situations when the direct approach is used',
      points: [
        { k: 'Direct request', d: 'The main purpose of the message is to make a request; the request by its very nature should require little persuasion.' },
        { k: 'Good news', d: 'Used to grant requests; announce favorable or neutral information; exchange routine information between companies.' },
      ],
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-indirect-situations',
      topic: T,
      title: 'Two situations when the indirect approach is used',
      points: [
        { k: 'Persuasive request', d: 'The request by its very nature would require extensive persuasion and convincing; use attention-getting statements to induce the receiver to read further; make clear the what, why, how, where and when of the request.' },
        { k: 'Bad news', d: 'Used to deny requests; announce unfavorable or negative information; difficult to prepare as the reader may react negatively.' },
      ],
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-beginnings-endings',
      topic: T,
      title: 'Beginnings and endings of a message',
      points: [
        { k: 'Main favorable ideas at beginning and end', alt: ['placement', 'favorable ideas', 'favourable ideas'] },
        { k: 'Beginning gets reader immediately into opening thought', alt: ['opening thought', 'beginning'] },
        { k: 'Emphasize the reader, focus on positive aspects', alt: ['emphasize the reader', 'positive aspects', 'positive'] },
        { k: 'Ending focuses on desired action, leaves goodwill', alt: ['desired action', 'goodwill', 'ending'] },
        { k: 'Ending reinforces central purpose of the message', alt: ['central purpose', 'reinforce'] },
        { k: 'Show appreciation and offer to help further', alt: ['appreciation', 'offer to help'] },
      ],
      hook: 'Open on the **reader** and the **positive**; close on **action**, **goodwill**, the **purpose**, and **thanks + help**.',
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-composing',
      topic: T,
      title: 'Composing the message (four stages)',
      ordered: true,
      points: [
        { k: 'Drafting', alt: ['draft', 'drafting the message'], d: 'After completing the planning steps, get the whole message on paper: the first draft.' },
        { k: 'Revising', alt: ['revise', 'revising the message'], d: 'Evaluate content, organization, and style of the draft.' },
        { k: 'Editing', alt: ['edit', 'editing the message'], d: 'Check all paragraphs: topic sentences, sentence structure, grammar, spelling, punctuation, effectiveness.' },
        { k: 'Proofreading', alt: ['proofread', 'proofreading the message'], d: 'Ensure there are no errors; even minor errors reduce the effectiveness of the message and undermine credibility.' },
      ],
      hook: '**D**on’t **R**ush **E**very **P**age.',
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-revising',
      topic: T,
      title: 'Steps (questions) when revising a message',
      ordered: true,
      points: [
        { k: 'Does the message accomplish its purpose?', alt: ['purpose', 'accomplish its purpose'] },
        { k: 'Is the organizational plan effective?', alt: ['organizational plan', 'organisation'] },
        { k: 'Are points supported by adequate material?', alt: ['adequate material', 'supported'] },
        { k: 'Is language complete, concise, considerate, concrete, clear, courteous?', alt: ['language', 'seven Cs', '7 Cs', 'complete concise considerate concrete clear courteous'] },
        { k: 'Is there variety in sentence structure?', alt: ['variety', 'sentence structure'] },
        { k: 'Delete unnecessary, include additional material', alt: ['delete unnecessary material', 'additional material'], d: 'Delete unnecessary material and include additional material if needed.' },
      ],
      hook: 'Purpose → Plan → Proof (material) → Language (six C’s) → Sentences → Cut and add.',
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-editing',
      topic: T,
      title: 'What to check when editing a message',
      points: [
        { k: 'Good topic sentences', alt: ['topic sentences', 'topic sentence'] },
        { k: 'Sound sentence structure', alt: ['sentence structure'] },
        { k: 'Correct grammar', alt: ['grammar'] },
        { k: 'Spelling' },
        { k: 'Punctuation' },
        { k: 'Effectiveness of the message', alt: ['effectiveness'] },
      ],
      hook: '**T**he **S**ub-editor **G**ets **S**pelling, **P**unctuation, **E**verything — Topic sentences, Sentence structure, Grammar, Spelling, Punctuation, Effectiveness.',
      seen: [],
      src: S8,
    },
    {
      id: 'l-msg-ideas',
      topic: T,
      title: 'Ideas included in the message depend on …',
      ask: 'How do you choose the ideas for a business message?',
      points: [
        { k: 'Type of message', alt: ['type', 'kind of message'] },
        { k: 'Background of the receiver', alt: ['background', 'receiver background'] },
        { k: 'Location of receiver', alt: ['location', 'where the receiver is'] },
      ],
      seen: [],
      src: S8,
      note: 'Begin by listing ideas as they come to you; choose ideas that are likely to get a desired response from the receiver.',
    },
    {
      id: 'l-msg-data',
      topic: T,
      title: 'To support your message, determine the requirement for specific …',
      points: [{ k: 'Facts', alt: ['fact'] }, { k: 'Figures', alt: ['figure', 'numbers'] }, { k: 'Quotations', alt: ['quotation', 'quotes'] }, { k: 'Any evidence', alt: ['evidence'] }],
      hook: '**F**resh **F**ish, **Q**uickly **E**aten — Facts, Figures, Quotations, Evidence.',
      seen: ['Jan 2021'],
      src: S8,
    },
    {
      id: 'l-msg-verify',
      topic: T,
      title: 'Necessary to check and verify data regarding …',
      points: [{ k: 'Names of individuals', alt: ['names', 'name'] }, { k: 'Dates', alt: ['date'] }, { k: 'Addresses', alt: ['address'] }, { k: 'Statistics', alt: ['statistic', 'stats'] }],
      hook: '**N**o **D**ata **A**ccepted **S**ilently — Names, Dates, Addresses, Statistics.',
      seen: ['Jan 2021'],
      src: S8,
    },
  ],

  cards: [
    { id: 'c-msg-goodwill', topic: T, front: 'Whatever the purpose, how must a business message be transmitted?', back: '**Clearly**, and **simultaneously creating goodwill**.', src: S8 },
    { id: 'c-msg-principles', topic: T, front: 'What must you know when writing to a business, organization, or country?', back: 'The **communication principles** of the organization, business, or country.', seen: ['Jan 2021'], src: S8 },
    { id: 'c-msg-disorganized', topic: T, front: 'Why organize a message — what do disorganized messages look like?', back: 'Organization (ordering of ideas) is **as important as the ideas themselves**; first step: **outline the message on paper before writing the draft**. Disorganized messages look **careless, unimportant, confusing**.', src: S8 },
    { id: 'c-msg-direct', topic: T, front: 'When is the **direct (deductive)** approach used, and how does it run?', back: 'When you think the receiver will have a **favorable or neutral reaction**. **Begin with the main ideas or best news** → after the opening, all necessary **explanatory details** in one or several paragraphs → end with an appropriate **friendly closing**. Situations: **direct request**, **good news**.', src: S8 },
    { id: 'c-msg-indirect', topic: T, front: 'When is the **indirect (inductive)** approach used?', back: 'Two situations: a **persuasive request** (needs extensive persuasion and convincing — attention-getting statements; make clear the what, why, how, where and when) and **bad news** (deny requests, announce unfavorable or negative information — the reader may react negatively).', src: S8 },
    { id: 'c-msg-proofreading', topic: T, front: 'Why **proofread** a message?', back: 'To ensure there are **no errors** — even minor errors can **reduce the effectiveness** of the message and **undermine credibility**.', src: S8 },

    { id: 'c-msg-choose-ideas', topic: T, front: 'How do you **choose the ideas** for a message?', back: '**Begin by listing ideas as they come to you**; choose ideas that are **likely to get a desired response** from the receiver. The ideas depend on the type of message, background of the receiver and location of receiver.', src: S8 },
    { id: 'c-msg-placement', topic: T, front: 'Where are the **main favorable ideas** generally placed in a message?', back: 'At the **beginning and the end** of the message.', src: S8 },
    { id: 'c-msg-draft', topic: T, front: 'What is **drafting** a message?', back: 'After completing the planning steps, **get the whole message on paper**: the **first draft**.', src: S8 },
    { id: 'c-msg-revise-what', topic: T, front: 'What do you evaluate when **revising** a message?', back: 'The **content, organization, and style** of the draft.', src: S8 },
  ],

  answers: [
    {
      id: 'a-writing-business-messages',
      topic: T,
      q: 'What are the planning steps for preparing effective business messages? Describe the issues to consider when analysing your audience.',
      seen: ['Jan 2021'],
      a: `### Planning steps
The planning steps for preparing effective business messages are given below:
1. **Identifying purpose** — to provide information, to persuade, to negotiate, to refuse a request; the message must be transmitted clearly, simultaneously creating goodwill.
2. **Analyzing audience**
3. **Choosing ideas** — list ideas as they come; choose ideas likely to get a desired response; they depend on the type of message, background of the receiver and location of receiver.
4. **Collecting data to support ideas** — facts, figures, quotations, any evidence; check and verify names of individuals, dates, addresses, statistics.
5. **Organizing the message** — ordering of ideas; outline the message on paper before writing the draft; disorganized messages look careless, unimportant, confusing.

### Issues to consider when analyzing the audience
**1.** To get the **desired response** from the receiver of the message, the message must be adapted to the receiver’s **views, attitudes, needs, culture**.

**2.** The following aspects of the receiver of a message must be analyzed when sending a message:
- **Professional background**
- **Position in the company**
- **Gender** (sex)
- **Age**
- **Educational level**
- **Knowledge, attitude, cultural values**

**3.** When writing to a business, organization, or country, it is essential to know the **communication principles** of the organization, business, or country.`,
      keys: ['Identifying purpose', 'Analyzing audience', 'Choosing ideas', 'Collecting data to support ideas', 'Organizing the message', 'desired response', 'views, attitudes, needs, culture', 'Professional background', 'Position in the company', 'Gender', 'Educational level', 'Knowledge, attitude, cultural values', 'communication principles'],
      lists: ['l-msg-planning', 'l-msg-purposes', 'l-msg-adapt', 'l-msg-audience', 'l-msg-ideas', 'l-msg-data', 'l-msg-verify'],
      Fig: PlanningFig,
      src: `${S8}; ${SH} (Jan 2021 Q4a: 5 + 12 marks)`,
    },
    {
      id: 'a-writing-deductive-inductive',
      topic: T,
      q: 'Describe the deductive and inductive approach in organizing a message.',
      seen: [],
      a: `Fundamentally, two types of organizational plans or approaches are used when composing a business message.

### 1. Direct or deductive approach
- Used when you think the receiver will have a **favorable or neutral reaction** to your message.
- **Begin with the main ideas or best news**.
- After the opening, include all necessary **explanatory details** in one or several paragraphs.
- End with an appropriate **friendly closing**.
- Two situations: **direct request** (the request by its very nature requires little persuasion) and **good news** (grant requests; announce favorable or neutral information; exchange routine information between companies).

### 2. Indirect or inductive approach
Two situations:
- **Persuasive request** — the request by its very nature would require extensive persuasion and convincing; use **attention-getting statements** to induce the receiver to read further; make clear the what, why, how, where and when of the request.
- **Bad news** — used to deny requests and announce unfavorable or negative information; difficult to prepare as the reader may react negatively.

| Point | Direct / deductive | Indirect / inductive |
|---|---|---|
| Receiver’s expected reaction | Favorable or neutral | Negative, or needs persuasion |
| Main idea placed | At the beginning | After the explanation / reasons |
| Used for | Direct requests, good news | Persuasive requests, bad news |

### Beginnings and endings
Main favorable ideas are generally placed at the beginning and the end of the message; the ending should focus on the desired action, leave a sense of goodwill, show appreciation and offer to help further.`,
      keys: ['Direct or deductive', 'favorable or neutral reaction', 'Begin with the main ideas or best news', 'explanatory details', 'friendly closing', 'direct request', 'good news', 'Indirect or inductive', 'Persuasive request', 'attention-getting statements', 'Bad news'],
      lists: ['l-msg-approach', 'l-msg-direct-plan', 'l-msg-direct-situations', 'l-msg-indirect-situations', 'l-msg-beginnings-endings'],
      Fig: ApproachFig,
      src: `${S8}; the comparison table is from Rahat’s note. Not in our 12 papers — asked 2010-11 Q3(b) (Rahat’s question list).`,
    },
    {
      id: 'a-writing-composing',
      topic: T,
      q: 'Describe the steps of composing a business message (drafting, revising, editing, proofreading).',
      seen: [],
      a: `### 1. Drafting the message
After completing the planning steps, get the whole message on paper: the **first draft**.

### 2. Revising the message
Evaluate **content, organization, and style** of the draft. Follow these steps when revising:
- Does the message accomplish its purpose?
- Is the organizational plan effective?
- Are points supported by adequate material?
- Is language complete, concise, considerate, concrete, clear, and courteous?
- Is there variety in sentence structure?
- Delete unnecessary material and include additional material if needed.

### 3. Editing the message
Check all paragraphs for: good **topic sentences**; sound sentence structure; correct **grammar**; spelling; **punctuation**; effectiveness of the message.

### 4. Proofreading the message
Ensure there are **no errors** in the message — even minor errors can reduce the effectiveness of the message and **undermine credibility**.`,
      keys: ['Drafting', 'first draft', 'Revising', 'content, organization, and style', 'accomplish its purpose', 'Editing', 'topic sentences', 'grammar', 'punctuation', 'Proofreading', 'no errors', 'undermine credibility'],
      lists: ['l-msg-composing', 'l-msg-revising', 'l-msg-editing'],
      src: `${S8}. On this term’s slides, not asked yet.`,
    },
    {
      id: 'a-msg-good-bad-news',
      topic: T,
      q: 'How should one communicate favorable or unfavorable information?',
      seen: [],
      a: `### Favorable information (good news) — direct or deductive approach
Used when you think the receiver will have a **favorable or neutral reaction**:
1. **Begin with the main ideas or best news**.
2. After the opening, include all necessary **explanatory details** in one or several paragraphs.
3. End with an appropriate **friendly closing**.

Good news messages grant requests, announce favorable or neutral information and exchange routine information between companies.

### Unfavorable information (bad news) — indirect or inductive approach
Bad news is used to deny requests and announce unfavorable or negative information; it is **difficult to prepare as the reader may react negatively**. So the news is not put first: open neutrally and give the explanation or reasons, then state the bad news tactfully, and end positively with **goodwill**.

### Whichever it is
- Provide unfavorable information **honestly but tactfully**; admit unavailable information frankly and openly (completeness).
- Main favorable ideas are generally placed at the **beginning and the end** of the message; the ending should leave a sense of goodwill.`,
      keys: ['direct or deductive', 'favorable or neutral reaction', 'Begin with the main ideas or best news', 'explanatory details', 'friendly closing', 'indirect or inductive', 'react negatively', 'honestly but tactfully', 'goodwill', 'beginning and the end'],
      lists: ['l-msg-direct-plan', 'l-msg-direct-situations', 'l-msg-indirect-situations', 'l-msg-beginnings-endings'],
      Fig: ApproachFig,
      src: `${S8}; L07 (completeness) for “honestly but tactfully”. The order of a bad-news message is the seniors’ note (Rahat). Not in our 12 papers — asked 2010-11 Q1(b)(i) (Rahat’s question list).`,
    },
  ],
} satisfies PcTopicContent
