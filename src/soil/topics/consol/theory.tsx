// Consolidation theory parts from every paper (merged), with full-mark model answers (SJMY sir Lectures 15–20, handnote §5).
import type { SmTheoryItem } from '../../types'
import { FieldCurveSketch, IsochroneFig, SpringFig } from './figs'
import { TvUChart } from '../../reference/con'

const R = String.raw
const T = 'sm-consol' as const

export const CONSOL_THEORY: SmTheoryItem[] = [
  {
    id: 't-terzaghi',
    topic: T,
    q: "Derive Terzaghi's one-dimensional consolidation equation. State the assumptions, where each is used, and their limitations. Physical meaning of the terms; how is Tv related to the degree of consolidation?",
    seen: ['2016-17', '2008-09'],
    a: R`**Assumptions** (limitation in brackets):
1. Clay homogeneous and **fully saturated** (natural clays are layered; some are partly saturated).
2. Soil grains and water **incompressible** — volume change = water squeezed out (reasonable).
3. **Darcy's law** holds (deviations at very low gradients).
4. Flow and compression **one-dimensional**, vertical (field loads are 2-D/3-D; lateral drainage exists).
5. **Small strains**: k, mv and so cv constant over the increment (they fall as e falls).
6. Load applied **instantly**; the initial excess pore pressure u0 = Δσ is uniform with depth (construction is gradual).
7. e–σ′ relation linear and **independent of time** (secondary compression and creep ignored).

**Derivation** (element dx dy dz in a layer of thickness 2d, z down from the top):
1. Inflow velocity vz, outflow $v_z + \frac{\partial v_z}{\partial z}dz$ → net outflow per unit time $= \frac{\partial v_z}{\partial z}dx\,dy\,dz$ [1–4].
2. Darcy: $v_z = -k\frac{\partial h}{\partial z}$, excess head $h = u/\gamma_w$ → outflow $= -\frac{k}{\gamma_w}\frac{\partial^2u}{\partial z^2}dV$.
3. Volume of solids fixed, so the rate of volume decrease $= \frac{1}{1+e_0}\frac{\partial e}{\partial t}dV$ [2].
4. Total stress constant: $\Delta\sigma' = -\Delta u$, and $\Delta e = -a_v\Delta\sigma' = a_v\Delta u$ → $\frac{\partial e}{\partial t} = a_v\frac{\partial u}{\partial t}$ [5–7].
5. Equate: $\frac{k}{\gamma_w}\frac{\partial^2u}{\partial z^2} = \frac{a_v}{1+e_0}\frac{\partial u}{\partial t} = m_v\frac{\partial u}{\partial t}$, which gives Terzaghi's equation (below).
6. Boundary conditions (two-way, thickness 2d): u = u0 at t = 0; u = 0 at z = 0 and z = 2d for t > 0.
7. Solution: $u = \sum_{m=0}^{\infty}\frac{2u_0}{M}\sin\frac{Mz}{d}e^{-M^2T_v}$, $M = \frac{(2m+1)\pi}{2}$, $T_v = \frac{c_vt}{d^2}$.

$$\frac{\partial u}{\partial t} = c_v\frac{\partial^2u}{\partial z^2},\qquad c_v = \frac{k}{m_v\gamma_w}$$

**Meaning:** ∂u/∂t = rate of pore-pressure dissipation; ∂²u/∂z² = curvature of the isochrone (it drives the flow); cv = rate coefficient (high k or low mv → fast).
**Tv and U:** $U = 1 - \sum\frac{2}{M^2}e^{-M^2T_v}$, a unique function of Tv; $T_v \approx \frac{\pi}{4}U^2$ (U < 60 %), $1.781 - 0.933\log(100 - U\%)$ (U ≥ 60 %); U = 50 % at 0.197, 90 % at 0.848.`,
    Fig: () => <IsochroneFig Tv={0.2} way="two" w={300} />,
  },
  {
    id: 't-process',
    topic: T,
    q: 'Explain the process of consolidation in clay (spring–cylinder analogy) and differentiate between primary and secondary consolidation.',
    seen: ['2009-10'],
    a: R`**Spring–cylinder analogy:** a cylinder of water with a spring (= soil skeleton) under a piston, valve = drainage (permeability).
- t = 0 (valve shut / just loaded): water is incompressible, so it carries the whole load: $\Delta u = \Delta\sigma$, $\Delta\sigma' = 0$, no settlement.
- 0 < t < ∞: water escapes slowly through the valve (low k); u falls, the spring compresses and takes the load: $\Delta\sigma = \Delta\sigma' + \Delta u$.
- t → ∞: no more flow, $\Delta u = 0$, $\Delta\sigma' = \Delta\sigma$, settlement complete.
In a clay between sand layers the water near the boundaries escapes first: dissipation is fastest at the drainage faces and slowest in the middle — the **isochrones** show u(z) at successive times.

**Primary vs secondary:**
- **Cause:** primary = expulsion of pore water as the excess u dissipates (σ′ rises); secondary = creep and plastic readjustment of the fabric, viscous adsorbed water squeezed from the contacts, under constant σ′ after u ≈ 0.
- **Governed by:** primary — k and mv (cv), Terzaghi's theory; secondary — Cα, a straight line on e–log t.
- **Size:** primary is the major part in inorganic clays; secondary is large in organic soils, peat and highly plastic clays, small in OC clays.
- **Time:** primary ends when u = 0 (t100); secondary continues indefinitely, ∝ log t.`,
    Fig: () => <SpringFig uFrac={0.55} />,
  },
  {
    id: 't-secondary',
    topic: T,
    q: 'Short note: secondary consolidation (settlement).',
    seen: ['2021-22', '2020-21', '2017-18'],
    a: R`- Compression that continues **after the excess pore pressure has dissipated**, at **constant effective stress**.
- Causes: plastic readjustment and creep of the soil fabric; slow expulsion of highly viscous adsorbed water from the particle contacts; particle breakage.
- On the e–log t (dial–log t) curve it is the final **straight** portion; slope $C_\alpha = \Delta e/\log(t_2/t_1)$.
- Settlement: $S_s = C_\alpha' H\log(t_2/t_1)$, $C_\alpha' = C_\alpha/(1+e_p)$, $e_p$ = void ratio at the end of primary, $t_1$ = time for the end of primary.
- Important in organic soils, peat and highly compressible clays (can exceed primary); very small in OC inorganic clays.
- Example (2010-11 Q8(c)): Sp = 0.179 ft, Ss over 1.5 → 6.5 yr = 0.061 ft.`,
  },
  {
    id: 't-ncoc',
    topic: T,
    q: 'Differentiate between NC and OC soils. What are the causes of preconsolidation? What is its effect on settlement?',
    seen: ['2008-09', '2010-11'],
    a: R`- **NC:** the present effective overburden p0′ is the maximum it has ever carried (pc′ = p0′, OCR = 1); loading follows the steep **virgin** line (Cc).
- **OC:** it carried a larger stress in the past (pc′ > p0′, OCR = pc′/p0′ > 1); reloading follows the flat **recompression** line (Cs ≈ Cc/5–Cc/10) up to pc′. OC clays are stiffer and stronger, may dilate in shear, have higher K0.

**Causes of preconsolidation:**
1. Geological unloading: erosion of overburden, melting of glaciers, removal of soil (old excavation, hills), demolition of old structures.
2. Past lowering of the water table, desiccation (drying) — σ′ was temporarily larger.
3. Secondary compression and ageing (quasi-preconsolidation).
4. Cementation / chemical bonding between particles.

**Effect on settlement:** while p0′ + Δp ≤ pc′ the settlement uses Cs — often only 1/5 to 1/10 of an NC clay's; beyond pc′ the remainder uses Cc ($S = \frac{C_sH}{1+e_0}\log\frac{p_c'}{p_0'} + \frac{C_cH}{1+e_0}\log\frac{p_0'+\Delta p}{p_c'}$). OC clays also consolidate faster (higher cv).`,
  },
  {
    id: 't-pc',
    topic: T,
    q: 'What is preconsolidation pressure? Why is it important in foundation design? How can you estimate it from qu and PI? (and short note on pc′)',
    seen: ['2011-12', '2015-16'],
    a: R`- **pc′** = the maximum effective vertical stress the soil has experienced in its history.
- **Importance:** it says whether the clay is NC or OC (OCR = pc′/p0′). Loads keeping p0′ + Δp below pc′ cause only small recompression settlement (Cs); exceeding it brings in the much larger Cc. It also controls strength, stiffness and the choice of design parameters.
- **From the lab:** Casagrande's construction on the e–log p curve (max curvature → horizontal, tangent, bisector → meets the extended virgin line at pc′).
- **From qu and PI:** $c_u = q_u/2$; Skempton $\frac{c_u}{p'} = 0.11 + 0.0037PI$ with p′ = pc′ ⇒ $p_c' \approx \dfrac{q_u/2}{0.11 + 0.0037PI}$ (Mesri: $c_u \approx 0.22p_c'$). If pc′ ≈ p0′ the clay is NC, larger → OC.`,
  },
  {
    id: 't-disturb',
    topic: T,
    q: 'Effect of sample disturbance on the e–log p curve (and on Cc) from the laboratory test; procedure for establishing the field e–log p curve for NC clay of low to medium plasticity.',
    seen: ['2021-22', '2020-21'],
    a: R`**Effect of disturbance** (stress release, remoulding during sampling and trimming):
- The lab curve lies **below and flatter** than the field curve; the break at pc′ becomes **rounded** and less distinct, so pc′ is underestimated.
- The virgin slope **Cc decreases** (the recompression part becomes steeper) → using the lab Cc **underestimates** field settlement.
- A remoulded specimen's curve lies to the left of the undisturbed one.

**Field curve, NC clay (Schmertmann / Terzaghi–Peck):**
1. Find e0 (= wGs) and p0′ at the sample depth; find pc′ from the lab curve (Casagrande) and confirm pc′ ≈ p0′ (NC).
2. Plot point **a (p0′, e0)**.
3. On the lab virgin curve locate **b at e = 0.42e0** — field and lab curves meet there (disturbance effects vanish at large stress). (SJMY's slide writes 0.4e0.)
4. Join **ab**: the field virgin line; its slope is the **field Cc** used for settlement.`,
    Fig: () => <FieldCurveSketch />,
  },
  {
    id: 't-fieldoc',
    topic: T,
    q: 'Step-by-step procedure for constructing the field e–log p curve for OC clays.',
    seen: ['2017-18'],
    a: R`1. Draw the lab e–log p curve with the unloading (rebound) branch.
2. Find **pc′** by Casagrande's construction; draw the vertical through pc′.
3. Compute the field **p0′** and e0; plot point **a (p0′, e0)**.
4. Find **Cs** from the lab unload–reload loop.
5. From a draw a line **parallel to the rebound curve** (slope Cs) to meet the vertical through pc′ at **b**.
6. Locate **c** on the lab virgin curve at **e = 0.42e0**.
7. Join **bc**. The field curve is **a–b** (recompression, Cs) followed by **b–c** (virgin, field Cc).`,
    Fig: () => <FieldCurveSketch oc />,
  },
  {
    id: 't-fit',
    topic: T,
    q: 'Advantages and limitations of cv obtained by the logarithm-of-time and square-root-of-time methods.',
    seen: ['2023-24'],
    a: R`**Log t (Casagrande), $c_v = 0.197d^2/t_{50}$:**
- Advantages: also gives d0, d100 and the secondary index Cα; separates primary from secondary compression.
- Limitations: needs readings over a long time (more than 24 h per increment) to define d100; some soils (e.g. silty clays) do not give the inverted-S curve; usually gives the **smaller** cv.

**√t (Taylor), $c_v = 0.848d^2/t_{90}$ (1.15× construction):**
- Advantages: quick — t90 is reached early; works when the log t curve is not S-shaped; suits silty soils.
- Limitations: the initial straight portion is sometimes absent or unclear (then use log t); cannot give Cα; usually gives the **larger** cv.

**Both:** lab cv is often much lower than field cv (sample disturbance, small specimen, field drainage through silt/sand lenses); a value belongs to one load increment, so use the increment matching the field stress range.`,
  },
  {
    id: 't-cv',
    topic: T,
    q: 'What is the coefficient of consolidation? Its use and determination. (Short notes: mv, Cc, cv, Cs, pc′.)',
    seen: ['2016-17', '2017-18', '2015-16', '2012-13'],
    a: R`- **cv** $= \dfrac{k}{m_v\gamma_w}$ (m²/yr): combines permeability and compressibility; governs the **rate** of consolidation through $T_v = c_vt/d^2$ (time for any U, settlement at any time). Determined from the time–dial curve of an oedometer increment by **Taylor's √t** ($0.848d^2/t_{90}$) or **Casagrande's log t** ($0.197d^2/t_{50}$) method, or from k and mv.
- **mv** $= \dfrac{\Delta e}{(1+e_0)\Delta p} = \dfrac{a_v}{1+e_0}$ (m²/kN): volumetric strain per unit increase in σ′; falls as the stress rises. Uses: $S = m_v\Delta pH$, $k = c_vm_v\gamma_w$; $1/m_v$ = constrained modulus.
- **Cc** $= \dfrac{\Delta e}{\log(p_2/p_1)}$ on the straight virgin part; practically constant for a soil; NC settlement. Skempton $0.009(LL - 10)$; typical 0.2–0.5, above 1 for organic soils.
- **Cs** (swell index): slope of the unloading (rebound) line, ≈ Cc/5–Cc/10; recompression settlement of OC clays (Cr, the reload slope, ≈ Cs).
- **pc′:** see the preconsolidation item.`,
  },
  {
    id: 't-test',
    topic: T,
    q: 'Describe the consolidation test. Show how its results are used to predict the magnitude and rate of settlement of a structure.',
    seen: ['2012-13', '2009-10', '2007-08'],
    a: R`**Test (oedometer):** an undisturbed specimen (63.5 mm dia × 25 or 20 mm) in a rigid ring between porous stones, submerged (double drainage). Seating load, then increments each kept 24 h, usually doubling (12.5, 25, 50 … 1600 kPa). Dial readings at 0, 0.25, 0.5, 1, 2, 4, 8, 15, 30 min, 1, 2, 4, 8, 24 h. Then unload in steps, oven-dry and weigh: Hs = Ws/(AGsγw), e0 = (H − Hs)/Hs, each e = e_prev − ΔH/Hs.

**Magnitude:** plot e vs log p′ → pc′ (Casagrande), Cc, Cs, av, mv. With the field p0′ (mid-depth) and Δp: NC / OC formulas or $S = \Delta eH/(1+e_0)$ or $m_v\Delta pH$ (correct the curve for disturbance first).

**Rate:** from the time–dial curve of the increment matching the field stress get cv (√t or log t) and Cα. Field $T_v = c_vt/d_{field}^2$ → U → $S_t = US$; or $t_{field} = t_{lab}(d_{field}/d_{lab})^2$ for the same U (2017-18: 2 h × (1600/10)² ≈ 5.8 years).`,
  },
  {
    id: 't-tv',
    topic: T,
    q: 'What is the time factor? How is it related to the average degree of consolidation? Steps for the time–settlement curve in the field. Prove that S² ∝ t for U < 60 %.',
    seen: ['2011-12', '2010-11', '2015-16'],
    a: R`- **Time factor** $T_v = c_vt/d^2$: dimensionless time combining soil (cv), drainage path (d = H/2 two-way, H one-way) and elapsed time. Every layer with the same Tv has the same U.
- **Relation:** $U = 1 - \sum\frac{2}{M^2}e^{-M^2T_v}$; approximately $T_v = \frac{\pi}{4}U^2$ (U < 60 %), $1.781 - 0.933\log(100 - U\%)$ (U ≥ 60 %); table 10 % → 0.008 … 50 % → 0.197 … 90 % → 0.848.

**Steps (time–settlement curve):**
1. Ultimate primary settlement S (e0, Cc, Cs, p0′, pc′, Δp).
2. cv from the test (√t / log t) or k/(mvγw).
3. d = H/2 or H.
4. Choose times t1, t2 … → $T_v = c_vt/d^2$.
5. U from the table / formulas.
6. $S_t = US$; plot S_t against t. (Reverse: U = S_t/S → Tv → $t = T_vd^2/c_v$.)

**Proof:** for U < 60 %, $T_v = \frac{\pi}{4}U^2$ with $U = S_t/S$ and $T_v = c_vt/d^2$: $\frac{c_vt}{d^2} = \frac{\pi}{4}\frac{S_t^2}{S^2}$ ⇒ $S_t^2 = \left[\frac{4c_vS^2}{\pi d^2}\right]t$. The bracket is constant for a layer, so **S_t² ∝ t** (S_t ∝ √t — the basis of Taylor's method).`,
    Fig: () => <TvUChart U={50} w={300} />,
  },
  {
    id: 't-avgU',
    topic: T,
    q: 'Short note: average degree of consolidation.',
    seen: ['2020-21'],
    a: R`- At a depth, $U_z = 1 - u/u_0$ (varies with z: the isochrones).
- For the whole layer: $U = 1 - \dfrac{\int_0^{2d}u\,dz}{u_0(2d)} = \dfrac{S_t}{S_{final}} = 1 - \sum\dfrac{2}{M^2}e^{-M^2T_v}$.
- A unique function of Tv (table, formulas); used to get the settlement at a time ($S_t = US$) or the time for a settlement ($U = S_t/S$ → Tv → t).
- Graphically: 1 − (area under the current isochrone ÷ area of the initial rectangle).`,
    Fig: () => <IsochroneFig Tv={0.3} way="two" w={280} many={false} />,
  },
  {
    id: 't-drains',
    topic: T,
    q: 'Describe sand drains: how they are designed and used. Step-by-step procedure for the degree of consolidation with sand drains using Barron\'s chart.',
    seen: ['2012-13', '2016-17', '2009-10', '2007-08'],
    a: R`**What:** vertical columns of clean free-draining sand (or prefabricated band / wick drains, PVD) installed through soft saturated clay at close spacing. Installation: drive a casing (or mandrel), fill with sand, withdraw; a sand blanket on top connects them; then a surcharge (pre-load).

**Principle:** short **horizontal** drainage paths (radial flow, kh > kv). Since t ∝ d², consolidation that takes years by vertical drainage finishes in months.

**Use:** pre-consolidation of soft clays for embankments, port yards, tanks; gaining strength for staged construction.

**Design / procedure (Barron, equal strain):**
1. Drain radius rw (smear radius rs if relevant), spacing s and pattern: $d_e = 1.128s$ (square) or $1.05s$ (triangular); $r_e = d_e/2$. (SJMY's slide labels 0.564s / 0.525s, which are re.)
2. $n = r_e/r_w$ selects the curve.
3. Horizontal coefficient cvr (= cv isotropic, or cv kh/kv).
4. For time t: $T_r = c_{vr}t/d_e^2$ → Ur from the chart, or $U_r = 1 - \exp[-8T_r/F(n)]$, $F(n) = \frac{n^2}{n^2-1}\ln n - \frac{3n^2-1}{4n^2}$.
5. Vertical: $T_v = c_vt/d^2$ → Uv.
6. Combine $U = 1 - (1-U_v)(1-U_r)$; $S_t = US$.
7. Repeat with other spacings until the required U is reached in the time available. (2012-13 Q11(c): Uv = 25 %, Ur = 52 % → U ≈ 64 %.)`,
  },
]
