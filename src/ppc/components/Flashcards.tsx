// Flashcards with Leitner boxes: think, flip (space), say honestly how it went (1 again · 2 shaky · 3 got it).

import { useEffect, useMemo, useState } from 'react'
import { inline, Md, Seg } from '../../components/ui'
import { useStore, type CardState } from '../../store'
import type { DeckCard } from '../content'
import { BOX_LABEL, boxCounts, buildQueue, nextDue, rate, type Grade } from '../engine/leitner'
import { pcTopicById } from '../registry'

type Mode = 'due' | 'missed' | 'all'

const shuffle = <T,>(a: T[]) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

function makeQueue(pool: DeckCard[], states: Record<string, CardState>, mode: Mode): string[] {
  if (mode === 'missed') return shuffle(pool.filter((c) => (states[c.id]?.miss ?? 0) > 0 || (states[c.id] && states[c.id].box <= 2))).map((c) => c.id)
  if (mode === 'all') return shuffle(pool).map((c) => c.id)
  return buildQueue(pool, states, Date.now(), 20)
}

export function Flashcards({ pool, showTopic = false }: { pool: DeckCard[]; showTopic?: boolean }) {
  const states = useStore((s) => s.cards)
  const rateCard = useStore((s) => s.rateCard)
  const record = useStore((s) => s.record)
  const [mode, setMode] = useState<Mode>('due')
  const [queue, setQueue] = useState<string[]>(() => makeQueue(pool, useStore.getState().cards, 'due'))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false)
  const [done, setDone] = useState({ again: 0, shaky: 0, got: 0 })
  const byId = useMemo(() => new Map(pool.map((c) => [c.id, c])), [pool])
  const poolKey = pool.map((c) => c.id).join('|')

  const restart = (m: Mode = mode) => {
    setQueue(makeQueue(pool, useStore.getState().cards, m))
    setPos(0)
    setFlipped(false)
    setHint(false)
    setDone({ again: 0, shaky: 0, got: 0 })
  }
  // a new pool (topic changed) starts a new session
  useEffect(() => restart('due'), [poolKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const card = byId.get(queue[pos])
  const grade = (g: Grade) => {
    if (!card) return
    const next = rate(states[card.id], g)
    rateCard(card.id, next)
    record(`${card.topic}:fc:${card.id}`, g !== 'again')
    setDone((d) => ({ ...d, [g]: d[g] + 1 }))
    const q = [...queue]
    // a miss comes back a few cards later in this session
    if (g === 'again') q.splice(Math.min(q.length, pos + 4), 0, card.id)
    setQueue(q)
    setPos(pos + 1)
    setFlipped(false)
    setHint(false)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (!card) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && (e.key === '1' || e.key === '2' || e.key === '3')) {
        grade(e.key === '1' ? 'again' : e.key === '2' ? 'shaky' : 'got')
      } else if (e.key === 'h') setHint(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ids = pool.map((c) => c.id)
  const boxes = boxCounts(ids, states)
  const left = Math.max(0, queue.length - pos)
  const nd = nextDue(ids, states)
  const t = card ? pcTopicById(card.topic) : undefined

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Seg<Mode>
          value={mode}
          onChange={(m) => {
            setMode(m)
            restart(m)
          }}
          items={[
            { v: 'due', label: 'Due + new' },
            { v: 'missed', label: 'Weak cards' },
            { v: 'all', label: 'Shuffle all' },
          ]}
        />
        <span className="text-xs text-mute">
          <b className="num text-ink">{left}</b> left in this round · {pool.length} cards
        </span>
        <BoxBar boxes={boxes} />
      </div>

      {card ? (
        <div className="pc-flip select-none">
          <div className={'pc-flip-inner ' + (flipped ? 'flipped' : '')}>
            <button type="button" className="pc-face card p-6 text-left min-h-[15rem] flex flex-col cursor-pointer hover:border-accent" onClick={() => setFlipped(true)} aria-label="Show the answer" tabIndex={flipped ? -1 : 0}>
              <CardMeta card={card} showTopic={showTopic} color={t?.color} short={t?.short} state={states[card.id]} />
              <div className="flex-1 grid place-items-center py-4">
                <div className="text-lg cq-md:text-xl font-semibold text-center leading-snug max-w-2xl">
                  <Md>{card.front}</Md>
                </div>
              </div>
              {card.hook && (
                <div className="text-sm text-center min-h-6" onClick={(e) => e.stopPropagation()}>
                  {hint ? (
                    <span className="text-accent2">💡 {inline(card.hook)}</span>
                  ) : (
                    <span role="button" tabIndex={0} className="text-faint underline decoration-dotted cursor-pointer hover:text-accent" onClick={() => setHint(true)}>
                      need a hint? (h)
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs text-faint text-center mt-2">Say it (or write it) first · tap or press space to flip</div>
            </button>
            <div className="pc-face pc-back card p-6 min-h-[15rem] flex flex-col" aria-hidden={!flipped}>
              <CardMeta card={card} showTopic={showTopic} color={t?.color} short={t?.short} state={states[card.id]} />
              <div className="text-sm font-semibold text-mute mt-2 mb-1">
                <Md>{card.front}</Md>
              </div>
              <div className="flex-1 text-[15px]">
                <Md>{card.back}</Md>
              </div>
              {card.hook && <div className="text-sm text-accent2 mt-2">💡 {inline(card.hook)}</div>}
              {card.list?.note && <div className="text-xs text-mute mt-2">ⓘ {card.list.note}</div>}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <GradeBtn k="1" label="Again" sub="didn’t have it" cls="border-bad/50 hover:bg-bad/10 text-bad" onClick={() => grade('again')} disabled={!flipped} />
                <GradeBtn k="2" label="Shaky" sub="half of it" cls="border-load/50 hover:bg-load/10 text-load" onClick={() => grade('shaky')} disabled={!flipped} />
                <GradeBtn k="3" label="Got it" sub="all of it" cls="border-good/50 hover:bg-good/10 text-good" onClick={() => grade('got')} disabled={!flipped} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">✨</div>
          <div className="font-bold text-lg">Round done</div>
          <div className="text-sm text-mute mt-1">
            {done.got} got it · {done.shaky} shaky · {done.again} again
            {nd && nd > Date.now() && <> · next card falls due {whenText(nd)}</>}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button className="btn btn-primary" onClick={() => restart('due')}>
              Next round (due + 20 new)
            </button>
            <button className="btn" onClick={() => restart('missed')}>
              Drill the weak ones
            </button>
          </div>
        </div>
      )}
      <div className="text-xs text-faint mt-2">Keys: space flip · h hint · 1 again · 2 shaky · 3 got it. A miss comes back in a minute; “got it” cards wait longer each time (5 min → 3 days).</div>
    </div>
  )
}

function whenText(t: number) {
  const m = Math.round((t - Date.now()) / 60000)
  if (m < 60) return `in ${Math.max(1, m)} min`
  const h = Math.round(m / 60)
  return h < 24 ? `in ${h} h` : `in ${Math.round(h / 24)} d`
}

function GradeBtn({ k, label, sub, cls, onClick, disabled }: { k: string; label: string; sub: string; cls: string; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" className={'rounded-xl border px-2 py-2 text-center transition-colors ' + cls} onClick={onClick} disabled={disabled}>
      <div className="font-bold text-sm">
        {label} <span className="text-[10px] opacity-70 num">{k}</span>
      </div>
      <div className="text-[11px] text-mute">{sub}</div>
    </button>
  )
}

function CardMeta({ card, showTopic, color, short, state }: { card: DeckCard; showTopic: boolean; color?: string; short?: string; state?: CardState }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {showTopic && short && (
        <span className="chip" style={{ color }}>
          {short}
        </span>
      )}
      {card.list && <span className="chip">list · {card.list.points.length}</span>}
      {card.list?.ordered && <span className="chip">in order</span>}
      {card.weight > 0 ? <span className="chip text-accent">asked {card.weight}×</span> : <span className="chip text-faint">not asked yet</span>}
      <span className="ml-auto text-faint">{state ? BOX_LABEL[state.box] : 'new'}</span>
    </div>
  )
}

export function BoxBar({ boxes }: { boxes: number[] }) {
  const total = boxes.reduce((a, b) => a + b, 0) || 1
  const colors = ['var(--c-line)', 'var(--c-bad)', 'var(--c-load)', 'var(--c-axial)', 'var(--c-tension)', 'var(--c-good)']
  return (
    <div className="flex items-center gap-2 ml-auto" title={boxes.map((n, i) => `${BOX_LABEL[i]}: ${n}`).join(' · ')}>
      <div className="flex h-2 w-40 rounded-full overflow-hidden bg-panel2">
        {boxes.map((n, i) => (n ? <div key={i} style={{ width: `${(n / total) * 100}%`, background: colors[i] }} /> : null))}
      </div>
      <span className="text-[11px] text-mute num">
        {boxes[4] + boxes[5]}/{total} known
      </span>
    </div>
  )
}
