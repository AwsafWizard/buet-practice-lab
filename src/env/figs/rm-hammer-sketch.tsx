// Idealised head at the valve after a closure (no friction): the sketch that goes with a Joukowsky / Michaud answer.
// Rapid closure (T ≤ 2L/a): the head jumps by ΔH, holds until the reflection returns at 2L/a, swings to −ΔH, and repeats
// every 4L/a. Slow closure: the reflected relief wave arrives before the valve is shut, so the rise only builds to the
// Michaud value 2LΔv/(gT) and is held while the valve closes.
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import type { HammerOut } from '../engine/hammer'
import { sg } from './pump-work'

export function hammerPath(h: HammerOut, T: number): [number, number][] {
  const Tc = h.Tc
  const dH = h.dH
  if (h.rapid) {
    const r = Math.max(T, 1e-6)
    const pts: [number, number][] = [[0, 0], [r, dH]]
    for (let k = 1; k <= 3; k++) {
      const from = k % 2 ? dH : -dH
      pts.push([k * Tc, from], [k * Tc + r, -from])
    }
    pts.push([4 * Tc, -dH])
    return pts
  }
  return [[0, 0], [Tc, dH], [T, dH], [T + Tc, 0], [T + 2 * Tc, 0]]
}

export function HammerSketch({ h, T }: { h: HammerOut; T: number }) {
  const pts = hammerPath(h, T)
  const tMax = pts[pts.length - 1][0]
  const yM = Math.max(1, h.dH) * 1.35
  return (
    <div className="rounded-xl border border-line bg-panel2/40 p-2">
      <Chart
        w={400}
        h={210}
        pad={{ l: 44, r: 12, t: 10, b: 32 }}
        x={{ min: 0, max: tMax, label: 'time after the valve starts to close (s)' }}
        y={{ min: h.rapid ? -yM : 0, max: yM, label: 'head rise at the valve (m)' }}
        label="idealised head at the valve against time after closure"
      >
        {(s) => (
          <>
            <line x1={s.L} x2={s.R} y1={s.Y(0)} y2={s.Y(0)} stroke="var(--c-mute)" strokeWidth={1} />
            <line x1={s.L} x2={s.R} y1={s.Y(h.dH)} y2={s.Y(h.dH)} stroke="var(--c-bad)" strokeDasharray="4 3" />
            <text x={s.R - 4} y={s.Y(h.dH) - 4} fontSize={9} textAnchor="end" fill="var(--c-bad)">
              ΔH = {sg(h.dH, 3)} m
            </text>
            {[h.Tc, ...(h.rapid ? [2 * h.Tc] : [])].map((t, i) => (
              <g key={i}>
                <line x1={s.X(t)} x2={s.X(t)} y1={s.T} y2={s.B} stroke="var(--c-water)" strokeDasharray="3 3" />
                <text x={s.X(t) + 3} y={s.B - 4} fontSize={9} fill="var(--c-water)">
                  {i ? '4L/a' : `2L/a = ${sg(h.Tc, 3)} s`}
                </text>
              </g>
            ))}
            <line x1={s.X(T)} x2={s.X(T)} y1={s.T} y2={s.B} stroke="var(--c-load)" strokeDasharray="3 3" />
            <text x={s.X(T) + 3} y={s.T + 10} fontSize={9} fill="var(--c-load)">
              valve shut, T = {sg(T, 3)} s
            </text>
            <path d={pathOf(pts, s)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
          </>
        )}
      </Chart>
      <div className="text-xs text-faint mt-1">
        {h.rapid
          ? 'Rapid closure: the full Joukowsky rise is reached before the relief wave from the reservoir gets back (at 2L/a); the head then swings between +ΔH and −ΔH every 2L/a. Idealised: no friction.'
          : 'Slow closure: the relief wave returns (at 2L/a) while the valve is still closing, so the rise only builds to the Michaud value and dies away after the valve is shut. Idealised sketch.'}
      </div>
    </div>
  )
}
