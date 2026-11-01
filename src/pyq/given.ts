// What each wind / earthquake / live-load past question printed with it (attached tables, charts, formulas),
// read from the scans. `ref` = the code-tables drawer item holding it; no `ref` = not in the drawer.
// An empty list means nothing was attached: every value needed is in the question text.

export interface Given {
  /** how the paper names it, e.g. "Table 4" or "K_z formula" */
  label: string
  /** what it is, when the label alone doesn't say */
  what?: string
  ref?: string
  formula?: boolean
}

const CS: Given = { label: 'C_s equations', what: 'normalized response spectrum', ref: 'e-cs', formula: true }
const KZ: Given = { label: 'K_z formula', what: '2.01(z/z_g)^(2/α)', ref: 'w-kz', formula: true }

export const GIVEN: Record<string, Given[]> = {
  // 2023-24
  '2023-24-A2b': [{ label: 'Table 1', what: 'wall C_p', ref: 'w-cpwall' }, { label: 'Table 2', what: 'terrain exposure constants', ref: 'w-terrain' }, KZ],
  '2023-24-A3a': [
    { label: 'Table 3', what: 'R, Ω₀, C_d (Table 6.2.19)', ref: 'e-r' },
    { label: 'Table 4', what: 'seismic design category', ref: 'e-sdc' },
    { label: 'Table 5', what: 'soil factor S, T_B, T_C, T_D', ref: 'e-cs' },
    CS,
  ],
  '2023-24-A3b': [{ label: 'LLR formula', what: 'L = L₀(0.25 + 4.57/√(K_LL A_T)); L₀ and K_LL given as values', ref: 'l-llr', formula: true }],
  '2023-24-A4a': [],
  '2023-24-A4b': [],
  '2023-24-A4c': [{ label: 'Table 6', what: 'parameters for K_zt', ref: 'w-kzt' }],
  '2023-24-A4d': [{ label: 'Enclosure criteria', what: 'open / partially enclosed conditions (note in the question)', ref: 'w-encl', formula: true }],
  // 2022-23
  '2022-23-B7a': [
    { label: 'Table 1', what: 'R, Ω₀, C_d (Table 6.2.19)', ref: 'e-r' },
    { label: 'Table 2', what: 'seismic design category', ref: 'e-sdc' },
    { label: 'Table 3', what: 'soil factor S, T_B, T_C, T_D', ref: 'e-cs' },
    CS,
  ],
  '2022-23-B7b': [
    { label: 'Table 4', what: 'parameters for K_zt', ref: 'w-kzt' },
    { label: 'Table 5', what: 'adjustment factor λ', ref: 'w-lambda' },
    { label: 'Table 6 + Fig. 7', what: 'p_s30 (110 / 120 mph) and design pressure zones', ref: 'w-ps30' },
  ],
  '2022-23-B8a': [],
  '2022-23-B8b': [],
  '2022-23-B8c': [
    { label: 'Table 4', what: 'parameters for K_zt', ref: 'w-kzt' },
    { label: 'Table 7', what: 'wall C_p', ref: 'w-cpwall' },
    { label: 'Table 8', what: 'terrain exposure constants', ref: 'w-terrain' },
    { label: 'Appendix A', what: 'gust effect factor provisions', ref: 'w-gust' },
    KZ,
    { label: 'n₁ formula', what: 'n₁ = 100/H (H in ft), in the question' },
  ],
  // 2021-22
  '2021-22-A3a': [
    { label: 'Table 1', what: 'R, Ω₀, C_d (concrete moment frames)', ref: 'e-r' },
    { label: 'Table 2', what: 'seismic design category (6.2.18)', ref: 'e-sdc' },
    { label: 'Table 3', what: 'soil factor S, T_B, T_C, T_D (6.2.16)', ref: 'e-cs' },
    CS,
  ],
  '2021-22-A3b': [],
  '2021-22-A4a': [
    { label: 'Table 4', what: 'parameters for K_zt', ref: 'w-kzt' },
    { label: 'K₂, K₃ formulas', ref: 'w-kzt', formula: true },
  ],
  '2021-22-A4c': [{ ...KZ, what: 'with z_g = 274.32 m' }],
  // 2020-21
  '2020-21-A3b': [
    { label: 'Table 1', what: 'R, Ω₀, C_d (Table 6.2.19)', ref: 'e-r' },
    { label: 'Table 2', what: 'seismic design category', ref: 'e-sdc' },
    { label: 'Table 3', what: 'soil factor S, T_B, T_C, T_D', ref: 'e-cs' },
    CS,
  ],
  '2020-21-A4a': [{ label: 'Table 4', what: 'p_s30 at 130 / 140 mph (values copied into the question; the drawer has 110 / 120)', ref: 'w-ps30' }],
  '2020-21-A4b': [
    { label: 'Table 5', what: 'wall C_p', ref: 'w-cpwall' },
    { label: 'Table 6', what: 'terrain exposure constants', ref: 'w-terrain' },
    { label: 'Appendix A', what: 'gust effect factor provisions', ref: 'w-gust' },
    KZ,
  ],
  // Session January 2021
  '2019-20-B10b': [{ label: 'Table 1', what: 'soil factor S, T_B, T_C, T_D', ref: 'e-cs' }, CS],
  '2019-20-B11': [KZ],
  // BNBC 1993 papers
  '2015-16-A2': [],
  '2012-13-B8': [{ label: 'Annexure-1', what: 'BNBC 1993 C_z, G_h and overall C̄_p tables (see the scan)' }],
  '2011-12-B9': [],
}

export const givenFor = (id: string): Given[] | undefined => GIVEN[id]
/** drawer items to open for a question, in paper order, no repeats */
export const givenRefs = (id: string) => [...new Set((GIVEN[id] ?? []).flatMap((g) => (g.ref ? [g.ref] : [])))]
