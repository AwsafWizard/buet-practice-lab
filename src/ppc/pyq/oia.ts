// OIA Ma'am block (Dr. Tanvir Manzur's slides: civil engineer, project, contracts, risk/insurance/bonds) —
// how each past-paper part is answered. Part ids and wording: ./skeleton.ts; owners: CE301/Claude digests/part_owners.md.
import type { PcPartMap } from '../types'

const CE = 'pc-ce' as const
const PR = 'pc-project' as const
const CT = 'pc-contract' as const
const RK = 'pc-risk' as const

const define: PcPartMap = { topics: [CE], ans: ['a-ce-define'] }
const attributes: PcPartMap = { topics: [CE], ans: ['a-ce-attributes'] }
const attributes15: PcPartMap = {
  topics: [CE],
  ans: ['a-ce-attributes'],
  extra: `### Background (15 marks — open with it)
- Until modern times there was no clear distinction between civil engineering & architecture.
- The origin of civil engineering is found immediately preceding the Industrial Revolution, the late 18th & early 19th centuries; during that period certain military engineers began to work on nonmilitary, or civil, projects, and the term **civil engineer** was adopted to emphasize this difference.
- In response to the growth of new civil projects the professional bodies were formed: **ICE** (Britain) chartered in 1818, **ASCE** founded in 1852, ICEI (India) 1860, AICCP (Spain) and SAICE (South Africa) 1903, JSCE (Japan) 1914, CICE (China) 1936. These organizations helped to formalize civil engineering as a profession.

Then the five attributes with the slide’s points under each.`,
}
const defineAttr: PcPartMap = { topics: [CE], ans: ['a-ce-define', 'a-ce-attributes'] }
const thinkTwice: PcPartMap = { topics: [CT], ans: ['a-ct-think-twice'] }
const thinkTwiceNames: PcPartMap = {
  topics: [CT],
  ans: ['a-ct-think-twice'],
  extra: 'Names only are asked: write the 15 clause names as a numbered list (the slide order is alphabetical — five C’s, then D-E-F, I-J, L-M, O, R-R).',
}
const characteristics: PcPartMap = { topics: [PR], ans: ['a-pr-characteristics'] }
const brief: PcPartMap = { topics: [PR], ans: ['a-pr-brief'] }
const concerns: PcPartMap = { topics: [PR], ans: ['a-pr-client-concerns'] }
const contractRisk: PcPartMap = { topics: [RK], ans: ['a-rk-contract-risk'] }
const pliConcerns: PcPartMap = { topics: [RK], ans: ['a-rk-pli-concerns'] }
const pliConcernNames: PcPartMap = {
  topics: [RK],
  ans: ['a-rk-pli-concerns'],
  extra: 'Names only: policy limits, deductible, cost, insurability, subconsultants, joint ventures, project professional liability insurance, expanded project delivery, claims.',
}
const fiduciary: PcPartMap = { topics: [RK], ans: ['a-rk-fiduciary'] }
const surety: PcPartMap = { topics: [RK], ans: ['a-rk-surety'] }
const triple: PcPartMap = { topics: [CT], ans: ['a-ct-triple'] }
const flow: PcPartMap = { topics: [PR], ans: ['a-pr-flow'] }
const formats: PcPartMap = { topics: [CT], ans: ['a-ct-formats'] }

export const OIA_MAP: Record<string, PcPartMap> = {
  // ---------- May 2024 (printed 2021-2022, second paper) ----------
  'pc-may-2024-1a': define,
  'pc-may-2024-1b': { topics: [PR], ans: ['a-pr-measures'] },
  'pc-may-2024-1c': brief,
  'pc-may-2024-1d': thinkTwice,
  'pc-may-2024-2a': { topics: [CT], ans: ['a-ct-dbb-db'] },
  'pc-may-2024-2b': triple,
  'pc-may-2024-2c': pliConcerns,
  'pc-may-2024-2d': { topics: [RK], ans: ['a-rk-gli-epli'] },
  'pc-may-2024-2e': fiduciary,
  'pc-may-2024-3a': { topics: [PR], ans: ['a-pr-triangle'] },
  'pc-may-2024-3b': contractRisk,
  'pc-may-2024-3c': { topics: [PR], ans: ['a-pr-aec'] },
  'pc-may-2024-3d': concerns,
  'pc-may-2024-3e': {
    topics: [RK],
    ans: ['a-rk-bonds'],
    extra: 'Only bid bond and performance bond are asked (5 marks): open with the bond definition (surety, principal, obligee — a three-party relationship), then the two bonds; skip the payment bond.',
  },

  // ---------- 2021-22 ----------
  'pc-2021-22-1a': formats,
  'pc-2021-22-1b': {
    topics: [CT],
    ans: ['a-ct-triple', 'a-ct-pricing'],
    extra: `For 16 marks add one line per delivery system:
- **DBB** — design complete, then contractors bid, client contracts the winning builder; designer and contractor have no contract.
- **Multiple Prime** — several prime contractors instead of one GC; no GC fee, but the client coordinates.
- **CM at Risk** — CM helps manage design, then builds; early guaranteed cost.
- **Agency CM** — CM is the client’s consultant and does not build.
- **DB** — one entity designs and builds.
- **Design-Assist** — contractor hired as consultant during DBB design.

"Contract types for payment" = the contract formats: lump sum, cost plus a fixed fee, GMP, target, unit price.`,
  },
  'pc-2021-22-1c': characteristics,
  'pc-2021-22-1d': {
    topics: [CE],
    ans: ['a-ce-ancient'],
    extra: 'Three marks — names are enough: **corbel; post & lintel; arch & vault; truss**.',
  },
  'pc-2021-22-2a': attributes15,
  'pc-2021-22-2b': surety,
  'pc-2021-22-2c': contractRisk,
  'pc-2021-22-2d': define,
  'pc-2021-22-3a': { topics: [PR], ans: ['a-pr-client-concerns', 'a-pr-success', 'a-pr-brief'] },

  // ---------- 2020-21 ----------
  'pc-2020-21-5a': define,
  'pc-2020-21-5b': { topics: [PR], ans: ['a-pr-define'] },
  'pc-2020-21-5c': characteristics,
  'pc-2020-21-5d': { topics: [PR], ans: ['a-pr-participants'] },
  'pc-2020-21-5e': { topics: [CT], ans: ['a-ct-elements'] },
  'pc-2020-21-6a': formats,
  'pc-2020-21-6b': thinkTwice,
  'pc-2020-21-6c': pliConcerns,
  'pc-2020-21-6d': fiduciary,
  'pc-2020-21-7a': brief,
  'pc-2020-21-7d': surety,

  // ---------- Jan 2021 ----------
  'pc-jan-2021-7a': { topics: [CT], ans: ['a-ct-categories', 'a-ct-elements'] },
  'pc-jan-2021-7b': { topics: [CT], ans: ['a-ct-procurement'] },
  'pc-jan-2021-8a': fiduciary,
  'pc-jan-2021-8b': {
    topics: [PR],
    ans: ['a-pr-participants'],
    extra: `### Major parties — roles (18-batch solve)
1. **Owner** — sets operational criteria for details of the work to be done or scope of work.
2. **Designer** — does the detailed designs, drawings and specifications for the project.
3. **Builder/Contractor** — does all work in accordance with contract documents; furnishes labour, equipment and material; prepares budget and status reports for the owner; develops the project quality report for the engineer and owner; develops budget and schedule control.

### Components of a project management plan (18-batch solve)
1. General project information
2. Major client, stakeholder and general information
3. Organizational structure (key disciplines, team members)
4. Scope of work and work plan
5. Project schedule
6. Project budget
7. Communication plan
8. Health and safety plan
9. Project quality plan`,
    flag: 'The project management plan is not in this term’s OIA slides; the 18-batch solver himself marked it out of syllabus (“lecture slides of batch ’17 and ’18 are not exactly the same”).',
    notes: ['"Major parties" — the 18-batch solve writes Owner, Designer and Builder/Contractor with their roles; the four groups below back it up.'],
  },

  // ---------- 2015-16 ----------
  'pc-2015-16-4a': define,
  'pc-2015-16-4b': {
    topics: [CE],
    ans: ['a-ce-outcomes'],
    extra: 'Five marks, professional category only: any five of communication, public policy, business & public administration, globalization, leadership, teamwork, attitudes, lifelong learning, professional & ethical responsibilities (the 18-batch solve simply lists all nine).',
  },
  'pc-2015-16-4c': attributes,
  'pc-2015-16-4d': contractRisk,
  'pc-2015-16-4e': { topics: [RK], ans: ['a-rk-elements'] },
  'pc-2015-16-7a': { topics: [PR], ans: ['a-pr-define', 'a-pr-measures', 'a-pr-flow'] },
  'pc-2015-16-7b': {
    topics: [CT, PR],
    ans: ['a-ct-think-twice', 'a-pr-participants'],
    extra: `### Four groups — names of professionals/organisations
1. **Client (owner)** — private owners, developers, government agencies.
2. **Engineer and/or architect** — engineers, architects, other designers.
3. **Contractor** — builders, product & material suppliers.
4. **Fourth group** — legislative and statutory bodies; regulatory and permitting agencies; licensing organizations and professional societies; the public and special interest groups.`,
  },
  'pc-2015-16-8a': { topics: [CT, RK], ans: ['a-ct-triple', 'a-rk-pli-concerns'] },
  'pc-2015-16-8b': { topics: [RK, CT], ans: ['a-rk-bonds', 'a-rk-fiduciary', 'a-ct-model', 'a-ct-dbb'] },

  // ---------- 2014-15 ----------
  'pc-2014-15-4a': defineAttr,
  'pc-2014-15-4b': thinkTwiceNames,
  'pc-2014-15-4c': { topics: [CT], ans: ['a-ct-conventional', 'a-ct-multiple-contracts', 'a-ct-negotiated', 'a-ct-model'] },
  'pc-2014-15-6a': { topics: [PR], ans: ['a-pr-define', 'a-pr-triangle', 'a-pr-characteristics'] },
  'pc-2014-15-7a': {
    topics: [RK],
    ans: ['a-rk-defs', 'a-rk-players', 'a-rk-pli-concerns'],
    extra: 'The concerns are asked as names only (5 marks).',
  },
  'pc-2014-15-7b': { topics: [PR], ans: ['a-pr-participants', 'a-pr-flow'] },

  // ---------- 2013-14 ----------
  'pc-2013-14-5a': { topics: [CT], ans: ['a-ct-pds'] },
  'pc-2013-14-5b': thinkTwiceNames,
  'pc-2013-14-5c': { topics: [PR], ans: ['a-pr-participants'] },
  'pc-2013-14-6a': contractRisk,
  'pc-2013-14-6b': pliConcernNames,
  'pc-2013-14-6c': defineAttr,
  'pc-2013-14-6d': { topics: [PR], ans: ['a-pr-triangle'] },
  'pc-2013-14-8b': {
    topics: [RK, PR],
    ans: ['a-rk-bonds', 'a-rk-players', 'a-pr-measures', 'a-rk-fiduciary'],
  },

  // ---------- 2012-13 ----------
  'pc-2012-13-5a': { topics: [RK], ans: ['a-rk-elements'] },
  'pc-2012-13-5b': {
    topics: [CT],
    ans: ['a-ct-think-twice', 'a-ct-procurement'],
    extra: 'Names only for the clauses (7 marks). Procurement methods (3 marks): sole source; limited competition — negotiation; qualifications-based selection; best value selection; fee-based selection.',
  },
  'pc-2012-13-5c': {
    topics: [RK, CT],
    ans: ['a-ct-dbb', 'a-rk-deductible', 'a-rk-project-pli', 'a-rk-gli-epli', 'a-rk-fiduciary'],
    extra: 'Part (iv) asks only general liability insurance — skip the employment practices half.',
  },
  'pc-2012-13-6a': flow,
  'pc-2012-13-6b': { topics: [PR], ans: ['a-pr-predesign'] },
  'pc-2012-13-6c': { topics: [PR], ans: ['a-pr-qcp', 'a-pr-characteristics'] },
  'pc-2012-13-6d': {
    topics: [RK],
    ans: ['a-rk-players', 'a-rk-bonds'],
    extra: 'From the players, write only **actuaries** (compute the odds a risk will materialize and its probable cost) and **underwriters** (evaluate each applicant and decide the premium). Then the bond definition, bid bond and performance bond.',
  },
  'pc-2012-13-8a': defineAttr,
  'pc-2012-13-8b': {
    topics: [CT],
    ans: ['a-ct-triple', 'a-ct-formats'],
    notes: ['"Contract formats" here most likely means the pricing formats of the delivery table (lump sum, cost plus, GMP, target, unit price); the seven commonly used formats are added in case the examiner meant those.'],
  },

  // ---------- 2011-12 ----------
  'pc-2011-12-9a': { topics: [CE], ans: ['a-ce-define', 'a-ce-outcomes'] },
  'pc-2011-12-9b': attributes,
  'pc-2011-12-10a': {
    topics: [PR],
    ans: ['a-pr-define', 'a-pr-triangle', 'a-pr-lifecycle', 'a-pr-flow'],
    notes: ['"Show graphically various stages of a construction project" — draw the flow of work (predesign → decommission, with SD/DD/CD); the life-cycle activity curve is a good addition.'],
  },
  'pc-2011-12-10b': { topics: [PR], ans: ['a-pr-lifecycle-manage'] },
  'pc-2011-12-11a': flow,
  'pc-2011-12-11b': { topics: [PR], ans: ['a-pr-predesign-pad'] },
  'pc-2011-12-12a': { topics: [CT], ans: ['a-ct-formation'] },
  'pc-2011-12-12b': { topics: [CT], ans: ['a-ct-conventional', 'a-ct-multiple-contracts', 'a-ct-model', 'a-ct-interpretation'] },
  'pc-2011-12-13a': {
    topics: [RK],
    ans: ['a-rk-defs', 'a-rk-players'],
    extra: 'Only the professional liability insurance definition is needed from the definitions; from the players write insureds, insurers, actuaries, underwriters and reinsurers.',
  },
  'pc-2011-12-13b': { topics: [RK], ans: ['a-rk-gli-epli', 'a-rk-bonds', 'a-rk-contract-risk', 'a-rk-fiduciary'] },

  // ---------- 2016-17 ----------
  'pc-2016-17-4a': define,
  'pc-2016-17-4b': attributes,
  'pc-2016-17-4c': characteristics,
  'pc-2016-17-4d': thinkTwice,
  'pc-2016-17-7a': { topics: [PR, CT], ans: ['a-pr-define', 'a-pr-triangle', 'a-ct-elements'] },
  'pc-2016-17-7b': {
    topics: [PR, CT],
    ans: ['a-pr-flow', 'a-ct-pricing'],
    notes: ['"Contract format in project delivery" = the pricing formats of the clients’ acquisition strategy (lump sum, cost plus a fixed fee, GMP, target, unit price).'],
  },
  'pc-2016-17-8a': {
    topics: [RK, CT],
    ans: ['a-rk-gli-epli', 'a-rk-fiduciary', 'a-rk-bonds', 'a-ct-mp'],
    extra: 'From the bonds answer write only the **bid bond** (part iv).',
  },
  'pc-2016-17-8b': { topics: [RK], ans: ['a-rk-contract-risk', 'a-rk-pli-concerns'] },

  // ---------- 2017-18 ----------
  'pc-2017-18-5a': define,
  'pc-2017-18-5b': { topics: [CE], ans: ['a-ce-ancient'] },
  'pc-2017-18-5c': { topics: [PR], ans: ['a-pr-define', 'a-pr-triangle'] },
  'pc-2017-18-5d': flow,
  'pc-2017-18-6a': { topics: [PR], ans: ['a-pr-cd-emphasis'] },
  'pc-2017-18-6b': { topics: [PR], ans: ['a-pr-qcp'] },
  'pc-2017-18-6d': concerns,
  'pc-2017-18-7a': {
    topics: [CT],
    ans: ['a-ct-pds'],
    notes: ['"6 types of contract systems in project delivery" = the six project delivery systems (DBB, DB, Design-Assist, Multiple Prime, Agency CM, CM at Risk).'],
  },
  'pc-2017-18-7b': surety,
  'pc-2017-18-7c': { topics: [RK, PR], ans: ['a-rk-gli-epli', 'a-rk-fiduciary', 'a-pr-characteristics'], extra: 'Part (i) asks only general liability insurance.' },

  // ---------- 2023-24 ----------
  'pc-2023-24-3b': triple,
  'pc-2023-24-3c': fiduciary,
  'pc-2023-24-4a': {
    topics: [RK],
    ans: ['a-rk-contract-risk', 'a-rk-general'],
    notes: [
      '"General guidelines in dealing with contract risk" — lead with the slide’s eight ways (Dealing with Contract Risk); the "dealing with risk in general" points can follow if time allows.',
      'This term’s new deck adds "Key Principles of Contract Risk Management" (seven principles, from equitable risk allocation to tiered dispute resolution). If the question says "principles", write those — see the model answer "What are the key principles of contract risk management?" in the Risk topic.',
    ],
  },
  'pc-2023-24-4b': pliConcernNames,
  'pc-2023-24-4c': surety,
  'pc-2023-24-4d': thinkTwiceNames,
  'pc-2023-24-8a': define,
  'pc-2023-24-8b': attributes15,
  'pc-2023-24-8c': concerns,
  'pc-2023-24-8d': brief,
}
