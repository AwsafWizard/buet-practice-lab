// Worked Type I (discrete) settling-column solution, laid out the way it is written in the exam:
// the readings table (x = C/C0, v = H/t), the x-against-v graph with the v0 line and the strips shaded,
// the interpolation for x0 as a bracket table, the strip table (Δx × mean v) and R.
import { Md } from '../../components/ui'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import type { TypeI } from '../engine/settle'

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('')
const f3 = (v: number) => v.toFixed(3)
const s3 = (v: number) => (Math.abs(v) < 1e-12 ? '0' : v.toPrecision(3))

/** velocities are shown as "× 10⁻²" (or whatever power fits) so the tables stay readable */
export function velScale(r: TypeI) {
  const vmax = Math.max(r.v0, ...r.rows.map((q) => q.v))
  const e = vmax > 0 && vmax < 1 ? Math.floor(Math.log10(vmax)) : 0
  return { k: 10 ** e, tag: e ? ` × 10${sup(e)}` : '' }
}

/** the two readings either side of v0 (the origin counts as the lower one when v0 is below every reading) */
export function bracket(r: TypeI) {
  const byX = r.rows.slice().sort((a, b) => a.x - b.x)
  const hiI = byX.findIndex((q) => q.v >= r.v0)
  if (hiI < 0) return null
  const hi = byX[hiI]
  const lo = hiI > 0 ? byX[hiI - 1] : { t: Infinity, C: 0, x: 0, v: 0 }
  return { lo, hi, origin: hiI === 0 }
}

export function TypeIWork({ r, H, C0, unit = 'm/min' }: { r: TypeI; H: number; C0: number; unit?: string }) {
  const { k, tag } = velScale(r)
  const vs = (v: number) => s3(v / k)
  const U = `${tag ? tag.trim() + ' ' : ''}${unit}`
  const byT = r.rows.slice().sort((a, b) => a.t - b.t)
  const br = bracket(r)

  // ---- graph
  const vMax = Math.max(r.v0, ...r.rows.map((q) => q.v)) / k
  const xTop = Math.min(1, Math.ceil((Math.max(...r.rows.map((q) => q.x)) + 0.02) * 10) / 10)
  const pts: [number, number][] = [[0, 0], ...r.rows.slice().sort((a, b) => a.x - b.x).map((q) => [q.v / k, q.x] as [number, number])]
  const xStep = vMax > 6 ? 2 : vMax > 3 ? 1 : 0.5
  const xMaxAx = Math.ceil((vMax * 1.06) / xStep) * xStep
  const xt = Array.from({ length: Math.round(xMaxAx / xStep) + 1 }, (_, i) => +(i * xStep).toFixed(2))
  const yt = Array.from({ length: Math.round(xTop * 10) + 1 }, (_, i) => +(i / 10).toFixed(1))
  const v0s = r.v0 / k

  const readings = `| t (min) | C (mg/L) | x = C/C₀ | v = H/t (${U}) |\n|---|---|---|---|\n${byT
    .map((q) => `| ${q.t} | ${q.C} | ${q.C}/${C0} = **${f3(q.x)}** | ${H}/${q.t} = **${vs(q.v)}** |`)
    .join('\n')}`

  const interpRows = br
    ? `| point | v (${U}) | x |\n|---|---|---|\n| ${br.origin ? 'origin (no particle is slower than 0)' : `slower reading (t = ${br.lo.t} min)`} | ${vs(br.lo.v)} | ${f3(br.lo.x)} |\n| **v₀ (loading rate)** | **${vs(r.v0)}** | **x₀ = ?** |\n| faster reading (t = ${br.hi.t} min) | ${vs(br.hi.v)} | ${f3(br.hi.x)} |`
    : ''
  const interp = br
    ? `$$x_0 = x_1 + \\frac{v_0 - v_1}{v_2 - v_1}\\,(x_2 - x_1) = ${f3(br.lo.x)} + \\frac{${vs(r.v0)} - ${vs(br.lo.v)}}{${vs(br.hi.v)} - ${vs(br.lo.v)}}\\,(${f3(br.hi.x)} - ${f3(br.lo.x)}) = ${f3(r.x0)}$$`
    : ''

  const stripRows = r.strips
    .map((s, i) => {
      const cut = i === r.strips.length - 1 && Math.abs(s.x2 - r.x0) < 1e-9 && !r.clamped
      return `| ${i + 1} | ${f3(s.x1)} → ${f3(s.x2)}${cut ? ' (x₀)' : ''} | ${f3(s.dx)} | (${vs(s.v1)} + ${vs(s.v2)})/2 = ${vs(s.vMean)} | ${f3(s.dx)} × ${vs(s.vMean)} = **${f3(s.area / k)}** |`
    })
    .join('\n')

  const md1 = [
    `**1. Turn every reading into a point.** $x = C/C_0$ is the fraction of particles still in suspension at that time, i.e. the fraction that settles **slower** than $v$. $v = H/t$ is the speed a particle needs to fall the whole column (${H} m) in that time.`,
    readings,
    `**2. Plot x against v** (graph below) and join the points, starting at the origin: no particle settles slower than $v = 0$.`,
  ].join('\n\n')

  const md2 = [
    r.clamped
      ? `**3. Read x₀ at v₀.** $v_0 = ${vs(r.v0)}$ ${U} is faster than every reading, so $x_0$ is taken at the fastest reading: $x_0 = ${f3(r.x0)}$.`
      : `**3. Read x₀ at v₀ (interpolate).** Find the two readings whose velocities sit either side of $v_0 = ${vs(r.v0)}$ ${U}; on the graph they are the two orange points, and the red dashed line goes up from $v_0$ to the line joining them, then across to the x axis.`,
    interpRows,
    interp,
    `So a fraction $x_0 = ${f3(r.x0)}$ settles slower than $v_0$, and **$1 - x_0 = ${f3(r.full)}$ settles faster than $v_0$: all of it is removed.**`,
    `**4. Partial removal of the slower particles.** A particle with $v < v_0$ is removed only if it starts low enough, i.e. in the ratio $v/v_0$. Add them up as $\\frac{1}{v_0}\\int_0^{x_0} v\\,dx$: the shaded area on the graph, cut into horizontal strips at the readings. Each strip is $\\Delta x \\times$ (mean of the velocities at its two ends).`,
    `| strip | x from → to | Δx | mean v (${U}) | Δx · v̄ (${U}) |\n|---|---|---|---|---|\n${stripRows}\n| **Σ** | 0 → ${f3(r.x0)} | ${f3(r.x0)} | | **${f3(r.sum / k)}** |`,
    `**5. Overall removal.**`,
    `$$R = (1 - x_0) + \\frac{\\sum \\Delta x\\,\\bar v}{v_0} = ${f3(r.full)} + \\frac{${f3(r.sum / k)}}{${vs(r.v0)}} = ${f3(r.full)} + ${f3(r.partial)} = ${f3(r.R)}$$`,
    `**R = ${(r.R * 100).toFixed(1)} %**`,
  ].join('\n\n')

  return (
    <div className="space-y-3 text-sm">
      <Md>{md1}</Md>
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <Chart
          w={400}
          h={250}
          pad={{ l: 46, r: 14, t: 12, b: 34 }}
          x={{ min: 0, max: xMaxAx, label: `settling velocity v (${U})`, ticks: xt }}
          y={{ min: 0, max: xTop, label: 'fraction remaining x = C/C₀', ticks: yt }}
          label="Type I column: fraction remaining x against settling velocity v, with the v0 line and the strips"
        >
          {(s) => (
            <>
              {r.strips.map((st, i) => (
                <g key={i}>
                  <rect x={s.X(0)} y={s.Y(st.x2)} width={Math.max(s.X(st.vMean / k) - s.X(0), 0)} height={Math.max(s.Y(st.x1) - s.Y(st.x2), 0)} fill={i % 2 ? 'var(--c-water)' : 'var(--c-accent)'} opacity={0.25} stroke="var(--c-line)" strokeWidth={0.5} />
                  {s.Y(st.x1) - s.Y(st.x2) > 9 && (
                    <text x={s.X(0) + 3} y={(s.Y(st.x1) + s.Y(st.x2)) / 2 + 3} fontSize={8} fill="var(--c-mute)">
                      {i + 1}
                    </text>
                  )}
                </g>
              ))}
              <path d={pathOf(pts, s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              {pts.slice(1).map(([v, x], i) => {
                const hot = br && ((x === br.lo.x && !br.origin) || x === br.hi.x)
                return <circle key={i} cx={s.X(v)} cy={s.Y(x)} r={hot ? 4 : 2.8} fill={hot ? 'var(--c-load)' : 'var(--c-ink)'} data-tip={`v = ${s3(v)}, x = ${f3(x)}`} />
              })}
              {r.rows.map((q, i) => (
                <text key={'t' + i} x={s.X(q.v / k) + 5} y={s.Y(q.x) + 3} fontSize={8} fill="var(--c-faint)">
                  {q.t} min
                </text>
              ))}
              {v0s <= xMaxAx && (
                <g>
                  <line x1={s.X(v0s)} x2={s.X(v0s)} y1={s.B} y2={s.Y(r.x0)} stroke="var(--c-bad)" strokeDasharray="4 3" strokeWidth={1.3} />
                  <line x1={s.L} x2={s.X(v0s)} y1={s.Y(r.x0)} y2={s.Y(r.x0)} stroke="var(--c-bad)" strokeDasharray="4 3" strokeWidth={1.3} />
                  <circle cx={s.X(v0s)} cy={s.Y(r.x0)} r={4} fill="var(--c-bad)" />
                  <text x={s.X(v0s) + 5} y={s.B - 5} fontSize={9} fill="var(--c-bad)">
                    v₀ = {vs(r.v0)}
                  </text>
                  <text x={s.L + 4} y={s.Y(r.x0) - 5} fontSize={9} fill="var(--c-bad)">
                    x₀ = {f3(r.x0)}
                  </text>
                </g>
              )}
            </>
          )}
        </Chart>
        <div className="text-xs text-faint mt-1">
          Dots are the readings (labelled with their time); orange dots bracket v₀. Red dashed: up from v₀ to the curve, across to x₀. Shaded strips (numbered) are Δx × mean v: their total area is Σ Δx·v̄.
        </div>
      </div>
      <Md>{md2}</Md>
    </div>
  )
}
