import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { interp, operatingPoint, parallel, series } from '../engine/pump'
import { OpDutyWork, opBracket } from './rm-oppoint'

// 2012-13 Q1(b) tables
const p = interp([[0, 40], [0.02, 39], [0.04, 36], [0.06, 29], [0.08, 20], [0.1, 8]])
const smin = interp([[0, 30], [0.02, 32], [0.04, 34], [0.06, 37], [0.08, 40], [0.1, 44]])
const smax = (Q: number) => smin(Q) + 2
const k1 = [0, 0.02, 0.04, 0.06, 0.08, 0.1]
const kPar = Array.from({ length: 11 }, (_, i) => i * 0.02)

describe('worked pump operating point', () => {
  it('the bracket interpolation agrees with the engine for one pump, parallel and series at both levels', () => {
    for (const [duty, knots, hi] of [[p, k1, 0.1], [parallel(p), kPar, 0.2], [series(p), k1, 0.1]] as const) {
      for (const sys of [smin, smax]) {
        const op = operatingPoint(duty, sys, 0, hi)!
        const b = opBracket(duty, sys, [...knots])!
        expect(b.Q).toBeCloseTo(op.Q, 6)
        expect(b.H).toBeCloseTo(op.H, 6)
        expect(b.Q1).toBeLessThanOrEqual(op.Q + 1e-9)
        expect(b.Q2).toBeGreaterThanOrEqual(op.Q - 1e-9)
      }
    }
  })
  it('renders without NaN / KaTeX errors', () => {
    const html = renderToString(
      <OpDutyWork
        duty={parallel(p)}
        dutyName="Two in parallel"
        lines={[
          { sys: smin, op: operatingPoint(parallel(p), smin, 0, 0.2)!, name: 'Min level', color: 'var(--c-ink)' },
          { sys: smax, op: operatingPoint(parallel(p), smax, 0, 0.2)!, name: 'Max level', color: 'var(--c-bad)' },
        ]}
        knots={kPar}
        qMax={0.2}
        hMax={50}
        why="test"
      />,
    )
    expect(html).not.toMatch(/NaN|undefined|Infinity|katex-error/)
  })
})
