// Curve setting: the class problem sheet worked out — transition + circular curve by deflection angles,
// one-theodolite method, set out up to the mid-point of the circular curve, super-elevation on the inner edge.
import { useMemo } from 'react'
import { Seg } from '../../components/ui'
import { fmtDMS, norm360, parseDMS, RAD } from '../engine/angle'
import { solveCurve } from '../engine/curve'
import { Check, Field, fx, has, n } from './Grid'

export interface CurveData {
  unit: 'ft' | 'm'
  delta: string
  speed: string
  speedUnit: 'mph' | 'kmh'
  ratio: string
  b: string
  N: string
  peg: string
  chPI: string
  brg1: string
  turn: 'R' | 'L'
  roundR: string
}

export const curveBlank = (): CurveData => ({ unit: 'ft', delta: '', speed: '', speedUnit: 'mph', ratio: '0.15', b: '', N: '50', peg: '10', chPI: '', brg1: '', turn: 'R', roundR: '5' })

/** the class problem sheet (lecture sheet / 18-batch): every number of the seniors' solution comes out of this */
export const curveSample = (): CurveData => ({ unit: 'ft', delta: '29.33', speed: '32', speedUnit: 'mph', ratio: '0.15', b: '9', N: '50', peg: '10', chPI: '1662', brg1: '135', turn: 'R', roundR: '5' })

const dm = (min: number) => {
  const d = Math.floor(min / 60 + 1e-9)
  const m = min - d * 60
  return { d, m }
}

export function CurveSheet({ data, set }: { data: CurveData; set: (d: CurveData) => void }) {
  const ft = data.unit === 'ft'
  const g = ft ? 32.2 : 9.81
  const vRaw = n(data.speed)
  const v = data.speedUnit === 'mph' ? (ft ? (vRaw * 5280) / 3600 : vRaw * 0.44704) : ft ? (vRaw * 1000) / 3600 / 0.3048 : (vRaw * 1000) / 3600
  const delta = parseDMS(data.delta)
  const ok = isFinite(delta) && vRaw > 0 && [data.ratio, data.b, data.N, data.peg, data.chPI].every(has)
  const r = useMemo(() => (ok ? solveCurve({ delta, v, ratio: n(data.ratio), b: n(data.b), N: n(data.N), peg: n(data.peg), chPI: n(data.chPI), g, roundR: has(data.roundR) ? n(data.roundR) : 5 }) : null), [ok, delta, v, data, g])
  const u = data.unit
  const brg = parseDMS(data.brg1)
  const sgn = data.turn === 'R' ? 1 : -1
  const set1 = (k: keyof CurveData) => (val: string) => set({ ...data, [k]: val })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Units</span>
          <Seg<'ft' | 'm'> value={data.unit} onChange={(v2) => set({ ...data, unit: v2 })} items={[{ v: 'ft', label: 'ft (g = 32.2)' }, { v: 'm', label: 'm (g = 9.81)' }]} />
        </label>
        <Field label="Deflection angle Δ" type="dms" value={data.delta} onChange={set1('delta')} w="6rem" ph="29.33" />
        <Field label="Design speed" value={data.speed} onChange={set1('speed')} w="5rem" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">speed in</span>
          <Seg<'mph' | 'kmh'> value={data.speedUnit} onChange={(v2) => set({ ...data, speedUnit: v2 })} items={[{ v: 'mph', label: 'mph' }, { v: 'kmh', label: 'km/h' }]} />
        </label>
        <Field label="Centrifugal ratio (h/b)" value={data.ratio} onChange={set1('ratio')} w="5rem" />
        <Field label={`Pavement width b (${u})`} value={data.b} onChange={set1('b')} w="5rem" />
        <Field label="Gradient 1 in N" value={data.N} onChange={set1('N')} w="4.5rem" />
        <Field label={`Max peg interval (${u})`} value={data.peg} onChange={set1('peg')} w="5rem" />
        <Field label={`Chainage of PI (${u})`} value={data.chPI} onChange={set1('chPI')} w="6rem" />
        <Field label="Bearing of 1st tangent" type="dms" value={data.brg1} onChange={set1('brg1')} w="6rem" />
        <label className="flex flex-col gap-0.5 text-xs">
          <span className="text-mute font-semibold">Curve turns</span>
          <Seg<'R' | 'L'> value={data.turn} onChange={(t) => set({ ...data, turn: t })} items={[{ v: 'R', label: 'right' }, { v: 'L', label: 'left' }]} />
        </label>
        <Field label="Round R to" value={data.roundR} onChange={set1('roundR')} w="4rem" hint="nearest; 0 = exact" />
      </div>

      {!r && <div className="text-sm text-faint">Fill in the data to work the curve out.</div>}
      {r && (
        <>
          <div className="card p-4 text-sm grid gap-x-8 gap-y-1.5 md:grid-cols-2">
            <Row k="Design speed, v" f={`${data.speed} ${data.speedUnit === 'mph' ? 'mph' : 'km/h'}`} v={`${v.toFixed(2)} ${u}/s`} />
            <Row k="Radius, v²/(gR) = h/b ⇒ R" f={`${v.toFixed(2)}² / (${g} × ${data.ratio}) = ${r.Rexact.toFixed(1)}`} v={`${r.R} ${u}`} hint={r.R !== r.Rexact ? `rounded to ${data.roundR || 5} ${u}` : ''} />
            <Row k="Super-elevation, h = b v²/gR = (h/b)·b" f={`${data.ratio} × ${data.b}`} v={`${r.h.toFixed(2)} ${u}`} />
            <Row k="Transition length, Lₜ = h N" f={`${r.h.toFixed(2)} × ${data.N}`} v={`${r.L.toFixed(2)} ${u}`} />
            <Row k="Spiral angle, Sₐ = Lₜ/(2πR) × 180°" f={`${r.L.toFixed(2)} / (2π × ${r.R}) × 180`} v={`${r.phiS.toFixed(2)}° = ${fmtDMS(r.phiS)}`} />
            <Row k="Circular length, L꜀ = πR(Δ − 2Sₐ)/180" f={`π × ${r.R} × (${delta.toFixed(2)} − ${(2 * r.phiS).toFixed(2)}) / 180`} v={`${r.Lc.toFixed(2)} ${u}`} />
            <Row k="Shift, S = Lₜ²/(24R)" f={`${r.L.toFixed(2)}² / (24 × ${r.R})`} v={`${r.shift.toFixed(3)} ${u}`} />
            <Row k="Tangent length, L = (R + S) tan(Δ/2) + Lₜ/2" f={`(${r.R} + ${r.shift.toFixed(2)}) tan(${(delta / 2).toFixed(3)}°) + ${(r.L / 2).toFixed(2)}`} v={`${r.T.toFixed(2)} ${u}`} />
          </div>

          <div className="card p-4 text-sm">
            <div className="font-bold mb-1">Chainages</div>
            <div className="grid gap-1 sm:grid-cols-2 num">
              <div>A — start of transition = PI − L = {data.chPI} − {r.T.toFixed(2)} = <b>{r.ch.A.toFixed(2)}</b></div>
              <div>B — start of circular = A + Lₜ = <b>{r.ch.B.toFixed(2)}</b></div>
              <div>Mid-point of circular curve = B + L꜀/2 = <b>{(r.ch.B + r.Lc / 2).toFixed(2)}</b></div>
              <div>C — end of circular = B + L꜀ = <b>{r.ch.C.toFixed(2)}</b></div>
              <div>D — end of transition = C + Lₜ = <b>{r.ch.D.toFixed(2)}</b></div>
            </div>
          </div>

          <div className="grid gap-4 2xl:grid-cols-2">
            <div className="overflow-x-auto">
              <div className="font-bold text-sm mb-1">Transition curve (theodolite at A, 0° on the 1st tangent)</div>
              <table className="sv-grid text-sm border-separate border-spacing-0 w-full">
                <thead>
                  <tr>
                    <th>Peg</th>
                    <th>Chord</th>
                    <th>l from A</th>
                    <th className="out">δ = 1800 l²/πRLₜ (′)</th>
                    <th className="out">δ (° ′)</th>
                    {isFinite(brg) && <th>bearing to set</th>}
                    <th>outer edge ↑</th>
                  </tr>
                </thead>
                <tbody>
                  {r.trans.map((p) => {
                    const { d, m } = dm(p.defMin)
                    return (
                      <tr key={p.peg}>
                        <td className="px-2">{p.peg}</td>
                        <td className="px-2 num">{fx(p.chord, 2)}</td>
                        <td className="px-2 num">{fx(p.l, 2)}</td>
                        <td className="out">{p.defMin.toFixed(2)}</td>
                        <td className="out">
                          {d}° {m.toFixed(1)}′
                        </td>
                        {isFinite(brg) && <td className="px-2 num whitespace-nowrap">{fmtDMS(norm360(brg + (sgn * p.defMin) / 60))}</td>}
                        <td className="px-2 num">{fx(p.sup, 3)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="text-[11px] text-faint mt-1">Chords measured from the 1st peg station (cumulative l); the odd length is added to the last chord. Outer edge raised h·l/Lₜ above the inner edge (no crown).</div>
            </div>
            <div className="overflow-x-auto">
              <div className="font-bold text-sm mb-1">Half circular curve (theodolite at B, 0° on the common tangent)</div>
              <table className="sv-grid text-sm border-separate border-spacing-0 w-full">
                <thead>
                  <tr>
                    <th>Peg</th>
                    <th>Chord Cᵢ</th>
                    <th className="out">1718.9 Cᵢ/R (′)</th>
                    <th className="out">Cumulative (° ′)</th>
                  </tr>
                </thead>
                <tbody>
                  {r.circ.map((p) => {
                    const { d, m } = dm(p.cumMin)
                    return (
                      <tr key={p.peg}>
                        <td className="px-2">{p.peg}</td>
                        <td className="px-2 num">{fx(p.chord, 2)}</td>
                        <td className="out">{p.defMin.toFixed(2)}</td>
                        <td className="out">
                          {d}° {m.toFixed(1)}′
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="text-[11px] text-faint mt-1">Chords measured from successive peg stations; super-elevation h = {r.h.toFixed(2)} {u} all along the circular curve.</div>
            </div>
          </div>

          <div className="card p-4 space-y-1.5 text-sm">
            <div className="font-bold">Checks</div>
            <Check ok={Math.abs(r.checks.lastTransDefMin - r.checks.phiSover3Min) < 0.5}>
              Transition: deflection at the last peg = {r.checks.lastTransDefMin.toFixed(2)}′ = ⅓ Sₐ = {r.checks.phiSover3Min.toFixed(2)}′ ({fmtDMS(r.phiS / 3)})
            </Check>
            <Check ok={Math.abs(r.checks.totalCircMin - r.checks.quarterMin) < 1}>
              Circular: cumulative angle at the last peg (mid-curve) = {r.checks.totalCircMin.toFixed(2)}′ ≈ ¼(Δ − 2Sₐ) = {r.checks.quarterMin.toFixed(2)}′ ({fmtDMS(r.checks.quarterMin / 60)})
            </Check>
            <div>
              Field checks: apex distance E = R(sec Δ/2 − 1) = <b className="num">{r.checks.E.toFixed(2)} {u}</b> (with the shift: (R + S)sec Δ/2 − R = {r.checks.Eexact.toFixed(2)}) · offset at the end of the transition = 4S = <b className="num">{r.checks.endOffset.toFixed(2)} {u}</b>
            </div>
            <div className="text-xs text-mute">The 1st tangent and the common tangent meet at ⅔Lₜ = {((2 * r.L) / 3).toFixed(2)} {u} from A, at an angle of Sₐ there; use it to orient the theodolite at B (sight A, the line to A makes ⅔Sₐ with the common tangent).</div>
          </div>
          <CurvePlan R={r.R} L={r.L} Lc={r.Lc} trans={r.trans.map((p) => p.l)} circ={r.circ.map((p) => p.chord)} T={r.T} delta={delta} shift={r.shift} turn={sgn} unit={u} />
        </>
      )}
    </div>
  )
}

function Row({ k, f, v, hint }: { k: string; f: string; v: string; hint?: string }) {
  return (
    <div>
      <div className="text-xs text-mute">{k}</div>
      <div className="num">
        <span className="text-faint">{f} =</span> <b>{v}</b> {hint && <span className="text-[11px] text-faint">({hint})</span>}
      </div>
    </div>
  )
}

/** plan of the pegs: clothoid approximation x = l − l⁵/40R²L², y = l³/6RL, then the circular arc to mid-curve */
function CurvePlan({ R, L, Lc, trans, circ, T, delta, shift, turn, unit }: { R: number; L: number; Lc: number; trans: number[]; circ: number[]; T: number; delta: number; shift: number; turn: number; unit: string }) {
  const spiral = (l: number) => ({ x: l - l ** 5 / (40 * R * R * L * L), y: l ** 3 / (6 * R * L) })
  const B = spiral(L)
  const phi = L / (2 * R)
  // centre of the circular arc
  const cx = B.x - R * Math.sin(phi)
  const cy = B.y + R * Math.cos(phi)
  const arc = (s: number) => {
    const a = phi + s / R
    return { x: cx + R * Math.sin(a), y: cy - R * Math.cos(a) }
  }
  const tp = trans.map(spiral)
  let s = 0
  const cp = circ.map((c) => ((s += c), arc(s)))
  const PI = { x: T, y: 0 }
  const fine: { x: number; y: number }[] = []
  for (let i = 0; i <= 40; i++) fine.push(spiral((L * i) / 40))
  for (let i = 1; i <= 40; i++) fine.push(arc((Lc / 2) * (i / 40)))
  const pts = [{ x: 0, y: 0 }, PI, ...fine]
  const minX = Math.min(...pts.map((p) => p.x)),
    maxX = Math.max(...pts.map((p) => p.x)),
    maxY = Math.max(...pts.map((p) => p.y))
  const W = 640,
    H = 230,
    pad = 30
  const k = Math.min((W - 2 * pad) / (maxX - minX || 1), (H - 2 * pad) / (maxY || 1))
  const X = (x: number) => pad + (x - minX) * k
  const Y = (y: number) => (turn > 0 ? pad + y * k : H - pad - y * k)
  const d2 = (delta * RAD) / 2
  return (
    <div>
      <div className="font-bold text-sm mb-1">Layout of the pegs up to the mid-point of the circular curve (to scale)</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-xl border border-line bg-bg">
        <line x1={X(minX)} y1={Y(0)} x2={X(PI.x)} y2={Y(0)} stroke="var(--c-mute)" strokeDasharray="5 4" />
        <line x1={X(PI.x)} y1={Y(0)} x2={X(PI.x + Math.cos(2 * d2) * T * 0.4)} y2={Y(Math.sin(2 * d2) * T * 0.4)} stroke="var(--c-mute)" strokeDasharray="5 4" />
        <path d={'M' + fine.map((p) => `${X(p.x)} ${Y(p.y)}`).join(' L')} fill="none" stroke="var(--c-accent)" strokeWidth="2" />
        {tp.map((p, i) => (
          <circle key={'t' + i} cx={X(p.x)} cy={Y(p.y)} r="3" fill="var(--c-accent2)" />
        ))}
        {cp.map((p, i) => (
          <circle key={'c' + i} cx={X(p.x)} cy={Y(p.y)} r="3" fill="var(--c-accent)" />
        ))}
        {[
          ['A', 0, 0],
          ['B', B.x, B.y],
          ['PI', PI.x, 0],
        ].map(([t, x, y]) => (
          <text key={t as string} x={X(x as number) + 4} y={Y(y as number) + (turn > 0 ? -6 : 14)} fontSize="11" fontWeight="700" fill="var(--c-ink)">
            {t}
          </text>
        ))}
        <text x={W - pad} y={H - 8} fontSize="10" textAnchor="end" fill="var(--c-mute)">
          shift S = {shift.toFixed(2)} {unit} · ● transition pegs · ● circular pegs
        </text>
      </svg>
    </div>
  )
}
