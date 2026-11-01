import { useState } from 'react'
import { fmt } from '../components/DiagramView'
import { Md, Tex } from '../components/ui'
import { KLL, reducedLL, roofLL } from '../engine/llr'
import { Lookup, NumIn, ok, RT, type RefItem } from './common'

function LLR() {
  const [L0, setL0] = useState(2.4)
  const [K, setK] = useState(4)
  const [AT, setAT] = useState(50)
  const [fl, setFl] = useState(2)
  const r = ok(L0) && ok(AT) && AT > 0 ? reducedLL({ L0, KLL: K, AT, floorsSupported: ok(fl) ? fl : 1 }) : null
  return (
    <>
      <Tex block>{`L = L_0\\left(0.25 + \\frac{4.57}{\\sqrt{K_{LL}A_T}}\\right)\\quad\\text{if } K_{LL}A_T \\ge 37.16\\text{ m}^2`}</Tex>
      <Md>{`$L \\ge 0.50L_0$ for members supporting **one** floor, $L \\ge 0.40L_0$ for **two or more** floors. $A_T$ = tributary area (m²), summed over all floors the member supports; $L_0$ from Table 6.2.3.`}</Md>
      <Lookup
        result={
          r ? (
            <Tex>{`K_{LL}A_T = ${fmt(r.KA, 2)}${r.applies ? `,\\ L = ${L0}(${fmt(r.factor, 4)}) = ${fmt(r.raw, 3)} \\to \\max(\\cdot, ${r.minFrac}L_0) = \\mathbf{${fmt(r.L, 3)}}` : ` < 37.16 \\Rightarrow L = L_0 = \\mathbf{${L0}}`}\\text{ kN/m}^2`}</Tex>
          ) : (
            '—'
          )
        }
      >
        <NumIn label="L₀" value={L0} onChange={setL0} step={0.1} unit="kN/m²" w="w-16" />
        <label className="inline-flex items-center gap-1.5 text-xs">
          <span className="text-mute">K_LL</span>
          <select className="field !py-0.5 !px-1 !text-xs" value={K} onChange={(e) => setK(+e.target.value)}>
            {[4, 3, 2, 1].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <NumIn label="A_T" value={AT} onChange={setAT} step={1} unit="m²" w="w-16" />
        <NumIn label="floors" value={fl} onChange={setFl} step={1} w="w-12" />
      </Lookup>
    </>
  )
}

function KLLBody() {
  return <RT head={['Element', 'K_LL']} rows={KLL.map((k) => [k.element, k.K])} cap="K_LL = influence area / tributary area. K_LL may also be calculated." />
}

function Limits() {
  return (
    <Md>{`- **Heavy live loads** > 4.80 kN/m²: not reduced, *except* members supporting ≥ 2 floors may be reduced by 20 %.
- **Passenger-car garages**: not reduced, same 20 % exception.
- **Public assembly** with LL ≤ 4.80 kN/m²: not reduced. **Cyclone shelters**: no reduction.
- **One-way slabs**: $A_T \\le$ span × (1.5 × span).`}</Md>
  )
}

function Roof() {
  const [At, setAt] = useState(30)
  const [slope, setSlope] = useState(25)
  const [L0, setL0] = useState(1)
  const F = 0.12 * slope
  const r = ok(At) && ok(slope) && ok(L0) ? roofLL({ L0, At, F }) : null
  return (
    <>
      <Md>{`$$L_r = L_0R_1R_2,\\qquad 0.60 \\le L_r \\le 1.00\\ \\text{kN/m}^2$$
$$R_1 = \\begin{cases}1 & A_t \\le 18.58\\text{ m}^2\\\\ 1.2 - 0.011A_t & 18.58 < A_t < 55.74\\\\ 0.6 & A_t \\ge 55.74\\end{cases}\\qquad R_2 = \\begin{cases}1 & F \\le 4\\\\ 1.2 - 0.05F & 4 < F < 12\\\\ 0.6 & F \\ge 12\\end{cases}$$
Pitched roof: $F = 0.12 \\times$ slope (%). Arch or dome: $F$ = rise/span × 32.`}</Md>
      <div className="text-[11px] text-faint">The Lec 4-5 slide prints 1.2 − 0.001A_t; that jumps from 1.0 to 1.18 at 18.58 m². 0.011 (SI form of ASCE 7) runs smoothly from 1.0 to 0.6. Say which one you use.</div>
      <Lookup result={r ? <Tex>{`F = ${fmt(F, 2)},\\ R_1 = ${fmt(r.R1, 3)},\\ R_2 = ${fmt(r.R2, 3)},\\ L_r = ${fmt(r.raw, 3)} \\to \\mathbf{${fmt(r.Lr, 3)}}\\text{ kN/m}^2`}</Tex> : '—'}>
        <NumIn label="L₀" value={L0} onChange={setL0} step={0.1} w="w-14" />
        <NumIn label="A_t" value={At} onChange={setAt} step={1} unit="m²" w="w-16" />
        <NumIn label="slope" value={slope} onChange={setSlope} step={1} unit="%" w="w-14" />
      </Lookup>
    </>
  )
}

function LiveLoads() {
  return (
    <RT
      head={['Occupancy or use', 'Uniform (kN/m²)', 'Conc. (kN)']}
      rows={[
        ['Office: offices', '2.40', '9.00'],
        ['Office: lobbies & first-floor corridors', '4.80', '9.00'],
        ['Office: corridors above first floor', '3.80', '9.00'],
        ['Residential 1–2 family: all areas except stairs, balconies', '2.00', '—'],
        ['Residential: habitable attics & sleeping areas', '1.50', '—'],
        ['Residential: uninhabitable attics with / without storage', '1.00 / 0.50', '—'],
        ['Hotels & multifamily: private rooms & their corridors', '2.00', '—'],
        ['Hotels & multifamily: public rooms & their corridors', '4.80', '—'],
        ['Stairs & exit ways (1–2 family only: 2.00)', '4.80', '—'],
        ['Stores, retail: first floor', '4.80', '4.50'],
        ['Stores, retail: upper floors', '3.60', '4.50'],
        ['Stores, wholesale: all floors', '6.00', '4.50'],
        ['Manufacturing: light / medium / heavy', '4.00 / 6.00 / 12.00', '6.00 / 9.00 / 13.40'],
        ['Garments floor (except stacking / storage)', '4.00', '—'],
        ['Garments stacking or storage area', '6.00', '10.00'],
        ['Storage warehouses: light / heavy', '6.00 / 12.00', '—'],
        ['Penal institutions: cell blocks / corridors', '2.00 / 4.80', '—'],
        ['Stadiums: bleachers / fixed seats', '4.80 / 2.90', '—'],
        ['Reviewing stands, grandstands, bleachers', '4.80', '—'],
        ['Marquees', '3.60', '—'],
        ['Walkways & elevated platforms', '2.90', '—'],
        ['Yards & terraces, pedestrian', '4.80', '—'],
        ['Storage areas above ceilings', '1.00', '—'],
      ]}
      cap="Rows readable on the Lec 4-5 slide (Table 6.2.3 is partly hidden there). Concentrated loads act on 300 × 300 mm, not together with the uniform load. Exam questions usually give L₀."
    />
  )
}

function Partitions() {
  return (
    <Md>{`- Partitions **shown on plans** → dead load, line loads at their positions. **Not shown** → live load, placed for the worst effect.
- Light partitions (≤ 5.5 kN per metre run): UDL ≥ **33 %** of the weight per metre run, minimum **1.2 kN/m²**.
- Impact (Table 6.2.6): lifts & hoists **100 %**, light machinery **20 %**, reciprocating machinery **50 %**, hangers for floors/balconies **33 %** of the static load.
- Two occupancies at different times → use the larger live load.`}</Md>
  )
}

function Combos() {
  return (
    <Md>{`1. $1.4(D + F)$
2. $1.2(D + F + T) + 1.6(L + H) + 0.5(L_r \\text{ or } R)$
3. $1.2D + 1.6(L_r \\text{ or } R) + (L \\text{ or } 0.8W)$
4. $1.2D + 1.6W + L + 0.5(L_r \\text{ or } R)$
5. $1.2D + 1.0E + 1.0L$
6. $0.9D + 1.6W + 1.6H$
7. $0.9D + 1.0E + 1.6H$`}</Md>
  )
}

export const LOAD_ITEMS: RefItem[] = [
  { id: 'l-llr', group: 'loads', title: 'Live-load reduction formula', tag: 'Sec 2.3.13', keywords: 'llr reduced live load l0 at kll 37.16 0.4 0.5', Body: LLR },
  { id: 'l-kll', group: 'loads', title: 'Live load element factor K_LL', tag: 'Table 6.2.7', keywords: 'kll column beam slab cantilever corner edge interior', Body: KLLBody },
  { id: 'l-limits', group: 'loads', title: 'Where live load may not be reduced', tag: 'Sec 2.3.13.2–5', keywords: 'heavy garage assembly cyclone shelter one-way slab 4.8', Body: Limits },
  { id: 'l-roof', group: 'loads', title: 'Roof live-load reduction R₁, R₂', keywords: 'roof lr r1 r2 slope f tributary', Body: Roof },
  { id: 'l-ll', group: 'loads', title: 'Minimum live loads L₀', tag: 'Table 6.2.3', keywords: 'office residential store manufacturing garments live load l0 uniform concentrated', Body: LiveLoads },
  { id: 'l-part', group: 'loads', title: 'Partitions & impact allowance', tag: 'Sec 2.3.6, Table 6.2.6', keywords: 'partition impact lift machinery 33% 1.2', Body: Partitions },
  { id: 'l-combo', group: 'loads', title: 'Strength load combinations', tag: 'Sec 2.7', keywords: 'combination factored 1.2d 1.6l 1.4d wind earthquake', Body: Combos },
]
