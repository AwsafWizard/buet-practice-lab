// Structure, mineralogy and origin of soils: theory with full-mark model answers.
import { MineralStack, SheetUnits } from '../../reference/idx'
import type { SmTheoryItem } from '../../types'
import { DepositTree, GeoCycle, StructSketch, type StructKind } from './figs'

const T = 'sm-struct' as const

const Grid = ({ kinds }: { kinds: StructKind[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {kinds.map((k) => (
      <StructSketch key={k} kind={k} w={200} />
    ))}
  </div>
)
const FigAll = () => <Grid kinds={['dense', 'loose', 'honeycomb', 'flocculated', 'dispersed', 'skeleton', 'matrix']} />
const FigFD = () => <Grid kinds={['clay', 'flocculated', 'dispersed']} />
const FigMin = () => (
  <div className="space-y-2">
    <SheetUnits w={320} />
    <div className="grid grid-cols-3 gap-1">
      <MineralStack kind="kaolinite" />
      <MineralStack kind="illite" />
      <MineralStack kind="montmorillonite" swell={1.4} />
    </div>
  </div>
)
const FigTree = () => <DepositTree />
const FigCycle = () => <GeoCycle />

export const STRUCT_THEORY: SmTheoryItem[] = [
  {
    id: 't-structures',
    topic: T,
    q: 'Define soil structure (and distinguish it from fabric). With neat sketches, describe the types of structure of coarse-grained soils and of clay soils. Short notes: single-grained, honeycomb and dispersed structures.',
    seen: ['2023-24', '2021-22', '2017-18', '2015-16'],
    a: `**Soil structure** is the geometric arrangement of the particles **together with the inter-particle forces** acting between them. **Fabric** is the arrangement (orientation and grouping of particles and voids) alone. Structure = fabric + bonding.

**Coarse-grained soils** (gravity dominates; slides 3–8):
- **Single grained:** gravel and sand grains settle individually under gravity, each in contact with its neighbours.
  - *Dense:* small voids → low e, low permeability, high shear strength, low compressibility.
  - *Loose:* large voids → high e, high permeability; **unstable** — vibration or shock densifies it (settlement, liquefaction when saturated).
- **Honeycomb** (silts, fine sand): small grains settle slowly; inter-particle forces hold them in **arch-like chains** around large voids. High e. Carries static load by **bridge action**, but under vibration the arches **collapse** and the soil becomes dense (large sudden settlement).

**Clay soils** (surface forces ≫ gravity; plates with − faces and + edges, large surface area; slides 9–11):
- **Flocculated:** edge-to-face contacts, random "card-house", large voids, high e; relatively strong and **less sensitive to vibration**. Forms in salt water or with attractive forces.
- **Dispersed:** plates parallel, face-to-face, low e, dense but weaker; formed when **remoulding** destroys the flocculated structure (or by deposition in fresh water).

**Mixed soils** (slides 12–15):
- **Coarse-grained skeleton:** coarse grains in contact form a framework, fines fill the voids → stable, less compressible, takes heavy loads.
- **Cohesive matrix:** fines dominate; coarse grains float with no contact → behaves like a clay.`,
    Fig: FigAll,
  },
  {
    id: 't-floc-disp',
    topic: T,
    q: 'Mention the differences between flocculated and dispersed structures.',
    seen: ['2021-22'],
    a: `- **Particle arrangement:** flocculated — edge-to-face, random; dispersed — face-to-face, parallel.
- **Forces:** flocculated — net attraction (positive edges to negative faces, high electrolyte); dispersed — net repulsion between faces (double-layer repulsion).
- **Void ratio:** flocculated high (large voids); dispersed low.
- **Origin:** flocculated — natural sedimentation, especially in salt water (marine clays); dispersed — remoulding / compaction wet of optimum, or fresh-water deposition.
- **Strength and compressibility:** flocculated — higher strength in the undisturbed state, lower compressibility at low stress, loses strength when remoulded (sensitive); dispersed — lower strength, more compressible at first.
- **Permeability:** flocculated higher (large interconnected voids); dispersed lower.
- **Vibration:** flocculated is "less sensitive to vibration" (slide 10); remoulding turns it dispersed (slide 11).
- **Compaction link** *(SJMY sir's topic)*: dry of optimum → flocculated; wet of optimum → dispersed.`,
    Fig: FigFD,
  },
  {
    id: 't-swelling',
    topic: T,
    q: 'Write a short note on the swelling potential of kaolinite, montmorillonite and illite (with the basic silica and gibbsite sheets).',
    seen: ['2023-24'],
    a: `**Basic units** (slides 19–23): the **silica sheet (S)** — Si⁴⁺ in a tetrahedron of four O²⁻, net −1 per unit; the **gibbsite sheet (G)** — Al³⁺ in an octahedron of six OH⁻ (brucite: Mg²⁺). Clay minerals are stacks of these sheets; **isomorphous substitution** (e.g. Al³⁺ for Si⁴⁺) leaves the plates with a net negative charge, so they attract water and cations.

- **Kaolinite — lowest swelling.** 1:1 (S–G), unit ≈ 7 Å; units held by **hydrogen bonds** between the OH of the gibbsite sheet and the O of the next silica sheet — "sufficiently strong", water cannot enter between the units. The least active mineral: low plasticity, little swelling or shrinkage.
- **Illite — intermediate.** 2:1 (S–G–S), ≈ 10 Å, with some Si replaced by Al; **K⁺ ions** between the units bond them more firmly and keep most water out. Swells more than kaolinite, less than montmorillonite.
- **Montmorillonite — highest swelling.** 2:1 (S–G–S), ≈ 10 Å, units held only by weak **van der Waals** forces; dipolar water (and exchangeable cations such as Na⁺) is drawn in between the negatively charged silica surfaces, the layers separate and the mineral **expands** — on drying it shrinks and cracks. "Its excessive swelling capacity may seriously endanger the stability of overlying structures" (slide 25). Highest LL, PI and activity (bentonite).

Order of swelling: **montmorillonite ≫ illite > kaolinite**. More water attracted → more plasticity, more swelling and shrinkage.`,
    Fig: FigMin,
  },
  {
    id: 't-deposits',
    topic: T,
    q: 'Classify natural soil deposits by their origin (line diagram) and briefly indicate the characteristics of each.',
    seen: ['2012-13', '2009-10', '2008-09'],
    a: `*Origin of soils is not on AJK sir's Topic 4 slides (structure and mineralogy only); this follows Das/Arora.*

**Residual soils:** formed in place by weathering of the parent rock and not moved. Gradual change from soil to weathered rock with depth; angular grains; often stiff, red laterites in the tropics (e.g. hill soils of Chittagong).

**Transported soils**, named by the agent:
- **Alluvial (fluvial):** deposited by rivers — well-sorted, stratified; sand and gravel in channels, silt and clay on floodplains, lenses; loose to soft. Most of Bangladesh.
- **Lacustrine:** settled in lakes — fine, often **varved** (alternating silt and clay) layers, soft and compressible.
- **Marine:** in the sea — soft, fine, often organic or shelly clays; sensitive, compressible (coastal belt).
- **Glacial:** by ice — **till** (unsorted, boulders to clay, dense) and outwash (sorted sand and gravel).
- **Aeolian:** by wind — **loess** (uniform silt, collapsible when wetted) and dune sand (uniform, rounded).
- **Colluvial:** by gravity down slopes — talus, loose and angular.

**Organic (cumulose) deposits:** peat and muck from decayed vegetation in swamps — very compressible, weak (e.g. peat basins of Gopalganj–Khulna).`,
    Fig: FigTree,
  },
  {
    id: 't-transported',
    topic: T,
    q: 'Define transported soil. Name the major types of transported soil and describe how each is formed.',
    seen: ['2011-12'],
    a: `*Not on the current slides.*

**Transported soil:** soil that has been carried from the place where it was formed (by weathering of rock) and deposited elsewhere by an agent — water, wind, ice or gravity. Its properties depend on the agent: water and wind sort the grains, ice and gravity do not.

- **Alluvial:** running water erodes, carries (in suspension and as bed load) and drops sediment as the velocity falls — gravel and sand in channels and bars, silt and clay on floodplains during floods.
- **Lacustrine:** rivers bring sediment into a lake; in still water silts and clays settle, often in seasonal (varved) layers.
- **Marine:** sediments reaching the sea settle on the sea bed; salt water flocculates clays → soft marine clays; beach sands by wave action.
- **Glacial:** a moving glacier scrapes and carries rock debris; melting leaves till (moraine) and outwash plains.
- **Aeolian:** wind lifts fine sand and silt in dry regions; dunes (sand) and loess (silt) form downwind.
- **Colluvial:** soil and rock move downslope under gravity (landslides, creep) and pile up at the foot — talus.`,
  },
  {
    id: 't-cycle',
    topic: T,
    q: 'Briefly describe, with neat sketches, the geological cycle that results in the formation of soil.',
    seen: ['2007-08'],
    a: `*Not on the current slides.*

1. **Rock** — igneous (from magma), sedimentary, metamorphic — is exposed at the surface.
2. **Weathering** breaks it down: *physical* (temperature changes, frost, wetting–drying, abrasion) produces gravel, sand, silt of the same minerals (quartz, feldspar); *chemical* (oxidation, hydration, carbonation, leaching) alters minerals — feldspar → clay minerals (slide 18: clay minerals evolve from chemical weathering).
3. **Soil** results: left in place → residual; moved → transported.
4. **Transportation** by water, wind, ice and gravity sorts and rounds the grains.
5. **Deposition** in rivers, lakes, the sea; with burial, **consolidation and cementation** turn the sediments into sedimentary rock; heat and pressure make metamorphic rock.
6. **Uplift** (upheaval, tectonics) brings the rock back to the surface, and the cycle repeats.`,
    Fig: FigCycle,
  },
  {
    id: 't-bd-soils',
    topic: T,
    q: 'The three major categories of Bangladesh soil are found in seven physiographic tracts. Name the categories and the tracts, with the administrative locations of each.',
    seen: ['2011-12'],
    a: `*Not on the current slides; one common grouping is given.*

**Categories:** (1) **hill soils** (Tertiary hills), (2) **terrace soils** (Pleistocene uplands — old red clays), (3) **floodplain soils** (Recent alluvium — the greater part of the country).

**Tracts and locations:**
1. **Chittagong Hill Tracts and Chittagong hills** (hill soils): Rangamati, Khagrachari, Bandarban, eastern Chittagong, Cox's Bazar.
2. **Sylhet hills** (hill soils): north-east — Sylhet, Moulvibazar, Habiganj.
3. **Madhupur tract** (terrace): Dhaka, Gazipur, Tangail, Mymensingh — red Madhupur clay.
4. **Barind tract** (terrace): north-west — Rajshahi, Naogaon, Chapai Nawabganj, Joypurhat, Bogra, Dinajpur.
5. **Lalmai hills / Akhaura terrace** (terrace): Comilla, Brahmanbaria.
6. **River floodplains** (floodplain): Ganges, Brahmaputra–Jamuna, Meghna and Tista floodplains across the centre and north — Pabna, Sirajganj, Faridpur, Jamalpur, Rangpur …
7. **Delta, tidal and coastal plains** (floodplain): Khulna, Satkhira, Bagerhat, Barisal, Patuakhali, Noakhali, the Sundarbans; peat basins of Gopalganj–Khulna.

Engineering: hill and terrace soils are stiff, over-consolidated, good bearing; floodplain and coastal soils are soft, compressible, often organic.`,
  },
  {
    id: 't-history',
    topic: T,
    q: 'How would you classify the history of geotechnical engineering? Give at least one example of geotechnical importance for each age.',
    seen: ['2011-12'],
    a: `*Not on the current slides (Das Ch. 1).*

1. **Pre-classical (before ~1700):** empirical practice — Mesopotamian and Egyptian dykes and pyramids, Roman roads and aqueducts, the **Leaning Tower of Pisa** (1173 onwards, tilting on soft clay — a lesson in differential settlement).
2. **Classical phase I (1700–1776):** first theories of earth pressure on walls — Gautier, Bélidor, Couplet.
3. **Classical phase II (1776–1856):** **Coulomb (1776)** wedge theory and c + σ tan φ; Poncelet, Collin (slope failures in clay).
4. **Late classical (1856–1910):** **Darcy (1856)** flow through sand, Stokes (settling, hydrometer), **Rankine (1857)** earth pressure, Mohr (1900) stress circle, Atterberg (1911) consistency limits, Boussinesq (1885) stress distribution.
5. **Modern soil mechanics (1910–1927):** Swedish geotechnical commission (circular slip surfaces, Fellenius), **Terzaghi's** consolidation theory and effective stress — *Erdbaumechanik* (1925), the birth of soil mechanics.
6. **Geotechnical engineering after 1927:** Casagrande (classification, plasticity chart), Proctor compaction (1933), Skempton, Bishop, Peck; international conferences from 1936; today computers, ground improvement, earthquake geotechnics.`,
  },
  {
    id: 't-sm-ge',
    topic: T,
    q: 'Distinguish between soil mechanics and geotechnical engineering. Briefly explain the various aspects of geotechnical engineering.',
    seen: ['2011-12'],
    a: `*Not on the current slides.*

- **Soil mechanics:** the branch of science that applies mechanics and hydraulics to soil — stresses, strains, flow of water, strength and compressibility of soil as a particulate three-phase material (Terzaghi).
- **Geotechnical engineering:** the engineering application of soil mechanics, rock mechanics and engineering geology to the design and construction of works in and on the ground. Soil mechanics is the science; geotechnical engineering uses it (with judgement, site investigation and construction practice) to solve problems.

**Aspects of geotechnical engineering:**
- Site investigation and soil exploration (boring, SPT, CPT, sampling, lab tests, classification).
- Foundations: shallow (footings, rafts) and deep (piles, caissons) — bearing capacity and settlement.
- Earth-retaining structures: retaining walls, sheet piles, braced cuts (lateral earth pressure).
- Slopes and embankments: stability of natural and made slopes, earth dams.
- Seepage and drainage: flow nets, dewatering, piping, filters.
- Ground improvement: compaction, preloading with sand drains, grouting, stabilisation.
- Pavement subgrades (AASHTO classification), earthquake geotechnics (liquefaction), environmental geotechnics (landfills).`,
  },
]
