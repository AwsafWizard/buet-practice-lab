// pc-ethics — Code of Ethics for Engineers (the "ASCE Code of Ethics lecture notes" the papers quote).
// Source: Noor sir's slides L09 (Code of Ethics for Engineers): 3 fundamental principles + Sections 1–15 of the old
// numbered US engineers' code (the same text Kabirul sir gave, which the 18-batch solve copies), plus this term's new
// Section 16 (sustainable development) and the five "Topics" (society, profession, client and employers, peers,
// natural and built environment). Section texts below are the SLIDE's words (US spelling) — reproduce them as they are.
import type { PcTopicContent } from '../types'

const T = 'pc-ethics' as const
const S9 = 'Noor sir L09 slides (Code of Ethics for Engineers)'
const SH = '18-batch solve (Shafi) writes the same section text'
const R = 'Rahat’s note (CE22)'
const ALL = ['2023-24', '2022-23', '2021-22', '2020-21', 'Jan 2021', '2015-16', '2014-15', '2013-14']

/** the slide's text of each section, word for word */
const SEC: Record<number, string> = {
  1: 'The Engineer will be guided in all his professional relations by the highest standards of integrity, and will act in professional matters for each client or employer as a faithful agent or trustee.',
  2: 'The Engineer will have proper regard for the safety, health, and welfare of the public in the performance of his professional duties. If his engineering judgment is overruled by a nontechnical authority, he will clearly point out the consequences. He will notify the proper authority of any observed condition that endangers public health and safety.',
  3: 'The Engineer will avoid all conduct or practice likely to discredit or unfavorably reflect upon the dignity or honor of the profession.',
  4: 'The Engineer will endeavor to extend public knowledge and appreciation of engineering and its achievements and to protect the engineering profession from misrepresentation and misunderstanding.',
  5: 'The Engineer will express an opinion of an engineering subject only when founded on adequate knowledge and honest conviction.',
  6: 'The Engineer will undertake engineering assignments for which he will be responsible only when qualified by training or experience, and he will engage, or advise engaging, experts and specialists whenever the client’s or employer’s interest are best served by such service.',
  7: 'The Engineer will not disclose confidential information concerning the business affairs or technical processes of any present or former client or employer without his consent.',
  8: 'The Engineer will endeavor to avoid a conflict of interest with his employer or client, but when unavoidable, the Engineer shall fully disclose the circumstances to his employer or client.',
  9: 'The Engineer will uphold the principle of appropriate and adequate compensation for those engaged in engineering work.',
  10: 'The Engineer will not accept compensation, financial or otherwise, from more than one interested party for the same service or for services pertaining to the same work unless there is full disclosure to and consent of all interested parties.',
  11: 'The Engineer will not compete unfairly with another engineer by attempting to obtain employment or advancement or professional engagements by competitive bidding; taking advantage of a salaried position; criticizing other engineers; or other improper or questionable methods.',
  12: 'The Engineer will not attempt to injure maliciously or falsely, directly or indirectly, the professional reputation, prospects of practice or employment of another engineer. Nor will he indiscriminately criticize another engineer’s work in public. If he believes that another engineer is guilty of unethical or illegal practice, he shall present such information to the proper authority for action.',
  13: 'The Engineer will not associate or allow the use of his name by an enterprise of questionable character nor will he become professionally associated with engineers who do not conform to ethical practices or with persons not legally qualified to render the professional services for which the association is intended.',
  14: 'The Engineer will give credit for engineering work to those to whom credit is due, and will recognize the proprietary interest of others.',
  15: 'The Engineer will cooperate in extending the effectiveness of the profession by exchanging information and experience with other engineers and students and will endeavor to provide an opportunity for the professional development and advancement of engineers under his supervision.',
  16: 'Engineers: a. adhere to the principles of sustainable development; b. consider and balance societal, environmental, and economic impacts, along with opportunities for improvement, in their work; c. mitigate adverse societal, environmental, and economic effects; and d. use resources wisely while minimizing resource depletion.',
}

export default {
  lists: [
    {
      id: 'l-ethics-principles',
      topic: T,
      title: 'Fundamental principles of the code of ethics for engineers',
      ask: 'What are the fundamental principles of the code of ethics for engineers?',
      ordered: true,
      points: [
        { k: 'Honest and impartial; serve with devotion', alt: ['honest', 'impartial', 'devotion', 'fidelity', 'employer clients public', 'honest and impartial, serve with devotion'], d: 'Will be honest and impartial, and will serve with devotion his employer, his clients and the public.' },
        { k: 'Increase competence and prestige of profession', alt: ['competence', 'prestige'], d: 'Will strive to increase the competence and prestige of the engineering profession.' },
        { k: 'Knowledge and skill for human welfare', alt: ['human welfare', 'welfare', 'advancement of human welfare'], d: 'Will use his knowledge and skill for the advancement of human welfare.' },
      ],
      seen: ['2022-23'],
      src: S9,
      note: 'Opening (preamble) line on the slide: “The Engineer, to uphold and advance the honor and dignity of the engineering profession, and in keeping with high standards of ethical conduct …”. Also asked as “the preamble” (2010-11 Q4e, 2008-09 Q4a). Three principles on the slide — the modern ASCE code’s fourth (supporting professional and technical societies) is not class material.',
    },
    {
      id: 'l-ethics-sections',
      topic: T,
      title: 'Sections 1–16 of the code of ethics (keyword, then the slide text)',
      ask: 'Give the keyword of each section of the Code of Ethics for Engineers, Section 1 to 16.',
      ordered: true,
      points: [
        { k: 'Integrity — faithful agent or trustee', alt: ['integrity', 'faithful agent', 'trustee'], d: `§1 ${SEC[1]}` },
        { k: 'Public safety, health and welfare', alt: ['public safety', 'safety health welfare', 'overruled', 'notify proper authority'], d: `§2 ${SEC[2]}` },
        { k: 'Avoid conduct discrediting the profession', alt: ['dignity', 'honor', 'honour', 'discredit', 'conduct'], d: `§3 ${SEC[3]}` },
        { k: 'Extend public knowledge of engineering', alt: ['public knowledge', 'misrepresentation', 'misunderstanding'], d: `§4 ${SEC[4]}` },
        { k: 'Opinion only on adequate knowledge', alt: ['opinion', 'honest conviction', 'adequate knowledge'], d: `§5 ${SEC[5]}` },
        { k: 'Assignments only when qualified; engage experts', alt: ['qualified', 'training or experience', 'experts', 'specialists', 'competence', 'assignments only when qualified'], d: `§6 ${SEC[6]}` },
        { k: 'Confidential information — no disclosure', alt: ['confidential', 'confidentiality', 'not disclose'], d: `§7 ${SEC[7]}` },
        { k: 'Avoid conflict of interest; disclose', alt: ['conflict of interest', 'disclose', 'fully disclose'], d: `§8 ${SEC[8]}` },
        { k: 'Appropriate and adequate compensation', alt: ['adequate compensation', 'compensation principle'], d: `§9 ${SEC[9]}` },
        { k: 'No compensation from more than one party', alt: ['one party', 'more than one party', 'more than one interested party', 'double compensation', 'full disclosure and consent'], d: `§10 ${SEC[10]}` },
        { k: 'No unfair competition', alt: ['unfair competition', 'compete unfairly', 'competitive bidding'], d: `§11 ${SEC[11]}` },
        { k: 'Not injure another engineer’s reputation', alt: ['reputation', 'injure', 'another engineer', 'proper authority'], d: `§12 ${SEC[12]}` },
        { k: 'No association with questionable enterprise', alt: ['questionable character', 'association', 'use of name'], d: `§13 ${SEC[13]}` },
        { k: 'Give credit where due', alt: ['credit', 'proprietary interest', 'proprietary interests'], d: `§14 ${SEC[14]}` },
        { k: 'Exchange information with engineers and students', alt: ['exchanging information', 'interchange information', 'interchanging', 'students', 'professional development', 'effectiveness'], d: `§15 ${SEC[15]}` },
        { k: 'Sustainable development', alt: ['sustainable', 'sustainability', 'environment', 'resources'], d: `§16 ${SEC[16]}` },
      ],
      hook: 'Three rings and a planet: **1–5 public face** (Integrity, Safety, Dignity, Public knowledge, Opinion) · **6–10 client and money** (Qualified, Confidential, Conflict, Compensation, One party) · **11–15 fellow engineers** (Compete fairly, Reputation, Association, Credit, Exchange) · **16 the planet** (Sustainable development). “**I S**ee **D**ogs **P**lay **O**utside; **Q**uiet **C**ats **C**hase **C**heap **O**wls; **C**lever **R**abbits **A**lways **C**ollect **E**ggs — **S**ustainably.”',
      seen: ALL,
      src: `${S9}; ${SH}`,
      note: 'Section 16 is new this term (taken from the modern ASCE code). Wording to watch: §6 “training or experience” (not “education”); §7 “confidential information”; §10 “more than one interested party for the same service or for services pertaining to the same work … full disclosure to and consent of all interested parties”; §12 “prospects of practice or employment … in public”; §15 the slide says “exchanging”, older papers say “interchanging”.',
    },
    {
      id: 'l-ethics-topics',
      topic: T,
      title: 'Topics of the code of ethics (whom the engineer is responsible to)',
      points: [
        { k: 'Society', alt: ['public'] },
        { k: 'Profession' },
        { k: 'Client and employers', alt: ['client', 'employer', 'clients and employers'] },
        { k: 'Peers', alt: ['other engineers', 'fellow engineers'] },
        { k: 'Natural and built environment', alt: ['environment', 'natural environment', 'built environment'] },
      ],
      hook: '**S**ome **P**rofessionals **C**are for **P**eople and **N**ature — Society, Profession, Client and employers, Peers, Natural and built environment.',
      seen: [],
      src: `${S9} (“Topics” slide — the headings of the 2020 ASCE code)`,
      note: 'Client / employer was asked in 2022-23 and peers in 2023-24; society, profession and the natural and built environment have not been asked yet. The slide gives the five headings only — it does not say which section belongs to which.',
    },
    {
      id: 'l-ethics-work-domain',
      topic: T,
      title: 'Work domains of an engineer',
      points: [
        { k: 'Design Engineer', alt: ['design', 'designer'] },
        { k: 'Supervision Engineer', alt: ['supervision', 'site engineer'] },
        { k: 'Consultant' },
        { k: 'Academician / Researcher', alt: ['academician', 'researcher', 'teacher'] },
        { k: 'Administrator', alt: ['administration'] },
      ],
      seen: [],
      src: `${S9} (“Work Domain” slide)`,
    },
    {
      id: 'l-ethics-client',
      topic: T,
      title: 'Responsibilities of an engineer to a client or employer',
      ask: 'What is the responsibility of an engineer to a client or employer (as per the code)?',
      points: [
        { k: 'Faithful agent or trustee (§1)', alt: ['faithful agent', 'trustee', 'integrity'] },
        { k: 'Undertake only qualified assignments (§6)', alt: ['qualified', 'experts', 'specialists', 'training or experience'] },
        { k: 'Keep information confidential (§7)', alt: ['confidential', 'confidentiality'] },
        { k: 'Avoid or disclose conflict of interest (§8)', alt: ['conflict of interest'] },
        { k: 'Compensation from one party only (§10)', alt: ['one party', 'compensation', 'more than one party'] },
        { k: 'Honest opinion on adequate knowledge (§5)', alt: ['opinion', 'honest conviction', 'adequate knowledge'] },
        { k: 'Point out consequences if overruled (§2)', alt: ['public safety', 'point out consequences', 'overruled', 'public safety over client’s wish'] },
      ],
      hook: '**F**aithful, **Q**ualified, **C**onfidential, **C**onflict-free, **O**ne paymaster, honest **O**pinion — and he **P**oints out the consequences when overruled.',
      seen: ['2022-23'],
      src: `${S9}; choice of sections (1, 6, 7, 8, 10, 5, 2) as in ${R}`,
    },
    {
      id: 'l-ethics-peers',
      topic: T,
      title: 'Responsibilities of an engineer towards peers (other engineers)',
      ask: 'What are the responsibilities of an engineer towards his/her peers?',
      points: [
        { k: 'No unfair competition (§11)', alt: ['compete unfairly', 'unfair competition', 'competitive bidding'] },
        { k: 'Not injure reputation; report to authority (§12)', alt: ['reputation', 'injure', 'proper authority', 'indiscriminately criticize', 'indiscriminately criticise'] },
        { k: 'No association with unethical engineers (§13)', alt: ['association', 'questionable character', 'unethical engineers'] },
        { k: 'Give credit where due (§14)', alt: ['credit', 'proprietary interest', 'proprietary interests'] },
        { k: 'Exchange information; develop juniors (§15)', alt: ['exchanging information', 'interchange information', 'students', 'professional development', 'supervision'] },
        { k: 'Appropriate and adequate compensation (§9)', alt: ['compensation', 'fair pay', 'adequate compensation'] },
      ],
      hook: 'Sections **11–15** = the last five of the old code: **C**ompete fairly, **R**eputation, **A**ssociation, **C**redit, **E**xchange — “**C**RACE” — then add **§9**, fair pay for the engineers who work under you.',
      seen: ['2023-24'],
      src: `${S9}; choice of sections as in ${R}`,
      note: '“Peers” is one of the slide’s five topics, but the slide does not map sections to it. Sections 11–15 are the core; §9 (fair compensation of those engaged in engineering work) is Rahat’s sixth point.',
    },
    {
      id: 'l-ethics-society',
      topic: T,
      title: 'Responsibilities of an engineer towards society (the public)',
      ask: 'What are the responsibilities of an engineer towards society / the public?',
      points: [
        { k: 'Safety, health, welfare of the public (§2)', alt: ['public safety', 'safety health welfare', 'notify proper authority', 'overruled'] },
        { k: 'Extend public knowledge of engineering (§4)', alt: ['public knowledge', 'misrepresentation'] },
        { k: 'Sustainable development (§16)', alt: ['sustainable', 'environment', 'resources'] },
      ],
      seen: [],
      src: `${S9}; grouping (Sections 2, 4, 16) from ${R} — the slide lists the topic without mapping sections`,
      note: 'Not asked yet. The third fundamental principle (knowledge and skill for the advancement of human welfare) and §5 (opinion only on adequate knowledge) also fit here.',
    },
    {
      id: 'l-ethics-public',
      topic: T,
      title: 'Duties of the engineer to society and the profession (Sections 2–5 and 16)',
      points: [
        { k: 'Regard public safety, health, welfare (§2)', alt: ['public safety', 'safety health welfare'] },
        { k: 'Avoid conduct discrediting profession (§3)', alt: ['dignity', 'honor', 'honour', 'discredit'] },
        { k: 'Extend public knowledge of engineering (§4)', alt: ['public knowledge', 'misrepresentation'] },
        { k: 'Opinion only on adequate knowledge (§5)', alt: ['opinion', 'honest conviction'] },
        { k: 'Sustainable development (§16)', alt: ['sustainable', 'environment'] },
      ],
      seen: ['2015-16', '2014-15', '2013-14'],
      src: S9,
      note: 'For “responsibilities to the profession” Rahat’s note groups Sections 3, 4 and 15.',
    },
    {
      id: 'l-ethics-s2',
      topic: T,
      title: 'Section 2 — the three duties',
      ordered: true,
      points: [
        { k: 'Proper regard for safety, health, welfare', alt: ['safety', 'health', 'welfare', 'public'], d: 'Of the public, in the performance of his professional duties.' },
        { k: 'If overruled, clearly point out the consequences', alt: ['overruled', 'nontechnical authority', 'non-technical authority', 'consequences', 'if overruled, point out consequences'], d: 'If his engineering judgment is overruled by a nontechnical authority.' },
        { k: 'Notify proper authority of endangering condition', alt: ['notify', 'proper authority', 'notify proper authority of danger'], d: 'Of any observed condition that endangers public health and safety.' },
      ],
      seen: ['2015-16', '2014-15', '2013-14'],
      src: S9,
    },
    {
      id: 'l-ethics-s4',
      topic: T,
      title: 'Section 4 — what the Engineer will endeavor to do',
      ordered: true,
      points: [
        { k: 'Extend public knowledge and appreciation of engineering', alt: ['public knowledge', 'appreciation', 'achievements'], d: 'And of its achievements.' },
        { k: 'Protect profession from misrepresentation and misunderstanding', alt: ['misrepresentation', 'misunderstanding', 'protect'] },
      ],
      seen: ['2022-23', '2014-15', '2013-14'],
      src: S9,
    },
    {
      id: 'l-ethics-s6',
      topic: T,
      title: 'Section 6 — the two rules',
      ordered: true,
      points: [
        { k: 'Undertake only when qualified by training or experience', alt: ['qualified', 'training or experience', 'education or experience', 'for which he will be responsible'], d: 'Engineering assignments for which he will be responsible.' },
        { k: 'Engage, or advise engaging, experts and specialists', alt: ['experts', 'specialists', 'engage experts'], d: 'Whenever the client’s or employer’s interest are best served by such service.' },
      ],
      seen: ['2023-24', '2022-23', '2021-22', '2015-16', '2014-15'],
      src: S9,
      note: 'The most-asked section (8 papers in Rahat’s count). The earlier version of this site had “education or experience in the specific technical field” — the slide (and the 18-batch solve) says “training or experience”.',
    },
    {
      id: 'l-ethics-s11',
      topic: T,
      title: 'Section 11 — unfair ways of obtaining employment, advancement or engagements',
      points: [
        { k: 'Competitive bidding', alt: ['bidding', 'price-cutting'] },
        { k: 'Taking advantage of a salaried position', alt: ['salaried position', 'permanent job'] },
        { k: 'Criticizing other engineers', alt: ['criticising other engineers', 'criticism'] },
        { k: 'Other improper or questionable methods', alt: ['improper methods', 'questionable methods'] },
      ],
      seen: ['2023-24', 'Jan 2021'],
      src: S9,
    },
    {
      id: 'l-ethics-s12',
      topic: T,
      title: 'Section 12 — the three clauses',
      ordered: true,
      points: [
        { k: 'Not injure reputation, prospects of practice, employment', alt: ['reputation', 'prospects of practice', 'employment', 'maliciously or falsely', 'professional reputation'], d: 'Not attempt to injure maliciously or falsely, directly or indirectly — three aspects: (1) professional reputation, (2) prospects of practice, (3) employment of another engineer.' },
        { k: 'Not indiscriminately criticize another’s work in public', alt: ['indiscriminately criticize', 'indiscriminately criticise', 'in public', 'criticize'] },
        { k: 'Present information to proper authority for action', alt: ['proper authority', 'present such information', 'report'], d: 'If he believes that another engineer is guilty of unethical or illegal practice.' },
      ],
      seen: ['2023-24', '2020-21', '2014-15', '2013-14'],
      src: S9,
      note: 'The slide (and the 2013-14 paper) reads “professional reputation, prospects of practice or employment”; some printings of the old code read “reputation, prospects, practice or employment”. Proper authority: the slide shows the logos of BPERB, IEB and BAETE.',
    },
    {
      id: 'l-ethics-s13',
      topic: T,
      title: 'Section 13 — whom the Engineer will not associate with',
      ordered: true,
      points: [
        { k: 'Enterprise of questionable character', alt: ['questionable character', 'enterprise', 'use of his name'], d: 'Will not associate with it or allow the use of his name by it.' },
        { k: 'Engineers who do not conform to ethical practices', alt: ['unethical engineers', 'ethical practices'], d: 'Will not become professionally associated with them.' },
        { k: 'Persons not legally qualified', alt: ['not legally qualified', 'unqualified persons'], d: 'To render the professional services for which the association is intended.' },
      ],
      seen: ['2023-24', '2020-21', '2015-16', '2013-14'],
      src: S9,
    },
    {
      id: 'l-ethics-s15',
      topic: T,
      title: 'Section 15 — how the Engineer extends the effectiveness of the profession',
      ordered: true,
      points: [
        { k: 'Exchange information and experience with engineers, students', alt: ['exchanging information', 'interchanging information', 'information and experience', 'students'], d: 'By exchanging information and experience with other engineers and students.' },
        { k: 'Opportunity for development of engineers under supervision', alt: ['professional development', 'advancement', 'under his supervision', 'juniors'], d: 'Will endeavor to provide an opportunity for the professional development and advancement of engineers under his supervision.' },
      ],
      seen: ['2023-24', '2020-21', 'Jan 2021', '2015-16'],
      src: S9,
    },
    {
      id: 'l-ethics-s16',
      topic: T,
      title: 'Section 16 — sustainable development (clauses a–d)',
      ask: 'What does Section 16 of the code require of engineers (sustainable development)?',
      ordered: true,
      points: [
        { k: 'Adhere to the principles of sustainable development', alt: ['sustainable development', 'adhere'] },
        { k: 'Consider and balance societal, environmental, economic impacts', alt: ['balance', 'impacts', 'societal environmental economic'], d: 'Along with opportunities for improvement, in their work.' },
        { k: 'Mitigate adverse societal, environmental, economic effects', alt: ['mitigate', 'adverse effects'] },
        { k: 'Use resources wisely, minimizing resource depletion', alt: ['resources', 'resource depletion', 'use resources wisely'], d: 'Use resources wisely while minimizing resource depletion.' },
      ],
      hook: '**A**dhere → **C**onsider and balance → **M**itigate → **U**se wisely: “**A** **C**ivil engineer **M**ust **U**phold nature”. The triple *societal, environmental, economic* appears in both b and c.',
      seen: [],
      src: `${S9} (new this term; the text of the modern ASCE code’s “natural and built environment”)`,
    },
    {
      id: 'l-ethics-conduct-avoid',
      topic: T,
      title: 'Examples of conduct the Engineer should avoid (Section 3, own words)',
      points: [
        { k: 'Bribes or kickbacks', alt: ['bribe', 'bribery', 'kickback', 'commissions'], d: 'From contractors or suppliers.' },
        { k: 'Approving sub-standard materials or false measurements', alt: ['sub-standard materials', 'false measurements', 'fraud', 'corruption'] },
        { k: 'Signing drawings he did not check', alt: ['signing unsafe plans', 'unsafe plans', 'signature for sale', 'unchecked drawings'] },
        { k: 'False advertising of qualifications', alt: ['advertising', 'exaggerating qualifications', 'misleading advertising', 'self-laudatory'] },
        { k: 'Negligence that causes accidents', alt: ['negligence', 'accidents', 'misconduct'] },
      ],
      seen: ['2021-22', '2015-16'],
      src: `${R} — own-words examples; the rule itself is Section 3 of the slide`,
      note: 'The code gives no list — these are examples for “explain in your own words”. The earlier version of this site also had plagiarism and tender fraud (question bank).',
    },
  ],

  cards: [
    { id: 'c-ethics-s1', topic: T, front: 'Code of ethics **Section 1** — what does it say?', back: 'The Engineer will be guided in all his professional relations by the **highest standards of integrity**, and will act in professional matters for each client or employer as a **faithful agent or trustee**.', seen: ['Jan 2021', '2022-23'], src: S9 },
    { id: 'c-ethics-s2', topic: T, front: 'Code of ethics **Section 2** — what does it say?', back: 'The Engineer will have proper regard for the **safety, health, and welfare of the public** in the performance of his professional duties. If his engineering judgment is **overruled by a nontechnical authority**, he will **clearly point out the consequences**. He will **notify the proper authority** of any observed condition that endangers public health and safety.', seen: ['2015-16', '2014-15', '2013-14', '2022-23'], src: S9 },
    { id: 'c-ethics-s3', topic: T, front: 'Code of ethics **Section 3** — what does it say?', back: 'The Engineer will **avoid all conduct or practice** likely to **discredit or unfavorably reflect upon the dignity or honor** of the profession.', seen: ['2021-22', '2015-16'], src: S9 },
    { id: 'c-ethics-s4', topic: T, front: 'Code of ethics **Section 4** — what does it say?', back: 'The Engineer will endeavor to **extend public knowledge and appreciation of engineering and its achievements** and to **protect the engineering profession from misrepresentation and misunderstanding**.', seen: ['2022-23', '2014-15', '2013-14'], src: S9 },
    { id: 'c-ethics-s5', topic: T, front: 'Code of ethics **Section 5** — what does it say?', back: 'The Engineer will express an **opinion of an engineering subject** only when founded on **adequate knowledge and honest conviction**.', seen: ['Jan 2021'], src: S9 },
    { id: 'c-ethics-s6', topic: T, front: 'Code of ethics **Section 6** — what does it say?', back: 'The Engineer will undertake engineering assignments **for which he will be responsible** only when **qualified by training or experience**, and he will **engage, or advise engaging, experts and specialists** whenever the client’s or employer’s interest are best served by such service.', seen: ['2023-24', '2021-22', '2015-16', '2014-15', '2022-23'], src: S9 },
    { id: 'c-ethics-s7', topic: T, front: 'Code of ethics **Section 7** — what does it say?', back: 'The Engineer will **not disclose confidential information** concerning the **business affairs or technical processes** of any **present or former** client or employer **without his consent**.', seen: ['2023-24', 'Jan 2021', '2022-23'], src: S9 },
    { id: 'c-ethics-s8', topic: T, front: 'Code of ethics **Section 8** — what does it say?', back: 'The Engineer will endeavor to **avoid a conflict of interest** with his employer or client, but **when unavoidable**, the Engineer shall **fully disclose the circumstances** to his employer or client.', seen: ['2023-24', 'Jan 2021', '2014-15', '2022-23'], src: S9 },
    { id: 'c-ethics-s9', topic: T, front: 'Code of ethics **Section 9** — what does it say?', back: 'The Engineer will uphold the principle of **appropriate and adequate compensation** for **those engaged in engineering work**.', seen: ['2021-22', '2015-16'], src: S9 },
    { id: 'c-ethics-s10', topic: T, front: 'Code of ethics **Section 10** — what does it say?', back: 'The Engineer will not accept compensation, **financial or otherwise**, from **more than one interested party** for the **same service** or for services **pertaining to the same work** unless there is **full disclosure to and consent of all interested parties**.', seen: ['Jan 2021', '2022-23'], src: S9 },
    { id: 'c-ethics-s11', topic: T, front: 'Code of ethics **Section 11** — what does it say?', back: 'The Engineer will **not compete unfairly** with another engineer by attempting to obtain employment or advancement or professional engagements by **competitive bidding**; **taking advantage of a salaried position**; **criticizing other engineers**; or **other improper or questionable methods**.', seen: ['2023-24', 'Jan 2021'], src: S9 },
    { id: 'c-ethics-s12', topic: T, front: 'Code of ethics **Section 12** — what does it say?', back: 'The Engineer will not attempt to **injure maliciously or falsely, directly or indirectly**, the **professional reputation, prospects of practice or employment** of another engineer. Nor will he **indiscriminately criticize** another engineer’s work **in public**. If he believes that another engineer is guilty of unethical or illegal practice, he shall **present such information to the proper authority for action**.', seen: ['2023-24', '2020-21', '2014-15', '2013-14'], src: S9 },
    { id: 'c-ethics-s13', topic: T, front: 'Code of ethics **Section 13** — what does it say?', back: 'The Engineer will not associate or allow the **use of his name** by an **enterprise of questionable character** nor will he become professionally associated with **engineers who do not conform to ethical practices** or with **persons not legally qualified** to render the professional services for which the association is intended.', seen: ['2023-24', '2020-21', '2015-16', '2013-14'], src: S9 },
    { id: 'c-ethics-s14', topic: T, front: 'Code of ethics **Section 14** — what does it say?', back: 'The Engineer will **give credit** for engineering work **to those to whom credit is due**, and will recognize the **proprietary interest** of others.', seen: ['2023-24'], src: S9 },
    { id: 'c-ethics-s15', topic: T, front: 'Code of ethics **Section 15** — what does it say?', back: 'The Engineer will cooperate in **extending the effectiveness of the profession** by **exchanging information and experience with other engineers and students** and will endeavor to provide an opportunity for the **professional development and advancement** of engineers **under his supervision**.', seen: ['2023-24', '2020-21', 'Jan 2021', '2015-16'], src: `${S9} (older papers say “interchanging”)` },
    { id: 'c-ethics-s16', topic: T, front: 'Code of ethics **Section 16** (new this term) — what does it say?', back: 'Engineers: **a.** adhere to the principles of **sustainable development**; **b.** consider and balance **societal, environmental, and economic impacts**, along with opportunities for improvement, in their work; **c.** **mitigate adverse** societal, environmental, and economic effects; and **d.** **use resources wisely** while minimizing resource depletion.', src: S9 },
    { id: 'c-ethics-source', topic: T, front: 'Which code do the papers mean by “ASCE Code of Ethics lecture notes”?', back: 'This term’s slides (Noor sir L09): the old US **“Code of Ethics for Engineers”** — **3 fundamental principles + Sections 1–15** — plus a new **Section 16 (sustainable development)** from the modern ASCE code, and the ASCE-2020 topic headings (society, profession, client and employers, peers, natural and built environment). Not the IEB code, not the ASCE canons.', src: S9 },
    { id: 'c-ethics-principles-count', topic: T, front: 'How many **fundamental principles** are on the slide, and how do they open?', back: '**Three**, after the line “The Engineer, to uphold and advance the **honor and dignity** of the engineering profession, and in keeping with high standards of ethical conduct”: honest and impartial (serve with devotion); competence and prestige; knowledge and skill for human welfare.', seen: ['2022-23'], src: S9 },
    { id: 'c-ethics-preamble-serve', topic: T, front: 'According to the preamble, **whom should the engineer serve**?', back: 'He will **serve with devotion his employer, his clients and the public** (first fundamental principle).', src: `${S9}; asked 2008-09 Q4(a) (Rahat’s question list)` },
    { id: 'c-ethics-coi-def', topic: T, front: 'What is a **conflict of interest** (definition on the Section 8 slide)?', back: 'A situation where a person’s or organization’s **private, personal, or financial interests clash with** their **official or professional responsibilities**.', seen: ['2023-24', 'Jan 2021', '2014-15'], src: `${S9} (boxed note on the Section 8 slide)` },
    { id: 'c-ethics-s12-aspects', topic: T, front: 'Section 12 — **which aspects** of another engineer must not be injured?', back: 'Three: his **(1) professional reputation, (2) prospects of practice, (3) employment** — not maliciously or falsely, directly or indirectly.', seen: ['2020-21', '2013-14'], src: `${S9}; counted as three in ${R}` },
    { id: 'c-ethics-proper-authority', topic: T, front: 'Who is the **proper authority** (Sections 2 and 12)?', back: 'The Section 12 slide shows three logos: **BPERB** (Bangladesh Professional Engineers Registration Board), **IEB** (Institution of Engineers, Bangladesh, est. 1948) and **BAETE** (Board of Accreditation for Engineering and Technical Education). For an unsafe building: RAJUK / the approving authority; also the employer.', seen: ['2020-21'], src: `${S9} (logos, ticked in class); RAJUK and employer from ${R}` },
    { id: 'c-ethics-s9-vs-s10', topic: T, front: '**Section 9** vs **Section 10** — which is “the principle for compensating” and which is “accepting compensation”?', back: '**§9** = the *principle*: appropriate and adequate compensation for those engaged in engineering work (2021-22, 2015-16). **§10** = *accepting* compensation: not from more than one interested party without full disclosure and consent (Jan 2021).', seen: ['2021-22', 'Jan 2021', '2015-16'], src: `${S9}. (The 18-batch solve answered Jan 2021 “accepting compensation” with §9 — that is the wrong section.)` },
    { id: 'c-ethics-glossary', topic: T, front: 'Words explained in class on the ethics slides: *endeavor*, *pertaining*, *salaried position*, *proprietary interest*.', back: '**Endeavor** = try hard, strive (§4). **Pertaining to** = relating to (§10). **Salaried position** = a permanent job (§11). **Proprietary interest** = copyright — what belongs to someone else (§14).', src: `${S9} (pen notes on the slides)` },
    { id: 'c-ethics-tragedies', topic: T, front: 'Why does the ethics lecture open with “**Tragedies**”?', back: 'The slides show engineering tragedies — collapsed buildings such as **Rana Plaza** (Savar, 2013), a girder fallen on a car, site accidents — which happen when engineers ignore safety, accept bad practice or keep quiet. A code of ethics guides engineers to act honestly and protect the public.', src: `${S9} (photo slides, unlabelled); wording from ${R}` },
    { id: 'c-ethics-public-example', topic: T, front: 'Give an example of a civil engineer **extending public knowledge** (§4).', back: 'A **public talk or newspaper article** explaining why buildings must follow the **BNBC** and how earthquake-resistant design protects lives (e.g. after the Rana Plaza collapse); or a **site visit for school students** to a bridge project.', seen: ['2022-23'], src: `${R} (example); rule = Section 4` },
    { id: 'c-ethics-coi-example', topic: T, front: 'Example of handling a **conflict of interest** (§8).', back: 'An engineer on a tender evaluation committee whose relative owns a tendering firm **declares it** to the employer and **withdraws** from that evaluation.', seen: ['2023-24', 'Jan 2021', '2014-15'], src: 'own-words example; rule = Section 8' },
    { id: 'c-ethics-s6-example', topic: T, front: 'Example of **advising the client to engage a specialist** (§6).', back: 'A structural engineer advises hiring a **geotechnical specialist** for soft or difficult soil, or a **fire-safety specialist** for a high-rise.', seen: ['2023-24', '2021-22'], src: `${R} (example); rule = Section 6` },
    { id: 'c-ethics-s10-example', topic: T, front: 'Example for **Section 10** (accepting compensation).', back: 'An engineer paid by the owner to supervise a project must not also take money or gifts from the **contractor** for the same work — unless all parties know and agree.', seen: ['Jan 2021'], src: `${R} (example); rule = Section 10` },
    { id: 'c-ethics-s13-positive', topic: T, front: 'Section 13 turned round: with **whom should** an engineer become professionally associated?', back: 'Only with **engineers who conform to ethical practices** and with **persons legally qualified** to render the professional services — and only with enterprises of sound character.', src: `Section 13 of the slide; asked this way in 2008-09 Q4(e) (Rahat’s question list)` },
    { id: 'c-ethics-s11-bidding', topic: T, front: 'Section 11: why is **competitive bidding** unfair competition?', back: 'Trying to get a professional engagement by **underbidding another engineer’s fee** means competing on price instead of qualification and quality — it lowers the quality of professional service.', src: `${R} (own words); asked 2008-09 Q4(d)` },
    { id: 'c-ethics-old-s4', topic: T, front: 'Older-paper question (2010-11): when shall the Engineer **not issue statements on public policy**?', back: 'The older text of the code: he will not issue statements, criticisms or arguments on matters connected with public policy which are **inspired or paid for by private interests**, unless he **indicates on whose behalf** he is making the statement. **Not on this term’s slides.**', src: `${R}, from the older version of the code (2010-11 Q4a)` },
  ],

  answers: [
    {
      id: 'a-ethics-principles',
      topic: T,
      q: 'What are the fundamental principles of the code of ethics for engineers? Describe.',
      seen: ['2022-23'],
      a: `The Engineer, to uphold and advance the **honor and dignity** of the engineering profession, and in keeping with **high standards of ethical conduct**:

1. Will be **honest and impartial**, and will **serve with devotion** his **employer, his clients and the public**.
2. Will strive to increase the **competence and prestige** of the engineering profession.
3. Will use his **knowledge and skill** for the **advancement of human welfare**.

### Explanation
- **Principle 1:** he tells the truth (e.g. reports the actual test results), does not take sides unfairly, and works sincerely for those he serves.
- **Principle 2:** he keeps learning new codes and technology, and behaves in a way that earns respect for engineers.
- **Principle 3:** engineering must serve people — safe buildings, clean water, sustainable infrastructure — and never harm them.`,
      keys: ['honor and dignity', 'high standards of ethical conduct', 'honest and impartial', 'serve with devotion', 'employer, his clients and the public', 'competence and prestige', 'knowledge and skill', 'advancement of human welfare'],
      lists: ['l-ethics-principles'],
      src: `${S9}; the explanation lines are from ${R}`,
    },
    {
      id: 'a-ethics-preamble',
      topic: T,
      q: 'Describe the preamble of the Code of Ethics for Engineers. According to the preamble, whom should the engineer serve?',
      seen: [],
      a: `The preamble (fundamental principles) of the Code of Ethics for Engineers reads:

“The Engineer, to **uphold and advance the honor and dignity** of the engineering profession, and in keeping with high standards of ethical conduct:
1. Will be honest and impartial, and will **serve with devotion his employer, his clients and the public**;
2. Will strive to increase the **competence and prestige** of the engineering profession;
3. Will use his knowledge and skill for the **advancement of human welfare**.”

So, according to the preamble, the engineer should serve — with devotion — **his employer, his clients and the public**.`,
      keys: ['uphold and advance the honor and dignity', 'serve with devotion his employer, his clients and the public', 'competence and prestige', 'advancement of human welfare'],
      lists: ['l-ethics-principles'],
      src: `${S9}. Not in our 12 papers — asked 2010-11 Q4(e) and 2008-09 Q4(a) (Rahat’s question list); the fundamental principles are the preamble.`,
    },
    {
      id: 'a-ethics-topics',
      topic: T,
      q: 'Why does an engineer need a code of ethics? In which work domains do engineers act, and what topics does the code cover?',
      seen: [],
      a: `### Work domains
Engineers work as **design engineers, supervision engineers, consultants, academicians / researchers and administrators**. In all these roles their decisions affect public life and safety.

### Why a code
Engineering **tragedies** — building collapses such as Rana Plaza, a girder falling on a car, accidents at construction sites — happen when engineers ignore safety, accept bad practice or keep quiet. A code of ethics guides engineers to act honestly and to protect the public.

### Topics of the code
The engineer’s responsibilities are towards:
1. **Society**
2. **Profession**
3. **Client and employers**
4. **Peers**
5. **Natural and built environment**`,
      keys: ['design engineers', 'supervision engineers', 'consultants', 'administrators', 'tragedies', 'Society', 'Profession', 'Client and employers', 'Peers', 'Natural and built environment'],
      lists: ['l-ethics-work-domain', 'l-ethics-topics'],
      src: `${S9} (“Work Domain”, “Tragedies” and “Topics” slides); the connecting sentences are from ${R}, who suggests this as the opening paragraph of any ethics answer. Not asked yet.`,
    },
    {
      id: 'a-ethics-client',
      topic: T,
      q: 'As per the ASCE Code of Ethics lecture notes, what is the responsibility of an engineer to a client or employer?',
      seen: ['2022-23'],
      a: `According to the Code of Ethics for Engineers, the responsibilities of an engineer to a client or employer are:

1. **Faithful agent or trustee (Section 1)** — the Engineer will be guided in all his professional relations by the **highest standards of integrity**, and will act in professional matters for each client or employer as a faithful agent or trustee.
2. **Competence (Section 6)** — he will undertake engineering assignments for which he will be responsible only when **qualified by training or experience**, and he will engage, or advise engaging, **experts and specialists** whenever the client’s or employer’s interest are best served by such service.
3. **Confidentiality (Section 7)** — he will not disclose **confidential information** concerning the business affairs or technical processes of any present or former client or employer without his consent.
4. **Conflict of interest (Section 8)** — he will endeavor to avoid a conflict of interest with his employer or client, but when unavoidable, he shall **fully disclose the circumstances** to his employer or client.
5. **Compensation from one party (Section 10)** — he will not accept compensation, financial or otherwise, from **more than one interested party** for the same service or for services pertaining to the same work unless there is full disclosure to and consent of all interested parties.
6. **Honest opinion (Section 5)** — he will express an opinion of an engineering subject only when founded on **adequate knowledge and honest conviction**.
7. **Point out consequences (Section 2)** — if his engineering judgment is overruled by a nontechnical authority (the client or employer), he will **clearly point out the consequences**.

### Example
A consultant designing a hospital keeps the client’s drawings confidential, takes no commission from a cement supplier, brings in a geotechnical specialist for difficult soil, and warns the owner in writing if told to reduce the column sizes.`,
      keys: ['Faithful agent or trustee', 'highest standards of integrity', 'qualified by training or experience', 'experts and specialists', 'confidential information', 'Conflict of interest', 'fully disclose the circumstances', 'more than one interested party', 'adequate knowledge and honest conviction', 'clearly point out the consequences'],
      lists: ['l-ethics-client'],
      src: `${S9} (section texts word for word); choice of sections and the example from ${R}`,
    },
    {
      id: 'a-ethics-s1',
      topic: T,
      q: 'What should the Engineer do in all professional relations or professional matters? (Section 1)',
      seen: ['Jan 2021'],
      a: `According to **Section 1** of the Code of Ethics for Engineers:
1. The Engineer will be guided in all his professional relations by the **highest standards of integrity**, and
2. will act in professional matters for each client or employer as a **faithful agent or trustee**.

### In my own words
In every professional matter the engineer must be honest and morally upright, and must look after the client’s money, property and interest loyally — the way a trustee guards what is entrusted to him. Example: he certifies only the work the contractor has actually done, not more.`,
      keys: ['Section 1', 'all his professional relations', 'highest standards of integrity', 'faithful agent or trustee'],
      lists: ['l-ethics-sections'],
      src: `${S9}; ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-s2',
      topic: T,
      q: 'According to Section 2, what issues of the public should the Engineer have regard to, and what should he do if his judgement is overruled by non-technical authority / if conditions endanger them?',
      seen: ['2015-16', '2014-15', '2013-14'],
      a: `According to **Section 2** of the Code of Ethics for Engineers:
1. The Engineer will have proper regard for the **safety, health, and welfare of the public** in the performance of his professional duties.
2. If his engineering judgment is **overruled by a nontechnical authority**, he will **clearly point out the consequences**.
3. He will **notify the proper authority** of any observed condition that **endangers public health and safety**.

### In my own words
Public safety comes first. If a building owner orders two extra floors that the foundation cannot carry, the engineer explains the danger of collapse in writing; if he sees a condition that threatens lives (e.g. cracks in a public building), he reports it to the proper authority such as RAJUK.`,
      keys: ['Section 2', 'safety, health, and welfare of the public', 'overruled by a nontechnical authority', 'clearly point out the consequences', 'notify the proper authority', 'endangers public health and safety'],
      lists: ['l-ethics-s2'],
      src: `${S9}; ${SH} (2015-16 Q6b(v) is answered with both clauses 2 and 3); example from ${R}`,
    },
    {
      id: 'a-ethics-s3',
      topic: T,
      q: 'What kind of conduct or practice should the Engineer avoid? (Section 3)',
      seen: ['2021-22', '2015-16'],
      a: `According to **Section 3** of the Code of Ethics for Engineers, the Engineer will **avoid all conduct or practice** likely to **discredit or unfavorably reflect upon** the **dignity or honor of the profession**.

### In my own words
Any behaviour that brings shame to engineers must be avoided, for example:
1. taking **bribes** or kickbacks from contractors or suppliers;
2. approving **sub-standard materials** or false measurements;
3. **signing drawings** he did not check;
4. **false advertising** of his qualifications;
5. **negligence** that causes accidents, and dishonest or illegal practice in general.

Such conduct reduces public trust in the whole profession.`,
      keys: ['Section 3', 'avoid all conduct or practice', 'discredit or unfavorably reflect upon', 'dignity or honor of the profession', 'bribes', 'sub-standard materials', 'signing drawings', 'false advertising', 'negligence'],
      lists: ['l-ethics-conduct-avoid'],
      src: `${S9}; ${SH} gives the section only; the examples are own words from ${R} (useful when it carries 12 marks, as in 2021-22)`,
    },
    {
      id: 'a-ethics-s4',
      topic: T,
      q: 'According to Section 4, what should the Engineer endeavour to extend and what should he protect the profession from? Give an example of extending public knowledge.',
      seen: ['2022-23', '2014-15', '2013-14'],
      a: `According to **Section 4** of the Code of Ethics for Engineers, the Engineer will endeavor:
1. to **extend public knowledge and appreciation of engineering** and its achievements, and
2. to **protect the engineering profession** from **misrepresentation and misunderstanding**.

### In my own words
He tries hard to make people understand what engineers do, and corrects wrong ideas about engineering.

### Example
A civil engineer gives a **public talk or writes a newspaper article** explaining why buildings must follow the Bangladesh National Building Code and how earthquake-resistant design protects lives — for instance after the **Rana Plaza** collapse, explaining in plain language why unauthorised extra storeys cause collapse. He can also arrange a site visit for school students to a bridge project.`,
      keys: ['Section 4', 'extend public knowledge and appreciation of engineering', 'protect the engineering profession', 'misrepresentation and misunderstanding', 'public talk or writes a newspaper article', 'Rana Plaza'],
      lists: ['l-ethics-s4'],
      src: `${S9}; ${SH}; examples from ${R} (the “Tragedies” slides back a Rana Plaza example)`,
    },
    {
      id: 'a-ethics-s5',
      topic: T,
      q: 'What should the Engineer do when expressing an opinion on an engineering subject? (Section 5)',
      seen: ['Jan 2021'],
      a: `According to **Section 5** of the Code of Ethics for Engineers, the Engineer will express an **opinion of an engineering subject** only when founded on **adequate knowledge and honest conviction**.

### In my own words
An engineer should not give an “expert” opinion on a matter he does not understand, or say something he does not honestly believe just to please a client. Example: a structural engineer should not certify a building’s fire safety without proper knowledge and inspection.`,
      keys: ['Section 5', 'opinion of an engineering subject', 'adequate knowledge and honest conviction', 'honestly believe'],
      lists: ['l-ethics-sections'],
      src: `${S9}; ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-s6',
      topic: T,
      q: 'When will the Engineer undertake engineering assignments, and when will he engage or advise engaging specialists or experts? (Section 6)',
      seen: ['2023-24', '2021-22', '2015-16', '2014-15'],
      a: `According to **Section 6** of the Code of Ethics for Engineers:
1. The Engineer will undertake engineering assignments **for which he will be responsible** only when **qualified by training or experience**, and
2. he will **engage, or advise engaging, experts and specialists** whenever the client’s or employer’s **interest are best served** by such service.

### In my own words
- **When to undertake an assignment:** only when he has the training or the practical experience for that kind of work, because he will be responsible for the result. A building designer with no bridge experience should not take sole responsibility for a long-span bridge design.
- **When to engage experts:** whenever a specialist serves the client better — e.g. advising the client to hire a **geotechnical specialist** for soft soil, or a fire-safety specialist for a high-rise.`,
      keys: ['Section 6', 'for which he will be responsible', 'qualified by training or experience', 'engage, or advise engaging, experts and specialists', 'interest are best served', 'geotechnical specialist'],
      lists: ['l-ethics-s6'],
      src: `${S9}; ${SH}; examples from ${R}. (An earlier version of this site said “education or experience in the specific technical field” — not the slide’s words.)`,
    },
    {
      id: 'a-ethics-s7',
      topic: T,
      q: 'What should the Engineer do when dealing with confidential information? (Section 7)',
      seen: ['2023-24', 'Jan 2021'],
      a: `According to **Section 7** of the Code of Ethics for Engineers, the Engineer will **not disclose confidential information** concerning the **business affairs or technical processes** of any **present or former** client or employer **without his consent**.

### In my own words
Information about a client’s costs, tenders, designs or special construction methods must be kept secret, even after the engineer has left that job, unless the client permits it. Example: an engineer who moves to a rival firm must not reveal his old company’s tender prices.`,
      keys: ['Section 7', 'not disclose confidential information', 'business affairs or technical processes', 'present or former', 'without his consent'],
      lists: ['l-ethics-sections'],
      src: `${S9}; ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-s8',
      topic: T,
      q: 'What should an Engineer do in case of conflict of interest? (Section 8)',
      seen: ['2023-24', 'Jan 2021', '2014-15'],
      a: `According to **Section 8** of the Code of Ethics for Engineers:
1. The Engineer will endeavor to **avoid a conflict of interest** with his employer or client, but
2. **when unavoidable**, the Engineer shall **fully disclose the circumstances** to his employer or client.

A conflict of interest is a situation where a person’s **private, personal, or financial interests** clash with their official or professional responsibilities.

### In my own words
He should keep away from situations where his personal interest could influence his professional judgement. If he cannot, he tells the employer everything and lets them decide. Example: an engineer on a tender evaluation committee whose relative owns a tendering firm **declares** it to the employer and **withdraws** from that evaluation.`,
      keys: ['Section 8', 'avoid a conflict of interest', 'when unavoidable', 'fully disclose the circumstances', 'private, personal, or financial interests', 'declares', 'withdraws'],
      lists: ['l-ethics-sections'],
      src: `${S9} (incl. the boxed definition); ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-compensation',
      topic: T,
      q: 'What principle should the Engineer uphold for compensating those engaged in engineering work? (Section 9)',
      seen: ['2021-22', '2015-16'],
      a: `According to **Section 9** of the Code of Ethics for Engineers, the Engineer will **uphold the principle** of **appropriate and adequate compensation** for **those engaged in engineering work**.

### In my own words
- Engineers and technical staff must be **paid fairly** for their skill and responsibility.
- An engineer should not offer or accept unfairly low fees or salaries that reduce the quality of work or exploit juniors.
- Fair pay keeps the profession attractive and the work safe.
- Example: the owner of a firm should not pay fresh graduates below a reasonable rate just because jobs are scarce.

*Section 9 is the principle of compensation. “Accepting compensation” (Jan 2021) is Section 10.*`,
      keys: ['Section 9', 'uphold the principle', 'appropriate and adequate compensation', 'those engaged in engineering work', 'paid fairly'],
      lists: ['l-ethics-sections'],
      src: `${S9}; ${SH}; own-words lines from ${R}. (The earlier version of this site added “including those in subordinate capacities, as being in the public interest” — not on the slide.)`,
    },
    {
      id: 'a-ethics-s10',
      topic: T,
      q: 'What should the Engineer do when accepting compensation? (Section 10)',
      seen: ['Jan 2021'],
      a: `According to **Section 10** of the Code of Ethics for Engineers:
1. The Engineer will **not accept compensation, financial or otherwise**, from **more than one interested party** for the **same service**, or
2. for services **pertaining to the same work**,
3. unless there is **full disclosure to and consent of all interested parties**.

### In my own words
He takes payment from one party only for one piece of work. An engineer paid by the owner to supervise a project must not also take money or gifts from the contractor for the same project — that is double payment and leads to bias. It is allowed only if all the parties know and agree.`,
      keys: ['Section 10', 'not accept compensation, financial or otherwise', 'more than one interested party', 'same service', 'pertaining to the same work', 'full disclosure to and consent of all interested parties'],
      lists: ['l-ethics-sections'],
      src: `${S9}; own-words line from ${R}. The 18-batch solve answered this Jan 2021 part with Section 9 — the wrong section; “accepting compensation” is Section 10.`,
    },
    {
      id: 'a-ethics-s11',
      topic: T,
      q: 'What should the Engineer do (not do) when competing with other engineers? (Section 11)',
      seen: ['Jan 2021'],
      a: `According to **Section 11** of the Code of Ethics for Engineers, the Engineer will **not compete unfairly** with another engineer by attempting to obtain **employment or advancement or professional engagements** by:
1. **competitive bidding**;
2. **taking advantage of a salaried position**;
3. **criticizing other engineers**; or
4. **other improper or questionable methods**.

### In my own words
Professional engagements should be won on merit — qualification and quality of service — not by undercutting another engineer’s fee, by using one’s salaried (permanent) post to grab private work, or by speaking badly of rivals.`,
      keys: ['Section 11', 'not compete unfairly', 'employment or advancement or professional engagements', 'competitive bidding', 'taking advantage of a salaried position', 'criticizing other engineers', 'other improper or questionable methods'],
      lists: ['l-ethics-s11'],
      src: `${S9}; ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-s12',
      topic: T,
      q: 'What should the Engineer not attempt to do regarding another engineer’s reputation, and what should he do if he believes another engineer is guilty? (Section 12)',
      seen: ['2020-21', '2014-15', '2013-14'],
      a: `According to **Section 12** of the Code of Ethics for Engineers:
1. The Engineer will not attempt to injure **maliciously or falsely, directly or indirectly**, the **professional reputation, prospects of practice or employment** of another engineer.
2. Nor will he **indiscriminately criticize** another engineer’s work **in public**.
3. If he believes that another engineer is **guilty of unethical or illegal practice**, he shall present such information to the **proper authority for action**.

### Aspects he must not injure
Three: (1) the professional reputation, (2) the prospects of practice, and (3) the employment of another engineer.

### If another engineer is guilty
He does not spread rumours or criticize him publicly. He presents the facts to the proper authority — e.g. BPERB (Bangladesh Professional Engineers Registration Board), IEB (Institution of Engineers, Bangladesh) or the employer — so that action is taken properly.`,
      keys: ['Section 12', 'maliciously or falsely, directly or indirectly', 'professional reputation, prospects of practice or employment', 'indiscriminately criticize', 'in public', 'guilty of unethical or illegal practice', 'proper authority for action', 'BPERB'],
      lists: ['l-ethics-s12'],
      src: `${S9} (the slide shows the BPERB, IEB and BAETE logos); ${SH}; “three aspects” and the own-words lines from ${R}`,
    },
    {
      id: 'a-ethics-s13',
      topic: T,
      q: 'Whom shall the Engineer not associate with, and by whom shall he not allow the use of his name? (Section 13)',
      seen: ['2020-21', '2015-16', '2013-14'],
      a: `According to **Section 13** of the Code of Ethics for Engineers:
1. The Engineer will not associate or allow the **use of his name** by an **enterprise of questionable character**,
2. nor will he become professionally associated with engineers who **do not conform to ethical practices**,
3. or with persons **not legally qualified** to render the professional services for which the association is intended.

### In my own words
An engineer must protect his name. He should not lend his name or signature to a fraudulent developer (one who builds without approval or with sub-standard materials), should not partner with engineers known for bribery or fake certificates, and should not form a firm with unqualified people who pretend to be engineers.`,
      keys: ['Section 13', 'use of his name', 'enterprise of questionable character', 'do not conform to ethical practices', 'not legally qualified'],
      lists: ['l-ethics-s13'],
      src: `${S9}; ${SH}; own-words line from ${R}`,
    },
    {
      id: 'a-ethics-s14',
      topic: T,
      q: 'What should the Engineer do about credit for engineering work and the proprietary interest of others? (Section 14)',
      seen: [],
      a: `According to **Section 14** of the Code of Ethics for Engineers:
1. The Engineer will **give credit for engineering work** to **those to whom credit is due**, and
2. will recognize the **proprietary interest** of others.

### In my own words
He does not claim others’ designs or ideas as his own. He acknowledges the contributions of colleagues and juniors, and respects what belongs to others — **copyright**, patents and designs. Example: when a junior engineer finds a cheaper foundation solution, the senior engineer names him in the report.`,
      keys: ['Section 14', 'give credit for engineering work', 'those to whom credit is due', 'proprietary interest', 'copyright'],
      lists: ['l-ethics-sections'],
      src: `${S9} (class note on the slide: proprietary interest = copyright); own-words lines from ${R}. On the slides, not asked alone yet (part of “peers”, 2023-24).`,
    },
    {
      id: 'a-ethics-s15',
      topic: T,
      q: 'What steps should the Engineer take to increase the effectiveness of the profession / how should he cooperate with other engineers and students? (Section 15)',
      seen: ['2020-21', 'Jan 2021', '2015-16'],
      a: `According to **Section 15** of the Code of Ethics for Engineers:
1. The Engineer will cooperate in **extending the effectiveness of the profession** by **exchanging information and experience** with other **engineers and students**, and
2. will endeavor to provide an opportunity for the **professional development and advancement** of engineers **under his supervision**.

### Steps, in my own words
- Share information and experience with other engineers — seminars, papers, IEB activities.
- Share knowledge with students — guest lectures, internships.
- Give the engineers under his supervision opportunities for training, higher study and promotion, and mentor them.

*The slide says “exchanging”; older papers say “interchanging” — the same thing.*`,
      keys: ['Section 15', 'extending the effectiveness of the profession', 'exchanging information and experience', 'engineers and students', 'professional development and advancement', 'under his supervision'],
      lists: ['l-ethics-s15'],
      src: `${S9}; ${SH}; the steps are from ${R} (for the 12-mark 2020-21 wording)`,
    },
    {
      id: 'a-ethics-s16',
      topic: T,
      q: 'What does the code say about sustainable development / the engineer’s responsibility to the natural and built environment? (Section 16)',
      seen: [],
      a: `According to **Section 16** of the Code of Ethics for Engineers, Engineers:
1. adhere to the principles of **sustainable development**;
2. **consider and balance** societal, environmental, and economic impacts, along with **opportunities for improvement**, in their work;
3. **mitigate adverse** societal, environmental, and economic effects; and
4. **use resources wisely** while minimizing **resource depletion**.

### In my own words
The engineer meets today’s needs without spoiling the future: he weighs the effect of a project on people, nature and cost together, reduces the harm it does, and does not waste materials. Example: using fly-ash cement and recycled aggregate, designing for rain-water harvesting, and protecting the river during bridge construction.`,
      keys: ['Section 16', 'sustainable development', 'consider and balance', 'societal, environmental, and economic impacts', 'opportunities for improvement', 'mitigate adverse', 'use resources wisely', 'resource depletion'],
      lists: ['l-ethics-s16'],
      src: `${S9} — new this term, not asked yet (the likeliest new ethics question); example from ${R}. Of the slide’s five topics this is the “natural and built environment”.`,
    },
    {
      id: 'a-ethics-peers',
      topic: T,
      q: 'As per the Code of Ethics, what are the responsibilities of an engineer towards his/her peers?',
      seen: ['2023-24'],
      a: `According to the Code of Ethics for Engineers, the responsibilities of an engineer towards his peers (other engineers) are:

1. **No unfair competition (Section 11)** — the Engineer will **not compete unfairly** with another engineer by attempting to obtain employment or advancement or professional engagements by competitive bidding; taking advantage of a salaried position; criticizing other engineers; or other improper or questionable methods.
2. **Not injure another engineer (Section 12)** — he will not attempt to **injure maliciously or falsely**, directly or indirectly, the professional reputation, prospects of practice or employment of another engineer. Nor will he indiscriminately criticize another engineer’s work in public. If he believes that another engineer is guilty of unethical or illegal practice, he shall present such information to the **proper authority** for action.
3. **Proper association (Section 13)** — he will not associate or allow the use of his name by an enterprise of questionable character, nor will he become professionally associated with engineers who do not conform to **ethical practices** or with persons not legally qualified to render the professional services for which the association is intended.
4. **Give credit (Section 14)** — he will give **credit for engineering work** to those to whom credit is due, and will recognize the **proprietary interest** of others.
5. **Exchange and develop (Section 15)** — he will cooperate in extending the effectiveness of the profession by exchanging **information and experience** with other engineers and students, and will endeavor to provide an opportunity for the **professional development** and advancement of engineers under his supervision.
6. **Fair compensation (Section 9)** — he will uphold the principle of **appropriate and adequate compensation** for those engaged in engineering work, i.e. he does not exploit junior engineers with unfair pay.

### Example
When a junior engineer finds a cheaper foundation solution, the senior engineer gives him credit in the report and mentors him, and he does not criticize a rival firm’s design to win the job.`,
      keys: ['not compete unfairly', 'injure maliciously or falsely', 'proper authority', 'ethical practices', 'credit for engineering work', 'proprietary interest', 'information and experience', 'professional development', 'appropriate and adequate compensation'],
      lists: ['l-ethics-peers'],
      src: `${S9} (section texts word for word); choice of sections (11–15 and 9) and the example from ${R} — the slide names “Peers” as a topic without listing sections`,
    },
    {
      id: 'a-ethics-society',
      topic: T,
      q: 'As per the Code of Ethics, what are the responsibilities of an engineer towards society (the public)?',
      seen: [],
      a: `According to the Code of Ethics for Engineers, the responsibilities of an engineer towards society are:

1. **Public safety (Section 2)** — the Engineer will have proper regard for the **safety, health, and welfare of the public** in the performance of his professional duties. If his engineering judgment is overruled by a nontechnical authority, he will clearly point out the consequences. He will **notify the proper authority** of any observed condition that endangers public health and safety.
2. **Public knowledge (Section 4)** — he will endeavor to **extend public knowledge and appreciation of engineering** and its achievements and to protect the engineering profession from misrepresentation and misunderstanding.
3. **Sustainable development (Section 16)** — engineers adhere to the principles of **sustainable development**; consider and balance societal, environmental, and economic impacts; **mitigate adverse** societal, environmental, and economic effects; and use resources wisely while minimizing resource depletion.

These follow from the fundamental principle that the Engineer will use his knowledge and skill for the **advancement of human welfare**.

### Example
An engineer refuses to approve extra floors on a weak foundation and reports the danger to RAJUK; he writes in the newspaper on why buildings must follow the BNBC.`,
      keys: ['safety, health, and welfare of the public', 'notify the proper authority', 'extend public knowledge and appreciation of engineering', 'sustainable development', 'mitigate adverse', 'advancement of human welfare'],
      lists: ['l-ethics-society', 'l-ethics-s2', 'l-ethics-s4', 'l-ethics-s16'],
      src: `${S9} (section texts word for word). Not asked yet: “Society” is one of the slide’s five topics, of which client / employer (2022-23) and peers (2023-24) have been asked. The grouping (Sections 2, 4, 16) is ${R}’s — the slide does not map sections to topics.`,
    },
    {
      id: 'a-ethics-profession',
      topic: T,
      q: 'As per the Code of Ethics, what are the responsibilities of an engineer towards the engineering profession?',
      seen: [],
      a: `According to the Code of Ethics for Engineers, the responsibilities of an engineer towards the profession are:

1. **Dignity and honor (Section 3)** — the Engineer will avoid all conduct or practice likely to **discredit or unfavorably reflect upon** the dignity or honor of the profession.
2. **Protect the profession (Section 4)** — he will endeavor to extend public knowledge and appreciation of engineering and its achievements and to protect the engineering profession from **misrepresentation and misunderstanding**.
3. **Effectiveness of the profession (Section 15)** — he will cooperate in **extending the effectiveness of the profession** by exchanging information and experience with other engineers and students and will endeavor to provide an opportunity for the professional development and advancement of engineers under his supervision.

These follow from the fundamental principle that the Engineer will strive to increase the **competence and prestige** of the engineering profession.`,
      keys: ['discredit or unfavorably reflect upon', 'misrepresentation and misunderstanding', 'extending the effectiveness of the profession', 'competence and prestige'],
      lists: ['l-ethics-public', 'l-ethics-s4', 'l-ethics-s15'],
      src: `${S9} (section texts word for word). Not asked yet: “Profession” is one of the slide’s five topics. The grouping (Sections 3, 4, 15) is ${R}’s — the slide does not map sections to topics.`,
    },
  ],
} satisfies PcTopicContent
