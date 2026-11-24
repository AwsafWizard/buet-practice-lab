// Every course's topics as Thread tags: a thread tagged 'pc-law' also shows on the Act vs Regulation page.
import { EV_BLOCK_LABEL, EV_TOPICS } from '../env/registry'
import { SV_GROUP_LABEL, SV_TOPICS } from '../sv/registry'
import { PC_BLOCK_LABEL, PC_TOPICS } from '../ppc/registry'
import { RC_SECTION_LABEL, RC_TOPICS } from '../rc/registry'
import { SM_SECTION_LABEL, SM_TOPICS } from '../soil/registry'
import { SECTION_LABEL, TOPICS } from '../topics/registry'
import type { Course, ThreadCourse } from './api'

export interface TagTopic {
  id: string
  short: string
  title: string
  /** usable on any course's page (CE 301's theme variables fall back to the page accent elsewhere) */
  color: string
  course: Course
  group: string
}

const safe = (c: string) => (c.startsWith('var(') && !c.includes(',') ? c.replace(/\)$/, ', var(--c-accent))') : c)

export const TOPIC_TAGS: TagTopic[] = [
  ...SV_TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: safe(t.color), course: 'ce104' as const, group: SV_GROUP_LABEL[t.group] })),
  ...EV_TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: safe(t.color), course: 'ce331' as const, group: EV_BLOCK_LABEL[t.block] })),
  ...PC_TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: safe(t.color), course: 'ce301' as const, group: PC_BLOCK_LABEL[t.block] })),
  ...SM_TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: t.color, course: 'ce341' as const, group: SM_SECTION_LABEL[t.section] })),
  ...RC_TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: t.color, course: 'ce315' as const, group: RC_SECTION_LABEL[t.section] })),
  ...TOPICS.map((t) => ({ id: t.id, short: t.short, title: t.title, color: t.color, course: 'ce311' as const, group: SECTION_LABEL[t.section] })),
]

const BY_ID = new Map(TOPIC_TAGS.map((t) => [t.id, t]))
export const topicTag = (id: string) => BY_ID.get(id)

/** the topics an admin can tag a thread of this course with ("All courses" = every topic) */
export const tagsFor = (c: ThreadCourse) => (c === 'all' ? TOPIC_TAGS : TOPIC_TAGS.filter((t) => t.course === c))

/** the topic's page; its first tab is where its threads show */
export const topicPath = (t: TagTopic) => (t.course === 'ce311' ? `/topic/${t.id}` : `/${t.course}/topic/${t.id}`)
