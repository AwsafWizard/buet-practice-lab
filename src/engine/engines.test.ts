import { describe, expect, it } from 'vitest'
import { cantileverMethod, portalMethod, xBraced } from './approx'
import { stiffenedSuspension, parabolicCable, threeHingedArch } from './cable'
import { determinacy } from './determinacy'
import { baseShear, period } from './eq'
import { influenceLine, ildAt, type ILD } from './ild'
import { reducedLL } from './llr'
import { beam, type Model } from './model'
import { absoluteMaxMoment, ssMomentILD, ssShearILD, trainExtremes, uniformPlusConcentrated } from './moving'
import { virtualWork } from './vw'
import { Kz, kzt, qz } from './wind'

const near = (a: number, b: number, rel = 1e-3) => expect(Math.abs(a - b)).toBeLessThanOrEqual(rel * Math.max(1, Math.abs(b)))

describe('lecture examples', () => {
  it('EQ exercise (Lec 13): 8-storey Dhaka, V = 3057.6 kN, F_roof = 674.8 kN', () => {
    const { T } = period('rc_mrf', 25.5)
    near(T, 0.8596)
    const floors = [{ name: 'Base', h: 0, w: 120 }, { name: 'L1', h: 1.5, w: 6360 }]
    for (let k = 2; k <= 8; k++) floors.push({ name: `L${k}`, h: 1.5 + 3 * (k - 1), w: 6360 })
    floors.push({ name: 'Roof', h: 25.5, w: 6150 })
    const r = baseShear({ Z: 0.2, I: 1, R: 5, site: 'SC', T, floors })
    near(r.Cs, 2.0067)
    near(r.W, 57150)
    near(r.V, 3057.6, 2e-3)
    near(r.k, 1.1798)
    near(r.rows.find((x) => x.name === 'Roof')!.F, 674.8, 2e-3)
  })
  it('Kzt example (Lec 6-8) = 1.054', () => {
    const r = kzt({ hill: 'escarpment', exp: 'C', H: 30, Lh: 40, x: 30, downwind: true, z: 65.75 })
    near(r.K1, 0.475)
    near(r.K2, 0.875)
    near(r.K3, 0.0646, 3e-3)
    near(r.Kzt, 1.054, 1e-3)
  })
  it('LLR example: corner column 2.06 / 1.64 kN/m², shear wall 1.64 / 1.33', () => {
    near(reducedLL({ L0: 2.4, KLL: 4, AT: 14, floorsSupported: 1 }).L, 2.066, 2e-3)
    near(reducedLL({ L0: 2.4, KLL: 4, AT: 28, floorsSupported: 2 }).L, 1.636, 2e-3)
    near(reducedLL({ L0: 2.4, KLL: 1, AT: 224, floorsSupported: 2 }).L, 1.333, 2e-3)
  })
  it('wind table (Lec 9-10): Kz(3 m, exp A) = 0.57, qz = 1.28 kN/m² for Dhaka 65.7 m/s', () => {
    near(Kz(3, 'A'), 0.575, 3e-3)
    near(qz({ Kz: Kz(3, 'A'), Kzt: 1, Kd: 0.85, V: 65.7, I: 1 }), 1.28, 1e-2)
    near(Kz(45, 'A'), 1.1, 2e-2)
  })
})

describe('influence lines', () => {
  it('simple beam shear & moment ILD from the solver match textbook', () => {
    const m = beam([
      { id: 'A', x: 0, support: 'pin' },
      { id: 'C', x: 10 },
      { id: 'B', x: 40, support: 'roller' },
    ])
    const M = influenceLine(m, { kind: 'members', members: ['AC', 'CB'] }, { kind: 'moment', member: 'CB', x: 0 })
    near(ildAt(M, 10), 7.5)
    const V = influenceLine(m, { kind: 'members', members: ['AC', 'CB'] }, { kind: 'shear', member: 'CB', x: 0 })
    near(ildAt(V, 10, -1), -0.25)
    near(ildAt(V, 10, 1), 0.75)
  })
  it('Gerber beam with hinge: reaction ILD extends beyond hinge', () => {
    // A pin, B roller at 20, hinge D at 30, C roller at 50 (overhang AB-D)
    const m = beam([
      { id: 'A', x: 0, support: 'pin' },
      { id: 'B', x: 20, support: 'roller' },
      { id: 'D', x: 30, hinge: true },
      { id: 'C', x: 50, support: 'roller' },
    ])
    const R = influenceLine(m, { kind: 'members', members: ['AB', 'BD', 'DC'] }, { kind: 'reaction', node: 'B', comp: 'y' })
    near(ildAt(R, 0), 0)
    near(ildAt(R, 20), 1)
    near(ildAt(R, 30), 1.5)
    near(ildAt(R, 50), 0)
  })
  it('panel loading (truss) diagonal force', () => {
    // Pratt truss 4 panels of 10, height 10; bottom chord loaded
    const nodes = [0, 1, 2, 3, 4].map((k) => ({ id: `L${k}`, x: 10 * k, y: 0 }))
    nodes.push(...[1, 2, 3].map((k) => ({ id: `U${k}`, x: 10 * k, y: 10 })))
    const mem = (i: string, j: string) => ({ id: i + j, i, j, truss: true })
    const model: Model = {
      nodes,
      members: [
        mem('L0', 'L1'), mem('L1', 'L2'), mem('L2', 'L3'), mem('L3', 'L4'),
        mem('U1', 'U2'), mem('U2', 'U3'),
        mem('L0', 'U1'), mem('U3', 'L4'),
        mem('L1', 'U1'), mem('L2', 'U2'), mem('L3', 'U3'),
        mem('U1', 'L2'), mem('L2', 'U3'),
      ],
      supports: [{ node: 'L0', type: 'pin' }, { node: 'L4', type: 'roller' }],
      loads: [],
    }
    const ild = influenceLine(model, { kind: 'panel', nodes: ['L0', 'L1', 'L2', 'L3', 'L4'] }, { kind: 'force', member: 'U1L2' })
    // load at L1: left reaction .75; section through panel 2: vertical comp of U1L2 = R_L - 1 = -.25 -> force = -0.25*sqrt2 (compression)
    near(ildAt(ild, 10), -0.25 * Math.SQRT2)
    near(ildAt(ild, 20), 0.5 * Math.SQRT2)
  })
})

describe('moving loads', () => {
  it('two-wheel truck absolute max moment (Hibbeler-style)', () => {
    // 2 loads 10 and 10 spaced 10 on 40 span: abs max = R/2... place: resultant at mid between, critical wheel 2.5 from centre
    const r = absoluteMaxMoment(40, { P: [10, 10], gaps: [10] })
    // M = 20*(17.5)^2/40 = 153.125
    near(r.M, 153.125)
  })
  it('max moment at quarter point by brute force equals trial table', () => {
    const ild = ssMomentILD(80, 20)
    const t = { P: [10, 20, 20, 20], gaps: [8, 6, 6] }
    const e = trainExtremes(ild, t)
    expect(e.max.value).toBeGreaterThan(0)
    // compare with direct brute force sampling
    let best = 0
    for (let s = -40; s <= 120; s += 0.01) {
      for (const o of [1, -1]) {
        let v = 0
        let x = s
        t.P.forEach((P, k) => {
          if (k > 0) x -= o * t.gaps[k - 1]
          if (x >= 0 && x <= 80) v += P * ildAt(ild, x)
        })
        best = Math.max(best, v)
      }
    }
    near(e.max.value, best, 1e-3)
  })
  it('shear ILD extremes with uniform + roving', () => {
    const ild: ILD = ssShearILD(60, 20)
    const r = uniformPlusConcentrated(ild, 2, 30)
    // +ve: area right = 0.5*40*(2/3) = 13.33 -> 26.67 + 30*2/3 = 46.67
    near(r.maxPos.live, 46.667)
  })
})

describe('approximate methods', () => {
  it('portal method: 2-bay 1-storey', () => {
    const r = portalMethod({ xs: [0, 20, 40], heights: [12], loads: [12] })
    near(r.columns[0][0].shear, 3)
    near(r.columns[0][1].shear, 6)
    near(r.columns[0][0].mTop, 18)
    near(r.beams[0][0].moment, 18)
    near(r.beams[0][0].shear, 1.8)
    near(r.columns[0][0].axial, 1.8) // windward tension
    near(r.columns[0][2].axial, -1.8)
  })
  it('cantilever method: column axial ∝ distance, storey shears sum', () => {
    const r = cantileverMethod({ xs: [0, 20, 36], heights: [12, 12], loads: [40, 20], areas: [[100, 200, 100], [100, 200, 100]] })
    for (let s = 0; s < 2; s++) {
      const sum = r.columns[s].reduce((a, c) => a + c.shear, 0)
      near(sum, r.storeyShear[s], 1e-6)
    }
  })
  it('X-braced: half shear per diagonal', () => {
    // one panel 10x10 with both diagonals, pin + roller, load 10 down at top-right
    const model: Model = {
      nodes: [
        { id: 'A', x: 0, y: 0 }, { id: 'B', x: 10, y: 0 }, { id: 'C', x: 10, y: 10 }, { id: 'D', x: 0, y: 10 },
      ],
      members: [
        { id: 'AB', i: 'A', j: 'B', truss: true }, { id: 'BC', i: 'B', j: 'C', truss: true },
        { id: 'CD', i: 'C', j: 'D', truss: true }, { id: 'DA', i: 'D', j: 'A', truss: true },
        { id: 'AC', i: 'A', j: 'C', truss: true }, { id: 'BD', i: 'B', j: 'D', truss: true },
      ],
      supports: [{ node: 'A', type: 'pin' }, { node: 'B', type: 'pin' }],
      loads: [{ kind: 'node', node: 'D', fx: 10 }],
    }
    const r = xBraced(model, [['AC', 'BD']], 'both')
    near(Math.abs(r.forces.get('AC')!), 5 * Math.SQRT2)
    near(r.forces.get('AC')!, -r.forces.get('BD')!)
    const t = xBraced(model, [['AC', 'BD']], 'tension')
    near(t.forces.get('AC')!, 10 * Math.SQRT2)
    near(t.forces.get('BD')!, 0)
  })
})

describe('determinacy', () => {
  it('lecture: 2-storey 2-bay fixed frame DOSI 11? (3m + r - 3j)', () => {
    // 2 bays x 2 storeys, 3 fixed bases: m=10, r=9 -> lecture shows 3x10 + 8 - 3x9 = 11 with one pin
    const xs = [0, 10, 20]
    const nodes = [] as Model['nodes']
    for (let l = 0; l < 3; l++) xs.forEach((x, j) => nodes.push({ id: `N${l}${j}`, x, y: 4 * l }))
    const members = [] as Model['members']
    for (let l = 0; l < 2; l++) xs.forEach((_, j) => members.push({ id: `C${l}${j}`, i: `N${l}${j}`, j: `N${l + 1}${j}` }))
    for (let l = 1; l < 3; l++) for (let j = 0; j < 2; j++) members.push({ id: `B${l}${j}`, i: `N${l}${j}`, j: `N${l}${j + 1}` })
    const model: Model = { nodes, members, supports: [{ node: 'N00', type: 'fixed' }, { node: 'N01', type: 'pin' }, { node: 'N02', type: 'fixed' }], loads: [] }
    const d = determinacy(model)
    expect(d.dosi).toBe(11)
    expect(d.dosiFormula).toBe(11)
    expect(d.doki).toBe(19)
  })
  it('truss with redundant diagonal DOSI 2 (lecture slide 7)', () => {
    const model: Model = {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 10, y: 0 }, { id: 'C', x: 10, y: 5 }, { id: 'D', x: 0, y: 5 }],
      members: [
        { id: '1', i: 'A', j: 'B', truss: true }, { id: '2', i: 'B', j: 'C', truss: true }, { id: '3', i: 'C', j: 'D', truss: true },
        { id: '4', i: 'D', j: 'A', truss: true }, { id: '5', i: 'A', j: 'C', truss: true }, { id: '6', i: 'B', j: 'D', truss: true },
      ],
      supports: [{ node: 'A', type: 'pin' }, { node: 'B', type: 'pin' }],
      loads: [],
    }
    const d = determinacy(model)
    expect(d.dosi).toBe(2)
  })
  it('geometrically unstable: parallel rollers', () => {
    const m = beam([
      { id: 'A', x: 0, support: 'roller' },
      { id: 'B', x: 5, support: 'roller' },
      { id: 'C', x: 10, support: 'roller' },
    ])
    const d = determinacy(m)
    expect(d.stable).toBe(false)
    expect(d.dosiFormula).toBe(0)
  })
})

describe('virtual work, cables, arch', () => {
  it('cantilever tip deflection PL^3/3EI', () => {
    const m = beam([{ id: 'A', x: 0, support: 'fixed' }, { id: 'B', x: 10 }])
    const r = virtualWork({ ...m, EI: 1000 }, [{ kind: 'node', node: 'B', fy: -6 }], [{ kind: 'node', node: 'B', fy: -1 }])
    near(r.total, (6 * 1000) / (3 * 1000))
  })
  it('suspension bridge: hinge condition gives zero moment at the hinge', () => {
    const s = stiffenedSuspension({ L: 1000, h: 100, xh: 500, loads: [{ x: 300, P: 20 }, { x: 500, P: 20 }] })
    near(s.M(500), 0, 1e-6)
  })
  it('parabolic cable H = wL²/8h', () => {
    const c = parabolicCable({ L: 1000, w: 1, h: 1000 / 30 })
    near(c.H, (1000 * 1000) / (8 * (1000 / 30)))
  })
  it('three-hinged arch with full UDL has zero moment', () => {
    const a = threeHingedArch({ L: 16, h: 4, loads: [], udl: { w: 12, a: 0, b: 16 } })
    near(a.at(6).M, 0, 1e-6)
  })
})

describe('portal beam axial', () => {
  it('load pushing at left end puts first beam in compression; pulling at right end puts it in tension', () => {
    const push = portalMethod({ xs: [0, 10, 20], heights: [10], loads: [10] })
    expect(push.beams[0][0].axial).toBeLessThan(0)
    const pull = portalMethod({ xs: [0, 10, 20], heights: [10], loads: [10], loadSide: ['right'] })
    expect(pull.beams[0][1].axial).toBeGreaterThan(0)
    // compression in beam 1 = P - V_ext = 10 - 2.5
    expect(Math.abs(push.beams[0][0].axial + 7.5)).toBeLessThan(1e-9)
  })
})
