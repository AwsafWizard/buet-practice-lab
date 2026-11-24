// CE 104: Route project (150 m road, 3 × 50 m, two 3.5 m lanes, ROW 10 m): question bank, cards, Learn notes.
import type { SvCard, SvLearn, SvQuestion, SvTopicContent } from '../types'

const TOPIC = 'sv-route' as const
let qn = 0
let vn = 0

const mcq = (lvl: 1 | 2 | 3, q: string, right: string, wrong: [string, string, string], pos: 0 | 1 | 2 | 3, why: string, src: string): SvQuestion => {
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id: `q-route-${++qn}`, topic: TOPIC, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (lvl: 1 | 2 | 3, q: string, a: boolean, why: string, src: string): SvQuestion => ({ id: `q-route-${++qn}`, topic: TOPIC, kind: 'tf', q, a, why, src, lvl })
const blank = (lvl: 1 | 2 | 3, q: string, a: string[], why: string, src: string): SvQuestion => ({ id: `q-route-${++qn}`, topic: TOPIC, kind: 'blank', q, a, why, src, lvl })
const card = (front: string, back: string, src?: string): SvCard => ({ id: `v-route-${++vn}`, topic: TOPIC, front, back, src })

const questions: SvQuestion[] = [
  // ---- MCQ (19)
  mcq(1, `The 2026 route project is a portion of a highway alignment of total length 150 m made of`, `three segments of 50 m each`, [`two segments of 75 m each`, `segments of 60 m, 40 m and 50 m`, `five segments of 30 m each`], 0, `The assignment says 150 m having three segments of (50 m + 50 m + 50 m).`, `field work details 2026`),
  mcq(1, `The roadway has two lanes of 3.5 m. The carriageway width is`, `7 m`, [`3.5 m`, `10 m`, `14 m`], 1, `2 × 3.5 m = 7 m.`, `field work details 2026`),
  mcq(2, `The right of way (ROW) is 10 m wide. Measured from the centre line, each side is`, `5 m`, [`10 m`, `3.5 m`, `1.5 m`], 2, `10 m ÷ 2 = 5 m either side of the centre line.`, `field work details 2026`),
  mcq(3, `ROW 10 m and carriageway 7 m. The width of the strip left between the pavement edge and the ROW boundary on each side is`, `1.5 m`, [`3.0 m`, `5.0 m`, `3.5 m`], 3, `(10 − 7)/2 = 1.5 m each side.`, `field work details 2026`),
  mcq(3, `The map's horizontal scale is 1:500. A 50 m segment is drawn`, `10 cm long`, [`1 cm long`, `5 cm long`, `50 cm long`], 0, `50 m = 5000 cm; 5000 ÷ 500 = 10 cm.`, `lecture sheet p1`),
  mcq(3, `At 1:500 the whole 150 m alignment is drawn`, `30 cm long`, [`15 cm long`, `3 cm long`, `75 cm long`], 1, `15 000 cm ÷ 500 = 30 cm.`, `lecture sheet p1`),
  mcq(3, `The vertical scale of the profile is 1:100. A difference of level of 0.25 m is drawn`, `0.25 cm`, [`2.5 cm`, `0.025 cm`, `25 cm`], 2, `0.25 m = 25 cm on the ground; at 1:100 that is 25 ÷ 100 = 0.25 cm = 2.5 mm.`, `lecture sheet p1`),
  mcq(2, `With a horizontal scale 1:500 and a vertical scale 1:100 the vertical exaggeration of the profile is`, `5 times`, [`1/5`, `100 times`, `500 times`], 3, `Exaggeration = vertical scale ÷ horizontal scale = (1/100)/(1/500) = 5.`, `lecture sheet p1`),
  mcq(3, `At 1:500 the 10 m ROW is drawn`, `2 cm wide`, [`20 cm wide`, `0.2 cm wide`, `5 cm wide`], 0, `1000 cm ÷ 500 = 2 cm.`, `lecture sheet p1`),
  mcq(2, `The benchmark is outside the site. The usual way to get its RL to the site is`, `fly levelling from the BM to a temporary BM on the site, closing back on the BM to check`, [`measuring its height with a tape`, `a stadia reading from the site`, `copying the RL from the drawing`], 1, `A series of back sights and fore sights through change points carries the level to the site; coming back to the BM shows the closing error.`, `class notes (Theory p11)`),
  mcq(2, `Which available instrument is the proper choice for the vertical control and the longitudinal levels?`, `Dumpy or auto level with staff`, [`Prismatic compass`, `Optical square`, `Chain with arrows`], 2, `A level with a staff gives differences of level directly and precisely. The compass is only for rough bearings.`, `field work details 2026`),
  mcq(2, `Which available instrument is the proper choice for the horizontal control of the straights (bearings, angles)?`, `Total station or theodolite`, [`Dumpy level`, `Trough compass`, `Plumb bob`], 3, `Angles and bearings between stations come from a theodolite or total station; they are more accurate than a compass.`, `field work details 2026`),
  mcq(1, `What does the reconnaissance survey produce?`, `a rough sketch of the ground features and obstructions, with approximate relative distances`, [`the final longitudinal profile`, `the cross-sections at 1:100`, `the earthwork volumes`], 0, `Students quickly survey the alignment and present a rough sketch to the teacher.`, `lecture sheet p1`),
  mcq(3, `The level book has BM RL = 100.000 m, back sight 1.250 m. A staff reading of 1.560 m is taken on a point. Its RL is`, `99.690 m`, [`100.310 m`, `101.250 m`, `99.250 m`], 1, `HI = 100.000 + 1.250 = 101.250; RL = HI − reading = 101.250 − 1.560 = 99.690 m.`, `textbook`),
  mcq(3, `A level run starts at RL 100.000 m. ΣBS = 2.550 m and ΣFS = 2.600 m. The RL at the end is`, `99.950 m`, [`100.050 m`, `99.050 m`, `102.600 m`], 2, `Last RL − first RL = ΣBS − ΣFS = 2.550 − 2.600 = −0.050, so 99.950 m.`, `class notes (Quiz p16)`),
  mcq(3, `The bearing of the first straight is 45° and of the next straight 90°. The deflection angle at the junction is`, `45° to the right`, [`45° to the left`, `135° to the right`, `90° to the right`], 3, `Deflection = change of bearing = 90° − 45° = 45°, turning clockwise (right). The interior angle is 180° − 45° = 135°.`, `textbook`),
  mcq(1, `In the 2022 version of the route project the three straight legs were`, `60 m, 40 m and 60 m, with turns of 45° and 30°`, [`50 m, 50 m and 50 m with no turns`, `100 m, 40 m and 60 m`, `30 m, 30 m and 30 m with a 90° turn`], 2, `Seniors' rough sketch and level books: three arms of 60, 40 and 60 m, with 45° and 30° at the two turns.`, `18-batch report`),
  mcq(2, `On the route drawing, the plan strip and the cross-sections are placed`, `with the strip below the longitudinal profile and the cross-sections above the profile at the sections where taken`, [`with the cross-sections below the plan strip`, `on separate sheets only`, `with the profile drawn on the plan strip`], 1, `The description says: the map shows the strip below the longitudinal profile; cross-sections are presented above the profile at the section where taken.`, `lecture sheet p1`),
  mcq(3, `To cover the whole ROW in a cross-section across the 7 m carriageway and 10 m ROW, the offsets are normally taken at`, `the centre line, both lane edges (3.5 m) and both ROW boundaries (5 m), plus any break in slope`, [`the centre line only`, `0.5 m either side only`, `the pavement edge and the centre line only`], 0, `These offsets describe the shape across the carriageway and the whole ROW; add points where the ground changes slope.`, `textbook`),
]

questions.push(
  // ---- blank (7)
  blank(1, `Three segments of 50 m make a total alignment length of ___ m.`, [`150`], `3 × 50 = 150 m.`, `field work details 2026`),
  blank(1, `Two lanes of 3.5 m each make a carriageway ___ m wide.`, [`7`], `2 × 3.5 = 7 m.`, `field work details 2026`),
  blank(1, `The horizontal scale of the route map is 1:___ (the vertical scale is 1:100).`, [`500`], `Route project: horizontal 1:500, vertical 1:100.`, `lecture sheet p1`),
  blank(3, `At 1:500 the 150 m alignment is ___ cm long on paper.`, [`30`], `15 000 cm ÷ 500 = 30 cm.`, `lecture sheet p1`),
  blank(2, `The ROW is 10 m, so it extends ___ m on each side of the centre line.`, [`5`], `10 m ÷ 2 = 5 m.`, `field work details 2026`),
  blank(3, `The ROW strip of 150 m × 10 m has an area of 1500 m², which is about ___ decimals (nearest whole number).`, [`37`], `1500 ÷ 4046.86 = 0.3707 acre = 37.07 decimals.`, `textbook`),
  blank(2, `Level-book check: ΣBS − ΣFS = ΣRise − ΣFall = last RL − ___ RL.`, [`first`, `initial`, `starting`], `Checked on every level book.`, `class notes (Quiz p16)`),

  // ---- true / false (9)
  tf(1, `The benchmark for the 2026 route project lies inside the project site.`, false, `It is in the general vicinity, not directly within the project area, so its level must be carried to the site.`, `field work details 2026`),
  tf(2, `The horizontal scale of the route map is 1:500 and the vertical scale of the profile 1:100.`, true, `This is the scale given in the lecture sheet description of the route project.`, `lecture sheet p1`),
  tf(2, `In 2026 the extent, scale and sheet layout of the route project submission are left to the group's judgement, subject to the instructor's guidance.`, true, `Submission: "the exact form and extent … is left to your group's judgment".`, `field work details 2026`),
  tf(1, `Reconnaissance comes first, before the control is established.`, true, `The scope of work lists reconnaissance first, then control, then details, then the ground shape.`, `field work details 2026`),
  tf(1, `Levels are taken along the centre line and also across it at right angles.`, true, `Longitudinal profile along the centre line, cross-sections at right angles to it.`, `field work details 2026`),
  tf(2, `Running a loop of levels from the BM back to the BM lets the closing error be found.`, true, `Misclosure = the RL found at the end minus the known RL.`, `textbook`),
  tf(2, `A theodolite or total station has no use in the route project because it is a levelling job.`, false, `Horizontal control and the geometry of each straight (bearings, angles) need a theodolite or total station.`, `field work details 2026`),
  tf(2, `The control must be both horizontal and vertical.`, true, `The scope says: establish the control, both vertical and horizontal.`, `field work details 2026`),
  tf(2, `The geometric definition of each straight segment means its bearing and length.`, true, `Each straight is defined by where it starts, its direction and its length (and the deflection angle at the junctions).`, `field work details 2026`),
)

const cards: SvCard[] = [
  card(`What is the reconnaissance survey and what did you present?`, `A quick walk over the whole alignment to see the ground features and obstructions and their approximate distances from it. I gave the teacher a rough sketch.`, `lecture sheet p1`),
  card(`What is control and why do we need both horizontal and vertical?`, `Control means fixed reference points. Horizontal control (stations with known positions) ties the plan to the ground, vertical control (a benchmark and temporary benchmarks) ties the levels. Everything else is surveyed from them.`, `field work details 2026`),
  card(`The benchmark is outside the site. How did you bring its level in?`, `By fly levelling: back sight and fore sight through change points from the BM to a temporary BM at the site, and back, to check the closing error.`, `class notes (Theory p11)`),
  card(`Why did you choose a total station or theodolite for some work and a level for the rest?`, `The theodolite or total station gives angles and bearings, so I use it for horizontal control and the geometry of each straight. The level with staff gives differences in level, so I use it for the centre line and cross-section levels.`, `field work details 2026`),
  card(`How did you collect the details?`, `From the control stations or the centre line I located the ground features near the road (trees, poles, walls, drains) by offsets with the tape and optical square, or by angle and distance from the instrument.`),
  card(`How did you set out the centre line?`, `With the instrument at the first station, ranging rods on the next stations, pegs at fixed intervals along each 50 m segment. I measured the chainage of each peg with the tape.`),
  card(`Why do we take cross-sections?`, `They show the shape of the ground across the road at each section, which is needed to design the cut and fill, drainage and the side slopes.`),
  card(`Which offsets did you take in a cross-section?`, `The centre line, both edges of the 3.5 m lanes, and both boundaries of the 10 m ROW, with extra points where the ground changes slope.`),
  card(`What do the scales 1:500 and 1:100 mean?`, `The horizontal scale 1:500 and the vertical scale 1:100 give an exaggeration of 5, so small level differences show clearly on the profile. 50 m is 10 cm and 0.25 m is 2.5 mm.`, `lecture sheet p1`),
  card(`What defines each straight segment?`, `Its start station, bearing and length, and the deflection angle to the next straight at the junction. For example 45° then 90° gives a 45° turn.`, `field work details 2026`),
  card(`Why is the ROW wider than the carriageway?`, `The ROW also has to hold shoulders, drains, footpaths and future widening. Here the carriageway is 7 m in a 10 m ROW, so 1.5 m is left on each side.`),
  card(`How do you check a level book?`, `ΣBS − ΣFS must equal ΣRise − ΣFall, which must equal last RL − first RL. If they do not agree there is an arithmetic mistake or a mis-read staff.`, `class notes (Quiz p16)`),
  card(`What goes in your technical note?`, `A short description of the site and the work done, the instruments and why, the control (BM, stations), the closing error, the geometry of each straight, and what the design stage still needs.`, `field work details 2026`),
  card(`How was this different in 2022?`, `The senior route project had three legs of 60, 40 and 60 m with turns of 45° and 30°, and cross-sections at 3 m offsets. In 2026 the project is 3 × 50 m with a given ROW and lanes and an open plan.`, `18-batch report`),
]

export const content: SvTopicContent = { questions, cards }

export const learn: SvLearn = {
  notes: [
    {
      title: `The 2026 task and what it means`,
      md: `- **Alignment:** 150 m of road in **three 50 m segments**. **Two lanes of 3.5 m** (carriageway **7 m**); **right of way (ROW) 10 m** (5 m each side of the CL, so **1.5 m** between the pavement edge and the ROW boundary).
- **A BM exists nearby but outside the site:** bring its RL in by fly levelling and close back.
- **Open-ended:** the group plans and justifies the work. The scope: reconnaissance, horizontal + vertical control, details, ground shape along the CL and across it, and the **geometry of each straight**.
- Instruments you can choose from: dumpy / auto level + staff; total station or theodolite; chain / tape, ranging rods, arrows, optical square, prismatic compass, pegs, plumb bob, trough compass, bamboo and rope. **Be ready to say why** each was used.
- The 2022 version: legs **60 m, 40 m, 60 m** with turns of **45° and 30°**; cross-sections L2 L1 CL R1 R2 (3 m steps).`,
    },
    {
      title: `A sensible plan of work`,
      md: `| Stage | What | Instrument |
|---|---|---|
| Reconnaissance | Walk the alignment, rough sketch of features and obstructions with approximate distances | eye, pacing, tape |
| Horizontal control | Stations at the ends and bends of the straights (and over each 50 m), tied to 3 permanent objects; angles / bearing of each straight, length of each side | theodolite or total station, tape |
| Vertical control | Fly levelling from the BM to a TBM on site, back to the BM (closing check) | level + staff |
| Centre line | Ranging rods and pegs every 10 m (or as needed) along each straight, chainage 0+000 to 0+150 | theodolite / rods, tape |
| Details | Offsets or angle + distance to features within and near the ROW | tape, optical square, theodolite |
| CL levels | Reduced levels at every peg and at breaks in slope | level + staff |
| Cross-levels | At right angles to the CL: CL, lane edges ±3.5 m, ROW boundaries ±5 m, plus breaks in slope | level + staff, tape |
| Geometry | Bearing and length of each straight, deflection angle at each junction | theodolite / total station |
Interchange the sub-groups so everyone does each job.`,
    },
    {
      title: `Level book and checks`,
      md: `Columns: Station | Chainage | BS | IS | FS | Rise | Fall | RL | HI | Distance (offset) | Remarks (CL, L1, L2, R1, R2).
- **Rise & fall:** rise or fall $=$ previous reading $-$ this reading (+ rise, − fall). $\\text{RL}=\\text{previous RL}+\\text{rise}$ or $-\\text{fall}$.
- **HI method:** $\\text{HI}=\\text{RL}_{BM}+BS$, $\\text{RL}=\\text{HI}-\\text{reading}$. Example: $100.000+1.250=101.250$, reading 1.560 gives 99.690.
- **Check on every page:** $$\\Sigma BS-\\Sigma FS=\\Sigma\\text{Rise}-\\Sigma\\text{Fall}=\\text{last RL}-\\text{first RL}$$ Example: ΣBS 2.550, ΣFS 2.600 gives last RL = first RL − 0.050.
- Close the loop on the BM and report the misclosure.`,
    },
    {
      title: `Drawing: plan, profile, cross-sections`,
      md: `- **Scales (lecture sheet):** horizontal **1:500**, vertical **1:100** (exaggeration 5). Numbers: 50 m → 10 cm; 150 m → 30 cm; ROW 10 m → 2 cm; carriageway 7 m → 1.4 cm (horizontal); a 0.25 m level difference → 0.25 cm (1:100). In 2026 the group may adapt the scale and layout, so state them clearly.
- **Layout (description):** plan strip **below** the longitudinal profile; **cross-sections above** the profile at the sections where they were taken. Sheet: tracing paper, drawing sheet or graph paper.
- **Show on the plan:** centre line with chainage ticks, pavement edges (±3.5 m) and ROW lines (±5 m), the stations, features and obstructions, the BM / TBM, north arrow.
- **Show on the profile:** ground level at each peg, datum line, RL labels, the chainages below.
- **Show on each cross-section:** CL, the offsets with RLs, pavement and ROW marked.
- **Geometry table:** bearing, length, deflection of each straight.
- A **short technical note** explains the choices, the closing error and limits.`,
    },
  ],
  steps: [
    `Reconnaissance: walk the 150 m strip, note the ground features and obstructions beside the alignment, and make a rough sketch with approximate distances. Show it to the teacher.`,
    `Decide the plan: sub-groups for centre line, details, and levels; swap duties so everybody does all of them. Choose the instrument for each job and be ready to justify it.`,
    `Horizontal control: fix the stations at the ends and bends of the straights, tied to three permanent objects. Measure the bearing or angle at each station and the length of each straight.`,
    `Set out the centre line with ranging rods, mark pegs along the three 50 m segments and write the chainage on each.`,
    `Vertical control: from the BM run fly levels to a temporary BM on the site, keeping back sights and fore sights balanced, and close back on the BM.`,
    `Levels along the centre line at every peg and at breaks in slope, in the level book. Do the cross-levels at right angles at each section: CL, ±3.5 m (lane edges), ±5 m (ROW boundary).`,
    `Locate the details (trees, poles, walls, drains) by offsets or by angle and distance, and record them in the field book.`,
    `Check the level book arithmetic on the spot and compute the closing error of the levelling loop.`,
    `Next day: plot the plan strip, longitudinal profile (1:500 horizontal, 1:100 vertical) and the cross-sections. Write the technical note.`,
  ],
  submit: [
    `Following day, as a **group**: whatever maps, profiles, field records and a **short technical note** clearly communicate the findings. Form, scale and layout are the group's judgement within the instructor's guidance.`,
    `Include: plan with details and centre line, longitudinal profile, cross-sections, level book with the checks, field book pages, geometry table.`,
    `Every sheet: title and course no., names / roll / group, **date of performance**, legend, **N–S line**, **numerical and graphical scale**, **half-inch border**.`,
    `State the instrument choices and their reasons in the note.`,
  ],
  traps: [
    `Treating the BM as if it were inside the site and not carrying its RL in with a closed check.`,
    `Taking cross-sections only inside the carriageway and missing the ROW boundary.`,
    `Mixing the scales: profile vertical 1:100 against horizontal 1:500.`,
    `Level book without ΣBS − ΣFS = ΣRise − ΣFall = last − first on each page.`,
    `Not recording chainages on the pegs, so the profile cannot be tied to the plan.`,
    `Taking a compass bearing when a theodolite or total station was available, without a reason.`,
    `Leaving out the technical note or the reasons for choosing the instruments.`,
    `Forgetting the legend, north line, scales or border on a sheet.`,
  ],
  carry: [
    `Dumpy or auto level, staff, theodolite or total station with prism, tripods`,
    `Tape, chain, ranging rods, arrows, optical square, plumb bob, pegs and mallet, bamboo and rope`,
    `Level book, field book, calculator, rough sketch paper`,
    `Tracing paper, graph paper or drawing sheet, scales, set squares, pencils`,
  ],
}
