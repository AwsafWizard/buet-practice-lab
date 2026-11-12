// The memorizing Lab: flashcards first, then keyword recall, put-in-order, cloze and blurt.

import { useMemo, useState } from 'react'
import { inline, Md } from '../../components/ui'
import { useStore } from '../../store'
import { answersFor, cardsFor, deckFor, listsFor, PC_ANSWERS, PC_DECK, PC_LISTS, type DeckCard } from '../content'
import { pcTopicById, PC_TOPICS } from '../registry'
import type { PcAnswer, PcList } from '../types'
import { BlurtBank } from './Blurt'
import { Cloze } from './Cloze'
import { Flashcards } from './Flashcards'
import { KeywordRecall } from './KeywordRecall'
import { OrderIt } from './OrderIt'

export type Drill = 'cards' | 'kw' | 'order' | 'cloze' | 'blurt'

const DRILLS: { v: Drill; label: string; icon: string; what: string }[] = [
  { v: 'cards', label: 'Flashcards', icon: '🃏', what: 'Think of the answer, flip, rate yourself. Misses come back sooner.' },
  { v: 'kw', label: 'Keyword recall', icon: '🔑', what: 'Type every point of a list from memory; the slots fill as you hit them.' },
  { v: 'order', label: 'Put in order', icon: '⇅', what: 'Flow charts and steps: tap them in the right order.' },
  { v: 'cloze', label: 'Fill the blanks', icon: '▢', what: 'A model answer with its keywords blanked out.' },
  { v: 'blurt', label: 'Blurt', icon: '✍', what: 'Write the whole answer against the exam clock, then see the keywords you hit.' },
]

const DRILL_KEY = 'ce301:drill'
const loadDrill = (): Drill => {
  try {
    const v = localStorage.getItem(DRILL_KEY)
    return (DRILLS.some((d) => d.v === v) ? v : 'cards') as Drill
  } catch {
    return 'cards'
  }
}

export function LabPanel({ deck, lists, answers, showTopic = false }: { deck: DeckCard[]; lists: PcList[]; answers: PcAnswer[]; showTopic?: boolean }) {
  const [drill, setDrillState] = useState<Drill>(loadDrill)
  const setDrill = (d: Drill) => {
    setDrillState(d)
    try {
      localStorage.setItem(DRILL_KEY, d)
    } catch {
      /* storage blocked */
    }
  }
  const states = useStore((s) => s.cards)
  const due = deck.filter((c) => !states[c.id] || states[c.id].due <= Date.now()).length
  const counts: Record<Drill, number> = {
    cards: due,
    kw: lists.length,
    order: lists.filter((l) => l.ordered).length,
    cloze: answers.length,
    blurt: answers.length,
  }
  const cur = DRILLS.find((d) => d.v === drill)!
  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5 mb-2" role="tablist">
        {DRILLS.map((d, i) => (
          <button
            key={d.v}
            role="tab"
            aria-selected={drill === d.v}
            onClick={() => setDrill(d.v)}
            className={'rounded-xl border px-2 py-2 text-center transition-colors ' + (drill === d.v ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-panel hover:border-accent/60')}
          >
            <div className="text-lg leading-none">{d.icon}</div>
            <div className="text-[11px] cq-md:text-[12px] font-semibold mt-1 leading-tight break-words">
              <span className="text-faint num mr-1 hidden cq-md:inline">{i + 1}</span>
              {d.label}
            </div>
            <div className="text-[10px] text-mute num">{d.v === 'cards' ? `${counts.cards} due` : counts[d.v]}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-mute mb-4">{cur.what}</p>
      {drill === 'cards' && <Flashcards pool={deck} showTopic={showTopic} />}
      {drill === 'kw' && <KeywordRecall lists={lists} showTopic={showTopic} />}
      {drill === 'order' && <OrderIt lists={lists} />}
      {drill === 'cloze' && <Cloze answers={answers} showTopic={showTopic} />}
      {drill === 'blurt' && <BlurtBank answers={answers} showTopic={showTopic} />}
    </div>
  )
}

export function TopicLab({ topic }: { topic: string }) {
  const deck = useMemo(() => deckFor(topic), [topic])
  const lists = useMemo(() => listsFor(topic), [topic])
  const answers = useMemo(() => answersFor(topic), [topic])
  return <LabPanel deck={deck} lists={lists} answers={answers} />
}

/** all topics, or one teacher's block, for the Memory gym */
export function GymLab({ scope }: { scope: string }) {
  const inScope = (t: string) => scope === 'all' || pcTopicById(t)?.block === scope || t === scope
  const deck = useMemo(() => PC_DECK.filter((c) => inScope(c.topic)), [scope]) // eslint-disable-line react-hooks/exhaustive-deps
  const lists = useMemo(() => PC_LISTS.filter((l) => inScope(l.topic)), [scope]) // eslint-disable-line react-hooks/exhaustive-deps
  const answers = useMemo(() => PC_ANSWERS.filter((a) => inScope(a.topic)), [scope]) // eslint-disable-line react-hooks/exhaustive-deps
  return <LabPanel deck={deck} lists={lists} answers={answers} showTopic />
}

/** the topic on one page: every list with its points and hook, then the flashcards as Q → A */
export function KeywordSheet({ topic }: { topic: string }) {
  const lists = useMemo(() => [...listsFor(topic)].sort((a, b) => b.seen.length - a.seen.length), [topic])
  const cards = useMemo(() => cardsFor(topic), [topic])
  const [hooks, setHooks] = useState(false)
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <span className="text-mute">
          {lists.length} lists and {cards.length} facts, most-asked first. Read it once, then go and drill it.
        </span>
        <button className={'btn !py-0.5 !px-2.5 !text-xs ml-auto ' + (hooks ? '!border-accent text-accent' : '')} onClick={() => setHooks(!hooks)}>
          💡 {hooks ? 'hide' : 'show'} memory hooks
        </button>
      </div>
      <div className="grid cq-lg:grid-cols-2 gap-3">
        {lists.map((l) => (
          <article key={l.id} className="card p-4">
            <div className="flex items-start gap-2">
              <h3 className="font-bold leading-snug flex-1">{l.title}</h3>
              {l.ordered && <span className="chip !text-[10px]">in order</span>}
            </div>
            <div className="text-[11px] text-faint mb-2">{l.seen.length ? `asked ${l.seen.length}× · ${l.seen.join(', ')}` : 'not asked yet'}</div>
            <ol className="text-sm space-y-0.5">
              {l.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="num text-faint text-xs w-4 shrink-0 pt-0.5">{i + 1}</span>
                  <span>
                    <b>{p.k}</b>
                    {p.d && <span className="text-mute"> — {p.d}</span>}
                  </span>
                </li>
              ))}
            </ol>
            {hooks && l.hook && <div className="text-sm text-accent2 mt-2">💡 {inline(l.hook)}</div>}
            {l.note && <div className="text-xs text-mute mt-2">ⓘ {l.note}</div>}
            <div className="text-[10px] text-faint mt-2">{l.src}</div>
          </article>
        ))}
      </div>
      {cards.length > 0 && (
        <>
          <h3 className="font-bold mt-6 mb-2">Facts and definitions</h3>
          <div className="card divide-y divide-line">
            {cards.map((c) => (
              <div key={c.id} className="grid cq-md:grid-cols-[1fr_1.4fr] gap-x-4 gap-y-1 p-3 text-sm">
                <div className="font-semibold">
                  <Md>{c.front}</Md>
                </div>
                <div className="text-mute">
                  <Md>{c.back}</Md>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const GYM_SCOPES = [
  { v: 'all', label: 'Everything' },
  { v: 'IA', label: 'IA sir' },
  { v: 'OIA', label: 'OIA Ma’am' },
  { v: 'AAN', label: 'AAN sir' },
  ...PC_TOPICS.map((t) => ({ v: t.id as string, label: t.short })),
]
