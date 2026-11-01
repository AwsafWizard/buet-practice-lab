import { useEffect, useState } from 'react'
import { Section } from '../../components/ui'
import { TheoryList } from '../components/TheoryList'
import { RC_TOPICS } from '../registry'
import { RC_MODULES } from '../topics/modules'
import type { RcTheoryItem } from '../types'

/** every topic's theory questions in one drill, most-asked first */
export default function RcTheoryBank() {
  const [items, setItems] = useState<RcTheoryItem[] | null>(null)
  const [topic, setTopic] = useState<string>('all')
  useEffect(() => {
    Promise.all(RC_TOPICS.map((t) => RC_MODULES[t.id]().then((m) => m.theory))).then((all) => setItems(all.flat()))
  }, [])
  const shown = items?.filter((it) => topic === 'all' || it.topic === topic) ?? []
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Theory bank</h1>
      <p className="text-sm text-mute mb-4">
        About 28% of CE 315 marks are theory, and the same questions come back paper after paper. Think of the answer, open the model answer, then mark whether you had it.
      </p>
      <div className="flex flex-wrap gap-1 mb-4">
        <button className={'btn !py-0.5 !px-2.5 !text-xs ' + (topic === 'all' ? '!border-accent text-accent' : '')} onClick={() => setTopic('all')}>
          All topics
        </button>
        {RC_TOPICS.map((t) => (
          <button key={t.id} className={'btn !py-0.5 !px-2.5 !text-xs ' + (topic === t.id ? '!border-accent text-accent' : '')} onClick={() => setTopic(t.id)}>
            {t.short}
          </button>
        ))}
      </div>
      <Section title={topic === 'all' ? 'All theory questions' : RC_TOPICS.find((t) => t.id === topic)?.title}>
        {items ? <TheoryList items={shown} showTopic={topic === 'all'} /> : <div className="text-mute">Loading…</div>}
      </Section>
    </div>
  )
}
