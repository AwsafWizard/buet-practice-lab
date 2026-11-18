// Every topic file in this folder, gathered: lists, flashcards and model answers for the whole course.
import type { EvAnswer, EvCard, EvList, EvTopicContent, EvTopicId } from '../types'

const files = import.meta.glob<{ default: EvTopicContent }>(['./*.ts', './*.tsx', '!./index.ts', '!./*.test.*'], { eager: true })

export const EV_LISTS: EvList[] = []
export const EV_CARDS: EvCard[] = []
export const EV_ANSWERS: EvAnswer[] = []
for (const m of Object.values(files)) {
  if (!m.default) continue
  EV_LISTS.push(...m.default.lists)
  EV_CARDS.push(...m.default.cards)
  EV_ANSWERS.push(...m.default.answers)
}

const answerMap = new Map(EV_ANSWERS.map((a) => [a.id, a]))
const listMap = new Map(EV_LISTS.map((l) => [l.id, l]))
export const answerById = (id: string) => answerMap.get(id)
export const listById = (id: string) => listMap.get(id)

export const listsFor = (t: EvTopicId | string) => EV_LISTS.filter((l) => l.topic === t)
export const cardsFor = (t: EvTopicId | string) => EV_CARDS.filter((c) => c.topic === t)
export const answersFor = (t: EvTopicId | string) => EV_ANSWERS.filter((a) => a.topic === t)

/** a flashcard as the deck shows it: plain cards plus one per list */
export interface DeckCard {
  id: string
  topic: EvTopicId
  front: string
  back: string
  /** papers it was asked in */
  weight: number
  list?: EvList
  hook?: string
}

const listFront = (l: EvList) => l.ask ?? `Name the ${l.points.length} ${l.title.charAt(0).toLowerCase() + l.title.slice(1)}${l.ordered ? ' — in order' : ''}.`
const listBack = (l: EvList) => l.points.map((p, i) => `${i + 1}. **${p.k}**${p.d ? ' — ' + p.d : ''}`).join('\n')

export const EV_DECK: DeckCard[] = [
  ...EV_LISTS.map((l) => ({ id: 'ev:' + l.id, topic: l.topic, front: listFront(l), back: listBack(l), weight: l.seen.length, list: l, hook: l.hook })),
  ...EV_CARDS.map((c) => ({ id: 'ev:' + c.id, topic: c.topic, front: c.front, back: c.back, weight: c.seen?.length ?? 0 })),
]
export const deckFor = (t: EvTopicId | string) => EV_DECK.filter((c) => c.topic === t)
