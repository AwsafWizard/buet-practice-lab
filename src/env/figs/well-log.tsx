// Well log of a designed deep tubewell: borehole log (layers, rated), SWL, housing pipe, blind pipe, strainer, sand trap and
// gravel pack, depth to scale, widths exaggerated. Theme tokens only.
import type { DtwDesign } from '../engine/dtw'

const nice = (maxD: number) => {
  const steps = [10, 20, 25, 50, 100, 200]
  return steps.find((s) => maxD / s <= 8) ?? 200
}

function spread(items: { y: number; k: string }[], gap: number) {
  const s = [...items].sort((a, b) => a.y - b.y)
  const out: Record<string, number> = {}
  let last = -1e9
  for (const it of s) {
    const y = Math.max(it.y, last + gap)
    out[it.k] = y
    last = y
  }
  return out
}

const CLS_FILL: Record<string, string> = {
  clay: 'var(--c-soil)',
  good: 'var(--c-good)',
  fine: 'var(--c-bad)',
  nonuniform: 'var(--c-bad)',
  borderline: 'var(--c-load)',
  excluded: 'var(--c-faint)',
}

export function WellLog({ d, title, showLayers = true }: { d: DtwDesign; title?: string; showLayers?: boolean }) {
  const W = 560
  const top = 28
  const H = 470
  const bottomLayer = Math.max(...d.layers.map((l) => l.bot), d.trap.bot + 20)
  const maxD = Math.ceil(bottomLayer / 10) * 10
  const Y = (ft: number) => top + (ft / maxD) * H
  const xa = 46 // depth axis
  const lx = 54 // layer column
  const lw = showLayers ? 118 : 0
  const xc = showLayers ? 290 : 190 // well centre
  const tick = nice(maxD)
  const ticks: number[] = []
  for (let t = 0; t <= maxD; t += tick) ticks.push(t)
  const h = d.housing
  const hasSWL = h.swl > 0
  const packTop = d.packRange.top
  const rows = [
    { k: 'house', y: Y(h.length / 2), t: `housing pipe 0–${h.length} ft${h.id ? ` · ${h.id} in ID` : ''}` },
    { k: 'blind', y: Y((d.blind.top + d.blind.bot) / 2), t: `blind pipe ${d.blind.top}–${d.blind.bot} ft` },
    { k: 'strain', y: Y((d.strainer.top + d.strainer.bot) / 2), t: `strainer ${d.strainer.top}–${d.strainer.bot} ft (${d.length} ft, ${d.input.strainerDia} in, #${d.slot.slot})` },
    { k: 'trap', y: Y(d.trap.top + 5) + 2, t: `sand trap ${d.trap.top}–${d.trap.bot} ft (capped)` },
    { k: 'pack', y: Y(packTop + 12), t: `gravel pack ${packTop}–${d.packRange.bot} ft · ${d.input.packThickness} in thick` },
    { k: 'swl', y: Y(h.swl), t: `static water level ${h.swl} ft` },
  ]
  const ly = spread(rows, 15)
  const tx = xc + 50
  return (
    <svg viewBox={`0 0 ${W} ${top + H + 34}`} width="100%" role="img" aria-label="well log" style={{ maxWidth: 640 }}>
      <defs>
        <pattern id="wl-slot" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0" stroke="var(--c-accent)" strokeWidth="1" />
        </pattern>
        <pattern id="wl-gravel" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="var(--c-mute)" />
          <circle cx="4.5" cy="4.5" r="1" fill="var(--c-mute)" />
        </pattern>
      </defs>
      {title && (
        <text x={W / 2} y={14} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--c-ink)">
          {title}
        </text>
      )}
      {/* depth axis */}
      <line x1={xa} y1={top} x2={xa} y2={top + H} stroke="var(--c-faint)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xa - 4} y1={Y(t)} x2={xa} y2={Y(t)} stroke="var(--c-faint)" />
          <text x={xa - 6} y={Y(t) + 4} textAnchor="end" fontSize="11" fill="var(--c-mute)">
            {t}
          </text>
        </g>
      ))}
      <text x={xa - 6} y={top - 8} textAnchor="end" fontSize="11" fill="var(--c-mute)">
        ft
      </text>
      {/* borehole log */}
      {showLayers && (
        <g>
          <rect x={lx} y={top} width={lw} height={H} fill="var(--c-panel2)" stroke="var(--c-line)" />
          {d.layers.map((l, i) => {
            const y1 = Y(l.top)
            const y2 = Y(l.bot)
            return (
              <g key={i}>
                <rect x={lx} y={y1} width={lw} height={Math.max(1, y2 - y1)} fill={CLS_FILL[l.cls]} opacity={l.cls === 'good' ? 0.28 : 0.2} stroke="var(--c-line)" strokeWidth="0.6" />
                {y2 - y1 > 13 && (
                  <text x={lx + lw / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize="11" fill="var(--c-ink)">
                    {l.cls === 'clay' ? 'clay' : `FM ${l.fm} · Cu ${Math.round(l.cu * 100) / 100}`}
                  </text>
                )}
              </g>
            )
          })}
          {d.zone && <rect x={lx - 3} y={Y(d.zone.top)} width={3} height={Y(d.zone.bot) - Y(d.zone.top)} fill="var(--c-good)" />}
        </g>
      )}
      {/* surrounding ground behind the well */}
      <rect x={xc - 40} y={top} width={80} height={H} fill="var(--c-panel2)" opacity={0.6} />
      {/* ground */}
      <line x1={showLayers ? lx - 8 : xc - 70} y1={top} x2={xc + 44} y2={top} stroke="var(--c-ink)" strokeWidth="2" />
      {/* grout above the pack, gravel pack, borehole */}
      <rect x={xc - 17} y={top} width={34} height={Y(packTop) - top} fill="var(--c-faint)" opacity={0.35} />
      <rect x={xc - 22} y={Y(packTop)} width={44} height={Y(d.packRange.bot) - Y(packTop)} fill="var(--c-panel)" stroke="var(--c-mute)" />
      <rect x={xc - 22} y={Y(packTop)} width={44} height={Y(d.packRange.bot) - Y(packTop)} fill="url(#wl-gravel)" />
      {/* housing pipe */}
      <rect x={xc - 13} y={top} width={26} height={Y(h.length) - top} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.5" />
      <rect x={xc - 7} y={Y(h.length) - 40 > top ? Y(h.length) - 40 : top + 4} width={14} height={30} rx="2" fill="var(--c-accent2)" opacity={0.75} />
      {/* blind pipe */}
      <rect x={xc - 6} y={Y(d.blind.top)} width={12} height={Math.max(1, Y(d.blind.bot) - Y(d.blind.top))} fill="var(--c-panel)" stroke="var(--c-ink)" strokeWidth="1.5" />
      {/* reducing socket */}
      <path d={`M${xc - 13} ${Y(h.length)} L${xc - 6} ${Y(h.length) + 5} L${xc + 6} ${Y(h.length) + 5} L${xc + 13} ${Y(h.length)}`} fill="none" stroke="var(--c-ink)" strokeWidth="1.5" />
      {/* strainer */}
      <rect x={xc - 8} y={Y(d.strainer.top)} width={16} height={Y(d.strainer.bot) - Y(d.strainer.top)} fill="url(#wl-slot)" stroke="var(--c-accent)" strokeWidth="1.5" />
      {/* sand trap */}
      <rect x={xc - 8} y={Y(d.trap.top)} width={16} height={Math.max(2, Y(d.trap.bot) - Y(d.trap.top))} fill="var(--c-mute)" opacity={0.8} stroke="var(--c-ink)" />
      {/* water level */}
      {hasSWL && (
        <g>
          <line x1={xc - 70} y1={Y(h.swl)} x2={xc + 44} y2={Y(h.swl)} stroke="var(--c-water)" strokeWidth="1.5" strokeDasharray="5 3" />
          <path d={`M${xc - 66} ${Y(h.swl) - 8} l6 0 l-3 6 z`} fill="var(--c-water)" />
        </g>
      )}
      {/* labels */}
      {rows.map((r) => {
        const y = ly[r.k]
        const x0 = r.k === 'swl' ? xc + 44 : r.k === 'pack' ? xc + 22 : xc + 14
        return (
          <g key={r.k}>
            <path d={`M${x0} ${r.y} L${tx - 4} ${y}`} stroke="var(--c-faint)" fill="none" />
            <text x={tx} y={y + 4} fontSize="11" fill={r.k === 'swl' ? 'var(--c-water)' : 'var(--c-ink)'}>
              {r.t}
            </text>
          </g>
        )
      })}
      <text x={xc} y={top + H + 22} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
        borehole {d.boreholeDia} in · widths exaggerated, depths to scale
      </text>
    </svg>
  )
}
