// Practice problem on a lecture topic never asked in the 13 past papers: percentage air voids na and air content ac
// (na = n·ac, S + ac = 1), on the block diagram.
import { Md } from '../../../components/ui'
import { nf, solvePhase, unitSys } from '../../engine/phase'
import type { SmQ } from '../../types'
import { PhaseStepsView } from './figs'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'

const U = unitSys('kN')
const A = { g: 19, w: 0.12, Gs: 2.68 }
const B = { na: 0.05, w: 0.12, Gs: 2.68 }
const runA = () => solvePhase(A, U.gw)
const runB = () => solvePhase(B, U.gw)
const pct = (v: number) => nf(v * 100, 4)

export const WV_NEW: SmQ[] = [
  {
    id: 'sm-own-wv-new1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: 'N1',
    marks: 0,
    topics: ['sm-wv'],
    title: 'Percentage air voids and air content · not asked yet',
    text: `*${NOT_ASKED}*

(a) A compacted fill has a moist unit weight of ${A.g} kN/m³ at a water content of ${A.w * 100} %; Gs = ${A.Gs}. Using the block diagram, find e, n, S, the air content $a_c$ and the percentage air voids $n_a$. Show that $n_a = n\\,a_c$ and $S + a_c = 1$.

(b) The specification for the next layer limits the air voids to ${B.na * 100} % at the same water content. Find the dry and moist unit weights the layer must reach, and its degree of saturation.`,
    pages: [],
    checks: () => {
      const a = runA().vals
      const b = runB().vals
      return [
        { key: 'e', label: '(a) e', value: a.e },
        { key: 'S', label: '(a) S', value: a.S * 100, unit: '%' },
        { key: 'ac', label: '(a) air content ac', value: a.ac * 100, unit: '%' },
        { key: 'na', label: '(a) air voids na', value: a.na * 100, unit: '%' },
        { key: 'gd', label: '(b) γd at na = 5 %', value: b.gd, unit: 'kN/m³' },
        { key: 'sb', label: '(b) S', value: b.S * 100, unit: '%' },
      ]
    },
    solution: () => {
      const sa = runA()
      const sb = runB()
      const a = sa.vals
      const b = sb.vals
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**Definitions.** Air content $a_c = V_a/V_v$ (share of the **voids** filled with air); percentage air voids $n_a = V_a/V$ (share of the **whole volume**). Since $V_v = V_w + V_a$: $S + a_c = 1$; and $n_a = \\dfrac{V_a}{V_v}\\cdot\\dfrac{V_v}{V} = a_c\\,n$.`}</Md>
          <Md>{`**(a)** Block diagram, $V = 1$ m³:`}</Md>
          <PhaseStepsView steps={sa.steps} u={U} />
          <Md>{`Checks: $S + a_c = ${pct(a.S)} + ${pct(a.ac)} = ${pct(a.S + a.ac)}$ %; $n\\,a_c = ${nf(a.n, 4)} \\times ${nf(a.ac, 4)} = ${pct(a.n * a.ac)}$ % $= n_a$. Formula route: $\\gamma_d = \\gamma/(1 + w) = ${nf(a.gd, 4)}$, $e = G_s\\gamma_w/\\gamma_d - 1 = ${nf(a.e, 4)}$, $S = wG_s/e = ${pct(a.S)}$ %, $n_a = n(1 - S) = ${pct(a.n * (1 - a.S))}$ %. Nearly ${pct(a.na)} % of the fill is air — it is well short of full compaction.`}</Md>
          <Md>{`**(b)** Block diagram with $V = 1$, $V_a = n_a = ${B.na}$; let $V_s = x$, then $V_w = wG_sx$ and $x + wG_sx + n_a = 1$:`}</Md>
          <PhaseStepsView steps={sb.steps} u={U} />
          <Md>{`In one line:
$$\\gamma_d = \\frac{(1 - n_a)G_s\\gamma_w}{1 + wG_s} = \\frac{(1 - ${B.na})(${B.Gs})(9.81)}{1 + (${B.w})(${B.Gs})} = ${nf(b.gd, 4)}\\ \\text{kN/m}^3$$
γ = γd(1 + w) = **${nf(b.g, 4)} kN/m³**, S = **${pct(b.S)} %**. With $n_a = 0$ this is the zero-air-voids line $\\gamma_{zav} = G_s\\gamma_w/(1 + wG_s)$; an "air-voids line" ($n_a$ = 5 or 10 %) is drawn just below it on a compaction plot.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'Air content and percentage air voids are defined in SJMY sir\'s Lecture 2 (ac = Va/Vv, S + ac = 1, na = Va/V); AJK sir\'s Topic 1 slides stop at S.'],
  },
]
