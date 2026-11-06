// Pressure-bulb heat map under a strip, square or circular footing (σz/q bands, the 0.1q bulb), with the
// centre-line comparison of the three shapes.
import { useMemo, useState } from 'react'
import { fmt } from '../../../components/DiagramView'
import { Md, Seg } from '../../../components/ui'
import { bulbDepth, bulbRatio, type BulbShape } from '../../engine/stressdist'
import { ShapeCompareFig } from './figs'

const BANDS = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05]

export function BulbLab() {
  const [shape, setShape] = useState<BulbShape>('square')
  const nx = 41
  const zMax = shape === 'strip' ? 7 : 4
  const nz = shape === 'strip' ? 57 : 41
  const grid = useMemo(() => {
    const out: number[][] = []
    for (let j = 0; j < nz; j++) {
      const z = ((j + 0.5) / nz) * zMax
      const row: number[] = []
      for (let i = 0; i < nx; i++) row.push(bulbRatio(shape, 1, -2 + ((i + 0.5) / nx) * 4, z))
      out.push(row)
    }
    return out
  }, [shape, nz, zMax])
  const W = 380
  const cw = W / nx
  const ch = (zMax / nz) * (W / 4)
  const H = ch * nz
  const d01 = bulbDepth(shape, 1, 0.1)
  const band = (v: number) => BANDS.findIndex((b) => v >= b)
  return (
    <div className="grid cq-lg:grid-cols-2 gap-4">
      <div>
        <Seg value={shape} onChange={setShape} items={[{ v: 'strip', label: 'strip (width B)' }, { v: 'square', label: 'square B × B' }, { v: 'circle', label: 'circle D = B' }]} />
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full mt-2" role="img" aria-label="pressure bulb">
          <g transform="translate(0,20)">
            {grid.map((row, j) =>
              row.map((v, i) => {
                const b = band(v)
                return b < 0 ? null : <rect key={`${i}-${j}`} x={i * cw} y={j * ch} width={cw + 0.3} height={ch + 0.3} fill="var(--c-accent)" opacity={0.08 + 0.085 * (BANDS.length - b)} />
              }),
            )}
            <rect x={W / 2 - W / 8} y={-8} width={W / 4} height={8} fill="var(--c-load)" />
            <line x1={0} x2={W} y1={(d01 / zMax) * H} y2={(d01 / zMax) * H} stroke="var(--c-load)" strokeDasharray="4 3" />
            <text x={4} y={(d01 / zMax) * H - 4} fontSize={10} fill="var(--c-load)">
              0.1q at {fmt(d01, 2)}B below the centre
            </text>
            {Array.from({ length: Math.floor(zMax) + 1 }, (_, k) => (
              <text key={k} x={W - 4} y={(k / zMax) * H + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
                {k}B
              </text>
            ))}
          </g>
        </svg>
        <div className="text-xs text-faint">Bands: σz/q ≥ 0.9, 0.8 … 0.1, 0.05 (darker = higher). Width shown: 4B.</div>
      </div>
      <div className="space-y-2">
        <ShapeCompareFig />
        <Md className="text-sm">{`- σz = q at the surface for all three; it falls with depth fastest under the **circle**, then the **square**, slowest under the **strip** (an infinitely long strip loads far more area).
- At z = 2B: ≈ ${fmt(bulbRatio('square', 1, 0, 2), 2)}q (square), ${fmt(bulbRatio('circle', 1, 0, 2), 2)}q (circle), ${fmt(bulbRatio('strip', 1, 0, 2), 2)}q (strip).
- The 0.1q bulb (significant depth) reaches ≈ ${fmt(bulbDepth('square', 1), 1)}B (square), ${fmt(bulbDepth('circle', 1), 1)}B (circle), ${fmt(bulbDepth('strip', 1), 1)}B (strip). SJMY's slides round these to ≈ 2B and ≈ 4B — investigate at least that deep.`}</Md>
      </div>
    </div>
  )
}
