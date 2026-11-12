// pc-ethics — Code of Ethics for Engineers (the "ASCE Code of Ethics lecture notes" the papers quote).
// Source: Kabirul sir's note ch.8 (3 fundamental principles + Sections 1–15, Bangla gist).
// The wording is the old (1960s–70s) US engineers' code (ECPD / NSPE 1964–80, used by ASCE before its 1977
// canon-format code) — not the IEB code and not today's ASCE code. Section texts below are that code's wording.
import type { PcTopicContent } from '../types'

const T = 'pc-ethics' as const
const KN = 'Kabirul sir note ch.8 (code of ethics handout)'
const ALL = ['2023-24', 'May 2024', '2021-22', '2020-21', 'Jan 2021', '2015-16', '2014-15', '2013-14']

export default {
  lists: [
    {
      id: 'l-ethics-principles',
      topic: T,
      title: 'Fundamental principles of the code of ethics for engineers',
      ask: 'What are the fundamental principles of the code of ethics for engineers?',
      ordered: true,
      points: [
        { k: 'Honest and impartial, serve with devotion', alt: ['honest', 'impartial', 'devotion', 'fidelity', 'employer clients public'], d: 'Will be honest and impartial, and serve with devotion his employer, his clients and the public.' },
        { k: 'Increase competence and prestige of profession', alt: ['competence', 'prestige'], d: 'Will strive to increase the competence and prestige of the engineering profession.' },
        { k: 'Knowledge and skill for human welfare', alt: ['human welfare', 'welfare', 'advancement of human welfare'], d: 'Will use his knowledge and skill for the advancement of human welfare.' },
      ],
      seen: ['May 2024'],
      src: KN,
      note: 'Purpose clause: “to uphold and advance the honour and dignity of the engineering profession”. The question bank gives the modern ASCE four (welfare and environment; honest and impartial; competence and prestige; supporting professional and technical societies) — the class handout has three, in this order.',
    },
    {
      id: 'l-ethics-sections',
      topic: T,
      title: 'Sections 1–15 of the code of ethics (one keyword each)',
      ask: 'Give the keyword of each section of the Code of Ethics for Engineers, Section 1 to 15.',
      ordered: true,
      points: [
        { k: 'Integrity — faithful agent or trustee', alt: ['integrity', 'faithful agent', 'trustee'], d: '§1 Highest standards of integrity; faithful agent or trustee of each client or employer.' },
        { k: 'Public safety, health and welfare', alt: ['public safety', 'safety health welfare', 'overruled'], d: '§2 Regard for public safety, health, welfare; if overruled, point out consequences; notify proper authority.' },
        { k: 'Avoid conduct discrediting the profession', alt: ['dignity', 'honour', 'discredit', 'conduct'], d: '§3 Avoid conduct likely to discredit the dignity or honour of the profession.' },
        { k: 'Extend public knowledge of engineering', alt: ['public knowledge', 'misrepresentation', 'misunderstanding'], d: '§4 Extend public knowledge and appreciation; protect from misrepresentation and misunderstanding.' },
        { k: 'Opinion only on adequate knowledge', alt: ['opinion', 'honest conviction', 'adequate knowledge'], d: '§5 Opinion only when founded on adequate knowledge and honest conviction.' },
        { k: 'Assignments only when qualified', alt: ['qualified', 'experts', 'specialists', 'competence'], d: '§6 Only when qualified by education or experience; engage or advise engaging experts.' },
        { k: 'Confidential information — no disclosure', alt: ['confidential', 'confidentiality', 'not disclose'], d: '§7 No disclosure of business affairs or technical processes of present or former client/employer without consent.' },
        { k: 'Avoid conflict of interest; disclose', alt: ['conflict of interest', 'disclose'], d: '§8 Avoid conflict of interest; when unavoidable, fully disclose to employer or client.' },
        { k: 'Appropriate and adequate compensation', alt: ['adequate compensation', 'compensation principle'], d: '§9 Uphold appropriate and adequate compensation for those in engineering work.' },
        { k: 'No compensation from more than one party', alt: ['one party', 'more than one party', 'double compensation'], d: '§10 Not from more than one party for the same project unless fully disclosed and agreed by all.' },
        { k: 'No unfair competition', alt: ['unfair competition', 'compete unfairly', 'competitive bidding'], d: '§11 Not by competitive bidding, salaried position, criticising others or questionable methods.' },
        { k: 'Not injure another engineer’s reputation', alt: ['reputation', 'injure', 'another engineer', 'proper authority'], d: '§12 Not maliciously or falsely; no indiscriminate criticism; report unethical practice to proper authority.' },
        { k: 'No association with questionable enterprise', alt: ['questionable character', 'association', 'use of name'], d: '§13 Nor with unethical engineers or persons not legally qualified.' },
        { k: 'Give credit where due', alt: ['credit', 'proprietary interests'], d: '§14 Credit for engineering work to those due; recognise proprietary interests.' },
        { k: 'Interchange information with engineers and students', alt: ['interchange information', 'students', 'professional development', 'effectiveness'], d: '§15 Extend effectiveness of the profession; develop engineers under supervision.' },
      ],
      hook: 'Three rings: **1–5 public face** (Integrity, Safety, Dignity, Public knowledge, Opinion) · **6–10 client and money** (Qualified, Confidential, Conflict, Compensation, One party) · **11–15 fellow engineers** (Compete fairly, Reputation, Association, Credit, Interchange). “**I S**ee **D**ogs **P**lay **O**utside; **Q**uiet **C**ats **C**hase **C**heap **O**wls; **C**lever **R**abbits **A**lways **C**ollect **I**nfo.”',
      seen: ALL,
      src: KN,
    },
    {
      id: 'l-ethics-client',
      topic: T,
      title: 'Responsibilities of an engineer to a client or employer',
      ask: 'What is the responsibility of an engineer to a client or employer (as per the code)?',
      points: [
        { k: 'Faithful agent or trustee (§1)', alt: ['faithful agent', 'trustee', 'integrity'] },
        { k: 'Undertake only qualified assignments (§6)', alt: ['qualified', 'experts', 'specialists'] },
        { k: 'Keep information confidential (§7)', alt: ['confidential', 'confidentiality'] },
        { k: 'Avoid or disclose conflict of interest (§8)', alt: ['conflict of interest'] },
        { k: 'Compensation from one party only (§10)', alt: ['one party', 'compensation', 'more than one party'] },
        { k: 'Public safety over client’s wish (§2)', alt: ['public safety', 'point out consequences'] },
      ],
      hook: '**F**aithful, **Q**ualified, **C**onfidential, **C**onflict-free, **O**ne paymaster — but the **P**ublic first.',
      seen: ['May 2024'],
      src: KN,
      note: 'Question bank adds “act fairly between client and contractor” and “no gifts from contractors/suppliers” — neither is in this code’s 15 sections.',
    },
    {
      id: 'l-ethics-peers',
      topic: T,
      title: 'Responsibilities of an engineer towards peers (other engineers)',
      ask: 'What are the responsibilities of an engineer towards his/her peers?',
      points: [
        { k: 'No unfair competition (§11)', alt: ['compete unfairly', 'unfair competition', 'competitive bidding'] },
        { k: 'Not injure reputation; report to authority (§12)', alt: ['reputation', 'injure', 'proper authority', 'indiscriminately criticise'] },
        { k: 'No association with unethical engineers (§13)', alt: ['association', 'questionable character', 'unethical engineers'] },
        { k: 'Give credit where due (§14)', alt: ['credit', 'proprietary interests'] },
        { k: 'Interchange information; develop juniors (§15)', alt: ['interchange information', 'students', 'professional development', 'supervision'] },
      ],
      hook: 'Sections **11–15** = the last five: **C**ompete fairly, **R**eputation, **A**ssociation, **C**redit, **I**nterchange — “**C**RACI”.',
      seen: ['2023-24', '2020-21'],
      src: KN,
    },
    {
      id: 'l-ethics-public',
      topic: T,
      title: 'Duties of the engineer to the public and the profession (Sections 2–5)',
      points: [
        { k: 'Regard public safety, health, welfare (§2)', alt: ['public safety', 'safety health welfare'] },
        { k: 'Avoid conduct discrediting profession (§3)', alt: ['dignity', 'honour', 'discredit'] },
        { k: 'Extend public knowledge of engineering (§4)', alt: ['public knowledge', 'misrepresentation'] },
        { k: 'Opinion only on adequate knowledge (§5)', alt: ['opinion', 'honest conviction'] },
      ],
      seen: ['2015-16', '2014-15', '2013-14'],
      src: KN,
    },
    {
      id: 'l-ethics-s2',
      topic: T,
      title: 'Section 2 — the three duties',
      ordered: true,
      points: [
        { k: 'Proper regard for safety, health, welfare', alt: ['safety', 'health', 'welfare', 'public'] },
        { k: 'If overruled, point out consequences', alt: ['overruled', 'non-technical authority', 'consequences'] },
        { k: 'Notify proper authority of danger', alt: ['notify', 'proper authority'] },
      ],
      seen: ['2015-16', '2014-15', '2013-14'],
      src: KN,
    },
    {
      id: 'l-ethics-conduct-avoid',
      topic: T,
      title: 'Examples of conduct the Engineer should avoid (Section 3)',
      points: [
        { k: 'Misleading or self-praising advertising', alt: ['advertising', 'self-laudatory'] },
        { k: 'Exaggerating qualifications', alt: ['exaggerate'] },
        { k: 'Bribes, commissions, kickbacks', alt: ['bribe', 'bribery', 'kickback'] },
        { k: 'Signing unsafe plans', alt: ['unsafe plans', 'unsafe'] },
        { k: 'Plagiarism, taking others’ credit', alt: ['plagiarism', 'credit'] },
        { k: 'Fraud or corruption in tendering', alt: ['fraud', 'corruption', 'tender fraud'] },
        { k: 'Misconduct in professional settings', alt: ['misconduct', 'drunkenness'] },
      ],
      seen: ['2021-22', '2015-16'],
      src: 'question bank only (examples); the rule itself is §3 of the handout',
    },
  ],

  cards: [
    { id: 'c-ethics-s1', topic: T, front: 'Code of ethics **Section 1** — what does it say?', back: 'The Engineer will be guided in all his professional relations by the **highest standards of integrity**, and will act in professional matters for each client or employer as a **faithful agent or trustee**.', seen: ['Jan 2021', 'May 2024'], src: KN },
    { id: 'c-ethics-s2', topic: T, front: 'Code of ethics **Section 2** — what does it say?', back: 'Proper regard for the **safety, health and welfare of the public**. If his judgement is **overruled by non-technical authority**, he will **clearly point out the consequences**, and will **notify the proper authority** of any condition endangering public safety and health.', seen: ['2015-16', '2014-15', '2013-14', 'May 2024'], src: KN },
    { id: 'c-ethics-s3', topic: T, front: 'Code of ethics **Section 3** — what does it say?', back: 'The Engineer will **avoid all conduct or practice** likely to **discredit or unfavourably reflect upon the dignity or honour** of the profession.', seen: ['2021-22', '2015-16'], src: KN },
    { id: 'c-ethics-s4', topic: T, front: 'Code of ethics **Section 4** — what does it say?', back: 'The Engineer will endeavour to **extend public knowledge and appreciation of engineering** and its achievements, and to **protect the profession from misrepresentation and misunderstanding**.', seen: ['May 2024', '2014-15', '2013-14'], src: KN },
    { id: 'c-ethics-s5', topic: T, front: 'Code of ethics **Section 5** — what does it say?', back: 'The Engineer will express an **opinion** on an engineering subject only when founded on **adequate knowledge and honest conviction**.', seen: ['Jan 2021'], src: KN },
    { id: 'c-ethics-s6', topic: T, front: 'Code of ethics **Section 6** — what does it say?', back: 'Undertake engineering assignments **only when qualified by education or experience** in the specific technical field; **engage, or advise engaging, experts and specialists** whenever the client’s or employer’s interests are best served.', seen: ['2023-24', '2021-22', '2015-16', '2014-15', 'May 2024'], src: KN },
    { id: 'c-ethics-s7', topic: T, front: 'Code of ethics **Section 7** — what does it say?', back: 'The Engineer will **not disclose** information concerning the **business affairs or technical processes** of any **present or former** client or employer **without his consent**.', seen: ['2023-24', 'Jan 2021', 'May 2024'], src: KN },
    { id: 'c-ethics-s8', topic: T, front: 'Code of ethics **Section 8** — what does it say?', back: 'Endeavour to **avoid a conflict of interest** with employer or client; when **unavoidable**, **fully disclose the circumstances** to the employer or client.', seen: ['2023-24', 'Jan 2021', '2014-15', 'May 2024'], src: KN },
    { id: 'c-ethics-s9', topic: T, front: 'Code of ethics **Section 9** — what does it say?', back: 'Uphold the principle of **appropriate and adequate compensation** for those engaged in engineering work (including subordinates), as being in the public interest and maintaining the standards of the profession.', seen: ['2021-22', '2015-16', 'Jan 2021'], src: KN },
    { id: 'c-ethics-s10', topic: T, front: 'Code of ethics **Section 10** — what does it say?', back: 'Not accept compensation, financial or otherwise, from **more than one party** for services on the same project, **unless the circumstances are fully disclosed and agreed to by all interested parties**.', seen: ['Jan 2021', 'May 2024'], src: KN },
    { id: 'c-ethics-s11', topic: T, front: 'Code of ethics **Section 11** — what does it say?', back: 'Not **compete unfairly** with another engineer for employment, advancement or engagements — by **competitive bidding**, by **taking advantage of a salaried position**, by **criticising other engineers**, or by other improper or questionable methods.', seen: ['2023-24', 'Jan 2021'], src: KN },
    { id: 'c-ethics-s12', topic: T, front: 'Code of ethics **Section 12** — what does it say?', back: 'Not attempt to **injure, maliciously or falsely, directly or indirectly**, the **professional reputation, prospects, practice or employment** of another engineer, nor indiscriminately criticise his work. If others are guilty of unethical or illegal practice, **present the information to the proper authority**.', seen: ['2023-24', '2020-21', '2014-15', '2013-14'], src: KN },
    { id: 'c-ethics-s13', topic: T, front: 'Code of ethics **Section 13** — what does it say?', back: 'Not associate with, or allow the **use of his name** by, an **enterprise of questionable character**; nor become professionally associated with **engineers who do not conform to ethical practices** or persons **not legally qualified**.', seen: ['2023-24', '2020-21', '2015-16', '2013-14'], src: KN },
    { id: 'c-ethics-s14', topic: T, front: 'Code of ethics **Section 14** — what does it say?', back: 'Give **credit** for engineering work **to those to whom credit is due**, and recognise the **proprietary interests** of others.', seen: ['2023-24'], src: KN },
    { id: 'c-ethics-s15', topic: T, front: 'Code of ethics **Section 15** — what does it say?', back: 'Cooperate in **extending the effectiveness of the profession** by **interchanging information and experience with other engineers and students**, and provide opportunity for the **professional development and advancement** of engineers under his supervision.', seen: ['2023-24', '2020-21', 'Jan 2021', '2015-16'], src: KN },
    { id: 'c-ethics-source', topic: T, front: 'Which code do the papers mean by “ASCE Code of Ethics lecture notes … Section 1–15”?', back: 'The **old US engineers’ code** (ECPD / NSPE 1964–80 wording, used by ASCE before 1977): **3 fundamental principles + 15 numbered sections**. Not the IEB code, not today’s ASCE canons.', src: 'Kabirul sir note ch.8; NSPE / CMU historical-code archive' },
    { id: 'c-ethics-principles-count', topic: T, front: 'How many fundamental principles in the class handout — and what does the question bank wrongly add?', back: '**Three** (honest and impartial; competence and prestige; human welfare). The question bank adds the modern ASCE 4th: **supporting professional and technical societies**.', seen: ['May 2024'], src: KN },
    { id: 'c-ethics-public-example', topic: T, front: 'Give an example of a civil engineer **extending public knowledge** (§4).', back: 'After the **Rana Plaza** collapse, write newspaper articles and give community talks explaining in plain language why unauthorised extra storeys and poor columns cause collapse and how owners can check permits — without exaggerated claims.', seen: ['May 2024'], src: 'question bank (example); rule = §4' },
    { id: 'c-ethics-coi-example', topic: T, front: 'Example of handling a **conflict of interest** (§8).', back: 'An engineer on a tender evaluation committee whose relative owns a tendering firm **declares it** to the employer and **withdraws** from that evaluation.', seen: ['2023-24', 'Jan 2021', '2014-15'], src: 'question bank (example); rule = §8' },
    { id: 'c-ethics-s6-example', topic: T, front: 'Example of **advising the client to engage a specialist** (§6).', back: 'A structural engineer advises hiring a **geotechnical specialist** for difficult soil, or a **fire-safety expert** for a high-rise.', seen: ['2023-24', '2021-22'], src: 'question bank (example); rule = §6' },
  ],

  answers: [
    {
      id: 'a-ethics-principles',
      topic: T,
      q: 'What are the fundamental principles of the code of ethics for engineers? Describe.',
      seen: ['May 2024'],
      a: `The Engineer, to **uphold and advance the honour and dignity** of the engineering profession and in keeping with high standards of ethical conduct:

1. **Honest and impartial** — will be honest and impartial, and will **serve with devotion** his employer, his clients and the public: truthful reports and estimates, no hidden interests, faithful agent.
2. **Competence and prestige** — will strive to increase the competence and prestige of the engineering profession: work only within competence, keep learning, deal fairly with other engineers.
3. **Human welfare** — will use his **knowledge and skill** for the advancement of human welfare: public safety, health and welfare come first.

These principles are expanded in Sections 1–15 of the code.

*The current ASCE code (in some books) has four principles, adding “supporting the professional and technical societies”.*`,
      keys: ['honour and dignity', 'Honest and impartial', 'serve with devotion', 'employer, his clients and the public', 'Competence and prestige', 'Human welfare', 'knowledge and skill'],
      lists: ['l-ethics-principles'],
      src: KN,
    },
    {
      id: 'a-ethics-client',
      topic: T,
      q: 'As per the ASCE Code of Ethics lecture notes, what is the responsibility of an engineer to a client or employer?',
      seen: ['May 2024'],
      a: `1. **Faithful agent or trustee (§1)** — be guided by the highest standards of integrity; realistic, honest estimates, reports and testimony; admit errors; tell the client if a project will not succeed.
2. **Competence (§6)** — undertake assignments only when **qualified by education or experience** in that field; engage, or advise the client to engage, **experts and specialists** when the client’s interest is best served.
3. **Confidentiality (§7)** — do not disclose information on the **business affairs or technical processes** of a present or former client or employer without consent.
4. **Conflict of interest (§8)** — avoid it; when unavoidable, **fully disclose** the circumstances to the client or employer.
5. **Single compensation (§10)** — no compensation from **more than one party** for the same project unless fully disclosed and agreed by all.
6. **Public safety comes first (§2)** — if the client’s instruction endangers the public, **point out the consequences** and, if overruled, notify the proper authority.
7. **Honest opinion (§5)** — advise only on adequate knowledge and honest conviction.`,
      keys: ['Faithful agent or trustee', 'integrity', 'qualified by education or experience', 'experts and specialists', 'business affairs or technical processes', 'Conflict of interest', 'fully disclose', 'more than one party', 'point out the consequences'],
      lists: ['l-ethics-client'],
      src: KN,
    },
    {
      id: 'a-ethics-s1',
      topic: T,
      q: 'What should the Engineer do in all professional relations or professional matters? (Section 1)',
      seen: ['Jan 2021'],
      a: `**Section 1:** The Engineer will be guided in all his professional relations by the **highest standards of integrity**, and will act in professional matters for each client or employer as a **faithful agent or trustee**.

- Give realistic, honest estimates, reports and testimony.
- Admit errors; never distort facts.
- Advise the client when a project is unlikely to succeed.`,
      keys: ['Section 1', 'highest standards of integrity', 'faithful agent or trustee', 'honest'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s2',
      topic: T,
      q: 'According to Section 2, what issues of the public should the Engineer have regard to, and what should he do if his judgement is overruled by non-technical authority / if conditions endanger them?',
      seen: ['2015-16', '2014-15', '2013-14'],
      a: `**Section 2:**
1. The Engineer will have proper regard for the **safety, health and welfare of the public** in the performance of his professional duties.
2. If his engineering judgement is **overruled by non-technical authority**, he will **clearly point out the consequences**.
3. He will **notify the proper authority** of any observed conditions which **endanger public safety and health**.

Example: a site owner orders extra storeys on a foundation not designed for them — the engineer explains the collapse risk in writing and, if overruled, informs RAJUK / the approving authority. (Books add: withdraw from the work if the client insists.)`,
      keys: ['Section 2', 'safety, health and welfare of the public', 'overruled by non-technical authority', 'clearly point out the consequences', 'notify the proper authority', 'endanger public safety'],
      lists: ['l-ethics-s2'],
      src: KN,
    },
    {
      id: 'a-ethics-s3',
      topic: T,
      q: 'What kind of conduct or practice should the Engineer avoid? (Section 3)',
      seen: ['2021-22', '2015-16'],
      a: `**Section 3:** The Engineer will **avoid all conduct or practice** likely to **discredit or unfavourably reflect upon the dignity or honour** of the profession.

### Examples
1. **Misleading** or self-praising advertising.
2. Exaggerating qualifications or experience.
3. Accepting **bribes**, commissions or kickbacks.
4. Signing or sealing **unsafe plans**.
5. **Plagiarism** — taking credit for others’ work.
6. Fraud or corruption in tendering.
7. Misconduct (e.g. drunkenness) in professional settings.

*(Examples are from standard texts; the rule is the handout’s §3.)*`,
      keys: ['Section 3', 'avoid all conduct or practice', 'discredit', 'dignity or honour', 'Misleading', 'bribes', 'unsafe plans', 'Plagiarism'],
      lists: ['l-ethics-conduct-avoid'],
      src: KN,
    },
    {
      id: 'a-ethics-s4',
      topic: T,
      q: 'According to Section 4, what should the Engineer endeavour to extend and what should he protect the profession from? Give an example of extending public knowledge.',
      seen: ['May 2024', '2014-15', '2013-14'],
      a: `**Section 4:** The Engineer will endeavour to **extend public knowledge and appreciation of engineering** and its achievements, and to **protect the engineering profession from misrepresentation and misunderstanding** — e.g. by correcting untrue, unfair or exaggerated statements about engineering.

### Example
After the **Rana Plaza** collapse, a structural engineer writes newspaper articles and gives community talks explaining in plain language why unauthorised extra storeys and poor-quality columns cause collapse and how building owners can check permits — avoiding exaggerated or unfounded claims.`,
      keys: ['Section 4', 'extend public knowledge and appreciation', 'protect the engineering profession', 'misrepresentation and misunderstanding', 'Rana Plaza'],
      lists: ['l-ethics-sections'],
      src: `${KN}; example from question bank`,
    },
    {
      id: 'a-ethics-s5',
      topic: T,
      q: 'What should the Engineer do when expressing an opinion on an engineering subject? (Section 5)',
      seen: ['Jan 2021'],
      a: `**Section 5:** The Engineer will express an **opinion** on an engineering subject **only when founded on adequate knowledge and honest conviction**.

- No guesses presented as expert opinion (in court, media or reports).
- When speaking for a private interest on a public issue, say on whose behalf.`,
      keys: ['Section 5', 'opinion', 'adequate knowledge and honest conviction'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s6',
      topic: T,
      q: 'When will the Engineer undertake engineering assignments, and when will he engage or advise engaging specialists or experts? (Section 6)',
      seen: ['2023-24', '2021-22', '2015-16', '2014-15'],
      a: `**Section 6:**
1. The Engineer will **undertake engineering assignments only when qualified by education or experience** in the **specific technical field** involved.
2. He will **engage, or advise his client or employer to engage**, and cooperate with, **experts and specialists** whenever the **client’s or employer’s interests are best served** by such service.

Best service needs qualified, trained and experienced people. Example: a structural engineer advises hiring a **geotechnical specialist** for difficult soil, or a fire-safety expert for a high-rise.`,
      keys: ['Section 6', 'only when qualified by education or experience', 'specific technical field', 'experts and specialists', 'interests are best served', 'geotechnical specialist'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s7',
      topic: T,
      q: 'What should the Engineer do when dealing with confidential information? (Section 7)',
      seen: ['2023-24', 'Jan 2021'],
      a: `**Section 7:** The Engineer will **not disclose** information concerning the **business affairs or technical processes** of any **present or former** client or employer **without his consent**.

- Applies even after the job or employment ends.
- E.g. a consultant does not pass one contractor’s method statement or prices to a rival, or a former employer’s design data to a new employer.`,
      keys: ['Section 7', 'not disclose', 'business affairs or technical processes', 'present or former', 'without his consent'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s8',
      topic: T,
      q: 'What should an Engineer do in case of conflict of interest? (Section 8)',
      seen: ['2023-24', 'Jan 2021', '2014-15'],
      a: `**Section 8:** The Engineer will **endeavour to avoid a conflict of interest** with his employer or client, but **when unavoidable**, he shall **fully disclose the circumstances** to his employer or client (and let them decide).

Example: an engineer on a tender evaluation committee whose relative owns a tendering firm **declares** it to the employer and **withdraws** from that evaluation.`,
      keys: ['Section 8', 'avoid a conflict of interest', 'when unavoidable', 'fully disclose the circumstances', 'declares', 'withdraws'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-compensation',
      topic: T,
      q: 'What principle should the Engineer uphold for compensating those engaged in engineering work, and what should he do when accepting compensation? (Sections 9–10)',
      seen: ['2021-22', 'Jan 2021', '2015-16'],
      a: `### Section 9 — compensation principle
The Engineer will **uphold the principle of appropriate and adequate compensation** for those engaged in engineering work, **including those in subordinate capacities**, as being in the **public interest** and maintaining the standards of the profession. Underpaid engineering leads to poor, unsafe work and loss of talent.

### Section 10 — accepting compensation
He will **not accept compensation, financial or otherwise, from more than one party** for services on the same project, unless the circumstances are **fully disclosed** to, and **agreed to by all interested parties**.`,
      keys: ['Section 9', 'appropriate and adequate compensation', 'subordinate', 'public interest', 'Section 10', 'more than one party', 'fully disclosed', 'agreed to by all interested parties'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s11',
      topic: T,
      q: 'What should the Engineer do (not do) when competing with other engineers? (Section 11)',
      seen: ['Jan 2021'],
      a: `**Section 11:** The Engineer will **not compete unfairly** with another engineer by attempting to obtain employment, advancement or professional engagements:
1. by **competitive bidding** (price-cutting for professional services),
2. by **taking advantage of a salaried position**,
3. by **criticising other engineers**, or
4. by other **improper or questionable methods** (e.g. trying to supplant an engineer already engaged).`,
      keys: ['Section 11', 'not compete unfairly', 'competitive bidding', 'salaried position', 'criticising other engineers', 'questionable methods'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s12',
      topic: T,
      q: 'What should the Engineer not attempt to do regarding another engineer’s reputation, and what should he do if he believes another engineer is guilty? (Section 12)',
      seen: ['2020-21', '2014-15', '2013-14'],
      a: `**Section 12:**
1. The Engineer will **not attempt to injure, maliciously or falsely, directly or indirectly**, the **professional reputation, prospects, practice or employment** of another engineer.
2. He will **not indiscriminately criticise** another engineer’s work.
3. If he believes others are **guilty of unethical or illegal practice**, he shall **present the information to the proper authority** for action (e.g. IEB disciplinary committee, employer) — not spread rumours.`,
      keys: ['Section 12', 'maliciously or falsely, directly or indirectly', 'professional reputation, prospects, practice or employment', 'indiscriminately criticise', 'unethical or illegal practice', 'proper authority'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s13',
      topic: T,
      q: 'Whom shall the Engineer not associate with, and by whom shall he not allow the use of his name? (Section 13)',
      seen: ['2020-21', '2015-16', '2013-14'],
      a: `**Section 13:** The Engineer will **not associate with, or allow the use of his name by, an enterprise of questionable character**, nor will he become professionally associated with **engineers who do not conform to ethical practices**, or with **persons not legally qualified** to render the professional services intended.

Example: he must not lend his name or seal to a developer who builds without approval or with substandard materials.`,
      keys: ['Section 13', 'use of his name', 'enterprise of questionable character', 'do not conform to ethical practices', 'not legally qualified'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-s15',
      topic: T,
      q: 'What steps should the Engineer take to increase the effectiveness of the profession / how should he cooperate with other engineers and students? (Section 15)',
      seen: ['2020-21', 'Jan 2021', '2015-16'],
      a: `**Section 15:** The Engineer will cooperate in **extending the effectiveness of the profession** by **interchanging information and experience with other engineers and students**, and will endeavour to provide opportunity for the **professional development and advancement** of engineers **under his supervision**.

### In practice
- Publish papers and case studies; present at seminars.
- Take part in engineering societies (IEB).
- Mentor juniors and interns; support training and continuing education.
- Give **credit** to those who did the work (§14).`,
      keys: ['Section 15', 'extending the effectiveness of the profession', 'interchanging information and experience', 'engineers and students', 'professional development and advancement', 'under his supervision'],
      lists: ['l-ethics-sections'],
      src: KN,
    },
    {
      id: 'a-ethics-peers',
      topic: T,
      q: 'As per the Code of Ethics, what are the responsibilities of an engineer towards his/her peers?',
      seen: ['2023-24', '2020-21'],
      a: `1. **Fair competition (§11)** — never **compete unfairly** for employment, advancement or engagements by competitive bidding, taking advantage of a salaried position, criticising other engineers or other questionable methods.
2. **Protect reputation (§12)** — never **injure, maliciously or falsely**, another engineer’s reputation, prospects, practice or employment; no indiscriminate criticism; if someone is guilty of unethical or illegal practice, present the information to the **proper authority**.
3. **Ethical association (§13)** — do not become professionally associated with engineers who do not conform to **ethical practices** (or persons not legally qualified).
4. **Give credit (§14)** — give **credit** for engineering work to those to whom it is due and recognise their **proprietary interests**.
5. **Interchange and develop (§15)** — interchange **information and experience** with other engineers and students; give engineers under your supervision opportunity for **professional development** and advancement.`,
      keys: ['compete unfairly', 'injure, maliciously or falsely', 'proper authority', 'ethical practices', 'credit', 'proprietary interests', 'information and experience', 'professional development'],
      lists: ['l-ethics-peers'],
      src: KN,
    },
  ],
} satisfies PcTopicContent
