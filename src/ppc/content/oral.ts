// pc-oral — oral presentation and meetings.
// Sources: Kabirul sir's note ch.5 (oral presentation) and ch.6 (meeting). Leadership styles: question bank only.
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
        { k: 'Determine the purpose', alt: ['purpose', 'define purpose'], d: 'Inform, persuade, recommend?' },
        { k: 'Analyse audience and occasion', alt: ['audience', 'occasion', 'analyze audience'], d: 'Size, knowledge, interest, attitude; the setting and time.' },
        { k: 'Select the main idea', alt: ['main idea', 'select topic', 'topic'] },
        { k: 'Research the data', alt: ['research', 'gather material', 'data'] },
        { k: 'Organise the message', alt: ['organise', 'organize', 'outline'], d: 'Introduction, body (2–4 points), conclusion.' },
        { k: 'Create visual aids', alt: ['visual aid', 'slides'] },
        { k: 'Write the draft', alt: ['draft', 'notes', 'cue cards'] },
        { k: 'Rehearse the talk', alt: ['rehearse', 'practice', 'rehearsal'] },
      ],
      hook: '**P**eople **A**lways **S**ay **R**esearch **O**rganises **V**ery **W**ell, **R**eally — Purpose, Audience, Select, Research, Organise, Visuals, Write, Rehearse.',
      seen: ['2021-22', '2016-17', '2013-14'],
      src: KN5,
      note: 'Order of “create visual aids” and “write the draft” is read from the note’s columns. Question bank: purpose, audience, research, organise, visual aids, notes/timing, rehearse, check room and equipment, anticipate questions.',
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
      title: 'Strategies for effective verbal (vocal) delivery',
      ask: 'Enumerate the strategies (steps) for effective verbal delivery.',
      points: [
        { k: 'Pitch', alt: ['vary pitch', 'tone'] },
        { k: 'Pronunciation', alt: ['articulation', 'pronounce clearly'] },
        { k: 'Rate', alt: ['speed', 'pace', 'pauses'] },
        { k: 'Volume', alt: ['loudness'] },
        { k: 'Vocal quality', alt: ['voice quality'] },
      ],
      hook: '**PP R VV** — two P’s, an R, two V’s.',
      seen: ['2021-22'],
      src: KN5,
      note: 'Question bank gives general tips instead: conversational voice, vary pitch/volume/rate, articulate, eye contact, gestures, enthusiasm, watch feedback, keep time.',
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
      seen: ['2021-22'],
      src: KN5,
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
        { k: 'Autocratic', alt: ['directive', 'authoritarian'], d: 'Chair sets agenda, controls discussion, decides. Fast; stifles ideas.' },
        { k: 'Democratic', alt: ['participative', 'participatory'], d: 'Chair guides, invites all, seeks consensus/vote. Better decisions and buy-in; slower.' },
        { k: 'Laissez-faire', alt: ['free-rein', 'free rein', 'laissez faire'], d: 'Little direction; works only with expert, motivated members.' },
      ],
      seen: ['2023-24', 'May 2024'],
      src: QB,
      note: 'Not in the class note. Most effective: democratic, adjusted to the situation.',
    },
  ],

  cards: [
    { id: 'c-oral-best-method', topic: T, front: 'Which way of delivering an oral message is **most recommended**, and why?', back: '**Extemporaneous** — prepared, spoken from short notes on 3×5" cards, so words come naturally and **eye contact is greatest**.', src: KN5 },
    { id: 'c-oral-reading', topic: T, front: 'When is **reading** a speech word for word acceptable?', back: 'Only for **policy statements** or where a small mistake is crucial — e.g. a court giving its verdict. Otherwise not recommended.', src: KN5 },
    { id: 'c-oral-memorise', topic: T, front: 'Why is **memorisation** not recommended?', back: 'In a long speech a part may be **forgotten**, and the delivery sounds mechanical.', src: KN5 },
    { id: 'c-oral-impromptu', topic: T, front: 'What is an **impromptu** delivery?', back: 'Speaking **without preparation** — saying what comes at the moment.', src: KN5 },
    { id: 'c-oral-cards', topic: T, front: 'What size note cards does the note suggest for extemporaneous delivery?', back: '**3 × 5 inch** cards with short notes.', src: KN5 },
    { id: 'c-oral-verbal-mnemonic', topic: T, front: 'Verbal delivery mnemonic **PP R VV** stands for?', back: '**P**itch, **P**ronunciation, **R**ate, **V**olume, **V**ocal quality.', seen: ['2021-22'], src: KN5 },
    { id: 'c-meeting-after', topic: T, front: 'What is done **after** a meeting?', back: '**Follow-up** — circulate minutes, check that action items are done by the people assigned.', seen: ['2013-14'], src: KN6 },
    { id: 'c-meeting-informal', topic: T, front: '**Informal** vs **suggested-solution** meeting?', back: '**Informal**: open discussion where members learn and share about a new matter. **Suggested-solution**: possible solutions are proposed and the final solution is chosen.', src: KN6 },
    { id: 'c-meeting-physical', topic: T, front: 'What “physical arrangements” are checked before a meeting?', back: '**Visual aids**, **seating pattern** and **materials needed**.', seen: ['2013-14'], src: KN6 },
    { id: 'c-meeting-conciliator', topic: T, front: 'Meeting roles: **conciliator** vs **energizer**?', back: '**Conciliator**: settles conflicts and keeps harmony. **Energizer**: motivates the group, keeps the energy up.', src: KN6 },
    { id: 'c-leadership-best', topic: T, front: 'Which meeting leadership style is most effective, and why? (one line)', back: '**Democratic** — engineering/business meetings exist to pool knowledge and reach decisions members must carry out; participation gives better decisions and buy-in. Chair still controls time and turns directive when a quick decision is needed.', seen: ['2023-24', 'May 2024'], src: QB },
    { id: 'c-leadership-autocratic', topic: T, front: 'When does an **autocratic** meeting style work?', back: 'In **emergencies**, when a fast decision is needed, or with an inexperienced group. Downside: stifles ideas and commitment.', seen: ['2023-24', 'May 2024'], src: QB },
  ],

  answers: [
    {
      id: 'a-oral-steps',
      topic: T,
      q: 'Describe the steps for preparing an effective oral presentation.',
      seen: ['2021-22', '2016-17', '2013-14'],
      a: `1. **Determine the purpose** — inform, persuade or recommend; what should the audience do afterwards?
2. **Analyse the audience and occasion** — size, knowledge, interests, attitude; the setting, time available.
3. **Select the main idea** — the one central message and the topic it needs.
4. **Research the data** — gather facts, figures and examples.
5. **Organise the message** — introduction (attention, purpose, preview), body (2–4 main points with evidence), conclusion (summary, recommendation).
6. **Create visual aids** — clear slides, charts, models.
7. **Write the draft** — the talk and short notes (3×5" cards).
8. **Rehearse the talk** — aloud, timed, ideally before a test audience.

Deliver it **extemporaneously** (from notes) — not read or memorised.

*Some books add: check the room and equipment, and anticipate questions.*`,
      keys: ['Determine the purpose', 'audience and occasion', 'main idea', 'Research', 'Organise the message', 'visual aids', 'Write the draft', 'Rehearse', 'extemporaneously'],
      lists: ['l-oral-steps', 'l-oral-delivery-methods'],
      src: KN5,
    },
    {
      id: 'a-oral-verbal-delivery',
      topic: T,
      q: 'Enumerate the steps (strategies) for effective verbal delivery.',
      seen: ['2021-22'],
      a: `### Verbal (vocal) delivery — five strategies
1. **Pitch** — vary it; a monotone loses the audience.
2. **Pronunciation** — clear and correct; articulate every word.
3. **Rate** — not too fast or slow; pause for emphasis.
4. **Volume** — loud enough for the back row, varied for emphasis.
5. **Vocal quality** — pleasant, confident, conversational voice.

### Non-verbal delivery (support)
**Posture**, **gesture**, **facial expression** (eye contact) and purposeful **movement**.

*Books add: avoid fillers (“um”), keep eye contact, watch the audience’s feedback and keep to time.*`,
      keys: ['Pitch', 'Pronunciation', 'Rate', 'Volume', 'Vocal quality', 'Posture', 'gesture', 'facial expression', 'movement'],
      lists: ['l-oral-verbal', 'l-oral-nonverbal'],
      src: KN5,
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
      seen: ['2023-24', 'May 2024'],
      a: `### 1. Autocratic (directive)
The chair sets the agenda, controls the discussion and takes the decisions. **Fast** and useful in emergencies or with inexperienced groups, but **stifles ideas** and commitment.

### 2. Democratic (participative)
The chair guides the discussion, invites everyone to contribute and seeks **consensus** or a vote. Builds **commitment** and better decisions, but takes longer.

### 3. Laissez-faire (free-rein)
The chair gives little direction; the group manages itself. Works only with **expert, motivated members**; otherwise discussion drifts.

### Most effective — democratic
- Engineering and business meetings exist to **pool knowledge** and reach decisions that members must carry out.
- Participation gives **better-informed decisions** and **buy-in**, so decisions get implemented.
- The chair should still keep control of time and agenda, becoming more directive when a quick decision is needed — i.e. democratic, **adjusted to the situation**.`,
      keys: ['Autocratic', 'Democratic', 'Laissez-faire', 'stifles ideas', 'consensus', 'commitment', 'expert, motivated members', 'pool knowledge', 'buy-in', 'adjusted to the situation'],
      lists: ['l-leadership'],
      src: QB,
    },
  ],
} satisfies PcTopicContent
