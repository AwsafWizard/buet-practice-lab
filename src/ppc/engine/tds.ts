// Tender Data Sheet qualification figures for a works tender, from the estimate and the duration.
// These are the class formulas (Ishtiaque sir, as the 18- and 19-batch term-final solves write them;
// worked example: Tk 50 crore, 48 months, 20 storeys → 5 years, 15-storey ≥ Tk 40 crore, liquid asset
// Tk 9 crore, turnover Tk 37.5 crore, security Tk 1 crore):
//   turnover        = (total cost ÷ duration in years) × 3
//   gap between bills = duration in months × billing % + 3 months of assumed delay
//   liquid asset    = (total cost ÷ duration in months) × gap, rounded up
//   tender security = 2 to 3 % of the cost, written as a fixed sum (PPR 2008 r.22: never a percentage, ≤ 3 %)
//   general experience 5 years; specific experience ≈ 80 % of the value, a slightly smaller job, 1 contract in 5 years

export interface TdsInput {
  /** estimated cost, Tk crore */
  costCrore: number
  months: number
  storeys?: number
  /** a bridge's length in metres (specific experience is then a bridge of 80 % of it) */
  lengthM?: number
  /** minimum bill as a % of the contract (class default 10 → 10 bills) */
  billingPct?: number
}

export type TdsKey = 'general' | 'specific' | 'liquid' | 'turnover' | 'security'

export interface TdsLine {
  item: string
  /** ITT clause the entry completes */
  itt: string
  group: 'Qualification Criteria' | 'Tender Preparation'
  entry: string
  /** the formula with this tender's numbers */
  basis: string
}

export interface TdsResult {
  annual: number
  monthly: number
  years: number
  billingPct: number
  /** months between two bills, including the 3 months of assumed delay */
  gap: number
  turnover: number
  /** rounded up */
  liquid: number
  liquidExact: number
  security: number
  genYears: number
  spec: number
  lines: Record<TdsKey, TdsLine>
}

/** the order the class table is written in */
export const TDS_ORDER: TdsKey[] = ['general', 'specific', 'liquid', 'turnover', 'security']

const up = (x: number, step: number) => Math.ceil(x / step - 1e-9) * step
const near = (x: number, step: number) => Math.round(x / step) * step
/** 37.5, 8.125, 24 — no trailing zeros */
export const num = (x: number, dp = 3) => String(+x.toFixed(dp))
export const cr = (x: number) => `Tk ${num(x, 2)} crore`
const WORD: Record<number, string> = { 5: 'Five', 10: 'Ten' }

export function tds({ costCrore: C, months, storeys, lengthM, billingPct = 10 }: TdsInput): TdsResult {
  const years = months / 12
  const annual = C / years
  const monthly = C / months
  const turnover = annual * 3
  const gap = (months * billingPct) / 100 + 3
  const liquidExact = monthly * gap
  const liquid = up(liquidExact, C < 10 ? 0.1 : 1)
  const security = near(0.02 * C, C >= 500 ? 0.5 : C >= 20 ? 0.1 : 0.01)
  const genYears = C >= 500 ? 10 : 5
  const spec = up(0.8 * C, 1)
  const simStoreys = storeys ? Math.floor(storeys * 0.75) : undefined
  const similar = simStoreys
    ? `a ${simStoreys} storied building`
    : lengthM
      ? `a bridge at least ${num(0.8 * lengthM, 0)} m long`
      : 'a work of similar nature and complexity'
  const bills = 100 / billingPct
  const lines: Record<TdsKey, TdsLine> = {
    general: {
      item: 'General experience',
      itt: 'ITT 14.1(a)',
      group: 'Qualification Criteria',
      entry: `The minimum number of years of general experience of the Tenderer as Contractor shall be ${genYears} (${WORD[genYears]}) years, counting backward from the date of publication of IFT in the newspaper.`,
      basis: `a reasonable number of years${genYears > 5 ? ' (a very large job, so more than the usual 5)' : ''}`,
    },
    specific: {
      item: 'Specific experience',
      itt: 'ITT 14.1(b)',
      group: 'Qualification Criteria',
      entry: `Satisfactory completion of ${similar} of at least ${cr(spec)} under 1 (one) contract over a period of the last 5 (Five) years shall be required.`,
      basis: `a job close to this one in size and in money: ${simStoreys ? `${simStoreys} storeys for ${storeys}, ` : lengthM ? `${num(0.8 * lengthM, 0)} m for ${num(lengthM, 0)} m, ` : ''}80 % of ${cr(C)} = ${cr(0.8 * C)}`,
    },
    liquid: {
      item: 'Liquid assets',
      itt: 'ITT 15.1(a)',
      group: 'Qualification Criteria',
      entry: `The minimum amount of liquid assets or working capital or credit facilities of the Tenderer shall be ${cr(liquid)}.`,
      basis: `gap between bills = ${num(months)} months ${Number.isInteger(bills) ? `÷ ${bills} bills` : `× ${num(billingPct)} %`} + 3 = ${num(gap)} months; liquid asset = (${num(C)} ÷ ${num(months)}) × ${num(gap)} = ${cr(liquidExact)}${Math.abs(liquid - liquidExact) > 1e-9 ? ` → ${cr(liquid)}` : ''}`,
    },
    turnover: {
      item: 'Annual construction turnover',
      itt: 'ITT 18.1(b)',
      group: 'Qualification Criteria',
      entry: `The minimum average annual construction turnover shall be greater than ${cr(turnover)} in the last 5 (Five) years.`,
      basis: `(total cost ÷ duration in years) × 3 = (${num(C)} ÷ ${num(years)}) × 3 = ${cr(turnover)}`,
    },
    security: {
      item: 'Tender security',
      itt: 'ITT 17.1(a)',
      group: 'Tender Preparation',
      entry: `The amount of tender security shall be ${cr(security)}, in the form of a bank draft, pay order or bank guarantee from a scheduled bank of Bangladesh.`,
      basis: `2 to 3 % of the total cost: 2 % × ${cr(C)} = ${cr(0.02 * C)}, written as a fixed amount, never as a percentage (PPR 2008 r.22)`,
    },
  }
  return { annual, monthly, years, billingPct, gap, turnover, liquid, liquidExact, security, genYears, spec, lines }
}

/** match the paper's item wording to a line key */
export function tdsKey(item: string): TdsKey | undefined {
  const s = item.toLowerCase()
  if (s.includes('security')) return 'security'
  if (s.includes('general')) return 'general'
  if (s.includes('specific')) return 'specific'
  if (s.includes('turnover')) return 'turnover'
  if (s.includes('liquid') || s.includes('credit') || s.includes('working capital')) return 'liquid'
  return undefined
}
