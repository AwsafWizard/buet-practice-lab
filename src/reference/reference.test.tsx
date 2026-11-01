import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { roofLL } from '../engine/llr'
import { ps30 } from '../engine/wind'
import { GROUP_ORDER } from './drawer'
import { REF_ITEMS } from './index'
import { matches } from './Panel'
import { PS30_EXAM } from './wind'

describe('code tables drawer', () => {
  it('ids are unique and every group has items', () => {
    expect(new Set(REF_ITEMS.map((i) => i.id)).size).toBe(REF_ITEMS.length)
    for (const g of GROUP_ORDER) expect(REF_ITEMS.some((i) => i.group === g), g).toBe(true)
  })

  for (const it_ of REF_ITEMS)
    it(`renders ${it_.id}`, () => {
      const html = renderToString(<it_.Body />)
      expect(html).not.toContain('NaN')
      expect(html).not.toContain('katex-error')
    })

  it('search finds tables by symbol', () => {
    expect(matches('kzt').map((i) => i.id)).toEqual(['w-kzt'])
    expect(matches('K_LL').map((i) => i.id)).toContain('l-kll')
    expect(matches('sdc').map((i) => i.id)).toEqual(['e-sdc'])
    expect(matches('wind speed').map((i) => i.id)).toEqual(['w-v'])
  })

  // the printed 110/120 mph tables are the 90 mph values scaled by V²; checks the transcription
  it('p_s30 exam tables match V² scaling of the 90 mph row', () => {
    const key = { '0 to 5°': '0-5', '10°': '10', '15°': '15', '20°': '20', '25°': '25', '30 to 45°': '30-45' } as const
    for (const r of PS30_EXAM) {
      const roof = (r.lc === 2 ? `${key[r.roof as keyof typeof key]}-2` : key[r.roof as keyof typeof key]) as Parameters<typeof ps30>[1]
      const scaled = ps30(r.V, roof)
      r.p.forEach((v, i) => {
        if (v === null || Number.isNaN(scaled[i])) return
        expect(Math.abs(v - scaled[i]), `${r.V} mph ${r.roof} LC${r.lc} zone ${i}`).toBeLessThanOrEqual(0.25)
      })
    }
  })
})

describe('roof live-load reduction', () => {
  it('R1 is continuous at both limits (0.011 constant)', () => {
    expect(roofLL({ L0: 1, At: 18.59, F: 0 }).R1).toBeCloseTo(1, 2)
    expect(roofLL({ L0: 1, At: 55.73, F: 0 }).R1).toBeCloseTo(0.587, 2)
    expect(roofLL({ L0: 1, At: 30, F: 3 }).Lr).toBeCloseTo(0.87, 3)
  })
})
