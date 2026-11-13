// pc-comm — communication basics (AAN sir this term; Kabirul sir's note for earlier batches).
// Source digest: CE301/Claude digests/lec_communication.md (cm-basics). Class notes win over the question bank.
import type { PcTopicContent } from '../types'

const T = 'pc-comm' as const
const KN = 'Kabirul sir note ch.1'

export default {
  lists: [
    {
      id: 'l-comm-process',
      topic: T,
      title: 'Elements of the human communication process',
      ask: 'List the elements of the human communication process — in order.',
      ordered: true,
      points: [
        { k: 'Decision', alt: ['decide to send', 'sender', 'idea'], d: 'Sender takes the decision to send a message.' },
        { k: 'Encoding', alt: ['encode', 'idea encoded'], d: 'The idea is encoded into words, symbols or gestures.' },
        { k: 'Media selection', alt: ['channel', 'medium', 'channel selection', 'media'], d: 'Sender chooses a medium / channel to send the text.' },
        { k: 'Receiving', alt: ['receiver', 'receive'], d: 'Receiver receives the message.' },
        { k: 'Decoding', alt: ['decode', 'interpret'], d: 'Receiver decodes (interprets) the message — AAN sir: the decoder.' },
        { k: 'Feedback', alt: ['response'], d: 'Receiver gives proper feedback; this closes the two-way loop.' },
      ],
      hook: '**D**o **E**agles **M**ake **R**eally **D**elicious **F**ood? — three on the sender side, three on the receiver side.',
      seen: ['2023-24', '2021-22', '2017-18'],
      src: `${KN}; AAN sir L1`,
      note: 'Some books (question bank) give 9 elements: sender, encoding, message, channel, receiver, decoding, feedback, noise, context. Class note = the 6 above.',
    },
    {
      id: 'l-comm-skills',
      topic: T,
      title: 'Basic communication skills',
      points: [
        { k: 'Listening', d: 'Used most of all.' },
        { k: 'Reading' },
        { k: 'Writing' },
        { k: 'Speaking', alt: ['talking'] },
      ],
      hook: '**L**azy **R**eaders **W**rite **S**lowly — listening comes first because it is used most.',
      seen: ['2023-24'],
      src: KN,
    },
    {
      id: 'l-comm-traits',
      topic: T,
      title: 'Traits of an effective communicator',
      points: [
        { k: 'Perception', alt: ['perceive'], d: 'Anticipates how the receiver will understand and react.' },
        { k: 'Precision', alt: ['precise'], d: 'Creates a meeting of minds — the receiver gets exactly the intended meaning.' },
        { k: 'Credibility', alt: ['credible', 'believable', 'trust'], d: 'The receiver believes the sender’s facts and intentions.' },
        { k: 'Control', d: 'Shapes the response and keeps control of the message and situation.' },
        { k: 'Congeniality', alt: ['congenial', 'friendly', 'likeable'], d: 'Friendly, pleasant relations; being liked — AAN sir: first impression.' },
      ],
      hook: '**PP-CCC**: two P’s then three C’s (the C’s run Cr → Co → Cong).',
      seen: ['2023-24'],
      src: `AAN sir L1; ${KN}`,
      note: 'AAN sir’s order: perception, precision, credibility, control, congeniality. Kabirul sir’s note puts congeniality before control.',
    },
    {
      id: 'l-comm-importance',
      topic: T,
      title: 'Importance and necessity of communication',
      points: [
        { k: 'Perform team work', alt: ['teamwork'], d: 'Team work is done properly only through communication.' },
        { k: 'Achieve organisational objectives', alt: ['objectives of business organization', 'achieve objectives'], d: 'Objectives of the business organisation are reached through it.' },
        { k: 'Management and coordination', alt: ['coordination', 'management'], d: 'Management and coordination tasks run smoothly.' },
        { k: 'Planning and control', alt: ['making plan', 'control'], d: 'Making plans and keeping control over them.' },
        { k: 'Prime quality for employee selection', alt: ['selection of employee', 'recruitment'], d: 'Communication skill is a prime quality when selecting an employee.' },
        { k: 'Requisite for career progress', alt: ['job progress', 'promotion', 'career'], d: 'Needed for job and career progress; executives spend 60–90 % of time communicating.' },
      ],
      hook: 'Picture a team climbing to a goal: **team** → **objective** → **coordination** → **plan/control**, and the climber who talks best gets **hired** and **promoted**.',
      seen: ['2017-18', '2015-16'],
      src: KN,
      note: 'Question-bank version: links departments, planning/decisions, motivation and morale, links firm with clients/public, prevents costly errors and disputes, employers rank it for promotion.',
    },
    {
      id: 'l-comm-global',
      topic: T,
      title: 'Importance of communication in global business',
      points: [
        { k: 'Business crosses national borders', alt: ['cross national border', 'international business'] },
        { k: 'Diversified work force', alt: ['diverse workforce'] },
        { k: 'Understand laws, customs and practices', alt: ['laws', 'customs', 'business practices of other countries'], d: 'Learn the laws, customs and business practices of other countries.' },
      ],
      seen: [],
      src: KN,
    },
    {
      id: 'l-comm-categories',
      topic: T,
      title: 'Broad categories of communication in an organisation',
      ask: 'What are the three broad categories of communication (communication activities) in an organisation?',
      points: [
        { k: 'Internal operational', alt: ['internal'], d: 'Within the organisation to carry out its work: horizontal, upward, downward.' },
        { k: 'External operational', alt: ['external'], d: 'Work-related communication with suppliers, service providers, public and customers.' },
        { k: 'Personal', alt: ['interpersonal', 'personal communication'], d: 'Not on a hierarchical path; not business itself but affects attitude and work.' },
      ],
      seen: ['2020-21', '2016-17', '2015-16', '2014-15', '2012-13', '2011-12'],
      src: KN,
    },
    {
      id: 'l-comm-internal',
      topic: T,
      title: 'Types of internal operational communication (formal channels)',
      points: [
        { k: 'Horizontal', alt: ['lateral'], d: 'Department ↔ department, office ↔ office; helps employees work efficiently.' },
        { k: 'Vertical upward', alt: ['upward'], d: 'Information, opinions, problems, complaints, suggestions from lower level to managers; helps monitoring and decision making.' },
        { k: 'Vertical downward', alt: ['downward'], d: 'Information, decisions, orders from top to bottom; conveys rules, objectives and methods.' },
      ],
      seen: ['2020-21', '2016-17', '2011-12'],
      src: KN,
      note: 'Question bank adds diagonal, formal network and informal network (grapevine) — not in the class note; mention only as extras.',
    },
    {
      id: 'l-comm-external',
      topic: T,
      title: 'External operational communication — with whom',
      points: [
        { k: 'Suppliers' },
        { k: 'Service providers' },
        { k: 'Public', alt: ['general public', 'government'] },
        { k: 'Customers', alt: ['clients'] },
      ],
      hook: 'The company talks to the people who **S**ell to it, **S**erve it, **W**atch it and **B**uy from it.',
      seen: ['2016-17', '2011-12'],
      src: KN,
      note: 'Aim: convey warmth, understanding and positiveness.',
    },
    {
      id: 'l-comm-external-methods',
      topic: T,
      title: 'Methods of external operational communication',
      points: [
        { k: 'Brochure, newspaper, magazine', alt: ['print media', 'brochure', 'newspaper'] },
        { k: 'Radio, television', alt: ['radio', 'tv', 'television'] },
        { k: 'Telephone', alt: ['phone'] },
        { k: 'Public speech and tactful reply', alt: ['public speech', 'tactful reply'] },
      ],
      seen: ['2011-12'],
      src: KN,
    },
    {
      id: 'l-comm-personal',
      topic: T,
      title: 'Features of personal (interpersonal) communication',
      points: [
        { k: 'Follows no hierarchical path', alt: ['no hierarchy'] },
        { k: 'Not business communication but affects business', alt: ['affects business'] },
        { k: 'Affects attitude, motivation, behaviour', alt: ['attitude', 'motivation', 'behaviour'] },
        { k: 'Problems cause mental upset', alt: ['mental upset'] },
        { k: 'Excess hinders work', alt: ['too much hinders work'] },
      ],
      seen: ['2016-17', '2011-12'],
      src: KN,
    },
    {
      id: 'l-comm-business-types',
      topic: T,
      title: 'Ways to classify business communication',
      points: [
        { k: 'By scope', alt: ['internal external personal'], d: 'Internal operational, external operational, personal.' },
        { k: 'By direction', alt: ['upward downward horizontal'], d: 'Downward, upward, horizontal (books add diagonal).' },
        { k: 'By formality', alt: ['formal informal', 'grapevine'], d: 'Formal (official channels) and informal (grapevine).' },
        { k: 'By form', alt: ['verbal non-verbal', 'oral written'], d: 'Verbal — oral and written; non-verbal; visual.' },
      ],
      seen: ['2014-15'],
      src: 'question bank only (Lesikar); scope and direction are in Kabirul sir note ch.1',
    },
    {
      id: 'l-comm-nonverbal',
      topic: T,
      title: 'Main elements of non-verbal communication',
      points: [
        { k: 'Appearance', d: 'Personal appearance and appearance of surroundings — the receiver forms a conception before reading or hearing.' },
        { k: 'Body language', alt: ['kinesics'], d: 'Facial expression, gesture/posture, smell/touch, voice/sound.' },
        { k: 'Silence, time and space', alt: ['silence', 'time', 'space', 'proxemics'], d: 'Silence or delay, use of time and of distance also send messages.' },
      ],
      seen: ['2022-23', '2021-22', '2017-18', '2016-17'],
      src: KN,
      note: 'Question bank’s third element is “sounds / paralanguage” — class note has silence, time and space, with voice inside body language.',
    },
    {
      id: 'l-comm-body-language',
      topic: T,
      title: 'Elements of body language',
      points: [
        { k: 'Facial expression', alt: ['face', 'eye contact'] },
        { k: 'Gesture and posture', alt: ['gesture', 'posture'] },
        { k: 'Smell and body touch', alt: ['touch', 'smell', 'handshake'] },
        { k: 'Voice and sound', alt: ['voice', 'tone', 'paralanguage'] },
      ],
      hook: 'Work down the body: **F**ace → **G**esture → **T**ouch/smell → and the **V**oice that comes out.',
      seen: ['2021-22'],
      src: KN,
      note: 'Body language can reveal hidden emotion and cause business loss. Question bank also lists eye contact, movement and use of space.',
    },
    {
      id: 'l-comm-barriers',
      topic: T,
      title: 'Major problems (barriers) in communication',
      ask: 'Why do problems in communication occur? List the major problems.',
      points: [
        { k: 'Convention of meaning', alt: ['conventions of meaning', 'meaning of words', 'semantic'], d: 'Words carry dictionary and personal meanings: denotation/connotation, euphemism, miscommunicated instructions.' },
        { k: 'Perception of reality', alt: ['perception'], d: 'Each person sees reality differently: abstracting, slanting, inferring.' },
        { k: 'Values, attitudes and opinions', alt: ['values', 'attitudes', 'opinions'], d: 'Favourable/unfavourable info, closed mind, sender’s credibility, circumstances.' },
      ],
      seen: ['2022-23', '2017-18', '2016-17'],
      src: KN,
      note: 'Question bank uses six other categories (physical, semantic, perceptual, personal, cultural, organisational). Write the class three.',
    },
    {
      id: 'l-comm-meaning-problems',
      topic: T,
      title: 'Sub-categories of convention of meaning',
      points: [
        { k: 'Denotation and connotation', alt: ['denotation', 'connotation'] },
        { k: 'Euphemism', d: 'A soft word put in place of a harsh one.' },
        { k: 'Miscommunicated instructions', alt: ['bypassing', 'miscommunication'], d: 'Same word, different meanings (or different words, same meaning).' },
      ],
      seen: ['2022-23', '2017-18', '2011-12'],
      src: KN,
    },
    {
      id: 'l-comm-perception-problems',
      topic: T,
      title: 'Sub-categories of perception of reality',
      points: [
        { k: 'Abstracting', alt: ['abstraction'], d: 'Focusing on some details, omitting others.' },
        { k: 'Slanting', alt: ['slanted abstract', 'slanted attitude'], d: 'Details chosen to mislead or deceive.' },
        { k: 'Inferring', alt: ['inference', 'assumption'], d: 'Concluding about the unknown from the known.' },
      ],
      seen: ['2022-23', '2017-18', '2016-17'],
      src: KN,
    },
    {
      id: 'l-comm-value-problems',
      topic: T,
      title: 'Sub-categories of values, attitudes and opinions',
      points: [
        { k: 'Favourable or unfavourable information', alt: ['favorable', 'unfavourable information'] },
        { k: 'Adequate or inadequate information', alt: ['inadequate information'] },
        { k: 'Closed mind', alt: ['closed minds'] },
        { k: 'Sender’s credibility', alt: ['sender attitude', "sender's credibility", 'credibility'] },
        { k: 'Circumstances' },
      ],
      hook: 'Is the news **good**, is it **enough**, is the reader’s mind **open**, do they **trust** me, and is it the **right moment**?',
      seen: ['2022-23', '2017-18'],
      src: KN,
    },
  ],

  cards: [
    { id: 'c-comm-define', topic: T, front: 'Define **communication** (class wording).', back: 'A **two-way process** of **sending and receiving verbal and non-verbal messages**, exchanging ideas, intelligence and information, hoping to get the **desired reaction/response** of the receivers. AAN sir: “not necessarily verbal”.', seen: ['2023-24', '2017-18', '2015-16'], src: `${KN}; AAN sir L1` },
    { id: 'c-comm-decoder', topic: T, front: 'AAN sir: what is the **decoder**, and what causes miscommunication at that end?', back: 'The decoder is the receiving side that takes in the information. When the **speed of delivery and of receiving don’t sync**, it **causes miscommunication**.', src: 'AAN sir L1' },
    { id: 'c-comm-listening', topic: T, front: 'Which basic communication skill is used most?', back: '**Listening** — listed first of listening, reading, writing, speaking.', src: KN },
    { id: 'c-comm-exec-time', topic: T, front: 'How much of a management executive’s time goes on communication?', back: 'About **60–90 %** of working time.', src: KN },
    { id: 'c-comm-methods', topic: T, front: 'Name written and oral **methods** of communication.', back: '**Written**: letter, memo, report, manual, e-mail, advertising. **Oral**: conference, meeting, interview.', src: KN },
    { id: 'c-comm-upward', topic: T, front: 'What flows **upward** in an organisation, and what is it for?', back: 'Information, **opinions, problems, complaints, suggestions** from lower level to managers — helps **monitoring and decision making**.', seen: ['2020-21', '2011-12'], src: KN },
    { id: 'c-comm-downward', topic: T, front: 'What flows **downward** in an organisation?', back: 'Information, **decisions and orders** from top to bottom — the organisation’s **rules, objectives and methods**.', seen: ['2020-21', '2011-12'], src: KN },
    { id: 'c-comm-external-aim', topic: T, front: 'What should external operational communication convey?', back: '**Warmth, understanding and positiveness** — to suppliers, service providers, public and customers.', src: KN },
    { id: 'c-comm-bypassing', topic: T, front: 'What is **bypassing** (miscommunicated instructions)?', back: 'Sender and receiver give **different meanings to the same word** (or use different words for the same meaning), so they miss each other. E.g. “send it as soon as you can” — manager means today, clerk sends next week. Cure: be specific, ask for feedback.', seen: ['2011-12'], src: KN },
    { id: 'c-comm-abstracting', topic: T, front: 'What is **abstracting**?', back: 'Focusing on **some details** of reality and **omitting the rest**. Necessary — no one can report every detail — but trouble comes when important details are left out.', seen: ['2022-23', '2017-18', '2016-17', '2014-15', '2012-13', '2011-12'], src: KN },
    { id: 'c-comm-inferring', topic: T, front: 'What is **inferring**?', back: 'Drawing a **conclusion about the unknown from the known**, filling gaps with **assumptions** (time and space force us to assume). Risky when taken as fact — **verify**. E.g. empty site → “contractor has abandoned the job” (may be a holiday).', seen: ['2016-17', '2014-15', '2012-13', '2011-12'], src: KN },
    { id: 'c-comm-slanting', topic: T, front: 'What is a **slanted attitude** (slanting)?', back: 'Presenting **factual** details selectively, or with loaded words, to **mislead or deceive** — it shows the sender’s bias. “Finished 90 % of the work” vs “failed to finish 10 %”.', seen: ['2011-12'], src: KN },
    { id: 'c-comm-denotation', topic: T, front: '**Denotation** vs **connotation**?', back: '**Denotation**: literal, dictionary meaning shared by most people. **Connotation**: emotional/associated meaning, positive or negative, varying by person and culture. “Cheap” and “economical” both denote low price; “cheap” connotes poor quality.', seen: ['2022-23', '2014-15', '2012-13'], src: KN },
    { id: 'c-comm-euphemism', topic: T, front: 'What is a **euphemism**?', back: 'A **soft, pleasant word put in place of a harsh one** (“passed away” for “died”, “let go” for “sacked”) — a convention-of-meaning problem because the softened word can hide the real meaning.', src: KN },
    { id: 'c-comm-culture', topic: T, front: 'Define **culture**.', back: 'A **shared system of symbols, beliefs, attitudes, values, behaviour and expectations**. Within one culture people share meanings, so communication flows easily.', src: KN },
    { id: 'c-comm-context', topic: T, front: '**Low-context** vs **high-context** culture?', back: '**Low-context**: values the **written word and written agreements**, follows law strictly. **High-context**: **less emphasis on the written word**, more flexible with law, relies on relationships and context.', src: KN },
    { id: 'c-comm-ethnocentrism', topic: T, front: '**Ethnocentrism** vs **stereotyping**?', back: '**Ethnocentrism**: judging other cultures by your own cultural background (yours is best). **Stereotyping**: predicting an individual’s behaviour from the group or class he belongs to.', src: KN },
    { id: 'c-comm-appearance', topic: T, front: 'Why does **appearance** count as non-verbal communication?', back: 'Before reading or hearing the message the receiver already forms a conception from **personal appearance** and the **appearance of the surroundings** (or of the document).', src: KN },
  ],

  answers: [
    {
      id: 'a-comm-definition',
      topic: T,
      q: 'Define communication.',
      seen: ['2023-24', '2017-18', '2015-16'],
      a: `Communication is a **two-way process** of **sending and receiving** **verbal and non-verbal messages**, exchanging **ideas, intelligence and information**, hoping to get the **desired response** of the receivers.

- It is not necessarily verbal — gestures, appearance and silence also communicate.
- It is complete only when the receiver decodes the message and gives **feedback**.

*Some books:* “the process of transmitting information and common understanding from one person or group to another.”`,
      keys: ['two-way process', 'sending and receiving', 'verbal and non-verbal', 'ideas, intelligence and information', 'desired response', 'feedback'],
      src: `${KN}; AAN sir L1`,
    },
    {
      id: 'a-comm-process',
      topic: T,
      q: 'Describe the process (elements) of human communication.',
      seen: ['2023-24', '2021-22', '2017-18'],
      a: `Human communication is a two-way process: three steps at the **sender** and three at the **receiver**.

### Sender
1. **Decision** — the sender has an idea and takes the decision to send a message.
2. **Encoding** — the idea is encoded into words, symbols or gestures.
3. **Media selection** — the sender chooses a suitable medium/channel (letter, e-mail, phone, meeting) to send it.

### Receiver
4. **Receiving** — the receiver receives the message.
5. **Decoding** — the receiver interprets the symbols into meaning; if delivery and receiving speeds don’t sync, **miscommunication** results.
6. **Feedback** — the receiver gives proper feedback, telling the sender whether the message was understood.

Communication succeeds when the meaning decoded matches the meaning encoded.

*Some books list 9 elements: sender, encoding, message, channel, receiver, decoding, feedback, noise and context.*`,
      keys: ['Decision', 'Encoding', 'Media selection', 'Receiving', 'Decoding', 'Feedback', 'sender', 'receiver', 'miscommunication'],
      lists: ['l-comm-process'],
      src: `${KN}; AAN sir L1`,
    },
    {
      id: 'a-comm-skills-traits',
      topic: T,
      q: 'Name the basic communication skills and the traits of an effective communicator.',
      seen: ['2023-24'],
      a: `### Basic communication skills
1. **Listening** (used most)
2. **Reading**
3. **Writing**
4. **Speaking**

### Traits of an effective communicator
1. **Perception** — anticipates how the receiver will react.
2. **Precision** — the receiver gets exactly the intended meaning.
3. **Credibility** — the receiver believes the sender.
4. **Control** — shapes the response and the situation.
5. **Congeniality** — friendly, pleasant relations; good first impression.`,
      keys: ['Listening', 'Reading', 'Writing', 'Speaking', 'Perception', 'Precision', 'Credibility', 'Control', 'Congeniality'],
      lists: ['l-comm-skills', 'l-comm-traits'],
      src: `AAN sir L1; ${KN}`,
    },
    {
      id: 'a-comm-importance',
      topic: T,
      q: 'Why is communication important? Explain the importance and necessity of communication in business.',
      seen: ['2017-18', '2015-16'],
      a: `1. **Team work** — work is done as a team only through communication.
2. **Objectives** — the business organisation achieves its objectives through it.
3. **Management and coordination** — management and coordination tasks run smoothly.
4. **Planning and control** — plans are made and controlled through information flow.
5. **Employee selection** — communication skill is a prime quality for selecting an employee.
6. **Career progress** — it is a requisite for job and career progress; management executives spend **60–90 %** of their time communicating.

### In global business
- Encourages business to **cross national borders**.
- Handles a **diversified work force**.
- Helps people understand the **laws, customs and business practices** of other countries.`,
      keys: ['Team work', 'Objectives', 'Management and coordination', 'Planning and control', 'Employee selection', 'Career progress', '60–90 %', 'national borders'],
      lists: ['l-comm-importance', 'l-comm-global'],
      src: KN,
    },
    {
      id: 'a-comm-categories',
      topic: T,
      q: 'Describe the three broad categories of communication activities (formal communication channels) of an organisation and the types of internal operational communication.',
      seen: ['2020-21', '2016-17', '2015-16', '2012-13', '2011-12'],
      a: `### 1. Internal operational communication
Communication inside the organisation to carry out its work.
- **Horizontal** — department ↔ department, office ↔ office; helps employees do their work efficiently.
- **Vertical upward** — information, opinions, problems, complaints and suggestions from the lower level to managers; helps monitoring and decision making.
- **Vertical downward** — information, decisions and orders from the top down; conveys the organisation’s rules, objectives and methods.

### 2. External operational communication
Work-related communication with **suppliers, service providers, the public and customers**. It should convey **warmth, understanding and positiveness**. Methods: brochures, newspapers, magazines; radio and television; telephone; public speech and tactful replies.

### 3. Personal (interpersonal) communication
- Follows **no hierarchical path**.
- Not business communication itself, but **affects business**.
- Affects workers’ **attitude, motivation and behaviour**.
- Problems in it can cause mental upset; too much of it hinders work.

*Some books also list diagonal communication and the informal network (grapevine) under internal communication.*`,
      keys: ['Internal operational', 'External operational', 'Personal', 'Horizontal', 'Vertical upward', 'Vertical downward', 'suppliers', 'customers', 'warmth, understanding and positiveness', 'no hierarchical path'],
      lists: ['l-comm-categories', 'l-comm-internal', 'l-comm-external', 'l-comm-external-methods', 'l-comm-personal'],
      src: KN,
    },
    {
      id: 'a-comm-business-types',
      topic: T,
      q: 'Describe briefly the different types of business communication.',
      seen: ['2014-15'],
      a: `1. **By scope** — internal operational (inside the firm), external operational (with suppliers, service providers, public, customers) and personal communication.
2. **By direction** (internal) — vertical downward (orders, decisions), vertical upward (reports, complaints, suggestions) and horizontal (between departments); some books add diagonal.
3. **By formality** — formal (through official channels, documented: memos, reports, minutes) and informal (grapevine; fast but carries rumours).
4. **By form** — verbal: oral (face-to-face, telephone, meetings, presentations) and written (letters, memos, e-mails, reports, proposals); non-verbal (appearance, body language, silence, time and space); visual (charts, drawings, slides).`,
      keys: ['By scope', 'By direction', 'By formality', 'By form', 'internal operational', 'external operational', 'formal', 'informal', 'oral', 'written', 'non-verbal'],
      lists: ['l-comm-business-types', 'l-comm-categories'],
      src: 'question bank only (Lesikar); scope and direction from Kabirul sir note ch.1',
    },
    {
      id: 'a-comm-nonverbal',
      topic: T,
      q: 'Describe the three main elements (types) of non-verbal communication and the elements of body language.',
      seen: ['2022-23', '2021-22', '2017-18', '2016-17'],
      a: `### 1. Appearance
Before reading or hearing the message, the receiver forms a conception from it.
- **Personal appearance** — dress, grooming of the sender.
- **Appearance of surroundings** — the room, the layout and neatness of a document.

### 2. Body language
- **Facial expression** (incl. eye contact)
- **Gesture and posture**
- **Smell and body touch** (handshake)
- **Voice and sound** (tone, pitch)

Body language can reveal **hidden emotion**, which may cause business loss.

### 3. Silence, time and space
Long silence or delay (keeping someone waiting), the use of time and the distance kept between people all send messages about status and attitude.

*Some books give the third element as “sounds / paralanguage”; in the class note voice sits inside body language.*`,
      keys: ['Appearance', 'Body language', 'Silence, time and space', 'Personal appearance', 'surroundings', 'Facial expression', 'Gesture and posture', 'touch', 'Voice', 'hidden emotion'],
      lists: ['l-comm-nonverbal', 'l-comm-body-language'],
      src: KN,
    },
    {
      id: 'a-comm-barriers',
      topic: T,
      q: 'What is a problem and barrier to communication? Why do problems occur? List the major problems with sub-categories.',
      seen: ['2022-23', '2017-18', '2016-17'],
      a: `A **problem or barrier** to communication is anything that stops the receiver getting the meaning the sender intended — the message is blocked, distorted or misunderstood. Problems occur because words, perceptions and attitudes differ from person to person.

### 1. Convention of meaning
- **Denotation and connotation** — dictionary vs emotional meaning.
- **Euphemism** — a soft word in place of a harsh one.
- **Miscommunicated instructions** (bypassing) — same word, different meanings.

### 2. Perception of reality
- **Abstracting** — focusing on some details, omitting others.
- **Slanting** — details chosen to mislead or deceive.
- **Inferring** — conclusions and assumptions about the unknown.

### 3. Values, attitudes and opinions
- Favourable or unfavourable information
- Adequate or inadequate information
- **Closed mind**
- Sender’s credibility (attitude)
- Circumstances

*Some books classify barriers as physical, semantic, perceptual, personal, cultural and organisational.*`,
      keys: ['problem or barrier', 'Convention of meaning', 'Perception of reality', 'Values, attitudes and opinions', 'Denotation and connotation', 'Euphemism', 'Miscommunicated instructions', 'Abstracting', 'Slanting', 'Inferring', 'Closed mind'],
      lists: ['l-comm-barriers', 'l-comm-meaning-problems', 'l-comm-perception-problems', 'l-comm-value-problems'],
      src: KN,
    },
    {
      id: 'a-comm-abstracting-inferring',
      topic: T,
      q: 'Briefly explain abstracting (abstraction) and inferring.',
      seen: ['2022-23', '2017-18', '2016-17', '2014-15', '2012-13', '2011-12'],
      a: `### Abstracting
- **Abstracting** is focusing on **some details** of an object or event and **omitting the rest**; every description is an abstraction.
- It is necessary — reality has endless details — and lets us summarise and generalise.
- Words sit on a ladder of abstraction: “Jamuna Bridge” → “bridge” → “structure” → “asset” — higher means vaguer.
- Problem: important details may be left out, and a **slanted** abstract can mislead.

### Inferring
- **Inferring** is drawing a **conclusion about the unknown from the known**.
- Because of limits of time and space we fill gaps with **assumptions**.
- Risky when an inference is treated as a fact — **verify** before acting.
- Example: “The site is empty today” (fact) → “the contractor has abandoned the job” (inference — it may be a holiday).`,
      keys: ['Abstracting', 'some details', 'omitting the rest', 'ladder of abstraction', 'Inferring', 'conclusion about the unknown from the known', 'assumptions', 'verify'],
      lists: ['l-comm-perception-problems'],
      src: KN,
    },
    {
      id: 'a-comm-denotation-connotation',
      topic: T,
      q: 'Explain denotation and connotation.',
      seen: ['2022-23', '2014-15', '2012-13'],
      a: `Both belong to the **convention of meaning** problem.

### Denotation
- The **literal, dictionary meaning** of a word, shared by most people.
- Example: “cheap” = low in price; “slum” = densely populated area with poor housing.
- Concrete writing uses denotative words.

### Connotation
- The **emotional or associated meaning** a word carries — **positive or negative** — which varies with the person and culture.
- Example: “cheap” and “economical” both denote low cost, but “cheap” connotes poor quality; “statesman” vs “politician”.
- Choose words whose connotations suit the purpose; a **euphemism** is a soft word chosen for its gentler connotation.`,
      keys: ['convention of meaning', 'Denotation', 'dictionary meaning', 'Connotation', 'emotional', 'positive or negative', 'euphemism'],
      lists: ['l-comm-meaning-problems'],
      src: KN,
    },
    {
      id: 'a-comm-bypassing-slanting',
      topic: T,
      q: 'Briefly explain (i) miscommunication — bypassing (miscommunicated instructions), (ii) slanted attitude.',
      seen: ['2011-12'],
      a: `### (i) Bypassing (miscommunicated instructions)
Sender and receiver attach **different meanings to the same word** (or use different words for the same meaning), so the instruction is misunderstood. E.g. “Send it as soon as you can” — the manager means today, the clerk sends it next week. Avoid by being specific and asking for **feedback**.

### (ii) Slanted attitude (slanting)
Presenting **factual** details selectively, or with loaded words, to **mislead or deceive** the receiver; it reveals the sender’s **bias**. E.g. “finished 90 % of the work” vs “failed to finish 10 % of the work”.`,
      keys: ['Bypassing', 'different meanings to the same word', 'feedback', 'Slanted attitude', 'factual', 'mislead or deceive', 'bias'],
      lists: ['l-comm-meaning-problems', 'l-comm-perception-problems'],
      src: KN,
    },
  ],
} satisfies PcTopicContent
