// CE 104: House setting (foundation trench by the centre-line method): question bank, cards, Learn notes.
// Sheet numbers: column grids A–B 14′-10″, B–C 18′-10″; 1–2 13′-10″, 2–3 15′-10″; footing F1 5′-4″ square.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-house' as const
let qn = 0
let vn = 0

const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-house-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-house-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-house-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-house-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (16)
  mcq(1, `In the centre-line method of setting out a building, you first mark`, `the centre lines of the walls or columns, then mark the trench edges by offsetting half the trench width on each side`, [`the outer edge of the trench, then the centre line from it`, `the plinth level on every column, then the trench`, `the diagonal of the building, then the sides`], 0, `The trench is symmetric about the centre line, so every trench edge is the centre line moved out by half the width.`, `textbook`),
  mcq(3, `A square footing is 5′-4″ wide. A trench edge is set from the column centre at`, `2′-8″ on each side`, [`5′-4″ on each side`, `1′-4″ on each side`, `10′-8″ on each side`], 1, `Half of 5′-4″ = 64″/2 = 32″ = 2′-8″.`, `lecture sheet p36`),
  mcq(3, `Column grid spacings A–B = 14′-10″ and B–C = 18′-10″. The overall length from A to C is`, `33′-8″`, [`32′-8″`, `33′-0″`, `34′-8″`], 2, `14′-10″ + 18′-10″ = 178″ + 226″ = 404″ = 33′-8″.`, `lecture sheet p36`),
  mcq(3, `Column grid spacings 1–2 = 13′-10″ and 2–3 = 15′-10″. The overall length from line 1 to line 3 is`, `29′-8″`, [`28′-8″`, `30′-8″`, `29′-0″`], 1, `13′-10″ + 15′-10″ = 166″ + 190″ = 356″ = 29′-8″.`, `lecture sheet p36`),
  mcq(2, `How do you check that the corners of a laid-out rectangle are right angles?`, `The two diagonals must be equal`, [`The two longer sides must differ by the width`, `Each side must be an exact whole number of feet`, `The diagonals must be half the longer side`], 0, `A parallelogram with equal diagonals is a rectangle. You can also use a 3-4-5 triangle at each corner.`, `textbook`),
  mcq(2, `Which set of lengths set out a right angle with a tape?`, `9 ft, 12 ft and 15 ft`, [`9 ft, 12 ft and 14 ft`, `5 ft, 6 ft and 7 ft`, `8 ft, 8 ft and 8 ft`], 3, `3-4-5 scaled by 3: 9² + 12² = 81 + 144 = 225 = 15².`, `textbook`),
  mcq(3, `A room has a centre-line rectangle of 16 ft by 13 ft. Its diagonal should be about`, `20.6 ft (20′-7″)`, [`29.0 ft`, `18.4 ft`, `21.5 ft`], 0, `√(16² + 13²) = √425 = 20.62 ft = 20′-7½″.`, `18-batch report`),
  mcq(2, `Why are the four bamboo sticks placed outside the column?`, `Strings tied between them cross at the column centre and the sticks are not disturbed when the pit is dug`, [`So the pit is dug exactly under the sticks`, `So the strings can be seen from the road`, `To mark the plinth level at the outer edge`], 1, `Sticks inside the trench would be dug out. Outside, the strings stay, and a plumb bob from the crossing locates the centre again.`, `class notes (Quiz p20)`),
  mcq(1, `In the house-setting notes, PL stands for`, `plinth level`, [`plan level`, `plumb line`, `peg level`], 2, `Plinth level: the top of the plinth. The notes refer both PL and the benchmark to a 100 m datum.`, `class notes (Quiz p20)`),
  mcq(1, `Lime in the class house setting is used to`, `mark the trench outline (wall and footing) on the ground`, [`level the bottom of the trench`, `fix the benchmark`, `tie the rope to the stick`], 3, `Notes: "lime must be put in the trench (wall + footing)", marking the lines to be dug.`, `class notes (Quiz p20)`),
  mcq(2, `The stair has treads of 10 in and risers of 6 in. Four risers raise the level by`, `24 in = 2 ft`, [`40 in`, `10 in`, `4 ft`], 0, `4 × 6 in = 24 in = 2 ft.`, `class notes (Quiz p20)`),
  mcq(2, `A house plan is drawn at 1 cm = 1 ft. A 16 ft room is drawn`, `16 cm long`, [`1.6 cm long`, `160 cm long`, `4.9 cm long`], 1, `One centimetre stands for one foot, so 16 ft is 16 cm.`, `18-batch report`),
  mcq(2, `Levelling the centre line in house setting is done to`, `transfer the plinth level from the benchmark to the sticks, so the trench depths are measured from it`, [`find the bearing of the house`, `fix the corner angles`, `get the area of the plot`], 2, `The notes refer both BM and PL to the same datum, so levelling the sticks and the CL gives the depth to dig.`, `class notes (Quiz p20)`),
  mcq(2, `According to the 2026 field work details, for house setting`, `the plan with trench details is returned individually and the field layout is verified for the group`, [`only the field layout is checked, no plan is returned`, `both are individual submissions`, `both are group submissions`], 3, `Submission (a): plan returned (individual); (b): verification of layout in the field by the teacher (group).`, `field work details 2026`),
  mcq(3, `Column centres in the plan are 14′-10″ apart and each square footing is 5′-4″ wide. The clear gap between two adjacent footings is`, `9′-6″`, [`10′-2″`, `9′-0″`, `19′-2″`], 1, `Gap = spacing − footing width = 178″ − 64″ = 114″ = 9′-6″.`, `lecture sheet p36`),
  mcq(3, `The overall column rectangle is 33′-8″ by 29′-8″. Its diagonal is about`, `44.9 ft`, [`43.0 ft`, `63.3 ft`, `46.9 ft`], 0, `√(33.667² + 29.667²) = √2013.6 = 44.87 ft, to compare in the field when squaring the layout.`, `lecture sheet p36`),

  // ---- blank (6)
  blank(2, `14′-10″ is ___ inches.`, [`178`], `14 × 12 + 10 = 178 in.`, `lecture sheet p36`),
  blank(2, `A footing 5′-4″ wide is ___ inches wide.`, [`64`], `5 × 12 + 4 = 64 in.`, `lecture sheet p36`),
  blank(3, `The trench edge of a 5′-4″ footing is ___ inches from the column centre.`, [`32`], `64 in ÷ 2 = 32 in = 2′-8″.`, `lecture sheet p36`),
  blank(2, `A 6 ft by 8 ft right-angled corner has a diagonal of ___ ft.`, [`10`], `6² + 8² = 100.`, `textbook`),
  blank(1, `The stair in the notes has a tread of ___ inches.`, [`10`], `Tread 10″, rise 6″.`, `class notes (Quiz p20)`),
  blank(3, `At 1 cm = 1 ft, an overall length of 33′-8″ is drawn ___ cm long (one decimal).`, [`33.7`, `33.67`], `33′-8″ = 33.667 ft = 33.7 cm.`, `lecture sheet p36`),

  // ---- true / false (8)
  tf(1, `In the centre-line method the centre lines are set out first.`, true, `The trench edges are then offset from them.`, `textbook`),
  tf(2, `The trench is marked symmetrically on both sides of the centre line.`, true, `Each edge is half the trench width from the centre line.`, `textbook`),
  tf(2, `If the two diagonals of a laid-out rectangle are equal, its corners are right angles.`, true, `A parallelogram with equal diagonals is a rectangle.`, `textbook`),
  tf(2, `The four bamboo sticks should be fixed inside the area to be excavated.`, false, `They are placed outside the column, so excavation does not disturb them.`, `class notes (Quiz p20)`),
  tf(1, `The trench layout in the field is verified by the teacher as a group submission.`, true, `Submission (b) of the house-setting assignment.`, `field work details 2026`),
  tf(1, `The plan showing the trench details is returned individually.`, true, `Submission (a) of the house-setting assignment.`, `field work details 2026`),
  tf(1, `Lime is used to mark the trench outline on the ground.`, true, `It is put along the lines of wall and footing to be excavated.`, `class notes (Quiz p20)`),
  tf(2, `No levelling is needed in house setting: only horizontal distances are marked.`, false, `The assignment includes levelling the centre line, and the notes refer plinth level and BM to one datum.`, `field work details 2026`),
]

const cards: SvCard[] = [
  card(`What is the centre-line method?`, `I set out the centre lines of the walls and columns first from the plan. Then the trench edges are marked by offsetting half the trench width on each side of the centre line. It is easy to check and every dimension comes from the plan.`, `textbook`),
  card(`How did you square the corners?`, `By measuring the diagonals of the rectangle and checking they are equal, or with a 3-4-5 triangle, like 9, 12 and 15 ft, at the corner.`),
  card(`How did you check the layout?`, `I checked each side against the plan, the equal diagonals, and the crossing of the strings over each column centre with the plumb bob.`),
  card(`Why do you fix bamboo sticks outside the column?`, `Because the pit is dug at the column. Sticks outside, joined by strings, keep the centre. The crossing of the strings is the column centre and survives the excavation.`, `class notes (Quiz p20)`),
  card(`How do you decide the trench width?`, `From the footing size on the plan. For the 5′-4″ square footing the trench edge is half of that, 2′-8″, from the column centre on each side.`, `lecture sheet p36`),
  card(`Why do you level the centre line?`, `To bring the plinth level and the ground levels to one datum from the benchmark, so the depth of the trench is known at each column.`, `class notes (Quiz p20)`),
  card(`What are PL, EL and BM?`, `PL is the plinth level. EL is the existing ground level at the column. BM is the benchmark. The notes give both BM and PL a datum of 100 m.`, `class notes (Quiz p20)`),
  card(`How is lime used?`, `After the strings are tied I trace the trench outline of the wall and footing on the ground with lime. It tells the labour where to dig.`, `class notes (Quiz p20)`),
  card(`What is the stair detail in the notes?`, `Tread 10 inches and rise 6 inches. At the mid-point of the verandah, one and a half units left and right, the steps go down.`, `class notes (Quiz p20)`),
  card(`What do you show on the house plan?`, `Centre lines and trench lines with their legend, the column and footing sizes, the grid dimensions, a north line, the numerical and graphical scale, title, name, roll and group.`, `field work details 2026`),
  card(`What instruments and materials did you use?`, `Tape, bamboo sticks and rope, lime, plumb bob, and a level with a staff for the centre-line levels. No theodolite is needed.`, `field work details 2026`),
  card(`How do you set the first column?`, `From a reference corner or the supplied baseline I measure the first centre point, then set the others along grid lines by tape, with the diagonals as the check.`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `What the work is`,
      md: `- A **plan of a house** is supplied. You lay out the **foundation trench** in the field with **bamboo sticks, rope and lime**, and **level the centre line** (assignment 8).
- **Centre-line method:** set the centre lines (column grids) first, then offset **half the trench width** each way for the trench edges.
- Plan grids (lecture sheet): columns on lines **A, B, C** and **1, 2, 3**. Spacings: A–B **14′-10″**, B–C **18′-10″**, 1–2 **13′-10″**, 2–3 **15′-10″**. Footing **F1 = 5′-4″ square** (12 mm bars at 7″ c/c both ways). Read your own plan: the numbers can differ.
- The 2022 plan was simpler: a **16′ × 13′** room (centre lines) and a **5′ wide veranda**, steps with **10″ treads**.`,
    },
    {
      title: `Calculations to do before going out`,
      md: `Work in inches, then convert back.
| Item | Working | Result |
|---|---|---|
| Overall A–C | 14′-10″ + 18′-10″ = 178″ + 226″ | 404″ = **33′-8″** |
| Overall 1–3 | 13′-10″ + 15′-10″ = 166″ + 190″ | 356″ = **29′-8″** |
| Trench edge from column centre | 5′-4″ / 2 = 64″ / 2 | **32″ = 2′-8″** |
| Footing outer line to outer line | spacing − footing width | 14′-10″ − 5′-4″ = 9′-6″ |
| Diagonal of 16′ × 13′ | √(16² + 13²) | 20.62 ft |
| Diagonal of 33′-8″ × 29′-8″ | √(33.667² + 29.667²) | 44.87 ft |
Prepare the **plan of the excavated trench**: centre lines, trench lines, dimensions, legend, scale (the seniors used **1 cm = 1 ft**).`,
    },
    {
      title: `Method in the field (class notes, Quiz p20)`,
      md: `1. **Find the centre of each column** from the plan and fix it with a peg. **Level** it: plinth level and BM referred to the same datum (100 m in the notes).
2. Put **four bamboo sticks outside** each column, so the strings tied between them cross at the centre.
3. Tie the **string at the column's EL and PL** levels on the sticks.
4. Mark the **trench (wall + footing)** with **lime**.
5. **Square** the layout: equal diagonals, or the 3-4-5 triangle.
6. Stair (if on the plan): tread 10″, rise 6″.`,
    },
    {
      title: `What the examiner looks for`,
      md: `- Correct **centre-line spacing** and equal diagonals.
- **Trench width** equal to the plan on both sides of the centre line.
- Strings **crossing over the column centres** and sticks **outside** the trench.
- A neat **plan** with legend (centre line, trench line), scale, title block.
- That you can explain *why*: sticks outside, diagonals equal, levels from the BM.`,
    },
  ],
  steps: [
    `Study the plan: note column grid spacings, footing sizes, trench width and the stair. Convert everything to inches and calculate the overall rectangle and its diagonals.`,
    `Choose the reference corner and baseline in the ground. Fix the first column centre with a peg.`,
    `Set the other column centres along the grid lines by tape and mark each by a peg.`,
    `Square the layout: measure both diagonals of the big rectangle and equalise, or use a 3-4-5 triangle at each corner.`,
    `Level the plinth level and the centre line from the BM with the level and staff. Mark the datum on the sticks.`,
    `At every column fix four bamboo sticks outside the trench, and tie strings so they cross over the centre peg.`,
    `Mark the trench edges by offsetting half the width each side of the centre lines. Trace the outline with lime.`,
    `Tie the strings at the EL and PL levels on the sticks.`,
    `Check all dimensions and diagonals again, then call the teacher for the verification.`,
  ],
  submit: [
    `Individual: **the plan showing trench details** (returned to the teacher). It shows centre lines, trench lines, footings, dimensions in feet-inches.`,
    `Group: **verification of the layout in the field** by the teacher.`,
    `Sheet items: title and course no., name / roll / group, **date of performance**, legend (centre line and trench line), **N–S line**, **numerical and graphical scale**, **half-inch border**.`,
  ],
  traps: [
    `Mixing feet-inches with decimal feet when adding the grid spacings.`,
    `Offsetting the full trench width instead of half on each side of the centre line.`,
    `Fixing the sticks inside the trench, where they get dug out.`,
    `Not checking both diagonals, so the layout is a parallelogram.`,
    `Forgetting that the PL and the BM need the same datum before reading levels.`,
    `Using a different legend on the plan from the one on the ground (solid versus dashed lines).`,
    `Drawing the plan without scale and N-S line.`,
  ],
  carry: [
    `Tape (30 m), plumb bob, bamboo sticks, rope or string, wooden pegs and mallet`,
    `Lime or sand for marking, level and staff, ranging rods`,
    `The supplied plan, field book, calculator`,
  ],
}
