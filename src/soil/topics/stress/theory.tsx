// Stress-distribution theory parts from every paper (merged), with full-mark model answers (SJMY sir Lectures 21–25).
import { ContactFig } from '../../reference/sd'
import type { SmTheoryItem } from '../../types'
import { ShapeCompareFig } from './figs'
import { NewmarkChart } from './newmark'
import { DepthChart } from './figs'
import { boussinesq } from '../../engine/stressdist'

const R = String.raw
const T = 'sm-stress' as const

export const STRESS_THEORY: SmTheoryItem[] = [
  {
    id: 't-shapes',
    topic: T,
    q: 'Compare (comment on) the increase in vertical stress with depth below the centre of circular, square and strip loads.',
    seen: ['2023-24', '2020-21', 'Jan 2021'],
    a: R`For the same intensity q and width B (circle D = B, square B × B, strip of width B):
1. At the surface $\Delta\sigma_z = q$ under the centre for all three.
2. It decreases rapidly with depth for all — **fastest under the circle**, then the **square** (nearly the same curve), **slowest under the strip**, because an infinitely long strip loads a far larger area.
3. At z = B: circle ≈ 0.28q, square ≈ 0.34q, strip ≈ 0.55q. At z = 2B: circle ≈ 0.09q, square ≈ 0.11q, strip ≈ 0.31q; the strip falls to 0.1q only at ≈ 3–4B on the lecture charts (Boussinesq: ≈ 6B).
4. So the **0.1q pressure bulb** (significant depth) reaches ≈ 2B for square / circular footings and ≈ 4B (or more) for strip footings — investigate the ground and compute settlement at least that deep.
5. Pressure bulbs (isobars) are drawn the same way: a strip's bulbs are long and deep, a square's or circle's are short.`,
    Fig: () => <ShapeCompareFig w={320} />,
  },
  {
    id: 't-contact',
    topic: T,
    q: 'What is contact pressure? What factors affect its distribution? Draw (discuss) contact pressure and settlement below flexible and rigid foundations on sand and clay.',
    seen: ['2020-21', '2010-11', '2009-10'],
    a: R`**Contact pressure:** the pressure acting at the interface between the base of a foundation and the soil.

**Factors:** flexural rigidity of the footing; type and elastic properties of the soil (clay vs sand); intensity of the load; size of the footing; depth of embedment.

**Flexible footing (uniform load):**
- Contact pressure **uniform** on both soils; the settlement profile differs.
- **Clay (φ = 0):** dish (bowl) shape — maximum settlement at the centre, less at the edges (elastic half-space).
- **Sand (c = 0):** inverted dish — the edges settle more, because the soil there has little confinement (low stiffness) while the centre is confined.

**Rigid footing:** settlement **uniform**.
- **Clay:** contact pressure minimum at the centre, rising to very high values at the edges.
- **Sand:** parabolic — zero at the edges, maximum at the centre; the peak grows as the load increases.

Real footings lie in between; design assumes a uniform contact pressure, and the factor of safety covers the difference.`,
    Fig: ContactFig,
  },
  {
    id: 't-newmark',
    topic: T,
    q: 'From σz = q[1 − {1/(1 + (r/z)²)}^(3/2)] below the centre of a circle, construct a Newmark chart of influence value 0.005, and describe how it is used.',
    seen: ['2007-08', '2008-09'],
    a: R`1. Rearrange: $\dfrac{r}{z} = \sqrt{\left(1 - \dfrac{\sigma_z}{q}\right)^{-2/3} - 1}$.
2. Take σz/q = 0.1, 0.2 … 0.9 → r/z = 0.270, 0.400, 0.518, 0.637, 0.766, 0.918, 1.110, 1.387, 1.908 (σz/q = 1 → ∞).
3. Choose the scale line **AB = z** (e.g. 3 cm); draw the 9 concentric circles with radii (r/z) × AB (0.81, 1.20, 1.55, 1.91, 2.30, 2.75, 3.33, 4.16, 5.72 cm). Each ring between circles adds 0.1q at depth z below the centre (the 10th ring runs to infinity).
4. For If = 0.005 divide every ring into 0.1/0.005 = **20 sectors** (radial lines 18° apart): 10 × 20 = 200 meshes, each giving 0.005q.
5. **Use:** draw the plan to the scale AB = depth z; put the point at the chart centre; count the meshes N covered (with fractions); $\sigma_z = I_f\,N\,q = 0.005Nq$. A new depth needs a new plan scale; the chart is unchanged.
6. Example (2007-08): 8 m raft, z = 4 m = AB → raft radius = 1.0 AB, between circles 6 and 7 → N ≈ 129 → σz ≈ 129 kPa (formula 129.3).`,
    Fig: () => <NewmarkChart size={300} showRadii />,
  },
  {
    id: 't-maxsz',
    topic: T,
    q: 'Write σz due to a point load Q as a function of z and r. For a given r, find the depth (angle β) at which σz is maximum, and the maximum value.',
    seen: ['2012-13', '2011-12', '2017-18'],
    a: R`1. Boussinesq: $\sigma_z = \dfrac{3Q}{2\pi}\dfrac{z^3}{(r^2+z^2)^{5/2}} = \dfrac{3Q}{2\pi z^2}\dfrac{1}{[1+(r/z)^2]^{5/2}}$.
2. For fixed r: $\dfrac{d\sigma_z}{dz} = \dfrac{3Q}{2\pi}\dfrac{3z^2(r^2+z^2) - 5z^4}{(r^2+z^2)^{7/2}} = 0$.
3. ⇒ $3r^2 = 2z^2$ ⇒ $r/z = \sqrt{2/3} = 0.8165$, $z = 1.225r$.
4. $\tan\beta = r/z$ ⇒ **β = 39.23° (39°14′)** from the load axis — the line at 39°14′ cuts every vertical line at its maximum.
5. $K_B(0.8165) = 0.1331$ ⇒ $\sigma_{z,max} = 0.1331\dfrac{Q}{z^2} = \dfrac{0.0888\,Q}{r^2}$.
6. 2012-13: Q = 20 kN, r = 2 m → z = 2.45 m, σmax = 0.44 kPa. 2017-18: Q = 50 000 kN, r = 7.5 m → z = 9.19 m, 78.9 kPa.`,
    Fig: () => <DepthChart zMax={8} xLabel="σz for Q = 100 kN" curves={[1, 2, 3].map((r) => ({ f: (z: number) => boussinesq(100, r, z), label: `r = ${r} m` }))} w={300} />,
  },
]
