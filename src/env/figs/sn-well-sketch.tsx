// Labelled sketch of a pumped well (not to scale): static level, the cone of depression, and every symbol the
// Thiem / Dupuit formulas use (r, R, s, D and d, or b), with the paper's numbers on them. Observation wells, if any,
// sit on the same cone with their r and drawdown. The cone follows the log profile of the formulas.
const W = 520
const H = 270
const CX = 250
const HALF = 215
const RW_PX = 6
const GROUND = 30
const YS = 72
const BASE = 236
const TOP_CONF = 156

const fmt = (v: number) => String(+v.toPrecision(4))
const SUB = ['₁', '₂', '₃']

export interface WellSketchProps {
  kind: 'confined' | 'unconfined'
  unit: string
  /** well radius */
  rw: number
  /** radius of influence (omit when the paper gives none) */
  R?: number
  /** drawdown at the pumped well */
  s?: number
  /** unconfined: static depth of water above the impermeable base */
  D?: number
  /** unconfined: depth of water in the pumped well (D − s) */
  d?: number
  /** confined: aquifer thickness */
  b?: number
  /** observation wells at distance r with their drawdown s or water depth h */
  obs?: { r: number; s?: number; h?: number }[]
}

export function WellSketch({ kind, unit, rw, R, s, D, d, b, obs = [] }: WellSketchProps) {
  const conf = kind === 'confined'
  const yW = conf ? 128 : 142
  const Rdraw = Math.max(R ?? 0, 1.25 * Math.max(0, ...obs.map((o) => o.r))) || 1
  // sqrt spacing keeps a near observation well clear of the pumped one (the sketch is not to scale anyway)
  const px = (r: number) => RW_PX + (HALF - RW_PX) * Math.sqrt(Math.min(1, r / Rdraw))
  const level = (rho: number) => yW + (YS - yW) * (Math.log(Math.max(rho, RW_PX) / RW_PX) / Math.log(HALF / RW_PX))
  const cone: string[] = []
  for (let k = 0; k <= 40; k++) {
    const rho = RW_PX * Math.pow(HALF / RW_PX, k / 40)
    cone.push(`${(CX + rho).toFixed(1)},${level(rho).toFixed(1)}`)
  }
  const left = cone.map((p) => {
    const [x, y] = p.split(',').map(Number)
    return `${(2 * CX - x).toFixed(1)},${y.toFixed(1)}`
  })
  const conePath = `M${[...left].reverse().join(' L')} L${cone.join(' L')}`
  const u = ` ${unit}`
  const dim = (x: number, y1: number, y2: number, label: string, side: 'l' | 'r', col = 'var(--c-ink)') => (
    <g>
      <line x1={x} x2={x} y1={y1} y2={y2} stroke={col} strokeWidth={1.3} />
      <line x1={x - 4} x2={x + 4} y1={y1} y2={y1} stroke={col} strokeWidth={1.3} />
      <line x1={x - 4} x2={x + 4} y1={y2} y2={y2} stroke={col} strokeWidth={1.3} />
      <text x={side === 'l' ? x - 6 : x + 6} y={(y1 + y2) / 2 + 4} fontSize="12" textAnchor={side === 'l' ? 'end' : 'start'} fill={col}>
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="labelled sketch of the pumped well and its cone of depression" style={{ display: 'block', maxWidth: 620 }}>
      <rect x={20} y={GROUND} width={W - 40} height={BASE - GROUND} fill="var(--c-soil)" opacity="0.14" />
      {conf ? (
        <>
          <rect x={20} y={TOP_CONF} width={W - 40} height={BASE - TOP_CONF} fill="var(--c-water)" opacity="0.28" />
          <rect x={20} y={TOP_CONF - 26} width={W - 40} height={26} fill="var(--c-soil)" opacity="0.4" />
          <text x={W - 24} y={TOP_CONF - 9} fontSize="11" textAnchor="end" fill="var(--c-mute)">
            confining layer
          </text>
          <text x={W - 24} y={BASE - 8} fontSize="11" textAnchor="end" fill="var(--c-mute)">
            confined aquifer
          </text>
        </>
      ) : (
        <>
          <path d={`${conePath} L${CX + HALF},${BASE} L${CX - HALF},${BASE} Z`} fill="var(--c-water)" opacity="0.28" />
          <rect x={20} y={YS} width={CX - HALF - 20} height={BASE - YS} fill="var(--c-water)" opacity="0.28" />
          <rect x={CX + HALF} y={YS} width={W - 20 - CX - HALF} height={BASE - YS} fill="var(--c-water)" opacity="0.28" />
          <text x={W - 24} y={BASE - 8} fontSize="11" textAnchor="end" fill="var(--c-mute)">
            unconfined aquifer
          </text>
        </>
      )}
      <rect x={20} y={BASE} width={W - 40} height={9} fill="var(--c-soil)" opacity="0.55" />
      <text x={W - 24} y={BASE + 22} fontSize="11" textAnchor="end" fill="var(--c-mute)">
        impermeable base
      </text>
      <line x1={20} x2={W - 20} y1={GROUND} y2={GROUND} stroke="var(--c-soil)" strokeWidth="2" />
      {/* static level and the cone */}
      <line x1={20} x2={W - 20} y1={YS} y2={YS} stroke="var(--c-water)" strokeWidth="1.4" strokeDasharray="6 4" />
      <text x={24} y={YS - 5} fontSize="11" fill="var(--c-water)">
        {conf ? 'static piezometric level' : 'static water table'}
      </text>
      <path d={conePath} fill="none" stroke="var(--c-accent)" strokeWidth="2.4" />
      <text x={CX - HALF + 60} y={YS + 16} fontSize="11" fill="var(--c-accent)">
        {conf ? 'piezometric surface when pumping' : 'drawdown curve'}
      </text>
      {/* the well */}
      <rect x={CX - RW_PX} y={GROUND - 12} width={RW_PX * 2} height={BASE - GROUND + 12} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.4" />
      <rect x={CX - RW_PX + 1} y={yW} width={RW_PX * 2 - 2} height={BASE - yW} fill="var(--c-water)" opacity="0.85" />
      <text x={CX + 10} y={GROUND - 4} fontSize="12" fill="var(--c-ink)">
        r = {fmt(rw)}
        {u}
      </text>
      {/* R */}
      {R !== undefined && (
        <g>
          <line x1={CX} x2={CX + HALF} y1={YS - 22} y2={YS - 22} stroke="var(--c-mute)" strokeWidth={1.2} />
          <line x1={CX + HALF} x2={CX + HALF} y1={YS - 27} y2={YS - 2} stroke="var(--c-mute)" strokeWidth={1.2} />
          <text x={CX + HALF - 4} y={YS - 26} fontSize="12" textAnchor="end" fill="var(--c-mute)">
            R = {fmt(R)}
            {u}
          </text>
        </g>
      )}
      {s !== undefined && dim(CX - 18, YS, yW, `s = ${fmt(s)}${u}`, 'l', 'var(--c-bad)')}
      {!conf && D !== undefined && dim(44, YS, BASE, `D = ${fmt(D)}${u}`, 'r')}
      {!conf && d !== undefined && dim(CX - 18, yW, BASE, `d = ${fmt(d)}${u}`, 'l')}
      {conf && b !== undefined && dim(44, TOP_CONF, BASE, `b = ${fmt(b)}${u}`, 'r')}
      {obs.map((o, i) => {
        const x = CX + px(o.r)
        const y = level(px(o.r))
        return (
          <g key={i}>
            <rect x={x - 3} y={GROUND - 8} width={6} height={BASE - GROUND + 8} fill="var(--c-panel)" stroke="var(--c-mute)" strokeWidth="1" />
            <rect x={x - 2} y={y} width={4} height={BASE - y} fill="var(--c-water)" opacity="0.85" />
            <text x={x} y={GROUND - 12} fontSize="11" textAnchor="middle" fill="var(--c-ink)">
              r{SUB[i]} = {fmt(o.r)}
            </text>
            {o.s !== undefined && (
              <g>
                <line x1={x + 6} x2={x + 6} y1={YS} y2={y} stroke="var(--c-bad)" strokeWidth={1.3} />
                <text x={x + 9} y={(YS + y) / 2 + 8} fontSize="11" fill="var(--c-bad)">
                  s{SUB[i]} = {fmt(o.s)}
                </text>
              </g>
            )}
            {o.h !== undefined && (
              <g>
                <line x1={x + 6} x2={x + 6} y1={y} y2={BASE} stroke="var(--c-ink)" strokeWidth={1.2} />
                <text x={x + 9} y={(y + BASE) / 2 + 4} fontSize="11" fill="var(--c-ink)">
                  h{SUB[i]} = {fmt(o.h)}
                </text>
              </g>
            )}
          </g>
        )
      })}
      <text x={24} y={H - 6} fontSize="11" fill="var(--c-faint)">
        sketch, not to scale ({unit})
      </text>
    </svg>
  )
}
