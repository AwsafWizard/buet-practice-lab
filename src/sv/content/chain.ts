import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-chain' as const
const ID = 'chain'
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
  mc(`In the class chain survey the three main lines AB, BC, CA form a triangle. The longest of them is called the:`, `Base line`, [`Check line`, `Tie line`, `Offset line`], `The longest main line is taken as the base line.`, `class notes (Quiz p9)`, 1),
  mc(`The angles of a well-conditioned triangle lie between:`, `30° and 120°`, [`10° and 170°`, `45° and 90°`, `60° and 150°`], `Between 30° and 120° an error in an angle has the least effect on the computed sides.`, `class notes (Quiz p11)`, 1),
  mc(`Which triangle is well-conditioned?`, `40°, 50°, 90°`, [`20°, 30°, 130°`, `15°, 15°, 150°`, `10°, 20°, 150°`], `Only the first has all three angles between 30° and 120°.`, `class notes (Quiz p10-11)`, 2),
  mc(`Why are well-conditioned triangles preferred?`, `The apex is sharp, plots as a single dot, and angular error has least effect on the sides`, [`They need fewer ranging rods`, `They have no check line`, `They always have the longest base line`], `Poorly shaped triangles let the plotted apex slide along the arcs and magnify error.`, `class notes (Quiz p11)`, 2),
  mc(`The purpose of a check line is to:`, `Check the accuracy of the survey: the length measured in the field must agree with its plotted length`, [`Locate the objects by offsets`, `Fix the north line`, `Join two main stations`], `A check line is measured in the field and then scaled off the plan; the two must agree.`, `class notes (Quiz p9)`, 1),
  mc(`A tie line:`, `Joins two fixed points on the main lines and locates details; it also acts as a check line`, [`Is a measure of the area`, `Is drawn only on the plan`, `Joins the station with the north`], `The tie line fixes the position of the offsets, shows the details and checks accuracy.`, `class notes (Quiz p10), (Samiha p8)`, 2),
  mc(`How many check lines should each triangle have at least?`, `One`, [`None`, `Three`, `Five`], `Class notes require at least one check line in every triangle.`, `class notes (Samiha p8)`, 1),
  mc(`On the class sheet a small SQUARE denotes:`, `A fixed (permanent) object`, [`A main station`, `An object (tree, building)`, `A sub-station`], `Triangle = main station, circle = object, square = fixed (permanent) object.`, `class notes (Quiz p9)`, 1),
  mc(`An offset is:`, `The shortest (perpendicular) distance from an object to the chain line`, [`The distance along the chain line`, `The length of the check line`, `The distance between two stations`], `Offsets are measured with a tape along the perpendicular, from the foot to the object.`, `class notes (Nafim p4)`, 1, true),
  mc(`The 3-4-5 method gives the foot of the perpendicular because:`, `A triangle with sides 3, 4, 5 units has a right angle between the sides 3 and 4`, [`The tape sags 3 mm in 4 m`, `Three ranging rods are set in line`, `The mirrors are 45° apart`], `Since 3² + 4² = 5², the angle opposite the side 5 is 90°.`, `class notes (Theory p2)`, 2, true),
  mc(`When must arrows be used with ranging rods on a main line?`, `When the line is 100 ft or longer`, [`Always for a line under 50 ft`, `Only for check lines`, `Only for the base line`], `A line longer than one chain needs ranging and an arrow per chain length.`, `class notes (Quiz p9, Samiha p4)`, 1, true),
  mc(`A chainage written 2+35 on an engineer's chain means:`, `235 ft`, [`23.5 ft`, `335 ft`, `2.35 ft`], `Hundreds + feet: 2 chains + 35 ft.`, `class notes (Quiz p12)`, 2, true),
  mc(`The field-book strip of the class starts:`, `With station A and 0+00 at the bottom, and goes upward`, [`With station A at the top`, `With the base line in the middle`, `With the north line`], `Entries run upward from A to B.`, `class notes (Quiz p12)`, 1, true),
  mc(`An engineer's chain found to be 0.06 ft too long is used in measuring. The measured distances are:`, `Too small`, [`Too large`, `Correct`, `Too large on slopes only`], `A longer chain covers more ground per chain length, so fewer chain lengths are counted.`, `textbook`, 2),
  mc(`A 30 m chain is found to be 30.06 m long. A line measured as 150.0 m is truly:`, `150.3 m`, [`149.7 m`, `150.06 m`, `150.0 m`], `True length = measured × (L′/L) = 150 × 30.06/30 = 150.3 m.`, `textbook`, 3),
  mc(`A 20 m chain is actually 19.96 m. A line measured as 200 m is truly:`, `199.6 m`, [`200.4 m`, `199.96 m`, `200 m`], `True = 200 × 19.96/20 = 199.6 m; the chain is short, so the true length is smaller.`, `textbook`, 3),
  mc(`A plot is measured as 5000 m² with a chain that is 0.1% too long (L′/L = 1.001). The true area is:`, `About 5010 m²`, [`About 5005 m²`, `About 4990 m²`, `About 5000 m²`], `Area scales with the square: 5000 × 1.001² ≈ 5010 m².`, `textbook`, 3),
  mc(`A line is chained along a slope: slope length 100 m with a height difference of 4 m. The horizontal length is about:`, `99.92 m`, [`100.08 m`, `96.00 m`, `99.20 m`], `√(100² − 4²) = 99.92 m; the correction is h²/2L = 0.08 m.`, `textbook`, 3),
  mc(`A scale of 1 in = 10 ft is expressed as a representative fraction:`, `1 : 120`, [`1 : 10`, `1 : 100`, `1 : 12`], `10 ft = 120 in, so 1 in on paper = 120 in on the ground.`, `textbook`, 2),
  mc(`On a plan drawn to 1 cm = 2 m, an offset of 6 cm represents:`, `12 m`, [`3 m`, `8 m`, `120 m`], `6 × 2 = 12 m; the scale is 1 : 200.`, `textbook`, 2),
  mc(`In a field triangle AB = 80 ft, BC = 80 ft, CA = 113 ft, the angle at B is about:`, `90°`, [`60°`, `45°`, `120°`], `80² + 80² = 12800 ≈ 113² = 12769, so B ≈ 90° and the triangle is about 45–45–90, well-conditioned.`, `18-batch report (Samiha p16), calculation`, 3),
  mc(`The graphical limit of accuracy on a plan is about 0.25 mm. At a scale of 1 : 500 this is:`, `0.125 m on the ground`, [`0.25 m`, `1.25 m`, `0.0125 m`], `0.25 mm × 500 = 125 mm.`, `textbook`, 3),
  mc(`The bearing of one side of the triangle is measured in the class job to:`, `Orient the plan: draw the N–S line`, [`Measure the area`, `Check the chain length`, `Locate the tie line`], `One bearing taken with the prismatic compass lets you draw the N–S line on the sheet.`, `field work details 2026`, 1),
  mc(`According to the class notes, odd-numbered points in the field-book sketch are:`, `Footings (feet of perpendiculars) and even-numbered ones are the objects`, [`Objects and even ones are footings`, `Stations and even ones are check lines`, `Arrows and even ones are pegs`], `Each offset is a pair: odd = foot on the line, even = object.`, `18-batch report (Samiha p16)`, 2),

  bl(`Chainage 1+20 on an engineer's chain is ___ ft.`, [`120`, `120 ft`], `One chain (100 ft) plus 20 ft.`, `class notes (Samiha p4)`, 2, true),
  bl(`The longest main line of the triangle is the ___ line.`, [`base`, `base line`], `The class notes define it so.`, `class notes (Quiz p9)`, 1),
  bl(`A well-conditioned triangle has all angles between 30° and ___ degrees.`, [`120`, `120°`], `Neither too small nor too large.`, `class notes (Quiz p11)`, 1),
  bl(`A line joining two fixed points on the main lines to locate details is called a ___ line.`, [`tie`], `It also acts as a check line.`, `class notes (Quiz p10)`, 1),
  bl(`A line measured only to prove the accuracy of the plotted survey is a ___ line.`, [`check`], `Its plotted length must agree with the field length.`, `class notes (Quiz p9)`, 1),
  bl(`The sheet must have a ___ inch border.`, [`half`, `1/2`, `0.5`], `Plus title, particulars, legend, N–S line and scales.`, `field work details 2026`, 1),
  bl(`A 30 m chain is really 30.06 m long. A distance measured as 100 m is truly ___ m.`, [`100.2`, `100.20`], `100 × 30.06/30 = 100.2 m.`, `textbook`, 3),
  bl(`The three ways to find the foot of the perpendicular are 3-4-5, swing and ___ square.`, [`optical`], `The optical square is the quickest.`, `class notes (Theory p2)`, 1, true),

  tf(`A main line longer than one chain needs ranging.`, true, `Ranging rods keep the chain straight between the end stations.`, `class notes (Theory p2)`, 1, true),
  tf(`Offsets are measured with the chain in the class job.`, false, `They are taken with a tape for accuracy.`, `class notes (Samiha p2)`, 1, true),
  tf(`A chain shorter than its standard length gives measured distances that are too large.`, true, `More chain lengths are counted, so the number is bigger than the true distance.`, `textbook`, 2),
  tf(`A station that cannot be pegged is fixed with respect to permanent objects.`, true, `The ties let the station be found again.`, `class notes (Theory p1)`, 1, true),
  tf(`In the field book, chainage 0+00 is written at the top of the strip.`, false, `It is at the bottom with A.`, `class notes (Quiz p12)`, 1, true),
  tf(`A tie line is drawn between two points on the main lines, so it can fix details that are far from the main lines.`, true, `The tie line carries the offsets of details too far from the main lines for short offsets.`, `class notes (Quiz p10)`, 2),
  tf(`In the 3-4-5 method the right angle is between the sides of 3 and 4 units.`, true, `Opposite the 5 unit side.`, `class notes (Theory p2)`, 1, true),
  tf(`Poor triangles with an angle under 30° magnify errors in the plotted apex.`, true, `The arcs cut at a shallow angle, so the plotted apex is not clearly located.`, `class notes (Quiz p11)`, 2),
]

const cards = [
  [`What is a chain survey and when is it used?`, `A survey in which only linear measurements are taken, a triangle of chained lines with offsets. It suits small, fairly flat areas with few details.`, `textbook`],
  [`How did you choose the stations?`, `On level ground, inter-visible, forming a well-conditioned triangle with all angles between 30° and 120°. One main line is longer than one chain.`, `class notes (Quiz p10)`],
  [`What is a well-conditioned triangle and why?`, `All angles between 30° and 120°. Then an angular error has the least effect on the lengths, and the apex plots as a sharp single point.`, `class notes (Quiz p11)`],
  [`Which is the base line?`, `The longest main line. The other lines are tied to it.`, `class notes (Quiz p9)`],
  [`What is a check line and what is a tie line?`, `A check line is measured in the field and compared with its plotted length to prove accuracy. A tie line joins two points on the main lines and fixes details; it also checks.`, `class notes (Quiz p9-10)`],
  [`How did you fix a station with respect to three permanent objects?`, `I measured the distances from the station to three permanent objects and sketched them in the field book, so the station can be found again.`, `field work details 2026`],
  [`How do you measure offsets?`, `Along the perpendicular from the object to the line. I find the foot with the optical square, 3-4-5 or the swing method, and measure with a tape.`, `class notes (Theory p2)`],
  [`What does 1+20 mean?`, `One chain plus 20 feet, that is 120 ft. The 1 is the number of arrows, the 20 the extra links.`, `class notes (Samiha p4)`],
  [`How is the field book written?`, `A strip with A at the bottom and 0+00, read upward. Offsets go to the left or right with their length beside them.`, `class notes (Quiz p12)`],
  [`Why did you have arrows and ranging rods?`, `The main line is longer than one chain. Rods keep it straight; the leader drops an arrow at each chain length and the follower counts them.`, `class notes (Samiha p4)`],
  [`What if the chain is not exactly the standard length?`, `A long chain reads too small, a short chain too large. True length = measured × L′/L, and for areas multiply by (L′/L) squared.`, `textbook`],
  [`How do you plot the survey?`, `Choose a scale to fill the sheet. Draw the base line and fix the third station by arcs from the measured sides. Then plot the offsets and check lines.`, `class notes`],
  [`What must the sheet show?`, `Title and course no., name, roll and group, date, legend, N–S line, numerical and graphical scale, and a half inch border.`, `field work details 2026`],
  [`Why draw the N–S line?`, `To orient the plan. I took the bearing of one side with the compass and set the north from it.`, `field work details 2026`],
  [`What is the graphical limit of accuracy?`, `About 0.25 mm on the plan. At scale 1 : 500 that is 0.125 m, so measure offsets no finer than that.`, `textbook`],
]

export const content: SvTopicContent = {
  questions,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'The framework and its lines',
      md: `- Choose 3 main stations A, B, C forming a **well-conditioned triangle** (all angles 30°–120°), on level ground, inter-visible. **At least one side > 1 chain.**
- Main lines AB, BC, CA; the longest is the **base line**.
- **Check line**: measured in the field, compared with the plotted length. At least one per triangle.
- **Tie line**: joins two points on the main lines to locate details; also acts as a check line.
- Symbols: triangle = main station, circle = object, square = fixed object.
- Odd numbers are the feet on the line, even numbers the objects.`,
    },
    {
      title: 'Offsets and the field book',
      md: `- Offset = shortest distance from an object to the chain line, measured with a **tape**. Foot found by **3-4-5**, **swing** or **optical square** with a plumb bob.
- Field book: A and chainage **0+00 at the bottom**, read upward. Chainage as hundreds + feet: $2+35=235$ ft.
- Objects on the right of the direction of chaining go to the right of the strip, left to left; the offset length is written beside the line.
- Three fixed objects tied to the first station are sketched below A.
- The line longer than a chain needs ranging rods and an arrow per chain length.`,
    },
    {
      title: 'Corrections',
      md: `| Case | Rule |
|---|---|
| Chain length $L'$ instead of $L$ | $\\text{true}=\\text{measured}\\times L'/L$ |
| Area | $\\text{true area}=\\text{measured}\\times (L'/L)^2$ |
| Slope length $s$, height $h$ | horizontal $=\\sqrt{s^2-h^2}$, correction $h^2/2s$ |

Examples: 30 m chain really 30.06 m, measured 150 m → 150.3 m. 20 m chain really 19.96 m, measured 200 m → 199.6 m. A chain that is too long reads too small.

Scale: 1 in = 10 ft is 1 : 120. 1 cm = 2 m is 1 : 200. Graphical limit 0.25 mm × scale denominator.`,
    },
    {
      title: 'Plotting the sheet',
      md: `1. Choose a scale that fills the sheet and gives a balanced drawing.
2. Draw the base line, then fix the third station by arcs from the other two measured sides.
3. Plot the three fixed-object ties for the station.
4. Plot the offsets from each chainage, check and tie lines.
5. Draw the N–S line from the measured bearing, the legend, numerical and graphical scale, the title block and the half inch border.`,
    },
  ],
  steps: [
    `Select three stations on level ground to make a well-conditioned triangle; at least one side must be more than one chain. Drive a wooden peg at each and lay out the outline with string.`,
    `Locate one station with respect to three permanent objects and measure the ties with a tape.`,
    `Draw a rough sketch of the plot in the field book.`,
    `Range the longer line with ranging rods; chain it with the arrows (one arrow per chain length, count the tallies and extra links).`,
    `Chain the other two sides.`,
    `Measure the bearing of one side with the prismatic compass.`,
    `Along each main line, find the foot of the perpendicular to each object (3-4-5, swing or optical square) and measure the offsets with the tape; book chainage and offset.`,
    `Add tie lines and at least one check line in each triangle; record their chainage and length.`,
    `Check in the field that closing lengths and check lines are reasonable before leaving.`,
    `Plot the sheet at the chosen scale the same night.`,
  ],
  submit: [
    `Plot of the area on a drawing sheet showing the station records (individual, following day).`,
    `Field book (a few pages).`,
    `Sheet items: title of survey and course no., name, roll and group no., date of performance, legend, N–S line, numerical and graphical scale, half inch border.`,
    `Show the tie lines and the check lines on the plot; write the check line field length against its plotted length.`,
  ],
  traps: [
    `All three sides shorter than a chain: at least one must be longer.`,
    `Triangle with an angle outside 30°–120°.`,
    `Using the chain to measure offsets.`,
    `Starting the field book at the top of the page.`,
    `Not putting a check line in every triangle.`,
    `Missing legend, N–S line, graphical scale or the half inch border.`,
    `Forgetting the three fixed objects for one station.`,
    `Confusing the leader's and the follower's arrows when counting chains.`,
  ],
  carry: [
    `Engineer's chain, arrows and ranging rods (from the store)`,
    `Tape, optical square, plumb bob, prismatic compass`,
    `Pegs, string, hammer`,
    `Field book, pencil, eraser`,
    `A2 drawing sheet, scale, set squares, calculator`,
  ],
}
