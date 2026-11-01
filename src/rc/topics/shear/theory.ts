import type { RcTheoryItem } from '../../types'

const T = 'rc-shear' as const

export const SHEAR_THEORY: RcTheoryItem[] = [
  {
    id: 'ts-seismic-hoops',
    topic: T,
    q: 'State the BNBC/ACI provisions for beam stirrups (hoops) in a region of moderate seismic risk such as Dhaka.',
    seen: ['2017-18', '2016-17', '2013-14', '2010-11', '2005-06'],
    a: `*Not in the CE 315 shear slides; this is the ACI intermediate moment frame (IMF) beam rule (ACI 318-14 §18.4.2; BNBC 2020 Part 6 adopts the same). Dhaka is seismic zone 2, so the building is in SDC C/D and an IMF is the usual choice.*

- **Hoops at both ends.** Over a length **2h** from the face of the support at each end of the beam (h = total beam depth), provide closed **hoops**. A hoop is a closed tie with 135° seismic hooks that have a 6db (≥ 3 in.) extension into the core.
- **First hoop** within **2 in.** of the support face.
- **Hoop spacing** in that 2h zone ≤ the smallest of:
  - **d/4**
  - **8 × diameter of the smallest longitudinal bar** enclosed
  - **24 × diameter of the hoop bar**
  - **12 in.**
- **Away from the ends**: stirrups at **s ≤ d/2** throughout the length.
- **Shear strength**: φVn ≥ the shear from the beam's nominal moment strengths at both ends plus the factored gravity load, or from twice the code earthquake effect, whichever governs.
- **Longitudinal bars** (the companion rule): the positive moment strength at the joint face ≥ ⅓ of the negative moment strength there; at any section, both ≥ ⅕ of the largest at either joint face.

Sketch: a beam elevation with closely spaced hoops over 2h at each column face, the first one at 2 in., and wider stirrups (≤ d/2) in the middle.`,
  },
  {
    id: 'ts-smax',
    topic: T,
    q: 'What is the maximum spacing of stirrups (i) when $V_s \\le 4\\sqrt{f\'_c}b_wd$ and (ii) when $V_s > 4\\sqrt{f\'_c}b_wd$? Why are these limits needed?',
    seen: ['2021-22', '2009-10', '2007-08', '2005-06'],
    a: `**(i) $V_s \\le 4\\sqrt{f'_c}b_wd$:** $s_{\\max}$ = the least of **d/2**, **24 in.**, and the spacing that gives Av,min: $A_vf_{yt}/(0.75\\sqrt{f'_c}b_w)$ and $A_vf_{yt}/(50b_w)$.

**(ii) $4\\sqrt{f'_c}b_wd < V_s \\le 8\\sqrt{f'_c}b_wd$:** the limits are **halved**, so $s_{\\max}$ = least of **d/4** and **12 in.** (and the Av,min spacing).

Beyond $V_s = 8\\sqrt{f'_c}b_wd$ no spacing is allowed: **redesign** the section, because the web would crush.

**Why:**
- A diagonal crack is assumed at about 45°, running from the tension steel up to about mid-depth. Its horizontal projection is therefore about d/2.
- With s ≤ d/2, **every potential crack is crossed by at least one stirrup** (Fig 5.14). A wider spacing would let a crack slip between two stirrups, and those stirrups would do nothing.
- At high shear the cracks are more numerous and steeper. They must be crossed by at least two stirrups, and crack widths kept small, so the spacing is halved.
- 24 in. / 12 in. are absolute caps for deep beams.
- For inclined (bent) bars the corresponding limit is $\\frac{3}{8}d(1 + \\cot\\alpha)$, i.e. 3d/4 for 45° bars.`,
  },
  {
    id: 'ts-crit-d',
    topic: T,
    q: 'Why, and when, is the maximum design shear taken at a distance d from the face of the support (where the reaction induces vertical compression)?',
    seen: ['2011-12', '2009-10', '2007-08'],
    a: `**Why:**
- When the support reaction **compresses** the end of the beam, the region within about d of the face is squeezed vertically. This **delays diagonal cracking** there. Cracks that would form close to the support are steep, and they end in the compressed zone over the support.
- The **first critical inclined crack** therefore starts at about d from the face (a 45° crack from the face at the steel level reaches the compression face d away).
- Loads applied **within d** of the face are carried straight to the support by **arch (strut) action**. They do not need stirrups.
- So sections closer than d are designed for $V_u$ at d (the shear is held constant from d to the face).

**When it applies** (Fig 5.12 (a), (b)):
- the beam bears on a support below, or frames into a column in compression;
- the loads act at or near the **top** of the beam;
- **no concentrated load** acts between the face and d.

**Otherwise use $V_u$ at the face**:
- a concentrated load within d;
- a load hung from the bottom (it pulls the web down, so there is tension instead of compression);
- a beam framing into a girder of similar depth;
- a support element in tension.`,
  },
  {
    id: 'ts-crit-sketch',
    topic: T,
    q: 'Show with neat sketches the location of the critical section for shear for different support and loading conditions.',
    seen: ['2010-11'],
    a: `Sketch six small beam-end details (Nilson Fig 5.12). Mark the critical section with a dashed vertical line and the 45° crack:
- **(a) End bearing on a wall or pad, load on top** → critical at **d from the face**. The reaction compresses the end.
- **(b) Beam framing monolithically into a column** (column in compression) → **d from the face**.
- **(c) Concentrated load closer than d to the face** → critical **at the face**. The load is not carried by arching alone, and the shear just beyond the load matters.
- **(d) Load applied near the bottom** (ledger, hanging load) → **at the face**. The hanger force puts the web in tension.
- **(e) Beam supported by a girder of similar depth** (indirect support) → **at the face**. There is no compression fan; the reaction is brought in as a tension hanger.
- **(f) Support element in tension** (e.g. a beam hung from a tension member) → **at the face**.

Rule of thumb: compression from the reaction and the load on top ⇒ d; anything that puts the end region in tension ⇒ the face.`,
  },
  {
    id: 'ts-cracked-components',
    topic: T,
    q: 'With neat sketches, show the components that resist shear at a diagonally cracked section of a beam **without** web reinforcement. (How does an RC beam without stirrups resist shear?)',
    seen: ['2023-24', '2009-10'],
    a: `Draw the free body of the beam left of a diagonal crack: the reaction $R_l$, load $P_1$, the crack rising from the tension steel to the compression zone, and the internal forces.

$$V_{ext} = R_l - P_1 = V_{int} = V_{cz} + V_d + V_{iy}$$

- **$V_{cz}$, shear in the uncracked compression zone** above the crack tip. This is the largest component (roughly 20–40 %), and it is helped by the compressive force C.
- **$V_d$, dowel action** of the longitudinal bars that cross the crack. It is limited because the bar can split off the thin bottom cover.
- **$V_{iy}$, aggregate interlock**: the vertical component of the interface shear $V_i$ from aggregate particles locking across the rough crack faces. It drops quickly as the crack widens.
- (Also, in deep beams, **arch action**: a direct compression strut from the load to the support, tied by the bars.)

Moment equilibrium about the compression resultant: $T_b z \\approx M_{ext,a}$. The **steel force at the bottom of the crack is set by the moment at the crack tip (point a)**, which is larger than the moment at the same section before cracking.

Together $V_c = V_{cz} + V_d + V_{iy}$ is the "concrete contribution". The code takes it conservatively as $V_c = 2\\lambda\\sqrt{f'_c}b_wd$, the lower-bound line through the test data.`,
  },
  {
    id: 'ts-truss-derive',
    topic: T,
    q: 'Sketch all forces at a diagonal crack in a beam with vertical stirrups, explain the behaviour, and derive the USD formula for stirrup spacing.',
    seen: ['2008-09', '2004-05'],
    a: `**Behaviour:**
- Before diagonal cracking the stirrups carry almost **no stress**.
- After cracking they help in four ways:
  1. They carry part of the shear directly ($V_s$).
  2. They limit crack growth, which keeps the compression zone ($V_{cz}$) larger.
  3. They hold the crack faces together, which keeps aggregate interlock ($V_i$).
  4. They tie the longitudinal bars, which raises dowel capacity and prevents splitting.
- Failure is imminent once the stirrups crossing the crack **yield**.

**Free body** (sketch the crack at about 45°, horizontal projection p ≈ d, stirrups at spacing s crossing it, each with force $A_vf_{yt}$):
$$V_{ext} = V_{cz} + V_d + V_{iy} + V_s = V_c + V_s$$

**Number of stirrups crossing the crack:** $n = p/s \\approx d/s$ (conservative). So
$$V_s = nA_vf_{yt} = \\frac{A_vf_{yt}d}{s},\\qquad V_n = V_c + \\frac{A_vf_{yt}d}{s}$$

**Design** ($V_u \\le \\phi V_n$, φ = 0.75):
$$V_u \\le \\phi V_c + \\phi\\frac{A_vf_{yt}d}{s}\\ \\Rightarrow\\ \\boxed{s = \\frac{\\phi A_vf_{yt}d}{V_u - \\phi V_c}}\\quad\\text{or}\\quad \\frac{A_v}{s} = \\frac{V_u - \\phi V_c}{\\phi f_{yt}d}$$

- Subject to $s \\le d/2$, 24 in. (d/4, 12 in. when $V_s > 4\\sqrt{f'_c}b_wd$), $A_v \\ge A_{v,\\min}$, and $V_s \\le 8\\sqrt{f'_c}b_wd$.
- Inclined bars at angle α: $V_s = A_vf_{yt}d(\\sin\\alpha + \\cos\\alpha)/s$.
- Tests averaged 45 % above this prediction (166 tests), so the equation is conservative.`,
  },
  {
    id: 'ts-redistribution',
    topic: T,
    q: 'Discuss the redistribution of internal forces and stresses in an RC beam when a diagonal crack forms.',
    seen: ['2002-03'],
    a: `Sketch the beam portion left of the crack with $V_{cz}$, $V_d$, $V_i$, C and $T_b$.

When the diagonal crack forms, the forces that had been carried by the now-cracked concrete must find new paths:
1. **The shear on the uncracked compression zone rises.** All of the shear not taken by dowels and interlock must pass through the small concrete area above the crack tip, so the shear and compression stresses there go up.
2. **The compression stress in the concrete above the crack rises.** Less depth is available for C.
3. **The steel tension at the crack rises.** The bar force at the bottom of the crack is now governed by the moment at the crack top (point a), $T_b \\approx M_a/z$, which is larger than the moment at the bar's own section. Bars therefore need anchorage beyond where flexure alone would stop them.
4. **Dowel force** appears in the bars and tends to split the cover along them.

Outcomes:
- In a **shallow beam without stirrups** (span/depth ≥ 8) this redistribution cannot be sustained: the crack runs into the compression zone and the beam splits immediately (**diagonal tension failure**).
- In **deeper beams** it can stabilise (arch action), and failure comes later by:
  - **shear compression**: crushing of the reduced compression zone;
  - **splitting** along the bars;
  - **anchorage pull-out**.
- That extra reserve is erratic, so design ignores it.`,
  },
  {
    id: 'ts-stirrup-functions',
    topic: T,
    q: 'What are the functions of stirrups in a beam?',
    seen: ['2013-14'],
    a: `1. **Resist diagonal tension.** They carry the shear in excess of the concrete's share, $V_s = A_vf_{yt}d/s$, across inclined cracks.
2. **Restrict crack growth.** They keep diagonal cracks narrow and short, which preserves the uncracked compression zone ($V_{cz}$).
3. **Maintain aggregate interlock.** They clamp the crack faces together.
4. **Improve dowel action.** They tie the longitudinal bars and prevent them splitting off the cover.
5. **Hold the main bars in position** during concreting, together with the hanger (top) bars. They form the reinforcement cage.
6. **Confine the concrete** and restrain compression bars against buckling. Closed stirrups or hoops are required where compression steel is used, and in seismic zones (ductility).
7. **Resist torsion**: closed stirrups, together with longitudinal bars, carry torsion after cracking.
8. **Give warning of failure.** A beam whose stirrups yield first fails in a more ductile way than the sudden diagonal-tension failure of a beam without them.`,
  },
  {
    id: 'ts-diag-tension',
    topic: T,
    q: 'Why is "shear" design really design for **diagonal tension**? Explain with the principal stresses in a homogeneous beam.',
    seen: [],
    a: `In a homogeneous beam an element carries:
- bending stress $f = My/I$;
- shear stress $v = VQ/(Ib)$, which is parabolic in a rectangle, with $v_{\\max} = 1.5V/(bh)$ at the neutral axis.

Combining them gives the principal stresses
$$t = \\frac f2 \\pm \\sqrt{\\frac{f^2}{4} + v^2},\\qquad \\tan 2\\alpha = \\frac{2v}{f}$$

- **At the neutral axis** (f = 0) the element is in pure shear. The principal tension equals v, acting at **45°**.
- **Below the NA**, the bending tension and the shear combine into an inclined principal tension $t_1 > v$.
- The tension trajectories form arch-like curves (Fig 5.3).

Concrete's tensile strength is only about 10 % of its compressive strength, so it **cracks perpendicular to the principal tension**, along inclined lines. Pure shear strength is never the limit. Horizontal flexural bars cannot follow these curved trajectories, so **separate web reinforcement** (stirrups) is needed to cross the inclined cracks. Shear failure is also sudden and brittle, so it gets φ = 0.75 against 0.90 for flexure, and beams are proportioned so that flexure governs.`,
  },
  {
    id: 'ts-crack-types',
    topic: T,
    q: 'Distinguish web-shear and flexure-shear cracks. Where does each form and at what nominal shear stress?',
    seen: [],
    a: `**Web-shear crack:**
- Forms in the **web near the neutral axis** where M is small and V large, in a section that is **not yet flexurally cracked**. Typical locations are near the supports of deep or thin-webbed beams and at inflection points.
- Inclined at about 45°, starting inside the web.
- $v_{cr} = V_{cr}/(bd) \\approx 3.5\\sqrt{f'_c}$ (≈ 221 psi at 4 ksi).
- Relatively **rare**.

**Flexure-shear crack:**
- Starts as a **vertical flexural crack** from the tension face where both M and V are significant, then bends over in the direction of the principal compression.
- $v_{cr} \\approx 1.9\\sqrt{f'_c}$ (≈ 120 psi at 4 ksi), about **half** of the web-shear value, because the existing flexural crack reduces the uncracked section.
- The **common** case.

Which one forms depends on the ratio $v/f = (K_1/K_2)(Vd/M)$:
- large Vd/M → web-shear;
- small Vd/M → flexure-shear.

Empirical fit: $v_{cr} = 1.9\\sqrt{f'_c} + 2500\\rho_wV_ud/M_u \\le 3.5\\sqrt{f'_c}$. Many test points fall below it, so the code's simple form uses the lower bound $V_c = 2\\sqrt{f'_c}b_wd$.`,
  },
  {
    id: 'ts-why-min',
    topic: T,
    q: 'Why does ACI require a minimum amount of shear reinforcement where $V_u > \\tfrac12\\phi V_c$, even though concrete can carry $\\phi V_c$?',
    seen: [],
    a: `- **Brittle failure.** Without stirrups, diagonal cracking means immediate, sudden failure, with no warning and no reserve. Even a small amount of web steel restrains the crack and lets the beam carry load beyond cracking, so the failure is more ductile.
- **Uncertainty.** Vc is a lower-bound fit to scattered test data. Unexpected loads, restrained shrinkage and temperature stresses, differential settlement or overloads can cause diagonal cracking at lower loads than predicted. Av,min makes sure the crack is crossed by steel that can carry the released tension.
- **Large and high-strength members** show a size effect: their Vc is lower than the formula predicts. Minimum steel compensates.
- The minimum, $A_{v,\\min} = 0.75\\sqrt{f'_c}\\,b_ws/f_{yt} \\ge 50b_ws/f_{yt}$, is sized so the stirrups can carry at least the tension released by cracking, without yielding at once. The √f'c term grows with concrete strength because the cracking load grows too.
- Exceptions (where $V_u > \\frac12\\phi V_c$ is allowed without stirrups): slabs and footings, joist construction, shallow beams (h ≤ 10 in.), and beams integral with slabs.
- **Good practice** (lecture p60): continue stirrups at $s_{\\max}$ to midspan anyway. They support the top bars and cover load cases not considered in design.`,
  },
]
