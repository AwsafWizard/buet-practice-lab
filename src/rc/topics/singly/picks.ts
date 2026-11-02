// Singly "Which one?" drill: strain zone and beam limit, ρ check against the table, ρmin term.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { type PickSkill } from '../../components/PickDrill'
import { rhoLimits } from '../../engine/materials'
import { zoneOf } from '../../engine/singly'

const f = (v: number, d = 2) => fmt(v, d)

const zone: PickSkill = {
  key: 'zone',
  label: 'εt → zone & limit',
  gen: (r) => {
    const eps = pick(r, [0.0015, 0.0025, 0.0032, 0.0038, 0.0041, 0.0046, 0.0049, 0.0055, 0.008])
    const z = zoneOf(eps, 60000)
    const A = {
      t: 'Tension-controlled, φ = 0.90',
      ok: 'Transition, φ = 0.483 + 83.3εt; OK for a beam',
      no: 'Transition but εt < 0.004: not allowed for a beam',
      c: 'Compression-controlled: not allowed for a beam',
    }
    const ans = z === 'tension' ? A.t : z === 'compression' ? A.c : eps >= 0.004 ? A.ok : A.no
    return {
      q: `Grade 60 singly reinforced beam, review gives εt = ${eps}. What is it and is it allowed?`,
      options: Object.values(A),
      ordered: true,
      answer: ans,
      why: 'εt ≥ 0.005 tension-controlled (φ = 0.9). εy (0.00207) < εt < 0.005 transition. Beams (flexural members with small axial load) need **εt ≥ 0.004** (ρ ≤ ρmax); below that add A′s or enlarge the section.',
      ref: 'm-phi',
    }
  },
}

const rho: PickSkill = {
  key: 'rho',
  label: 'ρ vs table limits',
  gen: (r) => {
    const fc = pick(r, [3000, 4000, 5000])
    const fy = pick(r, [40000, 60000])
    const L = rhoLimits(fc, fy)
    const band = pick(r, ['min', 'ok', 'trans', 'max'] as const)
    const rho = band === 'min' ? L.rhoMin * 0.7 : band === 'ok' ? (L.rhoMin + L.rho005) / 2 : band === 'trans' ? (L.rho005 + L.rhoMax) / 2 : L.rhoMax * 1.15
    const A = {
      min: 'Below ρmin: provide As,min',
      ok: 'OK, tension-controlled (φ = 0.9)',
      trans: 'OK but φ < 0.9 (between ρ0.005 and ρmax)',
      max: 'Above ρmax: doubly reinforce or enlarge',
    }
    return {
      q: `Design gives ρ = ${rho.toFixed(4)} for f′c = ${fc} psi, fy = ${fy / 1000} ksi. Verdict?`,
      options: Object.values(A),
      ordered: true,
      answer: A[band],
      why: `Table A.4: ρmin = ${L.rhoMin.toFixed(4)}, ρ0.005 = ${L.rho005.toFixed(4)}, ρmax (εt = 0.004) = ${L.rhoMax.toFixed(4)}.`,
      ref: 'f-rho',
    }
  },
}

const rmin: PickSkill = {
  key: 'rmin',
  label: 'ρmin term',
  gen: (r) => {
    const fc = pick(r, [3000, 3500, 4000, 4500, 5000, 6000])
    const fy = pick(r, [40000, 60000])
    const a = "$\\dfrac{3\\sqrt{f'_c}}{f_y}$",
      b = '$\\dfrac{200}{f_y}$'
    const t = 3 * Math.sqrt(fc)
    return {
      q: `As,min for f′c = ${fc} psi, fy = ${fy / 1000} ksi. Which term governs?`,
      options: [a, b],
      answer: t > 200 ? a : b,
      why: `3√f′c = ${f(t, 1)} vs 200 → the larger governs (3√f′c wins above f′c ≈ 4444 psi). ρmin = ${(Math.max(t, 200) / fy).toFixed(4)}.`,
      ref: 'f-rho',
    }
  },
}

export const SINGLY_PICKS: PickSkill[] = [zone, rho, rmin]
