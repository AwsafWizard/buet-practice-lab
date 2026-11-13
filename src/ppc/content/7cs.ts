// pc-7cs — the seven C's of effective communication.
// Sources: Kabirul sir's note ch.2 (guidelines), Dr. Sumaiya Afroz's "7 C" lecture (week 5, 20-12-2023; examples).
// Before/after examples marked "question bank" are standard-text examples, not class ones.
import type { PcTopicContent } from '../types'

const T = 'pc-7cs' as const
const KN = 'Kabirul sir note ch.2'
const SA = '7 C lecture (Sumaiya ma’am, wk 5)'

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
        { k: 'Clarity', alt: ['clear', 'clearness'], d: 'Exactly the intended meaning.' },
        { k: 'Courtesy', alt: ['courteous', 'politeness'], d: 'Sincere tact and respect.' },
        { k: 'Correctness', alt: ['correct', 'accuracy'], d: 'Right facts, figures, grammar and format.' },
      ],
      hook: 'Story of writing a letter: first make it **whole**, then **trim** it, then think of the **reader**, then add **numbers**; finally make it **plain**, **polite** and **proof-read**. Four “Con/Com” words, then Cla–Cou–Cor.',
      seen: ['2022-23', 'Jan 2021', '2015-16', '2014-15', '2013-14'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'l-7cs-completeness',
      topic: T,
      title: 'Guidelines for completeness',
      ask: 'What needs to be done for completeness?',
      points: [
        { k: 'All relevant facts', alt: ['relevant facts'] },
        { k: 'All necessary information', alt: ['necessary information'] },
        { k: 'Answer the five W’s', alt: ['five W', '5 W', 'who what when where why'], d: 'Who, why, what, when, where.' },
        { k: 'Answer all questions asked', alt: ['answer all questions'], d: 'Every question the receiver asked, stated or implied.' },
        { k: 'Unavailable information — say frankly', alt: ['unavailable info frankly', 'say openly'] },
        { k: 'Unfavourable information — honestly but tactfully', alt: ['unfavourable honestly', 'tactfully'] },
        { k: 'Give something extra when desirable', alt: ['extra information', 'additional information'] },
      ],
      hook: '**F**acts, **I**nfo, **W**’s, **Q**uestions, **U**navailable, **U**nfavourable, **E**xtra — “**F**ive **I**nquisitive **W**riters **Q**uestion **U**s **U**ntil **E**vening”.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2012-13'],
      src: KN,
      note: 'Question bank gives three: provide all necessary information (five W’s + how), answer all questions asked, give something extra.',
    },
    {
      id: 'l-7cs-conciseness',
      topic: T,
      title: 'Guidelines for conciseness',
      ask: 'What needs to be done for conciseness?',
      points: [
        { k: 'Fewest words, still meaningful', alt: ['fewest words', 'brief'] },
        { k: 'Complete but not wordy', alt: ['not wordy'] },
        { k: 'Only relevant words', alt: ['relevant material', 'only relevant'] },
        { k: 'Omit long introduction', alt: ['long introduction'] },
        { k: 'Omit unnecessary explanation', alt: ['unnecessary explanation'] },
        { k: 'Omit pompous words', alt: ['pompous'] },
        { k: 'Omit gushy politeness', alt: ['gushy', 'excessive politeness'] },
        { k: 'Avoid needless repetition', alt: ['repetition'], d: 'Use a pronoun instead of repeating the noun; after the full name once, use the abbreviation.' },
      ],
      hook: 'Omit the four “too’s”: too **long** an intro, too much **explaining**, too **pompous**, too **gushy** — and never say it twice.',
      seen: ['2015-16', '2014-15', '2013-14', '2012-13'],
      src: KN,
      note: 'Question bank: eliminate wordy expressions, include only relevant material, avoid unnecessary repetition.',
    },
    {
      id: 'l-7cs-consideration',
      topic: T,
      title: 'Guidelines for consideration',
      ask: 'What needs to be done for consideration?',
      points: [
        { k: 'Sensitive to receiver’s circumstances, desires, emotions', alt: ['aware and sensitive', 'circumstances', 'emotions', 'problems', 'probable reaction'], d: 'Circumstances, desires, emotions, problems and probable reaction.' },
        { k: 'Receiver’s point of view', alt: ['you attitude', "receiver's point of view", 'you-attitude'] },
        { k: 'Never lose temper, accuse or charge', alt: ['lose temper', 'accuse', 'without facts'] },
        { k: 'Receiver above sender’s own feelings', alt: ['importance to receiver', 'downplay'] },
        { k: 'Needs and wants of receiver', alt: ['needs and wants'] },
        { k: 'Show receiver’s benefit', alt: ['benefit', 'interest', 'reader benefit'] },
        { k: 'Emphasise positive, pleasant facts', alt: ['positive', 'pleasant facts', 'avoid not'] },
      ],
      hook: 'Stand in the **reader’s shoes**: feel what they feel, see from there, keep calm, put them first, give what they want, show what they gain, say it positively.',
      seen: ['Jan 2021', '2015-16', '2012-13', '2011-12'],
      src: `${KN}; ${SA}`,
      note: 'Question bank: “you” attitude, audience benefit, positive facts, integrity and ethics.',
    },
    {
      id: 'l-7cs-concreteness',
      topic: T,
      title: 'Guidelines for concreteness',
      ask: 'What needs to be done for concreteness?',
      points: [
        { k: 'Specific, definite and vivid', alt: ['specific', 'definite', 'vivid', 'not vague'], d: 'Not vague and general.' },
        { k: 'Denotative words', alt: ['denotative', 'dictionary words', 'not connotative'] },
        { k: 'Specific facts and figures', alt: ['facts and figures', 'numbers'] },
        { k: 'Precise statements', alt: ['precise'] },
        { k: 'Active verbs', alt: ['active voice', 'action in verbs'] },
        { k: 'Vivid image-building words', alt: ['image building', 'vivid words'] },
      ],
      hook: '“Not **good** — **5 %** cheaper, **built by** the TEC, **looks like** this.” Numbers, doers, pictures.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'l-7cs-clarity',
      topic: T,
      title: 'Guidelines for clarity',
      points: [
        { k: 'Right meaning', alt: ['exact meaning'] },
        { k: 'Precise, familiar words', alt: ['familiar words', 'precise words', 'concise words'] },
        { k: 'Words appropriate for situation', alt: ['appropriate words'] },
        { k: 'Grammatically correct sentences', alt: ['grammatically correct'] },
        { k: 'Short sentence, one main idea', alt: ['short sentence', 'one idea'] },
        { k: 'Unity of idea', alt: ['unity', 'flow'] },
      ],
      seen: ['2015-16'],
      src: `${KN}; ${SA}`,
      note: 'Question bank adds: average sentence 17–20 words.',
    },
    {
      id: 'l-7cs-courtesy',
      topic: T,
      title: 'Guidelines for courtesy',
      ask: 'Describe courtesy — what makes a message courteous?',
      points: [
        { k: 'Sincere', alt: ['sincerely', 'sincerity'] },
        { k: 'Tactful, thoughtful, appreciative', alt: ['tactful', 'thoughtful', 'appreciative', 'thank'] },
        { k: 'Avoid irritating expressions', alt: ['irritating', 'hurtful', 'offensive'] },
        { k: 'Avoid questionable humour', alt: ['humour', 'offensive jokes', 'jokes'] },
        { k: 'Non-discriminatory expressions', alt: ['non-discriminatory', 'bias-free', 'gender neutral'] },
      ],
      hook: '**S**ay **T**hanks, **I**rritate nobody, **H**old the jokes, **N**o bias — “**S**TIHN”.',
      seen: ['2020-21', '2015-16'],
      src: `${KN}; ${SA}`,
      note: 'Question bank adds: answer promptly; apologise sincerely and say no politely.',
    },
    {
      id: 'l-7cs-correctness',
      topic: T,
      title: 'Guidelines for correctness',
      points: [
        { k: 'Proper grammar, spelling, punctuation', alt: ['grammar', 'spelling', 'punctuation'] },
        { k: 'Right level of language', alt: ['level of language'] },
        { k: 'Accurate facts, figures, words, data', alt: ['accurate facts', 'figures', 'statistical data', 'check facts'] },
        { k: 'Careful attention to appearance and format', alt: ['appearance', 'format', 'formatting'] },
      ],
      seen: ['2015-16', '2011-12'],
      src: `${KN}; ${SA}`,
      note: 'Question bank also puts non-discriminatory expressions here; the class note has it under courtesy.',
    },
  ],

  cards: [
    { id: 'c-7cs-ex-concrete-teacher', topic: T, front: 'Make it **concrete** (teacher’s example): “This method is good.”', back: '“This method is good **as it reduces cost by 5 %**.” — speak with numbers and give the reason.', seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'], src: SA },
    { id: 'c-7cs-ex-concrete-date', topic: T, front: 'Make it **concrete**: “The project was finished early.”', back: '“The bridge was completed on **30 June, 45 days ahead of schedule**.”', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-active', topic: T, front: 'Make it **concrete** with an active verb: “An evaluation was made of the tenders.”', back: '“**The TEC evaluated** the tenders.” — put the action in the verb and name the doer.', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-strength', topic: T, front: 'Make it **concrete**: “The concrete has good strength.”', back: '“The concrete has a **28-day compressive strength of 25 MPa**.”', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-complete', topic: T, front: 'Make it **complete**: “The pre-tender meeting is next week.”', back: '“The pre-tender meeting will be held at **11:00 am on 15 March in Room 404, RHD Bhaban, Tejgaon**; please bring your queries in writing.” — answers the five W’s.', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-concise', topic: T, front: 'Make it **concise**: “We wish to inform you that the tenders submitted will be opened at 3 pm.”', back: '“**Tenders will be opened at 3 pm.**”', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-wordy', topic: T, front: 'Concise replacements: “at this point in time”, “due to the fact that”, “in the event that”.', back: '**now**, **because**, **if**.', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-you', topic: T, front: 'Rewrite with the **“you” attitude**: “We allow 10 % discount on all orders.”', back: '“**You can save 10 %** on every order.”', src: 'question bank (standard text)' },
    { id: 'c-7cs-ex-courtesy', topic: T, front: 'Make it **courteous**: “You did not read the specification, so your tender was rejected.”', back: '“Thank you for your tender. Unfortunately it could not be considered because the tender security was not enclosed. We hope you will take part in our future tenders.”', src: 'question bank (standard text)' },
    { id: 'c-7cs-irritating', topic: T, front: 'Name irritating expressions a courteous writer avoids.', back: '“**You failed to** …”, “**you claim** …”, “**we must insist** …”, “obviously you don’t understand”.', src: 'question bank (standard text)' },
    { id: 'c-7cs-negative', topic: T, front: 'Consideration: why avoid negative wording like “not”? (Sumaiya ma’am)', back: 'Negative words make the receiver **defensive**; positive statements make them comfortable. Emphasise pleasant, positive facts.', src: SA },
    { id: 'c-7cs-stake', topic: T, front: 'Consideration and negotiation (Sumaiya ma’am).', back: 'The better you understand the other person’s **stake** (problem, benefit), the better negotiator you are — don’t be very strict; try to understand their problem.', src: SA },
    { id: 'c-7cs-fake-you', topic: T, front: 'Example of a **fake “you” attitude** from class.', back: 'A company gives a job **phone/laptop** — it looks like care for you, but it really expects you to keep working after office hours / at home.', src: SA },
    { id: 'c-7cs-courtesy-class', topic: T, front: 'Courtesy in person (Sumaiya ma’am): what to avoid?', back: 'Speaking too **bluntly**; commenting on someone’s **clothes or way of speaking**; mixing personal and professional life; **offensive jokes**.', seen: ['2020-21'], src: SA },
    { id: 'c-7cs-correct-class', topic: T, front: 'Correctness (Sumaiya ma’am): wrong information vs no information?', back: 'Wrong information destroys **credibility and impression** — better not to give it than to give it wrong. Give each piece of information where it belongs, and mind the formatting.', src: SA },
    { id: 'c-7cs-clarity-class', topic: T, front: 'Clarity (Sumaiya ma’am): which words, and what keeps a message clear?', back: '**Familiar words**, not heavy English; **unity of idea** — one idea flowing to the next — gives a clear message.', src: SA },
    { id: 'c-7cs-conc-vs-conc', topic: T, front: '**Concreteness** vs **conciseness** — don’t mix them up.', back: '**Concise** = short (fewest words, nothing irrelevant). **Concrete** = specific (facts, figures, active verbs, vivid words).', src: KN },
  ],

  answers: [
    {
      id: 'a-7cs-concepts',
      topic: T,
      q: 'List the seven C’s of effective communication and describe their main concepts in brief.',
      seen: ['2022-23', 'Jan 2021', '2015-16', '2014-15', '2013-14'],
      a: `1. **Completeness** — give all relevant facts and necessary information; answer the five W’s and every question asked; give something extra when desirable.
2. **Conciseness** — fewest words without losing meaning; omit long introductions, unnecessary explanation, pompous words and gushy politeness; avoid needless repetition.
3. **Consideration** — the **“you” attitude**: write from the receiver’s point of view, show their benefit, emphasise positive facts.
4. **Concreteness** — specific, definite and vivid: facts and figures, active verbs, image-building words (“reduces cost by 5 %”, not “good”).
5. **Clarity** — precise, familiar words; short sentences with one main idea; unity of idea.
6. **Courtesy** — sincerely tactful, thoughtful and appreciative; no irritating expressions or questionable humour; non-discriminatory language.
7. **Correctness** — right level of language; accurate facts, figures and words; proper grammar, spelling, punctuation and format.`,
      keys: ['Completeness', 'Conciseness', 'Consideration', 'Concreteness', 'Clarity', 'Courtesy', 'Correctness', 'you” attitude', 'five W’s', 'fewest words'],
      lists: ['l-7cs'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'a-7cs-completeness',
      topic: T,
      q: 'Describe completeness (what needs to be done for completeness).',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2012-13'],
      a: `A message is complete when it contains **all relevant facts** and all the information the receiver needs to understand and act, so no follow-up is needed.

1. **All necessary information** — include every fact the receiver needs.
2. **Five W’s** — answer who, why, what, when and where.
3. **Answer all questions** asked by the receiver, stated or implied.
4. **Unavailable information** — say so frankly and openly.
5. **Unfavourable information** — give it honestly but tactfully.
6. **Something extra** — add useful additional information when desirable.

*Example:* “The pre-tender meeting is next week.” → “The pre-tender meeting will be held at 11:00 am on 15 March in Room 404, RHD Bhaban; please bring your queries in writing.”`,
      keys: ['all relevant facts', 'All necessary information', 'Five W’s', 'who, why, what, when and where', 'Answer all questions', 'Unavailable information', 'Unfavourable information', 'honestly but tactfully', 'Something extra'],
      lists: ['l-7cs-completeness'],
      src: KN,
    },
    {
      id: 'a-7cs-conciseness',
      topic: T,
      q: 'Describe conciseness (what needs to be done for conciseness).',
      seen: ['2015-16', '2014-15', '2013-14', '2012-13'],
      a: `Conciseness is saying what you have to say in the **fewest words** while keeping the meaning — **complete but not wordy**, using only relevant words. It saves the reader’s time and gives emphasis.

### Omit
1. **Long introduction**
2. **Unnecessary explanation**
3. **Pompous words**
4. **Gushy politeness**

### Avoid needless repetition
- Use a **pronoun** instead of repeating the noun.
- After using a **full name** once, use its **abbreviation**.

*Example:* “We wish to inform you that the tenders submitted will be opened at 3 pm” → “Tenders will be opened at 3 pm.” (“at this point in time” → “now”; “due to the fact that” → “because”.)`,
      keys: ['fewest words', 'complete but not wordy', 'Long introduction', 'Unnecessary explanation', 'Pompous words', 'Gushy politeness', 'needless repetition', 'pronoun', 'abbreviation'],
      lists: ['l-7cs-conciseness'],
      src: KN,
    },
    {
      id: 'a-7cs-consideration',
      topic: T,
      q: 'Describe consideration (the “you” attitude).',
      seen: ['Jan 2021', '2015-16', '2012-13', '2011-12'],
      a: `Consideration means preparing every message with the **receiver in mind** — the **“you” attitude**.

1. **Be aware and sensitive** to the receiver’s circumstances, desires, emotions, problems and probable reaction.
2. **Receiver’s point of view** — handle the message from their side.
3. **Never lose temper**, accuse or charge without facts.
4. **Receiver first** — give more importance to the receiver than to your own feelings; downplay your points, emphasise theirs.
5. **Needs and wants** of the receiver come first.
6. **Show the benefit** to the receiver of responding favourably.
7. **Emphasise positive**, pleasant facts — negative words (“not”) make the receiver defensive.

Understanding the other person’s stake makes you a better negotiator.

*Example:* “We allow 10 % discount” → “You can save 10 % on every order.”`,
      keys: ['receiver in mind', 'you” attitude', 'aware and sensitive', 'point of view', 'lose temper', 'Needs and wants', 'benefit', 'positive', 'defensive'],
      lists: ['l-7cs-consideration'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'a-7cs-concreteness',
      topic: T,
      q: 'Describe concreteness.',
      seen: ['Jan 2021', '2015-16', '2014-15', '2013-14', '2011-12'],
      a: `Concreteness means being **specific, definite and vivid** rather than vague and general, using **denotative** (dictionary) words rather than connotative ones.

1. **Specific facts and figures** — speak with numbers.
2. **Precise statements** — say exactly what is meant.
3. **Active verbs** — put the action in the verb and name the doer.
4. **Vivid, image-building words** — help the reader see it.

### Examples
- “This method is good.” → “This method is good **as it reduces cost by 5 %**.” (class)
- “An evaluation was made.” → “The TEC evaluated the tenders.”
- “Finished early.” → “Completed on 30 June, 45 days ahead of schedule.”`,
      keys: ['specific, definite and vivid', 'denotative', 'facts and figures', 'Precise statements', 'Active verbs', 'image-building', 'reduces cost by 5 %'],
      lists: ['l-7cs-concreteness'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'a-7cs-clarity',
      topic: T,
      q: 'Describe clarity.',
      seen: ['2015-16'],
      a: `Clarity means the receiver gets exactly the **right meaning**.

1. **Precise, familiar words** — not heavy or high-flown English.
2. **Words appropriate for the situation.**
3. **Grammatically correct** sentences.
4. **Short sentences**, each with **one main idea**.
5. **Unity of idea** — ideas flow one to the next, giving a clear message.

*Some books add an average sentence length of 17–20 words.*`,
      keys: ['right meaning', 'familiar words', 'appropriate', 'Grammatically correct', 'one main idea', 'Unity of idea'],
      lists: ['l-7cs-clarity'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'a-7cs-courtesy',
      topic: T,
      q: 'Describe “Courtesy”, one of the seven components of effective communication.',
      seen: ['2020-21', '2015-16'],
      a: `Courtesy is **sincere** politeness and respect towards the receiver; it builds **goodwill** and goes beyond “please” and “thank you”.

1. **Sincerely tactful, thoughtful and appreciative** — thank people for orders, help or suggestions.
2. **Avoid irritating expressions** — “you failed to”, “you claim”, “we must insist”.
3. **Avoid questionable humour** — no offensive jokes or sarcasm.
4. **Non-discriminatory expressions** — no gender, racial, age or disability bias (“chairperson”, not “chairman”).
5. In person: don’t speak too bluntly; don’t comment on someone’s clothes or way of speaking; keep personal and professional life apart.

*Example:* “You did not read the specification, so your tender was rejected.” → “Thank you for your tender. Unfortunately it could not be considered because the tender security was not enclosed. We hope you will take part in our future tenders.”

*Books also add: answer promptly, and apologise sincerely when wrong.*`,
      keys: ['sincere', 'goodwill', 'tactful, thoughtful and appreciative', 'irritating expressions', 'questionable humour', 'Non-discriminatory', 'bluntly'],
      lists: ['l-7cs-courtesy'],
      src: `${KN}; ${SA}`,
    },
    {
      id: 'a-7cs-correctness',
      topic: T,
      q: 'Describe correctness.',
      seen: ['2015-16', '2011-12'],
      a: `Correctness means the message is accurate in content and form, which builds the reader’s confidence.

1. **Right level of language** — formal for reports and contracts, informal for routine notes.
2. **Accurate facts, figures, words and statistical data** — check them; a wrong closing date in a tender notice can void the process.
3. **Proper grammar, spelling and punctuation** (“compliment” vs “complement”).
4. **Careful attention to appearance and format.**

Wrong information damages **credibility** — better not to give it than to give it wrong.`,
      keys: ['Right level of language', 'Accurate facts', 'statistical data', 'grammar, spelling and punctuation', 'appearance and format', 'credibility'],
      lists: ['l-7cs-correctness'],
      src: `${KN}; ${SA}`,
    },
  ],
} satisfies PcTopicContent
