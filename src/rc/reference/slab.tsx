// CE 315 code pane — slabs (one-way ACI coefficients, two-way Tables 12.3–12.6, thickness, T&S, DDM) + step checklists.
import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Seg, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { hminOneWay, HMIN_DIV, HMIN_LABEL, tsBars, tsRatio, type HminRule } from '../engine/oneway'
import { bracketRows, CASE_COUNTS, CASE_TEXT, coef, ddmColumnStrip, hTwoWay, loadShare, M_ROWS, T123, T124, T125, T126, type DdmKind, type SlabCase, type TableId } from '../engine/twoway'
import { useUsed, type RcRefItem } from './pane'

const CASES: SlabCase[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** case pictogram: long edges drawn top/bottom, hatched = continuous (as in Nilson's tables) */
export function CasePict({ cs, w = 34, active = false }: { cs: SlabCase; w?: number; active?: boolean }) {
  const h = w * 0.68
  const [nL, nS] = CASE_COUNTS[cs]
  // which edges are continuous for the pictogram
  const top = nL >= 1
  const bottom = nL === 2
  const left = nS >= 1
  const right = nS === 2
  const p = 3
  const hatch = (x1: number, y1: number, x2: number, y2: number, out: [number, number]) => {
    const n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 4))
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      return <line key={i} x1={x} y1={y} x2={x + out[0] * 3 + out[1] * 1.5} y2={y + out[1] * 3 - out[0] * 1.5} stroke="currentColor" strokeWidth={0.9} />
    })
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={active ? 'text-accent' : 'text-mute'} aria-label={`Case ${cs}`}>
      <rect x={p} y={p} width={w - 2 * p} height={h - 2 * p} fill="none" stroke="currentColor" strokeWidth={1} />
      {top && hatch(p, p, w - p, p, [0, -1])}
      {bottom && hatch(p, h - p, w - p, h - p, [0, 1])}
      {left && hatch(p, p, p, h - p, [-1, 0])}
      {right && hatch(w - p, p, w - p, h - p, [1, 0])}
    </svg>
  )
}

const c3 = (v: number | null) => (v === null ? '–' : v.toFixed(3).replace(/^0/, ''))

/** full 9-case table with pictograms; highlights the case column and the m row(s) a lab used */
function CoefTable({ t, refId }: { t: TableId | 't126'; refId: string }) {
  const used = useUsed(refId)
  const ucs = used ? (+used.case as SlabCase) : null
  const um = used ? +used.m : null
  const rows = um !== null ? bracketRows(um) : []
  const T = t === 't123' ? T123 : t === 't124' ? T124 : t === 't125' ? T125 : null
  const [cs, setCs] = useState<SlabCase>(4)
  const [m, setM] = useState(0.8)
  const mOk = ok(m) && m >= 0.5 && m <= 1
  const look = t === 't126' ? (mOk ? loadShare(cs, m) : null) : mOk ? coef(t, cs, m) : null
  return (
    <>
      <div className="overflow-x-auto scroll-thin">
        <table className="tbl ref-tbl text-[11px]">
          <thead>
            <tr>
              <th>m</th>
              {CASES.map((k) => (
                <th key={k} className={'!text-center ' + (k === ucs ? 'text-accent' : '')}>
                  <div className="flex flex-col items-center gap-0.5">
                    <CasePict cs={k} w={28} active={k === ucs} />
                    <span>{k}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M_ROWS.map((mv, i) => (
              <tr key={mv} className={rows.includes(i) ? 'hl' : undefined}>
                <td className="txt num">{mv.toFixed(2)}</td>
                {CASES.map((k) => {
                  const on = k === ucs && rows.includes(i)
                  return (
                    <td key={k} className={'num !text-center leading-tight ' + (on ? 'font-bold text-accent' : '')}>
                      {T ? (
                        <>
                          <div>{c3(T[i][k - 1][0])}</div>
                          <div className="text-mute">{c3(T[i][k - 1][1])}</div>
                        </>
                      ) : (
                        T126[i][k - 1].toFixed(2)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-faint mt-1 leading-snug">
        {T ? 'Each cell: Ca (top) / Cb (below); "–" = not applicable. ' : 'Wa = share of W carried in the short direction; Wb = 1 − Wa. '}
        Hatched edge = slab continues across or is fixed at the support; plain edge = support with negligible torsional resistance. Long edges drawn top/bottom. m = la/lb (clear spans, la short). Interpolate linearly.
        {used && (
          <>
            {' '}
            <b className="text-accent">
              Lab: Case {ucs}, m = {fmt(um!, 3)}
            </b>
          </>
        )}
      </div>
      <Lookup
        result={
          look ? (
            'Wa' in look ? (
              <>
                Case {cs}, m = {fmt(m, 3)}: Wa = <b>{look.Wa.toFixed(3)}</b>, Wb = <b>{look.Wb.toFixed(3)}</b>
              </>
            ) : (
              <>
                Case {cs}, m = {fmt(m, 3)}: Ca = <b>{look.a === null ? '–' : look.a.toFixed(4)}</b>, Cb = <b>{look.b === null ? '–' : look.b.toFixed(4)}</b>
              </>
            )
          ) : (
            'm must be between 0.50 and 1.00 (m < 0.5 → one-way)'
          )
        }
      >
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">Case</span>
          <select className="field !py-0.5 !px-1.5 !text-xs" value={cs} onChange={(e) => setCs(+e.target.value as SlabCase)}>
            {CASES.map((k) => (
              <option key={k} value={k}>
                {k} — {CASE_TEXT[k]}
              </option>
            ))}
          </select>
        </label>
        <NumIn label="m = la/lb" value={m} onChange={setM} step={0.01} w="w-16" />
      </Lookup>
    </>
  )
}

function T123Body() {
  return (
    <>
      <Tex block>{`M_{a,neg} = C_{a,neg}\\,w\\,l_a^2,\\quad M_{b,neg} = C_{b,neg}\\,w\\,l_b^2\\quad (w = \\text{total factored } D + L)`}</Tex>
      <CoefTable t="t123" refId="sl-t123" />
      <div className="text-[11px] text-faint mt-1">Negative moments at CONTINUOUS edges. At a discontinuous edge use ⅓ of the positive moment in that direction.</div>
    </>
  )
}
function T124Body() {
  return (
    <>
      <Tex block>{`M_{a,pos,dl} = C_{a,dl}\\,w_D\\,l_a^2,\\quad M_{b,pos,dl} = C_{b,dl}\\,w_D\\,l_b^2\\quad (w_D = 1.2D)`}</Tex>
      <CoefTable t="t124" refId="sl-t124" />
    </>
  )
}
function T125Body() {
  return (
    <>
      <Tex block>{`M_{a,pos,ll} = C_{a,ll}\\,w_L\\,l_a^2,\\quad M_{b,pos,ll} = C_{b,ll}\\,w_L\\,l_b^2\\quad (w_L = 1.6L)`}</Tex>
      <CoefTable t="t125" refId="sl-t125" />
      <div className="text-[11px] text-faint mt-1">LL coefficients are larger: live load may sit on this panel with the neighbours empty (checkerboard), so its edges rotate more. Total +M = DL part + LL part.</div>
    </>
  )
}
function T126Body() {
  return (
    <>
      <Md>{`Load per ft on each **long** support $= W_a W/(2l_b)$, on each **short** support $= W_b W/(2l_a)$, $W = w_u l_a l_b$. The larger is the slab shear per ft, compared with $\\phi V_c = 0.75 \\times 2\\sqrt{f'_c}\\times 12\\,d$.`}</Md>
      <CoefTable t="t126" refId="sl-t126" />
    </>
  )
}

// ---------------------------------------------------------------- one-way ACI coefficients
const ACI_ROWS: [string, string, string][] = [
  ['p11', 'Positive, end span — discontinuous end unrestrained (brick wall)', '+1/11'],
  ['p14', 'Positive, end span — discontinuous end integral with support', '+1/14'],
  ['p16', 'Positive, interior spans', '+1/16'],
  ['n9', 'Negative, exterior face of first interior support — two spans', '−1/9'],
  ['n10', 'Negative, exterior face of first interior support — more than two spans', '−1/10'],
  ['n11', 'Negative, other faces of interior supports', '−1/11'],
  ['n12', 'Negative, faces of all supports, slabs with spans ≤ 10 ft', '−1/12'],
  ['n24', 'Negative, interior face of exterior support — spandrel beam / girder', '−1/24'],
  ['n16', 'Negative, interior face of exterior support — column', '−1/16'],
  ['v115', 'Shear, end member at face of first interior support', '1.15 wu ln/2'],
  ['v1', 'Shear, faces of all other supports', 'wu ln/2'],
]

function CoefDiagram({ many }: { many: boolean }) {
  const W = 300
  const n = many ? 3 : 2
  const L = (W - 20) / n
  const xs = Array.from({ length: n + 1 }, (_, i) => 10 + i * L)
  const top = many ? ['1/24', '1/10', '1/11', '1/10', '1/24'] : ['1/24', '1/9', '1/24']
  const pos = many ? ['1/14', '1/16', '1/14'] : ['1/14', '1/14']
  return (
    <svg viewBox={`0 0 ${W} 62`} className="w-full h-auto max-w-sm">
      <line x1={10} x2={W - 10} y1={34} y2={34} stroke="var(--c-ink)" strokeWidth={3} />
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y={36} width={8} height={10} fill="var(--c-panel2)" stroke="var(--c-mute)" />
          <text x={x} y={22} fontSize={9} textAnchor="middle" fill="var(--c-bad)" className="num">
            −{top[i]}
          </text>
        </g>
      ))}
      {pos.map((p, i) => (
        <text key={i} x={xs[i] + L / 2} y={58} fontSize={9} textAnchor="middle" fill="var(--c-good)" className="num">
          +{p}
        </text>
      ))}
      <text x={W / 2} y={9} fontSize={9} textAnchor="middle" fill="var(--c-faint)">
        {many ? 'more than two spans (spandrel ends)' : 'two spans (spandrel ends)'}
      </text>
    </svg>
  )
}

function AciBody() {
  const used = useUsed('sl-aci')
  const keys = used ? String(used.keys).split('|') : []
  const [den, setDen] = useState(9)
  const [w, setW] = useState(300)
  const [ln, setLn] = useState(15)
  const Mu = ok(w) && ok(ln) ? ((w / 1000) * ln * ln) / den : NaN
  return (
    <>
      <Md>{`$M_u = C\\,w_u\\,l_n^2$, $V_u = C_v w_u l_n/2$ — $l_n$ = clear span; for **negative** moment at an interior support use the **average** of the two adjacent clear spans. Valid for ≥ 2 spans, larger ≤ 1.2 × smaller, UDL, $L \\le 3D$, prismatic.`}</Md>
      <RT head={['Location', 'C']} rows={ACI_ROWS.map((r) => [r[1], r[2]])} hl={(i) => keys.includes(ACI_ROWS[i][0])} cap="Slabs with cantilevers are NOT covered — use statics with live-load patterns." />
      <div className="grid grid-cols-1 gap-1 mt-1">
        <CoefDiagram many={false} />
        <CoefDiagram many />
      </div>
      <Lookup result={ok(Mu) ? <>M_u = {fmt(w / 1000, 3)} × {fmt(ln)}² / {den} = <b>{fmt(Mu, 2)} k-ft/ft</b></> : '—'}>
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">C</span>
          <select className="field !py-0.5 !px-1.5 !text-xs" value={den} onChange={(e) => setDen(+e.target.value)}>
            {[8, 9, 10, 11, 12, 14, 16, 24].map((d) => (
              <option key={d} value={d}>
                1/{d}
              </option>
            ))}
          </select>
        </label>
        <NumIn label="w_u" value={w} onChange={setW} step={5} unit="psf" w="w-16" />
        <NumIn label="l_n" value={ln} onChange={setLn} step={0.5} unit="ft" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- thickness
const RULES: HminRule[] = ['ss', 'one', 'both', 'cant']
function HminBody() {
  const used = useUsed('sl-hmin')
  const urules = used ? String(used.rules).split('|') : []
  const [l, setL] = useState(14)
  const [fy, setFy] = useState(60)
  return (
    <>
      <RT head={['Non-prestressed one-way slab', 'h_min']} rows={RULES.map((r) => [HMIN_LABEL[r], `l/${HMIN_DIV[r]}`])} hl={(i) => urules.includes(RULES[i])} />
      <Md>{`Normal-weight concrete, $f_y = 60$ ksi. Other $f_y$: × $(0.4 + f_y/100{,}000)$. Lightweight (90–115 pcf): × $(1.65 - 0.005w_c) \\ge 1.09$. The class uses the **clear** span and rounds up (h > 6 in → next ½ in, else ¼ in). Slab with cantilever(s): span rule l/24 (one overhang) or l/28 (two), and the cantilever needs l/10 — take the larger.`}</Md>
      <Lookup
        result={
          ok(l) && ok(fy) ? (
            <span>
              {RULES.map((r) => (
                <span key={r} className="mr-3">
                  l/{HMIN_DIV[r]}: <b>{fmt(hminOneWay(l, r, fy * 1000), 2)}</b> in
                </span>
              ))}
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="l" value={l} onChange={setL} step={0.5} unit="ft" w="w-14" />
        <NumIn label="f_y" value={fy} onChange={setFy} step={5} unit="ksi" w="w-14" />
      </Lookup>
    </>
  )
}

function H2wayBody() {
  const used = useUsed('sl-h2way')
  const [la, setLa] = useState(20)
  const [lb, setLb] = useState(25)
  const [fy, setFy] = useState(60)
  const r = ok(la) && ok(lb) && la > 0 && lb > 0 && ok(fy) ? hTwoWay(Math.min(la, lb), Math.max(la, lb), fy * 1000) : null
  return (
    <>
      <Tex block>{`h = \\frac{l_n\\,(0.8 + f_y/200{,}000)}{36 + 9\\beta}\\ \\ge 3.5\\text{ in}\\qquad (\\alpha_m > 2.0)`}</Tex>
      <Md>{`$l_n$ = **long** clear span (in), $\\beta$ = long / short clear span, $\\alpha_m$ = average of $\\alpha = E_{cb}I_b/(E_{cs}I_s)$ of the edge beams (Nilson eq. 13.8b, printed in Jan 2021). Old method (slides): $h = \\text{perimeter}/180 \\ge 3.5$ in. The coefficient method itself needs stiff edge beams (depth ≳ 3h) or walls.`}</Md>
      {used && (
        <div className="text-[11px] text-accent font-bold">
          Lab: la = {used.la} ft, lb = {used.lb} ft → h = {used.h} in
        </div>
      )}
      <Lookup result={r ? <>β = {fmt(r.beta, 3)} · h = <b>{fmt(r.raw, 2)} in</b> → use {r.use} in · perimeter/180 = {fmt(r.perim, 2)} in</> : '—'}>
        <NumIn label="l_a" value={la} onChange={setLa} step={0.5} unit="ft" w="w-14" />
        <NumIn label="l_b" value={lb} onChange={setLb} step={0.5} unit="ft" w="w-14" />
        <NumIn label="f_y" value={fy} onChange={setFy} step={5} unit="ksi" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- T&S
function TsBody() {
  const used = useUsed('sl-ts')
  const [fy, setFy] = useState(60)
  const [h, setH] = useState(6)
  const r = ok(fy) && ok(h) && h > 0 ? tsBars(fy * 1000, h) : null
  const ufy = used ? +used.fy : null
  return (
    <>
      <RT
        head={['Steel', 'A_s,min = ρ b h']}
        rows={[
          ['Grade 40 or 50 deformed bars', '0.0020'],
          ['Grade 60 deformed bars or welded wire fabric', '0.0018'],
          ['f_y > 60 ksi (at ε = 0.35 %)', '0.0018 × 60 000/f_y ≥ 0.0014'],
        ]}
        hl={(i) => ufy !== null && (i === 0 ? ufy < 60000 : i === 1 ? ufy === 60000 : ufy > 60000)}
      />
      <Md>{`On the **gross** area $b \\times h$. Spacing of T&S bars $\\le 5h$ and 18 in. In slabs the **minimum flexural steel** is the same ratio (main bars $\\le 3h$, 18 in one-way; $\\le 2h$ at critical sections two-way). Placed perpendicular to the main bars (one-way); in two-way slabs both directions already carry ≥ this.`}</Md>
      <Lookup result={r ? <>ρ = {tsRatio(fy * 1000)} → A_s = <b>{fmt(r.As, 3)} in²/ft</b> → #3: {fmt(r.raw, 2)} in → <b>#3 @ {r.s} in c/c</b> (max {fmt(r.smax, 2)} in)</> : '—'}>
        <NumIn label="f_y" value={fy} onChange={setFy} step={10} unit="ksi" w="w-14" />
        <NumIn label="h" value={h} onChange={setH} step={0.25} unit="in" w="w-14" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- DDM Table 13.4
function T134Body() {
  const [kind, setKind] = useState<DdmKind>('intNeg')
  const [r, setR] = useState(1.2)
  const [aL, setAL] = useState(1)
  const [bt, setBt] = useState(0)
  const pct = ok(r) && ok(aL) && ok(bt) ? ddmColumnStrip(kind, r, aL, bt) : NaN
  return (
    <>
      <RT
        groups={[['', 2], ['l₂/l₁', 3]]}
        head={['Moment', 'Condition', '0.5', '1.0', '2.0']}
        rows={[
          ['Interior negative', 'αf1 l₂/l₁ = 0', 75, 75, 75],
          ['', 'αf1 l₂/l₁ ≥ 1', 90, 75, 45],
          ['Exterior negative', 'αf1 l₂/l₁ = 0, βt = 0', 100, 100, 100],
          ['', 'αf1 l₂/l₁ = 0, βt ≥ 2.5', 75, 75, 75],
          ['', 'αf1 l₂/l₁ ≥ 1, βt = 0', 100, 100, 100],
          ['', 'αf1 l₂/l₁ ≥ 1, βt ≥ 2.5', 90, 75, 45],
          ['Positive', 'αf1 l₂/l₁ = 0', 60, 60, 60],
          ['', 'αf1 l₂/l₁ ≥ 1', 90, 75, 45],
        ]}
        cap="Column-strip moment, % of the total moment at the critical section (Direct Design Method, Nilson Table 13.4). Not in the slides — only Jan 2021 prints it."
      />
      <Md>{`$M_o = w_u l_2 l_n^2/8$; interior span: $-0.65M_o$, $+0.35M_o$. The middle strip takes the rest. With $\\alpha_{f1}l_2/l_1 \\ge 1$ the beam takes 85 % of the column-strip moment.`}</Md>
      <Lookup result={ok(pct) ? <>column strip = <b>{fmt(pct, 1)} %</b>, middle strip = {fmt(100 - pct, 1)} %</> : '—'}>
        <Seg
          size="xs"
          value={kind}
          onChange={setKind}
          items={[
            { v: 'intNeg', label: 'int −' },
            { v: 'extNeg', label: 'ext −' },
            { v: 'pos', label: '+' },
          ]}
        />
        <NumIn label="l₂/l₁" value={r} onChange={setR} step={0.1} w="w-14" />
        <NumIn label="αf1 l₂/l₁" value={aL} onChange={setAL} step={0.1} w="w-14" />
        {kind === 'extNeg' && <NumIn label="βt" value={bt} onChange={setBt} step={0.5} w="w-14" />}
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- step checklists
function StepsOneWay() {
  return (
    <Md>{`**A. Continuous slab (ACI coefficients)**
1. One-way? supported on two opposite sides, or $l_b/l_a \\ge 2$.
2. $h$: end span $l_n/24$, interior $l_n/28$ (× $0.4 + f_y/10^5$); round up. $d = h - 1$.
3. Loads on a 1-ft strip: self-wt $(h/12)150$ + FF + PW; $w_u = 1.2D + 1.6L$ (k/ft).
4. Coefficients from the end supports: spandrel −1/24, column −1/16, brick wall none (+1/11 in span); 2 spans −1/9, more −1/10 then −1/11; +1/14, +1/16.
5. Depth check with $\\rho_{0.005}$.
6. $A_s$ at every section (iterate $a$); compare with $0.0018bh$.
7. $s = A_b \\times 12/A_s$, round down to ½ in, ≤ 3h, 18 in.
8. Bottom bars alt. cranked; extra top $= A_s(2s)/12 - A_b$ → bars (or the spacing form). T&S bars ⊥ (≤ 5h, 18 in).
9. Shear: $1.15w_ul_n/2 - w_ud$ vs $\\phi V_c$.
10. Sketch: section + plan with a legend.

**B. Slab with cantilever(s) (statics)**
1. Strip as a beam with overhangs; $L$ = c/c, $a$ = cantilever from the face.
2. $h$ = max(span $l/24$ or $l/28$, cantilever $l/10$).
3. $-M_u = w_ua^2/2$ (LL on the cantilever).
4. $+M_u$: LL on the span only, DL on the cantilever(s).
5. Uplift: DL on span, full load on cantilevers → top steel through the span if $M < 0$.
6. Steel, cranked bars into the cantilever + extra top, T&S; shear at $d$.`}</Md>
  )
}
function StepsTwoWay() {
  return (
    <Md>{`1. Clear spans, $l_a \\le l_b$, $m = l_a/l_b$; two-way if $l_b/l_a < 2$. Case 1–9 from the continuous edges.
2. $h = l_n(0.8 + f_y/200{,}000)/(36 + 9\\beta) \\ge 3.5$ in; round up. $d = h - 1$ (short), $h - 1.5$ (long +).
3. $w_D = 1.2D$, $w_L = 1.6L$, $w_u$.
4. $M_{a,neg}, M_{b,neg}$ (Table 12.3, total $w_u$) at continuous edges.
5. $M_{a,pos} = C_{a,dl}w_Dl_a^2 + C_{a,ll}w_Ll_a^2$ (Tables 12.4 + 12.5); same for $b$.
6. Discontinuous edges: $-M = \\tfrac13 (+M)$.
7. $A_s$ for each moment, $\\ge 0.0018bh$, $s \\le 2h$.
8. Middle strip: bottom @ $s$ alt. cranked + extra top. Column strips @ $1.5s$ (≤ 2h, ≥ $A_{s,min}$); column-strip top = ⅔ middle-strip top.
9. Corner steel at exterior corners: max +ve steel, top & bottom, both ways, over $l_b/5$.
10. Table 12.6 → loads on beams; shear check. Plan sketch with legend.`}</Md>
  )
}

export const SLAB_ITEMS: RcRefItem[] = [
  { id: 'sl-aci', group: 'slab', title: 'ACI moment & shear coefficients (one-way)', tag: 'Table 12.1', exam: true, keywords: 'coefficient 1/24 1/14 1/9 1/10 1/11 1/16 continuous one-way slab beam shear 1.15', Body: AciBody },
  { id: 'sl-hmin', group: 'slab', title: 'One-way slab minimum thickness', tag: 'ACI Table 7.3.1.1', keywords: 'thickness l/20 l/24 l/28 l/10 deflection cantilever', Body: HminBody },
  { id: 'sl-ts', group: 'slab', title: 'Temperature & shrinkage steel (= slab As,min)', tag: 'ACI 24.4.3', keywords: 'temperature shrinkage 0.0018 0.0020 minimum steel 5h 18 distribution', Body: TsBody },
  { id: 'sl-t123', group: 'slab', title: 'Table 12.3 — negative moment coefficients', tag: 'Table 12.3', exam: true, keywords: 'two-way coefficient negative ca cb case', Body: T123Body },
  { id: 'sl-t124', group: 'slab', title: 'Table 12.4 — dead-load positive moments', tag: 'Table 12.4', exam: true, keywords: 'two-way coefficient positive dead load', Body: T124Body },
  { id: 'sl-t125', group: 'slab', title: 'Table 12.5 — live-load positive moments', tag: 'Table 12.5', exam: true, keywords: 'two-way coefficient positive live load', Body: T125Body },
  { id: 'sl-t126', group: 'slab', title: 'Table 12.6 — load share Wa / Wb (shear, beams)', tag: 'Table 12.6', exam: true, keywords: 'wa wb load beams shear two-way ratio', Body: T126Body },
  { id: 'sl-h2way', group: 'slab', title: 'Two-way slab minimum thickness', tag: 'eq. 13.8b', keywords: 'two-way thickness alpha m beta perimeter 180 36 9 beta', Body: H2wayBody },
  { id: 'sl-t134', group: 'slab', title: 'DDM column-strip moments (old paper)', tag: 'Table 13.4', keywords: 'direct design method column strip middle strip mo 0.65 0.35', Body: T134Body },
  { id: 'st-oneway', group: 'steps', title: 'Steps — one-way slab', keywords: 'recipe one-way slab cantilever coefficient', Body: StepsOneWay },
  { id: 'st-twoway', group: 'steps', title: 'Steps — two-way slab (coefficient method)', keywords: 'recipe two-way slab case corner', Body: StepsTwoWay },
]
