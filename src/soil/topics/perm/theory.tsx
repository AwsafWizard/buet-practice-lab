import type { SmTheoryItem } from '../../types'
import { LayersFig } from './Labs'

const T = 'sm-perm' as const

function LayerFigs() {
  const ls = [
    { H: 2, k: 1e-3 },
    { H: 3, k: 1e-5 },
    { H: 2, k: 1e-4 },
  ]
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <LayersFig ls={ls} dir="v" />
      <LayersFig ls={ls} dir="h" />
    </div>
  )
}

function CapFig() {
  return (
    <svg viewBox="0 0 300 170" className="w-full max-w-[320px]" role="img" aria-label="capillary tube">
      <rect x={20} y={130} width={260} height={35} fill="var(--c-water)" opacity={0.25} />
      <rect x={130} y={20} width={20} height={145} fill="none" stroke="var(--c-ink)" />
      <rect x={131} y={45} width={18} height={120} fill="var(--c-water)" opacity={0.45} />
      <path d="M131,45 Q140,53 149,45" fill="none" stroke="var(--c-water)" strokeWidth={1.5} />
      <path d="M131,45 l-14,-10 M149,45 l14,-10" stroke="var(--c-load)" strokeWidth={1.5} />
      <text x={170} y={35} fontSize={10} fill="var(--c-load)">
        T = σ per unit length, at θ
      </text>
      <line x1={170} y1={45} x2={170} y2={130} stroke="var(--c-mute)" />
      <text x={175} y={90} fontSize={10} fill="var(--c-mute)">
        hc
      </text>
      <text x={20} y={20} fontSize={10.5} fill="var(--c-ink)">
        πr²hcγw = 2πrσcosθ
      </text>
    </svg>
  )
}

export const PERM_THEORY: SmTheoryItem[] = [
  {
    id: 't-layered',
    topic: T,
    q: "Derive the expression for the 'equivalent coefficient of permeability' of layered deposits with flow perpendicular (and parallel) to the bedding planes.",
    seen: ['2023-24'],
    a: `Layers of thickness $H_1 … H_n$, permeabilities $k_1 … k_n$, $H = \\sum H_i$.

**Flow perpendicular to the bedding (vertical):**
1. Continuity: the same discharge velocity passes through every layer, $v = v_1 = v_2 = … = v_n$.
2. The total head loss is the sum of the losses in the layers: $h = h_1 + h_2 + … + h_n$.
3. Darcy in layer i: $v = k_i\\,h_i/H_i$ → $h_i = vH_i/k_i$. For the whole deposit $v = k_{v,eq}h/H$ → $h = vH/k_{v,eq}$.
4. Substituting: $\\dfrac{vH}{k_{v,eq}} = v\\sum\\dfrac{H_i}{k_i}$ →
$$k_{v,eq} = \\frac{H}{H_1/k_1 + H_2/k_2 + … + H_n/k_n}$$
It is governed by the **least permeable** layer.

**Flow parallel to the bedding (horizontal):** every layer has the same gradient i; flows add: $q = \\sum k_iiH_i = k_{h,eq}iH$ →
$$k_{h,eq} = \\frac{\\sum k_iH_i}{H}$$
governed by the most permeable layer. Always $k_{h,eq} \\ge k_{v,eq}$: natural deposits are anisotropic.`,
    Fig: LayerFigs,
  },
  {
    id: 't-lab-methods',
    topic: T,
    q: 'State the differences in principle and applications of the various methods of determining the coefficient of permeability in the laboratory.',
    seen: ['Jan 2021'],
    a: `- **Constant head:** a steady head h is kept by a continuous supply; collect Q in time t across a sample of length L and area A: $k = \\dfrac{QL}{Aht}$. **Coarse soils** (sand, gravel, k > 10⁻³ cm/s) where measurable flow comes quickly. Water enters from the bottom to drive air out; saturate first and wait for steady flow.
- **Falling (variable) head:** water in a standpipe of area a falls from $h_1$ to $h_2$ in time t: $q = -a\\,dh/dt = k(h/L)A$ → $k = 2.303\\dfrac{aL}{At}\\log\\dfrac{h_1}{h_2}$. **Fine sand and silt** (10⁻³–10⁻⁶ cm/s); no continuous supply needed. For clays the long duration and evaporation spoil it.
- **Indirect, from the consolidation test:** $k = c_vm_v\\gamma_w$ ($c_v$ from √t or log t fitting, $m_v$ from the e–p curve). **Clays**, k < 10⁻⁶ cm/s.
- **Flexible-wall (triaxial) permeameter:** back-pressure saturated sample under confining stress: low-permeability soils at their in-situ stress, no side leakage.
- **Empirical (Hazen):** $k = CD_{10}^2$: a rough estimate for clean uniform sands.

Lab values come from small, often disturbed samples; for stratified coarse deposits field pumping tests are better.`,
  },
  {
    id: 't-velocity',
    topic: T,
    q: 'Define discharge velocity and seepage velocity (and seepage pressure).',
    seen: ['2011-12'],
    a: `- **Discharge velocity** $v = q/A = ki$ (Darcy): flow rate per unit **gross** area of soil (solids + voids).
- **Seepage velocity** $v_s = q/A_v$: the actual average velocity of water through the voids. Since $A_v = nA$ on average, $v_s = v/n$, always **greater** than v (n < 1).
- **Seepage pressure** $p_s = iz\\gamma_w = h\\gamma_w$: the pressure the flowing water transfers to the skeleton by viscous drag, along the flow; it raises σ′ for downward flow and lowers it for upward flow.
- Darcy's law (hence v = ki) holds for **laminar** flow (zone I of the v–i plot); at high gradients in coarse gravels the flow turns turbulent.
- Example (2012-13 Q10(c)): k = 1.06 × 10⁻² cm/s, i = 2.67 → v = 0.0283 cm/s; n = 0.377 → vs = 0.075 cm/s.`,
  },
  {
    id: 't-typical-k',
    topic: T,
    q: 'Write down typical values of the coefficient of permeability of coarse sand, fine sand and clay. What factors affect k?',
    seen: ['2011-12', '2015-16'],
    a: `**Typical k (cm/s):** clean gravel > 10⁻¹; **coarse sand 1 – 10⁻²**; **fine sand 10⁻² – 10⁻³**; silty sand and silt 10⁻³ – 10⁻⁵; **clay < 10⁻⁶** (10⁻⁷ – 10⁻⁹).

**Factors (Lecture 7):**
- **Grain size and grading:** $k \\propto D_{10}^2$ (Hazen $k = CD_{10}^2$, C ≈ 100–150 with D10 in cm).
- **Void ratio:** k rises with e.
- **Structure:** flocculated (higher k) vs dispersed; stratification gives $k_h > k_v$.
- **Degree of saturation:** trapped air blocks flow, k lower than saturated.
- **Pore fluid and temperature** via γw/η: $k_{T_1} = k_T\\,\\eta_T/\\eta_{T_1}$ (k quoted at 20 °C).`,
  },
  {
    id: 't-k-clay',
    topic: T,
    q: 'How do you determine (estimate) the coefficient of permeability of a clay / clayey soil?',
    seen: ['2010-11', '2016-17', '2015-16'],
    a: `Direct tests take too long (hardly any water passes in a reasonable time) and evaporation from a standpipe causes large errors, so k of clay is found **indirectly from the one-dimensional consolidation (oedometer) test**:
1. For the load increment of interest, fit the dial-reading vs time curve: **√t (Taylor)** $c_v = 0.848d^2/t_{90}$ or **log t (Casagrande)** $c_v = 0.197d^2/t_{50}$ (d = drainage path).
2. From the e–p curve, $a_v = \\Delta e/\\Delta p$ and $m_v = a_v/(1 + e_0)$.
3. $$k = c_vm_v\\gamma_w$$
Alternatives: a falling-head test run in the consolidometer ring, or a flexible-wall (triaxial) permeameter with back pressure. Field: piezocone dissipation or in-situ tests.`,
  },
  {
    id: 't-misleading',
    topic: T,
    q: '"The results of permeability tests on cohesionless materials are often misleading" — explain.',
    seen: ['2010-11'],
    a: `- **Undisturbed samples** of sand, silt and silty sand are almost impossible to get; the lab density, structure and grain orientation differ from the field.
- **Stratification and anisotropy:** natural deposits are layered ($k_h \\gg k_v$) with lenses, fissures and root holes; a small specimen cannot represent the mass.
- **Air** trapped in the sample, **migration of fines** and **segregation** while placing, and **side-wall leakage** all change k.
- At high lab gradients the flow may become **turbulent** in coarse soils, so Darcy's law no longer applies; very low gradients in fine soils may be affected by threshold effects.
- Temperature and the water used (dissolved air) also matter.

So for cohesionless deposits **field pumping tests** (or in-situ borehole tests) give far more reliable values.`,
  },
  {
    id: 't-capillary',
    topic: T,
    q: 'Discuss the phenomenon of capillary rise in soils (short note). Give typical ranges of capillary rise for various soils.',
    seen: ['2009-10', '2007-08', '2011-12'],
    a: `**Mechanism:** the voids in soil form tiny, irregular, interconnected tubes. Water wets the grains (adhesion > cohesion, **concave meniscus**), and surface tension pulls a column of water up above the water table.

**Tube:** weight of the column = vertical component of the surface tension:
$$\\pi r^2h_c\\gamma_w = 2\\pi r\\sigma\\cos\\theta\\ \\Rightarrow\\ h_c = \\frac{2\\sigma\\cos\\theta}{r\\gamma_w} = \\frac{4\\sigma\\cos\\theta}{d\\gamma_w}$$
For water (σ ≈ 0.073 N/m, θ ≈ 0) $h_c \\approx 0.3/d$ cm (d in cm): the finer the pores, the higher the rise. **Soils (Hazen):** $h_c = C/(eD_{10})$, C = 0.1–0.5 cm².

**Typical rise:** coarse sand 0.03–0.15 m; fine sand 0.3–1.2 m; silt 0.75–7.5 m; clay 7.5–25 m (more in theory, but it rises very slowly).

**Effects:** the capillary zone is (nearly) saturated with **negative pore pressure** $u = -h\\gamma_w$, which **raises σ′** and gives apparent cohesion (damp sand stands in a cut); it also feeds frost heave, dampness of floors and walls, and salt efflorescence; capillary breaks (coarse layers) stop it.`,
    Fig: CapFig,
  },
]
