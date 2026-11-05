// Classification theory with full-mark model answers.
import { PlasticityChart } from '../../reference/idx'
import type { SmTheoryItem } from '../../types'
import { GradingShapes } from './figs'

const T = 'sm-class' as const
const FigChart = () => <PlasticityChart />
const FigShapes = () => <GradingShapes />

export const CLASS_THEORY: SmTheoryItem[] = [
  {
    id: 't-plchart',
    topic: T,
    q: 'Draw neatly the plasticity chart of the Unified Soil Classification System, showing the classifications of the important soil deposits.',
    seen: ['2017-18', '2020-21'],
    a: `**Axes:** liquid limit LL (0–100) horizontally, plasticity index PI (0–70) vertically.

**Lines** (Das Fig. 5.3, based on Casagrande's chart):
- **A-line:** $PI = 0.73(LL - 20)$ — through (20, 0), (50, 21.9), (100, 58.4). Separates clays (above) from silts and organic soils (below).
- **U-line:** $PI = 0.9(LL - 8)$ — through (16, 7.2), (50, 37.8), (85.8, 70). The upper limit for natural soils; points above it mean an error in the data.
- **LL = 50** vertical line: L (low plasticity, LL < 50) on the left, H (high) on the right.
- **Hatched CL-ML band:** 4 ≤ PI ≤ 7 between the U-line and the A-line (LL ≈ 12–30).

**Zones:** CL or OL (above A, LL < 50); ML or OL (below A, LL < 50); CH or OH (above A, LL ≥ 50); MH or OH (below A, LL ≥ 50); CL-ML in the hatched band.
- Organic (O) when LL(oven-dried)/LL(not dried) < 0.75.
- Typical deposits: lean and sandy clays CL; silty fine sands and rock flour ML; kaolinite-rich soils near the A-line (MH or CL at LL 40–60); montmorillonite (bentonite) clays far up and right (CH); organic silts and clays below the A-line (OL, OH).`,
    Fig: FigChart,
  },
  {
    id: 't-aashto',
    topic: T,
    q: 'State the salient features of the AASHTO soil classification system.',
    seen: ['2008-09'],
    a: `- **Purpose:** rates soils as **highway subgrade** material (AASHTO M 145).
- **Size limits:** gravel 76.2 (75) – 2.0 mm, sand 2.0 – 0.075 mm, silt-clay below 0.075 mm; boulders and cobbles (over 75 mm) are excluded but recorded.
- **Two divisions:** *granular* materials (35 % or less passing No. 200): A-1, A-3, A-2; *silt-clay* materials (more than 35 % passing No. 200): A-4, A-5, A-6, A-7.
- **Seven groups, with subgroups:** A-1-a, A-1-b, A-3, A-2-4 … A-2-7, A-4, A-5, A-6, A-7-5, A-7-6 (A-7-5 if PI ≤ LL − 30, A-7-6 if PI > LL − 30). A-8 for peat/muck by inspection.
- **Data used:** % passing No. 10, 40, 200 and LL, PI of the minus-No. 40 fraction. "Silty" = PI ≤ 10, "clayey" = PI ≥ 11.
- **Procedure:** left-to-right elimination in Table 5.1; the first group that fits is the answer (A-3 before A-2 only for this reason).
- **Group index** for quality within a group: $GI = (F-35)[0.2+0.005(LL-40)] + 0.01(F-15)(PI-10)$, negative → 0, rounded, no upper limit; A-2-6/A-2-7 PI term only; A-1, A-3, A-2-4, A-2-5 → 0. Written as A-7-6(42). Subgrade quality is inversely proportional to GI.
- **Rating:** granular groups excellent to good; silt-clay groups fair to poor.
- Toolkit on the slides: "Table 5.1, Figure 5.2 and the Group Index".`,
  },
  {
    id: 't-uscs',
    topic: T,
    q: 'State the salient features of the Unified Soil Classification System (USCS).',
    seen: ['2009-10'],
    a: `- **Origin:** Casagrande (1942) for airfields; adopted by the US Army Corps of Engineers and Bureau of Reclamation; standardised as ASTM D2487. Used for general engineering.
- **Size limits:** gravel 76.2 – 4.75 mm (No. 4), sand 4.75 – 0.075 mm (No. 200), fines (silt + clay) below 0.075 mm.
- **Two-letter group symbols:** first letter G, S (coarse), M, C, O (fine), Pt (peat); second letter W, P (grading) or L, H (LL below / above 50).
- **Coarse-grained** (more than 50 % retained on No. 200): gravel if more than half the coarse fraction is retained on No. 4, else sand. Fines < 5 %: W or P by $C_u$ ($\\ge 4$ gravel, $\\ge 6$ sand) and $1 \\le C_c \\le 3$; fines > 12 %: M or C by the plasticity chart; 5–12 %: **dual symbols** (SW-SM …); hatched zone: SC-SM, GC-GM.
- **Fine-grained** (50 % or more passing No. 200): plasticity chart — A-line $0.73(LL-20)$, LL = 50 → CL, ML, CH, MH, CL-ML; organic (OL, OH) if LL(oven-dried)/LL < 0.75.
- **Group names** from flowcharts (Das Figs 5.4–5.6) using % sand and % gravel (e.g. "clayey sand with gravel", "sandy lean clay").
- Toolkit on the slides: Table 5.2 → Fig. 5.3 → Fig. 5.4.`,
  },
  {
    id: 't-compare',
    topic: T,
    q: 'Compare the AASHTO and the Unified classification systems.',
    seen: ['2008-09', '2009-10'],
    a: `- **Use:** AASHTO for highway subgrades (rating, group index); USCS for all engineering works (foundations, dams, airfields).
- **Gravel/sand boundary:** AASHTO 2.0 mm (No. 10); USCS 4.75 mm (No. 4).
- **Coarse/fine boundary:** AASHTO 35 % passing No. 200 (soils with 36 % fines are already "silt-clay"); USCS 50 %. AASHTO calls many soils fine that USCS calls coarse (e.g. SC with 40 % fines is A-6).
- **Grading:** USCS uses $C_u$ and $C_c$ (W/P); AASHTO ignores the shape of the grading curve beyond three sieves.
- **Plasticity:** AASHTO splits at LL 40 and PI 10 (Fig. 5.2) with A-7-5/A-7-6 by LL − 30; USCS uses the A-line and LL = 50.
- **Organic soils:** USCS has OL, OH, Pt (oven-dried LL test); AASHTO puts peat in A-8 by inspection only.
- **Output:** AASHTO gives a group plus a numerical quality index (GI); USCS gives a symbol and a descriptive group name.
- Both need only sieve analysis and Atterberg limits.`,
  },
  {
    id: 't-sizes',
    topic: T,
    q: 'Classify different types of soil based on particle size according to ASTM D422 (and the other organizations).',
    seen: ['2021-22'],
    a: `**ASTM (D422 / D2487 sizes):**
- Gravel: 76.2 – 4.75 mm (No. 4)
- Sand: 4.75 – 0.075 mm (No. 200) — coarse 4.75–2.0, medium 2.0–0.425, fine 0.425–0.075 mm
- Silt: 0.075 – 0.005 mm
- Clay: below 0.005 mm (colloids below 0.001 mm)

**Other organizations** (Topic 2 slide 3):
- MIT: gravel > 2, sand 2–0.06, silt 0.06–0.002, clay < 0.002 mm.
- USDA: gravel > 2, sand 2–0.05, silt 0.05–0.002, clay < 0.002 mm.
- AASHTO: gravel 76.2–2, sand 2–0.075, silt 0.075–0.002, clay < 0.002 mm.
- BNBC 2020: gravel 76.2–4.75, sand 4.75–0.075, silt 0.075–0.002, clay < 0.002 mm.
- USCS: gravel 76.2–4.75, sand 4.75–0.075, fines < 0.075 mm.

Gravel and sand are coarse-grained, cohesionless (flow freely when dry, not sticky). Silt and clay are fine-grained, cohesive (powdery when dry, sticky when wet). Sizes are found by sieving (down to 0.075 mm) and by hydrometer (finer).`,
  },
  {
    id: 't-f30',
    topic: T,
    q: 'Sieve analysis of a sand gave 30 % passing No. 200. What AASHTO classifications are possible?',
    seen: ['2007-08'],
    a: `- 30 % ≤ 35 % → **granular** materials (Part 1).
- A-1-a needs ≤ 15 % passing No. 200 → no. A-1-b needs ≤ 25 % → no. A-3 needs ≤ 10 % (and NP) → no.
- The A-2 subgroups allow up to 35 %: **A-2-4, A-2-5, A-2-6 or A-2-7** — LL and PI decide:
  - A-2-4: LL ≤ 40, PI ≤ 10; A-2-5: LL ≥ 41, PI ≤ 10; A-2-6: LL ≤ 40, PI ≥ 11; A-2-7: LL ≥ 41, PI ≥ 11.
- GI: 0 for A-2-4, A-2-5; PI part only for A-2-6, A-2-7: GI = 0.01(30 − 15)(PI − 10).`,
  },
  {
    id: 't-grading',
    topic: T,
    q: 'Explain well-graded, poorly graded (uniform) and gap-graded soils with grain-size curves. How do Cu and Cc tell them apart?',
    seen: ['2023-24'],
    a: `- **Uniformity coefficient** $C_u = D_{60}/D_{10}$ — the spread of sizes; **coefficient of curvature (gradation)** $C_c = D_{30}^2/(D_{60}D_{10})$ — the shape between $D_{10}$ and $D_{60}$. $D_x$ = size at which x % is finer, read on the semi-log curve.
- **Well graded** (curve II, slides 26–27): sizes spread over a wide range, smooth S-shaped curve; small grains fill the voids of the large → dense, strong, low permeability. **Cu ≥ 4 (gravel) or ≥ 6 (sand) and 1 ≤ Cc ≤ 3.**
- **Poorly graded / uniform** (curve I): most grains about the same size, steep near-vertical curve; Cu small (≈ 1–3), Cc ≈ 1 or less. Loose, permeable (beach and dune sand).
- **Gap graded** (curve III): a combination of two or more uniformly graded fractions with an intermediate size range missing; the curve has a flat step. Cu may be large but **Cc lies outside 1–3**.
- 2023-24 Q4(a): Cu = 1.9, Cc = 0.67 → poorly graded (uniform) sand (SP); 29 % of the soil lies between 0.18 and 0.15 mm, and no size range is missing, so it is not gap graded.`,
    Fig: FigShapes,
  },
  {
    id: 't-organic',
    topic: T,
    q: 'How do you decide whether a fine-grained soil is organic or inorganic for the USCS? Classify a soil with LL 84 % (air-dried) and 58 % (oven-dried), PL 45 %.',
    seen: ['2015-16', '2020-21'],
    a: `- Run the liquid limit twice: on the natural / air-dried soil and on an **oven-dried** sample. Oven drying irreversibly changes organic matter, so the LL drops sharply.
- **Organic if** $\\dfrac{LL_{\\text{oven dried}}}{LL_{\\text{not dried}}} < 0.75$ (Table 5.2); then OL (LL < 50) or OH (LL ≥ 50). Highly organic, dark, odorous, fibrous soil is **Pt** (peat).
- Organic soils are dark (grey–black) with an odour, very compressible and weak.
- **Example (2020-21 Q6(d)):** 58/84 = 0.69 < 0.75 → organic; LL = 84 ≥ 50 → **OH**. PI = 84 − 45 = 39; the A-line at LL 84 is 0.73(64) = 46.7, so the point is below it → name **organic silt** (Fig. 5.6).
- 2015-16 Q5: 45/55 = 0.82 ≥ 0.75 → inorganic → MH, sandy elastic silt.`,
  },
]
