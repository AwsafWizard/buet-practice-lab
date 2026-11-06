// Loaded plans from the papers (rectangles in metres, plan y up) with the point P, depth and pressure.
import { pick, randInt, rng } from '../../../labs/common'
import type { Rect } from '../../engine/stressdist'

export interface ShapeCase {
  key: string
  label: string
  rects: Rect[]
  P: [number, number]
  z: number
  q: number
  note?: string
  /** a circular area instead of rectangles (Newmark only) */
  circle?: { cx: number; cy: number; r: number }
}

const R = (x1: number, y1: number, x2: number, y2: number): Rect => ({ x1, y1, x2, y2 })

export const SHAPES: ShapeCase[] = [
  { key: 't2122', label: '2021-22 Q1(c)/2(c): T shape, P at the re-entrant corner, z = 5 m', rects: [R(-3, 0, 6, 3), R(0, -2, 3, 0)], P: [0, 0], z: 5, q: 200, note: 'Handnote: ΣI = 0.330 → 66 kPa at 200 kPa (Fadum); N ≈ 66 → 49.5 kPa at 150 kPa (Newmark).' },
  { key: 't0910', label: '2009-10 Q8(c): T shape (stem 1.5 m), z = 5 m, q = 120', rects: [R(-3, 0, 6, 3), R(0, -1.5, 3, 0)], P: [0, 0], z: 5, q: 120, note: 'Handnote: ΣI = 0.3129 → 37.5 kPa; Newmark N ≈ 63.' },
  { key: 'l1112', label: '2011-12 Q7(c): L-shaped building, interior corner, z = 8 m', rects: [R(-10, 0, 0, 10), R(-10, -10, 0, 0), R(0, -10, 30, 0)], P: [0, 0], z: 8, q: 75, note: 'Handnote: 0.2000 + 0.2000 + 0.2196 → 46.5 kPa.' },
  { key: 'l0809', label: '2008-09 Q7(b): L-shaped building, z = 10 m', rects: [R(-10, 0, 0, 10), R(-10, -15, 15, 0)], P: [0, 0], z: 10, q: 75, note: 'Handnote: 0.1752 + 0.1936 + 0.2157 = 0.5845 → 43.8 kPa (N ≈ 117).' },
  {
    key: 'n2324',
    label: '2023-24 Q7(a): notched 6 × 9 m area, z = 3 m (scan labels: P 3 m from the left edge)',
    rects: [R(0, 6, 6, 9), R(3, 3, 6, 6), R(0, 0, 6, 3)],
    P: [3, 4.5],
    z: 3,
    q: 150,
    note: 'Following the scan labels, P is 3 m from the left edge and 1.5 m below the notch top, i.e. on the notch’s inner edge: ΣI = 0.534 → ≈ 80 kPa. The handnote put P at the notch centre (1.5 m from the edge) → 54 kPa; the drawing itself (not to scale) shows P at the centre of a deeper notch → ≈ 53 kPa. Move P to (1.5, 4.5) to see the handnote reading.',
  },
  { key: 'o2021', label: '2020-21 Q4(d): P 1 m outside side AD on the mid-line, z = 2 m', rects: [R(0, -1, 3, 1)], P: [-1, 0], z: 2, q: 150, note: 'Handnote: 2 × 150 × (0.1350 − 0.0840) = 15.3 kPa.' },
  { key: 'c1011', label: '2010-11 Q8(b): 2 × 4 m, below the centre, z = 5 m (t/m²)', rects: [R(-1, -2, 1, 2)], P: [0, 0], z: 5, q: 8, note: 'Handnote: 4 × 0.0328 × 8 = 1.05 t/m²; below a corner 0.75 t/m².' },
  { key: 'c2324', label: '2023-24 Q8(b): 4 × 6 m, 4800 kN, 6 m below the centre', rects: [R(-2, -3, 2, 3)], P: [0, 0], z: 6, q: 200, note: 'Handnote: 4 × 0.0612 × 200 ≈ 49 kPa (Steinbrenner z/b = 3, l/b = 1.5).' },
]

export const TANK: ShapeCase = { key: 'tank', label: '2007-08 Q2(a): 8 m circular raft, 4 m below the centre', rects: [], P: [0, 0], z: 4, q: 200, circle: { cx: 0, cy: 0, r: 4 }, note: 'Handnote: N ≈ 129 meshes → 129 kPa; formula 129.3 kPa.' }

/** 🎲 an L, T or notched plan with P at a corner, on an edge, inside or outside */
export function randomShape(seed: number): ShapeCase {
  const r = rng(seed * 613 + 29)
  const kind = pick(r, ['L', 'T', 'notch', 'rect-out', 'rect-in'] as const)
  const a = randInt(r, 2, 6)
  const b = randInt(r, 2, 6)
  const c = randInt(r, 2, 8)
  const d = randInt(r, 2, 5)
  const z = randInt(r, 2, 10)
  const q = randInt(r, 5, 25) * 10
  let rects: Rect[]
  let P: [number, number]
  if (kind === 'L') {
    rects = [R(-a, 0, 0, c), R(-a, -d, b + randInt(r, 0, 6), 0)]
    P = [0, 0]
  } else if (kind === 'T') {
    rects = [R(-a, 0, a + b, d), R(0, -c, b, 0)]
    P = [0, 0]
  } else if (kind === 'notch') {
    const W = a + b
    rects = [R(0, d + c, W, 2 * d + c), R(a, d, W, d + c), R(0, 0, W, d)]
    P = pick(r, [[a, d + c / 2], [a / 2, d + c / 2], [W, d + c / 2]] as [number, number][])
  } else if (kind === 'rect-out') {
    rects = [R(0, 0, a + b, c)]
    P = [-randInt(r, 1, 3), pick(r, [0, c / 2, c + 1])]
  } else {
    rects = [R(0, 0, a + b, c)]
    P = [randInt(r, 1, a + b - 1), randInt(r, 0, c)]
  }
  return { key: `rnd${seed}`, label: `Random ${kind}`, rects, P, z, q }
}
