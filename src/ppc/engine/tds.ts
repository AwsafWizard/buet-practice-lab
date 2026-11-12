// Tender Data Sheet qualification figures for a works tender, from the estimate and the duration.
// PPR 2008 fixes only the tender security (R.22: a rounded fixed amount, not a %, at most 3% of the
// official estimate, set slightly lower). The other multiples are standard-document practice, NOT in
// IA sir's files: the class note says turnover = average annual inflow (last 5 years) and liquid
// asset ≈ 10% of the total work. Every figure says which it is.

export interface TdsInput {
  /** estimated cost, Tk crore */
  costCrore: number
  months: number
  storeys?: number
}

export interface TdsLine {
  item: string
  entry: string
  basis: string
  /** 'PPR' = from the Rules; 'class' = class note / teacher slide; 'practice' = standard practice, reasonable value */
  from: 'PPR' | 'class' | 'practice'
}

export interface TdsResult {
  annual: number
  monthly: number
  security: number
  lines: Record<string, TdsLine>
}

const down = (x: number, step: number) => Math.floor(x / step + 1e-9) * step
const up = (x: number, step: number) => Math.ceil(x / step - 1e-9) * step
export const cr = (x: number) => {
  const s = Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2).replace(/0$/, '')
  return `Tk ${s} crore`
}

export function tds({ costCrore: C, months, storeys }: TdsInput): TdsResult {
  const years = months / 12
  const annual = C / years
  const monthly = C / months
  // a fixed sum slightly under 2% (well inside the 3% cap), rounded down to a clean figure
  const step = C >= 500 ? 0.5 : C >= 20 ? 0.05 : 0.01
  const security = down(0.0195 * C, step)
  const genYears = C <= 50 ? 7 : C <= 150 ? 10 : 15
  const simStoreys = storeys ? Math.max(5, down(storeys * 0.75, 5)) : undefined
  const turnover = up(1.5 * annual, 0.5)
  const liquid = up(0.1 * C, 0.5)
  const spec1 = up(0.7 * C, 1)
  const spec2 = up(0.5 * C, 1)
  const lines: Record<string, TdsLine> = {
    security: {
      item: 'Tender security',
      entry: `${cr(security)} (fixed amount), as a bank guarantee / pay order / bank draft from a scheduled bank, valid 28 days beyond the tender validity`,
      basis: `≤ 3% of ${cr(C)} = ${cr(0.03 * C)}; stated as a rounded fixed sum, set slightly lower (≈ 2% = ${cr(0.02 * C)} → ${cr(security)})`,
      from: 'PPR',
    },
    general: {
      item: 'General experience',
      entry: `At least ${genYears} years of experience in construction works as a prime contractor`,
      basis: `scaled to the size and complexity of a ${cr(C)} job (5–15 years is the usual range)`,
      from: 'practice',
    },
    specific: {
      item: 'Specific experience',
      entry: `Within the last 7 years, completed at least one contract of a similar nature${simStoreys ? ` (RCC building of ${simStoreys} storeys or more)` : ''} worth at least ${cr(spec1)}, or two such contracts each worth at least ${cr(spec2)}; completion certificates to be attached`,
      basis: `physical (similar type and size) and financial (≈ 70% of the estimate for one contract, ≈ 50% each for two)`,
      from: 'practice',
    },
    turnover: {
      item: 'Construction turnover',
      entry: `Average annual construction turnover of at least ${cr(turnover)} over the last 5 years, from audited statements`,
      basis: `annual value = ${cr(C)} ÷ ${+years.toFixed(2)} yr = ${cr(annual)}; × 1.5 → ${cr(turnover)} (turnover = a year's total inflow)`,
      from: 'practice',
    },
    liquid: {
      item: 'Liquid asset / credit facility',
      entry: `Liquid assets or a credit line of at least ${cr(liquid)}, certified by a scheduled bank`,
      basis: `≈ 10% of the total work (class note) = ${cr(0.1 * C)} ≈ ${+((0.1 * C) / monthly).toFixed(1)} months of cash flow at ${cr(monthly)} a month`,
      from: 'class',
    },
  }
  return { annual, monthly, security, lines }
}

/** match the paper's item wording to a line key */
export function tdsKey(item: string): string | undefined {
  const s = item.toLowerCase()
  if (s.includes('security')) return 'security'
  if (s.includes('general')) return 'general'
  if (s.includes('specific')) return 'specific'
  if (s.includes('turnover')) return 'turnover'
  if (s.includes('liquid') || s.includes('credit') || s.includes('working capital')) return 'liquid'
  return undefined
}
