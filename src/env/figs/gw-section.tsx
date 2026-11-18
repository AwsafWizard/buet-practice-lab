// Section through an aquifer with one or two pumping wells: static level, each well's own cone (dashed) and the
// superposed cone (solid), all drawn from the engine (wells.ts), so the figure always agrees with the numbers.
import { drawdownAt, headAt, staticHead, type Aquifer, type Well } from '../engine/wells'

const W = 520
const H = 300
const L = 14
const RT = 14
const GROUND = 46
const BASE = 262

export function GwSection({ aq, wells, own = true, xr, note }: { aq: Aquifer; wells: Well[]; own?: boolean; xr?: [number, number]; note?: string }) {
  const xs = wells.map((w) => w.x)
  const x0 = xr ? xr[0] : Math.min(...xs) - aq.R
  const x1 = xr ? xr[1] : Math.max(...xs) + aq.R
  const sx = (x: number) => L + ((x - x0) / (x1 - x0)) * (W - L - RT)
  const D = staticHead(aq)
  const dmax = Math.max(...wells.map((w) => drawdownAt(aq, wells, w.x)))
  // Drawn true to scale a 4 m cone in a 50 m aquifer is a hairline, so the band just below the static level
  // (a little deeper than the deepest drawdown) gets 55 % of the height and everything below it is squeezed.
  const avail = BASE - GROUND - 34
  const z = Math.min(D, Math.max(1.3 * dmax, 0.06 * D))
  const low = z >= D ? 0 : 0.45
  const exaggerated = z < D * 0.5
  const sy = (h: number) => (h >= D - z ? BASE - low * avail - ((h - (D - z)) / z) * (1 - low) * avail : BASE - (h / (D - z)) * low * avail)
  // sample positions: regular grid + log-dense near each well
  const pts = new Set<number>()
  for (let i = 0; i <= 220; i++) pts.add(x0 + ((x1 - x0) * i) / 220)
  for (const w of wells)
    for (let i = 0; i <= 40; i++) {
      const d = aq.rw * Math.pow(Math.max(aq.R, 2 * aq.rw) / aq.rw, i / 40)
      pts.add(w.x + d)
      pts.add(w.x - d)
    }
  const xsAll = [...pts].filter((x) => x >= x0 && x <= x1).sort((a, b) => a - b)
  const path = (ws: Well[]) => xsAll.map((x, i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(headAt(aq, ws, x)).toFixed(1)}`).join(' ')
  const confined = aq.kind === 'confined'
  const topAq = confined ? aq.thick : aq.thick
  const showOwn = own && wells.length > 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Section through the aquifer with the cone of depression" style={{ display: 'block' }}>
      {/* soil above */}
      <rect x={L} y={GROUND} width={W - L - RT} height={BASE - GROUND} fill="var(--c-soil)" opacity="0.18" />
      {/* aquifer */}
      <rect x={L} y={sy(topAq)} width={W - L - RT} height={BASE - sy(topAq)} fill="var(--c-water)" opacity="0.28" />
      {confined && <rect x={L} y={GROUND} width={W - L - RT} height={sy(topAq) - GROUND} fill="var(--c-soil)" opacity="0.38" />}
      <rect x={L} y={BASE} width={W - L - RT} height={10} fill="var(--c-soil)" opacity="0.55" />
      <line x1={L} x2={W - RT} y1={GROUND} y2={GROUND} stroke="var(--c-soil)" strokeWidth="2" />
      {/* static level */}
      <line x1={L} x2={W - RT} y1={sy(D)} y2={sy(D)} stroke="var(--c-water)" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={W - RT - 4} y={sy(D) - 5} textAnchor="end" fontSize="12" fill="var(--c-water)">
        {confined ? 'piezometric surface' : 'static water table'}
      </text>
      {confined && (
        <text x={L + 6} y={(GROUND + sy(topAq)) / 2 + 4} fontSize="12" fill="var(--c-mute)">
          aquitard
        </text>
      )}
      <text x={L + 6} y={BASE - 8} fontSize="12" fill="var(--c-mute)">
        {confined ? `confined aquifer, b = ${+aq.thick.toFixed(1)}` : `unconfined aquifer, H = ${+aq.thick.toFixed(1)}`}
      </text>
      {exaggerated && (
        <g>
          <path d={`M${L - 6},${sy(D - z) + 4} l12,-4 M${L - 6},${sy(D - z) + 9} l12,-4`} stroke="var(--c-faint)" strokeWidth="1.2" />
          <text x={L + 8} y={sy(D - z) + 4} fontSize="11" fill="var(--c-faint)">
            vertical scale stretched above this line
          </text>
        </g>
      )}
      {showOwn &&
        wells.map((w, i) => (
          <path key={i} d={path([w])} fill="none" stroke="var(--c-faint)" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}
      <path d={path(wells)} fill="none" stroke="var(--c-accent)" strokeWidth="2.6" />
      {/* wells */}
      {wells.map((w, i) => {
        const hw = headAt(aq, wells, w.x)
        return (
          <g key={i}>
            <rect x={sx(w.x) - 5} y={GROUND - 12} width="10" height={BASE - GROUND + 12} fill="none" stroke="var(--c-ink)" strokeWidth="1.5" />
            <rect x={sx(w.x) - 4} y={sy(hw)} width="8" height={BASE - sy(hw)} fill="var(--c-water)" opacity="0.8" />
            <text x={sx(w.x)} y={GROUND - 16} textAnchor="middle" fontSize="12" fill="var(--c-ink)">
              {wells.length > 1 ? `well ${i + 1}` : 'well'}
            </text>
          </g>
        )
      })}
      {/* drawdown dimension at first well */}
      <g>
        <line x1={sx(wells[0].x) + 12} x2={sx(wells[0].x) + 12} y1={sy(D)} y2={sy(headAt(aq, wells, wells[0].x))} stroke="var(--c-bad)" strokeWidth="2" />
        <text x={sx(wells[0].x) + 17} y={(sy(D) + sy(headAt(aq, wells, wells[0].x))) / 2 + 4} fontSize="12" fill="var(--c-bad)">
          s = {+drawdownAt(aq, wells, wells[0].x).toFixed(2)}
        </text>
      </g>
      {wells.length > 1 && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--c-mute)">
          dashed: each well alone · solid: both pumping (drawdowns add; deepest {+dmax.toFixed(2)})
        </text>
      )}
      {note && (
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--c-mute)">
          {note}
        </text>
      )}
    </svg>
  )
}
