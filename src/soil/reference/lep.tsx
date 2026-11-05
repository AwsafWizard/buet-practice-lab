// Chart pane, earth pressure (e-) items: AJK sir's Lecture 6 + the handnote; Coulomb and wall loads flagged.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { coulomb, integrateWall, K0, k0By, Ka, K0_LABEL, Kp, lineLoadSigma, MOVE_TABLE, pointLoadSigma, rankineSloping, type K0Formula } from '../engine/earth'
import { useUsed, type SmRefItem } from './pane'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const R = String.raw

// ---------------------------------------------------------------- e-ka
const PHIS = [0, 20, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 42, 45]
function KaBody() {
  const used = useUsed('e-ka')
  const [phi, setPhi] = useState(30)
  const phis = (used?.phis as string | undefined)?.split(',').map(Number) ?? []
  return (
    <>
      <Md>{R`$$K_a = \tan^2\!\left(45 - \frac{\varphi'}{2}\right) = \frac{1-\sin\varphi'}{1+\sin\varphi'},\qquad K_p = \tan^2\!\left(45 + \frac{\varphi'}{2}\right) = \frac{1}{K_a}$$`}</Md>
      <RT
        head={['φ′ (°)', 'Ka', '√Ka', 'Kp', '√Kp', 'K0 = 1 − sin φ′']}
        rows={PHIS.map((p) => [String(p), f3(Ka(p)), f3(Math.sqrt(Ka(p))), f3(Kp(p)), f3(Math.sqrt(Kp(p))), f3(K0.jaky(p))])}
        hl={(i) => phis.includes(PHIS[i])}
        cap="φ = 0 (undrained clay): Ka = Kp = 1. Handnote table rounds Ka to 3 places and Kp to 2."
      />
      <Lookup
        result={ok(phi) ? (
          <span>
            Ka = <b>{fmt(Ka(phi), 4)}</b>, √Ka = {fmt(Math.sqrt(Ka(phi)), 4)} · Kp = <b>{fmt(Kp(phi), 4)}</b>, √Kp = {fmt(Math.sqrt(Kp(phi)), 4)} · failure planes: active {f2(45 + phi / 2)}° to horizontal, passive {f2(45 - phi / 2)}°
          </span>
        ) : (
          '—'
        )}
      >
        <NumIn label="φ′" value={phi} onChange={setPhi} step={1} unit="°" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- e-k0
function K0Body() {
  const used = useUsed('e-k0')
  const [f, setF] = useState<K0Formula>('jaky')
  const [phi, setPhi] = useState(32)
  const [OCR, setOCR] = useState(2)
  const [gd, setGd] = useState(16.2)
  const [gdMin, setGdMin] = useState(15.5)
  const [PI, setPI] = useState(15)
  const F: K0Formula[] = ['jaky', 'sherif', 'mayne', 'massarsch', 'massarschOC']
  const k = k0By(f, { phi, OCR, gd, gdMin, PI })
  return (
    <>
      <RT
        head={['Soil (slide 4 label)', 'K0', 'Das eq.']}
        rows={[
          ['Coarse-grained / loose sand (Jaky 1944)', '1 − sin φ′', '13.5'],
          ['Dense compacted sand (Sherif et al.)', '(1 − sin φ′) + 5.5(γd/γd(min) − 1)', '13.6'],
          ['OC soils, clay to gravel (Mayne & Kulhawy 1982)', '(1 − sin φ′) OCR^(sin φ′)', '13.7'],
          ['NC fine soils (Massarsch 1979)', '0.44 + 0.42 (PI %/100)', '13.8'],
          ['OC clay', 'K0(NC) √OCR', '13.9'],
        ]}
        hl={(i) => !!used && used.f === F[i]}
        cap="γd = actual compacted dry unit weight behind the wall; γd(min) = dry unit weight in the loosest state. OCR = σ′c/σ′0. Slide 4 boxes “K0 ≤ 1” — true for NC sands; heavily OC soils and very dense compacted sand can exceed 1 (the handnote says “for sands”)."
      />
      <Md className="text-xs mt-1">{R`σ′h = K0σ′0 (water separately); P0 = ½K0γH² at H/3 for dry uniform soil. Use K0 for walls that cannot move: basement walls, bridge abutments, braced or propped walls. Factors affecting K0: φ′ / soil type, stress history (OCR), compaction and placement, density, structure and ageing.`}</Md>
      <Lookup result={ok(k) ? <span>K0 = <b>{fmt(k, 4)}</b>{k > 1 ? ' (above 1: OC / compacted)' : ''}</span> : '—'}>
        <select className="field !py-0.5 !text-xs" value={f} onChange={(e) => setF(e.target.value as K0Formula)}>
          {F.map((x) => (
            <option key={x} value={x}>
              {K0_LABEL[x]}
            </option>
          ))}
        </select>
        {f !== 'massarsch' && f !== 'massarschOC' && <NumIn label="φ′" value={phi} onChange={setPhi} step={1} unit="°" w="w-12" />}
        {(f === 'mayne' || f === 'massarschOC') && <NumIn label="OCR" value={OCR} onChange={setOCR} step={0.5} w="w-12" />}
        {f === 'sherif' && (
          <>
            <NumIn label="γd" value={gd} onChange={setGd} step={0.1} w="w-14" />
            <NumIn label="γd(min)" value={gdMin} onChange={setGdMin} step={0.1} w="w-14" />
          </>
        )}
        {(f === 'massarsch' || f === 'massarschOC') && <NumIn label="PI" value={PI} onChange={setPI} step={1} w="w-12" />}
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- e-move
function MoveBody() {
  const used = useUsed('e-move')
  const [i, setI] = useState(0)
  const [H, setH] = useState(5)
  const m = MOVE_TABLE[i]
  const mm = (x: number) => fmt(x * H * 1000, 1)
  return (
    <>
      <RT
        head={['Soil (Das Table 13.1)', 'ΔLa/H (active)', 'ΔLp/H (passive)']}
        rows={MOVE_TABLE.map((r) => [r.soil, r.a[0] === r.a[1] ? String(r.a[0]) : `${r.a[0]}–${r.a[1]}`, String(r.p[0])])}
        hl={(k) => !!used && used.soil === MOVE_TABLE[k].soil}
        cap="Active: wall moves away, rotating about its base (slide 5). Passive needs ~5–10× the active movement for sands, only 2× for clays."
      />
      <Lookup
        result={ok(H) ? (
          <span>
            active: {mm(m.a[0])}{m.a[0] !== m.a[1] ? `–${mm(m.a[1])}` : ''} mm outward · passive: {mm(m.p[0])} mm inward
          </span>
        ) : (
          '—'
        )}
      >
        <select className="field !py-0.5 !text-xs" value={i} onChange={(e) => setI(+e.target.value)}>
          {MOVE_TABLE.map((r, k) => (
            <option key={r.soil} value={k}>
              {r.soil}
            </option>
          ))}
        </select>
        <NumIn label="H" value={H} onChange={setH} step={0.5} unit="m" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- e-rankine
function RankineBody() {
  return (
    <>
      <Md>{R`$$\sigma'_a = \sigma'_0K_a - 2c'\sqrt{K_a},\qquad \sigma'_p = \sigma'_0K_p + 2c'\sqrt{K_p},\qquad \sigma'_0 = q + \textstyle\sum\gamma_i h_i\ (\gamma' = \gamma_{sat}-\gamma_w\text{ below the WT})$$
- Water separately: $u = \gamma_w h_w$ (K = 1, never × Ka). Surcharge: rectangle $qK$ over each layer's height.
- At an interface compute twice (upper K just above, lower K just below) — the diagram jumps.
- **Tension crack:** $z_c = \dfrac{2c'}{\gamma\sqrt{K_a}}$; with q: $z_c = (2c'/\sqrt{K_a} - q)/\gamma$; φ = 0: $z_c = (2c_u - q)/\gamma$.
- Before crack: $P_a = \tfrac12\gamma H^2K_a - 2c'\sqrt{K_a}H$; after crack: $P_a = \tfrac12(H - z_c)(\gamma HK_a - 2c'\sqrt{K_a})$ at $(H - z_c)/3$ — **design value** (larger).
- **Unsupported cut:** $H_c = 2z_c = \dfrac{4c}{\gamma\sqrt{K_a}}$ (φ = 0: $4c_u/\gamma$; Terzaghi's crack-adjusted $2.67c_u/\gamma$).
- Passive: no crack; rectangle $2c'\sqrt{K_p}$ (at H/2) + triangle $\gamma HK_p$ (at H/3).
- Failure planes: active $45 + \varphi'/2$ to the horizontal (major principal plane); passive $45 + \varphi'/2$ to the vertical = $45 - \varphi'/2$ to the horizontal.
- Rankine assumptions: vertical, smooth wall (δ = 0); horizontal backfill surface; semi-infinite homogeneous soil in plastic equilibrium; wall moves enough to mobilise the state.`}</Md>
      <RT
        head={['Piece', 'Shape', 'Force', 'Arm above base']}
        rows={[
          ['Soil above WT', 'triangle', '½σ1h1', 'h2 + h1/3'],
          ['Soil below WT (carried over)', 'rectangle', 'σ1h2', 'h2/2'],
          ['Soil below WT (added)', 'triangle', '½(σ2 − σ1)h2', 'h2/3'],
          ['Water', 'triangle', '½γw h2²', 'h2/3'],
          ['Surcharge', 'rectangle', 'qKa H', 'H/2'],
          ['Passive in front (subtract)', 'triangle', '−½KpγD²', 'D/3'],
        ]}
        cap="Handnote working table. Fs = ΣF − Pp, MOT = ΣF·arm − Pp·armp, z̄ = MOT/Fs."
      />
    </>
  )
}

// ---------------------------------------------------------------- e-coulomb
function CoulombBody() {
  const used = useUsed('e-coulomb')
  const [phi, setPhi] = useState(32)
  const [delta, setDelta] = useState(20)
  const [theta, setTheta] = useState(0)
  const [beta, setBeta] = useState(0)
  const c = coulomb(phi, delta, theta, beta)
  const s = rankineSloping(phi, beta)
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — 2008-09, 2012-13, 2015-16, 2020-21, Jan 2021, 2021-22</div>
      <Md>{R`$$K_a = \frac{\cos^2(\varphi-\theta)}{\cos^2\theta\cos(\delta+\theta)\left[1+\sqrt{\dfrac{\sin(\delta+\varphi)\sin(\varphi-\beta)}{\cos(\delta+\theta)\cos(\theta-\beta)}}\right]^2}$$
$$K_p = \frac{\cos^2(\varphi+\theta)}{\cos^2\theta\cos(\delta-\theta)\left[1-\sqrt{\dfrac{\sin(\varphi+\delta)\sin(\varphi+\beta)}{\cos(\delta-\theta)\cos(\beta-\theta)}}\right]^2}$$
θ = wall back from the vertical, β = backfill slope, δ = wall friction. $P = \tfrac12\gamma H^2K$ at δ to the wall normal (horizontal part P cos δ for a vertical wall).
- **Coulomb assumptions:** plane failure surface through the heel; rigid wedge in limit equilibrium; wall friction δ acts; any wall batter and backfill slope; c = 0 in the basic theory; a 2-D problem.
- **Rankine vs Coulomb:** Rankine = stress state in a semi-infinite mass, smooth vertical wall; Coulomb = force equilibrium of a sliding wedge, wall friction allowed. δ = 0, θ = β = 0 → both give the same K.
- **Culmann:** trial wedges from the heel; lay weights on the φ-line (at φ to the horizontal); draw lines parallel to the pressure line (at ψ = 90 − θ − δ to the φ-line) — the largest ordinate = Pa.
- **Rankine sloping backfill (c = 0):** $K_a = \cos\beta\,\dfrac{\cos\beta-\sqrt{\cos^2\beta-\cos^2\varphi}}{\cos\beta+\sqrt{\cos^2\beta-\cos^2\varphi}}$, P parallel to the surface, horizontal part P cos β.`}</Md>
      <Lookup
        result={[phi, delta, theta, beta].every(ok) ? (
          <span>
            Coulomb Ka = <b>{fmt(c.ka, 4)}</b>, Kp = <b>{fmt(c.kp, 3)}</b> · Rankine sloping Ka = {fmt(s.ka, 4)} (horizontal {fmt(s.kaH, 4)})
          </span>
        ) : (
          '—'
        )}
      >
        <NumIn label="φ" value={phi} onChange={setPhi} step={1} unit="°" w="w-12" />
        <NumIn label="δ" value={delta} onChange={setDelta} step={1} unit="°" w="w-12" />
        <NumIn label="θ" value={theta} onChange={setTheta} step={1} unit="°" w="w-12" />
        <NumIn label="β" value={beta} onChange={setBeta} step={1} unit="°" w="w-12" />
      </Lookup>
      {used && <div className="text-[11px] text-faint mt-1">Lab: φ = {used.phi}°, δ = {used.delta}°</div>}
    </>
  )
}

// ---------------------------------------------------------------- e-wallload
function WallLoadBody() {
  const [kind, setKind] = useState<'point' | 'line'>('point')
  const [Q, setQ] = useState(200)
  const [x, setX] = useState(5)
  const [H, setH] = useState(9)
  const r = integrateWall((z) => (kind === 'point' ? pointLoadSigma(Q, x, H, z) : lineLoadSigma(Q, x, H, z)), H)
  return (
    <>
      <div className="text-[11px] leading-snug text-load mb-1">Not in AJK sir's slides — 2007-08, 2009-10, 2010-11, 2015-16</div>
      <Md>{R`Modified Boussinesq (Terzaghi; Gerber–Spangler), m = x/H, n = z/H. Point load Q (kN), line load q (kN/m) parallel to the wall:
$$m \le 0.4:\ \sigma_h = \frac{0.28Q}{H^2}\frac{n^2}{(0.16+n^2)^3},\qquad m > 0.4:\ \sigma_h = \frac{1.77Q}{H^2}\frac{m^2n^2}{(m^2+n^2)^3}$$
$$m \le 0.4:\ \sigma_h = \frac{0.203q}{H}\frac{n}{(0.16+n^2)^2},\qquad m > 0.4:\ \sigma_h = \frac{1.27q}{H}\frac{m^2n}{(m^2+n^2)^2}$$
- Away from the section through the load: $\sigma'_h = \sigma_h\cos^2(1.1\alpha)$ (α in plan).
- Line load resultant ≈ 0.55q (m ≤ 0.4), 0.64q/(m² + 1) (m > 0.4).
- Elastic (ν = 0.5) point load on the whole wall: $P = \dfrac{Q}{\pi}\dfrac{H^2}{x^2+H^2}$, doubled for a rigid (unyielding) wall.
- Integrate σh over the height (Simpson, 6–8 strips) and add the Rankine thrust of the fill.`}</Md>
      <Lookup result={[Q, x, H].every(ok) && H > 0 ? <span>m = {f3(x / H)} · P = <b>{f2(r.P)}</b> kN/m at {f2(r.arm)} m above the base</span> : '—'}>
        <select className="field !py-0.5 !text-xs" value={kind} onChange={(e) => setKind(e.target.value as 'point' | 'line')}>
          <option value="point">point load Q (kN)</option>
          <option value="line">line load q (kN/m)</option>
        </select>
        <NumIn label={kind === 'point' ? 'Q' : 'q'} value={Q} onChange={setQ} step={10} w="w-14" />
        <NumIn label="x" value={x} onChange={setX} step={0.5} unit="m" w="w-12" />
        <NumIn label="H" value={H} onChange={setH} step={0.5} unit="m" w="w-12" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- st-wall
function StepsBody() {
  return (
    <Md>{R`**Any wall problem (handnote §5)**
1. Sketch the wall: H, WT, layer boundaries, q, passive soil in front.
2. K for each layer (Ka, Kp or K0 — which formula?).
3. Key depths: top, each interface, the WT, the base.
4. σ′0 at each (γ above the WT, γ′ = γsat − 9.81 below).
5. Soil pressure σ′0K ∓ 2c′√K — twice at each interface.
6. Water u = 9.81 hw (K = 1). Surcharge qK rectangle.
7. Tension? zc; drop the negative zone for the design (after-crack) force.
8. Cut into rectangles and triangles; force = area.
9. Arm above the base = bottom of the piece + h/2 or h/3.
10. Fs = ΣF − Pp; MOT = ΣF·arm − Pp·arm.
11. z̄ = MOT/Fs. Draw all three diagrams **to scale** with values.`}</Md>
  )
}

export const LEP_ITEMS: SmRefItem[] = [
  { id: 'e-ka', group: 'lep', title: 'Ka and Kp vs φ′ (Rankine)', tag: 'handnote tables', keywords: 'active passive coefficient tan2 45 phi rankine', Body: KaBody },
  { id: 'e-k0', group: 'lep', title: 'K0 — the five formulas', tag: 'Das eqs 13.5–13.9, slide 4', keywords: 'at rest Jaky Sherif Mayne Kulhawy Massarsch OCR PI', Body: K0Body },
  { id: 'e-move', group: 'lep', title: 'Wall movement to reach active / passive', tag: 'Das Table 13.1, slide 8', keywords: 'tilt movement delta L H loose dense sand clay', Body: MoveBody },
  { id: 'e-rankine', group: 'lep', title: 'Rankine pressure, crack, pieces table', tag: 'slides 10, 20; handnote', keywords: 'tension crack zc critical height unsupported cut surcharge water pieces arm moment', Body: RankineBody },
  { id: 'e-coulomb', group: 'lep', title: 'Coulomb Ka / Kp, Culmann, sloping backfill', tag: 'flagged', keywords: 'wall friction delta wedge culmann sloping backfill beta', Body: CoulombBody },
  { id: 'e-wallload', group: 'lep', title: 'Lateral pressure from point / line loads', tag: 'flagged', keywords: 'boussinesq terzaghi spangler point load line load wheel surcharge', Body: WallLoadBody },
  { id: 'st-wall', group: 'steps', title: 'Steps: retaining wall pressure problem', keywords: 'earth pressure wall steps checklist', Body: StepsBody },
]
