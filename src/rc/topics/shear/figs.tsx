// Shear figures: Vu diagram with φVc lines, required-spacing chart, stirrup layout sketch, case chart.
import { fmt } from '../../../components/DiagramView'
import { checkLayout, type RunLayout, type ShearBeam, type ShearDesign, type ShearRun } from '../../engine/shear'

const W = 680,
  M = 46,
  MR = 76 // right margin: room for the φVc / φVc/2 labels

function xScale(Ltot: number) {
  return (x: number) => M + (x / Ltot) * (W - M - MR)
}
/** rough width of an svg text run (px) */
const textW = (t: string, fs: number) => t.length * fs * 0.58
/** beam x (ft) of a point u (in) along a run */
export const runX = (r: ShearRun, u: number) => r.face + (r.dir * u) / 12

// ---------------------------------------------------------------- beam + loads
export function BeamLoads({ bm, dsg }: { bm: ShearBeam; dsg: ShearDesign }) {
  const { dg } = dsg
  const X = xScale(dg.Ltot)
  const H = 92,
    y0 = 56
  const P = bm.P ?? []
  const Pmax = Math.max(1, ...P.map((p) => p.P + (p.PL ?? 0)))
  const hasW = (bm.wD ?? 0) + (bm.wL ?? 0) > 0 || !!bm.selfWeight
  const wText = (bm.factored ? `w = ${fmt(bm.wD ?? 0, 2)} k/ft` : `w_D = ${fmt(bm.wD ?? 0, 2)}, w_L = ${fmt(bm.wL ?? 0, 2)} k/ft`) + (bm.selfWeight ? ` + self-wt ${fmt(dg.wsw, 3)}` : '')
  // point-load labels: right of the arrow unless that runs off the svg
  const pLab = P.map((p) => {
    const t = `${fmt(p.P, 1)}${p.PL ? `+${fmt(p.PL, 1)}L` : ''} k`
    const w = textW(t, 10)
    const flip = X(p.x) + 4 + w > W - 2
    return { t, flip, x0: flip ? X(p.x) - 6 - w : X(p.x) - 6, x1: flip ? X(p.x) + 6 : X(p.x) + 6 + w }
  })
  // w label: right-aligned in the widest stretch not taken by a load arrow or its label
  const taken = pLab.map((l) => [l.x0, l.x1]).sort((a, b) => a[0] - b[0])
  let gap = [X(0), X(0)],
    cur = X(0)
  for (const [a, b] of [...taken, [X(dg.Ltot), X(dg.Ltot)]]) {
    const e = Math.min(a, X(dg.Ltot))
    if (e - cur > gap[1] - gap[0]) gap = [cur, e]
    cur = Math.max(cur, b)
  }
  const wFits = gap[1] - gap[0] >= textW(wText, 10)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <marker id="shl-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-load, #f59e0b)" />
        </marker>
      </defs>
      {hasW && (
        <g>
          <rect x={X(0)} y={y0 - 16} width={X(dg.Ltot) - X(0)} height={10} fill="var(--c-load, #f59e0b)" fillOpacity={0.25} stroke="var(--c-load, #f59e0b)" strokeWidth={0.8} />
          <text x={wFits ? gap[1] : (gap[0] + gap[1]) / 2} y={y0 - 19} fontSize={10} textAnchor={wFits ? 'end' : 'middle'} fill="var(--c-mute)">
            {wText}
          </text>
        </g>
      )}
      {P.map((p, i) => {
        const len = 12 + (18 * (p.P + (p.PL ?? 0))) / Pmax
        return (
          <g key={i}>
            <line x1={X(p.x)} x2={X(p.x)} y1={y0 - 18 - len} y2={y0 - 3} stroke="var(--c-load, #f59e0b)" strokeWidth={2} markerEnd="url(#shl-ar)" />
            <text x={pLab[i].flip ? X(p.x) - 4 : X(p.x) + 4} y={y0 - 20 - len + 10} fontSize={10} textAnchor={pLab[i].flip ? 'end' : 'start'} fill="var(--c-ink)" className="num">
              {pLab[i].t}
            </text>
          </g>
        )
      })}
      <rect x={X(0)} y={y0} width={X(dg.Ltot) - X(0)} height={9} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1} />
      {dg.fixed ? (
        <g>
          <line x1={X(0)} x2={X(0)} y1={y0 - 14} y2={y0 + 22} stroke="var(--c-ink)" strokeWidth={3} />
          {[0, 1, 2, 3, 4].map((k) => (
            <line key={k} x1={X(0)} x2={X(0) - 7} y1={y0 - 12 + k * 8} y2={y0 - 6 + k * 8} stroke="var(--c-mute)" />
          ))}
        </g>
      ) : (
        dg.supports.map((s, i) => (
          <path key={i} d={`M${X(s)},${y0 + 9} l-7,12 h14 z`} fill="none" stroke="var(--c-ink)" strokeWidth={1.2} />
        ))
      )}
      {/* dimension ticks */}
      {[...new Set([0, dg.Ltot, ...dg.supports, ...P.map((p) => p.x)])]
        .sort((a, b) => a - b)
        .map((x, i, arr) =>
          i === 0 ? null : (
            <g key={x}>
              <line x1={X(arr[i - 1])} x2={X(x)} y1={H - 8} y2={H - 8} stroke="var(--c-line)" />
              <line x1={X(x)} x2={X(x)} y1={H - 12} y2={H - 4} stroke="var(--c-mute)" />
              {i === 1 && <line x1={X(arr[0])} x2={X(arr[0])} y1={H - 12} y2={H - 4} stroke="var(--c-mute)" />}
              <text x={(X(arr[i - 1]) + X(x)) / 2} y={H - 11} fontSize={9.5} textAnchor="middle" className="num" fill="var(--c-mute)">
                {fmt(x - arr[i - 1], 2)}′
              </text>
            </g>
          ),
        )}
    </svg>
  )
}

// ---------------------------------------------------------------- Vu diagram
export function VuDiagram({ dsg, d, showMarks = true }: { dsg: ShearDesign; d: number; showMarks?: boolean }) {
  const { dg, lim, runs } = dsg
  const X = xScale(dg.Ltot)
  const vs = [...dg.env.flatMap((e) => [e.Vmax, e.Vmin]), ...dg.pts.map((p) => p.V)]
  const vmax = Math.max(lim.phiVc * 1.15, ...vs.map(Math.abs))
  // only give the negative (or positive) half room when the shear actually goes there, e.g. not for a cantilever
  const hasPos = Math.max(...vs) > 0.02 * vmax,
    hasNeg = Math.min(...vs) < -0.02 * vmax
  const hi = hasPos ? vmax : 0.08 * vmax,
    lo = hasNeg ? -vmax : -0.08 * vmax
  const H = hasPos && hasNeg ? 250 : 180,
    top = 18,
    bot = 26
  const Y = (v: number) => top + ((hi - v) / (hi - lo)) * (H - top - bot)
  const labSg = hasPos ? 1 : -1
  const multi = dg.cases.length > 1
  const path = (get: (e: (typeof dg.env)[number]) => number) => dg.env.map((e, i) => `${i ? 'L' : 'M'}${X(e.x).toFixed(1)},${Y(get(e)).toFixed(1)}`).join(' ')
  const main = dg.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.V).toFixed(1)}`).join(' ')
  const fill = `${main} L${X(dg.Ltot)},${Y(0)} L${X(0)},${Y(0)} Z`
  const lines: [number, string, string][] = [
    [lim.phiVc, 'φVc', '4 0'],
    [lim.halfPhiVc, 'φVc/2', '5 4'],
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={X(0)} x2={X(dg.Ltot)} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" />
      <path d={fill} fill="var(--c-accent)" fillOpacity={0.1} />
      {multi && (
        <>
          <path d={path((e) => e.Vmax)} fill="none" stroke="var(--c-accent)" strokeOpacity={0.5} strokeDasharray="3 3" />
          <path d={path((e) => e.Vmin)} fill="none" stroke="var(--c-accent)" strokeOpacity={0.5} strokeDasharray="3 3" />
        </>
      )}
      <path d={main} fill="none" stroke="var(--c-accent)" strokeWidth={2} />
      {lines.map(([v, lab, dash]) =>
        [1, -1].filter((sg) => (sg === 1 ? hasPos : hasNeg)).map((sg) => (
          <g key={lab + sg}>
            <line x1={X(0)} x2={X(dg.Ltot)} y1={Y(sg * v)} y2={Y(sg * v)} stroke={v === lim.phiVc ? 'var(--c-good)' : 'var(--c-load, #f59e0b)'} strokeDasharray={dash} strokeWidth={1.2} />
            {sg === labSg && (
              <text x={X(dg.Ltot) + 3} y={Y(sg * v) + 3} fontSize={9.5} fill="var(--c-mute)" className="num">
                {lab} {fmt(v, 1)}
              </text>
            )}
          </g>
        )),
      )}
      {dg.pts
        .filter((p, i, a) => Math.abs(p.V) > 0.05 && (i === 0 || Math.abs(a[i - 1].V - p.V) > 0.05 || i === a.length - 1))
        .map((p, i) => (
          <text key={i} x={X(p.x) + (p.x < dg.Ltot / 2 ? 3 : -3)} y={Y(p.V) + (p.V > 0 ? -4 : 12)} fontSize={9.5} textAnchor={p.x < dg.Ltot / 2 ? 'start' : 'end'} className="num" fill="var(--c-ink)">
            {fmt(p.V, 1)}
          </text>
        ))}
      {showMarks &&
        runs.map((r) => {
          const xd = runX(r, Math.min(r.len, d))
          const sg = Math.sign(dg.V(r.face + r.dir * 0.01, r.dir === 1 ? 'R' : 'L')) || 1
          const marks: [number | null, string][] = [
            [r.uPhiVc, 'B'],
            [r.uHalf, 'C'],
          ]
          return (
            <g key={r.id}>
              {!r.critAtFace && (
                <g>
                  <circle cx={X(xd)} cy={Y(sg * r.Vd)} r={3} fill="var(--c-bad)" />
                  <text x={X(xd) + r.dir * 5} y={Y(sg * r.Vd) + (sg > 0 ? -5 : 13)} fontSize={9.5} textAnchor={r.dir === 1 ? 'start' : 'end'} fill="var(--c-bad)" className="num">
                    Vu,d {fmt(r.Vd, 1)}
                  </text>
                </g>
              )}
              {marks.map(([u, lab]) =>
                u === null ? null : (
                  <g key={lab}>
                    <line x1={X(runX(r, u))} x2={X(runX(r, u))} y1={top} y2={H - bot} stroke="var(--c-line)" strokeDasharray="2 3" />
                    <text x={X(runX(r, u))} y={H - bot + 11} fontSize={9} textAnchor="middle" fill="var(--c-mute)" className="num">
                      {fmt(u / 12, 2)}′
                    </text>
                  </g>
                ),
              )}
            </g>
          )
        })}
      <text x={X(0)} y={H - 3} fontSize={9.5} fill="var(--c-faint)">
        distances from the support face (ft) where Vu = φVc and φVc/2{multi ? ' · dashed: live-load envelope' : ''}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- required spacing chart (Fig 5.15 style)
export function SpacingChart({ dsg, layouts }: { dsg: ShearDesign; layouts: Record<string, RunLayout> }) {
  const { dg, runs, lim } = dsg
  const X = xScale(dg.Ltot)
  const H = 190,
    top = 12,
    bot = 22
  const smax = Math.max(lim.smaxC, ...runs.flatMap((r) => (layouts[r.id]?.zones ?? []).map((z) => z.s))) * 1.25
  const Y = (s: number) => top + (1 - Math.min(s, smax) / smax) * (H - top - bot)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={X(0)} x2={X(dg.Ltot)} y1={Y(0)} y2={Y(0)} stroke="var(--c-mute)" />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const s = Math.round(f * smax)
        return (
          <g key={f}>
            <line x1={X(0)} x2={X(dg.Ltot)} y1={Y(s)} y2={Y(s)} stroke="var(--c-line)" strokeOpacity={0.5} />
            <text x={X(0) - 4} y={Y(s) + 3} fontSize={9} textAnchor="end" fill="var(--c-faint)" className="num">
              {s}″
            </text>
          </g>
        )
      })}
      {runs.map((r) => {
        const pts: string[] = []
        const N = 160
        for (let i = 0; i <= N; i++) {
          const u = (r.len * i) / N
          const s = r.sReq(u)
          pts.push(`${pts.length ? 'L' : 'M'}${X(runX(r, u)).toFixed(1)},${Y(Number.isFinite(s) ? s : smax).toFixed(1)}`)
        }
        const lay = layouts[r.id]
        const chk = lay ? checkLayout(r, lay) : null
        return (
          <g key={r.id}>
            <path d={pts.join(' ')} fill="none" stroke="var(--c-accent)" strokeWidth={1.6} />
            {chk?.spaces.map((sp, i) => (
              <line key={i} x1={X(runX(r, sp.from))} x2={X(runX(r, sp.to))} y1={Y(sp.s)} y2={Y(sp.s)} stroke={sp.ok ? 'var(--c-good)' : 'var(--c-bad)'} strokeWidth={3} strokeLinecap="butt" />
            ))}
          </g>
        )
      })}
      <text x={X(0)} y={H - 4} fontSize={9.5} fill="var(--c-faint)">
        amber line: required spacing s(x) (top = not required) · bars: your spacing, green OK, red too wide
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- stirrup layout sketch
export function StirrupSketch({ dsg, layouts, h }: { dsg: ShearDesign; layouts: Record<string, RunLayout>; h?: number }) {
  const { dg, runs } = dsg
  const X = xScale(dg.Ltot)
  const H = 150,
    y0 = 34,
    bh = 46
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <rect x={X(0)} y={y0} width={X(dg.Ltot) - X(0)} height={bh} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <line x1={X(0)} x2={X(dg.Ltot)} y1={y0 + bh - 6} y2={y0 + bh - 6} stroke="var(--c-mute)" strokeWidth={2} />
      <line x1={X(0)} x2={X(dg.Ltot)} y1={y0 + 6} y2={y0 + 6} stroke="var(--c-mute)" strokeWidth={1.2} />
      {!dg.fixed && dg.supports.map((s, i) => <path key={i} d={`M${X(s)},${y0 + bh} l-7,12 h14 z`} fill="none" stroke="var(--c-ink)" />)}
      {dg.fixed && <line x1={X(0)} x2={X(0)} y1={y0 - 10} y2={y0 + bh + 10} stroke="var(--c-ink)" strokeWidth={3} />}
      {runs.map((r) => {
        const lay = layouts[r.id]
        if (!lay || !lay.count) return null
        const chk = checkLayout(r, lay)
        const bad = new Set<number>()
        chk.spaces.forEach((sp, i) => !sp.ok && (bad.add(i), bad.add(i + 1)))
        if (!chk.firstOk) bad.add(0)
        let ord = 0
        return (
          <g key={r.id}>
            {lay.pos.map((u, i) => (
              <line key={i} x1={X(runX(r, u))} x2={X(runX(r, u))} y1={y0 + 3} y2={y0 + bh - 3} stroke={bad.has(i) ? 'var(--c-bad)' : 'var(--c-good)'} strokeWidth={1.3} />
            ))}
            {[{ s: lay.first, n: 1, from: 0, to: lay.first, first: true }, ...lay.zones.map((z) => ({ ...z, first: false }))].map((z, i) => {
              const xm = X(runX(r, (z.from + z.to) / 2))
              const row = ord++ % 2
              return (
                <text key={i} x={xm} y={row ? y0 + bh + 30 : y0 + bh + 19} fontSize={9.5} textAnchor="middle" fill="var(--c-ink)" className="num">
                  {z.first ? `${fmt(z.s, 1)}″` : `${z.n}@${fmt(z.s, 1)}″`}
                </text>
              )
            })}
          </g>
        )
      })}
      {dsg.midStirrup && (
        <line x1={X(runX(runs.find((r) => r.id === 'sL')!, runs.find((r) => r.id === 'sL')!.len))} x2={X(runX(runs.find((r) => r.id === 'sL')!, runs.find((r) => r.id === 'sL')!.len))} y1={y0 + 3} y2={y0 + bh - 3} stroke="var(--c-good)" strokeWidth={1.3} strokeDasharray="3 2" />
      )}
      <text x={X(0)} y={y0 - 10} fontSize={10} fill="var(--c-mute)">
        Stirrup layout ({dsg.total} stirrups{h ? `, beam h = ${h} in` : ''}) — elevation, not to scale vertically
      </text>
      <text x={X(0)} y={H - 4} fontSize={9.5} fill="var(--c-faint)">
        first stirrup at s/2 or 2 in from the face; groups read "spaces @ spacing"
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- which case am I in?
export function CaseChart({ Vu, phiVc }: { Vu?: number; phiVc?: number }) {
  const bands = [
    { k: 'A', t: 'Vu ≤ φVc/2', d: 'no stirrups', c: 'var(--c-faint)' },
    { k: 'B', t: 'φVc/2 < Vu ≤ φVc', d: 'Av,min → s = min(d/2, 24, Av/Av,min)', c: 'var(--c-good)' },
    { k: 'C', t: 'Vs ≤ 4√f′c bw d (Vu ≤ 3φVc)', d: 'Av/s = max(3 terms), s ≤ d/2, 24 in', c: 'var(--c-accent)' },
    { k: 'D', t: 'Vs ≤ 8√f′c bw d (Vu ≤ 5φVc)', d: 'same Av/s, s ≤ d/4, 12 in', c: 'var(--c-load, #f59e0b)' },
    { k: '✗', t: 'Vs > 8√f′c bw d', d: 'redesign: enlarge bw or d', c: 'var(--c-bad)' },
  ]
  const lvl = Vu !== undefined && phiVc ? Vu / phiVc : null
  const which = lvl === null ? -1 : lvl <= 0.5 ? 0 : lvl <= 1 ? 1 : lvl <= 3 ? 2 : lvl <= 5 ? 3 : 4
  return (
    <svg viewBox="0 0 640 210" className="w-full h-auto max-w-2xl">
      <text x={8} y={16} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Compare Vu (at the section) with multiples of φVc (valid with Vc = 2√f′c bw d)
      </text>
      {bands.map((b, i) => {
        const y = 28 + i * 36
        return (
          <g key={b.k}>
            <rect x={8} y={y} width={624} height={30} rx={7} fill={b.c} fillOpacity={which === i ? 0.3 : 0.1} stroke={b.c} strokeWidth={which === i ? 2 : 0.8} />
            <text x={22} y={y + 20} fontSize={15} fontWeight={800} fill={b.c}>
              {b.k}
            </text>
            <text x={50} y={y + 19} fontSize={11.5} fill="var(--c-ink)">
              {b.t}
            </text>
            <text x={300} y={y + 19} fontSize={11} fill="var(--c-mute)">
              {b.d}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
