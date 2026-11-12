import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Boundary } from '../../components/QuestionCard'
import { Ring, Tabs } from '../../components/ui'
import { useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { AnswerList } from '../components/AnswerList'
import { KeywordSheet, TopicLab } from '../components/LabPanel'
import { PcQuestionCard } from '../components/PcQuestionCard'
import { answersFor, deckFor, listsFor } from '../content'
import { pcQForTopic } from '../pyq'
import { PC_BLOCK_LABEL, pcTopicById } from '../registry'

type Tab = 'lab' | 'sheet' | 'answers' | 'pyq'

export default function PcTopicPage() {
  const { id = 'pc-law', tab = 'lab' } = useParams()
  const nav = useNavigate()
  const meta = pcTopicById(id)
  const cards = useStore((s) => s.cards)
  const deck = useMemo(() => deckFor(id), [id])
  const pyqs = useMemo(() => pcQForTopic(id), [id])
  const nLists = listsFor(id).length
  const nAns = answersFor(id).length
  if (!meta) return <div>Unknown topic</div>
  const known = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 4).length
  const seen = deck.filter((c) => cards[c.id]).length
  const setTab = (t: Tab) => nav(`/ce301/topic/${id}/${t}`)
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: `color-mix(in oklab, ${meta.color} 16%, transparent)` }}>
          <TopicIcon id={meta.id} color={meta.color} size={30} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ color: meta.color }}>
            {PC_BLOCK_LABEL[meta.block]}
          </div>
          <h1 className="text-2xl font-extrabold">{meta.title}</h1>
          <p className="text-sm text-mute">{meta.blurb}</p>
        </div>
        <div className="hidden cq-sm:flex items-center gap-3">
          <div className="text-right text-xs text-mute">
            <div>
              <span className="num text-ink font-semibold">{known}</span>/{deck.length} cards known
            </div>
            <div>
              <span className="num text-ink font-semibold">{seen}</span> seen at least once
            </div>
          </div>
          <Ring value={deck.length ? known / deck.length : 0} size={46} stroke={5} color={meta.color} label={deck.length ? `${Math.round((known / deck.length) * 100)}` : '–'} />
        </div>
      </div>
      <div className="mb-5 sticky top-14 z-10 py-2 -mx-1 px-1 bg-bg/85 backdrop-blur">
        <Tabs<Tab>
          value={tab as Tab}
          onChange={setTab}
          items={[
            { v: 'lab', label: '🧠 Lab' },
            { v: 'sheet', label: 'Keyword sheet', badge: <span className="chip !py-0 num">{nLists}</span> },
            { v: 'answers', label: 'Model answers', badge: <span className="chip !py-0 num">{nAns}</span> },
            { v: 'pyq', label: 'Past questions', badge: <span className="chip !py-0 num">{pyqs.length}</span> },
          ]}
        />
      </div>
      <Boundary label={tab}>
        {tab === 'lab' && <TopicLab topic={id} />}
        {tab === 'sheet' && <KeywordSheet topic={id} />}
        {tab === 'answers' && <AnswerList answers={answersFor(id)} />}
        {tab === 'pyq' && <PYQList topic={id} />}
      </Boundary>
    </div>
  )
}

function PYQList({ topic }: { topic: string }) {
  const all = useMemo(() => pcQForTopic(topic), [topic])
  const qStatus = useStore((s) => s.qStatus)
  const [filter, setFilter] = useState<'all' | 'todo' | 'review'>('all')
  useEffect(() => setFilter('all'), [topic])
  const list = all.filter((q) => (filter === 'todo' ? qStatus[q.id] !== 'solved' : filter === 'review' ? qStatus[q.id] === 'review' : true))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Newest first. Blurt each one before you open the answer.</span>
        {(
          [
            ['all', `All (${all.length})`],
            ['todo', 'Not known yet'],
            ['review', 'Marked for review'],
          ] as const
        ).map(([f, label]) => (
          <button key={f} className={'btn !py-0.5 !px-2.5 !text-xs ' + (filter === f ? '!border-accent text-accent' : '')} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>
      {list.map((q) => (
        <PcQuestionCard key={q.id} q={q} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here yet.</div>}
    </div>
  )
}
