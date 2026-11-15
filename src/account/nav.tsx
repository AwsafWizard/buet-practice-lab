// Sidebar entry every course shares: Threads (with an unread count). Account sits in the header.
import { lazy } from 'react'
import { Route } from 'react-router-dom'
import { CLOUD } from '../cloud'
import type { RailLink } from '../components/RailSidebar'
import { accountPath, coursePath, useUnread, type Course } from './api'

const ThreadsPage = lazy(() => import('./ThreadsPage'))
const AccountPage = lazy(() => import('./AccountPage'))

/** <Route>s for a course's Threads and Account pages (call inside its <Routes>) */
export const accountRoutes = (c: Course) => [
  <Route key="threads" path={coursePath(c, 'threads')} element={<ThreadsPage />} />,
  <Route key="thread" path={coursePath(c, 'threads/:tid')} element={<ThreadsPage />} />,
  <Route key="account" path={accountPath(c)} element={<AccountPage />} />,
]

const glyph = (g: string) => <span className="text-center">{g}</span>

export function useAccountLinks(c: Course): RailLink[] {
  const unread = useUnread(c)
  return [
    ...(CLOUD
      ? [
          {
            to: coursePath(c, 'threads'),
            icon: glyph('💬'),
            label: 'Threads',
            title: unread ? `Threads · ${unread} new` : 'Threads',
            right: unread ? <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-bg text-[10px] font-bold grid place-items-center num">{unread}</span> : undefined,
          },
        ]
      : []),
  ]
}
