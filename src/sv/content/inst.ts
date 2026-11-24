// Instruments (quiz on 25 Nov): the parts of each instrument, what each part does, and how the instrument is handled.
// No calculations here (the user asked for none in this section). Two kinds of questions:
//  - written ones (ids q-ins-N): functions, handling, set-up order, true/false;
//  - generated from the labelled drawings in figs/instFigs.tsx (ids q-ifig-N): name the part, what it does, true/false.
// Rechecked 24 Nov against the lecture sheet (pp 7–11), the class notes and the textbook.
import { createElement } from 'react'
import { FIGS, PartsExplorer, type FigId } from '../figs/instFigs'
import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-inst' as const
const ID = 'ins'
let n = 0
const nid = () => `q-${ID}-${++n}`

/** mcq: the correct option is inserted at a rotating index so answers spread over 0-3 */
const mc = (q: string, right: string, wrong: [string, string, string], why: string, src: string, lvl: 1 | 2 | 3 = 1): SvQuestion => {
  const id = nid()
  const pos = n % 4
  const opts = [...wrong]
  opts.splice(pos, 0, right)
  return { id, topic: T, kind: 'mcq', q, opts, a: pos, why, src, lvl }
}
const tf = (q: string, a: boolean, why: string, src: string, lvl: 1 | 2 | 3 = 1): SvQuestion => ({ id: nid(), topic: T, kind: 'tf', q, a, why, src, lvl })
const bl = (q: string, a: string[], why: string, src: string, lvl: 1 | 2 | 3 = 1): SvQuestion => ({ id: nid(), topic: T, kind: 'blank', q, a, why, src, lvl })

const written: SvQuestion[] = [
  // ---- chain ----
  mc(`An engineer's chain is:`, `100 ft long, with 100 links of 1 ft`, [`66 ft long, with 100 links of 0.66 ft`, `20 m long, with 100 links of 0.2 m`, `100 ft long, with 66 links`], `The class chain is the engineer's chain. Gunter's is 66 ft; the metric chains are 20 m and 30 m.`, `class notes (Nafim p1, Samiha p2)`),
  mc(`The three small rings between two links of a chain are there to:`, `Let the chain bend freely without kinking`, [`Mark every 10 ft`, `Hold the arrows`, `Make each link exactly 1 ft by adding length`], `Class notes: "3 circles for bending".`, `class notes (Samiha p2)`),
  mc(`Why is there a swivel joint at each handle of the chain?`, `So the chain can turn without twisting`, [`So the handle can be removed`, `To mark the 50 ft point`, `To hold the chain on the ground`], `The swivel lets the handle rotate while the links stay untwisted.`, `textbook`, 2),
  mc(`The length of a chain is measured:`, `From the outer edge of one handle to the outer edge of the other`, [`From the first link to the last link, without the handles`, `From the inner edge of one handle to the inner edge of the other`, `Between the two round tallies`], `The handles are part of the first and last links, so the zero is the outer edge of the handle.`, `textbook`, 2),
  mc(`On an engineer's chain the tallies are fixed:`, `Every 10 links`, [`Every link`, `Every 5 links`, `Only at 50 ft`], `Brass tallies at 10, 20, 30, 40 (1–4 teeth), round at 50, then 4, 3, 2, 1 teeth again.`, `class notes (Nafim p1)`),
  mc(`Which tally marks the middle of an engineer's chain?`, `The round tally`, [`The tally with one tooth`, `The tally with four teeth`, `The handle`], `50 ft is the round tag; the teeth count rises towards the middle.`, `class notes (Nafim p1, Samiha p6)`),
  mc(`A tally with three teeth on an engineer's chain marks:`, `30 ft from one end (70 ft from the other)`, [`3 ft`, `30 links from the middle`, `The middle`], `The tallies are symmetric: 30 ft from either handle has three teeth.`, `class notes + textbook`, 2),
  mc(`What are the tallies for?`, `Reading the chain quickly without counting every link`, [`Joining the links`, `Holding the chain straight`, `Fixing the chain to the arrows`], `Class notes: chain reading = number of tallies + the extra links.`, `class notes (Samiha p6)`),
  mc(`In the class chain survey the chain is used for:`, `The main lines that form the triangle`, [`The offsets`, `The heights of objects`, `Levelling the ground`], `Chain for the triangle (long lines); tape for the offsets because it is more accurate.`, `class notes (Samiha p2)`),
  tf(`The tally at 40 ft and the tally at 60 ft of an engineer's chain look the same.`, true, `Both have four teeth: the tallies repeat from either end.`, `textbook`, 2),
  tf(`The handles are not included in the length of the chain.`, false, `The length runs from the outer edge of one handle to the outer edge of the other.`, `textbook`, 2),
  tf(`Each link of an engineer's chain is 1 ft long.`, true, `100 links × 1 ft = 100 ft.`, `class notes (Nafim p1)`),
  tf(`A Gunter's chain is 100 ft long.`, false, `It is 66 ft (100 links of 7.92 in). The 100 ft one is the engineer's chain.`, `textbook`),
  bl(`An engineer's chain has ___ links.`, [`100`, `one hundred`], `Each link is 1 ft long.`, `class notes (Nafim p1)`),
  bl(`The middle (50 ft) tally of an engineer's chain is ___ in shape.`, [`round`, `circular`], `The others have 1 to 4 teeth.`, `class notes (Nafim p1)`),
  bl(`The links of a chain are joined by three small ___ so it can bend.`, [`rings`, `ring`, `circles`, `oval rings`], `Class notes: 3 circles for bending.`, `class notes (Samiha p2)`),

  // ---- tape ----
  mc(`Offsets in the class chain survey are measured with:`, `A tape, because it is more accurate`, [`The chain, because it is stronger`, `A ranging rod`, `The optical square`], `The chain forms the triangle; the short offsets are taped.`, `class notes (Samiha p2)`),
  mc(`Which tape is the most accurate?`, `Invar tape`, [`Cloth (linen) tape`, `Metallic tape`, `Fibreglass tape`], `Invar (a nickel steel) hardly changes length with temperature.`, `textbook`, 2),
  mc(`Which tape is the least accurate?`, `Cloth (linen) tape`, [`Steel tape`, `Invar tape`, `Metallic tape`], `Cloth stretches and shrinks with pull and moisture.`, `textbook`, 2),
  tf(`A "metallic" tape is a steel tape.`, false, `It is a cloth tape with fine brass or copper wires woven in to stop stretching.`, `textbook`, 2),
  tf(`A tape is more accurate than a chain for short lengths such as offsets.`, true, `That is why the class tapes the offsets.`, `class notes (Samiha p2)`),

  // ---- arrows, ranging rods, pegs, plumb bob ----
  mc(`What is an arrow used for?`, `Marking the end of each chain length on the ground`, [`Showing the north direction`, `Measuring offsets`, `Hanging the plumb bob`], `The leader pins an arrow at each chain end; the follower picks them up, so the arrows count the chains.`, `class notes (Samiha p4)`),
  mc(`How many arrows come with one chain?`, `10`, [`2`, `5`, `20`], `A chain is issued with a set of 10 arrows.`, `textbook`),
  mc(`Why is a piece of red cloth tied to the ring of an arrow?`, `So the arrow can be seen easily`, [`To mark it as the 50 ft arrow`, `To keep it from rusting`, `To measure the wind`], `Arrows are small; the cloth makes them easy to spot in grass.`, `textbook`),
  mc(`A ranging rod is mainly used to:`, `Mark stations and keep the chain on a straight line between them`, [`Measure the length of a line`, `Level the instrument`, `Measure angles`], `Class notes: the ranging rod is used so the chain stays straight; ranging is needed when a line is longer than one chain.`, `class notes (Theory p2, Nafim p2)`),
  mc(`A ranging rod is usually:`, `2 m or 3 m long, painted in red and white bands`, [`5 m long, plain white`, `1 m long with a hook`, `30 m long, rolled in a case`], `Bands of 20 cm make it visible; the iron shoe lets it stand in the ground.`, `textbook`),
  mc(`Ranging is needed when a line is:`, `Longer than one chain`, [`Shorter than one chain`, `On a slope only`, `Measured with a tape`], `Intermediate rods keep each chain length on the line.`, `class notes (Theory p2)`),
  mc(`What marks a main station of the chain survey on soil?`, `A wooden peg`, [`An arrow`, `A plumb bob`, `A chalk mark`], `Wooden pegs are driven at the main stations.`, `class notes (Quiz p9, Samiha p3)`),
  mc(`A station on a pavement, where a peg cannot be driven, is fixed by:`, `Tying it to three permanent objects`, [`Leaving an arrow there`, `Drawing it on the field book only`, `Holding a ranging rod there all day`], `Three ties locate it again; the third is a check.`, `class notes (Theory p1, lecture sheet p3)`, 2),
  mc(`Which is NOT a use of the plumb bob?`, `Levelling the plane table`, [`Centring an instrument over a station`, `Dropping the foot of the perpendicular from the optical square`, `Checking that a ranging rod is vertical`], `The plane table is levelled with the spirit level; the plumb bob gives a vertical line.`, `class notes + textbook`, 2),
  tf(`A ranging rod can be used to measure the length of a line.`, false, `It only marks points; lengths are chained or taped.`, `class notes`),
  tf(`The follower's arrows show how many whole chains have been measured.`, true, `Each arrow picked up is one chain length behind.`, `class notes (Samiha p4)`),
  tf(`The pointed iron shoe at the bottom of a ranging rod lets it be pushed into the ground.`, true, `The rod then stands vertical on its own.`, `textbook`),
  bl(`A ___ is driven into the ground to mark a main station.`, [`peg`, `wooden peg`], `On pavement the station is tied to three permanent objects instead.`, `class notes (Samiha p3)`),
  bl(`The leader places an ___ at the end of every chain length.`, [`arrow`, `arrows`], `A set of 10 goes with the chain.`, `class notes (Samiha p4)`),

  // ---- optical square ----
  mc(`The optical square is used to:`, `Set out a right angle and find the foot of a perpendicular`, [`Measure the length of an offset`, `Measure bearings`, `Level the ground`], `It gives the perpendicular from the chain line to an object.`, `class notes (Theory p2)`),
  mc(`The two mirrors of an optical square are inclined to each other at:`, `45°`, [`30°`, `60°`, `90°`], `A ray reflected by two mirrors turns through twice the angle between them: 2 × 45° = 90°.`, `class notes (Theory p2)`),
  mc(`In an optical square, the half-silvered mirror is the:`, `Horizon glass`, [`Index glass`, `Eye hole`, `Prism`], `Its clear half shows the ranging rod directly, its silvered half shows the object's image.`, `textbook`, 2),
  mc(`You are at the foot of the perpendicular when, through the optical square:`, `The object's image is exactly in line with the ranging rod seen directly`, [`The object is seen through both mirrors together`, `The bubble is centred`, `The image appears upside down`], `Image and rod line up only when the object is at 90° to the chain line.`, `textbook`, 2),
  mc(`After lining up the image with the ranging rod, the foot of the perpendicular is marked by:`, `Dropping a plumb bob from the optical square`, [`Driving a ranging rod there`, `Reading the chain`, `Pacing the distance`], `Class notes: plumb bob dropped to mark the point.`, `class notes (Theory p2, Samiha p7)`),
  mc(`Which three ways of finding the foot of the perpendicular were taught?`, `3-4-5 method, swing method and optical square`, [`Plumb bob, spirit level and compass`, `Optical square, ranging and plane table`, `Swing method, theodolite and staff`], `The optical square is starred as most important.`, `class notes (Theory p2)`),
  tf(`The index glass of an optical square is half silvered.`, false, `The index glass is fully silvered; the horizon glass is half silvered.`, `textbook`, 2),
  tf(`The optical square is a hand instrument: no tripod is needed.`, true, `It is held at eye level over the chain line.`, `textbook`),
  tf(`The optical square turns the line of sight through 90°.`, true, `Twice the 45° between the mirrors.`, `class notes (Quiz facts)`),
  bl(`The two mirrors of the optical square are at ___ degrees to each other.`, [`45`, `45°`, `45 deg`, `45 degrees`], `The ray is turned through twice this, 90°.`, `class notes (Theory p2)`),
  bl(`The fully silvered mirror of the optical square is called the ___ glass.`, [`index`, `index glass`], `The half-silvered one is the horizon glass.`, `textbook`, 2),

  // ---- compasses ----
  mc(`A prismatic compass reads bearings as:`, `Whole circle bearings, 0° to 360°`, [`Quadrantal bearings, 0° to 90°`, `Vertical angles`, `Angles from the previous line only`], `The ring is graduated 0–360°.`, `class notes (Quiz facts), textbook`),
  mc(`In a prismatic compass the graduated ring is attached to:`, `The magnetic needle`, [`The box`, `The eye vane`, `The tripod`], `So the ring stays fixed in direction while the box with the vanes is turned to the object.`, `textbook`, 2),
  mc(`Why are the figures on a prismatic compass ring written upside down?`, `The prism inverts them, so they appear upright when read through it`, [`The ring turns over in use`, `So that they read as reduced bearings`, `To read them in a mirror on the object vane`], `The prism magnifies and erects the image of the graduations.`, `textbook`, 2),
  mc(`In a prismatic compass, sighting the object and reading the bearing are done:`, `At the same time, through the slit and the prism`, [`One after the other, from the top of the box`, `With two people, one at each vane`, `Only after the needle is clamped`], `This is the advantage of the prismatic compass over the surveyor's compass.`, `textbook`, 2),
  mc(`The lifting pin of a prismatic compass:`, `Lifts the needle off the pivot when the object vane is folded`, [`Lifts the prism for focusing`, `Stops the ring swinging`, `Holds the mirror up`], `This stops the pivot wearing while the compass is carried.`, `textbook`, 2),
  mc(`The brake pin of a prismatic compass is pressed to:`, `Stop the ring swinging so it settles quickly`, [`Lift the needle off the pivot`, `Focus the prism`, `Fold the object vane`], `A light touch damps the oscillations before reading.`, `textbook`, 2),
  mc(`The mirror on the object vane of a prismatic compass is used to:`, `Sight objects well above or below the compass`, [`Read the graduations`, `Reflect sunlight on the needle`, `Check the box is level`], `It slides and tilts on the vane.`, `textbook`, 2),
  mc(`The focusing stud of a prismatic compass:`, `Moves the prism to bring the graduations into focus`, [`Fixes the compass to the stand`, `Lifts the needle`, `Turns the ring to zero`], `Each observer adjusts it for their own eye.`, `textbook`, 2),
  mc(`Least count of an ordinary prismatic compass:`, `30′`, [`1′`, `10″`, `1°`], `Graduated in half degrees.`, `textbook`),
  mc(`The surveyor's compass differs from the prismatic compass because:`, `Its graduated card is fixed to the box, it reads quadrantal bearings and it has no prism`, [`Its ring is fixed to the needle`, `It reads whole circle bearings through a prism`, `It has no sight vanes`], `The reading is taken by looking down at the north end of the needle.`, `textbook`, 2),
  mc(`The trough compass is used with the plane table to:`, `Draw the magnetic north line and orient the board`, [`Level the board`, `Centre the board`, `Measure distances`], `It is a long narrow box laid on the sheet.`, `class notes (Samiha p11, Quiz p13)`),
  tf(`A trough compass shows true north directly.`, false, `It shows magnetic north; apply the declination for true north.`, `class notes (Samiha p11)`),
  tf(`In the surveyor's compass the graduated card is attached to the needle.`, false, `That is the prismatic compass; the surveyor's compass card is fixed to the box.`, `textbook`, 2),
  tf(`Steel tapes, chains and keys should be kept away from a compass while reading it.`, true, `Iron nearby pulls the needle (local attraction).`, `textbook`),
  tf(`On the surveyor's compass card, E and W are interchanged.`, true, `So that the needle reads the correct quadrant as the box turns.`, `textbook`, 2),
  tf(`The prismatic compass is read by looking down through the glass cover from above.`, false, `It is read through the prism while sighting; the surveyor's compass is read from above.`, `textbook`, 2),
  bl(`A prismatic compass reads ___ circle bearings.`, [`whole`, `whole circle`], `0° to 360°, clockwise from north.`, `class notes`),
  bl(`The ___ pin lifts the needle off the pivot when the compass is not in use.`, [`lifting`, `lifting pin`], `Folding the object vane presses it.`, `textbook`, 2),

  // ---- plane table ----
  mc(`At each plane-table station the three operations, in order, are:`, `Levelling, centring, orientation`, [`Orientation, levelling, centring`, `Centring, orientation, levelling`, `Levelling, orientation, centring`], `Class notes write L → C → O; orientation is last because moving the table spoils it.`, `class notes (Quiz p13)`),
  mc(`The plane table is centred over the station with:`, `The U-fork and plumb bob`, [`The spirit level`, `The trough compass`, `The alidade`], `The U-fork tip is on the plotted point; its plumb bob hangs over the ground mark.`, `class notes (Quiz p13, Samiha p11)`),
  mc(`The plane table is levelled with:`, `The spirit level, checked in two directions`, [`The U-fork`, `The trough compass`, `The alidade's hair`], `Class notes: level it at the four corners.`, `class notes (Quiz p13, Samiha p10)`),
  mc(`The alidade is used to:`, `Sight the object and draw the ray along its edge`, [`Centre the table`, `Level the table`, `Find magnetic north`], `Its fiducial edge passes through the station point.`, `class notes (Samiha p12)`),
  mc(`The edge of the alidade along which rays are drawn is the:`, `Fiducial edge`, [`Object vane`, `Sight vane`, `Index edge`], `It is the bevelled working edge of the ruler.`, `textbook`, 2),
  tf(`In plane tabling, the alidade is kept on the same side of the station point for every ray.`, true, `Class notes: always on the right or always on the left.`, `class notes (Quiz p13)`, 2),
  tf(`Orientation of the plane table is done before levelling.`, false, `Level → centre → orient; orientation is last.`, `class notes (Quiz p13)`),
  tf(`At the second plane-table station the board can be oriented by back-sighting the first station.`, true, `Lay the alidade on the drawn line to the first station and turn the board until it is sighted.`, `class notes (Samiha p12), textbook`, 2),
  bl(`The plane table is centred using the U-fork and a ___.`, [`plumb bob`, `plumb`, `plumbbob`], `The bob hangs over the ground station.`, `class notes (Nafim p2)`),

  // ---- tripod and automatic level ----
  mc(`Setting up the tripod (lecture sheet p7). Which comes first?`, `Unbuckle the band and loosen the extension clamp screws`, [`Tighten the centring screw`, `Centre the circular bubble`, `Turn the eyepiece`], `Then extend the legs to eye level, spread the tips into a regular triangle, keep the head roughly level and press the shoes in.`, `lecture sheet p7`, 2),
  mc(`The tripod legs are spread so that their tips form:`, `A regular triangle on the ground`, [`A straight line`, `A right-angled triangle with one leg towards the staff`, `Any shape, as long as the head is level`], `A regular triangle gives a steady set-up.`, `lecture sheet p7`),
  mc(`The instrument is fixed to the tripod head with the:`, `Centring screw`, [`Extension clamp screw`, `Foot screw`, `Fine motion screw`], `Hold the instrument with one hand and tighten the centring screw under the head.`, `lecture sheet p7, p10`),
  mc(`The circular bubble of the auto level is centred with:`, `The three levelling foot screws`, [`The focusing knob`, `The horizontal fine motion screw`, `The circular level adjusting screw`], `Lecture sheet step 8: adjust the foot screws (5) until the bubble is in the centre circle.`, `lecture sheet p7`),
  mc(`What makes an automatic level "automatic"?`, `A compensator keeps the line of sight horizontal once the circular bubble is centred`, [`It reads the staff by itself`, `It turns to the staff by a motor`, `It has a vertical circle for angles`], `No long tubular bubble needs setting before each reading.`, `textbook`, 2),
  mc(`Focusing and sighting (lecture sheet p7): the first step is to:`, `Aim the telescope at the staff with the peep sight`, [`Turn the focusing knob fully`, `Centre the circular bubble`, `Read the middle hair`], `Then eyepiece until the cross-lines are sharp, fine motion to centre the staff, focusing knob, check parallax.`, `lecture sheet p7`, 2),
  mc(`The eyepiece of the level is turned to:`, `Make the cross-hairs sharp`, [`Focus the staff`, `Level the instrument`, `Turn the telescope`], `The staff is focused with the focusing knob afterwards.`, `lecture sheet p7`),
  mc(`Parallax is present when:`, `The staff reading seems to move against the cross-hairs as you move your eye`, [`The bubble is off centre`, `The staff is tilted`, `The image is dark`], `Refocus the eyepiece and the objective until it disappears.`, `lecture sheet p7`, 2),
  mc(`Which of these is a permanent adjustment (not done in the field)?`, `Adjusting the reticle with the screws under the reticle cover`, [`Centring the circular bubble with the foot screws`, `Focusing the eyepiece`, `Removing parallax`], `The temporary adjustments are set up, level up and focus.`, `lecture sheet p7, textbook`, 2),
  mc(`Class notes on setting up the level: fix two legs first, then:`, `Move the third leg to bring the head roughly level`, [`Centre the instrument over a peg`, `Tighten all three foot screws fully`, `Take a back sight`], `Then the foot screws centre the bubble.`, `class notes (Anzara p5)`, 2),
  tf(`The level must be centred exactly over a station mark before levelling.`, false, `Centring is not needed for levelling; only levelling up matters.`, `class notes (Anzara p5, Samiha p14)`),
  tf(`An automatic level has to be levelled with a long tubular bubble before every reading.`, false, `Only the circular bubble is centred; the compensator does the rest.`, `lecture sheet p7`, 2),
  tf(`Turn the focusing knob first and the eyepiece after.`, false, `Eyepiece first (sharp cross-hairs), then the focusing knob on the staff.`, `lecture sheet p7`, 2),
  tf(`The horizontal fine motion screw of the auto level turns the telescope slowly to centre the staff.`, true, `Lecture sheet step 3 of sighting.`, `lecture sheet p7`),
  tf(`The tripod shoes should be pressed firmly into the ground.`, true, `So the set-up does not settle between readings.`, `lecture sheet p7`),
  bl(`The apparent movement of the staff image against the cross-hairs when the eye moves is called ___.`, [`parallax`], `Remove it by focusing again.`, `lecture sheet p7`),
  bl(`To remove parallax, first focus the ___ on the cross-hairs.`, [`eyepiece`, `eye piece`], `Then the objective (focusing knob) on the staff.`, `lecture sheet p7`, 2),
  bl(`Inside an automatic level, the ___ keeps the line of sight horizontal.`, [`compensator`], `It works once the circular bubble is centred.`, `textbook`, 2),

  // ---- staff ----
  mc(`The class levelling staff is telescopic. How long is it fully open, and what is its smallest division?`, `5 m, 5 mm`, [`3 m, 1 mm`, `5 m, 1 cm`, `4 m, 2 mm`], `The millimetre is estimated between the 5 mm marks.`, `class notes (Samiha p13, Anzara p5)`),
  mc(`If the staff leans while a reading is taken, the reading is:`, `Larger than the true one`, [`Smaller than the true one`, `Unchanged`, `Larger or smaller at random`], `The level line cuts a leaning staff higher up its length.`, `class notes (Anzara p5, Samiha p14)`),
  mc(`How does the staffman make sure the staff is vertical when there is no bubble?`, `Rocks it slowly towards and away from the level; the smallest reading is the right one`, [`Holds it as still as possible`, `Leans it towards the level`, `Puts it on a peg`], `The minimum reading occurs when the staff passes through vertical.`, `textbook`, 2),
  mc(`The level reading is taken on the:`, `Middle horizontal hair`, [`Upper stadia hair`, `Lower stadia hair`, `Vertical hair`], `The stadia hairs are for distances.`, `class notes (Samiha p13)`),
  mc(`Before reading a telescopic staff, check that:`, `Every section is pulled out fully and locked`, [`The staff is leaning towards the level`, `The shoe is in the mud`, `Only the bottom section is open`], `A section not fully home puts every reading above it out.`, `textbook`, 2),
  tf(`The staff reading for levelling is taken on the upper stadia hair.`, false, `On the middle hair.`, `class notes (Samiha p13)`),
  tf(`A tilted staff always reads too much.`, true, `Whichever way it leans.`, `class notes (Anzara p5)`),
  tf(`The zero of the staff is at the bottom face of its shoe.`, true, `So mud on the shoe changes every reading.`, `textbook`),
  tf(`Readings within about 70 m of the level avoid the curvature correction.`, true, `Class notes: "to avoid curvature correction we take readings within 70 m".`, `class notes (Quiz p1)`),
  bl(`The smallest division of the class staff is ___ mm.`, [`5`, `5 mm`, `five`], `The mm is estimated.`, `class notes (Samiha p13)`),

  // ---- theodolite ----
  mc(`The theodolite is centred exactly over the station mark using its:`, `Optical plummet`, [`Plate level`, `Peep sight`, `Vertical clamp`], `Focus the plummet reticle, then the ground mark; bring the mark to the reticle centre with the foot screws.`, `lecture sheet p10`),
  mc(`Why is the battery fitted before centring and levelling the theodolite?`, `Fitting it afterwards tilts the instrument slightly`, [`The plummet works only with the battery in`, `The display must be on to level`, `It makes the instrument heavier and steadier`], `Lecture sheet note at 6.1 Centering.`, `lecture sheet p10`, 2),
  mc(`The circular level of the theodolite is centred by:`, `Changing the tripod leg lengths`, [`The plate level adjusting screw`, `Turning the upper plate`, `The vertical fine motion screw`], `Shorten the leg nearest the bubble's side or lengthen the farthest one, so the plummet mark stays put.`, `lecture sheet p11`, 2),
  mc(`The plate level is centred precisely by:`, `Turning the plate parallel to foot screws A and B and using them, then turning 90° and using C`, [`Changing the tripod legs`, `The circular level adjusting screws`, `The horizontal fine motion screw`], `Repeat until the bubble stays central in every position.`, `lecture sheet p11`, 2),
  mc(`According to the lecture sheet, the bubble of the plate level moves:`, `Towards a foot screw turned clockwise`, [`Away from a foot screw turned clockwise`, `Towards the objective lens`, `Only when the clamp is loose`], `Lecture sheet 6.2 step 3.`, `lecture sheet p11`, 2),
  mc(`A fine motion (tangent) screw works only when:`, `Its clamp is tightened`, [`Its clamp is loose`, `The display is off`, `The battery is removed`], `Clamp first, then fine motion for the small final movement.`, `textbook`),
  mc(`The horizontal clamp locks:`, `The turning of the upper part about the vertical axis`, [`The tilting of the telescope`, `The tribrach to the tripod`, `The focusing ring`], `The vertical clamp locks the tilting of the telescope.`, `lecture sheet p8`),
  mc(`The 0 SET key of the digital theodolite:`, `Sets the horizontal angle to 0° in the present direction`, [`Sets the vertical angle to 0°`, `Switches the instrument off`, `Holds the horizontal reading`], `Sight the first point, press 0 SET, turn to the second and read the angle.`, `lecture sheet p9`),
  mc(`The HOLD key of the digital theodolite:`, `Holds (or releases) the horizontal angle, to set the circle to a chosen value`, [`Holds the vertical angle`, `Locks the vertical clamp`, `Turns the light on`], `Lecture sheet: HOLD = hold / release horizontal angle.`, `lecture sheet p9`, 2),
  mc(`The R/L key of the digital theodolite:`, `Chooses whether the horizontal angle increases to the right or to the left`, [`Switches the display from V to H`, `Moves the telescope right or left`, `Changes the battery`], `It selects the horizontal angle display mode (and % for the vertical angle).`, `lecture sheet p9`, 2),
  mc(`On the theodolite display:`, `V (top line) is the vertical angle and H (bottom line) the horizontal angle`, [`V is the velocity and H the height`, `H is on top, V below`, `Only one angle is shown at a time`], `Lecture sheet p9, display functions.`, `lecture sheet p9`),
  mc(`The instrument height mark on the theodolite is used to:`, `Measure the height of the instrument above the station`, [`Mark north`, `Mark the 0 SET position`, `Show the battery level`], `It is at the height of the telescope's axis.`, `lecture sheet p8`, 2),
  mc(`The tubular compass slot is for:`, `Fitting a tubular compass to set the telescope on magnetic north`, [`Charging the battery`, `Holding the plumb bob`, `Storing the handle`], `Class traverse: set north = 0 at the first station.`, `lecture sheet p8, class notes (Quiz p14)`, 2),
  mc(`The least count of the class theodolite is:`, `10″`, [`1′`, `20″`, `1°`], `Class notes: precision = 10 sec (marked important).`, `class notes (Samiha p14)`),
  mc(`"Face left" means the vertical circle is:`, `On the left of the telescope as seen from the eyepiece`, [`On the right of the telescope`, `Below the plate level`, `Under the battery cover`], `Both faces are observed and averaged to cancel instrument errors.`, `textbook`, 2),
  tf(`Turning the theodolite about its vertical axis changes the vertical angle reading.`, false, `Only tilting the telescope changes V; turning changes H.`, `class notes (Samiha p15)`, 2),
  tf(`With the telescope horizontal, the class theodolite shows V = 90°.`, true, `The vertical circle reads 0° at the zenith.`, `class notes (Samiha p14)`, 2),
  tf(`The circular level of the theodolite is centred with the foot screws, and the plate level with the tripod legs.`, false, `The other way round: tripod legs for the circular level, foot screws for the plate level.`, `lecture sheet p11`, 2),
  tf(`After levelling, the optical plummet must be checked again.`, true, `If the mark has moved, loosen the centring screw, slide the instrument over the mark and level again.`, `lecture sheet p11, textbook`, 2),
  tf(`The theodolite measures both horizontal and vertical angles.`, true, `Class notes: horizontal + vertical angle.`, `class notes (Anzara p5)`),
  tf(`The vertical fine motion screw can tilt the telescope while the vertical clamp is loose.`, false, `A fine motion screw works only with its clamp tightened.`, `textbook`, 2),
  bl(`The theodolite is centred over the station mark with the optical ___.`, [`plummet`, `plumb`], `Focus its reticle, then the mark.`, `lecture sheet p10`),
  bl(`The ___ key sets the horizontal angle to zero.`, [`0 set`, `0set`, `zero set`, `0 SET`], `Lecture sheet p9.`, `lecture sheet p9`),
  bl(`The class theodolite least count is ___ seconds.`, [`10`, `ten`, `10″`], `Class notes: precision = 10 sec.`, `class notes (Samiha p14)`),
  bl(`A fine motion screw works only after its ___ is tightened.`, [`clamp`], `Clamp, then fine motion.`, `textbook`),
]

/* ---------------------------------------------------------------- questions generated from the drawings */
const short = (t: string) => t.split(' (')[0]
const figQuestions: SvQuestion[] = FIGS.flatMap((f) =>
  f.parts.flatMap((p, i) => {
    const others = f.parts.filter((o) => o.n !== p.n)
    const step = Math.max(1, Math.floor(others.length / 3))
    const wrong = [0, 1, 2].map((j) => others[(i + j * step) % others.length])
    const pos = (f.k + p.n) % 4
    const id = (k: number) => `q-ifig-${f.k * 1000 + p.n * 10 + k}`
    const fig = (ask: boolean) => ({ id: f.id as FigId, hi: p.n, ask })
    const withRight = <X>(right: X, w: X[]) => {
      const o = [...w]
      o.splice(pos, 0, right)
      return o
    }
    const other = others[(i + Math.ceil(others.length / 2)) % others.length]
    const truth = (p.n + f.k) % 2 === 0
    const src = f.id === 'alevel' ? 'lecture sheet p7 (Fig. 3.1)' : f.id === 'theo' ? 'lecture sheet p8' : 'textbook + class notes'
    const qs: SvQuestion[] = [
      { id: id(1), topic: T, kind: 'mcq', q: `${short(f.title)}: what is the part marked **?** in the drawing?`, opts: withRight(p.name, wrong.map((o) => o.name)), a: pos, why: `**${p.name}** — ${p.does}`, src, lvl: 1, fig: fig(true) },
      { id: id(2), topic: T, kind: 'mcq', q: `${short(f.title)}: what does the part marked **?** do?`, opts: withRight(p.does, wrong.map((o) => o.does)), a: pos, why: `That is the **${p.name}**.`, src, lvl: 2, fig: fig(true) },
      { id: id(3), topic: T, kind: 'tf', q: `${short(f.title)}, part ${p.n} — the **${p.name}**: ${truth ? p.does : other.does}`, a: truth, why: truth ? `Right: the ${p.name.toLowerCase()} does exactly that.` : `That describes the ${other.name.toLowerCase()} (part ${other.n}). The ${p.name.toLowerCase()}: ${p.does}`, src, lvl: 2, fig: fig(false) },
    ]
    return qs
  }),
)

const questions: SvQuestion[] = [...written, ...figQuestions]

const cards = [
  [`What is an engineer's chain and how is it made?`, `A 100 ft chain of 100 links, each 1 ft. Links are joined by three small rings so it bends. Brass handles with swivels at the ends; the length is from the outside of one handle to the outside of the other. Tallies every 10 ft, the round one at 50 ft.`, `class notes`],
  [`How do you read a chain at the end of a line?`, `Count the tallies from the last arrow plus the extra links. The follower's arrows are the whole chains. Together they give the chainage, like 3+45.`, `class notes (Samiha p6)`],
  [`Why do you use a tape for offsets and a chain for the triangle?`, `Offsets are short and need accuracy, so we use a tape. The long main lines are chained because the chain is rugged and quick for long distances.`, `class notes (Samiha p2)`],
  [`What is ranging and when is it needed?`, `Ranging is fixing intermediate points on the straight line between two end stations, using ranging rods. It is needed when a line is longer than one chain.`, `class notes`],
  [`What does the optical square do and how does it work?`, `It gives a right angle. Two mirrors sit at 45° to each other: the index glass fully silvered, the horizon glass half silvered. A ray reflected twice turns through 90°. When the object's image lines up with the far rod, I drop the plumb bob to mark the foot.`, `class notes (Theory p2)`],
  [`How else can you find the foot of the perpendicular?`, `The 3-4-5 method with a tape, or the swing method. I swing the tape from the object to cut the line at two points; the mid-point is the foot.`, `class notes`],
  [`Prismatic compass or surveyor's compass: which reads what?`, `The prismatic compass reads whole circle bearing 0 to 360° through a prism, with the ring fixed to the needle. The surveyor's compass reads quadrantal bearings from a card fixed to the box, read from above.`, `textbook`],
  [`What does the trough compass tell you?`, `Magnetic north. I use it on the plane table to draw the N–S line for orientation. True north needs the declination applied.`, `class notes (Samiha p11)`],
  [`What are the plane-table operations at a station?`, `L, C, O: Level it with the spirit level in two directions, Centre it with the U-fork and plumb bob, then Orient it by compass or back ray. Orientation is last.`, `class notes (Quiz p13)`],
  [`Name the parts of the automatic level.`, `Reflector, peep sight, circular level and its adjusting screw, foot screws, base plate, horizontal fine motion screw, objective, focusing knob, circle positioning ring and window, reticle cover, eyepiece.`, `lecture sheet p7`],
  [`How do you set up the auto level?`, `Extend the legs to eye level, spread them to a triangle, tripod head roughly level, shoes pressed in. Fix the instrument with the centring screw. Centre the circular bubble with the foot screws.`, `lecture sheet p7`],
  [`How do you focus and sight the level? What is parallax?`, `Aim with the peep sight, sharpen the cross-lines with the eyepiece, focus the staff with the knob. Move my eye: if the reading shifts, that is parallax. I refocus until it is gone.`, `lecture sheet p7`],
  [`What is the compensator?`, `It is a hanging prism system in the auto level. Once the circular bubble is centred it keeps the line of sight horizontal, so no long bubble is needed.`, `textbook`],
  [`Why must the staff be vertical?`, `A tilted staff always gives a larger reading, so the RL comes out wrong. I rock it slowly back and forth and take the minimum reading.`, `class notes`],
  [`What is the staff like?`, `A telescopic staff, 5 m when fully open, graduated to 5 mm. I estimate the millimetres between the marks. Every section must be fully out and locked.`, `class notes (Samiha p13)`],
  [`Name the parts of the digital theodolite.`, `Optical plummet, circular level, plate level, foot screws, horizontal and vertical clamps with fine-motion screws, telescope with focusing ring, operation panel and display, tubular compass slot, instrument height mark.`, `lecture sheet p8`],
  [`How do you centre the theodolite?`, `Set the tripod over the mark, fix the instrument, focus the plummet on the reticle and the mark. Use the foot screws to bring the mark to the reticle centre.`, `lecture sheet p10`],
  [`How do you level the theodolite?`, `Centre the circular bubble with tripod leg lengths. Then turn the plate parallel to two foot screws, centre the plate bubble, turn 90° and use the third screw. Repeat, and check the plummet again.`, `lecture sheet p11`],
  [`Which way does the bubble move?`, `The bubble moves towards a foot screw that I turn clockwise. It follows the left thumb when I turn two screws together.`, `lecture sheet p11`],
  [`What do the 0 SET and HOLD keys do?`, `0 SET sets the horizontal angle to zero in the present direction. HOLD freezes or releases the horizontal reading so I can set the circle to a chosen value.`, `lecture sheet p9`],
  [`What is face left and face right?`, `Face left means the vertical circle is on the left of the telescope. Face right is after transiting and turning 180°. I average both to cancel instrument errors.`, `textbook`],
  [`What is the least count of your theodolite?`, `Ten seconds in class. The vertical circle reads 90° when the telescope is horizontal, a zenith-type circle.`, `class notes (Samiha p14)`],
  [`What are the three horizontal hairs in the telescope for?`, `The middle hair gives the staff reading for levelling. The upper and lower stadia hairs are for distance: the gap between their readings times 100 is the distance.`, `class notes (Samiha p13, Quiz p19)`],
  [`What is a change point and why is the staff kept in place?`, `It is the point where I take a fore sight, shift the level, and take a back sight. The staff stays so the same point carries the levels to the new set-up.`, `class notes (Theory p11)`],
  [`How does the field book look?`, `A double-line strip. Station A and chainage 0+00 at the bottom, read upward. Offsets are short lines to the left or right with their length beside, objects as circles, fixed objects as squares.`, `class notes (Quiz p12)`],
  [`What do the clamp and the fine motion screw do?`, `The clamp locks a motion; the fine motion (tangent) screw then moves it slowly for exact pointing. The fine motion works only with its clamp tight. Horizontal pair for turning, vertical pair for tilting the telescope.`, `lecture sheet p8, textbook`],
  [`What are the lifting pin and the brake pin of a prismatic compass?`, `Folding the object vane presses the lifting pin, which lifts the needle off the pivot so it does not wear. The brake pin is pressed lightly to stop the ring swinging before a reading.`, `textbook`],
  [`What are the parts of the plane table set?`, `Board on a tripod with a levelling head, the alidade with object and sight vanes, a spirit level, a trough compass, and the U-fork with a plumb bob.`, `class notes (Theory p4, Samiha p10)`],
  [`What are arrows, pegs and ranging rods for?`, `Arrows mark each chain length and count the chains. Pegs mark the main stations. Ranging rods mark stations and keep the chain on a straight line.`, `class notes`],
  [`Which adjustments are temporary and which are permanent?`, `Temporary, every set-up: setting up, levelling up, focusing (and centring for a theodolite). Permanent, in the lab: the adjusting screws of the circular and plate levels and the reticle.`, `lecture sheet pp 7–11, textbook`],
]

export const content: SvTopicContent = {
  questions,
  cards: cards.map(([front, back, src], i) => ({ id: `v-inst-${i + 1}`, topic: T, front, back, src })),
}

const fig = (id: FigId) => () => createElement(PartsExplorer, { id })

export const learn: SvLearn = {
  notes: [
    {
      title: "Engineer's chain",
      md: `- **100 ft, 100 links of 1 ft.** Gunter's chain 66 ft; metric chains 20 m or 30 m (links of 0.2 m).
- Links joined by **three small rings** so the chain bends; **swivel** at each handle so it does not twist.
- Length counted from the **outer edge of the handle**. **Tallies** every 10 links (1–4 teeth), **round** tally at 50 ft.
- The chain forms the main lines; **offsets are taped** (more accurate).`,
      Fig: fig('chain'),
    },
    {
      title: 'Ranging rod, arrows, pegs, plumb bob, tape',
      md: `- **Ranging rod** (2 or 3 m, red–white bands, iron shoe): marks stations and keeps the chain straight. Needed on any line longer than one chain.
- **Arrows** (set of 10, red cloth on the ring): one at the end of each chain length; the follower's arrows count the chains.
- **Peg**: marks a main station. On pavement, tie the station to **three permanent objects** instead.
- **Plumb bob**: a vertical line — centring, dropping the foot of a perpendicular, checking a rod is vertical.
- **Tape**: invar most accurate, cloth least; a "metallic" tape is cloth with brass wires.`,
      Fig: fig('kit'),
    },
    {
      title: 'Optical square',
      md: `- Sets out a **right angle**: the foot of the perpendicular from an object to the chain line.
- Two mirrors at **45°**: the **index glass** (fully silvered) and the **horizon glass** (half silvered). The ray is turned through **90°**.
- Other ways to the foot: **3-4-5** and **swing** (mid-point of the two cuts).`,
      Fig: fig('osq'),
    },
    {
      title: 'Prismatic, surveyor’s and trough compasses',
      md: `| | Prismatic | Surveyor's |
|---|---|---|
| Bearing | whole circle, 0–360° | quadrantal (N/S … E/W) |
| Graduations | on a ring fixed to the **needle**, inverted | on a card fixed to the **box**, E and W swapped |
| Read | through the **prism**, while sighting | from above, after sighting |
| Least count | 30′ | 15′ |

- **Trough compass**: long narrow box laid on the plane table to draw the **magnetic** N–S line. True north needs the declination.
- Keep chains, tapes and keys away from any compass.`,
      Fig: fig('pcomp'),
    },
    {
      title: 'Plane table',
      md: `Order at each station: **L**evel (spirit level, two directions) → **C**entre (U-fork and plumb bob) → **O**rient (trough compass at the first station, back ray after). Orientation is last.

Rays are drawn along the alidade's **fiducial edge**; keep the alidade on the **same side** of the point for every ray.`,
      Fig: fig('ptable'),
    },
    {
      title: 'Tripod',
      md: `Unbuckle the band, loosen the **extension clamp screws**, pull the legs out until the head is near eye level and tighten. Spread the tips into a **regular triangle**, keep the head roughly level, press the **shoes** in. Fix the instrument with the **centring screw**.`,
      Fig: fig('tripod'),
    },
    {
      title: 'Automatic level',
      md: `**Temporary adjustments:** set up → level up (circular bubble, foot screws) → focus.

**Focusing (lecture sheet):** peep sight to aim → eyepiece until the cross-lines are sharp → fine motion screw to centre the staff → focusing knob → move your eye: no parallax means ready.

- A **compensator** keeps the line of sight horizontal once the circular bubble is centred.
- Levelling needs **no centring** over a mark.
- The adjusting screws (circular level, reticle) are **permanent** adjustments — leave them alone.`,
      Fig: fig('alevel'),
    },
    {
      title: 'Levelling staff and the cross-hairs',
      md: `- Telescopic, **5 m** open, smallest division **5 mm**; estimate the mm.
- Every section fully out and **locked**; shoe clean (its bottom is the zero).
- Hold it **vertical**: a leaning staff always reads too much. Rock it and take the smallest reading.
- Read on the **middle hair**; the upper and lower **stadia hairs** are for distance.
- Keep sights within about **70 m** (no curvature correction needed).`,
      Fig: fig('staff'),
    },
    {
      title: 'Digital theodolite',
      md: `**Set up (lecture sheet pp 10–11):** fit the battery → tripod over the mark → fix with the centring screw → focus the **optical plummet** (reticle, then mark) → foot screws bring the mark to the centre → **tripod legs** centre the circular bubble → **foot screws A, B** then **C** centre the plate level → check the plummet again.

| Key | Does |
|---|---|
| ON / ON + light | power on / off |
| 0 SET | horizontal angle = 0 |
| HOLD | hold / release the horizontal angle |
| R/L | horizontal angle to the right or left (% for vertical) |
| light | display illumination |

- **Clamp first, then fine motion.** Horizontal pair turns the instrument; vertical pair tilts the telescope.
- Turning changes only H; tilting changes only V. V = 90° when the telescope is horizontal. Least count **10″**.`,
      Fig: fig('theo'),
    },
  ],
  steps: [
    `Check the issued instruments: loose screws, cracked glass, a bent chain, a kinked tape or a damaged staff — report defects to the teacher before using them.`,
    `**Chain:** open it by holding both handles and throwing it forward; check the tallies, and that no link is bent or knotted.`,
    `**Auto level:** unbuckle the tripod band and loosen the leg clamps; extend the legs so the head is near eye level and tighten the clamps.`,
    `Spread the legs so the tips form a regular triangle; keep the head roughly level; press the shoes firmly into the ground.`,
    `Put the level on the head and tighten the centring screw.`,
    `Centre the circular bubble with the three foot screws (the bubble follows a screw turned clockwise).`,
    `Aim with the peep sight; turn the eyepiece until the cross-lines are just sharp; centre the staff with the fine motion screw; focus the staff with the knob.`,
    `Move your eye slightly. If the reading shifts there is parallax: refocus the eyepiece and the knob until there is none.`,
    `Read the middle hair; the staffman keeps the staff vertical (rock it, take the minimum).`,
    `**Theodolite:** fit the battery first (fitting it later tilts the instrument).`,
    `Set the tripod head over the station mark with the legs equally spaced and the head roughly level; press the shoes in.`,
    `Fix the instrument with the centring screw; focus the plummet eyepiece on the reticle, then the focusing ring on the mark.`,
    `Use the foot screws to bring the mark to the centre of the reticle.`,
    `Centre the circular bubble by changing the tripod leg lengths: shorten the leg on the bubble's side or lengthen the opposite one.`,
    `Loosen the horizontal clamp; turn the plate until the plate level is parallel to foot screws A and B; centre the bubble with A and B.`,
    `Turn the plate 90°, centre the bubble with screw C; repeat until the bubble stays central in both directions.`,
    `Check the plummet again. If the mark has moved, loosen the centring screw slightly, slide the instrument over the mark and relevel.`,
    `Pack up the other way round: clamps loose, instrument in its box the way it came out, chain folded, tape wound, compass vane folded (it lifts the needle).`,
  ],
  submit: [
    `Every sheet needs the title of the survey and course no. (CE 104), your name, roll, group number and the date of performance.`,
    `Legend for every symbol used (main station triangle, object circle, fixed object square).`,
    `North–south line, a numerical scale and a graphical scale.`,
    `A half inch border around the sheet.`,
    `For instruments day itself: the instruments are checked and returned and the field data are shown to the teacher.`,
  ],
  traps: [
    `Using the chain for offsets instead of a tape.`,
    `Mixing up the index glass (fully silvered) and the horizon glass (half silvered).`,
    `Saying the prismatic compass card is fixed to the box — it is fixed to the needle.`,
    `Orienting the plane table before levelling and centring.`,
    `Turning the focusing knob before the eyepiece, or reading with parallax.`,
    `Using a fine motion screw with its clamp loose.`,
    `Mounting the theodolite battery after levelling.`,
    `Reading on a stadia hair instead of the middle hair, or with the staff leaning.`,
    `Touching the adjusting screws (circular level, plate level, reticle) — those are permanent adjustments.`,
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
