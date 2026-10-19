// Small dense linear algebra helpers (structures here have < 300 DOFs).

export type Matrix = number[][]

export function zeros(n: number, m = n): Matrix {
  return Array.from({ length: n }, () => new Array(m).fill(0))
}

/** LU factorisation with partial pivoting. Throws 'singular' when a pivot vanishes. */
export interface LU {
  lu: Matrix
  piv: number[]
  n: number
}

export function luFactor(A: Matrix, relTol = 1e-10): LU {
  const n = A.length
  const lu = A.map((r) => r.slice())
  const piv = Array.from({ length: n }, (_, i) => i)
  let maxDiag = 0
  for (let i = 0; i < n; i++) maxDiag = Math.max(maxDiag, Math.abs(A[i][i]))
  const tol = relTol * (maxDiag || 1)
  for (let k = 0; k < n; k++) {
    let p = k
    let best = Math.abs(lu[k][k])
    for (let i = k + 1; i < n; i++) {
      const v = Math.abs(lu[i][k])
      if (v > best) {
        best = v
        p = i
      }
    }
    if (best <= tol) throw new Error('singular')
    if (p !== k) {
      ;[lu[p], lu[k]] = [lu[k], lu[p]]
      ;[piv[p], piv[k]] = [piv[k], piv[p]]
    }
    const pk = lu[k][k]
    for (let i = k + 1; i < n; i++) {
      const f = (lu[i][k] /= pk)
      if (f === 0) continue
      const ri = lu[i]
      const rk = lu[k]
      for (let j = k + 1; j < n; j++) ri[j] -= f * rk[j]
    }
  }
  return { lu, piv, n }
}

export function luSolve({ lu, piv, n }: LU, b: number[]): number[] {
  const x = new Array(n)
  for (let i = 0; i < n; i++) x[i] = b[piv[i]]
  for (let i = 0; i < n; i++) {
    let s = x[i]
    const r = lu[i]
    for (let j = 0; j < i; j++) s -= r[j] * x[j]
    x[i] = s
  }
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i]
    const r = lu[i]
    for (let j = i + 1; j < n; j++) s -= r[j] * x[j]
    x[i] = s / r[i]
  }
  return x
}

/** Numerical rank by Gaussian elimination with full pivoting. */
export function rank(A: Matrix, relTol = 1e-9): number {
  const m = A.length
  if (!m) return 0
  const n = A[0].length
  const M = A.map((r) => r.slice())
  let maxAbs = 0
  for (const r of M) for (const v of r) maxAbs = Math.max(maxAbs, Math.abs(v))
  const tol = relTol * (maxAbs || 1)
  let r = 0
  const usedCols = new Array(n).fill(false)
  for (let step = 0; step < Math.min(m, n); step++) {
    let bi = -1
    let bj = -1
    let best = tol
    for (let i = r; i < m; i++)
      for (let j = 0; j < n; j++) {
        if (usedCols[j]) continue
        const v = Math.abs(M[i][j])
        if (v > best) {
          best = v
          bi = i
          bj = j
        }
      }
    if (bi < 0) break
    ;[M[bi], M[r]] = [M[r], M[bi]]
    usedCols[bj] = true
    for (let i = r + 1; i < m; i++) {
      const f = M[i][bj] / M[r][bj]
      if (f === 0) continue
      for (let j = 0; j < n; j++) M[i][j] -= f * M[r][j]
    }
    r++
  }
  return r
}
