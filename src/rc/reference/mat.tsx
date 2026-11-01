// CE 315 code pane — materials & bars: bar tables (# and mm), As per foot, φ factors + φ–εt chart,
// load combinations, cover & spacing, and the β1 / Ec / fr / n table.

import { useState } from 'react'
import { fmt } from '../../components/DiagramView'
import { Md, Seg, Tex } from '../../components/ui'
import { Lookup, NumIn, ok, RT } from '../../reference/common'
import { barFit } from '../engine/singly'
import { BARS, beta1, Ec, fr, MM_BARS, phiFlex, wu as wuOf } from '../engine/materials'
import { PhiChart } from '../topics/singly/charts'
import { useUsed, type RcRefItem } from './pane'

const US = [3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 18]
const MM = [10, 12, 16, 20, 22, 25, 28, 32]

function Bars() {
  const used = useUsed('m-bars')
  const [n, setN] = useState(4)
  const [bar, setBar] = useState(8)
  return (
    <>
      <RT
        head={['Bar', 'd_b (in)', 'A (in²)', '2 bars', '3', '4', '5', '6']}
        rows={US.map((k) => [`#${k}`, BARS[k].d, BARS[k].A, ...[2, 3, 4, 5, 6].map((m) => fmt(m * BARS[k].A, 2))])}
        hl={(i) => String(used?.bar) === String(US[i])}
        cap="ASTM A615 bars: #n has diameter ≈ n/8 in (#9 and up slightly larger). Weight 3.4 A lb/ft."
      />
      <div className="mt-2" />
      <RT head={['mm bar', 'd_b (in)', 'A (in²)', 'A (mm²)']} rows={MM.map((m) => [`${m} mm`, fmt(MM_BARS[m].d, 3), fmt(MM_BARS[m].A, 3), fmt((Math.PI * m * m) / 4, 0)])} hl={(i) => used?.bar === `${MM[i]}mm`} cap="Some papers give mm bars with US units (e.g. 2020-21 Q8(b)): convert d_b = mm / 25.4." />
      <Lookup result={<span>{n} #{bar} → A_s = <b>{fmt(n * BARS[bar].A, 3)} in²</b></span>}>
        <NumIn label="n" value={n} onChange={setN} step={1} w="w-12" />
        <NumIn label="#" value={bar} onChange={(v) => setBar(BARS[v] ? v : 8)} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

const SP = [3, 4, 4.5, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18]
const SB = [3, 4, 5, 6, 7, 8]
function AsFt() {
  const used = useUsed('m-asft')
  const [AsReq, setAsReq] = useState(0.3)
  const [bar, setBar] = useState(4)
  const smax = ok(AsReq) && AsReq > 0 && BARS[bar] ? (12 * BARS[bar].A) / AsReq : NaN
  return (
    <>
      <RT head={['s (in)', ...SB.map((b) => `#${b}`)]} rows={SP.map((s) => [s, ...SB.map((b) => fmt((12 * BARS[b].A) / s, 2))])} hl={(i) => used?.s === SP[i]} cap="As per foot of slab width = A_bar × 12 / s (in²/ft)." />
      <Lookup result={ok(smax) ? <span>#{bar} at s ≤ <b>{fmt(smax, 2)} in</b> (round down to ½ in)</span> : '—'}>
        <NumIn label="A_s req" value={AsReq} onChange={setAsReq} step={0.01} unit="in²/ft" w="w-16" />
        <NumIn label="#" value={bar} onChange={setBar} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

function Phi() {
  const used = useUsed('m-phi')
  const [e, setE] = useState(0.0046)
  const epsT = typeof used?.epsT === 'number' ? used.epsT : ok(e) ? e : undefined
  return (
    <>
      <RT
        head={['Strength condition', 'φ (ACI 318-14/19)', 'old (ACI ≤ 99)']}
        rows={[
          ['Flexure, tension-controlled (εt ≥ 0.005)', '0.90', '0.90'],
          ['Compression-controlled, tied (εt ≤ εy)', '0.65', '0.70'],
          ['Compression-controlled, spiral', '0.75', '0.75'],
          ['Transition (Grade 60)', '0.483 + 83.3εt', '—'],
          ['Shear and torsion', '0.75', '0.85'],
          ['Bearing on concrete', '0.65', '0.70'],
        ]}
        hl={(i) => (used?.row !== undefined ? used.row === i : false)}
        cap="Load factors 1.4D + 1.7L went with the old φ (pre-2002); solve old papers as asked."
      />
      <Md>{`$$\\phi = 0.65 + 0.25\\frac{\\varepsilon_t - \\varepsilon_y}{0.005 - \\varepsilon_y} = 0.483 + 83.3\\varepsilon_t\\ \\ (\\text{Grade 60, } \\varepsilon_y = 0.00207)$$`}</Md>
      <PhiChart epsT={epsT} label={used?.epsT !== undefined ? 'lab beam' : 'εt'} />
      <Lookup result={ok(e) ? <span>φ({fmt(e, 5)}) = <b>{fmt(phiFlex(e), 3)}</b></span> : '—'}>
        <NumIn label="εt" value={e} onChange={setE} step={0.0001} w="w-20" />
      </Lookup>
    </>
  )
}

function Loads() {
  const used = useUsed('m-loads')
  const [D, setD] = useState(1.5)
  const [L, setL] = useState(2)
  return (
    <>
      <RT
        head={['ACI 318 / BNBC 2020 (Table 5.3.1)', 'U']}
        rows={[
          ['5.3.1a', '1.4D'],
          ['5.3.1b (gravity, the usual one)', '1.2D + 1.6L + 0.5(Lr or S or R)'],
          ['5.3.1c', '1.2D + 1.6(Lr or S or R) + (1.0L or 0.5W)'],
          ['5.3.1d', '1.2D + 1.0W + 1.0L + 0.5(Lr or S or R)'],
          ['5.3.1e', '1.2D + 1.0E + 1.0L + 0.2S'],
          ['5.3.1f', '0.9D + 1.0W'],
          ['5.3.1g', '0.9D + 1.0E'],
          ['Old ACI (≤ 1999) — older papers', '1.4D + 1.7L'],
        ]}
        hl={(i) => (used?.old ? i === 7 : used ? i === 1 || i === 0 : false)}
        cap="D includes self-weight (150 pcf × b h / 144 k/ft) unless the question says otherwise. 'All loads factored' in a figure → use them as given."
      />
      <Lookup
        result={
          ok(D) && ok(L) ? (
            <Tex>{`w_u = \\max(1.2(${fmt(D)}) + 1.6(${fmt(L)}),\\ 1.4(${fmt(D)})) = \\mathbf{${fmt(wuOf(D, L), 3)}};\\ \\ 1.4D + 1.7L = ${fmt(1.4 * D + 1.7 * L, 3)}`}</Tex>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="D" value={D} onChange={setD} step={0.1} w="w-14" />
        <NumIn label="L" value={L} onChange={setL} step={0.1} w="w-14" />
      </Lookup>
    </>
  )
}

function Cover() {
  const used = useUsed('m-cover')
  const [n, setN] = useState(4)
  const [bar, setBar] = useState(8)
  const [b, setB] = useState(12)
  const fit = BARS[bar] && ok(n) && ok(b) && n >= 1 ? barFit(n, bar, b) : null
  return (
    <>
      <RT
        head={['Cast-in-place concrete (ACI 20.6.1)', 'Clear cover']}
        rows={[
          ['Cast against and permanently exposed to earth', '3 in'],
          ['Exposed to earth or weather: #6–#18', '2 in'],
          ['Exposed to earth or weather: #5 and smaller', '1½ in'],
          ['Not exposed — slabs, walls, joists: #11 and smaller', '¾ in'],
          ['Not exposed — beams, columns (to stirrups/ties)', '1½ in'],
        ]}
        hl={(i) => (used?.slab ? i === 3 : used ? i === 4 : false)}
      />
      <Md>{`**Spacing (ACI 25.2):** clear distance between parallel bars in a layer $\\ge \\max(1\\text{ in},\\ d_b,\\ \\tfrac43 d_{agg})$; bars in two or more layers placed directly above each other with $\\ge 1$ in clear between layers.

**Effective depth (class):** $d = h - 2.5$ in (one layer, #3 stirrup, 1.5 in cover), $d = h - 3.5$ in (two layers, 1 in between), $d_t$ = depth to the lowest layer ($d_t \\approx d + 1$ to $1.5$ in). Slabs: $d = h - 0.75 - d_b/2$.

**Fit check (one layer):** $b_{min} = 2(1.5) + 2d_s + n\\,d_b + (n-1)\\max(1, d_b)$.`}</Md>
      <Lookup
        result={
          fit ? (
            <span>
              b_min = <b>{fmt(fit.bmin, 2)} in</b>, clear spacing {fmt(fit.clear, 2)} in vs {fmt(fit.req, 2)} required → <b className={fit.fits ? 'text-good' : 'text-bad'}>{fit.fits ? 'fits in one layer' : 'two layers'}</b>
            </span>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="n" value={n} onChange={setN} step={1} w="w-12" />
        <NumIn label="#" value={bar} onChange={setBar} step={1} w="w-12" />
        <NumIn label="b" value={b} onChange={setB} step={1} unit="in" w="w-14" />
      </Lookup>
    </>
  )
}

const FCS = [3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000]
function Props() {
  const used = useUsed('m-props')
  const [fc, setFc] = useState(4000)
  const [unit, setUnit] = useState<'psi' | 'ksi'>('psi')
  const v = ok(fc) && fc > 0 ? fc : NaN
  return (
    <>
      <RT
        head={["f′c (psi)", 'β₁', 'E_c (ksi)', 'f_r (psi)', 'n = E_s/E_c', 'n (class)']}
        rows={FCS.map((c) => [c, fmt(beta1(c), 3), fmt(Ec(c) / 1000, 0), fmt(fr(c), 0), fmt(29e6 / Ec(c), 2), Math.round(29e6 / Ec(c))])}
        hl={(i) => used?.fc === FCS[i]}
        cap="E_c = 57,000√f′c psi, f_r = 7.5λ√f′c psi, E_s = 29,000 ksi, ε_u = 0.003. β₁ = 0.85 to 4000 psi, −0.05 per 1000 psi, ≥ 0.65."
      />
      <Lookup
        result={
          ok(v) ? (
            <span>
              β₁ = <b>{fmt(beta1(v), 3)}</b>, E_c = {fmt(Ec(v) / 1000, 0)} ksi, f_r = {fmt(fr(v), 0)} psi, n = {fmt(29e6 / Ec(v), 2)} → {Math.round(29e6 / Ec(v))}
            </span>
          ) : (
            '—'
          )
        }
      >
        <Seg size="xs" value={unit} onChange={setUnit} items={[{ v: 'psi', label: 'psi' }, { v: 'ksi', label: 'ksi' }]} />
        <NumIn label="f′c" value={unit === 'psi' ? fc : fc / 1000} onChange={(x) => setFc(unit === 'psi' ? x : x * 1000)} step={unit === 'psi' ? 500 : 0.5} w="w-20" />
      </Lookup>
    </>
  )
}

export const MAT_ITEMS: RcRefItem[] = [
  { id: 'm-bars', group: 'mat', title: 'Bar sizes and areas (# and mm)', tag: 'Table A.2', exam: true, keywords: 'bar area diameter #8 0.79 mm', Body: Bars },
  { id: 'm-asft', group: 'mat', title: 'A_s per foot width for bar spacing', tag: 'Table A.3', keywords: 'slab spacing area per ft', Body: AsFt },
  { id: 'm-phi', group: 'mat', title: 'Strength reduction factors φ and the φ–εt chart', tag: 'ACI 21.2', keywords: 'phi tension controlled transition 0.483 83.3', Body: Phi },
  { id: 'm-loads', group: 'mat', title: 'Load combinations (1.2D + 1.6L)', tag: 'ACI 5.3.1', keywords: 'load factor wu 1.4D 1.7L', Body: Loads },
  { id: 'm-cover', group: 'mat', title: 'Cover, bar spacing and the fit check', tag: 'ACI 20.6 / 25.2', keywords: 'clear cover spacing d = h - 2.5 bmin', Body: Cover },
  { id: 'm-props', group: 'mat', title: 'β₁, E_c, f_r and n for each f′c', tag: 'ACI 19.2', keywords: 'beta1 modulus rupture modular ratio Ec fr', Body: Props },
]
