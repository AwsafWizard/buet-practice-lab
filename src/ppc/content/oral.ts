// pc-oral — oral presentation and meetings.
// Sources: Noor sir's slides (oral presentation steps, verbal delivery, leadership styles) and Kabirul sir's note ch.5–6.
import type { PcTopicContent } from '../types'

const T = 'pc-oral' as const
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
      id: 'l-oral-delivery-methods',
      topic: T,
      title: 'Ways of delivering an oral message',
      points: [
        { k: 'Extemporaneous', alt: ['extempore', 'from notes'], d: 'Prepared, spoken from short notes on 3×5" cards; most eye contact; most recommended.' },
        { k: 'Reading', alt: ['read'], d: 'Word for word; only for policy statements or where a small slip is crucial (court verdict).' },
        { k: 'Memorisation', alt: ['memorization', 'memorize'], d: 'Not recommended; parts of a long speech get forgotten.' },
        { k: 'Impromptu', alt: ['no preparation', 'unprepared'], d: 'No preparation; say what comes.' },
      ],
      hook: '**E**very **R**eader **M**isses **I**t — Extemporaneous (best), Reading, Memorisation, Impromptu.',
      seen: [],
      src: KN5,
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
      id: 'l-meeting-types',
      topic: T,
      title: 'Types of meeting',
      points: [
        { k: 'Informal meeting', alt: ['informal', 'open discussion'], d: 'Open discussion; members learn and share on a new matter.' },
        { k: 'Suggested-solution meeting', alt: ['suggested solution', 'problem-solving meeting'], d: 'Possible solutions are suggested; the final one is chosen.' },
      ],
      seen: [],
      src: KN6,
    },
    {
      id: 'l-meeting-steps',
      topic: T,
      title: 'Steps followed in a (problem-solving) meeting',
      ordered: true,
      points: [
        { k: 'Background analysis', alt: ['analyse background', 'problem analysis'] },
        { k: 'Solution discovery', alt: ['find solutions', 'brainstorm'] },
        { k: 'Solution evaluation', alt: ['evaluate solutions'] },
        { k: 'Choice of action', alt: ['final choice', 'decision'] },
      ],
      hook: '**B**uild **S**ome **S**olid **C**hoices.',
      seen: [],
      src: KN6,
    },
    {
      id: 'l-meeting-before',
      topic: T,
      title: 'Planning steps before a meeting',
      ordered: true,
      points: [
        { k: 'Problem review', alt: ['review problem', 'purpose', 'define purpose'] },
        { k: 'Participant selection', alt: ['select participants', 'participants'] },
        { k: 'Fix time, date and place', alt: ['time', 'date', 'venue', 'place'] },
        { k: 'Create agenda', alt: ['agenda'] },
        { k: 'Announcement', alt: ['notify', 'notice'] },
        { k: 'Check physical arrangements', alt: ['seating', 'visual aids', 'materials', 'physical arrangement'], d: 'Visual aids, seating pattern, materials needed.' },
      ],
      hook: '**P**lease **P**ick **T**he **A**genda, **A**nnounce, **A**rrange — Problem, People, Time, Agenda, Announce, Arrange.',
      seen: ['2013-14'],
      src: KN6,
      note: 'Question bank: define purpose / is a meeting needed; select participants; prepare and circulate agenda; fix date, time, venue, seating, equipment; notify and confirm.',
    },
    {
      id: 'l-meeting-during',
      topic: T,
      title: 'Procedure during a meeting',
      ordered: true,
      points: [
        { k: 'Begin with opening statement', alt: ['opening statement', 'start on time'] },
        { k: 'State the problem', alt: ['problem statement', 'purpose'] },
        { k: 'Encourage everyone to take part', alt: ['encourage participation', 'participation'] },
        { k: 'Understand every participant’s role', alt: ['roles', "participant's role"] },
        { k: 'Interpret data to evaluate solutions', alt: ['interpret data', 'evaluate solutions'] },
      ],
      hook: '**O**pen, **S**tate, **E**ncourage, **U**nderstand, **I**nterpret — “**O**ld **S**ailors **E**at **U**nder **I**ce”. After the meeting: follow-up.',
      seen: ['2013-14'],
      src: KN6,
      note: 'After the meeting: follow-up (minutes, action items). Question bank: start on time and review agenda; follow agenda; encourage participation, control dominant members; summarise and record decisions and actions; end on time, circulate minutes.',
    },
    {
      id: 'l-meeting-roles',
      topic: T,
      title: 'Roles of participants in a meeting',
      points: [
        { k: 'Organizer', alt: ['organiser', 'leader', 'chair'] },
        { k: 'Clarifier', alt: ['clarify'] },
        { k: 'Questioner', alt: ['question'] },
        { k: 'Idea creator', alt: ['initiator', 'idea'] },
        { k: 'Conflict tester', alt: ['tester', 'critic'] },
        { k: 'Conciliator', alt: ['harmonizer', 'mediator'] },
        { k: 'Factual contributor', alt: ['information giver', 'facts'] },
        { k: 'Helper of others', alt: ['helper', 'supporter'] },
        { k: 'Energizer', alt: ['energiser', 'motivator'] },
      ],
      hook: 'A football team: the **organizer** captain, **clarifier** and **questioner** in defence, **idea creator** in midfield, **conflict tester** and **conciliator** as referees, **factual contributor** the analyst, **helper** the physio, **energizer** the crowd.',
      seen: ['2013-14'],
      src: KN6,
      note: 'Question bank roles: chairperson/leader, secretary/recorder, participants; optional timekeeper, facilitator, subject expert.',
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
    { id: 'c-oral-best-method', topic: T, front: 'Which way of delivering an oral message is **most recommended**, and why?', back: '**Extemporaneous** — prepared, spoken from short notes on 3×5" cards, so words come naturally and **eye contact is greatest**.', src: KN5 },
    { id: 'c-oral-reading', topic: T, front: 'When is **reading** a speech word for word acceptable?', back: 'Only for **policy statements** or where a small mistake is crucial — e.g. a court giving its verdict. Otherwise not recommended.', src: KN5 },
    { id: 'c-oral-memorise', topic: T, front: 'Why is **memorisation** not recommended?', back: 'In a long speech a part may be **forgotten**, and the delivery sounds mechanical.', src: KN5 },
    { id: 'c-oral-impromptu', topic: T, front: 'What is an **impromptu** delivery?', back: 'Speaking **without preparation** — saying what comes at the moment.', src: KN5 },
    { id: 'c-oral-cards', topic: T, front: 'What size note cards does the note suggest for extemporaneous delivery?', back: '**3 × 5 inch** cards with short notes.', src: KN5 },
    { id: 'c-oral-verbal-mnemonic', topic: T, front: 'How many strategies for effective verbal delivery are on the slide, and which are vocal?', back: '**Nine**: Pitch, Rate, Volume, Vocal quality, Pronunciation (vocal) and Posture, Movement, Gestures, Facial expressions (non-verbal).', seen: ['2021-22'], src: 'Noor sir slide' },
    { id: 'c-meeting-after', topic: T, front: 'What is done **after** a meeting?', back: '**Follow-up** — circulate minutes, check that action items are done by the people assigned.', seen: ['2013-14'], src: KN6 },
    { id: 'c-meeting-informal', topic: T, front: '**Informal** vs **suggested-solution** meeting?', back: '**Informal**: open discussion where members learn and share about a new matter. **Suggested-solution**: possible solutions are proposed and the final solution is chosen.', src: KN6 },
    { id: 'c-meeting-physical', topic: T, front: 'What “physical arrangements” are checked before a meeting?', back: '**Visual aids**, **seating pattern** and **materials needed**.', seen: ['2013-14'], src: KN6 },
    { id: 'c-meeting-conciliator', topic: T, front: 'Meeting roles: **conciliator** vs **energizer**?', back: '**Conciliator**: settles conflicts and keeps harmony. **Energizer**: motivates the group, keeps the energy up.', src: KN6 },
    { id: 'c-leadership-best', topic: T, front: 'Which meeting leadership style is most effective, and why? (one line)', back: '**Democratic and participatory** — group has final authority, minority opinion invited, vague statements clarified → better decisions, commitment, fewer hidden conflicts. Authoritarian only in emergencies.', seen: ['2023-24', '2022-23'], src: 'Noor sir slides + Rahat’s note' },
    { id: 'c-leadership-autocratic', topic: T, front: 'What does an **authoritarian** leader do in a meeting (5)?', back: 'Shows **contempt** regarding abilities of group members; **limits discussion**; **praises those who agree** with his/her position; **speaks often and loudly**; **issues orders and commands**. Suits only emergencies.', seen: ['2023-24', '2022-23'], src: 'Noor sir slides' },
  ],

  answers: [
    {
      id: 'a-oral-steps',
      topic: T,
      q: 'Describe the steps for preparing an effective oral presentation.',
      seen: ['2021-22', '2016-17', '2013-14'],
      a: `1. **Determine purpose** — to inform, to persuade or to entertain.
2. **Analyze audience and occasion** — size, range, occupation, interests and goals of the audience.
3. **Select main ideas for the message** — the main theme and core ideas; a workable, unified theme.
4. **Research the topic** — facts, data, information; drop some, add new.
5. **Organize data and write draft** — **introduction** (opening remarks, state the purpose, lay out the agenda), **body** (evidence, data, supporting logic, examples), **conclusion** (remind the main ideas, inferences, closing).
6. **Create visual aids** — clear slides, charts, models.
7. **Rehearse the talk** — imagine the audience in front of you; use transitional phrases; avoid long sentences and unusual words; take each main point one at a time; anticipate questions; stop at the allotted time.

Deliver it **extemporaneously** (from notes) whenever possible.`,
      keys: ['Determine purpose', 'audience and occasion', 'main ideas', 'Research the topic', 'write draft', 'visual aids', 'Rehearse', 'extemporaneously'],
      lists: ['l-oral-steps', 'l-oral-delivery-methods'],
      src: 'Noor sir slides (oral presentation); shape as the 18-batch solve (2016-17)',
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
      a: `### Before the meeting
1. **Problem review** — what is the problem, is a meeting needed?
2. **Participant selection** — those who can contribute or must decide.
3. **Fix time, date and place.**
4. **Create the agenda** — contents, time for each item.
5. **Announcement** — notify participants with the agenda.
6. **Check physical arrangements** — visual aids, seating pattern, materials needed.

### During the meeting
1. **Opening statement** — begin on time with it.
2. **State the problem.**
3. **Encourage** everyone present to take part in the discussion.
4. **Understand the role** of every participant.
5. **Interpret data** to evaluate solutions, then choose the action.

### After the meeting
**Follow-up** — minutes, action items.

### Participants’ roles
Organizer, clarifier, questioner, idea creator, conflict tester, conciliator, factual contributor, helper of others, energizer.

*Some books describe roles as chairperson, secretary/recorder and members.*`,
      keys: ['Problem review', 'Participant selection', 'time, date and place', 'agenda', 'Announcement', 'physical arrangements', 'Opening statement', 'State the problem', 'Encourage', 'Follow-up', 'Organizer', 'Conciliator', 'Energizer'],
      lists: ['l-meeting-before', 'l-meeting-during', 'l-meeting-roles', 'l-meeting-steps'],
      src: KN6,
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
