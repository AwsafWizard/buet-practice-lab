// Pieces shared by the one-way and two-way bar-spacing simulators: check list, verdict badge,
// the As-per-foot vs spacing chart and the bar-size switch.
import { useId, type ReactNode } from 'react'
import { Seg } from '../../../components/ui'
import { BARS } from '../../engine/materials'
import { asPerFt, type SpCheck, type Verdict } from '../../engine/spacing'
import { f } from './kit'

export const SIM_BARS = [3, 4, 5, 6]
export const BAR_COL: Record<number, string> = { 3: 'var(--c-accent)', 4: '#3b82f6', 5: '#10b981', 6: '#a855f7' }

export function BarSeg({ value, onChange }: { value: number; onChange: (b: number) => void }) {
  return <Seg value={String(value)} onChange={(v) => onChange(+v)} items={SIM_BARS.map((b) => ({ v: String(b), label: `#${b}` }))} />
}

export function CheckList({ checks }: { checks: SpCheck[] }) {
  return (
    <ul className="space-y-0.5 text-sm">
      {checks.map((c) => {
        const icon = c.ok ? '✓' : c.soft ? '!' : '✗'
        const col = c.ok ? 'text-good' : c.soft ? 'text-accent' : 'text-bad'
        return (
          <li key={c.key} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-1.5">
            <span className={'font-bold ' + col}>{icon}</span>
            <span>
              <span className={c.ok ? '' : 'font-semibold'}>{c.label}</span> <span className="num text-xs text-mute">· {c.detail}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function VerdictBadge({ v, over, hint }: { v: Verdict; over?: number; hint?: ReactNode }) {
  const map = {
    fail: { c: 'border-bad/60 bg-bad/10 text-bad', t: '✗ Does not work' },
    ok: { c: 'border-accent/50 bg-accent/10 text-accent', t: over !== undefined && over > 0.005 ? `✓ Works — ${Math.round(over * 100)} % more steel than needed` : '✓ Works — but not the class pick' },
    best: { c: 'border-good/60 bg-good/10 text-good', t: '🎯 Class answer' },
  }[v]
  return (
    <div className={'rounded-lg border px-2.5 py-1 text-sm font-semibold ' + map.c}>
      {map.t}
      {hint && <div className="text-xs font-normal text-mute mt-0.5">{hint}</div>}
    </div>
  )
}

/** a titled box holding one bar group's controls, checks and verdict */
export function SimBox({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-3 space-y-2">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-faint">{title}</div>
        {sub && <div className="text-xs text-mute">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

const S_LO = 2
const S_HI = 20
/** As per ft = Ab·12/s for each bar size, with the steel needed and s_max; click to pick a spacing */
export function AsCurve({ need, smax, bar, s, onPick, label = 'As needed' }: { need: number; smax: number; bar: number; s: number; onPick: (bar: number, s: number) => void; label?: string }) {
  const clip = useId()
  const W = 520
  const H = 210
  const m = { l: 44, r: 12, t: 12, b: 30 }
  const yMax = Math.min(1.6, Math.max(0.3, need * 2.4))
  const X = (v: number) => m.l + ((v - S_LO) / (S_HI - S_LO)) * (W - m.l - m.r)
  const Y = (v: number) => H - m.b - (v / yMax) * (H - m.t - m.b)
  const raw = (BARS[bar].A * 12) / need
  const okHi = Math.min(raw, smax)
  const path = (b: number, lo = S_LO, hi = S_HI) => {
    const pts: string[] = []
    for (let x = lo; x <= hi + 1e-9; x += 0.1) pts.push(`${X(x).toFixed(1)},${Y(asPerFt(b, x)).toFixed(1)}`)
    return 'M' + pts.join('L')
  }
  const yt = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].filter((v) => v <= yMax + 1e-9)
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const sv = S_LO + ((px - m.l) / (W - m.l - m.r)) * (S_HI - S_LO)
    // nearest curve to the click picks the bar size
    const py = ((e.clientY - box.top) / box.height) * H
    let nb = bar
    let bestD = Infinity
    for (const b of SIM_BARS) {
      const d = Math.abs(Y(asPerFt(b, Math.max(S_LO, sv))) - py)
      if (d < bestD) [bestD, nb] = [d, b]
    }
    const snapped = Math.min(S_HI, Math.max(S_LO, Math.round(sv * 2) / 2))
    onPick(bestD < 28 ? nb : bar, snapped)
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto cursor-crosshair select-none" onClick={click}>
      <defs>
        <clipPath id={clip}>
          <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} />
        </clipPath>
      </defs>
      {yt.map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={Y(v)} y2={Y(v)} stroke="var(--c-line)" strokeWidth={0.8} />
          <text x={m.l - 5} y={Y(v) + 3.5} fontSize={10} textAnchor="end" fill="var(--c-faint)" className="num">
            {v}
          </text>
        </g>
      ))}
      {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((v) => (
        <text key={v} x={X(v)} y={H - m.b + 14} fontSize={10} textAnchor="middle" fill="var(--c-faint)" className="num">
          {v}
        </text>
      ))}
      <text x={(m.l + W - m.r) / 2} y={H - 3} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
        spacing s (in) — click to pick
      </text>
      <text x={11} y={(m.t + H - m.b) / 2} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)" transform={`rotate(-90 11 ${(m.t + H - m.b) / 2})`}>
        As per ft (in²/ft)
      </text>
      <g clipPath={`url(#${clip})`}>
        {/* the spacings that work for the current bar */}
        {okHi > S_LO && <rect x={X(S_LO)} y={m.t} width={X(okHi) - X(S_LO)} height={H - m.t - m.b} fill="var(--c-good)" fillOpacity={0.08} />}
        {SIM_BARS.map((b) => (
          <path key={b} d={path(b)} fill="none" stroke={BAR_COL[b]} strokeWidth={b === bar ? 2.6 : 1.1} strokeOpacity={b === bar ? 1 : 0.45} />
        ))}
        <line x1={m.l} x2={W - m.r} y1={Y(need)} y2={Y(need)} stroke="var(--c-bad)" strokeDasharray="6 4" strokeWidth={1.4} />
        <line x1={X(smax)} x2={X(smax)} y1={m.t} y2={H - m.b} stroke="var(--c-mute)" strokeDasharray="4 3" strokeWidth={1.2} />
        <line x1={X(4.5)} x2={X(4.5)} y1={m.t} y2={H - m.b} stroke="var(--c-accent)" strokeDasharray="2 3" strokeWidth={1} strokeOpacity={0.6} />
      </g>
      <text x={W - m.r - 4} y={Y(need) - 5} fontSize={10.5} textAnchor="end" fill="var(--c-bad)" className="num" fontWeight={600}>
        {label} {f(need, 3)}
      </text>
      <text x={X(smax) + 4} y={m.t + 11} fontSize={10} fill="var(--c-mute)" className="num">
        s_max {f(smax, 2)}
      </text>
      <text x={X(4.5) + 3} y={H - m.b - 5} fontSize={9.5} fill="var(--c-accent)">
        4.5
      </text>
      {/* legend */}
      {SIM_BARS.map((b, i) => (
        <text key={b} x={m.l + 8 + i * 34} y={m.t + 12} fontSize={10.5} fill={BAR_COL[b]} fontWeight={b === bar ? 700 : 400}>
          #{b}
        </text>
      ))}
      {s >= S_LO && s <= S_HI && (
        <g>
          <line x1={X(s)} x2={X(s)} y1={Y(asPerFt(bar, s))} y2={H - m.b} stroke={BAR_COL[bar]} strokeWidth={1} strokeDasharray="2 2" />
          <circle cx={X(s)} cy={Y(asPerFt(bar, s))} r={5.5} fill={BAR_COL[bar]} stroke="var(--c-bg)" strokeWidth={1.5} data-tip={`#${bar} @ ${+s.toFixed(2)} in → As = ${asPerFt(bar, s).toFixed(3)} in²/ft`} />
        </g>
      )}
    </svg>
  )
}
