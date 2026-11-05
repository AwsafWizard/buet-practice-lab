import { energy, MODIFIED, STANDARD } from '../../engine/compaction'
import type { SmTheoryItem } from '../../types'
import { EnergyCurves, SandConeFig, SoilTypeCurves, StructureFig } from './figs'

const T = 'sm-comp' as const
const es = energy(STANDARD)
const em = energy(MODIFIED)

export const COMP_THEORY: SmTheoryItem[] = [
  {
    id: 't-curve',
    topic: T,
    q: 'What is a compaction curve? Give its salient features. What is a zero-air-void line, and what is its significance? (Short note: zero air void curve.)',
    seen: ['2023-24', '2021-22', '2015-16', '2010-11', '2008-09'],
    a: `**Compaction curve:** dry unit weight γd plotted against moulding water content w for a **given compactive effort** (Proctor test).

**Salient features:**
- It rises to a peak, $\\gamma_{d,max}$ (MDD) at the **optimum moisture content (OMC)**, then falls.
- Dry side: water lubricates the grains, they slide into a denser packing, so γd rises. Wet side: extra water takes up space the solids could fill, so γd falls.
- Dry of optimum the clay structure is **flocculated**, wet of optimum **dispersed** (sketch).
- The curve always lies **below the ZAV line** and runs roughly parallel to it on the wet side.
- More effort moves the peak **up and to the left**; the shape depends on the soil type.

**Zero-air-void line:**
$$\\gamma_{zav} = \\frac{G_s\\gamma_w}{1 + wG_s}\\quad(\\text{from } \\gamma_d = G_s\\gamma_w/(1 + wG_s/S),\\ S = 1)$$
- The dry unit weight at full saturation: the theoretical maximum at any w (no air left to expel). It is a curve, not a straight line.
- **No part of a compaction curve can lie above it.** A point above it means a wrong Gs, w or γ: it checks the test data.
- Lines for S = 90 %, 80 % can cross the curve; the peaks of curves for different energies lie near one S line (line of optimums, S ≈ 80–85 %).`,
    Fig: StructureFig,
  },
  {
    id: 't-soiltypes',
    topic: T,
    q: 'Discuss the compaction characteristics of various soil types. Draw qualitative diagrams showing the variation of laboratory compaction curves for different soil types. (Moisture–density relation for soil type at a given energy.)',
    seen: ['2023-24', '2020-21', 'Jan 2021'],
    a: `Four typical shapes (Das Fig 4.5, Lecture 4), all below their ZAV lines:
- **A. Bell-shaped**, one clear peak: the usual one, clays with 30 < LL < 70.
- **B. One-and-a-half peaks**: sands and clays with LL < 30. At very low w, capillary tension holds the grains apart and the volume grows (**bulking of sand**), so γd first **drops**; it then rises to its maximum near full saturation.
- **C. Double peak**: soils with LL < 30 or LL > 70 (not common).
- **D. Odd-shaped, flat**: soils with LL > 70 (not common).

**Gradation (cohesionless soils):** well-graded soil (small grains fill the voids of the large ones) gives a higher MDD and a **sharp** peak, so γd is sensitive to w; poorly graded soil gives a lower, nearly **flat** curve.

**In general:** coarse soils reach a higher MDD at a lower OMC (e.g. well-graded gravelly sand ≈ 20–21 kN/m³ at 7–9 %); plastic clays a lower MDD at a higher OMC (≈ 15–16 kN/m³ at 20–25 %).`,
    Fig: SoilTypeCurves,
  },
  {
    id: 't-energy',
    topic: T,
    q: 'Discuss the moisture–density relations in a laboratory test for variation in compaction energy for a given soil.',
    seen: ['Jan 2021'],
    a: `- More compactive energy (Modified ≈ 4.55 × Standard) shifts the curve **up and to the left**: **MDD increases, OMC decreases**. With more energy, less water is needed to bring the grains together.
- The peaks for different energies lie on a **line of optimums** roughly parallel to the ZAV line (S ≈ 80–85 %).
- On the far wet side the curves **converge** toward the ZAV line: energy cannot drive out water.
- The gain is not proportional: MDD grows roughly with log(energy).
- Field: heavier rollers or more passes act like more energy; the lab test chosen (Standard for light works, Modified for highways and airfields) must match the field effort.
- Example (2017-18 Q5(a)): Standard 1.76 t/m³ at 15.5 %, Modified 1.92 t/m³ at 11.7 %.`,
    Fig: EnergyCurves,
  },
  {
    id: 't-why-lab',
    topic: T,
    q: 'Why are compaction tests done in the laboratory? Explain the term OMC and how it is determined. What is percent compaction and what is its use?',
    seen: ['2016-17', '2007-08', '2009-10'],
    a: `**Why:** the lab Proctor test gives the **moisture–density relationship** of the fill soil for a given energy, i.e. the best density it can reach ($\\gamma_{d,max}$) and the water content for it (OMC). These become the **reference for the field specification** and quality control, and tell the contractor what water content to place at.

**OMC:** the water content at which a given compactive effort gives the maximum dry density. **Determination:** mix the soil at about 4–5 water contents (e.g. 8, 12, 16, 20, 24 %); compact each in the 943.3 cm³ mould (3 layers × 25 blows of the 2.5 kg rammer falling 305 mm for Standard); weigh, $\\gamma = W/V$; find w; $\\gamma_d = \\gamma/(1 + w)$; plot γd against w; **OMC is the abscissa of the peak**, MDD its ordinate.

**Percent (relative) compaction:** $RC = \\gamma_{d,field}/\\gamma_{d,max(lab)} \\times 100$ %. Used to **accept or reject** each compacted lift (usually RC ≥ 90–95 % of Standard or Modified; it can exceed 100 %). Not the same as relative density (Dr, for clean sands); $RC \\approx 80 + 0.2D_r$ (Lee & Singh).`,
  },
  {
    id: 't-proctor',
    topic: T,
    q: 'Describe the salient features of the Standard and Modified Proctor tests.',
    seen: ['2009-10'],
    a: `Standard: ASTM D-698 / AASHTO T-99. Modified: ASTM D-1557 / AASHTO T-180 (R. R. Proctor, 1933).

- **Mould:** both 101.6 mm (4 in) diameter, 943.3 cm³ (1/30 ft³), with collar and base plate.
- **Rammer:** Standard 2.5 kg (5.5 lb) falling 305 mm (12 in); Modified 4.54 kg (10 lb) falling 457 mm (18 in).
- **Layers × blows:** Standard 3 × 25; Modified 5 × 25.
- **Energy** $E = \\dfrac{\\text{blows} \\times \\text{layers} \\times W \\times h}{V}$: Standard $\\dfrac{25 \\times 3 \\times 5.5 \\times 1}{1/30} = ${Math.round(es.ftlb)}$ ft-lb/ft³ ≈ ${Math.round(es.kJ * 10) / 10} kJ/m³; Modified ${Math.round(em.ftlb)} ft-lb/ft³ ≈ ${Math.round(em.kJ)} kJ/m³ (≈ 4.55 ×).
- **Use:** Standard for light compaction (minor roads, ordinary fills); Modified for heavy compaction (highways, airfields, major dams).
- **Procedure** (both): compact at increasing w, γ = W/V, γd = γ/(1 + w), plot, read MDD and OMC. Larger (6 in) moulds take 56 blows per layer for coarse soils.`,
  },
  {
    id: 't-spec',
    topic: T,
    q: '"There are two ways of specifying compaction of earthwork" — explain.',
    seen: ['2017-18', '2015-16'],
    a: `**1. End-product (performance) specification** — the most common:
- states the result: field $\\gamma_d \\ge$ 90–95 % of Standard or Modified $\\gamma_{d,max}$ (relative compaction), moulding w within OMC ± 1.5–2 %; for clean sands Dr ≥ 70–80 %.
- The contractor chooses the plant and method; the engineer checks every lift with field density tests (sand cone, core cutter, rubber balloon, nuclear gauge) and rejects failing lifts.

**2. Method (procedural) specification:**
- states the procedure: roller type and weight, lift thickness (150–300 mm), number of passes, water content, usually fixed after a **trial strip**.
- Compliance is checked by supervision, with fewer density tests. Suits large jobs with uniform soil, or materials hard to test (rock fill).

The ZAV line (part of the same question in 2015-16): see the compaction-curve card.`,
  },
  {
    id: 't-control',
    topic: T,
    q: 'How are laboratory compaction results used for specifying and controlling field compaction? (Short note: field compaction control.)',
    seen: ['2021-22', '2020-21'],
    a: `1. **Lab test** on the borrow soil (Standard for light works, Modified for heavy) gives $\\gamma_{d,max}$ and OMC.
2. **Specification:** field $\\gamma_d \\ge RC \\times \\gamma_{d,max}$ (RC = 90–95 %), w within OMC ± 1.5–2 % (dry side for strength, wet side for low permeability in cores).
3. **Placement:** water is added (or the soil dried) to the target w; spread in lifts of 150–300 mm; rolled with the right roller.
4. **Control:** each lift is tested in the field — sand cone, core cutter, rubber balloon or nuclear gauge — giving γ, w and $\\gamma_d$; RC is computed and plotted against the spec window on the compaction chart. Failing lifts are reworked: too dry → add water and re-roll; too wet → dry out; under-compacted → more passes.
5. **Trial strips** calibrate the passes and lift thickness for the plant; OMC may be adjusted for the field.`,
  },
  {
    id: 't-rollers',
    topic: T,
    q: 'Mention the various types of rollers and the soil types they suit.',
    seen: ['2021-22', '2020-21'],
    a: `- **Smooth steel-drum (wheel) roller:** static pressure 310–380 kPa, 100 % coverage. Proof-rolling and finishing sub-grades and bases; sandy and clayey soils in thin lifts. Not for thick lifts.
- **Pneumatic rubber-tyred roller:** 4–6 closely spaced tyres per row; pressure plus kneading, 585–690 kPa, 70–80 % coverage. Sandy and clayey soils, mixed soils, asphalt.
- **Sheepsfoot roller:** 25–85 cm² feet; 1380–6900 kPa under them. **Clays** and cohesive soils; compacts the lower part of the lift first, then the middle and top in later passes.
- **Vibratory roller:** off-centre rotating weights on a smooth, tyred or sheepsfoot roller. **Granular soils** (sand, gravel).
- **Vibratory plate (hand):** ≥ 1600 cycles/min. Granular soils in small or confined areas (trenches, behind walls).
- **Vibroflot:** deep compaction of thick loose granular deposits.

Field factors: lift thickness, roller type and weight (1–20 t), number of passes, water content, vibration frequency.`,
  },
  {
    id: 't-sandcone',
    topic: T,
    q: "Explain (state the method of determining field density by) the 'Sand Cone Method'.",
    seen: ['2023-24', '2021-22'],
    a: `**Principle:** dig a hole in the compacted ground, weigh all the soil taken out (and find its w), and measure the hole's volume by filling it with a dry, uniform standard (Ottawa) sand of known density.

**Calibration (before field use):**
1. Sand density $\\gamma_{sand} = W/V$ by filling a container of known volume.
2. Jar + cone full of sand weighed ($W_1$); inverted on a flat plate, valve opened until the sand stops, weighed again ($W_2$): sand to fill the cone $W_{cone} = W_1 - W_2$.

**Field test:**
1. Jar + cone + sand weighed ($W_3$).
2. Level the ground, seat the base plate, dig a hole (≈ 10–15 cm) through its opening; keep **all** the soil, weigh it ($W_{wet}$) and dry a sample for w (dry weight $W_4$).
3. Invert the cone on the plate, open the valve until the sand stops, close it, weigh the rest ($W_5$).

**Calculation:** sand in the hole $W_6 = W_3 - W_5 - W_{cone}$; $V = W_6/\\gamma_{sand}$; $\\gamma = W_{wet}/V$; $\\gamma_d = W_4/V = \\gamma/(1 + w)$; $RC = \\gamma_d/\\gamma_{d,max}$.

**Precautions:** no vibration nearby (it densifies the sand), dry free-flowing sand, recalibrate for each batch, smooth hole walls, no soil lost.`,
    Fig: SandConeFig,
  },
  {
    id: 't-vs-consol',
    topic: T,
    q: 'Distinguish between compaction and consolidation. What factors affect compaction?',
    seen: ['2010-11'],
    a: `- **Compaction:** densification by **mechanical energy** (rolling, tamping, vibration) applied for a short time; **air** is expelled, w stays the same; partially saturated soils; deliberate ground improvement; almost instant.
- **Consolidation:** volume decrease of a **saturated** soil under a **sustained static load**; **water** is squeezed out; mainly clays; time-dependent (months to years); the soil's natural response to loading (settlement).

**Factors affecting compaction (Lecture 4):**
- **Water content** (lubrication; OMC).
- **Compactive effort**: amount and type (static, kneading, impact, vibration).
- **Soil type**: grain size and gradation, plasticity, minerals.
- Lift thickness, number of passes, method/equipment.

**Effects of compaction:** density and shear strength ↑, bearing capacity ↑; voids, compressibility, settlement, permeability and liquefaction potential ↓.`,
  },
]
