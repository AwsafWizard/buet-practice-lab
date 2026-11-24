import type { SvTopicId } from '../store'

/** sidebar groups: tape & compass work, levelling, theodolite work, setting out + modern instruments */
export type SvGroup = 'tape' | 'level' | 'theo' | 'set'

export interface SvTopicMeta {
  id: SvTopicId
  title: string
  short: string
  group: SvGroup
  blurb: string
  /** the field day(s) it is done on, ISO dates (class program 2026) */
  days: string[]
  /** field-book sheet kind for this topic's tool (see field/kinds.ts), if any */
  sheet?: string
  color: string
}

const C: Record<SvGroup, string> = { tape: 'var(--c-g-tape)', level: 'var(--c-g-level)', theo: 'var(--c-g-theo)', set: 'var(--c-g-set)' }

export const SV_TOPICS: SvTopicMeta[] = [
  { id: 'sv-inst', title: 'Instruments & Their Handling', short: 'Instruments', group: 'tape', blurb: 'Chain, tape, ranging rod, arrows, optical square, compasses, plumb bob, level and staff, theodolite: parts, uses, temporary adjustments and how to read them. The 25 Nov quiz.', days: ['2026-11-24', '2026-11-25'], color: 'var(--c-g-inst)' },
  { id: 'sv-chain', title: 'Chain Survey', short: 'Chain survey', group: 'tape', blurb: 'A triangle of main lines, offsets to the details, tie and check lines, fixing a station from three permanent objects, the field book and the plotted sheet.', days: ['2026-11-25'], sheet: 'chain', color: C.tape },
  { id: 'sv-compass', title: 'Compass & Bearings', short: 'Bearings', group: 'tape', blurb: 'Whole-circle and reduced bearings, fore and back bearings, included angles from bearings, declination and local attraction.', days: ['2026-11-25', '2026-11-26'], sheet: 'bearing', color: C.tape },
  { id: 'sv-level', title: 'Levelling (Profile & Cross-sections)', short: 'Levelling', group: 'level', blurb: 'Rise & fall and HI methods, change points, the level-book checks; a 100 m × 6 m strip with centre-line readings every 10 m and cross-sections every 20 m.', days: ['2026-11-25'], sheet: 'level', color: C.level },
  { id: 'sv-contour', title: 'Contouring (Grid Method)', short: 'Contouring', group: 'level', blurb: 'A 50 m square on a 5 m grid, two level stations, RLs of every grid point and a contour map with at least 7 contour lines.', days: ['2026-11-30', '2026-12-01'], sheet: 'contour', color: C.level },
  { id: 'sv-route', title: 'Route Project', short: 'Route project', group: 'level', blurb: '150 m of a two-lane road (3 × 50 m segments, ROW 10 m): reconnaissance, control, centre-line alignment, details, longitudinal and cross-sections at 1:500 / 1:100.', days: ['2026-11-30', '2026-12-01'], sheet: 'route', color: C.level },
  { id: 'sv-traverse', title: 'Theodolite Traverse (Closed Pentagon)', short: 'Traverse', group: 'theo', blurb: 'Included angles and sides of a pentagon (sides > 15 m), bearings, latitudes and departures, closing error, Bowditch adjustment and the area in acres and decimals.', days: ['2026-11-26'], sheet: 'traverse', color: C.theo },
  { id: 'sv-stadia', title: 'Stadia Tacheometry', short: 'Stadia', group: 'theo', blurb: 'Finding the tacheometric constants K and C, then at least 25 staff positions by bearing + stadia readings, no tape — a curved path mapped by distances read off the staff.', days: ['2026-11-26'], sheet: 'stadia', color: C.theo },
  { id: 'sv-height', title: 'Height & Distance', short: 'Height & distance', group: 'theo', blurb: 'Height of an inaccessible tower, the aerial distance between two elevated points and the area of a space triangle — all from a measured base and theodolite angles.', days: ['2026-11-28'], sheet: 'height', color: C.theo },
  { id: 'sv-curve', title: 'Curve Setting (Transition + Circular)', short: 'Curve setting', group: 'theo', blurb: 'Radius from the centrifugal ratio, super-elevation, transition length, shift, tangent length, chainages and the deflection-angle tables; set out with one theodolite.', days: ['2026-11-29'], sheet: 'curve', color: C.theo },
  { id: 'sv-house', title: 'House Setting', short: 'House setting', group: 'set', blurb: 'Laying out the foundation trench of the supplied plan by the centre-line method with bamboo sticks, rope and lime; squaring by diagonals; levelling the centre line.', days: ['2026-11-28'], sheet: 'house', color: C.set },
  { id: 'sv-modern', title: 'EDM, Total Station, GPS & Drone', short: 'Modern instruments', group: 'set', blurb: 'EDM, digital level, total station types and codes, GPS vs DGPS vs RTK, prisms, drone mapping, TLS; data processing and drawing preparation.', days: ['2026-11-26', '2026-11-28', '2026-11-29', '2026-12-02'], color: C.set },
]

export const svTopicById = (id: string) => SV_TOPICS.find((t) => t.id === id)

export const SV_GROUP_LABEL: Record<SvGroup, string> = {
  tape: 'Instruments, tape & compass',
  level: 'Levelling work',
  theo: 'Theodolite work',
  set: 'Setting out & modern instruments',
}
export const SV_GROUPS: SvGroup[] = ['tape', 'level', 'theo', 'set']
