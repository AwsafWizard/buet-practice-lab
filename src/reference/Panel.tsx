import { useEffect } from 'react'
import { Boundary, paperLabel } from '../components/QuestionCard'
import { pyqById } from '../pyq'
import { givenFor, givenRefs, type Given } from '../pyq/given'
import { GROUP_LABEL, setDrawer, type RefGroup } from './drawer'
import { REF_ITEMS, type RefItem } from './index'

const SUB = '₀₁₂₃₄₅₆₇₈₉'
/** lower-case, subscripts → digits, drop underscores/primes so "K_zt", "Kzt" and "kzt" all match (spaces stay word breaks) */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u2080-\u2089]/g, (c) => String(SUB.indexOf(c)))
    .replace(/[_′']/g, '')

export function matches(q: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean).map(norm)
  return REF_ITEMS.filter((it) => {
    const hay = norm(`${it.title} ${it.tag ?? ''} ${it.keywords ?? ''} ${GROUP_LABEL[it.group]}`)
    return words.every((w) => hay.includes(w))
  })
}

export default function Panel({ group, query, expanded, focus, focusOpen, jump }: { group: RefGroup; query: string; expanded: string[]; focus: string | null; focusOpen: string[]; jump: string | null }) {
  const searching = query.trim().length > 0
  const given = focus && !searching ? givenFor(focus) : undefined
  const q = focus ? pyqById(focus) : undefined
  const givenIds = focus ? givenRefs(focus) : []
  const givenItems = given ? givenIds.map((id) => REF_ITEMS.find((it) => it.id === id)!).filter(Boolean) : []
  const items = searching ? matches(query) : REF_ITEMS.filter((it) => it.group === group && !(given && givenIds.includes(it.id)))
  const open = given ? focusOpen : expanded
  const setOpen = (ids: string[]) => setDrawer(given ? { focusOpen: ids } : { expanded: ids })
  const ids = items.map((it) => it.id)
  const allOpen = ids.length > 0 && ids.every((id) => open.includes(id))
  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((x) => x !== id) : [...open, id])

  useEffect(() => {
    if (!jump) return
    // wait for the drawer's 200 ms slide-in, or the scroll gets lost
    const t = setTimeout(() => {
      document.getElementById(`ref-${jump}`)?.scrollIntoView({ block: 'start' })
      setDrawer({ jump: null })
    }, 250)
    return () => clearTimeout(t)
  }, [jump])

  const row = (it: RefItem, mark?: string) => {
    const isOpen = searching || open.includes(it.id)
    return (
      <div
        key={it.id}
        id={`ref-${it.id}`}
        className={'scroll-mt-2 rounded-xl border transition-colors ' + (mark ? 'border-load/50 bg-load/5' : isOpen ? 'border-line bg-panel' : 'border-transparent bg-panel2/70 hover:border-line')}
      >
        <button className="w-full flex items-center gap-2 px-3 py-2 text-left" onClick={() => toggle(it.id)} aria-expanded={isOpen}>
          <span className={'text-[10px] text-faint transition-transform ' + (isOpen ? 'rotate-90' : '')}>▶</span>
          <span className="flex-1 min-w-0 text-sm font-semibold leading-snug">
            {it.title}
            {mark && <span className="block text-[11px] font-semibold text-load">given as {mark}</span>}
          </span>
          {searching && <span className="chip !py-0 !text-[10px]">{GROUP_LABEL[it.group]}</span>}
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
            <span className="font-bold text-load">Given with {q ? `${paperLabel(q.paper)} Q${q.no}` : focus}</span>
            <button className="ml-auto text-faint hover:text-ink" onClick={() => setDrawer({ focus: null, focusOpen: [] })} title="Back to the usual view of every table">
              ✕ show all as usual
            </button>
          </div>
          {given.length === 0 ? (
            <div className="mt-1 text-mute">Nothing was attached: every value you need is in the question text. Everything below is collapsed.</div>
          ) : (
            <ul className="mt-1 space-y-0.5 text-mute">
              {given.map((g, i) => (
                <li key={i}>
                  <span className="font-semibold text-ink">{g.formula ? '∑ ' : '▦ '}{g.label}</span>
                  {g.what && <> — <span>{g.what}</span></>}
                  {!g.ref && <span className="text-faint"> (not in the drawer)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {givenItems.length > 0 && <div className="space-y-1.5 mb-3">{givenItems.map((it) => row(it, labelsFor(given!, it.id)))}</div>}
      <div className="flex items-center justify-between px-1 pb-1.5 text-[11px] text-faint">
        <span>
          {searching
            ? `${items.length} match${items.length === 1 ? '' : 'es'} in all groups`
            : given
              ? `Not given in the paper · ${GROUP_LABEL[group]}`
              : `${items.length} tables · ✎ = printed with recent papers`}
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
      </div>
    </div>
  )
}

/** "Table 3 · C_s equations" for the attached things that live in one drawer item */
const labelsFor = (given: Given[], id: string) =>
  given
    .filter((g) => g.ref === id)
    .map((g) => g.label)
    .join(' · ')
