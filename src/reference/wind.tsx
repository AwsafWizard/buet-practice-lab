import { useState } from 'react'
import { fmt } from '../components/DiagramView'
import { Md, Seg, Tex } from '../components/ui'
import { CITY_V, cpLeeward, Kz, KZT_PARAMS, LAMBDA_TABLE, lambdaFactor, MS_TO_MPH, TERRAIN, type Exposure } from '../engine/wind'
import { WindLoadCases } from '../kit/loads'
import { Lookup, NumIn, ok, RT, type RefItem } from './common'

const EXPS: Exposure[] = ['A', 'B', 'C']
const ExpSeg = ({ v, set }: { v: Exposure; set: (e: Exposure) => void }) => <Seg size="xs" value={v} onChange={set} items={EXPS.map((e) => ({ v: e, label: e }))} />

// heights of BNBC Table 6.2.11 (m)
const KZ_HEIGHTS = [4.6, 6.1, 7.6, 9.1, 12.2, 15.2, 18, 21.3, 24.4, 27.4, 30.5, 36.6, 42.7, 48.8, 54.9, 61, 76.2, 91.4, 106.7, 121.9, 137.2, 152.4]

// p_s30 (psf), exposure A, I = 1, h = 9.1 m, as printed with the 2022-23 paper (Table 6)
const PS30_ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'EOH', 'GOH']
export const PS30_EXAM: { V: number; roof: string; lc: 1 | 2; p: (number | null)[] }[] = [
  { V: 110, roof: '0 to 5°', lc: 1, p: [19.2, -10.0, 12.7, -5.9, -23.1, -13.1, -16.0, -10.1, -32.3, -25.3] },
  { V: 110, roof: '10°', lc: 1, p: [21.6, -9.0, 14.4, -5.2, -23.1, -14.1, -16.0, -10.8, -32.3, -25.3] },
  { V: 110, roof: '15°', lc: 1, p: [24.1, -8.0, 16.0, -4.6, -23.1, -15.1, -16.0, -11.5, -32.3, -25.3] },
  { V: 110, roof: '20°', lc: 1, p: [26.6, -7.0, 17.7, -3.9, -23.1, -16.0, -16.0, -12.2, -32.3, -25.3] },
  { V: 110, roof: '25°', lc: 1, p: [24.1, 3.9, 17.4, 4.0, -10.7, -14.6, -7.7, -11.7, -19.9, -17.0] },
  { V: 110, roof: '25°', lc: 2, p: [null, null, null, null, -4.1, -7.9, -1.1, -5.1, null, null] },
  { V: 110, roof: '30 to 45°', lc: 1, p: [21.6, 14.8, 17.2, 11.8, 1.7, -13.1, 0.6, -11.3, -7.6, -8.7] },
  { V: 110, roof: '30 to 45°', lc: 2, p: [21.6, 14.8, 17.2, 11.8, 8.3, -6.5, 7.2, -4.6, -7.6, -8.7] },
  { V: 120, roof: '0 to 5°', lc: 1, p: [22.8, -11.9, 15.1, -7.0, -27.4, -15.6, -19.1, -12.1, -38.4, -30.1] },
  { V: 120, roof: '10°', lc: 1, p: [25.8, -10.7, 17.1, -6.2, -27.4, -16.8, -19.1, -12.9, -38.4, -30.1] },
  { V: 120, roof: '15°', lc: 1, p: [28.7, -9.5, 19.1, -5.4, -27.4, -17.9, -19.1, -13.7, -38.4, -30.1] },
  { V: 120, roof: '20°', lc: 1, p: [31.6, -8.3, 21.1, -4.6, -27.4, -19.1, -19.1, -14.5, -38.4, -30.1] },
  { V: 120, roof: '25°', lc: 1, p: [28.6, 4.5, 20.7, 4.7, -12.7, -17.3, -9.2, -13.9, -23.7, -20.2] },
  { V: 120, roof: '25°', lc: 2, p: [null, null, null, null, -4.8, -9.4, -1.3, -6.0, null, null] },
  { V: 120, roof: '30 to 45°', lc: 1, p: [25.7, 17.6, 20.4, 14.0, 2.0, -15.6, 0.7, -13.4, -9.0, -10.3] },
  { V: 120, roof: '30 to 45°', lc: 2, p: [25.7, 17.6, 20.4, 14.0, 9.9, -7.7, 8.6, -5.5, -9.0, -10.3] },
]

// roof C_p for MWFRS, wind normal to ridge, θ ≥ 10° (Fig 6.2.6 as printed in the chart pack)
const ROOF_ANG = ['10', '15', '20', '25', '30', '35', '45', '≥60']
const ROOF_WW: { hl: string; v: string[] }[] = [
  { hl: '≤ 0.25', v: ['−0.7, −0.18', '−0.5, 0.0*', '−0.3, 0.2', '−0.2, 0.3', '−0.2, 0.3', '0.0*, 0.4', '0.4', '0.01θ'] },
  { hl: '0.5', v: ['−0.9, −0.18', '−0.7, −0.18', '−0.4, 0.0*', '−0.3, 0.2', '−0.2, 0.2', '−0.2, 0.3', '0.0*, 0.4', '0.01θ'] },
  { hl: '≥ 1.0', v: ['−1.3**, −0.18', '−1.0, −0.18', '−0.7, −0.18', '−0.5, 0.0*', '−0.3, 0.2', '−0.2, 0.2', '0.0*, 0.3', '0.01θ'] },
]
const ROOF_LW: { hl: string; v: number[] }[] = [
  { hl: '≤ 0.25', v: [-0.3, -0.5, -0.6] },
  { hl: '0.5', v: [-0.5, -0.5, -0.6] },
  { hl: '≥ 1.0', v: [-0.7, -0.6, -0.6] },
]

const n = (v: number | null) => (v === null ? '—' : v.toFixed(1).replace('-', '−'))

function Speeds() {
  return (
    <>
      <RT
        head={['Location', 'V (m/s)', 'V (mph)']}
        rows={Object.entries(CITY_V).map(([c, v]) => [c, v, fmt(v * MS_TO_MPH, 1)])}
        cap="Locations used in past papers. 3-s gust at 10 m, exposure B, 50-yr return period. 1 m/s = 2.237 mph."
      />
    </>
  )
}

function ExposureCat() {
  return (
    <Md>{`- **Roughness A**: urban & suburban, wooded, numerous closely spaced obstructions ≥ single-family-house size.
- **Roughness B**: open terrain with scattered obstructions < 9.1 m; flat open country, grassland, **all water surfaces in cyclone-prone regions**.
- **Roughness C**: flat unobstructed areas and water surfaces *outside* cyclone-prone regions; mud flats, salt flats.

**Exposure A**: roughness A upwind for ≥ max(792 m, 20h). **Exposure C**: roughness C upwind for > max(1524 m, 20h) (extends max(200 m, 20h) downwind into A/B). **Exposure B**: everything else.`}</Md>
  )
}

function Kd() {
  return (
    <RT
      head={['Structure type', 'K_d']}
      rows={[
        ['Buildings: MWFRS', '0.85'],
        ['Buildings: components & cladding', '0.85'],
        ['Arched roofs', '0.85'],
        ['Chimneys, tanks: square', '0.90'],
        ['Chimneys, tanks: hexagonal', '0.95'],
        ['Chimneys, tanks: round', '0.95'],
        ['Solid signs', '0.85'],
        ['Open signs & lattice framework', '0.85'],
        ['Trussed towers: triangular, square, rectangular', '0.85'],
        ['Trussed towers: all other cross sections', '0.95'],
      ]}
      cap="Apply K_d only with the load combinations of Sec 2.7."
    />
  )
}

function ImportanceWind() {
  return (
    <>
      <RT
        head={['Occupancy category', <>Non-cyclone, or cyclone-prone with V = 38–44 m/s</>, 'Cyclone-prone, V > 44 m/s']}
        rows={[
          ['I', '0.87', '0.77'],
          ['II', '1.00', '1.00'],
          ['III', '1.15', '1.15'],
          ['IV', '1.15', '1.15'],
        ]}
      />
      <Md>{`I: low hazard (agricultural, temporary, minor storage) · II: everything else · III: > 300 people in one area, schools > 250, colleges > 500, day care > 150, health care ≥ 50 patients without surgery, jails · IV: essential: hospitals with surgery/emergency, fire/police stations, cyclone & earthquake shelters, power stations for emergencies.`}</Md>
    </>
  )
}

function Terrain() {
  return (
    <RT
      head={['Exp', 'α', 'z_g (m)', 'â', 'b̂', 'ᾱ', 'b̄', 'c', 'l (m)', 'ε̄', 'z_min (m)']}
      rows={EXPS.map((e) => {
        const t = TERRAIN[e]
        return [e, t.alpha, t.zg, `1/${t.alpha}`, t.bhat, `1/${fmt(1 / t.abar, 1)}`, t.bbar, t.c, t.l, `1/${fmt(1 / t.ebar, 1)}`, t.zmin]
      })}
      cap="z_min: minimum height so that the equivalent height z̄ = max(0.6h, z_min). For h ≤ z_min take z̄ = z_min."
    />
  )
}

function KzBody() {
  const [z, setZ] = useState(20)
  const [e, setE] = useState<Exposure>('A')
  return (
    <>
      <Tex block>{`K_z = 2.01\\left(\\frac{z}{z_g}\\right)^{2/\\alpha}\\ (4.57 \\le z \\le z_g),\\qquad K_z = 2.01\\left(\\frac{4.57}{z_g}\\right)^{2/\\alpha}\\ (z < 4.57\\text{ m})`}</Tex>
      <Lookup
        result={ok(z) ? <Tex>{`K_z(${fmt(z)}\\text{ m, exp. }${e}) = 2.01(${fmt(Math.max(z, 4.57))}/${TERRAIN[e].zg})^{2/${TERRAIN[e].alpha}} = \\mathbf{${fmt(Kz(z, e), 3)}}`}</Tex> : '—'}
      >
        <NumIn label="z" value={z} onChange={setZ} step={0.5} unit="m" />
        <ExpSeg v={e} set={setE} />
      </Lookup>
      <div className="mt-2">
        <RT
          head={['z (m)', 'A', 'B', 'C']}
          rows={[['0–4.6', ...EXPS.map((x) => fmt(Kz(0, x), 2))], ...KZ_HEIGHTS.slice(1).map((h) => [h, ...EXPS.map((x) => fmt(Kz(h, x), 2))])]}
          cap="Computed from the formula above (the one printed with the papers). Interpolate linearly between rows, or just use the formula."
        />
      </div>
    </>
  )
}

function KztBody() {
  return (
    <>
      <Tex block>{`K_{zt} = (1 + K_1K_2K_3)^2,\\quad K_2 = 1 - \\frac{|x|}{\\mu L_h},\\quad K_3 = e^{-\\gamma z/L_h}`}</Tex>
      <RT
        head={['Hill shape', 'K₁/(H/L_h) A', 'B', 'C', 'γ', 'μ upwind', 'μ downwind']}
        rows={Object.values(KZT_PARAMS).map((k) => [k.name, k.K1.A, k.K1.B, k.K1.C, k.gamma, k.muUp, k.muDown])}
        cap="2-D ridges also cover valleys (negative H in K₁/(H/L_h)). If H/L_h > 0.5: use H/L_h = 0.5 for K₁ and L_h = 2H in K₂, K₃."
      />
      <Md>{`**Apply only if all hold** (else $K_{zt} = 1$):
1. Isolated and unobstructed upwind for min(100H, 3.22 km).
2. Protrudes above upwind terrain within 3.22 km by a factor ≥ 2.
3. Building in the upper half of a hill/ridge or near the crest of an escarpment.
4. $H/L_h \\ge 0.2$.
5. $H \\ge 4.5$ m (exposures B, C) or ≥ 18.3 m (exposure A).

H = hill height, $L_h$ = horizontal distance upwind of the crest to where the ground is H/2 below the crest, x = distance from the crest to the building, z = height above local ground.`}</Md>
    </>
  )
}

function Pressures() {
  return (
    <Md>{`$$q_z = 0.000613\\,K_zK_{zt}K_dV^2I\\ \\ \\text{kN/m}^2\\quad(V\\text{ in m/s})$$
$$p = qGC_p - q_i(GC_{pi})$$
- Windward wall: $q = q_z$ (varies with height). Leeward, side walls and roof: $q = q_h$ (at mean roof height h).
- Enclosed buildings: $q_i = q_h$. Internal pressure cancels in the net storey force (windward + leeward).
- Storey force: $F = (p_{ww} - p_{lw}) \\times B \\times$ tributary height (half storey above + half below).`}</Md>
  )
}

function WallCp() {
  const [LB, setLB] = useState(1.5)
  return (
    <>
      <RT
        head={['Surface', 'L/B', 'C_p', 'Use with']}
        rows={[
          ['Windward wall', 'All values', '0.8', 'q_z'],
          ['Leeward wall', '0–1', '−0.5', 'q_h'],
          ['', '2', '−0.3', ''],
          ['', '≥ 4', '−0.2', ''],
          ['Side wall', 'All values', '−0.7', 'q_h'],
        ]}
        cap="L = horizontal dimension parallel to the wind, B = normal to the wind. Interpolate linearly for the leeward wall."
      />
      <Lookup result={ok(LB) && LB > 0 ? <>Leeward C_p (L/B = {fmt(LB)}) = <b>{fmt(cpLeeward(LB), 3)}</b></> : '—'}>
        <NumIn label="L/B" value={LB} onChange={setLB} step={0.1} />
      </Lookup>
    </>
  )
}

function RoofCp() {
  return (
    <>
      <div className="text-xs font-semibold mb-1">Normal to ridge, θ ≥ 10° — windward roof (two values: check both)</div>
      <RT head={['h/L', ...ROOF_ANG]} rows={ROOF_WW.map((r) => [r.hl, ...r.v])} />
      <div className="text-xs font-semibold mt-2 mb-1">Leeward roof</div>
      <RT head={['h/L', '10°', '15°', '≥ 20°']} rows={ROOF_LW.map((r) => [r.hl, ...r.v.map((v) => v.toFixed(1).replace('-', '−'))])} />
      <div className="text-xs font-semibold mt-2 mb-1">Normal to ridge θ &lt; 10°, and parallel to ridge (all θ)</div>
      <RT
        head={['h/L', 'Distance from windward edge', 'C_p']}
        rows={[
          ['≤ 0.5', '0 to h/2', '−0.9, −0.18'],
          ['', 'h/2 to h', '−0.9, −0.18'],
          ['', 'h to 2h', '−0.5, −0.18'],
          ['', '> 2h', '−0.3, −0.18'],
          ['≥ 1.0', '0 to h/2', '−1.3**, −0.18'],
          ['', '> h/2', '−0.7, −0.18'],
        ]}
      />
      <RT head={['Area (m²)', '≤ 9.3', '23.2', '≥ 92.9']} rows={[['Reduction factor (for **)', '1.0', '0.9', '0.8']]} />
      <div className="text-[11px] text-faint mt-1">* value given for interpolation. ** may be reduced linearly with the area it applies to. Use with q_h; interpolate between h/L rows and angles.</div>
    </>
  )
}

function Enclosure() {
  return (
    <>
      <RT
        head={['Enclosure', 'GC_pi']}
        rows={[
          ['Open building', '0.00'],
          ['Partially enclosed', '+0.55 / −0.55'],
          ['Enclosed', '+0.18 / −0.18'],
        ]}
      />
      <Md>{`- **Open**: every wall at least 80 % open ($A_o \\ge 0.8A_g$).
- **Partially enclosed**: all three hold — $A_o > 1.10A_{oi}$; $A_o > \\min(0.37\\text{ m}^2,\\ 0.01A_g)$; $A_{oi}/A_{gi} \\le 0.20$.
- **Enclosed**: neither of the above.

$A_o, A_g$: openings and gross area of the wall that receives positive external pressure (windward); $A_{oi}, A_{gi}$: openings and gross area of all the other walls and roof.`}</Md>
    </>
  )
}

function Parapet() {
  return (
    <Md>{`$$p_p = q_p(GC_{pn}),\\qquad GC_{pn} = +1.5\\ \\text{(windward)},\\ -1.0\\ \\text{(leeward)}$$
$q_p$ = velocity pressure at the **top of the parapet**. In a storey-force table the parapet line adds both faces: $F_p = q_p(1.5 + 1.0) \\times$ parapet height × B.`}</Md>
  )
}

function Gust() {
  return (
    <Md>{`**Rigid** ($n_1 \\ge 1$ Hz): $G = 0.85$, or
$$G = 0.925\\left(\\frac{1 + 1.7g_QI_{\\bar z}Q}{1 + 1.7g_vI_{\\bar z}}\\right),\\quad g_Q = g_v = 3.4$$
$$I_{\\bar z} = c\\left(\\frac{10}{\\bar z}\\right)^{1/6},\\ \\ \\bar z = \\max(0.6h,\\ z_{min}),\\quad Q = \\sqrt{\\frac{1}{1 + 0.63\\left(\\frac{B+h}{L_{\\bar z}}\\right)^{0.63}}},\\ \\ L_{\\bar z} = l\\left(\\frac{\\bar z}{10}\\right)^{\\bar\\epsilon}$$
**Flexible** ($n_1 < 1$ Hz):
$$G_f = 0.925\\left(\\frac{1 + 1.7I_{\\bar z}\\sqrt{g_Q^2Q^2 + g_R^2R^2}}{1 + 1.7g_vI_{\\bar z}}\\right),\\quad g_R = \\sqrt{2\\ln(3600n_1)} + \\frac{0.577}{\\sqrt{2\\ln(3600n_1)}}$$
$$R = \\sqrt{\\tfrac{1}{\\beta}R_nR_hR_B(0.53 + 0.47R_L)},\\quad R_n = \\frac{7.47N_1}{(1 + 10.3N_1)^{5/3}},\\quad N_1 = \\frac{n_1L_{\\bar z}}{\\bar V_{\\bar z}}$$
$$R_\\ell = \\frac1\\eta - \\frac{1}{2\\eta^2}(1 - e^{-2\\eta})\\ (\\eta > 0),\\quad R_\\ell = 1\\ (\\eta = 0)$$
$$R_h = R_\\ell\\ \\text{with}\\ \\eta = \\frac{4.6n_1h}{\\bar V_{\\bar z}},\\quad R_B = R_\\ell\\ \\text{with}\\ \\eta = \\frac{4.6n_1B}{\\bar V_{\\bar z}},\\quad R_L = R_\\ell\\ \\text{with}\\ \\eta = \\frac{15.4n_1L}{\\bar V_{\\bar z}}$$
$$\\bar V_{\\bar z} = \\bar b\\left(\\frac{\\bar z}{10}\\right)^{\\bar\\alpha}V$$
β = damping ratio (fraction of critical), $n_1$ = natural frequency (Hz). Constants $c, l, \\bar\\epsilon, \\bar b, \\bar\\alpha, z_{min}$ from Table 6.2.10.`}</Md>
  )
}

function LowRise() {
  return (
    <Md>{`- **Low-rise**: enclosed or partially enclosed, mean roof height $h \\le 18$ m **and** $h \\le$ least horizontal dimension.
- **Rigid**: fundamental frequency $n_1 \\ge 1$ Hz (period ≤ 1 s); otherwise **flexible**.
- **Simplified procedure (MWFRS)** needs: simple diaphragm, low-rise, enclosed, regular-shaped, not flexible, no unusual cross-wind/vortex/galloping/channelling response, roughly symmetric section with flat, gable or hip roof θ ≤ 45°, and torsional cases not governing.`}</Md>
  )
}

function Simplified() {
  const [h, setH] = useState(10)
  const [e, setE] = useState<Exposure>('B')
  return (
    <>
      <Tex block>{`p_s = \\lambda K_{zt}I\\,p_{s30}\\quad(\\text{MWFRS}),\\qquad p_{net} = \\lambda K_{zt}I\\,p_{net30}\\quad(\\text{C\\&C})`}</Tex>
      <RT
        head={['h (m)', 'h (ft)', 'A', 'B', 'C']}
        rows={LAMBDA_TABLE.map((r, i) => [r.h, 15 + 5 * i, r.A.toFixed(2), r.B.toFixed(2), r.C.toFixed(2)])}
        cap="Adjustment factor λ for building height and exposure (Fig 6.2.2). MWFRS chart prints 6.0 m, C&C 6.1 m and 9.15 m; same values. Interpolate linearly."
      />
      <Lookup result={ok(h) ? <>λ(h = {fmt(h)} m, exp. {e}) = <b>{fmt(lambdaFactor(h, e), 3)}</b></> : '—'}>
        <NumIn label="h" value={h} onChange={setH} step={0.1} unit="m" />
        <ExpSeg v={e} set={setE} />
      </Lookup>
    </>
  )
}

function Ps30() {
  const [V, setV] = useState<'110' | '120'>('110')
  const rows = PS30_EXAM.filter((r) => r.V === +V)
  return (
    <>
      <div className="flex items-center gap-2 mb-1.5 text-xs">
        <span className="text-mute">Basic wind speed</span>
        <Seg size="xs" value={V} onChange={setV} items={[{ v: '110', label: '110 mph' }, { v: '120', label: '120 mph' }]} />
        <span className="text-faint">= {fmt(+V / MS_TO_MPH, 1)} m/s</span>
      </div>
      <RT head={['Roof angle', 'LC', ...PS30_ZONES]} rows={rows.map((r) => [r.roof, r.lc, ...r.p.map(n)])} />
      <div className="text-[11px] text-faint mt-1 leading-snug">
        psf (× 0.04788 → kN/m²); exposure A, h = 9.1 m, I = 1.0. A–D horizontal (wall/roof projection), E–H vertical (roof), EOH/GOH overhangs. Load case 2 only for 25° and 30–45°. Other speeds: interpolate, or scale by (V/V₀)².
      </div>
      <ZoneSketch />
    </>
  )
}

/** design pressure zones for the simplified procedure, transverse wind */
function ZoneSketch() {
  const L = 280,
    D = 90,
    x0 = 40,
    a2 = 56
  const zone = (x: number, y: number, w: number, h: number, t: string, fill: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke="var(--c-mute)" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--c-ink)">
        {t}
      </text>
    </g>
  )
  const end = 'color-mix(in oklab, var(--c-load) 22%, transparent)'
  const mid = 'var(--c-panel2)'
  return (
    <div className="mt-2">
      <svg viewBox="0 0 380 320" className="w-full h-auto max-w-sm">
        <defs>
          <marker id="zs-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
          </marker>
        </defs>
        <text x={x0} y={14} fontSize={11} fill="var(--c-mute)">
          Roof plan (vertical pressures)
        </text>
        {zone(x0, 22, a2, D / 2, 'F', end)}
        {zone(x0 + a2, 22, L - a2, D / 2, 'H', mid)}
        {zone(x0, 22 + D / 2, a2, D / 2, 'E', end)}
        {zone(x0 + a2, 22 + D / 2, L - a2, D / 2, 'G', mid)}
        <line x1={x0} x2={x0 + L} y1={22 + D / 2} y2={22 + D / 2} stroke="var(--c-ink)" strokeDasharray="5 3" />
        <text x={x0 + L + 4} y={22 + D / 2 + 4} fontSize={10} fill="var(--c-faint)">
          ridge
        </text>
        {[120, 190, 260].map((x) => (
          <line key={x} x1={x} x2={x} y1={146} y2={118} stroke="var(--c-accent)" strokeWidth={1.8} markerEnd="url(#zs-a)" />
        ))}
        <text x={300} y={140} fontSize={11} fill="var(--c-accent)">
          wind
        </text>
        <text x={x0} y={178} fontSize={11} fill="var(--c-mute)">
          Windward face, seen from upwind (horizontal pressures)
        </text>
        {zone(x0, 186, a2, 34, 'B', end)}
        {zone(x0 + a2, 186, L - a2, 34, 'D', mid)}
        {zone(x0, 220, a2, 50, 'A', end)}
        {zone(x0 + a2, 220, L - a2, 50, 'C', mid)}
        <text x={x0 + L + 4} y={206} fontSize={10} fill="var(--c-faint)">
          roof
        </text>
        <text x={x0 + L + 4} y={248} fontSize={10} fill="var(--c-faint)">
          wall
        </text>
        <line x1={x0} x2={x0 + a2} y1={286} y2={286} stroke="var(--c-mute)" markerStart="url(#zs-a)" markerEnd="url(#zs-a)" />
        <text x={x0 + a2 / 2} y={302} textAnchor="middle" fontSize={11} fill="var(--c-ink)">
          2a
        </text>
      </svg>
      <Md>{`End zones (A, B, E, F) have width **2a** at the reference corner; apply the pattern at each corner in turn. $a = \\min(0.1 \\times$ least horizontal dimension, $0.4h)$, but $\\ge \\max(0.04 \\times$ least horizontal dimension, 0.9 m$)$. h = mean roof height.`}</Md>
    </div>
  )
}

export const WIND_ITEMS: RefItem[] = [
  { id: 'w-press', group: 'wind', title: 'Velocity & design pressure', tag: 'Sec 2.4', keywords: 'qz qh p GCp gcpi formula 0.000613', Body: Pressures },
  { id: 'w-v', group: 'wind', title: 'Basic wind speed V by location', tag: 'Table 6.2.8', keywords: 'dhaka chittagong cox mph m/s city', Body: Speeds },
  { id: 'w-exp', group: 'wind', title: 'Exposure categories', tag: 'Sec 2.4.6', keywords: 'surface roughness urban open water', Body: ExposureCat },
  { id: 'w-kd', group: 'wind', title: 'Directionality factor K_d', tag: 'Table 6.2.12', keywords: 'kd 0.85', Body: Kd },
  { id: 'w-i', group: 'wind', title: 'Importance factor I (wind)', tag: 'Table 6.2.9', keywords: 'occupancy category cyclone 0.87 0.77 1.15', Body: ImportanceWind },
  { id: 'w-terrain', group: 'wind', title: 'Terrain exposure constants', tag: 'Table 6.2.10', exam: true, keywords: 'alpha zg c l epsilon zmin b bar', Body: Terrain },
  { id: 'w-kz', group: 'wind', title: 'Exposure coefficient K_z', tag: 'Table 6.2.11', keywords: 'kz height velocity pressure exposure coefficient', Body: KzBody },
  { id: 'w-kzt', group: 'wind', title: 'Topographic factor K_zt', tag: 'Sec 2.4.7', exam: true, keywords: 'kzt k1 k2 k3 hill ridge escarpment gamma mu lh', Body: KztBody },
  { id: 'w-gust', group: 'wind', title: 'Gust effect factor G, G_f', tag: 'Sec 2.4.8', exam: true, keywords: 'gust iz q lz rigid flexible resonant gr rn', Body: Gust },
  { id: 'w-class', group: 'wind', title: 'Low-rise, rigid & simplified-procedure conditions', tag: 'Sec 2.1.3', keywords: 'low rise rigid flexible simplified conditions', Body: LowRise },
  { id: 'w-encl', group: 'wind', title: 'Enclosure & internal pressure GC_pi', tag: 'Sec 2.1.3', exam: true, keywords: 'gcpi open partially enclosed openings ao ag', Body: Enclosure },
  { id: 'w-cpwall', group: 'wind', title: 'Wall pressure coefficients C_p', tag: 'Fig 6.2.6', exam: true, keywords: 'cp windward leeward side wall l/b', Body: WallCp },
  { id: 'w-cproof', group: 'wind', title: 'Roof pressure coefficients C_p (MWFRS)', tag: 'Fig 6.2.6', keywords: 'cp roof ridge h/l angle theta', Body: RoofCp },
  { id: 'w-parapet', group: 'wind', title: 'Parapets GC_pn', keywords: 'parapet gcpn 1.5 -1.0 qp', Body: Parapet },
  { id: 'w-cases', group: 'wind', title: 'MWFRS wind load cases', tag: 'Fig 6.2.9', keywords: 'load case torsion 0.75 0.563 eccentricity 0.15', Body: () => <><WindLoadCases /><Md>{`Eccentricity $e = \\pm0.15B$; $M_T = 0.75(P_W + P_L)B e$ (case 2), $0.563(\\dots)$ for case 4.`}</Md></> },
  { id: 'w-lambda', group: 'wind', title: 'Simplified procedure: p_s and λ', tag: 'Fig 6.2.2', exam: true, keywords: 'lambda adjustment factor ps ps30 simplified', Body: Simplified },
  { id: 'w-ps30', group: 'wind', title: 'Simplified design pressure p_s30 & zones', tag: 'Fig 6.2.10', exam: true, keywords: 'ps30 zones a b c d e f g h eoh goh psf mph', Body: Ps30 },
]
