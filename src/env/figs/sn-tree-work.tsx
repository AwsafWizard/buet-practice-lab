// Worked branched (dead-end) network design, laid out as it is written in the exam: one table per step, one row per
// pipe, the arithmetic in the cells. Every number comes from the TreeResult of engine/network.designTree, so the
// tables always agree with `final` and the checks.
//   1. flow in each pipe, accumulated from the ends
//   2. diameter from continuity D = √(4Q/πV), rounded up
//   3. velocity in the adopted pipe and h_f = 4fLv²/2gD (her branch-design form)
//   4. pressure at each end = start − Σ h_f along its path, checked against the required pressure
import { Md } from '../../components/ui'
import type { TreeResult } from '../engine/network'

const n = (v: number, d = 2) => {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s
}
const comma = (v: number) => Math.round(v).toLocaleString('en')
const sig = (v: number, p = 3) => String(+v.toPrecision(p))
const FT = 0.3048

export type TreeFlowUnit = 'cfs' | 'lph' | 'lps' | 'm3d'
type Pipe = TreeResult['pipes'][number]

export function treeFlowStr(Q: number, unit: TreeFlowUnit) {
  if (unit === 'cfs') return n(Q / FT ** 3, 3)
  if (unit === 'lph') return comma(Q * 3.6e6)
  if (unit === 'lps') return n(Q * 1000, 2)
  return n(Q * 86400, 1)
}
const UNIT_LABEL: Record<TreeFlowUnit, string> = { cfs: 'cusec', lph: 'lph', lps: 'L/s', m3d: 'm³/day' }

/** the four step tables; `V` is the design velocity in m/s and `f` the Fanning factor used in designTree */
export function TreeWork({ res, unit, V, f }: { res: TreeResult; unit: TreeFlowUnit; V: number; f: number }) {
  const ftSys = unit === 'cfs'
  const U = UNIT_LABEL[unit]
  const q = (Q: number) => treeFlowStr(Q, unit)
  const kids = (p: Pipe) => res.pipes.filter((k) => k.from === p.to)
  const enlarged = new Map(res.enlarged.map((e) => [e.id, e]))
  const byTail = [...res.pipes].reverse()

  // 1. flows
  const flowRows = byTail
    .map((p) => {
      const ks = kids(p)
      const dem = p.Q - ks.reduce((s, k) => s + k.Q, 0)
      const draws = Math.abs(dem) > 1e-12
      const parts = [...(draws || !ks.length ? [`${q(draws ? dem : 0)} (node ${p.to})`] : []), ...ks.map((k) => `${q(k.Q)} (${k.id})`)]
      return `| ${p.id} | ${ks.length ? `${draws ? `node ${p.to} + ` : `node ${p.to} draws nothing; `}pipes ${ks.map((k) => k.id).join(', ')}` : `node ${p.to} only (an end)`} | ${parts.length > 1 ? `${parts.join(' + ')} = ` : ''}**${q(p.Q)}** |`
    })
    .join('\n')

  // 2. diameters
  const Vf = V / FT
  const why = (p: Pipe) => {
    const e = enlarged.get(p.id)
    if (e) return `enlarged ${e.from} → ${e.to} in (step 4)`
    if (p.rule === 'min') return 'below the 4 in minimum main'
    if (p.rule === 'forced') return 'size fixed'
    return 'next size up'
  }
  const dRows = res.pipes
    .map((p) =>
      ftSys
        ? `| ${p.id} | ${n(p.Qcfs, 3)} | $\\sqrt{\\dfrac{4(${n(p.Qcfs, 3)})}{\\pi(${n(Vf, 2)})}}$ = ${n(p.Dcalc / FT, 3)} ft = ${n(p.DcalcIn, 2)} in | **${p.Din} in** (${why(p)}) |`
        : `| ${p.id} | ${sig(p.Q)} | $\\sqrt{\\dfrac{4(${sig(p.Q)})}{\\pi(${n(V, 3)})}}$ = ${n(p.Dcalc * 1000, 1)} mm = ${n(p.DcalcIn, 2)} in | **${p.Din} in** (${why(p)}) |`,
    )
    .join('\n')

  // 3. velocity and head loss
  const hRows = res.pipes
    .map((p) => {
      if (ftSys) {
        const Dft = p.Din / 12
        return `| ${p.id} | ${n(p.Lft, 0)} ft | ${n(p.Qcfs, 3)} ÷ ${n((Math.PI * Dft * Dft) / 4, 4)} = ${n(p.vfps, 2)} fps | $\\dfrac{4(${f})(${n(p.Lft, 0)})(${n(p.vfps, 2)})^2}{2(32.2)(${n(Dft, 3)})}$ = ${n(p.hfFt, 3)} ft | ${n(p.hfFt, 3)} × 0.433 = **${n(p.hfPsi, 3)}** |`
      }
      const Lft = Math.abs(p.Lft - Math.round(p.Lft)) < 0.01 ? `${n(p.Lft, 0)} ft = ${n(p.Lm, 1)} m` : `${n(p.Lm, 1)} m`
      return `| ${p.id} | ${Lft} | ${sig(p.Q)} ÷ ${sig((Math.PI * p.Dm * p.Dm) / 4)} = ${n(p.v, 3)} m/s | $\\dfrac{4(${f})(${n(p.Lm, 1)})(${n(p.v, 3)})^2}{2(9.81)(${n(p.Dm, 4)})}$ = ${sig(p.hfM)} m = ${sig(p.hfFt)} ft | ${sig(p.hfFt)} × 0.433 = **${n(p.hfPsi, 3)}** |`
    })
    .join('\n')

  // 4. pressures
  const pipeTo = (node: string) => res.pipes.find((p) => p.to === node)!
  const tRows = res.terminals
    .map((t) => {
      const hs = t.path.slice(1).map((nd) => pipeTo(nd).hfPsi)
      return `| ${t.node} | ${t.path.join('–')} | ${n(res.startPsi, 2)} − ${hs.map((h) => n(h, 3)).join(' − ')} = **${n(t.p, 2)}** | ${t.ok ? `≥ ${res.minPsi} ✓` : `< ${res.minPsi} ✗`} |`
    })
    .join('\n')
  const worst = [...res.terminals].sort((a, b) => a.p - b.p)[0]

  const md = [
    `**1. Flow in each pipe.** Start at the ends and work back to the source: a pipe carries the demand of the node it feeds plus everything the pipes beyond that node carry (flows in ${U}).`,
    `| Pipe | Carries | Q (${U}) |\n|---|---|---|\n${flowRows}`,
    ftSys
      ? `**2. Diameter from continuity**, $Q = AV = \\dfrac{\\pi D^2}{4}V \\Rightarrow D = \\sqrt{\\dfrac{4Q}{\\pi V}}$, with $V = ${n(Vf, 2)}$ fps, $Q$ in cusec, so $D$ comes out in ft (× 12 for inches). Round **up** to a commercial size (2, 3, 4, 6, 8, 10 in…), never below the 4 in main.`
      : `**2. Diameter from continuity**, $Q = AV = \\dfrac{\\pi D^2}{4}V \\Rightarrow D = \\sqrt{\\dfrac{4Q}{\\pi V}}$, with $V = ${n(V, 3)}$ m/s (${n(Vf, 1)} fps) and $Q$ in m³/s, so $D$ comes out in m (÷ 0.0254 for inches). Round **up** to a commercial size (2, 3, 4, 6, 8, 10 in…), never below the 4 in main.`,
    `| Pipe | Q (${ftSys ? 'cusec' : 'm³/s'}) | D calculated | Adopted |\n|---|---|---|---|\n${dRows}`,
    `**3. Head loss in each pipe**, $h_f = \\dfrac{4fLv^2}{2gD}$ with $f = ${f}$ and the velocity in the **adopted** pipe, $v = Q/A$ (bigger pipe, slower water). Pressure: $h_f\\,[\\text{psi}] = h_f\\,[\\text{ft}] \\times 62.4/144 = h_f\\,[\\text{ft}] \\times 0.433$.`,
    `| Pipe | L | v = Q ÷ A | h_f | h_f (psi) |\n|---|---|---|---|---|\n${hRows}`,
    `**4. Pressure at every end** = pressure at the source − every $h_f$ on the way there (flat ground). Each must be at least ${res.minPsi} psi.`,
    `| End | Path | Pressure (psi) | Check |\n|---|---|---|---|\n${tRows}`,
    res.ok
      ? `The lowest end is node ${worst.node} at ${n(worst.p, 2)} psi, still at least ${res.minPsi} psi, so **every size stands**: no pipe needs enlarging.`
      : `Node ${worst.node} is still below ${res.minPsi} psi: enlarge the pipe that loses most on its path and redo steps 3 and 4.`,
    res.enlarged.length
      ? `(The first sizes left some ends below ${res.minPsi} psi, so the pipe losing most on a failing path was enlarged one size at a time: ${res.enlarged.map((e) => `${e.id} ${e.from} → ${e.to} in`).join(', ')}. The tables above show the final sizes.)`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  return <Md className="text-sm">{md}</Md>
}
