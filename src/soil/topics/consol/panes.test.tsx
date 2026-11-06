import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// pane bodies read the lab highlights through useSyncExternalStore (client only): stub it for server rendering
vi.mock('../../reference/pane', async (orig) => ({ ...(await orig<typeof import('../../reference/pane')>()), useUsed: () => undefined }))

describe('chart-pane bodies (k-, d-) render without NaN', async () => {
  const { CON_ITEMS } = await import('../../reference/con')
  const { SD_ITEMS } = await import('../../reference/sd')
  for (const it_ of [...CON_ITEMS, ...SD_ITEMS])
    it(it_.id, () => {
      const html = renderToString(<it_.Body />)
      expect(html).not.toMatch(/NaN|Infinity/)
    })
})
