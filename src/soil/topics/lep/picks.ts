// Earth pressure "Which one?" drill: which K, which K0 formula, the water ×Ka trap, crack or not, failure-plane angle.
import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { crackDepth, K0, Ka } from '../../engine/earth'
import { GW } from '../../engine/units'

const f2 = (v: number) => fmt(v, 2)

const whichK: PickSkill = {
  key: 'k',
  label: 'Which K?',
  gen: (r) => {
    const cases: [string, 'K0' | 'Ka' | 'Kp', string][] = [
      ['A basement wall propped by the floor slabs retains sand.', 'K0', 'The wall cannot move, so the soil stays at rest: **K0**.'],
      ['A bridge abutment, rigid and restrained at the deck, retains backfill.', 'K0', 'No movement → **K0**.'],
      ['A cantilever retaining wall rotates slightly outward about its base.', 'Ka', 'Moving away from the backfill (≈ 0.001H in sand is enough) → **Ka** (minimum).'],
      ['Soil in front of a wall’s toe resists the wall sliding forward.', 'Kp', 'The wall is pushed into that soil → **Kp**; its force is subtracted.'],
      ['An anchor block is pulled horizontally into the soil.', 'Kp', 'The block pushes the soil → **Kp**.'],
      ['A gravity wall on a yielding base has moved outward enough for failure by lateral expansion.', 'Ka', '“Lateral expansion of the backfill” = active (2015-16 Q4).'],
      ['A wall is thrust into the backfill until the backfill fails by lateral compression.', 'Kp', 'Lateral compression = passive.'],
      ['A rigid box culvert wall, no movement possible.', 'K0', 'Unyielding wall → **K0**.'],
    ]
    const [q, a, why] = pick(r, cases)
    return { q, options: ['K0', 'Ka', 'Kp'].map((x) => `$${x[0]}_${x.slice(1)}$`), answer: `$${a[0]}_${a.slice(1)}$`, why, ref: 'e-move', ordered: true }
  },
}

const k0Formula: PickSkill = {
  key: 'k0f',
  label: 'Which K0 formula?',
  gen: (r) => {
    const opts = ['$1-\\sin\\varphi\'$ (Jaky)', '$(1-\\sin\\varphi\') + 5.5(\\gamma_d/\\gamma_{d,min} - 1)$ (Sherif)', '$(1-\\sin\\varphi\')\\,OCR^{\\sin\\varphi\'}$ (Mayne–Kulhawy)', '$0.44 + 0.42\\,PI/100$ (Massarsch)', '$K_{0(NC)}\\sqrt{OCR}$']
    const phi = randInt(r, 28, 36)
    const cases: [string, number, string][] = [
      [`Loose, normally consolidated sand, φ′ = ${phi}°.`, 0, `Coarse-grained / loose sand: Jaky, K0 = 1 − sin ${phi}° = ${f2(K0.jaky(phi))}.`],
      [`Sand compacted behind the wall to γd = 17.2 kN/m³; loosest state γd(min) = 15.8 kN/m³; φ′ = ${phi}°.`, 1, `Dense **compacted** sand: Sherif, K0 = ${f2(K0.sherif(phi, 17.2, 15.8))}. Jaky underestimates it.`],
      [`Overconsolidated sand, OCR = 3, φ′ = ${phi}°.`, 2, `OC soil with φ′ given: Mayne–Kulhawy, K0 = ${f2(K0.mayne(phi, 3))}.`],
      ['Normally consolidated clay, LL = 45, PL = 25.', 3, `NC fine soil from PI: Massarsch, K0 = 0.44 + 0.42 × 0.20 = ${f2(K0.massarsch(20))}.`],
      ['Clay with LL = 40, PL = 25 and OCR = 2.5 (2008-09 Q1(h)).', 4, `NC value from Massarsch (${f2(K0.massarsch(15))}) then × √OCR = ${f2(K0.ocSqrt(K0.massarsch(15), 2.5))}.`],
    ]
    const [q, i, why] = pick(r, cases)
    return { q: q + ' Which K0?', options: opts, answer: opts[i], why, ref: 'e-k0', ordered: true }
  },
}

const waterTrap: PickSkill = {
  key: 'water',
  label: 'Water ×Ka trap',
  gen: (r) => {
    const phi = pick(r, [28, 30, 32, 34])
    const g = randInt(r, 16, 18),
      gs = g + randInt(r, 2, 3)
    const z1 = randInt(r, 2, 3),
      h2 = randInt(r, 3, 4)
    const ka = Ka(phi)
    const gp = gs - GW
    const right = ka * (g * z1 + gp * h2) + GW * h2
    const wrong1 = ka * (g * z1 + gp * h2 + GW * h2)
    const wrong2 = ka * (g * z1 + gs * h2)
    const wrong3 = ka * (g * z1 + gs * h2) + GW * h2
    const wrong4 = ka * (g * (z1 + h2))
    const o = (v: number) => `${f2(v)} kPa`
    return {
      q: `Active wall, sand φ′ = ${phi}° (Ka = ${fmt(ka, 3)}), γ = ${g} above the WT at ${z1} m, γsat = ${gs} below. Total lateral pressure (soil + water) at ${z1 + h2} m?`,
      options: [o(right), o(wrong1), o(wrong2), o(wrong3), o(wrong4)],
      answer: o(right),
      why: `σ′0 = ${g}(${z1}) + (${gs} − 9.81)(${h2}) = ${f2(g * z1 + gp * h2)} → × Ka = ${f2(ka * (g * z1 + gp * h2))}; water u = 9.81 × ${h2} = ${f2(GW * h2)} with **K = 1** → ${f2(right)} kPa. Multiplying water by Ka, or using γsat with Ka, are the classic traps.`,
      ref: 'e-rankine',
    }
  },
}

const crack: PickSkill = {
  key: 'crack',
  label: 'Crack or not?',
  gen: (r) => {
    const undrained = r() < 0.45
    const phi = undrained ? 0 : randInt(r, 20, 34)
    const c = randInt(r, 5, 30)
    const g = randInt(r, 16, 20)
    const q = pick(r, [0, 0, 10, 20, 40, 60])
    const ka = Ka(phi)
    const zc = crackDepth(c, g, phi, q)
    const no = q * ka >= 2 * c * Math.sqrt(ka)
    const ans = no ? 'No crack (qKa ≥ 2c√Ka)' : `${f2(zc)} m`
    const z0 = (2 * c) / (g * Math.sqrt(ka))
    const opts = [ans, 'No crack (qKa ≥ 2c√Ka)', `${f2(z0)} m`, `${f2((2 * c) / g)} m`, `${f2((4 * c) / (g * Math.sqrt(ka)))} m`, `${f2(zc * 2 + 0.3)} m`]
    return {
      q: `Active wall, ${undrained ? `undrained clay φ = 0, cu = ${c}` : `c′ = ${c} kPa, φ′ = ${phi}°`}, γ = ${g} kN/m³${q ? `, surcharge q = ${q} kPa` : ''}. Depth of the tension crack?`,
      options: opts,
      answer: ans,
      why: no
        ? `qKa = ${f2(q * ka)} ≥ 2c√Ka = ${f2(2 * c * Math.sqrt(ka))}: the pressure is never negative, so **no crack**.`
        : `σ′a = (q + γz)Ka − 2c√Ka = 0 → zc = (2c/√Ka − q)/γ = (${f2((2 * c) / Math.sqrt(ka))} − ${q})/${g} = **${f2(zc)} m**${q ? ` (without q it would be ${f2(z0)} m)` : ''}. ${phi ? '' : 'φ = 0 → Ka = 1, zc = (2cu − q)/γ. '}Hc = 2zc is the unsupported cut height, not the crack.`,
      ref: 'e-rankine',
    }
  },
}

const plane: PickSkill = {
  key: 'plane',
  label: 'Failure-plane angle',
  gen: (r) => {
    const phi = randInt(r, 24, 38)
    const which = pick(r, ['a-h', 'p-h', 'p-v', 'a-maj', 'p-maj'] as const)
    const qs: Record<typeof which, [string, number, string]> = {
      'a-h': ['Active state: angle of the failure planes with the **horizontal**?', 45 + phi / 2, 'Active: σ′v is major, so the major principal plane is horizontal; failure planes at 45 + φ′/2 to it.'],
      'p-h': ['Passive state: angle of the failure planes with the **horizontal**?', 45 - phi / 2, 'Passive: σ′h is major (vertical major plane); failure planes at 45 + φ′/2 to the vertical = 45 − φ′/2 to the horizontal.'],
      'p-v': ['Passive state: angle of the failure planes with the **vertical** (major principal plane)?', 45 + phi / 2, 'Slide 21: “θ = 45 + φ/2 with major principal plane” — the vertical plane in passive.'],
      'a-maj': ['Active state: angle with the **major principal plane**?', 45 + phi / 2, 'Always 45 + φ′/2 from the major principal plane (2θ = 90 + φ′).'],
      'p-maj': ['Passive state: angle with the **minor principal plane**?', 45 - phi / 2, 'Minor plane is horizontal in passive: 45 − φ′/2.'],
    }
    const [q, v, why] = qs[which]
    const o = (x: number) => `${fmt(x, 1)}°`
    return { q: `φ′ = ${phi}°. ${q}`, options: [o(45 + phi / 2), o(45 - phi / 2), o(phi), o(90 - phi), o(45)], answer: o(v), why, ref: 'e-ka' }
  },
}

export const LEP_PICKS: PickSkill[] = [whichK, k0Formula, waterTrap, crack, plane]
