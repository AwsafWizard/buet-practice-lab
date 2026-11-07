// Practice problem on a lecture topic never asked in the 13 past papers: AJK sir's triaxial summary slides (drainage per
// stage, loading rates, which test when, typical parameters by soil type).
import { Md } from '../../../components/ui'
import type { SmQ } from '../../types'

const NOT_ASKED = 'Not asked in any past paper (2007-08 → 2023-24) but taught in the lectures — a fresh question this year could come from here.'

const SUMMARY = [
  ['UU (Q, quick)', 'closed — no consolidation', 'closed', '0.5–2 %/min (0.38–1.52 mm/min)', 'short'],
  ['CU (R)', 'open — consolidates under σ₃', 'closed, u measured', '0.5–2 %/min (0.38–1.52 mm/min)', 'medium'],
  ['CD (S, slow)', 'open', 'open, Δu ≈ 0', '0.0001–0.1 %/min (0.000076–0.076 mm/min)', 'long'],
  ['UC (special UU, σ₃ = 0)', 'none (no cell pressure)', 'none', '1–2 %/min (0.76–1.52 mm/min)', 'quick'],
]

const TYPICAL = [
  ['Soft clay', 'cu 15–40', 'c′ 0–10, φ′ 20–25°', 'c′ 0–5, φ′ 25–30°'],
  ['Stiff clay', 'cu 50–100', 'c′ 5–20, φ′ 25–30°', 'c′ 5–15, φ′ 30–35°'],
  ['Silty clay', 'cu 25–60', 'c′ 0–15, φ′ 24–30°', 'c′ 0–10, φ′ 28–33°'],
  ['Silt (non-plastic)', 'cu 0–20', 'c′ 0–10, φ′ 28–32°', 'c′ 0–5, φ′ 30–34°'],
  ['Sandy clay / clayey sand', 'cu 30–60', 'c′ 5–15, φ′ 28–35°', 'c′ 5–10, φ′ 30–36°'],
  ['Clean sand', 'not meaningful', 'c′ ≈ 0, φ′ 30–38°', 'c′ ≈ 0, φ′ 32–40°'],
  ['Gravel / coarse sand', 'not applicable', 'c′ ≈ 0, φ′ 35–45°', 'c′ ≈ 0, φ′ 38–45°'],
]

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="tbl w-auto text-xs">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SHEAR_NEW: SmQ[] = [
  {
    id: 'sm-own-shear-new1',
    paper: 'own',
    level: 'exam',
    sec: 'A',
    no: 'N1',
    marks: 0,
    topics: ['sm-shear'],
    title: 'Triaxial tests: drainage, loading rate, which test when, typical parameters · not asked yet',
    theory: true,
    text: `*${NOT_ASKED}*

(a) For the UU, CU and CD triaxial tests (and the unconfined compression test) state whether the drainage valve is open or closed during (i) the cell-pressure (consolidation) stage and (ii) the shearing stage, the usual rate of axial strain, and the time scale of the test.

(b) Which test would you specify, and which parameters would you use, for: (i) end-of-construction stability of an embankment built quickly on soft clay; (ii) long-term stability of a cut slope in stiff clay; (iii) a slow, staged fill on soft clay where each stage is checked after the clay has consolidated under the previous one but loaded quickly; (iv) the foundation of a footing on clean sand?

(c) True or false? Give a one-line reason for each.
- I. A UU test on clean dry sand gives φ = 0 and a useful cu.
- II. A CD test is sheared at about 0.5–2 % axial strain per minute.
- III. The CU test is also called the Q-test.
- IV. The unconfined compression test is a UU test with σ₃ = 0.
- V. UU tests on identical saturated clay specimens at different cell pressures give Mohr circles of the same diameter.
- VI. Typical CD parameters of a soft clay are c′ = 0–5 kPa and φ′ = 25–30°.
- VII. In a CU test the excess pore pressure is zero at failure.
- VIII. A stiff clay typically shows cu of 50–100 kPa in a UU test.`,
    pages: [],
    solution: () => (
      <div className="space-y-3 text-sm">
        <Md>{`**(a) Summary of the triaxial tests** (AJK sir's slide 64; mm/min for a 38 mm × 76 mm specimen, i.e. % strain × 76 mm):`}</Md>
        <Table head={['Test', 'Stage 1: cell pressure', 'Stage 2: shear', 'Rate of axial strain', 'Time scale']} rows={SUMMARY} />
        <Md>{`- **U / C** (first letter) is the first stage: Unconsolidated = valve closed when σ₃ is applied, so excess u is generated; Consolidated = valve open, water leaves until Δu = 0 and σ′₃ = σ₃.
- **U / D** (second letter) is the shearing stage: Undrained = valve closed (pore pressure often measured); Drained = valve open, and the load is applied so slowly that no excess u builds up.
- CD must be slow because clay needs time for water to flow out; UU/CU can be fast because no drainage is wanted.`}</Md>
        <Md>{`**(b) Which test.**
- (i) Quick embankment on soft clay — the clay has no time to drain, so the critical case is end of construction: **UU** (or UC), total stress, $\\varphi_u = 0$, $c_u$.
- (ii) Long-term cut slope in stiff clay — excess (negative) pore pressures have dissipated: **CD** (or CU with u measured), effective $c', \\varphi'$.
- (iii) Staged construction — the clay consolidates under each stage, then is loaded rapidly: **CU** (total $c, \\varphi$ for the consolidated-undrained strength, or $c', \\varphi'$ with the measured u).
- (iv) Clean sand drains almost at once under a footing: **CD** (or direct shear) for $\\varphi'$ with $c' \\approx 0$ — a UU test is not applicable to cohesionless soil ("Applicable for cohesive soil only!").`}</Md>
        <Md>{`**Typical parameters from triaxial tests** (slide 65, c in kPa):`}</Md>
        <Table head={['Soil', 'UU', 'CU (effective)', 'CD (long term)']} rows={TYPICAL} />
        <Md>{`**(c) True / false.**
- I. **False** — UU is for cohesive soil only; a dry sand has no undrained strength and cannot stand unconfined, so cu is meaningless.
- II. **False** — that is the CU / UU rate; CD runs at 0.0001–0.1 %/min so that no excess pore pressure develops.
- III. **False** — CU is the R-test; Q (quick) is UU and S (slow) is CD.
- IV. **True** — no confining pressure, no consolidation, no drainage, so $c_u = q_u/2$.
- V. **True** — with the valve closed an increase in σ₃ only raises u by the same amount, σ′ is unchanged, so every circle has the same deviator and the envelope is horizontal ($\\varphi_u = 0$).
- VI. **True** — slide 65: soft clay CD, c′ 0–5 kPa, φ′ 25–30°.
- VII. **False** — the valve is closed during shear, so excess u develops (positive in NC clay, negative in heavily OC clay) and is measured.
- VIII. **True** — slide 65: stiff clay UU, cu 50–100 kPa.`}</Md>
      </div>
    ),
    notes: [NOT_ASKED, 'Source: AJK sir\'s Topic 5 slides 41–65 (nomenclature, procedures, summary table, typical parameters). 2023-24 Q3(b) asked a different true/false set on valve positions; the rates, the choice of test and the typical values have never been asked.'],
  },
]
