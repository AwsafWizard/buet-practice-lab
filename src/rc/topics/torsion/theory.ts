import type { RcTheoryItem } from '../../types'

const T = 'rc-torsion' as const

export const TORSION_THEORY: RcTheoryItem[] = [
  {
    id: 'tt-eq-compat',
    topic: T,
    q: 'Differentiate between **equilibrium (primary)** and **compatibility (secondary)** torsion, with examples.',
    seen: ['2023-24', '2020-21'],
    a: `- **Cause.**
  - Equilibrium: the external load has **no alternative path**. It can only be carried by twisting the member.
  - Compatibility: it arises from **continuity**. Adjacent members must rotate together, so the member is twisted by its neighbours.
- **Found from.**
  - Equilibrium: **statics alone** (a statically determinate torque).
  - Compatibility: compatibility of deformations, i.e. the relative stiffnesses (statically indeterminate). The stiffer member attracts more moment.
- **If ignored.**
  - Equilibrium: **collapse**.
  - Compatibility: **cracking but no collapse**. The member cracks, loses torsional stiffness, and the forces redistribute to another equilibrium state.
- **Design.**
  - Equilibrium: must be designed for the **full Tu**.
  - Compatibility: ACI allows it to be neglected when Tu ≤ φTth. Otherwise the design torque may be **reduced to the cracking value φTcr**, provided the redistributed moments are used in the adjoining members.
- **Examples.**
  - Equilibrium: a beam carrying a **cantilever slab or canopy** on one side; a balcony beam; a curved bridge girder; a beam with an eccentric load and no other support.
  - Compatibility: a **spandrel (edge) beam** twisted by the end rotation of a continuous floor slab or of floor beams framing into it.

**Spandrel story** (sketch the slab moment diagram):
- A stiff, well-reinforced spandrel restrains the slab edge, so the slab moments are those of a fixed edge (negative moment at the spandrel).
- If the spandrel cracks in torsion, its stiffness drops, the slab edge rotates freely, and the slab behaves as **hinged** there (larger positive moment).
- If the slab is reinforced for that redistributed diagram, nothing collapses.
- Test question: "If this beam had zero torsional stiffness, would the structure still stand?" No → equilibrium torsion. Yes → compatibility torsion.`,
  },
  {
    id: 'tt-sources',
    topic: T,
    q: 'What is torsion in an RC member and where does it come from? Why is it more important in modern design?',
    seen: [],
    a: `- **Torsion** is a moment about the member's **longitudinal axis** (twisting moment, torque T). In buildings it nearly always comes from **eccentric loading**.
- **Sources** (Jan 2026 slides p1):
  - a rectangular beam with an off-centre load;
  - an inverted-T (ledger) beam carrying beam reactions on its ledges;
  - balcony beams;
  - a spandrel beam twisted by the floor beams or slab framing into it;
  - curved beams (circular tanks, curved bridges), whose loads lie off the line joining the supports;
  - helical stairway slabs and eccentrically loaded box girders.
- It seldom acts alone; it always comes with bending moment and shear.
- **Historically** torsion was treated as a secondary effect, absorbed by the conservative factor of safety.
- **Modern** strength design gives smaller, more efficient members, which no longer have that hidden reserve. Architectural forms also produce more curved and eccentric members. So torsion must now be checked explicitly.`,
  },
  {
    id: 'tt-stresses',
    topic: T,
    q: 'Describe the stresses and crack pattern caused by torsion in a concrete beam, alone and combined with shear and bending.',
    seen: [],
    a: `- **Pure torsion**: shear stresses τ act on all faces.
  - Rotating an element by 45° gives principal tension σ₁ = +τ and principal compression σ₂ = −τ.
  - Concrete cracks perpendicular to σ₁, so the crack **spirals** round the beam at about 45° (line A–B–C–D–E on the slides).
- **Distribution in a rectangle**: elastic τ is greatest at the **middle of the wide faces**, and zero at the centre and the corners. Concrete's inelastic behaviour flattens the distribution, so the stress lives in an outer skin. That is why a thin-walled tube is a good model.
- **Torsion + shear**: the shear-force stresses act in the same direction on both side faces, while the torsion stresses are opposite on the two faces. They **add on one face**, where cracking starts, and **partly cancel on the other**.
- **+ Bending**: the cracks run across the flexural-tension face. The flexural compression zone stops them from reaching the full height of the side faces (crack CD almost vertical on the back face).`,
  },
  {
    id: 'tt-tube',
    topic: T,
    q: 'Using the thin-walled tube analogy, derive the cracking torque $T_{cr} = 4\\sqrt{f\'_c}A_{cp}^2/p_{cp}$.',
    seen: [],
    a: `- The torsional shear stress is concentrated near the surface, and the core has little lever arm. So treat the section as a **tube of wall thickness t** carrying a constant **shear flow q** (force per unit length) around a path enclosing area $A_o = x_oy_o$.
- **Moments about the axis**: $T = 2(qx_o)\\frac{y_o}{2} + 2(qy_o)\\frac{x_o}{2} = 2qx_oy_o = 2qA_o$, so $q = \\dfrac{T}{2A_o}$ and $\\tau = \\dfrac{q}{t} = \\dfrac{T}{2A_ot}$.
- In pure torsion the principal tension is σ = τ. Concrete cracks when τ reaches its tensile strength under biaxial tension–compression, taken conservatively as $4\\sqrt{f'_c}$:
$$T_{cr} = 4\\sqrt{f'_c}\\,(2A_ot)$$
- For a solid section, $A_o$ and t are unknown. Express them through the outline: $A_{cp}$ = area inside the outside perimeter, $p_{cp}$ = that perimeter. For a solid rectangle t ≈ ⅙ to ¼ of the width; with t = b/4 and b/h = 0.5:
$$A_o \\approx \\tfrac23A_{cp},\\quad t \\approx \\tfrac34\\frac{A_{cp}}{p_{cp}}\\ \\Rightarrow\\ 2A_ot = \\frac{A_{cp}^2}{p_{cp}}$$
$$\\boxed{T_{cr} = 4\\lambda\\sqrt{f'_c}\\,\\frac{A_{cp}^2}{p_{cp}}}\\ (\\text{in-lb})$$
- This is a reasonable estimate for solid members of any shape.
- $A_{cp}^2/p_{cp}$ is a "torsional size": compact sections (much area, little perimeter) are strong; thin, spread-out shapes are weak.`,
  },
  {
    id: 'tt-threshold',
    topic: T,
    q: 'What is the threshold torsion? When may torsion be neglected? Give the expressions for solid and hollow sections with and without axial load.',
    seen: [],
    a: `- Below about **one quarter of the cracking torque**, torsion does not noticeably reduce the flexural or shear strength. ACI calls this the **threshold torsion** $T_{th} = \\frac14T_{cr}$.
- **Torsion may be neglected if $T_u \\le \\phi T_{th}$**, with φ = 0.75 and Tu the factored torque at the critical section (d from the face).
- The four cases:
  - Solid, no axial load: $T_{th} = \\lambda\\sqrt{f'_c}\\,A_{cp}^2/p_{cp}$
  - Solid, axial load Nu: $T_{th} = \\lambda\\sqrt{f'_c}\\frac{A_{cp}^2}{p_{cp}}\\sqrt{1 + \\frac{N_u}{4A_g\\lambda\\sqrt{f'_c}}}$
  - Hollow: replace $A_{cp}$ by $A_g$ (concrete area only); $p_{cp}$ is still the outside perimeter.
  - Hollow with Nu: the same root factor.
- **Axial compression** (Nu > 0) delays diagonal cracking, so it raises Tth. **Tension** lowers it.
- **Hollow sections** have less concrete, so a lower threshold.
- (Prestressed members, beyond the slides: factor $\\sqrt{1 + f_{pc}/(4\\lambda\\sqrt{f'_c})}$.)
- If Tu > φTth: closed stirrups plus longitudinal bars are required. Equilibrium torsion uses the full Tu; compatibility torsion may use the reduced φTcr.`,
  },
  {
    id: 'tt-after-crack',
    topic: T,
    q: 'Describe the behaviour of an RC member in torsion after cracking. Why are both closed stirrups and longitudinal bars needed?',
    seen: [],
    a: `- Above Tcr the member needs **closely spaced closed stirrups and longitudinal bars**.
- **Longitudinal bars alone** add at most about **15 %** to the torsional strength, by weak dowel action only.
- Stirrups alone don't work either. Together they form a **space truss**: concrete diagonal **struts** spiral round the member at about 45°, while the stirrups (transverse ties) and the longitudinal bars (chord ties) carry the tension.
- Right after cracking, the concrete's torsional resistance drops to about **half** of the uncracked value; the steel carries the rest.
- Near ultimate, the **cover outside the stirrup cage spalls** off. So after cracking the torque is taken by the area $A_{oh}$ enclosed by the centreline of the outermost closed stirrup (perimeter $p_h$).
- Stirrups must be **closed**, with 135° hooks. The torsional shear flow goes all the way round the section; an open U-stirrup would simply unwrap.
- (Torsion design — At/s, Al, combined Av/s + 2At/s, the section-adequacy check — is not part of this course.)`,
  },
  {
    id: 'tt-flange',
    topic: T,
    q: 'How much of the flange of a T- or L-beam may be counted in torsion? When should the flange be ignored?',
    seen: [],
    a: `- Part of the overhanging slab helps resist torsion: it adds to $A_{cp}$ for Tcr and Tth, and to the strength if it has closed stirrups.
- ACI effective overhang **on each side of the web** = **min(hw, 4hf)**, where hw = projection of the beam above or below the slab (whichever is greater) and hf = slab thickness.
  - Symmetric T: total width ≤ bw + 2hw ≤ bw + 8hf.
  - L (spandrel): one overhang ≤ hw ≤ 4hf.
- Example: 12 × 24 in web, 6 in slab → hw = 18, 4hf = 24 → 18 in counted, out of a 66 in slab.
- **Side rule** (ACI 9.2.4.4, in the handnote): compute $A_{cp}^2/p_{cp}$ with and without the flanges and use the **larger**. A thin, wide flange can add more perimeter than area and **lower** the ratio; then ignore it.`,
  },
  {
    id: 'tt-box',
    topic: T,
    q: 'Why is a box section a good choice for curved bridge girders or members with large torsion?',
    seen: [],
    a: `- Torsion is carried by **shear flow round a closed perimeter**: $T = 2qA_o$. A closed box encloses a **large area $A_o$** with material placed far from the axis, so its torsional constant J (and stiffness GJ) is very large compared with an open I or T section of the same weight.
- A curved girder's loads lie off the chord between the supports, so it carries **equilibrium torsion** everywhere. The box resists it with small rotations and low shear stresses.
- The hollow core removes concrete that would contribute little (near the axis). The section stays light while keeping flexural stiffness and strength.
- For the threshold check, a hollow section uses $A_g$ (concrete only) with the outside perimeter. Its threshold is lower than that of a solid section of the same outline: in the handnote example the threshold drops from 36.7 to 12.3 ft-k.`,
  },
]
