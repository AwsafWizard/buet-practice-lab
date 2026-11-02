// One-way slab "Which one?" drill: ACI coefficient, h_min rule, T&S ratio, maximum spacing, coefficient validity.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { aciMoments, END_LABEL, fyFactor, HMIN_DIV, HMIN_LABEL, tsRatio, type EndSupport, type HminRule } from '../../engine/oneway'

const f = (v: number, d = 2) => fmt(v, d)
const C = (den: number, neg: boolean) => `$${neg ? '-' : '+'}\\tfrac{1}{${den}}$`

const coef: PickSkill = {
  key: 'coef',
  label: 'ACI coefficient',
  gen: (r) => {
    const n = pick(r, [2, 3, 4])
    const ends: [EndSupport, EndSupport] = [pick(r, ['spandrel', 'column', 'unrestrained'] as EndSupport[]), pick(r, ['spandrel', 'column', 'unrestrained'] as EndSupport[])]
    const secs = aciMoments(Array(n).fill(12), ends, 1).filter((s) => !s.mirror)
    const s = pick(r, secs)
    const endTxt = `left end on a ${END_LABEL[ends[0]]}, right end on a ${END_LABEL[ends[1]]}`
    const where =
      s.kind === 'neg'
        ? s.at === 0 || s.at === n
          ? `negative moment at the ${s.at === 0 ? 'left' : 'right'} exterior support`
          : `negative moment at ${s.at === 1 || s.at === n - 1 ? 'the first interior support' : 'an interior support (not the first)'}${s.at === 1 && n > 2 ? ' (left)' : ''}`
        : `positive moment in ${s.at === 0 ? 'the left end span' : s.at === n - 1 ? 'the right end span' : 'an interior span'}`
    const missing = ends.includes('unrestrained')
    const opts = [C(24, true), C(16, true), C(9, true), C(10, true), C(11, true), C(11, false), C(14, false), C(16, false)]
    return {
      q: `${n}-span continuous one-way slab, equal spans, ${endTxt}. Coefficient for the ${where}?`,
      options: choices(r, C(s.den, s.kind === 'neg'), opts),
      answer: C(s.den, s.kind === 'neg'),
      why: `Exterior support: spandrel −1/24, column −1/16, brick wall none. First interior support: −1/9 (two spans) / −1/10 (more). Other interior −1/11. End span +1/14 (integral) or +1/11 (unrestrained); interior span +1/16.${missing ? ' A brick-wall end has no negative moment to design.' : ''}`,
      ref: 'sl-aci',
    }
  },
}

const hmin: PickSkill = {
  key: 'hmin',
  label: 'h_min rule',
  gen: (r) => {
    const rule = pick(r, ['ss', 'one', 'both', 'cant'] as HminRule[])
    const fy = pick(r, [60000, 60000, 40000, 50000])
    const k = fyFactor(fy)
    const lab = (ru: HminRule, kk: number) => `$l/${HMIN_DIV[ru]}${kk === 1 ? '' : `\\times ${f(kk, 2)}`}$`
    const ans = lab(rule, k)
    return {
      q: `One-way slab span that is ${HMIN_LABEL[rule]}, fy = ${fy / 1000} ksi, normal-weight concrete. Minimum h = ?`,
      options: choices(r, ans, (['ss', 'one', 'both', 'cant'] as HminRule[]).flatMap((x) => [lab(x, 1), lab(x, k === 1 ? 0.8 : k)]), 4),
      answer: ans,
      why: `Simply supported l/20, one end continuous l/24, both ends l/28, cantilever l/10. fy ≠ 60 ksi → × (0.4 + fy/100 000)${k === 1 ? '' : ` = ${f(k, 2)}`}. Class: clear span, round up.`,
      ref: 'sl-hmin',
    }
  },
}

const ts: PickSkill = {
  key: 'ts',
  label: 'T&S steel ratio',
  gen: (r) => {
    const fy = pick(r, [40000, 50000, 60000, 75000, 80000])
    const ans = tsRatio(fy).toFixed(4)
    return {
      q: `Temperature & shrinkage steel (= slab As,min), deformed bars with fy = ${fy / 1000} ksi. ρ on the gross area = ?`,
      options: choices(r, ans, ['0.0020', '0.0018', '0.0014', '0.0015', '0.0025', '0.0012', (0.0018 * 60000 / fy).toFixed(4)]),
      answer: ans,
      why: 'Grade 40/50: 0.0020; Grade 60: 0.0018; fy > 60 ksi: 0.0018 × 60 000/fy ≥ 0.0014. On b × h (gross), not b × d.',
      ref: 'sl-ts',
    }
  },
}

const sp: PickSkill = {
  key: 'sp',
  label: 'Max bar spacing',
  gen: (r) => {
    const h = pick(r, [4, 4.5, 5, 6, 7, 8])
    const c = pick(r, [
      { t: 'main flexural bars of a one-way slab', k: 3 },
      { t: 'temperature & shrinkage bars', k: 5 },
      { t: 'two-way slab bars at a critical section', k: 2 },
    ])
    const ans = Math.min(c.k * h, 18)
    const L = (x: number) => `${f(x, 1)} in`
    return {
      q: `Slab h = ${h} in. Maximum spacing of the ${c.t}?`,
      options: choices(r, L(ans), [L(Math.min(3 * h, 18)), L(Math.min(5 * h, 18)), L(Math.min(2 * h, 18)), L(18), L(3 * h), L(5 * h)]),
      answer: L(ans),
      why: `One-way main bars ≤ 3h and 18 in; T&S ≤ 5h and 18 in; two-way critical sections ≤ 2h. Here ${c.k}h = ${f(c.k * h, 1)} → **${f(ans, 1)} in**.`,
      ref: 'sl-ts',
    }
  },
}

const valid: PickSkill = {
  key: 'valid',
  label: 'Coefficients allowed?',
  gen: (r) => {
    const c = pick(r, [
      { t: 'Three spans of 12, 13 and 12 ft, UDL, L = 80 psf, D = 90 psf, prismatic.', ok: true, w: 'all five conditions hold' },
      { t: 'Two spans of 10 ft and 14 ft, UDL.', ok: false, w: '14/10 = 1.4 > 1.2 (adjacent spans differ by more than 20 %)' },
      { t: 'Single simply supported span of 12 ft.', ok: false, w: 'needs two or more spans (single span: wl²/8)' },
      { t: 'Three equal spans, UDL, L = 300 psf, D = 75 psf.', ok: false, w: 'L > 3D' },
      { t: 'Two equal spans with a 4 ft cantilever at one end.', ok: false, w: 'cantilevers are not covered → statics with live-load patterns' },
      { t: 'Four equal 11 ft spans, UDL, L = 60 psf, D = 100 psf.', ok: true, w: 'all five conditions hold' },
    ])
    const A = { y: 'ACI coefficients OK', n: 'Not allowed: analyse (statics / moment distribution)' }
    return { q: `One-way slab: ${c.t} Can you use the ACI moment coefficients?`, options: Object.values(A), ordered: true, answer: c.ok ? A.y : A.n, why: `Conditions: ≥ 2 spans, larger ≤ 1.2 × smaller, UDL, L ≤ 3D, prismatic. Here: ${c.w}.`, ref: 'sl-aci' }
  },
}

export const ONEWAY_PICKS: PickSkill[] = [coef, hmin, ts, sp, valid]
