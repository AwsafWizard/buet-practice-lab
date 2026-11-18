import { Suspense, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTopicThreads } from '../../account/TopicThreads'
import { Boundary } from '../../components/QuestionCard'
import { Ring, Tabs } from '../../components/ui'
import { useStore } from '../../store'
import { TopicIcon } from '../../topics/icons'
import { AnswerList } from '../components/AnswerList'
import { KeywordSheet, TopicLab } from '../components/LabPanel'
import { EvQuestionCard } from '../components/EvQuestionCard'
import { answersFor, deckFor, listsFor } from '../content'
import { evQForTopic } from '../pyq'
import { EvTopicOverview } from './EvTopicOverview'
import { EV_LAB_TITLE, EV_LABS } from '../labs'
import { EV_BLOCK_LABEL, evTopicById } from '../registry'

type Tab = 'overview' | 'learn' | 'lab' | 'recall' | 'sheet' | 'pyq'

export default function EvTopicPage() {
  const { id = 'ev-wq', tab: rawTab = 'overview' } = useParams()
  // the old Threads tab is now part of the Overview
  const tab = (rawTab === 'threads' ? 'overview' : rawTab === 'answers' ? 'learn' : rawTab) as Tab
  const Lab = EV_LABS[id as keyof typeof EV_LABS]
  const nav = useNavigate()
  const meta = evTopicById(id)
  const cards = useStore((s) => s.cards)
  const deck = useMemo(() => deckFor(id), [id])
  const pyqs = useMemo(() => evQForTopic(id), [id])
  const nLists = listsFor(id).length
  const nAns = answersFor(id).length
  const threads = useTopicThreads(id)
  if (!meta) return <div>Unknown topic</div>
  const known = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 4).length
  const seen = deck.filter((c) => cards[c.id]).length
  const setTab = (t: Tab) => nav(`/ce331/topic/${id}/${t}`)
  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: `color-mix(in oklab, ${meta.color} 16%, transparent)` }}>
          <TopicIcon id={meta.id} color={meta.color} size={30} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold" style={{ color: meta.color }}>
            {EV_BLOCK_LABEL[meta.block]}
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
          value={tab}
          onChange={setTab}
          items={[
            // the Overview holds the admins' threads for this topic, like the other courses
            { v: 'overview', label: 'Overview', badge: threads.fresh ? <span className="chip !py-0 num !border-accent !text-accent">💬 {threads.fresh} new</span> : null },
            { v: 'learn', label: 'Learn', badge: <span className="chip !py-0 num">{nAns}</span> },
            ...(Lab ? [{ v: 'lab' as Tab, label: <span title={EV_LAB_TITLE[id as keyof typeof EV_LAB_TITLE]}>🧪 Lab</span> }] : []),
            { v: 'recall', label: '🪣 Recall' },
            { v: 'sheet', label: 'Keyword sheet', badge: <span className="chip !py-0 num">{nLists}</span> },
            { v: 'pyq', label: 'Past questions', badge: <span className="chip !py-0 num">{pyqs.length}</span> },
          ]}
        />
      </div>
      {threads.fresh > 0 && tab !== 'overview' && (
        <button className="w-full mb-4 card px-4 py-2.5 flex items-center gap-2 text-sm text-left border-accent/60 hover:border-accent" onClick={() => setTab('overview')}>
          💬 <b>{threads.fresh} new</b> from the admins for this topic
          <span className="ml-auto text-accent">Open →</span>
        </button>
      )}
      <Boundary label={tab}>
        {tab === 'overview' && <EvTopicOverview topic={id} go={(t) => setTab(t === 'lab' ? 'recall' : t === 'answers' ? 'learn' : t)} />}
        {tab === 'learn' && <AnswerList answers={answersFor(id)} />}
        {tab === 'lab' &&
          (Lab ? (
            <Suspense fallback={<div className="text-mute p-6">Loading the lab…</div>}>
              <Lab />
            </Suspense>
          ) : (
            <div className="text-mute text-sm">This topic is all recall, so it has no lab: use the Recall tab.</div>
          ))}
        {tab === 'recall' && <TopicLab topic={id} />}
        {tab === 'sheet' && <KeywordSheet topic={id} />}
        {tab === 'pyq' && <PYQList topic={id} />}
      </Boundary>
    </div>
  )
}

function PYQList({ topic }: { topic: string }) {
  const all = useMemo(() => evQForTopic(topic), [topic])
  const qStatus = useStore((s) => s.qStatus)
  const [filter, setFilter] = useState<'all' | 'todo' | 'review'>('all')
  useEffect(() => setFilter('all'), [topic])
  const list = all.filter((q) => (filter === 'todo' ? qStatus[q.id] !== 'solved' : filter === 'review' ? qStatus[q.id] === 'review' : true))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mute">Newest first. Solve the numbers on paper and blurt the theory before you open the answer.</span>
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
        <EvQuestionCard key={q.id} q={q} />
      ))}
      {!list.length && <div className="text-mute text-sm">Nothing here yet.</div>}
    </div>
  )
}
