// AAN sir block (communication + code of ethics): how each past-paper part is answered.
// Answers live in content/comm.ts, 7cs.ts, writing.ts, oral.ts, ethics.ts.
import type { PcPartMap } from '../types'

const QB_ONLY = 'No class-note source — answer is from the standard texts (question bank).'

export const AAN_MAP: Record<string, PcPartMap> = {
  // ---------- 2023-24 ----------
  'pc-2023-24-1a': {
    topics: ['pc-comm'],
    ans: ['a-comm-definition', 'a-comm-process', 'a-comm-skills-traits'],
    extra: 'The skills and traits are to be **named only** (no description): skills — listening, reading, writing, speaking; traits — perception, precision, credibility, control, congeniality.',
  },
  'pc-2023-24-1b': { topics: ['pc-writing', 'pc-comm'], ans: ['a-writing-slanted-abstract'], extra: 'For 8 marks: define abstracting in one line, then spend the answer on the **slanted abstract** (definition + example) and its **purpose** (persuade / influence).' },
  'pc-2023-24-1c': { topics: ['pc-writing'], ans: ['a-writing-short-formats'] },
  'pc-2023-24-2a': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s8', 'a-ethics-s7', 'a-ethics-s6'],
    extra: '(i) conflict of interest → **Section 8**; (ii) confidential information → **Section 7**; (iii) undertaking engineering assignments → **Section 6**. “In your own words”: state the rule, then a one-line example.',
  },
  'pc-2023-24-2b': { topics: ['pc-ethics'], ans: ['a-ethics-peers'] },
  'pc-2023-24-3a': { topics: ['pc-oral'], ans: ['a-meeting-leadership'], notes: [QB_ONLY] },

  // ---------- May 2024 (printed 2021-22, second sitting) ----------
  'pc-may-2024-5a': {
    topics: ['pc-comm'],
    ans: ['a-comm-nonverbal', 'a-comm-barriers', 'a-comm-denotation-connotation', 'a-comm-abstracting-inferring'],
    extra: 'Only **denotation** (not connotation) and **abstraction** (not inferring) are asked in the last line — keep those two short.',
  },
  'pc-may-2024-6a': { topics: ['pc-ethics'], ans: ['a-ethics-principles'] },
  'pc-may-2024-6b': { topics: ['pc-ethics'], ans: ['a-ethics-client'] },
  'pc-may-2024-6c': { topics: ['pc-ethics'], ans: ['a-ethics-s4'], extra: '3 marks: quote Section 4 in one line and give the example (e.g. Rana Plaza public talks/articles).' },
  'pc-may-2024-7a': { topics: ['pc-oral'], ans: ['a-meeting-leadership'], notes: [QB_ONLY] },
  'pc-may-2024-7b': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'], extra: 'A **list** question (9 marks): the seven names, each with a one-line meaning, is enough.' },
  'pc-may-2024-7c': { topics: ['pc-writing'], ans: ['a-writing-short-structure'] },

  // ---------- 2021-22 ----------
  'pc-2021-22-5': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s3', 'a-ethics-s6', 'a-ethics-compensation'],
    extra: '(i) conduct to avoid → **Section 3** (12); (ii) engaging specialists or experts → **Section 6** (12); (iii) principle for compensating those engaged in engineering work → **Section 9** (11).',
    notes: ['Sub-part (iii) is missing from the printed skeleton text; read from the paper scan.'],
  },
  'pc-2021-22-6a': { topics: ['pc-comm'], ans: ['a-comm-nonverbal'] },
  'pc-2021-22-6b': { topics: ['pc-comm'], ans: ['a-comm-process'] },
  'pc-2021-22-7a': { topics: ['pc-oral'], ans: ['a-oral-steps', 'a-oral-verbal-delivery'] },

  // ---------- 2020-21 ----------
  'pc-2020-21-1': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s15', 'a-ethics-s13', 'a-ethics-s12'],
    extra: '(i) steps to increase the effectiveness of the profession → **Section 15** (12); (ii) whom not to associate with / who may not use his name → **Section 13** (12); (iii) aspects of another engineer not to injure, and what to do if he is guilty → **Section 12** (11).',
    notes: ['Sub-parts are not in the skeleton text; read from the paper.'],
  },
  'pc-2020-21-2a': { topics: ['pc-7cs'], ans: ['a-7cs-courtesy'] },
  'pc-2020-21-2b': { topics: ['pc-writing', 'pc-comm'], ans: ['a-writing-slanted-abstract'] },
  'pc-2020-21-3b': { topics: ['pc-comm'], ans: ['a-comm-categories'] },

  // ---------- Jan 2021 ----------
  'pc-jan-2021-4a': { topics: ['pc-writing'], ans: ['a-writing-business-messages'] },
  'pc-jan-2021-4b': { topics: ['pc-writing'], ans: ['a-writing-exec-summary'], notes: ['The methods-and-procedures checklist has no class-note source (question bank).'] },
  'pc-jan-2021-5': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s1', 'a-ethics-s15', 'a-ethics-compensation', 'a-ethics-s7', 'a-ethics-s8', 'a-ethics-s5', 'a-ethics-s11'],
    extra: '(i) all professional relations → **§1**; (ii) interchanging information and experience with engineers and students → **§15**; (iii) accepting compensation → **§10** (with §9); (iv) confidential information → **§7**; (v) conflict of interest → **§8**; (vi) expressing opinion on an engineering subject → **§5**; (vii) competing with other engineers → **§11**. Five marks each: rule in your own words + one example.',
  },
  'pc-jan-2021-6a': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'], extra: 'List only (7 marks): one mark per C.' },
  'pc-jan-2021-6b': { topics: ['pc-7cs'], ans: ['a-7cs-completeness', 'a-7cs-consideration', 'a-7cs-concreteness'], extra: '“Main points only”: 10 marks completeness, 9 each consideration and concreteness.' },

  // ---------- 2017-18 ----------
  'pc-2017-18-6c': {
    topics: ['pc-comm'],
    ans: ['a-comm-nonverbal', 'a-comm-barriers', 'a-comm-abstracting-inferring'],
    notes: ['Printed “three main elements of verbal communication” — almost certainly non-verbal (the same question as May 2024 5(a)); answer appearance, body language, silence/time/space and say so.'],
  },
  'pc-2017-18-8a': { topics: ['pc-comm'], ans: ['a-comm-definition', 'a-comm-process', 'a-comm-importance'] },
  'pc-2017-18-8b': {
    topics: ['pc-writing'],
    ans: ['a-writing-proposal-parts', 'a-writing-proposal-chronology'],
    extra: '**Project proposal** = a written plan or presentation for completing a task (research, business, solicited or unsolicited). **Supplementary part** contains: maps, graphs, tables, charts; letter of support; letter of endorsement; references; forms; table of definitions. Then the solicited-proposal chronology.',
    notes: ['The chronology has no class-note source (question bank).'],
  },

  // ---------- 2016-17 ----------
  'pc-2016-17-5a': { topics: ['pc-oral'], ans: ['a-oral-steps'] },
  'pc-2016-17-5b': { topics: ['pc-comm'], ans: ['a-comm-categories'] },
  'pc-2016-17-6a': { topics: ['pc-writing'], ans: ['a-writing-proposal-parts'] },
  'pc-2016-17-6b': { topics: ['pc-comm'], ans: ['a-comm-barriers', 'a-comm-abstracting-inferring', 'a-comm-nonverbal'] },

  // ---------- 2015-16 ----------
  'pc-2015-16-5a': { topics: ['pc-comm'], ans: ['a-comm-definition', 'a-comm-importance', 'a-comm-categories'] },
  'pc-2015-16-5b': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'] },
  'pc-2015-16-6a': { topics: ['pc-writing'], ans: ['a-writing-report'], notes: ['“Why reports are important” has no class-note source (question bank).'] },
  'pc-2015-16-6b': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-compensation', 'a-ethics-s13', 'a-ethics-s15', 'a-ethics-s6', 'a-ethics-s2', 'a-ethics-s3'],
    extra: '(i) compensation principle → **§9**; (ii) not associate with → **§13**; (iii) cooperate with engineers and students → **§15**; (iv) when to undertake assignments → **§6**; (v) judgement overruled by non-technical authority → **§2**; (vi) conduct to avoid → **§3**. Marks 5×3 + 1×2.',
  },

  // ---------- 2014-15 ----------
  'pc-2014-15-5a': { topics: ['pc-comm'], ans: ['a-comm-business-types'] },
  'pc-2014-15-5b': { topics: ['pc-comm'], ans: ['a-comm-abstracting-inferring', 'a-comm-denotation-connotation'] },
  'pc-2014-15-6b': { topics: ['pc-7cs'], ans: ['a-7cs-concreteness', 'a-7cs-conciseness', 'a-7cs-completeness'] },
  'pc-2014-15-8': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s2', 'a-ethics-s4', 'a-ethics-s6', 'a-ethics-s8', 'a-ethics-s12'],
    extra: '(i) **§2** — public issues and what to do if conditions endanger them; (ii) **§4** — extend public knowledge, protect from misrepresentation; (iii) **§6** — undertaking assignments and engaging experts; (iv) **§8** — conflict of interest; (v) **§12** — not to injure another engineer. 7 marks each.',
  },

  // ---------- 2013-14 ----------
  'pc-2013-14-4c': { topics: ['pc-oral'], ans: ['a-oral-steps'] },
  'pc-2013-14-7a': { topics: ['pc-oral'], ans: ['a-meeting-plan'] },
  'pc-2013-14-7b': { topics: ['pc-7cs'], ans: ['a-7cs-concepts', 'a-7cs-completeness', 'a-7cs-conciseness', 'a-7cs-concreteness'], extra: 'Name all seven first (one line), then describe the three asked.' },
  'pc-2013-14-8a': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s2', 'a-ethics-s4', 'a-ethics-s12', 'a-ethics-s13'],
    extra: '(i) **§2** — public issues to keep in mind (3) and what to do if overruled by non-technical authority (2); (ii) **§4** (4); (iii) **§12** (4); (iv) **§13** (4).',
  },

  // ---------- 2012-13 ----------
  'pc-2012-13-4a': { topics: ['pc-comm'], ans: ['a-comm-categories'] },
  'pc-2012-13-4b': { topics: ['pc-7cs'], ans: ['a-7cs-completeness', 'a-7cs-conciseness', 'a-7cs-consideration'] },
  'pc-2012-13-7a': { topics: ['pc-writing'], ans: ['a-writing-proposal-parts'] },
  'pc-2012-13-7b': { topics: ['pc-writing'], ans: ['a-writing-proposal-chronology'], notes: [QB_ONLY] },
  'pc-2012-13-8c': { topics: ['pc-comm'], ans: ['a-comm-abstracting-inferring', 'a-comm-denotation-connotation'] },

  // ---------- 2011-12 ----------
  'pc-2011-12-8': { topics: ['pc-comm'], ans: ['a-comm-categories'], extra: 'For 21 marks give examples under each category: internal (work orders, progress reports, site meetings, memos), external (tender notices, letters to clients, proposals, press releases), personal (casual talk, greetings, social events).' },
  'pc-2011-12-11c': { topics: ['pc-comm'], ans: ['a-comm-abstracting-inferring'] },
  'pc-2011-12-14a': {
    topics: ['pc-comm'],
    ans: ['a-comm-bypassing-slanting'],
    notes: ['Scan reads “Miscommunication instruction” and “Slender attitude” — i.e. miscommunicated instructions (bypassing) and slanted attitude, both from Kabirul sir’s barrier list.'],
  },
  'pc-2011-12-14b': { topics: ['pc-7cs'], ans: ['a-7cs-consideration', 'a-7cs-concreteness', 'a-7cs-correctness'] },
}
