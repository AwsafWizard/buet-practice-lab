// CE 104: Height & distance (inaccessible tower, aerial distance, space triangle): question bank, cards, Learn notes.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-height' as const
let qn = 0
let vn = 0

const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-ht-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-ht-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-ht-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-ht-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (17)
  mcq(1, `For the inaccessible tower, the two instrument stations A and B must be`, `in line with the foot of the tower (ranged)`, [`at the same height above the ground`, `on opposite sides of the tower`, `exactly 100 ft apart`], 0, `The derivation uses one vertical plane through the tower, so both stations are ranged in line with it ("ranging is needed as the instrument is set up on the same line").`, `lecture sheet p14`),
  mcq(1, `The angles θ₁ and θ₂ measured at the two stations for the tower are`, `vertical angles of elevation to the top`, [`horizontal angles to the foot`, `angles of depression to the foot`, `bearings of the tower`], 1, `Both are vertical angles measured at A and B; the distance a between the stations is horizontal.`, `lecture sheet p14`),
  mcq(2, `With the station heights h₁ (at A, far) and h₂ (at B, near), the distance x from B to the tower is`, `x = (h₂ − h₁ − a tan θ₁)/(tan θ₁ − tan θ₂)`, [`x = a tan θ₁/(tan θ₁ − tan θ₂)`, `x = (h₁ − h₂ + a tan θ₁)/(tan θ₁ + tan θ₂)`, `x = a/(tan θ₁ − tan θ₂)`], 2, `Equating H = h₁ + (a + x) tan θ₁ and H = h₂ + x tan θ₂ and solving for x.`, `lecture sheet p14`),
  mcq(2, `After finding x, the height of the tower is`, `H = h₂ + x tan θ₂`, [`H = x tan θ₁`, `H = h₁ + x tan θ₂`, `H = h₂ + a tan θ₂`], 1, `From the near station B: the top is x tan θ₂ above the line of sight, which is h₂ above the foot. The far station gives the same: H = h₁ + (a + x) tan θ₁.`, `lecture sheet p14`),
  mcq(3, `Tower data: h₁ = 1.43 m, h₂ = 1.435 m, a = 17.48 m, θ₁ = 10°9′50″, θ₂ = 12°8′. The distance x of the near station from the tower is about`, `87.6 m`, [`17.5 m`, `105.1 m`, `20.3 m`], 3, `x = (1.435 − 1.43 − 17.48 tan 10°9′50″)/(tan 10°9′50″ − tan 12°8′) = −3.1288/(0.17928 − 0.21499) = 87.6 m (105.1 m is the far station).`, `18-batch report`),
  mcq(3, `With the same data (x = 87.61 m, θ₂ = 12°8′, h₂ = 1.435 m) the tower height H is about`, `20.27 m`, [`18.8 m`, `22.1 m`, `105 m`], 0, `H = h₂ + x tan θ₂ = 1.435 + 87.61 × 0.2149 = 20.27 m.`, `18-batch report`),
  mcq(3, `Both stations at the same instrument height 1.5 m, a = 20 m, θ₁ (far) = 20°, θ₂ (near) = 30°. The tower height is about`, `21.2 m`, [`19.7 m`, `34.1 m`, `12.0 m`], 1, `x = a tan θ₁/(tan θ₂ − tan θ₁) = 20 × 0.3640/0.2134 = 34.1 m; H = 1.5 + 34.1 × tan 30° = 21.2 m.`, `textbook`),
  mcq(2, `A theodolite shows a vertical (zenith) reading of 77°45′ when pointed at the top of a pole. The angle of elevation is`, `12°15′`, [`77°45′`, `167°45′`, `102°15′`], 2, `Elevation = 90° − zenith reading = 90° − 77°45′ = 12°15′.`, `18-batch report`),
  mcq(2, `In the aerial-distance sheet, the angle ∠BAC at station A is obtained as`, `∠BAD + ∠CAD`, [`∠BAD − ∠CAD`, `180° − ∠CAD`, `∠ABC + ∠CBD`], 0, `The measured angles are ∠BAD and ∠CAD, which are adjacent, so they add: ∠BAC = ∠BAD + ∠CAD.`, `lecture sheet p17`),
  mcq(3, `In the horizontal triangle ABC, ∠ABC = 70° and ∠BAC = 60°. The angle ∠ACB is`, `50°`, [`130°`, `10°`, `60°`], 1, `Angles of a triangle add to 180°: 180 − 70 − 60 = 50°.`, `lecture sheet p17`),
  mcq(3, `AB = 30 ft, ∠ABC = 70°, ∠ACB = 50°. By the sine rule AC = AB sin ∠ABC / sin ∠ACB is`, `36.8 ft`, [`27.2 ft`, `30.0 ft`, `42.5 ft`], 2, `AC = 30 × 0.9397/0.7660 = 36.8 ft.`, `lecture sheet p17`),
  mcq(3, `AC = 50 ft is the horizontal distance to the foot C of tower CF, and the vertical angle ∠CAF = 20°. The height CF is`, `18.2 ft`, [`16.4 ft`, `47.0 ft`, `14.3 ft`], 3, `CF = AC tan ∠CAF = 50 × 0.3640 = 18.2 ft.`, `lecture sheet p17`),
  mcq(3, `AC = 40 ft, AD = 50 ft and ∠CAD = 60°. The ground distance CD (cosine rule) is`, `45.8 ft`, [`41.2 ft`, `20.0 ft`, `64.0 ft`], 0, `CD² = 40² + 50² − 2 × 40 × 50 × cos 60° = 1600 + 2500 − 2000 = 2100, so CD = 45.8 ft.`, `lecture sheet p17`),
  mcq(3, `The feet C and D of two towers are 40 ft apart, CF = 20 ft and DG = 10 ft. The aerial distance FG = √(CD² + (CF − DG)²) is`, `41.2 ft`, [`44.7 ft`, `50.0 ft`, `36.1 ft`], 2, `FG = √(40² + 10²) = √1700 = 41.2 ft.`, `lecture sheet p17`),
  mcq(3, `The three sides of a space triangle are 13 ft, 14 ft and 15 ft. By Heron's formula the area is`, `84 ft²`, [`91 ft²`, `42 ft²`, `105 ft²`], 1, `s = 21; area = √(21 × 8 × 7 × 6) = √7056 = 84 ft².`, `lecture sheet p21`),
  mcq(2, `In FG = √(CD² + (CF − DG)²), the term CD is`, `the horizontal distance between the feet of the two towers`, [`the baseline AB`, `the distance from A to F`, `the difference of the instrument heights`], 3, `Through G draw GE parallel to DC, so EG = CD; the right triangle FEG has the vertical side CF − DG.`, `lecture sheet p17`),
  mcq(2, `Why is CD calculated from both triangle ACD and triangle BCD on the sheet?`, `The two results must agree, which checks the angles and calculations`, [`Because A and B are at different heights`, `Because the cosine rule does not work with one triangle`, `To get two different values and average the heights`], 0, `The sheet says "or ΔBCD: … two ways, use as check".`, `lecture sheet p17`),

  // ---- blank (6)
  blank(1, `Heron's formula uses the semi-perimeter s = (a + b + c)/___.`, [`2`], `Area = √(s(s − a)(s − b)(s − c)) with s = (a + b + c)/2.`, `lecture sheet p21`),
  blank(3, `A space triangle has sides 13 ft, 14 ft and 15 ft. Its area is ___ square feet.`, [`84`], `s = 21, area = √(21·8·7·6) = 84.`, `textbook`),
  blank(2, `In triangle ABC the sine rule gives AC = AB sin ∠ABC / sin ∠___.`, [`ACB`, `C`], `AC is opposite the angle at B, and AB is opposite the angle at C: AB/sin∠ACB = AC/sin∠ABC.`, `lecture sheet p17`),
  blank(2, `The vertical (zenith) reading to a tower top is 84°. The angle of elevation is ___ degrees.`, [`6`], `90° − 84° = 6°.`, `18-batch report`),
  blank(1, `A space triangle FGH is formed by the tops of ___ poles.`, [`3`, `three`], `F, G and H are the tops of three poles whose feet are C, D and E.`, `lecture sheet p19`),
  blank(2, `∠ABC = 49° and ∠CBD = 38°. Then ∠ABD = ___ degrees.`, [`87`], `∠ABD = ∠ABC + ∠CBD = 87° (the sheet adds the adjacent angles at B).`, `lecture sheet p17`),

  // ---- true / false (7)
  tf(1, `For the inaccessible tower the two instrument stations are set up in line with the foot of the tower.`, true, `They must be ranged in one vertical plane with the tower.`, `lecture sheet p14`),
  tf(2, `Both angles θ₁ and θ₂ for the tower are horizontal angles.`, false, `They are vertical angles of elevation to the top of the tower.`, `lecture sheet p14`),
  tf(2, `The aerial distance FG between two tower tops is the same as the horizontal distance CD between their feet.`, false, `FG also depends on the difference in heights: FG = √(CD² + (CF − DG)²).`, `lecture sheet p17`),
  tf(2, `The ground distance CD can be found from triangle ACD or from triangle BCD.`, true, `Both use the cosine rule and give the same value, which is the check.`, `lecture sheet p17`),
  tf(2, `Heron's formula needs the three space distances FG, GH and FH to find the area of the space triangle.`, true, `a = FG, b = GH, c = FH; then s and the area.`, `lecture sheet p21`),
  tf(2, `If the angles are measured from the instrument axis, the instrument height is added to CF to get the full height of the pole.`, true, `CF = AC tan ∠CAF is the height above the line of sight; the 18-batch reports add the instrument height (e.g. 37.2 + 1.345 = 38.55 m).`, `18-batch report`),
  tf(1, `The distance between the two theodolite stations A and B is not needed for the aerial-distance problem.`, false, `AB is the baseline: it starts the sine-rule solutions of the horizontal triangles.`, `lecture sheet p17`),
]

const cards: SvCard[] = [
  card(`Why must the two stations be in line with the tower?`, `The derivation uses one vertical plane. If A, B and the foot F are in a line, the same horizontal distance x measured from B to the tower, plus a, applies for A. Otherwise you need horizontal angles too.`, `lecture sheet p14`),
  card(`Why are two angles and a baseline needed? Why not just H = d tan θ?`, `Because the foot of the tower is inaccessible, I cannot measure the distance to it. Two vertical angles from two stations a known distance apart give two equations, so x and H can both be found.`),
  card(`Give the formula for the height of the inaccessible tower.`, `H = h₁ + (a + x) tan θ₁ = h₂ + x tan θ₂. Eliminating H, x = (h₂ − h₁ − a tan θ₁)/(tan θ₁ − tan θ₂), and then H = h₂ + x tan θ₂.`, `lecture sheet p14`),
  card(`What is the aerial distance?`, `The straight-line distance in space between the tops of two towers F and G. It comes from the right triangle with the horizontal distance CD between the feet and the difference of heights: FG = √(CD² + (CF − DG)²).`, `lecture sheet p17`),
  card(`Why do you measure horizontal angles at both A and B?`, `With the baseline AB the horizontal angles at A and B fix each tower foot by triangles: the sine rule gives AC, BC and AD, BD. Then heights come from the vertical angles.`),
  card(`Why do you use the sine rule and the cosine rule?`, `Sine rule in triangles ABC and ABD, where I know a side and two angles. Cosine rule in ACD, where I know two sides and the included angle, to get the ground distance CD between the feet.`, `lecture sheet p17`),
  card(`How do you check CD?`, `I find it twice: from triangle ACD and from triangle BCD. The two values must agree.`, `lecture sheet p17`),
  card(`How do you get the height of a pole from the vertical angle?`, `In the vertical triangle ACF, CF = AC tan ∠CAF, where AC is the horizontal distance found by the sine rule. Add the instrument height if the angle was measured from the instrument axis.`),
  card(`What is a space triangle and how do you find its area?`, `The triangle formed by the tops of three poles F, G, H, which is not in a horizontal plane. I find the three space distances FG, GH, FH and apply Heron's formula, with s = (a + b + c)/2.`, `lecture sheet p21`),
  card(`What adjustments of the theodolite are needed before the angles?`, `Centre it over the station, level it with the foot screws, focus the eyepiece and remove parallax. I also check that the vertical circle reads 90° with the telescope horizontal.`, `field work details 2026`),
  card(`The vertical circle reads 77°45′. What is the elevation angle?`, `90° − 77°45′ = 12°15′. The vertical circle reads zenith distance, with 90° for a horizontal sight, so I subtract it from 90°.`, `18-batch report`),
  card(`What are the units of the area of the space triangle?`, `Square units of the lengths used, for example m² or ft². The sheet prints "feet" but the area is in square feet.`, `lecture sheet p21`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `Inaccessible tower (two stations in line)`,
      md: `Stations **A** (far) and **B** (near) in line with the foot **F**; $AB=a$ (taped); $BF=x$ unknown. Instrument heights $h_1$ at A, $h_2$ at B. Vertical angles $\\theta_1$ at A, $\\theta_2$ at B to the top E.
$$H=h_1+(a+x)\\tan\\theta_1\\qquad(1)$$
$$H=h_2+x\\tan\\theta_2\\qquad(2)$$
Equate: $$x=\\frac{h_2-h_1-a\\tan\\theta_1}{\\tan\\theta_1-\\tan\\theta_2}$$
then $H=h_2+x\\tan\\theta_2$ (check with (1)).
- Same instrument level ($h_1=h_2=h$): $x=\\dfrac{a\\tan\\theta_1}{\\tan\\theta_2-\\tan\\theta_1}$, $H=h+x\\tan\\theta_2$.
- Vertical reading V on the circle: elevation $=90^\\circ-V$.
- **Example (senior sheet):** $h_1=1.43$, $h_2=1.435$, $a=17.48$ m, $\\theta_1=10^\\circ9'50''$, $\\theta_2=12^\\circ8'$ gives $x=87.61$ m, $H=20.27$ m.
- **Example:** $h=1.5$, $a=20$, $\\theta_1=20^\\circ$, $\\theta_2=30^\\circ$ gives $x=34.11$ m, $H=21.20$ m.`,
    },
    {
      title: `Aerial distance FG (two poles, base AB)`,
      md: `Poles with feet C, D and tops F, G. Base AB measured. Measured: **horizontal** $\\angle CAD,\\ \\angle BAD$ at A; $\\angle ABC,\\ \\angle CBD$ at B; **vertical** $\\angle CAF,\\ \\angle DAG$ at A.
1. $\\angle BAC=\\angle BAD+\\angle CAD$; $\\angle ACB=180^\\circ-\\angle ABC-\\angle BAC$.
2. Sine rule in ABC: $AC=\\dfrac{AB}{\\sin\\angle ACB}\\sin\\angle ABC$, $BC=\\dfrac{AB}{\\sin\\angle ACB}\\sin\\angle BAC$.
3. Vertical triangle ACF: $CF=AC\\tan\\angle CAF$.
4. $\\angle ABD=\\angle ABC+\\angle CBD$; $\\angle ADB=180^\\circ-\\angle ABD-\\angle BAD$; $AD=\\dfrac{AB}{\\sin\\angle ADB}\\sin\\angle ABD$, $BD=\\dfrac{AB}{\\sin\\angle ADB}\\sin\\angle BAD$.
5. $DG=AD\\tan\\angle DAG$.
6. Cosine rule: $CD=\\sqrt{AC^2+AD^2-2\\,AC\\,AD\\cos\\angle CAD}$; **check** with $\\sqrt{BC^2+BD^2-2\\,BC\\,BD\\cos\\angle CBD}$.
7. $$FG=\\sqrt{CD^2+(CF-DG)^2}$$
(In the senior sheets, if the angles were measured from the instrument axis, add the instrument height to CF and DG to get pole heights. It cancels in $CF-DG$.)
**Senior example (m):** $AB=17.48$, $\\angle ACB=4^\\circ23'30''$ gives $AC=69.40$, $CF=13.09$, $DG=20.27$, $CD=35.06$, $FG=35.79$.`,
    },
    {
      title: `Space triangle FGH`,
      md: `Three poles with feet C, D, E and tops F, G, H. Horizontal angles at A: $\\angle CAD,\\ \\angle DAE,\\ \\angle BAE$; at B: $\\angle ABC,\\ \\angle CBD,\\ \\angle DBE$; vertical at A: $\\angle CAF,\\ \\angle DAG,\\ \\angle EAH$.
- Triangles ABC, ABD, ABE give AC, AD, AE (and BC, BD, BE) by the sine rule. Use $\\angle BAC=(\\angle BAE+\\angle DAE)+\\angle CAD$, $\\angle ABE=\\angle ABC+\\angle CBD+\\angle DBE$.
- Heights: $CF=AC\\tan\\angle CAF$, $DG=AD\\tan\\angle DAG$, $EH=AE\\tan\\angle EAH$.
- Ground distances by the cosine rule: $CD$ (from $\\angle CAD$), $DE$ (from $\\angle DAE$), $CE$ (from $\\angle CAE=\\angle CAD+\\angle DAE$).
- Space sides:
$$FG=\\sqrt{CD^2+(CF-DG)^2},\\quad GH=\\sqrt{DE^2+(DG-EH)^2},\\quad FH=\\sqrt{CE^2+(CF-EH)^2}$$
- **Heron:** $a=FG,\\ b=GH,\\ c=FH$; $s=\\dfrac{a+b+c}{2}$; $\\text{Area}=\\sqrt{s(s-a)(s-b)(s-c)}$ in square units.
- **Senior result:** $FG=35.79$, $GH=71.77$, $FH=42$ m; $s=74.78$; area $=536.36$ m².
- Quick check of Heron: sides 13, 14, 15 give 84.`,
    },
    {
      title: `Vertical angles and the instrument`,
      md: `- Digital theodolite display: **V** top line = vertical angle, **H** bottom line = horizontal angle. **0 SET** zeroes the horizontal angle (e.g. on the base line).
- Vertical circle reads 90° on a horizontal sight (zenith type). Elevation $=90^\\circ-V$; depression $=V-90^\\circ$. Note which one your instrument shows.
- Adjust first: centre (optical plummet), level (circular and plate level), focus. Check the vertical index.
- Stay with one set of units. The sheets use feet, the senior reports used metres.`,
    },
  ],
  steps: [
    `Select two or three tall objects (towers or poles) visible from two ground stations A and B. Mark C, D (and E) at their feet.`,
    `Adjust the theodolite at A: centre it, level it, focus and remove parallax. Measure the height of the instrument.`,
    `Tape AB carefully (the baseline) and note it. For the inaccessible tower, set A and B in line with the tower (range them) and tape a = AB.`,
    `At A with 0° on B (0 SET), read the horizontal angles to the feet C, D (E). Then read the vertical angles to the tops F, G (H) and the zenith readings.`,
    `Move to B (same adjustments, height of instrument). Sight A with 0°, read the horizontal angles to the same feet.`,
    `For the tower: read the vertical angle to the top at A (θ₁) and at B (θ₂) with the instrument heights h₁, h₂.`,
    `Write all readings into a table on the spot, converting zenith to elevation.`,
    `Calculate in the same session: sine rule, heights, cosine rule, check CD both ways, FG (and GH, FH) and Heron's area.`,
  ],
  submit: [
    `Individual, **same day**: detailed calculations on plain paper.`,
    `Show a neat figure (plan and elevation), the angle table, every formula and the result with units.`,
    `Show the CD check from both triangles, and the final FG or the area of FGH.`,
    `Name, roll, group and date at the top.`,
  ],
  traps: [
    `Using the zenith reading as the elevation angle (forgetting 90° − V).`,
    `Adding the horizontal angles in the wrong order (∠BAC = ∠BAD + ∠CAD, not the difference).`,
    `Using AB as the base in the tower problem. The tower uses a = AB with both stations in line.`,
    `Using the sine rule with the wrong opposite angle (AC goes with ∠ABC, BC with ∠BAC).`,
    `Mixing units between baseline and heights.`,
    `Mixing degrees and radians on the calculator.`,
    `Writing the area in feet instead of square feet.`,
    `Forgetting to check CD in the second triangle.`,
  ],
  carry: [
    `Theodolite and tripod, plumb bob, tape, ranging rods, pegs`,
    `Plain paper for calculations, field book, scientific calculator (set to degrees)`,
  ],
}
