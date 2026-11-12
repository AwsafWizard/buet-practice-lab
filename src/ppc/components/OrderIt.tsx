// Put in order: tap the steps in the order they happen; the chain builds into a flow chart as you go.

import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../store'
import { inline } from '../../components/ui'
import { ListPicker, sortLists } from './KeywordRecall'
import type { PcList } from '../types'

export function OrderIt({ lists }: { lists: PcList[] }) {
  const ordered = useMemo(() => sortLists(lists.filter((l) => l.ordered)), [lists])
  const key = (l: PcList) => `${l.topic}:ord:${l.id}`
  const [id, setId] = useState(ordered[0]?.id ?? '')
  useEffect(() => setId(ordered[0]?.id ?? ''), [ordered])
  const list = ordered.find((l) => l.id === id)
  if (!list) return <div className="text-mute text-sm">No sequences in this topic — nothing here has to be written in order.</div>
  const next = () => {
    const i = ordered.findIndex((l) => l.id === id)
    setId(ordered[(i + 1) % ordered.length].id)
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <ListPicker lists={ordered} value={id} onChange={setId} scoreKey={key} />
        <span className="text-xs text-mute">{ordered.length} sequences (flow charts, steps, priority orders)</span>
      </div>
      <Chain key={list.id} list={list} onNext={next} />
    </div>
  )
}

function Chain({ list, onNext }: { list: PcList; onNext: () => void }) {
  const record = useStore((s) => s.record)
  const n = list.points.length
  const deck = useMemo(() => {
    const idx = list.points.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    // never start already solved
    if (idx.every((v, i) => v === i) && n > 1) idx.reverse()
    return idx
  }, [list, n])
  const [placed, setPlaced] = useState<number[]>([])
  const [errors, setErrors] = useState(0)
  const [wrong, setWrong] = useState<number | null>(null)
  const done = placed.length === n

  const tap = (i: number) => {
    if (done) return
    if (i === placed.length) {
      const p = [...placed, i]
      setPlaced(p)
      if (p.length === n) record(`${list.topic}:ord:${list.id}`, errors === 0)
    } else {
      setErrors((e) => e + 1)
      setWrong(i)
      setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <div className="card p-5">
      <div className="text-lg font-bold leading-snug">{list.ask ?? list.title}</div>
      <div className="text-sm text-mute mb-4">
        Tap the {n} steps in order. Mistakes: <b className={'num ' + (errors ? 'text-bad' : 'text-good')}>{errors}</b>
      </div>
      <div className="grid cq-md:grid-cols-[1fr_1.1fr] gap-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Pick the next step</div>
          <div className="flex flex-wrap gap-2">
            {deck
              .filter((i) => !placed.includes(i))
              .map((i) => (
                <button key={i} type="button" onClick={() => tap(i)} className={'btn !text-sm text-left !whitespace-normal ' + (wrong === i ? 'pc-shake !border-bad text-bad' : '')}>
                  {list.points[i].k}
                </button>
              ))}
            {done && <div className="text-sm text-good font-semibold">{errors ? `Done with ${errors} slip${errors === 1 ? '' : 's'}.` : '🎉 Perfect order.'}</div>}
          </div>
          {list.hook && (
            <details className="text-sm mt-3">
              <summary className="cursor-pointer text-faint hover:text-accent">💡 memory hook</summary>
              <span className="text-accent2">{inline(list.hook)}</span>
            </details>
          )}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-faint mb-2">Your flow chart</div>
          <ol className="flex flex-col items-stretch">
            {list.points.map((p, i) => {
              const shown = i < placed.length
              return (
                <li key={i} className="flex flex-col items-center">
                  <div className={'w-full rounded-lg border px-3 py-1.5 text-sm ' + (shown ? 'border-accent/60 bg-accent/10 pc-pop' : 'border-dashed border-line text-faint')}>
                    <span className="num text-xs text-faint mr-2">{i + 1}</span>
                    {shown ? <b>{p.k}</b> : '?'}
                    {shown && done && p.d && <div className="text-xs text-mute mt-0.5">{p.d}</div>}
                  </div>
                  {i < n - 1 && <div className={'h-4 w-px ' + (i < placed.length - 1 ? 'bg-accent' : 'bg-line')} aria-hidden />}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
      {done && (
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary" onClick={onNext}>
            Next sequence →
          </button>
          <button
            className="btn"
            onClick={() => {
              setPlaced([])
              setErrors(0)
            }}
          >
            Again
          </button>
        </div>
      )}
    </div>
  )
}
