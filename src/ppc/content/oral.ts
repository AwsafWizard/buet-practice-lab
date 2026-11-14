// pc-oral — oral presentation and meetings. Source: Noor sir L03–L04 slides (CE22); Nafee bhai’s note (Kabirul sir) only where marked.
import type { PcTopicContent } from '../types'

const T = 'pc-oral' as const
const S3 = 'Noor sir L03 (slide)'
const S4 = 'Noor sir L04 (slide)'
const KN5 = 'Kabirul sir note ch.5'
const KN6 = 'Kabirul sir note ch.6'
const QB = 'question bank only (Lesikar / Murphy & Hildebrandt)'

export default {
  lists: [
    {
      id: 'l-oral-steps',
      topic: T,
      title: 'Steps for preparing an effective oral presentation',
      ordered: true,
      points: [
        { k: 'Determine purpose', alt: ['purpose', 'determine the purpose', 'define purpose'], d: 'Inform, persuade or entertain.' },
        { k: 'Analyze audience and occasion', alt: ['audience', 'occasion', 'analyse audience and occasion'], d: 'Size, range, occupation, interests, goals.' },
        { k: 'Select main ideas for the message', alt: ['main ideas', 'select main idea', 'main idea'], d: 'Main theme, core ideas; workable, unified theme.' },
        { k: 'Research the topic', alt: ['research', 'research the data'], d: 'Facts, data, information; drop some, add new.' },
        { k: 'Organize data and write draft', alt: ['organize data', 'write draft', 'organise', 'draft'], d: 'Introduction, body, conclusion.' },
        { k: 'Create visual aids', alt: ['visual aids', 'visual aid', 'slides'] },
        { k: 'Rehearse the talk', alt: ['rehearse', 'practice', 'rehearsal'], d: 'To become comfortable with the presentation and its materials.' },
      ],
      hook: '**P**eople **A**lways **S**elect **R**esearch **O**ver **V**ague **R**umours — Purpose, Audience, Select, Research, Organize & draft, Visual aids, Rehearse.',
      seen: ['2021-22', '2016-17', '2013-14'],
      src: 'Noor sir slides (oral presentation)',
      note: 'Nafee bhai’s note had 8 steps (draft written after visual aids). This term’s slide = the 7 above.',
    },
    {
      id: 'l-oral-purpose',
      topic: T,
      title: 'Goals of communication (determine the purpose)',
      points: [
        { k: 'Inform', d: 'Objective: to give listeners better comprehension of an issue, idea or process — clarify, secure understanding, explain.' },
        { k: 'Persuade', d: 'Objective: to make listeners accept proposal, accept claim, do as asked.' },
        { k: 'Entertain', d: 'Entertainment through wit, humor, stimulating statements.' },
      ],
      seen: ['2016-17', '2013-14'],
      src: S3,
      note: 'Sub-bullets of step 1 of the oral-presentation steps.',
    },
    {
      id: 'l-oral-audience',
      topic: T,
      title: 'Analyze the audience — know its',
      points: [
        { k: 'Size' },
        { k: 'Range' },
        { k: 'Occupation' },
        { k: 'Interests' },
        { k: 'Goals' },
      ],
      hook: '**S**ome **R**eal **O**rators **I**nspire **G**roups.',
      seen: ['2016-17', '2013-14'],
      src: S3,
    },
    {
      id: 'l-oral-organize',
      topic: T,
      title: 'Organize data and write the draft — contents',
      ordered: true,
      points: [
        { k: 'Introduction', d: 'Opening remarks, preface, greetings; clearly state purpose of speech; lay out agenda of major topics.' },
        { k: 'Body', alt: ['text', 'discussion'], d: 'Evidence, data, supporting logic, examples.' },
        { k: 'Conclusion', d: 'Remind audience of main ideas; if you conclude, give inferences drawn from the data; give an ending or closing.' },
      ],
      seen: ['2016-17', '2013-14'],
      src: S3,
    },
    {
      id: 'l-oral-rehearse',
      topic: T,
      title: 'Points to keep in mind when rehearsing',
      points: [
        { k: 'Imagine audience in front of you' },
        { k: 'Use transitional phrases and sentences', d: 'To show listeners change of ideas.' },
        { k: 'Avoid long sentences and unusual words' },
        { k: 'Take each main point one at a time', d: 'Present each with its supporting unit.' },
        { k: 'Anticipate questions, consider thoughtful answers' },
        { k: 'Stop at allotted time', d: 'Cut and revise speech until you can deliver it within the time limit.' },
      ],
      hook: '**I** **T**ry **A**nd **O**ften **A**ct **S**mart — Imagine, Transitions, Avoid long, One at a time, Anticipate, Stop.',
      seen: ['2016-17', '2013-14'],
      src: S3,
      note: 'Purpose of rehearsal: to become more comfortable with the presentation and its materials.',
    },
    {
      id: 'l-oral-delivery-methods',
      topic: T,
      title: 'Ways of delivering oral message',
      points: [
        { k: 'Reading', alt: ['read'], d: 'Not recommended; used when giving important policy statements or speeches where it is crucial not to make a mistake.' },
        { k: 'Memorization', alt: ['memorisation', 'memorize'], d: 'Difficult and time consuming to memorize a long speech (a few words of a statement can be); few speakers today memorize complete speeches; not recommended.' },
        { k: 'Extemporaneous', alt: ['extempore', 'from notes'], d: 'Preferred by audiences and speakers; notes or outline jotted on 3 inch by 5 inch cards or a full sheet of paper; to be used whenever possible; allows more eye contact, establishes rapport, enables easy movements.' },
        { k: 'Impromptu', alt: ['no preparation', 'unprepared'], d: 'Given without any preparation or forewarning.' },
      ],
      hook: '**R**ead **M**y **E**asy **I**ntro — Reading, Memorization, Extemporaneous (the one to use), Impromptu.',
      seen: [],
      src: S3,
      note: 'Nafee bhai’s note gives a court verdict as the example for reading.',
    },
    {
      id: 'l-oral-kinds',
      topic: T,
      title: 'Kinds of oral presentations',
      points: [
        { k: 'Inform' },
        { k: 'Persuade' },
        { k: 'Entertain' },
        { k: 'Motivate' },
        { k: 'Inspire' },
        { k: 'Eulogize' },
        { k: 'Short', d: '1 to 10 minutes in length.' },
        { k: 'Long', d: '10 minutes to an hour.' },
      ],
      seen: [],
      src: S3,
    },
    {
      id: 'l-oral-issues',
      topic: T,
      title: 'Issues in improving oral presentation',
      points: [
        { k: 'Methods of preparation of effective oral presentation' },
        { k: 'Kinds of oral presentation' },
        { k: 'Ways of delivering the presentation' },
        { k: 'Strategies for effective oral delivery' },
        { k: 'Strategies for effective nonverbal delivery' },
      ],
      seen: [],
      src: S3,
    },
    {
      id: 'l-oral-verbal',
      topic: T,
      title: 'Strategies for effective verbal delivery',
      ask: 'Enumerate the strategies (steps) for effective verbal delivery.',
      ordered: true,
      points: [
        { k: 'Pitch', alt: ['vary pitch', 'tone'], d: 'Highness or lowness of the voice; vary it, a monotone loses the audience.' },
        { k: 'Rate', alt: ['speed', 'pace', 'pauses'], d: 'Speed of speaking; not too fast or slow, pause for emphasis.' },
        { k: 'Volume', alt: ['loudness'], d: 'Loud enough for the back row, varied for emphasis.' },
        { k: 'Vocal quality', alt: ['voice quality'], d: 'Pleasant, confident, conversational voice.' },
        { k: 'Pronunciation', alt: ['articulation', 'pronounce clearly'], d: 'Clear and correct; articulate every word.' },
        { k: 'Posture', alt: ['stance'], d: 'Stand straight and relaxed.' },
        { k: 'Movement', alt: ['move'], d: 'Purposeful, not pacing.' },
        { k: 'Gestures', alt: ['gesture', 'hands'], d: 'Natural hand movements that support the words.' },
        { k: 'Facial expressions', alt: ['facial expression', 'face', 'eye contact'], d: 'Match the message; keep eye contact.' },
      ],
      hook: '**PRVVP** for the voice (Pitch, Rate, Volume, Vocal quality, Pronunciation), then head-to-feet for the body: **PMGF** (Posture, Movement, Gestures, Facial expressions).',
      seen: ['2021-22'],
      src: 'Noor sir slide “Strategies for Effective Verbal Delivery”',
      note: 'The slide lists all 9 under verbal delivery; 1–5 are vocal and 6–9 non-verbal. Nafee bhai’s note splits them 5 verbal + 4 non-verbal.',
    },
    {
      id: 'l-oral-nonverbal',
      topic: T,
      title: 'Strategies for effective non-verbal delivery',
      points: [
        { k: 'Posture', alt: ['stance'] },
        { k: 'Gesture', alt: ['gestures', 'hands'] },
        { k: 'Facial expression', alt: ['face', 'eye contact'] },
        { k: 'Movement', alt: ['move'] },
      ],
      hook: 'Head to feet: how you **stand**, your **hands**, your **face**, your **feet** moving.',
      seen: [],
      src: KN5,
      note: 'On Noor sir’s slide these four are listed under verbal delivery (see the 9-point list).',
    },
    {
      id: 'l-groups',
      topic: T,
      title: 'Groups',
      points: [
        { k: 'Formal', d: 'Task oriented group looking for problem solution, course of action, recommendation.' },
        { k: 'Informal', d: 'Casual meeting to interact without plan.' },
      ],
      seen: [],
      src: S4,
    },
    {
      id: 'l-group-formation',
      topic: T,
      title: 'Group formation',
      ordered: true,
      points: [
        { k: 'Forming', d: 'Group gets started. Orientation stage.' },
        { k: 'Storming', d: 'Group members stake individual positions. Begin to have conflicts and arguments.' },
        { k: 'Norming', d: 'Group members work to solve problems and recognize acceptable kinds of conduct.' },
        { k: 'Performing', d: 'Group begins to achieve its goals.' },
      ],
      hook: 'Form → Storm → Norm → Perform (they rhyme).',
      seen: [],
      src: S4,
      note: 'Asked 2009-10 Q3(a) (Rahat’s list).',
    },
    {
      id: 'l-group-guidelines',
      topic: T,
      title: 'Guidelines for starting group',
      points: [
        { k: 'Agreement on purpose' },
        { k: 'Personal compatibility' },
        { k: 'Similarities in abilities, personalities, status, attributes', d: 'Similarities in abilities, personalities, economic status, physical attribute.' },
        { k: 'Either form formal or informal group' },
      ],
      seen: [],
      src: S4,
    },
    {
      id: 'l-group-phases',
      topic: T,
      title: 'Phases in problem solution in groups',
      ordered: true,
      points: [
        { k: 'Orientation', d: 'Free flowing discussion; people wander about orally asking questions.' },
        { k: 'Conflict', d: 'Members offer opinion and evidence in support of opinion; initial conflict occurs; resistance even to agreed upon task.' },
        { k: 'Emergence', d: 'Open exchanges continue; members search for ways for truly solving problem; compromise occurs; decrease in conflict, sincere movement toward decreasing differences in opinion.' },
        { k: 'Solution', d: 'Options have been discussed; criteria for measuring options have been reviewed; time to complete task and agree upon a solution.' },
      ],
      hook: '**O**ld **C**ars **E**ventually **S**top.',
      seen: [],
      src: S4,
      note: 'Asked 2009-10 Q3(a), 2008-09 Q3(a) (Rahat’s list).',
    },
    {
      id: 'l-meeting-types',
      topic: T,
      title: 'Types of meeting',
      points: [
        { k: 'Informal meetings', alt: ['informal', 'informal meeting', 'open discussion'], d: 'Open statement by caller of meeting; discussion; members ask questions, learn, seek to understand.' },
        { k: 'Suggested solution meetings', alt: ['suggested solution', 'suggested-solution meeting', 'problem-solving meeting'], d: 'Exploratory meeting to review options or address a problem; all suggested and possible solutions are discussed.' },
      ],
      seen: [],
      src: S4,
    },
    {
      id: 'l-meeting-steps',
      topic: T,
      title: 'Steps followed in meetings',
      ordered: true,
      points: [
        { k: 'Background analysis', alt: ['analyse background', 'problem analysis'], d: 'Phase starts when there is a sense that there is a problem. First: the problem, central issue or question stated in affirmative tone; second: problem defined, limited, central issues scoped; final: collect facts on history of problem — duration, symptoms, extent, cause and effects.' },
        { k: 'Solution discovery', alt: ['find solutions', 'brainstorm'], d: 'Establish criteria for solution; attach weights to criteria; brainstorm solutions; list all possible solutions without judging their merits and demerits; consider several alternatives in light of the stated criteria.' },
        { k: 'Solution evaluation', alt: ['evaluate solutions'], d: 'Evaluate alternative solutions in light of stated criteria; test whether preferred solution will solve problem; at the end a tentative solution is selected, an entirely new solution reached, or parts of several combined.' },
        { k: 'Choice of action', alt: ['final choice', 'decision'], d: 'Finally the group recommends a solution and choice of action.' },
      ],
      hook: '**B**uild **S**ome **S**olid **C**hoices.',
      seen: [],
      src: S4,
    },
    {
      id: 'l-meeting-before',
      topic: T,
      title: 'Planning steps before a meeting',
      ordered: true,
      points: [
        { k: 'Review problem and determine purpose', alt: ['review problem', 'determine purpose', 'purpose', 'problem review'] },
        { k: 'Decide who should participate', alt: ['participants', 'participant selection'] },
        { k: 'Arrange for meeting', alt: ['date', 'time', 'place', 'venue'], d: 'Date, time, place.' },
        { k: 'Create agenda', alt: ['agenda'], d: 'What will be covered in meeting.' },
        { k: 'Distribute announcement for meeting', alt: ['announcement', 'notify', 'notice'] },
        { k: 'Check physical arrangement', alt: ['physical arrangement', 'seating', 'visual aids', 'materials'], d: 'Seating pattern, materials needed, visual aids.' },
      ],
      hook: '**R**eal **D**irectors **A**lways **C**reate **D**etailed **C**hecklists — Review, Decide, Arrange, Create agenda, Distribute, Check.',
      seen: ['2013-14'],
      src: S4,
      note: 'Also asked 2009-10 Q3(b), 2008-09 Q3(b) (Rahat’s list).',
    },
    {
      id: 'l-meeting-during',
      topic: T,
      title: 'Procedure during a meeting',
      ordered: true,
      points: [
        { k: 'Begin with opening statement and state the problem', alt: ['opening statement', 'state the problem'] },
        { k: 'Stimulate discussion encouraging all to participate', alt: ['stimulate discussion', 'encourage participation', 'participation'], d: 'And get their views: keep atmosphere of goodwill; if meeting becomes tense and hostile, keep calm; indicate importance of problem; assist in discussion and possible solutions.' },
        { k: 'Understand role of participants', alt: ['roles', 'participants'], d: 'Who may include: reluctant non-participatory member, know-it-all, long winded speaker, erroneous member, member showing personal animosity.' },
        { k: 'Interpret data for solution evaluation', alt: ['interpret data', 'evaluate solutions'], d: 'State major conclusions reached in meeting and any plan of action considered.' },
      ],
      hook: '**B**e **S**mart, **U**nderstand **I**t — Begin, Stimulate, Understand, Interpret.',
      seen: ['2013-14'],
      src: S4,
      note: 'After meeting: follow-up — Nafee bhai’s note only, not on the slide.',
    },
    {
      id: 'l-meeting-difficult',
      topic: T,
      title: 'Types of participants to understand during a meeting',
      points: [
        { k: 'Reluctant non-participatory member', alt: ['reluctant member', 'non-participatory member'] },
        { k: 'Know-it-all' },
        { k: 'Long winded speaker', alt: ['long-winded speaker'] },
        { k: 'Erroneous member' },
        { k: 'Member showing personal animosity', alt: ['personal animosity'] },
      ],
      hook: '**R**ude **K**ids **L**ove **E**ating **M**angoes.',
      seen: ['2013-14'],
      src: S4,
    },
    {
      id: 'l-meeting-roles',
      topic: T,
      title: 'Roles of participants in a meeting',
      points: [
        { k: 'Organizer', alt: ['organiser', 'leader', 'chair'] },
        { k: 'Clarifier', alt: ['clarify'] },
        { k: 'Questioner', alt: ['question'] },
        { k: 'Factual contributor', alt: ['information giver', 'facts'] },
        { k: 'Energizer', alt: ['energiser', 'motivator'] },
        { k: 'Idea creator', alt: ['initiator', 'idea'] },
        { k: 'Conflict tester', alt: ['tester', 'critic'] },
        { k: 'Conciliator', alt: ['harmonizer', 'mediator'] },
        { k: 'Helper of others', alt: ['helper', 'supporter'] },
      ],
      hook: '**O**ur **C**lub’s **Q**uiet **F**ans **E**at **I**ce **C**ream, **C**heering **H**appily.',
      seen: ['2013-14'],
      src: S4,
      note: 'The slide gives names only.',
    },
    {
      id: 'l-leadership',
      topic: T,
      title: 'Leadership styles in meetings',
      points: [
        { k: 'Authoritarian', alt: ['autocratic', 'directive'], d: 'Leader limits discussion, issues orders and commands.' },
        { k: 'Democratic and participatory', alt: ['democratic', 'participatory', 'participative'], d: 'Group has final authority; leader facilitates and listens to all.' },
      ],
      seen: ['2023-24', '2022-23'],
      src: 'Noor sir slides (meetings)',
      note: 'The slide gives two styles. Laissez-faire (free-rein) is a textbook third style, not taught.',
    },
    {
      id: 'l-leadership-authoritarian',
      topic: T,
      title: 'Authoritarian leader',
      points: [
        { k: 'Shows contempt regarding abilities of group members', alt: ['contempt', 'contempt for members'] },
        { k: 'Limits discussion', alt: ['limited discussion'] },
        { k: 'Praises those who agree with his/her position', alt: ['praises those who agree', 'praises agreement'] },
        { k: 'Speaks often and loudly', alt: ['speaks loudly', 'speaks often'] },
        { k: 'Issues orders and commands', alt: ['orders', 'commands'] },
      ],
      hook: '**C**ommanders **L**ove **P**raise, **S**houting **O**rders — Contempt, Limits, Praises, Speaks, Orders.',
      seen: ['2023-24', '2022-23'],
      src: 'Noor sir slides (meetings)',
    },
    {
      id: 'l-leadership-democratic',
      topic: T,
      title: 'Democratic and participatory leader',
      points: [
        { k: 'Listens to all points of view', alt: ['listens to all', 'all points of view'] },
        { k: 'Group has final authority to decide', alt: ['group has final authority', 'final authority', 'group decides'], d: 'Group has final authority to decide on a course of action.' },
        { k: 'Helps group make the best decision', alt: ['best decision possible', 'helps group decide'], d: 'Rather than force them into it.' },
        { k: 'Facilitates group discussion', alt: ['facilitates discussion', 'facilitates'] },
        { k: 'Invites minority opinion', alt: ['minority opinion'] },
        { k: 'Evaluates unsupported generalizations', alt: ['unsupported generalizations', 'evaluates generalizations'] },
        { k: 'Clarifies vague statements', alt: ['vague statements', 'clarifies'] },
      ],
      hook: '**L**eaders **G**ive **H**elp, **F**acilitate, **I**nvite, **E**valuate, **C**larify.',
      seen: ['2023-24', '2022-23'],
      src: 'Noor sir slides (meetings)',
    },
  ],

  cards: [
    { id: 'c-oral-best-method', topic: T, front: 'Which way of delivering an oral message is **most recommended**, and why?', back: '**Extemporaneous** — preferred by audiences and speakers; to be used whenever possible; allows **more eye contact** with audience, **establishes rapport** and **enables easy movements**.', src: S3 },
    { id: 'c-oral-reading', topic: T, front: 'When is **reading** a speech word for word acceptable?', back: 'Not recommended — used only for **important policy statements** or speeches where it is **crucial not to make a mistake**. (Nafee bhai’s note: e.g. a court verdict.)', src: S3 },
    { id: 'c-oral-memorise', topic: T, front: 'Why is **memorisation** not recommended?', back: '**Difficult and time consuming** to memorize a long speech; only a few words of a statement can be memorized; few speakers today memorize complete speeches — not recommended.', src: S3 },
    { id: 'c-oral-impromptu', topic: T, front: 'What is an **impromptu** delivery?', back: 'Given **without any preparation or forewarning**.', src: S3 },
    { id: 'c-oral-cards', topic: T, front: 'What notes does the slide suggest for extemporaneous delivery?', back: 'Notes or outline jotted on **3 inch by 5 inch cards** or a full sheet of paper.', src: S3 },
    { id: 'c-oral-eulogize', topic: T, front: 'What does **eulogize** mean?', back: 'To praise someone or something highly, usually in a formal speech or piece of writing.', src: S3 },
    { id: 'c-oral-master', topic: T, front: 'To be effective in oral communication one must master which arts?', back: '**Rhetoric** (eloquence/power of speech), **persuasion**, **oral presentation**.', src: S3 },
    { id: 'c-oral-verbal-mnemonic', topic: T, front: 'How many strategies for effective verbal delivery are on the slide, and which are vocal?', back: '**Nine**: Pitch, Rate, Volume, Vocal quality, Pronunciation (vocal) and Posture, Movement, Gestures, Facial expressions (non-verbal).', seen: ['2021-22'], src: 'Noor sir slide' },
    { id: 'c-meeting-after', topic: T, front: 'What is done **after** a meeting?', back: '**Follow-up** — circulate minutes, check that action items are done by the people assigned.', src: 'Nafee bhai’s note only — not on Noor sir’s slide' },
    { id: 'c-meeting-define', topic: T, front: 'Define a **meeting** and a **group meeting**.', back: 'A meeting is a gathering of **two or more people** having a discussion **with a specific objective in mind**. A group meeting is a meeting of **three or more** people.', src: S4 },
    { id: 'c-group-dont-mix', topic: T, front: 'Group **formation** stages vs **problem-solution** phases — don’t mix them.', back: 'Formation: **Forming – Storming – Norming – Performing**. Problem solution: **Orientation – Conflict – Emergence – Solution**.', src: S4 },
    { id: 'c-meeting-informal', topic: T, front: '**Informal** vs **suggested-solution** meeting?', back: '**Informal**: open statement by caller of meeting; discussion; members ask questions, learn, seek to understand. **Suggested solution**: exploratory meeting to review options or address a problem; all suggested and possible solutions are discussed.', src: S4 },
    { id: 'c-meeting-physical', topic: T, front: 'What “physical arrangements” are checked before a meeting?', back: '**Seating pattern**, **materials needed**, **visual aids**.', seen: ['2013-14'], src: S4 },
    { id: 'c-meeting-conciliator', topic: T, front: 'Meeting roles: **conciliator** vs **energizer**?', back: '**Conciliator**: settles conflicts and keeps harmony. **Energizer**: motivates the group, keeps the energy up.', src: 'Kabirul sir note ch.6 (explanation; slide gives names only)' },
    { id: 'c-leadership-best', topic: T, front: 'Which meeting leadership style is most effective, and why? (one line)', back: '**Democratic and participatory** — group has final authority, minority opinion invited, vague statements clarified → better decisions, commitment, fewer hidden conflicts. Authoritarian only in emergencies.', seen: ['2023-24', '2022-23'], src: 'Noor sir slides + Rahat’s note' },
    { id: 'c-leadership-autocratic', topic: T, front: 'What does an **authoritarian** leader do in a meeting (5)?', back: 'Shows **contempt** regarding abilities of group members; **limits discussion**; **praises those who agree** with his/her position; **speaks often and loudly**; **issues orders and commands**. Suits only emergencies.', seen: ['2023-24', '2022-23'], src: 'Noor sir slides' },
  ],

  answers: [
    {
      id: 'a-oral-steps',
      topic: T,
      q: 'Describe the steps for preparing an effective oral presentation.',
      seen: ['2021-22', '2016-17', '2013-14'],
      a: `1. **Determine purpose** — goal of communication: **inform** (to give listeners better comprehension of an issue, idea or process: clarify, secure understanding, explain); **persuade** (to make listeners accept proposal, accept claim, do as asked); **entertain** (through wit, humor, stimulating statements).
2. **Analyze audience and occasion** — the message must be adapted to the audience; know its size, range, occupation, interests, goals.
3. **Select main ideas for the message** — select the main theme and core ideas; initially ideas are disorganized, haphazard; select those that are workable and offer a **unified theme**; then gather additional ideas in support of the core ideas.
4. **Research the topic** — research for collecting facts, data, information; it results in dropping some initial ideas and adding new ones.
5. **Organize data and write draft** — gather information; order/sequence/arrange it; form an initial outline and write the **introduction** (opening remarks, preface, greetings; clearly state purpose of speech; lay out agenda of major topics), **body** (evidence, data, supporting logic, examples) and **conclusion** (remind audience of main ideas; if you conclude, give inferences drawn from the data; give an ending or closing).
6. **Create visual aids.**
7. **Rehearse the talk** — purpose: to become more comfortable with the presentation and its materials. Imagine audience in front of you; use **transitional phrases** and sentences to show change of ideas; avoid long sentences and unusual words; take each main point one at a time with its supporting unit; anticipate questions and consider thoughtful answers; stop at allotted time — cut and revise until you can deliver it within the time limit.

Deliver it **extemporaneously** (from notes) whenever possible.`,
      keys: ['Determine purpose', 'audience and occasion', 'main ideas', 'Research the topic', 'write draft', 'visual aids', 'Rehearse', 'extemporaneously', 'inform', 'persuade', 'unified theme', 'transitional phrases'],
      lists: ['l-oral-steps', 'l-oral-delivery-methods', 'l-oral-purpose', 'l-oral-audience', 'l-oral-organize', 'l-oral-rehearse'],
      src: `${S3}; shape and sub-bullets as the 18-batch solve (2016-17)`,
    },
    {
      id: 'a-oral-verbal-delivery',
      topic: T,
      q: 'Enumerate the steps (strategies) for effective verbal delivery.',
      seen: ['2021-22'],
      a: `### Strategies for effective verbal delivery
1. **Pitch** — highness or lowness of the voice; vary it, a monotone loses the audience.
2. **Rate** — speed of speaking; not too fast or slow, pause for emphasis.
3. **Volume** — loud enough for the back row, varied for emphasis.
4. **Vocal quality** — pleasant, confident, conversational voice.
5. **Pronunciation** — clear and correct; articulate every word.
6. **Posture** — stand straight and relaxed.
7. **Movement** — purposeful, not pacing.
8. **Gestures** — natural hand movements that support the words.
9. **Facial expressions** — match the message; keep eye contact.

*1–5 are vocal and 6–9 non-verbal; the slide lists all nine under verbal delivery.*`,
      keys: ['Pitch', 'Rate', 'Volume', 'Vocal quality', 'Pronunciation', 'Posture', 'Movement', 'Gestures', 'Facial expressions'],
      lists: ['l-oral-verbal'],
      src: 'Noor sir slide “Strategies for Effective Verbal Delivery”; one-line meanings are explanations, not on the slide',
    },
    {
      id: 'a-meeting-plan',
      topic: T,
      q: 'Describe the planning steps before a meeting and the procedures during the meeting, and identify the various participants’ roles in a meeting.',
      seen: ['2013-14'],
      a: `### Planning steps before meeting
1. **Review problem and determine purpose**
2. **Decide who should participate**
3. **Arrange for meeting** — date, time, place
4. **Create agenda** — what will be covered in meeting
5. **Distribute announcement** for meeting
6. **Check physical arrangement** — seating pattern, materials needed, visual aids

### Procedures during meeting
1. **Begin with opening statement and state the problem.**
2. **Stimulate discussion** encouraging all to participate and get their views — keep atmosphere of goodwill; if meeting becomes tense and hostile, keep calm; indicate importance of problem; assist in discussion and possible solutions.
3. **Understand role of participants**, who may include: reluctant non-participatory member; know-it-all; long winded speaker; erroneous member; member showing personal animosity.
4. **Interpret data for solution evaluation** — state major conclusions reached in meeting and any plan of action considered.

### Participant roles in meeting
1. Organizer
2. Clarifier
3. Questioner
4. Factual contributor
5. Energizer
6. Idea creator
7. Conflict tester
8. Conciliator
9. Helper of others`,
      keys: ['Review problem and determine purpose', 'Decide who should participate', 'Arrange for meeting', 'Create agenda', 'Distribute announcement', 'Check physical arrangement', 'opening statement', 'Stimulate discussion', 'Understand role of participants', 'know-it-all', 'Interpret data for solution evaluation', 'Organizer', 'Factual contributor', 'Conciliator', 'Helper of others'],
      lists: ['l-meeting-before', 'l-meeting-during', 'l-meeting-difficult', 'l-meeting-roles'],
      src: S4,
    },
    {
      id: 'a-meeting-groups',
      topic: T,
      q: 'Describe the process of group formation and the phases in problem solution by groups.',
      seen: [],
      a: `A meeting is a gathering of two or more people having a discussion with a specific objective in mind; a **group meeting** is a meeting of three or more people. Groups are **formal** (task oriented, looking for problem solution, course of action, recommendation) or **informal** (casual meeting to interact without plan).

### Group formation
1. **Forming** — group gets started; orientation stage.
2. **Storming** — group members stake individual positions; begin to have conflicts and arguments.
3. **Norming** — group members work to solve problems and recognize acceptable kinds of conduct.
4. **Performing** — group begins to achieve its goals.

### Phases in problem solution in groups
1. **Orientation** — free flowing discussion; people wander about orally asking questions.
2. **Conflict** — members offer opinion and evidence in support of opinion; initial conflict occurs; resistance even to agreed upon task.
3. **Emergence** — open exchanges continue; members search for ways for truly solving problem; compromise occurs; decrease in conflict, sincere movement toward decreasing differences in opinion.
4. **Solution** — options have been discussed; criteria for measuring options have been reviewed; time to complete task and agree upon a solution.`,
      keys: ['group meeting', 'Forming', 'Storming', 'Norming', 'Performing', 'Orientation', 'Conflict', 'Emergence', 'Solution', 'compromise'],
      lists: ['l-groups', 'l-group-formation', 'l-group-phases'],
      src: `${S4}; asked 2009-10 Q3(a) and (phases only) 2008-09 Q3(a) per Rahat’s question list`,
    },
    {
      id: 'a-meeting-types-steps',
      topic: T,
      q: 'What are the types of meetings? Describe the steps followed in meetings.',
      seen: [],
      a: `### Types of meetings
1. **Informal meetings** — open statement by caller of meeting; discussion; members ask questions, learn, seek to understand.
2. **Suggested solution meetings** — exploratory meeting to review options or address a problem; all suggested and possible solutions are discussed.

### Steps followed in meetings
1. **Background analysis** — starts when there is a sense that there is a problem: first, the problem, central issue or question is stated in affirmative tone; second, the problem is defined and limited, central issues scoped; finally, facts on the history of the problem are collected (duration, symptoms, extent, cause and effects).
2. **Solution discovery** — establish criteria for solution; attach weights to the criteria; brainstorm solutions; list all possible solutions without judging their merits and demerits; consider several alternatives in light of the stated criteria.
3. **Solution evaluation** — evaluate alternatives in light of the criteria; test whether the preferred solution will solve the problem; at the end a tentative solution is selected, an entirely new solution reached, or parts of several solutions combined.
4. **Choice of action** — finally the group recommends a solution and choice of action.`,
      keys: ['Informal meetings', 'Suggested solution meetings', 'Background analysis', 'affirmative tone', 'Solution discovery', 'brainstorm', 'Solution evaluation', 'Choice of action'],
      lists: ['l-meeting-types', 'l-meeting-steps'],
      src: `${S4}; not asked yet (Rahat’s note marks it new)`,
    },
    {
      id: 'a-oral-kinds-delivery',
      topic: T,
      q: 'What are the kinds of oral presentation? Describe the ways of delivering an oral message.',
      seen: [],
      a: `### Kinds of oral presentations
Inform · persuade · entertain · motivate · inspire · eulogize (praise someone or something highly, usually in a formal speech); **short** (1 to 10 minutes) or **long** (10 minutes to an hour).

### Ways of delivering oral message
1. **Reading** — not recommended; used when giving important policy statements or speeches where it is crucial not to make a mistake.
2. **Memorization** — difficult and time consuming to memorize a long speech, though a few words of a statement can be memorized; few speakers today memorize complete speeches; not recommended.
3. **Extemporaneous** — preferred by audiences and speakers; the speaker uses notes or an outline jotted on 3 inch by 5 inch cards or a full sheet of paper; to be used whenever possible; allows more eye contact with the audience, establishes rapport and enables easy movements.
4. **Impromptu** — given without any preparation or forewarning.`,
      keys: ['eulogize', 'Reading', 'Memorization', 'Extemporaneous', 'Impromptu', 'policy statements', 'eye contact', 'without any preparation'],
      lists: ['l-oral-kinds', 'l-oral-delivery-methods'],
      src: `${S3}; not asked yet (Rahat’s note marks it new)`,
    },
    {
      id: 'a-meeting-leadership',
      topic: T,
      q: 'What leadership styles are followed in meetings? Briefly explain. In your opinion, which method is more effective and why?',
      seen: ['2023-24', '2022-23'],
      a: `Two leadership styles are followed in meetings.

### 1. Authoritarian
- Shows **contempt** regarding abilities of group members
- **Limits discussion**
- Praises those who agree with his/her position
- Speaks often and loudly
- Issues **orders and commands**

### 2. Democratic and participatory
- **Listens to all points of view**
- Group has **final authority** to decide on a course of action
- Helps group make the best decision possible rather than force them into it
- **Facilitates group discussion**
- Invites **minority opinion**
- Evaluates unsupported generalizations
- **Clarifies vague statements**

| | Authoritarian | Democratic and participatory |
|---|---|---|
| Who decides | Leader alone | Group has final authority |
| Discussion | Limited | Encouraged and facilitated |
| Attitude to members | Contempt | Listens to all |
| Minority opinion | Ignored; only those who agree are praised | Invited |
| Commitment | Low | High |

### In my opinion democratic and participatory is more effective
1. **Better decisions** — every member’s knowledge is used (design, construction, finance and safety see different risks).
2. **Minority opinion heard** — a junior may spot a safety problem.
3. **Commitment** — people carry out decisions they helped make.
4. **Fewer hidden conflicts** — open discussion moves the group from conflict to a solution.
5. Vague statements are clarified and unsupported generalizations evaluated, so the meeting stays **fact-based**.
6. **Goodwill and teamwork.**

Authoritarian style suits only **emergencies** (e.g. a site accident).`,
      keys: ['Authoritarian', 'Democratic and participatory', 'contempt', 'Limits discussion', 'final authority', 'minority opinion', 'Better decisions', 'Commitment', 'emergencies'],
      lists: ['l-leadership', 'l-leadership-authoritarian', 'l-leadership-democratic'],
      src: 'Noor sir slides (meetings); comparison and reasons from Rahat’s note',
    },
  ],
} satisfies PcTopicContent
