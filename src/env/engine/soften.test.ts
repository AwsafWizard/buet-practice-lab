import { describe, expect, it } from 'vitest'
import { analyse, bars, bypassForHardness, masses, slideExcess, splitTreatment, treat, waterFromIons } from './soften'

const sheet = waterFromIons({ co2: 5.5, ca: 95.2, mg: 22, na: 25.8, cl: 67.8, so4: 73, alkCaCO3: 198 })

describe('soften (TA T07 oracles)', () => {
  it('split-treatment sheet: complete lime 301.1, soda 130.6; selective lime 210.5', () => {
    const c = treat(sheet, { mode: 'complete' })
    expect(c.lime).toBeCloseTo(301.1, 0)
    expect(c.soda).toBeCloseTo(130.6, 0)
    expect(treat(sheet, { mode: 'selective' }).lime).toBeCloseTo(210.5, 0)
  })
  it('split-treatment sheet: X 0.372, lime 267.4, soda 82, blended 147.4 > 120 → second stage', () => {
    const s = splitTreatment(sheet, { mgFinal: 40, thMax: 120 })
    expect(s.X).toBeCloseTo(0.372, 3)
    expect(s.treated).toBeCloseTo(0.628, 3)
    expect(s.blended).toBeCloseTo(147.4, 0)
    expect(s.secondNeeded).toBe(true)
    expect(s.lime).toBeCloseTo(267.4, 0)
    expect(s.soda).toBeCloseTo(82, 0)
    // the notes stop here; our second stage drops the Ca carbonate hardness of the bypassed part to the practical 30: Ca 40+30, Mg 90.6
    expect(s.finalTH).toBeCloseTo(0.372 * (70 + 90.6) + 0.628 * 40, 0)
  })
  it('T07-A: selective Ca removal lime = 15 + 164 = 179; CaO at 90 % ≈ 111', () => {
    const w = waterFromIons({ co2: 6.6, ca: 80, mg: 8.5, hco3: 200, so4: 73 })
    const t = treat(w, { mode: 'selective' })
    expect(t.lime).toBeCloseTo(179, 0)
    expect(masses(t.lime, 0, 0.9).CaO).toBeCloseTo(111.4, 0)
    expect(analyse(w).caNch).toBeCloseTo(36, 0)
  })
  it('T07-B: practical limits, lime 275.4, soda 95.6 (no excess); with 40 excess 315.4', () => {
    const w = waterFromIons({ co2: 9.6, ca: 95.2, mg: 13.5, na: 25.8, cl: 67.8, so4: 73, alkCaCO3: 198 })
    const t = treat(w, { mode: 'complete' })
    expect(t.lime).toBeCloseTo(275.4, 0)
    expect(t.soda).toBeCloseTo(95.6, 0)
    expect(slideExcess(w, 'complete')).toBe(40)
    expect(slideExcess({ ...w, mg: 30 }, 'complete')).toBe(20)
  })
  it('2017-18 Q4(b): X = 0.373, no second stage, lime 160, soda 55', () => {
    const w = waterFromIons({ co2: 11, ca: 55, mg: 22, na: 15, cl: 70, so4: 21.2, alkCaCO3: 140 })
    const s = splitTreatment(w, { mgFinal: 40, thMax: 120 })
    expect(s.X).toBeCloseTo(0.373, 2)
    expect(s.blended).toBeCloseTo(110.1, 0)
    expect(s.secondNeeded).toBe(false)
    expect(s.lime).toBeCloseTo(160.3, 0)
    expect(s.soda).toBeCloseTo(55.2, 0)
  })
  it('2022-23 Q4(a): X 0.312, blended 118.5, lime 184.8, soda 75.4', () => {
    const w = waterFromIons({ co2: 5.5, ca: 87, mg: 18, na: 24, cl: 65, so4: 68, alkCaCO3: 182 })
    const s = splitTreatment(w, { mgFinal: 30, thMax: 120 })
    expect(s.X).toBeCloseTo(0.312, 2)
    expect(s.blended).toBeCloseTo(118.5, 0)
    expect(s.secondNeeded).toBe(false)
    expect(s.lime).toBeCloseTo(184.8, 0)
    expect(s.soda).toBeCloseTo(75.4, 0)
  })
  it('2023-24 Q2(c): X 0.171, TH 108, lime 418, soda 118; CaO at 87 % ≈ 269', () => {
    const w = waterFromIons({ co2: 9, ca: 102, mg: 45, hco3: 364, so4: 138 })
    const s = splitTreatment(w, { mgFinal: 40, thMax: 120 })
    expect(s.X).toBeCloseTo(0.171, 2)
    expect(s.finalTH).toBeCloseTo(108.5, 0)
    expect(s.lime).toBeCloseTo(418, 0)
    expect(s.soda).toBeCloseTo(117.7, 0)
    expect(masses(s.lime, s.soda, 0.87, 0.97).CaO).toBeCloseTo(269, 0)
  })
  it('2021-22 Q4(a) bars balance and finished hardness is 40 (complete)', () => {
    const w = waterFromIons({ co2: 4.6, ca: 0, mg: 0, so4: 0 })
    const raw = { co2: 4.6, ca: 257.9, mg: 22.2, na: 0, cl: 0, so4: 32.1, alk: 248 }
    const sel = treat(raw, { mode: 'selective' })
    expect(sel.lime).toBeCloseTo(252.6, 1)
    const full = treat(raw, { mode: 'complete' })
    expect(full.lime).toBeCloseTo(274.8, 1)
    expect(full.soda).toBeCloseTo(32.1, 1)
    expect(full.final.th).toBe(40)
    expect(full.after.alk).toBeCloseTo(40, 5)
    const b = bars(full.final)
    expect(b.cations[b.cations.length - 1].to).toBeCloseTo(72.1, 1)
    void w
  })
  it('bypass for a hardness target: 295 → 60 needs 7.8 %', () => {
    expect(bypassForHardness(295, 60)).toBeCloseTo(0.0784, 3)
  })
})
