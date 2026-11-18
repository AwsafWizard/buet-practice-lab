// Water hammer in a pipe with a valve at the downstream end. Rowshan ma'am's L9 gives the phases and the remedies only
// (p31-33: air chamber, surge tower, surge control valves); the numbers here are textbook (Joukowsky, Michaud, method of characteristics).
// Pure functions, SI units: m, s, m/s, kg/m3, Pa. Heads are metres of water.

export const G = 9.81
export const K_WATER = 2.19e9 // bulk modulus, Pa
export const RHO = 1000

/** wave speed in a pipe: a = sqrt( (K/rho) / (1 + K D c1 / (E t)) ), c1 = 1 for a pipe free to move at one end (anchored upstream) */
export function waveSpeed(o: { D: number; t: number; E: number; K?: number; rho?: number; c1?: number }) {
  const K = o.K ?? K_WATER
  const rho = o.rho ?? RHO
  return Math.sqrt(K / rho / (1 + (K * o.D * (o.c1 ?? 1)) / (o.E * o.t)))
}
/** wave speed in an infinitely rigid pipe (no pipe elasticity) */
export const waveSpeedRigid = (K = K_WATER, rho = RHO) => Math.sqrt(K / rho)

/** time for the wave to go to the reservoir and back: 2L/a (critical closure time) */
export const criticalTime = (L: number, a: number) => (2 * L) / a

export interface HammerOut {
  /** closure faster than 2L/a: the full Joukowsky rise */
  rapid: boolean
  Tc: number
  /** pressure rise, Pa */
  dp: number
  /** head rise, m */
  dH: number
  /** head at the valve, m */
  Hmax: number
}
/** Joukowsky: dp = rho a dv (rapid closure, T <= 2L/a); slow closure (Michaud): dp = 2 rho L dv / T */
export function hammerRise(o: { L: number; a: number; dv: number; T: number; H0?: number; rho?: number }): HammerOut {
  const rho = o.rho ?? RHO
  const Tc = criticalTime(o.L, o.a)
  const rapid = o.T <= Tc
  const dp = rapid ? rho * o.a * o.dv : (2 * rho * o.L * o.dv) / o.T
  const dH = dp / (rho * G)
  return { rapid, Tc, dp, dH, Hmax: (o.H0 ?? 0) + dH }
}
/** the closure time that brings the rise down to a target head rise (Michaud, valid when above 2L/a) */
export const closureTimeFor = (L: number, dv: number, dHtarget: number) => (2 * L * dv) / (G * dHtarget)

// ------------------------------------------------------------------ method of characteristics (frictionless)
export interface Protection {
  /** relief valve: opens above this head (m), discharges Cr sqrt(H - Hset) with Cr = relief fraction of the steady flow at 10 m of overhead */
  reliefSet?: number
  reliefSize?: number
  /** surge tank at the valve: plan area (m2) of an open standpipe connected at the valve */
  surgeArea?: number
}
export interface HammerSim {
  /** the pipe is divided into N reaches */
  N: number
  dt: number
  /** time of every step */
  t: number[]
  /** head at the valve, m */
  Hv: number[]
  /** head at the mid-length, m */
  Hm: number[]
  /** flow at the valve, m3/s */
  Qv: number[]
  /** head along the pipe at every step (N+1 nodes, node 0 at the reservoir) */
  prof: number[][]
  /** velocity along the pipe at every step */
  vel: number[][]
  /** opening ratio of the valve at every step */
  tau: number[]
  Hmax: number
  Hmin: number
  H0: number
  v0: number
}

/**
 * Frictionless water hammer: reservoir (constant head H0) - pipe length L, wave speed a, diameter D - valve at the end closing linearly
 * in time T from the steady flow v0. Relief valve and surge tank are optional protections at the valve.
 */
export function simulate(o: { L: number; a: number; D: number; v0: number; H0: number; T: number; tEnd: number; N?: number; protect?: Protection }): HammerSim {
  const N = o.N ?? 20
  const dx = o.L / N
  const dt = dx / o.a
  const A = (Math.PI * o.D * o.D) / 4
  const Bc = o.a / (G * A)
  const Q0 = o.v0 * A
  const steps = Math.ceil(o.tEnd / dt)
  const H = Array.from({ length: N + 1 }, () => o.H0)
  const Q = Array.from({ length: N + 1 }, () => Q0)
  const out: HammerSim = { N, dt, t: [], Hv: [], Hm: [], Qv: [], prof: [], vel: [], tau: [], Hmax: o.H0, Hmin: o.H0, H0: o.H0, v0: o.v0 }
  const rec = (k: number, tau: number) => {
    out.t.push(k * dt)
    out.Hv.push(H[N])
    out.Hm.push(H[Math.floor(N / 2)])
    out.Qv.push(Q[N])
    out.prof.push(H.slice())
    out.vel.push(Q.map((q) => q / A))
    out.tau.push(tau)
    out.Hmax = Math.max(out.Hmax, H[N])
    out.Hmin = Math.min(out.Hmin, H[N])
  }
  const tauAt = (t: number) => Math.max(0, 1 - t / o.T)
  const p = o.protect
  let zTank = o.H0 // surge tank level
  const CrRelief = p?.reliefSize ? (p.reliefSize * Q0) / Math.sqrt(10) : 0
  rec(0, 1)
  for (let k = 1; k <= steps; k++) {
    const Hn = H.slice()
    const Qn = Q.slice()
    // interior nodes
    for (let i = 1; i < N; i++) {
      const Cp = H[i - 1] + Bc * Q[i - 1]
      const Cm = H[i + 1] - Bc * Q[i + 1]
      Hn[i] = (Cp + Cm) / 2
      Qn[i] = (Cp - Cm) / (2 * Bc)
    }
    // reservoir end: C-
    Hn[0] = o.H0
    Qn[0] = (o.H0 - (H[1] - Bc * Q[1])) / Bc
    // valve end: C+ from node N-1;  H = Cp - Bc Qnode ;  Qnode = Qvalve(H) + Qrelief(H) + Qtank(H)
    const Cp = H[N - 1] + Bc * Q[N - 1]
    const tau = tauAt(k * dt)
    const Cv = (tau * Q0) ** 2 / o.H0
    const out_flow = (h: number) => {
      let q = Math.sqrt(Math.max(0, Cv * Math.max(0, h)))
      if (CrRelief && p?.reliefSet != null && h > p.reliefSet) q += CrRelief * Math.sqrt(h - p.reliefSet)
      if (p?.surgeArea) q += (p.surgeArea * (h - zTank)) / dt
      return q
    }
    let lo = -2000
    let hi = Cp + 2000
    for (let it = 0; it < 70; it++) {
      const mid = (lo + hi) / 2
      const g = mid - (Cp - Bc * out_flow(mid))
      if (g > 0) hi = mid
      else lo = mid
    }
    const Hv = (lo + hi) / 2
    Hn[N] = Hv
    Qn[N] = (Cp - Hv) / Bc
    if (p?.surgeArea) zTank = Hv
    for (let i = 0; i <= N; i++) {
      H[i] = Hn[i]
      Q[i] = Qn[i]
    }
    rec(k, tau)
  }
  return out
}
