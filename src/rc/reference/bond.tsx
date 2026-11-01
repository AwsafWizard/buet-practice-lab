// CE 315 code pane — bond, anchorage, splices, cut-off (Nilson Ch. 5/6, ACI 318).

import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { bar, compressionLap, ldcCalc, ldhCalc, ldSimplified, MM_BAR_IDS, standardCutoffs, tableA10, tableA11, US_BAR_IDS } from '../engine/bond'
import { CutoffRulesFig, ftIn, HookFig, StdCutoffFig } from '../topics/bond/figs'
import { useUsed, type RcRefItem } from './pane'

function BarPick({ v, set }: { v: string; set: (s: string) => void }) {
  return (
    <select className="field !py-0.5 !px-1.5 !text-xs" value={v} onChange={(e) => set(e.target.value)}>
      {[...US_BAR_IDS, ...MM_BAR_IDS].map((b) => (
        <option key={b} value={b}>
          {b.startsWith('#') ? `No. ${b.slice(1)}` : b.replace('mm', ' mm')}
        </option>
      ))}
    </select>
  )
}
const Chk = ({ label, v, set }: { label: string; v: boolean; set: (b: boolean) => void }) => (
  <label className="inline-flex items-center gap-1 text-xs">
    <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} />
    <span className="text-mute">{label}</span>
  </label>
)

// ---------------------------------------------------------------- b-ld
function LdBody() {
  const u = useUsed('b-ld')
  const [id, setId] = useState('#8')
  const [fc, setFc] = useState(4000)
  const [fy, setFy] = useState(60000)
  const [top, setTop] = useState(false)
  const [met, setMet] = useState(true)
  const [ex, setEx] = useState(1)
  const b = bar(id)
  const r = ok(fc) && ok(fy) && fc > 0 ? ldSimplified({ db: b.db, small: b.small, fc, fy, met, psiT: top ? 1.3 : 1, excess: ok(ex) ? ex : 1 }) : null
  const cell = (row: 'met' | 'other', col: 'small' | 'large') => (u && u.row === row && u.col === col ? 'font-bold text-accent' : '')
  return (
    <>
      <RT
        head={['Condition', 'No. 6 and smaller', 'No. 7 and larger']}
        rows={[
          [
            'Clear spacing ≥ db, clear cover ≥ db, code-min stirrups along ld — OR clear spacing ≥ 2db and clear cover ≥ db',
            <span className={cell('met', 'small')}>
              <Tex>{`\\dfrac{f_y\\psi_t\\psi_e}{25\\lambda\\sqrt{f'_c}}d_b`}</Tex>
            </span>,
            <span className={cell('met', 'large')}>
              <Tex>{`\\dfrac{f_y\\psi_t\\psi_e}{20\\lambda\\sqrt{f'_c}}d_b`}</Tex>
            </span>,
          ],
          [
            'Other cases',
            <span className={cell('other', 'small')}>
              <Tex>{`\\dfrac{3f_y\\psi_t\\psi_e}{50\\lambda\\sqrt{f'_c}}d_b`}</Tex>
            </span>,
            <span className={cell('other', 'large')}>
              <Tex>{`\\dfrac{3f_y\\psi_t\\psi_e}{40\\lambda\\sqrt{f'_c}}d_b`}</Tex>
            </span>,
          ],
        ]}
        hl={(i) => !!u && (i === 0 ? u.row === 'met' : u.row === 'other')}
        cap="Table 6.1 (ACI Table 25.4.2.3). Uses CLEAR spacing and CLEAR cover. ACI Committee 408 recommends the No. 7-and-larger column for all sizes."
      />
      <Md>{`**General equation (Eq. 6.4, ACI 25.4.2.4)**
$$\\ell_d = \\left(\\frac{3}{40}\\,\\frac{f_y}{\\lambda\\sqrt{f'_c}}\\,\\frac{\\psi_t\\psi_e\\psi_s}{\\left(\\frac{c_b + K_{tr}}{d_b}\\right)}\\right)d_b \\qquad K_{tr} = \\frac{40A_{tr}}{sn}$$
- $(c_b + K_{tr})/d_b \\le 2.5$ (pull-out governs above it); $\\psi_t\\psi_e \\le 1.7$; $\\sqrt{f'_c} \\le 100$ psi.
- $c_b$ = smaller of bar **centre** to nearest face and **half** the centre-to-centre spacing. $K_{tr} = 0$ is always allowed.
- $A_{tr}$: legs crossing the splitting plane (horizontal plane when ½-spacing governs → all legs; cover governs → one leg); $s$ = largest stirrup spacing within ld; $n$ = bars developed along the plane.
- Excess steel: × As,req/As,prov (development only — never for splices). **ld ≥ 12 in.**
- The simplified rows correspond to $(c_b+K_{tr})/d_b = 1.5$ (first row) and $1.0$ (other cases), with $\\psi_s$ built into 25 vs 20.`}</Md>
      <Lookup
        result={
          r ? (
            <span>
              ld/db = <b>{fmt(r.ratio, 1)}</b> → ld = {fmt(r.ld0, 1)} in{r.excess < 1 ? ` × ${fmt(r.excess, 3)} = ${fmt(r.ld, 1)} in` : ''} → use <b>{Math.ceil(r.final - 1e-6)} in</b>
              {r.minGoverns ? ' (12 in minimum)' : ''}
            </span>
          ) : (
            '—'
          )
        }
      >
        <BarPick v={id} set={setId} />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
        <NumIn label="fy" value={fy} onChange={setFy} step={5000} unit="psi" />
        <NumIn label="As,req/As,prov" value={ex} onChange={setEx} step={0.05} w="w-16" />
        <Chk label="top bar" v={top} set={setTop} />
        <Chk label="first row met" v={met} set={setMet} />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- b-psi
function PsiBody() {
  const u = useUsed('b-psi')
  const rows: [string, string, string, (u: Record<string, number | string>) => boolean][] = [
    ['ψt casting position', 'More than 12 in of fresh concrete below the bar (top bars)', '1.3', (u) => u.t === 1.3],
    ['ψt', 'Other', '1.0', (u) => u.t === 1],
    ['ψe coating', 'Epoxy, clear cover < 3db or clear spacing < 6db', '1.5', (u) => u.e === 1.5],
    ['ψe', 'Other epoxy-coated', '1.2', (u) => u.e === 1.2],
    ['ψe', 'Uncoated or galvanized', '1.0', (u) => u.e === 1],
    ['ψt·ψe', 'Upper limit on the product', '1.7', (u) => u.cap === 1],
    ['ψs bar size', 'No. 6 and smaller (Eq. 6.4 only)', '0.8', (u) => u.s === 0.8],
    ['ψs', 'No. 7 and larger', '1.0', (u) => u.s === 1],
    ['λ', 'Lightweight concrete', '0.75', (u) => u.l === 0.75],
    ['λ', 'Normalweight concrete', '1.0', (u) => u.l === 1],
  ]
  return (
    <RT
      head={['Factor', 'Condition', 'Value']}
      rows={rows.map((r) => [r[0], r[1], r[2]])}
      hl={(i) => !!u && rows[i][3](u)}
      cap="Straight bars in tension (Eq. 6.4 and Table 6.1). Top bars: bleed water and air collect under the bar → weaker bond. Epoxy: no adhesion, less friction."
    />
  )
}

// ---------------------------------------------------------------- b-hook
function HookBody() {
  const u = useUsed('b-hook')
  const [id, setId] = useState('#8')
  const [fc, setFc] = useState(4000)
  const [fy, setFy] = useState(60000)
  const [c, setC] = useState(false)
  const [rr, setRr] = useState(false)
  const b = bar(id)
  const r = ok(fc) && fc > 0 && ok(fy) ? ldhCalc({ db: b.db, fc, fy, psiC: c ? 0.7 : 1, psiR: rr ? 0.8 : 1 }) : null
  const rows: [string, string, string, (u: Record<string, number | string>) => boolean][] = [
    ['ψe', 'Epoxy or zinc-epoxy coated', '1.2', (u) => u.e === 1.2],
    ['ψe', 'Uncoated or galvanized', '1.0', (u) => u.e === 1],
    ['ψc cover', 'No. 11 and smaller, side cover ≥ 2.5 in, and (90°) tail cover ≥ 2 in', '0.7', (u) => u.c === 0.7],
    ['ψc', 'Other', '1.0', (u) => u.c === 1],
    ['ψr confinement', 'No. 11 and smaller, hook enclosed by ties/stirrups at s ≤ 3db', '0.8', (u) => u.r === 0.8],
    ['ψr', 'Other (incl. the Fig. 6.11 discontinuous end with side & top cover < 2.5 in)', '1.0', (u) => u.r === 1],
    ['λ', 'Lightweight / normalweight', '0.75 / 1.0', () => false],
    ['Excess steel', 'As,req/As,prov', '≤ 1.0', () => false],
  ]
  return (
    <>
      <Md>{`$$\\ell_{dh} = \\left(\\frac{f_y\\,\\psi_e\\psi_c\\psi_r}{50\\lambda\\sqrt{f'_c}}\\right)d_b \\;\\ge\\; 8d_b \\text{ and } 6\\text{ in}$$
(Eq. 6.6 — the slides' ACI 318-11/14 form, $0.02 f_y/\\sqrt{f'_c}$; the 2019 code changed it, the class does not use that.) ldh is measured from the critical section to the **outside** of the hook. Must fit in column depth − cover.`}</Md>
      <RT head={['Factor', 'Condition', 'Value']} rows={rows.map((r) => [r[0], r[1], r[2]])} hl={(i) => !!u && rows[i][3](u)} />
      <HookFig />
      <RT
        head={['Bar size', 'Min. inside bend dia.', 'Cover side of bend']}
        rows={[
          ['No. 3–8', '6db (stirrups/ties No. 3–5: 4db)', '4db'],
          ['No. 9, 10, 11', '8db', '5db'],
          ['No. 14, 18', '10db', '6db'],
        ]}
        hl={(i) => !!u && typeof u.no === 'number' && (i === 0 ? u.no <= 8 : i === 1 ? u.no >= 9 && u.no <= 11 : u.no > 11)}
      />
      <Lookup
        result={
          r ? (
            <span>
              basic {fmt(r.basic, 2)} in × {fmt(r.factor, 2)} = {fmt(r.ld0, 2)} in; min {fmt(r.min, 2)} in → ldh = <b>{fmt(r.final, 2)} in</b> (use {Math.ceil(r.final - 1e-6)} in)
            </span>
          ) : (
            '—'
          )
        }
      >
        <BarPick v={id} set={setId} />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
        <NumIn label="fy" value={fy} onChange={setFy} step={5000} unit="psi" />
        <Chk label="ψc = 0.7" v={c} set={setC} />
        <Chk label="ψr = 0.8" v={rr} set={setRr} />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- b-ldc
function LdcBody() {
  const u = useUsed('b-ldc')
  const [id, setId] = useState('#9')
  const [fc, setFc] = useState(4000)
  const [fy, setFy] = useState(60000)
  const [conf, setConf] = useState(false)
  const b = bar(id)
  const r = ok(fc) && fc > 0 && ok(fy) ? ldcCalc({ db: b.db, fc, fy, confined: conf }) : null
  return (
    <>
      <Md>{`$$\\ell_{dc} = \\max\\left(\\frac{f_y\\psi_r}{50\\lambda\\sqrt{f'_c}}d_b,\\; 0.0003f_y\\psi_r d_b\\right) \\ge 8\\text{ in}$$
- $\\psi_r$ = 0.75 for spiral ≥ ¼ in at pitch ≤ 4 in, or No. 4 ties at ≤ 4 in; else 1.0. Excess steel × As,req/As,prov.
- Shorter than tension: no flexural tension cracks along the bar, and part of the force goes by end bearing.`}</Md>
      <RT
        head={['Factor', 'Condition', 'Value']}
        rows={[
          ['ψr', 'Spiral ≥ ¼ in at ≤ 4 in pitch, or No. 4 ties at ≤ 4 in', '0.75'],
          ['ψr', 'Other', '1.0'],
        ]}
        hl={(i) => !!u && (i === 0 ? u.r === 0.75 : u.r === 1)}
      />
      <Lookup
        result={
          r ? (
            <span>
              {fmt(r.a, 2)} vs {fmt(r.b, 2)} → basic {fmt(r.basic, 2)} in{conf ? ` × 0.75 = ${fmt(r.ld, 2)} in` : ''} → ldc = <b>{fmt(r.final, 2)} in</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <BarPick v={id} set={setId} />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
        <NumIn label="fy" value={fy} onChange={setFy} step={5000} unit="psi" />
        <Chk label="confined (×0.75)" v={conf} set={setConf} />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- b-splice
function SpliceBody() {
  const u = useUsed('b-splice')
  const [id, setId] = useState('#8')
  const [fy, setFy] = useState(60000)
  const [fc, setFc] = useState(4000)
  const b = bar(id)
  const r = ok(fy) && ok(fc) && fc > 0 ? compressionLap({ db: b.db, fy, fc }) : null
  return (
    <>
      <div className="text-xs font-bold text-mute">Tension lap splices (ACI 25.5.2)</div>
      <RT
        head={['As,prov / As,req over the splice', '≤ 50 % of bars spliced within the lap', 'More than 50 % spliced']}
        rows={[
          ['≥ 2', 'Class A: lst = 1.0 ld', 'Class B: lst = 1.3 ld'],
          ['< 2', 'Class B: lst = 1.3 ld', 'Class B: lst = 1.3 ld'],
        ]}
        hl={(i) => !!u && (u.cls === 'A' ? i === 0 : u.ratio2 === 1 ? i === 0 : i === 1)}
        cap="ld with all ψ factors but WITHOUT As,req/As,prov. lst ≥ 12 in (for Class B the 12 in applies to 1.3 ld). No lap splices for bars larger than No. 11. Bundles: +20 % (3 bars), +33 % (4 bars)."
      />
      <div className="text-xs font-bold text-mute mt-2">Compression lap splices (ACI 25.5.5)</div>
      <Md>{`- $f_y \\le 60{,}000$: $\\ell_{sc} = 0.0005f_yd_b$; $f_y > 60{,}000$: $\\ell_{sc} = (0.0009f_y - 24)d_b$; **≥ 12 in**. $f'_c < 3000$ psi → + ⅓.
- Different sizes: larger of **ldc of the larger bar** and **lsc of the smaller bar**.
- Tied column with effective tie area ≥ 0.0015hs both ways → × 0.83; spiral column → × 0.75 (still ≥ 12 in).`}</Md>
      <div className="text-xs font-bold text-mute mt-2">Column splices (ACI 10.7.5)</div>
      <Md>{`- Bar stress compression (factored loads): compression lap as above (end-bearing allowed if staggered or extra bars; continuing bars in each face ≥ 0.25 fy As of that face in tension).
- Tension ≤ 0.5 fy: Class A if ≤ ½ the bars are spliced at a section and alternate splices are staggered by ld; otherwise Class B.
- Tension > 0.5 fy: Class B.
- Spirals lap 48db (uncoated) / 72db (epoxy). Splice columns just above the floor, or at mid-height in lateral-load frames (moments are lowest there).`}</Md>
      <Lookup
        result={
          r ? (
            <span>
              lsc = {r.formula.replace(/_/g, '').replace(/\\/g, '')} = {fmt(r.base, 2)} in{r.low ? ` × 4/3 = ${fmt(r.lsc0, 2)}` : ''} → <b>{fmt(r.lsc, 2)} in</b> (before the 0.83 / 0.75 factors)
            </span>
          ) : (
            '—'
          )
        }
      >
        <BarPick v={id} set={setId} />
        <NumIn label="fy" value={fy} onChange={setFy} step={5000} unit="psi" />
        <NumIn label="f′c" value={fc} onChange={setFc} step={500} unit="psi" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- b-cutoff
function CutoffBody() {
  const u = useUsed('b-cutoff')
  const [L, setL] = useState(20)
  const s = ok(L) && L > 0 ? standardCutoffs(L) : null
  return (
    <>
      <Md>{`**ACI rules (Fig. 5.19 / ACI 9.7.3)**
- Extend every bar **max(d, 12db)** past its theoretical cut-off point (except at simple supports and the free end of cantilevers).
- Continuing bars: at least **ld** beyond the point where the cut bars are no longer needed (where the continuing bars become fully stressed).
- Cut bars: at least **ld** from the point of maximum stress.
- **Positive steel:** ≥ ⅓ of +As (simple spans) / ¼ (continuous) runs **6 in** into the support. At simple supports and inflection points, $\\ell_d \\le 1.3M_n/V_u + \\ell_a$.
- **Negative steel:** ≥ ⅓ of −As extends past the inflection point by **max(d, 12db, ln/16)**; anchored into the support by ld, hook or head.
- Do not cut bars in a tension zone unless (one of): Vu ≤ ⅔ φVn; extra stirrups Av ≥ 60bws/fyt at s ≤ d/(8βb) over ¾d from the cut; or continuing bars (≤ No. 11) give 2 × As required and Vu ≤ ¾ φVn.
- Why not cut at the theoretical point: after diagonal cracking the steel force at a section follows the moment at a section closer to midspan; actual moments differ from the design diagram (load approximations, settlement, lateral load).`}</Md>
      <CutoffRulesFig />
      <div className="text-xs font-bold text-mute mt-2">Standard cut-off / bend points — approximately equal spans, UDL (Fig. 5.20)</div>
      <StdCutoffFig L1={u && typeof u.L === 'number' ? u.L : s ? L : undefined} />
      <Lookup
        result={
          s ? (
            <span>
              top bars L/3 = {ftIn(s.topInterior)} (interior), L/4 = {ftIn(s.topExterior)} (exterior); ½ bottom bars stop L/8 = {ftIn(s.bottomCut)} from the faces; bend points L/4 = {ftIn(s.bendInterior)}, L/7 = {ftIn(s.bendExterior)}; rest 6 in into the support
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="clear span L" value={L} onChange={setL} step={1} unit="ft" />
      </Lookup>
    </>
  )
}

// ---------------------------------------------------------------- b-a10
function A10Body() {
  const u = useUsed('b-a10')
  const fcs = [4000, 5000, 6000]
  const groups: { top: boolean; met: boolean; label: string }[] = [
    { top: false, met: true, label: 'Bottom bars — spacing, cover, ties per case a or b' },
    { top: false, met: false, label: 'Bottom bars — other cases' },
    { top: true, met: true, label: 'Top bars — spacing, cover, ties per case a or b' },
    { top: true, met: false, label: 'Top bars — other cases' },
  ]
  const rows: { g: (typeof groups)[0]; fy: number }[] = groups.flatMap((g) => [40, 50, 60].map((fy) => ({ g, fy })))
  return (
    <RT
      groups={[
        ['', 2],
        ['No. 6 and smaller', 3],
        ['No. 7 and larger', 3],
      ]}
      head={['Bars', 'fy (ksi)', ...fcs.map((f) => `${f}`), ...fcs.map((f) => `${f}`)]}
      rows={rows.map((r) => [r.fy === 40 ? r.g.label : '', r.fy, ...fcs.map((f) => tableA10(f, r.fy, true, r.g.top, r.g.met)), ...fcs.map((f) => tableA10(f, r.fy, false, r.g.top, r.g.met))])}
      hl={(i) => !!u && rows[i].fy === u.fy && (rows[i].g.top ? 1 : 0) === u.top && (rows[i].g.met ? 1 : 0) === u.met}
      cap="Nilson Table A.10: simplified tension ld/db, uncoated bars, normalweight concrete (f′c in psi). Case a: clear spacing ≥ db, clear cover ≥ db, code-minimum stirrups throughout ld. Case b: clear spacing ≥ 2db, clear cover ≥ db. Multiply by db, then by As,req/As,prov."
    />
  )
}

// ---------------------------------------------------------------- b-a11
function A11Body() {
  const u = useUsed('b-a11')
  const fcs = [3000, 4000, 5000, 6000]
  const nos = [3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 18]
  const rows = nos.flatMap((no) => [40, 50, 60].map((fy) => ({ no, fy })))
  return (
    <RT
      groups={[['', 2], ...fcs.map((f) => [`f′c = ${f}`, 2] as [string, number])]}
      head={['Bar', 'fy (ksi)', ...fcs.flatMap(() => ['Basic', 'Confined'])]}
      rows={rows.map((r) => [r.fy === 40 ? `No. ${r.no}` : '', r.fy, ...fcs.flatMap((f) => {
        const t = tableA11(r.no, f, r.fy)
        return [t.basic, t.confined]
      })])}
      hl={(i) => !!u && rows[i].no === u.no && rows[i].fy === u.fy}
      cap="Nilson Table A.11: compression ldc in inches, normalweight concrete; ldc = greater of (0.02fy/√f′c)db and 0.0003fy db; ≥ 8 in. Confined = × 0.75 (spiral or No. 4 ties at ≤ 4 in)."
    />
  )
}

// ---------------------------------------------------------------- st-bond
function StepsBody() {
  return (
    <Md>{`**Any development problem (handnote routine)**
- 1. Tension or compression? Straight, hook, head or lap?
- 2. List db, Ab, √f′c (≤ 100 psi).
- 3. Geometry: CLEAR spacing & cover for Table 6.1; CENTRE distances (cb) for Eq. 6.4.
- 4. Factors with caps: ψt (top > 12 in), ψe (1.5 / 1.2), ψtψe ≤ 1.7, ψs, λ; hooks ψc, ψr; compression ψr.
- 5. Compute ld / ldh / ldc.
- 6. × As,req/As,prov (development only, never laps).
- 7. Minimums: ld ≥ 12 in, ldh ≥ max(8db, 6 in), ldc ≥ 8 in, splices ≥ 12 in.
- 8. Compare with the length available (column depth − cover) and round UP.

**Cut-off**
- 1. wu, Mu diagram. 2. φMn of the bars that continue. 3. x where Mu = φMn (theoretical). 4. + max(d, 12db). 5. Cut bars ≥ ld from max stress; continuing bars ≥ ld past the theoretical point. 6. ≥ ⅓ (¼) of +As 6 in into the support; ≥ ⅓ of −As past the IP by max(d, 12db, ln/16).

**Splice**
- Tension: ld (no excess factor) → Class A only if As,prov ≥ 2As,req AND ≤ 50 % spliced → 1.0ld / 1.3ld ≥ 12 in.
- Compression: lsc (smaller bar) vs ldc (larger bar), +⅓ if f′c < 3000, × 0.83 tied (0.0015hs) / 0.75 spiral.`}</Md>
  )
}

export const BOND_ITEMS: RcRefItem[] = [
  { id: 'b-ld', group: 'bond', title: 'Development length in tension — simplified & general', tag: 'Table 6.1 · Eq. 6.4', keywords: 'ld development length straight bar tension 25 20 cb Ktr confinement', Body: LdBody },
  { id: 'b-psi', group: 'bond', title: 'ψ and λ modification factors', tag: 'ACI 25.4.2.5', keywords: 'psi top bar epoxy lightweight lambda size factor', Body: PsiBody },
  { id: 'b-hook', group: 'bond', title: 'Hooked bars: ldh and hook geometry', tag: 'Eq. 6.6 · ACI 25.3', keywords: 'hook ldh standard hook 90 180 bend diameter 12db', Body: HookBody },
  { id: 'b-ldc', group: 'bond', title: 'Development in compression', tag: 'Eq. 6.10', keywords: 'ldc compression column dowel', Body: LdcBody },
  { id: 'b-splice', group: 'bond', title: 'Lap splices: Class A/B, compression, column', tag: 'ACI 25.5', keywords: 'splice lap class A class B column splice compression lap', Body: SpliceBody },
  { id: 'b-cutoff', group: 'bond', title: 'Bar cut-off and bend points', tag: 'Fig. 5.19 / 5.20', keywords: 'cutoff cut-off bend point curtail d 12db inflection standard detail', Body: CutoffBody },
  { id: 'b-a10', group: 'bond', title: 'Table A.10 — simplified ld/db', tag: 'Nilson A.10', exam: true, keywords: 'table a10 ld/db', Body: A10Body },
  { id: 'b-a11', group: 'bond', title: 'Table A.11 — compression ldc (in)', tag: 'Nilson A.11', exam: true, keywords: 'table a11 compression', Body: A11Body },
  { id: 'st-bond', group: 'steps', title: 'Bond, anchorage & cut-off — steps', keywords: 'checklist development length steps', Body: StepsBody },
]

