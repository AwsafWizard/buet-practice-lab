// Cloze: the model answer with its examiner keywords blanked. Fill them in, then check.

import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '../../store'
import { passes } from '../engine/match'
import { pcTopicById } from '../registry'
import type { PcAnswer } from '../types'

interface Seg {
  text?: string
  blank?: number
}
interface Line {
  kind: 'h' | 'li' | 'p' | 'row'
  segs: Seg[]
}

/** strip inline markdown so blanks never split a **bold** run */
const plain = (s: string) => s.replace(/\*\*|`/g, '').replace(/(^|\s)\*(\S[^*]*\S|\S)\*(?=\s|[.,;:]|$)/g, '$1$2')

/** split the answer into lines with blanks at the first whole-word occurrence of each key */
export function clozeLines(a: PcAnswer): { lines: Line[]; keys: string[] } {
  const rawLines = a.a.replace(/\r/g, '').split('\n')
  const text = rawLines
    .map((l) => {
      const t = l.trim()
      if (/^\|?\s*:?-{3,}/.test(t) && /^[|\s:-]+$/.test(t)) return '' // table separator
      return plain(t)
    })
    .join('\n')
  const low = text.toLowerCase()
  const taken: [number, number][] = []
  const spots: { at: number; len: number; key: string }[] = []
  const keys = [...a.keys].sort((x, y) => y.length - x.length)
  for (const k of keys) {
    const kl = k.toLowerCase()
    let from = 0
    let at = -1
    while ((from = low.indexOf(kl, from)) >= 0) {
      const before = from === 0 ? ' ' : low[from - 1]
      const after = low[from + kl.length] ?? ' '
      const word = !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)
      const free = !taken.some(([s, e]) => from < e && from + kl.length > s)
      if (free && word) {
        at = from
        break
      }
      from += 1
    }
    if (at < 0) {
      // fall back to any free occurrence
      from = 0
      while ((from = low.indexOf(kl, from)) >= 0) {
        if (!taken.some(([s, e]) => from < e && from + kl.length > s)) {
          at = from
          break
        }
        from += 1
      }
    }
    if (at >= 0) {
      taken.push([at, at + kl.length])
      spots.push({ at, len: kl.length, key: text.slice(at, at + kl.length) })
    }
  }
  spots.sort((x, y) => x.at - y.at)
  const lines: Line[] = []
  let pos = 0
  let si = 0
  for (const l of text.split('\n')) {
    const start = pos
    const end = pos + l.length
    pos = end + 1
    if (!l.trim()) continue
    let kind: Line['kind'] = 'p'
    let skip = 0
    const h = /^#{2,4}\s+/.exec(l)
    const li = /^\s*([-*]|\d+[.)])\s+/.exec(l)
    if (h) {
      kind = 'h'
      skip = h[0].length
    } else if (li) {
      kind = 'li'
      skip = li[0].length
    } else if (/^\s*\|/.test(l)) kind = 'row'
    const segs: Seg[] = []
    let cur = start + skip
    while (si < spots.length && spots[si].at < end) {
      const s = spots[si]
      if (s.at >= cur) {
        if (s.at > cur) segs.push({ text: text.slice(cur, s.at) })
        segs.push({ blank: si })
        cur = s.at + s.len
      }
      si++
    }
    if (cur < end) segs.push({ text: text.slice(cur, end) })
    if (kind === 'row') for (const s of segs) if (s.text) s.text = s.text.replace(/^\s*\|\s*|\s*\|\s*$/g, '').replace(/\s*\|\s*/g, '  ·  ')
    lines.push({ kind, segs })
  }
  return { lines, keys: spots.map((s) => s.key) }
}

export function Cloze({ answers, showTopic = false }: { answers: PcAnswer[]; showTopic?: boolean }) {
  const sorted = useMemo(() => [...answers].sort((a, b) => b.seen.length - a.seen.length), [answers])
  const attempts = useStore((s) => s.attempts)
  const key = (a: PcAnswer) => `${a.topic}:cz:${a.id}`
  const [id, setId] = useState(sorted[0]?.id ?? '')
  useEffect(() => setId(sorted[0]?.id ?? ''), [sorted])
  const a = sorted.find((x) => x.id === id)
  if (!a) return <div className="text-mute text-sm">No model answers here yet.</div>
  const next = () => {
    const i = sorted.findIndex((x) => x.id === id)
    setId(sorted[(i + 1) % sorted.length].id)
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select className="field !py-1 text-sm max-w-full" value={id} onChange={(e) => setId(e.target.value)}>
          {sorted.map((x) => {
            const at = attempts[key(x)]
            return (
              <option key={x.id} value={x.id}>
                {!at ? '○' : at.correct ? '●' : '◐'} {x.q.slice(0, 90)}
                {x.seen.length ? ` · asked ${x.seen.length}×` : ''}
              </option>
            )
          })}
        </select>
      </div>
      <ClozeCard key={a.id} a={a} showTopic={showTopic} onNext={next} />
    </div>
  )
}

function ClozeCard({ a, showTopic, onNext }: { a: PcAnswer; showTopic: boolean; onNext: () => void }) {
  const record = useStore((s) => s.record)
  const { lines, keys } = useMemo(() => clozeLines(a), [a])
  const [vals, setVals] = useState<string[]>(() => keys.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [bank, setBank] = useState(false)
  const ok = keys.map((k, i) => passes(vals[i], { k }))
  const right = ok.filter(Boolean).length
  const t = pcTopicById(a.topic)
  const shuffled = useMemo(() => [...keys].sort(() => Math.random() - 0.5), [keys])

  const check = () => {
    setChecked(true)
    record(`${a.topic}:cz:${a.id}`, right >= Math.ceil(keys.length * 0.8))
  }
  const blank = (i: number): ReactNode => {
    const w = Math.max(5, Math.min(26, keys[i].length + 2))
    if (checked)
      return (
        <span className={'inline-block rounded px-1 font-semibold ' + (ok[i] ? 'bg-good/15 text-good' : 'bg-bad/10 text-bad')} title={ok[i] ? '' : `you wrote: ${vals[i] || '—'}`}>
          {keys[i]}
        </span>
      )
    return (
      <input
        className="field !inline-block !py-0 !px-1 !text-sm align-baseline"
        style={{ width: `${w}ch` }}
        value={vals[i]}
        aria-label={`blank ${i + 1}`}
        onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const nxt = (e.currentTarget.closest('.pc-cloze') as HTMLElement)?.querySelectorAll('input')
            const arr = nxt ? Array.from(nxt) : []
            const idx = arr.indexOf(e.currentTarget)
            if (idx >= 0 && idx < arr.length - 1) arr[idx + 1].focus()
            else check()
          }
        }}
      />
    )
  }
  const render = (segs: Seg[]) => segs.map((s, k) => <Fragment key={k}>{s.blank !== undefined ? blank(s.blank) : s.text}</Fragment>)

  return (
    <div className="card p-5">
      <div className="text-xs text-faint mb-0.5">
        {showTopic && t && <span style={{ color: t.color }}>{t.short} · </span>}
        {a.seen.length ? `asked in ${a.seen.join(', ')}` : 'not asked in a paper yet'}
      </div>
      <div className="text-lg font-bold leading-snug mb-1">{a.q}</div>
      <div className="text-sm text-mute mb-3">
        {keys.length} keywords blanked. Enter jumps to the next blank.{' '}
        <button className="underline decoration-dotted text-faint hover:text-accent" onClick={() => setBank(!bank)}>
          {bank ? 'hide' : 'show'} word bank
        </button>
      </div>
      {bank && !checked && (
        <div className="flex flex-wrap gap-1 mb-3">
          {shuffled.map((k, i) => (
            <span key={i} className="chip !text-xs">
              {k}
            </span>
          ))}
        </div>
      )}
      <div className="pc-cloze text-[15px] leading-8 space-y-1">
        {lines.map((l, i) =>
          l.kind === 'h' ? (
            <div key={i} className="font-bold mt-2">
              {render(l.segs)}
            </div>
          ) : l.kind === 'li' ? (
            <div key={i} className="pl-4 relative">
              <span className="absolute left-0 text-faint">•</span>
              {render(l.segs)}
            </div>
          ) : l.kind === 'row' ? (
            <div key={i} className="text-sm border-b border-line/60">
              {render(l.segs)}
            </div>
          ) : (
            <p key={i}>{render(l.segs)}</p>
          ),
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {!checked ? (
          <button className="btn btn-primary" onClick={check}>
            Check
          </button>
        ) : (
          <>
            <span className={'font-bold ' + (right === keys.length ? 'text-good' : 'text-ink')}>
              {right}/{keys.length} keywords
            </span>
            <button
              className="btn"
              onClick={() => {
                setChecked(false)
                setVals(keys.map((k, i) => (ok[i] ? vals[i] : '')))
              }}
            >
              Retry the red ones
            </button>
            <button className="btn btn-primary ml-auto" onClick={onNext}>
              Next answer →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
