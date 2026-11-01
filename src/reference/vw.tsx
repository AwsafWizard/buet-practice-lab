import { Md, Tex } from '../components/ui'
import type { RefItem } from './common'

type Shape = 'rect' | 'triUp' | 'trap' | 'parab' | 'triPeak' | 'triDown'

/** little diagram of a moment shape over length L (baseline at the bottom) */
function ShapeIcon({ s, color, sym }: { s: Shape; color: string; sym: [string, string?] }) {
  const W = 64,
    H = 34,
    b = 26,
    t = 6
  const pts: Record<Exclude<Shape, 'parab'>, string> = {
    rect: `0,${b} 0,${t} ${W},${t} ${W},${b}`,
    triUp: `0,${b} ${W},${t} ${W},${b}`,
    trap: `0,${b} 0,${t + 9} ${W},${t} ${W},${b}`,
    triPeak: `0,${b} ${W * 0.35},${t} ${W},${b}`,
    triDown: `0,${b} 0,${t} ${W},${b}`,
  }
  const parab = `M0,${b} Q${W / 2},${t - 10} ${W},${t} L${W},${b} Z`
  return (
    <svg viewBox={`-4 0 ${W + 8} ${H + 6}`} className="w-16 h-auto block mx-auto">
      {s === 'parab' ? <path d={parab} fill={color} fillOpacity={0.25} stroke={color} /> : <polygon points={pts[s]} fill={color} fillOpacity={0.25} stroke={color} />}
      <text x={W / 2} y={H + 5} textAnchor="middle" fontSize={8.5} fill="var(--c-mute)">
        L
      </text>
      {sym[1] ? (
        <>
          <text x={2} y={t + 8} fontSize={8} fill="var(--c-ink)">
            {sym[0]}
          </text>
          <text x={W - 2} y={t + 8} fontSize={8} textAnchor="end" fill="var(--c-ink)">
            {sym[1]}
          </text>
        </>
      ) : (
        <text x={s === 'triPeak' ? W * 0.35 : s === 'triDown' ? 4 : W - 3} y={t + (s === 'rect' ? 10 : 8)} fontSize={8} textAnchor={s === 'triPeak' ? 'middle' : s === 'triDown' ? 'start' : 'end'} fill="var(--c-ink)">
          {sym[0]}
        </text>
      )}
      {s === 'triPeak' && (
        <>
          <line x1={W * 0.35} x2={W * 0.35} y1={t} y2={b} stroke="var(--c-faint)" strokeDasharray="2 2" />
          <text x={W * 0.17} y={b - 2} fontSize={7.5} textAnchor="middle" fill="var(--c-mute)">
            a
          </text>
          <text x={W * 0.67} y={b - 2} fontSize={7.5} textAnchor="middle" fill="var(--c-mute)">
            b
          </text>
        </>
      )}
    </svg>
  )
}

const COLS: { s: Shape; sym: [string, string?]; name: string }[] = [
  { s: 'rect', sym: ["m'"], name: 'rectangle' },
  { s: 'triUp', sym: ["m'"], name: 'triangle' },
  { s: 'trap', sym: ["m'₁", "m'₂"], name: 'trapezoid' },
  { s: 'parab', sym: ["m'"], name: 'parabola' },
]
const ROWS: { s: Shape; sym: [string, string?]; v: string[] }[] = [
  { s: 'rect', sym: ['m'], v: ["mm'L", "\\tfrac12mm'L", "\\tfrac12m(m'_1 + m'_2)L", "\\tfrac23mm'L"] },
  { s: 'triUp', sym: ['m'], v: ["\\tfrac12mm'L", "\\tfrac13mm'L", "\\tfrac16m(m'_1 + 2m'_2)L", "\\tfrac{5}{12}mm'L"] },
  {
    s: 'trap',
    sym: ['m₁', 'm₂'],
    v: ["\\tfrac12m'(m_1 + m_2)L", "\\tfrac16m'(m_1 + 2m_2)L", "\\tfrac16\\big[m'_1(2m_1 + m_2) + m'_2(m_1 + 2m_2)\\big]L", "\\tfrac{1}{12}m'(3m_1 + 5m_2)L"],
  },
  { s: 'triPeak', sym: ['m'], v: ["\\tfrac12mm'L", "\\tfrac16mm'(L + a)", "\\tfrac16m\\big[m'_1(L + b) + m'_2(L + a)\\big]", "\\tfrac{1}{12}mm'\\left(3 + \\tfrac{3a}{L} - \\tfrac{a^2}{L^2}\\right)L"] },
  { s: 'triDown', sym: ['m'], v: ["\\tfrac12mm'L", "\\tfrac16mm'L", "\\tfrac16m(2m'_1 + m'_2)L", "\\tfrac14mm'L"] },
]

function Chart() {
  return (
    <>
      <div className="overflow-x-auto scroll-thin">
        <table className="tbl ref-tbl">
          <thead>
            <tr>
              <th className="!text-center">
                <Tex>{"\\int_0^L mm'\\,dx"}</Tex>
              </th>
              {COLS.map((c) => (
                <th key={c.name} className="!text-center">
                  <ShapeIcon s={c.s} sym={c.sym} color="var(--c-load)" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i}>
                <td>
                  <ShapeIcon s={r.s} sym={r.sym} color="var(--c-accent)" />
                </td>
                {r.v.map((v, j) => (
                  <td key={j} className="txt !text-center whitespace-nowrap">
                    <Tex>{v}</Tex>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-faint mt-1 leading-snug">
        Chart 1 printed with every recent paper. The parabola is zero at the left end and has its vertex (zero slope) at m′ on the right. For a symmetric parabola (vertex at mid-span) × triangle use ⅓ mm′L; × rectangle ⅔ mm′L. Mirror a row or column when your diagram is flipped. Use ⇤ wide to see the whole chart.
      </div>
    </>
  )
}

function Equation() {
  return (
    <Md>{`$$1\\cdot\\Delta = \\sum\\int\\frac{Mm}{EI}dx + \\sum\\frac{NnL}{AE} + \\sum\\int\\frac{K\\,Vv}{GA}dx + \\sum n\\,\\Delta L - \\sum r\\,\\Delta_s$$
- Rotation: apply a unit couple instead of a unit load.
- $EI$ in k·ft² = $E$(ksi) × $I$(in⁴) / 144. $G = E/2(1 + \\nu)$. Shear form factor K = 1.2 for a rectangle.
- Fabrication error / temperature: $\\Delta L = \\alpha\\,\\Delta T\\,L$ or the given misfit, with the member's unit-load force n.`}</Md>
  )
}

export const VW_ITEMS: RefItem[] = [
  { id: 'v-chart', group: 'vw', title: 'Integration chart ∫ m m′ dx', tag: 'Chart 1', exam: true, keywords: 'product integral table m m prime triangle trapezoid parabola', Body: Chart },
  { id: 'v-eq', group: 'vw', title: 'Unit-load equation & unit conversions', keywords: 'virtual work unit load ei ae ga shear fabrication', Body: Equation },
]
