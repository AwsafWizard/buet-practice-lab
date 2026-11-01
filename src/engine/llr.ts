// BNBC 2020 Sec 2.3.13 live load reduction + roof live load reduction.

/** Table 6.2.7 live load element factor K_LL */
export const KLL = [
  { element: 'Interior columns', K: 4 },
  { element: 'Exterior columns without cantilever slabs', K: 4 },
  { element: 'Edge columns with cantilever slabs', K: 3 },
  { element: 'Corner columns with cantilever slabs', K: 2 },
  { element: 'Edge beams without cantilever slabs', K: 2 },
  { element: 'Interior beams', K: 2 },
  { element: 'All other members (incl. edge beams with cantilever slabs, cantilever beams, one-way & two-way slabs)', K: 1 },
]

export function reducedLL(p: { L0: number; KLL: number; AT: number; floorsSupported: number }) {
  const KA = p.KLL * p.AT
  const applies = KA >= 37.16
  const factor = 0.25 + 4.57 / Math.sqrt(KA)
  const raw = p.L0 * factor
  const minFrac = p.floorsSupported >= 2 ? 0.4 : 0.5
  const L = applies ? Math.max(raw, minFrac * p.L0) : p.L0
  return { KA, applies, factor, raw, minFrac, min: minFrac * p.L0, L, reductionPct: (1 - L / p.L0) * 100 }
}

/**
 * Roof live-load reduction. R₁ uses the SI constant 0.011 (continuous: 1.0 at 18.58 m², 0.6 at 55.74 m²);
 * the Lec 4-5 slide prints 0.001, which would jump to 1.18 at 18.58 m².
 */
export function roofLL(p: { L0: number; At: number; F: number }) {
  const R1 = p.At <= 18.58 ? 1 : p.At >= 55.74 ? 0.6 : 1.2 - 0.011 * p.At
  const R2 = p.F <= 4 ? 1 : p.F >= 12 ? 0.6 : 1.2 - 0.05 * p.F
  const raw = p.L0 * R1 * R2
  const Lr = Math.min(Math.max(raw, 0.6), 1.0)
  return { R1, R2, raw, Lr }
}
