// Two-way slab "Which one?" drill: one- or two-way, Case 1–9, which table, thickness formula, detailing rules.

import { fmt } from '../../../components/DiagramView'
import { pick } from '../../../labs/common'
import { choices, type PickSkill } from '../../components/PickDrill'
import { CASE_TEXT, panelCase, type Edges, type SlabCase } from '../../engine/twoway'

const f = (v: number, d = 2) => fmt(v, d)

const oneTwo: PickSkill = {
  key: 'onetwo',
  label: 'One-way or two-way',
  gen: (r) => {
    const la = pick(r, [10, 12, 14, 15, 16])
    const lb = la * pick(r, [1, 1.2, 1.5, 1.8, 2, 2.4])
    const p = panelCase(lb, la, { top: true, right: true, bottom: true, left: true })
    const A = { one: 'One-way slab (design a 1 ft strip)', two: `Two-way, m = ${f(p.m, 3)}`, twoW: `Two-way, m = ${f(p.ratio, 3)}` }
    return {
      q: `Panel with beams on all four sides, clear spans ${f(la, 1)} ft × ${f(lb, 1)} ft. Which?`,
      options: p.oneWay ? [A.one, `Two-way, m = ${f(p.m, 3)}`, `Two-way, m = ${f(p.ratio, 3)}`] : [A.one, A.two, A.twoW],
      answer: p.oneWay ? A.one : A.two,
      why: `lb/la = ${f(p.ratio, 2)} ${p.oneWay ? '≥ 2 → one-way' : '< 2 → two-way'}; m = la/lb (short/long, clear spans) = ${f(p.m, 3)}, so m ≤ 1 always.`,
      ref: 'st-twoway',
    }
  },
}

const caseQ: PickSkill = {
  key: 'case',
  label: 'Case 1–9',
  gen: (r) => {
    const la = pick(r, [12, 14, 15, 16, 18])
    const lb = la + pick(r, [2, 3, 4, 6])
    const e: Edges = { top: r() < 0.5, right: r() < 0.5, bottom: r() < 0.5, left: r() < 0.5 }
    const p = panelCase(lb, la, e)
    const longC = p.longEdges.filter((k) => e[k]).length
    const shortC = p.shortEdges.filter((k) => e[k]).length
    const desc = `${longC === 0 ? 'neither' : longC === 1 ? 'one' : 'both'} of the ${lb} ft (long) edges and ${shortC === 0 ? 'neither' : shortC === 1 ? 'one' : 'both'} of the ${la} ft (short) edges`
    const L = (c: SlabCase) => `Case ${c}`
    const near: Record<SlabCase, SlabCase[]> = { 1: [2, 6, 7], 2: [1, 8, 9], 3: [5, 7, 6], 4: [6, 7, 8], 5: [3, 6, 9], 6: [7, 4, 5], 7: [6, 4, 3], 8: [9, 4, 2], 9: [8, 5, 2] }
    return {
      q: `Two-way panel ${la} ft × ${lb} ft. Continuous (or fixed) over ${desc}. Coefficient-table case?`,
      options: choices(r, L(p.case), near[p.case].map(L)),
      answer: L(p.case),
      why: `Case ${p.case}: ${CASE_TEXT[p.case]}. Watch 6 vs 7 and 8 vs 9: they differ only in whether the long or the short edge is the odd one.`,
      ref: 'sl-t123',
    }
  },
}

const table: PickSkill = {
  key: 'table',
  label: 'Which table / load',
  gen: (r) => {
    const c = pick(r, [
      { t: 'negative moment at a continuous edge', a: 'Table 12.3 with total $w_u$', ref: 'sl-t123' },
      { t: 'positive moment from dead load', a: 'Table 12.4 with $1.2w_D$', ref: 'sl-t124' },
      { t: 'positive moment from live load', a: 'Table 12.5 with $1.6w_L$', ref: 'sl-t125' },
      { t: 'load on the supporting beams / slab shear', a: 'Table 12.6 ($W_a$, $W_b$)', ref: 'sl-t126' },
      { t: 'negative moment at a discontinuous edge', a: '⅓ of the positive moment', ref: 'st-twoway' },
    ])
    return {
      q: `Coefficient method: ${c.t}. Where does it come from?`,
      options: ['Table 12.3 with total $w_u$', 'Table 12.4 with $1.2w_D$', 'Table 12.5 with $1.6w_L$', 'Table 12.6 ($W_a$, $W_b$)', '⅓ of the positive moment'],
      ordered: true,
      answer: c.a,
      why: 'Negative (12.3) uses the full wu; positive is split: dead-load part (12.4) + live-load part (12.5), because live load is patterned. Discontinuous edges get ⅓ of +M. Table 12.6 gives the load shares for beams and shear.',
      ref: c.ref,
    }
  },
}

const thick: PickSkill = {
  key: 'thick',
  label: 'Thickness formula',
  gen: (r) => {
    const c = pick(r, [
      { q: 'In $h = \\frac{l_n(0.8 + f_y/200\\,000)}{36 + 9\\beta}$, $l_n$ is', a: 'the long clear span', w: ['the short clear span', 'the long c/c span', 'the average clear span'] },
      { q: 'In the same formula, β is', a: 'long clear span / short clear span', w: ['short / long clear span', 'αm, the beam stiffness ratio', 'la / lb in c/c spans'] },
      { q: 'The lower limit on h from that formula (αm > 2) is', a: '3.5 in', w: ['5 in', '4 in', '3 in'] },
      { q: 'The old slide rule for two-way slab thickness is', a: 'h = perimeter / 180', w: ['h = ln/28', 'h = perimeter / 120', 'h = ln/33'] },
    ])
    return { q: `${c.q}:`, options: [c.a, ...c.w], answer: c.a, why: 'Two-way minimum thickness (eq. 13.8b): ln = long clear span in inches, β = long/short clear span, ≥ 3.5 in, round up. Old method: perimeter/180 ≥ 3.5 in.', ref: 'sl-h2way' }
  },
}

const detail: PickSkill = {
  key: 'detail',
  label: 'Detailing rule',
  gen: (r) => {
    const c = pick(r, [
      { q: 'Column-strip bar spacing compared with the middle strip spacing s', a: '1.5s (still ≤ 2h and ≥ As,min)', w: ['s', '2s', '0.67s'] },
      { q: 'Column-strip negative (top) steel', a: '⅔ of the middle-strip top steel', w: ['Same as the middle strip', '½ of the middle strip', '⅓ of the middle strip'] },
      { q: 'Corner steel at an exterior corner extends over', a: '$l_b/5$ each way, top and bottom', w: ['$l_a/4$ each way, top only', '$l_b/3$ each way', '$l_a/5$, bottom only'] },
      { q: 'Corner steel area', a: 'the maximum positive-moment steel, both directions', w: ['T&S steel', '⅓ of the positive steel', 'the column-strip steel'] },
      { q: 'Effective depth for the long-direction positive bars', a: '$d = h - 1.5$ in (second layer)', w: ['$d = h - 1$ in', '$d = h - 0.75$ in', '$d = h - 2.5$ in'] },
    ])
    return { q: `${c.q}?`, options: [c.a, ...c.w], answer: c.a, why: `**${c.a}**. (Class two-way recipe, steps 7–9.)`, ref: 'st-twoway' }
  },
}

export const TWOWAY_PICKS: PickSkill[] = [oneTwo, caseQ, table, thick, detail]
