// Bar diagram of a water analysis (cations on top: Ca, Mg, Na; anions below: HCO3, Cl, SO4; CO2 to the left of zero).
import type { Bars, Seg } from '../engine/soften'

const COL: Record<string, string> = { Ca: 'var(--c-accent)', Mg: 'var(--c-load)', Na: 'var(--c-faint)', 'HCO₃': 'var(--c-water)', Cl: 'var(--c-good)', 'SO₄': 'var(--c-soil)' }

export function BarDiagram({ bars, title, max, mark }: { bars: Bars; title?: string; max?: number; mark?: { label: string; at: number }[] }) {
  const W = 560
  const ml = 54
  const mr = 14
  const tot = Math.max(bars.cations.at(-1)?.to ?? 0, bars.anions.at(-1)?.to ?? 0, 1)
  const span = max ?? tot * 1.04
  const co2w = bars.co2 > 0 ? bars.co2 : 0
  const x0 = ml + Math.max(co2w / span, 0) * (W - ml - mr) * 0.9
  const sx = (v: number) => x0 + (v / span) * (W - x0 - mr)
  const row = (segs: Seg[], y: number, label: string) => (
    <g>
      <text x={4} y={y + 20} fontSize="12" fill="var(--c-mute)">{label}</text>
      {segs.map((s) => (
        <g key={s.k}>
          <rect x={sx(s.from)} y={y} width={Math.max(sx(s.to) - sx(s.from), 0)} height="30" fill={COL[s.k] ?? 'var(--c-faint)'} opacity="0.55" stroke="var(--c-ink)" strokeWidth="0.8" />
          {sx(s.to) - sx(s.from) > 26 && <text x={(sx(s.from) + sx(s.to)) / 2} y={y + 19} textAnchor="middle" fontSize="12" fill="var(--c-ink)" fontWeight="600">{s.k}</text>}
          <text x={sx(s.to)} y={y + 46} textAnchor="middle" fontSize="11" fill="var(--c-mute)">{+s.to.toFixed(1)}</text>
        </g>
      ))}
      <text x={sx(0)} y={y + 46} textAnchor="middle" fontSize="11" fill="var(--c-mute)">0</text>
    </g>
  )
  return (
    <svg viewBox={`0 0 ${W} ${mark?.length ? 190 : 160}`} width="100%" role="img" aria-label={title ?? 'bar diagram'} style={{ display: 'block' }}>
      {title && <text x={W / 2} y={14} textAnchor="middle" fontSize="12" fill="var(--c-ink)" fontWeight="700">{title}</text>}
      {co2w > 0 && (
        <g>
          <rect x={sx(-co2w)} y={24} width={sx(0) - sx(-co2w)} height="30" fill="var(--c-bad)" opacity="0.35" stroke="var(--c-ink)" strokeWidth="0.8" />
          <text x={(sx(-co2w) + sx(0)) / 2} y={43} textAnchor="middle" fontSize="11" fill="var(--c-ink)">CO₂</text>
          <text x={sx(-co2w)} y={70} textAnchor="middle" fontSize="11" fill="var(--c-mute)">{+co2w.toFixed(1)}</text>
        </g>
      )}
      {row(bars.cations, 24, 'cations')}
      {row(bars.anions, 82, 'anions')}
      {mark?.map((m, i) => (
        <g key={i}>
          <line x1={sx(m.at)} x2={sx(m.at)} y1={20} y2={118} stroke="var(--c-bad)" strokeDasharray="4 3" />
          <text x={sx(m.at)} y={134 + (i % 2) * 14} textAnchor="middle" fontSize="11" fill="var(--c-bad)">{m.label}</text>
        </g>
      ))}
    </svg>
  )
}

/** split-treatment flow sheet: raw Q → (1−X) first stage → blend with X bypass → [second stage] → recarbonation → filtration */
export function SplitFlow({ X, second }: { X: number; second: boolean }) {
  const box = (x: number, y: number, w: number, label: string, on = true) => (
    <g key={label + x}>
      <rect x={x} y={y} width={w} height="34" rx="6" fill="var(--c-panel2)" stroke={on ? 'var(--c-accent)' : 'var(--c-line)'} strokeWidth="1.4" strokeDasharray={on ? undefined : '4 3'} />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" fontSize="11" fill={on ? 'var(--c-ink)' : 'var(--c-faint)'}>{label}</text>
    </g>
  )
  const ar = (x1: number, y1: number, x2: number, y2: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--c-mute)" strokeWidth="1.3" markerEnd="url(#sfa)" />
  return (
    <svg viewBox="0 0 560 150" width="100%" role="img" aria-label="split treatment flow sheet" style={{ display: 'block' }}>
      <defs><marker id="sfa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--c-mute)" /></marker></defs>
      <text x="6" y="48" fontSize="12" fill="var(--c-ink)" fontWeight="700">Raw Q</text>
      {ar(46, 44, 84, 44)}
      {box(86, 14, 110, '1st stage: lime + soda')}
      <text x="96" y="10" fontSize="11" fill="var(--c-mute)">(1−X) = {(1 - X).toFixed(3)} Q</text>
      {ar(196, 31, 236, 31)}
      {box(238, 14, 72, 'settle')}
      {ar(310, 31, 340, 58)}
      <path d="M66 44 V110 H340" fill="none" stroke="var(--c-mute)" strokeWidth="1.3" markerEnd="url(#sfa)" />
      <text x="96" y="128" fontSize="11" fill="var(--c-mute)">bypass X = {X.toFixed(3)} Q (raw water)</text>
      {box(340, 44, 86, '2nd stage (Ca only)', second)}
      {ar(426, 61, 452, 61)}
      {box(454, 44, 100, 'recarbonate, filter, chlorinate')}
    </svg>
  )
}
