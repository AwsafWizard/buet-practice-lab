// Alkalinity budget of a coagulant dose: what the water has against what the dose eats; the gap is what lime / soda ash must add.
const f = (v: number, d = 1) => v.toFixed(d)

export function AlkBudgetFig({ have, use }: { have: number; use: number }) {
  const W = 560
  const L = 130
  const R = W - 16
  const mx = Math.max(have, use, 1e-9) * 1.05
  const sx = (v: number) => L + (v / mx) * (R - L)
  const short = Math.max(use - have, 0)
  return (
    <svg viewBox={`0 0 ${W} 118`} width="100%" role="img" aria-label="alkalinity in the water against alkalinity consumed by the coagulant" style={{ display: 'block' }}>
      <text x={8} y={32} fontSize="12" fill="var(--c-ink)">in the water</text>
      <rect x={L} y={16} width={sx(have) - L} height="24" fill="var(--c-water)" opacity="0.45" stroke="var(--c-ink)" strokeWidth="0.8" />
      <text x={sx(have) + 4} y={32} fontSize="11" fill="var(--c-mute)" textAnchor={sx(have) > R - 40 ? 'end' : 'start'}>
        {f(have)}
      </text>
      <text x={8} y={70} fontSize="12" fill="var(--c-ink)">eaten by dose</text>
      <rect x={L} y={54} width={sx(Math.min(use, have)) - L} height="24" fill="var(--c-bad)" opacity="0.4" stroke="var(--c-ink)" strokeWidth="0.8" />
      {short > 0 && <rect x={sx(have)} y={54} width={sx(use) - sx(have)} height="24" fill="var(--c-load)" opacity="0.55" stroke="var(--c-ink)" strokeWidth="0.8" strokeDasharray="4 3" />}
      <text x={Math.min(sx(use) + 4, R - 4)} y={70} fontSize="11" fill="var(--c-mute)" textAnchor={sx(use) > R - 40 ? 'end' : 'start'}>
        {f(use)}
      </text>
      <line x1={sx(have)} x2={sx(have)} y1={10} y2={86} stroke="var(--c-ink)" strokeDasharray="3 3" />
      <text x={L} y={104} fontSize="11" fill={short > 0 ? 'var(--c-load)' : 'var(--c-good)'}>
        {short > 0 ? `short by ${f(short)} mg/L as CaCO₃ (dashed): add this as lime or soda ash` : `enough: ${f(have - use)} mg/L as CaCO₃ left over`}
      </text>
    </svg>
  )
}
