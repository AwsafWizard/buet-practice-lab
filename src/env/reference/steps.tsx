// Chart pane, methods (m-) items: the class way of doing every recurring CE 331 sum, step by step, with the class's own numbers.
// Sources: "Math procedures as taught" in the three lecture digests (Tanvir sir §1–§16, Rowshan ma'am M1–M12, Snigdha ma'am M1–M8).
import type { FC } from 'react'
import { Md } from '../../components/ui'
import { openEvRef, type EvRefItem } from './pane'

const R = String.raw

/** numbered steps, a worked class example, traps, and buttons to the matching charts */
function Method({ steps, example, traps, see }: { steps: string[]; example?: string; traps?: string[]; see?: [string, string][] }) {
  return (
    <>
      <ol className="list-decimal pl-5 space-y-1 marker:text-accent marker:font-bold">
        {steps.map((s, i) => (
          <li key={i}>
            <Md>{s}</Md>
          </li>
        ))}
      </ol>
      {example && (
        <div className="mt-2 rounded-lg border border-line bg-panel2/60 px-2.5 py-2 text-xs">
          <div className="font-bold text-accent mb-0.5">Class example</div>
          <Md>{example}</Md>
        </div>
      )}
      {traps && traps.length > 0 && (
        <div className="mt-2 text-xs">
          <span className="font-bold text-load">Watch out: </span>
          <Md>{traps.map((t) => '- ' + t).join('\n')}</Md>
        </div>
      )}
      {see && see.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {see.map(([id, label]) => (
            <button key={id} data-ref={id} className="chip !text-[11px] hover:text-ink hover:border-accent/50" onClick={() => openEvRef(id)} title="Open this chart in the pane">
              📈 {label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

const m = (props: Parameters<typeof Method>[0]): FC => () => <Method {...props} />

export const STEP_ITEMS: EvRefItem[] = [
  // ------------------------------------------------------------ Tanvir sir
  {
    id: 'm-alk',
    group: 'steps',
    title: 'Alkalinity species from P and M',
    tag: 'TA §1',
    exam: true,
    keywords: 'titration phenolphthalein methyl orange oh co3 hco3',
    Body: m({
      steps: [
        R`Total alkalinity $= \dfrac{M\ (\text{mL of 0.02 N acid})\times 1000}{\text{sample mL}}$ mg/L as CaCO₃ (1 mL ≡ 1 mg as CaCO₃).`,
        R`Pick the case: P = 0 → all HCO₃⁻; P < M/2 → CO₃²⁻ = 2P, HCO₃⁻ = M − 2P; P = M/2 → all CO₃²⁻; P > M/2 → OH⁻ = 2P − M, CO₃²⁻ = 2(M − P); P = M → all OH⁻.`,
        R`If the pH is ≥ ~10, take OH⁻ from the pH first: $[\text{OH}^-] = 10^{pH-14}$ mol/L × 17 000 mg/mol × 50/17 → mg/L as CaCO₃; convert to mL of acid; then P = OH + ½CO₃, M = OH + CO₃ + HCO₃.`,
        R`Convert each mL figure back to mg/L (× 1000/sample mL) and check the three add up to the total.`,
      ],
      example: R`200 mL, pH 10, P = 11 mL, M = 30 mL. Total = 30×1000/200 = **150**. OH⁻ = 10⁻⁴ mol/L = 5 mg/L as CaCO₃ = 1 mL. P = 11 = 1 + 10 → CO₃ uses 20 mL = **100**; HCO₃ = 30 − 1 − 20 = 9 mL = **45**. 5 + 100 + 45 = 150 ✓.`,
      see: [['c-alk', 'P–M table'], ['c-carb', 'species vs pH']],
    }),
  },
  {
    id: 'm-hard',
    group: 'steps',
    title: 'Hardness split and bar diagram',
    tag: 'TA §2',
    exam: true,
    keywords: 'carbonate non-carbonate total hardness nch bar diagram',
    Body: m({
      steps: [
        R`Convert every ion and CO₂ to mg/L as CaCO₃ (× 50/eq. wt: Ca 2.5, Mg 4.12, Na 2.174, HCO₃ 0.82, Cl 1.41, SO₄ 1.042, CO₂ 2.27).`,
        R`TH = Ca + Mg. Alkalinity = HCO₃⁻ (+ CO₃²⁻ + OH⁻) as CaCO₃.`,
        R`TH > Alk: CH = Alk, NCH = TH − Alk (Ca-NCH = Ca − Alk, rest Mg-NCH). TH ≤ Alk: CH = TH, NCH = 0.`,
        R`Draw the bars to scale: cations Ca → Mg → Na, anions HCO₃ → Cl → SO₄ below, CO₂ left of zero. Mark where HCO₃ ends (CH) and the NCH beyond it.`,
      ],
      example: R`Split sheet: Ca 95.2 → 238, Mg 22 → 90.6, TH 328.6; Alk 198 → CH 198, NCH 130.6 = 40 (Ca) + 90.6 (Mg).`,
      traps: ['The ion analysis rarely balances (cations ≠ anions); draw what is given and say so.', 'Slide typo: "TH > Alk" printed twice — the second case is TH < Alk.'],
      see: [['c-hard', 'bar diagram'], ['c-caco3', 'factors']],
    }),
  },
  {
    id: 'm-henry',
    group: 'steps',
    title: "Henry's law with a small air volume",
    tag: 'TA §3',
    exam: true,
    keywords: 'tce mole fraction air stripping',
    Body: m({
      steps: [
        R`Concentration: $x$ (mol gas/mol water) × 55.6 mol/L × MW × 10⁶ → µg/L.`,
        R`Let X mol move into the air. $H = \dfrac{X/n_{air}}{x - X}$ (both sides as mole fractions), solve for X.`,
        R`Left in water = x − X → convert to µg/L.`,
      ],
      example: R`TCE x = 6.84×10⁻⁸, MW 131.4 → ≈ **500 µg/L**. H = 560, 0.01 mol air: X = 560×6.84×10⁻⁸/(100 + 560) = **5.8×10⁻⁸** mol → **1.04×10⁻⁸** left ≈ **75.7 µg/L**.`,
      see: [['c-henry', "Henry's calculator"]],
    }),
  },
  {
    id: 'm-aer',
    group: 'steps',
    title: 'Aeration time or rate constant',
    tag: 'TA §8',
    exam: true,
    keywords: 'gas transfer kla deficit',
    Body: m({
      steps: [
        R`Write $\ln\dfrac{C_s - C_t}{C_s - C_0} = -K_La\,t$ (or $-Kt$ for a single constant).`,
        R`Tank: $a = A/V$ (interfacial area over volume).`,
        R`Solve for t (or K from one measured point, then t for the target).`,
      ],
      example: R`C₀ 1.5, Cₜ 8.5, Cₛ 9.09, K_L 0.03 m/h, 400 m² × 3 m → a = 0.33 m⁻¹ → t = **258 h ≈ 11 days**. Droplet: K = ln(6/9.2)/(−2) = **0.2137 s⁻¹** → 8.2 mg/L after **10.4 s**.`,
      see: [['c-aer', 'aeration curve']],
    }),
  },
  {
    id: 'm-stokes',
    group: 'steps',
    title: 'Terminal settling velocity (Stokes → iterate)',
    tag: 'TA §4',
    exam: true,
    keywords: 'stokes reynolds drag coefficient sphere',
    Body: m({
      steps: [
        R`Look up ρ and µ of water at the temperature.`,
        R`Assume Stokes: $v = \dfrac{g(\rho_s - \rho_w)d^2}{18\mu}$.`,
        R`Check $Re = \rho v d/\mu$. If Re ≤ 1, done.`,
        R`Else iterate: $C_D = \dfrac{24}{Re} + \dfrac{3}{\sqrt{Re}} + 0.34$, $v = \sqrt{\dfrac{4g(\rho_s-\rho_w)d}{3C_D\rho_w}}$, new Re … until v stops changing.`,
      ],
      example: R`d 0.5 mm, SG 2.65, 20 °C: Stokes 0.224 m/s, Re ≈ 112 ✗ → iterating gives ≈ **0.090 m/s** (Re ≈ 45). The slide prints 0.11 m/s (not reproduced) — write the iteration.`,
      see: [['t-stokes', 'Stokes & drag chart']],
    }),
  },
  {
    id: 'm-type1',
    group: 'steps',
    title: 'Type I settling column (discrete particles)',
    tag: 'TA §5',
    exam: true,
    keywords: 'discrete settling column overflow rate fraction remaining',
    Body: m({
      steps: [
        R`For each sampling time: fraction remaining $x_i = C_i/C_0$ and velocity $v_i = H/t_i$.`,
        R`Overflow rate $v_0 = Q/A$ (convert m/d → m/min: ÷ 1440).`,
        R`Plot x against v; read $x_0$ at $v_0$. Fully removed fraction = $1 - x_0$.`,
        R`Strip the area under the curve up to $x_0$: $\Sigma\,\Delta x\,\bar v$.`,
        R`$R = (1 - x_0) + \dfrac{\Sigma\,\Delta x\,\bar v}{v_0}$.`,
      ],
      example: R`H 1.8 m, C₀ 300, v₀ = 25 m/d = 1.74×10⁻² m/min → x₀ = 0.54, Σ Δx·v̄ = 0.46×10⁻² → R = 0.46 + 0.46/1.74 = **72 %** (class answer; exact H/t velocities give ≈ 70 %).`,
      see: [['t-type1', 'x–v curve']],
    }),
  },
  {
    id: 'm-iso',
    group: 'steps',
    title: 'Type II (flocculent) iso-removal',
    tag: 'TA §6',
    exam: true,
    keywords: 'iso removal flocculent column percent removal',
    Body: m({
      steps: [
        R`Turn each column reading into % removal $= (C_0 - C)/C_0 \times 100$ and write it at its (time, depth).`,
        R`Draw the iso-removal curves (e.g. 40, 50, 60 … %) by interpolating between the points.`,
        R`Draw a vertical at the detention time $t_0$.`,
        R`$r_0$ = the curve that reaches the bottom at $t_0$; between consecutive curves ΔR, with $Z_i$ = depth of the strip's mid-height on the $t_0$ line.`,
        R`$R = r_0 + \Sigma\,\Delta R\,\dfrac{Z_i}{Z_0}$.`,
      ],
      example: R`r₀ = 43 %, ΔR = 7, 10, 10, 10, 10, 10 % at Zᵢ = 2.6, 1.8, 1.2, 0.8, 0.45, 0.15 m, Z₀ = 3 m → Σ ΔR·Zᵢ = 0.61 → R = 0.43 + 0.61/3 = **63 %**.`,
      see: [['t-iso', 'iso-removal chart']],
    }),
  },
  {
    id: 'm-tank',
    group: 'steps',
    title: 'Settling tank sizing',
    tag: 'TA §7',
    keywords: 'surface overflow rate sor detention weir loading',
    Body: m({
      steps: [
        R`Area $A = Q/v_0$; at least 2 units → area each = A/n.`,
        R`Volume = A × depth; detention $t = V/Q = \text{depth}/v_0$.`,
        R`Rectangular L:W = 2:1 to 4:1, W ≤ 12 m, L ≤ 48 m; check weir loading (≤ 6 floc, 14 discrete m³/h·m) and horizontal velocity.`,
        R`Total depth = settling depth + freeboard 0.5 m + sludge zone 0.5 m.`,
      ],
      example: R`Q 15 000 m³/d, v₀ 20 m/d, 3.5 m → A = **750 m²**, t = 3.5/20 d = **4.2 h**; two units 34 m × 11 m.`,
      see: [['t-sor', 'tank criteria']],
    }),
  },
  {
    id: 'm-coag',
    group: 'steps',
    title: 'Alum: alkalinity used and pH with no alkalinity',
    tag: 'TA §9',
    exam: true,
    keywords: 'alum coagulant alkalinity consumed ph naoh',
    Body: m({
      steps: [
        R`Write the reaction: Al₂(SO₄)₃·14H₂O + 6HCO₃⁻ → 2Al(OH)₃ + 3SO₄²⁻ + 6CO₂ + 14H₂O.`,
        R`Alkalinity used = dose × 6×50/594 = **0.505 × dose** mg/L as CaCO₃.`,
        R`No alkalinity: 1 mol alum → 3 mol H₂SO₄ = 6 mol H⁺; pH = −log[H⁺]. Base to neutralise: NaOH = 2 × mol H₂SO₄.`,
      ],
      example: R`Jar test optimum 12 mg/L → 6.1 mg/L alkalinity used. 100 mg/L alum = 0.168 mmol/L → 1.01 mmol/L H⁺ → **pH ≈ 3.0**; NaOH ≈ **40 mg/L**.`,
      traps: ['Slides use 14H₂O (594); class notes once write 18H₂O (666 → 0.45). Say which you use.'],
      see: [['t-coag', 'coagulant table'], ['t-g', 'G and Gt']],
    }),
  },
  {
    id: 'm-lime',
    group: 'steps',
    title: 'Lime–soda softening doses',
    tag: 'TA §10',
    exam: true,
    keywords: 'lime soda ash softening excess lime cao',
    Body: m({
      steps: [
        R`Everything in mg/L as CaCO₃: CO₂, Alk (CH), Ca, Mg, TH, NCH.`,
        R`Selective Ca removal (Mg ≤ 40 kept): Lime = CO₂ + Alk; Soda = Ca − Alk (only if that NCH must go).`,
        R`Ca + Mg removal: Lime = CO₂ + Alk + Mg (+ excess 20, or 40 if Mg > 40 — he leaves it out in the split sheet); Soda = NCH.`,
        R`Practical limits after softening: Ca 30 + Mg 10 = **40**. CO₂ > 10 mg/L (22.7 as CaCO₃) → strip it by aeration instead of lime.`,
        R`Masses: CaO = dose × 56/100 ÷ purity; Ca(OH)₂ × 74/100; Na₂CO₃ × 106/100.`,
      ],
      example: R`CO₂ 15, HCO₃ 164, Ca 200, Mg 35 → selective lime = 15 + 164 = **179** → CaO (90 %) = 179 × 0.56/0.9 ≈ **111 mg/L**. Problem 2: lime = 21.8 + 198 + 55.6 = **275.4**, soda = 40 + 55.6 = **95.6**.`,
      see: [['t-lime', 'additions table'], ['c-hard', 'bar diagram']],
    }),
  },
  {
    id: 'm-split',
    group: 'steps',
    title: 'Split treatment',
    tag: 'TA §11',
    exam: true,
    keywords: 'split treatment bypass magnesium',
    Body: m({
      steps: [
        R`Doses for 100 % treatment with Ca + Mg removal (lime₁, soda₁).`,
        R`Bypass $X = \dfrac{Mg_f - Mg_i}{Mg_r - Mg_i}$ with $Mg_f$ = 40, $Mg_i$ = 10, $Mg_r$ = raw Mg (as CaCO₃).`,
        R`Blend hardness = X·(raw TH) + (1 − X)·40. Within 80–120? Else add a second stage (selective Ca removal of the blend).`,
        R`Whole-flow doses = (1 − X)·lime₁ (+ second stage); convert to masses with purity.`,
      ],
      example: R`Mg_r 90.6 → X = (40 − 10)/(90.6 − 10) = **0.372**, treated 0.628; lime 267.4, soda 82; blend 147.4 > 120 → second stage needed (lime₂ 210.5, soda 0).`,
      see: [['t-split', 'split flow sheet']],
    }),
  },
  {
    id: 'm-ix',
    group: 'steps',
    title: 'Ion exchange: bypass, run length, salt',
    tag: 'TA §12',
    exam: true,
    keywords: 'ion exchange resin capacity regeneration bypass breakthrough',
    Body: m({
      steps: [
        R`Bypass fraction = desired hardness / raw hardness (the resin gives ~0 hardness).`,
        R`Treated flow = (1 − bypass) × Q; hardness load = treated flow × raw hardness (kg/d).`,
        R`Run length = resin volume × capacity ÷ load.`,
        R`Fixed bed: A = Q/loading rate, V = A × depth. Salt = regeneration level × V; brine = salt ÷ strength.`,
      ],
      example: R`0.1 m³ resin, 57 kg/m³, 2000 L/d, 280 → 85 mg/L: bypass **30 %**, load 0.392 kg/d → **14.5 days**.`,
      see: [['t-ix', 'breakthrough curve']],
    }),
  },
  {
    id: 'm-chick',
    group: 'steps',
    title: 'Chick–Watson rate constant',
    tag: 'TA §14',
    exam: true,
    keywords: 'disinfection kill ct chlorine contact time',
    Body: m({
      steps: [
        R`Compute $\ln(N/N_0)$ for each time and $C\cdot t$.`,
        R`Plot $-\ln(N/N_0)$ against $C\,t$ (n = 1); slope through the origin = k (L/mg·s).`,
        R`For another concentration: $C^n t$ = constant for the same kill.`,
      ],
      example: R`N₀ 6152, C 1.8 mg/L, t = 2…8 s → slope **0.208 L/mg·s**.`,
      see: [['t-chick', 'Chick–Watson plot'], ['t-bp', 'breakpoint curve']],
    }),
  },
  // ------------------------------------------------------------ Rowshan ma'am
  {
    id: 'm-rwh',
    group: 'steps',
    title: 'RWH tank: demand side and supply side',
    tag: 'RM M1–M3',
    exam: true,
    keywords: 'rainwater harvesting tank mass curve runoff catchment',
    Body: m({
      steps: [
        R`**Demand side:** V = users × dry days × lpcd; + 10 % freeboard. (BNBC: 90 days potable, 210 days other uses.)`,
        R`**Supply side:** monthly harvest = A × rain (m) × C. Daily demand vs annual harvest/365; if demand is more, use the available amount as a constant monthly draw.`,
        R`Start the table at the first dry month (October); cumulative harvest, cumulative demand, difference.`,
        R`Tank = **largest** difference.`,
        R`Catchment: flat roof plan area + 50 % of the adjoining wall; inclined roof = full sloping area.`,
      ],
      example: R`6 users × 100 d × 10 L = 6000 L + 600 = **6.6 m³**. Supply side: 190 m² × 1.056 m × 0.9 = 180.58 m³/yr = 15.05 m³/month < 21.75 demand → tank **50.45 m³** (April).`,
      see: [['r-runoff', 'runoff coefficients'], ['r-rwhmass', 'mass curve']],
    }),
  },
  {
    id: 'm-pump',
    group: 'steps',
    title: 'Pump head and power',
    tag: 'RM M4–M5',
    exam: true,
    keywords: 'pump total head brake horsepower whp efficiency friction',
    Body: m({
      steps: [
        R`Q to cfs (British gallon: × 0.16/60) or m³/s.`,
        R`Pipe: A = Q/v, $d = \sqrt{4A/\pi}$ (or v = Q/A for a given d).`,
        R`$h_f = \dfrac{f L v^2}{2 g d}$ (her form: no 4), $h_v = v^2/2g$, minor $h_m = \Sigma K\,v^2/2g$.`,
        R`H = static + h_f + h_v (+ h_m). Static = delivery level − suction level.`,
        R`WHP = H·Q(gpm)/3960, BHP = WHP/η; SI: P = γQH (kW with γ = 9.81 kN/m³), input = P/η.`,
      ],
      example: R`From demand: Q = gpcd × population / (pumping hours × 60) gpm. Example 1: 7200 gpm → 19.2 cfs (slide 19.26).`,
      traps: ['Constant 3960 is for US gallons; her slide uses it with British gallons — follow the slide.'],
      see: [['r-head', 'head & power'], ['r-units', 'unit converter'], ['r-curves', 'pump vs system']],
    }),
  },
  {
    id: 'm-npsh',
    group: 'steps',
    title: 'NPSH check and operating point',
    tag: 'RM M6–M7',
    keywords: 'cavitation npsh available required system curve operating point parallel series',
    Body: m({
      steps: [
        R`$NPSH_A = H_{abs} + H_s - h_L - H_{vp}$ (H_s + for flooded suction, − for lift).`,
        R`Need $NPSH_A \ge NPSH_R$ + ~1 m. If not: raise the sump level, lower the pump, enlarge the suction pipe, or change pump.`,
        R`Operating point: system curve $H = H_{st} + (fL/D + \Sigma K)\,v^2/2g$ against the pump H–Q curve; read the crossing.`,
        R`Two pumps: parallel → add Q at the same H; series → add H at the same Q.`,
      ],
      see: [['r-npsh', 'NPSH'], ['r-curves', 'curves']],
    }),
  },
  {
    id: 'm-wsp',
    group: 'steps',
    title: 'WSP risk scoring',
    tag: 'RM M12',
    exam: true,
    keywords: 'water safety plan likelihood severity risk matrix',
    Body: m({
      steps: [
        R`List the hazard and hazardous event at each step (catchment → treatment → distribution → household).`,
        R`Raw risk with no controls = likelihood (1–5) × severity (1–5).`,
        R`Bands: **Low ≤ 5, Medium 6–14, High ≥ 15**.`,
        R`Validate the existing controls, re-score the residual risk; plan improvements for anything still Medium/High.`,
      ],
      example: R`5 × 4 = **20 High** → after control 1 × 4 = **4 Low**.`,
      see: [['r-wsp', 'risk matrix']],
    }),
  },
  // ------------------------------------------------------------ Snigdha ma'am
  {
    id: 'm-demand',
    group: 'steps',
    title: 'Total demand and peak demand',
    tag: 'SN M1',
    exam: true,
    keywords: 'per capita lpcd bnbc peak factor time factor fire',
    Body: m({
      steps: [
        R`Pick the BNBC lpcd for each area/income group (full or restricted facility).`,
        R`Q = P × Σ(fraction × lpcd); future: use the projected P.`,
        R`Hourly average = ADC/24; peak = PF × ADC/24 (residential 2.5, industrial 1.4, commercial/institution 4, fire 1).`,
        R`Non-residential with no reservoir: × time factor 24/hours of use. **With a reservoir: no time factor.**`,
        R`Source, raw main, WTP → peak daily; distribution → peak hourly.`,
      ],
      example: R`P 125 000: 125 000[0.05×260 + 0.10×200 + 0.25×135 + 0.30×120 + 0.15×80 + 0.15×50] = **15.3 MLD**; high income 27 %, low 16 %.`,
      see: [['s-lpcd', 'BNBC lpcd'], ['s-peak', 'peak factors'], ['s-fire', 'fire demand']],
    }),
  },
  {
    id: 'm-pop',
    group: 'steps',
    title: 'Population forecast, each method',
    tag: 'SN M2',
    exam: true,
    keywords: 'arithmetic geometric exponential decreasing rate ratio forecast',
    Body: m({
      steps: [
        R`**Arithmetic:** average of the decade increases per year → $P = P_n + K\,n$.`,
        R`**Uniform % (exponential):** $K = \ln(P_2/P_1)/\Delta t$ per decade, average → $P = P_n e^{Kn}$.`,
        R`**Geometric:** $r = (P_{last}/P_{first})^{1/t} - 1$ (skip the middle data) → $P = P_n(1 + r)^n$.`,
        R`**Decreasing rate:** decade growth % → decreases s (an increase counts as a negative decrease) → average s → next r = last r − s̄ → step one decade at a time.`,
        R`**Ratio:** local/national in the base year × projected national.`,
      ],
      example: R`72, 79, 89, 97, 120 thousand (1980–2020): arithmetic 1200/yr → 2030 **132 000**; exponential K 0.01277 → **136 346**; geometric r 0.01285 → **136 342**, 2040 **154 912**.`,
      traps: ['Her notes average the per-decade r (0.01287 → 136 370); the slide uses end-to-end r (0.01285). Show both if unsure.'],
      see: [['s-pop', 'methods chart']],
    }),
  },
  {
    id: 'm-well',
    group: 'steps',
    title: 'Well yield, K from observation wells, interference',
    tag: 'SN M3',
    exam: true,
    keywords: 'dupuit thiem confined unconfined drawdown specific capacity interference',
    Body: m({
      steps: [
        R`Radius r = diameter/2 in m; D = static depth of water, d = D − drawdown (h for observation wells).`,
        R`Unconfined: $Q = \dfrac{\pi K (D^2 - d^2)}{\ln(R/r)}$. Confined: $Q = \dfrac{2\pi K b (D - d)}{\ln(R/r)}$.`,
        R`K from two observation wells: unconfined $K = \dfrac{Q\ln(r_2/r_1)}{\pi(h_2^2 - h_1^2)}$, confined $K = \dfrac{Q\ln(r_2/r_1)}{2\pi b(h_2 - h_1)}$.`,
        R`Two wells a apart: replace ln(R/r) by $\ln\!\big(R^2/(r\,a)\big)$ — use π (not 2π) for unconfined.`,
        R`Specific capacity = Q / drawdown.`,
      ],
      example: R`D 35, d 33, R 30, r 0.05, K 0.51 L/s/m² → **34.1 L/s**, 17.03 L/s per m. Interference: K 3.52, R ≈ 290 m → **1058.5 L/min** each.`,
      see: [['s-thiem', 'well formulas & cone'], ['s-darcy', 'aquifer terms']],
    }),
  },
  {
    id: 'm-dtw',
    group: 'steps',
    title: 'Deep tubewell design sequence',
    tag: 'SN M4',
    exam: true,
    keywords: 'dtw strainer screen slot gravel pack housing pipe yield well log',
    Body: m({
      steps: [
        R`Gradation curve → D10, D30, D60, Cu = D60/D10, FM = Σ cum. % retained (#4, 8, 16, 30, 50, 100)/100.`,
        R`Reject layers with FM < 1 or Cu > 2.5; the good zone starts below the housing pipe.`,
        R`Housing pipe = SWL + decline × design life + drawdown + safety (e.g. 200 + 2×20 + 15 + 15 = 270 ft). ID = pump bowl OD + 2 in.`,
        R`Strainer: available thickness × 70/75/80 % (< 25 / 25–50 / > 50 ft), max 100 ft, 10 ft clearance from layer boundaries; sand trap 10 ft.`,
        R`Gravel pack on the finest layer: f = 4 (Cu ≤ 1.5) to 6 (Cu ≥ 2.5); D30 pack = f × D30; thickness 3–8 in; borehole = strainer + 2 × thickness.`,
        R`Slot = D10(pack) mm / 25.4 × 1000 → round **down** to #20/#30/#40. Open area: steel 10/15/20 %, uPVC half.`,
        R`Yield $Q = \eta\,\pi D L V_c / F_B$ (ft, V_c 0.1 ft/s, F_B 3 default) → cfs × 0.3048³ × 1000 × 3600 L/h; × pumping hours; wells = demand/yield.`,
        R`Draw the well log (housing, blind pipe, pack, strainer, sand trap, seal).`,
      ],
      example: R`Example-1: housing 270 ft, strainer 440–540 ft, pack D30 = 0.25 × 5 = 1.25 mm, slot 33.5 → **#30**, Q = 0.15π(0.5)(100)(0.1)/2.5 = **0.942 cfs ≈ 96 000 L/h**.`,
      see: [['s-grad', 'gradation curve'], ['s-pack', 'pack factor'], ['s-slot', 'slot table'], ['s-dtw', 'DTW rules']],
    }),
  },
  {
    id: 'm-branch',
    group: 'steps',
    title: 'Dead-end (branched) network design',
    tag: 'SN M6',
    exam: true,
    keywords: 'branch dead end pipe diameter terminal pressure psi',
    Body: m({
      steps: [
        R`Node demands (× peak factor, × losses if asked); pipe flow = sum of every downstream demand.`,
        R`$D = 2\sqrt{Q/(\pi V)}$ with V = 3 fps (1 m/s); round **up** to a commercial size; not below the minimum.`,
        R`$h_f = \dfrac{4 f L v^2}{2 g D}$, f = 0.01 (her form has the 4); ft → psi × 62.4/144.`,
        R`Pressure at source (90 ft → 39 psi) − Σ h_f along each path ≥ **30 psi** at every end; else enlarge pipes.`,
      ],
      example: R`1-2 35 957 lph → 4.64 in → **5 in**, 2.24 psi; end 4 = 39 − 2.24 − 2.51 − 2.83 = **31.42 psi** ≥ 30 ✓.`,
      see: [['s-branch', 'branch calculator'], ['s-hw', 'H–W chart']],
    }),
  },
  {
    id: 'm-hc',
    group: 'steps',
    title: 'Hardy Cross (looped network)',
    tag: 'SN M7',
    exam: true,
    keywords: 'hardy cross loop correction iteration',
    Body: m({
      steps: [
        R`Assume flows that satisfy continuity at every node; clockwise = +.`,
        R`Each pipe: $H = kQ|Q|^{0.85}$ (k = 1 if not given) and $|H/Q|$.`,
        R`Loop correction $\Delta = -\dfrac{\Sigma H}{1.85\,\Sigma|H/Q|}$; add Δ to every pipe of the loop.`,
        R`A common pipe gets its own loop's Δ minus the other loop's Δ.`,
        R`Repeat until Δ is small; size pipes from the head-loss chart (H–W, C = 130, S = 0.005).`,
      ],
      example: R`Trial 1: loop I ΣH 72.82, Σ|H/Q| 31.42 → Δ₁ = **−1.25**; loop II → Δ₂ = **−1.79**. After 3 trials 1-2 = 11.39 lps, 6-1 = 13.61 lps.`,
      see: [['s-hw', 'H–W chart']],
    }),
  },
  {
    id: 'm-res',
    group: 'steps',
    title: 'Service reservoir size',
    tag: 'SN M5',
    exam: true,
    keywords: 'balancing storage emergency reservoir elevated tank mass diagram',
    Body: m({
      steps: [
        R`Daily demand = P × lpcd; pumping hours = daily / pump rate (round up).`,
        R`Hour by hour: cumulative storage = previous + supply − demand (start empty).`,
        R`Balancing storage = maximum cumulative storage.`,
        R`Emergency = 1.5 × average hourly (1.5–2); total = balancing + emergency. Fire storage is a separate ground tank.`,
        R`Pick D, depth = V/A, + freeboard 0.3 m.`,
      ],
      example: R`12 425 × 120 = 1 491 000 L/d; balancing 256 000 L + emergency 93 188 L ≈ **350 m³**; D 8 m → depth **7 m** (+ 0.3 m).`,
      see: [['s-store', 'mass diagram']],
    }),
  },
]
