// Worked Chick–Watson rate constant: the data table with every column the least-squares slope needs,
// the plot of −ln(N/N0) against C·t with the fitted line through the origin, and k with the sums substituted.
import { Md } from '../../components/ui'
import { Chart, linTicks, pathOf } from '../../soil/topics/consol/plot'
import { chickWatson } from '../engine/chlorine'

const f = (v: number, d = 3) => v.toFixed(d)

export function ChickWatsonWork({ C, data, unitT = 's' }: { C: number; data: { t: number; N: number }[]; unitT?: string }) {
  const cw = chickWatson({ C, data })
  const N0 = data[0].N
  const rows = cw.pts.map((q) => ({ ...q, y: -q.lnR, xy: -q.lnR * q.ct, xx: q.ct * q.ct }))
  const Sxy = rows.reduce((s, q) => s + q.xy, 0)
  const Sxx = rows.reduce((s, q) => s + q.xx, 0)
  const ctMax = Math.max(...rows.map((q) => q.ct), 1e-9)
  const yMaxData = Math.max(...rows.map((q) => q.y), cw.k * ctMax, 1e-6)
  const xt = linTicks(0, ctMax * 1.05, 5)
  const xMax = xt[xt.length - 1] >= ctMax ? xt[xt.length - 1] : ctMax * 1.05
  const yt = linTicks(0, yMaxData * 1.1, 5)
  const yMax = yt[yt.length - 1] >= yMaxData ? yt[yt.length - 1] : yMaxData * 1.1
  const tri = { x1: xMax * 0.35, x2: xMax * 0.75 }
  const table = [
    `| t (${unitT}) | N | N/N₀ | −ln(N/N₀) | C·t = ${C} × t | (−ln)·(C·t) | (C·t)² |`,
    `|---|---|---|---|---|---|---|`,
    ...rows.map((q) => `| ${q.t} | ${q.N} | ${q.N}/${N0} = ${f(q.N / N0, 4)} | ${f(q.y, 3)} | ${f(q.ct, 2)} | ${f(q.xy, 3)} | ${f(q.xx, 2)} |`),
    `| **Σ** | | | | | **${f(Sxy, 3)}** | **${f(Sxx, 2)}** |`,
  ].join('\n')
  return (
    <div className="space-y-3 text-sm">
      <Md>
        {[
          `**1. Linearise the model.** Chick–Watson with $n = 1$: $\\ln\\dfrac{N}{N_0} = -k\\,C\\,t$. So $-\\ln(N/N_0)$ plotted against $C\\,t$ is a straight line **through the origin** with slope $k$ (at $t = 0$ nothing is killed yet).`,
          `**2. Work every row** ($N_0 = ${N0}$, $C = ${C}$ mg/L):`,
          table,
          `**3. Plot** $-\\ln(N/N_0)$ against $C\\,t$ (graph below) and draw the best straight line through the origin.`,
        ].join('\n\n')}
      </Md>
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <Chart
          w={400}
          h={240}
          pad={{ l: 46, r: 14, t: 12, b: 34 }}
          x={{ min: 0, max: xMax, label: `C·t (mg·${unitT}/L)`, ticks: xt }}
          y={{ min: 0, max: yMax, label: '−ln(N/N₀)', ticks: yt }}
          label="Chick–Watson plot: minus ln of N over N0 against C times t, with the line through the origin"
        >
          {(s) => (
            <>
              <path d={pathOf([[0, 0], [xMax, cw.k * xMax]], s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              <path
                d={`M${s.X(tri.x1)},${s.Y(cw.k * tri.x1)} H${s.X(tri.x2)} V${s.Y(cw.k * tri.x2)}`}
                fill="none"
                stroke="var(--c-bad)"
                strokeDasharray="4 3"
                strokeWidth={1.2}
              />
              <text x={(s.X(tri.x1) + s.X(tri.x2)) / 2} y={s.Y(cw.k * tri.x1) + 12} fontSize={9} textAnchor="middle" fill="var(--c-bad)">
                Δ(C·t)
              </text>
              <text x={s.X(tri.x2) + 4} y={(s.Y(cw.k * tri.x1) + s.Y(cw.k * tri.x2)) / 2} fontSize={9} fill="var(--c-bad)">
                Δ(−ln) → slope k = {f(cw.k, 3)}
              </text>
              {rows.map((q, i) => (
                <circle key={i} cx={s.X(q.ct)} cy={s.Y(q.y)} r={3.2} fill="var(--c-ink)" data-tip={`C·t = ${f(q.ct, 2)}, −ln = ${f(q.y, 3)}`} />
              ))}
            </>
          )}
        </Chart>
        <div className="text-xs text-faint mt-1">Dots: the readings. Line: the least-squares fit forced through the origin; its slope is k. The red triangle shows rise over run.</div>
      </div>
      <Md>
        {[
          `**4. Slope through the origin (least squares).** Minimising the squared misfit of $y = kx$ gives $k = \\sum xy / \\sum x^2$, with $x = C\\,t$ and $y = -\\ln(N/N_0)$:`,
          `$$k = \\frac{\\sum (-\\ln)(C\\,t)}{\\sum (C\\,t)^2} = \\frac{${f(Sxy, 3)}}{${f(Sxx, 2)}} = ${f(cw.k, 4)}\\ \\text{L/mg}\\cdot\\text{${unitT}}$$`,
          `**k = ${f(cw.k, 3)} L/mg·${unitT}**. (By hand, the slope of a line drawn by eye through the origin gives nearly the same.)`,
        ].join('\n\n')}
      </Md>
    </div>
  )
}
