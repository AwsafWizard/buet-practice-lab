// Elevation sketch of a pumping main with its energy grade line: source water level, pump, rising main, delivery tank.
// The pump lifts the energy line by the total head H = hs + hf + hv (+ minor); it then falls by hf along the pipe and by hv at the exit.
import { fmt } from '../../components/DiagramView'

export interface ProfileProps {
  unit: 'm' | 'ft'
  /** water surface in the source (lowest level) */
  sourceWL: number
  /** bottom of the source (well / reservoir) — drawn only */
  sourceBottom?: number
  pumpCL: number
  /** water surface in the delivery tank / reservoir */
  deliveryWL: number
  /** where the rising main enters the tank (defaults to the delivery water level less 10 % of the range) */
  tankBase?: number
  ground?: number
  hf: number
  hv: number
  hm?: number
  /** label for the source ('wet well', 'river', 'underground reservoir', 'water table') */
  sourceName?: string
  tankName?: string
  /** show the dimension brackets */
  dims?: boolean
  /** animate flow dashes along the pipe */
  flow?: boolean
  /** submersible: the pump is drawn inside the water */
  submerged?: boolean
}

export function PumpProfile(p: ProfileProps) {
  const W = 640
  const Hh = 330
  const hm = p.hm ?? 0
  const hs = p.deliveryWL - p.sourceWL
  const Htot = hs + p.hf + p.hv + hm
  const egl0 = p.sourceWL + Htot
  const lows = [p.sourceWL, p.pumpCL, p.sourceBottom ?? p.sourceWL - Math.max(1, Htot * 0.12), p.ground ?? p.sourceWL, p.tankBase ?? p.deliveryWL - Math.max(1, Htot * 0.15)]
  const lo = Math.min(...lows)
  const hi = Math.max(egl0, p.deliveryWL) + Math.max(1, Htot * 0.06)
  const top = 22
  const bot = Hh - 30
  const Y = (z: number) => bot - ((z - lo) / (hi - lo)) * (bot - top)
  const xs = { s0: 24, s1: 132, pump: 178, t0: 500, t1: 600 }
  const tankBase = p.tankBase ?? p.deliveryWL - Math.max(1, Htot * 0.15)
  const sBottom = p.sourceBottom ?? p.sourceWL - Math.max(1, Htot * 0.12)
  const eglEnd = p.deliveryWL + p.hv
  const hglOff = p.hv
  const u = p.unit
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" style={{ display: 'block' }}>
      <style>{`@keyframes pfl{to{stroke-dashoffset:-24}}`}</style>
      {p.ground != null && (
        <g>
          <rect x={0} y={Y(p.ground)} width={W} height={Hh - Y(p.ground)} fill="var(--c-soil)" opacity={0.18} />
          <line x1={0} x2={W} y1={Y(p.ground)} y2={Y(p.ground)} stroke="var(--c-soil)" strokeWidth={2} />
          <text x={W - 6} y={Y(p.ground) - 4} textAnchor="end" fontSize={11} fill="var(--c-mute)">
            ground level
          </text>
        </g>
      )}
      {/* source */}
      <rect x={xs.s0} y={Y(p.sourceWL)} width={xs.s1 - xs.s0} height={Y(sBottom) - Y(p.sourceWL)} fill="var(--c-water)" opacity={0.35} stroke="var(--c-water)" />
      <text x={(xs.s0 + xs.s1) / 2} y={Y(sBottom) + 15} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        {p.sourceName ?? 'source'}
      </text>
      {/* delivery tank */}
      <rect x={xs.t0} y={Y(p.deliveryWL)} width={xs.t1 - xs.t0} height={Math.max(2, Y(tankBase) - Y(p.deliveryWL))} fill="var(--c-water)" opacity={0.35} stroke="var(--c-water)" />
      <line x1={xs.t0 + 14} x2={xs.t0 + 14} y1={Y(tankBase)} y2={Y(lo)} stroke="var(--c-mute)" strokeWidth={3} />
      <line x1={xs.t1 - 14} x2={xs.t1 - 14} y1={Y(tankBase)} y2={Y(lo)} stroke="var(--c-mute)" strokeWidth={3} />
      <text x={(xs.t0 + xs.t1) / 2} y={Y(p.deliveryWL) - 6} textAnchor="middle" fontSize={11} fill="var(--c-mute)">
        {p.tankName ?? 'elevated tank'}
      </text>
      {/* pipe: suction stub then rising main */}
      <path d={`M${xs.s1 - 40},${Y(p.pumpCL)} L${xs.pump},${Y(p.pumpCL)} L${xs.t0 + 50},${Y(tankBase)}`} fill="none" stroke="var(--c-steel)" strokeWidth={5} strokeLinejoin="round" />
      {p.flow && <path d={`M${xs.pump},${Y(p.pumpCL)} L${xs.t0 + 50},${Y(tankBase)}`} fill="none" stroke="var(--c-water)" strokeWidth={2.5} strokeDasharray="8 16" style={{ animation: 'pfl 0.8s linear infinite' }} />}
      <circle cx={xs.pump} cy={Y(p.pumpCL)} r={14} fill="var(--c-panel)" stroke="var(--c-accent)" strokeWidth={3} />
      <text x={xs.pump} y={Y(p.pumpCL) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--c-accent)">
        P
      </text>
      {/* energy line */}
      <path d={`M${xs.s0},${Y(p.sourceWL)} L${xs.pump},${Y(p.sourceWL)} L${xs.pump},${Y(egl0)} L${xs.t0 + 50},${Y(eglEnd)} L${xs.t0 + 50},${Y(p.deliveryWL)}`} fill="none" stroke="var(--c-accent2)" strokeWidth={2.4} />
      <path d={`M${xs.pump},${Y(egl0 - hglOff)} L${xs.t0 + 50},${Y(eglEnd - hglOff)}`} fill="none" stroke="var(--c-load)" strokeWidth={2} strokeDasharray="2 4" />
      <text x={xs.pump + 8} y={Y(egl0) - 6} fontSize={11} fontWeight={700} fill="var(--c-accent2)">
        energy line (EGL)
      </text>
      <text x={(xs.pump + xs.t0) / 2 + 10} y={Y((egl0 + eglEnd) / 2 - hglOff) + 16} fontSize={11} fill="var(--c-load)">
        hydraulic grade line
      </text>
      {/* dimensions */}
      {p.dims !== false && (
        <g fontSize={11} fill="var(--c-ink)">
          <line x1={xs.pump - 26} x2={xs.pump - 26} y1={Y(p.sourceWL)} y2={Y(egl0)} stroke="var(--c-accent2)" strokeWidth={1.5} markerEnd="" />
          <text x={xs.pump - 30} y={(Y(p.sourceWL) + Y(egl0)) / 2} textAnchor="end" fill="var(--c-accent2)" fontWeight={700}>
            H = {fmt(Htot, 2)} {u}
          </text>
          <line x1={xs.t1 + 8} x2={xs.t1 + 8} y1={Y(p.sourceWL)} y2={Y(p.deliveryWL)} stroke="var(--c-good)" strokeWidth={1.5} />
          <line x1={xs.s1} x2={xs.t1 + 8} y1={Y(p.sourceWL)} y2={Y(p.sourceWL)} stroke="var(--c-faint)" strokeDasharray="3 4" />
          <text x={xs.t1 - 2} y={(Y(p.sourceWL) + Y(p.deliveryWL)) / 2} textAnchor="end" fill="var(--c-good)" fontWeight={700}>
            hs = {fmt(hs, 2)} {u}
          </text>
          <text x={(xs.pump + xs.t0) / 2 - 40} y={Y((egl0 + eglEnd) / 2) - 8} fill="var(--c-accent2)">
            hf = {fmt(p.hf, 2)}{hm ? `, hm = ${fmt(hm, 2)}` : ''} {u}
          </text>
          <text x={xs.t0 + 54} y={Y(eglEnd) - 8} fill="var(--c-load)">
            hv = {fmt(p.hv, 2)}
          </text>
        </g>
      )}
    </svg>
  )
}
