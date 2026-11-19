import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { hammerRise } from '../engine/hammer'
import { HammerSketch, hammerPath } from './rm-hammer-sketch'

describe('idealised water-hammer sketch', () => {
  it('rapid closure swings between +ΔH and −ΔH; slow closure holds the Michaud rise', () => {
    const h = hammerRise({ L: 1000, a: 1000, dv: 2, T: 0.5 })
    const ys = hammerPath(h, 0.5).map((p) => p[1])
    expect(Math.max(...ys)).toBeCloseTo(h.dH, 9)
    expect(Math.min(...ys)).toBeCloseTo(-h.dH, 9)
    const hs = hammerRise({ L: 1000, a: 1000, dv: 2, T: 10 })
    expect(hs.rapid).toBe(false)
    expect(Math.max(...hammerPath(hs, 10).map((p) => p[1]))).toBeCloseTo(hs.dH, 9)
  })
  it('renders without NaN', () => {
    for (const T of [0.5, 2, 10]) {
      const html = renderToString(<HammerSketch h={hammerRise({ L: 1000, a: 1000, dv: 2, T })} T={T} />)
      expect(html).not.toMatch(/NaN|undefined|Infinity|katex-error/)
    }
  })
})
