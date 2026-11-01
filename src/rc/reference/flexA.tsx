// CE 315 code pane — flexure A: ρ limits (Table A.4 style), stress block & β1, elastic formulas, WSD allowables,
// and the step checklists for elastic analysis and singly reinforced beams.

import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Seg, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { allowableMoment, uncracked, wsdParams } from '../engine/elastic'
import { beta1, rhoLimits } from '../engine/materials'
import { StrainLimits } from '../topics/singly/charts'
import { useUsed, type RcRefItem } from './pane'

const FCS = [3000, 4000, 5000, 6000, 7000, 8000]
const FYS = [40000, 60000, 75000]

function Rho() {
  const used = useUsed('f-rho')
  const [fc, setFc] = useState(4)
  const [fy, setFy] = useState(60)
  const L = ok(fc) && ok(fy) && fc > 0 && fy > 0 ? rhoLimits(fc * 1000, fy * 1000) : null
  const rows: (string | number)[][] = []
  const keys: [number, number][] = []
  for (const y of FYS)
    for (const c of FCS) {
      const l = rhoLimits(c, y)
      rows.push([`${y / 1000} / ${c / 1000}`, fmt(l.b1, 3), fmt(l.rhoB, 4), fmt(l.rhoMax, 4), fmt(l.rho005, 4), fmt(l.rhoMin, 4)])
      keys.push([y, c])
    }
  return (
    <>
      <RT
        head={['fy / f′c (ksi)', 'β₁', 'ρ_b', 'ρ_max (εt = 0.004)', 'ρ_0.005', 'ρ_min']}
        rows={rows}
        hl={(i) => used !== undefined && keys[i][0] === used.fy && keys[i][1] === used.fc}
        cap="Singly reinforced rectangular sections. ρ_min = max(3√f′c, 200)/fy. Over ρ_0.005 → φ < 0.9; over ρ_max → not allowed for a beam (add A′s)."
      />
      <Md>{`$$\\rho = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{\\varepsilon_u}{\\varepsilon_u + \\varepsilon_t}:\\quad \\varepsilon_t = \\varepsilon_y \\to \\rho_b,\\ 0.004 \\to \\rho_{max},\\ 0.005 \\to \\rho_{0.005}$$`}</Md>
      <Lookup
        result={
          L ? (
            <span>
              β₁ = {fmt(L.b1, 3)} · ρ_b = <b>{fmt(L.rhoB, 4)}</b> · ρ_max = <b>{fmt(L.rhoMax, 4)}</b> · ρ_0.005 = <b>{fmt(L.rho005, 4)}</b> · ρ_min = <b>{fmt(L.rhoMin, 5)}</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="f′c" value={fc} onChange={setFc} step={0.5} unit="ksi" w="w-14" />
        <NumIn label="fy" value={fy} onChange={setFy} step={5} unit="ksi" w="w-14" />
      </Lookup>
    </>
  )
}

function Block() {
  const used = useUsed('f-block')
  return (
    <>
      <Md>{`Whitney block: uniform $0.85f'_c$ over depth $a = \\beta_1 c$ (ACI 22.2.2.4).
$$C = 0.85f'_c\\,ab = T = A_sf_y \\Rightarrow a = \\frac{A_sf_y}{0.85f'_cb},\\quad c = \\frac{a}{\\beta_1}$$
$$M_n = A_sf_y\\left(d - \\frac a2\\right) = \\rho f_y bd^2\\left(1 - 0.59\\frac{\\rho f_y}{f'_c}\\right),\\quad \\varepsilon_t = 0.003\\frac{d_t - c}{c}$$
Design: $R_n = \\dfrac{M_u}{\\phi bd^2}$, $\\rho = \\dfrac{0.85f'_c}{f_y}\\left(1 - \\sqrt{1 - \\dfrac{2R_n}{0.85f'_c}}\\right)$. If $\\varepsilon_s < \\varepsilon_y$ (over-reinforced): $0.85f'_cb\\beta_1c^2 + 87A_sc - 87A_sd = 0$ (ksi).`}</Md>
      <RT head={["f′c (psi)", '≤ 4000', '5000', '6000', '7000', '≥ 8000']} rows={[['β₁', '0.85', '0.80', '0.75', '0.70', '0.65']]} hl={() => used !== undefined} cap="β₁ = 0.85 − 0.05(f′c − 4000)/1000, between 0.65 and 0.85." />
      <div className="mt-2 text-xs text-mute">Neutral-axis limits (Grade 60):</div>
      <StrainLimits />
    </>
  )
}

function Elastic() {
  const [v, setV] = useState({ b: 14, h: 21, d: 18.5, As: 3.16, fc: 6, n: 7 })
  const set = (k: keyof typeof v) => (x: number) => setV({ ...v, [k]: x })
  const good = Object.values(v).every((x) => ok(x) && x > 0) && v.d < v.h
  const sec = { b: v.b, h: v.h, d: v.d, As: v.As, fc: v.fc * 1000, n: Math.round(v.n) }
  const u = good ? uncracked(sec) : null
  const c = good ? allowableMoment(sec, 0.45 * v.fc, 24) : null
  return (
    <>
      <Md>{`**Uncracked (M ≤ M_cr)** — transformed area $(n-1)A_s$ at the steel (also $(n-1)A'_s$):
$$\\bar y = \\frac{\\sum A y}{\\sum A},\\quad I_{ut} = \\frac{bh^3}{12} + bh\\left(\\bar y - \\tfrac h2\\right)^2 + (n-1)A_s(d - \\bar y)^2$$
$$M_{cr} = \\frac{f_rI_{ut}}{y_t}\\ \\ (\\text{gross: } f_r\\tfrac{bh^2}{6}),\\quad f_s = n f_c(y),\\ \\ f = \\frac{My}{I}$$
**Cracked (M > M_cr)** — concrete below the N.A. ignored, steel $nA_s$:
$$\\frac{b(kd)^2}{2} = nA_s(d - kd) \\Rightarrow k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n,\\quad j = 1 - \\frac k3$$
$$I_{cr} = \\frac{b(kd)^3}{3} + nA_s(d - kd)^2,\\quad f_c = \\frac{2M}{kjbd^2} = \\frac{M\\,kd}{I_{cr}},\\quad f_s = \\frac{M}{A_sjd} = \\frac{nM(d - kd)}{I_{cr}}$$
With compression steel (WSD): add $(2n-1)A'_s$ at $d'$; $f'_s = 2n f_c\\frac{kd - d'}{kd} \\le f_s$.`}</Md>
      <Lookup
        result={
          u && c ? (
            <span>
              ȳ = {fmt(u.ybar, 2)}, I_ut = {fmt(u.I, 0)} → M_cr = <b>{fmt(u.Mcr, 1)}</b> k-ft (gross {fmt(u.McrG, 1)}); kd = <b>{fmt(c.kd, 2)}</b>, I_cr = <b>{fmt(c.Icr, 0)}</b>; M_all(0.45f′c, 24 ksi) = <b>{fmt(c.M, 1)}</b> k-ft ({c.governs})
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="b" value={v.b} onChange={set('b')} step={1} w="w-12" />
        <NumIn label="h" value={v.h} onChange={set('h')} step={1} w="w-12" />
        <NumIn label="d" value={v.d} onChange={set('d')} step={0.5} w="w-14" />
        <NumIn label="A_s" value={v.As} onChange={set('As')} step={0.01} w="w-14" />
        <NumIn label="f′c" value={v.fc} onChange={set('fc')} step={0.5} unit="ksi" w="w-12" />
        <NumIn label="n" value={v.n} onChange={set('n')} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

function Wsd() {
  const used = useUsed('f-wsd')
  const [fc, setFc] = useState(4)
  const [fs, setFs] = useState(24)
  const [n, setN] = useState(8)
  const [k, setK] = useState<'045' | '04'>('045')
  const fca = (k === '045' ? 0.45 : 0.4) * fc
  const p = ok(fc) && ok(fs) && ok(n) && fc > 0 && fs > 0 ? wsdParams(Math.round(n), fca, fs) : null
  return (
    <>
      <RT
        head={['Allowable stress (ACI alternate design, WSD)', 'Value']}
        rows={[
          ['Concrete, flexural compression f_c', "0.45 f′c"],
          ['Steel, Grade 40 or 50', '20 ksi'],
          ['Steel, Grade 60 and higher', '24 ksi'],
          ['Some papers: steel', '0.4 fy (= 24 ksi for Grade 60)'],
          ['Compression steel (doubly)', "f′s = 2n f_c (kd − d′)/kd ≤ f_s"],
          ['Modular ratio', 'n = Es/Ec, nearest whole number'],
        ]}
        hl={(i) => (used?.row !== undefined ? used.row === i : false)}
      />
      <Md>{`Balanced WSD design: $k = \\dfrac{n}{n + f_s/f_c}$, $j = 1 - \\dfrac k3$, $R = \\tfrac12 f_ckj$, $d = \\sqrt{\\dfrac{M}{Rb}}$, $A_s = \\dfrac{M}{f_sjd}$, balanced-stress ratio $\\rho = \\dfrac{f_ck}{2f_s}$.`}</Md>
      <Lookup result={p ? <Tex>{`f_c = ${fmt(fca, 3)}:\\ k = ${fmt(p.k, 3)},\\ j = ${fmt(p.j, 3)},\\ R = ${fmt(p.R * 1000, 0)}\\text{ psi},\\ \\rho_{bal} = ${fmt(p.rhoBal, 4)}`}</Tex> : '—'}>
        <Seg size="xs" value={k} onChange={setK} items={[{ v: '045', label: '0.45f′c' }, { v: '04', label: '0.40f′c' }]} />
        <NumIn label="f′c" value={fc} onChange={setFc} step={0.5} unit="ksi" w="w-12" />
        <NumIn label="f_s" value={fs} onChange={setFs} step={1} unit="ksi" w="w-12" />
        <NumIn label="n" value={n} onChange={setN} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

const StElastic = () => (
  <Md>{`### Elastic analysis (service loads)
1. $n = E_s/E_c$ (round), $f_r = 7.5\\sqrt{f'_c}$ psi — or use the given values.
2. Uncracked transformed section: $(n-1)A_s$ → $\\bar y$, $I_{ut}$, $y_t = h - \\bar y$.
3. $M_{cr} = f_rI_{ut}/y_t$ (say whether gross or transformed).
4. Just before cracking: $f_s = n f_r (d - \\bar y)/y_t$, $\\varepsilon_s = f_s/E_s$.
5. Given M: if $M \\le M_{cr}$ → $f = My/I_{ut}$; else cracked.
6. Cracked: $\\rho n$ → $k$, $kd$, $j$, $I_{cr}$.
7. Stresses: $f_c = M\\,kd/I_{cr}$, $f_s = nM(d - kd)/I_{cr}$.
8. Allowable M: $M_c = f_{c,all}I_{cr}/kd$, $M_s = f_{s,all}I_{cr}/[n(d - kd)]$ → the smaller governs.
9. Sketch strain (linear) and stress (triangle) with the numbers on.`}</Md>
)

const StSingly = () => (
  <Md>{`### Review (find φMn)
1. $A_s$, $d$ (centroid), $d_t$ (lowest layer), $\\rho = A_s/bd$.
2. $a = A_sf_y/0.85f'_cb$, $c = a/\\beta_1$.
3. $\\varepsilon_t = 0.003(d_t - c)/c$ → φ (0.9 / 0.483 + 83.3εt / 0.65). Check $\\varepsilon_s \\ge \\varepsilon_y$ at $d$ (else quadratic for c).
4. $M_n = A_sf_y(d - a/2)$, $\\phi M_n$.
5. Checks: $A_s \\ge A_{s,min}$; $\\varepsilon_t \\ge 0.004$.

### Design As (b, d known)
1. Loads: self-weight + SDL, $w_u = 1.2D + 1.6L$, $M_u$.
2. $d = h - 2.5$ (one layer) / $h - 3.5$ (two layers).
3. $R_n = M_u/\\phi bd^2$ with φ = 0.9 → ρ → $A_s = \\rho bd$ (or iterate on a, guess a = 0.2d).
4. $\\rho_{min} \\le \\rho \\le \\rho_{max}$ (if > ρmax → doubly).
5. Pick bars, check the fit (one layer?), recompute a, c, εt with the bars chosen.

### Design b × d (free section)
1. Choose ρ (≈ 0.5–0.6ρmax for economy, ρ_0.005 for minimum size).
2. $R = \\rho f_y(1 - 0.59\\rho f_y/f'_c)$, $bd^2 = M_u/\\phi R$.
3. Pick b (or d/b ≈ 1.5–2.5) → d → h = d + 2.5 rounded up; redo As for the actual d.`}</Md>
)

export const FLEXA_ITEMS: RcRefItem[] = [
  { id: 'f-rho', group: 'flex', title: 'Steel-ratio limits ρ_b, ρ_max, ρ_0.005, ρ_min', tag: 'Table A.4', exam: true, keywords: 'rho balanced maximum minimum 0.004 0.005', Body: Rho },
  { id: 'f-block', group: 'flex', title: 'Equivalent stress block, β₁, Mn', tag: 'ACI 22.2', keywords: 'whitney a beta1 0.85 stress block Mn', Body: Block },
  { id: 'f-elastic', group: 'flex', title: 'Uncracked / cracked transformed section', tag: 'Nilson 4.2', keywords: 'Mcr Icr kd transformed modular ratio elastic', Body: Elastic },
  { id: 'f-wsd', group: 'flex', title: 'WSD allowable stresses and k, j, R', tag: 'ACI App. B (old)', keywords: 'working stress allowable 0.45 fs 24 20 k j R', Body: Wsd },
  { id: 'st-elastic', group: 'steps', title: 'Steps — elastic analysis & allowable moment', keywords: 'checklist Mcr cracked', Body: StElastic },
  { id: 'st-singly', group: 'steps', title: 'Steps — singly reinforced review & design', keywords: 'checklist review design As', Body: StSingly },
]

void beta1
