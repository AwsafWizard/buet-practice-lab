// Basics "Which one?" drill: φ from εt, load combination, β1, cover, effective depth.

import { fmt } from '../../../components/DiagramView'
import { pick, randInt } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { beta1, epsY, phiFlex, wu } from '../../engine/materials'

const f = (v: number, d = 2) => fmt(v, d)

const phi: PickSkill = {
  key: 'phi',
  label: 'φ from εt',
  gen: (r) => {
    const spiral = r() < 0.25
    const eps = pick(r, [0.0012, 0.0018, 0.0026, 0.0034, 0.0042, 0.0048, 0.0052, 0.0075, 0.012])
    const ey = epsY(60000)
    const ans = eps >= 0.005 ? '0.90' : eps <= ey ? (spiral ? '0.75' : '0.65') : '$0.483 + 83.3\\varepsilon_t$'
    const shown = eps > ey && eps < 0.005 && spiral ? null : ans
    if (!shown) return phi.gen(r)
    return {
      q: `Grade 60 steel, ${spiral ? 'spirally reinforced' : 'tied (or beam)'} section, εt = ${eps}. φ = ?`,
      options: ['0.90', '0.65', '0.75', '$0.483 + 83.3\\varepsilon_t$'],
      answer: ans,
      why: `εy = 0.00207. εt ≥ 0.005 → tension-controlled 0.90; εt ≤ εy → compression-controlled (0.65 tied, 0.75 spiral); between → 0.483 + 83.3εt${ans.startsWith('$') ? ` = ${f(phiFlex(eps), 3)}` : ''}.`,
      ref: 'm-phi',
    }
  },
}

const combo: PickSkill = {
  key: 'combo',
  label: 'Load combination',
  gen: (r) => {
    const old = r() < 0.2
    const D = randInt(r, 10, 40) / 10
    const L = pick(r, [0, 0.1, 0.2, 0.4, 1, 1.5, 2.5])
    const a = '$1.4D$',
      b = '$1.2D + 1.6L$',
      c = '$1.4D + 1.7L$'
    const ans = old ? c : wu(D, L) > 1.2 * D + 1.6 * L ? a : b
    return {
      q: `${old ? 'An old (pre-2002) paper says "use ACI load factors of that time". ' : ''}D = ${D} k/ft (incl. self-weight), L = ${L} k/ft. Which factored load governs?`,
      options: [a, b, c],
      answer: ans,
      why: old ? 'Old ACI (≤ 1999): U = 1.4D + 1.7L with the old φ values.' : `1.4D = ${f(1.4 * D, 3)}, 1.2D + 1.6L = ${f(1.2 * D + 1.6 * L, 3)} → the larger governs. 1.4D only wins when L < D/8.`,
      ref: 'm-loads',
    }
  },
}

const b1: PickSkill = {
  key: 'b1',
  label: 'β₁',
  gen: (r) => {
    const fc = pick(r, [2500, 3000, 4000, 4500, 5000, 5500, 6000, 7000, 8000, 9000])
    const ans = beta1(fc).toFixed(3)
    return {
      q: `f′c = ${fc} psi. β₁ = ?`,
      options: choices(r, ans, ['0.850', '0.825', '0.800', '0.775', '0.750', '0.700', '0.650']),
      answer: ans,
      why: 'β₁ = 0.85 up to 4000 psi, then −0.05 per 1000 psi, not below 0.65.',
      ref: 'f-block',
    }
  },
}

const cover: PickSkill = {
  key: 'cover',
  label: 'Clear cover',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Footing cast against and permanently exposed to earth', a: '3 in' },
      { t: 'Retaining wall face exposed to weather, #8 bars', a: '2 in' },
      { t: 'Exterior column exposed to weather, #5 ties and #5 bars', a: '1½ in' },
      { t: 'Interior floor slab, #4 bars', a: '¾ in' },
      { t: 'Interior beam (to the stirrups)', a: '1½ in' },
    ])
    return { q: `${c.t}. Minimum clear cover?`, options: ['3 in', '2 in', '1½ in', '¾ in'], answer: c.a, why: 'ACI 20.6.1: earth-cast 3 in; weather #6–#18 2 in, #5 and smaller 1½ in; interior slabs ¾ in; interior beams and columns 1½ in to the ties/stirrups.', ref: 'm-cover' }
  },
}

const dEff: PickSkill = {
  key: 'd',
  label: 'Effective depth',
  gen: (r) => {
    const slab = r() < 0.3
    if (slab) {
      const h = pick(r, [4.5, 5, 5.5, 6, 7])
      const db = pick(r, [0.5, 0.625])
      const ans = h - 0.75 - db / 2
      const L = (x: number) => `${f(x, 3)} in`
      return {
        q: `Slab h = ${h} in, ${db === 0.5 ? '#4' : '#5'} bars, ¾ in cover. d = ?`,
        options: choices(r, L(ans), [L(h - 1), L(h - 0.75), L(h - 2.5), L(h - 0.75 - db)]),
        answer: L(ans),
        why: `d = h − ¾ − db/2 = **${f(ans, 3)} in** (the class often rounds to h − 1 in).`,
        ref: 'm-cover',
      }
    }
    const h = pick(r, [18, 20, 22, 24, 26, 30])
    const two = r() < 0.5
    const ans = two ? h - 3.5 : h - 2.5
    const L = (x: number) => `${f(x, 1)} in`
    return {
      q: `Beam h = ${h} in, #3 stirrups, 1.5 in cover, tension bars in ${two ? 'two layers (1 in clear between)' : 'one layer'}. d (to the steel centroid) = ?`,
      options: choices(r, L(ans), [L(h - 2.5), L(h - 3.5), L(h - 1.5), L(h - 4.5)]),
      answer: L(ans),
      why: `Class rule: one layer d = h − 2.5 in; two layers d = h − 3.5 in (to the centroid). dt is to the lowest layer.`,
      ref: 'm-cover',
    }
  },
}

export const BASICS_PICKS: PickSkill[] = [phi, combo, b1, cover, dEff]
