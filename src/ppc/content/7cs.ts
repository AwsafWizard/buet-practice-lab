// pc-7cs — the seven C’s. Source: Noor sir L07 slide (= the 18-batch solve text). Sumaiya ma’am’s 2023 lecture (another teacher) only as marked extras; question-bank examples marked.
import type { PcTopicContent } from '../types'

const T = 'pc-7cs' as const
const S7 = 'Noor sir L07 (slide) = 18-batch solve'
const SA = 'Sumaiya ma’am’s 7 C lecture (2023, another teacher) — extra, not Noor sir’s slide'
const QB = 'question bank (standard text) — extra, not on the slide'

export default {
  lists: [
    {
      id: 'l-7cs',
      topic: T,
      title: 'Seven C’s of effective communication',
      ask: 'List the seven C’s of effective communication (in the usual order).',
      ordered: true,
      points: [
        { k: 'Completeness', alt: ['complete'], d: 'All the information the receiver needs.' },
        { k: 'Conciseness', alt: ['concise'], d: 'Fewest words without losing meaning.' },
        { k: 'Consideration', alt: ['considerate', 'you attitude'], d: 'Receiver in mind — “you” attitude.' },
        { k: 'Concreteness', alt: ['concrete'], d: 'Specific, definite, vivid.' },
        { k: 'Clarity', alt: ['clear', 'clearness'], d: 'Needed for an accurate understanding of the message.' },
        { k: 'Courtesy', alt: ['courteous', 'politeness'], d: 'Sincere tact and respect.' },
        { k: 'Correctness', alt: ['correct', 'accuracy'], d: 'Right facts, figures, grammar and format.' },
      ],
      hook: 'Story of writing a letter: first make it **whole**, then **trim** it, then think of the **reader**, then add **numbers**; finally make it **plain**, **polite** and **proof-read**. Four “Con/Com” words, then Cla–Cou–Cor.',
      seen: ['2022-23', 'Jan 2021', '2015-16', '2013-14'],
      src: S7,
    },
    {
      id: 'l-7cs-completeness',
      topic: T,
      title: 'Guidelines for completeness',
      ask: 'What needs to be done for completeness?',
      points: [
        { k: 'Contains all relevant facts', alt: ['relevant facts', 'all relevant facts'] },
        { k: 'Style or manner to get desired reaction', alt: ['style', 'desired reaction'], d: 'Style or manner, such as to get the desired reaction.' },
        { k: 'All necessary information for accurate understanding', alt: ['necessary information'], d: 'Have all necessary information for a thorough, accurate understanding.' },
        { k: 'Answer five W questions', alt: ['five W', '5 W', 'who what why where when'], d: 'Who, What, Why, Where, When.' },
        { k: 'Answer all questions asked completely', alt: ['answer all questions'], d: 'Answer all questions asked by the receiver completely.' },
        { k: 'Admit unavailable information frankly and openly', alt: ['unavailable information', 'admit unavailable'] },
        { k: 'Provide unfavorable information honestly but tactfully', alt: ['unfavourable information', 'unfavorable honestly', 'tactfully'] },
        { k: 'Give additional information when desirable', alt: ['additional information', 'extra information', 'something extra'], d: 'As the receiver may not know what they need or what to ask.' },
      ],
      hook: '**F**acts in the right **S**tyle, all the **I**nfo, the **5 W**’s, **A**nswer everything — **A**dmit what you lack, break **B**ad news gently — and give a **B**onus.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2012-13'],
      src: S7,
    },
    {
      id: 'l-7cs-conciseness',
      topic: T,
      title: 'Guidelines for conciseness',
      ask: 'What needs to be done for conciseness?',
      points: [
        { k: 'Be complete without being wordy', alt: ['not wordy'] },
        { k: 'Say it in the fewest words', alt: ['fewest words', 'brief'], d: 'Say what one has to say in the fewest words.' },
        { k: 'Include relevant material only', alt: ['relevant material', 'only relevant'] },
        { k: 'Omit obvious information', alt: ['obvious information', 'obvious'] },
        { k: 'Omit long introductions', alt: ['long introduction'] },
        { k: 'Omit unnecessary explanations', alt: ['unnecessary explanation'] },
        { k: 'Omit pompous words', alt: ['pompous'] },
        { k: 'Omit gushy politeness', alt: ['gushy', 'excessive politeness'] },
        { k: 'Avoid needless repetition of phrases and sentences', alt: ['repetition', 'needless repetition'] },
        { k: 'Use shorter name after the longer once', alt: ['abbreviation', 'shorter name'], d: 'Use a shorter name after mentioning a longer name and its shorter abbreviation once.' },
        { k: 'Use pronouns rather than repeating long nouns', alt: ['pronouns', 'pronoun'] },
      ],
      hook: '3 rules, then 5 omits — **O**ld **L**adies **U**se **P**ink **G**loves (Obvious, Long intro, Unnecessary, Pompous, Gushy) — then 3 avoids (repetition, shorter name, pronouns).',
      seen: ['2015-16', '2014-15', '2013-14', '2012-13'],
      src: S7,
    },
    {
      id: 'l-7cs-consideration',
      topic: T,
      title: 'Guidelines for consideration',
      ask: 'What needs to be done for consideration?',
      ordered: true,
      points: [
        { k: 'Aware and sensitive to the receiver', alt: ['aware and sensitive', 'circumstances', 'emotions', 'probable reactions'], d: 'Desires, circumstances, problems, emotions, probable reactions.' },
        { k: 'Handle message from receiver’s point of view', alt: ['you attitude', 'point of view', 'empathy', 'human touch'], d: '“You attitude”, empathy, the human touch, understanding of human nature.' },
        { k: 'Does not lose temper, accuse, charge without facts', alt: ['lose temper', 'accuse', 'without facts'] },
        { k: 'Focus on you rather than I or we', alt: ['you not I', 'downplay own feelings', 'needs and wants'], d: 'Downplay own feelings; emphasize the points of the receiver; make explicit reference to or directly quote the receiver’s message; focus on the needs and wants of the receiver and the means to satisfy them.' },
        { k: 'Show interests/benefits of the receiver', alt: ['benefit', 'benefits', 'reader benefit'], d: 'In responding favorably: identify legitimate benefits; realistic and tailored to individual needs; put oneself in his position; address needs, concerns.' },
        { k: 'Emphasize pleasant and positive facts', alt: ['positive', 'pleasant facts'], d: 'Stress what can be done, NOT what cannot be done; focus on words the recipient can consider favorably.' },
      ],
      hook: '**A** **P**olite **T**eacher **Y**ields **B**ig **P**raise — Aware, Point of view, Temper kept, You not I, Benefits, Positive.',
      seen: ['Jan 2021', '2015-16', '2012-13', '2011-12'],
      src: S7,
    },
    {
      id: 'l-7cs-concreteness',
      topic: T,
      title: 'Guidelines for concreteness',
      ask: 'What needs to be done for concreteness?',
      points: [
        { k: 'Being specific, definite, vivid', alt: ['specific', 'definite', 'vivid'] },
        { k: 'Not being vague, general', alt: ['not vague', 'not general'] },
        { k: 'Denotative words, not connotative', alt: ['denotative', 'not connotative'], d: 'Denotative words (direct, explicit, in dictionary); not connotative words (ideas, notions associated with word or phrase).' },
        { k: 'Use specific facts and figures', alt: ['facts and figures', 'numbers'] },
        { k: 'Exact, precise statements, not general words', alt: ['precise statements', 'exact'] },
        { k: 'Use active verbs', alt: ['active voice', 'active verbs'], d: 'Active verbs make sentences specific, personal, concise, and emphatic.' },
        { k: 'Vivid image-building words', alt: ['image building', 'vivid words'], d: 'Having sensory appeal, comparisons, examples, etc.' },
      ],
      hook: 'Being / Not being / Using — then **F**acts, **E**xact, **A**ctive, **V**ivid.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'],
      src: S7,
      note: 'Concrete messages are dynamic and interesting; receivers know exactly what is required or desired.',
    },
    {
      id: 'l-7cs-clarity',
      topic: T,
      title: 'Guidelines for clarity',
      points: [
        { k: 'Precise, concrete, familiar words, right meaning', alt: ['familiar words', 'precise words', 'right meaning'], d: 'Choose precise, concrete, familiar words conveying the right meaning.' },
        { k: 'Words appropriate for the situation', alt: ['appropriate words'] },
        { k: 'Grammatically correct sentences, main idea clear', alt: ['grammatically correct', 'sentence structure'], d: 'Construct grammatically correct sentences, use correct sentence structure, and clearly express the main idea.' },
        { k: 'Short sentences with one main idea', alt: ['short sentence', 'one idea'] },
        { k: 'Unity of idea', alt: ['unity'] },
      ],
      seen: ['2015-16'],
      src: S7,
      note: 'Clarity is needed for an accurate understanding of the message.',
    },
    {
      id: 'l-7cs-courtesy',
      topic: T,
      title: 'To be courteous',
      ask: 'Describe courtesy — what makes a message courteous?',
      points: [
        { k: 'Sincerely tactful, thoughtful, and appreciative', alt: ['tactful', 'thoughtful', 'appreciative', 'sincere'] },
        { k: 'Avoid lack of courtesy: abruptness, bluntness', alt: ['bluntness', 'abruptness', 'lack of courtesy'], d: 'Intentional abruptness, bluntness (sometimes stemming from a lack of awareness of another culture, country).' },
        { k: 'Cordial appreciative messages building goodwill', alt: ['goodwill', 'cordial', 'respect'], d: 'Use cordial appreciative messages that show and build goodwill and respect.' },
        { k: 'Avoid irritating expressions or questionable humor', alt: ['irritating', 'humour', 'humor', 'offensive jokes'], d: 'That may offend.' },
        { k: 'Non-discriminatory expressions', alt: ['non-discriminatory', 'bias-free', 'gender neutral'], d: 'Reflecting equal treatment of people regardless of gender, race, or ethnic origin.' },
      ],
      hook: '**T**he **B**est **C**ourtesy **I**s **N**atural — Tactful, no Bluntness, Cordial, no Irritation, Non-discriminatory.',
      seen: ['2020-21', '2015-16'],
      src: S7,
    },
    {
      id: 'l-7cs-courtesy-implies',
      topic: T,
      title: 'Courtesy implies',
      ask: 'What does courtesy imply?',
      points: [
        { k: 'Politeness from respect and concern for others', alt: ['respect and concern', 'politeness'], d: 'Politeness that grows out of respect and concern for others.' },
        { k: 'Sincere “you attitude”', alt: ['you attitude', 'sincere you attitude'] },
        { k: 'Aware of receiver’s feelings and perspectives', alt: ['feelings of the receiver', 'feelings', 'perspectives'], d: 'Requires being aware of the feelings of the receiver in addition to their perspectives.' },
      ],
      seen: ['2020-21', '2015-16'],
      src: S7,
    },
    {
      id: 'l-7cs-correctness',
      topic: T,
      title: 'Guidelines for correctness',
      points: [
        { k: 'Proper grammar, punctuation, spelling', alt: ['grammar', 'spelling', 'punctuation'] },
        { k: 'Right level of language', alt: ['level of language'], d: 'Formal (impersonal with long sentences), informal (short conversational words as in business writing), sub-standard (incorrect words, grammar, pronunciation).' },
        { k: 'Check accuracy of facts, figures, words', alt: ['accurate facts', 'statistical data', 'check facts'], d: 'Verify statistical data, substantiate all information, and determine whether facts have changed with time.' },
        { k: 'Careful attention to appearance, format', alt: ['appearance', 'format'] },
      ],
      seen: ['2015-16', '2011-12'],
      src: S7,
    },
    {
      id: 'l-7cs-language-levels',
      topic: T,
      title: 'Levels of language (correctness)',
      ask: 'Name the levels of language.',
      points: [
        { k: 'Formal', alt: ['formal language'], d: 'Impersonal with long sentences.' },
        { k: 'Informal', alt: ['informal language'], d: 'Short conversational words as in business writing.' },
        { k: 'Sub-standard', alt: ['substandard', 'sub standard'], d: 'Incorrect words, grammar, pronunciation.' },
      ],
      seen: ['2015-16', '2011-12'],
      src: S7,
    },
  ],

  cards: [
    { id: 'c-7cs-ex-concrete-teacher', topic: T, front: 'Make it **concrete** (teacher’s example): “This method is good.”', back: '“This method is good **as it reduces cost by 5 %**.” — speak with numbers and give the reason.', src: SA },
    { id: 'c-7cs-ex-concrete-date', topic: T, front: 'Make it **concrete**: “The project was finished early.”', back: '“The bridge was completed on **30 June, 45 days ahead of schedule**.”', src: QB },
    { id: 'c-7cs-ex-active', topic: T, front: 'Make it **active** (slide): “The festival was organized by the students.”', back: '“**Students organized the festival.**”', src: S7 },
    { id: 'c-7cs-ex-strength', topic: T, front: 'Make it **concrete**: “The concrete has good strength.”', back: '“The concrete has a **28-day compressive strength of 25 MPa**.”', src: QB },
    { id: 'c-7cs-ex-complete', topic: T, front: 'Make it **complete**: “The pre-tender meeting is next week.”', back: '“The pre-tender meeting will be held at **11:00 am on 15 March in Room 404, RHD Bhaban, Tejgaon**; please bring your queries in writing.” — answers the five W’s.', src: QB },
    { id: 'c-7cs-ex-concise', topic: T, front: 'Make it **concise** (slide): “We hereby wish to let you know that our company is pleased with the confidence you have reposed in us.”', back: '“**We appreciate your confidence.**”', src: S7 },
    { id: 'c-7cs-ex-wordy', topic: T, front: 'Concise replacements: “at this point in time”, “due to the fact that”, “in the event that”.', back: '**now**, **because**, **if**.', src: QB },
    { id: 'c-7cs-ex-you', topic: T, front: 'Rewrite with the **you-attitude** (slide): “I am delighted to announce that we will be extending our hours to make shopping more convenient.”', back: '“**You will be able to shop evenings with the extended hours.**”', src: S7 },
    { id: 'c-7cs-ex-considerate', topic: T, front: 'Insensitive → **considerate** (slide): “You failed to enclose your check in the envelope.”', back: '“**Your check was not enclosed.**”', src: S7 },
    { id: 'c-7cs-ex-positive', topic: T, front: 'Negative → **positive** (slide): “We don’t refund if the returned item is used and unsalable.”', back: '“**We refund when the returned item is clean and salable.**”', src: S7 },
    { id: 'c-7cs-ex-gmat', topic: T, front: 'Vague → **concrete** (slide): “Student GMAT scores are higher now.”', back: '“**In 1996, the GMAT scores averaged 600; by 1997, they had risen to 610.**”', seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'], src: S7 },
    { id: 'c-7cs-ex-courtesy', topic: T, front: 'Make it **courteous**: “You did not read the specification, so your tender was rejected.”', back: '“Thank you for your tender. Unfortunately it could not be considered because the tender security was not enclosed. We hope you will take part in our future tenders.”', src: QB },
    { id: 'c-7cs-irritating', topic: T, front: 'Name irritating expressions a courteous writer avoids.', back: '“**You must** …”, “**obviously you don’t know** …” (Rahat’s note); “you failed to …”, “you claim …” (question bank). The slide names no phrases.', src: 'Rahat’s note / question bank — not on the slide' },
    { id: 'c-7cs-negative', topic: T, front: 'Consideration: why avoid negative wording like “not”? (Sumaiya ma’am)', back: 'Negative words make the receiver **defensive**; positive statements make them comfortable. Emphasise pleasant, positive facts.', src: SA },
    { id: 'c-7cs-stake', topic: T, front: 'Consideration and negotiation (Sumaiya ma’am).', back: 'The better you understand the other person’s **stake** (problem, benefit), the better negotiator you are — don’t be very strict; try to understand their problem.', src: SA },
    { id: 'c-7cs-fake-you', topic: T, front: 'Example of a **fake “you” attitude** from class.', back: 'A company gives a job **phone/laptop** — it looks like care for you, but it really expects you to keep working after office hours / at home.', src: SA },
    { id: 'c-7cs-courtesy-class', topic: T, front: 'Courtesy in person (Sumaiya ma’am): what to avoid?', back: 'Speaking too **bluntly**; commenting on someone’s **clothes or way of speaking**; mixing personal and professional life; **offensive jokes**.', src: SA },
    { id: 'c-7cs-correct-class', topic: T, front: 'Correctness (Sumaiya ma’am): wrong information vs no information?', back: 'Wrong information destroys **credibility and impression** — better not to give it than to give it wrong. Give each piece of information where it belongs, and mind the formatting.', src: SA },
    { id: 'c-7cs-clarity-class', topic: T, front: 'Clarity (Sumaiya ma’am): which words, and what keeps a message clear?', back: '**Familiar words**, not heavy English; **unity of idea** — one idea flowing to the next — gives a clear message.', src: SA },
    { id: 'c-7cs-conc-vs-conc', topic: T, front: '**Concreteness** vs **conciseness** — don’t mix them up.', back: '**Concise** = short (fewest words, nothing irrelevant). **Concrete** = specific (facts, figures, active verbs, vivid words).', src: S7 },
  ],

  answers: [
    {
      id: 'a-7cs-concepts',
      topic: T,
      q: 'List the seven C’s of effective communication and describe their main concepts in brief.',
      seen: ['2022-23', 'Jan 2021', '2015-16', '2013-14'],
      a: `The seven C’s of effective communication: **Completeness, Conciseness, Consideration, Concreteness, Clarity, Courtesy, Correctness**. (A *list* question, 7–9 marks, wants these names with one line each.)

### 1. Completeness
- Contains all relevant facts; style or manner such as to get the desired reaction; all necessary information for a thorough, accurate understanding.
- Answer **five W questions**: who, what, why, where, when.
- Answer all questions asked completely: admit unavailable information frankly and openly; provide unfavorable information honestly but tactfully.
- Give additional information when desirable.

### 2. Conciseness
- Be complete without being wordy; say it in the **fewest words**; include relevant material only.
- Omit obvious information, long introductions, unnecessary explanations, pompous words, gushy politeness.
- Avoid needless repetition; use a shorter name after the longer name and its abbreviation once; use pronouns rather than repeating long nouns.

### 3. Consideration
- Be aware and sensitive to desires, circumstances, problems, emotions, probable reactions.
- Handle the message from the receiver’s point of view: **you attitude**, empathy, the human touch.
- Do not lose temper, accuse, charge without facts; focus on “you” rather than “I” or “we”.
- Show the receiver’s interests/benefits; emphasize pleasant and positive facts.

### 4. Concreteness
- Being specific, definite, vivid; not vague, general; denotative, not connotative words.
- Specific facts and figures; exact, precise statements; active verbs; vivid image-building words.

### 5. Clarity
- Precise, concrete, familiar words; words appropriate for the situation; grammatically correct sentences; short sentences with one main idea; unity of idea.

### 6. Courtesy
- Politeness that grows out of respect and concern for others; a sincere you attitude.
- Sincerely tactful, thoughtful, appreciative; cordial messages that build goodwill; avoid irritating expressions or questionable humor; non-discriminatory expressions.

### 7. Correctness
- Proper grammar, punctuation, spelling; right level of language (formal, informal, sub-standard); check accuracy of facts, figures, words; careful attention to appearance, format.`,
      keys: ['Completeness', 'Conciseness', 'Consideration', 'Concreteness', 'Clarity', 'Courtesy', 'Correctness', 'five W questions', 'fewest words', 'you attitude'],
      lists: ['l-7cs'],
      src: S7,
    },
    {
      id: 'a-7cs-completeness',
      topic: T,
      q: 'Describe completeness (what needs to be done for completeness).',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2012-13'],
      a: `A complete message:
1. **Contains all relevant facts.**
2. Has a **style or manner** such as to get the **desired reaction**.
3. Has **all necessary information** for a thorough, accurate understanding.
4. **Answers five W questions** — who, what, why, where, when.
5. **Answers all questions** asked by the receiver completely.
6. **Admits unavailable information** frankly and openly.
7. **Provides unfavorable information honestly but tactfully.**
8. **Gives additional information** when desirable, as the receiver may not know what they need or what to ask.`,
      keys: ['all relevant facts', 'desired reaction', 'all necessary information', 'five W questions', 'who, what, why, where, when', 'Answers all questions', 'unavailable information', 'honestly but tactfully', 'additional information'],
      lists: ['l-7cs-completeness'],
      src: S7,
    },
    {
      id: 'a-7cs-conciseness',
      topic: T,
      q: 'Describe conciseness (what needs to be done for conciseness).',
      seen: ['2015-16', '2014-15', '2013-14', '2012-13'],
      a: `- **Be complete without being wordy.**
- Say what one has to say in the **fewest words**.
- Include **relevant material only**.

### Omit
1. **Obvious information**
2. **Long introductions**
3. **Unnecessary explanations**
4. **Pompous words**
5. **Gushy politeness**

### Avoid
- **Needless repetition** of phrases and sentences.
- Use a shorter name after mentioning a longer name and its shorter **abbreviation** once.
- Use **pronouns** rather than repeating long nouns.

Example (slide): “We hereby wish to let you know that our company is pleased with the confidence you have reposed in us.” → “We appreciate your confidence.”`,
      keys: ['complete without being wordy', 'fewest words', 'relevant material only', 'Obvious information', 'Long introductions', 'Unnecessary explanations', 'Pompous words', 'Gushy politeness', 'Needless repetition', 'pronouns', 'We appreciate your confidence'],
      lists: ['l-7cs-conciseness'],
      src: S7,
    },
    {
      id: 'a-7cs-consideration',
      topic: T,
      q: 'Describe consideration (the “you” attitude).',
      seen: ['Jan 2021', '2015-16', '2012-13', '2011-12'],
      a: `Consideration means preparing every message with the receiver in mind:
- **a. Being aware and sensitive** to the receiver’s desires, circumstances, problems, emotions, probable reactions.
- **b. Handle a message from the point of view of the receiver** — “you attitude”, empathy, the human touch, understanding of human nature.
- **c. A considerate message sender does not** lose temper, accuse, charge without facts.
- **d. Focus on you rather than “I” or “we”** — downplay own feelings; emphasize the points of the receiver; make explicit reference to or directly quote the message or response of the receiver; focus on the needs and wants of the receiver and the means to satisfy those needs.
- **e. Show the interests/benefits of the receiver** in responding favorably — identify legitimate benefits of the receiver; benefits should be realistic and tailored to individual needs; assess the receiver’s perspective by putting oneself in his position; address receivers’ needs, concerns.
- **f. Emphasize pleasant and positive facts** — stress what can be done and NOT what cannot be done; focus on words that the recipient can consider favorably.

| Instead of | Write |
|---|---|
| Insensitive: You failed to enclose your check in the envelope. | Considerate: Your check was not enclosed. |
| We-attitude: I am delighted to announce that we will be extending our hours to make shopping more convenient. | You-attitude: You will be able to shop evenings with the extended hours. |
| Negative: We don’t refund if the returned item is used and unsalable. | Positive: We refund when the returned item is clean and salable. |`,
      keys: ['aware and sensitive', 'point of view of the receiver', 'you attitude', 'lose temper', 'needs and wants', 'benefits of the receiver', 'pleasant and positive facts', 'Your check was not enclosed'],
      lists: ['l-7cs-consideration'],
      src: S7,
    },
    {
      id: 'a-7cs-concreteness',
      topic: T,
      q: 'Describe concreteness.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'],
      a: `Concreteness means:
- **Being** specific, definite, vivid.
- **Not being** vague, general.
- **Using denotative words** (direct, explicit, in dictionary), not connotative words (ideas, notions associated with word or phrase).

### For concrete messages, the message sender should
1. Use **specific facts and figures**.
2. Use **exact, precise statements**, not general words.
3. Use **active verbs** — active verbs make sentences specific, personal, concise, and emphatic.
4. Choose **vivid image-building words** having sensory appeal, comparisons, examples, etc.

Concrete messages are **dynamic and interesting**; receivers know exactly what is required or desired.

### Examples (slide)
- Vague: “Student GMAT scores are higher now.” → Concrete: “In 1996, the GMAT scores averaged 600; by 1997, they had risen to 610.”
- Passive: “The festival was organized by the students.” → Active: “Students organized the festival.”`,
      keys: ['specific, definite, vivid', 'vague, general', 'denotative words', 'specific facts and figures', 'exact, precise statements', 'active verbs', 'vivid image-building words', 'dynamic and interesting', 'GMAT'],
      lists: ['l-7cs-concreteness'],
      src: S7,
    },
    {
      id: 'a-7cs-clarity',
      topic: T,
      q: 'Describe clarity.',
      seen: ['2015-16'],
      a: `Clarity is needed for an **accurate understanding of the message**. For clarity:
1. Choose **precise, concrete, familiar words** conveying the right meaning.
2. Choose words **appropriate for the situation**.
3. Construct **grammatically correct sentences**, use correct sentence structure, and clearly express the main idea.
4. Use **short sentences with one main idea**.
5. Sentences should have **unity of idea**.`,
      keys: ['accurate understanding of the message', 'precise, concrete, familiar words', 'appropriate for the situation', 'grammatically correct sentences', 'short sentences with one main idea', 'unity of idea'],
      lists: ['l-7cs-clarity'],
      src: S7,
    },
    {
      id: 'a-7cs-courtesy',
      topic: T,
      q: 'Describe “Courtesy”, one of the seven components of effective communication.',
      seen: ['2020-21', '2015-16'],
      a: `### Courtesy implies
- Politeness that grows out of **respect and concern for others**.
- Requires a sincere “you attitude”.
- Requires being aware of the **feelings of the receiver** in addition to their perspectives.

### To be courteous
1. **Be sincerely tactful, thoughtful, and appreciative.** E.g. “Clearly you did not read my letter” → “I am sorry if my letter was not clear; let me explain again.”
2. **Avoid lack of courtesy** — intentional abruptness, bluntness (sometimes stemming from a lack of awareness of another culture, country).
3. **Use cordial appreciative messages** that show and build **goodwill and respect** — e.g. thank the receiver promptly for their help.
4. **Avoid irritating expressions or questionable humor** that may offend — e.g. “you must”, “obviously you don’t know”.
5. **Choose non-discriminatory expressions** reflecting equal treatment of people regardless of gender, race, or ethnic origin — e.g. “chairperson” instead of “chairman”.

### Why it matters
Courtesy strengthens present business relations, creates goodwill for future dealings and makes the receiver willing to co-operate. Courtesy and consideration both use the you-attitude, but courtesy is about politeness and respect, consideration about the receiver’s needs and benefits.`,
      keys: ['respect and concern for others', 'you attitude', 'feelings of the receiver', 'tactful, thoughtful, and appreciative', 'abruptness, bluntness', 'cordial appreciative messages', 'goodwill and respect', 'irritating expressions or questionable humor', 'non-discriminatory expressions'],
      lists: ['l-7cs-courtesy', 'l-7cs-courtesy-implies'],
      src: 'Noor sir L07 (slide); examples and “why it matters” from Rahat’s note',
    },
    {
      id: 'a-7cs-correctness',
      topic: T,
      q: 'Describe correctness.',
      seen: ['2015-16', '2011-12'],
      a: `Correctness implies using **proper grammar, punctuation, and spelling**. In addition:
1. Use the **right level of language** — **formal** (impersonal with long sentences), **informal** (short conversational words as in business writing), **sub-standard** (incorrect words, grammar, pronunciation — avoid it).
2. **Check accuracy of facts, figures, words** — verify statistical data, substantiate all information, and determine whether facts have changed with time.
3. Give **careful attention to appearance, format**.`,
      keys: ['proper grammar, punctuation, and spelling', 'right level of language', 'formal', 'informal', 'sub-standard', 'accuracy of facts, figures, words', 'statistical data', 'appearance, format'],
      lists: ['l-7cs-correctness', 'l-7cs-language-levels'],
      src: S7,
    },
  ],
} satisfies PcTopicContent
