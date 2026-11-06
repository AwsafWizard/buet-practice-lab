// Consolidation drawings: the soil profile with σ′0 and Δp beside it, the e–log p stress path, isochrones, sketches.
import { fmt } from '../../../components/DiagramView'
import { loadDp, settleProfile, type CLayer, type LoadIn, type SettleIn } from '../../engine/consolidation'
import { stressAt } from '../../engine/stresses'
import { uRatio } from '../../engine/consolidation'
import { toProfile } from '../../engine/consolidation'
import { Chart, pathOf } from './plot'

const f1 = (v: number) => fmt(v, 1)

/** soil column + σ′0 and Δp profiles on the same depth scale */
export function ProfileFig({ inp, out, width = 620 }: { inp: SettleIn; out: ReturnType<typeof settleProfile> | null; width?: number }) {
  const Htot = inp.layers.reduce((s, l) => s + l.H, 0)
  const top = 34
  const hPx = 250
  const k = hPx / Math.max(1, Htot)
  const Y = (z: number) => top + z * k
  const colX = 70
  const colW = 150
  const prof = toProfile(inp)
  const zs = Array.from({ length: 81 }, (_, i) => (i / 80) * Htot)
  const effs = zs.map((z) => stressAt(prof, z).eff)
  const dps = zs.map((z) => (inp.load.kind === 'footing' && z < inp.load.Df ? NaN : loadDp(inp.load, z)))
  const maxS = Math.max(1, ...effs.map((v, i) => v + (Number.isFinite(dps[i]) ? dps[i] : 0)))
  const plotL = colX + colW + 60
  const plotW = width - plotL - 20
  const SX = (v: number) => plotL + (v / maxS) * plotW
  let z = 0
  const load = inp.load
  return (
    <svg viewBox={`0 0 ${width} ${top + hPx + 30}`} className="w-full" role="img" aria-label="soil profile">
      {inp.layers.map((l, i) => {
        const a = z
        z += l.H
        const clay = l.kind === 'clay'
        return (
          <g key={i}>
            <rect x={colX} y={Y(a)} width={colW} height={l.H * k} fill="var(--c-soil)" opacity={clay ? 0.55 : 0.22} stroke="var(--c-line)" />
            {!clay && Array.from({ length: Math.max(2, Math.round(l.H * k * 0.12)) }, (_, j) => <circle key={j} cx={colX + 12 + ((j * 37) % (colW - 24))} cy={Y(a) + 6 + ((j * 23) % Math.max(4, l.H * k - 12))} r={1.2} fill="var(--c-mute)" />)}
            <text x={colX + 6} y={Y(a) + 13} fontSize={10} fill="var(--c-ink)">
              {clay ? 'Clay' : 'Sand'} · {f1(l.H)} m
            </text>
            <text x={colX + 6} y={Y(a) + 25} fontSize={8.5} fill="var(--c-mute)">
              γ {fmt(l.gamma, 2)} / γsat {fmt(l.gammaSat, 2)}
              {clay ? ` · e0 ${fmt(l.e0 ?? 0, 3)} · Cc ${fmt(l.Cc ?? 0, 3)}` : ''}
            </text>
            {clay && (
              <text x={colX + 6} y={Y(a) + 36} fontSize={8.5} fill="var(--c-mute)">
                {l.pc ? `pc′ ${fmt(l.pc, 1)} kPa · Cs ${fmt(l.Cs ?? 0, 3)}` : 'NC'}
                {l.cv ? ` · cv ${fmt(l.cv, 2)} m²/yr` : ''}
              </text>
            )}
            <text x={colX - 6} y={Y(z) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
              {f1(z)} m
            </text>
          </g>
        )
      })}
      <text x={colX - 6} y={Y(0) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        0
      </text>
      {inp.wt >= 0 && inp.wt <= Htot && (
        <g>
          <line x1={colX - 30} x2={colX + colW + 30} y1={Y(inp.wt)} y2={Y(inp.wt)} stroke="var(--c-water)" strokeDasharray="5 3" />
          <path d={`M${colX + colW + 18},${Y(inp.wt) - 9} l7,0 l-3.5,7 z`} fill="var(--c-water)" />
          <text x={colX - 32} y={Y(inp.wt) - 3} fontSize={9} textAnchor="end" fill="var(--c-water)">
            WT
          </text>
        </g>
      )}
      {load.kind === 'fill' ? (
        <g>
          <rect x={colX - 10} y={top - 18} width={colW + 20} height={14} fill="var(--c-load)" opacity={0.25} stroke="var(--c-load)" />
          <text x={colX + colW / 2} y={top - 8} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
            wide fill, Δp = {f1(load.q)} kPa
          </text>
        </g>
      ) : (
        <g>
          {(() => {
            const bw = Math.min(colW - 10, Math.max(16, (load.B / Math.max(1, Htot)) * hPx))
            const x0 = colX + colW / 2 - bw / 2
            return (
              <>
                <rect x={x0} y={Y(load.Df) - 8} width={bw} height={8} fill="var(--c-load)" opacity={0.7} />
                <line x1={colX + colW / 2} x2={colX + colW / 2} y1={Math.max(4, Y(load.Df) - 26)} y2={Y(load.Df) - 9} stroke="var(--c-load)" strokeWidth={2} markerEnd="" />
                <text x={colX + colW / 2 + 4} y={Math.max(12, Y(load.Df) - 16)} fontSize={9} fill="var(--c-load)">
                  {f1(load.Q)} kN{load.shape === 'strip' ? '/m' : ''} · {load.shape === 'circle' ? `D ${f1(load.B)}` : load.shape === 'strip' ? `B ${f1(load.B)}` : `${f1(load.B)}×${f1(load.L)}`} m
                </text>
                {load.method === '21' && (
                  <path d={`M${x0},${Y(load.Df)} L${x0 - ((Htot - load.Df) * k) / 2},${Y(Htot)} M${x0 + bw},${Y(load.Df)} L${x0 + bw + ((Htot - load.Df) * k) / 2},${Y(Htot)}`} stroke="var(--c-load)" strokeDasharray="3 3" opacity={0.6} fill="none" />
                )}
              </>
            )
          })()}
        </g>
      )}
      {out?.layers.flatMap((L) =>
        L.subs.map((s, j) => (
          <g key={`${L.layer}-${j}`}>
            <line x1={colX} x2={colX + colW} y1={Y(s.zMid)} y2={Y(s.zMid)} stroke="var(--c-accent)" strokeDasharray="2 2" />
            <circle cx={colX + colW} cy={Y(s.zMid)} r={2.5} fill="var(--c-accent)" />
          </g>
        )),
      )}
      {/* σ′0 and Δp */}
      <line x1={plotL} x2={plotL} y1={top} y2={Y(Htot)} stroke="var(--c-line)" />
      <line x1={plotL} x2={plotL + plotW} y1={top} y2={top} stroke="var(--c-line)" />
      <text x={plotL} y={top - 6} fontSize={9} fill="var(--c-mute)">
        0
      </text>
      <text x={plotL + plotW} y={top - 6} fontSize={9} textAnchor="end" fill="var(--c-mute)">
        {f1(maxS)} kPa
      </text>
      <path d={zs.map((zz, i) => `${i ? 'L' : 'M'}${SX(effs[i]).toFixed(1)},${Y(zz).toFixed(1)}`).join(' ')} fill="none" stroke="var(--c-ink)" strokeWidth={1.5} />
      <path
        d={zs
          .map((zz, i) => [zz, effs[i] + dps[i]] as const)
          .filter(([, v]) => Number.isFinite(v))
          .map(([zz, v], i) => `${i ? 'L' : 'M'}${SX(v).toFixed(1)},${Y(zz).toFixed(1)}`)
          .join(' ')}
        fill="none"
        stroke="var(--c-load)"
        strokeWidth={1.5}
      />
      {inp.layers.map((l, i) =>
        l.kind === 'clay' && l.pc ? (
          <line key={i} x1={SX(l.pc)} x2={SX(l.pc)} y1={Y(inp.layers.slice(0, i).reduce((s, x) => s + x.H, 0))} y2={Y(inp.layers.slice(0, i + 1).reduce((s, x) => s + x.H, 0))} stroke="var(--c-accent)" strokeDasharray="4 2" />
        ) : null,
      )}
      {out?.layers.flatMap((L) =>
        L.subs.map((s, j) => (
          <g key={`v${L.layer}-${j}`}>
            <circle cx={SX(s.p0)} cy={Y(s.zMid)} r={2.5} fill="var(--c-ink)" />
            <circle cx={SX(s.p0 + s.dp)} cy={Y(s.zMid)} r={2.5} fill="var(--c-load)" />
            {L.subs.length <= 3 && (
              <text x={SX(s.p0 + s.dp) + 4} y={Y(s.zMid) - 3} fontSize={8.5} fill="var(--c-mute)">
                p0′ {f1(s.p0)} + Δp {f1(s.dp)}
              </text>
            )}
          </g>
        )),
      )}
      <text x={plotL + 4} y={Y(Htot) + 14} fontSize={9} fill="var(--c-ink)">
        — σ′0
      </text>
      <text x={plotL + 44} y={Y(Htot) + 14} fontSize={9} fill="var(--c-load)">
        — σ′0 + Δp
      </text>
      <text x={plotL + 112} y={Y(Htot) + 14} fontSize={9} fill="var(--c-accent)">
        - - pc′
      </text>
    </svg>
  )
}

/** idealised e–log p for one clay (sub)layer with the stress path p0′ → p0′ + Δp */
export function StressPathFig({ e0, p0, p1, pc, Cc, Cs, w = 340 }: { e0: number; p0: number; p1: number; pc: number | null; Cc: number; Cs: number; w?: number }) {
  const pcv = pc && pc > p0 ? pc : p0
  const ec = e0 - Cs * Math.log10(pcv / p0)
  const e = (p: number) => (p <= pcv ? e0 - Cs * Math.log10(p / p0) : ec - Cc * Math.log10(p / pcv))
  const pmin = Math.min(p0, pcv) / 4
  const pmax = Math.max(p1, pcv) * 3
  const ps = Array.from({ length: 60 }, (_, i) => pmin * (pmax / pmin) ** (i / 59))
  const es = ps.map(e)
  const crosses = !!pc && pc > p0 && p1 > pc
  const col = !pc || pc <= p0 ? 'var(--c-load)' : crosses ? 'var(--c-bad)' : 'var(--c-good)'
  return (
    <Chart w={w} h={220} x={{ min: pmin, max: pmax, log: true, label: "p′ (kPa, log)" }} y={{ min: Math.min(...es) - 0.01, max: Math.max(...es) + 0.01, label: 'e', fmt: (v) => fmt(v, 3) }} label="e–log p stress path">
      {(s) => (
        <>
          <path d={pathOf(ps.map((p, i) => [p, es[i]]), s)} fill="none" stroke="var(--c-ink)" strokeWidth={1.3} />
          {pc && pc > p0 && <line x1={s.X(pc)} x2={s.X(pc)} y1={s.T} y2={s.B} stroke="var(--c-accent)" strokeDasharray="4 3" />}
          {pc && pc > p0 && (
            <text x={s.X(pc) + 3} y={s.T + 10} fontSize={9} fill="var(--c-accent)">
              pc′ = {f1(pc)}
            </text>
          )}
          <path d={pathOf(ps.filter((p) => p >= p0 && p <= p1).concat([p1]).map((p) => [p, e(p)]), s)} fill="none" stroke={col} strokeWidth={3.2} opacity={0.85} />
          <circle cx={s.X(p0)} cy={s.Y(e0)} r={3.5} fill="var(--c-ink)" />
          <circle cx={s.X(p1)} cy={s.Y(e(p1))} r={3.5} fill={col} />
          <text x={s.X(p0) - 4} y={s.Y(e0) - 6} fontSize={9} textAnchor="end" fill="var(--c-ink)">
            (p0′, e0)
          </text>
          <text x={s.X(p1) + 5} y={s.Y(e(p1)) + 3} fontSize={9} fill={col}>
            p0′ + Δp
          </text>
          <text x={s.R - 4} y={s.B - 6} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            slope Cs then Cc
          </text>
        </>
      )}
    </Chart>
  )
}

/** isochrones u/u0 vs depth for several Tv (two-way: 0…2d, one-way: 0…d with the impervious base) */
export function IsochroneFig({ Tv, way, w = 340, many = true }: { Tv: number; way: 'one' | 'two'; w?: number; many?: boolean }) {
  const Zmax = way === 'two' ? 2 : 1
  const Zs = Array.from({ length: 81 }, (_, i) => (i / 80) * Zmax)
  const list = [0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0]
  return (
    <Chart w={w} h={260} xTop x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: 'excess pore pressure u/u0' }} y={{ min: 0, max: Zmax, flip: true, ticks: way === 'two' ? [0, 0.5, 1, 1.5, 2] : [0, 0.25, 0.5, 0.75, 1], label: way === 'two' ? 'z/d (top → bottom, 2d = H)' : 'z/d (top drains, base impervious)' }} label="isochrones">
      {(s) => (
        <>
          {many &&
            list.map((t) => (
              <g key={t}>
                <path d={pathOf(Zs.map((Z) => [uRatio(Z, t), Z]), s)} fill="none" stroke="var(--c-mute)" strokeWidth={0.8} opacity={0.6} />
                <text x={s.X(uRatio(Zmax / 2, t)) + 2} y={s.Y(way === 'two' ? 1 : 0.95)} fontSize={7.5} fill="var(--c-mute)">
                  {t}
                </text>
              </g>
            ))}
          <path d={pathOf([[0, 0], ...Zs.map((Z) => [uRatio(Z, Tv), Z] as [number, number]), [0, Zmax]], s) + ' Z'} fill="var(--c-water)" opacity={0.18} />
          <path d={pathOf(Zs.map((Z) => [uRatio(Z, Tv), Z]), s)} fill="none" stroke="var(--c-water)" strokeWidth={2.4} />
          {way === 'one' && <line x1={s.L} x2={s.R} y1={s.B} y2={s.B} stroke="var(--c-ink)" strokeWidth={3} />}
        </>
      )}
    </Chart>
  )
}

/** spring–cylinder analogy at one instant: share of the load on water vs spring */
export function SpringFig({ uFrac = 1, w = 220 }: { uFrac?: number; w?: number }) {
  const h = 170
  const comp = (1 - uFrac) * 26
  const pistonY = 40 + comp
  const coils = 7
  const springTop = pistonY + 8
  const springBot = 150
  const seg = (springBot - springTop) / coils
  const zig = Array.from({ length: coils * 2 + 1 }, (_, i) => `${i ? 'L' : 'M'}${110 + (i === 0 || i === coils * 2 ? 0 : i % 2 ? 14 : -14)},${springTop + (i * seg) / 2}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w * 1.4 }} role="img" aria-label="spring cylinder analogy">
      <rect x={70} y={30} width={80} height={125} fill="var(--c-water)" opacity={0.25} />
      <path d="M70,20 L70,155 L150,155 L150,20" fill="none" stroke="var(--c-ink)" strokeWidth={2} />
      <rect x={72} y={pistonY} width={76} height={8} fill="var(--c-mute)" />
      <line x1={110} x2={110} y1={6} y2={pistonY} stroke="var(--c-load)" strokeWidth={2.5} />
      <text x={116} y={14} fontSize={9} fill="var(--c-load)">
        P
      </text>
      <path d={zig} fill="none" stroke="var(--c-ink)" strokeWidth={1.4} />
      <line x1={150} x2={175} y1={pistonY + 4} y2={pistonY + 4} stroke="var(--c-ink)" />
      <text x={177} y={pistonY + 7} fontSize={8} fill="var(--c-mute)">
        valve {uFrac < 1 ? 'open' : 'shut'}
      </text>
      <rect x={10} y={40} width={16} height={110} fill="none" stroke="var(--c-line)" />
      <rect x={10} y={40 + 110 * (1 - uFrac)} width={16} height={110 * uFrac} fill="var(--c-water)" opacity={0.6} />
      <rect x={30} y={40} width={16} height={110} fill="none" stroke="var(--c-line)" />
      <rect x={30} y={40 + 110 * uFrac} width={16} height={110 * (1 - uFrac)} fill="var(--c-soil)" opacity={0.8} />
      <text x={18} y={164} fontSize={8} textAnchor="middle" fill="var(--c-water)">
        u
      </text>
      <text x={38} y={164} fontSize={8} textAnchor="middle" fill="var(--c-ink)">
        σ′
      </text>
    </svg>
  )
}

/** a schematic field e–log p construction (theory sketch) */
export function FieldCurveSketch({ oc = false }: { oc?: boolean }) {
  const e0 = 0.9
  const p0 = 60
  const pc = oc ? 150 : 60
  const lab = (p: number) => (p < 100 ? 0.86 - 0.04 * Math.log10(p / 10) : 0.82 - 0.36 * Math.log10(p / 100))
  const eb = oc ? e0 - 0.04 * Math.log10(pc / p0) : e0
  const eL = 0.42 * e0
  const pL = 100 * 10 ** ((0.82 - eL) / 0.36)
  const ps = Array.from({ length: 50 }, (_, i) => 10 * 200 ** (i / 49))
  return (
    <Chart w={340} h={220} x={{ min: 10, max: 2000, log: true, label: "p′ (log)", minor: false }} y={{ min: 0.3, max: 0.95, label: 'e', ticks: [0.4, 0.6, 0.8] }} label="field curve sketch">
      {(s) => (
        <>
          <path d={pathOf(ps.map((p) => [p, lab(p)]), s)} fill="none" stroke="var(--c-mute)" strokeWidth={1.3} strokeDasharray="4 3" />
          <path d={pathOf(oc ? [[p0, e0], [pc, eb], [pL, eL]] : [[p0, e0], [pL, eL]], s)} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
          <line x1={s.L} x2={s.X(pL)} y1={s.Y(eL)} y2={s.Y(eL)} stroke="var(--c-load)" strokeDasharray="3 2" />
          <text x={s.L + 4} y={s.Y(eL) - 3} fontSize={9} fill="var(--c-load)">
            0.42e0
          </text>
          <circle cx={s.X(p0)} cy={s.Y(e0)} r={3} fill="var(--c-ink)" />
          <text x={s.X(p0) + 4} y={s.Y(e0) - 4} fontSize={9} fill="var(--c-ink)">
            a (p0′, e0)
          </text>
          {oc && (
            <>
              <line x1={s.X(pc)} x2={s.X(pc)} y1={s.T} y2={s.B} stroke="var(--c-accent)" strokeDasharray="3 3" />
              <circle cx={s.X(pc)} cy={s.Y(eb)} r={3} fill="var(--c-ink)" />
              <text x={s.X(pc) + 4} y={s.Y(eb) - 4} fontSize={9} fill="var(--c-ink)">
                b (pc′), slope Cs from a
              </text>
            </>
          )}
          <circle cx={s.X(pL)} cy={s.Y(eL)} r={3} fill="var(--c-ink)" />
          <text x={s.X(pL) - 4} y={s.Y(eL) + 12} fontSize={9} textAnchor="end" fill="var(--c-ink)">
            {oc ? 'c' : 'b'} on the lab curve
          </text>
          <text x={s.R - 4} y={s.T + 12} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            - - lab (disturbed) · — field
          </text>
        </>
      )}
    </Chart>
  )
}

export type { CLayer, LoadIn }
