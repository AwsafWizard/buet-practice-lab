import type { PcTopicId } from '../store'

export type PcBlock = 'IA' | 'OIA' | 'AAN'

export interface PcTopicMeta {
  id: PcTopicId
  title: string
  short: string
  block: PcBlock
  blurb: string
  hours: number
  /** CSS colour (a theme variable, so it reads in Dracula and Alucard alike) */
  color: string
}

const IA = 'var(--c-ia)'
const OIA = 'var(--c-oia)'
const AAN = 'var(--c-aan)'

export const PC_TOPICS: PcTopicMeta[] = [
  { id: 'pc-law', title: 'Act, Rules & the Procurement Plan', short: 'Act vs Regulation', block: 'IA', blurb: 'Act vs Regulation, PPA 2006 and PPR 2008, who they apply to, the procurement plan and its columns, transparency.', hours: 1.5, color: IA },
  { id: 'pc-methods', title: 'Tendering Methods', short: 'Tendering methods', block: 'IA', blurb: 'OTM, LTM, DPM, two-stage, one-stage two-envelope, RFQ; when each applies; why OTM is preferred; NCT, ICT and e-GP.', hours: 1.5, color: IA },
  { id: 'pc-process', title: 'Tender Process & Evaluation', short: 'Tender process', block: 'IA', blurb: 'The flow chart from plan to contract, evaluation step by step, arithmetic correction, post-qualification, NOA, forfeiture, JV.', hours: 2, color: IA },
  { id: 'pc-docs', title: 'Tender Documents & TDS', short: 'Tender docs & TDS', block: 'IA', blurb: 'Sections of a tender document, documents forming the contract in order, the Tender Data Sheet numbers, accompaniments.', hours: 2, color: IA },
  { id: 'pc-gcc', title: 'GCC, PCC & FIDIC', short: 'GCC / PCC / FIDIC', block: 'IA', blurb: 'How PCC completes the GCC clause by clause: time, LD, compensation events, retention, variation, payment, disputes; FIDIC books.', hours: 2, color: IA },
  { id: 'pc-spec', title: 'Specifications & BoQ', short: 'Specs & BoQ', block: 'IA', blurb: 'Why specifications matter, attributes, writing one (material, workmanship, testing, measurement, payment), the BoQ format.', hours: 1.5, color: IA },
  { id: 'pc-services', title: 'Intellectual Services & QCBS', short: 'Services & QCBS', block: 'IA', blurb: 'QCBS, QBS, FBS, LCS, SFB, SSS and individual consultants; selection steps, EoI notice, the QCBS score sheet.', hours: 2, color: IA },
  { id: 'pc-ce', title: 'The Civil Engineer', short: 'Civil engineer', block: 'OIA', blurb: 'The ASCE Body of Knowledge definition word for word, attributes of the profession, outcomes of education, ancient systems.', hours: 1, color: OIA },
  { id: 'pc-project', title: 'Project, Life Cycle & Pre-design', short: 'Project & pre-design', block: 'OIA', blurb: 'Project definition and characteristics, life cycle, scope–schedule–budget, flow of work, participants, the brief and client concerns.', hours: 2, color: OIA },
  { id: 'pc-contract', title: 'Contracts & Project Delivery', short: 'Contracts & delivery', block: 'OIA', blurb: 'Elements of a binding contract, contract formats, delivery systems (DBB, DB, CM…), procurement methods, think-twice clauses.', hours: 2, color: OIA },
  { id: 'pc-risk', title: 'Risk, Insurance & Bonds', short: 'Risk, insurance, bonds', block: 'OIA', blurb: 'Dealing with contract risk, professional liability insurance and its concerns, other insurance, bonds and surety, fiduciary risk.', hours: 2, color: OIA },
  { id: 'pc-comm', title: 'Communication Process & Miscommunication', short: 'Communication basics', block: 'AAN', blurb: 'Definition, the human communication process, organisational communication, non-verbal elements, bypassing, abstracting, inferring.', hours: 1.5, color: AAN },
  { id: 'pc-7cs', title: 'The Seven C’s', short: 'Seven C’s', block: 'AAN', blurb: 'Completeness, conciseness, consideration, concreteness, clarity, courtesy, correctness — each with its guidelines and examples.', hours: 1.5, color: AAN },
  { id: 'pc-writing', title: 'Reports, Abstracts & Proposals', short: 'Reports & proposals', block: 'AAN', blurb: 'Reports and their steps, short-report formats, abstracts and slanted abstracts, business proposal parts, business messages.', hours: 1.5, color: AAN },
  { id: 'pc-oral', title: 'Presentations & Meetings', short: 'Presentations & meetings', block: 'AAN', blurb: 'Steps for an effective oral presentation, planning and running a meeting, leadership styles and which works best.', hours: 1, color: AAN },
  { id: 'pc-ethics', title: 'Code of Ethics', short: 'Code of ethics', block: 'AAN', blurb: 'Fundamental principles, the numbered sections of the code, conflict of interest, confidentiality, duties to peers.', hours: 1.5, color: AAN },
]

export const pcTopicById = (id: string) => PC_TOPICS.find((t) => t.id === id)

export const PC_BLOCK_LABEL: Record<PcBlock, string> = {
  IA: 'IA sir — procurement',
  OIA: 'OIA Ma’am — project & legal',
  AAN: 'AAN sir — communication & ethics',
}
