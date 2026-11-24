// Closed traverse (the pentagon field work): included angles + sides + the bearing of one line →
// angular correction → bearings → latitudes & departures → closing error → Bowditch (or transit)
// adjustment → coordinates → area (coordinates and DMD), in m², acres and decimals.

import { backBearing, latDep, norm360, reducedBearing } from './angle'

export interface TraverseInput {
  /** station names in the order walked, e.g. ['A','B','C','D','E'] (the last joins back to the first) */
  names: string[]
  /** observed included (interior) angle at each station, decimal degrees */
  angles: number[]
  /** side lengths: lengths[i] = station i → station i+1 */
  lengths: number[]
  /** observed whole-circle bearing of the first line (names[0] → names[1]) */
  bearing0: number
  /** which way round the stations are walked (decides the sign when carrying bearings) */
  dir: 'cw' | 'acw'
  /** 'bowditch' (compass rule, the usual) or 'transit' */
  rule?: 'bowditch' | 'transit'
  /** compass bearings read on the other lines (optional, same order as lengths): used to check the walking direction */
  compass?: (number | null | undefined)[]
  /** coordinates of the first station (default 0, 0 — many students use 100, 100 to keep them positive) */
  start?: { n: number; e: number }
}

export interface TraverseLeg {
  from: string
  to: string
  length: number
  observed: number
  corrected: number
  wcb: number
  rb: string
  lat: number
  dep: number
  cLat: number
  cDep: number
  adjLat: number
  adjDep: number
}

export interface TraverseResult {
  n: number
  /** (n − 2)·180 */
  theorySum: number
  observedSum: number
  /** observed − theory (degrees) */
  angError: number
  /** each angle's correction (degrees) */
  angCorr: number
  legs: TraverseLeg[]
  sumLat: number
  sumDep: number
  perimeter: number
  /** linear closing error √(ΣL² + ΣD²) */
  closing: number
  /** bearing of the closing error (direction of the gap from the start to where the traverse ended) */
  closingBearing: number
  /** perimeter / closing error, i.e. accuracy 1 in … */
  precision: number
  /** coordinates of each station after adjustment (and before, for the graphical method) */
  coords: { name: string; n: number; e: number }[]
  raw: { name: string; n: number; e: number }[]
  area: number
  /** the DMD table (double meridian distance), as in the textbook */
  dmd: { leg: string; dmd: number; dblArea: number }[]
  /** when the compass bearings fit the other walking direction far better, a hint */
  dirHint?: string
}

const SQ_FT_PER_ACRE = 43560
export const M2_PER_ACRE = 4046.8564224

/** area in acres and decimals (1 acre = 100 decimals) from square metres or square feet */
export function acres(area: number, unit: 'm' | 'ft') {
  const ac = unit === 'm' ? area / M2_PER_ACRE : area / SQ_FT_PER_ACRE
  return { acres: ac, decimals: ac * 100 }
}

function carry(input: TraverseInput, corrected: number[], dir: 'cw' | 'acw') {
  const n = input.names.length
  const wcb: number[] = [norm360(input.bearing0)]
  for (let i = 1; i < n; i++) {
    // at station i, the included angle sits between the back line (to i−1) and the forward line (to i+1)
    const back = backBearing(wcb[i - 1])
    wcb[i] = norm360(dir === 'cw' ? back - corrected[i] : back + corrected[i])
  }
  // the check: carrying on round to the first line again must give the starting bearing back
  const back = backBearing(wcb[n - 1])
  const again = norm360(dir === 'cw' ? back - corrected[0] : back + corrected[0])
  return { wcb, again }
}

/** mean disagreement (degrees) between carried bearings and the compass bearings read in the field */
function compassGap(wcb: number[], compass?: (number | null | undefined)[]) {
  const d: number[] = []
  compass?.forEach((c, i) => {
    if (i === 0 || c == null || !isFinite(c)) return
    const g = Math.abs(norm360(wcb[i] - c + 180) - 180)
    d.push(g)
  })
  return d.length ? d.reduce((s, x) => s + x, 0) / d.length : null
}

export function solveTraverse(input: TraverseInput): TraverseResult {
  const { names, angles, lengths } = input
  const n = names.length
  const theorySum = (n - 2) * 180
  const observedSum = angles.reduce((s, a) => s + a, 0)
  const angError = observedSum - theorySum
  const angCorr = -angError / n
  const corrected = angles.map((a) => a + angCorr)
  const { wcb } = carry(input, corrected, input.dir)

  let dirHint: string | undefined
  const other = input.dir === 'cw' ? 'acw' : 'cw'
  // both directions close (one gives the mirror image), so only the compass bearings can tell them apart
  const gThis = compassGap(wcb, input.compass)
  const gOther = compassGap(carry(input, corrected, other).wcb, input.compass)
  if (gThis !== null && gOther !== null && gThis > 5 && gOther < gThis / 3)
    dirHint = `The traverse closes far better if the stations go round ${other === 'cw' ? 'clockwise' : 'anticlockwise'} — check the direction setting.`

  const legs: TraverseLeg[] = names.map((from, i) => {
    const to = names[(i + 1) % n]
    const { lat, dep } = latDep(lengths[i], wcb[i])
    return { from, to, length: lengths[i], observed: angles[i], corrected: corrected[i], wcb: wcb[i], rb: reducedBearing(wcb[i]).text, lat, dep, cLat: 0, cDep: 0, adjLat: 0, adjDep: 0 }
  })
  const sumLat = legs.reduce((s, l) => s + l.lat, 0)
  const sumDep = legs.reduce((s, l) => s + l.dep, 0)
  const perimeter = lengths.reduce((s, l) => s + l, 0)
  const closing = Math.hypot(sumLat, sumDep)
  const closingBearing = norm360((Math.atan2(sumDep, sumLat) * 180) / Math.PI)
  const precision = closing > 0 ? perimeter / closing : Infinity

  const absLat = legs.reduce((s, l) => s + Math.abs(l.lat), 0)
  const absDep = legs.reduce((s, l) => s + Math.abs(l.dep), 0)
  for (const l of legs) {
    if (input.rule === 'transit') {
      l.cLat = absLat ? (-sumLat * Math.abs(l.lat)) / absLat : 0
      l.cDep = absDep ? (-sumDep * Math.abs(l.dep)) / absDep : 0
    } else {
      l.cLat = (-sumLat * l.length) / perimeter
      l.cDep = (-sumDep * l.length) / perimeter
    }
    l.adjLat = l.lat + l.cLat
    l.adjDep = l.dep + l.cDep
  }

  const start = input.start ?? { n: 0, e: 0 }
  const coords = [{ name: names[0], ...start }]
  const raw = [{ name: names[0], ...start }]
  for (let i = 0; i < n - 1; i++) {
    coords.push({ name: names[i + 1], n: coords[i].n + legs[i].adjLat, e: coords[i].e + legs[i].adjDep })
    raw.push({ name: names[i + 1], n: raw[i].n + legs[i].lat, e: raw[i].e + legs[i].dep })
  }
  // the unadjusted traverse ends here instead of on the start (for the graphical closing-error plot)
  raw.push({ name: names[0] + '′', n: raw[n - 1].n + legs[n - 1].lat, e: raw[n - 1].e + legs[n - 1].dep })

  // shoelace on the adjusted coordinates
  let twice = 0
  for (let i = 0; i < n; i++) {
    const a = coords[i]
    const b = coords[(i + 1) % n]
    twice += a.e * b.n - b.e * a.n
  }
  const area = Math.abs(twice) / 2

  // DMD: first leg's DMD = its departure; next = previous DMD + previous dep + this dep
  const dmd: TraverseResult['dmd'] = []
  let prev = 0
  legs.forEach((l, i) => {
    const d = i === 0 ? l.adjDep : prev + legs[i - 1].adjDep + l.adjDep
    prev = d
    dmd.push({ leg: `${l.from}${l.to}`, dmd: d, dblArea: d * l.adjLat })
  })

  return { n, theorySum, observedSum, angError, angCorr, legs, sumLat, sumDep, perimeter, closing, closingBearing, precision, coords, raw, area, dmd, dirHint }
}

/** included angle at a station from the bearings of its two lines (back = to the previous station, fwd = to the next) */
export function includedFromBearings(back: number, fwd: number) {
  return norm360(back - fwd)
}
