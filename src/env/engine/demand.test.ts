import { describe, expect, it } from 'vitest'
import { economicTank, fireDemand, fireFlowGpm, fireStreams, peakHourly, pitotGpm, weightedDemand } from './demand'

describe('demand (SN L2 / L5 oracles)', () => {
  const mix = [
    { label: 'A1 SFD full', frac: 0.05, lpcd: 260 },
    { label: 'A3 apt full', frac: 0.1, lpcd: 200 },
    { label: 'Y1 colony', frac: 0.25, lpcd: 135 },
    { label: 'Y2 small', frac: 0.3, lpcd: 120 },
    { label: 'Z1 shed', frac: 0.15, lpcd: 80 },
    { label: 'Z3 common', frac: 0.15, lpcd: 50 },
  ]
  it('Example 1: 122.25 lpcd, 15.28 MLD (slide rounds to 15.30), high 27 %, low 16 %', () => {
    const d = weightedDemand(125000, mix)
    expect(d.lpcd).toBeCloseTo(122.25, 6)
    expect(d.MLD).toBeCloseTo(15.28125, 6)
    expect(d.share((r) => r.label.includes('A'))).toBeCloseTo(26.99, 1)
    expect(d.share((r) => r.label.startsWith('Z'))).toBeCloseTo(15.95, 1)
  })
  it('losses are added to the net demand', () => {
    expect(weightedDemand(1000, [{ label: 'x', frac: 1, lpcd: 100 }], 0.2).grossLpd).toBeCloseTo(120000, 6)
  })
  it('L5 worked demand: ADC/24 = 62,125 L/h; residential PF 2.5 → 155,312.5; industrial 1.4 × 1.5; school 4 × 4', () => {
    const adc = 12425 * 120
    expect(peakHourly(adc, 2.5).avgHour).toBeCloseTo(62125, 6)
    expect(peakHourly(adc, 2.5).peak).toBeCloseTo(155312.5, 6)
    expect(peakHourly(adc, 1.4, 16).peak).toBeCloseTo(130462.5, 6)
    expect(peakHourly(adc, 4, 6).peak).toBeCloseTo(994000, 6)
    expect(peakHourly(adc, 1.4, 16, true).tf).toBe(1) // reservoir present → no time factor
  })
  it('Pitot: 2,416 gpm at 100 psi, 3,820 gpm at 250 psi', () => {
    expect(pitotGpm(100)).toBeCloseTo(2416.2, 1)
    expect(pitotGpm(250)).toBeCloseTo(3820.3, 0)
  })
  it('fire formulas at P = 100 thousand', () => {
    expect(fireFlowGpm('kuichling', 100)).toBeCloseTo(31820, 6)
    expect(fireFlowGpm('freeman', 100)).toBeCloseTo(1021 * 30, 6)
    expect(fireFlowGpm('nbfu', 100)).toBeCloseTo(1020 * 10 * 0.9, 6)
    expect(fireFlowGpm('buston', 100)).toBeCloseTo(56630 / 3.78541, 3)
  })
  it('streams N = 2.8 √P rounded up (seniors: 64 → 22.4 → 23; 338 → 51.48 → 52)', () => {
    expect(fireStreams(64).n).toBe(23)
    expect(fireStreams(338).n).toBe(52)
    expect(fireStreams(164).n).toBe(36)
    expect(fireStreams(10).n).toBe(9)
  })
  it('seniors’ Q = 700 √P gpm is N × 250 gpm before rounding N', () => {
    expect(2.8 * Math.sqrt(338) * 250).toBeCloseTo(12869.3, 1)
  })
  it('2022-23 Q6(b): 65,000 → 23 streams × 950 L/min = 21,850 L/min; 5 h = 6,555 m³', () => {
    const f = fireDemand(65, 5)
    expect(f.streams.n).toBe(23)
    expect(f.streamFlowLpm).toBe(21850)
    expect(f.storageL).toBeCloseTo(6.555e6, 0)
  })
  it('economic tank: floor Tk200, wall Tk250 → D³ = 10V/π, H = 0.4 D', () => {
    const t = economicTank(1000, 200, 250)
    expect(t.D).toBeCloseTo(Math.cbrt(10000 / Math.PI), 8)
    // no other diameter is cheaper
    const c = (D: number) => 200 * Math.PI * D * D / 4 + 250 * Math.PI * D * (4000 / (Math.PI * D * D))
    expect(c(t.D)).toBeLessThanOrEqual(c(t.D * 1.05))
    expect(c(t.D)).toBeLessThanOrEqual(c(t.D * 0.95))
    expect(t.H / t.D).toBeCloseTo(200 / (2 * 250), 8) // H/D = cf/(2 cw)
  })
})
