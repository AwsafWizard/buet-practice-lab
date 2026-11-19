import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { decreasing, geometric, polyFit, type Census } from '../engine/population'
import { decrMd, geomMd, lsMd } from '../pyq/sn-math'
import { Md } from '../../components/ui'
import { PopWorkChart } from './sn-pop-work'

const BAD = /NaN|undefined|Infinity|katex-error/

describe('worked population forecast', () => {
  const c: Census[] = [25, 28.5, 39, 54, 75].map((p, i) => ({ year: 1970 + 10 * i, pop: p }))
  it('draws census, curves and forecasts without NaN', () => {
    const html = renderToString(<PopWorkChart c={c} curves={[{ label: 'geometric', at: geometric(c).at }, { label: 'decreasing', at: decreasing(c).at }]} targets={[2020, 2030]} unit="million" />)
    expect(html).not.toMatch(BAD)
    expect(html).toContain('<svg')
  })
  it('the method write-ups render (incl. a rising growth rate, s < 0)', () => {
    const rising: Census[] = [8, 12, 19, 30, 47].map((p, i) => ({ year: 1980 + 10 * i, pop: p }))
    for (const cc of [c, rising]) {
      const md = [geomMd(cc, [2030, 2040], 'thousand', 1).md, decrMd(cc, [2030, 2040], 'thousand', 1).md, lsMd(cc, [2030, 2040], 'thousand').md].join('\n\n')
      expect(renderToString(<Md>{md}</Md>)).not.toMatch(BAD)
    }
  })
  it('the parabola working reproduces the engine coefficients', () => {
    const f = polyFit(c, 2)
    const md = lsMd(c, [2030], 'million').md
    expect(md).toContain(`b=\\dfrac{\\Sigma xY}{\\Sigma x^2}`)
    expect(md).toContain(f.coef[2].toFixed(3))
  })
})
