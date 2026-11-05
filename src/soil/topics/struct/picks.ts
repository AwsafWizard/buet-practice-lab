// Structure & mineralogy "Which one?" drill skills: structure type, clay mineral / sheet, deposit by origin.
import { pick } from '../../../labs/common'
import type { PickSkill } from '../../components/PickDrill'

const STRUCTS: { t: string; a: string; why: string }[] = [
  { t: 'Sand grains settled one by one under gravity, every grain touching its neighbours, small voids.', a: 'Single grained', why: 'Coarse grains (gravel, sand) settle individually under gravity: single-grained, dense or loose.' },
  { t: 'Silt grains held in arch-like chains around large voids; carries static load by bridge action but collapses under vibration.', a: 'Honeycomb', why: 'Silt-size grains are small enough for contact forces to hold arches: honeycomb (slides 7–8).' },
  { t: 'Clay plates touching edge (+) to face (−) at random, large voids; less sensitive to vibration.', a: 'Flocculated', why: 'Edge-to-face attraction (positive edges, negative faces) gives the flocculated "card-house" (slide 10).' },
  { t: 'Clay plates lying parallel, face to face — the result of remoulding.', a: 'Dispersed', why: 'Remoulding breaks the edge-to-face bonds and the plates line up: dispersed (slide 11).' },
  { t: 'Coarse grains touch each other and form a framework; fines sit in the voids. Stable, takes heavy loads.', a: 'Coarse-grained skeleton', why: 'Coarse fraction dominates and carries the load through grain contacts (slides 13–14).' },
  { t: 'Coarse grains float in clay with no contact between them; behaves like a clay.', a: 'Cohesive matrix', why: 'Fines dominate; the clay matrix carries the load (slide 15).' },
]
const structure: PickSkill = {
  key: 'structure',
  label: 'Structure type',
  gen: (r) => {
    const s = pick(r, STRUCTS)
    return { q: s.t + ' Which structure?', options: STRUCTS.map((x) => x.a), answer: s.a, why: s.why, ref: 'c-structure' }
  },
}

const MINERALS: { t: string; a: string; why: string }[] = [
  { t: '1:1 layers (one silica, one gibbsite sheet) about 7 Å thick, held by hydrogen bonds.', a: 'Kaolinite', why: 'Kaolinite: S–G units stacked with H-bonds — the least active clay mineral (slide 24).' },
  { t: '2:1 layers with water and exchangeable cations drawn in between; very weak van der Waals bonds; huge swelling.', a: 'Montmorillonite', why: 'Montmorillonite (smectite, bentonite): S–G–S with weak bonds, water enters, high volume change (slide 25).' },
  { t: '2:1 layers bonded by potassium ions; swells more than kaolinite, less than montmorillonite.', a: 'Illite', why: 'Illite: S–G–S with K⁺ between the units, some Si replaced by Al (slide 26).' },
  { t: 'Which clay mineral is the least active (smallest swelling and plasticity)?', a: 'Kaolinite', why: 'Strong H-bonds keep water out: kaolinite is the least active (slide 24).' },
  { t: 'A foundation on this clay heaves in the monsoon and cracks in the dry season. The dominant mineral is most likely…', a: 'Montmorillonite', why: 'Large swell–shrink is the mark of montmorillonite (slides 19, 25).' },
]
const SHEETS: { t: string; a: string; why: string }[] = [
  { t: 'One Si⁴⁺ surrounded by four O²⁻ at the corners of a tetrahedron.', a: 'Silica sheet', why: 'Silica (tetrahedral) sheet, symbol S (slides 20–21); net charge −1 per unit.' },
  { t: 'One Al³⁺ surrounded by six OH⁻ at the corners of an octahedron.', a: 'Gibbsite sheet', why: 'Alumina / gibbsite (octahedral) sheet, symbol G (slide 22).' },
  { t: 'The octahedral sheet with Mg²⁺ in place of Al³⁺.', a: 'Brucite sheet', why: 'Brucite sheet (slide 23).' },
  { t: 'A metal ion replaced by one of lower valence but the same physical size.', a: 'Isomorphous substitution', why: 'Isomorphous substitution (slide 23) leaves a net negative charge on the clay.' },
]
const mineral: PickSkill = {
  key: 'mineral',
  label: 'Clay mineral',
  gen: (r) => {
    if (r() < 0.6) {
      const m = pick(r, MINERALS)
      return { q: m.t, options: ['Kaolinite', 'Illite', 'Montmorillonite'], ordered: true, answer: m.a, why: m.why, ref: 'c-minerals' }
    }
    const s = pick(r, SHEETS)
    return { q: `Name it: ${s.t}`, options: SHEETS.map((x) => x.a), answer: s.a, why: s.why, ref: 'c-minerals' }
  },
}

const DEPOSITS: { t: string; a: string }[] = [
  { t: 'Formed in place by weathering of the parent rock; properties change gradually with depth.', a: 'Residual' },
  { t: 'Laid down by rivers: sorted, stratified sands, silts and clays (most of Bangladesh).', a: 'Alluvial' },
  { t: 'Settled in still lake water: fine, often varved silts and clays.', a: 'Lacustrine' },
  { t: 'Deposited in the sea: soft, fine, often organic clays with shells.', a: 'Marine' },
  { t: 'Carried by wind: uniform loess or dune sand.', a: 'Aeolian' },
  { t: 'Left by ice: unsorted till with boulders to clay.', a: 'Glacial' },
  { t: 'Moved down a slope by gravity: talus, loose and angular.', a: 'Colluvial' },
]
const deposit: PickSkill = {
  key: 'deposit',
  label: 'Deposit by origin',
  gen: (r) => {
    const d = pick(r, DEPOSITS)
    return { q: `${d.t} Which deposit?`, options: DEPOSITS.map((x) => x.a), answer: d.a, why: `**${d.a}.** Residual soils stay where they formed; transported soils are named by the agent: water (alluvial, lacustrine, marine), wind (aeolian), ice (glacial), gravity (colluvial). Origin of soils is not on AJK sir's slides but appears in older papers.` }
  },
}

export const STRUCT_PICKS: PickSkill[] = [structure, mineral, deposit]
