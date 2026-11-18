import { describe, expect, it } from 'vitest'
import { aerationK, aerationTime } from './aeration'

describe('aeration (TA T04)', () => {
  it('T04-A: a = 1/3, K_L = 0.03 m/h → 255 h (class 258 with a = 0.33)', () => {
    expect(aerationTime({ C0: 1.5, Ct: 8.5, Cs: 9.09, Ka: 0.03 / 3 })).toBeCloseTo(255, -1)
    expect(aerationTime({ C0: 1.5, Ct: 8.5, Cs: 9.09, Ka: 0.03 * 0.33 })).toBeCloseTo(258, -1)
  })
  it('T04-B: K = 0.2137 s⁻¹, 10.4 s to 8.2 mg/L', () => {
    const K = aerationK({ C0: 0, Ct: 3.2, Cs: 9.2, t: 2 })
    expect(K).toBeCloseTo(0.2137, 3)
    expect(aerationTime({ C0: 0, Ct: 8.2, Cs: 9.2, Ka: K })).toBeCloseTo(10.4, 0)
  })
})
