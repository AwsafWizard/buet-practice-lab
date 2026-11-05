import { describe, expect, it } from 'vitest'
import { cylinderVolume, drClass, drFromE, drFromGd, DR_LAMBE, formulaRoute, gdFromSwG, relDensity, sandCone, solvePhase, srFromRho, waterToRaise, waterToSaturate } from './phase'
import { GW } from './units'

const near = (a: number, b: number, rel = 0.003, abs = 1e-4) => expect(Math.abs(a - b)).toBeLessThanOrEqual(Math.max(abs, Math.abs(b) * rel))

describe('slide 6 and 9 mini-examples', () => {
  it('e = 0.5 → n = 0.33', () => {
    const s = solvePhase({ e: 0.5, S: 0, Gs: 2.65 }, 1)
    near(s.vals.n, 1 / 3)
  })
  it('W = 500 g, Ws = 400 g → w = 25 %', () => {
    const s = solvePhase({ W: 500, Ws: 400, Gs: 2.7, S: 0.8 }, 1)
    near(s.vals.w, 0.25)
  })
})

describe('Das Ex 3.2 (slides 11–15): V = 1.2 m³, W = 2350 kg, w = 8.6 %, Gs = 2.71', () => {
  const s = solvePhase({ V: 1.2, W: 2350, w: 0.086, Gs: 2.71 }, 1000)
  it('solves on the block diagram', () => expect(s.status).toBe('ok'))
  it('Ws = 2164 kg, Ww = 186 kg, Vw = 0.186 m³, Vs = 0.7985 m³', () => {
    near(s.vals.Ws, 2164, 0.001)
    near(s.vals.Ww, 186.1, 0.002)
    near(s.vals.Vw, 0.186, 0.002)
    near(s.vals.Vs, 0.7985, 0.001)
  })
  it('γ = 1958, γd = 1803 kg/m³; e = 0.503, n = 0.335, S = 46.3 % (Das; the slide truncates Vs to 0.79 → 0.52, 0.34, 45.4 %)', () => {
    near(s.vals.g, 1958, 0.001)
    near(s.vals.gd, 1803, 0.001)
    near(s.vals.e, 0.503, 0.002)
    near(s.vals.n, 0.335, 0.002)
    near(s.vals.S, 0.463, 0.002)
  })
  it('first steps follow the slide: Ws from W/(1 + w), then Ww, Vs, Vw', () => {
    const order = s.steps.filter((x) => x.kind === 'weight' || x.kind === 'volume').map((x) => x.key)
    expect(order.slice(0, 2)).toEqual(['Ws', 'Ww'])
    expect(order).toContain('Vs')
    expect(order).toContain('Va')
  })
})

describe('Das Ex 3.4 (slides 16–19): saturated, γd = 103 pcf, w = 23 %', () => {
  const s = solvePhase({ gd: 103, w: 0.23, S: 1 }, 62.4)
  it('assumes V = 1 and needs no simultaneous equation', () => {
    expect(s.basis?.key).toBe('V')
    expect(s.steps.some((x) => x.kind === 'solve')).toBe(false)
  })
  it('γsat = 126.69 pcf, Gs = 2.66, e = 0.612 (slide 0.613 from 1/1.63)', () => {
    near(s.vals.gsat, 126.69, 0.0005)
    near(s.vals.Gs, 2.66, 0.002)
    near(s.vals.e, 0.612, 0.002)
  })
})

describe('2023-24 Q1(a): 1.5 in × 3.0 in cylinder, 186.5 g wet, 160.0 g dry, Gs = 2.65', () => {
  const V = cylinderVolume(1.5, 3)
  const s = solvePhase({ V, W: 186.5, Ws: 160, Gs: 2.65 }, 1)
  it('V = 86.87 cm³', () => near(V, 86.87, 0.0005))
  it('w = 16.56 %, e = 0.439, n = 0.305, S = 100 %', () => {
    near(s.vals.w, 0.1656, 0.001)
    near(s.vals.e, 0.439, 0.002)
    near(s.vals.n, 0.305, 0.002)
    near(s.vals.S, 1.0, 0.001)
  })
  it('γ = 2.147, γd = 1.842, γsat = 2.147 g/cc (equal: the specimen is saturated)', () => {
    near(s.vals.g, 2.147, 0.001)
    near(s.vals.gd, 1.842, 0.001)
    near(s.vals.gsat, s.vals.g, 0.001)
  })
})

describe('2017-18 Q5(b): w = 15 %, γ = 18.84 kN/m³, Gs = 2.65, emin 0.50, emax 0.85', () => {
  const s = solvePhase({ w: 0.15, g: 18.84, Gs: 2.65 }, GW)
  it('e = 0.587, S = 67.7 %, γsat = 20.0 kN/m³', () => {
    near(s.vals.e, 0.587, 0.002)
    near(s.vals.S, 0.677, 0.002)
    near(s.vals.gsat, 20.0, 0.002)
  })
  it('Dr = 75.2 % (dense)', () => {
    const d = relDensity({ e: s.vals.e, emax: 0.85, emin: 0.5 })
    near(d.pct, 75.2, 0.002)
    expect(d.cls).toBe('Dense')
  })
  it('formula route agrees (Se = wGs, γsat)', () => {
    const r = formulaRoute(s.vals, GW)
    near(r.find((x) => x.key === 'S')!.value, s.vals.S, 1e-6)
    near(r.find((x) => x.key === 'gsat')!.value, s.vals.gsat, 1e-6)
    near(r.find((x) => x.key === 'g')!.value, 18.84, 1e-6)
  })
})

describe('relative density from dry unit weights', () => {
  it('2007-08 Q5(c): γd 13.34 / 21.40, n = 30 %, Gs 2.67 → emax 0.963, emin 0.224, e 0.429, Dr 72.3 %', () => {
    const d = relDensity({ n: 0.3, gdMin: 13.34, gdMax: 21.4, Gs: 2.67, gw: GW })
    near(d.emax, 0.963, 0.001)
    near(d.emin, 0.224, 0.002)
    near(d.e, 0.4286, 0.001)
    near(d.pct, 72.3, 0.002)
    // the γd form on slides 22/27 gives the same number
    near(drFromGd((2.67 * GW) / (1 + d.e), 13.34, 21.4) * 100, 72.3, 0.002)
  })
  it('2016-17 Q1(a)(iii): n = 50 %, ρd 2.00 / 1.20 t/m³, Gs 2.74 → ID = 31 % (loose)', () => {
    const d = relDensity({ n: 0.5, gdMin: 1.2, gdMax: 2.0, Gs: 2.74, gw: 1 })
    near(d.e, 1.0)
    near(d.emax, 1.283, 0.001)
    near(d.emin, 0.37, 0.001)
    near(d.pct, 31.0, 0.005)
    expect(d.cls).toBe('Loose')
    expect(d.clsLambe).toBe('Loose')
  })
  it('class boundaries: slide scale 15/50/70/85, Lambe scale 15/35/65/85', () => {
    expect(drClass(60)).toBe('Medium')
    expect(drClass(60, DR_LAMBE)).toBe('Medium')
    expect(drClass(40)).toBe('Loose')
    expect(drClass(40, DR_LAMBE)).toBe('Medium')
    expect(drClass(68)).toBe('Medium')
    expect(drClass(68, DR_LAMBE)).toBe('Dense')
    near(drFromE(0.6, 0.8, 0.4), 0.5)
  })
})

describe('2011-12 Q7(b): 150 m³, Gs 2.70, ρ = 2.00 t/m³, w = 8 %', () => {
  const s = solvePhase({ V: 150, g: 2.0, w: 0.08, Gs: 2.7 }, 1)
  it('ρd = 1.852 t/m³, e = 0.458', () => {
    near(s.vals.gd, 1.852, 0.001)
    near(s.vals.e, 0.458, 0.002)
  })
  it('(i) 8.33 m³ of water to reach 11 %, (ii) S = 70.7 % at 12 %, (iii) 31.4 m³ to saturate 100 m³ dry', () => {
    near(waterToRaise(s.vals.Ws, 0.08, 0.11, 1), 8.33, 0.002)
    near((0.12 * 2.7) / s.vals.e, 0.707, 0.002)
    near(waterToSaturate(100, s.vals.e), 31.4, 0.002)
  })
})

describe('linked blocks and bad data', () => {
  it('γ + S + Gs needs one equation (γ = 19 kN/m³, S = 80 %, Gs = 2.7)', () => {
    const s = solvePhase({ g: 19, S: 0.8, Gs: 2.7 }, GW)
    expect(s.status).toBe('ok')
    expect(s.steps.some((x) => x.kind === 'solve')).toBe(true)
    near(s.vals.g, 19, 1e-6)
    near(s.vals.S, 0.8, 1e-6)
    // check against the closed form: γ = (Gs + Se)γw/(1+e)
    const e = s.vals.e
    near(((2.7 + 0.8 * e) * GW) / (1 + e), 19, 1e-6)
  })
  it('γsat + Gs only (saturated): e from γsat = (Gs + e)γw/(1+e)', () => {
    const s = solvePhase({ gsat: 20, Gs: 2.68, S: 1 }, GW)
    expect(s.status).toBe('ok')
    near(((2.68 + s.vals.e) * GW) / (1 + s.vals.e), 20, 1e-6)
  })
  it('e and n together are not enough', () => {
    expect(solvePhase({ e: 0.6, n: 0.375, Gs: 2.7 }, GW).status).toBe('under')
  })
  it('contradicting data are flagged', () => {
    expect(solvePhase({ e: 0.6, n: 0.5, Gs: 2.7, w: 0.1 }, GW).status).toBe('inconsistent')
  })
})

describe('derivation identities (2008-09 Q5(b), 2021-22 Q1(a))', () => {
  const s = solvePhase({ e: 0.72, w: 0.18, Gs: 2.68 }, 1)
  it('Sr = w / [(ρw/ρ)(1 + w) − 1/Gs]', () => near(srFromRho(0.18, s.vals.g, 1, 2.68), s.vals.S, 1e-6))
  it('γd = Gsγw / (1 + wGs/S)', () => near(gdFromSwG(s.vals.S, 0.18, 2.68, 1), s.vals.gd, 1e-6))
})

describe('sand cone (slide 26 symbols)', () => {
  it('hole volume, γd and relative compaction', () => {
    const r = sandCone({ W1: 7.59, W4: 4.78, Wc: 0.545, gdSand: 1.57e-3, W2: 3.007, w: 0.102, gdMax: 1.9e-3 })
    near(r.W5, 2.81)
    near(r.V, (2.81 - 0.545) / 1.57e-3, 1e-6)
    near(r.gd, 3.007 / 1.102 / r.V, 1e-6)
    near(r.RC, r.gd / 1.9e-3, 1e-6)
  })
})
