// Worked water-chemistry layouts shared by the wq lab and the past-paper solutions:
// the alkalinity species table (alkalinity from HCO3⁻ and pH) and the titration (P and M) acid-volume bar.
import type { AlkFromBicarb } from '../engine/chem'

const g = (v: number, p = 3) => (Math.abs(v) < 1e-300 ? '0' : String(+v.toPrecision(p)))
const f = (v: number, d = 1) => v.toFixed(d)
/** 1.23e-4 → 1.23\times10^{-4} (TeX) */
export const sci = (v: number, p = 3) => {
  if (v === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(v)))
  if (e >= -2 && e <= 3) return g(v, p)
  return `${g(v / 10 ** e, p)}\\times10^{${e}}`
}

/** one row per species: how its molarity is found, eq per mol, eq/L and mg/L as CaCO3 (× 50 000) */
export function alkSpeciesMd(a: AlkFromBicarb, hco3mgL: number, pH: number, pK2 = 10.3) {
  const eq = a.hcoM + 2 * a.coM + a.ohM - a.hM
  return [
    `| species | how its concentration is found | mol/L | eq per mol | eq/L | mg/L as CaCO₃ (eq/L × 50 000) |`,
    `|---|---|---|---|---|---|`,
    `| HCO₃⁻ | $${hco3mgL}/61\\,000$ | $${sci(a.hcoM)}$ | 1 | $${sci(a.hcoM)}$ | ${f(a.hco3, 1)} |`,
    `| CO₃²⁻ | $[HCO_3^-]\\,K_2/[H^+] = [HCO_3^-]\\times10^{${f(pH - pK2, 1)}}$ | $${sci(a.coM)}$ | 2 | $${sci(2 * a.coM)}$ | ${f(a.co3, 1)} |`,
    `| OH⁻ | $K_w/[H^+] = 10^{${f(pH - 14, 1)}}$ | $${sci(a.ohM)}$ | 1 | $${sci(a.ohM)}$ | ${f(a.oh, 1)} |`,
    `| H⁺ (subtract) | $10^{-${f(pH, 1)}}$ | $${sci(a.hM)}$ | −1 | $-${sci(a.hM)}$ | −${g(a.hM * 50000, 2)} (negligible) |`,
    `| **total** | | | | $${sci(eq)}$ | **${f(a.total, 1)}** |`,
  ].join('\n')
}

/** the titration as an acid-volume bar: OH⁻ first, then half the CO₃²⁻ (to CO₃²⁻ → HCO₃⁻) up to P at pH 8.3,
 *  then the other half of the CO₃²⁻ and all the HCO₃⁻ up to M at pH 4.5 */
export function TitrationFig({ M, P, mlOH, mlCO3, mlHCO3 }: { M: number; P: number; mlOH: number; mlCO3: number; mlHCO3: number }) {
  const W = 560
  const L = 20
  const R = W - 20
  const sx = (ml: number) => L + (Math.max(0, Math.min(ml, M)) / Math.max(M, 1e-9)) * (R - L)
  const oh = Math.max(mlOH, 0)
  const half = Math.max(mlCO3, 0) / 2
  const segs = [
    { k: 'OH⁻', a: 0, b: oh, col: 'var(--c-bad)' },
    { k: '½ CO₃²⁻', a: oh, b: oh + half, col: 'var(--c-load)' },
    { k: '½ CO₃²⁻', a: oh + half, b: oh + 2 * half, col: 'var(--c-load)' },
    { k: 'HCO₃⁻', a: oh + 2 * half, b: oh + 2 * half + Math.max(mlHCO3, 0), col: 'var(--c-water)' },
  ].filter((s) => s.b - s.a > 1e-9)
  const y = 40
  const h = 34
  return (
    <svg viewBox={`0 0 ${W} 132`} width="100%" role="img" aria-label="titration: acid volume split into OH, carbonate and bicarbonate" style={{ display: 'block' }}>
      <text x={L} y={16} fontSize="12" fill="var(--c-mute)">mL of 0.02 N acid added →</text>
      {segs.map((s, i) => {
        const w = sx(s.b) - sx(s.a)
        return (
          <g key={i}>
            <rect x={sx(s.a)} y={y} width={Math.max(w, 0)} height={h} fill={s.col} opacity="0.45" stroke="var(--c-ink)" strokeWidth="0.8" />
            {w > 44 && (
              <text x={(sx(s.a) + sx(s.b)) / 2} y={y + 21} textAnchor="middle" fontSize="12" fill="var(--c-ink)" fontWeight="600">
                {s.k}
              </text>
            )}
            {w > 30 && (
              <text x={(sx(s.a) + sx(s.b)) / 2} y={y + h + 14} textAnchor="middle" fontSize="11" fill="var(--c-mute)">
                {f(s.b - s.a, 2)} mL
              </text>
            )}
          </g>
        )
      })}
      {[
        { at: P, lab: `P = ${P} mL (pH 8.3, phenolphthalein)`, up: true },
        { at: M, lab: `M = ${M} mL (pH 4.5, methyl orange)`, up: false },
      ].map((m, i) => (
        <g key={i}>
          <line x1={sx(m.at)} x2={sx(m.at)} y1={y - 8} y2={y + h + 22} stroke="var(--c-accent)" strokeWidth="1.6" strokeDasharray="4 3" />
          <text x={Math.min(Math.max(sx(m.at), 150), R - 150)} y={m.up ? y - 12 : y + h + 36} textAnchor="middle" fontSize="11" fill="var(--c-accent)" fontWeight="600">
            {m.lab}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** the split of P and M into species, one row each, with the mL → mg/L as CaCO3 conversion (× 1000/vol) */
export function titrationMd(t: { mlOH: number; mlCO3: number; mlHCO3: number; oh: number; co3: number; hco3: number; total: number }, vol: number, M: number) {
  return [
    `| species | mL of acid | how | mg/L as CaCO₃ (mL × 1000/${vol}) |`,
    `|---|---|---|---|`,
    `| OH⁻ | ${f(t.mlOH, 2)} | from the pH (above) | ${f(t.oh, 1)} |`,
    `| CO₃²⁻ | ${f(t.mlCO3, 2)} | $2(P - \\text{OH}) = 2(P - ${f(t.mlOH, 2)})$ | ${f(t.co3, 1)} |`,
    `| HCO₃⁻ | ${f(t.mlHCO3, 2)} | $M - \\text{OH} - \\text{CO}_3 = ${M} - ${f(t.mlOH, 2)} - ${f(t.mlCO3, 2)}$ | ${f(t.hco3, 1)} |`,
    `| **total** | ${f(t.mlOH + t.mlCO3 + t.mlHCO3, 2)} = M | | **${f(t.total, 1)}** |`,
  ].join('\n')
}
