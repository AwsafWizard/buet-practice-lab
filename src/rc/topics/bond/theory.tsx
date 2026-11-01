// rc-bond theory bank: every bond / anchorage / splice / cut-off / detailing theory part in papers P1–P4, merged.

import { standardCutoffs } from '../../engine/bond'
import type { RcTheoryItem } from '../../types'
import { BondCrackFig, CutoffRulesFig, ftIn, HookFig, StdCutoffFig, TaperCantFig } from './figs'

const s20 = standardCutoffs(20)

const T = (id: string, q: string, seen: string[], a: string, Fig?: RcTheoryItem['Fig']): RcTheoryItem => ({ id, topic: 'rc-bond', q, seen, a, Fig })

export const BOND_THEORY: RcTheoryItem[] = [
  T(
    'th-factors',
    'Briefly discuss the factors that influence the development length of a reinforcing bar (in tension; and in compression).',
    ['2023-24', '2021-22', '2020-21', 'Jan 2021', '2015-16', '2014-15', '2013-14', '2012-13', '2011-12', '2010-11', '2009-10', '2008-09', '2005-06', '2004-05', '2002-03'],
    `**Development length** ld is the embedment needed to develop the full yield force $A_bf_y$ of a bar by bond, before it pulls out or splits the concrete. In the ACI general equation
$$\\ell_d = \\frac{3}{40}\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\frac{\\psi_t\\psi_e\\psi_s}{(c_b+K_{tr})/d_b}\\,d_b$$
every term is one factor:
- **Yield strength fy** — the force to be developed is $A_bf_y$, so ld ∝ fy.
- **Bar diameter db** — force ∝ db² but bonded surface per inch ∝ πdb, so ld ∝ db (bigger bars need longer ld).
- **Concrete tensile strength (√f′c)** — splitting resistance grows with √f′c, so ld ∝ 1/√f′c; capped at √f′c = 100 psi.
- **Concrete type λ** — lightweight concrete has lower tensile strength: λ = 0.75 (ld longer).
- **Cover** and **bar spacing** — the smaller of the cover to the bar centre and half the centre spacing (cb) sets the splitting resistance; small cover/spacing → splitting failure → longer ld.
- **Transverse reinforcement (Ktr = 40Atr/sn)** — stirrups crossing the splitting plane confine the bar and delay splitting. (cb + Ktr)/db is capped at 2.5, beyond which pull-out governs.
- **Vertical bar location ψt = 1.3** — bars with more than 12 in of fresh concrete below (top bars): bleed water and air collect under the bar, weakening bond.
- **Epoxy coating ψe = 1.5 / 1.2** — coating destroys adhesion and reduces friction; 1.5 when cover < 3db or clear spacing < 6db. ψtψe ≤ 1.7.
- **Bar size ψs** — No. 6 and smaller: 0.8.
- **Excess reinforcement** — if As,prov > As,req the bar stress is lower: × As,req/As,prov (not for splices).
- Minimum ld = 12 in.

**Compression bars** (Jan 2021): ldc = max(fy db/(50λ√f′c), 0.0003 fy db) ≥ 8 in. Factors: fy, db, √f′c, λ, **confinement** by spirals or No. 4 ties at ≤ 4 in (× 0.75) and excess steel. Cover, top-bar and epoxy effects do not apply; ldc is shorter because there are no flexural tension cracks and part of the force goes by **end bearing**.`,
  ),
  T(
    'th-classab',
    'What is splicing? Briefly explain Class A and Class B splices for tension bars. (If ld of a #8 bar is 50 in, find the Class A and B lap lengths.)',
    ['2023-24', '2021-22', 'Jan 2021', '2015-16', '2014-15', '2007-08'],
    `**Splicing** joins two bars so that force passes from one to the other — needed because bars come in limited lengths (40 ft) and at construction joints. Types: **lap splice** (bars overlapped and wired; force transfers through the surrounding concrete by bond — only for No. 11 and smaller), **welded** (must develop 1.25 fy) and **mechanical couplers** (threaded sleeves), and end bearing for compression only.

**Tension lap splices (ACI 25.5.2)** are classified by the stress level and the fraction of bars spliced at one place:
- **Class A: lst = 1.0 ld** — allowed only when **As,prov ≥ 2 As,req over the whole splice length AND ≤ 50 % of the bars are spliced within the lap length**.
- **Class B: lst = 1.3 ld** — all other cases (the default).
- ld from the usual equation with all ψ factors but **without** the As,req/As,prov factor (the class already rewards excess steel). lst ≥ 12 in (for Class B the 12 in applies to 1.3 ld).

Purpose: encourage splices away from maximum-stress regions (where As,prov ≥ 2As,req) and **staggered** (≤ 50 % at a section), so that a weak plane of splitting cracks does not form across all bars at one section.

Example: ld = 50 in → Class A = 1.0 × 50 = **50 in**; Class B = 1.3 × 50 = **65 in**.`,
  ),
  T(
    'th-colsplice',
    'State the minimum lap lengths for column splices as per ACI/BNBC (also tension and compression splices in general).',
    ['2023-24', '2020-21', 'Jan 2021', '2017-18', '2016-17', '2013-14', '2010-11', '2005-06'],
    `Column bars may be in compression, tension or both (different load combinations), so column splices satisfy the compression rules, the tension rules, or both. ACI also requires a minimum **tension capacity in each face** of every column.

**1. Bar stress in compression (factored loads) — compression lap splice:**
- fy ≤ 60,000 psi: $\\ell_{sc} = 0.0005f_yd_b$; fy > 60,000 psi: $\\ell_{sc} = (0.0009f_y - 24)d_b$; **not less than 12 in**.
- f′c < 3000 psi → increase by ⅓.
- Bars of different size: the larger of **ldc of the larger bar** and **lsc of the smaller bar**.
- **Tied columns** with effective tie area ≥ 0.0015hs in both directions → × 0.83; **spiral columns** → × 0.75 (still ≥ 12 in).
- End-bearing splices allowed if staggered or with extra bars; continuing bars in each face must give ≥ 0.25 fy × As of that face.

**2. Bar stress in tension:**
- ≤ 0.5 fy: **Class A** (1.0 ld) if ≤ half the bars are spliced at any section and alternate splices are staggered by ld; otherwise **Class B** (1.3 ld).
- > 0.5 fy: **Class B** (1.3 ld).

**3. Tension laps in general** (beams): Class A 1.0ld / Class B 1.3ld ≥ 12 in (see Class A/B). No lap splices for bars > No. 11 (No. 14/18 may be lapped to No. 11 and smaller in compression).

**Where:** usually just above the floor (convenience); in frames with lateral load, within the middle half of the column height where moments are smaller (mandatory in special moment frames). Typical: No. 8 at fy 60 ksi → 0.0005 × 60,000 × 1.0 = 30 in.`,
  ),
  T(
    'th-stdcutoff',
    'Show with neat sketches the cut-off or bend points for bars in approximately equal spans with uniformly distributed loads (straight and cranked bars; e.g. three equal 20 ft clear spans).',
    ['2023-24', '2020-21', 'Jan 2021', '2017-18', '2016-17', '2015-16', '2013-14', '2012-13', '2010-11', '2005-06'],
    `Standard detail (Nilson Fig. 5.20 / 6.21; CRSI) for continuous beams/slabs with **approximately equal spans** (adjacent spans within about 20 %) and **uniform load**, when a moment diagram is not drawn. L = clear span.

**(a) Straight bars**
- **Top (negative) bars** at an interior support extend **L/3** past the face into each adjacent span; at the exterior (spandrel/wall) support they extend **L/4** and are hooked into the support.
- **Bottom (positive) bars:** about half are cut **L/8** from each support face; the rest (≥ ¼, ≥ ⅓ for simple spans) run **6 in into the support**.

**(b) Bent (cranked) bars**
- Bottom bars bend up at **L/4** from an interior support face and at **L/7** from the exterior face, rise to the top and continue over the support as negative steel.
- Straight top bars over interior supports still extend **L/3**; straight bottom bars run 6 in into the supports.

**Three equal spans, ln = 20 ft:** L/3 = **${ftIn(s20.topInterior)}**, L/4 = **${ftIn(s20.topExterior)}**, L/8 = **${ftIn(s20.bottomCut)}**, bend points L/4 = **${ftIn(s20.bendInterior)}** (interior) and L/7 = **${ftIn(s20.bendExterior)}** (exterior), bottom bars 6 in into supports. Draw both panels with these dimensions.

Basis: the moment envelope of equal spans — negative moment reaches zero about 0.2–0.25L from an interior support, so L/3 covers the inflection point plus d/12db/ln/16; positive moment is small within L/8 of the supports.`,
    () => <StdCutoffFig L1={20} L2={20} />,
  ),
  T(
    'th-hooks',
    'Why are hooks provided in reinforcing bars? Draw the standard hook dimensions per the ACI code.',
    ['2023-24'],
    `**Why hooks:** when there is not enough straight length to develop the bar (beam bars ending in a column, cantilever bars at the support, ends of simply supported beams, stirrups), a hook provides **mechanical anchorage**: the bend bears on the concrete inside it, so the required embedment drops to ldh ≈ ⅓ of straight ld. For a No. 9 bar at f′c = 5000 psi: straight ld ≈ 48 in, hooked ldh ≈ 13 in. Hooks only help in **tension** (not effective in compression). Stirrup hooks anchor the web steel in the compression zone.

**Standard hooks (ACI 25.3):**
- **90° hook:** 90° bend + extension of **12db** at the free end.
- **180° hook:** 180° bend + extension of **4db, not less than 2½ in**.
- Minimum **inside bend diameter**: **6db** for No. 3–8, **8db** for No. 9–11, **10db** for No. 14 and 18.
- Stirrup/tie hooks: 90° with 6db ≥ 3 in (No. 3–5) or 12db (No. 6–8); 135° with 6db ≥ 3 in; bend 4db for No. 3–5.

**Development of a hook:** $\\ell_{dh} = \\dfrac{f_y\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b \\ge 8d_b$ and 6 in, measured from the critical section to the **outside** of the hook; ψc = 0.7 for side cover ≥ 2.5 in and tail cover ≥ 2 in; ψr = 0.8 when enclosed by ties at ≤ 3db.`,
    () => <HookFig />,
  ),
  T(
    'th-bundle',
    'Why does the ACI/BNBC code recommend increased development lengths for bars in a bundle? Mention the recommended increases.',
    ['2017-18', '2002-03'],
    `**Why:** in a bundle (2–4 bars tied in contact) part of each bar's perimeter touches the other bars, so the **concrete contact (bond) surface per bar is reduced**, and the bundle as a whole is a larger, non-round "bar" that is more prone to **splitting** along the group. Hence each bar needs a longer embedment.

**Increase (ACI 25.6.1.5):** ld of each bar = ld of the individual bar ×
- **1.20** for a **3-bar bundle** (+20 %),
- **1.33** for a **4-bar bundle** (+33 %),
- no increase for a 2-bar bundle.

Other rules: for spacing, cover, Table 6.1, Ktr and ψe the bundle is treated as one bar of equivalent diameter $d_{b,eq} = \\sqrt{4nA_b/\\pi}$; cut-offs of bars within a bundle staggered at least **40db**; at most 4 bars per bundle; bars larger than No. 11 not bundled in beams; lap splices of bundles based on the individual bar length increased by 20 % / 33 %; bundles in compression enclosed by at least No. 4 ties.`,
  ),
  T(
    'th-extend',
    'Why must every bar continue at least d or 12 bar diameters (whichever is larger) beyond the point where it is theoretically no longer needed? Why cannot bars be cut exactly at the theoretical cut-off point?',
    ['2011-12'],
    `Tensile steel is required roughly in proportion to moment (T = M/jd), so in theory bars can stop where the moment diagram falls to the capacity of the remaining bars. ACI forbids stopping them exactly there because:
1. **Diagonal (shear) cracking shifts the steel force.** After an inclined crack forms, the tension in the steel at a section is governed by the moment at the section where the crack meets the compression zone — about **d** closer to the maximum moment. So the bar force at a point is higher than the moment there suggests ("shifted moment diagram").
2. **The real moment diagram differs from the design one** — approximate loads, approximate analysis, pattern loading, support settlement and lateral loads can move the diagram.
3. Bars cut in a tension zone cause a **stress concentration** and early flexural and diagonal cracks at the cut end, reducing shear strength and ductility.

Hence ACI 9.7.3.3: extend each bar **max(d, 12db)** beyond the theoretical cut-off point (except at simple supports and free ends of cantilevers), and (9.7.3.4) continuing bars must have at least **ld** beyond the point where the cut bars are no longer needed; cut bars need **ld** from their point of maximum stress. Cutting in a tension zone also needs Vu ≤ ⅔φVn (or extra stirrups, or 2 × As with Vu ≤ ¾φVn).`,
    () => <CutoffRulesFig />,
  ),
  T(
    'th-taper',
    'Explain the procedure to curtail rebars in a cantilever beam of variable depth (sketch the cut-off points for a cantilever of variable depth with a concentrated load at the free end, 50 % of the bars continued).',
    ['2014-15', '2009-10'],
    `**Procedure** (top bars of a tapered cantilever):
1. Draw the factored moment diagram from the free end: for a tip load P (self-weight neglected) $M_u = P\\,x$ — **linear**, maximum at the support face.
2. Compute the capacity of the continuing bars at several sections: $\\phi M_n = \\phi A_sf_y(d - a/2)$ with the **local d**, which **decreases toward the tip** — so the capacity line is **sloping**, not horizontal.
3. The theoretical cut-off point is where the Mu line meets the φMn line of the continuing (50 %) bars — solve $P x = \\phi A_{s,50}f_y(d(x) - a/2)$ with d(x) linear between d_support and d_tip.
4. Extend the cut bars **max(d, 12db)** beyond that point toward the free end, taking d at that section.
5. Check the cut bars have **ld from the face** (point of max stress), and the continuing 50 % have **ld beyond the theoretical cut-off point** to the free end (hook them at the tip if short).
6. Anchor all top bars into the column/support with a straight ld or a standard hook (ldh ≤ column depth − cover).
7. Because the cut is in a tension zone, check Vu ≤ ⅔φVn there (or provide extra stirrups).

Note: with a linear M and sloping capacity, the theoretical point is NOT at mid-length; for a tapered beam it moves toward the free end compared with a prismatic one.`,
    () => <TaperCantFig />,
  ),
  T(
    'th-eqterms',
    'Explain, with their limitations, all the terms of the ACI equation ld/db = (3/40)(fy/√f′c)·αβγλ/((c + Ktr)/db). Under what conditions may (c + Ktr)/db be taken as 1.5 or 1.0?',
    ['2004-05'],
    `(ACI 318-95/99 notation; today α → ψt, β → ψe, γ → ψs.)
- **fy** — yield strength (psi); the force to be developed.
- **√f′c** — concrete tensile strength (psi); **√f′c ≤ 100 psi**.
- **α (ψt)** — bar location: 1.3 for top bars (> 12 in fresh concrete below), else 1.0.
- **β (ψe)** — coating: 1.5 epoxy with cover < 3db or clear spacing < 6db; 1.2 other epoxy; 1.0 uncoated. **αβ ≤ 1.7.**
- **γ (ψs)** — size: 0.8 for No. 6 and smaller, 1.0 for No. 7 and larger.
- **λ** — lightweight concrete (1.3 in the old form, multiplying ld; 0.75 in the new form, dividing √f′c).
- **c (cb)** — smaller of the distance from the bar centre to the nearest concrete surface and half the centre-to-centre spacing (in).
- **Ktr = Atr fyt/(1500 s n)** (old) or **40Atr/(sn)** (new) — transverse steel index; Atr = area of stirrup legs crossing the splitting plane within s; n = bars developed; Ktr = 0 may always be used.
- **(c + Ktr)/db ≤ 2.5** — above it, pull-out governs and confinement gives no extra benefit.
- Result ≥ 12 in; may be × As,req/As,prov.

**Simplified values:**
- **(c + Ktr)/db = 1.5** when clear spacing ≥ db, clear cover ≥ db and code-minimum stirrups throughout ld, **or** clear spacing ≥ 2db and clear cover ≥ db → gives ld = fyψtψe db/(20λ√f′c) (No. 7+) or /25 (No. 6−).
- **(c + Ktr)/db = 1.0** in all other cases → ld = 3fyψtψe db/(40λ√f′c) (No. 7+) or 3/50 (No. 6−).`,
  ),
  T(
    'th-tensionzone',
    'Under what conditions does the ACI code permit flexural bars to be terminated in a tension zone ("cut-off if permitted by the code")?',
    ['2014-15'],
    `Cutting bars in a tension zone causes premature flexural and diagonal-tension cracks at the cut end, reducing shear capacity and ductility. ACI 9.7.3.5 (old 12.10.5) allows it only if **one** of these holds:
1. **Vu at the cut point ≤ ⅔ φVn**.
2. **Extra stirrups** beyond those needed for shear and torsion are provided along each cut bar over **¾d** from the cut point, with $A_v \\ge 60b_ws/f_{yt}$ and spacing $s \\le d/(8\\beta_b)$, βb = area of bars cut / total area at the section.
3. For **No. 11 and smaller**, the continuing bars provide **at least twice the area required for flexure** at the cut point, **and Vu ≤ ¾ φVn**.

Otherwise the bars must be carried into the compression zone (past the inflection point) or to the support. In a simply supported beam under UDL the whole span is a positive-moment tension zone, so condition 1 is normally checked at the cut point (shear is lower away from the support).`,
  ),
  T(
    'th-detail',
    'How do you make a detailed reinforcement drawing (long section + cross-sections) of a continuous beam with a cantilever, from a list of required steel areas?',
    ['2017-18', '2005-06', '2002-03'],
    `1. **Choose bars** for each required area (e.g. +As 4.3 in² → 3 No. 10 + 1 No. 8, or 4 No. 10 = 5.08 in²); prefer one or two sizes; check they fit in b (clear spacing ≥ max(db, 1 in, 4/3 aggregate)) — else two layers with 1 in clear.
2. **Bottom steel:** in each span at least ¼ of +As (⅓ for simple spans) runs 6 in into the supports; the rest stops **L/8** from the support faces (Fig. 5.20) or at the computed cut-off + d/12db.
3. **Top steel at interior supports:** extend **L/3** past each face (straight bars), or bend up bottom bars at L/4; at least ⅓ of −As continues past the inflection point by max(d, 12db, ln/16).
4. **Exterior end:** top bars (−As at A, or nominal 2 bars if not given) extend **L/4** and **hook** into the end column (ldh ≤ column depth − cover).
5. **Cantilever:** its top steel (largest area) runs to the tip (cover 2–3 in) and is anchored **back into the adjacent span** by at least ld (and past the inflection point); part may be cut along the cantilever where the moment allows.
6. Provide **2 hanger/stirrup-holder bars** at the top where no negative steel exists, and stirrups (e.g. #3 @ d/2) with spacing zones.
7. **Laps:** where top or bottom bars are spliced, lap at low-stress regions (bottom bars over supports, top bars at midspan), Class B unless shown otherwise.
8. Draw the **long section** with all bar marks, lengths and cut-off dimensions, and **cross-sections** at each support and midspan showing bar numbers, layers, stirrups, cover (1.5 in clear) and section size; note f′c, fy and cover.`,
    () => <StdCutoffFig mode="straight" />,
  ),
  T(
    'th-bondcrack',
    'Show with neat sketches bond (splitting) cracks in a beam (with shear, shrinkage and flexural cracks).',
    ['2014-15', '2011-12'],
    `**Bond cracks** run **along** the tension bars:
- **Splitting cracks** form when the ribs of deformed bars wedge against the concrete; radial pressure causes tensile hoop stress. With **small cover** the cracks run through the cover to the side or bottom face (vertical plane); with **small bar spacing** they join horizontally through the plane of the bars (horizontal plane) and the cover spalls off.
- They usually start where a **flexural or diagonal crack** meets the bar (high local bond stress) and extend along the bar toward the support — so bond and shear failure are linked.
- Contrast: **flexural cracks** are vertical from the tension face at maximum moment; **shear (diagonal tension) cracks** are inclined (~45°) near supports; **shrinkage cracks** are fine, random or at regular spacing across the member, independent of load.

Prevention: adequate cover and spacing, stirrups (Ktr) crossing the splitting plane, enough development length.`,
    () => <BondCrackFig />,
  ),
  T(
    'th-spacing',
    'Give reasons for the minimum bar spacing requirements in the ACI code.',
    ['2006-07'],
    `ACI 25.2.1: clear spacing between parallel bars in a layer ≥ **max(1 in, db, 4/3 × maximum aggregate size)**; between layers ≥ 1 in, with upper bars directly above the lower ones; in columns ≥ max(1.5 in, 1.5db, 4/3 aggregate).

Reasons:
1. **Placing concrete:** concrete (and its coarse aggregate) must flow between and around the bars and be vibrated, without honeycombing or voids under the bars.
2. **Bond:** each bar needs concrete all round it to develop bond; closely spaced bars form a weak plane and fail by **splitting** along the layer (cb = half spacing governs ld).
3. **Shear/splitting resistance** of the concrete between bars and room for the vibrator.
4. Practical placing tolerances and room for laps.`,
  ),
  T(
    'th-mech',
    'Explain the mechanism of bond (plain vs deformed bars, flexural bond U = V/jd) and the two bond failure modes.',
    [],
    `- Strain compatibility (steel strain = concrete strain) requires **bond stress** at the steel–concrete interface; a greased plain bar slips freely and the beam acts as a tied arch.
- **Plain bars:** chemical adhesion + friction only — small, easily lost, so ends need hooks.
- **Deformed bars:** ribs bear on the concrete (**mechanical interlock**) — main source of bond.
- **Flexural bond:** over dx the bar force changes by dT = dM/jd, so the bond force per unit length $U = dT/dx = V/jd$ — largest where shear is largest (near supports). Average bond stress u = U/Σo.
- **Pull-out failure:** ample cover/confinement — concrete crushes/shears in front of the ribs and the bar pulls out.
- **Splitting failure:** small cover, spacing or confinement — wedging of the ribs splits the concrete along the bar (more common, often starting at a diagonal crack). The ACI ld equation is based on splitting; (cb + Ktr)/db ≤ 2.5 marks the change to pull-out.`,
  ),
  T(
    'th-whyfactors',
    'Why are top bars and epoxy-coated bars penalized, why is √f′c capped at 100 psi, and why is (cb + Ktr)/db capped at 2.5?',
    [],
    `- **Top bars (ψt = 1.3):** with more than 12 in of fresh concrete below, bleed water and entrapped air rise and collect under the bar; the concrete under it is weaker and porous, so bond is lower.
- **Epoxy (ψe = 1.5 / 1.2):** the smooth coating eliminates adhesion and reduces friction on the ribs; worse (1.5) when cover < 3db or spacing < 6db because splitting then governs. ψtψe ≤ 1.7 since the two effects overlap.
- **√f′c ≤ 100 psi:** test data show bond strength increases more slowly than √f′c for high-strength concrete (> 10,000 psi), so no extra credit.
- **(cb + Ktr)/db ≤ 2.5:** above this the failure changes from splitting to pull-out, so more cover or stirrups gives no further benefit; at 2.5, ld = 0.03 fy db/√f′c.
- **ψs = 0.8** for No. 6 and smaller: small bars performed better than the equation predicts.`,
  ),
  T(
    'th-misc',
    'Why does a compression bar need a shorter development length than a tension bar? Why is the excess-steel factor not used for lap splices? Why should splices be staggered and kept away from maximum stress?',
    [],
    `- **Compression shorter:** no flexural tension cracks along the bar to weaken bond, and part of the force is transferred by **end bearing** of the bar on the concrete → ldc = max(0.02fy/√f′c, 0.0003fy)db ≥ 8 in.
- **No As,req/As,prov in laps:** the Class A/B choice already rewards excess steel (Class A needs As,prov ≥ 2As,req); applying both would double-count.
- **Stagger / low stress:** a splice is the weakest link — splitting cracks at all laps in one section would form a continuous failure plane. Splices at sections of low stress (As,prov ≥ 2As,req) and ≤ 50 % at one place (Class A) are safer; columns in lateral-load frames are spliced at mid-height where moments are small. Bars larger than No. 11 need welded or mechanical splices (welds develop 1.25fy so yielding occurs away from the splice).`,
  ),
]
