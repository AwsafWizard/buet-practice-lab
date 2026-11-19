import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WellSketch } from './sn-well-sketch'

describe('labelled well sketch', () => {
  it('renders the unconfined, confined and observation-well cases without NaN', () => {
    const cases = [
      <WellSketch key="u" kind="unconfined" unit="m" rw={0.15} R={1000} D={100} d={80} s={20} />,
      <WellSketch key="c" kind="confined" unit="m" rw={0.075} R={950} b={35} s={7.5} />,
      <WellSketch key="o" kind="confined" unit="m" rw={0.2} b={2.5} obs={[{ r: 8, s: 2.5 }, { r: 50, s: 0.6 }]} />,
      <WellSketch key="h" kind="unconfined" unit="m" rw={0.1} R={120} D={50} d={40} s={10} obs={[{ r: 7.5, h: 47 }]} />,
    ]
    for (const el of cases) {
      const html = renderToString(el)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('r = ')
    }
  })
})
