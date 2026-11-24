import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-level' as const
const ID = 'lvl'
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

// Worked example used in several questions (metres):
// BM RL 50.000. Set-up 1: BS 2.350, IS 1.850, IS 2.100, FS 1.200 (change point). Set-up 2: BS 1.500, FS 2.300 (last point).
// Rise/fall: +0.500, -0.250, +0.900 | CP->end: -0.800. RLs: 50.500, 50.250, 51.150, 50.350.
// Check: 3.850 - 3.500 = 0.350 = 1.400 - 1.050 = 50.350 - 50.000.
const EX = `Level book: BM RL = 50.000 m. Set-up 1: BS 2.350, IS 1.850, IS 2.100, FS 1.200 (change point). Set-up 2: BS 1.500 (on the change point), FS 2.300 (last point).`

const questions: SvQuestion[] = [
  mc(`The reduced level (RL) of a point is:`, `Its vertical height above (or below) the chosen datum`, [`The staff reading on that point`, `The horizontal distance from the benchmark`, `The height of the instrument above that point`], `RL is elevation with respect to the datum (normally mean sea level, or an assumed value like 100.000 m in class).`, `textbook`, 1),
  mc(`The standard datum for reduced levels in surveying is:`, `Mean sea level`, [`The ground level at the site`, `The highest flood level`, `The plinth level of the nearest building`], `Mean sea level is the national datum; for a small class job a BM of assumed RL (like 100.000 m) may be used.`, `textbook`, 1),
  mc(`Known benchmarks in Bangladesh are established by:`, `Survey of Bangladesh (SOB)`, [`BUET`, `The local union council`, `Each student group`], `SOB creates the control points all over the country; other BM series are GTS, FM and PWD.`, `class notes (Quiz p2)`, 1),
  mc(`The back sight (BS) is:`, `The first staff reading after setting up the level, taken on a point of known RL`, [`The last reading before the level is moved`, `Any reading between two set-ups`, `The reading on the highest point`], `A BS added to the known RL gives the height of instrument.`, `textbook`, 1, true),
  mc(`The fore sight (FS) is:`, `The last staff reading from a set-up, taken on the point whose RL is to be carried forward`, [`The first reading after setting up`, `A reading taken on the benchmark`, `A reading taken on a point of known RL`], `The FS on a change point closes a set-up; the next BS is taken on the same point after the level is shifted.`, `textbook`, 1, true),
  mc(`An intermediate sight (IS) is a reading:`, `Between the BS and FS of a set-up, on a point whose RL is wanted but not carried forward`, [`Taken on the change point from the new set-up`, `Taken on the benchmark`, `Taken with the level reversed`], `IS readings are booked in the Inter column and are not part of the BS − FS check.`, `textbook`, 1, true),
  mc(`The height of instrument (collimation) method uses:`, `HI = RL + BS and RL = HI − reading`, [`HI = RL − BS and RL = HI + reading`, `HI = BS + FS and RL = HI × reading`, `HI = RL + FS and RL = BS − HI`], `The HI is the RL of the line of sight; the RL of any point is HI minus the staff reading on it.`, `textbook`, 2),
  mc(`The RL of a BM is 98.420 m and the back sight on it is 1.580 m. The HI is:`, `100.000 m`, [`96.840 m`, `99.000 m`, `100.000 ft`], `HI = 98.420 + 1.580 = 100.000 m.`, `textbook`, 3),
  mc(`In the rise and fall method, a RISE between two consecutive staff readings occurs when:`, `The previous reading is larger than the next reading`, [`The previous reading is smaller than the next reading`, `Both readings are equal`, `The next reading is on the change point`], `A smaller staff reading means higher ground; previous − next positive is a rise, negative is a fall.`, `class notes (Theory p5), textbook`, 2),
  mc(`${EX} The RL of the point with the second IS (2.100) is:`, `50.250 m`, [`50.500 m`, `47.900 m`, `52.450 m`], `IS1: 2.350 − 1.850 = +0.500 rise → 50.500; IS2: 1.850 − 2.100 = −0.250 fall → 50.250.`, `textbook (calculation)`, 3),
  mc(`${EX} The RL of the change point is:`, `51.150 m`, [`50.250 m`, `51.050 m`, `49.150 m`], `2.100 − 1.200 = +0.900 rise: 50.250 + 0.900 = 51.150 m.`, `textbook (calculation)`, 3),
  mc(`${EX} The RL of the last point is:`, `50.350 m`, [`51.150 m`, `50.000 m`, `49.650 m`], `From the change point: 1.500 − 2.300 = −0.800 fall; 51.150 − 0.800 = 50.350 m.`, `textbook (calculation)`, 3),
  mc(`${EX} Σ BS − Σ FS equals:`, `0.350 m`, [`0.000 m`, `−0.350 m`, `7.350 m`], `ΣBS = 2.350 + 1.500 = 3.850; ΣFS = 1.200 + 2.300 = 3.500; difference 0.350 = 50.350 − 50.000.`, `textbook (calculation)`, 3),
  mc(`The arithmetic check of a level book is:`, `Σ BS − Σ FS = Σ Rise − Σ Fall = last RL − first RL`, [`Σ BS + Σ FS = Σ Rise + Σ Fall`, `Σ IS = Σ Rise − Σ Fall`, `Σ BS = Σ FS`], `All three differences must agree; IS readings are not in the first.`, `class notes (Quiz p16, Theory p6)`, 2),
  mc(`The arithmetic check can NOT detect:`, `A staff reading that was misread but booked as read`, [`A wrong subtraction in a rise or fall`, `A wrong addition of a column`, `A wrong RL carried from the previous line`], `The check is only arithmetic; a bad reading looks like any other reading.`, `textbook`, 2),
  mc(`An advantage of the rise and fall method over the HI method is:`, `It checks the arithmetic of intermediate RLs too`, [`It needs fewer calculations when there are many IS`, `It does not need back sights`, `It works without a staff`], `Each RL comes from the previous one, so a slip in any RL shows in the final check; the HI method does not check IS RLs.`, `textbook`, 2),
  mc(`The HI method is better than rise and fall when:`, `There are many intermediate sights`, [`There is only one BS and one FS`, `The ground is perfectly flat`, `A digital level is not used`], `Each IS needs just one subtraction from HI; rise and fall needs two lines per point.`, `textbook`, 2),
  mc(`The class levelling work (Field work details 4) uses:`, `Rise & Fall method`, [`Height of instrument only`, `Reciprocal levelling only`, `Trigonometric levelling`], `Elevation of ground points is to be calculated by the rise & fall method.`, `field work details 2026`, 1),
  mc(`The combined curvature and refraction correction for a sight of 200 m is about:`, `2.7 mm`, [`0.27 mm`, `27 mm`, `2.7 m`], `0.0673 × (0.2)² = 0.00269 m ≈ 2.7 mm, subtracted from the staff reading.`, `textbook`, 3),
  mc(`Why is the level set up midway between the BS and FS stations?`, `Collimation error, curvature and refraction affect both readings equally and cancel in the difference`, [`To save time walking`, `To keep the staff vertical`, `To avoid the need for a change point`], `With equal sight lengths the error in each reading is the same, and rise or fall is a difference.`, `textbook`, 2),
  mc(`Fly levelling is:`, `Carrying a level from one BM to another using only BS and FS`, [`Levelling with a drone`, `Taking readings across a road only`, `Levelling with a theodolite`], `No intermediate sights are taken; it is used to transfer RL quickly.`, `textbook; class notes (Theory p11)`, 2),
  mc(`While the level is shifted from one set-up to the next, the staff on the change point must:`, `Stay on the same point, without being moved or lifted off`, [`Be moved to a nearby firmer spot`, `Be tilted to the new instrument`, `Be placed on a different peg`], `The change point carries the RL to the new set-up; moving the staff changes the point and breaks the chain.`, `textbook`, 2, true),
  mc(`A longitudinal profile plots:`, `RL (vertical) against chainage along the centre line (horizontal)`, [`RL against offset from the centre line`, `Chainage against bearing`, `Staff reading against RL`], `The vertical scale is usually exaggerated to show the relief.`, `class notes (Quiz p16)`, 1),
  mc(`A cross-section is taken:`, `At right angles to the centre line, at the stated chainages`, [`Along the centre line`, `Along a diagonal`, `Along the longest side`], `The cross-profile shows the ground across the strip: L2, L1, CL, R1, R2.`, `class notes (Quiz p16)`, 1),
  mc(`Plot size in the class levelling work (2026) is:`, `100 m long and 6 m wide`, [`50 m by 50 m`, `150 m by 10 m`, `60 m by 3 m`], `A 100 m strip with a centre line; the contour work uses the 50 m square.`, `field work details 2026`, 1),
  mc(`How many cross-sections are taken in the 100 m strip (Ch 0, 20, 40, 60, 80, 100)?`, `6`, [`5`, `10`, `11`], `One at each of the six chainages; the CL readings every 10 m are the longitudinal ones.`, `field work details 2026`, 2),
  mc(`Centre-line points every 10 m for 100 m, plus cross points at ±1.5 m and ±3 m at the six cross-sections. How many staff readings are taken in the strip (excluding the BM)?`, `35`, [`30`, `42`, `66`], `11 CL points + 6 × 4 cross points = 35.`, `field work details 2026 (calculation)`, 3),
  mc(`Why must there be at least 2 level stations in the class work?`, `The 100 m plot is read from two positions so that sights stay short, and the assignment demands a change point`, [`Because the level has two bubbles`, `Because the BM must be read twice`, `Because the staff is only 2 m long`], `The assignment demands at least one change point; also readings stay within about 70 m of the instrument.`, `field work details 2026, class notes (Quiz p1)`, 2),
  mc(`Why is the starting point located with respect to three permanent objects?`, `So it can be found again, and the mark is checked by the third tie`, [`To give it an RL`, `To make the staff stable`, `To avoid taking a back sight`], `If the peg is disturbed it is re-fixed from the three ties.`, `field work details 2026`, 2),
]

const more: SvQuestion[] = [
  bl(`RL of a point = HI minus the staff ___ on it.`, [`reading`, `staff reading`], `That is the collimation method rule.`, `textbook`, 1),
  bl(`HI = RL of the BM + the ___ sight.`, [`back`, `backsight`, `back sight`, `bs`], `The BS is read on the point of known RL.`, `textbook`, 1),
  bl(`In the level example (BM 50.000, BS 2.350, IS 1.850, IS 2.100, FS 1.200, BS 1.500, FS 2.300) the RL at the last point is ___ m.`, [`50.350`, `50.35`], `Rises and falls: +0.500, −0.250, +0.900, −0.800 add to +0.350.`, `textbook (calculation)`, 3),
  bl(`Σ BS − Σ FS = Σ Rise − Σ ___.`, [`fall`, `falls`], `Both equal last RL − first RL.`, `class notes (Quiz p16)`, 1),
  bl(`Σ BS − Σ FS must equal the last RL minus the ___ RL.`, [`first`, `initial`, `starting`], `The check closes the book.`, `class notes (Quiz p16)`, 1),
  bl(`In the class strip, cross readings are taken every ___ m along the centre line.`, [`20`, `twenty`], `At Ch 0, 20, 40, 60, 80 and 100 m.`, `field work details 2026`, 1),
  bl(`In the class strip, longitudinal readings are taken every ___ m along the centre line.`, [`10`, `ten`], `The centre-line points are at 0, 10, 20 … 100 m.`, `field work details 2026`, 1),
  bl(`A tilted staff makes the reading too ___.`, [`large`, `larger`, `big`, `high`, `more`], `The line of sight meets a leaning staff higher up along its length.`, `class notes (Anzara p5)`, 1, true),
  bl(`The combined curvature and refraction correction for d = 1 km is ___ m.`, [`0.0673`, `0.067`, `67.3 mm`], `0.0673 × 1² m (d in km).`, `textbook`, 3),
  bl(`The class levelling plot is ___ m wide.`, [`6`, `six`], `Centre line with L2, L1, CL, R1, R2 at 3 m, 1.5 m, 0, 1.5 m, 3 m.`, `field work details 2026`, 1),

  tf(`When previous reading − next reading is negative, the ground has fallen.`, true, `A larger next reading means lower ground.`, `class notes (Theory p5)`, 2),
  tf(`In the HI method, intermediate sights are included in the check ΣBS − ΣFS.`, false, `IS readings never enter the BS − FS check.`, `textbook`, 2),
  tf(`Setting the level midway between BS and FS stations cancels collimation error.`, true, `Equal sight lengths give equal errors in both readings, which cancel in the difference.`, `textbook`, 2),
  tf(`A level surface is the same thing as a horizontal plane.`, false, `A level surface is curved (parallel to the mean sea level); a horizontal plane is tangent at the instrument.`, `textbook`, 2),
  tf(`The staff on a change point can be moved while the level is being shifted as long as it is brought back.`, false, `It must not move; moving it changes the point.`, `textbook`, 2, true),
  tf(`The check Σ BS − Σ FS = last RL − first RL holds only when there are no intermediate sights.`, false, `IS points do not enter the check, so it holds in general.`, `textbook`, 2),
  tf(`A longitudinal profile is usually drawn with an exaggerated vertical scale.`, true, `Vertical relief is small compared to length; the vertical scale is enlarged to show it.`, `textbook`, 1),
  tf(`The class assignment needs at least one change point.`, true, `Readings are from at least 2 level stations.`, `field work details 2026`, 1),
  tf(`In the HI method the RL of an intermediate point is HI minus its reading.`, true, `RL = HI − IS.`, `textbook`, 1),
]

const all = [...questions, ...more]

const cards = [
  [`What is a benchmark and what is RL?`, `A benchmark is a fixed point of known RL, set by Survey of Bangladesh. RL is the height of a point above the datum, here mean sea level or an assumed value like 100.`, `class notes (Quiz p2)`],
  [`What are BS, IS and FS?`, `Back sight is the first reading after setting up, on a known RL. Intermediate sights are readings between. Fore sight is the last reading of a set-up, on the change point.`, `textbook`],
  [`What is a change point?`, `The point I carry the level to. I take a fore sight on it, shift the instrument, then take a back sight on the same point. The staff must not move meanwhile.`, `class notes (Theory p11)`],
  [`Why do we need at least 2 set-ups here?`, `The plot is 100 m long and I keep readings within about 70 m of the instrument. The assignment also asks for at least one change point.`, `field work details 2026`],
  [`Why do you keep the staff vertical?`, `A tilted staff always reads larger, so every RL would be wrong. I rock it slowly and take the smallest reading.`, `class notes (Anzara p5)`],
  [`Why keep the sight within about 70 m?`, `To avoid the curvature correction. Curvature is subtracted and refraction added; combined 0.0673 d², so at 70 m it is under half a millimetre.`, `class notes (Quiz p1)`],
  [`Explain the rise and fall method.`, `I subtract each reading from the previous one. Positive is a rise, negative a fall. RL = previous RL plus the rise or minus the fall.`, `class notes (Theory p5)`],
  [`How does the HI method work?`, `HI = RL of BM + BS. RL of every other point = HI minus its reading. At a change point I compute a new HI.`, `textbook`],
  [`Which one did you use and why?`, `Rise and fall, as the assignment says. It checks every RL, including the intermediate ones, through the final arithmetic check.`, `field work details 2026`],
  [`What check do you apply to the level book?`, `Σ BS − Σ FS = Σ Rise − Σ Fall = last RL − first RL. It checks arithmetic, not misreadings.`, `class notes (Quiz p16)`],
  [`The check fails by 0.010. What do you do?`, `Recompute all subtractions and additions, starting from the last RL. If it is still wrong I check the booking. A misread can only be found by re-levelling.`, `textbook`],
  [`Why is the level kept midway between BS and FS?`, `Collimation error, curvature and refraction are then the same in both readings, so they cancel in the rise or fall.`, `textbook`],
  [`What are the cross-section points L2, L1, CL, R1, R2?`, `Points on a line at right angles to the centre line: 3 m and 1.5 m to the left, the centre, and 1.5 m and 3 m to the right.`, `lecture sheet p40`],
  [`What is plotted on the A3 sheet?`, `A longitudinal profile of RL against chainage, with the vertical scale exaggerated, and the cross-sections at 0, 20, 40, 60, 80 and 100 m.`, `field work details 2026`],
  [`Why start from three permanent objects?`, `So the start point can be found again if the peg moves. The third tie checks the first two.`, `field work details 2026`],
  [`Does the level need centring over a mark?`, `No. Only levelling matters, with the circular bubble and foot screws. The compensator keeps the line of sight horizontal.`, `class notes (Anzara p5)`],
  [`What is parallax and how do you remove it?`, `The reading shifts when I move my eye. I sharpen the cross-hairs with the eyepiece, then focus the staff, until there is no shift.`, `lecture sheet p7`],
  [`How do you book a change point?`, `The FS goes on the line of the old set-up. The BS goes on the next line, on the same point, with the new HI computed from it.`, `lecture sheet p40`],
]

export const content: SvTopicContent = {
  questions: all,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'Terms and booking',
      md: `- **RL**: height above the datum. **BM**: fixed point of known RL (SOB, GTS, FM, PWD series). In class the BM may be given an assumed value.
- **BS**: first reading of a set-up, on a known RL. **IS**: between. **FS**: last reading of a set-up.
- **Change point (CP)**: FS on it, move the level, BS on it again. The staff stays put.
- Level book columns: Station, Chainage, Back, Inter, Fore, Rise, Fall, RL, HI, Distance, Remarks. Remarks use CL, L1, L2, R1, R2.
- Cross-section offsets: L2 = 3 m, L1 = 1.5 m, CL, R1 = 1.5 m, R2 = 3 m.`,
    },
    {
      title: 'Rise & Fall and HI',
      md: `**Rise & fall:** rise or fall = previous reading − next reading (positive = rise, negative = fall). $RL = RL_{prev} \\pm$ rise or fall.

**HI:** $HI = RL_{BM}+BS$, $RL = HI - \\text{reading}$. At a change point a new $HI = RL_{CP}+BS$.

**Worked example** (m): BM 50.000; BS 2.350, IS 1.850, IS 2.100, FS 1.200 | BS 1.500, FS 2.300.

| Point | Rise/Fall | RL |
|---|---|---|
| BM | | 50.000 |
| IS 1 | +0.500 | 50.500 |
| IS 2 | −0.250 | 50.250 |
| CP | +0.900 | 51.150 |
| Last | −0.800 | 50.350 |

Check: $\\sum BS-\\sum FS=3.850-3.500=0.350$; $\\sum$Rise $-\\sum$Fall $=1.400-1.050=0.350$; last RL − first RL $=0.350$.`,
    },
    {
      title: 'Checks and errors',
      md: `- $\\sum BS-\\sum FS=\\sum\\text{Rise}-\\sum\\text{Fall}=RL_{last}-RL_{first}$ must hold exactly. IS readings are not part of the first term.
- The check proves the arithmetic only; a misread or wrongly booked reading is not detected.
- **Instrument errors cancel** if the level is midway between BS and FS stations.
- **Curvature + refraction**: $0.0673\\,d^2$ (d in km, result in m), subtracted. About 2.7 mm at 200 m, 0.3 mm at 70 m. The class limits sight to about 70 m.
- A **tilted staff reads too large**. Rock it and take the minimum.
- Parallax: refocus the eyepiece and the objective.`,
    },
    {
      title: 'Plotting the profile and cross-sections',
      md: `- **Longitudinal profile**: chainage on the horizontal axis, RL on the vertical axis, centre-line points joined; the vertical scale is exaggerated to show the relief.
- **Cross-sections** at Ch 0, 20, 40, 60, 80 and 100 m: offset left/right on the horizontal axis, RL on the vertical axis.
- Use A3 graph paper; show horizontal and vertical scales; write the RL values at each point.
- Choose the vertical datum line so the whole profile fits.`,
    },
  ],
  steps: [
    `Fix the starting point with respect to three permanent objects and sketch the ties in the field book.`,
    `Range the 100 m line with ranging rods and lay the rope along the centre line; mark every 10 m with pegs or a marker.`,
    `Mark cross-section points at Ch 0, 20, 40, 60, 80, 100 m: 1.5 m and 3 m on both sides of the centre line.`,
    `Set up the level on a suitable spot within about 70 m of the points to be read; level it by the circular bubble.`,
    `Focus the eyepiece and the staff and remove parallax.`,
    `Take the back sight on the benchmark and book it in the Back column.`,
    `Read the centre line every 10 m; at each 20 m chainage read L2, L1, CL, R1, R2; book as Inter with remarks.`,
    `When the staff cannot be read from here, choose a firm change point and take the fore sight on it.`,
    `Move the level to a second station and take the back sight on the same change point; continue the readings.`,
    `Close the run with a final fore sight; at the site compute Σ BS − Σ FS, Σ Rise − Σ Fall and the last RL − first RL and check them.`,
    `Compute the RLs by rise and fall; plot the longitudinal and cross profiles on A3 graph paper.`,
  ],
  submit: [
    `Longitudinal profile and cross-profiles on A3 graph paper (individual, following day).`,
    `The level book with the necessary arithmetic checks.`,
    `Title of the survey and course no., name, roll and group no., date of performance.`,
    `Legend, N–S line, numerical and graphical scale, half inch border.`,
    `Horizontal and vertical scales of the profile written on the sheet.`,
  ],
  traps: [
    `Booking the change point as an IS instead of a FS then a BS.`,
    `Moving the staff off the change point while the level is shifted.`,
    `Including intermediate sights in Σ BS − Σ FS.`,
    `Reversing the sign of a rise and a fall.`,
    `Forgetting the HI or RL of the new set-up at a change point.`,
    `A tilted staff, or reading with parallax.`,
    `Leaving the check unfinished when you leave the field.`,
    `Plotting with no scale for the vertical axis.`,
  ],
  carry: [
    `Level book and field book`,
    `A3 graph paper, sharp pencil, eraser, scale`,
    `Calculator`,
    `Rope, pegs and tape for the strip, ranging rods`,
    `Telescopic staff and the level with tripod (from the issue counter)`,
    `Marker for the change points`,
  ],
}
