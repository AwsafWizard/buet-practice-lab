// Quality- and Cost-Based Selection (PPR 2008): technical proposals first, financial envelopes opened
// only for firms that reach the qualifying mark; Sf = 100 × Fm / F; combined S = St·T + Sf·P.

export interface QcbsFirm {
  name: string
  /** technical score out of 100 */
  tech: number
  /** evaluated price; missing = not opened / not submitted */
  price?: number
}

export interface QcbsRow extends QcbsFirm {
  qualified: boolean
  /** financial score (qualified firms with a price) */
  sf?: number
  /** combined score */
  s?: number
  rank?: number
}

export interface QcbsResult {
  rows: QcbsRow[]
  /** lowest evaluated price among qualified firms */
  fm?: number
  techWeight: number
  finWeight: number
  winner?: string
  /** the top two combined scores are equal */
  tie?: boolean
}

/** techWeight and qualify in percent (e.g. 80 and 75) */
export function qcbs(firms: QcbsFirm[], techWeight: number, qualify: number): QcbsResult {
  const T = techWeight / 100
  const P = 1 - T
  const rows: QcbsRow[] = firms.map((f) => ({ ...f, qualified: f.tech >= qualify }))
  const priced = rows.filter((r) => r.qualified && r.price !== undefined && r.price > 0)
  const fm = priced.length ? Math.min(...priced.map((r) => r.price!)) : undefined
  for (const r of priced) {
    r.sf = (100 * fm!) / r.price!
    r.s = r.tech * T + r.sf * P
  }
  // class rule (note Ques-14 N.B.): if the combined scores are equal, the firm with the greater technical score is selected
  const ranked = [...priced].sort((a, b) => b.s! - a.s! || b.tech - a.tech)
  ranked.forEach((r, i) => (r.rank = i + 1))
  const tie = ranked.length > 1 && Math.abs(ranked[0].s! - ranked[1].s!) < 1e-9
  return { rows, fm, techWeight, finWeight: 100 - techWeight, winner: ranked[0]?.name, tie }
}
