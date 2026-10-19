import { describe, expect, it } from 'vitest'
import { solve, UnstableError } from './frame2d'
import { beam, type Model } from './model'

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)))

describe('frame2d', () => {
  it('simply supported beam with UDL', () => {
    const m = beam([
      { id: 'A', x: 0, support: 'pin' },
      { id: 'B', x: 20, support: 'roller' },
    ])
    m.loads = [{ kind: 'dist', member: 'AB', w1: -2, dir: 'y' }]
    const r = solve(m)
    close(r.reaction('A').ry, 20)
    close(r.reaction('B').ry, 20)
    close(r.member('AB').M(10), 100) // wL^2/8
    close(r.member('AB').V(0), 20)
  })

  it('cantilever with point load + moment', () => {
    const m = beam([
      { id: 'A', x: 0, support: 'fixed' },
      { id: 'B', x: 10 },
    ])
    m.loads = [{ kind: 'node', node: 'B', fy: -5 }]
    const r = solve(m)
    close(r.reaction('A').ry, 5)
    close(r.reaction('A').m, 50)
    close(r.member('AB').M(0), -50)
  })

  it('beam with internal hinge (Gerber beam)', () => {
    // A fixed --- 10 --- H hinge --- 10 --- C roller ; UDL 1 on whole length
    const m = beam([
      { id: 'A', x: 0, support: 'fixed' },
      { id: 'H', x: 10, hinge: true },
      { id: 'C', x: 20, support: 'roller' },
    ])
    m.loads = [
      { kind: 'dist', member: 'AH', w1: -1, dir: 'y' },
      { kind: 'dist', member: 'HC', w1: -1, dir: 'y' },
    ]
    const r = solve(m)
    close(r.reaction('C').ry, 5)
    close(r.reaction('A').ry, 15)
    close(r.reaction('A').m, 100)
  })

  it('simple truss', () => {
    // triangle: A(0,0) pin, B(8,0) roller, C(4,3) load 10 down
    const m: Model = {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 8, y: 0 },
        { id: 'C', x: 4, y: 3 },
      ],
      members: [
        { id: 'AB', i: 'A', j: 'B', truss: true },
        { id: 'AC', i: 'A', j: 'C', truss: true },
        { id: 'BC', i: 'B', j: 'C', truss: true },
      ],
      supports: [
        { node: 'A', type: 'pin' },
        { node: 'B', type: 'roller' },
      ],
      loads: [{ kind: 'node', node: 'C', fy: -10 }],
    }
    const r = solve(m)
    close(r.member('AC').N(1), -25 / 3) // 5 / (3/5)
    close(r.member('AB').N(1), (25 / 3) * 0.8)
  })

  it('portal frame with lateral load reactions balance', () => {
    const m: Model = {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 0, y: 10 },
        { id: 'C', x: 12, y: 10 },
        { id: 'D', x: 12, y: 0 },
      ],
      members: [
        { id: 'AB', i: 'A', j: 'B' },
        { id: 'BC', i: 'B', j: 'C' },
        { id: 'DC', i: 'D', j: 'C' },
      ],
      supports: [
        { node: 'A', type: 'pin' },
        { node: 'D', type: 'roller' },
      ],
      loads: [{ kind: 'node', node: 'B', fx: -5 }],
    }
    const r = solve(m)
    close(r.reaction('A').rx, 5)
    close(r.reaction('D').ry, -50 / 12)
    close(r.reaction('A').ry, 50 / 12)
  })

  it('detects mechanism', () => {
    const m = beam([
      { id: 'A', x: 0, support: 'pin' },
      { id: 'H', x: 5, hinge: true },
      { id: 'B', x: 10, support: 'roller' },
    ])
    m.loads = [{ kind: 'node', node: 'H', fy: -1 }]
    expect(() => solve(m)).toThrow(UnstableError)
  })

  it('inclined roller and inclined member udl projected', () => {
    // inclined simply supported member from (0,0) to (8,6) with vertical load 1/ft horizontal projection
    const m: Model = {
      nodes: [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 8, y: 6 },
      ],
      members: [{ id: 'AB', i: 'A', j: 'B' }],
      supports: [
        { node: 'A', type: 'pin' },
        { node: 'B', type: 'roller', dir: 90 },
      ],
      loads: [{ kind: 'dist', member: 'AB', w1: -1, dir: 'y', proj: true }],
    }
    const r = solve(m)
    close(r.reaction('B').ry, 4)
    close(r.reaction('A').ry, 4)
    close(r.member('AB').M(5), 8) // midspan of horizontal projection: wl^2/8 = 64/8
  })
})
