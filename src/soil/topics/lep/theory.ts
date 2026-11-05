import type { SmTheoryItem } from '../../types'
import { PlanesSketch, StatesMohrSketch, TiltSketch, TwoLayerSketch, WedgeSketch } from './figs'

const T = 'sm-lep' as const

export const LEP_THEORY: SmTheoryItem[] = [
  {
    id: 't-tilt',
    topic: T,
    q: 'Draw the typical variation of lateral earth pressure (at-rest, active, passive) with the tilt of a wall. Which of the three is the maximum for a given cohesionless soil? Give the reasoning.',
    seen: ['2023-24', '2021-22', '2020-21', 'Jan 2021'],
    a: `**Sketch** (Das Fig. 13.2, slide 7): x-axis = wall tilt ΔL/H (left: away from the backfill, right: into the backfill); y-axis = σ′h (or K = σ′h/σ′v).
- At zero tilt the soil is **at rest**: σ′h = K0σ′v (K0 = 1 − sin φ′ ≈ 0.5 for φ′ = 30°).
- A **small outward** tilt drops σ′h quickly to the **active** minimum σ′a = Kaσ′v (Ka = 0.33 for 30°) and it then stays flat. Loose sand needs ΔLa/H ≈ 0.001–0.002, dense sand 0.0005–0.001, soft clay 0.02, stiff clay 0.01 (Das Table 13.1).
- An **inward** tilt raises σ′h slowly to the **passive** maximum σ′p = Kpσ′v (Kp = 3.0 for 30°), needing far more movement: ΔLp/H ≈ 0.01 loose sand, 0.005 dense sand, 0.04 soft clay, 0.02 stiff clay (≈ 5–10× the active movement in sand, 2× in clay).

**Maximum: passive.** Kp = tan²(45 + φ′/2) > K0 ≈ 1 − sin φ′ > Ka = tan²(45 − φ′/2), i.e. **Ka < K0 < Kp**.

**Reason:** when the wall is pushed into the soil, the soil's shear strength is mobilised *against* the wall — the soil resists being compressed laterally, so σ′h must rise until the Mohr circle (now with σ′h as the major stress) grows to touch the envelope on the far side. In the active case the shear strength *helps* the soil stand, so less horizontal support is needed. At rest no shear strength is mobilised.`,
    Fig: TiltSketch,
  },
  {
    id: 't-planes',
    topic: T,
    q: 'Show the major and minor principal planes on a 2-D element of backfill behind a retaining wall in the at-rest, active and passive states. Also show the potential failure planes in the active and passive states with respect to the major principal planes.',
    seen: ['2023-24'],
    a: `- **At rest:** σ′v = γz is the **major** principal stress (K0 < 1), acting on the **horizontal** plane, so the **major principal plane is horizontal** and the minor principal plane (σ′h = K0σ′v) is vertical. The circle lies inside the envelope: no failure plane.
- **Active** (wall moves away): σ′h drops to σ′a; σ′v stays the major stress → **major principal plane horizontal**, minor vertical. Failure planes make **45° + φ′/2 with the major principal plane**, i.e. 45 + φ′/2 to the horizontal (steep, 60° for φ′ = 30°), in two conjugate sets.
- **Passive** (wall pushed in): σ′h rises above σ′v and becomes the **major** stress → **major principal plane vertical**, minor horizontal. Failure planes at **45° + φ′/2 to the major (vertical) plane** = 45 − φ′/2 to the horizontal (flat, 30° for 30°).
- In the backfill the active wedge meets the surface H·tan(45 − φ′/2) = 0.58H behind the wall (φ′ = 30°); the passive wedge reaches H·tan(45 + φ′/2) = 1.73H.
- On the Mohr circle the pole is at σ′h (stress on the vertical plane); lines from the pole to the tangent points give these planes (2θ = 90 + φ′).`,
    Fig: PlanesSketch,
  },
  {
    id: 't-concepts',
    topic: T,
    q: "Explain the concepts of Rankine's active and passive earth pressure. Use Mohr's circle to show the orientation of the failure plane in a cohesionless soil in the active condition.",
    seen: ['2020-21', '2007-08'],
    a: `**Rankine (1857)** considers an element at depth z in a semi-infinite, homogeneous soil with a horizontal surface behind a smooth vertical wall. σ′v = γz does not change as the wall moves; only σ′h changes.
- **At rest:** σ′h = K0σ′v, circle inside the Mohr–Coulomb envelope.
- **Active:** the wall moves away; σ′h decreases (σ′v constant) and the circle grows **to the left** until it touches the envelope. The soil is in *plastic equilibrium*; σ′a = Kaσ′v is the minor principal stress. Ka = tan²(45 − φ′/2): the minimum lateral pressure.
- **Passive:** the wall is pushed in; σ′h increases past σ′v and the circle grows **to the right** until it touches. σ′p = Kpσ′v is the major principal stress, Kp = tan²(45 + φ′/2): the maximum.

**Orientation (active, c = 0):** draw the K0 circle and the active circle through σ′v with σ′a at its left end; the envelope τ = σ tan φ′ is tangent at T. σ′v acts on the horizontal plane, so the **pole** is at σ′a. The line from the pole to T makes **45 + φ′/2** with the horizontal (2θ = 90 + φ′ at the centre). Two conjugate sets of failure planes, both at 45 + φ′/2 to the horizontal, form the active wedge.`,
    Fig: StatesMohrSketch,
  },
  {
    id: 't-ka',
    topic: T,
    q: "Derive an expression for the coefficient of active earth pressure in a cohesionless soil using Rankine's method. Show also the orientation of the failure plane.",
    seen: ['2011-12', '2007-08'],
    a: `1. Element at depth z: σ′1 = σ′v = γz (major, vertical), σ′3 = σ′a (minor, horizontal) at active failure.
2. Circle centre C = (σ′v + σ′a)/2, radius R = (σ′v − σ′a)/2; envelope through the origin at φ′.
3. Tangency: $\\sin\\varphi' = \\dfrac{R}{C} = \\dfrac{\\sigma'_v - \\sigma'_a}{\\sigma'_v + \\sigma'_a}$
4. Rearrange: $\\dfrac{\\sigma'_a}{\\sigma'_v} = \\dfrac{1-\\sin\\varphi'}{1+\\sin\\varphi'}$
5. With $1 - \\sin\\varphi' = 2\\sin^2(45 - \\varphi'/2)$ and $1 + \\sin\\varphi' = 2\\cos^2(45 - \\varphi'/2)$: $\\displaystyle K_a = \\frac{\\sigma'_a}{\\sigma'_v} = \\frac{1-\\sin\\varphi'}{1+\\sin\\varphi'} = \\tan^2\\left(45 - \\frac{\\varphi'}{2}\\right)$
6. σ′a = Kaγz, a triangle; Pa = ½KaγH² at H/3.
7. **Failure plane:** in the circle the radius to the tangent point makes 2θ = 90 + φ′ with σ′1 → θ = 45 + φ′/2 from the major principal (horizontal) plane; with the pole at σ′a the planes rise at 45 + φ′/2 to the horizontal (sketch the circle, pole and the wedge).`,
    Fig: WedgeSketch,
  },
  {
    id: 't-cphi',
    topic: T,
    q: "State the assumptions of Rankine's theory. Deduce the active earth pressure for a c–φ backfill (at depth h, and the total thrust on a wall of height H), and hence the depth of the tension crack and the theoretical unsupported height of a cut in a purely cohesive soil.",
    seen: ['2017-18', '2016-17', '2011-12', '2010-11', '2008-09'],
    a: `**Assumptions:** (i) the wall back is vertical and **smooth** (no wall friction, δ = 0); (ii) the backfill surface is horizontal; (iii) the soil is semi-infinite, homogeneous, isotropic, dry or with known water pressure; (iv) the soil is in a state of plastic equilibrium (the wall moves enough); (v) the failure surface is a plane; (vi) the Mohr–Coulomb criterion holds.

**Derivation (σ′v = γh major, σ′a minor):**
1. Mohr–Coulomb at failure (circle tangent to τ = c + σ tan φ): $\\sin\\varphi = \\dfrac{(\\sigma_1-\\sigma_3)/2}{c\\cot\\varphi + (\\sigma_1+\\sigma_3)/2}$
2. Rearranged: $\\sigma_1 = \\sigma_3\\tan^2(45+\\varphi/2) + 2c\\tan(45+\\varphi/2)$, so $\\sigma_3 = \\sigma_1\\tan^2(45-\\varphi/2) - 2c\\tan(45-\\varphi/2)$.
3. Put σ1 = γh, σ3 = σa: $\\displaystyle \\sigma_a = \\gamma h K_a - 2c\\sqrt{K_a},\\quad K_a = \\tan^2(45 - \\varphi/2)$
4. **Thrust** (integrate 0 to H): $\\displaystyle P_a = \\tfrac12\\gamma H^2K_a - 2cH\\sqrt{K_a}$
5. **Tension crack:** σa < 0 near the top; σa = 0 at $\\displaystyle z_c = \\frac{2c}{\\gamma\\sqrt{K_a}}\\quad(\\varphi = 0:\\ z_c = 2c/\\gamma)$
6. **Unsupported height** (net Pa = 0): ½γHc²Ka = 2cHc√Ka → $\\displaystyle H_c = \\frac{4c}{\\gamma\\sqrt{K_a}} = 2z_c,\\qquad \\varphi = 0:\\ H_c = \\frac{4c_u}{\\gamma}$ (Terzaghi's crack-adjusted value 2.67c/γ is safer).
7. After cracking (design): Pa = ½(H − zc)(γHKa − 2c√Ka) at (H − zc)/3 — larger than step 4.

Sketch: pressure diagram with −2c√Ka at the top, zero at zc, γHKa − 2c√Ka at the base; tension zone hatched.`,
  },
  {
    id: 't-after',
    topic: T,
    q: 'Starting with the active earth pressure in a c–φ soil, prove that the design active thrust after the tension crack forms is $P_a = \\frac12\\left(H - \\frac{2c}{\\gamma\\sqrt{K_a}}\\right)(\\gamma HK_a - 2c\\sqrt{K_a})$.',
    seen: ['2009-10'],
    a: `1. σa(z) = γzKa − 2c√Ka (linear in z).
2. σa = 0 at z = zc = 2c/(γ√Ka); above zc the soil would be in tension.
3. Soil cannot sustain tension: a crack opens to zc and the negative part of the diagram is **dropped** (the soil above zc no longer pushes or pulls on the wall).
4. Below zc the diagram is a triangle: zero at zc, σa(H) = γHKa − 2c√Ka at the base, height H − zc.
5. Area: $\\displaystyle P_a = \\tfrac12 (H - z_c)(\\gamma HK_a - 2c\\sqrt{K_a}) = \\tfrac12\\left(H - \\frac{2c}{\\gamma\\sqrt{K_a}}\\right)(\\gamma HK_a - 2c\\sqrt{K_a})$ acting (H − zc)/3 above the base.
6. It is larger than the before-crack value ½γH²Ka − 2cH√Ka (the negative zone no longer subtracts), so it is used for design. With water in the crack add ½γw zc² as well.`,
  },
  {
    id: 't-layers',
    topic: T,
    q: 'Derive the active earth pressure in the bottom-most layer of a three-layer cohesionless backfill. Draw qualitative active pressure diagrams for a two-layer cohesionless system for different φ and γ orderings.',
    seen: ['2009-10', '2007-08'],
    a: `**Three layers** (thicknesses h1, h2, h3, unit weights γ1, γ2, γ3, coefficients Ka1, Ka2, Ka3, no water): the upper layers act as a surcharge on the bottom layer. At depth z′ into layer 3 (0 ≤ z′ ≤ h3):
$$\\sigma_a = K_{a3}\\,(\\gamma_1h_1 + \\gamma_2h_2 + \\gamma_3z')$$
- At the top of layer 3: Ka3(γ1h1 + γ2h2) — different from Ka2(γ1h1 + γ2h2) just above, so the diagram **jumps** at the interface.
- Below the WT use γ′ and add u separately; with a surcharge add qKa3.

**Two layers (qualitative):** σ′v is continuous; at the interface the pressure jumps from Ka1γ1h1 to Ka2γ1h1; below, the slope is Ka2γ2 instead of Ka1γ1.
- (i) φ1 = φ2, γ1 > γ2: no jump, flatter below.
- (ii) φ1 > φ2, γ1 = γ2: jump **outward** (Ka2 > Ka1), steeper below.
- (iii) φ1 < φ2, γ1 < γ2: jump **inward**; the slope below may be either.
- (iv) φ1 > φ2, γ1 > γ2: jump outward; slope below either.
- (v) φ1 < φ2, γ1 > γ2: jump inward, flatter below.`,
    Fig: TwoLayerSketch,
  },
  {
    id: 't-k0',
    topic: T,
    q: 'Define the coefficient of earth pressure at rest. Mention the principal factors that influence the field value of K0.',
    seen: ['2021-22', '2017-18'],
    a: `**K0 = σ′h/σ′v** for a soil element with **no lateral strain** — the wall (or the ground) does not move, e.g. a rigid basement wall, a bridge abutment, braced walls. The Mohr circle stays inside the failure envelope.

**AJK sir's formulas (slide 4):** Jaky K0 = 1 − sin φ′ (coarse / loose sand); Sherif (1 − sin φ′) + 5.5(γd/γd(min) − 1) (dense compacted sand); Mayne–Kulhawy (1 − sin φ′)OCR^sin φ′ (OC soils); Massarsch 0.44 + 0.42(PI/100) (NC fine soils); K0(OC) = K0(NC)√OCR.

**Factors:**
- **Soil type and φ′** (K0 falls as φ′ rises; for clays it rises with PI).
- **Stress history / OCR** — unloading leaves locked-in horizontal stress; K0 rises with OCR and can exceed 1 for heavily OC clay.
- **Compaction and placement** of backfill — compaction raises K0 above Jaky's value.
- **Density** (relative density / void ratio).
- **Soil structure, cementation and ageing.**
- **Wall rigidity / tiny movements**, temperature, and the method of construction.`,
  },
  {
    id: 't-walls',
    topic: T,
    q: "Describe the importance of earth-retaining structures and name four common types. Briefly discuss the basic considerations of (and fundamental differences between) Rankine's and Coulomb's earth pressure theories.",
    seen: ['2021-22', '2012-13'],
    a: `*The Coulomb half is outside AJK sir's slides this term (the deck title mentions Coulomb but there is no slide).*

**Importance:** they hold soil at a slope steeper than it can stand by itself — for roads and railways in cuts and fills, basements, bridge abutments, waterfront (dock) walls, flood walls, land reclamation and hillside development. Lateral earth pressure governs their sliding, overturning and structural design.

**Types:** gravity (mass concrete / masonry) walls, cantilever RC walls, counterfort walls, sheet-pile walls (cantilever / anchored), braced cuts, basement walls, bridge abutments, reinforced-earth walls, gabions.

**Differences (Rankine 1857 vs Coulomb 1776):**
- **Approach:** Rankine — stress state of a semi-infinite mass in plastic equilibrium; Coulomb — force equilibrium of a rigid sliding wedge.
- **Wall:** Rankine — vertical and smooth (δ = 0); Coulomb — any batter, wall friction δ allowed.
- **Backfill:** Rankine — horizontal (or a uniform slope); Coulomb — any slope.
- **Failure surface:** Rankine — planes at 45 ± φ/2 everywhere in the zone; Coulomb — one plane through the heel, critical wedge found by trial (Culmann).
- **Result:** Rankine gives the pressure distribution (P parallel to the surface, at H/3); Coulomb gives the total force only (P at δ to the wall normal).

With δ = 0, a vertical wall and a level backfill the two give the same Ka. Rankine overestimates active and underestimates passive slightly (ignores δ); Coulomb's plane surface overestimates passive for large δ.`,
  },
  {
    id: 't-coulomb',
    topic: T,
    q: "State the assumptions in Coulomb's theory of earth pressure. Deduce an expression for active (or passive) earth pressure due to a cohesive-frictional (c–φ) backfill.",
    seen: ['2020-21', 'Jan 2021'],
    a: `*Coulomb's theory is not in AJK sir's slides this term — flagged.*

**Assumptions:** (i) the soil is dry, homogeneous, isotropic, with c and φ; (ii) the slip surface is a **plane** through the heel; (iii) the sliding wedge is a **rigid body** in limiting equilibrium; (iv) **wall friction δ** acts on the wall–soil contact; (v) the problem is 2-D (per metre of wall); (vi) the position and direction of P are known (at δ to the wall normal, H/3 above the base for a linear distribution); (vii) the critical wedge is the one that gives the largest active (smallest passive) thrust.

**c–φ active, vertical smooth wall, level fill (the Bell/Rankine form the examiner accepts):** trial plane at ρ from the horizontal; forces on the wedge: weight W = ½γH² cot ρ, cohesion on the plane C = c·H/sin ρ, reaction R at φ to the plane's normal, and P. Resolving and maximising P with respect to ρ gives ρ = 45 + φ/2 and
$$P_a = \\tfrac12\\gamma H^2K_a - 2cH\\sqrt{K_a},\\qquad \\sigma_a = \\gamma zK_a - 2c\\sqrt{K_a}$$
**Passive** (minimise, ρ = 45 − φ/2): $\\displaystyle P_p = \\tfrac12\\gamma H^2K_p + 2cH\\sqrt{K_p},\\qquad \\sigma_p = \\gamma zK_p + 2c\\sqrt{K_p}$
For c = 0 with δ, wall batter θ and slope β: $K_a = \\dfrac{\\cos^2(\\varphi-\\theta)}{\\cos^2\\theta\\cos(\\delta+\\theta)\\left[1+\\sqrt{\\frac{\\sin(\\delta+\\varphi)\\sin(\\varphi-\\beta)}{\\cos(\\delta+\\theta)\\cos(\\theta-\\beta)}}\\right]^2}$ (chart pane e-coulomb).`,
  },
]
