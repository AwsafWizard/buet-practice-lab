import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnswerList } from '../components/AnswerList'
import { PC_ANSWERS } from '../content'
import { PC_BLOCK_LABEL, pcTopicById, type PcBlock } from '../registry'

export default function PcAnswerBank() {
  const [block, setBlock] = useState<PcBlock | 'all'>('all')
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    return () => clearTimeout(t)
  }, [hash])
  const list = PC_ANSWERS.filter((a) => block === 'all' || pcTopicById(a.topic)?.block === block)
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-1">Answer bank</h1>
      <p className="text-sm text-mute mb-4">Every model answer, most-asked first. Say it out loud before you open it, then tell it honestly whether you had it.</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(['all', 'IA', 'OIA', 'AAN'] as const).map((b) => (
          <button key={b} className={'btn !py-0.5 !px-2.5 !text-xs ' + (block === b ? '!border-accent text-accent' : '')} onClick={() => setBlock(b)}>
            {b === 'all' ? 'Everything' : PC_BLOCK_LABEL[b]}
          </button>
        ))}
      </div>
      <AnswerList answers={list} showTopic />
    </div>
  )
}
