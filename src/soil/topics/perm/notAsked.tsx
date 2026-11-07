// Practice problems on lecture topics never asked in the 13 past papers: a field pumping test (unconfined and confined),
// and the factors affecting k with Hazen's estimate and the temperature correction to 20 °C.
import { fmt } from '../../../components/DiagramView'
import { Md } from '../../../components/ui'
import { hazen, kAtTemp, kBand, pumpConfined, pumpUnconfined, viscosity } from '../../engine/permeability'
import type { SmQ } from '../../types'
import { PumpFig, sciTex, type PumpState } from './Labs'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'
const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)

// (a) unconfined: original water table 14 m above the impermeable base; drawdowns 2.1 m and 0.8 m
const UN: PumpState = { kind: 'unconf', q: 0.02, r1: 15, r2: 60, h1: 14 - 2.1, h2: 14 - 0.8, T: 0 }
// (b) confined aquifer 8 m thick; piezometric heads measured above its base
const CO: PumpState = { kind: 'conf', q: 0.015, r1: 10, r2: 40, h1: 22.4, h2: 23.6, T: 8 }
const kU = () => pumpUnconfined(UN)
const kC = () => pumpConfined(CO)

// Hazen and temperature
const HZ = { D10: 0.18, C: 100, kT: 2.6e-2, T: 28 } // kT as printed in the text: 2.6 × 10⁻² cm/s
const k20 = () => kAtTemp(HZ.kT, HZ.T, 20)

export const PERM_NEW: SmQ[] = [
  {
    id: 'sm-own-perm-new1',
    paper: 'own',
    level: 'exam',
    sec: 'B',
    no: 'N1',
    marks: 0,
    topics: ['sm-perm'],
    title: 'Field pumping tests: unconfined and confined aquifer · not asked yet',
    text: `*${NOT_ASKED}*

(a) A well fully penetrates a 14 m thick unconfined sand aquifer resting on an impermeable clay; the static water table is at the top of the sand. Pumping at a steady ${UN.q} m³/s lowers the water level in two observation wells ${UN.r1} m and ${UN.r2} m from the pumping well by 2.1 m and 0.8 m respectively. Find k.

(b) Another well fully penetrates a confined sand aquifer ${CO.T} m thick lying between two clay layers. At a steady discharge of ${CO.q} m³/s, the piezometric levels in observation wells ${CO.r1} m and ${CO.r2} m away stand ${CO.h1} m and ${CO.h2} m above the base of the aquifer. Find k and the transmissivity of the aquifer.

(c) Why is a pumping test preferred to laboratory tests for the k of a sand deposit?`,
    pages: [],
    figure: () => <PumpFig s={UN} k={kU()} />,
    checks: () => [
      { key: 'ku', label: '(a) k, unconfined', value: kU(), unit: 'm/s' },
      { key: 'kc', label: '(b) k, confined', value: kC(), unit: 'm/s' },
      { key: 'T', label: '(b) transmissivity kb', value: kC() * CO.T, unit: 'm²/s' },
    ],
    solution: () => {
      const ku = kU()
      const kc = kC()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**(a) Unconfined (Dupuit).** Measure h from the impermeable base: $h_1 = 14 - 2.1 = ${f2(UN.h1)}$ m at $r_1 = ${UN.r1}$ m, $h_2 = 14 - 0.8 = ${f2(UN.h2)}$ m at $r_2 = ${UN.r2}$ m. Flow through a cylinder of radius r and height h: $q = k\\,\\dfrac{dh}{dr}\\,2\\pi rh$; integrating between the wells,
$$k = \\frac{q\\ln(r_2/r_1)}{\\pi(h_2^2 - h_1^2)} = \\frac{${UN.q}\\ln(${UN.r2}/${UN.r1})}{\\pi(${f2(UN.h2)}^2 - ${f2(UN.h1)}^2)} = ${sciTex(ku, 3)}\\ \\text{m/s} = ${sciTex(ku * 100, 3)}\\ \\text{cm/s}$$
— ${kBand(ku * 100).toLowerCase()}.`}</Md>
          <PumpFig s={UN} k={ku} />
          <Md>{`**(b) Confined.** The flow area is the full aquifer thickness at every radius, $2\\pi rT$, so $q = k\\,\\dfrac{dh}{dr}\\,2\\pi rT$:
$$k = \\frac{q\\ln(r_2/r_1)}{2\\pi T(h_2 - h_1)} = \\frac{${CO.q}\\ln(${CO.r2}/${CO.r1})}{2\\pi(${CO.T})(${CO.h2} - ${CO.h1})} = ${sciTex(kc, 3)}\\ \\text{m/s}$$
Transmissivity $T_r = kb = ${sciTex(kc, 3)} \\times ${CO.T} = ${sciTex(kc * CO.T, 3)}$ m²/s (= ${f2(kc * CO.T * 86400)} m²/day).`}</Md>
          <PumpFig s={CO} k={kc} />
          <Md>{`**(c)** A pumping test draws water from a large volume of the undisturbed deposit at its natural density, layering and fissures, so it gives the average in-situ k (mostly horizontal). Sand cannot be sampled undisturbed, a small lab specimen misses the layers and lenses ($k_h \\gg k_v$ in the field), and trapped air, fines migration and side leakage distort lab results.`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'Water levels are always measured from the impermeable base (unconfined) or the aquifer base (confined), not from the ground surface — convert drawdowns first.'],
  },
  {
    id: 'sm-own-perm-new2',
    paper: 'own',
    level: 'warm-up',
    sec: 'B',
    no: 'N2',
    marks: 0,
    topics: ['sm-perm'],
    title: "Factors affecting k, Hazen's estimate and the 20 °C correction · not asked yet",
    text: `*${NOT_ASKED}*

(a) List the factors that affect the coefficient of permeability of a soil, and state how each acts.

(b) A clean, uniform filter sand has an effective size D₁₀ = ${HZ.D10} mm. Estimate k by Hazen's formula (C = ${HZ.C}).

(c) A constant-head test on the same sand, run with water at ${HZ.T} °C, gave k = 2.6 × 10⁻² cm/s. Report k at the standard temperature of 20 °C (η₂₀ = ${f3(viscosity(20))} mPa·s, η${HZ.T} = ${f3(viscosity(HZ.T))} mPa·s) and compare it with (b).`,
    pages: [],
    checks: () => [
      { key: 'hz', label: '(b) k by Hazen', value: hazen(HZ.D10, HZ.C), unit: 'cm/s' },
      { key: 'k20', label: '(c) k₂₀', value: k20(), unit: 'cm/s' },
      { key: 'r', label: '(c) η₂₈/η₂₀', value: viscosity(HZ.T) / viscosity(20) },
    ],
    solution: () => {
      const kh = hazen(HZ.D10, HZ.C)
      const k = k20()
      return (
        <div className="space-y-2 text-sm">
          <Md>{`**(a) Factors affecting k.** From the Kozeny–Carman form $k = C\\,\\dfrac{\\gamma_w}{\\eta}\\,\\dfrac{e^3}{1 + e}\\,D^2$:
- **Grain size** — k varies roughly with the square of the effective size $D_{10}$ (the finest 10 % control the pore channels).
- **Void ratio / density** — looser soil (larger e) has larger channels; k rises steeply with e.
- **Grading and shape** — well-graded soils fill voids with fines and have lower k; angular, flaky grains give tortuous paths.
- **Properties of the fluid** — $k \\propto \\gamma_w/\\eta$: warm water is less viscous, so k is higher; k is reported at 20 °C.
- **Degree of saturation** — trapped air blocks pores, so k of a partly saturated soil is lower.
- **Soil structure and fabric** — flocculated clay has higher k than dispersed clay at the same e; stratification makes $k_h \\gg k_v$.
- **Clay mineral and adsorbed water** — montmorillonite's thick double layers leave little free pore space; cations and pore-fluid chemistry change the double layer.
- **Fissures, root holes and macro-pores** in the field can raise k by orders of magnitude.`}</Md>
          <Md>{`**(b) Hazen** (clean uniform sand):
$$k = C D_{10}^2 = ${HZ.C} \\times (${HZ.D10 / 10}\\ \\text{cm})^2 = ${sciTex(kh, 3)}\\ \\text{cm/s}$$
`}</Md>
          <Md>{`**(c) Temperature.** k is proportional to $\\gamma_w/\\eta$ and γw hardly changes, so
$$k_{20} = k_T\\,\\frac{\\eta_T}{\\eta_{20}} = ${sciTex(HZ.kT, 2)} \\times \\frac{${f3(viscosity(HZ.T))}}{${f3(viscosity(20))}} = ${sciTex(k, 3)}\\ \\text{cm/s}$$
Warm water flowed more easily, so the 20 °C value is ${f2((1 - k / HZ.kT) * 100)} % lower. Hazen gave $${sciTex(kh, 2)}$ cm/s, ${f2(kh / k)} times the corrected test value — within the accuracy expected of an empirical formula (C ranges 100–150 and the formula ignores density).`}</Md>
        </div>
      )
    },
    notes: [NOT_ASKED, 'Viscosity of water interpolated linearly between tabulated values (27 °C 0.852, 30 °C 0.798, 20 °C 1.002 mPa·s); the paper would print the two values it wants used.'],
  },
]
