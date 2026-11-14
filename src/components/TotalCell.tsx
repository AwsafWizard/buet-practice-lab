// The totals column of a course's "What the exam asks" heatmap: a bar in the topic's colour, scaled to
// the largest total, where there is room; a pill tinted by the same share on a narrow page.

export function TotalHead({ label }: { label: string }) {
  return (
    <th className="text-faint px-2 text-left font-semibold">
      <span className="cq-md:pl-1">{label}</span>
    </th>
  )
}

export function TotalCell({ v, max, color }: { v: number; max: number; color: string }) {
  const f = max > 0 ? v / max : 0
  const pct = Math.round(f * 100)
  return (
    <td className="pl-2 pr-1" title={`${v} — ${pct}% of the most-asked topic`}>
      {/* narrow page: the number on a pill whose tint grows with the total */}
      <span
        className="cq-md:hidden block min-w-9 rounded px-1.5 py-0.5 text-center num font-bold"
        style={{ background: `color-mix(in oklab, ${color} ${10 + f * 60}%, transparent)`, color: 'var(--c-ink)' }}
      >
        {v}
      </span>
      {/* wide page: a bar on a track, then the number */}
      <span className="hidden cq-md:flex items-center gap-2 w-44">
        <span className="relative flex-1 h-4 rounded bg-panel2 overflow-hidden">
          <span className="absolute inset-y-0 left-0 rounded" style={{ width: `${Math.max(3, pct)}%`, background: `color-mix(in oklab, ${color} ${40 + f * 55}%, transparent)` }} />
        </span>
        <span className="num font-bold w-8 text-right">{v}</span>
      </span>
    </td>
  )
}
