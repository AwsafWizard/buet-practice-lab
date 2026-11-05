// Earth-pressure figures: the wall with its pressure diagrams to scale, Mohr circles for the three states,
// pressure against wall tilt, and the theory sketches.
import { fmt } from '../../../components/DiagramView'
import { kVsTilt, stateCircles, type Wall, type WallResult } from '../../engine/earth'

const f1 = (v: number) => fmt(v, 1)
const f2 = (v: number) => fmt(v, 2)

const LAYER_OP = [0.55, 0.85, 0.4, 0.7]

type DiagKey = 'earth' | 'soil' | 'sur' | 'water' | 'front'
interface Diag {
  key: DiagKey
  title: string
  color: string
  /** value at depth z for each segment: [top, bottom] */
  pts: { z1: number; z2: number; a: number; b: number }[]
}

function diagrams(r: WallResult, w: Wall): Diag[] {
  const out: Diag[] = []
  if (r.mode === 'net') {
    out.push({ key: 'earth', title: w.q > 0 ? 'Earth σ′h (soil ± c + q)' : 'Earth σ′h (soil ± c)', color: 'var(--c-soil)', pts: r.segs.map((s) => ({ z1: s.z1, z2: s.z2, a: s.top.earth, b: s.bot.earth })) })
  } else {
    out.push({ key: 'soil', title: w.state === 'rest' ? 'Soil K0σ′0' : w.state === 'active' ? 'Soil Kaσ′0' : 'Soil Kpσ′0', color: 'var(--c-soil)', pts: r.segs.map((s) => ({ z1: s.z1, z2: s.z2, a: s.top.soil + s.top.coh, b: s.bot.soil + s.bot.coh })) })
    if (w.q > 0) out.push({ key: 'sur', title: 'Surcharge qK', color: 'var(--c-load)', pts: r.segs.map((s) => ({ z1: s.z1, z2: s.z2, a: s.top.sur, b: s.bot.sur })) })
  }
  if (r.segs.some((s) => s.bot.water > 0)) out.push({ key: 'water', title: 'Water u', color: 'var(--c-water)', pts: r.segs.map((s) => ({ z1: s.z1, z2: s.z2, a: s.top.water, b: s.bot.water })) })
  if (r.front) {
    const z1 = r.H - w.front!.D
    out.push({ key: 'front', title: 'Passive in front', color: 'var(--c-accent2)', pts: [{ z1, z2: r.H, a: r.front.coh, b: r.front.sp }] })
  }
  return out
}

/** the wall, its backfill and the separate pressure diagrams, all drawn to scale */
export function WallFig({ w, r, zMark, showDiagrams = true, width = 780 }: { w: Wall; r: WallResult | null; zMark?: number; showDiagrams?: boolean; width?: number }) {
  const H = w.layers.reduce((s, l) => s + l.h, 0)
  if (!(H > 0)) return null
  const top = 46,
    hpx = 250
  const k = hpx / H
  const Y = (z: number) => top + z * k
  const xFront = 14,
    xWall = 74,
    tw = 22,
    xB0 = xWall + tw,
    xB1 = showDiagrams ? 250 : width - 20
  const ds = showDiagrams && r ? diagrams(r, w) : []
  // common pressure scale
  const pos = ds.map((d) => Math.max(0, ...d.pts.flatMap((p) => [p.a, p.b])))
  const neg = ds.map((d) => Math.max(0, ...d.pts.flatMap((p) => [-p.a, -p.b])))
  const gap = 26
  const avail = width - xB1 - 30 - gap * ds.length
  const sum = pos.reduce((s, v, i) => s + v + neg[i], 0) || 1
  const s = Math.min(avail / sum, 6)
  const minW = 64
  let x = xB1 + 34
  const boxes = ds.map((d, i) => {
    const wd = Math.max(minW, (pos[i] + neg[i]) * s)
    const x0 = x + neg[i] * s
    x += wd + gap
    return { d, x0, wd }
  })
  const Hsvg = top + hpx + 34
  const zw = w.zw !== null && w.zw < H ? Math.max(0, w.zw) : null
  let acc = 0
  const tops = w.layers.map((l) => {
    const t = acc
    acc += l.h
    return t
  })
  return (
    <svg viewBox={`0 0 ${width} ${Hsvg}`} className="w-full" role="img" aria-label="retaining wall and pressure diagrams">
      <defs>
        <pattern id="wallhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-mute)" strokeWidth="1.2" />
        </pattern>
        <pattern id="tenshatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--c-bad)" strokeWidth="1" />
        </pattern>
        <marker id="arrh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
        </marker>
        <marker id="arrr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-accent)" />
        </marker>
      </defs>
      {/* backfill layers */}
      {w.layers.map((l, i) => (
        <g key={i}>
          <rect x={xB0} y={Y(tops[i])} width={xB1 - xB0} height={l.h * k} fill="var(--c-soil)" opacity={LAYER_OP[i % 4]} />
          <line x1={xB0} x2={xB1} y1={Y(tops[i])} y2={Y(tops[i])} stroke="var(--c-ink)" strokeWidth={i ? 0.8 : 1.2} />
          <text x={xB0 + 6} y={Y(tops[i] + l.h / 2) - (l.h * k > 34 ? 6 : 0)} fontSize={10} fill="var(--c-ink)">
            {l.phi === 0 && l.c > 0 ? `cu = ${f1(l.c)}` : `φ′ = ${f1(l.phi)}°${l.c ? `, c′ = ${f1(l.c)}` : ''}`}
          </text>
          {l.h * k > 34 && (
            <text x={xB0 + 6} y={Y(tops[i] + l.h / 2) + 8} fontSize={9.5} fill="var(--c-mute)">
              γ = {f1(l.gamma)}
              {l.gammaSat !== undefined && l.gammaSat !== l.gamma ? `, γsat = ${f1(l.gammaSat)}` : ''}
            </text>
          )}
        </g>
      ))}
      {/* water table */}
      {zw !== null && (
        <g>
          <line x1={xB0} x2={xB1} y1={Y(zw)} y2={Y(zw)} stroke="var(--c-water)" strokeWidth={1.4} strokeDasharray="6 3" />
          <path d={`M${xB1 - 26},${Y(zw) - 9} l8,0 l-4,7 z`} fill="var(--c-water)" />
          <text x={xB1 - 4} y={Y(zw) - 3} fontSize={9.5} textAnchor="end" fill="var(--c-water)">
            WT
          </text>
        </g>
      )}
      {/* crack */}
      {r?.tension.map((t, i) => (
        <g key={i}>
          <rect x={xB0} y={Y(t.from)} width={14} height={(t.to - t.from) * k} fill="url(#tenshatch)" />
          <path d={`M${xB0 + 3},${Y(t.from)} l6,${((t.to - t.from) * k) / 4} l-5,${((t.to - t.from) * k) / 4} l6,${((t.to - t.from) * k) / 4} l-4,${((t.to - t.from) * k) / 4}`} fill="none" stroke="var(--c-bad)" strokeWidth={1.3} />
        </g>
      ))}
      {/* surcharge */}
      {w.q > 0 && (
        <g>
          {Array.from({ length: 7 }, (_, i) => xB0 + 8 + (i * (xB1 - xB0 - 16)) / 6).map((ax) => (
            <line key={ax} x1={ax} x2={ax} y1={top - 18} y2={top - 2} stroke="var(--c-load)" strokeWidth={1.3} markerEnd="url(#arrh)" />
          ))}
          <line x1={xB0 + 8} x2={xB1 - 8} y1={top - 18} y2={top - 18} stroke="var(--c-load)" strokeWidth={1.3} />
          <text x={(xB0 + xB1) / 2} y={top - 23} fontSize={10} textAnchor="middle" fill="var(--c-load)">
            q = {f1(w.q)} kPa
          </text>
        </g>
      )}
      {/* wall */}
      <rect x={xWall} y={top - 6} width={tw} height={hpx + 6} fill="url(#wallhatch)" stroke="var(--c-ink)" strokeWidth={1.2} />
      <line x1={xFront - 6} x2={xB1} y1={Y(H)} y2={Y(H)} stroke="var(--c-ink)" strokeWidth={1.4} />
      {/* soil in front */}
      {w.front && w.front.D > 0 && (
        <g>
          <rect x={xFront} y={Y(H - w.front.D)} width={xWall - xFront} height={w.front.D * k} fill="var(--c-soil)" opacity={0.5} />
          <text x={(xFront + xWall) / 2} y={Y(H - w.front.D / 2) + 3} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
            D = {f1(w.front.D)}
          </text>
        </g>
      )}
      {/* depth ticks */}
      {[...new Set([0, ...tops, ...(zw !== null ? [zw] : []), H])].map((z) => (
        <g key={z}>
          <line x1={xWall - 5} x2={xWall} y1={Y(z)} y2={Y(z)} stroke="var(--c-mute)" />
          <text x={xWall - 7} y={Y(z) + 3} fontSize={9} textAnchor="end" fill="var(--c-mute)">
            {f2(z)}
          </text>
        </g>
      ))}
      {zMark !== undefined && zMark >= 0 && zMark <= H && (
        <g>
          <rect x={(xB0 + xB1) / 2 - 7} y={Y(zMark) - 7} width={14} height={14} fill="var(--c-accent)" opacity={0.85} />
          <text x={(xB0 + xB1) / 2 + 10} y={Y(zMark) + 3} fontSize={9.5} fill="var(--c-accent)">
            element, z = {f2(zMark)} m
          </text>
        </g>
      )}
      {/* resultant */}
      {r && showDiagrams && Number.isFinite(r.zbar) && r.Fs !== 0 && (
        <g>
          <line x1={xB0 + 60} x2={xB0 + 3} y1={Y(H - r.zbar)} y2={Y(H - r.zbar)} stroke="var(--c-accent)" strokeWidth={2.2} markerEnd="url(#arrr)" />
          <text x={xB0 + 62} y={Y(H - r.zbar) + 4} fontSize={10} fontWeight={600} fill="var(--c-accent)">
            {w.front ? 'net ' : ''}
            {f2(r.Fs)} kN/m @ {f2(r.zbar)} m
          </text>
        </g>
      )}
      {/* diagrams */}
      {boxes.map(({ d, x0, wd }) => {
        const poly: string[] = []
        const zStart = d.pts[0].z1,
          zEnd = d.pts[d.pts.length - 1].z2
        poly.push(`${x0},${Y(zStart)}`)
        for (const p of d.pts) {
          poly.push(`${x0 + p.a * s},${Y(p.z1)}`)
          poly.push(`${x0 + p.b * s},${Y(p.z2)}`)
        }
        poly.push(`${x0},${Y(zEnd)}`)
        const labels: { z: number; v: number; dy: number }[] = []
        d.pts.forEach((p, i) => {
          const prev = d.pts[i - 1]
          if (!prev || Math.abs(prev.b - p.a) > 1e-6) labels.push({ z: p.z1, v: p.a, dy: prev ? 10 : 10 })
          labels.push({ z: p.z2, v: p.b, dy: i === d.pts.length - 1 ? -3 : -3 })
        })
        if (d.key === 'front') labels.splice(0, labels.length, { z: d.pts[0].z2, v: d.pts[0].b, dy: -3 }, ...(d.pts[0].a > 0 ? [{ z: d.pts[0].z1, v: d.pts[0].a, dy: 10 }] : []))
        return (
          <g key={d.key}>
            <text x={x0 - (d.pts.some((p) => p.a < 0) ? 20 : 0)} y={top - 22} fontSize={10} fontWeight={600} fill="var(--c-ink)">
              {d.title}
            </text>
            <polygon points={poly.join(' ')} fill={d.color} opacity={0.35} stroke={d.color} strokeWidth={1.4} />
            {/* tension part */}
            {d.pts
              .filter((p) => p.a < 0)
              .map((p, i) => {
                const zc = p.b > 0 ? p.z1 + ((p.z2 - p.z1) * -p.a) / (p.b - p.a) : p.z2
                const vb = p.b > 0 ? 0 : p.b
                return <polygon key={i} points={`${x0},${Y(p.z1)} ${x0 + p.a * s},${Y(p.z1)} ${x0 + vb * s},${Y(zc)} ${x0},${Y(zc)}`} fill="url(#tenshatch)" stroke="var(--c-bad)" strokeWidth={1} />
              })}
            <line x1={x0} x2={x0} y1={top - 4} y2={Y(H) + 4} stroke="var(--c-ink)" strokeWidth={1} />
            {labels.map((l, i) =>
              Math.abs(l.v) > 1e-6 ? (
                <text key={i} x={x0 + l.v * s + (l.v < 0 ? -3 : 3)} y={Y(l.z) + l.dy} fontSize={9.5} textAnchor={l.v < 0 ? 'end' : 'start'} fill={l.v < 0 ? 'var(--c-bad)' : 'var(--c-ink)'}>
                  {f2(l.v)}
                </text>
              ) : null,
            )}
            {wd > 0 && <line x1={x0} x2={x0} y1={Y(H)} y2={Y(H)} />}
          </g>
        )
      })}
      {showDiagrams && r && (
        <text x={width - 6} y={Hsvg - 6} fontSize={9} textAnchor="end" fill="var(--c-faint)">
          diagrams to one pressure scale (kPa); depths in m from the top
        </text>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- Mohr circles for one element in the three states
export function StateMohrFig({ sv, phi, c, K0, show = ['rest', 'active', 'passive'] }: { sv: number; phi: number; c: number; K0?: number; show?: ('rest' | 'active' | 'passive')[] }) {
  const st = stateCircles({ sv, phi, c, K0 })
  const W = 640,
    Hh = 300,
    L = 40,
    B = 40
  const maxS = Math.max(st.passive.s1, sv) * 1.08
  const k = (W - L - 20) / maxS
  const yMax = (Hh - B - 20) / k
  const X = (s: number) => L + s * k
  const Yv = (t: number) => Hh - B - t * k
  const tanp = Math.tan((phi * Math.PI) / 180)
  const eEnd = Math.min(maxS, (yMax - c) / Math.max(tanp, 1e-6))
  const col = { rest: 'var(--c-mute)', active: 'var(--c-accent)', passive: 'var(--c-accent2)' } as const
  const lab = { rest: 'at rest', active: 'active', passive: 'passive' } as const
  const cs = show.map((key) => ({ key, cc: st[key] }))
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full" role="img" aria-label="Mohr circles at rest, active and passive">
      <line x1={L} x2={W - 10} y1={Yv(0)} y2={Yv(0)} stroke="var(--c-ink)" />
      <line x1={L} x2={L} y1={Yv(0)} y2={12} stroke="var(--c-ink)" />
      <text x={W - 12} y={Yv(0) + 14} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        σ′ (kPa)
      </text>
      <text x={L + 4} y={18} fontSize={10} fill="var(--c-ink)">
        τ
      </text>
      <line x1={X(0)} x2={X(eEnd)} y1={Yv(c)} y2={Yv(c + eEnd * tanp)} stroke="var(--c-bad)" strokeWidth={1.5} />
      <text x={X(eEnd) - 4} y={Yv(c + eEnd * tanp) + 14} fontSize={10} textAnchor="end" fill="var(--c-bad)">
        τ = {c ? `${f1(c)} + ` : ''}σ′ tan {f1(phi)}°
      </text>
      {cs.map(({ key, cc }) => (
        <g key={key}>
          <path d={`M${X(cc.C - cc.R)},${Yv(0)} A${cc.R * k},${cc.R * k} 0 0 1 ${X(cc.C + cc.R)},${Yv(0)}`} fill="none" stroke={col[key]} strokeWidth={1.8} />
          <circle cx={X(cc.sh)} cy={Yv(0)} r={3} fill={col[key]} />
          <text x={X(cc.sh)} y={Yv(0) + (key === 'active' ? 36 : 25)} fontSize={9.5} textAnchor={key === 'passive' ? 'end' : 'middle'} fill={col[key]}>
            {lab[key]} σ′h = {f1(cc.sh)}
          </text>
          {key !== 'rest' && (
            <g>
              <circle cx={X(cc.tp.sigma)} cy={Yv(cc.tp.tau)} r={3} fill="var(--c-bad)" />
              {/* pole and the failure planes through it */}
              <line x1={X(cc.sh)} y1={Yv(0)} x2={X(cc.tp.sigma)} y2={Yv(cc.tp.tau)} stroke={col[key]} strokeDasharray="4 3" />
              <text x={X(cc.sh) + 4} y={Yv(0) - 4} fontSize={9} fill={col[key]}>
                pole
              </text>
            </g>
          )}
        </g>
      ))}
      <line x1={X(sv)} x2={X(sv)} y1={Yv(0) - 4} y2={Yv(0) + 4} stroke="var(--c-ink)" strokeWidth={2} />
      <text x={X(sv)} y={Yv(0) + 14} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)">
        σ′v = {f1(sv)}
      </text>
    </svg>
  )
}

/** element sketch: principal planes and failure planes for one state (2023-24 Q2(c)) */
export function ElementFig({ state, phi, size = 150 }: { state: 'rest' | 'active' | 'passive'; phi: number; size?: number }) {
  const c = size / 2
  const a = size * 0.26
  const major = state === 'passive' ? 'vertical' : 'horizontal'
  const th = state === 'active' ? 45 + phi / 2 : state === 'passive' ? 45 - phi / 2 : null
  const line = (deg: number, col: string) => {
    const r = (deg * Math.PI) / 180,
      L = size * 0.46
    return <line x1={c - L * Math.cos(r)} y1={c + L * Math.sin(r)} x2={c + L * Math.cos(r)} y2={c - L * Math.sin(r)} stroke={col} strokeWidth={1.5} strokeDasharray="5 3" />
  }
  const vBig = state !== 'passive'
  const arrow = (x1: number, y1: number, x2: number, y2: number, w: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-load)" strokeWidth={w} markerEnd="url(#elarr)" />
  return (
    <svg viewBox={`0 0 ${size} ${size + 42}`} className="w-full max-w-[180px]" role="img" aria-label={`${state} element`}>
      <defs>
        <marker id="elarr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load)" />
        </marker>
      </defs>
      <rect x={c - a} y={c - a} width={2 * a} height={2 * a} fill="var(--c-soil)" opacity={0.5} stroke="var(--c-ink)" />
      {/* vertical stress */}
      {arrow(c, c - a - 24, c, c - a - 2, vBig ? 2.6 : 1.4)}
      {arrow(c, c + a + 24, c, c + a + 2, vBig ? 2.6 : 1.4)}
      {/* horizontal stress */}
      {arrow(c - a - 24, c, c - a - 2, c, vBig ? (state === 'active' ? 1 : 1.6) : 2.6)}
      {arrow(c + a + 24, c, c + a + 2, c, vBig ? (state === 'active' ? 1 : 1.6) : 2.6)}
      <text x={c + 4} y={c - a - 16} fontSize={9} fill="var(--c-ink)">
        σ′v{vBig ? ' = σ1' : ' = σ3'}
      </text>
      <text x={c + a + 2} y={c - 6} fontSize={9} fill="var(--c-ink)">
        σ′h{vBig ? ' = σ3' : ' = σ1'}
      </text>
      {th !== null && line(th, 'var(--c-bad)')}
      {th !== null && line(180 - th, 'var(--c-bad)')}
      <text x={c} y={size + 10} fontSize={10} fontWeight={600} textAnchor="middle" fill="var(--c-ink)">
        {state === 'rest' ? 'At rest' : state === 'active' ? 'Active' : 'Passive'}
      </text>
      <text x={c} y={size + 23} fontSize={8.5} textAnchor="middle" fill="var(--c-bad)">
        {state === 'rest' ? 'no failure plane' : `failure planes ${f1(th!)}° to horizontal`}
      </text>
      <text x={c} y={size + 35} fontSize={8.5} textAnchor="middle" fill="var(--c-mute)">
        major principal plane {major}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- pressure vs wall tilt
export function TiltFig({ k0, ka, kp, xa, xp, x }: { k0: number; ka: number; kp: number; xa: number; xp: number; x?: number }) {
  const W = 560,
    H = 250,
    L = 46,
    B = 34
  const xmax = Math.max(xp * 1.3, xa * 4)
  const xmin = -xmax * 0.45
  const X = (v: number) => L + ((v - xmin) / (xmax - xmin)) * (W - L - 12)
  const Y = (v: number) => H - B - (v / (kp * 1.1)) * (H - B - 14)
  const pts = Array.from({ length: 241 }, (_, i) => xmin + (i / 240) * (xmax - xmin))
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(kVsTilt(v, { k0, ka, kp, xa, xp })).toFixed(1)}`).join(' ')
  const cur = x !== undefined ? kVsTilt(x, { k0, ka, kp, xa, xp }) : null
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="earth pressure against wall tilt">
      <line x1={L} x2={W - 8} y1={Y(0)} y2={Y(0)} stroke="var(--c-ink)" />
      <line x1={X(0)} x2={X(0)} y1={Y(0)} y2={10} stroke="var(--c-ink)" />
      {[
        [k0, 'K0'],
        [ka, 'Ka'],
        [kp, 'Kp'],
      ].map(([v, t]) => (
        <g key={t as string}>
          <line x1={L} x2={W - 8} y1={Y(v as number)} y2={Y(v as number)} stroke="var(--c-line)" strokeDasharray="3 3" />
          <text x={L - 4} y={Y(v as number) + 3} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
            {t as string} {fmt(v as number, 2)}
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      <line x1={X(-xa)} x2={X(-xa)} y1={Y(0) - 3} y2={Y(0) + 3} stroke="var(--c-ink)" />
      <text x={X(-xa)} y={Y(0) + 13} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
        −{fmt(xa, 4)}
      </text>
      <line x1={X(xp)} x2={X(xp)} y1={Y(0) - 3} y2={Y(0) + 3} stroke="var(--c-ink)" />
      <text x={X(xp)} y={Y(0) + 13} fontSize={9} textAnchor="middle" fill="var(--c-ink)">
        {fmt(xp, 4)}
      </text>
      <text x={X(xmin) + 2} y={Y(0) + 26} fontSize={9.5} fill="var(--c-mute)">
        ← away from backfill (active)
      </text>
      <text x={W - 10} y={Y(0) + 26} fontSize={9.5} textAnchor="end" fill="var(--c-mute)">
        into the backfill (passive) →  ΔL/H
      </text>
      <text x={X(0) + 4} y={16} fontSize={10} fill="var(--c-ink)">
        K = σ′h/σ′v
      </text>
      {cur !== null && (
        <g>
          <circle cx={X(x!)} cy={Y(cur)} r={4.5} fill="var(--c-load)" />
          <text x={X(x!) + 7} y={Y(cur) - 6} fontSize={10} fill="var(--c-load)">
            K = {fmt(cur, 3)}
          </text>
        </g>
      )}
    </svg>
  )
}

// ---------------------------------------------------------------- theory sketches
export const TiltSketch = () => <TiltFig k0={0.5} ka={0.333} kp={3} xa={0.002} xp={0.02} />

export function PlanesSketch() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <ElementFig state="rest" phi={30} />
      <ElementFig state="active" phi={30} />
      <ElementFig state="passive" phi={30} />
    </div>
  )
}

export const StatesMohrSketch = () => <StateMohrFig sv={100} phi={30} c={0} />

/** wedges behind the wall: active steep (45 + φ/2), passive flat (45 − φ/2) */
export function WedgeSketch({ phi = 30 }: { phi?: number }) {
  const W = 520,
    H = 170,
    h = 110,
    x0 = 70,
    y0 = 30
  const ta = Math.tan(((45 + phi / 2) * Math.PI) / 180),
    tp = Math.tan(((45 - phi / 2) * Math.PI) / 180)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="active and passive wedges">
      <rect x={x0 - 14} y={y0} width={14} height={h} fill="var(--c-mute)" opacity={0.5} />
      <rect x={x0} y={y0} width={W - x0 - 10} height={h} fill="var(--c-soil)" opacity={0.35} />
      <path d={`M${x0},${y0 + h} L${x0 + h / ta},${y0} L${x0},${y0} Z`} fill="var(--c-accent)" opacity={0.3} stroke="var(--c-accent)" />
      <path d={`M${x0},${y0 + h} L${x0 + h / tp},${y0}`} stroke="var(--c-accent2)" strokeWidth={1.5} strokeDasharray="5 3" fill="none" />
      <text x={x0 + h / ta + 4} y={y0 - 4} fontSize={10} fill="var(--c-accent)">
        active: {fmt(45 + phi / 2, 1)}°, {fmt(1 / ta, 2)}H
      </text>
      <text x={x0 + h / tp - 4} y={y0 - 4} fontSize={10} textAnchor="end" fill="var(--c-accent2)">
        passive: {fmt(45 - phi / 2, 1)}°, {fmt(1 / tp, 2)}H
      </text>
      <text x={x0 - 18} y={y0 + h / 2} fontSize={10} textAnchor="end" fill="var(--c-ink)">
        H
      </text>
    </svg>
  )
}

/** 2007-08 Q1(j): qualitative two-layer active diagrams */
export function TwoLayerSketch() {
  const cases: { t: string; k1: number; g1: number; k2: number; g2: number }[] = [
    { t: '(i) φ1 = φ2, γ1 > γ2', k1: 0.33, g1: 20, k2: 0.33, g2: 14 },
    { t: '(ii) φ1 > φ2, γ1 = γ2', k1: 0.27, g1: 18, k2: 0.4, g2: 18 },
    { t: '(iii) φ1 < φ2, γ1 < γ2', k1: 0.4, g1: 16, k2: 0.27, g2: 20 },
    { t: '(iv) φ1 > φ2, γ1 > γ2', k1: 0.27, g1: 20, k2: 0.4, g2: 15 },
    { t: '(v) φ1 < φ2, γ1 > γ2', k1: 0.4, g1: 20, k2: 0.27, g2: 15 },
  ]
  const w = 110,
    h = 120
  return (
    <svg viewBox={`0 0 ${cases.length * w} ${h + 30}`} className="w-full" role="img" aria-label="two-layer active pressure diagrams">
      {cases.map((c, i) => {
        const x0 = i * w + 12
        const s = 2.2
        const a1 = c.k1 * c.g1 * 3 * s,
          a2 = c.k2 * c.g1 * 3 * s,
          b2 = a2 + c.k2 * c.g2 * 3 * s
        const yi = 10 + h / 2,
          yb = 10 + h
        return (
          <g key={i}>
            <line x1={x0} x2={x0} y1={10} y2={yb} stroke="var(--c-ink)" />
            <line x1={x0} x2={x0 + 90} y1={yi} y2={yi} stroke="var(--c-line)" strokeDasharray="3 2" />
            <polygon points={`${x0},10 ${x0 + a1 * 0.5},${yi} ${x0 + a2 * 0.5},${yi} ${x0 + b2 * 0.5},${yb} ${x0},${yb}`} fill="var(--c-soil)" opacity={0.5} stroke="var(--c-ink)" />
            <text x={x0 - 4} y={h + 26} fontSize={8.5} fill="var(--c-ink)">
              {c.t}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
