// Worked reading of an iso-removal chart, the way it is written in the exam: the chart with the t0 line and the strips,
// then how every point is taken (r0 on the floor, each crossing depth, ΔR and Z_i of each strip) and R.
// Also the "minimum detention time for a target R" method: worked trials, an R against t0 graph and the interpolation.
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import { curveDepthAt, isoFromCurves, minTimeForRemoval, type IsoCurve, type IsoGrid } from '../engine/settle'
import { IsoChartFig } from './sed-iso'

const f = (v: number, d = 2) => fmt(v, d)
const pc = (v: number) => `${+v.toFixed(1)} %`

/** time at which a curve reaches the floor (depth H); null if it has not reached it by its last drawn point */
export function bottomTime(c: IsoCurve, H: number): number | null {
  const last = c.pts[c.pts.length - 1]
  if (last[1] < H - 1e-9) return null
  let lo = 0
  let hi = last[0]
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (curveDepthAt(c, mid).z >= H - 1e-9) hi = mid
    else lo = mid
  }
  return hi
}

export interface IsoChartData {
  curves: IsoCurve[]
  H: number
  tMax: number
  grid?: IsoGrid
}

/** chart + step-by-step reading at one detention time. `brief` drops the long explanations (for the 2nd, 3rd trial). */
export function IsoReading({ ch, t0, brief, label }: { ch: IsoChartData; t0: number; brief?: boolean; label?: string }) {
  const res = isoFromCurves(ch.curves, ch.H, t0)
  const cs = [...ch.curves].sort((a, b) => a.r - b.r)
  const onFloor = cs.map((c) => ({ c, tb: bottomTime(c, ch.H) })).filter((x) => x.tb !== null && x.tb <= t0 + 1e-9)
  const notYet = cs.filter((c) => !onFloor.some((x) => x.c === c))
  const tMax = Math.max(ch.tMax, Math.ceil((t0 * 1.05) / 15) * 15)
  const cross = res.levels.map((l) => `| ${l.r} % | ${f(l.z, 2)} m${l.extrapolated ? ' (curve extended past its drawn end)' : ''} |`).join('\n')
  const rows = res.strips
    .map((s) => `| ${+s.r1.toFixed(1)} → ${+s.r2.toFixed(1)} % | ${f(s.dr, 1)} | ${f(s.z2, 2)} to ${f(s.z1, 2)} | (${f(s.z2, 2)} + ${f(s.z1, 2)})/2 = **${f(s.zMid, 2)}** | ${f(s.area, 1)} |`)
    .join('\n')
  const steps = [
    brief
      ? `**Vertical line at $t_0 = ${+t0.toFixed(1)}$ min**, read the same way as above.`
      : `**1. Draw the detention-time line.** Go to $t_0 = ${+t0.toFixed(1)}$ min on the time axis and draw a vertical line down the whole depth (the red line).`,
    brief
      ? `$r_0$ = **${pc(res.r0)}**${onFloor.length ? ` (the ${pc(onFloor[onFloor.length - 1].c.r)} curve meets the floor at ${f(onFloor[onFloor.length - 1].tb!, 0)} min)` : ''}.`
      : `**2. Find $r_0$ on the floor.** Run along the bottom of the chart (depth ${ch.H} m). ${
          onFloor.length
            ? `By ${+t0.toFixed(1)} min these curves have already reached it: ${onFloor.map((x) => `${x.c.r} % (at ${f(x.tb!, 0)} min)`).join(', ')}. The highest of them is $r_0$ = **${pc(res.r0)}**: particles that settle at least that fast reach the floor within $t_0$ from any depth, so that fraction is removed completely.`
            : `No curve has reached the floor by ${+t0.toFixed(1)} min, so $r_0 = 0$.`
        }${notYet.length ? ` Curves still above the floor at $t_0$: ${notYet.map((c) => `${c.r} %`).join(', ')}.` : ''}`,
    brief
      ? ''
      : `**3. Read each crossing.** Where the red line cuts a curve still above the floor, go straight across to the depth axis and read the depth (the red dots):`,
    res.levels.length ? `| curve | depth where the line cuts it |\n|---|---|\n${cross}` : '',
    brief
      ? ''
      : `**4. Strips.** The floor counts as ${pc(res.r0)} at ${ch.H} m and the water surface as 100 % at 0 m. Between each pair of neighbouring points is one strip (the shaded bands): $\\Delta R$ = the difference of their %, and $Z_i$ = the depth of the strip's middle, halfway between its top and bottom (measured down from the surface). Its share of the removal is $\\Delta R\\cdot Z_i/Z_0$: the slower particles in that band are only removed from the part of the depth they manage to fall through.`,
    `| strip | ΔR (%) | from – to (m) | Zᵢ (m) | ΔR·Zᵢ |\n|---|---|---|---|---|\n${rows}\n| Σ | | | | **${f(res.sum, 1)}** |`,
    `${brief ? '' : '**5. Add up.** '}$R = r_0 + \\dfrac{\\sum \\Delta R\\,Z_i}{Z_0} = ${+res.r0.toFixed(1)} + \\dfrac{${f(res.sum, 1)}}{${ch.H}} = ${+res.r0.toFixed(1)} + ${f(res.partial, 1)} =$ **${f(res.R, 1)} %**${label ? ` (${label})` : ''}`,
  ].filter(Boolean)
  return (
    <div className="space-y-2">
      <IsoChartFig H={ch.H} tMax={tMax} curves={ch.curves} t0={t0} res={res} grid={ch.grid} />
      <Md className="text-sm">{steps.join('\n\n')}</Md>
    </div>
  )
}

/** the minimum detention time for a target removal: trials bracketing it, R against t0, and the interpolation */
export function MinTimeWork({ ch, target }: { ch: IsoChartData; target: number }) {
  const R = (t: number) => isoFromCurves(ch.curves, ch.H, t).R
  const tm = minTimeForRemoval(R, target, ch.tMax * 3)
  if (tm === null) return <Md className="text-sm">{`The curves never give ${target} %: no detention time is enough.`}</Md>
  const lo = Math.max(5, Math.floor(tm / 5) * 5)
  const hi = lo + 5
  const guess0 = Math.round(ch.tMax / 2 / 5) * 5
  const guess = Math.abs(guess0 - lo) >= 10 && Math.abs(guess0 - hi) >= 10 ? guess0 : lo > 25 ? lo - 20 : hi + 20
  const Rg = R(guess)
  const Rlo = R(lo)
  const Rhi = R(hi)
  const tI = lo + ((target - Rlo) / (Rhi - Rlo)) * (hi - lo)
  const tEnd = Math.max(ch.tMax, hi * 1.25)
  // start at half the earliest trial: near t0 = 0 the strip method still credits the lowest strip, which is not a real removal
  const tStart = Math.min(guess, lo) / 2
  const ts = Array.from({ length: 121 }, (_, i) => tStart + ((tEnd - tStart) * i) / 120)
  const trials: [number, number, string][] = [
    [guess, Rg, Rg < target ? 'too low: try longer' : 'more than enough: try shorter'],
    [lo, Rlo, 'just below the target'],
    [hi, Rhi, 'just above the target'],
  ]
  return (
    <div className="space-y-3 text-sm">
      <Md>{`**Method.** A longer detention time gives every particle longer to fall, so $R$ rises with $t_0$. There is no formula for $t_0$: guess a time, work out $R$ from the chart exactly as for "find R at a given $t_0$", then adjust until one trial is just below ${target} % and the next just above it. Interpolate between those two.`}</Md>
      <div className="rounded-lg border border-line p-2.5 space-y-2">
        <div className="font-bold text-accent">Trial 1: guess t₀ = {guess} min</div>
        <IsoReading ch={ch} t0={guess} />
        <Md>{`${f(Rg, 1)} % is ${Rg < target ? 'below' : 'above'} ${target} %, so the time ${Rg < target ? 'must be longer' : 'can be shorter'}. Stepping in 5-minute steps brings it between ${lo} and ${hi} min:`}</Md>
      </div>
      <div className="rounded-lg border border-line p-2.5 space-y-2">
        <div className="font-bold text-accent">Trial 2: t₀ = {lo} min</div>
        <IsoReading ch={ch} t0={lo} brief />
      </div>
      <div className="rounded-lg border border-line p-2.5 space-y-2">
        <div className="font-bold text-accent">Trial 3: t₀ = {hi} min</div>
        <IsoReading ch={ch} t0={hi} brief />
      </div>
      <div className="space-y-1">
        <div className="font-bold">R against t₀</div>
        <Chart w={380} h={220} x={{ min: 0, max: tEnd, label: 'detention time t₀ (min)' }} y={{ min: 0, max: 100, label: 'overall removal R (%)', ticks: [0, 20, 40, 60, 80, 100] }} label="overall removal against detention time">
          {(s) => (
            <>
              <path d={pathOf(ts.map((t) => [t, R(t)]), s)} fill="none" stroke="var(--c-accent)" strokeWidth={1.8} />
              <line x1={s.L} x2={s.R} y1={s.Y(target)} y2={s.Y(target)} stroke="var(--c-load)" strokeDasharray="4 3" />
              <text x={s.L + 4} y={s.Y(target) - 4} fontSize={9} fill="var(--c-load)">
                target {target} %
              </text>
              <line x1={s.X(tI)} x2={s.X(tI)} y1={s.Y(target)} y2={s.B} stroke="var(--c-load)" strokeDasharray="4 3" />
              {trials.map(([t, r]) => (
                <circle key={t} cx={s.X(t)} cy={s.Y(r)} r={3.4} fill="var(--c-ink)" data-tip={`t₀ = ${t} min, R = ${f(r, 1)} %`} />
              ))}
              <circle cx={s.X(tI)} cy={s.Y(target)} r={4} fill="var(--c-bad)" />
            </>
          )}
        </Chart>
        <Md className="text-xs text-mute">{`Dots are the three trials; the curve is R worked out at every t₀. Each corner in it is a moment when another iso-removal curve reaches the floor and $r_0$ jumps up.`}</Md>
      </div>
      <Md>{`| trial | t₀ (min) | R (%) | |\n|---|---|---|---|\n${trials.map(([t, r, w], i) => `| ${i + 1} | ${t} | ${f(r, 1)} | ${w} |`).join('\n')}`}</Md>
      <Md>{`**Interpolate** between trials 2 and 3: $t_0 = ${lo} + \\dfrac{${target} - ${f(Rlo, 1)}}{${f(Rhi, 1)} - ${f(Rlo, 1)}}\\times(${hi} - ${lo}) =$ **${f(tI, 1)} min**. Minimum detention time ≈ **${Math.ceil(tI)} min** (round up so the target is met).`}</Md>
    </div>
  )
}
