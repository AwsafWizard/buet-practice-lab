import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { typeIColumn } from '../engine/settle'
import { bracket, TypeIWork } from './typei-work'

describe('worked Type I column', () => {
  const r = typeIColumn({ H: 3, C0: 650, data: [45, 60, 77, 96, 148, 213].map((t, i) => ({ t, C: [573, 462, 347, 249, 163, 53][i] })), v0: 0.0477 })
  it('brackets v0 between the 60 and 77 min readings and reproduces the lab answer', () => {
    const b = bracket(r)!
    expect(b.lo.t).toBe(77)
    expect(b.hi.t).toBe(60)
    expect(r.x0).toBeCloseTo(0.674, 3)
    expect(r.R * 100).toBeCloseTo(70.9, 1)
  })
  it('renders without NaN / KaTeX errors, also when v0 is below every reading or above every reading', () => {
    for (const v0 of [0.0477, 0.005, 0.2]) {
      const rr = typeIColumn({ H: 3, C0: 650, data: [45, 60, 77, 96, 148, 213].map((t, i) => ({ t, C: [573, 462, 347, 249, 163, 53][i] })), v0 })
      const html = renderToString(<TypeIWork r={rr} H={3} C0={650} />)
      expect(html, `v0 ${v0}`).not.toMatch(/NaN|undefined|Infinity|katex-error/)
    }
  })
})
