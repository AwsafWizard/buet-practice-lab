import { describe, expect, it } from 'vitest'
import { alkConsumed, alkShortfall, alumNoAlkalinity, powerForG, velocityGradient } from './coag'

describe('coag (TA T06 oracles)', () => {
  it('alum: 0.505 mg alkalinity per mg; T06-A 12 mg/L → 6.1 mg/L as CaCO3', () => {
    expect(alkConsumed('alum', 1).perMg).toBeCloseTo(0.505, 3)
    expect(alkConsumed('alum', 12).alk).toBeCloseTo(6.06, 1)
    expect(alkConsumed('alum18', 1).perMg).toBeCloseTo(0.45, 2)
  })
  it('2020-21 Q8(c): FeCl3 28 mg/L → 25.9 mg/L as CaCO3', () => {
    const a = alkConsumed('fecl3', 28)
    expect(a.alk).toBeCloseTo(25.9, 1)
    expect(a.perMg).toBeCloseTo(0.925, 2)
  })
  it('T06-B: 100 mg/L alum, no alkalinity → pH 3.0, NaOH 40 mg/L', () => {
    const r = alumNoAlkalinity({ dose: 100 })
    expect(r.pH).toBeCloseTo(3.0, 1)
    expect(r.naohMgL).toBeCloseTo(40.4, 0)
  })
  it('shortfall: 50 mg/L alum needs 25 as CaCO3; alkalinity 10 → 15 short = 11 Ca(OH)2', () => {
    const s = alkShortfall({ id: 'alum', dose: 50, alk: 10 })
    expect(s.short).toBeCloseTo(15.2, 0)
    expect(s.lime).toBeCloseTo(11.2, 0)
  })
  it('G round trip', () => {
    expect(velocityGradient(powerForG(50, 1.002e-3, 100), 1.002e-3, 100)).toBeCloseTo(50, 8)
  })
})
