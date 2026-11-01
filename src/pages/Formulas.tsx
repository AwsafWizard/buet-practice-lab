import { Md, Section, Tex } from '../components/ui'
import { SOIL, SYSTEMS, type SiteClass } from '../engine/eq'
import { KLL } from '../engine/llr'
import { PRODUCT_TABLE } from '../engine/vw'
import { KZT_PARAMS, LAMBDA_TABLE, TERRAIN, type Exposure } from '../engine/wind'

declare const __ARTIFACT__: boolean
const CAN_PRINT = typeof __ARTIFACT__ === 'undefined' || !__ARTIFACT__

export default function Formulas() {
  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Formulas & tables</h1>
          <p className="text-sm text-mute">Everything on one page for the last two days.{CAN_PRINT && ' Print it (Ctrl + P) — the sidebar hides automatically.'}</p>
        </div>
        {CAN_PRINT && (
          <button className="btn no-print" onClick={() => window.print()}>
            🖨 Print
          </button>
        )}
      </div>

      <div className="grid cq-lg:grid-cols-2 gap-5">
        <Section title="Stability & determinacy">
          <Tex block>{`\\text{2D truss: } b + r - 2j,\\quad \\text{2D frame: } 3m + r - (3j + c),\\quad \\text{3D: } b + r - 3j,\\ 6m + r - (6j + c)`}</Tex>
          <Md>{`< 0 unstable · = 0 determinate · > 0 indeterminate (if stable). Parallel or concurrent reactions, non-triangulated panels → geometrically unstable. DOKI = free joint DOF − restraints + extra hinge rotations.`}</Md>
        </Section>

        <Section title="Influence lines (simple span L, section at a)">
          <Md>{`- $R_A$: 1 → 0; $V_a$: −a/L | +(L−a)/L; $M_a$: peak $a(L-a)/L$.
- Max = $w\\cdot$(area of matching sign) + $P\\cdot y_{max}$ + $w_d\\cdot$(net area).
- Müller-Breslau: release → unit displacement → deflected shape = ILD.
- Floor beams / trusses: straight between panel points.`}</Md>
        </Section>

        <Section title="Wheel loads">
          <Md>{`- Max M at a section: $W_L/a \\approx W/L$ (a wheel at the section).
- Max V at a section: lead wheel just right; $\\Delta V = Wd/L - P_{passed}$ > 0 → keep moving.
- Max reaction: $\\Delta R = Wd/L - P_{leaving}$.
- Absolute max M: centreline bisects the critical wheel and the resultant: $M = \\tfrac{R}{L}(\\tfrac L2 - \\tfrac e2)^2 - M_{left}$.`}</Md>
        </Section>

        <Section title="Approximate frame analysis">
          <Md>{`- **Portal**: inflection at mid-height of columns & mid-span of beams; interior column shear = 2 × exterior.
- **Cantilever**: same inflections; $N_j = M A_jd_j/\\sum Ad^2$.
- **Vertical (0.1L)**: $M_{end} = -0.045wL^2$, $M_{mid} = 0.08wL^2$, $V = 0.5wL$.
- **X-braced truss**: T & C → half panel shear each; slender → tension diagonal takes it all.`}</Md>
        </Section>

        <Section title="Virtual work">
          <Tex block>{`\\Delta = \\sum\\int\\frac{Mm}{EI}dx + \\sum\\frac{NnL}{AE} + \\sum\\int\\frac{KVv}{GA}dx + \\sum n\\Delta L - \\sum r\\Delta_s`}</Tex>
          <table className="tbl">
            <thead>
              <tr>
                <th>M shape</th>
                <th>m shape</th>
                <th>∫ M m dx</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_TABLE.map((r, i) => (
                <tr key={i}>
                  <td className="txt">{r.m}</td>
                  <td className="txt">{r.mp}</td>
                  <td className="txt">{r.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-faint">EI (k-ft²) = E(ksi)·I(in⁴)/144; G = E/2(1+ν); K = 1.2 rectangle.</p>
        </Section>

        <Section title="Cables & arches">
          <Tex block>{`Hy = M_{beam},\\quad H = \\frac{wL^2}{8h},\\quad T_{max} = \\sqrt{H^2+V^2},\\quad S \\approx L\\left(1 + \\tfrac83n^2 - \\tfrac{32}{5}n^4\\right)`}</Tex>
          <Tex block>{`\\text{girder: } M = M_0 - Hy,\\ q = \\frac{8Hh}{L^2};\\quad \\text{arch: } N = V\\sin\\theta + H\\cos\\theta,\\ Q = V\\cos\\theta - H\\sin\\theta`}</Tex>
        </Section>

        <Section title="Live loads (BNBC 2020)">
          <Tex block>{`L = L_0\\left(0.25 + \\frac{4.57}{\\sqrt{K_{LL}A_T}}\\right),\\ K_{LL}A_T \\ge 37.16;\\ L \\ge 0.5L_0\\ (1\\text{ floor}),\\ 0.4L_0\\ (\\ge 2)`}</Tex>
          <table className="tbl">
            <tbody>
              {KLL.map((k) => (
                <tr key={k.element}>
                  <td className="txt">{k.element}</td>
                  <td>{k.K}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Tex block>{`L_r = L_0R_1R_2,\\ 0.6 \\le L_r \\le 1.0;\\ R_1 = 1.2 - 0.011A_t,\\ R_2 = 1.2 - 0.05F`}</Tex>
        </Section>

        <Section title="Earthquake (BNBC 2020)">
          <Tex block>{`S_a = \\tfrac23\\tfrac{ZI}{R}C_s \\ge 0.67\\beta ZIS,\\ V = S_aW,\\ F_x = V\\frac{w_xh_x^k}{\\sum w_ih_i^k},\\ T = C_th_n^m`}</Tex>
          <Md>{`Z = 0.12 / 0.20 / 0.28 / 0.36 · I = 1.0 (I, II), 1.25 (III), 1.5 (IV) · W = DL + 25 % LL · k = 1 (T ≤ 0.5), 2 (T ≥ 2.5) · RC MRF $C_t = 0.0466, m = 0.9$; steel 0.0724, 0.8.`}</Md>
          <table className="tbl">
            <thead>
              <tr>
                <th>Site</th>
                <th>S</th>
                <th>T_B</th>
                <th>T_C</th>
                <th>T_D</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(SOIL) as SiteClass[]).map((k) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{SOIL[k].S}</td>
                  <td>{SOIL[k].TB}</td>
                  <td>{SOIL[k].TC}</td>
                  <td>{SOIL[k].TD}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="tbl mt-2">
            <thead>
              <tr>
                <th>System</th>
                <th>R</th>
                <th>Ω₀</th>
                <th>C_d</th>
                <th>B/C/D</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SYSTEMS).map((s) => (
                <tr key={s.name}>
                  <td className="txt">{s.name}</td>
                  <td>{s.R}</td>
                  <td>{s.Omega}</td>
                  <td>{s.Cd}</td>
                  <td>
                    {s.limit.B}/{s.limit.C}/{s.limit.D}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Md>{`SDC (Occ I–III, zones 1–4): SA B C C D · SB/SC B C D D · SD C D D D · SE D. Occ IV: SA–SC C D D D · SD/SE D.`}</Md>
        </Section>

        <Section title="Wind (BNBC 2020)">
          <Tex block>{`q_z = 0.000613K_zK_{zt}K_dV^2I,\\ K_z = 2.01(z/z_g)^{2/\\alpha},\\ p = qGC_p - q_i(GC_{pi}),\\ p_s = \\lambda K_{zt}Ip_{s30}`}</Tex>
          <table className="tbl">
            <thead>
              <tr>
                <th>Exp</th>
                <th>α</th>
                <th>z_g</th>
                <th>ĉ</th>
                <th>l</th>
                <th>ε̄</th>
                <th>z_min</th>
                <th>b̄, ᾱ</th>
              </tr>
            </thead>
            <tbody>
              {(['A', 'B', 'C'] as Exposure[]).map((e) => (
                <tr key={e}>
                  <td>{e}</td>
                  <td>{TERRAIN[e].alpha}</td>
                  <td>{TERRAIN[e].zg}</td>
                  <td>{TERRAIN[e].c}</td>
                  <td>{TERRAIN[e].l}</td>
                  <td>{(1 / TERRAIN[e].ebar).toFixed(0) === '0' ? '' : `1/${(1 / TERRAIN[e].ebar).toFixed(1)}`}</td>
                  <td>{TERRAIN[e].zmin}</td>
                  <td>
                    {TERRAIN[e].bbar}, 1/{(1 / TERRAIN[e].abar).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="tbl mt-2">
            <thead>
              <tr>
                <th>Kzt shape</th>
                <th>K₁/(H/L_h) A/B/C</th>
                <th>γ</th>
                <th>μ up / down</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(KZT_PARAMS).map((k) => (
                <tr key={k.name}>
                  <td className="txt">{k.name}</td>
                  <td>
                    {k.K1.A} / {k.K1.B} / {k.K1.C}
                  </td>
                  <td>{k.gamma}</td>
                  <td>
                    {k.muUp} / {k.muDown}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Md>{`$K_{zt} = (1+K_1K_2K_3)^2$, $K_2 = 1 - |x|/\\mu L_h$, $K_3 = e^{-\\gamma z/L_h}$; H/L_h > 0.5 → 0.5 and L_h = 2H. C_p: windward 0.8, leeward −0.5/−0.3/−0.2 (L/B ≤ 1/2/≥ 4), side −0.7. GC_pi: 0 / ±0.55 / ±0.18. Parapet GC_pn +1.5 / −1.0. I: 0.87 (0.77), 1.0, 1.15, 1.15. K_d = 0.85. G rigid 0.85.`}</Md>
          <table className="tbl mt-2">
            <thead>
              <tr>
                <th>λ: h (m)</th>
                {LAMBDA_TABLE.map((r) => (
                  <th key={r.h}>{r.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['A', 'B', 'C'] as Exposure[]).map((e) => (
                <tr key={e}>
                  <td>Exp {e}</td>
                  {LAMBDA_TABLE.map((r) => (
                    <td key={r.h}>{r[e]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  )
}
