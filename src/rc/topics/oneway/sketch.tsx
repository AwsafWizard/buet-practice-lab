// One-way slab sketches: continuous slab section with the class bar layout, and the cantilever strip
// (live-load pattern, moment diagram with envelope, bar layout).
import type { CantSlabResult, LLPattern, OneWayCoefResult } from '../../engine/oneway'
import { stripStatics } from '../../engine/oneway'
import { barTxt, f } from './kit'

const BLUE = '#3b82f6'
const RED = 'var(--c-bad)'
const GREEN = 'var(--c-good)'

// ---------------------------------------------------------------- continuous slab
export function ContSketch({ r }: { r: OneWayCoefResult }) {
  const spans = r.input.spans
  const n = spans.length
  const bw = 1 // visual support width (ft)
  const total = spans.reduce((a, b) => a + b, 0) + (n + 1) * bw
  const W = 680
  const m = 22
  const k = (W - 2 * m) / total
  const X = (ft: number) => m + ft * k
  const yT = 92
  const t = 16
  const yB = yT + t
  const faces = spans.map((_, j) => {
    const x0 = bw * (j + 1) + spans.slice(0, j).reduce((a, b) => a + b, 0)
    return { x0, x1: x0 + spans[j] }
  })
  const supC = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? bw / 2 : faces[i - 1].x1 + bw / 2))
  const ends = r.input.ends
  const sec = (id: string) => r.sections.find((s) => s.id === id)
  const extraOf = (i: number) => r.supports.find((s) => s.sec.at === i)
  const topY = yT + 3
  const botY = yB - 3
  return (
    <svg viewBox={`0 0 ${W} 190`} className="w-full h-auto">
      {/* slab */}
      <rect x={X(0)} y={yT} width={X(total) - X(0)} height={t} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1} />
      {/* supports */}
      {supC.map((c, i) => {
        const ext = i === 0 || i === n
        const brick = ext && ends[i === 0 ? 0 : 1] === 'unrestrained'
        return (
          <g key={i}>
            <rect x={X(c - bw / 2)} y={yB} width={bw * k} height={30} fill={brick ? 'url(#brk)' : 'var(--c-panel2)'} stroke="var(--c-mute)" />
            {ext && !brick && ends[i === 0 ? 0 : 1] === 'column' && <rect x={X(c - bw / 2)} y={yB + 30} width={bw * k} height={20} fill="var(--c-panel2)" stroke="var(--c-mute)" strokeDasharray="3 2" />}
          </g>
        )
      })}
      <defs>
        <pattern id="brk" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-mute)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* coefficient + moment labels */}
      {supC.map((c, i) => {
        const s = sec(`s${i}`)
        if (!s) return null
        return (
          <text key={'s' + i} x={X(c) + (i === 0 ? -6 : i === n ? 6 : 0)} y={yT - 26} fontSize={10} textAnchor={i === 0 ? 'start' : i === n ? 'end' : 'middle'} fill={RED} className="num">
            −1/{s.den} · {f(s.Mu, 2)}
          </text>
        )
      })}
      {faces.map((fc, j) => {
        const s = sec(`p${j}`)!
        return (
          <text key={'p' + j} x={X((fc.x0 + fc.x1) / 2)} y={yT - 10} fontSize={10} textAnchor="middle" fill={GREEN} className="num">
            +1/{s.den} · {f(s.Mu, 2)}
          </text>
        )
      })}
      {/* bottom straight bars */}
      {faces.map((fc, j) => (
        <line key={'b' + j} x1={X(fc.x0 - bw * 0.4)} x2={X(fc.x1 + bw * 0.4)} y1={botY} y2={botY} stroke={BLUE} strokeWidth={1.8} />
      ))}
      {/* alternate cranked bars */}
      {faces.map((fc, j) => {
        const ln = spans[j]
        const extL = j === 0
        const extR = j === n - 1
        const bL = extL ? ln / 7 : ln / 4
        const bR = extR ? ln / 7 : ln / 4
        const sl = 0.7
        const startL = extL ? fc.x0 - bw * 0.4 : fc.x0 - spans[j - 1] / 4 + 0.3
        const endR = extR ? fc.x1 + bw * 0.4 : fc.x1 + spans[j + 1] / 4 - 0.3
        const yb = botY - 2
        const d = `M${X(startL)},${extL ? topY + 7 : topY} L${X(startL)},${topY} L${X(fc.x0 + bL)},${topY} L${X(fc.x0 + bL + sl)},${yb} L${X(fc.x1 - bR - sl)},${yb} L${X(fc.x1 - bR)},${topY} L${X(endR)},${topY} L${X(endR)},${extR ? topY + 7 : topY}`
        return <path key={'c' + j} d={d} fill="none" stroke={RED} strokeWidth={1.6} />
      })}
      {/* extra top bars */}
      {supC.map((c, i) => {
        const e = extraOf(i)
        if (!e || e.extra.n === 0) return null
        const left = i === 0 ? c - bw * 0.4 : c - spans[i - 1] / 3
        const right = i === n ? c + bw * 0.4 : c + spans[i] / 3
        return (
          <g key={'e' + i}>
            <line x1={X(left)} x2={X(right)} y1={topY + 3.5} y2={topY + 3.5} stroke={GREEN} strokeWidth={2.2} />
            <text x={X(c) + (i === 0 ? -6 : i === n ? 6 : 0)} y={yT - 40} fontSize={9.5} textAnchor={i === 0 ? 'start' : i === n ? 'end' : 'middle'} fill={GREEN}>
              {e.extra.n} #{r.bar} extra
            </text>
          </g>
        )
      })}
      {/* T&S dots */}
      {faces.map((fc, j) =>
        Array.from({ length: Math.max(3, Math.round(spans[j] / 2)) }, (_, q) => {
          const x = fc.x0 + ((q + 0.5) * spans[j]) / Math.max(3, Math.round(spans[j] / 2))
          return <circle key={`t${j}-${q}`} cx={X(x)} cy={botY - 4} r={1.6} fill="var(--c-mute)" />
        }),
      )}
      {faces.map((fc, j) => (
        <g key={'d' + j}>
          <line x1={X(fc.x0)} x2={X(fc.x1)} y1={yB + 44} y2={yB + 44} stroke="var(--c-faint)" />
          <text x={X((fc.x0 + fc.x1) / 2)} y={yB + 58} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
            clear {f(spans[j])}′ · {barTxt(r.bar, r.spanBars[j].s)}
          </text>
        </g>
      ))}
      <text x={W - m} y={186} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
        blue = bottom straight · red = alternate cranked (bend ln/7 at an end, ln/4 at an interior support) · green = extra top (ln/3) · dots = T&S bars
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- cantilever strip
export function CantSketch({ r, pattern }: { r: CantSlabResult; pattern: LLPattern }) {
  const g = r.geo
  const x0 = -g.acL
  const x1 = g.L + g.acR
  const W = 680
  const m = 30
  const k = (W - 2 * m) / (x1 - x0)
  const X = (x: number) => m + (x - x0) * k
  const bw = r.input.support / 12
  const { wDk, wuk } = r.loads
  const loaded = (seg: 'l' | 's' | 'r') => (pattern === 'all' ? true : pattern === 'cant' ? seg !== 's' : seg === 's')
  const segs: { seg: 'l' | 's' | 'r'; a: number; b: number }[] = [
    ...(g.acL > 0 ? [{ seg: 'l' as const, a: -g.acL, b: 0 }] : []),
    { seg: 's', a: 0, b: g.L },
    ...(g.acR > 0 ? [{ seg: 'r' as const, a: g.L, b: g.L + g.acR }] : []),
  ]
  // BMD
  const pats: LLPattern[] = ['cant', 'span', 'all']
  const stat = Object.fromEntries(pats.map((p) => [p, r.patterns[p]])) as Record<LLPattern, ReturnType<typeof stripStatics>>
  const N = 160
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + ((x1 - x0) * i) / N)
  const Mabs = Math.max(...pats.flatMap((p) => xs.map((x) => Math.abs(stat[p].M(x)))), 1e-6)
  const y0 = 190
  const sc = 60 / Mabs
  const Yc = (M: number) => y0 + M * sc
  const path = (p: LLPattern) => xs.map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Yc(stat[p].M(x)).toFixed(1)}`).join(' ')
  const cur = stat[pattern]
  // bar layout
  const yS = 300
  const t = 14
  const topY = yS + 3
  const botY = yS + t - 3
  const bL = g.L / 4
  return (
    <svg viewBox={`0 0 ${W} 360`} className="w-full h-auto">
      {/* loads */}
      <text x={m} y={14} fontSize={10} fill="var(--c-mute)" fontWeight={700}>
        {pattern === 'cant' ? 'Max −M / uplift pattern' : pattern === 'span' ? 'Max +M pattern' : 'Full load everywhere'} · w_D = {f(wDk, 3)}, w_u = {f(wuk, 3)} k/ft
      </text>
      {segs.map((s) => (
        <g key={s.seg}>
          <rect x={X(s.a)} y={56} width={(s.b - s.a) * k} height={12} fill="var(--c-mute)" fillOpacity={0.25} stroke="var(--c-mute)" strokeWidth={0.6} />
          {loaded(s.seg) && <rect x={X(s.a)} y={28} width={(s.b - s.a) * k} height={28} fill="var(--c-load)" fillOpacity={0.3} stroke="var(--c-load)" strokeWidth={0.8} />}
          <text x={X((s.a + s.b) / 2)} y={loaded(s.seg) ? 46 : 65} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)">
            {loaded(s.seg) ? '1.2D + 1.6L' : '1.2D'}
          </text>
        </g>
      ))}
      <line x1={X(x0)} x2={X(x1)} y1={74} y2={74} stroke="var(--c-ink)" strokeWidth={3} />
      {[0, g.L].map((x, i) => (
        <g key={i}>
          <rect x={X(x - bw / 2)} y={76} width={bw * k} height={18} fill="var(--c-panel2)" stroke="var(--c-mute)" />
          <text x={X(x)} y={106} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
            {i ? 'B' : 'A'} · R = {f(i ? cur.RB : cur.RA, 2)} k
          </text>
        </g>
      ))}
      {/* BMD */}
      <line x1={X(x0)} x2={X(x1)} y1={y0} y2={y0} stroke="var(--c-line)" />
      {pats
        .filter((p) => p !== pattern)
        .map((p) => (
          <path key={p} d={path(p)} fill="none" stroke="var(--c-faint)" strokeDasharray="4 3" strokeWidth={1} />
        ))}
      <path d={`${path(pattern)} L${X(x1)},${y0} L${X(x0)},${y0} Z`} fill="var(--c-accent)" fillOpacity={0.15} stroke="var(--c-accent)" strokeWidth={1.8} />
      <text x={X(cur.xm)} y={Yc(cur.Mmax) + (cur.Mmax >= 0 ? 14 : -6)} fontSize={10} textAnchor="middle" fill="var(--c-accent)" className="num" fontWeight={700}>
        span max {f(cur.Mmax, 2)}
      </text>
      {g.acL > 0 && (
        <text x={X(0)} y={Yc(cur.MA) - 6} fontSize={10} textAnchor="middle" fill="var(--c-accent)" className="num">
          {f(cur.MA, 2)}
        </text>
      )}
      {g.acR > 0 && (
        <text x={X(g.L)} y={Yc(cur.MB) - 6} fontSize={10} textAnchor="middle" fill="var(--c-accent)" className="num">
          {f(cur.MB, 2)}
        </text>
      )}
      <text x={W - m} y={y0 - 64} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
        BMD (k-ft/ft; hogging up, sagging down) · dashed = other two patterns (envelope)
      </text>
      {/* bar layout */}
      <text x={m} y={yS - 18} fontSize={10} fill="var(--c-mute)" fontWeight={700}>
        Section: {barTxt(r.bar, r.pos.s)} bottom, alternate bars cranked into the cantilever top{r.extra.n ? `, + ${r.extra.n} #${r.bar} extra top per ${f(r.extra.width, 1)} in` : ''}
      </text>
      <rect x={X(x0)} y={yS} width={(x1 - x0) * k} height={t} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      {[0, g.L].map((x, i) => (
        <rect key={i} x={X(x - bw / 2)} y={yS + t} width={bw * k} height={18} fill="var(--c-panel2)" stroke="var(--c-mute)" />
      ))}
      <line x1={X(-bw / 2)} x2={X(g.L + bw / 2)} y1={botY} y2={botY} stroke={BLUE} strokeWidth={1.8} />
      <path
        d={`M${X(g.acL > 0 ? x0 + 0.2 : -bw / 2)},${g.acL > 0 ? topY + 6 : topY} L${X(g.acL > 0 ? x0 + 0.2 : -bw / 2)},${topY} L${X(bL)},${topY} L${X(bL + 0.6)},${botY - 2} L${X(g.L - bL - 0.6)},${botY - 2} L${X(g.L - bL)},${topY} L${X(g.acR > 0 ? x1 - 0.2 : g.L + bw / 2)},${topY} L${X(g.acR > 0 ? x1 - 0.2 : g.L + bw / 2)},${g.acR > 0 ? topY + 6 : topY}`}
        fill="none"
        stroke={RED}
        strokeWidth={1.6}
      />
      {r.extra.n > 0 &&
        [
          ...(g.acL > 0 ? [[x0 + 0.2, Math.min(r.topExt + bw / 2, g.L)]] : []),
          ...(g.acR > 0 ? [[Math.max(g.L - r.topExt - bw / 2, 0), x1 - 0.2]] : []),
        ].map(([a, b], i) => <line key={i} x1={X(a)} x2={X(b)} y1={topY + 3.5} y2={topY + 3.5} stroke={GREEN} strokeWidth={2.2} />)}
      {r.uplift.negThrough && <line x1={X(0)} x2={X(g.L)} y1={topY + 1} y2={topY + 1} stroke="var(--c-load)" strokeWidth={1.2} strokeDasharray="5 3" />}
      <text x={X(g.L / 2)} y={yS + t + 30} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        clear {f(r.input.span)}′ (L = {f(g.L, 2)}′ c/c){g.acL > 0 ? ` · left cant ${f(r.input.cantL)}′` : ''}
        {g.acR > 0 ? ` · right cant ${f(r.input.cantR)}′` : ''}
      </text>
      <text x={W - m} y={354} fontSize={9.5} textAnchor="end" fill="var(--c-faint)">
        blue = bottom · red = alt. cranked · green = extra top (cantilever + {f(r.topExt, 1)}′ into span){r.uplift.negThrough ? ' · orange dashed = top As,min through the span' : ''}
      </text>
    </svg>
  )
}
