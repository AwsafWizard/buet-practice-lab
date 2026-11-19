import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { EV_TOPICS } from '../registry'
import { evMatches } from '../components/RefPanel'
import { EV_REF_ITEMS } from './index'
import { EV_GROUP_ORDER, EV_TOPIC_GROUP, groupOfEvRef } from './pane'

describe('CE 331 chart & method pane', () => {
  it('ids are unique, prefixed by their group, and every group has items', () => {
    expect(new Set(EV_REF_ITEMS.map((i) => i.id)).size).toBe(EV_REF_ITEMS.length)
    for (const it of EV_REF_ITEMS) expect(groupOfEvRef(it.id), it.id).toBe(it.group)
    for (const g of EV_GROUP_ORDER) expect(EV_REF_ITEMS.some((i) => i.group === g), g).toBe(true)
  })

  it('every topic opens on a group', () => {
    for (const t of EV_TOPICS) expect(EV_TOPIC_GROUP[t.id], t.id).toBeDefined()
  })

  for (const it_ of EV_REF_ITEMS)
    it(`renders ${it_.id}`, () => {
      const html = renderToString(<it_.Body />)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).not.toContain('katex-error')
    })

  it('every method links to charts that exist', () => {
    const ids = new Set(EV_REF_ITEMS.map((i) => i.id))
    for (const it of EV_REF_ITEMS.filter((i) => i.group === 'steps'))
      for (const [, ref] of renderToString(<it.Body />).matchAll(/data-ref="([^"]+)"/g)) expect(ids.has(ref), `${it.id} → ${ref}`).toBe(true)
  })

  it('search finds items by symbol', () => {
    expect(evMatches('caco3').map((i) => i.id)).toContain('c-caco3')
    expect(evMatches('henry').map((i) => i.id)).toContain('c-henry')
  })
})
