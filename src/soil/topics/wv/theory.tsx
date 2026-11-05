// Weight–volume theory and derivations, merged across the papers, with full-mark model answers.
import type { SmTheoryItem } from '../../types'

const T = 'sm-wv' as const

/** Vs = 1 phase diagram used by every derivation */
export function UnitPhaseFig({ saturated }: { saturated?: boolean }) {
  const bx = 150,
    bw = 110
  const air = saturated ? 0 : 34
  const yA = 12,
    yW = yA + air,
    yS = yW + (saturated ? 70 : 46),
    yE = yS + 70
  const t = { fontSize: 11, fill: 'var(--c-ink)' } as const
  return (
    <svg viewBox="0 0 470 190" style={{ width: '100%', maxWidth: 470 }}>
      {!saturated && <rect x={bx} y={yA} width={bw} height={air} fill="transparent" stroke="var(--c-ink)" />}
      {!saturated && (
        <>
          <text x={bx + bw / 2} y={yA + 21} textAnchor="middle" {...t}>
            Air
          </text>
          <text x={bx + bw + 10} y={yA + 21} {...t}>
            Va = (1 − S)e
          </text>
          <text x={bx - 10} y={yA + 21} textAnchor="end" {...t}>
            0
          </text>
        </>
      )}
      <rect x={bx} y={yW} width={bw} height={yS - yW} fill="color-mix(in oklab, var(--c-water) 30%, transparent)" stroke="var(--c-ink)" />
      <text x={bx + bw / 2} y={(yW + yS) / 2 + 4} textAnchor="middle" {...t}>
        Water
      </text>
      <text x={bx + bw + 10} y={(yW + yS) / 2 + 4} {...t}>
        Vw = {saturated ? 'e' : 'Se'}
      </text>
      <text x={bx - 10} y={(yW + yS) / 2 + 4} textAnchor="end" {...t}>
        Ww = {saturated ? 'eγw' : 'Seγw = wGsγw'}
      </text>
      <rect x={bx} y={yS} width={bw} height={yE - yS} fill="color-mix(in oklab, var(--c-soil) 70%, transparent)" stroke="var(--c-ink)" />
      <text x={bx + bw / 2} y={(yS + yE) / 2 + 4} textAnchor="middle" {...t}>
        Solids
      </text>
      <text x={bx + bw + 10} y={(yS + yE) / 2 + 4} {...t}>
        Vs = 1
      </text>
      <text x={bx - 10} y={(yS + yE) / 2 + 4} textAnchor="end" {...t}>
        Ws = Gsγw
      </text>
      <path d={`M ${bx + bw + 120} ${yA} h 6 V ${yS} h -6`} fill="none" stroke="var(--c-mute)" />
      <text x={bx + bw + 132} y={(yA + yS) / 2 + 4} {...t}>
        Vv = e
      </text>
      <path d={`M ${bx + bw + 175} ${yA} h 6 V ${yE} h -6`} fill="none" stroke="var(--c-mute)" />
      <text x={bx + bw + 185} y={(yA + yE) / 2 + 4} {...t}>
        V = 1 + e
      </text>
      <text x={bx + bw / 2} y={yE + 16} textAnchor="middle" fontSize={10} fill="var(--c-mute)">
        weights (left) · volumes (right) · Vs = 1
      </text>
    </svg>
  )
}

const FigUnsat = () => <UnitPhaseFig />
const FigSat = () => <UnitPhaseFig saturated />

export const WV_THEORY: SmTheoryItem[] = [
  {
    id: 't-block',
    topic: T,
    q: 'What is a block (phase) diagram? What are its uses? How do you determine the void ratio of a soil?',
    seen: ['2016-17', '2009-10'],
    a: `**Block (three-phase) diagram.** A soil mass is solids + water + air mixed together. The block diagram separates the three phases into stacked blocks — air on top, water, solids at the bottom — with **weights written on the left** ($W_a \\approx 0,\\ W_w,\\ W_s$) and **volumes on the right** ($V_a, V_w, V_s$; $V_v = V_a + V_w$).
$$V = V_s + V_v = V_s + V_w + V_a,\\qquad W = W_s + W_w$$

**Uses:**
- Defines every index property on one picture: $e = V_v/V_s$, $n = V_v/V$, $S = V_w/V_v$, $w = W_w/W_s$, $\\gamma = W/V$, $\\gamma_d = W_s/V$, $G_s = W_s/(V_s\\gamma_w)$.
- Solves any weight–volume problem without memorising formulas: assume $V = 1$ or $V_s = 1$ if no size is given, fill the blocks, read the answers off (AJK sir: "No derived expression has been used!").
- Derives the standard relations ($Se = wG_s$, $\\gamma_d = G_s\\gamma_w/(1+e)$ …) and checks data (S cannot exceed 100 %).
- Earthwork and compaction bookkeeping: water to add, borrow volumes.

**Void ratio in the lab:**
1. Moist unit weight: trim a specimen of known volume (core cutter, cylinder) and weigh it → $\\gamma = W/V$.
2. Water content by oven drying (105–110 °C, 24 h) → $w$.
3. Specific gravity of solids by pycnometer → $G_s$.
4. $\\gamma_d = \\gamma/(1+w)$, then $e = \\dfrac{G_s\\gamma_w}{\\gamma_d} - 1$ (from the block diagram with $V_s = 1$).
- For a saturated soil only w and Gs are needed: $e = wG_s$.`,
    Fig: FigUnsat,
  },
  {
    id: 't-se',
    topic: T,
    q: 'Define degree of saturation, dry unit weight and percentage (air) voids. Using a block diagram, establish the relationship between void ratio, water content, degree of saturation and specific gravity ($Se = wG_s$).',
    seen: ['2007-08', '2016-17'],
    a: `**Definitions**
- Degree of saturation $S = V_w/V_v \\times 100\\%$ (0 % dry, 100 % saturated).
- Dry unit weight $\\gamma_d = W_s/V$ — weight of solids per unit **total** volume.
- Percentage air voids $n_a = V_a/V \\times 100\\%$ (air content $a_c = V_a/V_v$).

**Derivation** (block diagram, take $V_s = 1$):
1. $V_v = eV_s = e$; $V_w = SV_v = Se$; $V = 1 + e$.
2. $W_s = G_s\\gamma_wV_s = G_s\\gamma_w$.
3. $W_w = \\gamma_wV_w = Se\\gamma_w$.
4. $w = \\dfrac{W_w}{W_s} = \\dfrac{Se\\gamma_w}{G_s\\gamma_w} = \\dfrac{Se}{G_s}$
$$\\boxed{Se = wG_s}$$
- Saturated soil (S = 1): $e = wG_s$. Dry soil: w = 0, S = 0.
- Note (slide 8): 100 % saturation does not mean 100 % water content.`,
    Fig: FigUnsat,
  },
  {
    id: 't-gd',
    topic: T,
    q: 'Using the phase diagram, establish an expression for $\\gamma_d$ in terms of S, w, $G_s$ and $\\gamma_w$.',
    seen: ['2021-22'],
    a: `Take $V_s = 1$ on the block diagram:
1. $W_s = G_s\\gamma_w$, $V_v = e$, $V = 1 + e$.
2. $V_w = W_w/\\gamma_w = wG_s$ and $V_w = SV_v = Se$, so $e = \\dfrac{wG_s}{S}$.
3. $\\gamma_d = \\dfrac{W_s}{V} = \\dfrac{G_s\\gamma_w}{1+e}$
$$\\boxed{\\gamma_d = \\frac{G_s\\gamma_w}{1 + \\dfrac{wG_s}{S}}}$$
- With S = 1 this is the **zero-air-void (saturation) line** of the compaction curve, $\\gamma_{zav} = G_s\\gamma_w/(1 + wG_s)$.
- In terms of air voids: $\\gamma_d = \\dfrac{(1-n_a)G_s\\gamma_w}{1 + wG_s}$.`,
    Fig: FigUnsat,
  },
  {
    id: 't-gsat',
    topic: T,
    q: 'Using a phase diagram, show that for a saturated soil $\\gamma = \\gamma_w(G_s + e)/(1 + e)$.',
    seen: ['2020-21'],
    a: `Saturated: no air, $V_v = V_w$. Take $V_s = 1$:
1. $V_v = V_w = e$, $V = 1 + e$.
2. $W_s = G_s\\gamma_w$ (since $G_s = \\gamma_s/\\gamma_w$ and $\\gamma_s = W_s/V_s$).
3. $W_w = \\gamma_wV_w = e\\gamma_w$.
4. $W = W_s + W_w = (G_s + e)\\gamma_w$.
$$\\boxed{\\gamma_{sat} = \\frac{W}{V} = \\frac{(G_s+e)\\gamma_w}{1+e}}$$
- General (partly saturated): $\\gamma = \\dfrac{(G_s + Se)\\gamma_w}{1+e}$; S = 1 gives the result, S = 0 gives $\\gamma_d$.
- Submerged: $\\gamma' = \\gamma_{sat} - \\gamma_w = \\dfrac{(G_s-1)\\gamma_w}{1+e}$.`,
    Fig: FigSat,
  },
  {
    id: 't-sub',
    topic: T,
    q: 'Derive an expression for the submerged density of a soil in terms of its water content, void ratio, specific gravity and density of water. Define degree of saturation.',
    seen: ['2012-13'],
    a: `**Degree of saturation** $S = V_w/V_v$: the fraction of the void volume filled with water (0 dry, 1 saturated).

**Submerged (buoyant) density.** Below the water table the soil is saturated and each block of solids is buoyed up by the water it displaces.
1. Vs = 1, saturated: $V_v = V_w = e$, $V = 1 + e$.
2. $M_s = G_s\\rho_w$, $M_w = e\\rho_w$ → $\\rho_{sat} = \\dfrac{(G_s + e)\\rho_w}{1+e}$.
3. $\\rho' = \\rho_{sat} - \\rho_w = \\dfrac{(G_s + e) - (1+e)}{1+e}\\rho_w = \\dfrac{(G_s - 1)\\rho_w}{1+e}$.
4. Saturated, so $e = wG$:
$$\\boxed{\\rho' = \\frac{(G-1)\\rho_w}{1+e} = \\frac{(G-1)\\rho_w}{1+wG}}$$
- Typical value: about half of $\\rho_{sat}$ (≈ 0.9–1.1 t/m³). *(γ′ is not on AJK sir's Topic 1 slides; it follows from the same diagram.)*`,
    Fig: FigSat,
  },
  {
    id: 't-sr',
    topic: T,
    q: 'Prove that the degree of saturation of a partially saturated soil is $S_r = \\dfrac{w}{(\\rho_w/\\rho)(1+w) - 1/G_s}$ (ρ bulk density, w moisture content).',
    seen: ['2008-09'],
    a: `Take $V_s = 1$:
1. $M_s = G_s\\rho_w$, $M_w = wG_s\\rho_w$, $M = (1+w)G_s\\rho_w$, $V = 1 + e$.
2. Bulk density $\\rho = \\dfrac{(1+w)G_s\\rho_w}{1+e}$ → $1 + e = \\dfrac{(1+w)G_s\\rho_w}{\\rho}$ → $e = \\dfrac{(1+w)G_s\\rho_w}{\\rho} - 1$.
3. $S_re = wG_s$ (water volume $V_w = S_re = M_w/\\rho_w = wG_s$), so
$$S_r = \\frac{wG_s}{e} = \\frac{wG_s}{\\dfrac{(1+w)G_s\\rho_w}{\\rho} - 1}$$
4. Divide top and bottom by $G_s$:
$$\\boxed{S_r = \\frac{w}{\\dfrac{\\rho_w}{\\rho}(1+w) - \\dfrac{1}{G_s}}}$$
- Check: dry soil (w = 0) → $S_r = 0$; any data giving $S_r > 1$ are impossible.`,
    Fig: FigUnsat,
  },
  {
    id: 't-dr',
    topic: T,
    q: "Define 'relative density' (density index) of a cohesionless soil. How is it used to classify the compactness of a deposit?",
    seen: ['2008-09', '2016-17', '2007-08'],
    a: `**Relative density** expresses the in-situ denseness of a granular soil relative to its loosest and densest laboratory states (slide 21, Das eq. 3.30):
$$D_r = \\frac{e_{\\max} - e}{e_{\\max} - e_{\\min}} \\times 100\\%$$
- $e_{\\max}$: void ratio in the loosest state (dry sand poured into a 2830 cm³ mould, $\\gamma_{d\\min} = W_s/V_m$).
- $e_{\\min}$: densest state (vibrating table under 14 kN/m², $\\gamma_{d\\max} = W_s/V_f$).
- In dry unit weights (slides 22, 27): $D_r = \\dfrac{\\gamma_d - \\gamma_{d\\min}}{\\gamma_{d\\max} - \\gamma_{d\\min}}\\cdot\\dfrac{\\gamma_{d\\max}}{\\gamma_d}$. "Density/unit weight is inversely related to void ratio."

**Compactness** (Das Table 3.3 on slide 28):

- 0–15 % very loose; 15–50 % loose; 50–70 % medium; 70–85 % dense; 85–100 % very dense.
- (Other books and the QBank use 0–15–35–65–85–100. State which scale you use.)

**Use:** a single number for comparing sands of different grading. Dense sands (Dr > 70 %, "good for EQ") have high φ, high bearing capacity and little settlement. Loose saturated sands (low Dr) settle under vibration and can liquefy. Dr is used to specify compaction of granular fills and to correlate with SPT N.`,
  },
  {
    id: 't-sandcone',
    topic: T,
    q: "Explain the 'sand cone method' for determining the field density of soils.",
    seen: ['2023-24', '2021-22'],
    a: `**Sand cone method (ASTM D1556).** Apparatus: a glass/plastic jar of clean uniform **Ottawa sand** of known dry density, a valve and a metal cone, and a base plate with a central hole.

**Calibration** (before going to the field):
1. Dry density of the Ottawa sand, $\\gamma_{d(sand)}$, by filling a container of known volume.
2. Weight of sand that fills the cone alone, $W_c$.

**Field test:**
1. Level the ground, seat the base plate, and dig a hole (≈ 100–150 mm) through the plate hole. Keep **all** the excavated soil in a sealed container; weigh it: $W_2$. Take a sample for water content $w$.
2. Weigh the jar + cone + sand: $W_1$.
3. Invert the jar on the plate, open the valve, let the sand fill the hole and the cone; close the valve.
4. Weigh the jar + cone + remaining sand: $W_4$. Sand used $W_5 = W_1 - W_4$.

**Calculation:**
$$V_{hole} = \\frac{W_5 - W_c}{\\gamma_{d(sand)}},\\qquad W_3 = \\frac{W_2}{1+w},\\qquad \\gamma_d = \\frac{W_3}{V_{hole}},\\qquad \\gamma = \\frac{W_2}{V_{hole}}$$
- Relative compaction $R = \\gamma_{d,field}/\\gamma_{d\\max(Proctor)}$ to check a compacted fill (usually ≥ 95 %).
- The sand must be dry, uniform and free-flowing so its density in the hole equals the calibration value; avoid vibration near the test.`,
  },
  {
    id: 't-gsat-eq',
    topic: T,
    q: 'When is the moist unit weight of a specimen equal to its saturated unit weight? (2023-24 Q1(a) comment)',
    seen: ['2023-24'],
    a: `- $\\gamma = \\dfrac{W_s + W_w}{V}$ and $\\gamma_{sat} = \\dfrac{W_s + \\gamma_wV_v}{V}$. They are equal only when $W_w = \\gamma_wV_v$, i.e. $V_w = V_v$: **S = 100 %, no air** ($V_a = 0$).
- In 2023-24 Q1(a): $V = \\frac{\\pi}{4}(1.5\\times2.54)^2(3\\times2.54) = 86.87$ cm³, $V_s = 160/2.65 = 60.38$ cm³, $V_v = 26.50$ cm³, $V_w = 26.5$ cm³ → S = 100 %, so γ = γsat = 2.147 g/cc. A clay specimen trimmed from below the water table is normally saturated.
- If S < 100 %, γ < γsat: the air voids would have to fill with water first.`,
  },
]
