import { useEffect } from 'react'
import { Boundary } from '../../components/QuestionCard'
import { smQById } from '../pyq'
import { smPaperLabel, type SmGiven } from '../types'
import { SM_REF_ITEMS } from '../reference'
import { givenRefIds, SM_GROUP_LABEL, setPane, type SmRefGroup, type SmRefItem } from '../reference/pane'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[_′']/g, '')

export function smMatches(q: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean).map(norm)
  return SM_REF_ITEMS.filter((it) => {
    const hay = norm(`${it.title} ${it.tag ?? ''} ${it.keywords ?? ''} ${SM_GROUP_LABEL[it.group]}`)
    return words.every((w) => hay.includes(w))
  })
}

export default function Panel({
  group,
  query,
  expanded,
  focus,
  focusGiven,
  focusOpen,
  jump,
}: {
  group: SmRefGroup
  query: string
  expanded: string[]
  focus: string | null
  focusGiven: SmGiven[]
  focusOpen: string[]
  jump: string | null
}) {
  const searching = query.trim().length > 0
  const given = focus && !searching ? focusGiven : undefined
  const q = focus ? smQById(focus) : undefined
  const givenIds = given ? givenRefIds(given) : []
  const givenItems = givenIds.map((id) => SM_REF_ITEMS.find((it) => it.id === id)!).filter(Boolean)
  const items = searching ? smMatches(query) : SM_REF_ITEMS.filter((it) => it.group === group && !givenIds.includes(it.id))
  const open = given ? focusOpen : expanded
  const setOpen = (ids: string[]) => setPane(given ? { focusOpen: ids } : { expanded: ids })
  const ids = items.map((it) => it.id)
  const allOpen = ids.length > 0 && ids.every((id) => open.includes(id))
  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((x) => x !== id) : [...open, id])

  useEffect(() => {
    if (!jump) return
    const t = setTimeout(() => {
      document.getElementById(`rcref-${jump}`)?.scrollIntoView({ block: 'start' })
      setPane({ jump: null })
    }, 250)
    return () => clearTimeout(t)
  }, [jump])

  const row = (it: SmRefItem, mark?: string) => {
    const isOpen = searching || open.includes(it.id)
    return (
      <div
        key={it.id}
        id={`rcref-${it.id}`}
        className={'scroll-mt-2 rounded-xl border transition-colors ' + (mark ? 'border-load/50 bg-load/5' : isOpen ? 'border-line bg-panel' : 'border-transparent bg-panel2/70 hover:border-line')}
      >
        <button className="w-full flex items-center gap-2 px-3 py-2 text-left" onClick={() => toggle(it.id)} aria-expanded={isOpen}>
          <span className={'text-[10px] text-faint transition-transform ' + (isOpen ? 'rotate-90' : '')}>▶</span>
          <span className="flex-1 min-w-0 text-sm font-semibold leading-snug">
            {it.title}
            {mark && <span className="block text-[11px] font-semibold text-load">given as {mark}</span>}
          </span>
          {searching && <span className="chip !py-0 !text-[10px]">{SM_GROUP_LABEL[it.group]}</span>}
          {it.exam && !given && (
            <span className="text-[11px] text-load" title="Printed with recent question papers">
              ✎
            </span>
          )}
          {it.tag && <span className="text-[10.5px] text-faint whitespace-nowrap">{it.tag}</span>}
        </button>
        {isOpen && (
          <div className="px-3 pb-3 text-sm ref-body">
            <Boundary label={it.title}>
              <it.Body />
            </Boundary>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {given && (
        <div className="mb-2 rounded-xl border border-load/40 bg-load/10 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-load">Given with {q ? `${smPaperLabel(q.paper)} Q${q.no}` : focus}</span>
            <button className="ml-auto text-faint hover:text-ink" onClick={() => setPane({ focus: null, focusGiven: [], focusOpen: [] })} title="Back to the usual view">
              ✕ show all as usual
            </button>
          </div>
          {given.length === 0 ? (
            <div className="mt-1 text-mute">Nothing was attached: every value you need is in the question text.</div>
          ) : (
            <ul className="mt-1 space-y-0.5 text-mute">
              {given.map((g, i) => (
                <li key={i}>
                  <span className="font-semibold text-ink">
                    {g.formula ? '∑ ' : '▦ '}
                    {g.label}
                  </span>
                  {g.what && (
                    <>
                      {' '}
                      — <span>{g.what}</span>
                    </>
                  )}
                  {!g.ref && <span className="text-faint"> (not in the pane)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {givenItems.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {givenItems.map((it) =>
            row(
              it,
              given!
                .filter((g) => g.ref === it.id)
                .map((g) => g.label)
                .join(' · '),
            ),
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-1 pb-1.5 text-[11px] text-faint">
        <span>
          {searching
            ? `${items.length} match${items.length === 1 ? '' : 'es'} in all groups`
            : given
              ? `Not attached to the paper · ${SM_GROUP_LABEL[group]}`
              : `${items.length} items · ✎ = printed with recent papers`}
        </span>
        {ids.length > 0 && (
          <button className="text-accent hover:underline" onClick={() => setOpen(allOpen ? open.filter((x) => !ids.includes(x)) : [...new Set([...open, ...ids])])}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map((it) => row(it))}
        {!items.length && searching && <div className="text-sm text-mute px-1 py-6 text-center">Nothing matches “{query}”.</div>}
        {!items.length && !searching && <div className="text-sm text-mute px-1 py-6 text-center">Nothing in this group yet.</div>}
      </div>
    </div>
  )
}
