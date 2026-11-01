// Left navigation shared by every course. On wide screens it collapses to an icon rail
// (remembered per device); on phones it is the usual slide-in menu.

import { useSyncExternalStore, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

const KEY = 'sidebar-collapsed'
const subs = new Set<() => void>()
let collapsed = (() => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
})()

export function setRailCollapsed(v: boolean) {
  collapsed = v
  try {
    localStorage.setItem(KEY, v ? '1' : '0')
  } catch {
    /* storage blocked */
  }
  subs.forEach((f) => f())
}

export function useRailCollapsed() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => collapsed,
  )
}

export interface RailLink {
  to: string
  icon: ReactNode
  label: ReactNode
  /** short text for the collapsed rail's tooltip */
  title: string
  end?: boolean
  right?: ReactNode
}

export function RailSidebar({
  open,
  onClose,
  brand,
  main,
  groups,
  footer,
}: {
  open: boolean
  onClose: () => void
  brand: { logo: ReactNode; title: ReactNode; sub: ReactNode }
  main: RailLink[]
  groups: { label: ReactNode; items: RailLink[] }[]
  footer: ReactNode
}) {
  const c = useRailCollapsed()
  // collapsed only applies from lg up; the phone menu always shows labels
  const hideWhenRail = c ? 'lg:hidden' : ''
  const link = (l: RailLink) => (
    <NavLink
      key={l.to}
      to={l.to}
      end={l.end}
      title={c ? l.title : undefined}
      className={({ isActive }) =>
        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ' +
        (c ? 'lg:justify-center lg:px-0 ' : '') +
        (isActive ? 'bg-accent/15 text-ink font-semibold' : 'text-mute hover:text-ink hover:bg-panel2')
      }
    >
      <span className="w-6 grid place-items-center shrink-0">{l.icon}</span>
      <span className={'flex-1 min-w-0 flex items-center gap-2.5 ' + hideWhenRail}>
        <span className="flex-1 truncate">{l.label}</span>
        {l.right}
      </span>
    </NavLink>
  )
  return (
    <>
      <div className={'fixed inset-0 bg-black/40 z-30 lg:hidden ' + (open ? '' : 'hidden')} onClick={onClose} />
      <aside
        className={
          'fixed lg:sticky top-0 z-40 h-screen w-[270px] shrink-0 bg-panel border-r border-line flex flex-col transition-[transform,width] duration-200 ' +
          (c ? 'lg:w-[64px] ' : '') +
          (open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
        }
      >
        <div className={'px-4 py-4 flex items-center gap-2.5 border-b border-line ' + (c ? 'lg:px-2 lg:justify-center' : '')}>
          <Link to="/" title="All courses" className="shrink-0">
            {brand.logo}
          </Link>
          <div className={'flex-1 min-w-0 ' + hideWhenRail}>
            <div className="font-extrabold leading-tight">{brand.title}</div>
            <div className="text-[11px] text-faint">{brand.sub}</div>
          </div>
        </div>
        <nav className={'flex-1 overflow-y-auto scroll-thin py-3 space-y-4 ' + (c ? 'px-2 lg:px-1.5' : 'px-2')}>
          <div className="space-y-0.5">{main.map(link)}</div>
          {groups.map((g, i) => (
            <div key={i}>
              <div className={'px-3 text-[10.5px] uppercase tracking-wider text-faint font-bold mb-1 ' + hideWhenRail}>{g.label}</div>
              {c && <div className="hidden lg:block mx-2 mb-2 border-t border-line" />}
              <div className="space-y-0.5">{g.items.map(link)}</div>
            </div>
          ))}
        </nav>
        <div className={hideWhenRail}>{footer}</div>
        <button
          className="hidden lg:flex items-center justify-center gap-2 border-t border-line py-2 text-xs text-mute hover:text-ink hover:bg-panel2"
          onClick={() => setRailCollapsed(!c)}
          title={c ? 'Expand the sidebar' : 'Collapse the sidebar to icons'}
        >
          {c ? '»' : <>« <span>Collapse</span></>}
        </button>
      </aside>
    </>
  )
}
