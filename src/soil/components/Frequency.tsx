// Questions per paper for a CE 341 topic: small bar chart for topic overviews.
import { useMemo } from 'react'
import { SM_ALL } from '../pyq'
import { SM_PAPERS } from '../types'

export function SmFrequency({ topic }: { topic: string }) {
  const data = useMemo(() => [...SM_PAPERS].reverse().map((p) => ({ p: p.label, n: SM_ALL.filter((q) => q.paper === p.id && q.topics.includes(topic as never)).length })), [topic])
  const max = Math.max(1, ...data.map((d) => d.n))
  const total = data.reduce((s, d) => s + d.n, 0)
  return (
    <div>
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d.p} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.p}: ${d.n}`}>
            <span className="text-[10px] num text-mute">{d.n || ''}</span>
            <div className="w-full rounded-t bg-accent/70" style={{ height: `${(d.n / max) * 80}%`, minHeight: d.n ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1">
        {data.map((d) => (
          <div key={d.p} className="flex-1 text-[8.5px] text-faint text-center truncate">
            {d.p.replace(/^20/, "'").replace('Jan 2021', "J'21")}
          </div>
        ))}
      </div>
      <div className="text-xs text-mute mt-1">
        {total} sub-questions across {SM_PAPERS.length} papers (oldest → newest)
      </div>
    </div>
  )
}
