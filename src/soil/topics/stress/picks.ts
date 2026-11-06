// Stress-distribution "Which one?" drill: which chart / method, m and n for a centre point, ± rectangles for an outside
// point, depth of the maximum on a vertical line, circle vs square vs strip, symmetric embankments.
import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { bulbRatio, Irect, osterberg, RZ_MAX } from '../../engine/stressdist'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

const chart: PickSkill = {
  key: 'chart',
  label: 'Which chart / method?',
  gen: (r) => {
    const opts = ['Boussinesq KB (point load)', "Fadum / Steinbrenner I(m, n) with superposition", "Osterberg's chart", "Newmark's chart", 'Circle formula', '2:1 dispersion']
    const cases: [string, number, string, string][] = [
      ['Two column loads treated as concentrated loads; stress at mid-depth of a clay below one of them.', 0, 'Point loads → KB = (3/2π)/[1 + (r/z)²]^(5/2), add both.', 'd-kb'],
      ['A T-shaped raft; stress below the re-entrant corner, "analytically".', 1, 'Split into rectangles with a corner at the point; σz = qΣI(m, n).', 'd-fadum'],
      ['A flood embankment with 2H:1V and 5H:1V side slopes; stress at points below the crest.', 2, 'Embankment (trapezoidal strip) → Osterberg Iz(a/z, b/z) for each block.', 'd-osterberg'],
      ['An irregular (curved) loaded area; stress below a point outside it, "graphically".', 3, 'Any shape, any point: Newmark — plan at AB = z, count meshes, σz = 0.005Nq.', 'd-newmark'],
      ['A water tank on an 8 m circular raft; stress 4 m below the centre.', 4, 'Below the centre of a circle: σz = q{1 − [1/(1 + (R/z)²)]^(3/2)}.', 'd-circle'],
      ['A quick average stress increase on the clay under a 2 × 3 m footing for a settlement estimate ("use the 2:1 method").', 5, 'Q/((B + z)(L + z)) — the average over the spread area.', 'd-21'],
    ]
    const [q, i, why, ref] = pick(r, cases)
    return { q, options: opts, answer: opts[i], why, ref }
  },
}

const centreMN: PickSkill = {
  key: 'mn',
  label: 'm, n below the centre',
  gen: (r) => {
    const B = randInt(r, 2, 6)
    const L = B + randInt(r, 0, 6)
    const z = randInt(r, 2, 10)
    const q = randInt(r, 5, 30) * 10
    const right = 4 * q * Irect(B / 2 / z, L / 2 / z)
    const o = (v: number) => `${f2(v)} kPa`
    return {
      q: `A ${B} m × ${L} m area carries ${q} kPa. σz at ${z} m below its **centre**?`,
      options: [o(right), o(q * Irect(B / z, L / z)), o(4 * q * Irect(B / z, L / z)), o(q * Irect(B / 2 / z, L / 2 / z))],
      answer: o(right),
      why: `Four ${f2(B / 2)} × ${f2(L / 2)} rectangles meet at the centre: m = ${f3(B / 2 / z)}, n = ${f3(L / 2 / z)}, I = ${f3(Irect(B / 2 / z, L / 2 / z))}; σz = 4qI = ${o(right)}. Using the full B and L is the corner value.`,
      ref: 'd-fadum',
    }
  },
}

const outside: PickSkill = {
  key: 'out',
  label: 'Outside point: ± rectangles',
  gen: (r) => {
    const a = randInt(r, 1, 3)
    const L = randInt(r, 2, 6)
    const h = randInt(r, 1, 3)
    const z = randInt(r, 2, 6)
    const q = randInt(r, 5, 20) * 10
    const right = 2 * q * (Irect((a + L) / z, h / z) - Irect(a / z, h / z))
    const o = (v: number) => `${f2(v)} kPa`
    return {
      q: `A ${L} m × ${2 * h} m rectangle carries ${q} kPa. P is ${a} m outside one short side, on the centre line. σz at ${z} m below P?`,
      options: [o(right), o(2 * q * (Irect((a + L) / z, h / z) + Irect(a / z, h / z))), o(2 * q * Irect(L / z, h / z)), o(q * (Irect((a + L) / z, h / z) - Irect(a / z, h / z)))],
      answer: o(right),
      why: `Two halves (above and below the centre line); each = rectangle from P to the far side (${a + L} × ${h}, **+**) minus the fictitious one from P to the near side (${a} × ${h}, **−**): 2q[I(${f3((a + L) / z)}, ${f3(h / z)}) − I(${f3(a / z)}, ${f3(h / z)})] = ${o(right)} (2020-21 Q4(d)).`,
      ref: 'd-fadum',
    }
  },
}

const zmax: PickSkill = {
  key: 'zmax',
  label: 'Max σz on a vertical line',
  gen: (r) => {
    const rr = randInt(r, 2, 10)
    const Q = randInt(r, 2, 50) * 100
    const z = rr / RZ_MAX
    const o = (v: number) => `z = ${f2(v)} m`
    return {
      q: `Point load Q = ${Q} kN. On a vertical line ${rr} m from its axis, at what depth is σz largest?`,
      options: [o(z), o(rr), o(rr * RZ_MAX), o(rr / Math.tan((45 * Math.PI) / 180) * 2)],
      answer: o(z),
      why: `dσz/dz = 0 → 3r² = 2z² → r/z = √(2/3) = 0.8165, z = 1.225r = ${f2(z)} m (β = 39.23° from the axis); σz,max = 0.0888Q/r² = ${f2((0.0888 * Q) / (rr * rr))} kPa.`,
      ref: 'd-kb',
      ordered: true,
    }
  },
}

const shape: PickSkill = {
  key: 'shape',
  label: 'Circle, square or strip?',
  gen: (r) => {
    const zB = pick(r, [1, 2, 3])
    const opts = ['strip', 'square', 'circle', 'all equal']
    const which = pick(r, ['most', 'least', 'surface'] as const)
    if (which === 'surface') return { q: 'Same q and width B: which gives the largest σz just below the centre at the surface (z → 0)?', options: opts, answer: 'all equal', why: 'σz = q at the surface for all three; they differ only with depth.', ref: 'd-strip', ordered: true }
    return {
      q: `Same q and width B (circle D = B, square B × B, strip B). Which gives the ${which === 'most' ? 'largest' : 'smallest'} σz below the centre at z = ${zB}B?`,
      options: opts,
      answer: which === 'most' ? 'strip' : 'circle',
      why: `At z = ${zB}B: strip ${f2(bulbRatio('strip', 1, 0, zB))}q, square ${f2(bulbRatio('square', 1, 0, zB))}q, circle ${f2(bulbRatio('circle', 1, 0, zB))}q. The infinitely long strip loads far more area, so its bulb goes deepest (0.1q at ≈ 6B by Boussinesq; ≈ 2B for square / circle).`,
      ref: 'd-strip',
      ordered: true,
    }
  },
}

const emb: PickSkill = {
  key: 'emb',
  label: 'Embankment: I or 2I?',
  gen: (r) => {
    const a = randInt(r, 5, 25)
    const b = randInt(r, 2, 10)
    const z = randInt(r, 2, 12)
    const q = randInt(r, 4, 10) * 19
    const I = osterberg(a, b, z)
    const o = (v: number) => `${f2(v)} kPa`
    return {
      q: `Symmetric embankment, crest ${2 * b} m, slopes ${a} m horizontal each, q = γH = ${q} kPa. σz at ${z} m below the **centre line**?`,
      options: [o(2 * I * q), o(I * q), o(2 * osterberg(a, 2 * b, z) * q), o(osterberg(a, 2 * b, z) * q)],
      answer: o(2 * I * q),
      why: `Each half is a block with b = ${b} (half the crest) and a = ${a}: Iz(a/z = ${f3(a / z)}, b/z = ${f3(b / z)}) = ${f3(I)}; both halves → σz = 2Iz q = ${o(2 * I * q)}.`,
      ref: 'd-osterberg',
    }
  },
}

export const STRESS_PICKS: PickSkill[] = [chart, centreMN, outside, zmax, shape, emb]
