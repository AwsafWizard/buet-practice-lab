// CE 315 elastic (service-load) analysis of rectangular RC sections and the WSD design helpers.
// Class method (Nilson Ex 4.1 / 4.2): uncracked transformed section with (n − 1)As, cracked transformed
// section with nAs (kd from the quadratic). Compression steel: (n − 1)A's uncracked; in the cracked
// section the class / ACI alternate design method uses 2n for compression steel (creep), i.e. (2n − 1)A's
// and f's = 2n·fc(kd − d')/kd ≤ fs. Option `compN: 'n'` switches to (n − 1)A's.
// Inputs: lengths in in, areas in², f'c and fy in psi (like materials.ts). Outputs: stresses in ksi, moments in k-ft.

import { Ec, Es, fr as frOf } from './materials'

export interface SolStep {
  /** short title, e.g. "Neutral axis" */
  t: string
  /** TeX of the working line */
  tex?: string
  /** markdown note */
  md?: string
  /** main value of the step (for checkpoints) */
  v?: number
  u?: string
}

/** number → short string for TeX lines */
export function f(v: number, d = 3) {
  if (!Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (a !== 0 && a < 1e-3) return v.toExponential(2).replace(/e([+-]\d+)/, (_, e) => `\\times10^{${+e}}`)
  const s = v.toFixed(a >= 1000 ? 0 : a >= 100 ? Math.min(d, 1) : a >= 10 ? Math.min(d, 2) : d)
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

export interface ElasticInput {
  b: number
  h: number
  /** depth of tension steel from the compression face */
  d: number
  As: number
  /** compression steel (optional) */
  Asp?: number
  dp?: number
  /** psi */
  fc: number
  /** psi, for allowables 0.4fy (optional) */
  fy?: number
  /** modular ratio; default round(Es/Ec) as the class does */
  n?: number
  /** modulus of rupture psi; default 7.5√f'c */
  frPsi?: number
  /** Ec in psi; default 57000√f'c */
  EcPsi?: number
  /** cracked-section compression-steel convention (default '2n' = (2n − 1)A's) */
  compN?: '2n' | 'n'
}

export function modular(inp: ElasticInput) {
  const E = inp.EcPsi ?? Ec(inp.fc)
  const exact = Es / E
  return { Ec: E, exact, n: inp.n ?? Math.round(exact) }
}

// ---------------------------------------------------------------- uncracked
export interface Uncracked {
  n: number
  Ec: number
  fr: number
  Ag: number
  /** added transformed areas */
  At_s: number
  At_sp: number
  At: number
  /** neutral axis from the compression face */
  ybar: number
  /** distance NA → tension face */
  yt: number
  I: number
  Ig: number
  /** k-ft */
  Mcr: number
  /** gross-section Mcr (k-ft) */
  McrG: number
  /** steel stress just before cracking (ksi) and strain */
  fsCr: number
  epsSCr: number
  /** concrete top stress just before cracking (ksi) */
  fcCr: number
  steps: SolStep[]
}

export function uncracked(inp: ElasticInput): Uncracked {
  const { b, h, d, As } = inp
  const Asp = inp.Asp ?? 0
  const dp = inp.dp ?? 2.5
  const { n, Ec: E } = modular(inp)
  const frPsi = inp.frPsi ?? frOf(inp.fc)
  const Ag = b * h
  const At_s = (n - 1) * As
  const At_sp = (n - 1) * Asp
  const At = Ag + At_s + At_sp
  const ybar = (Ag * (h / 2) + At_s * d + At_sp * dp) / At
  const yt = h - ybar
  const Ig = (b * h ** 3) / 12
  const I = Ig + Ag * (ybar - h / 2) ** 2 + At_s * (d - ybar) ** 2 + At_sp * (ybar - dp) ** 2
  const Mcr = (frPsi * I) / yt / 12000
  const McrG = (frPsi * Ig) / (h / 2) / 12000
  const fsCr = (n * frPsi * (d - ybar)) / yt / 1000
  const epsSCr = (fsCr * 1000) / Es
  const fcCr = (frPsi * ybar) / yt / 1000
  const steps: SolStep[] = [
    { t: 'Modular ratio', tex: `n = \\frac{E_s}{E_c} = \\frac{29{,}000}{${f(E / 1000, 0)}} = ${f(Es / E, 2)} \\Rightarrow n = ${n}`, v: n, md: inp.n ? 'n as given in the question.' : 'Rounded to a whole number, as the class does.' },
    { t: 'Modulus of rupture', tex: `f_r = ${inp.frPsi ? f(frPsi, 0) : `7.5\\sqrt{${inp.fc}} = ${f(frPsi, 0)}`}\\text{ psi}`, v: frPsi, u: 'psi' },
    {
      t: 'Transformed areas',
      tex: `(n-1)A_s = ${n - 1}\\times${f(As)} = ${f(At_s)}\\text{ in}^2${Asp ? `,\\quad (n-1)A'_s = ${f(At_sp)}\\text{ in}^2` : ''},\\quad A_t = ${f(Ag)} + ${f(At_s)}${Asp ? ` + ${f(At_sp)}` : ''} = ${f(At)}\\text{ in}^2`,
      v: At,
      u: 'in²',
    },
    {
      t: 'Neutral axis (from the top)',
      tex: `\\bar y = \\frac{${f(Ag)}(${f(h / 2)}) + ${f(At_s)}(${f(d)})${Asp ? ` + ${f(At_sp)}(${f(dp)})` : ''}}{${f(At)}} = ${f(ybar)}\\text{ in},\\quad y_t = ${f(h)} - ${f(ybar)} = ${f(yt)}\\text{ in}`,
      v: ybar,
      u: 'in',
    },
    {
      t: 'Moment of inertia',
      tex: `I_{ut} = \\frac{${f(b)}(${f(h)})^3}{12} + ${f(Ag)}(${f(ybar - h / 2)})^2 + ${f(At_s)}(${f(d - ybar)})^2${Asp ? ` + ${f(At_sp)}(${f(ybar - dp)})^2` : ''} = ${f(I, 0)}\\text{ in}^4`,
      v: I,
      u: 'in⁴',
    },
    { t: 'Cracking moment', tex: `M_{cr} = \\frac{f_r I_{ut}}{y_t} = \\frac{${f(frPsi, 0)}\\times${f(I, 0)}}{${f(yt)}} = ${f(Mcr * 12000, 0)}\\text{ in-lb} = ${f(Mcr, 2)}\\text{ k-ft}`, v: Mcr, u: 'k-ft', md: `Gross section (steel ignored): $M_{cr} = f_r(bh^2/6) = ${f(McrG, 2)}$ k-ft.` },
    {
      t: 'Steel just before cracking',
      tex: `f_s = n\\,f_r\\frac{d-\\bar y}{y_t} = ${n}\\times${f(frPsi, 0)}\\times\\frac{${f(d - ybar)}}{${f(yt)}} = ${f(fsCr * 1000, 0)}\\text{ psi},\\quad \\varepsilon_s = \\frac{f_s}{E_s} = ${f(epsSCr)}`,
      v: fsCr,
      u: 'ksi',
    },
  ]
  return { n, Ec: E, fr: frPsi, Ag, At_s, At_sp, At, ybar, yt, I, Ig, Mcr, McrG, fsCr, epsSCr, fcCr, steps }
}

/** stresses (ksi, + = compression) in the uncracked section at M (k-ft) */
export function uncrackedStresses(inp: ElasticInput, M: number) {
  const u = uncracked(inp)
  const Mi = M * 12000 // in-lb
  const dp = inp.dp ?? 2.5
  const fcTop = (Mi * u.ybar) / u.I / 1000
  const fct = (Mi * u.yt) / u.I / 1000
  const fs = (u.n * Mi * (inp.d - u.ybar)) / u.I / 1000
  const fsp = inp.Asp ? (u.n * Mi * (u.ybar - dp)) / u.I / 1000 : 0
  const steps: SolStep[] = [
    { t: 'Top fibre (compression)', tex: `f_c = \\frac{M\\bar y}{I} = \\frac{${f(Mi, 0)}\\times${f(u.ybar)}}{${f(u.I, 0)}} = ${f(fcTop * 1000, 0)}\\text{ psi}`, v: fcTop, u: 'ksi' },
    { t: 'Bottom fibre (tension)', tex: `f_{ct} = \\frac{My_t}{I} = ${f(fct * 1000, 0)}\\text{ psi}\\ ${fct * 1000 < u.fr ? '<' : '>'}\\ f_r = ${f(u.fr, 0)}\\text{ psi}`, v: fct, u: 'ksi' },
    { t: 'Tension steel', tex: `f_s = n\\frac{M(d-\\bar y)}{I} = ${u.n}\\times\\frac{${f(Mi, 0)}\\times${f(inp.d - u.ybar)}}{${f(u.I, 0)}} = ${f(fs * 1000, 0)}\\text{ psi}`, v: fs, u: 'ksi' },
  ]
  if (inp.Asp) steps.push({ t: 'Compression steel', tex: `f'_s = n\\frac{M(\\bar y - d')}{I} = ${f(fsp * 1000, 0)}\\text{ psi}`, v: fsp, u: 'ksi' })
  return { ...u, M, fcTop, fct, fs, fsp, cracked: fct * 1000 > u.fr, stressSteps: steps }
}

// ---------------------------------------------------------------- cracked
export interface Cracked {
  n: number
  /** modular ratio used for compression steel (2n or n) */
  nc: number
  kd: number
  k: number
  j: number
  Icr: number
  rho: number
  steps: SolStep[]
}

export function cracked(inp: ElasticInput): Cracked {
  const { b, d, As } = inp
  const Asp = inp.Asp ?? 0
  const dp = inp.dp ?? 2.5
  const { n } = modular(inp)
  const nc = Asp ? (inp.compN === 'n' ? n : 2 * n) : n
  const Ap = (nc - 1) * Asp
  // b x²/2 + Ap(x − d') − nAs(d − x) = 0
  const A = b / 2
  const B = Ap + n * As
  const C = -(Ap * dp + n * As * d)
  const kd = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A)
  const k = kd / d
  const j = 1 - k / 3
  const Icr = (b * kd ** 3) / 3 + Ap * (kd - dp) ** 2 + n * As * (d - kd) ** 2
  const rho = As / (b * d)
  const steps: SolStep[] = []
  if (!Asp) {
    const rn = rho * n
    steps.push(
      { t: 'Steel ratio', tex: `\\rho = \\frac{A_s}{bd} = \\frac{${f(As)}}{${f(b)}\\times${f(d)}} = ${f(rho, 4)},\\quad \\rho n = ${f(rn, 4)}`, v: rho },
      { t: 'Neutral axis', tex: `k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n = \\sqrt{${f(rn, 4)}^2 + 2(${f(rn, 4)})} - ${f(rn, 4)} = ${f(k)},\\quad kd = ${f(kd)}\\text{ in}`, v: kd, u: 'in', md: `Same as $\\tfrac{b(kd)^2}{2} = nA_s(d - kd)$. Normal beams: $0.3 < k < 0.4$.` },
      { t: 'Lever arm', tex: `j = 1 - \\frac{k}{3} = ${f(j)},\\quad jd = ${f(j * d)}\\text{ in}`, v: j },
    )
  } else {
    steps.push({
      t: 'Neutral axis (with compression steel)',
      tex: `\\frac{${f(b)}x^2}{2} + ${nc - 1}(${f(Asp)})(x - ${f(dp)}) = ${n}(${f(As)})(${f(d)} - x) \\Rightarrow kd = x = ${f(kd)}\\text{ in}`,
      v: kd,
      u: 'in',
      md: inp.compN === 'n' ? "Compression steel transformed as $(n-1)A'_s$." : "Compression steel transformed as $(2n-1)A'_s$ (ACI alternate design method: creep doubles the steel's share).",
    })
  }
  steps.push({
    t: 'Cracked moment of inertia',
    tex: `I_{cr} = \\frac{b(kd)^3}{3}${Asp ? ` + ${f(Ap)}(${f(kd - dp)})^2` : ''} + nA_s(d-kd)^2 = \\frac{${f(b)}(${f(kd)})^3}{3}${Asp ? ` + ${f(Ap)}(${f(kd - dp)})^2` : ''} + ${f(n * As)}(${f(d - kd)})^2 = ${f(Icr, 0)}\\text{ in}^4`,
    v: Icr,
    u: 'in⁴',
  })
  return { n, nc, kd, k, j, Icr, rho, steps }
}

/** service stresses (ksi) in the cracked section at M (k-ft) */
export function crackedStresses(inp: ElasticInput, M: number) {
  const c = cracked(inp)
  const Mi = M * 12 // in-k
  const dp = inp.dp ?? 2.5
  const fc = (Mi * c.kd) / c.Icr
  const fs = (c.n * Mi * (inp.d - c.kd)) / c.Icr
  const fsp = inp.Asp ? (c.nc * Mi * (c.kd - dp)) / c.Icr : 0
  const steps: SolStep[] = inp.Asp
    ? [
        { t: 'Concrete (top)', tex: `f_c = \\frac{M\\,kd}{I_{cr}} = \\frac{${f(Mi, 0)}\\times${f(c.kd)}}{${f(c.Icr, 0)}} = ${f(fc)}\\text{ ksi}`, v: fc, u: 'ksi' },
        { t: 'Tension steel', tex: `f_s = n\\frac{M(d-kd)}{I_{cr}} = ${f(fs)}\\text{ ksi}`, v: fs, u: 'ksi' },
        { t: 'Compression steel', tex: `f'_s = ${c.nc === c.n ? 'n' : '2n'}\\frac{M(kd-d')}{I_{cr}} = ${f(fsp)}\\text{ ksi}`, v: fsp, u: 'ksi' },
      ]
    : [
        { t: 'Steel stress', tex: `f_s = \\frac{M}{A_s jd} = \\frac{${f(Mi, 0)}}{${f(inp.As)}\\times${f(c.j)}\\times${f(inp.d)}} = ${f(fs)}\\text{ ksi}`, v: fs, u: 'ksi' },
        { t: 'Concrete stress', tex: `f_c = \\frac{2M}{kjbd^2} = \\frac{2\\times${f(Mi, 0)}}{${f(c.k)}\\times${f(c.j)}\\times${f(inp.b)}\\times${f(inp.d)}^2} = ${f(fc)}\\text{ ksi}`, v: fc, u: 'ksi', md: `Same as $f_c = M\\,kd/I_{cr}$.` },
      ]
  return { ...c, M, fc, fs, fsp, stressSteps: steps }
}

/** WSD allowables: fc = 0.45f'c; fs = 0.4fy if fy given (24 ksi for Grade 60, 20 ksi Grade 40) */
export function wsdAllowables(fcPsi: number, fyPsi = 60000) {
  return { fc: (0.45 * fcPsi) / 1000, fs: fyPsi >= 60000 ? 24 : 20 }
}

/** allowable service moment of a cracked section: the smaller of the concrete and steel limits */
export function allowableMoment(inp: ElasticInput, fcAllow: number, fsAllow: number) {
  const c = cracked(inp)
  const Mc = (fcAllow * c.Icr) / c.kd / 12
  const Ms = (fsAllow * c.Icr) / (c.n * (inp.d - c.kd)) / 12
  const governs: 'concrete' | 'steel' = Mc <= Ms ? 'concrete' : 'steel'
  const M = Math.min(Mc, Ms)
  const steps: SolStep[] = [
    ...c.steps,
    { t: 'Concrete limit', tex: `M_c = \\frac{f_{c,all} I_{cr}}{kd} = \\frac{${f(fcAllow)}\\times${f(c.Icr, 0)}}{${f(c.kd)}} = ${f(Mc * 12, 0)}\\text{ in-k} = ${f(Mc, 1)}\\text{ k-ft}`, v: Mc, u: 'k-ft' },
    { t: 'Steel limit', tex: `M_s = \\frac{f_{s,all} I_{cr}}{n(d-kd)} = \\frac{${f(fsAllow)}\\times${f(c.Icr, 0)}}{${c.n}\\times${f(inp.d - c.kd)}} = ${f(Ms * 12, 0)}\\text{ in-k} = ${f(Ms, 1)}\\text{ k-ft}`, v: Ms, u: 'k-ft' },
    { t: 'Allowable moment', tex: `M_{all} = \\min(${f(Mc, 1)},\\ ${f(Ms, 1)}) = ${f(M, 1)}\\text{ k-ft}\\ \\ (\\text{${governs} governs})`, v: M, u: 'k-ft' },
  ]
  if (!inp.Asp) steps.splice(c.steps.length, 0, { t: 'Same by k, j', md: `$M_c = \\tfrac12 f_c\\,k j\\,bd^2$, $M_s = A_s f_s\\,jd$ give the same numbers.` })
  return { ...c, fcAllow, fsAllow, Mc, Ms, M, governs, steps }
}

/** full elastic analysis at a service moment: checks M against Mcr first, then uses the right section */
export function elasticAt(inp: ElasticInput, M: number) {
  const u = uncracked(inp)
  if (M <= u.Mcr) {
    const s = uncrackedStresses(inp, M)
    return { state: 'uncracked' as const, Mcr: u.Mcr, fc: s.fcTop, fs: s.fs, fsp: s.fsp, fct: s.fct, na: u.ybar, I: u.I, steps: [...u.steps, { t: 'Check', tex: `M = ${f(M, 1)} \\le M_{cr} = ${f(u.Mcr, 1)}\\text{ k-ft} \\Rightarrow \\text{uncracked}` }, ...s.stressSteps] }
  }
  const c = crackedStresses(inp, M)
  return { state: 'cracked' as const, Mcr: u.Mcr, fc: c.fc, fs: c.fs, fsp: c.fsp, fct: 0, na: c.kd, I: c.Icr, steps: [{ t: 'Check', tex: `M = ${f(M, 1)} > M_{cr} = ${f(u.Mcr, 1)}\\text{ k-ft} \\Rightarrow \\text{cracked: use the cracked transformed section}` }, ...c.steps, ...c.stressSteps] }
}

// ---------------------------------------------------------------- WSD design (older papers)
export interface WsdDesign {
  n: number
  fc: number
  fs: number
  k: number
  j: number
  /** ksi */
  R: number
  /** balanced-stress steel ratio */
  rhoBal: number
  steps: SolStep[]
}

/** balanced WSD parameters: k = n/(n + fs/fc), j = 1 − k/3, R = ½ fc k j (ksi) */
export function wsdParams(n: number, fcAllow: number, fsAllow: number): WsdDesign {
  const k = n / (n + fsAllow / fcAllow)
  const j = 1 - k / 3
  const R = 0.5 * fcAllow * k * j
  const rhoBal = (fcAllow * k) / (2 * fsAllow)
  return {
    n,
    fc: fcAllow,
    fs: fsAllow,
    k,
    j,
    R,
    rhoBal,
    steps: [
      { t: 'Balanced k', tex: `k = \\frac{n}{n + f_s/f_c} = \\frac{${n}}{${n} + ${f(fsAllow)}/${f(fcAllow)}} = ${f(k)}`, v: k },
      { t: 'Lever arm', tex: `j = 1 - k/3 = ${f(j)}`, v: j },
      { t: 'Resistance factor', tex: `R = \\tfrac12 f_c k j = \\tfrac12(${f(fcAllow)})(${f(k)})(${f(j)}) = ${f(R, 4)}\\text{ ksi} = ${f(R * 1000, 0)}\\text{ psi}`, v: R, u: 'ksi' },
      { t: 'Balanced-stress steel ratio', tex: `\\rho_{bal} = \\frac{f_c k}{2f_s} = ${f(rhoBal, 4)}`, v: rhoBal },
    ],
  }
}

/** WSD design: d required for M (k-ft) and b, then As = M/(fs j d) at a chosen d */
export function wsdDesign(M: number, b: number, n: number, fcAllow: number, fsAllow: number, dUsed?: number) {
  const p = wsdParams(n, fcAllow, fsAllow)
  const dReq = Math.sqrt((M * 12) / (p.R * b))
  const d = dUsed ?? dReq
  const As = (M * 12) / (fsAllow * p.j * d)
  const steps: SolStep[] = [
    ...p.steps,
    { t: 'Effective depth', tex: `d = \\sqrt{\\frac{M}{Rb}} = \\sqrt{\\frac{${f(M * 12, 0)}}{${f(p.R, 4)}\\times${f(b)}}} = ${f(dReq, 2)}\\text{ in}`, v: dReq, u: 'in' },
    { t: 'Steel area', tex: `A_s = \\frac{M}{f_s j d} = \\frac{${f(M * 12, 0)}}{${f(fsAllow)}\\times${f(p.j)}\\times${f(d, 2)}} = ${f(As)}\\text{ in}^2`, v: As, u: 'in²', md: dUsed && dUsed > dReq ? 'With d larger than required the concrete is under-stressed; the true j is a little larger, so this As is slightly conservative.' : undefined },
  ]
  return { ...p, dReq, d, As, steps }
}

/** WSD design of a fixed section that needs compression steel (classic method, f's = 2n fc (kd − d')/kd ≤ fs) */
export function wsdDoublyDesign(M: number, b: number, d: number, dp: number, n: number, fcAllow: number, fsAllow: number) {
  const p = wsdParams(n, fcAllow, fsAllow)
  const M1 = (p.R * b * d * d) / 12
  const As1 = (M1 * 12) / (fsAllow * p.j * d)
  const M2 = Math.max(0, M - M1)
  const kd = p.k * d
  const fsp = Math.min(fsAllow, (2 * n * fcAllow * (kd - dp)) / kd)
  const Asp = (M2 * 12) / (fsp * (d - dp))
  const As2 = (M2 * 12) / (fsAllow * (d - dp))
  const steps: SolStep[] = [
    ...p.steps,
    { t: 'Capacity without compression steel', tex: `M_1 = Rbd^2 = ${f(p.R, 4)}\\times${f(b)}\\times${f(d)}^2 = ${f(M1 * 12, 0)}\\text{ in-k} = ${f(M1, 1)}\\text{ k-ft}`, v: M1, u: 'k-ft' },
    { t: 'Steel for M₁', tex: `A_{s1} = \\frac{M_1}{f_s jd} = ${f(As1)}\\text{ in}^2`, v: As1, u: 'in²' },
    { t: 'Remaining moment', tex: `M_2 = M - M_1 = ${f(M, 1)} - ${f(M1, 1)} = ${f(M2, 1)}\\text{ k-ft}`, v: M2, u: 'k-ft' },
    { t: 'Compression-steel stress', tex: `f'_s = 2n f_c\\frac{kd - d'}{kd} = 2(${n})(${f(fcAllow)})\\frac{${f(kd)} - ${f(dp)}}{${f(kd)}} = ${f((2 * n * fcAllow * (kd - dp)) / kd)}\\ ${fsp < fsAllow ? '' : `\\to f_s = ${f(fsAllow)}`}\\text{ ksi}`, v: fsp, u: 'ksi' },
    { t: 'Compression steel', tex: `A'_s = \\frac{M_2}{f'_s(d-d')} = ${f(Asp)}\\text{ in}^2`, v: Asp, u: 'in²' },
    { t: 'Total tension steel', tex: `A_s = A_{s1} + \\frac{M_2}{f_s(d-d')} = ${f(As1)} + ${f(As2)} = ${f(As1 + As2)}\\text{ in}^2`, v: As1 + As2, u: 'in²' },
  ]
  return { ...p, M1, As1, M2, fsp, Asp, As: As1 + As2, needsComp: M > M1, steps }
}
