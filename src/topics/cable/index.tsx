import { useMemo, useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Answer, Callout, Md, Section, Step, Steps, Tex } from '../../components/ui'
import { tipAxes } from '../../components/PointTip'
import { cablePointLoads, parabolicCable, stiffenedSuspension, threeHingedArch, type PointLoad } from '../../engine/cable'
import { ArchSolution, FnPlot, SuspensionSolution } from '../../kit/cables'
import { Slider, TopicFrequency } from '../../labs/common'
import type { PYQ } from '../../pyq/types'
import type { TopicModule } from '../modules'

// ---------------------------------------------------------------- cable shape explorer
function CableExplorer() {
  const L = 100
  const [P1, setP1] = useState(20)
  const [P2, setP2] = useState(30)
  const [x1, setX1] = useState(30)
  const [x2, setX2] = useState(70)
  const [sag, setSag] = useState(12)
  const [dh, setDh] = useState(0)
  const loads: PointLoad[] = [
    { x: Math.min(x1, x2 - 1), P: P1 },
    { x: Math.max(x2, x1 + 1), P: P2 },
  ]
  const c = cablePointLoads({ L, dh, loads, sagAt: { x: loads[1].x, sag } })
  const W = 620,
    Hh = 260
  const X = (x: number) => 40 + (x / L) * (W - 80)
  const ys = c.pts.map((p) => p.y)
  const ymin = Math.min(...ys, 0),
    ymax = Math.max(...ys, dh, 0)
  const Y = (y: number) => 40 + ((ymax - y) / Math.max(ymax - ymin, 1)) * (Hh - 80)
  return (
    <div className="grid cq-lg:grid-cols-[1.4fr_1fr] gap-4">
      <div className="rounded-xl bg-bg/60 border border-line p-2">
        <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full h-auto" {...tipAxes({ X, Y, x: 'x', y: 'y', xUnit: ' ft', yUnit: ' ft' })}>
          <line x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(dh)} stroke="var(--c-faint)" strokeDasharray="5 4" data-name="chord" />
          <polyline data-name="cable" points={c.pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={2.5} />
          {loads.map((l, i) => (
            <g key={i}>
              <line x1={X(l.x)} y1={Y(c.pts[i + 1].y) + 4} x2={X(l.x)} y2={Y(c.pts[i + 1].y) + 40} stroke="var(--c-load)" strokeWidth={2} markerEnd="url(#cl)" />
              <text x={X(l.x)} y={Y(c.pts[i + 1].y) + 54} fontSize={11} textAnchor="middle" fill="var(--c-load)" fontWeight={700}>
                {l.P} k
              </text>
            </g>
          ))}
          {c.segs.map((s, i) => (
            <text key={i} x={X((s.from + s.to) / 2)} y={Y((c.pts[i].y + c.pts[i + 1].y) / 2) - 8} fontSize={10.5} textAnchor="middle" className="num" fill="var(--c-ink)">
              T = {fmt(s.T, 1)}
            </text>
          ))}
          <defs>
            <marker id="cl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
            </marker>
          </defs>
        </svg>
      </div>
      <div className="space-y-1 text-sm">
        <Slider label="P₁" value={P1} min={0} max={60} onChange={setP1} unit=" k" />
        <Slider label="x₁" value={x1} min={5} max={90} onChange={setX1} unit=" ft" />
        <Slider label="P₂" value={P2} min={0} max={60} onChange={setP2} unit=" k" />
        <Slider label="x₂" value={x2} min={10} max={95} onChange={setX2} unit=" ft" />
        <Slider label="sag under P₂" value={sag} min={2} max={30} onChange={setSag} unit=" ft" />
        <Slider label="right support higher by" value={dh} min={-20} max={20} onChange={setDh} unit=" ft" />
        <Tex block>{`H = \\frac{M_{beam}(x_2)}{\\text{sag}} = ${fmt(c.H, 2)}\\text{ k},\\quad T_{max} = ${fmt(c.Tmax, 2)}\\text{ k},\\quad \\text{length} = ${fmt(c.length, 2)}\\text{ ft}`}</Tex>
        <p className="text-xs text-faint">General cable theorem: the cable takes the shape of the simple-beam moment diagram, scaled by 1/H, hung below the chord.</p>
      </div>
    </div>
  )
}

function BridgeExplorer() {
  const [P, setP] = useState(40)
  const [xp, setXp] = useState(300)
  const L = 1000,
    h = 100
  const s = useMemo(() => stiffenedSuspension({ L, h, xh: 500, loads: [{ x: xp, P }] }), [P, xp])
  return (
    <div className="space-y-2">
      <div className="grid cq-md:grid-cols-2 gap-x-6">
        <Slider label="Load P" value={P} min={10} max={100} step={5} onChange={setP} unit=" k" />
        <Slider label="at x" value={xp} min={50} max={950} step={10} onChange={setXp} unit=" ft" />
      </div>
      <div className="rounded-xl bg-bg/60 border border-line">
        <FnPlot f={(x) => s.M(x)} x0={0} x1={L} title={`Girder BMD (k-ft) — L = 1000 ft, sag 100 ft, centre hinge; H = ${fmt(s.H, 2)} k, hanger load q = ${fmt(s.q, 4)} k/ft`} marks={[250, 500, xp, 750]} />
      </div>
      <p className="text-sm text-mute">Move the load: the girder moment at the hinge stays zero, the hangers always pull up uniformly (parabolic cable), and the BMD changes sign — the stiffening girder spreads a point load over the whole cable.</p>
    </div>
  )
}

function Overview() {
  return (
    <div>
      <Section title="Cables" right={<div className="w-72 hidden cq-md:block"><TopicFrequency topic="cable" /></div>}>
        <Md>{`A cable carries load by tension only; its horizontal component **H is constant** (vertical loads).
- **General cable theorem**: at any point, $H\\cdot y = M_{beam}$, where y = sag measured from the chord and $M_{beam}$ = moment in a simple beam of the same span and loading.
- **Uniform load per horizontal length (parabola)**: $H = \\dfrac{wL^2}{8h}$, $T_{max} = \\sqrt{H^2 + V^2}$ at the higher support, length ≈ $L\\left(1 + \\tfrac83 n^2 - \\tfrac{32}{5}n^4\\right)$ with $n = h/L$.
- **Elastic stretch** $\\Delta L = \\int T\\,ds/EA = \\frac{H}{EA}\\int(1 + y'^2)dx$; unstressed length = loaded length − stretch.`}</Md>
      </Section>
      <Section title="Suspension bridges with stiffening girders">
        <Md>{`Parabolic cable → hangers carry a **uniform** load $q = 8Hh/L^2$ on the girder. The girder (simply supported at the towers, with a hinge at mid-span) has
$$M(x) = M_0(x) - H\\,y(x),\\quad y(x) = \\frac{4h\\,x(L-x)}{L^2},\\qquad M_{hinge} = 0 \\Rightarrow H = \\frac{M_0(\\text{hinge})}{y(\\text{hinge})}$$
Hanger force = q × hanger spacing.`}</Md>
      </Section>
      <Section title="Three-hinged arches">
        <Md>{`Parabolic arch $y = 4hx(L-x)/L^2$: $H = M_0(\\text{crown})/h$, then at any section $M = M_0 - Hy$, normal thrust $N = V\\sin\\theta + H\\cos\\theta$, radial shear $Q = V\\cos\\theta - H\\sin\\theta$ ($\\tan\\theta = y'$). Under a full uniform load the parabolic arch has **M = 0 everywhere**.`}</Md>
        <Callout kind="exam">19 cable/suspension questions historically (every year until 2022-23, none in 2023-24); one three-hinged arch (2016-17). Stiffening-girder BMD is the favourite.</Callout>
      </Section>
    </div>
  )
}

function Approach() {
  return (
    <div>
      <Section title="Recipes">
        <div className="grid cq-md:grid-cols-2 gap-4">
          <Steps>
            <Step n={1} title="Cable with point loads">Simple-beam moment at the point of known sag → H = M/y. Sag elsewhere y = M/H. Segment tension T = H/cos θ.</Step>
            <Step n={2} title="Length">Σ segment lengths (point loads) or the parabola formula.</Step>
            <Step n={3} title="Inclined chord">Measure sag from the chord; slope at x = dh/L − 4h(L − 2x)/L².</Step>
          </Steps>
          <Steps>
            <Step n={1} title="Stiffening girder">M₀ at the hinge from the given loads.</Step>
            <Step n={2} title="H from the hinge condition">H = M₀(hinge)/y(hinge).</Step>
            <Step n={3} title="Girder">q = 8Hh/L² upward; SFD/BMD of the girder with loads + q; M(hinge) = 0 check.</Step>
          </Steps>
        </div>
      </Section>
      <Section title="Cable shape explorer">
        <CableExplorer />
      </Section>
      <Section title="Stiffening girder explorer">
        <BridgeExplorer />
      </Section>
    </div>
  )
}

/** sketch for the quick drill: level supports, parabolic cable, sag dimensioned at midspan */
function DrillSketch() {
  const W = 460,
    H = 190,
    x0 = 50,
    x1 = W - 50,
    yS = 60,
    yM = 140
  const xm = (x0 + x1) / 2
  const cable = `M${x0},${yS} Q${xm},${2 * yM - yS} ${x1},${yS}`
  const arrows = Array.from({ length: 9 }, (_, i) => x0 + ((i + 1) * (x1 - x0)) / 10)
  const yAt = (x: number) => {
    const t = (x - x0) / (x1 - x0)
    return yS + 4 * (yM - yS) * t * (1 - t)
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md h-auto mb-3">
      <defs>
        <marker id="dl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
        </marker>
        <marker id="dd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-mute)" />
        </marker>
      </defs>
      {[x0, x1].map((x) => (
        <g key={x}>
          <path d={`M${x - 10},${yS + 12} L${x},${yS} L${x + 10},${yS + 12} z`} fill="none" stroke="var(--c-member)" strokeWidth={1.5} />
          <line x1={x - 14} y1={yS + 12} x2={x + 14} y2={yS + 12} stroke="var(--c-member)" strokeWidth={1.5} />
        </g>
      ))}
      <line x1={x0} y1={yS} x2={x1} y2={yS} stroke="var(--c-faint)" strokeDasharray="5 4" />
      {arrows.map((x) => (
        <line key={x} x1={x} y1={yAt(x) - 26} x2={x} y2={yAt(x) - 3} stroke="var(--c-load)" strokeWidth={1.4} markerEnd="url(#dl)" />
      ))}
      <text x={xm} y={yS - 30} fontSize={12} textAnchor="middle" fill="var(--c-load)" fontWeight={700}>
        w = 2 k / horizontal ft
      </text>
      <path d={cable} fill="none" stroke="var(--c-accent)" strokeWidth={2.5} />
      <line x1={xm} y1={yS + 2} x2={xm} y2={yM - 2} stroke="var(--c-mute)" strokeWidth={1.2} markerStart="url(#dd)" markerEnd="url(#dd)" />
      <text x={xm + 8} y={(yS + yM) / 2 + 4} fontSize={12} fill="var(--c-ink)" fontWeight={700}>
        h = 50 ft (sag)
      </text>
      <line x1={x0} y1={H - 22} x2={x1} y2={H - 22} stroke="var(--c-mute)" strokeWidth={1.2} markerStart="url(#dd)" markerEnd="url(#dd)" />
      <text x={xm} y={H - 8} fontSize={12} textAnchor="middle" fill="var(--c-ink)">
        L = 600 ft
      </text>
    </svg>
  )
}

function Lab() {
  const c = parabolicCable({ L: 600, w: 2, h: 50 })
  return (
    <div>
      <Section title="Quick drill — parabolic cable" sub="Span L = 600 ft between level supports; uniform load 2 k per horizontal ft; cable dips h = 50 ft below the supports at midspan (the sag)">
        <DrillSketch />
        <Answer id="cable:drill:H" label="H" value={c.H} unit="k" />
        <Answer id="cable:drill:T" label="T_max" value={c.Tmax} unit="k" />
        <Answer id="cable:drill:L" label="Cable length" value={c.length} unit="ft" />
      </Section>
      <Section title="Play">
        <CableExplorer />
        <div className="h-4" />
        <BridgeExplorer />
      </Section>
    </div>
  )
}

const problems: PYQ[] = [
  {
    id: 'own-cable-1',
    paper: 'own',
    level: 'warm-up',
    sec: 'A',
    no: '1',
    marks: 0,
    topics: ['cable'],
    title: 'Cable with two point loads',
    text: 'Level supports 120 ft apart; loads 30 k at 40 ft and 50 k at 80 ft; the sag under the 50 k load is 15 ft. Find H, the sag under the 30 k load, T_max and the cable length.',
    pages: [],
    checks: () => {
      const c = cablePointLoads({ L: 120, dh: 0, loads: [{ x: 40, P: 30 }, { x: 80, P: 50 }], sagAt: { x: 80, sag: 15 } })
      return [
        { key: 'H', label: 'H', value: c.H, unit: 'k' },
        { key: 'T', label: 'T_max', value: c.Tmax, unit: 'k' },
      ]
    },
    solution: () => {
      const c = cablePointLoads({ L: 120, dh: 0, loads: [{ x: 40, P: 30 }, { x: 80, P: 50 }], sagAt: { x: 80, sag: 15 } })
      return (
        <div className="text-sm">
          <Tex block>{`R_A = \\frac{30(80) + 50(40)}{120} = 36.67,\\ M(80) = 36.67(80) - 30(40) = 1733.3\\ \\Rightarrow H = 1733.3/15 = ${fmt(c.H, 3)}\\text{ k}`}</Tex>
          <table className="tbl w-auto">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Δy</th>
                <th>length</th>
                <th>T</th>
              </tr>
            </thead>
            <tbody>
              {c.segs.map((s, i) => (
                <tr key={i}>
                  <td>
                    {s.from}–{s.to}
                  </td>
                  <td>{fmt(s.dy, 3)}</td>
                  <td>{fmt(s.len, 3)}</td>
                  <td>{fmt(s.T, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            Total length {fmt(c.length, 3)} ft; T_max = {fmt(c.Tmax, 2)} k.
          </div>
        </div>
      )
    },
  },
  {
    id: 'own-cable-2',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '2',
    marks: 0,
    topics: ['cable'],
    title: 'Stiffening girder',
    text: 'Suspension bridge L = 800 ft, cable sag 80 ft, three-hinged stiffening girder (hinge at mid-span), hangers at 40 ft. Loads 30 k at 200 ft and 30 k at 400 ft. Hanger force and girder BMD.',
    pages: [],
    checks: () => {
      const s = stiffenedSuspension({ L: 800, h: 80, xh: 400, loads: [{ x: 200, P: 30 }, { x: 400, P: 30 }] })
      return [
        { key: 'H', label: 'H', value: s.H, unit: 'k' },
        { key: 'F', label: 'Hanger force', value: s.q * 40, unit: 'k' },
        { key: 'M', label: 'Girder moment at 200 ft', value: s.M(200), unit: 'k-ft' },
      ]
    },
    solution: () => <SuspensionSolution L={800} h={80} xh={400} loads={[{ x: 200, P: 30 }, { x: 400, P: 30 }]} panel={40} />,
  },
  {
    id: 'own-cable-3',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: '3',
    marks: 0,
    topics: ['cable'],
    title: 'Three-hinged arch, half-span UDL',
    text: 'Parabolic three-hinged arch, span 20 m, rise 5 m, 10 kN/m on the left half and 40 kN at 15 m. M, N and Q at x = 5 m.',
    pages: [],
    checks: () => {
      const a = threeHingedArch({ L: 20, h: 5, loads: [{ x: 15, P: 40 }], udl: { w: 10, a: 0, b: 10 } }).at(5)
      return [
        { key: 'M', label: 'M at 5 m', value: a.M, unit: 'kN-m' },
        { key: 'N', label: 'Normal thrust at 5 m', value: a.N, unit: 'kN' },
      ]
    },
    solution: () => <ArchSolution L={20} h={5} loads={[{ x: 15, P: 40 }]} udl={{ w: 10, a: 0, b: 10 }} at={5} />,
  },
  {
    id: 'own-cable-4',
    paper: 'own',
    level: 'challenge',
    sec: 'A',
    no: '4',
    marks: 0,
    topics: ['cable'],
    title: 'Inclined cable with stretch',
    text: 'Span 400 ft, right support 40 ft higher, uniform 1.5 k per horizontal ft, sag at mid-span 30 ft below the chord. E = 29000 ksi, A = 20 in². Find T_max, the lowest point, loaded length, stretch and unstressed length.',
    pages: [],
    checks: () => {
      const c = parabolicCable({ L: 400, w: 1.5, h: 30, dh: 40, E: 29000 * 144, A: 20 / 144 })
      return [
        { key: 'T', label: 'T_max', value: c.Tmax, unit: 'k' },
        { key: 'x', label: 'Lowest point from the left support', value: c.xLow, unit: 'ft' },
        { key: 's', label: 'Elastic stretch', value: c.stretch * 12, unit: 'in' },
      ]
    },
    solution: () => {
      const c = parabolicCable({ L: 400, w: 1.5, h: 30, dh: 40, E: 29000 * 144, A: 20 / 144 })
      return (
        <div className="text-sm">
          <Tex block>{`H = \\frac{wL^2}{8h} = \\frac{1.5(400)^2}{8(30)} = ${fmt(c.H, 2)}\\text{ k}`}</Tex>
          <Tex block>{`y'(x) = \\frac{d_h}{L} - \\frac{4h(L-2x)}{L^2}\\Rightarrow y'(400) = ${fmt(c.slope(400), 4)},\\ T_{max} = H\\sqrt{1+y'^2} = ${fmt(c.Tmax, 2)}\\text{ k}`}</Tex>
          <Tex block>{`x_{low}: y' = 0 \\Rightarrow x = \\frac L2 - \\frac{d_hL}{8h} = ${fmt(c.xLow, 2)}\\text{ ft}`}</Tex>
          <Tex block>{`\\text{length} = ${fmt(c.length, 3)}\\text{ ft},\\ \\Delta L = \\frac{H}{EA}\\int(1+y'^2)dx = ${fmt(c.stretch * 12, 3)}\\text{ in},\\ \\text{unstressed} = ${fmt(c.length - c.stretch, 3)}\\text{ ft}`}</Tex>
        </div>
      )
    },
  },
]

const mod: TopicModule = { Overview, Approach, Lab, problems }
export default mod
