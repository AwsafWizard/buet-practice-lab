// Water hammer pictures: the pipe coloured by pressure at one instant, and the head-time trace at the valve.
import { fmt } from '../../components/DiagramView'
import type { HammerSim } from '../engine/hammer'
import { LineChart } from './pump-chart'

/** colour for a head relative to steady: blue (low) - neutral - red (high) */
function pressColor(h: number, h0: number, span: number) {
  const r = Math.max(-1, Math.min(1, (h - h0) / span))
  if (Math.abs(r) < 0.02) return 'var(--c-water)'
  return r > 0 ? `color-mix(in oklab, var(--c-bad) ${Math.round(r * 100)}%, var(--c-water))` : `color-mix(in oklab, var(--c-accent2) ${Math.round(-r * 100)}%, var(--c-water))`
}

export function HammerPipe({ sim, k, a, L, showTank }: { sim: HammerSim; k: number; a: number; L: number; showTank?: boolean }) {
  const W = 640
  const Hh = 190
  const kk = Math.min(Math.max(0, k), sim.t.length - 1)
  const H = sim.prof[kk]
  const span = Math.max(5, Math.max(sim.Hmax - sim.H0, sim.H0 - sim.Hmin))
  const px0 = 70
  const px1 = 560
  const cy = 100
  const th = 34
  const seg = (px1 - px0) / sim.N
  const tau = sim.tau[kk]
  const t = sim.t[kk]
  // pressure profile line above the pipe
  const lo = sim.Hmin - span * 0.05
  const hi = sim.Hmax + span * 0.05
  const Y = (h: number) => 70 - ((h - lo) / (hi - lo)) * 55
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" style={{ display: 'block' }}>
      {/* reservoir */}
      <rect x={14} y={cy - 56} width={46} height={92} fill="var(--c-water)" opacity={0.35} stroke="var(--c-water)" />
      <text x={37} y={cy + 52} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        reservoir
      </text>
      {/* pipe coloured by head */}
      {Array.from({ length: sim.N }, (_, i) => (
        <rect key={i} x={px0 + i * seg - 0.4} y={cy - th / 2} width={seg + 0.8} height={th} fill={pressColor((H[i] + H[i + 1]) / 2, sim.H0, span)} />
      ))}
      <rect x={px0} y={cy - th / 2} width={px1 - px0} height={th} fill="none" stroke="var(--c-steel)" strokeWidth={3} />
      {/* head profile (line above the pipe) */}
      <path d={H.map((h, i) => `${i ? 'L' : 'M'}${(px0 + i * seg).toFixed(1)},${Y(h).toFixed(1)}`).join(' ')} fill="none" stroke="var(--c-ink)" strokeWidth={1.6} />
      <line x1={px0} x2={px1} y1={Y(sim.H0)} y2={Y(sim.H0)} stroke="var(--c-faint)" strokeDasharray="4 4" />
      <text x={px0 + 4} y={Y(sim.H0) - 3} fontSize={11} fill="var(--c-mute)">
        steady head
      </text>
      {/* valve: a gate whose gap follows tau */}
      <rect x={px1} y={cy - th / 2 - 8} width={9} height={th / 2 + 8 - (th / 2) * tau} fill="var(--c-ink)" />
      <rect x={px1} y={cy + (th / 2) * tau} width={9} height={th / 2 + 8 - (th / 2) * tau} fill="var(--c-ink)" />
      <text x={px1 + 14} y={cy + 4} fontSize={11} fill="var(--c-mute)">
        valve {Math.round(tau * 100)} %
      </text>
      {showTank && <rect x={px1 - 36} y={cy - th / 2 - 38} width={26} height={38} fill="var(--c-water)" opacity={0.4} stroke="var(--c-water)" />}
      {showTank && (
        <text x={px1 - 23} y={cy - th / 2 - 42} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
          surge tank
        </text>
      )}
      <text x={px0} y={cy + th / 2 + 22} fontSize={11} fill="var(--c-mute)">
        t = {fmt(t, 2)} s  ({fmt(t / ((2 * L) / a), 2)} x 2L/a)
      </text>
      <text x={px0} y={Hh - 8} fontSize={11} fill="var(--c-mute)">
        blue = pressure below steady, red = pressure above steady; the black line is the head along the pipe
      </text>
    </svg>
  )
}

export function HammerTrace({ sim, k, T, a, L, compare, height = 230 }: { sim: HammerSim; k: number; T: number; a: number; L: number; compare?: HammerSim; height?: number }) {
  const step = Math.max(1, Math.floor(sim.t.length / 400))
  const pts = sim.t.map((t, i) => [t, sim.Hv[i]] as [number, number]).filter((_, i) => i % step === 0)
  const lo = Math.min(sim.Hmin, compare?.Hmin ?? Infinity)
  const hi = Math.max(sim.Hmax, compare?.Hmax ?? 0)
  const pad = (hi - lo) * 0.08
  const tEnd = sim.t[sim.t.length - 1]
  const per = (4 * L) / a
  const vl: { x: number; label?: string; color?: string }[] = []
  for (let n = 1; n * per * 0.5 <= tEnd; n++) vl.push({ x: n * ((2 * L) / a), label: n === 1 ? '2L/a' : undefined, color: 'var(--c-line)' })
  const series = [{ pts, color: 'var(--c-bad)', label: 'head at the valve' }]
  if (compare) series.push({ pts: compare.t.map((t, i) => [t, compare.Hv[i]] as [number, number]).filter((_, i) => i % step === 0), color: 'var(--c-faint)', label: 'same closure, unprotected' } as never)
  return (
    <LineChart
      series={series}
      xmax={tEnd}
      ymin={Math.floor(lo - pad)}
      ymax={Math.ceil(hi + pad)}
      xlabel="time (s)"
      ylabel="head at the valve (m)"
      height={height}
      hlines={[{ y: sim.H0, label: 'steady head', color: 'var(--c-mute)' }]}
      vlines={[...vl, ...(T < tEnd ? [{ x: T, label: 'T', color: 'var(--c-good)' }] : [])]}
      marks={[{ x: sim.t[Math.min(k, sim.t.length - 1)], y: sim.Hv[Math.min(k, sim.Hv.length - 1)], color: 'var(--c-accent)' }]}
    />
  )
}
