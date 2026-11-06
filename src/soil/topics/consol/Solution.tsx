// Written solution for a settlement profile (as on paper): p0′ terms, Δp, NC / OC branch, S per layer.
import { fmt } from '../../../components/DiagramView'
import { Tex } from '../../../components/ui'
import { footingQ, type SettleIn, type settleProfile, type SubOut } from '../../engine/consolidation'
import { Irect } from '../../engine/stressdist'
import { GW } from '../../engine/units'

const f2 = (v: number) => fmt(v, 2)
const f3 = (v: number) => fmt(v, 3)
const f4 = (v: number) => fmt(v, 4)

/** p0′ at depth z as a sum of γh terms (γ above the WT, γsat − γw below) */
export function p0Terms(inp: SettleIn, z: number) {
  const out: string[] = []
  let a = 0
  for (const l of inp.layers) {
    const b = Math.min(a + l.H, z)
    if (b > a) {
      const dry = Math.max(0, Math.min(b, inp.wt) - a)
      const wet = b - a - dry
      if (dry > 1e-9) out.push(`${f2(dry)}(${f2(l.gamma)})`)
      if (wet > 1e-9) out.push(`${f2(wet)}(${f2(l.gammaSat)} - 9.81)`)
    }
    a += l.H
    if (a >= z) break
  }
  if (inp.wt < 0) out.unshift(`${f2(-inp.wt)}(9.81)`)
  return out.join(' + ')
}

function dpLine(inp: SettleIn, s: SubOut) {
  const L = inp.load
  if (L.kind === 'fill') return String.raw`\Delta p = ${f2(L.q)}\ \text{kPa (wide fill: same at every depth)}`
  const q = footingQ(L)
  const one = (z: number) => {
    if (z <= 1e-9) return `${f2(q)}`
    if (L.method === '21') return L.shape === 'rect' ? String.raw`\frac{${f2(L.Q)}}{(${f2(L.B)}+${f2(z)})(${f2(L.L)}+${f2(z)})}` : L.shape === 'circle' ? String.raw`\frac{${f2(L.Q)}}{\pi(${f2(L.B)}+${f2(z)})^2/4}` : String.raw`\frac{${f2(L.Q)}}{${f2(L.B)}+${f2(z)}}`
    return L.shape === 'rect' ? String.raw`4(${f2(q)})I(${f3(L.B / 2 / z)}, ${f3(L.L / 2 / z)}) = 4(${f2(q)})(${f4(Irect(L.B / 2 / z, L.L / 2 / z))})` : L.shape === 'circle' ? String.raw`${f2(q)}\{1-[1+(${f2(L.B / 2)}/${f2(z)})^2]^{-3/2}\}` : String.raw`\text{strip centre}`
  }
  const zt = s.zTop - L.Df
  const zm = s.zMid - L.Df
  const zb = s.zBot - L.Df
  if (inp.avg === 'simpson')
  {
    const eq = (z: number, v: number) => (z <= 1e-9 ? f2(v) : `${one(z)} = ${f2(v)}`)
    return String.raw`\begin{aligned}\Delta p_t &= ${eq(zt, s.dpTop)},\quad \Delta p_m = ${eq(zm, s.dpMid)},\\ \Delta p_b &= ${eq(zb, s.dpBot)};\quad \Delta p_{av} = \tfrac{${f2(s.dpTop)} + 4(${f2(s.dpMid)}) + ${f2(s.dpBot)}}{6} = ${f2(s.dp)}\ \text{kPa}\end{aligned}`
  }
  return String.raw`z = ${f2(zm)}\ \text{m below the base: } \Delta p = ${one(zm)} = ${f2(s.dp)}\ \text{kPa}`
}

export function SettleSolution({ inp, out }: { inp: SettleIn; out: ReturnType<typeof settleProfile> }) {
  const L = inp.load
  return (
    <div className="space-y-3 text-sm">
      {L.kind === 'footing' && (
        <p>
          Contact pressure q = Q/A = {f2(footingQ(L))} kPa; Δp by {L.method === '21' ? 'the 2:1 method (z from the footing base)' : 'Boussinesq below the centre'}
          {inp.avg === 'simpson' ? ", averaged by Simpson's rule (top, middle, bottom)" : ', at the mid-depth'}.
        </p>
      )}
      {out.layers.map((Ly, li) => {
        const l = inp.layers[Ly.layer]
        return (
          <div key={li} className="rounded-lg border border-line p-2 space-y-1">
            <div className="font-semibold">
              Clay layer {li + 1}: {f2(Ly.zTop)}–{f2(Ly.zBot)} m (H = {f2(l.H)} m){Ly.subs.length > 1 ? `, ${Ly.subs.length} sub-layers` : ''}
            </div>
            <Tex block>{String.raw`e_0 = ${f3(l.e0 ?? 0)},\ C_c = ${f3(l.Cc ?? 0)}${l.pc ? String.raw`,\ C_s = ${f3(l.Cs ?? 0)},\ p_c' = ${f2(l.pc)}` : ''},\ \gamma_{sat} = ${f2(l.gammaSat)}\ \text{kN/m}^3`}</Tex>
            {Ly.subs.map((s, j) => (
              <div key={j} className="pl-2 border-l-2 border-line/60">
                {Ly.subs.length > 1 && <div className="text-xs text-faint">sub-layer {j + 1}: mid at {f2(s.zMid)} m, H = {f2(s.H)} m</div>}
                <Tex block>{String.raw`p_0' (${f2(s.zMid)}\ \text{m}) = ${p0Terms(inp, s.zMid)} = ${f2(s.p0)}\ \text{kPa}`}</Tex>
                <Tex block>{dpLine(inp, s)}</Tex>
                <Tex block>{String.raw`p_0' + \Delta p = ${f2(s.p1)}\ \text{kPa}${s.pc ? (s.branch === 'cross' ? String.raw` > p_c' = ${f2(s.pc)}\ \Rightarrow\ \text{OC, crosses } p_c'` : s.branch === 'recomp' ? String.raw` \le p_c' = ${f2(s.pc)}\ \Rightarrow\ \text{OC, recompression only}` : String.raw`;\ p_c' \le p_0' \Rightarrow \text{NC}`) : String.raw`\ (\text{NC})`}`}</Tex>
                <Tex block>
                  {s.terms.length === 1
                    ? String.raw`S = \frac{${f3(s.terms[0].C)}(${f2(s.H)})}{1+${f3(s.terms[0].e)}}\log\frac{${f2(s.terms[0].to)}}{${f2(s.terms[0].from)}} = ${f4(s.S)}\ \text{m} = ${fmt(s.S * 1000, 1)}\ \text{mm}`
                    : String.raw`S = \frac{${f3(s.terms[0].C)}(${f2(s.H)})}{1+${f3(s.terms[0].e)}}\log\frac{${f2(s.terms[0].to)}}{${f2(s.terms[0].from)}} + \frac{${f3(s.terms[1].C)}(${f2(s.H)})}{1+${f3(s.terms[1].e)}}\log\frac{${f2(s.terms[1].to)}}{${f2(s.terms[1].from)}} = ${f4(s.terms[0].S)} + ${f4(s.terms[1].S)} = ${fmt(s.S * 1000, 1)}\ \text{mm}`}
                </Tex>
              </div>
            ))}
            {Ly.subs.length > 1 && <div>Layer total = {fmt(Ly.S * 1000, 1)} mm</div>}
          </div>
        )
      })}
      <p className="font-semibold">
        Total primary consolidation settlement S = {out.layers.map((x) => fmt(x.S * 1000, 1)).join(' + ')}
        {out.layers.length > 1 ? ' = ' : ''}
        {out.layers.length > 1 ? fmt(out.S * 1000, 1) : ''} mm{out.layers.length > 1 ? '' : ''} ({fmt(out.S, 3)} m).
      </p>
      <p className="text-xs text-faint">γw = {GW} kN/m³; p0′ uses γ above the WT and γsat − γw below it.</p>
    </div>
  )
}
