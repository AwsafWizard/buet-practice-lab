// Confined seepage under sheet piles, dams / weirs (with or without cut-offs) and gravity walls,
// on a permeable layer over an impermeable base. Cell-centred finite-volume Laplace solver (SOR):
// thin sheet piles are cut faces between two cell columns, the structure is removed cells, the
// soil surfaces under ponded water are fixed-head boundaries. Anisotropic soil is solved directly
// with kx, kz conductances, which is the same as the transformed section (x scaled by √(kz/kx)) with
// k′ = √(kx kz); the shape factor Nf/Nd = q/(k′H).
//
// Elevations z in metres with the impermeable base at z = 0; heads are total heads on the same datum.
// x = 0 at the upstream face (heel / sheet pile), x = B at the toe.

import { GW } from './units'

export interface FlowGeom {
  /** upstream soil surface elevation (m above the impermeable base) */
  zU: number
  /** downstream soil surface elevation */
  zD: number
  /** upstream / downstream water levels (total heads, same datum) */
  hU: number
  hD: number
  /** structure base width; 0 = sheet pile alone */
  B: number
  /** structure base elevation (B > 0) */
  zB?: number
  /** tip elevation of the upstream cut-off at x = 0 (for B = 0: the sheet pile) */
  tipU?: number
  /** tip elevation of the downstream cut-off at x = B */
  tipD?: number
  /** permeabilities (only their ratio matters for the net); default isotropic */
  kx?: number
  kz?: number
}

export interface SolveOpts {
  /** cells across the thickest soil column (default 48) */
  n?: number
  /** far boundaries at ext × thickness from the structure (default 4) */
  ext?: number
  tol?: number
  maxIter?: number
  /** warm start from a coarser solution of the same geometry */
  init?: FlowSol
}

export interface FlowSol {
  g: FlowGeom
  H: number
  /** cell faces in x (nx + 1) and cell size in z */
  xs: Float64Array
  xc: Float64Array
  dz: number
  nx: number
  nz: number
  /** snapped geometry actually solved (row indices: level = idx × dz) */
  iz: { zU: number; zD: number; zB: number; tipU: number | null; tipD: number | null }
  /** first face index at x = 0 and at x = B */
  f0: number
  fB: number
  active: Uint8Array
  /** vertical face f (between cells f−1 and f), row j blocked by a sheet pile */
  blocked: Uint8Array
  /** cell heads (NaN where no soil) */
  h: Float64Array
  /** stream function at cell corners ((nx + 1) × (nz + 1)), NaN outside the soil */
  psi: Float64Array
  /** flow per unit k′ (m² per unit k), = Nf/Nd × H */
  Q: number
  /** shape factor Nf/Nd = q/(k′H) */
  shape: number
  /** Q on this grid (the stream function's top value; Q may be the extrapolated value) */
  Qgrid: number
  /** shape factor on this grid before extrapolation */
  shapeGrid: number
  iters: number
  ms: number
}

const cell = (s: { nz: number }, i: number, j: number) => i * s.nz + j

/** complete elliptic integral of the first kind K(k), k = modulus (AGM) */
export function ellipK(k: number) {
  let a = 1
  let b = Math.sqrt(Math.max(0, 1 - k * k))
  if (b === 0) return Infinity
  for (let n = 0; n < 40 && Math.abs(a - b) > 1e-15 * a; n++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]
  return Math.PI / (2 * a)
}

/** exact Nf/Nd for one sheet pile, penetration s, in a layer of thickness T (Polubarinova-Kochina) */
export function sheetPileExact(s: number, T: number) {
  const a = (Math.PI * s) / (2 * T)
  return ellipK(Math.cos(a)) / (2 * ellipK(Math.sin(a)))
}

/** exact Nf/Nd for a flat impermeable base of width B on the surface of a layer of thickness T */
export function flatDamExact(B: number, T: number) {
  const k = Math.tanh((Math.PI * B) / (4 * T))
  return ellipK(Math.sqrt(1 - k * k)) / (2 * ellipK(k))
}

/** the levels the grid must honour, for picking a cell size that snaps them best */
function levels(g: FlowGeom) {
  return [g.zU, g.zD, g.B > 0 ? g.zB : undefined, g.tipU, g.tipD].filter((v): v is number => v !== undefined && v > 0)
}

export function solveFlow(g: FlowGeom, o: SolveOpts = {}): FlowSol {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const n = Math.max(8, Math.round(o.n ?? 48))
  const ext = o.ext ?? 4
  const zTop = Math.max(g.zU, g.zD)
  const H = g.hU - g.hD
  // cell size: the nz in [n, 1.35n] that snaps the key levels best
  const lv = levels(g)
  let nz = n
  let best = Infinity
  for (let m = n; m <= Math.round(n * 1.35); m++) {
    const d = zTop / m
    const err = Math.max(0, ...lv.map((l) => Math.abs(Math.round(l / d) * d - l)))
    if (err < best - 1e-9) {
      best = err
      nz = m
    }
  }
  const dz = zTop / nz
  const snap = (l: number) => Math.max(0, Math.min(nz, Math.round(l / dz)))
  const izU = snap(g.zU)
  const izD = snap(g.zD)
  const B = Math.max(0, g.B)
  const izB = B > 0 ? snap(Math.min(g.zB ?? Math.min(g.zU, g.zD), Math.min(g.zU, g.zD))) : 0
  const itU = g.tipU !== undefined ? snap(g.tipU) : null
  const itD = g.tipD !== undefined && B > 0 ? snap(g.tipD) : null

  // x faces: uniform near the structure, then growing cells out to the far boundaries
  const core = 1.5 * zTop
  const far = ext * zTop
  const left: number[] = []
  {
    let x = 0
    let d = dz
    while (x > -far + 1e-9) {
      if (-x >= core) d = Math.min(d * 1.18, 4 * dz)
      x -= d
      left.push(Math.max(x, -far))
    }
  }
  const mid: number[] = []
  if (B > 0) {
    const nB = Math.max(2, Math.round(B / dz))
    for (let k = 1; k < nB; k++) mid.push((B * k) / nB)
  }
  const right: number[] = []
  {
    let x = B
    let d = dz
    while (x < B + far - 1e-9) {
      if (x - B >= core) d = Math.min(d * 1.18, 4 * dz)
      x += d
      right.push(Math.min(x, B + far))
    }
  }
  const faces = [...left.reverse(), 0, ...mid, ...(B > 0 ? [B] : []), ...right]
  const xs = Float64Array.from(faces)
  const nx = xs.length - 1
  const xc = new Float64Array(nx)
  for (let i = 0; i < nx; i++) xc[i] = (xs[i] + xs[i + 1]) / 2
  const f0 = left.length
  const fB = B > 0 ? f0 + mid.length + 1 : f0
  const s = { nz }

  // soil cells
  const region = (i: number) => (xc[i] < 0 ? 'U' : B > 0 && xc[i] < B ? 'S' : 'D')
  const active = new Uint8Array(nx * nz)
  for (let i = 0; i < nx; i++) {
    const r = region(i)
    const top = r === 'U' ? izU : r === 'D' ? izD : izB
    for (let j = 0; j < top; j++) active[cell(s, i, j)] = 1
  }
  // sheet piles / cut-offs: blocked vertical faces
  const blocked = new Uint8Array((nx + 1) * nz)
  const block = (f: number, from: number, to: number) => {
    for (let j = Math.max(0, from); j < Math.min(nz, to); j++) blocked[f * nz + j] = 1
  }
  if (B === 0) {
    if (itU !== null) block(f0, itU, nz)
  } else {
    if (itU !== null) block(f0, itU, izB)
    if (itD !== null) block(fB, itD, izB)
  }

  // conductances (k′ = √(kx kz) = 1)
  const kx = g.kx ?? 1
  const kz = g.kz ?? 1
  const kp = Math.sqrt(kx * kz)
  const ax = kx / kp
  const az = kz / kp
  const cE = new Float64Array(nx * nz)
  const cN = new Float64Array(nx * nz)
  const cB = new Float64Array(nx * nz)
  const hB = new Float64Array(nx * nz)
  for (let i = 0; i < nx; i++) {
    const dx = xs[i + 1] - xs[i]
    for (let j = 0; j < nz; j++) {
      const c = cell(s, i, j)
      if (!active[c]) continue
      if (i + 1 < nx && active[cell(s, i + 1, j)] && !blocked[(i + 1) * nz + j]) cE[c] = (ax * dz) / ((dx + xs[i + 2] - xs[i + 1]) / 2)
      if (j + 1 < nz && active[cell(s, i, j + 1)]) cN[c] = (az * dx) / dz
      else {
        const r = region(i)
        if (r === 'U' && j === izU - 1) {
          cB[c] = (az * dx) / (dz / 2)
          hB[c] = g.hU
        } else if (r === 'D' && j === izD - 1) {
          cB[c] = (az * dx) / (dz / 2)
          hB[c] = g.hD
        }
      }
    }
  }
  const diag = new Float64Array(nx * nz)
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const c = cell(s, i, j)
      if (!active[c]) continue
      diag[c] = cE[c] + cN[c] + cB[c] + (i > 0 ? cE[cell(s, i - 1, j)] : 0) + (j > 0 ? cN[c - 1] : 0)
    }

  // initial guess: the coarse solution, else linear across the structure
  const h = new Float64Array(nx * nz).fill(NaN)
  const span = Math.max(B, zTop)
  for (let i = 0; i < nx; i++) {
    const t = Math.min(1, Math.max(0, (xc[i] + span / 2) / (B + span)))
    for (let j = 0; j < nz; j++)
      if (active[cell(s, i, j)]) {
        const v = o.init ? headAt(o.init, xc[i], (j + 0.5) * dz) : NaN
        h[cell(s, i, j)] = Number.isFinite(v) ? v : g.hU - t * H
      }
  }

  // SOR
  const rho = (Math.cos(Math.PI / nx) + Math.cos(Math.PI / nz)) / 2
  const omega = Math.min(1.97, 2 / (1 + Math.sqrt(1 - rho * rho)))
  const tol = (o.tol ?? 1e-6) * Math.max(1e-9, Math.abs(H))
  const maxIter = o.maxIter ?? 20000
  let it = 0
  if (Math.abs(H) > 0) {
    for (; it < maxIter; it++) {
      let dmax = 0
      for (let i = 0; i < nx; i++) {
        const base = i * nz
        for (let j = 0; j < nz; j++) {
          const c = base + j
          const d = diag[c]
          if (d === 0) continue
          let sum = cB[c] * hB[c]
          if (cE[c]) sum += cE[c] * h[c + nz]
          if (i > 0) {
            const w = cE[c - nz]
            if (w) sum += w * h[c - nz]
          }
          if (cN[c]) sum += cN[c] * h[c + 1]
          if (j > 0) {
            const sv = cN[c - 1]
            if (sv) sum += sv * h[c - 1]
          }
          const dh = sum / d - h[c]
          h[c] += omega * dh
          const a = dh < 0 ? -dh : dh
          if (a > dmax) dmax = a
        }
      }
      if (dmax < tol) break
    }
  } else for (let c = 0; c < h.length; c++) if (active[c]) h[c] = g.hU

  // flow: inflow and outflow through the two fixed-head surfaces
  let qin = 0
  let qout = 0
  for (let c = 0; c < h.length; c++) {
    if (!cB[c]) continue
    if (xc[Math.floor(c / nz)] < 0) qin += cB[c] * (g.hU - h[c])
    else qout += cB[c] * (h[c] - g.hD)
  }
  const Q = (qin + qout) / 2

  // stream function at the corners: ψ = 0 on the impermeable base, integrate horizontal fluxes upwards
  const psi = new Float64Array((nx + 1) * (nz + 1)).fill(NaN)
  for (let f = 0; f <= nx; f++) {
    let p = 0
    psi[f * (nz + 1)] = touches(f, 0) ? 0 : NaN
    for (let j = 0; j < nz; j++) {
      if (f > 0 && f < nx) {
        const a = cell(s, f - 1, j)
        const c = cE[a]
        if (c) p += c * (h[a] - h[a + nz])
      }
      psi[f * (nz + 1) + j + 1] = touches(f, j + 1) ? p : NaN
    }
  }
  function touches(f: number, j: number) {
    for (const [i, jj] of [
      [f - 1, j - 1],
      [f, j - 1],
      [f - 1, j],
      [f, j],
    ])
      if (i >= 0 && i < nx && jj >= 0 && jj < nz && active[cell(s, i, jj)]) return true
    return false
  }

  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  return {
    g,
    H,
    xs,
    xc,
    dz,
    nx,
    nz,
    iz: { zU: izU, zD: izD, zB: izB, tipU: itU, tipD: itD },
    f0,
    fB,
    active,
    blocked,
    h,
    psi,
    Q,
    shape: H ? Q / H : 0,
    Qgrid: Q,
    shapeGrid: H ? Q / H : 0,
    iters: it,
    ms: t1 - t0,
  }
}

/**
 * the solve the labs use: a grid of n and one of 2n (warm-started), then Richardson extrapolation of
 * the shape factor (the tip singularity makes the grid error first order). Heads come from the fine grid.
 * live: n = 14 / 28 (a few ms); final: n = 24 / 48.
 */
export function solveNet(g: FlowGeom, quality: 'live' | 'final' = 'final', o: Omit<SolveOpts, 'n' | 'init'> = {}): FlowSol {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const n = quality === 'live' ? 14 : 24
  const c = solveFlow(g, { ...o, n })
  const f = solveFlow(g, { ...o, n: 2 * n, init: c })
  const shape = Math.max(0, 2 * f.shapeGrid - c.shapeGrid)
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now()
  return { ...f, shape, Q: shape * f.H, iters: c.iters + f.iters, ms: t1 - t0 }
}

// ---------------------------------------------------------------- point queries

function colOf(sol: FlowSol, x: number) {
  const { xs, nx } = sol
  if (x <= xs[0]) return 0
  if (x >= xs[nx]) return nx - 1
  let lo = 0
  let hi = nx
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1
    if (xs[m] <= x) lo = m
    else hi = m
  }
  return lo
}

/** is there a pile between cell columns a and b (a < b) at row j? */
function cut(sol: FlowSol, a: number, b: number, j: number) {
  for (let f = a + 1; f <= b; f++) if (sol.blocked[f * sol.nz + j]) return true
  return false
}

/** total head at (x, z): bilinear between cell centres on the same side of any pile; NaN outside the soil */
export function headAt(sol: FlowSol, x: number, z: number): number {
  const { nz, nx, dz, xc, h, active, g } = sol
  const i0 = colOf(sol, x)
  const j0 = Math.min(nz - 1, Math.max(0, Math.floor(z / dz)))
  const r = x < 0 ? 'U' : x > Math.max(0, g.B) ? 'D' : 'S'
  const top = r === 'U' ? sol.iz.zU * dz : r === 'D' ? sol.iz.zD * dz : sol.iz.zB * dz
  if (z >= top - 1e-9) return r === 'U' ? g.hU : r === 'D' ? g.hD : NaN
  if (!active[i0 * nz + j0]) return NaN
  // lower-left cell centre of the bilinear stencil
  let ia = xc[i0] <= x ? i0 : i0 - 1
  if (ia < 0) ia = 0
  if (ia > nx - 2) ia = nx - 2
  let ja = (j0 + 0.5) * dz <= z ? j0 : j0 - 1
  if (ja < 0) ja = 0
  if (ja > nz - 2) ja = nz - 2
  const tx = Math.min(1, Math.max(0, (x - xc[ia]) / (xc[ia + 1] - xc[ia])))
  const tz = Math.min(1, Math.max(0, (z - (ja + 0.5) * dz) / dz))
  let sw = 0
  let sv = 0
  for (const di of [0, 1])
    for (const dj of [0, 1]) {
      const i = ia + di
      const j = ja + dj
      if (!active[i * nz + j]) continue
      if (i !== i0 && (cut(sol, Math.min(i, i0), Math.max(i, i0), j) || cut(sol, Math.min(i, i0), Math.max(i, i0), j0))) continue
      const w = (di ? tx : 1 - tx) * (dj ? tz : 1 - tz) + 1e-9
      sw += w
      sv += w * h[i * nz + j]
    }
  let v = sw ? sv / sw : h[i0 * nz + j0]
  // within half a cell of a fixed-head surface: blend toward the boundary head
  if (r !== 'S' && z > top - dz / 2) {
    const hb = r === 'U' ? g.hU : g.hD
    v += (hb - v) * Math.min(1, (z - (top - dz / 2)) / (dz / 2))
  }
  return v
}

export interface PointInfo {
  x: number
  z: number
  /** total head */
  h: number
  /** head left above tail-water, h − hD ("seepage head"; seepage pressure = this × γw) */
  excess: number
  /** potential drops already used, (hU − h)/Δh */
  drops: number
  /** pore pressure (h − z)γw, kPa */
  u: number
  /** total vertical stress (standing water + saturated soil above), kPa */
  sigma: number
  sigmaEff: number
  /** hydraulic gradient vector (−∂h/∂x, −∂h/∂z) and magnitude */
  ix: number
  iz: number
  i: number
}

/** head, pore pressure, effective stress and gradient at a point; datum = impermeable base */
export function pointInfo(sol: FlowSol, x: number, z: number, gammaSat: number, Nd: number): PointInfo {
  const h = headAt(sol, x, z)
  const { g, dz } = sol
  const e = dz * 0.75
  const gx = (headAt(sol, x + e, z) - headAt(sol, x - e, z)) / (2 * e)
  const gz = (headAt(sol, x, z + e) - headAt(sol, x, z - e)) / (2 * e)
  const surf = x < 0 ? g.zU : x > g.B ? g.zD : NaN
  const wl = x < 0 ? g.hU : g.hD
  const sigma = Number.isFinite(surf) ? Math.max(0, wl - surf) * GW + Math.max(0, surf - z) * gammaSat : NaN
  const u = (h - z) * GW
  const ix = Number.isFinite(gx) ? -gx : 0
  const iz = Number.isFinite(gz) ? -gz : 0
  return { x, z, h, excess: h - g.hD, drops: sol.H ? ((g.hU - h) / sol.H) * Nd : 0, u, sigma, sigmaEff: sigma - u, ix, iz, i: Math.hypot(ix, iz) }
}

// ---------------------------------------------------------------- design quantities

export interface ExitInfo {
  /** gradient profile along the downstream soil surface: x (m from the toe / pile) and upward i */
  profile: { x: number; i: number }[]
  /** gradient in the last field: Δh / l along the downstream face of the pile (or along the base back from the toe) */
  ie: number
  /** the length l of that last field */
  l: number
  /** where it was measured */
  along: 'pile' | 'base'
}

/** exit gradient: the class method (Δh over the last field along the structure) plus the surface profile */
export function exitGradient(sol: FlowSol, Nd: number): ExitInfo {
  const { g, nz, dz, xc, h, active } = sol
  const dh = sol.H / Nd
  const xT = Math.max(0, g.B)
  const profile: { x: number; i: number }[] = []
  const jD = sol.iz.zD - 1
  for (let i = 0; i < sol.nx; i++) {
    if (xc[i] <= xT || !active[i * nz + jD]) continue
    if (xc[i] - xT > 3 * nz * dz) break
    profile.push({ x: xc[i] - xT, i: (h[i * nz + jD] - g.hD) / (dz / 2) })
  }
  // path from the exit corner back along the structure
  const pts: { s: number; h: number }[] = [{ s: 0, h: g.hD }]
  const pileD = g.B > 0 ? sol.iz.tipD : sol.iz.tipU
  let along: 'pile' | 'base' = 'base'
  if (pileD !== null && pileD < sol.iz.zD) {
    along = 'pile'
    const i = g.B > 0 ? sol.fB : sol.f0
    for (let j = sol.iz.zD - 1; j >= pileD; j--) pts.push({ s: sol.iz.zD * dz - (j + 0.5) * dz, h: h[i * nz + j] })
  } else if (g.B > 0) {
    const j = sol.iz.zB - 1
    for (let i = sol.fB - 1; i >= sol.f0; i--) pts.push({ s: xT - xc[i], h: h[i * nz + j] })
    // a toe sitting below the downstream surface: the water first climbs the embedded face
    if (sol.iz.zD > sol.iz.zB) {
      const up: { s: number; h: number }[] = [{ s: 0, h: g.hD }]
      const i = sol.fB
      for (let jj = sol.iz.zD - 1; jj >= sol.iz.zB; jj--) up.push({ s: sol.iz.zD * dz - (jj + 0.5) * dz, h: h[i * nz + jj] })
      const s0 = (sol.iz.zD - sol.iz.zB) * dz
      pts.splice(0, pts.length, ...up, ...pts.slice(1).map((p) => ({ s: p.s + s0, h: p.h })))
    }
  }
  let l = pts[pts.length - 1].s
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1]
    const b = pts[k]
    if (b.h - g.hD >= dh) {
      l = a.s + ((dh - (a.h - g.hD)) / (b.h - a.h || 1e-12)) * (b.s - a.s)
      break
    }
  }
  const hl = pts.length > 1 ? Math.min(dh, pts[pts.length - 1].h - g.hD) : dh
  return { profile, ie: l > 0 ? (l === pts[pts.length - 1].s ? hl : dh) / l : NaN, l, along }
}

export interface HeaveInfo {
  /** pile depth below the downstream surface */
  D: number
  /** average head above tail-water along the prism bottom (pile-tip level, from the pile to D/2) */
  ha: number
  iav: number
  /** submerged weight and uplift of the prism (kN/m) */
  W: number
  U: number
  FS: number
  /** samples along the prism bottom */
  samples: { x: number; excess: number }[]
}

/** Terzaghi heave on the D × D/2 prism beside the downstream pile (or downstream cut-off) */
export function terzaghiHeave(sol: FlowSol, gammaSub: number, filterWeight = 0): HeaveInfo | null {
  const { g, dz } = sol
  const tipIdx = g.B > 0 ? sol.iz.tipD : sol.iz.tipU
  if (tipIdx === null) return null
  const D = (sol.iz.zD - tipIdx) * dz
  if (D <= 0) return null
  const zt = tipIdx * dz
  const x0 = Math.max(0, g.B)
  const n = 24
  const samples: { x: number; excess: number }[] = []
  for (let k = 0; k <= n; k++) {
    const x = x0 + 1e-6 + (k / n) * (D / 2)
    samples.push({ x: x - x0, excess: headAt(sol, x, zt + 1e-6) - g.hD })
  }
  // trapezoid rule
  let s = 0
  for (let k = 1; k < samples.length; k++) s += ((samples[k].excess + samples[k - 1].excess) / 2) * (samples[k].x - samples[k - 1].x)
  const ha = s / (D / 2)
  const W = (D / 2) * D * gammaSub
  const U = (D / 2) * ha * GW
  return { D, ha, iav: ha / D, W, U, FS: (W + filterWeight) / U, samples }
}

export interface UpliftInfo {
  pts: { x: number; head: number; p: number; u: number }[]
  /** total uplift force (kN per m run) and its distance from the heel */
  U: number
  xbar: number
  heel: number
  toe: number
}

/** uplift under the structure base: u = (h − zB)γw */
export function uplift(sol: FlowSol): UpliftInfo | null {
  const { g, nz, dz, xc, h } = sol
  if (!(g.B > 0)) return null
  const zB = sol.iz.zB * dz
  const j = sol.iz.zB - 1
  const pts: UpliftInfo['pts'] = []
  const hHeel = headAt(sol, 1e-6, zB - 1e-6)
  const hToe = headAt(sol, g.B - 1e-6, zB - 1e-6)
  pts.push({ x: 0, head: hHeel, p: hHeel - zB, u: (hHeel - zB) * GW })
  for (let i = sol.f0; i < sol.fB; i++) pts.push({ x: xc[i], head: h[i * nz + j], p: h[i * nz + j] - zB, u: (h[i * nz + j] - zB) * GW })
  pts.push({ x: g.B, head: hToe, p: hToe - zB, u: (hToe - zB) * GW })
  let U = 0
  let M = 0
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1]
    const b = pts[k]
    const dx = b.x - a.x
    U += ((a.u + b.u) / 2) * dx
    M += ((a.u + b.u) / 2) * dx * ((a.x + b.x) / 2)
  }
  return { pts, U, xbar: U ? M / U : 0, heel: pts[0].u, toe: pts[pts.length - 1].u }
}

/** Nd for a square net with Nf flow channels */
export const ndFor = (sol: FlowSol, Nf: number) => (sol.shape > 0 ? Nf / sol.shape : Infinity)

// ---------------------------------------------------------------- contours for drawing

export type Seg = [number, number, number, number]

function march(nxv: number, nzv: number, val: (i: number, j: number) => number, pos: (i: number, j: number) => [number, number], ok: (i: number, j: number) => boolean, level: number): Seg[] {
  const out: Seg[] = []
  const lerp = (a: [number, number], b: [number, number], va: number, vb: number): [number, number] => {
    const t = (level - va) / (vb - va)
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]
  }
  for (let i = 0; i < nxv - 1; i++)
    for (let j = 0; j < nzv - 1; j++) {
      if (!ok(i, j)) continue
      const v = [val(i, j), val(i + 1, j), val(i + 1, j + 1), val(i, j + 1)]
      if (v.some((x) => !Number.isFinite(x))) continue
      const p = [pos(i, j), pos(i + 1, j), pos(i + 1, j + 1), pos(i, j + 1)]
      const cr: [number, number][] = []
      for (let k = 0; k < 4; k++) {
        const a = v[k]
        const b = v[(k + 1) % 4]
        if ((a < level && b >= level) || (a >= level && b < level)) cr.push(lerp(p[k], p[(k + 1) % 4], a, b))
      }
      if (cr.length === 2) out.push([cr[0][0], cr[0][1], cr[1][0], cr[1][1]])
      else if (cr.length === 4) {
        const c = (v[0] + v[1] + v[2] + v[3]) / 4
        if ((c >= level) === (v[0] >= level)) {
          out.push([cr[0][0], cr[0][1], cr[3][0], cr[3][1]], [cr[1][0], cr[1][1], cr[2][0], cr[2][1]])
        } else out.push([cr[0][0], cr[0][1], cr[1][0], cr[1][1]], [cr[2][0], cr[2][1], cr[3][0], cr[3][1]])
      }
    }
  return out
}

/** join segments that share end points into polylines */
export function chain(segs: Seg[]): [number, number][][] {
  const key = (x: number, z: number) => `${Math.round(x * 1e4)},${Math.round(z * 1e4)}`
  const ends = new Map<string, number[]>()
  segs.forEach((s, k) => {
    for (const kk of [key(s[0], s[1]), key(s[2], s[3])]) {
      const a = ends.get(kk)
      if (a) a.push(k)
      else ends.set(kk, [k])
    }
  })
  const used = new Uint8Array(segs.length)
  const lines: [number, number][][] = []
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue
    used[k] = 1
    const line: [number, number][] = [
      [segs[k][0], segs[k][1]],
      [segs[k][2], segs[k][3]],
    ]
    for (const dir of [1, 0]) {
      for (;;) {
        const end = dir ? line[line.length - 1] : line[0]
        const cand = (ends.get(key(end[0], end[1])) ?? []).find((m) => !used[m])
        if (cand === undefined) break
        used[cand] = 1
        const s = segs[cand]
        const nxt: [number, number] = key(s[0], s[1]) === key(end[0], end[1]) ? [s[2], s[3]] : [s[0], s[1]]
        if (dir) line.push(nxt)
        else line.unshift(nxt)
      }
    }
    lines.push(line)
  }
  return lines
}

/** equipotential h = level (cell-centre lattice; never across a pile) */
export function equipotential(sol: FlowSol, level: number) {
  const { nx, nz, dz, xc, h, active } = sol
  return chain(
    march(
      nx,
      nz,
      (i, j) => h[i * nz + j],
      (i, j) => [xc[i], (j + 0.5) * dz],
      (i, j) => active[i * nz + j] && active[(i + 1) * nz + j] && active[(i + 1) * nz + j + 1] && active[i * nz + j + 1] && !sol.blocked[(i + 1) * nz + j] && !sol.blocked[(i + 1) * nz + j + 1] ? true : false,
      level,
    ),
  )
}

/** flow line ψ = level (corner lattice) */
export function flowLine(sol: FlowSol, level: number) {
  const { nx, nz, dz, xs, psi } = sol
  return chain(
    march(
      nx + 1,
      nz + 1,
      (i, j) => psi[i * (nz + 1) + j],
      (i, j) => [xs[i], j * dz],
      () => true,
      level,
    ),
  )
}

export interface NetLines {
  Nf: number
  Nd: number
  dh: number
  equip: { h: number; lines: [number, number][][] }[]
  flow: { psi: number; lines: [number, number][][] }[]
}

/** a square net with Nf channels: flow lines at equal Δq, equipotentials every Δh = H/Nd */
export function netLines(sol: FlowSol, Nf: number): NetLines {
  const Nd = ndFor(sol, Nf)
  const dh = sol.H / Nd
  const equip: NetLines['equip'] = []
  if (Number.isFinite(Nd) && dh > 0)
    for (let m = 1; m < Nd - 0.25 && m < 80; m++) {
      const lv = sol.g.hU - m * dh
      equip.push({ h: lv, lines: equipotential(sol, lv) })
    }
  const flow: NetLines['flow'] = []
  for (let j = 1; j < Nf; j++) {
    const p = (sol.Qgrid * j) / Nf
    flow.push({ psi: p, lines: flowLine(sol, p) })
  }
  return { Nf, Nd, dh, equip, flow }
}

// ---------------------------------------------------------------- convenience builders (paper geometry)

/** a sheet pile: depth T of the permeable layer below the downstream ground, penetration s below it, water heights above the ground */
export function sheetPile(o: { T: number; s: number; hU: number; hD: number; dGround?: number; kx?: number; kz?: number }): FlowGeom {
  const zD = o.T
  const zU = o.T + (o.dGround ?? 0)
  return { zU, zD, hU: zU + o.hU, hD: zD + o.hD, B: 0, tipU: zD - o.s, kx: o.kx, kz: o.kz }
}

/** a dam / weir: base width B at depth `embed` below the upstream ground; cut-offs given as depth below the base */
export function dam(o: { T: number; B: number; hU: number; hD: number; embedU?: number; embedD?: number; cutU?: number; cutD?: number; kx?: number; kz?: number }): FlowGeom {
  // T = layer thickness below the upstream ground
  const zU = o.T
  const zB = zU - (o.embedU ?? 0)
  const zD = zB + (o.embedD ?? o.embedU ?? 0)
  return {
    zU,
    zD,
    hU: zU + o.hU,
    hD: zD + o.hD,
    B: o.B,
    zB,
    tipU: o.cutU ? zB - o.cutU : undefined,
    tipD: o.cutD ? zB - o.cutD : undefined,
    kx: o.kx,
    kz: o.kz,
  }
}
