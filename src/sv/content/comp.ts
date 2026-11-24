import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-compass' as const
const ID = 'comp'
let n = 0
const nid = () => `q-${ID}-${++n}`

const mc = (q: string, right: string, wrong: [string, string, string], why: string, src: string, lvl: 1 | 2 | 3 = 1, inst?: boolean): SvQuestion => {
  const id = nid()
  const pos = n % 4
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id, topic: T, kind: 'mcq', q, opts, a: pos, why, src, lvl, ...(inst ? { inst } : {}) }
}
const tf = (q: string, a: boolean, why: string, src: string, lvl: 1 | 2 | 3 = 1, inst?: boolean): SvQuestion => ({ id: nid(), topic: T, kind: 'tf', q, a, why, src, lvl, ...(inst ? { inst } : {}) })
const bl = (q: string, a: string[], why: string, src: string, lvl: 1 | 2 | 3 = 1, inst?: boolean): SvQuestion => ({ id: nid(), topic: T, kind: 'blank', q, a, why, src, lvl, ...(inst ? { inst } : {}) })

const questions: SvQuestion[] = [
  mc(`The bearing of a line is:`, `The horizontal angle between a reference meridian and the line, measured clockwise`, [`The vertical angle of the line`, `The length of the line on a map`, `The angle between two stations at the instrument only`], `Bearings are horizontal angles measured clockwise from the meridian (north).`, `class notes (Theory p6), textbook`, 1),
  mc(`A whole circle bearing (WCB) lies between:`, `0° and 360°`, [`0° and 90°`, `0° and 180°`, `−90° and 90°`], `It is measured clockwise from north through the full circle.`, `textbook`, 1),
  mc(`The reduced bearing (quadrantal bearing) of a line is:`, `The acute angle from the nearest north or south direction, with the quadrant letters`, [`The angle from east`, `The WCB plus 180°`, `Any angle over 90°`], `It is between 0° and 90° with N/S first and E/W last, e.g. S 45° E.`, `textbook`, 1),
  mc(`The WCB 135° is the same as the reduced bearing:`, `S 45° E`, [`N 45° E`, `S 45° W`, `N 45° W`], `135° lies in the SE quadrant: 180° − 135° = 45°.`, `textbook (conversion)`, 2),
  mc(`The WCB 225°30′ is the same as:`, `S 45°30′ W`, [`N 45°30′ W`, `S 44°30′ W`, `S 45°30′ E`], `225°30′ lies in the SW quadrant: 225°30′ − 180° = 45°30′.`, `textbook (conversion)`, 2),
  mc(`The WCB 310° is the same as:`, `N 50° W`, [`N 50° E`, `S 50° W`, `N 40° W`], `310° is in the NW quadrant: 360° − 310° = 50°.`, `textbook (conversion)`, 2),
  mc(`N 30° E corresponds to a WCB of:`, `30°`, [`330°`, `150°`, `210°`], `NE quadrant: WCB equals the angle.`, `textbook (conversion)`, 1),
  mc(`S 20° W corresponds to a WCB of:`, `200°`, [`160°`, `340°`, `20°`], `SW quadrant: 180° + 20° = 200°.`, `textbook (conversion)`, 2),
  mc(`N 60° W corresponds to a WCB of:`, `300°`, [`240°`, `120°`, `330°`], `NW quadrant: 360° − 60° = 300°.`, `textbook (conversion)`, 2),
  mc(`S 70° E corresponds to a WCB of:`, `110°`, [`70°`, `250°`, `290°`], `SE quadrant: 180° − 70° = 110°.`, `textbook (conversion)`, 2),
  mc(`The back bearing of a line with fore bearing 65° is:`, `245°`, [`115°`, `295°`, `25°`], `BB = FB + 180° when the FB is under 180°: 65° + 180° = 245°.`, `textbook`, 2, true),
  mc(`The back bearing of a line with fore bearing 250° is:`, `70°`, [`430°`, `110°`, `160°`], `BB = FB − 180° when the FB is over 180°: 250° − 180° = 70°.`, `textbook`, 2, true),
  mc(`Bearings of the lines BA and BC from station B are 220° and 110°. The angle ABC is:`, `110°`, [`330°`, `70°`, `250°`], `The difference of the two bearings: 220° − 110° = 110° (the other way round, 250°).`, `textbook (calculation)`, 3),
  mc(`The magnetic declination is the angle between:`, `The true meridian and the magnetic meridian`, [`The magnetic meridian and the grid north`, `Horizontal and vertical`, `The line and the back bearing`], `It varies with place and time; the class defines it as the angle between true north and magnetic north.`, `class notes (Samiha p11)`, 1, true),
  mc(`The magnetic bearing of a line is 120°. The declination is 3° E. The true bearing is:`, `123°`, [`117°`, `120°`, `183°`], `With an east declination magnetic north lies east of true north: true = magnetic + 3°.`, `textbook (calculation)`, 3),
  mc(`The magnetic bearing of a line is 358° and the declination is 4° E. The true bearing is:`, `2°`, [`354°`, `362°`, `182°`], `358° + 4° = 362°, subtract 360° to get 2°.`, `textbook (calculation)`, 3),
  mc(`The FB and BB of a line are 75°30′ and 254°30′. This shows:`, `Local attraction at one or both stations, because they differ by 179° instead of 180°`, [`That the line is exactly 100 ft`, `That the compass is perfect`, `That the declination is 1°30′`], `With no local attraction the two bearings differ by exactly 180°.`, `textbook (calculation)`, 3, true),
  mc(`Local attraction is caused by:`, `Magnetic substances nearby, such as iron objects, steel tapes or power lines`, [`Earth's rotation`, `Sunlight on the compass`, `A tilted tripod only`], `They pull the needle away from the magnetic meridian. Keep the compass clear of steel and electrical lines.`, `textbook`, 1, true),
]

const more: SvQuestion[] = [
  bl(`The back bearing of a line with fore bearing 65° is ___ °.`, [`245`, `245°`], `BB = FB + 180° (FB < 180°).`, `textbook`, 2, true),
  bl(`The reduced bearing of a line with WCB 135° is S ___ ° E.`, [`45`, `45°`], `180° − 135° = 45°.`, `textbook`, 2),
  bl(`The magnetic declination is the angle between true north and ___ north.`, [`magnetic`], `The needle points to magnetic north.`, `class notes (Samiha p11)`, 1, true),
  bl(`N 60° W is a whole circle bearing of ___ °.`, [`300`, `300°`], `360° − 60° = 300°.`, `textbook`, 2),
  bl(`Back bearing = fore bearing ± ___ °.`, [`180`, `180°`], `Plus when FB < 180°, minus when FB > 180°.`, `textbook`, 1, true),
  bl(`In class, the theodolite bearing is read by setting north to ___ ° and turning clockwise.`, [`0`, `0°`, `zero`], `Set N = 0, then measure clockwise to the line.`, `class notes (Quiz p14)`, 1),

  tf(`The compass needle points along the magnetic meridian.`, true, `That is why a compass shows magnetic north, not true north.`, `class notes (Quiz p13)`, 1, true),
  tf(`If there is no local attraction, the fore and back bearings of a line differ by exactly 180°.`, true, `Parallel meridians at the two ends give equal-and-opposite directions.`, `textbook`, 2, true),
  tf(`Local attraction can be removed by moving the compass 1 m away from the station along the line.`, false, `It is the surroundings that cause it; it is detected from FB − BB and corrected by calculation.`, `textbook`, 2, true),
  tf(`The magnetic declination is the same at every place and every year.`, false, `It differs with place and changes slowly with time.`, `textbook`, 1),
  tf(`S 30° E lies in the second quadrant (WCB between 90° and 180°).`, true, `The south-east quadrant is the second quadrant; WCB = 180° − 30° = 150°.`, `textbook`, 2),
  tf(`A reduced bearing can be larger than 90°.`, false, `Reduced bearings are acute angles, 0° to 90°.`, `textbook`, 1),
]

const all = [...questions, ...more]

const cards = [
  [`What is a bearing?`, `The horizontal angle from the meridian, measured clockwise, to the line. WCB is 0 to 360°. The reduced bearing is acute with N/S and E/W letters.`, `class notes`],
  [`WCB or reduced bearing: how do you convert?`, `In the NE quadrant they are the same. In SE, WCB = 180° − RB; in SW, WCB = 180° + RB; in NW, WCB = 360° − RB.`, `textbook`],
  [`What are fore and back bearings?`, `Fore bearing is the bearing in the direction of progress. Back bearing is taken from the other end. They differ by 180°.`, `textbook`],
  [`How do you find the back bearing from the fore bearing?`, `Add 180° if the fore bearing is less than 180°, subtract 180° if it is greater.`, `textbook`],
  [`How do you get an included angle from two bearings?`, `Take the bearings of both lines from the station and subtract. At B, angle ABC is bearing of BA minus bearing of BC, and 360° is added if negative.`, `textbook`],
  [`What is magnetic declination?`, `The angle between true north and magnetic north. The needle shows magnetic north, so true bearing = magnetic bearing plus east declination or minus west.`, `class notes (Samiha p11)`],
  [`What is local attraction and how do you detect it?`, `The needle pulled by iron objects, steel or power lines near the station. If FB and BB do not differ by exactly 180°, it is present at one or both ends.`, `textbook`],
  [`How do you take a bearing with the prismatic compass?`, `Set it over the station, level it, sight the ranging rod through the slit and hair. When the needle rests I read the prism where the hair cuts the card.`, `field work details 2026`],
  [`Why do we measure the bearing of one side of the triangle?`, `To orient the plan, so that I can draw the N–S line on the sheet.`, `field work details 2026`],
  [`How do you read a bearing with the theodolite?`, `Set North = 0 on the horizontal circle with the tubular compass, lock it, then turn clockwise to the line and read the horizontal angle.`, `class notes (Quiz p14)`],
  [`Why does the compass show magnetic north and not true north?`, `The needle follows the earth's magnetic field. The true meridian runs to the geographic pole, so the two differ by the declination.`, `class notes (Samiha p11)`],
  [`How does the trough compass help on the plane table?`, `I lay it on the sheet; when the needle rests I draw the line along the trough. That N–S line orients the table.`, `class notes (Samiha p11)`],
]

export const content: SvTopicContent = {
  questions: all,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'Bearings and quadrants',
      md: `Bearing = horizontal angle from the meridian, clockwise.

| WCB | Quadrant | Reduced bearing |
|---|---|---|
| 0°–90° | NE | N θ E, θ = WCB |
| 90°–180° | SE | S θ E, θ = 180° − WCB |
| 180°–270° | SW | S θ W, θ = WCB − 180° |
| 270°–360° | NW | N θ W, θ = 360° − WCB |

Examples: 135° = S 45° E; 225°30′ = S 45°30′ W; 310° = N 50° W; S 20° W = 200°; S 70° E = 110°.`,
    },
    {
      title: 'Fore and back bearings, included angles',
      md: `- $BB = FB \\pm 180^\\circ$ ($+$ if $FB<180^\\circ$, $-$ if $FB>180^\\circ$).
- Included angle at B between BA and BC: $\\text{bearing of }BA-\\text{bearing of }BC$ (add 360° if negative; take the smaller one if you want the angle inside the figure).
- Example: BA = 220°, BC = 110° → angle ABC = 110°.
- Theodolite bearing in class: set $N=0$ on the horizontal circle, then turn clockwise.`,
    },
    {
      title: 'Declination and local attraction',
      md: `- **Declination** = angle between true north and magnetic north. East declination: $\\text{true}=\\text{magnetic}+\\delta$; west: $\\text{true}=\\text{magnetic}-\\delta$.
- Magnetic 358°, declination 4° E → 362° − 360° = **2°**.
- **Local attraction**: iron, steel or power lines near the compass disturb the needle. If $FB-BB\\neq180^\\circ$ there is local attraction at one or both ends.
- Compass and trough compass show **magnetic** north only.`,
    },
  ],
  steps: [
    `Centre the prismatic compass over the station peg on its stand (plumb bob) and level it.`,
    `Fix a ranging rod at the other end of the side whose bearing is wanted.`,
    `Adjust the prism until the graduations are sharp; sight the rod through the slit and the hair.`,
    `Let the needle come to rest; read the graduation seen against the hair in the prism. Book it as the fore bearing.`,
    `Repeat from the other end for the back bearing; the two must differ by 180°. If not, local attraction is suspected.`,
    `Convert to WCB and reduced bearing as needed; keep steel objects, keys and phones away from the compass.`,
    `In the theodolite work: set North = 0 on the horizontal circle with the tubular compass, lock it, then turn to each line and read.`,
    `Draw the N–S line on the sheet using the measured bearing.`,
  ],
  submit: [
    `The bearing of the side recorded in the field book (chain survey: bearing of one side of the triangle).`,
    `The N–S line on every plot, with the neat north sign.`,
    `For the traverse: bearings, reduced bearings and back bearings in the traverse table.`,
  ],
  traps: [
    `Adding 180° when the fore bearing is already over 180°.`,
    `Mixing up the quadrant letters when converting to reduced bearings.`,
    `Reading the wrong end of the needle, or reading with steel nearby.`,
    `Forgetting to apply the declination to get true north.`,
    `Taking an included angle as bearing 1 minus bearing 2 in the wrong order.`,
  ],
  carry: [
    `Prismatic compass with stand, trough compass`,
    `Ranging rods, plumb bob`,
    `Field book, pencil`,
    `Calculator`,
  ],
}
