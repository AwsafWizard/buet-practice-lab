// Contouring by the grid (square) method: RLs at grid corners → contour lines by linear interpolation
// along each grid side (marching squares, saddles split by the cell-centre mean).

export interface Seg {
  level: number
  a: [number, number]
  b: [number, number]
}

/** nice contour interval giving at least `minLines` contours across the range (0.01 / 0.02 / 0.05 / 0.1 … steps) */
export function pickInterval(min: number, max: number, minLines = 7): number {
  const range = max - min
  if (!(range > 0)) return 0.1
  const nice = [0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10]
  let best = nice[0]
  for (const n of nice) if (levels(min, max, n).length >= minLines) best = n
  return best
}

/** contour values strictly inside (min, max] stepping by the interval */
export function levels(min: number, max: number, interval: number): number[] {
  const out: number[] = []
  if (!(interval > 0)) return out
  const start = Math.ceil(min / interval - 1e-9) * interval
  for (let v = start; v <= max + 1e-9; v += interval) out.push(Math.round(v * 1e6) / 1e6)
  return out.filter((v) => v > min - 1e-9 && v < max + 1e-9)
}

/**
 * z[r][c]: RL at row r, column c (row 0 at the top / north), spacing `d` between grid lines.
 * Returns contour segments in plan coordinates (x east from column 0, y south from row 0).
 * Missing values (NaN) leave their cells blank.
 */
export function contourSegments(z: number[][], d: number, lvls: number[]): Seg[] {
  const segs: Seg[] = []
  const R = z.length
  const C = z[0]?.length ?? 0
  for (let r = 0; r < R - 1; r++)
    for (let c = 0; c < C - 1; c++) {
      // corners: tl, tr, br, bl
      const v = [z[r][c], z[r][c + 1], z[r + 1][c + 1], z[r + 1][c]]
      if (v.some((x) => !isFinite(x))) continue
      const P: [number, number][] = [
        [c * d, r * d],
        [(c + 1) * d, r * d],
        [(c + 1) * d, (r + 1) * d],
        [c * d, (r + 1) * d],
      ]
      for (const L of lvls) {
        const idx = v.map((x) => (x >= L ? 1 : 0))
        const code = idx[0] * 8 + idx[1] * 4 + idx[2] * 2 + idx[3]
        if (code === 0 || code === 15) continue
        const edge = (i: number): [number, number] => {
          const j = (i + 1) % 4
          const t = (L - v[i]) / (v[j] - v[i])
          return [P[i][0] + t * (P[j][0] - P[i][0]), P[i][1] + t * (P[j][1] - P[i][1])]
        }
        // edges: 0 top (tl–tr), 1 right (tr–br), 2 bottom (br–bl), 3 left (bl–tl)
        const crossing = [0, 1, 2, 3].filter((i) => idx[i] !== idx[(i + 1) % 4])
        if (crossing.length === 2) segs.push({ level: L, a: edge(crossing[0]), b: edge(crossing[1]) })
        else if (crossing.length === 4) {
          const centre = (v[0] + v[1] + v[2] + v[3]) / 4
          // join so the high corners stay together when the centre is high
          const highCentre = centre >= L
          const tlHigh = idx[0] === 1
          if (highCentre === tlHigh) {
            segs.push({ level: L, a: edge(3), b: edge(2) }, { level: L, a: edge(0), b: edge(1) })
          } else {
            segs.push({ level: L, a: edge(0), b: edge(3) }, { level: L, a: edge(1), b: edge(2) })
          }
        }
      }
    }
  return segs
}

/** where a contour of value L crosses between two grid points a metres apart (interpolation drill) */
export const interpolate = (z1: number, z2: number, L: number, a: number) => ((L - z1) / (z2 - z1)) * a
