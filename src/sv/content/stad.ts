// CE 104: Stadia tacheometry: question bank, viva cards and Learn notes.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-stadia' as const
let qn = 0
let vn = 0

const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-stad-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-stad-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-stad-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-stad-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (19)
  mcq(1, `The stadia distance equation used in class is`, `D = K s + C`, [`D = K s − C`, `D = K / s + C`, `D = K s²`], 0, `D is the distance, s the staff intercept, K the multiplying constant and C the additive constant.`, `class notes (Quiz p19)`),
  mcq(1, `In D = K s + C, the quantity s is`, `the difference between the upper and lower stadia hair readings on the staff`, [`the vertical angle of the sight`, `the height of the instrument`, `the reading at the middle hair`], 2, `s = upper − lower, the part of the staff cut by the two stadia hairs.`, `class notes (Quiz p19)`),
  mcq(1, `In D = K s + C, K and C are called`, `the multiplying constant and the additive constant`, [`the collimation constants`, `the correction for curvature and refraction`, `the index error and the zero error`], 1, `K multiplies the intercept, C is added. Together they are the tacheometric constants.`, `textbook`),
  mcq(2, `The 18-batch reports found K and C of their theodolites as`, `K = 100, C = 0`, [`K = 50, C = 0.3`, `K = 100, C = 1.0`, `K = 10, C = 0`], 3, `Every group found D = 100 s: the distance in metres is 100 times the intercept in metres.`, `18-batch report`),
  mcq(3, `Two shots on level ground: D₁ = 10 m with s₁ = 0.10 m, and D₂ = 20 m with s₂ = 0.20 m. What are K and C?`, `K = 100, C = 0`, [`K = 100, C = 10`, `K = 50, C = 5`, `K = 200, C = −10`], 0, `K = (D₂ − D₁)/(s₂ − s₁) = 10/0.10 = 100; C = D₁ − K s₁ = 10 − 10 = 0.`, `18-batch report`),
  mcq(3, `Shots on level ground: D₁ = 10.3 m at s₁ = 0.10 m; D₂ = 30.3 m at s₂ = 0.30 m. Then`, `K = 100 and C = 0.3 m`, [`K = 100 and C = 0`, `K = 101 and C = 0.2 m`, `K = 150 and C = −4.7 m`], 1, `K = 20.0/0.20 = 100; C = 10.3 − 100 × 0.10 = 0.3 m.`, `textbook`),
  mcq(2, `With K = 100 and C = 0, the staff is read with upper hair 1.835 m and lower hair 1.435 m on a level sight. The distance is`, `40.0 m`, [`4.0 m`, `400 m`, `32.7 m`], 2, `s = 1.835 − 1.435 = 0.400 m; D = 100 × 0.400 = 40.0 m.`, `18-batch report`),
  mcq(2, `Upper hair 1.435 m, lower hair 1.335 m. The middle hair should read about`, `1.385 m`, [`1.435 m`, `1.335 m`, `0.100 m`], 3, `The middle hair lies halfway between the two stadia hairs: (1.435 + 1.335)/2 = 1.385 m. A big difference means a misreading.`, `textbook`),
  mcq(2, `An intercept of 23.5 cm is read with K = 100, C = 0. The distance is`, `23.5 m`, [`2.35 m`, `235 m`, `0.235 m`], 0, `s = 0.235 m, D = 100 × 0.235 = 23.5 m (as in the 18-batch tables).`, `18-batch report`),
  mcq(3, `Inclined sight, K = 100, C = 0, intercept s = 0.50 m, vertical angle 10°. The horizontal distance is`, `48.49 m`, [`50.00 m`, `49.24 m`, `47.55 m`], 1, `D = K s cos²θ = 50 × cos²10° = 50 × 0.9698 = 48.49 m.`, `textbook`),
  mcq(3, `Same sight (K = 100, C = 0, s = 0.50 m, θ = 10°). The vertical component V = ½ K s sin 2θ is`, `8.55 m`, [`8.68 m`, `17.10 m`, `4.27 m`], 2, `V = ½ × 100 × 0.5 × sin 20° = 25 × 0.3420 = 8.55 m.`, `textbook`),
  mcq(3, `Station RL 100.00 m, instrument height 1.45 m, V = +8.55 m, middle hair reading 2.00 m. The RL of the staff point is`, `108.00 m`, [`107.00 m`, `112.00 m`, `110.00 m`], 3, `RL = RL(stn) + HI + V − mid = 100.00 + 1.45 + 8.55 − 2.00 = 108.00 m.`, `textbook`),
  mcq(2, `Why must the staff be held vertical in stadia work?`, `The distance formulas assume a vertical staff; a tilted staff changes the intercept and spoils D`, [`So the staff does not touch the instrument`, `Because the horizontal circle only works with a vertical staff`, `So that the upper hair is always read first`], 1, `A leaning staff shows a wrong intercept. A tilted staff also reads larger in levelling.`, `class notes (Samiha p15)`),
  mcq(1, `In the stadia assignment the distances to the staff positions are found`, `from the stadia readings, with no direct linear measurement`, [`by chaining each ray twice`, `from the vertical angle only`, `with an optical square`], 0, `The maps are prepared with the tacheometer "without any direct linear measurement". The tape is used only for finding K and C.`, `field work details 2026`),
  mcq(1, `At least how many staff positions are required for the stadia plot?`, `25`, [`10`, `50`, `7`], 2, `Assignment: bearing and stadia readings at suitable staff positions, at least 25.`, `field work details 2026`),
  mcq(2, `How are the tacheometric constants determined in the field?`, `Two extra points are aligned on one line from the instrument, their distances taped, and the intercepts read`, [`By reading the staff at 100 m only`, `From the height of the instrument`, `By measuring the horizontal angle between two staff positions`], 0, `Notes: put two extra points on the same line, aligned, and calibrate first. Two distances with their intercepts give K and C by simultaneous equations.`, `class notes (Quiz p19)`),
  mcq(2, `On a stadia sheet drawn at 1 cm = 1 m, a point at D = 23.5 m is drawn at`, `23.5 cm from the station along its bearing`, [`2.35 cm from the station`, `0.235 cm from the station`, `47 cm from the station`], 3, `Plot length = D ÷ scale = 23.5 m ÷ 1 m per cm = 23.5 cm.`, `18-batch report`),
  mcq(2, `With K = 100 an error of 1 cm in the intercept causes an error in D of`, `1 m`, [`1 cm`, `10 cm`, `100 m`], 0, `ΔD = K Δs = 100 × 0.01 m = 1 m. That is why stadia is good only for short lines and rough work.`, `textbook`),
  mcq(2, `At each staff position the horizontal circle is used to read`, `the bearing of the ray from the station (north set to 0°)`, [`the stadia intercept`, `the height of the instrument`, `the angle of elevation`], 1, `Bearing from the circle + distance from the stadia hairs fix the point on the plan.`, `field work details 2026`),
]

questions.push(
  // ---- blank (7)
  blank(1, `In D = K s + C, the multiplying constant is the letter ___.`, [`K`], `K is the multiplying constant (100 for the class theodolites).`, `class notes (Quiz p19)`),
  blank(1, `With K = 100 and C = 0 an intercept of 0.185 m gives a distance of ___ m.`, [`18.5`], `D = 100 × 0.185 = 18.5 m.`, `18-batch report`),
  blank(1, `The theodolites of the 18-batch gave K = ___ (and C = 0).`, [`100`], `D = 100 s was found by every group.`, `18-batch report`),
  blank(3, `Shots on level ground: D = 12 m at s = 0.12 m and D = 24 m at s = 0.24 m. K = ___.`, [`100`], `K = (24 − 12)/(0.24 − 0.12) = 12/0.12 = 100, and C = 12 − 100 × 0.12 = 0.`, `textbook`),
  blank(1, `The stadia plot needs at least ___ staff positions.`, [`25`], `Field work details: at least 25 staff positions.`, `field work details 2026`),
  blank(1, `The staff intercept is s = upper hair reading − ___ hair reading.`, [`lower`, `lower hair`], `s is the upper minus the lower stadia reading.`, `class notes (Quiz p19)`),
  blank(2, `For an inclined sight the horizontal distance is D = K s ___² θ + C cos θ.`, [`cos`, `cosine`], `D = K s cos²θ + C cos θ.`, `textbook`),

  // ---- true / false (9)
  tf(1, `With K = 100 and C = 0, the distance is simply 100 times the intercept.`, true, `D = K s + C reduces to D = 100 s.`, `18-batch report`),
  tf(2, `The tacheometric constants K and C are found once for an instrument and then used for all readings.`, true, `They depend on the instrument's optics, not on the staff position.`, `textbook`),
  tf(1, `In the stadia survey the distance to each staff position is measured with the tape.`, false, `No direct linear measurement: distances come from the stadia intercept.`, `field work details 2026`),
  tf(2, `The same K and C must be used for every ray from the station.`, true, `K and C are constants of the telescope, so they hold for every ray.`, `textbook`),
  tf(1, `A tilted staff has no effect on the stadia intercept.`, false, `A leaning staff gives a wrong intercept and so a wrong distance.`, `class notes (Samiha p15)`),
  tf(2, `On a sloping sight the horizontal distance is still K s + C.`, false, `For a sloping sight, D = K s cos²θ + C cos θ; K s + C holds only for a level sight.`, `textbook`),
  tf(2, `The middle hair reading is about the mean of the upper and lower readings.`, true, `The three horizontal hairs are symmetric, so mid ≈ (upper + lower)/2; a gap flags a misreading.`, `textbook`),
  tf(3, `With K = 100, a 5 mm error in the intercept makes a 0.5 m error in the distance.`, true, `ΔD = K Δs = 100 × 0.005 = 0.5 m.`, `textbook`),
  tf(1, `The bearing of each staff position is read from the horizontal circle of the theodolite.`, true, `The plot then uses the bearing and the stadia distance.`, `field work details 2026`),
)

const cards: SvCard[] = [
  card(`What are the tacheometric constants and how did you find them?`, `K is the multiplying constant and C the additive constant in D = K s + C. I fixed two points on one line from the instrument, taped their distances, read the intercepts, and solved the two equations. We got K = 100, C = 0.`, `class notes (Quiz p19)`),
  card(`Why is C equal to zero for our theodolite?`, `The telescope is of the internal-focusing type, which behaves as an anallactic telescope, so the additive constant is practically zero. Our readings gave C = 0, so D = 100 s.`, `textbook`),
  card(`Why must the staff be vertical?`, `The distance formulas assume a vertical staff. If it leans the intercept is wrong and so is the distance, with a hundredfold effect since K = 100. I use the staff bubble or have the holder wave it slowly.`),
  card(`Why do you read three hairs?`, `Upper and lower give the intercept s. The middle hair gives a check, because it must be about the average of the other two, and it gives the staff reading for the level of the point.`),
  card(`How do you get the distance without a tape?`, `From the stadia intercept: D = K s + C. For a horizontal sight and K = 100, C = 0 I multiply the intercept by 100.`),
  card(`How did you plot the staff positions?`, `From the station I draw rays at the observed bearings with the protractor, mark D to the chosen scale along each ray, and number the points. North and a numerical and graphical scale are on the sheet.`),
  card(`What is the formula when the sight is inclined?`, `D = K s cos²θ + C cos θ for the horizontal distance and V = ½ K s sin 2θ + C sin θ for the vertical component. With C = 0 they simplify.`),
  card(`How do you find the RL of a staff point?`, `RL of the station plus the height of the instrument plus V, minus the middle hair reading. For a level sight V is zero, so it is RL(stn) + HI − mid.`),
  card(`How accurate is stadia?`, `Not very. With K = 100 an error of 1 cm in the intercept gives 1 m in distance, so it is used on short lines and for details, not for control. We kept our distances short.`),
  card(`Why do we survey a curved path by stadia?`, `Because a curved boundary needs many points, and stadia gives each point from one set-up quickly, with no chaining and no offsets.`, `field work details 2026`),
  card(`What does the diaphragm of the telescope show?`, `A horizontal and a vertical cross hair, with two shorter stadia hairs above and below the horizontal hair, at equal distances. The distance between their staff readings is the intercept.`),
  card(`How do you read the staff correctly?`, `Focus the eyepiece until the hairs are sharp, then focus the image to remove parallax. Read upper, middle and lower hairs. The telescopic staff is divided in 5 mm; I read to half of a division by estimation.`),
  card(`Why do you set north to 0° at the station?`, `So the circle reads bearings of the rays directly. All 25 bearings are then measured from one common direction and plot on one fan.`),
  card(`What is the advantage of tacheometry over chaining?`, `Speed. It gives distance and, with the vertical angle, the height difference from one set-up, even across rough or inaccessible ground, without chaining.`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `The idea of stadia tacheometry`,
      md: `- The theodolite telescope has **two extra short horizontal hairs** (upper and lower stadia hairs). On a vertical staff they cut an **intercept** $s=\\text{upper}-\\text{lower}$.
- Distance is proportional to the intercept: $$D=Ks+C$$ $D$ distance, $K$ multiplying constant, $C$ additive constant. Class result for our instruments: **K = 100, C = 0**, so $D=100\\,s$.
- **No tape for the ground points**: horizontal distance from the stadia hairs, direction from the horizontal circle (north = 0).
- With a vertical angle $\\theta$ (sloping sight, vertical staff):
  $$D=Ks\\cos^2\\theta+C\\cos\\theta,\\qquad V=\\tfrac12Ks\\sin2\\theta+C\\sin\\theta$$
  $$\\text{RL point}=\\text{RL stn}+\\text{HI}+V-\\text{mid reading}$$
- **Accuracy:** $\\Delta D=K\\,\\Delta s$, so 1 cm error in $s$ gives 1 m in $D$. Keep the staff vertical and the lines short.`,
    },
    {
      title: `Finding K and C (calibration)`,
      md: `1. On level ground set the theodolite at O and fix **two staff points on the same line** (aligned) at known taped distances, e.g. 10 m and 20 m.
2. Read upper and lower hairs at each: $s_1$, $s_2$.
3. Write two equations and solve:
$$D_1=Ks_1+C,\\quad D_2=Ks_2+C$$
$$K=\\frac{D_2-D_1}{s_2-s_1},\\qquad C=D_1-Ks_1$$
**Example (18-batch report):** $10=K(0.10)+C$, $20=K(0.20)+C$ gives $K=100$, $C=0$.
**Another check:** $D_1=10.3$ at $s_1=0.10$, $D_2=30.3$ at $s_2=0.30$ gives $K=100$, $C=0.3$ m.
If you take more than two shots, use a least-squares fit or the average.`,
    },
    {
      title: `Table of readings and reductions`,
      md: `Columns on the sheet: **point no. | bearing (angle with north) | upper | lower | s = upper − lower | D = Ks + C**.
- Convert readings to metres first (cm ÷ 100). Example row: upper 143 cm, lower 101 cm gives $s=0.42$ m, $D=42$ m.
- Check each row: the middle hair is about $(\\text{upper}+\\text{lower})/2$.
- Remember the first 5 may be permanent objects (marked with * in the senior tables).
- Plot at a scale that fits the sheet (the seniors used 1 cm = 1 m or 1 cm = 2 m): length on paper $=D/\\text{scale}$.
- **Details to show on the sheet:** the theodolite station symbol, numbered staff points, the bearing of the first ray, north arrow and the scales.`,
    },
  ],
  steps: [
    `Select a small area, preferably a **curved path**, and one station O from where all the points can be seen.`,
    `Set up the theodolite over O: centre with the plumb bob or optical plummet, level it, and focus the hairs and the image to remove parallax.`,
    `Calibrate first. Fix two points on one line from O at known taped distances (for example 10 m and 20 m), hold the staff vertically on each and read upper and lower hairs.`,
    `Compute K and C by simultaneous equations on the spot. If C comes out nearly zero, use $D=Ks$.`,
    `Set north = 0° on the horizontal circle (compass), and lock it.`,
    `Hold the staff vertically at the first staff position on the path. Read the horizontal circle (bearing), then the upper, middle and lower hairs. Record all in the field book.`,
    `Repeat for at least **25 staff positions**, spaced along the curved path. Mark them with numbers and note which are permanent objects.`,
    `Do not tape any ground distance for the points. The tape is only for calibration.`,
    `At home work out the intercept and the distance for every point and plot them from O with the protractor, to scale.`,
  ],
  submit: [
    `Individual, following day: a **detailed calculation of the tacheometric constants and the horizontal distances** (the table of all 25 or more points).`,
    `The **plot of the area on a drawing sheet**.`,
    `Every sheet shows: title and course no., name / roll / group, **date of performance**, legend, **N–S line**, **numerical and graphical scale**, **half-inch border**.`,
    `Legend: theodolite station (triangle) and staff positions (dots; mark permanent objects differently).`,
  ],
  traps: [
    `Mixing units: cm readings with metre distances. Convert before multiplying.`,
    `Reading the lower hair as the upper (negative intercept). Always take upper − lower.`,
    `Holding the staff tilted: the 100× multiplier magnifies every error.`,
    `Skipping the calibration and quoting K = 100 without showing the two-equation working.`,
    `Taping the distances to ground points. It defeats the purpose and loses marks.`,
    `Plotting at a scale so small that the 25 points crowd together, or so large the plot leaves the sheet.`,
    `Forgetting the bearing reference (north = 0) or plotting with the wrong sense of rotation.`,
  ],
  carry: [
    `Theodolite and tripod, plumb bob, telescopic staff, tape, ranging rods, pegs`,
    `Field book, pencil, calculator, compass for north`,
    `Drawing sheet, protractor, scale, set squares`,
  ],
}
