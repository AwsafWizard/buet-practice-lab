// CE 104: Theodolite traverse (closed pentagon): question bank, viva cards and Learn notes.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-traverse' as const
let qn = 0
let vn = 0

/** 4-option MCQ: `pos` is where the right answer sits (0-3) among the three wrong ones */
const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-trav-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-trav-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-trav-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-trav-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (25)
  mcq(1, `What is the sum of the interior angles of a closed pentagon?`, `540°`, [`360°`, `720°`, `900°`], 1, `Sum = (n − 2) × 180° = 3 × 180° = 540° for n = 5.`, `class notes (Quiz p14)`),
  mcq(1, `The class notes allow the angle sum of the pentagon to deviate from 540° by at most`, `1°`, [`10″`, `10′`, `5°`], 0, `The notes write "(n − 2)·180° and maximum deviation 1°". Beyond that the angles are re-measured, not adjusted.`, `class notes (Quiz p14)`),
  mcq(2, `Observed interior angles of a pentagon add up to 540°01′00″. What correction goes to each angle?`, `−12″`, [`+12″`, `−1′`, `−6″`], 3, `Error = +1′ = +60″. Spread equally over 5 stations: 60″ ÷ 5 = 12″, subtracted because the sum is too large.`, `textbook`),
  mcq(2, `The angular misclosure of a pentagon is −1′15″ (sum is 540° short by 1′15″). The correction applied to every angle is`, `+15″`, [`−15″`, `+1′15″ to the last angle only`, `+25″`], 0, `75″ ÷ 5 = 15″, added because the sum is too small.`, `textbook`),
  mcq(2, `Why is the bearing of only ONE side of the traverse observed in the field?`, `The bearings of all other sides follow from that one and the corrected included angles`, [`The compass cannot be used at more than one station`, `Bearings of the other sides are not needed for latitudes and departures`, `Only one side is longer than 15 m`], 2, `Each next bearing = back bearing of the previous line ∓ included angle, so one starting bearing fixes the whole traverse.`, `field work details 2026`),
  mcq(3, `The whole-circle bearing of AB is 136°17′50″. Its reduced bearing is`, `S 43°42′10″ E`, [`S 43°42′10″ W`, `N 43°42′10″ E`, `S 46°17′50″ E`], 1, `136°17′50″ lies in the 2nd quadrant (90°–180°): reduced angle = 180° − 136°17′50″ = 43°42′10″, direction S…E.`, `18-batch report`),
  mcq(2, `A line has whole-circle bearing 215°30′. Its reduced bearing is`, `S 35°30′ W`, [`S 35°30′ E`, `N 35°30′ W`, `S 54°30′ W`], 2, `215°30′ is in the 3rd quadrant: angle = 215°30′ − 180° = 35°30′, S…W.`, `textbook`),
  mcq(3, `Traverse walked clockwise, WCB of AB = 40°, interior angle at B = 110°. The WCB of BC is`, `110°`, [`150°`, `330°`, `70°`], 2, `Back bearing of AB = 220°. Clockwise: forward = back − interior angle = 220° − 110° = 110°. (150° adds 110° to 40°; 330° is the anticlockwise answer.)`, `textbook`),
  mcq(3, `The latitude of a 20.000 m line with whole-circle bearing 60° is`, `+10.000 m`, [`+17.321 m`, `−10.000 m`, `+20.000 m`], 0, `Latitude = L cos θ = 20 cos 60° = 10.000 m (north, so positive). Departure would be 20 sin 60° = 17.321 m.`, `textbook`),
  mcq(3, `A 15.000 m line has reduced bearing S 30° E. Its departure is`, `+7.500 m`, [`−7.500 m`, `+12.990 m`, `−12.990 m`], 1, `Departure = L sin θ = 15 sin 30° = 7.500 m, east so positive. (Latitude = −15 cos 30° = −12.990 m, south.)`, `textbook`),
  mcq(2, `For a line with whole-circle bearing 200°, the signs of latitude and departure are`, `latitude −, departure −`, [`latitude +, departure +`, `latitude −, departure +`, `latitude +, departure −`], 2, `200° points south-west: south gives a negative latitude, west gives a negative departure.`, `textbook`),
  mcq(3, `For a pentagon, ΣLatitude = +0.12 m and ΣDeparture = −0.16 m. The linear closing error is`, `0.20 m`, [`0.04 m`, `0.28 m`, `0.14 m`], 3, `e = √(0.12² + 0.16²) = √0.04 = 0.20 m.`, `textbook`),
  mcq(3, `A traverse has perimeter 80 m and closing error 0.20 m. The relative precision is`, `1 in 400`, [`1 in 160`, `1 in 4000`, `1 in 0.0025`], 1, `Precision = perimeter ÷ closing error = 80 ÷ 0.20 = 400, written 1 in 400.`, `textbook`),
  mcq(2, `In Bowditch's (compass) rule the correction to the latitude of a side is`, `−ΣL × (length of the side ÷ perimeter)`, [`−ΣL × (latitude of the side ÷ Σ|latitudes|)`, `−ΣL ÷ 5 for every side`, `+ΣL × (length of the side ÷ perimeter)`], 0, `The total error is shared out in proportion to side length, with sign opposite to the error. The second option is the transit rule.`, `textbook`),
  mcq(3, `ΣLatitude = +0.12 m, perimeter = 80 m. By Bowditch the latitude correction for a 16 m side is`, `−0.024 m`, [`+0.024 m`, `−0.12 m`, `−0.0015 m`], 2, `Correction = −0.12 × 16 ÷ 80 = −0.024 m.`, `textbook`),
  mcq(2, `The transit rule distributes the closing error in proportion to`, `the latitude and departure of each side (their absolute values)`, [`the length of each side`, `the included angle at each station`, `the bearing of each side`], 3, `Transit rule: correction to a latitude = −ΣL × |lat| ÷ Σ|lat|, and likewise for departures. Bowditch uses side lengths.`, `textbook`),
  mcq(1, `One acre equals`, `4046.86 m²`, [`4840 m²`, `10 000 m²`, `43 560 m²`], 1, `1 acre = 4046.86 m² = 43 560 ft² = 100 decimals.`, `field work details 2026`),
  mcq(3, `A pentagon encloses 1000 m². In acres and decimals this is about`, `0.247 acre = 24.7 decimals`, [`2.47 acres = 247 decimals`, `0.247 acre = 2.47 decimals`, `0.405 acre = 40.5 decimals`], 2, `1000 ÷ 4046.86 = 0.2471 acre, and 1 acre = 100 decimals, so 24.71 decimals.`, `textbook`),
  mcq(3, `A plot of 21 780 ft² is`, `0.5 acre = 50 decimals`, [`5 acres = 500 decimals`, `0.5 acre = 5 decimals`, `2.178 acres = 217.8 decimals`], 3, `21 780 ÷ 43 560 = 0.5 acre = 50 decimals.`, `textbook`),
  mcq(2, `Clockwise traverse: the bearing of BA is 240° and the bearing of BC is 150°. The included angle ABC is`, `90°`, [`60°`, `390°`, `330°`], 0, `Included angle = back bearing − forward bearing = 240° − 150° = 90°.`, `textbook`),
  mcq(2, `In the graphical adjustment of the plotted traverse, the correction at each station is`, `parallel to the closing-error line and proportional to its distance along the traverse from the start`, [`perpendicular to the closing error and equal at every station`, `applied only at the last station`, `parallel to the first side and proportional to its angle`], 1, `Lines parallel to the closing error AA′ are drawn at each station; the ordinates of the error triangle grow linearly with distance from A.`, `class notes (Quiz p15)`),
  mcq(2, `At station B of the class traverse the theodolite is set so that the horizontal circle reads 0° on`, `the back station A (BA = 0), then the angle to C is read`, [`north`, `the ranging rod nearest to B`, `the last station E`], 2, `Class method: at A set north = 0; at B set BA = 0 and read ∠ABC; same at C, D, E.`, `class notes (Quiz p14)`),
  mcq(1, `What is the minimum length allowed for each side of the pentagon?`, `15 m`, [`5 m`, `30 m`, `100 ft`], 3, `The assignment says each side should be greater than 15 m.`, `field work details 2026`),
  mcq(2, `Besides the angles and sides, the 2026 traverse assignment asks you to measure`, `angles to at least 3 objects (ranging rods may represent them)`, [`the levels of all five stations`, `the declination at A`, `stadia intercepts on every side`], 1, `Assignment (d): angular measurements of at least 3 objects, so they can be plotted on the sheet.`, `field work details 2026`),
  mcq(3, `In the DMD method the double area of the traverse equals`, `Σ (DMD × latitude) of the adjusted lines`, [`Σ (DMD × departure)`, `Σ (latitude × departure)`, `perimeter × closing error`], 0, `Double area = Σ(DMD · latitude). The DMD of a line is the double meridian distance (twice the distance of the line's mid-point from the reference meridian).`, `textbook`),

  // ---- blank (9)
  blank(1, `The interior angles of a closed pentagon add up to ___ degrees.`, [`540`], `(5 − 2) × 180° = 540°.`, `class notes (Quiz p14)`),
  blank(1, `The sum of interior angles of a closed traverse of n sides is (n − 2) × ___ degrees.`, [`180`], `A polygon splits into (n − 2) triangles of 180° each.`, `class notes (Quiz p14)`),
  blank(2, `A six-sided closed traverse has an interior angle sum of ___ degrees.`, [`720`], `(6 − 2) × 180° = 720°.`, `textbook`),
  blank(2, `A line of whole-circle bearing 305° has the reduced bearing N ___ ° W.`, [`55`, `55°`], `305° is in the 4th quadrant: reduced angle = 360° − 305° = 55°, N…W.`, `textbook`),
  blank(2, `Bowditch's rule is also called the ___ rule.`, [`compass`], `Bowditch rule = compass rule: corrections proportional to the length of each side.`, `textbook`),
  blank(3, `A traverse of perimeter 120 m closes with an error of 0.15 m. Its precision is 1 in ___.`, [`800`], `120 ÷ 0.15 = 800.`, `textbook`),
  blank(1, `1 acre = ___ decimals.`, [`100`], `The decimal is one hundredth of an acre, about 40.47 m².`, `field work details 2026`),
  blank(3, `A traverse encloses 2500 m². In decimals (to the nearest whole number) that is ___.`, [`62`], `2500 ÷ 4046.86 = 0.6178 acre = 61.78 ≈ 62 decimals.`, `textbook`),
  blank(2, `The DMD of the first line of the traverse equals the ___ of that line.`, [`departure`, `adjusted departure`], `First DMD = departure of the first line; each next DMD = previous DMD + previous departure + this departure.`, `textbook`),

  // ---- true / false (11)
  tf(1, `The back bearing of a line differs from its fore bearing by 180°.`, true, `Fore bearing ± 180° = back bearing.`, `textbook`),
  tf(2, `With real field measurements, ΣLatitude and ΣDeparture of a closed traverse are not exactly zero before adjustment.`, true, `Measuring errors in angles and lengths stop the polygon closing exactly, so a closing error remains to be adjusted.`, `textbook`),
  tf(2, `Bowditch's rule gives larger corrections to longer sides.`, true, `Correction ∝ side length ÷ perimeter.`, `textbook`),
  tf(1, `Latitude is the projection of a line on the east–west axis.`, false, `Latitude is the projection on the north–south axis (L cos θ); departure is the east–west projection (L sin θ).`, `textbook`),
  tf(2, `Relative precision of a traverse is written as 1 in (perimeter ÷ closing error).`, true, `For example perimeter 80 m, error 0.20 m gives 1 in 400.`, `textbook`),
  tf(2, `The angular correction is applied to the included angles before the bearings of the sides are computed.`, true, `Carrying bearings with uncorrected angles would pile the angular error into the later bearings.`, `textbook`),
  tf(1, `With north set to 0° on the horizontal circle at A, the reading to AB is the whole-circle bearing of AB.`, true, `The circle then counts clockwise from north, so the reading is the WCB.`, `class notes (Quiz p14)`),
  tf(1, `The theodolite must be centred and levelled at every station of the traverse.`, true, `Centring over the peg and levelling are needed for correct horizontal angles at each station.`, `field work details 2026`),
  tf(2, `Converting a whole-circle bearing to a reduced bearing changes the direction of the line.`, false, `Both describe the same direction; the reduced bearing is just measured from N or S towards E or W, within 90°.`, `textbook`),
  tf(1, `1 acre is 4046.86 m².`, true, `Also 43 560 ft² or 100 decimals.`, `field work details 2026`),
  tf(3, `For the adjusted traverse the DMD of the last line is numerically equal to its departure but of opposite sign.`, true, `Because Σ departures = 0, DMD(last) = 2(dep₁ + … + dep₍ₙ₋₁₎) + depₙ = −depₙ. It is a quick arithmetic check on the DMD column.`, `textbook`),
]

const cards: SvCard[] = [
  card(`Why do we take the bearing of only one line in a theodolite traverse?`, `Because the theodolite gives the included angles. Starting from one observed bearing, each next bearing is the back bearing of the previous line minus (clockwise) or plus (anticlockwise) the included angle. One bearing fixes the orientation of the whole traverse.`, `field work details 2026`),
  card(`Why do you check that the angles add up to 540°?`, `A closed pentagon must have interior angles totalling (5 − 2) × 180°. The difference is the angular error. If it is within the tolerance I spread it equally over the five angles; if it is large I re-measure.`),
  card(`What is the closing error and how do you find it?`, `For a closed traverse the sum of latitudes and the sum of departures should each be zero. They are not, so the closing error is e = √(ΣL² + ΣD²), the gap between the start and where the traverse ends up.`),
  card(`What is relative precision?`, `Closing error divided by perimeter, written as 1 in (perimeter ÷ error). It tells how good the work is. A larger denominator means better work.`),
  card(`Why does Bowditch's rule distribute the error in proportion to side length?`, `Longer sides were probably measured with larger errors, so they take a bigger share. The correction to each latitude and departure is minus the total error times the side length over the perimeter.`),
  card(`What is the difference between Bowditch and the transit rule?`, `Bowditch shares the error by side length. The transit rule shares it by the latitude and departure of each side. Bowditch is the usual one when angles and lengths are measured with similar care, and it is the one we use.`),
  card(`Why must the sides be longer than 15 m?`, `A centring error of the instrument or ranging rod is a fixed small distance, so on a short side it turns into a large angular error. Longer sides keep the direction error small.`),
  card(`What is a reduced bearing?`, `The bearing measured from the nearest north or south direction towards east or west, never more than 90°. For example WCB 136°17′50″ becomes S 43°42′10″ E.`),
  card(`Define latitude and departure.`, `Latitude is the north–south component of a line, L cos θ, north positive. Departure is the east–west component, L sin θ, east positive. Both come from the length and the bearing.`),
  card(`How did you locate station A on the ground?`, `With respect to three permanent objects, such as a pole, a tree and a wall. I measured the three distances from A with the tape and recorded them in the field book so A can be found again.`, `field work details 2026`),
  card(`Why did you also measure angles to three objects?`, `The assignment asks for angular measurements of at least three objects, with ranging rods representing them. Their positions are plotted on the sheet from the angle and distance, so the sheet shows more than the pentagon alone.`, `field work details 2026`),
  card(`How do you convert the area to acres and decimals?`, `Divide the area in square metres by 4046.86 to get acres. Multiply the acres by 100 for decimals. If the area is in square feet, divide by 43 560 for acres.`),
  card(`Why does your plotted traverse not close, and what do you do about it?`, `Ignoring minutes and seconds, small angle and length errors and plotting error leave a gap AA′ between the start and the end. I draw the error triangle: lines parallel to AA′ at each station, proportional to the distance from A, and shift the points.`, `class notes (Quiz p15)`),
  card(`Why do you set north to 0° at station A?`, `So that the horizontal circle reads whole-circle bearings from north. The reading to AB is then the bearing of AB, which I need once to start the bearing calculation.`, `class notes (Quiz p14)`),
  card(`What is DMD and why do we use it?`, `Double meridian distance. It is the distance of the mid-point of a line from a reference meridian, doubled. The first DMD equals the first departure and each next one adds the previous and the present departures. Multiply by the latitude and sum to get the double area.`),
  card(`What if the angle sum is off by more than the allowed error?`, `I do not adjust it. I go back and re-measure the angles, because spreading a large error would hide a blunder such as a mis-read or wrong sighting.`),
  card(`How do you check your bearings once they are calculated?`, `Carry the bearing on round all five stations back to the first line. It must come out equal to the observed bearing of the first line. If it does not, an angle was added or subtracted wrongly.`),
  card(`How do you know which way to apply the interior angle, plus or minus?`, `For a clockwise traverse the next bearing is back bearing minus the interior angle. For an anticlockwise traverse it is back bearing plus the angle. A wrong choice gives the mirror image, so I check with the compass bearing of another side.`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `What the work is and the ideas behind it`,
      md: `- **Closed traverse** = a polygon of survey lines whose stations are the corners. Here: a **pentagon A B C D E**, every side **more than 15 m**.
- You measure **included (interior) angles** with the theodolite, **sides** with the tape, and the **bearing of one side** only. Everything else is calculated.
- **Angle sum check:** $(n-2)\\times180^\\circ = 540^\\circ$. The class notes allow at most $1^\\circ$ deviation; bigger means re-measure.
- A traverse never closes exactly: **latitudes** (N–S, $L\\cos\\theta$) and **departures** (E–W, $L\\sin\\theta$) do not sum to zero. The gap is the **closing error**.
- **Whole-circle bearing (WCB)**: 0–360° clockwise from north. **Reduced bearing**: angle from N or S towards E or W, at most 90°.
- **Back bearing** = fore bearing $\\pm180^\\circ$.
- **Precision** = 1 in (perimeter ÷ closing error).
- **Area units:** 1 acre = 4046.86 m² = 43 560 ft² = **100 decimals**.`,
    },
    {
      title: `The calculation, in the order of the sheet`,
      md: `1. **Angle check.** $\\Sigma\\text{angles}$ vs 540°. Error $=\\Sigma-540^\\circ$.
2. **Correct the angles.** Each angle gets $-\\text{error}/5$. Example: sum 540°01′00″, error +60″, correction −12″ each.
3. **Bearings.** Start from the observed WCB of AB. Next bearing:
   - clockwise walk: $\\text{WCB}_{next}=\\text{WCB}_{prev}+180^\\circ-\\angle$ (back bearing minus angle)
   - anticlockwise walk: back bearing **plus** angle
   - add or subtract 360° to keep 0–360°. Carrying round to line AB again must give the starting bearing back (check).
4. **Reduced bearings** from the WCB: 0–90 N…E, 90–180 S…E ($180-\\theta$), 180–270 S…W ($\\theta-180$), 270–360 N…W ($360-\\theta$).
5. **Latitude and departure** of every side: $L\\cos\\theta$, $L\\sin\\theta$. Signs: N and E +, S and W −.
6. **Sums and closing error:** $\\Sigma L,\\ \\Sigma D$; $e=\\sqrt{(\\Sigma L)^2+(\\Sigma D)^2}$; precision $=P/e$.
7. **Bowditch correction** (compass rule), sign opposite to the error:
   $$c_L=-\\Sigma L\\cdot\\frac{l}{P},\\qquad c_D=-\\Sigma D\\cdot\\frac{l}{P}$$
   (Transit rule instead: $c_L=-\\Sigma L\\,|lat|/\\Sigma|lat|$.) Corrected lat/dep must now sum to zero.
8. **Coordinates** of B, C, D, E: add corrected lat/dep to the previous station (A = 0, 0, or 100, 100 to keep them positive). E to A must return to A.
9. **Area:** coordinates (shoelace) or DMD: first DMD = first departure; next = previous DMD + previous dep + this dep; double area $=\\Sigma(\\text{DMD}\\times\\text{lat})$. Last DMD = its departure with opposite sign (check).
10. **Convert:** m² ÷ 4046.86 = acres; × 100 = decimals.`,
    },
    {
      title: `Numbers to remember (checked examples)`,
      md: `| Item | Value |
|---|---|
| Pentagon angle sum | 540° |
| WCB 136°17′50″ | S 43°42′10″ E |
| WCB 215°30′ | S 35°30′ W |
| WCB 305° | N 55° W |
| 20 m at 60° | lat +10.000, dep +17.321 |
| 15 m at S 30° E | lat −12.990, dep +7.500 |
| ΣL +0.12, ΣD −0.16 | e = 0.20 m |
| P = 80 m, e = 0.20 m | 1 in 400 |
| Bowditch, ΣL +0.12, side 16 m, P 80 m | c = −0.024 m |
| 1000 m² | 0.2471 acre = 24.71 decimals |
| 21 780 ft² | 0.5 acre = 50 decimals |`,
    },
    {
      title: `Plotting and the graphical closing error`,
      md: `- Plot the pentagon from the **uncorrected** angles and sides: the last point $A'$ falls short of or beyond $A$. $AA'$ is the **graphical closing error** (it also comes from ignoring minutes and seconds).
- **Adjust graphically:** draw the traverse as a straight base line with stations at their cumulative distances from A. At $A'$ erect the error $AA'$ (as an ordinate). Join to A to form the **error triangle**. The ordinate at each station is its correction. Shift each plotted station by that amount **parallel to $AA'$** (this is what lines "$AA'' \\parallel E'E \\parallel D'D …$" in the notes mean).
- Show both versions: **primed letters, dashed = before correction; unprimed, solid = after** (as in the senior sheets).
- Also plot the **objects** whose angles and distances you took, and mark station A's three ties.
- **Traverse chart + area calculation go on the same sheet** (assignment).`,
    },
  ],
  steps: [
    `Choose five stations A–E for a pentagon with every side over 15 m, on firm ground with clear sight between neighbours. Drive a wooden peg at each station and lay a string outline ABCDEA.`,
    `Fix station A with respect to **three permanent objects**: measure the three distances with the tape and sketch them in the field book.`,
    `Put ranging rods at **three or more objects** well away from the traverse to represent the objects whose angles you will take.`,
    `Set up the theodolite over A: centre it with the optical plummet, level it with the foot screws and plate level, then adjust the focus to remove parallax.`,
    `At A set **north = 0°** on the horizontal circle (trough or staff compass), then read the bearing of AB and of AE. Note the bearing of AB for the calculation.`,
    `Read the angles from A to each object rod. Record every reading in the field book at once, with the face and the time.`,
    `Move to B. Centre and level again, sight A and press 0 SET so **BA = 0°**. Turn clockwise to C and read the included angle ABC. Read the object angles from B too.`,
    `Repeat at C (back sight B), at D (back sight C) and at E (back sight D). At E also read the angle to A as the last included angle.`,
    `Measure the length of every side with the tape, more than once, and record them. Number all stations on the field sketch.`,
    `Add the five included angles on the spot. They must come to 540° within the class limit; if not, re-observe the doubtful angle before leaving the field.`,
    `Compute at home in the traverse chart: corrected angles, bearings, reduced bearings, lat/dep, closing error, Bowditch, coordinates, area in acres and decimals.`,
    `Plot to a chosen scale, show the closing error graphically and adjust it.`,
  ],
  submit: [
    `Individual, **following day**: one drawing sheet with the plotted pentagon, the objects and the closing error (graphical method).`,
    `The **traverse chart and the area calculation** are on the same sheet.`,
    `Field book pages with the angles, sides, three ties of A and the bearing of one side.`,
    `The sheet carries: title of the survey and course no. (CE 104), name / roll / group, **date of performance**, legend, **N–S line**, **numerical scale and graphical scale**, **half-inch border**.`,
    `Legend: station symbol, object symbol, solid = corrected, dashed = uncorrected (or as you define it).`,
    `Show the area as m², acres **and decimals**.`,
  ],
  traps: [
    `Using the wrong sign when carrying bearings (clockwise: minus the angle; anticlockwise: plus). It gives a mirror image and the traverse still closes.`,
    `Forgetting to correct the angles before computing bearings.`,
    `Rounding minutes and seconds away. It makes the graphical closing error bigger.`,
    `Wrong signs of lat/dep when the bearing is in the 3rd or 4th quadrant. Check with the sketch.`,
    `Mixing 4046.86 m² with 43 560 ft² or forgetting that 1 acre = 100 decimals.`,
    `Not setting north = 0 at A, or reading the angle the wrong way round (use clockwise readings only).`,
    `Writing the precision as error ÷ perimeter without the 1 in form.`,
    `Leaving the closing error plot and the traverse chart on different sheets.`,
  ],
  carry: [
    `Theodolite with tripod, plumb bob, ranging rods (at least 3 for objects), tape, wooden pegs, string, mallet`,
    `Trough or staff compass for north`,
    `Field book, pencil, calculator`,
    `Drawing sheet, set squares, scale, protractor, compass, half-inch border ruler`,
  ],
}
