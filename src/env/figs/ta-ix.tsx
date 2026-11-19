// Ion-exchange bypass as a flow sheet with the hardness mass balance written on it:
// raw (Q, H_raw) splits into the resin, which delivers zero hardness, and a bypass X·Q at H_raw; the blend is H_des.
const f = (v: number, d = 1) => v.toFixed(d)
const nf = (v: number) => (v >= 100 ? Math.round(v).toLocaleString('en-US') : String(+v.toPrecision(3)))

export function BypassFig({ Hraw: hr, Hdes, X, Q, qUnit }: { Hraw: number; Hdes: number; X: number; Q?: number; qUnit?: string }) {
  const Hraw = +hr.toFixed(1)
  const q = (frac: number) => (Q !== undefined ? `${nf(Q * frac)} ${qUnit ?? ''}`.trim() : `${f(frac * 100, 1)} % of Q`)
  return (
    <svg viewBox="0 0 560 200" width="100%" role="img" aria-label="ion exchange flow sheet: resin stream and bypass stream blended" style={{ display: 'block' }}>
      <defs>
        <marker id="taixa" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L8 4L0 8z" fill="var(--c-mute)" />
        </marker>
      </defs>
      <text x="6" y="44" fontSize="12" fontWeight="700" fill="var(--c-ink)">Raw</text>
      <text x="6" y="60" fontSize="11" fill="var(--c-mute)">{Q !== undefined ? q(1) : 'Q'}</text>
      <text x="6" y="74" fontSize="11" fill="var(--c-mute)">H = {Hraw}</text>
      <line x1="70" y1="50" x2="186" y2="50" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#taixa)" />
      <path d="M100 50 V160 H384" fill="none" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#taixa)" />
      <text x="110" y="150" fontSize="11" fill="var(--c-mute)">bypass X = {f(X * 100, 1)} %: {q(X)} at H = {Hraw}</text>
      <rect x="188" y="22" width="92" height="56" rx="6" fill="var(--c-panel2)" stroke="var(--c-accent)" strokeWidth="1.4" />
      <text x="234" y="46" textAnchor="middle" fontSize="12" fill="var(--c-ink)">resin</text>
      <text x="234" y="62" textAnchor="middle" fontSize="11" fill="var(--c-mute)">Ca, Mg → Na</text>
      <text x="234" y="96" textAnchor="middle" fontSize="11" fill="var(--c-mute)">(1 − X): {q(1 - X)}</text>
      <path d="M280 50 H410 V132" fill="none" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#taixa)" />
      <text x="290" y="42" fontSize="11" fill="var(--c-mute)">H = 0 (soft)</text>
      <circle cx="410" cy="160" r="24" fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <text x="410" y="164" textAnchor="middle" fontSize="11" fill="var(--c-ink)">blend</text>
      <line x1="434" y1="160" x2="540" y2="160" stroke="var(--c-mute)" strokeWidth="2" markerEnd="url(#taixa)" />
      <text x="444" y="148" fontSize="12" fontWeight="700" fill="var(--c-good)">H = {Hdes}</text>
      <text x="444" y="182" fontSize="11" fill="var(--c-mute)">to supply</text>
      <text x="300" y="196" textAnchor="middle" fontSize="11" fill="var(--c-accent)">
        hardness balance: X·{Hraw} + (1 − X)·0 = {Hdes} → X = {Hdes}/{Hraw}
      </text>
    </svg>
  )
}
