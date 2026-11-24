// All CE 104 content: one file per topic (questions, viva cards, Learn tab).
import type { SvTopicId } from '../../store'
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

type Mod = { content: SvTopicContent; learn: SvLearn }
const mods = import.meta.glob<Mod>(['./*.ts', '!./index.ts', '!./ids.ts', '!./*.test.ts'], { eager: true })

const FILE_TOPIC: Record<string, SvTopicId> = {
  inst: 'sv-inst',
  chain: 'sv-chain',
  comp: 'sv-compass',
  lvl: 'sv-level',
  cont: 'sv-contour',
  mod: 'sv-modern',
  trav: 'sv-traverse',
  stad: 'sv-stadia',
  ht: 'sv-height',
  curve: 'sv-curve',
  house: 'sv-house',
  route: 'sv-route',
}

export const SV_LEARN: Partial<Record<SvTopicId, SvLearn>> = {}
export const SV_QUESTIONS: SvQuestion[] = []
export const SV_CARDS: SvCard[] = []

for (const [path, m] of Object.entries(mods)) {
  const name = path.slice(2, -3)
  const topic = FILE_TOPIC[name]
  if (!topic || !m.content) continue
  SV_QUESTIONS.push(...m.content.questions)
  SV_CARDS.push(...m.content.cards)
  if (m.learn) SV_LEARN[topic] = m.learn
}

export const questionsFor = (t: string) => SV_QUESTIONS.filter((q) => q.topic === t)
export const cardsFor = (t: string) => SV_CARDS.filter((c) => c.topic === t)

/** the instruments-quiz pool: the instruments topic, compass, modern instruments, and anything tagged `inst` */
export const INST_POOL = () => SV_QUESTIONS.filter((q) => q.inst || q.topic === 'sv-inst' || q.topic === 'sv-compass')

/** attempt key for a question (topic-prefixed so per-topic stats work) */
export const qKey = (q: Pick<SvQuestion, 'topic' | 'id'>) => `${q.topic}:mcq:${q.id}`
/** flashcard id in the shared `cards` store */
export const cardKey = (c: Pick<SvCard, 'id'>) => 'sv:' + c.id
