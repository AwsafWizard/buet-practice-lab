// Shear "Which one?" drill: which test for a field case, failure-plane angle, drainage valves, envelope method, CU effective stresses.
import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'
import { failureAngle, phiFromCircle } from '../../engine/shear'

const f2 = (v: number) => fmt(v, 2)

const fieldTest: PickSkill = {
  key: 'test',
  label: 'Which test for the field case?',
  gen: (r) => {
    const cases: [string, 'UU' | 'CU' | 'CD', string][] = [
      ['An oil tank on saturated clay is filled quickly; check bearing capacity at the end of filling.', 'UU', 'Rapid loading of saturated clay, no time to drain: undrained, total stress, **cu (φu = 0)** from UU / unconfined / vane (2007-08 Q1(d)).'],
      ['An embankment is built quickly on soft clay: stability at the end of construction.', 'UU', 'End of construction on soft clay = **UU** analysis.'],
      ['A footing is placed on saturated clay and loaded within days.', 'UU', 'Short term, no drainage → **UU**.'],
      ['An embankment is raised in a second stage after the clay consolidated under the first stage.', 'CU', 'The clay has consolidated under stage 1, then is loaded quickly → **CU**.'],
      ['A reservoir behind an earth dam is drawn down rapidly.', 'CU', 'The dam soil was consolidated under the full reservoir; drawdown is quick → **CU** (rapid drawdown).'],
      ['Long-term stability of a cut slope in clay, years after excavation.', 'CD', 'Pore pressures have equilibrated: drained, effective stress → **CD** (c′, φ′).'],
      ['An embankment on clay many years after construction.', 'CD', 'Long term → **CD**.'],
      ['A clean sand foundation loaded by a building.', 'CD', 'Sand drains as fast as it is loaded → drained (CD / direct shear).'],
    ]
    const [q, a, why] = pick(r, cases)
    return { q, options: ['UU', 'CU', 'CD'], answer: a, why, ref: 's-tests', ordered: true }
  },
}

const planeAngle: PickSkill = {
  key: 'plane',
  label: 'Failure-plane angle',
  gen: (r) => {
    const mode = pick(r, ['fwd', 'fwd', 'back', 'uc'] as const)
    const o = (x: number) => `${fmt(x, 1)}°`
    if (mode === 'uc') return { q: 'Unconfined compression test on saturated clay (φu = 0). The failure plane makes what angle with the horizontal?', options: [o(45), o(60), o(30), o(90)], answer: o(45), why: 'θ = 45 + φ/2 with φu = 0 → **45°** (slide 59).', ref: 's-mohr' }
    if (mode === 'back') {
      const th = randInt(r, 52, 64)
      const phi = 2 * (th - 45)
      return { q: `A CD test on NC clay: the failure plane was measured at ${th}° to the horizontal (2016-17 Q7). φ′ = ?`, options: [o(phi), o(th - 45), o(90 - th), o(th / 2)], answer: o(phi), why: `θ = 45 + φ′/2 → φ′ = 2(θ − 45) = **${phi}°**.`, ref: 's-mohr' }
    }
    const s3 = randInt(r, 50, 300, 10),
      dev = randInt(r, 80, 400, 10)
    const phi = phiFromCircle(s3, dev)
    const th = failureAngle(phi)
    return { q: `CD test, NC clay: σ3 = ${s3} kPa, deviator at failure ${dev} kPa (σ1 vertical). Angle of the failure plane with the horizontal?`, options: [o(th), o(45 - phi / 2), o(phi), o(45)], answer: o(th), why: `sin φ′ = R/(σ3 + R) = ${dev / 2}/${s3 + dev / 2} → φ′ = ${f2(phi)}°; θ = 45 + φ′/2 = **${f2(th)}°** from the major principal (horizontal) plane.`, ref: 's-mohr' }
  },
}

const valves: PickSkill = {
  key: 'valve',
  label: 'Drainage valves (T/F)',
  gen: (r) => {
    const st: [string, boolean, string][] = [
      ['In a CU test the drainage valve is open during consolidation and closed during shear.', true, 'CU: C = valve open in phase 1, U = closed in phase 2 (slides 50–51).'],
      ['In a CD test the valve is closed during consolidation and open during shear.', false, 'CD: open in **both** phases.'],
      ['In a UU test the drainage valve is always open.', false, 'UU: **always closed**.'],
      ['During shear in a CD test the pore-pressure gauge shows no excess pressure.', true, 'Slow loading with the valve open keeps Δu ≈ 0.'],
      ['A CD test gives only total-stress parameters.', false, 'u = 0, so total = effective: CD gives c′, φ′.'],
      ['Both total and effective parameters can be found from a CU test with pore-pressure measurement.', true, 'Total circles → c, φ; shift by uf → c′, φ′.'],
      ['A confining pressure is applied in a direct shear test.', false, 'Direct shear applies no σ3 (slide 36).'],
      ['A direct shear specimen fails along a predefined plane.', true, 'The horizontal plane between the two halves — not necessarily the weakest.'],
      ['For a normally consolidated clay φ′ is greater than φcu.', true, 'Positive uf moves the effective circles left: φ′ > φ (slide 53).'],
      ['The unconfined compression test can be used on clean dry sand.', false, '“Applicable for cohesive soil only!”'],
    ]
    const [q, a, why] = pick(r, st)
    return { q: `True or false (2023-24 Q3(b) style): ${q}`, options: ['True', 'False'], answer: a ? 'True' : 'False', why, ref: 's-tests', ordered: true }
  },
}

const envMethod: PickSkill = {
  key: 'fit',
  label: 'Which envelope method?',
  gen: (r) => {
    const opts = ['sin φ = R/C (through the origin)', 'common tangent: sin φ = (R2 − R1)/(C2 − C1)', 'p–q line: sin φ = tan α, c = a/cos φ', 'horizontal: φu = 0, cu = R', 'regression τ = c + σ tan φ']
    const cases: [string, number, string][] = [
      ['One CD test on a normally consolidated clay specimen.', 0, 'NC clay: c′ = 0 (slide 46), so one circle fixes φ′: sin φ′ = R/(σ3 + R).'],
      ['Two CU tests on an OC clay (c′ ≠ 0), effective circles drawn.', 1, 'Two circles, c unknown: the exact common tangent.'],
      ['Three CU specimens; “draw the modified failure envelope”.', 2, 'Modified envelope = Kf line through the (p, q) tops of the circles.'],
      ['Three UU tests on saturated clay with nearly equal deviators.', 3, 'Equal circles → horizontal envelope, φu = 0.'],
      ['Four direct shear tests (σ, τf points).', 4, 'Direct shear gives points on the envelope directly: straight-line fit (the slide’s Excel trend line).'],
      ['Four CU specimens whose circles are not exactly co-tangent.', 2, 'Three or more circles: least squares on the p–q points.'],
    ]
    const [q, i, why] = pick(r, cases)
    return { q, options: opts, answer: opts[i], why, ref: 's-mohr' }
  },
}

const effective: PickSkill = {
  key: 'eff',
  label: 'CU effective stresses',
  gen: (r) => {
    const s3 = randInt(r, 70, 400, 10)
    const dev = randInt(r, 100, 500, 10)
    const u = pick(r, [-65, -20, -10, 25, 50, 90, 110, 125])
    const s1p = s3 + dev - u
    const o = (x: number) => `${f2(x)} kPa`
    return {
      q: `CU test: σ3 = ${s3} kPa, deviator at failure ${dev} kPa, uf = ${u} kPa. σ′1 at failure = ?`,
      options: [o(s1p), o(s3 + dev), o(s3 + dev + u), o(s3 + dev - 2 * u), o(dev - u)],
      answer: o(s1p),
      why: `σ1 = σ3 + Δσ = ${s3 + dev}; σ′1 = σ1 − uf = **${f2(s1p)}** kPa (and σ′3 = ${s3 - u}). The deviator is the same for total and effective circles.${u < 0 ? ' Negative uf (dilating OC / compacted clay) **increases** σ′.' : ''}`,
      ref: 's-ab',
    }
  },
}

export const SHEAR_PICKS: PickSkill[] = [fieldTest, planeAngle, valves, envMethod, effective]
