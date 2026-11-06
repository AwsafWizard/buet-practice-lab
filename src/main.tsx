import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter, useLocation } from 'react-router-dom'
import App from './App'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {ARTIFACT ? (
      <MemoryRouter initialEntries={[lastRoute()]}>
        <RememberRoute />
        <App />
      </MemoryRouter>
    ) : (
      <HashRouter>
        <App />
      </HashRouter>
    )}
  </StrictMode>,
)

startTimer()
void startSync()
void startCloud()
