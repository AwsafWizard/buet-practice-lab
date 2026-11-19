// Worked Hardy Cross analysis, laid out as it is written in the exam: k of every pipe, then for each trial one table per
// loop (one row per pipe: k, Q round the loop, H = kQ^1.85 with the numbers, H/Q, and the column sums), the correction
// ΔQ with the sums substituted, and a table applying the corrections (the common pipe gets both).
// Every number comes from engine/network.hardyCross, so it agrees with `final` and the checks.
import { Md } from '../../components/ui'
import { hcExponent, hcK, type HcLaw, type HcLoop, type HcPipe, type HcResult } from '../engine/network'

const n = (v: number, d = 3) => {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return d > 0 ? s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : s
}
const sig = (v: number, p = 3) => {
  const s = v.toPrecision(p)
  if (!/e/.test(s)) return String(+s)
  const [m, e] = s.split('e')
  return `${+m}\\times10^{${+e}}`
}
const tx = String.raw
const roman = (id: string) => (/^[IVX]+$/.test(id) ? `\\text{${id}}` : id)

export function HcWork({ pipes, loops, law, res, unit = 'lps' }: { pipes: HcPipe[]; loops: HcLoop[]; law: HcLaw; res: HcResult; unit?: string }) {
  const x = hcExponent(law)
  const k: Record<string, number> = Object.fromEntries(pipes.map((p) => [p.id, hcK(p, law)]))
  const byId = Object.fromEntries(pipes.map((p) => [p.id, p]))
  const unitK = law.kind === 'k' && pipes.every((p) => (p.k ?? 1) === 1)
  const sense = (id: string, dir: 1 | -1) => (dir > 0 ? `${byId[id].from}→${byId[id].to}` : `${byId[id].to}→${byId[id].from}`)

  const intro: string[] = [
    `**Sign rule.** Going round a loop clockwise, a flow (and its head loss) in the same sense is **+**, against it **−**. Each loop's correction $\\Delta$ is added round the whole loop, so every node still balances after the correction.`,
    tx`**Head loss in a pipe:** $H = k\,Q^{${x}}$ with the sign of $Q$.`,
  ]
  if (unitK) intro.push(`The class sets $k = 1$ for every pipe, so $H = Q^{${x}}$.`)
  else if (law.kind === 'hw-lps-mm')
    intro.push(
      tx`With the printed law $h_L = ${sig(law.coef)}\,Q^{1.85}D^{-4.87}$ per metre (Q in ${unit}, D in mm), $k = ${sig(law.coef)}\times L\times D^{-4.87}$ for each pipe:`,
      `| Pipe | L (m) | D (mm) | k |\n|---|---|---|---|\n${pipes
        .map((p) => `| ${p.id} | ${p.L} | ${p.D} | $${sig(law.coef)}\\times${p.L}\\times${p.D}^{-4.87}=${sig(k[p.id])}$ |`)
        .join('\n')}`,
    )
  else intro.push(`| Pipe | k |\n|---|---|\n${pipes.map((p) => `| ${p.id} | ${sig(k[p.id])} |`).join('\n')}`)

  const trials = res.iters.map((it) => {
    const loopMd = it.loops.map((l) => {
      const lp = loops.find((q) => q.id === l.id)!
      const rows = l.rows
        .map((r) => {
          const dir = lp.pipes.find((q) => q.id === r.pipe)!.dir
          const kq = unitK ? `${n(Math.abs(r.q))}^{${x}}` : `${sig(k[r.pipe])}\\times${n(Math.abs(r.q))}^{${x}}`
          const sgn = r.q < 0 ? '-' : ''
          return `| ${r.pipe} (${sense(r.pipe, dir)}) |${unitK ? '' : ` ${sig(k[r.pipe])} |`} ${n(r.q)} | $${sgn}${kq}=${n(r.H)}$ | ${n(r.H)} ÷ ${n(r.q)} = ${n(r.Hq)} |`
        })
        .join('\n')
      const head = unitK ? '| Pipe (clockwise sense) | Q | H | H/Q |\n|---|---|---|---|' : '| Pipe (clockwise sense) | k | Q | H | H/Q |\n|---|---|---|---|---|'
      const sum = unitK ? `| **Σ** | | **ΣH = ${n(l.sumH)}** | **${n(l.sumHq)}** |` : `| **Σ** | | | **ΣH = ${n(l.sumH)}** | **${n(l.sumHq)}** |`
      return [
        `**Loop ${l.id}** (Q in ${unit}, + clockwise; H/Q is always positive)`,
        `${head}\n${rows}\n${sum}`,
        tx`$$\Delta_{${roman(l.id)}} = -\frac{\Sigma H}{${x}\,\Sigma (H/Q)} = -\frac{${n(l.sumH)}}{${x}\times${n(l.sumHq)}} = ${n(l.delta, 4)}\ \text{${unit}}$$`,
        Math.abs(l.sumH) < 1e-9
          ? ''
          : `${l.sumH > 0 ? 'ΣH is positive: the clockwise flows are too large, so Δ is negative (it takes flow off the clockwise pipes).' : 'ΣH is negative: the anticlockwise flows are too large, so Δ is positive (it adds flow in the clockwise sense).'}`,
      ]
        .filter(Boolean)
        .join('\n\n')
    })
    const corr = pipes
      .map((p) => {
        const terms = loops.flatMap((lp) => lp.pipes.filter((q) => q.id === p.id).map((q) => ({ lp: lp.id, dir: q.dir, d: it.loops.find((l) => l.id === lp.id)!.delta })))
        const sym = terms.map((t, i) => `${t.dir > 0 ? (i ? '+' : '') : '-'}\\Delta_{${roman(t.lp)}}`).join('')
        const num = terms.map((t, i) => `${t.dir > 0 ? (i ? ' + ' : '') : ' − '}(${n(t.d, 4)})`).join('')
        const pd = it.pipeDelta[p.id] ?? 0
        return `| ${p.id} (+ = ${p.from}→${p.to}) | ${n(it.start[p.id])} | $${sym}$ = ${num.trim()}${terms.length > 1 ? ` = ${n(pd, 4)}` : ''} | ${n(it.start[p.id])} + (${n(pd, 4)}) = **${n(it.end[p.id])}** |`
      })
      .join('\n')
    return [
      `### Trial ${it.n}`,
      ...loopMd,
      `**Apply the corrections.** Here a pipe's flow is + in the direction it is named (${pipes[0].id}: ${pipes[0].from}→${pipes[0].to}). A pipe gets $+\\Delta$ of a loop that runs along its named direction and $-\\Delta$ of a loop that runs against it; the pipe common to two loops gets both.`,
      `| Pipe | Q before | correction | Q after |\n|---|---|---|---|\n${corr}`,
    ].join('\n\n')
  })

  const last = res.iters[res.iters.length - 1]
  const first = res.iters[0]
  const close =
    res.iters.length > 1
      ? `The corrections shrink from ${first.loops.map((l) => `${n(Math.abs(l.delta), 3)}`).join(' and ')} to ${last.loops.map((l) => `${n(Math.abs(l.delta), 3)}`).join(' and ')} ${unit}: the flows are settling. A negative final flow means the water runs opposite to the pipe's name.`
      : `A negative flow means the water runs opposite to the pipe's name.`

  return <Md className="text-sm">{[...intro, ...trials, close].join('\n\n')}</Md>
}

