import { describe, expect, it } from 'vitest'
import {
  cfsToLph,
  chooseZone,
  designDtw,
  designFromSieve,
  dAt,
  gradationStats,
  handPumpChoice,
  housingPipe,
  openFraction,
  packFactor,
  packFactorExact,
  rateLayer,
  screenShare,
  screenYield,
  sieveTable,
  slotChoice,
  wellsNeeded,
  entranceVelocity,
  curveOf,
  curveFromD,
  dtwChecks,
  type Layer,
} from './dtw'

// digest oracle: L4a Example 1 (SWL 200 ft, aquifer to 660 ft)
const EX1: Layer[] = [
  { top: 0, bot: 160, kind: 'clay', label: 'overburden' },
  { top: 160, bot: 220, fm: 0.88, d60: 0.22, d10: 0.1, cu: 2.2 },
  { top: 220, bot: 260, fm: 1.01, d60: 0.24, d10: 0.06, cu: 4.0 },
  { top: 260, bot: 300, fm: 1.69, d60: 0.36, d10: 0.2, cu: 1.8 },
  { top: 300, bot: 360, fm: 0.93, d60: 0.23, d10: 0.09, cu: 2.56 },
  { top: 360, bot: 430, fm: 1.11, d60: 0.25, d10: 0.1, cu: 2.5 },
  { top: 430, bot: 490, fm: 1.73, d60: 0.4, d10: 0.17, cu: 2.35 },
  { top: 490, bot: 530, fm: 1.62, d60: 0.37, d10: 0.17, cu: 2.18, d30: 0.25 },
  { top: 530, bot: 590, fm: 2.23, d60: 0.53, d10: 0.34, cu: 1.56 },
  { top: 590, bot: 610, fm: 2.08, d60: 0.48, d10: 0.25, cu: 1.92 },
  { top: 610, bot: 660, fm: 1.25, d60: 0.27, d10: 0.15, cu: 1.8 },
]

// Chandpur 2023-24 Q5(b)
const CHANDPUR: Layer[] = [
  { top: 200, bot: 400, kind: 'clay' },
  { top: 400, bot: 550, fm: 1.12, d60: 0.27, d10: 0.14, cu: 1.59, exclude: 'shallow, saline' },
  { top: 550, bot: 640, fm: 1.34, d60: 0.3, d10: 0.17, cu: 1.76, exclude: 'shallow, saline' },
  { top: 640, bot: 740, fm: 0.67, d60: 0.2, d10: 0.09, cu: 2.22, exclude: 'shallow, saline' },
  { top: 740, bot: 880, kind: 'clay' },
  { top: 880, bot: 930, fm: 1.28, d60: 0.28, d10: 0.16, cu: 1.75 },
  { top: 930, bot: 1020, fm: 1.38, d60: 0.31, d10: 0.18, cu: 1.72 },
  { top: 1020, bot: 1090, fm: 0.73, d60: 0.23, d10: 0.13, cu: 1.77 },
  { top: 1090, bot: 1150, kind: 'clay' },
]

describe('gradation curve (digest sample sieve table)', () => {
  // % finer as printed in the slide's sample table
  const pts = curveOf([
    { size: 4.75, finer: 100 }, { size: 2.36, finer: 100 }, { size: 1.18, finer: 93 }, { size: 0.6, finer: 67 },
    { size: 0.425, finer: 28 }, { size: 0.3, finer: 11 }, { size: 0.15, finer: 1 }, { size: 0.075, finer: 0 },
  ])
  it('D10, D60, Cu, FM = 0.279, 0.564, 2.02, 2.28', () => {
    const s = gradationStats(pts)
    // the slide truncates 0.2799 to 0.279; the exact value is 0.280
    expect(dAt(pts, 10).d).toBeCloseTo(0.28, 3)
    expect(dAt(pts, 60).d).toBeCloseTo(0.564, 3)
    expect(s.cu).toBeCloseTo(2.02, 1)
    expect(s.fm).toBeCloseTo(2.28, 2)
  })
  it('sieveTable turns weights into % finer', () => {
    const t = sieveTable([{ no: '30', size: 0.6, retained: 0.5 }, { no: '40', size: 0.425, retained: 1 }, { no: '50', size: 0.3, retained: 4.4 }, { no: '100', size: 0.15, retained: 64.8 }, { no: '200', size: 0.075, retained: 27.1 }], 2.2)
    expect(t.total).toBeCloseTo(100, 6)
    expect(t.rows.map((x) => +x.finer.toFixed(1))).toEqual([99.5, 98.5, 94.1, 29.3, 2.2])
  })
})

describe('Example 1: DTW design (SWL 200 ft)', () => {
  const d = designDtw({ layers: EX1, housing: { swl: 200 }, strainerDia: 6, packThickness: 8, material: 'steel', fb: 2.5 })
  it('housing pipe 270 ft', () => expect(d.housing.length).toBe(270))
  it('screen zone starts at 430 ft: layers 1-5 rejected', () => {
    expect([1, 2, 4, 5].every((i) => !d.layers[i].usable)).toBe(true)
    expect(d.zone?.top).toBe(430)
    expect(d.zone?.bot).toBe(660)
    expect(d.avail).toBe(230)
  })
  it('screen length 184 ft by the 80 % rule, 100 ft chosen', () => {
    expect(d.lenByShare).toBeCloseTo(184, 6)
    expect(d.length).toBe(100)
  })
  it('strainer 440-540, sand trap 540-550, blind pipe 270-440, pack from 400', () => {
    expect(d.strainer).toEqual({ top: 440, bot: 540 })
    expect(d.trap).toEqual({ top: 540, bot: 550 })
    expect(d.blind).toEqual({ top: 270, bot: 440 })
    expect(d.packRange).toEqual({ top: 400, bot: 550 })
  })
  it('finest layer is 490-530 (FM 1.62, Cu 2.18); factor 5.36 -> 5', () => {
    expect(d.finest?.fm).toBe(1.62)
    expect(d.factorExact).toBeCloseTo(5.36, 2)
    expect(d.factor).toBe(5)
  })
  it('pack D30 = 1.25 mm, D10 = 0.85 mm, slot 33.5 -> 30', () => {
    expect(d.pack.d30).toBeCloseTo(1.25, 6)
    expect(d.pack.d10).toBeCloseTo(0.85, 6)
    expect(d.pack.cu).toBeLessThanOrEqual(2.5)
    expect(d.slot.raw).toBeCloseTo(33.46, 1)
    expect(d.slot.slot).toBe(30)
  })
  it('borehole 22 in; open area 15 %', () => {
    expect(d.boreholeDia).toBe(22)
    expect(d.eta).toBe(0.15)
  })
  it('yield 0.942 cusec = ~96,000 lph; 768,000 lpd in 8 h', () => {
    expect(d.yield.cfs).toBeCloseTo(0.942, 3)
    expect(d.yield.lph).toBeGreaterThan(96000 * 0.999)
    expect(d.yield.lph).toBeLessThan(96100 * 1.001)
    expect(Math.round(d.yield.lph / 1000) * 1000 * 8).toBe(768000)
    expect(d.warnings).toEqual([])
  })
  it('housing with the class tip F_B = 3 gives 0.785 cusec', () => {
    expect(designDtw({ layers: EX1, housing: { swl: 200 }, strainerDia: 6, packThickness: 8 }).yield.cfs).toBeCloseTo(0.7854, 3)
  })
})

describe('the Maths-notes version (SWL 360 ft)', () => {
  it('housing 430 ft and the same strainer 440-540', () => {
    const d = designDtw({ layers: EX1, housing: { swl: 360 }, strainerDia: 6, packThickness: 8, fb: 2.5 })
    expect(d.housing.length).toBe(430)
    expect(d.strainer).toEqual({ top: 440, bot: 540 })
  })
})

describe('Chandpur 2023-24 Q5(b) (past-paper solution typed by her)', () => {
  const d = designDtw({
    layers: CHANDPUR,
    housing: { swl: 80 },
    strainerDia: 8,
    material: 'uPVC',
    packThickness: 8,
    pack: { d60: 1.35, d30: 1.0, d10: 0.7 },
    fb: 2.5,
    placement: 'centre',
    packAbove: 50,
  })
  it('housing 150 ft', () => expect(d.housing.length).toBe(150))
  it('zone 880-1020 = 140 ft, 80 % = 112 ft -> 100 ft', () => {
    expect(d.zone).toMatchObject({ top: 880, bot: 1020 })
    expect(d.avail).toBe(140)
    expect(d.lenByShare).toBeCloseTo(112, 6)
    expect(d.length).toBe(100)
  })
  it('slot 27.55 -> 20; uPVC opening 5 %', () => {
    expect(d.slot.raw).toBeCloseTo(27.56, 2)
    expect(d.slot.slot).toBe(20)
    expect(d.eta).toBeCloseTo(0.05, 9)
  })
  it('strainer 900-1000, pack from 850, 0.4188 cusec = ~42,700 lph', () => {
    expect(d.strainer).toEqual({ top: 900, bot: 1000 })
    expect(d.packRange.top).toBe(850)
    expect(d.yield.cfs).toBeCloseTo(0.4188, 3)
    expect(d.yield.lph).toBeGreaterThan(42600)
    expect(d.yield.lph).toBeLessThan(42800)
  })
})

describe('rules', () => {
  it('pack factor 4 / 6 / linear', () => {
    expect(packFactorExact(1.4)).toBe(4)
    expect(packFactorExact(2.5)).toBe(6)
    expect(packFactorExact(2)).toBe(5)
    expect(packFactor(2.18)).toBe(5)
  })
  it('screen share 70 / 75 / 80 %', () => {
    expect([screenShare(20), screenShare(40), screenShare(60)]).toEqual([0.7, 0.75, 0.8])
  })
  it('open area: steel 20/15/10, uPVC half', () => {
    expect(openFraction(40)).toBe(0.2)
    expect(openFraction(30, 'uPVC')).toBe(0.075)
    expect(openFraction(20, 'uPVC')).toBe(0.05)
  })
  it('slot rounds down', () => {
    expect(slotChoice(0.85).slot).toBe(30)
    expect(slotChoice(0.7).slot).toBe(20)
    expect(slotChoice(0.2).tooFine).toBe(true)
  })
  it('layer rating', () => {
    expect(rateLayer({ top: 0, bot: 1, fm: 0.9, d10: 0.1, d60: 0.2 }).cls).toBe('fine')
    expect(rateLayer({ top: 0, bot: 1, fm: 1.3, d10: 0.1, d60: 0.3 }).cls).toBe('nonuniform')
    expect(rateLayer({ top: 0, bot: 1, fm: 1.3, d10: 0.1, d60: 0.25 }).cls).toBe('borderline')
    expect(rateLayer({ top: 0, bot: 1, fm: 1.3, d10: 0.1, d60: 0.2 }).usable).toBe(true)
  })
  it('chooseZone clips to the housing bottom', () => {
    const z = chooseZone(EX1.map(rateLayer), 270)
    expect(z?.top).toBe(430)
    expect(chooseZone([rateLayer({ top: 180, bot: 350, fm: 1.4, d10: 0.14, d60: 0.31 })], 220)).toMatchObject({ top: 220, bot: 350, topIsInterface: false })
  })
  it('housing pipe', () => expect(housingPipe({ swl: 80, bowlOD: 12 })).toMatchObject({ length: 150, id: 14 }))
  it('entrance velocity at the design yield is 0.1 / F_B', () => {
    const y = screenYield({ eta: 0.15, dIn: 6, L: 100, fb: 2.5 })
    expect(entranceVelocity(y.cfs, 0.15, 6, 100)).toBeCloseTo(0.04, 6)
    expect(entranceVelocity(y.cfs, 0.15, 6, 100, 2.5)).toBeCloseTo(0.1, 6)
  })
  it('units and wells', () => {
    expect(cfsToLph(1)).toBeCloseTo(101940.65, 0)
    expect(wellsNeeded(1_491_000, 768_000)).toBe(2)
  })
})

describe('hand pumps', () => {
  it('No. 6 to 7.5 m, Tara beyond to 30 m', () => {
    expect(handPumpChoice(6).best).toBe('No. 6')
    expect(handPumpChoice(12).best).toBe('Tara')
    expect(handPumpChoice(40).best).toBe('motorised / deeper pump')
  })
})

describe('older papers: tubewell from sieve analysis', () => {
  // 2011-12 Q4(b) / 2007-08 Q3(a)
  const rows = [
    { no: '30', size: 0.6, retained: 0.5 }, { no: '40', size: 0.425, retained: 1.0 }, { no: '50', size: 0.3, retained: 4.4 },
    { no: '100', size: 0.15, retained: 64.8 }, { no: '200', size: 0.075, retained: 27.1 },
  ]
  const d = designFromSieve({ rows, pan: 2.2, strainerMm: 100, thicknessM: 40, open: 0.15 })
  it('curve statistics (hand-computed log interpolation)', () => {
    expect(d.stats.d10).toBeCloseTo(0.0916, 3)
    expect(d.stats.d30).toBeCloseTo(0.1511, 3)
    expect(d.stats.d60).toBeCloseTo(0.2084, 3)
    expect(d.stats.cu).toBeCloseTo(2.275, 2)
  })
  it('factor 5.54 -> 6, pack D10 0.55 mm, slot 21.6 -> 20', () => {
    expect(d.factor).toBe(6)
    expect(d.pack.d10).toBeCloseTo(0.55, 2)
    expect(d.slot.slot).toBe(20)
  })
  it('40 m aquifer = 131 ft, 80 % = 105 ft, capped at 100 ft (30.5 m)', () => {
    expect(d.screen?.Lft).toBe(100)
    expect(d.screen?.Lm).toBeCloseTo(30.48, 2)
    expect(d.yield?.cfs).toBeCloseTo((0.15 * Math.PI * (100 / 304.8) * 100 * 0.1) / 3, 6)
  })
})

describe('screen directly below the housing pipe (2022-23 Q6(c) shape)', () => {
  const d = designDtw({
    layers: [{ top: 180, bot: 350, fm: 1.38, d10: 0.14, d30: 0.203, d60: 0.313 }],
    housing: { swl: 150, bowlOD: 12 },
    strainerDia: 6,
    packThickness: 6,
  })
  it('housing 220 ft, avail 130 ft, screen 100 ft at 240-340, trap to the bottom 350', () => {
    expect(d.housing.length).toBe(220)
    expect(d.zone).toMatchObject({ top: 220, bot: 350, topIsInterface: false })
    expect(d.length).toBe(100)
    expect(d.strainer).toEqual({ top: 240, bot: 340 })
    expect(d.trap).toEqual({ top: 340, bot: 350 })
    expect(d.packRange).toEqual({ top: 220, bot: 350 })
    expect(d.warnings).toEqual([])
  })
  it('Cu 2.24 -> factor 5, D30 pack 1.015, D10 pack 0.70 -> slot 27.6 -> #20, 10 % open', () => {
    expect(d.factor).toBe(5)
    expect(d.pack.d30).toBeCloseTo(1.015, 3)
    expect(d.pack.d10).toBeCloseTo(0.7, 3)
    expect(d.slot.slot).toBe(20)
    expect(d.eta).toBe(0.1)
  })
})

describe('manual designs and checks (lab)', () => {
  const base = { layers: EX1, housing: { swl: 200 }, strainerDia: 6, packThickness: 8, fb: 2.5 }
  it('the auto design passes every rule', () => {
    const d = designDtw(base)
    expect(dtwChecks(d, d.yield.cfs).map((c) => c.level)).toEqual(['ok'])
  })
  it('a screen in 300-360 ft sits in a poor layer and too near the housing', () => {
    const d = designDtw({ ...base, screenTop: 300, screenLength: 60 })
    expect(d.strainer).toEqual({ top: 300, bot: 360 })
    expect(dtwChecks(d).some((c) => c.level === 'warn' && c.text.includes('FM 0.93'))).toBe(true)
  })
  it('a screen above the housing pipe is rejected', () => {
    const d = designDtw({ ...base, screenTop: 250, screenLength: 60 })
    expect(dtwChecks(d).some((c) => c.level === 'bad' && c.text.includes('housing'))).toBe(true)
  })
  it('a 40-slot is wider than the pack D10 (33.5): sand pumps', () => {
    const d = designDtw({ ...base, slotNo: 40 })
    expect(dtwChecks(d).some((c) => c.level === 'bad' && c.text.includes('slot 40'))).toBe(true)
    expect(d.eta).toBe(0.2)
  })
  it('pumping at twice the yield breaks the entrance velocity', () => {
    const d = designDtw(base)
    expect(dtwChecks(d, d.yield.cfs * 2).some((c) => c.text.includes('entrance velocity'))).toBe(true)
  })
  it('curveFromD passes through D10, D30, D60', () => {
    const c = curveFromD(0.17, 0.25, 0.37)
    expect(dAt(c, 10).d).toBeCloseTo(0.17, 6)
    expect(dAt(c, 30).d).toBeCloseTo(0.25, 6)
    expect(dAt(c, 60).d).toBeCloseTo(0.37, 6)
  })
})
