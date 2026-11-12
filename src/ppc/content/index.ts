// Every topic file in this folder, gathered: lists, flashcards and model answers for the whole course.
import type { PcAnswer, PcCard, PcList, PcTopicContent, PcTopicId } from '../types'

const files = import.meta.glob<{ default: PcTopicContent }>(['./*.ts', './*.tsx', '!./index.ts', '!./*.test.*'], { eager: true })

export const PC_LISTS: PcList[] = []
export const PC_CARDS: PcCard[] = []
export const PC_ANSWERS: PcAnswer[] = []
for (const m of Object.values(files)) {
  if (!m.default) continue
  PC_LISTS.push(...m.default.lists)
  PC_CARDS.push(...m.default.cards)
  PC_ANSWERS.push(...m.default.answers)
}

const answerMap = new Map(PC_ANSWERS.map((a) => [a.id, a]))
const listMap = new Map(PC_LISTS.map((l) => [l.id, l]))
export const answerById = (id: string) => answerMap.get(id)
export const listById = (id: string) => listMap.get(id)

export const listsFor = (t: PcTopicId | string) => PC_LISTS.filter((l) => l.topic === t)
export const cardsFor = (t: PcTopicId | string) => PC_CARDS.filter((c) => c.topic === t)
export const answersFor = (t: PcTopicId | string) => PC_ANSWERS.filter((a) => a.topic === t)

/** a flashcard as the deck shows it: plain cards plus one per list */
export interface DeckCard {
  id: string
  topic: PcTopicId
  front: string
  back: string
  /** papers it was asked in */
  weight: number
  list?: PcList
  hook?: string
}

const listFront = (l: PcList) => l.ask ?? `Name the ${l.points.length} ${l.title.charAt(0).toLowerCase() + l.title.slice(1)}${l.ordered ? ' — in order' : ''}.`
const listBack = (l: PcList) => l.points.map((p, i) => `${i + 1}. **${p.k}**${p.d ? ' — ' + p.d : ''}`).join('\n')

export const PC_DECK: DeckCard[] = [
  ...PC_LISTS.map((l) => ({ id: 'k:' + l.id, topic: l.topic, front: listFront(l), back: listBack(l), weight: l.seen.length, list: l, hook: l.hook })),
  ...PC_CARDS.map((c) => ({ id: 'k:' + c.id, topic: c.topic, front: c.front, back: c.back, weight: c.seen?.length ?? 0 })),
]
export const deckFor = (t: PcTopicId | string) => PC_DECK.filter((c) => c.topic === t)
