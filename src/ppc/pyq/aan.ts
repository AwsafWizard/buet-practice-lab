// AAN sir block (communication + code of ethics): how each past-paper part is answered.
// Answers live in content/comm.ts, 7cs.ts, writing.ts, oral.ts, ethics.ts.
import type { PcPartMap } from '../types'

export const AAN_MAP: Record<string, PcPartMap> = {
  // ---------- 2023-24 ----------
  'pc-2023-24-1a': {
    topics: ['pc-comm'],
    ans: ['a-comm-definition', 'a-comm-process', 'a-comm-skills-traits'],
    extra: 'The skills and traits are to be **named only** (no description): skills — listening, speaking, reading, writing; traits — perception, precision, credibility, control, congeniality. Draw the process diagram (context box: sender → message → channel → receiver, feedback arrow back).',
  },
  'pc-2023-24-1b': { topics: ['pc-writing', 'pc-comm'], ans: ['a-writing-slanted-abstract'], extra: 'For 8 marks: abstraction in one line (focusing on some details and omitting others), then the **slanted abstract** — facts selected to distort reality or support one’s own view of reality — its **purpose: to deceive, mislead, miscommunicate** (slide), and the **car example** (reality → slanted version → honest version).' },
  'pc-2023-24-1c': { topics: ['pc-writing'], ans: ['a-writing-short-formats'], extra: '9 marks: draw the tree (letter report · informational memorandum report → conference, progress, periodic · interpretative / analytical memorandum report → personnel, recommendation-justification), then one line on each.' },
  'pc-2023-24-2a': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s8', 'a-ethics-s7', 'a-ethics-s6'],
    extra: '(i) conflict of interest → **Section 8**; (ii) confidential information → **Section 7**; (iii) undertaking engineering assignments → **Section 6**. Four marks each: “According to Section N …” + the section as on the slide, then one line in your own words with an example. For (i) the slide also defines a conflict of interest (private, personal, or financial interests clashing with official or professional responsibilities).',
  },
  'pc-2023-24-2b': { topics: ['pc-ethics'], ans: ['a-ethics-peers'], extra: '23 marks: Sections **11, 12, 13, 14, 15** word for word, each with a line in your own words; add **Section 9** (fair compensation of those engaged in engineering work) as a sixth point and close with one example.' },
  'pc-2023-24-3a': { topics: ['pc-oral'], ans: ['a-meeting-leadership'] },

  // ---------- 2022-23 (held May 2024; sheet prints 2021-2022) ----------
  'pc-may-2024-5a': {
    topics: ['pc-comm'],
    ans: ['a-comm-nonverbal', 'a-comm-barriers', 'a-comm-denotation-connotation', 'a-comm-abstracting-inferring'],
    extra: 'Only **denotation** (not connotation) and **abstraction** (not inferring) are asked in the last line — keep those two short. Barrier = the slide sentence: “A communication barrier (problem or noise) is any interference in the communication process that distorts or obscures the sender’s meaning.” Then the three differences with their sub-categories.',
  },
  'pc-may-2024-6a': { topics: ['pc-ethics'], ans: ['a-ethics-principles'], extra: '12 marks: the opening line (“The Engineer, to uphold and advance the honor and dignity of the engineering profession …”), the **three** principles word for word, and a line of explanation for each.' },
  'pc-may-2024-6b': { topics: ['pc-ethics'], ans: ['a-ethics-client'], extra: '20 marks: Sections **1, 6, 7, 8, 10, 5** and the “overruled” clause of **Section 2**, each word for word, and one combined example.' },
  'pc-may-2024-6c': { topics: ['pc-ethics'], ans: ['a-ethics-s4'], extra: '3 marks: quote Section 4 in one line and give one example — a public talk or newspaper article on why buildings must follow the BNBC (e.g. after Rana Plaza), or a site visit for school students.' },
  'pc-may-2024-7a': { topics: ['pc-oral'], ans: ['a-meeting-leadership'] },
  'pc-may-2024-7b': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'], extra: 'A **list** question (9 marks): the seven names, each with a one-line meaning, is enough.' },
  'pc-may-2024-7c': { topics: ['pc-writing'], ans: ['a-writing-short-structure'], extra: '6 marks: the three parts as on the slide — prefatory part or introduction; discussion, text or body; terminal section (summary, conclusions and recommendations) — with one line on each.' },

  // ---------- 2021-22 ----------
  'pc-2021-22-5': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s3', 'a-ethics-s6', 'a-ethics-compensation'],
    extra: '(i) conduct to avoid → **Section 3** (12); (ii) engaging specialists or experts → **Section 6** (12); (iii) principle for compensating those engaged in engineering work → **Section 9** (11). With 11–12 marks a part, write the section word for word and then explain it in your own words with examples (for (i), four or five kinds of conduct to avoid).',
  },
  'pc-2021-22-6a': { topics: ['pc-comm'], ans: ['a-comm-nonverbal'] },
  'pc-2021-22-6b': { topics: ['pc-comm'], ans: ['a-comm-process'] },
  'pc-2021-22-7a': { topics: ['pc-oral'], ans: ['a-oral-steps', 'a-oral-verbal-delivery'] },

  // ---------- 2020-21 ----------
  'pc-2020-21-1': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s15', 'a-ethics-s13', 'a-ethics-s12'],
    extra: '(i) steps to increase the effectiveness of the profession → **Section 15** (12); (ii) whom not to associate with / who may not use his name → **Section 13** (12); (iii) aspects of another engineer not to injure, and what to do if he is guilty → **Section 12** (11): **three aspects** — professional reputation, prospects of practice, employment; if guilty, present such information to the **proper authority** for action (the slide shows BPERB, IEB, BAETE).',
  },
  'pc-2020-21-2a': { topics: ['pc-7cs'], ans: ['a-7cs-courtesy'] },
  'pc-2020-21-2b': { topics: ['pc-writing', 'pc-comm'], ans: ['a-writing-slanted-abstract'], extra: '18 marks, four parts: abstraction → why necessary (limitations of time, space, purpose; necessary and desirable) → slanted abstract → purpose (**to deceive, mislead, miscommunicate**), with the car example.' },
  'pc-2020-21-3b': { topics: ['pc-comm'], ans: ['a-comm-categories'], extra: 'Name the three categories in one line each, then describe the three internal directions in detail (slide wording) with an example each: downward — the PM issues a work schedule to site engineers; upward — a site engineer’s daily progress report; horizontal — the design team coordinates with the procurement team.' },

  // ---------- Jan 2021 ----------
  'pc-jan-2021-4a': { topics: ['pc-writing'], ans: ['a-writing-business-messages'] },
  'pc-jan-2021-4b': { topics: ['pc-writing'], ans: ['a-writing-exec-summary'], extra: '8 + 10 marks: the **six** executive-summary points, then the **five-item** checklist (be realistic · be specific · be precise · be clear · be exact to the scope) under the line “State how project requirements will be met”.' },
  'pc-jan-2021-5': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-s1', 'a-ethics-s15', 'a-ethics-s10', 'a-ethics-s7', 'a-ethics-s8', 'a-ethics-s5', 'a-ethics-s11'],
    extra: '(i) all professional relations → **§1**; (ii) interchanging (the slide: exchanging) information and experience with engineers and students → **§15**; (iii) accepting compensation → **§10** (not §9, which is the compensation *principle* — the 18-batch solve put §9 here); (iv) confidential information → **§7**; (v) conflict of interest → **§8**; (vi) expressing opinion on an engineering subject → **§5**; (vii) competing with other engineers → **§11**. Five marks each: “According to Section N …” + the section as on the slide, then one line in your own words with an example.',
  },
  'pc-jan-2021-6a': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'], extra: 'List only (7 marks): one mark per C.' },
  'pc-jan-2021-6b': { topics: ['pc-7cs'], ans: ['a-7cs-completeness', 'a-7cs-consideration', 'a-7cs-concreteness'], extra: '“Main points only”: 10 marks completeness, 9 each consideration and concreteness.' },

  // ---------- 2017-18 ----------
  'pc-2017-18-6c': {
    topics: ['pc-comm'],
    ans: ['a-comm-nonverbal', 'a-comm-barriers', 'a-comm-abstracting-inferring'],
    notes: ['Printed “three main elements of verbal communication”. The slides only have the non-verbal three (appearance; body language; silence, time and space) — write those. The 18-batch solve answered it literally as verbal: body language 55 % (postures, gestures, eye contact), voice tonality 38 %, words 7 % — add that in one line.'],
  },
  'pc-2017-18-8a': { topics: ['pc-comm'], ans: ['a-comm-definition', 'a-comm-process', 'a-comm-importance'] },
  'pc-2017-18-8b': {
    topics: ['pc-writing'],
    ans: ['a-writing-proposal-def-supp', 'a-writing-proposal-chronology'],
    extra: 'Three parts for 18 marks: (1) **project proposal** = a written plan or presentation for completing a task; (2) the **seven** supplementary parts — maps, graphs, tables, charts; letter of support; letter of endorsement; references; forms; table of definition; **project schedules**; (3) the **eight-step** chronology, with the flow chart.',
  },

  // ---------- 2016-17 ----------
  'pc-2016-17-5a': { topics: ['pc-oral'], ans: ['a-oral-steps'] },
  'pc-2016-17-5b': { topics: ['pc-comm'], ans: ['a-comm-categories'] },
  'pc-2016-17-6a': { topics: ['pc-writing'], ans: ['a-writing-proposal-parts'] },
  'pc-2016-17-6b': { topics: ['pc-comm'], ans: ['a-comm-barriers', 'a-comm-abstracting-inferring', 'a-comm-nonverbal'] },

  // ---------- 2015-16 ----------
  'pc-2015-16-5a': { topics: ['pc-comm'], ans: ['a-comm-definition', 'a-comm-importance', 'a-comm-categories'] },
  'pc-2015-16-5b': { topics: ['pc-7cs'], ans: ['a-7cs-concepts'] },
  'pc-2015-16-6a': { topics: ['pc-writing'], ans: ['a-writing-report'], extra: 'The steps asked are for a **short** report: Introduction → Body or text → Terminal section, with the slide’s bullets under each (not the four long-report steps).', notes: ['“Why reports are important” is not on the slides; the six points are the 18-batch solve’s.'] },
  'pc-2015-16-6b': {
    topics: ['pc-ethics'],
    ans: ['a-ethics-compensation', 'a-ethics-s13', 'a-ethics-s15', 'a-ethics-s6', 'a-ethics-s2', 'a-ethics-s3'],
    extra: '(i) compensation principle → **§9**; (ii) not associate with → **§13**; (iii) cooperate with engineers and students → **§15**; (iv) when to undertake assignments → **§6**; (v) judgement overruled by non-technical authority → **§2** (clearly point out the consequences; notify the proper authority of any condition that endangers public health and safety); (vi) conduct to avoid → **§3**. Marks 5×3 + 1×2: begin each “According to Section N of the Code of Ethics for Engineers …” and give the section word for word.',
  },

  // ---------- 2014-15 ----------
  'pc-2014-15-5a': { topics: ['pc-comm'], ans: ['a-comm-categories'], extra: '“Types of business communication” = the three broad categories (the 18-batch solve answered it so): internal operational (horizontal, upward, downward), external operational (the four publics), interpersonal (the six features). 15 marks: definitions and the lists, without all ten external methods.' },
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
  'pc-2012-13-7b': { topics: ['pc-writing'], ans: ['a-writing-proposal-chronology'], extra: '15 marks: the **eight** slide steps in order, as a numbered list and a vertical flow chart.' },
  'pc-2012-13-8c': { topics: ['pc-comm'], ans: ['a-comm-abstracting-inferring', 'a-comm-denotation-connotation'] },

  // ---------- 2011-12 ----------
  'pc-2011-12-8': { topics: ['pc-comm'], ans: ['a-comm-categories'], extra: 'For 21 marks write everything on the slide: the three internal directions with their definitions, the four publics, the objective (warmth, understanding, positiveness), **all ten external methods**, and the **six interpersonal features**; one example per internal direction.' },
  'pc-2011-12-11c': { topics: ['pc-comm'], ans: ['a-comm-abstracting-inferring'] },
  'pc-2011-12-14a': {
    topics: ['pc-comm'],
    ans: ['a-comm-bypassing-slanting'],
    notes: ['Scan reads “Miscommunication instruction” and “Slender attitude” — i.e. miscommunicated instructions and sender’s attitude (2009-10 and 2010-11 ask the same pair), both from Kabirul sir’s barrier list.'],
  },
  'pc-2011-12-14b': { topics: ['pc-7cs'], ans: ['a-7cs-consideration', 'a-7cs-concreteness', 'a-7cs-correctness'] },
}
