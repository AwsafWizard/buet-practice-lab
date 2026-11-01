// Shared lab helpers: seeded random numbers, sliders, frequency charts.

import { useMemo, useState, type ReactNode } from 'react'
import { ALL_PYQ } from '../pyq'
import { PAPERS } from '../pyq/types'
import { paperLabel } from '../components/QuestionCard'

export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 1_000_000) / 1_000_000
  }
}
export const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)]
export const randInt = (r: () => number, lo: number, hi: number, step = 1) => lo + step * Math.floor(r() * ((hi - lo) / step + 1))

export function useSeed(initial = 1) {
  const [seed, setSeed] = useState(initial)
  return { seed, next: () => setSeed((s) => s + 1 + Math.floor(Math.random() * 1000)) }
}

export function Slider({ label, value, min, max, step = 1, onChange, unit }: { label: ReactNode; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  return (
    // too narrow for one row (a 3-column grid beside the drawer): the range drops below label and value
    <label className="@container block text-sm">
      <span className="grid grid-cols-[minmax(0,1fr)_auto] @[17rem]:grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)_4rem] items-center gap-x-3">
        <span className="text-mute">{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="min-w-0 w-full col-span-2 row-start-2 @[17rem]:col-span-1 @[17rem]:col-start-2 @[17rem]:row-start-1 accent-[var(--c-accent)]" />
        <span className="num text-right @[17rem]:col-start-3 @[17rem]:row-start-1">
          {value}
          {unit}
        </span>
      </span>
    </label>
  )
}

/** questions per paper for a topic — small bar chart */
export function TopicFrequency({ topic }: { topic: string }) {
  const data = useMemo(() => PAPERS.map((p) => ({ p: p.id, n: ALL_PYQ.filter((q) => q.paper === p.id && q.topics.includes(topic as never)).length })), [topic])
  const max = Math.max(1, ...data.map((d) => d.n))
  const total = data.reduce((s, d) => s + d.n, 0)
  return (
    <div>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((d) => (
          <div key={d.p} className="flex-1 flex flex-col items-center justify-end h-full" title={`${paperLabel(d.p)}: ${d.n}`}>
            <span className="text-[10px] num text-mute">{d.n || ''}</span>
            <div className="w-full rounded-t bg-accent/70" style={{ height: `${(d.n / max) * 80}%`, minHeight: d.n ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {data.map((d) => (
          <div key={d.p} className="flex-1 text-[9px] text-faint text-center truncate">
            {paperLabel(d.p).replace('20', "'").replace('-', '–')}
          </div>
        ))}
      </div>
      <div className="text-xs text-mute mt-1">{total} sub-questions across 13 papers</div>
    </div>
  )
}

export function Card({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={'card p-4 ' + (className ?? '')}>
      {title && <div className="font-bold mb-2">{title}</div>}
      {children}
    </div>
  )
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid cq-lg:grid-cols-2 gap-4">{children}</div>
}
