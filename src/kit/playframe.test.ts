import { describe, expect, it } from 'vitest'
import { analyseFrame, type PlayFrame } from './playframe'

const base: PlayFrame = { xs: [0, 20], heights: [12], loads: [10], base: 'fixed', areas: [1, 1], beamStiff: 1 }

describe('lateral-load playground', () => {
  it('symmetric portal: exact column shears equal the portal split', () => {
    const a = analyseFrame(base, 'portal')
    for (const c of a.cols) {
      expect(c.approx.V).toBeCloseTo(5)
      expect(c.exact.V).toBeCloseTo(5, 1)
    }
  })

  it('exact storey shear adds up to the applied load (either direction)', () => {
    for (const P of [10, -16]) {
      const a = analyseFrame({ ...base, xs: [0, 15, 35], heights: [14, 12], loads: [P, P / 2] }, 'portal')
      for (const s of [0, 1]) {
        const sum = a.cols.filter((c) => c.storey === s).reduce((acc, c) => acc + c.exact.V, 0)
        expect(Math.abs(sum)).toBeCloseTo(Math.abs(s === 0 ? 1.5 * P : P / 2), 4)
        expect(sum).toBeGreaterThan(0) // reported in the storey-shear sense
      }
    }
  })

  it('stiffer beams push the exact inflection point to mid-height', () => {
    const soft = analyseFrame({ ...base, beamStiff: 0.2 }, 'portal').cols[0].exact.z!
    const stiff = analyseFrame({ ...base, beamStiff: 100 }, 'portal').cols[0].exact.z!
    expect(Math.abs(stiff - 6)).toBeLessThan(Math.abs(soft - 6))
    expect(stiff).toBeCloseTo(6, 0)
  })

  it('pinned base: the inflection point sits at the base', () => {
    const a = analyseFrame({ ...base, base: 'pinned' }, 'portal')
    expect(a.cols[0].z0).toBe(0)
    expect(a.cols[0].exact.z).toBeCloseTo(0)
  })

  it('cantilever method axial forces have the exact sign (windward column in tension)', () => {
    const a = analyseFrame({ ...base, xs: [0, 24, 40], heights: [14, 12], loads: [30, 15], areas: [1, 2, 1] }, 'cantilever')
    const left = a.cols.find((c) => c.storey === 0 && c.col === 0)!
    expect(left.approx.N).toBeGreaterThan(0)
    expect(left.exact.N).toBeGreaterThan(0)
  })
})
