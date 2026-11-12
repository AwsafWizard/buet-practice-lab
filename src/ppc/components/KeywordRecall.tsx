// Keyword recall: the list's title, N empty slots, and you type what you remember. Each line that carries a
// point's keyword fills its slot. Give up to see the rest; whatever you missed goes back into the flashcards.

import { useEffect, useMemo, useRef, useState } from 'react'
import { inline, Md } from '../../components/ui'
import { useStore } from '../../store'
import { matchLine } from '../engine/match'
import { rate } from '../engine/leitner'
import { pcTopicById } from '../registry'
import type { PcList } from '../types'

export function ListPicker({ lists, value, onChange, scoreKey }: { lists: PcList[]; value: string; onChange: (id: string) => void; scoreKey: (l: PcList) => string }) {
  const attempts = useStore((s) => s.attempts)
  return (
    <select className="field !py-1 text-sm max-w-full" value={value} onChange={(e) => onChange(e.target.value)}>
      {lists.map((l) => {
        const a = attempts[scoreKey(l)]
        const mark = !a ? '○' : a.correct ? '●' : '◐'
        return (
          <option key={l.id} value={l.id}>
            {mark} {l.title} ({l.points.length}){l.seen.length ? ` · asked ${l.seen.length}×` : ''}
          </option>
        )
      })}
    </select>
  )
}

/** most-asked first, then the ones you haven't got yet */
export function sortLists(lists: PcList[]) {
  return [...lists].sort((a, b) => b.seen.length - a.seen.length || a.title.localeCompare(b.title))
}

export function KeywordRecall({ lists, showTopic = false }: { lists: PcList[]; showTopic?: boolean }) {
  const sorted = useMemo(() => sortLists(lists), [lists])
  const key = (l: PcList) => `${l.topic}:kw:${l.id}`
  const attempts = useStore((s) => s.attempts)
  const firstOpen = () => sorted.find((l) => !useStore.getState().attempts[key(l)]?.correct)?.id ?? sorted[0]?.id ?? ''
  const [id, setId] = useState(firstOpen)
  useEffect(() => setId(firstOpen()), [sorted]) // eslint-disable-line react-hooks/exhaustive-deps
  const list = sorted.find((l) => l.id === id)
  const next = () => {
    const i = sorted.findIndex((l) => l.id === id)
    const rest = [...sorted.slice(i + 1), ...sorted.slice(0, i + 1)]
    setId((rest.find((l) => !attempts[key(l)]?.correct) ?? rest[0]).id)
  }
  if (!list) return <div className="text-mute text-sm">No lists here yet.</div>
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <ListPicker lists={sorted} value={id} onChange={setId} scoreKey={key} />
        <button className="btn !py-1 !text-xs" onClick={() => setId(sorted[Math.floor(Math.random() * sorted.length)].id)}>
          🎲 random
        </button>
        <span className="text-xs text-mute">
          <b className="num text-ink">{sorted.filter((l) => attempts[key(l)]?.correct).length}</b>/{sorted.length} lists recalled in full at least once
        </span>
      </div>
      <Recall key={list.id} list={list} showTopic={showTopic} onNext={next} />
    </div>
  )
}

function Recall({ list, showTopic, onNext }: { list: PcList; showTopic: boolean; onNext: () => void }) {
  const record = useStore((s) => s.record)
  const rateCard = useStore((s) => s.rateCard)
  const [found, setFound] = useState<Map<number, string>>(new Map())
  const [misses, setMisses] = useState<string[]>([])
  const [text, setText] = useState('')
  const [shake, setShake] = useState(false)
  const [hints, setHints] = useState(0)
  const [over, setOver] = useState(false)
  const inp = useRef<HTMLInputElement>(null)
  const t = pcTopicById(list.topic)
  const n = list.points.length

  const finish = (got: Map<number, string>) => {
    setOver(true)
    const all = got.size === n
    record(`${list.topic}:kw:${list.id}`, all && hints === 0)
    // a miss sends the list's flashcard back to the front of the deck
    if (!all) {
      const cid = 'k:' + list.id
      rateCard(cid, rate(useStore.getState().cards[cid], 'again'))
    }
  }

  const submit = () => {
    const lines = text
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (!lines.length) return
    const got = new Map(found)
    const bad: string[] = []
    for (const line of lines) {
      const i = matchLine(line, list.points, new Set(got.keys()))
      if (i >= 0) got.set(i, line)
      else bad.push(line)
    }
    setFound(got)
    if (bad.length) {
      setMisses((m) => [...m, ...bad])
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    setText('')
    if (got.size === n) finish(got)
    inp.current?.focus()
  }

  const missingIdx = list.points.map((_, i) => i).filter((i) => !found.has(i))
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start gap-2 mb-1">
        <div className="flex-1 min-w-[14rem]">
          <div className="text-xs text-faint mb-0.5">
            {showTopic && t && <span style={{ color: t.color }}>{t.short} · </span>}
            {list.seen.length ? `asked in ${list.seen.join(', ')}` : 'not asked in a paper yet'}
          </div>
          <div className="text-lg font-bold leading-snug">{list.ask ?? list.title}</div>
          <div className="text-sm text-mute">
            {n} points{list.ordered ? ', in order' : ''} · type one or several (separate with commas or Enter)
          </div>
        </div>
        <div className="text-right">
          <div className="num text-2xl font-extrabold text-accent">
            {found.size}/{n}
          </div>
        </div>
      </div>

      <ol className="grid cq-md:grid-cols-2 gap-1.5 my-4">
        {list.points.map((p, i) => {
          const got = found.has(i)
          const shown = got || over
          return (
            <li key={i} className={'rounded-lg border px-3 py-1.5 text-sm flex gap-2 items-baseline ' + (got ? 'border-good/60 bg-good/10 pc-pop' : over ? 'border-bad/50 bg-bad/5' : 'border-line bg-panel2')}>
              <span className="num text-faint text-xs w-5 shrink-0">{i + 1}.</span>
              {shown ? (
                <span>
                  <b className={got ? 'text-good' : 'text-bad'}>{p.k}</b>
                  {over && p.d && <span className="text-mute"> — {p.d}</span>}
                  {got && found.get(i) && found.get(i)!.toLowerCase() !== p.k.toLowerCase() && <span className="text-faint text-xs"> (you: “{found.get(i)}”)</span>}
                </span>
              ) : (
                <span className="text-faint">{hints > 0 ? hintOf(p.k, hints) : '…'}</span>
              )}
            </li>
          )
        })}
      </ol>

      {!over ? (
        <>
          <div className={'flex gap-2 ' + (shake ? 'pc-shake' : '')}>
            <input
              ref={inp}
              autoFocus
              className="field flex-1"
              placeholder="type a keyword and press Enter…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              aria-label="Type a point you remember"
            />
            <button className="btn btn-primary" onClick={submit}>
              Check
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
            {list.hook && (
              <details className="text-sm">
                <summary className="cursor-pointer text-faint hover:text-accent">💡 memory hook</summary>
                <span className="text-accent2">{inline(list.hook)}</span>
              </details>
            )}
            <button className="btn !py-0.5 !text-xs" onClick={() => setHints((h) => Math.min(h + 1, 3))} disabled={hints >= 3}>
              {hints ? 'More letters' : 'First letters'}
            </button>
            <button className="btn !py-0.5 !text-xs ml-auto" onClick={() => finish(found)}>
              I’m stuck — show the rest
            </button>
          </div>
          {misses.length > 0 && (
            <div className="text-xs text-faint mt-2">
              Didn’t match a point: {misses.map((m, i) => <span key={i} className="chip !text-[11px] mr-1">{m}</span>)}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl bg-panel2 border border-line p-3">
          <div className="font-bold mb-1">{found.size === n ? (hints ? '✓ All of them (with letter hints)' : '🎉 All of them, from memory') : `${found.size}/${n} — the red ones go back into your flashcards`}</div>
          {list.hook && <div className="text-sm text-accent2">💡 {inline(list.hook)}</div>}
          {list.note && <div className="text-xs text-mute mt-1">ⓘ {list.note}</div>}
          <div className="text-xs text-faint mt-1">Source: {list.src}</div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={onNext}>
              Next list →
            </button>
            {missingIdx.length > 0 && (
              <button
                className="btn"
                onClick={() => {
                  setFound(new Map())
                  setMisses([])
                  setHints(0)
                  setOver(false)
                }}
              >
                Try this one again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** first letters of each word, more of them with each hint level */
function hintOf(k: string, level: number) {
  return k
    .split(/\s+/)
    .map((w) => (w.length <= level ? w : w.slice(0, level) + '·'.repeat(Math.min(6, w.length - level))))
    .join(' ')
}

export function PointsMd({ list }: { list: PcList }) {
  return <Md>{list.points.map((p, i) => `${i + 1}. **${p.k}**${p.d ? ' — ' + p.d : ''}`).join('\n')}</Md>
}
