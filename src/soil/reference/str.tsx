// Chart pane, shear strength (s-) items: AJK sir's Lecture 5 tables + the charts and formulas the papers print.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { circle, failurePlane, onPlaneFromPrincipal } from '../engine/mohr'
import { BETA_CHART, betaOCR, bjerrum, consistencyFromQu, QU_CLASSES, sensitivity, skemptonDu, skemptonNC, suFromK0Af, vaneCu, type VaneEnds } from '../engine/shear'
import { useUsed, type SmRefItem } from './pane'

const f2 = (v: number) => fmt(v, 2)
const R = String.raw

// ---------------------------------------------------------------- s-phi
const PHI_ROWS: [string, string][] = [
  ['Sand, rounded grains — loose', '27–30'],
  ['Sand, rounded grains — medium', '30–35'],
  ['Sand, rounded grains — dense', '35–38'],
  ['Sand, angular grains — loose', '30–35'],
  ['Sand, angular grains — medium', '35–40'],
  ['Sand, angular grains — dense', '40–45'],
  ['Gravel with some sand', '34–48'],
  ['Silts', '26–35'],
]
const PARAMS: [string, string, string, string][] = [
  ['Soft clay', 'UU 15–40 / –', 'CU 0–10 / 20–25', 'CD 0–5 / 25–30'],
  ['Stiff clay', 'UU 50–100 / –', 'CU 5–20 / 25–30', 'CD 5–15 / 30–35'],
  ['Silty clay', 'UU 25–60 / –', 'CU 0–15 / 24–30', 'CD 0–10 / 28–33'],
  ['Silt (non-plastic)', 'UU 0–20 / –', 'CU 0–10 / 28–32', 'CD 0–5 / 30–34'],
  ['Sandy clay / clayey sand', 'UU 30–60 / –', 'CU 5–15 / 28–35', 'CD 5–10 / 30–36'],
  ['Clean sand', 'UU 0 / –', 'CU ~0 / 30–38', 'CD ~0 / 32–40'],
  ['Gravel / coarse sand', 'UU 0 / –', 'CU ~0 / 35–45', 'CD ~0 / 38–45'],
]
function PhiBody() {
  const used = useUsed('s-phi')
  const [qu, setQu] = useState(110.8)
  return (
    <>
      <RT head={['Soil type (Das 7th ed., slide 12)', 'φ (deg)']} rows={PHI_ROWS} />
      <div className="mt-2" />
      <RT head={['Soil', 'UU  c / φ', 'CU  c′ / φ′', 'CD  c′ / φ′']} rows={PARAMS} cap="Slide 65: typical strength parameters by test type (c in kPa, φ in degrees). UU gives φu = 0 for saturated clay." />
      <div className="mt-2" />
      <RT
        head={['Consistency (Das Table 12.4)', 'qu (kN/m²)', 'qu (ton/ft²)']}
        rows={QU_CLASSES.map(([n, lo, hi]) => [n, hi === Infinity ? `> ${lo}` : `${lo}–${hi}`, hi === Infinity ? `> ${lo / 100}` : `${lo / 100}–${hi / 100}`])}
        hl={(i) => !!used && QU_CLASSES[i][0] === used.cls}
        cap="Slide 63. Unconfined strength qu = 2cu."
      />
      <Lookup result={ok(qu) ? <span>cu = {f2(qu / 2)} kPa · <b>{consistencyFromQu(qu)}</b></span> : '—'}>
        <NumIn label="qu" value={qu} onChange={setQu} step={10} unit="kPa" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-tests
function TestsBody() {
  const used = useUsed('s-tests')
  const T = ['CD', 'CU', 'UU', 'UCS']
  return (
    <>
      <RT
        head={['Test', 'Consolidation', 'Drainage in shear', 'Time', 'Rate / min']}
        rows={[
          ['CD (S, slow)', 'Yes', 'Yes', 'Long', '0.0001–0.1 %'],
          ['CU (R)', 'Yes', 'No', 'Medium', '0.5–2 %'],
          ['UU (Q, quick)', 'No', 'No', 'Short', '0.5–2 %'],
          ['UCS (σ3 = 0)', 'No', 'No', 'Quick', '1–2 %'],
        ]}
        hl={(i) => !!used && used.test === T[i]}
        cap="Slide 64. On a 38 × 76 mm specimen: CD 0.000076–0.076 mm/min, CU/UU 0.38–1.52, UC 0.76–1.52 mm/min."
      />
      <div className="mt-2" />
      <RT
        head={['Symbol', 'Valve', 'Volume change', 'Excess u']}
        rows={[
          ['C (phase 1, consolidated)', 'open', 'allowed', 'none'],
          ['U (phase 1, unconsolidated)', 'closed', 'none', 'generated'],
          ['D (phase 2, drained)', 'open', '—', 'none'],
          ['U (phase 2, undrained)', 'closed', 'none', 'generated, often measured'],
        ]}
      />
      <Md className="text-xs mt-2">{R`**Specimens.** Direct shear box 51 × 51 or 102 × 102 mm, h = 25 mm (ASTM D3080); the problems use 60 × 60 mm (A = 0.0036 m²) or 63.5 mm dia. UC specimen 38 mm × 76 mm (H/D = 2).

**Direct shear shortcomings (slide 36):** no σ3 applied; predefined horizontal failure plane (not the weakest); non-uniform stress; no drainage control or pore-pressure measurement.

**Which test for which field case** (papers' "two examples with sketches"):
- **UU** (end of construction, short term): embankment built quickly on soft clay; footing on saturated clay; oil tank filled quickly.
- **CU**: embankment raised in stages; rapid drawdown; a consolidated clay loaded again quickly.
- **CD** (long term): embankment or cut slope in clay years later; excavation slope long after construction.`}</Md>
    </>
  )
}

// ---------------------------------------------------------------- s-mohr
function MohrBody() {
  const used = useUsed('s-mohr')
  const [s1, setS1] = useState(399)
  const [s3, setS3] = useState(172)
  const [th, setTh] = useState(30)
  const [phi, setPhi] = useState(23.42)
  const good = [s1, s3, th, phi].every(ok)
  const c = circle(s1, s3)
  const p = onPlaneFromPrincipal(c.s1, c.s3, th)
  const fp = failurePlane(c, phi)
  return (
    <>
      <Md>{R`$$\sigma_\theta = \frac{\sigma_1+\sigma_3}{2} + \frac{\sigma_1-\sigma_3}{2}\cos 2\theta,\qquad \tau_\theta = \frac{\sigma_1-\sigma_3}{2}\sin 2\theta$$
θ from the **major principal plane** (Das eqs 10.8–10.9). General element (σx on the vertical plane, σz on the horizontal, τ):
$$\sigma_n = \tfrac{\sigma_z+\sigma_x}{2} + \tfrac{\sigma_z-\sigma_x}{2}\cos 2\theta + \tau\sin 2\theta,\quad \tau_n = \tfrac{\sigma_z-\sigma_x}{2}\sin 2\theta - \tau\cos 2\theta$$
- **Pole** (slide 16): line through σ1 parallel to the plane σ1 acts on, or through σ3 parallel to its plane; it cuts the circle at the pole. σ1 vertical → pole at (σ3, 0). A line from the pole parallel to any plane meets the circle at (σ, τ) on that plane.
- **Centre** C = (σ1 + σ3)/2, **radius** R = (σ1 − σ3)/2 = deviator/2, τmax = R on planes at 45°.
- **Failure** (envelope tangent): $\sin\varphi = \dfrac{R}{C + c\cot\varphi}$; with c = 0, $\sin\varphi = \dfrac{\sigma_1-\sigma_3}{\sigma_1+\sigma_3}$.
- $\sigma_1 = \sigma_3\tan^2(45+\varphi/2) + 2c\tan(45+\varphi/2)$.
- **Failure plane** at θ = 45° + φ/2 to the major principal plane (2θ = 90° + φ). On it σf = C − R sin φ, τf = R cos φ.
- **Two circles** → exact common tangent sin φ = (R2 − R1)/(C2 − C1), c = (R1 − C1 sin φ)/cos φ. **Three or more** → p–q (Kf) line q = a + p tan α, sin φ = tan α, c = a/cos φ.
- **Obliquity** on a plane = tan⁻¹(τ/σ); maximum obliquity = φ (c = 0).`}</Md>
      <Lookup
        result={
          good && c.R >= 0 ? (
            <span>
              C = {f2(c.C)}, R = {f2(c.R)} · on θ = {th}°: σ = <b>{f2(p.sigma)}</b>, τ = <b>{f2(p.tau)}</b> kPa · failure plane θf = {f2(fp.theta)}°, σf = {f2(fp.sigma)}, τf = {f2(fp.tau)} kPa
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="σ1" value={s1} onChange={setS1} step={10} unit="kPa" w="w-16" />
        <NumIn label="σ3" value={s3} onChange={setS3} step={10} unit="kPa" w="w-16" />
        <NumIn label="θ" value={th} onChange={setTh} step={5} unit="°" w="w-14" />
        <NumIn label="φ" value={phi} onChange={setPhi} step={1} unit="°" w="w-14" />
      </Lookup>
      {used && (
        <div className="text-[11px] text-faint mt-1">
          Lab: σ1 = {used.s1}, σ3 = {used.s3} kPa, plane θ = {used.th}°
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------- s-ab
function ABBody() {
  const used = useUsed('s-ab')
  const [B, setB] = useState(1)
  const [A, setA] = useState(0.5)
  const [d3, setD3] = useState(100)
  const [d1, setD1] = useState(250)
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — asked in 2012-13, 2017-18, 2020-21, 2021-22, Jan 2021</div>
      <Md>{R`$$\Delta u = B\left[\Delta\sigma_3 + A(\Delta\sigma_1 - \Delta\sigma_3)\right]$$
- **B** = Δu/Δσ3 under an all-round change (undrained). Saturated soil B ≈ 1; dry soil B ≈ 0; rises steeply to 1 as S → 100 %.
- **A** during shear; at failure **Af = Δuf/(Δσ1 − Δσ3)f** (B = 1).
- Sampling a saturated clay (no change in w): σ → 0, u → −σ′, σ′ unchanged. In the cell (B = 1) a cell pressure only raises u.`}</Md>
      <RT
        head={['Clay type (Skempton)', 'Af']}
        rows={[
          ['Sensitive / loose', '0.75–1.5'],
          ['Normally consolidated', '0.5–1'],
          ['Lightly overconsolidated', '0–0.5'],
          ['Heavily overconsolidated', '−0.5–0'],
          ['Compacted sandy clay', '0.25–0.75'],
        ]}
        hl={(i) => !!used && typeof used.Af === 'number' && ((i === 1 && used.Af >= 0.5 && used.Af <= 1) || (i === 0 && used.Af > 1) || (i === 2 && used.Af >= 0 && used.Af < 0.5) || (i === 3 && used.Af < 0))}
        cap="Af falls from about 1 (NC) through 0 near OCR ≈ 4 to negative values for heavily OC clay (dilation)."
      />
      <Lookup result={[B, A, d3, d1].every(ok) ? <span>Δu = <b>{f2(skemptonDu(B, A, d3, d1))}</b> kPa</span> : '—'}>
        <NumIn label="B" value={B} onChange={setB} step={0.05} w="w-14" />
        <NumIn label="A" value={A} onChange={setA} step={0.05} w="w-14" />
        <NumIn label="Δσ3" value={d3} onChange={setD3} step={10} unit="kPa" w="w-16" />
        <NumIn label="Δσ1" value={d1} onChange={setD1} step={10} unit="kPa" w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-beta
export function BetaChart({ ocr, curve }: { ocr?: number; curve?: 'average' | 'upper' | 'lower' }) {
  const W = 300,
    H = 200,
    L = 34,
    B = 26,
    Tp = 8,
    Rt = 10
  const x = (o: number) => L + (o / 12) * (W - L - Rt)
  const y = (b: number) => H - B - (b / 6) * (H - B - Tp)
  const path = (ys: number[]) => BETA_CHART.ocr.map((o, i) => `${i ? 'L' : 'M'}${x(o).toFixed(1)},${y(ys[i]).toFixed(1)}`).join(' ')
  const band = path(BETA_CHART.upper) + ' ' + [...BETA_CHART.ocr].reverse().map((o, i) => `L${x(o).toFixed(1)},${y([...BETA_CHART.lower].reverse()[i]).toFixed(1)}`).join(' ') + ' Z'
  const b = ocr !== undefined && ocr >= 1 && ocr <= 10.6 ? betaOCR(ocr, curve) : null
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px]" role="img" aria-label="beta versus OCR chart">
      {[0, 2, 4, 6, 8, 10, 12].map((o) => (
        <g key={o}>
          <line x1={x(o)} x2={x(o)} y1={y(0)} y2={y(6)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={x(o)} y={H - B + 12} fontSize={9} textAnchor="middle" fill="var(--c-mute)">
            {o}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((v) => (
        <g key={v}>
          <line x1={x(0)} x2={x(12)} y1={y(v)} y2={y(v)} stroke="var(--c-line)" strokeWidth={0.6} />
          <text x={L - 5} y={y(v) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            {v}
          </text>
        </g>
      ))}
      <path d={band} fill="var(--c-accent)" opacity={0.12} />
      <path d={path(BETA_CHART.upper)} fill="none" stroke="var(--c-ink)" strokeWidth={1.3} />
      <path d={path(BETA_CHART.lower)} fill="none" stroke="var(--c-ink)" strokeWidth={1.3} />
      <path d={path(BETA_CHART.average)} fill="none" stroke="var(--c-accent)" strokeWidth={1.6} strokeDasharray="5 3" />
      <text x={x(10.7)} y={y(5.72) - 4} fontSize={8} textAnchor="end" fill="var(--c-mute)">
        upper
      </text>
      <text x={x(10.7)} y={y(5.15) + 10} fontSize={8} textAnchor="end" fill="var(--c-accent)">
        average
      </text>
      <text x={x(11)} y={y(4.3) + 11} fontSize={8} textAnchor="end" fill="var(--c-mute)">
        lower
      </text>
      {b !== null && (
        <g>
          <line x1={x(ocr!)} x2={x(ocr!)} y1={y(0)} y2={y(b)} stroke="var(--c-load)" strokeDasharray="3 2" />
          <line x1={x(0)} x2={x(ocr!)} y1={y(b)} y2={y(b)} stroke="var(--c-load)" strokeDasharray="3 2" />
          <circle cx={x(ocr!)} cy={y(b)} r={3} fill="var(--c-load)" data-tip={`OCR = ${f2(ocr!)}, β = ${f2(b)}`} />
        </g>
      )}
      <text x={(L + W - Rt) / 2} y={H - 2} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
        Overconsolidation ratio, OCR
      </text>
      <text x={9} y={(H - B) / 2} fontSize={10} textAnchor="middle" fill="var(--c-ink)" transform={`rotate(-90 9 ${(H - B) / 2})`}>
        β
      </text>
    </svg>
  )
}
function BetaBody() {
  const used = useUsed('s-beta')
  const [o, setO] = useState(typeof used?.OCR === 'number' ? used.OCR : 5)
  const ocr = typeof used?.OCR === 'number' ? used.OCR : o
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — printed with 2017-18 (Chart 1), Jan 2021 and 2021-22 (Chart 2)</div>
      <BetaChart ocr={ocr} />
      <Md className="text-xs">{R`β = (cu/σ′0)OC ÷ (cu/σ′0)NC (Ladd et al.). Redrawn from the digitised printed chart (±0.05). Use: σ′0 at the depth → OCR = σ′c/σ′0 → (cu/σ′0)NC (Skempton 0.11 + 0.0037 PI, or the K0–Af expression) → **cu = β (cu/σ′0)NC σ′0**. Quote the band (lower / upper) as well.`}</Md>
      <RT
        head={['OCR', 'lower', 'average', 'upper']}
        rows={BETA_CHART.ocr.slice(0, 10).map((x, i) => [String(x), BETA_CHART.lower[i].toFixed(2), BETA_CHART.average[i].toFixed(2), BETA_CHART.upper[i].toFixed(2)])}
        hl={(i) => Math.round(ocr) === BETA_CHART.ocr[i]}
      />
      <Lookup result={ok(o) && o >= 1 && o <= 10.6 ? <span>β = <b>{f2(betaOCR(o))}</b> (band {f2(betaOCR(o, 'lower'))}–{f2(betaOCR(o, 'upper'))}) · Ladd OCR^0.8 = {f2(o ** 0.8)}</span> : 'OCR 1–10.6'}>
        <NumIn label="OCR" value={o} onChange={setO} step={0.5} w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-vane
function VaneBody() {
  const used = useUsed('s-vane')
  const [T, setT] = useState(15)
  const [D, setD] = useState(50)
  const [Hh, setH] = useState(100)
  const [ends, setEnds] = useState<VaneEnds>(1)
  const [PI, setPI] = useState(36)
  const r = vaneCu(T / 1000, D / 1000, Hh / 1000, ends)
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — 2009-10, 2012-13, Jan 2021, 2021-22</div>
      <Md>{R`$$T = c_u\,\pi D^2\left(\frac{H}{2} + \frac{D}{6}\right)\quad\text{(both ends, uniform)}\qquad H = 2D:\ c_u = \frac{6T}{7\pi D^3} \approx \frac{3T}{11D^3}$$
- Side: $c_u\cdot\pi DH\cdot D/2$. Each end, **uniform**: $c_u\,\pi D^3/12$; **triangular** (zero at the axis): $c_u\,\pi D^3/16$.
- **One end shearing** (vane top flush with the clay): use D/12 instead of D/6.
- **Bjerrum (1972):** $c_{u,\text{design}} = \lambda\,c_{u,\text{vane}}$, $\lambda = 1.7 - 0.54\log PI$.
- Sensitivity $S_t = c_u(\text{undisturbed})/c_u(\text{remoulded})$ from a second test after rotating the vane.`}</Md>
      <Lookup
        result={[T, D, Hh, PI].every(ok) && D > 0 ? (
          <span>
            cu = <b>{f2(r.cu)}</b> kPa · λ = {f2(bjerrum(PI))} · design cu = <b>{f2(r.cu * bjerrum(PI))}</b> kPa
          </span>
        ) : (
          '—'
        )}
      >
        <NumIn label="T" value={T} onChange={setT} step={1} unit="N·m" w="w-14" />
        <NumIn label="D" value={D} onChange={setD} step={5} unit="mm" w="w-14" />
        <NumIn label="H" value={Hh} onChange={setH} step={5} unit="mm" w="w-14" />
        <label className="inline-flex items-center gap-1 text-xs">
          <span className="text-mute">ends</span>
          <select className="field !py-0.5 !text-xs" value={ends} onChange={(e) => setEnds(+e.target.value as VaneEnds)}>
            <option value={2}>2</option>
            <option value={1}>1</option>
            <option value={0}>0</option>
          </select>
        </label>
        <NumIn label="PI" value={PI} onChange={setPI} step={1} w="w-14" />
      </Lookup>
      {used && <div className="text-[11px] text-faint mt-1">Lab: {String(used.what ?? '')}</div>}
    </>
  )
}

// ---------------------------------------------------------------- s-cu
function CuBody() {
  const used = useUsed('s-cu')
  const [PI, setPI] = useState(31)
  const [phi, setPhi] = useState(20)
  const [K0v, setK0] = useState(0.5)
  const [Af, setAf] = useState(0.6)
  const [qu1, setQu1] = useState(120)
  const [qu2, setQu2] = useState(30)
  const s = sensitivity(qu1, qu2)
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — 2017-18, Jan 2021, 2021-22</div>
      <Md>{R`- **Skempton (1957):** $(c_u/\sigma'_0)_{NC} = 0.11 + 0.0037\,PI$ (PI in %).
- **From c′, φ′, K0, Af** (2017-18 Q2(c)): $\displaystyle s_u = \frac{c'\cos\varphi' + \sigma'_v\sin\varphi'\,[K_0 + A_f(1-K_0)]}{1 + (2A_f - 1)\sin\varphi'}$
- **OC clay:** $c_u = \beta\,(c_u/\sigma'_0)_{NC}\,\sigma'_0$ with β from the chart (s-beta); Ladd's $\text{OCR}^{0.8}$ is close to the average curve.
- **Sensitivity** $S_t = q_u(\text{undisturbed})/q_u(\text{remoulded})$: 1 insensitive, 1–2 slightly, 2–4 medium, 4–8 very sensitive, 8–16 slightly quick, 16–32 medium quick, 32–64 very quick, > 64 extra quick (Rosenqvist).
- **Thixotropy:** strength regained with time at constant water content after remoulding. **Critical void ratio:** the void ratio at which a sand shears with no volume change.`}</Md>
      <Lookup
        result={
          <span>
            Skempton (cu/σ′)NC = <b>{f2(skemptonNC(PI))}</b> · K0–Af ratio = <b>{fmt(suFromK0Af({ c: 0, phi, K0: K0v, Af, sv: 1 }), 3)}</b> · St = {f2(s.St)} ({s.cls})
          </span>
        }
      >
        <NumIn label="PI" value={PI} onChange={setPI} step={1} w="w-12" />
        <NumIn label="φ′" value={phi} onChange={setPhi} step={1} unit="°" w="w-12" />
        <NumIn label="K0" value={K0v} onChange={setK0} step={0.05} w="w-14" />
        <NumIn label="Af" value={Af} onChange={setAf} step={0.05} w="w-14" />
        <NumIn label="qu und." value={qu1} onChange={setQu1} step={10} w="w-14" />
        <NumIn label="qu rem." value={qu2} onChange={setQu2} step={5} w="w-14" />
      </Lookup>
      {used && <div className="text-[11px] text-faint mt-1">Lab: PI = {used.PI}, OCR = {used.OCR}</div>}
    </>
  )
}

// ---------------------------------------------------------------- st-shear
function StepsBody() {
  return (
    <Md>{R`**Triaxial / direct shear numerical — what to write**
1. Table of σ3, deviator, σ1 (and u, σ′3 = σ3 − u, σ′1 = σ1 − u for CU).
2. Circles: C = (σ1 + σ3)/2, R = deviator/2 (total and effective).
3. Envelope: one circle and NC (c = 0) → sin φ = R/C; two circles → common tangent; three or more → p–q line (say which). Direct shear: τ against σ, regression.
4. Draw it **to scale on graph paper**: circles, envelope, c and φ marked.
5. Failure plane θ = 45 + φ/2 from the major principal plane; σf = C − R sin φ, τf = R cos φ; show it on the element.
6. Write the Mohr–Coulomb equation τf = c + σ tan φ (or with ′).
7. Comment: c′ ≈ 0 → NC; c′ > 0, negative u → OC; φ′ > φcu for NC clay.`}</Md>
  )
}

export const STR_ITEMS: SmRefItem[] = [
  { id: 's-phi', group: 'str', title: 'Typical φ, c and qu consistency', tag: 'Das 7th ed., Table 12.4, slide 65', keywords: 'friction angle sand gravel silt cohesion unconfined consistency stiff soft', Body: PhiBody },
  { id: 's-tests', group: 'str', title: 'Shear tests: drainage, loading rates, specimens', tag: 'slides 21, 36, 41–44, 64', keywords: 'triaxial CD CU UU UCS direct shear drainage valve rate field cases', Body: TestsBody },
  { id: 's-mohr', group: 'str', title: 'Mohr circle, pole and failure plane formulas', tag: 'Das eqs 10.8–10.9, slide 16', keywords: 'pole principal plane obliquity tangent envelope p-q Kf line 45+phi/2', Body: MohrBody },
  { id: 's-ab', group: 'str', title: "Skempton's pore-pressure parameters A and B", tag: 'flagged', keywords: 'pore pressure parameter Af B saturation sampling', Body: ABBody },
  { id: 's-beta', group: 'str', title: 'β vs OCR chart', tag: 'printed 2017-18, Jan 2021, 2021-22', exam: true, keywords: 'beta overconsolidation ratio undrained strength chart Ladd', Body: BetaBody },
  { id: 's-vane', group: 'str', title: 'Vane shear formula + Bjerrum correction', tag: 'flagged', keywords: 'vane torque 6T/7piD3 Bjerrum lambda PI', Body: VaneBody },
  { id: 's-cu', group: 'str', title: 'cu correlations and sensitivity', tag: 'flagged', keywords: 'Skempton 0.11 0.0037 PI K0 Af su sensitivity thixotropy critical void ratio', Body: CuBody },
  { id: 'st-shear', group: 'steps', title: 'Steps: a triaxial / direct shear answer', keywords: 'shear triaxial steps checklist', Body: StepsBody },
]
