// T-beams: live section sketch and step-by-step solutions (every number from src/rc/engine/tbeam.ts).
import { Tex } from '../../../components/ui'
import { epsU } from '../../engine/materials'
import type { BeffIn, BeffOut, FloorIn, FloorOut, RectDesign, RectReview, TDesign, TDesignIn, TIn, TReview, WsdTDesign, WsdTReview } from '../../engine/tbeam'
import { f, zoneLabel } from '../doubly/kit'

// ---------------------------------------------------------------- sketch
export function TSketch({ beff, bw, hf, d, dt, a, c, nBars, support }: { beff: number; bw: number; hf: number; d: number; dt: number; a: number; c: number; nBars: number; support?: boolean }) {
  const W = 560,
    H = 250,
    top = 30,
    bot = 26
  const h = Math.max(dt + 2.5, hf + 4)
  const sy = (H - top - bot) / h
  const fw = Math.min(420, Math.max(160, beff * 4))
  const sx = fw / beff
  const ww = Math.max(28, bw * sx)
  const cx = 30 + fw / 2
  const xF = cx - fw / 2
  const xW = cx - ww / 2
  // y measured from the compression face; for the support section the flange is at the top but compression at the bottom
  const Y = (z: number) => top + z * sy
  const flangeTop = top
  const flangeBot = Y(hf)
  const webBot = Y(h)
  const block: { x: number; y: number; w: number; hgt: number }[] = []
  if (!support) {
    if (a <= hf) block.push({ x: xF, y: Y(0), w: fw, hgt: a * sy })
    else {
      block.push({ x: xF, y: Y(0), w: fw, hgt: hf * sy })
      block.push({ x: xW, y: Y(hf), w: ww, hgt: (a - hf) * sy })
    }
  } else block.push({ x: xW, y: webBot - a * sy, w: ww, hgt: a * sy })
  const naY = support ? webBot - c * sy : Y(c)
  const rows = dt > d + 0.01 ? 2 : 1
  const per = Math.ceil(nBars / rows)
  const barY = (k: number) => (support ? (k === 0 ? webBot - dt * sy : webBot - (2 * d - dt) * sy) : k === 0 ? Y(dt) : Y(2 * d - dt))
  const r = Math.max(2.5, Math.min(6, (ww / (per + 1)) * 0.32))
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <path
        d={`M${xF},${flangeTop} H${xF + fw} V${flangeBot} H${xW + ww} V${webBot} H${xW} V${flangeBot} H${xF} Z`}
        fill="var(--c-panel2)"
        stroke="var(--c-ink)"
      />
      {support && <rect x={xF} y={flangeTop} width={fw} height={hf * sy} fill="var(--c-load)" fillOpacity={0.12} />}
      {block.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.hgt} fill="var(--c-accent)" fillOpacity={0.35} stroke="var(--c-accent)" strokeWidth={0.8} />
      ))}
      <line x1={xF - 10} x2={xF + fw + 10} y1={naY} y2={naY} stroke="var(--c-mute)" strokeDasharray="5 4" />
      <text x={xF + fw + 12} y={naY + 4} fontSize={10} fill="var(--c-mute)">
        N.A. c = {f(c, 2)}″
      </text>
      {Array.from({ length: rows }, (_, k) => {
        const cnt = rows === 2 ? (k === 0 ? per : nBars - per) : nBars
        return Array.from({ length: cnt }, (_, i) => <circle key={`${k}-${i}`} cx={xW + ((i + 1) * ww) / (cnt + 1)} cy={barY(k)} r={r} fill="var(--c-ink)" />)
      })}
      <line x1={xF} x2={xF + fw} y1={top - 12} y2={top - 12} stroke="var(--c-mute)" />
      <text x={cx} y={top - 16} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
        {support ? 'slab (in tension)' : `beff = ${f(beff, 1)}″`}
      </text>
      <text x={xF - 4} y={(flangeTop + flangeBot) / 2 + 4} fontSize={10} textAnchor="end" fill="var(--c-mute)">
        hf {f(hf)}″
      </text>
      <text x={cx} y={H - 8} fontSize={10.5} textAnchor="middle" fill="var(--c-mute)">
        bw = {f(bw)}″ · a = {f(a, 2)}″ {support ? '(block at the bottom of the web)' : a <= hf ? '≤ hf: block inside the flange' : '> hf: block enters the web'}
      </text>
      <text x={W - 6} y={H - 8} fontSize={9} textAnchor="end" fill="var(--c-faint)">
        not to scale
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- beff
export function BeffSolution({ inp, out }: { inp: BeffIn; out: BeffOut }) {
  return (
    <div className="text-sm space-y-1">
      <p>
        <b>Effective flange width</b> ({inp.kind === 'interior' ? 'interior T-beam' : inp.kind === 'edge' ? 'edge L-beam' : 'isolated T'}; span L = {f(inp.L)} ft = {f(inp.L * 12)} in):
      </p>
      <Tex block>{`b_{eff} = \\min\\left(${out.cands.map((c) => `\\underbrace{${f(c.value, 2)}}_{${c.label.replace('½', '\\frac12').replace(/ /g, '\\ ')}}`).join(',\\ ')}\\right) = ${f(out.b, 2)}\\text{ in}`}</Tex>
      {out.isolatedOk && <p>Isolated beam: hf ≥ bw/2 {out.isolatedOk.hf ? '✓' : '✗'}, b ≤ 4bw {out.isolatedOk.b ? '✓' : '✗'}.</p>}
    </div>
  )
}

// ---------------------------------------------------------------- review
export function TReviewSolution({ inp, r }: { inp: TIn; r: TReview }) {
  const { beff, bw, hf, d, As, fc, fy } = inp
  const dt = inp.dt ?? d
  return (
    <div className="text-sm space-y-1">
      <p>
        <b>1. Assume rectangular</b> (block inside the flange, b = beff):
      </p>
      <Tex block>{`a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = \\frac{${f(As, 2)}(${f(fy)})}{0.85(${f(fc)})(${f(beff, 2)})} = ${f(r.aRect, 3)}\\text{ in}\\ ${r.rect ? '\\le' : '>'}\\ h_f = ${f(hf)}\\text{ in}`}</Tex>
      {r.rect ? (
        <>
          <p>→ behaves as a <b>rectangular beam</b> of width {f(beff, 1)} in.</p>
          <Tex block>{`M_n = A_sf_y\\left(d - \\tfrac a2\\right) = ${f(As, 2)}(${f(fy)})(${f(d)} - ${f(r.a / 2, 3)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`}</Tex>
        </>
      ) : (
        <>
          <p>
            → <b>true T-section</b>. Split the steel: overhanging flange + web.
          </p>
          <Tex block>{`A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y} = \\frac{0.85(${f(fc)})(${f(beff, 2)} - ${f(bw)})(${f(hf)})}{${f(fy)}} = ${f(r.Asf, 3)}\\text{ in}^2`}</Tex>
          <Tex block>{`M_{n1} = A_{sf}f_y\\left(d - \\tfrac{h_f}{2}\\right) = ${f(r.Asf, 3)}(${f(fy)})(${f(d)} - ${f(hf / 2)}) = ${f(r.Mn1, 0)}\\text{ in-k}`}</Tex>
          <Tex block>{`a = \\frac{(A_s - A_{sf})f_y}{0.85f'_cb_w} = \\frac{(${f(As, 2)} - ${f(r.Asf, 3)})(${f(fy)})}{0.85(${f(fc)})(${f(bw)})} = ${f(r.a, 3)}\\text{ in}`}</Tex>
          <Tex block>{`M_{n2} = (A_s - A_{sf})f_y\\left(d - \\tfrac a2\\right) = ${f(r.Asw, 3)}(${f(fy)})(${f(d)} - ${f(r.a / 2, 3)}) = ${f(r.Mn2, 0)}\\text{ in-k}`}</Tex>
          <Tex block>{`M_n = M_{n1} + M_{n2} = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`}</Tex>
        </>
      )}
      <p>
        <b>2. Strain.</b> c = a/β1 = {f(r.a, 3)}/{f(r.b1, 3)} = {f(r.c, 3)} in
      </p>
      <Tex block>{`\\varepsilon_t = ${epsU}\\frac{d_t - c}{c} = 0.003\\frac{${f(dt)} - ${f(r.c, 3)}}{${f(r.c, 3)}} = ${f(r.epsT, 5)}\\ \\Rightarrow\\ \\phi = ${f(r.phi, 3)}\\ (\\text{${zoneLabel(r.zone)}})`}</Tex>
      <p>
        As,min = max(3√f′c, 200) bw d / fy = {f(r.AsMin, 2)} in² {r.AsMinOk ? '≤' : '>'} As = {f(As, 2)} {r.AsMinOk ? '✓' : '✗'}
      </p>
      <p className="text-base">
        <b>
          φMn = {f(r.phi, 3)} × {f(r.Mn / 12, 1)} = {f(r.phiMn, 1)} k-ft
        </b>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- design
export function TDesignSolution({ inp, r }: { inp: TDesignIn; r: TDesign }) {
  const { Mu, beff, bw, hf, d, fc, fy } = inp
  const dt = inp.dt ?? d
  return (
    <div className="text-sm space-y-1">
      <p>
        <b>1. Trial a = hf</b> (class/Nilson approach):
      </p>
      <Tex block>{`A_s = \\frac{M_u}{\\phi f_y(d - h_f/2)} = \\frac{${f(Mu)}\\times12}{0.9(${f(fy)})(${f(d)} - ${f(hf / 2)})} = ${f(r.trial.As, 3)},\\quad a = \\frac{A_sf_y}{0.85f'_cb_{eff}} = ${f(r.trial.a, 3)}\\text{ in}`}</Tex>
      <p>
        Exact test: whole flange stressed gives φMn,f = 0.9·0.85f′c·beff·hf(d − hf/2) = {f(r.phiMnFlange, 1)} k-ft {r.rect ? '≥' : '<'} Mu → <b>{r.rect ? 'a ≤ hf: rectangular design with b = beff' : 'a > hf: true T design'}</b>.
      </p>
      {r.rect ? (
        <>
          <Tex block>{`M_u = \\phi A_sf_y\\left(d - \\frac{A_sf_y}{1.7f'_cb_{eff}}\\right)\\ \\Rightarrow\\ A_s = ${f(r.As, 3)}\\text{ in}^2\\ \\ (a = ${f(r.a, 3)}\\text{ in, iterate until a settles})`}</Tex>
        </>
      ) : (
        <>
          <Tex block>{`A_{sf} = \\frac{0.85f'_c(b_{eff} - b_w)h_f}{f_y} = \\frac{0.85(${f(fc)})(${f(beff, 2)} - ${f(bw)})(${f(hf)})}{${f(fy)}} = ${f(r.Asf, 3)}\\text{ in}^2`}</Tex>
          <Tex block>{`\\phi M_{n1} = \\phi A_{sf}f_y(d - h_f/2) = ${f(r.phiMn1, 1)}\\text{ k-ft},\\quad \\phi M_{n2} = M_u - \\phi M_{n1} = ${f(r.phiMn2, 1)}\\text{ k-ft}`}</Tex>
          <Tex block>{`A_s - A_{sf} = \\frac{\\phi M_{n2}}{\\phi f_y(d - a/2)},\\ a = \\frac{(A_s - A_{sf})f_y}{0.85f'_cb_w}\\ \\Rightarrow\\ A_s - A_{sf} = ${f(r.Asw, 3)},\\ a = ${f(r.a, 3)}\\text{ in}`}</Tex>
          <Tex block>{`A_s = ${f(r.Asf, 3)} + ${f(r.Asw, 3)} = ${f(r.As, 3)}\\text{ in}^2`}</Tex>
        </>
      )}
      <p>
        <b>2. Check.</b> c = {f(r.c, 3)} in, εt = 0.003(dt − c)/c = 0.003({f(dt)} − {f(r.c, 3)})/{f(r.c, 3)} = {f(r.epsT, 5)} → φ = {f(r.phi, 3)}
        {r.phi < 0.9 ? ' (φ re-evaluated and As recomputed)' : ' ✓ (φ = 0.9 assumption holds)'}. As,min = {f(r.AsMin, 2)} in² {r.As >= r.AsMin ? '✓' : '→ provide As,min'}.
      </p>
      {r.tooHeavy && <p className="text-bad">εt {'<'} 0.004: the web is too small — add compression steel or deepen the section.</p>}
      <p className="text-base">
        <b>As required = {f(r.As, 2)} in²</b>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- support (rectangular bw)
export function RectReviewSolution({ b, d, dt, As, fc, fy, r }: { b: number; d: number; dt: number; As: number; fc: number; fy: number; r: RectReview }) {
  return (
    <div className="text-sm space-y-1">
      <p>Negative moment: the slab is in tension (ignored), compression is at the bottom of the web → rectangle bw × d.</p>
      <Tex block>{`a = \\frac{A_sf_y}{0.85f'_cb_w} = \\frac{${f(As, 2)}(${f(fy)})}{0.85(${f(fc)})(${f(b)})} = ${f(r.a, 3)}\\text{ in},\\quad c = \\frac{a}{\\beta_1} = ${f(r.c, 3)}\\text{ in}`}</Tex>
      {!r.tensionYields && <p className="text-bad">εs at d is below εy: over-reinforced, solved by strain compatibility (fs = {f(r.fs, 1)} ksi).</p>}
      <Tex block>{`M_n = A_sf_s\\left(d - \\tfrac a2\\right) = ${f(As, 2)}(${f(r.fs, 2)})(${f(d)} - ${f(r.a / 2, 3)}) = ${f(r.Mn, 0)}\\text{ in-k} = ${f(r.Mn / 12, 1)}\\text{ k-ft}`}</Tex>
      <Tex block>{`\\varepsilon_t = 0.003\\frac{${f(dt)} - ${f(r.c, 3)}}{${f(r.c, 3)}} = ${f(r.epsT, 5)}\\ \\Rightarrow\\ \\phi = ${f(r.phi, 3)}\\ (\\text{${zoneLabel(r.zone)}})`}</Tex>
      <p>
        As,min = {f(r.AsMin, 2)} in² {As >= r.AsMin ? '✓' : '✗'}; ρ = {f(r.rho, 5)} vs ρmax = {f(r.rhoMax, 5)}.
      </p>
      <p className="text-base">
        <b>φMn = {f(r.phiMn, 1)} k-ft</b>
      </p>
    </div>
  )
}

export function RectDesignSolution({ Mu, b, d, dt, fy, r }: { Mu: number; b: number; d: number; dt: number; fy: number; r: RectDesign }) {
  return (
    <div className="text-sm space-y-1">
      <Tex block>{`A_s = \\frac{M_u}{\\phi f_y(d - a/2)},\\ a = \\frac{A_sf_y}{0.85f'_cb}\\ \\text{(iterate)}\\ \\Rightarrow\\ A_s = ${f(r.As, 3)}\\text{ in}^2,\\ a = ${f(r.a, 3)}\\text{ in}\\quad (M_u = ${f(Mu)}\\text{ k-ft},\\ b = ${f(b)},\\ d = ${f(d)},\\ f_y = ${f(fy)})`}</Tex>
      <p>
        c = {f(r.c, 3)} in, εt = 0.003({f(dt)} − {f(r.c, 3)})/{f(r.c, 3)} = {f(r.epsT, 5)}, φ = {f(r.phi, 3)}; As,min = {f(r.AsMin, 2)} in².
        {r.tooHeavy && <span className="text-bad"> εt {'<'} 0.004 → use the bottom bars as compression steel (doubly) or a deeper web.</span>}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- floor loads
export function FloorSolution({ p, o, L, coefLabel, coef, Mu }: { p: FloorIn; o: FloorOut; L: number; coefLabel: string; coef: number; Mu: number }) {
  return (
    <div className="text-sm space-y-1">
      <p>
        <b>Loads on one interior beam</b> (tributary width = spacing = {f(p.spacing)} ft, concrete 150 pcf):
      </p>
      <Tex block>{`w_{slab} = \\frac{${f(p.hf)}}{12}(0.15)(${f(p.spacing)}) = ${f(o.slab, 3)},\\quad w_{web} = \\frac{${f(p.bw)}(${f(p.h)} - ${f(p.hf)})}{144}(0.15) = ${f(o.web, 3)},\\quad w_{SDL} = ${f(p.sdl / 1000, 3)}(${f(p.spacing)}) = ${f(o.sdl, 3)}\\text{ k/ft}`}</Tex>
      <Tex block>{`w_D = ${f(o.wD, 3)},\\ w_L = ${f(p.ll / 1000, 3)}(${f(p.spacing)}) = ${f(o.wL, 3)}\\text{ k/ft},\\quad w_u = 1.2w_D + 1.6w_L = ${f(o.wu, 3)}\\text{ k/ft}`}</Tex>
      <Tex block>{`M_u = ${coefLabel}\\,w_u\\ell^2 = ${f(coef, 4)}(${f(o.wu, 3)})(${f(L)})^2 = ${f(Mu, 1)}\\text{ k-ft}`}</Tex>
    </div>
  )
}

// ---------------------------------------------------------------- WSD
export function WsdSolution({ M, beff, hf, d, n, fcAllow, fsAllow, r }: { M: number; beff: number; hf: number; d: number; n: number; fcAllow: number; fsAllow: number; r: WsdTDesign }) {
  const s: WsdTReview = r.sec
  return (
    <div className="text-sm space-y-1">
      <p>
        <b>WSD design</b> (service M = {f(M, 1)} k-ft; fc = {f(fcAllow, 3)} ksi, fs = {f(fsAllow)} ksi, n = {f(n)}; web compression neglected).
      </p>
      <Tex block>{`\\text{trial } jd = d - \\tfrac{t}{2} = ${f(r.iters[0].jd, 2)}\\text{ in}\\ \\Rightarrow\\ A_s = \\frac{M}{f_sjd} = \\frac{${f(M, 1)}\\times12}{${f(fsAllow)}(${f(r.iters[0].jd, 2)})} = ${f(r.iters[0].As, 3)}\\text{ in}^2`}</Tex>
      {s.rect ? (
        <Tex block>{`kd = ${f(s.kd, 3)} \\le t = ${f(hf)}\\ \\Rightarrow\\ \\text{rectangular: } k = \\sqrt{(\\rho n)^2 + 2\\rho n} - \\rho n = ${f(s.k, 4)},\\ j = 1 - k/3 = ${f(s.j, 4)}`}</Tex>
      ) : (
        <>
          <Tex block>{`\\rho = \\frac{A_s}{bd} = ${f(s.rho, 5)},\\quad k = \\frac{n\\rho + \\frac12(t/d)^2}{n\\rho + t/d} = ${f(s.k, 4)},\\quad kd = ${f(s.kd, 3)}\\text{ in} > t`}</Tex>
          <Tex block>{`z = \\frac{3kd - 2t}{2kd - t}\\cdot\\frac t3 = ${f(s.z, 3)}\\text{ in},\\quad jd = d - z = ${f(s.jd, 3)}\\text{ in}`}</Tex>
        </>
      )}
      <p>
        Repeat with the new jd until As settles: {r.iters.map((it) => f(it.As, 3)).join(' → ')} in².
      </p>
      <Tex block>{`A_s = ${f(r.As, 3)}\\text{ in}^2;\\quad f_c = \\frac{f_s}{n}\\frac{k}{1 - k} = \\frac{${f(fsAllow)}}{${f(n)}}\\frac{${f(s.k, 4)}}{1 - ${f(s.k, 4)}} = ${f(r.fcAct, 3)}\\text{ ksi}\\ ${r.concreteOk ? '\\le' : '>'}\\ ${f(fcAllow, 3)}`}</Tex>
      <p>
        Allowable moment by concrete: M = fc(1 − t/2kd)·b·t·jd = {f(s.Mc, 1)} k-ft {s.Mc >= M ? '≥ M ✓ (steel governs)' : '< M ✗ (concrete overstressed: deepen or add compression steel)'}. b = {f(beff, 1)} in, d = {f(d)} in.
      </p>
    </div>
  )
}
