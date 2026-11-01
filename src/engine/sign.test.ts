import { afterEach, describe, expect, it } from 'vitest'
import { beamOf, Mo, P, pathOf } from '../kit/builders'
import { ildAt, influenceLine } from './ild'
import { setClockwise, rot, rotK, rotWord } from './sign'
import { virtualWork } from './vw'

describe('rotation sign convention', () => {
  afterEach(() => setClockwise(true))
  const m = beamOf('A:0:fixed B:10')
  const fixedM = () => ildAt(influenceLine(m, { kind: 'members', members: pathOf(m) }, { kind: 'reaction', node: 'A', comp: 'm' }), 10)

  it('cantilever wall moment: clockwise + by default, flips with the toggle', () => {
    // unit load at the tip: the wall resists with a 10 k-ft counter-clockwise reaction
    expect(fixedM()).toBeCloseTo(-10)
    setClockwise(false)
    expect(fixedM()).toBeCloseTo(10)
  })

  it('virtual-work rotation follows the unit couple sense', () => {
    const b = { ...beamOf('A:0:pin C:10 B:20:roller'), loads: [P('C', 10)], EI: 1000 }
    const th = () => virtualWork(b, b.loads, [Mo('A', rotK())]).total
    // a sagging simple beam turns clockwise at its left end
    expect(th()).toBeGreaterThan(0)
    expect(rotWord(th())).toBe('clockwise')
    setClockwise(false)
    expect(th()).toBeLessThan(0)
    expect(rotWord(th())).toBe('clockwise')
    expect(rot(5)).toBe(5)
  })
})
