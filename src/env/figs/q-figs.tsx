// The figures printed in the question papers, redrawn so a question can be read without the scan: networks,
// buildings, the aquifer section, gradation and iso-removal charts. They show what the paper shows (its labels,
// its numbers), not the working; the worked versions live in the solutions. Theme tokens only.
import { useId, type FC, type ReactNode } from 'react'
import { CURVE_2223 } from '../engine/dtw'
import { CHART_2017, CHART_2021, CHART_2122, CHART_2324, type IsoChart } from '../engine/settle'
import { IsoChartFig } from './sed-iso'
import { GradChart } from './well-grad'

type Pt = [number, number]

const safeId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '')

/** arrow-headed dimension line between two points with the label beside its middle */
function Dim({ a, b, label, lx = 0, ly = 0, anchor = 'middle', col = 'var(--c-ink)' }: { a: Pt; b: Pt; label: string; lx?: number; ly?: number; anchor?: 'start' | 'middle' | 'end'; col?: string }) {
  const [x1, y1] = a
  const [x2, y2] = b
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const head = (x: number, y: number, s: number) => `M${x},${y} L${x + s * (6 * ux - 3 * uy)},${y + s * (6 * uy + 3 * ux)} M${x},${y} L${x + s * (6 * ux + 3 * uy)},${y + s * (6 * uy - 3 * ux)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="1.2" />
      <path d={head(x1, y1, 1) + ' ' + head(x2, y2, -1)} stroke={col} strokeWidth="1.2" fill="none" />
      <text x={(x1 + x2) / 2 + lx} y={(y1 + y2) / 2 + ly} fontSize="12" textAnchor={anchor} fill={col} fontWeight="600" paintOrder="stroke" stroke="var(--c-panel)" strokeWidth="3">
        {label}
      </text>
    </g>
  )
}

// ------------------------------------------------------------------ 2023-24 Q7(b): two wells in a confined aquifer
/** As printed: 430 ft from the static level to the aquifer bottom, 330 ft aquifer (top aquitard to bottom aquitard),
 *  100 ft from the aquifer top to the bottom of each screen; wells 30 ft apart. Not to scale (nor is the paper's). */
export function TwoWellsFig() {
  const id = safeId(useId())
  const W = 540
  const H = 330
  const xL = 20
  const xR = W - 20
  const yGround = 40
  const ySwl = 68
  const yTopAqt = 168
  const yAq = 192
  const yBot = 292
  const yScr = 250
  const wells = [{ x: 260, name: 'well-1' }, { x: 420, name: 'well-2' }]
  return (
    <svg viewBox={`0 -16 ${W} ${H + 16}`} width="100%" role="img" aria-label="Two wells in a confined aquifer, 30 ft apart" style={{ display: 'block', maxWidth: 620 }}>
      <defs>
        <pattern id={`sand${id}`} width="12" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.1" fill="var(--c-soil)" />
          <circle cx="8" cy="6" r="1.3" fill="var(--c-soil)" />
          <circle cx="4" cy="8.5" r="0.8" fill="var(--c-soil)" />
        </pattern>
      </defs>
      {/* ground */}
      <line x1={xL} x2={xR} y1={yGround} y2={yGround} stroke="var(--c-mute)" strokeDasharray="8 3 2 3" />
      {/* static water table */}
      <line x1={xL} x2={xR} y1={ySwl} y2={ySwl} stroke="var(--c-water)" strokeWidth="1.6" strokeDasharray="7 4" />
      <path d={`M150,${ySwl - 11} l12,0 l-6,9 z`} fill="none" stroke="var(--c-water)" strokeWidth="1.4" />
      <line x1={152} x2={160} y1={ySwl + 4} y2={ySwl + 4} stroke="var(--c-water)" />
      <text x={438} y={ySwl + 18} fontSize="12" fill="var(--c-water)">Static water table</text>
      {/* aquitards and aquifer */}
      <rect x={xL} y={yTopAqt} width={xR - xL} height={yAq - yTopAqt} fill="var(--c-soil)" opacity="0.55" />
      <rect x={xL} y={yAq} width={xR - xL} height={yBot - yAq} fill="var(--c-water)" opacity="0.14" />
      <rect x={xL} y={yAq} width={xR - xL} height={yBot - yAq} fill={`url(#sand${id})`} opacity="0.8" />
      <rect x={xL} y={yBot} width={xR - xL} height={20} fill="var(--c-soil)" opacity="0.55" />
      <text x={xR - 8} y={yAq - 7} textAnchor="end" fontSize="12" fill="var(--c-ink)" fontWeight="600">aquitard</text>
      <text x={(xL + xR) / 2 + 40} y={yBot + 15} textAnchor="middle" fontSize="12" fill="var(--c-ink)" fontWeight="600">aquitard</text>
      <text x={xR - 8} y={yBot - 8} textAnchor="end" fontSize="11" fill="var(--c-mute)">confined aquifer (sand)</text>
      {/* wells: casing from above ground into the aquifer, screen in its upper part */}
      {wells.map((w) => (
        <g key={w.name}>
          <rect x={w.x - 6} y={yGround - 14} width={12} height={yAq - yGround + 14} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.4" />
          <rect x={w.x - 6} y={yAq} width={12} height={yScr - yAq} fill="var(--c-ink)" opacity="0.85" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
            <line key={k} x1={w.x - 6} x2={w.x + 6} y1={yAq + 4 + k * 7} y2={yAq + 4 + k * 7} stroke="var(--c-panel)" strokeWidth="1.2" />
          ))}
          <text x={w.x} y={yGround - 18} textAnchor="middle" fontSize="12" fill="var(--c-ink)" fontWeight="600">{w.name}</text>
        </g>
      ))}
      <text x={wells[1].x + 12} y={yScr - 4} fontSize="11" fill="var(--c-mute)">screen</text>
      <Dim a={[wells[0].x, 2]} b={[wells[1].x, 2]} label="30 ft" ly={-4} />
      {/* the paper's three depth arrows, side by side on the left */}
      <Dim a={[60, ySwl]} b={[60, yBot]} label="430 ft" lx={6} ly={4} anchor="start" />
      <Dim a={[140, yAq]} b={[140, yBot]} label="330 ft" lx={6} ly={10} anchor="start" />
      <Dim a={[215, yAq]} b={[215, yScr]} label="100 ft" lx={-6} ly={4} anchor="end" />
    </svg>
  )
}

// ------------------------------------------------------------------ RWH buildings (2020-21 Q3(b), 2022-23 Q2(a))
interface StepBuildingProps {
  unit: string
  /** length of both blocks (along the front) */
  L: number
  /** depth of the upper roof and of the lower roof strip */
  dUp: number
  dLow: number
  /** height of the lower block and of the upper block (ground to roof) */
  hLow: number
  hTot: number
  /** the step between the roofs is labelled on the paper */
  showStep?: boolean
  /** downpipes to an underground tank beside the building */
  tank?: boolean
}

/** a two-step block building in oblique projection: lower block in front, taller block behind, roofs shaded as catchment */
export function StepBuilding({ unit, L, dUp, dLow, hLow, hTot, showStep, tank }: StepBuildingProps) {
  const s = Math.min(250 / L, 210 / hTot, 300 / (L + (dUp + dLow) * 0.5))
  const cx = Math.cos(0.24)
  const sn = Math.sin(0.24)
  const P = (x: number, y: number, z: number): Pt => [x * s * cx + y * s * 0.46, x * s * sn - y * s * 0.6 - z * s]
  const yB = dLow + dUp
  const tankX = L + 0.18 * L
  const tankW = 0.34 * L
  const raw: Pt[] = [P(0, 0, 0), P(L, 0, 0), P(0, yB, hTot), P(L, yB, hTot), P(L, yB, 0), P(0, 0, hLow)]
  if (tank) raw.push(P(tankX + tankW, -0.1 * L, 0), P(tankX + tankW, 0.3 * L, 0))
  const minX = Math.min(...raw.map((p) => p[0])) - 70
  const maxX = Math.max(...raw.map((p) => p[0])) + 60
  const minY = Math.min(...raw.map((p) => p[1])) - 34
  const maxY = Math.max(...raw.map((p) => p[1])) + 24
  const pts = (...ps: Pt[]) => ps.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')
  const face = (ps: Pt[], fill: string, op = 1) => <polygon points={pts(...ps)} fill={fill} fillOpacity={op} stroke="var(--c-ink)" strokeWidth="1.4" strokeLinejoin="round" />
  const u = (v: number) => `${+v.toFixed(1)}${unit}`
  const off = (p: Pt, dx: number, dy: number): Pt => [p[0] + dx, p[1] + dy]
  // depth direction on screen (for offsetting dimension lines outward)
  const dd = [0.46 * s, -0.6 * s]
  const dn = Math.hypot(dd[0], dd[1])
  const back: Pt = [(dd[0] / dn) * 16, (dd[1] / dn) * 16]
  return (
    <svg viewBox={`${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX - minX).toFixed(0)} ${(maxY - minY).toFixed(0)}`} width="100%" role="img" aria-label="Two-step building with roof catchments" style={{ display: 'block', maxWidth: 520 }}>
      {/* upper block: right side, roof, front part above the lower roof */}
      {face([P(L, dLow, 0), P(L, yB, 0), P(L, yB, hTot), P(L, dLow, hTot)], 'var(--c-panel2)')}
      {face([P(0, dLow, hTot), P(L, dLow, hTot), P(L, yB, hTot), P(0, yB, hTot)], 'var(--c-water)', 0.28)}
      {face([P(0, dLow, hLow), P(L, dLow, hLow), P(L, dLow, hTot), P(0, dLow, hTot)], 'var(--c-panel)')}
      {/* lower block: right side, roof, front */}
      {face([P(L, 0, 0), P(L, dLow, 0), P(L, dLow, hLow), P(L, 0, hLow)], 'var(--c-panel2)')}
      {face([P(0, 0, hLow), P(L, 0, hLow), P(L, dLow, hLow), P(0, dLow, hLow)], 'var(--c-water)', 0.28)}
      {face([P(0, 0, 0), P(L, 0, 0), P(L, 0, hLow), P(0, 0, hLow)], 'var(--c-panel)')}
      {tank && (() => {
        const pipe1 = P(L, 0.04 * dLow, 0)
        const pipe2 = P(L, dLow + 0.06 * dUp, 0)
        const t1 = P(tankX, 0, 0)
        const t2 = P(tankX, 0.25 * L, 0)
        return (
          <g>
            {[[P(L, 0.04 * dLow, hLow), pipe1], [P(L, dLow + 0.06 * dUp, hTot), pipe2]].map(([a, b], i) => (
              <line key={i} x1={a[0] + 4} y1={a[1]} x2={b[0] + 4} y2={b[1] - 6} stroke="var(--c-ink)" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
            ))}
            <path d={`M${pipe1[0] + 4},${pipe1[1] - 6} Q${pipe1[0] + 14},${pipe1[1] + 8} ${t1[0]},${t1[1] + 4}`} fill="none" stroke="var(--c-ink)" strokeDasharray="5 3" />
            <path d={`M${pipe2[0] + 4},${pipe2[1] - 6} Q${pipe2[0] + 14},${pipe2[1] + 8} ${t2[0]},${t2[1] + 4}`} fill="none" stroke="var(--c-ink)" strokeDasharray="5 3" />
            <polygon points={pts(P(tankX, -0.1 * L, 0), P(tankX + tankW, -0.1 * L, 0), P(tankX + tankW, 0.3 * L, 0), P(tankX, 0.3 * L, 0))} fill="var(--c-water)" fillOpacity="0.15" stroke="var(--c-ink)" strokeWidth="1.4" />
            <text x={P(tankX + tankW / 2, 0.1 * L, 0)[0]} y={P(tankX + tankW / 2, 0.1 * L, 0)[1] + 4} textAnchor="middle" fontSize="11" fill="var(--c-mute)">tank</text>
          </g>
        )
      })()}
      {/* dimensions as the paper places them */}
      <Dim a={off(P(0, yB, hTot), back[0], back[1])} b={off(P(L, yB, hTot), back[0], back[1])} label={u(L)} ly={-6} />
      <Dim a={off(P(0, dLow, hTot), -14, 0)} b={off(P(0, yB, hTot), -14, 0)} label={u(dUp)} lx={-8} anchor="end" />
      {showStep && <Dim a={off(P(0, dLow, hLow), -14, 0)} b={off(P(0, dLow, hTot), -14, 0)} label={u(hTot - hLow)} lx={-6} ly={4} anchor="end" />}
      <Dim a={off(P(0, 0, hLow), -14, 0)} b={off(P(0, dLow, hLow), -14, 0)} label={u(dLow)} lx={-8} anchor="end" />
      <Dim a={off(P(0, 0, 0), -14, 0)} b={off(P(0, 0, hLow), -14, 0)} label={u(hLow)} lx={-6} ly={4} anchor="end" />
      <Dim a={off(P(L, yB, 0), 14, 0)} b={off(P(L, yB, hTot), 14, 0)} label={u(hTot)} lx={6} ly={4} anchor="start" />
    </svg>
  )
}

// ------------------------------------------------------------------ pipe networks
interface NetNode {
  at: Pt
  /** label offset from the node */
  l?: Pt
  box?: boolean
}
interface NetPipe {
  a: string
  b: string
  label?: string
  /** label position relative to the pipe's midpoint, and anchor */
  l?: Pt
  anchor?: 'start' | 'middle' | 'end'
  /** rotate the label along a vertical pipe */
  vertical?: boolean
  /** drawn dashed: the paper is unreadable here */
  unsure?: boolean
  /** arrow head at the middle pointing a → b */
  arrow?: boolean
}
interface NetFlow {
  node: string
  /** direction of the arrow (screen vector, length in px) */
  d: Pt
  label: string
  inflow?: boolean
  unsure?: boolean
}

function NetFig({ nodes, pipes, flows = [], vb, label, extra }: { nodes: Record<string, NetNode>; pipes: NetPipe[]; flows?: NetFlow[]; vb: [number, number, number, number]; label: string; extra?: ReactNode }) {
  const id = safeId(useId())
  return (
    <svg viewBox={vb.join(' ')} width="100%" role="img" aria-label={label} style={{ display: 'block', maxWidth: 520, margin: '0 auto' }}>
      <defs>
        <marker id={`ah${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
        </marker>
        <marker id={`am${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-ink)" />
        </marker>
      </defs>
      {pipes.map((p) => {
        const A = nodes[p.a].at
        const B = nodes[p.b].at
        const mx = (A[0] + B[0]) / 2
        const my = (A[1] + B[1]) / 2
        const [lx, ly] = p.l ?? [0, -7]
        return (
          <g key={p.a + p.b}>
            <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="var(--c-water)" strokeWidth="3" strokeDasharray={p.unsure ? '7 5' : undefined} strokeLinecap="round" />
            {p.arrow && <path d={`M${mx - (B[0] - A[0]) * 0.02},${my - (B[1] - A[1]) * 0.02} L${mx},${my}`} stroke="var(--c-ink)" markerEnd={`url(#am${id})`} />}
            {p.label && (
              <text
                x={mx + lx}
                y={my + ly}
                fontSize="12"
                textAnchor={p.anchor ?? 'middle'}
                fill={p.unsure ? 'var(--c-mute)' : 'var(--c-ink)'}
                transform={p.vertical ? `rotate(-90 ${mx + lx} ${my + ly})` : undefined}
                paintOrder="stroke"
                stroke="var(--c-panel)"
                strokeWidth="3"
              >
                {p.label}
              </text>
            )}
          </g>
        )
      })}
      {flows.map((f) => {
        const [x, y] = nodes[f.node].at
        const [dx, dy] = f.d
        const tail: Pt = f.inflow ? [x + dx, y + dy] : [x, y]
        const tip: Pt = f.inflow ? [x - dx * 0.12, y - dy * 0.12] : [x + dx, y + dy]
        return (
          <g key={f.node + f.label}>
            <line x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} stroke="var(--c-accent)" strokeWidth="2" strokeDasharray={f.unsure ? '5 4' : undefined} markerEnd={`url(#ah${id})`} />
            <text x={x + dx * 1.15} y={y + dy * 1.15 + (dy >= 0 ? 12 : -4)} textAnchor={dx > 4 ? 'start' : dx < -4 ? 'end' : 'middle'} fontSize="12" fontWeight="700" fill={f.unsure ? 'var(--c-mute)' : 'var(--c-accent)'}>
              {f.label}
            </text>
          </g>
        )
      })}
      {Object.entries(nodes).map(([k, n]) => {
        const [x, y] = n.at
        const [lx, ly] = n.l ?? [0, 0]
        return n.box ? (
          <g key={k}>
            <rect x={x - 12} y={y - 12} width="24" height="24" rx="3" fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.4" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-ink)">{k}</text>
          </g>
        ) : (
          <g key={k}>
            <circle cx={x} cy={y} r="4.5" fill="var(--c-ink)" />
            {n.l && <text x={x + lx} y={y + ly} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--c-ink)">{k}</text>}
          </g>
        )
      })}
      {extra}
    </svg>
  )
}

/** 2009-10 Q2(b): a hand-drawn grid of three loops; labels the watermark hides are shown with "?" and dashed */
export function Net0910() {
  const x = [130, 320, 500]
  const y = [50, 150, 250]
  return (
    <NetFig
      label="Looped pipe network of 2009-10 Fig. 1 (reconstructed)"
      vb={[0, 0, 590, 310]}
      nodes={{ V: { at: [x[0], y[0]] }, W: { at: [x[1], y[0]] }, U: { at: [x[2], y[0]] }, S: { at: [x[0], y[1]] }, T: { at: [x[1], y[1]] }, P: { at: [x[0], y[2]] }, Q: { at: [x[1], y[2]] }, R: { at: [x[2], y[2]] } }}
      pipes={[
        { a: 'P', b: 'Q', label: '4000 ft – 8″ φ', l: [0, 18] },
        { a: 'Q', b: 'R', label: '4000 ft – 8″ φ', l: [0, 18] },
        { a: 'P', b: 'S', label: '2500 ft – 8″ φ', l: [-8, 4], anchor: 'end' },
        { a: 'S', b: 'T', label: '4000 ft – 4″ φ', l: [0, -7] },
        { a: 'Q', b: 'T', label: '2500 ft – 4″ φ', l: [14, 0], vertical: true },
        { a: 'S', b: 'V', label: '? ft – 8″ φ', l: [-8, 4], anchor: 'end', unsure: true },
        { a: 'V', b: 'W', label: '4000 ft – 8″ φ', l: [0, -7] },
        { a: 'W', b: 'U', label: '?00 ft – 8″ φ', l: [0, -7], unsure: true },
        { a: 'T', b: 'W', label: '?50? ft – 4″ φ', l: [10, 4], anchor: 'start', unsure: true },
        { a: 'R', b: 'U', label: '5000 ft – 8″ φ', l: [14, 0], vertical: true },
      ]}
      flows={[
        { node: 'P', d: [-40, 34], label: '6 cfs', inflow: true },
        { node: 'Q', d: [10, 34], label: '1 cfs' },
        { node: 'V', d: [26, -30], label: '1 cfs' },
        { node: 'U', d: [30, -26], label: '1 cfs' },
        { node: 'R', d: [30, 26], label: '3 cfs?', unsure: true },
      ]}
    />
  )
}

/** 2012-13 Q2(c), Figure 1 */
export function Net1213() {
  return (
    <NetFig
      label="Pipe network ABCD with diagonal BD"
      vb={[0, 0, 470, 300]}
      nodes={{ A: { at: [90, 60], l: [-14, -8] }, B: { at: [380, 60], l: [14, -8] }, C: { at: [380, 230], l: [14, 4] }, D: { at: [90, 230], l: [-14, 4] } }}
      pipes={[{ a: 'A', b: 'B' }, { a: 'B', b: 'C' }, { a: 'D', b: 'C' }, { a: 'A', b: 'D' }, { a: 'B', b: 'D' }]}
      flows={[
        { node: 'A', d: [-50, -38], label: '5 lps', inflow: true },
        { node: 'D', d: [-34, 36], label: '2 lps' },
        { node: 'C', d: [34, 36], label: '3 lps' },
      ]}
    />
  )
}

/** 2022-23 Q7(c), Figure 3: no numbers on the paper's figure; the lengths come from the text */
export function Net2223() {
  return (
    <NetFig
      label="Branched network A–B–C–D"
      vb={[0, 0, 480, 250]}
      nodes={{ A: { at: [60, 205], box: true }, B: { at: [270, 205], box: true }, C: { at: [270, 60], box: true }, D: { at: [430, 60], box: true } }}
      pipes={[
        { a: 'A', b: 'B', arrow: true },
        { a: 'B', b: 'C', label: 'BC = 450 ft (text)', l: [12, 4], anchor: 'start' },
        { a: 'C', b: 'D', arrow: true, label: 'CD = 375 ft (text)', l: [0, 26] },
      ]}
    />
  )
}

/** 2023-24 Q6(a): dead-end network from the OH tank */
export function Net2324() {
  const tank: Pt = [52, 150]
  return (
    <NetFig
      label="Dead-end network fed from an overhead tank"
      vb={[0, 0, 540, 300]}
      nodes={{
        '0': { at: [100, 150], l: [8, -8] },
        '1': { at: [230, 150], l: [-10, 18] },
        '2': { at: [230, 55], l: [-10, -10] },
        '3': { at: [370, 50], l: [6, -10] },
        '4': { at: [370, 185], l: [0, -12] },
        '5': { at: [270, 260], l: [-12, 6] },
        '6': { at: [500, 185], l: [0, -12] },
        stub: { at: [150, 58] },
      }}
      pipes={[
        { a: '0', b: '1', label: '290 m' },
        { a: '1', b: '2', label: '140 m', l: [14, 0], vertical: true },
        { a: '2', b: '3', label: '125 m' },
        { a: '2', b: 'stub', unsure: true },
        { a: '1', b: '4', label: '205 m', l: [0, 18] },
        { a: '4', b: '6', label: '165 m', l: [0, 18] },
        { a: '4', b: '5', label: '210 m', l: [16, 16] },
      ]}
      extra={
        <g>
          <circle cx={tank[0]} cy={tank[1]} r="44" fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.4" />
          <text x={tank[0]} y={tank[1] - 3} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-ink)">OH</text>
          <text x={tank[0]} y={tank[1] + 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-ink)">TANK</text>
          <circle cx="150" cy="58" r="5" fill="var(--c-panel)" />
        </g>
      }
    />
  )
}

// ------------------------------------------------------------------ charts
const iso = (c: IsoChart, extra?: Partial<Parameters<typeof IsoChartFig>[0]>) => () => <IsoChartFig H={c.H} tMax={c.tMax} curves={c.curves} title={c.title} {...extra} />

export const Grad2223 = () => <GradChart curves={[{ label: 'finest sand layer', pts: CURVE_2223 }]} reads={[]} />

// ------------------------------------------------------------------ the registry
export interface QFig {
  Fig: FC
  /** the caption under the drawing */
  cap: string
}

const RWH_2021: QFig = {
  Fig: () => <StepBuilding unit=" m" L={22} dUp={15} dLow={6} hLow={12} hTot={20} showStep tank />,
  cap: 'Figure 1: two-level building with downpipes to an underground tank. Roofs (shaded) 22 m × 15 m and 22 m × 6 m.',
}
const NET_0910: QFig = {
  Fig: Net0910,
  cap: 'Fig. 1, redrawn from a hand-drawn figure partly hidden by a watermark. Dashed = not legible (the lengths with “?”), and the 3 cfs draw-off at the bottom-right corner is inferred: it is what balances 6 cfs in against 3 × 1 cfs out.',
}

/** question figures by part id */
export const EV_QFIGS: Record<string, QFig> = {
  'ev-2009-10-2b': NET_0910,
  'ev-2009-10-2c': NET_0910,
  'ev-2012-13-2c': { Fig: Net1213, cap: 'Figure 1: loop network, pipe details in the table above.' },
  'ev-2017-18-3b': {
    Fig: iso(CHART_2017, { grid: CHART_2017.grid }),
    cap: 'Figure 1: % removal printed at each sampling point, with the iso-removal lines through them.',
  },
  'ev-2020-21-3b': RWH_2021,
  'ev-2020-21-5a': {
    Fig: iso(CHART_2021, { ports: { depths: [0.5, 1, 1.5, 2, 2.5], times: [5, 10, 15, 20, 25, 30, 35] } }),
    cap: 'Figure for Q5(a): iso-removal lines 10–60 %, dots at the sampling points.',
  },
  'ev-2021-22-2b': {
    Fig: iso(CHART_2122),
    cap: 'The figure: iso-removal lines 30–80 % with no values printed. The paper marks the depth axis only as ports h₁…h₅, 0.5 m apart; drawn here with the bottom edge as the 3 m floor.',
  },
  'ev-2022-23-2a': {
    Fig: () => <StepBuilding unit="′" L={30} dUp={20} dLow={15} hLow={25} hTot={35} />,
    cap: 'Figure 1: two-step building, dimensions in feet. Roofs (shaded) 30′ × 20′ and 30′ × 15′.',
  },
  'ev-2022-23-6c': { Fig: Grad2223, cap: 'Figure 2: gradation chart of the finest sand layer (attach the worked version with the script).' },
  'ev-2022-23-7c': { Fig: Net2223, cap: 'Figure 3: branched network (the paper prints no numbers on it).' },
  'ev-2023-24-1c': {
    Fig: iso(CHART_2324),
    cap: 'Figure 1: iso-removal lines for a Type II test in a 2.5 m column. No 85 % line is drawn.',
  },
  'ev-2023-24-6a': { Fig: Net2324, cap: 'The figure: pipe lengths as printed. The short stub left of node 2 has no length.' },
  'ev-2023-24-7b': {
    Fig: TwoWellsFig,
    cap: '430 ft: static water table to the aquifer bottom · 330 ft: aquifer thickness (between the aquitards) · 100 ft: aquifer top to the bottom of the screens. Not to scale.',
  },
}
