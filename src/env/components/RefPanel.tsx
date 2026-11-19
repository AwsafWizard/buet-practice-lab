import { useEffect } from 'react'
import { Boundary } from '../../components/QuestionCard'
import { EV_REF_ITEMS } from '../reference'
import { EV_GROUP_LABEL, setPane, type EvRefGroup, type EvRefItem } from '../reference/pane'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[₀-₉]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[⁰¹²³⁴-⁹]/g, (c) => String(SUP.indexOf(c)))
    .replace(/[_′'’–—-]/g, '')

export function evMatches(q: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean).map(norm)
  return EV_REF_ITEMS.filter((it) => {
    const hay = norm(`${it.title} ${it.tag ?? ''} ${it.keywords ?? ''} ${EV_GROUP_LABEL[it.group]}`)
    return words.every((w) => hay.includes(w))
  })
}

export default function RefPanel({ group, query, expanded, jump }: { group: EvRefGroup; query: string; expanded: string[]; jump: string | null }) {
  const searching = query.trim().length > 0
  const items = searching ? evMatches(query) : EV_REF_ITEMS.filter((it) => it.group === group)
  const ids = items.map((it) => it.id)
  const allOpen = ids.length > 0 && ids.every((id) => expanded.includes(id))
  const toggle = (id: string) => setPane({ expanded: expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id] })

  useEffect(() => {
    if (!jump) return
    const t = setTimeout(() => {
      document.getElementById(`evref-${jump}`)?.scrollIntoView({ block: 'start' })
      setPane({ jump: null })
    }, 250)
    return () => clearTimeout(t)
  }, [jump])

  const row = (it: EvRefItem) => {
    const isOpen = searching || expanded.includes(it.id)
    return (
      <div key={it.id} id={`evref-${it.id}`} className={'scroll-mt-2 rounded-xl border transition-colors ' + (isOpen ? 'border-line bg-panel' : 'border-transparent bg-panel2/70 hover:border-line')}>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-left" onClick={() => toggle(it.id)} aria-expanded={isOpen}>
          <span className={'text-[10px] text-faint transition-transform ' + (isOpen ? 'rotate-90' : '')}>▶</span>
          <span className="flex-1 min-w-0 text-sm font-semibold leading-snug">{it.title}</span>
          {searching && <span className="chip !py-0 !text-[10px]">{EV_GROUP_LABEL[it.group]}</span>}
          {it.exam && (
            <span className="text-[11px] text-load" title="Asked in past papers">
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
      <div className="flex items-center justify-between px-1 pb-1.5 text-[11px] text-faint">
        <span>{searching ? `${items.length} match${items.length === 1 ? '' : 'es'} in all groups` : `${items.length} items · ✎ = asked in past papers`}</span>
        {ids.length > 0 && (
          <button className="text-accent hover:underline" onClick={() => setPane({ expanded: allOpen ? expanded.filter((x) => !ids.includes(x)) : [...new Set([...expanded, ...ids])] })}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map(row)}
        {!items.length && searching && <div className="text-sm text-mute px-1 py-6 text-center">Nothing matches “{query}”.</div>}
        {!items.length && !searching && <div className="text-sm text-mute px-1 py-6 text-center">Nothing in this group yet.</div>}
      </div>
    </div>
  )
}
