import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-contour' as const
const ID = 'cont'
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
  mc(`A contour line is:`, `An imaginary line joining points of equal elevation`, [`A line joining points of equal slope`, `A line joining points at equal distance from the BM`, `The boundary of the plot`], `Every point on a contour has the same RL.`, `textbook`, 1),
  mc(`The contour interval is:`, `The constant vertical distance between consecutive contours`, [`The horizontal distance between contours`, `The length of the grid side`, `The height of the instrument`], `Contour interval is vertical; the horizontal equivalent depends on the slope.`, `textbook`, 1),
  mc(`Closely spaced contours indicate:`, `A steep slope`, [`A gentle slope`, `A flat plain`, `A uniform slope`], `The same vertical interval is covered in a shorter horizontal distance.`, `textbook`, 1),
  mc(`Equally spaced, straight parallel contours indicate:`, `A uniform slope`, [`A hill top`, `A ridge`, `A depression`], `Constant spacing means constant gradient.`, `textbook`, 1),
  mc(`Contours cross each other only:`, `In case of an overhanging cliff or a cave`, [`On a ridge`, `On a flat plain`, `At the BM`], `Normally one point has one elevation; a cliff overhang can show two.`, `textbook`, 2),
  mc(`Contours are drawn so that they cross the line of steepest slope:`, `At right angles`, [`Along it`, `At 45°`, `At random`], `A contour is level, so it is perpendicular to the direction of maximum slope.`, `textbook`, 2),
  mc(`Closed contours with increasing values towards the centre show:`, `A hill`, [`A depression`, `A valley`, `A saddle`], `Higher values inside a closed contour mean a hill; lower values inside mean a depression.`, `textbook`, 1),
  mc(`A valley line is shown by contours that are:`, `U or V shaped with the bend pointing towards higher ground`, [`U or V shaped with the bend pointing towards lower ground`, `Straight and parallel`, `Closed circles`], `Contours bend upstream across a valley; across a ridge they bend toward lower ground.`, `textbook`, 2),
  mc(`The grid method of contouring is classed as:`, `An indirect method: spot levels at grid points, then interpolation`, [`A direct method tracing each contour`, `A method using a plane table only`, `Photogrammetry`], `Levels are taken at grid points, and the contours are interpolated between them.`, `textbook`, 2),
  mc(`The class contour plot is:`, `A 50 m square with grid lines 5 m apart and two level stations`, [`A 30 m square with 10 m grid`, `A 100 m × 6 m strip`, `A 25 m square with 1 m grid`], `Elevations are taken with respect to a bench mark by rise and fall.`, `field work details 2026`, 1),
  mc(`How many grid points are there in a 50 m square with a 5 m grid?`, `121`, [`100`, `110`, `144`], `There are 10 intervals per side so 11 lines each way: 11 × 11 = 121.`, `field work details 2026 (calculation)`, 3),
  mc(`How many 5 m grid squares are in the 50 m square?`, `100`, [`121`, `50`, `25`], `10 × 10 squares.`, `field work details 2026 (calculation)`, 2),
  mc(`The 2026 sheet requires the contour interval to be chosen so that the plot has at least:`, `7 contour lines`, [`4 contour lines`, `2 contour lines`, `12 contour lines`], `The Field Work Details sheet says at least 7 contour lines (the old description says 4; use 7).`, `field work details 2026`, 1),
  mc(`The ground in the plot ranges from RL 98.35 to 101.20. Which contour interval gives at least 7 contour lines?`, `0.25 m`, [`0.5 m`, `1.0 m`, `2.0 m`], `0.25 m: 98.50 … 101.00 gives 11 lines; 0.5 m gives 6; 1.0 m gives 3.`, `field work details 2026 (calculation)`, 3),
  mc(`Where does the 100.40 m contour cut a grid line between points of RL 100.00 m and RL 101.00 m that are 5 m apart?`, `2.0 m from the 100.00 m point`, [`0.4 m from the 100.00 m point`, `2.5 m from the 100.00 m point`, `4.0 m from the 100.00 m point`], `By linear interpolation: 0.40/1.00 × 5 = 2.0 m.`, `textbook (calculation)`, 3),
  mc(`The contour interval is 1 m and contours lie 20 m apart horizontally. The gradient is:`, `1 in 20 (5%)`, [`1 in 10`, `1 in 5`, `1 in 2`], `Vertical/horizontal = 1/20 = 5%.`, `textbook (calculation)`, 3),
  mc(`A BM of RL 100.000 m is read as BS 1.500 m. A staff reading of 1.850 m at a grid point gives an RL of:`, `99.650 m`, [`100.350 m`, `101.350 m`, `98.150 m`], `HI = 101.500; RL = 101.500 − 1.850 = 99.650 m.`, `textbook (calculation)`, 3),
  mc(`Why are two level stations used in the class contour work?`, `The 50 m square cannot be read from one set-up; the second is linked by a change point or a common point`, [`The level only reads half the field`, `One station is for the BM, the other for rope`, `To avoid using the rise and fall method`], `The assignment asks for two level stations, joined by a change point.`, `field work details 2026`, 2),
]

const more: SvQuestion[] = [
  bl(`The vertical distance between consecutive contours is the contour ___.`, [`interval`], `It is kept constant on one map.`, `textbook`, 1),
  bl(`The class contour grid has a spacing of ___ m.`, [`5`, `five`], `Grid lines are 5 m apart in a 50 m square.`, `field work details 2026`, 1),
  bl(`The class contour plot has ___ grid points.`, [`121`], `11 × 11.`, `field work details 2026 (calculation)`, 3),
  bl(`The 2026 sheet asks for at least ___ contour lines in the plot.`, [`7`, `seven`], `From Field Work Details 5.`, `field work details 2026`, 1),
  bl(`Contours are plotted from the grid points by ___.`, [`interpolation`, `interpolating`], `Linear interpolation between neighbouring grid points.`, `textbook`, 1),
  bl(`Closely spaced contours indicate a ___ slope.`, [`steep`], `The slope is large because the horizontal distance is short.`, `textbook`, 1),

  tf(`Contours of different elevations never cross, except at an overhanging cliff or a cave.`, true, `One point cannot have two elevations.`, `textbook`, 2),
  tf(`A contour can end abruptly in the middle of the map.`, false, `A contour closes on itself, either in the map or outside it.`, `textbook`, 2),
  tf(`Widely spaced contours mean a steeper slope than closely spaced ones.`, false, `Wide spacing means gentle slope.`, `textbook`, 1),
  tf(`In the grid method, the elevations of the grid points are found with respect to a bench mark.`, true, `Rise and fall from the BM gives each grid RL.`, `field work details 2026`, 1),
  tf(`The readings must be entered simultaneously in the level book and on a graph paper.`, true, `Assignment (c): this lets you see an error while still in the field.`, `field work details 2026`, 1),
  tf(`The contour interval should be chosen without regard to the range of ground levels.`, false, `It must be chosen so the plot gets the required number of lines.`, `field work details 2026`, 2),
]

const all = [...questions, ...more]

const cards = [
  [`What is a contour?`, `An imaginary line joining points of equal elevation. The vertical gap between two consecutive contours is the contour interval.`, `textbook`],
  [`Why did you use the grid method?`, `The area is small and open. I read RLs at grid points every 5 m, then interpolate the contours between them.`, `field work details 2026`],
  [`How did you set the grid?`, `With rope and bamboo sticks: a 50 m square with 5 m spacing, so 11 × 11 = 121 points.`, `field work details 2026`],
  [`What did you do with two level stations?`, `I read as many points as I could from the first, took a fore sight on a change point, shifted the level and took a back sight on it. The RLs continue from there.`, `field work details 2026`],
  [`How did you choose the contour interval?`, `From the highest and lowest RL. The interval must give at least 7 contour lines in the plot; e.g. 0.25 m for a range of about 2.85 m.`, `field work details 2026`],
  [`How do you interpolate a contour?`, `Linearly between two grid points. The 100.40 contour between RL 100.00 and 101.00, 5 m apart, is at 0.4/1.0 × 5 = 2.0 m from the lower one.`, `textbook`],
  [`What do close and wide contour spacings show?`, `Close spacing means a steep slope, wide spacing a gentle slope, equal spacing a uniform slope.`, `textbook`],
  [`Can contours cross?`, `Only at an overhanging cliff or a cave. Otherwise one point would have two elevations. A contour also cannot end in the map.`, `textbook`],
  [`How do contours show a ridge and a valley?`, `Across a ridge they bend towards lower ground; across a valley they bend towards higher ground, like a V.`, `textbook`],
  [`What are contours used for?`, `Volume of earthwork, reservoir capacity, route selection and as a topographic map. Total station and GPS data can make them too.`, `class notes (Quiz p3)`],
  [`Why did you plot the readings on graph paper while observing?`, `So an error shows at once, like a reading that does not fit its neighbours, and I can re-read it before leaving.`, `field work details 2026`],
  [`How do you compute the RL at a grid point?`, `By rise and fall from the BM, or HI minus the reading. With HI = 101.500 and reading 1.850 the RL is 99.650.`, `field work details 2026`],
]

export const content: SvTopicContent = {
  questions: all,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'Contours and their properties',
      md: `- A contour joins points of equal RL; the **contour interval** is constant.
- Close spacing = steep, wide = gentle, equal = uniform slope.
- Contours never cross (except an overhanging cliff or cave) and cannot end in the map; they cut the steepest line at 90°.
- Closed with higher values inside = hill; lower inside = depression.
- Across a valley they bend to higher ground (V pointing up); across a ridge they bend to lower ground.
- Uses: earthwork volume, reservoirs, routes, topographic maps.`,
    },
    {
      title: 'Grid method and interpolation',
      md: `- 50 m square, grid spacing 5 m: $11\\times 11=121$ points, 100 squares.
- RLs by rise and fall (or HI) from the BM, two level stations joined by a change point.
- Interpolate linearly: distance from the lower point $=\\dfrac{\\text{contour RL}-\\text{lower RL}}{\\text{RL difference}}\\times \\text{grid spacing}$. Example: 100.40 between 100.00 and 101.00 over 5 m is 2.0 m.
- Gradient $=\\dfrac{\\text{interval}}{\\text{horizontal spacing}}$; 1 m over 20 m = 1 in 20 = 5%.`,
    },
    {
      title: 'Choosing the interval',
      md: `- The 2026 sheet requires **at least 7 contour lines** in the plot (the older description says 4).
- Find the lowest and highest RL, then pick the interval that gives 7 or more lines. Range 98.35–101.20: interval 0.25 m gives 11 lines (98.50 to 101.00), 0.5 m only 6, 1.0 m only 3.
- Label every fifth contour (index contour) and write the interval on the map.`,
    },
  ],
  steps: [
    `Select the 50 m square plot and mark the corners with pegs.`,
    `Set the grid with rope and bamboo sticks, 5 m apart in both directions; name the points by column letter and row number.`,
    `Fix the BM (assumed RL such as 100.000 m or given) and set up the level where it can see many grid points; centre the circular bubble and focus.`,
    `Take the back sight on the BM and book it in the level book.`,
    `Read the staff at each grid point within about 70 m of the level and enter the reading in the level book and, at the same time, at that point on the graph paper.`,
    `Take a fore sight on a firm change point, move the level to the second station, and take a back sight on the same point; read the remaining points.`,
    `Close with a fore sight, compute the RLs by rise and fall and apply the arithmetic check.`,
    `Choose the contour interval from the highest and lowest RL, interpolate and draw at least 7 contour lines.`,
  ],
  submit: [
    `The level book with necessary checks (individual, following day).`,
    `Contour map of the plot with at least 7 contour lines.`,
    `Title and course no., name, roll and group no., date, legend, N–S line, numerical and graphical scale and the half inch border.`,
    `The contour interval written on the map and the index contours labelled.`,
  ],
  traps: [
    `Choosing an interval that gives fewer than 7 contour lines.`,
    `Interpolating from the wrong end of the pair.`,
    `Forgetting that the BS and FS at the change point are on the same point.`,
    `Not entering the readings on the graph paper in the field.`,
    `Drawing contours that cross or end in the middle of the map.`,
    `Taking a grid spacing greater than 5 m.`,
  ],
  carry: [
    `Level with tripod and staff`,
    `Rope, bamboo sticks, pegs, tape`,
    `Level book, graph paper, pencils (colour for contours), eraser`,
    `Calculator and scale`,
  ],
}
