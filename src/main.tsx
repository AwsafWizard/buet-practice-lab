import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { PointTip } from './components/PointTip'
import './styles.css'
import { ARTIFACT, startSync } from './sync'
import { startCloud } from './cloud'
import { startTimer } from './timer'

// Artifact build: routes live in memory, so remember the last page across reloads
const LAST = 'ce311:lastRoute'
function lastRoute() {
  try {
    return localStorage.getItem(LAST) || '/'
  } catch {
    return '/'
  }
}
function RememberRoute() {
  const loc = useLocation()
  useEffect(() => {
    try {
      localStorage.setItem(LAST, loc.pathname + loc.search)
    } catch {
      /* storage blocked */
    }
  }, [loc])
  return null
}

// Public site only: Vercel Web Analytics (no cookies). The site routes by hash
// (/#/ce341/...), which Vercel ignores, so report the hash route as the page.
const PUBLIC = import.meta.env.MODE === 'public'
function Visits() {
  const { pathname } = useLocation()
  return (
    <Analytics
      route={pathname}
      path={pathname}
      beforeSend={(e) => {
        const u = new URL(e.url)
        if (u.hash.startsWith('#/')) {
          u.pathname = u.hash.slice(1).split('?')[0]
          u.hash = ''
        }
        return { ...e, url: u.toString() }
      }}
    />
  )
}

// A plain path like /ce301 (served by the vercel.json rewrite) becomes the hash route /#/ce301.
if (!ARTIFACT && location.pathname !== '/' && !location.hash)
  history.replaceState(null, '', '/#' + location.pathname + location.search)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {ARTIFACT ? (
      <MemoryRouter initialEntries={[lastRoute()]}>
        <RememberRoute />
        <App />
      </MemoryRouter>
    ) : (
      <HashRouter>
        {PUBLIC && <Visits />}
        <App />
      </HashRouter>
    )}
    <PointTip />
  </StrictMode>,
)

startTimer()
void startSync()
void startCloud()
