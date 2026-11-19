import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { evQById } from '../pyq'
import { EV_GROUP_LABEL, EV_GROUP_ORDER, EV_TOPIC_GROUP, paneWidth, setPane, usePane, type EvRefGroup } from '../reference/pane'

const Panel = lazy(() => import('./RefPanel'))

/** the pane group that belongs to the current CE 331 page (Maths bank, overview, papers → Methods) */
export function useEvPageGroup(): EvRefGroup {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean) // ['ce331', 'topic', id, tab]
  const ofTopic = (id: string | undefined) => (id && EV_TOPIC_GROUP[id as keyof typeof EV_TOPIC_GROUP]) || 'steps'
  if (parts[1] === 'topic') return ofTopic(parts[2])
  if (parts[1] === 'q') return ofTopic(evQById(decodeURIComponent(parts[2] ?? ''))?.topics[0])
  return 'steps'
}

const editable = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/** right-hand slide-out with the CE 331 charts, tables and step-by-step methods; non-modal */
export function CodePane({ pageGroup }: { pageGroup: EvRefGroup }) {
  const { open, group, expanded, width, jump } = usePane()
  const w = paneWidth(width)
  const wide = w >= 700
  const [query, setQuery] = useState('')
  const active = group ?? pageGroup

  useEffect(() => {
    setPane({ group: null })
  }, [pageGroup])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Escape' && open) {
        if (editable(e.target) && query) return
        setPane({ open: false })
      } else if ((e.key === 't' || e.key === 'T') && !editable(e.target)) {
        e.preventDefault()
        setPane({ open: !open })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, query])

  return (
    <>
      <button
        className={
          'no-print fixed right-0 top-1/2 -translate-y-1/2 z-30 rounded-l-xl border border-r-0 border-line bg-panel shadow-lg px-1.5 py-3 text-xs font-bold text-accent hover:bg-panel2 transition-opacity ' +
          (open ? 'opacity-0 pointer-events-none' : '')
        }
        style={{ writingMode: 'vertical-rl' }}
        onClick={() => setPane({ open: true })}
        title="Charts, tables & methods (T)"
        aria-label="Open the chart pane"
      >
        📈 Charts & methods
      </button>
      <aside
        className={
          'no-print fixed top-0 right-0 z-50 h-screen w-full sm:w-[var(--pw)] bg-bg border-l border-line shadow-2xl lg:shadow-none flex flex-col transition-transform duration-200 ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        style={{ '--pw': `${w}px` } as React.CSSProperties}
        aria-hidden={!open}
        inert={!open}
      >
        <DragEdge />
        <div className="px-3 pt-3 pb-2 border-b border-line space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-extrabold">Charts & methods</div>
            <span className="hidden sm:inline text-[11px] text-faint">graphs, tables and the class way of doing each sum</span>
            <span className="ml-auto hidden md:block">
              <button className="btn btn-ghost !px-2 !py-0.5 !text-xs" onClick={() => setPane({ width: wide ? 460 : 760 })} title={wide ? 'Narrow pane' : 'Wide pane — or drag the left edge'}>
                {wide ? '⇥ narrow' : '⇤ wide'}
              </button>
            </span>
            <button className="ml-auto md:ml-0 btn btn-ghost !px-2 !py-0.5" onClick={() => setPane({ open: false })} aria-label="Close the chart pane" title="Close (Esc)">
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {EV_GROUP_ORDER.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setQuery('')
                  setPane({ group: g })
                }}
                className={
                  'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ' +
                  (active === g && !query ? 'bg-accent/15 border-accent/50 text-ink' : 'border-line text-mute hover:text-ink') +
                  (g === pageGroup ? ' underline decoration-dotted underline-offset-4' : '')
                }
              >
                {EV_GROUP_LABEL[g]}
              </button>
            ))}
          </div>
          <input className="field w-full !py-1 !text-sm" placeholder="Search: CaCO3, Stokes, iso-removal, lime, Dupuit, slot, Hardy Cross, NPSH…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-3 py-2">
          {open && (
            <Suspense fallback={<div className="text-mute text-sm p-4">Loading charts…</div>}>
              <Panel group={active} query={query} expanded={expanded} jump={jump} />
            </Suspense>
          )}
        </div>
        <div className="hidden sm:block px-3 py-1.5 border-t border-line text-[11px] text-faint">
          <kbd className="chip !py-0">T</kbd> open / close · <kbd className="chip !py-0">Esc</kbd> close · drag the left edge to resize · ✎ = asked in past papers
        </div>
      </aside>
    </>
  )
}

/** grab strip on the pane's left edge: drag to resize, the page reflows beside it */
function DragEdge() {
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const move = (ev: PointerEvent) => setPane({ width: paneWidth(window.innerWidth - ev.clientX) })
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  return (
    <div
      className="hidden sm:block absolute left-0 top-0 h-full w-2 -translate-x-1 cursor-col-resize z-10 group"
      onPointerDown={onDown}
      onDoubleClick={() => setPane({ width: 460 })}
      title="Drag to resize · double-click to reset"
      role="separator"
      aria-orientation="vertical"
    >
      <span className="block mx-auto h-full w-0.5 bg-transparent group-hover:bg-accent/60 transition-colors" />
    </div>
  )
}
