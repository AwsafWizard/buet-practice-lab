// Shared CE 315 flexure UI: solution step list, beam section sketch, loading-stage strain/stress diagrams.
// Used by the elastic, singly and basics topics (and free for past-paper solutions).

import type { ReactNode } from 'react'
import { Md, Tex } from '../../../components/ui'
import { f, type SolStep } from '../../engine/elastic'
import { STAGE_LABEL, type StageAt } from '../../engine/singly'

/** renders engine SolStep[] as a numbered solution */
export function SolSteps({ steps, start = 1 }: { steps: SolStep[]; start?: number }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent font-bold text-xs grid place-items-center mt-0.5">{start + i}</span>
          <div className="flex-1 min-w-0 text-sm">
            <div className="font-semibold">{s.t}</div>
            {s.tex && (
              <div className="overflow-x-auto scroll-thin">
                <Tex block>{s.tex}</Tex>
              </div>
            )}
            {s.md && <Md className="text-mute">{s.md}</Md>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export interface BarRow {
  /** depth from the top of the drawing */
  d: number
  n: number
  db: number
}

/** cross-section sketch with stirrup, bar rows, optional neutral axis and cracked zone */
export function SectionSketch({ b, h, rows, na, cracked, flipTension, label = true, height = 190, tag }: { b: number; h: number; rows: BarRow[]; na?: number; cracked?: boolean; flipTension?: boolean; label?: boolean; height?: number; tag?: string }) {
  const s = (height - 30) / h
  const W = b * s,
    H = h * s
  const x0 = 34,
    y0 = 10
  const Y = (y: number) => y0 + (flipTension ? h - y : y) * s
  const cov = 1.5 * s,
    st = 0.375 * s
  return (
    <svg viewBox={`0 0 ${W + x0 + 60} ${H + 30}`} className="w-full h-auto" style={{ maxHeight: height + 10 }}>
      <rect x={x0} y={y0} width={W} height={H} fill="var(--c-panel2)" stroke="var(--c-ink)" strokeWidth={1.4} />
      {cracked && na !== undefined && (
        <g stroke="var(--c-bad)" strokeOpacity={0.55} strokeWidth={1}>
          {Array.from({ length: Math.max(2, Math.floor(b / 3)) }, (_, i) => {
            const x = x0 + ((i + 0.6) * W) / Math.max(2, Math.floor(b / 3))
            const ya = flipTension ? y0 : y0 + H
            const yb = Y(na)
            return <path key={i} d={`M${x},${ya} L${x + 2},${(ya * 2 + yb) / 3} L${x - 1.5},${(ya + yb * 2) / 3} L${x + 0.5},${yb}`} fill="none" />
          })}
        </g>
      )}
      <rect x={x0 + cov} y={y0 + cov} width={W - 2 * cov} height={H - 2 * cov} rx={4} fill="none" stroke="var(--c-mute)" strokeWidth={Math.max(1, st * 0.6)} />
      {rows.map((r, k) => {
        const inner = W - 2 * cov - 2 * st - r.db * s
        return Array.from({ length: r.n }, (_, i) => <circle key={`${k}-${i}`} cx={x0 + cov + st + (r.db * s) / 2 + (r.n === 1 ? inner / 2 : (inner * i) / (r.n - 1))} cy={Y(r.d)} r={Math.max(2.2, (r.db * s) / 2)} fill="var(--c-accent)" />)
      })}
      {na !== undefined && (
        <g>
          <line x1={x0 - 8} x2={x0 + W + 8} y1={Y(na)} y2={Y(na)} stroke="var(--c-good)" strokeDasharray="5 3" strokeWidth={1.4} />
          <text x={x0 + W + 10} y={Y(na) + 3.5} fontSize={10} fill="var(--c-good)">
            N.A.
          </text>
        </g>
      )}
      {label && (
        <g fontSize={10} fill="var(--c-mute)" className="num">
          <text x={x0 + W / 2} y={y0 + H + 14} textAnchor="middle">
            b = {f(b, 2)}″
          </text>
          <text x={x0 - 6} y={y0 + H / 2} textAnchor="end">
            h = {f(h, 2)}″
          </text>
          {tag && (
            <text x={x0 + W + 10} y={y0 + H - 2} fill="var(--c-ink)">
              {tag}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

/** the three-panel sketch asked in every paper: section | strain | stress, for one loading stage */
export function StageDiagram({ b, h, d, As, st, fyKsi, fcKsi, bars, whitney }: { b: number; h: number; d: number; As: number; st: StageAt; fyKsi: number; fcKsi: number; bars?: BarRow[]; whitney?: { a: number } }) {
  const H = 200,
    top = 22
  const s = (H - top - 18) / h
  const Y = (y: number) => top + y * s
  // panel x positions
  const secW = Math.min(110, b * s)
  const xs = 20
  const xe = xs + secW + 105 // strain axis
  const xf = xe + 175 // stress axis
  const W = xf + 190
  const epsMax = Math.max(st.epsTop, st.epsBot, st.epsS, 1e-6) // strain scale (per stage)
  const ES = 90 / epsMax
  const uncr = st.stage === 'uncracked'
  // stress scale
  const fMax = Math.max(st.fcTop, st.fct, st.stage === 'ultimate' ? 0.85 * fcKsi : 0, 1e-4)
  const FS = 90 / fMax
  const na = st.na
  const T = As * st.fs
  const prof = st.profile
  const stressPath = uncr
    ? `M${xf},${Y(0)} L${xf + st.fcTop * FS},${Y(0)} L${xf},${Y(na)} L${xf - st.fct * FS},${Y(h)} L${xf},${Y(h)} Z`
    : `M${xf},${Y(0)} ` + prof.map(([y, v]) => `L${xf + v * FS},${Y(y)}`).join(' ') + ` L${xf},${Y(na)} Z`
  const tone = { uncracked: 'var(--c-good)', cracked: 'var(--c-accent)', inelastic: 'var(--c-load)', yielded: 'var(--c-load)', ultimate: 'var(--c-bad)' }[st.stage]
  return (
    <svg viewBox={`0 0 ${W} ${H + 6}`} className="w-full h-auto">
      <defs>
        <marker id="stg-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-bad)" />
        </marker>
      </defs>
      <text x={xs} y={12} fontSize={11} fontWeight={700} fill={tone}>
        {STAGE_LABEL[st.stage]} · M = {f(st.M, 1)} k-ft
      </text>
      {/* section */}
      <rect x={xs} y={Y(0)} width={secW} height={h * s} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      {!uncr && (
        <rect x={xs} y={Y(na)} width={secW} height={(h - na) * s} fill="var(--c-bad)" fillOpacity={0.06} />
      )}
      {!uncr &&
        [0.2, 0.45, 0.7, 0.9].map((t) => {
          const x = xs + t * secW
          return <path key={t} d={`M${x},${Y(h)} L${x + 2},${Y((h + na) / 2 + 1)} L${x - 1},${Y(na + 0.3)}`} stroke="var(--c-bad)" strokeOpacity={0.6} fill="none" />
        })}
      {(bars ?? [{ d, n: 3, db: 1 }]).map((r, k) =>
        Array.from({ length: r.n }, (_, i) => <circle key={`${k}-${i}`} cx={xs + 10 + (r.n === 1 ? (secW - 20) / 2 : ((secW - 20) * i) / (r.n - 1))} cy={Y(r.d)} r={3} fill="var(--c-accent)" />),
      )}
      <line x1={xs - 6} x2={xf + 120} y1={Y(na)} y2={Y(na)} stroke="var(--c-good)" strokeDasharray="4 3" />
      <text x={xs - 4} y={Y(na) - 3} fontSize={9} fill="var(--c-good)">
        {uncr ? 'ȳ' : 'c'} = {f(na, 2)}″
      </text>
      {/* strain */}
      <line x1={xe} x2={xe} y1={Y(0) - 4} y2={Y(h) + 4} stroke="var(--c-mute)" />
      <text x={xe} y={Y(h) + 15} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        strain
      </text>
      <path d={`M${xe},${Y(0)} L${xe + st.epsTop * ES},${Y(0)} L${xe - st.epsBot * ES},${Y(h)} L${xe},${Y(h)} Z`} fill="var(--c-accent)" fillOpacity={0.15} stroke="var(--c-accent)" />
      <text x={xe + st.epsTop * ES + 3} y={Y(0) + 9} fontSize={9.5} className="num" fill="var(--c-ink)">
        εc = {st.epsTop.toExponential(2)}
      </text>
      <circle cx={xe - st.epsS * ES} cy={Y(d)} r={2.5} fill="var(--c-bad)" />
      <text x={xe + 4} y={Y(d) + 12} fontSize={9.5} className="num" fill="var(--c-bad)">
        εs = {st.epsS.toExponential(2)}
      </text>
      {/* stress */}
      <line x1={xf} x2={xf} y1={Y(0) - 4} y2={Y(h) + 4} stroke="var(--c-mute)" />
      <text x={xf} y={Y(h) + 15} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        stress (scaled per stage)
      </text>
      <path d={stressPath} fill={tone} fillOpacity={0.2} stroke={tone} />
      {whitney && st.stage === 'ultimate' && (
        <g>
          <rect x={xf} y={Y(0)} width={0.85 * fcKsi * FS} height={whitney.a * s} fill="none" stroke="var(--c-ink)" strokeDasharray="4 3" />
          <text x={xf + 0.85 * fcKsi * FS + 4} y={Y(whitney.a) - 2} fontSize={9} fill="var(--c-ink)">
            0.85f′c, a = β₁c
          </text>
        </g>
      )}
      <text x={xf + st.fcTop * FS + 4} y={Y(0) + 9} fontSize={9.5} className="num" fill="var(--c-ink)">
        fc = {f(st.fcTop * 1000, 0)} psi
      </text>
      {uncr && (
        <text x={xf - st.fct * FS - 4} y={Y(h) - 3} fontSize={9.5} textAnchor="end" className="num" fill="var(--c-ink)">
          fct = {f(st.fct * 1000, 0)} psi
        </text>
      )}
      <line x1={xf + 6} x2={xf + 6 + Math.min(110, 20 + (st.fs / fyKsi) * 90)} y1={Y(d)} y2={Y(d)} stroke="var(--c-bad)" strokeWidth={2} markerEnd="url(#stg-ar)" />
      <text x={xf + 10} y={Y(d) - 4} fontSize={9.5} className="num" fill="var(--c-bad)">
        fs = {f(st.fs, 2)} ksi{st.fs >= fyKsi - 1e-6 ? ' = fy' : ''} · T = {f(T, 1)} k
      </text>
    </svg>
  )
}

/** mini status chip */
export function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={'chip ' + (ok ? 'text-good' : 'text-bad')} style={{ borderColor: 'currentColor' }}>
      {children}
    </span>
  )
}
