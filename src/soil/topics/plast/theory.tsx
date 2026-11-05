// Plasticity theory and derivations with full-mark model answers.
import type { SmTheoryItem } from '../../types'
import { LimitPhases, ShrinkPlot } from './figs'
import { StateBar } from './figs'

const T = 'sm-plast' as const

const FigLimits = () => (
  <div className="space-y-2">
    <LimitPhases PL={30} LL={65} />
    <StateBar PL={30} LL={65} SL={15} w={38} w2={58} />
  </div>
)
const FigShrink = () => <ShrinkPlot w1={45} SL={12} V1={13.2} V2={10} />

export const PLAST_THEORY: SmTheoryItem[] = [
  {
    id: 't-limits-phase',
    topic: T,
    q: 'Draw three-phase presentations of a soil at its plastic limit and liquid limit. At which natural moisture content between the LL and the PL is a high-plasticity soil expected to show higher shear strength? Show on a qualitative scale and give reasons.',
    seen: ['2023-24'],
    a: `**Phase diagrams.** At both limits the remoulded soil is **saturated** (no air): the Atterberg limits are measured on a soil paste. Take the same solids, $V_s = 1$, $W_s = G_s\\gamma_w$ (slide 7 adds water to the same solids step by step):
- At the PL: $V_w = V_v = w_{PL}G_s$, $W_w = w_{PL}G_s\\gamma_w$, $e_{PL} = w_{PL}G_s$.
- At the LL: $V_w = V_v = w_{LL}G_s$ — a **larger** water block: $\\Delta W = (w_{LL} - w_{PL})W_s = PI\\cdot W_s$ has been added.
- (At the SL, below the PL, the soil is still just saturated at its minimum volume.)

**Strength.** Higher shear strength at the water content **closer to the PL** (liquidity index $LI = (w - PL)/PI \\to 0$).
- Qualitative scale (slide 18): LI ≈ 0 → "high strength, competent"; LI ≈ 1 → "low strength, incompetent". The undrained strength at the PL is roughly **100 times** that at the LL (≈ 170 kPa vs ≈ 1.7 kPa).
- Slide 7 stress–strain sketches: at SL "high stress, less deformation"; at PL "medium-high stress, acceptable deformation"; at LL "low stress, large deformation".

**Reason:** with less water the particles are closer, the adsorbed water films are thinner and the inter-particle attraction and contacts are greater, so the soil resists shear; adding water separates the particles until at the LL the soil flows under its own weight. A high-plasticity soil needs a lot of water (large PI) to go from PL to LL, so its strength changes over a wide range of w.`,
    Fig: FigLimits,
  },
  {
    id: 't-sl-unknown',
    topic: T,
    q: 'Deduce an expression for the shrinkage limit of a soil when the specific gravity of the soil solids is unknown.',
    seen: ['2009-10', '2015-16'],
    a: `*(Shrinkage limit calculation is not on AJK sir's slides — SL is only named, ASTM D427.)*

**Test.** A saturated pat (mass $m_1$, volume $V_1$, water content $w_1$) is dried in a shrinkage dish and then oven-dried (mass $m_2 = M_s$, volume $V_2$ by mercury displacement).

**Derivation** (volume–water content diagram):
1. From $w_1$ down to the SL the soil stays saturated, so every gram of water lost reduces the volume by $1/\\rho_w$ cm³.
2. Below the SL the volume stays at $V_2$; water lost is replaced by air.
3. Water at the start: $m_1 - m_2$. Water lost while shrinking: $(V_1 - V_2)\\rho_w$.
4. Water still present at the SL: $(m_1 - m_2) - (V_1 - V_2)\\rho_w$, so
$$\\boxed{SL = \\frac{(m_1 - m_2) - (V_1 - V_2)\\rho_w}{m_2}\\times 100\\% = w_1 - \\frac{(V_1 - V_2)\\rho_w}{m_2}\\times100\\%}$$
- Only masses and volumes are needed, no $G_s$. As a by-product $G_s = \\dfrac{m_2}{(V_2 - SL\\cdot m_2/\\rho_w)\\rho_w}$ (saturated at $V_2$).
- Shrinkage ratio $SR = m_2/(V_2\\rho_w)$; volumetric shrinkage $(w_1 - SL)\\,SR$.`,
    Fig: FigShrink,
  },
  {
    id: 't-sl-known',
    topic: T,
    q: 'Define shrinkage limit. Derive an expression for the shrinkage limit of a soil whose specific gravity $G_s$ is known.',
    seen: ['2021-22'],
    a: `**Shrinkage limit (SL):** the water content at which further loss of water causes **no further reduction in volume** — the boundary between the solid and semi-solid states (slide 7: $w_{SL} = W_{w1}/W_s \\times 100$). It is the smallest water content at which the soil can still be saturated. *(The derivation is not on the slides.)*

**Derivation** (dry pat: mass $m_2 = W_s$, volume $V_2$):
1. At the SL the soil has its final (dry) volume $V_2$ and is just saturated: $V_v = V_w$.
2. $V_s = \\dfrac{W_s}{G_s\\rho_w}$, so $V_w = V_2 - \\dfrac{W_s}{G_s\\rho_w}$.
3. $SL = \\dfrac{W_w}{W_s} = \\dfrac{V_w\\rho_w}{W_s}$:
$$\\boxed{SL = \\left(\\frac{V_2\\rho_w}{W_s} - \\frac{1}{G_s}\\right)\\times 100\\% = \\left(\\frac{\\rho_w}{\\rho_d} - \\frac{1}{G_s}\\right)\\times100\\%}$$
- In terms of the void ratio at the SL: $e_{SL} = SL\\cdot G_s$, i.e. $SL = e_{SL}/G_s$ (2010-11 Q1(a)).
- With the shrinkage ratio $SR = W_s/(V_2\\rho_w)$: $SL = 1/SR - 1/G_s$.`,
    Fig: FigShrink,
  },
  {
    id: 't-cone',
    topic: T,
    q: 'How is the liquid limit determined by the fall-cone method? How can the plastic limit be found with the same apparatus? How is a one-point (single-point) check made?',
    seen: ['2009-10', '2017-18', '2021-22', 'Jan 2021'],
    a: `**Fall cone (BS 1377, slide 13):** a stainless 30° cone of mass **80 g** (0.78 N) rests with its tip on the levelled soil in a cup 55 mm across and 40 mm deep; it is released for **5 s** and the penetration d is read.
1. Repeat at 4–5 water contents giving d between about 15 and 25 mm.
2. Plot w against d (the slide draws d on a log scale; BS uses a linear scale) and draw the best straight line.
3. **LL = w at d = 20 mm.** More repeatable than the cup (less operator judgement); suited to the 2017-18, 2021-22, Jan 2021 data.

**PL with the same apparatus** *(not on the slides)*: the PL is where the strength is about **100 times** that at the LL, and cone strength ∝ mass/d².
- Two-cone method: repeat the test with a **240 g** cone (3 × the mass). At the same penetration the two w–log d lines are $\\Delta w$ apart; then $PI = 2\\Delta w/\\log 3$ and $PL = LL - PI$ (Wood & Wroth).
- Or extend the 80 g line to d = 2 mm (100 × the strength at 20 mm): the w there is the PL.

**One-point methods** *(not on the slides)*: from one reading near the target,
- cup: $LL = w_N(N/25)^{0.121}$ (N between 20 and 30);
- cone: $w_L = \\dfrac{w_y}{0.77\\log_{10} y}$ (IS 2720-5, y between 14 and 28 mm) — e.g. Jan 2021: 54.1 % at 19.3 mm → 54.7 %, close to the 54.9 % from the graph.
- A one-point check works only when the reading is close to 25 blows / 20 mm; steep data (2021-22) give ±5 %.`,
  },
  {
    id: 't-indices',
    topic: T,
    q: 'Define plasticity index, liquidity index, consistency index, flow index and toughness index. Using them, how do you decide which of two soils is (i) more plastic, (ii) a better foundation material on remoulding, (iii) of better strength as a function of water content, (iv) of better strength at the plastic limit?',
    seen: ['2012-13', '2016-17'],
    a: `- **Plasticity index** $PI = LL - PL$: range of water content over which the soil is plastic (Burmister: 0 non-plastic … over 40 very high).
- **Liquidity index** $LI = (w - PL)/PI$: where the natural w sits in the plastic range (0 at PL, 1 at LL).
- **Consistency index** $CI = (LL - w)/PI = 1 - LI$ *(not on the slides)*.
- **Flow index** $I_F = (w_1 - w_2)/\\log(N_2/N_1)$: slope of the flow curve (slide 11).
- **Toughness index** $I_T = PI/I_F$ *(not on the slides)*.

**Decisions:**
1. **More plastic** → larger PI.
2. **Better foundation material on remoulding** → larger CI (stiffer; CI < 0 means w > LL, the soil turns liquid when remoulded).
3. **Better strength as a function of water content** → smaller flow index (flatter flow curve: strength falls more slowly as w rises).
4. **Better shear strength at the PL** → larger toughness index.
- Example 2012-13: A (LL 30, PL 16, $I_F$ 12, w 32), B (52, 19, 6, 40): PI 14 / 33, CI −0.14 / 0.36, $I_T$ 1.17 / 5.5 → B in all four.`,
  },
]
