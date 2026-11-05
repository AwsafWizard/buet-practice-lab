import type { SmTheoryItem } from '../../types'
import { DSCurvesSketch, FieldCasesSketch, MCSketch, QualCurvesSketch, StressStrainSketch, UCSketch, UUSketch, VaneSketch } from './figs'

const T = 'sm-shear' as const

export const SHEAR_THEORY: SmTheoryItem[] = [
  {
    id: 't-curves',
    topic: T,
    q: 'Draw the qualitative curves: (i) pore pressure vs axial strain for saturated NC, lightly OC and heavily OC clays in CU triaxial compression; (ii) volumetric strain vs axial strain (or shear displacement) for loose and dense sand (and NC/OC clay) in drained tests; (iii) Skempton’s B vs degree of saturation; (iv) Af vs OCR.',
    seen: ['2021-22', '2020-21', 'Jan 2021', '2017-18'],
    a: `*Items (iii) and (iv) use Skempton's A and B, which are not in AJK sir's slides — flagged, but asked in four papers.*

**(i) CU, Δu vs ε:** NC clay — Δu rises steadily to a large **positive** value at failure (the soil tries to contract). Lightly OC — smaller positive peak. Heavily OC — a small rise, then Δu falls and becomes **negative** (the soil tries to dilate; suction).

**(ii) Drained, εv vs ε (or ΔH vs displacement in direct shear):** loose sand / NC clay **contracts** throughout and levels off (volume decreases). Dense sand / OC clay contracts slightly, then **dilates** (volume increases) as grains ride over each other, levelling off at large strain (critical state). For a direct shear test the x-axis is the shear displacement.

**(iii) B vs S:** B ≈ 0 for dry soil, stays small up to S ≈ 70–80 %, then rises steeply to **B = 1 at S = 100 %** (water is far stiffer than the soil skeleton; air makes the pore fluid compressible). B ≥ 0.95 is used to check saturation in the triaxial cell.

**(iv) Af vs OCR (log scale):** Af ≈ 0.7–1.0 (up to 1.3 for sensitive clay) at OCR = 1, falling with OCR, through **zero at about OCR ≈ 4**, to **negative** values (−0.3 to −0.5) for heavily OC clay.`,
    Fig: QualCurvesSketch,
  },
  {
    id: 't-ds-curves',
    topic: T,
    q: 'Draw typical shear stress and volume change against shear displacement for dense and loose sand (or OC and NC clay) in a direct shear test, and show how the failure envelope is obtained.',
    seen: ['2021-22', '2020-21', 'Jan 2021'],
    a: `(Slides 24–27.)
- **τ vs displacement** at constant σ: dense sand / OC clay rises to a **peak** τf then drops to an **ultimate** (residual) value; loose sand / NC clay rises steadily to the ultimate value with no peak (τf = τult).
- **Change in height vs displacement:** dense / OC — slight compression, then **expansion (dilation)**; loose / NC — **compression (contraction)**.
- **Envelope:** three or more tests at σn1 < σn2 < σn3 → peaks τf1, τf2, τf3. Plot (σn, τf): a straight line with intercept **c** and slope **φ** (τf = c + σ tan φ). Fit by least squares (the slides use an Excel trend line).
- The measured point is the **tangent point** of the Mohr circle, not a principal stress (slide 27): the centre is where the normal to the envelope at (σ, τf) meets the σ-axis.`,
    Fig: DSCurvesSketch,
  },
  {
    id: 't-ss',
    topic: T,
    q: 'Draw a typical stress–strain diagram of soil to indicate yield strength, peak strength, ultimate strength, critical strength and residual strength. Under what circumstances is residual strength used?',
    seen: ['2007-08'],
    a: `- **Yield:** end of the nearly linear part; plastic strains begin.
- **Peak:** maximum τ — dense sand / OC clay only (interlocking and dilation).
- **Ultimate = critical state:** the constant τ reached at large strain when the soil shears at constant volume and constant stress; loose / NC soil reaches it without a peak.
- **Residual:** in clays, after very large displacement (metres on a slip surface) platy particles align along the shear surface and τ falls further, to the residual strength (φ′r well below φ′p, c′r ≈ 0). Measured by ring shear or repeated direct shear reversals.

**Residual strength is used** for slopes on **pre-existing slip surfaces** (old landslides, reactivated slides), **fissured / heavily OC clays and shales**, solifluction sheets, and any problem with large displacement along a surface (e.g. foundations on old slip planes).`,
    Fig: StressStrainSketch,
  },
  {
    id: 't-mc',
    topic: T,
    q: 'Describe briefly the Mohr–Coulomb failure theory.',
    seen: ['2008-09'],
    a: `- **Coulomb (1776):** shear strength on a plane is $\\tau_f = c + \\sigma\\tan\\varphi$ (c = cohesion, φ = angle of internal friction, σ = normal stress on the plane). In effective stress: $\\tau_f = c' + \\sigma'\\tan\\varphi'$.
- **Mohr (1882/1900):** failure on a plane is governed by the combination of normal and shear stress on it, τf = f(σ); the stresses at a point are shown by the Mohr circle.
- **Mohr–Coulomb:** a soil element fails when its Mohr circle **touches** the straight envelope τ = c + σ tan φ ("the Coulomb failure envelope must touch the Mohr circle tangentially", slide 18). Circles below it are safe; a circle cannot cross it.
- The **tangent point** gives the stresses on the failure plane; the failure plane is inclined at **θ = 45 + φ/2 to the major principal plane** (2θ = 90 + φ).
- Principal-stress form: $\\sigma_1 = \\sigma_3\\tan^2(45 + \\varphi/2) + 2c\\tan(45 + \\varphi/2)$.
- Failure is not on the plane of τmax (45°) — there τ is larger but σ is too, so the obliquity is lower.`,
    Fig: MCSketch,
  },
  {
    id: 't-uc',
    topic: T,
    q: 'Draw the Mohr circle at failure and the strength envelope for the unconfined compression test, and show that $c_u = q_u/2$.',
    seen: ['2008-09'],
    a: `1. In the unconfined test σ3 = 0 and the axial stress at failure is σ1 = qu (unconfined compression strength, using the corrected area A = A0/(1 − ε)).
2. The Mohr circle passes through the origin and qu: centre qu/2, radius qu/2.
3. The test is fast and undrained on saturated clay: **φu = 0**, so the envelope is **horizontal**, τf = cu.
4. A horizontal line tangent to the circle touches it at the top, at height = radius.
5. Hence $\\displaystyle c_u = R = \\frac{\\sigma_1 - \\sigma_3}{2} = \\frac{q_u - 0}{2} = \\frac{q_u}{2}$
6. The tangent point is at 2θ = 90° → the failure plane is at **45°** (pole at the origin). Consistency from qu: Das Table 12.4 (stiff 100–200 kPa, etc.).`,
    Fig: UCSketch,
  },
  {
    id: 't-uu',
    topic: T,
    q: 'Describe the behaviour of saturated clay in the UU triaxial test. What are the advantages of the triaxial test (over the direct shear test)? Show with neat sketches two examples of UU analyses in clays.',
    seen: ['2021-22', '2020-21', '2017-18'],
    a: `**UU behaviour:** the drainage valve is always closed. Increasing the cell pressure on a saturated specimen raises the pore pressure by the same amount (B = 1), so σ′ does not change; the deviator at failure is the same for every σ3. All total-stress circles have the **same diameter** → horizontal envelope, **φu = 0, τf = cu = (σ1 − σ3)f/2**; there is only one effective circle. "Applicable for cohesive soil only."

**Advantages of the triaxial test:**
- Drainage can be **controlled** (UU, CU, CD) and **pore pressure measured** → total and effective parameters.
- The specimen fails on its **weakest plane**, not a predefined horizontal one.
- **Uniform stress** distribution; the principal stresses are known throughout.
- A confining pressure σ3 is applied (the direct shear applies none) and any stress path can be followed; volume change can be measured.
(Direct-shear shortcomings, slide 36: no σ3, predefined failure plane, non-uniform stress.)

**UU examples (sketch):** (1) an embankment built rapidly on soft saturated clay — end-of-construction stability; (2) a footing or oil tank loaded quickly on saturated clay — bearing capacity just after loading; also a temporary excavation in clay.`,
    Fig: UUSketch,
  },
  {
    id: 't-cases',
    topic: T,
    q: 'Show with neat sketches two examples each of CU and CD analyses in clays. For a rapidly filled oil tank on clay, what strength parameter is relevant and which test gives it?',
    seen: ['2020-21', 'Jan 2021', '2007-08'],
    a: `**CU analyses** (clay consolidated under one load, then loaded quickly):
1. An embankment raised in **stages**: the clay consolidates under stage 1, stage 2 is placed quickly.
2. **Rapid drawdown** of a reservoir behind an earth dam (the dam soil was consolidated under full reservoir).
3. A natural slope or clay layer under a sudden load after long consolidation.

**CD analyses** (long term, pore pressures equilibrated, effective stress c′, φ′):
1. An embankment on clay many years after construction.
2. A cut slope or excavation in clay in the long term; also any loading on sand.

**Oil tank (2007-08 Q1(d)):** filling is rapid, so the foundation clay is loaded **undrained** — the critical case is at the end of filling. The relevant parameter is the **undrained shear strength cu (φu = 0)**, a total-stress parameter. Tests: **UU triaxial** or **unconfined compression** on undisturbed samples (and the field vane).`,
    Fig: FieldCasesSketch,
  },
  {
    id: 't-tf',
    topic: T,
    q: 'True or false: (I) a direct shear specimen fails on a predefined plane; (II) in CU the valve is open in consolidation and closed in shear; (III) in CD the pore-pressure gauge shows no excess pressure during shear; (IV) both total and effective parameters come from a CU test with u measured; (V) φ′ > φcu for NC clay; (VI) c′ < c for OC clay; (VII) a confining pressure is applied in direct shear; (VIII) the UU valve is always open; (IX) in CD the valve is closed in consolidation and open in shear; (X) CD gives only total-stress parameters.',
    seen: ['2023-24'],
    a: `- I **True** — the horizontal plane between the box halves.
- II **True** — C (open) then U (closed).
- III **True** — slow rate, valve open: Δu ≈ 0.
- IV **True** — total circles and effective (shifted by uf) circles.
- V **True** — positive uf shifts the effective circles left (slide 53, "φ′ > φ").
- VI **True** (usually) — OC clay develops negative uf, so the effective circles move right and c′ < ccu; "always" makes it arguable.
- VII **False** — no σ3 in direct shear (slide 36).
- VIII **False** — UU: always closed.
- IX **False** — CD: open in both phases.
- X **False** — u = 0, so CD gives the effective (drained) c′, φ′.`,
  },
  {
    id: 't-defs',
    topic: T,
    q: 'Define: undrained shear strength; Skempton’s pore-pressure coefficient B; thixotropy; critical void ratio.',
    seen: ['2017-18', '2020-21', 'Jan 2021'],
    a: `*Thixotropy, critical void ratio and Skempton's B are not in AJK sir's slides — flagged.*
- **Undrained shear strength cu (su):** the shear strength of a saturated clay when loaded with no drainage (constant volume): τf = cu with φu = 0; cu = (σ1 − σ3)f/2 from UU, qu/2 from the unconfined test, or from the vane.
- **Skempton's B:** the ratio of the pore-pressure change to the change in all-round (cell) pressure under undrained conditions, B = Δu/Δσ3. B = 1 for saturated soil, ≈ 0 for dry soil.
- **Thixotropy:** the regain of strength with time, at constant water content, of a clay that has been remoulded — caused by the slow re-arrangement of particles and adsorbed water into a more stable structure (reversible softening on remoulding).
- **Critical void ratio:** the void ratio at which a sand shears (drained) with **no volume change**; looser sand contracts (and in undrained loading builds positive u — liquefaction risk), denser sand dilates.
- **Sensitivity** (often asked with these): St = qu(undisturbed)/qu(remoulded).`,
  },
  {
    id: 't-vane',
    topic: T,
    q: 'Prove that in a vane shear test $c_u = \\frac{6T}{7\\pi D^3}$ (H = 2D). Deduce the formula with a triangular stress distribution on the ends and show that a special case gives $\\tau = \\frac{3T}{11D^3}$. Write a short note on the field vane test.',
    seen: ['2012-13', '2009-10', 'Jan 2021'],
    a: `*Vane shear is not in AJK sir's slides this term — flagged.*

**Derivation (uniform end stress):**
1. The vane (four blades, height H, diameter D) is rotated; the soil shears on a cylinder of the same size.
2. Side: area πDH, stress cu at radius D/2 → moment $c_u\\pi DH\\cdot\\frac{D}{2} = \\frac{c_u\\pi D^2H}{2}$.
3. Each end (uniform cu on a disc): $\\int_0^{D/2} c_u\\,2\\pi r\\,dr\\cdot r = \\frac{c_u\\pi D^3}{12}$; two ends → $\\frac{c_u\\pi D^3}{6}$.
4. $T = c_u\\pi D^2\\left(\\frac{H}{2} + \\frac{D}{6}\\right)$; with H = 2D: $T = \\frac{7}{6}c_u\\pi D^3 \\Rightarrow c_u = \\frac{6T}{7\\pi D^3}$.
5. With π ≈ 22/7: 6/(7π) = 6/22 = 3/11 → $c_u = \\frac{3T}{11D^3}$ (the "special condition" is H = 2D).

**Triangular end stress** (zero at the axis, cu at the rim, τ = 2cu r/D): each end gives $\\int_0^{D/2}\\frac{2c_ur}{D}2\\pi r^2dr = \\frac{c_u\\pi D^3}{16}$; $T = c_u\\pi D^2(H/2 + D/8)$; H = 2D → $c_u = \\frac{8T}{9\\pi D^3}$. One end only (vane top flush with the clay): use D/12 (uniform) instead of D/6.

**Field vane (short note):** pushed into soft clay at the bottom of a borehole; torque applied at about 0.1°/s; the peak torque gives cu (undisturbed); rotating several turns and testing again gives the remoulded cu → sensitivity. Good for soft, sensitive clays where sampling is difficult; not for sand, stiff or fissured clay. Correct for rate and anisotropy by **Bjerrum's λ = 1.7 − 0.54 log PI**: cu(design) = λ cu(vane).`,
    Fig: VaneSketch,
  },
  {
    id: 't-su',
    topic: T,
    q: 'Derive $s_u = \\dfrac{c\'\\cos\\varphi\' + \\sigma\'_v\\sin\\varphi\'\\,[K_0 + A_f(1-K_0)]}{1 + (2A_f - 1)\\sin\\varphi\'}$.',
    seen: ['2017-18'],
    a: `*Uses Skempton's A — not in AJK sir's slides (flagged).*
1. In the ground (K0-consolidated, u0 = 0): σ′1 = σ′v (vertical), σ′3 = K0σ′v; deviator (1 − K0)σ′v.
2. Undrained loading to failure with the lateral total stress constant: Δσ3 = 0, Δσ1 = 2su − (1 − K0)σ′v (the deviator grows to 2su).
3. Skempton (B = 1): $\Delta u_f = A_f(\Delta\sigma_1 - \Delta\sigma_3) = A_f[2s_u - (1-K_0)\sigma'_v]$.
4. Effective stresses at failure: $\sigma'_{3f} = K_0\sigma'_v - A_f[2s_u - (1-K_0)\sigma'_v]$, $\sigma'_{1f} = \sigma'_{3f} + 2s_u$.
5. The effective circle touches the c′–φ′ envelope: $s_u = c'\cos\varphi' + (\sigma'_{3f} + s_u)\sin\varphi'$.
6. Substitute 4 into 5: $s_u = c'\cos\varphi' + [K_0\sigma'_v + A_f(1-K_0)\sigma'_v - 2A_fs_u + s_u]\sin\varphi'$, collect su: $\\displaystyle s_u\,[1 + (2A_f - 1)\sin\varphi'] = c'\cos\varphi' + \sigma'_v\sin\varphi'\,[K_0 + A_f(1 - K_0)]$ which is the given expression.
7. Check: NC clay, c′ = 0, φ′ = 20°, K0 = 0.5, Af = 0.6 → su/σ′v = 0.342 × 0.8/1.068 = **0.256** (2017-18 Q1(d) then multiplies by β from the chart for OCR = 5).`,
  },
]
