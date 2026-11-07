// Practice problem on a lecture topic never asked in the 13 past papers: a flow net in anisotropic soil (kh ≠ kv) —
// transformed section, k′ = √(kh kv), seepage under a sheet pile with the solver's anisotropic option.
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { netLines, sheetPileExact, solveNet } from '../../engine/flownet'
import type { SmQ } from '../../types'
import { geomOf, NET_DEFAULT, netResults, type NetState } from './FlowNetLab'
import { NetView } from './NetView'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const sciTex = (v: number, d = 2) => v.toExponential(d).replace(/e([+-]\d+)/, (_, e) => `\\times 10^{${+e}}`)

// kh = 3.6e-5, kv = 4e-6 m/s → kh/kv = 9, k′ = 1.2e-5 m/s. NetState: kr = kx/kz, k = kz.
const KH = 3.6e-5
const KV = 4e-6
const ST: NetState = { ...NET_DEFAULT, kind: 'pile', T: 12, s: 6, hU: 5, hD: 1, kr: KH / KV, k: KV, Nf: 4, gsat: 19.5 }

let cache: { sol: ReturnType<typeof solveNet>; R: ReturnType<typeof netResults> } | null = null
function run() {
  if (!cache) {
    const sol = solveNet(geomOf(ST), 'final')
    cache = { sol, R: netResults(sol, ST) }
  }
  return cache
}

export const SEEP_NEW: SmQ[] = [
  {
    id: 'sm-own-seep-new1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: 'N1',
    marks: 0,
    topics: ['sm-seep'],
    title: 'Flow net in anisotropic soil: sheet pile on a stratified sand · not asked yet',
    text: `*${NOT_ASKED}*

A sheet pile is driven ${ST.s} m into a ${ST.T} m thick stratified sand that rests on an impermeable clay. Water stands ${ST.hU} m above the ground on the upstream side and ${ST.hD} m above it downstream. The sand has $k_h = 3.6 \\times 10^{-5}$ m/s and $k_v = 4 \\times 10^{-6}$ m/s; γsat = ${ST.gsat} kN/m³.

(a) Explain how a flow net is drawn for an anisotropic soil (transformed section) and find the equivalent permeability $k'$.

(b) Draw the flow net on the transformed section and find the seepage loss per metre run of the pile per day.

(c) Find the factor of safety against piping at the exit (Harza).

(d) What seepage would you have obtained by wrongly using $k_h$ with the net drawn on the true section?`,
    pages: [],
    checks: () => {
      const { R } = run()
      return [
        { key: 'kp', label: "k′ = √(kh kv)", value: Math.sqrt(KH * KV), unit: 'm/s' },
        { key: 'nd', label: 'Nd for Nf = 4', value: R.Nd, tol: 0.1 },
        { key: 'q', label: 'q (m³/day per m)', value: R.q * 86400, unit: 'm³/day', tol: 0.08 },
        { key: 'fs', label: 'FS piping (Harza)', value: R.icr / R.ie, tol: 0.15 },
      ]
    },
    solution: () => {
      const { sol, R } = run()
      const kp = Math.sqrt(KH * KV)
      const sc = Math.sqrt(KV / KH)
      const net = netLines(sol, ST.Nf)
      const exact = sheetPileExact(ST.s, ST.T)
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**(a) Transformed section.** With $k_h \\neq k_v$ the Laplace equation is $k_h\\,\\partial^2h/\\partial x^2 + k_v\\,\\partial^2h/\\partial z^2 = 0$. Put $x' = x\\sqrt{k_v/k_h}$: it becomes $\\partial^2h/\\partial x'^2 + \\partial^2h/\\partial z^2 = 0$, so on a section with every **horizontal** length multiplied by $\\sqrt{k_v/k_h} = \\sqrt{${f2(KV * 1e6)}/${f2(KH * 1e6)}} = ${f3(sc)}$ (vertical lengths unchanged) the net is drawn with curvilinear squares as usual. Flow through a square of the transformed section gives the equivalent permeability
$$k' = \\sqrt{k_hk_v} = \\sqrt{(${sciTex(KH, 1)})(${sciTex(KV, 1)})} = ${sciTex(kp, 2)}\\ \\text{m/s}$$
and $q = k'H\\,N_f/N_d$. On the true section the flow lines and equipotentials are no longer at right angles.`}</Md>
          <div className="grid cq-md:grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-mute mb-1">Transformed section (x × {f3(sc)}): squares</div>
              <NetView sol={sol} net={net} kind="pile" xScale={sc} />
            </div>
            <div>
              <div className="text-xs text-mute mb-1">True section: the same net, stretched sideways</div>
              <NetView sol={sol} net={net} kind="pile" />
            </div>
          </div>
          <Md>{`**(b) Seepage.** $H = ${ST.hU} - ${ST.hD} = ${f2(R.H)}$ m. A vertical pile in a uniform layer keeps its shape when only x is scaled, and the layer is long, so the transformed net is the same as the isotropic one: $N_f/N_d = ${f3(sol.shape)}$ from the solver (exact isotropic value ${f3(exact)}; the small difference is the solver's finite boundaries). With $N_f = ${ST.Nf}$, $N_d = ${f2(R.Nd)}$ (draw about ${ST.Nf}/${Math.round(R.Nd)}).
$$q = k'H\\frac{N_f}{N_d} = ${sciTex(kp, 2)} \\times ${f2(R.H)} \\times ${f3(sol.shape)} = ${sciTex(R.q, 3)}\\ \\text{m}^3\\text{/s per m} = ${f3(R.q * 86400)}\\ \\text{m}^3\\text{/day per m}$$
`}</Md>
          <Md>{`**(c) Piping.** $i_{cr} = (${f2(ST.gsat)} - 9.81)/9.81 = ${f3(R.icr)}$. The exit is vertical flow up the downstream face of the pile; vertical lengths are not scaled, so the last field's height is read off the transformed net directly: $l = ${f2(R.exitL)}$ m, $\\Delta h = H/N_d = ${f3(R.dh)}$ m, $i_e = ${f3(R.ie)}$,
$$FS = i_{cr}/i_e = ${f2(R.icr / R.ie)}$$
${R.icr / R.ie >= 3 ? 'adequate (≥ 3).' : 'too low (want ≥ 3–4): drive the pile deeper or add a filter blanket downstream.'}`}</Md>
          <Md>{`**(d) The trap.** Using $k_h$ on the true section gives $q = ${sciTex(KH, 1)} \\times ${f2(R.H)} \\times ${f3(sol.shape)} \\times 86400 = ${f3(KH * R.H * sol.shape * 86400)}$ m³/day per m — $\\sqrt{k_h/k_v} = ${f2(1 / sc)}$ times too much; using $k_v$ gives ${f2(sc)} of the right value. Only the geometric mean is consistent with the transformed net.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'The solver works with kx, kz directly, which is the same as the transformed section with k′ = √(kx kz) (see the flow-net simulator, kx/kz = 9, "transformed" view).'],
  },
]
