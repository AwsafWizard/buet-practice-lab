// Worked operating point of a pump on a system, the way it is written in the exam when the curves are given as tables:
// the duty curve and the system curve(s) drawn from the engine with the crossing marked, then for each crossing the two
// tabulated discharges that bracket it (pump head above the system head at one, below at the other) and the linear
// interpolation with the numbers substituted. Between neighbouring table points both curves are straight lines, so the
// interpolation is exact and agrees with the engine's operatingPoint().
import { Md } from '../../components/ui'
import { Chart, pathOf } from '../../soil/topics/consol/plot'
import type { Curve, OpPoint } from '../engine/pump'
import { sg } from './pump-work'

export interface OpBracket {
  Q1: number
  Q2: number
  p1: number
  p2: number
  s1: number
  s2: number
  /** pump − system at Q1 (≥ 0) and Q2 (≤ 0) */
  d1: number
  d2: number
  /** the interpolated discharge and head */
  Q: number
  H: number
}

/** the two neighbouring knots where pump − system changes sign, and the straight-line crossing between them */
export function opBracket(pump: Curve, sys: Curve, knots: number[]): OpBracket | null {
  const ks = [...new Set(knots.map((k) => +k.toFixed(9)))].sort((a, b) => a - b)
  for (let i = 0; i < ks.length - 1; i++) {
    const Q1 = ks[i]
    const Q2 = ks[i + 1]
    const p1 = pump(Q1)
    const p2 = pump(Q2)
    const s1 = sys(Q1)
    const s2 = sys(Q2)
    const d1 = p1 - s1
    const d2 = p2 - s2
    if (d1 >= 0 && d2 <= 0 && d1 - d2 > 1e-12) {
      const Q = Q1 + (d1 / (d1 - d2)) * (Q2 - Q1)
      const H = s1 + ((Q - Q1) / (Q2 - Q1)) * (s2 - s1)
      return { Q1, Q2, p1, p2, s1, s2, d1, d2, Q, H }
    }
  }
  return null
}

const q3 = (v: number) => sg(v, 3)
const h3 = (v: number) => sg(v, 4)
const sgn = (v: number) => (v >= 0 ? '+' : '−') + h3(Math.abs(v))

/** the bracket table and the two interpolation lines for one crossing */
export function opBracketMd(b: OpBracket, op: OpPoint, what: string, qUnit = 'm³/s', hUnit = 'm') {
  if (Math.abs(b.d2) < 1e-9)
    return `| ${what} | Q (${qUnit}) | pump H (${hUnit}) | system H (${hUnit}) | pump − system |\n|---|---|---|---|---|\n| table point below | ${q3(b.Q1)} | ${h3(b.p1)} | ${h3(b.s1)} | ${sgn(b.d1)} (pump still above) |\n| **table point** | **${q3(b.Q2)}** | **${h3(b.p2)}** | **${h3(b.s2)}** | **0: the curves meet here** |\n\nThe pump head and the system head are equal at a table point, so no interpolation is needed: $Q = ${sg(op.Q, 4)}$ ${qUnit}, $H = ${sg(op.H, 4)}$ ${hUnit}.`
  return [
    `| ${what} | Q (${qUnit}) | pump H (${hUnit}) | system H (${hUnit}) | pump − system |\n|---|---|---|---|---|\n| table point below | ${q3(b.Q1)} | ${h3(b.p1)} | ${h3(b.s1)} | ${sgn(b.d1)} (pump still above) |\n| **operating point** | **Q = ?** | | | **0** |\n| table point above | ${q3(b.Q2)} | ${h3(b.p2)} | ${h3(b.s2)} | ${sgn(b.d2)} (pump now below) |`,
    `$$Q = Q_1 + \\frac{d_1}{d_1 - d_2}(Q_2 - Q_1) = ${q3(b.Q1)} + \\frac{${h3(b.d1)}}{${h3(b.d1)} - (${b.d2 < 0 ? '-' : ''}${h3(Math.abs(b.d2))})}(${q3(b.Q2)} - ${q3(b.Q1)}) = ${sg(op.Q, 4)}${qUnit === 'm³/s' ? '\\text{ m}^3/\\text{s}' : `\\text{ ${qUnit}}`}$$`,
    `$$H = H_{s1} + \\frac{Q - Q_1}{Q_2 - Q_1}(H_{s2} - H_{s1}) = ${h3(b.s1)} + \\frac{${sg(op.Q, 4)} - ${q3(b.Q1)}}{${q3(b.Q2)} - ${q3(b.Q1)}}(${h3(b.s2)} - ${h3(b.s1)}) = ${sg(op.H, 4)}\\text{ ${hUnit}}$$`,
  ].join('\n\n')
}

export interface OpLine {
  /** the system curve */
  sys: Curve
  /** the engine's operating point on it */
  op: OpPoint
  name: string
  color: string
}

/** one duty (one pump, two in parallel, two in series) against one or more system curves, with every crossing worked */
export function OpDutyWork({
  duty, dutyName, dutyColor = 'var(--c-accent)', lines, knots, qMax, hMax, qUnit = 'm³/s', hUnit = 'm', why,
}: {
  duty: Curve
  dutyName: string
  dutyColor?: string
  lines: OpLine[]
  knots: number[]
  qMax: number
  hMax: number
  qUnit?: string
  hUnit?: string
  why?: string
}) {
  const brs = lines.map((l) => opBracket(duty, l.sys, knots))
  const grid = Array.from({ length: 121 }, (_, i) => (qMax * i) / 120)
  const ks = [...new Set(knots.map((k) => +k.toFixed(9)))].filter((k) => k <= qMax + 1e-9)
  const hStep = hMax > 60 ? 20 : 10
  const yt = Array.from({ length: Math.floor(hMax / hStep) + 1 }, (_, i) => i * hStep)
  const md = lines
    .map((l, i) => {
      const b = brs[i]
      if (!b) return `**${l.name}:** the curves do not cross inside the table.`
      return [Math.abs(b.d2) < 1e-9 ? `**${l.name}.**` : `**${l.name}.** The pump head falls below the system head between Q = ${q3(b.Q1)} and ${q3(b.Q2)} ${qUnit}. Both curves are straight between these two table points, so interpolate on the difference $d$ = pump − system, which is zero at the operating point:`, opBracketMd(b, l.op, l.name, qUnit, hUnit), `Operating point: **Q = ${sg(l.op.Q, 3)} ${qUnit}, H = ${sg(l.op.H, 3)} ${hUnit}**.`].join('\n\n')
    })
    .join('\n\n')
  return (
    <div className="space-y-2 text-sm">
      {why && <Md>{why}</Md>}
      <div className="rounded-xl border border-line bg-panel2/40 p-2">
        <Chart
          w={400}
          h={240}
          pad={{ l: 40, r: 12, t: 10, b: 32 }}
          x={{ min: 0, max: qMax, label: `discharge Q (${qUnit})` }}
          y={{ min: 0, max: hMax, label: `head H (${hUnit})`, ticks: yt }}
          label={`${dutyName}: pump curve against the system curve with the operating point marked`}
        >
          {(s) => (
            <>
              <path d={pathOf(grid.map((q) => [q, duty(q)] as [number, number]).filter(([, h]) => h >= 0 && h <= hMax), s)} fill="none" stroke={dutyColor} strokeWidth={2} />
              {ks.map((k) => {
                const h = duty(k)
                return h >= 0 && h <= hMax ? <circle key={'k' + k} cx={s.X(k)} cy={s.Y(h)} r={2.4} fill={dutyColor} data-tip={`table point Q = ${q3(k)}, H = ${h3(h)}`} /> : null
              })}
              {lines.map((l, i) => {
                const b = brs[i]
                return (
                  <g key={i}>
                    <path d={pathOf(grid.map((q) => [q, l.sys(q)] as [number, number]).filter(([, h]) => h <= hMax), s)} fill="none" stroke={l.color} strokeWidth={1.6} strokeDasharray={i ? '6 4' : undefined} />
                    {b && (
                      <>
                        <circle cx={s.X(b.Q1)} cy={s.Y(b.p1)} r={3.6} fill="var(--c-load)" />
                        <circle cx={s.X(b.Q2)} cy={s.Y(b.p2)} r={3.6} fill="var(--c-load)" />
                      </>
                    )}
                    <line x1={s.X(l.op.Q)} x2={s.X(l.op.Q)} y1={s.Y(l.op.H)} y2={s.B} stroke="var(--c-bad)" strokeDasharray="4 3" strokeWidth={1.2} />
                    <line x1={s.L} x2={s.X(l.op.Q)} y1={s.Y(l.op.H)} y2={s.Y(l.op.H)} stroke="var(--c-bad)" strokeDasharray="4 3" strokeWidth={1.2} />
                    <circle cx={s.X(l.op.Q)} cy={s.Y(l.op.H)} r={4.2} fill="var(--c-bad)" data-tip={`${l.name}: Q = ${sg(l.op.Q, 3)}, H = ${sg(l.op.H, 3)}`} />
                    <text x={s.X(l.op.Q) + 5} y={s.Y(l.op.H) - 6 - i * 12} fontSize={9} fill="var(--c-bad)">
                      {l.name}: {sg(l.op.Q, 3)}, {sg(l.op.H, 3)}
                    </text>
                  </g>
                )
              })}
              <text x={s.R - 4} y={s.T + 12} fontSize={9} textAnchor="end" fill={dutyColor}>
                {dutyName}
              </text>
            </>
          )}
        </Chart>
        <div className="text-xs text-faint mt-1">
          Solid {dutyName.toLowerCase()} curve with its table points; {lines.map((l, i) => `${i ? 'dashed' : 'solid'} ${l.name.toLowerCase()} system curve`).join(', ')}. Orange dots: the two table points that bracket each crossing. Red: the operating point, read down to Q and across to H.
        </div>
      </div>
      <Md>{md}</Md>
    </div>
  )
}
