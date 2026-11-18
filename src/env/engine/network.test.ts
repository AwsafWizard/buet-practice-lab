import { describe, expect, it } from 'vitest'
import {
  balancingStorage,
  cfsToM3s,
  designDemand,
  designTree,
  economicTank,
  fpsToMs,
  ftToM,
  hardyCross,
  hwDiameterMm,
  lphToM3s,
  nodeBalance,
  reservoirSize,
  sizeLoopPipes,
  US_GAL_FT3,
  type HcLoop,
  type HcPipe,
  type TreePipe,
} from './network'

// ---- L5-Ex2 (branched) -------------------------------------------------------------------------
const lph = { 2: 31827, 3: 1397, 4: 2733, 5: 20659, 6: 38538, 7: 10499, 8: 7644 }
const demand = Object.fromEntries(Object.entries(lph).map(([k, v]) => [k, lphToM3s(v)]))
const pipesFt = (l15: number): TreePipe[] =>
  [['1-2', 1, 2, 385], ['2-3', 2, 3, 345], ['3-4', 3, 4, 390], ['1-5', 1, 5, l15], ['5-6', 5, 6, 600], ['5-7', 5, 7, 240], ['7-8', 7, 8, 240]].map(([id, a, b, L]) => ({ id: id as string, from: String(a), to: String(b), L: ftToM(L as number) }))

describe('L5-Ex2 branched network: step-by-step solution (V = 1 m/s, f = 0.01, 6/8 in standard sizes)', () => {
  const r = designTree({ pipes: pipesFt(385), demand, root: '1', V: 1, f: 0.01, Dmin: 4, startPsi: (90 * 62.4) / 144, minPsi: 30 })
  const p = (id: string) => r.pipes.find((x) => x.id === id)!
  it('flows 35,957 / 4,130 / 2,733 / 77,340 lph', () => {
    expect(p('1-2').Qlph).toBeCloseTo(35957, 0)
    expect(p('2-3').Qlph).toBeCloseTo(4130, 0)
    expect(p('3-4').Qlph).toBeCloseTo(2733, 0)
    expect(p('1-5').Qlph).toBeCloseTo(77340, 0)
    expect(p('5-7').Qlph).toBeCloseTo(18143, 0)
  })
  it('calculated diameters in inches', () => {
    expect(p('1-2').DcalcIn).toBeCloseTo(4.44, 2)
    expect(p('1-5').DcalcIn).toBeCloseTo(6.51, 2)
    expect(p('5-6').DcalcIn).toBeCloseTo(4.6, 1)
    expect(p('3-4').DcalcIn).toBeCloseTo(1.22, 2)
  })
  it('adopted 6, 4, 4, 8, 6, 4, 4 in', () => {
    expect(r.pipes.map((x) => x.Din)).toEqual([6, 4, 4, 8, 6, 4, 4])
    expect(p('2-3').rule).toBe('min')
  })
  it('velocity and head loss of 1-2: 0.548 m/s, 1.544 ft, 0.669 psi', () => {
    expect(p('1-2').v).toBeCloseTo(0.548, 3)
    expect(p('1-2').hfFt).toBeCloseTo(1.544, 2)
    expect(p('1-2').hfPsi).toBeCloseTo(0.669, 2)
    expect(p('5-6').hfPsi).toBeCloseTo(1.198, 2)
    expect(p('7-8').hfPsi).toBeCloseTo(0.143, 2)
  })
  it('terminal pressures 38.24, 37.07, 37.32 psi from 39.00', () => {
    expect(r.startPsi).toBeCloseTo(39, 6)
    expect(r.pressure['4']).toBeCloseTo(38.24, 1)
    expect(r.pressure['6']).toBeCloseTo(37.07, 1)
    expect(r.pressure['8']).toBeCloseTo(37.32, 1)
    expect(r.ok).toBe(true)
  })
})

describe('L5-Ex2 handwritten class solution (V = 3 fps, L(1-5) = 300 ft, whole-inch sizes, h_f at 3 fps)', () => {
  const r = designTree({ pipes: pipesFt(300), demand, root: '1', V: fpsToMs(3), f: 0.01, Dmin: 4, rounding: 'inch', hfVelocity: 'design', startPsi: 39, minPsi: 30 })
  const p = (id: string) => r.pipes.find((x) => x.id === id)!
  it('diameters 4.64, 1.57, 1.28, 6.81, 4.80, 3.30, 2.14 -> 5, 4, 4, 7, 5, 4, 4 in', () => {
    expect(p('1-2').DcalcIn).toBeCloseTo(4.64, 2)
    expect(p('2-3').DcalcIn).toBeCloseTo(1.57, 2)
    expect(p('1-5').DcalcIn).toBeCloseTo(6.81, 2)
    expect(r.pipes.map((x) => x.Din)).toEqual([5, 4, 4, 7, 5, 4, 4])
  })
  it('h_f 2.24, 2.51, 2.83, 1.25, 3.49, 1.74, 1.74 psi', () => {
    const want = [2.24, 2.51, 2.83, 1.25, 3.49, 1.74, 1.74]
    r.pipes.forEach((x, i) => expect(Math.abs(x.hfPsi - want[i])).toBeLessThan(0.011))
  })
  it('terminals 31.42, 34.26, 34.27 psi', () => {
    expect(r.pressure['4']).toBeCloseTo(31.42, 1)
    expect(r.pressure['6']).toBeCloseTo(34.26, 1)
    expect(r.pressure['8']).toBeCloseTo(34.27, 1)
  })
})

describe('auto-enlarge', () => {
  it('raises the pipe that loses most until the terminal pressure is met', () => {
    const r = designTree({ pipes: pipesFt(385), demand, root: '1', V: 1, Dmin: 4, startPsi: 31, minPsi: 30, autoEnlarge: true })
    expect(r.ok).toBe(true)
    expect(r.enlarged.length).toBeGreaterThan(0)
  })
})

// ---- 2022-23 Q7(c) --------------------------------------------------------------------------------
describe('2022-23 Q7(c) branched BCD', () => {
  const c = designDemand(0.15, 1.8, 0.1)
  const d = designDemand(0.1, 1.8, 0.1)
  const r = designTree({
    pipes: [{ id: 'BC', from: 'B', to: 'C', L: ftToM(450) }, { id: 'CD', from: 'C', to: 'D', L: ftToM(375) }],
    demand: { C: cfsToM3s(c), D: cfsToM3s(d) },
    root: 'B', V: fpsToMs(3), f: 0.01, Dmin: 4, startPsi: 40, minPsi: 30,
  })
  it('design flows 0.297 and 0.198 cusec; BC carries 0.495', () => {
    expect(c).toBeCloseTo(0.297, 6)
    expect(r.pipes[0].Qcfs).toBeCloseTo(0.495, 6)
    expect(r.pipes[1].Qcfs).toBeCloseTo(0.198, 6)
  })
  it('BC 6 in (5.5 calc), CD 4 in (minimum)', () => {
    expect(r.pipes[0].DcalcIn).toBeCloseTo(5.5, 1)
    expect(r.pipes.map((x) => x.Din)).toEqual([6, 4])
  })
  it('h_f BC = 3.55 ft, CD = 3.60 ft; P_D = 36.9 psi', () => {
    expect(r.pipes[0].hfFt).toBeCloseTo(3.55, 1)
    expect(r.pipes[1].hfFt).toBeCloseTo(3.6, 1)
    expect(r.pressure.D).toBeCloseTo(36.9, 1)
    expect(r.ok).toBe(true)
  })
})

// ---- L5-Ex3 Hardy Cross (steps file) --------------------------------------------------------------
const hcPipes: HcPipe[] = [
  { id: '1-2', from: '1', to: '2', L: 335, Q0: 13 },
  { id: '2-3', from: '2', to: '3', L: 170, Q0: 12.3 },
  { id: '3-6', from: '3', to: '6', L: 335, Q0: -7 },
  { id: '6-1', from: '6', to: '1', L: 170, Q0: -12 },
  { id: '3-4', from: '3', to: '4', L: 165, Q0: 5 },
  { id: '4-5', from: '4', to: '5', L: 335, Q0: -4 },
  { id: '5-6', from: '5', to: '6', L: 165, Q0: -5 },
]
const hcLoops: HcLoop[] = [
  { id: 'I', pipes: [{ id: '1-2', dir: 1 }, { id: '2-3', dir: 1 }, { id: '3-6', dir: 1 }, { id: '6-1', dir: 1 }] },
  { id: 'II', pipes: [{ id: '3-6', dir: -1 }, { id: '3-4', dir: 1 }, { id: '4-5', dir: 1 }, { id: '5-6', dir: 1 }] },
]
const ext = { 1: 25, 2: -0.7, 3: -14.3, 4: -9, 5: -1 } as Record<string, number>

describe('L5-Ex3 Hardy Cross (k = 1, x = 1.85)', () => {
  const r = hardyCross(hcPipes, hcLoops, { kind: 'k' }, { iterations: 5, tol: 0 })
  it('the assumed flows satisfy continuity', () => {
    const b = nodeBalance(hcPipes, Object.fromEntries(hcPipes.map((p) => [p.id, p.Q0])), ext)
    for (const v of Object.values(b)) expect(Math.abs(v)).toBeLessThan(1e-9)
  })
  it('iteration 1: loop I H = 115.026 / 103.830 / -36.596 / -99.194, sum 83.066, sum H/q 30.784, delta -1.4586', () => {
    const l1 = r.iters[0].loops[0]
    expect(l1.rows.map((x) => +x.H.toFixed(3))).toEqual([115.026, 103.83, -36.596, -99.194])
    expect(l1.sumH).toBeCloseTo(83.066, 2)
    expect(l1.sumHq).toBeCloseTo(30.784, 2)
    expect(l1.delta).toBeCloseTo(-1.4586, 3)
    expect(r.iters[0].loops[1].delta).toBeCloseTo(-0.7811, 3)
  })
  it('common pipe 3-6 takes the difference of the two corrections: -0.6775', () => {
    expect(r.iters[0].pipeDelta['3-6']).toBeCloseTo(-0.6775, 3)
  })
  it('iteration 2 corrections -0.1503 and -0.4378', () => {
    expect(r.iters[1].loops[0].delta).toBeCloseTo(-0.1503, 3)
    expect(r.iters[1].loops[1].delta).toBeCloseTo(-0.4378, 3)
  })
  it('five iterations end near 11.30, 10.60, 13.70, 7.41, 6.29, 3.71, 5.29 lps', () => {
    const f = r.flows
    expect(f['1-2']).toBeCloseTo(11.3, 1)
    expect(f['2-3']).toBeCloseTo(10.6, 1)
    expect(-f['6-1']).toBeCloseTo(13.7, 1)
    expect(-f['3-6']).toBeCloseTo(7.41, 1)
    expect(-f['5-6']).toBeCloseTo(6.29, 1)
    expect(f['3-4']).toBeCloseTo(3.71, 1)
    expect(-f['4-5']).toBeCloseTo(5.29, 1)
    const b = nodeBalance(hcPipes, f, ext)
    for (const v of Object.values(b)) expect(Math.abs(v)).toBeLessThan(1e-9)
  })
  it('pipe sizes from the chart: 6-1 needs 148.9 mm; all 150 mm but 3-4 at 100 mm', () => {
    const f = hardyCross(hcPipes, hcLoops, { kind: 'k' }, { iterations: 50, tol: 0.005 }).flows
    expect(hwDiameterMm(13.704)).toBeCloseTo(148.9, 0)
    const s = sizeLoopPipes(hcPipes, { ...f, '6-1': -13.704, '1-2': 11.296 })
    expect(s.find((x) => x.pipe === '6-1')!.Dadopt).toBe(150)
    expect(s.find((x) => x.pipe === '3-4')!.Dadopt).toBe(100)
    expect(s.filter((x) => x.pipe !== '3-4').every((x) => x.Dadopt === 150)).toBe(true)
    expect(s.find((x) => x.pipe === '6-1')!.H).toBeCloseTo(0.82, 1)
    expect(s.find((x) => x.pipe === '6-1')!.v).toBeCloseTo(0.78, 2)
  })
})

// ---- 2012-13 Q2(c) -------------------------------------------------------------------------------
describe('2012-13 Q2(c) Hardy Cross, h/L = 1.59e6 Q^1.85 D^-4.87 (lps, mm)', () => {
  const pipes: HcPipe[] = [
    { id: 'AB', from: 'A', to: 'B', L: 400, D: 200, Q0: 2 },
    { id: 'BC', from: 'B', to: 'C', L: 300, D: 100, Q0: 1.2 },
    { id: 'DC', from: 'D', to: 'C', L: 400, D: 200, Q0: 1.8 },
    { id: 'AD', from: 'A', to: 'D', L: 300, D: 100, Q0: 3 },
    { id: 'BD', from: 'B', to: 'D', L: 500, D: 150, Q0: 0.8 },
  ]
  const loops: HcLoop[] = [
    { id: 'ABD', pipes: [{ id: 'AB', dir: 1 }, { id: 'BD', dir: 1 }, { id: 'AD', dir: -1 }] },
    { id: 'BCD', pipes: [{ id: 'BC', dir: 1 }, { id: 'DC', dir: -1 }, { id: 'BD', dir: -1 }] },
  ]
  const r = hardyCross(pipes, loops, { kind: 'hw-lps-mm', coef: 1.59e6 }, { iterations: 2, tol: 0 })
  it('the assumed flows balance: 5 in at A, 2 out at D, 3 out at C', () => {
    const b = nodeBalance(pipes, Object.fromEntries(pipes.map((p) => [p.id, p.Q0])), { A: 5, D: -2, C: -3 })
    for (const v of Object.values(b)) expect(Math.abs(v)).toBeLessThan(1e-9)
  })
  it('the first head loss: AB = 400 x 1.59e6 x 2^1.85 x 200^-4.87 m', () => {
    expect(r.iters[0].loops[0].rows[0].H).toBeCloseTo(400 * 1.59e6 * 2 ** 1.85 * 200 ** -4.87, 6)
  })
  it('two iterations keep continuity and shrink the loop imbalance', () => {
    const b = nodeBalance(pipes, r.flows, { A: 5, D: -2, C: -3 })
    for (const v of Object.values(b)) expect(Math.abs(v)).toBeLessThan(1e-9)
    expect(r.iters).toHaveLength(2)
    expect(Math.abs(r.iters[1].loops[0].sumH)).toBeLessThan(Math.abs(r.iters[0].loops[0].sumH))
  })
})

// ---- reservoir (L5-Ex1) --------------------------------------------------------------------------
describe('L5-Ex1 elevated reservoir', () => {
  const demand = [45, 60, 92, 86, 76, 73, 68, 71, 70, 65, 62, 69, 78, 82, 80, 72, 68, 62, 60, 38, 32, 28, 25, 29]
  const supply = [128, 128, 128, 0, 128, 0, 128, 128, 0, 128, 128, 0, 0, 128, 0, 128, 0, 128, 128, 0, 0, 0, 0, 0]
  const s = balancingStorage(demand, supply)
  it('cumulative storage 83, 151, 187, 101 ... maximum 256 (3-4 PM)', () => {
    expect(s.hours.slice(0, 4).map((h) => h.storage)).toEqual([83, 151, 187, 101])
    expect(s.max).toBe(256)
    expect(s.maxAt).toBe(10)
    expect(demand.reduce((a, b) => a + b, 0)).toBe(1491)
  })
  it('emergency 93,188 L, total 349,188 L, tank 8 m dia ~7 m deep', () => {
    const daily = 12425 * 120
    const r = reservoirSize({ daily, balancing: 256000 })
    expect(daily).toBe(1_491_000)
    expect(r.avgHourly).toBeCloseTo(62125, 6)
    expect(r.emergency).toBeCloseTo(93187.5, 6)
    expect(r.total).toBeCloseTo(349187.5, 6)
    expect(350 / (Math.PI * 16)).toBeCloseTo(6.96, 2)
  })
})

// ---- economic tank ------------------------------------------------------------------------------
describe('economic dimensions of an overhead cylindrical tank', () => {
  it('equal floor and wall cost: D = 2H', () => {
    const t = economicTank(1000, 1, 1)
    expect(t.D / t.H).toBeCloseTo(2, 9)
  })
  it('cost is a minimum: moving D either way costs more', () => {
    const t = economicTank(26736, 300, 400)
    const cost = (D: number) => 300 * ((Math.PI * D * D) / 4) + (400 * 4 * 26736) / D
    expect(cost(t.D * 1.05)).toBeGreaterThan(t.cost)
    expect(cost(t.D * 0.95)).toBeGreaterThan(t.cost)
    expect(cost(t.D)).toBeCloseTo(t.cost, 4)
  })
  it('2 lac US gallons = 26,736 ft³; wall Tk 400, floor Tk 300 gives D = 44.9 ft, H = 16.9 ft', () => {
    const V = 200000 * US_GAL_FT3
    expect(V).toBeCloseTo(26736.2, 1)
    const t = economicTank(V, 300, 400)
    expect(t.D).toBeCloseTo(((8 * 400 * V) / (Math.PI * 300)) ** (1 / 3), 9)
    expect(t.D).toBeCloseTo(44.94, 1)
    expect(t.H).toBeCloseTo(16.86, 1)
    // at the optimum the floor and wall costs are in the ratio 1 : 2, i.e. H/D = cF/(2 cW)
    expect(t.H / t.D).toBeCloseTo(300 / 800, 9)
  })
})
