import type { SvLearn, SvQuestion, SvTopicContent } from '../types'

const T = 'sv-modern' as const
const ID = 'mod'
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
  mc(`An EDM is mainly used in class notes for:`, `Measuring distances electronically, e.g. indoors from column to column or wall to wall`, [`Measuring angles only`, `Levelling with a barcode staff`, `Fixing north`], `EDM = Electronic Distance Machine, a quick distance meter.`, `class notes (Quiz p1)`, 1, true),
  mc(`What does the digital level (DLM) read automatically?`, `A barcode staff, giving the staff reading and the distance`, [`A prism at the staff`, `A magnetic needle`, `A plumb line`], `The electronic level book computes rise & fall or HI, as selected.`, `class notes (Quiz p1)`, 1, true),
  mc(`The electronic level book of a digital level can use:`, `Rise & fall or height of instrument, whichever you select`, [`Rise & fall only`, `HI only`, `Trigonometric levelling`], `Both methods are installed in the instrument.`, `class notes (Quiz p1), 18-batch report`, 2, true),
  mc(`A total station is:`, `An electronic theodolite with a built-in EDM and a data recorder`, [`A GPS base station`, `A digital level with a printer`, `A drone camera`], `It measures angles and distance to the same point and stores X, Y, Z.`, `class notes (Quiz p2), textbook`, 1),
  mc(`A total station gives for a point:`, `X, Y, Z, distance, bearing, slope distance and vertical reading`, [`Only the height`, `Only the horizontal angle`, `Only the distance`], `It gives every piece of information about the point.`, `class notes (Quiz p2)`, 1),
  mc(`Which total station type has GPS built in?`, `Smart (multi-) station`, [`Manual TS`, `Semi-auto TS`, `Robotic TS`], `Class notes: manual, semi-auto, auto, robotic (uses a prism), and smart or multi-station with GPS.`, `class notes (Quiz p2)`, 1),
  mc(`The Z value given by a total station is:`, `The RL, computed from known bench marks`, [`The horizontal distance`, `The bearing`, `The height of the instrument`], `X and Y are coordinates; Z is the elevation (RL).`, `class notes (Quiz p2)`, 1),
  mc(`In the total station coding system, the code EB stands for:`, `Edge of bituminous road`, [`Embankment bottom`, `Electronic bench`, `East boundary`], `The codes in the notes: BM bench mark, BLDG building, EB edge of bituminous road, Tree.`, `class notes (Quiz p3)`, 1),
  mc(`Why is a code attached to each point in the total station?`, `So the point is identified later by attribute (BM, BLDG, EB, tree) while processing`, [`To power the prism`, `To measure the distance`, `To reduce the observation time to zero`], `Codes feed the drawing software for sections, contours, volumes and maps.`, `class notes (Quiz p3)`, 2),
  mc(`Which is NOT a use of total station data?`, `Weather forecasting`, [`Cross-section and long section`, `Cutting and filling, volume`, `Contour and topographic map`], `The notes list cross-section, long section, cut and fill, contour, volume and topographic map.`, `class notes (Quiz p3)`, 1),
  mc(`How accurately can a design layout be set out in the field with a total station and prism, according to the notes?`, `About 1 mm`, [`About 1 m`, `About 10 cm`, `About 5 m`], `The layout made on the PC is uploaded in the TS and pegged with a prism.`, `class notes (Quiz p4)`, 2),
  mc(`A single prism can be used up to about:`, `1 km`, [`100 m`, `10 km`, `50 km`], `For more than 1 km a triple prism is used.`, `class notes (Quiz p6)`, 1),
  mc(`The accuracy level of a single (standalone) GPS receiver is in:`, `Metres`, [`Millimetres`, `Centimetres`, `Micrometres`], `Standalone GPS gives metre-level relative position; DGPS cm, RTK mm per the class notes.`, `class notes (Quiz p4)`, 1),
  mc(`DGPS needs:`, `Two receivers: one base on a known point and one roamer on the unknown point`, [`One receiver only`, `A total station and a prism`, `A barcode staff`], `Both work at the same time; the data are downloaded to a PC and differenced.`, `class notes (Quiz p4-5)`, 2),
  mc(`The accuracy level of DGPS is in:`, `Centimetres (about 1–99 cm)`, [`Metres`, `Millimetres (1–9 mm)`, `Kilometres`], `The class notes give 1–99 cm.`, `class notes (Quiz p5)`, 1),
  mc(`The accuracy level of RTK GPS is in:`, `Millimetres (class notes: 1–9 mm)`, [`Metres`, `Tens of centimetres`, `Kilometres`], `The class notes give 1–9 mm; the base is on a known point and the roamer on the unknown point.`, `class notes (Quiz p5)`, 1),
  mc(`RTK stands for:`, `Real Time Kinematic`, [`Radio Total Kit`, `Random Time Kinematic`, `Real Time Kilometre`], `Corrections are sent in real time.`, `class notes (Quiz p5)`, 1),
  mc(`Which is the data path in the class RTK set-up?`, `Satellite → base station → server → roamer`, [`Roamer → satellite → base`, `Server → total station → roamer`, `Base station → drone → server`], `The server (BUET JICT) needs a real IP and the link uses a SIM/internet.`, `class notes (Quiz p6)`, 2),
  mc(`The RTK coverage in the class notes is about:`, `50 km`, [`500 m`, `5 km`, `500 km`], `It uses SIM and internet; it works within the base station's range.`, `class notes (Quiz p6)`, 2),
  mc(`RTK is used for:`, `Topographic survey, setting out layouts and creating control points`, [`Only indoor distance`, `Only measuring slope`, `Only drawing`], `Class notes (Quiz p5).`, `class notes (Quiz p5)`, 1),
  mc(`UTM stands for:`, `Universal Transverse Mercator, giving X and Y in metres`, [`Universal Total Measure`, `Uniform Theodolite Metric`, `Upper Total Mapping`], `Degrees of latitude and longitude can be converted into UTM metres.`, `class notes (Quiz p3)`, 1),
  mc(`Drone surveying is described in the notes as:`, `The latest addition to GIS and remote sensing`, [`A form of chain survey`, `Part of levelling`, `A kind of compass survey`], `The drone carries a multispectral camera; images are processed with remote sensing and GIS.`, `class notes (Quiz p7)`, 1),
  mc(`For mapping by drone the images must overlap by at least:`, `80%`, [`10%`, `30%`, `50%`], `More overlap increases accuracy (class notes).`, `class notes (Quiz p8)`, 2),
  mc(`The two types of sensor used in a drone are:`, `Active and passive`, [`Optical and digital`, `Analog and prism`, `Single and triple`], `Active sensors send their own signal; passive ones record reflected sunlight.`, `class notes (Quiz p8)`, 2),
]

const more: SvQuestion[] = [
  bl(`EDM stands for Electronic ___ Machine.`, [`distance`, `distance measuring`], `Class notes: it measures distance electronically.`, `class notes (Quiz p1)`, 1, true),
  bl(`RTK stands for Real Time ___.`, [`kinematic`], `Real Time Kinematic GPS.`, `class notes (Quiz p5)`, 1),
  bl(`A single prism reads up to ___ km; a triple prism reads beyond it.`, [`1`, `one`], `Single prism up to 1 km.`, `class notes (Quiz p6)`, 1),
  bl(`The RTK accuracy level in the class notes is in ___ (a unit of length).`, [`mm`, `millimetre`, `millimetres`, `millimeter`, `millimeters`], `1–9 mm.`, `class notes (Quiz p5)`, 1),
  bl(`The DGPS accuracy level is in ___.`, [`cm`, `centimetre`, `centimetres`, `centimeter`, `centimeters`], `1–99 cm.`, `class notes (Quiz p5)`, 1),
  bl(`In the TS code system, EB stands for edge of ___ road.`, [`bituminous`], `The others: BM, BLDG, tree.`, `class notes (Quiz p3)`, 1),
  bl(`The minimum overlap of drone images is ___ %.`, [`80`, `80%`], `More overlap increases accuracy.`, `class notes (Quiz p8)`, 2),
  bl(`UTM stands for Universal Transverse ___.`, [`mercator`], `Gives X, Y in metres.`, `class notes (Quiz p3)`, 1),

  tf(`A standalone GPS receiver gives accuracy at the millimetre level.`, false, `Single GPS is accurate to metres; DGPS to cm; RTK to mm.`, `class notes (Quiz p4-5)`, 1),
  tf(`In RTK the base station is set on a known point and the roamer on the unknown point.`, true, `The roamer gets corrections from the base through the server.`, `class notes (Quiz p5)`, 1),
  tf(`Chain survey, plane table, level and traverse data can all be collected with a total station.`, true, `A total station records X, Y and Z, so any of them can be done.`, `class notes (Quiz p2)`, 2),
  tf(`The digital level reads a barcode staff.`, true, `It also shows the distance to the staff.`, `class notes (Quiz p1)`, 1, true),
  tf(`A layout designed on the PC can be uploaded to a total station and set out in the field.`, true, `With a prism the layout is pegged to about 1 mm.`, `class notes (Quiz p4)`, 2),
  tf(`A triple prism is used for sights beyond 1 km.`, true, `A single prism reads up to 1 km.`, `class notes (Quiz p6)`, 1),
  tf(`UTM coordinates are given in degrees of latitude and longitude.`, false, `UTM is in metres; latitude and longitude are in degrees and can be converted to UTM.`, `class notes (Quiz p3)`, 1),
  tf(`More image overlap in a drone survey increases accuracy.`, true, `Overlap lets the software match points more reliably.`, `class notes (Quiz p8)`, 1),
]

const all = [...questions, ...more]

const cards = [
  [`What is an EDM and where did you see it used?`, `An electronic distance meter. It gives the distance at the press of a key and is used indoors, column to column or wall to wall.`, `class notes (Quiz p1)`],
  [`What is the digital level?`, `A level that reads a barcode staff by itself and shows the reading and the distance. It has an electronic level book for rise and fall or HI.`, `class notes (Quiz p1)`],
  [`What is a total station?`, `An electronic theodolite with an EDM and a data recorder. It measures angles and distance, and gives X, Y and Z of any point.`, `class notes (Quiz p2)`],
  [`What are the types of total station?`, `Manual, semi-automatic, automatic, robotic which works with a prism, and the smart or multi-station with GPS.`, `class notes (Quiz p2)`],
  [`What do the codes BM, BLDG, EB mean?`, `Bench mark, building, and edge of bituminous road. Points are coded so the software can sort them for sections, contours and maps.`, `class notes (Quiz p3)`],
  [`What do you do with total station data afterwards?`, `Download it to a PC and make cross-sections, long sections, cut and fill, contours, volumes and the topographic map. Layouts can be uploaded back to the TS.`, `class notes (Quiz p3-4)`],
  [`What is a prism for?`, `The prism reflects the beam back to the total station so it can measure the distance. Single prism to 1 km, triple beyond.`, `class notes (Quiz p6)`],
  [`GPS, DGPS and RTK: what is the difference?`, `Single GPS is accurate to metres. DGPS uses a base and a roamer and reaches cm. RTK sends real-time corrections and reaches mm.`, `class notes (Quiz p4-5)`],
  [`How does the RTK work?`, `A base station on a known point sends data through a server to the roamer on the unknown point over a SIM or internet link. The coverage is about 50 km.`, `class notes (Quiz p6)`],
  [`What are X, Y and Z?`, `X and Y are coordinates in UTM metres or in degrees of latitude and longitude. Z is the RL computed from known bench marks of Survey of Bangladesh.`, `class notes (Quiz p2-3)`],
  [`What is a drone survey?`, `The latest addition to GIS and remote sensing. A drone flies a planned route and takes overlapping images with positions; the PC processes them.`, `class notes (Quiz p7-8)`],
  [`How much should drone images overlap?`, `At least 80%. More overlap means better matching and accuracy.`, `class notes (Quiz p8)`],
  [`What can a drone survey be used for?`, `Topographic survey, land classification, volume measurement, bridge monitoring and waste management on building sites.`, `class notes (Quiz p7-8)`],
  [`What is TLS?`, `Terrestrial laser scanning. A scanner on a tripod shoots a very large number of laser points and gives a 3D point cloud of the surroundings.`, `textbook`],
  [`Why do modern instruments not replace the chain and level knowledge?`, `Their data still need control points and checks. The principles of distance, angle and level, and the checks, stay the same.`, `textbook`],
]

export const content: SvTopicContent = {
  questions: all,
  cards: cards.map(([front, back, src], i) => ({ id: `v-${ID}-${i + 1}`, topic: T, front, back, src })),
}

export const learn: SvLearn = {
  notes: [
    {
      title: 'EDM, digital level and total station',
      md: `- **EDM**: electronic distance machine, indoor column to column.
- **Digital level (DLM)**: reads a barcode staff; shows reading and distance; electronic level book with rise & fall or HI.
- **Total station (TS)**: electronic theodolite + EDM + recorder. Gives X, Y, Z, distance, bearing, slope distance, vertical reading.
- Types: manual, semi-auto, auto, robotic (with a prism), smart or multi-station (with GPS).
- Codes: BM, BLDG, EB (edge of bituminous road), tree. Data → cross-sections, long sections, cut and fill, contours, volumes, topographic map.
- Layouts made on the PC are uploaded to the TS and set out with a prism (about 1 mm).
- Single prism up to 1 km; triple prism beyond.`,
    },
    {
      title: 'GPS, DGPS and RTK',
      md: `| System | Needs | Accuracy (class notes) |
|---|---|---|
| GPS (single) | one receiver | metres |
| DGPS | base on known point + roamer, post-processed | cm (1–99 cm) |
| RTK | base + server + roamer, real time, SIM/internet, real IP | mm (1–9 mm), range about 50 km |

- RTK path: satellite → base station → server → roamer. Used for topographic survey, layouts and control points.
- X, Y in UTM metres or in degrees (convertible); Z = RL from known BMs (Survey of Bangladesh; other series GTS, FM, PWD).`,
    },
    {
      title: 'Drone and laser scanning',
      md: `- Drone survey: the latest addition to GIS and remote sensing, multispectral camera, sensors active or passive.
- Flight designed beforehand; images carry position; minimum **80% overlap**; processed on a PC with remote sensing and GIS.
- Uses: topographic survey, land classification, volume, bridge monitoring, building waste.
- Satellite sensors named: Ikonos, Quickbird, Sentinel.
- **TLS** (terrestrial laser scanner): fast 3D point cloud (textbook fact, not in class notes).`,
    },
  ],
  steps: [
    `These days are demonstrations and short exercises; the precise tasks are given by the instructor.`,
    `Watch the set-up of the total station: tripod over the point, optical plummet centring, plate level, then enter the station and the backsight.`,
    `Note how a point is shot with a prism and how the code (BM, BLDG, EB, tree) is entered with it.`,
    `Ask how the data are downloaded to the PC and used for sections, contours and volumes.`,
    `Note the RTK chain: base on a known point, server, roamer; and the accuracy levels.`,
    `At the drone demonstration note the flight plan, the overlap and the sensor type.`,
    `Write the observations in the field book so you can answer the viva.`,
  ],
  submit: [
    `No separate drawing sheet is required for these days; check with your teacher whether notes are to be handed in.`,
  ],
  traps: [
    `Mixing the accuracy of GPS, DGPS and RTK (metres, cm, mm).`,
    `Calling the Z value a distance. It is the RL.`,
    `Forgetting that RTK needs a base station on a known point.`,
    `Quoting a drone overlap below 80%.`,
    `Saying a single prism reads beyond 1 km.`,
  ],
  carry: [
    `Field book and pencil`,
    `The class notes of the digital level, total station, GPS and drone pages`,
  ],
}
