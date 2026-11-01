import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { shearAt, shearLimits, type ShearCase } from '../engine/shear'
import { threshold, torsionSection } from '../engine/torsion'
import { useUsed, type RcRefItem } from './pane'

// ---------------------------------------------------------------- s-vc
function VcBody() {
  const used = useUsed('s-vc')
  const [fc, setFc] = useState(4000)
  const [bw, setBw] = useState(12)
  const [d, setD] = useState(20)
  const k = ok(fc) && ok(bw) && ok(d) && fc > 0 ? shearLimits({ bw, d, fc, fy: 60000 }) : null
  return (
    <>
      <Md>{`$$V_c = 2\\lambda\\sqrt{f'_c}\\,b_wd\\quad(\\text{lb; } f'_c\\text{ in psi}),\\qquad \\phi = 0.75$$
- $\\sqrt{f'_c} \\le 100$ psi (f'c ≤ 10 000 psi) in every shear equation.
- Detailed form (book only): $V_c = (1.9\\lambda\\sqrt{f'_c} + 2500\\rho_w V_ud/M_u)b_wd \\le 3.5\\lambda\\sqrt{f'_c}b_wd$, $V_ud/M_u \\le 1$.
- **Redesign** if $V_s > 8\\sqrt{f'_c}b_wd$, i.e. $V_u > \\phi 10\\sqrt{f'_c}b_wd$ (λ = 1).
- Older papers (ACI before 2002): φ = 0.85 for shear.`}</Md>
      <RT
        head={['Concrete', 'λ']}
        rows={[
          ['Normal weight', '1.0'],
          ['Sand-lightweight', '0.85'],
          ['All-lightweight', '0.75'],
        ]}
        hl={(i) => i === 0 && !!used}
      />
      <RT
        head={['Critical section for Vu', 'where']}
        rows={[
          ['Beam on a bearing (reaction compresses the end), load on top', 'd from the face'],
          ['Beam framing into a column (compression)', 'd from the face'],
          ['Point load within d of the face', 'at the face'],
          ['Load hung from the bottom (tension at the support region)', 'at the face'],
          ['Beam supported by a girder of similar depth', 'at the face'],
          ['Support element in tension', 'at the face'],
        ]}
        cap="Fig 5.12. Inside d hold Vu at its value at d (Vu,d = Vface − wu·d for a UDL)."
      />
      <Lookup
        result={
          k ? (
            <span>
              V_c = {fmt(k.Vc, 2)} k · φV_c = <b>{fmt(k.phiVc, 2)}</b> k · φV_c/2 = {fmt(k.halfPhiVc, 2)} k · φ4√f′c·bd = {fmt(k.phiVs4, 2)} · φ8√f′c·bd = {fmt(k.phiVs8, 2)} · Vu,max = {fmt(k.VuMax, 2)} k
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
        <NumIn label="b_w" value={bw} onChange={setBw} step={1} unit="in" w="w-14" />
        <NumIn label="d" value={d} onChange={setD} step={0.5} unit="in" w="w-14" />
      </Lookup>
      {used && (
        <div className="text-[11px] text-faint mt-1">
          Lab: f′c = {used.fc} psi, b_w = {used.bw} in, d = {used.d} in → φV_c = {used.phiVc} k
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------- s-cases
const CASES: ShearCase[] = ['A', 'B', 'C', 'D', 'redesign']
function CasesBody() {
  const used = useUsed('s-cases')
  const [Vu, setVu] = useState(50)
  const [fc, setFc] = useState(4000)
  const [bw, setBw] = useState(10)
  const [d, setD] = useState(20)
  const [Av, setAv] = useState(0.22)
  const sec = { bw, d, fc, fy: 60000, Av }
  const good = [Vu, fc, bw, d, Av].every(ok) && fc > 0 && bw > 0 && d > 0
  const a = good ? shearAt(Vu, sec) : null
  return (
    <>
      <RT
        head={['Case', 'Condition', 'Av/s', 's_max', 'final s']}
        rows={[
          ['A, very low shear', 'Vu ≤ φVc/2', 'none', '—', '—'],
          ['B, low shear', 'φVc/2 < Vu ≤ φVc', 'max(0.75√f′c bw/fy, 50bw/fy)', 'd/2, 24 in', 'min(d/2, 24, s)'],
          ['C, high shear', 'Vu > φVc, Vs ≤ 4√f′c bw d', 'max[(Vu−φVc)/(φfy d), 0.75√f′c bw/fy, 50bw/fy]', 'd/2, 24 in', 'min(d/2, 24, s)'],
          ['D, very high shear', '4√f′c bw d < Vs ≤ 8√f′c bw d', 'same as C', 'd/4, 12 in', 'min(d/4, 12, s)'],
          ['Redesign', 'Vs > 8√f′c bw d (Vu > φ10√f′c bw d)', '—', '—', 'enlarge section'],
        ]}
        hl={(i) => !!used && CASES[i] === used.case}
        cap="Class slides 47–50 (Table 8.5.4.5). With Vc = 2√f′c bw d: A ≤ 0.5φVc < B ≤ φVc < C ≤ 3φVc < D ≤ 5φVc. Units: (Vu − φVc)/(φ fy d) with Vu in kip → fy in ksi; min-steel terms with √f′c and fy in psi."
      />
      <Md>{`Spacing: $s = \\dfrac{A_v}{A_v/s} = \\dfrac{\\phi A_vf_{yt}d}{V_u - \\phi V_c}$. #3 two-legged stirrup $A_v$ = 0.22 in² (4 legs 0.44). Round s down (to ½ in or the inch); practical minimum 3 in → use #4 or 4 legs. First stirrup at s/2 (or 2 in) from the face.`}</Md>
      <Lookup
        result={
          a ? (
            <span>
              Case <b>{a.case}</b>
              {a.case !== 'A' && a.case !== 'redesign' && (
                <>
                  {' '}
                  · Av/s = {fmt(a.avs, 4)} in²/in · s = {fmt(a.sCalc, 2)} in · s_max = {fmt(a.sMax, 2)} in → <b>s = {fmt(a.s, 2)} in</b>
                </>
              )}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="Vu" value={Vu} onChange={setVu} step={1} unit="k" w="w-16" />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
        <NumIn label="b_w" value={bw} onChange={setBw} step={1} unit="in" w="w-14" />
        <NumIn label="d" value={d} onChange={setD} step={0.5} unit="in" w="w-14" />
        <NumIn label="A_v" value={Av} onChange={setAv} step={0.11} unit="in²" w="w-16" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- s-avmin
const FCS = [3000, 3500, 4000, 4500, 5000, 6000]
function AvMinBody() {
  const used = useUsed('s-avmin')
  return (
    <>
      <Md>{`$$A_{v,\\min} = 0.75\\sqrt{f'_c}\\,\\frac{b_ws}{f_{yt}} \\ \\ge\\ 50\\,\\frac{b_ws}{f_{yt}}\\qquad(\\text{psi})$$
Required wherever $V_u > \\tfrac12\\phi V_c$. The 50 term governs for f'c below 4444 psi. Inverted: $s_{\\max} = A_vf_{yt}/(0.75\\sqrt{f'_c}b_w) \\le A_vf_{yt}/(50b_w)$.`}</Md>
      <RT
        head={["f′c (psi)", '0.75√f′c', 'governs', 's for #3×2, bw = 12, fy 60 (in)']}
        rows={FCS.map((fc) => {
          const t = 0.75 * Math.sqrt(fc)
          return [fc, fmt(t, 1), t > 50 ? '0.75√f′c' : '50', fmt((0.22 * 60000) / (Math.max(t, 50) * 12), 1)]
        })}
        hl={(i) => !!used && FCS[i] === used.fc}
      />
    </>
  )
}

// ---------------------------------------------------------------- s-tth
const TTH_CASES = ['solid', 'solid-axial', 'hollow', 'hollow-axial', 'prestressed']
function TthBody() {
  const used = useUsed('s-tth')
  const [b, setB] = useState(12)
  const [h, setH] = useState(20)
  const [fc, setFc] = useState(4000)
  const th = [b, h, fc].every(ok) && b > 0 && h > 0 && fc > 0 ? threshold(torsionSection({ shape: 'rect', bw: b, h }), { fc }) : null
  return (
    <>
      <Md>{`$$T_{cr} = 4\\lambda\\sqrt{f'_c}\\,\\frac{A_{cp}^2}{p_{cp}}\\ \\text{(in-lb)},\\qquad \\text{neglect torsion if } T_u \\le \\phi T_{th},\\ T_{th} = \\tfrac14T_{cr},\\ \\phi = 0.75$$`}</Md>
      <RT
        head={['Member', 'T_th (in-lb)']}
        rows={[
          ['Solid, no axial load', <Tex key="a">{`\\lambda\\sqrt{f'_c}\\,A_{cp}^2/p_{cp}`}</Tex>],
          ['Solid, axial Nu (+ comp.)', <Tex key="b">{`\\lambda\\sqrt{f'_c}\\frac{A_{cp}^2}{p_{cp}}\\sqrt{1 + \\frac{N_u}{4A_g\\lambda\\sqrt{f'_c}}}`}</Tex>],
          ['Hollow, no axial load', <Tex key="c">{`\\lambda\\sqrt{f'_c}\\,A_g^2/p_{cp}`}</Tex>],
          ['Hollow, axial Nu', <Tex key="d">{`\\lambda\\sqrt{f'_c}\\frac{A_g^2}{p_{cp}}\\sqrt{1 + \\frac{N_u}{4A_g\\lambda\\sqrt{f'_c}}}`}</Tex>],
          ['Prestressed (beyond slides)', <Tex key="e">{`\\lambda\\sqrt{f'_c}\\frac{A_{cp}^2}{p_{cp}}\\sqrt{1 + \\frac{f_{pc}}{4\\lambda\\sqrt{f'_c}}}`}</Tex>],
        ]}
        hl={(i) => !!used && TTH_CASES[i] === used.case}
        cap="A_cp = area inside the outside perimeter, p_cp = outside perimeter, A_g = concrete area of a hollow section (p_cp still the outside). in-lb ÷ 12 000 = ft-kip."
      />
      <Md>{`**Flanges** (T, L, inverted): overhang counted on each side = min(h_w, 4h_f), h_w = projection of the beam above or below the slab. Use the flanges only if they increase $A_{cp}^2/p_{cp}$ (ACI 9.2.4.4, handnote side rule).
**Compatibility torsion** (beyond slides, ACI 22.7.3.2): Tu may be reduced to φTcr.`}</Md>
      <Lookup result={th ? <span>Rectangle: Acp²/pcp = {fmt((b * h) ** 2 / (2 * (b + h)), 1)} in³ · Tcr = {fmt(th.Tcr, 2)} · Tth = {fmt(th.Tth, 2)} · <b>φTth = {fmt(th.phiTth, 2)} ft-k</b></span> : '—'}>
        <NumIn label="b" value={b} onChange={setB} step={1} unit="in" w="w-14" />
        <NumIn label="h" value={h} onChange={setH} step={1} unit="in" w="w-14" />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- steps
function StShear() {
  return (
    <Md>{`1. Factored loads (1.2D + 1.6L; add 1.2 × self-weight if the UDL excludes it). Reactions → **SFD**.
2. **Vu at d** from the support face (Vface − wu·d), unless a point load is within d.
3. $\\phi V_c = \\phi 2\\lambda\\sqrt{f'_c}b_wd$; also φVc/2, φ4√f'c·bd, φ8√f'c·bd. Vu > φ10√f'c·bd → redesign.
4. Mark on the SFD where Vu = φVc and Vu = φVc/2 (similar triangles) and every point-load jump.
5. For each region: φVs = Vu − φVc → **Case A/B/C/D**.
6. $A_v/s = \\max\\left[\\frac{V_u-\\phi V_c}{\\phi f_yd}, \\frac{0.75\\sqrt{f'_c}b_w}{f_y}, \\frac{50b_w}{f_y}\\right]$ ("max governs").
7. s = Av/(Av/s) with #3 two-legged (0.22 in²); **final s = min(s, d/2, 24 in)** (Case D: d/4, 12 in). Round down.
8. Zones ("3 sets of spacing"): s at d near the support, an intermediate spacing, then s_max; end each zone where the next spacing becomes enough.
9. First stirrup at s/2 or 2 in; count stirrups per zone; total length check.
10. **Sketch**: beam elevation, "1 @ 2 in, 7 @ 5 in, 2 @ 7 in, 4 @ 11 in", mirrored; write "#3 two-legged stirrups".`}</Md>
  )
}
function StTorsion() {
  return (
    <Md>{`1. Sketch the section: web bw × h, slab hf, overhang, eccentricity.
2. Split loads: on the beam centreline (web self-weight, line loads, slab load over the web) and off-centre (overhang).
3. Factor each (1.2D + 1.6L); e = bw/2 + overhang/2 from the beam centreline.
4. wu = centreline + overhang; tu = overhang load × e.
5. At the face: Vu = wu L/2, Tu = tu L/2 (both ends restrained); at d multiply by (L/2 − d)/(L/2).
6. Overhang counted = min(hw, 4hf, available); Acp, pcp with and without flanges, use the larger Acp²/pcp.
7. $\\phi T_{th} = 0.75\\lambda\\sqrt{f'_c}A_{cp}^2/p_{cp}$ (÷ 12 000 → ft-k); axial / hollow forms if needed.
8. Tu,d ≤ φTth → **neglect torsion**; else torsion steel needed (design not in syllabus). Say whether it is equilibrium (must design for full Tu) or compatibility torsion.`}</Md>
  )
}

export const SHEAR_ITEMS: RcRefItem[] = [
  { id: 's-vc', group: 'shear', title: 'Vc, φ, λ and the critical section', tag: 'ACI 22.5.5.1, 9.4.3.2', keywords: 'Vc 2 sqrt fc bw d lambda phi 0.75 critical section d from face shear strength concrete', Body: VcBody },
  { id: 's-cases', group: 'shear', title: 'Case A–D table: Av/s and maximum spacing', tag: 'Table 8.5.4.5 / class slides', exam: false, keywords: 'stirrup spacing smax d/2 24 d/4 12 Av/s case A B C D very low low high very high shear redesign', Body: CasesBody },
  { id: 's-avmin', group: 'shear', title: 'Minimum shear reinforcement Av,min', tag: 'ACI 9.6.3', keywords: 'Av min 0.75 sqrt fc 50 bw s fyt minimum stirrups', Body: AvMinBody },
  { id: 's-tth', group: 'shear', title: 'Torsion: Tcr and threshold Tth (4 cases)', tag: 'ACI 22.7.4.1', keywords: 'torsion threshold Tth Tcr Acp pcp flange overhang 4hf hollow axial neglect', Body: TthBody },
  { id: 'st-shear', group: 'steps', title: 'Steps: stirrup design (Case method)', keywords: 'shear stirrup design steps zones sketch', Body: StShear },
  { id: 'st-torsion', group: 'steps', title: 'Steps: check threshold torsion', keywords: 'torsion threshold steps spandrel eccentric', Body: StTorsion },
]
