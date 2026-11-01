// Doubly reinforced beams: live sketch (section + strain + forces) and step-by-step solutions (all numbers from the engine).
import { Tex } from '../../../components/ui'
import { epsU } from '../../engine/materials'
import { ES_KSI, type DoublyDesign, type DoublyDesignIn, type DoublyReview, type DoublyReviewIn } from '../../engine/doubly'
import { f, zoneLabel } from './kit'

// ---------------------------------------------------------------- sketch
export function DoublySketch({ inp, r, nT, nC, layers = 2 }: { inp: DoublyReviewIn; r: DoublyReview; nT: number; nC: number; layers?: number }) {
  const { b, d, dp } = inp
  const dt = inp.dt ?? d
  const h = dt + 2.5
  const W = 600,
    H = 270,
    top = 26,
    bot = 24
  const s = (H - top - bot) / h
  const Y = (z: number) => top + z * s
  const bw = Math.min(150, b * s)
  const x0 = 16
  // strain diagram
  const xs = 300
  const epsT = Math.max(r.epsT, r.ey * 1.05)
  const K = 90 / Math.max(epsU, epsT)
  const ey = r.ey
  const yc = Y(r.c)
  const xTop = xs - epsU * K
  const xBot = xs + r.epsT * K
  const espX = xs - r.epsSp * K
  const yieldCol = r.compYields ? 'var(--c-good)' : 'var(--c-bad)'
  // forces
  const xf = 440
  const blk = 52
  const perRow = layers === 2 ? Math.ceil(nT / 2) : nT
  const barR = Math.max(3, Math.min(7, (bw / Math.max(perRow, nC)) * 0.28))
  const rowY = layers === 2 && nT > 1 && dt > d ? [dt, 2 * d - dt] : [d]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <marker id="dsa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-ink)" />
        </marker>
      </defs>
      {/* section */}
      <text x={x0} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Section
      </text>
      <rect x={x0} y={Y(0)} width={bw} height={h * s} fill="var(--c-panel2)" stroke="var(--c-ink)" />
      <rect x={x0} y={Y(0)} width={bw} height={r.a * s} fill="var(--c-accent)" fillOpacity={0.22} />
      <line x1={x0 - 6} x2={xs + 120} y1={yc} y2={yc} stroke="var(--c-mute)" strokeDasharray="5 4" />
      <text x={x0 + bw + 4} y={yc - 3} fontSize={10} fill="var(--c-mute)">
        N.A. c = {f(r.c, 2)}″
      </text>
      {Array.from({ length: nC }, (_, i) => (
        <circle key={'c' + i} cx={x0 + ((i + 1) * bw) / (nC + 1)} cy={Y(dp)} r={barR} fill={yieldCol} />
      ))}
      {rowY.map((yy, k) => {
        const cnt = rowY.length === 2 ? (k === 0 ? perRow : nT - perRow) : nT
        return Array.from({ length: cnt }, (_, i) => <circle key={`t${k}${i}`} cx={x0 + ((i + 1) * bw) / (cnt + 1)} cy={Y(yy)} r={barR} fill="var(--c-ink)" />)
      })}
      <text x={x0 + bw / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="var(--c-mute)">
        b = {f(b)}″ · a = {f(r.a, 2)}″
      </text>
      <text x={x0 + bw + 4} y={Y(dp) + 4} fontSize={10} fill={yieldCol}>
        A′s at d′ = {f(dp)}″
      </text>
      <text x={x0 + bw + 4} y={Y(d) + 4} fontSize={10} fill="var(--c-ink)">
        d = {f(d)}″
      </text>
      {dt !== d && (
        <text x={x0 + bw + 4} y={Y(dt) + 12} fontSize={10} fill="var(--c-mute)">
          dt = {f(dt)}″
        </text>
      )}
      {/* strain */}
      <text x={xs - 60} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Strain
      </text>
      <line x1={xs} x2={xs} y1={Y(0)} y2={Y(dt)} stroke="var(--c-line)" />
      <polygon points={`${xs},${Y(0)} ${xTop},${Y(0)} ${xBot},${Y(dt)} ${xs},${Y(dt)}`} fill="var(--c-accent)" fillOpacity={0.1} stroke="none" />
      <line x1={xTop} x2={xBot} y1={Y(0)} y2={Y(dt)} stroke="var(--c-accent)" strokeWidth={2} />
      <text x={xTop} y={Y(0) - 4} fontSize={10} textAnchor="middle" fill="var(--c-accent)">
        εu = 0.003
      </text>
      {/* ε's vs εy at the A's level */}
      <line x1={espX} x2={xs} y1={Y(dp)} y2={Y(dp)} stroke={yieldCol} strokeWidth={3} />
      <line x1={xs - ey * K} x2={xs - ey * K} y1={Y(dp) - 12} y2={Y(dp) + 12} stroke="var(--c-load)" strokeDasharray="3 2" strokeWidth={1.5} />
      <text x={xs - ey * K} y={Y(dp) + 23} fontSize={9.5} textAnchor="middle" fill="var(--c-load)">
        εy = {f(ey, 5)}
      </text>
      <text x={xs + 6} y={Y(dp) + 4} fontSize={10} fill={yieldCol}>
        ε′s = {f(r.epsSp, 5)} {r.compYields ? '≥ εy ✓' : '< εy'}
      </text>
      {/* tension */}
      <line x1={xs + ey * K} x2={xs + ey * K} y1={Y(d) - 10} y2={Y(dt) + 6} stroke="var(--c-load)" strokeDasharray="3 2" />
      <line x1={xs} x2={xs + r.epsT * K} y1={Y(dt)} y2={Y(dt)} stroke="var(--c-ink)" strokeWidth={2} />
      <text x={xs + r.epsT * K} y={Y(dt) + 14} fontSize={10} textAnchor="middle" fill="var(--c-ink)">
        εt = {f(r.epsT, 5)}
      </text>
      {/* forces */}
      <text x={xf} y={14} fontSize={11} fill="var(--c-mute)" fontWeight={700}>
        Forces (kips)
      </text>
      <rect x={xf} y={Y(0)} width={blk} height={r.a * s} fill="var(--c-accent)" fillOpacity={0.3} stroke="var(--c-accent)" />
      <text x={xf + blk / 2} y={Y(0) - 4} fontSize={9.5} textAnchor="middle" fill="var(--c-accent)">
        0.85f′c
      </text>
      <line x1={xf + blk + 70} x2={xf + blk + 4} y1={Y(r.a / 2)} y2={Y(r.a / 2)} stroke="var(--c-ink)" strokeWidth={1.6} markerEnd="url(#dsa)" />
      <text x={xf + blk + 72} y={Y(r.a / 2) + 4} fontSize={10} fill="var(--c-ink)">
        Cc {f(r.Cc, 1)}
      </text>
      <line x1={xf + blk + 70} x2={xf + 4} y1={Y(dp) + 8} y2={Y(dp) + 8} stroke={yieldCol} strokeWidth={1.6} markerEnd="url(#dsa)" />
      <text x={xf + blk + 72} y={Y(dp) + 12} fontSize={10} fill={yieldCol}>
        Cs {f(r.Cs, 1)}
      </text>
      <line x1={xf + 4} x2={xf + blk + 70} y1={Y(d)} y2={Y(d)} stroke="var(--c-ink)" strokeWidth={1.6} markerEnd="url(#dsa)" />
      <text x={xf + blk + 72} y={Y(d) + 4} fontSize={10} fill="var(--c-ink)">
        T {f(r.T, 1)}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- review solution
export function ReviewSolution({ inp, r, compact }: { inp: DoublyReviewIn; r: DoublyReview; compact?: boolean }) {
  const { b, d, dp, As, Asp, fc, fy } = inp
  const dt = inp.dt ?? d
  const k = 0.85 * fc
  return (
    <div className="space-y-1 text-sm">
      {!compact && (
        <>
          <p>
            <b>1. Data.</b> β1 = {f(r.b1, 3)}, εy = fy/Es = {f(fy)}/{ES_KSI} = {f(r.ey, 5)}; ρ = {f(As, 2)}/({f(b)}×{f(d)}) = {f(r.rho, 5)}, ρ′ = {f(r.rhoP, 5)}.
          </p>
          <Tex block>{`\\bar\\rho_{cy} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{d'}{d}\\frac{\\varepsilon_u}{\\varepsilon_u - \\varepsilon_y} + \\rho' = 0.85(${f(r.b1, 3)})\\frac{${f(fc)}}{${f(fy)}}\\frac{${f(dp)}}{${f(d)}}\\frac{0.003}{0.003 - ${f(r.ey, 5)}} + ${f(r.rhoP, 5)} = ${f(r.rhoCy, 5)}`}</Tex>
        </>
      )}
      <p>
        <b>2. Assume A′s yields.</b>
      </p>
      <Tex block>{`a = \\frac{(A_s - A'_s)f_y}{0.85f'_cb} = \\frac{(${f(As, 2)} - ${f(Asp, 2)})(${f(fy)})}{0.85(${f(fc)})(${f(b)})} = ${f(r.trial.a, 3)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.trial.c, 3)}\\text{ in}`}</Tex>
      <Tex block>{`\\varepsilon'_s = 0.003\\frac{c - d'}{c} = 0.003\\frac{${f(r.trial.c, 3)} - ${f(dp)}}{${f(r.trial.c, 3)}} = ${f(r.trial.epsSp, 5)}\\ ${r.trial.epsSp >= r.ey ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(r.ey, 5)}`}</Tex>
      <p>
        → ρ = {f(r.rho, 5)} {r.rho >= r.rhoCy ? '≥' : '<'} ρ̄cy = {f(r.rhoCy, 5)}: compression steel <b>{r.method === 'both-yield' ? 'yields' : 'does not yield'}</b>.
      </p>
      {r.method === 'quadratic' && r.quad && (
        <>
          <p>
            <b>3. Strain compatibility</b> (f′s = Es εu (c − d′)/c = 87(c − d′)/c ksi{r.dispUsed ? ', displaced concrete subtracted' : ''}):
          </p>
          <Tex block>{`A_sf_y = 0.85f'_c\\beta_1bc + A'_s\\left(87\\frac{c - ${f(dp)}}{c}${r.dispUsed ? ` - ${f(k, 3)}` : ''}\\right)`}</Tex>
          <Tex block>{`${f(r.quad.A, 3)}c^2 ${r.quad.B < 0 ? '-' : '+'} ${f(Math.abs(r.quad.B), 3)}c - ${f(Math.abs(r.quad.C), 3)} = 0\\ \\Rightarrow\\ c = ${f(r.c, 3)}\\text{ in}`}</Tex>
          <Tex block>{`f'_s = 87\\frac{${f(r.c, 3)} - ${f(dp)}}{${f(r.c, 3)}} = ${f(r.fsp, 2)}\\text{ ksi} < f_y`}</Tex>
        </>
      )}
      {r.method === 'general' && (
        <p>
          <b>3. Tension steel does not yield</b> (εs at d below εy): solved by strain compatibility for both steels → c = {f(r.c, 3)} in, fs = {f(r.fs, 2)} ksi, f′s = {f(r.fsp, 2)} ksi. The section is over-reinforced: increase A′s or the section.
        </p>
      )}
      {r.method === 'both-yield' && <p>3. Keep c = {f(r.c, 3)} in, f′s = fy = {f(fy)} ksi. Tension steel: εs = 0.003(d − c)/c = {f(r.epsS, 5)} ≥ εy ✓.</p>}
      <p>
        <b>4. Forces.</b> a = β1c = {f(r.a, 3)} in
      </p>
      <Tex block>{`C_c = 0.85f'_cab = 0.85(${f(fc)})(${f(r.a, 3)})(${f(b)}) = ${f(r.Cc, 1)}\\text{ k},\\quad C_s = A'_s(${r.dispUsed ? `f'_s - 0.85f'_c` : `f'_s`}) = ${f(Asp, 2)}(${f(r.fsp, 2)}${r.dispUsed ? ` - ${f(k, 2)}` : ''}) = ${f(r.Cs, 1)}\\text{ k}`}</Tex>
      <p>
        Check: Cc + Cs = {f(r.Cc + r.Cs, 1)} k = T = As fs = {f(r.T, 1)} k ✓
      </p>
      <p>
        <b>5. Moment.</b>
      </p>
      <Tex block>{`M_n = C_c\\left(d - \\tfrac a2\\right) + C_s(d - d') = ${f(r.Cc, 1)}(${f(d)} - ${f(r.a / 2, 3)}) + ${f(r.Cs, 1)}(${f(d)} - ${f(dp)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.MnFt, 1)}\\text{ k-ft}`}</Tex>
      <p>
        <b>6. Ductility and φ</b> (εt at the extreme layer dt = {f(dt)} in):
      </p>
      <Tex block>{`\\varepsilon_t = 0.003\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c, 3)}}{${f(r.c, 3)}} = ${f(r.epsT, 5)}\\ \\Rightarrow\\ \\phi = ${f(r.phi, 3)}`}</Tex>
      <p>
        {zoneLabel(r.zone)}; εt {r.ductileOk ? '≥' : '<'} 0.004 {r.ductileOk ? '✓' : '✗ (not permitted for a beam)'}. Class ρ check: ρ − ρ′f′s/fy = {f(r.rhoBar, 5)} {r.rhoBar <= r.rhoMax ? '≤' : '>'} ρmax = {f(r.rhoMax, 5)}.
      </p>
      <p className="text-base">
        <b>
          φMn = {f(r.phi, 3)} × {f(r.MnFt, 1)} = {f(r.phiMn, 1)} k-ft
        </b>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- design solution
export function DesignSolution({ inp, r }: { inp: DoublyDesignIn; r: DoublyDesign }) {
  const { b, d, dp, fc, fy, Mu } = inp
  const dt = inp.dt
  const sm = r.sm
  return (
    <div className="space-y-1 text-sm">
      <p>
        <b>1. Largest singly reinforced capacity</b> ({sm.basis === 'rho-d' ? 'class handnotes: ρ0.005 with d' : 'εt = 0.005 at dt: c = 0.375 dt'}).
      </p>
      {sm.basis === 'rho-d' ? (
        <Tex block>{`\\rho_{0.005} = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{\\varepsilon_u}{\\varepsilon_u + 0.005} = ${f(sm.rho005, 5)},\\quad A_{s1} = \\rho bd = ${f(sm.rho005, 5)}(${f(b)})(${f(d)}) = ${f(sm.As1, 3)}\\text{ in}^2`}</Tex>
      ) : (
        <Tex block>{`c = 0.375d_t = ${f(sm.c, 3)},\\ a = \\beta_1c = ${f(sm.a, 3)},\\ A_{s1} = \\frac{0.85f'_cab}{f_y} = ${f(sm.As1, 3)}\\text{ in}^2`}</Tex>
      )}
      <Tex block>{`a = \\frac{A_{s1}f_y}{0.85f'_cb} = ${f(sm.a, 3)},\\ c = ${f(sm.c, 3)},\\ M_{n1} = A_{s1}f_y\\left(d - \\tfrac a2\\right) = ${f(sm.Mn1, 0)}\\text{ in-k},\\ \\phi M_{n1} = ${f(sm.phi, 2)}M_{n1} = ${f(sm.phiMn1, 1)}\\text{ k-ft}`}</Tex>
      <p>
        <b>2.</b> Mu = {f(Mu)} k-ft {r.needed ? '>' : '≤'} φMn1 = {f(sm.phiMn1, 1)} k-ft → <b>{r.needed ? 'compression steel is required' : 'a singly reinforced section is enough'}</b>.
      </p>
      {!r.needed && r.singly && (
        <>
          <Tex block>{`M_u = \\phi A_sf_y\\left(d - \\frac{A_sf_y}{1.7f'_cb}\\right)\\ \\Rightarrow\\ A_s = ${f(r.singly.As, 3)}\\text{ in}^2`}</Tex>
          <p>
            Provide {r.tension.n} #{r.tension.no} ({f(r.tension.A, 2)} in²): εt = {f(r.review.epsT, 5)}, φMn = {f(r.review.phiMn, 1)} k-ft {r.review.phiMn >= Mu ? '≥' : '<'} Mu.
          </p>
        </>
      )}
      {r.needed && r.comp && (
        <>
          <Tex block>{`\\phi M_{n2} = M_u - \\phi M_{n1} = ${f(Mu)} - ${f(sm.phiMn1, 1)} = ${f(r.phiMn2, 1)}\\text{ k-ft},\\quad M_{n2} = \\frac{${f(r.phiMn2, 1)}\\times 12}{0.9} = ${f(r.Mn2, 0)}\\text{ in-k}`}</Tex>
          <p>
            <b>3. Stress in A′s</b> at c = {f(sm.c, 3)} in:
          </p>
          <Tex block>{`\\varepsilon'_s = 0.003\\frac{${f(sm.c, 3)} - ${f(dp)}}{${f(sm.c, 3)}} = ${f(r.epsSp, 5)}\\ ${r.compYields ? '\\ge' : '<'}\\ \\varepsilon_y = ${f(fy / ES_KSI, 5)}\\ \\Rightarrow\\ f'_s = ${f(r.fsp, 2)}\\text{ ksi}`}</Tex>
          {inp.fsMode === 'assume-yield' && !r.compYields && <p className="text-faint">(handnote shortcut: f′s = fy assumed; the review of the provided bars catches it)</p>}
          <p>
            <b>4. Steel areas.</b>
          </p>
          <Tex block>{`A'_s = \\frac{M_{n2}}{f'_s(d - d')} = \\frac{${f(r.Mn2, 0)}}{${f(r.fsp, 2)}(${f(d)} - ${f(dp)})} = ${f(r.Asp, 3)}\\text{ in}^2`}</Tex>
          <Tex block>{`A_{s2} = \\frac{A'_sf'_s}{f_y} = ${f(r.As2, 3)},\\quad A_s = A_{s1} + A_{s2} = ${f(sm.As1, 3)} + ${f(r.As2, 3)} = ${f(r.As, 3)}\\text{ in}^2`}</Tex>
          <p>
            <b>5. Bars.</b> Tension: {r.tension.n} #{r.tension.no} = {f(r.tension.A, 2)} in² ({r.tension.layers} layer{r.tension.layers > 1 ? 's' : ''}); compression: {r.comp.n} #{r.comp.no} = {f(r.comp.A, 2)} in².
            {r.bumped > 0 && <> ({r.comp.n - r.bumped} #{r.comp.no} first, but the review with the displaced concrete and φ from εt fell short of Mu, so {r.bumped} bar{r.bumped > 1 ? 's were' : ' was'} added.)</>}
          </p>
        </>
      )}
      <p>
        <b>{r.needed ? '6' : '3'}. Review of the provided section</b> (dt = {f(dt)} in): A′s {r.review.compYields ? 'yields' : `does not yield (f′s = ${f(r.review.fsp, 2)} ksi)`}, c = {f(r.review.c, 3)} in, εt = {f(r.review.epsT, 5)}, φ = {f(r.review.phi, 3)}, φMn = <b>{f(r.review.phiMn, 1)} k-ft</b> {r.review.phiMn >= Mu * 0.999 ? '≥' : '<'} Mu = {f(Mu)} {r.ok ? '✓' : '✗'}
      </p>
    </div>
  )
}
