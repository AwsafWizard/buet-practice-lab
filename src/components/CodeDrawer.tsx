import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ALL_PYQ } from '../pyq'
import { givenFor, givenRefs } from '../pyq/given'
import { focusQuestion, GROUP_LABEL, GROUP_ORDER, groupForTopic, groupOfRef, setDrawer, useDrawer, type RefGroup } from '../reference/drawer'

const Panel = lazy(() => import('../reference/Panel'))

/** reference group for the current page, or null when the drawer has nothing to offer here */
export function usePageGroup(): RefGroup | null {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'topic') return groupForTopic(parts[1])
  if (parts[0] === 'q') return firstGroup(ALL_PYQ.find((q) => q.id === decodeURIComponent(parts[1] ?? ''))?.topics ?? [])
  if (parts[0] === 'papers' && parts[1]) {
    // a whole paper: code tables first, the integration chart only if that is all it needs
    const have = new Set(ALL_PYQ.filter((q) => q.paper === parts[1]).flatMap((q) => q.topics.map(groupForTopic)))
    return GROUP_ORDER.find((g) => have.has(g)) ?? null
  }
  return null
}

function firstGroup(topics: string[]) {
  for (const t of topics) {
    const g = groupForTopic(t)
    if (g) return g
  }
  return null
}

const editable = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/** right-hand slide-out with BNBC tables and the integration chart; non-modal so the page stays usable */
export function CodeDrawer({ pageGroup }: { pageGroup: RefGroup }) {
  const { open, group, expanded, wide, focus, focusOpen, jump } = useDrawer()
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  // a focused question brings the group of its first attached table to the front
  const focusGroup = focus ? groupOfRef(givenRefs(focus)[0]) : null
  const active = group ?? focusGroup ?? pageGroup

  // a new topic page brings its own group to the front
  useEffect(() => {
    setDrawer({ group: null })
  }, [pageGroup])

  // a question's own page focuses it; any other page starts unfocused (cards focus themselves when opened)
  useEffect(() => {
    const parts = pathname.split('/').filter(Boolean)
    const qid = parts[0] === 'q' ? decodeURIComponent(parts[1] ?? '') : ''
    if (qid && givenFor(qid)) focusQuestion(qid, givenRefs(qid))
    else setDrawer({ focus: null, focusOpen: [] })
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape' && open) {
        if (editable(e.target) && query) return
        setDrawer({ open: false })
      } else if ((e.key === 't' || e.key === 'T') && !editable(e.target)) {
        e.preventDefault()
        setDrawer({ open: !open })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, query])

  const vw = pageGroup === 'vw'
  return (
    <>
      <button
        className={
          'no-print fixed right-0 top-1/2 -translate-y-1/2 z-30 rounded-l-xl border border-r-0 border-line bg-panel shadow-lg px-1.5 py-3 text-xs font-bold text-accent hover:bg-panel2 transition-opacity ' +
          (open ? 'opacity-0 pointer-events-none' : '')
        }
        style={{ writingMode: 'vertical-rl' }}
        onClick={() => setDrawer({ open: true })}
        title="Code tables (T)"
        aria-label="Open code tables"
      >
        {vw ? '∫ Integration chart' : '📘 Code tables'}
        {focus && givenRefs(focus).length > 0 && <span className="text-load"> · {givenRefs(focus).length} given</span>}
      </button>
      <aside
        ref={panelRef}
        className={
          'no-print fixed top-0 right-0 z-50 h-screen w-full bg-bg ' + (wide ? 'md:w-[min(760px,92vw)]' : 'sm:w-[440px]') + ' border-l border-line shadow-2xl flex flex-col transition-transform duration-200 ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        aria-hidden={!open}
        inert={!open}
      >
        <div className="px-3 pt-3 pb-2 border-b border-line space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-extrabold">Code tables</div>
            <span className="hidden sm:inline text-[11px] text-faint">BNBC 2020 · as handed out in the exam</span>
            <span className="ml-auto hidden md:block">
              <button className="btn btn-ghost !px-2 !py-0.5 !text-xs" onClick={() => setDrawer({ wide: !wide })} title={wide ? 'Narrow panel' : 'Wide panel (for the big tables)'}>
                {wide ? '⇥ narrow' : '⇤ wide'}
              </button>
            </span>
            <button className="ml-auto md:ml-0 btn btn-ghost !px-2 !py-0.5" onClick={() => setDrawer({ open: false })} aria-label="Close code tables" title="Close (Esc)">
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {GROUP_ORDER.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setQuery('')
                  setDrawer({ group: g })
                }}
                className={
                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ' +
                  (active === g && !query ? 'bg-accent/15 border-accent/50 text-ink' : 'border-line text-mute hover:text-ink') +
                  (g === pageGroup ? ' underline decoration-dotted underline-offset-4' : '')
                }
              >
                {GROUP_LABEL[g]}
              </button>
            ))}
          </div>
          <input className="field w-full !py-1 !text-sm" placeholder="Search: Kzt, λ, SDC, K_LL, parapet…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-3 py-2">
          {open && (
            <Suspense fallback={<div className="text-mute text-sm p-4">Loading tables…</div>}>
              <Panel group={active} query={query} expanded={expanded} focus={focus} focusOpen={focusOpen} jump={jump} />
            </Suspense>
          )}
        </div>
        <div className="hidden sm:block px-3 py-1.5 border-t border-line text-[11px] text-faint">
          <kbd className="chip !py-0">T</kbd> open / close · <kbd className="chip !py-0">Esc</kbd> close · the page stays usable while this is open
        </div>
      </aside>
    </>
  )
}
