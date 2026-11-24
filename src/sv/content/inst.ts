import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-inst' as const
const ID = 'inst'
let n = 0
const nid = () => `q-${ID}-${++n}`

/** mcq: the correct option is inserted at a rotating index so answers spread over 0-3 */
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
  // ---- chain, tape, small kit ----
  mc(`An engineer's chain is how long?`, `100 ft (100 links of 1 ft)`, [`66 ft (100 links of 0.66 ft)`, `20 m (100 links of 0.2 m)`, `30 m (150 links of 0.2 m)`], `The engineer's chain is 100 ft with 100 links of 1 ft each; the others are Gunter's and the metric chains.`, `class notes (Quiz facts, Nafim p1)`, 1, true),
  mc(`How many links does a 30 m metric chain have?`, `150`, [`100`, `200`, `300`], `A metric chain link is 0.2 m, so 30 m = 150 links (the 20 m chain has 100).`, `textbook`, 2, true),
  mc(`One link of a Gunter's chain is how long?`, `0.66 ft (7.92 in)`, [`1 ft`, `0.2 m`, `1 ft 6 in`], `Gunter's chain = 66 ft in 100 links, so each link is 0.66 ft = 7.92 in.`, `textbook`, 1, true),
  mc(`Which tag marks the middle (50 ft) of an engineer's chain?`, `A round (circular) tag`, [`A one-toothed tag`, `A three-toothed tag`, `A four-toothed tag`], `The 50 ft tally is the round tag; the teeth count rises towards the middle (10 ft one, 20 ft two, 30 ft three, 40 ft four).`, `class notes (Nafim p1)`, 1, true),
  mc(`In the class chain survey, what is used to measure the offsets?`, `A tape, because it is more accurate`, [`The chain, because it is stronger`, `A plumb bob and string`, `A ranging rod with marks`], `The chain forms the triangle (main lines); offsets are short and are measured with a tape.`, `class notes (Samiha p2)`, 1, true),
  mc(`Each arrow picked up by the follower while chaining a line represents:`, `One full chain length measured`, [`One link`, `One station`, `One offset`], `The leader drops an arrow at each chain end; the follower collects it, so the follower's arrows count the whole chains done.`, `class notes (Samiha p4)`, 1, true),
  mc(`A follower holds 3 arrows and the chain end falls at the 45th link beyond the last arrow, with an engineer's chain. The line length is:`, `345 ft`, [`300 ft`, `245 ft`, `445 ft`], `3 whole chains = 300 ft plus 45 links × 1 ft = 345 ft, written as chainage 3+45.`, `textbook`, 3, true),
  mc(`How many arrows are in the standard set that goes with a chain?`, `10`, [`4`, `6`, `20`], `A chain is used with a set of 10 steel arrows.`, `textbook`, 1, true),
  mc(`The ranging rod is usually how long?`, `2 m or 3 m`, [`0.5 m`, `5 m or 6 m`, `10 m`], `Ranging rods are 2 m or 3 m poles painted in bands; the longer ranging poles (4 to 6 m) are for long lines.`, `textbook`, 1, true),
  mc(`Why are ranging rods set up between the two ends of a main line longer than a chain?`, `To keep the chain on a straight line between the end stations`, [`To measure the length of the line`, `To measure the offsets`, `To level the ground along the line`], `Ranging fixes intermediate points exactly on the line AB, so each chain is laid along it.`, `class notes (Theory p2)`, 2, true),
  mc(`Why is a station tied to THREE permanent objects?`, `Three ties locate it by intersection, and the third checks the first two`, [`Because three is the maximum the field book allows`, `Because the chain has three rings per link`, `Because one tie measures angle and the others measure level`], `Two ties give a position, the third proves it. If it is lost the station is found again from the sketch.`, `class notes + lecture sheet p3`, 2, true),
  mc(`The plumb bob hanging from the U-fork is used to:`, `Centre the plane table over the station`, [`Level the plane table`, `Orient the table to north`, `Measure the height of the table`], `The pointed bob must hang over the ground station mark when the table point is the plotted station.`, `class notes (Nafim p2)`, 1, true),
  mc(`Which tape is the most accurate, for precise base-line measurement?`, `Invar tape`, [`Cloth (linen) tape`, `Metallic tape`, `Steel tape`], `Invar (about 36% nickel steel) has a very low coefficient of thermal expansion, so temperature hardly changes its length.`, `textbook`, 2, true),

  // ---- optical square, cross staff ----
  mc(`The two plane mirrors of an optical square are inclined to each other at:`, `45°`, [`30°`, `60°`, `90°`], `A ray reflected twice is turned through twice the angle between the mirrors, so 45° gives a 90° turn.`, `class notes (Theory p2)`, 1, true),
  mc(`An optical square turns the line of sight through:`, `90°`, [`45°`, `135°`, `180°`], `With the mirrors at 45° the deviation is 2 × 45° = 90°, which gives a perpendicular.`, `class notes (Quiz facts 16)`, 1, true),
  mc(`You have found the foot of the perpendicular with the optical square when:`, `The ranging rod at the far station and the image of the object appear in one vertical line`, [`The object is seen through both mirrors together`, `The bubble is in the centre`, `The image appears upside down`], `The direct view (ranging rod over the unsilvered part) and the reflected view (the object) coincide when the sight lines are 90° apart.`, `textbook`, 2, true),
  mc(`Which three methods find the foot of the perpendicular in the class chain survey?`, `3-4-5 method, swing method and optical square`, [`Swing method, plumb bob and spirit level`, `Optical square, ranging and plane table`, `3-4-5 method, collimation and prismatic compass`], `The class notes list these three; the optical square is starred as most important.`, `class notes (Theory p2)`, 1, true),
  mc(`In the swing method the foot of the perpendicular is:`, `The mid-point of the two places where the swung tape cuts the chain line`, [`The point where the tape just touches the line`, `The first point where the tape cuts the line`, `The point nearest to the chain end`], `The swung arc cuts the line at two points; they are symmetric about the foot.`, `class notes (Samiha p7)`, 2, true),

  // ---- compasses and plane table ----
  mc(`A prismatic compass gives bearings as:`, `Whole circle bearings, 0° to 360°`, [`Quadrantal bearings, 0° to 90°`, `Reduced bearings only`, `Angles from the previous line`], `The prismatic card is graduated 0 to 360° clockwise from north.`, `class notes (Quiz facts 19)`, 1, true),
  mc(`The surveyor's compass gives bearings as:`, `Quadrantal bearings (N or S, angle, E or W)`, [`Whole circle bearings only`, `Deflection angles`, `Zenith angles`], `The card is graduated 0 to 90° in each quadrant; the sight-vane box rotates over a fixed card.`, `textbook`, 1, true),
  mc(`In a prismatic compass the graduations are printed upside-down because:`, `The prism inverts the image, so they appear upright when read through it`, [`The card rotates upside-down in the box`, `The needle points downwards`, `The mirror reverses left and right`], `The prism magnifies and erects the figures, so the printed ones are inverted on the card.`, `textbook`, 2, true),
  mc(`In the prismatic compass the graduated ring is fixed to:`, `The magnetic needle, so it always points north`, [`The box, so it turns with the sight`, `The object vane`, `The tripod head`], `The card floats with the needle; the box with the vanes is turned and the reading is taken at the line of sight.`, `textbook`, 2, true),
  mc(`A trough compass is used mainly with the plane table to:`, `Draw the magnetic north–south line on the sheet`, [`Measure the height of the table`, `Level the table`, `Centre the table over the station`], `The long narrow trough compass is laid on the sheet and the needle gives the magnetic meridian for orientation.`, `class notes (Samiha p11, Quiz p13)`, 1, true),
  mc(`The three operations at a plane-table station, in order, are:`, `Levelling, centring, orientation`, [`Orientation, levelling, centring`, `Centring, orientation, levelling`, `Levelling, orientation, centring`], `Class notes write L → C → O; orientation is last because moving the table spoils it.`, `class notes (Quiz p13)`, 1, true),
  tf(`In plane-table sighting, the alidade is kept on the same side of the point (always right or always left) throughout.`, true, `Switching sides gives a different ray and causes error; class notes ask for the same side every time.`, `class notes (Quiz p13)`, 2, true),

  // ---- level, staff ----
  mc(`Which is NOT a temporary adjustment of a level?`, `Making the line of collimation parallel to the bubble axis`, [`Setting up on the tripod`, `Levelling up with the foot screws`, `Removing parallax by focusing`], `That is a permanent adjustment, done by the maker or in the lab. The temporary ones are set up, level up and focus.`, `textbook`, 2, true),
  mc(`What is the first step in focusing and sighting an automatic level?`, `Point the objective at the staff using the peep sight`, [`Turn the focusing knob fully`, `Level the circular bubble`, `Tighten the clamp`], `The sheet: peep sight to aim, eyepiece until the cross-lines are just sharp, fine motion screw to centre, focus knob, then check parallax.`, `lecture sheet p7`, 2, true),
  mc(`Parallax is eliminated by:`, `Focusing the eyepiece on the cross-hairs, then the objective on the staff`, [`Levelling the instrument again`, `Moving the tripod`, `Using a longer staff`], `The cross-hairs and the image must both lie in the focal plane of the eyepiece.`, `lecture sheet p7, textbook`, 2, true),
  mc(`The circular level of an auto level is centred by:`, `The three levelling foot screws`, [`The focusing knob`, `The horizontal fine motion screw`, `The tripod clamp`], `The foot screws (5) bring the bubble into the centre circle (4).`, `lecture sheet p7`, 1, true),
  mc(`What makes an automatic level different from a dumpy level?`, `A compensator keeps the line of sight horizontal once the circular bubble is centred`, [`A telescope that can be tilted with a long bubble`, `A vertical circle for angles`, `A longer staff`], `The compensator swings to correct a small tilt, so no long tubular bubble is needed.`, `textbook`, 2, true),
  mc(`The staff of the class level is a telescopic one. Its maximum length and the smallest graduation are:`, `5 m and 5 mm`, [`3 m and 1 mm`, `5 m and 1 cm`, `4 m and 2 mm`], `Telescopic (three-section) staff: 5 m extended, graduated to 5 mm; the 1 mm is estimated.`, `class notes (Samiha p13)`, 1, true),
  mc(`If the staff is tilted while taking a reading, the reading is:`, `Larger than the true one`, [`Smaller than the true one`, `Unchanged`, `Larger or smaller at random`], `A tilted staff cuts the horizontal line of sight at a longer slant length, so the reading is always too big.`, `class notes (Anzara p5)`, 2, true),
  mc(`For which distance did the class take readings to avoid the curvature correction?`, `Within about 70 m`, [`Within 7 m`, `Within 700 m`, `Within 150 ft`], `At 70 m the combined curvature and refraction effect is only 0.0673 × 0.07² ≈ 0.3 mm, negligible.`, `class notes (Quiz p1)`, 2, true),
  mc(`The combined correction for curvature and refraction (d in km, result in m) is:`, `0.0673 d²`, [`0.0785 d`, `0.0673 d`, `0.0112 d²`], `Curvature = 0.0785 d² and refraction = 1/7 of it (0.0112 d²), combined 0.0673 d², subtracted from the staff reading.`, `textbook`, 2, true),
  mc(`What does a digital level read automatically?`, `A barcode staff, showing the reading and the distance`, [`A graduated invar bar`, `A prism at the staff`, `A plumb bob line`], `The digital level stores readings in an electronic level book, with rise & fall or HI method as selected.`, `class notes (Quiz p1)`, 1, true),

  // ---- theodolite ----
  mc(`Which part centres the theodolite exactly over the station mark?`, `The optical plummet`, [`The plate level`, `The vertical clamp`, `The peep sight`], `Look through the plummet eyepiece, focus the reticle, then the ground mark; shift the foot screws until the mark is at the reticle centre.`, `lecture sheet p10`, 1, true),
  mc(`In the manual's levelling procedure the circular bubble is first centred by:`, `Adjusting the tripod leg lengths`, [`Turning the plate`, `Turning the foot screws A and B only`, `The vertical fine motion screw`], `The sheet says shorten the leg nearest the bubble or lengthen the one farthest, so the plummet mark stays near the centre.`, `lecture sheet p11`, 2, true),
  mc(`The plate level is centred precisely using:`, `Two foot screws A and B (plate turned parallel to them), then screw C after turning 90°`, [`The tripod legs`, `The circular level adjusting screws only`, `The horizontal fine motion screw`], `Plate parallel to A–B, centre; turn 90° and use C; repeat until the bubble stays central in all positions.`, `lecture sheet p11 (continuation from textbook)`, 2, true),
  mc(`The bubble of a plate level moves:`, `Towards a foot screw that is turned clockwise`, [`Away from a foot screw turned clockwise`, `Towards the telescope objective`, `Away from the plate level adjusting screw`], `As the sheet says, the bubble follows the foot screw turned clockwise (it follows the left thumb when both screws are turned inwards).`, `lecture sheet p11`, 2, true),
  mc(`A fine motion (tangent) screw works only when:`, `Its clamp is tightened`, [`Its clamp is loose`, `The instrument is on face right`, `The battery is removed`], `The clamp locks the motion first; then the tangent screw gives a small controlled movement.`, `textbook`, 1, true),
  mc(`Rotating the telescope only about the vertical axis changes:`, `The horizontal reading only`, [`The vertical reading only`, `Both readings`, `Neither reading`], `The horizontal circle turns with the upper plate; the vertical circle changes only when the telescope is tilted.`, `class notes (Samiha p15)`, 2, true),
  mc(`"Face left" means that the vertical circle is:`, `On the left of the telescope as seen from the eyepiece`, [`On the right of the telescope`, `Below the plate level`, `Covered by the battery`], `Face right is the opposite. Observing both faces and averaging removes instrument errors.`, `textbook`, 2, true),
  mc(`The 0 SET key of the digital theodolite:`, `Sets the horizontal angle display to 0° in the present direction`, [`Sets the vertical angle to 0° (level)`, `Switches the instrument off`, `Holds the vertical reading`], `Used to measure the angle between two points: sight the first, press 0 SET, then turn to the second.`, `lecture sheet p9`, 1, true),
  mc(`The least count of the class theodolite is:`, `10″`, [`1′`, `1″`, `1°`], `The class notes mark the theodolite precision as 10 seconds.`, `class notes (Samiha p14)`, 1, true),
  mc(`When the theodolite is used as a tacheometer the distance is found from:`, `D = k s + c, with s read between the upper and lower stadia hairs on the staff`, [`D = k s − c, with s the vertical angle`, `The horizontal angle multiplied by the staff reading`, `The plate level reading`], `k and c are the multiplying and additive constants; typically k = 100 and c = 0.`, `class notes (Quiz p19)`, 2, true),

  // ---- field book, level book ----
  mc(`In the class field-book strip, where do the chainages start?`, `At the bottom of the page, station A, reading upward`, [`At the top of the page, reading downward`, `At the left margin`, `At the centre of the page`], `Chainage 0+00 is written at the bottom with A and the page is read upward to B.`, `class notes (Quiz p12)`, 1, true),
  mc(`The chainage 2+35 in an engineer's chain field book is:`, `235 ft`, [`23.5 ft`, `2.35 ft`, `335 ft`], `Chain station notation: hundreds + feet, so 2 chains + 35 ft = 235 ft.`, `class notes (Quiz p12)`, 3, true),
  mc(`Bench mark RL = 100.000 m and back sight = 1.350 m. The height of instrument is:`, `101.350 m`, [`98.650 m`, `100.000 m`, `102.700 m`], `HI = RL + BS = 100.000 + 1.350 = 101.350 m.`, `textbook`, 3, true),
  mc(`With HI = 101.350 m, an intermediate staff reading of 2.100 m gives an RL of:`, `99.250 m`, [`103.450 m`, `98.150 m`, `99.250 ft`], `RL = HI − reading = 101.350 − 2.100 = 99.250 m.`, `textbook`, 3, true),
  mc(`BS 1.231 then the next reading 1.315 on the same set-up (rise & fall). The ground has:`, `Fallen by 0.084`, [`Risen by 0.084`, `Risen by 2.546`, `Fallen by 2.546`], `Previous reading − next reading = 1.231 − 1.315 = −0.084, a negative value means a fall.`, `lecture sheet p40 (level book sample numbers)`, 3, true),
  mc(`The arithmetic check of a level book is:`, `Σ BS − Σ FS = Σ Rise − Σ Fall = last RL − first RL`, [`Σ BS + Σ FS = Σ Rise + Σ Fall`, `Σ IS = Σ BS − Σ FS`, `Σ Rise = Σ Fall`], `Intermediate sights are not part of the check.`, `class notes (Quiz p16)`, 2, true),

  // ---- blanks ----
  bl(`An engineer's chain has ___ links.`, [`100`, `one hundred`], `Each link is 1 ft long, so the chain is 100 ft.`, `class notes (Nafim p1)`, 1, true),
  bl(`A Gunter's chain is ___ ft long.`, [`66`, `sixty six`], `Gunter's chain is 66 ft with 100 links of 7.92 in each.`, `textbook`, 1, true),
  bl(`The two mirrors of an optical square are inclined at ___ degrees.`, [`45`, `45°`, `45 deg`, `45 degrees`], `The ray is turned through twice this angle, 90°.`, `class notes (Theory p2)`, 1, true),
  bl(`The line of sight of an optical square is turned through ___ degrees.`, [`90`, `90°`, `90 deg`, `90 degrees`], `This gives the perpendicular offset direction.`, `class notes (Quiz facts 16)`, 1, true),
  bl(`The telescopic levelling staff of the class is ___ m long when fully extended.`, [`5`, `5 m`, `five`], `Maximum 5 m, least graduation 5 mm.`, `class notes (Samiha p13)`, 1, true),
  bl(`The smallest graduation of the levelling staff is ___ mm.`, [`5`, `5 mm`, `five`], `Readings are estimated between graduations.`, `class notes (Samiha p13)`, 1, true),
  bl(`The apparent movement of the staff image against the cross-hairs when the eye is moved is called ___.`, [`parallax`], `It is removed by correct focusing of eyepiece and objective.`, `lecture sheet p7`, 1, true),
  bl(`To remove parallax, first focus the ___ on the cross-hairs.`, [`eyepiece`, `eye piece`], `Then focus the objective on the staff, and check by moving the eye.`, `lecture sheet p7`, 2, true),
  bl(`The theodolite is centred over a station mark with the help of its ___.`, [`optical plummet`, `plummet`, `optical plumb`, `plumb bob`], `The plummet is a small telescope looking down the vertical axis.`, `lecture sheet p10`, 1, true),
  bl(`In class the theodolite least count is ___ seconds.`, [`10`, `ten`, `10″`], `Marked as "precision = 10 sec" in the class notes.`, `class notes (Samiha p14)`, 1, true),
  bl(`At each plane-table station the three operations are levelling, centring and ___.`, [`orientation`, `orienting`], `Done in the order L, C, O.`, `class notes (Quiz p13)`, 1, true),
  bl(`In D = k s + c, the multiplying constant k is usually ___.`, [`100`, `one hundred`], `Found by calibration over a measured line.`, `class notes (Quiz p19)`, 1, true),
  bl(`The staff reading taken on a point of known RL right after setting up the level is the ___ sight.`, [`back`, `backsight`, `back sight`], `HI = RL + back sight.`, `textbook`, 1, true),
  bl(`The point where the level is shifted, with a fore sight and then a back sight, is the ___ point.`, [`change`, `turning`, `change point`, `turning point`], `It links two set-ups of the instrument.`, `class notes (Theory p11)`, 1, true),
  bl(`With the telescope horizontal, the vertical angle V shown by the class theodolite is ___ degrees.`, [`90`, `90°`, `90 deg`, `90 degrees`], `Zenith-type vertical circle: 0° straight up.`, `class notes (Samiha p14)`, 2, true),

  // ---- true / false ----
  tf(`Offsets in the class chain survey are measured with the chain.`, false, `A tape is used: it is more accurate over the short offset lengths.`, `class notes (Samiha p2)`, 1, true),
  tf(`Ranging is needed when a line is longer than one chain.`, true, `Intermediate ranging rods keep the chain on the line.`, `class notes (Theory p2)`, 1, true),
  tf(`A tilted levelling staff always gives a reading larger than the true one.`, true, `The line of sight meets the tilted staff higher up its length.`, `class notes (Anzara p5)`, 2, true),
  tf(`An automatic level has to be levelled with a long tubular bubble before every reading.`, false, `Only the circular bubble is centred; the compensator then makes the line of sight horizontal.`, `lecture sheet p7`, 2, true),
  tf(`Centring over the station is not needed for an automatic level when only levelling.`, true, `Only levelling matters; the level need not be over a mark.`, `class notes (Anzara p5)`, 1, true),
  tf(`In the surveyor's compass the graduated card is attached to the needle.`, false, `That is the prismatic compass; in the surveyor's compass the card is fixed to the box.`, `textbook`, 2, true),
  tf(`A trough compass gives true north directly.`, false, `It gives magnetic north; correct for declination to get true north.`, `class notes (Samiha p11)`, 1, true),
  tf(`A change point needs both a fore sight and a back sight.`, true, `The FS closes the old set-up and the BS opens the new one.`, `class notes (Theory p11)`, 1, true),
  tf(`The U-fork carries a plumb bob that is used to centre the plane table.`, true, `The plumb bob hangs from the fork's lower arm over the ground mark.`, `class notes (Nafim p2)`, 1, true),
  tf(`The battery should be mounted in the digital theodolite before levelling.`, true, `Fitting it afterwards tilts the instrument slightly and spoils the levelling.`, `lecture sheet p10`, 2, true),
  tf(`Turning the telescope about the vertical axis changes the vertical circle reading.`, false, `Only tilting the telescope changes it.`, `class notes (Samiha p15)`, 2, true),
  tf(`The digital level reads a barcode staff and has an electronic level book.`, true, `It computes rise & fall or HI automatically.`, `class notes (Quiz p1)`, 1, true),
  tf(`In a level book, intermediate sights are included in the check Σ BS − Σ FS.`, false, `Only BS and FS (change point) readings are in the check.`, `class notes (Quiz p16)`, 2, true),
  tf(`The combined curvature and refraction correction in levelling is added to the staff reading.`, false, `It is subtracted (curvature dominates); for 70 m it is negligible anyway.`, `class notes (Quiz p1), textbook`, 3, true),
]

const cards = [
  [`What is an engineer's chain and how is it made?`, `A 100 ft chain of 100 links, each 1 ft long, joined by three rings for bending. The end links carry handles. Tags every 10 ft, the round one at 50 ft.`, `class notes`],
  [`How do you read a chain at the end of a line?`, `Count the tallies from the last arrow plus the extra links. The follower's arrows are the whole chains. Together they give the chainage, like 3+45.`, `class notes (Samiha p6)`],
  [`Why do you use a tape for offsets and a chain for the triangle?`, `Offsets are short and need accuracy, so we use a tape. The long main lines are chained because the chain is rugged and quick for long distances.`, `class notes (Samiha p2)`],
  [`What is ranging and when is it needed?`, `Ranging is fixing intermediate points on the straight line between two end stations, using ranging rods. It is needed when a line is longer than one chain.`, `class notes`],
  [`What does the optical square do and how does it work?`, `It gives a right angle. Two plane mirrors sit at 45° to each other, so a ray reflected twice turns through 90°. When the far rod and the object's image coincide, I drop the plumb bob to mark the foot.`, `class notes (Theory p2)`],
  [`How else can you find the foot of the perpendicular?`, `The 3-4-5 method with a tape, or the swing method. I swing the tape from the object to cut the line at two points; the mid-point is the foot.`, `class notes`],
  [`Prismatic compass or surveyor's compass: which reads what?`, `The prismatic compass reads whole circle bearing 0 to 360° through a prism, with the card fixed to the needle. The surveyor's compass reads quadrantal bearings with a fixed card.`, `textbook`],
  [`What does the trough compass tell you?`, `Magnetic north. I use it on the plane table to draw the N–S line for orientation. True north needs the declination applied.`, `class notes (Samiha p11)`],
  [`What are the plane-table operations at a station?`, `L, C, O: Level it with the spirit level in two directions, Centre it with the U-fork and plumb bob, then Orient it by compass or back ray. Orientation is last.`, `class notes (Quiz p13)`],
  [`Name the parts of the automatic level.`, `Reflector, peep sight, circular level and its adjusting screw, foot screws, base plate, horizontal fine motion screw, objective, focusing knob, circle ring and window, reticle cover, eyepiece.`, `lecture sheet p7`],
  [`How do you set up the auto level?`, `Extend the legs to eye level, spread them to a triangle, tripod head roughly level, shoes pressed in. Fix the instrument with the centring screw. Centre the circular bubble with the foot screws.`, `lecture sheet p7`],
  [`How do you focus and sight the level? What is parallax?`, `Aim with the peep sight, sharpen the cross-lines with the eyepiece, focus the staff with the knob. Move my eye: if the reading shifts, that is parallax. I refocus until it is gone.`, `lecture sheet p7`],
  [`What is the compensator?`, `It is a hanging prism system in the auto level. Once the circular bubble is centred it keeps the line of sight horizontal, so no long bubble is needed.`, `textbook`],
  [`Why must the staff be vertical?`, `A tilted staff always gives a larger reading, so the RL comes out wrong. I rock it slowly back and forth and take the minimum reading.`, `class notes`],
  [`What is the staff like?`, `A telescopic staff, three sections, 5 m when open, graduated to 5 mm. I estimate the millimetres between the marks.`, `class notes (Samiha p13)`],
  [`Name the parts of the digital theodolite.`, `Optical plummet, circular level, plate level, foot screws, horizontal and vertical clamps with fine-motion screws, telescope with focusing ring, operation panel and display, tubular compass slot, instrument height mark.`, `lecture sheet p8`],
  [`How do you centre the theodolite?`, `Set the tripod over the mark, fix the instrument, focus the plummet on the reticle and the mark. Use the foot screws to bring the mark to the reticle centre.`, `lecture sheet p10`],
  [`How do you level the theodolite?`, `Centre the circular bubble with tripod leg lengths. Then turn the plate parallel to two foot screws, centre the plate bubble, turn 90° and use the third screw. Repeat, and check the plummet again.`, `lecture sheet p11`],
  [`Which way does the bubble move?`, `The bubble moves towards a foot screw that I turn clockwise. It follows the left thumb when I turn two screws together.`, `lecture sheet p11`],
  [`What do the 0 SET and HOLD keys do?`, `0 SET sets the horizontal angle to zero in the present direction. HOLD freezes or releases the horizontal reading so I can set the circle to a chosen value.`, `lecture sheet p9`],
  [`What is face left and face right?`, `Face left means the vertical circle is on the left of the telescope. Face right is after transiting and turning 180°. I average both to cancel instrument errors.`, `textbook`],
  [`What is the least count of your theodolite?`, `Ten seconds in class. The vertical circle reads 90° when the telescope is horizontal, a zenith-type circle.`, `class notes (Samiha p14)`],
  [`How do you use the theodolite as a tacheometer?`, `Read the upper and lower stadia hairs on the staff to get s. Then D = k s + c with k = 100, c = 0 from our calibration. Bearing comes from the horizontal circle.`, `class notes (Quiz p19)`],
  [`What is a change point and why is the staff kept in place?`, `It is the point where I take a fore sight, shift the level, and take a back sight. The staff stays so the same point and RL carry the levels to the new set-up.`, `class notes (Theory p11)`],
  [`How does the field book look?`, `A double-line strip. Station A and chainage 0+00 at the bottom, read upward. Offsets are short lines to the left or right with their length beside, objects as circles, fixed objects as squares.`, `class notes (Quiz p12)`],
]

export const content: SvTopicContent = {
  questions,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'Chain, tape and the small kit',
      md: `| Item | Fact to remember |
|---|---|
| Engineer's chain | 100 ft, 100 links of 1 ft; tags every 10 ft, round tag at 50 ft |
| Gunter's chain | 66 ft, 100 links of 0.66 ft (7.92 in); 80 chains = 1 mile |
| Metric chain | 20 m (100 links) or 30 m (150 links), link = 0.2 m |
| Arrows | set of 10, one dropped per chain length; follower's arrows = whole chains |
| Ranging rod | 2 m or 3 m, red/white bands; fixes intermediate points on a line |
| Tape | offsets; invar is the most accurate, cloth the least |
| Peg | wooden peg at each main station; on a pavement tie it to 3 permanent objects |

- Chain for the long main lines, **tape for offsets** (more accurate).
- Chainage 1+20 = 1 chain + 20 ft = 120 ft. Count tallies plus extra links.
- A chain gets shorter when links bend or mud clogs joints; longer when it wears or stretches.`,
    },
    {
      title: 'Optical square, cross staff and compasses',
      md: `- **Optical square**: two plane mirrors at 45°, deviation $2\\times 45^\\circ=90^\\circ$. Object's image and far ranging rod in one vertical line, then drop the plumb bob = foot of the perpendicular.
- Other ways to the foot: **3-4-5** and **swing** (mid-point of the two cuts).
- **Prismatic compass**: whole circle bearing 0–360°, card fixed to the needle, inverted figures read through the prism, object vane with hair, eye vane with slit, lifting pin and brake pin, least count 30′.
- **Surveyor's compass**: quadrantal bearings, fixed card, no prism.
- **Trough compass**: long narrow box for the magnetic N–S line on the plane table. Magnetic north, not true north; true needs declination.
- **French cross staff**: octagonal box with eight slits at 45°.`,
    },
    {
      title: 'Plane table',
      md: `Parts: table + tripod, **alidade** (draws the ray), **U-fork with plumb bob** (centres), **spirit level** (two directions, four corners), **trough compass** (orientation).

Order at each station: **L**evel, **C**entre, **O**rient. Orientation is last.

- First station X: orient with the trough compass N–S line.
- Second station Y: orient by back ray to X.
- Keep the alidade on the same side of the point for every ray.`,
    },
    {
      title: 'Auto level and staff',
      md: `**Parts (lecture sheet p7):** 1 reflector, 2 peep sight, 3 circular level adjusting screw, 4 circular level, 5 foot screws, 6 base plate, 7 horizontal fine motion screw, 8 objective, 9 focusing knob, 10 circle positioning ring, 11 circle window, 12 reticle cover, 13 eyepiece.

**Temporary adjustments:** set up → level up (circular bubble, foot screws) → focus (eyepiece on cross-hairs, objective on staff, kill parallax).

- Auto level has a **compensator**; the dumpy has its telescope fixed to the spindle.
- Telescopic staff: **5 m**, least count **5 mm**, hold it vertical (tilt gives larger reading, take the minimum when rocking).
- Curvature and refraction: $0.0673\\,d^2$ (d in km, result in m), subtracted. Within about 70 m it is negligible.
- Levelling does not need centring over a mark.`,
    },
    {
      title: 'Theodolite and the books',
      md: `**Parts (manual p8):** handle, instrument height mark, battery cover, operation panel, display, shifting (tribrach) clamp, base plate, foot screws, circular level and its screws, optical plummet (eyepiece, reticle cover, focusing ring), objective, tubular compass slot, horizontal clamp and fine motion, plate level and its screw, vertical clamp and fine motion, telescope eyepiece and focusing ring, peep sight, centre mark.

- Measures **horizontal and vertical angles**; vertical V = 90° when horizontal; class least count **10″**.
- Keys: **0 SET** = horizontal angle zero; **HOLD** = hold or release horizontal reading.
- Face left: vertical circle on the left; face right after transiting and turning 180°.
- As a tacheometer: $D=ks+c$, with $k=100$, $c=0$.

**Level book:** $HI=RL+BS$, $RL=HI-\\text{reading}$. Check $\\sum BS-\\sum FS=\\sum\\text{Rise}-\\sum\\text{Fall}=RL_{last}-RL_{first}$.

**Field book:** strip, A and 0+00 at the bottom, offsets left or right with lengths, main station triangle, object circle, fixed object square.`,
    },
  ],
  steps: [
    `Check the issued instruments: look for loose screws, damaged glass, a bent chain or a bent staff; report defects to the teacher before use.`,
    `**Auto level:** unbuckle the tripod band and loosen the leg clamps; extend the legs so the head is near eye level and tighten the clamps.`,
    `Spread the legs so the tips form a regular triangle; keep the head roughly level; press the shoes firmly into the ground.`,
    `Put the level on the head and tighten the centring screw.`,
    `Centre the circular bubble with the three foot screws (bubble moves towards a screw turned clockwise).`,
    `Aim with the peep sight; turn the eyepiece until the cross-lines are just sharp; centre the staff with the fine motion screw; focus the staff with the knob.`,
    `Move your eye slightly up and down. If the reading shifts there is parallax: refocus the eyepiece and the knob until there is none.`,
    `Read the three digits and estimate the millimetre; the staffman keeps the staff vertical (rock it, take the minimum).`,
    `**Theodolite:** mount the battery first (fitting it later tilts the instrument).`,
    `Set the tripod head over the station mark with legs at equal spacing and the head roughly level; press the shoes in.`,
    `Fix the instrument with the centring screw; focus the plummet eyepiece on the reticle, then the focusing ring on the mark.`,
    `Use the foot screws to bring the mark to the centre of the reticle.`,
    `Centre the circular bubble by changing the tripod leg lengths: shorten the leg near the bubble or lengthen the opposite one.`,
    `Loosen the horizontal clamp; turn the plate until the plate level is parallel to foot screws A and B; centre the bubble with A and B.`,
    `Turn the plate 90°, centre the bubble with screw C; repeat until the bubble stays central in both directions.`,
    `Check the plummet again. If the mark has moved, loosen the centring screw slightly, slide the instrument over the mark and relevel.`,
    `Press 0 SET after sighting the first object to start a horizontal angle from zero; set the vertical circle by tilting the telescope, V = 90° when horizontal.`,
    `Enter data at once in the field book (chainage at the bottom) or in the level book (BS, IS, FS columns) and do the check before leaving the site.`,
  ],
  submit: [
    `Every sheet needs the title of the survey and course no. (CE 104), your name, roll, group number and the date of performance.`,
    `Legend for every symbol used (main station triangle, object circle, fixed object square).`,
    `North–south line, a numerical scale and a graphical scale.`,
    `A half inch border around the sheet.`,
    `Field book pages and the level book with its arithmetic check, submitted with the work.`,
    `For instruments day itself: the instruments are checked and returned and the field data are shown to the teacher.`,
  ],
  traps: [
    `Using the chain for offsets instead of a tape.`,
    `Forgetting the optical plummet focus order: reticle first, then the ground mark.`,
    `Mounting the theodolite battery after levelling, which tilts the instrument.`,
    `Taking readings with parallax still present.`,
    `Holding the staff tilted, so the reading is too large.`,
    `Writing the field book from the top. A and 0+00 go at the bottom.`,
    `Reading a chain wrong: whole chains from the follower's arrows, not the leader's.`,
    `Taking true north from a compass without correcting declination.`,
  ],
  carry: [
    `Field book and level book`,
    `Pencil (H or HB), eraser, sharpener`,
    `Scientific calculator`,
    `Scale (30 cm) and set squares`,
    `A2 / A3 graph paper (as announced) and a drawing board`,
    `Permanent marker and cello tape`,
    `Issued instruments card for checking`,
  ],
}
